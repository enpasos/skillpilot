import React, { useState } from 'react'
import { Target, Send, Check, Square, SquareX } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { useLanguage } from '../contexts/LanguageContext'
import type { UiGoal } from '../goalTypes'
import { sortGoalsTopologically } from '../utils/goalSorter'
import { isMastered } from '../goalUiUtils'
import { InlineMathText } from './InlineMathText'
import { isWildcardFilter } from '../utils/goalFilters'
import { isCourseProfileFilterId } from '../utils/personalCurriculumStageScope'
import { formatFilterDisplayLabel, formatJurisdictionScopedTitle, type LabelLanguage } from '../utils/filterLabels'
import { normalizeJurisdictionCode } from '../utils/jurisdictionMetadata'
import {
  buildVisibleChildrenMap,
  getRenderedChildIds,
  isSyntheticProgramUnit,
  type TreeAudience,
  type TreePhaseContext,
  type TreeStructureMode,
} from '../utils/treeProjectionRuntime'

const getContextualTreeTitle = (goal: UiGoal, parentGoal?: UiGoal): string => {
  if (!parentGoal || !isSyntheticProgramUnit(parentGoal)) return goal.title

  if (parentGoal.title === 'Sekundarstufe I') {
    return goal.title.replace(/\s+\(Sek I\)$/u, '')
  }

  if (parentGoal.title === 'Sekundarstufe II') {
    return goal.title.replace(/\s+\(Sek II\)$/u, '')
  }

  return goal.title
}

const COURSE_PROFILE_SUFFIX_PATTERN = /\s+\((GK|LK|GK\+LK)\)$/u

const isSek2ProgramUnitTitle = (title: string) => {
  const normalizedTitle = title.trim()
  return normalizedTitle === 'Sekundarstufe II'
    || normalizedTitle.startsWith('Sekundarstufe II ')
    || normalizedTitle.startsWith('Kursstufe')
}

const isSek2ProgramUnit = (goal?: UiGoal) =>
  !!goal && isSyntheticProgramUnit(goal) && isSek2ProgramUnitTitle(goal.title)

const buildSortedChildrenMap = (
  visibleChildrenByParent: Map<string, string[]>,
  allGoals: Map<string, UiGoal>,
) => {
  const sortedChildrenByParent = new Map<string, string[]>()

  visibleChildrenByParent.forEach((childIds, parentId) => {
    const goals = childIds
      .map((id) => allGoals.get(id))
      .filter((goal): goal is UiGoal => !!goal)
    const sorted = sortGoalsTopologically(goals, { allGoalsById: allGoals })
    sortedChildrenByParent.set(parentId, sorted.map((goal) => goal.id))
  })

  return sortedChildrenByParent
}

const buildAggregatedMasteryMap = (
  allGoals: Map<string, UiGoal>,
  visibleChildrenByParent: Map<string, string[]>,
  getMastery: (goalId: string) => number,
) => {
  const totalsByGoalId = new Map<string, { masterySum: number; weightSum: number }>()
  const masteryByGoalId = new Map<string, number>()

  const computeTotals = (goalId: string, visiting: Set<string> = new Set()) => {
    const cached = totalsByGoalId.get(goalId)
    if (cached) return cached
    if (visiting.has(goalId)) return { masterySum: 0, weightSum: 0 }

    visiting.add(goalId)
    const goal = allGoals.get(goalId)
    if (!goal) return { masterySum: 0, weightSum: 0 }

    let masterySum = 0
    let weightSum = 0
    const hasStructuralChildren = (goal.contains ?? []).length > 0
    const visibleChildren = visibleChildrenByParent.get(goalId) ?? []

    if (!hasStructuralChildren) {
      const masteryValue = getMastery(goalId)
      const weight = goal.weight ?? 1
      masterySum = masteryValue * weight
      weightSum = weight
    } else {
      visibleChildren.forEach((childId) => {
        const childTotals = computeTotals(childId, new Set(visiting))
        masterySum += childTotals.masterySum
        weightSum += childTotals.weightSum
      })
    }

    visiting.delete(goalId)
    const totals = { masterySum, weightSum }
    totalsByGoalId.set(goalId, totals)
    masteryByGoalId.set(goalId, weightSum > 0 ? masterySum / weightSum : 0)
    return totals
  }

  allGoals.forEach((_, goalId) => {
    computeTotals(goalId)
  })

  return masteryByGoalId
}

