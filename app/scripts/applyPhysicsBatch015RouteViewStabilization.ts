import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel'

type Json = null | boolean | number | string | Json[] | { [key: string]: Json }
type RecordJson = { [key: string]: Json }

const root = resolve(import.meta.dirname, '../..')
const canonicalPath = resolve(root, 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json')
const viewRoot = resolve(root, 'curricula/DE/Gymnasium/composition-views/physik')
const acceptedWarningsPath = resolve(root, 'docs/qa-ci/applicability-accepted-warnings.json')
const semanticKindsPath = resolve(root, 'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json')
const writeMode = process.argv.includes('--write')

const ids = {
  safetyParent: '1911920e-b099-4310-82f2-b47f51a78b33',
  safety: '5ddba212-9e0a-5dd4-8274-239ec51ab6a8',
  thunder: 'c156d2fb-0fe9-5f13-8baa-3e74d7da151e',
  resistanceParent: 'ec5cac7b-ad31-590c-8ab0-5b3ef24d2bca',
  iv: '66256e22-44a3-5939-8862-821e29d6711d',
  factors: 'af7855a3-6aea-5e05-8505-248bc9a8c219',
  documentation: 'ad62f563-4fee-5399-8d9c-03a214658aa9',
  presentation: '6d323d54-0aee-55d0-a9e1-ef2efdea0346',
  electrostaticPrerequisite: 'dc7dd287-6eac-574d-818d-65cfb23a2d94',
  documentationPrerequisiteA: 'd3c153b9-e09b-5668-8386-73105546a7c1',
  documentationPrerequisiteB: '5355fee0-0477-5570-a234-561477bf77ba',
  solarExperiment: '0dd1e39c-8557-5a4e-b467-caae964fff67',
  solarEvaluation: '46e42b07-c098-5d65-8ef5-8472b7c4d8e2',
  solarAssessment: 'def74475-7126-5e55-8517-498951118f26',
  bwEnergyAssessment: '4996346f-ab5d-4d09-9b9e-b9e559af153d',
  safetyAssessment: '77257ded-ccf0-521f-8a8c-38c8f85fd3ca',
  resistanceAssessment: '5a530302-1303-517f-82cc-9cd457b792a8',
} as const

const targetViews = [
  'de-by-gk.view.json',
  'de-by-lk.view.json',
  'de-de-gym-physics-gk.view.json',
  'de-de-gym-physics-lk.view.json',
  'de-de-gym-seki-physics.view.json',
] as const

const bwMotivationViews = [
  'de-bw-gk.view.json',
  'de-bw-lk.view.json',
  'de-by-gk.view.json',
  'de-by-lk.view.json',
  'de-de-gym-physics-gk.view.json',
  'de-de-gym-physics-lk.view.json',
  'de-de-gym-seki-physics.view.json',
] as const

const genericViews = [
  'de-de-gym-physics-gk.view.json',
  'de-de-gym-physics-lk.view.json',
  'de-de-gym-seki-physics.view.json',
] as const

const bwSpecificViews = ['de-bw-gk.view.json', 'de-bw-lk.view.json'] as const

const parse = (path: string): RecordJson => JSON.parse(readFileSync(path, 'utf8')) as RecordJson
const serialize = (value: Json): string => `${JSON.stringify(value, null, 2)}\n`
const goalEntry = (goalId: string, projectionRole?: string): RecordJson => ({
  kind: 'goalEntry',
  goalId,
  ...(projectionRole ? { projectionRole } : {}),
})
const appendToSekI = (view: RecordJson, entry: RecordJson): void => {
  const rootChildren = ((view.rootNodes as RecordJson[])[0]?.children as Json[])
  const sekiStructure = rootChildren.find((candidate) => (
    candidate && typeof candidate === 'object' && !Array.isArray(candidate)
    && (candidate as RecordJson).kind === 'structure'
    && String((candidate as RecordJson).id).includes('seki')
  )) as RecordJson | undefined
  if (!sekiStructure || !Array.isArray(sekiStructure.children)) throw new Error('Missing Sek-I structure')
  ;(sekiStructure.children as Json[]).push(entry)
}

const canonical = parse(canonicalPath)
const goals = canonical.goals as RecordJson[]
const byId = new Map(goals.map((goal) => [String(goal.id), goal]))

if (!byId.has(ids.bwEnergyAssessment)) {
  const goal: RecordJson = {
    id: ids.bwEnergyAssessment,
    shortKey: 'canonical_physics_sek1_assessment_bw_electrical_energy_conversions',
    title: 'Prüfungsaufgabe: Elektrische Energieumwandlungen beurteilen',
    titleEn: 'Assessment Task: Assess Electrical Energy Conversions',
    description: 'Die lernende Person kann an einer einfachen elektrischen Anwendung die Energieumwandlungskette beschreiben, nutzbare und unerwünschte Energieübertragungen unterscheiden und die Eignung der Anwendung qualitativ beurteilen.',
    descriptionEn: 'The learner can describe the energy-conversion chain in a simple electrical application, distinguish useful from unwanted energy transfers, and qualitatively assess the suitability of the application.',
    weight: 1,
    tags: ['GK', 'LK', 'Practice', 'Assessment', 'canonical', 'SekI'],
    dimensionTags: {
      framework: 'canonical-gymnasium-physics', demandLevel: 'AB2',
      processCompetencies: ['PK2_MODELLIEREN', 'PK5_BEWERTEN'],
      guidingIdeas: ['LI_ENERGIE', 'LI_TECHNIK'], phase: 'GLOBAL',
      area: 'Elektrische Energie',
      topicCode: 'CANONICAL.PHYSICS.SEK1.PRACTICE.BW.ELECTRICAL_ENERGY_CONVERSIONS',
    },
    requires: ['cbb26ed2-6979-46f6-a4ae-128f5c5d9d76'],
    contains: [], examples: [], type: 'atomic',
    applicability: { jurisdiction: ['DE-BW'] },
    extendedData: { applicabilityMappingInheritance: 'boundary', applicabilityOverrides: { jurisdiction: ['DE-BW'] } },
    examData: {
      reviewStatus: 'released',
      coveredGoalIds: ['cbb26ed2-6979-46f6-a4ae-128f5c5d9d76'],
      coveredStrands: ['LI_ENERGIE', 'LI_TECHNIK'], demandLevels: ['AB1', 'AB2'],
      taskContent: '**Aufgabe:** Ein Wasserkocher erwärmt Wasser. Beschreiben Sie die Energieumwandlungskette vom Stromnetz bis zum warmen Wasser. Benennen Sie nutzbare und unerwünschte Energieübertragungen, vergleichen Sie den Wasserkocher qualitativ mit dem Erwärmen im offenen Topf und begründen Sie, welche Nutzung unter gleichen Bedingungen energetisch geeigneter ist. (12 BE)',
      solutionContent: 'Elektrische Energie wird im Heizelement in innere Energie umgewandelt und überwiegend auf das Wasser übertragen. Unerwünschte Anteile erwärmen Gehäuse und Umgebung. Der geschlossene Wasserkocher begrenzt Wärmeverluste typischerweise besser als ein offener Topf; die Beurteilung muss Nutzenergie, Verluste und gleiche Vergleichsbedingungen ausdrücklich berücksichtigen.',
      scoring: { maxPoints: 12, passingPoints: 7, steps: [
        { id: 'energy_conversion_1', points: 4, description: 'Energieumwandlungskette fachlich korrekt beschrieben' },
        { id: 'energy_conversion_2', points: 4, description: 'Nutzbare und unerwünschte Energieübertragungen unterschieden' },
        { id: 'energy_conversion_3', points: 4, description: 'Anwendungen unter gleichen Bedingungen qualitativ begründet beurteilt' },
      ] },
    },
  }
  goals.push(goal)
  byId.set(ids.bwEnergyAssessment, goal)
}
const bwEnergyAssessment = byId.get(ids.bwEnergyAssessment)!
bwEnergyAssessment.applicability = { jurisdiction: ['DE-BW'] }
bwEnergyAssessment.extendedData = {
  applicabilityMappingInheritance: 'boundary',
  applicabilityOverrides: { jurisdiction: ['DE-BW'] },
}
const sekiPracticeCluster = byId.get('21ab0854-4d67-5233-9495-ae208e152a3c')
if (!sekiPracticeCluster || !Array.isArray(sekiPracticeCluster.contains)) {
  throw new Error('Missing Sek-I physics practice cluster')
}
if (!sekiPracticeCluster.contains.includes(ids.bwEnergyAssessment)) {
  sekiPracticeCluster.contains.push(ids.bwEnergyAssessment)
}

const setAssessment = (goalId: string, coveredGoalIds: string[]): void => {
  const goal = byId.get(goalId)
  if (!goal) throw new Error(`Missing assessment ${goalId}`)
  if (!goal.examData || typeof goal.examData !== 'object' || Array.isArray(goal.examData)) {
    throw new Error(`${goalId} is not an assessment`)
  }
  goal.requires = coveredGoalIds
  ;(goal.examData as RecordJson).coveredGoalIds = coveredGoalIds
}

setAssessment(ids.safetyAssessment, [ids.safety, ids.documentation, ids.presentation])
setAssessment(ids.resistanceAssessment, [ids.iv, '8f833b36-4126-52db-b210-79fb0023c7d9'])
const safetyAssessment = byId.get(ids.safetyAssessment)!
safetyAssessment.description = 'Die lernende Person kann Gefahren in elektrischen Anlagen und Haushaltsstromkreisen fachlich beurteilen und die begründeten Schutzentscheidungen adressatengerecht und fachsprachlich präsentieren.'
safetyAssessment.descriptionEn = 'The learner can assess hazards in electrical installations and household circuits and present justified protective decisions to an audience using appropriate scientific language.'

const transformChildren = (value: Json, bySpecific: boolean): Json => {
  if (Array.isArray(value)) {
    const next: Json[] = []
    for (const child of value) {
      if (child && typeof child === 'object' && !Array.isArray(child)) {
        const node = child as RecordJson
        const targetRole = node.projectionRole === undefined || node.projectionRole === 'target'
        if (node.kind === 'canonicalSubtree' && targetRole && node.goalId === ids.safetyParent) {
          next.push(
            goalEntry(ids.safety),
            goalEntry(ids.thunder, bySpecific ? 'prerequisiteOnly' : undefined),
          )
          continue
        }
        if (node.kind === 'canonicalSubtree' && targetRole && node.goalId === ids.resistanceParent) {
          next.push(
            goalEntry(ids.iv),
            goalEntry(ids.factors, bySpecific ? 'prerequisiteOnly' : undefined),
          )
          continue
        }
      }
      next.push(transformChildren(child, bySpecific))
    }
    return next
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, transformChildren(child, bySpecific)]))
  }
  return value
}

