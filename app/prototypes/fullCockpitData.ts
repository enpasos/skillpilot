import type { UiGoal } from '../src/goalTypes'
import { CANONICAL_GYMNASIUM_ROOT_ID } from '../src/utils/curriculumDisplay'
import snapshot from './cockpit-math.snapshot.json'
import { cockpitMathData } from './cockpitMathData'

const { ordinaryId, assessmentId, memoryId, motivationId } = snapshot.scope
const mathLandscapeId = '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'
const physicsLandscapeId = 'prototype:full-cockpit:physics'
const mathScopeId = 'prototype:full-cockpit:math-scope'
const contextId = 'prototype:full-cockpit:context'
const physicsGoalId = 'prototype:full-cockpit:physics-goal'
const deckUrl = '/prototypes/full-cockpit-deck.json'

const atomic = (id: string, title: string, description: string): UiGoal => ({
  id, title, description, landscapeId: mathLandscapeId, phase: 'GLOBAL', themenfeld: '', area: 'Mathematik',
  level: 1, core: true, weight: 1, tags: [], leitideen: [], kompetenzen: [], sourceRef: '',
  requires: [], contains: [], examples: [], type: 'atomic', nodeKind: 'tutor', semanticKind: 'curricularAtomic',
})

const sourceGoals: UiGoal[] = snapshot.goals.map(source => {
  const goal = atomic(source.id, source.title, source.description)
  goal.requires = [...source.requires]
  goal.sourceRef = source.sourcePath
  goal.extendedData = {
    provenance: { sourceTitle: 'Kanonische Mathematik · lokaler Quellenauszug', sourceUrl: '/prototypes/cockpit-math.snapshot.json',
      license: 'CC-BY-4.0', licenseUrl: '/LICENSES/CC-BY-4.0.txt' },
    prototypeSourceRole: source.role,
  }
  if (source.kind === 'motivation') {
    goal.semanticKind = 'orientation'
    goal.tags = ['orientation']
  }
  if (source.id === assessmentId) {
    goal.nodeKind = 'exam'
    goal.semanticKind = 'practiceAssessment'
    // All task, solution and grading text is imported unchanged. The old card
    // renderer only displays released examData; preserve the source status.
    goal.examData = { ...snapshot.assessment }
  }
  if (source.id === memoryId) {
    goal.nodeKind = 'memory'
    goal.semanticKind = 'memory'
    goal.tags = [`srs-deck:${snapshot.cards.deckId}`]
    goal.extendedData = { ...goal.extendedData, vocabularySource: deckUrl }
  }
  const image = cockpitMathData.visualizationsByGoalId[source.id]?.image
  if (image) goal.resourceLinks = [{ type: 'goal-visualization', resourceType: 'goal-visualization', role: 'primary',
    url: image.url, title: image.title, altText: image.altText, reviewStatus: image.reviewStatus }]
  return goal
})

const cluster = (id: string, title: string, children: string[], landscapeId = mathLandscapeId): UiGoal => ({
  ...atomic(id, title, 'Lokale Navigationsgruppierung für den vollständigen Cockpit-Prototyp; kein freigegebener Lerneinheitsvertrag.'),
  landscapeId, contains: children, type: 'cluster', semanticKind: 'curricularArea', weight: children.length,
})
const physicsGoal: UiGoal = {
  ...atomic(physicsGoalId, 'Kräfte und Bewegung erklären', 'Fiktives UI-Beispiel für einen zweiten Fachplan; kein kuratiertes Physik-Lernziel.'),
  landscapeId: physicsLandscapeId, area: 'Physik · UI-Testdaten',
}
const targetSet = new Set<string>(snapshot.scope.targetGoalIds)
const mainContextIds = new Set([memoryId, motivationId])
const roots = [
  { ...cluster(mathLandscapeId, 'Mathematik', [mathScopeId, motivationId, memoryId, contextId]), tags: ['root'] },
  { ...cluster(physicsLandscapeId, 'Physik · UI-Testdaten', [physicsGoalId], physicsLandscapeId), tags: ['root'] },
]
const all = [
  ...roots,
  cluster(mathScopeId, snapshot.scope.title, [...snapshot.scope.targetGoalIds]),
  cluster(contextId, 'Weitere Voraussetzungen · Quellenkontext', sourceGoals.filter(goal => !targetSet.has(goal.id) && !mainContextIds.has(goal.id)).map(goal => goal.id)),
  ...sourceGoals, physicsGoal,
]
const goalIndexAll = new Map(all.map(goal => [goal.id, goal]))
const parentMap = new Map<string, string[]>()
for (const goal of all) for (const child of goal.contains) parentMap.set(child, [...(parentMap.get(child) ?? []), goal.id])

export const fullCockpitData = {
  learnerId: 'fixture-full-cockpit-local',
  rootLandscapeId: CANONICAL_GYMNASIUM_ROOT_ID,
  initialGoalId: ordinaryId,
  ordinaryId, assessmentId, memoryId, motivationId, physicsGoalId,
  mathLandscapeId, physicsLandscapeId, mathScopeId, contextId, deckUrl,
  rootGoals: roots, goalIndexAll, parentMap,
  availableLandscapes: [
    { landscapeId: mathLandscapeId, title: 'Mathematik' },
    { landscapeId: physicsLandscapeId, title: 'Physik · UI-Testdaten' },
  ],
  targetGoalIds: [...snapshot.scope.targetGoalIds],
  sourceTargetGoalIds: [...snapshot.scope.targetGoalIds],
  inspectableGoalIds: [ordinaryId, assessmentId, memoryId, motivationId, physicsGoalId],
  deck: { deckId: snapshot.cards.deckId, title: snapshot.cards.title, cards: snapshot.cards.cards },
  assessment: snapshot.assessment,
  sourcePaths: snapshot.sourcePaths,
  notice: 'Lokaler vollständiger Cockpit-Test: Originalkomponenten mit fiktivem Lernstand, lokalen API-Antworten und vorläufigen Navigationsgruppen. A und Q bilden weiterhin den belegten Zweizielausschnitt; Karten, Orientierung und Voraussetzungen sind gesonderter Quellenkontext. Der zweite Fachplan ist ein fiktives Physik-UI-Beispiel. Keine echte Sitzung, Bewertung, Curriculumsfreigabe oder Produktionsspeicherung.',
}

export type FullCockpitData = typeof fullCockpitData
