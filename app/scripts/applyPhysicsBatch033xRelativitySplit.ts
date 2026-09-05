import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
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
const reviewer = 'codex-physics-b033x-relativity-split-adjudication-2026-09-05'
const landscapeId = '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'
const retainedId = 'a684bec1-ba59-59d0-98d2-4ca37236f64c'
const newShortKey = 'canonical_physics_sek2_michelson_morley_null_result_historical_evidence'
const newId = '512f81af-1480-56a8-ae52-af3aa1a6a859'
const parentId = '157c404a-e14b-598a-9389-6924f8f9262e'
const priorId = '8d34228c-da38-5c1e-97cc-571f3eafb9f4'
const timeDilationId = '19aef2ed-eb46-55b1-9486-ee83f7520bb6'
const capstoneId = '4a58df57-f791-502f-8b8d-9ba155e46035'
const heLegacySourceId = 'ce0c63a5-c1b5-43b8-9af6-c2fef12ee20e'
const rpSourceId = 'rp-phys-sek2-relativity-postulates-simultaneity-experiments'
const byPostulatesSourceId = '97c0dd4b-ec5c-50b6-adb8-2eba5e18c736'
const byClassicalLimitSourceId = 'c891a1aa-1c38-5959-9560-38dd60d0e702'
const expectedPlannedCorpusSha256 = 'sha256:a712e89d70a137f2cf1657f460d30c91055c05fdc1a77c839a52a4cc9b62eba2'

const retainedBefore = {
  title: 'Relativitätspostulate und Experimente',
  titleEn: 'Postulates of Relativity and Experiments',
  description: 'Die lernende Person kann das Relativitätsprinzip und die Invarianz der Lichtgeschwindigkeit als Postulate formulieren, ihre Bedeutung für Inertialsysteme erläutern und den Nullbefund des Michelson-Morley-Versuchs historisch als Einwand gegen einen nachweisbaren Ätherwind einordnen.',
  descriptionEn: 'The learner can formulate the principle of relativity and the invariance of the speed of light as postulates, explain their meaning for inertial frames, and historically contextualize the null result of the Michelson-Morley experiment as evidence against a detectable ether wind.',
} as const

const retainedAfter = {
  title: 'Relativitätspostulate formulieren und erläutern',
  titleEn: 'Formulate and Explain the Postulates of Relativity',
  description: 'Die lernende Person kann das Relativitätsprinzip und die Invarianz der Lichtgeschwindigkeit als Postulate der speziellen Relativitätstheorie formulieren und ihre Bedeutung für physikalische Beschreibungen in Inertialsystemen erläutern.',
  descriptionEn: 'The learner can formulate the principle of relativity and the invariance of the speed of light as postulates of special relativity and explain their significance for physical descriptions in inertial frames.',
} as const

const createdGoal: JsonRecord = {
  id: newId,
  shortKey: newShortKey,
  title: 'Michelson-Morley-Nullbefund historisch einordnen',
  titleEn: 'Historically Interpret the Michelson–Morley Null Result',
  description: 'Die lernende Person kann den Nullbefund des Michelson-Morley-Versuchs historisch einordnen und erläutern, weshalb er gegen den erwarteten Nachweis eines Ätherwinds sprach, ohne ihn als alleinigen Beweis der Relativitätspostulate zu deuten.',
  descriptionEn: 'The learner can historically contextualize the null result of the Michelson–Morley experiment and explain why it counted against the expected detection of an ether wind without treating it as stand-alone proof of the postulates of relativity.',
  weight: 1.15,
  tags: ['GK', 'LK'],
  contains: [],
  requires: [],
  dimensionTags: {
    framework: 'hessen-kc-2024-physics',
    demandLevel: 'AB2',
    processCompetencies: [],
    guidingIdeas: [],
    phase: 'Q4',
  },
  applicability: {
    jurisdiction: [
      'DE-BB', 'DE-BE', 'DE-BW', 'DE-BY', 'DE-HB', 'DE-HE', 'DE-HH', 'DE-MV',
      'DE-NI', 'DE-NW', 'DE-RP', 'DE-SH', 'DE-SL', 'DE-SN', 'DE-ST', 'DE-TH',
    ],
  },
  type: 'atomic',
  semanticAtomic: true,
  resourceLinks: [],
}

