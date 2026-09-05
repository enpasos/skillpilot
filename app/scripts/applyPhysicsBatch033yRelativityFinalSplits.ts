import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel'

// The bounded Layer-A ledgers intentionally retain several historic JSON shapes.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonRecord = Record<string, any>

const repoRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')
const allowed = new Set(['--write', '--check'])
const unexpected = process.argv.slice(2).filter((argument) => !allowed.has(argument))
if (unexpected.length > 0) throw new Error(`Unexpected arguments: ${unexpected.join(', ')}`)
if (writeMode && process.argv.includes('--check')) throw new Error('Use either --write or --check, not both')

const reviewedAt = '2026-09-05'
const reviewer = 'codex-physics-b033y-relativity-final-splits-2026-09-05'
const landscapeId = '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'
const postulatesId = 'a684bec1-ba59-59d0-98d2-4ca37236f64c'
const timeId = '19aef2ed-eb46-55b1-9486-ee83f7520bb6'
const lengthShortKey = 'canonical_physics_sek2_length_contraction_explain_experimental_evidence'
const lengthId = '0c305cf9-3923-51cf-a9ae-5849edc99c9f'
const lorentzId = '57ec031c-9a91-5331-81a7-6ef900f7c63e'
const velocityShortKey = 'canonical_physics_sek2_relativistic_velocity_addition_apply'
const velocityId = '2239cb67-82cb-585f-ab82-e1f2510eb4f7'
const parentId = '157c404a-e14b-598a-9389-6924f8f9262e'
const capstoneId = '4a58df57-f791-502f-8b8d-9ba155e46035'
const gpsAssessmentId = 'f532c772-7b6e-59aa-ad65-e0eeafc3767f'
const memoryGoalId = '266b6cf8-d49d-5197-862c-9998fcf179a5'
const deckId = 'de_gymnasium_physics_structure_q4'
const expectedPlannedCorpusSha256 = 'sha256:ee8fdce3f72ebd965072afff3ca8fc3eb258315ba865fe5ca38d6db1f5e89dba'

const timeBefore = {
  title: 'Zeitdilatation und Längenkontraktion', titleEn: 'Time Dilation and Length Contraction',
  description: 'Die lernende Person kann Zeitdilatation und Längenkontraktion mithilfe einfacher Beispiele und Gedankenexperimente erläutern und experimentelle Nachweise qualitativ diskutieren.',
  descriptionEn: 'The learner can explain time dilation and length contraction using simple examples and thought experiments and qualitatively discuss experimental proofs.',
}
const timeAfter = {
  title: 'Zeitdilatation erläutern', titleEn: 'Explain Time Dilation',
  description: 'Die lernende Person kann Zeitdilatation mithilfe einfacher Beispiele und Gedankenexperimente erläutern und zugehörige experimentelle Nachweise qualitativ diskutieren.',
  descriptionEn: 'The learner can explain time dilation using simple examples and thought experiments and qualitatively discuss corresponding experimental evidence.',
}
const lorentzBefore = {
  title: 'Lorentztransformation anwenden', titleEn: 'Apply Lorentz Transformation',
  description: 'Die lernende Person kann Lorentztransformationen und Geschwindigkeitsaddition durchführen.',
  descriptionEn: 'The learner can perform Lorentz transformations and velocity addition.',
}
const lorentzAfter = {
  title: 'Lorentztransformationen anwenden', titleEn: 'Apply Lorentz Transformations',
  description: 'Die lernende Person kann Raum- und Zeitkoordinaten von Ereignissen zwischen gleichförmig relativ bewegten Inertialsystemen mit Lorentztransformationen umrechnen und die Ergebnisse physikalisch interpretieren.',
  descriptionEn: 'The learner can use Lorentz transformations to convert the space and time coordinates of events between inertial frames in uniform relative motion and physically interpret the results.',
}

const paths = {
  canonical: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json',
  provenance: 'curricula/DE/Gymnasium/provenance/canonical-goal-provenance-registry.json',
  semanticKinds: 'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json',
  atomicity: 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-physics-full.review.jsonl',
  memory: 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-physics-full.review.jsonl',
  cardReview: 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-physics-full.cards.review.jsonl',
  deck: 'curricula/DE/Gymnasium/memory-decks/de_gymnasium_physics_flashcards_structure_q4.de.json',
  publicDeck: 'app/public/data/de_gymnasium_physics_flashcards_structure_q4.de.json',
  visualizationQa: 'curricula/DE/Gymnasium/quality/goal-visualization-qa/physik.qa.json',
  heReview: 'curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_physics_upper_secondary_source_extraction_to_canonical_physics.review.json',
  heLegacy: 'curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_physics_upper_secondary_to_canonical_physics.json',
  byReview: 'curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_physics_source_extraction_to_canonical_physics.review.json',
  rpReview: 'curricula/DE/Gymnasium/mapping/DE-RP/upper-secondary/rp_physics_upper_secondary_source_extraction_to_canonical_physics.review.json',
  rpLegacy: 'curricula/DE/Gymnasium/mapping/DE-RP/upper-secondary/rp_physics_upper_secondary_to_canonical_physics.json',
  atlasNavigation: 'app/scripts/config/goal-books/navigation/de-gym-physics-national-atlas.view.json',
  atlasSources: 'app/scripts/config/goal-books/de-gym-physics-national-atlas.sources.json',
  heGenerator: 'app/scripts/generateHePhysicsSourceExtraction.ts',
  byGenerator: 'app/scripts/generateByPhysicsSourceExtraction.ts',
  goalBookInputTest: 'app/scripts/testPhysicsGoalBookInputs.ts',
  inFlightLedger: 'curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json',
  recheckConfig: 'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-05/batch-033z-relativity-final-splits-current-recheck-9-v1.config.json',
  roundA: 'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-05/batch-033y-relativity-split-final-current-recheck-6-v1/round-a/results/physik-rollout-v1-batch-033y-relativity-split-final-current-recheck-6-v1-20260905-first-pass-a.batch-001.records.jsonl',
  roundB: 'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-05/batch-033y-relativity-split-final-current-recheck-6-v1/round-b/results/physik-rollout-v1-batch-033y-relativity-split-final-current-recheck-6-v1-20260905-first-pass-b.batch-001.records.jsonl',
} as const
const oldBatchConfig = 'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-05/batch-033y-relativity-split-final-current-recheck-6-v1.config.json'
const byViews = [
  'curricula/DE/Gymnasium/composition-views/physik/de-by-gk.view.json',
  'curricula/DE/Gymnasium/composition-views/physik/de-by-lk.view.json',
  'curricula/DE/Gymnasium/composition-views/physik/de-by-sekii-gk.view.json',
  'curricula/DE/Gymnasium/composition-views/physik/de-by-sekii-lk.view.json',
] as const

