import { PrismaClient } from './generated/prisma/client'

// ตอน dev Next.js จะโหลดโค้ดใหม่ทุกครั้งที่เซฟ
// ถ้าไม่เก็บ client ไว้ใน globalThis จะเกิด connection ใหม่ทุกครั้งจน DB เต็ม
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export * from './generated/prisma/client'