import { STATUS_CODES } from 'node:http'

type Props = {
    example: {
        method: string
        path: string
        body: unknown
        expected_status: number
        expected_body: unknown
    }
}

// แสดงกรณีทดสอบแรกของโจทย์ HTTP เป็นตัวอย่าง request/response
// ใช้ใน Server Component เท่านั้น (import จาก node:http)
export function ExampleCase({ example }: Props) {
    const ok = example.expected_status >= 200 && example.expected_status < 300

    return (
        <section className="space-y-2">
            <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted/70">Example</h3>
            <div className="rounded-[8px] border border-ink/10 bg-ink/5 p-3 space-y-2 font-mono text-xs">
                <div className="flex items-center gap-2">
                    <span className="text-accent-magenta font-bold">{example.method}</span>
                    <span className="text-ink break-all">{example.path}</span>
                </div>

                {example.body != null && (
                    <pre className="text-[11px] text-muted whitespace-pre-wrap break-all">
                        {JSON.stringify(example.body, null, 2)}
                    </pre>
                )}

                <div className={ok ? 'text-green-400 font-bold' : 'text-yellow-400 font-bold'}>
                    {example.expected_status} {STATUS_CODES[example.expected_status] ?? ''}
                </div>

                {example.expected_body != null && (
                    <pre className="text-[11px] text-ink whitespace-pre-wrap break-all">
                        {JSON.stringify(example.expected_body, null, 2)}
                    </pre>
                )}
            </div>
        </section>
    )
}