import 'server-only'
import { execFile } from 'node:child_process'
import { mkdtemp, writeFile, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

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

    const { stdout, exitCode } = await new Promise<{ stdout: string; exitCode: number }>(
      (resolve) => {
        execFile(
          'docker',
          args,
          { timeout: (TIMEOUT_SEC + 10) * 1000, maxBuffer: 1024 * 1024 },
          (err, stdout) => {
            const code = err && typeof (err as any).code === 'number' ? (err as any).code : err ? -1 : 0
            resolve({ stdout, exitCode: code })
          },
        )
      },
    )

    if (exitCode === 137) {
      return { ok: false, status: 'TLE', systemError: `เกินเวลา ${TIMEOUT_SEC} วินาที` }
    }

    try {
      return JSON.parse(stdout)
    } catch {
      return { ok: false, status: 'SYSTEM_ERROR', systemError: 'harness ไม่ได้ส่ง JSON กลับมา' }
    }
  } finally {
    // ลบไฟล์ชั่วคราวทุกครั้ง ไม่ว่าจะผ่านหรือ error
    await rm(dir, { recursive: true, force: true })
  }
}