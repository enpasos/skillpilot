import { hasApplicabilityContexts, parseApplicabilityContexts } from './applicabilityContexts'
import { deriveRuntimeApplicabilityScope } from './compositionViewRuntime'
import type { UiGoal } from '../goalTypes'
import { goalMatchesFilters } from './goalFilters'
import { goalMatchesGlobalStageScope } from './personalCurriculumStageScope'

export type TreeStructureMode = 'all' | 'content' | 'competency'
export type TreeAudience = 'learner' | 'trainer'

const COMPETENCY_DIMENSION_ROOT_TAG = 'competency-axis:dimension-root'
const SYNTHETIC_PROGRAM_UNIT_TAG = 'synthetic:program-unit'

export const isCompetencyDimensionRoot = (goal: UiGoal) =>
  (goal.tags ?? []).includes(COMPETENCY_DIMENSION_ROOT_TAG)

export const isSyntheticProgramUnit = (goal: UiGoal) =>
  (goal.tags ?? []).includes(SYNTHETIC_PROGRAM_UNIT_TAG)

export const isCompositionStructureNode = (goal: UiGoal) =>
  isSyntheticProgramUnit(goal) && goal.extendedData?.syntheticStructureKind === 'compositionView'

export const getAudienceGoalTitle = (
  goal: Pick<UiGoal, 'title'>,
  parentGoal?: UiGoal,
): string => {
  let title = goal.title

  if (parentGoal && isSyntheticProgramUnit(parentGoal)) {
    if (parentGoal.title === 'Sekundarstufe I') {
      title = title.replace(/\s+\(Sek I\)$/u, '')
    } else if (parentGoal.title === 'Sekundarstufe II') {
      title = title.replace(/\s+\(Sek II\)$/u, '')
    }
  }

  return title
}

type PersonalCurriculumConfigLike = Record<string, {
  selected: boolean
  filterId?: string
  durationModel?: string
  stage?: string
}>

