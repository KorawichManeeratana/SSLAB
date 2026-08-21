/**
 * SSLAB Query Grading Harness (PoC)
 * ---------------------------------
 * ตรวจโจทย์แนว "เขียน query ดึงข้อมูล" โดยเทียบผลลัพธ์กับเฉลย
 * บน database ชุดเดียวกัน (seed เหมือนกันเป๊ะ)
 *
 * รัน:  node harness/run-query.js student/query.js tests/query-problem.json
 *
 * ข้อตกลงกับโค้ดนักศึกษา (student/query.js):
 *   ต้อง export async function ชื่อ solve(db) ที่คืน array ของผลลัพธ์
 *   โดย db คือ instance ของ node:sqlite (DatabaseSync)
 *
 * โจทย์ (tests/query-problem.json) ระบุ:
 *   - schema: SQL สร้างตาราง
 *   - seed:   SQL ใส่ข้อมูลตั้งต้น
 *   - solution: query เฉลย (string) ที่ harness รันเพื่อสร้างผลอ้างอิง
 */

const path = require("path");
const { DatabaseSync } = require("node:sqlite");

function report(result) {
  console.log(JSON.stringify(result, null, 4));
  process.exit(0);
}

function buildDb(problem) {
  const db = new DatabaseSync(":memory:");
  db.exec(problem.schema);
  db.exec(problem.seed);
  return db;
}

// เทียบผลลัพธ์ของ นศ. กับเฉลย
function compareResults(expected, actual, orderMatters) {
  if (!Array.isArray(actual))
    return { pass: false, reason: "Actual must be an array" };

  if (expected.length !== actual.length)
    return {
      pass: false,
      reason: `Expected ${expected.length} rows but got ${actual.length}`,
    };

  //normalize มันให้มันเทียบง่ายขึ้น (sort keys ของ object แต่ละ row) แล้วแปลงเป็น string
  const norm = (row) =>
    JSON.stringify(
      Object.keys(row)
        .sort()
        .reduce((o, k) => ((o[k] = row[k]), o), {}),
    );
  let exp = expected.map(norm);
  let act = actual.map(norm);

  console.log("Expected:", exp);
  console.log("Actual:", act);

  // เทียบแบบไม่สนใจลำดับ
  if (!orderMatters) {
    expectedRows = exp.slice().sort();
    act = act.slice().sort();
  }

  // ลูปเทียบ
  for (let i = 0; i < exp.length; i++) {
    if (exp[i] !== act[i]) {
      return {
        pass: false,
        reason: `Row ${i + 1} Mismatch (Ans: ${exp[i]} / Got: ${act[i]})`,
      };
    }
  }
  return { pass: true };
}

async function main() {
  // ช่วงกำหนดตัวแปร path ของไฟล์ student และ problem
  const [, , studentArg, problemArg] = process.argv;
  const studentPath = path.resolve(studentArg || "student/query.js");
  const problemPath = path.resolve(problemArg || "tests/query-problem.json");

  let problem;
  try {
    problem = require(problemPath);
  } catch (err) {
    return report({
      ok: false,
      systemError: `Cannot Load Problem: ${err.message}`,
    });
  }

  // โหลดเฉลย
  let solution;
  try {
    let tempsolution = buildDb(problem);
    solution = tempsolution.prepare(problem.solution).all();

    console.log("Solution in main:", JSON.stringify(solution, null, 2));
    tempsolution.close();
  } catch (err) {
    return report({
      ok: false,
      systemError: `Cannot Run Solution: ${err.message}`,
    });
  }

  // โหลดโค้ดนักศึกษา
  let student;
  try {
    const studentCode = require(studentPath);
    student = studentCode.solve || studentCode;
    if (typeof student !== "function") {
      throw new Error("need to export function solve(db)");
    }
  } catch (err) {
    return report({
      ok: false,
      passed: 0,
      failed: 1,
      systemError: `Cannot Load Student Code: ${err.message}`,
    });
  }

  // รัน query ของนศ. อีกชุด ป้องกันการปนกันกับเฉลย
  let actualans;
  try {
    const stuDb = buildDb(problem);
    actualans = await student(stuDb);
    stuDb.close();
  } catch (err) {
    return report({
      ok: true,
      passed: 0,
      failed: 1,
      cases: [{ pass: false, error: `โค้ดนักศึกษา error: ${err.message}` }],
    });
  }

  // เทียบผลลัพธ์
  const cmp = compareResults(
    solution,
    actualans,
    problem.orderMatters === true,
  );
  report({
    ok: true,
    passed: cmp.pass ? 1 : 0,
    failed: cmp.pass ? 0 : 1,
    cases: [
      {
        name: problem.name || "query test",
        pass: cmp.pass,
        reason: cmp.reason,
        expectedRows: solution.length,
        actualRows: Array.isArray(actualans) ? actualans.length : "N/A",
      },
    ],
  });
}

main().catch((err) => {
  console.log(
    JSON.stringify({
      ok: false,
      systemError: `harness crash: ${err.message}`,
    }),
  );
  process.exit(1);
});
