// Apache-2.0. Reuse actual existing V decisions; no new asset-review votes.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
const root = process.cwd(), E = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12'
const O = `${E}/chemie-polymers18-current231-inactive-normal-preparation-technical-20261013-v1`, F = `${E}/chemie-polymers17-original-native-current231-inactive-adoption-root-20261013-v9`
const read = (p: string): any => JSON.parse(readFileSync(resolve(root, p), 'utf8'))
const sha = (p: string) => `sha256:${createHash('sha256').update(readFileSync(resolve(root, p))).digest('hex')}`
const api: any = await import(pathToFileURL(resolve(root, 'app/scripts/reportDeepUnderstandingRollout.ts')).href)
const q = read(`${O}/candidate/QA.current-plus-six-actualV.inactive.json`).records
const six = read(`${E}/chemie-polymers-3aef-no-melt-flow-author-successor-20261013-v4/six.resource-bindings.one-thermal-successor.json`).bindings
const v5 = read(`${E}/chemie-polymers-six-corrected-assets-V-independent-b-20261013-v4/FINAL.V6.execution-and-boundary.receipt.json`)
const v1 = read(`${E}/chemie-polymers-3aef-no-melt-flow-actual-V-independent-b-20261013-v5/FINAL.thermal-V1.execution-and-boundary.receipt.json`)
assert.equal(sha(v5.V6Records.path), v5.V6Records.sha256)
assert.equal(sha(v1.V1Record.path), v1.V1Record.sha256)
const approved = new Set([...v5.positiveAssetGoalIds, v1.goalId])
assert.deepEqual(approved, new Set(six.map((b: any) => b.goalId)))
const checks = six.map((b: any) => {
  const qa = q.find((r: any) => r.goalId === b.goalId)
  assert.ok(api.hasCompletedDeepUnderstandingVisualizationReview(qa))
  assert.equal(sha(b.actualCandidateAssetPath), qa.assetSha256)
  const record = b.goalId === v1.goalId ? v1.V1Record : v5.V6Records
  return { goalId: b.goalId, assetSha256: qa.assetSha256, actualAssetPath: b.actualCandidateAssetPath, exactQaApprovalFingerprint: sha(`${O}/candidate/QA.current-plus-six-actualV.inactive.json`), originalIndependentVRecordBinding: record, completedMachineVisualizationGate: true, freshVReviewVote: false }
})
writeFileSync(resolve(root, `${F}/checks/six-actual-original-V-machine-gates-retained.actual.json`), `${JSON.stringify({ schemaVersion: 1, normalModule: { path: 'app/scripts/reportDeepUnderstandingRollout.ts', sha256: sha('app/scripts/reportDeepUnderstandingRollout.ts') }, retainedActualPositiveDecisions: 6, priorRejectedThermalAssetStillHistorical: true, newScientificOrVisualVotes: 0, humanApproval: false, records: checks }, null, 2)}\n`)
console.log('PASS six existing genuine exact-asset V approvals using normal machine-gate export')
