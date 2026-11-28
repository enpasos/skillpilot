// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { basename, join } from 'node:path'
import type { ExamData } from '../../src/landscapeTypes'
import { fingerprintSemanticKindSourceGoal } from '../goalBookModel'
import { assessmentReviewRevisions } from './learningUnitContracts'

export const achievableReviewRoot = 'curricula/DE/Gymnasium/quality/assessment-review/physik/e1-achievable-pass-marks-20261124-v1'
const dprimeId = 'a8dc0290-9f80-5763-8943-e16b8d2aa860'
const originalGoalHashes: Record<string, string> = {
  'a8dc0290-9f80-5763-8943-e16b8d2aa860': 'b09d3af871eabbae0dfe5ecf6320a6c645c7ce95bcb0d006eaae4531451f113e',
  '4ea1b93f-2dba-59ac-87ab-29af6c55cc37': 'de4262464d84015668c84b5559772646f76ece5ec9f6e1f6b71e62f6dd393af7',
  'dfd2628f-b44e-51b3-86e8-99158861be8c': 'cdda88dbbc7fd28e40008261b9c560b22054602e5a0dc0bae36ef25fa8a9ea41',
  'bcc56921-7107-5f5f-b721-3d5e0d7e1cd9': '6b135c6934c4197664b698b0eded7d743f9b12981d6c228fcc715d43dcf418f9',
  'f41e4e30-794e-5ce4-ba5e-cc72712cd691': '94caaa5f3f8a3a972d5a47fb25f092fcfbe6a099101e596b2eba36a112688a20',
  'c6e2942d-1ff4-5e86-a52a-4ca4c8568291': '9352ce7b21b6b6eb4e83cee751009bcef1be87ae7f5261ea40ced6f2ab0f8ff8',
  'c5807a37-129e-5df6-8989-482bc7f5683e': 'd5ec1ebb9687e5621bb2a4ddf2cd36851b1a305cc707116b7091982c84cbf27f',
}
// Each entry pins the complete accepted pointer, including its two independent grading rounds.
const acceptedPointerHashes: Record<string, string> = {
  'a8dc0290-9f80-5763-8943-e16b8d2aa860': '1bdba792044f0fd7044358ea31d6bdfe33caf73a35aced09239f15b2a2e8633c',
  'c5807a37-129e-5df6-8989-482bc7f5683e': 'dd1934c567806e799b4b79bad6acc014e473664715888d42c3debe1e71a12a9e',
  '4ea1b93f-2dba-59ac-87ab-29af6c55cc37': 'bc4b0bc77e418e31f02d613c706323614a17cc2f4ee10b6afae6d12fb22dfb9c',
  'bcc56921-7107-5f5f-b721-3d5e0d7e1cd9': '4af140b83ca363fca2d1a53f49a51ddc2afb824457782cc1ca5e50b5500940f0',
  'c6e2942d-1ff4-5e86-a52a-4ca4c8568291': '477a0199f25f2c57f6a746720582f8a28ae8e63daacd49d9ecd35cf1795944f7',
  'dfd2628f-b44e-51b3-86e8-99158861be8c': '5ff9b9e88bbbc9800233b25969963a56604e20161d404ef992fea7d34645e17a',
}
const semanticKindReceiptHashes: Record<string, string> = {
  'a8dc0290-9f80-5763-8943-e16b8d2aa860': '83176c9506bf0fd649c2b35fb9c76ee086c89849cee426b5ff13f8d0bd7ffd52',
  'c5807a37-129e-5df6-8989-482bc7f5683e': '39e28b38e9aefe4cccd9fc34833abd393de6dc97b4816851d3c17efebd6d5ea1',
  '4ea1b93f-2dba-59ac-87ab-29af6c55cc37': 'b5790491214caa04cb48ffea39c228b003139ae7fff193e54794e5caf34c6a6d',
  'bcc56921-7107-5f5f-b721-3d5e0d7e1cd9': '534410e0763f2265d897028b1af87d0b669dd8315142724d9783c2f043d8e4f9',
  'c6e2942d-1ff4-5e86-a52a-4ca4c8568291': '90144ab7dae51ad73abae3c3560cc61d78bd68d3e7918557a29439a0ffa6f11e',
  'dfd2628f-b44e-51b3-86e8-99158861be8c': '9c8ad00037e443f35b4eac35cde8084e3b81d877c2e48a5a7ca865f01d8ed3f0',
}
const rejectedDispositionHashes: Record<string, string> = {
  '4ea1b93f-2dba-59ac-87ab-29af6c55cc37/v1': '23d76d08b631335e024bbe29e4f1d21e6dc5b13e9d9fe28c82cb65029d501e41',
  '4ea1b93f-2dba-59ac-87ab-29af6c55cc37/v2': '38a57a21599ffc0f00893658ef09f1680b3119fbc7333d537f6a4a93e5db26d2',
  '4ea1b93f-2dba-59ac-87ab-29af6c55cc37/v3': '59d5601b2298c4d963056af765959d874883a556b6d01d3bc83134ec8f58c08e',
  '4ea1b93f-2dba-59ac-87ab-29af6c55cc37/v4': '27b29c3e8cb96ff25c2b650eec8cc0f8616c205f15f645e4c76b2b864ac0372f',
  '4ea1b93f-2dba-59ac-87ab-29af6c55cc37/v5': '5998e75f84813108f51808d9bea83209f0f686c9abc48d406dfb71f949d2ae6a',
  'a8dc0290-9f80-5763-8943-e16b8d2aa860/v1': '092cc5030e0f147ee6393671fdb21d9e5ef4bad53f9378e37643900f7b2a8074',
  'a8dc0290-9f80-5763-8943-e16b8d2aa860/v2': '663a6c44e5b87821c4f982591a5741ac9305dcf0b32e32d81ab752d590e2090f',
  'a8dc0290-9f80-5763-8943-e16b8d2aa860/v3': '9af2609b0de43b3ab7a29f6576d52f500e00f55ef0bd636fa16a5c325d643c76',
  'a8dc0290-9f80-5763-8943-e16b8d2aa860/v4': 'c4d3a04a7a76db08654f6bf47154c801362d5f644111b8e86d11fbfdf236d446',
  'a8dc0290-9f80-5763-8943-e16b8d2aa860/v5': 'afcce61b887eb9e11a434d0f8cab99d0abcf9efad893875c7780979191382a07',
  'a8dc0290-9f80-5763-8943-e16b8d2aa860/v6': 'd4ceb14a2ab4c4373361d50022f263a8f86ea6e7b57db404d72afcac153d7936',
  'a8dc0290-9f80-5763-8943-e16b8d2aa860/v7': '20dd923890ddb84b63ccd5d2bdf378fd39f3f0ba23ec3331d9c5581e440f2df1',
  'bcc56921-7107-5f5f-b721-3d5e0d7e1cd9/v1': '49c85f5b76d43406c88715a9e64c075a12c3e626eaa44ae9beddc9d387ea80f8',
  'bcc56921-7107-5f5f-b721-3d5e0d7e1cd9/v2': '1ad2d71c50c77bd77d21a5b21f95060621f82a6b9bbec8b78ce5949a280fa38b',
  'bcc56921-7107-5f5f-b721-3d5e0d7e1cd9/v3': 'd369d68099bbce3412132b6e90894307e894c571e7f08c88f050051503e511b5',
  'bcc56921-7107-5f5f-b721-3d5e0d7e1cd9/v4': '82052e5d86b2d6d36ebd2a277a63d54e186a1f8cb153ae55e5f69a669b8c13fb',
  'c5807a37-129e-5df6-8989-482bc7f5683e/v1': '389319c344b3f93658f211ad3863c950ad52e8278f2df03fda50994c57e2195f',
  'c5807a37-129e-5df6-8989-482bc7f5683e/v2': 'ff208a82aeb0bec9e324a7e6ab707c48dc52095d0d7f47e827c097d4f08fbe52',
  'c5807a37-129e-5df6-8989-482bc7f5683e/v3': 'c03b6e15e45db7e612242bbd9ddea8070d8b247f3af13abf43c6272ac802ba60',
  'c5807a37-129e-5df6-8989-482bc7f5683e/v4': '8258ada437d91b0cd549464baa721a20d5c5725f399e8e5594e1e22118e5f47b',
  'c6e2942d-1ff4-5e86-a52a-4ca4c8568291/v1': '71c783867fdb556ccd3e950dbef7a3419b2963bc5c2233ec36472d4ac74075ee',
  'c6e2942d-1ff4-5e86-a52a-4ca4c8568291/v2': '8c68fa45ef0c4e2bf5f9117cacc66c85794c3f58b5f30b35b90d568199abe89f',
  'dfd2628f-b44e-51b3-86e8-99158861be8c/v1': '131e50316d31f8fa56e9bfda891d4c3810f9cd14312d928fc844e11327cac13a',
  'dfd2628f-b44e-51b3-86e8-99158861be8c/v2': '59027beeb43fb531b13721df856f580506fd3afa948454ea91e8fc558ad98f4f',
  'dfd2628f-b44e-51b3-86e8-99158861be8c/v3': 'a15c48d191ce49c22d2656c7998bc9b009056c22727ee6c82504e329c16c84c5',
  'f41e4e30-794e-5ce4-ba5e-cc72712cd691/v1': 'f6f7a548bef8eeb110c8ac424dd558f914a1c1e02ef8db62cf4551898bc61dba',
  'f41e4e30-794e-5ce4-ba5e-cc72712cd691/v10': 'a8e3ec1f48defe035adae9adf86e5a8d1ec55c8c0cbab73d558713076a5c6a11',
  'f41e4e30-794e-5ce4-ba5e-cc72712cd691/v12': 'e1b04db8cc0ae557d96dea3c57c0607809684ff955be9c64f296c196ba48472a',
  'f41e4e30-794e-5ce4-ba5e-cc72712cd691/v13': '9f0ad2bfdf4fad1fc5bdd1828eabeea4c379c4ee0954429b50103ee1767d934d',
  'f41e4e30-794e-5ce4-ba5e-cc72712cd691/v14': '116c95890e8a3f28e4e8ef40ccefd92f1b0ef4f48e9abaf5974b3d956405ae32',
  'f41e4e30-794e-5ce4-ba5e-cc72712cd691/v15': 'e90785d1663b58912d539616887a5e983337b26e5f3ce7e7bddf27c2ccc0d7a6',
  'f41e4e30-794e-5ce4-ba5e-cc72712cd691/v16': '61292d4954ab21a86c2914a81d3ca5bc371c4a45037ac5be618d767ca70a9ff1',
  'f41e4e30-794e-5ce4-ba5e-cc72712cd691/v17': '07d0d3ec09142bb314aa49822e3dfe0b94a610c68e357b091ac9d569e162992e',
  'f41e4e30-794e-5ce4-ba5e-cc72712cd691/v18': '9fd85c044757e8b3fb68266519430cb638f8adc5d7e115c99678f37aa8b79796',
  'f41e4e30-794e-5ce4-ba5e-cc72712cd691/v19': '07c3213510b37539934deac51d675241460aaa2fd10b1cff404d1adddd97a91f',
  'f41e4e30-794e-5ce4-ba5e-cc72712cd691/v20': 'f91ea878532a0811ef6343ce4c9462685093737ecd38e55fe66bfed04dc6880f',
  'f41e4e30-794e-5ce4-ba5e-cc72712cd691/v21': 'e9b8ee05f291d802959e782b228ab2a86b800e2cf7b1b7a5e6d8e463613e78b9',
  'f41e4e30-794e-5ce4-ba5e-cc72712cd691/v22': '894294a9a375571b8575b38ddbdd515db8966ea57981af0c3eb4b8aac924dec5',
  'f41e4e30-794e-5ce4-ba5e-cc72712cd691/v23': '1ca74f8c5e90e34b766bb3a2442d1a2d011161c484b926c861ac29d614d5c5a3',
  'f41e4e30-794e-5ce4-ba5e-cc72712cd691/v24': '565feab3fe2cb55965c7d6e33f67f2d25bcdf3abc20d6462caaf630fc99705ca',
  'f41e4e30-794e-5ce4-ba5e-cc72712cd691/v3': 'c8d96970d813fb7349bd37042506a58c65dbbf0870ddf546b0bc9d86a6bac4ba',
  'f41e4e30-794e-5ce4-ba5e-cc72712cd691/v4': 'c2f0bdd3420bfc0b4a5c838ff2dbacb54f2a60e55f8a93055efb04de8263ce9c',
  'f41e4e30-794e-5ce4-ba5e-cc72712cd691/v5': '65d72673684e3b58ec571573115620dc093961ff4815948fe5a95637e862226e',
  'f41e4e30-794e-5ce4-ba5e-cc72712cd691/v6': '7d0c8d79d43925aa6c5b8c1943cd75e3f4765c0151be8721ebd4a8bf1a10f21f',
  'f41e4e30-794e-5ce4-ba5e-cc72712cd691/v7': '0d3aa817087a97c2449fb7d066850b8e5247a09e495073e7efb47f744de031ac',
  'f41e4e30-794e-5ce4-ba5e-cc72712cd691/v8': 'eaa1603bd7c0695d9e32d15c80b40f803b822df790eed1549c45e804433be544',
  'f41e4e30-794e-5ce4-ba5e-cc72712cd691/v9': 'd558061e4d75749cecd9e27bdb2823cb7df5a4aa34cf2db673196462bc558ade',
}
type Goal = Record<string, unknown> & { id: string; examData: ExamData }
type FileRef = { path: string; sha256: string }
type Audit = {
  id: string
  kind: 'four-slips' | 'missing-facet' | 'missing-performance' | 'misconception'
  performanceId: string | null
  answer: string
}
type Submission = Omit<Audit, 'answer' | 'id'> & { submissionId: string; auditId: string }
type Performance = { id: string; description: string; criterionIds: string[] }
type Judgment = {
  round: string; model: string; threadId: string
  decision: string; eligibleForActivation: boolean; validationFindings: string[]
  receipt: FileRef; response: FileRef; submissionKey: Submission[]
}
type Graded = {
  submissionId: string; total: number; passes: boolean; diagnosis: string
  scores: Array<{ criterionId: string; pointsAwarded: number; reason: string }>
  localizedSlips: Array<{ location: string; description: string; deductedPoints: number; followOnDeduction: boolean }>
}
type Review = {
  goalId: string; candidateDecision: string; scopeVerdict: string; requiredCorrections: string[]
  semanticKind: string; semanticKindReason: string
  coveredGoalReviews: Array<{ goalId: string; mustShow: string; mayRemainOpen: string; whyTolerable: string }>
  carryingPerformanceAudit: Array<{
    performanceId: string; weight: number; completeOmissionMaximum: number; earnedFromTask: string; safeguardsAndLimits: string
  }>
  gradedSubmissions: Graded[]
}
type Run = {
  reviewContract: string; round: string; provider: string; model: string; threadId: string
  exitCode: number; reasoningEffort: string; sandbox: {type: string}; nativeVerificationErrors: string[]
  blindToOtherRun: boolean; originalSha256: string; candidateSha256: string
  inputArtifacts: FileRef[]; outputArtifacts: FileRef[]
}
type Capsule = {
  original: Goal; candidate: Goal; candidateFileSha256: string; directGoals: Array<{ id: string }>
  directPrerequisites: Array<{id: string}>
  proposedCarryingPerformances: Performance[]
  learnerSubmissions: Array<{ submissionId: string; answer: string }>
  declaredUnitRubricContract?: { contract: string; source: string; sourceSha256: string }
}
const hash = (bytes: Buffer | string) => createHash('sha256').update(bytes).digest('hex')
const json = <T>(file: string): T => JSON.parse(readFileSync(file, 'utf8')) as T
const sum = (values: number[]) => values.reduce((a, b) => a + b, 0)
function verifyRef(dir: string, ref: FileRef, expected?: string): string {
  if (expected) assert.equal(ref.path, expected)
  assert.match(ref.path, /^(?:[\w.-]+\/)*[\w.-]+$/u)
  assert(!ref.path.split('/').some(part => part === '.' || part === '..'))
  const path = join(dir, ref.path)
  assert.equal(hash(readFileSync(path)), ref.sha256, ref.path)
  return path
}
function verifyScoringDelta(original: Goal, current: Goal) {
  const expected = structuredClone(original)
  const old = original.examData
  const exam = current.examData
  assert.deepEqual(Object.keys(exam).sort(), Object.keys(old).sort())
  const marker = /(?<![\p{L}\p{N}_.,])\d+(?:[.,]\d+)?(?=\s*(?:BE|Punkt(?:e|en)?|marks?|points?|pts?)\b)/giu
  for (const field of ['taskContent', 'taskContentEn'] as const) {
    if (old[field] !== undefined) {
      assert.equal(exam[field]?.replace(marker, '[allocation]'), old[field].replace(marker, '[allocation]'))
      expected.examData[field] = exam[field]!
    }
  }
  for (const field of ['solutionContent', 'solutionContentEn'] as const) {
    if (old[field] !== undefined) {
      const oldMarking = /\n\n(?:\*\*)?(?:Teilpunktbewertung|Partial credit|Hinweise zur Bewertung|Scoring notes|Bewertungshinweis|Bewertungsgrundsätze|Marking principles|Bewertung[.:]|Grading:|Scoring\.)/u.exec(old[field])
      assert(oldMarking, `${current.id}: missing boundary between worked solution and scoring notes`)
      const workedSolution = old[field].slice(0, oldMarking.index)
      assert(exam[field]?.startsWith(workedSolution + '\n\n'), `${current.id}: the worked solution in ${field} changed`)
      expected.examData[field] = exam[field]!
    }
  }
  if (old.reviewNote && exam.reviewNote !== old.reviewNote) {
    expected.examData.reviewNote = `Scoring revision of 24 November 2026. Current rubric and independent marking evidence: ${achievableReviewRoot}/${current.id}/accepted.actual.json. Review notes for preceding editions: ${old.reviewNote}`
  }
  assert.equal(exam.scoring.maxPoints, old.scoring.maxPoints)
  expected.examData.scoring = exam.scoring
  assert.deepEqual(current, expected, `${current.id}: scoring revision changed a task, goal, source or claim`)
}
function verifyGrades(goal: Goal, review: Review, performances: Performance[], submissions: Submission[]) {
  const {maxPoints, passingPoints, steps} = goal.examData.scoring
  assert(passingPoints > 0 && passingPoints * 100 <= 85 * maxPoints)
  assert.equal(sum(steps.map(s => s.points)), maxPoints)
  const points = new Map(steps.map(s => [s.id, s.points]))
  assert.equal(points.size, steps.length)
  assert(steps.every(s => s.points > 0 && s.description.trim()))
  const groupSteps = performances.flatMap(p => p.criterionIds)
  assert.equal(new Set(groupSteps).size, groupSteps.length)
  assert(performances.length >= 1 && performances.length <= 5)
  assert.deepEqual(review.carryingPerformanceAudit.map(r => r.performanceId).sort(), performances.map(p => p.id).sort())
  assert.equal(new Set(performances.map(p => p.id)).size, performances.length)
  for (const p of performances) {
    const row = review.carryingPerformanceAudit.find(r => r.performanceId === p.id)!
    const weight = sum(p.criterionIds.map(s => points.get(s)!))
    assert(p.description.trim() && row.earnedFromTask.trim() && row.safeguardsAndLimits.trim())
    assert(weight > maxPoints - passingPoints)
    assert.equal(row.weight, weight)
    assert.equal(row.completeOmissionMaximum, maxPoints - weight)
  }
  assert.deepEqual(review.coveredGoalReviews.map(r => r.goalId).sort(), [...goal.examData.coveredGoalIds!].sort())
  assert(review.coveredGoalReviews.every(r => r.mustShow.trim() && r.mayRemainOpen.trim() && r.whyTolerable.trim()))
  const performanceIds = new Set(performances.map(p => p.id))
  for (const sample of submissions) {
    if (sample.kind === 'four-slips') assert.equal(sample.performanceId, null)
    else assert(sample.performanceId && performanceIds.has(sample.performanceId))
  }
  assert.deepEqual(new Set(submissions.map(s => s.kind)), new Set(['four-slips', 'missing-facet', 'missing-performance', 'misconception']))
  assert.deepEqual(new Set(submissions.filter(s => s.kind === 'missing-performance').map(s => s.performanceId)), new Set(performances.map(p => p.id)))
  assert.deepEqual(review.gradedSubmissions.map(g => g.submissionId).sort(), submissions.map(s => s.submissionId).sort())
  assert.equal(new Set(submissions.map(s => s.submissionId)).size, submissions.length)
  for (const grade of review.gradedSubmissions) {
    const key = submissions.find(s => s.submissionId === grade.submissionId)!
    assert.deepEqual(grade.scores.map(s => s.criterionId).sort(), [...points.keys()].sort())
    assert(grade.scores.every(s => s.reason.trim() && s.pointsAwarded >= 0 && s.pointsAwarded <= points.get(s.criterionId)!))
    assert.equal(grade.total, sum(grade.scores.map(s => s.pointsAwarded)))
    assert.equal(grade.passes, grade.total >= passingPoints)
    const fails = key.kind === 'missing-performance' || key.kind === 'misconception'
    assert.equal(grade.passes, !fails)
    assert(grade.diagnosis.trim())
    const slips = grade.localizedSlips
    assert(slips.every(s => s.deductedPoints >= 0 && s.deductedPoints <= 0.5 && s.followOnDeduction === false && s.description.trim() && s.location.trim()))
    if (key.kind === 'four-slips') {
      assert.equal(slips.length, 4)
      assert.equal(new Set(slips.map(s => JSON.stringify([s.location, s.description]))).size, 4)
      assert.equal(grade.total, maxPoints - sum(slips.map(s => s.deductedPoints)))
    } else if (key.kind === 'missing-facet') assert.deepEqual(slips, [])
    if (fails) {
      const omitted = performances.find(p => p.id === key.performanceId)!.criterionIds
      for (const row of grade.scores) assert.equal(row.pointsAwarded, omitted.includes(row.criterionId) ? 0 : points.get(row.criterionId))
    }
  }
}
type GoalMap = Map<string, Record<string, unknown>>
type Canonical = (object: unknown) => string
type Digests = Record<string, string>
type ReviewFamily = {root: string; originals: Digests; accepted: Digests; semantic: Digests; rejected: Digests}

