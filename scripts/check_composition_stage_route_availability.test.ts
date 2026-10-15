// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import {
  collectRenderedAtomicGoalIdsFromCompositionView,
  collectSameViewStagePrerequisiteSupport,
  collectFullViewAvailableGoalDefinitionIds,
  collectNationalViewBoundStageAtomicGoalIds,
  stageEndpointPrerequisiteAvailability,
} from '../app/scripts/generateCurriculumQualityStatus'
import { collectCompositionProjectionRoleGoalIds } from '../app/src/utils/authoring/compositionViewAuthoring'
import type { SkillLandscape } from '../app/src/landscapeTypes'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const fixtureRoot = process.env.SKILLPILOT_STAGE_AVAILABILITY_FIXTURES
  ?? resolve(root, 'tmp/composition-stage-route-availability-test')
mkdirSync(fixtureRoot, { recursive: true })
const goal = (id: string, contains: string[] = [], requires: string[] = []) => ({
  id, title: id, description: id, weight: 1, contains, requires,
  tags: id === 'ROOT' ? ['root'] : ['GK', 'LK'],
  type: contains.length ? 'cluster' : 'atomic',
  ...(id === 'ENDPOINT' ? { extendedData: { applicabilityFromRequires: true } } : {}),
  dimensionTags: { framework: 'fixture', demandLevel: 'AB1', processCompetencies: [], guidingIdeas: [], phase: 'GLOBAL' },
})
const fixture = (missingFromView = false, unknownRequirement = false) => {
  const landscape = {
    landscapeId: 'TEST', title: 'Physics', locale: 'de',
    goals: [
      goal('ROOT', ['LOWER_CLUSTER', 'ENDPOINT', 'UPPER_DIRECT', 'UPPER_INHERITED', 'UPPER_CLOSURE', 'UPPER_UNUSED', 'EXPLICIT_SUPPORT']),
      goal('LOWER_CLUSTER', ['LOWER_TASK'], ['UPPER_INHERITED']),
      goal('LOWER_TASK', [], ['UPPER_DIRECT']),
      goal('ENDPOINT', [], [unknownRequirement ? 'UNKNOWN' : 'UPPER_DIRECT']),
      goal('UPPER_DIRECT', [], ['UPPER_CLOSURE']),
      goal('UPPER_INHERITED'), goal('UPPER_CLOSURE'), goal('UPPER_UNUSED'), goal('EXPLICIT_SUPPORT'),
    ],
  } as unknown as SkillLandscape
  const view = {
    viewId: 'fixture-crossstage', landscapeId: 'TEST',
    scope: { schoolForm: 'Gymnasium', stage: 'CrossStage', courseProfile: 'GK' },
    rootNodes: [{ kind: 'structure', id: 'physics-root', label: 'Physics', children: [
      { kind: 'structure', id: 'lower', label: 'Sekundarstufe I', children: [
        { kind: 'canonicalSubtree', goalId: 'LOWER_CLUSTER' },
        { kind: 'goalEntry', goalId: 'ENDPOINT' },
        { kind: 'goalEntry', goalId: 'EXPLICIT_SUPPORT', projectionRole: 'prerequisiteOnly' },
      ] },
      { kind: 'structure', id: 'upper', label: 'Sekundarstufe II', children:
        ['UPPER_DIRECT', 'UPPER_INHERITED', 'UPPER_CLOSURE', 'UPPER_UNUSED']
          .filter(id => !missingFromView || id !== 'UPPER_DIRECT')
          .map(goalId => ({ kind: 'goalEntry', goalId })),
      },
    ] }],
  }
  return { landscape, view }
}
const saveView = (name: string, view: unknown) => {
  const file = resolve(fixtureRoot, `${name}.view.json`)
  writeFileSync(file, `${JSON.stringify(view, null, 2)}\n`)
  return file
}
const sorted = (ids: ReadonlySet<string>) => [...ids].sort()

