// SPDX-License-Identifier: Apache-2.0
// Actual ordinary seven-page candidate; whole source/course/native approval stays pending.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, lstatSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { stableGoalBookJson } from '../../../../../../../app/scripts/goalBookModel.ts'
import { buildGoalDescriptionRolloutSubsetModel } from '../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch.ts'
import { writeGoalBookHtml, writeGoalBookPdf, writeGoalBookRenderManifest } from '../../../../../../../app/scripts/goalBookRenderer.ts'
import { buildGoalBookReviewBundle } from '../../../../../../../app/scripts/exportGoalBookReviewBundle.ts'
import { createGoalDescriptionReviewCampaignArtifacts } from '../../../../../../../app/scripts/createGoalDescriptionReviewCampaign.ts'

const root = resolve('.'), own = dirname(fileURLToPath(import.meta.url)), out = resolve(own, 'nineteen-operative-native-preparation-v2')
const cap = resolve(root, 'tmp/chemie-b008-current26-native-preparation-20261009-v1-capsule')
const rel = (path: string) => relative(root, path)
const bind = (path: string) => { assert.equal(lstatSync(path).isSymbolicLink(), false); const bytes = readFileSync(path); return { path: rel(path), sha256: 'sha256:' + createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length } }
const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const write = (path: string, value: any) => {
  assert.ok(path.startsWith(out + '/')); const bytes = Buffer.isBuffer(value) ? value : Buffer.from(typeof value === 'string' ? value : JSON.stringify(value, null, 2) + '\n')
  mkdirSync(dirname(path), { recursive: true }); if (existsSync(path)) assert.ok(readFileSync(path).equals(bytes)); else writeFileSync(path, bytes)
  return bind(path)
}
const intakePath = resolve(out, 'neutral-current-nineteen-operative-material-profile-native-intake.entry.json'), intake = read(intakePath)
assert.equal(intake.wholeProfileCount, 19); assert.equal(intake.wholeOperativeCaseCount, 38)
const pRows = readFileSync(resolve(root, intake.currentNormalPRecords.path), 'utf8').trim().split('\n').map(line => JSON.parse(line))
assert.equal(pRows.length, 19)
assert.ok(pRows.every(row => row.reviewAuthority === 'ai_candidate' && row.status === 'needs_human_review' && row.reviewRunIds.length === 0))
const fullPath = resolve(own, 'native/whole395.inactive-review-only.book-model.json'), full = read(fullPath)
assert.equal(full.pages.length, 395)
const ids: string[] = intake.goalIds, ordered = full.pages.filter((page: any) => ids.includes(page.goalId)).map((page: any) => page.goalId)
assert.equal(new Set(ordered).size, 19); assert.deepEqual([...ordered].sort(), [...ids].sort())
const batchId = 'chemie-b008-nineteen-operative-v2-native-science-candidate-20261009-v1'
const subset = buildGoalDescriptionRolloutSubsetModel({ baseModel: full, goalIds: ordered, bookId: batchId,
  title: 'Chemie: neunzehn vollständige operative Kandidatenprüfseiten' })
