// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { checkCurriculumMaturityPolicy as check, checkPolicyMonotonicity, type FloorPolicy, type CurriculumStatus } from './checkCurriculumMaturityFloors'
import { deriveCurriculumMaturity, deriveScopeMaturity } from './generateCurriculumQualityStatus'

const globalIds = ['CQR-000', 'CQR-001', 'CQR-002', 'CQR-003', 'CQR-004', 'CQR-005', 'CQR-301', 'CQR-302', 'CQR-303', 'CQR-401', 'CQR-501']
const scopeIds = ['CQR-101', 'CQR-102', 'CQR-103', 'CQR-104', 'CQR-201', 'CQR-202', 'CQR-203']
const rules = (ids: string[]) => ids.map(id => ({ id, status: 'pass' as const, summary: 'fixture' }))
function fixture() {
  const artifact: { curricula: CurriculumStatus[] } = { curricula: [{ landscapeId: 'L', frameworkId: 'F', subject: 'Subject', maturity: 'M7', rules: rules(globalIds), scopes: [{ scopeId: 'S', maturity: 'M4', rules: rules(scopeIds) }] }] }
  const policy: FloorPolicy = { schemaVersion: 2, policyId: 'fixture', exceptions: [], floors: [{ landscapeId: 'L', frameworkId: 'F', subject: 'Subject', minimumMaturity: 'M7', reason: 'fixture' }], scopeFloors: [{ landscapeId: 'L', scopeId: 'S', compositionVisibilityRequired: true, minimumMaturity: 'M4', reason: 'fixture' }], catalogInvariantRules: ['CQR-001', 'CQR-002', 'CQR-501'] }
  const inventory = { landscapeIds: ['L'], scopes: [{ landscapeId: 'L', scopeId: 'S', compositionVisibilityRequired: true }] }
  return { artifact, policy, inventory }
}
test('complete policy and exactly passing obligations succeed', () => { const f = fixture(); check(f.artifact, f.policy, f.inventory) })
for (const id of [...globalIds, ...scopeIds]) for (const status of ['missing', 'fail', 'warn', 'not_configured']) {
  test(`direct obligation ${id}: ${status} fails despite claimed maturity`, () => {
    const f = fixture(); const row = f.artifact.curricula[0]
    const target = id.startsWith('CQR-1') || id.startsWith('CQR-2') ? row.scopes![0] : row
    if (status === 'missing') target.rules = target.rules!.filter(rule => rule.id !== id)
    else target.rules!.find(rule => rule.id === id)!.status = status
    assert.throws(() => check(f.artifact, f.policy, f.inventory), new RegExp(id))
  })
}
const negativeCases: Array<[string, (f: ReturnType<typeof fixture>) => void]> = [
  ['duplicate curriculum', f => f.artifact.curricula.push(f.artifact.curricula[0])],
  ['duplicate curriculum pin', f => f.policy.floors.push(f.policy.floors[0])],
  ['duplicate scope', f => f.artifact.curricula[0].scopes!.push(f.artifact.curricula[0].scopes![0])],
  ['duplicate scope pin', f => f.policy.scopeFloors.push(f.policy.scopeFloors[0])],
  ['duplicate result', f => f.artifact.curricula[0].rules!.push(f.artifact.curricula[0].rules![0])],
  ['duplicate scoped result', f => f.artifact.curricula[0].scopes![0].rules!.push(f.artifact.curricula[0].scopes![0].rules![0])],
  ['missing both curriculum and pin', f => { f.artifact.curricula = []; f.policy.floors = [] }],
  ['missing both scope and pin', f => { f.artifact.curricula[0].scopes = []; f.policy.scopeFloors = [] }],
  ['extra curriculum', f => f.artifact.curricula.push({ ...f.artifact.curricula[0], landscapeId: 'extra' })],
  ['extra scope', f => f.artifact.curricula[0].scopes!.push({ ...f.artifact.curricula[0].scopes![0], scopeId: 'extra' })],
  ['wrong scope parent', f => f.policy.scopeFloors[0].landscapeId = 'other'],
  ['identity mismatch', f => f.artifact.curricula[0].frameworkId = 'other'],
  ['maturity below pin', f => f.artifact.curricula[0].maturity = 'M6'],
  ['maturity above pin', f => f.policy.floors[0].minimumMaturity = 'M6'],
  ['scope below pin', f => f.artifact.curricula[0].scopes![0].maturity = 'M3'],
  ['scope above pin', f => f.policy.scopeFloors[0].minimumMaturity = 'M3'],
  ['invalid maturity', f => f.artifact.curricula[0].maturity = 'M8'],
  ['removed invariant', f => f.policy.catalogInvariantRules.pop()],
  ['duplicate invariant', f => f.policy.catalogInvariantRules.push('CQR-001')],
  ['empty independent catalog', f => f.inventory.landscapeIds = []],
  ['duplicate independent catalog', f => f.inventory.landscapeIds.push('L')],
  ['duplicate independent scope', f => f.inventory.scopes.push(f.inventory.scopes[0])],
  ['foreign independent scope', f => f.inventory.scopes[0].landscapeId = 'other'],
  ['empty independent identity', f => f.inventory.landscapeIds[0] = ''],
  ['unsupported exception', f => f.policy.exceptions.push({})],
]
for (const [label, mutate] of negativeCases) test(label, () => { const f = fixture(); mutate(f); assert.throws(() => check(f.artifact, f.policy, f.inventory)) })
test('M0 still enforces the complete catalog invariants without demanding higher milestones', () => {
  const f = fixture(); f.policy.floors[0].minimumMaturity = 'M0'; f.artifact.curricula[0].maturity = 'M0'
  f.artifact.curricula[0].rules = rules(f.policy.catalogInvariantRules)
  check(f.artifact, f.policy, f.inventory)
})
for (const kind of ['curriculum', 'scope']) for (const change of ['remove', 'lower']) test(`base ${kind} pin cannot ${change}`, () => {
  const f = fixture(); const base = structuredClone(f.policy)
  const pins = kind === 'scope' ? f.policy.scopeFloors : f.policy.floors
  if (change === 'remove') pins.pop(); else pins[0].minimumMaturity = 'M0'
  assert.throws(() => checkPolicyMonotonicity(f.policy, base))
})
test('v1 transition preserves existing pins and v2 additions are allowed', () => {
  const f = fixture(); const base = { ...structuredClone(f.policy), schemaVersion: 1 }
  delete (base as Partial<FloorPolicy>).scopeFloors
  checkPolicyMonotonicity(f.policy, base as FloorPolicy)
  assert.throws(() => checkPolicyMonotonicity(f.policy, {} as FloorPolicy))
})
for (const id of ['CQR-004', 'CQR-005']) for (const status of ['missing', 'fail', 'warn', 'not_configured']) test(`promotion cannot bypass ${id} ${status}`, () => {
  const global = rules(globalIds) as Array<{ id: string; status: string; summary: string }>
  const changed = status === 'missing' ? global.filter(r => r.id !== id) : global.map(r => r.id === id ? { ...r, status } : r)
  assert.equal(deriveCurriculumMaturity(changed as Parameters<typeof deriveScopeMaturity>[0], [{ scopeId: 'S', label: 'S', maturity: 'M4', selectedAtomicGoals: 1, rules: rules(scopeIds) }]), 'M1')
})
for (const status of ['missing', 'fail', 'warn', 'not_configured']) test(`scope promotion cannot bypass CQR-104 ${status}`, () => {
  const changed = status === 'missing' ? rules(scopeIds).filter(r => r.id !== 'CQR-104') : rules(scopeIds).map(r => r.id === 'CQR-104' ? { ...r, status } : r)
  assert.equal(deriveScopeMaturity(changed as Parameters<typeof deriveScopeMaturity>[0]), 'M2')
})
test('scope CQR-203 caps at M3 and complete promotion retains M7', () => {
  assert.equal(deriveScopeMaturity(rules(scopeIds).map(r => r.id === 'CQR-203' ? { ...r, status: 'fail' } : r) as Parameters<typeof deriveScopeMaturity>[0]), 'M3')
  const scope = { scopeId: 'S', label: 'S', maturity: deriveScopeMaturity(rules(scopeIds)), selectedAtomicGoals: 1, rules: rules(scopeIds) }
  assert.equal(scope.maturity, 'M4'); assert.equal(deriveCurriculumMaturity(rules(globalIds), [scope]), 'M7')
})

