// Apache-2.0. Read-only author package validation; no scientific/native approval.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { fingerprintGoalForEvidence, fingerprintGoalEvidenceProfile, fingerprintGoalEvidenceReviewInput, validateGoalEvidenceRecordSemantics } from '../../../app/scripts/goalEvidenceProfileModel'
import { fingerprintGoalForPositiveEvidence, fingerprintPositiveGoalEvidenceProfile, fingerprintPositiveGoalEvidenceReviewInput, validatePositiveGoalEvidenceRecordSemantics } from '../../../app/scripts/positiveGoalEvidenceProfileModel'
const base = 'tmp/cross-subject-requires/decimal-rounding-v4-20261013'
const read = (p: string) => JSON.parse(readFileSync(p, 'utf8'))
const digest = (p: string) => `sha256:${createHash('sha256').update(readFileSync(p)).digest('hex')}`
const canonicalJson = (value: any): string => Array.isArray(value) ? `[${value.map(canonicalJson).join(',')}]` : value && typeof value === 'object' ? `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}` : JSON.stringify(value)
const canonicalDigest = (value: any) => `sha256:${createHash('sha256').update(canonicalJson(value)).digest('hex')}`
const checkBinding = (row: any) => { assert.equal(digest(row.path), row.sha256, row.path); if (row.byteLength !== undefined) assert.equal(readFileSync(row.path).length, row.byteLength, row.path) }
const seal = read(`${base}/sealed-author-package.index.json`)
seal.files.forEach(checkBinding)
seal.retainedOriginalInputs.forEach(checkBinding)
read('tmp/cross-subject-requires/decimal-rounding-v2-20261013/sealed-author-package.index.json').files.forEach(checkBinding)
const baseline = read(`${base}/active-input-baseline.sha256.json`)
baseline.files.forEach(checkBinding)
const author = read(`${base}/goal.author-candidate.json`)
const goal = author.proposedGoal
assert.equal(goal.id, '077d5e2f-27f2-5215-9d48-fe002cf1c663')
assert.deepEqual(goal.contains, [])
assert.deepEqual(goal.requires, ['65365dce-f33f-49d8-9516-42f75883aa86'])
assert.deepEqual(goal.resourceLinks, [])
assert.equal(goal.type, 'atomic')
assert.equal(goal.weight, 1)
assert.equal(author.activationAuthorized, false)
const math = read(author.canonicalBaseline.path)
assert(!math.goals.some((g: any) => g.id === goal.id), 'Candidate must remain absent from active Mathematics.')
const retained = read(`${base}/retained-originals.sha256.json`)
retained.files.forEach(checkBinding)
const originalGoal = read('tmp/cross-subject-requires/decimal-rounding-v3-20261013/goal.author-candidate.json')
assert.deepEqual(goal, originalGoal.proposedGoal, 'V4 must preserve the complete proposed goal body.')
assert.deepEqual(author.intrinsicPreparation, originalGoal.intrinsicPreparation)
assert.deepEqual(author.alignmentRule, originalGoal.alignmentRule)
const retainedContext = read(`${base}/context-retention-and-semantic-invariants.json`)
checkBinding(retainedContext.v3PeerManifest)
checkBinding(retainedContext.v3ScientificReview)
for (const pair of retainedContext.contextCopies) { checkBinding(pair.source); checkBinding(pair.verbatimCopy); assert.equal(pair.source.sha256, pair.verbatimCopy.sha256) }
const choices = read(`${base}/retained-context/prerequisites.author-decisions.json`)
checkBinding(choices.goalAuthorArtifact)
choices.currentGoalMeaningBindings.forEach((row: any) => assert.equal(canonicalDigest(math.goals.find((g: any) => g.id === row.goalId)), row.sha256, `Current whole Math meaning changed: ${row.goalId}`))
checkBinding(read(`${base}/retained-context/atomicity-memory-kind.author-candidate.json`).goalAuthorArtifact)
const require = createRequire(resolve('app/package.json'))
const Ajv2020 = require('ajv/dist/2020').default
const addFormats = require('ajv-formats')
const ajv = new Ajv2020({ allErrors: true, strict: false })
addFormats(ajv)
const positive = read(`${base}/positive-evidence.author-candidate.jsonl`)
const description = read(`${base}/description-evidence.author-candidate.jsonl`)
for (const [row, schemaPath] of [[positive, 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'], [description, 'contracts/goal-evidence/v1/goal-evidence-profile.schema.json']] as const) {
  const validate = ajv.compile(read(schemaPath))
  assert(validate(row), JSON.stringify(validate.errors))
  assert.equal(row.goalId, goal.id)
  assert.equal(row.status, 'needs_human_review')
  assert.equal(row.reviewAuthority, 'ai_candidate')
}
const criteriaPath = 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/mathematik-positive-understanding-evidence-profile-criteria-v2.md'
assert.equal(positive.goalFingerprint, fingerprintGoalForPositiveEvidence(goal, 'curricularAtomic'))
assert.equal(positive.profileFingerprint, fingerprintPositiveGoalEvidenceProfile(positive.profile))
assert.equal(positive.reviewInputFingerprint, fingerprintPositiveGoalEvidenceReviewInput(goal, digest(criteriaPath), {}, 'curricularAtomic'))
assert.equal(description.goalFingerprint, fingerprintGoalForEvidence(goal, 'goal-evidence-v1', 'curricularAtomic'))
assert.equal(description.profileFingerprint, fingerprintGoalEvidenceProfile(description.profile, 'goal-evidence-v1'))
assert.equal(description.reviewInputFingerprint, fingerprintGoalEvidenceReviewInput(goal, 'goal-evidence-v1', {}, 'curricularAtomic'))
assert.deepEqual(validatePositiveGoalEvidenceRecordSemantics(positive as any, goal, {}, 'curricularAtomic'), [])
assert.deepEqual(validateGoalEvidenceRecordSemantics(description as any, goal, {}, 'curricularAtomic'), [])
const alteredGoal = { ...goal, title: `${goal.title} changed` }
assert.notEqual(positive.goalFingerprint, fingerprintGoalForPositiveEvidence(alteredGoal, 'curricularAtomic'), 'Changed goal must invalidate its native goal binding.')
const alteredProfile = structuredClone(positive.profile)
alteredProfile.applicationCaseBriefs[0].expectedPerformanceDe = 'Changed answer'
assert.notEqual(positive.profileFingerprint, fingerprintPositiveGoalEvidenceProfile(alteredProfile), 'Changed evidence must invalidate its native profile binding.')
const sources = read(`${base}/retained-context/source-mappings-and-placement.author-candidate.json`).sourceRefs
assert.equal(sources.length, 16)
assert.equal(new Set(sources.map((row: any) => row.jurisdiction)).size, 16)
for (const row of sources) {
  checkBinding(row.contextBinding)
  const ctx = read(row.contextBinding.path)
  checkBinding(ctx.retainedV2Context)
  checkBinding(ctx.sourcePdfBinding)
  checkBinding(ctx.sourceExtractionBinding)
  assert.equal(row.proposedMapping.matchType, 'partial')
  assert.equal(ctx.sourceRoleUnchanged, row.sourceDocument.role)
  assert.equal(ctx.all16ExactPlacementApproved, false)
  const old = read(ctx.retainedV2Context.path)
  assert.equal(canonicalDigest(old.sourceRow), ctx.exactSourceRowSha256)
  assert.equal(canonicalDigest(old.sourcePassage), ctx.exactSourcePassageSha256)
  const matchingRows: any[] = []
  const visit = (value: any) => {
    if (Array.isArray(value)) value.forEach(visit)
    else if (value && typeof value === 'object') {
      if (value.id === ctx.sourceRowId && value.sourceText !== undefined) matchingRows.push(value)
      Object.values(value).forEach(visit)
    }
  }
  visit(read(ctx.sourceExtractionBinding.path))
  assert.equal(matchingRows.length, 1, `Source row ownership must be unique: ${ctx.sourceRowId}`)
  assert.equal(canonicalDigest(matchingRows[0]), ctx.exactSourceRowSha256)
}
const routes = read(`${base}/routes-and-projections.author-candidate.json`)
routes.inputBindings.forEach(checkBinding)
routes.reports.forEach((row: any) => checkBinding({ path: row.path, sha256: row.sha256 }))
assert.equal(routes.mathematicsViewCount, 88)
assert.equal(routes.physicsViewCount, 69)
for (const row of routes.reports.filter((row: any) => row.subject === 'physik')) {
  assert.equal(row.targetSetUnchanged, true)
  assert.equal(row.visibleCompiledTreeUnchanged, true)
}
for (const value of Object.values(read(`${base}/independent-gates.pending.json`).gates) as any[]) {
  assert.equal(value.status, 'pending')
  assert.equal(value.approvalClaimed, false)
}
const oldPositive = read('tmp/cross-subject-requires/decimal-rounding-v3-20261013/positive-evidence.author-candidate.jsonl')
const oldDescription = read('tmp/cross-subject-requires/decimal-rounding-v3-20261013/description-evidence.author-candidate.jsonl')
assert.notEqual(positive.profileFingerprint, oldPositive.profileFingerprint, 'New P must carry its actual new content fingerprint.')
assert.notEqual(description.profileFingerprint, oldDescription.profileFingerprint, 'New D must carry its actual new content fingerprint.')
assert(positive.reviewId.endsWith('-v4'))
assert(description.reviewId.endsWith('-v4'))
const stemResult = JSON.parse(execFileSync(process.execPath, [resolve('app/node_modules/tsx/dist/cli.mjs'), `${base}/validate-stem-separation.ts`], { encoding: 'utf8' }))
assert.deepEqual(stemResult, read(`${base}/stem-separation.author-validation.json`), 'Re-executed actual field separation must match the sealed receipt.')
const arithmeticResult = JSON.parse(execFileSync('python3', [`${base}/validate-arithmetic.py`], { encoding: 'utf8' }))
assert.deepEqual(arithmeticResult, read(`${base}/case-arithmetic.author-validation.json`), 'Re-executed exact arithmetic must match the sealed receipt.')
assert(Object.values(arithmeticResult.rejectedStrategiesByCase).every((ids: any) => ids.length > 0))
assert.equal(read(`${base}/current-baseline-comparison.json`).pastReviewRebound, false)
assert.equal(seal.activationApproved, false)
assert.equal(seal.nativeIndependentApprovalClaimed, false)
console.log(JSON.stringify({ status: 'PASS sealed v4 author hash/schema/input/arithmetic/field-separation checks only; all independent gates pending', ownFilesBound: seal.files.length, retainedV2V3FilesUnchanged: retained.files.length, learnerStemsChecked: stemResult.bilingualInitialStems, rejectedStrategies: Object.keys(arithmeticResult.rejectedStrategiesByCase), currentInputsUnchanged: baseline.files.length, nativeRecordsChecked: 2, sourceContextsChecked: 16, currentViewReportsBound: routes.reports.length, meaningfulTamperBindingsChecked: ['goal-title', 'profile-answer'], goalRemainsInert: true }))
