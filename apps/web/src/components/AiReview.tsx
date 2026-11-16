'use client';

import { useRef, useState } from 'react';

type Props = {
  exerciseId: number;
  code: string;
};

function parseFeedback(text: string) {
  const match = text.trim().match(
    /^จุดสังเกต\s*:\s*([\s\S]*?)\s*ลองตรวจสอบ\s*:\s*([\s\S]*?)\s*ทบทวน\s*:\s*([\s\S]+)$/,
  );

  if (!match || match.slice(1).some((part) => !part.trim())) {
    return null;
  }

  return [
    {
      title: 'จุดสังเกต',
      text: match[1].trim(),
      number: '01',
      tone: 'border-accent-magenta/25 bg-accent-magenta/5',
      label: 'text-accent-magenta',
    },
    {
      title: 'ลองตรวจสอบ',
      text: match[2].trim(),
      number: '02',
      tone: 'border-accent-cyan/25 bg-accent-cyan/5',
      label: 'text-accent-cyan',
    },
    {
      title: 'ทบทวน',
      text: match[3].trim(),
      number: '03',
      tone: 'border-ink/10 bg-surface-2',
      label: 'text-ink',
    },
  ];
}

export default function AIReviewButton({ exerciseId, code }: Props) {
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const pending = useRef(false);
const [isExpanded, setIsExpanded] = useState(true);
  const sections = parseFeedback(feedback);
  const hasCode = code.trim().length > 0;

  async function askForAdvice() {
    if (pending.current || !hasCode) return;

    pending.current = true;
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exerciseId, code }),
      });

      const data = (await response.json()) as {
        feedback?: unknown;
        error?: unknown;
      };

      if (!response.ok) {
        throw new Error(
          typeof data.error === 'string'
            ? data.error
            : 'ไม่สามารถขอคำแนะนำได้ กรุณาลองอีกครั้ง',
        );
      }

      if (
        typeof data.feedback !== 'string' ||
        !data.feedback.trim()
      ) {
        throw new Error('ไม่ได้รับคำแนะนำจาก AI กรุณาลองอีกครั้ง');
      }

      setFeedback(data.feedback.trim());
      setIsExpanded(true);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'เกิดข้อผิดพลาด กรุณาลองอีกครั้ง',
      );
    } finally {
      pending.current = false;
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">

      <button
        type="button"
        onClick={askForAdvice}
        disabled={isLoading || !hasCode}
        aria-busy={isLoading}
        className="
          flex w-full items-center justify-center gap-2
          rounded-[8px] bg-accent-cyan px-4 py-3
          text-sm font-semibold text-[var(--btn-text)]
          transition hover:opacity-90
          focus-visible:outline-2
          focus-visible:outline-offset-2
          focus-visible:outline-accent-cyan
          disabled:cursor-not-allowed disabled:opacity-50
        "
      >
        {isLoading && (
          <span
            aria-hidden="true"
            className="
              h-4 w-4 animate-spin rounded-full
              border-2 border-current border-t-transparent
            "
          />
        )}

        {isLoading
          ? 'กำลังสร้างคำแนะนำ...'
          : feedback
            ? 'ขอคำแนะนำอีกครั้ง'
            : 'ขอคำแนะนำจาก AI'}
      </button>

      {!hasCode && (
        <p className="text-sm text-muted">
          ไม่พบโค้ดสำหรับขอคำแนะนำ
        </p>
      )}

      {error && (
        <div
          role="alert"
          className="
            rounded-[8px] border border-red-500/25
            bg-red-500/10 p-3 text-sm leading-6
            text-red-600 dark:text-red-400
          "
        >
          {error}
        </div>
      )}

      <div aria-live="polite" aria-atomic="true">
        {isLoading && !feedback && (
          <div
            role="status"
            className="
              rounded-[8px] border border-ink/10
              bg-surface-2 p-4
            "
          >
            <p className="text-sm text-muted">
              กำลังพิจารณาโค้ดและเงื่อนไขของโจทย์
            </p>

            <div
              aria-hidden="true"
              className="mt-4 animate-pulse space-y-2"
            >
              <div className="h-3 w-full rounded bg-ink/10" />
              <div className="h-3 w-5/6 rounded bg-ink/10" />
              <div className="h-3 w-3/5 rounded bg-ink/10" />
            </div>
          </div>
        )}

        {feedback && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setIsExpanded((previous) => !previous)}
              aria-expanded={isExpanded}
              aria-controls={`ai-feedback-${exerciseId}`}
              className="
              flex w-full items-center justify-between
              rounded-md px-1 py-2 cursor-pointer
              text-xs font-medium text-muted
              transition-colors hover:text-ink
              focus-visible:outline-2
              focus-visible:outline-offset-2
              focus-visible:outline-accent-cyan
              "
              >
              <span>
                {isExpanded ? 'ย่อคำแนะนำ' : 'แสดงคำแนะนำ'}
              </span>

              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''
                  }`}
              >
                <path
                  d="m6 9 6 6 6-6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <div
              id={`ai-feedback-${exerciseId}`}
              hidden={!isExpanded}
              className="space-y-3"
            >
              {sections ? (
                sections.map((section) => (
                  <section
                    key={section.number}
                    className={`rounded-[10px] border p-4 ${section.tone}`}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className={`font-mono text-xs ${section.label}`}
                      >
                        {section.number}
                      </span>

                      <h3
                        className={`text-sm font-semibold ${section.label}`}
                      >
                        {section.title}
                      </h3>
                    </div>

                    <p className="whitespace-pre-wrap break-words text-sm leading-7 text-ink">
                      {section.text}
                    </p>
                  </section>
                ))
              ) : (
                <div className="rounded-[10px] border border-ink/10 bg-surface-2 p-4">
                  <p className="whitespace-pre-wrap break-words text-sm leading-7 text-ink">
                    {feedback}
                  </p>
                </div>
              )}

              <p className="text-xs leading-5 text-muted">
                คำแนะนำจาก AI อาจคลาดเคลื่อนได้
                ควรตรวจสอบกับเงื่อนไขของโจทย์และผลการรัน
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}