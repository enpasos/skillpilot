// Partial carryover only; original strict five-goal campaign stays immutable.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, resolve, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { stableGoalBookJson } from '../../../../../../../../../app/scripts/goalBookModel'
import { buildGoalDescriptionCanonicalContext } from '../../../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign'
import { validateLegacyResolutionIndexSnapshot } from '../../../../../../../../../app/scripts/reportDeepUnderstandingRollout'
const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '../../../../../../../../..')
const base = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-08-28/batch-018-e-trigonometric-final-current-5-v1'
const read = (path: string) => readFileSync(resolve(root, path), 'utf8')
const json = (path: string) => JSON.parse(read(path))
const sha = (bytes: string) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
const oldPath = `${base}/resolution-index.json`
const newPath = `${base}/resolution-index.current-carryover-4-after-b038h-v1.json`
const receiptPath = `${base}/current-carryover-4-after-b038h-v1.receipt.json`
const oldBytes = read(oldPath), original = JSON.parse(oldBytes)
const excluded = '858113c5-e53b-57bb-b01f-ba95c3ddcb6f'
assert.equal(original.schemaVersion, 2)
assert.equal(original.resolutions.length, 5)
const resolutions = original.resolutions.filter((entry: any) => entry.goalId !== excluded)
assert.equal(resolutions.length, 4)
const inputPath = `${base}/round-a/description-review-input.json`
const input = json(inputPath)
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const canonical = json(canonicalPath)
const modelPath = 'app/public/lernzielbuch/de-gym-mathematik-bundesweit.book-model.json'
const model = json(modelPath)
const headCommit = 'e1017e9f8bc2d1d9b5b9e28990445b74b33a0426'
const oldModel = JSON.parse(execFileSync('git', ['show', `${headCommit}:${modelPath}`], { cwd: root, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 }))
const proofs = resolutions.map((entry: any) => {
  const goal = canonical.goals.find((goal: any) => goal.id === entry.goalId)
  const reviewed = input.goals.find((goal: any) => goal.goalId === entry.goalId)
  const page = model.pages.find((page: any) => page.goalId === entry.goalId)
  const headPage = oldModel.pages.find((page: any) => page.goalId === entry.goalId)
  assert(goal && reviewed && page && headPage)
  assert.deepEqual([goal.title, goal.titleEn, goal.description, goal.descriptionEn],
    [reviewed.currentTitleDe, reviewed.currentTitleEn, reviewed.currentDescriptionDe, reviewed.currentDescriptionEn])
  assert.equal(stableGoalBookJson(buildGoalDescriptionCanonicalContext(goal)), stableGoalBookJson(reviewed.canonicalContext))
  assert.equal(page.goalFingerprint, reviewed.goalFingerprint)
  assert.equal(page.pageFingerprint, headPage.pageFingerprint, 'New B038 changes must not alter a retained page')
  assert.equal(sha(read(`${base}/${entry.resolutionPath}`)), entry.resolutionDigest)
  return { goalId: entry.goalId, currentGoalFingerprint: page.goalFingerprint,
    headAndCurrentAtlasPageFingerprint: page.pageFingerprint, historicalReviewPageFingerprint: reviewed.pageFingerprint,
    currentCanonicalContextFingerprint: sha(stableGoalBookJson(reviewed.canonicalContext)), resolutionDigest: entry.resolutionDigest }
})
const index = {
  schemaVersion: 1, artifactSetId: 'mathematik-b018-context-current-carryover-4-after-b038h-v1',
  subject: original.subject, semanticKind: original.semanticKind,
  strictDescriptionReviewCompleteCount: 4, curriculumAtomicDenominator: 796, descriptionReviewPercentage: 0.5,
  groups: original.groups.map((group: any) => ({ ...group, resolvedGoalCount: 4 })), resolutions,
}
assert.deepEqual(validateLegacyResolutionIndexSnapshot(index), [])
const indexBytes = JSON.stringify(index, null, 2) + '\n'
const receipt = {
  schemaVersion: 1, status: 'FILTERED_EXISTING_NATIVE_RESOLUTIONS_NOT_NEW_REVIEW',
  sourceIndexPath: oldPath, sourceIndexSha256: sha(oldBytes), newIndexPath: newPath, newIndexSha256: sha(indexBytes),
  headCommit, canonicalPath, canonicalSha256: sha(read(canonicalPath)), currentModelDigest: model.digest,
  sourceReviewInputPath: inputPath, sourceReviewInputSha256: sha(read(inputPath)),
  excludedGoalIds: [excluded], reason: 'Only 858113c5 has a newly changed reverse-prerequisite page context and must receive fresh D review; retain the other four exact-current bilingual texts/canonical contexts and unchanged HEAD-to-current atlas pages. No historical page fingerprint is rewritten.',
  nativeFormat: 'Existing aggregate/partial-group schemaVersion 1; original campaignGoalCount=5, resolvedGoalCount=4. Standalone schemaVersion 2 is intentionally not used for a partial batch.',
  proofs, nativeSnapshotErrors: [], centralRegistryChanged: false, positiveEvidenceChanged: false,
}
for (const [path, bytes] of [[newPath, indexBytes], [receiptPath, JSON.stringify(receipt, null, 2) + '\n']]) {
  const absolute = resolve(root, path)
  if (existsSync(absolute)) assert.equal(read(path), bytes, 'Immutable derived carryover differs')
  else if (process.argv.includes('--write')) writeFileSync(absolute, bytes, { flag: 'wx' })
}
assert.equal(read(oldPath), oldBytes)
console.log(JSON.stringify({ mode: process.argv.includes('--write') ? 'WRITE' : 'PREVIEW', newPath, receiptPath, retained: proofs.map(proof => proof.goalId), excluded, nativeErrors: [] }, null, 2))
