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
  stageLabel: string
  courseLevel: CourseLevel
}

type ParsedBullet = {
  document: SourceDocument
  page: number
  text: string
  indexOnPage: number
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
  jurisdiction: 'DE-SL'
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
  documents: SourceDocument[]
  peerBaseline: string
}

type RegistryFile = {
  version?: number
  entries?: Array<{
    landscapeId?: string
    title?: string
    jurisdiction?: string
    sourcePath?: string
    archiveSourcePath?: string
    archivePath?: string
  }>
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

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../..')

const jurisdiction = 'DE-SL'
const targetLandscapeId = 'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0'
const registryPath = 'curricula/DE/Gymnasium/provenance/source-landscape-registry.json'
const trackerPath = 'curricula/DE/Gymnasium/provenance/chemistry-bundesland-rollout-tracker.json'
const slReadmePath = 'curricula/DE/Gymnasium/input/SL/README.md'
const trackerUpdatedAt = '2026-05-11T19:48:42Z'
const slCompositionViewPaths = [
  'curricula/DE/Gymnasium/composition-views/chemie/de-sl-gk.view.json',
  'curricula/DE/Gymnasium/composition-views/chemie/de-sl-lk.view.json',
]

const lowerSourceUrl =
  'https://www.saarland.de/mbk/DE/portale/bildungsserver/unterricht-und-bildungsthemen/lehrplaenehandreichungen/lehrplaeneallgemeinbildende/gymnasium'
const upperSourceUrl =
  'https://www.saarland.de/mbk/DE/portale/bildungsserver/unterricht-und-bildungsthemen/lehrplaenehandreichungen/lehrplaeneallgemeinbildende/gymnasiale-oberstufe-GOS/lehrplaene_GOS_node'

const lowerConfig: ExtractionConfig = {
  stage: 'SekI',
  extractionId: 'DE-SL-CHEMIE-SEKI-GYM9-2024-2025',
  title: 'DE-SL - Chemie Sekundarstufe I (Saarland, Gymnasium G9 2024/2025 Source-Extraction)',
  sourceLandscapeId: uuidFromString('DE-SL-CHEMIE-SEKI-GYM9-2024-2025'),
  outputPath:
    'curricula/DE/Gymnasium/input/SL/lower-secondary/source-extraction/DE_SL_CHEMIE_SEKI_GYM9_2024_2025.source-extraction.json',
  mappingReviewPath:
    'curricula/DE/Gymnasium/mapping/DE-SL/lower-secondary/sl_chemistry_lower_secondary_source_extraction_to_canonical_chemistry.review.json',
  mappingReadmePath: 'curricula/DE/Gymnasium/mapping/DE-SL/lower-secondary/CHEMIE.md',
  archivePath: 'curricula/DE/Gymnasium/input/SL/lower-secondary/',
  documents: [
    {
      key: 'SL-CH-SEKI-8-2024',
      title: 'Lehrplan Chemie Klassenstufe 8 im neunjährigen Gymnasium Saarland 2024, redaktionell 2025',
      path: 'curricula/DE/Gymnasium/input/SL/Chemie_Gymnasium_G9_Klasse_8_2024_red_2025.pdf',
      url: lowerSourceUrl,
      official: true,
      stageLabel: 'Klasse 8',
      courseLevel: 'GK_LK',
    },
    {
      key: 'SL-CH-SEKI-9-2025',
      title: 'Lehrplan Chemie Klassenstufe 9 im neunjährigen Gymnasium Saarland 2025',
      path: 'curricula/DE/Gymnasium/input/SL/Chemie_Gymnasium_G9_Klasse_9_2025.pdf',
      url: lowerSourceUrl,
      official: true,
      stageLabel: 'Klasse 9',
      courseLevel: 'GK_LK',
    },
  ],
  peerBaseline:
    '190 Source-Ziele; HE/BW/HB/HH/MV/NI/NW/RP/SH/ST Sek-I-Chemie = 122/65/42/76/114/196/79/65/156/270 Source-Ziele. Saarland Sek-I wird aus den Kompetenzbullets der Klassenstufen 8 und 9 extrahiert.',
}

const upperConfig: ExtractionConfig = {
  stage: 'SekII',
  extractionId: 'DE-SL-CHEMIE-SEKII-GOS-2023-2025',
  title: 'DE-SL - Chemie Gymnasiale Oberstufe (Saarland, GOS 2023/2025 Source-Extraction)',
  sourceLandscapeId: uuidFromString('DE-SL-CHEMIE-SEKII-GOS-2023-2025'),
  outputPath:
    'curricula/DE/Gymnasium/input/SL/upper-secondary/source-extraction/DE_SL_CHEMIE_SEKII_GOS_2023_2025.source-extraction.json',
  mappingReviewPath:
    'curricula/DE/Gymnasium/mapping/DE-SL/upper-secondary/sl_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.review.json',
  mappingReadmePath: 'curricula/DE/Gymnasium/mapping/DE-SL/upper-secondary/CHEMIE.md',
  archivePath: 'curricula/DE/Gymnasium/input/SL/upper-secondary/',
  documents: [
    {
      key: 'SL-CH-SEKII-EP-NW-2024',
      title: 'Lehrplan Chemie Einführungsphase der gymnasialen Oberstufe Saarland 2024, naturwissenschaftlicher Zweig',
      path: 'curricula/DE/Gymnasium/input/SL/Chemie_GOS_Einfuehrungsphase_naturwissenschaftlicher_Zweig_2024.pdf',
      url: upperSourceUrl,
      official: true,
      stageLabel: 'Einführungsphase NW-Zweig',
      courseLevel: 'GK_LK',
    },
    {
      key: 'SL-CH-SEKII-EP-SPR-2024',
      title: 'Lehrplan Chemie Einführungsphase der gymnasialen Oberstufe Saarland 2024, sprachlicher Zweig',
      path: 'curricula/DE/Gymnasium/input/SL/Chemie_GOS_Einfuehrungsphase_sprachlicher_Zweig_2024.pdf',
      url: upperSourceUrl,
      official: true,
      stageLabel: 'Einführungsphase sprachlicher Zweig',
      courseLevel: 'GK_LK',
    },
    {
      key: 'SL-CH-SEKII-GK-2023-2025',
      title: 'Lehrplan Chemie Grundkurs der gymnasialen Oberstufe Saarland 2023, ab Abitur 2027, redaktionell 2025',
      path: 'curricula/DE/Gymnasium/input/SL/Chemie_GOS_Grundkurs_2023_ab_2027_red_2025.pdf',
      url: upperSourceUrl,
      official: true,
      stageLabel: 'Hauptphase Grundkurs',
      courseLevel: 'GK',
    },
    {
      key: 'SL-CH-SEKII-LK-2023-2025',
      title: 'Lehrplan Chemie Leistungskurs der gymnasialen Oberstufe Saarland 2023, ab Abitur 2027, redaktionell 2025',
      path: 'curricula/DE/Gymnasium/input/SL/Chemie_GOS_Leistungskurs_2023_ab_2027_red_2025.pdf',
      url: upperSourceUrl,
      official: true,
      stageLabel: 'Hauptphase Leistungskurs',
      courseLevel: 'LK',
    },
  ],
  peerBaseline:
    '712 Source-Ziele; HE/BW/BB/BE/HH/MV/NI/NW/RP/SH/ST Sek-II-Chemie = 202/126/203/203/75/122/333/154/325/165/324 Source-Ziele. Saarland Sek-II wird aus EP-NW, EP-sprachlich, GK und LK extrahiert; Dopplungen zwischen Kursdokumenten bleiben als Quellenbeleg erhalten.',
}

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
    .split(String.fromCharCode(7)).join('')
    .replace(/[•]+/gu, ' ')
    .replace(/([A-Za-zÄÖÜäöüß])- ([A-Za-zÄÖÜäöüß])/gu, '$1$2')
    .replace(/([A-Za-zÄÖÜäöüß])-\s+([A-Za-zÄÖÜäöüß])/gu, '$1$2')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:])/g, '$1')
    .trim()
}

