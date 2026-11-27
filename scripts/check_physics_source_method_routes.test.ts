import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import {
  collectCompositionProjectionRoleGoalIds,
  compileCompositionView,
  type CompositionView,
  type CompositionViewNode,
  type CompositionStructureNode,
} from '../app/src/utils/authoring/compositionViewAuthoring'
import type { CanonicalAuthoringLandscape } from '../app/src/utils/authoring/canonicalAuthoring'

// Run with: app/node_modules/.bin/tsx --test scripts/check_physics_source_method_routes.test.ts
// This checks authored availability and placement. Runtime frontier semantics
// remain covered by ProjectionRoleLearnerServiceTest; no mastery is fabricated.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const readJson = (path: string) => JSON.parse(readFileSync(resolve(root, path), 'utf8'))
const canonicalDirectory = 'curricula/DE/Gymnasium/canonical'
const physics: CanonicalAuthoringLandscape = readJson(`${canonicalDirectory}/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json`)
const landscapes: CanonicalAuthoringLandscape[] = readdirSync(resolve(root, canonicalDirectory))
  .filter(name => name.endsWith('.json'))
  .map(name => readJson(`${canonicalDirectory}/${name}`))
const universe = { ...physics, goals: landscapes.flatMap(landscape => landscape.goals) }
const byId = new Map(universe.goals.map(goal => [goal.id, goal]))
const landscapesById = new Map(landscapes.map(landscape => [landscape.landscapeId, landscape]))
const manifest = readJson('app/scripts/config/goal-books/de-gym-physics-national-atlas.sources.json')
const views: { path: string, view: CompositionView }[] = manifest.sourcePaths
  .map((path: string) => ({ path, view: readJson(path) }))
const neutralViews = views.filter(({ view }) => view.scope.durationModel === undefined)
const hesseDurationViews = views.filter(({ view }) => view.scope.durationModel !== undefined)

const orientation = '5c44b9ba-9b05-4774-95d5-073230d3fc4f'
const observation = '5355fee0-0477-5570-a234-561477bf77ba'
const units = '3ed3279e-c524-5230-a277-dda89493df6d'
const models = 'e5bc2227-d900-585f-8ac0-9d3f1cb40e27'
const sources = 'd2e6f87d-795b-5631-a7cc-0bfb5dc5142e'
const methods = [observation, units, models, sources]
const astronomy = [
  '982df2f3-e040-5f4b-b668-0fe05d994b29',
  '6ae54ff9-dc3b-563b-b2ee-09a0f0d00162',
]
const methodStructureId = 'physics-source-method-foundations'

const structures = (nodes: CompositionViewNode[]): CompositionStructureNode[] => nodes.flatMap(node => (
  node.kind === 'structure' ? [node, ...structures(node.children)] : []
))
const referenceCount = (nodes: CompositionViewNode[], goalId: string): number => nodes.reduce((count, node) => (
  count + (node.kind === 'structure'
    ? referenceCount(node.children, goalId)
    : 'goalId' in node && node.goalId === goalId ? 1 : 0)
), 0)
const flattenReferences = (nodes: CompositionViewNode[]): Exclude<CompositionViewNode, CompositionStructureNode>[] =>
  nodes.flatMap(node => (node.kind === 'structure' ? flattenReferences(node.children) : [node]))

const referencePath = (nodes: CompositionViewNode[], goalId: string, ancestors: CompositionStructureNode[] = []): CompositionStructureNode[] | undefined => {
  for (const node of nodes) {
    if (node.kind === 'structure') {
      const found = referencePath(node.children, goalId, [...ancestors, node])
      if (found) return found
    } else if ('goalId' in node && node.goalId === goalId) return ancestors
  }
}
// Atomic prerequisites order goals inside one unit. Across different authored
// units the declared partial order must preserve the acquisition path. Array
// adjacency and a particular old preparation wrapper are not that contract.
const assertAcquiredBefore = (view: CompositionView, prerequisite: string, consumer: string, path: string) => {
  const before = referencePath(view.rootNodes, prerequisite)
  const after = referencePath(view.rootNodes, consumer)
  assert(before && after, `${path}: both acquisition and consumer references must exist`)
  let i = 0
  while (i < Math.min(before.length, after.length) && before[i] === after[i]) i++
  if (i === Math.min(before.length, after.length)) return
  assert(i > 0, `${path}: acquisition and consumer must share their subject tree`)
  const parent = before[i - 1]
  assert(parent.childOrder, `${path}: explicit partial order required at ${parent.id}`)
  const pending = [after[i].id], reached = new Set<string>()
  while (pending.length) {
    const next = pending.pop()!
    if (reached.has(next)) continue
    reached.add(next)
    pending.push(...parent.childOrder.after.filter(pair => pair.unit === next).map(pair => pair.after))
  }
  assert(reached.has(before[i].id), `${path}: missing declared acquisition order ${before[i].id} -> ${after[i].id}`)
}

