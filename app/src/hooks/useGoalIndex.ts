import { useMemo } from 'react'
import type { UiGoal as Goal } from '../goalTypes'

const phaseRank: Record<string, number> = { GLOBAL: 0, E: 1, E1: 1, Q1: 2, Q2: 3, Q3: 4, Q4: 5 }

export function buildGoalIndex(allGoalsGlobal: Goal[]) {
  const goalIndexAll = new Map<string, Goal>()
  allGoalsGlobal.forEach((goal) => goalIndexAll.set(goal.id, goal))

  const parentMapAll = new Map<string, string[]>()
  allGoalsGlobal.forEach((goal) => {
    goal.contains.forEach((childId) => {
      const parents = parentMapAll.get(childId) ?? []
      parents.push(goal.id)
      parentMapAll.set(childId, parents)
    })
  })
  for (const [childId, parents] of parentMapAll.entries()) {
    parents.sort((a, b) => {
      const phaseA = goalIndexAll.get(a)?.phase ?? ''
      const phaseB = goalIndexAll.get(b)?.phase ?? ''
      const rankDiff = (phaseRank[phaseA] ?? 99) - (phaseRank[phaseB] ?? 99)
      if (rankDiff !== 0) return rankDiff
      return a.localeCompare(b)
    })
    parentMapAll.set(childId, parents)
  }

  const roots = allGoalsGlobal
    .filter((goal) => !(parentMapAll.get(goal.id)?.length) && goal.contains.length > 0)
  const rootsById = new Map(roots.map((goal) => [goal.id, goal]))

  const globalRootGoals = roots.filter((goal) => {
    if (goal.contains.length !== 1) return true
    const [childId] = goal.contains
    const candidateParents = parentMapAll.get(childId) ?? []
    return !candidateParents.some((parentId) => {
      if (parentId === goal.id) return false
      const otherRoot = rootsById.get(parentId)
      if (!otherRoot) return false
      if (otherRoot.contains.length > goal.contains.length) return true
      return otherRoot.contains.length === goal.contains.length && otherRoot.id < goal.id
    })
  }).sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }))

  return { goalIndexAll, parentMapAll, globalRootGoals }
}

export function useGoalIndex(allGoalsGlobal: Goal[]) {
  return useMemo(() => buildGoalIndex(allGoalsGlobal), [allGoalsGlobal])
}