const absolute = (path: string): string => resolve(repoRoot, path)
const readJson = (path: string): JsonRecord => JSON.parse(readFileSync(absolute(path), 'utf8')) as JsonRecord
const readJsonl = (path: string): JsonRecord[] => readFileSync(absolute(path), 'utf8').split(/\r?\n/u).filter(Boolean).map((line) => JSON.parse(line) as JsonRecord)
const serializeJson = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`
const serializeJsonl = (value: JsonRecord[]): string => `${value.map((record) => JSON.stringify(record)).join('\n')}\n`
const stableJson = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (value && typeof value === 'object') return `{${Object.entries(value as JsonRecord).sort(([a], [b]) => a.localeCompare(b)).map(([key, nested]) => `${JSON.stringify(key)}:${stableJson(nested)}`).join(',')}}`
  return JSON.stringify(value) ?? 'null'
}
const same = (left: unknown, right: unknown): boolean => stableJson(left) === stableJson(right)
const digest = (value: string | Uint8Array): string => `sha256:${createHash('sha256').update(value).digest('hex')}`
const normalize = (value: unknown): string => String(value ?? '').normalize('NFKC').replace(/\s+/gu, ' ').trim()
const reviewFingerprint = (goal: JsonRecord, ruleVersion: string): string => digest(stableJson({
  ruleVersion, goalId: goal.id, shortKey: goal.shortKey ?? '', title: normalize(goal.title), titleEn: normalize(goal.titleEn),
  description: normalize(goal.description), descriptionEn: normalize(goal.descriptionEn), phase: normalize(goal.dimensionTags?.phase),
  area: normalize(goal.dimensionTags?.area), topicCode: normalize(goal.dimensionTags?.topicCode), nodeKind: normalize(goal.nodeKind),
}))
const deterministicGoalId = (shortKey: string): string => {
  const hash = createHash('sha1').update(`DE-GYM-CANONICAL-PHYSICS:${shortKey}`).digest('hex')
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-5${hash.slice(13, 16)}-${((Number.parseInt(hash[16]!, 16) & 0x3) | 0x8).toString(16)}${hash.slice(17, 20)}-${hash.slice(20, 32)}`
}
const replaceBounded = (input: string, before: string, after: string, label: string): string => {
  if (input.split(after).length - 1 === 1) return input
  if (input.split(before).length - 1 === 1) return input.replace(before, after)
  throw new Error(`${label}: expected exactly one old/current binding`)
}
if (deterministicGoalId(lengthShortKey) !== lengthId || deterministicGoalId(velocityShortKey) !== velocityId) throw new Error('Split-child UUIDv5 derivation drifted')

for (const evidence of [
  { path: paths.roundA, sha: 'sha256:8010b4d705d41f1b5153ff4b19926449f6135ee67fa4171d33fdc14673828a69' },
  { path: paths.roundB, sha: 'sha256:39e35a95bab9c47eec3610b865282c7df67231bf7355fbab74fce44d6c045ec7' },
]) {
  const bytes = readFileSync(absolute(evidence.path))
  if (digest(bytes) !== evidence.sha) throw new Error(`${evidence.path}: review evidence drifted`)
  const decisions = bytes.toString('utf8').split(/\r?\n/u).filter(Boolean).map((line) => JSON.parse(line) as JsonRecord)
  for (const id of [timeId, lorentzId]) if (decisions.filter((record) => record.goalId === id && record.decision === 'split_review').length !== 1) throw new Error(`${evidence.path}: missing SPLIT consensus for ${id}`)
}

