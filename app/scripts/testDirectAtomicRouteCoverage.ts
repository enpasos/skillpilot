// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import type { LearningGoal, SkillLandscape } from '../src/landscapeTypes'
import { createRouteProfiles, evaluateRouteProfile, collectRenderedAtomicGoalIdsFromCompositionView } from './generateCurriculumQualityStatus'
import { evaluateDirectAtomicRouteCoverage } from './lib/directAtomicRouteCoverage'
import { buildRouteCatalogContext, restrictForeignRouteSupport } from './lib/routeCatalogContext'
import { validateHardDirectAtomicRoutes, type HardRouteSemanticKind } from './lib/hardLearningRouteValidation'

const routeProfiles = createRouteProfiles()
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const status = JSON.parse(readFileSync(resolve(root, 'docs/qa-ci/status/curriculum-quality-status.json'), 'utf8'))
const goal = (id: string, requires: string[] = [], contains: string[] = []): LearningGoal => ({
  id, title: id, description: id, weight: 1, dimensionTags: {}, requires, contains,
})
const fixture = { landscapeId: 'L', goals: [goal('a'), goal('g', ['a']), goal('e', ['g']), goal('folder', [], ['e'])] } as SkillLandscape
const profile = { motivationAnchorGoalIds: ['a'], terminalAutonomyClusterIds: ['folder'], goalSelector: (g: LearningGoal) => g.id === 'g' }

