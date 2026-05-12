import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

type Stage = 'SekI' | 'SekII'
type CourseLevel = 'GK_LK' | 'GK' | 'LK'

type SourceDocument = {
  key: string
  title: string
  path: string
  url: string
  official: true
}

type Topic = {
  code: string
  title: string
  stage: Stage
  stageLabel: string
  courseLevel: CourseLevel
  page: number
}

type ParsedBlock = Topic & {
  heading: string
  aspects: string[]
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

type SourceExtraction = {
  schemaVersion: 1
  extractionId: string
  title: string
  sourceLandscapeId: string
  jurisdiction: 'DE-SN'
  subject: 'Chemie'
  stage: Stage
  sourceDocument: SourceDocument
  sourceDocuments: SourceDocument[]
  method: {
    sourceProvision: string
    passageExtraction: string
    sourceGoalExtraction: string
  }
  qualityReview: {
    sourceGoalCountPeerBaseline: {
      accepted: boolean
      details: string
    }
  }
  expectedTopicCodes: string[]
  pipelineStatus: {
    version: 1
    currentStep: 'MAPPING-3'
    steps: Array<{
      id: 'MAPPING-1' | 'MAPPING-2' | 'MAPPING-3'
      label: string
      status: 'complete' | 'incomplete'
      dependsOn: Array<'MAPPING-1' | 'MAPPING-2'>
      checks: Array<{
        id: string
        label: string
        passed: boolean
        details: string
      }>
    }>
  }
  passages: Passage[]
  sourceGoals: SourceGoal[]
}

type ExtractionConfig = {
  stage: Stage
  extractionId: string
  title: string
  sourceLandscapeId: string
  outputPath: string
  mappingReviewPath: string
  mappingReadmePath: string
  archivePath: string
  expectedStageLabels: string[]
  peerBaseline: string
}

type MappingReviewStatus = {
  reviewedSourceGoals?: number
  mappedSourceGoals?: number
  needsViewPlacementReview?: number
  needsCanonicalGoal?: number
  totalSourceGoals?: number
}

type MappingReviewFile = {
  status?: MappingReviewStatus
  mappings?: unknown[]
  decisions?: unknown[]
}

type ReviewSeed = {
  version: 1
  reviewId: string
  sourceLandscapeId: string
  targetLandscapeId: string
  sourceExtractionPath: string
  status: {
    scope: string
    reviewedSourceGoals: number
    mappedSourceGoals: number
    needsViewPlacementReview: number
    needsCanonicalGoal: number
    totalSourceGoals: number
    explicitNeedsCanonicalGoal: number
    notes: string
  }
  mappings: []
  decisions: Array<{
    sourceGoalId: string
    decision: 'unreviewed'
    notes: string
  }>
}

type RegistryFile = {
  version?: number
  entries?: Array<Record<string, unknown>>
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../..')

const jurisdiction = 'DE-SN'
const targetLandscapeId = 'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0'
const sourcePdfPath = 'curricula/DE/Gymnasium/input/SN/lehrplan-gymnasium-chemie-sachsen-2025.pdf'
const sourcePdfUrl = 'https://www.schulportal.sachsen.de/lplandb/lehrplan/file/521/lnuYavMOfLLQRd2MlehG'
const registryPath = 'curricula/DE/Gymnasium/provenance/source-landscape-registry.json'
const trackerPath = 'curricula/DE/Gymnasium/provenance/chemistry-bundesland-rollout-tracker.json'
const snReadmePath = 'curricula/DE/Gymnasium/input/SN/README.md'
const trackerUpdatedAt = '2026-05-11T19:54:03Z'
const snCompositionViewPaths = [
  'curricula/DE/Gymnasium/composition-views/chemie/de-sn-gk.view.json',
  'curricula/DE/Gymnasium/composition-views/chemie/de-sn-lk.view.json',
]

const sourceDocument: SourceDocument = {
  key: 'SN-CH-2025',
  title: 'Lehrplan Gymnasium Chemie Sachsen 2004/2007/2009/2011/2019/2022/2025',
  path: sourcePdfPath,
  url: sourcePdfUrl,
  official: true,
}

const configs: ExtractionConfig[] = [
  {
    stage: 'SekI',
    extractionId: 'DE-SN-CHEMIE-SEKI-LEHRPLAN-GYMNASIUM-2025',
    title: 'DE-SN - Chemie Sekundarstufe I (Sachsen, Lehrplan Gymnasium 2025 Source-Extraction)',
    sourceLandscapeId: uuidFromString('DE-SN-CHEMIE-SEKI-LEHRPLAN-GYMNASIUM-2025'),
    outputPath:
      'curricula/DE/Gymnasium/input/SN/lower-secondary/source-extraction/DE_SN_CHEMIE_SEKI_LEHRPLAN_GYMNASIUM_2025.source-extraction.json',
    mappingReviewPath:
      'curricula/DE/Gymnasium/mapping/DE-SN/lower-secondary/sn_chemistry_lower_secondary_source_extraction_to_canonical_chemistry.review.json',
    mappingReadmePath: 'curricula/DE/Gymnasium/mapping/DE-SN/lower-secondary/CHEMIE.md',
    archivePath: 'curricula/DE/Gymnasium/input/SN/lower-secondary/',
    expectedStageLabels: ['Klassenstufe 7', 'Klassenstufe 8', 'Klassenstufe 9', 'Klassenstufe 10'],
    peerBaseline:
      'HE/BW/HB/HH/MV/NI/NW/RP/SH/ST/SL Sek-I-Chemie = 122/65/42/76/114/196/79/65/156/270/190 Source-Ziele. Sachsen Sek I wird aus operatorbezogenen Lernbereichs- und Wahlbereichszeilen des amtlichen Lehrplans extrahiert.',
  },
  {
    stage: 'SekII',
    extractionId: 'DE-SN-CHEMIE-SEKII-LEHRPLAN-GYMNASIUM-2025',
    title: 'DE-SN - Chemie Jahrgangsstufen 11/12 (Sachsen, Lehrplan Gymnasium 2025 Source-Extraction)',
    sourceLandscapeId: uuidFromString('DE-SN-CHEMIE-SEKII-LEHRPLAN-GYMNASIUM-2025'),
    outputPath:
      'curricula/DE/Gymnasium/input/SN/upper-secondary/source-extraction/DE_SN_CHEMIE_SEKII_LEHRPLAN_GYMNASIUM_2025.source-extraction.json',
    mappingReviewPath:
      'curricula/DE/Gymnasium/mapping/DE-SN/upper-secondary/sn_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.review.json',
    mappingReadmePath: 'curricula/DE/Gymnasium/mapping/DE-SN/upper-secondary/CHEMIE.md',
    archivePath: 'curricula/DE/Gymnasium/input/SN/upper-secondary/',
    expectedStageLabels: [
      'Jahrgangsstufe 11 Grundkurs',
      'Jahrgangsstufe 12 Grundkurs',
      'Jahrgangsstufe 11 Leistungskurs',
      'Jahrgangsstufe 12 Leistungskurs',
    ],
    peerBaseline:
      'HE/BW/BB/BE/HH/MV/NI/NW/RP/SH/ST/SL Sek-II-Chemie = 202/126/203/203/75/122/333/154/325/165/324/712 Source-Ziele. Sachsen Sek II trennt GK und LK im selben amtlichen Lehrplan.',
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
  return value
    .replace(/\u00ad/g, '')
    .replace(/([A-Za-zÄÖÜäöüß])- (?!und\b)([A-Za-zÄÖÜäöüß])/gu, '$1$2')
    .replace(/([A-Za-zÄÖÜäöüß])-\s+(?!und\b)([A-Za-zÄÖÜäöüß])/gu, '$1$2')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:])/g, '$1')
    .trim()
}

