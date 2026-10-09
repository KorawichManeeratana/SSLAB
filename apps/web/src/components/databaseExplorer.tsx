'use client'
import { useState } from 'react'
import type { DbExplorerData, ExplorerColumn } from '@/type/db-explorer'
import { SchemaDiagram } from './schema/SchemaDiagram'

function columnMeta(c: ExplorerColumn) {
  if (c.references) {
    return {
      text: `${c.type} · FK → ${c.references.table}.${c.references.column}`.toUpperCase(),
      className: 'text-accent-magenta',
    }
  }
  if (c.primaryKey) return { text: `${c.type} · PK`, className: 'text-accent-cyan' }
  return { text: c.type, className: 'text-muted' }
}

function Cell({ value, column }: { value: unknown; column: ExplorerColumn }) {
  if (value === null || value === undefined) return <span className="text-muted/50 italic">NULL</span>
  const label = column.references?.labels?.[String(value)]
  return (
    <>
      <span className={column.primaryKey ? 'text-muted' : 'text-ink'}>{String(value)}</span>
      {label && <span className="text-muted/60"> → {label}</span>}
    </>
  )
}

export function DatabaseExplorer({ data }: { data: DbExplorerData | null }) {
  const [view, setView] = useState<'data' | 'schema'>('data')
  const [active, setActive] = useState(data?.tables[0]?.name ?? '')

  const table = data?.tables.find((t) => t.name === active)
  const relations = table?.columns.filter((c) => c.references) ?? []

  return (
    <section className="panel">
      <div className="panel-header">
        <h2 className="panel-title">
          <span className="icon">DB</span>
          Database Explorer
        </h2>
        <div className="flex items-center gap-1 p-0.5 rounded-[8px] border border-ink/10 bg-surface/60 font-mono text-[10px] uppercase">
          {(['data', 'schema'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-2.5 py-1 rounded-[6px] border tracking-[0.15em] transition-colors ${view === v
                  ? 'border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan font-bold'
                  : 'border-transparent text-muted hover:text-ink'
                }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {!data || data.tables.length === 0 ? (
        <p className="p-4 text-muted text-sm">ไม่มีข้อมูลตารางสำหรับโจทย์นี้</p>
      ) : (
        <>
          {/* แถบเลือกตาราง */}
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-ink/10">
            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted/70 mr-1">Tables</span>
              {data.tables.map((t) => (
                <button
                  key={t.name}
                  onClick={() => setActive(t.name)}
                  className={`px-3 py-1 rounded-full border font-mono text-xs whitespace-nowrap transition-colors ${t.name === active
                      ? 'border-accent-cyan/50 bg-accent-cyan/10 text-accent-cyan'
                      : 'border-ink/15 text-muted hover:text-ink'
                    }`}
                >
                  {t.name} <span className="opacity-60">{t.rowCount}</span>
                </button>
              ))}
            </div>
            <span className="font-mono text-[10px] text-muted/60 whitespace-nowrap">sqlite · seeded</span>
          </div>

          {view === 'data' && table && (
            <>
              <div className="overflow-auto max-h-[360px]">
                <table className="w-full font-mono text-xs">
                  <thead className="sticky top-0 bg-surface">
                    <tr className="border-b border-ink/10">
                      {table.columns.map((c) => {
                        const meta = columnMeta(c)
                        return (
                          <th key={c.name} className="text-left font-normal px-4 py-2.5">
                            <div className="text-ink font-bold">{c.name}</div>
                            <div className={`text-[10px] tracking-wide ${meta.className}`}>{meta.text}</div>
                          </th>
                        )
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {table.rows.map((row, i) => (
                      <tr key={i} className="border-b border-ink/5 odd:bg-ink/[0.02] hover:bg-accent-cyan/5">
                        {table.columns.map((c) => (
                          <td key={c.name} className="px-4 py-2.5 whitespace-nowrap">
                            <Cell value={row[c.name]} column={c} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {table.rowCount > table.rows.length && (
                <p className="px-4 py-2 font-mono text-[10px] text-muted">
                  แสดง {table.rows.length} แถวแรกจากทั้งหมด {table.rowCount} แถว
                </p>
              )}

              {relations.length > 0 && (
                <div className="px-4 py-3 border-t border-ink/10 font-mono text-[11px] space-y-1">
                  {relations.map((c) => (
                    <div key={c.name}>
                      <span className="uppercase tracking-[0.2em] text-[10px] text-muted/70 mr-3">Relation</span>
                      <span className="text-ink">{table.name}.{c.name}</span>
                      <span className="text-accent-magenta"> → </span>
                      <span className="text-ink">{c.references!.table}.{c.references!.column}</span>
                      <span className="text-muted/60"> // </span>
                      <span className="text-accent-cyan">many-to-one</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {view === 'schema' && (
            <div className="h-[360px] w-full">
              <SchemaDiagram data={data} />
            </div>
          )}
        </>
      )}
    </section>
  )
}