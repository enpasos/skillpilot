#!/usr/bin/env node

// Fail-closed diagnostic for an unreleased assessment candidate. The route
// simulation is deliberately unprojected; it cannot approve a curriculum view.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageDir = dirname(fileURLToPath(import.meta.url))
const root = resolve(packageDir, '../../../../../../../')
const spec = JSON.parse(readFileSync(resolve(packageDir, 'coverage-spec.json'), 'utf8'))
const taskText = readFileSync(resolve(packageDir, 'TASKS.md'), 'utf8')
const canonical = JSON.parse(readFileSync(resolve(root, spec.canonicalPath), 'utf8'))
const byId = new Map(canonical.goals.map(goal => [goal.id, goal]))
const sha256 = value => createHash('sha256').update(value).digest('hex')

assert.equal(spec.schemaVersion, 1)
assert.match(spec.status, /AI-candidate-only/)
assert.equal(spec.exams.length, 2)
assert.match(taskText, /keine Freigabe/)

const classification = new Map()
const examAudit = spec.exams.map(examSpec => {
  const exam = byId.get(examSpec.id)
  assert.ok(exam?.examData, `Missing source exam: ${examSpec.id}`)
  assert.equal(exam.examData.reviewStatus, 'released', 'Current source status drift; re-audit')
  assert.equal(exam.requires.length, examSpec.currentClaimCount)
  assert.equal(exam.examData.coveredGoalIds.length, examSpec.currentClaimCount)
  assert.deepEqual(exam.requires, exam.examData.coveredGoalIds,
    `Current requires and coverage diverge: ${examSpec.id}`)
  for (const [field, hash] of [
    ['taskContent', examSpec.currentTaskSha256],
    ['solutionContent', examSpec.currentSolutionSha256],
    ['scoring', examSpec.currentScoringSha256],
  ]) {
    const value = exam.examData[field]
    assert.equal(sha256(typeof value === 'string' ? value : JSON.stringify(value)), hash,
      `Current ${field} drift: ${examSpec.id}`)
  }
  assert.equal(exam.examData.scoring.steps.reduce((sum, step) => sum + step.points, 0),
    exam.examData.scoring.maxPoints)

  const identified = new Map()
  for (const [status, entries] of [
    ['fully_supported_current', examSpec.currentFullySupported],
    ['partial_current', examSpec.currentPartial],
  ]) {
    for (const entry of entries) {
      assert.ok(exam.examData.coveredGoalIds.includes(entry.goalId),
        `${status} goal not claimed: ${entry.goalId}`)
      assert.ok(!identified.has(entry.goalId), `Duplicate audit: ${entry.goalId}`)
      assert.ok(exam.examData.scoring.steps.some(step => step.id === entry.part
        && step.points === entry.points), `Scored part drift: ${entry.part}`)
      identified.set(entry.goalId, { status, ...entry })
    }
  }
  const entries = exam.examData.coveredGoalIds.map(goalId => {
    const goal = byId.get(goalId)
    assert.ok(goal, `Unknown claimed goal: ${goalId}`)
    const decision = identified.get(goalId) ?? {
      status: 'unsupported_current',
      goalId,
      part: null,
      points: 0,
      missing: 'No scored current subtask demonstrates the full named competency',
    }
    classification.set(`${exam.id}|${goalId}`, decision.status)
    return { goalId, goalTitle: goal.title, ...decision }
  })
  const proposed = examSpec.proposedCoveredGoalIdsAfterRevision
  assert.equal(new Set(proposed).size, proposed.length)
  for (const id of proposed) assert.ok(byId.has(id), `Unknown proposed goal: ${id}`)
  assert.deepEqual(examSpec.proposedCoveredStrandsAfterRevision, ['L3'])
  for (const id of proposed) assert.ok(byId.get(id).dimensionTags.guidingIdeas.includes('L3'),
    `Non-L3 proposed goal: ${id}`)
  return {
    examId: exam.id,
    currentReviewStatus: exam.examData.reviewStatus,
    taskSha256: examSpec.currentTaskSha256,
    solutionSha256: examSpec.currentSolutionSha256,
    scoringSha256: examSpec.currentScoringSha256,
    claimedCount: entries.length,
    fullySupportedCurrentCount: entries.filter(entry => entry.status === 'fully_supported_current').length,
    partialCurrentCount: entries.filter(entry => entry.status === 'partial_current').length,
    unsupportedCurrentCount: entries.filter(entry => entry.status === 'unsupported_current').length,
    currentClaimAudit: entries,
    proposedCoveredGoalIdsAfterRevision: proposed,
    proposedCoveredStrandsAfterRevision: examSpec.proposedCoveredStrandsAfterRevision,
    proposedRequiresNeedIndependentReview: examSpec.proposedRequiresNeedIndependentReview,
  }
})
assert.equal(classification.size, spec.exams.reduce((sum, exam) => sum + exam.currentClaimCount, 0))
assert.deepEqual(examAudit.map(exam => exam.claimedCount), [41, 22])

