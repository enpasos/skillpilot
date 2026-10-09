// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { buildGoalBookSourceAtlasInputs } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs'
import { buildGoalBookModel, parseAndValidateGoalBookModel, stableGoalBookJson } from '../../../../../../../app/scripts/goalBookModel'
import { fingerprintGoalDescriptionReviewPage, fingerprintGoalDescriptionReviewContext } from '../../../../../../../app/scripts/validateGoalDescriptionDualRoundResolution'
import { fingerprintGoalForPositiveEvidence, fingerprintPositiveGoalEvidenceReviewInput, fingerprintPositiveGoalEvidenceProfile, validatePositiveGoalEvidenceRecordSemantics } from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'
const base = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/'
const a = base + 'biologie-evolution-three-HE-partial-edge-scope-remediation-author-v1/'
const n = base + 'biologie-evolution-current17-and-protected-contexts-native-preparation-author-v1/'
const nb = base + 'biologie-evolution-current17-and-protected-contexts-native-independent-b-v1/'
const o = base + 'biologie-evolution-HE-partial-edges-ST-sampling-independent-b-followup-v1/'
const read = (path: string): any => JSON.parse(readFileSync(path, 'utf8'))
const sha = (bytes: string | Buffer) => 'sha256:' + createHash('sha256').update(bytes).digest('hex')
const beforeConfig = read(n + 'source-atlas/atlas.inputs.book-local.inactive.json')
const afterConfig = read(a + 'candidate/source-atlas.current479-394-three-HE-partial-edges.inputs.json')
const before = buildGoalBookSourceAtlasInputs(beforeConfig, '.')
const after = buildGoalBookSourceAtlasInputs(afterConfig, '.')
assert.deepEqual(Object.keys(before.outputs).sort(), Object.keys(after.outputs).sort())
for (const x of [before, after]) {
  assert.equal(x.receipt.counts.canonicalCurricularAtomicGoals, 394)
  assert.equal(x.receipt.counts.publishedCurricularAtomicGoals, 394)
  assert.equal(x.receipt.counts.unresolvedSourceScopeDecisions, 0)
}
const changedOutputs = Object.keys(before.outputs).filter(path => before.outputs[path] !== after.outputs[path])
assert.ok(changedOutputs.every(path => path.endsWith('source-projection.receipt.json')))
const manifest = JSON.parse(after.outputs[afterConfig.manifestPath])
const entry = read(n + 'neutral-current17-and-protected-contexts.native-independent-review.final.entry.json')
const canonical = read(entry.candidateCanonicalPath)
const kinds = read(entry.candidateKindsPath)
const qa = read(entry.candidateVisualizationQAPath)
const portableQa = read(entry.portableVisualizationQAPath)
const digests: Record<string, string> = {}
for (const row of portableQa.records) if (row.visualizationState === 'available') {
  const digest = sha(readFileSync(row.publicAssetPath))
  assert.equal(digest, row.assetSha256)
  digests[row.imageUrl] = digest
}
const current = buildGoalBookModel({ landscape: canonical, semanticKindLedger: kinds,
  goalVisualizationQa: qa, goalVisualizationAssetDigests: digests,
  compositionViewManifest: manifest,
  compositionViewSources: manifest.sourcePaths.map((path: string) => ({path, view: JSON.parse(after.outputs[path])})),
  navigationView: JSON.parse(after.outputs[manifest.navigationViewPath]),
  durationModelPolicy: read(manifest.durationModelPolicyPath), evidenceReviewSources: [], config: read(entry.candidateBookConfigPath) })
