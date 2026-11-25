// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fingerprintSemanticKindSourceGoal } from '../goalBookModel'

export const releasedHeadingsRoot = 'curricula/DE/Gymnasium/quality/assessment-review/physik/e1-released-marking-headings-20261124-v1'
type Ref = {path: string; sha256: string}
type Edit = {goalId: string; field: 'solutionContent' | 'solutionContentEn'; before: string; after: string;
  utf8ByteOffsetInField: number; removedUtf8Bytes: number; insertedUtf8Bytes: number; beforeTextSha256: string; afterTextSha256: string}
const sha = (bytes: Buffer | string) => createHash('sha256').update(bytes).digest('hex')

export function beforeReleasedMarkingHeadings(root: string, live: Map<string, Record<string, unknown>>) {
  function bound(ref: Ref, family = '') {
    const bytes = readFileSync(resolve(root, family, ref.path))
    assert.equal(sha(bytes), ref.sha256, ref.path)
    return bytes.toString('utf8')
  }
  const local = (ref: Ref) => bound(ref, releasedHeadingsRoot)
  const review = JSON.parse(local({path: 'review-disposition.actual.json', sha256: 'a5082c9399a52a462e2ad96baac8e2818754b320989022a8fde6cb463cbf99e2'}))
  assert.equal(review.eligibleForActivation, true)
  const diff: {edits: Edit[]} = JSON.parse(local(review.headingDiff))
  const shown = diff.edits.map((edit, i) => ({rowId: 'H' + (i + 1), field: edit.field, removed: edit.before, added: edit.after}))
  assert.equal(shown.length, 6)
  assert(local(review.reviewInput).trimEnd().endsWith(JSON.stringify(shown, null, 2)))
  local(review.outputSchema)
  assert.deepEqual(review.judgments.map((r: {model: string}) => r.model), ['gpt-6.1-sol', 'gpt-6.2-astra'])
  const sessions = new Set<string>()
  for (const judgment of review.judgments) {
    const run = JSON.parse(local(judgment.receipt)), response = JSON.parse(local(judgment.response))
    assert.deepEqual([run.round, run.model, run.provider, run.blindToOtherRound, run.exitCode, run.toolCalls,
      run.modelVerifiedFromNativeSession, run.originalResponseVerified, judgment.decision, response.decision],
    [judgment.round, judgment.model, 'OpenAI', true, 0, 0, true, true, 'confirm', 'confirm'])
    assert.deepEqual(run.inputArtifacts, [review.reviewInput, review.outputSchema])
    for (const ref of run.outputArtifacts) local(ref)
    const event = JSON.parse(local(run.outputArtifacts.find((ref: Ref) => ref.path.endsWith('/native-answer.jsonl'))))
    assert.deepEqual(JSON.parse(event.item.text), response)
    assert.deepEqual(response.rows, shown.map(r => ({rowId: r.rowId, criterionChanged: false})))
    sessions.add(run.threadIdSha256)
  }
  assert.equal(sessions.size, 2)
  const semantics = JSON.parse(local({path: 'semantic-kind-bindings.actual.json', sha256: '9def6cf27ddfb8bc374656b416250d9c633608b5b9081c9d54659c94eee932ab'}))
  assert.equal(semantics.headingDiff.sha256, review.headingDiff.sha256)
  assert.equal(semantics.diffReview.sha256, 'a5082c9399a52a462e2ad96baac8e2818754b320989022a8fde6cb463cbf99e2')
  assert.deepEqual(semantics.goals.map((r: {goalId: string}) => r.goalId).sort(), [...new Set(diff.edits.map(e => e.goalId))].sort())
  const previous = new Map(live)
  for (const row of semantics.goals) {
    const active = live.get(row.goalId)!
    const original = JSON.parse(bound(row.previousGoal))
    const expected = structuredClone(original)
    const pair = diff.edits.filter(e => e.goalId === row.goalId)
    assert.deepEqual(pair.map(e => e.field), ['solutionContent', 'solutionContentEn'])
    for (const e of pair) {
      const field = Buffer.from(original.examData[e.field]), removed = Buffer.from(e.before), added = Buffer.from(e.after)
      const offset = e.utf8ByteOffsetInField
      assert.equal(sha(field), e.beforeTextSha256)
      assert.equal(removed.length, e.removedUtf8Bytes)
      assert.equal(added.length, e.insertedUtf8Bytes)
      assert(field.subarray(offset, offset + removed.length).equals(removed))
      const changed = Buffer.concat([field.subarray(0, offset), added, field.subarray(offset + removed.length)])
      assert.equal(sha(changed), e.afterTextSha256)
      expected.examData[e.field] = changed.toString('utf8')
    }
    assert.deepEqual(active, expected, row.goalId + ': changed beyond the two released headings')
    const priorKind = JSON.parse(bound(row.previousSemanticDecision))
    assert.deepEqual([row.semanticKind, priorKind.semanticKind, row.previousSourceFingerprint, row.currentSourceFingerprint],
      ['practiceAssessment','practiceAssessment',fingerprintSemanticKindSourceGoal(original),fingerprintSemanticKindSourceGoal(active)])
    assert.equal(row.previousSourceFingerprint, priorKind.currentSourceFingerprint)
    previous.set(row.goalId, original)
  }
  return previous
}
