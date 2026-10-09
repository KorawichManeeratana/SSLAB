import 'server-only'
import { prisma } from '@sslab/db'

// TODO: เปลี่ยนเป็นอ่านจาก session ตอนทำ login
// ระหว่างนี้ใช้นักศึกษาใน seed (รหัส 66000001) — id เปลี่ยนทุกครั้งที่ seed จึงห้ามเขียนตายตัว
export async function getCurrentUserId(): Promise<number> {
  const user = await prisma.users.findFirst({
    where: { student_code: '66000001' },
    select: { id: true },
  })
  if (!user) throw new Error('ไม่พบ user สำหรับทดสอบ — รัน npm run seed ก่อน')
  return user.id
}