import type { ELK, ElkEdgeSection, ElkNode } from 'elkjs/lib/elk-api'
import type { LearningMapFixture } from './types'
import { getLearningScopeRelations } from './scopeRelations'
import { NODE_HEIGHT, NODE_WIDTH, type LayoutDirection, type LayoutPoint,
  type LayoutPortSide, type LearningLayoutEdge, type LearningLayoutOptions,
  type LearningScopeLayout } from './layoutTypes'

type EdgeDefinition = Omit<LearningLayoutEdge, 'points'>

function sectionPoints(sections: ElkEdgeSection[]): LayoutPoint[] {
  if (sections.length === 0) throw new Error('ELK returned an edge without a route')
  const ordered: ElkEdgeSection[] = []
  let current = sections.find(section => !section.incomingSections?.length)
  const visited = new Set<string>()
  while (current && !visited.has(current.id)) {
    visited.add(current.id)
    ordered.push(current)
    if ((current.outgoingSections?.length ?? 0) > 1) throw new Error('Unexpected branched sibling edge')
    const next = current.outgoingSections?.[0]
    current = next ? sections.find(section => section.id === next) : undefined
  }
  if (ordered.length !== sections.length) throw new Error('ELK returned disconnected edge sections')
  return ordered.flatMap(section => [section.startPoint, ...(section.bendPoints ?? []), section.endPoint])
    .filter((point, index, all) => index === 0 || point.x !== all[index - 1].x || point.y !== all[index - 1].y)
    .map(point => ({ x: point.x, y: point.y }))
}

/** Pure graph/route boundary shared by the real Worker and geometry checks. */
export async function computeLearningScopeLayout(
  elk: Pick<ELK, 'layout'>,
  fixture: LearningMapFixture,
  scopeId: string,
  direction: LayoutDirection,
  options: LearningLayoutOptions = {},
): Promise<LearningScopeLayout> {
  const scope = fixture.entries[scopeId]
  if (!scope) throw new Error(`Unknown learning-map scope: ${scopeId}`)
  const ids = [...(scope.children ?? [])].sort()
  if (new Set(ids).size !== ids.length) throw new Error(`Duplicate child in scope: ${scopeId}`)
  const siblings = new Set(ids)
  const nodeWidth = options.nodeWidth ?? NODE_WIDTH
  const nodeHeight = options.nodeHeight ?? NODE_HEIGHT
  if (!Number.isFinite(nodeWidth) || !Number.isFinite(nodeHeight) || nodeWidth <= 0 || nodeHeight <= 0) {
    throw new Error('Learning-map node dimensions must be positive finite values')
  }
  if (ids.length === 0) return { positions: {}, ports: {}, edges: [], width: 0, height: 0 }

  ids.forEach(target => {
    const entry = fixture.entries[target]
    if (!entry || entry.id !== target) throw new Error(`Missing or conflicting sibling entry: ${target}`)
    const local = entry.requires.filter(id => siblings.has(id)).sort()
    if (new Set(local).size !== local.length) throw new Error(`Duplicate prerequisite on ${target}`)
  })
  const relations = [...getLearningScopeRelations(fixture, scopeId)].sort((left, right) => {
    const a = `${left.target}\u0000${left.source}`
    const b = `${right.target}\u0000${right.source}`
    return a < b ? -1 : a > b ? 1 : 0
  })
  const edges: EdgeDefinition[] = relations.map(({ source, target }) => {
    if (!siblings.has(source) || !siblings.has(target) || source === target) throw new Error('Invalid scope relation')
    const id = `sibling:${source}->${target}`
    return { id, source, target, sourceHandle: `out:${id}`, targetHandle: `in:${id}` }
  })
  const sourceSide: LayoutPortSide = direction === 'RIGHT' ? 'EAST' : 'SOUTH'
  const targetSide: LayoutPortSide = direction === 'RIGHT' ? 'WEST' : 'NORTH'
  const portSides = new Map<string, LayoutPortSide>()

  const graph: ElkNode = {
    id: `scope:${scopeId}`,
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': direction,
      'elk.edgeRouting': 'ORTHOGONAL',
      'elk.randomSeed': '17',
      'elk.padding': '[top=24,left=24,bottom=24,right=24]',
      'elk.spacing.nodeNode': '34',
      'elk.spacing.edgeNode': '20',
      'elk.spacing.edgeEdge': '10',
      'elk.spacing.componentComponent': '50',
      'elk.layered.spacing.nodeNodeBetweenLayers': '76',
      'elk.layered.spacing.edgeNodeBetweenLayers': '22',
      'elk.layered.spacing.edgeEdgeBetweenLayers': '12',
      'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
      'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
      'elk.layered.mergeEdges': 'false',
      'elk.separateConnectedComponents': 'true',
    },
    children: ids.map(id => ({
      id, width: nodeWidth, height: nodeHeight,
      layoutOptions: { 'elk.portConstraints': 'FIXED_SIDE', 'elk.nodeSize.constraints': '[]' },
      ports: edges.flatMap(edge => {
        const portId = edge.source === id ? edge.sourceHandle : edge.target === id ? edge.targetHandle : null
        if (!portId) return []
        const side = edge.source === id ? sourceSide : targetSide
        portSides.set(portId, side)
        return [{ id: portId, width: 0, height: 0, layoutOptions: { 'elk.port.side': side } }]
      }),
    })),
    edges: edges.map(edge => ({ id: edge.id, sources: [edge.sourceHandle], targets: [edge.targetHandle] })),
  }

  const result = await elk.layout(graph)
  const positions: LearningScopeLayout['positions'] = {}
  const ports: LearningScopeLayout['ports'] = {}
  for (const node of result.children ?? []) {
    if (!Number.isFinite(node.x) || !Number.isFinite(node.y)) throw new Error(`Missing ELK position: ${node.id}`)
    positions[node.id] = { x: node.x!, y: node.y! }
    ports[node.id] = (node.ports ?? []).map(port => {
      if (!Number.isFinite(port.x) || !Number.isFinite(port.y)) throw new Error(`Missing ELK port: ${port.id}`)
      return { id: port.id, x: port.x!, y: port.y!, side: portSides.get(port.id)! }
    })
  }
  if (Object.keys(positions).length !== ids.length) throw new Error('ELK omitted visible siblings')
  const routes = new Map((result.edges ?? []).map(edge => [edge.id, edge]))
  return {
    positions, ports,
    edges: edges.map(edge => ({ ...edge, points: sectionPoints(routes.get(edge.id)?.sections ?? []) })),
    width: result.width ?? 0, height: result.height ?? 0,
  }
}