// The 15 November K3 acquisition repair makes the necessary AB1 methods explicit
// learning targets. This is reviewed preparation for the selected curriculum,
// not an assertion that each Land independently names the whole method goal.
// The 28 cross-stage views put them in Sek I; the 28 single-stage Sek-II views
// retain acquisition before astronomy. HE introduces them earlier in E, where
// its existing introductory tasks already need them. Neither role presence nor compilation
// certifies mastery, task coverage, source completeness or a runtime frontier.
const methodPreparationJurisdictions = new Set([
  'DE-BB', 'DE-BE', 'DE-HB', 'DE-HE', 'DE-HH', 'DE-MV', 'DE-NI',
  'DE-NW', 'DE-RP', 'DE-SH', 'DE-SL', 'DE-SN', 'DE-ST', 'DE-TH',
])
const methodsArePreparation = (view: CompositionView): boolean => view.scope.stage === 'CrossStage'
  && methodPreparationJurisdictions.has(String(view.scope.jurisdiction))

test('every atlas view that teaches either astronomy goal teaches all current method prerequisites', () => {
  assert.equal(views.length, 70)
  assert.equal(neutralViews.length, 64, 'retain the complete duration-neutral atlas floor')
  assert.deepEqual(neutralViews.map(({ path }) => path).sort(), readdirSync(resolve(root, 'curricula/DE/Gymnasium/composition-views/physik'))
    .filter(name => /^(?:de-[a-z]{2})-(?:gk|lk|sekii-gk|sekii-lk)\.view\.json$/u.test(name))
    .map(name => `curricula/DE/Gymnasium/composition-views/physik/${name}`).sort())
  assert.deepEqual(hesseDurationViews.map(({ view }) => [view.scope.jurisdiction, view.scope.durationModel, view.scope.stage, view.scope.courseProfile ?? null]).sort(),
    ['G8', 'G9'].flatMap(duration => [['DE-HE', duration, 'SekI', null], ['DE-HE', duration, 'CrossStage', 'GK'], ['DE-HE', duration, 'CrossStage', 'LK']]).sort())
  let astronomyViewCount = 0
  for (const { path, view } of views) {
    const roles = collectCompositionProjectionRoleGoalIds(view.rootNodes, byId)
    if (!astronomy.some(goalId => roles.targetGoalIds.has(goalId))) continue
    astronomyViewCount++
    for (const goalId of [...methods, orientation]) {
      assert(roles.targetGoalIds.has(goalId), `${path}: prerequisite must be learnable: ${goalId}`)
      assert(!roles.prerequisiteOnlyGoalIds.has(goalId), `${path}: method must not remain hidden support: ${goalId}`)
    }
    for (const goalId of methods) {
      for (const requiredId of byId.get(goalId)?.requires ?? []) {
        assert(byId.has(requiredId), `${path}: unresolved method prerequisite: ${requiredId}`)
        assert(roles.targetGoalIds.has(requiredId), `${path}: omitted method dependency: ${goalId} -> ${requiredId}`)
      }
    }
  }
  assert.equal(astronomyViewCount, 64, 'retain all 60 previous astronomy scopes and both HE courses for each duration')
  assert.equal(neutralViews.filter(({ view }) => {
    const roles = collectCompositionProjectionRoleGoalIds(view.rootNodes, byId)
    return astronomy.some(goalId => roles.targetGoalIds.has(goalId))
  }).length, 60, 'the complete existing astronomy-view floor remains checked')
})