const outputs = new Map<string, string>()
const canonical = readJson(paths.canonical)
const goals = canonical.goals as JsonRecord[]
if (canonical.landscapeId !== landscapeId || ![708, 710].includes(goals.length)) throw new Error('Canonical Physics outside exact before/after cardinality')
let goalById = new Map(goals.map((goal) => [String(goal.id), goal]))
const time = goalById.get(timeId)!
const lorentz = goalById.get(lorentzId)!
if (!time || !lorentz || !same(time.contains, []) || !same(lorentz.contains, [])) throw new Error('Split targets missing or non-leaf')
for (const [goal, before, after, label] of [[time, timeBefore, timeAfter, 'time'], [lorentz, lorentzBefore, lorentzAfter, 'lorentz']] as const) {
  const current = { title: goal.title, titleEn: goal.titleEn, description: goal.description, descriptionEn: goal.descriptionEn }
  if (!same(current, before) && !same(current, after)) throw new Error(`${label}: bilingual text outside bounded states`)
  Object.assign(goal, after, { semanticAtomic: true })
  const links = (goal.resourceLinks ?? []).filter((link: JsonRecord) => link.type === 'goal-visualization')
  if (links.length !== 1 || links[0].skillpilotId !== goal.id) throw new Error(`${label}: retained visualization binding drifted`)
  Object.assign(links[0], { title: `Visualisierung: ${after.title}`, description: `Visualisierung zum Lernziel: ${after.title}.`, altText: `Didaktische Visualisierung zum Lernziel "${after.title}". ${after.description}` })
}
const childSpecs = [
  {
    anchor: time, id: lengthId, shortKey: lengthShortKey, title: 'Längenkontraktion erläutern', titleEn: 'Explain Length Contraction',
    description: 'Die lernende Person kann Längenkontraktion mithilfe einfacher Beispiele und Gedankenexperimente erläutern und zugehörige experimentelle Nachweise qualitativ diskutieren.',
    descriptionEn: 'The learner can explain length contraction using simple examples and thought experiments and qualitatively discuss corresponding experimental evidence.',
  },
  {
    anchor: lorentz, id: velocityId, shortKey: velocityShortKey, title: 'Relativistische Geschwindigkeitsaddition anwenden', titleEn: 'Apply Relativistic Velocity Addition',
    description: 'Die lernende Person kann Geschwindigkeiten bei kollinearer Bewegung zwischen gleichförmig relativ bewegten Inertialsystemen mit der relativistischen Geschwindigkeitsaddition umrechnen und die Grenzfälle einordnen.',
    descriptionEn: 'The learner can use relativistic velocity addition to convert velocities for collinear motion between inertial frames in uniform relative motion and interpret the limiting cases.',
  },
] as const
for (const spec of childSpecs) {
  const expected = { ...spec.anchor, id: spec.id, shortKey: spec.shortKey, title: spec.title, titleEn: spec.titleEn, description: spec.description, descriptionEn: spec.descriptionEn, resourceLinks: [] }
  const current = goalById.get(spec.id)
  if (current && !same(current, expected)) throw new Error(`${spec.id}: split child differs from exact after-state`)
  if (!current) goals.splice(goals.findIndex((goal) => goal.id === spec.anchor.id) + 1, 0, expected)
  goalById = new Map(goals.map((goal) => [String(goal.id), goal]))
}
const parent = goalById.get(parentId)!
if (!Array.isArray(parent?.contains)) throw new Error('Relativity parent missing')
for (const [anchor, child] of [[timeId, lengthId], [lorentzId, velocityId]] as const) {
  if (!parent.contains.includes(child)) parent.contains.splice(parent.contains.indexOf(anchor) + 1, 0, child)
  if (parent.contains.filter((id: string) => id === child).length !== 1 || parent.contains[parent.contains.indexOf(anchor) + 1] !== child) throw new Error(`${child}: parent placement drifted`)
}
const capstone = goalById.get(capstoneId)!
for (const list of [capstone.requires, capstone.examData?.coveredGoalIds] as string[][]) for (const [anchor, child] of [[timeId, lengthId], [lorentzId, velocityId]] as const) {
  if (!list.includes(child)) list.splice(list.indexOf(anchor) + 1, 0, child)
  if (list.filter((id) => id === child).length !== 1 || list[list.indexOf(anchor) + 1] !== child) throw new Error(`${child}: Q4 capstone placement drifted`)
}
const gpsAssessment = goalById.get(gpsAssessmentId)!
if (!gpsAssessment?.requires?.includes(timeId) || !gpsAssessment.requires.includes(lorentzId) || gpsAssessment.requires.includes(lengthId) || gpsAssessment.requires.includes(velocityId)
  || gpsAssessment.examData.coveredGoalIds.includes(lengthId) || gpsAssessment.examData.coveredGoalIds.includes(velocityId)) throw new Error('GPS assessment must remain tied only to competences it actually assesses')
if (goals.length !== 710) throw new Error('Canonical Physics after-count mismatch')
outputs.set(paths.canonical, serializeJson(canonical))

const provenanceRegistry = readJson(paths.provenance)
const provenanceLandscape = (provenanceRegistry.landscapes as JsonRecord[]).find((entry) => entry.landscapeId === landscapeId)!
const provenance = provenanceLandscape.goalProvenance as JsonRecord
for (const [anchor, child, sourceGoalId] of [[timeId, lengthId, '376cf778-c9c5-4110-b009-7b31c6a75623'], [lorentzId, velocityId, '68dc2daa-3e31-433d-9a96-b76be95a6d68']] as const) {
  const expected = { sourceLandscapeId: '24f2ca0f-b94a-444e-bb70-677cb6f85c02', sourceGoalId }
  if (!same(provenance[anchor], expected) || (provenance[child] && !same(provenance[child], expected))) throw new Error(`${child}: provenance boundary drifted`)
  provenance[child] = expected
}
provenanceLandscape.goalProvenance = Object.fromEntries(Object.entries(provenance).sort(([a], [b]) => a.localeCompare(b)))
outputs.set(paths.provenance, serializeJson(provenanceRegistry))