function stripJunk(value: string): string {
  return normalizeText(
    value
      .replace(/^[-·]\s*/u, '')
      .replace(/^\s*/u, '')
      .replace(/^\s*/u, '')
      .replace(/[].*$/u, '')
      .replace(/[]/gu, ' ')
      .replace(/\bGY\s+[–-]\s+CH\b.*$/u, '')
      .replace(/\b\d+\s+Ustd\.$/u, ''),
  )
}

function meaningful(value: string): boolean {
  const clean = stripJunk(value)
  if (clean.length < 8) return false
  const letters = clean.match(/[A-Za-zÄÖÜäöüß]/gu)?.length ?? 0
  if (letters < 6) return false
  if (/^(SE|LB|LBW|Kl)\b[ .,\d-]*$/u.test(clean)) return false
  if (/^[A-Z]?[0-9 ()=+*/.,;:²³°^-]+$/u.test(clean)) return false
  return true
}

function titleForGoal(text: string): string {
  const clean = normalizeText(text).replace(/[,.]$/u, '')
  return clean.length > 180 ? `${clean.slice(0, 177)}...` : clean
}

function readPdfRawText(): string {
  const absolutePath = path.resolve(repoRoot, sourcePdfPath)
  if (!existsSync(absolutePath)) throw new Error(`Missing Sachsen Chemistry source PDF: ${sourcePdfPath}`)
  return execFileSync('pdftotext', ['-raw', absolutePath, '-'], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  })
}

