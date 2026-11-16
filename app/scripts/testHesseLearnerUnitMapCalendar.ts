import assert from 'node:assert/strict'
import { prepareLandscapeEntries, type LandscapeEntry } from '../src/hooks/useLandscapes'
import type { LearningGoal, SkillLandscape } from '../src/landscapeTypes'
import type { CompositionView } from '../src/utils/authoring/compositionViewAuthoring'
import { applyCompositionViewProjection } from '../src/utils/compositionViewRuntime'
import { collapseLearnerSubjectRoots, normalizeLearnerProjectedEntries } from '../src/utils/learnerTreeProjection'
import { buildDirectChildrenMap } from '../src/utils/treeProjectionRuntime'
import { buildLearnerUnitMapProjection } from '../src/components/learningUnitMap/learnerUnitMapProjection'
import { deriveLearnerUnitMapPreview, MATHEMATICS_LANDSCAPE_ID as math, PHYSICS_LANDSCAPE_ID as physics,
  type LearnerStagePlanMapContext, type LearnerUnitMapViewInput } from '../src/components/learningUnitMap/learnerUnitMapPreview'
import { STAGE_PLAN_SCHEMA } from '../src/utils/stagePlan'

const goal = (id: string, requires: string[] = []): LearningGoal => ({
  id, title: id, description: id, contains: [], requires, tags: [], weight: 1, type: 'atomic',
  dimensionTags: { phase: 'GLOBAL', framework: 'test', demandLevel: 'AB1', processCompetencies: [], guidingIdeas: [] },
})
const section = (id: string, children: CompositionView['rootNodes']) => ({ kind: 'structure' as const,
  id, label: `A deliberately unrelated label: ${id}`, children })
const entry = (goalId: string) => ({ kind: 'goalEntry' as const, goalId })
const mathAtoms = [...[5, 6, 7, 8, 9, 10].map(year => goal(`m${year}`)),
  ...['E', 'Q2', 'Q3', 'abitur'].map(phase => goal(`m${phase}`))]
const physicsAtoms = [...[7, 8, 10].map(year => goal(`p${year}`)), goal('pE', ['mQ2']),
  ...['Q1', 'Q4', 'abitur'].map(phase => goal(`p${phase}`))]
const landscape = (landscapeId: string, atoms: LearningGoal[]): SkillLandscape => ({ landscapeId,
  title: landscapeId === math ? 'Mathematik' : 'Physik', description: 'HE compatibility calendar fixture', locale: 'de',
  goals: [{ ...goal(`${landscapeId}-root`), type: 'cluster', tags: ['root'], contains: atoms.map(atom => atom.id) }, ...atoms],
})
const canonical = prepareLandscapeEntries([landscape(math, mathAtoms), landscape(physics, physicsAtoms)])
const canonicalSnapshot = JSON.stringify(canonical)

const views = (duration?: 'G8' | 'G9', merged = false): CompositionView[] => {
  const suffix = duration ? `-${duration.toLowerCase()}` : ''
  const mathGk = `de-he-gym-math-gk${suffix}`, mathLk = `de-he-gym-math-lk${suffix}`
  return [{
    viewId: merged ? `merged:${mathLk}+${mathGk}` : mathGk, landscapeId: math,
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-HE', stage: 'CrossStage', durationModel: duration },
    rootNodes: [section(`sek1${suffix}`, (duration === 'G8' ? [5, 6, 7, 8, 9] : [5, 6, 7, 8, 9, 10])
      .map(year => section(`j${year}${suffix}`, [entry(`m${year}`)]))),
    section(merged ? 'sek2-gk-lk' : 'sek2-gk', [section('e-phase', [entry('mE')]), section('q2', [entry('mQ2')]),
      section('q3', [entry('mQ3')]), section('abitur', [entry('mabitur')])])],
  }, {
    viewId: merged ? 'merged:de-he-gym-physics-lk+de-he-gym-physics-gk' : 'de-he-gym-physics-gk', landscapeId: physics,
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-HE', stage: 'CrossStage' },
    rootNodes: [section('physics-seki', [7, 8, 10].map(year => section(`physics-he-seki-j${year}`, [entry(`p${year}`)]))),
      section(merged ? 'physics-sekii-gk-lk' : 'physics-sekii-gk', [section('physics-e-phase', [entry('pE')]),
        section('physics-q1', [entry('pQ1')]), section('physics-q4', [entry('pQ4')]), section('physics-he-abitur', [entry('pabitur')])])],
  }]
}
const input = (selected: CompositionView[]): LearnerUnitMapViewInput => {
  const projected = normalizeLearnerProjectedEntries(selected.reduce<LandscapeEntry[]>((entries, view) =>
    applyCompositionViewProjection(entries, view), canonical))
  const goalIndexAll = new Map(projected.flatMap(landscape => landscape.goals).map(goal => [goal.id, goal]))
  const { childrenByParent: visibleChildrenByParent } = collapseLearnerSubjectRoots(goalIndexAll, buildDirectChildrenMap(goalIndexAll))
  const rootGoals = [...goalIndexAll.values()].filter(goal => goal.tags?.includes('root'))
  const visibleGoalIds = new Set<string>()
  const visit = (id: string) => {
    if (visibleGoalIds.has(id)) return
    visibleGoalIds.add(id)
    for (const child of visibleChildrenByParent.get(id) ?? []) visit(child)
  }
  rootGoals.forEach(goal => visit(goal.id))
  return { rootGoals, goalIndexAll, visibleChildrenByParent, visibleGoalIds,
    canonicalGoalIndexAll: new Map(canonical.flatMap(landscape => landscape.goals).map(goal => [goal.id, goal])) }
}
const sectionGoal = (value: LearnerUnitMapViewInput, nodeId: string, landscapeId: string) => [...value.goalIndexAll.values()]
  .find(goal => goal.landscapeId === landscapeId && goal.extendedData?.compositionNodeId === nodeId)!
