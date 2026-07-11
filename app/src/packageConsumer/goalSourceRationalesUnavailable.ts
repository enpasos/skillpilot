import type { GoalSourceRationaleItem } from '../utils/sourceRationaleTypes'

// Goal source evidence in package mode is served only through the verified
// package endpoint. A repository payload fallback would violate source binding.
export const loadRepositoryGoalSourceRationale = async (
  goalId: string,
  activeFilter?: string,
): Promise<GoalSourceRationaleItem | null> => {
  void goalId
  void activeFilter
  return null
}

export const resetRepositoryGoalSourceRationaleCacheForTests = (): void => undefined
