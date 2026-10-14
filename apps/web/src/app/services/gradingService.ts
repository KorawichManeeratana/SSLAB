import 'server-only'
import { execFile } from 'node:child_process'
import { mkdtemp, writeFile, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { STATUS_CODES } from 'node:http'
import type { RunOutput, HttpRunOutput } from '@/type/grading'

const TIMEOUT_SEC = 10

// ไฟล์ที่จะเขียนลงโฟลเดอร์ชั่วคราว แล้ว mount เข้า container แบบอ่านอย่างเดียว
type SandboxFile = { name: string; content: string; mountTo: string }

async function runInSandbox(files: SandboxFile[], command: string[]) {
  // สร้างโฟลเดอร์ชั่วคราวแยกต่อการส่งแต่ละครั้ง
  const dir = await mkdtemp(path.join(os.tmpdir(), 'sslab-'))

  try {
    const mounts: string[] = []
    for (const f of files) {
      const hostPath = path.join(dir, f.name)
      await writeFile(hostPath, f.content, 'utf8')
      mounts.push('-v', `${hostPath}:${f.mountTo}:ro`)
    }

    const args = [
      'run', '--rm',
      '--memory=256m', '--memory-swap=256m',
      '--cpus=0.5',
      '--pids-limit=64',
      '--network=none',
      '--read-only', '--tmpfs', '/tmp',
      '--security-opt', 'no-new-privileges',
      ...mounts,
      'sslab-runner',
      'timeout', '-s', 'KILL', String(TIMEOUT_SEC),
      'node', '--disable-warning=ExperimentalWarning',
      ...command,
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
        detail: stderr.slice(0, 500),
      }
    }
  } finally {
    // ลบไฟล์ชั่วคราวทุกครั้ง ไม่ว่าจะผ่านหรือ error
    await rm(dir, { recursive: true, force: true })
  }
}

// ---------- QUERY ----------
export type QueryProblem = {
  name: string
  schema: string
  seed: string
  solution: string
  orderMatters: boolean
}

export function runQuerySubmission(code: string, problem: QueryProblem) {
  return runInSandbox(
    [
      { name: 'query.js', content: code, mountTo: '/app/student/query.js' },
      { name: 'problem.json', content: JSON.stringify(problem), mountTo: '/app/tests/query-problem.json' },
    ],
    ['harness/run-query.js', 'student/query.js', 'tests/query-problem.json'],
  )
}

// ---------- HTTP ----------
type TestcaseRow = {
  case_name: string
  method: string
  path: string
  body: unknown
  expected_status: number
  expected_body: unknown
}

// แปลงแถว Testcase จาก DB ให้เป็นรูปแบบที่ run-http.js อ่านได้
export function toHttpProblem(exercise: {
  exc_name: string
  exc_schema: string
  exc_seed: string
  testcases: TestcaseRow[]
}) {
  return {
    name: exercise.exc_name,
    schema: exercise.exc_schema,
    seed: exercise.exc_seed,
    cases: exercise.testcases.map((tc) => ({
      name: tc.case_name,
      method: tc.method,
      path: tc.path,
      // null ต้องไม่ส่งไป: GET ที่มี body จะ error และ expect.body = null จะไปเทียบกับ null
      ...(tc.body != null ? { body: tc.body } : {}),
      expect: {
        status: tc.expected_status,
        ...(tc.expected_body != null ? { body: tc.expected_body } : {}),
      },
    })),
  }
}

export function runHttpSubmission(code: string, problem: ReturnType<typeof toHttpProblem>) {
  return runInSandbox(
    [
      { name: 'app.js', content: code, mountTo: '/app/student/app.js' },
      { name: 'problem.json', content: JSON.stringify(problem), mountTo: '/app/tests/http-problem.json' },
    ],
    ['harness/run-http.js', 'student/app.js', 'tests/http-problem.json'],
  )
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

export function toHttpRunOutput(result: any, durationMs: number): HttpRunOutput {
  if (result?.status === 'TLE') {
    return { kind: 'http', durationMs, status: 504, statusText: 'Gateway Timeout',
             error: 'Execution exceeded the time limit (10s)', cases: [], logs: [] }
  }
  if (!result?.ok) {
    return { kind: 'http', durationMs, status: 503, statusText: 'Service Unavailable',
             error: 'ระบบตรวจงานขัดข้อง กรุณาลองใหม่', cases: [], logs: [] }
  }

  return {
    kind: 'http',
    durationMs,
    logs: result.logs ?? [],
    cases: (result.cases ?? []).map((c: any) => ({
      name: c.name,
      request: c.request ?? { method: '?', path: '' },
      status: c.status,
      statusText: typeof c.status === 'number' ? STATUS_CODES[c.status] ?? '' : undefined,
      body: c.body,
      // ไม่มี status แปลว่าไม่ได้คำตอบ: ใช้ error หรือ reason ("No response within 2000 ms")
      error: c.error ?? (c.status === undefined ? c.reason : undefined),
    })),
  }
}