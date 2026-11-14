// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { resolve } from 'node:path'
import { test } from 'node:test'
import type { LearningGoal } from '../src/landscapeTypes'
import { createRouteProfiles } from './generateCurriculumQualityStatus'
import { PHYSICS_QA_CANONICAL_PATH, PHYSICS_QA_LANDSCAPE_ID, PHYSICS_QA_STAGE_VIEWS } from './lib/physicsQaStageTargets'

function fixture(repositoryRoot: string, suffix = '') {
  const goal = (id: string, contains: string[] = []): LearningGoal => ({
    id: id + suffix, title: id, description: id, weight: 1, requires: [], contains: contains.map(id => id + suffix),
    dimensionTags: { phase: 'GLOBAL' }, tags: ['canonical'],
  })
  const target = goal('explicit-target'), support = goal('support'), inherited = goal('inherited-target')
  const files = new Map<string, unknown>([
    [resolve(repositoryRoot, PHYSICS_QA_CANONICAL_PATH), {
      landscapeId: PHYSICS_QA_LANDSCAPE_ID,
      goals: [target, support, inherited, goal('support-parent', ['explicit-target', 'support']), goal('target-parent', ['inherited-target'])],
    }],
    [resolve(repositoryRoot, 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'), {
      landscapeId: '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced', goals: [goal('foreign-support')],
    }],
  ])
  for (const source of PHYSICS_QA_STAGE_VIEWS) files.set(resolve(repositoryRoot, source.path), {
    viewId: source.viewId, landscapeId: PHYSICS_QA_LANDSCAPE_ID,
    scope: { schoolForm: 'Gymnasium', stage: source.stage, ...('courseProfile' in source ? { courseProfile: source.courseProfile } : {}) },
    rootNodes: [
      { kind: 'canonicalSubtree', goalId: 'support-parent' + suffix, projectionRole: 'prerequisiteOnly' },
      { kind: 'goalEntry', goalId: target.id },
      { kind: 'goalEntry', goalId: support.id, projectionRole: 'prerequisiteOnly' },
      { kind: 'canonicalSubtree', goalId: 'target-parent' + suffix },
      { kind: 'goalEntry', goalId: 'foreign-support' + suffix, projectionRole: 'prerequisiteOnly' },
    ],
  })
  const readText = (path: string) => {
    assert.ok(files.has(path), `missing fixture input: ${path}`)
    return JSON.stringify(files.get(path))
  }
  return { files, readText, target, support, inherited }
}

test('reviewed explicit stage targets override inherited support without promoting support or inherited targets', () => {
  const root = '/fixture/physics-stage-role'
  const input = fixture(root)
  for (const profile of createRouteProfiles(root, input).filter(profile => profile.profileId.startsWith('canonical-physics-'))) {
    assert.equal(profile.goalSelector(input.target), true)
    assert.equal(profile.clusterSelector(input.target), true)
    assert.equal(profile.goalSelector(input.support), false)
    assert.equal(profile.clusterSelector(input.support), false)
    assert.equal(profile.goalSelector(input.inherited), false)
    assert.equal(profile.inheritedStageTargetSelector!(input.inherited), true)
    for (const excluded of [
      { ...input.target, tags: ['Assessment'] }, { ...input.target, tags: ['Practice'] },
      { ...input.target, nodeKind: 'memory' }, { ...input.target, tags: ['Orientation'] },
    ]) assert.equal(profile.goalSelector(excluded), false)
  }
})

test('profile factories read their own repository and current reader on every invocation', () => {
  const a = fixture('/fixture/a', '-a'), b = fixture('/fixture/b', '-b')
  const profile = (root: string, input: ReturnType<typeof fixture>) => createRouteProfiles(root, input)
    .find(profile => profile.profileId === 'canonical-physics-sek2')!
  assert.equal(profile('/fixture/a', a).goalSelector(a.target), true)
  assert.equal(profile('/fixture/a', a).goalSelector(b.target), false)
  assert.equal(profile('/fixture/b', b).goalSelector(b.target), true)
  const view = b.files.get(resolve('/fixture/b', PHYSICS_QA_STAGE_VIEWS[1].path)) as { rootNodes: Array<{ goalId: string; projectionRole?: string }> }
  view.rootNodes.find(node => node.goalId === b.target.id)!.projectionRole = 'prerequisiteOnly'
  const lk = b.files.get(resolve('/fixture/b', PHYSICS_QA_STAGE_VIEWS[2].path)) as typeof view
  lk.rootNodes.find(node => node.goalId === b.target.id)!.projectionRole = 'prerequisiteOnly'
  assert.equal(profile('/fixture/b', b).goalSelector(b.target), false)
})

test('missing inputs, unknown identities, wrong owners, stages and roles fail closed before normalization', () => {
  const root = '/fixture/physics-stage-invalid'
  const viewPath = resolve(root, PHYSICS_QA_STAGE_VIEWS[0].path)
  type MutableView = {
    landscapeId: string; viewId: string; scope: Record<string, string>
    rootNodes: Array<{ kind: string; goalId: string; projectionRole?: string }>
  }
  type MutableLandscape = { landscapeId: string; goals: Array<{ contains: string[] }> }
  const view = (files: Map<string, unknown>) => files.get(viewPath) as MutableView
  const landscape = (files: Map<string, unknown>) => files.get(resolve(root, PHYSICS_QA_CANONICAL_PATH)) as MutableLandscape
  const mutations: Array<(files: Map<string, unknown>) => void> = [
    files => { files.delete(viewPath) },
    files => { view(files).landscapeId = 'other-owner' },
    files => { view(files).viewId = 'other-view' },
    files => { view(files).scope.stage = 'SekII' },
    files => { view(files).scope.jurisdiction = 'DE-BY' },
    files => { view(files).scope.courseProfile = 'GK' },
    files => { view(files).rootNodes[1].goalId = 'unknown' },
    files => { view(files).rootNodes[1].projectionRole = 'unreviewed-role' },
    files => { view(files).rootNodes[1].kind = 'unknown' },
    files => { view(files).rootNodes[4].projectionRole = 'target' },
    files => {
      view(files).rootNodes.pop()
      landscape(files).goals[4].contains.push('foreign-support')
    },
    files => { landscape(files).landscapeId = 'wrong-owner' },
    files => { landscape(files).goals[3].contains.push('missing-descendant') },
  ]
  for (const mutate of mutations) {
    const input = fixture(root)
    mutate(input.files)
    assert.throws(() => createRouteProfiles(root, input), /Physics QA stage targets:|missing fixture input/)
  }
})
