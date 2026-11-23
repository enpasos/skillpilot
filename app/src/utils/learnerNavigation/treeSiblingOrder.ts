import type { UiGoal } from '../../goalTypes'
import type { LearningMapFixture } from '../../components/learningUnitMap/types'
import { sortGoalsTopologically } from '../goalSorter'
import { isUnitMaterialSource, UNIT_MAP_LEARNING_MATERIALS } from '../unitLearningMaterial'
import { compositionSiblingOrder, projectedSiblingOrder } from '../unitStudyOrder'
import type { TreeAudience } from '../treeProjectionRuntime'

export function buildSortedChildrenMap(
  visibleChildrenByParent: Map<string, string[]>,
  allGoals: Map<string, UiGoal>,
  audience: TreeAudience,
  unitFixture?: LearningMapFixture,
  materials = UNIT_MAP_LEARNING_MATERIALS,
) {
  const sortedChildrenByParent = new Map<string, string[]>()

  visibleChildrenByParent.forEach((childIds, parentId) => {
    const goals = childIds
      .map((id) => allGoals.get(id))
      .filter((goal): goal is UiGoal => !!goal)
    const parent = audience === 'learner' ? allGoals.get(parentId) : undefined
    const material = parent && materials.find(item => isUnitMaterialSource(item, parent))
    const sorted = sortGoalsTopologically(goals, {
      allGoalsById: allGoals,
      orientationGoalId: material?.unit.orientationGoalId,
      guidedStudyOrder: material?.guidedStudyOrder,
      siblingOrder: parent && ((unitFixture && projectedSiblingOrder(unitFixture, parentId, childIds))
        ?? compositionSiblingOrder(parent, goals)),
    })
    sortedChildrenByParent.set(parentId, sorted.map((goal) => goal.id))
  })

  return sortedChildrenByParent
}
