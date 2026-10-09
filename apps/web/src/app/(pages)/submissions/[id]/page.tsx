import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Header } from '@/components/header'
import { getCurrentUserId } from '@/lib/current-user'
import { getSubmissionForView } from '../../../repositories/submission.repository'

const HEADLINE: Record<string, { tag: string; title: string; tone: string }> = {
  ACCEPTED:      { tag: 'PASSED',  title: 'COMPLETE_',  tone: 'text-accent-cyan' },
  WRONG_ANSWER:  { tag: 'FAILED',  title: 'INCOMPLETE_', tone: 'text-accent-magenta' },
  RUNTIME_ERROR: { tag: 'ERROR',   title: 'RUNTIME_ERROR_', tone: 'text-accent-magenta' },
  TLE:           { tag: 'TIMEOUT', title: 'TIME_LIMIT_', tone: 'text-accent-magenta' },
}

export default async function SubmissionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const submissionId = Number(id)
  if (!Number.isInteger(submissionId)) notFound()

  const userId = await getCurrentUserId()
  const sub = await getSubmissionForView(submissionId, userId)
  if (!sub) notFound()

  const result = (sub.result ?? {}) as any
  const cases: any[] = result.cases ?? []
  const passed = result.passed ?? 0
  const total = passed + (result.failed ?? 0)
  const head = HEADLINE[sub.verdict] ?? HEADLINE.WRONG_ANSWER
  const lab = `LAB_${String(sub.exercise.id).padStart(2, '0')}`

  return (
    <div>
      <Header />
      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 mt-4">
        {/* ซ้าย: สรุป + log */}
        <div className="lg:col-span-7 space-y-6">
          <section className="panel p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-4">
                <span className="inline-block px-3 py-1 rounded-[6px] border border-accent-magenta/40 bg-accent-magenta/10 font-mono text-[10px] tracking-[0.2em] text-accent-magenta">
                  EVALUATION RESULT: {head.tag}
                </span>
                <h1 className="font-display text-4xl font-bold leading-tight">
                  <span className="text-ink">{lab} </span>
                  <span className={head.tone}>{head.title}</span>
                </h1>
                <p className="text-muted">{sub.exercise.exc_name}</p>
                <p className="font-mono text-xs text-muted/70">
                  ATTEMPT #{sub.attempt_number} · {sub.created_at.toLocaleString('th-TH')}
                </p>
              </div>
              <div className="text-center">
                <div className="font-display text-7xl font-bold">
                  <span className="text-accent-cyan">{passed}</span>
                  <span className="text-muted/40">/</span>
                  <span className="text-ink">{total}</span>
                </div>
                <div className="font-mono text-[10px] tracking-[0.3em] text-muted mt-2">TEST_CASES_PASSED</div>
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <h2 className="panel-title">Detailed Execution Log</h2>
              {sub.exec_time != null && (
                <span className="font-mono text-[10px] text-muted">SYS_TIME: {sub.exec_time}MS</span>
              )}
            </div>
            <ul>
              {cases.length === 0 && (
                <li className="px-6 py-4 text-muted text-sm">{result.systemError ?? 'ไม่มีข้อมูล test case'}</li>
              )}
              {cases.map((c, i) => (
                <li key={i} className={`flex items-center justify-between px-6 py-4 border-b border-ink/5 ${c.pass ? '' : 'bg-accent-magenta/5'}`}>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${c.pass ? 'bg-accent-cyan' : 'bg-accent-magenta'}`} />
                      <span className={`font-mono text-sm font-bold ${c.pass ? 'text-ink' : 'text-accent-magenta'}`}>
                        TEST_CASE_{String(i + 1).padStart(2, '0')}
                      </span>
                    </div>
                    {c.error && <p className="font-mono text-[11px] text-red-400 pl-5">{c.error}</p>}
                  </div>
                  <span className={`px-3 py-1 rounded-full border font-mono text-[10px] tracking-[0.15em] ${
                    c.pass
                      ? 'border-green-500/40 text-green-400 bg-green-500/10'
                      : 'border-red-500/40 text-red-400 bg-red-500/10'
                  }`}>
                    {c.pass ? 'CORRECT' : 'WRONG'}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* ขวา: AI + โค้ด + ปุ่ม */}
        <div className="lg:col-span-5 space-y-6">
          <section className="panel p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-8 rounded-full border border-ink/20 flex items-center justify-center font-mono text-xs">AI</span>
              <h2 className="font-display font-bold">AI Code Review</h2>
            </div>
            <p className="text-muted text-sm">ขั้นถัดไป: ปุ่มขอคำแนะนำจาก AI</p>
          </section>

          <section className="panel">
            <div className="panel-header">
              <h2 className="panel-title">Submission Snapshot</h2>
            </div>
            <pre className="p-6 font-mono text-xs text-ink overflow-auto max-h-[360px] whitespace-pre">{sub.code}</pre>
          </section>

          <div className="grid grid-cols-2 gap-3">
            <Link href={`/problems/${sub.exercise.id}`} className="text-center py-3 rounded-[8px] border border-ink/15 font-mono text-xs font-bold tracking-[0.15em] hover:bg-ink/5">
              EDIT_SUBMISSION
            </Link>
            <Link href="/" className="text-center py-3 rounded-[8px] bg-accent-cyan text-surface font-mono text-xs font-bold tracking-[0.15em]">
              NEXT_MODULE →
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}