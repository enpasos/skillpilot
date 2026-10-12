import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import { isAiApprovedForCurrentAsset } from '../../../../../../../app/src/utils/goalVisualizationQaStatus'
import { hasCompletedDeepUnderstandingVisualizationReview } from '../../../../../../../app/scripts/reportDeepUnderstandingRollout'
const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q2-current407-e81-793-fresh-independent-a-20261012-v4'
const input = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q2-e81-793-current407-two-real-remedies-root-preparation-20261012-v4'
const qa = JSON.parse(readFileSync(resolve(own, 'V2.actual-scientific-review.qa.json'), 'utf8'))
const pending = JSON.parse(readFileSync(resolve(input, 'candidate/visualization-QA.actual-793-successor.pending.json'), 'utf8'))
const science = JSON.parse(readFileSync(resolve(input, 'neutral/two-whole-current-scientific-goals-profiles-cases-and-context.json'), 'utf8'))
const checks = qa.records.map((r: any) => {
  const before = pending.records.find((g: any) => g.goalId === r.goalId)
  const asset = science.goals.find((g: any) => g.wholeCanonicalGoal.id === r.goalId).actualImage
  const actualSha = `sha256:${createHash('sha256').update(readFileSync(asset.path)).digest('hex')}`
  const humanKeys = Object.keys(before).filter((k) => k.startsWith('human'))
  return { goalId: r.goalId, assetSha256: actualSha, exactCurrentAsset: actualSha === r.assetSha256 && actualSha === asset.sha256,
    normalAiApprovalPredicate: isAiApprovedForCurrentAsset(r), normalDeepUnderstandingVPredicate: hasCompletedDeepUnderstandingVisualizationReview(r),
    humanKeys, humanFieldsPreserved: humanKeys.every((k) => JSON.stringify(r[k]) === JSON.stringify(before[k])) }
})
const allPass = checks.length === 2 && checks.every((c: any) => c.exactCurrentAsset && c.normalAiApprovalPredicate && c.normalDeepUnderstandingVPredicate && c.humanFieldsPreserved)
writeFileSync(resolve(own, 'checks/V2-current-normal-predicates.actual.json'), `${JSON.stringify({ allPass, checks, humanApprovalClaimed: false, humanTrialClaimed: false }, null, 2)}\n`)
console.log(JSON.stringify({ allPass, count: checks.length, checks }))
if (!allPass) process.exitCode = 1
