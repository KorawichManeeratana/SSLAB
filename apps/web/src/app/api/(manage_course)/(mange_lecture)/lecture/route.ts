import { LectureRepository } from "@/app/repositories/LectureRepository"
import { LectureService } from "@/app/services/LectureService"
import { NextResponse } from "next/server"

const lectureRepository = new LectureRepository()
const lectureService = new LectureService(lectureRepository)

export async function GET() {
    try {
        const lecture = await lectureService.getLecture()
        return NextResponse.json(lecture)
    } catch (err) {
        return NextResponse.json({ error: err, status: 400 })
    }

}

// export async function PUT() {
//     try {
        
//     } catch (err) {

//     }   
// }
