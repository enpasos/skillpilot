// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import { routeProfiles } from './generateCurriculumQualityStatus'
import { fingerprintSemanticKindSourceGoal, parseSemanticKindLedger } from './goalBookModel'
import { auditSemanticLearningRoutes } from './auditSemanticLearningRoutes'
import { checkSemanticRoutePolicyMonotonicity, deriveSemanticRouteProfiles, legacySemanticRoutePolicy, semanticRoutePolicyBaseRef, validateSemanticRoutePolicy, type SemanticRoutePolicy } from './lib/semanticRouteInventory'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const policy = JSON.parse(readFileSync(resolve(repositoryRoot, 'app/scripts/config/semantic-route-coverage.json'), 'utf8')) as SemanticRoutePolicy

test('semantic coverage accounts for every shared QA scope and preserves three required scopes', () => {
  validateSemanticRoutePolicy(policy)
  assert.equal(policy.scopes.length, 12)
  assert.deepEqual(policy.scopes.filter(scope => scope.status === 'required').map(scope => scope.scopeId).sort(), [
    'canonical-biology-sek2', 'canonical-math-sek1', 'canonical-math-sek2',
  ])
  const derived = deriveSemanticRouteProfiles(policy, new Map(), new Map())
  assert.equal(derived.length, 6)
  for (const profile of derived) {
    const shared = routeProfiles.find(candidate => candidate.profileId === profile.profileId)!
    assert.equal(profile.motivationAnchorGoalIds, shared.motivationAnchorGoalIds)
    assert.equal(profile.terminalGoalClusterIds, shared.terminalAutonomyClusterIds)
  }
})

test('omitted, duplicated, foreign and unexplained scopes fail closed', () => {
  const mutations: Array<(copy: SemanticRoutePolicy) => void> = [
    copy => { copy.scopes.pop() },
    copy => { copy.scopes.push(copy.scopes[0]!) },
    copy => { copy.scopes[0]!.scopeId = 'foreign-scope' },
    copy => { delete copy.scopes.find(scope => scope.status === 'pending-route-evidence')!.reason },
    copy => { copy.ledgerSources.pop() },
    copy => { copy.ledgerSources.push(copy.ledgerSources[0]!) },
    copy => { copy.scopes.find(scope => scope.status === 'pending-semantic-ledger')!.status = 'required' },
  ]
  for (const mutate of mutations) {
    const copy = structuredClone(policy)
    mutate(copy)
    assert.throws(() => validateSemanticRoutePolicy(copy), /Semantic route inventory:/)
  }
})

test('Git-base coverage cannot lose required scopes, covered owners or established route-node boundaries', () => {
  checkSemanticRoutePolicyMonotonicity(policy, legacySemanticRoutePolicy())
  const changes: Array<(copy: SemanticRoutePolicy) => void> = [
    copy => { copy.scopes.find(scope => scope.scopeId === 'canonical-biology-sek2')!.status = 'pending-route-evidence'; copy.scopes.find(scope => scope.scopeId === 'canonical-biology-sek2')!.reason = 'Attempted downgrade' },
    copy => { copy.scopes.find(scope => scope.scopeId === 'canonical-math-sek1')!.status = 'pending-route-evidence'; copy.scopes.find(scope => scope.scopeId === 'canonical-math-sek1')!.reason = 'Attempted downgrade' },
    copy => { copy.ledgerSources[0]!.routeNodeScope = 'canonical-prerequisites' },
    copy => { copy.ledgerSources.splice(1, 1); for (const scope of copy.scopes.filter(scope => scope.scopeId.startsWith('canonical-physics-'))) scope.status = 'pending-semantic-ledger' },
  ]
  for (const change of changes) {
    const changed = structuredClone(policy)
    change(changed)
    assert.throws(() => checkSemanticRoutePolicyMonotonicity(changed, policy), /coverage lowered|boundary changed|owner removed/)
  }
  const movedCurrentLedger = structuredClone(policy)
  movedCurrentLedger.ledgerSources[0]!.path = 'curricula/DE/Gymnasium/quality/current-reviewed-math-ledger.json'
  checkSemanticRoutePolicyMonotonicity(movedCurrentLedger, policy)
})

