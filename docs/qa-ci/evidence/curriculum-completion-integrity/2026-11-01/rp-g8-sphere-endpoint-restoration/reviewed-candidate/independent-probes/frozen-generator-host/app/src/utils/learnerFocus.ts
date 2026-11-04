export const getNextSingleLearnerFocus = (
  currentFocusIds: Iterable<string>,
  requestedGoalId: string,
): Set<string> => {
  const current = new Set(currentFocusIds)
  if (current.size === 1 && current.has(requestedGoalId)) {
    return current
  }
  return new Set([requestedGoalId])
}
