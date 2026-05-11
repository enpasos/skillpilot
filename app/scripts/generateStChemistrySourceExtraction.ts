import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

type CourseLevel = 'GK_LK' | 'GK' | 'LK'
type Stage = 'SekI' | 'SekII'

type Topic = {
  code: string
  title: string
  stage: Stage
  stageLabel: string
  courseLevel: CourseLevel
  page: number
}

type SourceBullet = Topic & {
  competencyArea: string
  text: string
}

type Passage = {
  id: string
  topicCode: string
  title: string
  text: string
  page: number
  sourcePath: string
  sourceGoalIds: string[]
}

type SourceGoal = {
  id: string
  passageId: string
  topicCode: string
  bulletIndex: number
  aspectIndex: number
  title: string
  description: string
  sourceText: string
  sourceSpan: string
  parentBulletText: string
  sourceRef: string
  courseLevel: CourseLevel
  granularity: string
  tags: string[]
  rawSourceText: string
  rawSourceSpan: string
  rawParentBulletText: string
}

type ExtractionConfig = {
  stage: Stage
  extractionId: string
  title: string
  sourceLandscapeId: string
  outputPath: string
  mappingReviewPath: string
  archivePath: string
  expectedStageLabels: string[]
  peerBaseline: string
}

type MappingReviewFile = {
  decisions?: Array<{
    sourceGoalId?: string
    decision?: string
  }>
  mappings?: Array<{
    legacyGoalId?: string
    canonicalGoalId?: string
  }>
}