export const buildVisibleChildrenMap = (
  allGoals: Map<string, UiGoal>,
  activeFilter?: string,
  personalConfig?: PersonalCurriculumConfigLike,
  structureMode: TreeStructureMode = 'all',
  rootLandscapeId?: string,
  selectedScopesByLandscapeId?: ReadonlyMap<string, unknown>,
  compositionTargetGoalIdsByLandscapeId?: ReadonlyMap<string, ReadonlySet<string>>,
) => {
  const visibleChildrenByParent = new Map<string, string[]>()
  const hasConfig = !!personalConfig && Object.keys(personalConfig).length > 0
  const nestedUnderSyntheticProgramUnit = new Set<string>()
  const scopeByLandscapeId = new Map<string, unknown>()
  const personalCurriculum = JSON.stringify({ personalCurriculum: personalConfig ?? {} })
  const selectedScopeFor = (goal: UiGoal) => {
    const landscapeId = goal.landscapeId ?? goal.id
    if (selectedScopesByLandscapeId?.has(landscapeId)) return selectedScopesByLandscapeId.get(landscapeId)
    if (!scopeByLandscapeId.has(landscapeId)) scopeByLandscapeId.set(landscapeId,
      deriveRuntimeApplicabilityScope({
        landscapeId, rootLandscapeId, scopeEnabled: true, activeFilter,
        learnerPersonalCurriculum: personalCurriculum,
      }))
    return scopeByLandscapeId.get(landscapeId)
  }

  // A separately selected supplement is valid without ordinary subject
  // enrollment. Preserve only its proven targets and their already projected
  // navigation paths; never turn the whole subject selection on.
  const compositionPathGoalIds = new Set<string>()
  const parentIdsByChildId = new Map<string, string[]>()
  allGoals.forEach((parent) => (parent.contains ?? []).forEach((childId) => {
    const parents = parentIdsByChildId.get(childId) ?? []
    parents.push(parent.id)
    parentIdsByChildId.set(childId, parents)
  }))
  compositionTargetGoalIdsByLandscapeId?.forEach((targetIds, landscapeId) => targetIds.forEach((id) => {
    const goal = allGoals.get(id)
    if (!goal || goal.landscapeId !== landscapeId) return
    const parsed = parseApplicabilityContexts(goal)
    if (parsed.present && (parsed.errors.length > 0 || parsed.contexts.length === 0)) return
    compositionPathGoalIds.add(id)
  }))
  const pendingPathIds = [...compositionPathGoalIds]
  while (pendingPathIds.length > 0) {
    const childId = pendingPathIds.pop()!
    for (const parentId of parentIdsByChildId.get(childId) ?? []) {
      if (compositionPathGoalIds.has(parentId)) continue
      compositionPathGoalIds.add(parentId)
      pendingPathIds.push(parentId)
    }
  }

  const matchesSelectedFilters = (goal: UiGoal, filters?: string | string[]): boolean => {
    if (hasApplicabilityContexts(goal) && goal.landscapeId
      && compositionTargetGoalIdsByLandscapeId?.has(goal.landscapeId)) {
      const parsed = parseApplicabilityContexts(goal)
      return parsed.errors.length === 0 && parsed.contexts.length > 0
        && compositionTargetGoalIdsByLandscapeId.get(goal.landscapeId)!.has(goal.id)
    }
    return goalMatchesFilters(goal, filters, selectedScopeFor(goal))
  }

  allGoals.forEach((parent) => {
    if (!isSyntheticProgramUnit(parent)) return
    ;(parent.contains ?? []).forEach((childId) => {
      nestedUnderSyntheticProgramUnit.add(childId)
    })
  })

  allGoals.forEach((parent) => {
    const childIds = parent.contains ?? []
    if (childIds.length === 0) return

    const hasPositiveSibling = hasConfig && childIds.some((childId) => {
      const child = allGoals.get(childId)
      if (!child) return false
      const config = (child.landscapeId ? personalConfig?.[child.landscapeId] : undefined) ?? personalConfig?.[child.id]
      return config?.selected === true
    })

    const visibleChildren = childIds.filter((childId) => {
      const child = allGoals.get(childId)
      if (!child) return false

      if (!hasApplicabilityContexts(child) && !goalMatchesGlobalStageScope(child, personalConfig ?? {}, { rootLandscapeId })) {
        return false
      }

      if (!matchesSelectedFilters(child, activeFilter)) {
        return false
      }

      const isCompetencyRoot = isCompetencyDimensionRoot(child)
      const isRootParent = parent.tags?.includes('root')

      if (isCompetencyRoot) {
        if (structureMode !== 'competency') {
          return false
        }
        if (!isRootParent) {
          return false
        }
      }

      if (isRootParent) {
        if (structureMode === 'competency' && !isCompetencyRoot) {
          return false
        }
        if (structureMode === 'all' && isCompetencyRoot && nestedUnderSyntheticProgramUnit.has(child.id)) {
          return false
        }
      }

      if (hasConfig) {
        const config = (child.landscapeId ? personalConfig?.[child.landscapeId] : undefined) ?? personalConfig?.[child.id]
        if (config) {
          if (config.selected !== true && !compositionPathGoalIds.has(child.id)) return false
          const effectiveFilters = [config.filterId, config.durationModel]
            .filter((value): value is string => typeof value === 'string')
          if (!matchesSelectedFilters(child, effectiveFilters)) {
            return false
          }
        } else if (hasPositiveSibling) {
          return false
        }
      }

      return true
    })

    visibleChildrenByParent.set(parent.id, visibleChildren)
  })
  return visibleChildrenByParent
}

export const buildDirectChildrenMap = (
  allGoals: Map<string, UiGoal>,
) => {
  const directChildrenByParent = new Map<string, string[]>()

  allGoals.forEach((parent) => {
    const visibleChildren = (parent.contains ?? []).filter((childId) => allGoals.has(childId))
    directChildrenByParent.set(parent.id, visibleChildren)
  })

  return directChildrenByParent
}

export const getRenderedChildIds = (
  goalId: string,
  allGoals: Map<string, UiGoal>,
  visibleChildrenByParent: Map<string, string[]>,
): string[] => {
  if (!allGoals.has(goalId)) {
    return []
  }
  return visibleChildrenByParent.get(goalId) ?? []
}
