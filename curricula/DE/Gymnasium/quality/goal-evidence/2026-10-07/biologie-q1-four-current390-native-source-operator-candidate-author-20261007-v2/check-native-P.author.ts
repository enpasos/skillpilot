// SPDX-License-Identifier: Apache-2.0
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import Ajv2020 from '../../../../../../../app/node_modules/ajv/dist/2020.js'
import addFormats from '../../../../../../../app/node_modules/ajv-formats'
import { fingerprintGoalForPositiveEvidence, fingerprintPositiveGoalEvidenceProfile, fingerprintPositiveGoalEvidenceReviewInput, validatePositiveGoalEvidenceRecordSemantics } from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'

const own = resolve('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-q1-four-current390-native-source-operator-candidate-author-20261007-v2')
if (existsSync(resolve(own, 'author.final.freeze.json'))) throw new Error('Author v2 is sealed')
const read = (p: string) => JSON.parse(readFileSync(p, 'utf8'))
const hash = (b: Buffer) => 'sha256:' + createHash('sha256').update(b).digest('hex')
const rawPath = resolve(own, 'four-current-native-whole-goals-cases-source-review-input.author.raw.json')
const raw = read(rawPath)
const recordsPath = resolve(own, 'native/positive-four.current-author-candidate.jsonl')
const records = readFileSync(recordsPath, 'utf8').trim().split('\n').map((r) => JSON.parse(r))
const resourceDigests: Record<string, string> = {}
const resources = []
for (const row of raw.wholeFourGoals) {
  for (const link of row.wholeCandidateGoal.resourceLinks ?? []) {
    if (link.type !== 'goal-visualization') continue
    const path = resolve(own, 'selected-existing-images', row.goalId + '.png')
    resourceDigests[link.url] = hash(readFileSync(path))
    resources.push({ goalId: row.goalId, path, url: link.url, digest: resourceDigests[link.url] })
  }
}
if (Object.keys(resourceDigests).length !== 4) throw new Error('Expected four exact retained image bindings')
const inputs = read(resolve(own, 'declared-input-snapshot-index.actual.json')).inputs
const schemaRow = inputs.find((r: any) => r.originalPathAtUse === 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')
const schemaBytes = readFileSync(resolve(schemaRow.path))
const ajv = new Ajv2020({ allErrors: true, strict: true })
addFormats(ajv)
const validate = ajv.compile(JSON.parse(schemaBytes.toString('utf8')))
const errors: string[] = []
for (const record of records) {
  const row = raw.wholeFourGoals.find((r: any) => r.goalId === record.goalId)
  const goal = row.wholeCandidateGoal
  record.reviewId = 'biologie-q1-four-current390-author-candidate-20261007-v2'
  record.reviewedAt = new Date().toISOString()
  record.reviewer = 'Codex author v2; narrow case-context clarification and actual unchanged-image native binding, independent review pending'
  record.reason += record.goalId === 'ffef97e3-12d6-5090-9816-46ab9e57fae2'
    ? ' Author v2 clarifies only case2 DE/EN task contexts as a terminal excerpt of a longer enzyme gene and complete-enzyme activity. Expected answers and all other cases remain exact. Actual retained PNG bytes are bound; this is technical validation, not scientific approval.'
    : ' Author v2 preserves this whole profile exactly and binds actual retained PNG bytes. This is technical validation, not scientific approval.'
  record.goalFingerprint = fingerprintGoalForPositiveEvidence(goal, 'curricularAtomic')
  record.reviewInputFingerprint = fingerprintPositiveGoalEvidenceReviewInput(goal, record.reviewCriteriaFingerprint, resourceDigests, 'curricularAtomic')
  record.profileFingerprint = fingerprintPositiveGoalEvidenceProfile(record.profile)
  if (record.status !== 'needs_human_review' || record.reviewAuthority !== 'ai_candidate' || record.reviewRunIds.length !== 0 || record.evidenceLevel !== 'E1' || record.maximumClaimScope !== 'G1') throw new Error('Invalid author authority scope')
  errors.push(...validatePositiveGoalEvidenceRecordSemantics(record, goal, resourceDigests, 'curricularAtomic'))
  if (!validate(record)) errors.push(...(validate.errors ?? []).map((e: any) => JSON.stringify(e)))
  row.wholeNativePAuthorCandidate = record
}
if (errors.length) throw new Error(errors.join('\n'))
writeFileSync(recordsPath, records.map((r) => JSON.stringify(r)).join('\n') + '\n')
writeFileSync(rawPath, JSON.stringify(raw, null, 2) + '\n')
writeFileSync(resolve(own, 'native/positive-four.actual-resource-binding.validation.json'), JSON.stringify({ role: 'Existing frozen native schema and native semantic API check of whole current P author candidates with exact task-owned PNG bytes; no scientific approval', records: records.length, schemaDigest: hash(schemaBytes), resources, resourceDigests, linkTypeUsed: 'goal-visualization', previousWrongLinkType: 'image', previousResourceDigestCount: 0, errors, evidenceLevel: 'E1', maximumClaimScope: 'G1', status: 'needs_human_review', reviewAuthority: 'ai_candidate', reviewRunIds: [], independentPApproval: false, ownScientificApproval: false, humanApproval: false, strictGain: 0 }, null, 2) + '\n')
console.log(JSON.stringify({ nativePSchemaAndSemanticErrors: errors.length, wholeProfiles: records.length, actualUnchangedPNGBindings: resources.length, ownScientificApproval: false }))
