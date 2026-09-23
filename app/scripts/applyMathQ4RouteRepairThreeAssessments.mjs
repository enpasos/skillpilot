import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel.ts'

const root = resolve(import.meta.dirname, '../..')
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const semanticPath = 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json'
const sourceDirectory = 'curricula/DE/Gymnasium/assessments/mathematik/sekii/q4/m7-route-repair-20260923-v1'
const landscapeId = '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'
const processId = 'd2560dc7-f29a-5e51-ba8c-ec2ca0fb8cc1'
const practiceId = '57f07e66-800c-5f7e-99ab-11dd6e520eb1'
const areaId = '6c8a677b-ede8-5c2c-86d8-0ef0be8ace28'
const rootId = 'c01b1ce9-a667-4a46-b251-ec33ae602b15'
const writeMode = process.argv.includes('--write')
const checkMode = process.argv.includes('--check')
if (writeMode && checkMode || process.argv.slice(2).some(arg => !['--write', '--check'].includes(arg))) {
  throw new Error('Use at most one of --write or --check')
}
const absolute = path => resolve(root, path)
const read = path => JSON.parse(readFileSync(absolute(path), 'utf8'))
const serialize = value => JSON.stringify(value, null, 2) + '\n'
const assert = (condition, message) => { if (!condition) throw new Error(message) }
const sha256 = value => createHash('sha256').update(value, 'utf8').digest('hex')
const stableId = shortKey => {
  const hex = createHash('sha1').update('DE-GYM-CANONICAL-MATH:' + shortKey).digest('hex')
  return hex.slice(0, 8) + '-' + hex.slice(8, 12) + '-5' + hex.slice(13, 16) + '-8' + hex.slice(17, 20) + '-' + hex.slice(20, 32)
}
const section = (text, start, end) => {
  const a = text.indexOf(start)
  const b = text.indexOf(end, a + start.length)
  assert(a >= 0 && b > a, 'Missing assessment section: ' + start + ' → ' + end)
  return text.slice(a + start.length, b).trim()
}

