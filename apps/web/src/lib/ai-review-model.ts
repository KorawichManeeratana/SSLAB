import 'server-only';

import { google } from '@ai-sdk/google';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

function requireEnv(name: string): string {
    const value = process.env[name]?.trim();

    if (!value) {
        throw new Error(`Missing environment variable: ${name}`);
    }

    return value;
}

export function getAIReviewModel() {
    const provider = requireEnv('AI_PROVIDER');
    const modelId = requireEnv('AI_MODEL_ID');
    const allowPaidModels = process.env.AI_ALLOW_PAID_MODELS === 'true';
    switch (provider) {
        case 'google': {
            requireEnv('GOOGLE_GENERATIVE_AI_API_KEY');

            return {
                provider,
                modelId,
                model: google(modelId),
                providerOptions: {
                    google: {
                        thinkingConfig: {
                            thinkingLevel: 'low',
                        },
                    },
                },
                reasoningSetting: 'google: thinkingLevel=low',
            };
        }
        
        case 'openrouter': {
            if (!modelId.endsWith(':free') && !allowPaidModels) {
                throw new Error(
                    'Paid models are disabled. Set AI_ALLOW_PAID_MODELS=true to enable.',
                );
            }

            const openrouter = createOpenAICompatible({
                name: 'openrouter',
                baseURL: 'https://openrouter.ai/api/v1',
                apiKey: requireEnv('OPENROUTER_API_KEY'),
            });

            return {
                provider,
                modelId,
                model: openrouter(modelId),
                providerOptions: {},
                reasoningSetting: 'provider default',
            };
        }

        default:
            throw new Error(`Unsupported AI provider: ${provider}`);
    }
}