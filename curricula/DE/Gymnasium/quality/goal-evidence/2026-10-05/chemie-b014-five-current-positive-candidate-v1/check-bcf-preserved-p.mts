// Apache-2.0. Read-only native verification of an unchanged accepted P profile.
import { readFile, writeFile } from 'node:fs/promises'
import { reviewPositiveGoalEvidenceConfig } from '../../../../../../../app/scripts/positiveGoalEvidenceReview.ts'
const originalConfig = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-redox-one-current-reviewed-p-v1/positive-evidence.config.json'
const result = reviewPositiveGoalEvidenceConfig(originalConfig)
if (result.errors.length) throw new Error(result.errors.join('\n'))
if (result.records.length !== 1 || result.records[0].goalId !== 'bcf8b24b-3eed-4a36-8fb3-d6bffc1e193a') throw new Error('Unexpected existing P scope')
const own = new URL('.', import.meta.url)
const profiles = (await readFile(new URL('positive-evidence.review.jsonl', own), 'utf8')).trim().split('\n').map(line => JSON.parse(line))
const model = JSON.parse(await readFile(new URL('../chemie-b014-five-prospective-book-current-v1/native-finalbook/bundle/book-model.json', own), 'utf8'))
for (const profile of profiles) {
  const page = model.pages.find((p: any) => p.goalId === profile.goalId)
  if (!page || page.goalFingerprint !== profile.goalFingerprint) throw new Error(`P/final-D goal binding mismatch ${profile.goalId}`)
}
const receipt = { status: 'pass_native_exact_future_inputs', unchangedBcfPConfig: originalConfig, unchangedBcfGoalFingerprint: result.records[0].goalFingerprint, unchangedBcfProfileFingerprint: result.records[0].profileFingerprint, existingProfileRewritten: false, existingScientificReviewRepeated: false, newAuthorCandidateCount: profiles.length, allFiveGoalFingerprintsMatchFrozenFinalDModel: true, independentNewPReviewPending: true, humanApprovalClaimed: false, strictNetGain: 0 }
await writeFile(new URL('bcf-preserved-p-and-final-five-bindings.actual.receipt.json', own), JSON.stringify(receipt, null, 2) + '\n')
console.log(JSON.stringify(receipt))
