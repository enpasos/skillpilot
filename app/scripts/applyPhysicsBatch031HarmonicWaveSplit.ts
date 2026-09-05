import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel'

// The Layer-A ledgers intentionally have different historic schemas.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonRecord = Record<string, any>

const repoRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')
const unexpectedArguments = process.argv.slice(2).filter((argument) => argument !== '--write')
if (unexpectedArguments.length > 0) throw new Error(`Unexpected arguments: ${unexpectedArguments.join(', ')}`)

const landscapeId = '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'
const retainedId = 'cb0ced6d-b7c1-5b7d-9922-8c394f6030e8'
const newId = 'bf559969-a05c-58b5-82c5-3d719d96555d'
const parentId = 'dc38c943-11f6-5f4f-945b-67e330814727'
const assessmentId = '50328a4f-91e8-5c8b-8d61-8f9c98a5cddf'
const memoryGoalId = '0ceb4400-3e8f-586c-a669-a8877906bd8d'
const memoryDeckId = 'de_gymnasium_physics_waves_q2'
const reviewedAt = '2026-09-05'
const reviewer = 'codex-physics-b031w-harmonic-wave-split-final-adjudication-2026-09-05'
const protectedAssetSha256 = '1c18360b0fa1c95d4aecdad64537034748456aae82b50e9fcdff5dc3fb4644c9'
const expectedPlannedCorpusSha256 = '96728f6f63bc526bf10279b7f6a74689aaed2ba0bcb6092b47667dbd525966f2'

const retainedText = {
  title: 'Harmonische Wellen über ihre Kenngrößen beschreiben',
  titleEn: 'Describe Harmonic Waves Using Their Characteristic Quantities',
  description: 'Die lernende Person kann bei einer fortschreitenden harmonischen Welle Frequenz und Wellenlänge als zeitliche beziehungsweise räumliche Periodizität deuten, die Phasengeschwindigkeit von der lokalen Schwingungsbewegung unterscheiden und den Zusammenhang $v = \\lambda \\cdot f$ begründen und nutzen.',
  descriptionEn: 'The learner can interpret frequency and wavelength of a travelling harmonic wave as its temporal and spatial periodicity, distinguish phase velocity from the local oscillatory motion, and justify and use the relationship $v = \\lambda \\cdot f$.',
} as const

const retainedTextBeforeFinalReview = {
  title: retainedText.title,
  titleEn: retainedText.titleEn,
  description: 'Die lernende Person kann Frequenz und Wellenlänge als zeitliche beziehungsweise räumliche Periodizität einer harmonischen Welle deuten, die Ausbreitungsgeschwindigkeit als Geschwindigkeit gleicher Phasen von einer lokalen Schwingungsbewegung unterscheiden und den Zusammenhang $v = \\lambda \\cdot f$ begründen und nutzen.',
  descriptionEn: 'The learner can interpret frequency and wavelength as the temporal and spatial periodicity of a harmonic wave, distinguish propagation speed as the speed of equal-phase points from local oscillatory motion, and justify and use the relationship $v = \\lambda \\cdot f$.',
} as const

const newText = {
  shortKey: 'canonical_physics_sek2_harmonic_mechanical_wave_generation_and_propagation',
  title: 'Erzeugung und Ausbreitung harmonischer mechanischer Wellen erklären',
  titleEn: 'Explain the Generation and Propagation of Harmonic Mechanical Waves',
  description: 'Die lernende Person kann erklären, wie eine harmonische Anregung in einem gekoppelten, näherungsweise linearen Medium eine harmonische mechanische Welle erzeugt und wie sich dabei Störung und Energie ausbreiten, obwohl die Medienelemente nur lokal schwingen.',
  descriptionEn: 'The learner can explain how harmonic excitation in a coupled, approximately linear medium generates a harmonic mechanical wave and how the disturbance and energy propagate even though the medium elements oscillate only locally.',
} as const

const newTextBeforeFinalReview = {
  ...newText,
  description: 'Die lernende Person kann erklären, wie eine periodische Anregung in einem gekoppelten Medium eine harmonische mechanische Welle erzeugt und wie sich dabei Störung und Energie ausbreiten, obwohl die Medienelemente nur lokal schwingen.',
  descriptionEn: 'The learner can explain how periodic excitation in a coupled medium generates a harmonic mechanical wave and how the disturbance and energy propagate while the medium elements oscillate only locally.',
} as const

const oldText = {
  title: 'Harmonische Wellen und ihre Größen',
  titleEn: 'Harmonic Waves and Their Quantities',
  description: 'Die lernende Person kann harmonische Wellen erzeugen und beschreiben, charakteristische Größen wie Ausbreitungsgeschwindigkeit, Wellenlänge und Frequenz angeben und den Zusammenhang $v = \\lambda \\cdot f$ nutzen.',
  descriptionEn: 'The learner can generate and describe harmonic waves, state characteristic quantities like propagation speed, wavelength, and frequency, and use the relationship $v = \\lambda \\cdot f$.',
} as const

const paths = {
  canonical: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json',
  semanticKinds: 'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json',
  atomicity: 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-physics-full.review.jsonl',
  memory: 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-physics-full.review.jsonl',
  cards: 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-physics-full.cards.review.jsonl',
  provenance: 'curricula/DE/Gymnasium/provenance/canonical-goal-provenance-registry.json',
  visualizationQa: 'curricula/DE/Gymnasium/quality/goal-visualization-qa/physik.qa.json',
  retainedPrompt: `curricula/DE/Gymnasium/visualizations/physik/${retainedId}/prompt.de.md`,
  newPrompt: `curricula/DE/Gymnasium/visualizations/physik/${newId}/prompt.de.md`,
  visualizationReview: 'curricula/DE/Gymnasium/quality/goal-visualization-review/physik-batch-089.md',
  heReview: 'curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_physics_upper_secondary_source_extraction_to_canonical_physics.review.json',
  heLegacy: 'curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_physics_upper_secondary_to_canonical_physics.json',
  byReview: 'curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_physics_source_extraction_to_canonical_physics.review.json',
  byLegacy: 'curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_physics_to_canonical_physics.json',
  slReview: 'curricula/DE/Gymnasium/mapping/DE-SL/upper-secondary/sl_physics_upper_secondary_source_extraction_to_canonical_physics.review.json',
  atlas: 'app/scripts/config/goal-books/navigation/de-gym-physics-national-atlas.view.json',
  atlasSources: 'app/scripts/config/goal-books/de-gym-physics-national-atlas.sources.json',
  heGenerator: 'app/scripts/generateHePhysicsSourceExtraction.ts',
  byGenerator: 'app/scripts/generateByPhysicsSourceExtraction.ts',
  slGenerator: 'app/scripts/generateSlPhysicsSourceExtraction.ts',
} as const

