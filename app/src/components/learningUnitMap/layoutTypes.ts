export const NODE_WIDTH = 220
export const NODE_HEIGHT = 72

export type LayoutDirection = 'RIGHT' | 'DOWN'
export type LayoutPoint = { x: number; y: number }
export type LayoutPortSide = 'WEST' | 'EAST' | 'NORTH' | 'SOUTH'

/** Port coordinates are relative to the card, and denote the connection point. */
export type LayoutPort = LayoutPoint & { id: string; side: LayoutPortSide }

export type LearningLayoutEdge = {
  id: string
  source: string
  target: string
  sourceHandle: string
  targetHandle: string
  points: LayoutPoint[]
  /**
   * Unit maps only: a Rückgriff laid out along the declared order. `source`
   * and `target` follow the layout; the relation runs from target to source,
   * so its arrowhead belongs at the start of the route.
   */
  reversed?: true
}

export type LearningScopeLayout = {
  positions: Record<string, LayoutPoint>
  ports: Record<string, LayoutPort[]>
  edges: LearningLayoutEdge[]
  width: number
  height: number
}

export type LearningLayoutOptions = { nodeWidth?: number; nodeHeight?: number }
