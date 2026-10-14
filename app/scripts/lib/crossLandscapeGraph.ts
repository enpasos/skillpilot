/** Apache-2.0. Authoring validation uses the same direct + contains-inherited
 * prerequisite semantics as runtime. It never reduces requires transitively. */
export interface GraphGoal {
  id: string
  title?: string
  requires?: string[]
  contains?: string[]
}

export interface GraphLandscape<G extends GraphGoal = GraphGoal> {
  landscapeId: string
  file: string
  goals: G[]
}

export interface GraphNode<G extends GraphGoal = GraphGoal> {
  key: string
  landscapeId: string
  file: string
  goal: G
}

export interface PrerequisiteOrigin {
  prerequisiteKey: string
  declaredByKey: string
  reference: string
  inherited: boolean
}

export interface GraphDiagnostic {
  code: 'missing_reference' | 'ambiguous_reference' | 'inconsistent_graph_definition' | 'cycle'
  message: string
  nodeKey?: string
  relation?: 'requires' | 'contains' | 'effective requires'
}

export const graphKey = (landscapeId: string, goalId: string) => `${landscapeId}:${goalId}`

function relationshipDefinition(goal: GraphGoal): string {
  return JSON.stringify({
    requires: [...new Set(goal.requires ?? [])].sort(),
    contains: [...new Set(goal.contains ?? [])].sort(),
  })
}

export function buildCrossLandscapeGraph<G extends GraphGoal>(landscapes: GraphLandscape<G>[]) {
  const nodes = new Map<string, GraphNode<G>>()
  const owners = new Map<string, GraphNode<G>[]>()
  const definitionOccurrences = new Map<string, GraphNode<G>[]>()
  const diagnostics: GraphDiagnostic[] = []
  for (const landscape of [...landscapes].sort((a, b) => a.file.localeCompare(b.file))) {
    for (const goal of landscape.goals) {
      const key = graphKey(landscape.landscapeId, goal.id)
      const node = { key, landscapeId: landscape.landscapeId, file: landscape.file, goal }
      const definitions = definitionOccurrences.get(key) ?? []
      definitions.push(node)
      definitionOccurrences.set(key, definitions)
      const prior = nodes.get(key)
      if (prior) {
        // Translations may differ in prose, but not in relationship semantics.
        if (relationshipDefinition(prior.goal) !== relationshipDefinition(goal)) {
          diagnostics.push({ code: 'inconsistent_graph_definition', nodeKey: key,
            message: `${key} has inconsistent requires/contains definitions in ${prior.file} and ${landscape.file}` })
        }
        continue
      }
      nodes.set(key, node)
      const occurrences = owners.get(goal.id) ?? []
      occurrences.push(node)
      owners.set(goal.id, occurrences)
    }
  }

  const resolveReference = (reference: string, currentLandscapeId: string): GraphNode<G> | undefined => {
    const colon = reference.indexOf(':')
    if (colon >= 0) {
      const owner = reference.slice(0, colon) || currentLandscapeId
      return nodes.get(graphKey(owner, reference.slice(colon + 1)))
    }
    const local = nodes.get(graphKey(currentLandscapeId, reference))
    if (local) return local
    const candidates = owners.get(reference) ?? []
    if (candidates.length === 1) return candidates[0]
    if (candidates.length > 1 && candidates.every(candidate =>
      relationshipDefinition(candidate.goal) === relationshipDefinition(candidates[0].goal))) {
      return candidates[0]
    }
    return undefined
  }

  const directRequires = new Map<string, string[]>()
  const contains = new Map<string, string[]>()
  const parents = new Map<string, string[]>()
  const directOrigins = new Map<string, PrerequisiteOrigin[]>()
  for (const node of nodes.values()) {
    for (const relation of ['requires', 'contains'] as const) {
      const targets = new Set<string>()
      const origins: PrerequisiteOrigin[] = []
      for (const reference of node.goal[relation] ?? []) {
        const target = resolveReference(reference, node.landscapeId)
        if (!target) {
          const candidates = reference.includes(':') ? [] : owners.get(reference) ?? []
          diagnostics.push({ code: candidates.length > 1 ? 'ambiguous_reference' : 'missing_reference',
            nodeKey: node.key, relation,
            message: `${node.key} (${node.file}) ${relation} ${reference}: ${candidates.length > 1
              ? `ambiguous conflicting owners ${candidates.map(candidate => candidate.key).join(', ')}`
              : 'missing reference'}` })
          continue
        }
        targets.add(target.key)
        if (relation === 'requires') origins.push({ prerequisiteKey: target.key,
          declaredByKey: node.key, reference, inherited: false })
        else {
          const values = parents.get(target.key) ?? []
          if (!values.includes(node.key)) values.push(node.key)
          parents.set(target.key, values)
        }
      }
      ;(relation === 'requires' ? directRequires : contains).set(node.key, [...targets].sort())
      if (relation === 'requires') directOrigins.set(node.key, origins)
    }
  }

  const ancestorMemo = new Map<string, Set<string>>()
  const ancestors = (key: string, visiting = new Set<string>()): Set<string> => {
    const cached = ancestorMemo.get(key)
    if (cached) return cached
    if (visiting.has(key)) return new Set()
    visiting.add(key)
    const result = new Set<string>()
    for (const parent of parents.get(key) ?? []) {
      result.add(parent)
      for (const ancestor of ancestors(parent, visiting)) result.add(ancestor)
    }
    visiting.delete(key)
    ancestorMemo.set(key, result)
    return result
  }
  const effectiveRequires = new Map<string, string[]>()
  const effectiveOrigins = new Map<string, PrerequisiteOrigin[]>()
  const effectiveVisiting = new Set<string>()
  const computeEffective = (key: string): PrerequisiteOrigin[] => {
    const cached = effectiveOrigins.get(key)
    if (cached) return cached
    if (effectiveVisiting.has(key)) return directOrigins.get(key) ?? []
    effectiveVisiting.add(key)
    const origins = [...(directOrigins.get(key) ?? [])]
    for (const parent of parents.get(key) ?? []) {
      for (const origin of computeEffective(parent)) origins.push({ ...origin, inherited: true })
    }
    // Compatibility runtime excludes self at each inheritance step, not only
    // after collecting every ancestor. Direct self-requires is still rejected
    // by the direct graph, and is never legitimized by this exclusion.
    const goalId = nodes.get(key)?.goal.id
    const unique = new Map<string, PrerequisiteOrigin>()
    for (const origin of origins) {
      if (nodes.get(origin.prerequisiteKey)?.goal.id === goalId) continue
      unique.set(JSON.stringify(origin), origin)
    }
    const filtered = [...unique.values()]
    filtered.sort((a, b) => `${a.prerequisiteKey}|${a.declaredByKey}|${a.reference}`
      .localeCompare(`${b.prerequisiteKey}|${b.declaredByKey}|${b.reference}`))
    effectiveOrigins.set(key, filtered)
    effectiveRequires.set(key, [...new Set(filtered.map(origin => origin.prerequisiteKey))].sort())
    effectiveVisiting.delete(key)
    return filtered
  }
  for (const key of nodes.keys()) computeEffective(key)
  return { nodes, owners, directRequires, contains, parents, effectiveRequires,
    effectiveOrigins, diagnostics, resolveReference, ancestors, definitionOccurrences }
}