test('native stage inspection adds only needed same-view direct, inherited and transitive prerequisites as support', () => {
  const { landscape, view } = fixture()
  const file = saveView('positive', view)
  const targets = collectRenderedAtomicGoalIdsFromCompositionView(landscape, file, ['GK'], false, 'SekI')
  const visible = collectRenderedAtomicGoalIdsFromCompositionView(landscape, file, ['GK'], true, 'SekI')
  assert.deepEqual(sorted(targets), ['ENDPOINT', 'LOWER_TASK'])
  assert.deepEqual(sorted(visible), ['ENDPOINT', 'EXPLICIT_SUPPORT', 'LOWER_TASK', 'UPPER_CLOSURE', 'UPPER_DIRECT', 'UPPER_INHERITED'])
  assert(!visible.has('UPPER_UNUSED'))
  assert.deepEqual(sorted(collectRenderedAtomicGoalIdsFromCompositionView(landscape, file, ['GK'], false, 'SekI')), sorted(targets))
  assert(landscape.goals.find(g => g.id === 'ENDPOINT')!.requires!.every(id => visible.has(id)))
})

test('a known prerequisite missing from the complete same-view projection remains unavailable', () => {
  const { landscape, view } = fixture(true)
  const file = saveView('missing-full-view', view)
  const visible = collectRenderedAtomicGoalIdsFromCompositionView(landscape, file, ['GK'], true, 'SekI')
  assert(!visible.has('UPPER_DIRECT'))
  assert(!visible.has('UPPER_CLOSURE'), 'No inferred route through an unavailable prerequisite')
  assert(!landscape.goals.find(g => g.id === 'ENDPOINT')!.requires!.every(id => visible.has(id)))
})

test('an unknown prerequisite is never invented and the retained endpoint still fails its availability condition', () => {
  const { landscape, view } = fixture(false, true)
  const file = saveView('unknown', view)
  const targets = collectRenderedAtomicGoalIdsFromCompositionView(landscape, file, ['GK'], false, 'SekI')
  const visible = collectRenderedAtomicGoalIdsFromCompositionView(landscape, file, ['GK'], true, 'SekI')
  const full = collectRenderedAtomicGoalIdsFromCompositionView(landscape, file, ['GK'])
  const result = collectSameViewStagePrerequisiteSupport(landscape, targets, new Set(['EXPLICIT_SUPPORT']), full)
  assert(result.unavailablePrerequisiteGoalIds.has('UNKNOWN'))
  assert(!visible.has('UNKNOWN'))
  assert(targets.has('ENDPOINT'))
  assert(!landscape.goals.find(g => g.id === 'ENDPOINT')!.requires!.every(id => visible.has(id)))
})

test('national authority cannot import a derived state prerequisite absent from the national full target projection', () => {
  const state = fixture()
  const stateFile = saveView('state', state.view)
  const national = fixture(true)
  national.view.rootNodes[0].children[0].children = national.view.rootNodes[0].children[0].children!
    .filter(node => node.goalId !== 'EXPLICIT_SUPPORT') as never
  const nationalFile = saveView('national-missing-definition', national.view)
  const nationalFull = collectRenderedAtomicGoalIdsFromCompositionView(national.landscape, nationalFile, ['GK'], true)
  const unrestrictedState = collectRenderedAtomicGoalIdsFromCompositionView(state.landscape, stateFile, ['GK'], true, 'SekI')
  const boundedState = collectRenderedAtomicGoalIdsFromCompositionView(state.landscape, stateFile, ['GK'], true, 'SekI', [], nationalFull)
  assert(unrestrictedState.has('UPPER_DIRECT'))
  assert(!nationalFull.has('UPPER_DIRECT'))
  assert(!nationalFull.has('EXPLICIT_SUPPORT'))
  assert(!boundedState.has('UPPER_DIRECT'))
  assert(!state.landscape.goals.find(g => g.id === 'ENDPOINT')!.requires!.every(id => boundedState.has(id)))
  assert(boundedState.has('EXPLICIT_SUPPORT'), 'Existing explicit state support policy is retained')
})

test('national own explicit support qualifies when the state now offers that prerequisite as an upper-stage target', () => {
  const state = fixture()
  const stateFile = saveView('state-explicit-national-positive', state.view)
  const national = fixture(true)
  national.view.rootNodes[0].children[0].children!.push({
    kind: 'goalEntry', goalId: 'UPPER_DIRECT', projectionRole: 'prerequisiteOnly',
  } as never)
  const nationalFile = saveView('national-own-explicit-support', national.view)
  const ownTargets = collectRenderedAtomicGoalIdsFromCompositionView(national.landscape, nationalFile, ['GK'])
  const ownDefinitions = collectRenderedAtomicGoalIdsFromCompositionView(national.landscape, nationalFile, ['GK'], true)
  assert(!ownTargets.has('UPPER_DIRECT'))
  assert(ownDefinitions.has('UPPER_DIRECT'))
  const boundedState = collectRenderedAtomicGoalIdsFromCompositionView(
    state.landscape, stateFile, ['GK'], true, 'SekI', [], ownDefinitions,
  )
  assert(boundedState.has('UPPER_DIRECT'))
  assert(state.landscape.goals.find(g => g.id === 'ENDPOINT')!.requires!.every(id => boundedState.has(id)))
  assert(!boundedState.has('UPPER_UNUSED'))
})

