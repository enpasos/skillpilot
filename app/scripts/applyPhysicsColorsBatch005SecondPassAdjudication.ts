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
  'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-08-26/batch-005-colors-4-current-v2'

const reviewRecordPaths = {
  first: `${reviewedBatchDirectory}/round-a/results/physik-rollout-v1-batch-005-colors-4-current-v2-20260826-first-pass-a.batch-001.records.jsonl`,
  second: `${reviewedBatchDirectory}/round-b/results/physik-rollout-v1-batch-005-colors-4-current-v2-20260826-first-pass-b.batch-001.records.jsonl`,
} as const

const revisions = [
  {
    id: 'a4681378-ade4-4f20-bf77-fb020469510f',
    previousDescription:
      'Die lernende Person kann erklären, wie ein Prisma weißes Licht in Spektralfarben zerlegt und wie ein schnell rotierender Farbkreis Weiß als zusammengesetzten Farbeindruck veranschaulicht.',
    description:
      'Die lernende Person kann den Unterschied zwischen der räumlichen Aufspaltung weißen Lichts in Spektralfarben durch unterschiedlich starke Brechung im Prisma und der zeitlichen Integration rasch wechselnder Farbeindrücke zu einem annähernd weißen Gesamteindruck bei einem schnell rotierenden Farbkreis erklären.',
    previousDescriptionEn:
      'The learner can explain how a prism separates white light into spectral colors and how a rapidly rotating color wheel illustrates white as a composite color impression.',
    descriptionEn:
      'The learner can explain the difference between the spatial separation of white light into spectral colors through different degrees of refraction in a prism and the temporal integration of rapidly changing color impressions into an approximately white overall impression with a rapidly rotating color wheel.',
    expectedDecisions: ['revise', 'split_review'],
    atomicityReason:
      'Der autoritative HE-Inhaltsblock „Entstehung von Farben: Prisma, Farbkreis, Weiß als zusammengesetzte Farbe“ bindet beide Beobachtungen ausdrücklich zu einer Kompetenz. Die aktuelle Fassung macht die zwei Mechanismen trennscharf und prüft ihre begründete Gegenüberstellung als ein integriertes Verständnisziel; ein struktureller Split würde die belegte curriculare Einheit ohne zusätzlichen fachlichen Nutzen duplizieren.',
    memoryReason:
      'Die Kompetenz verlangt die begründete Gegenüberstellung von wellenlängenabhängiger räumlicher Trennung und zeitlicher Wahrnehmungsintegration; diese Transferleistung lässt sich nicht durch isolierte Merksätze ersetzen.',
    promptPath:
      'curricula/DE/Gymnasium/visualizations/physik/a4681378-ade4-4f20-bf77-fb020469510f/prompt.de.md',
    assetSha256: 'sha256:92fa897740a8303aec87e5f3163931e3f2883db166cfc7ba83282e462ce0101e',
    visualizationNote:
      'Frische Originalprüfung gegen den präzisierten Wortlaut: Das aktive Zweifeld-Asset trennt Prismendispersion und schnell rotierenden Farbkreis ausdrücklich. Die Spektralreihenfolge, die schnelle Rotation, das empfangende Auge und der annähernd weiße Farbeindruck stimmen; das Bild behauptet weder Farberzeugung im Prisma noch Lichtzerlegung am Farbkreis.',
  },
  {
    id: 'cdab9fd1-5054-4a7e-8c9a-4474062ddd23',
    previousDescription:
      'Die lernende Person kann additive und subtraktive Farbmischung unterscheiden und an einfachen Beispielen anwenden.',
    description:
      'Die lernende Person kann additive Farbmischung durch Überlagerung von Licht und subtraktive Farbmischung durch selektive Absorption von Licht unterscheiden und beide an einfachen Beispielen anwenden.',
    previousDescriptionEn:
      'The learner can distinguish additive and subtractive color mixing and apply them to simple examples.',
    descriptionEn:
      'The learner can distinguish additive color mixing through the superposition of light from subtractive color mixing through selective light absorption and apply both to simple examples.',
    expectedDecisions: ['revise', 'revise'],
    atomicityReason:
      'Additive und subtraktive Farbmischung bilden hier eine einzige explizite Vergleichskompetenz: Die lernende Person unterscheidet beide Verfahren anhand ihrer gegensätzlichen Wirkung auf Licht und wendet genau diese Unterscheidung an.',
    memoryReason:
      'Die Auswahl und Begründung der passenden Mischungsart in veränderten Licht-, Filter- und Farbstofffällen ist eine Verständnis- und Transferleistung, keine reine Abrufaufgabe.',
    promptPath:
      'curricula/DE/Gymnasium/visualizations/physik/cdab9fd1-5054-4a7e-8c9a-4474062ddd23/prompt.de.md',
    assetSha256: 'sha256:b73707fb44b3a0d20d3e371b111f8f58e3c0e2d5ac6bf34e0301df3642032ab7',
    visualizationNote:
      'Frische Originalprüfung gegen den präzisierten Wortlaut: Das Asset stellt additive Mischung ausdrücklich als Licht auf dunklem Grund und subtraktive Mischung als Filter/Farbe dar. Die korrekten RGB- und CMY-Kombinationen sowie „mehr Licht → heller“ und „mehr Filter/Farbe → dunkler“ unterstützen die Unterscheidung von Überlagerung und selektiver Lichtentnahme ohne fachlichen Widerspruch.',
  },
  {
    id: 'cc9eea77-2a7f-4f35-ac22-6c230c0d6fa5',
    previousDescription:
      'Die lernende Person kann technische Anwendungen wie Farbdruck oder Bildschirmfarben fachlich erklären.',
    description:
      'Die lernende Person kann fachlich erklären, wie Farben auf Bildschirmen durch additive und im Farbdruck durch subtraktive Farbmischung entstehen.',
    previousDescriptionEn:
      'The learner can appropriately explain technical applications such as color printing or screen colors.',
    descriptionEn:
      'The learner can explain in scientific terms how colors on screens arise through additive color mixing and colors in printing through subtractive color mixing.',
    expectedDecisions: ['revise', 'revise'],
    atomicityReason:
      'Bildschirm und Farbdruck sind die zwei ausdrücklich genannten Kontrastfälle einer einzigen technischen Zuordnungskompetenz; geprüft wird das passende additive beziehungsweise subtraktive Wirkprinzip, nicht zwei unabhängige technische Fertigkeiten.',
    memoryReason:
      'Die technische Erklärung muss den Lichtweg und das passende Mischungsprinzip auf neue Anzeige- und Druckfälle übertragen; eine bloße RGB-/CMY-Merkkarte genügt dafür nicht.',
    promptPath:
      'curricula/DE/Gymnasium/visualizations/physik/cc9eea77-2a7f-4f35-ac22-6c230c0d6fa5/prompt.de.md',
    assetSha256: 'sha256:d22542d622babce52a45a5b27886675a91b336d96396e4c4b2e5e66120f346e5',
    visualizationNote:
      'Frische Originalprüfung gegen den präzisierten Wortlaut: Das Asset ordnet Bildschirmfarben ausdrücklich der additiven RGB-Mischung und Farbdruck der subtraktiven CMY(K)-Mischung zu. Licht-/Helligkeits- und Farbe-/Dunkelheitskontrast, Beschriftungen und Umlaute sind korrekt.',
  },
] as const