test('the four AB1 method goals retain their bounded qualitative sequence', () => {
  assert.deepEqual(byId.get(observation)?.requires, [orientation])
  assert.deepEqual(byId.get(units)?.requires, [orientation])
  assert.deepEqual(byId.get(models)?.requires, [observation])
  assert.deepEqual(byId.get(sources)?.requires, [models, units])
  for (const goalId of astronomy) assert(byId.get(goalId)?.requires.includes(sources))
})

test('all six HE duration scopes retain source-bound Sek-I years and the same method targets', () => {
  assert.equal(hesseDurationViews.length, 6)
  for (const { path, view } of hesseDurationViews) {
    const sekI = structures(view.rootNodes).find(node => node.id === 'physics-seki')
    assert(sekI, `${path}: native Sek-I branch required`)
    assert.deepEqual(sekI.children.filter(node => node.kind === 'structure').map(node => node.id),
      view.scope.durationModel === 'G8'
        ? [6, 7, 8, 9].map(year => `physics-he-seki-j${year}-g8`)
        : [7, 8, 10].map(year => `physics-he-seki-j${year}`))
    const roles = collectCompositionProjectionRoleGoalIds(sekI.children, byId)
    for (const goalId of [...methods, orientation]) {
      assert(roles.targetGoalIds.has(goalId), `${path}: methods remain actual lower-stage acquisition targets`)
      assert(!roles.prerequisiteOnlyGoalIds.has(goalId), `${path}: no method target downgrade`)
      assert.equal(referenceCount(view.rootNodes, goalId), 1, `${path}: exactly one method acquisition`)
    }
    const branch = structures(sekI.children).find(node => node.id === 'physics-methods-k3-preparation')
    assert(branch, `${path}: method acquisition branch required`)
    assert.deepEqual(branch.children, methods.map(goalId => ({ kind: 'goalEntry', goalId, projectionRole: 'target' })))
    if (view.scope.stage === 'SekI') {
      assert.equal(structures(view.rootNodes).some(node => node.id.startsWith('physics-sekii')), false,
        `${path}: genuine Sek-I view must contain no visible upper-stage branch`)
    }
  }
})

