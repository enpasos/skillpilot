import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel'

// The bounded Layer-A ledgers use several historic JSON shapes.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonRecord = Record<string, any>

const repoRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')
const allowedArguments = new Set(['--write', '--check'])
const unexpectedArguments = process.argv.slice(2).filter((argument) => !allowedArguments.has(argument))
if (unexpectedArguments.length > 0) throw new Error(`Unexpected arguments: ${unexpectedArguments.join(', ')}`)
if (writeMode && process.argv.includes('--check')) throw new Error('Use either --write or --check, not both')

const reviewedAt = '2026-09-05'
const reviewer = 'codex-mathematics-b032r-vertex-form-split-adjudication-2026-09-05'
const landscapeId = '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'
const retainedId = '5bced7dc-6557-4af1-9e70-d87f850d3b7f'
const newShortKey = 'canonical_math_sek1_j9_vertex_form_zeros_justify_determine'
const newId = 'f7dcf8c8-06c1-5972-b02a-9d35e5ab7600'
const successorId = 'e0c3359d-7d8a-4d01-a25e-a8cd5ebce90e'
const squareRootsId = 'f8704a7b-e93d-4e32-b0f9-1b171545fe28'
const representationClusterId = '18eb8537-5d25-4252-9450-ea8c42270211'
const equationClusterId = 'd4a9fc20-d1be-46e7-86e9-2bf8d7a9cc40'
const quadraticEquationsId = '9023226b-fc17-412b-807c-2bb45cd551d5'
const byParentSourceId = 'c74ac5a2-32bb-5c9c-af1a-627fe7b55782'
const byZerosSourceId = 'by-math-m9-2-1-c74ac5a2-s02-8b94049257'
const sourceLandscapeId = 'c1600692-e543-5cf2-a399-6bd96e6b817f'

const retainedBefore = {
  description: 'Die lernende Person kann bei quadratischen Funktionen der Form f(x) = a(x + d)^2 + e mit a ≠ 0 die Wirkung von a, d und e auf Scheitelpunktlage, Öffnungsrichtung und Streckung oder Stauchung der Parabel beschreiben, daraus die Anzahl der Nullstellen begründen und die Lösungen von f(x) = 0 in einfachen Fällen graphisch und rechnerisch bestimmen.',
  descriptionEn: 'The learner can describe how a, d, and e in quadratic functions of the form f(x) = a(x + d)^2 + e, with a ≠ 0, affect the vertex position, opening direction, and vertical stretch or compression of the parabola, use this to justify the number of zeros, and determine the solutions of f(x) = 0 graphically and algebraically in simple cases.',
} as const

const retainedAfter = {
  description: 'Die lernende Person kann bei quadratischen Funktionen der Form f(x) = a(x + d)^2 + e mit a ≠ 0 die Wirkung von a, d und e auf Scheitelpunktlage, Symmetrieachse, Öffnungsrichtung und Streckung oder Stauchung der Parabel beschreiben und an Term und Graph begründen.',
  descriptionEn: 'The learner can describe and justify, using the formula and graph, how a, d, and e in quadratic functions of the form f(x) = a(x + d)^2 + e, with a ≠ 0, affect the vertex position, axis of symmetry, opening direction, and vertical stretch or compression of the parabola.',
} as const

const createdGoalBeforeRouteCorrection: JsonRecord = {
  id: newId,
  shortKey: newShortKey,
  title: 'Nullstellen quadratischer Funktionen in Scheitelpunktform begründen und bestimmen',
  titleEn: 'Justify and determine zeros of quadratic functions in vertex form',
  description: 'Die lernende Person kann bei quadratischen Funktionen der Form f(x) = a(x + d)^2 + e mit a ≠ 0 Nullstellen als Schnittpunkte mit der x-Achse und als Lösungen von f(x) = 0 aufeinander beziehen, ihre Anzahl aus Scheitelpunktlage und Öffnungsrichtung begründen und die Lösungen in einfachen Fällen graphisch und rechnerisch bestimmen.',
  descriptionEn: 'The learner can relate the zeros of quadratic functions of the form f(x) = a(x + d)^2 + e, with a ≠ 0, as x-axis intersections to the solutions of f(x) = 0, justify their number from the vertex position and opening direction, and determine the solutions graphically and algebraically in simple cases.',
  core: true,
  weight: 1,
  tags: ['canonical', 'modality:visual', 'representation:graph', 'tool:geogebra'],
  applicability: {
    jurisdiction: [
      'DE-BB', 'DE-BE', 'DE-BW', 'DE-BY', 'DE-HB', 'DE-HE', 'DE-HH', 'DE-MV',
      'DE-NI', 'DE-NW', 'DE-RP', 'DE-SH', 'DE-SL', 'DE-SN', 'DE-ST', 'DE-TH',
    ],
  },
  resourceLinks: [{
    type: 'tool',
    title: 'GeoGebra Graphing Calculator',
    url: 'https://www.geogebra.org/graphing',
    resourceType: 'graphing-calculator',
    provider: 'GeoGebra',
    description: 'Dynamischer Graphikrechner für Visualisierung und gemeinsame Arbeit an Koordinatensystemen, Graphen und Funktionsdarstellungen.',
    lang: 'mul',
  }],
  dimensionTags: {
    framework: 'canonical-gymnasium-math',
    demandLevel: 'AB1',
    processCompetencies: ['K1.1', 'K4.1', 'K5.1'],
    guidingIdeas: ['L1', 'L4'],
    phase: 'J9',
    area: 'Analysis',
    topicCode: 'CANONICAL.MATH.SEK1.J9.2B1',
  },
  contains: [],
  requires: [retainedId, squareRootsId],
  type: 'atomic',
  semanticAtomic: true,
}

