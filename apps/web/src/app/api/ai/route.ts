import {
  AIReviewService
} from '@/app/services/AiReviewService';
import { NextRequest, NextResponse } from 'next/server';

const aiReviewService = new AIReviewService();

export async function POST(req: NextRequest) {
  const studentId = 1;
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return Response.json(
      { error: 'Invalid JSON body' },
      { status: 400 },
    );
  }

  if (typeof body !== 'object' || body === null) {
    return Response.json(
      { error: 'Invalid request body' },
      { status: 400 },
    );
  }

  const data = body as {
    exerciseId?: unknown;
    code?: unknown;
  };

  const exerciseId = data.exerciseId;
  const code = data.code;

  if (
    typeof exerciseId !== 'number' ||
    !Number.isInteger(exerciseId) ||
    exerciseId <= 0
  ) {
    return Response.json(
      { error: 'Invalid exerciseId' },
      { status: 400 },
    );
  }

  if (
    typeof code !== 'string' ||
    code.trim().length === 0
  ) {
    return Response.json(
      { error: 'Code is required' },
      { status: 400 },
    );
  }

  try {
    const result = await aiReviewService.reviewCode({
      studentId,
      exerciseId,
      code,
      abortSignal: req.signal,
    });

    console.log('AI response:', result.feedback);
    console.log('AI usage:', result.usage);
    console.log('AI finish reason:', result.finishReason);

    return NextResponse.json({
      feedback: result.feedback,
    });
  } catch (error) {
    console.error('AI review failed:', error);

    return NextResponse.json(
      { error: 'ไม่สามารถสร้างคำแนะนำได้ กรุณาลองอีกครั้ง' },
      { status: 500 },
    );
  }
}