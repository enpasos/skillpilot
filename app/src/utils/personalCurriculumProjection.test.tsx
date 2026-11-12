import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { CompetenceTree } from '../components/CompetenceTree'
import { LanguageProvider } from '../contexts/LanguageContext'
import type { UiGoal } from '../goalTypes'
import { buildGoalIndex } from '../hooks/useGoalIndex'
import { normalizeLandscape, type LandscapeEntry } from '../hooks/useLandscapes'
import type { SkillLandscape } from '../landscapeTypes'
import {
  applyCompositionViewProjection,
  applyMatchedCompositionRouteGoalProjection,
  applyPersonalCurriculumProjection,
  compositionViewExposesGoal,
} from './compositionViewRuntime'
import { CANONICAL_GYMNASIUM_ROOT_ID } from './curriculumDisplay'
import { goalMatchesFilter } from './goalFilters'
import { normalizeLearnerProjectedEntries } from './learnerTreeProjection'
import { buildGoalContainsClosure } from './plannedScope'
import { buildTreeCompletionProgressMap } from './treeCompletionProgress'
import { buildVisibleChildrenMap } from './treeProjectionRuntime'

const load = (path: string) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'))
const chemistry = normalizeLandscape(load('../../../curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'))!
const view = load('../../../curricula/DE/Gymnasium/composition-views/chemie/de-de-gym-sekii-chemistry-gk.view.json')
const target = '1c1420c2-a8e2-520f-8015-6df637a973bd'
const prerequisite = 'e7c363d4-e02d-4895-8750-ba62c2eb63fe'
const orientation = 'a9c22adc-b543-5b0c-a2d8-3189facdff08'
assert(chemistry.goals.find((goal) => goal.id === target)?.requires.includes(prerequisite))
assert.equal(compositionViewExposesGoal([chemistry], view, prerequisite), false,
  'The real Chemistry prerequisite reproduces the authored support-only gap.')

const metadata = (rootLandscapeId: string, seedAtomicGoalIds: string[], targetGoalIds: string[],
  requiredByPaths: Record<string, string[]> = {}): NonNullable<SkillLandscape['personalCurriculumProjection']> => ({
  revision: 'atomic-prerequisite-learning-v1', rootLandscapeId, scopeRevision: 'fixed-configuration-1',
  seedAtomicGoalIds, targetGoalIds, requiredByPaths,
})
const source: LandscapeEntry = { ...chemistry, meta: { ...chemistry.meta,
  personalCurriculumProjection: metadata(chemistry.meta.landscapeId, [target, orientation], [target, orientation, prerequisite],
    { [prerequisite]: [target, prerequisite] }),
} }
const original = JSON.stringify(source)
const authored = normalizeLearnerProjectedEntries(applyCompositionViewProjection([source], view))
const projected = applyPersonalCurriculumProjection(authored, [source])
const goals = new Map(projected.flatMap((entry) => entry.goals.map((goal) => [goal.id, goal] as const)))
const projectedParentIds = buildGoalIndex(projected.flatMap((entry) => entry.goals)).parentMapAll
const root = projected[0].goals.find((goal) => goal.tags?.includes('root'))!
const preparation = projected[0].goals.find((goal) => goal.personalCurriculumProjection?.presentationOnly)!
assert(preparation, 'The formerly hidden prerequisite becomes navigable in the full plan.')
assert.deepEqual(preparation.contains, [prerequisite])
assert(root.contains.includes(preparation.id))
assert(!buildGoalContainsClosure(new Set([target]), goals).has(prerequisite),
  'The preparation branch does not widen an existing topic/exam focus.')
assert.deepEqual(goals.get(prerequisite)?.personalCurriculumProjection?.requiredByPath, [target, prerequisite])
assert.equal(JSON.stringify(source), original, 'Runtime presentation never mutates source goals or provenance.')
assert.deepEqual(goals.get(prerequisite)?.applicability, chemistry.goals.find((goal) => goal.id === prerequisite)?.applicability)
assert.deepEqual(applyPersonalCurriculumProjection(authored, [chemistry]), authored,
  'Public, trainer and package data without server metadata retain authored behavior.')
assert.deepEqual(applyPersonalCurriculumProjection(projected, [source]), projected,
  'Repeated presentation is deterministic and does not duplicate the preparation branch.')

const personalConfig = { [chemistry.meta.landscapeId]: { selected: true, filterId: 'GK', stage: 'SekII' } }
const visible = buildVisibleChildrenMap(goals, 'GK,DE-HE', personalConfig, 'content', chemistry.meta.landscapeId)
const progress = buildTreeCompletionProgressMap(goals, visible, (id) => id === prerequisite ? 1 : 0)
assert.equal(progress.get(root.id)?.totalCount, 3)
assert.equal(progress.get(root.id)?.explicitCount, 1, 'A mastered prerequisite stays in the fixed denominator.')
assert.equal(progress.get(root.id)?.openCount, 2)
assert.equal(progress.get(preparation.id)?.totalCount, 1)

