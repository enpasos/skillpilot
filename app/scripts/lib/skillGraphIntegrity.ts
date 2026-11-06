// SPDX-License-Identifier: Apache-2.0
import { auditTransitiveMinimality, type AuditLandscape } from '../auditTransitiveMinimality'

export interface IntegrityGoal {
  id: unknown
  weight?: unknown
  contains?: unknown
  requires?: unknown
}

export interface IntegrityLandscape {
  landscapeId: string
  sourceFile?: string
  goals: readonly IntegrityGoal[]
}

export const REQUIRED_SKILL_GRAPH_CHECKS = [
  'G01a', 'G01b', 'G02', 'G05', 'G06', 'G07', 'G15', 'G42', 'G16', 'G17',
] as const
export type IntegrityRuleId = typeof REQUIRED_SKILL_GRAPH_CHECKS[number]
export interface IntegrityFinding {
  ruleId: IntegrityRuleId
  code: string
  landscapeId: string
  goalId?: string
  sourceFile?: string
  message: string
  witness?: string[]
  relatedSourceFiles?: string[]
}
export interface IntegrityReport {
  ok: boolean
  rootLandscapeIds: string[]
  checkedGoalKeys: string[]
  checkedRules: IntegrityRuleId[]
  checks: Array<{ id: IntegrityRuleId; status: 'pass' | 'fail' | 'blocked'; findingCount: number }>
  findings: IntegrityFinding[]
  metrics: Record<string, number>
}

/** Old reports, omitted checks and empty/foreign scopes never prove integrity. */
export function hasCompletePassingSkillGraphIntegrity(
  report: unknown,
  expectedRootLandscapeId: string,
): report is IntegrityReport & { ok: true } {
  if (!report || typeof report !== 'object') return false
  const value = report as Partial<IntegrityReport>
  if (value.ok !== true || !Array.isArray(value.findings) || value.findings.length !== 0
    || !Array.isArray(value.rootLandscapeIds) || value.rootLandscapeIds.length !== 1
    || value.rootLandscapeIds[0] !== expectedRootLandscapeId
    || !Array.isArray(value.checkedGoalKeys) || value.checkedGoalKeys.length === 0
    || value.checkedGoalKeys.some((key) => typeof key !== 'string' || !key)
    || new Set(value.checkedGoalKeys).size !== value.checkedGoalKeys.length
    || !value.checkedGoalKeys.some((key) => key.startsWith(`${expectedRootLandscapeId}:`))
    || !Array.isArray(value.checkedRules) || value.checkedRules.length !== REQUIRED_SKILL_GRAPH_CHECKS.length
    || new Set(value.checkedRules).size !== REQUIRED_SKILL_GRAPH_CHECKS.length
    || !REQUIRED_SKILL_GRAPH_CHECKS.every((id) => value.checkedRules!.includes(id))
    || !Array.isArray(value.checks) || value.checks.length !== REQUIRED_SKILL_GRAPH_CHECKS.length) return false
  return REQUIRED_SKILL_GRAPH_CHECKS.every((id) => value.checks!.filter((check) => check?.id === id).length === 1
    && value.checks!.some((check) => check?.id === id && check.status === 'pass' && check.findingCount === 0))
}

type Node = {
  key: string
  landscapeId: string
  goalId: string
  sourceFile?: string
  goal: IntegrityGoal
  contains: string[]
  requires: string[]
}
type Adjacency = Map<string, string[]>
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu
const sorted = (values: Iterable<string>): string[] => [...new Set(values)].sort()

/** Iterative DFS: even an adversarial long cycle cannot overflow the call stack. */
function findCycle(edges: Adjacency): string[] | undefined {
  const done = new Set<string>(), active = new Map<string, number>()
  for (const start of edges.keys()) {
    if (done.has(start)) continue
    const stack = [{ key: start, next: 0 }]
    active.set(start, 0)
    while (stack.length) {
      const frame = stack[stack.length - 1]
      const targets = edges.get(frame.key) ?? []
      if (frame.next === targets.length) {
        active.delete(frame.key); done.add(frame.key); stack.pop()
        continue
      }
      const target = targets[frame.next++]
      const cycleStart = active.get(target)
      if (cycleStart !== undefined) return [...stack.slice(cycleStart).map(({ key }) => key), target]
      if (!done.has(target)) {
        active.set(target, stack.length)
        stack.push({ key: target, next: 0 })
      }
    }
  }
}

