import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel'

type JsonRecord = Record<string, unknown>

const repoRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')

const paths = {
  canonical: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json',
  semanticKinds: 'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json',
  atomicity: 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-physics-full.review.jsonl',
  memory: 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-physics-full.review.jsonl',
  visualizationQa: 'curricula/DE/Gymnasium/quality/goal-visualization-qa/physik.qa.json',
} as const

const reviewedBatchDirectory =
  'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-08-26/batch-005-colors-4-current-v1'

const reviewRecordPaths = [
  `${reviewedBatchDirectory}/round-a/results/physik-rollout-v1-batch-005-colors-4-current-v1-20260826-first-pass-a.batch-001.records.jsonl`,
  `${reviewedBatchDirectory}/round-b/results/physik-rollout-v1-batch-005-colors-4-current-v1-20260826-first-pass-b.batch-001.records.jsonl`,
] as const

const revisions = [
  {
    id: 'a4681378-ade4-4f20-bf77-fb020469510f',
    previousDescription:
      'Die lernende Person kann Farbzerlegung mit Prisma oder Farbkreis erklären und Weiß als zusammengesetzte Farbe deuten.',
    description:
      'Die lernende Person kann erklären, wie ein Prisma weißes Licht in Spektralfarben zerlegt und wie ein schnell rotierender Farbkreis Weiß als zusammengesetzten Farbeindruck veranschaulicht.',
    previousDescriptionEn:
      'The learner can explain color decomposition using a prism or color wheel and interpret white as a composite color.',
    descriptionEn:
      'The learner can explain how a prism separates white light into spectral colors and how a rapidly rotating color wheel illustrates white as a composite color impression.',
    atomicityReason:
      'Prisma und schnell rotierender Farbkreis sind im autoritativen Themenzusammenhang zwei komplementäre Darstellungen derselben abgegrenzten Kompetenz: Die lernende Person erklärt ihre unterschiedlichen Rollen für Spektralzerlegung beziehungsweise zusammengesetzten weißen Farbeindruck, statt sie fachlich gleichzusetzen.',
    memoryReason:
      'Die Kompetenz verlangt, zwei physikalisch unterschiedliche Vorgänge zu erklären und auf neue Darstellungen zu übertragen; isoliertes Faktenlernen ersetzt diese begriffliche Unterscheidung nicht.',
    promptPath:
      'curricula/DE/Gymnasium/visualizations/physik/a4681378-ade4-4f20-bf77-fb020469510f/prompt.de.md',
    asset: {
      url: '/assets/goal-visualizations/physik/a4681378-ade4-4f20-bf77-fb020469510f/a4681378-ade4-4f20-bf77-fb020469510f-v2.png',
      canonicalPath:
        'curricula/DE/Gymnasium/visualizations/physik/a4681378-ade4-4f20-bf77-fb020469510f/a4681378-ade4-4f20-bf77-fb020469510f-v2.png',
      publicPath:
        'app/public/assets/goal-visualizations/physik/a4681378-ade4-4f20-bf77-fb020469510f/a4681378-ade4-4f20-bf77-fb020469510f-v2.png',
      sha256: 'sha256:92fa897740a8303aec87e5f3163931e3f2883db166cfc7ba83282e462ce0101e',
      provider: 'OpenAI ImageGen (built-in)',
    },
  },
  {
    id: '1c8dd14c-0fbf-44a5-85a3-25c8e3bd0075',
    previousDescription:
      'Die lernende Person kann Alltagserfahrungen zur Farbwahrnehmung fachlich beschreiben.',
    description:
      'Die lernende Person kann Alltagserfahrungen zur Farbwahrnehmung anhand des Zusammenspiels von Beleuchtung, Oberfläche und Auge fachlich beschreiben.',
    previousDescriptionEn:
      'The learner can appropriately describe everyday experiences of color perception.',
    descriptionEn:
      'The learner can describe everyday experiences of color perception in terms of the interaction among illumination, surface, and eye.',
    atomicityReason:
      'Beleuchtung, Wechselwirkung an der Oberfläche und das zum Auge gelangende Licht sind kausal zusammengehörige Bestandteile einer einzigen, klar abgegrenzten Erklärung des Farbeindrucks.',
    memoryReason:
      'Farbwahrnehmung muss für wechselnde Beleuchtungen und Oberflächen aus dem Lichtweg erklärt werden; eine feste Merkkarte bildet diese Transferleistung nicht angemessen ab.',
    promptPath:
      'curricula/DE/Gymnasium/visualizations/physik/1c8dd14c-0fbf-44a5-85a3-25c8e3bd0075/prompt.de.md',
  },
] as const

