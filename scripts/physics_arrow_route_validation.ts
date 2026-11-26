// SPDX-License-Identifier: Apache-2.0
// Actual authored scope, Personal Curriculum, navigation and native unit map.
import {readFileSync, readdirSync} from 'node:fs'
import {resolve} from 'node:path'
import {prepareLandscapeEntries} from '../app/src/hooks/useLandscapes'
import {collectCompositionProjectionRoleGoalIds} from '../app/src/utils/authoring/compositionViewAuthoring'
import {applyCompositionViewProjection, applyPersonalCurriculumProjection} from '../app/src/utils/compositionViewRuntime'
import {normalizeLearnerProjectedEntries, buildLearnerNavigationProjection} from '../app/src/utils/learnerTreeProjection'
import {buildDirectChildrenMap} from '../app/src/utils/treeProjectionRuntime'
import {goalMatchesFilters} from '../app/src/utils/goalFilters'
import {deriveLearnerUnitMapPreview} from '../app/src/utils/learnerNavigation/learnerUnitMapPreview'
import {buildLearnerUnitMapProjection} from '../app/src/utils/learnerNavigation/learnerUnitMapProjection'
import {createLearnerRequirementResolver} from '../app/src/utils/learnerNavigation/learnerMapProjection'

export const arrowId = 'b77a7e93-22f9-5722-a4cc-f18a149ab030'
export const k4Id = '2569d84a-5bf1-542b-bc43-6ade1df971c4'
export const routeEvidenceDirectory = 'curricula/DE/Gymnasium/quality/learning-units/physics-directed-quantity-arrows-20261126-v1/routes'

export function compareNativeUnitPaths(a: any[], b: any[], edges: Map<string, string[]>): string {
  if (!a || !b) return 'not-visible'
  let i = 0
  while (i < Math.min(a.length, b.length) && a[i].id === b[i].id) i++
  if (i === Math.min(a.length, b.length)) return 'same-path'
  if (a[i].kind !== 'unit' && b[i].kind !== 'unit') return 'same-unit'
  const reaches = (start: string, end: string) => {
    const seen = new Set<string>(), queue = [start]
    for (let j = 0; j < queue.length; j++) {
      if (queue[j] === end) return true
      if (seen.has(queue[j])) continue
      seen.add(queue[j]); queue.push(...edges.get(queue[j]) ?? [])
    }
    return false
  }
  if (reaches(a[i].id, b[i].id)) return 'earlier-unit'
  if (reaches(b[i].id, a[i].id)) return 'later-unit'
  return 'unordered-units'
}