const byViewPaths = [
  'curricula/DE/Gymnasium/composition-views/physik/de-by-gk.view.json',
  'curricula/DE/Gymnasium/composition-views/physik/de-by-lk.view.json',
  'curricula/DE/Gymnasium/composition-views/physik/de-by-sekii-gk.view.json',
  'curricula/DE/Gymnasium/composition-views/physik/de-by-sekii-lk.view.json',
] as const

const protectedAssetPaths = [
  `curricula/DE/Gymnasium/visualizations/physik/${retainedId}/${retainedId}.jpg`,
  `app/public/assets/goal-visualizations/physik/${retainedId}/${retainedId}.jpg`,
  `backend/src/main/resources/static/assets/goal-visualizations/physik/${retainedId}/${retainedId}.jpg`,
] as const

const expectedCounts = {
  canonicalBefore: 706,
  canonicalAfter: 707,
  semanticBefore: 706,
  semanticAfter: 707,
  atomicityBefore: 461,
  atomicityAfter: 462,
  memoryBefore: 461,
  memoryAfter: 462,
  qaBefore: 484,
  qaAfter: 485,
  heReviewMappingsBefore: 366,
  heReviewMappingsAfter: 366,
  heLegacyMappingsBefore: 377,
  heLegacyMappingsAfter: 378,
  byReviewMappingsBefore: 1009,
  byReviewMappingsAfter: 1009,
  byLegacyMappingsBefore: 45,
  byLegacyMappingsAfter: 45,
  slReviewMappingsBefore: 3045,
  slReviewMappingsAfter: 3047,
  directOutputs: 23,
} as const

