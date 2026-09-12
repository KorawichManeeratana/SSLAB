import { Course, CourseRepository } from "../repositories/CourseRepository";

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
}