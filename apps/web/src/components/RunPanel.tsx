import type { RunOutput, HttpRunOutput, HttpRunCase } from '@/type/grading'

const STATUS_STYLE: Record<string, string> = {
    OK: 'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/40',
    ERROR: 'bg-red-500/10 text-red-400 border-red-500/40',
    TIMEOUT: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/40',
    SYSTEM_ERROR: 'bg-ink/10 text-muted border-ink/20',
}

function statusStyle(status: number) {
    if (status >= 200 && status < 300) return 'bg-green-500/10 text-green-400 border-green-500/40'
    if (status >= 400 && status < 500) return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/40'
    if (status === 503) return 'bg-ink/10 text-muted border-ink/20'   // ระบบขัดข้อง ไม่ใช่ความผิดของโค้ด
    return 'bg-red-500/10 text-red-400 border-red-500/40'
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="space-y-2">
            <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted/70">{title}</h3>
            {children}
        </section>
    )
}

// body ที่เป็น string (เช่น HTML error ของ Express) แสดงตามจริง ไม่ต้อง JSON.stringify
function formatBody(body: unknown) {
    if (body === undefined) return '(empty)'
    return typeof body === 'string' ? body : JSON.stringify(body, null, 2)
}

function HttpCaseCard({ c }: { c: HttpRunCase }) {
    return (
        <li className="rounded-[8px] border border-ink/10 bg-ink/5 p-3 space-y-2">
            <div className="flex items-center justify-between gap-2 font-mono text-xs">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="text-accent-magenta font-bold">{c.request.method}</span>
                    <span className="text-ink truncate">{c.request.path}</span>
                </div>
                {c.status !== undefined ? (
                    <span className={`shrink-0 px-2 py-0.5 rounded-[6px] border text-[11px] font-bold ${statusStyle(c.status)}`}>
                        {c.status} {c.statusText}
                    </span>
                ) : (
                    <span className="shrink-0 px-2 py-0.5 rounded-[6px] border text-[11px] font-bold bg-red-500/10 text-red-400 border-red-500/40">
                        No response
                    </span>
                )}
            </div>
            <p className="font-mono text-[10px] text-muted">{c.name}</p>

            {c.error ? (
                <pre className="font-mono text-[11px] text-red-400 whitespace-pre-wrap break-all bg-red-500/5 border border-red-500/20 rounded-[6px] p-2">
                    {c.error}
                </pre>
            ) : (
                <details open>
                    <summary className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted/70 cursor-pointer">
                        Response body
                    </summary>
                    <pre className="mt-2 font-mono text-[11px] text-ink bg-ink/5 border border-ink/10 rounded-[6px] p-2 max-h-64 overflow-auto whitespace-pre-wrap break-all">
                        {formatBody(c.body)}
                    </pre>
                </details>
            )}
        </li>
    )
}

function HttpRunPanel({ output }: { output: HttpRunOutput }) {
    // ระบบมีปัญหา (503) หรือเกินเวลารวม (504): ไม่มีผลรายเคส
    if (output.status !== undefined) {
        return (
            <div className="space-y-5">
                <Section title="Status">
                    <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-[6px] border font-mono text-xs font-bold ${statusStyle(output.status)}`}>
                            {output.status} {output.statusText}
                        </span>
                        <span className="font-mono text-[11px] text-muted">{output.durationMs} ms</span>
                    </div>
                </Section>
                {output.error && (
                    <Section title="Error">
                        <pre className="font-mono text-[11px] text-red-400 whitespace-pre-wrap break-all bg-red-500/5 border border-red-500/20 rounded-[8px] p-3">
                            {output.error}
                        </pre>
                    </Section>
                )}
            </div>
        )
    }

    return (
        <div className="space-y-5">
            <Section title="Requests">
                <p className="font-mono text-[11px] text-muted">
                    {output.cases.length} requests · {output.durationMs} ms
                </p>
                <ul className="space-y-3">
                    {output.cases.map((c, i) => <HttpCaseCard key={i} c={c} />)}
                </ul>
            </Section>

            {output.logs.length > 0 && (
                <Section title="Console">
                    <pre className="font-mono text-[11px] text-muted whitespace-pre-wrap break-all bg-ink/5 border border-ink/10 rounded-[8px] p-3 max-h-48 overflow-auto">
                        {output.logs.join('\n')}
                    </pre>
                </Section>
            )}
        </div>
    )
}

export function RunPanel({ output }: { output: RunOutput | HttpRunOutput }) {
    
    if ('kind' in output) {
        return <HttpRunPanel output={output} />
    }


    const meta = [
        output.rowCount !== undefined && `${output.rowCount} rows`,
        `${output.durationMs} ms`,
    ].filter(Boolean).join(' · ')

    return (
        <div className="space-y-5">
            <Section title="Request">
                <div className="flex items-center gap-2 font-mono text-xs bg-ink/5 border border-ink/10 rounded-[8px] px-3 py-2">
                    <span className="text-accent-magenta font-bold">{output.request.method}</span>
                    <span className="text-ink">{output.request.target}</span>
                </div>
            </Section>

            <Section title="Status">
                <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-[6px] border font-mono text-xs font-bold ${statusStyle(output.status)}`}>
                        {output.status} {output.statusText}
                    </span>
                    <span className="font-mono text-[11px] text-muted">{meta}</span>
                </div>
            </Section>

            {output.error ? (
                <Section title="Error">
                    <pre className="font-mono text-[11px] text-red-400 whitespace-pre-wrap break-all bg-red-500/5 border border-red-500/20 rounded-[8px] p-3">
                        {output.error}
                    </pre>
                </Section>
            ) : (
                <Section title="Response body">
                    <pre className="font-mono text-[11px] text-ink bg-ink/5 border border-ink/10 rounded-[8px] p-3 max-h-[420px] overflow-auto">
                        {JSON.stringify(output.body, null, 2) ?? 'undefined'}
                    </pre>
                    {output.rowCount !== undefined && output.rowCount > 50 && (
                        <p className="font-mono text-[10px] text-muted">แสดง 50 แถวแรกจากทั้งหมด {output.rowCount} แถว</p>
                    )}
                </Section>
            )}
        </div>
    )
}