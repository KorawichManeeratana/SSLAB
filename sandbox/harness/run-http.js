/**
 * SSLAB HTTP Grading Harness
 * --------------------------
 * Grades exercises where the learner writes Express routes.
 *
 * Run: node harness/run-http.js student/app.js tests/http-problem.json
 *
 * Contract with the learner's code (student/app.js):
 *   module.exports = function register(app, db) { app.get('/api/...', (req, res) => ...) }
 *   - app : an Express 5 app (express.json() already applied)
 *   - db  : a node:sqlite DatabaseSync built from the problem's schema + seed
 *
 * Problem file (tests/http-problem.json):
 *   { name, schema, seed,
 *     cases: [{ name, method, path, body?, headers?,
 *               expect: { status, body?, query?, orderMatters? } }] }
 *   - expect.body  : literal JSON the response must equal
 *   - expect.query : SQL run on a fresh copy of the DB; its rows become the expected body
 *
 * Every case gets a fresh database and a fresh server, so one request
 * (e.g. a POST that inserts a row) cannot affect the next case.
 * Output: one JSON object on stdout, same shape as run-query.js.
 */

const path = require('path')
const util = require('util')
const { DatabaseSync } = require('node:sqlite')
const express = require('express')
const { compareValues } = require('./lib/compare')

const CASE_TIMEOUT_MS = 2000   // max wait for one response
const TOTAL_BUDGET_MS = 8000   // stay under the container's 10 s hard limit
const MAX_BODY_ROWS = 50

// Learner code may call console.log; keep stdout clean for the JSON result.
const studentLogs = []
const capture = (...args) => {
  // util.format handles any value (objects without a prototype, circular refs, ...)
  if (studentLogs.length < 100) studentLogs.push(util.format(...args).slice(0, 500))
}
console.log = capture
console.info = capture
console.warn = capture
console.error = capture

function report(result) {
  const out = { ...result, logs: studentLogs }
  process.stdout.write(JSON.stringify(out), () => process.exit(0))
}

function buildDb(problem) {
  const db = new DatabaseSync(':memory:')
  db.exec(problem.schema)
  db.exec(problem.seed)
  return db
}

function preview(body) {
  return Array.isArray(body) ? body.slice(0, MAX_BODY_ROWS) : body
}

async function startServer(register, db) {
  const app = express()
  app.use(express.json())
  register(app, db)
  return new Promise((resolve, reject) => {
    const server = app.listen(0, '127.0.0.1', () => resolve(server))
    server.on('error', reject)
  })
}

async function runCase(problem, register, c, timeoutMs) {
  const request = { method: (c.method || 'GET').toUpperCase(), path: c.path }
  const db = buildDb(problem)
  let server
  try {
    try {
      server = await startServer(register, db)
    } catch (err) {
      return { name: c.name, pass: false, request, error: `Route setup failed: ${err.message}` }
    }

    const { port } = server.address()
    let res
    try {
      res = await fetch(`http://127.0.0.1:${port}${c.path}`, {
        method: request.method,
        headers: { 'content-type': 'application/json', ...(c.headers || {}) },
        body: c.body === undefined ? undefined : JSON.stringify(c.body),
        signal: AbortSignal.timeout(timeoutMs),
      })
    } catch (err) {
      const reason = err.name === 'TimeoutError'
        ? `No response within ${timeoutMs} ms`
        : `Request failed: ${err.message}`
      return { name: c.name, pass: false, request, reason }
    }

    const text = await res.text()
    let body = text
    try { body = JSON.parse(text) } catch { /* not JSON, keep text */ }

    const result = { name: c.name, request, status: res.status, expectedStatus: c.expect.status, body: preview(body) }

    if (res.status !== c.expect.status) {
      return { ...result, pass: false, reason: `Expected status ${c.expect.status} but got ${res.status}` }
    }

    let expectedBody
    if (c.expect.query) {
      const refDb = buildDb(problem)
      try { expectedBody = refDb.prepare(c.expect.query).all().map((r) => ({ ...r })) } finally { refDb.close() }
    } else if ('body' in c.expect) {
      expectedBody = c.expect.body
    }

    if (expectedBody !== undefined) {
      const cmp = compareValues(expectedBody, body, c.expect.orderMatters !== false)
      if (!cmp.pass) return { ...result, pass: false, reason: cmp.reason }
    }
    return { ...result, pass: true }
  } finally {
    if (server) {
      server.closeAllConnections?.()
      await new Promise((r) => server.close(r))
    }
    db.close()
  }
}

async function main() {
  const [, , studentArg, problemArg] = process.argv
  const studentPath = path.resolve(studentArg || 'student/app.js')
  const problemPath = path.resolve(problemArg || 'tests/http-problem.json')

  let problem
  try {
    problem = require(problemPath)
    if (!Array.isArray(problem.cases) || problem.cases.length === 0) throw new Error('no test cases')
  } catch (err) {
    return report({ ok: false, systemError: `Cannot Load Problem: ${err.message}` })
  }

  let register
  try {
    const mod = require(studentPath)
    register = typeof mod === 'function' ? mod : mod.register
    if (typeof register !== 'function') throw new Error('module.exports must be a function register(app, db)')
  } catch (err) {
    // Learner's fault (syntax error, wrong export) -> graded as a failed run, not a system error
    return report({
      ok: true,
      passed: 0,
      failed: problem.cases.length,
      cases: problem.cases.map((c) => ({
        name: c.name,
        pass: false,
        request: { method: (c.method || 'GET').toUpperCase(), path: c.path },
        error: `Cannot load code (check syntax and exports): ${err.message}`,
      })),
    })
  }

  const cases = []
  const startedAt = Date.now()
  for (const c of problem.cases) {
    const remaining = TOTAL_BUDGET_MS - (Date.now() - startedAt)
    if (remaining <= 0) {
      cases.push({
        name: c.name,
        pass: false,
        request: { method: (c.method || 'GET').toUpperCase(), path: c.path },
        reason: 'Skipped: total time limit reached',
      })
      continue
    }
    try {
      cases.push(await runCase(problem, register, c, Math.min(CASE_TIMEOUT_MS, remaining)))
    } catch (err) {
      cases.push({ name: c.name, pass: false, error: err.message })
    }
  }

  const passed = cases.filter((c) => c.pass).length
  report({ ok: true, passed, failed: cases.length - passed, cases })
}

main().catch((err) => {
  process.stdout.write(JSON.stringify({ ok: false, systemError: `harness crash: ${err.message}` }), () => process.exit(1))
})
