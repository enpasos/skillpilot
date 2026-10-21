import type { UiGoal } from '../goalTypes'
import { resolveAtomicGoalDescendants } from './localTeacherCoursePlan'

type VisibleChildren = ReadonlyMap<string, readonly string[]>

export interface CoursePlanTopicSelection {
  atomicGoalIds: string[]
  invalidGoalIds: string[]
}

export interface CoursePlanTopicTreeNode {
  goalId: string
  children: CoursePlanTopicTreeNode[]
  /** False only for ancestors shown to locate a search result. */
  selectable: boolean
}

function childrenFor(goal: UiGoal, visibleChildren?: VisibleChildren): readonly string[] {
  return visibleChildren?.has(goal.id) ? visibleChildren.get(goal.id) ?? [] : goal.contains
}

/** Resolve the selected contains subtrees, never their requires closure. */
export function resolveCoursePlanTopicSelection(
  goalIds: readonly string[],
  goals: ReadonlyMap<string, UiGoal>,
  visibleChildren?: VisibleChildren,
): CoursePlanTopicSelection {
  const atoms = new Set<string>()
  const invalid = new Set<string>()
  for (const goalId of goalIds) {
    const resolution = resolveAtomicGoalDescendants(goalId, goals, visibleChildren)
    if (resolution.quality.status !== 'complete' || resolution.atomicGoalIds.length === 0) {
      invalid.add(goalId)
    } else {
      resolution.atomicGoalIds.forEach((id) => atoms.add(id))
    }
  }
  return { atomicGoalIds: [...atoms], invalidGoalIds: [...invalid] }
}

function createResolutionLookup(
  goals: ReadonlyMap<string, UiGoal>,
  visibleChildren?: VisibleChildren,
) {
  const resolutions = new Map<string, CoursePlanTopicSelection>()
  return (id: string) => {
    let result = resolutions.get(id)
    if (!result) {
      result = resolveCoursePlanTopicSelection([id], goals, visibleChildren)
      resolutions.set(id, result)
    }
    return result
  }
}

function normalizeSelectionRoots(
  rootIds: readonly string[],
  desired: ReadonlySet<string>,
  goals: ReadonlyMap<string, UiGoal>,
  visibleChildren: VisibleChildren | undefined,
  resolve: ReturnType<typeof createResolutionLookup>,
): string[] {
  const candidates: string[] = []
  const visited = new Set<string>()
  const visit = (id: string, preserveInvalid = false) => {
    if (visited.has(id)) return
    const resolution = resolve(id)
    if (resolution.invalidGoalIds.length > 0) {
      // Empty, valid projection containers may occur below a usable parent.
      // Keep invalid saved roots, but never introduce an empty child selection.
      if (preserveInvalid) {
        candidates.push(id)
        visited.add(id)
      }
      return
    }
    visited.add(id)
    const goal = goals.get(id)
    const synthetic = goal?.tags?.includes('synthetic:program-unit') === true
    if (!synthetic && resolution.atomicGoalIds.every((atom) => desired.has(atom))) {
      candidates.push(id)
    } else if (resolution.atomicGoalIds.some((atom) => desired.has(atom))) {
      if (goal) childrenFor(goal, visibleChildren).forEach((childId) => visit(childId))
    }
  }
  rootIds.forEach((id) => visit(id, true))

  const atomSets = new Map(candidates.map((id) => [id, new Set(resolve(id).atomicGoalIds)]))
  const owners = new Map<string, number[]>()
  candidates.forEach((id, index) => {
    for (const atom of atomSets.get(id)!) {
      const indices = owners.get(atom) ?? []
      indices.push(index)
      owners.set(atom, indices)
    }
  })
  return candidates.filter((id, index) => {
    const own = resolve(id)
    if (own.invalidGoalIds.length > 0) return true
    // Only a root sharing every atom can subsume this root. Start with the
    // rarest atom to avoid comparing each independent topic with every other.
    const possibleParents = own.atomicGoalIds
      .map((atom) => owners.get(atom)!)
      .reduce((smallest, indices) => indices.length < smallest.length ? indices : smallest)
    return !possibleParents.some((otherIndex) => {
      if (index === otherIndex) return false
      const otherAtoms = atomSets.get(candidates[otherIndex])!
      return own.atomicGoalIds.every((atom) => otherAtoms.has(atom))
        && (otherAtoms.size > own.atomicGoalIds.length || otherIndex < index)
    })
  })
}

/**
 * Normalize saved selections without changing their visible atomic scope.
 * Synthetic structures become canonical roots; stale references stay visible.
 */
export function normalizeCoursePlanTopicGoalIds(
  selectedGoalIds: readonly string[],
  goals: ReadonlyMap<string, UiGoal>,
  visibleChildren?: VisibleChildren,
): string[] {
  const resolve = createResolutionLookup(goals, visibleChildren)
  const desired = new Set(selectedGoalIds.flatMap((id) => resolve(id).atomicGoalIds))
  return normalizeSelectionRoots(selectedGoalIds, desired, goals, visibleChildren, resolve)
}

