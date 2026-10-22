import { streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { getExerciseById } from '../repositories/exercise.repository';
type ReviewCodeInput = {
    studentId: number;
    exerciseId: number;
    code: string;
    abortSignal?: AbortSignal;
};

const SYSTEM_PROMPT = `
คุณคือ AI Tutor สำหรับช่วยนักศึกษาฝึกเขียนโปรแกรม

หน้าที่ของคุณคือวิเคราะห์โค้ดและให้คำแนะนำ
ห้ามให้โค้ดคำตอบที่แก้ไขเสร็จแล้ว
ห้ามเปิดเผยคำตอบสุดท้าย
อธิบายข้อผิดพลาดเชิงแนวคิดและหัวข้อที่ควรศึกษา
ตอบเป็นภาษาไทย ไม่เกิน 100 คำ
`;

export class AIReviewService {

    async reviewCode(input: ReviewCodeInput) {
        const exercise =  await getExerciseById(input.exerciseId);

        if (!exercise) {
            throw new Error('Exercise not found');
        }

        const modelId = process.env.GOOGLE_MODEL_ID ?? 'gemini-3.6-flash';

        const prompt = `
            โจทย์: ${exercise.exc_name}

            รายละเอียดโจทย์:
            ${exercise.exc_description}

            โค้ดของนักศึกษา:
            \`\`\`
            ${input.code}
            \`\`\`

            โปรดวิเคราะห์โค้ดและให้คำแนะนำ
            ห้ามเปิดเผยโค้ดคำตอบฉบับสมบูรณ์
            `;
        return streamText({
            model: google(modelId),
            system: SYSTEM_PROMPT,
            prompt,
            maxOutputTokens: 250,
            abortSignal: input.abortSignal,
        });
    }
}