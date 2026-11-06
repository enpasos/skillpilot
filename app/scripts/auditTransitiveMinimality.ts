// SPDX-License-Identifier: Apache-2.0
// Read-only graph-definition §7.3 audit. No mastery, atomic target expansion or repair.
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export type AuditGoal = { id: string; title?: string; contains?: string[]; requires?: string[] }
export type AuditLandscape = { landscapeId: string; goals: AuditGoal[] }
type Node = { key: string; landscapeId: string; goal: AuditGoal; contains: string[]; requires: string[] }
type Origin = { source: string; prerequisite: string }
export type MinimalityFinding = Origin & { witness: string[]; supportingOrigins: Origin[] }
const sorted = (items: Iterable<string>) => [...new Set(items)].sort()
function ensure(ok: unknown, message: string): asserts ok { if (!ok) throw new Error(message) }

function cycle(adjacency: Map<string, string[]>): string[] | undefined {
  const done = new Set<string>(), active = new Set<string>(), path: string[] = []
  const visit = (node: string): string[] | undefined => {
    if (active.has(node)) return [...path.slice(path.indexOf(node)), node]
    if (done.has(node)) return
    active.add(node); path.push(node)
    for (const child of adjacency.get(node) ?? []) {
      const found = visit(child)
      if (found) return found
    }
    path.pop(); active.delete(node); done.add(node)
  }
  for (const node of adjacency.keys()) { const found = visit(node); if (found) return found }
}

