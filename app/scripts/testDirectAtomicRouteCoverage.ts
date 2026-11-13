// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import type { LearningGoal, SkillLandscape } from '../src/landscapeTypes'
import { createRouteProfiles, evaluateRouteProfile } from './generateCurriculumQualityStatus'
import { evaluateDirectAtomicRouteCoverage } from './lib/directAtomicRouteCoverage'
import { validateHardDirectAtomicRoutes, type HardRouteSemanticKind } from './lib/hardLearningRouteValidation'

const routeProfiles = createRouteProfiles()
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const status = JSON.parse(readFileSync(resolve(root, 'docs/qa-ci/status/curriculum-quality-status.json'), 'utf8'))
const goal = (id: string, requires: string[] = [], contains: string[] = []): LearningGoal => ({
  id, title: id, description: id, weight: 1, dimensionTags: {}, requires, contains,
})
const fixture = { landscapeId: 'L', goals: [goal('a'), goal('g', ['a']), goal('e', ['g']), goal('folder', [], ['e'])] } as SkillLandscape
const profile = { motivationAnchorGoalIds: ['a'], terminalAutonomyClusterIds: ['folder'], goalSelector: (g: LearningGoal) => g.id === 'g' }

test('direct route gate catches broken non-Mathematics routes in all shared profiles', () => {
  assert.equal(routeProfiles.length, 12)
  for (const configured of routeProfiles) {
    const file = status.curricula.find((row: { landscapeId: string }) => row.landscapeId === configured.landscapeId)?.path
    assert.ok(file, `Missing current source for ${configured.profileId}`)
    const landscape = JSON.parse(readFileSync(resolve(root, file), 'utf8')) as SkillLandscape
    const current = evaluateDirectAtomicRouteCoverage(landscape, configured)
    assert.equal(current.details.length, 0, `${configured.profileId}: ${current.details.join('; ')}`)
    const selected = current.selectedGoals.find(g => !configured.motivationAnchorGoalIds.includes(g.id))
    assert.ok(selected, `${configured.profileId} has no ordinary goal to probe`)
    const broken = { ...landscape, goals: landscape.goals.map(g => g.id === selected.id ? { ...g, requires: [] } : g) }
    assert.ok(evaluateDirectAtomicRouteCoverage(broken, configured).missingDirectMotivation.some(g => g.id === selected.id), configured.profileId)
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
