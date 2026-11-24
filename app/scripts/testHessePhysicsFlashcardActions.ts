import './testHessePhysicsGuidedEntryMaterials'
import { buildSortedChildrenMap } from '../src/utils/learnerNavigation/treeSiblingOrder'
import { isUnitMaterialSource, findUnitPracticeExercise } from '../src/utils/unitLearningMaterial'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { prepareLandscapeEntries, type LandscapeEntry } from '../src/hooks/useLandscapes'
import type { SkillLandscape } from '../src/landscapeTypes'
import type { CompositionView } from '../src/utils/authoring/compositionViewAuthoring'
import { applyCompositionViewProjection } from '../src/utils/compositionViewRuntime'
import { buildLearnerNavigationProjection, normalizeLearnerProjectedEntries } from '../src/utils/learnerTreeProjection'
import { buildDirectChildrenMap } from '../src/utils/treeProjectionRuntime'
import { buildTreeCompletionProgressMap } from '../src/utils/treeCompletionProgress'
import { selectPracticeCards } from '../src/utils/flashcardPractice'
import { cardOriginGoalIds, legacyOriginGoalTagIds } from '../src/utils/memoryCardOrigins'
import { getSrsFilterTagsForGoal } from '../src/utils/srsTags'
import { buildLearnerUnitMapProjection, filterLearnerUnitMapToSubjects } from '../src/utils/learnerNavigation/learnerUnitMapProjection'
import { deriveLearnerUnitMapPreview, MATHEMATICS_LANDSCAPE_ID as math, PHYSICS_LANDSCAPE_ID as physics } from '../src/utils/learnerNavigation/learnerUnitMapPreview'
import { buildUnitAssessmentActions, buildUnitFlashcardActions, cardDeckIdsByScope, findUnitMaterialScopes, mapDeckGoalIds,
  placeUnitLearningResources, unitResourcePlacements } from '../src/components/learningUnitMap/unitLearningMaterialActions'
import { getLearningScopeRelations } from '../src/components/learningUnitMap/scopeRelations'
import { mapEntryPath } from '../src/components/learningUnitMap/mapEntryPath'
import { UNIT_MAP_LEARNING_MATERIALS as packageMaterials } from '../src/packageConsumer/learnerUnitMapPreviewSubjects'
import { readUnitMapMaterials } from './lib/unitLearningMaterialCatalog'
import { fileURLToPath } from 'node:url'

const tempCatalog = await mkdtemp(join(tmpdir(), 'unit-learning-material-'))
try {
  await writeFile(join(tempCatalog, 'unit-learning-materials.json'), JSON.stringify({ schemaVersion: 1, materials: ['intro.json'] }))
  const material = { unit: { landscapeId: 'history', compositionNodeId: 'sources', viewIds: ['intro'] },
    intro: { de: { question: 'Wann?', promise: 'Datieren.' }, en: { question: 'When?', promise: 'Establish dates.' } } }
  const path = join(tempCatalog, 'intro.json')
  await writeFile(path, JSON.stringify(material))
  const legacy = readUnitMapMaterials(tempCatalog)
  await writeFile(path, JSON.stringify({ schemaVersion: 1, ...material }))
  assert.deepEqual(readUnitMapMaterials(tempCatalog), legacy)
  await writeFile(path, JSON.stringify({ schemaVersion: 2, ...material,
    unit: { ...material.unit, orientationGoalId: 'intro-orientation' } }))
  assert.equal(readUnitMapMaterials(tempCatalog)[0].unit.orientationGoalId, 'intro-orientation')
  const practice = { goalId: 'algorithm', requiredForRegularLearning: true,
    de: { title: 'Durchführen' }, en: { title: 'Perform' } }
  await writeFile(path, JSON.stringify({ schemaVersion: 3, ...material, exercises: [practice] }))
  assert.deepEqual(readUnitMapMaterials(tempCatalog)[0].exercises, [practice])
  const individualAssessmentOffers = [{ targetGoalId: 'algorithm', assessmentGoalId: 'algorithm-check' }]
  await writeFile(path, JSON.stringify({ schemaVersion: 3, ...material, exercises: [practice], individualAssessmentOffers }))
  assert.deepEqual(readUnitMapMaterials(tempCatalog)[0].individualAssessmentOffers, individualAssessmentOffers)
  const studyRecommendations = [{ beforeGoalId: 'review-sources', afterGoalId: 'compare-dates' }]
  await writeFile(path, JSON.stringify({ schemaVersion: 4, ...material, individualAssessmentOffers, studyRecommendations }))
  assert.deepEqual(readUnitMapMaterials(tempCatalog)[0].studyRecommendations, studyRecommendations)
  assert.deepEqual(readUnitMapMaterials(tempCatalog)[0].individualAssessmentOffers, individualAssessmentOffers)
  await writeFile(path, JSON.stringify({ schemaVersion: 5, ...material }))
  assert.throws(() => readUnitMapMaterials(tempCatalog), /Unsupported unit learning material version/)
} finally {
  await rm(tempCatalog, { recursive: true, force: true })
}