parseAndValidateGoalBookModel(current)
const previous = read(entry.actualFullCandidateModelPath)
assert.equal(stableGoalBookJson(current), stableGoalBookJson(previous))
const baseline = read(entry.actualFullBeforeModelPath)
const changes = baseline.pages.filter((page: any) => stableGoalBookJson(page) !== stableGoalBookJson(current.pages.find(x => x.goalId === page.goalId))).map((page: any) => page.goalId)
assert.deepEqual(changes, entry.actualChangedPageIds)
assert.equal(changes.length, 19)
const nativeRows = ['evolution17', 'protected-source-contexts'].flatMap(selection => {
  const input = read(n + 'native-subsets/' + selection + '/round-b/description-review-input.json')
  return input.goals.map((goal: any) => {
    const beforePage = previous.pages.find((x: any) => x.goalId === goal.goalId)
    const afterPage = current.pages.find(x => x.goalId === goal.goalId)
    assert.deepEqual(beforePage, afterPage)
    const make = (page: any) => {
      const p = Object.fromEntries(Object.keys(goal.reviewContext.page).filter(k => k !== 'pageFingerprint').map(k => [k, page[k]]))
      p.pageFingerprint = fingerprintGoalDescriptionReviewPage(p as any)
      const g = {...goal, pageFingerprint:p.pageFingerprint, reviewContext:{page:p,evidenceProfile:goal.reviewContext.evidenceProfile}}
      return {pageFingerprint:p.pageFingerprint, goalReviewContextFingerprint:fingerprintGoalDescriptionReviewContext(g as any)}
    }
    assert.deepEqual(make(beforePage), make(afterPage))
    return {goalId:goal.goalId, selection, additionalNativePageChanges:0, ...make(afterPage), preserveCompletedOwnNativeReview:true}
  })
})
assert.equal(nativeRows.length, 32)
const config = read(nb + 'ordinary-P17/P17.independent-b.inactive.config.json')
const records = readFileSync(config.reviewPath, 'utf8').trim().split('\n').map(line => JSON.parse(line))
const criteria = sha(readFileSync(config.reviewCriteriaPath))
const goals = new Map<string, any>(canonical.goals.map((g: any) => [g.id,g]))
const profileRows = records.map((r: any) => {
  const goal = goals.get(r.goalId)
  const raster = entry.rasterBindings.find((x: any) => x.goalId === r.goalId)
  const resources = {[raster.resourceLinkCandidate.url]:raster.portableAlias.sha256}
  assert.equal(r.goalFingerprint, fingerprintGoalForPositiveEvidence(goal, 'curricularAtomic'))
  assert.equal(r.reviewInputFingerprint, fingerprintPositiveGoalEvidenceReviewInput(goal, criteria, resources, 'curricularAtomic'))
  assert.equal(r.profileFingerprint, fingerprintPositiveGoalEvidenceProfile(r.profile))
  assert.deepEqual(validatePositiveGoalEvidenceRecordSemantics(r, goal, resources, 'curricularAtomic'), [])
  assert.equal(r.status, 'needs_human_review')
  assert.equal(r.reviewAuthority, 'ai_candidate')
  assert.equal(r.evidenceLevel, 'E1')
  assert.equal(r.maximumClaimScope, 'G1')
  return {goalId:r.goalId, actualAdditionalFingerprintChanges:0, ordinarySemanticErrors:[]}
})
assert.equal(profileRows.length, 17)
writeFileSync(o + 'ordinary-source-atlas-whole394-native32-P17-impact.actual.json', JSON.stringify({schemaVersion:1,license:'CC-BY-4.0',actualExitCode:0,
  ordinarySourceAtlasCounts:after.receipt.counts, changedOutputPaths:changedOutputs,
  full394NormalModelExactlyEqualNativeCandidate:true, original19PageChangesExactlyRetained:true,
  protected15Union:entry.actualProtectedSourceOrPageReviewIds,
  native32NormalFingerprints:nativeRows, P17OrdinaryCurrentFingerprintAndSemanticChecks:profileRows,
  newNativePageChanges:0, newScientificStrictClosures:0, restoredStrictBindings:0,
  strictGain:0, wholeSourceApproval:false, wholeCourseApproval:false, humanApproval:false, activeWrites:0},null,2)+'\n')
console.log('PASS bounded ordinary source atlas394 / exact full model / native32 contexts / current P17 fingerprints; additional native deltas0; strict gain0')
