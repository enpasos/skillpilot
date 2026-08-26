import { convertLearningGoal } from '../src/goalTypes'
import type { SkillLandscape } from '../src/landscapeTypes'
import { normalizeCompositionView } from '../src/utils/authoring/compositionViewAuthoring'
import { applyCompositionViewProjection } from '../src/utils/compositionViewRuntime'
import { buildDirectChildrenMap, getRenderedChildIds } from '../src/utils/treeProjectionRuntime'

/**
 * Returns canonical atomic goals that are learner-facing targets in one
 * composition view. `prerequisiteOnly` entries remain available to the
 * runtime prerequisite resolver, but are deliberately outside source-target
 * coverage for this view.
 */
export function collectAuthoritativeTargetAtomicGoalIds(
  landscape: SkillLandscape,
  rawView: unknown,
): Set<string> {
  const view = normalizeCompositionView(rawView)
  if (view.landscapeId !== landscape.landscapeId) return new Set<string>()

  const canonicalGoalById = new Map(landscape.goals.map((goal) => [goal.id, goal]))
  const entry = {
    meta: landscape,
    goals: landscape.goals.map((goal) => convertLearningGoal(goal, {
      landscapeId: landscape.landscapeId,
    })),
  }
  const projectedEntry = applyCompositionViewProjection([entry], view)[0]
  if (!projectedEntry) return new Set<string>()

  const projectedGoalById = new Map(projectedEntry.goals.map((goal) => [goal.id, goal]))
  const directChildrenByParent = buildDirectChildrenMap(projectedGoalById)
  const stack = projectedEntry.goals
    .filter((goal) => (goal.tags ?? []).includes('root'))
    .map((goal) => goal.id)
  const visited = new Set<string>()
  const targetAtomicGoalIds = new Set<string>()

  while (stack.length > 0) {
    const goalId = stack.pop()
    if (!goalId || visited.has(goalId)) continue
    visited.add(goalId)

    const canonicalGoal = canonicalGoalById.get(goalId)
    if (canonicalGoal && (canonicalGoal.contains?.length ?? 0) === 0) {
      targetAtomicGoalIds.add(goalId)
    }
    getRenderedChildIds(goalId, projectedGoalById, directChildrenByParent)
      .forEach((childId) => stack.push(childId))
  }

  return targetAtomicGoalIds
}