const achievableFamily = {root: achievableReviewRoot, originals: originalGoalHashes, accepted: acceptedPointerHashes,
  semantic: semanticKindReceiptHashes, rejected: rejectedDispositionHashes}

const horizontalThrowExamId = '4ea1b93f-2dba-59ac-87ab-29af6c55cc37'
const horizontalThrowGoalId = '0fee53f2-1c02-5b12-9b6c-aa9fa462d921'
const planarVectorNormId = '3b6fa042-af1e-5c48-a9d0-798a2ab876d0'

function coveredGoalProjection(goal: Record<string, unknown>) {
  return Object.fromEntries(['id', 'title', 'titleEn', 'description', 'descriptionEn', 'requires']
    .filter(key => Object.hasOwn(goal, key)).map(key => [key, goal[key]]))
}

function verifyHorizontalThrowPreparation(
  repoRoot: string, canonical: Canonical, preparation: GoalMap, historical: Record<string, unknown>,
  live: Record<string, unknown>, family: string, round: string, capsulePath: string,
) {
  const evidence = json<{
    schemaVersion: number; examId: string; goalId: string; legacyCapsules: Record<string, FileRef>;
    previousTargetSha256: string; currentTargetSha256: string; previousRequires: string[];
    currentRequires: string[]; addedPrerequisite: string; previousPreparation: string[];
    currentPreparation: string[]; addedPreparation: Array<{ id: string; goalSha256: string }>;
  }>(verifyRef(repoRoot, {
    path: 'curricula/DE/Gymnasium/quality/learning-units/math-planar-vector-ladder-20261128-v1/goal-book-0fee53f2-preparation.actual.json',
    sha256: '1970f0a66667f53e6ed0744b37fa4b6315dd8aea3aba3ac813ca7e3a6f66f680',
  }))
  assert.deepEqual([evidence.schemaVersion, evidence.examId, evidence.goalId, evidence.addedPrerequisite],
    [1, horizontalThrowExamId, horizontalThrowGoalId, planarVectorNormId])
  assert.equal(verifyRef(repoRoot, evidence.legacyCapsules[basename(family) + '/' + round]), capsulePath)
  assert.equal(hash(canonical(historical)), evidence.previousTargetSha256)
  assert.equal(hash(canonical(live)), evidence.currentTargetSha256)
  assert.deepEqual(historical.requires, evidence.previousRequires)
  assert.deepEqual(live.requires, evidence.currentRequires)
  assert.deepEqual(live, { ...historical, requires: [...evidence.previousRequires, planarVectorNormId] })
  const closure = (requires: string[]) => {
    const found = new Set<string>()
    const visit = (refs: string[]) => {
      for (const ref of refs) {
        const id = ref.split(':').at(-1)!
        if (found.has(id)) continue
        const prerequisite = preparation.get(id)
        assert(prerequisite, `unresolved horizontal-throw preparation: ${ref}`)
        found.add(id)
        visit((prerequisite.requires ?? []) as string[])
      }
    }
    visit(requires)
    return [...found].sort()
  }
  const previous = closure(evidence.previousRequires)
  const current = closure(evidence.currentRequires)
  assert.deepEqual(previous, evidence.previousPreparation)
  assert.deepEqual(current, evidence.currentPreparation)
  assert.deepEqual(current.filter(id => !previous.includes(id)).map(id => ({
    id, goalSha256: hash(canonical(coveredGoalProjection(preparation.get(id)!))),
  })), evidence.addedPreparation)
}

