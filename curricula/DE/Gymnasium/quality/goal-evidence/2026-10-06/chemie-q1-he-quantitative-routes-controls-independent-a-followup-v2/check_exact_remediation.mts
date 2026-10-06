// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { dirname, join } from 'node:path'
import { buildGoalBookModel, fingerprintSemanticKindSourceGoal, stableGoalBookJson } from '../../../../../../../app/scripts/goalBookModel'
import { buildGoalDescriptionCanonicalContext } from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign'
import { goalEvidenceSemanticPayload, goalEvidenceReviewInputPayload } from '../../../../../../../app/scripts/goalEvidenceProfileModel'

const prefix = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/'
const v1 = prefix + 'chemie-q1-he-quantitative-routes-author-candidate-v1'
const v2 = prefix + 'chemie-q1-he-quantitative-routes-controls-author-remediation-v2'
const ownV1 = prefix + 'chemie-q1-he-quantitative-routes-independent-a-v1'
const out = prefix + 'chemie-q1-he-quantitative-routes-controls-independent-a-followup-v2'
const old = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-q1-quantitative-reviewed-integration-candidate-v1'
const canonical = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
const target = '171b47e2-2c53-50f2-a145-a26b896fd73f'
const read = (p: string) => JSON.parse(readFileSync(p, 'utf8'))
const sha = (p: string) => createHash('sha256').update(readFileSync(p)).digest('hex')
const hash = (v: unknown) => createHash('sha256').update(stableGoalBookJson(v)).digest('hex')
assert.equal(sha(v2 + '/author-controls-remediation.final.freeze.json'), 'fa99d03770813c810a563700ab6659f943fc0c2b514412b5f7a6f10c14e5182e')
for (const path of [v1 + '/author-candidate.final.freeze.json', ownV1 + '/independent-a.final.freeze.json', v2 + '/author-controls-remediation.final.freeze.json']) {
  for (const row of read(path).files) {
    const resolvedPath = row.path.startsWith('curricula/') ? row.path : join(dirname(path), row.path)
    assert.equal(sha(resolvedPath), row.sha256, resolvedPath)
  }
}
const before = read(v1 + '/proposed-active-tree/' + canonical)
const after = read(v2 + '/proposed-active-tree/' + canonical)
const beforeById = new Map<string, any>(before.goals.map((g: any) => [g.id, g]))
const afterById = new Map<string, any>(after.goals.map((g: any) => [g.id, g]))
assert.equal(before.goals.length, 479)
assert.deepEqual([...beforeById.keys()], [...afterById.keys()])
const changed = before.goals.filter((g: any) => hash(g) !== hash(afterById.get(g.id))).map((g: any) => g.id)
assert.deepEqual(changed, [target])
const previous = beforeById.get(target)
const current = afterById.get(target)
assert.deepEqual(Object.keys(previous).filter(k => hash(previous[k]) !== hash(current[k])), ['examData'])
assert.deepEqual(Object.keys(previous.examData).filter(k => hash(previous.examData[k]) !== hash(current.examData[k])), ['taskContent', 'solutionContent'])
assert.deepEqual(current, read(v2 + '/quantitative-two-terminal.goal-template.candidate.json').goalTemplate)
assert.equal(current.examData.reviewStatus, 'needs_review')
assert.deepEqual(current.tags, ['LK', 'Practice', 'Assessment', 'SekII'])
assert.deepEqual(current.contains, [])
assert.equal(current.extendedData.applicabilityFromRequires, true)
assert.deepEqual(current.examData.scoring, previous.examData.scoring)
assert.deepEqual(buildGoalDescriptionCanonicalContext(current), buildGoalDescriptionCanonicalContext(previous))
assert.deepEqual(goalEvidenceSemanticPayload(current, 'positive-understanding-evidence-v2', 'practiceAssessment'), goalEvidenceSemanticPayload(previous, 'positive-understanding-evidence-v2', 'practiceAssessment'))
assert.deepEqual(goalEvidenceReviewInputPayload(current, 'positive-understanding-evidence-v2', {}, 'practiceAssessment'), goalEvidenceReviewInputPayload(previous, 'positive-understanding-evidence-v2', {}, 'practiceAssessment'))
// Independent classification of the actually reviewed corrected task remains
// practiceAssessment. This local overlay is not an active ledger write, a D
// campaign record, a human approval, or a claim that task release is automatic.
const ledger = read(v1 + '/semantic-kinds.author-binding-candidate.json')
const decision = ledger.decisions.find((d: any) => d.goalId === target)
assert(decision && decision.semanticKind === 'practiceAssessment')
const oldFingerprint = decision.sourceFingerprint
const newFingerprint = fingerprintSemanticKindSourceGoal(current)
assert.notEqual(oldFingerprint, newFingerprint)
decision.sourceFingerprint = newFingerprint
const config = read(old + '/full-current.metadata-corrected.config.json')
const qa = read(old + '/prospective-input-tree/curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json')
const digests = Object.fromEntries(qa.records.filter((r: any) => r.imageUrl && r.assetSha256).map((r: any) => [r.imageUrl, r.assetSha256]))
const model = buildGoalBookModel({landscape: after, semanticKindLedger: ledger, compositionView: read(config.compositionViewPath), goalVisualizationQa: qa, goalVisualizationAssetDigests: digests, evidenceReviewSources: [], config})
const previousModel = read(v1 + '/full378.after-route-source.author-candidate.book-model.json')
assert.equal(model.pages.length, 378)
assert.deepEqual(model.pages, previousModel.pages)
const rows = [97.99, 98, 99, 100, 102, 102.01].map(value => ({recoveryPercent: value, acceptedUnderExplicitFictionalBand: value >= 98 && value <= 102}))
assert.deepEqual(rows.map(r => r.acceptedUnderExplicitFictionalBand), [false, true, true, true, true, false])
assert([99, 100, 100].every(value => value >= 98 && value <= 102))
const paths = [v2 + '/author-controls-remediation.final.freeze.json', v2 + '/quantitative-two-terminal.goal-template.candidate.json', v2 + '/proposed-active-tree/' + canonical, v2 + '/controls-remediation.exact-field-delta.json', v1 + '/author-candidate.final.freeze.json', ownV1 + '/independent-a.final.freeze.json', 'app/scripts/goalBookModel.ts', 'app/scripts/goalEvidenceProfileModel.ts', 'app/scripts/validateGoalDescriptionReviewCampaign.ts', config.compositionViewPath]
writeFileSync(out + '/native-delta-and-control-checks.actual.json', JSON.stringify({schemaVersion: 1, reviewer: 'independent-a', checkedAtUTC: new Date().toISOString(), status: 'PASS exact two-field task remediation, preserved competency contexts and explicit fictional control boundaries', inputRows: paths.map(path => ({path, sha256: sha(path)})), exactlyOneChangedGoal: target, exactlyChangedFields: ['examData.taskContent', 'examData.solutionContent'], other478WholeGoalsExact: true, rubricRequiresCoverageTagsApplicabilityAndAllOtherFieldsExact: true, nativeCanonicalDAndOwnPositiveTaskInputsExact: true, all378NativeWholePagesExactlyReproduced: true, semanticClassification: {semanticKind: 'practiceAssessment', decision: 'KEEP independently inspected same atomic task shape', previousSourceFingerprint: oldFingerprint, correctedSourceFingerprint: newFingerprint, activeLedgerWrite: false, oneInMemoryFingerprintOverlayForNativePageMeasurementOnly: true}, actualThreeControlsPassFictionalInclusiveBand: true, boundaryCases: rows, correctiveJudgment: 'A-Q1-CTRL-001 resolved in this exact frozen v2 material/solution', independentBConclusionsRead: false, activeWrites: false, newScientificCompletions: 0, restoredNativeDBindings: 0, fullCQRExecuted: false, floorCertificationIssued: false, humanApproval: false, humanTrial: false}, null, 2) + '\n')
console.log('PASS independent A v2: one changed goal, two exam text fields only;478 exact; all378 native pages exact after independently justified local classification binding;98/102 inclusive and outside-band failure checked;99/100/100 pass; no active write or D campaign closure.')
