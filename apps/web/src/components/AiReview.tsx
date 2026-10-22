'use client';

import { useCompletion } from '@ai-sdk/react';

type Props = {
  exerciseId: number;
  code: string;
};

export default function AIReviewButton({
  exerciseId,
  code,
}: Props) {
  const {
    completion,
    complete,
    isLoading,
    error,
    stop,
  } = useCompletion({
    api: '/api/ai',
    streamProtocol: 'text',
  });

  async function askForAdvice() {
    await complete('ขอคำแนะนำจาก AI', {
      body: {
        exerciseId,
        code,
      },
    });
  }

  return (
    <div>
      <button
        onClick={askForAdvice}
        disabled={isLoading || !code}
      >
        {isLoading ? 'กำลังวิเคราะห์...' : 'ขอคำแนะนำจาก AI'}
      </button>

      {isLoading && (
        <button onClick={stop}>
          หยุด
        </button>
      )}

      {error && (
        <p>เกิดข้อผิดพลาดในการขอคำแนะนำ</p>
      )}

      <div>
        <h3>คำแนะนำจาก AI</h3>
        <pre style={{ whiteSpace: 'pre-wrap' }}>
          {completion}
        </pre>
      </div>
    </div>
  );
}