const materials = readUnitMapMaterials(fileURLToPath(new URL('../../curricula/', import.meta.url)))
const practiceMaterial = materials.find(item => item.unit.landscapeId === physics && item.unit.compositionNodeId === 'physics-e1-motion')!
const { flashcardGoalId: memoryId, assessmentGoalId: examId } = practiceMaterial.unit
assert(memoryId && examId)
const horizontalThrowId = '89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2'
const horizontalThrowAssessmentIds = ['39f52dcb-ff1d-5cad-9ccb-30da803cfa85', 'bcc56921-7107-5f5f-b721-3d5e0d7e1cd9']
// Since the E.1 cut (23 Nov 2026) both throw assessments require the throw goal, so
// their order follows from requires; the former study recommendations were removed.
assert.equal(practiceMaterial.studyRecommendations, undefined)
const read = async <T,>(path: string): Promise<T> => JSON.parse(await readFile(new URL(`../../curricula/DE/Gymnasium/${path}`, import.meta.url), 'utf8'))
const physicsLandscape = await read<SkillLandscape>('canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json')
const mathematicsLandscape = await read<SkillLandscape>('canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json')
const canonical = prepareLandscapeEntries([mathematicsLandscape, physicsLandscape])
for (const id of horizontalThrowAssessmentIds) {
  assert(physicsLandscape.goals.find(goal => goal.id === id)?.requires.includes(horizontalThrowId), `${id} requires the throw goal`)
}
const canonicalSnapshot = JSON.stringify(canonical)
const input = (views: CompositionView[]) => {
  const projected = normalizeLearnerProjectedEntries(views.reduce<LandscapeEntry[]>((entries, view) =>
    applyCompositionViewProjection(entries, view), canonical))
  const goals = new Map(projected.flatMap(landscape => landscape.goals).map(goal => [goal.id, goal]))
  const { childrenByParent: visibleChildrenByParent, navigationGoals: goalIndexAll } = buildLearnerNavigationProjection(goals, buildDirectChildrenMap(goals))
  const rootGoals = [...goalIndexAll.values()].filter(goal => goal.tags?.includes('root'))
  const visibleGoalIds = new Set<string>()
  const visit = (id: string) => {
    if (visibleGoalIds.has(id)) return
    visibleGoalIds.add(id)
    for (const child of visibleChildrenByParent.get(id) ?? []) visit(child)
  }
  rootGoals.forEach(goal => visit(goal.id))
  return { rootGoals, goalIndexAll, visibleGoalIds, visibleChildrenByParent,
    canonicalGoalIndexAll: new Map(canonical.flatMap(landscape => landscape.goals).map(goal => [goal.id, goal])) }
}
const physicsFixture = (value: ReturnType<typeof input>) => {
  const preview = deriveLearnerUnitMapPreview({ ...value, landscapeSources: canonical })
  return filterLearnerUnitMapToSubjects(buildLearnerUnitMapProjection({ ...value,
    units: preview.units, after: preview.after, memberUnits: preview.memberUnits }), new Set([physics]))
}
let checked = 0
let nestedUnitsWithCards = 0
type DeckFile = { deckId: string; cards: { id: string; tags?: string[]; originGoalIds?: string[] }[] }
const deckFiles = new Map<string, DeckFile>()
const deckFor = async (source: string) => {
  if (!deckFiles.has(source)) deckFiles.set(source, await read<DeckFile>(`memory-decks/${source.replace(/^\/data\//u, '')}`))
  return deckFiles.get(source)!
}
let checkedRecommendationViews = 0
for (const scope of ['', '-g8', '-g9', '-sekii']) for (const course of ['gk', 'lk'] as const) {
  const filename = scope === '-sekii' ? `de-he-sekii-${course}` : `de-he-${course}${scope}`
  const view = await read<CompositionView>(`composition-views/physik/${filename}.view.json`)
  // Check the ordinary course and the native combined course projection identity.
  for (const merged of [false, true]) {
    const selected = structuredClone(view)
    if (merged) selected.viewId = `merged:${view.viewId.replace(/-gk(?=-|$)/u, '-lk')}+${view.viewId.replace(/-lk(?=-|$)/u, '-gk')}`
    const value = input([selected])
    const original = physicsFixture(value)
    const snapshot = JSON.stringify(original)
    const treeChildren = buildSortedChildrenMap(value.visibleChildrenByParent, value.goalIndexAll, 'learner', original, materials)
    for (const material of materials.filter(item => item.guidedStudyOrder)) {
      const scopes = findUnitMaterialScopes(material, original, value.goalIndexAll, value.visibleGoalIds)
      assert.equal(scopes.size, 1, filename)
      const [scopeId] = scopes
      const assessments = buildUnitAssessmentActions(material, original, value.goalIndexAll, value.visibleGoalIds, 'de', scopes)
      const placed = placeUnitLearningResources(original, unitResourcePlacements({ material, scopes, assessments }))
      const order = [material.unit.orientationGoalId!, ...material.guidedStudyOrder!]
      const treeScope = [...value.goalIndexAll.values()].find(goal => isUnitMaterialSource(material, goal))!
      const treeRows = treeChildren.get(treeScope.id)!
      assert.deepEqual(treeRows.filter(id => order.includes(id)), order, filename + ': visible tree rows follow the unit steps')
      const children = placed.entries[scopeId].children ?? []
      const relations = getLearningScopeRelations(placed, scopeId)
      for (const [index, goalId] of order.entries()) {
        assert(children.includes(goalId), `${filename}: missing authored study step ${goalId}`)
        assert(['goal', 'motivation', 'assessment'].includes(placed.entries[goalId].kind))
        if (index) assert(relations.some(edge => edge.source === order[index - 1] && edge.target === goalId))
        const pending = [...(value.canonicalGoalIndexAll.get(goalId)?.requires ?? [])]
        const seen = new Set<string>()
        while (pending.length) {
          const prerequisite = pending.pop()!
          if (seen.has(prerequisite)) continue
          seen.add(prerequisite)
          assert(!order.slice(index + 1).includes(prerequisite), `${goalId} requires a later study step ${prerequisite}`)
          pending.push(...(value.canonicalGoalIndexAll.get(prerequisite)?.requires ?? []))
        }
      }
    }

    const e1Scopes = findUnitMaterialScopes(practiceMaterial, original, value.goalIndexAll, value.visibleGoalIds)
    assert.equal(e1Scopes.size, 1)
    const [e1ScopeId] = e1Scopes
    if (!merged && (scope === '-g8' || scope === '-g9')) {
      // Child unit 4 of E.1 lists the throw goal before both of its assessments.
      const unitFour = [...value.goalIndexAll.keys()].find(id => id.endsWith(':structure:physics-e1-two-motions'))
      const rows = unitFour ? treeChildren.get(unitFour) ?? [] : []
      for (const id of horizontalThrowAssessmentIds) {
        assert(rows.includes(horizontalThrowId) && rows.includes(id) && rows.indexOf(horizontalThrowId) < rows.indexOf(id),
          `${filename}: the tree puts ${id} after the throw goal in child unit 4`)
      }
      checkedRecommendationViews++
    }
    for (const exercise of practiceMaterial.exercises) {
      const path = mapEntryPath(original, exercise.goalId)
      assert(path?.includes(e1ScopeId), `${filename}: exercise is reachable inside its published unit`)
      const goal = value.goalIndexAll.get(exercise.goalId)!
      const materialForScope = (id: string) => e1Scopes.has(id) ? practiceMaterial : undefined
      for (const language of ['de', 'en'] as const) {
        assert.deepEqual(findUnitPracticeExercise(goal, [...path].reverse(), materialForScope, language), exercise[language])
        assert.equal(findUnitPracticeExercise(goal, ['unrelated board'], materialForScope, language), undefined)
        const nested = { ...practiceMaterial, exercises: [] }
        assert.equal(findUnitPracticeExercise(goal, ['nested', e1ScopeId], id => id === 'nested' ? nested : materialForScope(id), language),
          undefined, 'A different material bound to the nearer unit takes precedence')
        assert.equal(findUnitPracticeExercise({ ...goal, nodeKind: 'exam' }, [e1ScopeId], materialForScope, language), undefined)
        assert.equal(findUnitPracticeExercise({ ...goal, landscapeId: math }, [e1ScopeId], materialForScope, language), undefined)
        assert.equal(findUnitPracticeExercise({ ...goal, id: 'another goal with the same title' }, [e1ScopeId], materialForScope, language), undefined)
      }
    }
    for (const language of ['de', 'en'] as const) {
      const deck = await read<{ deckId: string; cards: { id: string; tags?: string[]; originGoalIds?: string[] }[] }>(`memory-decks/de_gymnasium_physics_flashcards_mechanics_ephase.${language}.json`)
      assert.equal(deck.deckId, 'de_gymnasium_physics_mechanics_ephase')
      assert.equal(deck.cards.length, 87)
      assert(deck.cards.every(card => card.originGoalIds?.length), 'every deck card names its understanding goals')
      const actions = buildUnitFlashcardActions(memoryId, original, value.goalIndexAll, value.visibleGoalIds, deck.cards, language)
      const assessments = buildUnitAssessmentActions(practiceMaterial, original, value.goalIndexAll, value.visibleGoalIds, language)
      assert.equal(assessments.size, 1, 'E.1 keeps a direct named link to its one canonical assessment')
      const examAction = [...assessments.values()][0]
      assert.equal(examAction.goalId, examId)
      assert.equal(examAction.title, `${language === 'de' ? 'Prüfung' : 'Assessment'}: ${value.goalIndexAll.get(examId)!.title}`)
      const place = (flashcards: typeof actions, exams: typeof assessments) => placeUnitLearningResources(original,
        unitResourcePlacements({ scopes: e1Scopes, cardDeckIds: cardDeckIdsByScope(new Map([[memoryId, flashcards]])), assessments: exams }))
      const placed = place(actions, assessments)
      assert.deepEqual(placed.entryPaths, original.entryPaths, 'both goals keep their original home and reveal paths')
      assert.deepEqual(placed.entries[e1ScopeId].children, [...original.entries[e1ScopeId].children!, memoryId, examId])
      assert(!original.entries[e1ScopeId].children!.includes(memoryId) && !original.entries[e1ScopeId].children!.includes(examId))
      const extraRelations = placed.scopeRelations![e1ScopeId].filter(edge => [memoryId, examId].includes(edge.target))
      assert(extraRelations.some(edge => edge.target === examId), 'the shared exam shows actual E.1 preparation on this board')
      for (const edge of extraRelations) {
        assert(edge.provenance.length)
        const requirements = physicsLandscape.goals.find(goal => goal.id === edge.target)!.requires!
        for (const witness of edge.provenance) {
          assert(requirements.includes(witness.requiredGoalId), 'each extra arrow has a real canonical prerequisite')
          assert(witness.sourceGoalIds.every(sourceId => original.entryPaths![sourceId].includes(edge.source)))
        }
      }
      assert.equal(Object.values(placed.entries).filter(entry => entry.id === examId).length, 1)
      const withoutExam = new Set(value.visibleGoalIds)
      withoutExam.delete(examId)
      const hiddenAssessment = buildUnitAssessmentActions(practiceMaterial, original, value.goalIndexAll, withoutExam, language)
      assert.equal(hiddenAssessment.size, 0)
      assert(!place(actions, hiddenAssessment).entries[e1ScopeId].children?.includes(examId))
      assert(placed.entries[original.entryPaths![examId].at(-2)!].children?.includes(examId), 'the assessment keeps its original phase placement')
      const phase = [...actions.values()].find(action => action.goalIds === undefined)
      assert.equal(phase?.title, language === 'de' ? 'Gesamten Lernkartenstapel üben' : 'Practice the full deck')
      assert.equal(phase.goalId, memoryId)
      assert.equal(placed.entries[memoryId], original.entries[memoryId], 'the same full deck remains a real goal on the E phase board')
      assert(placed.entries[original.entryPaths![memoryId].at(-2)!].children?.includes(memoryId))
      assert(value.goalIndexAll.has(memoryId) && value.visibleGoalIds.has(memoryId), 'the original memory goal stays a visible learner target')
      const e1 = [...actions.values()].find(action => action.title === (language === 'de' ? 'Lernkarten zu E.1 üben' : 'Practice flashcards for E.1'))
      assert(e1?.goalIds?.length, `${filename}: E.1 has an actual practice action`)
      const selectedCards = selectPracticeCards(deck.cards, getSrsFilterTagsForGoal(value.goalIndexAll.get(memoryId)!), e1.goalIds)
      if (scope === '') {
        // The E.1 cut moved two of the former nine cards with their origin goals to E.2 and E.3.
        assert.deepEqual(selectedCards.map(card => card.id).sort(),
          ['001', '007', '008', '009', '010', '011', '036'].map(number => 'physics_e_cov_' + number))
        const traffic = '4a2bf015-052b-4af0-aed7-324259fa1a8a'
        const friction = '5fd45dbc-0eb1-591b-99a9-7386336f1456'
        const referenceFrames = '68c90ba6-c438-463c-9a53-cf61062d416a'
        for (const [cardId, origin, topic] of [
          ['physics_e_cov_012', traffic, 'physics-e2-newton-and-conservation'],
          ['physics_e_cov_035', referenceFrames, 'he-physics-topic-287739a3-6143-55d0-abe7-1a08889e9b49'],
        ]) {
          const home = mapEntryPath(original, origin)?.find(id => value.goalIndexAll.get(id)?.extendedData?.compositionNodeId === topic)
          assert(home, filename + ': the relocated goal belongs to its topic')
          const topicGoals = actions.get(home)?.goalIds
          assert(topicGoals?.includes(origin), filename + ': the relocated goal has a topic practice action')
          const cards = selectPracticeCards(deck.cards, getSrsFilterTagsForGoal(value.goalIndexAll.get(memoryId)!), topicGoals)
          assert(cards.some(card => card.id === cardId && card.originGoalIds?.includes(origin)), filename + ': ' + cardId)
          if (origin === traffic) {
            const children = treeChildren.get(home) ?? []
            assert(children.includes(friction) && children.indexOf(traffic) > children.indexOf(friction),
              filename + ': the E.2 traffic goal follows friction')
          }
        }
      }
      assert(selectedCards.length > 0 && selectedCards.length < deck.cards.length, 'E.1 is a strict subset of the original deck')
      assert.equal(new Set(selectedCards.map(card => card.id)).size, selectedCards.length)
      for (const card of selectedCards) assert(card.originGoalIds!.some(id => e1.goalIds!.includes(id)))
      assert(!selectedCards.some(card => card.originGoalIds!.includes('5c44b9ba-9b05-4774-95d5-073230d3fc4f')), 'unrelated mechanics cards cannot pass through broad GK/LK tags')
      for (const action of actions.values()) for (const goalId of action.goalIds ?? []) {
        assert(value.visibleGoalIds.has(goalId))
        assert.equal(value.goalIndexAll.get(goalId)?.landscapeId, physics, 'topic membership excludes Mathematics preparation')
      }
      const noVisibleMemory = new Set(value.visibleGoalIds)
      noVisibleMemory.delete(memoryId)
      assert.equal(buildUnitFlashcardActions(memoryId, original, value.goalIndexAll, noVisibleMemory, deck.cards, language).size, 0)
      const noTopicCards = buildUnitFlashcardActions(memoryId, original, value.goalIndexAll, value.visibleGoalIds, [], language)
      assert(!place(noTopicCards, assessments).entries[e1ScopeId].children?.includes(memoryId))
      assert.equal(noTopicCards.size, 0,
        'a topic with no matching card offers no empty drill; the deck without unit cards stays an ordinary goal on its board')
      assert.equal(buildUnitFlashcardActions(memoryId, original, value.goalIndexAll, value.visibleGoalIds, undefined, language).size, 0,
        'no card action before the deck has loaded')

      // Issue #85: every unit offers the cards of its atomic content goals, without a unit material file.
      const deckHomePath = original.entryPaths![memoryId].slice(0, -1)
      for (const boardId of deckHomePath.slice(0, -1)) assert(!actions.has(boardId), 'boards above the deck home hold no second copy')
      for (const [unitId, action] of actions) {
        if (action.goalIds === undefined) continue
        assert.equal(original.entries[unitId].kind, 'unit')
        assert(!deckHomePath.includes(unitId))
        for (const goalId of action.goalIds) {
          assert(original.entryPaths![goalId].includes(unitId), 'a unit offers only the cards of its own atomic goals')
          assert.equal(original.entries[goalId].kind, 'goal')
        }
        assert(selectPracticeCards(deck.cards, getSrsFilterTagsForGoal(value.goalIndexAll.get(memoryId)!), action.goalIds).length)
      }
      const unitOf = (nodeId: string) => Object.keys(original.entries).find(id => original.entries[id].kind === 'unit'
        && value.goalIndexAll.get(id)?.extendedData?.compositionNodeId === nodeId)
      const e2 = unitOf('physics-e2-newton-and-conservation')
      if (e2) assert.equal(actions.get(e2)?.title, language === 'de' ? 'Lernkarten zu E.2 üben' : 'Practice flashcards for E.2',
        'E.2 has no card material binding and still offers its cards')
      const nested = unitOf('physics-e1-accelerated-and-free-fall')
      if (nested) {
        const nestedAction = actions.get(nested)
        assert(nestedAction?.goalIds?.length, 'a nested unit offers the cards of its own goals')
        assert(nestedAction.goalIds.every(goalId => e1.goalIds!.includes(goalId)), 'the nested cards are part of E.1')
        nestedUnitsWithCards++
      }
      const placedEverywhere = placeUnitLearningResources(original, unitResourcePlacements({ scopes: new Set(actions.keys()),
        cardDeckIds: cardDeckIdsByScope(new Map([[memoryId, actions]])), assessments: new Map() }))
      for (const unitId of actions.keys()) assert(placedEverywhere.entries[unitId].children!.includes(memoryId))
      assert.equal(placedEverywhere.entries[deckHomePath.at(-1)!].children!.filter(id => id === memoryId).length, 1,
        'the deck stays once on its home board')
      const children = new Map(Object.values(original.entries).map(entry => [entry.id, entry.children ?? []]))
      const progressGoals = new Map(Object.keys(original.entries).map(id => [id, value.goalIndexAll.get(id)
        ?? { id, type: 'cluster' as const, contains: [], weight: 1 } as never]))
      const progress = buildTreeCompletionProgressMap(progressGoals, children, id => id === memoryId ? 1 : 0, new Map())
      const phaseId = [...actions.keys()][0]
      assert((progress.get(phaseId)?.explicitCount ?? 0) >= 1, 'the original memory goal still contributes to phase progress')
      assert.equal(JSON.stringify(original), snapshot, 'map actions do not mutate the original completion/demand fixture')
      if (language === 'de') {
        // Every deck goal of the projection follows the same rule.
        for (const deckId of mapDeckGoalIds(original, value.visibleGoalIds)) {
          const source = value.goalIndexAll.get(deckId)!.extendedData!.vocabularySource as string
          const otherDeck = await deckFor(source)
          const otherActions = buildUnitFlashcardActions(deckId, original, value.goalIndexAll, value.visibleGoalIds, otherDeck.cards, 'de')
          assert(otherActions.size > 1, `${filename}: ${otherDeck.deckId} offers unit card practice`)
          for (const [unitId, action] of otherActions) {
            assert.equal(action.goalId, deckId)
            if (action.goalIds) assert(selectPracticeCards(otherDeck.cards, getSrsFilterTagsForGoal(value.goalIndexAll.get(deckId)!), action.goalIds).length,
              `${otherDeck.deckId}: ${unitId} has cards`)
          }
        }
      }
      checked++
    }
  }
}
assert(nestedUnitsWithCards > 0, 'a nested unit below E.1 is covered')
assert.equal(JSON.stringify(canonical), canonicalSnapshot, 'source goals and learner results remain untouched')
for (const duration of ['g8', 'g9']) {
  const value = input([await read<CompositionView>(`composition-views/mathematik/de-he-gk-${duration}.view.json`),
    await read<CompositionView>(`composition-views/physik/de-he-gk-${duration}.view.json`)])
  const preview = deriveLearnerUnitMapPreview(value)
  const fixture = buildLearnerUnitMapProjection({ ...value, units: preview.units, after: preview.after, memberUnits: preview.memberUnits })
  const cards = (await read<{ cards: { tags?: string[]; originGoalIds?: string[] }[] }>('memory-decks/de_gymnasium_physics_flashcards_mechanics_ephase.de.json')).cards
  const combined = buildUnitFlashcardActions(memoryId, fixture, value.goalIndexAll, value.visibleGoalIds, cards, 'de')
  const phase = [...combined].find(([, action]) => action.goalIds === undefined)
  assert(phase && fixture.entries[phase[0]].subjects?.includes(math) && fixture.entries[phase[0]].subjects?.includes(physics),
    'a combined Mathematics/Physics E phase keeps its Physics practice action through the real scope alias')
  const mathOnly = filterLearnerUnitMapToSubjects(fixture, new Set([math]))
  assert.equal(findUnitMaterialScopes(practiceMaterial, mathOnly, value.goalIndexAll, value.visibleGoalIds).size, 0,
    'a Mathematics-only board cannot offer the Physics E.1 introduction or exercises')
  assert.equal(buildUnitFlashcardActions(memoryId, mathOnly, value.goalIndexAll, value.visibleGoalIds, cards, 'de').size, 0,
    'hiding Physics removes its action from a shared phase')
}
// An unrelated subject has its own view, lesson, graph anchors and deck. No registry entry or
// repository-specific IDs are needed by the projection functions.
{
  const mathView = await read<CompositionView>('composition-views/mathematik/de-he-gk-g9.view.json')
  const value = input([mathView])
  const preview = deriveLearnerUnitMapPreview(value)
  const fixture = buildLearnerUnitMapProjection({ ...value, units: preview.units, after: preview.after, memberUnits: preview.memberUnits })
  const memory = Object.values(fixture.entries).find(({ id, kind }) => kind === 'memory' && value.goalIndexAll.get(id)?.landscapeId === math)!
  assert(memory)
  const owner = fixture.entryPaths![memory.id].at(-2)!
  const topic = Object.values(fixture.entries).find(({ id, kind, children }) => kind === 'unit' && id !== owner
    && fixture.entryPaths![id].includes(owner) && value.goalIndexAll.get(id)?.extendedData?.compositionNodeId
    && children?.some(child => fixture.entries[child]?.kind === 'goal' && value.goalIndexAll.get(child)?.landscapeId === math))!
  assert(topic, 'the second subject has a real projected lesson on the deck owner board')
  const atomicId = topic.children!.find(id => fixture.entries[id]?.kind === 'goal' && value.goalIndexAll.get(id)?.landscapeId === math)!
  const unit = { landscapeId: math, viewIds: [mathView.viewId], compositionNodeId: String(value.goalIndexAll.get(topic.id)!.extendedData!.compositionNodeId) }
  const material = { ...practiceMaterial, unit: { ...unit, flashcardGoalId: memory.id }, exercises: [] }
  const matching = findUnitMaterialScopes(material, fixture, value.goalIndexAll, value.visibleGoalIds)
  assert.deepEqual([...matching], [topic.id])
  const cards = Array.from({ length: 27 }, (_, index) => ({ id: String(index), tags: [
    ...(getSrsFilterTagsForGoal(value.goalIndexAll.get(memory.id)!) ?? []), `goal:${atomicId}`,
  ] }))
  const action = buildUnitFlashcardActions(memory.id, fixture, value.goalIndexAll, value.visibleGoalIds, cards, 'de').get(topic.id)
  assert(action?.goalIds?.includes(atomicId) && action.goalId === memory.id)
  assert.equal(selectPracticeCards(cards, undefined, action.goalIds).length, 27, 'larger subdecks remain available in full')
  assert.equal(buildUnitAssessmentActions(material, fixture, value.goalIndexAll, value.visibleGoalIds, 'de').size, 0)
  const deckless = { ...material, unit }
  assert.deepEqual([...findUnitMaterialScopes(deckless, fixture, value.goalIndexAll, value.visibleGoalIds)], [topic.id])
  const wrong = { ...material, unit: { ...material.unit, viewIds: ['some-other-view'] } }
  assert.equal(findUnitMaterialScopes(wrong, fixture, value.goalIndexAll, value.visibleGoalIds).size, 0)
  // Issue #85: the card action no longer depends on a material binding (flashcardGoalId) at all.
  const unbound = Object.values(fixture.entries).find(({ id, kind }) => kind === 'unit' && id !== topic.id && id !== owner
    && fixture.entryPaths![id].includes(owner) && !fixture.entryPaths![topic.id].includes(id)
    && (fixture.entries[id].children ?? []).some(child => fixture.entries[child]?.kind === 'goal' && value.goalIndexAll.get(child)?.landscapeId === math))!
  assert(unbound, 'a second lesson without material exists')
  const unboundGoal = unbound.children!.find(id => fixture.entries[id]?.kind === 'goal' && value.goalIndexAll.get(id)?.landscapeId === math)!
  const unboundCards = [{ id: 'unbound', tags: [...(getSrsFilterTagsForGoal(value.goalIndexAll.get(memory.id)!) ?? [])], originGoalIds: [unboundGoal] }]
  assert(buildUnitFlashcardActions(memory.id, fixture, value.goalIndexAll, value.visibleGoalIds, unboundCards, 'de').get(unbound.id)?.goalIds?.includes(unboundGoal),
    'a unit without material offers the cards of its goals')
  const hiddenGoals = new Set(value.visibleGoalIds)
  hiddenGoals.delete(unboundGoal)
  assert(!buildUnitFlashcardActions(memory.id, fixture, value.goalIndexAll, hiddenGoals, unboundCards, 'de').has(unbound.id),
    'a card of a goal outside the learner scope offers nothing')
}
assert.deepEqual(packageMaterials, [], 'the package-consumer edition supplies no repository-specific E.1 materials')
assert.deepEqual(selectPracticeCards([{ tags: ['GK', 'goal:a'] }, { tags: ['LK', 'goal:b'] }], ['GK'], ['b']), [], 'course and topic selection are intersected')
assert.deepEqual(selectPracticeCards([{ tags: ['goal:a'] }], undefined, []), [], 'an empty topic cannot accidentally open the full deck')
assert.deepEqual(selectPracticeCards([{ originGoalIds: ['a'], tags: ['GK'] }, { originGoalIds: ['b'], tags: ['GK', 'goal:a'] }], ['GK'], ['a']),
  [{ originGoalIds: ['a'], tags: ['GK'] }], 'the card field is authoritative; a legacy tag never adds a goal to a card that names its goals')
assert.deepEqual(cardOriginGoalIds({ tags: ['GK', 'goal:b', 'goal:a', 'goal:b'] }), ['b', 'a'], 'decks without the field keep the legacy tag relation')
assert.deepEqual(cardOriginGoalIds({ tags: ['GK'] }), [], 'a card without either encoding names no understanding goal')
assert.deepEqual(legacyOriginGoalTagIds({ originGoalIds: ['a'], tags: ['goal:c'] }), ['c'])
console.log(`Hessen Physics flashcard actions passed ${checked} real course/duration/language projections.`)
console.log(`Hessen Physics throw assessments follow the throw goal in ${checkedRecommendationViews} real course/duration projections.`)
