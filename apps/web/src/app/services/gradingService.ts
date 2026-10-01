import 'server-only'
import { execFile } from 'node:child_process'
import { mkdtemp, writeFile, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import type { RunOutput } from '@/type/grading'

const TIMEOUT_SEC = 10

export type QueryProblem = {
  name: string
  schema: string
  seed: string
  solution: string
  orderMatters: boolean
}


export async function runQuerySubmission(code: string, problem: QueryProblem) {
  // สร้างโฟลเดอร์ชั่วคราวแยกต่อการส่งแต่ละครั้ง
  const dir = await mkdtemp(path.join(os.tmpdir(), 'sslab-'))

  try {
    const studentFile = path.join(dir, 'query.js')
    const problemFile = path.join(dir, 'problem.json')
    await writeFile(studentFile, code, 'utf8')
    await writeFile(problemFile, JSON.stringify(problem), 'utf8')

    // argument เหมือนใน .bat ทุกตัว
    const args = [
      'run', '--rm',
      '--memory=256m', '--memory-swap=256m',
      '--cpus=0.5',
      '--pids-limit=64',
      '--network=none',
      '--read-only', '--tmpfs', '/tmp',
      '--security-opt', 'no-new-privileges',
      '-v', `${studentFile}:/app/student/query.js:ro`,
      '-v', `${problemFile}:/app/tests/query-problem.json:ro`,
      'sslab-runner',
      'timeout', '-s', 'KILL', String(TIMEOUT_SEC),
      'node', '--disable-warning=ExperimentalWarning',
      'harness/run-query.js', 'student/query.js', 'tests/query-problem.json',
    ]

    const { stdout, stderr, exitCode } = await new Promise<{ stdout: string; stderr: string; exitCode: number }>(
      (resolve) => {
        execFile('docker', args, { timeout: (TIMEOUT_SEC + 10) * 1000, maxBuffer: 1024 * 1024 },
          (err, stdout, stderr) => {
            const code = err && typeof (err as any).code === 'number' ? (err as any).code : err ? -1 : 0
            resolve({ stdout, stderr, exitCode: code })
          })
      },
    )

    if (exitCode === 137) {
      return { ok: false, status: 'TLE', systemError: `เกินเวลา ${TIMEOUT_SEC} วินาที` }
    }

    try {
      return JSON.parse(stdout)
    } catch {
      return {
        ok: false,
        status: 'SYSTEM_ERROR',
        systemError: 'Harness does not return JSON back... (In gradingService)',
        detail: stderr.slice(0, 500),   // เช่น "error during connect ... docker daemon"
      }
    }
  } finally {
    // ลบไฟล์ชั่วคราวทุกครั้ง ไม่ว่าจะผ่านหรือ error
    await rm(dir, { recursive: true, force: true })
  }
}


export function toVerdict(result: any) {
  if (result?.status === 'TLE') return 'TLE' as const
  if (!result?.ok) return 'SYSTEM_ERROR' as const
  if (result.cases?.some((c: any) => c.error)) return 'RUNTIME_ERROR' as const
  if (result.failed === 0 && result.passed > 0) return 'ACCEPTED' as const
  return 'WRONG_ANSWER' as const
}

export function toScore(result: any) {
  const total = (result?.passed ?? 0) + (result?.failed ?? 0)
  return total === 0 ? 0 : Math.round((result.passed / total) * 100)
}


export function toRunOutput(result: any, durationMs: number): RunOutput {
  const request = { method: 'CALL', target: 'solve(db)' }

  if (result?.status === 'TLE') {
    return { request, status: 504, statusText: 'Gateway Timeout', durationMs,
             error: 'Execution exceeded the time limit (10s)' }
  }
  if (!result?.ok) {
    return { request, status: 503, statusText: 'Service Unavailable', durationMs,
             error: 'ระบบตรวจงานขัดข้อง กรุณาลองใหม่' }
  }

  const c = result.cases?.[0]
  if (c?.error) {
    return { request, status: 500, statusText: 'Internal Server Error', durationMs, error: c.error }
  }

  return {
    request,
    status: 200,
    statusText: 'OK',
    durationMs,
    rowCount: typeof c?.actualRows === 'number' ? c.actualRows : undefined,
    body: c?.actual,
  }
}