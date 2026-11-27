// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { COMPOSITION_VIEW_13_SCHEMA } from '../src/utils/authoring/compositionViewAuthoring'
import type { ContextLandscape } from './lib/knowledgeContext'
import {
  buildSemiconductorLearningPathReport, compareSemiconductorLearningPathReports,
  type DiagnosticView,
} from './reportPhysicsSemiconductorLearningPath'

const catalog = (): ContextLandscape[] => [{ landscapeId: 'physics', goals: [
  { id: 'root', tags: ['root'], contains: ['base', 'quantum', 'combined', 'junction', 'exam'] },
  { id: 'base', title: 'Charges' },
  { id: 'quantum', title: 'Quantum model', requires: ['base'] },
  { id: 'combined', title: 'Bands and doping', requires: ['quantum'] },
  { id: 'junction', title: 'p-n junction', requires: ['combined'] },
  { id: 'exam', nodeKind: 'exam', requires: ['junction'], examData: { coveredGoalIds: ['junction', 'combined'] } },
] }]

const views = (): DiagnosticView[] => [{ path: 'physics.view.json', view: {
  viewId: 'physics-cross-stage', landscapeId: 'physics', scope: { schoolForm: 'Gymnasium', stage: 'CrossStage' },
  rootNodes: [
    { kind: 'structure', id: 'sek1', label: 'Sekundarstufe I', children: [{ kind: 'goalEntry', goalId: 'junction' }] },
    { kind: 'structure', id: 'sek2', label: 'Sekundarstufe II (GK)', children: [{ kind: 'canonicalSubtree', goalId: 'root' }] },
    { kind: 'goalEntry', goalId: 'combined', projectionRole: 'prerequisiteOnly' },
  ],
} }]

test('a split exposes removal of the advanced prerequisite, new target, and changed assessment declaration', () => {
  const before = buildSemiconductorLearningPathReport(catalog(), views(), ['junction', 'combined', 'exam'])
  const revised = catalog()
  revised[0].goals[0].contains!.push('doping')
  revised[0].goals.push({ id: 'doping', title: 'Doping in the charge model', requires: ['base'] })
  revised[0].goals.find(({ id }) => id === 'junction')!.requires = ['doping']
  revised[0].goals.find(({ id }) => id === 'exam')!.examData!.coveredGoalIds = ['junction', 'doping']
  const after = buildSemiconductorLearningPathReport(revised, views(), ['junction', 'combined', 'exam', 'doping'])
  const comparison = compareSemiconductorLearningPathReports(before, after)
  assert.deepEqual(comparison.addedGoalKeys, ['physics:doping'])
  const junction = comparison.changedGoals.find(({ key }) => key === 'physics:junction')!
  assert.deepEqual(junction.prerequisiteClosureCount, { before: 3, after: 2 })
  assert.deepEqual(junction.transitiveRequires.removed.map(({ id }) => id), ['combined', 'quantum'])
  assert.deepEqual(junction.transitiveRequires.added.map(({ id }) => id), ['doping'])
  assert.deepEqual(after.goals.find(({ id }) => id === 'combined')!.declaringAssessments, [])
  assert.deepEqual(after.goals.find(({ id }) => id === 'doping')!.declaringAssessments.map(({ id }) => id), ['exam'])
  assert.deepEqual(compareSemiconductorLearningPathReports(after, after).changedGoals, [])
})

test('authored stage occurrences remain distinct from the effective view role', () => {
  const report = buildSemiconductorLearningPathReport(catalog(), views(), ['combined', 'junction'])
  const combined = report.goals.find(({ id }) => id === 'combined')!.views[0]
  assert.equal(combined.effectiveRole, 'prerequisiteOnly')
  assert.deepEqual(combined.occurrences.map(({ stage, declaredRole }) => ({ stage, declaredRole })), [
    { stage: 'SekII', declaredRole: 'target' }, { stage: null, declaredRole: 'prerequisiteOnly' },
  ])
  assert.deepEqual(report.goals.find(({ id }) => id === 'junction')!.views[0].occurrences.map(({ stage }) => stage), ['SekI', 'SekII'])
})

test('unresolved references fail even outside the selected prerequisite path', () => {
  const invalid = catalog()
  invalid[0].goals.push({ id: 'unrelated', requires: ['missing'] })
  assert.throws(() => buildSemiconductorLearningPathReport(invalid, views(), ['base']), /Unknown reference missing/u)
  const invalidViews = views()
  invalidViews[0].view.rootNodes.push({ kind: 'goalEntry', goalId: 'missing' })
  assert.throws(() => buildSemiconductorLearningPathReport(catalog(), invalidViews, ['base']), /Unknown goal reference missing/u)
  const invalidCoverage = catalog()
  invalidCoverage[0].goals.find(({ id }) => id === 'exam')!.examData!.coveredGoalIds = ['missing']
  assert.throws(() => buildSemiconductorLearningPathReport(invalidCoverage, views(), ['base']), /Unknown goal reference missing/u)
})

test('a prerequisite cycle produces no apparently valid diagnostic', () => {
  const invalid = catalog()
  invalid[0].goals.find(({ id }) => id === 'base')!.requires = ['junction']
  assert.throws(() => buildSemiconductorLearningPathReport(invalid, views(), ['junction']), /requires cycle/u)
})

test('voluntary goal and assessment roles survive the qualified-key diagnostic without becoming targets', () => {
  const view = views()[0]
  Object.assign(view.view, { $schema: COMPOSITION_VIEW_13_SCHEMA, viewFormatVersion: '1.3' })
  view.view.rootNodes = [{ kind: 'structure', id: 'offers', label: 'Voluntary offers', children: [
    { kind: 'goalEntry', goalId: 'junction', projectionRole: 'voluntary' },
    { kind: 'goalEntry', goalId: 'exam', projectionRole: 'voluntary' },
  ] }]
  const report = buildSemiconductorLearningPathReport(catalog(), [view], ['junction', 'exam', 'combined'])
  for (const id of ['junction', 'exam']) {
    const row = report.goals.find(goal => goal.id === id)!.views[0]
    assert.equal(row.effectiveRole, 'voluntary')
    assert.deepEqual(row.occurrences.map(occurrence => occurrence.declaredRole), ['voluntary'])
  }
  assert.equal(report.goals.find(goal => goal.id === 'combined')!.views[0].effectiveRole, 'absent')
  view.view.viewFormatVersion = '1.2'
  delete view.view.$schema
  assert.throws(() => buildSemiconductorLearningPathReport(catalog(), [view], ['junction']), /requires.*1\.3/)
})
