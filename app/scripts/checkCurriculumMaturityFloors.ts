// SPDX-License-Identifier: Apache-2.0
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadCurrentCurriculumCatalog } from './currentCurriculumCatalog'
import { liveVerificationInputs } from './lib/verificationInputSnapshot'
import { routeProfileDefinitions } from './generateCurriculumQualityStatus'

export interface MaturityRule { id?: string; status?: string }
export interface ScopeStatus { scopeId?: string; maturity?: string; rules?: MaturityRule[] }
export interface CurriculumStatus {
  landscapeId?: string; frameworkId?: string; subject?: string; maturity?: string
  rules?: MaturityRule[]; scopes?: ScopeStatus[]
}
interface Pin { landscapeId: string; minimumMaturity: string; reason: string }
export interface CurriculumPin extends Pin { frameworkId: string; subject: string }
export interface ScopePin extends Pin { scopeId: string; compositionVisibilityRequired: boolean }
export interface FloorPolicy {
  schemaVersion: number; policyId: string; exceptions: unknown[]
  floors: CurriculumPin[]; scopeFloors: ScopePin[]; catalogInvariantRules: string[]
}
export interface GateInventory { landscapeIds: readonly string[]; scopes: readonly { landscapeId: string; scopeId: string; compositionVisibilityRequired: boolean }[] }
const invariants = ['CQR-001', 'CQR-002', 'CQR-501']
const curriculumObligations: ReadonlyArray<readonly [number, readonly string[]]> = [
  [1, ['CQR-000']], [2, ['CQR-003', 'CQR-004', 'CQR-005']],
  [5, ['CQR-301', 'CQR-401']], [6, ['CQR-302']], [7, ['CQR-303']],
]
const scopeObligations: ReadonlyArray<readonly [number, readonly string[]]> = [
  [1, ['CQR-101']], [2, ['CQR-102', 'CQR-103']],
  [3, ['CQR-201', 'CQR-202']], [4, ['CQR-203']],
]
function ensure(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Curriculum maturity gate: ${message}`)
}
const nonempty = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0
function rank(value: unknown, label: string): number {
  ensure(typeof value === 'string' && /^M[0-7]$/.test(value), `invalid maturity for ${label}: ${String(value)}`)
  return Number(value[1])
}
const scopeKey = (entry: { landscapeId: string; scopeId: string }) => `${entry.landscapeId}/${entry.scopeId}`
function unique<T>(values: readonly T[], key: (entry: T) => string, label: string): Map<string, T> {
  const result = new Map<string, T>()
  for (const value of values) {
    const id = key(value)
    ensure(nonempty(id) && !result.has(id), `duplicate or invalid ${label}: ${id}`)
    result.set(id, value)
  }
  return result
}
function sameKeys(actual: Map<string, unknown>, expected: Map<string, unknown>, label: string): void {
  for (const key of expected.keys()) ensure(actual.has(key), `missing ${label}: ${key}`)
  for (const key of actual.keys()) ensure(expected.has(key), `unexpected ${label}: ${key}`)
}
function checkPins(pins: readonly Pin[], label: string): void {
  for (const pin of pins) {
    ensure(pin && nonempty(pin.landscapeId) && nonempty(pin.reason), `malformed ${label}`)
    rank(pin.minimumMaturity, `${label} ${pin.landscapeId}`)
  }
}
function validatePolicy(policy: FloorPolicy): void {
  ensure(policy && policy.schemaVersion === 2 && nonempty(policy.policyId)
    && Array.isArray(policy.floors) && policy.floors.length > 0
    && Array.isArray(policy.scopeFloors) && Array.isArray(policy.exceptions)
    && policy.exceptions.length === 0 && Array.isArray(policy.catalogInvariantRules), 'invalid policy v2 or unsupported exceptions')
  checkPins(policy.floors, 'curriculum pin')
  checkPins(policy.scopeFloors, 'scope pin')
  for (const pin of policy.floors) ensure(nonempty(pin.frameworkId) && nonempty(pin.subject), `malformed curriculum identity ${pin.landscapeId}`)
  for (const pin of policy.scopeFloors) ensure(nonempty(pin.scopeId) && typeof pin.compositionVisibilityRequired === 'boolean' && rank(pin.minimumMaturity, pin.scopeId) <= 4, `malformed scope pin ${pin.landscapeId}`)
  const configured = unique(policy.catalogInvariantRules, value => value, 'catalog invariant rule')
  sameKeys(configured, new Map(invariants.map(id => [id, id])), 'catalog invariant rule')
}
function requireRules(rules: MaturityRule[] | undefined, ids: readonly string[], label: string): void {
  ensure(Array.isArray(rules), `missing rules for ${label}`)
  const results = unique(rules, rule => { ensure(rule && nonempty(rule.id) && nonempty(rule.status), `malformed rule for ${label}`); return rule.id }, `rule for ${label}`)
  for (const id of ids) ensure(results.get(id)?.status === 'pass', `${label}: ${id} must occur exactly once and pass (got ${results.get(id)?.status ?? 'missing'})`)
}
const obligations = (matrix: typeof curriculumObligations, level: number) => matrix.filter(([minimum]) => level >= minimum).flatMap(([, ids]) => [...ids])

/** Pure enforcement, independent of the artifact's own claimed coverage/maturity. */
export function checkCurriculumMaturityPolicy(
  artifact: { curricula?: CurriculumStatus[] }, policy: FloorPolicy, inventory: GateInventory,
): void {
  validatePolicy(policy)
  ensure(Array.isArray(artifact.curricula), 'status has no curricula array')
  ensure(inventory && Array.isArray(inventory.landscapeIds) && inventory.landscapeIds.length > 0
    && inventory.landscapeIds.every(nonempty) && Array.isArray(inventory.scopes), 'invalid independent inventory')
  const expected = unique(inventory.landscapeIds, id => id, 'catalog identity')
  for (const scope of inventory.scopes) ensure(scope && nonempty(scope.landscapeId) && nonempty(scope.scopeId)
    && typeof scope.compositionVisibilityRequired === 'boolean' && expected.has(scope.landscapeId), 'malformed or foreign registered scope inventory')
  const expectedScopes = unique<GateInventory['scopes'][number]>(inventory.scopes, scopeKey, 'registered scope')
  const pins = unique(policy.floors, pin => pin.landscapeId, 'curriculum pin')
  const scopePins = unique(policy.scopeFloors, scopeKey, 'scope pin')
  const curricula = unique(artifact.curricula, row => { ensure(row && nonempty(row.landscapeId), 'malformed status curriculum'); return row.landscapeId }, 'status curriculum')
  sameKeys(pins, expected, 'catalog pin'); sameKeys(curricula, expected, 'catalog status')
  sameKeys(scopePins, expectedScopes, 'registered scope pin')
  for (const [key, scope] of expectedScopes) ensure(scopePins.get(key)!.compositionVisibilityRequired === scope.compositionVisibilityRequired, `${key}: CQR-104 coverage differs from route configuration`)
  const actualScopes = new Map<string, unknown>()
  for (const [id, row] of curricula) {
    const pin = pins.get(id)!
    ensure(row.frameworkId === pin.frameworkId && row.subject === pin.subject, `identity mismatch ${id}`)
    const level = rank(pin.minimumMaturity, `${id} pin`)
    ensure(rank(row.maturity, id) === level, `${id}: current ${row.maturity} differs from pin ${pin.minimumMaturity}`)
    requireRules(row.rules, [...invariants, ...obligations(curriculumObligations, level)], id)
    ensure(Array.isArray(row.scopes), `missing scopes array ${id}`)
    const scopes = unique(row.scopes, scope => { ensure(scope && nonempty(scope.scopeId), `malformed scope ${id}`); return scope.scopeId }, `scope ${id}`)
    const minimumScope = level >= 5 ? 4 : level >= 4 ? 3 : level >= 3 ? 2 : 0
    if (level >= 3) ensure(scopes.size > 0, `${id}: CQR-101 requires a registered route scope`)
    for (const [scopeId, scope] of scopes) {
      const key = scopeKey({ landscapeId: id, scopeId })
      actualScopes.set(key, scope)
      const scopePin = scopePins.get(key)
      ensure(scopePin, `unexpected scope ${key}`)
      const scopeLevel = rank(scopePin.minimumMaturity, `${key} pin`)
      ensure(rank(scope.maturity, key) === scopeLevel, `${key}: current ${scope.maturity} differs from pin ${scopePin.minimumMaturity}`)
      ensure(scopeLevel >= minimumScope, `${key}: scope pin cannot support curriculum ${row.maturity}`)
      requireRules(scope.rules, [...obligations(scopeObligations, scopeLevel), ...(scopeLevel >= 3 && scopePin.compositionVisibilityRequired ? ['CQR-104'] : [])], key)
    }
  }
  sameKeys(actualScopes, expectedScopes, 'registered scope status')
}

/** v1 is accepted only as migration input; the current policy is always v2. */
export function checkPolicyMonotonicity(policy: FloorPolicy, base: FloorPolicy): void {
  validatePolicy(policy)
  ensure(base && (base.schemaVersion === 1 || base.schemaVersion === 2) && nonempty(base.policyId)
    && Array.isArray(base.floors) && base.floors.length > 0 && Array.isArray(base.exceptions)
    && base.exceptions.length === 0, 'invalid base policy')
  if (base.schemaVersion === 2) validatePolicy(base)
  checkPins(base.floors, 'base curriculum pin')
  for (const pin of base.floors) ensure(nonempty(pin.frameworkId) && nonempty(pin.subject), `malformed base curriculum identity ${pin.landscapeId}`)
  const compare = <T extends Pin>(current: readonly T[], previous: readonly T[], key: (entry: T) => string) => {
    const currentMap = unique(current, key, 'current pin')
    const previousMap = unique(previous, key, 'base pin')
    for (const [id, prior] of previousMap) {
      const next = currentMap.get(id)
      ensure(next, `base pin removed: ${id}`)
      ensure(rank(next.minimumMaturity, id) >= rank(prior.minimumMaturity, id), `base pin lowered: ${id}`)
    }
  }
  compare(policy.floors, base.floors, entry => entry.landscapeId)
  for (const previous of base.floors) {
    const next = policy.floors.find(pin => pin.landscapeId === previous.landscapeId)!
    ensure(next.frameworkId === previous.frameworkId && next.subject === previous.subject, `base curriculum identity changed: ${previous.landscapeId}`)
  }
  if (base.schemaVersion === 2) {
    compare(policy.scopeFloors, base.scopeFloors, scopeKey)
    for (const previous of base.scopeFloors) ensure(!previous.compositionVisibilityRequired
      || policy.scopeFloors.find(pin => scopeKey(pin) === scopeKey(previous))!.compositionVisibilityRequired, `CQR-104 coverage lowered: ${scopeKey(previous)}`)
  }
}

function main(): void {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
  const policyPath = 'app/scripts/config/curriculum-maturity-floor-policy.json'
  const args = process.argv.slice(2)
  ensure(args.length === 0 || (args.length === 2 && args[0] === '--base-ref' && nonempty(args[1])), 'usage: checkCurriculumMaturityFloors.ts [--base-ref <git-ref>]')
  const baseRef = args.length ? args[1] : 'origin/main'
  ensure(!baseRef.startsWith('-') && !baseRef.includes(':'), 'invalid base ref')
  const policy = JSON.parse(readFileSync(resolve(root, policyPath), 'utf8')) as FloorPolicy
  // Never silently skip a missing base, including the default local origin/main.
  const base = JSON.parse(execFileSync('git', ['show', `${baseRef}:${policyPath}`], { cwd: root, encoding: 'utf8' })) as FloorPolicy
  checkPolicyMonotonicity(policy, base)
  const artifact = JSON.parse(readFileSync(resolve(root, 'docs/qa-ci/status/curriculum-quality-status.json'), 'utf8'))
  const { entries } = loadCurrentCurriculumCatalog(liveVerificationInputs, root)
  checkCurriculumMaturityPolicy(artifact, policy, {
    landscapeIds: entries.map(entry => entry.landscape.landscapeId),
    scopes: routeProfileDefinitions.map(profile => ({ landscapeId: profile.landscapeId, scopeId: profile.profileId, compositionVisibilityRequired: profile.compositionViewStage !== undefined })),
  })
  console.log(`curriculum maturity gates passed: ${policy.floors.length} curricula, ${policy.scopeFloors.length} scopes; base ${baseRef}`)
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main()