const createdGoal: JsonRecord = {
  ...createdGoalBeforeRouteCorrection,
  requires: [retainedId, successorId, squareRootsId],
}

const paths = {
  canonical: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
  provenance: 'curricula/DE/Gymnasium/provenance/canonical-goal-provenance-registry.json',
  semanticKinds: 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json',
  atomicity: 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-math-full.review.jsonl',
  memory: 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-math-full.review.jsonl',
  visualizationQa: 'curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json',
  byReview: 'curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_math_source_extraction_to_canonical_math.review.json',
  byDirect: 'curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_math_to_canonical_math.json',
  byGkView: 'curricula/DE/Gymnasium/composition-views/mathematik/de-by-gk.view.json',
  byLkView: 'curricula/DE/Gymnasium/composition-views/mathematik/de-by-lk.view.json',
  atlasNavigation: 'app/scripts/config/goal-books/navigation/de-gym-math-national-atlas.view.json',
  atlasSources: 'app/scripts/config/goal-books/de-gym-math-national-atlas.sources.json',
  goalBookModelTest: 'app/scripts/testGoalBookModel.ts',
  goalBookPublicationTest: 'app/scripts/testGoalBookPublication.ts',
  inFlightLedger: 'curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json',
  recheckConfig: 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-05/batch-032s-vertex-form-split-final-current-recheck-4-v1.config.json',
  roundA: 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-05/batch-032r-adjudicated-final-recheck-10-v1/round-a/results/mathematik-rollout-v1-batch-032r-adjudicated-final-recheck-10-v1-20260905-first-pass-a.batch-001.records.jsonl',
  roundB: 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-05/batch-032r-adjudicated-final-recheck-10-v1/round-b/results/mathematik-rollout-v1-batch-032r-adjudicated-final-recheck-10-v1-20260905-first-pass-b.batch-001.records.jsonl',
} as const

const oldBatchConfig = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-05/batch-032-atlas-next-20-v1.config.json'
const weightTransitions = new Map<string, readonly [number, number]>([
  [equationClusterId, [7, 8]],
  ['2e00d486-59ca-4c93-9dc9-e6921d0af627', [6, 7]],
  ['5a9702f4-7e4d-457d-b98c-f0bafcd1e386', [10, 11]],
  ['88f8e185-a89b-4a34-869d-766042977f38', [41, 42]],
  ['5c6b7342-0f67-4b4c-894d-fd83a6df64b3', [14, 15]],
  ['902de188-6f27-47c2-ace1-9b2c5771fde8', [54, 55]],
  ['c01b1ce9-a667-4a46-b251-ec33ae602b15', [922, 923]],
])

const absolute = (path: string): string => resolve(repoRoot, path)
const readJson = (path: string): JsonRecord => JSON.parse(readFileSync(absolute(path), 'utf8')) as JsonRecord
const readJsonl = (path: string): JsonRecord[] => readFileSync(absolute(path), 'utf8').split(/\r?\n/u)
  .filter((line) => line.trim() !== '').map((line) => JSON.parse(line) as JsonRecord)