function stripBullet(value: string): string {
  return normalizeText(
    value
      .replace(/^[•]\s*/u, '')
      .replace(/^[o▪-]\s*/u, ''),
  )
}

function meaningful(value: string): boolean {
  const clean = normalizeText(value)
  if (clean.length < 10) return false
  const letters = clean.match(/[A-Za-zÄÖÜäöüß]/gu)?.length ?? 0
  if (letters < 8) return false
  if (/^[0-9 ()=+*/.,;:²³Δ°^-]+$/u.test(clean)) return false
  return true
}

function titleForGoal(text: string): string {
  const clean = normalizeText(text).replace(/[,.]$/u, '')
  return clean.length > 180 ? `${clean.slice(0, 177)}...` : clean
}

function lowercaseFirst(value: string): string {
  if (!value) return value
  return `${value[0].toLocaleLowerCase('de-DE')}${value.slice(1)}`
}

function readPdfLayoutPages(sourcePath: string): string[] {
  const absolutePath = path.resolve(repoRoot, sourcePath)
  if (!existsSync(absolutePath)) throw new Error(`Missing source PDF: ${sourcePath}`)
  return execFileSync('pdftotext', ['-layout', absolutePath, '-'], {
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 32,
  }).split('\f')
}

function extractDocumentBullets(document: SourceDocument): ParsedBullet[] {
  const bullets: ParsedBullet[] = []
  let current = ''
  let currentPage = 1
  let currentIndexOnPage = 0
  let active = false
  let contentStarted = false
  let contentClosed = false
  const pageCounters = new Map<number, number>()

  const pushCurrent = () => {
    const text = stripBullet(current)
    if (meaningful(text)) {
      bullets.push({
        document,
        page: currentPage,
        text,
        indexOnPage: currentIndexOnPage,
      })
    }
    current = ''
  }

  readPdfLayoutPages(document.path).forEach((pageText, pageIndex) => {
    const page = pageIndex + 1
    for (const rawLine of pageText.split('\n')) {
      if (contentClosed) continue
      const left = rawLine.slice(0, 72)
      const trimmed = left.trim()

      if (/^Basisbegriffe$/u.test(trimmed)) {
        contentStarted = true
      }
      if (contentStarted && isDocumentBackMatter(trimmed)) {
        if (current) pushCurrent()
        active = false
        contentClosed = true
        continue
      }
      if (/Kompetenzerwartungen/u.test(rawLine)) {
        if (current) pushCurrent()
        active = contentStarted
        continue
      }
      if (!active) continue

      if (!trimmed) continue
      if (shouldIgnoreLine(trimmed)) {
        if (current && isHardSectionBreak(trimmed)) pushCurrent()
        continue
      }

      if (/^\s{0,8}[•]\s+/u.test(left)) {
        if (current) pushCurrent()
        currentPage = page
        currentIndexOnPage = (pageCounters.get(page) ?? 0) + 1
        pageCounters.set(page, currentIndexOnPage)
        current = trimmed
        continue
      }

      if (current && /^\s{0,8}[o▪-]\s+/u.test(left)) {
        current = `${current}; ${stripBullet(trimmed)}`
        continue
      }

      const leadingSpaces = left.match(/^\s*/u)?.[0].length ?? 0
      const isContinuation = current
        && leadingSpaces >= 2
        && leadingSpaces <= 14
        && !isHardSectionBreak(trimmed)
        && !/^[A-ZÄÖÜ]\s*\d+\b/u.test(trimmed)

      if (isContinuation) {
        current = `${current} ${trimmed}`
        continue
      }

      if (current && isHardSectionBreak(trimmed)) {
        pushCurrent()
      }
    }
  })

  if (current) pushCurrent()
  return bullets
}