const semanticKinds = readJson(paths.semanticKinds)
const semanticDecisions = semanticKinds.decisions as JsonRecord[]
const semanticById = new Map(semanticDecisions.map((decision) => [String(decision.goalId), decision]))
for (const spec of childSpecs) if (!semanticById.has(spec.id)) semanticDecisions.push({ goalId: spec.id, sourceFingerprint: '', semanticKind: 'curricularAtomic', decisionStatus: 'authoritative', decisionBasis: 'reviewed-current-pilot-curricular-atomic' })
for (const id of [timeId, lengthId, lorentzId, velocityId, parentId, capstoneId]) {
  const decision = semanticDecisions.find((candidate) => candidate.goalId === id)
  const goal = goalById.get(id)
  if (!decision || !goal || decision.decisionStatus !== 'authoritative') throw new Error(`${id}: semantic-kind binding missing`)
  decision.sourceFingerprint = fingerprintSemanticKindSourceGoal(goal)
}
if (![462, 464].includes(semanticKinds.counts.curricularAtomic) || ![708, 710].includes(semanticKinds.counts.total)) throw new Error('Semantic-kind denominator outside bounded states')
semanticKinds.counts.curricularAtomic = 464
semanticKinds.counts.total = 710
semanticDecisions.sort((a, b) => String(a.goalId).localeCompare(String(b.goalId)))
outputs.set(paths.semanticKinds, serializeJson(semanticKinds))

const atomicity = readJsonl(paths.atomicity)
const memory = readJsonl(paths.memory)
const ensureReview = (records: JsonRecord[], id: string, factory: () => JsonRecord): JsonRecord => {
  let record = records.find((candidate) => candidate.goalId === id)
  if (!record) { record = factory(); records.push(record) }
  return record
}
const reviewSpecs = [
  { id: timeId, atomicityReason: 'Zeitdilatation und die qualitative Diskussion ihrer experimentellen Nachweise bilden eine einzelne relativistische Deutungskompetenz; Längenkontraktion liegt im getrennten Ziel.', memory: true, memoryReason: 'Die kompakte Zeitdilatationsbeziehung ist für sicheren Abruf geeignet; Bezugssystem, Deutung und Evidenz bleiben Teil der normalen Aufgabenpraxis.' },
  { id: lengthId, atomicityReason: 'Längenkontraktion und die qualitative Diskussion ihrer experimentellen Nachweise bilden eine einzelne relativistische Deutungskompetenz; Zeitdilatation liegt im getrennten Ziel.', memory: true, memoryReason: 'Die kompakte Längenkontraktionsbeziehung ist für sicheren Abruf geeignet; Bezugssystem, Deutung und Evidenz bleiben Teil der normalen Aufgabenpraxis.' },
  { id: lorentzId, atomicityReason: 'Die Umrechnung der Raum- und Zeitkoordinaten eines Ereignisses und ihre gemeinsame physikalische Interpretation sind zwei untrennbare Komponenten derselben Lorentztransformationskompetenz; Geschwindigkeitsaddition liegt im getrennten Ziel.', memory: false, memoryReason: 'Koordinatentransformation und physikalische Interpretation werden durch Modellverständnis und Aufgabenpraxis verankert; eine eigene Memorycard ist nicht notwendig.' },
  { id: velocityId, atomicityReason: 'Die Umrechnung kollinearer Geschwindigkeiten und die Einordnung ihrer Grenzfälle bilden eine einzelne Anwendungskompetenz der relativistischen Geschwindigkeitsaddition.', memory: false, memoryReason: 'Geschwindigkeitsumrechnung und Grenzfallanalyse werden durch Modellverständnis und Aufgabenpraxis verankert; eine eigene Memorycard ist nicht notwendig.' },
] as const
for (const spec of reviewSpecs) {
  const goal = goalById.get(spec.id)!
  const atomicRecord = ensureReview(atomicity, spec.id, () => ({ schemaVersion: 1, reviewId: 'canonical-physics-full', ruleVersion: 'semantic-atomicity-v1', landscapeId, goalId: spec.id }))
  Object.assign(atomicRecord, { fingerprint: reviewFingerprint(goal, 'semantic-atomicity-v1'), status: 'atomic', semanticAtomic: true, reviewedAt, reviewer, reason: spec.atomicityReason, suggestedSplit: [] })
  const memoryRecord = ensureReview(memory, spec.id, () => ({ schemaVersion: 1, reviewId: 'canonical-physics-full', ruleVersion: 'memory-card-review-v1', landscapeId, goalId: spec.id }))
  Object.assign(memoryRecord, { fingerprint: reviewFingerprint(goal, 'memory-card-review-v1'), status: spec.memory ? 'memory_required' : 'no_memory_needed', memoryUseful: spec.memory, reviewedAt, reviewer, reason: spec.memoryReason })
  if (spec.memory) Object.assign(memoryRecord, { memoryGoalIds: [memoryGoalId], deckIds: [deckId] })
  else { delete memoryRecord.memoryGoalIds; delete memoryRecord.deckIds }
}
if (atomicity.length !== 464 || memory.length !== 464) throw new Error('Atomicity/memory denominator must be 464')
atomicity.sort((a, b) => String(a.goalId).localeCompare(String(b.goalId)))
memory.sort((a, b) => String(a.goalId).localeCompare(String(b.goalId)))
outputs.set(paths.atomicity, serializeJsonl(atomicity)); outputs.set(paths.memory, serializeJsonl(memory))

