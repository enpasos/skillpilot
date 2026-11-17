// SPDX-License-Identifier: Apache-2.0
interface EndpointGoal {
  id: string
  type?: string
  contains?: readonly string[]
  examData?: unknown
}

/** Explicit endpoints supplement the existing cluster inventory. They must be
 * released atomic assessment goals; an unknown ID or an alias never silently
 * disappears from a hard route check. */
export function resolveExplicitAtomicRouteEndpoints<T extends EndpointGoal>(
  ids: readonly string[], goals: ReadonlyMap<string, T>,
  existingIds: ReadonlySet<string> = new Set(), allowedIds?: ReadonlySet<string>,
): { goals: T[]; issues: string[] } {
  const result: T[] = [], issues: string[] = [], seen = new Set<string>()
  for (const id of ids) {
    if (seen.has(id) || existingIds.has(id)) {
      issues.push(`Duplicate explicit atomic terminal endpoint: ${id}`)
      continue
    }
    seen.add(id)
    const goal = goals.get(id)
    const exam = goal?.examData
    if (!goal || (allowedIds && !allowedIds.has(id)) || goal.type !== 'atomic'
      || (goal.contains?.length ?? 0) !== 0 || !exam || typeof exam !== 'object'
      || Array.isArray(exam) || (exam as Record<string, unknown>).reviewStatus !== 'released') {
      issues.push(`Explicit terminal must be an existing in-scope atomic released assessment: ${id}`)
      continue
    }
    result.push(goal)
  }
  return { goals: result, issues }
}

/** An inventory entry is not a universal scope obligation. A selected task is
 * required; otherwise it must assess an actual selected curricular target and
 * all of its genuine preparation/content demand must belong to the scope. */
export function explicitAtomicEndpointApplies(
  goal: EndpointGoal & { requires?: readonly string[] },
  selectedGoalIds: ReadonlySet<string>, learningGoalIds: ReadonlySet<string>,
  explicitlySelected = false,
): boolean {
  if (explicitlySelected) return true
  const exam = goal.examData as { coveredGoalIds?: unknown } | undefined
  const covered = exam?.coveredGoalIds
  if (!Array.isArray(covered) || !covered.length || !covered.every(id => typeof id === 'string')) return false
  return covered.some(id => selectedGoalIds.has(id))
    && [...(goal.requires ?? []), ...covered].every(id => learningGoalIds.has(id))
}