test('28 existing plus four HE duration cross-stage views teach methods once in Sek I; all 28 Sek-II views retain earlier acquisition', () => {
  let preparationViews = 0
  for (const { path, view } of views) {
    if (!methodsArePreparation(view)) continue
    preparationViews++
    assert.equal(structures(view.rootNodes).filter(node => node.id === methodStructureId).length, 0, path)
    const sekI = structures(view.rootNodes).find(node => node.id === 'physics-seki')
    assert(sekI, `${path}: methods need the existing lower-stage acquisition place`)
    const lowerRoles = collectCompositionProjectionRoleGoalIds(sekI.children, byId)
    for (const id of methods) assert(lowerRoles.targetGoalIds.has(id), `${path}: lost lower-stage acquisition ${id}`)
    if (view.scope.jurisdiction === 'DE-HE') {
      const branches = structures(sekI.children).filter(node => node.id === 'physics-methods-k3-preparation')
      assert.equal(branches.length, 1, `${path}: HE retains one acquisition branch`)
      const branch = branches[0]
      const isG8 = view.scope.durationModel === 'G8'
      const acquisitionYearId = isG8 ? 'physics-he-seki-j6-g8' : 'physics-he-seki-j7'
      const acquisitionYear = sekI?.children.find(node => node.kind === 'structure' && node.id === acquisitionYearId)
      assert(acquisitionYear?.kind === 'structure', `${path}: HE acquisition starts in G8 year6/G9 year7`)
      const methodTopic = acquisitionYear.children.find(node => node.kind === 'structure'
        && node.id === (isG8 ? 'physics-he-g8-topic-6g-1' : 'physics-he-seki-methods'))
      assert(methodTopic?.kind === 'structure' && methodTopic.children.includes(branch),
        `${path}: exactly the existing method branch belongs to its source-bound introductory topic`)
      assert.deepEqual(branch.children, methods.map(goalId => ({kind: 'goalEntry', goalId, projectionRole: 'target'})), path)
    }
    const physicsRoot = structures(view.rootNodes).find(node => node.id === 'physics-root')!
    const sekII = physicsRoot.children.find(node => node.kind === 'structure' && node.id.startsWith('physics-sekii'))
    assert(sekII, `${path}: the dependent Sek-II section remains present`)
    assert(physicsRoot.children.includes(sekI) && physicsRoot.children.includes(sekII), `${path}: both stages must be direct subject children`)
    for (const goalId of methods) {
      assert.equal(referenceCount(view.rootNodes, goalId), 1, `${path}: exactly one method reference: ${goalId}`)
      assert.equal(flattenReferences(view.rootNodes).filter(node => node.goalId === goalId && node.projectionRole === 'prerequisiteOnly').length, 0, path)
      for (const consumer of astronomy) assertAcquiredBefore(view, goalId, consumer, path)
    }
  }
  assert.equal(preparationViews, 32)
  assert.equal(neutralViews.filter(({ view }) => methodsArePreparation(view)).length, 28,
    'retain the complete existing cross-stage method preparation floor')

  let repaired = 0
  const splitProfiles: string[] = []
  const upperPreparationViews = views.filter(({ view }) => view.scope.stage === 'SekII'
    && methodPreparationJurisdictions.has(String(view.scope.jurisdiction)))
  assert.equal(upperPreparationViews.length, 28)
  for (const { path, view } of upperPreparationViews) {
    const branch = structures(view.rootNodes).find(node => node.id === methodStructureId)
    assert.equal(view.scope.stage, 'SekII', path)
    repaired++
    if (view.scope.jurisdiction === 'DE-HE') {
      splitProfiles.push(String(view.scope.courseProfile))
      assert.equal(branch, undefined, `${path}: HE must not retain a second astronomy-only acquisition branch`)
      const rootStage = structures(view.rootNodes).find(node => node.id === 'physics-root')!
      const stage = structures(view.rootNodes).find(node => node.id === `physics-sekii-${String(view.scope.courseProfile).toLowerCase()}`)
      assert(stage && rootStage.children.includes(stage), `${path}: one explicit Sek-II stage must remain a direct subject child`)
      assert.equal(rootStage.label, 'Physik', `${path}: the subject root must not stand in for the shared stage identity`)
      const introductory = stage.children.find(node => node.kind === 'structure' && node.id === 'physics-e-phase')
      const q4 = stage.children.find(node => node.kind === 'structure' && node.id === 'physics-q4')
      assert(introductory?.kind === 'structure' && q4?.kind === 'structure', path)
      for (const id of methods) for (const consumer of astronomy) assertAcquiredBefore(view, id, consumer, path)
      const acquisition = introductory.children.find(node => node.kind === 'structure'
        && node.id === 'physics-methods-k3-upper-preparation-assessments')
      assert(acquisition?.kind === 'structure', `${path}: the existing E preparation and assessment unit must remain`)
      assert.deepEqual(flattenReferences(acquisition.children).flatMap(node => node.kind !== 'landscapeEntry' && methods.includes(node.goalId) ? [node] : [])
        .sort((left, right) => left.goalId.localeCompare(right.goalId)),
      methods.map(goalId => ({kind: 'goalEntry', goalId, projectionRole: 'target'}))
        .sort((left, right) => left.goalId.localeCompare(right.goalId)), `${path}: all four methods retain explicit target roles`)
      const earlyRoles = collectCompositionProjectionRoleGoalIds(introductory.children, byId)
      const q4Roles = collectCompositionProjectionRoleGoalIds(q4.children, byId)
      for (const goalId of methods) {
        assert.equal(referenceCount(view.rootNodes, goalId), 1, `${path}: exactly one method reference`)
        assert(earlyRoles.targetGoalIds.has(goalId), `${path}: missing E acquisition ${goalId}`)
        assert(!earlyRoles.prerequisiteOnlyGoalIds.has(goalId), `${path}: E acquisition must not become hidden support`)
        assert(!q4Roles.targetGoalIds.has(goalId), `${path}: Q4 must reuse the earlier method, not duplicate acquisition`)
      }
      for (const goalId of astronomy) assert(q4Roles.targetGoalIds.has(goalId), `${path}: astronomy must remain in Q4`)
      assert.equal(referenceCount(acquisition.children, orientation), 0, path)
      continue
    }
    const stage = structures(view.rootNodes).find(node => node.id.startsWith('physics-sekii'))
    assert(stage, `${path}: the explicit upper-stage acquisition remains`)
    const localRoles = collectCompositionProjectionRoleGoalIds(stage.children, byId)
    for (const goalId of [...methods, ...astronomy]) {
      assert(localRoles.targetGoalIds.has(goalId), `${path}: method and astronomy acquisition targets remain in the stage`)
      assert(!localRoles.prerequisiteOnlyGoalIds.has(goalId), `${path}: method target must not become hidden support`)
    }
    for (const goalId of methods) {
      assert.equal(referenceCount(view.rootNodes, goalId), 1, path)
      for (const consumer of astronomy) assertAcquiredBefore(view, goalId, consumer, path)
    }
  }
  assert.equal(repaired, 28)
  assert.deepEqual(splitProfiles.sort(), ['GK', 'LK'], 'Both HE courses retain the full split acquisition contract.')
})

