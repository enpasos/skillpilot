import { convertLearningGoal } from '../src/goalTypes'
import type { SkillLandscape } from '../src/landscapeTypes'
import { collectCompositionProjectionRoleGoalIds, normalizeCompositionView } from '../src/utils/authoring/compositionViewAuthoring'
import { applyCompositionViewProjection } from '../src/utils/compositionViewRuntime'
import { buildDirectChildrenMap, getRenderedChildIds } from '../src/utils/treeProjectionRuntime'
import { sourceCoverageAtomicScopeMatcher } from './generateCurriculumQualityStatus'

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
  const matchesScope = sourceCoverageAtomicScopeMatcher(landscape)

  const canonicalGoalById = new Map(landscape.goals.map((goal) => [goal.id, goal]))
  const { targetGoalIds } = collectCompositionProjectionRoleGoalIds(view.rootNodes, canonicalGoalById)
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
    // Select atomic seeds with the same raw applicability/mapping/provenance
    // rules as the backend and CQR-003. Filtering parents would prune valid
    // children; filtering by successful source QA would hide real violations.
    if (canonicalGoal && targetGoalIds.has(goalId) && (canonicalGoal.contains?.length ?? 0) === 0
      && matchesScope(canonicalGoal, view.scope)) {
      targetAtomicGoalIds.add(goalId)
    }
    getRenderedChildIds(goalId, projectedGoalById, directChildrenByParent)
      .forEach((childId) => stack.push(childId))
  }

  return targetAtomicGoalIds
}
