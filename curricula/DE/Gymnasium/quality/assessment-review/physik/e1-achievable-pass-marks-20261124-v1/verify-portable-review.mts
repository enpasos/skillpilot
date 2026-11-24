// SPDX-License-Identifier: Apache-2.0
// Run from the repository root with app/node_modules/.bin/tsx.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const root = process.cwd()
const consumer = 'app/scripts/lib/e1AchievableScoringReviews.ts'
const { achievableReviewRoot, verifiedPriorExamGoals } = await import(pathToFileURL(resolve(root, consumer)).href)
const landscape = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
const digest = (file: string) => createHash('sha256').update(readFileSync(resolve(root, file))).digest('hex')
const fileRef = (path: string) => ({ path, sha256: digest(path) })
const canonical = (value: unknown): string => {
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']'
  if (value !== null && typeof value === 'object') {
    const entries = Object.entries(value).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)
    return '{' + entries.map(([k, v]) => JSON.stringify(k) + ':' + canonical(v)).join(',') + '}'
  }
  return JSON.stringify(value)
}
type Goal = {id: string; examData: {scoring: {passingPoints: number; maxPoints: number}}}
const goals: Goal[] = JSON.parse(readFileSync(resolve(root, landscape), 'utf8')).goals
const current = new Map(goals.map(goal => [goal.id, goal]))
const scratch = mkdtempSync(join(tmpdir(), 'skillpilot-e1-review-'))
try {
  const archive = resolve(scratch, achievableReviewRoot)
  mkdirSync(archive, {recursive: true})
  cpSync(resolve(root, achievableReviewRoot), archive, {recursive: true})
  const originals: Map<string, Goal> = verifiedPriorExamGoals(scratch, current, canonical)
  const checks = []
  const rejectedRoundPairs = []
  const reviewSessions = new Set<string>()
  let recordedRoundReceipts = 0
  for (const [id, prior] of originals) {
    const live = current.get(id)!
    const pointer = `${achievableReviewRoot}/${id}/accepted.actual.json`
    const accepted = existsSync(resolve(root, pointer))
    const goalDir = join(archive, id)
    if (existsSync(goalDir)) {
      for (const dir of readdirSync(goalDir, {withFileTypes: true})) {
        if (!dir.isDirectory() || !/^v[1-9]\d*$/u.test(dir.name)) continue
        const path = `${achievableReviewRoot}/${id}/${dir.name}/review-disposition.actual.json`
        if (!existsSync(resolve(scratch, path))) continue
        const record = JSON.parse(readFileSync(resolve(scratch, path), 'utf8'))
        for (const judgment of record.judgments) {
          recordedRoundReceipts++
          if (judgment.threadId) reviewSessions.add(judgment.threadId)
        }
        if (!record.eligibleForActivation) rejectedRoundPairs.push(fileRef(path))
      }
    }
    const changed = structuredClone(live)
    changed.examData.scoring.passingPoints -= 0.5
    const altered = new Map(current)
    altered.set(id, changed)
    assert.throws(() => verifiedPriorExamGoals(scratch, altered, canonical), {code: 'ERR_ASSERTION'})
    if (accepted) {
      altered.set(id, prior)
      assert.throws(() => verifiedPriorExamGoals(scratch, altered, canonical), {code: 'ERR_ASSERTION'})
    } else assert.deepEqual(live, prior)
    checks.push({ goalId: id, accepted: accepted ? fileRef(pointer) : null, passingPoints: live.examData.scoring.passingPoints,
      maxPoints: live.examData.scoring.maxPoints, rejectsUnreviewedHalfPointChange: true, rejectsRollbackToPredecessor: accepted ? true : null })
  }
  assert.equal(checks.length, 7)
  console.log(JSON.stringify({ schema: 'physik-e1-scoring-native-portability-replay-v1', status: 'PASS',
    scope: 'Replay of the scored review records from a separately copied archive using the repository native consumer and ontology profile.',
    landscape: fileRef(landscape), consumer: fileRef(consumer), verifier: fileRef(achievableReviewRoot + '/verify-portable-review.mts'),
    authoritativeAcceptedCount: checks.filter(row => row.accepted).length, recordedRoundReceipts, distinctReviewSessions: reviewSessions.size, checks,
    rejectedRoundPairs: rejectedRoundPairs.sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0) }, null, 2))
} finally {
  rmSync(scratch, {recursive: true, force: true})
}