interface TreeNodeProps {
  goalId: string
  allGoals: Map<string, UiGoal>
  getMastery: (goalId: string) => number
  visibleChildrenByParent: Map<string, string[]>
  sortedChildrenByParent: Map<string, string[]>
  masteryByGoalId: Map<string, number>
  plannedGoals: Set<string>
  onTogglePlan: (id: string) => void
  readOnly?: boolean
  onSelect: (id: string) => void
  selectedId: string
  depth?: number
  activeFilter?: string
  structureMode?: TreeStructureMode
  hideTechnicalStructureUi?: boolean
  allowClusterPlanning?: boolean

  aggregatedPlannedGoals?: Map<string, number>
  totalStudents?: number
  personalConfig?: Record<string, { selected: boolean; filterId?: string }>
  hasActivePlan?: boolean
  isInPlannedSubtree?: boolean
  activeGoalId?: string
  forcedExpandedIds?: Set<string>
  frontierIds?: Set<string>
  parentGoalId?: string
  audience?: TreeAudience
  inheritedPhaseContext?: TreePhaseContext
}

const formatFilterLabel = (filterId: string | undefined, language: LabelLanguage) => {
  if (!filterId) return undefined
  if (filterId === 'GK') return 'GK'
  if (filterId === 'LK') return 'LK'
  if (isWildcardFilter(filterId)) return 'GK+LK'
  if (normalizeJurisdictionCode(filterId)) {
    return formatFilterDisplayLabel(filterId, language)
  }
  return filterId
}