function absolute(path: string): string {
  return resolve(repoRoot, path)
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

function readJson(path: string): JsonRecord {
  return JSON.parse(readFileSync(absolute(path), 'utf8')) as JsonRecord
}

function readJsonl(path: string): JsonRecord[] {
  return readFileSync(absolute(path), 'utf8').split(/\r?\n/u).filter(Boolean).map((line) => JSON.parse(line) as JsonRecord)
}

function serializeJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`
}

function serializeJsonl(records: JsonRecord[]): string {
  return `${records.map((record) => JSON.stringify(record)).join('\n')}\n`
}

function same(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

function compareCodePoints(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0
}

function countOccurrences(text: string, needle: string): number {
  return text.split(needle).length - 1
}

function replaceExactly(text: string, before: string, after: string, label: string): string {
  if (text.includes(after)) {
    assert(!text.includes(before), `${label}: mixed before/after state`)
    return text
  }
  assert(countOccurrences(text, before) === 1, `${label}: expected exactly one before-state anchor`)
  return text.replace(before, after)
}

function sha256(bytes: string | Buffer): string {
  return createHash('sha256').update(bytes).digest('hex')
}

function deterministicGoalId(shortKey: string): string {
  const hash = createHash('sha1').update(`DE-GYM-CANONICAL-PHYSICS:${shortKey}`).digest('hex')
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-5${hash.slice(13, 16)}-${((Number.parseInt(hash[16]!, 16) & 0x3) | 0x8).toString(16)}${hash.slice(17, 20)}-${hash.slice(20, 32)}`
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as JsonRecord).sort(([a], [b]) => a.localeCompare(b))
      .map(([key, nested]) => `${JSON.stringify(key)}:${stableJson(nested)}`).join(',')}}`
  }
  return JSON.stringify(value)
}

function normalizeText(value: unknown): string {
  return String(value ?? '').normalize('NFKC').replace(/\s+/gu, ' ').trim()
}

function reviewFingerprint(goal: JsonRecord, ruleVersion: string): string {
  return `sha256:${sha256(stableJson({
    ruleVersion,
    goalId: goal.id,
    shortKey: goal.shortKey ?? '',
    title: normalizeText(goal.title),
    titleEn: normalizeText(goal.titleEn),
    description: normalizeText(goal.description),
    descriptionEn: normalizeText(goal.descriptionEn),
    phase: normalizeText(goal.dimensionTags?.phase),
    area: normalizeText(goal.dimensionTags?.area),
    topicCode: normalizeText(goal.dimensionTags?.topicCode),
    nodeKind: normalizeText(goal.nodeKind),
  }))}`
}

function assertProtectedAsset(): void {
  for (const path of protectedAssetPaths) {
    assert(existsSync(absolute(path)), `Protected Nano Banana asset missing: ${path}`)
    assert(sha256(readFileSync(absolute(path))) === protectedAssetSha256, `Protected Nano Banana asset drift: ${path}`)
  }
}

function countGoalReferences(value: unknown, goalId: string): number {
  if (Array.isArray(value)) return value.reduce((sum, entry) => sum + countGoalReferences(entry, goalId), 0)
  if (!value || typeof value !== 'object') return 0
  const record = value as JsonRecord
  return (record.goalId === goalId ? 1 : 0)
    + Object.values(record).reduce((sum, entry) => sum + countGoalReferences(entry, goalId), 0)
}

function buildCanonical(): { document: JsonRecord; retained: JsonRecord; created: JsonRecord } {
  const document = readJson(paths.canonical)
  assert(document.landscapeId === landscapeId, 'Unexpected canonical Physics landscape')
  const goals = document.goals as JsonRecord[]
  assert(Array.isArray(goals), 'Canonical Physics goals missing')
  const existingNew = goals.find((goal) => goal.id === newId)
  assert(goals.length === (existingNew ? expectedCounts.canonicalAfter : expectedCounts.canonicalBefore), 'Canonical goal count outside exact before/after state')
  assert(goals.filter((goal) => goal.id === retainedId).length === 1, 'Retained goal must occur exactly once')
  assert(goals.filter((goal) => goal.id === newId).length <= 1, 'New goal occurs more than once')
  const retained = goals.find((goal) => goal.id === retainedId)!
  const beforeText = Object.entries(oldText).every(([key, value]) => retained[key] === value)
  const beforeFinalReviewText = Object.entries(retainedTextBeforeFinalReview).every(([key, value]) => retained[key] === value)
  const afterText = Object.entries(retainedText).every(([key, value]) => retained[key] === value)
  assert(beforeText || beforeFinalReviewText || afterText, 'Retained goal text is outside exact bounded states')
  assert(same(retained.requires, ['fcf8580c-ecfd-58ea-bbf5-a1b29c9ecf8e', '3c82510a-1f12-4eaa-81c2-8599437a5b85']), 'Retained prerequisites drifted')
  assert(same(retained.contains, []), 'Retained goal is no longer atomic')
  assert(retained.type === 'atomic', 'Retained goal type drifted')
  assert(Array.isArray(retained.resourceLinks) && retained.resourceLinks.length === 1, 'Retained visualization link count drifted')
  const protectedLink = retained.resourceLinks[0] as JsonRecord
  assert(protectedLink.skillpilotId === retainedId && protectedLink.provider === 'Google Gemini / Nano Banana Pro'
    && protectedLink.url === `/assets/goal-visualizations/physik/${retainedId}/${retainedId}.jpg`, 'Retained Nano Banana link drifted')

  Object.assign(retained, retainedText, { semanticAtomic: true })
  Object.assign(protectedLink, {
    title: `Visualisierung: ${retainedText.title}`,
    description: `Visualisierung zum Lernziel: ${retainedText.title}.`,
    altText: `Didaktische Visualisierung zum Lernziel "${retainedText.title}". ${retainedText.description}`,
  })

  const created: JsonRecord = {
    id: newId,
    shortKey: newText.shortKey,
    title: newText.title,
    titleEn: newText.titleEn,
    description: newText.description,
    descriptionEn: newText.descriptionEn,
    weight: 1.05,
    tags: ['GK', 'LK'],
    contains: [],
    requires: ['fcf8580c-ecfd-58ea-bbf5-a1b29c9ecf8e', '3c82510a-1f12-4eaa-81c2-8599437a5b85'],
    dimensionTags: {
      framework: 'hessen-kc-2024-physics',
      demandLevel: 'AB1',
      processCompetencies: [],
      guidingIdeas: [],
      phase: 'Q2',
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
  let canonicalCreated = created
  if (existingNew) {
    const beforeFinalReview = { ...created, ...newTextBeforeFinalReview }
    assert(same(existingNew, created) || same(existingNew, beforeFinalReview), 'New goal differs from exact bounded states')
    Object.assign(existingNew, created)
    canonicalCreated = existingNew
  } else goals.splice(goals.indexOf(retained) + 1, 0, created)

  const parent = goals.find((goal) => goal.id === parentId)
  assert(parent && Array.isArray(parent.contains), 'Mechanical-waves parent missing')
  const oldInParent = parent.contains.filter((id: string) => id === retainedId).length
  const newInParent = parent.contains.filter((id: string) => id === newId).length
  assert(oldInParent === 1 && (newInParent === 0 || newInParent === 1), 'Parent contains state drifted')
  if (newInParent === 0) parent.contains.splice(parent.contains.indexOf(retainedId) + 1, 0, newId)
  assert(parent.contains[parent.contains.indexOf(retainedId) + 1] === newId, 'New goal must directly follow retained goal in parent')
  assert(parent.contains.length === 14, 'Mechanical-waves child count must be 14 after split')

  const dependencyPlan: Record<string, { before: string[]; after: string[] }> = {
    '158e1c19-7ccb-4c8c-931c-b685951ab161': { before: [retainedId], after: [newId, retainedId] },
    '68020906-e615-462e-a56f-dd1ccc14b8d7': { before: [retainedId], after: [newId] },
    '9dba2826-b179-59f0-8d91-5916079e5abe': { before: [retainedId], after: [newId] },
  }
  for (const [goalId, plan] of Object.entries(dependencyPlan)) {
    const goal = goals.find((candidate) => candidate.id === goalId)
    assert(goal && (same(goal.requires, plan.before) || same(goal.requires, plan.after)), `${goalId}: dependency outside bounded states`)
    goal.requires = [...plan.after]
  }

  const protectedAssessment = goals.find((goal) => goal.id === assessmentId)
  assert(protectedAssessment && Array.isArray(protectedAssessment.requires)
    && Array.isArray(protectedAssessment.examData?.coveredGoalIds), 'Protected Q2 assessment missing')
  assert(protectedAssessment.requires.filter((id: string) => id === retainedId).length === 1
    && protectedAssessment.requires.includes(newId) === false, 'Protected Q2 assessment dependency was widened')
  assert(protectedAssessment.examData.coveredGoalIds.filter((id: string) => id === retainedId).length === 1
    && protectedAssessment.examData.coveredGoalIds.includes(newId) === false, 'Protected Q2 assessment coverage was widened')
  for (const goalId of ['d8a08f79-befc-5a29-9b74-6481d40c02c3', '7be8cb95-7174-5beb-94c5-c0e7bb9b1836']) {
    const assessment = goals.find((goal) => goal.id === goalId)
    assert(assessment?.requires?.includes(retainedId) && !assessment.requires.includes(newId), `${goalId}: assessment scope was widened`)
  }
  assert(goals.length === expectedCounts.canonicalAfter, 'Canonical after-count mismatch')
  return { document, retained, created: canonicalCreated }
}

function insertAfterGoalId(records: JsonRecord[], anchorId: string, record: JsonRecord, label: string): void {
  const existing = records.find((entry) => entry.goalId === record.goalId)
  if (existing) {
    assert(same(existing, record), `${label}: existing after-state record drifted`)
    return
  }
  const anchorIndex = records.findIndex((entry) => entry.goalId === anchorId)
  assert(anchorIndex >= 0, `${label}: anchor record missing`)
  records.splice(anchorIndex + 1, 0, record)
}

function buildSemanticKinds(canonical: JsonRecord, retained: JsonRecord, created: JsonRecord): JsonRecord {
  const document = readJson(paths.semanticKinds)
  const decisions = document.decisions as JsonRecord[]
  assert(Array.isArray(decisions), 'Semantic-kind decisions missing')
  const existingNew = decisions.some((entry) => entry.goalId === newId)
  assert(decisions.length === (existingNew ? expectedCounts.semanticAfter : expectedCounts.semanticBefore), 'Semantic-kind count outside exact before/after state')
  const old = decisions.find((entry) => entry.goalId === retainedId)
  assert(old?.semanticKind === 'curricularAtomic' && old.decisionStatus === 'authoritative', 'Retained semantic-kind decision drifted')
  old.sourceFingerprint = fingerprintSemanticKindSourceGoal(retained)
  for (const affectedGoalId of [
    parentId,
    '158e1c19-7ccb-4c8c-931c-b685951ab161',
    '68020906-e615-462e-a56f-dd1ccc14b8d7',
    '9dba2826-b179-59f0-8d91-5916079e5abe',
  ]) {
    const goal = (canonical.goals as JsonRecord[]).find((entry) => entry.id === affectedGoalId)
    const decision = decisions.find((entry) => entry.goalId === affectedGoalId)
    assert(goal && decision?.decisionStatus === 'authoritative', `${affectedGoalId}: semantic-kind binding missing`)
    decision.sourceFingerprint = fingerprintSemanticKindSourceGoal(goal)
  }
  const next = {
    goalId: newId,
    sourceFingerprint: fingerprintSemanticKindSourceGoal(created),
    semanticKind: 'curricularAtomic',
    decisionStatus: 'authoritative',
    decisionBasis: 'reviewed-current-pilot-curricular-atomic',
  }
  const existingNext = decisions.find((entry) => entry.goalId === newId)
  if (existingNext) {
    assert(existingNext.semanticKind === 'curricularAtomic'
      && existingNext.decisionStatus === 'authoritative'
      && [next.decisionBasis, 'reviewed-current-structural-split-curricular-atomic']
        .includes(existingNext.decisionBasis),
    'New semantic-kind decision differs from exact bounded state')
    Object.assign(existingNext, next)
  } else insertAfterGoalId(decisions, retainedId, next, 'semantic-kind')
  decisions.sort((left, right) => compareCodePoints(String(left.goalId), String(right.goalId)))
  document.counts.curricularAtomic = 462
  document.counts.total = 707
  assert(decisions.length === expectedCounts.semanticAfter, 'Semantic-kind after-count mismatch')
  return document
}

function buildAtomicity(retained: JsonRecord, created: JsonRecord): JsonRecord[] {
  const records = readJsonl(paths.atomicity)
  const existingNew = records.some((entry) => entry.goalId === newId)
  assert(records.length === (existingNew ? expectedCounts.atomicityAfter : expectedCounts.atomicityBefore), 'Atomicity count outside exact before/after state')
  const old = records.find((entry) => entry.goalId === retainedId)
  assert(old?.ruleVersion === 'semantic-atomicity-v1', 'Retained atomicity record missing')
  Object.assign(old, {
    fingerprint: reviewFingerprint(retained, 'semantic-atomicity-v1'),
    status: 'atomic',
    semanticAtomic: true,
    reviewedAt,
    reviewer,
    reason: 'Frequenz und Wellenlänge als zeitliche beziehungsweise räumliche Periodizität, die Abgrenzung der Phasengeschwindigkeit von der lokalen Schwingung und die Beziehung v = λ·f sind koordinierte Kenngrößen derselben fortschreitenden harmonischen Welle und bilden eine eigenständig prüfbare Modellkompetenz.',
    suggestedSplit: [],
  })
  const next = {
    schemaVersion: 1,
    reviewId: 'canonical-physics-full',
    ruleVersion: 'semantic-atomicity-v1',
    landscapeId,
    goalId: newId,
    fingerprint: reviewFingerprint(created, 'semantic-atomicity-v1'),
    status: 'atomic',
    semanticAtomic: true,
    reviewedAt,
    reviewer,
    reason: 'Harmonische Anregung, näherungsweise lineare Kopplung, lokale Schwingung der Medienelemente sowie die Ausbreitung von Störung und Energie bilden eine zusammenhängende kausale Erklärung der Erzeugung und Ausbreitung einer harmonischen mechanischen Welle.',
    suggestedSplit: [],
  }
  const existingNext = records.find((entry) => entry.goalId === newId)
  if (existingNext) {
    assert(existingNext.ruleVersion === 'semantic-atomicity-v1' && existingNext.status === 'atomic',
      'New atomicity decision differs from exact bounded state')
    Object.assign(existingNext, next)
  } else insertAfterGoalId(records, retainedId, next, 'atomicity')
  records.sort((left, right) => compareCodePoints(String(left.goalId), String(right.goalId)))
  assert(records.length === expectedCounts.atomicityAfter, 'Atomicity after-count mismatch')
  return records
}

function buildMemory(retained: JsonRecord, created: JsonRecord): JsonRecord[] {
  const records = readJsonl(paths.memory)
  const existingNew = records.some((entry) => entry.goalId === newId)
  assert(records.length === (existingNew ? expectedCounts.memoryAfter : expectedCounts.memoryBefore), 'Memory-review count outside exact before/after state')
  const old = records.find((entry) => entry.goalId === retainedId)
  assert(old?.ruleVersion === 'memory-card-review-v1' && old.status === 'memory_required'
    && same(old.memoryGoalIds, [memoryGoalId]) && same(old.deckIds, [memoryDeckId]), 'Retained memory trace drifted')
  Object.assign(old, {
    fingerprint: reviewFingerprint(retained, 'memory-card-review-v1'),
    memoryUseful: true,
    reviewedAt,
    reviewer,
    reason: 'Die kompakte Beziehung v = λ·f und die eindeutige Zuordnung der Kenngrößen bleiben im vorhandenen, eng begrenzten Wellen-Deck; räumliche und zeitliche Periodizitätsdeutung, die Abgrenzung der Phasengeschwindigkeit und die Begründung bleiben Verständnisleistungen.',
  })
  const next = {
    schemaVersion: 1,
    reviewId: 'canonical-physics-full',
    ruleVersion: 'memory-card-review-v1',
    landscapeId,
    goalId: newId,
    fingerprint: reviewFingerprint(created, 'memory-card-review-v1'),
    status: 'no_memory_needed',
    memoryUseful: false,
    reviewedAt,
    reviewer,
    reason: 'Die Kompetenz verlangt eine kausale Erklärung am gekoppelten Medium und die Unterscheidung lokaler Teilchenbewegung von Energie- und Störungsausbreitung; sie wird nicht durch eine zusätzliche Memorycard gesichert.',
  }
  const existingNext = records.find((entry) => entry.goalId === newId)
  if (existingNext) {
    assert(existingNext.ruleVersion === 'memory-card-review-v1'
      && existingNext.status === 'no_memory_needed'
      && existingNext.memoryUseful === false,
    'New memory-review decision differs from exact bounded state')
    Object.assign(existingNext, next)
    delete existingNext.memoryGoalIds
    delete existingNext.deckIds
  } else insertAfterGoalId(records, retainedId, next, 'memory review')
  records.sort((left, right) => compareCodePoints(String(left.goalId), String(right.goalId)))
  assert(records.length === expectedCounts.memoryAfter, 'Memory-review after-count mismatch')

  const cards = readJsonl(paths.cards)
  const retainedCards = cards.filter((record) => record.originGoalIds?.includes(retainedId))
  assert(retainedCards.length === 1 && retainedCards[0].cardId === 'physics_q2_c12'
    && retainedCards[0].status === 'kept' && retainedCards[0].necessary === true
    && retainedCards[0].deckId === memoryDeckId && same(retainedCards[0].originGoalIds, [retainedId]), 'Protected memory card drifted')
  assert(cards.every((record) => !record.originGoalIds?.includes(newId)), 'New explanatory goal must not inherit a memory card')
  return records
}

function buildProvenance(): JsonRecord {
  const document = readJson(paths.provenance)
  const landscape = (document.landscapes as JsonRecord[]).find((entry) => entry.landscapeId === landscapeId)
  assert(landscape && landscape.goalProvenance, 'Physics provenance registry missing')
  const provenance = landscape.goalProvenance as JsonRecord
  const retained = provenance[retainedId]
  assert(same(retained, {
    sourceLandscapeId: '24f2ca0f-b94a-444e-bb70-677cb6f85c02',
    sourceGoalId: '8eb24087-a99a-45de-a576-7a6a0a0510c8',
  }), 'Retained provenance drifted')
  const next = { ...retained }
  if (provenance[newId]) assert(same(provenance[newId], next), 'New provenance differs from source-supported after state')
  else provenance[newId] = next
  landscape.goalProvenance = Object.fromEntries(Object.entries(provenance).sort(([a], [b]) => a.localeCompare(b)))
  assert(Object.keys(landscape.goalProvenance).length === 458, 'Physics provenance after-count mismatch')
  return document
}

function buildVisualizationQa(retained: JsonRecord, created: JsonRecord): JsonRecord {
  const document = readJson(paths.visualizationQa)
  const records = document.records as JsonRecord[]
  const existingNew = records.some((entry) => entry.goalId === newId)
  assert(records.length === (existingNew ? expectedCounts.qaAfter : expectedCounts.qaBefore), 'Visualization-QA count outside exact before/after state')
  const old = records.find((entry) => entry.goalId === retainedId)
  assert(old?.visualizationState === 'available' && old.imageUrl.endsWith(`/${retainedId}.jpg`)
    && old.assetSha256 === `sha256:${protectedAssetSha256}`
    && old.aiApprovedAssetSha256 === `sha256:${protectedAssetSha256}`, 'Retained visualization-QA binding drifted')
  old.title = retained.title
  old.description = retained.description
  const next = {
    goalId: newId,
    title: created.title,
    description: created.description,
    subject: 'physik',
    landscapeId,
    landscapePath: paths.canonical,
    visualizationState: 'missing',
    missingReason: 'deferred_provider_limitation',
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
  const existingNext = records.find((entry) => entry.goalId === newId)
  if (existingNext) {
    assert(existingNext.visualizationState === 'missing'
      && existingNext.missingReason === 'deferred_provider_limitation'
      && existingNext.imageUrl === '',
    'New visualization-QA decision differs from exact bounded state')
    Object.assign(existingNext, next)
  } else insertAfterGoalId(records, retainedId, next, 'visualization QA')
  assert(records.length === expectedCounts.qaAfter, 'Visualization-QA after-count mismatch')
  return document
}

function updateRetainedPrompt(): string {
  let text = readFileSync(absolute(paths.retainedPrompt), 'utf8')
  assert(text.includes(`SkillPilot-ID: \`${retainedId}\``), 'Retained visualization prompt lost its ID binding')
  text = text.split(oldText.title).join(retainedText.title)
  text = text.split(oldText.description).join(retainedText.description)
  text = text.split(retainedTextBeforeFinalReview.description).join(retainedText.description)
  assert(countOccurrences(text, retainedText.title) === 3, 'Retained prompt title binding count mismatch')
  assert(countOccurrences(text, retainedText.description) === 2, 'Retained prompt description binding count mismatch')
  assert(text.includes(`Quellbild: \`${retainedId}.jpg\``) && text.includes('Provider: Google Gemini / Nano Banana Pro'), 'Retained prompt provenance drifted')
  return text
}

