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
  prompt:
    'curricula/DE/Gymnasium/visualizations/physik/1c8dd14c-0fbf-44a5-85a3-25c8e3bd0075/prompt.de.md',
} as const

const revision = {
  id: '1c8dd14c-0fbf-44a5-85a3-25c8e3bd0075',
  previousDescription:
    'Die lernende Person kann Alltagserfahrungen zur Farbwahrnehmung anhand des Zusammenspiels von Beleuchtung, Oberfläche und Auge fachlich beschreiben.',
  description:
    'Die lernende Person kann Alltagserfahrungen zur Farbwahrnehmung fachlich beschreiben, indem sie erläutert, wie Beleuchtung und Oberfläche das ins Auge gelangende Licht und damit den Farbeindruck bestimmen.',
  previousDescriptionEn:
    'The learner can describe everyday experiences of color perception in terms of the interaction among illumination, surface, and eye.',
  descriptionEn:
    'The learner can describe everyday experiences of color perception in scientific terms by explaining how illumination and the surface determine the light reaching the eye and thus the color impression.',
  atomicityReason:
    'Beleuchtung, Wirkung der Oberfläche und das zum Auge gelangende Licht bilden eine einzige kausale Erklärungskette für den situationsabhängigen Farbeindruck; die Beschreibung fordert genau diese zusammenhängende Kompetenz.',
  memoryReason:
    'Die Erklärung und Vorhersage veränderter Farbeindrücke muss den Lichtweg für neue Beleuchtungs- und Oberflächenfälle rekonstruieren; ein fester Merksatz ersetzt diese Transferleistung nicht.',
  assetSha256: 'sha256:520fdeed70bf83ddbf5c429d8478fb8da15b704a705a366e43795d8e8bf96e4f',
} as const

const reviewDirectory =
  'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-08-26/batch-005-colors-4-current-v3'