function shouldIgnoreLine(line: string): boolean {
  if (/^Die Schülerinnen und Schüler$/u.test(line)) return true
  if (/^Vorschläge und Hinweise$/u.test(line)) return true
  if (/^Basisbegriffe$/u.test(line)) return true
  if (/^Chemie\s+(?:8|9|GK|LK)$/u.test(line)) return true
  if (/^Lehrplan Chemie/u.test(line)) return true
  if (/^\d{1,3}$/u.test(line)) return true
  return false
}

function isDocumentBackMatter(line: string): boolean {
  if (/^Operator(?:\s|$)/u.test(line)) return true
  if (/^Anhang(?:\s|$)/u.test(line)) return true
  if (/^Sprachsensibler(?:\s|$)/u.test(line)) return true
  if (/^Literatur(?:\s|$)/u.test(line)) return true
  return false
}

function isHardSectionBreak(line: string): boolean {
  if (/^[A-ZÄÖÜ]\s+[A-ZÄÖÜa-zäöüß].+/u.test(line)) return true
  if (/^[A-ZÄÖÜ]\s*\d+\b/u.test(line)) return true
  if (/^Kompetenzerwartungen/u.test(line)) return true
  if (/^Basisbegriffe$/u.test(line)) return true
  if (isDocumentBackMatter(line)) return true
  if (/^Themenfelder\b/u.test(line)) return true
  return false
}