// The closed personal scope bypasses seed filters, while the existing content
// versus competency presentation choice still applies to its targets.
const competencyAxis: UiGoal = { ...root, id: 'personal-scope-competency-axis',
  tags: ['competency-axis:dimension-root'], contains: [target], personalCurriculumProjection: undefined }
const competencyGoals = new Map(goals).set(competencyAxis.id, competencyAxis)
competencyGoals.set(root.id, { ...root, contains: [competencyAxis.id, preparation.id] })
const competencyVisible = buildVisibleChildrenMap(competencyGoals, 'GK,DE-HE', personalConfig,
  'competency', chemistry.meta.landscapeId)
assert.deepEqual(competencyVisible.get(root.id), [competencyAxis.id])
assert.deepEqual(competencyVisible.get(competencyAxis.id), [target],
  'Authoritative targets remain visible beneath their competency axis.')
const contentVisible = buildVisibleChildrenMap(competencyGoals, 'GK,DE-HE', personalConfig,
  'content', chemistry.meta.landscapeId)
assert(!contentVisible.get(root.id)?.includes(competencyAxis.id), 'Content mode still hides competency-axis roots.')

// A foreign canonical target may be excluded by every seed filter and lack a
// matching authored view. The server still supplies its owned definition.
const foreignId = 'foreign-subject'
const foreign: UiGoal = { ...goals.get(prerequisite)!, id: 'foreign-required', title: 'Fremde notwendige Grundlage',
  landscapeId: foreignId, phase: 'J7', tags: ['LK', 'DE-BY'],
  applicability: { jurisdiction: ['DE-BY'], courseProfile: ['LK'] },
  personalCurriculumProjection: undefined,
}
assert.equal(goalMatchesFilter(foreign, 'GK,DE-HE'), false)
const globalRoot: UiGoal = { ...root, id: 'personal-root', landscapeId: CANONICAL_GYMNASIUM_ROOT_ID,
  title: 'Gymnasium', contains: [root.id], tags: ['root'] }
const overview: LandscapeEntry = { meta: { ...chemistry.meta, landscapeId: CANONICAL_GYMNASIUM_ROOT_ID,
  personalCurriculumProjection: metadata(CANONICAL_GYMNASIUM_ROOT_ID, [], []) }, goals: [globalRoot] }
const selectedChemistry: LandscapeEntry = { ...source, meta: { ...source.meta,
  personalCurriculumProjection: { ...source.meta.personalCurriculumProjection!, rootLandscapeId: CANONICAL_GYMNASIUM_ROOT_ID } } }
const foreignEntry: LandscapeEntry = { meta: { ...chemistry.meta, landscapeId: foreignId,
  personalCurriculumProjection: metadata(CANONICAL_GYMNASIUM_ROOT_ID, [], [foreign.id], { [foreign.id]: [target, foreign.id] }) },
  goals: [foreign] }
const foreignProjection = applyPersonalCurriculumProjection([overview, ...authored], [overview, selectedChemistry, foreignEntry])
const foreignGoals = new Map(foreignProjection.flatMap((entry) => entry.goals.map((goal) => [goal.id, goal] as const)))
const foreignVisible = buildVisibleChildrenMap(foreignGoals, 'GK,DE-HE', {
  [CANONICAL_GYMNASIUM_ROOT_ID]: { selected: true, stage: 'SekII', filterId: 'DE-HE' },
  [chemistry.meta.landscapeId]: { selected: true, filterId: 'GK' },
  [foreignId]: { selected: false, filterId: 'GK' },
}, 'content', CANONICAL_GYMNASIUM_ROOT_ID)
const foreignPreparation = foreignProjection.flatMap((entry) => entry.goals)
  .find((goal) => goal.personalCurriculumProjection?.presentationOnly)!
assert.deepEqual(foreignPreparation.contains, [prerequisite, foreign.id].sort())
assert(foreignVisible.get(foreignPreparation.id)?.includes(foreign.id),
  'Unselected foreign subjects, earlier stages and course/jurisdiction filters cannot hide server targets.')
assert.equal(buildTreeCompletionProgressMap(foreignGoals, foreignVisible, () => 0).get(globalRoot.id)?.totalCount, 4)
assert.deepEqual(foreignGoals.get(foreign.id)?.applicability, foreign.applicability)

