import type { LearningGoal } from '../src/landscapeTypes'
import { convertLearningGoal } from '../src/goalTypes'

const fail = (message: string): never => {
  throw new Error(`Package landscape model parity self-test failed: ${message}`)
}

const baseGoal: LearningGoal = {
  id: 'goal-model-parity',
  title: 'Model parity',
  description: 'The package model remains observable without changing legacy UI precedence.',
  core: false,
  weight: 1,
  tags: [],
  dimensionTags: {
    framework: 'fixture',
    demandLevel: 'AB2',
    processCompetencies: ['DIM-K1'],
    guidingIdeas: ['L1'],
    phase: 'Q1',
    topicCode: 'DIM-Q1.1',
  },
  phase: 'Sekundarstufe I/II',
  themenfeld: 'LEGACY-TOPIC',
  leitideen: ['L2'],
  kompetenzen: ['TOP-K2'],
  semanticAtomic: false,
  semanticKind: 'practiceAssessment',
  requires: [],
  contains: [],
}

const converted = convertLearningGoal(baseGoal)
if (converted.phase !== 'Q1') fail('dimensionTags.phase must retain precedence over legacy phase')
if (converted.themenfeld !== 'DIM-Q1.1') fail('dimensionTags.topicCode must retain precedence')
if (converted.leitideen.join(',') !== 'L1') fail('dimensionTags.guidingIdeas must retain precedence')
if (converted.kompetenzen.join(',') !== 'DIM-K1') fail('dimensionTags.processCompetencies must retain precedence')
if (converted.core !== false) fail('explicit core=false was not preserved')
if (converted.semanticAtomic !== false) fail('semanticAtomic=false was not preserved')
if (converted.semanticKind !== 'practiceAssessment') fail('semanticKind was not preserved')

const fallback = convertLearningGoal({
  ...baseGoal,
  dimensionTags: {
    framework: 'fixture',
    demandLevel: 'AB2',
    processCompetencies: undefined,
    guidingIdeas: undefined,
    phase: undefined,
    topicCode: undefined,
  } as unknown as LearningGoal['dimensionTags'],
  phase: 'Q2',
  themenfeld: 'TOP-Q2.1',
  leitideen: ['L2'],
  kompetenzen: ['TOP-K2'],
})
if (fallback.phase !== 'Q2') fail('top-level phase fallback is unavailable')
if (fallback.themenfeld !== 'TOP-Q2.1') fail('top-level themenfeld fallback is unavailable')
if (fallback.leitideen.join(',') !== 'L2') fail('top-level leitideen fallback is unavailable')
if (fallback.kompetenzen.join(',') !== 'TOP-K2') fail('top-level kompetenzen fallback is unavailable')

console.log('Package landscape model parity self-test passed: DTO fields preserved with legacy UI precedence.')
