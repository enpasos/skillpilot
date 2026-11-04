import snapshot from './cockpit-math.snapshot.json'
import type { LearningMapEntry, LearningMapFixture, MapEntryKind } from '../src/components/learningUnitMap/types'

export interface CockpitGoal {
  id: string
  title: string
  description: string
  kind: MapEntryKind
  requires: string[]
  role: 'target' | 'external'
  canonicalParents: Array<{ id: string; title: string }>
  sourcePath: string
}
export interface CockpitEvent { goalId: string; at: string }
export interface CockpitScenario {
  id: string
  label: string
  description: string
  explicitGoalIds: string[]
  activeGoalId: string
  events: CockpitEvent[]
}
export interface CockpitDerivedState {
  explicitGoalIds: string[]
  implicitGoalIds: string[]
  effectiveGoalIds: string[]
  progress: { total: number; explicit: number; implicit: number; completed: number; percent: number }
  unitComplete: boolean
  todayExplicit: number
  weekExplicit: number
}
export interface CockpitGoalVisualization {
  goalId: string
  status: 'available' | 'not-authored'
  resources: Array<Record<string, unknown>>
  image: {
    goalId: string
    url: string
    sourcePath: string
    publicPath: string
    sha256: string
    publicSha256: string
    bytes: number
    width: number
    height: number
    mimeType: string
    title: string
    altText: string
    reviewStatus: string
  } | null
}

export const cockpitVisualizationsByGoalId: Record<string, CockpitGoalVisualization> = Object.fromEntries(
  Object.entries(snapshot.visualizationsByGoalId).map(([id, visualization]) => [id, {
    ...visualization, status: visualization.status as CockpitGoalVisualization['status'],
  }]),
)

const { ordinaryId, assessmentId, motivationId, memoryId } = snapshot.scope
const rootId = 'prototype:cockpit-math:overview'
const unitId = 'prototype:cockpit-math:dot-projection'
const preparationId = 'prototype:cockpit-math:preparation'
const targetGoalIds = [ordinaryId, assessmentId]
const targetSet = new Set(targetGoalIds)
const goalById: Record<string, CockpitGoal> = Object.fromEntries(snapshot.goals.map(goal => [goal.id, {
  ...goal, kind: goal.kind as MapEntryKind, role: goal.role as CockpitGoal['role'],
}]))

// Full source prerequisites remain resolvable; they do not become target goals
// or fictional prior achievements merely because the map shows their context.
const preparation = new Set<string>()
const pending = [...goalById[ordinaryId].requires]
while (pending.length) {
  const id = pending.pop()!
  if (preparation.has(id)) continue
  preparation.add(id)
  pending.push(...goalById[id].requires)
}
const entries: Record<string, LearningMapEntry> = Object.fromEntries(Object.values(goalById).map(goal => [goal.id, {
  id: goal.id, title: goal.title, description: goal.description, kind: goal.kind,
  requires: [...goal.requires], position: { x: 0, y: 0 },
  eyebrow: goal.role === 'target' ? 'Ziel im Ausschnitt' : 'Quellenkontext außerhalb des Zielumfangs',
}]))

export interface CockpitEdgeProvenance {
  consumerGoalId: string
  prerequisiteGoalId: string
  sourcePath: string
  aggregation: boolean
}
const edgeProvenance: Record<string, CockpitEdgeProvenance[]> = {}
for (const goal of Object.values(goalById)) for (const prerequisite of goal.requires) {
  edgeProvenance[`sibling:${prerequisite}->${goal.id}`] = [{ consumerGoalId: goal.id,
    prerequisiteGoalId: prerequisite, sourcePath: goal.sourcePath, aggregation: false }]
}
entries[unitId] = {
  id: unitId, title: snapshot.scope.title, kind: 'unit',
  description: 'Vorläufige Prototypgruppierung: ein fachliches Ziel und seine vorhandene Prüfung. Keine Freigabe als vollständige curriculare Lerneinheit.',
  children: targetGoalIds, requires: preparation.size ? [preparationId] : [], position: { x: 0, y: 0 },
  eyebrow: 'Mathematik-Ausschnitt · 2 Ziele',
}
entries[preparationId] = {
  id: preparationId, title: 'Vorbereitungen aus dem Graphen', kind: 'unit',
  description: 'Navigationsgruppe der vorhandenen transitiven Voraussetzungen. Sie werden weder zum Zielnenner addiert noch als gemeistert angenommen.',
  children: [...preparation].sort(), requires: [], position: { x: 0, y: 0 }, eyebrow: 'Externer Kontext',
}
edgeProvenance[`sibling:${preparationId}->${unitId}`] = goalById[ordinaryId].requires.map(prerequisite => ({
  consumerGoalId: ordinaryId, prerequisiteGoalId: prerequisite,
  sourcePath: snapshot.sourcePaths.canonical, aggregation: true,
}))
// This is a view projection of the exact K -> orientation relation, not a new
// claim that the complete preparation group must be finished for the whole deck.
const groupedMemoryRefs = goalById[memoryId].requires.filter(id => preparation.has(id))
entries[memoryId].requires = [...goalById[memoryId].requires.filter(id => !preparation.has(id)),
  ...(groupedMemoryRefs.length ? [preparationId] : [])]
if (groupedMemoryRefs.length) edgeProvenance[`sibling:${preparationId}->${memoryId}`] = groupedMemoryRefs.map(prerequisite => ({
  consumerGoalId: memoryId, prerequisiteGoalId: prerequisite,
  sourcePath: snapshot.sourcePaths.canonical, aggregation: true,
}))
entries[rootId] = {
  id: rootId, title: 'Mathematik: ein echter Ausschnitt', kind: 'unit',
  description: 'Lokale Cockpitvorschau mit echten Inhalten und getrenntem externem Kontext. Diese Übersichtsgruppe ist kein zusätzlicher Anerkennungsvertrag.',
  children: [preparationId, unitId, memoryId], requires: [], position: { x: 0, y: 0 },
}

