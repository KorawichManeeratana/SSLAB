import 'server-only'
import { DatabaseSync } from 'node:sqlite'
import type { DbExplorerData, ExplorerTable } from '@/type/db-explorer'

const ROW_LIMIT = 100

// ครอบชื่อตาราง/column ด้วย " เพื่อทำให้ใช้ใน SQL ได้อย่างปลอดภัย
const quote = (id: string) => `"${id.replace(/"/g, '""')}"`

function typeLabel(raw: string) {
  const t = (raw || '').toUpperCase()
  if (t.includes('INT')) return 'INT'
  if (t.includes('CHAR') || t.includes('TEXT') || t.includes('CLOB')) return 'STRING'
  if (t.includes('REAL') || t.includes('FLOA') || t.includes('DOUB')) return 'FLOAT'
  if (t.includes('BOOL')) return 'BOOL'
  return t || 'ANY'
}

// ใช้กับ exc_schema / exc_seed ของอาจารย์เท่านั้น — ห้ามส่งโค้ดนักศึกษาเข้ามา!! สำคัญ+++
export function buildDbExplorer(schema: string, seed: string): DbExplorerData {
  const db = new DatabaseSync(':memory:')
  try {
    db.exec(schema)
    db.exec(seed)

    const names = (db
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
      .all() as { name: string }[]).map((r) => r.name)

    const tables: ExplorerTable[] = names.map((name) => {
      const fks = db.prepare(`PRAGMA foreign_key_list(${quote(name)})`).all() as any[]
      const columns = (db.prepare(`PRAGMA table_info(${quote(name)})`).all() as any[]).map((c) => {
        const fk = fks.find((f) => f.from === c.name)
        return {
          name: c.name,
          type: typeLabel(c.type),
          primaryKey: c.pk > 0,
          notNull: c.notnull === 1,
          references: fk ? { table: fk.table, column: fk.to ?? 'id' } : undefined,
        }
      })
      const { n } = db.prepare(`SELECT COUNT(*) AS n FROM ${quote(name)}`).get() as { n: number }
      const rows = (db.prepare(`SELECT * FROM ${quote(name)} LIMIT ${ROW_LIMIT}`).all() as any[])
        .map((r) => ({ ...r }))   // แปลงเป็น object ธรรมดา ส่งเป็น props ได้
      return { name, columns, rowCount: n, rows }
    })

    // ป้ายชื่อของ FK: ใช้ column แรกที่เป็น STRING ของตารางปลายทาง (เช่น name)
    for (const table of tables) {
      for (const col of table.columns) {
        if (!col.references) continue
        const ref = tables.find((t) => t.name === col.references!.table)
        const labelCol = ref?.columns.find((c) => c.type === 'STRING')?.name
        if (!ref || !labelCol) continue
        const pairs = db
          .prepare(`SELECT ${quote(col.references.column)} AS k, ${quote(labelCol)} AS v FROM ${quote(ref.name)}`)
          .all() as { k: unknown; v: unknown }[]
        col.references.labels = Object.fromEntries(pairs.map((p) => [String(p.k), String(p.v)]))
      }
    }

    return { tables }
  } finally {
    db.close()
  }
}