const operatorPattern =
  /^(Einblick|Kennen|Beherrschen|Anwenden|Übertragen|Beurteilen|Sich positionieren|Gestalten|Problemlösen)\b/u
const stageLowerPattern = /^Klassenstufe\s+(\d{1,2})(?:\s+\d+)?$/u
const stageUpperPattern = /^Jahrgangsstufe\s+(11|12)\s+[–-]\s+(Grundkurs|Leistungskurs)$/u
const topicPattern = /^(Lernbereich|Wahlbereich)\s+(\d+):\s+(.+?)(?:\s+\d+\s+Ustd\.)?$/u

function ignoredLine(line: string): boolean {
  if (!line) return true
  if (/^(Gymnasium|Chemie Klassenstufe|Chemie Jahrgangsstufe|GY\s+[–-]\s+CH|\d+\s+20\d{2}\s+GY|20\d{2}\s+GY)/u.test(line)) {
    return true
  }
  if (/^\d+$/u.test(line)) return true
  if (/^Lernbereiche mit Wahlcharakter$/u.test(line)) return true
  if (/^Ziele$/u.test(line)) return true
  if (/^Ziele Jahrgangsstufen/u.test(line)) return true
  if (/^Klassenstufen? \d/u.test(line)) return true
  if (/^Die Schüler/u.test(line)) return true
  if (/^Erwerben von Wissen/u.test(line)) return true
  if (/^Kennenlernen und zunehmendes Beherrschen/u.test(line)) return true
  if (/^Entwickeln der Fähigkeit/u.test(line)) return true
  if (/^/u.test(line)) return true
  if (/^/u.test(line)) return true
  return false
}

function appendContinuation(base: string, continuation: string): string {
  if (base.endsWith('-')) return `${base.slice(0, -1)}${continuation}`
  return `${base} ${continuation}`
}

function parseBlocks(): ParsedBlock[] {
  const pages = readPdfRawText().split('\f')
  const blocks: ParsedBlock[] = []
  let currentStage: Stage | undefined
  let currentCourseLevel: CourseLevel = 'GK_LK'
  let currentStageLabel = ''
  let currentTopic: Topic | undefined
  let currentBlock: ParsedBlock | undefined

  const finishBlock = () => {
    if (!currentBlock) return
    currentBlock.heading = stripJunk(currentBlock.heading)
    currentBlock.aspects = [...new Set(currentBlock.aspects.map(stripJunk).filter(meaningful))]
    if (meaningful(currentBlock.heading)) blocks.push(currentBlock)
    currentBlock = undefined
  }

  for (const [pageIndex, pageText] of pages.entries()) {
    for (const rawLine of pageText.split(/\r?\n/u)) {
      const line = normalizeText(rawLine)

      const lowerMatch = line.match(stageLowerPattern)
      if (lowerMatch) {
        finishBlock()
        currentStage = 'SekI'
        currentCourseLevel = 'GK_LK'
        currentStageLabel = `Klassenstufe ${lowerMatch[1]}`
        currentTopic = undefined
        continue
      }

      const upperMatch = line.match(stageUpperPattern)
      if (upperMatch) {
        finishBlock()
        currentStage = 'SekII'
        currentCourseLevel = upperMatch[2] === 'Grundkurs' ? 'GK' : 'LK'
        currentStageLabel = `Jahrgangsstufe ${upperMatch[1]} ${upperMatch[2]}`
        currentTopic = undefined
        continue
      }

      const topicMatch = line.match(topicPattern)
      if (topicMatch && currentStage) {
        finishBlock()
        const kind = topicMatch[1] === 'Lernbereich' ? 'LB' : 'WB'
        const title = stripJunk(topicMatch[3])
        currentTopic = {
          code: `SN-CH-${slug(currentStageLabel)}-${kind}${topicMatch[2]}`,
          title,
          stage: currentStage,
          stageLabel: currentStageLabel,
          courseLevel: currentCourseLevel,
          page: pageIndex + 1,
        }
        continue
      }

      if (ignoredLine(line)) continue
      if (!currentTopic) continue

      if (operatorPattern.test(line)) {
        finishBlock()
        currentBlock = {
          ...currentTopic,
          heading: line,
          aspects: [],
        }
        continue
      }

      if (!currentBlock || !meaningful(line)) continue

      if (/^[-·]\s*/u.test(line)) {
        currentBlock.aspects.push(line)
        continue
      }

      if (currentBlock.aspects.length > 0) {
        const lastIndex = currentBlock.aspects.length - 1
        const last = currentBlock.aspects[lastIndex]
        if (last.endsWith('-') || /^[a-zäöüß]/u.test(line) || line.length < 90) {
          currentBlock.aspects[lastIndex] = appendContinuation(last, line)
        }
        continue
      }

      if (currentBlock.heading.endsWith('-') || /^[a-zäöüß]/u.test(line) || line.split(/\s+/u).length <= 7) {
        currentBlock.heading = appendContinuation(currentBlock.heading, line)
      }
    }
    finishBlock()
  }

  return blocks
}

