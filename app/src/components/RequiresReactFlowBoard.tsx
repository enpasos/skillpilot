import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
    ReactFlow,
    ReactFlowProvider,
    useReactFlow,
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
import { jsPDF } from 'jspdf'
import 'svg2pdf.js'
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
    targetPosition?: Position
    showMastery: boolean
}

const RequiresNodeTarget: React.FC<NodeProps<Node<RequiresNodeData>>> = ({ data }) => {
    const { goal, isCurrent, mastered, labels, showMastery } = data

    const status = mastered ? labels.met : labels.unmet
    const statusClass = mastered
        ? 'text-emerald-600 dark:text-emerald-300'
        : 'text-amber-600 dark:text-amber-300'

    if (isCurrent) {
        return (
            <div className="w-[300px] shrink-0 rounded-2xl border border-sky-400/60 bg-sky-500/10 p-3 shadow-sm relative">
                <Handle id="top" type="target" position={Position.Top} style={{ opacity: 0 }} />
                <Handle id="right" type="source" position={Position.Right} style={{ opacity: 0 }} />
                <Handle id="bottom" type="source" position={Position.Bottom} style={{ opacity: 0 }} />
                <Handle id="left" type="target" position={Position.Left} style={{ opacity: 0 }} />
                <InlineMathText text={goal.title} className="text-sm font-semibold text-text-primary" />
                {goal.description && (
                    <InlineMathText text={goal.description} className="mt-1 line-clamp-4 text-[11px] text-text-secondary" />
                )}
            </div>
        )
    }

    return (
        <div className="flex w-64 flex-col rounded-xl border border-border-color bg-chat-bg px-2.5 py-2 text-left transition-colors hover:border-sky-400/80 relative">
            <Handle id="top" type="target" position={Position.Top} style={{ opacity: 0 }} />
            <Handle id="right" type="source" position={Position.Right} style={{ opacity: 0 }} />
            <Handle id="bottom" type="source" position={Position.Bottom} style={{ opacity: 0 }} />
            <Handle id="left" type="target" position={Position.Left} style={{ opacity: 0 }} />
            <InlineMathText text={goal.title} className="text-xs font-semibold text-text-primary" />
            {showMastery && (
                <div className="mt-1 flex items-center gap-2 text-[10px] text-text-secondary">
                    <span className={statusClass}>{status}</span>
                </div>
            )}
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
            'elk.spacing.nodeNode': '40',
            'elk.layered.spacing.nodeNodeBetweenLayers': '80',
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
    showMastery?: boolean
}

export const RequiresReactFlowBoard: React.FC<RequiresReactFlowBoardProps> = (props) => {
    return (
        <ReactFlowProvider>
            <InnerRequiresFlow {...props} />
        </ReactFlowProvider>
    )
}

const InnerRequiresFlow: React.FC<RequiresReactFlowBoardProps> = ({
    currentGoal,
    flow,
    getMastery,
    masteredThreshold,
    onNavigate,
    labels,
    showMastery = true,
}) => {
    const { getNodes, getEdges } = useReactFlow()
    const [direction, setDirection] = useState<'TB' | 'LR'>('TB')
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
                showMastery,
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
                showMastery,
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

    const flowRef = useRef<HTMLDivElement>(null)

    const handleExportPdf = useCallback(() => {
        if (!layoutedNodes || !layoutedEdges) return

        // Fetch LIVE nodes directly from the React Flow instance
        const liveNodes = getNodes()
        const liveEdges = getEdges()

        const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg')

        // 1. Calculate bounding box for the SVG using live nodes
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
        liveNodes.forEach(n => {
            const w = n.measured?.width ?? n.width ?? (n.data.isCurrent ? 300 : 256)
            const h = n.measured?.height ?? n.height ?? (n.data.isCurrent ? 120 : 70)
            if (n.position.x < minX) minX = n.position.x
            if (n.position.y < minY) minY = n.position.y
            if (n.position.x + w > maxX) maxX = n.position.x + w
            if (n.position.y + h > maxY) maxY = n.position.y + h
        })
        const padding = 50
        minX -= padding
        minY -= padding
        maxX += padding
        maxY += padding
        const width = maxX - minX
        const height = maxY - minY

        svgElement.setAttribute('viewBox', `${minX} ${minY} ${width} ${height}`)
        svgElement.setAttribute('width', `${width}`)
        svgElement.setAttribute('height', `${height}`)

        // 2. Draw Edges manually
        const edgesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')

        // Add marker defs manually
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker')
        marker.setAttribute('id', 'pdf-arrow')
        marker.setAttribute('viewBox', '0 0 10 10')
        marker.setAttribute('refX', '8')
        marker.setAttribute('refY', '5')
        marker.setAttribute('markerWidth', '6')
        marker.setAttribute('markerHeight', '6')
        marker.setAttribute('orient', 'auto-start-reverse')
        const markerPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        markerPath.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z')
        markerPath.setAttribute('fill', '#94a3b8')
        marker.appendChild(markerPath)
        defs.appendChild(marker)
        svgElement.appendChild(defs)

        liveEdges.forEach(e => {
            const sourceNode = liveNodes.find(n => n.id === e.source)
            const targetNode = liveNodes.find(n => n.id === e.target)
            if (!sourceNode || !targetNode || !sourceNode.position || !targetNode.position) return

            // Calculate precise connection points based on direction
            let sourceX, sourceY, targetX, targetY
            const sW = sourceNode.measured?.width ?? sourceNode.width ?? (sourceNode.data.isCurrent ? 300 : 256)
            const sH = sourceNode.measured?.height ?? sourceNode.height ?? (sourceNode.data.isCurrent ? 120 : 70)
            const tW = targetNode.measured?.width ?? targetNode.width ?? (targetNode.data.isCurrent ? 300 : 256)
            const tH = targetNode.measured?.height ?? targetNode.height ?? (targetNode.data.isCurrent ? 120 : 70)

            if (direction === 'LR') {
                sourceX = sourceNode.position.x + sW
                sourceY = sourceNode.position.y + sH / 2
                targetX = targetNode.position.x
                targetY = targetNode.position.y + tH / 2
            } else {
                sourceX = sourceNode.position.x + sW / 2
                sourceY = sourceNode.position.y + sH
                targetX = targetNode.position.x + tW / 2
                targetY = targetNode.position.y
            }

            // Create smooth curve (bezier)
            let pathString = ''
            if (direction === 'LR') {
                const cX = sourceX + (targetX - sourceX) / 2
                pathString = `M ${sourceX},${sourceY} C ${cX},${sourceY} ${cX},${targetY} ${targetX},${targetY}`
            } else {
                const cY = sourceY + (targetY - sourceY) / 2
                pathString = `M ${sourceX},${sourceY} C ${sourceX},${cY} ${targetX},${cY} ${targetX},${targetY}`
            }

            const newPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
            newPath.setAttribute('d', pathString)
            newPath.setAttribute('fill', 'none')
            newPath.setAttribute('stroke', '#94a3b8')
            newPath.setAttribute('stroke-width', '1.5')
            newPath.setAttribute('marker-end', 'url(#pdf-arrow)')
            edgesGroup.appendChild(newPath)
        })

        svgElement.appendChild(edgesGroup)

        // 3. Draw nodes manually as pure SVG objects
        const nodesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
        liveNodes.forEach(n => {
            const nodeData = n.data as unknown as RequiresNodeData
            const isCurrent = nodeData.isCurrent
            const w = n.measured?.width ?? n.width ?? (isCurrent ? 300 : 256)
            const h = n.measured?.height ?? n.height ?? (isCurrent ? 120 : 70)
            const x = n.position.x
            const y = n.position.y

            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')

            // Background rect
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
            rect.setAttribute('x', `${x}`)
            rect.setAttribute('y', `${y}`)
            rect.setAttribute('width', `${w}`)
            rect.setAttribute('height', `${h}`)
            rect.setAttribute('rx', '12')
            rect.setAttribute('fill', isCurrent ? '#f0f9ff' : '#ffffff') // sky-50 for current
            rect.setAttribute('stroke', isCurrent ? '#38bdf8' : '#cbd5e1') // sky-400 or slate-300
            rect.setAttribute('stroke-width', '1')
            g.appendChild(rect)

            // Title text with simple word wrap
            const title = document.createElementNS('http://www.w3.org/2000/svg', 'text')
            title.setAttribute('x', `${x + 12}`)
            title.setAttribute('y', `${y + (isCurrent ? 26 : 20)}`)
            title.setAttribute('fill', '#0f172a') // slate-900
            title.setAttribute('font-family', 'sans-serif')
            title.setAttribute('font-size', isCurrent ? '14' : '12')
            title.setAttribute('font-weight', 'bold')

            const words = nodeData.goal.title.split(' ')
            let line = ''
            let lineY = 0
            const maxChars = isCurrent ? 55 : 48
            words.forEach((word: string) => {
                if ((line + word).length > maxChars && line.length > 0) {
                    const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan')
                    tspan.setAttribute('x', `${x + 12}`)
                    tspan.setAttribute('dy', lineY === 0 ? '0' : '1.2em')
                    tspan.textContent = line.trim()
                    title.appendChild(tspan)
                    line = word + ' '
                    lineY++
                } else {
                    line += word + ' '
                }
            })
            if (line.trim()) {
                const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan')
                tspan.setAttribute('x', `${x + 12}`)
                tspan.setAttribute('dy', lineY === 0 ? '0' : '1.2em')
                tspan.textContent = line.trim()
                title.appendChild(tspan)
            }
            g.appendChild(title)

            // Current Goal description
            if (isCurrent && nodeData.goal.description) {
                const desc = document.createElementNS('http://www.w3.org/2000/svg', 'text')
                // Place below title
                desc.setAttribute('x', `${x + 12}`)
                desc.setAttribute('y', `${y + 28 + (lineY + 1) * 16 + 8}`)
                desc.setAttribute('fill', '#64748b') // slate-500
                desc.setAttribute('font-family', 'sans-serif')
                desc.setAttribute('font-size', '11')

                const descWords = String(nodeData.goal.description).split(' ')
                let dLine = ''
                let dLineY = 0
                const dMaxChars = 50 // approx
                descWords.forEach((word: string) => {
                    if ((dLine + word).length > dMaxChars && dLine.length > 0) {
                        const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan')
                        tspan.setAttribute('x', `${x + 12}`)
                        tspan.setAttribute('dy', dLineY === 0 ? '0' : '1.2em')
                        tspan.textContent = dLine.trim()
                        desc.appendChild(tspan)
                        dLine = word + ' '
                        dLineY++
                    } else {
                        dLine += word + ' '
                    }
                })
                if (dLine.trim()) {
                    const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan')
                    tspan.setAttribute('x', `${x + 12}`)
                    tspan.setAttribute('dy', dLineY === 0 ? '0' : '1.2em')
                    tspan.textContent = dLine.trim()
                    desc.appendChild(tspan)
                }
                g.appendChild(desc)
            }

            // Status label
            if (nodeData.showMastery && !isCurrent) {
                const status = document.createElementNS('http://www.w3.org/2000/svg', 'text')
                status.setAttribute('x', `${x + 12}`)
                status.setAttribute('y', `${y + h - 16}`)
                status.setAttribute('font-family', 'sans-serif')
                status.setAttribute('font-size', '10')
                status.setAttribute('fill', '#64748b') // slate-500
                const statLabel = nodeData.mastered ? nodeData.labels.met : nodeData.labels.unmet
                status.textContent = statLabel
                g.appendChild(status)
            }

            nodesGroup.appendChild(g)
        })
        svgElement.appendChild(nodesGroup)

        // 4. Render to PDF using svg2pdf
        const orientation = width > height ? 'landscape' : 'portrait'
        const doc = new jsPDF({
            orientation,
            unit: 'pt',
            format: [width, height]
        })

        doc.svg(svgElement, {
            x: 0,
            y: 0,
            width,
            height
        }).then(() => {
            doc.save(`requires-flow-${currentGoal.title || currentGoal.id}.pdf`)
        })

    }, [layoutedNodes, layoutedEdges, currentGoal])

    if (!layoutedNodes || !layoutedEdges) {
        return (
            <div className="flex h-[500px] w-full items-center justify-center rounded-2xl border border-border-color bg-sidebar-bg/50">
                <span className="text-sm text-text-secondary">Layout wird berechnet…</span>
            </div>
        )
    }

    return (
        <div ref={flowRef} className="relative w-full rounded-2xl border border-border-color bg-sidebar-bg/50" style={{ height: '500px' }}>
            <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => setDirection(d => d === 'TB' ? 'LR' : 'TB')}
                    className="flex items-center gap-1.5 rounded-lg border border-border-color bg-chat-bg px-3 py-1.5 text-[11px] font-semibold tracking-wide text-text-secondary transition-colors hover:border-sky-400/80 hover:text-text-primary"
                >
                    Layout: {direction === 'TB' ? 'Von oben nach unten' : 'Von links nach rechts'}
                </button>
                <button
                    type="button"
                    onClick={handleExportPdf}
                    className="flex items-center gap-1.5 rounded-lg border border-border-color bg-chat-bg px-3 py-1.5 text-[11px] font-semibold tracking-wide text-text-secondary transition-colors hover:border-sky-400/80 hover:text-text-primary"
                >
                    PDF Export
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
