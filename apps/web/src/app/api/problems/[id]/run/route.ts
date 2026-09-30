import { NextResponse } from 'next/server'
import { getExerciseForGrading } from '../../../../repositories/exercise.repository'
import { runQuerySubmission, toVerdict, toScore } from '@/app/services/gradingService'

export const runtime = 'nodejs'

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> },
) {

    /* เดวต้องมีการเช็ค session ด้วยแต่ไว้ก่อนตอนนี้ลอง */
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


    const result = await runQuerySubmission(code, {
        name: exercise.exc_name,
        schema: exercise.exc_schema,
        seed: exercise.exc_seed,
        solution: exercise.exc_solution,
        orderMatters: exercise.order_matters,
    })

    console.log("res:", {
        verdict: toVerdict(result),
        score: toScore(result),
        result,
    })

    return NextResponse.json({
        verdict: toVerdict(result),
        score: toScore(result),
        result,
    })
}