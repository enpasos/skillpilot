// SPDX-License-Identifier: Apache-2.0
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { relative, resolve } from 'node:path'
import type { LearningGoal, SkillLandscape } from '../../src/landscapeTypes'
import { routeProfiles } from '../generateCurriculumQualityStatus'
import { parseSemanticKindLedger } from '../goalBookModel'
import { loadOptionalHistoricalReviewContext } from '../optionalHistoricalReviewContext'
import type { HardRouteProfile, HardRouteSemanticKind } from './hardLearningRouteValidation'

export interface SemanticRoutePolicy {
  schemaVersion: 1
  ledgerSources: Array<{
    path: string
    landscapeId: string
    routeNodeScope: 'qa-stage' | 'canonical-prerequisites'
  }>
  scopes: Array<{
    scopeId: string
    status: 'required' | 'pending-route-evidence' | 'pending-semantic-ledger'
    reason?: string
  }>
}

export interface SemanticRouteProfile extends HardRouteProfile<LearningGoal> {
  profileId: string
  landscapeId: string
  required: boolean
}

type QaRouteProfile = (typeof routeProfiles)[number]
const POLICY_PATH = 'app/scripts/config/semantic-route-coverage.json'
const ensure: (condition: unknown, message: string) => asserts condition = (condition, message) => {
  if (!condition) throw new Error(`Semantic route inventory: ${message}`)
}

/** An explicit residual is never inferred from a failing route or missing file. */
export function validateSemanticRoutePolicy(policy: SemanticRoutePolicy, profiles: readonly QaRouteProfile[] = routeProfiles): void {
  ensure(policy?.schemaVersion === 1 && Array.isArray(policy.ledgerSources) && Array.isArray(policy.scopes), 'unsupported coverage policy')
  const profilesById = new Map(profiles.map(profile => [profile.profileId, profile]))
  ensure(profilesById.size === profiles.length, 'duplicate QA scope')
  const ledgerOwners = new Set<string>()
  for (const source of policy.ledgerSources) {
    ensure(source && typeof source.path === 'string' && source.path.startsWith('curricula/DE/Gymnasium/quality/')
      && !source.path.includes('..') && typeof source.landscapeId === 'string'
      && ['qa-stage', 'canonical-prerequisites'].includes(source.routeNodeScope), 'malformed ledger source')
    ensure(!ledgerOwners.has(source.landscapeId), `duplicate ledger owner ${source.landscapeId}`)
    ensure(profiles.some(profile => profile.landscapeId === source.landscapeId), `unregistered ledger owner ${source.landscapeId}`)
    ledgerOwners.add(source.landscapeId)
  }
  const seen = new Set<string>()
  for (const scope of policy.scopes) {
    ensure(scope && typeof scope.scopeId === 'string' && !seen.has(scope.scopeId), `duplicate or malformed scope ${scope?.scopeId}`)
    const profile = profilesById.get(scope.scopeId)
    ensure(profile, `foreign scope ${scope.scopeId}`)
    ensure(['required', 'pending-route-evidence', 'pending-semantic-ledger'].includes(scope.status), `unsupported status for ${scope.scopeId}`)
    ensure(scope.status === 'required' || (typeof scope.reason === 'string' && scope.reason.trim().length > 0), `unexplained residual for ${scope.scopeId}`)
    ensure(ledgerOwners.has(profile.landscapeId) === (scope.status !== 'pending-semantic-ledger'), `ledger/coverage mismatch for ${scope.scopeId}`)
    seen.add(scope.scopeId)
  }
  ensure(seen.size === profilesById.size, 'coverage policy must account for every shared QA scope')
}

export function checkSemanticRoutePolicyMonotonicity(policy: SemanticRoutePolicy, base: SemanticRoutePolicy): void {
  validateSemanticRoutePolicy(policy)
  const previousScopeIds = new Set(base.scopes.map(scope => scope.scopeId))
  validateSemanticRoutePolicy(base, routeProfiles.filter(profile => previousScopeIds.has(profile.profileId)))
  for (const previous of base.scopes) {
    const current = policy.scopes.find(scope => scope.scopeId === previous.scopeId)
    ensure(current, `base scope removed: ${previous.scopeId}`)
    ensure(previous.status !== 'required' || current.status === 'required', `required coverage lowered: ${previous.scopeId}`)
  }
  for (const previous of base.ledgerSources) {
    const current = policy.ledgerSources.find(source => source.landscapeId === previous.landscapeId)
    ensure(current, `covered ledger owner removed: ${previous.landscapeId}`)
    ensure(current.routeNodeScope === previous.routeNodeScope, `route-node boundary changed: ${previous.landscapeId}`)
  }
}

