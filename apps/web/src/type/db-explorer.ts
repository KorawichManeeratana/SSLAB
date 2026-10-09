export type ExplorerColumn = {
  name: string
  type: string // เช่น INT, STRING, FLOAT, ...
  primaryKey: boolean
  notNull: boolean
  references?: {
    table: string
    column: string
    labels?: Record<string, string>   // ค่า FK → ชื่อที่แสดง เช่น "1" → "IT"
  }
}

export type ExplorerTable = {
  name: string
  columns: ExplorerColumn[]
  rowCount: number
  rows: Record<string, unknown>[]
}

export type DbExplorerData = {
  tables: ExplorerTable[]
}