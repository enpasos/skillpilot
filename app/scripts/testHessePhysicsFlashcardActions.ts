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
import { collapseLearnerSubjectRoots, normalizeLearnerProjectedEntries } from '../src/utils/learnerTreeProjection'
import { buildDirectChildrenMap } from '../src/utils/treeProjectionRuntime'
import { buildTreeCompletionProgressMap } from '../src/utils/treeCompletionProgress'
import { selectPracticeCards } from '../src/utils/flashcardPractice'
import { getSrsFilterTagsForGoal } from '../src/utils/srsTags'
import { buildLearnerUnitMapProjection, filterLearnerUnitMapToSubjects } from '../src/utils/learnerNavigation/learnerUnitMapProjection'
import { deriveLearnerUnitMapPreview, MATHEMATICS_LANDSCAPE_ID as math, PHYSICS_LANDSCAPE_ID as physics } from '../src/utils/learnerNavigation/learnerUnitMapPreview'
import { buildUnitAssessmentActions, buildUnitFlashcardActions, findUnitMaterialScopes, placeUnitLearningResources, unitResourcePlacements } from '../src/components/learningUnitMap/unitLearningMaterialActions'
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
  await writeFile(path, JSON.stringify({ schemaVersion: 4, ...material }))
  assert.throws(() => readUnitMapMaterials(tempCatalog), /Unsupported unit learning material version/)
} finally {
  await rm(tempCatalog, { recursive: true, force: true })
}

