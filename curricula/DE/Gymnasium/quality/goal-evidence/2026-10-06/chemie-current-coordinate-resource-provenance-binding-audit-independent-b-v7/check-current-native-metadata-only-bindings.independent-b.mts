import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { stableGoalBookJson, fingerprintSemanticKindSourceGoal } from '../../../../../../../app/scripts/goalBookModel.ts'
import { buildGoalDescriptionRolloutSubsetModel } from '../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch.ts'
import { buildGoalDescriptionCanonicalContext, buildGoalDescriptionReviewInput } from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign.ts'
import { fingerprintGoalDescriptionReviewContext, fingerprintGoalDescriptionReviewPage } from '../../../../../../../app/scripts/validateGoalDescriptionDualRoundResolution.ts'
import { fingerprintGoalForPositiveEvidence, fingerprintPositiveGoalEvidenceReviewInput, fingerprintPositiveGoalEvidenceProfile, positiveGoalEvidenceReviewInputPayload } from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel.ts'

const base = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/'
const author = base + 'chemie-current-coordinate-provider-license-targeted-author-v7/'
const prior = base + 'chemie-current-aromatic-delocalization-final-native-author-v6/'
const own = base + 'chemie-current-coordinate-resource-provenance-binding-audit-independent-b-v7/'
const native = base + 'chemie-current-fifteen-description-native-reviewed-integration-v1/native-coordinate-single/'
const gid = '363c5740-8a3c-50b8-8c3a-5548c80c36ea'
const read = (p: string): any => JSON.parse(readFileSync(p, 'utf8'))
const sha = (b: Buffer | string) => 'sha256:' + createHash('sha256').update(b).digest('hex')
const equal = (a: any, b: any) => assert.equal(stableGoalBookJson(a), stableGoalBookJson(b))

