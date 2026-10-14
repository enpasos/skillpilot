// Bounded native technical measurements; Apache-2.0.
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const root = process.cwd()
const author = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-six-current-full-source-duty-remediation-author-20261014-v1'
const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-six-current-full-source-duty-remediation-independent-b-20261014-v1'
const read = (p: string) => JSON.parse(readFileSync(resolve(root, p), 'utf8'))
const base = read(`${author}/inputs/frozen-regular-originals/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json`)
const candidate = read(`${author}/candidate/canonical528.current402-plus-five-duty-atoms.author.inactive.json`)
const cas = read(`${author}/candidate/four-new-whole-goals-one-exact-reused-RP-goal-and-three-parent-CAS.author.json`)
const { normalizeCanonicalLandscape, validateCanonicalLandscape } = await import(pathToFileURL(resolve(root, 'app/src/utils/authoring/canonicalAuthoring.ts')).href)
const { fingerprintSemanticKindSourceGoal } = await import(pathToFileURL(resolve(root, 'app/scripts/goalBookModel.ts')).href)
const baseDiagnostics = validateCanonicalLandscape(normalizeCanonicalLandscape(base))
const diagnostics = validateCanonicalLandscape(normalizeCanonicalLandscape(candidate))
const newErrors = diagnostics.filter((d: any) => d.severity === 'error' && !baseDiagnostics.some((b: any) => JSON.stringify(b) === JSON.stringify(d)))
assert.equal(newErrors.length, 0, JSON.stringify(newErrors))
const beforeById = new Map(base.goals.map((g: any) => [g.id, g]))
const afterById = new Map(candidate.goals.map((g: any) => [g.id, g]))
const expectedBodies = [...cas.newWholeGoals, ...cas.reusedExactPendingWholeGoals]
assert.equal(expectedBodies.length, 5)
assert.equal(candidate.goals.length - base.goals.length, 5)
for (const g of expectedBodies) {
  assert(!beforeById.has(g.id))
  assert.deepEqual(afterById.get(g.id), g)
  for (const field of ['contains', 'requires']) for (const id of g[field]) assert(afterById.has(id))
}
const parents = new Map(cas.existingWholeGoalCAS.map((row: any) => [row.expectedBeforeWholeGoal.id, row]))
for (const g of base.goals) {
  const p: any = parents.get(g.id)
  if (p) {
    assert.deepEqual(g, p.expectedBeforeWholeGoal)
    assert.deepEqual(afterById.get(g.id), p.proposedAfterWholeGoal)
    const beforeRest = { ...g }, afterRest = { ...p.proposedAfterWholeGoal }
    for (const key of ['contains', 'weight']) { delete beforeRest[key]; delete afterRest[key] }
    assert.deepEqual(beforeRest, afterRest)
    assert.deepEqual(p.proposedAfterWholeGoal.contains, [...g.contains, ...p.addedChildren])
  } else assert.deepEqual(afterById.get(g.id), g)
}
const measuredBodies = [...expectedBodies, ...cas.existingWholeGoalCAS.map((p: any) => p.proposedAfterWholeGoal)]
writeFileSync(resolve(root, `${own}/STOCK.native-eight-proposal-bodies-and-graph.actual.json`), JSON.stringify({
  schemaVersion: 1, status: 'PASS', baseNodeCount: base.goals.length, proposedNodeCount: candidate.goals.length,
  completeNativeGoalCAS: 'PASS', onlyFiveAddedBodiesAndThreeParentContainsWeightChanges: true,
  allOtherExistingGoalBodiesRequiresResourcesAndTerminalGoalsExact: true,
  baseDiagnostics, candidateDiagnostics: diagnostics, newErrorDiagnostics: newErrors,
  proposalFingerprints: measuredBodies.map((g: any) => ({ goalId: g.id, sourceFingerprint: fingerprintSemanticKindSourceGoal(g), status: 'proposal_only_not_semantic_authority' })),
  sourceCompilerExecuted: false,
  reason: 'Conditional unactivated source plans are not operative mapping authority. This check verifies the native body proposal and graph only.',
  D_P_A_M_VAuthorityRowsCreated: 0, activeWrites: false, strictNetGain: 0,
}, null, 2) + '\n')
console.log('PASS: stock canonical proposal diagnostics; all five complete added bodies and three complete parent CAS joins; all other existing bodies/prerequisites/resources/terminals preserved.')
