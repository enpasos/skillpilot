// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { applyPhysicsFinalDiodeMappings } from './physicsFinalDiodeMappings'
import { diodeOwnedIds, preserveFinalDiodePlacementsFromCurrent } from './lib/physicsFinalDiodeViewPlacements'
import { preserveB034PlacementsFromCurrent } from './lib/physicsB034ViewPlacements'
import type { PhysicsPlacementNode, PhysicsPlacementView } from './lib/physicsViewPlacementTypes'

type Decision = Parameters<typeof applyPhysicsFinalDiodeMappings>[0][number]
type Mapping = Parameters<typeof applyPhysicsFinalDiodeMappings>[1][number]
type SourceGoal = { id: string; sourceSpan: string }
type SourceBinding = {
  mappingPath: string
  sourceExtractionPath: string
  sourceExtractionSha256: string
  sourceGoal: SourceGoal
  beforeDecision: Decision
  afterDecision: Decision
}
type SourceReceipt = { bindings: SourceBinding[] }
type SourceMapping = { decisions: Decision[]; mappings: Mapping[] }
type SourceExtraction = { sourceGoals: SourceGoal[] }
type K3Packet = {
  mappingPath: string
  sourcePath: string
  sourceSha256: string
  records: {
    sourceGoalId: string
    beforeDecision: Decision
    currentDecision: Decision
    retainedSourceGoal: SourceGoal
    contentDecision: string
  }[]
}


const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const read = (path: string) => readFileSync(resolve(root, path), 'utf8')
const readJson = <T>(path: string): T => JSON.parse(read(path)) as T
const originalReceipt = readJson<SourceReceipt>('curricula/DE/Gymnasium/quality/goal-model-review/physics-semiconductor-learning-path-20261115/source-decisions.json')
const experimentReceipt = readJson<SourceReceipt>('curricula/DE/Gymnasium/quality/goal-model-review/physics-semiconductor-learning-path-20261115/post-corrected-independent-review-v3/transistor-experiment-source-split.json')
const functionalDiodeReceipt = readJson<SourceReceipt & { previousAfterDecision: Decision }>('curricula/DE/Gymnasium/quality/goal-model-review/physics-semiconductor-learning-path-20261115/source-coverage-followup-v4/functional-diode-source-binding.json')
assert.deepEqual(functionalDiodeReceipt.previousAfterDecision, experimentReceipt.bindings[0].afterDecision,
  'the actual source-coverage correction retains its prior source decision')
const currentBindings = new Map([...originalReceipt.bindings, ...experimentReceipt.bindings, ...functionalDiodeReceipt.bindings]
  .map(binding => [`${binding.mappingPath}:${binding.sourceGoal.id}`, binding]))
// Preserve the historical K1 receipts. Exactly one clause has a later,
// independently reviewed K3 component; its current target is not an old K1 claim.
const amplifierConfig = readJson<{
  reviewedAt: string; reviewer: string; sourceDecisionEvidencePath: string; mappingActivationEvidencePath: string
  overrides: {sourceGoalId: string; removeGoalIds: string[]; addGoalIds: string[]; rationale: string}[]
}>('app/scripts/config/physics-k3-amplifier-mapping-overrides.json')
const k3Packet = readJson<K3Packet>(amplifierConfig.sourceDecisionEvidencePath)
const amplifierSourceId = 'a4461a25-8e68-5f80-ab23-0c3f61af59db'
const ownAmplifier = 'd8b2b349-b83a-5225-a180-1afe205750cd'
const amplifierAssessment = 'c19d58dc-2c6e-53a9-8c74-991b55e6f2d0'
const k3 = k3Packet.records.find(row => row.sourceGoalId === amplifierSourceId)
assert(k3, 'the exact retained K3 source packet is required')
assert.equal(k3.contentDecision, 'ACCEPT_MAPPING_FIT_WITH_STATED_PARTIAL_AND_PROFILE_BOUNDARIES')
const k1 = functionalDiodeReceipt.bindings[0]
assert.deepEqual(k3.beforeDecision, k1.afterDecision, 'K3 must retain the actual preceding K1 decision')
assert.deepEqual(k3.retainedSourceGoal, k1.sourceGoal, 'K3 uses the same retained source clause')
assert.equal(k3Packet.mappingPath, k1.mappingPath)
assert.equal(k3Packet.sourcePath, k1.sourceExtractionPath)
assert.equal(k3Packet.sourceSha256, `sha256:${k1.sourceExtractionSha256}`)
assert.deepEqual(k3.currentDecision.canonicalGoalIds, [...k1.afterDecision.canonicalGoalIds, ownAmplifier],
  'only the distinct personally performed amplifier component is added')
