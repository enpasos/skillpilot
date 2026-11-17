// SPDX-License-Identifier: Apache-2.0
// Legacy subject packages declare foreign prerequisites. For explicit foreign
// acquisition placements they additionally carry the canonical graph excerpts
// needed to verify the entire prerequisite path, without importing learning data.
export type PreparationEvidence = {
  consumerGoalId: string
  requiredByPath: string[]
}

export type PreparationGraphNode = { requires: string[]; contains: string[] }
export const readPreparationCanonicalGraphs = (value: unknown, localGoalIds: ReadonlySet<string>) => {
  const graph = new Map<string, PreparationGraphNode>()
  const owners = new Map<string, string>()
  const issues: string[] = []
  if (value === undefined) return { graph, owners, issues }
  const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v)
  const keys = (v: Record<string, unknown>, expected: string[]) => Object.keys(v).sort().join(',') === expected.sort().join(',')
  const ids = (v: unknown): v is string[] => Array.isArray(v)
    && v.every(id => typeof id === 'string' && id.trim().length > 0) && new Set(v).size === v.length
  if (!object(value) || !keys(value, ['schemaVersion', 'catalogs']) || value.schemaVersion !== 1 || !Array.isArray(value.catalogs)) {
    return { graph, owners, issues: ['Invalid preparation canonical graph document'] }
  }
  const landscapes = new Set<string>()
  for (const catalog of value.catalogs) {
    if (!object(catalog) || !keys(catalog, ['landscapeId', 'canonicalSourceSha256', 'goals'])
      || typeof catalog.landscapeId !== 'string' || !catalog.landscapeId.trim() || landscapes.has(catalog.landscapeId)
      || typeof catalog.canonicalSourceSha256 !== 'string' || !/^[a-f0-9]{64}$/.test(catalog.canonicalSourceSha256)
      || !Array.isArray(catalog.goals) || !catalog.goals.length) {
      issues.push('Invalid preparation canonical catalog'); continue
    }
    landscapes.add(catalog.landscapeId)
    for (const goal of catalog.goals) {
      if (!object(goal) || !keys(goal, ['id', 'requires', 'contains']) || typeof goal.id !== 'string' || !goal.id.trim()
        || localGoalIds.has(goal.id) || graph.has(goal.id) || !ids(goal.requires)
        || !Array.isArray(goal.contains) || goal.contains.length) {
        issues.push('Invalid or overlapping preparation canonical atom'); continue
      }
      graph.set(goal.id, { requires: goal.requires, contains: [] })
      owners.set(goal.id, catalog.landscapeId)
    }
  }
  if (issues.length) { graph.clear(); owners.clear() }
  return { graph, owners, issues }
}

export const readPreparationEvidence = (
  value: unknown, goalId: string, localGoalIds: ReadonlySet<string>,
): PreparationEvidence | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const evidence = value as Record<string, unknown>
  const path = evidence.requiredByPath
  if (evidence.role !== 'reviewedPreparation'
    || typeof evidence.consumerGoalId !== 'string' || !localGoalIds.has(evidence.consumerGoalId)
    || !Array.isArray(path) || path.length < 2
    || !path.every((id): id is string => typeof id === 'string' && id.length > 0)
    || new Set(path).size !== path.length
    || path[0] !== evidence.consumerGoalId || path.at(-1) !== goalId
    || typeof evidence.rationale !== 'string' || !evidence.rationale.trim()) return null
  return { consumerGoalId: evidence.consumerGoalId, requiredByPath: [...path] }
}
