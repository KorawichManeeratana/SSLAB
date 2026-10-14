/**
 * Shared comparison helpers for SSLAB harnesses.
 * Used by run-http.js (and can replace the copy inside run-query.js later).
 */

// Serialise a value with object keys sorted, so key order never affects equality.
function stable(value) {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`
  if (value && typeof value === 'object') {
    const keys = Object.keys(value).sort()
    return `{${keys.map((k) => `${JSON.stringify(k)}:${stable(value[k])}`).join(',')}}`
  }
  return JSON.stringify(value)
}

/**
 * Compare expected vs actual.
 * - Arrays of rows: compared row by row; if orderMatters is false, rows are sorted first.
 * - Anything else: compared as a whole (key order ignored).
 * Returns { pass: true } or { pass: false, reason }.
 */
function compareValues(expected, actual, orderMatters = true) {
  if (Array.isArray(expected)) {
    if (!Array.isArray(actual)) return { pass: false, reason: 'Expected an array' }
    if (expected.length !== actual.length) {
      return { pass: false, reason: `Expected ${expected.length} rows but got ${actual.length}` }
    }
    let exp = expected.map(stable)
    let act = actual.map(stable)
    if (!orderMatters) {
      exp = exp.slice().sort()
      act = act.slice().sort()
    }
    for (let i = 0; i < exp.length; i++) {
      if (exp[i] !== act[i]) return { pass: false, reason: `Row ${i + 1} does not match` }
    }
    return { pass: true }
  }
  return stable(expected) === stable(actual)
    ? { pass: true }
    : { pass: false, reason: 'Response body does not match' }
}

module.exports = { stable, compareValues }
