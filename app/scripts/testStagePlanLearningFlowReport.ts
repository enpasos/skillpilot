// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { diagnoseStagePlanLearningFlow } from '../src/utils/stagePlanReport'
import { PLAN_COMPOSITION_SCHEMA, STAGE_PLAN_SCHEMA, type StagePlan, type StagePlanGoal } from '../src/utils/stagePlan'

function fixture() {
  const goals = new Map<string, StagePlanGoal>([
    ['p', { id: 'p', type: 'atomic', requires: ['foreign:bridge'] }],
    ['bridge', { id: 'bridge', type: 'atomic', requires: ['q'] }],
    ...['q', 't', 'x', 'm', 'unused'].map(id => [id, { id, type: 'atomic', requires: [] }] as [string, StagePlanGoal]),
  ])
  goals.set('foreign:bridge', goals.get('bridge')!)
  const plan: StagePlan = {
    $schema: STAGE_PLAN_SCHEMA, planFormatVersion: '1.0', planId: 'declared-plan',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-HE', durationModel: 'G9' },
    rootUnit: { id: 'root', label: 'Plan', children: ['early', 'late'] },
    units: [
      { id: 'early', label: 'Not a stage heuristic', kind: 'stage', stage: 'SekI', parentUnitId: 'root', after: [] },
      { id: 'late', label: 'Another arbitrary label', kind: 'stage', stage: 'SekII', parentUnitId: 'root', after: ['early'] },
    ],
    subjectViews: ['math', 'physics'].flatMap(landscapeId => ['GK', 'LK'].map(courseProfile => ({ landscapeId, courseProfile, viewId: `${landscapeId}-${courseProfile}` }))),
  }
  const view = (landscapeId: string, courseProfile: string, early: string[], late: string[]) => ({
    $schema: PLAN_COMPOSITION_SCHEMA, viewFormatVersion: '1.1', viewId: `${landscapeId}-${courseProfile}`,
    landscapeId, language: 'de', scope: { ...plan.scope, courseProfile, stage: 'CrossStage' },
    planBinding: { planId: plan.planId }, rootNodes: [early, late].map((ids, index) => ({
      kind: 'structure', id: `structure-${index}`, label: `Arbitrary ${index}`, planUnitId: index ? 'late' : 'early',
      children: ids.map(goalId => ({ kind: 'goalEntry', goalId })),
    })),
  })
  const views = [view('physics', 'GK', ['p'], ['t']), view('physics', 'LK', ['x'], ['t']), view('math', 'GK', ['m'], []), view('math', 'LK', ['m'], ['q'])]
  return { plans: [plan], views, goals }
}
const input = fixture(), before = JSON.stringify([...input.goals])
const report = diagnoseStagePlanLearningFlow(input)
assert.equal(report.status, 'backflows-present')
assert.equal(report.scopes.length, 4, 'Independently selected subject profiles require all four combinations.')
const profile = (scope: typeof report.scopes[number], subject: string) => scope.subjectSelections.find(value => value.landscapeId === subject)!.courseProfile
const affected = report.scopes.filter(scope => scope.transitiveBackflows.length)
assert.equal(affected.length, 1)
assert.equal(profile(affected[0], 'math'), 'LK')
assert.equal(profile(affected[0], 'physics'), 'GK', 'Equal-profile-only checks would miss this real cross-subject backflow.')
assert.deepEqual(affected[0].directBackflows.map(item => item.witnessPath), [['bridge', 'q']])
assert.deepEqual(affected[0].transitiveBackflows.map(item => item.witnessPath), [['p', 'bridge', 'q']])
const bothGk = report.scopes.find(scope => scope.subjectSelections.every(item => item.courseProfile === 'GK'))!
assert.equal(bothGk.directBackflows.length, 0)
assert.deepEqual(bothGk.preparation.map(item => [item.goalId, item.planUnitId]), [['bridge', 'early'], ['q', 'early']])
assert.equal(bothGk.learningBasisCount, bothGk.targetCount + 2)
assert(!bothGk.preparation.some(item => item.goalId === 'unused'))
assert.equal(JSON.stringify([...input.goals]), before, 'Diagnosis never writes graph or learner state.')
const reversed = fixture()
reversed.plans[0].subjectViews.reverse(); reversed.views.reverse()
assert.deepEqual(diagnoseStagePlanLearningFlow(reversed), report, 'Inventory iteration order does not change diagnoses.')