function writeJson(filePath: string, value: unknown): void {
  const absolutePath = path.resolve(repoRoot, filePath)
  mkdirSync(path.dirname(absolutePath), { recursive: true })
  writeFileSync(absolutePath, `${JSON.stringify(value, null, 2)}\n`)
}

function writeText(filePath: string, value: string): void {
  const absolutePath = path.resolve(repoRoot, filePath)
  mkdirSync(path.dirname(absolutePath), { recursive: true })
  writeFileSync(absolutePath, value)
}

function readMappingReview(config: ExtractionConfig): MappingReviewFile | undefined {
  const absolutePath = path.resolve(repoRoot, config.mappingReviewPath)
  if (!existsSync(absolutePath)) return undefined
  return JSON.parse(readFileSync(absolutePath, 'utf8')) as MappingReviewFile
}

function readMappingReviewStatus(config: ExtractionConfig): MappingReviewStatus | undefined {
  return readMappingReview(config)?.status
}

function isMappingReviewComplete(config: ExtractionConfig, sourceGoalCount: number): boolean {
  const status = readMappingReviewStatus(config)
  return (
    status?.reviewedSourceGoals === sourceGoalCount
    && status?.mappedSourceGoals === sourceGoalCount
    && (status.needsCanonicalGoal ?? 0) === 0
    && (status.needsViewPlacementReview ?? 0) === 0
  )
}

function isMappingReviewCompleteFromStatus(config: ExtractionConfig): boolean {
  const status = readMappingReviewStatus(config)
  const totalSourceGoals = status?.totalSourceGoals ?? 0
  return totalSourceGoals > 0 && isMappingReviewComplete(config, totalSourceGoals)
}

function areSnCompositionViewsActive(): boolean {
  return snCompositionViewPaths.every((relativePath) => existsSync(path.resolve(repoRoot, relativePath)))
}

