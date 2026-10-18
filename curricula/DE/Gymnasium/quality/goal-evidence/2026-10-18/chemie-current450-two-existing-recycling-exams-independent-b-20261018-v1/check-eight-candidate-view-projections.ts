import fs from 'node:fs'
import assert from 'node:assert/strict'
import path from 'node:path'
import { convertLearningGoal } from '../../../../../../../app/src/goalTypes'
import { applyCompositionViewProjection } from '../../../../../../../app/src/utils/compositionViewRuntime'
import { normalizeCompositionView, collectCompositionProjectionRoleGoalIds } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring'
import { buildDirectChildrenMap, getRenderedChildIds } from '../../../../../../../app/src/utils/treeProjectionRuntime'
import { goalMatchesFilters } from '../../../../../../../app/src/utils/goalFilters'

const own = path.dirname(new URL(import.meta.url).pathname)
const read = (p: string) => JSON.parse(fs.readFileSync(p, 'utf8'))
const delta = read(path.join(own, 'CHECK.actual-fourteen-selected-view-deltas.json'))
const input = read(path.join(own, 'INPUT.exact-five-goals-two-active-P-records-four-bound-cases.json'))
const canonical = read(input.canonical.path)
const goalById = new Map<string, any>(canonical.goals.map((g: any) => [g.id, g]))
const exams = new Set(input.goals.slice(0, 2).map((g: any) => g.id))
const clusterId = '5964272f-e835-5a24-b2b1-c162be6b75cb'
const candidateCanonical = structuredClone(canonical)
candidateCanonical.goals.find((g: any) => g.id === clusterId).contains.push(...exams)
const sorted = (values: Iterable<string>) => [...values].sort()

function project(rawView: any, rawCanonical: any) {
  const view = normalizeCompositionView(rawView)
  const rawMap = new Map<string, any>(rawCanonical.goals.map((g: any) => [g.id, g]))
  const roots = new Map([[rawCanonical.landscapeId, '442c31c5-c561-5c7a-90bb-2335d779175c']])
  const roles = collectCompositionProjectionRoleGoalIds(view.rootNodes, rawMap, roots)
  const entry = { meta: rawCanonical, goals: rawCanonical.goals.map((g: any) => convertLearningGoal(g, { landscapeId: rawCanonical.landscapeId })) }
  const projected = applyCompositionViewProjection([entry], view)[0]
  const byId = new Map(projected.goals.map(g => [g.id, g]))
  const children = buildDirectChildrenMap(byId)
  const seen = new Set<string>()
  const parents = new Map<string, Set<string>>()
  const visit = (id: string) => {
    if (seen.has(id)) return
    seen.add(id)
    for (const child of getRenderedChildIds(id, byId, children)) {
      if (!parents.has(child)) parents.set(child, new Set())
      parents.get(child)!.add(id)
      visit(child)
    }
  }
  projected.goals.filter(g => g.tags.includes('root')).forEach(g => visit(g.id))
  assert(seen.size > 0, 'No rendered root')
  const filters = [view.scope.jurisdiction, view.scope.courseProfile, view.scope.durationModel].filter(Boolean) as string[]
  const visible = new Set([...roles.targetGoalIds].filter(id => seen.has(id) && goalMatchesFilters(byId.get(id)!, filters)))
  return { view, roles, seen, parents, byId, visible, filters }
}

const records = delta.records.map((row: any) => {
  const before = project(read(row.normalView.path), canonical)
  const after = project(read(row.candidateView.path), candidateCanonical)
  const added = row.additions.map((x: any) => x.examGoalId)
  assert.deepEqual(sorted([...after.roles.targetGoalIds].filter(id => !exams.has(id))), sorted([...before.roles.targetGoalIds].filter(id => !exams.has(id))))
  assert.deepEqual(sorted(after.roles.prerequisiteOnlyGoalIds), sorted(before.roles.prerequisiteOnlyGoalIds))
  assert.deepEqual(sorted([...after.visible].filter(id => !exams.has(id))), sorted([...before.visible].filter(id => !exams.has(id))))
  assert.deepEqual(sorted([...after.visible].filter(id => !before.visible.has(id))), sorted(added))
  for (const [id, parents] of after.parents) assert(parents.size <= 1, `multiple rendered parents ${id}`)
  const details = row.additions.map((x: any) => {
    assert(!before.visible.has(x.examGoalId))
    assert(after.visible.has(x.examGoalId))
    assert(before.visible.has(x.ordinaryGoalId) && after.visible.has(x.ordinaryGoalId))
    assert(after.parents.get(x.examGoalId)?.size === 1)
    const expectedParent = `composition:${after.view.viewId}:structure:${x.parentPath.at(-1)}`
    assert(after.parents.get(x.examGoalId)!.has(expectedParent))
    const requires = after.byId.get(x.examGoalId)!.requires
    assert.deepEqual(requires, [x.ordinaryGoalId])
    assert(requires.every(id => after.byId.has(id) && after.roles.targetGoalIds.has(id) && after.visible.has(id)))
    assert(goalMatchesFilters(goalById.get(x.examGoalId), after.filters))
    return { examGoalId: x.examGoalId, ordinaryGoalId: x.ordinaryGoalId, visibleBefore: false, visibleAfter: true, exactlyOneRenderedParent: expectedParent, ordinaryTargetSelectedAndGraphAvailable: true, ownRequiresExact: requires, matchesActualCountryCourseFilters: true }
  })
  return { viewId: after.view.viewId, normalView: row.normalView, candidateView: row.candidateView, scope: after.view.scope, filters: after.filters, visibleBefore: before.visible.size, visibleAfter: after.visible.size, additions: details, oldVisibleTargetsAndAllOldProjectionRolesExact: true, oldPrerequisiteOnlyRoleCount: before.roles.prerequisiteOnlyGoalIds.size, noTargetLosses: true, allRenderedNodesHaveAtMostOneParent: true }
})
const result = { status: 'PASS', method: 'Actual stock projection/role collection/tree/filter functions on eight actual before and candidate views; candidate canonical is an in-memory exact two-contains append only.', normalWrites: 0, compilerAPBuildRuns: 0, views: records.length, actualNewVisiblePracticeAppearances: records.reduce((n: number, r: any) => n + r.additions.length, 0), newOrdinaryTargets: 0, records }
fs.writeFileSync(path.join(own, 'CHECK.actual-stock-eight-view-role-tree-filter-projections.json'), JSON.stringify(result, null, 2) + '\n')
console.log(JSON.stringify({ status: result.status, views: result.views, actualNewVisiblePracticeAppearances: result.actualNewVisiblePracticeAppearances, newOrdinaryTargets: 0, noTargetLosses: true, oldRolesExact: true }))
