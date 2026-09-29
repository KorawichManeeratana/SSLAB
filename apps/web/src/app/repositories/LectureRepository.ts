import { PrismaClient } from "../../../../../packages/db/generated/prisma/client";
const prisma = new PrismaClient();

export interface CreateLectureDefault {
    course_id : number,
    week: string,
    lecture_name: string
}

export class LectureRepository {
    async getLecture() {
        const lecture = await prisma.lectures.findMany()
        if (!lecture) {
            return null;
        }
        return { data: lecture, status: 200 }
    }
    async createDefaultLecture(input:CreateLectureDefault){
        return await prisma.lectures.create({
            data:{
                course_id : input.course_id,
                lecture_week : input.week,
                lecture_name : input.lecture_name

            }
        })
    }
}