function topologicalOrder(edges: Adjacency): string[] {
  const incoming = new Map([...edges.keys()].map((key) => [key, 0]))
  for (const targets of edges.values()) for (const target of targets) {
    incoming.set(target, (incoming.get(target) ?? 0) + 1)
  }
  const ready = [...incoming].filter(([, count]) => count === 0).map(([key]) => key)
  for (let index = 0; index < ready.length; index++) {
    for (const target of edges.get(ready[index]) ?? []) {
      incoming.set(target, incoming.get(target)! - 1)
      if (incoming.get(target) === 0) ready.push(target)
    }
  }
  return ready
}

/**
 * Pure authoring-integrity check. The fixed catalog is the identity universe;
 * roots are whole canonical landscapes, never personal focus/applicability.
 * Their outgoing references and all containment ancestors are checked too.
 * Ancestor-only imports do not import unrelated siblings.
 */
export function checkSkillGraphIntegrity(
  catalog: readonly IntegrityLandscape[],
  rootLandscapeIds: readonly string[],
): IntegrityReport {
  const roots = sorted(rootLandscapeIds)
  const findings: IntegrityFinding[] = []
  const blocked = new Set<IntegrityRuleId>()
  const definitions = new Map<string, Node[]>()
  const byId = new Map<string, Set<string>>()
  const byUuidValue = new Map<string, Set<string>>()
  const nodes = new Map<string, Node>()
  const deferred = new Map<string, IntegrityFinding[]>()
  const ownerIssues = new Map<string, IntegrityFinding[]>()
  const landscapeIds = new Set<string>()
  const add = (ruleId: IntegrityRuleId, code: string, node: Node | undefined, message: string,
    extra: Partial<IntegrityFinding> = {}): IntegrityFinding => ({
    ruleId, code, landscapeId: node?.landscapeId ?? roots[0] ?? '',
    ...(node ? { goalId: node.goalId, sourceFile: node.sourceFile } : {}), message, ...extra,
  })
  const defer = (key: string, finding: IntegrityFinding) => {
    const bucket = deferred.get(key) ?? []
    bucket.push(finding)
    deferred.set(key, bucket)
  }
  for (const landscape of catalog) {
    landscapeIds.add(landscape.landscapeId)
    if (typeof landscape.landscapeId !== 'string' || !landscape.landscapeId
      || landscape.landscapeId.trim() !== landscape.landscapeId || landscape.landscapeId.includes(':')) {
      ownerIssues.set(landscape.landscapeId, [add('G05', 'INVALID_LANDSCAPE_ID', undefined,
        'Catalog landscape identity must be a nonempty exact unqualified owner string.',
        { landscapeId: landscape.landscapeId, sourceFile: landscape.sourceFile })])
    }
    if (!Array.isArray(landscape.goals)) {
      ownerIssues.set(landscape.landscapeId, [add('G05', 'INVALID_GOAL_COLLECTION', undefined,
        'Canonical landscape goals must be an array.', { landscapeId: landscape.landscapeId, sourceFile: landscape.sourceFile })])
      continue
    }
    for (const goal of landscape.goals) {
      if (!goal || typeof goal !== 'object' || typeof goal.id !== 'string') {
        ownerIssues.set(landscape.landscapeId, [...(ownerIssues.get(landscape.landscapeId) ?? []),
          add('G01a', 'INVALID_GOAL_ID', undefined, 'Goal id must be a UUID string.',
            { landscapeId: landscape.landscapeId, sourceFile: landscape.sourceFile })])
        continue
      }
      const key = `${landscape.landscapeId}:${goal.id}`
      const node: Node = { key, goalId: goal.id, landscapeId: landscape.landscapeId,
        sourceFile: landscape.sourceFile, goal, contains: [], requires: [] }
      const candidates = definitions.get(key) ?? []
      candidates.push(node)
      definitions.set(key, candidates)
      byId.set(goal.id, new Set([...(byId.get(goal.id) ?? []), key]))
      if (UUID.test(goal.id)) {
        const value = goal.id.toLowerCase()
        byUuidValue.set(value, new Set([...(byUuidValue.get(value) ?? []), key]))
      }
    }
  }
  // A duplicated logical definition has no arbitrarily selected topology.
  for (const [key, candidates] of definitions) {
    if (candidates.length === 1) nodes.set(key, candidates[0])
    else defer(key, add('G01b', 'DUPLICATE_LOGICAL_GOAL', candidates[0],
      `Logical goal ${key} has ${candidates.length} definitions; no topology was selected.`,
      { relatedSourceFiles: sorted(candidates.flatMap((node) => node.sourceFile ? [node.sourceFile] : [])) }))
  }

  const resolveReference = (raw: unknown, source: Node, relation: 'contains' | 'requires'): string | undefined => {
    if (typeof raw !== 'string' || !raw || raw.trim() !== raw) {
      defer(source.key, add('G05', 'INVALID_REFERENCE', source, `${relation} must contain nonempty exact ID strings.`))
      return
    }
    const parts = raw.split(':')
    if (parts.length > 2 || (parts.length === 2 && (!parts[0] || !parts[1]))) {
      defer(source.key, add('G05', 'INVALID_QUALIFIED_REFERENCE', source, `Invalid qualified ${relation} reference ${raw}.`))
      return
    }
    const goalId = parts.length === 2 ? parts[1] : raw
    if (!UUID.test(goalId)) defer(source.key, add('G01a', 'INVALID_REFERENCE_UUID', source,
      `${relation} reference ${raw} does not have a UUID goal endpoint.`))
    let key: string
    if (parts.length === 2) key = `${parts[0]}:${goalId}`
    else if (definitions.has(`${source.landscapeId}:${goalId}`)) key = `${source.landscapeId}:${goalId}`
    else {
      const candidates = [...(byId.get(goalId) ?? [])]
      if (candidates.length !== 1) {
        defer(source.key, add('G05', candidates.length ? 'AMBIGUOUS_REFERENCE' : 'MISSING_REFERENCE', source,
          `${relation} reference ${raw} has ${candidates.length} global logical owners.`, { witness: sorted(candidates) }))
        return
      }
      key = candidates[0]
    }
    if (!definitions.has(key)) {
      defer(source.key, add('G05', 'MISSING_REFERENCE', source, `${relation} reference ${raw} does not resolve exactly.`))
      return
    }
    if (!nodes.has(key)) {
      defer(source.key, add('G05', 'DUPLICATE_REFERENCE_TARGET', source, `${relation} reference ${raw} has duplicated definitions.`))
    }
    return key
  }
  for (const node of nodes.values()) {
    if (!UUID.test(node.goalId)) defer(node.key, add('G01a', 'INVALID_GOAL_UUID', node,
      `Goal id ${node.goalId} does not belong to the UUID domain.`))
    if (typeof node.goal.weight !== 'number' || !Number.isFinite(node.goal.weight) || node.goal.weight <= 0) {
      defer(node.key, add('G02', 'INVALID_WEIGHT', node, 'Goal weight must be a finite strictly positive number.'))
    }
    for (const relation of ['contains', 'requires'] as const) {
      const raw = node.goal[relation] === undefined ? [] : node.goal[relation]
      if (!Array.isArray(raw)) {
        defer(node.key, add('G05', 'INVALID_RELATION_COLLECTION', node, `${relation} must be an array.`))
        continue
      }
      node[relation] = sorted(raw.flatMap((ref) => {
        const resolved = resolveReference(ref, node, relation)
        return resolved ? [resolved] : []
      }))
    }
  }
  const parents = new Map([...definitions.keys()].map((key) => [key, [] as string[]]))
  for (const node of nodes.values()) for (const child of node.contains) parents.get(child)!.push(node.key)
  const selected = new Set<string>(), expandedChildren = new Set<string>()
  const pending = [...definitions.keys()].filter((key) => roots.some((id) => key.startsWith(`${id}:`)))
    .map((key) => ({ key, includeChildren: true }))
  for (const root of roots) {
    if (!landscapeIds.has(root)) findings.push(add('G05', 'UNKNOWN_ROOT_LANDSCAPE', undefined,
      `Unknown canonical root landscape ${root}.`, { landscapeId: root }))
    else if (!pending.some(({ key }) => key.startsWith(`${root}:`))) findings.push(add('G05', 'EMPTY_ROOT_LANDSCAPE', undefined,
      `Root landscape ${root} has no identifiable goals.`, { landscapeId: root }))
  }
  while (pending.length) {
    const { key, includeChildren } = pending.pop()!
    const node = nodes.get(key)
    if (!selected.has(key)) {
      selected.add(key)
      if (node) for (const target of node.requires) pending.push({ key: target, includeChildren: true })
      for (const parent of parents.get(key) ?? []) pending.push({ key: parent, includeChildren: false })
    }
    if (node && includeChildren && !expandedChildren.has(key)) {
      expandedChildren.add(key)
      for (const child of node.contains) pending.push({ key: child, includeChildren: true })
    }
  }
  const selectedOwners = new Set([...roots, ...[...selected].flatMap((key) => definitions.get(key)?.map((n) => n.landscapeId) ?? [])])
  // An unidentifiable unrelated sibling in a foreign catalog landscape is not
  // imported merely because that landscape owns a required node/ancestor.
  for (const owner of roots) for (const finding of ownerIssues.get(owner) ?? []) findings.push(finding)
  for (const key of sorted(selected)) {
    for (const finding of deferred.get(key) ?? []) findings.push(finding)
    const node = nodes.get(key)
    if (node && (byId.get(node.goalId)?.size ?? 0) > 1) findings.push(add('G01b', 'DUPLICATE_GLOBAL_GOAL_ID', node,
      `Goal id ${node.goalId} has multiple canonical landscape owners.`, { witness: sorted(byId.get(node.goalId)!) }))
    if (node && UUID.test(node.goalId)) {
      const aliases = byUuidValue.get(node.goalId.toLowerCase())!
      if (new Set([...aliases].map((key) => definitions.get(key)![0].goalId)).size > 1) {
        findings.push(add('G01b', 'DUPLICATE_UUID_VALUE', node,
          `UUID value ${node.goalId.toLowerCase()} has multiple hexadecimal case representations.`,
          { witness: sorted(aliases) }))
      }
    }
  }
  if (!roots.length || !selected.size) findings.push(add('G05', 'EMPTY_CHECKED_SCOPE', undefined,
    'Integrity requires a nonempty declared root scope and actual checked goals.'))

  const ordered = sorted(selected).flatMap((key) => nodes.has(key) ? [nodes.get(key)!] : [])
  const contains: Adjacency = new Map(ordered.map((node) => [node.key, node.contains.filter((key) => selected.has(key))]))
  const requires: Adjacency = new Map(ordered.map((node) => [node.key, node.requires.filter((key) => selected.has(key))]))
  const structuralInputInvalid = findings.some((f) => f.ruleId === 'G05'
    || (f.ruleId === 'G01b' && f.code === 'DUPLICATE_LOGICAL_GOAL') || f.code === 'INVALID_GOAL_ID')
  const reportCycle = (ruleId: IntegrityRuleId, code: string, edges: Adjacency): boolean => {
    const witness = findCycle(edges)
    if (witness) findings.push(add(ruleId, code, nodes.get(witness[0]), `${code}: ${witness.join(' -> ')}`, { witness }))
    return !!witness
  }
  let effective: Adjacency = new Map(), atomic: Adjacency = new Map()
  if (structuralInputInvalid) {
    for (const id of ['G06', 'G07', 'G15', 'G42', 'G16', 'G17'] as const) blocked.add(id)
  } else {
    const containsCycle = reportCycle('G06', 'CONTAINS_CYCLE', contains)
    const requiresCycle = reportCycle('G07', 'REQUIRES_CYCLE', requires)
    if (containsCycle) {
      for (const id of ['G15', 'G42', 'G16', 'G17'] as const) blocked.add(id)
    } else {
      const topology = topologicalOrder(contains)
      const effectiveSets = new Map(ordered.map((node) => [node.key, new Set(node.requires)]))
      const effectiveOrigins = new Map(ordered.map((node) => [node.key,
        new Map(node.requires.map((target) => [target, node.key]))]))
      const inheritedOrigins = new Map(ordered.map((node) => [node.key, new Map<string, string>()]))
      for (const parent of topology) for (const child of contains.get(parent) ?? []) {
        for (const req of effectiveSets.get(parent)!) {
          const origin = effectiveOrigins.get(parent)!.get(req)!
          if (!inheritedOrigins.get(child)!.has(req)) inheritedOrigins.get(child)!.set(req, origin)
          if (!effectiveSets.get(child)!.has(req)) effectiveOrigins.get(child)!.set(req, origin)
          effectiveSets.get(child)!.add(req)
        }
      }
      effective = new Map([...effectiveSets].map(([key, targets]) => [key, sorted(targets)]))
      const effectiveCycle = reportCycle('G15', 'EFFECTIVE_REQUIRES_CYCLE', effective)
      for (const node of ordered) for (const target of node.requires) {
        const inheritedFrom = inheritedOrigins.get(node.key)!.get(target)
        if (inheritedFrom) findings.push(add('G16', 'INHERITED_DUPLICATE_REQUIREMENT', node,
          `Direct requirement ${target} is already authored on containment ancestor ${inheritedFrom}.`,
          { witness: [node.key, inheritedFrom, target] }))
      }
      const atoms = new Map<string, Set<string>>()
      for (const key of [...topology].reverse()) {
        const node = nodes.get(key)!
        atoms.set(key, node.contains.length === 0 ? new Set([key])
          : new Set((contains.get(key) ?? []).flatMap((child) => [...atoms.get(child)!])))
      }
      atomic = new Map(ordered.filter((node) => node.contains.length === 0).map((node) => [node.key,
        sorted((effective.get(node.key) ?? []).flatMap((target) => [...atoms.get(target)!]))]))
      reportCycle('G42', 'ATOMIC_REQUIRES_CYCLE', atomic)
      if (requiresCycle || effectiveCycle) blocked.add('G17')
      else {
        // The existing §7.3 algorithm removes an origin everywhere it was
        // inherited. Its goal-node relation must NOT be replaced by R_atomic.
        const auditCatalog = new Map<string, AuditLandscape>()
        for (const node of ordered) {
          const landscape = auditCatalog.get(node.landscapeId) ?? { landscapeId: node.landscapeId, goals: [] }
          landscape.goals.push({ id: node.goalId, contains: contains.get(node.key), requires: requires.get(node.key) })
          auditCatalog.set(node.landscapeId, landscape)
        }
        try {
          const result = auditTransitiveMinimality([...auditCatalog.values()], roots)
          for (const finding of result.findings) findings.push(add('G17', 'TRANSITIVE_REDUNDANT_REQUIREMENT', nodes.get(finding.source),
            `Requirement ${finding.prerequisite} remains reachable after removing its authored origin.`,
            { witness: finding.witness }))
        } catch (error) {
          findings.push(add('G17', 'MINIMALITY_CHECK_EXECUTION_FAILED', undefined,
            `Minimality could not be evaluated: ${error instanceof Error ? error.message : String(error)}`))
        }
      }
    }
  }
  findings.sort((a, b) => JSON.stringify([a.landscapeId, a.goalId, a.ruleId, a.code, a.message])
    .localeCompare(JSON.stringify([b.landscapeId, b.goalId, b.ruleId, b.code, b.message]), 'en'))
  const checks = REQUIRED_SKILL_GRAPH_CHECKS.map((id) => {
    const findingCount = findings.filter((finding) => finding.ruleId === id).length
    return { id, findingCount, status: findingCount ? 'fail' as const : blocked.has(id) ? 'blocked' as const : 'pass' as const }
  })
  return {
    ok: selected.size > 0 && findings.length === 0 && checks.every((check) => check.status === 'pass'),
    rootLandscapeIds: roots, checkedGoalKeys: sorted(selected),
    checkedRules: checks.filter((check) => check.status !== 'blocked').map(({ id }) => id), checks, findings,
    metrics: {
      catalogLandscapes: landscapeIds.size, catalogGoals: [...definitions.values()].reduce((n, defs) => n + defs.length, 0),
      checkedGoals: selected.size, checkedLandscapes: selectedOwners.size,
      containsEdges: [...contains.values()].reduce((n, edges) => n + edges.length, 0),
      authoredRequires: [...requires.values()].reduce((n, edges) => n + edges.length, 0),
      effectiveRequires: [...effective.values()].reduce((n, edges) => n + edges.length, 0),
      atomicGoals: atomic.size, atomicRequires: [...atomic.values()].reduce((n, edges) => n + edges.length, 0),
      localRedundancies: findings.filter((finding) => finding.ruleId === 'G16').length,
      transitiveRedundancies: findings.filter((finding) => finding.ruleId === 'G17').length,
      findings: findings.length,
    },
  }
}