test('cluster requirements expand actual descendants and keep their inherited hard guards bounded to the same view', () => {
  const { landscape } = fixture()
  landscape.goals.push(goal('REQUIRED_CLUSTER', ['CLUSTER_CHILD'], ['UPPER_INHERITED']) as never)
  landscape.goals.push(goal('CLUSTER_CHILD') as never)
  const endpoint = landscape.goals.find(g => g.id === 'ENDPOINT')!
  endpoint.requires = ['REQUIRED_CLUSTER']
  const result = collectSameViewStagePrerequisiteSupport(
    landscape, new Set(['ENDPOINT']), new Set(), new Set(['CLUSTER_CHILD', 'UPPER_INHERITED', 'UPPER_UNUSED']),
    undefined, { fullViewGoalIds: new Set(['REQUIRED_CLUSTER', 'CLUSTER_CHILD', 'UPPER_INHERITED', 'UPPER_UNUSED']) },
  )
  assert.deepEqual(sorted(result.addedSupportGoalIds), ['CLUSTER_CHILD', 'UPPER_INHERITED'])
  assert.equal(result.unavailablePrerequisiteGoalIds.size, 0)
})

test('real RP Physics views retain hidden Math roles and exact target semantics during QA support inspection', () => {
  const read = (file: string) => JSON.parse(readFileSync(resolve(root, file), 'utf8'))
  const physics = read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json')
  const math = read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json')
  const mathIds = new Set<string>(math.goals.map((g: { id: string }) => g.id))
  const index = new Map([...physics.goals, ...math.goals].map(g => [g.id, g]))
  for (const profile of ['gk', 'lk']) {
    const file = resolve(root, `curricula/DE/Gymnasium/composition-views/physik/de-rp-${profile}.view.json`)
    const view = JSON.parse(readFileSync(file, 'utf8'))
    const before = collectCompositionProjectionRoleGoalIds(view.rootNodes, index)
    const targets = collectRenderedAtomicGoalIdsFromCompositionView(physics, file, [profile.toUpperCase()], false, 'SekI')
    const support = collectRenderedAtomicGoalIdsFromCompositionView(physics, file, [profile.toUpperCase()], true, 'SekI')
    const after = collectCompositionProjectionRoleGoalIds(view.rootNodes, index)
    assert.deepEqual(sorted(after.targetGoalIds), sorted(before.targetGoalIds))
    assert.deepEqual(sorted(after.prerequisiteOnlyGoalIds), sorted(before.prerequisiteOnlyGoalIds))
    assert(![...after.targetGoalIds].some(id => mathIds.has(id)))
    assert(![...targets].some(id => mathIds.has(id)))
    assert(!support.has('UNKNOWN'))
  }
})


test('derived route support cannot create applicability for an undeclared endpoint', () => {
  const { landscape, view } = fixture()
  const file = saveView('undeclared-endpoint-no-new-scope', view)
  const targets = collectRenderedAtomicGoalIdsFromCompositionView(landscape, file, ['GK'], false, 'SekI')
  const explicit = collectRenderedAtomicGoalIdsFromCompositionView(landscape, file, ['GK'], true, 'SekI', [], undefined, false)
  const route = collectRenderedAtomicGoalIdsFromCompositionView(landscape, file, ['GK'], true, 'SekI')
  assert(route.has('UPPER_DIRECT'))
  assert(!explicit.has('UPPER_DIRECT'))
  const endpointAvailability = stageEndpointPrerequisiteAvailability('UNPLACED_ENDPOINT', targets, explicit, route)
  assert(!['UPPER_DIRECT'].every(id => endpointAvailability.has(id)))
  assert(!targets.has('UNPLACED_ENDPOINT'))
})

