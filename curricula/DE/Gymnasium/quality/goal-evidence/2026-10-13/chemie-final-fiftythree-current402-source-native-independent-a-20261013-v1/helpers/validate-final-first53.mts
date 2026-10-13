import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

// Run from app/. Reuses the unmodified stock validator; does not build anything.
const own = resolve(process.cwd(), process.argv[2]!)
const { validateGoalDescriptionReviewCampaignResultDirectories } = await import(
  pathToFileURL(resolve(process.cwd(), 'scripts/validateGoalDescriptionReviewCampaignResults.ts')).href
)
const readJson = async (p: string) => JSON.parse(await readFile(p, 'utf8'))
const results = await Promise.all(['polymer18', 'aromatics19', 'protected16'].map(async (group) => {
  const frozen = resolve(own, `inputs/frozen-author/native-${group}/round-a`)
  const [bundle, input, campaign] = await Promise.all([
    readJson(resolve(frozen, 'review-bundle-manifest.json')),
    readJson(resolve(frozen, 'description-review-input.json')),
    readJson(resolve(frozen, 'description-review-campaign.json')),
  ])
  const result = await validateGoalDescriptionReviewCampaignResultDirectories({
    bundle, input, campaign,
    batchesDirectory: resolve(frozen, 'batches'),
    resultsDirectory: resolve(own, `judgments/${group}`),
  })
  return { group, descriptionRecordCount: result.records.length, errors: result.errors }
}))
const receipt = {
  checkedAt: new Date().toISOString(),
  validator: 'unmodified app/scripts/validateGoalDescriptionReviewCampaignResults.ts',
  scope: 'Three exact frozen FIRST A campaigns; schema, run, campaign, byte, goal/page and whole current bilingual-text bindings only',
  results,
  totalDescriptionRecords: results.reduce((sum, r) => sum + r.descriptionRecordCount, 0),
  errorCount: results.reduce((sum, r) => sum + r.errors.length, 0),
  scienceClearanceClaimedByValidation: false,
  humanApprovalClaimed: false,
}
await writeFile(resolve(own, 'checks/stock-first-description-validation.actual.json'), JSON.stringify(receipt, null, 2) + '\n')
console.log(JSON.stringify(receipt))
if (receipt.errorCount) process.exitCode = 1
