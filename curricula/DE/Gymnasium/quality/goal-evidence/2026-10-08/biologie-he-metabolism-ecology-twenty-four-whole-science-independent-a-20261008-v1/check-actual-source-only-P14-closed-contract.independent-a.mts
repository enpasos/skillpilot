// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv2020 from '../../../../../../../app/node_modules/ajv/dist/2020.js'
import addFormats from '../../../../../../../app/node_modules/ajv-formats/dist/index.js'
import {
  fingerprintGoalForPositiveEvidence,
  fingerprintPositiveGoalEvidenceReviewInput,
  validatePositiveGoalEvidenceRecordSemantics,
} from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'

const own = dirname(fileURLToPath(import.meta.url))
const author = resolve(own, '../biologie-he-metabolism-ecology-twenty-four-whole-science-author-20261008-v1')
const root = resolve('.')
const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const config = read(resolve(author, 'rebase-current/P14.source-only.current.author.config.json'))
const canonical = read(resolve(root, config.landscapePath))
const wholeCases = read(resolve(author, 'whole48.material-task-model-scoring-independent-fresh-transfer.DEEN.author.json')).cases
const records = readFileSync(resolve(root, config.reviewPath), 'utf8').trim().split('\n').map(line => JSON.parse(line))
const ownFirst = read(resolve(own, 'whole24-science-source-class-AM-P.independent-a.first.verdicts.json'))
const byId = new Map(canonical.goals.map((goal: any) => [goal.id, goal]))
const ajv = new Ajv2020({ allErrors: true, strict: false })
addFormats(ajv)
const validate = ajv.compile(read(resolve(root, 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')))
assert.equal(canonical.goals.length, 476)
assert.equal(records.length, 14)
assert.equal(wholeCases.length, 48)
assert.deepEqual(config.reviewedResourceTypes, [])
const checked = []
for (const record of records) {
  const goal: any = byId.get(record.goalId)
  const judgment = ownFirst.ownJudgments.find((entry: any) => entry.goalId === record.goalId)
  assert.ok(judgment)
  assert.deepEqual(goal, judgment.wholeCurrentGoal)
  assert.ok(validate(record), ajv.errorsText(validate.errors))
  assert.equal(record.status, 'needs_human_review')
  assert.equal(record.reviewAuthority, 'ai_candidate')
  assert.equal(record.evidenceLevel, 'E1')
  assert.equal(record.maximumClaimScope, 'G1')
  assert.deepEqual(record.reviewRunIds, [])
  assert.equal(record.goalFingerprint, fingerprintGoalForPositiveEvidence(goal, 'curricularAtomic'))
  assert.equal(record.reviewInputFingerprint, fingerprintPositiveGoalEvidenceReviewInput(goal, record.reviewCriteriaFingerprint, {}, 'curricularAtomic'))
  assert.deepEqual(validatePositiveGoalEvidenceRecordSemantics(record, goal, {}, 'curricularAtomic'), [])
  const pair = wholeCases.filter((entry: any) => entry.goalId === record.goalId)
  assert.equal(pair.length, 2)
  for (const wholeCase of pair) {
    assert.deepEqual(wholeCase.wholeCurrentGoal, goal)
    assert.equal(wholeCase.evidence.performedExperiment, false)
    assert.equal(wholeCase.evidence.actualLearnerPerformance, false)
    const brief = record.profile.applicationCaseBriefs.find((entry: any) => entry.id === wholeCase.caseId)
    assert.ok(brief)
    for (const [language, suffix] of [['de', 'De'], ['en', 'En']]) {
      assert.ok(brief['taskDemand'+suffix].includes(wholeCase.material[language]))
      assert.ok(brief['taskDemand'+suffix].includes(wholeCase.task[language]))
      assert.ok(brief['taskDemand'+suffix].includes(wholeCase.freshTransfer.task[language]))
      assert.ok(brief['expectedPerformance'+suffix].includes(wholeCase.modelResponse[language]))
      assert.ok(brief['expectedPerformance'+suffix].includes(wholeCase.freshTransfer.modelResponse[language]))
    }
  }
  checked.push({ goalId: record.goalId, nativeClosedSchemaAndCurrentSourceOnlyFingerprintErrors: 0, actualCases: 2,
    ownWholeScientificPJudgment: judgment.positiveUnderstandingVerdict,
    ownWholeSourceJudgment: judgment.sourceVerdict,
    status: record.status, authority: record.reviewAuthority, reviewedRaster: false, wholeCurrentFinalApproval: false })
}
const result = { checkedAt: new Date().toISOString(), contract: 'positive-understanding-evidence-v2', checked,
  actualNativeSchemaAndSemanticsErrors: 0, sourceOnlyAuthorP14: true,
  scientificJudgmentWasGenuinelySealedBeforeThisTechnicalCheck: true,
  technicalSuccessDoesNotResolveOwnSourceOrP9Findings: true, actualRasterReview: false,
  nativeDRunClaimed: false, machineApproved: 0, humanReviewPending: 14, strictGainClaimed: 0,
  activeWrites: 0, humanApproval: false, humanTrial: false }
writeFileSync(resolve(own, 'P14-source-only-closed-native-actual-after-own-first.receipt.json'), JSON.stringify(result, null, 2)+'\n', { flag: 'wx' })
console.log(JSON.stringify({ actualNativeSourceOnlyP14Errors: 0, schema: 'positive-understanding-evidence-v2', machineApproved: 0, ownSourceAndP9HoldsPreserved: true, actualRasterReviewed: false }))
