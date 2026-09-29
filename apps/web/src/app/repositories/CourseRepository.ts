import { PrismaClient } from "../../../../../packages/db/generated/prisma/client";
const prisma = new PrismaClient();

export interface Course {
    id: number;
    course_name: string;
}
export interface CreateCourse {
    creator_id: number;
    course_name: string;
}

export class CourseRepository {
    async findCourse(){
        const course = await prisma.courses.findMany()
        if(!course){
            return null;
        }
        return {
            data: course,
            status: 200,
        };
    }
    async findById(id: number): Promise<Course | null> {

        const course = await prisma.courses.findUnique({
            where: {
                id: id,
            },
        });

        if (!course) {
            return null;
        }

        return {
            id: course.id,
            course_name: course.course_name,
        };
    }
    async createCourse(input: CreateCourse) {
        return await prisma.courses.create({
            data: {
                creator_id: input.creator_id,
                course_name: input.course_name
            }
        })
    }
}