export function findCrossLandscapeCycles<G extends GraphGoal>(graph: ReturnType<typeof buildCrossLandscapeGraph<G>>) {
  const diagnostics: GraphDiagnostic[] = []
  for (const [relation, edges] of [
    ['requires', graph.directRequires], ['contains', graph.contains],
    ['effective requires', graph.effectiveRequires],
  ] as const) {
    const visited = new Set<string>()
    const visiting = new Set<string>()
    const path: string[] = []
    const visit = (key: string) => {
      if (visiting.has(key)) {
        const cycle = [...path.slice(path.indexOf(key)), key]
        const details = cycle.slice(0, -1).map((from, index) => {
          const to = cycle[index + 1]
          const origins = relation === 'effective requires'
            ? (graph.effectiveOrigins.get(from) ?? []).filter(origin => origin.prerequisiteKey === to)
                .map(origin => `${origin.inherited ? 'inherited from' : 'declared on'} ${origin.declaredByKey}`)
            : []
          return `${from} (${graph.nodes.get(from)?.file}) -> ${to}${origins.length ? ` [${origins.join('; ')}]` : ''}`
        })
        diagnostics.push({ code: 'cycle', relation, nodeKey: key,
          message: `Cycle detected in global ${relation}: ${cycle.join(' -> ')}; ${details.join('; ')}` })
        return
      }
      if (visited.has(key)) return
      visiting.add(key)
      path.push(key)
      for (const target of edges.get(key) ?? []) visit(target)
      path.pop()
      visiting.delete(key)
      visited.add(key)
    }
    for (const key of edges.keys()) visit(key)
  }
  return diagnostics
}
