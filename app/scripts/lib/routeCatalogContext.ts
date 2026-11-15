// SPDX-License-Identifier: Apache-2.0
import type { LearningGoal, SkillLandscape } from '../../src/landscapeTypes'

/** Read-only route context. Foreign prerequisites are available for resolution;
 * their presence here never grants a target role or visible placement. */
export function buildRouteCatalogContext(landscape: SkillLandscape, catalog: readonly SkillLandscape[]) {
  const roots = new Set<string>()
  const byId = new Map<string, { owner: string; goal: LearningGoal }>()
  for (const source of catalog) {
    if (roots.has(source.landscapeId)) throw new Error(`Duplicate route catalog root: ${source.landscapeId}`)
    roots.add(source.landscapeId)
    for (const goal of source.goals) {
      // The learner projection uses stable unqualified IDs too. A collision must
      // fail rather than silently select whichever subject was loaded last.
      if (byId.has(goal.id)) throw new Error(`Ambiguous route catalog goal: ${goal.id}`)
      byId.set(goal.id, { owner: source.landscapeId, goal })
    }
  }
  if (!roots.has(landscape.landscapeId)) throw new Error(`Missing route catalog root: ${landscape.landscapeId}`)
  if (JSON.stringify(catalog.find(source => source.landscapeId === landscape.landscapeId)!.goals)
    !== JSON.stringify(landscape.goals)) throw new Error(`Stale route catalog root: ${landscape.landscapeId}`)
  const resolve = (raw: string, owner: string): string => {
    const parts = raw.split(':')
    if (parts.length > 2 || !parts.at(-1)) throw new Error(`Invalid route reference: ${raw}`)
    const id = parts.at(-1)!
    const entry = byId.get(id)
    if (!entry || (parts.length === 2 && entry.owner !== (parts[0] || owner))) {
      throw new Error(`Unresolved route reference ${raw} in ${owner}`)
    }
    return id
  }
  const ownGoalIds = new Set(landscape.goals.map(goal => goal.id))
  const goals = [...byId.values()].map(({ owner, goal }) => ({
    ...goal,
    contains: (goal.contains ?? []).map(ref => resolve(ref, owner)),
    requires: (goal.requires ?? []).map(ref => resolve(ref, owner)),
  }))
  const context: SkillLandscape = { ...landscape, goals }
  return { landscape: context, ownGoalIds }
}

/** Keep exactly authored foreign support that is needed by this projection.
 * Never add a missing prerequisite, even if it exists in the catalog. */
export function restrictForeignRouteSupport(
  visibleIds: Set<string>,
  targetIds: ReadonlySet<string>,
  ownGoalIds: ReadonlySet<string>,
  edges: ReadonlyMap<string, readonly string[]>,
  anchors: readonly string[],
): void {
  const needed = new Set<string>()
  const pending = [...targetIds, ...anchors]
  while (pending.length) {
    const id = pending.pop()!
    if (needed.has(id)) continue
    needed.add(id)
    pending.push(...(edges.get(id) ?? []))
  }
  for (const id of visibleIds) {
    if (!ownGoalIds.has(id) && !needed.has(id)) visibleIds.delete(id)
  }
}
