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
// Unicode code-point order is independent of the process/host locale.
const compareKeys = (left: string, right: string): number => {
  const a = Array.from(left), b = Array.from(right)
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    const delta = a[i].codePointAt(0)! - b[i].codePointAt(0)!
    if (delta) return delta
  }
  return a.length - b.length
}
const sorted = (items: Iterable<string>) => [...new Set(items)].sort(compareKeys)
function ensure(ok: unknown, message: string): asserts ok { if (!ok) throw new Error(message) }
const identifier = (value: unknown): value is string => typeof value === 'string' && value.length > 0 && !/[:\s]/u.test(value)
function validateCatalog(catalog: AuditLandscape[]) {
  ensure(Array.isArray(catalog) && catalog.length > 0, 'Empty or invalid catalog')
  const owners = new Set<string>()
  for (const landscape of catalog) {
    ensure(landscape && identifier(landscape.landscapeId), 'Invalid landscape ID')
    ensure(!owners.has(landscape.landscapeId), `Duplicate landscape ID: ${landscape.landscapeId}`)
    owners.add(landscape.landscapeId)
    ensure(Array.isArray(landscape.goals), `Invalid goals at ${landscape.landscapeId}`)
    const ids = new Set<string>()
    for (const goal of landscape.goals) {
      ensure(goal && identifier(goal.id), `Invalid goal ID at ${landscape.landscapeId}`)
      const key = `${landscape.landscapeId}:${goal.id}`
      ensure(!ids.has(goal.id), `Duplicate qualified goal: ${key}`)
      ids.add(goal.id)
      for (const field of ['contains', 'requires'] as const) {
        ensure(goal[field] === undefined || Array.isArray(goal[field]), `Invalid ${field} at ${key}`)
        for (const ref of goal[field] ?? []) {
          ensure(typeof ref === 'string' && ref.length > 0 && !/\s/u.test(ref), `Invalid reference at ${key}`)
          const parts = ref.split(':')
          ensure(parts.length <= 2 && identifier(parts.at(-1)), `Invalid qualified reference: ${ref}`)
        }
      }
    }
  }
}

function cycle(adjacency: Map<string, string[]>): string[] | undefined {
  const done = new Set<string>(), active = new Map<string, number>()
  for (const start of adjacency.keys()) {
    if (done.has(start)) continue
    const stack = [{ node: start, next: 0 }]
    active.set(start, 0)
    while (stack.length) {
      const frame = stack[stack.length - 1], children = adjacency.get(frame.node) ?? []
      if (frame.next === children.length) {
        active.delete(frame.node); done.add(frame.node); stack.pop(); continue
      }
      const child = children[frame.next++], at = active.get(child)
      if (at !== undefined) return [...stack.slice(at).map(({ node }) => node), child]
      if (!done.has(child)) { active.set(child, stack.length); stack.push({ node: child, next: 0 }) }
    }
  }
}