const key = (value: LearnerUnitMapViewInput, nodeId: string, landscapeId: string) =>
  deriveLearnerUnitMapPreview(value, 2).units.get(sectionGoal(value, nodeId, landscapeId).id)!.key

for (const duration of ['G8', 'G9'] as const) for (const merged of [false, true]) {
  const value = input(views(duration, merged)), snapshot = JSON.stringify([...value.goalIndexAll])
  const preview = deriveLearnerUnitMapPreview(value, 2)
  const prefix = `he-compat:${duration}`
  for (const year of [7, 8, ...(duration === 'G9' ? [10] : [])]) {
    assert.equal(key(value, `j${year}-${duration.toLowerCase()}`, math), key(value, `physics-he-seki-j${year}`, physics))
  }
  assert.equal(key(value, 'e-phase', math), key(value, 'physics-e-phase', physics))
  assert.equal(key(value, 'abitur', math), key(value, 'physics-he-abitur', physics))
  const expected = [[5, 6, 7, 8, 9, 10].map(year => `${prefix}:year:${year}`),
    ['E', 'Q1', 'Q2', 'Q3', 'Q4', 'abitur'].map(phase => `${prefix}:phase:${phase}`)]
  for (const calendar of expected) for (let index = 1; index < calendar.length; index++) {
    assert(preview.after.some(order => order.unit === calendar[index] && order.after === calendar[index - 1]),
      `${duration}: the union of partial subject sibling lists must retain every visible calendar step`)
  }
  assert(!preview.after.some(order => order.unit === `${prefix}:year:10` && order.after === `${prefix}:year:8`),
    'The Physics subset 7/8/10 must not shortcut the visible Mathematics year 9.')
  assert(!preview.after.some(order => order.unit === `${prefix}:phase:Q2` && order.after === `${prefix}:phase:E`),
    'The Mathematics subset E/Q2 must not shortcut the visible Physics Q1.')
  const fixture = buildLearnerUnitMapProjection({ ...value, units: preview.units, after: preview.after })
  const year7 = fixture.unitEntryIds[`${prefix}:year:7`]
  assert.deepEqual(fixture.entries[year7].subjects, [math, physics])
  const e = fixture.unitEntryIds[`${prefix}:phase:E`], q2 = fixture.unitEntryIds[`${prefix}:phase:Q2`]
  assert((fixture.scopeRelations?.[fixture.unitEntryIds.sek2] ?? []).some(relation =>
    relation.source === q2 && relation.target === e && relation.backward
    && relation.provenance.some(cause => cause.dependentGoalId === 'pE' && cause.sourceGoalIds.includes('mQ2'))),
  'The genuine Physics-E need for Mathematics-Q2 stays a visible backward requirement after identity merging.')
  assert.deepEqual(fixture.findings.filter(finding => ['contradictoryAfter', 'afterNotSiblings', 'unitInTwoPlaces', 'nestedUnitKey'].includes(finding.kind)), [])
  assert.equal(JSON.stringify([...value.goalIndexAll]), snapshot, 'Compatibility identity never mutates goals or requires.')
  assert(![...preview.units.values()].some(unit => unit.key.startsWith('plan:')), 'Compatibility is not an activated v1.3 plan.')
  assert([...value.goalIndexAll.values()].every(goal => goal.extendedData?.stagePlanProjection === undefined))
  assert.equal(deriveLearnerUnitMapPreview({ ...value, language: 'en' }, 2).units.get(sectionGoal(value, 'physics-e-phase', physics).id)?.label,
    'Introductory phase')
}

const g8 = input(views('G8')), g9 = input(views('G9'))
assert.notEqual(key(g8, 'physics-e-phase', physics), key(g9, 'physics-e-phase', physics), 'G8/G9 display contexts have different keys.')
const neutral = input(views())
assert(key(neutral, 'physics-e-phase', physics).startsWith('he-compat:duration-neutral:'), 'Neutral Math views must not imply G9.')

