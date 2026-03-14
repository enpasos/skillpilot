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
import elkWorkerUrl from 'elkjs/lib/elk-worker.min.js?url'
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

const CURRENT_NODE_WIDTH = 300
const DEFAULT_NODE_WIDTH = 256
const CURRENT_NODE_HEIGHT = 120
const DEFAULT_NODE_HEIGHT = 70

type ElkLayoutGraph = {
    id: string
    layoutOptions: Record<string, string>
    children: Array<{ id: string; width: number; height: number }>
    edges: Array<{ id: string; sources: string[]; targets: string[] }>
}

type ElkLayoutResult = {
    children?: Array<{ id: string; x?: number; y?: number }>
}

type ElkLike = {
    layout: (graph: ElkLayoutGraph) => Promise<ElkLayoutResult>
}

function getNodeWidth(nodeData: RequiresNodeData): number {
    return nodeData.isCurrent ? CURRENT_NODE_WIDTH : DEFAULT_NODE_WIDTH
}

function getNodeHeight(nodeData: RequiresNodeData): number {
    if (nodeData.isCurrent) return CURRENT_NODE_HEIGHT
    return DEFAULT_NODE_HEIGHT
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

let elkInstancePromise: Promise<ElkLike> | null = null

async function getElkInstance(): Promise<ElkLike> {
    if (!elkInstancePromise) {
        elkInstancePromise = import('elkjs/lib/elk-api.js').then(({ default: ELK }) => (
            new (ELK as unknown as { new(options: { workerUrl: string }): ElkLike })({ workerUrl: elkWorkerUrl })
        ))
    }
    return elkInstancePromise
}

async function getElkLayout(
    nodes: Node[],
    edges: Edge[],
    direction: 'LR' | 'TB'
): Promise<{ nodes: Node[]; edges: Edge[] }> {
    const layerSpacing = direction === 'TB' ? '36' : '80'

    const elkGraph: ElkLayoutGraph = {
        id: 'root',
        layoutOptions: {
            'elk.algorithm': 'layered',
            'elk.direction': direction === 'LR' ? 'RIGHT' : 'DOWN',
            'elk.spacing.nodeNode': '40',
            'elk.layered.spacing.nodeNodeBetweenLayers': layerSpacing,
            'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
            'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
        },
        children: nodes.map((node) => ({
            id: node.id,
            width: getNodeWidth(node.data as RequiresNodeData),
            height: getNodeHeight(node.data as RequiresNodeData),
        })),
        edges: edges.map((edge) => ({
            id: edge.id,
            sources: [edge.source],
            targets: [edge.target],
        })),
    }

    const elk = await getElkInstance()
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
    const dataFingerprint = `${currentGoal.id}-${flow.nodes.length}-${flow.edges.length}-${direction}-${masteredThreshold}-${showMastery ? 1 : 0}`

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

    const handleExportPdf = useCallback(async () => {
        if (!layoutedNodes || !layoutedEdges) return

        const [{ jsPDF }] = await Promise.all([
            import('jspdf'),
            import('svg2pdf.js'),
        ])

        const liveNodes = getNodes()
        const liveEdges = getEdges()

        // ── 0. Load Inter font ────────────────────────────────────
        let interFontBase64: string | null = null
        try {
            const resp = await fetch('/fonts/Inter-SemiBold.ttf?v=2')
            const buf = await resp.arrayBuffer()
            const bytes = new Uint8Array(buf)
            // Validate TTF signature: starts with 0x00010000 or 'true'
            if (bytes.length > 4 && (bytes[0] === 0x00 || bytes[0] === 0x74)) {
                let binary = ''
                bytes.forEach(b => { binary += String.fromCharCode(b) })
                interFontBase64 = btoa(binary)
            } else {
                console.warn('Font file is not a valid TTF – falling back to Helvetica')
            }
        } catch {
            console.warn('Could not load Inter font – falling back to Helvetica')
        }

        // ── 1. Bounding box ───────────────────────────────────────
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
        liveNodes.forEach(n => {
            const nodeData = n.data as unknown as RequiresNodeData
            const w = n.measured?.width ?? n.width ?? getNodeWidth(nodeData)
            const h = n.measured?.height ?? n.height ?? getNodeHeight(nodeData)
            if (n.position.x < minX) minX = n.position.x
            if (n.position.y < minY) minY = n.position.y
            if (n.position.x + w > maxX) maxX = n.position.x + w
            if (n.position.y + h > maxY) maxY = n.position.y + h
        })
        const padding = 50
        minX -= padding; minY -= padding; maxX += padding; maxY += padding
        const width = maxX - minX
        const height = maxY - minY

        // ── 2. Build geometry-only SVG (no text) ──────────────────
        const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        svgElement.setAttribute('viewBox', `${minX} ${minY} ${width} ${height}`)
        svgElement.setAttribute('width', `${width}`)
        svgElement.setAttribute('height', `${height}`)

        // Arrow marker
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

        // Edges
        liveEdges.forEach(e => {
            const sourceNode = liveNodes.find(n => n.id === e.source)
            const targetNode = liveNodes.find(n => n.id === e.target)
            if (!sourceNode || !targetNode || !sourceNode.position || !targetNode.position) return

            const sourceNodeData = sourceNode.data as unknown as RequiresNodeData
            const targetNodeData = targetNode.data as unknown as RequiresNodeData

            const sW = sourceNode.measured?.width ?? sourceNode.width ?? getNodeWidth(sourceNodeData)
            const sH = sourceNode.measured?.height ?? sourceNode.height ?? getNodeHeight(sourceNodeData)
            const tW = targetNode.measured?.width ?? targetNode.width ?? getNodeWidth(targetNodeData)
            const tH = targetNode.measured?.height ?? targetNode.height ?? getNodeHeight(targetNodeData)

            let sourceX: number, sourceY: number, targetX: number, targetY: number
            if (direction === 'LR') {
                sourceX = sourceNode.position.x + sW; sourceY = sourceNode.position.y + sH / 2
                targetX = targetNode.position.x; targetY = targetNode.position.y + tH / 2
            } else {
                sourceX = sourceNode.position.x + sW / 2; sourceY = sourceNode.position.y + sH
                targetX = targetNode.position.x + tW / 2; targetY = targetNode.position.y
            }

            let pathString: string
            if (direction === 'LR') {
                const cX = sourceX + (targetX - sourceX) / 2
                pathString = `M ${sourceX},${sourceY} C ${cX},${sourceY} ${cX},${targetY} ${targetX},${targetY}`
            } else {
                const cY = sourceY + (targetY - sourceY) / 2
                pathString = `M ${sourceX},${sourceY} C ${sourceX},${cY} ${targetX},${cY} ${targetX},${targetY}`
            }

            const p = document.createElementNS('http://www.w3.org/2000/svg', 'path')
            p.setAttribute('d', pathString)
            p.setAttribute('fill', 'none')
            p.setAttribute('stroke', '#94a3b8')
            p.setAttribute('stroke-width', '1.5')
            p.setAttribute('marker-end', 'url(#pdf-arrow)')
            svgElement.appendChild(p)
        })

        // Node rectangles only (no text in SVG)
        liveNodes.forEach(n => {
            const nodeData = n.data as unknown as RequiresNodeData
            const isCurrent = nodeData.isCurrent
            const w = n.measured?.width ?? n.width ?? getNodeWidth(nodeData)
            const h = n.measured?.height ?? n.height ?? getNodeHeight(nodeData)

            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
            rect.setAttribute('x', `${n.position.x}`)
            rect.setAttribute('y', `${n.position.y}`)
            rect.setAttribute('width', `${w}`)
            rect.setAttribute('height', `${h}`)
            rect.setAttribute('rx', '12')
            rect.setAttribute('fill', isCurrent ? '#f0f9ff' : '#ffffff')
            rect.setAttribute('stroke', isCurrent ? '#38bdf8' : '#cbd5e1')
            rect.setAttribute('stroke-width', '1')
            svgElement.appendChild(rect)
        })

        // ── 3. Create PDF and render SVG geometry ─────────────────
        const orientation = width > height ? 'landscape' : 'portrait'
        const doc = new jsPDF({ orientation, unit: 'pt', format: [width, height] })

        // Register Inter font (with graceful fallback to Helvetica)
        let fontAvailable = false
        if (interFontBase64) {
            try {
                doc.addFileToVFS('Inter-SemiBold.ttf', interFontBase64)
                doc.addFont('Inter-SemiBold.ttf', 'Inter', 'normal')
                fontAvailable = true
            } catch (e) {
                console.warn('Could not register Inter font – falling back to Helvetica', e)
            }
        }

        // Render geometry (rects + edges) as vector
        await doc.svg(svgElement, { x: 0, y: 0, width, height })

        // ── 4. Add text via jsPDF native API (uses registered Inter font) ─
        if (fontAvailable) {
            doc.setFont('Inter')
        }

        try {
            // Verify font metrics are usable before rendering all nodes
            doc.setFontSize(12)
            doc.splitTextToSize('test', 100)

            liveNodes.forEach(n => {
                const nodeData = n.data as unknown as RequiresNodeData
                const isCurrent = nodeData.isCurrent
                const w = n.measured?.width ?? n.width ?? getNodeWidth(nodeData)
                const h = n.measured?.height ?? n.height ?? getNodeHeight(nodeData)
                // SVG viewBox starts at minX,minY but PDF starts at 0,0
                const px = n.position.x - minX
                const py = n.position.y - minY

                // Title
                const fontSize = isCurrent ? 13 : 11
                doc.setFontSize(fontSize)
                doc.setTextColor(15, 23, 42) // #0f172a
                const maxW = w - (isCurrent ? 26 : 26)
                const titleLines: string[] = doc.splitTextToSize(nodeData.goal.title, maxW)
                doc.text(titleLines, px + 12, py + (isCurrent ? 26 : 21))

                // Description (current node only)
                if (isCurrent && nodeData.goal.description) {
                    doc.setFontSize(10)
                    doc.setTextColor(100, 116, 139) // #64748b
                    const descLines: string[] = doc.splitTextToSize(String(nodeData.goal.description), w - 24)
                    const descY = py + 28 + titleLines.length * 16 + 8
                    doc.text(descLines, px + 12, descY)
                }

                // Status label
                if (nodeData.showMastery && !isCurrent) {
                    doc.setFontSize(9)
                    doc.setTextColor(100, 116, 139) // #64748b
                    const label = nodeData.mastered ? nodeData.labels.met : nodeData.labels.unmet
                    doc.text(label, px + 12, py + h - 10)
                }
            })
        } catch (textErr) {
            console.warn('Could not render text in PDF (font metadata issue) – exporting geometry only', textErr)
        }

        doc.save(`requires-flow-${currentGoal.title || currentGoal.id}.pdf`)

    }, [layoutedNodes, layoutedEdges, currentGoal, direction, getNodes, getEdges])

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