const removeAssessmentEntries = (value: Json): Json => {
  if (Array.isArray(value)) {
    return value
      .filter((entry) => !(
        entry && typeof entry === 'object' && !Array.isArray(entry)
        && (entry as RecordJson).kind === 'goalEntry'
        && [(ids.safetyAssessment), (ids.resistanceAssessment), (ids.bwEnergyAssessment)].includes(String((entry as RecordJson).goalId) as never)
      ))
      .map(removeAssessmentEntries)
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, removeAssessmentEntries(child)]))
  }
  return value
}

const removeDirectGoalEntry = (value: Json, goalId: string): Json => {
  if (Array.isArray(value)) return value
    .filter((entry) => !(
      entry && typeof entry === 'object' && !Array.isArray(entry)
      && (entry as RecordJson).kind === 'goalEntry'
      && (entry as RecordJson).goalId === goalId
    ))
    .map((entry) => removeDirectGoalEntry(entry, goalId))
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, removeDirectGoalEntry(entry, goalId)]))
  }
  return value
}

const outputs = new Map<string, string>()
outputs.set(canonicalPath, serialize(canonical))

const acceptedWarnings = parse(acceptedWarningsPath)
const warningEntries = acceptedWarnings.acceptedWarnings as RecordJson[]
if (!warningEntries.some((entry) => entry.code === 'APV-201' && entry.goalId === ids.bwEnergyAssessment)) {
  warningEntries.push({
    code: 'APV-201', landscapeId: String(canonical.landscapeId), goalId: ids.bwEnergyAssessment,
    dimension: 'jurisdiction',
    rationale: 'Intentional BW-only terminal assessment for the BW-visible qualitative electrical-energy-conversion goal; the narrower endpoint avoids importing the additional solar-laboratory competencies required by the existing national solar assessment.',
  })
}
outputs.set(acceptedWarningsPath, serialize(acceptedWarnings))

