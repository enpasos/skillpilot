// SPDX-License-Identifier: Apache-2.0
// Additive raw binding for one excluded historical task's cached applicability.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fingerprintCurrentCurriculumDocument as digest } from '../../../../../../app/scripts/currentCurriculumCatalog'
import { checkUnitPlanningReleases, planningReleaseFingerprint } from '../../../../../../app/scripts/checkUnitPlanningReleases'
import { buildApplicabilityCompilation } from '../../../../../../app/scripts/applicabilityCompiler'
const root = resolve(import.meta.dirname, '../../../../../..')
const base = 'curricula/DE/Gymnasium/quality/learning-units/physics-he-e1-planning-release-2026-11-24'
const read = (path: string) => JSON.parse(readFileSync(resolve(root, path), 'utf8'))
const rawDigest = (bytes: string | Buffer) => 'sha256:' + createHash('sha256').update(bytes).digest('hex')
const pin = (path: string) => ({ path, sha256: rawDigest(readFileSync(resolve(root, path))) })
const priorPath = base + '/v5-mp-retired-no-successor.scope.actual.json', prior = read(priorPath)
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
const canonical = read(canonicalPath), oldId = '2b9e565f-d9b4-5e23-b5b7-b7977cecff06'
const old = canonical.goals.find((goal: any) => goal.id === oldId)
assert(old)
assert.deepEqual(old.applicability, {})
assert.equal(old.extendedData.applicabilityProjection, 'excluded')
const historicalPath = 'curricula/DE/Gymnasium/quality/assessment-review/physik/e1-current-assessments-20261124-v1/mp-current/approved-current.goal.json'
const historical = read(historicalPath)
assert.equal(historical.applicability.jurisdiction.length, 15)
const reconstructedPrior = structuredClone(canonical)
const priorOld = reconstructedPrior.goals.find((goal: any) => goal.id === oldId)
priorOld.applicability = structuredClone(historical.applicability)
const priorCanonicalPin = prior.currentInputPins.find((row: any) => row.path === canonicalPath)
assert.equal(rawDigest(JSON.stringify(reconstructedPrior, null, 2) + '\n'), priorCanonicalPin.sha256,
  'The whole catalog differs by more than the one cached applicability field')
assert.equal(digest(priorOld), prior.historicalResult.currentGoalNormalizedSha256)
const scoredBefore = structuredClone(historical), scoredNow = structuredClone(old)
for (const goal of [scoredBefore, scoredNow]) { delete goal.extendedData; delete goal.applicability }
assert.deepEqual(scoredNow, scoredBefore)
assert.equal(old.examData.scoring.maxPoints, 30)
assert.equal(old.examData.scoring.passingPoints, 18)
assert.deepEqual(old.examData.coveredGoalIds, [])
for (const row of prior.currentInputPins.filter((row: any) => row.path !== canonicalPath)) assert.equal(pin(row.path).sha256, row.sha256)
assert.deepEqual(pin(prior.currentParentMaterial.path), prior.currentParentMaterial)
assert.deepEqual(pin(prior.unchangedChildMaterial.path), prior.unchangedChildMaterial)
for (const row of prior.heViews) assert.equal(pin(row.path).sha256, row.sha256)
for (const row of prior.removedHistoricalPlaces) assert.equal(pin(row.path).sha256, row.currentSha256)
const baselinePath = base + '/v5-archive-applicability-prior-views.actual.json', baseline = read(baselinePath)
assert.equal(baseline.canonicalRawSha256, priorCanonicalPin.sha256)
assert.equal(baseline.views.length, 90)
for (const row of baseline.views) assert.equal(pin(row.path).sha256, row.sha256)
const review = read(base + '/coverage-review.actual.json')
for (const row of review.currentGoalPayloads) assert.equal(digest(canonical.goals.find((goal: any) => goal.id === row.goalId)), row.normalizedSha256)
const material = read(prior.currentParentMaterial.path), activation = read(base + '/activation.receipt.json')
assert.deepEqual(material.unit.assessmentContract.parts, activation.requiredPartEditionDelta.after)
assert.deepEqual(material.unit.assessmentContract.planningCredits, [activation.credit])
assert.equal(planningReleaseFingerprint(material.unit, activation.credit), activation.fingerprint)
assert.deepEqual(checkUnitPlanningReleases(), [activation.fingerprint])
const app = buildApplicabilityCompilation()
const physics = app.reports.find(report => report.landscapeId === canonical.landscapeId)!
assert(physics)
assert.deepEqual(physics.goals.find(goal => goal.goalId === oldId)?.compiledApplicability, {})
assert(!physics.findings.some(finding => finding.goalId === oldId && finding.code === 'APV-203'))
console.log(JSON.stringify({ schema: 'v5-historical-MP-cached-applicability-raw-binding-successor-v1', checkedAt: new Date().toISOString(),
  status: 'PASS_SINGLE_ARCHIVE_CACHE_FIELD_ONLY_ALL_PRODUCT_MEANING_AND_VIEW_INPUTS_UNCHANGED',
  supersedesOnlyRawCatalogAndHistoricalGoalBinding: pin(priorPath),
  exactDelta: { goalId: oldId, field: '/applicability', before: historical.applicability, after: {},
    reconstructedWholePreviousCatalogSha256: priorCanonicalPin.sha256, currentCanonical: pin(canonicalPath),
    previousGoalNormalizedSha256: digest(priorOld), currentGoalNormalizedSha256: digest(old),
    previousCatalogReconstructionExact: true, allOtherCatalogFieldsEqual: true },
  historicalScoredPayload: { snapshot: pin(historicalPath), allFieldsEqualExceptExclusionMetadataAndCachedApplicability: true,
    maxPoints: 30, passingPoints: 18, coveredGoalIds: [], learnerResultsTransferredOrWritten: false },
  nativeApplicability: { compiledHistoricalGoalScope: {}, explicitHistoricalGoalScope: {}, oldAPV203Absent: true },
  unchangedInputs: { ninetyViewsByteIdentical: true, baseline: pin(baselinePath), predecessorRetirementCommit: baseline.commit,
    parentMaterial: pin(prior.currentParentMaterial.path), childMaterial: pin(prior.unchangedChildMaterial.path),
    allEighteenR2GoalPayloadsEqual: true, allFourPartRowsEqual: true, completeSingleBESCreditEqual: true,
    nativeReleaseFingerprint: activation.fingerprint, nativePlanningReleaseCheck: 'PASS',
    coverageReview: pin(base + '/coverage-review.actual.json'),
    finalMaterialReviewBinding: pin('curricula/DE/Gymnasium/quality/learning-units/physics-he-e1-materials-2026-11-24/mp-retirement-policy-20261124-v1/material-final-binding.actual.json'),
    previousFiveActualChecks: pin(base + '/v5-no-successor-final-checks.actual.json') },
  limits: 'Only a cached applicability field on an already excluded historical assessment is synchronized with the native compiler. No scored content, semantic kind, offer, view, material, author/content review, planning claim or learner outcome changes; no new reviews or broad CI results are inferred.',
  sharedFilesWritten: [] }, null, 2))
