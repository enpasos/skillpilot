// SPDX-License-Identifier: Apache-2.0
// Technical bindings only. Original scientific records are never written.
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { pathToFileURL } from 'node:url'

const base = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/'
const out = `${base}chemie-rest6-two-whole-atoms-on-final-source6-current412-minimal-inactive-technical-20261014-v1/`
const t = `${base}chemie-source6-current412-final-resources-P5-shared-native5-technical-20261014-v1/`
const oa = `${base}chemie-source-six-original-residual-duty-source-P-A-M-independent-a-20261014-v1/`
const da = `${base}chemie-residual-e5d-case2-complete-material-targeted-independent-a-20261014-v1/`
const rootId = '442c31c5-c561-5c7a-90bb-2335d779175c'
const ids = ['c3077d95-f3fe-5579-8493-cb92992809c4', 'e5d6de7e-28c5-5dd8-a700-ecc1a3a7b8cd']
const containerId = 'd11fc507-4fae-5f2f-bd84-c3dbc9c43daf'
const canonicalPath = `${out}candidate/canonical542.prospective414.on-final-source6-539.minimal-inactive.json`
const ledgerPath = `${out}candidate/semantic542.prospective414.paired-existing-science.closed-enum.json`
const reviewPath = `${out}P/P2.original-c307-and-corrected-e5d.existing-genuine-a.technical-selection.review.jsonl`
const criteriaPath = `${out}P/criteria.current-two-whole-designs-corrected-four-case-material.technical-transport.md`
const json = (path: string) => JSON.parse(readFileSync(resolve(path), 'utf8'))
const sha = (path: string) => `sha256:${createHash('sha256').update(readFileSync(resolve(path))).digest('hex')}`
const write = (path: string, value: unknown) => {
  mkdirSync(dirname(resolve(path)), { recursive: true })
  writeFileSync(resolve(path), JSON.stringify(value, null, 2) + '\n')
}
const assert = (test: unknown, reason: string) => { if (!test) throw new Error(reason) }
const { fingerprintSemanticKindSourceGoal } = await import(pathToFileURL(resolve('app/scripts/goalBookModel.ts')).href)
const {
  fingerprintGoalForPositiveEvidence,
  fingerprintPositiveGoalEvidenceReviewInput,
  fingerprintPositiveGoalEvidenceProfile,
  validatePositiveGoalEvidenceRecordSemantics,
} = await import(pathToFileURL(resolve('app/scripts/positiveGoalEvidenceProfileModel.ts')).href)
const landscape = json(canonicalPath)
const oldLandscape = json(`${t}candidate/canonical539.current412.final-five-paired-V-resources.inactive.json`)
const oldLedger = json(`${t}candidate/semantic539.current412.same-science-normal-enum-own-address.json`)
const oldById = new Map(oldLandscape.goals.map((goal: any) => [goal.id, goal]))
const byId = new Map(landscape.goals.map((goal: any) => [goal.id, goal]))
const oldDecisionById = new Map(oldLedger.decisions.map((decision: any) => [decision.goalId, decision]))
for (const decision of oldLedger.decisions) {
  assert(decision.sourceFingerprint === fingerprintSemanticKindSourceGoal(oldById.get(decision.goalId)), `stale original semantic-kind decision ${decision.goalId}`)
}
const ledger = json(ledgerPath)
const refreshed: unknown[] = []
for (const decision of ledger.decisions) {
  const fresh = fingerprintSemanticKindSourceGoal(byId.get(decision.goalId))
  const old = oldDecisionById.get(decision.goalId) as any
  if (decision.goalId === rootId || ids.includes(decision.goalId) || decision.goalId === containerId) {
    refreshed.push({ goalId: decision.goalId, oldSourceFingerprint: old?.sourceFingerprint ?? null, currentSourceFingerprint: fresh,
      reason: decision.goalId === rootId ? 'Exact sole root.contains append; classification remains original programStructure.' : 'Exact unchanged newly appended whole node, classification from actual sealed original science.' })
    decision.sourceFingerprint = fresh
  } else {
    assert(decision.sourceFingerprint === fresh, `Unexpected original source fingerprint change ${decision.goalId}`)
    assert(JSON.stringify(decision) === JSON.stringify(old), `Unexpected existing semantic decision change ${decision.goalId}`)
  }
}
assert(ledger.decisions.length === 542 && new Set(ledger.decisions.map((d: any) => d.goalId)).size === 542, 'ledger coverage')
const counts: Record<string, number> = { curricularAtomic: 0, curricularArea: 0, practiceAssessment: 0, programStructure: 0, memory: 0, runtimeSupport: 0, orientation: 0, total: ledger.decisions.length }
for (const decision of ledger.decisions) counts[decision.semanticKind] += 1
assert(Object.entries(counts).every(([key, value]) => ledger.counts[key] === value), 'ledger count mismatch')
write(ledgerPath, ledger)