const newPrompt = `# Lernzielvisualisierung: ${newText.title}

## SkillPilot-Ziel

- SkillPilot-ID: \`${newId}\`
- Titel: ${newText.title}
- Beschreibung: ${newText.description}

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: deferred_provider_limitation
- Quellbild: noch nicht erzeugt
- Public Asset: nicht vorhanden

## Prompt

\`\`\`text
Bitte visualisiere das folgende Lernziel im lockeren, klaren Cartoon-Stil von Nano Banana Pro.

Rahmen:
- Zielgruppe: Gymnasium Physik; dieser Kontext soll nicht als Bildtext erscheinen.
- Erzeuge eine gut lesbare Infografik im Querformat.
- Visualisiere genau dieses eine Lernziel; keine Zusatzthemen und keine Aufgabenlösung.
- Keine Drittanbieterlogos, technischen IDs, Dateinamen, Wasserzeichen oder Produktnamen.
- Verwende nur kurze deutsche Labels und fachlich eindeutige Pfeile.

Titel: ${newText.title}
Beschreibung: ${newText.description}

Pflichtinhalt:
- Zeige links eine harmonisch bewegte Quelle, die das erste Element einer horizontal gekoppelten, näherungsweise linearen Teilchenkette anregt.
- Zeige mehrere Momentaufnahmen oder eine klare Bewegungsdarstellung, in der jedes Medienelement nur um seine Ruhelage schwingt.
- Zeige die nach rechts fortschreitende Störung und den Energietransport eindeutig, ohne einen dauerhaften Materietransport nach rechts zu behaupten.
- Kurze sichtbare Labels dürfen sein: \`harmonische Anregung\`, \`lokale Schwingung\`, \`Störung und Energie\`, \`Ausbreitungsrichtung\`.

Vermeiden:
- Keine elektromagnetische Welle, kein freier Sinusgraph ohne gekoppeltes Medium und keine Wasserteilchen, die mit der Welle mitwandern.
- Keine fachlich mehrdeutigen oder gegensinnigen Pfeile.
- Kein Ersatzbild in einem anderen Stil oder von einem anderen Provider.
\`\`\`

## Review-Notiz

Noch kein Bild erzeugen oder importieren. Die Lane bleibt ausdrücklich \`deferred_provider_limitation\`, bis ein gezielter Nano-Banana-Pro-Lauf einen Kandidaten liefert, der lokale Medienelementbewegung, fortschreitende Störung und Energietransport gleichzeitig eindeutig darstellt und separat fachlich geprüft wurde.
`