const semanticKinds = parse(semanticKindsPath)
const semanticDecisions = semanticKinds.decisions as RecordJson[]
for (const goalId of [
  ids.safetyAssessment,
  ids.resistanceAssessment,
  '21ab0854-4d67-5233-9495-ae208e152a3c',
]) {
  const goal = byId.get(goalId)
  const decision = semanticDecisions.find((entry) => entry.goalId === goalId)
  if (!goal || !decision) throw new Error(`Missing semantic-kind binding for ${goalId}`)
  decision.sourceFingerprint = fingerprintSemanticKindSourceGoal(goal as never)
}
const semanticDecision = {
  goalId: ids.bwEnergyAssessment,
  sourceFingerprint: fingerprintSemanticKindSourceGoal(bwEnergyAssessment as never),
  semanticKind: 'practiceAssessment',
  decisionStatus: 'authoritative',
  decisionBasis: 'reviewed-current-post-split-practice-assessment',
} as RecordJson
const existingSemanticIndex = semanticDecisions.findIndex((entry) => entry.goalId === ids.bwEnergyAssessment)
if (existingSemanticIndex >= 0) semanticDecisions[existingSemanticIndex] = semanticDecision
else semanticDecisions.push(semanticDecision)
semanticDecisions.sort((a, b) => String(a.goalId).localeCompare(String(b.goalId)))
const semanticCounts: Record<string, number> = {}
for (const entry of semanticDecisions) {
  const kind = String(entry.semanticKind)
  semanticCounts[kind] = (semanticCounts[kind] ?? 0) + 1
}
semanticCounts.total = semanticDecisions.length
semanticKinds.counts = semanticCounts
outputs.set(semanticKindsPath, serialize(semanticKinds))

