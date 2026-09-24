import { CourseRepository } from "@/app/repositories/CourseRepository";
import { CourseService } from "@/app/services/CourseService"
import { NextRequest, NextResponse } from 'next/server';
import { count } from "node:console";

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, context: Context) {
  const { id } = await context.params;
  try {
    const courseRepository = new CourseRepository();
    const courseService = new CourseService(courseRepository)


    const course = await courseService.getCourse(Number(id))

    return NextResponse.json(course)
  } catch (err) {
    console.log("Error : ", err)
    return NextResponse.json({ error: "Error Mayber" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {

  try {
    const courseRepository = new CourseRepository();
    const courseService = new CourseService(courseRepository)
    const formData = await req.formData();
    const creator_id = formData.get('creator_id') as string
    const course_name = formData.get('course_name') as string

    if (!course_name || !creator_id) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const input = {
      creator_id: Number(creator_id),
      course_name
    }

    const course = await courseService.createCourse(input)

    if(!course){
      return NextResponse.json({ error: 'Create Fail' }, { status: 400 });
    }
    return NextResponse.json({ success: true, data: course }, {status:201});
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process form' }, { status: 500 });
  }
}
