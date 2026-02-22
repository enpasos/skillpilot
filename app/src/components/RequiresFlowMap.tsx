import React, { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { UiGoal as Goal } from '../goalTypes'
import { InlineMathText } from './InlineMathText'

type PrereqKind = 'direct' | 'inherited'

type FlowNode = {
  goal: Goal
  kind: PrereqKind
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
  forward: Goal[]
  getMastery: (goalId: string) => number
  onNavigate: (id: string) => void
  masteredThreshold?: number
  compact?: boolean
}

const MAX_LEFT_NODES = 7
const MAX_RIGHT_NODES = 7

export const RequiresFlowMap: React.FC<RequiresFlowMapProps> = ({
  language,
  currentGoal,
  requires,
  inheritedRequires,
  forward,
  getMastery,
  onNavigate,
  masteredThreshold = 0.8,
  compact = false,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const centerRef = useRef<HTMLDivElement | null>(null)
  const leftRefs = useRef<Map<string, HTMLButtonElement>>(new Map())
  const rightRefs = useRef<Map<string, HTMLButtonElement>>(new Map())
  const markerId = useId().replace(/:/g, '')
  const [connectors, setConnectors] = useState<Connector[]>([])
  const [showConnectors, setShowConnectors] = useState(false)

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

    return merged
  }, [requires, inheritedRequires])

  const leftVisible = leftNodes.slice(0, MAX_LEFT_NODES)
  const rightVisible = forward.slice(0, MAX_RIGHT_NODES)
  const leftOverflow = Math.max(0, leftNodes.length - leftVisible.length)
  const rightOverflow = Math.max(0, forward.length - rightVisible.length)

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

      rightVisible.forEach((goal) => {
        const el = rightRefs.current.get(goal.id)
        if (!el) return
        const rect = el.getBoundingClientRect()
        const toX = rect.left - containerRect.left
        const toY = rect.top - containerRect.top + rect.height / 2

        const active = goal.requires.every((reqId) => getMastery(reqId) >= masteredThreshold)

        nextConnectors.push({
          id: `right-${goal.id}`,
          fromX: centerRightX,
          fromY: centerY,
          toX,
          toY,
          kind: 'outbound',
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
      title: 'Requires Flow (Prototype)',
      subtitle: 'Direct prerequisites and unlocked next goals around the current node.',
      direct: 'direct',
      inherited: 'inherited',
      current: 'current goal',
      unmet: 'open',
      met: 'met',
      unlocks: 'unlocks',
      noIncoming: 'No prerequisites in view',
      noOutgoing: 'No follow-up goals in view',
      plusMore: '+{{count}} more',
    }
    : {
      title: 'Requires-Flow (Prototyp)',
      subtitle: 'Direkte/vererbte Voraussetzungen und nächste freischaltbare Ziele.',
      direct: 'direkt',
      inherited: 'vererbt',
      current: 'aktuelles Ziel',
      unmet: 'offen',
      met: 'erfüllt',
      unlocks: 'schaltet frei',
      noIncoming: 'Keine Voraussetzungen im Fokus',
      noOutgoing: 'Keine Folgeziele im Fokus',
      plusMore: '+{{count}} weitere',
    }

  return (
    <section className="glass-panel border-sky-500/30 bg-sidebar-bg/80 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">{labels.title}</h3>
          <p className="text-[11px] text-text-secondary">{labels.subtitle}</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-text-secondary">
          <LegendSwatch className="bg-sky-500" label={labels.direct} />
          <LegendSwatch className="bg-slate-400" label={labels.inherited} dashed />
          <LegendSwatch className="bg-emerald-500" label={labels.unlocks} />
        </div>
      </div>

      <div ref={containerRef} className="relative">
        {showConnectors && connectors.length > 0 && (
          <svg className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible" aria-hidden="true">
            <defs>
              <marker
                id={markerId}
                markerWidth="7"
                markerHeight="7"
                refX="6"
                refY="3.5"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L7,3.5 L0,7 z" fill="currentColor" />
              </marker>
            </defs>
            {connectors.map((line) => {
              const curve = Math.max(42, Math.abs(line.toX - line.fromX) * 0.32)
              const d = `M ${line.fromX} ${line.fromY} C ${line.fromX + curve} ${line.fromY}, ${line.toX - curve} ${line.toY}, ${line.toX} ${line.toY}`
              const tone = line.active
                ? line.kind === 'outbound'
                  ? 'text-emerald-500/90'
                  : 'text-sky-500/90'
                : 'text-slate-400/80'
              return (
                <path
                  key={line.id}
                  d={d}
                  fill="none"
                  className={tone}
                  stroke="currentColor"
                  strokeWidth={line.active ? 2.25 : 1.5}
                  strokeDasharray={line.inherited ? '5 4' : undefined}
                  markerEnd={`url(#${markerId})`}
                />
              )
            })}
          </svg>
        )}

        <div
          className={`relative z-10 grid grid-cols-1 gap-3 ${
            compact ? '' : 'lg:grid-cols-[minmax(0,1fr)_minmax(340px,460px)_minmax(0,1fr)] lg:items-center lg:gap-x-10'
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
            {rightVisible.map((goal) => {
              const unlocked = goal.requires.every((reqId) => getMastery(reqId) >= masteredThreshold)
              return (
                <FlowNodeButton
                  key={goal.id}
                  goal={goal}
                  side="right"
                  suffix={labels.unlocks}
                  status={unlocked ? labels.met : labels.unmet}
                  statusClass={unlocked ? 'text-emerald-600 dark:text-emerald-300' : 'text-slate-500 dark:text-slate-300'}
                  onClick={onNavigate}
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
  registerRef: (el: HTMLButtonElement | null) => void
}

const FlowNodeButton: React.FC<FlowNodeButtonProps> = ({
  goal,
  side,
  suffix,
  status,
  statusClass,
  onClick,
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
        <span className={statusClass}>{status}</span>
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
      <span className={`inline-block h-0.5 w-5 ${className} ${dashed ? 'border-t border-dashed border-current bg-transparent text-slate-400' : ''}`} />
      <span>{label}</span>
    </span>
  )
}
