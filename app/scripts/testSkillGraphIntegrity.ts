// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {
  checkSkillGraphIntegrity,
  hasCompletePassingSkillGraphIntegrity,
  REQUIRED_SKILL_GRAPH_CHECKS,
  type IntegrityGoal,
  type IntegrityLandscape,
  type IntegrityReport,
} from './lib/skillGraphIntegrity'

const A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const B = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
const C = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'
const id = (value: number) => `00000000-0000-4000-8000-${value.toString(16).padStart(12, '0')}`
const key = (owner: string, goal: number) => `${owner}:${id(goal)}`
const goal = (value: number, rest: Partial<IntegrityGoal> = {}): IntegrityGoal => ({
  id: id(value), weight: 1, contains: [], requires: [], ...rest,
})
const landscape = (goals: IntegrityGoal[], owner = A): IntegrityLandscape => ({
  landscapeId: owner, sourceFile: `${owner}.json`, goals,
})
const one = (goals: IntegrityGoal[]) => checkSkillGraphIntegrity([landscape(goals)], [A])
const codes = (report: IntegrityReport) => report.findings.map(({ code }) => code)
const status = (report: IntegrityReport, rule: string) => report.checks.find(({ id: ruleId }) => ruleId === rule)?.status
const assertCompletePass = (report: IntegrityReport) => {
  assert.equal(report.ok, true, JSON.stringify(report.findings))
  assert.equal(hasCompletePassingSkillGraphIntegrity(report, A), true)
  assert.deepEqual(new Set(report.checkedRules), new Set(REQUIRED_SKILL_GRAPH_CHECKS))
  assert.equal(report.checks.length, REQUIRED_SKILL_GRAPH_CHECKS.length)
}

// General canonical containment may have multiple parents. Independent inherited
// demands are conjunctive, and positive weights need not be integer counts.
const polyhierarchy = one([
  goal(1, { contains: [id(3)], requires: [id(4)], weight: 1.5 }),
  goal(2, { contains: [id(3)], requires: [id(5)] }), goal(3), goal(4), goal(5),
])
assertCompletePass(polyhierarchy)
assert.equal(polyhierarchy.metrics.atomicRequires, 2)
assertCompletePass(one([{ id: id(1), weight: 1 }]))

// Exact foreign IDs and unqualified unique foreign IDs resolve identically.
for (const reference of [id(2), key(B, 2)]) {
  const report = checkSkillGraphIntegrity([
    landscape([goal(1, { requires: [reference] })]), landscape([goal(2)], B),
  ], [A])
  assertCompletePass(report)
  assert.deepEqual(report.checkedGoalKeys, [key(A, 1), key(B, 2)])
}

// A foreign containment ancestor is needed even when there is no outgoing
// reference to it. Its unrelated, invalid sibling is deliberately not imported.
const ancestorScope = checkSkillGraphIntegrity([
  landscape([goal(1, { requires: [id(2)] })]),
  landscape([
    goal(10, { contains: [id(2), id(99)], requires: [id(3)] }), goal(2), goal(3),
    goal(99, { weight: 0 }), { id: null, weight: 0 },
  ], B),
], [A])
assertCompletePass(ancestorScope)
assert.deepEqual(ancestorScope.checkedGoalKeys, [key(A, 1), key(B, 2), key(B, 3), key(B, 10)].sort())

// Unknown, empty, omitted and malformed scopes cannot become vacuous passes.
for (const report of [checkSkillGraphIntegrity([], []), checkSkillGraphIntegrity([], [A]), one([]),
  checkSkillGraphIntegrity([landscape([{ id: null }])], [A]),
  checkSkillGraphIntegrity([landscape([goal(1)], '')], [''])]) {
  assert.equal(report.ok, false)
  assert.equal(hasCompletePassingSkillGraphIntegrity(report, A), false)
  assert.equal(status(report, 'G05'), 'fail')
}