const materials = readUnitMapMaterials(fileURLToPath(new URL('../../curricula/', import.meta.url)))
const practiceMaterial = materials.find(item => item.unit.landscapeId === physics && item.unit.compositionNodeId === 'physics-e1-motion')!
const { flashcardGoalId: memoryId, assessmentGoalId: examId } = practiceMaterial.unit
assert(memoryId && examId)
const read = async <T,>(path: string): Promise<T> => JSON.parse(await readFile(new URL(`../../curricula/DE/Gymnasium/${path}`, import.meta.url), 'utf8'))
const physicsLandscape = await read<SkillLandscape>('canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json')
const mathematicsLandscape = await read<SkillLandscape>('canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json')
const canonical = prepareLandscapeEntries([mathematicsLandscape, physicsLandscape])
const canonicalSnapshot = JSON.stringify(canonical)
const input = (views: CompositionView[]) => {
  const projected = normalizeLearnerProjectedEntries(views.reduce<LandscapeEntry[]>((entries, view) =>
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
  return { rootGoals, goalIndexAll, visibleGoalIds, visibleChildrenByParent,
    canonicalGoalIndexAll: new Map(canonical.flatMap(landscape => landscape.goals).map(goal => [goal.id, goal])) }
}
let checked = 0
for (const scope of ['', '-g8', '-g9', '-sekii']) for (const course of ['gk', 'lk'] as const) {
  const filename = scope === '-sekii' ? `de-he-sekii-${course}` : `de-he-${course}${scope}`
  const view = await read<CompositionView>(`composition-views/physik/${filename}.view.json`)
  // Check the ordinary course and the native combined course projection identity.
  for (const merged of [false, true]) {
    const selected = structuredClone(view)
    if (merged) selected.viewId = `merged:${view.viewId.replace(/-gk(?=-|$)/u, '-lk')}+${view.viewId.replace(/-lk(?=-|$)/u, '-gk')}`
    const value = input([selected])
    const preview = deriveLearnerUnitMapPreview({ ...value, landscapeSources: canonical })
    const original = filterLearnerUnitMapToSubjects(buildLearnerUnitMapProjection({ ...value,
      units: preview.units, after: preview.after, memberUnits: preview.memberUnits }), new Set([physics]))
    const snapshot = JSON.stringify(original)
    const treeChildren = buildSortedChildrenMap(value.visibleChildrenByParent, value.goalIndexAll, 'learner', original, materials)
    for (const material of materials.filter(item => item.guidedStudyOrder)) {
      const scopes = findUnitMaterialScopes(material, original, value.goalIndexAll, value.visibleGoalIds)
      assert.equal(scopes.size, 1, filename)
      const [scopeId] = scopes
      const assessments = buildUnitAssessmentActions(material, original, value.goalIndexAll, value.visibleGoalIds, 'de', scopes)
      const placed = placeUnitLearningResources(original, unitResourcePlacements({ material, scopes, flashcards: new Map(), assessments }))
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
      const deck = await read<{ deckId: string; cards: { id: string; tags?: string[] }[] }>(`memory-decks/de_gymnasium_physics_flashcards_mechanics_ephase.${language}.json`)
      assert.equal(deck.deckId, 'de_gymnasium_physics_mechanics_ephase')
      assert.equal(deck.cards.length, 87)
      const actions = buildUnitFlashcardActions(practiceMaterial, original, value.goalIndexAll, value.visibleGoalIds, deck.cards, language)
      const assessments = buildUnitAssessmentActions(practiceMaterial, original, value.goalIndexAll, value.visibleGoalIds, language)
      assert.equal(assessments.size, 1, 'E.1 keeps a direct named link to its one canonical assessment')
      const examAction = [...assessments.values()][0]
      assert.equal(examAction.goalId, examId)
      assert.equal(examAction.title, `${language === 'de' ? 'Prüfung' : 'Assessment'}: ${value.goalIndexAll.get(examId)!.title}`)
      const place = (flashcards: typeof actions, exams: typeof assessments) =>
        placeUnitLearningResources(original, unitResourcePlacements({ scopes: e1Scopes, flashcards, assessments: exams }))
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
      if (scope === '') assert.equal(selectedCards.length, 9, 'The duration-neutral E.1 topic offers its nine cards')
      assert(selectedCards.length > 0 && selectedCards.length < deck.cards.length, 'E.1 is a strict subset of the original deck')
      assert.equal(new Set(selectedCards.map(card => card.id)).size, selectedCards.length)
      for (const card of selectedCards) assert(card.tags?.some(tag => e1.goalIds!.some(id => tag === `goal:${id}`)))
      assert(!selectedCards.some(card => card.tags?.includes('goal:5c44b9ba-9b05-4774-95d5-073230d3fc4f')), 'unrelated mechanics cards cannot pass through broad GK/LK tags')
      for (const action of actions.values()) for (const goalId of action.goalIds ?? []) {
        assert(value.visibleGoalIds.has(goalId))
        assert.equal(value.goalIndexAll.get(goalId)?.landscapeId, physics, 'topic membership excludes Mathematics preparation')
      }
      const noVisibleMemory = new Set(value.visibleGoalIds)
      noVisibleMemory.delete(memoryId)
      assert.equal(buildUnitFlashcardActions(practiceMaterial, original, value.goalIndexAll, noVisibleMemory, deck.cards, language).size, 0)
      const noTopicCards = buildUnitFlashcardActions(practiceMaterial, original, value.goalIndexAll, value.visibleGoalIds, [], language)
      assert(!place(noTopicCards, assessments).entries[e1ScopeId].children?.includes(memoryId))
      assert.equal(noTopicCards.size, 1,
        'a topic with no matching card offers no empty drill; the full deck remains accessible')
      const children = new Map(Object.values(original.entries).map(entry => [entry.id, entry.children ?? []]))
      const progressGoals = new Map(Object.keys(original.entries).map(id => [id, value.goalIndexAll.get(id)
        ?? { id, type: 'cluster' as const, contains: [], weight: 1 } as never]))
      const progress = buildTreeCompletionProgressMap(progressGoals, children, id => id === memoryId ? 1 : 0, new Map())
      const phaseId = [...actions.keys()][0]
      assert((progress.get(phaseId)?.explicitCount ?? 0) >= 1, 'the original memory goal still contributes to phase progress')
      assert.equal(JSON.stringify(original), snapshot, 'map actions do not mutate the original completion/demand fixture')
      checked++
    }
  }
}
assert.equal(JSON.stringify(canonical), canonicalSnapshot, 'source goals and learner results remain untouched')
for (const duration of ['g8', 'g9']) {
  const value = input([await read<CompositionView>(`composition-views/mathematik/de-he-gk-${duration}.view.json`),
    await read<CompositionView>(`composition-views/physik/de-he-gk-${duration}.view.json`)])
  const preview = deriveLearnerUnitMapPreview(value)
  const fixture = buildLearnerUnitMapProjection({ ...value, units: preview.units, after: preview.after, memberUnits: preview.memberUnits })
  const cards = (await read<{ cards: { tags?: string[] }[] }>('memory-decks/de_gymnasium_physics_flashcards_mechanics_ephase.de.json')).cards
  const combined = buildUnitFlashcardActions(practiceMaterial, fixture, value.goalIndexAll, value.visibleGoalIds, cards, 'de')
  const phase = [...combined].find(([, action]) => action.goalIds === undefined)
  assert(phase && fixture.entries[phase[0]].subjects?.includes(math) && fixture.entries[phase[0]].subjects?.includes(physics),
    'a combined Mathematics/Physics E phase keeps its Physics practice action through the real scope alias')
  const mathOnly = filterLearnerUnitMapToSubjects(fixture, new Set([math]))
  assert.equal(findUnitMaterialScopes(practiceMaterial, mathOnly, value.goalIndexAll, value.visibleGoalIds).size, 0,
    'a Mathematics-only board cannot offer the Physics E.1 introduction or exercises')
  assert.equal(buildUnitFlashcardActions(practiceMaterial, mathOnly, value.goalIndexAll, value.visibleGoalIds, cards, 'de').size, 0,
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
  const action = buildUnitFlashcardActions(material, fixture, value.goalIndexAll, value.visibleGoalIds, cards, 'de').get(topic.id)
  assert(action?.goalIds?.includes(atomicId) && action.goalId === memory.id)
  assert.equal(selectPracticeCards(cards, undefined, action.goalIds).length, 27, 'larger subdecks remain available in full')
  assert.equal(buildUnitAssessmentActions(material, fixture, value.goalIndexAll, value.visibleGoalIds, 'de').size, 0)
  const deckless = { ...material, unit }
  assert.deepEqual([...findUnitMaterialScopes(deckless, fixture, value.goalIndexAll, value.visibleGoalIds)], [topic.id])
  assert.equal(buildUnitFlashcardActions(deckless, fixture, value.goalIndexAll, value.visibleGoalIds, cards, 'de').size, 0)
  const wrong = { ...material, unit: { ...material.unit, viewIds: ['some-other-view'] } }
  assert.equal(findUnitMaterialScopes(wrong, fixture, value.goalIndexAll, value.visibleGoalIds).size, 0)
  assert.equal(buildUnitFlashcardActions(wrong, fixture, value.goalIndexAll, value.visibleGoalIds, cards, 'de').size, 0)
}
assert.deepEqual(packageMaterials, [], 'the package-consumer edition supplies no repository-specific E.1 materials')
assert.deepEqual(selectPracticeCards([{ tags: ['GK', 'goal:a'] }, { tags: ['LK', 'goal:b'] }], ['GK'], ['b']), [], 'course and topic selection are intersected')
assert.deepEqual(selectPracticeCards([{ tags: ['goal:a'] }], undefined, []), [], 'an empty topic cannot accidentally open the full deck')
console.log(`Hessen Physics flashcard actions passed ${checked} real course/duration/language projections.`)