test('RP retains its experiment bridge and complete Sek-I lens preparation alongside visible methods', () => {
  const rp = views.filter(({ view }) => view.scope.jurisdiction === 'DE-RP' && view.scope.stage === 'CrossStage')
  assert.equal(rp.length, 2)
  const withoutSekII = (nodes: CompositionViewNode[]): CompositionViewNode[] => nodes.flatMap(node => (
    node.kind !== 'structure' ? [node]
      : node.id.startsWith('physics-sekii') ? []
        : [{ ...node, children: withoutSekII(node.children) }]
  ))
  const experimentPlanning = 'd3c153b9-e09b-5668-8386-73105546a7c1'
  const retired = '44985d9f-7b49-52e4-86ec-eddc7b70429f'
  const acquisitions = new Map([
    ['a6f40821-695f-5c38-a572-3bc912e3d8e7', '6a4c6042-052b-502b-a39a-0ed8941247ac'],
    ['2437c7ee-3d59-544a-b9a0-8c5de0af54ad', '078ce4d2-3193-4cd0-ae59-4fb8ab16e9e5'],
    ['e5504ffe-b83f-50cd-87bb-2538ae0bfb75', models],
  ])
  assert.equal(byId.get(retired)?.extendedData?.applicabilityProjection, 'excluded')
  assert.deepEqual(byId.get(retired)?.examData?.coveredGoalIds, [])
  for (const { path, view } of rp) {
    const physicsRoot = structures(view.rootNodes).find(node => node.id === 'physics-root')!
    assert.deepEqual(physicsRoot.children.filter(node => node.kind === 'goalEntry' && node.goalId === experimentPlanning),
      [{ kind: 'goalEntry', goalId: experimentPlanning, projectionRole: 'prerequisiteOnly' }], path)
    const stageRoles = collectCompositionProjectionRoleGoalIds(withoutSekII(view.rootNodes), byId)
    assert(stageRoles.prerequisiteOnlyGoalIds.has(experimentPlanning), `${path}: the distinct experiment bridge must remain`)
    assert(!stageRoles.targetGoalIds.has(experimentPlanning), `${path}: bridge must not silently become a source target`)
    for (const id of methods) {
      assert(stageRoles.targetGoalIds.has(id), `${path}: lost learnable Sek-I method ${id}`)
      assert(!stageRoles.prerequisiteOnlyGoalIds.has(id), `${path}: method still hidden as support ${id}`)
    }
    assert(!stageRoles.targetGoalIds.has(retired), `${path}: withdrawn mixed task must not regain a live claim`)
    for (const [taskId, coveredGoalId] of acquisitions) {
      const task = byId.get(taskId)
      assert(stageRoles.targetGoalIds.has(taskId), `${path}: the actual acquisition task must remain visible: ${taskId}`)
      assert.equal(task?.examData?.reviewStatus, 'released', path)
      assert.deepEqual(task?.examData?.coveredGoalIds, [coveredGoalId], path)
      for (const id of task?.requires ?? []) {
        assert(stageRoles.targetGoalIds.has(id) || stageRoles.prerequisiteOnlyGoalIds.has(id),
          `${path}: current refraction/lens/model acquisition lost prerequisite ${id}`)
      }
    }
    const compiled = compileCompositionView(view, physics, universe, landscapesById)
    const countVisible = (nodes: typeof compiled.compiledRootNodes, id: string): number => nodes.reduce(
      (count, node) => count + Number(node.sourceGoalId === id) + countVisible(node.children, id), 0)
    for (const id of methods) assert.equal(countVisible(compiled.compiledRootNodes, id), 1, path)
    assert.deepEqual(compiled.findings.filter(finding => finding.severity === 'error'), [], path)
  }
})

