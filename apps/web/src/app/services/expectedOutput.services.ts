import 'server-only'
import { DatabaseSync } from 'node:sqlite'

// รันเฉลยของอาจารย์บน SQLite ในหน่วยความจำ แล้วคืนผลลัพธ์
// ใช้กับ exc_solution เท่านั้น — ห้ามส่งโค้ดนักศึกษาเข้ามา (โค้ดนักศึกษาต้องรันใน sandbox)
export function computeExpectedOutput(schema: string, seed: string, solution: string) {
  const db = new DatabaseSync(':memory:')
  try {
    db.exec(schema)
    db.exec(seed)
    return db.prepare(solution).all()
  } finally {
    db.close()
  }
}