const TreeNode: React.FC<TreeNodeProps> = ({
  goalId,
  allGoals,
  getMastery,
  visibleChildrenByParent,
  sortedChildrenByParent,
  masteryByGoalId,
  plannedGoals,
  onTogglePlan,
  readOnly = false,
  onSelect,
  selectedId,
  depth = 0,
  activeFilter,
  structureMode = 'all',
  hideTechnicalStructureUi = false,
  allowClusterPlanning = true,
  aggregatedPlannedGoals,
  totalStudents,
  personalConfig,
  hasActivePlan = false,
  isInPlannedSubtree = false,
  activeGoalId,
  forcedExpandedIds,
  frontierIds,
  parentGoalId,
  audience = 'trainer',
  inheritedPhaseContext,
}) => {
  const t = useTranslation()
  const { language } = useLanguage()
  const localizedLanguage = language === 'en' ? 'en' : 'de'
  const goal = allGoals.get(goalId)
  const parentGoal = parentGoalId ? allGoals.get(parentGoalId) : undefined
  const learnerInitialExpandDepth = 5
  const shouldInitiallyExpand =
    audience === 'learner' && structureMode === 'content'
      ? depth < learnerInitialExpandDepth
      : depth < 1
  const [isExpanded, setIsExpanded] = useState(shouldInitiallyExpand)

  React.useEffect(() => {
    if (shouldInitiallyExpand) {
      setIsExpanded((current) => (current ? current : true))
    }
  }, [shouldInitiallyExpand])

  // Force expansion if this ID is in the forced set
  React.useEffect(() => {
    if (forcedExpandedIds && forcedExpandedIds.has(goalId)) {
      setIsExpanded(true)
    }
  }, [forcedExpandedIds, goalId])

  if (!goal) return null

  const { childIds: renderedChildren, phaseContext } = getRenderedChildIds(
    goalId,
    allGoals,
    sortedChildrenByParent,
    audience,
    inheritedPhaseContext,
  )
  const mastery = masteryByGoalId.get(goalId) ?? 0

  const hasStructuralChildren = (goal.contains ?? []).length > 0
  if (audience === 'learner' && hasStructuralChildren && renderedChildren.length === 0 && !goal.tags?.includes('root')) {
    return null
  }

  const hasChildren = renderedChildren.length > 0
  const mastered = isMastered(mastery)
  const isPlanned = plannedGoals.has(goal.id)
  const isSelected = selectedId === goal.id
  const isSyntheticStructureNode = isSyntheticProgramUnit(goal)
  const hidePlanControlForCluster = !allowClusterPlanning && hasChildren && !isPlanned
  // Frontier highlighting is intentionally disabled (we only mark active goal + mastery).

  // Propagate: If I am in the subtree (passed from parent) OR I am the start of the plan
  const selfInSubtree = isInPlannedSubtree || isPlanned

  // Active Plan Strategy:
  const isDimmed = hasActivePlan && !selfInSubtree

  const plannedCount = aggregatedPlannedGoals?.get(goal.id) ?? 0

  const personalFilterId = (goal.landscapeId ? personalConfig?.[goal.landscapeId]?.filterId : undefined)
    ?? personalConfig?.[goal.id]?.filterId
  const parentLandscapeFilterId = parentGoal?.landscapeId ? personalConfig?.[parentGoal.landscapeId]?.filterId : undefined
  const effectiveFilterLabel = formatFilterLabel(
    personalFilterId && personalFilterId !== 'all'
      ? personalFilterId
      : (activeFilter && activeFilter !== 'all' ? activeFilter : undefined),
    localizedLanguage,
  )
  const jurisdictionRootFilterId =
    personalFilterId && normalizeJurisdictionCode(personalFilterId)
      ? personalFilterId
      : activeFilter && normalizeJurisdictionCode(activeFilter)
        ? activeFilter
        : undefined
  const hasSyntheticSek2Child = (goal.contains ?? []).some((childId) => isSek2ProgramUnit(allGoals.get(childId)))
  const shouldMoveCourseProfileToSek2 =
    depth === 1
    && !!effectiveFilterLabel
    && isCourseProfileFilterId(personalFilterId ?? activeFilter)
    && hasSyntheticSek2Child
  const inheritedSek2FilterLabel =
    isSek2ProgramUnit(goal)
      && isSyntheticStructureNode
      && !COURSE_PROFILE_SUFFIX_PATTERN.test(goal.title)
      && isCourseProfileFilterId(parentLandscapeFilterId)
      ? formatFilterLabel(parentLandscapeFilterId, localizedLanguage)
      : undefined
  const shouldShowFilterBadge = depth === 1 && !!effectiveFilterLabel && !shouldMoveCourseProfileToSek2
  const contextualTitle = formatJurisdictionScopedTitle(
    getContextualTreeTitle(goal, parentGoal),
    depth === 0 && goal.tags?.includes('root') ? jurisdictionRootFilterId : undefined,
    localizedLanguage,
  )
  const displayTitle = shouldShowFilterBadge
    ? `${contextualTitle} (${effectiveFilterLabel})`
    : inheritedSek2FilterLabel
      ? `${contextualTitle} (${inheritedSek2FilterLabel})`
      : contextualTitle

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

        {audience !== 'learner' && isSyntheticStructureNode && !hideTechnicalStructureUi && (
          <span
            className="px-1.5 py-0.5 rounded-full border border-slate-300 dark:border-slate-600 text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400"
            title={t.tooltips.projectedStructureReadOnly}
          >
            {t.tooltips.projectedStructureBadge}
          </span>
        )}

        {aggregatedPlannedGoals ? (
          <div className="flex items-center gap-1 text-slate-500">
            {plannedCount > 0 && (
              <>
                <SquareX size={14} className="text-red-500" />
                <span className="text-xs">{plannedCount}</span>
              </>
            )}
          </div>
        ) : hidePlanControlForCluster ? (
          <div className="w-6 h-6 shrink-0" aria-hidden="true" />
        ) : (
          readOnly || (audience !== 'learner' && isSyntheticStructureNode && !hideTechnicalStructureUi && !isPlanned) ? (
            <div
              className={`p-1 ${isPlanned ? 'text-red-400' : 'text-slate-300 dark:text-slate-600'}`}
              title={t.tooltips.legacyReadOnly}
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
            {renderedChildren.map((childId) => (
              <TreeNode
                key={childId}
                goalId={childId}
                allGoals={allGoals}
                getMastery={getMastery}
                visibleChildrenByParent={visibleChildrenByParent}
                sortedChildrenByParent={sortedChildrenByParent}
                masteryByGoalId={masteryByGoalId}
                plannedGoals={plannedGoals}
                onTogglePlan={onTogglePlan}
                readOnly={readOnly}
                onSelect={onSelect}
                selectedId={selectedId}
                depth={depth + 1}
                activeFilter={activeFilter}
                structureMode={structureMode}
                hideTechnicalStructureUi={hideTechnicalStructureUi}
                allowClusterPlanning={allowClusterPlanning}
                aggregatedPlannedGoals={aggregatedPlannedGoals}
                totalStudents={totalStudents}
                personalConfig={personalConfig}
                hasActivePlan={hasActivePlan}
                isInPlannedSubtree={selfInSubtree}
                activeGoalId={activeGoalId}
                forcedExpandedIds={forcedExpandedIds}
                frontierIds={frontierIds}
                parentGoalId={goal.id}
                audience={audience}
                inheritedPhaseContext={phaseContext}
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
  hideTechnicalStructureUi?: boolean
  allowClusterPlanning?: boolean

  aggregatedPlannedGoals?: Map<string, number>
  totalStudents?: number
  personalConfig?: Record<string, { selected: boolean; filterId?: string }>
  activeGoalId?: string
  forcedExpandedIds?: Set<string>
  frontierIds?: Set<string>
  audience?: TreeAudience
}

export const CompetenceTree: React.FC<CompetenceTreeProps> = ({
  rootGoals,
  activeFilter,
  personalConfig,
  structureMode = 'all',
  audience = 'trainer',
  hideTechnicalStructureUi = false,
  allowClusterPlanning = true,
  ...props
}) => {
  // We don't strictly filter root goals by activeFilter, because root goals usually represent 'Structure' (e.g. 'Fächer')
  // and might not have the specific tags (e.g. 'GK') that their children have.
  // We let TreeNode handle the filtering of children.
  const visibleRoots = rootGoals
  const hasActivePlan = props.plannedGoals.size > 0
  const visibleChildrenByParent = React.useMemo(
    () => buildVisibleChildrenMap(props.allGoals, activeFilter, personalConfig, structureMode, audience),
    [activeFilter, audience, personalConfig, props.allGoals, structureMode],
  )
  const sortedChildrenByParent = React.useMemo(
    () => buildSortedChildrenMap(visibleChildrenByParent, props.allGoals),
    [props.allGoals, visibleChildrenByParent],
  )
  const masteryByGoalId = React.useMemo(
    () => buildAggregatedMasteryMap(props.allGoals, visibleChildrenByParent, props.getMastery),
    [props.allGoals, props.getMastery, visibleChildrenByParent],
  )

  return (
    <div className="flex flex-col gap-1 overflow-y-auto max-h-full pr-2">
      {visibleRoots.map((g) => (
        <TreeNode
          key={g.id}
          goalId={g.id}
          visibleChildrenByParent={visibleChildrenByParent}
          sortedChildrenByParent={sortedChildrenByParent}
          masteryByGoalId={masteryByGoalId}
          activeFilter={activeFilter}
          structureMode={structureMode}
          hideTechnicalStructureUi={hideTechnicalStructureUi}
          allowClusterPlanning={allowClusterPlanning}
          personalConfig={personalConfig}
          hasActivePlan={hasActivePlan}
          isInPlannedSubtree={false}
          audience={audience}
          {...props}
        />
      ))}
    </div>
  )
}

export type { TreeAudience, TreePhaseContext, TreeStructureMode } from '../utils/treeProjectionRuntime'
