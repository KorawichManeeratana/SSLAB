import { LectureRepository, CreateLectureDefault } from "../repositories/LectureRepository";

export class LectureService {
    private lectureRepository: LectureRepository;

    constructor (lectureRepository:LectureRepository){
        this.lectureRepository = lectureRepository
    }

    async getLecture(){
        const lecture = await this.lectureRepository.getLecture()
        if(!lecture){
            throw new Error('lecture not found')
        }
        return lecture
    }

    async createCourse(input:CreateLectureDefault){
        return await this.lectureRepository.createDefaultLecture({
            course_id : input.course_id,
            lecture_name : input.lecture_name,
            week: input.week
        })
    }
}