// The authored overview of the canonical plan leaves its own root without
// children; the cockpit then displays the subject roots. Their authored
// placements stay intact and only the really unplaced targets are collected.
const emptyOverview: LandscapeEntry = { ...overview, goals: [{ ...globalRoot, contains: [] }] }
const subjectRootProjection = applyPersonalCurriculumProjection([emptyOverview, ...authored],
  [overview, selectedChemistry, foreignEntry])
const subjectRootIndex = buildGoalIndex(subjectRootProjection.flatMap((entry) => entry.goals))
assert.deepEqual(subjectRootIndex.globalRootGoals.map((goal) => goal.id), [root.id],
  'The cockpit keeps showing the subject root instead of an overview holding only the preparation branch.')
const subjectRootPreparation = subjectRootProjection.flatMap((entry) => entry.goals)
  .find((goal) => goal.personalCurriculumProjection?.presentationOnly)!
assert.deepEqual(subjectRootPreparation.contains, [prerequisite, foreign.id].sort(),
  'Targets placed beneath a displayed subject root never move into the preparation branch.')
assert.deepEqual(subjectRootIndex.parentMapAll.get(subjectRootPreparation.id), [root.id])
assert.equal(subjectRootPreparation.landscapeId, chemistry.meta.landscapeId)
assert(subjectRootProjection.find((entry) => entry.meta.landscapeId === chemistry.meta.landscapeId)
  ?.goals.includes(subjectRootPreparation), 'The preparation branch is stored beside the root that displays it.')
assert.deepEqual(subjectRootIndex.goalIndexAll.get(globalRoot.id)?.contains, [])
;[target, orientation].forEach((goalId) => {
  assert.deepEqual(subjectRootIndex.parentMapAll.get(goalId), projectedParentIds.get(goalId),
    'An authored target keeps the parent its composition view gives it.')
})

// An atom already targeted in a second reviewed branch keeps that occurrence;
// support roles elsewhere neither hide it nor add another preparation copy.
const alreadyPresent = authored.map((entry) => ({ ...entry, goals: entry.goals.map((goal) => goal.id === root.id
  ? { ...goal, contains: [...goal.contains, prerequisite] } : goal) }))
const deduplicated = applyPersonalCurriculumProjection(alreadyPresent, [source])
assert.equal(deduplicated[0].goals.filter((goal) => goal.personalCurriculumProjection?.presentationOnly).length, 0)
assert.equal(deduplicated[0].goals.flatMap((goal) => goal.contains).filter((id) => id === prerequisite).length, 1)

const opaqueCluster = chemistry.goals.find((goal) => goal.contains.includes(target))!
assert(opaqueCluster)
const opaqueView = { ...view, rootNodes: [{ kind: 'goalEntry', goalId: opaqueCluster.id }] }
const opaque = applyPersonalCurriculumProjection(applyCompositionViewProjection([source], opaqueView), [source])
const opaqueGoals = new Map(opaque[0].goals.map((goal) => [goal.id, goal]))
assert.equal(opaqueGoals.get(opaqueCluster.id)?.type, 'cluster')
const opaqueRoot = opaque[0].goals.find((goal) => goal.tags?.includes('root'))!
const opaqueVisible = buildVisibleChildrenMap(opaqueGoals)
assert.equal(buildTreeCompletionProgressMap(opaqueGoals, opaqueVisible, () => 0).get(opaqueRoot.id)?.totalCount, 3,
  'Opaque canonical clusters cannot replace atoms or add a false progress obligation.')
assert(!buildGoalContainsClosure(new Set([opaqueCluster.id]), opaqueGoals).has(prerequisite))
assert(buildGoalContainsClosure(new Set([opaqueCluster.id]), opaqueGoals).has(target),
  'A direct canonical cluster entry retains its real seed atom as part of that focus.')
assert(opaqueVisible.get(opaqueCluster.id)?.includes(target), 'The canonical seed child remains selectable under its authored cluster.')

const demotedChildSource: LandscapeEntry = { ...source, meta: { ...source.meta,
  personalCurriculumProjection: metadata(chemistry.meta.landscapeId, [target], [target, prerequisite], { [prerequisite]: [target, prerequisite] }),
}, goals: source.goals.map((goal) => goal.id === opaqueCluster.id ? { ...goal, contains: [target, prerequisite] } : goal) }
const demotedChildView = { ...opaqueView, rootNodes: [...opaqueView.rootNodes,
  { kind: 'goalEntry', goalId: prerequisite, projectionRole: 'prerequisiteOnly' }] }
