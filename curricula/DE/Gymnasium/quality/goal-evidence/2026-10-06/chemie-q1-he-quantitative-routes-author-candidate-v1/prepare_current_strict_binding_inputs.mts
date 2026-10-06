// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { buildGoalBookModel, stableGoalBookJson } from '../../../../../../../app/scripts/goalBookModel'
import { buildGoalDescriptionCanonicalContext } from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign'
import { goalEvidenceReviewInputPayload, goalEvidenceSemanticPayload } from '../../../../../../../app/scripts/goalEvidenceProfileModel'

const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-q1-he-quantitative-routes-author-candidate-v1'
const old = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-q1-quantitative-reviewed-integration-candidate-v1'
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
const ledgerPath = 'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
const qaPath = 'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'
const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const hash = (value: any) => createHash('sha256').update(stableGoalBookJson(value)).digest('hex')
const sha = (path: string) => createHash('sha256').update(readFileSync(path)).digest('hex')
const write = (name: string, value: any) => writeFileSync(own + '/' + name, JSON.stringify(value, null, 2) + '\n', {flag: 'wx'})
const baseline = read(own + '/current-376-inputs.freeze.json')
for (const row of baseline.files) assert.equal(sha(row.path), row.sha256, row.path)
const current = read(canonicalPath), candidate = read(own + '/proposed-active-tree/' + canonicalPath)
const currentById = new Map<string, any>(current.goals.map((g: any) => [g.id, g]))
const candidateById = new Map<string, any>(candidate.goals.map((g: any) => [g.id, g]))
const currentQA = read(qaPath), candidateQA = read(old + '/prospective-input-tree/' + qaPath)
const digests = (qa: any) => Object.fromEntries(qa.records.filter((r: any) => r.imageUrl && r.assetSha256).map((r: any) => [r.imageUrl, r.assetSha256]))
const currentDigests = digests(currentQA), candidateDigests = digests(candidateQA)
const config = read(old + '/full-current.metadata-corrected.config.json')
const currentModel = buildGoalBookModel({landscape: current, compositionView: read(config.compositionViewPath), semanticKindLedger: read(ledgerPath), goalVisualizationQa: currentQA, goalVisualizationAssetDigests: currentDigests, evidenceReviewSources: [], config})
const candidateModel = read(own + '/full378.after-route-source.author-candidate.book-model.json')
const reviewedModel = buildGoalBookModel({landscape: read(old + '/prospective-input-tree/' + canonicalPath), compositionView: read(config.compositionViewPath), semanticKindLedger: read(old + '/prospective-input-tree/' + ledgerPath), goalVisualizationQa: candidateQA, goalVisualizationAssetDigests: candidateDigests, evidenceReviewSources: [], config})
assert.equal(currentModel.pages.length, 376)
assert.equal(candidateModel.pages.length, 378)
const currentPages = new Map<string, any>(currentModel.pages.map((p: any) => [p.goalId, p]))
const candidatePages = new Map<string, any>(candidateModel.pages.map((p: any) => [p.goalId, p]))
const reviewedPages = new Map<string, any>(reviewedModel.pages.map((p: any) => [p.goalId, p]))
const strictIds = read('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-biologie-ni-quantitative-integration-v1/stable-checkpoint-four-subject-central.stdout.txt').subjects.find((s: any) => s.subject === 'chemie').strictCompleteGoalIds
assert.equal(strictIds.length, 104)
const affectedRows: any[] = [], unchangedIds: string[] = [], live376ToReviewed378PriorDeltaRows: any[] = []
for (const id of strictIds) {
  const goal = currentById.get(id), nextGoal = candidateById.get(id)
  assert.deepEqual(nextGoal, goal, id)
  const context = buildGoalDescriptionCanonicalContext(goal), nextContext = buildGoalDescriptionCanonicalContext(nextGoal)
  assert.deepEqual(nextContext, context, id)
  const semantic = goalEvidenceSemanticPayload(goal, 'positive-understanding-evidence-v2', 'curricularAtomic'), nextSemantic = goalEvidenceSemanticPayload(nextGoal, 'positive-understanding-evidence-v2', 'curricularAtomic')
  const pInput = goalEvidenceReviewInputPayload(goal, 'positive-understanding-evidence-v2', currentDigests, 'curricularAtomic'), nextPInput = goalEvidenceReviewInputPayload(nextGoal, 'positive-understanding-evidence-v2', candidateDigests, 'curricularAtomic')
  assert.deepEqual(nextSemantic, semantic, id)
  assert.deepEqual(nextPInput, pInput, id)
  const livePage = currentPages.get(id), beforePage = reviewedPages.get(id), afterPage = candidatePages.get(id)
  assert(beforePage && afterPage)
  const priorFields = [...new Set([...Object.keys(livePage), ...Object.keys(beforePage)])].filter(key => hash(livePage[key]) !== hash(beforePage[key]))
  if (priorFields.length) live376ToReviewed378PriorDeltaRows.push({goalId: id, changedFields: priorFields, live376PageFingerprint: livePage.pageFingerprint, reviewed378PageFingerprint: beforePage.pageFingerprint, liveWholePageSHA256: hash(livePage), reviewedWholePageSHA256: hash(beforePage), attribution: 'preserved reviewed quantitative split and global page/reference numbering; separate from this new route candidate; historical reviews not repeated or relabeled'})
  const fields = [...new Set([...Object.keys(beforePage), ...Object.keys(afterPage)])].filter(key => hash(beforePage[key]) !== hash(afterPage[key]))
  if (!fields.length) {unchangedIds.push(id); continue}
  assert.deepEqual([...fields].sort(), ['externalReverseRequires', 'pageFingerprint'])
  const unchangedPage = Object.fromEntries(Object.entries(beforePage).filter(([key]) => !fields.includes(key)))
  assert.deepEqual(unchangedPage, Object.fromEntries(Object.entries(afterPage).filter(([key]) => !fields.includes(key))))
  const backlinkDeltas = ['reverseRequires', 'externalReverseRequires'].filter(field => fields.includes(field)).map(field => ({field,
    removed: beforePage[field].filter((ref: any) => !afterPage[field].some((next: any) => hash(next) === hash(ref))),
    added: afterPage[field].filter((ref: any) => !beforePage[field].some((previous: any) => hash(previous) === hash(ref)))}))
  affectedRows.push({goalId: id, currentTitleDe: goal.title, currentTitleEn: goal.titleEn, currentDescriptionDe: goal.description, currentDescriptionEn: goal.descriptionEn,
    unchangedWholeGoalSHA256: hash(goal), unchangedCanonicalContext: context, unchangedCanonicalContextSHA256: hash(context), unchangedOwnPositiveSemantic: semantic, unchangedOwnPositiveSemanticSHA256: hash(semantic), unchangedOwnPositiveReviewInput: pInput, unchangedOwnPositiveReviewInputSHA256: hash(pInput),
    changedFields: fields, live376Page: livePage, beforeReviewed378Page: beforePage, afterRoute378Page: afterPage, live376ToReviewed378ChangedFields: priorFields, beforeReviewed378WholePageSHA256: hash(beforePage), afterRoute378WholePageSHA256: hash(afterPage), beforeReviewed378PageFingerprint: beforePage.pageFingerprint, afterRoute378PageFingerprint: afterPage.pageFingerprint,
    visibleDependentBacklinkDeltas: backlinkDeltas, competenceAndOwnPBindingsUnchanged: true, allOtherWholePageFieldsExact: true, twoIndependentCurrentDContextReviewsRequired: true, status: 'pending independent A/B binding review; no current D closure is asserted'})
}
const earlier = read(own + '/native-pages-d-p-source-route-footprint.actual.json').actualAffectedCurrent104StrictDPageGoalIds
assert.deepEqual(affectedRows.map(row => row.goalId).sort(), [...earlier].sort())
assert.equal(affectedRows.length, 34)
assert.equal(unchangedIds.length, 70)
write('34-current-strict-d-binding-inputs.author-frozen.json', {schemaVersion: 1, documentType: 'inactive-targeted-current-strict-description-binding-inputs', checkedAtUTC: new Date().toISOString(), status: 'author-frozen exact live376, preserved reviewed378 and route378 input; independent A/B current-context decisions pending',
  currentCanonicalSHA256: sha(canonicalPath), candidateCanonicalSHA256: sha(own + '/proposed-active-tree/' + canonicalPath), currentLedgerSHA256: sha(ledgerPath), currentQASHA256: sha(qaPath), candidateLedgerSHA256: sha(own + '/semantic-kinds.author-binding-candidate.json'), candidateQASHA256: sha(old + '/prospective-input-tree/' + qaPath),
  currentStrictGoalIds: strictIds, unchanged70WholeGoalCanonicalDPAndReviewed378ToRoute378PageGoalIds: unchangedIds, affectedCurrentStrictCount: affectedRows.length, unchangedCompetenceAndOwnPositiveEvidenceForAll104: true, perGoalLiveReviewedAndRoutePageInputs: affectedRows, live376ToReviewed378PriorDeltaRows,
  newScientificCompletions: 0, restoredBindings: 0, strict104PreservationAfterIntegrationNotYetCertified: true, humanApproval: false, humanTrial: false, activeWrites: false,
  reviewInstruction: 'Check the new reviewed378-to-route378 visible terminal backlink delta and its task/source/profile meaning for each of the34 IDs. The separate live376-to-reviewed378 deltas belong to the preserved407-file predecessor, including its quantitative split and global page numbering; inspect the actual previous valid evidence instead of restarting historical reviews. Preserve exact descriptions, positive profiles and images. Determine current D context acceptability independently; do not issue new science or human approval for exact text/P/image fields.'})
write('live376.current-strict-binding-input.book-model.json', currentModel)
console.log('PASS author-frozen three-state input: all104 live WholeGoals and own canonical D/P bindings exact; reviewed378-to-route378 changes exactly34 native pages only in terminal backlinks/pageFingerprint, other70 reviewed378 pages exact. Prior live376-to-reviewed378 split/pagination deltas recorded separately. Independent A/B current D decisions pending.')
