import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import { fingerprintSemanticKindSourceGoal } from '../../../../../../../app/scripts/goalBookModel.ts'

const root = process.cwd()
const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-q1-current378-routes-native-d-preparation-v1'
const canonPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
const ledgerPath = 'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
const id = '171b47e2-2c53-50f2-a145-a26b896fd73f'
const hash = (bytes: Buffer | string) => createHash('sha256').update(bytes).digest('hex')
const beforeBytes = readFileSync(resolve(root, ledgerPath))
const ledger = JSON.parse(beforeBytes.toString())
const before = structuredClone(ledger)
const canonical = JSON.parse(readFileSync(resolve(root, canonPath), 'utf8'))
const goal = canonical.goals.find((goal: any) => goal.id === id)
const decision = ledger.decisions.find((decision: any) => decision.goalId === id)
assert.equal(ledger.decisions.length, 479)
assert.equal(decision.semanticKind, 'practiceAssessment')
assert.equal(decision.decisionStatus, 'authoritative')
assert.equal(goal.examData.reviewStatus, 'needs_review')
const beforeDecision = structuredClone(decision)
decision.sourceFingerprint = fingerprintSemanticKindSourceGoal(goal)
assert.notEqual(decision.sourceFingerprint, beforeDecision.sourceFingerprint)
assert.deepEqual(ledger.decisions.filter((d: any) => d.goalId !== id), before.decisions.filter((d: any) => d.goalId !== id))
const afterBytes = JSON.stringify(ledger, null, 2) + '\n'
writeFileSync(resolve(root, ledgerPath), afterBytes)
writeFileSync(resolve(root, own, 'semantic-kinds.controls-v2.inactive.json'), afterBytes)
const receipt = {
  schemaVersion: 1, createdAtUTC: new Date().toISOString(), goalId: id,
  beforeLedgerSHA256: hash(beforeBytes), afterLedgerSHA256: hash(afterBytes),
  beforeDecision, afterDecision: decision, changedDecisionCount: 1,
  other478DecisionsExactRouteAuthor: true, changedDecisionFields: ['sourceFingerprint'],
  actualClassificationDecision: {
    semanticKind: 'practiceAssessment', curricularAtomic: false,
    basis: 'Existing route-author classification; parent explicitly confirms independent task-content reviewer A retained material-supported 24/24 practice assessment after additive controls-v2.',
    examDataStatus: 'needs_review', nativeFingerprintRefreshIsTechnicalOnly: true,
  }, activeWrites: false, scienceDPAReviewDecisions: [], humanApproval: false,
}
writeFileSync(resolve(root, own, 'one-practice-assessment-binding.actual.receipt.json'), JSON.stringify(receipt, null, 2) + '\n')
console.log(JSON.stringify({goalId: id, beforeFingerprint: beforeDecision.sourceFingerprint, afterFingerprint: decision.sourceFingerprint, other478Exact: true}))