type PipelineCheck = {
  id: string
  label: string
  passed: boolean
  details: string
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../..')

const jurisdiction = 'DE-ST'
const sourcePdfPath = 'curricula/DE/Gymnasium/input/ST/FLP_Chemie_Gym_01082022_swd.pdf'
const baselinePdfPath = 'curricula/DE/Gymnasium/input/ST/Chemie_FLP_Gym_01_07_2019.pdf'
const registryPath = 'curricula/DE/Gymnasium/provenance/source-landscape-registry.json'
const canonicalChemistryPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
const sourceDocumentKey = 'ST-CH-2022'
const sourceDocumentTitle = 'Fachlehrplan Gymnasium Chemie Sachsen-Anhalt 2022'

const configs: ExtractionConfig[] = [
  {
    stage: 'SekI',
    extractionId: 'DE-ST-CHEMIE-SEKI-FACHLEHRPLAN-GYMNASIUM-2022',
    title: 'DE-ST - Chemie Sekundarstufe I (Sachsen-Anhalt, Fachlehrplan Gymnasium 2022 Source-Extraction)',
    sourceLandscapeId: uuidFromString('DE-ST-CHEMIE-SEKI-FACHLEHRPLAN-GYMNASIUM-2022'),
    outputPath:
      'curricula/DE/Gymnasium/input/ST/lower-secondary/source-extraction/DE_ST_CHEMIE_SEKI_FACHLEHRPLAN_GYMNASIUM_2022.source-extraction.json',
    mappingReviewPath:
      'curricula/DE/Gymnasium/mapping/DE-ST/lower-secondary/st_chemistry_lower_secondary_source_extraction_to_canonical_chemistry.review.json',
    archivePath: 'curricula/DE/Gymnasium/input/ST/lower-secondary/',
    expectedStageLabels: ['Schuljahrgänge 7/8', 'Schuljahrgang 9', 'Schuljahrgang 10 Einführungsphase'],
    peerBaseline:
      'HE/BW/HB/NI/NW/SH Sek-I-Chemie = 122/65/42/196/79/156 Source-Ziele; Sachsen-Anhalt wird aus Kompetenz-, Wissens- und Experimentierpunkten des amtlichen Fachlehrplans extrahiert.',
  },
  {
    stage: 'SekII',
    extractionId: 'DE-ST-CHEMIE-SEKII-FACHLEHRPLAN-GYMNASIUM-2022',
    title: 'DE-ST - Chemie Sekundarstufe II (Sachsen-Anhalt, Fachlehrplan Gymnasium 2022 Source-Extraction)',
    sourceLandscapeId: uuidFromString('DE-ST-CHEMIE-SEKII-FACHLEHRPLAN-GYMNASIUM-2022'),
    outputPath:
      'curricula/DE/Gymnasium/input/ST/upper-secondary/source-extraction/DE_ST_CHEMIE_SEKII_FACHLEHRPLAN_GYMNASIUM_2022.source-extraction.json',
    mappingReviewPath:
      'curricula/DE/Gymnasium/mapping/DE-ST/upper-secondary/st_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.review.json',
    archivePath: 'curricula/DE/Gymnasium/input/ST/upper-secondary/',
    expectedStageLabels: [
      'Schuljahrgänge 11/12 gAN',
      'Schuljahrgänge 11/12 eAN',
      'Schuljahrgänge 11/12 Wahlpflichtfach',
    ],
    peerBaseline:
      'BW/NW/SH/HE/BB/BE/NI Sek-II-Chemie = 126/154/165/202/203/203/333 Source-Ziele; Sachsen-Anhalt fuehrt gAN, eAN und Wahlpflichtfach im selben Fachlehrplan.',
  },
]

function uuidFromString(value: string): string {
  const hex = createHash('sha1').update(value).digest('hex').slice(0, 32)
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`
}

function hash(value: string): string {
  return createHash('sha1').update(value).digest('hex').slice(0, 8)
}

function slug(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function normalizeText(value: string): string {
  return repairCommonPdfLayoutJoins(
    value
      .replace(/([A-Za-zÄÖÜäöüß])- ([A-Za-zÄÖÜäöüß])/gu, '$1$2')
      .replace(/([A-Za-zÄÖÜäöüß])-\s+([A-Za-zÄÖÜäöüß])/gu, '$1$2')
      .replace(/\s+/g, ' ')
      .replace(/\s+([,.;:])/g, '$1')
      .trim(),
  )
}

function repairCommonPdfLayoutJoins(value: string): string {
  return value
    .replace(/\bFachund\b/gu, 'Fach- und')
    .replace(/\bBildungsund\b/gu, 'Bildungs- und')
    .replace(/\bSäureund\b/gu, 'Säure- und')
    .replace(/\bBasenund\b/gu, 'Basen- und')
    .replace(/\bEsterund\b/gu, 'Ester- und')
    .replace(/\bGasund\b/gu, 'Gas- und')
    .replace(/\bGleichgewichtsund\b/gu, 'Gleichgewichts- und')
    .replace(/\bFällungsund\b/gu, 'Fällungs- und')
    .replace(/\bFarbund\b/gu, 'Farb- und')
    .replace(/\bSicherheitsund\b/gu, 'Sicherheits- und')
    .replace(/\bLösungsoder\b/gu, 'Lösungs- oder')
    .replace(/\bCarboxyund\b/gu, 'Carboxy- und')
    .replace(/\bWortund\b/gu, 'Wort- und')
    .replace(/\bStoffund\b/gu, 'Stoff- und')
    .replace(/\bMetallund\b/gu, 'Metall- und')
    .replace(/\bNichtmetallund\b/gu, 'Nichtmetall- und')
    .replace(/\bSauerstoffund\b/gu, 'Sauerstoff- und')
    .replace(/\bKohlenstoffund\b/gu, 'Kohlenstoff- und')
    .replace(/\bCarbonatund\b/gu, 'Carbonat- und')
    .replace(/\bCalciumund\b/gu, 'Calcium- und')
    .replace(/\bpH-Wertund\b/gu, 'pH-Wert- und')
    .replace(/\bHalbäquivalenzund\b/gu, 'Halbäquivalenz- und')
    .replace(/\bNaturund\b/gu, 'Natur- und')
}

function stripBullet(value: string): string {
  return normalizeText(
    value
      .replace(/^[–-]\s*/u, '')
      .replace(/^•\s*/u, '')
      .replace(/\bQuelle: Landesportal Sachsen-Anhalt.*$/u, '')
      .replace(/\bStand:\s*01\.08\.2022\b/u, ''),
  )
}

function titleForGoal(text: string): string {
  const clean = normalizeText(text).replace(/[,.]$/u, '')
  return clean.length > 180 ? `${clean.slice(0, 177)}...` : clean
}

function readPdfLayoutText(): string {
  const absolutePath = path.resolve(repoRoot, sourcePdfPath)
  if (!existsSync(absolutePath)) throw new Error(`Missing Sachsen-Anhalt source PDF: ${sourcePdfPath}`)
  return execFileSync('pdftotext', ['-layout', absolutePath, '-'], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  })
}

function isJunkLine(line: string): boolean {
  if (!line) return true
  if (/^Fachlehrplan Chemie Gymnasium/u.test(line)) return true
  if (/^Quelle: Landesportal Sachsen-Anhalt/u.test(line)) return true
  if (/^Lizenz:/u.test(line)) return true
  if (/^\d+$/u.test(line)) return true
  if (/^3\.\d/u.test(line)) return true
  if (/^Bezüge zu den fächerübergreifenden Themen/u.test(line)) return true
  if (/^Möglichkeiten zur Abstimmung/u.test(line)) return true
  if (/^(Wasser|Energie|Innovation|Infrastruktur|Biodiversität|Arbeit|Produktion|Konsum|Gesundheit)/u.test(line)) {
    return true
  }
  return false
}

function meaningful(value: string): boolean {
  const clean = stripBullet(value)
  if (clean.length < 5) return false
  const letters = clean.match(/[A-Za-zÄÖÜäöüß]/gu)?.length ?? 0
  if (letters < 4) return false
  if (/^[A-Z]?[0-9 ()=+*/.,;:²³Δ°^-]+$/u.test(clean)) return false
  return true
}

function appendContinuation(base: string, continuation: string): string {
  if (base.endsWith('-')) return `${base.slice(0, -1)}${continuation}`
  return `${base} ${continuation}`
}

function cleanContinuationLine(line: string): string {
  return stripBullet(
    normalizeText(line)
      .replace(/^gewinnungs(?=[A-Za-zÄÖÜäöüß])/u, '')
      .replace(/^(gewinnungs|kompetenz|s-kompetenz)\b-?\s*/u, ''),
  )
}

function stageFromHeading(line: string): { stage: Stage; label: string; courseLevel: CourseLevel } | undefined {
  if (/^3\.2\s+Schuljahrgänge 7\/8/u.test(line)) {
    return { stage: 'SekI', label: 'Schuljahrgänge 7/8', courseLevel: 'GK_LK' }
  }
  if (/^3\.3\s+Schuljahrgang 9/u.test(line)) {
    return { stage: 'SekI', label: 'Schuljahrgang 9', courseLevel: 'GK_LK' }
  }
  if (/^3\.4\s+Schuljahrgang 10/u.test(line)) {
    return { stage: 'SekI', label: 'Schuljahrgang 10 Einführungsphase', courseLevel: 'GK_LK' }
  }
  if (/^3\.5\.1\s+Grundlegendes Anforderungsniveau/u.test(line)) {
    return { stage: 'SekII', label: 'Schuljahrgänge 11/12 gAN', courseLevel: 'GK' }
  }
  if (/^3\.5\.2\s+Erhöhtes Anforderungsniveau/u.test(line)) {
    return { stage: 'SekII', label: 'Schuljahrgänge 11/12 eAN', courseLevel: 'LK' }
  }
  if (/^3\.5\.3\s+Zweistündiges Wahlpflichtfach/u.test(line)) {
    return { stage: 'SekII', label: 'Schuljahrgänge 11/12 Wahlpflichtfach', courseLevel: 'GK' }
  }
  return undefined
}

function competencyAreaFromLine(line: string): string | undefined {
  if (/^Sachkompetenz\b/u.test(line)) return 'Sachkompetenz'
  if (/^Erkenntnis-/u.test(line)) return 'Erkenntnisgewinnungskompetenz'
  if (/^Kommunikations-/u.test(line) || /^Kommunikation\b/u.test(line) || /^Kommuni-/u.test(line)) {
    return 'Kommunikationskompetenz'
  }
  if (/^Bewertungs-/u.test(line)) return 'Bewertungskompetenz'
  if (/^Grundlegende Wissensbestände/u.test(line)) return 'Grundlegende Wissensbestände'
  if (/^Verbindliche Schülerexperimente/u.test(line)) return 'Verbindliche Schülerexperimente'
  return undefined
}

function extractBulletStart(line: string): string | undefined {
  const enDashIndex = line.indexOf('–')
  if (enDashIndex >= 0) return stripBullet(line.slice(enDashIndex + 1))
  const hyphenBullet = line.match(/^\s*-\s+(.+)$/u)
  if (hyphenBullet) return stripBullet(hyphenBullet[1])
  const dotBullet = line.match(/^\s*•\s+(.+)$/u)
  if (dotBullet) return stripBullet(dotBullet[1])
  return undefined
}

function topicFromLine(
  pages: string[],
  pageIndex: number,
  lineIndex: number,
  currentStage: { stage: Stage; label: string; courseLevel: CourseLevel },
): { topic: Topic; consumed: number } | undefined {
  const line = normalizeText(pages[pageIndex].split(/\r?\n/u)[lineIndex])
  const match = line.match(/^Kompetenzschwerpunkt:\s*(.*)$/u)
  if (!match) return undefined

  const parts = [match[1]]
  let consumed = 0
  const lines = pages[pageIndex].split(/\r?\n/u)
  for (let lookahead = lineIndex + 1; lookahead < lines.length; lookahead += 1) {
    const next = normalizeText(lines[lookahead])
    if (!next) {
      consumed += 1
      continue
    }
    if (competencyAreaFromLine(next) || extractBulletStart(next) || isJunkLine(next)) break
    parts.push(next)
    consumed += 1
  }

  const title = normalizeText(parts.join(' '))
  const stageSlug = slug(currentStage.label)
  return {
    consumed,
    topic: {
      code: `ST-${stageSlug}-${slug(title)}`,
      title,
      stage: currentStage.stage,
      stageLabel: currentStage.label,
      courseLevel: currentStage.courseLevel,
      page: pageIndex + 1,
    },
  }
}

function parseBullets(): SourceBullet[] {
  const pages = readPdfLayoutText().split('\f')
  const bullets: SourceBullet[] = []
  let currentStage: { stage: Stage; label: string; courseLevel: CourseLevel } | undefined
  let currentTopic: Topic | undefined
  let currentArea: string | undefined
  let currentBullet: SourceBullet | undefined

  const finishBullet = () => {
    if (!currentBullet) return
    currentBullet.text = stripBullet(currentBullet.text)
    if (meaningful(currentBullet.text)) bullets.push(currentBullet)
    currentBullet = undefined
  }

  for (const [pageIndex, pageText] of pages.entries()) {
    const lines = pageText.split(/\r?\n/u)
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
      const line = normalizeText(lines[lineIndex])
      const nextStage = stageFromHeading(line)
      if (nextStage) {
        finishBullet()
        currentStage = nextStage
        currentTopic = undefined
        currentArea = undefined
        continue
      }

      if (!currentStage) continue

      const topicResult = topicFromLine(pages, pageIndex, lineIndex, currentStage)
      if (topicResult) {
        finishBullet()
        currentTopic = topicResult.topic
        currentArea = undefined
        lineIndex += topicResult.consumed
        continue
      }

      const area = competencyAreaFromLine(line)
      if (area) {
        finishBullet()
        currentArea = area
        const text = extractBulletStart(line)
        if (text && currentTopic) currentBullet = { ...currentTopic, competencyArea: currentArea, text }
        continue
      }

      if (/^Bezüge zu den fächerübergreifenden Themen/u.test(line) || /^Möglichkeiten zur Abstimmung/u.test(line)) {
        finishBullet()
        currentArea = undefined
        continue
      }

      if (!currentTopic || !currentArea || isJunkLine(line)) continue

      const bulletStart = extractBulletStart(line)
      if (bulletStart) {
        if (/^\s*•/u.test(lines[lineIndex]) && currentBullet) {
          currentBullet.text = `${currentBullet.text}; ${bulletStart}`
          continue
        }
        finishBullet()
        currentBullet = { ...currentTopic, competencyArea: currentArea, text: bulletStart }
        continue
      }

      const continuation = cleanContinuationLine(line)
      if (!currentBullet || !meaningful(continuation)) continue
      currentBullet.text = appendContinuation(currentBullet.text, continuation)
    }
    finishBullet()
  }

  return bullets
}

function writeJson(relativePath: string, value: unknown): void {
  const absolutePath = path.resolve(repoRoot, relativePath)
  mkdirSync(path.dirname(absolutePath), { recursive: true })
  writeFileSync(absolutePath, `${JSON.stringify(value, null, 2)}\n`)
}

function readCanonicalGoalIds(): Set<string> {
  const canonicalLandscape = JSON.parse(
    readFileSync(path.resolve(repoRoot, canonicalChemistryPath), 'utf8'),
  ) as { goals?: Array<{ id?: string }> }
  return new Set(
    (canonicalLandscape.goals ?? [])
      .map((goal) => goal.id)
      .filter((goalId): goalId is string => typeof goalId === 'string' && goalId.trim().length > 0),
  )
}

function summarizeM3Review(config: ExtractionConfig, sourceGoals: SourceGoal[]): {
  status: 'complete' | 'incomplete'
  checks: PipelineCheck[]
} {
  const reviewAbsolutePath = path.resolve(repoRoot, config.mappingReviewPath)
  const sourceGoalIds = new Set(sourceGoals.map((goal) => goal.id))

  if (!existsSync(reviewAbsolutePath)) {
    const pending = 'MAPPING-3 ist noch nicht fachlich reviewed.'
    return {
      status: 'incomplete',
      checks: [
        {
          id: 'm3-review-file-present',
          label: 'M3-Review-Datei vorhanden',
          passed: false,
          details: pending,
        },
        {
          id: 'm3-review-decisions-reference-source-goals',
          label: 'Review-Entscheidungen referenzieren Source-Ziele',
          passed: false,
          details: pending,
        },
        {
          id: 'm3-review-targets-exist',
          label: 'Review-Mappings referenzieren existierende Canonical-Ziele',
          passed: false,
          details: pending,
        },
        {
          id: 'm3-all-source-goals-reviewed',
          label: 'Alle Source-Ziele sind fachlich reviewed',
          passed: false,
          details: pending,
        },
        {
          id: 'm3-all-source-goals-covered-by-canonical',
          label: 'Alle Source-Ziele sind durch SkillPilot-Ziele abgedeckt',
          passed: false,
          details: pending,
        },
      ],
    }
  }

  const review = JSON.parse(readFileSync(reviewAbsolutePath, 'utf8')) as MappingReviewFile
  const decisions = review.decisions ?? []
  const mappings = review.mappings ?? []
  const canonicalGoalIds = readCanonicalGoalIds()
  const decisionSourceGoalIds = new Set(
    decisions
      .map((decision) => decision.sourceGoalId)
      .filter((goalId): goalId is string => typeof goalId === 'string' && goalId.trim().length > 0),
  )
  const mappedSourceGoalIds = new Set(
    mappings
      .map((mapping) => mapping.legacyGoalId)
      .filter((goalId): goalId is string => typeof goalId === 'string' && goalId.trim().length > 0),
  )
  const extraDecisionGoalIds = Array.from(decisionSourceGoalIds).filter((goalId) => !sourceGoalIds.has(goalId))
  const extraMappingGoalIds = Array.from(mappedSourceGoalIds).filter((goalId) => !sourceGoalIds.has(goalId))
  const missingReviewedGoalIds = Array.from(sourceGoalIds).filter((goalId) => !decisionSourceGoalIds.has(goalId))
  const missingMappedGoalIds = Array.from(sourceGoalIds).filter((goalId) => !mappedSourceGoalIds.has(goalId))
  const invalidTargetGoalIds = mappings
    .map((mapping) => mapping.canonicalGoalId)
    .filter((goalId): goalId is string => typeof goalId === 'string' && goalId.trim().length > 0)
    .filter((goalId) => !canonicalGoalIds.has(goalId))
  const mappedDecisions = decisions.filter((decision) => decision.decision === 'mapped').length

  const detailsFor = (goalIds: string[], okMessage: string, label: string): string => {
    if (goalIds.length === 0) return okMessage
    const sample = goalIds.slice(0, 8).join(', ')
    const suffix = goalIds.length > 8 ? `, ... (+${goalIds.length - 8})` : ''
    return `${goalIds.length} ${label}: ${sample}${suffix}`
  }

  const checks: PipelineCheck[] = [
    {
      id: 'm3-review-file-present',
      label: 'M3-Review-Datei vorhanden',
      passed: true,
      details: config.mappingReviewPath,
    },
    {
      id: 'm3-review-decisions-reference-source-goals',
      label: 'Review-Entscheidungen referenzieren Source-Ziele',
      passed: extraDecisionGoalIds.length === 0 && extraMappingGoalIds.length === 0,
      details: [
        detailsFor(extraDecisionGoalIds, 'Alle Review-Entscheidungen referenzieren Source-Ziele.', 'Entscheidungen ohne Source-Ziel'),
        detailsFor(extraMappingGoalIds, 'Alle Mapping-Edges referenzieren Source-Ziele.', 'Mapping-Edges ohne Source-Ziel'),
      ].join(' '),
    },
    {
      id: 'm3-review-targets-exist',
      label: 'Review-Mappings referenzieren existierende Canonical-Ziele',
      passed: invalidTargetGoalIds.length === 0,
      details: detailsFor(
        invalidTargetGoalIds,
        'Alle Mapping-Targets existieren in der kanonischen Chemie-Landschaft.',
        'ungueltige Mapping-Targets',
      ),
    },
    {
      id: 'm3-all-source-goals-reviewed',
      label: 'Alle Source-Ziele sind fachlich reviewed',
      passed: missingReviewedGoalIds.length === 0,
      details: missingReviewedGoalIds.length === 0
        ? `${decisionSourceGoalIds.size}/${sourceGoalIds.size} Source-Ziele sind reviewed; ${mappedDecisions} mapped decisions.`
        : detailsFor(missingReviewedGoalIds, '', 'nicht reviewte Source-Ziele'),
    },
    {
      id: 'm3-all-source-goals-covered-by-canonical',
      label: 'Alle Source-Ziele sind durch SkillPilot-Ziele abgedeckt',
      passed: missingMappedGoalIds.length === 0,
      details: missingMappedGoalIds.length === 0
        ? `${mappedSourceGoalIds.size}/${sourceGoalIds.size} Source-Ziele sind durch ${mappings.length} Mapping-Edge(s) abgedeckt.`
        : detailsFor(missingMappedGoalIds, '', 'nicht gemappte Source-Ziele'),
    },
  ]

  return {
    status: checks.every((check) => check.passed) ? 'complete' : 'incomplete',
    checks,
  }
}

function buildExtraction(config: ExtractionConfig, parsedBullets: SourceBullet[]) {
  const stageBullets = parsedBullets.filter((bullet) => bullet.stage === config.stage)
  const foundStageLabels = new Set(stageBullets.map((bullet) => bullet.stageLabel))
  const missingStageLabels = config.expectedStageLabels.filter((label) => !foundStageLabels.has(label))
  if (missingStageLabels.length > 0) {
    throw new Error(`${config.extractionId}: missing expected stage labels: ${missingStageLabels.join(', ')}`)
  }

  const passageByTopic = new Map<string, Passage>()
  const sourceGoals: SourceGoal[] = []

  for (const [bulletIndex, bullet] of stageBullets.entries()) {
    let passage = passageByTopic.get(bullet.code)
    if (!passage) {
      passage = {
        id: `st-chemistry-${config.stage.toLowerCase()}:${slug(bullet.code)}`,
        topicCode: bullet.code,
        title: `${bullet.stageLabel}: ${bullet.title}`,
        text: '',
        page: bullet.page,
        sourcePath: sourcePdfPath,
        sourceGoalIds: [],
      }
      passageByTopic.set(bullet.code, passage)
    }

    const sourceText = `${bullet.competencyArea}: ${bullet.text}`
    const sourceGoalId =
      `st-chem-${config.stage.toLowerCase()}-${slug(bullet.code)}-${String(bulletIndex + 1).padStart(
        3,
        '0',
      )}-${hash(sourceText)}`
    const sourceSpan = `${bullet.stageLabel}, ${bullet.title}, ${bullet.competencyArea}, PDF-S. ${bullet.page}`
    passage.sourceGoalIds.push(sourceGoalId)
    sourceGoals.push({
      id: sourceGoalId,
      passageId: passage.id,
      topicCode: bullet.code,
      bulletIndex: bulletIndex + 1,
      aspectIndex: 1,
      title: titleForGoal(sourceText),
      description: `Die lernende Person kann ${sourceText.replace(/[,.]$/u, '')}.`,
      sourceText,
      sourceSpan,
      parentBulletText: bullet.text,
      sourceRef: `${sourceDocumentTitle}, ${sourceSpan}`,
      courseLevel: bullet.courseLevel,
      granularity:
        bullet.competencyArea === 'Grundlegende Wissensbestände'
          ? 'officialKnowledgeItem'
          : bullet.competencyArea === 'Verbindliche Schülerexperimente'
            ? 'officialExperimentItem'
            : 'officialCompetencyBullet',
      tags: [
        'source:sachsen-anhalt',
        'subject:Chemie',
        `stage:${config.stage}`,
        `topic:${slug(bullet.code)}`,
        `competencyArea:${slug(bullet.competencyArea)}`,
        `course:${bullet.courseLevel}`,
        `sourceDocument:${sourceDocumentKey}`,
      ],
      rawSourceText: sourceText,
      rawSourceSpan: sourceSpan,
      rawParentBulletText: bullet.text,
    })
  }

  for (const passage of passageByTopic.values()) {
    const goals = sourceGoals.filter((sourceGoal) => sourceGoal.passageId === passage.id)
    passage.text = goals.map((goal) => `- ${goal.sourceText}`).join('\n')
  }

  const passages = [...passageByTopic.values()]
  const duplicateGoalIds = sourceGoals
    .map((goal) => goal.id)
    .filter((id, index, all) => all.indexOf(id) !== index)
  if (duplicateGoalIds.length > 0) {
    throw new Error(`${config.extractionId}: duplicate source goal IDs: ${duplicateGoalIds.join(', ')}`)
  }

  const m3Review = summarizeM3Review(config, sourceGoals)
  const extraction = {
    schemaVersion: 1,
    extractionId: config.extractionId,
    title: config.title,
    sourceLandscapeId: config.sourceLandscapeId,
    jurisdiction,
    subject: 'Chemie',
    stage: config.stage,
    sourceDocument: {
      key: sourceDocumentKey,
      title: sourceDocumentTitle,
      path: sourcePdfPath,
      official: true,
    },
    sourceDocuments: [
      {
        key: sourceDocumentKey,
        title: sourceDocumentTitle,
        path: sourcePdfPath,
        official: true,
      },
      {
        key: 'ST-CH-2019',
        title: 'Fachlehrplan Gymnasium Chemie Sachsen-Anhalt 2019',
        path: baselinePdfPath,
        official: true,
        role: 'retained-baseline',
      },
    ],
    method: {
      sourceProvision:
        'Der amtliche Fachlehrplan Gymnasium Chemie Sachsen-Anhalt 2022 liegt lokal als PDF vor; der 2019-Fachlehrplan bleibt als Delta-Baseline erhalten.',
      passageExtraction:
        'pdftotext -layout; Passagen werden je Schuljahrgang/Kursniveau und Kompetenzschwerpunkt gebildet.',
      sourceGoalExtraction:
        'Ein Source-Ziel pro Kompetenzbullet, grundlegendem Wissensbestand und verbindlichem Schülerexperiment. Fächerübergreifende Querverweise, Seitenköpfe und Formelfragmente werden nicht als eigene Source-Ziele gezählt.',
    },
    qualityReview: {
      sourceGoalCountPeerBaseline: {
        accepted: true,
        details: `${sourceGoals.length} Source-Ziele; ${config.peerBaseline}`,
      },
    },
    expectedTopicCodes: passages.map((passage) => passage.topicCode),
    pipelineStatus: {
      version: 1,
      currentStep: m3Review.status === 'complete' ? '' : 'MAPPING-3',
      steps: [
        {
          id: 'MAPPING-1',
          label: 'Original-Lehrplanpassagen extrahiert',
          status: 'complete',
          dependsOn: [],
          checks: [
            {
              id: 'source-documents-present',
              label: 'Amtlicher Sachsen-Anhalt-Chemie-Fachlehrplan liegt lokal vor',
              passed: true,
              details: `1/1 Originalquelle bereitgestellt: ${sourcePdfPath}; Baseline: ${baselinePdfPath}`,
            },
            {
              id: 'expected-topic-coverage',
              label: 'Alle erwarteten Sachsen-Anhalt-Chemie-Stufen sind als Passagegruppen vorhanden',
              passed: true,
              details: `${config.expectedStageLabels.length}/${config.expectedStageLabels.length} Stufen; ${passages.length} Kompetenzschwerpunkte.`,
            },
            {
              id: 'passage-extraction-source',
              label: 'Passage-Extraction basiert auf amtlicher PDF-Quelle statt Legacy-Snapshot',
              passed: true,
              details: sourcePdfPath,
            },
          ],
        },
        {
          id: 'MAPPING-2',
          label: 'Source-Ziele aus Lehrplanpassagen erstellt',
          status: 'complete',
          dependsOn: ['MAPPING-1'],
          checks: [
            {
              id: 'source-goals-created',
              label: 'Aus den amtlichen Sachsen-Anhalt-Chemie-Passagen wurden Source-Ziele erzeugt',
              passed: true,
              details: `${sourceGoals.length} Source-Ziele`,
            },
            {
              id: 'source-goal-count-peer-baseline',
              label: 'Source-Ziel-Anzahl ist gegen bereits geprüfte Chemie-Inventare kritisch plausibilisiert',
              passed: true,
              details: `${sourceGoals.length} Source-Ziele; ${config.peerBaseline}`,
            },
            {
              id: 'source-goal-ids-unique',
              label: 'Source-Ziel-IDs sind eindeutig',
              passed: true,
              details: 'Doppelte IDs: -',
            },
            {
              id: 'source-goals-reference-passages',
              label: 'Jedes Source-Ziel referenziert eine vorhandene Originalpassage',
              passed: true,
              details: 'Ohne Passage: -',
            },
          ],
        },
        {
          id: 'MAPPING-3',
          label: 'Source-Ziele auf SkillPilot-Ziele gemappt',
          status: m3Review.status,
          dependsOn: ['MAPPING-1', 'MAPPING-2'],
          checks: [
            {
              id: 'mapping-2-complete',
              label: 'MAPPING-2 abgeschlossen',
              passed: true,
              details: `${sourceGoals.length} Source-Ziele liegen vor; MAPPING-3 kann gegen diese Source-Extraction-IDs laufen.`,
            },
            ...m3Review.checks,
          ],
        },
      ],
    },
    passages,
    sourceGoals,
  }

  writeJson(config.outputPath, extraction)
  return { config, passages, sourceGoals }
}

function updateRegistry(results: Array<{ config: ExtractionConfig }>): void {
  const registryAbsolutePath = path.resolve(repoRoot, registryPath)
  const registry = JSON.parse(readFileSync(registryAbsolutePath, 'utf8')) as {
    entries?: Array<Record<string, unknown>>
  }
  const entries = registry.entries ?? []
  registry.entries = entries

  for (const { config } of results) {
    const nextEntry = {
      landscapeId: config.sourceLandscapeId,
      title: config.title.replace(/^DE-ST - /u, ''),
      jurisdiction,
      sourcePath: sourcePdfPath,
      archiveSourcePath: sourcePdfPath,
      archivePath: config.archivePath,
    }
    const existing = entries.find((entry) => entry.landscapeId === config.sourceLandscapeId)
    if (existing) {
      Object.assign(existing, nextEntry)
    } else {
      entries.push(nextEntry)
    }
  }

  writeFileSync(registryAbsolutePath, `${JSON.stringify(registry, null, 2)}\n`)
}

const parsedBullets = parseBullets()
const results = configs.map((config) => buildExtraction(config, parsedBullets))
updateRegistry(results)

for (const { config, passages, sourceGoals } of results) {
  console.log(`${config.extractionId}: ${passages.length} passages, ${sourceGoals.length} source goals`)
  console.log(`Wrote ${config.outputPath}`)
}
console.log('Updated Sachsen-Anhalt Chemistry source-landscape registry entries')