const specs = [
  {
    id: '0c44524c-f617-5076-8acf-729cd5515c14',
    shortKey: 'canonical_math_sek2_q4_assessment_process_document_check_model_improve',
    file: 'bus-model-check.md',
    sourceHash: 'e82c5b9e065334bc9cc410f2feb6b3234d96856c4a9079ffafd02cdbecdc7138',
    parentId: processId,
    title: 'Busmodell dokumentieren, prüfen und verbessern',
    titleEn: 'Document, check and improve a bus-cost model',
    description: 'Die lernende Person kann in einer selbstständigen Busmodell-Aufgabe Äquivalenzumformungen nachvollziehbar dokumentieren, Ergebnisse unabhängig prüfen und einen Modellzweig für eine Kapazitätsgrenze verbessern.',
    descriptionEn: 'The learner can document equivalence transformations, independently check results and improve a model branch at a capacity boundary in a self-contained bus-cost task.',
    courses: ['GK', 'LK'],
    framework: 'hessen-kc-2024',
    area: 'Prozesskompetenzen',
    topicCode: 'CANONICAL.MATH.SEK2.Q4.PRACTICE.PROCESS_BUS_MODEL_CHECK',
    processCompetencies: ['K3.3', 'K3.4'],
    guidingIdeas: ['L2', 'L4', 'L5'],
    coveredGoalIds: [
      'ae2ca565-928d-55f4-b804-7155cf210120',
      '4a630596-6e2f-593e-bac6-2a6d8fa58e2f',
      'fb4dcd2a-a6a9-5371-a2fc-95348ee130e0',
    ],
    maxPoints: 16,
    passingPoints: 8,
    steps: [
      { id: 'q4_bus_1', points: 4, description: 'Äquivalenzumformungen dokumentiert, Lösung eingesetzt und Kapazität geprüft' },
      { id: 'q4_bus_2', points: 5, description: 'Gesamt- und Pro-Kopf-Betrag unabhängig kontrolliert und korrigiert' },
      { id: 'q4_bus_3', points: 7, description: 'Kapazitätsgrenze erkannt, Zweigmodell entwickelt und formale Fortsetzung korrekt abgegrenzt' },
    ],
  },
  {
    id: '1fcb56db-5e3f-57da-862d-f3bdf9984af2',
    shortKey: 'canonical_math_sek2_q4_assessment_lk_compare_algae_growth_models',
    file: 'algae-model-choice.md',
    sourceHash: '40eb7b16af93a8c9c25a35f8562c5fbdd64fbcf4f7d55a1ef8034341c047bb0c',
    parentId: processId,
    title: 'Wachstumsmodelle für eine Algenkultur vergleichen',
    titleEn: 'Compare growth models for an algae culture',
    description: 'Die lernende Person kann in einer selbstständigen Aufgabe zwei Wachstumsmodelle entwickeln, nach erklärten Kriterien vergleichen und eine Modellentscheidung unter Datenunsicherheit begründen.',
    descriptionEn: 'The learner can construct two growth models, compare them against explicit criteria and justify a model decision under data uncertainty in a self-contained task.',
    courses: ['LK'],
    framework: 'hessen-kc-2024',
    area: 'Prozesskompetenzen',
    topicCode: 'CANONICAL.MATH.SEK2.Q4.PRACTICE.LK_ALGAE_MODEL_CHOICE',
    processCompetencies: ['K3.4'],
    guidingIdeas: ['L2', 'L4', 'L5'],
    coveredGoalIds: [
      '74f28ce7-e568-5d6e-b946-17445b344fcc',
      '163dd583-8308-53f0-b60d-34588787988d',
      '519660d0-85e5-57a6-a219-d0a253336649',
    ],
    maxPoints: 20,
    passingPoints: 10,
    steps: [
      { id: 'q4_algae_1', points: 6, description: 'Lineares und exponentielles Modell samt Annahmen korrekt entwickelt' },
      { id: 'q4_algae_2', points: 7, description: 'Restabweichungen, Kriterien und Tages-4-Prognosen fachlich verglichen' },
      { id: 'q4_algae_3', points: 7, description: 'Modellwahl oder Offenheit unter Messunsicherheit und veränderten Annahmen begründet' },
    ],
  },
  {
    id: 'c849eeab-e88f-5e82-89d9-761a1e17d97b',
    shortKey: 'canonical_math_sek2_q4_assessment_lk_validate_tank_inflow_analysis',
    file: 'tank-rate-validation.md',
    sourceHash: '681f0eb157905428b60dd66bdc25ce02820110eea86e58ab07a0d344976e893a',
    parentId: practiceId,
    title: 'Zuflussmodell für einen Wassertank prüfen',
    titleEn: 'Validate an inflow model for a water tank',
    description: 'Die lernende Person kann in einer selbstständigen Tankmodell-Aufgabe Differential- und Integralrechnung kontextgerecht anwenden und die Modellprognose anhand einer unsicheren Messung kritisch prüfen.',
    descriptionEn: 'The learner can apply differential and integral calculus in context and critically validate a tank-model prediction against an uncertain measurement.',
    courses: ['LK'],
    framework: 'canonical-gymnasium-math',
    area: 'Analysis',
    topicCode: 'CANONICAL.MATH.SEK2.Q4.PRACTICE.LK_TANK_RATE_VALIDATION',
    processCompetencies: ['K2.3', 'K3.2', 'K4.2', 'K6.2'],
    guidingIdeas: ['L2', 'L4'],
    coveredGoalIds: [
      'dc12f281-f161-572b-a973-8405ae9b2498',
      '0b162cb0-8507-5ac2-b9d6-57f40f4d3f35',
      '71fe4a39-38e8-5c6a-8eef-ff4783fe70c2',
    ],
    maxPoints: 20,
    passingPoints: 10,
    steps: [
      { id: 'q4_tank_1', points: 6, description: 'Maximum der Zuflussrate mit Differentialrechnung bestimmt und interpretiert' },
      { id: 'q4_tank_2', points: 7, description: 'Gesamtzufluss integriert und Endinhalt mit Einheiten bestimmt' },
      { id: 'q4_tank_3', points: 7, description: 'Vorhersage gegen Messintervall geprüft und Modellgrenzen eingeordnet' },
    ],
  },
]