const deck = readJson(paths.deck)
const publicDeck = readJson(paths.publicDeck)
for (const document of [deck, publicDeck]) {
  const card = (document.cards as JsonRecord[]).find((candidate) => candidate.id === 'physics_q4_c14')!
  if (!card || !Array.isArray(card.tags)) throw new Error('Length-contraction memory card missing')
  card.tags = card.tags.map((tag: string) => tag === `goal:${timeId}` ? `goal:${lengthId}` : tag)
  if (!same(card.tags, ['GK', 'LK', `goal:${lengthId}`])) throw new Error('Length-contraction card origin tag drifted')
}
if (!same(deck, publicDeck)) throw new Error('Canonical/public Q4 decks must remain byte-semantic mirrors')
outputs.set(paths.deck, serializeJson(deck)); outputs.set(paths.publicDeck, serializeJson(publicDeck))
const cardReview = readJsonl(paths.cardReview)
const card = (deck.cards as JsonRecord[]).find((candidate) => candidate.id === 'physics_q4_c14')!
const cardRecord = cardReview.find((record) => record.deckId === deckId && record.cardId === card.id)!
if (!cardRecord || cardRecord.status !== 'kept' || cardRecord.necessary !== true) throw new Error('Length-contraction card review binding missing')
cardRecord.originGoalIds = [lengthId]
cardRecord.fingerprint = digest(stableJson({ ruleVersion: cardRecord.ruleVersion, deckId, cardId: card.id, front: normalize(card.front), back: normalize(card.back), category: normalize(card.category), tags: card.tags.map((tag: string) => normalize(tag)).filter(Boolean) }))
cardRecord.reviewedAt = reviewedAt; cardRecord.reviewer = reviewer
cardRecord.reason = 'Behalten: kompakte Längenkontraktionsbeziehung mit eindeutiger Herkunft aus dem getrennten kanonischen Längenkontraktionsziel; Bezugssystem, Anwendung und Deutung bleiben Teil des normalen Lernziels.'
outputs.set(paths.cardReview, serializeJsonl(cardReview))

const visualizationQa = readJson(paths.visualizationQa)
const visualizationRecords = visualizationQa.records as JsonRecord[]
for (const [id, sha] of [[timeId, 'sha256:6deadf30bfcc31b0248499633658df381af2b35a81a2003ca9f26bfcaae1470d'], [lorentzId, 'sha256:4c71775fb31b57da660d291f3c66165ccdc31da35dba33969267a222947971d5']] as const) {
  const qa = visualizationRecords.find((record) => record.goalId === id)!
  if (!qa || qa.visualizationState !== 'available' || qa.assetSha256 !== sha) throw new Error(`${id}: retained visualization QA drifted`)
  qa.title = goalById.get(id)!.title; qa.description = goalById.get(id)!.description
}
for (const id of [lengthId, velocityId]) if (!visualizationRecords.some((record) => record.goalId === id)) {
  const goal = goalById.get(id)!
  visualizationRecords.push({ goalId: id, title: goal.title, description: goal.description, subject: 'physik', landscapeId, landscapePath: paths.canonical, visualizationState: 'missing', missingReason: 'no_primary_link', imageUrl: '', publicAssetPath: '', canonicalAssetPath: '', assetSha256: '', umlautsCorrectChatGpt: 'no', contentApprovedChatGpt: 'no', humanApproved: 'no', humanIssueIdentified: 'no', humanIssueDescription: '', chatGptReviewedAt: null, chatGptReviewer: '', chatGptNotes: '', humanReviewedAt: null, humanReviewer: '' })
}
visualizationRecords.sort((a, b) => String(a.title).localeCompare(String(b.title), 'de-DE', { numeric: true, sensitivity: 'base' }) || String(a.goalId).localeCompare(String(b.goalId)))
if (visualizationRecords.length !== 487) throw new Error('Visualization QA after-count mismatch')
outputs.set(paths.visualizationQa, serializeJson(visualizationQa))

