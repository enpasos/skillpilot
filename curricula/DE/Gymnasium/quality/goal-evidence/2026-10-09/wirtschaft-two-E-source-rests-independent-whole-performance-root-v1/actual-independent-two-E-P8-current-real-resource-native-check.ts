import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { validatePositiveGoalEvidenceRecordSemantics } from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'

const here = dirname(fileURLToPath(import.meta.url))
let root = here
while (!existsSync(resolve(root, 'AGENTS.md')) || !existsSync(resolve(root, 'curricula'))) {
  const next = dirname(root)
  if (next === root) throw new Error('Repository root absent')
  root = next
}
const author = resolve(root, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-BE-two-E-source-rests-own-model-household-two-P-successors-author-v1')
const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const hash = (path: string) => createHash('sha256').update(readFileSync(path)).digest('hex')
const goals = read(resolve(author, 'inputs/whole-two-unchanged-current-goal-contracts.json'))
const records = readFileSync(resolve(author, 'whole-two-current-real-images-P8-native-bound.author-v3.jsonl'), 'utf8').trim().split('\n').map(line => JSON.parse(line))
const bindings = read(resolve(author, 'inputs/actual-current-durable-image-resource-and-review-authority.bindings.json'))
const errors: string[] = []
const checked = records.map((record: any) => {
  const goal = goals.find((g: any) => g.id === record.goalId)
  const binding = bindings.find((b: any) => b.goalId === goal.id)
  const assetHash = hash(resolve(root, binding.committableResource.path))
  if (assetHash !== binding.expectedApprovedImageSha256 || assetHash !== binding.committableResource.sha256) errors.push(`${goal.id}: reviewed image bytes drift`)
  const link = goal.resourceLinks.find((l: any) => l.type === 'goal-visualization')
  if (link.reviewStatus !== 'approved_ai') errors.push(`${goal.id}: reviewed visualization link absent`)
  const digests = { [link.url]: `sha256:${assetHash}` }
  errors.push(...validatePositiveGoalEvidenceRecordSemantics(record, goal, digests, 'curricularAtomic'))
  if (record.status !== 'needs_human_review' || record.reviewAuthority !== 'ai_candidate' || record.evidenceLevel !== 'E1' || record.maximumClaimScope !== 'G1') errors.push(`${goal.id}: untruthful machine candidate scope`)
  return { goalId: goal.id, wholeCases: record.profile.applicationCaseBriefs.length, actualAssetSha256: assetHash, nativeCurrentGoalAndProfileAndResourceFingerprintsChecked: true, liveQAClaimed: goal.id.startsWith('5b5'), newImageApprovalClaimed: false }
})
const result = { reviewer: '/root', independentFromSubstantiveAuthor: true, checked, errors, errorCount: errors.length, input: { path: 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-BE-two-E-source-rests-own-model-household-two-P-successors-author-v1/whole-two-current-real-images-P8-native-bound.author-v3.jsonl', sha256: hash(resolve(author, 'whole-two-current-real-images-P8-native-bound.author-v3.jsonl')) }, statusChanged: false, wholeSourceOrCourseApproved: false, humanApproval: false, strictGain: 0 }
writeFileSync(resolve(here, 'actual-independent-two-current-P8-native-goal-profile-and-real-resource-fingerprints.result.json'), JSON.stringify(result, null, 2) + '\n', { flag: 'wx' })
console.log(JSON.stringify({ checkedProfiles: checked.length, wholeCases: checked.reduce((a, b) => a + b.wholeCases, 0), errorCount: errors.length, strictGain: 0 }))
if (errors.length) process.exitCode = 1