const landscape = read(canonicalPath)
const semantic = read(semanticPath)
assert(landscape.landscapeId === landscapeId && semantic.sourceLandscapeId === landscapeId, 'Wrong mathematics landscape')
const existingGoalById = new Map(landscape.goals.map(goal => [goal.id, goal]))
if (specs.every(spec => existingGoalById.has(spec.id))) {
  assert(landscape.goals.length === 1192 && semantic.counts.total === 1192, 'Unexpected integrated goal count')
  assert(semantic.counts.curricularAtomic === 797 && semantic.counts.practiceAssessment === 142, 'Unexpected integrated semantic denominator')
  const existingDecisionById = new Map(semantic.decisions.map(decision => [decision.goalId, decision]))
  assert(existingGoalById.size === landscape.goals.length && existingDecisionById.size === semantic.decisions.length, 'Duplicate integrated goal or decision ID')
  for (const spec of specs) {
    const goal = existingGoalById.get(spec.id)
    const decision = existingDecisionById.get(spec.id)
    const markdownPath = sourceDirectory + '/' + spec.file
    const markdown = readFileSync(absolute(markdownPath), 'utf8')
    assert(sha256(markdown) === spec.sourceHash, 'Assessment source drift: ' + markdownPath)
    assert(stableId(spec.shortKey) === spec.id && goal.shortKey === spec.shortKey, 'Assessment ID/shortKey drift: ' + spec.id)
    assert(goal.nodeKind === 'exam' && goal.type === 'atomic', 'Assessment node kind drift: ' + spec.id)
    assert(JSON.stringify(goal.requires) === JSON.stringify(spec.coveredGoalIds), 'Assessment requires drift: ' + spec.id)
    assert(JSON.stringify(goal.examData?.coveredGoalIds) === JSON.stringify(spec.coveredGoalIds), 'Assessment coverage drift: ' + spec.id)
    assert(goal.examData?.reviewStatus === 'released' && goal.examData?.sourceArtifactPath === markdownPath, 'Assessment release/source drift: ' + spec.id)
    assert(goal.examData?.taskContent === section(markdown, '## Aufgabe (DE)\n', '## Musterlösung und Bewertung (DE)'), 'Assessment task drift: ' + spec.id)
    assert(goal.examData?.solutionContent === section(markdown, '## Musterlösung und Bewertung (DE)\n', '## Task (EN)'), 'Assessment solution drift: ' + spec.id)
    assert(goal.examData?.scoring?.maxPoints === spec.maxPoints && goal.examData?.scoring?.passingPoints === spec.passingPoints, 'Assessment scoring drift: ' + spec.id)
    assert(goal.examData.scoring.steps.reduce((sum, step) => sum + step.points, 0) === spec.maxPoints, 'Assessment point sum drift: ' + spec.id)
    assert(spec.courses.every(course => goal.tags.includes(course)) && (spec.courses.includes('GK') || !goal.tags.includes('GK')), 'Assessment course drift: ' + spec.id)
    assert(existingGoalById.get(spec.parentId)?.contains?.includes(spec.id), 'Assessment parent drift: ' + spec.id)
    assert(decision?.semanticKind === 'practiceAssessment' && decision?.decisionStatus === 'authoritative'
      && decision?.decisionBasis === 'reviewed-current-pilot-practice-assessment'
      && decision?.sourceFingerprint === fingerprintSemanticKindSourceGoal(goal), 'Assessment semantic-kind drift: ' + spec.id)
  }
  const expectedWeights = [[processId, 8], [practiceId, 14], [areaId, 162], [rootId, 932]]
  for (const [goalId, weight] of expectedWeights) assert(existingGoalById.get(goalId)?.weight === weight, 'Cluster weight drift: ' + goalId)
  for (const goalId of [processId, practiceId]) {
    const goal = existingGoalById.get(goalId)
    assert(existingDecisionById.get(goalId)?.sourceFingerprint === fingerprintSemanticKindSourceGoal(goal), 'Parent classification drift: ' + goalId)
  }
  console.log('CHECK math_q4_route_repair_three_assessments ' + (writeMode ? 'NOOP' : 'PASS') + ' goals=3 covered=9 changed=0')
  process.exit(0)
}
assert(landscape.goals.length === 1189 && semantic.counts.total === 1189, 'Unexpected pre-integration goal count')
assert(semantic.counts.curricularAtomic === 797 && semantic.counts.practiceAssessment === 139, 'Unexpected semantic-kind denominator')
const byId = new Map(landscape.goals.map(goal => [goal.id, goal]))
const decisionById = new Map(semantic.decisions.map(decision => [decision.goalId, decision]))
assert(byId.size === landscape.goals.length && decisionById.size === semantic.decisions.length, 'Duplicate goal or decision ID')
const processCluster = byId.get(processId)
const q4Cluster = byId.get(practiceId)
const q4Area = byId.get(areaId)
const rootGoal = byId.get(rootId)
assert(processCluster && q4Cluster && q4Area && rootGoal, 'Missing practice or ancestor cluster')
assert(processCluster.weight === 6 && q4Cluster.weight === 11 && q4Area.weight === 159 && rootGoal.weight === 929, 'Unexpected original cluster weights')
assert(processCluster.contains.length === 6 && q4Cluster.contains.length === 6, 'Unexpected practice cluster children')

