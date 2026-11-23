import type { UiGoal } from '../../goalTypes'
import type { LearningMapFixture, MapPracticeMaterial, UnitStudyRecommendation } from '../../components/learningUnitMap/types'
import { sortGoalsTopologically } from '../goalSorter'
import { isUnitMaterialSource, UNIT_MAP_LEARNING_MATERIALS } from '../unitLearningMaterial'
import { compositionSiblingOrder, projectedSiblingOrder, projectUnitStudyRecommendations } from '../unitStudyOrder'
import type { TreeAudience } from '../treeProjectionRuntime'

export function buildSortedChildrenMap(
  visibleChildrenByParent: Map<string, string[]>,
  allGoals: Map<string, UiGoal>,
  audience: TreeAudience,
  unitFixture?: LearningMapFixture,
  materials = UNIT_MAP_LEARNING_MATERIALS,
) {
  const sortedChildrenByParent = new Map<string, string[]>()
  const materialByScope = new Map<string, MapPracticeMaterial>()
  const studyRecommendationsByScope = new Map<string, UnitStudyRecommendation[]>()
  if (audience === 'learner') {
    for (const scopeId of visibleChildrenByParent.keys()) {
      const scope = allGoals.get(scopeId)
      const material = scope && materials.find(item => isUnitMaterialSource(item, scope))
      if (!material) continue
      materialByScope.set(scopeId, material)
      if (!material.studyRecommendations?.length) continue
      const recommendations = projectUnitStudyRecommendations(scopeId, material.studyRecommendations,
        id => visibleChildrenByParent.get(id)?.filter(child => allGoals.has(child)))
      for (const [board, pairs] of recommendations) {
        studyRecommendationsByScope.set(board, [...studyRecommendationsByScope.get(board) ?? [], ...pairs])
      }
    }
  }

  visibleChildrenByParent.forEach((childIds, parentId) => {
    const goals = childIds
      .map((id) => allGoals.get(id))
      .filter((goal): goal is UiGoal => !!goal)
    const parent = audience === 'learner' ? allGoals.get(parentId) : undefined
    const material = materialByScope.get(parentId)
    const sorted = sortGoalsTopologically(goals, {
      allGoalsById: allGoals,
      orientationGoalId: material?.unit.orientationGoalId,
      guidedStudyOrder: material?.guidedStudyOrder,
      studyRecommendations: studyRecommendationsByScope.get(parentId),
      siblingOrder: parent && ((unitFixture && projectedSiblingOrder(unitFixture, parentId, childIds))
        ?? compositionSiblingOrder(parent, goals)),
    })
    sortedChildrenByParent.set(parentId, sorted.map((goal) => goal.id))
  })

  return sortedChildrenByParent
}