test('a G8 upper-stage assessment is not a lower-stage endpoint, but a wrong early placement remains visible', () => {
  const landscape = JSON.parse(readFileSync(resolve(root, 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'), 'utf8')) as SkillLandscape
  const path = resolve(root, 'curricula/DE/Gymnasium/composition-views/mathematik/de-sh-gk-g8.view.json')
  const endpoint = '632a3837-7381-5701-9cfa-4ae15ccae8ba'
  assert(collectRenderedAtomicGoalIdsFromCompositionView(landscape, path, ['GK', 'G8'], false, 'SekII').has(endpoint))
  assert(!collectRenderedAtomicGoalIdsFromCompositionView(landscape, path, ['GK', 'G8'], false, 'SekI').has(endpoint))
  const view = JSON.parse(readFileSync(path, 'utf8'))
  let moved: unknown, lower: { children: unknown[] } | undefined
  const visit = (nodes: Array<{ kind: string; id?: string; goalId?: string; children?: unknown[] }>) => {
    for (let index = nodes.length - 1; index >= 0; index--) {
      const node = nodes[index]
      if (node.goalId === endpoint) { assert.equal(moved, undefined); moved = nodes.splice(index, 1)[0]; continue }
      if (node.id === 'sh-sek1-g8') lower = node as { children: unknown[] }
      if (node.children) visit(node.children as typeof nodes)
    }
  }
  visit(view.rootNodes)
  assert(moved && lower, 'The actual G8 view must contain the separately placed assessment and its lower-stage structure.')
  lower.children.push(moved)
  const directory = mkdtempSync(resolve(tmpdir(), 'skillpilot-wrong-stage-'))
  try {
    const wrong = resolve(directory, 'view.json'); writeFileSync(wrong, JSON.stringify(view))
    const lowerEndpoints = collectRenderedAtomicGoalIdsFromCompositionView(landscape, wrong, ['GK', 'G8'], false, 'SekI')
    assert(lowerEndpoints.has(endpoint), 'The corrected stage reader must expose a real wrong-stage placement to the gate.')
    const configured = routeProfiles.find(p => p.profileId === 'canonical-math-sek1')!
    const byId = new Map(landscape.goals.map(g => [g.id, g]))
    const expectedG8 = new Set(configured.terminalAutonomyClusterIdsByDurationModel!.G8!.flatMap(id => byId.get(id)!.contains))
    assert(!expectedG8.has(endpoint), 'The real early placement must still be an unexpected G8 lower-stage endpoint.')
  } finally { rmSync(directory, { recursive: true, force: true }) }
})

test('foreign route context resolves actual dependencies without selecting the other subject', () => {
  const source = { ...fixture, goals: fixture.goals.map(g => g.id === 'g' ? { ...g, requires: ['M:m'] } : g) }
  const foreign = { landscapeId: 'M', goals: [goal('m', ['ma']), goal('ma'), goal('unrelated')] } as SkillLandscape
  const configured = { ...profile, motivationAnchorGoalIds: ['ma'], profileId: 'foreign-fixture',
    landscapeId: 'L', label: 'foreign fixture', clusterSelector: () => true }
  const compilation = { reports: [] } as unknown as Parameters<typeof evaluateRouteProfile>[2]
  const before = JSON.stringify([source, foreign])
  const measured = evaluateRouteProfile(source, configured, compilation, [source, foreign])
  assert.deepEqual(evaluateDirectAtomicRouteCoverage(source, configured, [source, foreign]).details, [])
  assert.equal(measured.selectedAtomicGoals, 1)
  for (const id of ['CQR-101', 'CQR-102']) assert.equal(measured.rules.find(r => r.id === id)?.status, 'pass')
  assert.equal(JSON.stringify([source, foreign]), before)
  assert.throws(() => buildRouteCatalogContext(source, [source]), /Unresolved route reference/)
  assert.throws(() => buildRouteCatalogContext(source, [source, { ...foreign, goals: [goal('a')] }]), /Ambiguous route catalog goal/)
  assert.throws(() => buildRouteCatalogContext(fixture, [source, foreign]), /Stale route catalog root/)
  const wrongOwner = { ...source, goals: source.goals.map(g => g.id === 'g' ? { ...g, requires: ['L:m'] } : g) }
  assert.throws(() => buildRouteCatalogContext(wrongOwner, [wrongOwner, foreign]), /Unresolved route reference/)
})

test('foreign route visibility requires authored support and never fabricates a missing path', () => {
  const source = { ...fixture, goals: [goal('root', [], ['g', 'folder']), ...fixture.goals]
    .map(g => g.id === 'root' ? { ...g, tags: ['root'] } : g) }
  const foreign = { landscapeId: 'M', goals: [goal('m'), goal('ma'), goal('unrelated')] } as SkillLandscape
  const directory = mkdtempSync(resolve(tmpdir(), 'skillpilot-route-support-'))
  const file = resolve(directory, 'view.json')
  const view = { viewId: 'route-fixture', landscapeId: 'L', scope: { stage: 'SekI' }, rootNodes: [
    { kind: 'structure', id: 'sek1', label: 'Sekundarstufe I', children: [
      { kind: 'goalEntry', goalId: 'g' }, { kind: 'canonicalSubtree', goalId: 'folder' },
      { kind: 'goalEntry', goalId: 'm', projectionRole: 'prerequisiteOnly' },
      { kind: 'goalEntry', goalId: 'unrelated', projectionRole: 'prerequisiteOnly' },
    ] },
  ] }
  try {
    writeFileSync(file, JSON.stringify(view))
    const targets = collectRenderedAtomicGoalIdsFromCompositionView(source, file, [], false, 'SekI', [], [source, foreign])
    const visible = collectRenderedAtomicGoalIdsFromCompositionView(source, file, [], true, 'SekI', [], [source, foreign])
    assert.ok(targets.has('g') && !targets.has('m'))
    assert.ok(visible.has('m') && visible.has('unrelated') && !visible.has('ma'))
    const edges = new Map([['g', ['m']], ['m', ['ma']]])
    restrictForeignRouteSupport(visible, targets, new Set(source.goals.map(g => g.id)), edges, ['ma'])
    assert.ok(visible.has('m') && !visible.has('unrelated') && !visible.has('ma'))
    view.rootNodes[0].children = view.rootNodes[0].children.filter(node => node.goalId !== 'm')
    writeFileSync(file, JSON.stringify(view))
    const missing = collectRenderedAtomicGoalIdsFromCompositionView(source, file, [], true, 'SekI', [], [source, foreign])
    restrictForeignRouteSupport(missing, targets, new Set(source.goals.map(g => g.id)), edges, ['ma'])
    assert.ok(!missing.has('m') && !missing.has('ma'))
  } finally { rmSync(directory, { recursive: true }) }
})

test('direct route gate catches broken non-Mathematics routes in all shared profiles', () => {
  assert.equal(routeProfiles.length, 12)
  const catalog = status.curricula.map((row: { path: string }) => JSON.parse(readFileSync(resolve(root, row.path), 'utf8')) as SkillLandscape)
  for (const configured of routeProfiles) {
    const file = status.curricula.find((row: { landscapeId: string }) => row.landscapeId === configured.landscapeId)?.path
    assert.ok(file, `Missing current source for ${configured.profileId}`)
    const landscape = JSON.parse(readFileSync(resolve(root, file), 'utf8')) as SkillLandscape
    const current = evaluateDirectAtomicRouteCoverage(landscape, configured, catalog)
    assert.equal(current.details.length, 0, `${configured.profileId}: ${current.details.join('; ')}`)
    const selected = current.selectedGoals.find(g => !configured.motivationAnchorGoalIds.includes(g.id))
    assert.ok(selected, `${configured.profileId} has no ordinary goal to probe`)
    const broken = { ...landscape, goals: landscape.goals.map(g => g.id === selected.id ? { ...g, requires: [] } : g) }
    assert.ok(evaluateDirectAtomicRouteCoverage(broken, configured,
      catalog.map((entry: SkillLandscape) => entry.landscapeId === broken.landscapeId ? broken : entry))
      .missingDirectMotivation.some(g => g.id === selected.id), configured.profileId)
  }
})
test('direct route coverage preserves local qualified references and excludes cluster shortcuts', () => {
  assert.deepEqual(evaluateDirectAtomicRouteCoverage(fixture, profile).details, [])
  assert.deepEqual(evaluateDirectAtomicRouteCoverage({ ...fixture, goals: fixture.goals.map(g => g.id === 'g' ? { ...g, requires: ['L:a'] } : g) }, profile).details, [])
  assert.ok(evaluateDirectAtomicRouteCoverage({ ...fixture, goals: fixture.goals.map(g => g.id === 'g' ? { ...g, requires: ['foreign:a'] } : g) }, profile).details.length)
  const inherited = { ...fixture, goals: [...fixture.goals.map(g => g.id === 'g' ? { ...g, requires: ['bridge'] } : g), goal('bridge', ['a'], ['child']), goal('child')] }
  assert.ok(evaluateDirectAtomicRouteCoverage(inherited, profile).missingDirectMotivation.some(g => g.id === 'g'))
})
test('CQR-102 reachability does not imply the semantic GVR-012 gate', () => {
  const bad = { ...fixture, goals: fixture.goals.map(g => g.id === 'a' ? { ...g, requires: ['g'] } : g) }
  assert.deepEqual(evaluateDirectAtomicRouteCoverage(bad, profile).details, [])
  const findings = validateHardDirectAtomicRoutes(bad.goals, new Map<string, HardRouteSemanticKind>([['a', 'orientation'], ['g', 'curricularAtomic'], ['e', 'practiceAssessment']]), {
    motivationAnchorGoalIds: ['a'], terminalGoalClusterIds: ['folder'], goalSelector: profile.goalSelector, scopeLabel: 'fixture',
  })
  assert.ok(findings.some(f => f.message.includes('prerequisite-free')))
})

test('direct route configuration errors fail closed even when another endpoint covers the route', () => {
  for (const broken of [
    { ...profile, goalSelector: () => false },
    { ...profile, goalSelector: (g: LearningGoal) => g.id === 'folder' },
    { ...profile, motivationAnchorGoalIds: [] },
    { ...profile, motivationAnchorGoalIds: ['a', 'missing'] },
    { ...profile, motivationAnchorGoalIds: ['a', 'folder'] },
    { ...profile, motivationAnchorGoalIds: ['a', 'a'] },
    { ...profile, terminalAutonomyClusterIds: [] },
    { ...profile, terminalAutonomyClusterIds: ['folder', 'missing'] },
    { ...profile, terminalAutonomyClusterIds: ['folder', 'a'] },
    { ...profile, terminalAutonomyClusterIds: ['folder', 'folder'] },
  ]) {
    assert.ok(evaluateDirectAtomicRouteCoverage(fixture, broken).configurationIssues.length, JSON.stringify(broken))
  }
  const noTerminalChildren = { ...fixture, goals: [...fixture.goals, goal('empty-folder', [], ['nested']), goal('nested', [], ['nested-atom']), goal('nested-atom')] }
  assert.ok(evaluateDirectAtomicRouteCoverage(noTerminalChildren, { ...profile, terminalAutonomyClusterIds: ['folder', 'empty-folder'] }).configurationIssues.length)
  const duplicateEndpoint = { ...fixture, goals: [...fixture.goals, goal('other-folder', [], ['e'])] }
  assert.ok(evaluateDirectAtomicRouteCoverage(duplicateEndpoint, { ...profile, terminalAutonomyClusterIds: ['folder', 'other-folder'] }).configurationIssues.length)
})


test('CQR-102 status projection retains configuration failures without missing path counts', () => {
  const malformed = { ...profile, profileId: 'fixture', landscapeId: 'L', label: 'fixture',
    clusterSelector: () => true, terminalAutonomyClusterIds: ['folder', 'missing'] }
  const compilation = { reports: [] } as unknown as Parameters<typeof evaluateRouteProfile>[2]
  const scope = evaluateRouteProfile(fixture, malformed, compilation)
  const rule = scope.rules.find(rule => rule.id === 'CQR-102')!
  assert.equal(rule.status, 'warn')
  assert.equal(rule.metrics?.missingDirectMotivationPath, 0)
  assert.equal(rule.metrics?.missingDirectTerminalPath, 0)
  assert.ok(rule.details?.some(detail => detail.includes('Missing or non-cluster terminal configuration: missing')))
})
