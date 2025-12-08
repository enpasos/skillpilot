import { useMemo } from 'react'
import type { UiGoal as Goal } from '../goalTypes'

export interface NeighborSets {
  containers: Goal[]
  children: Goal[]
  requires: Goal[]
  inheritedRequires: Goal[]
  effectiveRequires: Goal[]
  forward: Goal[]
}

export function useCompetenceGraph(current: Goal | null, allGoals: Goal[]) {
  const neighbors: NeighborSets = useMemo(() => {
    if (!current) return { containers: [], children: [], requires: [], inheritedRequires: [], effectiveRequires: [], forward: [] }

    const children = current.contains
      .map((id) => allGoals.find((g) => g.id === id))
      .filter((g): g is Goal => Boolean(g))

    const requires = current.requires
      .map((id) => allGoals.find((g) => g.id === id))
      .filter((g): g is Goal => Boolean(g))

    const inheritedRequires = (current.inheritedRequires ?? [])
      .map((id) => allGoals.find((g) => g.id === id))
      .filter((g): g is Goal => Boolean(g))

    const effectiveRequires = (current.effectiveRequires && current.effectiveRequires.length > 0
      ? current.effectiveRequires
      : current.requires)
      .map((id) => allGoals.find((g) => g.id === id))
      .filter((g): g is Goal => Boolean(g))

    const containers = allGoals.filter((g) => g.contains.includes(current.id))
    const forward = allGoals.filter((g) => g.requires.includes(current.id))

    return { containers, children, requires, inheritedRequires, effectiveRequires, forward }
  }, [allGoals, current])

  return { neighbors }
}