for (const weight of [0, -1, NaN, Infinity, -Infinity, undefined, '1']) {
  const report = one([goal(1, { weight })])
  assert.equal(status(report, 'G02'), 'fail', String(weight))
}
for (const badId of ['goal-a', '99ef0fc2-150a-51e8-bac8-7e40e46917b', '', 7, null]) {
  assert.equal(status(one([goal(1, { id: badId })]), 'G01a'), 'fail')
}
for (const reference of ['not-a-uuid', `${B}:not-a-uuid`]) {
  assert.ok(codes(one([goal(1, { requires: [reference] })])).includes('INVALID_REFERENCE_UUID'))
}
for (const reference of ['', ` ${id(2)}`, `:${id(2)}`, `${B}:`, `${B}:${id(2)}:extra`, 2, null]) {
  const report = one([goal(1, { requires: [reference] }), goal(2)])
  assert.equal(status(report, 'G05'), 'fail', String(reference))
  assert.equal(status(report, 'G17'), 'blocked')
}
for (const relation of ['contains', 'requires'] as const) {
  assert.equal(status(one([goal(1, { [relation]: null })]), 'G05'), 'fail')
  assert.equal(status(one([goal(1, { [relation]: 'not-an-array' })]), 'G05'), 'fail')
  assert.equal(status(one([goal(1, { [relation]: [id(404)] })]), 'G05'), 'fail')
}

const qualifiedMissing = checkSkillGraphIntegrity([
  landscape([goal(1, { requires: [key(C, 2)] })]), landscape([goal(2)], B),
], [A])
assert.ok(codes(qualifiedMissing).includes('MISSING_REFERENCE'), 'An exact foreign owner never falls back to another owner.')

const ambiguous = checkSkillGraphIntegrity([
  landscape([goal(1, { requires: [id(2)] })]), landscape([goal(2)], B), landscape([goal(2)], C),
], [A])
assert.ok(codes(ambiguous).includes('AMBIGUOUS_REFERENCE'))
assert.equal(status(ambiguous, 'G17'), 'blocked')
const localBeforeForeign = checkSkillGraphIntegrity([
  landscape([goal(1, { requires: [id(2)] }), goal(2)]), landscape([goal(2)], B),
], [A])
assert.equal(status(localBeforeForeign, 'G05'), 'pass', 'Local resolution precedes global fallback.')
assert.equal(status(localBeforeForeign, 'G01b'), 'fail', 'Qualification does not legalize duplicate canonical IDs.')
assertCompletePass(one([{ id: C.toUpperCase(), weight: 1 }]))
for (const report of [
  one([{ id: C, weight: 1 }, { id: C.toUpperCase(), weight: 1 }]),
  checkSkillGraphIntegrity([
    landscape([{ id: C, weight: 1 }]), landscape([{ id: C.toUpperCase(), weight: 1 }], B),
  ], [A]),
]) {
  assert.equal(status(report, 'G01b'), 'fail', 'UUID values remain identical across hexadecimal case variants.')
}
const duplicateDefinition = one([goal(1), goal(1, { requires: [id(2)] }), goal(2)])
assert.ok(codes(duplicateDefinition).includes('DUPLICATE_LOGICAL_GOAL'))
assert.equal(status(duplicateDefinition, 'G06'), 'blocked', 'No first-file or union topology is silently selected.')

for (const relation of ['contains', 'requires'] as const) {
  const report = checkSkillGraphIntegrity([
    landscape([goal(1, { [relation]: [key(B, 2)] })]),
    landscape([goal(2, { [relation]: [key(A, 1)] })], B),
  ], [A])
  assert.ok(codes(report).includes(relation === 'contains' ? 'CONTAINS_CYCLE' : 'REQUIRES_CYCLE'))
  assert.ok(report.findings.some((finding) => finding.witness?.length === 3))
}
const inheritedForeignCycle = checkSkillGraphIntegrity([
  landscape([goal(1, { requires: [id(2)] })]),
  landscape([goal(10, { contains: [id(2)], requires: [id(1)] }), goal(2)], B),
], [A])
assert.equal(status(inheritedForeignCycle, 'G07'), 'pass')
assert.equal(status(inheritedForeignCycle, 'G15'), 'fail')
assert.equal(status(inheritedForeignCycle, 'G42'), 'fail')
const inheritedSelf = one([goal(1, { contains: [id(2)], requires: [id(2)] }), goal(2)])
assert.ok(inheritedSelf.findings.some((f) => f.code === 'EFFECTIVE_REQUIRES_CYCLE'
  && f.witness?.join() === [key(A, 2), key(A, 2)].join()))

// Goal-node DAGs are not enough: expanding cluster targets reveals a↔b.
const atomicCycle = one([
  goal(10, { contains: [id(1)] }), goal(20, { contains: [id(2)] }),
  goal(1, { requires: [id(20)] }), goal(2, { requires: [id(10)] }),
])
assert.equal(status(atomicCycle, 'G07'), 'pass')
assert.equal(status(atomicCycle, 'G15'), 'pass')
assert.equal(status(atomicCycle, 'G42'), 'fail')
assert.equal(status(atomicCycle, 'G17'), 'pass', 'Authoring minimality still uses its distinct goal-node relation.')

