// Exact read-only extraction of current native functions; no policy or dependency replacement.
function isAtomicGoal(goal: LearningGoal): boolean {
  return (goal.contains?.length ?? 0) === 0
}

function parseReference(raw: string, currentLandscapeId: string): { landscapeId: string; goalId: string } {
  if (raw.includes(':')) {
    const [landscapeId, goalId] = raw.split(':', 2)
    return { landscapeId: landscapeId || currentLandscapeId, goalId }
  }
  return { landscapeId: currentLandscapeId, goalId: raw }
}

function buildParentByChild(goals: LearningGoal[]): Map<string, string[]> {
  const parentByChild = new Map<string, string[]>()
  goals.forEach((goal) => {
    goal.contains?.forEach((childId) => {
      const parsedChild = parseReference(childId, '')
      const childGoalId = parsedChild.goalId
      const parents = parentByChild.get(childGoalId) ?? []
      parents.push(goal.id)
      parentByChild.set(childGoalId, parents)
    })
  })
  return parentByChild
}

function collectWholeMaterialPrerequisiteClosure(
  landscape: SkillLandscape,
  terminalGoalId: string,
): { atomicGoalIds: Set<string>; unresolvedReferences: Set<string> } {
  const goalById = new Map(landscape.goals.map((goal) => [goal.id, goal]))
  const parentByChild = buildParentByChild(landscape.goals)
  const inheritedReferences = (goalId: string): string[] => {
    const references = [...(goalById.get(goalId)?.requires ?? [])]
    const ancestors = [...(parentByChild.get(goalId) ?? [])]
    const seenAncestors = new Set<string>()
    while (ancestors.length > 0) {
      const ancestorId = ancestors.pop()!
      if (seenAncestors.has(ancestorId)) continue
      seenAncestors.add(ancestorId)
      references.push(...(goalById.get(ancestorId)?.requires ?? []))
      ancestors.push(...(parentByChild.get(ancestorId) ?? []))
    }
    return references
  }
  const atomicGoalIds = new Set<string>()
  const unresolvedReferences = new Set<string>()
  const seenGoalIds = new Set<string>()
  const pending = inheritedReferences(terminalGoalId)
  while (pending.length > 0) {
    const rawRef = pending.pop()!
    const ref = parseReference(rawRef, landscape.landscapeId)
    const goal = ref.landscapeId === landscape.landscapeId ? goalById.get(ref.goalId) : undefined
    if (!goal) {
      unresolvedReferences.add(rawRef)
      continue
    }
    if (seenGoalIds.has(goal.id)) continue
    seenGoalIds.add(goal.id)
    if (isAtomicGoal(goal)) {
      atomicGoalIds.add(goal.id)
    } else {
      pending.push(...(goal.contains ?? []))
    }
    pending.push(...inheritedReferences(goal.id))
  }
  return { atomicGoalIds, unresolvedReferences }
}
export {collectWholeMaterialPrerequisiteClosure};