type Route = { sourceId: string; before: string[]; after: string[]; rationale: string }
const updateReviewed = (path: string, routes: Route[]): JsonRecord => {
  const document = readJson(path)
  for (const route of routes) {
    const decision = (document.decisions as JsonRecord[]).find((entry) => entry.sourceGoalId === route.sourceId)!
    if (!decision || (!same(decision.canonicalGoalIds, route.before) && !same(decision.canonicalGoalIds, route.after))) throw new Error(`${path}:${route.sourceId}: decision outside bounded route`)
    Object.assign(decision, { canonicalGoalIds: route.after, rationale: route.rationale, reviewedAt, reviewer })
    const mappings = document.mappings as JsonRecord[]
    const existing = mappings.filter((entry) => entry.legacyGoalId === route.sourceId)
    const ids = existing.map((entry) => entry.canonicalGoalId)
    if (!same(ids, route.before) && !same(ids, route.after)) throw new Error(`${path}:${route.sourceId}: mappings outside bounded route`)
    if (!same(ids, route.after)) mappings.splice(mappings.indexOf(existing[0]), existing.length, ...route.after.map((canonicalGoalId) => ({ legacyGoalId: route.sourceId, canonicalGoalId, matchType: 'partial', reviewDecisionId: route.sourceId })))
    else existing.forEach((entry) => { entry.matchType = 'partial' })
  }
  return document
}
const heRoutes: Route[] = [
  { sourceId: 'he-phys-sekii-q4-4-b04-a01-28ebbcae', before: [timeId], after: [timeId, lengthId], rationale: 'Der amtliche Spiegelstrich nennt Zeitdilatation und Längenkontraktion gemeinsam. Nach dem semantischen Split bilden die beiden getrennten kanonischen Ziele zwei partielle, gemeinsam vollständige Abdeckungen.' },
  { sourceId: 'he-phys-sekii-q4-4-b06-a01-234e1e10', before: [timeId], after: [timeId, lengthId], rationale: 'Der breite amtliche Aspekt „experimentelle Nachweise“ wird nach dem Split durch die beiden getrennten Ziele zu Zeitdilatation und Längenkontraktion partiell abgedeckt, die zugehörige experimentelle Evidenz ausdrücklich qualitativ diskutieren lassen.' },
  { sourceId: 'he-phys-sekii-q4-4-b09-a01-959f26cb', before: [lorentzId], after: [lorentzId, velocityId], rationale: 'Der amtliche Spiegelstrich nennt Lorentztransformation und Geschwindigkeitsaddition gemeinsam. Nach dem semantischen Split bilden Ereigniskoordinatentransformation und relativistische Geschwindigkeitsaddition zwei partielle, gemeinsam vollständige Abdeckungen.' },
]
outputs.set(paths.heReview, serializeJson(updateReviewed(paths.heReview, heRoutes)))
const updateLegacy = (path: string, routes: Array<{ sourceId: string; retained: string; child: string }>): JsonRecord => {
  const document = readJson(path); const mappings = document.mappings as JsonRecord[]
  for (const route of routes) {
    const retained = mappings.find((entry) => entry.legacyGoalId === route.sourceId && entry.canonicalGoalId === route.retained)!
    if (!retained) throw new Error(`${path}:${route.sourceId}: retained mapping missing`)
    retained.matchType = 'partial'
    if (!mappings.some((entry) => entry.legacyGoalId === route.sourceId && entry.canonicalGoalId === route.child)) mappings.splice(mappings.indexOf(retained) + 1, 0, { legacyGoalId: route.sourceId, canonicalGoalId: route.child, matchType: 'partial' })
  }
  return document
}
outputs.set(paths.heLegacy, serializeJson(updateLegacy(paths.heLegacy, [
  { sourceId: '376cf778-c9c5-4110-b009-7b31c6a75623', retained: timeId, child: lengthId },
  { sourceId: '68dc2daa-3e31-433d-9a96-b76be95a6d68', retained: lorentzId, child: velocityId },
])))
const byRoutes = [
  { sourceId: '97c0dd4b-ec5c-50b6-adb8-2eba5e18c736', child: lengthId, rationale: 'Ph11.3.3 behandelt Folgerungen der Relativitätspostulate und ihre experimentelle Prüfung. Das getrennte Längenkontraktionsziel ergänzt die bereits partielle Zeitdilatationsabdeckung unmittelbar.' },
  { sourceId: 'c891a1aa-1c38-5959-9560-38dd60d0e702', child: lengthId, rationale: 'Ph11.3.4 behandelt die veränderten Vorstellungen von Raum und Zeit. Nach dem Split gehören Zeitdilatation und Längenkontraktion als getrennte partielle Abdeckungen gemeinsam in diese Route.' },
]
const byReview = readJson(paths.byReview)
for (const route of byRoutes) {
  const decision = (byReview.decisions as JsonRecord[]).find((entry) => entry.sourceGoalId === route.sourceId)!
  if (!decision?.canonicalGoalIds?.includes(timeId)) throw new Error(`${route.sourceId}: BY time anchor missing`)
  if (!decision.canonicalGoalIds.includes(route.child)) decision.canonicalGoalIds.splice(decision.canonicalGoalIds.indexOf(timeId) + 1, 0, route.child)
  Object.assign(decision, { rationale: route.rationale, reviewedAt, reviewer })
  const mappings = byReview.mappings as JsonRecord[]
  if (!mappings.some((entry) => entry.legacyGoalId === route.sourceId && entry.canonicalGoalId === route.child)) {
    const index = mappings.findIndex((entry) => entry.legacyGoalId === route.sourceId && entry.canonicalGoalId === timeId)
    mappings.splice(index + 1, 0, { legacyGoalId: route.sourceId, canonicalGoalId: route.child, matchType: 'partial', reviewDecisionId: route.sourceId })
  }
}
if ((byReview.mappings as JsonRecord[]).some((entry) => entry.canonicalGoalId === velocityId)) throw new Error('BY must not claim the LK-only velocity child')
outputs.set(paths.byReview, serializeJson(byReview))
outputs.set(paths.rpReview, serializeJson(updateReviewed(paths.rpReview, [{ sourceId: 'rp-phys-sek2-relativistic-consequences', before: [timeId], after: [timeId, lengthId], rationale: 'Die RP-Quellkompetenz nennt Lorentz-Kontraktion, Zeitdilatation und Zwillingsparadoxon gemeinsam. Nach dem Split bilden die beiden kanonischen Ziele zu Zeitdilatation und Längenkontraktion zwei partielle Abdeckungen; das Zwillingsparadoxon bleibt außerhalb dieser engen Zuordnung.' }])))
outputs.set(paths.rpLegacy, serializeJson(updateLegacy(paths.rpLegacy, [{ sourceId: 'rp-phys-sek2-relativistic-consequences', retained: timeId, child: lengthId }])))

const insertViewChild = (document: JsonRecord, anchorId: string, childId: string, label: string): void => {
  let anchors = 0
  const visit = (node: unknown): void => {
    if (Array.isArray(node)) for (let index = 0; index < node.length; index += 1) { const entry = node[index] as JsonRecord; if (entry?.kind === 'goalEntry' && entry.goalId === anchorId) { anchors += 1; if ((node[index + 1] as JsonRecord)?.goalId !== childId) node.splice(index + 1, 0, { kind: 'goalEntry', goalId: childId }) } visit(entry) }
    else if (node && typeof node === 'object') Object.values(node as JsonRecord).forEach(visit)
  }
  visit(document.rootNodes)
  const serialized = JSON.stringify(document.rootNodes)
  if (anchors !== 1 || serialized.split(childId).length - 1 !== 1) throw new Error(`${label}: expected one adjacent child`)
}
for (const path of byViews) { const view = readJson(path); insertViewChild(view, timeId, lengthId, path); outputs.set(path, serializeJson(view)) }
const navigation = readJson(paths.atlasNavigation)
insertViewChild(navigation, timeId, lengthId, paths.atlasNavigation)
insertViewChild(navigation, lorentzId, velocityId, paths.atlasNavigation)
outputs.set(paths.atlasNavigation, serializeJson(navigation))