const visualizationReview = `# Physik goal visualization review – Batch 089

Review date: ${reviewedAt}

Scope: Fail-closed visual handling for the bounded Batch-031 harmonic-wave
structural split. The accepted Google Gemini / Nano Banana Pro image remains
bound to the retained characteristic-quantities goal with unchanged image
bytes. The new generation-and-propagation goal receives a provider-specific
prompt lane but no image or substitute style.

Status: \`deferred\`

| Goal ID | Goal title | Decision | Notes |
|---|---|---|---|
| \`${newId}\` | ${newText.title} | \`deferred_provider_limitation\` | Kein Ersatzbild erzeugt. Die vorbereitete Prompt-Lane bleibt ausschließlich auf Google Gemini / Nano Banana Pro gebunden; Import erst nach einem gezielten Lauf und einer separaten fachlichen Prüfung von lokaler Schwingung, Störungs- und Energieausbreitung. |

## Byte and provider boundary

- The retained image remains byte-identical in canonical, public, and backend
  storage at SHA-256 \`sha256:${protectedAssetSha256}\`.
- The retained image and memory card stay exclusively with \`${retainedId}\`.
- The new goal has no resource link and no canonical, public, or backend asset.
- No hand-authored, programmatic, OpenAI-generated, or substitute-provider
  image is introduced.
`