test('Bavaria SekII supplies SI units with its existing source method without duplicating other methods', () => {
  const bavaria = views.filter(({ view }) => view.scope.jurisdiction === 'DE-BY' && view.scope.stage === 'SekII')
  assert.equal(bavaria.length, 2)
  for (const { path, view } of bavaria) {
    const firstYear = structures(view.rootNodes).find(node => node.id === 'physics-by-ph11-1')
    assert(firstYear, path)
    const roles = collectCompositionProjectionRoleGoalIds(firstYear.children, byId)
    for (const goalId of methods) assert(roles.targetGoalIds.has(goalId), `${path}: Ph11.1 retains actual method acquisition ${goalId}`)
    assert(byId.get(sources)?.requires.includes(units), `${path}: SI units remain a genuine source-method prerequisite`)
    for (const id of methods) for (const consumer of astronomy) assertAcquiredBefore(view, id, consumer, path)
    for (const goalId of methods) assert.equal(referenceCount(view.rootNodes, goalId), 1, path)
    assert.equal(structures(view.rootNodes).filter(node => node.id === methodStructureId).length, 0, path)
  }
})

test('method placement follows declared after reachability and rejects a removed order despite unchanged file position', () => {
  const source = views.find(({ view }) => view.scope.jurisdiction === 'DE-BY'
    && view.scope.stage === 'SekII' && view.scope.courseProfile === 'GK')!
  const reordered = structuredClone(source.view)
  const stage = structures(reordered.rootNodes).find(node => node.id.startsWith('physics-sekii'))!
  stage.children.reverse()
  assertAcquiredBefore(reordered, units, astronomy[0], source.path)
  stage.childOrder = { after: [] }
  assert.throws(() => assertAcquiredBefore(reordered, units, astronomy[0], source.path), /missing declared acquisition order/u)
})

test('all declared atlas views compile with the real cross-subject goal universe', () => {
  for (const { path, view } of views) {
    const result = compileCompositionView(view, physics, universe, landscapesById)
    assert.deepEqual(result.findings.filter(finding => finding.severity === 'error'), [], path)
  }
})

// A2 uses the same real projection chain as the actual learner unit map.
// The all-view measurement and its mutations test scope and timing contracts,
// while the independent K4 markers establish the task's subject adequacy.
test('reviewed arrow consumer successor retains the exact A2 cohort and rejects unreviewed changes', async () => {
  const {buildPhysicsArrowConsumerSuccessor, w1ArrowConsumerIds} = await import('./physics_arrow_route_validation')
  const ledger = readJson('curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json')
  const result = buildPhysicsArrowConsumerSuccessor(root, landscapes, ledger)
  assert.equal(result.predecessorConsumerGoalIds.length, 24)
  assert.equal(result.consumerGoalIds.length, 28)
  assert.deepEqual(result.addedGoalIds, w1ArrowConsumerIds)
  const missing = structuredClone(ledger)
  missing.decisions = missing.decisions.filter((row: any) => row.goalId !== w1ArrowConsumerIds[0])
  assert.throws(() => buildPhysicsArrowConsumerSuccessor(root, landscapes, missing), /Current arrow consumer set/)
  const expanded = structuredClone(ledger)
  expanded.decisions.push({goalId: 'unreviewed-arrow-consumer', directedQuantityArrows: {usage: 'required'}})
  assert.throws(() => buildPhysicsArrowConsumerSuccessor(root, landscapes, expanded), /Current arrow consumer set/)
  const duplicated = structuredClone(ledger)
  duplicated.decisions.push(structuredClone(duplicated.decisions.find((row: any) => row.goalId === w1ArrowConsumerIds[0])))
  assert.throws(() => buildPhysicsArrowConsumerSuccessor(root, landscapes, duplicated), /Duplicate reviewed arrow consumer/)
  const changedTask = structuredClone(landscapes)
  const changed = changedTask.flatMap(landscape => landscape.goals).find(goal => goal.id === w1ArrowConsumerIds[0]) as any
  changed.examData = {...changed.examData, solution: 'Unreviewed changed solution'}
  assert.throws(() => buildPhysicsArrowConsumerSuccessor(root, changedTask, ledger), /source fingerprint differs/)
})