const next = read(author + 'prospective-current378.canonical.metadata-only.author-candidate.json')
const prev = read(prior + 'prospective-current378.canonical.author-candidate.json')
const before = prev.goals.find((g: any) => g.id === gid), after = next.goals.find((g: any) => g.id === gid)
const oldMap = new Map(prev.goals.map((g: any) => [g.id, g]))
assert.equal(next.goals.length, 479)
assert.deepEqual(next.goals.filter((g: any) => stableGoalBookJson(g) !== stableGoalBookJson(oldMap.get(g.id))).map((g: any) => g.id), [gid])
equal({ ...after, resourceLinks: before.resourceLinks }, before)
equal({ ...after.resourceLinks[0], provider: before.resourceLinks[0].provider, license: before.resourceLinks[0].license }, before.resourceLinks[0])
const full = read(author + 'qa-artifacts/full-prospective378.book-model.json'), oldFull = read(prior + 'qa-artifacts/full-prospective378.book-model.json')
assert.equal(full.pages.length, 378)
equal(full.pages, oldFull.pages)
equal(full.navigation, oldFull.navigation)
assert.notEqual(full.source.landscapeDigest, oldFull.source.landscapeDigest)
assert.notEqual(full.digest, oldFull.digest)
const kinds = read(author + 'prospective-current378.semantic-kinds.exact-decisions.author-input.json')
equal(kinds.decisions, read(prior + 'prospective-current378.semantic-kinds.author-input.json').decisions)
for (const d of kinds.decisions) assert.equal(d.sourceFingerprint, fingerprintSemanticKindSourceGoal(next.goals.find((g: any) => g.id === d.goalId)))
const raw = read(native + 'round-b/description-review-input.json'), oldSubset = read(native + 'bundle/book-model.json')
const cfg = read(read(native + 'batch-manifest.json').configPath)
const subset = buildGoalDescriptionRolloutSubsetModel({ baseModel: full, goalIds: cfg.goalIds, bookId: cfg.bookId, title: cfg.title })
equal(subset.pages, oldSubset.pages)
equal(buildGoalDescriptionCanonicalContext(after), raw.goals[0].canonicalContext)
const rebuilt = buildGoalDescriptionReviewInput({ bundle: read(native + 'bundle/manifest.json'), reviewInput: read(native + 'bundle/review-input.json'), landscape: next })
equal(rebuilt, raw)
assert.equal(fingerprintGoalDescriptionReviewPage(subset.pages[0]), raw.goals[0].pageFingerprint)
const expected = read(author + 'actual-current-native-whole-page-context-source-raster-positive-equality.author.json')
assert.equal(fingerprintGoalDescriptionReviewContext(rebuilt.goals[0]), expected.currentReviewContextFingerprint)
const p = JSON.parse(readFileSync(author + 'positive.coordinate-one.exact-reviewed-record.jsonl', 'utf8'))
const raster = read(author + 'raw-source-metadata-audit-input.author.json').unchangedActualGeneratorRaster
const digest = sha(readFileSync(raster.path))
const resourceDigests = { [after.resourceLinks[0].url]: digest }
assert.equal(fingerprintGoalForPositiveEvidence(after, 'curricularAtomic'), p.goalFingerprint)
assert.equal(fingerprintPositiveGoalEvidenceReviewInput(after, p.reviewCriteriaFingerprint, resourceDigests, 'curricularAtomic'), p.reviewInputFingerprint)
assert.equal(fingerprintPositiveGoalEvidenceProfile(p.profile), p.profileFingerprint)
equal(positiveGoalEvidenceReviewInputPayload(after, p.reviewCriteriaFingerprint, resourceDigests, 'curricularAtomic'), positiveGoalEvidenceReviewInputPayload(before, p.reviewCriteriaFingerprint, resourceDigests, 'curricularAtomic'))
assert.equal(p.reviewAuthority, 'ai_candidate')
assert.equal(p.status, 'needs_human_review')
const protectedIds = read(base + 'chemie-current-atomic-description-positive-gap-author-v1/actual-inputs.before-native-preparation.json').protectedStrictGoalIds
const active = new Map(read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json').goals.map((g: any) => [g.id, g]))
assert.equal(protectedIds.length, 112)
for (const i of protectedIds) equal(next.goals.find((g: any) => g.id === i), active.get(i))
writeFileSync(own + 'existing-native-d-p-page-context-field-preservation.actual.independent-b.json', JSON.stringify({ schemaVersion: 1, checkedAtUTC: new Date().toISOString(), role: 'Independent technical equality check using unmodified production helpers, supplementary to actual source-metadata audit', exactlyOneWholeGoalWithExactlyTwoResourceMetadataDeltas: true, all478OtherWholeGoalsExact: true, all378NativeFullPagesExact: true, all479SemanticKindDecisionsAndCurrentFingerprintsExact: true, all112ProtectedWholeGoalsExact: true, currentDGoalFingerprint: raw.goals[0].goalFingerprint, currentDPageFingerprint: raw.goals[0].pageFingerprint, currentDContextFingerprint: fingerprintGoalDescriptionReviewContext(rebuilt.goals[0]), currentDReviewInputFingerprint: rebuilt.reviewInputFingerprint, actualCurrentNativeDWholeInputExact: true, actualCurrentSubsetWholePageExact: true, currentNativePGoalFingerprint: p.goalFingerprint, currentNativePProfileFingerprint: p.profileFingerprint, currentNativePReviewInputFingerprint: p.reviewInputFingerprint, nativePositiveInputPayloadExactlyUnchanged: true, positiveStatus: p.status, positiveAuthority: p.reviewAuthority, actualExactPNG: { ...raster, sha256: digest }, fullModelDigestBefore: oldFull.digest, fullModelDigestAfter: full.digest, fullModelSourceLandscapeDigestBefore: oldFull.source.landscapeDigest, fullModelSourceLandscapeDigestAfter: full.source.landscapeDigest, wholeCanonicalSourceAndModelProvenanceChangedTruthfully: true, noFreshFormalDOrPScienceRoundNeeded: true, existingScientificKeepsReused: true, newScientificClosures: 0, restoredActiveBindings: 0, strictNetGain: 0, activeWrites: false, humanApproval: false, humanTrial: false }, null, 2) + '\n')
console.log('PASS: two source metadata fields only; native D/Page/Context and P inputs exact; 378pages/112protected preserved; no fresh science round')
