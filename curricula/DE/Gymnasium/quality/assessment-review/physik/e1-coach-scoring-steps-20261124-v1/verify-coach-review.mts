// SPDX-License-Identifier: Apache-2.0
// Run from the repository root with app/node_modules/.bin/tsx.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { copyFileSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const root = process.cwd()
const consumer = 'app/scripts/lib/e1AchievableScoringReviews.ts'
const { achievableReviewRoot: first, coachScoringReviewRoot: second, coachDescriptionLimit, verifiedCoachScoringReviewChain } =
  await import(pathToFileURL(resolve(root, consumer)).href)
const landscape = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
const read = (file: string) => JSON.parse(readFileSync(file, 'utf8'))
const digest = (file: string) => createHash('sha256').update(readFileSync(file)).digest('hex')
const ref = (path: string) => ({path, sha256: digest(join(root, path))})
const canonical = (value: unknown): string => {
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']'
  if (value !== null && typeof value === 'object') {
    const entries = Object.entries(value).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)
    return '{' + entries.map(([k, v]) => JSON.stringify(k) + ':' + canonical(v)).join(',') + '}'
  }
  return JSON.stringify(value)
}
type Step = {id: string; points: number; description: string}
type Goal = {id: string; examData: {scoring: {passingPoints: number; maxPoints: number; steps: Step[]}}}
const raw = read(join(root, landscape))
const live = new Map<string, Goal>(raw.goals.map((goal: Goal) => [goal.id, goal]))
const archive = mkdtempSync(join(tmpdir(), 'skillpilot-coach-scoring-'))
const firstCommit = 'dd5851ea8cb7db9ac82177b72c808225c7b136e9'
try {
  for (const family of [first, second]) {
    mkdirSync(dirname(join(archive, family)), {recursive: true})
    cpSync(join(root, family), join(archive, family), {recursive: true})
  }
  const previousReceipt = first + '/native-replay.actual.json'
  const previous = read(join(root, previousReceipt))
  assert.equal(ref(previousReceipt).sha256, '70a3e582fc16890c22d508553f52133b83620033f9c0d3fc94771e985ed71ea2')
  const snapshot = second + '/prior-native-consumer.ts.snapshot'
  assert.equal(ref(snapshot).sha256, previous.consumer.sha256)
  const intermediate = structuredClone(raw)
  const checkpoints = []
  for (const row of previous.checks) {
    if (!row.accepted) continue
    const pointer = read(join(archive, row.accepted.path))
    const firstAttempt = join(first, row.goalId, pointer.reviewPath)
    const number = intermediate.goals.findIndex((goal: Goal) => goal.id === row.goalId)
    assert(number >= 0)
    intermediate.goals[number] = read(join(archive, firstAttempt, 'candidate.goal.json'))
    const r2 = join(archive, first, row.goalId, 'r2-coverage.actual.json')
    if (existsSync(r2)) {
      const receipt = read(r2)
      const owningUnit = intermediate.programUnits.find((unit: {id: string}) => unit.id === receipt.unitId)
      const position = owningUnit.coverageReviews.findIndex((review: {assessmentGoalId: string}) => review.assessmentGoalId === row.goalId)
      assert(position >= 0)
      owningUnit.coverageReviews[position] = receipt.coverage
    }
    const current = live.get(row.goalId)!
    const secondPointer = join(second, row.goalId, 'accepted.actual.json')
    const shortened = existsSync(join(archive, secondPointer))
    const changedSteps = current.examData.scoring.steps.flatMap((step: Step, index: number) => {
      const before = intermediate.goals[number].examData.scoring.steps[index]
      return step.description === before.description ? [] : [{stepId: step.id, beforeUTF16: before.description.length, currentUTF16: step.description.length}]
    })
    checkpoints.push({goalId: row.goalId, firstAcceptance: row.accepted, coachAcceptance: shortened ? ref(secondPointer) : null,
      passingPoints: current.examData.scoring.passingPoints, maxPoints: current.examData.scoring.maxPoints, changedSteps,
      criterionCount: current.examData.scoring.steps.length, longestUTF16: Math.max(...current.examData.scoring.steps.map(step => step.description.length))})
  }
  mkdirSync(dirname(join(archive, landscape)), {recursive: true})
  writeFileSync(join(archive, landscape), JSON.stringify(intermediate, null, 2) + '\n')
  assert.equal(digest(join(archive, landscape)), previous.landscape.sha256)
  mkdirSync(dirname(join(archive, consumer)), {recursive: true})
  copyFileSync(join(archive, snapshot), join(archive, consumer))
  for (const path of ['app/scripts/goalBookModel.ts', 'app/scripts/lib/learningUnitContracts.ts']) symlinkSync(join(root, path), join(archive, path))
  const reproduced = execFileSync(join(root, 'app/node_modules/.bin/tsx'), [join(archive, previous.verifier.path)], {cwd: archive})
  assert.deepEqual(reproduced, readFileSync(join(root, previousReceipt)), 'the intermediate native result must replay byte for byte')

  const originals: Map<string, Goal> = verifiedCoachScoringReviewChain(archive, live, canonical)
  const rejectedMutations: Array<{goalId: string; mutation: string}> = []
  function reject(id: string, goal: Goal, mutation: string) {
    const altered = new Map(live)
    altered.set(id, goal)
    assert.throws(() => verifiedCoachScoringReviewChain(archive, altered, canonical), {code: 'ERR_ASSERTION'})
    rejectedMutations.push({goalId: id, mutation})
  }
  for (const [id, prior] of originals) {
    const changed = structuredClone(live.get(id)!)
    changed.examData.scoring.passingPoints -= 0.5
    reject(id, changed, 'unreviewed half-point change')
    const row = checkpoints.find(c => c.goalId === id)
    if (row) {
      reject(id, prior, 'rollback to pre-PR-B rubric')
      if (row.coachAcceptance) reject(id, intermediate.goals.find((goal: Goal) => goal.id === id), 'rollback to oversized criterion descriptions')
    } else {
      reject(id, read(join(archive, first, id, 'v24/candidate.goal.json')), 'activation of rejected FFX v24')
      assert.deepEqual(live.get(id), prior)
    }
  }
  assert.equal(checkpoints.length, 6)
  assert.equal(checkpoints.filter(c => c.coachAcceptance).length, 5)
  assert.equal(checkpoints.flatMap(c => c.changedSteps).length, 12)
  assert(checkpoints.every(c => c.longestUTF16 <= coachDescriptionLimit))
  const compactDispositions = []
  for (const row of checkpoints.filter(c => c.coachAcceptance)) {
    const dir = join(second, row.goalId)
    for (const child of readdirSync(join(archive, dir), {withFileTypes: true})) {
      if (!child.isDirectory() || !/^v[1-9]\d*$/u.test(child.name)) continue
      const path = join(dir, child.name, 'review-disposition.actual.json')
      const decision = read(join(archive, path))
      const comparison = read(join(archive, dir, child.name, decision.priorMarksComparison.path))
      compactDispositions.push({...ref(path), eligibleForActivation: decision.eligibleForActivation,
        judgments: decision.judgments.map((judge: {round: string; decision: string; validationFindings: string[]}) => ({
          round: judge.round, decision: judge.decision, validationFindings: judge.validationFindings})),
        awardsComparedPerRound: comparison.criterionAwardsComparedPerRound, unchangedAllAwards: comparison.unchangedAllAwards})
    }
  }
  compactDispositions.sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0)
  console.log(JSON.stringify({schema: 'physik-e1-coach-scoring-two-stage-native-portability-replay-v1', status: 'PASS',
    intermediate: {commit: firstCommit, rawLandscapeSha256: previous.landscape.sha256, replay: ref(previousReceipt),
      consumerSnapshot: ref(snapshot), byteExactReproduction: true}, landscape: ref(landscape), consumer: ref(consumer),
    verifier: ref(second + '/verify-coach-review.mts'), coachDescriptionLimitUTF16: coachDescriptionLimit, checkpoints,
    compactDispositions, rejectedMutations}, null, 2))
} finally {
  rmSync(archive, {recursive: true, force: true})
}
