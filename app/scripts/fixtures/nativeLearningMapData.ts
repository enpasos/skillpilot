import type { LearningGoal, SkillLandscape } from '../../src/landscapeTypes'
import type { CompositionView } from '../../src/utils/authoring/compositionViewAuthoring'
import { CANONICAL_GYMNASIUM_ROOT_ID } from '../../src/utils/curriculumDisplay'

// Small raw canonical/composition responses for the real App entrypoint. These
// contain no browser adapters, live learner identifiers, or prototype snapshots.
export const nativeMapIds = {
  learner: 'fixture-native-learning-map', root: CANONICAL_GYMNASIUM_ROOT_ID,
  math: '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced', physics: 'fixture-native-physics',
  mathRoot: 'native-math-root', section: 'native-vectors', other: 'native-analysis',
  foundation: 'native-vector-foundation', application: 'native-vector-application',
  memory: 'native-vector-recall', support: 'native-hidden-support',
  physicsRoot: 'native-physics-root', physicsGoal: 'native-force',
} as const

const id = nativeMapIds
const goal = (goalId: string, title: string, contains: string[] = [], requires: string[] = []): LearningGoal => ({
  id: goalId, title, description: `Die lernende Person kann ${title.toLowerCase()}.`,
  contains, requires, tags: [] as string[], weight: 1, core: true,
  dimensionTags: { phase: 'Q2', area: 'Analytische Geometrie', demandLevel: 'AB2',
    framework: 'canonical-gymnasium', processCompetencies: [], guidingIdeas: [] },
})
export const nativeMapLandscapes: SkillLandscape[] = [
  { landscapeId: id.root, title: 'Gymnasium (DE)', description: 'Native UI-Testdaten', frameworkId: 'canonical-gymnasium', locale: 'de-DE', goals: [
    { ...goal('native-canonical-root', 'Gymnasium', [id.mathRoot, id.physicsRoot]), tags: ['root'] },
  ] },
  { landscapeId: id.math, title: 'Mathematik', description: 'Native UI-Testdaten', subject: 'Mathematik', frameworkId: 'canonical-gymnasium', locale: 'de-DE', goals: [
    { ...goal(id.mathRoot, 'Mathematik', [id.section, id.other]), tags: ['root'] },
    goal(id.section, 'Vektoren', [id.foundation, id.application, id.memory], [id.support]),
    goal(id.foundation, 'Vektoren darstellen'),
    { ...goal(id.application, 'Skalarprodukte anwenden', [], [id.foundation]), resourceLinks: [{
      type: 'goal-visualization', resourceType: 'goal-visualization', role: 'primary',
      url: '/fixtures/native-map-goal.svg', title: 'Vektoren', altText: 'Zwei Vektoren', reviewStatus: 'approved',
    }] },
    { ...goal(id.memory, 'Vektoren erinnern'), nodeKind: 'memory', tags: ['srs-deck:native-vectors'],
      extendedData: { vocabularySource: '/fixtures/native-vectors-deck.json' } },
    goal(id.other, 'Änderungsraten deuten'),
    goal(id.support, 'Unterstützende Gleichungen lösen'),
  ] },
  { landscapeId: id.physics, title: 'Physik', description: 'Native UI-Testdaten', subject: 'Physik', frameworkId: 'canonical-gymnasium', locale: 'de-DE', goals: [
    { ...goal(id.physicsRoot, 'Physik', [id.physicsGoal]), tags: ['root'] },
    goal(id.physicsGoal, 'Kräfte beschreiben'),
  ] },
]

export const nativeMapView = (landscapeId: string, physicsOnly = false): CompositionView => ({
  viewId: `native-${landscapeId}`, landscapeId,
  scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-HE', stage: 'Sekundarstufe II', durationModel: 'G9' },
  rootNodes: landscapeId === id.root
    ? [
      ...(!physicsOnly ? [{ kind: 'landscapeEntry' as const, landscapeId: id.math }] : []),
      { kind: 'landscapeEntry', landscapeId: id.physics },
    ]
    : landscapeId === id.math ? [
      { kind: 'canonicalSubtree', goalId: id.section },
      { kind: 'goalEntry', goalId: id.other },
      { kind: 'goalEntry', goalId: id.support, projectionRole: 'prerequisiteOnly' },
    ] : [{ kind: 'goalEntry', goalId: id.physicsGoal }],
})

export const nativeMapProfile = (physicsOnly = false) => ({
  skillpilotId: id.learner, selectedCurriculum: id.root, createdAt: '2026-09-01T08:00:00Z',
  personalCurriculum: JSON.stringify({
    [id.root]: { selected: true, filterId: 'DE-HE', durationModel: 'G9', stage: 'Sekundarstufe II' },
    [id.math]: { selected: !physicsOnly, filterId: 'GK+LK' },
    [id.physics]: { selected: true, filterId: 'GK+LK' },
    __skillpilot_stage_scope_sek2__: { selected: true },
  }),
  learningStrategy: 'SEQUENTIAL', autoPilot: false, followLearningPlans: false,
  strictMode: false, showGoalVisualizationsInChat: true, copySources: [],
  useAssessmentShortcuts: false, activeGoalId: physicsOnly ? id.physicsGoal : id.application,
})

export const nativeMapDeck = {
  deckId: 'native-vectors', title: 'Vektoren wiederholen', cards: [
    { id: 'native-card-1', front: 'Welche beiden Angaben beschreiben einen Vektor?', back: 'Richtung und Länge.', tags: [] },
    { id: 'native-card-2', front: 'Wie heißen die Einträge eines Vektors?', back: 'Komponenten.', tags: [] },
  ],
}
