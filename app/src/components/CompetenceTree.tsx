import React, { useState } from 'react'
import { Target, Send, Check, Square, SquareX } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import type { UiGoal } from '../goalTypes'
import { sortGoalsTopologically } from '../utils/goalSorter'
import { isMastered } from '../goalUiUtils'
import { InlineMathText } from './InlineMathText'
import { goalMatchesFilter, isWildcardFilter } from '../utils/goalFilters'

export type TreeStructureMode = 'all' | 'content' | 'competency'

const COMPETENCY_DIMENSION_ROOT_TAG = 'competency-axis:dimension-root'

const isCompetencyDimensionRoot = (goal: UiGoal) =>
  (goal.tags ?? []).includes(COMPETENCY_DIMENSION_ROOT_TAG)

interface TreeNodeProps {
  goalId: string
  allGoals: Map<string, UiGoal>
  getMastery: (goalId: string) => number
  plannedGoals: Set<string>
  onTogglePlan: (id: string) => void
  readOnly?: boolean
  onSelect: (id: string) => void
  selectedId: string
  depth?: number
  activeFilter?: string
  structureMode?: TreeStructureMode

  aggregatedPlannedGoals?: Map<string, number>
  totalStudents?: number
  personalConfig?: Record<string, { selected: boolean; filterId?: string }>
  hasActivePlan?: boolean
  isInPlannedSubtree?: boolean
  activeGoalId?: string
  forcedExpandedIds?: Set<string>
  frontierIds?: Set<string>
}

const formatFilterLabel = (filterId?: string) => {
  if (!filterId) return undefined
  if (filterId === 'GK') return 'GK'
  if (filterId === 'LK') return 'LK'
  if (isWildcardFilter(filterId)) return 'GK+LK'
  return filterId
}

