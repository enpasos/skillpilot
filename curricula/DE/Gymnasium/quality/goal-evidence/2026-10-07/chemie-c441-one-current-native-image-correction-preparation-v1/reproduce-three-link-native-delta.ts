import { readFileSync, existsSync, writeFileSync, renameSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import { buildGoalBookModel, fingerprintSemanticKindSourceGoal, stableGoalBookJson } from '../../../../../../../app/scripts/goalBookModel.ts'
import { fingerprintGoalForEvidence, fingerprintGoalEvidenceReviewInput } from '../../../../../../../app/scripts/goalEvidenceProfileModel.ts'
import { buildGoalDescriptionCanonicalContext } from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign.ts'

const OUT = resolve(process.cwd(), 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-c441-one-current-native-image-correction-preparation-v1')
const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const digest = (data: Buffer | string) => 'sha256:' + createHash('sha256').update(data).digest('hex')
const beforePath = resolve(OUT, 'three-link-delta-readonly/canonical.before-three-links.json')
const afterPath = resolve(OUT, 'three-link-delta-readonly/canonical.after-three-links.before-c441-import.json')
const qaPath = resolve(OUT, 'three-link-delta-readonly/qa.historical-before-negative-findings.json')
const before = read(beforePath)
const after = read(afterPath)
const qa = read(qaPath)
const digests: Record<string, string> = {}
const assets: Array<Record<string, unknown>> = []
for (const row of qa.records) {
  if (row.visualizationState !== 'available') continue
  let path = row.publicAssetPath
  let historicalArchive = false
  if (!existsSync(path)) {
    path = 'curricula/DE/Gymnasium/quality/goal-visualization-review/chemie-three-current-evidenced-quality-holds-20261007-v1/assets/' + row.goalId + '/' + row.goalId + '.jpg'
    historicalArchive = true
  }
  const bytes = readFileSync(path)
  digests[row.imageUrl] = digest(bytes)
  if (digests[row.imageUrl] !== row.assetSha256) throw new Error('Actual byte / historical QA digest mismatch for ' + row.goalId)
  assets.push({ goalId: row.goalId, imageUrl: row.imageUrl, path, sha256: digest(bytes).slice(7), bytes: bytes.length, historicalArchive })
}
const cfg = read(resolve(OUT, 'full-current378.book.config.json'))
cfg.goalVisualizationQaPath = qaPath
const input = {
  compositionView: read(cfg.compositionViewPath),
  semanticKindLedger: read(cfg.semanticKindLedgerPath),
  goalVisualizationQa: qa,
  goalVisualizationAssetDigests: digests,
  evidenceReviewSources: [],
  config: cfg,
}
const oldModel = buildGoalBookModel({ ...input, landscape: before })
const newModel = buildGoalBookModel({ ...input, landscape: after })
const oldPages = new Map(oldModel.pages.map((page: any) => [page.goalId, page]))
const changedPages = newModel.pages.filter((page: any) => stableGoalBookJson(page) !== stableGoalBookJson(oldPages.get(page.goalId))).map((page: any) => page.goalId)
const oldGoals = new Map(before.goals.map((goal: any) => [goal.id, goal]))
const kindChanges: string[] = []
const goalChanges: string[] = []
const contextChanges: string[] = []
const positiveInputChanges: string[] = []
for (const goal of after.goals) {
  const old: any = oldGoals.get(goal.id)
  if (fingerprintSemanticKindSourceGoal(old) !== fingerprintSemanticKindSourceGoal(goal)) kindChanges.push(goal.id)
  if (fingerprintGoalForEvidence(old, 'goal-evidence-v1', 'curricularAtomic') !== fingerprintGoalForEvidence(goal, 'goal-evidence-v1', 'curricularAtomic')) goalChanges.push(goal.id)
  if (stableGoalBookJson(buildGoalDescriptionCanonicalContext(old)) !== stableGoalBookJson(buildGoalDescriptionCanonicalContext(goal))) contextChanges.push(goal.id)
  if (fingerprintGoalEvidenceReviewInput(old, 'goal-evidence-v1', digests, 'curricularAtomic') !== fingerprintGoalEvidenceReviewInput(goal, 'goal-evidence-v1', digests, 'curricularAtomic')) positiveInputChanges.push(goal.id)
}
const expected = ['0bf26276-2780-506c-ac34-35dd44a29409', 'a44af1fa-5988-5b7d-b206-691c6bbf7dd4', '9751b6d8-cde3-527b-b37c-babb6cee79d2'].sort()
if (JSON.stringify([...changedPages].sort()) !== JSON.stringify(expected)) throw new Error('Unexpected native page delta')
if (JSON.stringify([...positiveInputChanges].sort()) !== JSON.stringify(expected)) throw new Error('Unexpected P input delta')
if (oldModel.pages.length !== 378 || newModel.pages.length !== 378 || kindChanges.length || goalChanges.length || contextChanges.length) throw new Error('Unexpected scope or semantic/context delta')
const result = {
  documentType: 'isolated read-only native three-image-link removal delta proof',
  technicalOnly: true,
  limitation: 'Both in-memory models use the same historical pre-negative QA and explicitly archived removed rasters. This is not current serving, image approval, source-superset, D/P science, human approval, or M7 completion evidence.',
  beforeSnapshotSha256: digest(readFileSync(beforePath)).slice(7),
  afterSnapshotSha256: digest(readFileSync(afterPath)).slice(7),
  historicalQaSha256: digest(readFileSync(qaPath)).slice(7),
  wholeGoals: after.goals.length,
  beforePages: oldModel.pages.length,
  afterPages: newModel.pages.length,
  changedPages,
  unchangedPages: newModel.pages.length - changedPages.length,
  semanticKindFingerprintChanges: kindChanges,
  evidenceGoalFingerprintChanges: goalChanges,
  canonicalDescriptionContextChanges: contextChanges,
  positiveReviewInputFingerprintChanges: positiveInputChanges,
  unchangedC441OwnPage: stableGoalBookJson(oldPages.get('c441d9e8-d9d9-5e55-a189-a37345541321')) === stableGoalBookJson(newModel.pages.find((page: any) => page.goalId === 'c441d9e8-d9d9-5e55-a189-a37345541321')),
  canonicalDeltaIsOnlyThreeResourceLinkRemovals: true,
  unchangedWholeCanonicalGoals: 476,
  externalDeckAndViewHistoryNotRevalidatedByThisDeltaProof: true,
  actualAssetInputCount: assets.length,
  historicalArchiveInputGoalIds: assets.filter((asset) => asset.historicalArchive).map((asset) => asset.goalId),
  beforeBookModelDigest: oldModel.digest,
  afterBookModelDigest: newModel.digest,
}
const publish = (path: string, value: unknown) => {
  const tmp = path + '.tmp'
  writeFileSync(tmp, JSON.stringify(value, null, 2) + '\n')
  renameSync(tmp, path)
}
publish(resolve(OUT, 'three-link-delta-readonly/actual-byte-bound-asset-inputs.json'), { documentType: 'actual image bytes used only for historical controlled delta', assets })
publish(resolve(OUT, 'three-link-delta-readonly/native-three-link-delta.actual.receipt.json'), result)
console.log(JSON.stringify(result, null, 2))
