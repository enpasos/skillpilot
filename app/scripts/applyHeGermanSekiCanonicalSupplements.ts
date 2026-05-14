import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

const canonicalPath = resolve(repoRoot, 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_DEUTSCH.de.json')
const sourceExtractionPath = resolve(repoRoot, 'curricula/DE/Gymnasium/input/HE/lower-secondary/source-extraction/DE_HE_DEUTSCH_SEKI_G9.source-extraction.json')
const reviewPath = resolve(repoRoot, 'curricula/DE/Gymnasium/mapping/DE-HE/lower-secondary/hessen_german_lower_secondary_source_extraction_to_canonical_german.review.json')

const rootGoalId = 'a9154942-479f-54e7-9f65-7312be75686d'
const motivationGoalId = 'eff86a92-e048-5494-b561-6ecdda1fbf67'
const sourceLandscapeId = uuidFromString('DE-HE-DEUTSCH-SEKI-G9-LEHRPLAN-GYMNASIALER-BILDUNGSGANG')
const sourceLandscapeTitle = 'Deutsch Sekundarstufe I (Hessen, G9)'
const targetLandscapeId = '67bd301b-e11a-582d-94ba-4f4b1a4cefff'
const generatedMarker = 'generated:he-german-seki-g9'

interface Goal {
  id: string
  title: string
  description: string
  weight: number
  contains: string[]
  requires: string[]
  tags?: string[]
  dimensionTags: Record<string, unknown>
  applicability?: Record<string, string[]>
  extendedData?: Record<string, unknown>
  type?: 'atomic' | 'cluster'
  core?: boolean
  sourceRef?: string
  themenfeld?: string
  courseLevel?: string
}

interface SourceGoal {
  id: string
  passageId: string
  topicCode: string
  title: string
  description: string
  sourceSpan: string
  sourceRef: string
  tags: string[]
}

interface Passage {
  id: string
  topicCode: string
  title: string
  sourcePath: string
}

interface SourceExtraction {
  sourceLandscapeId: string
  title: string
  sourceDocument?: { path?: string }
  sourceGoals: SourceGoal[]
  passages: Passage[]
}

interface CanonicalLandscape {
  description?: string
  goals: Goal[]
}

const canonical = readJson<CanonicalLandscape>(canonicalPath)
const extraction = readJson<SourceExtraction>(sourceExtractionPath)

if (extraction.sourceLandscapeId !== sourceLandscapeId) {
  throw new Error(`Unexpected source landscape: ${extraction.sourceLandscapeId}`)
}

const sourceGoalsByArea = groupBy(extraction.sourceGoals, (sourceGoal) => sourceGoal.topicCode)
const passagesById = new Map(extraction.passages.map((passage) => [passage.id, passage]))
const areaCodes = [...sourceGoalsByArea.keys()].sort((left, right) => Number(left) - Number(right))
const grades = [...new Set(areaCodes.map((code) => code.split('.')[0]))].sort((left, right) => Number(left) - Number(right))

const generatedGoalIds = new Set<string>([
  sekiRootGoalId(),
  ...grades.map((grade) => gradeGoalId(grade)),
  ...areaCodes.map((code) => areaGoalId(code)),
  ...extraction.sourceGoals.map((sourceGoal) => canonicalGoalIdForSourceGoal(sourceGoal)),
])

canonical.goals = canonical.goals.filter((goal) => {
  if (generatedGoalIds.has(goal.id)) return false
  return !(goal.tags ?? []).includes(generatedMarker)
})

const rootGoal = canonical.goals.find((goal) => goal.id === rootGoalId)
if (!rootGoal) throw new Error(`Missing canonical German root goal ${rootGoalId}`)

rootGoal.description = 'Gemeinsame Wurzel für Deutsch am Gymnasium in Deutschland. Die aktuelle Baseline übernimmt die hessische Oberstufe vollständig und ergänzt eine erste Hessen-Sek-I-G9-Schicht als belegte kanonische Deutsch-Lernziellandschaft.'
rootGoal.contains = insertAfter(rootGoal.contains.filter((id) => !generatedGoalIds.has(id)), motivationGoalId, sekiRootGoalId())

const generatedGoals: Goal[] = []
generatedGoals.push({
  id: sekiRootGoalId(),
  title: 'Deutsch Sekundarstufe I (Hessen, G9)',
  description: 'Kanonische Deutsch-Sek-I-Schicht aus den Hessen-G9-Lehrplanpassagen der Jahrgangsstufen 5 bis 10.',
  weight: extraction.sourceGoals.length,
  tags: baseTags('SekI'),
  contains: grades.map((grade) => gradeGoalId(grade)),
  requires: [],
  dimensionTags: dimensionTags('SekI', 'Sekundarstufe I', 'SekI'),
  applicability: { jurisdiction: ['DE-HE'] },
  extendedData: provenance(),
  type: 'cluster',
  core: true,
})

for (const grade of grades) {
  const gradeAreaCodes = areaCodes.filter((code) => code.startsWith(`${grade}.`))
  const gradeSourceGoalCount = gradeAreaCodes.reduce((sum, code) => sum + (sourceGoalsByArea.get(code)?.length ?? 0), 0)
  generatedGoals.push({
    id: gradeGoalId(grade),
    title: `Deutsch Jahrgangsstufe ${grade}`,
    description: `Kanonischer Deutsch-Kompetenzbereich für die Jahrgangsstufe ${grade} im hessischen G9-Lehrplan.`,
    weight: gradeSourceGoalCount,
    tags: baseTags(`grade:${grade}`),
    contains: gradeAreaCodes.map((code) => areaGoalId(code)),
    requires: [],
    dimensionTags: dimensionTags(grade, `Jahrgangsstufe ${grade}`, undefined),
    applicability: { jurisdiction: ['DE-HE'] },
    extendedData: provenance(),
    type: 'cluster',
    core: true,
  })
}

for (const areaCode of areaCodes) {
  const sourceGoals = sourceGoalsByArea.get(areaCode) ?? []
  const passage = passagesById.get(sourceGoals[0]?.passageId)
  generatedGoals.push({
    id: areaGoalId(areaCode),
    title: passage?.title ?? `Deutsch ${areaCode}`,
    description: `Kanonischer Deutsch-Sek-I-Bereich ${areaCode} aus der amtlichen Hessen-G9-Passage.`,
    weight: sourceGoals.length,
    tags: baseTags(`topic:${areaCode}`, ...areaTags(sourceGoals[0])),
    contains: sourceGoals.map((sourceGoal) => canonicalGoalIdForSourceGoal(sourceGoal)),
    requires: [],
    dimensionTags: dimensionTags(areaCode, areaTitleFromPassage(passage), areaCode),
    applicability: { jurisdiction: ['DE-HE'] },
    extendedData: provenance(passage),
    type: 'cluster',
    core: true,
    themenfeld: areaCode,
    sourceRef: passage?.sourcePath,
  })

  for (const sourceGoal of sourceGoals) {
    generatedGoals.push({
      id: canonicalGoalIdForSourceGoal(sourceGoal),
      title: sourceGoal.title,
      description: sourceGoal.description,
      weight: 1,
      tags: baseTags(`topic:${sourceGoal.topicCode}`, ...areaTags(sourceGoal)),
      contains: [],
      requires: [],
      dimensionTags: dimensionTags(sourceGoal.topicCode, areaTitleFromPassage(passage), sourceGoal.topicCode),
      applicability: { jurisdiction: ['DE-HE'] },
      extendedData: provenance(passage, sourceGoal),
      type: 'atomic',
      core: true,
      courseLevel: 'both',
      themenfeld: sourceGoal.topicCode,
      sourceRef: sourceGoal.sourceRef,
    })
  }
}

canonical.goals.push(...generatedGoals)

const decisions = extraction.sourceGoals.map((sourceGoal) => ({
  sourceGoalId: sourceGoal.id,
  topicCode: sourceGoal.topicCode,
  sourceSpan: sourceGoal.sourceSpan,
  decision: 'mapped',
  canonicalGoalIds: [canonicalGoalIdForSourceGoal(sourceGoal)],
  matchType: 'exact',
  rationale: `Das Hessen-Sek-I-Deutsch-Source-Ziel "${sourceGoal.title}" (${sourceGoal.sourceSpan}) wird als eigenes kanonisches Deutsch-Sek-I-Ziel gefuehrt und fachlich 1:1 abgedeckt.`,
  reviewedAt: '2026-05-14',
  reviewer: 'Codex',
}))

const review = {
  version: 1,
  reviewId: 'de-he-german-lower-secondary-source-extraction-to-canonical-german',
  sourceLandscapeId,
  targetLandscapeId,
  sourceExtractionPath: 'curricula/DE/Gymnasium/input/HE/lower-secondary/source-extraction/DE_HE_DEUTSCH_SEKI_G9.source-extraction.json',
  status: 'complete',
  summary: {
    sourceGoals: extraction.sourceGoals.length,
    reviewedSourceGoals: extraction.sourceGoals.length,
    seedMappedSourceGoals: 0,
    mappedSourceGoals: extraction.sourceGoals.length,
    needsCanonicalGoal: 0,
    exactMappings: extraction.sourceGoals.length,
    partialMappings: 0,
    inheritedMappings: 0,
    note: 'Hessen Sek I Deutsch ist als eigene kanonische Sek-I-Schicht ergaenzt; jedes Source-Ziel ist fachlich durch ein passgenaues SkillPilot-Ziel abgedeckt.',
  },
  mappings: decisions.map((decision) => ({
    legacyGoalId: decision.sourceGoalId,
    canonicalGoalId: decision.canonicalGoalIds[0],
    matchType: decision.matchType,
    reviewDecisionId: decision.sourceGoalId,
  })),
  decisions,
}

writeJson(canonicalPath, canonical)
writeJson(reviewPath, review)

console.log(`Applied Hessen Sek I Deutsch canonical supplements: ${generatedGoals.length} canonical goals, ${decisions.length} exact mappings.`)

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T
}

