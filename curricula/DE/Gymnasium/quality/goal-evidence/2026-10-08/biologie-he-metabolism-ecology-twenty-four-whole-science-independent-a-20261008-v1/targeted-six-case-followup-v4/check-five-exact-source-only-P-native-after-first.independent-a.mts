// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import Ajv2020 from '../../../../../../../../app/node_modules/ajv/dist/2020.js'
import addFormats from '../../../../../../../../app/node_modules/ajv-formats/dist/index.js'
import { buildPositiveGoalEvidenceCandidateRecords } from '../../../../../../../../app/scripts/materializePositiveGoalEvidenceCandidates'
import { reviewPositiveGoalEvidenceConfig, type PositiveGoalEvidenceReviewConfig } from '../../../../../../../../app/scripts/positiveGoalEvidenceReview'
import { validatePositiveGoalEvidenceRecordSemantics } from '../../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'

const own = dirname(fileURLToPath(import.meta.url))
const root = resolve(own, '../../../../../../../../')
const author = resolve(own, '../../biologie-he-metabolism-ecology-six-case-targeted-remediation-author-root-20261008-v4')
const original = resolve(own, '../../biologie-he-metabolism-ecology-twenty-four-whole-science-author-20261008-v1')
const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const pin = (path: string) => {
  const raw = readFileSync(path)
  return { path: relative(root, path), sha256: createHash('sha256').update(raw).digest('hex'), bytes: raw.length }
}
const put = (name: string, value: unknown) => writeFileSync(resolve(own, name), JSON.stringify(value, null, 2)+'\n', { flag: 'wx' })
const firstPath = resolve(own, 'six-whole-case-five-profile-followup.independent-a.first.freeze.json')
assert.equal(pin(firstPath).sha256, 'cff6af833694799329b32865bd3af1760fde568acfeeb9c611ef085007896c12')
for (const file of read(firstPath).ownFiles) assert.deepEqual(pin(resolve(root, file.path)), file)
const ownVerdict = read(resolve(own, 'whole-six-case-five-profile-genuine-scientific-followup.independent-a.first.verdicts.json'))
const candidate24 = read(resolve(author, 'P24.five-targeted-profile-only.remediation.author.candidates.json'))
const wholeCases = read(resolve(author, 'whole48.six-targeted-case-only.remediation.author.json')).cases
const scopeIds = ownVerdict.genuineWholeProfileVerdicts.map((row: any) => row.goalId)
const candidates = {
  ...candidate24,
  reviewId: 'biologie-he-metabolism-ecology-five-source-only-native-independent-a-followup-20261008-v4',
  reviewer: 'Independent A technical materialization of exactly five Root v4 author profiles after genuine scientific first seal; no raster/native D/V approval',
  goals: candidate24.goals.filter((goal: any) => scopeIds.includes(goal.goalId)),
}
assert.equal(candidates.goals.length, 5)
for (const goal of candidates.goals) {
  assert.deepEqual(goal.profile, candidate24.goals.find((row: any) => row.goalId === goal.goalId).profile)
  assert.equal(ownVerdict.genuineWholeProfileVerdicts.find((row: any) => row.goalId === goal.goalId).positiveWholeGoalScience, 'KEEP_SCIENTIFIC_E1_G1_CANDIDATE')
}
const base = read(resolve(original, 'rebase-current/P14.source-only.current.author.config.json'))
const config: PositiveGoalEvidenceReviewConfig = {
  ...base,
  reviewId: candidates.reviewId,
  reviewPath: relative(root, resolve(own, 'P5.current-source-only.actual-native.review.jsonl')),
  scope: {
    label: 'Exactly five corrected author profiles; source-only closed native binding check after genuine scientific A seal, optional source roles still open, no raster D/V or strict closure',
    goalIds: candidates.goals.map((goal: any) => goal.goalId),
  },
}
assert.deepEqual(config.reviewedResourceTypes, [])
assert.equal(config.requireApproved, false)
const canonical = read(resolve(root, config.landscapePath))
const goals = new Map(canonical.goals.map((goal: any) => [goal.id, goal]))
assert.equal(canonical.goals.length, 476)
const records = await buildPositiveGoalEvidenceCandidateRecords({ config, candidateSet: candidates })
assert.equal(records.length, 5)
const ajv = new Ajv2020({ allErrors: true, strict: false })
addFormats(ajv)
const validate = ajv.compile(read(resolve(root, 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')))
const checked = []
for (const record of records) {
  const goal: any = goals.get(record.goalId)
  assert.ok(validate(record), ajv.errorsText(validate.errors))
  assert.deepEqual(validatePositiveGoalEvidenceRecordSemantics(record, goal, {}, 'curricularAtomic'), [])
  assert.equal(record.status, 'needs_human_review')
  assert.equal(record.reviewAuthority, 'ai_candidate')
  assert.equal(record.evidenceLevel, 'E1')
  assert.equal(record.maximumClaimScope, 'G1')
  assert.deepEqual(record.reviewRunIds, [])
  assert.deepEqual(record.profile, candidate24.goals.find((row: any) => row.goalId === record.goalId).profile)
  const pair = wholeCases.filter((row: any) => row.goalId === record.goalId)
  assert.equal(pair.length, 2)
  for (const wholeCase of pair) {
    assert.deepEqual(wholeCase.wholeCurrentGoal, goal)
    assert.equal(wholeCase.evidence.performedExperiment, false)
    assert.equal(wholeCase.evidence.actualLearnerPerformance, false)
    const brief = record.profile.applicationCaseBriefs.find((row: any) => row.id === wholeCase.caseId)
    assert.ok(brief)
    for (const [language, suffix] of [['de', 'De'], ['en', 'En']]) {
      for (const content of [wholeCase.material[language], wholeCase.task[language], wholeCase.freshTransfer.task[language]]) {
        assert.ok(brief['taskDemand'+suffix].includes(content))
      }
      for (const content of [wholeCase.modelResponse[language], wholeCase.freshTransfer.modelResponse[language]]) {
        assert.ok(brief['expectedPerformance'+suffix].includes(content))
      }
    }
  }
  checked.push({ goalId: record.goalId, actualClosedSchemaAndNativeSourceOnlySemanticsErrors: 0,
    completeDEENCaseCount: 2, profileExactlyRootV4: true,
    independentScientificFirstVerdict: ownVerdict.genuineWholeProfileVerdicts.find((row: any) => row.goalId === record.goalId).positiveWholeGoalScience,
    originalSourceVerdictPreserved: ownVerdict.genuineWholeProfileVerdicts.find((row: any) => row.goalId === record.goalId).sourceVerdictUnchanged,
    status: record.status, authority: record.reviewAuthority, rasterApproval: false, wholeCurrentFinalApproval: false })
}
put('P5.exact-Root-v4-profiles.filtered-native-candidates.independent-a.json', candidates)
put('P5.current-source-only.actual-native.config.json', config)
writeFileSync(resolve(own, 'P5.current-source-only.actual-native.review.jsonl'), records.map(record => JSON.stringify(record)).join('\n')+'\n', { flag: 'wx' })
const configPath = relative(root, resolve(own, 'P5.current-source-only.actual-native.config.json'))
const publicApi = reviewPositiveGoalEvidenceConfig(configPath)
assert.deepEqual(publicApi.errors, [])
assert.equal(publicApi.counts.approved, 0)
assert.equal(publicApi.counts.needsHumanReview, 5)
const inputPaths = [firstPath,
  resolve(author, 'six-case-only-remediation.author.first-input.freeze.json'),
  resolve(author, 'P24.five-targeted-profile-only.remediation.author.candidates.json'),
  resolve(author, 'whole48.six-targeted-case-only.remediation.author.json'),
  resolve(root, config.landscapePath), resolve(root, config.semanticKindLedgerPath), resolve(root, config.reviewCriteriaPath),
  resolve(root, 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'),
  resolve(root, 'contracts/goal-evidence/v2/goal-evidence-review-config.schema.json'),
  resolve(root, 'app/scripts/materializePositiveGoalEvidenceCandidates.ts'),
  resolve(root, 'app/scripts/positiveGoalEvidenceReview.ts'),
  resolve(root, 'app/scripts/positiveGoalEvidenceProfileModel.ts'),
]
const ignore = spawnSync('git', ['check-ignore', '--no-index', ...inputPaths.map(path => relative(root, path))], { cwd: root, encoding: 'utf8' })
assert.equal(ignore.status, 1)
assert.equal(ignore.stdout.trim(), '')
put('P5.source-only-closed-native-actual-after-science-first.independent-a.receipt.json', {
  schemaVersion: 1, checkedAt: new Date().toISOString(),
  genuineScientificFirstSeal: pin(firstPath), exactRequiredInputBindings: inputPaths.map(pin),
  checked, nativeMaterializerErrors: 0, actualPublicNativeReviewApiErrors: publicApi.errors,
  statusCounts: publicApi.counts, reviewedResourceTypes: [],
  sourceOnlyTechnicalCheck: true, actualRasterApproval: false, nativeD_VReviewClaimed: false,
  exactRootV4ProfileBodiesRetained: true, historicalP14Unmodified: true,
  gitCheckIgnoreActual: { exitCode: ignore.status, stdout: ignore.stdout, stderr: ignore.stderr, ignoredInputs: 0 },
  peerCurrentBRead: false, activeWrites: 0, machineApproved: 0, strictGainClaimed: 0,
  humanApproval: false, humanTrial: false,
})
console.log(JSON.stringify({ actualNativeP5Errors: 0, schema: 'positive-understanding-evidence-v2',
  needsHumanReview: 5, approved: 0, sourceOnly: true, actualRasterReview: false,
  originalSourceAndCompoundHoldsPreserved: true, independentOwnScienceFirstSealUnchanged: pin(firstPath).sha256 }))