const reviewPaths = [
  `${reviewDirectory}/round-a/results/physik-rollout-v1-batch-005-colors-4-current-v3-20260826-first-pass-a.batch-001.records.jsonl`,
  `${reviewDirectory}/round-b/results/physik-rollout-v1-batch-005-colors-4-current-v3-20260826-first-pass-b.batch-001.records.jsonl`,
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

for (const [roundIndex, path] of reviewPaths.entries()) {
  const records = readJsonl(path)
  if (records.length !== 4) throw new Error(`${path}: expected exactly four review records`)
  const record = records.find(({ goalId }) => goalId === revision.id)
  if (
    !record
    || record.decision !== 'revise'
    || record.currentDescriptionDe !== revision.previousDescription
    || record.currentDescriptionEn !== revision.previousDescriptionEn
  ) {
    throw new Error(`${revision.id}: bound third-pass REVISE input drifted in round ${roundIndex + 1}`)
  }
  if (
    roundIndex === 1
    && (
      record.proposedDescriptionDe !== revision.description
      || record.proposedDescriptionEn !== revision.descriptionEn
    )
  ) {
    throw new Error(`${revision.id}: selected conservative round-B revision drifted`)
  }
}

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

const canonical = readJson(paths.canonical)
const goal = (canonical.goals as JsonRecord[]).find(({ id }) => id === revision.id)
if (!goal) throw new Error(`Missing Physics color goal ${revision.id}`)
const previous = goal.description === revision.previousDescription
  && goal.descriptionEn === revision.previousDescriptionEn
const current = goal.description === revision.description && goal.descriptionEn === revision.descriptionEn
if (!previous && !current) throw new Error(`${revision.id}: mixed or unexpected bilingual state`)
goal.description = revision.description
goal.descriptionEn = revision.descriptionEn
for (const link of goal.resourceLinks ?? []) {
  if (link?.type === 'goal-visualization') {
    link.altText = `Didaktische Visualisierung zum Lernziel "${goal.title}". ${goal.description}`
  }
}

const semanticKinds = readJson(paths.semanticKinds)
const semanticDecision = (semanticKinds.decisions as JsonRecord[])
  .find(({ goalId }) => goalId === revision.id)
if (!semanticDecision || semanticDecision.semanticKind !== 'curricularAtomic') {
  throw new Error(`Missing curricularAtomic semantic-kind decision ${revision.id}`)
}
Object.assign(semanticDecision, {
  sourceFingerprint: fingerprintSemanticKindSourceGoal(goal),
  decisionStatus: 'authoritative',
  decisionBasis: 'reviewed-current-pilot-curricular-atomic',
})
if (semanticKinds.counts?.curricularAtomic !== 438) {
  throw new Error(`Expected 438 curricularAtomic Physics decisions, got ${semanticKinds.counts?.curricularAtomic}`)
}

const atomicity = readJsonl(paths.atomicity)
const atomicityRecord = atomicity.find(({ goalId }) => goalId === revision.id)
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

const memory = readJsonl(paths.memory)
const memoryRecord = memory.find(({ goalId }) => goalId === revision.id)
if (!memoryRecord) throw new Error(`Missing memory record ${revision.id}`)
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

const visualizationQa = readJson(paths.visualizationQa)
const visualization = (visualizationQa.records as JsonRecord[]).find(({ goalId }) => goalId === revision.id)
if (!visualization) throw new Error(`Missing visualization QA record ${revision.id}`)
if (
  visualization.description !== revision.previousDescription
  && visualization.description !== revision.description
) {
  throw new Error(`${revision.id}: visualization QA description drifted`)
}
const canonicalAsset = readFileSync(resolve(repoRoot, visualization.canonicalAssetPath))
const publicAsset = readFileSync(resolve(repoRoot, visualization.publicAssetPath))
const assetSha256 = `sha256:${createHash('sha256').update(canonicalAsset).digest('hex')}`
if (!canonicalAsset.equals(publicAsset)) throw new Error(`${revision.id}: visualization bytes differ`)
if (assetSha256 !== revision.assetSha256) throw new Error(`${revision.id}: visualization digest drifted`)
const visualizationNote =
  'Frische Originalprüfung gegen die kausal präzisierte Beschreibung: Dasselbe rote Apfelobjekt wird unter weißer und grüner Beleuchtung gezeigt. Lichtquelle, Oberfläche, reflektierter Lichtweg und Auge sind getrennt; das Auge sendet keine Strahlen aus. Damit veranschaulicht das Asset, wie Beleuchtung und Oberfläche das zum Auge gelangende Licht und den Farbeindruck bestimmen.'
Object.assign(visualization, {
  description: goal.description,
  assetSha256,
  umlautsCorrectChatGpt: 'yes',
  contentApprovedChatGpt: 'yes',
  chatGptReviewedAt: '2026-08-26T12:15:00.000Z',
  chatGptReviewer: 'codex-physics-colors-third-pass-original-review-2026-08-26',
  chatGptNotes: visualizationNote,
  aiApproved: 'yes',
  aiApprovedAssetSha256: assetSha256,
  aiReviewedAt: '2026-08-26T12:15:00.000Z',
  aiReviewer: 'codex-physics-colors-third-pass-original-review-2026-08-26',
  aiNotes: visualizationNote,
})

let prompt = readFileSync(resolve(repoRoot, paths.prompt), 'utf8')
if (prompt.includes(revision.previousDescription)) {
  prompt = prompt.split(revision.previousDescription).join(revision.description)
}
if (!prompt.includes(revision.description) || prompt.includes(revision.previousDescription)) {
  throw new Error(`${revision.id}: could not bind current description in prompt`)
}

if (writeMode) {
  writeJson(paths.canonical, canonical)
  writeJson(paths.semanticKinds, semanticKinds)
  writeJsonl(paths.atomicity, atomicity)
  writeJsonl(paths.memory, memory)
  writeJson(paths.visualizationQa, visualizationQa)
  writeFileSync(resolve(repoRoot, paths.prompt), prompt)
}

console.log(
  `CHECK apply_physics_colors_batch005_third_pass ${writeMode ? 'WRITE' : 'PASS'} revisions=1 curricularAtomic=438`,
)
