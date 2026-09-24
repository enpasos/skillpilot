import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel'
import { fingerprintGoalForPositiveEvidence, fingerprintPositiveGoalEvidenceReviewInput } from './positiveGoalEvidenceProfileModel'
import type { LearningGoal } from '../src/landscapeTypes'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const paths = {
  canonical: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
  semantic: 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json',
  atomicity: 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-math-full.review.jsonl',
  memory: 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-math-full.review.jsonl',
  visualizationQa: 'curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json',
  positiveEvidence: 'curricula/DE/Gymnasium/quality/goal-evidence/m7-volume-five-image-bound-p-20260924-v1/current-five.review.jsonl',
  receipt: 'curricula/DE/Gymnasium/quality/goal-visualization-review/math-m7-five-volume-png-20260924-v1/formula-text-normalization.json',
} as const

const changes = [
  {
    id: '1e77bb2f-0cd6-5961-b0fb-230317c73fce',
    oldDe: 'Die lernende Person kann den Zusammenhang $V = G \\cdot h$ geometrisch erklären und nutzen, um Volumina von Prismen aus Skizzen oder Koordinaten zu bestimmen und Einheiten korrekt anzugeben.',
    newDe: 'Die lernende Person kann den Zusammenhang V = G · h geometrisch erklären und nutzen, um Volumina von Prismen aus Skizzen oder Koordinaten zu bestimmen und Einheiten korrekt anzugeben.',
    oldEn: 'The learner can explain the geometric relationship $V = G \\cdot h$ and use it to determine prism volumes from sketches or coordinates and state units correctly.',
    newEn: 'The learner can explain the geometric relationship V = G · h and use it to determine prism volumes from sketches or coordinates and state units correctly.',
    meaning: 'Grundflächeninhalt mal senkrechte Höhe; geometrisches Erklären, Skizzen/Koordinaten und Einheiten bleiben unverändert.',
  },
  {
    id: '288633c1-f61c-5b48-af7e-a80357f96cad',
    oldDe: 'Die lernende Person kann den Faktor $\\frac{1}{3}$ als Verhältnis zum entsprechenden Prisma deuten und den Zusammenhang $V = \\frac{1}{3} G \\cdot h$ nutzen, um Volumina von Pyramiden aus Skizzen oder Koordinaten zu bestimmen.',
    newDe: 'Die lernende Person kann den Faktor 1/3 als Verhältnis zum entsprechenden Prisma deuten und den Zusammenhang V = (G · h)/3 nutzen, um Volumina von Pyramiden aus Skizzen oder Koordinaten zu bestimmen.',
    oldEn: 'The learner can interpret the factor $\\frac{1}{3}$ as the volume ratio to the corresponding prism and use $V = \\frac{1}{3} G \\cdot h$ to determine pyramid volumes from sketches or coordinates.',
    newEn: 'The learner can interpret the factor 1/3 as the volume ratio to the corresponding prism and use V = (G · h)/3 to determine pyramid volumes from sketches or coordinates.',
    meaning: 'Ein Drittel des passenden Prismenvolumens; keine neue Bedingung oder Teilkompetenz.',
  },
  {
    id: 'c71ae268-f28e-59f0-982d-91db8f963378',
    oldDe: 'Die lernende Person kann die Kreisfläche als Grundfläche eines Zylinders deuten und den Zusammenhang $V = \\pi r^2 h$ nutzen, um Volumina aus Skizzen oder Koordinaten zu bestimmen.',
    newDe: 'Die lernende Person kann die Kreisfläche als Grundfläche eines Zylinders deuten und den Zusammenhang V = πr²h nutzen, um Volumina aus Skizzen oder Koordinaten zu bestimmen.',
    oldEn: 'The learner can interpret the circular area as the base of a cylinder and use $V = \\pi r^2 h$ to determine volumes from sketches or coordinates.',
    newEn: 'The learner can interpret the circular area as the base of a cylinder and use V = πr²h to determine volumes from sketches or coordinates.',
    meaning: 'Kreisfläche mal Höhe; Radius, Höhe und Kompetenzumfang bleiben unverändert.',
  },
  {
    id: 'e8237315-654e-5150-97de-49c4cb49b3d1',
    oldDe: 'Die lernende Person kann den Faktor $\\frac{1}{3}$ als Verhältnis zum entsprechenden Zylinder deuten und den Zusammenhang $V = \\frac{1}{3} \\pi r^2 h$ nutzen, um Volumina von Kegeln aus Skizzen oder Koordinaten zu bestimmen.',
    newDe: 'Die lernende Person kann den Faktor 1/3 als Verhältnis zum entsprechenden Zylinder deuten und den Zusammenhang V = (πr²h)/3 nutzen, um Volumina von Kegeln aus Skizzen oder Koordinaten zu bestimmen.',
    oldEn: 'The learner can interpret the factor $\\frac{1}{3}$ as the volume ratio to the corresponding cylinder and use $V = \\frac{1}{3} \\pi r^2 h$ to determine cone volumes from sketches or coordinates.',
    newEn: 'The learner can interpret the factor 1/3 as the volume ratio to the corresponding cylinder and use V = (πr²h)/3 to determine cone volumes from sketches or coordinates.',
    meaning: 'Ein Drittel des passenden Zylindervolumens; keine neue Bedingung oder Teilkompetenz.',
  },
  {
    id: '2f2c9f1a-07f0-59e4-b84a-60648c3b0bda',
    oldDe: 'Die lernende Person kann die kubische Abhängigkeit des Kugelvolumens vom Radius beschreiben und den Zusammenhang $V = \\frac{4}{3} \\pi r^3$ nutzen, um Kugelvolumina aus Skizzen oder Koordinaten zu bestimmen.',
    newDe: 'Die lernende Person kann die kubische Abhängigkeit des Kugelvolumens vom Radius beschreiben und den Zusammenhang V = (4/3)πr³ nutzen, um Kugelvolumina aus Skizzen oder Koordinaten zu bestimmen.',
    oldEn: 'The learner can describe the cubic dependence of sphere volume on the radius and use $V = \\frac{4}{3} \\pi r^3$ to determine sphere volumes from sketches or coordinates.',
    newEn: 'The learner can describe the cubic dependence of sphere volume on the radius and use V = (4/3)πr³ to determine sphere volumes from sketches or coordinates.',
    meaning: 'Kubische Radiusabhängigkeit und derselbe 4/3·πr³-Zusammenhang bleiben unverändert.',
  },
] as const

