import React, { useState } from 'react'
import { Target, Send, Check, Play } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import type { UiGoal } from '../goalTypes'
import { sortGoalsTopologically } from '../utils/goalSorter'
import { isMastered } from '../goalUiUtils'
import { InlineMathText } from './InlineMathText'

interface TreeNodeProps {
  goalId: string
  allGoals: Map<string, UiGoal>
  getMastery: (goalId: string) => number
  plannedGoals: Set<string>
  onTogglePlan: (id: string) => void
  onSelect: (id: string) => void
  selectedId: string
  depth?: number
  activeFilter?: string

  aggregatedPlannedGoals?: Map<string, number>
  totalStudents?: number
  personalConfig?: Record<string, { selected: boolean; filterId?: string }>
  hasActivePlan?: boolean
  isInPlannedSubtree?: boolean
  activeGoalId?: string
  forcedExpandedIds?: Set<string>
  frontierIds?: Set<string>
}

const TreeNode: React.FC<TreeNodeProps> = ({
  goalId,
  allGoals,
  getMastery,
  plannedGoals,
  onTogglePlan,
  onSelect,
  selectedId,
  depth = 0,
  activeFilter,
  aggregatedPlannedGoals,
  totalStudents,
  personalConfig,
  hasActivePlan = false,
  isInPlannedSubtree = false,
  activeGoalId,
  forcedExpandedIds,
  frontierIds,
}) => {
  const t = useTranslation()
  const goal = allGoals.get(goalId)
  const [isExpanded, setIsExpanded] = useState(depth < 1)

  // Force expansion if this ID is in the forced set
  React.useEffect(() => {
    if (forcedExpandedIds && forcedExpandedIds.has(goalId)) {
      setIsExpanded(true)
    }
  }, [forcedExpandedIds, goalId])


  /* eslint-disable react-hooks/exhaustive-deps */
  // We disable exhaustive-deps for sortedChildren to avoid complex dependency cycles with filtered lists

  const children = goal?.contains || []

  // Check if this level has any "Positive Selection" (at least one sibling explicitly selected).
  const hasPositiveSibling = personalConfig && Object.keys(personalConfig).length > 0 && children.some(childId => {
    const c = allGoals.get(childId)
    if (!c) return false
    const config = (c.landscapeId ? personalConfig[c.landscapeId] : undefined) ?? personalConfig[c.id]
    return config?.selected === true
  })

  // Memoize visibleChildren computation to stabilize dependency for sortedChildren
  const visibleChildren = React.useMemo(() => {
    return children.filter((childId) => {
      // 1. Filter by active activeFilter (e.g. "GK", "LK")
      if (activeFilter && activeFilter !== 'all') {
        const child = allGoals.get(childId)
        if (!child) return false
        if (child.tags && child.tags.length > 0 && !child.tags.includes(activeFilter)) {
          return false
        }
      }

      // 2. Filter by Personal Curriculum (Level 2)
      const child = allGoals.get(childId)
      if (child && personalConfig && Object.keys(personalConfig).length > 0) {
        const config = (child.landscapeId ? personalConfig[child.landscapeId] : undefined) ?? personalConfig[child.id]

        if (config) {
          if (config.selected !== true) return false

          // 3. Filter by 'filterId' (e.g. "LK", "GK") if configured for this landscape
          if (config.filterId && child.tags && child.tags.length > 0 && !child.tags.includes(config.filterId)) {
            return false
          }
        } else {
          if (hasPositiveSibling) return false
        }
      }

      return true
    })
  }, [children, activeFilter, allGoals, personalConfig, hasPositiveSibling])

  // Sort visible children
  const sortedChildren = React.useMemo(() => {
    // Map IDs to Goal Objects
    const goals = visibleChildren
      .map(id => allGoals.get(id))
      .filter((g): g is UiGoal => !!g)

    // Sort topologically + alphabetical
    const sorted = sortGoalsTopologically(goals)

    // Return IDs
    return sorted.map(g => g.id)
  }, [visibleChildren, allGoals])

  if (!goal) return null

  const hasChildren = sortedChildren.length > 0
  const mastery = getMastery(goal.id)
  const mastered = isMastered(mastery)
  const isPlanned = plannedGoals.has(goal.id)
  const isSelected = selectedId === goal.id
  const isFrontier = frontierIds?.has(goal.id)

  // Propagate: If I am in the subtree (passed from parent) OR I am the start of the plan
  const selfInSubtree = isInPlannedSubtree || isPlanned

  // Active Plan Strategy:
  const isDimmed = hasActivePlan && !selfInSubtree

  const plannedCount = aggregatedPlannedGoals?.get(goal.id) ?? 0

  return (
    <div className="">
      <div
        className={`flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer transition-colors border border-transparent ${isSelected ? 'bg-sky-100 dark:bg-sky-900/40 border-sky-300 dark:border-sky-500/50' : 'hover:bg-slate-200 dark:hover:bg-slate-800/50'
          }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => onSelect(goal.id)}
      >
        <button
          onClick={(e) => {
            e.stopPropagation()
            setIsExpanded(!isExpanded)
          }}
          className={`p-0.5 rounded hover:bg-slate-700 text-slate-400 w-4 h-4 flex items-center justify-center ${!hasChildren ? 'invisible' : ''
            }`}
        >
          <span className="text-[10px]">{isExpanded ? '▼' : '▶'}</span>
        </button>

        {children.length > 0 && (
          <div
            className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex-shrink-0"
            title={`${t.tooltips.progress}: ${(mastery * 100).toFixed(0)}%`}
          >
            <div
              className={`h-full ${mastered ? 'bg-emerald-500' : 'bg-sky-500'}`}
              style={{ width: `${mastery * 100}%` }}
            />
          </div>
        )}

        {children.length === 0 && (
          <div
            className={`mr-1 ${isDimmed
              ? 'text-slate-300 dark:text-slate-600'
              : mastered
                ? 'text-emerald-500'
                : isFrontier
                  ? 'text-sky-500 animate-pulse' // Highlight Frontier Icon
                  : 'text-red-500'
              }`}
          >
            {mastered ? (
              <Check size={16} strokeWidth={3} />
            ) : activeGoalId === goal.id ? (
              <Send size={16} className="text-amber-500" />
            ) : isFrontier ? (
              // Use Play or Zap for Frontier
              <Play size={16} fill="currentColor" strokeWidth={0} />
            ) : (
              <Target size={16} />
            )}
          </div>
        )}

        <InlineMathText
          text={goal.title}
          title={goal.title}
          className={`text-sm truncate flex-1 transition-colors ${isDimmed
            ? 'text-slate-300 dark:text-slate-600' // Dimmed (Outside Scope)
            : isPlanned
              ? 'text-slate-900 dark:text-slate-100 font-medium' // Planned (Focus)
              : mastered
                ? 'text-slate-500 dark:text-slate-400' // Mastered (Normal Scope)
                : isFrontier
                  ? 'text-sky-600 dark:text-sky-400 font-semibold' // Frontier (Highlighted)
                  : 'text-slate-700 dark:text-slate-200' // Open (Normal Scope)
            }`}
        />

        {aggregatedPlannedGoals ? (
          <div className="flex items-center gap-1 text-slate-500">
            {plannedCount > 0 && (
              <>
                <span className="text-amber-400">★</span>
                <span className="text-xs">{plannedCount}</span>
              </>
            )}
          </div>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onTogglePlan(goal.id)
            }}
            className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${isPlanned ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600 hover:text-amber-400 dark:hover:text-amber-200'
              }`}
            title={isPlanned ? t.tooltips.removeFromList : t.tooltips.addToList}
          >
            ★
          </button>
        )}
      </div>

      {
        isExpanded && hasChildren && (
          <div>
            {sortedChildren.map((childId) => (
              <TreeNode
                key={childId}
                goalId={childId}
                allGoals={allGoals}
                getMastery={getMastery}
                plannedGoals={plannedGoals}
                onTogglePlan={onTogglePlan}
                onSelect={onSelect}
                selectedId={selectedId}
                depth={depth + 1}
                activeFilter={activeFilter}
                aggregatedPlannedGoals={aggregatedPlannedGoals}
                totalStudents={totalStudents}
                personalConfig={personalConfig}
                hasActivePlan={hasActivePlan}
                isInPlannedSubtree={selfInSubtree}
                activeGoalId={activeGoalId}
                forcedExpandedIds={forcedExpandedIds}
                frontierIds={frontierIds}
              />
            ))}
          </div>
        )
      }
    </div >
  )
}

