import type { UiGoal } from '../../goalTypes'
import { selectPracticeCards, type FlashcardPracticeRequest } from '../../utils/flashcardPractice'
import type { LearningMapFixture } from './types'
import {
  HESSE_PHYSICS_E_MEMORY_GOAL_ID, HESSE_PHYSICS_E1_ASSESSMENT_GOAL_ID,
  HESSE_PHYSICS_PRACTICE_VIEW_IDS as viewIds, PHYSICS_LANDSCAPE_ID,
} from './learnerUnitMapPreviewSubjects'

export { HESSE_PHYSICS_E_MEMORY_GOAL_ID, HESSE_PHYSICS_E1_ASSESSMENT_GOAL_ID }
const isHesseView = (value: unknown) => typeof value === 'string'
  && (viewIds.has(value) || value.startsWith('merged:') && value.slice(7).split('+').every(id => viewIds.has(id)))

/** A named shortcut to the one visible assessment; its task and placement stay canonical. */
export function buildHessePhysicsE1AssessmentActions(
  fixture: LearningMapFixture, goalIndex: ReadonlyMap<string, UiGoal>, visibleGoalIds: ReadonlySet<string>, language: 'de' | 'en',
): ReadonlyMap<string, { goalId: string; title: string }> {
  const actions = new Map<string, { goalId: string; title: string }>()
  const goalId = HESSE_PHYSICS_E1_ASSESSMENT_GOAL_ID
  if (!goalId) return actions
  const assessment = goalIndex.get(goalId)
  if (!visibleGoalIds.has(goalId) || !assessment || !fixture.entries[goalId]) return actions
  for (const goal of goalIndex.values()) {
    if (goal.landscapeId !== PHYSICS_LANDSCAPE_ID || goal.extendedData?.compositionNodeId !== 'physics-e1-motion'
      || !isHesseView(goal.extendedData.compositionViewId) || !visibleGoalIds.has(goal.id)) continue
    const path = fixture.entryPaths?.[goal.id]
    const scopeId = fixture.entries[goal.id] ? goal.id : path?.slice(0, -1).at(-1)
    if (scopeId && fixture.entries[scopeId]?.kind === 'unit') actions.set(scopeId, { goalId,
      title: `${language === 'en' ? 'Assessment' : 'Prüfung'}: ${assessment.title}` })
  }
  return actions
}

/** Presentation only: goals, prerequisite demand and completion continue to use the original fixture. */
export function buildHessePhysicsFlashcardActions<T extends LearningMapFixture>(
  fixture: T, goalIndex: ReadonlyMap<string, UiGoal>, visibleGoalIds: ReadonlySet<string>,
  cards: readonly { tags?: string[] }[] | undefined, language: 'de' | 'en',
): { fixture: T; actions: ReadonlyMap<string, FlashcardPracticeRequest> } {
  const actions = new Map<string, FlashcardPracticeRequest>()
  const memoryId = HESSE_PHYSICS_E_MEMORY_GOAL_ID
  if (!memoryId || !visibleGoalIds.has(memoryId) || !fixture.entries[memoryId]) return { fixture, actions }
  const ePhase = [...goalIndex.values()].find(goal => goal.landscapeId === PHYSICS_LANDSCAPE_ID
    && goal.extendedData?.compositionNodeId === 'physics-e-phase'
    && isHesseView(goal.extendedData.compositionViewId) && visibleGoalIds.has(goal.id))
  if (!ePhase) return { fixture, actions }
  // A shared Mathematics/Physics phase can have a synthetic entry. The alias
  // path identifies its real board without relying on translated labels.
  const phasePath = fixture.entryPaths?.[ePhase.id]
  const phaseId = fixture.entries[ePhase.id] ? ePhase.id : phasePath?.slice(0, -1).at(-1)
  if (!phaseId || !fixture.entries[phaseId]) return { fixture, actions }
  const memoryPath = fixture.entryPaths?.[memoryId]
  if (!memoryPath?.includes(phaseId)) return { fixture, actions }
  actions.set(phaseId, { goalId: memoryId,
    title: language === 'en' ? 'Practice flashcards for the E phase' : 'Lernkarten zur E-Phase üben' })
  const visit = (id: string) => {
    const entry = fixture.entries[id]
    if (!entry) return
    if (id !== phaseId && entry.kind === 'unit') {
      const goalIds: string[] = []
      const collect = (childId: string) => {
        const child = fixture.entries[childId]
        if (!child) return
        const goal = goalIndex.get(childId)
        if (visibleGoalIds.has(childId) && goal?.landscapeId === PHYSICS_LANDSCAPE_ID
          && child.kind === 'goal') goalIds.push(childId)
        for (const descendant of child.children ?? []) collect(descendant)
      }
      collect(id)
      if (cards && selectPracticeCards(cards, undefined, goalIds).length) {
        const topicCode = /^E\.\d+/u.exec(entry.title)?.[0]
        const topic = topicCode ?? entry.title
        actions.set(id, { goalId: memoryId, goalIds,
          title: language === 'en' ? `Practice flashcards for ${topic}` : `Lernkarten zu ${topic} üben` })
      }
    }
    for (const child of entry.children ?? []) visit(child)
  }
  visit(phaseId)
  // The original node remains in the tree and completion calculation. Only its
  // map representation becomes the phase action; no duplicate deck is authored.
  const entries = Object.fromEntries(Object.entries(fixture.entries).filter(([id]) => id !== memoryId)
    .map(([id, entry]) => [id, { ...entry, children: entry.children?.filter(child => child !== memoryId) }]))
  const scopeRelations = Object.fromEntries(Object.entries(fixture.scopeRelations ?? {})
    .map(([id, relations]) => [id, relations.filter(relation => relation.source !== memoryId && relation.target !== memoryId)]))
  return { fixture: { ...fixture, entries, scopeRelations }, actions }
}
