// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import {
  collectCompositionProjectionRoleGoalIds, compileCompositionView, normalizeCompositionView,
} from '../../../app/src/utils/authoring/compositionViewAuthoring'
import { normalizeCanonicalLandscape } from '../../../app/src/utils/authoring/canonicalAuthoring'
import { buildApplicabilityCompilation } from '../../../app/scripts/applicabilityCompiler'

const review = JSON.parse(readFileSync('docs/dev/ci-graph-repairs/german-applicability-support-review-2026-11-06.json', 'utf8'))
const base = 'curricula/DE/Gymnasium/canonical/'
const documents = readdirSync(base).filter(p => p.endsWith('.de.json') && !p.includes('_deck'))
  .map(p => JSON.parse(readFileSync(base + p, 'utf8')))
const owner = review.source.landscapeId
const application = JSON.parse(readFileSync('docs/dev/ci-graph-repairs/german-applicability-support-application-2026-11-06.json', 'utf8'))
assert.match(application.baselineCommit, /^[0-9a-f]{40}$/u)
const readOriginal = (path: string) => execFileSync('git', ['show', application.baselineCommit + ':' + path], { encoding: 'utf8' })
const beforeSource = readOriginal(review.source.path)
assert.equal(createHash('sha256').update(beforeSource).digest('hex'), review.source.sha256)
const beforeDocument = JSON.parse(beforeSource)
function world(before: boolean) {
  const landscapes = new Map(documents.map(d => {
    const result = normalizeCanonicalLandscape(before && d.landscapeId === owner ? beforeDocument : d)
    return [result.landscapeId, result] as const
  }))
  const goals = [...landscapes.values()].flatMap(d => d.goals)
  return { landscapes, goals: new Map(goals.map(g => [g.id, g])),
    universe: { landscapeId: 'global-canonical-universe', title: 'Canonical universe', goals } }
}
const before = world(true), after = world(false)
const supportPaths = new Set<string>(review.projectionProof.proposals.map((p: { path: string }) => p.path))
const results = []
for (const expected of review.projectionProof.allAuthoredViewApplicabilityTargetChecks) {
  const path: string = expected.path
  const current = normalizeCompositionView(JSON.parse(readFileSync(path, 'utf8')))
  const original = supportPaths.has(path)
    ? normalizeCompositionView(JSON.parse(readOriginal(path)))
    : current
  const oldRoles = collectCompositionProjectionRoleGoalIds(original.rootNodes, before.goals)
  const newRoles = collectCompositionProjectionRoleGoalIds(current.rootNodes, after.goals)
  const jurisdiction = current.scope.jurisdiction
  const filtered = (ids: Set<string>, goals: typeof after.goals) => [...ids].filter(id => {
    const goal = goals.get(id)
    assert.ok(goal, 'Unknown authored target ' + id)
    return !jurisdiction || ((goal.applicability as { jurisdiction?: string[] } | undefined)?.jurisdiction ?? []).includes(jurisdiction)
  }).sort()
  const oldTargets = filtered(oldRoles.targetGoalIds, before.goals)
  const newTargets = filtered(newRoles.targetGoalIds, after.goals)
  assert.deepEqual(newTargets, oldTargets, path + ': target membership changed')
  assert.equal(oldTargets.length, expected.targetCountBefore, path + ': prior independent count differs')
  assert.equal(newTargets.length, expected.targetCountAfter, path + ': current independent count differs')
  if (supportPaths.has(path)) {
    assert.equal(oldRoles.targetGoalIds.size, 175)
    assert.equal(newRoles.targetGoalIds.size, 175)
    assert.equal(oldRoles.prerequisiteOnlyGoalIds.size, 0)
    assert.deepEqual([...newRoles.prerequisiteOnlyGoalIds], ['ada7390c-bc64-5d53-d23f-b45f1465cd7b'])
    const oldTree = compileCompositionView(original, before.landscapes.get(owner)!, before.universe, before.landscapes)
    const newTree = compileCompositionView(current, after.landscapes.get(owner)!, after.universe, after.landscapes)
    assert.deepEqual(newTree.compiledRootNodes, oldTree.compiledRootNodes, 'Visible tree changed')
    assert.deepEqual(newTree.findings, oldTree.findings, 'Compiler findings changed')
    const projected = new Set([...newRoles.targetGoalIds, ...newRoles.prerequisiteOnlyGoalIds])
    for (const id of projected) for (const reference of after.goals.get(id)!.requires) {
      assert.ok(projected.has(reference.split(':').at(-1)!), 'Missing explicit prerequisite role: ' + reference)
    }
  }
  results.push({ path, targetCount: newTargets.length, targetSetUnchanged: true,
    prerequisiteOnlyCount: newRoles.prerequisiteOnlyGoalIds.size })
}
assert.equal(results.length, 27)
const applicability = buildApplicabilityCompilation().reports.find(r => r.landscapeId === owner)!
assert.equal(applicability.findings.filter(f => f.severity === 'error').length, 0)
assert.equal(applicability.findings.filter(f => f.code === 'APV-203').length, 0)
console.log(JSON.stringify({
  status: 'PASS', views: results, exactAuthoredTargetSetsPreserved: 27,
  hessenTargetCountEach: 175, hessenExplicitSupportCountEach: 1,
  hessenVisibleTreesAndFindingsUnchanged: true, hessenDirectPrerequisiteRolesComplete: true,
  applicabilityErrors: 0, applicabilityMaterializationDrifts: 0,
}, null, 2))
console.log('PASS actual production scope checks: 27 exact target sets; 2 unchanged HE trees/175 targets plus 1 explicit support each; 0 applicability errors/drifts.')