const atlasSources = readJson(paths.atlasSources)
if (![462, 464].includes(atlasSources.expectedCurricularAtomicGoalCount)) throw new Error('Atlas denominator outside bounded states')
atlasSources.expectedCurricularAtomicGoalCount = 464
outputs.set(paths.atlasSources, serializeJson(atlasSources))
let heGenerator = readFileSync(absolute(paths.heGenerator), 'utf8')
for (const code of ['4', '6']) heGenerator = replaceBounded(heGenerator, `  'Q4.4:${code}': ['${timeId}'],`, `  'Q4.4:${code}': ['${timeId}', '${lengthId}'],`, `HE Q4.4:${code}`)
heGenerator = replaceBounded(heGenerator, `  'Q4.4:9': ['${lorentzId}'],`, `  'Q4.4:9': ['${lorentzId}', '${velocityId}'],`, 'HE Q4.4:9')
outputs.set(paths.heGenerator, heGenerator)
let byGenerator = readFileSync(absolute(paths.byGenerator), 'utf8')
byGenerator = replaceBounded(byGenerator,
  `    'a08e33db-d821-457b-86dd-870e7648c5f4',\n    '${timeId}',\n    '6ebb6182-f221-5f4c-b112-4ac72b104321',`,
  `    'a08e33db-d821-457b-86dd-870e7648c5f4',\n    '${timeId}',\n    '${lengthId}',\n    '6ebb6182-f221-5f4c-b112-4ac72b104321',`, 'BY Ph11.3.3 length split')
byGenerator = replaceBounded(byGenerator,
  `  'c891a1aa-1c38-5959-9560-38dd60d0e702': [\n    '${postulatesId}',\n    '${timeId}',\n    '6ebb6182-f221-5f4c-b112-4ac72b104321',`,
  `  'c891a1aa-1c38-5959-9560-38dd60d0e702': [\n    '${postulatesId}',\n    '${timeId}',\n    '${lengthId}',\n    '6ebb6182-f221-5f4c-b112-4ac72b104321',`, 'BY Ph11.3.4 length split')
outputs.set(paths.byGenerator, byGenerator)

let inputTest = readFileSync(absolute(paths.goalBookInputTest), 'utf8')
inputTest = replaceBounded(inputTest, '  curricularAtomic: 462,', '  curricularAtomic: 464,', 'semantic count')
inputTest = replaceBounded(inputTest, '  total: 708,', '  total: 710,', 'semantic total')
inputTest = replaceBounded(inputTest, 'all 462 atlas goals exactly once', 'all 464 atlas goals exactly once', 'atlas error count')
inputTest = replaceBounded(inputTest, 'assert.equal(canonicalProfileTargetIds.size, 389)', 'assert.equal(canonicalProfileTargetIds.size, 391)', 'profile target count')
inputTest = replaceBounded(inputTest, 'const EXPECTED_PHYSICS_SEKI_PROJECTED_ROUTE_TARGET_OCCURRENCES = 6387', 'const EXPECTED_PHYSICS_SEKI_PROJECTED_ROUTE_TARGET_OCCURRENCES = 6388', 'Sek-I projected route target occurrences')
inputTest = replaceBounded(inputTest, 'const EXPECTED_PHYSICS_SEKI_PROFILE_SELECTED_TARGET_OCCURRENCES = 6215', 'const EXPECTED_PHYSICS_SEKI_PROFILE_SELECTED_TARGET_OCCURRENCES = 6216', 'Sek-I profile-selected target occurrences')
outputs.set(paths.goalBookInputTest, inputTest)

const curricularAtomic = new Set((semanticDecisions as JsonRecord[]).filter((decision) => decision.semanticKind === 'curricularAtomic').map((decision) => decision.goalId))
const changedTitles = new Set([timeId, lorentzId])
const recheckSet = new Set([timeId, lengthId, lorentzId, velocityId])
for (const goal of goals) if (curricularAtomic.has(goal.id)) {
  if ((goal.requires ?? []).some((id: string) => changedTitles.has(id)) || (goal.contains ?? []).some((id: string) => changedTitles.has(id))) recheckSet.add(goal.id)
  if ([lengthId, velocityId].some((child) => (goal.requires ?? []).includes(child) || (goal.contains ?? []).includes(child))) recheckSet.add(goal.id)
}
for (const child of [lengthId, velocityId]) for (const id of [...(goalById.get(child)?.requires ?? []), ...(goalById.get(child)?.contains ?? [])]) if (curricularAtomic.has(id)) recheckSet.add(id)
for (const changedId of changedTitles) for (const id of [...(goalById.get(changedId)?.requires ?? []), ...(goalById.get(changedId)?.contains ?? [])]) if (curricularAtomic.has(id)) recheckSet.add(id)
const recheckIds = [postulatesId, timeId, lengthId, 'a9169a74-de19-54a9-a8ac-a2ce43c7342e', '6ebb6182-f221-5f4c-b112-4ac72b104321', lorentzId, velocityId, '79da5c34-86b2-5c10-9726-9de886ccef7d', 'bfea7a23-1ce1-4a42-badd-1fc9bf30124a']
if (!same([...recheckSet].sort(), [...recheckIds].sort())) throw new Error(`Direct curricularAtomic recheck boundary drifted: ${[...recheckSet].sort().join(',')}`)
const recheckConfig = {
  $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-batch-config.schema.json', schemaVersion: 1,
  batchId: 'physik-rollout-v1-batch-033z-relativity-final-splits-current-recheck-9-v1-20260905', subject: 'physik', subjectLabel: 'Physik',
  bookId: 'de-gym-physics-b033z-relativity-final-splits-current-recheck-9-v1-20260905',
  title: 'Physik B033z – Finale Nachprüfung der Zeitdilatation/Längenkontraktion- und Lorentz/Geschwindigkeitsaddition-Splits samt direkt veralteter curricularAtomic-Kontexte',
  baseGoalBookConfigPath: 'app/scripts/config/goal-books/de-gym-physics-national-atlas.json', goalIds: recheckIds,
  outputDirectory: 'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-05/batch-033z-relativity-final-splits-current-recheck-9-v1',
  feedbackBaseUrl: 'https://skillpilot.com/lernziel-feedback', promptPath: 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md',
  criteriaPath: 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/physics-goal-description-understanding-evidence-review-criteria-v1.md', printDerivativeProfile: 'bounded-atlas',
}
outputs.set(paths.recheckConfig, serializeJson(recheckConfig))
const inFlight = readJson(paths.inFlightLedger)
const oldCount = inFlight.activeBatchConfigPaths.filter((path: string) => path === oldBatchConfig).length
const newCount = inFlight.activeBatchConfigPaths.filter((path: string) => path === paths.recheckConfig).length
if (!((oldCount === 1 && newCount === 0) || (oldCount === 0 && newCount === 1))) throw new Error('In-flight ledger outside exact B033y/B033z states')
inFlight.activeBatchConfigPaths = inFlight.activeBatchConfigPaths.map((path: string) => path === oldBatchConfig ? paths.recheckConfig : path)
outputs.set(paths.inFlightLedger, serializeJson(inFlight))

