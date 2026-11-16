import { generateText } from 'ai';
import { getAIReviewModel } from '@/lib/ai-review-model';
import { getExerciseForAI } from '../repositories/exercise.repository';
import { AI_REVIEW_INSTRUCTIONS } from '../prompts/ai-review-prompt';
type ReviewCodeInput = {
    studentId: number;
    exerciseId: number;
    code: string;
    abortSignal?: AbortSignal;
};

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
        const aiConfig = getAIReviewModel();


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
            model: aiConfig.model,
            instructions: AI_REVIEW_INSTRUCTIONS,
            prompt: JSON.stringify(context),
            maxOutputTokens: 1000,
            maxRetries: 0,
            providerOptions: aiConfig.providerOptions,
            abortSignal: input.abortSignal,
        });


        console.log('AI metrics:', {
            provider: aiConfig.provider,
            requestedModelId: aiConfig.modelId,
            responseModelId: result.response.modelId,
            reasoningSetting: aiConfig.reasoningSetting,

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