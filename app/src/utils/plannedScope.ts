import type { UiGoal } from '../goalTypes'

export const buildGoalContainsClosure = (
  rootGoalIds: Iterable<string>,
  allGoals: Map<string, UiGoal>,
) => {
  const closure = new Set<string>()
  const stack = Array.from(rootGoalIds)

  while (stack.length > 0) {
    const goalId = stack.pop()
    if (!goalId || closure.has(goalId)) continue

    closure.add(goalId)
    const goal = allGoals.get(goalId)
    goal?.contains?.forEach((childId) => {
      if (!closure.has(childId)) {
        stack.push(childId)
      }
    })
  }

  return closure
}

export const buildRenderedScopeDescendantCountMap = (
  allGoals: Map<string, UiGoal>,
  renderedChildrenByParent: Map<string, string[]>,
  scopedGoalIds: Set<string>,
) => {
  const countsByGoalId = new Map<string, number>()
  const visiting = new Set<string>()

  const compute = (goalId: string): number => {
    const cached = countsByGoalId.get(goalId)
    if (cached !== undefined) return cached
    if (visiting.has(goalId)) return 0

    visiting.add(goalId)
    let count = scopedGoalIds.has(goalId) ? 1 : 0

    renderedChildrenByParent.get(goalId)?.forEach((childId) => {
      count += compute(childId)
    })

    visiting.delete(goalId)
    countsByGoalId.set(goalId, count)
    return count
  }

  allGoals.forEach((_, goalId) => {
    compute(goalId)
  })

  return countsByGoalId
}
