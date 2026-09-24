import { Course, CourseRepository, CreateCourse } from "../repositories/CourseRepository";

export class CourseService {
    private courseRepository: CourseRepository;

    constructor(courseRepository: CourseRepository) {
        this.courseRepository = courseRepository;
    }

    async getCourse(id: number) {
        const course = await this.courseRepository.findById(id)

        if (!course) {
            throw new Error('course not found')
        }
        return course
    }
    async createCourse(input: CreateCourse) {
        return await this.courseRepository.createCourse({
            creator_id: input.creator_id,
            course_name: input.course_name
        })
    }
}