const newGoals = specs.map(spec => {
  assert(stableId(spec.shortKey) === spec.id, 'Unstable assessment ID: ' + spec.id)
  assert(!byId.has(spec.id) && !decisionById.has(spec.id), 'Assessment already exists: ' + spec.id)
  const sourceArtifactPath = sourceDirectory + '/' + spec.file
  const markdown = readFileSync(absolute(sourceArtifactPath), 'utf8')
  assert(sha256(markdown) === spec.sourceHash, 'Unreviewed assessment source drift: ' + sourceArtifactPath)
  const covered = spec.coveredGoalIds.map(goalId => byId.get(goalId))
  assert(covered.every(goal => goal?.type === 'atomic'), 'Missing covered atomic goal: ' + spec.id)
  const jurisdictions = covered[0].applicability.jurisdiction
  assert(covered.every(goal => JSON.stringify(goal.applicability.jurisdiction) === JSON.stringify(jurisdictions)), 'Divergent covered-goal jurisdictions: ' + spec.id)
  assert(covered.every(goal => spec.courses.every(course => goal.tags.includes(course))), 'Course overclaim: ' + spec.id)
  assert(spec.steps.reduce((sum, step) => sum + step.points, 0) === spec.maxPoints, 'Scoring total mismatch: ' + spec.id)
  return {
    id: spec.id,
    shortKey: spec.shortKey,
    title: spec.title,
    titleEn: spec.titleEn,
    description: spec.description,
    descriptionEn: spec.descriptionEn,
    core: spec.courses.includes('GK'),
    weight: 1,
    tags: [...spec.courses, 'Practice', 'Assessment', 'ExamTask', 'canonical', 'phase:Q4'],
    applicability: { jurisdiction: [...jurisdictions] },
    extendedData: { applicabilityFromRequires: true, applicabilityMappingInheritance: 'boundary' },
    sourceRef: sourceArtifactPath,
    dimensionTags: {
      framework: spec.framework,
      demandLevel: 'AB3',
      processCompetencies: [...spec.processCompetencies],
      guidingIdeas: [...spec.guidingIdeas],
      phase: 'Q4',
      area: spec.area,
      topicCode: spec.topicCode,
    },
    requires: [...spec.coveredGoalIds],
    contains: [],
    examples: [],
    resourceLinks: [],
    examData: {
      reviewStatus: 'released',
      reviewNote: 'Machine-only Q4 route assessment after independent draft audit, explicit corrections and current calculation/scoring check on 2026-09-23; no human approval claimed.',
      coveredGoalIds: [...spec.coveredGoalIds],
      coveredStrands: [...spec.guidingIdeas],
      demandLevels: ['AB1', 'AB2', 'AB3'],
      sourceArtifactPath,
      taskContent: section(markdown, '## Aufgabe (DE)\n', '## Musterlösung und Bewertung (DE)'),
      solutionContent: section(markdown, '## Musterlösung und Bewertung (DE)\n', '## Task (EN)'),
      scoring: { maxPoints: spec.maxPoints, passingPoints: spec.passingPoints, steps: spec.steps.map(step => ({ ...step })) },
    },
    phase: 'Q4',
    type: 'atomic',
    nodeKind: 'exam',
  }
})

processCluster.contains.push(specs[0].id, specs[1].id)
q4Cluster.contains.push(specs[2].id)
processCluster.weight = 8
q4Cluster.weight = 14
q4Cluster.description = 'Bündelt materialgestützte Q4-Klausuraufgaben mit normalem Klausurcharakter zu Funktionenscharen, Problemlösen, komplexen Zahlen und anwendungsbezogener Analysis. Die globalen Abituraufgaben bleiben davon getrennt modelliert.'
q4Area.weight = 162
rootGoal.weight = 932
landscape.goals.push(...newGoals)
for (const goal of [processCluster, q4Cluster]) {
  const decision = decisionById.get(goal.id)
  assert(decision?.semanticKind === 'practiceAssessment' && decision.decisionStatus === 'authoritative', 'Missing parent practice classification: ' + goal.id)
  decision.sourceFingerprint = fingerprintSemanticKindSourceGoal(goal)
}
for (const goal of newGoals) semantic.decisions.push({
  goalId: goal.id,
  sourceFingerprint: fingerprintSemanticKindSourceGoal(goal),
  semanticKind: 'practiceAssessment',
  decisionStatus: 'authoritative',
  decisionBasis: 'reviewed-current-pilot-practice-assessment',
})
semantic.decisions.sort((a, b) => a.goalId < b.goalId ? -1 : a.goalId > b.goalId ? 1 : 0)
semantic.counts.practiceAssessment += 3
semantic.counts.total += 3
assert(landscape.goals.length === 1192 && semantic.decisions.length === 1192, 'Post-integration goal count mismatch')
const outputs = [[canonicalPath, serialize(landscape)], [semanticPath, serialize(semantic)]]
const changed = outputs.filter(([path, bytes]) => readFileSync(absolute(path), 'utf8') !== bytes)
if (checkMode && changed.length) throw new Error('Q4 assessments not materialized: ' + changed.map(([path]) => path).join(', '))
if (writeMode) for (const [path, bytes] of changed) writeFileSync(absolute(path), bytes)
console.log('CHECK math_q4_route_repair_three_assessments ' + (writeMode ? 'WRITE' : checkMode ? 'PASS' : 'PLAN') + ' goals=3 covered=9 changed=' + changed.length)