function verifyReviewFamily(repoRoot: string, goals: GoalMap, canonical: Canonical, spec: ReviewFamily,
  verifyDelta: (original: Goal, current: Goal, attempt: string) => void, preparation: GoalMap) {
  const {root, originals: originalGoalHashes, accepted: acceptedPointerHashes, semantic: semanticKindReceiptHashes,
    rejected: rejectedDispositionHashes} = spec
  for (const [version, digest] of Object.entries(rejectedDispositionHashes)) {
    const [id, attempt] = version.split('/')
    assert.match(attempt, /^v[1-9]\d*$/u)
    assert(Object.hasOwn(originalGoalHashes, id))
    const directory = join(repoRoot, root, version)
    const record = json<{goalId: string; eligibleForActivation: boolean; original: FileRef; candidate: FileRef; performances: FileRef;
      audits: FileRef; author: FileRef; judgments: Judgment[]; technicalActivationFindings?: string[]}>(
      verifyRef(directory, {path: 'review-disposition.actual.json', sha256: digest}))
    assert.equal(record.goalId, id)
    assert.equal(record.eligibleForActivation, false)
    assert.equal(hash(canonical(json(verifyRef(directory, record.original)))), originalGoalHashes[id])
    for (const artifact of [record.candidate, record.performances, record.audits, record.author]) verifyRef(directory, artifact)
    const author = json<{inputArtifacts: FileRef[]; outputArtifacts: FileRef[]}>(join(directory, record.author.path))
    for (const artifact of [...author.inputArtifacts, ...author.outputArtifacts]) verifyRef(directory, artifact)
    assert.deepEqual(record.judgments.map(j => j.round), ['a', 'b'])
    const technical = record.technicalActivationFindings ?? []
    if (technical.length) {
      assert.equal(id, dprimeId)
      assert(technical.every(finding => finding.startsWith('LU-R2-EVIDENCE:')))
      assert.throws(() => assessmentReviewRevisions(json<Goal>(join(directory, record.candidate.path))), /integer numbers/u)
    }
    const scoresChanged = root === coachScoringReviewRoot && !verifiedCompactAwards(repoRoot, directory, id)
    assert(record.judgments.some(j => !j.eligibleForActivation)
      || new Set(record.judgments.map(j => j.threadId)).size !== 2 || technical.length > 0 || scoresChanged)
    for (const row of record.judgments) {
      const folder = 'round-' + row.round
      const run = json<Run>(verifyRef(directory, row.receipt, folder + '/run.actual.json'))
      for (const artifact of [...run.inputArtifacts, ...run.outputArtifacts]) verifyRef(join(directory, folder), artifact)
      if (row.response) {
        const response = json<Review>(verifyRef(directory, row.response, folder + '/response.json'))
        if (row.decision === 'unusable') {
          assert(run.exitCode !== 0 || run.nativeVerificationErrors.length > 0)
        } else {
          assert.equal(response.candidateDecision, row.decision)
          assert(response.goalId === id || row.validationFindings.includes('wrong goal ID'))
        }
      }
    }
  }
  const originals = new Map<string, Goal>()
  const family = join(repoRoot, root)
  const rejected = []
  for (const id of Object.keys(originalGoalHashes)) {
    const dir = join(family, id)
    if (!existsSync(dir)) continue
    for (const entry of readdirSync(dir, {withFileTypes: true})) {
      if (!entry.isDirectory() || !/^v[1-9]\d*$/u.test(entry.name)) continue
      const path = join(dir, entry.name, 'review-disposition.actual.json')
      if (!existsSync(path)) continue
      const record = json<{eligibleForActivation: boolean}>(path)
      if (!record.eligibleForActivation) rejected.push(id + '/' + entry.name)
    }
  }
  assert.deepEqual(rejected.sort(), Object.keys(rejectedDispositionHashes).sort(), 'unbound or missing rejected review attempt')
  const activatedIds = existsSync(family) ? readdirSync(family, {withFileTypes: true})
    .filter(entry => entry.isDirectory() && existsSync(join(family, entry.name, 'accepted.actual.json')))
    .map(entry => entry.name).sort() : []
  assert.deepEqual(activatedIds, Object.keys(acceptedPointerHashes).sort())
  assert.deepEqual(activatedIds, Object.keys(semanticKindReceiptHashes).sort())
  assert(activatedIds.every(id => Object.hasOwn(originalGoalHashes, id)))
  for (const [id, originalHash] of Object.entries(originalGoalHashes)) {
    const current = goals.get(id) as Goal
    assert.equal(current?.id, id, `missing E.1 assessment ${id}`)
    const dir = join(repoRoot, root, id)
    const pointer = join(dir, 'accepted.actual.json')
    const selected = acceptedPointerHashes[id]
    if (!selected) {
      assert(!existsSync(pointer), `${id}: unbound activation`)
      assert.equal(hash(canonical(current)), originalHash, `${id}: changed without two accepted reviews`)
      originals.set(id, current)
      continue
    }
    assert.equal(hash(readFileSync(pointer)), selected, id)
    const active = json<{ goalId: string; reviewPath: string; originalGoalSha256: string; currentGoalSha256: string; dispositionSha256: string }>(pointer)
    assert.equal(active.goalId, id)
    assert.match(active.reviewPath, /^v[1-9]\d*$/u)
    assert.equal(active.originalGoalSha256, originalHash)
    assert.equal(active.currentGoalSha256, hash(canonical(current)))
    const attempt = join(dir, active.reviewPath)
    const decision = json<{reviewContract: string; goalId: string; eligibleForActivation: boolean; authorModel: string; original: FileRef; candidate: FileRef; author: FileRef; audits: FileRef; performances: FileRef; judgments: Judgment[]; technicalActivationFindings?: string[]}>(
      verifyRef(attempt, { path: 'review-disposition.actual.json', sha256: active.dispositionSha256 }))
    assert.equal(decision.reviewContract, 'e1-achievable-pass-mark-rounds-v1')
    assert.equal(decision.goalId, id)
    assert.equal(decision.eligibleForActivation, true)
    assert.deepEqual(decision.technicalActivationFindings ?? [], [])
    if (id === dprimeId) assessmentReviewRevisions(current)
    const original = json<Goal>(verifyRef(attempt, decision.original, 'original.goal.json'))
    assert.equal(hash(canonical(original)), originalHash)
    assert.deepEqual(json(verifyRef(attempt, decision.candidate, 'candidate.goal.json')), current)
    verifyDelta(original, current, attempt)
    const kind = json<{goalId: string; accepted: FileRef; original: FileRef; currentGoal: FileRef; semanticKind: string;
      previousSourceFingerprint: string; currentSourceFingerprint: string; humanApproval: boolean;
      reviews: Array<{response: FileRef; semanticKind: string; semanticKindReason: string}>}>(
      verifyRef(dir, {path: 'semantic-kind.actual.json', sha256: semanticKindReceiptHashes[id]}))
    assert.equal(kind.goalId, id)
    assert.equal(kind.semanticKind, 'practiceAssessment')
    assert.equal(kind.humanApproval, false)
    assert.equal(kind.previousSourceFingerprint, fingerprintSemanticKindSourceGoal(original))
    assert.equal(kind.currentSourceFingerprint, fingerprintSemanticKindSourceGoal(current))
    assert.equal(verifyRef(repoRoot, kind.accepted), pointer)
    assert.equal(verifyRef(repoRoot, kind.original), join(attempt, decision.original.path))
    assert.equal(verifyRef(repoRoot, kind.currentGoal), join(attempt, decision.candidate.path))
    assert.deepEqual(kind.reviews.map(row => verifyRef(repoRoot, row.response)), decision.judgments.map(j => join(attempt, j.response.path)))
    const performances = json<Performance[]>(verifyRef(attempt, decision.performances, 'performances.json'))
    const audits = json<Audit[]>(verifyRef(attempt, decision.audits, 'audits.json'))
    assert.equal(new Set(audits.map(audit => audit.id)).size, audits.length)
    assert.equal(new Set(audits.map(audit => audit.answer.trim())).size, audits.length)
    const author = json<{model: string; sessionId: string; provider: string; candidateSha256: string; inputArtifacts: FileRef[]; outputArtifacts: FileRef[]}>(verifyRef(attempt, decision.author, 'author.actual.json'))
    assert.match(author.provider, /^(?:Anthropic|Claude|claude\.ai)$/iu)
    assert.match(author.model, /^claude-/u)
    assert.equal(author.model, decision.authorModel)
    assert.equal(author.candidateSha256, decision.candidate.sha256)
    for (const ref of [...author.inputArtifacts, ...author.outputArtifacts]) verifyRef(attempt, ref)
    const authored = json<{session_id: string; modelUsage: Record<string, unknown>; is_error: boolean}>(join(attempt, 'author/provider-response.json'))
    assert.equal(authored.session_id, author.sessionId)
    assert.equal(authored.is_error, false)
    assert(Object.hasOwn(authored.modelUsage, author.model))
    assert.deepEqual(decision.judgments.map(j => j.round), ['a', 'b'])
    assert.equal(new Set([author.sessionId, ...decision.judgments.map(j => j.threadId)]).size, 3)
    for (const judgment of decision.judgments) {
      const round = 'round-' + judgment.round
      assert.equal(judgment.model, judgment.round === 'a' ? 'gpt-6.1-sol' : 'gpt-6.2-astra')
      assert.equal(judgment.decision, 'accept')
      assert.equal(judgment.eligibleForActivation, true)
      assert.deepEqual(judgment.validationFindings, [])
      const run = json<Run>(verifyRef(attempt, judgment.receipt, round + '/run.actual.json'))
      assert.deepEqual([run.reviewContract, run.provider, run.round, run.model, run.threadId, run.reasoningEffort, run.exitCode, run.blindToOtherRun, run.sandbox.type],
        ['independent-achievable-exam-review-v1', 'OpenAI', judgment.round, judgment.model, judgment.threadId, 'ultra', 0, true, 'read-only'])
      assert.equal(run.originalSha256, decision.original.sha256)
      assert.equal(run.candidateSha256, decision.candidate.sha256)
      assert.deepEqual(run.nativeVerificationErrors, [])
      assert.deepEqual(run.inputArtifacts.map(r => r.path).sort(), ['canonical-input.json', 'output.schema.json', 'prompt.txt'])
      assert.deepEqual(run.outputArtifacts.map(r => r.path).sort(), ['events.jsonl', 'response.json', 'stderr.txt'])
      for (const ref of [...run.inputArtifacts, ...run.outputArtifacts]) verifyRef(join(attempt, round), ref)
      const capsule = json<Capsule>(join(attempt, round, 'canonical-input.json'))
      if (id === dprimeId && decision.technicalActivationFindings !== undefined) {
        assert(capsule.declaredUnitRubricContract)
        assert.equal(capsule.declaredUnitRubricContract.contract, 'LU-R2-EVIDENCE')
        assert.equal(capsule.declaredUnitRubricContract.source, 'scripts/curriculum_learning_units.py#canonical_hash')
        assert.equal(capsule.declaredUnitRubricContract.sourceSha256, '283906f2dbbf6cd722dd3ba46de860ba75cf9b409d9e74eb3071216995f61b06')
      }
      assert.deepEqual(capsule.original, original)
      assert.deepEqual(capsule.candidate, current)
      assert.equal(capsule.candidateFileSha256, decision.candidate.sha256)
      const captured = readFileSync(join(attempt, round, 'canonical-input.json'), 'utf8')
      assert(readFileSync(join(attempt, round, 'prompt.txt'), 'utf8').endsWith(captured + '\n'))
      assert.deepEqual(capsule.directPrerequisites, (current.requires as string[]).map(reference => {
        const target = goals.get(reference.split(':').at(-1)!)
        return target ? Object.fromEntries(['id', 'title', 'description'].filter(key => Object.hasOwn(target, key)).map(key => [key, target[key]])) : {id: reference}
      }))
      for (const target of capsule.directGoals) {
        const live = coveredGoalProjection(goals.get(target.id)!)
        if (id === horizontalThrowExamId && target.id === horizontalThrowGoalId) {
          verifyHorizontalThrowPreparation(repoRoot, canonical, preparation, target, live, root, round,
            join(attempt, round, 'canonical-input.json'))
        } else {
          assert.deepEqual(target, live)
        }
      }
      assert.deepEqual(capsule.directGoals.map(g => g.id), current.examData.coveredGoalIds)
      assert.deepEqual(capsule.proposedCarryingPerformances, performances)
      assert.deepEqual(judgment.submissionKey.map(k => k.auditId).sort(), audits.map(a => a.id).sort())
      assert.deepEqual(capsule.learnerSubmissions, judgment.submissionKey.map(key => {
        const audit = audits.find(a => a.id === key.auditId)!
        assert.deepEqual([key.kind,key.performanceId], [audit.kind,audit.performanceId])
        return {submissionId: key.submissionId, answer: audit.answer}
      }))
      const review = json<Review>(verifyRef(attempt, judgment.response, round + '/response.json'))
      const events = readFileSync(join(attempt, round, 'events.jsonl'), 'utf8').trim().split('\n').map(line => JSON.parse(line))
      assert.deepEqual(events.filter(e => e.type === 'thread.started').map(e => e.thread_id), [run.threadId])
      assert.equal(events.at(-1)?.type, 'turn.completed')
      for (const event of events.filter(e => e.type.startsWith('item.'))) {
        assert(['agent_message', 'reasoning', 'plan', 'todo_list'].includes(event.item?.type), 'unexpected tool call in a blind round')
      }
      const messages = events.filter(e => e.type === 'item.completed' && e.item?.type === 'agent_message')
      assert.deepEqual(JSON.parse(messages.at(-1).item.text), review)
      assert.equal(review.goalId, id)
      assert.equal(review.candidateDecision, 'accept')
      assert.equal(review.semanticKind, 'practiceAssessment')
      const kindVerdict = kind.reviews.find(row => row.response.sha256 === judgment.response.sha256)!
      assert.equal(kindVerdict.semanticKind, review.semanticKind)
      assert.equal(kindVerdict.semanticKindReason, review.semanticKindReason)
      assert(review.scopeVerdict.trim() && review.semanticKindReason.trim())
      assert.deepEqual(review.requiredCorrections, [])
      verifyGrades(current, review, performances, judgment.submissionKey)
    }
    originals.set(id, original)
  }
  return originals
}

