import type { RunOutput } from '@/type/grading'

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

export function RunPanel({ output }: { output: RunOutput }) {
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