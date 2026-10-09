import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { TableNode } from './buildSchemaGraph'

// จุดเชื่อมเส้น (Handle) ไม่ต้องให้เห็น แต่ต้องมีอยู่ ไม่งั้นวาดเส้น FK ไม่ได้
const hiddenHandle = { opacity: 0, width: 6, height: 6, minWidth: 0, minHeight: 0, border: 0 }

export function TableNodeView({ data }: NodeProps<TableNode>) {
  const { table } = data
  return (
    <div className="min-w-[220px] rounded-[10px] border border-ink/15 bg-surface shadow-lg font-mono text-xs overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-ink/10 bg-ink/5">
        <span className="font-bold text-ink">{table.name}</span>
        <span className="text-[10px] text-muted">{table.rowCount} rows</span>
      </div>
      {table.columns.map((c) => (
        <div key={c.name} className="relative flex items-center justify-between gap-4 px-3 h-[30px] border-b border-ink/5 last:border-b-0">
          <Handle type="target" position={Position.Left} id={`${c.name}-in`} style={hiddenHandle} isConnectable={false} />
          <span className="flex items-center gap-2">
            {c.primaryKey && <span className="text-[9px] font-bold text-accent-cyan">PK</span>}
            {c.references && <span className="text-[9px] font-bold text-accent-magenta">FK</span>}
            <span className={c.primaryKey ? 'text-accent-cyan' : 'text-ink'}>{c.name}</span>
          </span>
          <span className="text-[10px] text-muted">
            {c.type}
            {c.notNull && !c.primaryKey && <span className="text-muted/60"> · NN</span>}
          </span>
          <Handle type="source" position={Position.Right} id={`${c.name}-out`} style={hiddenHandle} isConnectable={false} />
        </div>
      ))}
    </div>
  )
}