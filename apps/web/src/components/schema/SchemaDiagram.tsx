'use client'
import { useMemo } from 'react'
import { ReactFlow, Background, Controls, type ColorMode } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import type { DbExplorerData } from '@/type/db-explorer'
import { buildSchemaGraph } from './buildSchemaGraph'
import { TableNodeView } from './TableNodeView'

// ต้องประกาศนอก component ไม่งั้น React Flow จะสร้าง node ใหม่ทุกครั้งที่ render
const nodeTypes = { table: TableNodeView }

type Props = {
  data: DbExplorerData
  colorMode?: ColorMode
}

export function SchemaDiagram({ data, colorMode = 'dark' }: Props) {
  const { nodes, edges } = useMemo(() => buildSchemaGraph(data), [data])

  return (
    <ReactFlow
      defaultNodes={nodes}
      defaultEdges={edges}
      nodeTypes={nodeTypes}
      colorMode={colorMode}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      minZoom={0.3}
      maxZoom={2}
      nodesConnectable={false}
      elementsSelectable={false}
    >
      <Background gap={20} size={1} />
      <Controls showInteractive={false} />
    </ReactFlow>
  )
}