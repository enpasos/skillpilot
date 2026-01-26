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
      const masteryCache = new Map<string, { masterySum: number; weightSum: number }>()

      const getMasteryRecursive = (
        gId: string,
        visited: Set<string> = new Set(),
      ): { masterySum: number; weightSum: number } => {
        if (masteryCache.has(gId)) {
          return masteryCache.get(gId)!
        }
        if (visited.has(gId)) return { masterySum: 0, weightSum: 0 } // Circular dependency

        visited.add(gId)
        const goal = goalIndexAll.get(gId)
        if (!goal) return { masterySum: 0, weightSum: 0 }

        let masterySum = 0
        let weightSum = 0

        if (!goal.contains || goal.contains.length === 0) {
          let masteryValue = 0
          // Priority: Check direct UUID match first (new backend standard)
          if (masteryMap[gId] !== undefined) {
            masteryValue = masteryMap[gId]
          } else {
            // Fallback: Check shortKey (legacy standard)
            const key = goalShortKeyMap.get(gId)
            masteryValue = key ? masteryMap[key] ?? 0 : 0
          }
          const weight = goal.weight ?? 1
          masterySum = masteryValue * weight
          weightSum = weight
        } else {
          goal.contains.forEach((childId) => {
            const childGoal = goalIndexAll.get(childId)
            if (!childGoal) return
            const childTotals = getMasteryRecursive(childId, new Set(visited))
            masterySum += childTotals.masterySum
            weightSum += childTotals.weightSum
          })
        }

        visited.delete(gId)
        masteryCache.set(gId, { masterySum, weightSum })
        return { masterySum, weightSum }
      }
      const totals = getMasteryRecursive(goalId)
      return totals.weightSum > 0 ? totals.masterySum / totals.weightSum : 0
    },
    [goalIndexAll, goalShortKeyMap],
  )

  return { getAggregatedMastery }
}