/** The first policy migration must preserve the two pre-existing Math gates. */
export function legacySemanticRoutePolicy(): SemanticRoutePolicy {
  const mathScopeIds = new Set(['canonical-math-sek1', 'canonical-math-sek2'])
  const mathOwner = routeProfiles.find(profile => profile.profileId === 'canonical-math-sek1')!.landscapeId
  return {
    schemaVersion: 1,
    ledgerSources: [{ landscapeId: mathOwner,
      path: 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json', routeNodeScope: 'qa-stage' }],
    scopes: routeProfiles.map(profile => mathScopeIds.has(profile.profileId)
      ? { scopeId: profile.profileId, status: 'required' }
      : { scopeId: profile.profileId, status: 'pending-semantic-ledger', reason: 'No previously enforced semantic route scope.' }),
  }
}

export function semanticRoutePolicyBaseRef(environment: NodeJS.ProcessEnv = process.env): string {
  const explicit = environment.SEMANTIC_ROUTE_POLICY_BASE
  ensure(environment.CI !== 'true' || (typeof explicit === 'string' && explicit.trim().length > 0),
    'CI requires SEMANTIC_ROUTE_POLICY_BASE from the trusted workflow event')
  const baseRef = explicit ?? 'origin/main'
  ensure(baseRef.trim() === baseRef && baseRef.length > 0 && !baseRef.startsWith('-') && !baseRef.includes(':'), 'invalid policy base ref')
  return baseRef
}

function readBasePolicy(repositoryRoot: string, baseRef: string) {
  // An absent base ref is an error. Only the verified base's absent policy is
  // the initial migration; no catch may turn Git or parse failures into a skip.
  const revision = execFileSync('git', ['rev-parse', '--verify', `${baseRef}^{commit}`], { cwd: repositoryRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
  const tree = execFileSync('git', ['ls-tree', revision, '--', POLICY_PATH], { cwd: repositoryRoot, encoding: 'utf8' })
  return {
    policy: tree.trim()
      ? JSON.parse(execFileSync('git', ['show', `${revision}:${POLICY_PATH}`], { cwd: repositoryRoot, encoding: 'utf8' })) as SemanticRoutePolicy
      : legacySemanticRoutePolicy(),
    baseline: { ref: baseRef, revision, initialMigration: !tree.trim() },
  }
}

export function deriveSemanticRouteProfiles(
  policy: SemanticRoutePolicy,
  semanticKindByGoalId: ReadonlyMap<string, HardRouteSemanticKind>,
  ownerByGoalId: ReadonlyMap<string, string>,
  profiles: readonly QaRouteProfile[] = routeProfiles,
): SemanticRouteProfile[] {
  validateSemanticRoutePolicy(policy, profiles)
  const scopeById = new Map(policy.scopes.map(scope => [scope.scopeId, scope]))
  const sourceByOwner = new Map(policy.ledgerSources.map(source => [source.landscapeId, source]))
  return profiles.filter(profile => sourceByOwner.has(profile.landscapeId)).map(profile => {
    const ownGoal = (goal: LearningGoal) => ownerByGoalId.get(goal.id) === profile.landscapeId
    const qaStageOnly = sourceByOwner.get(profile.landscapeId)!.routeNodeScope === 'qa-stage'
    return {
      profileId: profile.profileId,
      landscapeId: profile.landscapeId,
      scopeLabel: profile.profileId,
      motivationAnchorGoalIds: profile.motivationAnchorGoalIds,
      terminalGoalClusterIds: profile.terminalAutonomyClusterIds,
      // Preserve Mathematics' established explicit stage boundary. Other scopes
      // use the validator's canonical-node convention: common prerequisite atoms
      // may prove paths, while the selected curricular goals stay QA-scope local.
      routeGoalSelector: qaStageOnly ? (goal) => ownGoal(goal) && profile.clusterSelector(goal) : undefined,
      goalSelector: (goal) => ownGoal(goal) && profile.clusterSelector(goal)
        && semanticKindByGoalId.get(goal.id) === 'curricularAtomic',
      required: scopeById.get(profile.profileId)!.status === 'required',
    }
  })
}

export async function loadSemanticRouteInventory(
  repositoryRoot: string,
  landscapes: readonly { file: string; landscape: SkillLandscape }[],
  baseRef = semanticRoutePolicyBaseRef(),
) {
  const inputBindings: Array<{ path: string; sha256: string }> = []
  const inputBytes = new Map<string, Buffer>()
  const inputPresence = new Map<string, boolean>()
  const bindBytes = (path: string) => {
    if (inputBytes.has(path)) return inputBytes.get(path)!
    const bytes = readFileSync(resolve(repositoryRoot, path))
    inputBytes.set(path, bytes)
    inputBindings.push({ path, sha256: `sha256:${createHash('sha256').update(bytes).digest('hex')}` })
    return bytes
  }
  const policy = JSON.parse(bindBytes(POLICY_PATH).toString('utf8')) as SemanticRoutePolicy
  validateSemanticRoutePolicy(policy)
  const base = readBasePolicy(repositoryRoot, baseRef)
  checkSemanticRoutePolicyMonotonicity(policy, base.policy)
  const implementationPaths = [
    'app/scripts/auditSemanticLearningRoutes.ts', 'app/scripts/lib/semanticRouteInventory.ts',
    'app/scripts/lib/hardLearningRouteValidation.ts', 'app/scripts/lib/graphValidationInventory.ts',
    'app/scripts/generateCurriculumQualityStatus.ts', 'app/scripts/goalBookModel.ts',
    'app/scripts/prerequisiteReductionProof.ts', 'app/scripts/optionalHistoricalReviewContext.ts',
    'contracts/curriculum-package/v1/curriculum-ontology-profile.schema.json',
    'contracts/curriculum-package/v1/profiles/semantic-normal-form-v1.profile.json',
    'curricula/curriculum_manifest.json',
  ]
  for (const path of implementationPaths) bindBytes(path)
  const canonicalDirectory = 'curricula/DE/Gymnasium/canonical'
  const directorySignature = () => JSON.stringify(readdirSync(resolve(repositoryRoot, canonicalDirectory), { withFileTypes: true })
    .map(entry => [entry.name, entry.isFile(), entry.isDirectory(), entry.isSymbolicLink()]).sort())
  const initialDirectorySignature = directorySignature()
  for (const entry of landscapes) {
    const path = relative(repositoryRoot, resolve(entry.file))
    if (path.startsWith(`${canonicalDirectory}/`)) bindBytes(path)
  }
  const proofPath = 'curricula/DE/Gymnasium/provenance/prerequisite-reduction-proof-registry.json'
  const bindOptional = (path: string) => {
    const present = existsSync(resolve(repositoryRoot, path))
    inputPresence.set(path, present)
    return present ? bindBytes(path) : undefined
  }
  const proofBytes = bindOptional(proofPath)
  if (proofBytes) {
    try {
      const proof = JSON.parse(proofBytes.toString('utf8')) as { parentRegistryPath?: unknown }
      if (typeof proof.parentRegistryPath === 'string' && proof.parentRegistryPath.startsWith('curricula/DE/Gymnasium/provenance/')
        && !proof.parentRegistryPath.includes('..')) bindOptional(proof.parentRegistryPath)
    } catch {
      // The ordinary proof verifier records the diagnostic and denies reuse;
      // strict current-input ledger validation below remains mandatory.
    }
  }
  const sourceLedgers = new Map(policy.ledgerSources.map(source => [source.path, JSON.parse(bindBytes(source.path).toString('utf8')) as { sourceLandscapePath?: unknown }]))
  const historicalReview = await loadOptionalHistoricalReviewContext({ repositoryRoot })
  const goals: LearningGoal[] = []
  const semanticKindByGoalId = new Map<string, HardRouteSemanticKind>()
  const ownerByGoalId = new Map<string, string>()
  for (const source of policy.ledgerSources) {
    const ledger = sourceLedgers.get(source.path)!
    ensure(typeof ledger.sourceLandscapePath === 'string', `missing landscape path in ${source.path}`)
    const loaded = landscapes.find(entry => entry.landscape.landscapeId === source.landscapeId
      && relative(repositoryRoot, resolve(entry.file)) === ledger.sourceLandscapePath)
    ensure(loaded, `missing live canonical landscape for ${source.path}`)
    const current = JSON.parse(bindBytes(ledger.sourceLandscapePath).toString('utf8')) as SkillLandscape
    ensure(JSON.stringify(current) === JSON.stringify(loaded.landscape), `input changed during load: ${ledger.sourceLandscapePath}`)
    const kinds = parseSemanticKindLedger(ledger, current, source.landscapeId, ledger.sourceLandscapePath, historicalReview.context)
    for (const goal of current.goals) {
      ensure(!ownerByGoalId.has(goal.id), `ambiguous canonical goal identity ${goal.id}`)
      ownerByGoalId.set(goal.id, source.landscapeId)
      semanticKindByGoalId.set(goal.id, kinds.semanticKindByGoalId.get(goal.id)! as HardRouteSemanticKind)
      goals.push(goal)
    }
  }
  const assertInputsCurrent = () => {
    ensure(directorySignature() === initialDirectorySignature, 'canonical directory changed during audit')
    for (const [path, present] of inputPresence) ensure(existsSync(resolve(repositoryRoot, path)) === present, `input presence changed during audit: ${path}`)
    for (const [path, bytes] of inputBytes) ensure(readFileSync(resolve(repositoryRoot, path)).equals(bytes), `input changed during audit: ${path}`)
    ensure(readBasePolicy(repositoryRoot, baseRef).baseline.revision === base.baseline.revision, 'Git coverage base changed during audit')
  }
  assertInputsCurrent()
  return {
    policy, goals, semanticKindByGoalId, ownerByGoalId, inputBindings,
    profiles: deriveSemanticRouteProfiles(policy, semanticKindByGoalId, ownerByGoalId),
    historicalReviewDiagnostic: historicalReview.diagnostic,
    coverageBaseline: base.baseline,
    assertInputsCurrent,
  }
}
