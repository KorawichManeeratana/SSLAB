export type RunOutput = {
  request: { method: string; target: string }
  status: number
  statusText: string
  durationMs: number
  rowCount?: number
  body?: unknown
  error?: string
}

export type HttpRunCase = {
  name: string
  request: { method: string; path: string }
  status?: number        // ไม่มีถ้าเซิร์ฟเวอร์ไม่ตอบ เช่น ค้างจนหมดเวลา
  statusText?: string
  body?: unknown
  error?: string         // โค้ด error หรือไม่ตอบภายในเวลา
}

export type HttpRunOutput = {
  kind: 'http'
  durationMs: number
  status?: number        // ใส่เฉพาะตอนระบบมีปัญหา: 504 / 503
  statusText?: string
  error?: string
  cases: HttpRunCase[]
  logs: string[]         // console.log ของนักศึกษา
}

export type Verdict =
  | 'ACCEPTED'
  | 'WRONG_ANSWER'
  | 'TLE'
  | 'MLE'
  | 'RUNTIME_ERROR'
  | 'SYSTEM_ERROR'

export type GradingEngine = 'QUERY' | 'HTTP'