const reuse = spec.reuse857c
const reuseExam = byId.get(reuse.sourceExamId)
const reuseExamData = reuseExam?.examData
assert.ok(reuseExamData, 'Missing current two-plane source exam')
assert.equal(reuseExamData.reviewStatus, 'released')
assert.deepEqual(reuseExam.requires, reuse.existingNodeClaimAndRequiresRecommendation)
assert.deepEqual(reuseExamData.coveredGoalIds, reuse.existingNodeClaimAndRequiresRecommendation)
assert.deepEqual(reuse.existingReviewAppliesOnlyTo, reuseExamData.coveredGoalIds)
assert.equal(reuseExamData.sourceArtifactPath, reuse.sourceArtifactPath)
assert.equal(sha256(readFileSync(resolve(root, reuse.sourceArtifactPath))), reuse.sourceArtifactSha256)
for (const [field, hash] of [
  ['taskContent', reuse.taskSha256],
  ['solutionContent', reuse.solutionSha256],
  ['scoring', reuse.scoringSha256],
  ['reviewNote', reuse.existingReviewNoteSha256],
]) {
  const value = reuseExamData[field]
  assert.equal(sha256(typeof value === 'string' ? value : JSON.stringify(value)), hash,
    `Two-plane ${field} drift`)
}
assert.equal(reuseExamData.scoring.maxPoints, 20)
assert.equal(reuseExamData.scoring.passingPoints, 18)
assert.equal(reuseExamData.scoring.steps.filter(step => step.id.startsWith('plane_plane_a_'))
  .reduce((sum, step) => sum + step.points, 0), 8)
assert.equal(reuseExam.extendedData?.applicabilityFromRequires, true)
assert.deepEqual(reuse.newDistinctNodeClaimAndRequiresRecommendation, [reuse.additionalGoalId])
const heMapping = JSON.parse(readFileSync(resolve(root,
  'curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_math_upper_secondary_source_extraction_to_canonical_math.review.json'), 'utf8'))
const bwMapping = JSON.parse(readFileSync(resolve(root,
  'curricula/DE/Gymnasium/mapping/DE-BW/upper-secondary/bw_math_upper_secondary_source_extraction_to_canonical_math.review.json'), 'utf8'))
for (const id of [reuse.currentCoveredGoalId, reuse.additionalGoalId]) {
  assert.ok(heMapping.mappings.some(edge => edge.canonicalGoalId === id && edge.matchType === 'exact'),
    `Missing HE exact source edge for ${id}`)
  assert.ok(bwMapping.mappings.some(edge => edge.canonicalGoalId === id && edge.matchType === 'partial'),
    `Missing BW partial source edge for ${id}`)
}
assert.ok(reuse.currentTargetScopes['0f4f9957'].includes('DE-SH|SekII||LK'))
assert.ok(!reuse.currentTargetScopes['857c1c46'].includes('DE-SH|SekII||LK'))
assert.ok(reuse.currentTargetScopes['857c1c46'].every(scope =>
  reuse.currentTargetScopes['0f4f9957'].includes(scope)))
for (const t of [-2, 0, 1, 3]) {
  const point = [t, 5 - 3 * t, 6 - 5 * t]
  assert.equal(point[0] + 2 * point[1] - point[2], 4)
  assert.equal(2 * point[0] - point[1] + point[2], 1)
}

// Check the actual mathematics of the proposed repair, independently of its
// wording: scalar product, volumes, line/plane intersection, and all twelve
// cuboid edges. Axis intercepts outside the cuboid are not polygon vertices.
assert.equal(6 * 0 + 0 * 4 + 0 * 0, 0)
assert.equal(6 * 4 / 2, 12)
assert.equal(12 * 3 / 3, 12)
assert.equal(12 * 3, 36)
assert.equal(12 * 1.5 ** 3, 40.5)
const line = t => [1 + 2 * t, 2 - t, 3 + t]
assert.deepEqual(line(2), [5, 0, 5])
assert.deepEqual(line(3), [7, -1, 6])
assert.deepEqual(line(1.5), [4, 0.5, 4.5])
assert.equal(line(1.5).reduce((sum, x) => sum + x, 0), 9)
const limits = [6, 4, 3]
const vertices = new Set()
for (let moving = 0; moving < 3; moving++) {
  const fixed = [0, 1, 2].filter(index => index !== moving)
  for (const v1 of [0, limits[fixed[0]]]) for (const v2 of [0, limits[fixed[1]]]) {
    const coordinate = 9 - v1 - v2
    if (coordinate < 0 || coordinate > limits[moving]) continue
    const point = [0, 0, 0]
    point[moving] = coordinate
    point[fixed[0]] = v1
    point[fixed[1]] = v2
    vertices.add(point.join(','))
  }
}
assert.deepEqual([...vertices].sort(), ['2,4,3', '5,4,0', '6,0,3', '6,3,0'])
const edgeOrder = [[6, 0, 3], [6, 3, 0], [5, 4, 0], [2, 4, 3]]
for (let i = 0; i < edgeOrder.length; i++) {
  const a = edgeOrder[i], b = edgeOrder[(i + 1) % edgeOrder.length]
  assert.equal(a.reduce((sum, x) => sum + x, 0), 9)
  assert.ok([0, 1, 2].some(j => a[j] === b[j] && (a[j] === 0 || a[j] === limits[j])),
    `Adjacent polygon vertices do not share a cuboid face: ${a}, ${b}`)
}

