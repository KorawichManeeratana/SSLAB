import 'server-only'
import { prisma } from '@sslab/db'
import type { Verdict } from '@/type/grading'

export async function createSubmission(input: {
  userId: number
  exerciseId: number
  code: string
  verdict: Verdict
  score: number
  result: object
  execTimeMs: number
}) {
  
  // นับครั้งที่เคยส่งแล้ว +1 (ถ้ากดส่งพร้อมกัน 2 ครั้งอาจได้เลขซ้ำ แต่รับได้สำหรับตอนนี้)
  const previous = await prisma.user_exercise.count({
    where: { user_id: input.userId, exercise_id: input.exerciseId },
  })

  

  return prisma.user_exercise.create({
    data: {
      user_id: input.userId,
      exercise_id: input.exerciseId,
      code: input.code,
      verdict: input.verdict,
      status: input.verdict === 'ACCEPTED' ? 'complete' : 'ongoing',
      score: input.score,
      result: input.result,
      exec_time: input.execTimeMs,
      graded_at: new Date(),
      attempt_number: previous + 1,
    },
    select: { id: true, attempt_number: true },
  })
}

export async function getLatestCode(userId: number, exerciseId: number) {
  const last = await prisma.user_exercise.findFirst({
    where: { user_id: userId, exercise_id: exerciseId },
    orderBy: { created_at: 'desc' },
    select: { code: true },
  })
  return last?.code ?? null
}