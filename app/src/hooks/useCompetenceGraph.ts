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

function normalizeGoalRef(ref: string): string {
  const idx = ref.indexOf(':')
  if (idx >= 0 && idx < ref.length - 1) {
    return ref.slice(idx + 1)
  }
  return ref
}

function refMatchesGoal(ref: string, goalId: string): boolean {
  return ref === goalId || normalizeGoalRef(ref) === goalId
}

function resolveGoalRef(ref: string, allGoals: Goal[]): Goal | undefined {
  return allGoals.find((g) => g.id === ref) ?? allGoals.find((g) => g.id === normalizeGoalRef(ref))
}

function uniqueById(goals: Goal[]): Goal[] {
  const deduped = new Map<string, Goal>()
  goals.forEach((goal) => deduped.set(goal.id, goal))
  return Array.from(deduped.values())
}

export function useCompetenceGraph(current: Goal | null, allGoals: Goal[]) {
  const neighbors: NeighborSets = useMemo(() => {
    if (!current) return { containers: [], children: [], requires: [], inheritedRequires: [], effectiveRequires: [], forward: [] }

    const resolveRefs = (refs: string[]) =>
      uniqueById(
        refs
          .map((id) => resolveGoalRef(id, allGoals))
          .filter((g): g is Goal => Boolean(g))
          .filter((g) => g.id !== current.id),
      )

    const children = resolveRefs(current.contains)
    const requires = resolveRefs(current.requires)
    const inheritedRequires = resolveRefs(current.inheritedRequires ?? [])
    const effectiveRequires = resolveRefs(
      (current.effectiveRequires && current.effectiveRequires.length > 0
        ? current.effectiveRequires
        : current.requires),
    )

    const containers = allGoals.filter((g) => g.contains.some((ref) => refMatchesGoal(ref, current.id)))
    const forward = allGoals.filter(
      (g) => g.id !== current.id && g.requires.some((ref) => refMatchesGoal(ref, current.id)),
    )

    return { containers, children, requires, inheritedRequires, effectiveRequires, forward }
  }, [allGoals, current])

  return { neighbors }
}
