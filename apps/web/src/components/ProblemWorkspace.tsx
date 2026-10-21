"use client"
import { CodeEditor } from "@/components/CodeEditor";
import { useState } from "react";
import { RunPanel } from './RunPanel'
import { ResultPanel } from "./ResultPanel";
import { DatabaseExplorer } from "./databaseExplorer";
import { DbExplorerData } from "@/type/db-explorer";
import { useRouter } from 'next/navigation'
import type { RunOutput, HttpRunOutput } from '@/type/grading'
import type { GradingEngine } from '@/type/grading'


type Props = {
    exerciseId: number
    starterCode: string
    explorer: DbExplorerData | null
    engine: GradingEngine
}


const ENGINE_UI: Record<GradingEngine, { runLabel: string; fileName: string; hint?: string }> = {
    QUERY: { runLabel: 'RUN_QUERY', fileName: 'query.js' },
    HTTP: { runLabel: 'SEND_REQUESTS', fileName: 'app.js', hint: 'server restarts on run' },
}


export default function ProblemWorkspace({ exerciseId, starterCode, explorer, engine }: Props) {
    const ui = ENGINE_UI[engine]
    const [code, setCode] = useState(starterCode ?? '')
    const [result, setResult] = useState<any>(null)
    const [runOutput, setRunOutput] = useState<RunOutput | HttpRunOutput | null>(null)
    const [running, setRunning] = useState<null | 'run' | 'submit'>(null)
    const router = useRouter()

    async function send(kind: 'run' | 'submit') {
        setRunning(kind)
        setResult(null)
        try {
            const res = await fetch(`/api/problems/${exerciseId}/${kind}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code }),
            })
            const data = await res.json()

            if (kind === 'submit' && res.ok && data.submissionId) {
                router.push(`/submissions/${data.submissionId}`)
                return
            }
            setResult({ kind, data })
        } catch {
            setResult({ kind, data: { error: '...' } })
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
                            {ui.hint && (
                                <span className="hidden md:inline font-mono text-[10px] uppercase tracking-[0.18em] text-muted/70">{ui.hint}</span>
                            )}
                            <button className="run-button" onClick={() => send('run')} disabled={running !== null}>
                                {running ? 'RUNNING...' : <>&#9656; {ui.runLabel}</>}
                            </button>
                            <button className="run-button" onClick={() => send('submit')} disabled={running !== null}>
                                {running === 'submit' ? 'SUBMITTING...' : 'SUBMIT'}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-stretch gap-1 px-2 pt-2 font-mono text-[11px] bg-surface-2 border-b border-ink/10"> {/* ต้องแก้ตามหน้าโจทย์ */}
                        <span className="-mb-px px-3 py-2 rounded-t-[6px] border border-b-0 border-ink/10 bg-surface text-accent-cyan font-bold">
                            {ui.fileName}
                        </span>
                    </div>

                    <div className="flex-1 min-h-0">
                        <CodeEditor value={code} onChange={setCode} />
                    </div>


                </section>

                <section className="panel">
                    <DatabaseExplorer data={explorer} />
                </section>
            </div>


            {/* ทางขวาแสดงผลลัพธ์ที่ได้ */}
            <section className="panel lg:col-span-3">
                <div className="panel-header">
                    <h2 className="panel-title">Result</h2>
                </div>
                <div className="panel-content">
                    {running && <p className="text-muted">{running === 'submit' ? 'Grading...' : 'RUNNING...'}</p>}
                    {!running && !result && <p className="text-muted">กด RUN เพื่อดูผลลัพธ์ หรือ SUBMIT เพื่อส่งตรวจ</p>}
                    {!running && result?.data?.error && !result.data.status && (
                        <p className="text-red-400">{result.data.error}</p>
                    )}
                    {!running && result?.kind === 'run' && (result.data.status || result.data.kind === 'http') && <RunPanel output={result.data} />}
                    {!running && result?.kind === 'submit' && !result.data.error && <ResultPanel data={result.data} running={null} />}
                </div>
            </section>
        </>
    )
}