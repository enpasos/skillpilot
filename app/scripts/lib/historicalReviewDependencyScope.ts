// SPDX-License-Identifier: Apache-2.0
/** Conservative whole-subject dependency scope for historical comparisons only. */
export interface ReviewFrameDocument {
  landscapeId: string
  goals: Array<Record<string, unknown> & { id: string; contains?: string[] }>
  [key: string]: unknown
}
const stable = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`
  if (value !== null && typeof value === 'object') return `{${Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, child]) => `${JSON.stringify(key)}:${stable(child)}`).join(',')}}`
  return JSON.stringify(value)
}
export function eligibleHistoricalReviewLandscapes(
  current: readonly ReviewFrameDocument[], certified: readonly ReviewFrameDocument[],
): Set<string> {
  const documents = new Map(current.map(doc => [doc.landscapeId, doc]))
  const old = new Map(certified.map(doc => [doc.landscapeId, doc]))
  if (documents.size !== current.length || old.size !== certified.length || documents.size !== old.size
    || [...documents.keys()].some(id => !old.has(id))) throw new Error('Historical review dependency scope: catalog identities differ')
  const owners = new Map<string, Set<string>>()
  for (const doc of [...current, ...certified]) for (const goal of doc.goals) {
    const set = owners.get(goal.id) ?? new Set<string>(); set.add(doc.landscapeId); owners.set(goal.id, set)
  }
  const edges = new Map(current.map(doc => [doc.landscapeId, new Set<string>()]))
  const referencedOwners = (raw: string, local: string): Set<string> => {
    const result = new Set<string>()
    // Includes IDs embedded in structured qualified refs, locators and source URLs.
    for (const id of documents.keys()) if (raw.includes(id)) result.add(id)
    const goalOwners = owners.get(raw)
    // A local unqualified reference resolves locally; otherwise retain every
    // possible foreign owner. Ambiguity can only remove reuse, never grant it.
    if (goalOwners?.has(local)) result.add(local)
    else for (const owner of goalOwners ?? []) result.add(owner)
    return result
  }
  const scan = (value: unknown, local: string) => {
    if (typeof value === 'string') for (const owner of referencedOwners(value, local)) edges.get(local)!.add(owner)
    else if (Array.isArray(value)) for (const child of value) scan(child, local)
    else if (value !== null && typeof value === 'object') for (const [key, child] of Object.entries(value)) { scan(key, local); scan(child, local) }
  }
  // All authored subject fields remain dependency-bound in both frames.
  for (const doc of [...current, ...certified]) scan(doc, doc.landscapeId)
  const eligible = new Set([...documents.keys()].filter(id => stable(documents.get(id)) === stable(old.get(id))))
  const keysForReference = (raw: string, local: string): string[] => {
    const colon = raw.indexOf(':')
    if (colon >= 0) {
      const parts = raw.split(':')
      return parts.length === 2 && parts[1] && documents.has(parts[0] || local) ? [`${parts[0] || local}:${parts[1]}`] : []
    }
    const possible = owners.get(raw)
    return possible?.has(local) ? [`${local}:${raw}`] : [...possible ?? []].map(owner => `${owner}:${raw}`)
  }
  const currentGoals = new Map<string, ReviewFrameDocument['goals'][number]>(current.flatMap(doc => doc.goals.map(goal => [`${doc.landscapeId}:${goal.id}`, goal] as const)))
  const oldGoals = new Map<string, ReviewFrameDocument['goals'][number]>(certified.flatMap(doc => doc.goals.map(goal => [`${doc.landscapeId}:${goal.id}`, goal] as const)))
  const invalidSubjects = new Set<string>()
  for (const frame of [current, certified]) {
    const frameKeys = new Set(frame.flatMap(doc => doc.goals.map(goal => `${doc.landscapeId}:${goal.id}`)))
    for (const doc of frame) {
      if (new Set(doc.goals.map(goal => goal.id)).size !== doc.goals.length) invalidSubjects.add(doc.landscapeId)
      for (const goal of doc.goals) {
        const extended = goal.extendedData as { assessmentApplicabilityBasis?: { goalRefs?: unknown } } | undefined
        for (const references of [goal.contains, goal.requires, extended?.assessmentApplicabilityBasis?.goalRefs]) {
          if (references === undefined) continue
          if (!Array.isArray(references)) { invalidSubjects.add(doc.landscapeId); continue }
          const seen = new Set<string>()
          for (const raw of references) {
            if (typeof raw !== 'string' || seen.has(raw)) { invalidSubjects.add(doc.landscapeId); continue }
            seen.add(raw)
            const keys = keysForReference(raw, doc.landscapeId)
            if (!keys.length || keys.some(key => !frameKeys.has(key))) invalidSubjects.add(doc.landscapeId)
          }
        }
      }
    }
  }
  for (const id of invalidSubjects) eligible.delete(id)
  const parents = new Map<string, Set<string>>()
  for (const doc of [...current, ...certified]) for (const goal of doc.goals) for (const raw of goal.contains ?? []) {
    for (const child of keysForReference(raw, doc.landscapeId)) {
      const containing = parents.get(child) ?? new Set<string>()
      containing.add(`${doc.landscapeId}:${goal.id}`); parents.set(child, containing)
    }
  }
  for (const doc of current) {
    const seen = new Set<string>(), pending = doc.goals.map(goal => `${doc.landscapeId}:${goal.id}`)
    while (pending.length) {
      const key = pending.pop()!
      if (seen.has(key)) continue
      seen.add(key)
      for (const parent of parents.get(key) ?? []) {
        pending.push(parent)
        const owner = parent.slice(0, parent.indexOf(':'))
        if (owner === doc.landscapeId) continue
        const goal = currentGoals.get(parent), original = oldGoals.get(parent)
        if (invalidSubjects.has(owner) || !goal || !original || stable(goal) !== stable(original)) { eligible.delete(doc.landscapeId); continue }
        // Bind the actual inheriting ancestor, including all its requirements,
        // source/applicability/basis metadata. Its other contains children are
        // siblings, not prerequisites or inheritance inputs of this subject.
        const inherited = Object.fromEntries(Object.entries(goal).filter(([field]) => field !== 'id' && field !== 'contains'))
        const inheritedScan = (value: unknown) => {
          if (typeof value === 'string') for (const dependency of referencedOwners(value, owner)) edges.get(doc.landscapeId)!.add(dependency)
          else if (Array.isArray(value)) for (const child of value) inheritedScan(child)
          else if (value !== null && typeof value === 'object') for (const [key, child] of Object.entries(value)) { inheritedScan(key); inheritedScan(child) }
        }
        inheritedScan(inherited)
      }
    }
  }
  let changed = true
  while (changed) {
    changed = false
    for (const id of eligible) if ([...edges.get(id)!].some(dependency => !eligible.has(dependency))) {
      eligible.delete(id); changed = true
    }
  }
  return eligible
}

export interface HistoricalReviewApplicabilityRow {
  key: string
  compiledApplicability: unknown
}

/** Compare the complete compiled goal scope of every reusable subject. */
export function requireHistoricalReviewApplicabilityBinding(
  live: readonly HistoricalReviewApplicabilityRow[],
  certified: readonly HistoricalReviewApplicabilityRow[],
  eligible: ReadonlySet<string>,
): void {
  const select = (rows: readonly HistoricalReviewApplicabilityRow[]) => {
    const selected = new Map<string, HistoricalReviewApplicabilityRow>()
    const covered = new Set<string>()
    for (const row of rows) {
      if (!row || typeof row.key !== 'string') throw new Error('Historical review applicability: malformed goal row')
      const colon = row.key.indexOf(':')
      if (colon <= 0 || colon === row.key.length - 1) throw new Error('Historical review applicability: invalid goal key')
      const owner = row.key.slice(0, colon)
      if (!eligible.has(owner)) continue
      if (selected.has(row.key) || row.compiledApplicability === undefined) throw new Error('Historical review applicability: duplicate or missing compiled goal')
      selected.set(row.key, row)
      covered.add(owner)
    }
    for (const owner of eligible) if (!covered.has(owner)) throw new Error(`Historical review applicability: missing reusable subject ${owner}`)
    return [...selected.values()].sort((a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0)
  }
  if (!eligible.size) throw new Error('Historical review applicability: empty reusable scope')
  if (stable(select(live)) !== stable(select(certified))) throw new Error('Historical review applicability differs from certified frame in reusable subjects')
}