interface CompetenceTreeProps {
  rootGoals: UiGoal[]
  allGoals: Map<string, UiGoal>
  getMastery: (goalId: string) => number
  plannedGoals: Set<string>
  onTogglePlan: (id: string) => void
  onSelect: (id: string) => void
  selectedId: string
  activeFilter?: string

  aggregatedPlannedGoals?: Map<string, number>
  totalStudents?: number
  personalConfig?: Record<string, { selected: boolean; filterId?: string }>
  activeGoalId?: string
  forcedExpandedIds?: Set<string>
  frontierIds?: Set<string>
}

export const CompetenceTree: React.FC<CompetenceTreeProps> = ({ rootGoals, activeFilter, personalConfig, ...props }) => {
  // We don't strictly filter root goals by activeFilter, because root goals usually represent 'Structure' (e.g. 'Fächer')
  // and might not have the specific tags (e.g. 'GK') that their children have.
  // We let TreeNode handle the filtering of children.
  const visibleRoots = rootGoals
  const hasActivePlan = props.plannedGoals.size > 0

  return (
    <div className="flex flex-col gap-1 overflow-y-auto max-h-full pr-2">
      {visibleRoots.map((g) => (
        <TreeNode
          key={g.id}
          goalId={g.id}
          activeFilter={activeFilter}
          personalConfig={personalConfig}
          hasActivePlan={hasActivePlan}
          isInPlannedSubtree={false}
          {...props}
        />
      ))}
    </div>
  )
}
