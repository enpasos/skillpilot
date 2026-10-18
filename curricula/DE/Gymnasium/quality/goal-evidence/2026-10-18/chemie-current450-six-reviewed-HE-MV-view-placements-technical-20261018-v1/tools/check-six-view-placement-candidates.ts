// SPDX-License-Identifier: Apache-2.0
// Finite real role/tree/filter check, not a replacement for the final central gates.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { convertLearningGoal } from '../../../../../../../../app/src/goalTypes'
import { applyCompositionViewProjection } from '../../../../../../../../app/src/utils/compositionViewRuntime'
import { normalizeCompositionView, collectCompositionProjectionRoleGoalIds } from '../../../../../../../../app/src/utils/authoring/compositionViewAuthoring'
import { buildDirectChildrenMap, getRenderedChildIds } from '../../../../../../../../app/src/utils/treeProjectionRuntime'
import { goalMatchesFilters } from '../../../../../../../../app/src/utils/goalFilters'

const out = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-six-reviewed-HE-MV-view-placements-technical-20261018-v1/'
const read = (p: string) => JSON.parse(readFileSync(p, 'utf8'))
const pin = (p: string) => { const b = readFileSync(p); return { path: p, sha256: createHash('sha256').update(b).digest('hex'), bytes: b.length } }
const plan = read(out + 'PLAN.six-exact-view-placements.before-and-candidate.json')
assert.deepEqual(pin(plan.canonicalUnchanged.path), plan.canonicalUnchanged)
assert.deepEqual(pin(plan.centralUnchanged.path), plan.centralUnchanged)
const raw = read(plan.canonicalUnchanged.path)
const byId = new Map<string, any>(raw.goals.map((g: any) => [g.id, g]))
const entry = { meta: raw, goals: raw.goals.map((g: any) => convertLearningGoal(g, { landscapeId: raw.landscapeId })) }
const central = read(plan.centralUnchanged.path)
const memoryConfig = read(central.subjects.find((s: any) => s.subject === 'chemie').memoryReviewConfigPath)
const memories = new Map<string, any>(readFileSync(memoryConfig.reviewPath, 'utf8').trim().split('\n').map(line => { const r = JSON.parse(line); return [r.goalId, r] }))
const sorted = (x: Iterable<string>) => [...x].sort()
function actual(p: string) {
  const v = normalizeCompositionView(read(p))
  const roles = collectCompositionProjectionRoleGoalIds(v.rootNodes, byId)
  const projected = applyCompositionViewProjection([entry], v)[0]
  assert(projected)
  const projectedById = new Map<string, any>(projected.goals.map((g: any) => [g.id, g]))
  const children = buildDirectChildrenMap(projectedById)
  const stack = projected.goals.filter((g: any) => g.tags?.includes('root')).map((g: any) => g.id)
  const seen = new Set<string>()
  while (stack.length) {
    const id = stack.pop()!
    if (seen.has(id)) continue
    seen.add(id)
    stack.push(...getRenderedChildIds(id, projectedById, children))
  }
  const filters = [v.scope.jurisdiction, v.scope.courseProfile, v.scope.durationModel].filter(Boolean)
  const targets = new Set([...roles.targetGoalIds].filter(id => seen.has(id) && goalMatchesFilters(byId.get(id), filters)))
  const memoryTargets = new Set([...targets].filter(id => byId.get(id)?.tags?.some((t: string) => t === 'memorization' || t.startsWith('srs-deck:')) || byId.get(id)?.nodeKind === 'memory'))
  return { v, roles, targets, memoryTargets, projectedById }
}
const rows = plan.rows.map((row: any) => {
  assert.deepEqual(pin(row.normalBefore.path), row.normalBefore)
  assert.deepEqual(pin(row.before.path), row.before)
  assert.deepEqual(pin(row.candidate.path), row.candidate)
  const before = actual(row.before.path), after = actual(row.candidate.path)
  const he = row.scope.jurisdiction === 'DE-HE'
  const id = he ? '6eba90b5-d4a6-5625-be61-e7f30f7eb964' : 'e81a4aed-9695-533e-8eb7-7a0c714346ea'
  const removed = sorted([...before.targets].filter(x => !after.targets.has(x)))
  const added = sorted([...after.targets].filter(x => !before.targets.has(x)))
  const expected = !he || row.scope.courseProfile === 'LK'
  assert.deepEqual(removed, [])
  assert.deepEqual(added, expected ? [id] : [])
  assert.equal(after.targets.has(id), expected)
  assert.deepEqual(sorted(before.roles.prerequisiteOnlyGoalIds), sorted(after.roles.prerequisiteOnlyGoalIds))
  assert.deepEqual(sorted(before.memoryTargets), sorted(after.memoryTargets))
  const memory = memories.get(id)
  assert.equal(memory?.status, 'no_memory_needed')
  const directPrerequisites = (byId.get(id).requires ?? []).map((required: string) => ({ goalId: required, presentInProjectedGraph: after.projectedById.has(required), targetOrPrerequisiteOnly: after.roles.targetGoalIds.has(required) || after.roles.prerequisiteOnlyGoalIds.has(required) }))
  if (expected) for (const required of directPrerequisites) {
    assert(required.presentInProjectedGraph)
    assert(required.targetOrPrerequisiteOnly, `${row.normalBefore.path} missing prerequisite ${required.goalId}`)
  }
  return { path: row.normalBefore.path, scope: row.scope, before: row.before, candidate: row.candidate, effectiveTargetCountBefore: before.targets.size, effectiveTargetCountAfter: after.targets.size, lostEffectiveTargets: removed, addedEffectiveTargets: added, exactPrerequisiteOnlyRolesPreserved: true, exactVisibleMemoryTargetsPreserved: true, affectedGoalMemoryDecision: memory, directPrerequisites, allOtherTargetsPreserved: true }
})
const result = { status: 'PASS', method: 'Actual unchanged stock role collector, runtime view projection, rendered-tree traversal and country/course filter; six finite before/candidate comparisons. No AP/compiler/full memory gate claimed.', rows, canonicalExact: pin(plan.canonicalUnchanged.path), centralExact: pin(plan.centralUnchanged.path), normalWrites: 0, newScientificVotes: 0 }
const resultPath = out + 'CHECK.actual-six-before-candidate-role-tree-filter-memory-preservation.json'
writeFileSync(resultPath, JSON.stringify(result, null, 2) + '\n')
console.log(JSON.stringify({ status: result.status, sixViews: rows.length, newEffectiveTargetAppearances: rows.reduce((n: number, r: any) => n + r.addedEffectiveTargets.length, 0), lostTargets: 0, memoryTargetsUnchanged: true, check: pin(resultPath) }))
