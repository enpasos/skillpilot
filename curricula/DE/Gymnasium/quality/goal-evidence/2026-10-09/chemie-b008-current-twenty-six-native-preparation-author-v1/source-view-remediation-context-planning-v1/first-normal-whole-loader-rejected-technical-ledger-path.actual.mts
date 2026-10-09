// SPDX-License-Identifier: Apache-2.0
// Actual normal whole model comparison; EN scientific confirmation stays pending.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadGoalBookBuildInputs, stableGoalBookJson } from '../../../../../../../app/scripts/goalBookModel.ts'
const root = resolve('.'), own = dirname(fileURLToPath(import.meta.url)), out = resolve(own, 'source-view-remediation-context-planning-v1')
const cap = resolve(root, 'tmp/chemie-b008-current26-native-preparation-20261009-v1-capsule')
const read = (p: string) => JSON.parse(readFileSync(p, 'utf8'))
const bind = (p: string) => { const b = readFileSync(p); return { path: relative(root, p), sha256: 'sha256:' + createHash('sha256').update(b).digest('hex'), bytes: b.length } }
const write = (name: string, value: any) => { const p = resolve(out, name); assert.ok(!existsSync(p)); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, JSON.stringify(value, null, 2) + '\n'); return bind(p) }
const copy = (p: string) => { const target = resolve(cap, relative(root, p)); mkdirSync(dirname(target), { recursive: true }); if (existsSync(target)) assert.ok(readFileSync(p).equals(readFileSync(target))); else copyFileSync(p, target) }
const originalConfigPath = resolve(own, 'candidate/whole395.inactive-review-only.config.json'), config = read(originalConfigPath)
config.landscapePath = relative(root, resolve(own, 'source-view-remediation-author-v3/canonical504-one-faithful-redox-EN-existing-fields-kept.author-candidate.json'))
config.semanticKindLedgerPath = relative(root, resolve(own, 'source-view-remediation-author-v3/semantic-kinds504-only-actual-EN-source-binding.technical-review-input.json'))
config.outputPath = relative(root, resolve(out, 'whole395-with-one-EN-fidelity-and-pending-jurisdiction-input.review-only.book-model.json'))
const configBinding = write('whole395-with-one-EN-fidelity.review-only.config.json', config)
for (const p of [resolve(root, configBinding.path), resolve(root, config.landscapePath), resolve(root, config.semanticKindLedgerPath)]) copy(p)
const loaded = await loadGoalBookBuildInputs(configBinding.path, cap)
assert.equal(loaded.model.pages.length, 395)
const modelBinding = write('whole395-with-one-EN-fidelity-and-pending-jurisdiction-input.review-only.book-model.json', loaded.model)
const originalModelPath = resolve(own, 'native/whole395.inactive-review-only.book-model.json'), originalModel = read(originalModelPath)
const goalId = '2fdd759f-8349-5f7e-b29a-6ac7fb0299f9'
const pageDeltas = loaded.model.pages.flatMap((p: any) => { const before = originalModel.pages.find((q: any) => q.goalId === p.goalId); assert.ok(before); const fields = Object.keys({ ...before, ...p }).filter(k => stableGoalBookJson(before[k]) !== stableGoalBookJson(p[k])); return fields.length ? [{ goalId: p.goalId, changedFields: fields, wholeBeforePage: before, wholeAfterPage: p }] : [] })
assert.deepEqual(pageDeltas.map((p: any) => p.goalId), [goalId])
const centralPath = resolve(root, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/biologie-upper-science-fourteen-reviewed-integration-root-v1/checks/current-central-all-four-stable.stdout.actual.txt')
const centralText = readFileSync(centralPath, 'utf8'), central = JSON.parse(centralText.slice(centralText.indexOf('{')))
const chemistry = central.subjects.find((s: any) => s.subject === 'chemistry' || s.subject === 'chemie')
assert.ok(chemistry); assert.equal(chemistry.strictCompleteGoalIds.length, 177)
const strictIds = new Set<string>(chemistry.strictCompleteGoalIds)
assert.equal(strictIds.has(goalId), false)
assert.ok(pageDeltas.every((p: any) => !strictIds.has(p.goalId)))
const protectedPlanPath = resolve(own, 'native/whole378-to-inactive395.substantive-page-context-deltas.actual.json'), protectedPlan = read(protectedPlanPath)
assert.equal(protectedPlan.actualEightUnresolvedProtectedContextRows.length, 8)
assert.ok(protectedPlan.actualEightUnresolvedProtectedContextRows.every((p: any) => strictIds.has(p.goalId)))
const report = write('actual-protected177-eight-contexts-plus-one-nonstrict-EN-science-followup.plan.json', {
  schemaVersion: 1, normalLoader: 'loadGoalBookBuildInputs', actualCentralReport: bind(centralPath),
  actualCurrentStrictChemistry177Ids: [...strictIds].sort(), currentStrictScopeCount: 177,
  originalProtectedEightContextPlan: bind(protectedPlanPath), protectedStrictTargetedContextIds: protectedPlan.actualEightUnresolvedProtectedContextRows.map((p: any) => p.goalId),
  protectedStrictTargetedContextCountRemainsExactly8: true,
  extraNonStrictActualENSemanticFollowup: { goalId, field: 'descriptionEn',
    actualWholeDEENSourceCandidate: bind(resolve(own, 'source-view-remediation-author-v3/one-redox-whole-DEEN-fidelity-correction-and-actual-operator.author-candidate.json')),
    independentD_P_A_M_ENAndSourceOperatorContext: 'PENDING genuine targeted review',
    wholeGermanDescriptionRequiresRasterAndExistingCardBodies: 'KEEP exact valid originals; no new raster or card science fault evidenced',
    noFingerprintOnlyScientificAdoption: true },
  beforeWhole395ReviewOnlyModel: bind(originalModelPath), afterWhole395ReviewOnlyModel: modelBinding,
  normalReviewOnlyConfig: configBinding, actualWholePageDeltas: pageDeltas,
  other394WholePageObjectsExact: true, noAdditionalProtected177PageDeltaFromEN1: true,
  futureSourceJurisdictionAndAtlasPlacementNotApprovedByReviewOnlyLoader: true,
  wholeSourceCourseNativeIntegrationAndPracticalPerformanceRemainSeparateHOLD: true,
  activeWrites: [], netStrictGain: 0, humanApproval: false })
console.log(JSON.stringify({ report, fullPages: 395, protectedContextCount: 8, actualNewNonStrictENSemanticGoalCount: 1, additionalStrict177PageDeltas: 0, gain: 0 }))
