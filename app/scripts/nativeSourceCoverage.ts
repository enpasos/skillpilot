import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  nativeTargetsByJurisdiction,
  validateNativeProjectionEvidence,
  type NativeProjectionEvidence,
} from './nativeProjectionEvidence'
import type { ReviewedDemandScopeAdapter } from './sourceCoverageEvidence'

export const NATIVE_SOURCE_COVERAGE_POLICY = 'app/scripts/config/source-coverage-native-adapters.json'
export const NATIVE_MATH_SOURCE_COVERAGE_LANDSCAPE = '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'

/** Explicit authoring QA authority; missing/stale required evidence never falls back to raw views. */
export function readNativeSourceCoverageAdapters(
  repo: string,
  manifestPath = NATIVE_SOURCE_COVERAGE_POLICY,
): Map<string, NativeProjectionEvidence> {
  const parse = (path: string) => JSON.parse(readFileSync(resolve(repo, path), 'utf8'))
  const policy = parse(NATIVE_SOURCE_COVERAGE_POLICY)
  assert.equal(policy.schemaVersion, 1, 'Invalid native source coverage policy')
  assert.ok(Array.isArray(policy.requiredLandscapeIds)
    && policy.requiredLandscapeIds.every((id: unknown) => typeof id === 'string'), 'Invalid required native landscapes')
  assert.ok(policy.requiredLandscapeIds.includes(NATIVE_MATH_SOURCE_COVERAGE_LANDSCAPE), 'Mathematics native authority is required')
  const manifest = parse(manifestPath)
  assert.equal(manifest.schemaVersion, 1, 'Invalid native source coverage manifest')
  assert.ok(manifest.landscapes && typeof manifest.landscapes === 'object', 'Missing native source coverage adapters')
  const result = new Map<string, NativeProjectionEvidence>()
  for (const [id, adapter] of Object.entries(manifest.landscapes) as Array<[string, { path: string; sha256?: string }]>) {
    assert.equal(id, NATIVE_MATH_SOURCE_COVERAGE_LANDSCAPE, 'Unreviewed native source coverage landscape')
    assert.ok(typeof adapter.path === 'string' && adapter.path, `Missing native evidence path for ${id}`)
    const bytes = readFileSync(resolve(repo, adapter.path))
    if (adapter.sha256 !== undefined) {
      assert.match(adapter.sha256, /^[a-f0-9]{64}$/, 'Invalid native projection file pin')
      assert.equal(createHash('sha256').update(bytes).digest('hex'), adapter.sha256, 'Native projection file hash changed')
    }
    const evidence = JSON.parse(bytes.toString()) as NativeProjectionEvidence
    validateNativeProjectionEvidence(evidence, repo, id)
    assert.equal(evidence.scopes.length, 182, 'Mathematics offered scope denominator changed; review it explicitly')
    result.set(id, evidence)
  }
  for (const id of policy.requiredLandscapeIds) assert.ok(result.has(id), `Required native projection adapter missing for ${id}`)
  return result
}

/** Includes every actual offered scope, without a national raw-view denominator. */
export function nativeSourceCoverageTargetSets(evidence: NativeProjectionEvidence): {
  canonicalViewAtomicGoalIds: Set<string>
  viewAtomicGoalIdsByJurisdiction: Map<string, Set<string>>
} {
  const byJurisdiction = nativeTargetsByJurisdiction(evidence)
  return {
    canonicalViewAtomicGoalIds: new Set(Object.keys(evidence.targetAtomicMembership)),
    viewAtomicGoalIdsByJurisdiction: byJurisdiction,
  }
}

/**
 * The prerequisite must be a target in the SAME offered country scope as the
 * reviewed consumer and full demand path. Context membership alone grants no
 * target role. Registry acceptance and the consumer's source anchor remain the
 * sourceCoverageEvidence checker's separate requirements.
 */
function createNativeDemandWitnesses(
  evidence: NativeProjectionEvidence,
  jurisdiction: string,
  isEligibleOrdinary: (id: string) => boolean,
) {
  const offeredIndices = new Map(evidence.scopes.flatMap((scope, index) =>
    scope.scope.jurisdiction === jurisdiction
      && (scope.offeredByNativePlanner || scope.declaredByRepositoryGui)
      ? [[scope.scopeId, index] as const] : []))
  const routeCache = new Map<string, string[] | null>()
  const findWitness = (scopeId: string, consumerId: string, prerequisiteId: string): string[] | null => {
    const index = offeredIndices.get(scopeId)
    if (index === undefined || consumerId === prerequisiteId
      || !isEligibleOrdinary(consumerId) || !isEligibleOrdinary(prerequisiteId)
      || !evidence.targetAtomicMembership[prerequisiteId]?.includes(index)
      || !evidence.atomicContextMembership[consumerId]?.includes(index)
      || !evidence.atomicContextMembership[prerequisiteId]?.includes(index)) return null
    const key = JSON.stringify([scopeId, consumerId, prerequisiteId])
    if (routeCache.has(key)) return routeCache.get(key)!
    // A fixed-scope BFS retains parent links instead of cloning every path or
    // the complete membership map. Eligibility/context apply to every node.
    const pending = [consumerId]
    const parent = new Map<string, string | null>([[consumerId, null]])
    let result: string[] | null = null
    for (let cursor = 0; cursor < pending.length; cursor += 1) {
      const id = pending[cursor]
      if (id === prerequisiteId) {
        result = []
        let current: string | null = id
        while (current !== null) { result.push(current); current = parent.get(current)! }
        result.reverse()
        break
      }
      for (const required of evidence.atomicPrerequisites[id] ?? []) {
        if (!parent.has(required) && isEligibleOrdinary(required)
          && evidence.atomicContextMembership[required]?.includes(index)) {
          parent.set(required, id)
          pending.push(required)
        }
      }
    }
    routeCache.set(key, result)
    return result
  }
  const scopeAdapter: ReviewedDemandScopeAdapter = {
    initialTargetScopeIds: (goalId) => new Set(isEligibleOrdinary(goalId)
      ? [...offeredIndices].filter(([, index]) => evidence.targetAtomicMembership[goalId]?.includes(index))
        .map(([id]) => id) : []),
    reviewedDemandScopeIds: (prerequisiteId, consumerId, candidateScopeIds) =>
      new Set([...candidateScopeIds].filter(scopeId => findWitness(scopeId, consumerId, prerequisiteId) !== null)),
  }
  return { scopeAdapter, findWitness }
}

/** All surviving scopes from the same validated cache, not one boolean per edge. */
export function createNativeSourceCoverageScopeAdapter(
  evidence: NativeProjectionEvidence,
  jurisdiction: string,
  isEligibleOrdinary: (id: string) => boolean,
): ReviewedDemandScopeAdapter {
  return createNativeDemandWitnesses(evidence, jurisdiction, isEligibleOrdinary).scopeAdapter
}

/** Retained single-witness API; it now tries every actual target scope. */
export function nativeTargetReviewedDemandWitness(
  evidence: NativeProjectionEvidence,
  jurisdiction: string,
  consumerId: string,
  prerequisiteId: string,
  isEligibleOrdinary: (id: string) => boolean,
): string[] | null {
  const { scopeAdapter, findWitness } = createNativeDemandWitnesses(evidence, jurisdiction, isEligibleOrdinary)
  for (const scopeId of scopeAdapter.initialTargetScopeIds(prerequisiteId)) {
    const witness = findWitness(scopeId, consumerId, prerequisiteId)
    if (witness) return witness
  }
  return null
}