test('unconfigured CQR-104 is explicit and limited to the independent inventory', () => {
  const f = fixture(); f.policy.scopeFloors[0].compositionVisibilityRequired = false; f.inventory.scopes[0].compositionVisibilityRequired = false
  const scope = f.artifact.curricula[0].scopes![0]; scope.rules = scope.rules!.filter(rule => rule.id !== 'CQR-104')
  check(f.artifact, f.policy, f.inventory)
  assert.equal(deriveScopeMaturity(rules(scopeIds).filter(rule => rule.id !== 'CQR-104'), false), 'M4')
  f.inventory.scopes[0].compositionVisibilityRequired = true
  assert.throws(() => check(f.artifact, f.policy, f.inventory), /CQR-104/)
})
test('changing configuration and pin together cannot remove base CQR-104 protection', () => {
  const f = fixture(); const base = structuredClone(f.policy)
  f.policy.scopeFloors[0].compositionVisibilityRequired = false; f.inventory.scopes[0].compositionVisibilityRequired = false
  assert.throws(() => checkPolicyMonotonicity(f.policy, base), /CQR-104 coverage lowered/)
})

for (const [label, args, expected] of [
  ['missing Git base', ['--base-ref', 'refs/heads/__cqr_deliberately_missing_base__'], /invalid object name/],
  ['missing base argument', ['--base-ref'], /usage:/],
  ['invalid base option', ['--base-ref', '--help'], /invalid base ref/],
] as const) test(`CLI rejects ${label}`, () => {
  const child = spawnSync(process.execPath, [...process.execArgv, fileURLToPath(new URL('./checkCurriculumMaturityFloors.ts', import.meta.url)), ...args], { encoding: 'utf8' })
  assert.ifError(child.error)
  assert.notEqual(child.status, 0)
  assert.match(child.stderr, expected)
})