export function auditTransitiveMinimality(catalog: AuditLandscape[], rootLandscapeIds: string[]) {
  validateCatalog(catalog)
  ensure(Array.isArray(rootLandscapeIds) && rootLandscapeIds.length > 0, 'Empty root scope')
  for (const id of rootLandscapeIds) {
    ensure(identifier(id), 'Invalid root landscape ID')
    const root = catalog.find((landscape) => landscape.landscapeId === id)
    ensure(root, `Unknown root landscape: ${id}`)
    ensure(root.goals.length > 0, `Empty audit scope for root landscape: ${id}`)
  }
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
  const pending = [...nodes.values()].filter((n) => rootLandscapeIds.includes(n.landscapeId))
    .map((n) => ({ key: n.key, includeChildren: true }))
  const selected = new Map<string, Node>(), childrenExpanded = new Set<string>()
  while (pending.length) {
    const { key, includeChildren } = pending.pop()!, node = nodes.get(key)!
    if (!selected.has(key)) {
      selected.set(key, node)
      ensure(node.goal.requires === undefined || Array.isArray(node.goal.requires), `Invalid requires at ${key}`)
      node.requires = sorted((node.goal.requires ?? []).map((ref) => resolveRef(ref, node)))
      for (const target of node.requires) pending.push({ key: target, includeChildren: true })
      for (const parent of allParents.get(key)!) pending.push({ key: parent, includeChildren: false })
    }
    if (includeChildren && !childrenExpanded.has(key)) {
      childrenExpanded.add(key)
      for (const child of node.contains) pending.push({ key: child, includeChildren: true })
    }
  }
  const ordered = [...selected.values()].sort((a, b) => compareKeys(a.key, b.key))
  ensure(ordered.length > 0, 'Empty audit scope')
  const contains = new Map(ordered.map((n) => [n.key, n.contains.filter((child) => selected.has(child))]))
  const containsCycle = cycle(contains)
  ensure(!containsCycle, `contains cycle: ${containsCycle?.join(' -> ')}`)
  const parents = new Map(ordered.map((n) => [n.key, [] as string[]]))
  for (const [parent, children] of contains) for (const child of children) parents.get(child)!.push(parent)
  // Only ancestors with an authored requirement contribute an origin. Propagate
  // those origins iteratively: a deep containment chain must not recurse or
  // materialize quadratic sets of irrelevant requirement-free ancestors.
  const incoming = new Map(ordered.map((n) => [n.key, parents.get(n.key)!.length]))
  const ready = ordered.filter((n) => incoming.get(n.key) === 0).map((n) => n.key)
  const sourceSets = new Map(ordered.map((n) => [n.key, new Set(n.requires.length ? [n.key] : [])]))
  for (let index = 0; index < ready.length; index++) {
    const parent = ready[index]
    for (const child of contains.get(parent)!) {
      for (const origin of sourceSets.get(parent)!) sourceSets.get(child)!.add(origin)
      incoming.set(child, incoming.get(child)! - 1)
      if (incoming.get(child) === 0) ready.push(child)
    }
  }
  const sources = (key: string): string[] => sorted(sourceSets.get(key)!)
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

// Match generateCurriculumQualityStatus's canonical catalog discovery: recurse,
// accept every JSON extension (not just .de.json), and exclude deck files.
function catalogFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) return catalogFiles(path)
    return entry.isFile() && /\.json$/i.test(entry.name) && !/_deck/i.test(entry.name) ? [path] : []
  }).sort(compareKeys)
}

type Options = { reportOnly: boolean; catalog: string; roots: string[]; output?: string }
function parseArgs(args: string[], options: Options) {
  const seen = new Set<string>()
  for (let i = 0; i < args.length; i++) {
    const flag = args[i]
    ensure(['--report-only', '--check', '--catalog', '--root', '--output'].includes(flag), `Unknown argument: ${flag}`)
    ensure(flag === '--root' || !seen.has(flag), `Repeated argument: ${flag}`)
    seen.add(flag)
    if (flag === '--report-only') options.reportOnly = true
    else if (flag !== '--check') {
      const value = args[++i]
      ensure(value && !value.startsWith('--'), `${flag} requires a value`)
      if (flag === '--catalog') options.catalog = value
      else if (flag === '--output') options.output = value
      else options.roots.push(value)
    }
  }
  ensure(!(seen.has('--report-only') && seen.has('--check')), 'Choose --check or --report-only')
}

