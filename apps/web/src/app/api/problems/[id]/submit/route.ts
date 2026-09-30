import { NextResponse } from 'next/server'
import { getExerciseForGrading } from '@/app/repositories/exercise.repository'
import { createSubmission } from '@/app/repositories/submission.repository'
import { runQuerySubmission, toVerdict, toScore } from '@/app/services/gradingService'

export const runtime = 'nodejs'

// TODO: เปลี่ยนเป็น userId จาก session ตอนทำ login — ห้าม merge เข้า main ทั้งแบบนี้
const DEV_USER_ID = 2

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const exerciseId = Number(id)
  if (!Number.isInteger(exerciseId)) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 })
  }

  const body = await req.json().catch(() => null)
  const code = body?.code
  if (typeof code !== 'string' || code.length === 0 || code.length > 50_000) {
    return NextResponse.json({ error: 'code ไม่ถูกต้อง' }, { status: 400 })
  }

  const exercise = await getExerciseForGrading(exerciseId)
  if (!exercise) {
    return NextResponse.json({ error: 'ไม่พบโจทย์' }, { status: 404 })
  }

  console.log("Ex:", exercise)

  const startedAt = Date.now()
  const result = await runQuerySubmission(code, {
    name: exercise.exc_name,
    schema: exercise.exc_schema,
    seed: exercise.exc_seed,
    solution: exercise.exc_solution,
    orderMatters: exercise.order_matters,
  })
  const execTimeMs = Date.now() - startedAt

  const verdict = toVerdict(result)
  const score = toScore(result)

  if (verdict === 'SYSTEM_ERROR') {
    return NextResponse.json(
      { error: 'Submission System ERROR. Please Retry...', result },
      { status: 503 },
    )
  }

  const saved = await createSubmission({
    userId: DEV_USER_ID,
    exerciseId,
    code,
    verdict,
    score,
    result,
    execTimeMs,
  })

  return NextResponse.json({
    submissionId: saved.id,
    attempt: saved.attempt_number,
    verdict,
    score,
    result,
  })
}