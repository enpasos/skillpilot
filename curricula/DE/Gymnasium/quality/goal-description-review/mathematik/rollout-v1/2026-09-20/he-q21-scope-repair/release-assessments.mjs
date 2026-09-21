// Guarded one-time AI assessment acceptance; emits apply_patch, never writes directly.
import fs from 'node:fs'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'

const base = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-20/he-q21-scope-repair'
const canonical = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const kinds = 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json'
const read = p => JSON.parse(fs.readFileSync(p, 'utf8'))
const hash = b => createHash('sha256').update(b).digest('hex')
const counter = read(base + '/review-a.json')
const current = read(canonical), ledger = read(kinds)
const { fingerprintSemanticKindSourceGoal } = await import(pathToFileURL(process.cwd() + '/app/scripts/goalBookModel.ts'))
assert.equal(counter.humanApproval, false)
assert.equal(counter.blockingFindingCount, 0)
assert.equal(counter.assessments.length, 3)
assert.equal(hash(fs.readFileSync(counter.binding.artifactPath)), counter.binding.artifactSha256)
const findings = [
  'Root independently recalculated reciprocal-power parity, domains/ranges, one-sided pole limits, derivative -n*x^(-n-1), sqrt derivative and the unbounded right difference quotient at zero. The three covered goals are actually exercised by parts1-3; point sums8+4+6=18, pass9. No logarithmic prerequisite is mathematically needed.',
  'Root derived u=-(x-1)/2 => x=1-2u and image ordinate3-2v; P maps to(1,1), Q to(-3,-3). The alternative inner factor-2 gives x=1-u/2. Even f yields h(1+t)=h(1-t), opposite paired tangent slopes and derivative symmetry about(1,0). The supplied example gives h=1-(x-1)^2/4 with all three image points correct. Five actual graph goals are exercised;8+3+7=18, pass9.',
  'Root checked the non-injectivity counterexample, both half-domain inverse branches, their domains/ranges and coordinate swap(2,4)<->(4,2). Parts3+3+4=10, pass5. The existing equivalent-solutions clause is operative: either a fully explained image collision or a fully explained failed reverse composition suffices in part1; no second proof is required for full credit.'
]
const records = counter.assessments.map((record, index) => {
  const goal = current.goals.find(g => g.id === record.goalId)
  const kind = ledger.decisions.find(d => d.goalId === record.goalId)
  assert(goal && kind)
  assert.equal(hash(JSON.stringify(goal)), record.goalSha256, 'Reviewed task changed')
  assert.equal(goal.examData.reviewStatus, 'needs_review')
  assert.equal(kind.sourceFingerprint, fingerprintSemanticKindSourceGoal(goal))
  assert.deepEqual(goal.requires, goal.examData.coveredGoalIds)
  assert.equal(goal.examData.scoring.steps.reduce((n, step) => n + step.points, 0), goal.examData.scoring.maxPoints)
  const before = { goalSha256: record.goalSha256, kindFingerprint: kind.sourceFingerprint }
  goal.examData.reviewStatus = 'released'
  goal.examData.reviewNote = 'Local machine-only acceptance on 2026-09-20 after author check, independent content review math_m7_current_scope and informed Root integration check; exact pre-release goal hashes and calculations are bound in he-q21-scope-repair/assessment-release-root.json. No human review, learner performance, publication or deployment is claimed. Equivalent fully justified solutions receive equivalent credit.'
  kind.sourceFingerprint = fingerprintSemanticKindSourceGoal(goal)
  return { goalId: goal.id, before, afterGoalSha256: hash(JSON.stringify(goal)), afterKindFingerprint: kind.sourceFingerprint, rootContentCheck: findings[index], bodyChanges: false }
})
const receipt = { schemaVersion: 1, date: '2026-09-20', reviewer: 'OpenAI Codex root', reviewKind: 'informed independent content and integration check', authoredTasks: false, readCounterReview: true, blindReview: false, humanApproval: false, decision: 'local_machine_acceptance', counterReview: { path: base + '/review-a.json', sha256: hash(fs.readFileSync(base + '/review-a.json')) }, records, finalGateChecksPending: true }
const receiptPath = base + '/assessment-release-root.json'
assert(!fs.existsSync(receiptPath), 'One-time receipt already exists; do not replay')
const patch = ['*** Begin Patch']
for (const [path, value] of [[canonical, current], [kinds, ledger]]) {
  const diff = spawnSync('diff', ['-u', path, '-'], { input: JSON.stringify(value, null, 2) + '\n', encoding: 'utf8', maxBuffer: 8e6 })
  assert.equal(diff.status, 1)
  patch.push('*** Update File: ' + path, ...diff.stdout.trimEnd().split('\n').slice(2).map(line => /^@@ .* @@/u.test(line) ? '@@' : line))
}
patch.push('*** Add File: ' + receiptPath, ...JSON.stringify(receipt, null, 2).split('\n').map(line => '+' + line), '*** End Patch')
console.log(patch.join('\n'))
