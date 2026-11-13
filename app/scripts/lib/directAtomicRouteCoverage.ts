// SPDX-License-Identifier: Apache-2.0
import type { LearningGoal, SkillLandscape } from '../../src/landscapeTypes'

export interface DirectAtomicRouteProfile {
  motivationAnchorGoalIds: string[]
  terminalAutonomyClusterIds: string[]
  goalSelector: (goal: LearningGoal) => boolean
}

/** CQR-102 reachability only. This does not claim GVR-012 semantic route order. */
export function evaluateDirectAtomicRouteCoverage(landscape: SkillLandscape, profile: DirectAtomicRouteProfile) {
  const goals = new Map(landscape.goals.map(goal => [goal.id, goal]))
  const atomic = (goal: LearningGoal) => !goal.contains?.length
  const terminal = (goal: LearningGoal | undefined): goal is LearningGoal => !!goal && atomic(goal)
    && goal.nodeKind !== 'memory' && !goal.tags?.includes('memorization')
    && !goal.tags?.some(tag => tag.startsWith('srs-deck:'))
  const localId = (reference: string): string | undefined => {
    const colon = reference.indexOf(':')
    if (colon < 0) return reference
    const [owner, id] = reference.split(':', 2)
    return !owner || owner === landscape.landscapeId ? id : undefined
  }
  const edges = new Map<string, string[]>()
  for (const goal of landscape.goals) edges.set(goal.id, atomic(goal) ? (goal.requires ?? [])
    .map(localId).filter((id): id is string => id !== undefined && !!goals.get(id) && atomic(goals.get(id)!)) : [])
  const reachable = new Map<string, Set<string>>()
  const path = (source: string, target: string): boolean => {
    if (!reachable.has(source)) {
      const seen = new Set<string>(), pending = [source]
      while (pending.length) {
        const id = pending.pop()!
        if (seen.has(id)) continue
        seen.add(id); pending.push(...(edges.get(id) ?? []))
      }
      reachable.set(source, seen)
    }
    return reachable.get(source)!.has(target)
  }
  // Preserve the existing CQR-102 direct-child endpoint selection exactly.
  const configurationIssues: string[] = []
  const duplicates = (ids: string[]) => ids.filter((id, index) => ids.indexOf(id) !== index)
  for (const id of duplicates(profile.motivationAnchorGoalIds)) configurationIssues.push(`Duplicate motivation anchor: ${id}`)
  for (const id of duplicates(profile.terminalAutonomyClusterIds)) configurationIssues.push(`Duplicate terminal cluster: ${id}`)
  if (!profile.motivationAnchorGoalIds.length) configurationIssues.push('No motivation anchors configured.')
  if (!profile.terminalAutonomyClusterIds.length) configurationIssues.push('No terminal clusters configured.')
  for (const id of profile.motivationAnchorGoalIds) {
    const anchor = goals.get(id)
    if (!anchor || !atomic(anchor)) configurationIssues.push(`Missing or non-atomic motivation anchor: ${id}`)
  }
  for (const id of profile.terminalAutonomyClusterIds) {
    const cluster = goals.get(id)
    if (!cluster || atomic(cluster)) configurationIssues.push(`Missing or non-cluster terminal configuration: ${id}`)
    else if (!cluster.contains.some(child => terminal(goals.get(child)))) {
      configurationIssues.push(`No atomic terminal goals in configured cluster: ${id}`)
    }
    if (cluster) for (const child of cluster.contains ?? []) {
      if (!goals.has(child)) configurationIssues.push(`Missing terminal child ${child} in cluster ${id}`)
    }
  }
  const terminalGoalIds = profile.terminalAutonomyClusterIds.flatMap(id => goals.get(id)?.contains ?? [])
    .map(id => goals.get(id)).filter(terminal)
    .map(goal => goal.id)
  const selectedGoals = landscape.goals.filter(profile.goalSelector)
  if (!selectedGoals.length) configurationIssues.push('No selected atomic route goals.')
  for (const goal of selectedGoals) if (!atomic(goal)) configurationIssues.push(`Selected route goal is not atomic: ${goal.id}`)
  for (const id of duplicates(terminalGoalIds)) configurationIssues.push(`Duplicate atomic terminal endpoint: ${id}`)
  const missingDirectMotivation = selectedGoals.filter(goal => !profile.motivationAnchorGoalIds.some(id => path(goal.id, id)))
  const missingDirectTerminal = selectedGoals.filter(goal => !terminalGoalIds.some(id => path(id, goal.id)))
  return {
    selectedGoals, terminalGoalIds, missingDirectMotivation, missingDirectTerminal, configurationIssues,
    details: [...configurationIssues, ...missingDirectMotivation.map(goal => `No direct atomic motivation path: ${goal.id}`),
      ...missingDirectTerminal.map(goal => `No direct atomic terminal path: ${goal.id}`)],
  }
}
