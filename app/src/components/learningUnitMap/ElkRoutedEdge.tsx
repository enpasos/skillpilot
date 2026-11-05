import { BaseEdge, type Edge, type EdgeProps } from '@xyflow/react'
import type { LayoutPoint } from './layoutTypes'
import { elkRoutePath } from './edgePath'

type RoutedEdge = Edge<{ points: LayoutPoint[] }>

export function ElkRoutedEdge({ id, data, style, markerStart, markerEnd, interactionWidth }: EdgeProps<RoutedEdge>) {
  if (!data?.points || data.points.length < 2) return null
  return <BaseEdge id={id} path={elkRoutePath(data.points)} style={style}
    markerStart={markerStart} markerEnd={markerEnd} interactionWidth={interactionWidth ?? 12} />
}
