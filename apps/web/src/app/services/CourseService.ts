import { Course, CourseRepository, CreateCourse } from "../repositories/CourseRepository";
import { CreateLectureDefault, LectureRepository } from "../repositories/LectureRepository";
export class CourseService {
    private courseRepository: CourseRepository;
    private lectureRepository: LectureRepository;

    constructor(courseRepository: CourseRepository, lectureRepository: LectureRepository) {
        this.courseRepository = courseRepository;
        this.lectureRepository = lectureRepository;
    }

    async getCourse() {
        const course = await this.courseRepository.findCourse()
        if (!course) {
            throw new Error('course not found')
        }
        return course
    }
    async getCourseById(id: number) {
        const course = await this.courseRepository.findById(id)

        if (!course) {
            throw new Error('course not found')
        }
        return course
    }
    async createCourse(courseinput: CreateCourse) {
        const course = await this.courseRepository.createCourse({
            creator_id: courseinput.creator_id,
            course_name: courseinput.course_name
        })
        for (let week = 1; week <= 16; week++) {
            await this.lectureRepository.createDefaultLecture({
                course_id: course.creator_id,
                week: String(week),
                lecture_name: `Week ${week}`
            })
        }
        return course
    }
}