for (const [mathId, physicsId] of [['de-by-gym-math-gk', 'de-by-gym-physics-gk'],
  ['de-de-gym-math-gk', 'de-de-gym-physics-gk'], ['unknown-he-math', 'unknown-he-physics']]) {
  const selected = views('G9')
  selected[0].viewId = mathId
  selected[1].viewId = physicsId
  const value = input(selected)
  assert([...deriveLearnerUnitMapPreview(value, 2).units.values()].every(unit => !unit.key.startsWith('he-compat:')))
}
const unknownNodes = views('G9')
const mathYear = unknownNodes[0].rootNodes[0]
assert(mathYear.kind === 'structure')
const first = mathYear.children[0]
assert(first.kind === 'structure')
first.id = 'unknown-j5'
first.label = 'Jahrgangsstufe 5'
const unknownValue = input(unknownNodes)
assert(!key(unknownValue, 'unknown-j5', math).startsWith('he-compat:'), 'A familiar label cannot grant a compatibility identity.')
const unsupportedG8Year = views('G8')
const lowerG8 = unsupportedG8Year[0].rootNodes[0]
assert(lowerG8.kind === 'structure' && lowerG8.children[0].kind === 'structure')
lowerG8.children[0].id = 'j10-g8'
const unsupportedYearInput = input(unsupportedG8Year)
assert(!key(unsupportedYearInput, 'j10-g8', math).startsWith('he-compat:'), 'G8 Mathematics has no reviewed year-10 identity.')
const physicsOnly = input([views('G9')[1]])
assert([...deriveLearnerUnitMapPreview(physicsOnly, 2).units.values()].every(unit => !unit.key.startsWith('he-compat:')),
  'Neutral Physics alone supplies no Mathematics duration context and keeps its existing identities.')

const mixed = input(views('G9'))
const g8Section = structuredClone(sectionGoal(g8, 'j7-g8', math))
const mixedGoals = new Map(mixed.goalIndexAll)
mixedGoals.set(g8Section.id, g8Section)
const mixedInput = { ...mixed, goalIndexAll: mixedGoals, visibleGoalIds: new Set([...mixed.visibleGoalIds, g8Section.id]) }
assert([...deriveLearnerUnitMapPreview(mixedInput, 2).units.values()].every(unit => !unit.key.startsWith('he-compat:')),
  'Contradictory G8 and G9 contexts fall back instead of selecting the first or most frequent duration.')

// A supplied authority is a test fixture only, not a claim that HE has an
// activated v1.3 plan. Indexed bindings must win over compatibility aliases.
const authorityInput = input(views('G9'))
const boundViewId = views('G9')[0].viewId
const stagePlanContext: LearnerStagePlanMapContext = {
  plan: { $schema: STAGE_PLAN_SCHEMA, planFormatVersion: '1.0', planId: 'fixture-he-authority',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-HE', durationModel: 'G9' },
    rootUnit: { id: 'root', label: 'Fixture root', children: ['lower', 'upper'] },
    units: [{ id: 'lower', label: 'Fixture lower', kind: 'stage', stage: 'SekI', parentUnitId: 'root', after: [], children: ['year7'] },
      { id: 'upper', label: 'Fixture upper', kind: 'stage', stage: 'SekII', parentUnitId: 'root', after: ['lower'] },
      { id: 'year7', label: 'Fixture year 7', kind: 'year', stage: 'SekI', year: 7, parentUnitId: 'lower', after: [] }],
    subjectViews: [{ landscapeId: math, courseProfile: 'GK', viewId: boundViewId }] },
  views: [{ viewId: boundViewId, planIds: ['fixture-he-authority'], structureBindings: [
    { structureId: 'sek1-g9', planUnitId: 'lower', stage: 'SekI', order: 0, after: [] },
    { structureId: 'sek2-gk', planUnitId: 'upper', stage: 'SekII', order: 1, after: ['lower'] },
    { structureId: 'j7-g9', planUnitId: 'year7', stage: 'SekI', order: 0, after: [] },
  ] }],
}
const authorityPreview = deriveLearnerUnitMapPreview({ ...authorityInput, stagePlanContext }, 2)
assert.equal(authorityPreview.units.get(sectionGoal(authorityInput, 'j7-g9', math).id)?.key, 'plan:fixture-he-authority:year7')
assert.equal(authorityPreview.units.get(sectionGoal(authorityInput, 'physics-he-seki-j7', physics).id)?.key, 'he-compat:G9:year:7')
assert(!authorityPreview.units.has(sectionGoal(authorityInput, 'j5-g9', math).id), 'Bound views expose only their indexed sections as units.')
assert([...authorityInput.goalIndexAll.values()].every(goal => goal.extendedData?.stagePlanProjection === undefined),
  'Compatibility and fixture evaluation do not manufacture projection metadata or pins.')
assert.equal(JSON.stringify(canonical), canonicalSnapshot)
console.log('HE compatibility calendar passed: explicit identities, merged courses, duration isolation, partial sibling unions, visible backflow and unknown-context isolation.')
