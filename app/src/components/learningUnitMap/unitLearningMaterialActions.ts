import { isUnitMaterialSource } from '../../utils/unitLearningMaterial'
import type { UiGoal } from '../../goalTypes'
import { getSrsFilterTagsForGoal } from '../../utils/srsTags'
import { selectPracticeCards, type FlashcardPracticeRequest } from '../../utils/flashcardPractice'
import type { MemoryCardOriginFields } from '../../utils/memoryCardOrigins'
import { projectUnitStudyRecommendations, type UnitStudyOrder } from '../../utils/unitStudyOrder'
import type { LearningMapFixture, LearningMapRelation, LearningMapRequirement, MapPracticeMaterial } from './types'
export function findUnitMaterialScopes(
  material: MapPracticeMaterial, fixture: LearningMapFixture, goalIndex: ReadonlyMap<string, UiGoal>, visibleGoalIds: ReadonlySet<string>,
): Set<string> {
  const scopes = new Set<string>()
  for (const goal of goalIndex.values()) {
    if (!isUnitMaterialSource(material, goal) || !visibleGoalIds.has(goal.id)) continue
    const path = fixture.entryPaths?.[goal.id]
    const scopeId = fixture.entries[goal.id] ? goal.id : path?.slice(0, -1).at(-1)
    if (scopeId && fixture.entries[scopeId]?.kind === 'unit'
      && (fixture.entries[scopeId].subjects ?? [material.unit.landscapeId]).includes(material.unit.landscapeId)) scopes.add(scopeId)
  }
  return scopes
}

/** The topic can reference the phase assessment when it is visible in the learner's projection. */
export function buildUnitAssessmentActions(
  material: MapPracticeMaterial, fixture: LearningMapFixture, goalIndex: ReadonlyMap<string, UiGoal>, visibleGoalIds: ReadonlySet<string>, language: 'de' | 'en',
  scopes?: ReadonlySet<string>,
): ReadonlyMap<string, { goalId: string; title: string }> {
  const actions = new Map<string, { goalId: string; title: string }>()
  const goalId = material.unit.assessmentGoalId
  if (!goalId) return actions
  const assessment = goalIndex.get(goalId)
  if (!visibleGoalIds.has(goalId) || !assessment || assessment.landscapeId !== material.unit.landscapeId || fixture.entries[goalId]?.kind !== 'assessment') return actions
  for (const scopeId of scopes ?? findUnitMaterialScopes(material, fixture, goalIndex, visibleGoalIds)) {
    actions.set(scopeId, { goalId,
      title: `${language === 'en' ? 'Assessment' : 'Prüfung'}: ${assessment.title}` })
  }
  return actions
}

/** Deck goals of the map that can offer card practice: visible learner targets, not prerequisite closure additions. */
export function mapDeckGoalIds(fixture: LearningMapFixture, visibleGoalIds: ReadonlySet<string>): string[] {
  return Object.values(fixture.entries).flatMap(entry => entry.kind === 'memory' && !entry.preparation
    && visibleGoalIds.has(entry.id) ? [entry.id] : [])
}

/**
 * Card practice of one deck goal on the learner map (#85), derived like the
 * backend's unit cards: a unit offers the deck's cards whose understanding
 * goals are atomic content goals of the unit at any depth. A unit material
 * file is no condition. On its own board the deck node offers the full deck
 * once the deck offers unit practice, otherwise it stays an ordinary goal;
 * the boards above reach the deck through that board and get no second copy.
 * Which of these cards are released is the server's decision, shown by the
 * drill: the map has no card state.
 *
 * Presentation only: goals, prerequisite demand and completion continue to use the original fixture.
 */
export function buildUnitFlashcardActions(
  memoryId: string, fixture: LearningMapFixture, goalIndex: ReadonlyMap<string, UiGoal>, visibleGoalIds: ReadonlySet<string>,
  cards: readonly MemoryCardOriginFields[] | undefined, language: 'de' | 'en',
): ReadonlyMap<string, FlashcardPracticeRequest> {
  const memoryGoal = goalIndex.get(memoryId)
  const memoryEntry = fixture.entries[memoryId]
  const homePath = fixture.entryPaths?.[memoryId]
  const deckHome = homePath?.at(-2)
  if (!cards || !memoryGoal || !visibleGoalIds.has(memoryId) || memoryEntry?.kind !== 'memory' || memoryEntry.preparation
    || !homePath || !deckHome || !fixture.entries[deckHome]?.children?.includes(memoryId)) return new Map()
  const filterTags = getSrsFilterTagsForGoal(memoryGoal)
  const deckBoards = new Set(homePath.slice(0, -1))
  const contentGoals = new Map<string, string[]>()
  // Atomic content goals of the deck's subject; assessments, decks, orientations and preparation entries are none.
  const collect = (id: string): string[] => {
    const known = contentGoals.get(id)
    if (known) return known
    const entry = fixture.entries[id]
    const own = entry?.kind === 'goal' && !entry.preparation && visibleGoalIds.has(id)
      && goalIndex.get(id)?.landscapeId === memoryGoal.landscapeId ? [id] : []
    const goalIds = [...own, ...(entry?.children ?? []).flatMap(collect)]
    contentGoals.set(id, goalIds)
    return goalIds
  }
  const practiceTitle = (topic: string) => language === 'en' ? `Practice flashcards for ${topic}` : `Lernkarten zu ${topic} üben`
  const units = new Map<string, FlashcardPracticeRequest>()
  const visit = (id: string) => {
    const entry = fixture.entries[id]
    if (!entry) return
    if (entry.kind === 'unit' && !deckBoards.has(id)) {
      const goalIds = collect(id)
      if (goalIds.length && selectPracticeCards(cards, filterTags, goalIds).length) {
        const topic = /^\p{L}+\.\d+(?=\s)/u.exec(entry.title)?.[0] ?? entry.title
        units.set(id, { goalId: memoryId, goalIds, title: practiceTitle(topic) })
      }
    }
    for (const child of entry.children ?? []) visit(child)
  }
  visit(fixture.rootId)
  if (!units.size) return units
  return new Map([[deckHome, { goalId: memoryId,
    title: language === 'en' ? 'Practice the full deck' : 'Gesamten Lernkartenstapel üben' }], ...units])
}

