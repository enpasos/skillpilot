import { useCallback } from 'react'
import type { UiGoal } from '../goalTypes'
import type { MasteryMap } from '../learnerTypes'

export function useMasteryCalculation(
  goalIndexAll: Map<string, UiGoal>,
  goalShortKeyMap: Map<string, string>,
) {
  const getAggregatedMastery = useCallback(
    (goalId: string, masteryMap: MasteryMap | null | undefined): number => {
      if (!masteryMap) return 0

      // Cache for the duration of a single top-level call
      const masteryCache = new Map<string, number>()

      const getMasteryRecursive = (
        gId: string,
        visited: Set<string> = new Set(),
      ): number => {
        if (masteryCache.has(gId)) {
          return masteryCache.get(gId)!
        }
        if (visited.has(gId)) return 0 // Circular dependency

        visited.add(gId)
        const goal = goalIndexAll.get(gId)
        if (!goal) return 0

        let result: number
        if (!goal.contains || goal.contains.length === 0) {
          // Priority: Check direct UUID match first (new backend standard)
          if (masteryMap[gId] !== undefined) {
            result = masteryMap[gId]
          } else {
            // Fallback: Check shortKey (legacy standard)
            const key = goalShortKeyMap.get(gId)
            result = key ? masteryMap[key] ?? 0 : 0
          }
        } else {
          let totalWeightedMastery = 0
          let totalWeight = 0
          goal.contains.forEach((childId) => {
            const childGoal = goalIndexAll.get(childId)
            if (childGoal) {
              const childMastery = getMasteryRecursive(childId, new Set(visited))
              const childWeight = childGoal.weight ?? 1
              totalWeightedMastery += childMastery * childWeight
              totalWeight += childWeight
            }
          })
          result = totalWeight > 0 ? totalWeightedMastery / totalWeight : 0
        }
        masteryCache.set(gId, result)
        return result
      }
      return getMasteryRecursive(goalId)
    },
    [goalIndexAll, goalShortKeyMap],
  )

  return { getAggregatedMastery }
}