const keeps = [
  {
    id: 'cdab9fd1-5054-4a7e-8c9a-4474062ddd23',
    description:
      'Die lernende Person kann additive und subtraktive Farbmischung unterscheiden und an einfachen Beispielen anwenden.',
    descriptionEn:
      'The learner can distinguish additive and subtractive color mixing and apply them to simple examples.',
  },
  {
    id: 'cc9eea77-2a7f-4f35-ac22-6c230c0d6fa5',
    description:
      'Die lernende Person kann technische Anwendungen wie Farbdruck oder Bildschirmfarben fachlich erklären.',
    descriptionEn:
      'The learner can appropriately explain technical applications such as color printing or screen colors.',
  },
] as const

const readJson = (path: string): JsonRecord =>
  JSON.parse(readFileSync(resolve(repoRoot, path), 'utf8')) as JsonRecord

const writeJson = (path: string, value: unknown): void => {
  writeFileSync(resolve(repoRoot, path), `${JSON.stringify(value, null, 2)}\n`)
}

const readJsonl = (path: string): JsonRecord[] =>
  readFileSync(resolve(repoRoot, path), 'utf8')
    .split(/\r?\n/u)
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line) as JsonRecord)

const writeJsonl = (path: string, records: JsonRecord[]): void => {
  writeFileSync(resolve(repoRoot, path), `${records.map((record) => JSON.stringify(record)).join('\n')}\n`)
}

const reviewRounds = reviewRecordPaths.map((path) => {
  const records = readJsonl(path)
  return new Map(records.map((record) => [record.goalId, record]))
})

for (const revision of revisions) {
  reviewRounds.forEach((round, roundIndex) => {
    const record = round.get(revision.id)
    if (
      !record
      || record.decision !== 'revise'
      || record.currentDescriptionDe !== revision.previousDescription
      || record.currentDescriptionEn !== revision.previousDescriptionEn
    ) {
      throw new Error(`${revision.id}: reviewed REVISE input drift in round ${roundIndex + 1}`)
    }
    if (
      roundIndex === 1
      && (
        record.proposedDescriptionDe !== revision.description
        || record.proposedDescriptionEn !== revision.descriptionEn
      )
    ) {
      throw new Error(`${revision.id}: selected round-B revision drifted`)
    }
  })
}

for (const keep of keeps) {
  reviewRounds.forEach((round, roundIndex) => {
    const record = round.get(keep.id)
    if (
      !record
      || record.decision !== 'keep'
      || record.currentDescriptionDe !== keep.description
      || record.currentDescriptionEn !== keep.descriptionEn
    ) {
      throw new Error(`${keep.id}: reviewed KEEP input drift in round ${roundIndex + 1}`)
    }
  })
}

const normalizeText = (value: unknown): string =>
  String(value ?? '')
    .normalize('NFKC')
    .replace(/\s+/gu, ' ')
    .trim()