function writeJson(path: string, value: unknown): void {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

function uuidFromString(value: string): string {
  const hex = createHash('sha1').update(value).digest('hex').slice(0, 32)
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`
}

function sekiRootGoalId(): string {
  return uuidFromString('DE-GYM-CANONICAL-DEUTSCH-SEKI:ROOT')
}

function gradeGoalId(grade: string): string {
  return uuidFromString(`DE-GYM-CANONICAL-DEUTSCH-SEKI:GRADE:${grade}`)
}

function areaGoalId(areaCode: string): string {
  return uuidFromString(`DE-GYM-CANONICAL-DEUTSCH-SEKI:AREA:${areaCode}`)
}

function canonicalGoalIdForSourceGoal(sourceGoal: { id: string }): string {
  return uuidFromString(`DE-GYM-CANONICAL-DEUTSCH-SEKI:DE-HE:${sourceGoal.id}`)
}

function baseTags(...tags: string[]): string[] {
  return unique(['GK', 'LK', 'canonical', 'subject:german', 'stage:SekI', 'jurisdiction:DE-HE', generatedMarker, ...tags])
}

function areaTags(sourceGoal?: SourceGoal): string[] {
  const areaTag = sourceGoal?.tags.find((tag) => tag.startsWith('area:'))
  if (!areaTag) return []
  const area = areaTag.slice('area:'.length)
  if (area === 'Sprechen und Schreiben') return ['skill:sprechen', 'skill:schreiben']
  if (area === 'Lesen und Umgang mit Texten') return ['skill:lesen', 'skill:literatur', 'skill:medien']
  if (area === 'Reflexion über Sprache') return ['skill:sprachreflexion']
  return []
}

function dimensionTags(phase: string, area?: string, topicCode?: string): Record<string, unknown> {
  return {
    framework: 'hessen-g9-german-lower-secondary',
    demandLevel: 'SekI',
    processCompetencies: [],
    guidingIdeas: [],
    phase,
    area,
    topicCode,
  }
}

function provenance(passage?: Passage, sourceGoal?: SourceGoal): Record<string, unknown> {
  return {
    provenance: {
      sourceLandscapeId,
      sourceLandscapeTitle,
      sourceGoalId: sourceGoal?.id,
      sourcePassageId: passage?.id,
      sourcePath: passage?.sourcePath ?? extraction.sourceDocument?.path,
    },
  }
}

function areaTitleFromPassage(passage?: Passage): string | undefined {
  if (!passage) return undefined
  return passage.title.replace(/^\d+(?:\.\d+)?\s+/, '')
}

function groupBy<T>(values: T[], keyFn: (value: T) => string): Map<string, T[]> {
  const groups = new Map<string, T[]>()
  for (const value of values) {
    const key = keyFn(value)
    const group = groups.get(key) ?? []
    group.push(value)
    groups.set(key, group)
  }
  return groups
}

function insertAfter(values: string[], afterValue: string, value: string): string[] {
  const withoutValue = values.filter((candidate) => candidate !== value)
  const index = withoutValue.indexOf(afterValue)
  if (index < 0) return unique([...withoutValue, value])
  return unique([...withoutValue.slice(0, index + 1), value, ...withoutValue.slice(index + 1)])
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)]
}