/**
 * Removing part of a selected parent replaces it with the remaining subtrees.
 * This makes exclusions survive a save/reload without a separate exclusion model.
 * Unavailable saved references survive unrelated edits until explicitly removed.
 */
export function setCoursePlanTopicSelected(
  selectedGoalIds: readonly string[],
  targetGoalId: string,
  selected: boolean,
  goals: ReadonlyMap<string, UiGoal>,
  visibleChildren?: VisibleChildren,
): string[] {
  const resolve = createResolutionLookup(goals, visibleChildren)
  const target = resolve(targetGoalId)
  if (target.invalidGoalIds.length > 0) {
    return selected ? [...selectedGoalIds] : selectedGoalIds.filter((id) => id !== targetGoalId)
  }
  const desired = new Set(selectedGoalIds.flatMap((id) => resolve(id).atomicGoalIds))
  target.atomicGoalIds.forEach((id) => { if (selected) desired.add(id); else desired.delete(id) })
  return normalizeSelectionRoots(selected ? [...selectedGoalIds, targetGoalId] : selectedGoalIds,
    desired, goals, visibleChildren, resolve)
}

/** Render each learner-facing goal once, preserving authored child order. */
export function buildCoursePlanTopicTree(
  goals: ReadonlyMap<string, UiGoal>,
  visibleChildren?: VisibleChildren,
): CoursePlanTopicTreeNode[] {
  const children = new Set<string>()
  for (const goal of goals.values()) {
    childrenFor(goal, visibleChildren).forEach((id) => { if (goals.has(id)) children.add(id) })
  }
  const visited = new Set<string>()
  const visit = (id: string): CoursePlanTopicTreeNode[] => {
    const goal = goals.get(id)
    if (!goal || visited.has(id)) return []
    visited.add(id)
    return [{ goalId: id, children: childrenFor(goal, visibleChildren).flatMap(visit), selectable: true }]
  }
  const roots = [...goals.keys()].filter((id) => !children.has(id)).flatMap(visit)
  // Malformed cyclic components remain visible (and nonselectable by resolution).
  return [...roots, ...[...goals.keys()].filter((id) => !visited.has(id)).flatMap(visit)]
}

/** Search changes only visibility; path-only ancestors cannot select hidden siblings. */
export function filterCoursePlanTopicTree(
  tree: readonly CoursePlanTopicTreeNode[],
  query: string,
  goals: ReadonlyMap<string, UiGoal>,
  language: 'de' | 'en',
): CoursePlanTopicTreeNode[] {
  const search = query.trim().toLocaleLowerCase(language)
  if (!search) return [...tree]
  const visit = (node: CoursePlanTopicTreeNode, ancestorMatched = false): CoursePlanTopicTreeNode[] => {
    const goal = goals.get(node.goalId)
    const ownMatch = ancestorMatched || Boolean(goal && `${goal.title} ${goal.area}`.toLocaleLowerCase(language).includes(search))
    const children = node.children.flatMap((child) => visit(child, ownMatch))
    return ownMatch || children.length > 0 ? [{ ...node, children, selectable: ownMatch }] : []
  }
  return tree.flatMap((node) => visit(node))
}

/** Authored assessments only. Coverage is explicit, never inferred from requires. */
export function findCoursePlanMatchingTasks(
  selectedGoalIds: readonly string[],
  goals: ReadonlyMap<string, UiGoal>,
  visibleChildren?: VisibleChildren,
): UiGoal[] {
  const selected = new Set(resolveCoursePlanTopicSelection(selectedGoalIds, goals, visibleChildren).atomicGoalIds)
  const direct = new Set(selectedGoalIds)
  return [...goals.values()].filter((goal) => {
    const exam = goal.examData
    if (!exam || (exam.reviewStatus !== undefined && exam.reviewStatus !== 'released')) return false
    if (!exam.taskContent?.trim() || !exam.solutionContent?.trim()) return false
    const scoring = exam.scoring
    if (!scoring || !Number.isFinite(scoring.maxPoints) || scoring.maxPoints <= 0
      || !Number.isFinite(scoring.passingPoints) || scoring.passingPoints < 0
      || scoring.passingPoints > scoring.maxPoints || !Array.isArray(scoring.steps) || scoring.steps.length === 0) return false
    if (direct.has(goal.id) || selected.has(goal.id)) return true
    if (!exam.coveredGoalIds?.length) return false
    const covered = resolveCoursePlanTopicSelection(exam.coveredGoalIds, goals, visibleChildren)
    return covered.invalidGoalIds.length === 0 && covered.atomicGoalIds.length > 0
      && covered.atomicGoalIds.every((id) => selected.has(id))
  })
}
