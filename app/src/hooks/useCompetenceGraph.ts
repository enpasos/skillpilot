import { useMemo } from 'react'
import type { UiGoal as Goal } from '../goalTypes'

export interface NeighborSets {
  containers: Goal[]
  children: Goal[]
  requires: Goal[]
  inheritedRequires: Goal[]
  effectiveRequires: Goal[]
  directForward: Goal[]
  inheritedForward: Goal[]
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

function refsMatch(a: string, b: string): boolean {
  return normalizeGoalRef(a) === normalizeGoalRef(b)
}

function uniqueById(goals: Goal[]): Goal[] {
  const deduped = new Map<string, Goal>()
  goals.forEach((goal) => deduped.set(goal.id, goal))
  return Array.from(deduped.values())
}

export function useCompetenceGraph(current: Goal | null, allGoals: Goal[]) {
  const neighbors: NeighborSets = useMemo(() => {
    if (!current) {
      return {
        containers: [],
        children: [],
        requires: [],
        inheritedRequires: [],
        effectiveRequires: [],
        directForward: [],
        inheritedForward: [],
        forward: [],
      }
    }

    const goalById = new Map(allGoals.map((g) => [g.id, g]))
    const resolveGoalRef = (ref: string): Goal | undefined => {
      return goalById.get(ref) ?? goalById.get(normalizeGoalRef(ref))
    }

    const getGoalEffectiveRefs = (goal: Goal): string[] => {
      if (goal.effectiveRequires && goal.effectiveRequires.length > 0) {
        return goal.effectiveRequires
      }
      return goal.requires
    }

    const getGoalInheritedRefs = (goal: Goal): string[] => {
      if (goal.inheritedRequires && goal.inheritedRequires.length > 0) {
        return goal.inheritedRequires
      }
      // Fallback for landscapes where inherited refs are not precomputed.
      return getGoalEffectiveRefs(goal).filter(
        (ref) => !goal.requires.some((directRef) => refsMatch(directRef, ref)),
      )
    }

    const resolveRefs = (refs: string[]) =>
      uniqueById(
        refs
          .map((id) => resolveGoalRef(id))
          .filter((g): g is Goal => Boolean(g))
          .filter((g) => g.id !== current.id),
      )

    const prerequisiteClosureMemo = new Map<string, Set<string>>()
    const getPrerequisiteClosure = (goalId: string, stack: Set<string> = new Set()): Set<string> => {
      const cached = prerequisiteClosureMemo.get(goalId)
      if (cached) return cached
      if (stack.has(goalId)) return new Set()

      stack.add(goalId)
      const closure = new Set<string>()
      const goal = goalById.get(goalId)
      if (goal) {
        getGoalEffectiveRefs(goal).forEach((ref) => {
          const reqGoal = resolveGoalRef(ref)
          if (!reqGoal || reqGoal.id === goalId) return
          closure.add(reqGoal.id)
          const deeper = getPrerequisiteClosure(reqGoal.id, stack)
          deeper.forEach((id) => closure.add(id))
        })
      }
      stack.delete(goalId)
      prerequisiteClosureMemo.set(goalId, closure)
      return closure
    }

    const children = resolveRefs(current.contains)
    const requiresRaw = resolveRefs(current.requires)
    const inheritedRequiresRaw = resolveRefs(current.inheritedRequires ?? [])
    const effectiveRequires = resolveRefs(
      (current.effectiveRequires && current.effectiveRequires.length > 0
        ? current.effectiveRequires
        : current.requires),
    )

    // Incoming transitive reduction:
    // hide prerequisites that are already required by another shown prerequisite.
    const incomingCandidates = uniqueById([...requiresRaw, ...inheritedRequiresRaw])
    const incomingHidden = new Set<string>()
    incomingCandidates.forEach((candidate) => {
      const isImplied = incomingCandidates.some((other) => {
        if (other.id === candidate.id) return false
        return getPrerequisiteClosure(other.id).has(candidate.id)
      })
      if (isImplied) incomingHidden.add(candidate.id)
    })

    const requires = requiresRaw.filter((goal) => !incomingHidden.has(goal.id))
    const requiresIds = new Set(requires.map((goal) => goal.id))
    const inheritedRequires = inheritedRequiresRaw.filter(
      (goal) => !incomingHidden.has(goal.id) && !requiresIds.has(goal.id),
    )

    const containers = allGoals.filter((g) => g.contains.some((ref) => refMatchesGoal(ref, current.id)))

    const directForwardRaw = allGoals.filter(
      (goal) => goal.id !== current.id && goal.requires.some((ref) => refMatchesGoal(ref, current.id)),
    )
    const inheritedForwardRaw = allGoals.filter(
      (goal) =>
        goal.id !== current.id &&
        !goal.requires.some((ref) => refMatchesGoal(ref, current.id)) &&
        getGoalInheritedRefs(goal).some((ref) => refMatchesGoal(ref, current.id)),
    )
    const forwardCandidates = uniqueById([...directForwardRaw, ...inheritedForwardRaw])

    // Outgoing transitive reduction:
    // hide next-steps that are reachable through another shown next-step.
    const forwardHidden = new Set<string>()
    forwardCandidates.forEach((candidate) => {
      const closure = getPrerequisiteClosure(candidate.id)
      const isTransitive = forwardCandidates.some((other) => {
        if (other.id === candidate.id) return false
        return closure.has(other.id)
      })
      if (isTransitive) forwardHidden.add(candidate.id)
    })

    const directForward = directForwardRaw.filter((goal) => !forwardHidden.has(goal.id))
    const directForwardIds = new Set(directForward.map((goal) => goal.id))
    const inheritedForward = inheritedForwardRaw.filter(
      (goal) => !forwardHidden.has(goal.id) && !directForwardIds.has(goal.id),
    )
    const forward = uniqueById([...directForward, ...inheritedForward])

    return {
      containers,
      children,
      requires,
      inheritedRequires,
      effectiveRequires,
      directForward,
      inheritedForward,
      forward,
    }
  }, [allGoals, current])

  return { neighbors }
}
