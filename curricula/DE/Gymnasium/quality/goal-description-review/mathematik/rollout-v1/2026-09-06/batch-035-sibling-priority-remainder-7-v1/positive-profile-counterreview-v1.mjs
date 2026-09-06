import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import assert from 'node:assert/strict'

const prefix = 'curricula/DE/Gymnasium/quality/goal-evidence/canonical-math-positive-understanding-evidence-rollout-v1-batch-035-'
const authorPath = prefix + 'sibling-priority-remainder-7-v1.candidates.json'
const currentPath = prefix + 'current-counterreviewed-7-v1.candidates.json'
const configPath = prefix + 'current-counterreviewed-7-v1.config.json'
const read = p => JSON.parse(readFileSync(p, 'utf8'))
const sha = p => 'sha256:' + createHash('sha256').update(readFileSync(p)).digest('hex')
const author = read(authorPath), current = read(currentPath), config = read(configPath)
assert.equal(sha(authorPath), 'sha256:34c46f317f0a2ba089957e3d324cc83b30ab012205abd32f7175696cb81df148')
assert.deepEqual(current.goals.map(g => g.goalId), config.scope.goalIds)
for (const i of [1, 2, 4, 5, 6]) assert.deepEqual(current.goals[i], author.goals[i])
assert.deepEqual(current.goals[0].profile.applicationCaseBriefs, author.goals[0].profile.applicationCaseBriefs)
assert.deepEqual(current.goals[3].profile, author.goals[3].profile)
for (const g of current.goals) {
  assert.equal(g.evidenceLevel, 'E1'); assert.equal(g.maximumClaimScope, 'G1')
  assert.equal(g.profile.applicationCaseBriefs.length, 2)
  assert.equal(g.profile.coverageExpectations.freshVariationRequired, true)
  assert.equal(g.profile.coverageExpectations.independentTransferRequired, true)
}
let checks = 0
const equal = (value, expected) => { assert.ok(Math.abs(value - expected) < 1e-9, `${value} != ${expected}`); checks++ }
const ok = condition => { assert.ok(condition); checks++ }
equal((600 + 4 * 100) / 100, 10)
equal((600 + 4 * 200) / 200, 7)
for (const [c, r] of [[0, 0], [4, 40], [12, 60]]) equal(80 - 320 / (4 + c), r)
equal((1 + 5 / 5) ** 2 * Math.PI, 4 * Math.PI)
equal(10 + 20 * 2, 50)
equal(10 + 20 * (2 / Math.E), 10 + 40 / Math.E)
equal(56 / 100, .56); equal(3 / 6, .5)
equal(30 / 40, .75); equal(3 / 4, .75)
for (const [n, mu, sd, cv] of [[100, 20, 4, .2], [400, 80, 8, .1]]) {
  equal(n * .2, mu); equal(Math.sqrt(n * .2 * .8), sd); equal(sd / mu, cv)
}
// Solve variance <= .01 * mean^2 independently of the displayed CV expression.
equal(Math.ceil(.21 / .0009), 234)
ok(233 * .21 > .0009 * 233 ** 2)
ok(234 * .21 < .0009 * 234 ** 2)
for (const n of [1, 4, 16, 64]) {
  const n2 = 4 * n, p = .25
  equal(Math.sqrt(n2 * p * (1 - p)) / (n2 * p), Math.sqrt(n * p * (1 - p)) / (n * p) / 2)
}
ok(Number.isNaN(Math.sqrt(5 * 0 * 1) / (5 * 0)))
equal(Math.sqrt(5 * 1 * 0) / 5, 0)
equal(3 * 4, 12); ok(30 <= 120)
const triangle = [[2, 0, 0], [0, 2, 0], [0, 0, 2]]
for (const [x, y, z] of triangle) { equal(x + y + z, 2); ok([x, y, z].every(v => v >= 0 && v <= 2)) }
for (let i = 0; i < 3; i++) equal(triangle[i].reduce((s, v, j) => s + (v - triangle[(i + 1) % 3][j]) ** 2, 0), 8)
// With z=3-x, the prism reduces to 0<=x<=3 and 0<=y<=4-x.
const trapezoid = [[3, 0, 0], [3, 1, 0], [0, 4, 3], [0, 0, 3]]
for (const [x, y, z] of trapezoid) { equal(x + z, 3); ok(x >= 0 && x <= 3 && y >= 0 && y <= 4 - x) }
equal(trapezoid[1][1] - trapezoid[0][1], 1)
equal(trapezoid[2][1] - trapezoid[3][1], 4)
equal([3, 0, -3].reduce((s, v, i) => s + v * [0, 1, 0][i], 0), 0)
equal((3 - 1) * (2 - (-1)) / 2, 3)
equal((2 * 2) * (2 * 3) / 2, 12)
// The shear maps each horizontal rectangle to [z,z+2] x [0,3].
for (const z of [0, 1, 2, 4]) equal(((z + 2) - z) * 3, 6)
equal(6 * 4, 24)
const records = readFileSync(config.reviewPath, 'utf8').trim().split('\n').map(JSON.parse)
assert.equal(records.length, 7)
for (const r of records) { assert.equal(r.status, 'needs_human_review'); assert.equal(r.reviewAuthority, 'ai_candidate'); assert.deepEqual(r.reviewRunIds, []) }
console.log(JSON.stringify({ schemaVersion: 1, artifactType: 'math-b035-positive-profile-root-counterreview-v1', checkedAt: new Date().toISOString(), status: 'PASS', authorPath, authorDigest: sha(authorPath), currentPath, currentDigest: sha(currentPath), configPath, currentRecordsDigest: sha(config.reviewPath), profileCount: 7, cases: 14, independentNumericAssertions: checks, scope: 'Root read all DE/EN profile fields and all 14 cases, checking coherent goal scope, observable understanding, fresh structural transfer and worked mathematical results.', corrections: ['bf17: rational models remain illustrative, not the only acceptable function class; parameter-role examples explicitly illustrative.', '5b54: historical domain omission now explicitly reconciled with adopted n>=1 and 0<p<1; original source dissent retained.'], limitations: ['AI E1/G1 candidates only; no learner evidence, human approval or verified normative curriculum breadth is claimed.', 'No inferential statistics, mandatory chain rule, determinants or added area/volume tasks are imported into adjacent goals.', 'Separate 5b54 normative-source and assessment-coverage findings remain in the source audit; this script does not resolve them.'] }, null, 2))