const paths = {
  canonical: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json',
  provenance: 'curricula/DE/Gymnasium/provenance/canonical-goal-provenance-registry.json',
  semanticKinds: 'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json',
  atomicity: 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-physics-full.review.jsonl',
  memory: 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-physics-full.review.jsonl',
  visualizationQa: 'curricula/DE/Gymnasium/quality/goal-visualization-qa/physik.qa.json',
  heReview: 'curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_physics_upper_secondary_source_extraction_to_canonical_physics.review.json',
  heLegacy: 'curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_physics_upper_secondary_to_canonical_physics.json',
  byReview: 'curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_physics_source_extraction_to_canonical_physics.review.json',
  rpReview: 'curricula/DE/Gymnasium/mapping/DE-RP/upper-secondary/rp_physics_upper_secondary_source_extraction_to_canonical_physics.review.json',
  rpLegacy: 'curricula/DE/Gymnasium/mapping/DE-RP/upper-secondary/rp_physics_upper_secondary_to_canonical_physics.json',
  nwReview: 'curricula/DE/Gymnasium/mapping/DE-NW/upper-secondary/nrw_physics_upper_secondary_source_extraction_to_canonical_physics.review.json',
  atlasNavigation: 'app/scripts/config/goal-books/navigation/de-gym-physics-national-atlas.view.json',
  atlasSources: 'app/scripts/config/goal-books/de-gym-physics-national-atlas.sources.json',
  heGenerator: 'app/scripts/generateHePhysicsSourceExtraction.ts',
  byGenerator: 'app/scripts/generateByPhysicsSourceExtraction.ts',
  goalBookInputTest: 'app/scripts/testPhysicsGoalBookInputs.ts',
  inFlightLedger: 'curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json',
  recheckConfig: 'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-05/batch-033y-relativity-split-final-current-recheck-6-v1.config.json',
  roundA: 'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-05/batch-033x-final-current-recheck-2-v1/round-a/results/physik-rollout-v1-batch-033x-final-current-recheck-2-v1-20260905-first-pass-a.batch-001.records.jsonl',
  roundB: 'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-05/batch-033x-final-current-recheck-2-v1/round-b/results/physik-rollout-v1-batch-033x-final-current-recheck-2-v1-20260905-first-pass-b.batch-001.records.jsonl',
} as const

