import React, { useState } from 'react'
import { Target, Send, Check, Circle, CircleDot, Square, SquareX } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { useLanguage } from '../contexts/LanguageContext'
import type { UiGoal } from '../goalTypes'
import { sortGoalsTopologically } from '../utils/goalSorter'
import { isCompleteMastery, isMastered, masteryColorClass } from '../goalUiUtils'
import { InlineMathText } from './InlineMathText'
import { isWildcardFilter } from '../utils/goalFilters'
import { isCourseProfileFilterId } from '../utils/personalCurriculumStageScope'
import { formatFilterDisplayLabel, formatJurisdictionScopedTitle, type LabelLanguage } from '../utils/filterLabels'
import { normalizeJurisdictionCode } from '../utils/jurisdictionMetadata'
import {
  buildGoalContainsClosure,
  buildRenderedScopeDescendantCountMap,
  buildRenderedScopeMarkerGoalIds,
} from '../utils/plannedScope'
import {
  buildVisibleChildrenMap,
  getAudienceGoalTitle,
  getRenderedChildIds,
  isSyntheticProgramUnit,
  type TreeAudience,
  type TreeStructureMode,
} from '../utils/treeProjectionRuntime'

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
  plannedScopeGoalIds: Set<string>
  plannedScopeDescendantCounts: Map<string, number>
  plannedScopeMarkerGoalIds: Set<string>
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
  personalConfig?: Record<string, {
    selected: boolean
    filterId?: string
    durationModel?: string
    stage?: string
  }>
  hasActivePlan?: boolean
  isInPlannedSubtree?: boolean
  activeGoalId?: string
  expandedGoalIds?: Set<string>
  onToggleExpanded?: (goalId: string) => void
  forcedExpandedIds?: Set<string>
  frontierIds?: Set<string>
  parentGoalId?: string
  audience?: TreeAudience
  useRawGoalTitles?: boolean
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
  plannedScopeGoalIds,
  plannedScopeDescendantCounts,
  plannedScopeMarkerGoalIds,
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
  expandedGoalIds,
  onToggleExpanded,
  forcedExpandedIds,
  frontierIds,
  parentGoalId,
  audience = 'trainer',
  useRawGoalTitles = false,
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
  const [localIsExpanded, setLocalIsExpanded] = useState(shouldInitiallyExpand)
  const isExpansionControlled = audience === 'learner' && !!expandedGoalIds && !!onToggleExpanded

  React.useEffect(() => {
    if (isExpansionControlled) return
    if (shouldInitiallyExpand) {
      setLocalIsExpanded((current) => (current ? current : true))
    }
  }, [isExpansionControlled, shouldInitiallyExpand])

  // Force expansion if this ID is in the forced set
  React.useEffect(() => {
    if (isExpansionControlled) return
    if (forcedExpandedIds && forcedExpandedIds.has(goalId)) {
      setLocalIsExpanded(true)
    }
  }, [forcedExpandedIds, goalId, isExpansionControlled])

  if (!goal) return null

  const renderedChildren = getRenderedChildIds(
    goalId,
    allGoals,
    sortedChildrenByParent,
  )
  const mastery = masteryByGoalId.get(goalId) ?? 0

  const hasStructuralChildren = (goal.contains ?? []).length > 0
  if (audience === 'learner' && hasStructuralChildren && renderedChildren.length === 0 && !goal.tags?.includes('root')) {
    return null
  }

  const isForcedExpanded = !!forcedExpandedIds?.has(goalId)
  const isExpanded = isExpansionControlled
    ? isForcedExpanded || expandedGoalIds.has(goalId)
    : isForcedExpanded || localIsExpanded
  const hasChildren = renderedChildren.length > 0
  const mastered = isMastered(mastery)
  const complete = isCompleteMastery(mastery)
  const hasProgress = mastery > 0
  const isPlanned = plannedGoals.has(goal.id)
  const isLearnerFocusControl = audience === 'learner'
  const isInPlannedScope = plannedScopeGoalIds.has(goal.id)
  const isSelected = selectedId === goal.id
  const isSyntheticStructureNode = isSyntheticProgramUnit(goal)
  const hidePlanControlForCluster = !allowClusterPlanning && hasChildren && !isPlanned
  // Frontier highlighting is intentionally disabled (we only mark active goal + mastery).

  // Propagate: exact planned nodes start a subtree; hidden canonical scope roots
  // still mark their visible descendants through plannedScopeGoalIds.
  const selfInSubtree = isInPlannedSubtree || isPlanned || isInPlannedScope
  const targetIconClassName =
    hasActivePlan && selfInSubtree ? 'text-red-500 dark:text-red-400' : undefined

  // Active Plan Strategy:
  const plannedCount = aggregatedPlannedGoals?.get(goal.id) ?? plannedScopeDescendantCounts.get(goal.id) ?? 0
  const hasPlannedGoalInRenderedSubtree = plannedCount > 0
  const isDimmed = hasActivePlan && !selfInSubtree && !hasPlannedGoalInRenderedSubtree

  const showDescendantPlanMarker =
    !aggregatedPlannedGoals && !isPlanned && plannedScopeMarkerGoalIds.has(goal.id)

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
  const baseTitle = useRawGoalTitles
    ? goal.title
    : getAudienceGoalTitle(goal, parentGoal)
  const displayTitle = useRawGoalTitles
    ? baseTitle
    : (() => {
      const contextualTitle = formatJurisdictionScopedTitle(
        baseTitle,
        depth === 0 && goal.tags?.includes('root') ? jurisdictionRootFilterId : undefined,
        localizedLanguage,
      )
      return shouldShowFilterBadge
        ? `${contextualTitle} (${effectiveFilterLabel})`
        : inheritedSek2FilterLabel
          ? `${contextualTitle} (${inheritedSek2FilterLabel})`
          : contextualTitle
    })()

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
            if (isExpansionControlled) {
              onToggleExpanded(goal.id)
            } else {
              setLocalIsExpanded(!localIsExpanded)
            }
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
              className={`h-full ${masteryColorClass(mastery)}`}
              style={{ width: `${mastery * 100}%` }}
            />
          </div>
        )}

        {!hasChildren && (
          <div
            className={`mr-1 ${isDimmed
              ? 'text-slate-300 dark:text-slate-600'
              : complete
                ? 'text-emerald-500'
                : hasProgress
                  ? 'text-amber-500'
                : 'text-slate-400 dark:text-slate-500'
              }`}
          >
            {mastered ? (
              <Check size={16} strokeWidth={3} />
            ) : activeGoalId === goal.id ? (
              <Send size={16} className="text-amber-500" />
            ) : (
              <Target size={16} className={targetIconClassName} />
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
        ) : showDescendantPlanMarker ? (
          <div
            className={`flex items-center justify-center w-6 h-6 shrink-0 ${isLearnerFocusControl
              ? 'text-sky-600 dark:text-sky-400'
              : 'text-red-500'
              }`}
            role={isLearnerFocusControl ? 'img' : undefined}
            aria-label={isLearnerFocusControl ? t.tooltips.currentLearningFocus : undefined}
            title={isLearnerFocusControl ? t.tooltips.currentLearningFocus : undefined}
          >
            {isLearnerFocusControl ? <CircleDot size={16} /> : <SquareX size={16} />}
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
              aria-pressed={isPlanned}
              className={`p-1 rounded transition-colors ${isLearnerFocusControl
                ? isPlanned
                  ? 'text-sky-600 dark:text-sky-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  : 'text-slate-300 dark:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400'
                : isPlanned
                  ? 'text-red-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                  : 'text-slate-300 dark:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-red-500'
                }`}
              title={isLearnerFocusControl
                ? isPlanned
                  ? t.tooltips.currentLearningFocus
                  : t.tooltips.setLearningFocus
                : isPlanned
                  ? t.tooltips.removeFromList
                  : t.tooltips.addToList}
            >
              {isLearnerFocusControl
                ? isPlanned
                  ? <CircleDot size={16} />
                  : <Circle size={16} />
                : isPlanned
                  ? <SquareX size={16} />
                  : <Square size={16} />}
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
                plannedScopeGoalIds={plannedScopeGoalIds}
                plannedScopeDescendantCounts={plannedScopeDescendantCounts}
                plannedScopeMarkerGoalIds={plannedScopeMarkerGoalIds}
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
                expandedGoalIds={expandedGoalIds}
                onToggleExpanded={onToggleExpanded}
                forcedExpandedIds={forcedExpandedIds}
                frontierIds={frontierIds}
                parentGoalId={goal.id}
                audience={audience}
                useRawGoalTitles={useRawGoalTitles}
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
  plannedScopeGoalIds?: Set<string>
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
  personalConfig?: Record<string, {
    selected: boolean
    filterId?: string
    durationModel?: string
    stage?: string
  }>
  rootLandscapeId?: string
  activeGoalId?: string
  expandedGoalIds?: Set<string>
  onToggleExpanded?: (goalId: string) => void
  forcedExpandedIds?: Set<string>
  frontierIds?: Set<string>
  audience?: TreeAudience
  visibleChildrenByParentOverride?: Map<string, string[]>
  useRawGoalTitles?: boolean
}

export const CompetenceTree: React.FC<CompetenceTreeProps> = ({
  rootGoals,
  activeFilter,
  personalConfig,
  rootLandscapeId,
  structureMode = 'all',
  audience = 'trainer',
  hideTechnicalStructureUi = false,
  allowClusterPlanning = true,
  visibleChildrenByParentOverride,
  plannedScopeGoalIds: plannedScopeGoalIdsOverride,
  useRawGoalTitles = false,
  ...props
}) => {
  // We don't strictly filter root goals by activeFilter, because root goals usually represent 'Structure' (e.g. 'Fächer')
  // and might not have the specific tags (e.g. 'GK') that their children have.
  // We let TreeNode handle the filtering of children.
  const visibleRoots = rootGoals
  const hasActivePlan = props.plannedGoals.size > 0
  const visibleChildrenByParent = React.useMemo(
    () => visibleChildrenByParentOverride ?? buildVisibleChildrenMap(
      props.allGoals,
      activeFilter,
      personalConfig,
      structureMode,
      rootLandscapeId,
    ),
    [activeFilter, personalConfig, props.allGoals, rootLandscapeId, structureMode, visibleChildrenByParentOverride],
  )
  const sortedChildrenByParent = React.useMemo(
    () => buildSortedChildrenMap(visibleChildrenByParent, props.allGoals),
    [props.allGoals, visibleChildrenByParent],
  )
  const masteryByGoalId = React.useMemo(
    () => buildAggregatedMasteryMap(props.allGoals, visibleChildrenByParent, props.getMastery),
    [props.allGoals, props.getMastery, visibleChildrenByParent],
  )
  const plannedScopeGoalIds = React.useMemo(
    () => plannedScopeGoalIdsOverride ?? buildGoalContainsClosure(props.plannedGoals, props.allGoals),
    [plannedScopeGoalIdsOverride, props.allGoals, props.plannedGoals],
  )
  const plannedScopeDescendantCounts = React.useMemo(
    () => buildRenderedScopeDescendantCountMap(props.allGoals, sortedChildrenByParent, plannedScopeGoalIds),
    [props.allGoals, plannedScopeGoalIds, sortedChildrenByParent],
  )
  const plannedScopeMarkerGoalIds = React.useMemo(
    () => buildRenderedScopeMarkerGoalIds(
      props.allGoals,
      sortedChildrenByParent,
      plannedScopeGoalIds,
      props.plannedGoals,
    ),
    [props.allGoals, props.plannedGoals, plannedScopeGoalIds, sortedChildrenByParent],
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
          plannedScopeGoalIds={plannedScopeGoalIds}
          plannedScopeDescendantCounts={plannedScopeDescendantCounts}
          plannedScopeMarkerGoalIds={plannedScopeMarkerGoalIds}
          activeFilter={activeFilter}
          structureMode={structureMode}
          hideTechnicalStructureUi={hideTechnicalStructureUi}
          allowClusterPlanning={allowClusterPlanning}
          personalConfig={personalConfig}
          hasActivePlan={hasActivePlan}
          isInPlannedSubtree={false}
          audience={audience}
          useRawGoalTitles={useRawGoalTitles}
          {...props}
        />
      ))}
    </div>
  )
}

export type { TreeAudience, TreeStructureMode } from '../utils/treeProjectionRuntime'
