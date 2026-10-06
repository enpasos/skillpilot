// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { fingerprintSemanticKindSourceGoal } from '../../../../../../../app/scripts/goalBookModel'

const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-biologie-ni-quantitative-integration-v1'
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
const ledgerPath = 'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json'
const canonicalBefore = readFileSync(`${own}/biologie-canonical.before-cluster-schema-metadata.json`)
const ledgerBefore = readFileSync(`${own}/biologie-semantic-kinds.before-cluster-schema-metadata.json`)
assert.deepEqual(readFileSync(canonicalPath), canonicalBefore)
assert.deepEqual(readFileSync(ledgerPath), ledgerBefore)
const canonical = JSON.parse(canonicalBefore.toString('utf8'))
const ledger = JSON.parse(ledgerBefore.toString('utf8'))
const goalId = '9cd0dbbc-9507-5879-8c4f-df54529969ec'
const cluster = canonical.goals.find((goal: {id: string}) => goal.id === goalId)
const decision = ledger.decisions.find((row: {goalId: string}) => row.goalId === goalId)
assert.equal(cluster.dimensionTags, undefined)
assert.equal(cluster.type, 'cluster')
assert.equal(cluster.contains.length, 20)
assert.deepEqual(cluster.applicability.jurisdiction, ['DE-NI'])
assert.equal(decision.semanticKind, 'curricularArea')
assert.equal(decision.decisionStatus, 'authoritative')
assert.equal(decision.sourceFingerprint, fingerprintSemanticKindSourceGoal(cluster))
for (const childId of cluster.contains) {
  const child = canonical.goals.find((goal: {id: string}) => goal.id === childId)
  assert.equal(child.dimensionTags.phase, 'GLOBAL')
}
const beforeFingerprint = decision.sourceFingerprint
cluster.dimensionTags = { phase: 'GLOBAL' }
decision.sourceFingerprint = fingerprintSemanticKindSourceGoal(cluster)
assert.equal(decision.sourceFingerprint, 'sha256:b38a82a7a4714866f6fd031e7338b3cb5926337772d6c9678de4e2195d4b9a3f')
writeFileSync(canonicalPath, `${JSON.stringify(canonical, null, 2)}\n`)
writeFileSync(ledgerPath, `${JSON.stringify(ledger, null, 2)}\n`)
const sha = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex')
const receipt = {
  performedAtUTC: new Date().toISOString(),
  goalId, changes: { dimensionTags: { phase: 'GLOBAL' } },
  rationale: 'Required standard schema metadata; every existing child already has GLOBAL. The node remains the same reviewed NI curricular area with the same twenty children.',
  semanticKindBeforeAndAfter: 'curricularArea',
  beforeFingerprint, afterFingerprint: decision.sourceFingerprint,
  canonicalBeforeSHA256: sha(canonicalBefore), canonicalAfterSHA256: sha(readFileSync(canonicalPath)),
  ledgerBeforeSHA256: sha(ledgerBefore), ledgerAfterSHA256: sha(readFileSync(ledgerPath)),
  wholeAtomicGoalsChanged: 0, scientificReviewsChanged: 0,
  newScientificClosures: 0, humanApproval: false, humanTrial: false,
  independentNativePageAndInputComparison: 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-ni-current-cluster-schema-metadata-independent-guard-v1/in-memory-current-native-comparison.actual.json',
}
writeFileSync(`${own}/cluster-schema-metadata.application.actual.json`, `${JSON.stringify(receipt, null, 2)}\n`)
console.log(JSON.stringify(receipt))