const practiceClusterPrefixes = [
  '28b45b93', 'c25158fc', '14b19ee4', '967d1863',
  'f24096c6', '57f07e66', 'd2560dc7', '6b0d2a97',
]
const prefixId = prefix => {
  const matches = [...byId.keys()].filter(id => id.startsWith(prefix))
  assert.equal(matches.length, 1, `Ambiguous/missing prefix: ${prefix}`)
  return matches[0]
}
const terminalIds = new Set(practiceClusterPrefixes
  .flatMap(prefix => byId.get(prefixId(prefix)).contains ?? [])
  .filter(id => byId.get(id)?.examData))
const currentQ2Terminals = canonical.goals.filter(goal => goal.phase === 'Q2' && goal.examData)
assert.ok(currentQ2Terminals.every(goal => terminalIds.has(goal.id)),
  'A current Q2 assessment is missing from the selected local terminal set')
const replacement = new Map(spec.exams.map(exam => [exam.id,
  exam.proposedCoveredGoalIdsAfterRevision]))
const successors = new Map()
for (const goal of canonical.goals) {
  for (const prerequisite of replacement.get(goal.id) ?? goal.requires ?? []) {
    if (!successors.has(prerequisite)) successors.set(prerequisite, new Set())
    successors.get(prerequisite).add(goal.id)
  }
}
const hasTerminalPath = start => {
  const queue = [start], seen = new Set(queue)
  for (const id of queue) {
    if (terminalIds.has(id)) return true
    for (const next of successors.get(id) ?? []) if (!seen.has(next)) {
      seen.add(next)
      queue.push(next)
    }
  }
  return false
}
const withdrawn = [...new Set(spec.exams.flatMap(exam => byId.get(exam.id).requires
  .filter(id => !exam.proposedCoveredGoalIdsAfterRevision.includes(id))))]
const otherCurrentExams = [...terminalIds]
  .filter(id => !replacement.has(id))
  .map(id => byId.get(id))
const otherCurrentDirect = withdrawn.filter(id => otherCurrentExams.some(exam =>
  exam.examData.coveredGoalIds.includes(id)))
const unprojectedNoTerminalPath = withdrawn.filter(id => !hasTerminalPath(id))
assert.equal(withdrawn.length, spec.expectedWithdrawnUniqueRequiresCount)
assert.equal(otherCurrentDirect.length, 0,
  'Another current exam now directly covers a withdrawn goal; re-audit the replacement plan')
assert.equal(unprojectedNoTerminalPath.length, spec.expectedUnprojectedNoTerminalPathCount)

const audit = {
  schemaVersion: 1,
  status: spec.status,
  canonicalPath: spec.canonicalPath,
  candidateTaskSha256: sha256(taskText),
  officialSourceUrl: spec.officialSourceUrl,
  sourcePagesPrinted: spec.sourcePagesPrinted,
  exams: examAudit,
  reuse857c: {
    ...reuse,
    currentReviewStatus: reuseExamData.reviewStatus,
    currentTaskAScoredPoints: 8,
    sourceAndCurrentExamFingerprintVerified: true,
    sourceMappingEdgesVerified: true,
    currentAtlasScopesRecomputedByThisScript: false,
    newCoverageReviewed: false,
  },
  hypotheticalCombinedNarrowing: {
    withdrawnDistinctPrerequisiteCount: withdrawn.length,
    otherCurrentDirectAssessmentCount: otherCurrentDirect.length,
    unprojectedNoTerminalPathCount: unprojectedNoTerminalPath.length,
    unprojectedNoTerminalPathGoalIds: unprojectedNoTerminalPath,
    scopeProjectionReviewed: false,
    replacementAssessmentReviewed: false,
    note: 'Necessary diagnostic only; no proposed requires, course projection or release decision is approved.',
  },
}
const outputPath = resolve(packageDir, 'coverage-audit.json')
const serialized = JSON.stringify(audit, null, 2) + '\n'
if (process.argv.includes('--write')) writeFileSync(outputPath, serialized)
else assert.equal(readFileSync(outputPath, 'utf8'), serialized,
  'Coverage audit is stale; inspect the canonical and candidate delta before regenerating')
console.log(`OK candidate audit: ${examAudit.map(exam => exam.claimedCount).join('+')} current claims; ${withdrawn.length} withdrawn edges and ${unprojectedNoTerminalPath.length} unprojected missing terminal routes after hypothetical narrowing.`)
console.log('No canonical, projection, independent review, release, CQR or M7 approval performed.')
