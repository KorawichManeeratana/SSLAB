type Case = {
    name?: string
    pass: boolean
    reason?: string
    error?: string
    expectedRows?: number
    actualRows?: number | string
    actual?: unknown
}

type Props = {
    data: any
    running: null | 'run' | 'submit'
}

const VERDICT_LABEL: Record<string, { text: string; className: string }> = {
    ACCEPTED: { text: 'ผ่าน', className: 'bg-green-500/15 text-green-400 border-green-500/40' },
    WRONG_ANSWER: { text: 'คำตอบไม่ถูกต้อง', className: 'bg-red-500/15 text-red-400 border-red-500/40' },
    TLE: { text: 'เกินเวลา', className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/40' },
    MLE: { text: 'ใช้หน่วยความจำเกิน', className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/40' },
    RUNTIME_ERROR: { text: 'โค้ด error', className: 'bg-red-500/15 text-red-400 border-red-500/40' },
    SYSTEM_ERROR: { text: 'ระบบขัดข้อง', className: 'bg-ink/10 text-muted border-ink/20' },
}

export function ResultPanel({ data, running }: Props) {
    if (running) {
        return <p className="text-muted">{running === 'submit' ? 'กำลังส่งและตรวจ...' : 'กำลังรัน...'}</p>
    }
    if (!data) {
        return <p className="text-muted">กด RUN เพื่อทดสอบ หรือ SUBMIT เพื่อส่งงาน</p>
    }
    if (data.error) {
        return <p className="text-red-400">{data.error}</p>
    }

    const verdict = VERDICT_LABEL[data.verdict] ?? VERDICT_LABEL.SYSTEM_ERROR
    const cases: Case[] = data.result?.cases ?? []

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded-[6px] border font-mono text-xs font-bold ${verdict.className}`}>
                    {verdict.text}
                </span>
                <span className="font-mono text-xs text-muted">
                    {data.result?.passed ?? 0}/{(data.result?.passed ?? 0) + (data.result?.failed ?? 0)} ผ่าน
                </span>
                {data.attempt && (
                    <span className="font-mono text-xs text-muted">ครั้งที่ {data.attempt}</span>
                )}
            </div>

            {data.result?.systemError && (
                <p className="text-muted text-sm">{data.result.systemError}</p>
            )}

            <ul className="space-y-2">
                {cases.map((c, i) => (
                    <li key={i} className="rounded-[8px] border border-ink/10 bg-ink/5 p-3 space-y-1">
                        <div className="flex items-center gap-2 font-mono text-xs">
                            <span className={c.pass ? 'text-green-400' : 'text-red-400'}>{c.pass ? '✓' : '✗'}</span>
                            <span className="text-ink">{c.name ?? `Test ${i + 1}`}</span>
                        </div>
                        {c.reason && <p className="font-mono text-[11px] text-muted break-all">{c.reason}</p>}
                        {c.error && <p className="font-mono text-[11px] text-red-400 break-all">{c.error}</p>}
                        {c.expectedRows !== undefined && (
                            <p className="font-mono text-[11px] text-muted">
                                ควรได้ {c.expectedRows} แถว · ได้ {c.actualRows} แถว
                            </p>
                        )}

                        {c.actual !== undefined && (
                            <details className="pt-1" open={!c.pass}>
                                <summary className="font-mono text-[11px] text-muted cursor-pointer">ผลลัพธ์ของคุณ</summary>
                                <pre className="mt-2 max-h-64 overflow-auto rounded-[6px] bg-ink/5 p-2 font-mono text-[11px] text-ink">
                                    {JSON.stringify(c.actual, null, 2)}
                                </pre>
                            </details>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    )
}