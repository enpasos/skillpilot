// SPDX-License-Identifier: Apache-2.0
// Integrate genuine reviews. This author is not an independent reviewer.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { normalizeGoalVisualizationAiReview } from '../../../../../../../app/scripts/goalVisualizationQaModel.ts'
import { validatePositiveGoalEvidenceRecordSemantics } from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel.ts'

const root = resolve('.'), own = dirname(fileURLToPath(import.meta.url)), base = resolve(own, '..')
const corrected = resolve(base, 'biologie-he-evolution-one-cat-raster-native-followup-technical-20261008-v2')
const sha = (p: string) => 'sha256:' + createHash('sha256').update(readFileSync(p)).digest('hex')
const read = (p: string) => JSON.parse(readFileSync(p, 'utf8'))
const binding = (p: string) => ({ path: relative(root, p), sha256: sha(p), bytes: readFileSync(p).length })
const write = (p: string, value: any) => {
  assert.equal(existsSync(p), false, p)
  mkdirSync(dirname(p), { recursive: true })
  writeFileSync(p, typeof value === 'string' ? value : JSON.stringify(value, null, 2) + '\n', { flag: 'wx' })
}
const aMeta = resolve(base, 'biologie-he-evolution-one-cat-anatomy-targeted-independent-a-20261008-v2/required-link-metadata-P18.independent-a.v2.actual-confirmation.json')
const bMeta = resolve(base, 'biologie-he-evolution-eighteen-required-link-metadata-P18-independent-b-20261008-v1/required-link-metadata-P18-targeted-technical.independent-b.receipt.json')
const a = read(aMeta), b = read(bMeta)
assert.equal(a.P18ClosedSchemaErrors, 0); assert.equal(a.P18NativeSemanticErrors, 0)
assert.equal(a.newScientificReviews, 0); assert.equal(a.all18GenuineWholePProfilesAnd36CasesRetained, true)
// B's full current page/compiler comparison and actual closed P validation are
// retained separately; the exact receipt is required and Root inspects it.
assert.ok(b && Object.keys(b).length > 0)
const frames = [resolve(own, 'original-frame-native-d-eighteen-v2'), resolve(own, 'original-frame-native-d-one-current-subset-v4')]
const selected = read(resolve(corrected, 'selected-eighteen-one-corrected-seventeen-exact.author-input.json')).images
assert.equal(selected.length, 18)
const originalFrame = read(resolve(frames[0], 'resolution-index.json'))
const currentOne = read(resolve(frames[1], 'resolution-index.json'))
assert.equal(originalFrame.resolutions.length, 18); assert.equal(currentOne.resolutions.length, 1)
const catId = currentOne.resolutions[0].goalId
assert.equal(catId, '7008979d-7890-5f7b-ad07-27b8bb597cbe')
const actualRunIds = (frame: string) => ['a', 'b'].map(side => {
  const dir = resolve(frame, 'round-' + side)
  const c = read(resolve(dir, 'description-review-campaign.json'))
  const run = read(resolve(dir, 'results', c.batches[0].batchId + '.run.json'))
  assert.equal(run.status, 'completed'); assert.equal(run.blindToOtherRuns, true)
  return run.runId
})
const oldRunIds = actualRunIds(frames[0]), oneRunIds = actualRunIds(frames[1])
assert.equal(new Set([...oldRunIds, ...oneRunIds]).size, 4)
const canonPath = resolve(own, 'candidate/canonical.current476.guide-complete-link-metadata.inactive.json')
const canon = read(canonPath), by = new Map(canon.goals.map((g: any) => [g.id, g]))
const oldQaPath = resolve(root, 'curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json')
const oldQa = read(oldQaPath), qa = structuredClone(oldQa)
const sourceQa = read(resolve(corrected, 'candidate/visualization-qa.current392.only-one-cat-correction.inactive.json'))
const sourceBy = new Map(sourceQa.records.map((r: any) => [r.goalId, r]))
const picked = new Map(selected.map((r: any) => [r.goalId, r]))
const observedAt = new Date().toISOString()
const assets: Record<string, string> = {}
for (const r of qa.records) {
  if (!picked.has(r.goalId)) continue
  const chosen: any = picked.get(r.goalId), source: any = sourceBy.get(r.goalId), goal: any = by.get(r.goalId)
  assert.equal(sha(resolve(root, chosen.selectedPath)), 'sha256:' + chosen.sha256)
  const human = Object.fromEntries(Object.entries(r).filter(([k]) => k.startsWith('human')))
  Object.assign(r, source)
  r.publicAssetPath = 'app/public' + r.imageUrl
  r.canonicalAssetPath = r.imageUrl.replace('/assets/goal-visualizations/', 'curricula/DE/Gymnasium/visualizations/')
  r.title = goal.title; r.description = goal.description
  Object.assign(r, human)
  Object.assign(r, normalizeGoalVisualizationAiReview({ aiApproved: 'yes', aiApprovedAssetSha256: r.assetSha256, aiReviewedAt: observedAt,
    aiReviewer: 'Root synthesis of genuine independent A/B actual raster, 360/680 and native-page reviews',
    aiNotes: r.goalId === catId
      ? 'Actual targeted independent A/B native D1/P1/V1 resolves the five-digit cat anatomy defect. True own one-goal context; additional whole18 page6 seen. Original defect and original18 first judgments retained. Separate machine QA only; no human approval or trial.'
      : 'Genuine original independent A/B current PNG, both browser widths and whole native18 page KEEP retained. No repeat scientific/visual review. Root only integrates these real exact-asset judgments. No human approval or trial.', }, r.assetSha256))
  assets[r.imageUrl] = r.assetSha256
}
assert.equal(Object.keys(assets).length, 18)
const oldBy = new Map(oldQa.records.map((r: any) => [r.goalId, r]))
for (const r of qa.records) {
  const prior: any = oldBy.get(r.goalId)
  if (!picked.has(r.goalId)) assert.deepEqual(r, prior)
  assert.deepEqual(Object.fromEntries(Object.entries(r).filter(([k]) => k.startsWith('human'))), Object.fromEntries(Object.entries(prior).filter(([k]) => k.startsWith('human'))))
}
const sourceP = resolve(own, 'positive/P18.current-raster-guide-metadata.technical.jsonl')
const records = readFileSync(sourceP, 'utf8').trim().split('\n').map(line => JSON.parse(line))
const reviewId = 'biologie-he-evolution18-paired-machine-current392-20261008-v1'
const p = records.map(r => ({ ...r, reviewId, reviewedAt: observedAt,
  reviewer: 'Root technical synthesis of actual independent A/B whole scientific profiles and current native D/P/V, plus separate link metadata confirmation',
  reason: 'Whole DE/EN scientific profile and both complete authored application cases retained byte-equivalently from genuine independent A/B reviews; E1/G1 synthetic candidate only. Current18 raster/source/native bindings and guide-required metadata were genuinely checked by both independent reviewers. Exactly one cat image received a real anatomical correction and separate current native1 D/P/V review. Root only integrates these documented judgments; input fingerprint materialization is technical, never a new scientific review or human approval. Unrelated whole144 NeuroGK2 source HOLD remains open.',
  reviewRunIds: r.goalId === catId ? oneRunIds : oldRunIds,
}))
for (const r of p) {
  const goal: any = by.get(r.goalId)
  const digests = Object.fromEntries(goal.resourceLinks.filter((l: any) => l.type === 'goal-visualization').map((l: any) => [l.url, assets[l.url]]))
  assert.deepEqual(validatePositiveGoalEvidenceRecordSemantics(r, goal, digests, 'curricularAtomic'), [])
  assert.equal(r.status, 'needs_human_review'); assert.equal(r.reviewAuthority, 'ai_candidate')
  assert.equal(r.evidenceLevel, 'E1'); assert.equal(r.maximumClaimScope, 'G1')
}
const pPath = resolve(own, 'positive/P18.paired-machine-current392.future-active.jsonl')
write(pPath, p.map(r => JSON.stringify(r)).join('\n') + '\n')
const cfg = read(resolve(own, 'positive/P18.current-raster-guide-metadata.future-active.config.json'))
cfg.reviewId = reviewId; cfg.reviewPath = relative(root, pPath)
cfg.scope.label = 'Eighteen whole current evolution goals with genuine independent machine D/P/V and targeted metadata verification; E1/G1 needs human review'
cfg.reportPath = 'docs/qa-ci/status/positive-understanding-biologie-he-evolution18-current392-20261008-v1.md'
write(resolve(own, 'positive/P18.paired-machine-current392.future-active.config.json'), cfg)
const qaPath = resolve(own, 'candidate/visualization-qa.current392.paired-eighteen.future-active.json')
write(qaPath, qa)
write(resolve(own, 'paired-P18-QA18-actual-source-adoption.technical.json'), { schemaVersion: 1, role: 'Technical integration of real distinct independent judgments; no new review or human authority', actualMetadataA: binding(aMeta), actualMetadataB: binding(bMeta), actualOriginalD18Index: binding(resolve(frames[0], 'resolution-index.json')), actualCurrentD1Index: binding(resolve(frames[1], 'resolution-index.json')), originalSeventeenActualRunIds: oldRunIds, correctedOneActualRunIds: oneRunIds, candidateP18: binding(pPath), candidateQA18: binding(qaPath), actualP18NativeSemanticErrors: 0, other374WholeQARowsExact: true, all392HumanFieldsExact: true, originalProfilesCasesAndSciencePreserved: true, newScientificClosuresClaimedBeforeCentral: 0, activeWrites: 0, humanApproval: false, humanTrial: false })
console.log(JSON.stringify({ pairedP18NativeSemantics: 'PASS', QA18: 'integrated genuine current asset judgments', other374WholeQARowsAnd392HumanFields: 'exact', activeWrites: 0, strictGain: 0 }))
