import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { prepareLandscapeEntries, type LandscapeEntry } from '../src/hooks/useLandscapes'
import type { SkillLandscape } from '../src/landscapeTypes'
import type { CompositionView } from '../src/utils/authoring/compositionViewAuthoring'
import { applyCompositionViewProjection } from '../src/utils/compositionViewRuntime'
import { collapseLearnerSubjectRoots, normalizeLearnerProjectedEntries } from '../src/utils/learnerTreeProjection'
import { buildDirectChildrenMap } from '../src/utils/treeProjectionRuntime'
import { buildTreeCompletionProgressMap } from '../src/utils/treeCompletionProgress'
import { selectPracticeCards } from '../src/utils/flashcardPractice'
import { getSrsFilterTagsForGoal } from '../src/utils/srsTags'
import { buildLearnerUnitMapProjection, filterLearnerUnitMapToSubjects } from '../src/components/learningUnitMap/learnerUnitMapProjection'
import { deriveLearnerUnitMapPreview, MATHEMATICS_LANDSCAPE_ID as math, PHYSICS_LANDSCAPE_ID as physics } from '../src/components/learningUnitMap/learnerUnitMapPreview'
import { buildHessePhysicsE1AssessmentActions, buildHessePhysicsFlashcardActions, findHessePhysicsE1Scopes, placeHessePhysicsE1Resources,
  HESSE_PHYSICS_E_MEMORY_GOAL_ID as memoryId, HESSE_PHYSICS_E1_ASSESSMENT_GOAL_ID as examId } from '../src/components/learningUnitMap/hessePhysicsFlashcardActions'
import { HESSE_PHYSICS_E1_PRACTICE as packagePractice } from '../src/packageConsumer/learnerUnitMapPreviewSubjects'
import { HESSE_PHYSICS_E1_PRACTICE as practiceMaterial } from '../src/components/learningUnitMap/learnerUnitMapPreviewSubjects'

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
    const e1Scopes = findHessePhysicsE1Scopes(original, value.goalIndexAll, value.visibleGoalIds)
    assert.equal(e1Scopes.size, 1)
    const [e1ScopeId] = e1Scopes
    for (const exercise of practiceMaterial.exercises) {
      assert(original.entries[e1ScopeId].children?.includes(exercise.goalId), `${filename}: ${exercise.goalId} must be on its E.1 board`)
    }
    for (const language of ['de', 'en'] as const) {
      const deck = await read<{ deckId: string; cards: { id: string; tags?: string[] }[] }>(`memory-decks/de_gymnasium_physics_flashcards_mechanics_ephase.${language}.json`)
      assert.equal(deck.deckId, 'de_gymnasium_physics_mechanics_ephase')
      assert.equal(deck.cards.length, 87)
      const actions = buildHessePhysicsFlashcardActions(original, value.goalIndexAll, value.visibleGoalIds, deck.cards, language)
      const assessments = buildHessePhysicsE1AssessmentActions(original, value.goalIndexAll, value.visibleGoalIds, language)
      assert.equal(assessments.size, 1, 'E.1 keeps a direct named link to its one canonical assessment')
      const examAction = [...assessments.values()][0]
      assert.equal(examAction.goalId, examId)
      assert.equal(examAction.title, `${language === 'de' ? 'Prüfung' : 'Assessment'}: ${value.goalIndexAll.get(examId)!.title}`)
      const placed = placeHessePhysicsE1Resources(original, e1Scopes, actions, assessments)
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
      const hiddenAssessment = buildHessePhysicsE1AssessmentActions(original, value.goalIndexAll, withoutExam, language)
      assert.equal(hiddenAssessment.size, 0)
      assert(!placeHessePhysicsE1Resources(original, e1Scopes, actions, hiddenAssessment).entries[e1ScopeId].children?.includes(examId))
      assert(placed.entries[original.entryPaths![examId].at(-2)!].children?.includes(examId), 'the assessment keeps its original phase placement')
      const phase = [...actions.values()].find(action => action.goalIds === undefined)
      assert.equal(phase?.title, language === 'de' ? 'Lernkarten zur E-Phase üben' : 'Practice flashcards for the E phase')
      assert.equal(phase.goalId, memoryId)
      assert.equal(placed.entries[memoryId], original.entries[memoryId], 'the same full deck remains a real goal on the E phase board')
      assert(placed.entries[original.entryPaths![memoryId].at(-2)!].children?.includes(memoryId))
      assert(value.goalIndexAll.has(memoryId) && value.visibleGoalIds.has(memoryId), 'the original memory goal stays a visible learner target')
      const e1 = [...actions.values()].find(action => action.title === (language === 'de' ? 'Lernkarten zu E.1 üben' : 'Practice flashcards for E.1'))
      assert(e1?.goalIds?.length, `${filename}: E.1 has an actual practice action`)
      const selectedCards = selectPracticeCards(deck.cards, getSrsFilterTagsForGoal(value.goalIndexAll.get(memoryId)!), e1.goalIds)
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
      assert.equal(buildHessePhysicsFlashcardActions(original, value.goalIndexAll, noVisibleMemory, deck.cards, language).size, 0)
      const noTopicCards = buildHessePhysicsFlashcardActions(original, value.goalIndexAll, value.visibleGoalIds, [], language)
      assert(!placeHessePhysicsE1Resources(original, e1Scopes, noTopicCards, assessments).entries[e1ScopeId].children?.includes(memoryId))
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
  const combined = buildHessePhysicsFlashcardActions(fixture, value.goalIndexAll, value.visibleGoalIds, cards, 'de')
  const phase = [...combined].find(([, action]) => action.goalIds === undefined)
  assert(phase && fixture.entries[phase[0]].subjects?.includes(math) && fixture.entries[phase[0]].subjects?.includes(physics),
    'a combined Mathematics/Physics E phase keeps its Physics practice action through the real scope alias')
  const mathOnly = filterLearnerUnitMapToSubjects(fixture, new Set([math]))
  assert.equal(findHessePhysicsE1Scopes(mathOnly, value.goalIndexAll, value.visibleGoalIds).size, 0,
    'a Mathematics-only board cannot offer the Physics E.1 introduction or exercises')
  assert.equal(buildHessePhysicsFlashcardActions(mathOnly, value.goalIndexAll, value.visibleGoalIds, cards, 'de').size, 0,
    'hiding Physics removes its action from a shared phase')
}
assert.equal(packagePractice, undefined, 'the package-consumer edition supplies no repository-specific E.1 materials')
assert.deepEqual(selectPracticeCards([{ tags: ['GK', 'goal:a'] }, { tags: ['LK', 'goal:b'] }], ['GK'], ['b']), [], 'course and topic selection are intersected')
assert.deepEqual(selectPracticeCards([{ tags: ['goal:a'] }], undefined, []), [], 'an empty topic cannot accidentally open the full deck')
console.log(`Hessen Physics flashcard actions passed ${checked} real course/duration/language projections.`)
