import { isUnitMaterialSource } from '../../utils/unitLearningMaterial'
import type { UiGoal } from '../../goalTypes'
import { getSrsFilterTagsForGoal } from '../../utils/srsTags'
import { selectPracticeCards, type FlashcardPracticeRequest } from '../../utils/flashcardPractice'
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

/** Presentation only: goals, prerequisite demand and completion continue to use the original fixture. */
export function buildUnitFlashcardActions(
  material: MapPracticeMaterial, fixture: LearningMapFixture, goalIndex: ReadonlyMap<string, UiGoal>, visibleGoalIds: ReadonlySet<string>,
  cards: readonly { tags?: string[] }[] | undefined, language: 'de' | 'en',
  scopes = findUnitMaterialScopes(material, fixture, goalIndex, visibleGoalIds),
): ReadonlyMap<string, FlashcardPracticeRequest> {
  const actions = new Map<string, FlashcardPracticeRequest>()
  const memoryId = material.unit.flashcardGoalId
  if (!memoryId || !scopes.size) return actions
  const memoryGoal = goalIndex.get(memoryId)
  if (memoryGoal?.landscapeId !== material.unit.landscapeId || !visibleGoalIds.has(memoryId)
    || fixture.entries[memoryId]?.kind !== 'memory') return actions
  const filterTags = getSrsFilterTagsForGoal(memoryGoal)
  const deckHome = fixture.entryPaths?.[memoryId]?.at(-2)
  if (!deckHome || !fixture.entries[deckHome]?.children?.includes(memoryId)) return actions
  const practiceTitle = (topic: string) => language === 'en' ? `Practice flashcards for ${topic}` : `Lernkarten zu ${topic} üben`
  actions.set(deckHome, { goalId: memoryId, title: language === 'en' ? 'Practice the full deck' : 'Gesamten Lernkartenstapel üben' })
  const visit = (id: string) => {
    const entry = fixture.entries[id]
    if (!entry) return
    const representedTopic = entry.kind === 'goal' && entry.sourceSections?.filter(source => source.kind !== 'canonicalSubtree').at(-1)
    if (id !== deckHome && (entry.kind === 'unit' || representedTopic)) {
      const goalIds: string[] = []
      const collect = (childId: string) => {
        const child = fixture.entries[childId]
        if (!child) return
        const goal = goalIndex.get(childId)
        if (visibleGoalIds.has(childId) && goal?.landscapeId === material.unit.landscapeId
          && child.kind === 'goal') goalIds.push(childId)
        for (const descendant of child.children ?? []) collect(descendant)
      }
      collect(id)
      if (cards && selectPracticeCards(cards, filterTags, goalIds).length) {
        const title = representedTopic ? representedTopic.title : entry.title
        const topic = /^\p{L}+\.\d+(?=\s)/u.exec(title)?.[0] ?? title
        actions.set(id, { goalId: memoryId, goalIds,
          title: practiceTitle(topic) })
      }
    }
    for (const child of entry.children ?? []) visit(child)
  }
  visit(deckHome)
  return actions
}

interface UnitResourcePlacement { scopeId: string; goalIds: readonly string[]; orientationGoalId?: string }

export function unitResourcePlacements({ material, scopes, flashcards, assessments }: {
  material?: MapPracticeMaterial
  scopes: ReadonlySet<string>
  flashcards: ReadonlyMap<string, FlashcardPracticeRequest>
  assessments: ReadonlyMap<string, { goalId: string }>
}): UnitResourcePlacement[] {
  return [...scopes].flatMap(scopeId => {
    const goalIds = [flashcards.get(scopeId), assessments.get(scopeId)].flatMap(action => action ? [action.goalId] : [])
    const orientationGoalId = material?.unit.orientationGoalId
    return goalIds.length || orientationGoalId ? [{ scopeId, goalIds, orientationGoalId }] : []
  })
}

/** Place additional references on the topic board. The source tree remains the owner of every result. */
export function placeUnitLearningResources(fixture: LearningMapFixture, placements: readonly UnitResourcePlacement[]): LearningMapFixture {
  if (!placements.length) return fixture
  const entries = { ...fixture.entries }
  const scopeRelations = { ...fixture.scopeRelations }
  const scopeContext = { ...fixture.scopeContext }
  for (const { scopeId, goalIds, orientationGoalId } of placements) {
    const scope = entries[scopeId]
    if (!scope) continue
    const resources = goalIds.filter(id => entries[id] && !scope.children?.includes(id))
    const children = scope.children ?? []
    const start = orientationGoalId && scope.kind === 'unit' && children.includes(orientationGoalId)
      && ['goal', 'motivation'].includes(entries[orientationGoalId]?.kind) ? orientationGoalId : undefined
    if (!resources.length && !start) continue
    entries[scopeId] = start
      ? { ...scope, orientationGoalId: start, children: [start, ...children.filter(id => id !== start), ...resources] }
      : { ...scope, children: [...children, ...resources] }
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
