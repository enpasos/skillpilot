import type { UiGoal } from '../../goalTypes'
import { getSrsFilterTagsForGoal } from '../../utils/srsTags'
import { selectPracticeCards, type FlashcardPracticeRequest } from '../../utils/flashcardPractice'
import type { LearningMapFixture, LearningMapRelation, LearningMapRequirement } from './types'
import {
  HESSE_PHYSICS_E_MEMORY_GOAL_ID, HESSE_PHYSICS_E1_ASSESSMENT_GOAL_ID,
  HESSE_PHYSICS_PRACTICE_VIEW_IDS as viewIds, HESSE_PHYSICS_E1_PRACTICE, PHYSICS_LANDSCAPE_ID,
} from './learnerUnitMapPreviewSubjects'

export { HESSE_PHYSICS_E_MEMORY_GOAL_ID, HESSE_PHYSICS_E1_ASSESSMENT_GOAL_ID }
const isHesseView = (value: unknown) => typeof value === 'string'
  && (viewIds.has(value) || value.startsWith('merged:') && value.slice(7).split('+').every(id => viewIds.has(id)))

export function findHessePhysicsE1Scopes(
  fixture: LearningMapFixture, goalIndex: ReadonlyMap<string, UiGoal>, visibleGoalIds: ReadonlySet<string>,
): Set<string> {
  const scopes = new Set<string>()
  if (!HESSE_PHYSICS_E1_PRACTICE) return scopes
  for (const goal of goalIndex.values()) {
    if (goal.landscapeId !== PHYSICS_LANDSCAPE_ID
      || goal.extendedData?.compositionNodeId !== HESSE_PHYSICS_E1_PRACTICE.unit.compositionNodeId
      || !isHesseView(goal.extendedData.compositionViewId) || !visibleGoalIds.has(goal.id)) continue
    const path = fixture.entryPaths?.[goal.id]
    const scopeId = fixture.entries[goal.id] ? goal.id : path?.slice(0, -1).at(-1)
    if (scopeId && fixture.entries[scopeId]?.kind === 'unit') scopes.add(scopeId)
  }
  return scopes
}

/** The topic can reference the phase assessment when it is visible in the learner's projection. */
export function buildHessePhysicsE1AssessmentActions(
  fixture: LearningMapFixture, goalIndex: ReadonlyMap<string, UiGoal>, visibleGoalIds: ReadonlySet<string>, language: 'de' | 'en',
  scopes?: ReadonlySet<string>,
): ReadonlyMap<string, { goalId: string; title: string }> {
  const actions = new Map<string, { goalId: string; title: string }>()
  const goalId = HESSE_PHYSICS_E1_ASSESSMENT_GOAL_ID
  if (!goalId) return actions
  const assessment = goalIndex.get(goalId)
  if (!visibleGoalIds.has(goalId) || !assessment || !fixture.entries[goalId]) return actions
  for (const scopeId of scopes ?? findHessePhysicsE1Scopes(fixture, goalIndex, visibleGoalIds)) {
    actions.set(scopeId, { goalId,
      title: `${language === 'en' ? 'Assessment' : 'Prüfung'}: ${assessment.title}` })
  }
  return actions
}

/** Presentation only: goals, prerequisite demand and completion continue to use the original fixture. */
export function buildHessePhysicsFlashcardActions(
  fixture: LearningMapFixture, goalIndex: ReadonlyMap<string, UiGoal>, visibleGoalIds: ReadonlySet<string>,
  cards: readonly { tags?: string[] }[] | undefined, language: 'de' | 'en',
): ReadonlyMap<string, FlashcardPracticeRequest> {
  const actions = new Map<string, FlashcardPracticeRequest>()
  const memoryId = HESSE_PHYSICS_E_MEMORY_GOAL_ID
  const memoryGoal = goalIndex.get(memoryId)
  if (!memoryGoal || !visibleGoalIds.has(memoryId) || !fixture.entries[memoryId]) return actions
  const filterTags = getSrsFilterTagsForGoal(memoryGoal)
  const ePhase = [...goalIndex.values()].find(goal => goal.landscapeId === PHYSICS_LANDSCAPE_ID
    && goal.extendedData?.compositionNodeId === 'physics-e-phase'
    && isHesseView(goal.extendedData.compositionViewId) && visibleGoalIds.has(goal.id))
  if (!ePhase) return actions
  // A shared Mathematics/Physics phase can have a synthetic entry. The alias
  // path identifies its real board without relying on translated labels.
  const phasePath = fixture.entryPaths?.[ePhase.id]
  const phaseId = fixture.entries[ePhase.id] ? ePhase.id : phasePath?.slice(0, -1).at(-1)
  if (!phaseId || !fixture.entries[phaseId]) return actions
  const memoryPath = fixture.entryPaths?.[memoryId]
  if (!memoryPath?.includes(phaseId)) return actions
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
      if (cards && selectPracticeCards(cards, filterTags, goalIds).length) {
        const topicCode = /^E\.\d+/u.exec(entry.title)?.[0]
        const topic = topicCode ?? entry.title
        actions.set(id, { goalId: memoryId, goalIds,
          title: language === 'en' ? `Practice flashcards for ${topic}` : `Lernkarten zu ${topic} üben` })
      }
    }
    for (const child of entry.children ?? []) visit(child)
  }
  visit(phaseId)
  return actions
}

/** Place additional references on the topic board. The source tree remains the owner of every result. */
export function placeHessePhysicsE1Resources(
  fixture: LearningMapFixture, scopes: ReadonlySet<string>, flashcards: ReadonlyMap<string, FlashcardPracticeRequest>,
  assessments: ReadonlyMap<string, { goalId: string }>,
): LearningMapFixture {
  if (!scopes.size) return fixture
  const entries = { ...fixture.entries }
  const scopeRelations = { ...fixture.scopeRelations }
  const scopeContext = { ...fixture.scopeContext }
  for (const scopeId of scopes) {
    const scope = entries[scopeId]
    if (!scope) continue
    const resources = [flashcards.get(scopeId)?.goalId, assessments.get(scopeId)?.goalId].filter(
      (id): id is string => !!id && !!entries[id] && !scope.children?.includes(id))
    if (!resources.length) continue
    entries[scopeId] = { ...scope, children: [...(scope.children ?? []), ...resources] }
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
