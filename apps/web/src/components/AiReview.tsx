'use client';

import { useRef, useState } from 'react';

type Props = {
  exerciseId: number;
  code: string;
};

export default function AIReviewButton({ exerciseId, code }: Props) {
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const pending = useRef(false);

  async function askForAdvice() {
    if (pending.current || !code.trim()) return;

    pending.current = true;
    setIsLoading(true);
    setError('');
    setFeedback('');

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exerciseId, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'ไม่สามารถขอคำแนะนำได้'
        );
      }

      if (
        typeof data.feedback !== 'string' ||
        !data.feedback.trim()
      ) {
        throw new Error('ไม่ได้รับคำแนะนำจาก AI');
      }

      setFeedback(data.feedback);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'เกิดข้อผิดพลาด กรุณาลองอีกครั้ง'
      );
    } finally {
      pending.current = false;
      setIsLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={askForAdvice}
        disabled={isLoading || !code.trim()}
        aria-busy={isLoading}
      >
        {isLoading ? 'กำลังวิเคราะห์...' : 'ขอคำแนะนำจาก AI'}
      </button>

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-400">
          {error}
        </p>
      )}

      <div aria-live="polite" className="mt-3">
        {feedback && (
          <p className="whitespace-pre-wrap break-words text-sm leading-7 text-ink">
            {feedback}
          </p>
        )}
      </div>
    </div>
  );
}