type SourceRoute = { before: string[]; after: string[] }

function buildReviewedMapping(path: string, routes: Record<string, SourceRoute>, beforeCount: number, afterCount: number): JsonRecord {
  const document = readJson(path)
  const mappings = document.mappings as JsonRecord[]
  const decisions = document.decisions as JsonRecord[]
  assert(Array.isArray(mappings) && Array.isArray(decisions), `${path}: reviewed mapping shape drifted`)
  const afterAlready = mappings.some((entry) => entry.canonicalGoalId === newId)
  assert(mappings.length === (afterAlready ? afterCount : beforeCount), `${path}: mapping count outside exact before/after state`)
  for (const [sourceGoalId, route] of Object.entries(routes)) {
    const decision = decisions.find((entry) => entry.sourceGoalId === sourceGoalId)
    assert(decision && (same(decision.canonicalGoalIds, route.before) || same(decision.canonicalGoalIds, route.after)), `${path}:${sourceGoalId}: decision targets outside bounded states`)
    decision.canonicalGoalIds = [...route.after]
    const sourceMappings = mappings.filter((entry) => entry.legacyGoalId === sourceGoalId)
    const currentTargets = sourceMappings.map((entry) => entry.canonicalGoalId)
    assert(same(currentTargets, route.before) || same(currentTargets, route.after), `${path}:${sourceGoalId}: mapping targets outside bounded states`)
    if (!same(currentTargets, route.after)) {
      const firstIndex = mappings.findIndex((entry) => entry.legacyGoalId === sourceGoalId)
      mappings.splice(firstIndex, sourceMappings.length, ...route.after.map((canonicalGoalId) => ({
        legacyGoalId: sourceGoalId,
        canonicalGoalId,
        matchType: route.after.length === 1 ? 'exact' : 'partial',
        reviewDecisionId: sourceGoalId,
      })))
    }
  }
  assert(mappings.length === afterCount, `${path}: mapping after-count mismatch`)
  return document
}

function buildHeLegacy(): JsonRecord {
  const document = readJson(paths.heLegacy)
  const mappings = document.mappings as JsonRecord[]
  const sourceId = '8eb24087-a99a-45de-a576-7a6a0a0510c8'
  const hasNew = mappings.some((entry) => entry.legacyGoalId === sourceId && entry.canonicalGoalId === newId)
  assert(mappings.length === (hasNew ? expectedCounts.heLegacyMappingsAfter : expectedCounts.heLegacyMappingsBefore), 'HE legacy mapping count outside bounded states')
  const oldIndex = mappings.findIndex((entry) => entry.legacyGoalId === sourceId && entry.canonicalGoalId === retainedId)
  assert(oldIndex >= 0, 'HE legacy retained mapping missing')
  assert(['exact', 'partial'].includes(mappings[oldIndex].matchType), 'HE legacy retained match type drifted')
  mappings[oldIndex].matchType = 'partial'
  if (!hasNew) mappings.splice(oldIndex + 1, 0, { legacyGoalId: sourceId, canonicalGoalId: newId, matchType: 'partial' })
  assert(mappings.length === expectedCounts.heLegacyMappingsAfter, 'HE legacy mapping after-count mismatch')
  return document
}