export function auditTransitiveMinimality(catalog: AuditLandscape[], rootLandscapeIds: string[]) {
  ensure(rootLandscapeIds.length > 0, 'Empty root scope')
  const nodes = new Map<string, Node>(), byId = new Map<string, Set<string>>()
  for (const landscape of catalog) for (const goal of landscape.goals) {
    const key = `${landscape.landscapeId}:${goal.id}`
    ensure(!nodes.has(key), `Duplicate qualified goal: ${key}`)
    nodes.set(key, { key, landscapeId: landscape.landscapeId, goal, contains: [], requires: [] })
    byId.set(goal.id, new Set([...(byId.get(goal.id) ?? []), key]))
  }
  const resolveRef = (raw: string, source: Node): string => {
    ensure(typeof raw === 'string' && raw.length > 0, `Invalid reference at ${source.key}`)
    let key: string
    if (raw.includes(':')) {
      const parts = raw.split(':')
      ensure(parts.length === 2 && parts[1], `Invalid qualified reference: ${raw}`)
      key = `${parts[0] || source.landscapeId}:${parts[1]}`
    } else if (nodes.has(`${source.landscapeId}:${raw}`)) key = `${source.landscapeId}:${raw}`
    else {
      const matches = [...(byId.get(raw) ?? [])]
      ensure(matches.length === 1, `${matches.length ? 'Ambiguous' : 'Unknown'} reference ${raw} at ${source.key}`)
      key = matches[0]
    }
    ensure(nodes.has(key), `Unknown reference ${raw} at ${source.key}`)
    return key
  }
  // Index every containment parent before selecting a scope: a foreign target
  // can inherit requirements from a parent not named in its outgoing refs.
  const allParents = new Map([...nodes.keys()].map((key) => [key, [] as string[]]))
  for (const node of nodes.values()) {
    ensure(node.goal.contains === undefined || Array.isArray(node.goal.contains), `Invalid contains at ${node.key}`)
    node.contains = sorted((node.goal.contains ?? []).map((ref) => resolveRef(ref, node)))
    for (const child of node.contains) allParents.get(child)!.push(node.key)
  }
  // Outgoing reference closure plus every ancestor and its requirements. An
  // ancestor imported only for inheritance does not import unrelated siblings.
  for (const id of rootLandscapeIds) ensure(catalog.some((l) => l.landscapeId === id), `Unknown root landscape: ${id}`)
  const pending = [...nodes.values()].filter((n) => rootLandscapeIds.includes(n.landscapeId))
    .map((n) => ({ key: n.key, includeChildren: true }))
  const selected = new Map<string, Node>(), childrenExpanded = new Set<string>()
  while (pending.length) {
    const { key, includeChildren } = pending.pop()!, node = nodes.get(key)!
    if (!selected.has(key)) {
      selected.set(key, node)
      ensure(node.goal.requires === undefined || Array.isArray(node.goal.requires), `Invalid requires at ${key}`)
      node.requires = sorted((node.goal.requires ?? []).map((ref) => resolveRef(ref, node)))
      pending.push(...node.requires.map((target) => ({ key: target, includeChildren: true })),
        ...allParents.get(key)!.map((parent) => ({ key: parent, includeChildren: false })))
    }
    if (includeChildren && !childrenExpanded.has(key)) {
      childrenExpanded.add(key)
      pending.push(...node.contains.map((child) => ({ key: child, includeChildren: true })))
    }
  }
  const ordered = [...selected.values()].sort((a, b) => a.key.localeCompare(b.key))
  ensure(ordered.length > 0, 'Empty audit scope')
  const contains = new Map(ordered.map((n) => [n.key, n.contains.filter((child) => selected.has(child))]))
  const containsCycle = cycle(contains)
  ensure(!containsCycle, `contains cycle: ${containsCycle?.join(' -> ')}`)
  const parents = new Map(ordered.map((n) => [n.key, [] as string[]]))
  for (const [parent, children] of contains) for (const child of children) parents.get(child)!.push(parent)
  const ancestors = new Map<string, string[]>()
  const sources = (key: string): string[] => {
    if (!ancestors.has(key)) ancestors.set(key, sorted([key, ...parents.get(key)!.flatMap(sources)]))
    return ancestors.get(key)!
  }
  const origins = ordered.flatMap((n) => n.requires.map((p) => ({ source: n.key, prerequisite: p })))
  // Fixed C fixes sources(g). Omitting the authored pair in every contribution
  // exactly recomputes effective(C, R\{edge}), including all inherited copies.
  // Other authored origins of the same effective requirement survive.
  const effective = (key: string, omitted?: Origin): Map<string, Origin> => {
    const result = new Map<string, Origin>()
    for (const source of sources(key)) for (const prerequisite of selected.get(source)!.requires) {
      if (omitted?.source === source && omitted.prerequisite === prerequisite) continue
      if (!result.has(prerequisite)) result.set(prerequisite, { source, prerequisite })
    }
    return result
  }
  const fullEffective = new Map(ordered.map((n) => [n.key, [...effective(n.key).keys()]]))
  const effectiveCycle = cycle(fullEffective)
  ensure(!effectiveCycle, `effective requires cycle: ${effectiveCycle?.join(' -> ')}`)
  const findings: MinimalityFinding[] = []
  for (const removed of origins) {
    const queue = [removed.source], previous = new Map<string, { node: string; origin: Origin }>()
    const visited = new Set(queue)
    for (let index = 0; index < queue.length && !visited.has(removed.prerequisite); index++) {
      const node = queue[index]
      for (const [target, origin] of effective(node, removed)) {
        if (visited.has(target)) continue
        visited.add(target); previous.set(target, { node, origin }); queue.push(target)
      }
    }
    if (!visited.has(removed.prerequisite)) continue
    const witness = [removed.prerequisite], supportingOrigins: Origin[] = []
    while (witness[0] !== removed.source) {
      const step = previous.get(witness[0])!
      witness.unshift(step.node); supportingOrigins.unshift(step.origin)
    }
    findings.push({ ...removed, witness, supportingOrigins })
  }
  return {
    nodeCount: selected.size, authoredRequiresCount: origins.length,
    containsCount: [...contains.values()].reduce((n, children) => n + children.length, 0),
    effectiveRequiresCount: [...fullEffective.values()].reduce((n, edges) => n + edges.length, 0),
    inheritanceOnlyAncestors: sorted([...selected.keys()].filter((key) => !childrenExpanded.has(key))),
    crossLandscapeReferenceCount: ordered.reduce((n, node) => n + [...contains.get(node.key)!, ...node.requires]
      .filter((key) => selected.get(key)!.landscapeId !== node.landscapeId).length, 0),
    landscapes: sorted(ordered.map((n) => n.landscapeId)), findings,
    findingsByLandscape: Object.fromEntries(sorted(ordered.map((n) => n.landscapeId)).map((id) =>
      [id, findings.filter((f) => selected.get(f.source)!.landscapeId === id).length])),
  }
}

