// packages/db/prisma/seed.ts
// ข้อมูลตัวอย่างสำหรับพัฒนา — รันซ้ำได้ (ลบของเก่าก่อนทุกครั้ง)
// รัน: npm run seed -w @sslab/db
import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 1) ล้างข้อมูลเก่า (ลบจากตารางลูกไปหาตารางแม่ ไม่งั้นติด foreign key)
  await prisma.user_exercise.deleteMany()
  await prisma.testcase.deleteMany()
  await prisma.exercises.deleteMany()
  await prisma.files.deleteMany()
  await prisma.lectures.deleteMany()
  await prisma.enrolls.deleteMany()
  await prisma.courses.deleteMany()
  await prisma.users.deleteMany()
  await prisma.faculty.deleteMany()

  // 2) คณะ
  const faculty = await prisma.faculty.create({
    data: { fac_name: 'คณะเทคโนโลยีสารสนเทศ' },
  })

  // 3) ผู้ใช้ — TODO: เปลี่ยน password เป็นค่าที่ hash แล้วตอนทำ auth
  const teacher = await prisma.users.create({
    data: {
      first_name: 'อาจารย์',
      last_name: 'ทดสอบ',
      student_code: 'T0001',
      password: 'TODO_HASH',
      role: 'teacher',
      fac_id: faculty.id,
    },
  })

  const student = await prisma.users.create({
    data: {
      first_name: 'นักศึกษา',
      last_name: 'ทดสอบ',
      student_code: '66000001',
      password: 'TODO_HASH',
      role: 'student',
      fac_id: faculty.id,
    },
  })

  // 4) รายวิชา + ลงทะเบียน
  const course = await prisma.courses.create({
    data: { course_name: 'การพัฒนาเว็บฝั่งเซิร์ฟเวอร์' },
  })

  await prisma.enrolls.createMany({
    data: [
      { user_id: teacher.id, course_id: course.id },
      { user_id: student.id, course_id: course.id },
    ],
  })

  // 5) บทเรียน
  const lecture = await prisma.lectures.create({
    data: {
      lecture_name: 'ORM และการดึงข้อมูล',
      lecture_week: '1',
      course_id: course.id,
    },
  })

  // 6) โจทย์ — ยกมาจาก sandbox/fixtures/tests/query-problem.json
  const exercise = await prisma.exercises.create({
    data: {
      exc_name: 'หาหนังสือราคาต่ำกว่า 500 ที่ยังมี stock',
      exc_difficulty: 'novice',
      exc_description:
        'จงเขียนฟังก์ชัน solve(db) คืนรายการหนังสือที่ราคาต่ำกว่า 500 และ stock มากกว่า 0 เรียงตามราคาจากน้อยไปมาก โดยคืนเฉพาะ id, title, price',
      exc_schema:
        'CREATE TABLE book (id INTEGER PRIMARY KEY, title TEXT, price INTEGER, stock INTEGER);',
      exc_seed:
        "INSERT INTO book VALUES (1,'Node Basics',350,5),(2,'Express',450,0),(3,'Prisma Deep',600,3),(4,'SQL 101',200,10),(5,'JS Tips',480,2);",
      exc_solution:
        'SELECT id, title, price FROM book WHERE price < 500 AND stock > 0 ORDER BY price ASC',
      order_matters: true,
      exc_anwser_field: 'exports.solve = function (db) {\n  // เขียนโค้ดตรงนี้\n  return []\n}\n',
      exc_status: 'available',
      lecture_id: lecture.id,
      author_id: teacher.id,
    },
  })

  console.log('seed เสร็จแล้ว')
  console.log({ teacher: teacher.id, student: student.id, course: course.id, exercise: exercise.id })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())