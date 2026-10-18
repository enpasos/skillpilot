import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { collectCompositionProjectionRoleGoalIds, normalizeCompositionView } from '../../../../../../../../app/src/utils/authoring/compositionViewAuthoring.ts'
import { goalMatchesFilters } from '../../../../../../../../app/src/utils/goalFilters.ts'

// Read-only role collection, using the existing AP facts. This imports neither
// the applicability compiler nor any publication/quality generator.
const base = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-applicability-warning-binding-author-20261018-v1'
const verifiedCaptures: string[] = []
const assertSameCapture = (p:string, bytes:string) => { if (fs.readFileSync(p, 'utf8') !== bytes) throw new Error('Current stock role/filter capture differs: ' + p); verifiedCaptures.push(p) }
const read = (p: string) => JSON.parse(fs.readFileSync(p, 'utf8'))
const digest = (bytes: Buffer | string) => crypto.createHash('sha256').update(bytes).digest('hex')
const input = read(path.join(base, 'inputs/current87-whole-goals.json'))
const ap = read(path.join(base, 'inputs/current87-existing-applicability-facts.json'))
const graph = read(path.join(base, 'inputs/current-contains-graph.json'))
const map = new Map(graph.graph.map((g: any) => [g.id, g])) as Map<string, { contains?: string[] }>
const goalById = new Map(input.goals.map((g: any) => [g.id, g])) as Map<string, any>
const apById = new Map(ap.goals.map((g: any) => [g.goalId, g])) as Map<string, any>
const rootMap = new Map([[ap.landscapeId, graph.rootGoalId]])
const descendants = new Map<string, Set<string>>()
const subtree = (id: string) => {
  if (descendants.has(id)) return descendants.get(id)!
  const found = new Set<string>(), stack = [id]
  while (stack.length) {
    const next = stack.pop()!
    if (found.has(next)) continue
    found.add(next)
    stack.push(...(map.get(next)?.contains ?? []))
  }
  descendants.set(id, found)
  return found
}
const dir = 'curricula/DE/Gymnasium/composition-views/chemie'
const views: any[] = [], contexts: any[] = []
for (const name of fs.readdirSync(dir).filter((n) => n.endsWith('.view.json')).sort()) {
  const sourcePath = path.join(dir, name)
  const bytes = fs.readFileSync(sourcePath)
  const raw = JSON.parse(bytes.toString())
  const view = normalizeCompositionView(raw)
  if (view.landscapeId !== ap.landscapeId) continue
  const role = collectCompositionProjectionRoleGoalIds(view.rootNodes, map, rootMap)
  const source = { path: sourcePath, sha256: digest(bytes), bytes: bytes.length }
  const viewIndex = views.length
  views.push({ source, viewId: view.viewId, scope: view.scope, rawWholeView: raw })
  const refs: any[] = []
  const visit = (nodes: any[], pointer: string, ancestors: any[]) => nodes.forEach((n, i) => {
    const p = `${pointer}/${i}`
    if (n.kind === 'structure') visit(n.children ?? [], `${p}/children`, [...ancestors, { id: n.id, label: n.label, pointer: p }])
    else refs.push({ node: n, pointer: p, ancestors })
  })
  visit(view.rootNodes, '/rootNodes', [])
  for (const [goalId, goal] of goalById) {
    const authoredRole = role.targetGoalIds.has(goalId) ? 'target' : role.prerequisiteOnlyGoalIds.has(goalId) ? 'prerequisiteOnly' : 'absent'
    if (authoredRole === 'absent') continue
    const compiled = apById.get(goalId).compiledApplicability
    const filterGoal = { ...goal, applicability: { ...(goal.applicability ?? {}), ...compiled } }
    const filters = [view.scope.jurisdiction, view.scope.courseProfile, view.scope.durationModel].filter(Boolean)
    const referencedBy = refs.filter(({ node }) => node.kind === 'goalEntry' ? node.goalId === goalId
      : node.kind === 'canonicalSubtree' ? subtree(node.goalId).has(goalId)
        : node.kind === 'landscapeEntry' && rootMap.has(node.landscapeId) && subtree(rootMap.get(node.landscapeId)!).has(goalId))
      .map(({ node, pointer, ancestors }) => ({ pointer, kind: node.kind, referencedGoalId: node.goalId ?? rootMap.get(node.landscapeId), statedRole: node.projectionRole ?? 'target', structureAncestors: ancestors }))
    contexts.push({ goalId, viewId: view.viewId, scope: view.scope, authoredRole,
      individualFiltersFromExistingAPReportPass: goalMatchesFilters(filterGoal, filters),
      filters, viewSource: source, wholeViewSnapshotPointer: `/views/${viewIndex}/rawWholeView`, referencedBy })
  }
}
assertSameCapture(path.join(base, 'inputs/current-whole-view-objects.json'), JSON.stringify({ method: 'Existing current view objects, parsed without mutation', views }, null, 2) + '\n')
assertSameCapture(path.join(base, 'inputs/current87-authored-view-contexts.json'), JSON.stringify({
  method: 'Unmodified stock normalizeCompositionView, collectCompositionProjectionRoleGoalIds and goalMatchesFilters; existing AP-report jurisdiction facts only',
  boundary: 'Authored role and individual filter facts, not a newly compiled/rendered tree, source coverage, learner execution or scientific review',
  applicabilityCompilerRun: false, viewCompilerRun: false, normalWrites: false,
  helperSources: ['app/src/utils/authoring/compositionViewAuthoring.ts', 'app/src/utils/goalFilters.ts'].map((p) => ({ path: p, sha256: digest(fs.readFileSync(p)) })),
  counts: { views: views.length, warningGoals: goalById.size, contexts: contexts.length }, contexts,
}, null, 2) + '\n')
console.log(JSON.stringify({artifactRole:'Independent actual stock role and individual filter recomputation against current41 authored views, without mutation or compiler',views:views.length,warningGoals:goalById.size,contexts:contexts.length,byteExactCapturedInputs:verifiedCaptures,normalWrites:0,authorPacketWrites:0,compilerRuns:0,status:'PASS'}, null, 2))
