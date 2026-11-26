// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import { createRouteProfiles } from './generateCurriculumQualityStatus'
import { fingerprintSemanticKindSourceGoal, parseSemanticKindLedger } from './goalBookModel'
import { auditSemanticLearningRoutes } from './auditSemanticLearningRoutes'
import { checkSemanticRoutePolicyMonotonicity, deriveSemanticRouteProfiles, legacySemanticRoutePolicy, semanticRoutePolicyBaseRef, validateSemanticRoutePolicy, type SemanticRoutePolicy } from './lib/semanticRouteInventory'

const routeProfiles = createRouteProfiles()
const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const policy = JSON.parse(readFileSync(resolve(repositoryRoot, 'app/scripts/config/semantic-route-coverage.json'), 'utf8')) as SemanticRoutePolicy

test('semantic coverage accounts for every shared QA scope and preserves four required scopes', () => {
  validateSemanticRoutePolicy(policy)
  assert.equal(policy.scopes.length, 12)
  assert.deepEqual(policy.scopes.filter(scope => scope.status === 'required').map(scope => scope.scopeId).sort(), [
    'canonical-biology-sek2', 'canonical-math-sek1', 'canonical-math-sek2', 'canonical-physics-sek2',
  ])
  const derived = deriveSemanticRouteProfiles(policy, new Map(), new Map(), routeProfiles)
  assert.equal(derived.length, 6)
  for (const profile of derived) {
    const shared = routeProfiles.find(candidate => candidate.profileId === profile.profileId)!
    assert.equal(profile.motivationAnchorGoalIds, shared.motivationAnchorGoalIds)
    assert.equal(profile.terminalGoalClusterIds, shared.terminalAutonomyClusterIds)
    assert.equal(profile.terminalGoalIds, shared.terminalAutonomyGoalIds,
      'hard semantic routes retain the same explicit assessment endpoints as CQR')
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
    copy => { copy.ledgerSources.splice(1, 1); for (const scope of copy.scopes.filter(scope => scope.scopeId.startsWith('canonical-physics-'))) { scope.status = 'pending-semantic-ledger'; scope.reason = 'Attempted owner removal' } },
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
    registeredScopes: 12, directlyRequiredScopes: 4, ledgerBackedScopes: 6,
    passingScopes: 4, failingScopes: 2, unavailableScopes: 6, routeFindings: 6,
  })
  for (const scope of report.scopes.filter(scope => scope.status === 'required')) assert.equal(scope.outcome, 'pass', scope.scopeId)
  assert.deepEqual(report.scopes.filter(scope => scope.outcome === 'fail').map(scope => [scope.scopeId, scope.findings!.length]), [
    ['canonical-physics-sek1', 3], ['canonical-chemistry-sek2', 3],
  ])
  const pendingPhysics = report.scopes.find(scope => scope.scopeId === 'canonical-physics-sek1')!
  assert.deepEqual(pendingPhysics.findings!.map(finding => finding.goalId).sort(), [
    '14cc61c4-4909-5671-b1ee-930a02cb9f51', '50521f0d-71b1-51cf-b30d-650e3abf3036', 'e0932fef-9e1c-5c95-b00c-7589e76d0e83',
  ])
  // The field-model assessment and released K4 each close through the early arrow goal.
  for (const terminal of ['b4175564-4397-5c08-90ba-4f13231a75ec', '2569d84a-5bf1-542b-bc43-6ade1df971c4']) {
    assert.deepEqual(report.directedQuantityArrows.paths.find(row => row.goalId === terminal)?.path,
      [terminal, 'b77a7e93-22f9-5722-a4cc-f18a149ab030'])
  }
  assert.equal(report.inputBindings.filter(binding => binding.path.endsWith('.semantic-kinds.json')).length, 4)
  assert.equal(report.inputBindings.filter(binding => binding.path.includes('/composition-views/physik/')).length, 3)
  assert.deepEqual(report.scopeAlignmentDebt.map(debt => [debt.profileId, debt.additionalInheritedTargetGoalIds.length, debt.findings.length]), [['canonical-physics-sek2', 43, 42]])
})
