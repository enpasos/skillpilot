import React, { useEffect, useState } from 'react'
import {
    ReactFlow,
    Handle,
    Position,
    Background,
    Controls,
    MarkerType,
    ConnectionLineType,
    type NodeProps,
    type Edge,
    type Node,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import ELK from 'elkjs/lib/elk.bundled.js'
import type { UiGoal as Goal } from '../goalTypes'
import { InlineMathText } from './InlineMathText'

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

type PrereqKind = 'direct' | 'inherited'
type PrerequisiteRelationToCurrent = 'direct' | 'inherited' | 'transitive'

export type FullPrerequisiteNode = {
    goal: Goal
    level: number
    relationToCurrent: PrerequisiteRelationToCurrent
}

export type FullPrerequisiteEdge = {
    id: string
    fromId: string
    toId: string
    relation: PrereqKind
}

export type FullPrerequisiteFlowData = {
    nodes: FullPrerequisiteNode[]
    nodesByLevel: Map<number, FullPrerequisiteNode[]>
    orderedLevels: number[]
    edges: FullPrerequisiteEdge[]
}

// ------------------------------------------------------------------
// Custom Node Component
// ------------------------------------------------------------------

type RequiresNodeData = {
    goal: Goal
    isCurrent: boolean
    relationToCurrent: PrerequisiteRelationToCurrent
    mastered: boolean
    labels: {
        direct: string
        inherited: string
        transitive: string
        met: string
        unmet: string
        current: string
    }
    sourcePosition?: Position
    targetPosition?: Position
}

const formatRelationLabel = (
    relation: PrerequisiteRelationToCurrent,
    labels: RequiresNodeData['labels']
) => {
    if (relation === 'direct') return labels.direct
    if (relation === 'inherited') return labels.inherited
    return labels.transitive
}

const RequiresNodeTarget: React.FC<NodeProps<Node<RequiresNodeData>>> = ({ data }) => {
    const { goal, isCurrent, relationToCurrent, mastered, labels } = data

    const status = mastered ? labels.met : labels.unmet
    const statusClass = mastered
        ? 'text-emerald-600 dark:text-emerald-300'
        : 'text-amber-600 dark:text-amber-300'
    const relationLabel = formatRelationLabel(relationToCurrent, labels)

    if (isCurrent) {
        return (
            <div className="w-[300px] shrink-0 rounded-2xl border border-sky-400/60 bg-sky-500/10 p-3 shadow-sm relative">
                <Handle id="top" type="target" position={Position.Top} style={{ opacity: 0 }} />
                <Handle id="right" type="source" position={Position.Right} style={{ opacity: 0 }} />
                <Handle id="bottom" type="source" position={Position.Bottom} style={{ opacity: 0 }} />
                <Handle id="left" type="target" position={Position.Left} style={{ opacity: 0 }} />
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-sky-600 dark:text-sky-300">
                    {labels.current}
                </div>
                <InlineMathText text={goal.title} className="text-sm font-semibold text-text-primary" />
                {goal.description && (
                    <InlineMathText text={goal.description} className="mt-1 line-clamp-4 text-[11px] text-text-secondary" />
                )}
            </div>
        )
    }

    return (
        <div className="w-64 rounded-xl border border-border-color bg-chat-bg px-2.5 py-2 text-left transition-colors hover:border-sky-400/80 relative">
            <Handle id="top" type="target" position={Position.Top} style={{ opacity: 0 }} />
            <Handle id="right" type="source" position={Position.Right} style={{ opacity: 0 }} />
            <Handle id="bottom" type="source" position={Position.Bottom} style={{ opacity: 0 }} />
            <Handle id="left" type="target" position={Position.Left} style={{ opacity: 0 }} />
            <InlineMathText text={goal.title} className="block text-xs font-semibold text-text-primary" />
            <div className="mt-1 flex items-center gap-2 text-[10px] text-text-secondary">
                <span className="rounded-full bg-sidebar-bg px-1.5 py-0.5">{relationLabel}</span>
                <span className={statusClass}>{status}</span>
            </div>
        </div>
    )
}

const nodeTypes = {
    requiresNode: RequiresNodeTarget,
}

// ------------------------------------------------------------------
// Transitive Reduction
// ------------------------------------------------------------------

function transitiveReduce(edges: FullPrerequisiteEdge[]): FullPrerequisiteEdge[] {
    const adjacency = new Map<string, Set<string>>()
    for (const e of edges) {
        const targets = adjacency.get(e.fromId) ?? new Set<string>()
        targets.add(e.toId)
        adjacency.set(e.fromId, targets)
    }

    const isReachableWithout = (source: string, target: string): boolean => {
        const visited = new Set<string>()
        const stack = [...(adjacency.get(source) ?? [])].filter(n => n !== target)
        while (stack.length > 0) {
            const current = stack.pop()!
            if (current === target) return true
            if (visited.has(current)) continue
            visited.add(current)
            for (const next of adjacency.get(current) ?? []) {
                if (!visited.has(next)) stack.push(next)
            }
        }
        return false
    }

    return edges.filter(e => !isReachableWithout(e.fromId, e.toId))
}

// ------------------------------------------------------------------
// ELK Layout
// ------------------------------------------------------------------

const elk = new ELK()

async function getElkLayout(
    nodes: Node[],
    edges: Edge[],
    direction: 'LR' | 'TB'
): Promise<{ nodes: Node[]; edges: Edge[] }> {
    const elkGraph = {
        id: 'root',
        layoutOptions: {
            'elk.algorithm': 'layered',
            'elk.direction': direction === 'LR' ? 'RIGHT' : 'DOWN',
            'elk.spacing.nodeNode': '80',
            'elk.layered.spacing.nodeNodeBetweenLayers': '120',
            'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
            'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
        },
        children: nodes.map((node) => ({
            id: node.id,
            width: node.data.isCurrent ? 300 : 256,
            height: node.data.isCurrent ? 120 : 70,
        })),
        edges: edges.map((edge) => ({
            id: edge.id,
            sources: [edge.source],
            targets: [edge.target],
        })),
    }

    const layoutedGraph = await elk.layout(elkGraph)

    const layoutedNodes = nodes.map((node) => {
        const elkNode = layoutedGraph.children?.find((n) => n.id === node.id)
        return {
            ...node,
            position: {
                x: elkNode?.x ?? 0,
                y: elkNode?.y ?? 0,
            },
        }
    })

    return { nodes: layoutedNodes, edges }
}

// ------------------------------------------------------------------
// Main Component
// ------------------------------------------------------------------

interface RequiresReactFlowBoardProps {
    currentGoal: Goal
    flow: FullPrerequisiteFlowData
    getMastery: (goalId: string) => number
    masteredThreshold: number
    onNavigate: (id: string) => void
    labels: {
        current: string
        direct: string
        inherited: string
        transitive: string
        met: string
        unmet: string
        fullFlowLevel: string
    }
}

export const RequiresReactFlowBoard: React.FC<RequiresReactFlowBoardProps> = ({
    currentGoal,
    flow,
    getMastery,
    masteredThreshold,
    onNavigate,
    labels,
}) => {
    const [direction, setDirection] = useState<'TB' | 'LR'>('LR')
    const [layoutedNodes, setLayoutedNodes] = useState<Node[] | null>(null)
    const [layoutedEdges, setLayoutedEdges] = useState<Edge[] | null>(null)
    const [layoutKey, setLayoutKey] = useState(0)

    // Stable key to detect real changes (avoids re-layout on every render)
    const dataFingerprint = `${currentGoal.id}-${flow.nodes.length}-${flow.edges.length}-${direction}-${masteredThreshold}`

    useEffect(() => {
        let cancelled = false

        const sourcePos = direction === 'LR' ? Position.Right : Position.Bottom
        const targetPos = direction === 'LR' ? Position.Left : Position.Top

        const initialNodes: Node[] = flow.nodes.map((n) => ({
            id: n.goal.id,
            type: 'requiresNode',
            position: { x: 0, y: 0 },
            sourcePosition: sourcePos,
            targetPosition: targetPos,
            data: {
                goal: n.goal,
                isCurrent: false,
                relationToCurrent: n.relationToCurrent,
                mastered: getMastery(n.goal.id) >= masteredThreshold,
                labels,
                sourcePosition: sourcePos,
                targetPosition: targetPos,
            },
        }))

        initialNodes.push({
            id: currentGoal.id,
            type: 'requiresNode',
            position: { x: 0, y: 0 },
            sourcePosition: sourcePos,
            targetPosition: targetPos,
            data: {
                goal: currentGoal,
                isCurrent: true,
                relationToCurrent: 'direct' as PrerequisiteRelationToCurrent,
                mastered: getMastery(currentGoal.id) >= masteredThreshold,
                labels,
                sourcePosition: sourcePos,
                targetPosition: targetPos,
            },
        })

        const reducedEdges = transitiveReduce(flow.edges)

        const sourceHandle = direction === 'LR' ? 'right' : 'bottom'
        const targetHandle = direction === 'LR' ? 'left' : 'top'

        const initialEdges: Edge[] = reducedEdges.map((e) => ({
            id: e.id,
            source: e.fromId,
            target: e.toId,
            sourceHandle,
            targetHandle,
            style: {
                strokeWidth: 1.5,
                stroke: '#94a3b8',
            },
            markerEnd: {
                type: MarkerType.ArrowClosed,
                color: '#94a3b8',
            },
        }))

        getElkLayout(initialNodes, initialEdges, direction).then(({ nodes, edges }) => {
            if (!cancelled) {
                setLayoutedNodes(nodes)
                setLayoutedEdges(edges)
                setLayoutKey(k => k + 1)
            }
        })

        return () => { cancelled = true }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataFingerprint])

    if (!layoutedNodes || !layoutedEdges) {
        return (
            <div className="flex h-[500px] w-full items-center justify-center rounded-2xl border border-border-color bg-sidebar-bg/50">
                <span className="text-sm text-text-secondary">Layout wird berechnet…</span>
            </div>
        )
    }

    return (
        <div className="relative w-full rounded-2xl border border-border-color bg-sidebar-bg/50" style={{ height: '500px' }}>
            <div className="absolute right-4 top-4 z-10">
                <button
                    type="button"
                    onClick={() => setDirection(d => d === 'TB' ? 'LR' : 'TB')}
                    className="flex items-center gap-1.5 rounded-lg border border-border-color bg-chat-bg px-3 py-1.5 text-[11px] font-semibold tracking-wide text-text-secondary transition-colors hover:border-sky-400/80 hover:text-text-primary"
                >
                    Layout: {direction === 'TB' ? 'Von oben nach unten' : 'Von links nach rechts'}
                </button>
            </div>
            <ReactFlow
                key={layoutKey}
                defaultNodes={layoutedNodes}
                defaultEdges={layoutedEdges}
                onNodeClick={(_, node) => {
                    onNavigate(node.id)
                }}
                nodeTypes={nodeTypes}
                connectionLineType={ConnectionLineType.SmoothStep}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                minZoom={0.2}
                maxZoom={1.5}
                proOptions={{ hideAttribution: true }}
            >
                <Background gap={24} size={2} color="#94a3b8" />
                <Controls showInteractive={false} />
            </ReactFlow>
        </div>
    )
}