for (const file of targetViews) {
  const path = resolve(viewRoot, file)
  const view = removeAssessmentEntries(transformChildren(parse(path), file.startsWith('de-by-'))) as RecordJson
  const rootNodes = view.rootNodes as RecordJson[]
  const rootChildren = rootNodes[0]?.children as Json[]
  const sekiStructure = rootChildren.find((entry) => (
    entry && typeof entry === 'object' && !Array.isArray(entry)
    && (entry as RecordJson).kind === 'structure'
    && String((entry as RecordJson).id).includes('seki')
  )) as RecordJson | undefined
  if (!sekiStructure || !Array.isArray(sekiStructure.children)) {
    throw new Error(`Missing Sek-I structure in ${file}`)
  }
  ;(sekiStructure.children as Json[]).push(
    goalEntry(ids.safetyAssessment),
    goalEntry(ids.resistanceAssessment),
  )
  outputs.set(path, serialize(view))
}

for (const file of bwMotivationViews) {
  const path = resolve(viewRoot, file)
  const view = JSON.parse(outputs.get(path) ?? readFileSync(path, 'utf8')) as RecordJson
  const rootNodes = view.rootNodes as RecordJson[]
  const rootChildren = rootNodes[0]?.children as Json[]
  if (!rootChildren.some((entry) => (
    entry && typeof entry === 'object' && !Array.isArray(entry)
    && (entry as RecordJson).goalId === ids.electrostaticPrerequisite
  ))) {
    rootChildren.splice(1, 0, goalEntry(ids.electrostaticPrerequisite, 'prerequisiteOnly'))
  }
  outputs.set(path, serialize(view))
}

for (const file of genericViews) {
  const path = resolve(viewRoot, file)
  const view = removeDirectGoalEntry(
    JSON.parse(outputs.get(path) ?? readFileSync(path, 'utf8')) as RecordJson,
    ids.solarEvaluation,
  ) as RecordJson
  const rootChildren = ((view.rootNodes as RecordJson[])[0]?.children as Json[])
  for (const goalId of [
    ids.documentation,
    ids.documentationPrerequisiteA,
    ids.documentationPrerequisiteB,
    ids.solarExperiment,
  ]) {
    if (!JSON.stringify(view).includes(goalId)) rootChildren.splice(1, 0, goalEntry(goalId, 'prerequisiteOnly'))
  }
  outputs.set(path, serialize(view))
}

for (const file of bwSpecificViews) {
  const path = resolve(viewRoot, file)
  const view = removeDirectGoalEntry(
    JSON.parse(outputs.get(path) ?? readFileSync(path, 'utf8')) as RecordJson,
    ids.bwEnergyAssessment,
  ) as RecordJson
  if (!JSON.stringify(view).includes(ids.solarAssessment)) appendToSekI(view, goalEntry(ids.solarAssessment))
  if (!JSON.stringify(view).includes(ids.resistanceAssessment)) appendToSekI(view, goalEntry(ids.resistanceAssessment))
  if (!JSON.stringify(view).includes(ids.bwEnergyAssessment)) appendToSekI(view, goalEntry(ids.bwEnergyAssessment))
  outputs.set(path, serialize(view))
}

for (const file of genericViews) {
  const path = resolve(viewRoot, file)
  const view = removeDirectGoalEntry(
    JSON.parse(outputs.get(path) ?? readFileSync(path, 'utf8')) as RecordJson,
    ids.bwEnergyAssessment,
  ) as RecordJson
  if (!JSON.stringify(view).includes(ids.bwEnergyAssessment)) appendToSekI(view, goalEntry(ids.bwEnergyAssessment))
  outputs.set(path, serialize(view))
}

let changed = 0
for (const [path, expected] of outputs) {
  const current = readFileSync(path, 'utf8')
  if (current === expected) continue
  changed += 1
  if (writeMode) writeFileSync(path, expected)
}

console.log(`CHECK physics_batch015_route_view_stabilization ${writeMode ? 'WRITE' : 'DRY_RUN'} changedFiles=${changed}`)
