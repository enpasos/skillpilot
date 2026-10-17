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

test('every atlas view that teaches either astronomy goal also teaches its complete method prerequisites', () => {
  assert.equal(views.length, 64)
  let astronomyViewCount = 0
  for (const { path, view } of views) {
    const roles = collectCompositionProjectionRoleGoalIds(view.rootNodes, byId)
    if (!astronomy.some(goalId => roles.targetGoalIds.has(goalId))) continue
    astronomyViewCount++
    for (const goalId of [...methods, orientation]) {
      assert(roles.targetGoalIds.has(goalId), `${path}: prerequisite must be learnable: ${goalId}`)
      assert(!roles.prerequisiteOnlyGoalIds.has(goalId), `${path}: hidden prerequisite: ${goalId}`)
    }
    for (const goalId of methods) {
      for (const requiredId of byId.get(goalId)?.requires ?? []) {
        assert(roles.targetGoalIds.has(requiredId), `${path}: omitted method dependency: ${goalId} -> ${requiredId}`)
      }
    }
  }
  assert.equal(astronomyViewCount, 60)
})

test('the four method goals form a bounded sequence after the existing orientation', () => {
  assert.deepEqual(byId.get(observation)?.requires, [orientation])
  assert.deepEqual(byId.get(units)?.requires, [orientation])
  assert.deepEqual(byId.get(models)?.requires, [observation])
  assert.deepEqual(byId.get(sources)?.requires, [models, units])
  for (const goalId of astronomy) assert(byId.get(goalId)?.requires.includes(sources))
})

test('the 56 repaired astronomy branches own exactly one visible method entry per competence', () => {
  let repaired = 0
  for (const { path, view } of views) {
    const branch = structures(view.rootNodes).find(node => node.id === methodStructureId)
    if (!branch) continue
    repaired++
    const parent = structures(view.rootNodes).find(node => node.children.includes(branch))
    assert.equal(parent?.label, 'Astrophysik', path)
    assert.deepEqual(branch.children.map(node => node.goalId), methods, path)
    for (const node of branch.children) {
      assert.equal(node.kind, 'goalEntry', path)
      assert.equal(node.projectionRole, 'target', path)
      // RP CrossStage retains two original hidden supports for its independent
      // Sek-I routes. Each still has only one visible entry, in SekII astronomy.
      const retainedRpStageSupport = view.scope.jurisdiction === 'DE-RP'
        && view.scope.stage === 'CrossStage'
        && [observation, models].includes(String(node.goalId))
      assert.equal(referenceCount(view.rootNodes, String(node.goalId)), retainedRpStageSupport ? 2 : 1,
        `${path}: unexpected method reference count`)
    }
    const localRoles = collectCompositionProjectionRoleGoalIds(parent!.children, byId)
    for (const goalId of [...methods, ...astronomy]) {
      assert(localRoles.targetGoalIds.has(goalId), `${path}: method and astronomy target must share their visible focus`)
    }
    // Orientation already belongs to the subject entry. It must not be copied
    // into each narrow focus; this route starts after that regular orientation.
    assert.equal(referenceCount(branch.children, orientation), 0, path)
  }
  assert.equal(repaired, 56)
})

test('RP preserves original Sek-I support while teaching the methods once in its Sek-II astronomy branch', () => {
  const rp = views.filter(({ view }) => view.scope.jurisdiction === 'DE-RP' && view.scope.stage === 'CrossStage')
  assert.equal(rp.length, 2)
  const withoutSekII = (nodes: CompositionViewNode[]): CompositionViewNode[] => nodes.flatMap(node => (
    node.kind !== 'structure' ? [node]
      : /^Sekundarstufe II(?:$|[\s(:\-–])/u.test(node.label) ? []
        : [{ ...node, children: withoutSekII(node.children) }]
  ))
  const terminal = '44985d9f-7b49-52e4-86ec-eddc7b70429f'
  for (const { path, view } of rp) {
    const root = structures(view.rootNodes).find(node => node.id === 'physics-root')!
    const support = structures(view.rootNodes).find(node => node.id === 'physics-seki-route-prerequisites')!
    assert.deepEqual(root.children[1], { kind: 'goalEntry', goalId: observation, projectionRole: 'prerequisiteOnly' }, path)
    assert.deepEqual(support.children[37], { kind: 'goalEntry', goalId: models, projectionRole: 'prerequisiteOnly' }, path)
    const stageRoles = collectCompositionProjectionRoleGoalIds(withoutSekII(view.rootNodes), byId)
    for (const id of [observation, models]) {
      assert(stageRoles.prerequisiteOnlyGoalIds.has(id), `${path}: lost Sek-I support ${id}`)
      assert(!stageRoles.targetGoalIds.has(id), `${path}: unintended Sek-I method target ${id}`)
    }
    assert(stageRoles.targetGoalIds.has(terminal), path)
    for (const id of byId.get(terminal)?.requires ?? []) {
      assert(stageRoles.targetGoalIds.has(id) || stageRoles.prerequisiteOnlyGoalIds.has(id),
        `${path}: existing refraction/lens assessment lost prerequisite ${id}`)
    }
    const compiled = compileCompositionView(view, physics, universe, landscapesById)
    const countVisible = (nodes: typeof compiled.compiledRootNodes, id: string): number => nodes.reduce(
      (count, node) => count + Number(node.sourceGoalId === id) + countVisible(node.children, id), 0)
    for (const id of [observation, models]) assert.equal(countVisible(compiled.compiledRootNodes, id), 1, path)
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
