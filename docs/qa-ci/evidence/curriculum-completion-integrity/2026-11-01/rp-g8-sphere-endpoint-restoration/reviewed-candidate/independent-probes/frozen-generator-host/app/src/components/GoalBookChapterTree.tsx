import React, { useId, useMemo, useRef, useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type {
  GoalBookResolvedChapterProjection,
  GoalBookResolvedChapterProjectionNode,
} from '../utils/goalBookRuntime'

interface GoalBookChapterTreeProps {
  projection: GoalBookResolvedChapterProjection
  selectedNodeId: string | null
  activeGoalId: string | null
  allGoalsLabel: string
  goalsLabel: string
  expandLabel: (label: string) => string
  collapseLabel: (label: string) => string
  onSelectNode: (nodeId: string | null) => void
  onSelectGoal?: () => void
}

const EMPTY_EXPANSION_OVERRIDES = new Map<string, boolean>()

const effectiveRootNodeIds = (
  projection: GoalBookResolvedChapterProjection,
  nodesById: ReadonlyMap<string, GoalBookResolvedChapterProjectionNode>,
): string[] => {
  if (projection.rootNodeIds.length !== 1) return projection.rootNodeIds
  const root = nodesById.get(projection.rootNodeIds[0])
  if (
    !root
    || root.kind === 'goal'
    || root.descendantGoalCount !== projection.goalIds.length
  ) return projection.rootNodeIds
  return root.childNodeIds
}

export const GoalBookChapterTree: React.FC<GoalBookChapterTreeProps> = ({
  projection,
  selectedNodeId,
  activeGoalId,
  allGoalsLabel,
  goalsLabel,
  expandLabel,
  collapseLabel,
  onSelectNode,
  onSelectGoal,
}) => {
  const treeId = useId().replace(/[^A-Za-z0-9_-]/gu, '')
  const nodesById = useMemo(
    () => new Map(projection.nodes.map((node) => [node.nodeId, node])),
    [projection.nodes],
  )
  const nodeIndexes = useMemo(
    () => new Map(projection.nodes.map((node, index) => [node.nodeId, index])),
    [projection.nodes],
  )
  const goalNode = useMemo(
    () => projection.nodes.find((node) => node.kind === 'goal' && node.goalId === activeGoalId) ?? null,
    [activeGoalId, projection.nodes],
  )
  const rootNodeIds = useMemo(
    () => effectiveRootNodeIds(projection, nodesById),
    [nodesById, projection],
  )
  const expansionContextKey = `${projection.projectionId}\u0000${activeGoalId ?? ''}`
  const [expansionState, setExpansionState] = useState<{
    contextKey: string
    overrides: Map<string, boolean>
  }>(() => ({ contextKey: expansionContextKey, overrides: new Map() }))
  const expansionOverrides = expansionState.contextKey === expansionContextKey
    ? expansionState.overrides
    : EMPTY_EXPANSION_OVERRIDES
  const rowRefs = useRef(new Map<string, HTMLButtonElement | HTMLAnchorElement>())

  const setExpansionOverride = (nodeId: string, expanded: boolean) => {
    setExpansionState((current) => ({
      contextKey: expansionContextKey,
      overrides: new Map(
        current.contextKey === expansionContextKey ? current.overrides : [],
      ).set(nodeId, expanded),
    }))
  }

  const expandedNodeIds = useMemo(() => {
    const next = new Set<string>()
    const openPath = (nodeId: string | null, includeNode: boolean) => {
      let currentNodeId = nodeId
      let first = true
      while (currentNodeId) {
        const node = nodesById.get(currentNodeId)
        if (!node) break
        if ((!first || includeNode) && node.childNodeIds.length > 0) next.add(node.nodeId)
        currentNodeId = node.parentNodeId
        first = false
      }
    }
    openPath(selectedNodeId, true)
    openPath(goalNode?.nodeId ?? null, false)
    expansionOverrides.forEach((expanded, nodeId) => {
      if (!nodesById.has(nodeId)) return
      if (expanded) next.add(nodeId)
      else next.delete(nodeId)
    })
    return next
  }, [expansionOverrides, goalNode?.nodeId, nodesById, selectedNodeId])

  const visibleNodeIds = useMemo(() => {
    const visible: string[] = []
    const visit = (nodeId: string) => {
      const node = nodesById.get(nodeId)
      if (!node) return
      visible.push(nodeId)
      if (expandedNodeIds.has(nodeId)) node.childNodeIds.forEach(visit)
    }
    rootNodeIds.forEach(visit)
    return visible
  }, [expandedNodeIds, nodesById, rootNodeIds])

  const focusNode = (nodeId: string | undefined) => {
    if (!nodeId) return
    window.requestAnimationFrame(() => rowRefs.current.get(nodeId)?.focus())
  }

  const onNodeKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement | HTMLAnchorElement>,
    node: GoalBookResolvedChapterProjectionNode,
  ) => {
    const index = visibleNodeIds.indexOf(node.nodeId)
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      focusNode(visibleNodeIds[index + 1])
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      focusNode(visibleNodeIds[index - 1])
    } else if (event.key === 'Home') {
      event.preventDefault()
      focusNode(visibleNodeIds[0])
    } else if (event.key === 'End') {
      event.preventDefault()
      focusNode(visibleNodeIds.at(-1))
    } else if (event.key === 'ArrowRight' && node.childNodeIds.length > 0) {
      event.preventDefault()
      if (!expandedNodeIds.has(node.nodeId)) {
        setExpansionOverride(node.nodeId, true)
      } else {
        focusNode(node.childNodeIds[0])
      }
    } else if (event.key === 'ArrowLeft') {
      const displayedParent = node.parentNodeId && visibleNodeIds.includes(node.parentNodeId)
        ? node.parentNodeId
        : null
      if (expandedNodeIds.has(node.nodeId) && node.childNodeIds.length > 0) {
        event.preventDefault()
        setExpansionOverride(node.nodeId, false)
      } else if (displayedParent) {
        event.preventDefault()
        focusNode(displayedParent)
      }
    }
  }

  const toggleNode = (nodeId: string) => {
    const nextExpanded = !expandedNodeIds.has(nodeId)
    setExpansionOverride(nodeId, nextExpanded)
  }

  const renderNodes = (nodeIds: string[], depth: number): React.ReactNode => (
    <ul
      className={depth === 0
        ? 'mt-1 min-w-0 space-y-0.5'
        : 'ml-3 min-w-0 border-l border-slate-200 pl-1 dark:border-slate-700'}
    >
      {nodeIds.map((nodeId) => {
        const node = nodesById.get(nodeId)
        if (!node) return null
        const hasChildren = node.childNodeIds.length > 0
        const expanded = hasChildren && expandedNodeIds.has(node.nodeId)
        const selected = node.kind !== 'goal' && selectedNodeId === node.nodeId
        const activeGoal = node.kind === 'goal' && activeGoalId === node.goalId
        const rowClassName = `min-h-11 min-w-0 flex-1 rounded-lg px-2 py-2 text-left text-sm leading-tight transition focus:outline-none focus:ring-2 focus:ring-sky-500 ${
          selected
            ? 'bg-sky-700 text-white'
            : activeGoal
              ? 'bg-sky-50 text-sky-900 ring-1 ring-inset ring-sky-300 dark:bg-sky-950/40 dark:text-sky-100 dark:ring-sky-800'
              : 'hover:bg-slate-100 dark:hover:bg-slate-800'
        }`
        const sharedRowProps = {
          ref: (element: HTMLButtonElement | HTMLAnchorElement | null) => {
            if (element) rowRefs.current.set(node.nodeId, element)
            else rowRefs.current.delete(node.nodeId)
          },
          onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement | HTMLAnchorElement>) => (
            onNodeKeyDown(event, node)
          ),
          className: rowClassName,
        }
        return (
          <li
            key={node.nodeId}
            className="min-w-0"
          >
            <div className="flex min-w-0 items-start gap-0.5">
              {hasChildren ? (
                <button
                  type="button"
                  aria-label={expanded ? collapseLabel(node.label) : expandLabel(node.label)}
                  aria-expanded={expanded}
                  aria-controls={expanded
                    ? `${treeId}-children-${nodeIndexes.get(node.nodeId) ?? 0}`
                    : undefined}
                  onClick={() => toggleNode(node.nodeId)}
                  className="mt-1 inline-flex min-h-9 min-w-9 shrink-0 items-center justify-center rounded-md text-text-secondary transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:hover:bg-slate-800"
                >
                  {expanded
                    ? <ChevronDown size={18} aria-hidden="true" />
                    : <ChevronRight size={18} aria-hidden="true" />}
                </button>
              ) : <span aria-hidden="true" className="block w-9 shrink-0" />}
              {node.kind === 'goal' && node.goalId ? (
                <a
                  {...sharedRowProps}
                  href={`#goal-${node.goalId}`}
                  aria-current={activeGoal ? 'page' : undefined}
                  onClick={onSelectGoal}
                >
                  <span className="block break-words font-medium [overflow-wrap:anywhere]">{node.label}</span>
                  <span className="mt-0.5 block break-all font-mono text-[10px] opacity-65">{node.goalId}</span>
                </a>
              ) : (
                <button
                  {...sharedRowProps}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onSelectNode(node.nodeId)}
                >
                  <span className="block break-words font-medium [overflow-wrap:anywhere]">{node.label}</span>
                  <span className="mt-0.5 block text-xs opacity-70">
                    {node.descendantGoalCount} {goalsLabel}
                  </span>
                </button>
              )}
            </div>
            {expanded && (
              <div id={`${treeId}-children-${nodeIndexes.get(node.nodeId) ?? 0}`}>
                {renderNodes(node.childNodeIds, depth + 1)}
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )

  return (
    <>
      <button
        type="button"
        onClick={() => onSelectNode(null)}
        aria-pressed={selectedNodeId === null}
        className={`mt-2 min-h-11 w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-sky-500 ${selectedNodeId === null ? 'bg-sky-700 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
      >
        {allGoalsLabel} <span className="opacity-75">({projection.goalIds.length})</span>
      </button>
      {renderNodes(rootNodeIds, 0)}
    </>
  )
}