type JsonRecord = Record<string, unknown>
const absolute = (path: string) => resolve(root, path)
const readJson = async (path: string): Promise<JsonRecord> => JSON.parse(await readFile(absolute(path), 'utf8')) as JsonRecord
const readJsonl = async (path: string): Promise<JsonRecord[]> => (await readFile(absolute(path), 'utf8')).trim().split('\n').map((line) => JSON.parse(line) as JsonRecord)
const serializeJson = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`
const serializeJsonl = (value: JsonRecord[]) => `${value.map((entry) => JSON.stringify(entry)).join('\n')}\n`
const sha256 = (bytes: Buffer) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
const normalizeText = (value: unknown) => String(value ?? '').normalize('NFKC').replace(/\s+/gu, ' ').trim()
const stableJson = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as JsonRecord).sort(([a], [b]) => a.localeCompare(b))
      .map(([key, nested]) => `${JSON.stringify(key)}:${stableJson(nested)}`).join(',')}}`
  }
  return JSON.stringify(value)
}
const reviewFingerprint = (goal: JsonRecord, ruleVersion: string) => `sha256:${createHash('sha256').update(stableJson({
  ruleVersion,
  goalId: goal.id,
  shortKey: goal.shortKey ?? '',
  title: normalizeText(goal.title),
  titleEn: normalizeText(goal.titleEn),
  description: normalizeText(goal.description),
  descriptionEn: normalizeText(goal.descriptionEn),
  phase: normalizeText((goal.dimensionTags as JsonRecord | undefined)?.phase),
  area: normalizeText((goal.dimensionTags as JsonRecord | undefined)?.area),
  topicCode: normalizeText((goal.dimensionTags as JsonRecord | undefined)?.topicCode),
  nodeKind: normalizeText(goal.nodeKind),
})).digest('hex')}`
const one = (items: JsonRecord[], id: string, name: string): JsonRecord => {
  const matches = items.filter((entry) => (entry.goalId ?? entry.id) === id)
  if (matches.length !== 1) throw new Error(`${id}: expected exactly one ${name} record, found ${matches.length}`)
  return matches[0]
}

