import { PrismaClient } from "../../../../../packages/db/generated/prisma/client";
const prisma = new PrismaClient();

export interface Course {
    id: number;
    course_name: string;
}

export class CourseRepository {
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
}