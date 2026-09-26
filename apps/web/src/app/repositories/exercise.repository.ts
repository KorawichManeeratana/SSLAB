import 'server-only'
import { prisma } from '@sslab/db'

export function getExerciseById(id: number) {
  return prisma.exercises.findUnique({
    where: { id },
    // เลือกเฉพาะ field ที่หน้าเว็บต้องใช้
    // ห้ามส่ง exc_solution ไปหน้าเว็บ ไม่งั้นนักศึกษาเปิด DevTools ก็เห็นเฉลย
    select: {
      id: true,
      exc_name: true,
      exc_difficulty: true,
      exc_description: true,
      exc_schema: true,
      exc_anwser_field: true,
    },
  })
}

export function getExerciseForGrading(id: number) {
  return prisma.exercises.findUnique({
    where: { id },
    select: {
      exc_name: true,
      exc_schema: true,
      exc_seed: true,
      exc_solution: true,
      order_matters: true,
    },
  })
}

export type ExerciseView = NonNullable<Awaited<ReturnType<typeof getExerciseById>>>