const main = async () => {
  const mode = process.argv[2]
  if (!['--write', '--check'].includes(mode) || process.argv.length !== 3) {
    throw new Error('Usage: tsx app/scripts/normalizeMathM7FiveVolumeFormulaText.ts --write|--check')
  }
  const [canonical, semantic, atomicity, memory, qa, positive] = await Promise.all([
    readJson(paths.canonical), readJson(paths.semantic), readJsonl(paths.atomicity),
    readJsonl(paths.memory), readJson(paths.visualizationQa), readJsonl(paths.positiveEvidence),
  ])
  if (canonical.subject !== 'Mathematik' || qa.subject !== 'mathematik') throw new Error('Wrong subject data')
  const receipt: JsonRecord[] = []
  for (const spec of changes) {
    const goal = one(canonical.goals as JsonRecord[], spec.id, 'canonical goal')
    const alreadyNew = goal.description === spec.newDe && goal.descriptionEn === spec.newEn
    if (!alreadyNew && (goal.description !== spec.oldDe || goal.descriptionEn !== spec.oldEn)) {
      throw new Error(`${spec.id}: unexpected canonical description drift`)
    }
    const before = { ...goal, description: spec.oldDe, descriptionEn: spec.oldEn }
    const after = { ...goal, description: spec.newDe, descriptionEn: spec.newEn }
    if (spec.newDe.includes('$') || spec.newEn.includes('$') || spec.newDe.includes('\\') || spec.newEn.includes('\\')) {
      throw new Error(`${spec.id}: normalized formula still contains TeX markup`)
    }
    const decision = one(semantic.decisions as JsonRecord[], spec.id, 'semantic-kind decision')
    const atomic = one(atomicity, spec.id, 'atomicity')
    const mem = one(memory, spec.id, 'memory suitability')
    const image = one(qa.records as JsonRecord[], spec.id, 'image QA')
    const p = one(positive, spec.id, 'positive evidence')
    if (decision.semanticKind !== 'curricularAtomic' || decision.decisionStatus !== 'authoritative'
      || atomic.status !== 'atomic' || atomic.semanticAtomic !== true
      || mem.status !== 'no_memory_needed' || mem.memoryUseful !== false
      || image.contentApprovedChatGpt !== 'yes' || image.aiApproved !== 'yes'
      || image.humanApproved !== 'no' || image.humanIssueIdentified !== 'no'
      || image.description !== (alreadyNew ? spec.newDe : spec.oldDe)
      || !String(image.imageUrl).endsWith(`/${spec.id}.png`)) {
      throw new Error(`${spec.id}: established classification or image QA changed`)
    }
    const imageBytes = await readFile(absolute(String(image.publicAssetPath)))
    if (sha256(imageBytes) !== image.assetSha256 || image.aiApprovedAssetSha256 !== image.assetSha256) {
      throw new Error(`${spec.id}: actual image no longer matches its QA approval`)
    }
    const oldSemantic = fingerprintSemanticKindSourceGoal(before)
    const oldAtomic = reviewFingerprint(before, 'semantic-atomicity-v1')
    const oldMemory = reviewFingerprint(before, 'memory-card-review-v1')
    const newSemantic = fingerprintSemanticKindSourceGoal(after)
    const newAtomic = reviewFingerprint(after, 'semantic-atomicity-v1')
    const newMemory = reviewFingerprint(after, 'memory-card-review-v1')
    if (decision.sourceFingerprint !== (alreadyNew ? newSemantic : oldSemantic)
      || atomic.fingerprint !== (alreadyNew ? newAtomic : oldAtomic)
      || mem.fingerprint !== (alreadyNew ? newMemory : oldMemory)) {
      throw new Error(`${spec.id}: A/M/semantic-kind baseline is stale before this targeted edit`)
    }
    const resourceDigests = { [String(image.imageUrl)]: String(image.assetSha256) }
    const oldPGoal = fingerprintGoalForPositiveEvidence(before as unknown as LearningGoal, 'curricularAtomic')
    const newPGoal = fingerprintGoalForPositiveEvidence(after as unknown as LearningGoal, 'curricularAtomic')
    const oldPInput = fingerprintPositiveGoalEvidenceReviewInput(before as unknown as LearningGoal, String(p.reviewCriteriaFingerprint), resourceDigests, 'curricularAtomic')
    const newPInput = fingerprintPositiveGoalEvidenceReviewInput(after as unknown as LearningGoal, String(p.reviewCriteriaFingerprint), resourceDigests, 'curricularAtomic')
    const pMatchesBefore = p.goalFingerprint === oldPGoal && p.reviewInputFingerprint === oldPInput
    const pMatchesAfter = p.goalFingerprint === newPGoal && p.reviewInputFingerprint === newPInput
    if ((mode === '--write' && !pMatchesBefore)
      || (mode === '--check' && !pMatchesBefore && !pMatchesAfter)
      || p.status !== 'needs_human_review' || p.reviewAuthority !== 'ai_candidate') {
      throw new Error(`${spec.id}: P profile is neither the protected pre-edit candidate nor its targeted current recheck`)
    }
    if (mode === '--write') {
      goal.description = spec.newDe
      goal.descriptionEn = spec.newEn
      decision.sourceFingerprint = newSemantic
      atomic.fingerprint = newAtomic
      atomic.reviewedAt = '2026-09-24'
      atomic.reviewer = 'Codex targeted Math M7 formula-text recheck'
      atomic.reason = `${String(atomic.reason).replace(/ Targeted formula-text normalization:.*$/u, '')} Targeted formula-text normalization: ${spec.meaning} Die bestehende Atomic-Entscheidung bleibt fachlich gültig.`
      mem.fingerprint = newMemory
      mem.reviewedAt = '2026-09-24'
      mem.reviewer = 'Codex targeted Math M7 formula-text recheck'
      mem.reason = `${String(mem.reason).replace(/ Targeted formula-text normalization:.*$/u, '')} Targeted formula-text normalization: ${spec.meaning} Verständnis und Anwendung, kein neues Auswendiglernziel.`
      image.description = spec.newDe
      image.chatGptNotes = `${String(image.chatGptNotes).replace(/ Zieltext-Notation 24\.09\.2026:.*$/u, '')} Zieltext-Notation 24.09.2026: Nur die fünf dargestellten Formeln in DE/EN aus LaTeX in drucklesbare Unicode-Schreibweise überführt; Bildinhalt, Alt-Text und geprüfte PNG-Bytes unverändert. ${spec.meaning}`
    }
    receipt.push({
      goalId: spec.id,
      before: { descriptionDe: spec.oldDe, descriptionEn: spec.oldEn },
      after: { descriptionDe: spec.newDe, descriptionEn: spec.newEn },
      fachlicheDecision: spec.meaning,
      semanticKindSourceFingerprint: { before: oldSemantic, after: newSemantic },
      atomicityFingerprint: { before: oldAtomic, after: newAtomic },
      memoryFingerprint: { before: oldMemory, after: newMemory },
      positiveEvidenceGoalFingerprint: { before: oldPGoal, after: newPGoal },
      positiveEvidenceInputFingerprint: { before: oldPInput, after: newPInput },
      imageAssetSha256: image.assetSha256,
      imageBytesChanged: false,
      imageAltTextChanged: false,
      currentPRecordRequiresTargetedRecheck: true,
      currentDReviewRequiresNewGoalAndPageBinding: true,
    })
  }
  if (mode === '--write') {
    for (const [path, contents] of [
      [paths.canonical, serializeJson(canonical)],
      [paths.semantic, serializeJson(semantic)],
      [paths.atomicity, serializeJsonl(atomicity)],
      [paths.memory, serializeJsonl(memory)],
      [paths.visualizationQa, serializeJson(qa)],
    ] as const) await writeFile(absolute(path), contents)
    const receiptPayload = {
      schemaVersion: 1,
      receiptId: 'math-m7-five-volume-formula-text-normalization-20260924-v1',
      status: 'targeted_bilingual_display_text_normalized_pending_current_p_and_d_recheck',
      rendererContractChanged: false,
      formulaSemanticsChanged: false,
      goalCount: receipt.length,
      goals: receipt,
    }
    await writeFile(absolute(paths.receipt), serializeJson(receiptPayload), { flag: 'wx' })
  } else {
    const recorded = await readJson(paths.receipt)
    const recordedGoals = recorded.goals as JsonRecord[] | undefined
    if (recordedGoals?.length !== receipt.length) throw new Error('Formula-text receipt is missing five goals')
    for (const [index, expected] of receipt.entries()) {
      if (stableJson(recordedGoals[index]) !== stableJson(expected)) throw new Error(`${changes[index].id}: formula-text receipt drifted`)
    }
  }
  console.log(`Math M7 five-volume formula text ${mode}: ${receipt.length} bilingual goals; P/D remain separately pending`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exitCode = 1
})
