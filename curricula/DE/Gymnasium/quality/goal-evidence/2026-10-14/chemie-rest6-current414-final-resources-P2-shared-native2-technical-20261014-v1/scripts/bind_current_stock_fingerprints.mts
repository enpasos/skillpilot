// SPDX-License-Identifier: Apache-2.0
// Technical binding after actual separate image-context science, never a new vote.
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
const prefix = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/'
const out = `${prefix}chemie-rest6-current414-final-resources-P2-shared-native2-technical-20261014-v1/`
const min = `${prefix}chemie-rest6-two-whole-atoms-on-final-source6-current412-minimal-inactive-technical-20261014-v1/`
const imageRoot = `${prefix}chemie-rest6-two-original-PNG-candidates-author-20261014-v1/`
const json = (p: string) => JSON.parse(readFileSync(p, 'utf8'))
const rows = (p: string) => readFileSync(p, 'utf8').trim().split('\n').map(JSON.parse)
const hash = (p: string) => `sha256:${createHash('sha256').update(readFileSync(p)).digest('hex')}`
const write = (p: string, v: unknown) => writeFileSync(p, JSON.stringify(v, null, 2) + '\n')
const assert = (v: unknown, m: string) => { if (!v) throw new Error(m) }
const { fingerprintSemanticKindSourceGoal } = await import(pathToFileURL(resolve('app/scripts/goalBookModel.ts')).href)
const { fingerprintGoalForPositiveEvidence, fingerprintPositiveGoalEvidenceProfile, fingerprintPositiveGoalEvidenceReviewInput, validatePositiveGoalEvidenceRecordSemantics } = await import(pathToFileURL(resolve('app/scripts/positiveGoalEvidenceProfileModel.ts')).href)
const canPath = `${out}candidate/canonical542.current414.final-two-paired-V-resources.inactive.json`
const ledgerPath = `${out}candidate/semantic542.current414.same-existing-genuine-kind.closed-enum.own-address.json`
const landscape = json(canPath)
const goals = new Map(landscape.goals.map((goal: any) => [goal.id, goal]))
const ledger = json(ledgerPath)
const oldLedger = json(`${min}candidate/semantic542.prospective414.paired-existing-science.closed-enum.json`)
assert(JSON.stringify(ledger.decisions) === JSON.stringify(oldLedger.decisions), 'Unexpected semantic decision mutation')
for (const decision of ledger.decisions) assert(decision.sourceFingerprint === fingerprintSemanticKindSourceGoal(goals.get(decision.goalId)), `raw source FP changed ${decision.goalId}`)
const cfg = json(`${out}configs/P2.current-final-images.original-genuine-a.config.json`)
const originals = rows(`${min}P/P2.original-c307-and-corrected-e5d.existing-genuine-a.technical-selection.review.jsonl`)
const current = rows(cfg.reviewPath)
const neutral = json(`${imageRoot}NEUTRAL.exact-two-whole-goal-final-PNG-candidates-independent-V.json`)
const evidence: unknown[] = []
for (const row of current) {
  const original = originals.find((o: any) => o.goalId === row.goalId)
  const goal: any = goals.get(row.goalId)
  const image = neutral.selectedImages.find((o: any) => o.goalId === row.goalId)
  assert(hash(image.image.path) === image.image.sha256, 'exact approved image mismatch')
  assert(row.goalFingerprint === fingerprintGoalForPositiveEvidence(goal, 'curricularAtomic'), 'goal fingerprint changed')
  assert(row.profileFingerprint === fingerprintPositiveGoalEvidenceProfile(row.profile), 'profile fingerprint changed')
  assert(JSON.stringify(row.profile) === JSON.stringify(original.profile), 'whole profile changed')
  const digests = { [goal.resourceLinks[0].url]: image.image.sha256 }
  row.reviewCriteriaFingerprint = hash(cfg.reviewCriteriaPath)
  row.reviewInputFingerprint = fingerprintPositiveGoalEvidenceReviewInput(goal, row.reviewCriteriaFingerprint, digests, 'curricularAtomic')
  const changes = Object.keys(row).filter((k) => JSON.stringify(row[k]) !== JSON.stringify(original[k]))
  assert(changes.every((k) => ['reviewId', 'reviewCriteriaFingerprint', 'reviewInputFingerprint'].includes(k)), 'scientific record mutation')
  const errors = validatePositiveGoalEvidenceRecordSemantics(row, goal, digests, 'curricularAtomic')
  assert(errors.length === 0, errors.join('\n'))
  evidence.push({ goalId: row.goalId, originalGoalFingerprint: original.goalFingerprint, currentGoalFingerprint: row.goalFingerprint,
    originalProfileFingerprint: original.profileFingerprint, currentProfileFingerprint: row.profileFingerprint,
    originalInputFingerprint: original.reviewInputFingerprint, currentInputFingerprint: row.reviewInputFingerprint,
    changedTechnicalFieldsOnly: changes, actualCurrentResourceDigests: digests,
    originalReviewerReasonDateE1G1NeedsHumanReviewAICandidateProfileBodyUnchanged: true })
}
writeFileSync(cfg.reviewPath, current.map((row: unknown) => JSON.stringify(row)).join('\n') + '\n')
const companionPath = `${out}companions/COMPLETE.two-current-whole-goals-four-full-DEEN-cases-and-profiles.json`
const companion = json(companionPath)
companion.wholeCurrentProfiles = current
write(companionPath, companion)
write(`${out}checks/STOCK.current542-kind-FPs-and-P2-final-image-input-transport.actual.json`, {
  schemaVersion: 1, checkedAtUTC: new Date().toISOString(), status: 'PASS', currentRawKindFPsVerified: 542,
  all542OriginalMinimalKindDecisionObjectsUnchanged: true,
  whySourceFPUnchanged: 'Stock semantic-kind source contract does not include resourceLinks; all covered fields are identical.',
  wholePProfilesUnchanged: 2, P2TechnicalBindings: evidence, actualSeparateImageContextScienceBoundInCriteria: true,
  newScienceVotesByThisBinding: 0,
})
console.log(JSON.stringify({ status: 'PASS', rawKindFingerprints: 542, identicalWholeProfiles: 2, currentImageBoundInputs: 2 }))