const byViewPaths = [
  'curricula/DE/Gymnasium/composition-views/physik/de-by-gk.view.json',
  'curricula/DE/Gymnasium/composition-views/physik/de-by-lk.view.json',
  'curricula/DE/Gymnasium/composition-views/physik/de-by-sekii-gk.view.json',
  'curricula/DE/Gymnasium/composition-views/physik/de-by-sekii-lk.view.json',
] as const
const oldBatchConfig = 'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-05/batch-033x-final-current-recheck-2-v1.config.json'

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
  const hash = createHash('sha1').update(`DE-GYM-CANONICAL-PHYSICS:${shortKey}`).digest('hex')
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-5${hash.slice(13, 16)}-${((Number.parseInt(hash[16]!, 16) & 0x3) | 0x8).toString(16)}${hash.slice(17, 20)}-${hash.slice(20, 32)}`
}
const replaceBounded = (input: string, before: string, after: string, label: string): string => {
  const beforeCount = input.split(before).length - 1
  const afterCount = input.split(after).length - 1
  if (afterCount === 1) return input
  if (beforeCount === 1 && afterCount === 0) return input.replace(before, after)
  throw new Error(`${label}: expected exactly one bounded old/current binding`)
}

if (deterministicGoalId(newShortKey) !== newId) throw new Error('Split-child ID is not deterministic RFC 4122 UUIDv5')

const roundEvidence = [
  { path: paths.roundA, sha256: 'sha256:2f71305e0ad543b80baf2f1610e26fc513c30323d95861c1e3d1b2eb3e497bb3', decision: 'split_review' },
  { path: paths.roundB, sha256: 'sha256:e604456af7f6f03cae1a57ebf8c98d1d67fc758c543c364a9b63ccd4a1c5a2a3', decision: 'keep' },
]
for (const evidence of roundEvidence) {
  const bytes = readFileSync(absolute(evidence.path))
  if (digest(bytes) !== evidence.sha256) throw new Error(`${evidence.path}: completed B033x evidence drifted`)
  const records = bytes.toString('utf8').split(/\r?\n/u).filter(Boolean).map((line) => JSON.parse(line) as JsonRecord)
  const matches = records.filter((record) => record.goalId === retainedId)
  if (matches.length !== 1 || matches[0].decision !== evidence.decision) {
    throw new Error(`${evidence.path}: expected one ${evidence.decision} decision for retained goal`)
  }
}

const outputs = new Map<string, string>()
const canonical = readJson(paths.canonical)
if (canonical.landscapeId !== landscapeId || canonical.subject !== 'Physik') throw new Error('Unexpected canonical Physics landscape')
const goals = canonical.goals as JsonRecord[]
const initialChild = goals.filter((goal) => goal.id === newId)
if (goals.length !== (initialChild.length === 0 ? 707 : 708) || initialChild.length > 1) {
  throw new Error('Canonical Physics is outside exact B033x split before/after cardinality')
}
let goalById = new Map(goals.map((goal) => [String(goal.id), goal]))
if (goalById.size !== goals.length) throw new Error('Duplicate canonical Physics goal IDs')
const retained = goalById.get(retainedId)
if (!retained || retained.type !== 'atomic' || !same(retained.contains, [])) throw new Error('Retained goal is not the expected atom')
if (!same({ title: retained.title, titleEn: retained.titleEn, description: retained.description, descriptionEn: retained.descriptionEn }, retainedBefore)
  && !same({ title: retained.title, titleEn: retained.titleEn, description: retained.description, descriptionEn: retained.descriptionEn }, retainedAfter)) {
  throw new Error('Retained bilingual text is outside bounded states')
}
if (!same(retained.requires, [priorId]) && !same(retained.requires, [])) throw new Error('Retained prerequisite state drifted')
Object.assign(retained, retainedAfter, { requires: [], semanticAtomic: true })
const retainedLinks = (retained.resourceLinks ?? []).filter((link: JsonRecord) => link.type === 'goal-visualization')
if (retainedLinks.length !== 1 || retainedLinks[0].skillpilotId !== retainedId) throw new Error('Retained visualization binding drifted')
Object.assign(retainedLinks[0], {
  title: `Visualisierung: ${retainedAfter.title}`,
  description: `Visualisierung zum Lernziel: ${retainedAfter.title}.`,
  altText: `Didaktische Visualisierung zum Lernziel "${retainedAfter.title}". ${retainedAfter.description}`,
})

let created = goalById.get(newId)
if (created && !same(created, createdGoal)) throw new Error('Split child differs from exact after-state')
if (!created) {
  const retainedIndex = goals.findIndex((goal) => goal.id === retainedId)
  goals.splice(retainedIndex + 1, 0, createdGoal)
  created = createdGoal
  goalById = new Map(goals.map((goal) => [String(goal.id), goal]))
}
const parent = goalById.get(parentId)
if (!parent || !Array.isArray(parent.contains)) throw new Error('Relativity parent missing')
const parentBefore = parent.contains.filter((id: string) => id === newId).length === 0
if (parentBefore) parent.contains.splice(parent.contains.indexOf(retainedId) + 1, 0, newId)
if (parent.contains.filter((id: string) => id === retainedId).length !== 1
  || parent.contains.filter((id: string) => id === newId).length !== 1
  || parent.contains[parent.contains.indexOf(retainedId) + 1] !== newId) throw new Error('Relativity parent split placement drifted')
for (const successorId of [timeDilationId, '57ec031c-9a91-5331-81a7-6ef900f7c63e', 'a08e33db-d821-457b-86dd-870e7648c5f4']) {
  const successor = goalById.get(successorId)
  if (!successor?.requires?.includes(retainedId) || successor.requires.includes(newId)) {
    throw new Error(`${successorId}: theoretical successor must remain tied only to retained postulates`)
  }
}
const capstone = goalById.get(capstoneId)
if (!capstone || !Array.isArray(capstone.requires) || !Array.isArray(capstone.examData?.coveredGoalIds)) throw new Error('Q4 capstone missing')
for (const list of [capstone.requires, capstone.examData.coveredGoalIds] as string[][]) {
  const retainedIndex = list.indexOf(retainedId)
  if (retainedIndex < 0 || list.filter((id) => id === retainedId).length !== 1 || list.filter((id) => id === newId).length > 1) {
    throw new Error('Q4 capstone split boundary drifted')
  }
  if (!list.includes(newId)) list.splice(retainedIndex + 1, 0, newId)
  if (list[list.indexOf(retainedId) + 1] !== newId) throw new Error('Q4 capstone split child must follow retained goal')
}
if (goals.length !== 708) throw new Error('Canonical Physics after-count mismatch')
outputs.set(paths.canonical, serializeJson(canonical))

const provenanceRegistry = readJson(paths.provenance)
const provenanceLandscape = (provenanceRegistry.landscapes as JsonRecord[]).find((entry) => entry.landscapeId === landscapeId)
if (!provenanceLandscape?.goalProvenance) throw new Error('Physics provenance registry missing')
const provenance = provenanceLandscape.goalProvenance as JsonRecord
const retainedProvenance = { sourceLandscapeId: '24f2ca0f-b94a-444e-bb70-677cb6f85c02', sourceGoalId: heLegacySourceId }
if (!same(provenance[retainedId], retainedProvenance)) throw new Error('Retained provenance drifted')
if (provenance[newId] && !same(provenance[newId], retainedProvenance)) throw new Error('Split-child provenance is foreign')
provenance[newId] = retainedProvenance
provenanceLandscape.goalProvenance = Object.fromEntries(Object.entries(provenance).sort(([left], [right]) => left.localeCompare(right)))
outputs.set(paths.provenance, serializeJson(provenanceRegistry))

const semanticKinds = readJson(paths.semanticKinds)
const semanticDecisions = semanticKinds.decisions as JsonRecord[]
const semanticById = new Map(semanticDecisions.map((decision) => [String(decision.goalId), decision]))
const childSemantic = {
  goalId: newId,
  sourceFingerprint: fingerprintSemanticKindSourceGoal(created),
  semanticKind: 'curricularAtomic',
  decisionStatus: 'authoritative',
  decisionBasis: 'reviewed-current-pilot-curricular-atomic',
}
const existingChildSemantic = semanticById.get(newId)
if (existingChildSemantic) {
  const normalizedExisting = { ...existingChildSemantic, decisionBasis: childSemantic.decisionBasis }
  if (!['reviewed-current-structural-split-curricular-atomic', childSemantic.decisionBasis].includes(existingChildSemantic.decisionBasis)
    || !same(normalizedExisting, childSemantic)) throw new Error('Split-child semantic-kind decision is foreign')
  existingChildSemantic.decisionBasis = childSemantic.decisionBasis
}
if (!existingChildSemantic) {
  const insertionIndex = semanticDecisions.findIndex((decision) => decision.goalId === retainedId)
  semanticDecisions.splice(insertionIndex + 1, 0, childSemantic)
  semanticById.set(newId, childSemantic)
}
for (const goalId of [retainedId, newId, parentId, capstoneId]) {
  const goal = goalById.get(goalId)
  const decision = semanticById.get(goalId)
  if (!goal || !decision || decision.decisionStatus !== 'authoritative') throw new Error(`${goalId}: authoritative semantic-kind binding missing`)
  decision.sourceFingerprint = fingerprintSemanticKindSourceGoal(goal)
}
if (![461, 462].includes(semanticKinds.counts.curricularAtomic) || ![707, 708].includes(semanticKinds.counts.total)) {
  throw new Error('Semantic-kind counts outside exact split states')
}
semanticKinds.counts.curricularAtomic = 462
semanticKinds.counts.total = 708
semanticDecisions.sort((left, right) => String(left.goalId).localeCompare(String(right.goalId)))
outputs.set(paths.semanticKinds, serializeJson(semanticKinds))

const atomicity = readJsonl(paths.atomicity)
const memory = readJsonl(paths.memory)
const atomicityById = new Map(atomicity.map((record) => [String(record.goalId), record]))
const memoryById = new Map(memory.map((record) => [String(record.goalId), record]))
const reviewSpecs = [
  {
    id: retainedId,
    atomicityReason: 'Die Formulierung beider Relativitätspostulate und die Erläuterung ihrer Bedeutung für Inertialsysteme bilden eine einzige begriffliche Grundlagenkompetenz; die unabhängige historisch-evidenzielle Einordnung des Michelson-Morley-Nullbefunds liegt im getrennten Ziel.',
    memoryReason: 'Die Postulatnamen können gestützt werden; ihre Bedeutung für physikalische Beschreibungen in wechselnden Inertialsystemen muss eigenständig erläutert werden.',
  },
  {
    id: newId,
    atomicityReason: 'Historischer Versuchsrahmen, Nullbefund und begrenzte Schlussfolgerung gegen einen erwarteten Ätherwind sind aufeinander bezogene Teile einer einzigen evidenziellen Einordnung desselben Experiments.',
    memoryReason: 'Versuchsname und Ätherwindbegriff können gestützt werden; die Reichweite des Nullbefunds und die Abgrenzung von einem Beweis der Postulate müssen an neuen Darstellungen oder Datensätzen begründet werden.',
  },
]
for (const spec of reviewSpecs) {
  const goal = goalById.get(spec.id)!
  let atomicRecord = atomicityById.get(spec.id)
  if (!atomicRecord) {
    atomicRecord = { schemaVersion: 1, reviewId: 'canonical-physics-full', ruleVersion: 'semantic-atomicity-v1', landscapeId, goalId: spec.id }
    atomicity.splice(atomicity.findIndex((record) => record.goalId === retainedId) + 1, 0, atomicRecord)
    atomicityById.set(spec.id, atomicRecord)
  }
  Object.assign(atomicRecord, {
    fingerprint: reviewFingerprint(goal, 'semantic-atomicity-v1'), status: 'atomic', semanticAtomic: true,
    reviewedAt, reviewer, reason: spec.atomicityReason, suggestedSplit: [],
  })
  let memoryRecord = memoryById.get(spec.id)
  if (!memoryRecord) {
    memoryRecord = { schemaVersion: 1, reviewId: 'canonical-physics-full', ruleVersion: 'memory-card-review-v1', landscapeId, goalId: spec.id }
    memory.splice(memory.findIndex((record) => record.goalId === retainedId) + 1, 0, memoryRecord)
    memoryById.set(spec.id, memoryRecord)
  }
  if (memoryRecord.status && memoryRecord.status !== 'no_memory_needed') throw new Error(`${spec.id}: unsafe memory-decision transition`)
  Object.assign(memoryRecord, {
    fingerprint: reviewFingerprint(goal, 'memory-card-review-v1'), status: 'no_memory_needed', memoryUseful: false,
    reviewedAt, reviewer, reason: spec.memoryReason,
  })
  delete memoryRecord.memoryGoalIds
  delete memoryRecord.deckIds
}
if (atomicity.length !== 462 || memory.length !== 462) throw new Error('Atomicity/memory denominator must be 462')
atomicity.sort((left, right) => String(left.goalId).localeCompare(String(right.goalId)))
memory.sort((left, right) => String(left.goalId).localeCompare(String(right.goalId)))
outputs.set(paths.atomicity, serializeJsonl(atomicity))
outputs.set(paths.memory, serializeJsonl(memory))

const visualizationQa = readJson(paths.visualizationQa)
const visualizationRecords = visualizationQa.records as JsonRecord[]
const visualizationById = new Map(visualizationRecords.map((record) => [String(record.goalId), record]))
const retainedQa = visualizationById.get(retainedId)
if (!retainedQa || retainedQa.visualizationState !== 'available' || retainedQa.assetSha256 !== 'sha256:1d85951d5c0900e51d791a3e7eda6948af957d5b14b5346041f5769fad2717e2') {
  throw new Error('Retained visualization QA binding drifted')
}
retainedQa.title = retained.title
retainedQa.description = retained.description
const childQa = {
  goalId: newId,
  title: created.title,
  description: created.description,
  subject: 'physik', landscapeId, landscapePath: paths.canonical,
  visualizationState: 'missing', missingReason: 'no_primary_link', imageUrl: '', publicAssetPath: '', canonicalAssetPath: '', assetSha256: '',
  umlautsCorrectChatGpt: 'no', contentApprovedChatGpt: 'no', humanApproved: 'no', humanIssueIdentified: 'no', humanIssueDescription: '',
  chatGptReviewedAt: null, chatGptReviewer: '', chatGptNotes: '', humanReviewedAt: null, humanReviewer: '',
}
const existingChildQa = visualizationById.get(newId)
if (existingChildQa && !same(existingChildQa, childQa)) throw new Error('Split-child visualization QA record is foreign')
if (!existingChildQa) visualizationRecords.push(childQa)
visualizationRecords.sort((left, right) => String(left.title).localeCompare(String(right.title), 'de-DE', { numeric: true, sensitivity: 'base' })
  || String(left.goalId).localeCompare(String(right.goalId)))
if (visualizationRecords.length !== 485) throw new Error('Visualization QA after-count mismatch')
outputs.set(paths.visualizationQa, serializeJson(visualizationQa))

type MappingSpec = { sourceId: string; before: string[]; after: string[]; matchTypes: string[]; rationale: string }
const updateReviewedMapping = (path: string, beforeCount: number, afterCount: number, specs: MappingSpec[]): JsonRecord => {
  const document = readJson(path)
  const mappings = document.mappings as JsonRecord[]
  const decisions = document.decisions as JsonRecord[]
  const hasNew = mappings.some((mapping) => mapping.canonicalGoalId === newId)
  if (mappings.length !== (hasNew ? afterCount : beforeCount)) throw new Error(`${path}: mapping count outside bounded states`)
  for (const spec of specs) {
    const decision = decisions.find((entry) => entry.sourceGoalId === spec.sourceId)
    if (!decision || (!same(decision.canonicalGoalIds, spec.before) && !same(decision.canonicalGoalIds, spec.after))) {
      throw new Error(`${path}:${spec.sourceId}: decision route outside bounded states`)
    }
    Object.assign(decision, { canonicalGoalIds: [...spec.after], rationale: spec.rationale, reviewedAt, reviewer })
    const sourceMappings = mappings.filter((mapping) => mapping.legacyGoalId === spec.sourceId)
    const currentTargets = sourceMappings.map((mapping) => mapping.canonicalGoalId)
    if (!same(currentTargets, spec.before) && !same(currentTargets, spec.after)) throw new Error(`${path}:${spec.sourceId}: projection route outside bounded states`)
    if (!same(currentTargets, spec.after)) {
      const firstIndex = mappings.findIndex((mapping) => mapping.legacyGoalId === spec.sourceId)
      mappings.splice(firstIndex, sourceMappings.length, ...spec.after.map((canonicalGoalId, index) => ({
        legacyGoalId: spec.sourceId, canonicalGoalId, matchType: spec.matchTypes[index], reviewDecisionId: spec.sourceId,
      })))
    } else sourceMappings.forEach((mapping, index) => { mapping.matchType = spec.matchTypes[index] })
  }
  if (mappings.length !== afterCount) throw new Error(`${path}: mapping after-count mismatch`)
  return document
}

const heReview = updateReviewedMapping(paths.heReview, 368, 369, [
  {
    sourceId: 'he-phys-sekii-q4-4-b03-a01-9592598b', before: [retainedId], after: [retainedId, newId], matchTypes: ['partial', 'partial'],
    rationale: 'Der amtliche Spiegelstrich verbindet die Konstanz der Lichtgeschwindigkeit mit einer Präsentation des Michelson-Morley-Experiments. Nach dem semantischen Split decken das Postulatziel und das eigenständige historisch-evidenzielle Experimentalziel diese beiden Aspekte gemeinsam ab.',
  },
  {
    sourceId: 'he-phys-sekii-q4-4-b06-a01-234e1e10', before: [retainedId], after: [timeDilationId], matchTypes: ['exact'],
    rationale: 'Der breite amtliche Aspekt „experimentelle Nachweise“ ist kein Beleg für die Formulierung der Postulate. Er wird dem bestehenden Ziel zu Zeitdilatation und Längenkontraktion zugeordnet, das experimentelle Nachweise ausdrücklich qualitativ diskutieren lässt.',
  },
])
outputs.set(paths.heReview, serializeJson(heReview))

const heLegacy = readJson(paths.heLegacy)
const heMappings = heLegacy.mappings as JsonRecord[]
const heLegacyRefs = heMappings.filter((mapping) => mapping.legacyGoalId === heLegacySourceId && [retainedId, newId].includes(mapping.canonicalGoalId))
if (!([378, 379].includes(heMappings.length)) || !([1, 2].includes(heLegacyRefs.length))) throw new Error('HE legacy split mapping outside bounded states')
const retainedLegacy = heLegacyRefs.find((mapping) => mapping.canonicalGoalId === retainedId)
if (!retainedLegacy) throw new Error('HE retained legacy mapping missing')
retainedLegacy.matchType = 'partial'
if (!heLegacyRefs.some((mapping) => mapping.canonicalGoalId === newId)) {
  heMappings.splice(heMappings.indexOf(retainedLegacy) + 1, 0, { legacyGoalId: heLegacySourceId, canonicalGoalId: newId, matchType: 'partial' })
}
if (heMappings.length !== 379) throw new Error('HE legacy mapping after-count mismatch')
outputs.set(paths.heLegacy, serializeJson(heLegacy))

const byReviewDocument = readJson(paths.byReview)
const byDecision = (byReviewDocument.decisions as JsonRecord[]).find((entry) => entry.sourceGoalId === byPostulatesSourceId)
const byBefore = [retainedId, 'a08e33db-d821-457b-86dd-870e7648c5f4', timeDilationId, '6ebb6182-f221-5f4c-b112-4ac72b104321', 'da26294f-4316-5bd5-a37a-bd89397b3b8b', 'd2e6f87d-795b-5631-a7cc-0bfb5dc5142e']
const byAfter = [retainedId, newId, ...byBefore.slice(1)]
if (!byDecision || (!same(byDecision.canonicalGoalIds, byBefore) && !same(byDecision.canonicalGoalIds, byAfter))) throw new Error('BY postulates/experiments decision route drifted')
Object.assign(byDecision, {
  canonicalGoalIds: byAfter,
  rationale: 'Ph11.3.3 verbindet Schlussfolgerungen aus den Einstein’schen Postulaten mit der Funktion von Experimenten bei der Verifizierung theoretischer Vorhersagen. Das retained Postulatziel und die begrenzte evidenzielle Einordnung des Michelson-Morley-Nullbefunds bilden nach dem Split zwei partielle Abdeckungen dieser breiten Kompetenz.',
  reviewedAt, reviewer,
})
const byMappings = byReviewDocument.mappings as JsonRecord[]
const byCurrent = byMappings.filter((mapping) => mapping.legacyGoalId === byPostulatesSourceId)
if (!same(byCurrent.map((mapping) => mapping.canonicalGoalId), byBefore) && !same(byCurrent.map((mapping) => mapping.canonicalGoalId), byAfter)) {
  throw new Error('BY postulates/experiments projections drifted')
}
if (!byCurrent.some((mapping) => mapping.canonicalGoalId === newId)) {
  const retainedIndex = byMappings.findIndex((mapping) => mapping.legacyGoalId === byPostulatesSourceId && mapping.canonicalGoalId === retainedId)
  byMappings.splice(retainedIndex + 1, 0, { legacyGoalId: byPostulatesSourceId, canonicalGoalId: newId, matchType: 'partial', reviewDecisionId: byPostulatesSourceId })
}
if (byMappings.length !== 1004) throw new Error('BY reviewed mapping after-count mismatch')
const byLimitDecision = (byReviewDocument.decisions as JsonRecord[]).find((entry) => entry.sourceGoalId === byClassicalLimitSourceId)
if (!byLimitDecision?.canonicalGoalIds?.includes(retainedId) || byLimitDecision.canonicalGoalIds.includes(newId)) throw new Error('BY classical-limit source must remain retained-only')
outputs.set(paths.byReview, serializeJson(byReviewDocument))

const rpReview = updateReviewedMapping(paths.rpReview, 266, 267, [{
  sourceId: rpSourceId, before: [retainedId], after: [retainedId, newId], matchTypes: ['partial', 'partial'],
  rationale: 'Die breite RP-Quellzeile nennt Relativitätspostulate, Gleichzeitigkeit und experimentelle Belege gemeinsam. Nach dem Split bilden retained Postulatziel und neues historisch-evidenzielles Experimentalziel zwei partielle Abdeckungen; Gleichzeitigkeit bleibt in den bereits getrennten kanonischen Folgezielen.',
}])
outputs.set(paths.rpReview, serializeJson(rpReview))
const rpLegacy = readJson(paths.rpLegacy)
const rpMappings = rpLegacy.mappings as JsonRecord[]
const rpRefs = rpMappings.filter((mapping) => mapping.legacyGoalId === rpSourceId && [retainedId, newId].includes(mapping.canonicalGoalId))
if (![112, 113].includes(rpMappings.length) || ![1, 2].includes(rpRefs.length)) throw new Error('RP legacy split mapping outside bounded states')
const rpRetained = rpRefs.find((mapping) => mapping.canonicalGoalId === retainedId)
if (!rpRetained || rpRetained.matchType !== 'partial') throw new Error('RP retained legacy mapping drifted')
if (!rpRefs.some((mapping) => mapping.canonicalGoalId === newId)) rpMappings.splice(rpMappings.indexOf(rpRetained) + 1, 0, { legacyGoalId: rpSourceId, canonicalGoalId: newId, matchType: 'partial' })
if (rpMappings.length !== 113) throw new Error('RP legacy mapping after-count mismatch')
outputs.set(paths.rpLegacy, serializeJson(rpLegacy))

const nwReview = readJson(paths.nwReview)
for (const sourceId of [
  'nw-phys-sekii-klp2022-EF-kreisbewegung-gravitation-und-physikalische-weltbilder-sachkompetenz-006-39221057',
  'nw-phys-sekii-klp2022-EF-kreisbewegung-gravitation-und-physikalische-weltbilder-sachkompetenz-007-42aa500b',
  'nw-phys-sekii-klp2022-EF-kreisbewegung-gravitation-und-physikalische-weltbilder-erkenntnisgewinnungskompetenz-004-08fcda69',
]) {
  const decision = (nwReview.decisions as JsonRecord[]).find((entry) => entry.sourceGoalId === sourceId)
  if (!decision?.canonicalGoalIds?.includes(retainedId) || decision.canonicalGoalIds.includes(newId)) throw new Error(`${sourceId}: NW route must remain retained-only`)
}
if ((nwReview.mappings as JsonRecord[]).some((mapping) => mapping.canonicalGoalId === newId)) throw new Error('NW mapping must not claim Michelson-Morley source evidence')

const insertAfterGoal = (document: JsonRecord, anchorId: string, label: string): void => {
  let anchors = 0
  const visit = (node: unknown): void => {
    if (Array.isArray(node)) {
      for (let index = 0; index < node.length; index += 1) {
        const entry = node[index] as JsonRecord
        if (entry?.kind === 'goalEntry' && entry.goalId === anchorId) {
          anchors += 1
          const next = node[index + 1] as JsonRecord | undefined
          if (next?.kind !== 'goalEntry' || next.goalId !== newId) {
            node.splice(index + 1, 0, { kind: 'goalEntry', goalId: newId })
          }
        }
        visit(entry)
      }
    } else if (node && typeof node === 'object') Object.values(node as JsonRecord).forEach(visit)
  }
  visit(document.rootNodes)
  let children = 0
  const count = (node: unknown): void => {
    if (Array.isArray(node)) node.forEach(count)
    else if (node && typeof node === 'object') {
      const record = node as JsonRecord
      if (record.kind === 'goalEntry' && record.goalId === newId) children += 1
      Object.values(record).forEach(count)
    }
  }
  count(document.rootNodes)
  if (anchors !== 1 || children !== 1) throw new Error(`${label}: expected one adjacent retained/new goal entry`)
}
for (const path of [...byViewPaths, paths.atlasNavigation]) {
  const view = readJson(path)
  insertAfterGoal(view, retainedId, path)
  outputs.set(path, serializeJson(view))
}

const atlasSources = readJson(paths.atlasSources)
if (![461, 462].includes(atlasSources.expectedCurricularAtomicGoalCount)) throw new Error('Unexpected Physics atlas denominator')
atlasSources.expectedCurricularAtomicGoalCount = 462
outputs.set(paths.atlasSources, serializeJson(atlasSources))

let heGenerator = readFileSync(absolute(paths.heGenerator), 'utf8')
heGenerator = replaceBounded(heGenerator,
  `  'Q4.4:3': ['${retainedId}'],`,
  `  'Q4.4:3': ['${retainedId}', '${newId}'],`, 'HE Q4.4:3 split route')
heGenerator = replaceBounded(heGenerator,
  `  'Q4.4:6': ['${retainedId}'],`,
  `  'Q4.4:6': ['${timeDilationId}'],`, 'HE Q4.4:6 evidence route')
outputs.set(paths.heGenerator, heGenerator)
let byGenerator = readFileSync(absolute(paths.byGenerator), 'utf8')
byGenerator = replaceBounded(byGenerator,
  `  '${byPostulatesSourceId}': [\n    '${retainedId}',`,
  `  '${byPostulatesSourceId}': [\n    '${retainedId}',\n    '${newId}',`, 'BY Ph11.3.3 split route')
outputs.set(paths.byGenerator, byGenerator)

let goalBookInputTest = readFileSync(absolute(paths.goalBookInputTest), 'utf8')
goalBookInputTest = replaceBounded(goalBookInputTest, '  curricularAtomic: 461,', '  curricularAtomic: 462,', 'Physics semantic atomic count')
goalBookInputTest = replaceBounded(goalBookInputTest, '  total: 707,', '  total: 708,', 'Physics semantic total count')
goalBookInputTest = replaceBounded(goalBookInputTest, 'canonical goal-book navigation must place all 461 atlas goals exactly once', 'canonical goal-book navigation must place all 462 atlas goals exactly once', 'Physics atlas error message')
goalBookInputTest = replaceBounded(goalBookInputTest, 'assert.equal(canonicalProfileTargetIds.size, 388)', 'assert.equal(canonicalProfileTargetIds.size, 389)', 'Physics canonical profile target count')
outputs.set(paths.goalBookInputTest, goalBookInputTest)

const recheckConfig = {
  $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-batch-config.schema.json',
  schemaVersion: 1,
  batchId: 'physik-rollout-v1-batch-033y-relativity-split-final-current-recheck-6-v1-20260905',
  subject: 'physik',
  subjectLabel: 'Physik',
  bookId: 'de-gym-physics-b033y-relativity-split-final-current-recheck-6-v1-20260905',
  title: 'Physik B033y – Finale Nachprüfung des Relativitätspostulate/Michelson-Morley-Splits und direkt veralteter curricularAtomic-Kontexte',
  baseGoalBookConfigPath: 'app/scripts/config/goal-books/de-gym-physics-national-atlas.json',
  goalIds: [priorId, retainedId, newId, timeDilationId, '57ec031c-9a91-5331-81a7-6ef900f7c63e', 'a08e33db-d821-457b-86dd-870e7648c5f4'],
  outputDirectory: 'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-05/batch-033y-relativity-split-final-current-recheck-6-v1',
  feedbackBaseUrl: 'https://skillpilot.com/lernziel-feedback',
  promptPath: 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md',
  criteriaPath: 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/physics-goal-description-understanding-evidence-review-criteria-v1.md',
  printDerivativeProfile: 'bounded-atlas',
}
outputs.set(paths.recheckConfig, serializeJson(recheckConfig))
const inFlight = readJson(paths.inFlightLedger)
const oldCount = inFlight.activeBatchConfigPaths.filter((path: string) => path === oldBatchConfig).length
const newCount = inFlight.activeBatchConfigPaths.filter((path: string) => path === paths.recheckConfig).length
if (!((oldCount === 1 && newCount === 0) || (oldCount === 0 && newCount === 1))) throw new Error('In-flight ledger outside exact B033x/B033y states')
inFlight.activeBatchConfigPaths = inFlight.activeBatchConfigPaths.map((path: string) => path === oldBatchConfig ? paths.recheckConfig : path)
outputs.set(paths.inFlightLedger, serializeJson(inFlight))

const mappingFiles = (directory: string): string[] => readdirSync(directory).flatMap((name) => {
  const child = resolve(directory, name)
  return statSync(child).isDirectory() ? mappingFiles(child) : child.endsWith('.json') ? [child] : []
})
const planned = new Map(outputs)
const newMappingRefs: Array<{ path: string; kind: string; source: string }> = []
for (const absolutePath of mappingFiles(absolute('curricula/DE/Gymnasium/mapping'))) {
  const relativePath = absolutePath.slice(`${repoRoot}/`.length)
  const document = JSON.parse(planned.get(relativePath) ?? readFileSync(absolutePath, 'utf8')) as JsonRecord
  for (const decision of document.decisions ?? []) if ((decision.canonicalGoalIds ?? []).includes(newId)) newMappingRefs.push({ path: relativePath, kind: 'decision', source: decision.sourceGoalId })
  for (const mapping of document.mappings ?? []) if (mapping.canonicalGoalId === newId) newMappingRefs.push({ path: relativePath, kind: 'mapping', source: mapping.legacyGoalId })
}
const expectedNewMappingRefs = [
  { path: paths.heReview, kind: 'decision', source: 'he-phys-sekii-q4-4-b03-a01-9592598b' },
  { path: paths.heReview, kind: 'mapping', source: 'he-phys-sekii-q4-4-b03-a01-9592598b' },
  { path: paths.heLegacy, kind: 'mapping', source: heLegacySourceId },
  { path: paths.byReview, kind: 'decision', source: byPostulatesSourceId },
  { path: paths.byReview, kind: 'mapping', source: byPostulatesSourceId },
  { path: paths.rpReview, kind: 'decision', source: rpSourceId },
  { path: paths.rpReview, kind: 'mapping', source: rpSourceId },
  { path: paths.rpLegacy, kind: 'mapping', source: rpSourceId },
]
newMappingRefs.sort((left, right) => stableJson(left).localeCompare(stableJson(right)))
expectedNewMappingRefs.sort((left, right) => stableJson(left).localeCompare(stableJson(right)))
if (!same(newMappingRefs, expectedNewMappingRefs)) throw new Error(`Split-child mapping boundary drifted: ${stableJson(newMappingRefs)}`)

const plannedCorpusSha256 = digest(stableJson([...outputs].map(([path, bytes]) => ({ path, sha256: digest(bytes) }))))
if (expectedPlannedCorpusSha256 !== 'PENDING' && plannedCorpusSha256 !== expectedPlannedCorpusSha256) {
  throw new Error(`Planned corpus drifted: ${plannedCorpusSha256} != ${expectedPlannedCorpusSha256}`)
}
const changed = [...outputs].filter(([path, bytes]) => !existsSync(absolute(path)) || readFileSync(absolute(path), 'utf8') !== bytes)
if (writeMode) {
  execFileSync(process.execPath, ['scripts/check_openai_plugin_review_freeze.mjs'], { cwd: repoRoot, stdio: 'inherit' })
  for (const [path, bytes] of changed) writeFileSync(absolute(path), bytes)
} else if (expectedPlannedCorpusSha256 !== 'PENDING' && changed.length > 0) {
  throw new Error(`Physics B033x relativity split is not materialized: ${changed.map(([path]) => path).join(', ')}`)
}

console.log(
  `CHECK apply_physics_batch_033x_relativity_split ${writeMode ? 'WRITE' : changed.length === 0 ? 'PASS' : 'PLAN'} `
  + `retained=1 newAtoms=1 removedInvalidPrerequisites=1 mappingRefs=8 views=4+navigation assessmentsExpanded=1 `
  + `recheck=6 denominator=461->462 files=${outputs.size} imageBytes=0 changed=${changed.length}`,
)
console.log(`PLANNED_CORPUS_SHA256 ${plannedCorpusSha256}`)
console.log(`PLANNED_PATHS ${changed.map(([path]) => path).join(',') || '-'}`)
