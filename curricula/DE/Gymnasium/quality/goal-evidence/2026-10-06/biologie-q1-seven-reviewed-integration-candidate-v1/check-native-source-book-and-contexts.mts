import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { buildGoalBookSourceAtlasInputs, compactGoalBookSourceAtlasReceipt } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs'
import { buildGoalBookModel, loadGoalBookBuildInputs, stableGoalBookJson } from '../../../../../../../app/scripts/goalBookModel'
import { buildGoalDescriptionCanonicalContext } from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign'
import { fingerprintGoalForPositiveEvidence, fingerprintPositiveGoalEvidenceReviewInput } from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'

const repo = resolve('.')
const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-seven-reviewed-integration-candidate-v1'
const prepared = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-seven-final-native-review-inputs-author-v1'
const read = (path: string): any => JSON.parse(readFileSync(resolve(repo, path), 'utf8'))
const same = (a: unknown, b: unknown) => stableGoalBookJson(a) === stableGoalBookJson(b)
const binding = (path: string) => { const b = readFileSync(resolve(repo, path)); return { path, sha256: createHash('sha256').update(b).digest('hex'), bytes: b.length } }
const raw = read(own + '/canonical-390.integration-candidate.json')
const semantic = read(own + '/semantic-kinds-390.integration-candidate.json')
const config = read(prepared + '/inputs/source-atlas-390.config.json')
config.landscapePath = own + '/canonical-390.integration-candidate.json'
config.semanticKindLedgerPath = own + '/semantic-kinds-390.integration-candidate.json'
const atlas = buildGoalBookSourceAtlasInputs(config, repo)
const bookConfigPath = 'app/scripts/config/goal-books/de-gym-biology-national-atlas.json'
const current = await loadGoalBookBuildInputs(bookConfigPath, repo)
const bookConfig = read(bookConfigPath)
bookConfig.landscapePath = own + '/canonical-390.integration-candidate.json'
bookConfig.semanticKindLedgerPath = own + '/semantic-kinds-390.integration-candidate.json'
const qa = read(prepared + '/inputs/visualization-qa.full-390.candidate.json')
const amInputs = read(prepared + '/inputs/atomicity-memory-native-review-inputs.pending.json')
const positiveInputs = read(prepared + '/inputs/positive-review-inputs.native-fingerprints.pending.json')
const currentRaw = read(current.config.landscapePath)
const currentQA = read(current.config.goalVisualizationQaPath)
const resourceDigests: Record<string, string> = {}
for (const record of currentQA.records) {
  if (record.imageUrl && record.publicAssetPath) resourceDigests[record.imageUrl] = 'sha256:' + binding(record.publicAssetPath).sha256
}
for (const row of positiveInputs.rows) Object.assign(resourceDigests, row.resourceDigests)
const manifest = JSON.parse(atlas.outputs[bookConfig.compositionViewManifestPath])
const model = buildGoalBookModel({
  landscape: raw, semanticKindLedger: semantic,
  compositionViewManifest: manifest,
  compositionViewSources: manifest.sourcePaths.map((path: string) => ({ path, view: JSON.parse(atlas.outputs[path]) })),
  navigationView: JSON.parse(atlas.outputs[manifest.navigationViewPath]),
  durationModelPolicy: read(config.durationModelPolicyPath),
  goalVisualizationQa: qa, goalVisualizationAssetDigests: resourceDigests,
  evidenceReviewSources: [], config: bookConfig,
})
const beforeGoals = new Map(currentRaw.goals.map((g: any) => [g.id, g]))
const afterGoals = new Map(raw.goals.map((g: any) => [g.id, g]))
const afterPages = new Map(model.pages.map(p => [p.goalId, p]))
const oldRows = current.model.pages.map((page: any) => {
  const after = afterPages.get(page.goalId)!
  return { goalId: page.goalId, wholeGoalExact: same(beforeGoals.get(page.goalId), afterGoals.get(page.goalId)), goalFingerprintExact: page.goalFingerprint === after.goalFingerprint, pageFingerprintExact: page.pageFingerprint === after.pageFingerprint }
})
if (current.model.pages.length !== 383 || model.pages.length !== 390 || oldRows.some(r => !r.wholeGoalExact || !r.goalFingerprintExact || !r.pageFingerprintExact)) throw new Error('Old native goal/page protection failed')
const finalPageRows = amInputs.rows.map((row: any) => {
  const after: any = afterGoals.get(row.goalId)
  const page = afterPages.get(row.goalId)!
  const positive = positiveInputs.rows.find((r: any) => r.goalId === row.goalId)
  const previous = read(prepared + '/qa-artifacts/full-390.book-model.json').pages.find((p: any) => p.goalId === row.goalId)
  const contextsExact = same(buildGoalDescriptionCanonicalContext(row.wholeCurrentCandidateGoal), buildGoalDescriptionCanonicalContext(after))
  const goalFingerprintExact = fingerprintGoalForPositiveEvidence(after, 'curricularAtomic') === positive.goalFingerprint
  const positiveInputExact = fingerprintPositiveGoalEvidenceReviewInput(after, positive.reviewCriteriaFingerprint, positive.resourceDigests, 'curricularAtomic') === positive.reviewInputFingerprint
  if (!contextsExact || !goalFingerprintExact || !positiveInputExact || page.pageFingerprint !== previous.pageFingerprint) throw new Error('Final goal binding changed ' + row.goalId)
  return { goalId: row.goalId, authorCandidateMetadataOnlyRemoved: true, actualNativeDContextExact: contextsExact, actualNativePFingerprintExact: goalFingerprintExact, actualNativePInputExact: positiveInputExact, full390PageFingerprintExact: true, imageBytesAndLinksExact: same(row.wholeCurrentCandidateGoal.resourceLinks, after.resourceLinks) }
})
writeFileSync(resolve(repo, own + '/qa-artifacts/source-atlas-390.metadata-final.actual.json'), JSON.stringify(compactGoalBookSourceAtlasReceipt(atlas.receipt), null, 2) + '\n')
writeFileSync(resolve(repo, own + '/qa-artifacts/native-book-source-and-context-preservation.actual.json'), JSON.stringify({
  schemaVersion: 1, createdAtUTC: new Date().toISOString(), role: 'actual native source/book/D-context/P-input verification of candidate metadata cleanup; no review replacement',
  sourceConfig: config, actualSourceCount: atlas.receipt.counts, omittedGoals: atlas.receipt.omittedGoals,
  currentPages: current.model.pages.length, candidatePages: model.pages.length, currentDigest: current.model.digest, candidateDigest: model.digest,
  old383WholeGoalAndPageRows: oldRows, exactSevenFinalNativeInputs: finalPageRows,
  inputs: [binding(own + '/canonical-390.integration-candidate.json'), binding(own + '/semantic-kinds-390.integration-candidate.json'), binding(prepared + '/inputs/visualization-qa.full-390.candidate.json')],
  fullPDFBuilt: false, activeWrites: false, strictGain: 0, humanApproval: false, humanTrial: false,
}, null, 2) + '\n')
console.log(JSON.stringify({ source: 'PASS390', bookPages: [current.model.pages.length, model.pages.length], old383Exact: true, newSevenDContextsPInputsAndFullPagesExact: true, activeWrites: false }))
