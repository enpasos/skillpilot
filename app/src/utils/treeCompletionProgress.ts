import type { CompletionTreeWaiver } from './levelCompletionApi'
import type { UiGoal } from '../goalTypes'
import { isMastered } from '../goalUiUtils'

export interface TreeCompletionProgress {
  totalCount: number
  explicitCount: number
  implicitCount: number
  notRequiredCount: number
  openCount: number
  totalWeight: number
  explicitWeight: number
  implicitWeight: number
  notRequiredWeight: number
  openWeight: number
  explicitRatio: number
  implicitRatio: number
}

/** Display-only totals over unique visible atoms; implicit membership comes from the current backend scope. */
export const buildTreeCompletionProgressMap = (
  allGoals: Map<string, UiGoal>,
  visibleChildrenByParent: Map<string, string[]>,
  getMastery: (goalId: string) => number,
  waivers?: ReadonlyMap<string, CompletionTreeWaiver>,
): Map<string, TreeCompletionProgress> => {
  const atomsByGoal = new Map<string, ReadonlySet<string>>()
  const visiting = new Set<string>()

  const collectAtoms = (goalId: string): ReadonlySet<string> => {
    const cached = atomsByGoal.get(goalId)
    if (cached) return cached
    const atoms = new Set<string>()
    const goal = allGoals.get(goalId)
    if (!goal || visiting.has(goalId)) return atoms

    visiting.add(goalId)
    const children = visibleChildrenByParent.get(goalId) ?? []
    const isCluster = goal.type === 'cluster' || goal.contains.length > 0 || children.length > 0
    if (isCluster) {
      for (const childId of children) {
        for (const atomId of collectAtoms(childId)) atoms.add(atomId)
      }
    } else {
      atoms.add(goalId)
    }
    visiting.delete(goalId)
    atomsByGoal.set(goalId, atoms)
    return atoms
  }

  const atomStates = new Map<string, { weight: number; explicit: boolean; reason: CompletionTreeWaiver['reason'] | undefined }>()
  const progressByGoal = new Map<string, TreeCompletionProgress>()
  for (const goalId of allGoals.keys()) {
    const progress: TreeCompletionProgress = {
      totalCount: 0, explicitCount: 0, implicitCount: 0, notRequiredCount: 0, openCount: 0,
      totalWeight: 0, explicitWeight: 0, implicitWeight: 0, notRequiredWeight: 0, openWeight: 0,
      explicitRatio: 0, implicitRatio: 0,
    }
    for (const atomId of collectAtoms(goalId)) {
      let state = atomStates.get(atomId)
      if (!state) {
        const weight = allGoals.get(atomId)!.weight
        const explicit = isMastered(getMastery(atomId))
        state = {
          // Missing or invalid authoring weights must not hide an otherwise visible atom.
          weight: Number.isFinite(weight) && weight > 0 ? weight : 1,
          explicit,
          reason: waivers?.get(atomId)?.reason,
        }
        atomStates.set(atomId, state)
      }
      if (state.explicit) {
        progress.explicitCount += 1
        progress.explicitWeight += state.weight
      } else if (state.reason === 'assessment') {
        progress.implicitCount += 1
        progress.implicitWeight += state.weight
      } else if (state.reason) {
        progress.notRequiredCount += 1
        progress.notRequiredWeight += state.weight
      } else {
        progress.openCount += 1
        progress.openWeight += state.weight
      }
    }
    progress.totalCount = progress.explicitCount + progress.implicitCount + progress.notRequiredCount + progress.openCount
    progress.totalWeight = progress.explicitWeight + progress.implicitWeight + progress.notRequiredWeight + progress.openWeight
    if (progress.totalWeight > 0) {
      progress.explicitRatio = progress.explicitWeight / progress.totalWeight
      progress.implicitRatio = progress.implicitWeight / progress.totalWeight
    }
    progressByGoal.set(goalId, progress)
  }
  return progressByGoal
}