const serializeJson = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`
const serializeJsonl = (records: JsonRecord[]): string => `${records.map((record) => JSON.stringify(record)).join('\n')}\n`
const stableJson = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (value && typeof value === 'object') return `{${Object.entries(value as JsonRecord)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, nested]) => `${JSON.stringify(key)}:${stableJson(nested)}`).join(',')}}`
  return JSON.stringify(value) ?? 'null'
}
const same = (left: unknown, right: unknown): boolean => stableJson(left) === stableJson(right)
const digest = (value: string | Uint8Array): string => `sha256:${createHash('sha256').update(value).digest('hex')}`
const normalize = (value: unknown): string => String(value ?? '').normalize('NFKC').replace(/\s+/gu, ' ').trim()
const reviewFingerprint = (goal: JsonRecord, ruleVersion: string): string => digest(stableJson({
  ruleVersion,
  goalId: goal.id,
  shortKey: goal.shortKey ?? '',
  title: normalize(goal.title),
  titleEn: normalize(goal.titleEn),
  description: normalize(goal.description),
  descriptionEn: normalize(goal.descriptionEn),
  phase: normalize(goal.dimensionTags?.phase),
  area: normalize(goal.dimensionTags?.area),
  topicCode: normalize(goal.dimensionTags?.topicCode),
  nodeKind: normalize(goal.nodeKind),
}))
const deterministicGoalId = (shortKey: string): string => {
  const value = createHash('sha1').update(`DE-GYM-CANONICAL-MATH:${shortKey}`).digest('hex')
  return `${value.slice(0, 8)}-${value.slice(8, 12)}-5${value.slice(13, 16)}-${((Number.parseInt(value[16]!, 16) & 0x3) | 0x8).toString(16)}${value.slice(17, 20)}-${value.slice(20, 32)}`
}
if (deterministicGoalId(newShortKey) !== newId) throw new Error('B032r split-child ID is not deterministic RFC 4122 UUIDv5')

const outputs = new Map<string, string>()

const assertRoundEvidence = (): void => {
  const specs = [
    { path: paths.roundA, sha256: 'sha256:033ccb404485764736226d360cb246521004432b661d9b4e7ec2d39ca7f45a40', decision: 'split_review' },
    { path: paths.roundB, sha256: 'sha256:f3143b04c4fb0da1b57bfe97c06c2eb64733e1b98e554d092a43e93a69bbbfd7', decision: 'keep' },
  ]
  for (const spec of specs) {
    const bytes = readFileSync(absolute(spec.path))
    if (digest(bytes) !== spec.sha256) throw new Error(`${spec.path}: completed independent-round evidence drifted`)
    const records = bytes.toString('utf8').split(/\r?\n/u).filter(Boolean).map((line) => JSON.parse(line) as JsonRecord)
    const matches = records.filter((record) => record.goalId === retainedId)
    if (matches.length !== 1 || matches[0].decision !== spec.decision) {
      throw new Error(`${spec.path}: missing expected ${spec.decision} record for ${retainedId}`)
    }
  }
}
assertRoundEvidence()

const canonical = readJson(paths.canonical)
if (canonical.landscapeId !== landscapeId) throw new Error('Unexpected canonical Mathematics landscape')
const goals = canonical.goals as JsonRecord[]
const initialNew = goals.filter((goal) => goal.id === newId)
if (goals.length !== (initialNew.length === 0 ? 1178 : 1179) || initialNew.length > 1) {
  throw new Error('Canonical Mathematics is outside exact B032r before/after cardinality')
}
let goalById = new Map(goals.map((goal) => [String(goal.id), goal]))
if (goalById.size !== goals.length) throw new Error('Duplicate canonical Mathematics goal IDs')

const retained = goalById.get(retainedId)
if (!retained || retained.type !== 'atomic' || !same(retained.contains, [])) throw new Error('Retained B032r goal is not the expected atom')
if (retained.title !== 'Parameter quadratischer Funktionen in Scheitelpunktform deuten'
  || retained.titleEn !== 'Interpret parameters of quadratic functions in vertex form') {
  throw new Error('Retained B032r ID/title contract drifted')
}
if (!same({ description: retained.description, descriptionEn: retained.descriptionEn }, retainedBefore)
  && !same({ description: retained.description, descriptionEn: retained.descriptionEn }, retainedAfter)) {
  throw new Error('Retained B032r bilingual description is outside bounded states')
}
if (!same(retained.requires, ['af3d6bff-c5fb-4ec6-a9f0-c0be09fc9186', '65365dce-f33f-49d8-9516-42f75883aa86'])) {
  throw new Error('Retained B032r prerequisites drifted')
}
retained.description = retainedAfter.description
retained.descriptionEn = retainedAfter.descriptionEn

let created = goalById.get(newId)
if (created
  && !same(created, createdGoalBeforeRouteCorrection)
  && !same(created, createdGoal)) {
  throw new Error(`${newId}: foreign split-child state`)
}
if (!created) {
  const equationIndex = goals.findIndex((goal) => goal.id === quadraticEquationsId)
  if (equationIndex < 0) throw new Error(`Cannot place ${newId} near ${quadraticEquationsId}`)
  goals.splice(equationIndex, 0, createdGoal)
  created = createdGoal
  goalById = new Map(goals.map((goal) => [String(goal.id), goal]))
} else {
  Object.assign(created, createdGoal)
}

const successor = goalById.get(successorId)
const successorRoute = [retainedId, '65365dce-f33f-49d8-9516-42f75883aa86', 'af3d6bff-c5fb-4ec6-a9f0-c0be09fc9186']
const successorMiswiredB032rRoute = [newId, '65365dce-f33f-49d8-9516-42f75883aa86', 'af3d6bff-c5fb-4ec6-a9f0-c0be09fc9186']
if (!successor
  || (!same(successor.requires, successorRoute)
    && !same(successor.requires, successorMiswiredB032rRoute))) {
  throw new Error(`${successorId}: prerequisite route is outside bounded before/after states`)
}
successor.requires = successorRoute

const representationCluster = goalById.get(representationClusterId)
if (!representationCluster || !same(representationCluster.contains, [retainedId, successorId, '7bff61c1-1a69-4991-97de-0cff764f507e'])) {
  throw new Error('Retained B032r goal left its exact representation cluster')
}
const equationCluster = goalById.get(equationClusterId)
const equationChildrenBefore = ['c23705d2-57fc-4260-80d8-2d340203a173', 'f9443306-709d-49dc-9747-853f37cfe4fa', quadraticEquationsId, '39fa30f2-e1ae-5c36-be56-793b77906abb']
const equationChildrenAfter = ['c23705d2-57fc-4260-80d8-2d340203a173', 'f9443306-709d-49dc-9747-853f37cfe4fa', newId, quadraticEquationsId, '39fa30f2-e1ae-5c36-be56-793b77906abb']
if (!equationCluster || (!same(equationCluster.contains, equationChildrenBefore) && !same(equationCluster.contains, equationChildrenAfter))) {
  throw new Error('Equation-cluster child order is outside bounded before/after states')
}
equationCluster.contains = equationChildrenAfter

for (const [goalId, [before, after]] of weightTransitions) {
  const goal = goalById.get(goalId)
  if (!goal || (goal.weight !== before && goal.weight !== after)) throw new Error(`${goalId}: weight outside ${before}->${after}`)
  goal.weight = after
}

const exams = goals.filter((goal) => goal.examData)
for (const exam of exams) {
  if ((exam.requires ?? []).some((id: string) => id === retainedId || id === newId)
    || (exam.examData.coveredGoalIds ?? []).some((id: string) => id === retainedId || id === newId)) {
    throw new Error(`${exam.id}: B032r adjudication forbids an exam mapping for retained/new goal`)
  }
}
outputs.set(paths.canonical, serializeJson(canonical))

const byReview = readJson(paths.byReview)
const byDecisions = byReview.decisions as JsonRecord[]
const byReviewMappings = byReview.mappings as JsonRecord[]
const parentDecisions = byDecisions.filter((decision) => decision.sourceGoalId === byParentSourceId)
if (parentDecisions.length !== 1 || !same(parentDecisions[0].canonicalGoalIds, [retainedId]) || parentDecisions[0].matchType !== 'exact') {
  throw new Error('Parameter-only BY c74ac5a2 decision must remain exact on retained goal')
}
const parentMappings = byReviewMappings.filter((mapping) => mapping.legacyGoalId === byParentSourceId)
if (parentMappings.length !== 1 || parentMappings[0].canonicalGoalId !== retainedId || parentMappings[0].matchType !== 'exact') {
  throw new Error('Parameter-only BY c74ac5a2 projection must remain exact on retained goal')
}
const zerosDecisions = byDecisions.filter((decision) => decision.sourceGoalId === byZerosSourceId)
if (zerosDecisions.length !== 1 || !Array.isArray(zerosDecisions[0].canonicalGoalIds)
  || !zerosDecisions[0].canonicalGoalIds.every((id: string) => id === retainedId || id === newId)) {
  throw new Error('BY s02 decision is outside bounded retained/new states')
}
Object.assign(zerosDecisions[0], {
  canonicalGoalIds: [newId],
  matchType: 'exact',
  rationale: 'Der eigenständige Source-Extraction-Aspekt verlangt die Anzahl der Nullstellen sowie die graphische und rechnerische Bestimmung der Lösungen der zugehörigen Gleichung. Er entspricht damit exakt dem adjudizierten neuen kanonischen Nullstellenziel; die reine Parameterwirkung bleibt am Parent-Aspekt c74ac5a2.',
  reviewedAt,
  reviewer,
  evidence: {
    ...(zerosDecisions[0].evidence ?? {}),
    method: 'batch-032r-source-exact-structural-split-adjudication',
    adjudication: 'mathematik-b032r-vertex-form-split-2026-09-05',
    retainedCanonicalGoalId: retainedId,
    newCanonicalGoalId: newId,
    routedAspect: 'vertex-form-zeros-and-equation-solutions',
  },
})
const zerosMappings = byReviewMappings.filter((mapping) => mapping.legacyGoalId === byZerosSourceId)
if (zerosMappings.length !== 1 || ![retainedId, newId].includes(zerosMappings[0].canonicalGoalId)) {
  throw new Error('BY s02 projected mapping is outside bounded retained/new states')
}
Object.assign(zerosMappings[0], { canonicalGoalId: newId, matchType: 'exact' })
outputs.set(paths.byReview, serializeJson(byReview))

const byDirect = readJson(paths.byDirect)
const byDirectMappings = byDirect.mappings as JsonRecord[]
const legacyEdges = byDirectMappings.filter((mapping) => mapping.legacyGoalId === byParentSourceId)
if (legacyEdges.length < 1 || legacyEdges.length > 2
  || legacyEdges.some((mapping) => ![retainedId, newId].includes(mapping.canonicalGoalId))) {
  throw new Error('Unsplit legacy BY c74ac5a2 edges are outside bounded before/after states')
}
const retainedLegacy = legacyEdges.find((mapping) => mapping.canonicalGoalId === retainedId)
if (!retainedLegacy) throw new Error('Unsplit legacy BY source must retain the parameter edge')
retainedLegacy.matchType = 'partial'
if (!legacyEdges.some((mapping) => mapping.canonicalGoalId === newId)) {
  byDirectMappings.splice(byDirectMappings.indexOf(retainedLegacy) + 1, 0, {
    legacyGoalId: byParentSourceId,
    canonicalGoalId: newId,
    matchType: 'partial',
  })
}
outputs.set(paths.byDirect, serializeJson(byDirect))

const provenanceRegistry = readJson(paths.provenance)
const provenanceLandscape = (provenanceRegistry.landscapes as JsonRecord[])
  .find((landscape) => landscape.landscapeId === landscapeId)
if (!provenanceLandscape?.goalProvenance) throw new Error('Missing Mathematics provenance registry entry')
const provenance = provenanceLandscape.goalProvenance as JsonRecord
const retainedProvenance = { sourceLandscapeId, sourceGoalId: byParentSourceId }
const childProvenance = { sourceLandscapeId, sourceGoalId: byZerosSourceId }
if (!same(provenance[retainedId], retainedProvenance)) throw new Error('Retained B032r provenance drifted')
if (provenance[newId] && !same(provenance[newId], childProvenance)) throw new Error('Split-child provenance is foreign')
provenance[newId] = childProvenance
provenanceLandscape.goalProvenance = Object.fromEntries(Object.entries(provenance)
  .sort(([left], [right]) => left.localeCompare(right)))
outputs.set(paths.provenance, serializeJson(provenanceRegistry))

const semanticKinds = readJson(paths.semanticKinds)
const semanticDecisions = semanticKinds.decisions as JsonRecord[]
const semanticById = new Map(semanticDecisions.map((decision) => [String(decision.goalId), decision]))
const childSemantic = {
  goalId: newId,
  sourceFingerprint: fingerprintSemanticKindSourceGoal(created),
  semanticKind: 'curricularAtomic',
  decisionStatus: 'authoritative',
  decisionBasis: 'reviewed-current-structural-split-curricular-atomic',
}
const existingChildSemantic = semanticById.get(newId)
if (existingChildSemantic && !same(existingChildSemantic, childSemantic)) throw new Error('Split-child semantic-kind decision is foreign')
if (!existingChildSemantic) {
  const insertionIndex = semanticDecisions.findIndex((decision) => decision.goalId === quadraticEquationsId)
  if (insertionIndex < 0) throw new Error('Cannot place split-child semantic-kind decision')
  semanticDecisions.splice(insertionIndex, 0, childSemantic)
  semanticById.set(newId, childSemantic)
}
for (const goalId of [retainedId, newId, successorId, equationClusterId]) {
  const goal = goalById.get(goalId)
  const decision = semanticById.get(goalId)
  if (!goal || !decision || decision.decisionStatus !== 'authoritative') throw new Error(`${goalId}: missing authoritative semantic kind`)
  decision.sourceFingerprint = fingerprintSemanticKindSourceGoal(goal)
}
if (![794, 795].includes(semanticKinds.counts.curricularAtomic) || ![1178, 1179].includes(semanticKinds.counts.total)) {
  throw new Error('Semantic-kind counts are outside exact B032r before/after state')
}
semanticKinds.counts.curricularAtomic = 795
semanticKinds.counts.total = 1179
outputs.set(paths.semanticKinds, serializeJson(semanticKinds))

const atomicity = readJsonl(paths.atomicity)
const atomicityById = new Map(atomicity.map((record) => [String(record.goalId), record]))
const memory = readJsonl(paths.memory)
const memoryById = new Map(memory.map((record) => [String(record.goalId), record]))
const reviewSpecs = [
  {
    id: retainedId,
    atomicityReason: 'Die Wirkung von a, d und e auf Scheitelpunktlage, Symmetrieachse, Öffnungsrichtung und Streckung oder Stauchung wird als eine zusammenhängende Parameter-Darstellungs-Kompetenz an Term und Graph begründet; die fachlich unabhängige Nullstellenkompetenz liegt im getrennten Child.',
    memoryReason: 'Die Parameterwirkung muss an wechselnden Termen und Graphen begründet werden; ein Memory-Deck trägt diese Darstellungs- und Transferleistung nicht.',
  },
  {
    id: newId,
    atomicityReason: 'Nullstellen als Schnittpunkte und Gleichungslösungen aufeinander zu beziehen, ihre Anzahl aus Scheitelpunktlage und Öffnungsrichtung zu begründen und sie graphisch beziehungsweise rechnerisch zu bestimmen sind zusammenhängende Darstellungen derselben Nullstellenkompetenz; die Parameterdeutung liegt im vorausgesetzten Ziel.',
    memoryReason: 'Anzahl und Lage der Nullstellen müssen aus einer neuen Scheitelpunktform begründet und graphisch wie algebraisch bestimmt werden; isoliertes Auswendiglernen ist dafür nicht erforderlich.',
  },
]
for (const spec of reviewSpecs) {
  const goal = goalById.get(spec.id)!
  let atomicRecord = atomicityById.get(spec.id)
  if (!atomicRecord) {
    atomicRecord = { schemaVersion: 1, reviewId: 'canonical-math-full', ruleVersion: 'semantic-atomicity-v1', landscapeId, goalId: spec.id }
    const insertionIndex = atomicity.findIndex((record) => record.goalId === retainedId)
    atomicity.splice(insertionIndex + 1, 0, atomicRecord)
    atomicityById.set(spec.id, atomicRecord)
  }
  Object.assign(atomicRecord, {
    fingerprint: reviewFingerprint(goal, 'semantic-atomicity-v1'),
    status: 'atomic',
    semanticAtomic: true,
    reviewedAt,
    reviewer,
    reason: spec.atomicityReason,
    suggestedSplit: [],
  })
  let memoryRecord = memoryById.get(spec.id)
  if (!memoryRecord) {
    memoryRecord = { schemaVersion: 1, reviewId: 'canonical-math-full', ruleVersion: 'memory-card-review-v1', landscapeId, goalId: spec.id }
    const insertionIndex = memory.findIndex((record) => record.goalId === retainedId)
    memory.splice(insertionIndex + 1, 0, memoryRecord)
    memoryById.set(spec.id, memoryRecord)
  }
  if (memoryRecord.status && memoryRecord.status !== 'no_memory_needed') throw new Error(`${spec.id}: memory decision is not safely retainable`)
  Object.assign(memoryRecord, {
    fingerprint: reviewFingerprint(goal, 'memory-card-review-v1'),
    status: 'no_memory_needed',
    memoryUseful: false,
    reviewedAt,
    reviewer,
    reason: spec.memoryReason,
  })
  delete memoryRecord.memoryGoalIds
  delete memoryRecord.deckIds
}
outputs.set(paths.atomicity, serializeJsonl(atomicity))
outputs.set(paths.memory, serializeJsonl(memory))

const visualizationQa = readJson(paths.visualizationQa)
const visualizationRecords = visualizationQa.records as JsonRecord[]
const visualizationById = new Map(visualizationRecords.map((record) => [String(record.goalId), record]))
const retainedQa = visualizationById.get(retainedId)
if (!retainedQa || retainedQa.visualizationState !== 'missing' || retainedQa.missingReason !== 'deferred_provider_limitation') {
  throw new Error('Retained B032r visualization must remain the existing deferred missing record')
}
retainedQa.title = retained.title
retainedQa.description = retained.description
const childQa = {
  goalId: newId,
  title: created.title,
  description: created.description,
  subject: 'mathematik',
  landscapeId,
  landscapePath: paths.canonical,
  visualizationState: 'missing',
  missingReason: 'no_primary_link',
  imageUrl: '',
  publicAssetPath: '',
  canonicalAssetPath: '',
  assetSha256: '',
  umlautsCorrectChatGpt: 'no',
  contentApprovedChatGpt: 'no',
  humanApproved: 'no',
  humanIssueIdentified: 'no',
  humanIssueDescription: '',
  chatGptReviewedAt: null,
  chatGptReviewer: '',
  chatGptNotes: '',
  humanReviewedAt: null,
  humanReviewer: '',
}
const existingChildQa = visualizationById.get(newId)
if (existingChildQa && !same(existingChildQa, childQa)) throw new Error('Split-child visualization QA record is foreign')
if (!existingChildQa) visualizationRecords.push(childQa)
visualizationRecords.sort((left, right) => (
  String(left.title).localeCompare(String(right.title), 'de-DE', { numeric: true, sensitivity: 'base' })
  || String(left.goalId).localeCompare(String(right.goalId))
))
outputs.set(paths.visualizationQa, serializeJson(visualizationQa))

const insertBeforeGoal = (document: JsonRecord, anchorId: string, label: string): void => {
  let anchorOccurrences = 0
  let newOccurrences = 0
  const visit = (node: unknown): void => {
    if (Array.isArray(node)) {
      for (let index = 0; index < node.length; index += 1) {
        const entry = node[index] as JsonRecord
        if (entry?.kind === 'goalEntry' && entry.goalId === newId) newOccurrences += 1
        if (entry?.kind === 'goalEntry' && entry.goalId === anchorId) {
          anchorOccurrences += 1
          const previous = node[index - 1] as JsonRecord | undefined
          if (previous?.kind !== 'goalEntry' || previous.goalId !== newId) {
            node.splice(index, 0, { kind: 'goalEntry', goalId: newId })
            newOccurrences += 1
            index += 1
          }
        }
        visit(entry)
      }
    } else if (node && typeof node === 'object') Object.values(node as JsonRecord).forEach(visit)
  }
  visit(document.rootNodes)
  if (anchorOccurrences !== 1 || newOccurrences !== 1) throw new Error(`${label}: expected one ${newId} immediately before ${anchorId}`)
}
for (const path of [paths.byGkView, paths.byLkView, paths.atlasNavigation]) {
  const view = readJson(path)
  insertBeforeGoal(view, quadraticEquationsId, path)
  outputs.set(path, serializeJson(view))
}

const atlasSources = readJson(paths.atlasSources)
if (![794, 795].includes(atlasSources.expectedCurricularAtomicGoalCount)) throw new Error('Unexpected Mathematics atlas denominator')
atlasSources.expectedCurricularAtomicGoalCount = 795
outputs.set(paths.atlasSources, serializeJson(atlasSources))

const replaceBounded = (input: string, before: string, after: string, label: string): string => {
  const beforeCount = input.split(before).length - 1
  const afterCount = input.split(after).length - 1
  if (beforeCount === 1 && afterCount === 0) return input.replace(before, after)
  if (beforeCount === 0 && afterCount === 1) return input
  throw new Error(`${label}: expected exactly one bounded old/current binding`)
}
const expectedOldDigest = 'sha256:3f1f2fd3cfd7ec37270eb08c854e66ce15bffbf3f338ee050fc3f62cc8d0b85a'
const expectedNewDigest = 'sha256:fe589174c4ed09a575d0ad3a7938e50f84074a850c81683e8e98344a15ee3fca'
let goalBookModelTest = readFileSync(absolute(paths.goalBookModelTest), 'utf8')
if (expectedNewDigest !== 'PENDING') {
  goalBookModelTest = replaceBounded(goalBookModelTest, expectedOldDigest, expectedNewDigest, 'National Mathematics model digest')
}
goalBookModelTest = replaceBounded(goalBookModelTest, 'assert.equal(nationalAtlas.book.pageCount, 794)', 'assert.equal(nationalAtlas.book.pageCount, 795)', 'National Mathematics page count')
goalBookModelTest = replaceBounded(goalBookModelTest, "assert.equal(new Set(nationalAtlas.pages.map(({ goalId }) => goalId)).size, 794)", "assert.equal(new Set(nationalAtlas.pages.map(({ goalId }) => goalId)).size, 795)", 'National Mathematics unique page count')
outputs.set(paths.goalBookModelTest, goalBookModelTest)
let goalBookPublicationTest = readFileSync(absolute(paths.goalBookPublicationTest), 'utf8')
goalBookPublicationTest = replaceBounded(goalBookPublicationTest, 'assert.equal(verified.model.pages.length, 794)', 'assert.equal(verified.model.pages.length, 795)', 'Published Mathematics page count')
outputs.set(paths.goalBookPublicationTest, goalBookPublicationTest)

const recheckConfig = {
  $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-batch-config.schema.json',
  schemaVersion: 1,
  batchId: 'mathematik-rollout-v1-batch-032s-vertex-form-split-final-current-recheck-4-v1-20260905',
  subject: 'mathematik',
  subjectLabel: 'Mathematik',
  bookId: 'de-gym-math-b032s-vertex-form-split-final-current-recheck-4-v1-20260905',
  title: 'Mathematik B032s – Finale Nachprüfung des Scheitelpunktform-Splits und direkt veralteter curricularAtomic-Kontexte',
  baseGoalBookConfigPath: 'app/scripts/config/goal-books/de-gym-math-national-atlas.json',
  goalIds: [retainedId, squareRootsId, newId, successorId],
  outputDirectory: 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-05/batch-032s-vertex-form-split-final-current-recheck-4-v1',
  feedbackBaseUrl: 'https://skillpilot.com/lernziel-feedback',
  promptPath: 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md',
  criteriaPath: 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/mathematik-goal-description-understanding-evidence-review-criteria-v2.md',
  printDerivativeProfile: 'bounded-atlas',
}
outputs.set(paths.recheckConfig, serializeJson(recheckConfig))

const inFlight = readJson(paths.inFlightLedger)
if (!Array.isArray(inFlight.activeBatchConfigPaths)) throw new Error('In-flight work ledger has no activeBatchConfigPaths')
const oldCount = inFlight.activeBatchConfigPaths.filter((path: string) => path === oldBatchConfig).length
const newCount = inFlight.activeBatchConfigPaths.filter((path: string) => path === paths.recheckConfig).length
if (!((oldCount === 1 && newCount === 0) || (oldCount === 0 && newCount === 1))) {
  throw new Error('In-flight work ledger is outside exact old-B032/final-B032s states')
}
inFlight.activeBatchConfigPaths = inFlight.activeBatchConfigPaths.map((path: string) => (
  path === oldBatchConfig ? paths.recheckConfig : path
))
outputs.set(paths.inFlightLedger, serializeJson(inFlight))

const mappingFiles = (directory: string): string[] => readdirSync(directory).flatMap((name) => {
  const child = resolve(directory, name)
  return statSync(child).isDirectory() ? mappingFiles(child) : child.endsWith('.json') ? [child] : []
})
const assertExactNewMappingBoundary = (): void => {
  const planned = new Map(outputs)
  const refs: Array<{ path: string; kind: string; source: string; matchType: string }> = []
  for (const absolutePath of mappingFiles(absolute('curricula/DE/Gymnasium/mapping'))) {
    const relativePath = absolutePath.slice(`${repoRoot}/`.length)
    const document = JSON.parse(planned.get(relativePath) ?? readFileSync(absolutePath, 'utf8')) as JsonRecord
    for (const decision of document.decisions ?? []) {
      if ((decision.canonicalGoalIds ?? []).includes(newId)) refs.push({ path: relativePath, kind: 'decision', source: decision.sourceGoalId, matchType: decision.matchType })
    }
    for (const mapping of document.mappings ?? []) {
      if (mapping.canonicalGoalId === newId) refs.push({ path: relativePath, kind: 'mapping', source: mapping.legacyGoalId, matchType: mapping.matchType })
    }
  }
  const expected = [
    { path: paths.byDirect, kind: 'mapping', source: byParentSourceId, matchType: 'partial' },
    { path: paths.byReview, kind: 'decision', source: byZerosSourceId, matchType: 'exact' },
    { path: paths.byReview, kind: 'mapping', source: byZerosSourceId, matchType: 'exact' },
  ]
  refs.sort((left, right) => stableJson(left).localeCompare(stableJson(right)))
  expected.sort((left, right) => stableJson(left).localeCompare(stableJson(right)))
  if (!same(refs, expected)) throw new Error(`New split-child mapping boundary drifted: ${stableJson(refs)}`)
}
assertExactNewMappingBoundary()

for (const [path, bytes] of outputs) {
  if (writeMode) writeFileSync(absolute(path), bytes)
  else if (readFileSync(absolute(path), 'utf8') !== bytes) throw new Error(`Mathematics B032r split drift in ${path}; run with --write`)
}

execFileSync('npm', ['exec', '--', 'tsx', 'scripts/generateGoalVisualizationQaLedgers.ts', ...(writeMode ? [] : ['--check']), '--subject=mathematik'], {
  cwd: resolve(repoRoot, 'app'), stdio: 'inherit',
})
execFileSync('npm', ['exec', '--', 'tsx', 'scripts/reportGoalVisualizationRolloutStatus.ts', '--subject=mathematik', ...(writeMode ? [] : ['--check'])], {
  cwd: resolve(repoRoot, 'app'), stdio: 'inherit',
})

console.log(
  `CHECK apply_math_batch_032r_vertex_form_split ${writeMode ? 'WRITE' : 'PASS'} `
  + `retained=1 newAtoms=1 rewiredSuccessors=1 weights=7 mappingRefs=3 views=2+navigation `
  + `recheck=4 denominator=794->795 files=${outputs.size}+2-derived-status imageBytes=0`,
)
