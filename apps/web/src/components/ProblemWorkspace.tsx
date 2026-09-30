"use client"
import { CodeEditor } from "@/components/CodeEditor";
import { useState } from "react";
import { ResultPanel } from "./ResultPanel";

type Props = {
    exerciseId: number
    starterCode: string
}


export default function ProblemWorkspace({ exerciseId, starterCode }: Props) {
    const [code, setCode] = useState(starterCode ?? '')
    const [result, setResult] = useState<any>(null)
    const [running, setRunning] = useState<null | 'run' | 'submit'>(null)


    async function send(kind: 'run' | 'submit') {
        setRunning(kind)
        setResult(null)
        try {
            const res = await fetch(`/api/problems/${exerciseId}/${kind}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code }),
            })
            setResult(await res.json())
        } catch {
            setResult({ error: 'เชื่อมต่อ server ไม่ได้' })
        } finally {
            setRunning(null)
        }
    }

    return (
        <>
            {/* ตรงกลาง */}
            <div className="lg:col-span-6 grid gap-4 grid-rows-[auto_auto] lg:grid-rows-[minmax(620px,1fr)_auto] min-h-0">
                <section className="panel min-h-0">
                    <div className="panel-header">
                        <h2 className="panel-title">
                            <span className="icon">JS</span>
                            Editor
                        </h2>
                        <div className="flex items-center gap-3">
                            <span className="hidden md:inline font-mono text-[10px] uppercase tracking-[0.18em] text-muted/70">server restarts on run</span>
                            <button className="run-button" onClick={() => send('run')} disabled={running !== null}>
                                {running ? 'RUNNING...' : <>&#9656; RUN_QUERY</>}
                            </button>
                            <button className="run-button" onClick={() => send('submit')} disabled={running !== null}>
                                {running === 'submit' ? 'SUBMITTING...' : 'SUBMIT'}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-stretch gap-1 px-2 pt-2 font-mono text-[11px] bg-surface-2 border-b border-ink/10"> {/* ต้องแก้ตามหน้าโจทย์ */}
                        <span className="-mb-px px-3 py-2 rounded-t-[6px] border border-b-0 border-ink/10 bg-surface text-accent-cyan font-bold">
                            routes/employees.js
                        </span>
                    </div>

                    <div className="flex-1 min-h-0">
                        <CodeEditor value={code} onChange={setCode} />
                    </div>


                </section>

                <section className="panel">
                    <div className="panel-header">
                        <h2 className="panel-title">
                            <span className="icon">Db</span>
                            Database Explorer
                        </h2>
                    </div>

                    <div className="flex items-center gap-1 p-0.5 rounded-[8px] border border-ink/10 bg-surface/60 font-mono text-[10px] uppercase">
                        <button className="px-2.5 py-1 rounded-[6px] border border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan font-bold tracking-[0.15em]">Data</button>
                        <button className="px-2.5 py-1 rounded-[6px] border border-transparent text-muted hover:text-ink tracking-[0.15em] transition-colors">Schema</button>
                    </div>
                </section>
            </div>


            {/* ทางขวาแสดงผลลัพธ์ที่ได้ */}
            <section className="panel lg:col-span-3">
                <div className="panel-header">
                    <h2 className="panel-title">Result</h2>
                </div>
                <div className="panel-content">
                    <ResultPanel data={result} running={running} />
                </div>
            </section>
        </>
    )
}