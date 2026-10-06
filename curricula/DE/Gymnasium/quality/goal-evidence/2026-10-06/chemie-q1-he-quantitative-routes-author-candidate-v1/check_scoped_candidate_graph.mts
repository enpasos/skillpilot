// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { normalizeCanonicalLandscape, normalizeGoalRef, validateCanonicalLandscape } from '../../../../../../../app/src/utils/authoring/canonicalAuthoring'

const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-q1-he-quantitative-routes-author-candidate-v1'
const path = own + '/proposed-active-tree/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
const raw = JSON.parse(readFileSync(path, 'utf8'))
const normalized = normalizeCanonicalLandscape(raw)
const nativeContainsDiagnostics = validateCanonicalLandscape(normalized)
assert.equal(nativeContainsDiagnostics.filter(row => row.severity === 'error').length, 0)
const goalById = new Map<string, any>(raw.goals.map((goal: any) => [goal.id, goal]))
assert.equal(goalById.size, raw.goals.length)
const stack: string[] = [], visiting = new Set<string>(), visited = new Set<string>(), cycles: string[][] = [], unresolved: any[] = []
const visit = (id: string) => {
  if (visited.has(id)) return
  if (visiting.has(id)) {cycles.push([...stack.slice(stack.indexOf(id)), id]); return}
  visiting.add(id); stack.push(id)
  for (const ref of goalById.get(id)?.requires ?? []) {
    const requirement = normalizeGoalRef(ref)
    if (!goalById.has(requirement)) {unresolved.push({goalId: id, reference: ref}); continue}
    visit(requirement)
  }
  stack.pop(); visiting.delete(id); visited.add(id)
}
for (const id of goalById.keys()) visit(id)
assert.deepEqual(cycles, [])
assert.deepEqual(unresolved, [])
const result = {schemaVersion: 1, documentType: 'inactive-scoped-graph-author-check-receipt', status: 'PASS native contains validation and author requires-DAG/reference check for this candidate only', checkedAtUTC: new Date().toISOString(), canonicalSHA256: createHash('sha256').update(readFileSync(path)).digest('hex'), goalCount: goalById.size,
  nativeContainsDiagnostics, nativeContainsCheckerSHA256: createHash('sha256').update(readFileSync('app/src/utils/authoring/canonicalAuthoring.ts')).digest('hex'), authorRequiresCyclePaths: cycles, authorUnresolvedRequires: unresolved,
  fullNativeValidateGraphExecuted: false, independentScientificReview: false, currentMaturityFloorsCertified: false, activeWrites: false, humanApproval: false}
writeFileSync(own + '/scoped-candidate-graph-author-check.actual.json', JSON.stringify(result, null, 2) + '\n', {flag: 'wx'})
console.log('PASS candidate only: native contains graph; author requires DAG and resolved references; 479 goals. Full GVR/CQR/floor validation pending.')