test('a previously required but missing endpoint still fails the unchanged expected-versus-actual comparison', () => {
  const { landscape, view } = fixture()
  const file = saveView('expected-missing-endpoint-still-fails', view)
  const targets = collectRenderedAtomicGoalIdsFromCompositionView(landscape, file, ['GK'], false, 'SekI')
  const explicit = collectRenderedAtomicGoalIdsFromCompositionView(landscape, file, ['GK'], true, 'SekI', [], undefined, false)
  const route = collectRenderedAtomicGoalIdsFromCompositionView(landscape, file, ['GK'], true, 'SekI')
  const endpointAvailability = stageEndpointPrerequisiteAvailability('MISSING_ENDPOINT', targets, explicit, route)
  const expectedEndpoint = ['LOWER_TASK'].every(id => endpointAvailability.has(id))
  const actualEndpoint = targets.has('MISSING_ENDPOINT')
  assert(expectedEndpoint)
  assert(!actualEndpoint)
  assert(expectedEndpoint && !actualEndpoint, 'The missing-endpoint diagnostic must remain')
})


test('visible atomic children cannot synthesize an undeclared prerequisite cluster root', () => {
  const { landscape } = fixture()
  landscape.goals.push(goal('REQUIRED_CLUSTER', ['CLUSTER_CHILD']) as never)
  landscape.goals.push(goal('CLUSTER_CHILD') as never)
  landscape.goals.find(g => g.id === 'ENDPOINT')!.requires = ['REQUIRED_CLUSTER']
  const result = collectSameViewStagePrerequisiteSupport(
    landscape, new Set(['ENDPOINT']), new Set(), new Set(['CLUSTER_CHILD']),
    undefined, { fullViewGoalIds: new Set(['CLUSTER_CHILD']) },
  )
  assert(result.unavailablePrerequisiteGoalIds.has('REQUIRED_CLUSTER'))
  assert(!result.addedSupportGoalIds.has('CLUSTER_CHILD'))
  assert.equal(result.addedSupportGoalIds.size, 0)
})

test('a national atomic-only availability limit does not prove a missing prerequisite cluster root', () => {
  const { landscape } = fixture()
  landscape.goals.push(goal('REQUIRED_CLUSTER', ['CLUSTER_CHILD']) as never)
  landscape.goals.push(goal('CLUSTER_CHILD') as never)
  landscape.goals.find(g => g.id === 'ENDPOINT')!.requires = ['REQUIRED_CLUSTER']
  const result = collectSameViewStagePrerequisiteSupport(
    landscape, new Set(['ENDPOINT']), new Set(), new Set(['CLUSTER_CHILD']), new Set(['CLUSTER_CHILD']),
    { fullViewGoalIds: new Set(['REQUIRED_CLUSTER', 'CLUSTER_CHILD']) },
  )
  assert(result.unavailablePrerequisiteGoalIds.has('REQUIRED_CLUSTER'))
  assert.equal(result.addedSupportGoalIds.size, 0)
})


test('native projection distinguishes a declared cluster root from individually exposed children', () => {
  const run = (rootDeclared: boolean) => {
    const { landscape, view } = fixture()
    landscape.goals.push(goal('REQUIRED_CLUSTER', ['CLUSTER_CHILD']) as never)
    landscape.goals.push(goal('CLUSTER_CHILD') as never)
    landscape.goals.find(g => g.id === 'ENDPOINT')!.requires = ['REQUIRED_CLUSTER']
    view.rootNodes[0].children[1].children!.push({
      kind: rootDeclared ? 'canonicalSubtree' : 'goalEntry',
      goalId: rootDeclared ? 'REQUIRED_CLUSTER' : 'CLUSTER_CHILD',
    } as never)
    const file = saveView(rootDeclared ? 'declared-cluster-root' : 'cluster-child-only', view)
    const targets = collectRenderedAtomicGoalIdsFromCompositionView(landscape, file, ['GK'], false, 'SekI')
    const available = collectRenderedAtomicGoalIdsFromCompositionView(landscape, file, ['GK'], true, 'SekI')
    assert(!targets.has('REQUIRED_CLUSTER'))
    assert(!targets.has('CLUSTER_CHILD'))
    return available
  }
  assert(run(true).has('CLUSTER_CHILD'))
  assert(!run(false).has('CLUSTER_CHILD'))
})