export const coachScoringReviewRoot = 'curricula/DE/Gymnasium/quality/assessment-review/physik/e1-coach-scoring-steps-20261124-v1'
const coachAcceptedPointerHashes: Record<string, string> = {
  'c5807a37-129e-5df6-8989-482bc7f5683e': 'ec98513563df4488435cd1bc611f1b82d0955634acc7665f026fbea21329e5d7',
  'bcc56921-7107-5f5f-b721-3d5e0d7e1cd9': '3658cd20e20ce5f73b475fe25728fc284ac1b5e2deee3b255ea7b2f6f7184b7b',
  'dfd2628f-b44e-51b3-86e8-99158861be8c': '88270533af35b8bb674b063ae922425c2231de4ff0a334c0c8de582e3d0b8ffa',
  '4ea1b93f-2dba-59ac-87ab-29af6c55cc37': '428067b397919c118a570a267e79e5376806e50caf2dc558c49733138bc377f1',
  'a8dc0290-9f80-5763-8943-e16b8d2aa860': 'ae4d3200d9ad089bc3e80149799965822e4049c738b4410e5ca70892e34117b2',
}
const coachSemanticKindReceiptHashes: Record<string, string> = {
  'c5807a37-129e-5df6-8989-482bc7f5683e': '27ee0d1efd583a16f4a3bb467b9dd80842e3ae14271c677d0b8ce7b2992787f2',
  'bcc56921-7107-5f5f-b721-3d5e0d7e1cd9': '07d56be3241c1c2c70845d888b0789fa7dc95bd40935c263d24d6f253201217f',
  'dfd2628f-b44e-51b3-86e8-99158861be8c': 'c26b495c43643b88a3cf2843acafaaa6eebf113f181bbdd7576a09554c7ee5c8',
  '4ea1b93f-2dba-59ac-87ab-29af6c55cc37': 'a0606c7d76e92e745599103613e4e5d7f2671d651a5e7e78665d2799c01ca4b2',
  'a8dc0290-9f80-5763-8943-e16b8d2aa860': '9ef199e5a239eb3766f0125d8952c6764802094f61aa83a7f310ab950fed3c5d',
}
const coachRejectedDispositionHashes: Record<string, string> = {
  '4ea1b93f-2dba-59ac-87ab-29af6c55cc37/v1': '59c66e0dfcdd893ddee648591120d7239504fe4facb3ebd6eec5f025d09728fc',
  'a8dc0290-9f80-5763-8943-e16b8d2aa860/v1': 'c04d61b66624516d6c3a626c109ee7fd4f6974040265a111b9cfe1665a8e7fa3',
  'bcc56921-7107-5f5f-b721-3d5e0d7e1cd9/v1': 'f514dfbd6e7ea646fd1341479efba4ea626ba8a0c0e8353af0f8eb50ca3b4586',
  'c5807a37-129e-5df6-8989-482bc7f5683e/v1': '3bf0f261176597e26dffe4b6fd751cd32662d616223ae0859f00a8d2080b7380',
  'dfd2628f-b44e-51b3-86e8-99158861be8c/v1': '30835872e0cbe90eb9c44ee9cef0b9e69c68c1132bcba8c09f5ccd6537c0dc21',
}
// Java String.length() and JS string.length both count UTF-16 code units.
export const coachDescriptionLimit = 2000
const oversizedStepIds: Record<string, string[]> = {
  '4ea1b93f-2dba-59ac-87ab-29af6c55cc37': ['z_res15', 'b_15', 'r_verf', 'r_wink', 'r_zun'],
  'a8dc0290-9f80-5763-8943-e16b8d2aa860': ['A-DIA'],
  'bcc56921-7107-5f5f-b721-3d5e0d7e1cd9': ['t6-mp-size', 't6-drag-cond', 't6-drag-claim'],
  'c5807a37-129e-5df6-8989-482bc7f5683e': ['t7_abweichung'],
  'dfd2628f-b44e-51b3-86e8-99158861be8c': ['B_RW', 'B_URT'],
}

