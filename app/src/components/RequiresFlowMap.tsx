import React, { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { UiGoal as Goal } from '../goalTypes'
import { InlineMathText } from './InlineMathText'
import { RequiresReactFlowBoard } from './RequiresReactFlowBoard'

type PrereqKind = 'direct' | 'inherited'

type FlowNode = {
  goal: Goal
  kind: PrereqKind
}

type PrerequisiteRelationToCurrent = 'direct' | 'inherited' | 'transitive'

type FullPrerequisiteNode = {
  goal: Goal
  level: number
  relationToCurrent: PrerequisiteRelationToCurrent
}

type FullPrerequisiteEdge = {
  id: string
  fromId: string
  toId: string
  relation: PrereqKind
}

type FullPrerequisiteFlowData = {
  nodes: FullPrerequisiteNode[]
  nodesByLevel: Map<number, FullPrerequisiteNode[]>
  orderedLevels: number[]
  edges: FullPrerequisiteEdge[]
}

type Connector = {
  id: string
  fromX: number
  fromY: number
  toX: number
  toY: number
  kind: 'inbound' | 'outbound'
  inherited?: boolean
  active?: boolean
}

interface RequiresFlowMapProps {
  language: 'de' | 'en'
  currentGoal: Goal
  requires: Goal[]
  inheritedRequires: Goal[]
  forwardDirect: Goal[]
  forwardInherited: Goal[]
  goalIndexAll: Map<string, Goal>
  getMastery: (goalId: string) => number
  onNavigate: (id: string) => void
  masteredThreshold?: number
  compact?: boolean
  showMastery?: boolean
}

const MAX_LEFT_NODES = 7
const MAX_RIGHT_NODES = 7

const CONNECTOR_COLORS = {
  direct: 'rgb(2 132 199)', // sky-600
  inherited: 'rgb(100 116 139)', // slate-500
  unlocks: 'rgb(5 150 105)', // emerald-600
} as const

const isAtomicGoal = (goal: Goal): boolean => {
  if (goal.type === 'atomic') return true
  if (goal.type === 'cluster') return false
  return (goal.contains?.length ?? 0) === 0
}

const normalizeGoalRef = (ref: string): string => {
  const idx = ref.indexOf(':')
  if (idx >= 0 && idx < ref.length - 1) {
    return ref.slice(idx + 1)
  }
  return ref
}

const refsMatch = (a: string, b: string): boolean => normalizeGoalRef(a) === normalizeGoalRef(b)

const resolveGoalRef = (ref: string, goalIndexAll: Map<string, Goal>): Goal | undefined => {
  return goalIndexAll.get(ref) ?? goalIndexAll.get(normalizeGoalRef(ref))
}

const getEffectiveRequiresRefs = (goal: Goal): string[] => {
  if (goal.effectiveRequires && goal.effectiveRequires.length > 0) {
    return goal.effectiveRequires
  }
  return goal.requires
}

export const RequiresFlowMap: React.FC<RequiresFlowMapProps> = ({
  language,
  currentGoal,
  requires,
  inheritedRequires,
  forwardDirect,
  forwardInherited,
  goalIndexAll,
  getMastery,
  onNavigate,
  masteredThreshold = 0.8,
  compact = false,
  showMastery = true,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const centerRef = useRef<HTMLDivElement | null>(null)
  const leftRefs = useRef<Map<string, HTMLButtonElement>>(new Map())
  const rightRefs = useRef<Map<string, HTMLButtonElement>>(new Map())
  const markerId = useId().replace(/:/g, '')
  const [connectors, setConnectors] = useState<Connector[]>([])
  const [showConnectors, setShowConnectors] = useState(false)
  const [nodeFilter, setNodeFilter] = useState<'all' | 'atomic'>('atomic')
  const atomicOnly = nodeFilter === 'atomic'

  const leftNodes = useMemo<FlowNode[]>(() => {
    const ids = new Set<string>()
    const merged: FlowNode[] = []

    requires.forEach((goal) => {
      if (ids.has(goal.id)) return
      ids.add(goal.id)
      merged.push({ goal, kind: 'direct' })
    })

    inheritedRequires.forEach((goal) => {
      if (ids.has(goal.id)) return
      ids.add(goal.id)
      merged.push({ goal, kind: 'inherited' })
    })

    return atomicOnly ? merged.filter((node) => isAtomicGoal(node.goal)) : merged
  }, [requires, inheritedRequires, atomicOnly])

  const rightNodes = useMemo<FlowNode[]>(() => {
    const ids = new Set<string>()
    const merged: FlowNode[] = []

    forwardDirect.forEach((goal) => {
      if (ids.has(goal.id)) return
      ids.add(goal.id)
      merged.push({ goal, kind: 'direct' })
    })

    forwardInherited.forEach((goal) => {
      if (ids.has(goal.id)) return
      ids.add(goal.id)
      merged.push({ goal, kind: 'inherited' })
    })

    return atomicOnly ? merged.filter((node) => isAtomicGoal(node.goal)) : merged
  }, [forwardDirect, forwardInherited, atomicOnly])

  const leftVisible = leftNodes.slice(0, MAX_LEFT_NODES)
  const rightVisible = rightNodes.slice(0, MAX_RIGHT_NODES)
  const leftOverflow = Math.max(0, leftNodes.length - leftVisible.length)
  const rightOverflow = Math.max(0, rightNodes.length - rightVisible.length)

  const fullPrerequisiteFlow = useMemo<FullPrerequisiteFlowData>(() => {
    if (goalIndexAll.size === 0) {
      return { nodes: [], nodesByLevel: new Map(), orderedLevels: [], edges: [] }
    }

    const allNodes = new Map<string, Goal>()
    const allEdges = new Map<string, FullPrerequisiteEdge>()
    const outgoing = new Map<string, Set<string>>()

    const walkPrerequisites = (goal: Goal, stack: Set<string>) => {
      if (stack.has(goal.id)) return
      stack.add(goal.id)

      getEffectiveRequiresRefs(goal).forEach((ref) => {
        const prereqGoal = resolveGoalRef(ref, goalIndexAll)
        if (!prereqGoal || prereqGoal.id === goal.id) return

        allNodes.set(prereqGoal.id, prereqGoal)

        const relation: PrereqKind = goal.requires.some((directRef) => refsMatch(directRef, prereqGoal.id))
          ? 'direct'
          : 'inherited'
        const edgeId = `${prereqGoal.id}->${goal.id}`
        allEdges.set(edgeId, { id: edgeId, fromId: prereqGoal.id, toId: goal.id, relation })

        const targets = outgoing.get(prereqGoal.id) ?? new Set<string>()
        targets.add(goal.id)
        outgoing.set(prereqGoal.id, targets)

        walkPrerequisites(prereqGoal, stack)
      })

      stack.delete(goal.id)
    }

    walkPrerequisites(currentGoal, new Set<string>())

    const currentDirectIds = new Set(currentGoal.requires.map((ref) => normalizeGoalRef(ref)))
    const currentEffectiveIds = new Set(getEffectiveRequiresRefs(currentGoal).map((ref) => normalizeGoalRef(ref)))

    const levelMemo = new Map<string, number>()
    const levelStack = new Set<string>()

    const computeLevel = (goalId: string): number => {
      if (goalId === currentGoal.id) return 0
      const cached = levelMemo.get(goalId)
      if (cached !== undefined) return cached
      if (levelStack.has(goalId)) return 1

      levelStack.add(goalId)
      const targets = outgoing.get(goalId)
      let level = 1
      if (targets && targets.size > 0) {
        targets.forEach((targetId) => {
          const candidate = 1 + computeLevel(targetId)
          if (candidate > level) level = candidate
        })
      }
      levelStack.delete(goalId)
      levelMemo.set(goalId, level)
      return level
    }

    const nodes = Array.from(allNodes.values())
      .filter((goal) => !atomicOnly || isAtomicGoal(goal))
      .map((goal) => {
        const normalizedId = normalizeGoalRef(goal.id)
        let relationToCurrent: PrerequisiteRelationToCurrent = 'transitive'
        if (currentDirectIds.has(normalizedId)) {
          relationToCurrent = 'direct'
        } else if (currentEffectiveIds.has(normalizedId)) {
          relationToCurrent = 'inherited'
        }

        return {
          goal,
          level: computeLevel(goal.id),
          relationToCurrent,
        }
      })
      .sort((a, b) => {
        if (a.level !== b.level) return b.level - a.level
        return a.goal.title.localeCompare(b.goal.title)
      })

    const visibleIds = new Set(nodes.map((node) => node.goal.id))
    const edges = Array.from(allEdges.values())
      .filter((edge) => visibleIds.has(edge.fromId) && (edge.toId === currentGoal.id || visibleIds.has(edge.toId)))
      .sort((a, b) => {
        const byFrom = a.fromId.localeCompare(b.fromId)
        if (byFrom !== 0) return byFrom
        return a.toId.localeCompare(b.toId)
      })

    const nodesByLevel = new Map<number, FullPrerequisiteNode[]>()
    nodes.forEach((node) => {
      const bucket = nodesByLevel.get(node.level) ?? []
      bucket.push(node)
      nodesByLevel.set(node.level, bucket)
    })
    nodesByLevel.forEach((bucket) => bucket.sort((a, b) => a.goal.title.localeCompare(b.goal.title)))

    return {
      nodes,
      nodesByLevel,
      orderedLevels: Array.from(nodesByLevel.keys()).sort((a, b) => b - a),
      edges,
    }
  }, [goalIndexAll, currentGoal, atomicOnly])

  const openPrerequisiteCount = useMemo(() => (
    fullPrerequisiteFlow.nodes.reduce((count, node) => (
      getMastery(node.goal.id) >= masteredThreshold ? count : count + 1
    ), 0)
  ), [fullPrerequisiteFlow.nodes, getMastery, masteredThreshold])

  useEffect(() => {
    const updateLayoutMode = () => {
      setShowConnectors(!compact && window.matchMedia('(min-width: 1024px)').matches)
    }

    updateLayoutMode()
    window.addEventListener('resize', updateLayoutMode)
    return () => window.removeEventListener('resize', updateLayoutMode)
  }, [compact])

  useEffect(() => {
    if (!showConnectors) return

    const compute = () => {
      const container = containerRef.current
      const center = centerRef.current
      if (!container || !center) {
        setConnectors([])
        return
      }

      const containerRect = container.getBoundingClientRect()
      const centerRect = center.getBoundingClientRect()

      const centerLeftX = centerRect.left - containerRect.left
      const centerRightX = centerRect.right - containerRect.left
      const centerY = centerRect.top - containerRect.top + centerRect.height / 2

      const nextConnectors: Connector[] = []

      leftVisible.forEach(({ goal, kind }) => {
        const el = leftRefs.current.get(goal.id)
        if (!el) return
        const rect = el.getBoundingClientRect()
        const fromX = rect.right - containerRect.left
        const fromY = rect.top - containerRect.top + rect.height / 2
        const active = getMastery(goal.id) >= masteredThreshold

        nextConnectors.push({
          id: `left-${goal.id}`,
          fromX,
          fromY,
          toX: centerLeftX,
          toY: centerY,
          kind: 'inbound',
          inherited: kind === 'inherited',
          active,
        })
      })

      rightVisible.forEach(({ goal, kind }) => {
        const el = rightRefs.current.get(goal.id)
        if (!el) return
        const rect = el.getBoundingClientRect()
        const toX = rect.left - containerRect.left
        const toY = rect.top - containerRect.top + rect.height / 2

        const relevantRequires = goal.effectiveRequires && goal.effectiveRequires.length > 0
          ? goal.effectiveRequires
          : goal.requires
        const active = relevantRequires.every((reqId) => getMastery(reqId) >= masteredThreshold)

        nextConnectors.push({
          id: `right-${goal.id}`,
          fromX: centerRightX,
          fromY: centerY,
          toX,
          toY,
          kind: 'outbound',
          inherited: kind === 'inherited',
          active,
        })
      })

      setConnectors(nextConnectors)
    }

    const raf = requestAnimationFrame(compute)
    const ro = new ResizeObserver(() => {
      requestAnimationFrame(compute)
    })

    if (containerRef.current) ro.observe(containerRef.current)
    if (centerRef.current) ro.observe(centerRef.current)
    leftRefs.current.forEach((el) => ro.observe(el))
    rightRefs.current.forEach((el) => ro.observe(el))

    window.addEventListener('resize', compute)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('resize', compute)
    }
  }, [showConnectors, leftVisible, rightVisible, getMastery, masteredThreshold, currentGoal.id])

  const labels = language === 'en'
    ? {
      title: 'Requires Flow',
      subtitle: 'Direct prerequisites and unlocked next goals around the current node.',
      direct: 'direct',
      inherited: 'inherited',
      current: 'current goal',
      unmet: 'open',
      met: 'met',
      unlocks: 'unlocks',
      unlocksInherited: 'unlocks (inherited)',
      noIncoming: 'No prerequisites in view',
      noOutgoing: 'No follow-up goals in view',
      plusMore: '+{{count}} more',
      nodeFilterLabel: 'node filter',
      filterAll: 'all',
      filterAtomic: 'atomic',
      transitive: 'transitive',
      fullFlowTitle: 'Full Prerequisite Flow',
      fullFlowSubtitle: 'All direct, inherited, and transitive prerequisites of the current goal as one flow.',
      fullFlowSummary: '{{nodes}} prerequisites · {{edges}} links',
      fullFlowSummaryOpen: '{{count}} prerequisites still open',
      fullFlowSummaryDone: 'all prerequisites are met',
      fullFlowNoPrereqs: 'No prerequisites in this flow',
      fullFlowLevel: 'Level {{level}}',
    }
    : {
      title: 'Requires-Flow',
      subtitle: 'Direkte/vererbte Voraussetzungen und nächste freischaltbare Ziele.',
      direct: 'direkt',
      inherited: 'vererbt',
      current: 'aktuelles Ziel',
      unmet: 'offen',
      met: 'erfüllt',
      unlocks: 'schaltet frei',
      unlocksInherited: 'schaltet frei (vererbt)',
      noIncoming: 'Keine Voraussetzungen im Fokus',
      noOutgoing: 'Keine Folgeziele im Fokus',
      plusMore: '+{{count}} weitere',
      nodeFilterLabel: 'Zielfilter',
      filterAll: 'alle',
      filterAtomic: 'nur atomare',
      transitive: 'transitiv',
      fullFlowTitle: 'Gesamtflow der Vorbedingungen',
      fullFlowSubtitle: 'Alle direkten, vererbten und transitiven Vorbedingungen des aktuellen Ziels als ein Flow.',
      fullFlowSummary: '{{nodes}} Vorbedingungen · {{edges}} Verknüpfungen',
      fullFlowSummaryOpen: '{{count}} Vorbedingungen noch offen',
      fullFlowSummaryDone: 'alle Vorbedingungen erfüllt',
      fullFlowNoPrereqs: 'Keine Vorbedingungen in diesem Flow',
      fullFlowLevel: 'Stufe {{level}}',
    }

  return (
    <section className="glass-panel border-sky-500/30 bg-sidebar-bg/80 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">{labels.title}</h3>
          <p className="text-[11px] text-text-secondary">{labels.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[10px] text-text-secondary">
            <span>{labels.nodeFilterLabel}</span>
            <div className="flex rounded-full border border-border-color bg-input-bg p-0.5">
              <button
                type="button"
                aria-pressed={nodeFilter === 'all'}
                onClick={() => setNodeFilter('all')}
                className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-wide transition-colors ${nodeFilter === 'all'
                  ? 'bg-sky-600 text-white'
                  : 'text-text-secondary hover:text-text-primary'
                  }`}
              >
                {labels.filterAll}
              </button>
              <button
                type="button"
                aria-pressed={nodeFilter === 'atomic'}
                onClick={() => setNodeFilter('atomic')}
                className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-wide transition-colors ${nodeFilter === 'atomic'
                  ? 'bg-sky-600 text-white'
                  : 'text-text-secondary hover:text-text-primary'
                  }`}
              >
                {labels.filterAtomic}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-text-secondary">
            <LegendSwatch className="bg-sky-600" label={labels.direct} />
            <LegendSwatch className="text-slate-500" label={labels.inherited} dashed />
            <LegendSwatch className="bg-emerald-600" label={labels.unlocks} />
            <LegendSwatch className="text-emerald-600" label={labels.unlocksInherited} dashed />
          </div>
        </div>
      </div>

      <div ref={containerRef} className="relative">
        {showConnectors && connectors.length > 0 && (
          <svg className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible" aria-hidden="true">
            <defs>
              <marker
                id={`${markerId}-direct`}
                markerWidth="7"
                markerHeight="7"
                refX="6"
                refY="3.5"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L7,3.5 L0,7 z" fill={CONNECTOR_COLORS.direct} />
              </marker>
              <marker
                id={`${markerId}-inherited`}
                markerWidth="7"
                markerHeight="7"
                refX="6"
                refY="3.5"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L7,3.5 L0,7 z" fill={CONNECTOR_COLORS.inherited} />
              </marker>
              <marker
                id={`${markerId}-unlocks`}
                markerWidth="7"
                markerHeight="7"
                refX="6"
                refY="3.5"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L7,3.5 L0,7 z" fill={CONNECTOR_COLORS.unlocks} />
              </marker>
            </defs>
            {connectors.map((line) => {
              const curve = Math.max(42, Math.abs(line.toX - line.fromX) * 0.32)
              const d = `M ${line.fromX} ${line.fromY} C ${line.fromX + curve} ${line.fromY}, ${line.toX - curve} ${line.toY}, ${line.toX} ${line.toY}`
              const palette = line.kind === 'outbound'
                ? 'unlocks'
                : line.inherited
                  ? 'inherited'
                  : 'direct'
              const strokeColor = CONNECTOR_COLORS[palette]
              const baseOpacity = palette === 'inherited' ? 0.82 : 0.9
              const opacity = line.active ? baseOpacity + 0.06 : baseOpacity
              const strokeWidth = line.active ? 2.35 : 1.95
              return (
                <path
                  key={line.id}
                  d={d}
                  fill="none"
                  stroke={strokeColor}
                  opacity={opacity}
                  strokeWidth={strokeWidth}
                  strokeDasharray={line.inherited ? '5 4' : undefined}
                  markerEnd={`url(#${markerId}-${palette})`}
                />
              )
            })}
          </svg>
        )}

        <div
          className={`relative z-10 grid grid-cols-1 gap-3 ${compact ? '' : 'lg:grid-cols-[minmax(0,1fr)_minmax(340px,460px)_minmax(0,1fr)] lg:items-center lg:gap-x-10'
            }`}
        >
          <FlowColumn title={language === 'en' ? 'Requires' : 'Voraussetzungen'}>
            {leftVisible.length === 0 && (
              <EmptyFlowLabel label={labels.noIncoming} />
            )}
            {leftVisible.map(({ goal, kind }) => {
              const mastery = getMastery(goal.id)
              const met = mastery >= masteredThreshold
              const kindLabel = kind === 'direct' ? labels.direct : labels.inherited
              return (
                <FlowNodeButton
                  key={goal.id}
                  goal={goal}
                  side="left"
                  suffix={kindLabel}
                  status={met ? labels.met : labels.unmet}
                  statusClass={met ? 'text-emerald-600 dark:text-emerald-300' : 'text-amber-600 dark:text-amber-300'}
                  onClick={onNavigate}
                  showMastery={showMastery}
                  registerRef={(el) => {
                    if (el) {
                      leftRefs.current.set(goal.id, el)
                    } else {
                      leftRefs.current.delete(goal.id)
                    }
                  }}
                />
              )
            })}
            {leftOverflow > 0 && (
              <OverflowLabel text={labels.plusMore.replace('{{count}}', String(leftOverflow))} />
            )}
          </FlowColumn>

          <div className="rounded-2xl border border-sky-400/60 bg-sky-500/10 p-3 shadow-sm" ref={centerRef}>
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-sky-600 dark:text-sky-300">
              {labels.current}
            </div>
            <InlineMathText text={currentGoal.title} className="text-sm font-semibold text-text-primary" />
            {currentGoal.description && (
              <InlineMathText text={currentGoal.description} className="mt-1 line-clamp-3 text-[11px] text-text-secondary" />
            )}
          </div>

          <FlowColumn title={language === 'en' ? 'Next Steps' : 'Nächste Schritte'}>
            {rightVisible.length === 0 && (
              <EmptyFlowLabel label={labels.noOutgoing} />
            )}
            {rightVisible.map(({ goal, kind }) => {
              const relevantRequires = goal.effectiveRequires && goal.effectiveRequires.length > 0
                ? goal.effectiveRequires
                : goal.requires
              const unlocked = relevantRequires.every((reqId) => getMastery(reqId) >= masteredThreshold)
              const kindLabel = kind === 'inherited' ? labels.unlocksInherited : labels.unlocks
              return (
                <FlowNodeButton
                  key={goal.id}
                  goal={goal}
                  side="right"
                  suffix={kindLabel}
                  status={unlocked ? labels.met : labels.unmet}
                  statusClass={unlocked ? 'text-emerald-600 dark:text-emerald-300' : 'text-slate-500 dark:text-slate-300'}
                  onClick={onNavigate}
                  showMastery={showMastery}
                  registerRef={(el) => {
                    if (el) {
                      rightRefs.current.set(goal.id, el)
                    } else {
                      rightRefs.current.delete(goal.id)
                    }
                  }}
                />
              )
            })}
            {rightOverflow > 0 && (
              <OverflowLabel text={labels.plusMore.replace('{{count}}', String(rightOverflow))} />
            )}
          </FlowColumn>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-border-color bg-input-bg/50 p-3">
        <div className="mb-2">
          <h4 className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
            {labels.fullFlowTitle}
          </h4>
          <p className="mt-0.5 text-[11px] text-text-secondary">{labels.fullFlowSubtitle}</p>
          {fullPrerequisiteFlow.nodes.length > 0 && (
            <>
              <p className="mt-1 text-[10px] text-text-secondary">
                {labels.fullFlowSummary
                  .replace('{{nodes}}', String(fullPrerequisiteFlow.nodes.length))
                  .replace('{{edges}}', String(fullPrerequisiteFlow.edges.length))}
              </p>
              <p className="text-[10px] text-text-secondary">
                {openPrerequisiteCount > 0
                  ? labels.fullFlowSummaryOpen.replace('{{count}}', String(openPrerequisiteCount))
                  : labels.fullFlowSummaryDone}
              </p>
            </>
          )}
        </div>

        {fullPrerequisiteFlow.nodes.length === 0 && (
          <EmptyFlowLabel label={labels.fullFlowNoPrereqs} />
        )}

        {fullPrerequisiteFlow.nodes.length > 0 && (
          <RequiresReactFlowBoard
            currentGoal={currentGoal}
            flow={fullPrerequisiteFlow}
            getMastery={getMastery}
            masteredThreshold={masteredThreshold}
            onNavigate={onNavigate}
            showMastery={showMastery}
            labels={{
              current: labels.current,
              direct: labels.direct,
              inherited: labels.inherited,
              transitive: labels.transitive,
              met: labels.met,
              unmet: labels.unmet,
              fullFlowLevel: labels.fullFlowLevel,
            }}
          />
        )}
      </div>
    </section>
  )
}

const FlowColumn: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  return (
    <div className="space-y-2 rounded-xl border border-border-color bg-input-bg/50 p-2.5">
      <h4 className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">{title}</h4>
      <div className="space-y-1.5">{children}</div>
    </div>
  )
}

