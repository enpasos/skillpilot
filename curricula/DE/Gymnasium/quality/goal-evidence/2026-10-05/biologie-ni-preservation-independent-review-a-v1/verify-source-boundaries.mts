// SPDX-License-Identifier: Apache-2.0
import fs from 'node:fs'
import assert from 'node:assert/strict'
import { sourceAtlasDescendants } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs'

const base = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/'
const candidate = `${base}biologie-ni-preservation-candidate-v1/`
const output = `${base}biologie-ni-preservation-independent-review-a-v1/`
const read = (path: string) => JSON.parse(fs.readFileSync(path, 'utf8'))
const landscape = read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')
const delta = read(`${candidate}canonical.delta.candidates.json`)
const goals = new Map<string, any>(landscape.goals.map((g: any) => [g.id, structuredClone(g)]))
for (const change of delta.currentGoalDeltas) Object.assign(goals.get(change.goalId), change.after)
for (const change of delta.parentContainsDeltas) goals.get(change.goalId).contains = change.after
for (const goal of delta.newGoals) goals.set(goal.id, goal)
const atomIds = new Set<string>([...goals.values()].filter(g => !g.contains?.length).map(g => g.id))
const parents = new Map<string, string[]>()
for (const goal of goals.values()) for (const id of goal.contains ?? []) parents.set(id, [...(parents.get(id) ?? []), goal.id])
const effective = (id: string) => {
  const required = new Set<string>()
  const seen = new Set<string>()
  const visit = (g: string) => {
    if (seen.has(g)) return
    seen.add(g)
    for (const r of goals.get(g)?.requires ?? []) required.add(r)
    for (const p of parents.get(g) ?? []) visit(p)
  }
  visit(id)
  return [...required]
}
for (const edge of ['contains', 'requires']) {
  const active = new Set<string>(), done = new Set<string>()
  const visit = (id: string) => {
    assert.ok(!active.has(id), `${edge} cycle at ${id}`)
    if (done.has(id)) return
    assert.ok(goals.has(id), `missing goal ${id}`)
    active.add(id)
    for (const next of goals.get(id)[edge] ?? []) visit(next)
    active.delete(id); done.add(id)
  }
  for (const id of goals.keys()) visit(id)
}
const boundaries = delta.newGoals.map((g: any) => {
  const direct = sourceAtlasDescendants(g.id, goals, atomIds, landscape.landscapeId)
  assert.deepEqual(direct, [g.id])
  const blockedAtAncestors = []
  const seen = new Set<string>()
  const visit = (id: string) => {
    for (const parent of parents.get(id) ?? []) {
      if (seen.has(parent)) continue
      seen.add(parent)
      assert.ok(!sourceAtlasDescendants(parent, goals, atomIds, landscape.landscapeId).includes(g.id))
      blockedAtAncestors.push(parent)
      visit(parent)
    }
  }
  visit(g.id)
  return { goalId: g.id, direct, blockedAtAncestors, candidateEffectiveRequires: effective(g.id) }
})
const class6 = '359e6313-cd86-54d1-bee5-8e680101dc32'
assert.deepEqual(effective(class6), ['2d451684-6e53-565e-a987-f362da919d2c'])
const receipt = {
  schemaVersion: 1,
  verifiedAt: new Date().toISOString(),
  reviewer: 'independent-ni-preservation-reviewer-a',
  status: 'PASS_candidate_DAG_and_actual_sourceAtlas_helper_boundaries',
  boundaries,
  actualRuntimeYearResolvedProjectionChecked: false,
  actualFrontierChecked: false,
  currentStrictClosuresClaimed: 0,
  humanApprovalClaimed: false,
}
fs.writeFileSync(`${output}source-boundary-verification.receipt.json`, JSON.stringify(receipt, null, 2) + '\n')
console.log(JSON.stringify(receipt, null, 2))