function main() {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
  const args = process.argv.slice(2), value = (flag: string) => args.includes(flag) ? args[args.indexOf(flag) + 1] : undefined
  ensure(args.every((a, i) => ['--report-only', '--check', '--output'].includes(a) || args[i - 1] === '--output'), 'Unknown argument')
  ensure(!(args.includes('--report-only') && args.includes('--check')), 'Choose --check or --report-only')
  ensure(!args.includes('--output') || value('--output'), '--output requires a path')
  const directory = resolve(root, 'curricula/DE/Gymnasium/canonical')
  const files = readdirSync(directory).filter((name) => name.endsWith('.de.json')).sort()
  const loaded = files.map((name) => {
    const path = resolve(directory, name), raw = readFileSync(path)
    return { path: relative(root, path), sha256: createHash('sha256').update(raw).digest('hex'),
      landscape: JSON.parse(raw.toString()) as AuditLandscape }
  })
  const roots = ['MATHEMATIK', 'PHYSIK'].map((subject) => loaded.find((l) => l.path.endsWith(`_${subject}.de.json`))!.landscape.landscapeId)
  let report: Record<string, unknown>, count: number
  try {
    const result = auditTransitiveMinimality(loaded.map((l) => l.landscape), roots)
    count = result.findings.length
    const { findings, ...summary } = result
    const goalKeys = sorted(findings.flatMap((f) => [...f.witness, ...f.supportingOrigins.map((o) => o.source)]))
    const indices = new Map(goalKeys.map((key, index) => [key, index]))
    report = { schemaVersion: 1, mode: args.includes('--report-only') ? 'report-only' : 'validation',
      status: count ? 'findings' : 'satisfied', rule: 'graph-definition.md §7.3',
      semantics: 'Remove each authored pair and recompute contains-inherited effective requirements on goal nodes; no atomic target expansion or mastery cuts.',
      scopeSemantics: 'All Mathematics/Physics nodes, outgoing references, every contains ancestor and its requirements. Ancestors imported only for inheritance do not expand unrelated siblings.',
      roots, sources: loaded.filter((l) => result.landscapes.includes(l.landscape.landscapeId))
        .map(({ path, sha256 }) => ({ path, sha256 })),
      referenceCatalogSources: loaded.map(({ path, sha256 }) => ({ path, sha256 })),
      auditorSha256: createHash('sha256').update(readFileSync(fileURLToPath(import.meta.url))).digest('hex'), ...summary,
      findingEncoding: ['sourceIndex', 'prerequisiteIndex', 'witnessGoalIndices', 'supportingOriginSourceIndices'],
      goalKeys, findings: findings.map((f) => [indices.get(f.source), indices.get(f.prerequisite),
        f.witness.map((key) => indices.get(key)), f.supportingOrigins.map((o) => indices.get(o.source))]) }
  } catch (error) {
    count = 1
    report = { schemaVersion: 1, mode: args.includes('--report-only') ? 'report-only' : 'validation',
      status: 'invalid-input', roots, error: String(error) }
  }
  if (value('--output')) writeFileSync(resolve(root, value('--output')!), JSON.stringify(report, null, 2) + '\n')
  console.log(`${report.mode}: ${report.status}; ${report.nodeCount ?? '?'} goals; ${report.authoredRequiresCount ?? '?'} authored edges; ${report.status === 'invalid-input' ? report.error : `${count} minimality findings`}`)
  if (!args.includes('--report-only') && count) process.exitCode = 1
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main()