const mappingFiles = (directory: string): string[] => readdirSync(directory).flatMap((name) => { const child = resolve(directory, name); return statSync(child).isDirectory() ? mappingFiles(child) : child.endsWith('.json') ? [child] : [] })
const planned = new Map(outputs)
const childMappingRefs: string[] = []
for (const absolutePath of mappingFiles(absolute('curricula/DE/Gymnasium/mapping'))) {
  const path = absolutePath.slice(`${repoRoot}/`.length)
  const document = JSON.parse(planned.get(path) ?? readFileSync(absolutePath, 'utf8')) as JsonRecord
  for (const decision of document.decisions ?? []) for (const child of [lengthId, velocityId]) if ((decision.canonicalGoalIds ?? []).includes(child)) childMappingRefs.push(`${path}|decision|${decision.sourceGoalId}|${child}`)
  for (const mapping of document.mappings ?? []) for (const child of [lengthId, velocityId]) if (mapping.canonicalGoalId === child) childMappingRefs.push(`${path}|mapping|${mapping.legacyGoalId}|${child}`)
}
const expectedMappingRefs = [
  ...['he-phys-sekii-q4-4-b04-a01-28ebbcae', 'he-phys-sekii-q4-4-b06-a01-234e1e10'].flatMap((source) => [`${paths.heReview}|decision|${source}|${lengthId}`, `${paths.heReview}|mapping|${source}|${lengthId}`]),
  `${paths.heReview}|decision|he-phys-sekii-q4-4-b09-a01-959f26cb|${velocityId}`, `${paths.heReview}|mapping|he-phys-sekii-q4-4-b09-a01-959f26cb|${velocityId}`,
  `${paths.heLegacy}|mapping|376cf778-c9c5-4110-b009-7b31c6a75623|${lengthId}`, `${paths.heLegacy}|mapping|68dc2daa-3e31-433d-9a96-b76be95a6d68|${velocityId}`,
  ...byRoutes.flatMap(({ sourceId }) => [`${paths.byReview}|decision|${sourceId}|${lengthId}`, `${paths.byReview}|mapping|${sourceId}|${lengthId}`]),
  `${paths.rpReview}|decision|rp-phys-sek2-relativistic-consequences|${lengthId}`, `${paths.rpReview}|mapping|rp-phys-sek2-relativistic-consequences|${lengthId}`, `${paths.rpLegacy}|mapping|rp-phys-sek2-relativistic-consequences|${lengthId}`,
]
if (!same(childMappingRefs.sort(), expectedMappingRefs.sort())) throw new Error(`Split-child mapping boundary drifted: ${childMappingRefs.join(';')}`)

const plannedCorpusSha256 = digest(stableJson([...outputs].map(([path, bytes]) => ({ path, sha256: digest(bytes) }))))
if (expectedPlannedCorpusSha256 !== 'PENDING' && plannedCorpusSha256 !== expectedPlannedCorpusSha256) throw new Error(`Planned corpus drifted: ${plannedCorpusSha256}`)
const changed = [...outputs].filter(([path, bytes]) => !existsSync(absolute(path)) || readFileSync(absolute(path), 'utf8') !== bytes)
if (writeMode) {
  execFileSync(process.execPath, ['scripts/check_openai_plugin_review_freeze.mjs'], { cwd: repoRoot, stdio: 'inherit' })
  for (const [path, bytes] of changed) writeFileSync(absolute(path), bytes)
} else if (expectedPlannedCorpusSha256 !== 'PENDING' && changed.length > 0) throw new Error(`Physics B033y splits not materialized: ${changed.map(([path]) => path).join(', ')}`)
console.log(`CHECK apply_physics_batch_033y_relativity_final_splits ${writeMode ? 'WRITE' : changed.length === 0 ? 'PASS' : 'PLAN'} retained=2 newAtoms=2 mappingRefs=${expectedMappingRefs.length} views=4+navigation assessmentsExpanded=1 recheck=9 denominator=462->464 imageBytes=0 files=${outputs.size} changed=${changed.length}`)
console.log(`PLANNED_CORPUS_SHA256 ${plannedCorpusSha256}`)
console.log(`PLANNED_PATHS ${changed.map(([path]) => path).join(',') || '-'}`)