const originalC307Path = `${oa}P/original-two-whole-profiles.genuine-independent-a.c307-E1G1-e5d-HOLD-E0G0.review.jsonl`
const originalE5dPath = `${da}P/e5d-current-full-profile-corrected-material.genuine-independent-a.E1G1.review.jsonl`
const originals = [readFileSync(originalC307Path, 'utf8').trim().split('\n').map(JSON.parse).find((r: any) => r.goalId === ids[0]), json(originalE5dPath)]
const rows = readFileSync(reviewPath, 'utf8').trim().split('\n').map(JSON.parse)
const criteriaFingerprint = sha(criteriaPath)
const transports: unknown[] = []
const allowedChangedMetadata = ['reviewId', 'reviewCriteriaFingerprint', 'reviewInputFingerprint']
for (const [index, record] of rows.entries()) {
  const goal = byId.get(record.goalId)
  const original = originals[index]
  assert(JSON.stringify(record.profile) === JSON.stringify(original.profile), `profile body changed ${record.goalId}`)
  assert(record.goalFingerprint === fingerprintGoalForPositiveEvidence(goal, 'curricularAtomic'), `whole goal fingerprint drift ${record.goalId}`)
  assert(record.profileFingerprint === fingerprintPositiveGoalEvidenceProfile(record.profile), `whole profile fingerprint drift ${record.goalId}`)
  record.reviewCriteriaFingerprint = criteriaFingerprint
  record.reviewInputFingerprint = fingerprintPositiveGoalEvidenceReviewInput(goal, criteriaFingerprint, {}, 'curricularAtomic')
  const differences = Object.keys(record).filter((key) => JSON.stringify(record[key]) !== JSON.stringify(original[key]))
  assert(differences.every((key) => allowedChangedMetadata.includes(key)), `unapproved scientific metadata mutation ${record.goalId}: ${differences}`)
  const errors = validatePositiveGoalEvidenceRecordSemantics(record, goal, {}, 'curricularAtomic')
  assert(errors.length === 0, errors.join('\n'))
  transports.push({ goalId: record.goalId, original: { path: index === 0 ? originalC307Path : originalE5dPath, sha256: sha(index === 0 ? originalC307Path : originalE5dPath), reviewId: original.reviewId, reviewedAt: original.reviewedAt },
    originalGoalFingerprint: original.goalFingerprint, currentGoalFingerprint: record.goalFingerprint,
    originalProfileFingerprint: original.profileFingerprint, currentProfileFingerprint: record.profileFingerprint,
    originalReviewInputFingerprint: original.reviewInputFingerprint, currentReviewInputFingerprint: record.reviewInputFingerprint,
    changedMetadataFields: differences, unchangedScientificReviewerReasonDateAuthorityEvidenceAndWholeProfile: true,
    resourceDigestMap: {}, newImagesOrNativeReviewClaim: false })
}
writeFileSync(reviewPath, rows.map((r: unknown) => JSON.stringify(r)).join('\n') + '\n')
write(`${out}checks/STOCK.raw-semantic-kind-fingerprint-and-P2-selection-binding.actual.json`, {
  schemaVersion: 1, checkedAtUTC: new Date().toISOString(), role: 'technical stock fingerprint transport only',
  stockFunctions: ['goalBookModel.fingerprintSemanticKindSourceGoal', 'positiveGoalEvidenceProfileModel.fingerprintGoalForPositiveEvidence', 'positiveGoalEvidenceProfileModel.fingerprintPositiveGoalEvidenceReviewInput', 'positiveGoalEvidenceProfileModel.fingerprintPositiveGoalEvidenceProfile', 'positiveGoalEvidenceProfileModel.validatePositiveGoalEvidenceRecordSemantics'],
  original539SourceFingerprintsVerified: 539, unchangedExistingDecisionCount: 538,
  current542SourceFingerprintsVerified: 542, refreshedRootAndThreeAddedNodes: refreshed, counts,
  ledgerAddressMatchesCandidate: ledger.sourceLandscapePath === canonicalPath,
  sharedCurrentCriteria: { path: criteriaPath, sha256: criteriaFingerprint }, positiveSelection: transports,
  wholeOriginalProfileBodiesRetained: true, originalEvidenceE1G1Retained: true,
  originalMissingMaterialE0HoldHistoryUntouched: true, newScienceVotes: 0,
  noHumanApproval: true, noDOrVClosure: true, noSourceOrScopeClosure: true,
})
console.log(JSON.stringify({ status: 'PASS', counts, sourceFingerprints: 542, originalProfileBodiesRetained: 2, selectedP2: 2, originalScientificRecordsWritten: 0 }))
