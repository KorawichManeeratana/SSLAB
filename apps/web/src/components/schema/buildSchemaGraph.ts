import { MarkerType, type Edge, type Node } from '@xyflow/react'
import type { DbExplorerData, ExplorerTable } from '@/type/db-explorer'

export type TableNodeData = { table: ExplorerTable }
export type TableNode = Node<TableNodeData, 'table'>

const COL_GAP = 320      // ระยะห่างแนวนอนระหว่างคอลัมน์ของตาราง
const ROW_GAP = 48       // ระยะห่างแนวตั้งระหว่างตารางในคอลัมน์เดียวกัน
const HEADER_H = 44
const ROW_H = 30

// ตารางที่ไม่ชี้ไปหาตารางอื่น = level 0, ตารางที่มี FK ไปหาตาราง level n = n + 1
function levelOf(name: string, data: DbExplorerData, seen = new Set<string>()): number {
  if (seen.has(name)) return 0 // กันวนลูปกรณีตารางชี้หากัน
  seen.add(name)
  const t = data.tables.find((x) => x.name === name)
  const refs = t?.columns.flatMap((c) => (c.references ? [c.references.table] : [])) ?? []
  if (refs.length === 0) return 0
  return 1 + Math.max(...refs.map((r) => levelOf(r, data, new Set(seen))))
}

export function buildSchemaGraph(data: DbExplorerData): { nodes: TableNode[]; edges: Edge[] } {
  const levels = new Map(data.tables.map((t) => [t.name, levelOf(t.name, data)]))
  const maxLevel = Math.max(0, ...levels.values())
  const yCursor = new Map<number, number>()

  // ตารางที่มี FK อยู่ทางซ้าย ตารางที่ถูกอ้างถึงอยู่ทางขวา → เส้นวิ่งจากซ้ายไปขวา
  const nodes: TableNode[] = data.tables.map((table) => {
    const level = levels.get(table.name) ?? 0
    const col = maxLevel - level
    const y = yCursor.get(col) ?? 0
    yCursor.set(col, y + HEADER_H + table.columns.length * ROW_H + ROW_GAP)
    return { id: table.name, type: 'table', position: { x: col * COL_GAP, y }, data: { table } }
  })

  const edges: Edge[] = data.tables.flatMap((table) =>
    table.columns
      .filter((c) => c.references)
      .map((c) => ({
        id: `${table.name}.${c.name}->${c.references!.table}.${c.references!.column}`,
        source: table.name,
        sourceHandle: `${c.name}-out`,
        target: c.references!.table,
        targetHandle: `${c.references!.column}-in`,
        type: 'smoothstep',
        style: { stroke: 'var(--color-accent-magenta, #d946ef)', strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--color-accent-magenta, #d946ef)' },
      })),
  )

  return { nodes, edges }
}