function rootReport(catalog: AuditLandscape[], rootLandscapeId: string) {
  try {
    const { findings, ...summary } = auditTransitiveMinimality(catalog, [rootLandscapeId])
    const goalKeys = sorted(findings.flatMap((f) => [...f.witness, ...f.supportingOrigins.map((o) => o.source)]))
    const indices = new Map(goalKeys.map((key, index) => [key, index]))
    return {
      rootLandscapeId, status: findings.length ? 'fail' as const : 'pass' as const, ...summary,
      findingEncoding: ['sourceIndex', 'prerequisiteIndex', 'witnessGoalIndices', 'supportingOriginSourceIndices'],
      goalKeys, findings: findings.map((f) => [indices.get(f.source), indices.get(f.prerequisite),
        f.witness.map((key) => indices.get(key)), f.supportingOrigins.map((o) => indices.get(o.source))]),
    }
  } catch (error) {
    return { rootLandscapeId, status: 'invalid-input' as const, error: String(error) }
  }
}

type CliReport = { schemaVersion: 2; mode: 'report-only' | 'validation' } & (
  | { status: 'invalid-input'; error: string }
  | {
    status: 'pass' | 'fail' | 'invalid-input'; rule: string; semantics: string; scopeSemantics: string
    selection: 'explicit-roots' | 'complete-catalog'; roots: string[]
    referenceCatalogSources: { path: string; sha256: string; landscapeId: string }[]
    auditorSha256: string; rootResults: ReturnType<typeof rootReport>[]
  }
)

function main() {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
  const options: Options = { reportOnly: false, catalog: 'curricula/DE/Gymnasium/canonical', roots: [] }
  let report: CliReport, exitCode: number
  try {
    parseArgs(process.argv.slice(2), options)
    const loaded = catalogFiles(resolve(root, options.catalog)).map((path) => {
      const raw = readFileSync(path)
      return { path: relative(root, path), sha256: createHash('sha256').update(raw).digest('hex'),
        landscape: JSON.parse(raw.toString()) as AuditLandscape }
    })
    const catalog = loaded.map((entry) => entry.landscape)
    validateCatalog(catalog)
    const roots = sorted(options.roots.length ? options.roots : catalog.map((landscape) => landscape.landscapeId))
    const rootResults = roots.map((id) => rootReport(catalog, id))
    const status = rootResults.some((result) => result.status === 'invalid-input') ? 'invalid-input'
      : rootResults.some((result) => result.status === 'fail') ? 'fail' : 'pass'
    report = {
      schemaVersion: 2, mode: options.reportOnly ? 'report-only' : 'validation', status,
      rule: 'graph-definition.md §7.3',
      semantics: 'Remove each authored pair and recompute contains-inherited effective requirements on goal nodes; no atomic target expansion or mastery cuts.',
      scopeSemantics: 'Each selected root landscape, outgoing references, every contains ancestor and its requirements. Ancestors imported only for inheritance do not expand unrelated siblings.',
      selection: options.roots.length ? 'explicit-roots' : 'complete-catalog', roots,
      referenceCatalogSources: loaded.map(({ path, sha256, landscape }) => ({ path, sha256, landscapeId: landscape.landscapeId })),
      auditorSha256: createHash('sha256').update(readFileSync(fileURLToPath(import.meta.url))).digest('hex'),
      rootResults,
    }
    for (const result of rootResults) console.log(`${report.mode}: ${result.rootLandscapeId}: ${result.status}; ${result.status === 'invalid-input'
      ? result.error : `${result.nodeCount} goals; ${result.authoredRequiresCount} authored edges; ${result.findings.length} minimality findings`}`)
    exitCode = status === 'invalid-input' ? 2 : status === 'fail' && !options.reportOnly ? 1 : 0
  } catch (error) {
    report = { schemaVersion: 2, mode: options.reportOnly ? 'report-only' : 'validation',
      status: 'invalid-input', error: String(error) }
    console.error(`${report.mode}: invalid-input; ${report.error}`)
    exitCode = 2
  }
  try {
    if (options.output) writeFileSync(resolve(root, options.output), JSON.stringify(report, null, 2) + '\n')
  } catch (error) {
    console.error(`invalid-input: Cannot write report: ${String(error)}`)
    exitCode = 2
  }
  process.exitCode = exitCode
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main()
