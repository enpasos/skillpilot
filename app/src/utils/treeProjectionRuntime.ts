import type { UiGoal } from '../goalTypes'
import { goalMatchesFilter, goalMatchesFilters } from './goalFilters'
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
) => {
  const visibleChildrenByParent = new Map<string, string[]>()
  const hasConfig = !!personalConfig && Object.keys(personalConfig).length > 0
  const nestedUnderSyntheticProgramUnit = new Set<string>()

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

      if (!goalMatchesGlobalStageScope(child, personalConfig ?? {}, { rootLandscapeId })) {
        return false
      }

      if (!goalMatchesFilter(child, activeFilter)) {
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
          if (config.selected !== true) return false
          const effectiveFilters = [config.filterId, config.durationModel]
            .filter((value): value is string => typeof value === 'string')
          if (!goalMatchesFilters(child, effectiveFilters)) {
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