const demoted = applyPersonalCurriculumProjection(applyCompositionViewProjection([demotedChildSource], demotedChildView), [demotedChildSource])
const demotedGoals = new Map(demoted[0].goals.map((goal) => [goal.id, goal]))
assert.deepEqual(demotedGoals.get(opaqueCluster.id)?.contains, [target, prerequisite],
  'A required canonical descendant in global L belongs to this cluster focus despite its authored support role.')
assert(buildGoalContainsClosure(new Set([opaqueCluster.id]), demotedGoals).has(prerequisite))
assert.equal(demoted[0].goals.find((goal) => goal.personalCurriculumProjection?.presentationOnly), undefined,
  'A required atom already inside the canonical focused subtree needs no preparation duplicate.')

const firstRoot = { ...root, id: 'first-displayed-root', contains: [target] }
const secondRoot = { ...root, id: 'second-displayed-root', contains: [orientation, prerequisite] }
const multiRootEntries = applyPersonalCurriculumProjection([{ ...source,
  goals: [firstRoot, secondRoot, ...source.goals.filter((goal) => [target, orientation, prerequisite].includes(goal.id))],
}], [source])
assert.deepEqual(multiRootEntries[0].goals.find((goal) => goal.id === secondRoot.id)?.contains, [orientation, prerequisite],
  'Every independently displayed full-plan root keeps its actual target occurrences.')
assert.equal(multiRootEntries[0].goals.filter((goal) => goal.personalCurriculumProjection?.presentationOnly).length, 0)

const phaseScope = { ...root, id: 'existing-phase-focus', phase: 'E' as const, title: 'E-Phase', contains: [target],
  tags: ['synthetic:program-unit'], extendedData: { syntheticStructureKind: 'compositionView' } }
const routeEntry: LandscapeEntry = { ...source, meta: { ...source.meta,
  personalCurriculumProjection: metadata(chemistry.meta.landscapeId, [target], [target, prerequisite], { [prerequisite]: [target, prerequisite] }),
}, goals: [{ ...root, phase: 'GLOBAL', contains: [phaseScope.id] }, phaseScope,
  { ...goals.get(target)!, phase: 'E' }, { ...goals.get(prerequisite)!, phase: 'E' }] }
const legacyRouted = applyMatchedCompositionRouteGoalProjection([{ ...routeEntry,
  meta: { ...routeEntry.meta, personalCurriculumProjection: undefined } }], prerequisite)
assert(legacyRouted[0].goals.find((goal) => goal.id === phaseScope.id)?.contains.includes(prerequisite),
  'The fixture reproduces the legacy same-phase route-placement heuristic.')
const scopedRouted = applyPersonalCurriculumProjection(applyMatchedCompositionRouteGoalProjection([routeEntry], prerequisite), [routeEntry])
assert.deepEqual(scopedRouted[0].goals.find((goal) => goal.id === phaseScope.id)?.contains, [target],
  'Navigating to a required atom cannot graft it under an existing same-phase focus.')
assert.deepEqual(scopedRouted[0].goals.find((goal) => goal.personalCurriculumProjection?.presentationOnly)?.contains, [prerequisite])
assert.throws(() => applyPersonalCurriculumProjection([], [{ ...source, goals: source.goals.filter((goal) => goal.id !== prerequisite) }]),
  /Missing canonical atomic Personal Curriculum target/u)

// Render the actual learner tree: the aggregate can expand but cannot offer a
// focus mutation with its synthetic ID; canonical child targets still can.
const storage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
try {
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: () => 'de' } })
  const html = renderToStaticMarkup(React.createElement(LanguageProvider, { children: <CompetenceTree rootGoals={[preparation]} allGoals={goals}
    getMastery={() => 0} plannedGoals={new Set()} onTogglePlan={() => undefined} onSelect={() => undefined}
    selectedId="" audience="learner" allowClusterPlanning expandedGoalIds={new Set([preparation.id])}
    onToggleExpanded={() => undefined} visibleChildrenByParentOverride={visible} /> }))
  assert.match(html, /Notwendige Grundlagen/u)
  assert.match(html, /Chemische Symbole und Formeln sicher nutzen/u)
  const aggregateRow = html.slice(html.indexOf(`data-goal-id="${preparation.id}"`), html.indexOf('data-goal-id=', html.indexOf(`data-goal-id="${preparation.id}"`) + 1))
  assert.doesNotMatch(aggregateRow, /aria-pressed=/u, 'The preparation aggregate has no focus control.')
  assert.match(html, /aria-pressed="false"/u, 'Canonical prerequisite targets keep their focus controls.')
} finally {
  if (storage) Object.defineProperty(globalThis, 'localStorage', storage)
  else Reflect.deleteProperty(globalThis, 'localStorage')
}
console.log('Personal Curriculum required-target presentation tests passed.')