/** The deck goals that offer card practice on each board, per board in deck order. */
export function cardDeckIdsByScope(
  actionsByDeck: ReadonlyMap<string, ReadonlyMap<string, FlashcardPracticeRequest>>,
): ReadonlyMap<string, readonly string[]> {
  const result = new Map<string, string[]>()
  for (const [deckId, actions] of actionsByDeck) {
    for (const scopeId of actions.keys()) result.set(scopeId, [...(result.get(scopeId) ?? []), deckId])
  }
  return result
}

interface UnitResourcePlacement extends UnitStudyOrder {
  scopeId: string
  goalIds: readonly string[]
}

export function unitResourcePlacements({ material, scopes, cardDeckIds, assessments }: {
  material?: MapPracticeMaterial
  scopes: ReadonlySet<string>
  /** Deck goals offering card practice per board (`cardDeckIdsByScope`); a deck already on the board stays where it is. */
  cardDeckIds?: ReadonlyMap<string, readonly string[]>
  assessments: ReadonlyMap<string, { goalId: string }>
}): UnitResourcePlacement[] {
  return [...scopes].flatMap(scopeId => {
    const goalIds = [...(cardDeckIds?.get(scopeId) ?? []), ...[assessments.get(scopeId)].flatMap(action => action ? [action.goalId] : [])]
    const orientationGoalId = material?.unit.orientationGoalId
    const { guidedStudyOrder, studyRecommendations } = material ?? {}
    return goalIds.length || orientationGoalId || studyRecommendations?.length
      ? [{ scopeId, goalIds, orientationGoalId, guidedStudyOrder, studyRecommendations }]
      : []
  })
}

/** Place additional references on the topic board. The source tree remains the owner of every result. */
export function placeUnitLearningResources(fixture: LearningMapFixture, placements: readonly UnitResourcePlacement[]): LearningMapFixture {
  if (!placements.length) return fixture
  const entries = { ...fixture.entries }
  const scopeRelations = { ...fixture.scopeRelations }
  const scopeContext = { ...fixture.scopeContext }
  for (const { scopeId, goalIds, orientationGoalId, guidedStudyOrder, studyRecommendations } of placements) {
    if (studyRecommendations?.length && fixture.entries[scopeId]) {
      const recommendations = projectUnitStudyRecommendations(scopeId, studyRecommendations,
        id => fixture.entries[id].children?.filter(child => !!fixture.entries[child]))
      for (const [board, pairs] of recommendations) {
        const entry = entries[board]
        entries[board] = { ...entry, studyRecommendations: [...entry.studyRecommendations ?? [], ...pairs] }
      }
    }
    const scope = entries[scopeId]
    if (!scope) continue
    const resources = goalIds.filter(id => entries[id] && !scope.children?.includes(id))
    const children = scope.children ?? []
    const start = orientationGoalId && scope.kind === 'unit' && children.includes(orientationGoalId)
      && ['goal', 'motivation'].includes(entries[orientationGoalId]?.kind) ? orientationGoalId : undefined
    if (!resources.length && !start && !guidedStudyOrder?.some(id => children.includes(id))) continue
    entries[scopeId] = {
      ...scope,
      ...(start && { orientationGoalId: start }),
      guidedStudyOrder: guidedStudyOrder ?? scope.guidedStudyOrder,
      children: start ? [start, ...children.filter(id => id !== start), ...resources] : [...children, ...resources],
    }
    if (!resources.length) continue
    const relations = [...(scopeRelations[scopeId] ?? [])]
    const context = { ...scopeContext[scopeId] }
    for (const target of resources) {
      const incoming = new Map<string, LearningMapRelation>()
      const outside: LearningMapRequirement[] = []
      for (const requirement of fixture.getRequirementContext?.(target) ?? []) {
        const hidden: string[] = []
        for (const atom of requirement.sourceGoalIds) {
          const path = fixture.entryPaths?.[atom] ?? []
          const depth = path.indexOf(scopeId)
          const source = resources.includes(atom) ? atom : depth >= 0 ? path[depth + 1] : undefined
          if (!source || !entries[scopeId].children?.includes(source)) { hidden.push(atom); continue }
          const relation: LearningMapRelation = incoming.get(source) ?? { source, target, kind: 'requirement', provenance: [] }
          if (source !== atom || source !== requirement.requiredGoalId || requirement.inherited) relation.kind = 'summary'
          relation.provenance.push({ ...requirement, sourceGoalIds: [atom] })
          incoming.set(source, relation)
        }
        if (hidden.length || !requirement.sourceGoalIds.length || requirement.unresolved) outside.push({ ...requirement, sourceGoalIds: hidden })
      }
      relations.push(...incoming.values())
      if (outside.length) context[target] = outside
    }
    scopeRelations[scopeId] = relations
    scopeContext[scopeId] = context
  }
  return { ...fixture, entries, scopeRelations, scopeContext }
}