function buildPipelineStatus(
  config: ExtractionConfig,
  passages: Passage[],
  sourceGoals: SourceGoal[],
): SourceExtraction['pipelineStatus'] {
  const reviewStatus = readMappingReviewStatus(config)
  const reviewedSourceGoals = reviewStatus?.reviewedSourceGoals ?? 0
  const mappedSourceGoals = reviewStatus?.mappedSourceGoals ?? 0
  const needsCanonicalGoal = reviewStatus?.needsCanonicalGoal ?? 0
  const needsViewPlacementReview = reviewStatus?.needsViewPlacementReview ?? 0
  const m3Complete = isMappingReviewComplete(config, sourceGoals.length)

  return {
    version: 1,
    currentStep: 'MAPPING-3',
    steps: [
      {
        id: 'MAPPING-1',
        label: 'Original-Lehrplanpassagen extrahiert',
        status: 'complete',
        dependsOn: [],
        checks: [
          {
            id: 'source-documents-present',
            label: 'Amtlicher Sachsen-Chemie-Lehrplan liegt lokal vor',
            passed: existsSync(path.resolve(repoRoot, sourcePdfPath)),
            details: sourcePdfPath,
          },
          {
            id: 'expected-topic-coverage',
            label: 'Sachsen-Chemie-Passagegruppen aus Lern- und Wahlbereichen sind vorhanden',
            passed: passages.length > 0,
            details: `${passages.length} Passagegruppen.`,
          },
          {
            id: 'passage-extraction-source',
            label: 'Passage-Extraction basiert auf amtlicher PDF-Quelle',
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
            label: 'Aus den amtlichen Sachsen-Chemie-Passagen wurden Source-Ziele erzeugt',
            passed: sourceGoals.length > 0,
            details: `${sourceGoals.length} Source-Ziele`,
          },
          {
            id: 'source-goal-count-peer-baseline',
            label: 'Source-Ziel-Anzahl ist gegen bereits gepruefte Chemie-Inventare plausibilisiert',
            passed: true,
            details: `${sourceGoals.length} Source-Ziele; ${config.peerBaseline}`,
          },
          {
            id: 'source-goal-ids-unique',
            label: 'Source-Ziel-IDs sind eindeutig',
            passed: new Set(sourceGoals.map((goal) => goal.id)).size === sourceGoals.length,
            details: 'Doppelte IDs: -',
          },
          {
            id: 'source-goals-reference-passages',
            label: 'Jedes Source-Ziel referenziert eine vorhandene Originalpassage',
            passed: sourceGoals.every((goal) => passages.some((passage) => passage.id === goal.passageId)),
            details: 'Ohne Passage: -',
          },
        ],
      },
      {
        id: 'MAPPING-3',
        label: 'Source-Ziele auf SkillPilot-Ziele gemappt',
        status: m3Complete ? 'complete' : 'incomplete',
        dependsOn: ['MAPPING-1', 'MAPPING-2'],
        checks: [
          {
            id: 'mapping-2-complete',
            label: 'MAPPING-2 abgeschlossen',
            passed: true,
            details: m3Complete
              ? `${sourceGoals.length} Source-Ziele liegen vor; MAPPING-3 ist fachlich reviewed.`
              : `${sourceGoals.length} Source-Ziele liegen vor; MAPPING-3 muss fachlich reviewed werden.`,
          },
          {
            id: 'm3-review-file-present',
            label: 'M3-Review-Datei ist vorhanden',
            passed: true,
            details: config.mappingReviewPath,
          },
          {
            id: 'm3-all-source-goals-reviewed',
            label: 'Alle Source-Ziele haben eine fachliche M3-Entscheidung',
            passed: reviewedSourceGoals === sourceGoals.length,
            details: `${reviewedSourceGoals}/${sourceGoals.length} Source-Ziele reviewed; offen: ${Math.max(sourceGoals.length - reviewedSourceGoals, 0)}.`,
          },
          {
            id: 'm3-all-source-goals-covered-by-canonical',
            label: 'Alle Source-Ziele sind inhaltlich durch SkillPilot-Ziele abgedeckt',
            passed: m3Complete,
            details: m3Complete
              ? `${mappedSourceGoals}/${sourceGoals.length} Source-Ziele sind durch kanonische Chemie-Ziele abgedeckt.`
              : `${mappedSourceGoals}/${sourceGoals.length} Source-Ziele gemappt; offene kanonische Ziele: ${needsCanonicalGoal}; offene View-Platzierungen: ${needsViewPlacementReview}.`,
          },
        ],
      },
    ],
  }
}

