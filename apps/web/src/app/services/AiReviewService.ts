import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { getExerciseForAI } from '../repositories/exercise.repository';

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

Focus on one blocking issue per response. If an undefined variable,
syntax error, or other blocking runtime issue is evident, discuss
only that issue. Do not continue by outlining the database query
or the remaining solution.

Give one diagnostic hint and at most two learning topics.
Use three short Thai lines and stay within 450 characters.
Do not enumerate the SQL clauses, exact conditions, and ordering
needed to solve the exercise.
`;

export class AIReviewService {

    async reviewCode(input: ReviewCodeInput) {

        const requestStartedAt = performance.now();

        const exercise = await getExerciseForAI(input.exerciseId);

        const databaseMs = Math.round(performance.now() - requestStartedAt);

        if (!exercise) {
            throw new Error('Exercise not found');
        }
        if (exercise.exc_type !== 'practice') {
            throw new Error('AI advice is only available for practice exercises');
        }
        const modelId = process.env.GOOGLE_MODEL_ID ?? 'gemini-3.6-flash';


        const context = {
            exercise: {
                title: exercise.exc_name,
                description: exercise.exc_description,
                engine: exercise.exc_engine,
                schema: exercise.exc_schema,
                starterCode: exercise.exc_anwser_field,
                orderMatters: exercise.order_matters,
            },
            studentCode: input.code,
            executionEvidence: null,
        };
        const modelStartedAt = performance.now();

        const result = await generateText({
            model: google(modelId),
            instructions: SYSTEM_PROMPT,
            prompt: JSON.stringify(context),
            maxOutputTokens: 1000,
            maxRetries: 0,
            providerOptions: {
                google: {
                    thinkingConfig: {
                        thinkingLevel: 'low',
                    },
                },
            },
            abortSignal: input.abortSignal,
        });


        console.log('AI metrics:', {
            modelId,
            thinkingLevel: 'low',
            databaseMs,
            modelMs: Math.round(performance.now() - modelStartedAt),
            totalMs: Math.round(performance.now() - requestStartedAt),
            inputTokens: result.usage.inputTokens,
            outputTokens: result.usage.outputTokens,
            outputTokenDetails: result.usage.outputTokenDetails,
            finishReason: result.finishReason,
        });

        const feedback = result.text.trim();

        if (!feedback) {
            throw new Error('AI returned an empty response');
        }

        if (result.finishReason === 'length') {
            throw new Error('AI response exceeded the token limit');
        }

        return {
            feedback,
            usage: result.usage,
            finishReason: result.finishReason,
        };
    }
}