const stableJson = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as JsonRecord)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nested]) => `${JSON.stringify(key)}:${stableJson(nested)}`)
      .join(',')}}`
  }
  return JSON.stringify(value)
}

const fingerprintReviewGoal = (goal: JsonRecord, ruleVersion: string): string => {
  const payload = stableJson({
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
  })
  return `sha256:${createHash('sha256').update(payload).digest('hex')}`
}

const requireCurrentOrPreviousPair = (
  actualDe: unknown,
  actualEn: unknown,
  previousDe: string,
  previousEn: string,
  currentDe: string,
  currentEn: string,
  label: string,
): void => {
  const isPrevious = actualDe === previousDe && actualEn === previousEn
  const isCurrent = actualDe === currentDe && actualEn === currentEn
  if (!isPrevious && !isCurrent) {
    throw new Error(`${label} drifted or contains a mixed DE/EN revision state`)
  }
}

const canonical = readJson(paths.canonical)
const goals = canonical.goals as JsonRecord[]
const goalById = new Map(goals.map((goal) => [goal.id, goal]))

for (const revision of revisions) {
  const goal = goalById.get(revision.id)
  if (!goal) throw new Error(`Missing Physics color goal ${revision.id}`)
  requireCurrentOrPreviousPair(
    goal.description,
    goal.descriptionEn,
    revision.previousDescription,
    revision.previousDescriptionEn,
    revision.description,
    revision.descriptionEn,
    `${revision.id} bilingual description`,
  )
  goal.description = revision.description
  goal.descriptionEn = revision.descriptionEn
  for (const link of goal.resourceLinks ?? []) {
    if (link?.type !== 'goal-visualization') continue
    link.altText = `Didaktische Visualisierung zum Lernziel "${goal.title}". ${goal.description}`
    if ('asset' in revision) {
      link.url = revision.asset.url
      link.provider = revision.asset.provider
    }
  }
}

const semanticKinds = readJson(paths.semanticKinds)
const semanticDecisionById = new Map(
  (semanticKinds.decisions as JsonRecord[]).map((decision) => [decision.goalId, decision]),
)
for (const revision of revisions) {
  const goal = goalById.get(revision.id)!
  const decision = semanticDecisionById.get(revision.id)
  if (!decision || decision.semanticKind !== 'curricularAtomic') {
    throw new Error(`Missing authoritative curricularAtomic semantic-kind decision ${revision.id}`)
  }
  Object.assign(decision, {
    sourceFingerprint: fingerprintSemanticKindSourceGoal(goal),
    decisionStatus: 'authoritative',
    decisionBasis: 'reviewed-current-pilot-curricular-atomic',
  })
}
if (semanticKinds.counts?.curricularAtomic !== 438) {
  throw new Error(`Expected 438 curricularAtomic Physics decisions, got ${semanticKinds.counts?.curricularAtomic}`)
}

const atomicity = readJsonl(paths.atomicity)
const atomicityById = new Map(atomicity.map((record) => [record.goalId, record]))
const memory = readJsonl(paths.memory)
const memoryById = new Map(memory.map((record) => [record.goalId, record]))

for (const revision of revisions) {
  const goal = goalById.get(revision.id)!
  const atomicityRecord = atomicityById.get(revision.id)
  if (!atomicityRecord) throw new Error(`Missing atomicity record ${revision.id}`)
  Object.assign(atomicityRecord, {
    fingerprint: fingerprintReviewGoal(goal, 'semantic-atomicity-v1'),
    status: 'atomic',
    semanticAtomic: true,
    reviewedAt: '2026-08-26',
    reviewer: 'codex-ai-synthesis-2026-08-26',
    reason: revision.atomicityReason,
    suggestedSplit: [],
  })

  const memoryRecord = memoryById.get(revision.id)
  if (!memoryRecord) throw new Error(`Missing memory-review record ${revision.id}`)
  Object.assign(memoryRecord, {
    fingerprint: fingerprintReviewGoal(goal, 'memory-card-review-v1'),
    status: 'no_memory_needed',
    memoryUseful: false,
    reviewedAt: '2026-08-26',
    reviewer: 'codex-ai-synthesis-2026-08-26',
    reason: revision.memoryReason,
  })
  delete memoryRecord.memoryGoalIds
  delete memoryRecord.deckIds
}

const visualizationQa = readJson(paths.visualizationQa)
const visualizationQaById = new Map(
  (visualizationQa.records as JsonRecord[]).map((record) => [record.goalId, record]),
)
for (const revision of revisions) {
  const goal = goalById.get(revision.id)!
  const record = visualizationQaById.get(revision.id)
  if (!record) throw new Error(`Missing visualization QA record ${revision.id}`)
  if (record.description !== revision.previousDescription && record.description !== revision.description) {
    throw new Error(`${revision.id} visualization QA description drifted`)
  }
  record.title = goal.title
  record.description = goal.description
  if ('asset' in revision) {
    record.imageUrl = revision.asset.url
    record.publicAssetPath = revision.asset.publicPath
    record.canonicalAssetPath = revision.asset.canonicalPath
  }
  const canonicalAssetBytes = readFileSync(resolve(repoRoot, record.canonicalAssetPath))
  const publicAssetBytes = readFileSync(resolve(repoRoot, record.publicAssetPath))
  const assetSha256 = `sha256:${createHash('sha256').update(canonicalAssetBytes).digest('hex')}`
  if (!canonicalAssetBytes.equals(publicAssetBytes)) {
    throw new Error(`${revision.id}: canonical and public visualization bytes differ`)
  }
  if ('asset' in revision && assetSha256 !== revision.asset.sha256) {
    throw new Error(`${revision.id}: generated visualization digest drifted`)
  }
  Object.assign(record, {
    assetSha256,
    umlautsCorrectChatGpt: 'yes',
    contentApprovedChatGpt: 'yes',
    chatGptReviewedAt: '2026-08-26T10:45:00.000Z',
    chatGptReviewer: 'codex-physics-colors-current-original-review-2026-08-26',
    chatGptNotes: revision.id === 'a4681378-ade4-4f20-bf77-fb020469510f'
      ? 'Fresh original-resolution review: Die Zweiteilung trennt Prismendispersion und schnell rotierenden Farbkreis ausdrücklich als verschiedene Vorgänge. Die Spektralfarben sind in korrekter Reihenfolge angeordnet; der Farbkreis führt nur zu einem annähernd weißen Farbeindruck und zerlegt kein Licht. Text und Umlaute sind korrekt.'
      : 'Fresh current-description alignment review at original resolution: Dasselbe rote Apfelobjekt wird unter weißer und grüner Beleuchtung gezeigt. Die Darstellung trennt Lichtquelle, Oberfläche und zum Auge gelangendes Licht korrekt; das Auge sendet keine Strahlen aus. Text und Umlaute sind korrekt.',
    aiApproved: 'yes',
    aiApprovedAssetSha256: assetSha256,
    aiReviewedAt: '2026-08-26T10:45:00.000Z',
    aiReviewer: 'codex-physics-colors-current-original-review-2026-08-26',
    aiNotes: revision.id === 'a4681378-ade4-4f20-bf77-fb020469510f'
      ? 'Fresh original-resolution review: Prisma und Farbkreis werden fachlich korrekt getrennt; Spektralreihenfolge, schnelle Rotation, Auge und annähernd weißer Farbeindruck stimmen mit der aktuellen Beschreibung überein.'
      : 'Fresh original-resolution review: Die Apfeldarstellung bindet Beleuchtung, Oberfläche und Auge fachlich korrekt an die aktuelle Beschreibung und ersetzt die unzutreffende historische Spektrum-/Zapfen-Notiz als aktueller hashgebundener Reviewstand.',
  })
}

const promptOutputs = new Map<string, string>()
for (const revision of revisions) {
  const absolutePath = resolve(repoRoot, revision.promptPath)
  let prompt = readFileSync(absolutePath, 'utf8')
  if (prompt.includes(revision.previousDescription)) {
    prompt = prompt.split(revision.previousDescription).join(revision.description)
  }
  if (!prompt.includes(revision.description) || prompt.includes(revision.previousDescription)) {
    throw new Error(`Could not bind current description in ${revision.promptPath}`)
  }
  promptOutputs.set(revision.promptPath, prompt)
}

if (writeMode) {
  writeJson(paths.canonical, canonical)
  writeJson(paths.semanticKinds, semanticKinds)
  writeJsonl(paths.atomicity, atomicity)
  writeJsonl(paths.memory, memory)
  writeJson(paths.visualizationQa, visualizationQa)
  for (const [path, prompt] of promptOutputs) {
    writeFileSync(resolve(repoRoot, path), prompt)
  }
}

console.log(
  `CHECK apply_physics_colors_batch005_adjudication ${writeMode ? 'WRITE' : 'PASS'} revisions=2 keeps=2 curricularAtomic=438`,
)
