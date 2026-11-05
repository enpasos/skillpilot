import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  nativeReviewedDemandWitness,
  nativeTargetsByJurisdiction,
  validateNativeProjectionEvidence,
  type NativeProjectionEvidence,
} from './nativeProjectionEvidence'

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
export function nativeTargetReviewedDemandWitness(
  evidence: NativeProjectionEvidence,
  jurisdiction: string,
  consumerId: string,
  prerequisiteId: string,
  isEligibleOrdinary: (id: string) => boolean,
): string[] | null {
  const targetScopes = new Set(evidence.targetAtomicMembership[prerequisiteId] ?? [])
  const matchingScopes = new Set((evidence.atomicContextMembership[consumerId] ?? []).filter(index =>
    targetScopes.has(index)
    && evidence.scopes[index].scope.jurisdiction === jurisdiction
    && (evidence.scopes[index].offeredByNativePlanner || evidence.scopes[index].declaredByRepositoryGui)))
  if (matchingScopes.size === 0) return null
  const scopedEvidence = {
    ...evidence,
    atomicContextMembership: Object.fromEntries(Object.entries(evidence.atomicContextMembership)
      .map(([id, indices]) => [id, indices.filter(index => matchingScopes.has(index))])),
  }
  return nativeReviewedDemandWitness(scopedEvidence, jurisdiction, consumerId, prerequisiteId, isEligibleOrdinary)
}
