import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { prepareLandscapeEntries, type LandscapeEntry } from '../src/hooks/useLandscapes'
import type { LearningGoal, SkillLandscape } from '../src/landscapeTypes'
import type { CompositionView } from '../src/utils/authoring/compositionViewAuthoring'
import { applyCompositionViewProjection } from '../src/utils/compositionViewRuntime'
import { collapseLearnerSubjectRoots, normalizeLearnerProjectedEntries } from '../src/utils/learnerTreeProjection'
import { buildDirectChildrenMap } from '../src/utils/treeProjectionRuntime'
import { buildLearnerUnitMapProjection, filterLearnerUnitMapToSubjects } from '../src/components/learningUnitMap/learnerUnitMapProjection'
import { deriveLearnerUnitMapPreview, MATHEMATICS_LANDSCAPE_ID as math, PHYSICS_LANDSCAPE_ID as physics,
  PROVISIONAL_STAGE_PLAN_UNITS } from '../src/components/learningUnitMap/learnerUnitMapPreview'

const chemistry = 'fixture-preview-chemistry'
const goal = (id: string, contains: string[] = [], requires: string[] = []): LearningGoal => ({
  id, title: id, description: `Die lernende Person kann ${id}.`, contains, requires, tags: [], weight: 1, core: true,
  dimensionTags: { phase: 'GLOBAL', demandLevel: 'AB2', framework: 'canonical-gymnasium', processCompetencies: [], guidingIdeas: [] },
})
const landscape = (landscapeId: string, subject: string, goals: LearningGoal[], extra: Partial<SkillLandscape> = {}): SkillLandscape => ({
  landscapeId, title: subject, description: 'Vorschau-Testdaten', subject, locale: 'de-DE', goals, ...extra })
