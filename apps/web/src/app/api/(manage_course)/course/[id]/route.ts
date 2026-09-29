import { CourseRepository } from "@/app/repositories/CourseRepository";
import { LectureRepository } from "@/app/repositories/LectureRepository";
import { CourseService } from "@/app/services/CourseService"
import { NextRequest, NextResponse } from 'next/server';

const courseRepository = new CourseRepository();
const lectureRepository = new LectureRepository();
const courseService = new CourseService(courseRepository, lectureRepository)
type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, context: Context) {
  const { id } = await context.params;
  try {
    const course = await courseService.getCourseById(Number(id))

    return NextResponse.json(course)
  } catch (err) {
    console.log("Error : ", err)
    return NextResponse.json({ error: "Error Mayber" }, { status: 500 })
  }
}