export function measurePhysicsArrowRoutes(root: string, options: {
  viewFiles?: string[], mutateView?: (view: any) => any, mutateCatalog?: (catalog: any[]) => any[], consumerIds?: string[]
} = {}) {
  const read = (p: string) => JSON.parse(readFileSync(resolve(root, p), 'utf8'))
  const decisions = read(`${routeEvidenceDirectory}/source-decisions.actual.json`)
  const catalogDirectory = 'curricula/DE/Gymnasium/canonical'
  let catalog = readdirSync(resolve(root, catalogDirectory)).filter(n => n.endsWith('.json')).sort().map(n => read(`${catalogDirectory}/${n}`))
  if (options.mutateCatalog) catalog = options.mutateCatalog(structuredClone(catalog))
  const source = prepareLandscapeEntries(catalog)
  const goals = new Map<string, any>(source.flatMap(e => e.goals.map(g => [g.id, g] as const)))
  const roots = new Map(catalog.map(d => [d.landscapeId, d.goals.find((g: any) => (g.tags ?? []).includes('root'))?.id]))
  const ledger = read('curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json')
  // Read the single current semantic decision, rather than a parallel marker list.
  const consumers: string[] = options.consumerIds ?? ledger.decisions.filter((d: any) => d.directedQuantityArrows?.usage === 'required').map((d: any) => d.goalId).filter((id: string) => ![arrowId, k4Id].includes(id))
  if (consumers.length !== 24) throw Error(`Expected 24 reviewed arrow consumers, got ${consumers.length}`)
  const resolver = createLearnerRequirementResolver(goals, goals, () => undefined)
  const requirements = new Map<string, string[]>([...goals].filter(([, g]) => g.type !== 'cluster' && !g.contains.length).map(([id]) => [id, [...new Set(resolver.directRequirementContext(id).flatMap(c => c.sourceGoalIds))]]))
  const prerequisitePaths = (seed: Set<string>) => {
    const paths = new Map<string, string[]>([...seed].map(id => [id, [id]])), queue = [...seed]
    for (let i = 0; i < queue.length; i++) for (const raw of requirements.get(queue[i]) ?? []) {
      const id = raw.split(':').at(-1)
      if (!goals.has(id)) throw Error('Unresolved actual prerequisite ' + raw)
      if (!paths.has(id)) { paths.set(id, [...paths.get(queue[i])!, id]); queue.push(id) }
    }
    return paths
  }
  const rows = (options.viewFiles ?? decisions.views.map((r: any) => r.file)).map((file: string) => {
    let view = read(`curricula/DE/Gymnasium/composition-views/physik/${file}`)
    if (options.mutateView) view = options.mutateView(structuredClone(view))
    const expected = decisions.views.find((r: any) => r.viewId === view.viewId)
    if (!expected) throw Error('Missing reviewed source route ' + view.viewId)
    const roles = collectCompositionProjectionRoleGoalIds(view.rootNodes, goals, roots)
    const filters = [view.scope.courseProfile, view.scope.jurisdiction, view.scope.durationModel].filter(Boolean)
    const seed = new Set<string>([...roles.targetGoalIds].filter(id => {
      const goal = goals.get(id)
      return goal && goal.type !== 'cluster' && !goal.contains.length && goalMatchesFilters(goal, filters)
    }))
    const paths = prerequisitePaths(seed)
    const remaining = new Set(paths.keys()), frontier = new Map<string, number>()
    let layer = 0
    while (remaining.size) {
      const ready = [...remaining].filter(id => (requirements.get(id) ?? []).every(p => frontier.has(p)))
      if (!ready.length) throw Error('Cyclic or unresolved actual native frontier ' + view.viewId)
      for (const id of ready) { remaining.delete(id); frontier.set(id, layer) }
      layer++
    }
    const personal = source.map(e => ({...e, meta: {...e.meta, personalCurriculumProjection: {
      revision: 'atomic-prerequisite-learning-v1' as const, rootLandscapeId: 'a0e13c56-c25f-4742-9272-3a1a603ee52e',
      scopeRevision: 'physics-directed-quantity-arrows-20261126-current',
      seedAtomicGoalIds: e.goals.filter(g => seed.has(g.id)).map(g => g.id),
      targetGoalIds: e.goals.filter(g => paths.has(g.id)).map(g => g.id),
      requiredByPaths: Object.fromEntries(e.goals.filter(g => paths.has(g.id) && !seed.has(g.id)).map(g => [g.id, paths.get(g.id)!])),
    }}}))
    const runtimeSource = source.filter(e => e.meta.landscapeId === view.landscapeId || e.goals.some(g => paths.has(g.id))).map(e => e.meta.landscapeId === view.landscapeId ? e : {...e, goals: e.goals.filter(g => paths.has(g.id))})
    const composed = normalizeLearnerProjectedEntries(applyCompositionViewProjection(runtimeSource, view))
    const actual = applyPersonalCurriculumProjection(composed, personal)
    const index = new Map(actual.flatMap(e => e.goals.map(g => [g.id, g] as const)))
    const nav = buildLearnerNavigationProjection(index, buildDirectChildrenMap(index))
    const tree = {rootGoals: [...nav.navigationGoals.values()].filter(g => (g.tags ?? []).includes('root') && g.contains.length),
      goalIndexAll: nav.navigationGoals, canonicalGoalIndexAll: goals, visibleGoalIds: new Set(nav.navigationGoals.keys()),
      visibleChildrenByParent: nav.childrenByParent, landscapeSources: actual}
    const preview = deriveLearnerUnitMapPreview(tree)
    const unitMap = buildLearnerUnitMapProjection({...tree, units: preview.units, after: preview.after, memberUnits: preview.memberUnits})
    const edges = new Map<string, string[]>()
    for (const relations of Object.values(unitMap.scopeRelations ?? {})) for (const relation of relations) if (relation.unitOrder === 'declared') edges.set(relation.source, [...edges.get(relation.source) ?? [], relation.target])
    const timing = (id: string) => unitMap.entryPaths?.[id]?.map(key => ({id: key, title: unitMap.entries[key]?.title, kind: unitMap.entries[key]?.kind})) ?? null
    const arrowTiming = timing(arrowId)
    const uses = consumers.filter(id => paths.has(id)).map(goalId => ({goalId,
      role: seed.has(goalId) ? 'target' : 'requiredPreparation',
      frontier: frontier.get(goalId),
      pathToArrow: prerequisitePaths(new Set([goalId])).get(arrowId) ?? null,
      nativeUnitPath: timing(goalId), calendar: compareNativeUnitPaths(arrowTiming!, timing(goalId)!, edges)}))
    const arrowRole = roles.targetGoalIds.has(arrowId) ? 'target' : roles.prerequisiteOnlyGoalIds.has(arrowId) ? 'prerequisiteOnly' : 'absent'
    const k4Role = roles.targetGoalIds.has(k4Id) ? 'target' : roles.prerequisiteOnlyGoalIds.has(k4Id) ? 'prerequisiteOnly' : 'absent'
    return {file, viewId: view.viewId, scope: view.scope, expectedRole: expected.projectionRole, arrowRole, k4Role,
      arrowInLearningBasis: paths.has(arrowId), arrowVisible: !!arrowTiming, arrowFrontier: frontier.get(arrowId), nativeRequirementResolver: true,
      k4Visible: !!timing(k4Id), k4OperationalTarget: seed.has(k4Id),
      arrowNativeUnitPath: arrowTiming, k4NativeUnitPath: timing(k4Id), consumers: uses,
      declaredUnitOrder: [...edges].flatMap(([source, targets]) => targets.map(target => ({source, target}))),
      findings: unitMap.findings.filter(f => ['unknownUnit', 'afterNotSiblings', 'contradictoryAfter', 'selfAfter'].includes(f.kind)),
    }
  })
  const violations = rows.flatMap(row => [
    ...(row.arrowRole !== row.expectedRole ? [{viewId: row.viewId, kind: 'wrong-role'}] : []),
    ...(!row.arrowVisible || !row.arrowInLearningBasis ? [{viewId: row.viewId, kind: 'missing-arrow-acquisition'}] : []),
    ...((row.expectedRole === 'target') !== (row.k4Role === 'target' && row.k4OperationalTarget && row.k4Visible) || (row.expectedRole !== 'target' && (row.k4Role !== 'absent' || row.k4Visible)) ? [{viewId: row.viewId, kind: 'wrong-k4-exposure'}] : []),
    ...row.consumers.filter(r => r.pathToArrow && !(row.arrowFrontier! < r.frontier!)).map(r => ({viewId: row.viewId, goalId: r.goalId, kind: 'unguarded-native-frontier'})),
    ...row.consumers.filter(r => !r.pathToArrow).map(r => ({viewId: row.viewId, goalId: r.goalId, kind: 'broken-arrow-path'})),
    ...row.consumers.filter(r => ['later-unit', 'not-visible'].includes(r.calendar)).map(r => ({viewId: row.viewId, goalId: r.goalId, kind: 'late-arrow-place'})),
    ...row.findings.map(f => ({viewId: row.viewId, kind: 'invalid-native-unit-order', finding: f})),
  ])
  return {schema: 'physics-arrow-native-route-audit-v1', method: 'Actual eligible authored seeds and complete prerequisite closure; composition, Personal Curriculum, navigation, and native unit map projections. The production requirement resolver supplies direct atomic demand; independent Kahn frontier layers confirm A precedes every required current marked consumer, including preparation. Native calendar partial order and requires paths are separate facts.',
    consumerGoalIds: consumers, counts: {views: rows.length, lowerLandTargetViews: rows.filter(r => r.expectedRole === 'target' && (r.scope.jurisdiction ?? 'DE') !== 'DE').length,
      ownNationalLowerTargetViews: rows.filter(r => r.expectedRole === 'target' && (r.scope.jurisdiction ?? 'DE') === 'DE').length,
      preparationViews: rows.filter(r => r.expectedRole === 'prerequisiteOnly').length,
      consumers: rows.reduce((n, r) => n + r.consumers.length, 0), unorderedConsumers: rows.flatMap(r => r.consumers).filter(r => r.calendar === 'unordered-units').length,
      violations: violations.length}, violations, views: rows,
    boundaries: ['All inputs are synthetic selections of the actual authored offers; no learner state is created or changed.', 'Unordered native units remain explicitly unordered; actual prerequisite paths protect their frontiers.', 'Official lower-stage target authority, own early acquisition place, and own upper-stage preparation are recorded separately.']}
}
