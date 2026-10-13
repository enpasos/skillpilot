// Apache-2.0. Finite read-only measurements; no BookModel, page or source compilation.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const root = process.cwd()
const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-e594-two-route-split-scientific-independent-a-20261013-v1'
const author = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-e594-two-synthesis-routes-scope-preserving-author-20261013-v1'
const bindings = new Map<string, unknown>()
const bind = (path: string) => {
  const bytes = readFileSync(resolve(root, path))
  const result = { path, sha256: `sha256:${createHash('sha256').update(bytes).digest('hex')}`, bytes: bytes.length }
  bindings.set(path, result)
  return result
}
const read = (path: string) => { bind(path); return JSON.parse(readFileSync(resolve(root, path), 'utf8')) }
const modules = [
  'app/scripts/goalBookModel.ts',
  'app/scripts/goalEvidenceProfileModel.ts',
  'app/src/utils/authoring/canonicalAuthoring.ts',
  'app/src/utils/authoring/compositionViewAuthoring.ts',
]
modules.forEach(bind)
const [book, evidence, canonical, composition] = await Promise.all(modules.map(path => import(pathToFileURL(resolve(root, path)).href)))
const cas = read(`${author}/candidate/three-existing-whole-goal-CAS-and-two-new-whole-children.inactive-author.json`)
assert.deepEqual(bind(cas.sourceCanonicalBinding.path), cas.sourceCanonicalBinding)
const baseline = read(cas.sourceCanonicalBinding.path)
const proposed = structuredClone(baseline)
for (const row of cas.existingGoals) {
  const index = proposed.goals.findIndex((goal: any) => goal.id === row.expectedBeforeWholeGoal.id)
  assert.deepEqual(proposed.goals[index], row.expectedBeforeWholeGoal)
  proposed.goals[index] = row.proposedAfterWholeGoal
}
const parentIndex = proposed.goals.findIndex((goal: any) => goal.id === 'e5941581-0aba-5354-b4b9-d0249d4538a8')
proposed.goals.splice(parentIndex + 1, 0, ...cas.newChildren)
const normalized = canonical.normalizeCanonicalLandscape(proposed)
assert.deepEqual(JSON.parse(JSON.stringify(normalized)), proposed)
const diagnostics = canonical.validateCanonicalLandscape(normalized)
assert.equal(diagnostics.filter((row: any) => row.severity === 'error').length, 0)
const decisions = read(`${author}/candidate/five-semantic-decision-CAS.stock-fingerprints.inactive-author.json`)
assert.deepEqual(bind(decisions.sourceSemanticLedgerBinding.path), decisions.sourceSemanticLedgerBinding)
const oldLedger = read(decisions.sourceSemanticLedgerBinding.path)
const allDecisions = structuredClone(oldLedger.decisions)
const fingerprintRows = []
for (const goal of [...cas.existingGoals.map((row: any) => row.proposedAfterWholeGoal), ...cas.newChildren]) {
  const row = decisions.rows.find((row: any) => row.proposedAfterWholeDecision.goalId === goal.id)
  assert.deepEqual(row.expectedBeforeWholeDecision, oldLedger.decisions.find((row: any) => row.goalId === goal.id) ?? null)
  const actual = book.fingerprintSemanticKindSourceGoal(goal)
  assert.equal(actual, row.proposedAfterWholeDecision.sourceFingerprint)
  const decisionIndex = allDecisions.findIndex((entry: any) => entry.goalId === goal.id)
  if (decisionIndex < 0) allDecisions.push(row.proposedAfterWholeDecision)
  else allDecisions[decisionIndex] = row.proposedAfterWholeDecision
  fingerprintRows.push({ goalId: goal.id, semanticKind: row.proposedAfterWholeDecision.semanticKind, sourceSemanticKindFingerprint: actual, rule: 'unmodified fingerprintSemanticKindSourceGoal', candidateFingerprintExact: true })
}
const measuredCounts: Record<string, number> = {}
for (const row of allDecisions) measuredCounts[row.semanticKind] = (measuredCounts[row.semanticKind] ?? 0) + 1
assert.equal(allDecisions.length, 525)
assert.equal(measuredCounts.curricularAtomic, 403)
assert.equal(new Set(allDecisions.map((row: any) => row.goalId)).size, 525)
const profiles = read(`${author}/positive/two-child.exact-route-profiles.author.json`)
const profileRows = profiles.profiles.map((row: any) => ({ goalId: row.goalId, profileFingerprint: evidence.fingerprintGoalEvidenceProfile(row.profile, 'goal-evidence-v1'), ruleVersion: 'goal-evidence-v1', rule: 'unmodified fingerprintGoalEvidenceProfile' }))
const viewCAS = read(`${author}/scope-view-whole-CAS.author.json`)
const goalById = new Map<string, any>(proposed.goals.map((goal: any) => [goal.id, goal]))
const roleRows = []
for (const file of viewCAS.wholeViewProposals) {
  assert.deepEqual(bind(file.expectedWholeViewBinding.path), file.expectedWholeViewBinding)
  const view = structuredClone(read(file.expectedWholeViewBinding.path))
  for (const row of file.exactNodeChanges) {
    const parts = row.jsonPointer.split('/').slice(1)
    let container = view
    for (const part of parts.slice(0, -1)) container = container[part]
    assert.deepEqual(container[parts.at(-1)!], row.beforeWholeNode)
    container[parts.at(-1)!] = row.afterWholeNode
  }
  const roles = composition.collectCompositionProjectionRoleGoalIds(view.rootNodes, goalById)
  roleRows.push({ path: file.expectedWholeViewBinding.path, changedNodes: file.exactNodeChanges.length, childRoles: cas.newChildren.map((goal: any) => ({ goalId: goal.id, role: roles.targetGoalIds.has(goal.id) ? 'target' : roles.prerequisiteOnlyGoalIds.has(goal.id) ? 'prerequisiteOnly' : 'absent' })), measuredBy: 'unmodified collectCompositionProjectionRoleGoalIds', sourceApplicabilityAndPageCompilationPerformed: false })
}
const result = { schemaVersion: 1, measuredAtUTC: new Date().toISOString(), role: 'Independent finite stock fingerprints, canonical normalization and role assignments; not complete source or view compilation', moduleBindings: modules.map(bind), canonicalNormalizationExact: true, canonicalAuthoringDiagnostics: diagnostics, inMemorySemanticCounts: { beforeNodes: oldLedger.decisions.length, beforeCurricularAtomic: oldLedger.counts.curricularAtomic, proposedNodes: allDecisions.length, proposedKinds: measuredCounts }, fiveMeasuredSemanticSourceFingerprints: fingerprintRows, twoMeasuredProfileFingerprints: profileRows, twentyOneProposedViewRoleAssignments: roleRows, noBookModelOrCompiledScopeProduced: true, evidenceDecisionByTheseMeasurements: false, humanApproval: false, humanTrial: false, activeWrites: false }
writeFileSync(resolve(root, own, 'checks/stock-fingerprints-and-roles.independent.actual.json'), `${JSON.stringify(result, null, 2)}\n`)
writeFileSync(resolve(root, own, 'checks/stock-api-consumed-bindings.actual.json'), `${JSON.stringify({ inputBindings: [...bindings.values()] }, null, 2)}\n`)
console.log(JSON.stringify({ measuredStockSourceFingerprints: fingerprintRows.length, measuredStockProfileFingerprints: profileRows.length, exactCanonicalNormalizer: true, canonicalErrors: 0, proposedViewRoleAssignments: roleRows.length, viewsAssigningBothChildrenTarget: roleRows.filter(row => row.childRoles.every((child: any) => child.role === 'target')).length, actualCompiledScopes: 0 }))