function scoreMatrix(attempt: string, round: string) {
  const keys = json<Record<string, Submission[]>>(join(attempt, 'round-keys.actual.json'))[round]
  const judgment = json<{judgments: Judgment[]}>(join(attempt, 'review-disposition.actual.json')).judgments.find(j => j.round === round)!
  assert.deepEqual(keys, judgment.submissionKey)
  const grades = json<Review>(verifyRef(attempt, judgment.response)).gradedSubmissions
  return new Map(grades.map(grade => {
    const audit = keys.find(row => row.submissionId === grade.submissionId)!
    return [audit.auditId, new Map(grade.scores.map(s => [s.criterionId, s.pointsAwarded]))]
  }))
}

function verifiedCompactAwards(repoRoot: string, attempt: string, id: string) {
  const earlier = join(repoRoot, achievableReviewRoot, id)
  const pointer = json<{reviewPath: string}>(verifyRef(earlier, {path:'accepted.actual.json', sha256:acceptedPointerHashes[id]}))
  const parent = join(earlier, pointer.reviewPath)
  const decision = json<{priorMarksComparison: FileRef}>(join(attempt, 'review-disposition.actual.json'))
  type Difference = {auditId: string; criterionId: string; previousPoints: number; awardedPoints: number}
  const postReview = json<{contract: string; goalId: string; parentVersion: string; baselineCommit: string; parentArtifacts: FileRef[];
    previousIndependentMarksAgreed: boolean; unchangedAllAwards: boolean; differencesByRound: Record<string, Difference[]>;
    auditsCompared: number; criterionAwardsComparedPerRound: number}>(verifyRef(attempt, decision.priorMarksComparison, 'prior-marks-comparison.actual.json'))
  assert.equal(postReview.contract, 'coach-scoring-unchanged-submission-comparison-v1')
  assert.equal(postReview.goalId, id)
  assert.equal(postReview.parentVersion, pointer.reviewPath)
  assert.equal(postReview.baselineCommit, '7cea780f4f0beadef97ab5ed16de1571cfbbfa42')
  const parentPaths = ['review-disposition.actual.json','round-keys.actual.json','candidate.goal.json','audits.json','performances.json',
    'round-a/run.actual.json','round-a/response.json','round-b/run.actual.json','round-b/response.json']
  assert.deepEqual(postReview.parentArtifacts.map(item => verifyRef(repoRoot, item)).sort(),
    [join(earlier, 'accepted.actual.json'), ...parentPaths.map(name => join(parent, name))].sort())
  const baseline = scoreMatrix(parent, 'a')
  assert.deepEqual(baseline, scoreMatrix(parent, 'b'))
  assert.equal(postReview.previousIndependentMarksAgreed, true)
  assert.equal(postReview.auditsCompared, baseline.size)
  assert.equal(postReview.criterionAwardsComparedPerRound, sum([...baseline.values()].map(awards => awards.size)))
  let unchanged = true
  for (const round of ['a', 'b']) {
    const awards = scoreMatrix(attempt, round)
    assert.deepEqual([...awards.keys()].sort(), [...baseline.keys()].sort())
    const differences: Difference[] = []
    for (const [auditId, previous] of baseline) {
      const current = awards.get(auditId)!
      assert.deepEqual([...current.keys()].sort(), [...previous.keys()].sort())
      for (const [criterionId, previousPoints] of previous) {
        const awardedPoints = current.get(criterionId)!
        if (previousPoints !== awardedPoints) differences.push({auditId, criterionId, previousPoints, awardedPoints})
      }
    }
    assert.deepEqual(postReview.differencesByRound[round], differences)
    unchanged &&= differences.length === 0
  }
  assert.equal(postReview.unchangedAllAwards, unchanged)
  return unchanged
}

