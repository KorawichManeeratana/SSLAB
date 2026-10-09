export type RunOutput = {
  request: { method: string; target: string }
  status: number
  statusText: string
  durationMs: number
  rowCount?: number
  body?: unknown
  error?: string
}

export type Verdict =
  | 'ACCEPTED'
  | 'WRONG_ANSWER'
  | 'TLE'
  | 'MLE'
  | 'RUNTIME_ERROR'
  | 'SYSTEM_ERROR'