function buildByLegacy(): JsonRecord {
  const document = readJson(paths.byLegacy)
  const mappings = document.mappings as JsonRecord[]
  assert(mappings.length === expectedCounts.byLegacyMappingsBefore, 'BY legacy mapping count drifted')
  const sourceId = 'e71fd490-de7e-557a-b364-fd06b0fcd769'
  const candidates = mappings.filter((entry) => entry.legacyGoalId === sourceId && [retainedId, newId].includes(entry.canonicalGoalId))
  assert(candidates.length === 1, 'BY legacy split mapping outside bounded states')
  candidates[0].canonicalGoalId = newId
  candidates[0].matchType = 'partial'
  assert(mappings.length === expectedCounts.byLegacyMappingsAfter, 'BY legacy mapping after-count mismatch')
  return document
}

function buildByView(path: string, expectedTargetOccurrences: number, expectedPrerequisiteOccurrences: number): JsonRecord {
  const document = readJson(path)
  const countRoles = (value: unknown, goalId: string): { target: number; prerequisite: number } => {
    let target = 0
    let prerequisite = 0
    const visit = (entry: unknown): void => {
      if (Array.isArray(entry)) entry.forEach(visit)
      else if (entry && typeof entry === 'object') {
        const record = entry as JsonRecord
        if (record.kind === 'goalEntry' && record.goalId === goalId) {
          if (record.projectionRole === 'prerequisiteOnly') prerequisite += 1
          else target += 1
        }
        Object.values(record).forEach(visit)
      }
    }
    visit(value)
    return { target, prerequisite }
  }
  const oldRoles = countRoles(document, retainedId)
  const newRoles = countRoles(document, newId)
  assert(
    (oldRoles.target === expectedTargetOccurrences
      && oldRoles.prerequisite === expectedPrerequisiteOccurrences
      && newRoles.target === 0
      && newRoles.prerequisite === 0)
    || (oldRoles.target === 0
      && oldRoles.prerequisite === expectedPrerequisiteOccurrences
      && newRoles.target === expectedTargetOccurrences
      && newRoles.prerequisite === 0),
    `${path}: view outside bounded before/after states`,
  )
  const rewrite = (value: unknown): void => {
    if (Array.isArray(value)) value.forEach(rewrite)
    else if (value && typeof value === 'object') {
      const record = value as JsonRecord
      if (record.kind === 'goalEntry' && record.goalId === retainedId && record.projectionRole !== 'prerequisiteOnly') {
        record.goalId = newId
      }
      Object.values(record).forEach(rewrite)
    }
  }
  rewrite(document)
  const finalOldRoles = countRoles(document, retainedId)
  const finalNewRoles = countRoles(document, newId)
  assert(
    finalOldRoles.target === 0
      && finalOldRoles.prerequisite === expectedPrerequisiteOccurrences
      && finalNewRoles.target === expectedTargetOccurrences
      && finalNewRoles.prerequisite === 0,
    `${path}: view after-state mismatch`,
  )
  return document
}

function buildAtlas(): JsonRecord {
  const document = readJson(paths.atlas)
  const oldCount = countGoalReferences(document, retainedId)
  const newCount = countGoalReferences(document, newId)
  assert(oldCount === 1 && (newCount === 0 || newCount === 1), 'National atlas outside bounded states')
  const visit = (value: unknown): boolean => {
    if (!Array.isArray(value)) {
      if (value && typeof value === 'object') return Object.values(value as JsonRecord).some(visit)
      return false
    }
    const index = value.findIndex((entry) => entry?.kind === 'goalEntry' && entry.goalId === retainedId)
    if (index >= 0) {
      const existingIndex = value.findIndex((entry) => entry?.kind === 'goalEntry' && entry.goalId === newId)
      if (existingIndex < 0) value.splice(index + 1, 0, { kind: 'goalEntry', goalId: newId })
      else assert(existingIndex === index + 1, 'National atlas new goal is not adjacent to retained goal')
      return true
    }
    return value.some(visit)
  }
  assert(visit(document), 'National atlas retained entry missing')
  assert(countGoalReferences(document, retainedId) === 1 && countGoalReferences(document, newId) === 1, 'National atlas after-state mismatch')
  return document
}

function buildAtlasSources(): JsonRecord {
  const document = readJson(paths.atlasSources)
  assert(document.expectedCurricularAtomicGoalCount === 461 || document.expectedCurricularAtomicGoalCount === 462,
    'National atlas expected curricular-atomic count outside bounded states')
  document.expectedCurricularAtomicGoalCount = 462
  return document
}

function buildGenerators(): Map<string, string> {
  const outputs = new Map<string, string>()
  const heBefore = `  'Q2.3:2': ['${retainedId}'],`
  const heAfter = `  'Q2.3:2': ['${newId}'],`
  outputs.set(paths.heGenerator, replaceExactly(readFileSync(absolute(paths.heGenerator), 'utf8'), heBefore, heAfter, 'HE generator Q2.3:2'))

  const byBefore = `  'e71fd490-de7e-557a-b364-fd06b0fcd769': [\n    '68020906-e615-462e-a56f-dd1ccc14b8d7',\n    '${retainedId}',\n  ],`
  const byAfter = `  'e71fd490-de7e-557a-b364-fd06b0fcd769': [\n    '68020906-e615-462e-a56f-dd1ccc14b8d7',\n    '${newId}',\n  ],`
  outputs.set(paths.byGenerator, replaceExactly(readFileSync(absolute(paths.byGenerator), 'utf8'), byBefore, byAfter, 'BY generator propagation source'))

  let sl = readFileSync(absolute(paths.slGenerator), 'utf8')
  sl = replaceExactly(sl,
    `  waveBasics: '${retainedId}',\n  wavePhenomena:`,
    `  waveBasics: '${retainedId}',\n  harmonicMechanicalWaveGeneration: '${newId}',\n  wavePhenomena:`,
    'SL generator target constant')
  sl = replaceExactly(sl,
    `  'sl-phys-seki-sl-ph-seki-8-nw-2024-p33-008-f8abcc56': [target.expansion],\n}`,
    `  'sl-phys-seki-sl-ph-seki-8-nw-2024-p33-008-f8abcc56': [target.expansion],\n  'sl-phys-sekii-sl-ph-sekii-gk-2023-p33-017-1e54b115': [target.harmonicMechanicalWaveGeneration],\n  'sl-phys-sekii-sl-ph-sekii-lk-2023-p42-012-62d89aaf': [target.harmonicMechanicalWaveGeneration],\n}`,
    'SL generator source-supported split routes')
  outputs.set(paths.slGenerator, sl)
  return outputs
}