const nationalClusterCallerFixture = (nationalDeclaration: 'target-root' | 'support-root' | 'child-only' | 'missing') => {
  const { landscape, view: stateView } = fixture()
  landscape.goals.push(goal('REQUIRED_CLUSTER', ['CLUSTER_CHILD']) as never)
  landscape.goals.push(goal('CLUSTER_CHILD') as never)
  landscape.goals.find(g => g.id === 'ENDPOINT')!.requires = ['REQUIRED_CLUSTER']
  stateView.scope = { ...stateView.scope, jurisdiction: 'DE-RP' } as never
  stateView.rootNodes[0].children[1].children!.push({ kind: 'canonicalSubtree', goalId: 'REQUIRED_CLUSTER' } as never)
  const nationalView = structuredClone(stateView)
  delete (nationalView.scope as { jurisdiction?: string }).jurisdiction
  nationalView.viewId = `fixture-national-${nationalDeclaration}`
  const upper = nationalView.rootNodes[0].children[1].children!
  upper.splice(upper.findIndex(node => node.goalId === 'REQUIRED_CLUSTER'), 1)
  if (nationalDeclaration === 'target-root' || nationalDeclaration === 'support-root') {
    upper.push({ kind: 'canonicalSubtree', goalId: 'REQUIRED_CLUSTER',
      ...(nationalDeclaration === 'support-root' ? { projectionRole: 'prerequisiteOnly' } : {}),
    } as never)
  } else if (nationalDeclaration === 'child-only') {
    upper.push({ kind: 'goalEntry', goalId: 'CLUSTER_CHILD' } as never)
  }
  return { landscape,
    stateFile: saveView(`national-caller-state-${nationalDeclaration}`, stateView),
    nationalFile: saveView(`national-caller-own-${nationalDeclaration}`, nationalView),
  }
}

for (const declaration of ['target-root', 'support-root'] as const) {
  test(`the actual national stage-authority caller accepts a national ${declaration} definition`, () => {
    const { landscape, stateFile, nationalFile } = nationalClusterCallerFixture(declaration)
    const atomicOnly = collectRenderedAtomicGoalIdsFromCompositionView(landscape, nationalFile, ['GK'], true)
    const definitions = collectFullViewAvailableGoalDefinitionIds(landscape, nationalFile, ['GK'])
    assert(atomicOnly.has('CLUSTER_CHILD'))
    assert(!atomicOnly.has('REQUIRED_CLUSTER'))
    assert(definitions.has('REQUIRED_CLUSTER'))
    const targets = collectRenderedAtomicGoalIdsFromCompositionView(landscape, stateFile, ['GK'], false, 'SekI')
    const bounded = collectNationalViewBoundStageAtomicGoalIds(landscape, nationalFile, stateFile, ['GK'], ['GK'], 'SekI')
    assert(bounded.has('CLUSTER_CHILD'))
    assert(!bounded.has('REQUIRED_CLUSTER'), 'The route API and learner targets remain atomic')
    assert(!bounded.has('UPPER_UNUSED'))
    assert.deepEqual(sorted(targets), ['ENDPOINT', 'LOWER_TASK'])
    assert.deepEqual(sorted(collectRenderedAtomicGoalIdsFromCompositionView(landscape, stateFile, ['GK'], false, 'SekI')), sorted(targets))
  })
}

for (const declaration of ['child-only', 'missing'] as const) {
  test(`the actual national stage-authority caller rejects a ${declaration} cluster definition`, () => {
    const { landscape, stateFile, nationalFile } = nationalClusterCallerFixture(declaration)
    const definitions = collectFullViewAvailableGoalDefinitionIds(landscape, nationalFile, ['GK'])
    assert(!definitions.has('REQUIRED_CLUSTER'))
    assert.equal(definitions.has('CLUSTER_CHILD'), declaration === 'child-only')
    const unrestricted = collectRenderedAtomicGoalIdsFromCompositionView(landscape, stateFile, ['GK'], true, 'SekI')
    const bounded = collectNationalViewBoundStageAtomicGoalIds(landscape, nationalFile, stateFile, ['GK'], ['GK'], 'SekI')
    assert(unrestricted.has('CLUSTER_CHILD'))
    assert(!bounded.has('CLUSTER_CHILD'), 'A child cannot authorize its missing national root')
    assert(bounded.has('ENDPOINT'), 'The original endpoint remains subject to strict route QA')
    assert(bounded.has('EXPLICIT_SUPPORT'), 'Existing explicit state support policy remains')
  })
}