const native = resolve(out, 'native-nineteen'), modelPath = resolve(native, 'book-model.json'), htmlPath = resolve(native, 'book.html'), pdfPath = resolve(native, 'book.pdf')
write(modelPath, subset)
const renderOptions = { chromiumExecutablePath: '/home/enpasos/.cache/ms-playwright/chromium-1217/chrome-linux64/chrome', publicRoot: resolve(cap, 'app/public'), feedbackBaseUrl: 'https://skillpilot.com/feedback', printDerivativeProfile: 'standard' as const }
await writeGoalBookRenderManifest(await writeGoalBookHtml(subset, htmlPath, renderOptions), htmlPath + '.render-manifest.json')
const pdf = await writeGoalBookPdf(subset, pdfPath, renderOptions)
await writeGoalBookRenderManifest(pdf, pdfPath + '.render-manifest.json')
assert.equal(pdf.goalPageCount, 19)
const bundleDirectory = resolve(native, 'bundle')
const bundle = await buildGoalBookReviewBundle(subset, { modelPath, pdfPath, pdfRenderManifestPath: pdfPath + '.render-manifest.json',
  htmlPath, htmlRenderManifestPath: htmlPath + '.render-manifest.json', outputDirectory: bundleDirectory,
  promptPath: resolve(root, 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md'),
  criteriaPath: resolve(root, 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-goal-description-understanding-evidence-review-criteria-v1.md'), goalIds: ordered })
for (const file of bundle.files) write(resolve(bundleDirectory, file.relativePath), file.content)
write(resolve(bundleDirectory, 'review-bundle-manifest.json'), bundle.manifest)
const artifact = (role: string) => { const file = bundle.manifest.artifacts.find(row => row.role === role); assert.ok(file); return file }
const campaigns = []
for (const side of ['a', 'b']) {
  const directory = resolve(native, 'round-' + side)
  const result = await createGoalDescriptionReviewCampaignArtifacts({
    bundleBytes: readFileSync(resolve(bundleDirectory, 'review-bundle-manifest.json')),
    bookModelBytes: readFileSync(resolve(bundleDirectory, artifact('book_model').path)),
    reviewInputBytes: readFileSync(resolve(bundleDirectory, artifact('review_input_json').path)),
    bundleDirectory, outputDirectory: directory,
    campaignOptions: { campaignId: batchId + '-campaign-' + side, roundId: batchId + '-independent-' + side,
      reviewerRole: 'internal_ai_reviewer', reviewPass: 'first_pass', independenceGroupId: batchId + '-independent-' + side,
      blindToOtherReviews: true, batchSize: 20 } })
  assert.equal(result.campaign.batches.length, 1)
  assert.deepEqual(result.campaign.batches[0].goalIds, ordered)
  campaigns.push({ side, campaignPath: rel(resolve(directory, 'description-review-campaign.json')),
    inputPath: rel(resolve(directory, 'description-review-input.json')), batchesDirectory: rel(resolve(directory, 'batches')),
    independenceGroupId: result.campaign.independenceGroupId, genuineCurrentNativeResults: 0 })
}
const originalNative19ModelPath = resolve(own, 'native-nineteen/book-model.json'), originalNative19Model = read(originalNative19ModelPath)
assert.equal(originalNative19Model.pages.length, 19)
assert.deepEqual(subset.pages, originalNative19Model.pages, 'All nineteen goal/page/image/prerequisite contexts remain exactly the previous native frame')
const pageDeltas = subset.pages.map((page: any) => {
  const old = full.pages.find((old: any) => old.goalId === page.goalId)
  assert.ok(page.visualization)
  return { goalId: page.goalId, ordinarySubsetChangedFields: Object.keys({ ...old, ...page }).filter(key => stableGoalBookJson(old[key]) !== stableGoalBookJson(page[key])) }
})
const originalPaths = [htmlPath, pdfPath, resolve(bundleDirectory, artifact('book_html').path), resolve(bundleDirectory, artifact('book_pdf').path)]
const requestPath = resolve(out, 'four-required-native-nineteen-originals.exact-index-request.json')
write(requestPath, { schemaVersion: 1, files: originalPaths.map(bind), exactlyFourOrdinaryRequiredOriginals: true,
  noIgnoreExceptions: true, authorStagingOrCommit: false, activeWrites: [] })
const sourceDiagnosisPath = resolve(own, 'source-union-diagnosis-after-reviewedSL/neutral-current354-of395-exact-source-routes-diagnosis.entry.json')
const entryPath = resolve(out, 'neutral-current-nineteen-actual-operative-native-independent-review.entry.json')
write(entryPath, { schemaVersion: 1,
  role: 'Neutral actual ordinary Native19/P19 with thirty-eight operative whole cases and exact paired material successors; Source19/courses/views/whole scope remain open',
  goalIds: ordered, actualCurrentCanonicalNodes: 480, actualCurrentAtomics: 378, inactiveCanonicalNodes: 504, inactiveAtomics: 395,
  actualNationalBookPages: 359, nativeScopeKind: 'ordinary_canonical_cross_stage_review_only_not_source_atlas_or_course_clearance',
  currentPAndOperativeThirtyEightCaseIntake: bind(intakePath), currentWholeOperativeCases: intake.wholeOperativeCasesAndProfileBodies,
  actualFiniteElevenMaterialBindings: intake.actualElevenFiniteMaterials,
  originalWhole38CaseArchivePreserved: intake.originalWhole38CaseAndWorkedArchive,
  wholeCurrentSourcePartnerAtomicityMemoryFrame: bind(resolve(own, 'input/current-whole-source-partner-atomicity-memory-frame.neutral.json')),
  whole21BYDuties36PartnerEdges79Occurrences: bind(resolve(own, 'input/whole21-BY-source-duties36-edges79-occurrences.exact-neutral-input.json')),
  actualCurrentSourceUnionDiagnosis: bind(sourceDiagnosisPath),
  sourceUnionCurrentNormalCount: 354, expectedSourceUnionCountPreserved: 395,
  wholeCurrent378Model: bind(resolve(own, 'native/whole378.same-canonical-root.before.book-model.json')),
  fullInactive395ReviewOnlyModel: bind(fullPath), wholeProtected177SubstantiveContextDiff: bind(resolve(own, 'native/whole378-to-inactive395.substantive-page-context-deltas.actual.json')),
  currentPConfig: intake.currentNormalPConfig, currentPRecords: intake.currentNormalPRecords,
  candidateCanonical: bind(resolve(own, 'candidate/canonical504-current26-resource-links.inactive.json')),
  candidateKinds: bind(resolve(own, 'candidate/semantic-kinds.current504.technical-review-input.json')),
  candidateQA: bind(resolve(own, 'candidate/visualization-qa.current504.native-unapproved.json')),
  nativeBundle: bind(resolve(bundleDirectory, 'review-bundle-manifest.json')),
  actualNativePDF: bind(resolve(bundleDirectory, artifact('book_pdf').path)), actualNativeHTML: bind(resolve(bundleDirectory, artifact('book_html').path)),
  physicalPageMap: ordered.map((goalId: string, index: number) => ({ goalId, physicalPage1Based: pdf.frontMatterPageCount + index + 1 })),
  actualSubsetPageDeltas: pageDeltas, originalNative19Model: bind(originalNative19ModelPath),
  all19NativeGoalPageImagePrerequisiteContextsExactAgainstOriginalNative19: true,
  exactChangedThreeProfileGoalIds: intake.exactThreeProfileSuccessors,
  exactChangedFourOperativeCaseFields: intake.actualFourOrdinaryCaseFieldReplacements,
  unchanged16ScientificMaterialReviewsPreservedWithoutRestart: true,
  genuinePairedWhole19Materials: intake.genuineWholeMaterialPair, campaigns, genuineIndependentCurrentNativeReviews: 0,
  requiredNativeOriginalIndexRequest: bind(requestPath),
  goodExistingExactImagePairOnlyReusedWithoutNewVClaim: 19,
  wholeSource19Approval: false, independentCurrentNativeDPApproval: false,
  currentAtomicityAndMemoryPairingStatus: 'Separate actual independent evidence, current source/native adoption still pending',
  protectedCurrent177SubstantiveContextHolds: 8,
  sourceAtlasAndCourseViewHoldsNotResolvedByNativeCrossStagePages: true,
  noCurrentNativeApprovalOrFullM7Closure: true,
  authorOrPeerVerdictTextInNativeCampaignInput: false,
  actualPhysicalExperimentOrDigitalLearnerArtifactCertified: false,
  humanApproval: false, humanTrial: false, newScientificClosures: 0, restoredBindings: 0, netStrictGain: 0, activeWrites: [] })
console.log(JSON.stringify({ actualNativePages: 19, wholeOperativeCases: 38, currentNormalProfiles: 19,
  appliedActualCaseRemedies: 4, independentNativeReviews: 0, sourceUnion: '354/395 HOLD', requiredFourOriginals: originalPaths.map(bind),
  entry: bind(entryPath), strictGain: 0, activeWrites: 0 }))