export function verifiedCoachScoringReviewChain(repoRoot: string, goals: GoalMap, canonical: Canonical, preparation: GoalMap) {
  const firstCatalog = new Map(goals)
  const originalHashes: Digests = {}
  const firstAttempts = new Map<string, string>()
  for (const [id, digest] of Object.entries(acceptedPointerHashes)) {
    const dir = join(repoRoot, achievableReviewRoot, id)
    const accepted = json<{reviewPath: string; currentGoalSha256: string}>(verifyRef(dir, {path:'accepted.actual.json', sha256:digest}))
    const attempt = join(dir, accepted.reviewPath)
    const goal = json<Goal>(join(attempt, 'candidate.goal.json'))
    assert.equal(accepted.currentGoalSha256, hash(canonical(goal)))
    assert.deepEqual(goal.examData.scoring.steps.filter(step => step.description.length > coachDescriptionLimit)
      .map(step => step.id), oversizedStepIds[id] ?? [])
    firstCatalog.set(id, goal)
    originalHashes[id] = accepted.currentGoalSha256
    firstAttempts.set(id, attempt)
  }
  const originals = verifyReviewFamily(repoRoot, firstCatalog, canonical, achievableFamily, verifyScoringDelta, preparation)
  assert.deepEqual(Object.keys(coachAcceptedPointerHashes).sort(), Object.keys(oversizedStepIds).sort())
  const bounded = {root: coachScoringReviewRoot, originals: originalHashes, accepted: coachAcceptedPointerHashes,
    semantic: coachSemanticKindReceiptHashes, rejected: coachRejectedDispositionHashes}
  verifyReviewFamily(repoRoot, goals, canonical, bounded, (original, current, attempt) => {
    const parent = firstAttempts.get(current.id)!
    assert(verifiedCompactAwards(repoRoot, attempt, current.id), 'the cost of each demonstrated error must agree with the previous reviews')
    for (const filename of ['audits.json', 'performances.json']) {
      assert.deepEqual(readFileSync(join(attempt, filename)), readFileSync(join(parent, filename)),
        'The same performances and the same submitted answers must be independently marked again')
    }
    const expected = structuredClone(original)
    const previous = expected.examData.scoring.steps, shorter = current.examData.scoring.steps
    assert.equal(shorter.length, previous.length)
    for (const [index, step] of previous.entries()) {
      if (step.description.length > coachDescriptionLimit) step.description = shorter[index].description
    }
    assert.deepEqual(current, expected, 'Only previously oversized scoring step descriptions may change')
    const criteria = oversizedStepIds[current.id]
    for (const round of ['round-a', 'round-b']) {
      const input = json<{compactScoringScope: {criterionIds: string[]; maximumUTF16CodeUnits: number}; parentEvidence: {
        baselineCommit: string; parentGoalNormalizedSha256: string; parentVersion: string
      }}>(join(attempt, round, 'canonical-input.json'))
      assert.equal(input.compactScoringScope.maximumUTF16CodeUnits, coachDescriptionLimit)
      assert.deepEqual([...input.compactScoringScope.criterionIds].sort(), [...criteria].sort())
      assert.deepEqual(input.parentEvidence, {baselineCommit: '7cea780f4f0beadef97ab5ed16de1571cfbbfa42',
        parentGoalNormalizedSha256: originalHashes[current.id], parentVersion: basename(parent)})
      const {stepCompressionChecks} = json<{stepCompressionChecks: Array<{criterionId: string; equivalent: boolean; reason: string}>}>(
        join(attempt, round, 'response.json'))
      assert.deepEqual(stepCompressionChecks.map(check => check.criterionId).sort(), [...criteria].sort())
      assert(stepCompressionChecks.every(check => check.equivalent === true && check.reason.trim()))
    }
  }, preparation)
  for (const id of Object.keys(originalHashes)) {
    const current = goals.get(id) as Goal
    for (const step of current.examData.scoring.steps) {
      assert(step.description.trim() && step.description.length <= coachDescriptionLimit,
        `${id}/${step.id}: scoring description must fit the coach limit of ${coachDescriptionLimit} UTF-16 code units`)
    }
  }
  return originals
}