test('directed quantity arrows have the reviewed roles, checks and native places in all 90 views', async () => {
  const {measurePhysicsArrowRoutes} = await import('./physics_arrow_route_validation')
  const result = measurePhysicsArrowRoutes(root)
  assert.deepEqual(result.counts, {...result.counts, views: 90, lowerLandTargetViews: 42,
    ownNationalLowerTargetViews: 3, preparationViews: 45, violations: 0})
  assert.deepEqual(result.violations, [])
  for (const state of ['DE-BY', 'DE-ST']) {
    const upper = result.views.filter(r => r.scope.jurisdiction === state && r.scope.stage === 'SekII')
    assert.equal(upper.length, 2)
    assert.ok(upper.every(r => r.consumers.every(c => c.calendar !== 'later-unit')))
  }
})

test('directed quantity arrow audit detects a broken actual prerequisite path', async () => {
  const {measurePhysicsArrowRoutes, arrowId} = await import('./physics_arrow_route_validation')
  const goal = 'd61ea362-f6c3-5eab-ac30-2d0e265ac0f6'
  const result = measurePhysicsArrowRoutes(root, {viewFiles: ['de-de-gym-seki-physics.view.json'],
    mutateCatalog: catalog => catalog.map(d => ({...d, goals: d.goals.map((g: any) => g.id === goal
      ? {...g, requires: g.requires.filter((id: string) => id !== arrowId)} : g)}))})
  assert.ok(result.violations.some(v => v.kind === 'broken-arrow-path' && 'goalId' in v && v.goalId === goal))
})

test('directed quantity arrow audit detects acquisition after an actual consumer', async () => {
  const {measurePhysicsArrowRoutes, arrowId} = await import('./physics_arrow_route_validation')
  const result = measurePhysicsArrowRoutes(root, {viewFiles: ['de-ni-seki.view.json'], mutateView: view => {
    let reference: any
    const visit = (nodes: any[]) => {
      for (let i = nodes.length - 1; i >= 0; i--) {
        const node = nodes[i]
        if (node.goalId === arrowId) reference = nodes.splice(i, 1)[0]
        else if (node.kind === 'structure') visit(node.children)
      }
    }
    visit(view.rootNodes)
    const lastYear = structures(view.rootNodes).find(n => n.id === 'physics-ni-unit-j9-10')
    assert.ok(reference && lastYear)
    lastYear.children.push(reference)
    return view
  }})
  assert.ok(result.violations.some(v => v.kind === 'late-arrow-place'))
})

test('directed quantity arrow own preparation never exposes K4', async () => {
  const {measurePhysicsArrowRoutes, k4Id} = await import('./physics_arrow_route_validation')
  const result = measurePhysicsArrowRoutes(root, {viewFiles: ['de-he-sekii-gk.view.json'], mutateView: view => {
    view.rootNodes.push({kind: 'goalEntry', goalId: k4Id})
    return view
  }})
  assert.ok(result.violations.some(v => v.kind === 'wrong-k4-exposure'))
})


test('K4 warning disposition is current, exact and rejects a same-key scope expansion', async () => {
  const {loadAndVerifyArrowWarningDisposition,validateArrowWarningDisposition} = await import('./physics_arrow_applicability_review')
  const input = loadAndVerifyArrowWarningDisposition(root)
  const expandedGoal = structuredClone(input.goal)
  expandedGoal.extendedData.applicabilityOverrides.jurisdiction.push('DE-HE')
  assert.throws(() => validateArrowWarningDisposition({...input, goal: expandedGoal}), /stale actual K4 goal/)
  const changedFinding = {...input.currentFinding, message: input.currentFinding.message + ' DE-HE'}
  assert.throws(() => validateArrowWarningDisposition({...input, currentFinding: changedFinding}), /warning message or exact scope changed/)
  const missingOffer = structuredClone(input.currentAudit)
  missingOffer.offeredViewIds.pop()
  assert.throws(() => validateArrowWarningDisposition({...input, currentAudit: missingOffer}), /Current K4 successor offer set/)
  const changedSuccessorWarning = structuredClone(input.currentAudit)
  changedSuccessorWarning.exactWarning.message += ' altered'
  assert.throws(() => validateArrowWarningDisposition({...input, currentAudit: changedSuccessorWarning}), /Current K4 diagnostic/)
})
