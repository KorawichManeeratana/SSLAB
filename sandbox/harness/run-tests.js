/**
 * SSLAB Sandbox Test Harness (PoC)
 * --------------------------------
 * หน้าที่: โหลด Express app ของนักศึกษา -> ยิง HTTP ตามชุด test case
 *          -> พิมพ์ผลรวมเป็น JSON บรรทัดเดียวออก stdout ให้ worker อ่าน
 *
 * วิธีรัน (นอก Docker):
 *   node harness/run-tests.js student/app.js tests/problem1.json
 *
 * ข้อตกลงกับโค้ดนักศึกษา:
 *   ไฟล์ app.js ต้อง `module.exports = app` (ห้ามเรียก app.listen เอง)
 *
 * Output (stdout บรรทัดสุดท้ายเสมอ):
 *   { ok, passed, failed, total, cases: [...], systemError? }
 */

const path = require("path");

const CASE_TIMEOUT_MS = 5000; // เวลาสูงสุดต่อ 1 เคส
const BODY_LIMIT = 2000; // ตัด body ที่ยาวเกินก่อนใส่รายงาน กัน output บวม

// ---------- helpers ----------

/** เทียบว่า expected เป็น "ส่วนหนึ่ง" ของ actual (partial deep match)
 *  เช่น expected {error:"not found"} จะผ่านถ้า actual = {error:"not found", code:404}
 *  ทำให้เฉลยยืดหยุ่น ไม่ต้องบังคับ response ตรงทุก field */
function partialMatch(expected, actual) {
  if (expected === null || typeof expected !== "object") {
    return Object.is(expected, actual);
  }
  if (Array.isArray(expected)) {
    if (!Array.isArray(actual) || actual.length !== expected.length)
      return false;
    return expected.every((item, i) => partialMatch(item, actual[i]));
  }
  if (actual === null || typeof actual !== "object") return false;
  return Object.keys(expected).every((k) =>
    partialMatch(expected[k], actual[k]),
  );
}

/** ตัดข้อความยาว ๆ ก่อนใส่รายงาน */
function truncate(value) {
  const s = typeof value === "string" ? value : JSON.stringify(value);
  return s && s.length > BODY_LIMIT
    ? s.slice(0, BODY_LIMIT) + "...[truncated]"
    : value;
}

/** พิมพ์ผลลัพธ์สุดท้ายเป็น JSON บรรทัดเดียว แล้วจบ process */
function report(result) {
  console.log(JSON.stringify(result, null, 4));
  process.exit(0); // exit 0 เสมอเมื่อ harness ทำงานสำเร็จ (ผลตกหรือผ่านดูจาก JSON)
}


async function main() {
  const [, , appArg, testArg] = process.argv;
  const appPath = path.resolve(appArg || "student/app.js");
  const testPath = path.resolve(testArg || "tests/problem1.json");

  // 1) โหลด test cases โจทย์
  let cases;
  try {
    cases = require(testPath);
  } catch (err) {
    return report({
      ok: false,
      systemError: `Failed to load test cases: ${err.message}`,
    });
  }

  // 2) โหลด app ของนักศึกษา — จุดนี้พังบ่อยมากกกกกกกกก
  //    ต้อง catch แล้วรายงานให้อ่านรู้เรื่อง
  let app;
  try {
    app = require(appPath);
  } catch (err) {
    return report({
      ok: false,
      passed: 0,
      failed: cases.length,
      total: cases.length,
      cases: [],
      systemError: `Load Student App Failed: ${err.message}`,
    });
  }
  if (typeof app !== "function") {
    return report({
      ok: false,
      systemError: "app.js need module.exports = app (Express instance)",
    });
  }

  // 3) start server บน port สุ่ม (0 = ให้ OS เลือก) ภายใน container เท่านั้น
  let server;
  try {
    server = await new Promise((resolve, reject) => {
      const s = app.listen(0, "127.0.0.1");
      s.once("listening", () => resolve(s));
      s.once("error", reject);
    });
  } catch (err) {
    return report({
      ok: false,
      systemError: `Failed To Open Server: ${err.message}`,
    });
  }
  const base = `http://127.0.0.1:${server.address().port}`;

  // 4) ไล่ยิงทีละเคส
  const results = [];
  for (const [i, c] of cases.entries()) {
    const entry = {
      index: i + 1,
      name: c.name || `${c.method} ${c.path}`,
      pass: false,
      checks: [],
    };
    try {
      const res = await fetch(base + c.path, {
        method: c.method || "GET",
        headers: { "content-type": "application/json", ...(c.headers || {}) },
        body: c.body !== undefined ? JSON.stringify(c.body) : undefined,
        signal: AbortSignal.timeout(CASE_TIMEOUT_MS),
      });

      // เช็ค status
      if (c.expectStatus !== undefined) {
        const pass = res.status === c.expectStatus;
        entry.checks.push({
          type: "status",
          expected: c.expectStatus,
          actual: res.status,
          pass,
        });
      }

      // เช็ค body ก็คือตัว partial match อะ
      if (c.expectBody !== undefined) {
        let actualBody;
        const text = await res.text();
        try {
          actualBody = JSON.parse(text);
        } catch {
          actualBody = text;
        }
        const pass = partialMatch(c.expectBody, actualBody);
        entry.checks.push({
          type: "body",
          expected: c.expectBody,
          actual: truncate(actualBody),
          pass,
        });
      }

      // เช็ค header (ถ้ากำหนด)
      if (c.expectHeaders) {
        for (const [h, v] of Object.entries(c.expectHeaders)) {
          const actual = res.headers.get(h) || "";
          const pass = actual.includes(v);
          entry.checks.push({ type: `header:${h}`, expected: v, actual, pass });
        }
      }

      entry.pass =
        entry.checks.length > 0 && entry.checks.every((ch) => ch.pass);
    } catch (err) {
      // timeout ต่อเคส หรือ connection พัง ตย. โค้ดนักศึกษา crash ระหว่างทาง
      entry.error =
        err.name === "TimeoutError"
          ? `TimeOut ${CASE_TIMEOUT_MS / 1000} Second`
          : `Request Failed: ${err.message}`;
    }
    results.push(entry);
  }

  // 5) ปิด server แล้วสรุปผล
  server.close();
  await new Promise((resolve) => server.close(resolve));
  const passed = results.filter((r) => r.pass).length;
  report({
    ok: true,
    passed,
    failed: results.length - passed,
    total: results.length,
    cases: results,
  });
}

main().catch((err) => {
  // เอาไว้กันตัวนี้่พังเอง เผื่อไว้
  console.log(
    JSON.stringify({ ok: false, systemError: `harness crash: ${err.message}` }),
  );
  process.exit(1); // exit != 0 เผื่อไว้ตอนขเปลี่ยนจาก .bat ไปเป็น worker จะได้รู้พังที่ harness
});