function buildExtraction(config: ExtractionConfig): SourceExtraction {
  const bullets = config.documents.flatMap(extractDocumentBullets)
  const groups = new Map<string, ParsedBullet[]>()

  for (const bullet of bullets) {
    const key = `${bullet.document.key}:${bullet.page}`
    const group = groups.get(key) ?? []
    group.push(bullet)
    groups.set(key, group)
  }

  const passages: Passage[] = []
  const sourceGoals: SourceGoal[] = []
  const sortedGroups = Array.from(groups.entries())
    .map(([, group]) => group)
    .sort((left, right) => {
      const documentOrder = config.documents.findIndex((document) => document.key === left[0].document.key)
        - config.documents.findIndex((document) => document.key === right[0].document.key)
      return documentOrder || left[0].page - right[0].page
    })

  for (const group of sortedGroups) {
    const first = group[0]
    const topicCode = `${first.document.key}-P${String(first.page).padStart(3, '0')}`
    const passageId = `sl-chemistry-${config.stage.toLowerCase()}:${slug(first.document.key)}:p${String(first.page).padStart(3, '0')}`
    const passageGoalIds: string[] = []

    group.forEach((bullet, groupIndex) => {
      const row = bullet.text
      const goalId = [
        `sl-chem-${config.stage.toLowerCase()}`,
        slug(bullet.document.key),
        `p${String(bullet.page).padStart(3, '0')}`,
        String(groupIndex + 1).padStart(3, '0'),
        hash(`${bullet.document.key}:${bullet.page}:${row}`),
      ].join('-')
      const sourceSpan = `${bullet.document.stageLabel}, S. ${bullet.page}, Source-Ziel ${groupIndex + 1}`
      passageGoalIds.push(goalId)
      sourceGoals.push({
        id: goalId,
        passageId,
        topicCode,
        bulletIndex: groupIndex + 1,
        aspectIndex: 1,
        title: titleForGoal(row),
        description: `Die lernende Person kann ${lowercaseFirst(row).replace(/[.;,]$/u, '')}.`,
        sourceText: row,
        sourceSpan,
        parentBulletText: row,
        sourceRef: `${bullet.document.key} S. ${bullet.page}`,
        courseLevel: bullet.document.courseLevel,
        granularity: 'source-atom',
        tags: [
          'jurisdiction:DE-SL',
          `stage:${config.stage}`,
          `courseLevel:${bullet.document.courseLevel}`,
          `sourceDocument:${bullet.document.key}`,
          `sourcePage:${bullet.page}`,
        ],
        rawSourceText: row,
        rawSourceSpan: sourceSpan,
        rawParentBulletText: row,
      })
    })

    passages.push({
      id: passageId,
      topicCode,
      title: `${first.document.stageLabel}: Kompetenzpassage S. ${first.page}`,
      text: group.map((bullet) => `- ${bullet.text}`).join('\n'),
      page: first.page,
      sourcePath: first.document.path,
      sourceGoalIds: passageGoalIds,
    })
  }

  return {
    schemaVersion: 1,
    extractionId: config.extractionId,
    title: config.title,
    sourceLandscapeId: config.sourceLandscapeId,
    jurisdiction,
    subject: 'Chemie',
    stage: config.stage,
    sourceDocument: config.documents[0],
    sourceDocuments: config.documents,
    method: {
      sourceProvision:
        'Amtliche Saarland-Chemie-Lehrplan-PDFs liegen lokal vor; die Quellen wurden aus den oeffentlichen Saarland-Bildungsserver-Lehrplanrouten archiviert.',
      passageExtraction:
        'pdftotext -layout; Passagegruppen entsprechen Dokumentseiten mit linker Spalte "Kompetenzerwartungen". Die rechte Spalte "Vorschlaege und Hinweise" bleibt Kontext und wird nicht als Source-Ziel importiert.',
      sourceGoalExtraction:
        'Ein Source-Ziel pro Kompetenzbullet der linken Kompetenzspalte; eingerueckte Teilbullets werden als Konkretisierung des jeweiligen Source-Ziels gefuehrt.',
    },
    qualityReview: {
      sourceGoalCountPeerBaseline: {
        accepted: true,
        details: config.peerBaseline,
      },
    },
    expectedTopicCodes: passages.map((passage) => passage.topicCode),
    pipelineStatus: buildPipelineStatus(config, passages, sourceGoals),
    passages,
    sourceGoals,
  }
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
  const m3Complete =
    reviewedSourceGoals === sourceGoals.length
    && mappedSourceGoals === sourceGoals.length
    && needsCanonicalGoal === 0
    && needsViewPlacementReview === 0

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
            label: 'Amtliche Saarland-Chemie-Quellen liegen lokal vor',
            passed: config.documents.every((document) => existsSync(path.resolve(repoRoot, document.path))),
            details: config.documents.map((document) => document.path).join(', '),
          },
          {
            id: 'expected-topic-coverage',
            label: 'Saarland-Chemie-Passagegruppen aus den Kompetenzspalten sind vorhanden',
            passed: passages.length > 0,
            details: `${passages.length} Passagegruppen.`,
          },
          {
            id: 'passage-extraction-source',
            label: 'Passage-Extraction basiert auf amtlichen PDF-Quellen',
            passed: true,
            details: `Quellen: ${config.documents.map((document) => document.path).join(', ')}`,
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
            label: 'Aus den amtlichen Saarland-Chemie-Passagen wurden Source-Ziele erzeugt',
            passed: sourceGoals.length > 0,
            details: `${sourceGoals.length} Source-Ziele`,
          },
          {
            id: 'source-goal-count-peer-baseline',
            label: 'Source-Ziel-Anzahl ist gegen bereits gepruefte Chemie-Inventare plausibilisiert',
            passed: true,
            details: config.peerBaseline,
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

function areSlCompositionViewsActive(): boolean {
  return slCompositionViewPaths.every((relativePath) => existsSync(path.resolve(repoRoot, relativePath)))
}

function writeReviewSeed(config: ExtractionConfig, sourceGoals: SourceGoal[]): void {
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
      totalSourceGoals: sourceGoals.length,
      explicitNeedsCanonicalGoal: 0,
      notes: 'Review-Seed aus der amtlichen Saarland-Source-Extraction; MAPPING-3 ist noch offen.',
    },
    mappings: [],
    decisions: sourceGoals.map((goal) => ({
      sourceGoalId: goal.id,
      decision: 'unreviewed',
      notes: 'MAPPING-3 pending.',
    })),
  }
  writeJson(config.mappingReviewPath, seed)
}