const inheritedMinimality = one([
  goal(10, { contains: [id(2)], requires: [id(3)] }),
  goal(1, { requires: [id(2), id(3)] }), goal(2), goal(3),
])
assert.deepEqual(inheritedMinimality.findings.filter(({ ruleId }) => ruleId === 'G17').map((f) => [f.goalId, f.witness]),
  [[id(1), [key(A, 1), key(A, 2), key(A, 3)]]])
// The removed origin must disappear from ALL inherited copies, not merely R.
assertCompletePass(one([goal(10, { contains: [id(2)], requires: [id(3)] }), goal(2), goal(3)]))
const localMinimality = one([
  goal(10, { contains: [id(1)], requires: [id(2)] }), goal(1, { requires: [id(2)] }), goal(2),
])
assert.equal(status(localMinimality, 'G16'), 'fail')
assert.equal(status(localMinimality, 'G17'), 'fail')
const separateOrigins = one([
  goal(10, { contains: [id(1)], requires: [id(2)] }),
  goal(20, { contains: [id(1)], requires: [id(2)] }), goal(1, { requires: [id(2), key(A, 2)] }), goal(2),
])
assert.deepEqual(separateOrigins.findings.filter(({ ruleId }) => ruleId === 'G17').map(({ goalId }) => goalId), [id(1)])
// §7.3 does not turn containment into a prerequisite edge. The atom expansion
// has duplicate a→b demands, but the authored q→b edge is not goal-node redundant.
assertCompletePass(one([
  goal(1, { requires: [id(10), id(2)] }), goal(10, { contains: [id(2)] }), goal(2),
]))

const foreignWeight = checkSkillGraphIntegrity([
  landscape([goal(1, { requires: [id(2)] })]), landscape([goal(2, { weight: 0 })], B),
], [A])
assert.ok(foreignWeight.findings.some((f) => f.ruleId === 'G02' && f.landscapeId === B
  && f.goalId === id(2) && f.sourceFile === `${B}.json`))

// Consumers must require the entire current check manifest, not an old pass badge.
for (const required of REQUIRED_SKILL_GRAPH_CHECKS) {
  assert.equal(hasCompletePassingSkillGraphIntegrity({ ...polyhierarchy,
    checks: polyhierarchy.checks.filter(({ id: check }) => check !== required) }, A), false)
  assert.equal(hasCompletePassingSkillGraphIntegrity({ ...polyhierarchy,
    checks: polyhierarchy.checks.map((check) => check.id === required ? { ...check, status: 'blocked' } : check) }, A), false)
}
for (const mutation of [undefined, {}, { ok: true }, { ...polyhierarchy, checkedGoalKeys: [] },
  { ...polyhierarchy, checkedRules: [] }, { ...polyhierarchy, rootLandscapeIds: [B] },
  { ...polyhierarchy, checks: [...polyhierarchy.checks.slice(1), polyhierarchy.checks[1]] },
  { ...polyhierarchy, findings: [localMinimality.findings[0]] }]) {
  assert.equal(hasCompletePassingSkillGraphIntegrity(mutation, A), false)
}

// Depth controls exercise real traversal paths past ordinary JS recursion depth.
const length = 12_000
assertCompletePass(one(Array.from({ length }, (_, index) => goal(index + 1,
  { contains: index + 1 < length ? [id(index + 2)] : [] }))))
assertCompletePass(one(Array.from({ length }, (_, index) => goal(index + 1,
  { requires: index + 1 < length ? [id(index + 2)] : [] }))))
for (const relation of ['contains', 'requires'] as const) {
  const report = one(Array.from({ length }, (_, index) => goal(index + 1,
    { [relation]: [id(index + 1 < length ? index + 2 : 1)] })))
  assert.equal(report.ok, false)
  assert.ok(codes(report).includes(relation === 'contains' ? 'CONTAINS_CYCLE' : 'REQUIRES_CYCLE'))
  assert.equal(codes(report).includes('MINIMALITY_CHECK_EXECUTION_FAILED'), false)
}

console.log('PASS strict graph integrity: UUID/weight/identity/reference, global/effective/atomic DAG, origin-removal minimality, scoped foreign ancestors, complete check manifests and 12000-node depth controls.')