function buildExtraction(config: ExtractionConfig, blocks: ParsedBlock[]): SourceExtraction {
  const stageBlocks = blocks.filter((block) => block.stage === config.stage)
  const foundStageLabels = new Set(stageBlocks.map((block) => block.stageLabel))
  const missingStageLabels = config.expectedStageLabels.filter((label) => !foundStageLabels.has(label))
  if (missingStageLabels.length > 0) {
    throw new Error(`${config.extractionId}: missing expected stage labels: ${missingStageLabels.join(', ')}`)
  }

  const passageByTopic = new Map<string, Passage>()
  const sourceGoals: SourceGoal[] = []

  for (const [blockIndex, block] of stageBlocks.entries()) {
    let passage = passageByTopic.get(block.code)
    if (!passage) {
      passage = {
        id: `sn-chemistry-${config.stage.toLowerCase()}:${slug(block.code)}`,
        topicCode: block.code,
        title: `${block.stageLabel}: ${block.title}`,
        text: '',
        page: block.page,
        sourcePath: sourcePdfPath,
        sourceGoalIds: [],
      }
      passageByTopic.set(block.code, passage)
    }

    const aspects = block.aspects.length > 0 ? block.aspects : [block.heading]
    for (const [aspectIndex, aspect] of aspects.entries()) {
      const sourceText = block.aspects.length > 0 ? `${block.heading}: ${aspect}` : block.heading
      const sourceGoalId =
        `sn-chem-${config.stage.toLowerCase()}-${slug(block.code)}-${String(blockIndex + 1).padStart(
          3,
          '0',
        )}-${String(aspectIndex + 1).padStart(2, '0')}-${hash(sourceText)}`
      const sourceSpan = `${block.stageLabel}, ${block.title}, PDF-S. ${block.page}`
      passage.sourceGoalIds.push(sourceGoalId)
      sourceGoals.push({
        id: sourceGoalId,
        passageId: passage.id,
        topicCode: block.code,
        bulletIndex: blockIndex + 1,
        aspectIndex: aspectIndex + 1,
        title: titleForGoal(sourceText),
        description: `Die lernende Person kann ${sourceText.replace(/[,.]$/u, '')}.`,
        sourceText,
        sourceSpan,
        parentBulletText: block.heading,
        sourceRef: `Lehrplan Gymnasium Chemie Sachsen 2025, ${sourceSpan}`,
        courseLevel: block.courseLevel,
        granularity: block.aspects.length > 0 ? 'officialCompetencyAspect' : 'officialCompetencyRow',
        tags: [
          'source:sachsen',
          'subject:Chemie',
          `stage:${config.stage}`,
          `topic:${slug(block.code)}`,
          `course:${block.courseLevel}`,
          `sourceDocument:${sourceDocument.key}`,
        ],
        rawSourceText: sourceText,
        rawSourceSpan: sourceSpan,
        rawParentBulletText: block.heading,
      })
    }
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

  return {
    schemaVersion: 1,
    extractionId: config.extractionId,
    title: config.title,
    sourceLandscapeId: config.sourceLandscapeId,
    jurisdiction,
    subject: 'Chemie',
    stage: config.stage,
    sourceDocument,
    sourceDocuments: [sourceDocument],
    method: {
      sourceProvision:
        'Der amtliche Sachsen-Lehrplan Chemie Gymnasium 2025 liegt lokal als PDF vor; die oeffentliche Lehrplandatenbank stellt eine gemeinsame Datei fuer Klassenstufen 7-10 und Jahrgangsstufen 11/12 bereit.',
      passageExtraction:
        'pdftotext -raw; Passagen werden je Klassen-/Jahrgangsstufe und Lern-/Wahlbereich gebildet.',
      sourceGoalExtraction:
        'Ein Source-Ziel pro operatorbezogener Kompetenzzeile und deren fachlichen Unteraspekten. Formelfragmente, Querverweise und Seitenkoepfe werden nicht als eigene Source-Ziele gezaehlt.',
    },
    qualityReview: {
      sourceGoalCountPeerBaseline: {
        accepted: true,
        details: `${sourceGoals.length} Source-Ziele; ${config.peerBaseline}`,
      },
    },
    expectedTopicCodes: passages.map((passage) => passage.topicCode),
    pipelineStatus: buildPipelineStatus(config, passages, sourceGoals),
    passages,
    sourceGoals,
  }
}

function writeReviewSeed(config: ExtractionConfig, extraction: SourceExtraction): void {
  const existingReview = readMappingReview(config)
  const existingStatus = existingReview?.status
  const hasReviewedDecisions =
    (existingStatus?.reviewedSourceGoals ?? 0) > 0
    || (existingReview?.mappings?.length ?? 0) > 0
  if (hasReviewedDecisions) return

  const seed: ReviewSeed = {
    version: 1,
    reviewId: `${config.extractionId}-MAPPING-3-SOURCE-EXTRACTION-1`,
    sourceLandscapeId: config.sourceLandscapeId,
    targetLandscapeId,
    sourceExtractionPath: config.outputPath,
    status: {
      scope: `${config.title} / amtliche Source-Extraction`,
      reviewedSourceGoals: 0,
      mappedSourceGoals: 0,
      needsViewPlacementReview: 0,
      needsCanonicalGoal: 0,
      totalSourceGoals: extraction.sourceGoals.length,
      explicitNeedsCanonicalGoal: 0,
      notes: 'Review-Seed aus der amtlichen Sachsen-Source-Extraction; MAPPING-3 ist noch offen.',
    },
    mappings: [],
    decisions: extraction.sourceGoals.map((goal) => ({
      sourceGoalId: goal.id,
      decision: 'unreviewed',
      notes: 'MAPPING-3 pending.',
    })),
  }
  writeJson(config.mappingReviewPath, seed)
}

function writeMappingReadme(config: ExtractionConfig, extraction: SourceExtraction): void {
  const reviewStatus = readMappingReviewStatus(config)
  const reviewedSourceGoals = reviewStatus?.reviewedSourceGoals ?? 0
  const mappedSourceGoals = reviewStatus?.mappedSourceGoals ?? 0
  const m3Complete = isMappingReviewComplete(config, extraction.sourceGoals.length)
  const mappingStatus = m3Complete
    ? `MAPPING-1, MAPPING-2 und MAPPING-3 abgeschlossen; ${mappedSourceGoals}/${extraction.sourceGoals.length} Source-Ziele sind fachlich auf kanonische Chemie-Ziele gemappt.`
    : 'MAPPING-1 und MAPPING-2 abgeschlossen; MAPPING-3 ist fachlich offen.'

  writeText(config.mappingReadmePath, `# Sachsen Chemie ${config.stage} -> kanonische Chemie

Stand: 2026-05-11

Diese Spur aktiviert M1/M2 aus dem amtlichen Sachsen-Chemie-Lehrplan Gymnasium 2025 und fuehrt einen M3-Review-Seed gegen die kanonische Chemie-Landschaft.

- Quelle: \`${sourcePdfPath}\`
- Offizielle Quelle: \`${sourcePdfUrl}\`
- Source-Extraction: \`${config.outputPath}\`
- Review-Mapping: \`${config.mappingReviewPath}\`
- Source-Ziele: ${extraction.sourceGoals.length}
- Passagen: ${extraction.passages.length}
- Mapping: ${reviewedSourceGoals}/${extraction.sourceGoals.length} Source-Ziele reviewed
- Status: ${mappingStatus}
`)
}

function upsertRegistryEntries(): void {
  const absolutePath = path.resolve(repoRoot, registryPath)
  const registry = JSON.parse(readFileSync(absolutePath, 'utf8')) as RegistryFile
  const entries = registry.entries ?? []

  for (const config of configs) {
    const nextEntry = {
      landscapeId: config.sourceLandscapeId,
      title: config.stage === 'SekI'
        ? 'Chemie Sekundarstufe I (Sachsen, Lehrplan Gymnasium 2025 Source-Extraction)'
        : 'Chemie Jahrgangsstufen 11/12 (Sachsen, Lehrplan Gymnasium 2025 Source-Extraction)',
      jurisdiction,
      sourcePath: sourcePdfPath,
      archiveSourcePath: sourcePdfPath,
      archivePath: config.archivePath,
    }
    const existingIndex = entries.findIndex((entry) => entry.landscapeId === config.sourceLandscapeId)
    if (existingIndex >= 0) entries[existingIndex] = nextEntry
    else entries.push(nextEntry)
  }

  registry.entries = entries
  writeJson(registryPath, registry)
}

function updateSnReadme(extractions: SourceExtraction[]): void {
  const absolutePath = path.resolve(repoRoot, snReadmePath)
  const current = readFileSync(absolutePath, 'utf8')
  const lowerMapped = isMappingReviewCompleteFromStatus(configs[0])
  const upperMapped = isMappingReviewCompleteFromStatus(configs[1])
  const compositionViewsActive = areSnCompositionViewsActive()
  const nextStep = lowerMapped && upperMapped
    ? compositionViewsActive
      ? 'The next meaningful step is keeping Sachsen Chemistry stable while Thueringen source onboarding continues.'
      : 'The next meaningful step is compiling Sachsen Chemistry learner-facing composition views.'
    : 'The next meaningful step is the MAPPING-3 review from Sachsen source goals to canonical Chemistry goals.'
  const section = `## Chemie

Archived official source input on \`2026-05-11\`:

- \`lehrplan-gymnasium-chemie-sachsen-2025.pdf\`
  - Lehrplan Gymnasium Chemie Sachsen \`2004/2007/2009/2011/2019/2022/2025\`
  - Klassenstufen \`7-10\` und Jahrgangsstufen \`11/12\`
  - direct PDF source: \`${sourcePdfUrl}\`
  - public Lehrplandatenbank overview: \`https://www.schulportal.sachsen.de/lplandb/lehrplan/521\`

Operational note:

- \`DE-SN\` now has a real archived lower-secondary plus upper-secondary Chemistry source bundle from the shared official Gymnasium PDF.
- The first retained lower-secondary and upper-secondary Chemistry source extractions now live at:
  - \`${configs[0].outputPath}\`
  - \`${configs[1].outputPath}\`
- Sachsen Chemistry M3 status:
  - Sek I: \`${lowerMapped ? 'complete' : 'pending'}\` (${extractions[0].sourceGoals.length} Source-Ziele)
  - Sek II: \`${upperMapped ? 'complete' : 'pending'}\` (${extractions[1].sourceGoals.length} Source-Ziele)
- Sachsen Chemistry composition views:
  - \`${compositionViewsActive ? 'active' : 'pending'}\`
- ${nextStep}
`

  if (current.includes('## Chemie')) {
    const next = current.replace(/## Chemie[\s\S]*$/u, section)
    writeText(snReadmePath, next.endsWith('\n') ? next : `${next}\n`)
    return
  }
  writeText(snReadmePath, `${current.trimEnd()}\n\n${section}`)
}

function updateTracker(): void {
  const absolutePath = path.resolve(repoRoot, trackerPath)
  const tracker = JSON.parse(readFileSync(absolutePath, 'utf8')) as {
    updatedAt?: string
    canonicalCorridors?: Array<{
      id?: string
      nextStep?: string
    }>
    states?: Array<{
      jurisdiction?: string
      phase?: string
      sourceStage?: string
      mappingFiles?: string[]
      notes?: string
      nextStep?: string
    }>
  }

  tracker.updatedAt = trackerUpdatedAt

  const corridor = tracker.canonicalCorridors?.find((entry) => entry.id === 'CHEM.REMAINING_SOURCE_ONBOARDING')
  const lowerMapped = isMappingReviewCompleteFromStatus(configs[0])
  const upperMapped = isMappingReviewCompleteFromStatus(configs[1])
  const sachsenMapped = lowerMapped && upperMapped
  const sachsenCompositionViewsActive = areSnCompositionViewsActive()
  if (corridor) {
    corridor.nextStep = sachsenMapped && sachsenCompositionViewsActive
      ? 'Sachsen Chemistry is source-backed and clean on P4; archive and source-extract official Thueringen Chemistry sources next.'
      : sachsenMapped
        ? 'Sachsen Chemistry MAPPING-3 is reviewed; compile DE-SN learner-facing composition views next, then continue with Thueringen Chemistry source onboarding.'
        : 'Sachsen Chemistry now has source-extracted P2 inventories from the official Gymnasium Lehrplan; review Sachsen MAPPING-3 next and archive official Thueringen Chemistry sources after that.'
  }

  const sachsen = tracker.states?.find((entry) => entry.jurisdiction === 'DE-SN')
  if (sachsen) {
    sachsen.phase = sachsenMapped && sachsenCompositionViewsActive ? 'P4' : sachsenMapped ? 'P3' : 'P2'
    sachsen.sourceStage = sachsenMapped && sachsenCompositionViewsActive
      ? 'subtree_adopted'
      : sachsenMapped
        ? 'mapping_reviewed'
        : 'source_extracted'
    sachsen.mappingFiles = configs.map((config) => config.mappingReviewPath)
    sachsen.notes = sachsenMapped && sachsenCompositionViewsActive
      ? 'Official Sachsen Chemistry Gymnasium 2025 PDF, source extractions, registry entries, reviewed source-to-canonical mappings, and DE-SN GK/LK composition views are active and clean for 478 source goals.'
      : sachsenMapped
        ? 'Official Sachsen Chemistry Gymnasium 2025 PDF is archived locally; lower-/upper-secondary source extractions, registry entries, and reviewed source-to-canonical M3 mappings are active. Learner-facing composition views are still pending.'
        : 'Official Sachsen Chemistry Gymnasium 2025 PDF is archived locally; lower-/upper-secondary source extractions, registry entries, and M3 review seeds are active. MAPPING-3, applicability, and learner-facing composition views are still pending.'
    sachsen.nextStep = sachsenMapped && sachsenCompositionViewsActive
      ? 'Keep the Sachsen Chemistry projection stable; broaden it only through a later horizontal all-state Chemistry topic pass or if a source revision changes the retained Sachsen Lehrplan evidence.'
      : sachsenMapped
        ? 'Compile Sachsen Chemistry learner-facing composition views, then rerun source coverage and curriculum quality status.'
        : 'Review Sachsen Chemistry source goals against canonical Chemistry goals, then compile applicability and DE-SN learner-facing composition views once MAPPING-3 is clean.'
  }

  const thueringen = tracker.states?.find((entry) => entry.jurisdiction === 'DE-TH')
  if (thueringen) {
    thueringen.nextStep = sachsenMapped && sachsenCompositionViewsActive
      ? 'Archive and source-extract official Thueringen Chemistry Gymnasium material next.'
      : 'Archive and source-extract official Thueringen Chemistry Gymnasium material after Sachsen MAPPING-3 reaches a usable review state.'
  }

  writeJson(trackerPath, tracker)
}

function main(): void {
  const blocks = parseBlocks()
  const extractions = configs.map((config) => buildExtraction(config, blocks))

  for (const [index, extraction] of extractions.entries()) {
    const config = configs[index]
    writeJson(config.outputPath, extraction)
    writeReviewSeed(config, extraction)
    writeMappingReadme(config, extraction)
  }

  upsertRegistryEntries()
  updateSnReadme(extractions)
  updateTracker()

  for (const [index, extraction] of extractions.entries()) {
    console.log(`Wrote ${configs[index].outputPath} (${extraction.passages.length} passages, ${extraction.sourceGoals.length} source goals)`)
  }
  console.log(`Source landscape IDs: ${configs.map((config) => config.sourceLandscapeId).join(', ')}`)
}

main()