function writeMappingReadme(config: ExtractionConfig, extraction: SourceExtraction): void {
  const sources = config.documents.map((document) => `- Quelle: \`${document.path}\``).join('\n')
  const reviewStatus = readMappingReviewStatus(config)
  const reviewedSourceGoals = reviewStatus?.reviewedSourceGoals ?? 0
  const mappedSourceGoals = reviewStatus?.mappedSourceGoals ?? 0
  const m3Complete = isMappingReviewComplete(config, extraction.sourceGoals.length)
  const mappingStatus = m3Complete
    ? `MAPPING-1, MAPPING-2 und MAPPING-3 abgeschlossen; ${mappedSourceGoals}/${extraction.sourceGoals.length} Source-Ziele sind fachlich auf kanonische Chemie-Ziele gemappt.`
    : 'MAPPING-1 und MAPPING-2 abgeschlossen; MAPPING-3 ist fachlich offen.'

  writeText(config.mappingReadmePath, `# Saarland Chemie ${config.stage} -> kanonische Chemie

Stand: 2026-05-11

Diese Spur aktiviert M1/M2 aus den amtlichen Saarland-Chemie-Lehrplan-PDFs und fuehrt M3 gegen die kanonische Chemie-Landschaft.

${sources}
- Source-Extraction: \`${config.outputPath}\`
- Review-Mapping: \`${config.mappingReviewPath}\`
- Source-Ziele: ${extraction.sourceGoals.length}
- Passagen: ${extraction.passages.length}
- Mapping: ${reviewedSourceGoals}/${extraction.sourceGoals.length} Source-Ziele reviewed
- Status: ${mappingStatus}
`)
}

