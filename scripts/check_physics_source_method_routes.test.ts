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

// The 15 November K3 acquisition repair makes the necessary AB1 methods explicit
// learning targets. This is reviewed preparation for the selected curriculum,
// not an assertion that each Land independently names the whole method goal.
// The 28 cross-stage views put them in Sek I; the 28 single-stage Sek-II views
// retain their narrow astronomy focus. Neither role presence nor compilation
// certifies mastery, task coverage, source completeness or a runtime frontier.
const methodPreparationJurisdictions = new Set([
  'DE-BB', 'DE-BE', 'DE-HB', 'DE-HE', 'DE-HH', 'DE-MV', 'DE-NI',
  'DE-NW', 'DE-RP', 'DE-SH', 'DE-SL', 'DE-SN', 'DE-ST', 'DE-TH',
])
const methodsArePreparation = (view: CompositionView): boolean => view.scope.stage === 'CrossStage'
  && methodPreparationJurisdictions.has(String(view.scope.jurisdiction))

test('every atlas view that teaches either astronomy goal teaches all current method prerequisites', () => {
  assert.equal(views.length, 64)
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
  assert.equal(astronomyViewCount, 60)
})

test('the four AB1 method goals retain their bounded qualitative sequence', () => {
  assert.deepEqual(byId.get(observation)?.requires, [orientation])
  assert.deepEqual(byId.get(units)?.requires, [orientation])
  assert.deepEqual(byId.get(models)?.requires, [observation])
  assert.deepEqual(byId.get(sources)?.requires, [models, units])
  for (const goalId of astronomy) assert(byId.get(goalId)?.requires.includes(sources))
})

test('28 cross-stage views teach the methods once in Sek I; 28 Sek-II views retain astronomy preparation', () => {
  let preparationViews = 0
  for (const { path, view } of views) {
    if (!methodsArePreparation(view)) continue
    preparationViews++
    assert.equal(structures(view.rootNodes).filter(node => node.id === methodStructureId).length, 0, path)
    const branches = structures(view.rootNodes).filter(node => node.id === 'physics-methods-k3-preparation')
    assert.equal(branches.length, 1, `${path}: exactly one acquisition branch`)
    const branch = branches[0]
    const sekI = structures(view.rootNodes).find(node => node.id === 'physics-seki')
    if (view.scope.jurisdiction === 'DE-HE') {
      const year7 = sekI?.children.find(node => node.kind === 'structure' && node.id === 'physics-he-seki-j7')
      assert(year7?.kind === 'structure', `${path}: HE G9 acquisition starts in year 7`)
      const methodTopic = year7.children.find(node => node.kind === 'structure' && node.id === 'physics-he-seki-methods')
      assert(methodTopic?.kind === 'structure' && methodTopic.children.includes(branch),
        `${path}: exactly the existing method branch belongs to the year-7 method topic`)
    } else {
      assert(sekI?.children.includes(branch), `${path}: preparation belongs to the existing Sek-I section`)
    }
    const physicsRoot = structures(view.rootNodes).find(node => node.id === 'physics-root')!
    const sekII = physicsRoot.children.find(node => node.kind === 'structure' && node.id.startsWith('physics-sekii'))
    assert(sekII, `${path}: the dependent Sek-II section remains present`)
    const sekIIndex = physicsRoot.children.indexOf(sekI!)
    const sekIIIndex = physicsRoot.children.indexOf(sekII)
    assert(sekIIndex >= 0 && sekIIIndex >= 0, `${path}: both stages must be direct subject children`)
    assert(sekIIndex < sekIIIndex,
      `${path}: method stage must precede the dependent astronomy stage`)
    assert.deepEqual(branch.children, methods.map(goalId => ({kind: 'goalEntry', goalId, projectionRole: 'target'})), path)
    for (const goalId of methods) {
      assert.equal(referenceCount(view.rootNodes, goalId), 1, `${path}: exactly one method reference: ${goalId}`)
      assert.equal(flattenReferences(view.rootNodes).filter(node => node.goalId === goalId && node.projectionRole === 'prerequisiteOnly').length, 0, path)
    }
  }
  assert.equal(preparationViews, 28)

  let repaired = 0
  for (const { path, view } of views) {
    const branch = structures(view.rootNodes).find(node => node.id === methodStructureId)
    if (!branch) continue
    assert.equal(view.scope.stage, 'SekII', path)
    repaired++
    const parent = structures(view.rootNodes).find(node => node.children.includes(branch))
    assert.equal(parent?.label, 'Astrophysik', path)
    assert.deepEqual(branch.children, methods.map(goalId => ({kind: 'goalEntry', goalId, projectionRole: 'target'})), path)
    for (const goalId of methods) assert.equal(referenceCount(view.rootNodes, goalId), 1, path)
    const localRoles = collectCompositionProjectionRoleGoalIds(parent!.children, byId)
    for (const goalId of [...methods, ...astronomy]) {
      assert(localRoles.targetGoalIds.has(goalId), `${path}: methods and astronomy must share their visible focus`)
    }
    assert.equal(referenceCount(branch.children, orientation), 0, path)
  }
  assert.equal(repaired, 28)
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

test('Bavaria SekII supplies SI units beside its existing source method without duplicating other methods', () => {
  const bavaria = views.filter(({ view }) => view.scope.jurisdiction === 'DE-BY' && view.scope.stage === 'SekII')
  assert.equal(bavaria.length, 2)
  for (const { path, view } of bavaria) {
    const firstYear = structures(view.rootNodes).find(node => node.id === 'physics-by-ph11-1')
    assert(firstYear, path)
    const ids = firstYear.children.map(node => node.goalId)
    assert.equal(ids.indexOf(units) + 1, ids.indexOf(sources), path)
    for (const goalId of methods) assert.equal(referenceCount(view.rootNodes, goalId), 1, path)
    assert.equal(structures(view.rootNodes).filter(node => node.id === methodStructureId).length, 0, path)
  }
})

test('all declared atlas views compile with the real cross-subject goal universe', () => {
  for (const { path, view } of views) {
    const result = compileCompositionView(view, physics, universe, landscapesById)
    assert.deepEqual(result.findings.filter(finding => finding.severity === 'error'), [], path)
  }
})
