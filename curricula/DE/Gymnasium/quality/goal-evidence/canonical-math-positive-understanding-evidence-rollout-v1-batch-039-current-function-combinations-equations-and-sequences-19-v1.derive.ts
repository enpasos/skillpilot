import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { buildPositiveGoalEvidenceCandidateRecords } from '../../../../../app/scripts/materializePositiveGoalEvidenceCandidates'
import { fingerprintGoalForPositiveEvidence, fingerprintPositiveGoalEvidenceReviewInput, fingerprintPositiveGoalEvidenceProfile } from '../../../../../app/scripts/positiveGoalEvidenceProfileModel'
import { fingerprintSemanticKindSourceGoal } from '../../../../../app/scripts/goalBookModel'
const sourceStem = 'curricula/DE/Gymnasium/quality/goal-evidence/canonical-math-positive-understanding-evidence-rollout-v1-batch-039-function-combinations-equations-and-sequences-20-v1'
const targetStem = 'curricula/DE/Gymnasium/quality/goal-evidence/canonical-math-positive-understanding-evidence-rollout-v1-batch-039-current-function-combinations-equations-and-sequences-19-v1'
const oldInputPath = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-07/batch-039-function-combinations-equations-and-sequences-20-v1/round-a/batches/mathematik-rollout-v1-batch-039-function-combinations-equations-and-sequences-20-v1-20260907-first-pass-a.batch-001.input.jsonl'
const excluded = '12a8dffc-dea7-5f2c-b490-2a1a2bb6901b'
const children = ['630bb145-9a3f-5c88-ab5a-fb69a9bb76e4', '74b5a01b-c086-51d0-bc66-046029c92ef7']
const changedIds = ['4d55ba50-8d67-560c-a10f-cccff4728c40', '565fcd3f-52cd-5402-a0ac-a1069ed9c598', 'c66cb27b-8199-58fb-95f4-6314c0c2d07b']
const sha = (value: string | Buffer) => 'sha256:' + createHash('sha256').update(value).digest('hex')
const jsonl = (path: string) => readFileSync(path, 'utf8').trimEnd().split('\n').map(line => JSON.parse(line))
const unique = (rows: any[], key: string, id: string) => {
  const matches = rows.filter(row => row[key] === id); assert.equal(matches.length, 1, key + ': ' + id); return matches[0]
}
async function main() {
  const sourceConfig = JSON.parse(readFileSync(sourceStem + '.config.json', 'utf8'))
  const sourceCandidates = JSON.parse(readFileSync(sourceStem + '.candidates.json', 'utf8'))
  const sourceRecords = jsonl(sourceStem + '.review.jsonl')
  assert.equal(sourceCandidates.goals.length, 20); assert.equal(sourceRecords.length, 20)
  assert.deepEqual(sourceConfig.scope.goalIds, sourceCandidates.goals.map((g: any) => g.goalId))
  assert.deepEqual(sourceConfig.reviewedResourceTypes, [])
  const goalIds = sourceConfig.scope.goalIds.filter((id: string) => id !== excluded)
  assert.equal(goalIds.length, 19)
  const reviewId = 'canonical-math-positive-evidence-b039-current-function-combinations-equations-sequences-19-v1'
  const config = { ...structuredClone(sourceConfig), reviewId, reviewPath: targetStem + '.review.jsonl', scope: { label: 'Mathematik B039 current19: unveränderte bestehende P-Körper ohne das nun strukturelle Reihen-Elternziel; genau drei Voraussetzungskontexte aktualisiert, keine neunzehn neuen Reviews.', goalIds } }
  const candidates = { ...structuredClone(sourceCandidates), reviewId, goals: sourceCandidates.goals.filter((g: any) => g.goalId !== excluded).map((g: any) => structuredClone(g)) }
  assert.equal(candidates.reviewedAt, sourceCandidates.reviewedAt)
  assert.equal(candidates.reviewer, sourceCandidates.reviewer)
  const landscape = JSON.parse(readFileSync(config.landscapePath, 'utf8'))
  const kinds = JSON.parse(readFileSync(config.semanticKindLedgerPath, 'utf8'))
  assert.equal(unique(kinds.decisions, 'goalId', excluded).semanticKind, 'curricularArea')
  const oldInputs = jsonl(oldInputPath)
  const criteriaFingerprint = sha(readFileSync(config.reviewCriteriaPath))
  const sourcePaths = [sourceStem + '.config.json', sourceStem + '.candidates.json', sourceStem + '.review.jsonl', oldInputPath, config.landscapePath, config.semanticKindLedgerPath, config.reviewCriteriaPath, targetStem + '.derive.ts']
  const sourceFiles = sourcePaths.map(path => ({ path, sha256: sha(readFileSync(path)) }))
  const records = await buildPositiveGoalEvidenceCandidateRecords({ config, candidateSet: candidates })
  const retainedBodies: any[] = [], contextChanges: any[] = []
  for (const candidate of candidates.goals) {
    const id = candidate.goalId, before = unique(sourceRecords, 'goalId', id), after = unique(records, 'goalId', id)
    const oldSpec = unique(sourceCandidates.goals, 'goalId', id)
    assert.deepEqual(candidate, oldSpec, 'CandidateSpec must remain exact: ' + id)
    const goal = unique(landscape.goals, 'id', id), kind = unique(kinds.decisions, 'goalId', id)
    assert.equal(kind.semanticKind, 'curricularAtomic'); assert.equal(kind.decisionStatus, 'authoritative')
    assert.equal(kind.sourceFingerprint, fingerprintSemanticKindSourceGoal(goal))
    assert.deepEqual(after.profile, before.profile)
    assert.equal(after.profileFingerprint, before.profileFingerprint)
    assert.equal(after.profileFingerprint, fingerprintPositiveGoalEvidenceProfile(candidate.profile))
    assert.equal(after.goalFingerprint, before.goalFingerprint)
    assert.equal(after.goalFingerprint, fingerprintGoalForPositiveEvidence(goal, 'curricularAtomic'))
    assert.equal(after.reviewCriteriaFingerprint, before.reviewCriteriaFingerprint)
    assert.equal(after.status, 'needs_human_review'); assert.equal(after.reviewAuthority, 'ai_candidate')
    const expectedChanged = changedIds.includes(id)
    assert.equal(after.reviewInputFingerprint !== before.reviewInputFingerprint, expectedChanged, 'Only three input fingerprints may change: ' + id)
    const restored = { ...after, reviewId: before.reviewId, reviewInputFingerprint: before.reviewInputFingerprint }
    assert.deepEqual(restored, before, 'Unexpected record field change beyond reviewId/current-input binding: ' + id)
    retainedBodies.push({ goalId: id, candidateSpecSha256: sha(JSON.stringify(candidate)), profileFingerprint: after.profileFingerprint, unchangedGoalFingerprint: after.goalFingerprint, oldRecordLineSha256: sha(JSON.stringify(before) + '\n'), newRecordLineSha256: sha(JSON.stringify(after) + '\n'), reviewInputChanged: expectedChanged })
    if (expectedChanged) {
      const oldBound = unique(oldInputs.map(row => row.goal), 'goalId', id)
      const requiresBefore = oldBound.canonicalContext.requires
      const expectedRequires = requiresBefore.flatMap((required: string) => required === excluded ? children : [required])
      assert.deepEqual(goal.requires, expectedRequires, 'Require replacement must be exact')
      const reconstructedBefore = { ...structuredClone(goal), requires: requiresBefore }
      assert.equal(fingerprintPositiveGoalEvidenceReviewInput(reconstructedBefore, criteriaFingerprint, {}, 'curricularAtomic'), before.reviewInputFingerprint, 'The replaced requires must fully explain previous input fingerprint')
      assert.equal(fingerprintPositiveGoalEvidenceReviewInput(goal, criteriaFingerprint, {}, 'curricularAtomic'), after.reviewInputFingerprint)
      contextChanges.push({ goalId: id, requiresBefore, requiresAfter: goal.requires, beforeReviewInputFingerprint: before.reviewInputFingerprint, afterReviewInputFingerprint: after.reviewInputFingerprint, unchangedGoalFingerprint: before.goalFingerprint, unchangedProfileFingerprint: before.profileFingerprint, proof: 'Restoring only the old requires list on the current goal exactly reconstructs the old native reviewInputFingerprint.' })
    }
  }
  assert.deepEqual(contextChanges.map(row => row.goalId), changedIds)
  const reviewBytes = records.map(row => JSON.stringify(row)).join('\n') + '\n'
  const receipt = {
    schemaVersion: 1, kind: 'math-b039-current19-derivation-v1', recordedAt: new Date().toISOString(),
    author: { provider: 'OpenAI', model: 'unknown', modelVersion: 'unknown', authority: 'ai_candidate' },
    sourceFiles, destinationCandidatePath: targetStem + '.candidates.json', excludedGoalId: excluded,
    rule: 'Retain exactly the nineteen original CandidateSpecs/Profile bodies and original authorship date/reviewer. Exclude the now curricularArea parent 12a8. Native rebuild changes reviewId for the derived lane and exactly three reviewInputFingerprint values, no other retained record fields.',
    retainedBodies, contextChanges,
    counterreviewDirection: 'Root explicitly reported a fresh full reading of the three affected existing profile bodies and found their evidence unchanged because both split children jointly replace the previous broad prerequisite; root had read the other retained profiles earlier. This derivative does not claim nineteen new reviews or a human approval.',
    imageBoundary: 'reviewedResourceTypes remains []; images and image QA stay independent. Existing resourceLink input semantics are preserved by the exact native fingerprint proof.',
    nativeBinding: { builder: 'app/scripts/materializePositiveGoalEvidenceCandidates.ts#buildPositiveGoalEvidenceCandidateRecords', goalFingerprintRule: 'goal-evidence-v1', profileRule: 'positive-understanding-evidence-v2', reviewCriteriaFingerprint: criteriaFingerprint, reviewOutputSha256: sha(reviewBytes) },
    checks: { exactRetainedCandidateSpecs: 19, exactRetainedProfileBodies: 19, unchangedGoalFingerprints: 19, unchangedProfileFingerprints: 19, changedReviewInputFingerprints: 3, originalFilesUnmodified: true },
    authority: 'Derivative AI-candidate lane, not nineteen new independent reviews, human approval, empirical evidence, learner mastery, D closure or registry promotion.',
  }
  let patch = '*** Begin Patch\n'
  for (const [suffix, bytes] of [['.config.json', JSON.stringify(config, null, 2) + '\n'], ['.candidates.json', JSON.stringify(candidates, null, 2) + '\n'], ['.review.jsonl', reviewBytes], ['.derivation-receipt.json', JSON.stringify(receipt, null, 2) + '\n']]) {
    const path = targetStem + suffix
    assert.equal(existsSync(path), false, 'Refuse overwrite: ' + path)
    patch += '*** Add File: ' + path + '\n' + bytes.trimEnd().split('\n').map(line => '+' + line).join('\n') + '\n'
  }
  patch += '*** End Patch\n'
  for (const file of sourceFiles) assert.equal(sha(readFileSync(file.path)), file.sha256, 'Concurrent drift: ' + file.path)
  process.stdout.write(JSON.stringify({ patch, summary: { profiles: records.length, changedInputBindings: contextChanges.length, reviewSha256: sha(reviewBytes), candidateSha256: sha(JSON.stringify(candidates, null, 2) + '\n'), receiptSha256: sha(JSON.stringify(receipt, null, 2) + '\n') } }))
}
void main()
