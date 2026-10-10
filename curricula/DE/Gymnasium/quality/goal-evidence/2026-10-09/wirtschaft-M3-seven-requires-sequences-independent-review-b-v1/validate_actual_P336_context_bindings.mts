import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
const [repoArg, outputArg] = process.argv.slice(2)
const repo = resolve(repoArg)
const author = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-M3-seven-nonuniversal-prerequisite-bounded-author-v1'
const json = (p: string) => JSON.parse(readFileSync(p, 'utf8'))
const before = json(resolve(repo, 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'))
const after = json(resolve(repo, author, 'whole-current-CAN493.seven-requires-only.inert-author-candidate.json'))
const beforeGoals = new Map(before.goals.map((g: any) => [g.id, g]))
const afterGoals = new Map(after.goals.map((g: any) => [g.id, g]))
const originalP = readFileSync(resolve(repo, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-current485-V13-two-reviewed-requires-P336-SEM485-binding-only-author-v1/whole-P336-only-two-current-reviewed-requires-input-fingerprint-successors.jsonl'), 'utf8').trim().split('\n').map(line => JSON.parse(line))
const afterP = readFileSync(resolve(repo, author, 'whole-P336.only-seven-conditional-input-bindings.inert-technical-impact.jsonl'), 'utf8').trim().split('\n').map(line => JSON.parse(line))
const validator: any = await import(pathToFileURL(resolve(repo, 'app/scripts/positiveGoalEvidenceProfileModel.ts')).href)
assert.equal(originalP.length, 336)
assert.equal(afterP.length, 336)
const cases = originalP.reduce((n: number, r: any) => n + r.profile.applicationCaseBriefs.length, 0)
assert.equal(cases, 685)
const changed: any[] = []
for (let i = 0; i < originalP.length; i++) {
  const old = originalP[i], candidate = afterP[i]
  assert.deepEqual({ ...candidate, reviewInputFingerprint: old.reviewInputFingerprint }, old, 'no content/status/authority/history promotion')
  const currentErrors = validator.validatePositiveGoalEvidenceRecordSemantics(old, beforeGoals.get(old.goalId), {}, 'curricularAtomic')
  assert.deepEqual(currentErrors, [])
  const originalAgainstCandidate = validator.validatePositiveGoalEvidenceRecordSemantics(old, afterGoals.get(old.goalId), {}, 'curricularAtomic')
  const qualifiedErrors = validator.validatePositiveGoalEvidenceRecordSemantics(candidate, afterGoals.get(old.goalId), {}, 'curricularAtomic')
  assert.deepEqual(qualifiedErrors, [])
  if (old.reviewInputFingerprint !== candidate.reviewInputFingerprint) {
    assert.equal(originalAgainstCandidate.length, 1)
    assert(originalAgainstCandidate[0].includes('stale reviewInputFingerprint'))
    changed.push({ goalId: old.goalId, staleOriginalNegative: originalAgainstCandidate, boundedAfterActualRequiresReviewTechnicalBinding: candidate.reviewInputFingerprint, statusUnchanged: candidate.status, authorityUnchanged: candidate.reviewAuthority })
  } else assert.deepEqual(originalAgainstCandidate, [])
}
assert.equal(changed.length, 7)
writeFileSync(resolve(outputArg), JSON.stringify({ role: 'Independent B actual native positive-understanding-v2 whole-current336 semantic validation; no new profile approval', currentRecords: originalP.length, currentCases: cases, currentBeforeErrors: 0, originalAgainstCandidateStaleNegatives: changed, sourceSevenFingerprintsQualifiedOnlyAfterSeparateScientificRequiresReview: true, afterErrors: 0, allWholeProfileBodiesCasesAndStatusesExact: true, allCurrent336And685Retained: true, newHumanOrScientificProfileApproval: false, activeWrites: 0 }, null, 2) + '\n')
console.log(JSON.stringify({ P336: originalP.length, cases, originalStaleNegatives: changed.length, qualifiedErrors: 0, wholeBodyStatusChanges: 0 }))
