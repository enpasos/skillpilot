import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { validatePositiveGoalEvidenceRecordSemantics } from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'

const base = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/'
const out = `${base}wirtschaft-BE-two-gaps-f0-and-Berlin-BB2-independent-bounded-need-P-AM-M-review-20261009-v1`
const manifest = JSON.parse(readFileSync(`${base}wirtschaft-BE-source124-explicit-course-new20-BB2-and-f0-author-final-integrated-handoff-v1/actual-exact-author-inputs-immutability-manifest.json`, 'utf8'))
const goals = JSON.parse(readFileSync(manifest.wholeNew20GoalsIncludingExpandedF0.path, 'utf8'))
const records = readFileSync(manifest.wholeThreeNewProfilesSixCasesNativeCurrent.path, 'utf8').trim().split('\n').map(line => JSON.parse(line))
const rows = records.map(record => ({
  goalId: record.goalId,
  errors: validatePositiveGoalEvidenceRecordSemantics(record, goals.find((goal: { id: string }) => goal.id === record.goalId), {}, 'curricularAtomic'),
  hypotheticalAuthorClassificationOnly: true,
  actualProfileCases: record.profile.applicationCaseBriefs.length,
}))
const result = {
  createdAt: new Date().toISOString(),
  reviewer: '/root/economics_be20_independent_need_review',
  role: 'independent targeted native model validation of exact inert records; no semantic approval',
  nativeFunction: 'validatePositiveGoalEvidenceRecordSemantics',
  nativeModelPath: 'app/scripts/positiveGoalEvidenceProfileModel.ts',
  nativeModelSha256: `sha256:${createHash('sha256').update(readFileSync('app/scripts/positiveGoalEvidenceProfileModel.ts')).digest('hex')}`,
  rows,
  allErrorCountsZero: rows.every(row => row.errors.length === 0),
  classification: 'Explicit hypothetical curricularAtomic proposal, not an active semantic-kind or source-course decision',
  liveWrites: 0,
  finalVisualContextBindingApproval: false,
  humanApproval: false,
  strictGain: 0,
}
writeFileSync(`${out}/actual-independent-targeted-three-record-native-model-validation.receipt.json`, `${JSON.stringify(result, null, 2)}\n`)
console.log(JSON.stringify(result))
if (!result.allErrorCountsZero) process.exitCode = 1
