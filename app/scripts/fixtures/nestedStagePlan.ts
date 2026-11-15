// SPDX-License-Identifier: Apache-2.0
/** Isolated integration fixture, never a claim of official HE curriculum placement. */
import { PLAN_COMPOSITION_SCHEMA, STAGE_PLAN_SCHEMA, type StagePlan, type StagePlanGoal, type StagePlanUnit } from '../../src/utils/stagePlan'
import type { CompositionView, CompositionViewNode } from '../../src/utils/authoring/compositionViewAuthoring'

export const NESTED_MATH = '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'
export const NESTED_PHYSICS = '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'
export function nestedStagePlanFixture() {
  const basis = { kind: 'reviewedStructure' as const, references: ['isolated-contract-fixture'], rationale: 'Test-only temporal slots; not an official source claim.' }
  const plan: StagePlan = { $schema: STAGE_PLAN_SCHEMA, planFormatVersion: '1.0', planId: 'nested-fixture',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-HE', durationModel: 'G9' },
    rootUnit: { id: 'root', label: 'Isolated plan fixture', children: ['lower', 'upper'] },
    units: [
      { id: 'lower', kind: 'stage', stage: 'SekI', label: 'Sekundarstufe I', parentUnitId: 'root', after: [], children: ['y5', 'y6'] },
      { id: 'upper', kind: 'stage', stage: 'SekII', label: 'Sekundarstufe II', parentUnitId: 'root', after: ['lower'], children: ['e', 'q1', 'q2', 'q3', 'q4'] },
      ...[5, 6].map((year, index): StagePlanUnit => ({ id: `y${year}`, kind: 'year', stage: 'SekI', year, label: `Jahrgangsstufe ${year}`,
        labelEn: `Year ${year}`, parentUnitId: 'lower', after: index ? ['y5'] : [], basis })),
      ...(['E', 'Q1', 'Q2', 'Q3', 'Q4'] as const).map((phase, index, all): StagePlanUnit => ({ id: phase.toLowerCase(), kind: 'phase', stage: 'SekII', phase,
        label: phase === 'E' ? 'Einführungsphase' : phase, labelEn: phase === 'E' ? 'Introductory phase' : phase,
        parentUnitId: 'upper', after: index ? [all[index - 1].toLowerCase()] : [], basis })),
    ], subjectViews: [NESTED_MATH, NESTED_PHYSICS].flatMap(landscapeId => ['GK', 'LK'].map(courseProfile => ({ landscapeId, courseProfile, viewId: `${landscapeId}-${courseProfile}` }))),
  }
  const own: Record<string, string> = { m5: 'y5', m6: 'y6', me: 'e', mq1: 'q1', mq2: 'q2', mq3: 'q3', mq4: 'q4', p6: 'y6', pe: 'e', pq1: 'q1' }
  const raw: StagePlanGoal[] = [
    { id: 'm5', type: 'atomic', title: 'Year five atom' }, { id: 'm6', type: 'atomic', title: 'Year six atom', requires: ['m5', 'bridge'] },
    { id: 'me', type: 'atomic', requires: ['m6'] }, { id: 'mq1', type: 'atomic', requires: ['me'] },
    { id: 'mq2', type: 'atomic', requires: ['mq1'] }, { id: 'mq3', type: 'atomic', requires: ['mq2'] }, { id: 'mq4', type: 'atomic', requires: ['mq3'] },
    { id: 'p6', type: 'atomic', requires: [`${NESTED_MATH}:m6`] }, { id: 'pe', type: 'atomic', requires: ['p6'] }, { id: 'pq1', type: 'atomic', requires: ['me', 'bridge'] },
    { id: 'bridge', type: 'atomic', requires: ['foundation'] }, { id: 'foundation', type: 'atomic' },
  ]
  const goals = new Map<string, StagePlanGoal>()
  for (const goal of raw) {
    const normalized = { ...goal, title: goal.title ?? goal.id }
    goals.set(goal.id, normalized)
    goals.set(`${goal.id.startsWith('p') ? NESTED_PHYSICS : NESTED_MATH}:${goal.id}`, normalized)
  }
  const views: CompositionView[] = plan.subjectViews.map(authority => {
    const ids = Object.keys(own).filter(id => authority.landscapeId === NESTED_MATH ? id.startsWith('m') : id.startsWith('p'))
    const unitNode = (unit: StagePlanUnit): CompositionViewNode => ({ kind: 'structure', id: `source-${authority.courseProfile}-${unit.id}`,
      label: `Arbitrary subject-local heading ${unit.id}`, planUnitId: unit.id,
      children: unit.children ? unit.children.map(id => unitNode(plan.units.find(candidate => candidate.id === id)!))
        : ids.filter(id => own[id] === unit.id).map(goalId => ({ kind: 'goalEntry', goalId,
          placementBasis: { kind: 'canonicalDefault', canonicalPhase: unit.kind === 'year' ? `J${unit.year}` : unit.phase } })),
    })
    return { $schema: PLAN_COMPOSITION_SCHEMA, viewFormatVersion: '1.1', viewId: authority.viewId, landscapeId: authority.landscapeId,
      language: 'de', scope: { ...plan.scope, stage: 'CrossStage', courseProfile: authority.courseProfile }, planBinding: { planId: plan.planId },
      rootNodes: plan.rootUnit.children.map(id => unitNode(plan.units.find(candidate => candidate.id === id)!)) }
  })
  const excerpt: CompositionView = { $schema: PLAN_COMPOSITION_SCHEMA, viewFormatVersion: '1.1', viewId: 'math-lower', landscapeId: NESTED_MATH, language: 'de',
    scope: { ...plan.scope, stage: 'SekI' }, planBinding: { planId: plan.planId, excerptOfViewIds: plan.subjectViews.filter(a => a.landscapeId === NESTED_MATH).map(a => a.viewId), unitIds: ['lower'] },
  } as CompositionView
  return { plan, views, excerpt, goals, own }
}
