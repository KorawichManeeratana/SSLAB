import { notFound } from 'next/navigation'
import { getExerciseById } from '../../../repositories/exercise.repository'
import ProblemWorkspace from '@/components/ProblemWorkspace'
import { Header } from "@/components/header";
import { getCurrentUserId } from '@/lib/current-user';
import { getLatestCode } from '@/app/repositories/submission.repository';
import { getExerciseForGrading } from '../../../repositories/exercise.repository';
import { computeExpectedOutput } from '../../../services/expectedOutput.services';



export default async function ProblemPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const exerciseId = Number(id)
    if (!Number.isInteger(exerciseId)) notFound()

    const exercise = await getExerciseById(exerciseId)
    if (!exercise) notFound()

    const userId = await getCurrentUserId()
    const latestCode = await getLatestCode(userId, exercise.id)

    const grading = await getExerciseForGrading(exercise.id)
    let expectedOutput: unknown[] | null = null
    try {
        expectedOutput = grading
            ? computeExpectedOutput(grading.exc_schema, grading.exc_seed, grading.exc_solution)
            : null
    } catch {
        expectedOutput = null   // ถ้าเฉลยพัง หน้าโจทย์ยังต้องเปิดได้
    }

    return <div>
        <Header />
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 lg:min-h-[calc(100vh-4rem)] mt-4">

            <aside className="panel lg:col-span-3">
                <div className="panel-header">
                    <h2 className="panel-title">
                        <span className="icon">&sect;</span>
                        Problem Brief
                    </h2>
                    <span className="lab-id-tag">LAB_{String(exercise.id).padStart(2, '0')}</span> {/* ต้องเปลี่ยนเป็นตาม lab */}
                </div>

                <div className="panel-content space-y-6">
                    <div className="space-y-2">
                        <h3 className="font-display text-2xl font-bold text-ink leading-tight">{exercise.exc_name}</h3>
                        <div className="flex items-center space-x-4 font-mono text-xs">
                            <span className="text-accent-magenta">Difficulty: {exercise.exc_difficulty}</span> {/* ต้องเปลี่ยนตามระดับความอยาก */}
                            <span className="text-muted">Reward: +35 XP</span> {/* ต้องเปลี่ยน */}
                        </div>
                    </div>

                    <p className="text-muted leading-relaxed"> {/* ต้องเปลี่ยนตาม Description ของโจทย์ */}
                        {exercise.exc_description}
                    </p>
                    <div className="space-y-3">
                        {/* <h4 className="font-mono text-sm uppercase tracking-widest text-accent-cyan">Objective 1: API Behaviour</h4>
                        <div className="flex items-center gap-2 font-mono text-xs bg-ink/5 border border-ink/5 rounded-[8px] px-3 py-2 overflow-x-auto whitespace-nowrap">
                            <span className="text-accent-magenta font-bold">GET</span>
                            <span className="text-ink">/api/employees?department=IT</span>
                        </div>
                        <ul className="list-disc list-inside space-y-2 text-muted pl-1 leading-relaxed">
                            <li>Answer
                                <code className="font-mono bg-ink/5 px-1.5 py-0.5 rounded text-xs text-ink">200</code>
                                with a JSON array of the employees in that department.
                            </li>
                        </ul>
                        <div className="space-y-3">
                            <h4 className="font-mono text-sm uppercase tracking-widest text-accent-cyan">Objective 2: ORM Query</h4>
                            <p className="text-muted leading-relaxed">Resolve the relation inside
                                <code className="font-mono bg-ink/5 px-1.5 py-0.5 rounded text-xs text-ink">findMany()</code>
                                with a nested <code className="font-mono bg-ink/5 px-1.5 py-0.5 rounded text-xs text-ink">where</code>
                                on <code className="font-mono bg-ink/5 px-1.5 py-0.5 rounded text-xs text-ink">department.name</code>
                                . Fetching every row and filtering in JavaScript fails the query-count check.
                            </p>
                        </div> */}

                        <div className="space-y-2">
                            <h4 className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted/70">Expected response</h4>
                            <div className="font-mono text-[11px] leading-relaxed bg-ink/5 border border-ink/5 rounded-[8px] p-3 text-muted overflow-x-auto">
                                <div><span className="status-badge status-pass">200 OK</span></div>
                                <div className="mt-2 text-accent-cyan">[</div>
                                <div className="pl-3 whitespace-nowrap"> {/* ผลลัพธ์ตัวอย่างในรูปแบบ JSON */}
                                    {expectedOutput && (
                                        <div className="space-y-2">
                                            <h4 className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted/70">Expected output</h4>
                                            <pre className="font-mono text-[11px] leading-relaxed bg-ink/5 border border-ink/5 rounded-[8px] p-3 text-muted overflow-x-auto max-h-64">
                                                {JSON.stringify(expectedOutput, null, 2)}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                                <div className="text-accent-cyan">]</div>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
            <ProblemWorkspace
                exerciseId={exercise.id}
                starterCode={latestCode ?? exercise.exc_anwser_field ?? ''}
            />
        </main>
    </div>
}

