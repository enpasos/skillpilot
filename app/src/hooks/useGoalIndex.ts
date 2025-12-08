import { useMemo } from 'react'
import type { UiGoal as Goal } from '../goalTypes'

const phaseRank: Record<string, number> = { GLOBAL: 0, E: 1, E1: 1, Q1: 2, Q2: 3, Q3: 4, Q4: 5 }

export function useGoalIndex(allGoalsGlobal: Goal[]) {
  const goalIndexAll = useMemo(() => {
    const map = new Map<string, Goal>()
    allGoalsGlobal.forEach((goal) => map.set(goal.id, goal))
    return map
  }, [allGoalsGlobal])

  const parentMapAll = useMemo(() => {
    const map = new Map<string, string[]>()
    allGoalsGlobal.forEach((goal) => {
      goal.contains.forEach((childId) => {
        const parents = map.get(childId) ?? []
        parents.push(goal.id)
        map.set(childId, parents)
      })
    })
    for (const [childId, parents] of map.entries()) {
      parents.sort((a, b) => {
        const phaseA = goalIndexAll.get(a)?.phase ?? ''
        const phaseB = goalIndexAll.get(b)?.phase ?? ''
        const rankDiff = (phaseRank[phaseA] ?? 99) - (phaseRank[phaseB] ?? 99)
        if (rankDiff !== 0) return rankDiff
        return a.localeCompare(b)
      })
      map.set(childId, parents)
    }
    return map
  }, [allGoalsGlobal, goalIndexAll])

  const globalRootGoals = useMemo(() => {
    return allGoalsGlobal
      .filter((goal) => !(parentMapAll.get(goal.id)?.length) && goal.contains.length > 0)
      .sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }))
  }, [allGoalsGlobal, parentMapAll])

  return { goalIndexAll, parentMapAll, globalRootGoals }
}
