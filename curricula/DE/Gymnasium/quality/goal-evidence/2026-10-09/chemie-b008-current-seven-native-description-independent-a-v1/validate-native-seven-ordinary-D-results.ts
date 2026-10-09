import { readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import { validateGoalDescriptionReviewCampaignResultDirectories } from '/home/enpasos/projects/skillpilot/app/scripts/validateGoalDescriptionReviewCampaignResults'

const base = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09'
const native = `${base}/chemie-b008-current-twenty-six-native-preparation-author-v1/seven-operative-native-preparation-v2/native-seven`
const own = `${base}/chemie-b008-current-seven-native-description-independent-a-v1`
const paths = {
  bundle: `${native}/round-a/review-bundle-manifest.json`,
  input: `${native}/round-a/description-review-input.json`,
  campaign: `${native}/round-a/description-review-campaign.json`,
  batchesDirectory: `${native}/round-a/batches`,
  resultsDirectory: `${own}/results`,
}
const readJson = async (path: string) => JSON.parse(await readFile(resolve(path), 'utf8'))
const main = async () => {
const startedAt = new Date().toISOString()
const result = await validateGoalDescriptionReviewCampaignResultDirectories({
  bundle: await readJson(paths.bundle),
  input: await readJson(paths.input),
  campaign: await readJson(paths.campaign),
  batchesDirectory: resolve(paths.batchesDirectory),
  resultsDirectory: resolve(paths.resultsDirectory),
})
const recordsPath = `${paths.resultsDirectory}/chemie-b008-seven-operative-v2-native-science-candidate-20261009-v1-independent-a.batch-001.records.jsonl`
const bytes = await readFile(resolve(recordsPath))
const summary = {
  schemaVersion: 1,
  role: 'Actual ordinary validateGoalDescriptionReviewCampaignResultDirectories execution; field and exact binding checks after immutable independent D first',
  startedAt,
  completedAt: new Date().toISOString(),
  validator: 'app/scripts/validateGoalDescriptionReviewCampaignResults.ts#validateGoalDescriptionReviewCampaignResultDirectories',
  paths,
  errors: result.errors,
  records: result.records.length,
  goalIds: result.records.map(({ goalId }) => goalId),
  decisions: result.records.map(({ goalId, decision }) => ({ goalId, decision })),
  recordsSha256: `sha256:${createHash('sha256').update(bytes).digest('hex')}`,
  humanApproval: false,
  humanTrial: false,
  sourceCourseNativePVisualGateApproval: false,
  strictGain: 0,
}
await writeFile(resolve(`${own}/native-seven-description.ordinary-campaign-results.validation.json`), `${JSON.stringify(summary, null, 2)}\n`, { flag: 'wx' })
console.log(JSON.stringify(summary, null, 2))
if (result.errors.length) process.exitCode = 1
}
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