const corrected = fixture()
corrected.goals.get('bridge')!.requires = []
assert.equal(diagnoseStagePlanLearningFlow(corrected).status, 'no-stage-backflows')
const missing = fixture()
missing.goals.get('unused')!.requires = ['absent']
assert.equal(diagnoseStagePlanLearningFlow(missing).status, 'invalid-input', 'Unknown references outside current views still invalidate the supplied graph.')
assert.equal(diagnoseStagePlanLearningFlow(missing).scopes.length, 0)
const cycle = fixture()
cycle.goals.get('q')!.requires = ['p']
assert.equal(diagnoseStagePlanLearningFlow(cycle).status, 'invalid-input')
const clustered = fixture()
clustered.goals.get('q')!.type = 'cluster'
assert.equal(diagnoseStagePlanLearningFlow(clustered).status, 'invalid-input')
assert.equal(diagnoseStagePlanLearningFlow({ plans: [], views: [], goals: new Map() }).status, 'invalid-input', 'Empty inventories cannot turn the diagnostic green.')
const wronglyQualified = fixture()
wronglyQualified.goals.get('p')!.requires = ['wrong:bridge']
assert.equal(diagnoseStagePlanLearningFlow(wronglyQualified).status, 'invalid-input')
const hiddenCycle = fixture()
hiddenCycle.goals.set('hidden1', { id: 'hidden1', type: 'cluster', contains: ['hidden2'] })
hiddenCycle.goals.set('hidden2', { id: 'hidden2', type: 'cluster', contains: ['hidden1'] })
assert.equal(diagnoseStagePlanLearningFlow(hiddenCycle).status, 'invalid-input')
const hiddenMissing = fixture()
hiddenMissing.goals.set('hidden', { id: 'hidden', type: 'cluster', contains: ['absent'] })
assert.equal(diagnoseStagePlanLearningFlow(hiddenMissing).status, 'invalid-input')
const invalidType = fixture()
invalidType.goals.get('unused')!.type = 'unknown'
assert.equal(diagnoseStagePlanLearningFlow(invalidType).status, 'invalid-input')
const invalidAtomic = fixture()
invalidAtomic.goals.get('unused')!.contains = ['m']
assert.equal(diagnoseStagePlanLearningFlow(invalidAtomic).status, 'invalid-input')
const emptyTargets = fixture()
emptyTargets.views.forEach(view => view.rootNodes.forEach(node => { node.children = [] }))
assert.equal(diagnoseStagePlanLearningFlow(emptyTargets).status, 'invalid-input')
emptyTargets.goals.clear()
assert.equal(diagnoseStagePlanLearningFlow(emptyTargets).status, 'invalid-input')
const ordered = fixture()
ordered.goals.set('other', { id: 'other', type: 'atomic', requires: ['q'] })
ordered.goals.get('p')!.requires = ['foreign:bridge', 'other']
const firstOrder = diagnoseStagePlanLearningFlow(ordered)
ordered.goals.get('p')!.requires = ['other', 'foreign:bridge']
assert.deepEqual(diagnoseStagePlanLearningFlow(ordered), firstOrder, 'Permutation of unordered prerequisite edges preserves preparation and backflow witnesses.')
console.log('Declared stage-plan learning-flow diagnosis passed: independent course profiles, direct/transitive witnesses, preparation closure, deterministic edge order and eleven invalid-input cases.')