test('CI requires an explicit workflow base, while local checks default to origin/main', () => {
  assert.equal(semanticRoutePolicyBaseRef({}), 'origin/main')
  const previousPushSha = 'a'.repeat(40)
  assert.equal(semanticRoutePolicyBaseRef({ CI: 'true', SEMANTIC_ROUTE_POLICY_BASE: previousPushSha }), previousPushSha)
  assert.throws(() => semanticRoutePolicyBaseRef({ CI: 'true' }), /trusted workflow event/)
  for (const invalid of ['', ' ', '-main', 'HEAD:policy.json']) {
    assert.throws(() => semanticRoutePolicyBaseRef({ SEMANTIC_ROUTE_POLICY_BASE: invalid }), /invalid policy base ref/)
  }
})

function ledgerFixture() {
  const landscape = { landscapeId: 'fixture', goals: [{ id: 'atom', title: 'Understanding', requires: [], contains: [] }] }
  const ledger = {
    ...JSON.parse(readFileSync(resolve(repositoryRoot, policy.ledgerSources[2]!.path), 'utf8')),
    sourceLandscapeId: 'fixture', sourceLandscapePath: 'curricula/fixture.json',
    counts: { curricularAtomic: 1, curricularArea: 0, practiceAssessment: 0, programStructure: 0, memory: 0, runtimeSupport: 0, orientation: 0, total: 1 },
    decisions: [{ goalId: 'atom', semanticKind: 'curricularAtomic', decisionStatus: 'authoritative',
      decisionBasis: 'reviewed-current-pilot-curricular-atomic', sourceFingerprint: fingerprintSemanticKindSourceGoal(landscape.goals[0]!) }],
  }
  return { ledger, landscape }
}

test('all publication and release ledgers use the same closed current fingerprint contract', () => {
  const { ledger, landscape } = ledgerFixture()
  assert.equal(parseSemanticKindLedger(ledger, landscape, 'fixture', 'curricula/fixture.json').semanticKindByGoalId.get('atom'), 'curricularAtomic')
  for (const field of ['sourceLandscapeId', 'sourceLandscapePath', 'sourceFingerprintContractId']) {
    assert.throws(() => parseSemanticKindLedger({ ...ledger, [field]: 'wrong' }, landscape, 'fixture', 'curricula/fixture.json'))
  }
  for (const change of [
    { decisionStatus: 'candidate' }, { semanticKind: 'unknown' }, { sourceFingerprint: `sha256:${'0'.repeat(64)}` },
  ]) assert.throws(() => parseSemanticKindLedger({ ...ledger, decisions: [{ ...ledger.decisions[0], ...change }] }, landscape, 'fixture', 'curricula/fixture.json'))
  assert.throws(() => parseSemanticKindLedger({ ...ledger, decisions: [...ledger.decisions, ...ledger.decisions] }, landscape, 'fixture', 'curricula/fixture.json'), /duplicate decision/)
  assert.throws(() => parseSemanticKindLedger({ ...ledger, decisions: [] }, landscape, 'fixture', 'curricula/fixture.json'))
  assert.throws(() => parseSemanticKindLedger({ ...ledger, counts: { ...ledger.counts, curricularAtomic: 0 } }, landscape, 'fixture', 'curricula/fixture.json'), /count/)
  assert.throws(() => parseSemanticKindLedger(ledger, { ...landscape, goals: [{ ...landscape.goals[0], title: 'Changed understanding' }] }, 'fixture', 'curricula/fixture.json'), /stale semantic-kind decision/)
})

test('the actual audit validates current ledgers and records pending routes without granting them coverage', async () => {
  const report = await auditSemanticLearningRoutes(repositoryRoot)
  assert.deepEqual(report.summary, {
    registeredScopes: 12, directlyRequiredScopes: 3, ledgerBackedScopes: 6,
    passingScopes: 3, failingScopes: 3, unavailableScopes: 6, routeFindings: 12,
  })
  for (const scope of report.scopes.filter(scope => scope.status === 'required')) assert.equal(scope.outcome, 'pass', scope.scopeId)
  assert.deepEqual(report.scopes.filter(scope => scope.outcome === 'fail').map(scope => [scope.scopeId, scope.findings!.length]), [
    ['canonical-physics-sek1', 8], ['canonical-physics-sek2', 1], ['canonical-chemistry-sek2', 3],
  ])
  assert.equal(report.inputBindings.filter(binding => binding.path.endsWith('.semantic-kinds.json')).length, 4)
})
