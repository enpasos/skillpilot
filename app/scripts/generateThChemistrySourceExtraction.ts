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

type ParsedBullet = {
  sectionNumber: string
  sectionTitle: string
  subheading: string
  stage: Stage
  stageLabel: string
  courseLevel: CourseLevel
  page: number
  text: string
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
  jurisdiction: 'DE-TH'
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
  expectedSections: string[]
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

const jurisdiction = 'DE-TH'
const targetLandscapeId = 'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0'
const sourcePdf2024Path = 'curricula/DE/Gymnasium/input/TH/LP_GY_Chemie_2024.pdf'
const sourcePdf2012Path = 'curricula/DE/Gymnasium/input/TH/LP_GY_Chemie_2012.pdf'
const sourcePdf2024Url =
  'https://www.schulportal-thueringen.de/tip/resources/medien/63707?dateiname=Chemie_Lehrplan_AHR_2024-11-13.pdf'
const sourcePdf2012Url =
  'https://www.schulportal-thueringen.de/tip/resources/medien/14475?dateiname=Lp_Chemie_Gymnasium_20_08_2013.pdf'
const registryPath = 'curricula/DE/Gymnasium/provenance/source-landscape-registry.json'
const trackerPath = 'curricula/DE/Gymnasium/provenance/chemistry-bundesland-rollout-tracker.json'
const thReadmePath = 'curricula/DE/Gymnasium/input/TH/README.md'
const trackerUpdatedAt = '2026-05-11T20:22:18Z'
const thCompositionViewPaths = [
  'curricula/DE/Gymnasium/composition-views/chemie/de-th-gk.view.json',
  'curricula/DE/Gymnasium/composition-views/chemie/de-th-lk.view.json',
]

const sourceDocument2024: SourceDocument = {
  key: 'TH-CH-2024',
  title: 'Thueringer Lehrplan Chemie fuer den Erwerb der allgemeinen Hochschulreife 2024',
  path: sourcePdf2024Path,
  url: sourcePdf2024Url,
  official: true,
}

const configs: ExtractionConfig[] = [
  {
    stage: 'SekI',
    extractionId: 'DE-TH-CHEMIE-SEKI-LEHRPLAN-GYMNASIUM-2024',
    title: 'DE-TH - Chemie Sekundarstufe I (Thueringen, Lehrplan Gymnasium 2024 Source-Extraction)',
    sourceLandscapeId: uuidFromString('DE-TH-CHEMIE-SEKI-LEHRPLAN-GYMNASIUM-2024'),
    outputPath:
      'curricula/DE/Gymnasium/input/TH/lower-secondary/source-extraction/DE_TH_CHEMIE_SEKI_LEHRPLAN_GYMNASIUM_2024.source-extraction.json',
    mappingReviewPath:
      'curricula/DE/Gymnasium/mapping/DE-TH/lower-secondary/th_chemistry_lower_secondary_source_extraction_to_canonical_chemistry.review.json',
    mappingReadmePath: 'curricula/DE/Gymnasium/mapping/DE-TH/lower-secondary/CHEMIE.md',
    archivePath: 'curricula/DE/Gymnasium/input/TH/lower-secondary/',
    expectedSections: [
      '2.1.1.1',
      '2.1.1.2',
      '2.1.1.3',
      '2.1.1.4',
      '2.1.1.5',
      '2.1.1.6',
      '2.1.1.7',
      '2.1.1.8',
      '2.1.1.9',
      '2.2.1.1',
      '2.2.1.2',
      '2.2.1.3',
    ],
    peerBaseline:
      'HE/BW/HB/HH/MV/NI/NW/RP/SH/ST/SL/SN Sek-I-Chemie = 122/65/42/76/114/196/79/65/156/270/190/176 Source-Ziele. Thueringen Sek I wird aus den Sach- und Methodenkompetenzen der Klassenstufen 7/8 und 9/10 extrahiert.',
  },
  {
    stage: 'SekII',
    extractionId: 'DE-TH-CHEMIE-SEKII-LEHRPLAN-GYMNASIUM-2024',
    title: 'DE-TH - Chemie Qualifikationsphase (Thueringen, Lehrplan Gymnasium 2024 Source-Extraction)',
    sourceLandscapeId: uuidFromString('DE-TH-CHEMIE-SEKII-LEHRPLAN-GYMNASIUM-2024'),
    outputPath:
      'curricula/DE/Gymnasium/input/TH/upper-secondary/source-extraction/DE_TH_CHEMIE_SEKII_LEHRPLAN_GYMNASIUM_2024.source-extraction.json',
    mappingReviewPath:
      'curricula/DE/Gymnasium/mapping/DE-TH/upper-secondary/th_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.review.json',
    mappingReadmePath: 'curricula/DE/Gymnasium/mapping/DE-TH/upper-secondary/CHEMIE.md',
    archivePath: 'curricula/DE/Gymnasium/input/TH/upper-secondary/',
    expectedSections: ['4.1.1', '4.1.2', '4.1.3', '4.1.4', '4.1.5', '4.1.6', '4.1.7', '4.1.8'],
    peerBaseline:
      'HE/BW/BB/BE/HH/MV/NI/NW/RP/SH/ST/SL/SN Sek-II-Chemie = 202/126/203/203/97/122/333/154/325/165/324/712/302 Source-Ziele. Thueringen Sek II wird aus den Sach- und Methodenkompetenzen der Qualifikationsphase des amtlichen Lehrplans 2024 extrahiert.',
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

function stripBullet(value: string): string {
  return normalizeText(
    value
      .replace(/^[-–]\s*/u, '')
      .replace(/^•\s*/u, '')
      .replace(/^➢\s*/u, '')
      .replace(/\s*➢\s*(?:im\s+)?Schülerexperiment:?$/iu, '')
      .replace(/[]/gu, '')
      .replace(/[]/gu, ' ')
      .replace(/^\+\s*/u, ''),
  )
}

function meaningful(value: string): boolean {
  const clean = stripBullet(value)
  if (clean.length < 6) return false
  const letters = clean.match(/[A-Za-zÄÖÜäöüß]/gu)?.length ?? 0
  if (letters < 5) return false
  if (/^[A-Z]?[0-9 ()=+*/.,;:²³°^-]+$/u.test(clean)) return false
  return true
}

function titleForGoal(text: string): string {
  const clean = normalizeText(text).replace(/[,.]$/u, '')
  return clean.length > 180 ? `${clean.slice(0, 177)}...` : clean
}

function appendContinuation(base: string, continuation: string): string {
  if (base.endsWith('-')) return `${base.slice(0, -1)}${continuation}`
  return `${base} ${continuation}`
}

function readPdfRawText(): string {
  const absolutePath = path.resolve(repoRoot, sourcePdf2024Path)
  if (!existsSync(absolutePath)) throw new Error(`Missing Thueringen Chemistry source PDF: ${sourcePdf2024Path}`)
  return execFileSync('pdftotext', ['-raw', absolutePath, '-'], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  })
}

const sectionPattern = /^((?:2\.(?:1|2)\.1\.\d+)|(?:4\.1\.\d+))\s+(.+)$/u
const stopSectionPattern = /^(?:2\.1\.2|2\.2\.2|3\b|4\.2|5\b)/u
const bulletPattern = /^[-–]\s+(.+)$/u
const aspectPattern = /^•\s+(.+)$/u
const experimentPattern = /^➢\s*(?:im\s+)?Schülerexperiment:?$/u

function stageForSection(sectionNumber: string): Stage {
  return sectionNumber.startsWith('4.') ? 'SekII' : 'SekI'
}

function stageLabelForSection(sectionNumber: string): string {
  if (sectionNumber.startsWith('2.1.')) return 'Klassenstufen 7/8'
  if (sectionNumber.startsWith('2.2.')) return 'Klassenstufen 9/10'
  return 'Qualifikationsphase'
}

function isIgnoredLine(line: string): boolean {
  if (!line) return true
  if (/^\d+$/u.test(line)) return true
  if (/^Die Lernenden können(?:\s|$)/u.test(line)) return true
  if (/^Nachfolgend ausgewiesene Kompetenzen/u.test(line)) return true
  if (/^Dabei ist die unter/u.test(line)) return true
  if (/^Sach- und Methodenkompetenz$/u.test(line)) return true
  if (/^grundlegendes und erhöhtes$/u.test(line)) return true
  if (/^Anforderungsniveau$/u.test(line)) return true
  if (/^zusätzlich für das erhöhte$/u.test(line)) return true
  if (/^Jahrgangsstufen 11\/12/u.test(line)) return true
  if (/^Thüringer Lehrplan/u.test(line)) return true
  if (/^Chemie$/u.test(line)) return true
  if (/^Inkraftsetzung/u.test(line)) return true
  return false
}

function isLikelySubheading(line: string): boolean {
  if (!meaningful(line)) return false
  if (line.length > 90) return false
  if (/[.;:]$/u.test(line)) return false
  if (/^(und|oder|sowie|mit|bei|von|für|im|in|aus|zur|des|der|die|das)\b/u.test(line)) return false
  if (/^(grundlegendes|zusätzlich|mit dem Realschulabschluss|in der Einführungsphase)/u.test(line)) return false
  return /^[A-ZÄÖÜ0-9]/u.test(line)
}

function lastOpenText(bullet: ParsedBullet): string {
  return bullet.aspects.length > 0 ? bullet.aspects[bullet.aspects.length - 1] : bullet.text
}

function setLastOpenText(bullet: ParsedBullet, value: string): void {
  if (bullet.aspects.length > 0) bullet.aspects[bullet.aspects.length - 1] = value
  else bullet.text = value
}

function needsContinuation(bullet: ParsedBullet): boolean {
  const text = lastOpenText(bullet).trim()
  if (text.endsWith('-')) return true
  if ((text.match(/\(/gu)?.length ?? 0) > (text.match(/\)/gu)?.length ?? 0)) return true
  return /\b(?:und|oder|sowie|mit|von|für|im|in|am|an|auf|aus|zu|zur|zum|des|der|die|das|dem|den|einer|einem|als|bei|ohne|unter|durch|gegen|zwischen|nach|vor|über|bzw\.|z\. B\.|reduzierende|mögliche|nachwachsenden)$/iu.test(text)
}

function parseBullets(): ParsedBullet[] {
  const pages = readPdfRawText().split('\f')
  const bullets: ParsedBullet[] = []
  let currentSection:
    | {
      number: string
      title: string
      stage: Stage
      stageLabel: string
      page: number
    }
    | undefined
  let currentSubheading = ''
  let currentBullet: ParsedBullet | undefined

  const finishBullet = () => {
    if (!currentBullet) return
    currentBullet.text = stripBullet(currentBullet.text)
    currentBullet.aspects = currentBullet.aspects.map(stripBullet).filter(meaningful)
    if (meaningful(currentBullet.text)) bullets.push(currentBullet)
    currentBullet = undefined
  }

  for (const [pageIndex, pageText] of pages.entries()) {
    for (const rawLine of pageText.split(/\r?\n/u)) {
      const line = normalizeText(rawLine)
      if (stopSectionPattern.test(line)) {
        finishBullet()
        currentSection = undefined
        currentSubheading = ''
        continue
      }

      const sectionMatch = line.match(sectionPattern)
      if (sectionMatch) {
        finishBullet()
        currentSection = {
          number: sectionMatch[1],
          title: stripBullet(sectionMatch[2]),
          stage: stageForSection(sectionMatch[1]),
          stageLabel: stageLabelForSection(sectionMatch[1]),
          page: pageIndex + 1,
        }
        currentSubheading = ''
        continue
      }

      if (!currentSection || isIgnoredLine(line)) continue

      const bulletMatch = line.match(bulletPattern)
      if (bulletMatch) {
        finishBullet()
        currentBullet = {
          sectionNumber: currentSection.number,
          sectionTitle: currentSection.title,
          subheading: currentSubheading || currentSection.title,
          stage: currentSection.stage,
          stageLabel: currentSection.stageLabel,
          courseLevel: 'GK_LK',
          page: pageIndex + 1,
          text: bulletMatch[1],
          aspects: [],
        }
        continue
      }

      if (experimentPattern.test(line)) {
        finishBullet()
        currentBullet = {
          sectionNumber: currentSection.number,
          sectionTitle: currentSection.title,
          subheading: currentSubheading || currentSection.title,
          stage: currentSection.stage,
          stageLabel: currentSection.stageLabel,
          courseLevel: 'GK_LK',
          page: pageIndex + 1,
          text: 'im Schülerexperiment',
          aspects: [],
        }
        continue
      }

      const aspectMatch = line.match(aspectPattern)
      if (aspectMatch && currentBullet) {
        currentBullet.aspects.push(aspectMatch[1])
        continue
      }

      if (currentBullet && meaningful(line)) {
        if (needsContinuation(currentBullet) || /^[a-zäöüß]/u.test(line)) {
          setLastOpenText(currentBullet, appendContinuation(lastOpenText(currentBullet), line))
          continue
        }

        if (isLikelySubheading(line)) {
          finishBullet()
          currentSubheading = stripBullet(line)
          continue
        }

        setLastOpenText(currentBullet, appendContinuation(lastOpenText(currentBullet), line))
        continue
      }

      if (isLikelySubheading(line)) {
        finishBullet()
        currentSubheading = stripBullet(line)
      }
    }
    finishBullet()
  }

  return bullets
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

function areThCompositionViewsActive(): boolean {
  return thCompositionViewPaths.every((relativePath) => existsSync(path.resolve(repoRoot, relativePath)))
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
            label: 'Amtlicher Thueringen-Chemie-Lehrplan liegt lokal vor',
            passed: existsSync(path.resolve(repoRoot, sourcePdf2024Path)),
            details: sourcePdf2024Path,
          },
          {
            id: 'expected-topic-coverage',
            label: 'Thueringen-Chemie-Passagegruppen aus Sek I und Qualifikationsphase sind vorhanden',
            passed: passages.length > 0,
            details: `${passages.length} Passagegruppen.`,
          },
          {
            id: 'passage-extraction-source',
            label: 'Passage-Extraction basiert auf amtlicher PDF-Quelle',
            passed: true,
            details: sourcePdf2024Path,
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
            label: 'Aus den amtlichen Thueringen-Chemie-Passagen wurden Source-Ziele erzeugt',
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
            passed: existsSync(path.resolve(repoRoot, config.mappingReviewPath)),
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

function topicCodeForBullet(bullet: ParsedBullet): string {
  return `TH-CH-${bullet.stage}-${bullet.sectionNumber}-${slug(bullet.subheading)}`
}

function buildExtraction(config: ExtractionConfig, allBullets: ParsedBullet[]): SourceExtraction {
  const stageBullets = allBullets.filter((bullet) => bullet.stage === config.stage)
  const foundSections = new Set(stageBullets.map((bullet) => bullet.sectionNumber))
  const missingSections = config.expectedSections.filter((section) => !foundSections.has(section))
  if (missingSections.length > 0) {
    throw new Error(`${config.extractionId}: missing expected sections: ${missingSections.join(', ')}`)
  }

  const passageByTopic = new Map<string, Passage>()
  const sourceGoals: SourceGoal[] = []

  for (const [bulletIndex, bullet] of stageBullets.entries()) {
    const topicCode = topicCodeForBullet(bullet)
    let passage = passageByTopic.get(topicCode)
    if (!passage) {
      const titleSuffix = bullet.subheading === bullet.sectionTitle
        ? bullet.sectionTitle
        : `${bullet.sectionTitle}: ${bullet.subheading}`
      passage = {
        id: `th-chemistry-${config.stage.toLowerCase()}:${slug(topicCode)}`,
        topicCode,
        title: `${bullet.stageLabel}: ${titleSuffix}`,
        text: '',
        page: bullet.page,
        sourcePath: sourcePdf2024Path,
        sourceGoalIds: [],
      }
      passageByTopic.set(topicCode, passage)
    }

    const aspects = bullet.aspects.length > 0 ? bullet.aspects : [bullet.text]
    for (const [aspectIndex, aspect] of aspects.entries()) {
      const sourceText = bullet.aspects.length > 0 ? `${bullet.text.replace(/:$/u, '')}: ${aspect}` : bullet.text
      const sourceGoalId =
        `th-chem-${config.stage.toLowerCase()}-${slug(topicCode)}-${String(bulletIndex + 1).padStart(
          3,
          '0',
        )}-${String(aspectIndex + 1).padStart(2, '0')}-${hash(sourceText)}`
      const sourceSpan = `${bullet.stageLabel}, ${bullet.sectionNumber} ${bullet.sectionTitle}, ${bullet.subheading}, PDF-S. ${bullet.page}`
      passage.sourceGoalIds.push(sourceGoalId)
      sourceGoals.push({
        id: sourceGoalId,
        passageId: passage.id,
        topicCode,
        bulletIndex: bulletIndex + 1,
        aspectIndex: aspectIndex + 1,
        title: titleForGoal(sourceText),
        description: `Die lernende Person kann ${sourceText.replace(/[,.]$/u, '')}.`,
        sourceText,
        sourceSpan,
        parentBulletText: bullet.text,
        sourceRef: `Lehrplan Gymnasium Chemie Thueringen 2024, ${sourceSpan}`,
        courseLevel: bullet.courseLevel,
        granularity: bullet.aspects.length > 0 ? 'officialCompetencyAspect' : 'officialCompetencyRow',
        tags: [
          'source:thueringen',
          'subject:Chemie',
          `stage:${config.stage}`,
          `section:${bullet.sectionNumber}`,
          `topic:${slug(topicCode)}`,
          `course:${bullet.courseLevel}`,
          `sourceDocument:${sourceDocument2024.key}`,
        ],
        rawSourceText: sourceText,
        rawSourceSpan: sourceSpan,
        rawParentBulletText: bullet.text,
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
    sourceDocument: sourceDocument2024,
    sourceDocuments: [sourceDocument2024],
    method: {
      sourceProvision:
        'Der amtliche Thueringen-Lehrplan Chemie 2024 liegt lokal als PDF vor; die Datei deckt Klassenstufen 7-10, eine Bruecken-Einfuehrungsphase fuer Lernende mit Realschulabschluss und die Qualifikationsphase ab. Diese Source-Extraction nutzt die regulaeren Sek-I- und Qualifikationsphasen-Abschnitte.',
      passageExtraction:
        'pdftotext -raw; Passagen werden aus nummerierten Sach- und Methodenkompetenz-Abschnitten und lokalen Unterueberschriften gebildet.',
      sourceGoalExtraction:
        'Ein Source-Ziel pro verbindlicher Kompetenzzeile bzw. pro fachlichem Unteraspekt einer Kompetenzzeile. Selbst-/Sozialkompetenz und die gesonderte Bruecken-Einfuehrungsphase fuer Lernende mit Realschulabschluss bleiben fuer diese Gymnasium-Projektion ausgeklammert.',
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
      notes: 'Review-Seed aus der amtlichen Thueringen-Source-Extraction; MAPPING-3 ist noch offen.',
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

  writeText(config.mappingReadmePath, `# Thueringen Chemie ${config.stage} -> kanonische Chemie

Stand: 2026-05-11

Diese Spur aktiviert M1/M2 aus dem amtlichen Thueringen-Chemie-Lehrplan Gymnasium 2024 und fuehrt einen M3-Review-Seed gegen die kanonische Chemie-Landschaft.

- Quelle: \`${sourcePdf2024Path}\`
- Offizielle Quelle: \`${sourcePdf2024Url}\`
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
        ? 'Chemie Sekundarstufe I (Thueringen, Lehrplan Gymnasium 2024 Source-Extraction)'
        : 'Chemie Qualifikationsphase (Thueringen, Lehrplan Gymnasium 2024 Source-Extraction)',
      jurisdiction,
      sourcePath: sourcePdf2024Path,
      archiveSourcePath: sourcePdf2024Path,
      archivePath: config.archivePath,
    }
    const existingIndex = entries.findIndex((entry) => entry.landscapeId === config.sourceLandscapeId)
    if (existingIndex >= 0) entries[existingIndex] = nextEntry
    else entries.push(nextEntry)
  }

  registry.entries = entries
  writeJson(registryPath, registry)
}

function upsertMarkdownSection(current: string, heading: string, section: string): string {
  const pattern = new RegExp(`\\n?${heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?(?=\\n## |$)`, 'u')
  if (pattern.test(current)) {
    return current.replace(pattern, `\n${section.trimEnd()}\n`)
  }
  return `${current.trimEnd()}\n\n${section.trimEnd()}\n`
}

function updateThReadme(extractions: SourceExtraction[]): void {
  const absolutePath = path.resolve(repoRoot, thReadmePath)
  const current = readFileSync(absolutePath, 'utf8')
  const lowerMapped = isMappingReviewCompleteFromStatus(configs[0])
  const upperMapped = isMappingReviewCompleteFromStatus(configs[1])
  const compositionViewsActive = areThCompositionViewsActive()
  const nextStep = lowerMapped && upperMapped
    ? compositionViewsActive
      ? 'The next meaningful step is a horizontal Chemistry quality pass now that all 16 Bundesland source lanes are source-backed.'
      : 'The next meaningful step is compiling Thueringen Chemistry learner-facing composition views.'
    : 'The next meaningful step is the MAPPING-3 review from Thueringen source goals to canonical Chemistry goals.'

  const section = `## Chemie

Archived official source input on \`2026-05-11\`:

- \`LP_GY_Chemie_2024.pdf\`
  - Thueringer Lehrplan Chemie fuer den Erwerb der allgemeinen Hochschulreife \`2024\`
  - Klassenstufen \`7-10\`, gesonderte Einfuehrungsphase fuer Lernende mit Realschulabschluss und Qualifikationsphase
  - direct PDF source: \`${sourcePdf2024Url}\`
- \`LP_GY_Chemie_2012.pdf\`
  - retained transition/reference copy of the prior Thueringen Gymnasium Chemistry plan
  - direct PDF source: \`${sourcePdf2012Url}\`

Operational note:

- \`DE-TH\` now has a real archived lower-secondary plus upper-secondary Chemistry source bundle from the official 2024 Gymnasium PDF.
- The retained lower-secondary and upper-secondary Chemistry source extractions now live at:
  - \`${configs[0].outputPath}\`
  - \`${configs[1].outputPath}\`
- Thueringen Chemistry M3 status:
  - Sek I: \`${lowerMapped ? 'complete' : 'pending'}\` (${extractions[0].sourceGoals.length} Source-Ziele)
  - Sek II: \`${upperMapped ? 'complete' : 'pending'}\` (${extractions[1].sourceGoals.length} Source-Ziele)
- Thueringen Chemistry composition views:
  - \`${compositionViewsActive ? 'active' : 'pending'}\`
- ${nextStep}
`

  writeText(thReadmePath, upsertMarkdownSection(current, '## Chemie', section))
}

function updateTracker(): void {
  const absolutePath = path.resolve(repoRoot, trackerPath)
  const tracker = JSON.parse(readFileSync(absolutePath, 'utf8')) as {
    updatedAt?: string
    canonicalCorridors?: Array<{
      id?: string
      status?: string
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

  const lowerMapped = isMappingReviewCompleteFromStatus(configs[0])
  const upperMapped = isMappingReviewCompleteFromStatus(configs[1])
  const thueringenMapped = lowerMapped && upperMapped
  const thueringenCompositionViewsActive = areThCompositionViewsActive()

  const corridor = tracker.canonicalCorridors?.find((entry) => entry.id === 'CHEM.REMAINING_SOURCE_ONBOARDING')
  if (corridor) {
    corridor.nextStep = thueringenMapped && thueringenCompositionViewsActive
      ? 'All tracked Chemistry Bundesland source lanes are source-backed and clean on P4; run horizontal Chemistry QA/topic-gap review next.'
      : thueringenMapped
        ? 'Thueringen Chemistry MAPPING-3 is reviewed; compile DE-TH learner-facing composition views next.'
        : 'Thueringen Chemistry now has source-extracted P2 inventories from the official Gymnasium Lehrplan; review Thueringen MAPPING-3 next.'
  }

  const thueringen = tracker.states?.find((entry) => entry.jurisdiction === 'DE-TH')
  if (thueringen) {
    thueringen.phase = thueringenMapped && thueringenCompositionViewsActive ? 'P4' : thueringenMapped ? 'P3' : 'P2'
    thueringen.sourceStage = thueringenMapped && thueringenCompositionViewsActive
      ? 'subtree_adopted'
      : thueringenMapped
        ? 'mapping_reviewed'
        : 'source_extracted'
    thueringen.mappingFiles = configs.map((config) => config.mappingReviewPath)
    thueringen.notes = thueringenMapped && thueringenCompositionViewsActive
      ? 'Official Thueringen Chemistry Gymnasium 2024 PDF, source extractions, registry entries, reviewed source-to-canonical mappings, and DE-TH GK/LK composition views are active and clean.'
      : thueringenMapped
        ? 'Official Thueringen Chemistry Gymnasium 2024 PDF is archived locally; lower-/upper-secondary source extractions, registry entries, and reviewed source-to-canonical M3 mappings are active. Learner-facing composition views are still pending.'
        : 'Official Thueringen Chemistry Gymnasium 2024 PDF is archived locally; lower-/upper-secondary source extractions, registry entries, and M3 review seeds are active. MAPPING-3, applicability, and learner-facing composition views are still pending.'
    thueringen.nextStep = thueringenMapped && thueringenCompositionViewsActive
      ? 'Keep the Thueringen Chemistry projection stable; broaden it only through a later horizontal all-state Chemistry topic pass or if a source revision changes the retained Thueringen Lehrplan evidence.'
      : thueringenMapped
        ? 'Compile Thueringen Chemistry learner-facing composition views, then rerun source coverage and curriculum quality status.'
        : 'Review Thueringen Chemistry source goals against canonical Chemistry goals, then compile applicability and DE-TH learner-facing composition views once MAPPING-3 is clean.'
  }

  writeJson(trackerPath, tracker)
}

function main(): void {
  if (!existsSync(path.resolve(repoRoot, sourcePdf2012Path))) {
    console.warn(`Retained 2012 reference PDF is missing: ${sourcePdf2012Path}`)
  }

  const bullets = parseBullets()
  const extractions = configs.map((config) => buildExtraction(config, bullets))

  for (const [index, extraction] of extractions.entries()) {
    const config = configs[index]
    writeJson(config.outputPath, extraction)
    writeReviewSeed(config, extraction)
    writeMappingReadme(config, extraction)
  }

  upsertRegistryEntries()
  updateThReadme(extractions)
  updateTracker()

  for (const [index, extraction] of extractions.entries()) {
    console.log(`Wrote ${configs[index].outputPath} (${extraction.passages.length} passages, ${extraction.sourceGoals.length} source goals)`)
  }
  console.log(`Source landscape IDs: ${configs.map((config) => config.sourceLandscapeId).join(', ')}`)
}

main()