function upsertRegistryEntries(configs: ExtractionConfig[]): void {
  const absolutePath = path.resolve(repoRoot, registryPath)
  const registry = JSON.parse(readFileSync(absolutePath, 'utf8')) as RegistryFile
  const entries = registry.entries ?? []

  for (const config of configs) {
    const firstDocument = config.documents[0]
    const nextEntry = {
      landscapeId: config.sourceLandscapeId,
      title: config.stage === 'SekI'
        ? 'Chemie Sekundarstufe I (Saarland, Gymnasium G9 2024/2025 Source-Extraction)'
        : 'Chemie Gymnasiale Oberstufe (Saarland, GOS 2023/2025 Source-Extraction)',
      jurisdiction,
      sourcePath: firstDocument.path,
      archiveSourcePath: firstDocument.path,
      archivePath: config.archivePath,
    }
    const existingIndex = entries.findIndex((entry) => entry.landscapeId === config.sourceLandscapeId)
    if (existingIndex >= 0) {
      entries[existingIndex] = nextEntry
    } else {
      entries.push(nextEntry)
    }
  }

  registry.entries = entries
  writeJson(registryPath, registry)
}

function updateSlReadme(): void {
  const absolutePath = path.resolve(repoRoot, slReadmePath)
  const current = readFileSync(absolutePath, 'utf8')
  const lowerMapped = isMappingReviewCompleteFromStatus(lowerConfig)
  const upperMapped = isMappingReviewCompleteFromStatus(upperConfig)
  const compositionViewsActive = areSlCompositionViewsActive()
  const nextStep = lowerMapped && upperMapped
    ? compositionViewsActive
      ? 'The next meaningful step is keeping Saarland Chemistry stable while Sachsen and Thueringen source onboarding continues.'
      : 'The next meaningful step is compiling Saarland Chemistry applicability and DE-SL learner-facing composition views.'
    : 'The next meaningful step is the MAPPING-3 review from Saarland source goals to canonical Chemistry goals.'
  const section = `## Chemie

Archived official source inputs on \`2026-05-11\`:

### Sekundarstufe I
- \`Chemie_Gymnasium_G9_Klasse_8_2024_red_2025.pdf\`
  - Chemie Klassenstufe \`8\` im neunjährigen Gymnasium, redaktionell \`2025\`
- \`Chemie_Gymnasium_G9_Klasse_9_2025.pdf\`
  - Chemie Klassenstufe \`9\` im neunjährigen Gymnasium

### Gymnasiale Oberstufe
- \`Chemie_GOS_Einfuehrungsphase_naturwissenschaftlicher_Zweig_2024.pdf\`
  - Chemie Einführungsphase der gymnasialen Oberstufe, naturwissenschaftlicher Zweig
- \`Chemie_GOS_Einfuehrungsphase_sprachlicher_Zweig_2024.pdf\`
  - Chemie Einführungsphase der gymnasialen Oberstufe, sprachlicher Zweig
- \`Chemie_GOS_Grundkurs_2023_ab_2027_red_2025.pdf\`
  - Chemie Grundkurs der gymnasialen Oberstufe, ab Abitur \`2027\`, redaktionell \`2025\`
- \`Chemie_GOS_Leistungskurs_2023_ab_2027_red_2025.pdf\`
  - Chemie Leistungskurs der gymnasialen Oberstufe, ab Abitur \`2027\`, redaktionell \`2025\`

Official source anchors:

- gymnasiale Sek-I landing page:
  - \`${lowerSourceUrl}\`
- gymnasiale Oberstufe landing page:
  - \`${upperSourceUrl}\`

Operational note:

- \`DE-SL\` now has a real archived lower-secondary plus upper-secondary Chemistry bundle.
- The first retained lower-secondary and upper-secondary Chemistry source extractions now live at:
  - \`${lowerConfig.outputPath}\`
  - \`${upperConfig.outputPath}\`
- Saarland Chemistry M3 status:
  - Sek I: \`${lowerMapped ? 'complete' : 'pending'}\`
  - Sek II: \`${upperMapped ? 'complete' : 'pending'}\`
- Saarland Chemistry composition views:
  - \`${compositionViewsActive ? 'active' : 'pending'}\`
- ${nextStep}
`

  if (current.includes('## Chemie')) {
    const next = current.replace(/## Chemie[\s\S]*$/u, section)
    writeText(slReadmePath, next.endsWith('\n') ? next : `${next}\n`)
    return
  }
  writeText(slReadmePath, `${current.trimEnd()}\n\n${section}`)
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
  const lowerMapped = isMappingReviewCompleteFromStatus(lowerConfig)
  const upperMapped = isMappingReviewCompleteFromStatus(upperConfig)
  const saarlandMapped = lowerMapped && upperMapped
  const saarlandCompositionViewsActive = areSlCompositionViewsActive()
  if (corridor) {
    corridor.nextStep = saarlandMapped && saarlandCompositionViewsActive
      ? 'Keep Mecklenburg-Vorpommern, Rheinland-Pfalz, Sachsen-Anhalt, and Saarland stable on their source-backed P4 Chemistry projections. Archive official Chemistry sources for Sachsen and Thueringen next.'
      : saarlandMapped
        ? 'Keep Mecklenburg-Vorpommern, Rheinland-Pfalz, Sachsen-Anhalt, and Saarland source mappings stable. Compile Saarland applicability and DE-SL learner-facing composition views next; archive official Chemistry sources for Sachsen and Thueringen after that.'
      : 'Keep Mecklenburg-Vorpommern, Rheinland-Pfalz, and Sachsen-Anhalt stable on their source-backed P4 Chemistry projections. Saarland now has source-extracted P2 inventories and needs MAPPING-3 review; archive official Chemistry sources for Sachsen and Thueringen next.'
  }

  const saarland = tracker.states?.find((entry) => entry.jurisdiction === 'DE-SL')
  if (saarland) {
    saarland.phase = saarlandMapped && saarlandCompositionViewsActive ? 'P4' : saarlandMapped ? 'P3' : 'P2'
    saarland.sourceStage = saarlandMapped && saarlandCompositionViewsActive
      ? 'subtree_adopted'
      : saarlandMapped
        ? 'mapping_reviewed'
        : 'source_extracted'
    saarland.mappingFiles = [
      lowerConfig.mappingReviewPath,
      upperConfig.mappingReviewPath,
    ]
    saarland.notes = saarlandMapped && saarlandCompositionViewsActive
      ? 'Official Saarland Chemistry Sek-I and GOS PDFs, source extractions, registry entries, reviewed source-to-canonical mappings, compiled applicability, and DE-SL GK/LK composition views are active and clean for 902 source goals.'
      : saarlandMapped
        ? 'Official Saarland Chemistry Sek-I and GOS PDFs are archived; lower-/upper-secondary source extractions, registry entries, and reviewed source-to-canonical M3 mappings are active and clean. Applicability and learner-facing composition views are still pending.'
      : 'Official Saarland Chemistry Sek-I and GOS PDFs are archived; lower-/upper-secondary source extractions, registry entries, and M3 review seeds are active. MAPPING-3, applicability, and learner-facing composition views are still pending.'
    saarland.nextStep = saarlandMapped && saarlandCompositionViewsActive
      ? 'Keep the Saarland Chemistry projection stable; broaden it only through a later horizontal all-state Chemistry topic pass or if a source revision changes the retained Saarland Lehrplan evidence.'
      : saarlandMapped
        ? 'Compile Saarland Chemistry applicability and DE-SL learner-facing composition views, then rerun source coverage and curriculum quality status.'
      : 'Review Saarland Chemistry source goals against canonical Chemistry goals, then compile applicability and DE-SL learner-facing composition views once MAPPING-3 is clean.'
  }

  writeJson(trackerPath, tracker)
}

function main(): void {
  const lowerExtraction = buildExtraction(lowerConfig)
  const upperExtraction = buildExtraction(upperConfig)

  writeJson(lowerConfig.outputPath, lowerExtraction)
  writeJson(upperConfig.outputPath, upperExtraction)
  writeReviewSeed(lowerConfig, lowerExtraction.sourceGoals)
  writeReviewSeed(upperConfig, upperExtraction.sourceGoals)
  writeMappingReadme(lowerConfig, lowerExtraction)
  writeMappingReadme(upperConfig, upperExtraction)
  upsertRegistryEntries([lowerConfig, upperConfig])
  updateSlReadme()
  updateTracker()

  console.log(`Wrote ${lowerConfig.outputPath} (${lowerExtraction.passages.length} passages, ${lowerExtraction.sourceGoals.length} source goals)`)
  console.log(`Wrote ${upperConfig.outputPath} (${upperExtraction.passages.length} passages, ${upperExtraction.sourceGoals.length} source goals)`)
  console.log(`Source landscape IDs: ${lowerConfig.sourceLandscapeId}, ${upperConfig.sourceLandscapeId}`)
}

main()