interface FlowNodeButtonProps {
  goal: Goal
  side: 'left' | 'right'
  suffix: string
  status: string
  statusClass: string
  onClick: (id: string) => void
  showMastery: boolean
  registerRef: (el: HTMLButtonElement | null) => void
}

const FlowNodeButton: React.FC<FlowNodeButtonProps> = ({
  goal,
  side,
  suffix,
  status,
  statusClass,
  onClick,
  showMastery,
  registerRef,
}) => {
  return (
    <button
      type="button"
      ref={registerRef}
      onClick={() => onClick(goal.id)}
      className={`w-full rounded-xl border border-border-color bg-chat-bg px-2.5 py-2 text-left transition-colors hover:border-sky-400/80 ${side === 'right' ? 'lg:text-right' : ''}`}
    >
      <InlineMathText text={goal.title} className="block text-xs font-semibold text-text-primary" />
      <div className={`mt-1 flex items-center gap-2 text-[10px] text-text-secondary ${side === 'right' ? 'lg:justify-end' : ''}`}>
        <span className="rounded-full bg-sidebar-bg px-1.5 py-0.5">{suffix}</span>
        {showMastery && <span className={statusClass}>{status}</span>}
      </div>
    </button>
  )
}

const EmptyFlowLabel: React.FC<{ label: string }> = ({ label }) => {
  return <p className="rounded-xl border border-dashed border-border-color px-2.5 py-2 text-[11px] text-text-secondary">{label}</p>
}

const OverflowLabel: React.FC<{ text: string }> = ({ text }) => {
  return <p className="text-right text-[10px] font-semibold uppercase tracking-wide text-text-secondary">{text}</p>
}

const LegendSwatch: React.FC<{ className: string; label: string; dashed?: boolean }> = ({ className, label, dashed = false }) => {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`inline-block w-5 ${dashed
          ? `h-0 border-t border-dashed border-current bg-transparent ${className}`
          : `h-0.5 ${className}`}`}
      />
      <span>{label}</span>
    </span>
  )
}