const keep = {
  id: '1c8dd14c-0fbf-44a5-85a3-25c8e3bd0075',
  description:
    'Die lernende Person kann Alltagserfahrungen zur Farbwahrnehmung anhand des Zusammenspiels von Beleuchtung, Oberfläche und Auge fachlich beschreiben.',
  descriptionEn:
    'The learner can describe everyday experiences of color perception in terms of the interaction among illumination, surface, and eye.',
} as const

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

const reviewRounds = Object.values(reviewRecordPaths).map((path) => {
  const records = readJsonl(path)
  if (records.length !== 4) throw new Error(`${path}: expected exactly four review records`)
  return new Map(records.map((record) => [record.goalId, record]))
})

for (const revision of revisions) {
  reviewRounds.forEach((round, roundIndex) => {
    const record = round.get(revision.id)
    if (
      !record
      || record.decision !== revision.expectedDecisions[roundIndex]
      || record.currentDescriptionDe !== revision.previousDescription
      || record.currentDescriptionEn !== revision.previousDescriptionEn
    ) {
      throw new Error(`${revision.id}: bound second-pass review input or decision drifted in round ${roundIndex + 1}`)
    }
  })
}

reviewRounds.forEach((round, roundIndex) => {
  const record = round.get(keep.id)
  if (
    !record
    || record.decision !== 'keep'
    || record.currentDescriptionDe !== keep.description
    || record.currentDescriptionEn !== keep.descriptionEn
  ) {
    throw new Error(`${keep.id}: bound KEEP input drifted in round ${roundIndex + 1}`)
  }
})

const normalizeText = (value: unknown): string =>
  String(value ?? '').normalize('NFKC').replace(/\s+/gu, ' ').trim()

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

const requirePreviousOrCurrentPair = (
  actualDe: unknown,
  actualEn: unknown,
  revision: (typeof revisions)[number],
): void => {
  const previous = actualDe === revision.previousDescription && actualEn === revision.previousDescriptionEn
  const current = actualDe === revision.description && actualEn === revision.descriptionEn
  if (!previous && !current) throw new Error(`${revision.id}: mixed or unexpected bilingual description state`)
}