const TreeNode: React.FC<TreeNodeProps> = ({
  goalId,
  allGoals,
  getMastery,
  plannedGoals,
  onTogglePlan,
  readOnly = false,
  onSelect,
  selectedId,
  depth = 0,
  activeFilter,
  structureMode = 'all',
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


  const getVisibleChildrenIds = React.useCallback((parentId: string) => {
    const parent = allGoals.get(parentId)
    const childIds = parent?.contains ?? []
    if (childIds.length === 0) return []

    const hasConfig = !!personalConfig && Object.keys(personalConfig).length > 0

    // Check if this level has any "Positive Selection" (at least one sibling explicitly selected).
    const hasPositiveSibling = hasConfig && childIds.some(childId => {
      const c = allGoals.get(childId)
      if (!c) return false
      const config = (c.landscapeId ? personalConfig[c.landscapeId] : undefined) ?? personalConfig[c.id]
      return config?.selected === true
    })

    return childIds.filter((childId) => {
      const child = allGoals.get(childId)
      if (!child) return false

      // Apply the currently active cockpit filter (e.g. DE-BY/DE-HE or GK/LK)
      // on top of personal curriculum selections.
      if (!goalMatchesFilter(child, activeFilter)) {
        return false
      }

      if (parent?.tags?.includes('root')) {
        const isCompetencyRoot = isCompetencyDimensionRoot(child)
        if (structureMode === 'content' && isCompetencyRoot) {
          return false
        }
        if (structureMode === 'competency' && !isCompetencyRoot) {
          return false
        }
      }

      // 2. Filter by Personal Curriculum (Level 2)
      if (child && hasConfig) {
        const config = (child.landscapeId ? personalConfig[child.landscapeId] : undefined) ?? personalConfig[child.id]

        if (config) {
          if (config.selected !== true) return false

          // 3. Filter by 'filterId' (e.g. "LK", "GK") if configured for this landscape
          if (!goalMatchesFilter(child, config.filterId)) {
            return false
          }
        } else {
          if (hasPositiveSibling) return false
        }
      }

      return true
    })
  }, [activeFilter, allGoals, personalConfig, structureMode])

  // Memoize visibleChildren computation to stabilize dependency for sortedChildren
  const visibleChildren = React.useMemo(() => {
    return getVisibleChildrenIds(goalId)
  }, [getVisibleChildrenIds, goalId])

  // Sort visible children
  const sortedChildren = React.useMemo(() => {
    // Map IDs to Goal Objects
    const goals = visibleChildren
      .map(id => allGoals.get(id))
      .filter((g): g is UiGoal => !!g)

    // Sort topologically + alphabetical
    const sorted = sortGoalsTopologically(goals, { allGoalsById: allGoals })

    // Return IDs
    return sorted.map(g => g.id)
  }, [visibleChildren, allGoals])

  const mastery = React.useMemo(() => {
    if (!goal) return 0
    const masteryCache = new Map<string, { masterySum: number; weightSum: number }>()

    const getFilteredTotals = (gId: string, visited: Set<string> = new Set()) => {
      if (masteryCache.has(gId)) return masteryCache.get(gId)!
      if (visited.has(gId)) return { masterySum: 0, weightSum: 0 }

      visited.add(gId)
      const g = allGoals.get(gId)
      if (!g) return { masterySum: 0, weightSum: 0 }

      let masterySum = 0
      let weightSum = 0
      const childrenIds = g.contains ?? []

      if (childrenIds.length === 0) {
        const masteryValue = getMastery(gId)
        const weight = g.weight ?? 1
        masterySum = masteryValue * weight
        weightSum = weight
      } else {
        const filteredChildren = getVisibleChildrenIds(gId)
        filteredChildren.forEach((childId) => {
          const childTotals = getFilteredTotals(childId, new Set(visited))
          masterySum += childTotals.masterySum
          weightSum += childTotals.weightSum
        })
      }

      visited.delete(gId)
      masteryCache.set(gId, { masterySum, weightSum })
      return { masterySum, weightSum }
    }

    const totals = getFilteredTotals(goal.id)
    return totals.weightSum > 0 ? totals.masterySum / totals.weightSum : 0
  }, [goal, allGoals, getMastery, getVisibleChildrenIds])
  if (!goal) return null

  const hasChildren = sortedChildren.length > 0
  const mastered = isMastered(mastery)
  const isPlanned = plannedGoals.has(goal.id)
  const isSelected = selectedId === goal.id
  // Frontier highlighting is intentionally disabled (we only mark active goal + mastery).

  // Propagate: If I am in the subtree (passed from parent) OR I am the start of the plan
  const selfInSubtree = isInPlannedSubtree || isPlanned

  // Active Plan Strategy:
  const isDimmed = hasActivePlan && !selfInSubtree

  const plannedCount = aggregatedPlannedGoals?.get(goal.id) ?? 0

  const personalFilterId = (goal.landscapeId ? personalConfig?.[goal.landscapeId]?.filterId : undefined)
    ?? personalConfig?.[goal.id]?.filterId
  const effectiveFilterLabel = formatFilterLabel(
    personalFilterId && personalFilterId !== 'all'
      ? personalFilterId
      : (activeFilter && activeFilter !== 'all' ? activeFilter : undefined),
  )
  const shouldShowFilterBadge = depth === 1 && !!effectiveFilterLabel
  const displayTitle = shouldShowFilterBadge ? `${goal.title} (${effectiveFilterLabel})` : goal.title

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

        {hasChildren && (
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

        {!hasChildren && (
          <div
            className={`mr-1 ${isDimmed
              ? 'text-slate-300 dark:text-slate-600'
              : mastered
                ? 'text-emerald-500'
                : 'text-red-500'
              }`}
          >
            {mastered ? (
              <Check size={16} strokeWidth={3} />
            ) : activeGoalId === goal.id ? (
              <Send size={16} className="text-amber-500" />
            ) : (
              <Target size={16} />
            )}
          </div>
        )}

        <InlineMathText
          text={displayTitle}
          title={displayTitle}
          className={`text-sm truncate flex-1 transition-colors ${isDimmed
            ? 'text-slate-300 dark:text-slate-600' // Dimmed (Outside Scope)
            : isPlanned
              ? 'text-slate-900 dark:text-slate-100 font-medium' // Planned (Focus)
              : mastered
                ? 'text-slate-500 dark:text-slate-400' // Mastered (Normal Scope)
                : 'text-slate-700 dark:text-slate-200' // Open (Normal Scope)
            }`}
        />

        {aggregatedPlannedGoals ? (
          <div className="flex items-center gap-1 text-slate-500">
            {plannedCount > 0 && (
              <>
                <SquareX size={14} className="text-red-500" />
                <span className="text-xs">{plannedCount}</span>
              </>
            )}
          </div>
        ) : (
          readOnly ? (
            <div
              className={`p-1 ${isPlanned ? 'text-red-400' : 'text-slate-300 dark:text-slate-600'}`}
              title="In der Legacy-Ansicht schreibgeschuetzt"
            >
              {isPlanned ? <SquareX size={16} className="text-red-400" /> : <Square size={16} className="text-slate-300" />}
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
              {isPlanned ? <SquareX size={16} className="text-red-500" /> : <Square size={16} className="text-slate-300" />}
            </button>
          )
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
                readOnly={readOnly}
                onSelect={onSelect}
                selectedId={selectedId}
                depth={depth + 1}
                activeFilter={activeFilter}
                structureMode={structureMode}
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
  readOnly?: boolean
  onSelect: (id: string) => void
  selectedId: string
  activeFilter?: string
  structureMode?: TreeStructureMode

  aggregatedPlannedGoals?: Map<string, number>
  totalStudents?: number
  personalConfig?: Record<string, { selected: boolean; filterId?: string }>
  activeGoalId?: string
  forcedExpandedIds?: Set<string>
  frontierIds?: Set<string>
}

export const CompetenceTree: React.FC<CompetenceTreeProps> = ({
  rootGoals,
  activeFilter,
  personalConfig,
  structureMode = 'all',
  ...props
}) => {
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
          structureMode={structureMode}
          personalConfig={personalConfig}
          hasActivePlan={hasActivePlan}
          isInPlannedSubtree={false}
          {...props}
        />
      ))}
    </div>
  )
}