assert.equal(amplifierConfig.reviewedAt, k3.currentDecision.reviewedAt)
assert.equal(amplifierConfig.reviewer, 'K3/K6 author; independently reviewed by codex-root on 2026-11-15')
assert.deepEqual(amplifierConfig.overrides, [{
  sourceGoalId: amplifierSourceId, removeGoalIds: [], addGoalIds: [ownAmplifier], rationale: k3.currentDecision.rationale,
}])
const k3Rows = readJson<{changes: {sourceGoalId: string; currentRows: Mapping[]}[]}>(amplifierConfig.mappingActivationEvidencePath)
  .changes.find(row => row.sourceGoalId === amplifierSourceId)
assert(k3Rows, 'the actual K3 activation must bind the exact mapping rows')
const currentAmplifierDecision = {...k3.currentDecision, reviewer: amplifierConfig.reviewer}
currentBindings.set(`${k1.mappingPath}:${amplifierSourceId}`, {...k1, afterDecision: currentAmplifierDecision})
const receipt = {bindings: [...currentBindings.values()]}
const canonical = JSON.parse(read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'))
const known = new Set(canonical.goals.map((goal: {id: string}) => goal.id))
const amplifierTask = canonical.goals.find((goal: {id: string}) => goal.id === amplifierAssessment)
assert.deepEqual(amplifierTask?.requires, [ownAmplifier], 'the amplifier task requires the distinct own-experiment skill')
assert.deepEqual(amplifierTask?.examData.coveredGoalIds, [ownAmplifier], 'coverage belongs to that skill, not paper interpretation')
assert.equal(amplifierTask?.examData.reviewStatus, 'released')
const byPath = new Map<string, SourceMapping>()
const sourceByPath = new Map<string, SourceExtraction>()
for (const binding of receipt.bindings) {
  const mapping = byPath.get(binding.mappingPath) ?? readJson<SourceMapping>(binding.mappingPath)
  byPath.set(binding.mappingPath, mapping)
  const sourceBytes = read(binding.sourceExtractionPath)
  assert.equal(createHash('sha256').update(sourceBytes).digest('hex'), binding.sourceExtractionSha256,
    'retained source input must remain byte-exact')
  const source = sourceByPath.get(binding.sourceExtractionPath) ?? JSON.parse(sourceBytes) as SourceExtraction
  sourceByPath.set(binding.sourceExtractionPath, source)
  assert.deepEqual(source.sourceGoals.find(goal => goal.id === binding.sourceGoal.id), binding.sourceGoal)
  const current = mapping.decisions.find(decision => decision.sourceGoalId === binding.sourceGoal.id)
  assert(current, 'the exact source clause must have a current mapping decision')
  assert.deepEqual(current, binding.afterDecision, 'current mapping must equal the explicitly recorded bounded source decision')
  const replay = [structuredClone(binding.beforeDecision)]
  const primitive = binding.beforeDecision.canonicalGoalIds.map((canonicalGoalId: string) => ({
    legacyGoalId: binding.sourceGoal.id, canonicalGoalId, matchType: 'partial', reviewDecisionId: binding.sourceGoal.id,
  }))
  applyPhysicsFinalDiodeMappings(replay, primitive)
  assert.deepEqual(replay[0], binding.afterDecision, 'cold source overlay must reproduce the exact reviewed successor')
  const once = structuredClone({replay, primitive})
  applyPhysicsFinalDiodeMappings(replay, primitive)
  assert.deepEqual({replay, primitive}, once, 'source overlay must be idempotent, including primitive rows and review metadata')
  if (binding.sourceGoal.id === amplifierSourceId) {
    assert.deepEqual(primitive, k3Rows.currentRows, 'K3 primitive rows must equal the actual bounded activation')
    assert.deepEqual(mapping.mappings.filter(row => row.legacyGoalId === amplifierSourceId), k3Rows.currentRows)
  }
  assert.deepEqual(primitive.map(row => row.canonicalGoalId).sort(), [...current.canonicalGoalIds].sort())
  assert.deepEqual(mapping.mappings.filter(row => row.legacyGoalId === binding.sourceGoal.id)
    .map(row => row.canonicalGoalId).sort(), [...current.canonicalGoalIds].sort())
  assert(current.canonicalGoalIds.every((id: string) => known.has(id)))
  assert(!current.canonicalGoalIds.includes('df010b2b-b182-5f7e-bbe4-49b72e48c27a'), 'a repaired lower-stage clause must not assert advanced bands')
  assert(!current.canonicalGoalIds.includes('620d4320-6b93-500b-8a62-86d02b1ed1f0'), 'a repaired clause must not silently import all solid-state descendants')
}
const priorK1 = [structuredClone(k3.beforeDecision)]
const priorRows = k3.beforeDecision.canonicalGoalIds.map(canonicalGoalId => ({
  legacyGoalId: amplifierSourceId, canonicalGoalId, matchType: 'partial', reviewDecisionId: amplifierSourceId,
}))
applyPhysicsFinalDiodeMappings(priorK1, priorRows)
assert.deepEqual(priorK1, [currentAmplifierDecision], 'a cold K1 input must acquire the exact reviewed K3 successor')
assert.deepEqual(priorRows, k3Rows.currentRows)
// The exact own-experiment clause must no longer certify only a paper interpretation.
const experimentBinding = experimentReceipt.bindings[0]
assert.equal(experimentBinding.sourceGoal.id, 'a4461a25-8e68-5f80-ab23-0c3f61af59db')
assert.equal(experimentBinding.sourceGoal.sourceSpan, 'Ph10.5.1')
assert(experimentBinding.afterDecision.canonicalGoalIds.includes('77ab31a9-8961-511c-8637-06e98023d869'))
assert(!experimentBinding.afterDecision.canonicalGoalIds.includes('7d4d6a39-0c78-5fb0-b7bf-182ed00972f7'))
assert(functionalDiodeReceipt.bindings[0].afterDecision.canonicalGoalIds.includes('dc55adac-91a5-5cc3-ab47-be008480616f'),
  'the explicit recorded-curve interpretation component supplies the functional diode source evidence')
const byModelClause = byPath.get(experimentBinding.mappingPath)?.decisions
  .find(decision => decision.sourceGoalId === '70a98347-c765-5555-bf07-4272c78e7a22')
assert(byModelClause, 'the separate model clause must remain mapped')
assert(byModelClause.canonicalGoalIds.includes('7d4d6a39-0c78-5fb0-b7bf-182ed00972f7'), 'the separate model clause retains interpretation')
assert(!byModelClause.canonicalGoalIds.includes('77ab31a9-8961-511c-8637-06e98023d869'), 'a model clause alone does not certify personal execution')
const unrelated = [{sourceGoalId: 'unrelated-no-semiconductor-claim', canonicalGoalIds: ['unchanged'], rationale: 'unchanged', reviewedAt: 'original', reviewer: 'original'}]
const original = structuredClone(unrelated)
applyPhysicsFinalDiodeMappings(unrelated, [])
assert.deepEqual(unrelated, original, 'unrelated source decisions must stay untouched')
// A generator draft that lacks the new references must restore the reviewed exact stage path,
// without copying an unrelated whole view or inventing a missing stage anchor.
const viewPaths = readdirSync(resolve(root, 'curricula/DE/Gymnasium/composition-views/physik'))
  .filter(path => path.endsWith('.view.json')).map(path => `curricula/DE/Gymnasium/composition-views/physik/${path}`)
viewPaths.push('app/scripts/config/goal-books/navigation/de-gym-physics-national-atlas.view.json')
for (const path of viewPaths) {
  const current = readJson<PhysicsPlacementView>(path)
  if (current.scope.jurisdiction === 'DE-HE' && current.scope.stage !== 'SekI') {
    const paths: string[][] = []
    const findPrep = (nodes: PhysicsPlacementNode[], ancestors: string[] = []) => nodes.forEach(node => {
      if (node.id === 'physics-semiconductor-sekii') paths.push(ancestors)
      findPrep(node.children ?? [], [...ancestors, ...(node.id ? [node.id] : [])])
    })
    findPrep(current.rootNodes)
    assert.equal(paths.length, 1)
    assert.equal(paths[0].at(-1), 'physics-q4', `${path}: advanced preparation belongs inside Q4, not beside E/Q1-Q4`)
  }
  const experimentPaths: string[][] = []
  const findExperiments = (nodes: PhysicsPlacementNode[], path: string[] = []) => nodes.forEach(node => {
    if (node.goalId && ['77ab31a9-8961-511c-8637-06e98023d869', '2cfd5c6a-a16a-5f90-aab7-b27b29271f72'].includes(node.goalId)) {
      assert.equal(node.projectionRole, 'target')
      experimentPaths.push([...path, node.goalId])
    }
    findExperiments(node.children ?? [], [...path, ...(node.id ? [node.id] : [])])
  })
  findExperiments(current.rootNodes)
  const expectedExperiment = (!current.scope.jurisdiction || ['DE', 'DE-BY'].includes(current.scope.jurisdiction)) && current.scope.stage !== 'SekII'
  assert.equal(experimentPaths.length, expectedExperiment ? 2 : 0, `${path}: personal experiment has an exact lower BY/national source scope`)
  assert(experimentPaths.every(path => path.includes('physics-semiconductor-seki')))
  const amplifierPaths: {goalId: string; ancestors: string[]}[] = []
  const findAmplifier = (nodes: PhysicsPlacementNode[], ancestors: string[] = []) => nodes.forEach(node => {
    if (node.goalId === ownAmplifier || node.goalId === amplifierAssessment) {
      assert.equal(node.kind, 'goalEntry', path)
      assert.equal(node.projectionRole, 'target', path)
      amplifierPaths.push({goalId: node.goalId, ancestors})
    }
    findAmplifier(node.children ?? [], [...ancestors, ...(node.id ? [node.id] : [])])
  })
  findAmplifier(current.rootNodes)
  // The atlas is book navigation, not a learner acquisition route: it includes
  // the ordinary amplifier goal, while the new task is on the five real views.
  const bookNavigation = path === 'app/scripts/config/goal-books/navigation/de-gym-physics-national-atlas.view.json'
  const expectedAmplifierIds = expectedExperiment ? (bookNavigation ? [ownAmplifier] : [ownAmplifier, amplifierAssessment]) : []
  assert.deepEqual(amplifierPaths.map(row => row.goalId).sort(), expectedAmplifierIds.sort(),
    `${path}: the actual acquisition route and the separate book navigation retain their exact source scope`)
  if (expectedExperiment) {
    assert(amplifierPaths.find(row => row.goalId === ownAmplifier)?.ancestors.includes('physics-semiconductor-seki'), path)
  }
  const draft = structuredClone(current)
  const strip = (nodes: PhysicsPlacementNode[]): PhysicsPlacementNode[] => nodes.filter(node => !diodeOwnedIds.has(node.goalId ?? ''))
    .map(node => node.children ? {...node, children: strip(node.children)} : node)
    .filter(node => !(node.id?.startsWith('physics-semiconductor-') && node.children?.length === 0))
  draft.rootNodes = strip(draft.rootNodes)
  if (current.scope.jurisdiction === 'DE-BW' && current.scope.stage === 'CrossStage') {
    const find = (nodes: PhysicsPlacementNode[]): PhysicsPlacementNode | undefined => nodes.find(node => node.id === 'physics-final-diode-seki')
      ?? nodes.map(node => find(node.children ?? [])).find(Boolean)
    const currentWrapper = find(current.rootNodes)
    assert(currentWrapper, 'BW must retain its explicit functional/experimental lower wrapper')
    assert(currentWrapper.children, 'the functional wrapper must contain its references')
    assert(!currentWrapper.children.some(node => node.goalId === '7f0798cb-5966-5dcb-beb3-84f637ab6139'),
      'BW must not expose an unused pn model through broad parent support')
    const stale = structuredClone(current)
    const staleWrapper = find(stale.rootNodes)
    assert(staleWrapper?.children)
    staleWrapper.children.push({kind: 'canonicalSubtree', goalId: '7f0798cb-5966-5dcb-beb3-84f637ab6139', projectionRole: 'prerequisiteOnly'})
    assert.throws(() => preserveFinalDiodePlacementsFromCurrent(structuredClone(stale), stale), /unneeded BW lower parent support/u)
    // A stale generated parent must be removed rather than restored from the reviewed view.
    const draftWrapper = find(draft.rootNodes)
    assert(draftWrapper?.children)
    draftWrapper.children.push({kind: 'canonicalSubtree', goalId: '7f0798cb-5966-5dcb-beb3-84f637ab6139', projectionRole: 'prerequisiteOnly'})
  }
  preserveB034PlacementsFromCurrent(draft, current)
  preserveFinalDiodePlacementsFromCurrent(draft, current)
  const placements = (view: PhysicsPlacementView) => {
    const rows: string[] = []
    const visit = (nodes: PhysicsPlacementNode[], path: string[]) => nodes.forEach(node => {
      if (diodeOwnedIds.has(node.goalId ?? '')) rows.push(JSON.stringify({path, node}))
      visit(node.children ?? [], [...path, ...(node.id ? [node.id] : [])])
    })
    visit(view.rootNodes, [])
    return rows.sort()
  }
  assert.deepEqual(placements(draft), placements(current), `${path}: generator replay must preserve references, roles and exact stage paths`)
}
const wrongScope = JSON.parse(read(viewPaths[0]))
const currentScope = structuredClone(wrongScope)
wrongScope.scope.stage = currentScope.scope.stage === 'SekII' ? 'SekI' : 'SekII'
assert.throws(() => preserveFinalDiodePlacementsFromCurrent(wrongScope, currentScope), /scope mismatch/u)
console.log(`Semiconductor source repair passed: ${receipt.bindings.length} exact clauses, ${byPath.size} mappings, ${sourceByPath.size} retained source inputs; replay, ${viewPaths.length} exact view paths and unrelated-goal/scope guards passed.`)