const canonical = readJson(paths.canonical)
const goals = canonical.goals as JsonRecord[]
const goalById = new Map(goals.map((goal) => [goal.id, goal]))

for (const revision of revisions) {
  const goal = goalById.get(revision.id)
  if (!goal) throw new Error(`Missing Physics color goal ${revision.id}`)
  requirePreviousOrCurrentPair(goal.description, goal.descriptionEn, revision)
  goal.description = revision.description
  goal.descriptionEn = revision.descriptionEn
  for (const link of goal.resourceLinks ?? []) {
    if (link?.type === 'goal-visualization') {
      link.altText = `Didaktische Visualisierung zum Lernziel "${goal.title}". ${goal.description}`
    }
  }
}

const semanticKinds = readJson(paths.semanticKinds)
const semanticById = new Map((semanticKinds.decisions as JsonRecord[]).map((record) => [record.goalId, record]))
for (const revision of revisions) {
  const decision = semanticById.get(revision.id)
  const goal = goalById.get(revision.id)!
  if (!decision || decision.semanticKind !== 'curricularAtomic') {
    throw new Error(`Missing curricularAtomic semantic-kind decision ${revision.id}`)
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
  const memoryRecord = memoryById.get(revision.id)
  if (!atomicityRecord || !memoryRecord) throw new Error(`Missing downstream review records ${revision.id}`)
  Object.assign(atomicityRecord, {
    fingerprint: fingerprintReviewGoal(goal, 'semantic-atomicity-v1'),
    status: 'atomic',
    semanticAtomic: true,
    reviewedAt: '2026-08-26',
    reviewer: 'codex-ai-synthesis-2026-08-26',
    reason: revision.atomicityReason,
    suggestedSplit: [],
  })
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
const visualizationById = new Map(
  (visualizationQa.records as JsonRecord[]).map((record) => [record.goalId, record]),
)
for (const revision of revisions) {
  const goal = goalById.get(revision.id)!
  const record = visualizationById.get(revision.id)
  if (!record) throw new Error(`Missing visualization QA record ${revision.id}`)
  if (record.description !== revision.previousDescription && record.description !== revision.description) {
    throw new Error(`${revision.id}: visualization QA description drifted`)
  }
  const canonicalBytes = readFileSync(resolve(repoRoot, record.canonicalAssetPath))
  const publicBytes = readFileSync(resolve(repoRoot, record.publicAssetPath))
  const digest = `sha256:${createHash('sha256').update(canonicalBytes).digest('hex')}`
  if (!canonicalBytes.equals(publicBytes)) throw new Error(`${revision.id}: visualization bytes differ`)
  if (digest !== revision.assetSha256) throw new Error(`${revision.id}: visualization digest drifted`)
  Object.assign(record, {
    description: goal.description,
    assetSha256: digest,
    umlautsCorrectChatGpt: 'yes',
    contentApprovedChatGpt: 'yes',
    chatGptReviewedAt: '2026-08-26T11:30:00.000Z',
    chatGptReviewer: 'codex-physics-colors-second-pass-original-review-2026-08-26',
    chatGptNotes: revision.visualizationNote,
    aiApproved: 'yes',
    aiApprovedAssetSha256: digest,
    aiReviewedAt: '2026-08-26T11:30:00.000Z',
    aiReviewer: 'codex-physics-colors-second-pass-original-review-2026-08-26',
    aiNotes: revision.visualizationNote,
  })
}

const promptOutputs = new Map<string, string>()
for (const revision of revisions) {
  let prompt = readFileSync(resolve(repoRoot, revision.promptPath), 'utf8')
  if (prompt.includes(revision.previousDescription)) {
    prompt = prompt.split(revision.previousDescription).join(revision.description)
  }
  if (!prompt.includes(revision.description) || prompt.includes(revision.previousDescription)) {
    throw new Error(`${revision.id}: could not bind current description in prompt`)
  }
  promptOutputs.set(revision.promptPath, prompt)
}

if (writeMode) {
  writeJson(paths.canonical, canonical)
  writeJson(paths.semanticKinds, semanticKinds)
  writeJsonl(paths.atomicity, atomicity)
  writeJsonl(paths.memory, memory)
  writeJson(paths.visualizationQa, visualizationQa)
  for (const [path, prompt] of promptOutputs) writeFileSync(resolve(repoRoot, path), prompt)
}

console.log(
  `CHECK apply_physics_colors_batch005_second_pass ${writeMode ? 'WRITE' : 'PASS'} revisions=3 keep=1 curricularAtomic=438`,
)