export const cockpitMathFixture: LearningMapFixture = { rootId, title: 'Skalarprodukt und Projektion', entries }
export const cockpitDemoClock = '2026-11-04T12:00:00Z'
const todayStart = Date.parse('2026-11-03T23:00:00Z')
const weekStart = Date.parse('2026-11-01T23:00:00Z')

export const cockpitScenarios: CockpitScenario[] = [
  { id: 'new', label: 'Noch keine Ergebnisse', description: 'Fiktives Testprofil: Beide Lernziele sind noch offen.',
    explicitGoalIds: [], activeGoalId: ordinaryId, events: [] },
  { id: 'before-assessment', label: 'Vor der Prüfung', description: 'Fiktives Testprofil: Fachziel direkt geschafft, Prüfung noch offen.',
    explicitGoalIds: [ordinaryId], activeGoalId: assessmentId,
    events: [{ goalId: ordinaryId, at: '2026-11-02T09:00:00Z' }] },
  { id: 'passed-assessment', label: 'Prüfung bestanden · Demo', description: 'Fiktives Testprofil: Prüfung geschafft. Das Fachziel zählt dadurch implizit mit.',
    explicitGoalIds: [assessmentId], activeGoalId: assessmentId,
    events: [{ goalId: assessmentId, at: '2026-11-04T09:15:00Z' }] },
]

export function deriveCockpitState(explicitGoalIds: readonly string[], events: readonly CockpitEvent[] = []): CockpitDerivedState {
  const explicit = new Set(explicitGoalIds)
  for (const id of explicit) if (!goalById[id]) throw new Error(`Unbekanntes Testziel: ${id}`)
  // Illustrative Own={A,Q}, P={Q} contract only. Traverse the complete source
  // path even through explicitly mastered intermediate prerequisites.
  const needed = new Set<string>()
  const pending = explicit.has(assessmentId) ? [] : [assessmentId]
  while (pending.length) {
    const id = pending.pop()!
    if (needed.has(id)) continue
    needed.add(id)
    pending.push(...goalById[id].requires)
  }
  const implicit = new Set(!explicit.has(ordinaryId) && !needed.has(ordinaryId) ? [ordinaryId] : [])
  const effective = new Set([...explicit, ...implicit])
  const explicitCount = targetGoalIds.filter(id => explicit.has(id)).length
  const implicitCount = targetGoalIds.filter(id => implicit.has(id)).length
  const completed = explicitCount + implicitCount
  const countEvents = (start: number) => new Set(events.filter(event => {
    const time = Date.parse(event.at)
    return targetSet.has(event.goalId) && explicit.has(event.goalId)
      && Number.isFinite(time) && time >= start && time <= Date.parse(cockpitDemoClock)
  }).map(event => event.goalId)).size
  return {
    explicitGoalIds: [...explicit], implicitGoalIds: [...implicit], effectiveGoalIds: [...effective],
    progress: { total: 2, explicit: explicitCount, implicit: implicitCount, completed, percent: completed * 50 },
    unitComplete: completed === 2, todayExplicit: countEvents(todayStart), weekExplicit: countEvents(weekStart),
  }
}

export function exportLearningEntryProgress(state: CockpitDerivedState): Record<string, { total: number; explicit: number; implicit: number }> {
  const explicit = new Set(state.explicitGoalIds), implicit = new Set(state.implicitGoalIds)
  const targetsBelow = (id: string): Set<string> => {
    const entry = entries[id]
    return new Set([...(targetSet.has(id) ? [id] : []), ...(entry.children ?? []).flatMap(child => [...targetsBelow(child)])])
  }
  return Object.fromEntries(Object.keys(entries).flatMap(id => {
    const targets = targetsBelow(id)
    return targets.size ? [[id, { total: targets.size, explicit: [...targets].filter(goal => explicit.has(goal)).length,
      implicit: [...targets].filter(goal => implicit.has(goal)).length }]] : []
  }))
}

export function buildCockpitCoachStart(activeGoalId: string): string {
  const goal = goalById[activeGoalId]
  if (!goal) throw new Error('Das aktive Lernziel fehlt im lokalen Ausschnitt.')
  return `Lokale Startvorschau – keine echte Coach-Verbindung.\n\nIch möchte am Lernziel „${goal.title}“ arbeiten.\n\n${goal.description}`
}

export const cockpitMathData = {
  fixture: cockpitMathFixture, rootId, initialScopeId: rootId, unitId,
  unitTitle: snapshot.scope.title, targetGoalIds, goalById, edgeProvenance,
  assessment: snapshot.assessment, cards: snapshot.cards,
  visualizationsByGoalId: cockpitVisualizationsByGoalId, assetBindings: snapshot.assetBindings,
  motivation: { ...goalById[motivationId], isExternal: true },
  coachStartText: buildCockpitCoachStart(ordinaryId),
  sourcePaths: snapshot.sourcePaths, sourceSha256: snapshot.sourceSha256,
  canonicalParents: snapshot.targetCanonicalParents, compositionReferences: snapshot.compositionReferences,
  notice: 'Lokaler Testdatensatz: echte Lernziel- und Aufgabentexte, vorläufige Prototypgruppierungen und fiktive Ergebnisse. Die implizite Anzeige demonstriert die Mengenformel; sie behauptet keinen neu freigegebenen Anerkennungsvertrag. Nur A und Q zählen zu den insgesamt 2 Zielen. Vorbereitungen und das vollständige zusätzliche Kartendeck bleiben außerhalb dieses Umfangs.',
}