const landscapes: SkillLandscape[] = [
  landscape(math, 'Mathematik', [
    { ...goal('m-root', ['m5a', 'm5b', 'm6a', 'm-q1-cluster', 'm-free']), tags: ['root'] },
    goal('m5a'), goal('m5b', [], ['m5a']), goal('m6a', [], ['m5b']), goal('m-q1-cluster', ['mq1a', 'mq1b']),
    goal('mq1a', [], ['m6a']), goal('mq1b', [], ['mq1a', 'pq1']), goal('m-free'),
  ], { programUnits: [{ id: 'lu-five', kind: 'learningUnit', label: 'Zahlen der Klasse 5', labelEn: 'Numbers of year 5' }],
    goalPlacements: [{ goalId: 'm5a', unitId: 'lu-five', relation: 'own' }, { goalId: 'm5b', unitId: 'lu-five', relation: 'own' }] }),
  landscape(physics, 'Physik', [
    { ...goal('p-root', ['pa1', 'pq1']), tags: ['root'] }, goal('pa1', [], ['m6a']), goal('pq1', [], ['pa1']),
  ]),
  landscape(chemistry, 'Chemie', [{ ...goal('c-root', ['c1']), tags: ['root'] }, goal('c1')]),
]
const view = (landscapeId: string, rootNodes: CompositionView['rootNodes']): CompositionView => ({ viewId: `preview-${landscapeId}`, landscapeId,
  scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-HE', stage: 'CrossStage' }, rootNodes })
const structure = (id: string, label: string, children: CompositionView['rootNodes']) => ({ kind: 'structure' as const, id, label, children })
const entry = (goalId: string) => ({ kind: 'goalEntry' as const, goalId })
const views = [
  view(math, [
    structure('sek1', 'Sekundarstufe I', [structure('m-j5', 'Jahrgangsstufe 5', [entry('m5a'), entry('m5b')]), structure('m-j6', 'Jahrgangsstufe 6', [entry('m6a')])]),
    structure('sek2-gk', 'Sekundarstufe II (GK)', [structure('m-q1', 'Q1', [{ kind: 'canonicalSubtree', goalId: 'm-q1-cluster' }])]),
    entry('m-free'),
  ]),
  view(physics, [structure('physics-seki', 'Sekundarstufe I', [structure('p-a', 'Bewegung', [entry('pa1')])]),
    structure('physics-sekii-gk', 'Sekundarstufe II (GK)', [entry('pq1')])]),
  view(chemistry, [structure('c-seki', 'Sekundarstufe I', [entry('c1')])]),
]

const learnerTree = (entries: LandscapeEntry[], applied: unknown[]) => {
  const projected = applied.reduce<LandscapeEntry[]>((current, item) => applyCompositionViewProjection(current, item), entries)
    .map(item => normalizeLearnerProjectedEntries([item])[0] ?? item)
  const goalIndexAll = new Map(projected.flatMap(item => item.goals).map(item => [item.id, item]))
  const { childrenByParent: visibleChildrenByParent } = collapseLearnerSubjectRoots(goalIndexAll, buildDirectChildrenMap(goalIndexAll))
  const rootGoals = [...goalIndexAll.values()].filter(item => item.tags?.includes('root'))
  const visibleGoalIds = new Set<string>()
  const visit = (id: string) => { if (visibleGoalIds.has(id)) return; visibleGoalIds.add(id); (visibleChildrenByParent.get(id) ?? []).forEach(visit) }
  rootGoals.forEach(item => visit(item.id))
  const canonicalGoalIndexAll = new Map(entries.flatMap(item => item.goals).map(item => [item.id, item]))
  return { rootGoals, goalIndexAll, canonicalGoalIndexAll, visibleGoalIds, visibleChildrenByParent, landscapeSources: entries }
}
const source = prepareLandscapeEntries(landscapes)
const input = learnerTree(source, views)
const sectionId = (landscapeId: string, nodeId: string) => `composition:preview-${landscapeId}:structure:${nodeId}`
const snapshot = JSON.stringify([...input.goalIndexAll])

// Steps: step 1 makes the outermost sections units; step 2 adds the sections inside them.
const step1 = deriveLearnerUnitMapPreview(input, 1)
assert.equal(step1.maxStep, 2)
assert.deepEqual([...step1.units.keys()].sort(), [sectionId(math, 'sek1'), sectionId(math, 'sek2-gk'),
  sectionId(physics, 'physics-seki'), sectionId(physics, 'physics-sekii-gk')].sort(), 'step 1: the outermost sections only')
assert.deepEqual([...step1.units.values()].map(unit => unit.key).sort(), ['sek1', 'sek1', 'sek2', 'sek2'],
  'stage sections of both subjects share the provisional plan unit keys')
assert.equal(step1.units.get(sectionId(math, 'sek1'))?.label, 'Sekundarstufe I')
assert.deepEqual([...new Set(step1.after.map(order => `${order.unit}>${order.after}`))], ['sek2>sek1'])
const step2 = deriveLearnerUnitMapPreview(input)
assert.equal(step2.step, 2, 'the default is the deepest step')
assert.deepEqual([...step2.units.keys()].filter(id => !step1.units.has(id)).sort(), [sectionId(math, 'm-j5'), sectionId(math, 'm-j6'),
  sectionId(math, 'm-q1'), sectionId(physics, 'p-a')].sort(), 'step 2 adds the sections directly inside the step-1 units')
const j5 = step2.units.get(sectionId(math, 'm-j5'))!.key
const j6 = step2.units.get(sectionId(math, 'm-j6'))!.key
assert.notEqual(j5, j6)
assert(step2.after.some(order => order.unit === j6 && order.after === j5), 'sibling sections follow the order of the view')
assert(!step2.after.some(order => order.unit === j5), 'the first section lies after no sibling')
assert.equal(deriveLearnerUnitMapPreview(input, 9).step, 2, 'a step beyond the deepest is clamped')
assert.equal(deriveLearnerUnitMapPreview(input, 0).step, 1, 'a step below 1 is clamped')
for (const preview of [step1, step2]) {
  assert(![...preview.units.keys()].some(id => input.goalIndexAll.get(id)?.landscapeId === chemistry),
    'sections of other subjects never become units')
  assert(![...preview.units.keys()].some(id => input.rootGoals.some(root => root.id === id)), 'subject roots are never units')
  assert(![...preview.units.keys()].includes('m-q1-cluster'), 'canonical clusters placed by the view are never units in the preview')
}
assert.deepEqual(step2.memberUnits, [{ key: `learning-unit:${math}:lu-five`, label: 'Zahlen der Klasse 5', goalIds: ['m5a', 'm5b'], withAssessments: false }],
  'declared learning units come from the placement layer of the landscape')
assert.equal(deriveLearnerUnitMapPreview({ ...input, language: 'en' }).memberUnits[0].label, 'Numbers of year 5')
assert.equal(JSON.stringify([...input.goalIndexAll]), snapshot, 'the preview does not mutate the learner tree')

// The preview in the unit map: one stage node for both subjects, other subjects without units.
const map1 = buildLearnerUnitMapProjection({ ...input, units: step1.units, after: step1.after, memberUnits: step1.memberUnits })
assert.deepEqual(map1.entries[map1.rootId].children, ['__unit__:sek1', '__unit__:sek2', 'm-free', 'c1'],
  'Mathematics and Physics share one node per stage; goals without a unit stand beside them')
assert.deepEqual(map1.entries['__unit__:sek1'].subjects, [math, physics])
assert.equal(map1.scopeRelations?.[map1.rootId]?.find(relation => relation.source === '__unit__:sek1' && relation.target === '__unit__:sek2')?.unitOrder, 'declared')
assert.deepEqual(map1.entries['__unit__:sek1'].children, ['__unit__:learning-unit:68a8ac50-f5f5-4e24-8aa9-5e408ca01ced:lu-five', 'm6a', 'pa1'],
  'a learning unit whose own goals share one preview unit is shown as a unit')
const map2 = buildLearnerUnitMapProjection({ ...input, units: step2.units, after: step2.after, memberUnits: step2.memberUnits })
assert.deepEqual(map2.entries['__unit__:sek1'].children, [sectionId(math, 'm-j5'), 'm6a', 'pa1'])
assert.equal(map2.scopeRelations?.['__unit__:sek1']?.find(relation => relation.source === sectionId(math, 'm-j5')
  && relation.target === 'm6a')?.unitOrder, 'declared')
assert.equal(map2.scopeRelations?.['__unit__:sek1']?.find(relation => relation.source === 'm6a'
  && relation.target === 'pa1')?.unitOrder, 'derived', 'cross-subject demand between sections is derived, not declared')
assert.equal(map2.scopeRelations?.[map2.rootId]?.find(relation => relation.source === '__unit__:sek2'
  && relation.target === '__unit__:sek1'), undefined)
assert.deepEqual(map2.findings, [])
assert.deepEqual(map2.entries.pa1.sourceSections, [{ id: sectionId(physics, 'p-a'), title: 'Bewegung' }])
assert.deepEqual(map2.entryPaths?.[sectionId(physics, 'p-a')], map2.entryPaths?.pa1)
assert.equal(filterLearnerUnitMapToSubjects(map2, new Set([math])).entryPaths?.[sectionId(physics, 'p-a')], undefined)
const previewOnly = filterLearnerUnitMapToSubjects(map2, new Set([math, physics]))
assert.equal(previewOnly.entries.c1, undefined, 'the map shows Mathematics and Physics only')
assert.deepEqual(previewOnly.subjectIds, [math, physics])

// A tree without Mathematics and Physics has no units and no stage order.
const chemistryOnly = learnerTree(prepareLandscapeEntries([landscapes[2]]), [views[2]])
const chemistryPreview = deriveLearnerUnitMapPreview(chemistryOnly)
assert.equal(chemistryPreview.maxStep, 0)
assert.equal(chemistryPreview.units.size, 0)
assert.deepEqual(chemistryPreview.after, [])
assert.deepEqual(filterLearnerUnitMapToSubjects(buildLearnerUnitMapProjection({ ...chemistryOnly, units: chemistryPreview.units }),
  new Set([math, physics])).subjectIds, [])

// Real views: Bavaria and Hesse share one node per stage, without contradictory declarations.
const read = async (path: string) => JSON.parse(await readFile(fileURLToPath(new URL(`../../curricula/DE/Gymnasium/${path}`, import.meta.url)), 'utf8'))
const canonical = prepareLandscapeEntries(await Promise.all(['MATHEMATIK', 'PHYSIK'].map(subject => read(`canonical/DE_DEU_S_GYM_CANONICAL_${subject}.de.json`))))
for (const file of ['de-he-gk-g8', 'de-he-sekii-gk']) {
  const view = await read(`composition-views/physik/${file}.view.json`)
  const real = learnerTree(canonical.filter(entry => entry.meta.landscapeId === physics), [view])
  const map = buildLearnerUnitMapProjection({ ...real, ...deriveLearnerUnitMapPreview(real) })
  const sourceId = (node: string) => `composition:${view.viewId}:structure:${node}`
  for (const [leaf, group, title, preceding] of [
    ['716acf20-d882-5152-9735-099876d631b4', 'existing-assessment-path-549a427d-f10a-5537-990e-6fdd7466848b', 'Übungen', 'electrical-source-d7bc20e0-5ee9-593a-a7a9-d7cbb88392e6'],
    ['b4175564-4397-5c08-90ba-4f13231a75ec', 'physics-current-magnetic-fields-0bd4a459', 'Aufgaben zu Magnetfeldern und Induktion', 'he-physics-topic-13e882bd-2fc6-59c6-a2a8-32eb1fbf1751'],
    ['e0932fef-9e1c-5c95-b00c-7589e76d0e83', 'physics-current-magnetic-fields-1969c687', 'Aufgaben zu Magnetfeldern und Induktion'],
  ]) {
    assert.equal(map.entries[leaf].kind, 'assessment')
    assert.deepEqual(map.entries[leaf].sourceSections, [{ id: sourceId(group), title }])
    assert.equal(map.entries[sourceId(group)], undefined)
    assert.deepEqual(map.entryPaths?.[sourceId(group)], map.entryPaths?.[leaf])
    const parent = map.entryPaths![leaf].at(-2)!
    assert(map.entries[parent].children?.includes(leaf))
    const incoming = (map.scopeRelations?.[parent] ?? []).filter(edge => edge.target === leaf && edge.unitOrder === 'declared')
    assert.deepEqual(incoming.map(edge => edge.source), preceding ? [sourceId(preceding)] : [],
      `${file}: each declared order remains and an unordered topic stays unordered`)
    if (preceding) assert(incoming[0].provenance.some(witness => witness.dependentGoalId === leaf))
  }
}
const stageKeys = PROVISIONAL_STAGE_PLAN_UNITS.map(stage => stage.key)
for (const [land, mathView, physicsView] of [['BY', 'de-by-gk', 'de-by-gk'], ['HE', 'de-he-gk-g9', 'de-he-gk']]) {
  const real = learnerTree(canonical, [await read(`composition-views/mathematik/${mathView}.view.json`), await read(`composition-views/physik/${physicsView}.view.json`)])
  const deepest = deriveLearnerUnitMapPreview(real).maxStep
  assert(deepest >= 2, `${land}: real views have nested sections`)
  for (let step = 1; step <= deepest; step++) {
    const preview = deriveLearnerUnitMapPreview(real, step)
    const map = buildLearnerUnitMapProjection({ ...real, units: preview.units, after: preview.after, memberUnits: preview.memberUnits })
    const rootUnits = map.entries[map.rootId].children!.filter(id => map.entries[id].kind === 'unit')
    assert.deepEqual(rootUnits, stageKeys.map(key => `__unit__:${key}`), `${land} step ${step}: one node per stage for both subjects`)
    for (const key of stageKeys) assert.deepEqual(map.entries[`__unit__:${key}`].subjects, [math, physics])
    const bad = map.findings.filter(finding => ['contradictoryAfter', 'afterNotSiblings', 'unitInTwoPlaces', 'nestedUnitKey', 'unknownUnit'].includes(finding.kind))
    assert.deepEqual(bad, [], `${land} step ${step}: the view order yields no contradictory or misplaced declarations`)
    assert(map.scopeRelations?.[map.rootId]?.some(relation => relation.source === '__unit__:sek1' && relation.target === '__unit__:sek2'
      && relation.unitOrder === 'declared'), `${land} step ${step}: Sekundarstufe II lies after Sekundarstufe I`)
    assert.equal(map.entries['__unit__:sek1'].unitType, 'unit')
    if (step === 1) assert.equal(map.entries[map.unitEntryIds[`learning-unit:${math}:math-natural-numbers`]]?.unitType, 'unitWithAssessments',
      `${land}: the declared learning unit with coverage reviews is a unit with assessments`)
  }
}

console.log('Learner unit map preview passed: top-down steps, shared stage units, view order, learning units, '
  + 'other subjects untouched, real BY and HE views without contradictory declarations.')

// Exact neutral structure IDs produced by CourseProfileCompositionViewMerger.java.
const mergedIdViews = structuredClone(views)
mergedIdViews[0].rootNodes[1].id = 'sek2-gk-lk'
mergedIdViews[1].rootNodes[1].id = 'physics-sekii-gk-lk'
const mergedInput = learnerTree(source, mergedIdViews)
const mergedPreview = deriveLearnerUnitMapPreview(mergedInput, 1)
assert.deepEqual([...mergedPreview.units.values()].map(unit => unit.key).sort(), ['sek1', 'sek1', 'sek2', 'sek2'])
const mergedMap = buildLearnerUnitMapProjection({ ...mergedInput, units: mergedPreview.units, after: mergedPreview.after })
assert.equal(mergedMap.entries[mergedMap.rootId].children!.filter(id => mergedMap.entries[id].kind === 'unit').length, 2, 'Native GK/LK merging still yields one shared upper stage.')
assert.deepEqual([...source.flatMap(entry => entry.goals)].map(goal => [goal.id, goal.requires]),
  [...input.canonicalGoalIndexAll.values()].map(goal => [goal.id, goal.requires]), 'The neutral-stage fix changes no actual atomic requirement.')
