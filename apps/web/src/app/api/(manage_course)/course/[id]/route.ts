import { CourseRepository } from "@/app/repositories/CourseRepository";
import { CourseService } from "@/app/services/CourseService"
import { NextRequest, NextResponse } from 'next/server';

type Context = {
    params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, context: Context) {
    const { id } = await context.params;
    console.log("In router now");
    console.log("DATABASE_URL:", process.env.DATABASE_URL);
    try {
        const courseRepository = new CourseRepository();
        const courseService = new CourseService(courseRepository) 


        const course = await courseService.getCourse(Number(id))

        return NextResponse.json(course)
    } catch (err) {
        console.log("Error : ", err)
        return NextResponse.json({ error: "Error Mayber" },{ status: 500 })
    }
}

export async function POST(req:NextRequest) {

    try {
    const formData = await req.formData();
    
    const course_name = formData.get('course_name') as string | null;

    if (!course_name) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    console.log(`itemsis : ${course_name}`);

    return NextResponse.json({ success: true, data: course_name });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process form' }, { status: 500 });
  }
}
