import { NextResponse } from 'next/server';
import { PrismaClient } from '@sslab/db';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { entity } = await request.json();

    if (!entity) {
      return NextResponse.json({ success: false, message: 'กรุณาระบุ Entity' }, { status: 400 });
    }

    let createdRecord = null;

    switch (entity) {
      // 1. FACULTY
      case 'Faculty': {
        const count = await prisma.faculty.count();
        const nextNum = count + 1;
        createdRecord = await prisma.faculty.create({
          data: { fac_name: `คณะเทคโนโลยีสารสนเทศ (${nextNum})` },
        });
        break;
      }

      // 2. USERS (ต้องการ Faculty - Optional)
      case 'Users': {
        const count = await prisma.users.count();
        const nextNum = count + 1;
        const latestFaculty = await prisma.faculty.findFirst({ orderBy: { id: 'desc' } });

        createdRecord = await prisma.users.create({
          data: {
            first_name: 'User',
            last_name: `Test ${nextNum}`,
            student_code: `STD${String(1000 + nextNum).padStart(4, '0')}`,
            password: 'password123',
            role: 'student',
            user_status: 'available',
            fac_id: latestFaculty?.id ?? null,
          },
        });
        break;
      }

      // 3. COURSES (ต้องมี Users เป็น Creator)
      case 'Courses': {
        const latestUser = await prisma.users.findFirst({ orderBy: { id: 'desc' } });
        if (!latestUser) {
          return NextResponse.json({ success: false, message: 'ไม่สามารถสร้าง Course ได้: กรุณาเพิ่ม User ก่อนอย่างน้อย 1 คน' }, { status: 400 });
        }

        const count = await prisma.courses.count();
        const nextNum = count + 1;

        createdRecord = await prisma.courses.create({
          data: {
            course_name: `Course ${nextNum}: Web Development Basics`,
            creator_id: latestUser.id,
            course_status: 'available',
          },
        });
        break;
      }

      // 4. ENROLLS (ต้องมี Users และ Courses + ป้องกัน @@unique([user_id, course_id]))
      case 'Enrolls': {
        const users = await prisma.users.findMany({ select: { id: true } });
        const courses = await prisma.courses.findMany({ select: { id: true } });

        if (users.length === 0 || courses.length === 0) {
          return NextResponse.json({ success: false, message: 'ไม่สามารถลงทะเบียนได้: ต้องมีทั้ง User และ Course ในระบบก่อน' }, { status: 400 });
        }

        // ค้นหาคู่ User และ Course ที่ยังไม่เคย Enroll กัน เพื่อป้องกัน Unique Constraint Crash
        let validUserId: number | null = null;
        let validCourseId: number | null = null;

        for (const u of users) {
          for (const c of courses) {
            const exists = await prisma.enrolls.findUnique({
              where: { user_id_course_id: { user_id: u.id, course_id: c.id } },
            });
            if (!exists) {
              validUserId = u.id;
              validCourseId = c.id;
              break;
            }
          }
          if (validUserId && validCourseId) break;
        }

        if (!validUserId || !validCourseId) {
          return NextResponse.json({ success: false, message: 'ผู้ใช้งานทุกคนได้ลงทะเบียนครบทุกคอร์สแล้ว ไม่สามารถเพิ่ม Enrolls ซ้ำได้' }, { status: 400 });
        }

        createdRecord = await prisma.enrolls.create({
          data: {
            user_id: validUserId,
            course_id: validCourseId,
            enroll_status: 'active',
          },
        });
        break;
      }

      // 5. LECTURES (ต้องมี Courses)
      case 'Lectures': {
        const latestCourse = await prisma.courses.findFirst({ orderBy: { id: 'desc' } });
        if (!latestCourse) {
          return NextResponse.json({ success: false, message: 'ไม่สามารถสร้าง Lecture ได้: กรุณาสร้าง Course ก่อน' }, { status: 400 });
        }

        const count = await prisma.lectures.count({ where: { course_id: latestCourse.id } });
        const nextNum = count + 1;

        createdRecord = await prisma.lectures.create({
          data: {
            lecture_name: `Lecture ${nextNum}: Fundamentals Part ${nextNum}`,
            lecture_week: `Week ${nextNum}`,
            course_id: latestCourse.id,
          },
        });
        break;
      }

      // 6. FILES (ต้องมี Lectures)
      case 'Files': {
        const latestLecture = await prisma.lectures.findFirst({ orderBy: { id: 'desc' } });
        if (!latestLecture) {
          return NextResponse.json({ success: false, message: 'ไม่สามารถสร้าง File ได้: กรุณาสร้าง Lecture ก่อน' }, { status: 400 });
        }

        const count = await prisma.files.count();
        const nextNum = count + 1;

        createdRecord = await prisma.files.create({
          data: {
            file_name: `document_slide_v${nextNum}.pdf`,
            file_size: 1024 * 5 * nextNum,
            status: 'available',
            lecture_id: latestLecture.id,
          },
        });
        break;
      }

      // 7. EXERCISES (ต้องมี Lectures และ Users)
      case 'Exercises': {
        const latestLecture = await prisma.lectures.findFirst({ orderBy: { id: 'desc' } });
        const latestUser = await prisma.users.findFirst({ orderBy: { id: 'desc' } });

        if (!latestLecture || !latestUser) {
          return NextResponse.json({ success: false, message: 'ไม่สามารถสร้าง Exercise ได้: ต้องมีทั้ง Lecture และ User (Author)' }, { status: 400 });
        }

        const count = await prisma.exercises.count();
        const nextNum = count + 1;

        createdRecord = await prisma.exercises.create({
          data: {
            exc_name: `Exercise ${nextNum}: Practice Task`,
            exc_difficulty: 'novice',
            exc_schema: 'CREATE TABLE example (id INT, value TEXT);',
            exc_seed: "INSERT INTO example VALUES (1, 'Test');",
            exc_solution: 'SELECT * FROM example;',
            exc_status: 'available',
            exc_type: 'practice',
            exc_engine: 'QUERY',
            lecture_id: latestLecture.id,
            author_id: latestUser.id,
          },
        });
        break;
      }

      // 8. TESTCASE (ต้องมี Exercises)
      case 'Testcase': {
        const latestExercise = await prisma.exercises.findFirst({ orderBy: { id: 'desc' } });
        if (!latestExercise) {
          return NextResponse.json({ success: false, message: 'ไม่สามารถสร้าง Testcase ได้: กรุณาสร้าง Exercise ก่อน' }, { status: 400 });
        }

        const count = await prisma.testcase.count({ where: { exercise_id: latestExercise.id } });
        const nextNum = count + 1;

        createdRecord = await prisma.testcase.create({
          data: {
            case_name: `Testcase ${nextNum}`,
            sort_order: nextNum,
            method: 'GET',
            path: `/api/resource/${nextNum}`,
            expected_status: 200,
            expected_body: { success: true, case: nextNum },
            exercise_id: latestExercise.id,
          },
        });
        break;
      }

      // 9. USER_EXERCISE (ต้องมี Users และ Exercises)
      case 'user_exercise': {
        const latestUser = await prisma.users.findFirst({ orderBy: { id: 'desc' } });
        const latestExercise = await prisma.exercises.findFirst({ orderBy: { id: 'desc' } });

        if (!latestUser || !latestExercise) {
          return NextResponse.json({ success: false, message: 'ไม่สามารถบันทึกการส่งตรวจได้: ต้องมีทั้ง User และ Exercise ในระบบ' }, { status: 400 });
        }

        const count = await prisma.user_exercise.count({
          where: { user_id: latestUser.id, exercise_id: latestExercise.id },
        });
        const attempt = count + 1;

        createdRecord = await prisma.user_exercise.create({
          data: {
            user_id: latestUser.id,
            exercise_id: latestExercise.id,
            score: 100,
            status: 'complete',
            verdict: 'ACCEPTED',
            code: 'SELECT * FROM example;',
            attempt_number: attempt,
            exec_time: 12,
          },
        });
        break;
      }

      default:
        return NextResponse.json({ success: false, message: 'ไม่พบ Table ที่ระบุ' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `เพิ่มข้อมูลด่วนใน ${entity} เรียบร้อยแล้ว!`,
      data: createdRecord,
    });

  } catch (error: any) {
    console.error('Quick Add Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการสร้างข้อมูลด่วน',
    }, { status: 500 });
  }
}