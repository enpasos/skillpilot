// SPDX-License-Identifier: Apache-2.0
// Technical binding candidate only. Independent scientific reviews stay intact.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv2020 from '../../../../../../../app/node_modules/ajv/dist/2020.js'
import addFormats from '../../../../../../../app/node_modules/ajv-formats/dist/index.js'
import { stableGoalBookJson } from '../../../../../../../app/scripts/goalBookModel.ts'
import { buildGoalDescriptionCanonicalContext } from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign.ts'
import { fingerprintGoalForPositiveEvidence, fingerprintPositiveGoalEvidenceReviewInput, validatePositiveGoalEvidenceRecordSemantics } from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel.ts'

const root = resolve('.'), own = dirname(fileURLToPath(import.meta.url))
const base = resolve(own, '..')
const original = resolve(base, 'biologie-he-evolution-eighteen-raster-native-author-technical-20261008-v1')
const corrected = resolve(base, 'biologie-he-evolution-one-cat-raster-native-followup-technical-20261008-v2')
const sha = (v: Buffer | string) => 'sha256:' + createHash('sha256').update(v).digest('hex')
const read = (p: string) => JSON.parse(readFileSync(p, 'utf8'))
const binding = (p: string) => ({ path: relative(root, p), sha256: sha(readFileSync(p)), bytes: readFileSync(p).length })
const write = (p: string, value: any) => {
  assert.equal(existsSync(p), false, 'Never overwrite sealed inputs or previous receipts: ' + p)
  mkdirSync(dirname(p), { recursive: true })
  writeFileSync(p, typeof value === 'string' ? value : JSON.stringify(value, null, 2) + '\n', { flag: 'wx' })
}
const originalCanon = resolve(original, 'candidate/canonical.current476.actual-raster.inactive.json')
const old = read(originalCanon), next = structuredClone(old)
const ids: string[] = read(resolve(original, 'neutral-eighteen-current-raster-native-author-review.entry.json')).goalIds
const selected = new Set(ids), oldBy = new Map(old.goals.map((g: any) => [g.id, g]))
const deltas: any[] = []
for (const g of next.goals) {
  if (!selected.has(g.id)) {
    assert.deepEqual(g, oldBy.get(g.id))
    continue
  }
  const prior: any = oldBy.get(g.id)
  assert.equal(g.resourceLinks.length, 1)
  const link = g.resourceLinks[0]
  assert.equal(link.type, 'goal-visualization')
  assert.equal(link.resourceType, 'image')
  const before = structuredClone(link)
  Object.assign(link, { skillpilotId: g.id, provider: 'ChatGPT/Codex builtin image_gen', lang: 'de', license: 'CC-BY-4.0', reviewStatus: 'pilot' })
  assert.equal(fingerprintGoalForPositiveEvidence(g, 'curricularAtomic'), fingerprintGoalForPositiveEvidence(prior, 'curricularAtomic'))
  assert.deepEqual(buildGoalDescriptionCanonicalContext(g), buildGoalDescriptionCanonicalContext(prior))
  const diff = Object.keys(link).filter(k => stableGoalBookJson(link[k]) !== stableGoalBookJson(before[k]))
  assert.deepEqual(diff.sort(), ['skillpilotId', 'provider', 'lang', 'license', 'reviewStatus'].sort())
  deltas.push({ goalId: g.id, before, after: link, changedKeys: diff, wholeGoalSemanticFingerprintExact: true, DCanonicalContextExact: true, visibleTitleUrlAltTextAndImageExact: true })
}
assert.equal(deltas.length, 18)
const canonPath = resolve(own, 'candidate/canonical.current476.guide-complete-link-metadata.inactive.json')
write(canonPath, next)
const oldRowsPath = resolve(corrected, 'positive/P18.only-one-current-PNG-rebound.seventeen-lines-exact.jsonl')
const originalRows = readFileSync(oldRowsPath, 'utf8').trim().split('\n').map(line => JSON.parse(line))
const qa = read(resolve(corrected, 'candidate/visualization-qa.current392.only-one-cat-correction.inactive.json'))
const assets: Record<string, string> = Object.fromEntries(qa.records.filter((r: any) => r.visualizationState === 'available').map((r: any) => [r.imageUrl, r.assetSha256]))
const nextBy = new Map(next.goals.map((g: any) => [g.id, g]))
const ajv = new Ajv2020({ allErrors: true, strict: true }); addFormats(ajv)
const validate = ajv.compile(read(resolve(root, 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')))
const checked: any[] = []
const pRows = originalRows.map(record => {
  const goal: any = nextBy.get(record.goalId)
  const resourceDigests = Object.fromEntries(goal.resourceLinks.filter((l: any) => l.type === 'goal-visualization').map((l: any) => [l.url, assets[l.url]]))
  const row = { ...record,
    reviewInputFingerprint: fingerprintPositiveGoalEvidenceReviewInput(goal, record.reviewCriteriaFingerprint, resourceDigests, 'curricularAtomic'),
    reviewedAt: new Date().toISOString(),
    reviewer: 'Codex technical integrator of guide-required image metadata; independent targeted metadata binding verification pending',
    reason: record.reason + ' Technical metadata completion only: exact target skillpilotId, actual generator provenance, German language, own CC-BY-4.0 license and pilot status. Scientific whole DE/EN goals, profiles and complete cases remain exact. Current actual selected PNGs unchanged, including independently reviewed targeted cat correction. This is not a new scientific review or image approval; separate independent metadata/P-input confirmation remains required.',
    reviewRunIds: [],
  }
  assert.notEqual(row.reviewInputFingerprint, record.reviewInputFingerprint)
  assert.equal(row.goalFingerprint, record.goalFingerprint)
  assert.equal(row.profileFingerprint, record.profileFingerprint)
  assert.deepEqual(row.profile, record.profile)
  assert.equal(row.status, 'needs_human_review'); assert.equal(row.reviewAuthority, 'ai_candidate')
  assert.equal(row.evidenceLevel, 'E1'); assert.equal(row.maximumClaimScope, 'G1')
  assert.equal(validate(row), true, ajv.errorsText(validate.errors))
  assert.deepEqual(validatePositiveGoalEvidenceRecordSemantics(row, goal, resourceDigests, 'curricularAtomic'), [])
  checked.push({ goalId: row.goalId, originalProfileAndCasesAndScienceExact: true, oldReviewInputFingerprint: record.reviewInputFingerprint, currentReviewInputFingerprint: row.reviewInputFingerprint, resourceDigests, closedSchemaErrors: 0, nativeSemanticErrors: 0 })
  return row
})
assert.equal(pRows.length, 18)
const pPath = resolve(own, 'positive/P18.current-raster-guide-metadata.technical.jsonl')
write(pPath, pRows.map(row => JSON.stringify(row)).join('\n') + '\n')
const cfgSource = resolve(corrected, 'positive/P18.only-one-cat-current-raster.future-active.config.json')
const config = read(cfgSource)
config.reviewPath = relative(root, pPath)
write(resolve(own, 'positive/P18.current-raster-guide-metadata.future-active.config.json'), config)
const entry = { schemaVersion: 1, role: 'Neutral technical required-link-metadata/P18 binding delta, not a scientific review', originalCanonical: binding(originalCanon), candidateCanonical: binding(canonPath), oldCurrentRasterP18: binding(oldRowsPath), currentP18: binding(pPath), actualSelectedRasterQA: binding(resolve(corrected, 'candidate/visualization-qa.current392.only-one-cat-correction.inactive.json')), whole18GoalSemanticAndDCanonicalContextsExact: true, other458WholeGoalBodiesExact: true, whole18PProfilesAndThirtySixCasesExact: true, originalActualPNGsAndNativePageVisibleFieldsExact: true, actualRequiredLinkMetadataDeltas: deltas, actualPBindingChecks: checked, targetedIndependentMetadataConfirmation: 'PENDING; both original reviewers must inspect exact metadata and retained original science/P profiles before author adoption', noNewScienceReviews: true, noHashOnlyApprovalClaimed: true, independentJudgmentsCreatedByAuthor: 0, activeWrites: 0, strictGainClaimed: 0, humanApproval: false }
write(resolve(own, 'neutral-required-link-metadata-and-P18.technical.entry.json'), entry)
console.log(JSON.stringify({ technicalMetadata18: 'candidate', whole18ScienceProfilesExact: true, other458WholeBodiesExact: true, actualNativeP18Errors: 0, independentTargetedMetadataConfirmation: 'pending', activeWrites: 0 }))