assert(deterministicGoalId(newText.shortKey) === newId, 'Deterministic new goal ID mismatch')
assertProtectedAsset()

const canonical = buildCanonical()
const semanticKinds = buildSemanticKinds(canonical.document, canonical.retained, canonical.created)
const atomicity = buildAtomicity(canonical.retained, canonical.created)
const memory = buildMemory(canonical.retained, canonical.created)
const provenance = buildProvenance()
const visualizationQa = buildVisualizationQa(canonical.retained, canonical.created)

const heReview = buildReviewedMapping(paths.heReview, {
  'he-phys-sekii-q2-3-b02-a01-7223ff26': { before: [retainedId], after: [newId] },
}, expectedCounts.heReviewMappingsBefore, expectedCounts.heReviewMappingsAfter)
const byReview = buildReviewedMapping(paths.byReview, {
  'e71fd490-de7e-557a-b364-fd06b0fcd769': {
    before: ['68020906-e615-462e-a56f-dd1ccc14b8d7', retainedId],
    after: ['68020906-e615-462e-a56f-dd1ccc14b8d7', newId],
  },
}, expectedCounts.byReviewMappingsBefore, expectedCounts.byReviewMappingsAfter)

const sl = readJson(paths.slReview)
const slRoutes: Record<string, SourceRoute> = {}
for (const sourceGoalId of [
  'sl-phys-sekii-sl-ph-sekii-gk-2023-p33-017-1e54b115',
  'sl-phys-sekii-sl-ph-sekii-lk-2023-p42-012-62d89aaf',
]) {
  const decision = (sl.decisions as JsonRecord[]).find((entry) => entry.sourceGoalId === sourceGoalId)
  assert(decision && decision.canonicalGoalIds.filter((id: string) => id === retainedId).length === 1, `${sourceGoalId}: retained SL route missing`)
  const before = (decision.canonicalGoalIds as string[]).filter((id) => id !== newId)
  const retainedIndex = before.indexOf(retainedId)
  const after = [...before.slice(0, retainedIndex + 1), newId, ...before.slice(retainedIndex + 1)]
  slRoutes[sourceGoalId] = { before, after }
}
const slReview = buildReviewedMapping(paths.slReview, slRoutes, expectedCounts.slReviewMappingsBefore, expectedCounts.slReviewMappingsAfter)

const outputs = new Map<string, string>([
  [paths.canonical, serializeJson(canonical.document)],
  [paths.semanticKinds, serializeJson(semanticKinds)],
  [paths.atomicity, serializeJsonl(atomicity)],
  [paths.memory, serializeJsonl(memory)],
  [paths.provenance, serializeJson(provenance)],
  [paths.visualizationQa, serializeJson(visualizationQa)],
  [paths.retainedPrompt, updateRetainedPrompt()],
  [paths.newPrompt, newPrompt],
  [paths.visualizationReview, visualizationReview],
  [paths.heReview, serializeJson(heReview)],
  [paths.heLegacy, serializeJson(buildHeLegacy())],
  [paths.byReview, serializeJson(byReview)],
  [paths.byLegacy, serializeJson(buildByLegacy())],
  [paths.slReview, serializeJson(slReview)],
  [byViewPaths[0], serializeJson(buildByView(byViewPaths[0], 1, 1))],
  [byViewPaths[1], serializeJson(buildByView(byViewPaths[1], 1, 1))],
  [byViewPaths[2], serializeJson(buildByView(byViewPaths[2], 1, 0))],
  [byViewPaths[3], serializeJson(buildByView(byViewPaths[3], 1, 0))],
  [paths.atlas, serializeJson(buildAtlas())],
  [paths.atlasSources, serializeJson(buildAtlasSources())],
  ...buildGenerators(),
])

assert(outputs.size === expectedCounts.directOutputs, `Direct output boundary drifted: ${outputs.size}`)
const changed = [...outputs].filter(([path, bytes]) => !existsSync(absolute(path)) || readFileSync(absolute(path), 'utf8') !== bytes)
const plannedCorpusSha256 = sha256(stableJson([...outputs].map(([path, bytes]) => ({ path, sha256: sha256(bytes) }))))
assert(plannedCorpusSha256 === expectedPlannedCorpusSha256,
  `Planned corpus drifted: ${plannedCorpusSha256} != ${expectedPlannedCorpusSha256}`)

if (writeMode) {
  for (const [path, bytes] of changed) {
    mkdirSync(dirname(absolute(path)), { recursive: true })
    writeFileSync(absolute(path), bytes)
  }
  assertProtectedAsset()
}

console.log(
  `CHECK apply_physics_batch031_harmonic_wave_split ${writeMode ? 'WRITE' : changed.length === 0 ? 'PASS' : 'PLAN'} `
  + `retained=1 newAtoms=1 canonicalGoals=707 sourceRoutes=4 mappingDelta=3 views=5 `
  + `assessmentsExpanded=0 memoryCardsMoved=0 directFiles=${outputs.size} plannedWrites=${changed.length}`,
)
console.log(`PLANNED_CORPUS_SHA256 ${plannedCorpusSha256}`)
console.log(`PLANNED_PATHS ${changed.map(([path]) => path).join(',') || '-'}`)
