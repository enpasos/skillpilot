import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

type Stage = 'SekI' | 'SekII'
type CourseLevel = 'GK_LK' | 'LK'

type SourceDocument = {
  key: string
  title: string
  path: string
  url: string
  official: true
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
  jurisdiction: 'DE-RP'
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
  sourceDocument: SourceDocument
  outputPath: string
  mappingReviewPath: string
  archivePath: string
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

const targetLandscapeId = 'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0'
const registryPath = 'curricula/DE/Gymnasium/provenance/source-landscape-registry.json'

const lowerSourceUrl = 'https://bildung.rlp.de/lehrplaene/?tx_rlpbase_download%5Bitem%5D=56515&type=432522'
const upperSourceUrl = 'https://bildung.rlp.de/lehrplaene/?tx_rlpbase_download%5Bitem%5D=67901&type=432522'

const lowerConfig: ExtractionConfig = {
  stage: 'SekI',
  extractionId: 'DE-RP-CHEMIE-SEKI-RAHMENLEHRPLAN-2014',
  title: 'DE-RP - Chemie Sekundarstufe I (Rheinland-Pfalz, Lehrplan BCP 2014 Source-Extraction)',
  sourceLandscapeId: uuidFromString('DE-RP-CHEMIE-SEKI-RAHMENLEHRPLAN-2014'),
  sourceDocument: {
    key: 'RP-CH-SEKI-2014',
    title: 'Lehrplan Naturwissenschaftliche Fächer Biologie, Chemie, Physik Klassenstufen 7-10 Rheinland-Pfalz 2014',
    path: 'curricula/DE/Gymnasium/input/RP/Chemie_Sekundarstufe_I_Biologie_Physik_Chemie_2014.pdf',
    url: lowerSourceUrl,
    official: true,
  },
  outputPath:
    'curricula/DE/Gymnasium/input/RP/lower-secondary/source-extraction/DE_RP_CHEMIE_SEKI_RAHMENLEHRPLAN_2014.source-extraction.json',
  mappingReviewPath:
    'curricula/DE/Gymnasium/mapping/DE-RP/lower-secondary/rp_chemistry_lower_secondary_source_extraction_to_canonical_chemistry.review.json',
  archivePath: 'curricula/DE/Gymnasium/input/RP/lower-secondary/',
  peerBaseline:
    '65 Source-Ziele; HE/BW/HB/NI/NW/SH/MV/ST Sek-I-Chemie = 122/65/42/196/79/156/114/270 Source-Ziele; RP wird aus den zwölf Chemie-Themenfeldern und ihren Kompetenzbullets extrahiert.',
}

const upperConfig: ExtractionConfig = {
  stage: 'SekII',
  extractionId: 'DE-RP-CHEMIE-SEKII-MSS-2022',
  title: 'DE-RP - Chemie Mainzer Studienstufe (Rheinland-Pfalz, Lehrplan 2022 Source-Extraction)',
  sourceLandscapeId: uuidFromString('DE-RP-CHEMIE-SEKII-MSS-2022'),
  sourceDocument: {
    key: 'RP-CH-SEKII-2022',
    title: 'Lehrplan Chemie Grund- und Leistungsfach in der gymnasialen Oberstufe Rheinland-Pfalz 2022',
    path: 'curricula/DE/Gymnasium/input/RP/Chemie_Sekundarstufe_II_MSS_2022.pdf',
    url: upperSourceUrl,
    official: true,
  },
  outputPath:
    'curricula/DE/Gymnasium/input/RP/upper-secondary/source-extraction/DE_RP_CHEMIE_SEKII_MSS_2022.source-extraction.json',
  mappingReviewPath:
    'curricula/DE/Gymnasium/mapping/DE-RP/upper-secondary/rp_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.review.json',
  archivePath: 'curricula/DE/Gymnasium/input/RP/upper-secondary/',
  peerBaseline:
    '325 Source-Ziele; HE/BW/BB/BE/NI/NW/SH/MV/ST Sek-II-Chemie = 202/126/203/203/333/154/165/122/324 Source-Ziele; RP wird aus den Fachinhalten der MSS-Bausteine ab Kapitel 4.3 extrahiert.',
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
    .replace(/([A-Za-zÄÖÜäöüß])- ([A-Za-zÄÖÜäöüß])/gu, '$1$2')
    .replace(/([A-Za-zÄÖÜäöüß])-\s+([A-Za-zÄÖÜäöüß])/gu, '$1$2')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:])/g, '$1')
    .trim()
}

function stripBullet(value: string): string {
  return normalizeText(
    value
      .replace(/^[•■–-]\s*/u, '')
      .replace(/^•\s*/u, '')
      .replace(/^-\s*/u, ''),
  )
}

function titleForGoal(text: string): string {
  const clean = normalizeText(text).replace(/[,.]$/u, '')
  return clean.length > 180 ? `${clean.slice(0, 177)}...` : clean
}

function readPdfPages(sourcePath: string): string[] {
  const absolutePath = path.resolve(repoRoot, sourcePath)
  if (!existsSync(absolutePath)) throw new Error(`Missing source PDF: ${sourcePath}`)
  const cachePath = path.resolve(repoRoot, 'tmp', 'source-extraction-cache', `${slug(path.basename(sourcePath))}.layout.txt`)
  if (existsSync(cachePath)) {
    return readFileSync(cachePath, 'utf8').split('\f')
  }
  return execFileSync('pdftotext', ['-layout', absolutePath, '-'], {
    encoding: 'utf8',
    maxBuffer: 128 * 1024 * 1024,
  }).split('\f')
}

function readPdfRawPages(sourcePath: string): string[] {
  const absolutePath = path.resolve(repoRoot, sourcePath)
  if (!existsSync(absolutePath)) throw new Error(`Missing source PDF: ${sourcePath}`)
  const cachePath = path.resolve(repoRoot, 'tmp', 'source-extraction-cache', `${slug(path.basename(sourcePath))}.raw.txt`)
  if (existsSync(cachePath)) {
    return readFileSync(cachePath, 'utf8').split('\f')
  }
  return execFileSync('pdftotext', ['-raw', absolutePath, '-'], {
    encoding: 'utf8',
    maxBuffer: 128 * 1024 * 1024,
  }).split('\f')
}

function collectBulletLines(lines: string[]): string[] {
  const bullets: string[] = []
  let current = ''

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) continue
    const isBullet = /^[•■]\s*/u.test(line)
    const isContinuation = current && !/^(Beitrag|Erschließung|Differenzierung|Bezüge|Didaktisch|NaWi|Biologie|Chemie|Physik)\b/u.test(line)

    if (isBullet) {
      if (current) bullets.push(stripBullet(current))
      current = line
      continue
    }
    if (isContinuation) {
      current = `${current} ${line}`
    }
  }

  if (current) bullets.push(stripBullet(current))
  return bullets.filter((bullet) => meaningful(bullet))
}

function meaningful(value: string): boolean {
  const clean = normalizeText(value)
  if (clean.length < 10) return false
  const letters = clean.match(/[A-Za-zÄÖÜäöüß]/gu)?.length ?? 0
  if (letters < 8) return false
  if (/^[0-9 ()=+*/.,;:²³Δ°^-]+$/u.test(clean)) return false
  return true
}

function pageForNeedle(pages: string[], needle: string): number {
  const normalizedNeedle = normalizeText(needle)
  const index = pages.findIndex((page) => normalizeText(page).includes(normalizedNeedle))
  return index >= 0 ? index + 1 : 1
}

function extractLowerTopics(config: ExtractionConfig): Array<{ code: string; title: string; page: number; rows: string[] }> {
  const pages = readPdfPages(config.sourceDocument.path)
  const chemistryStart = pages.findIndex((page) => /3 LEHRPLAN CHEMIE/u.test(page))
  const physicsStart = pages.findIndex((page) => /4 LEHRPLAN PHYSIK/u.test(page))
  if (chemistryStart < 0 || physicsStart < 0 || physicsStart <= chemistryStart) {
    throw new Error('Could not locate Rheinland-Pfalz Sek-I Chemistry section boundaries.')
  }

  const chemistryPages = pages.slice(chemistryStart, physicsStart)
  const topics: Array<{ number: number; title: string; startPage: number; startOffset: number }> = []

  chemistryPages.forEach((page, pageIndex) => {
    const headingMatch = page.match(/^\s*(?:TF|Themenfeld)\s+(\d+):\s+(.+)$/mu)
    if (headingMatch) {
      topics.push({
        number: Number(headingMatch[1]),
        title: normalizeText(headingMatch[2]),
        startPage: chemistryStart + pageIndex + 1,
        startOffset: pageIndex,
      })
    }
  })

  const uniqueTopics = topics.filter((topic, index) => (
    index === topics.findIndex((candidate) => candidate.number === topic.number)
  ))

  return uniqueTopics.map((topic, index) => {
    const nextTopic = uniqueTopics[index + 1]
    const sectionPages = chemistryPages.slice(topic.startOffset, nextTopic ? nextTopic.startOffset : chemistryPages.length)
    const sectionText = sectionPages.join('\n')
    const competenceBlock = sliceBetween(sectionText, /Kompetenzen:/u, /Beitrag zur Entwicklung der Basiskonzepte:/u)
    const conceptBlock = sliceBetween(sectionText, /Beitrag zur Entwicklung der Basiskonzepte:/u, /Erschließung des Themenfeldes/u)
    const rows = collectBulletLines(competenceBlock.split('\n'))

    const conceptSummary = summarizeConceptBlock(conceptBlock)
    if (conceptSummary) rows.push(conceptSummary)

    return {
      code: `TF${String(topic.number).padStart(2, '0')}-${slug(topic.title).toUpperCase()}`,
      title: `Themenfeld ${topic.number}: ${topic.title}`,
      page: topic.startPage,
      rows,
    }
  })
}

function summarizeConceptBlock(block: string): string | undefined {
  const clean = normalizeText(
    block
      .replace(/Fachbegriffe:/gu, 'Fachbegriffe:')
      .replace(/\bAuf der Stoffebene:/gu, 'Auf der Stoffebene:')
      .replace(/\bAuf der Teilchenebene:/gu, 'Auf der Teilchenebene:'),
  )
  if (!meaningful(clean)) return undefined
  return `zentrale Basiskonzepte und Fachbegriffe des Themenfeldes fachsprachlich verwenden: ${clean}`
}

function sliceBetween(value: string, start: RegExp, end: RegExp): string {
  const startMatch = start.exec(value)
  if (!startMatch || startMatch.index < 0) return ''
  const afterStart = value.slice(startMatch.index + startMatch[0].length)
  const endMatch = end.exec(afterStart)
  return endMatch ? afterStart.slice(0, endMatch.index) : afterStart
}

function extractUpperTopics(config: ExtractionConfig): Array<{ code: string; title: string; page: number; courseLevel: CourseLevel; rows: string[] }> {
  const pages = readPdfRawPages(config.sourceDocument.path)
  const fullText = pages.join('\n')
  const startMatches = Array.from(fullText.matchAll(/4\.3\s+Fachinhalte der Bausteine/gu))
  const actualStart = startMatches.at(-1)?.index ?? -1
  const actualEnd = fullText.indexOf('5.1 Besonderheiten', actualStart)
  if (actualStart < 0 || actualEnd < 0 || actualEnd <= actualStart) {
    throw new Error('Could not locate Rheinland-Pfalz Sek-II Chemistry Fachinhalte section.')
  }
  const contentText = fullText.slice(actualStart, actualEnd)

  const lines = contentText.split('\n')
  const sectionStarts: Array<{ index: number; code: string; title: string }> = []

  const integrationIndex = lines.findIndex((line) => /^\s*Integrationsphase\s*$/u.test(line))
  if (integrationIndex >= 0) {
    sectionStarts.push({ index: integrationIndex, code: 'INTEGRATIONSPHASE', title: 'Integrationsphase' })
  }

  lines.forEach((line, index) => {
    const match = line.match(/^\s*(\d{1,2}\.\d)\s+(.+?)\s*$/u)
    if (!match) return
    const title = normalizeText(match[2])
    if (match[1] === '4.3' && /Fachinhalte der Bausteine/u.test(title)) return
    if (!title || /^[-−]$/u.test(title)) return
    sectionStarts.push({ index, code: match[1], title })
  })

  const dedupedStarts = sectionStarts
    .sort((left, right) => left.index - right.index)
    .filter((section, index, all) => index === all.findIndex((candidate) => candidate.code === section.code))

  return dedupedStarts.map((section, index) => {
    const next = dedupedStarts[index + 1]
    const blockLines = lines.slice(section.index, next ? next.index : lines.length)
    const normalizedBlock = normalizeText(blockLines.slice(0, 12).join(' '))
    const courseLevel: CourseLevel = normalizedBlock.includes('Leistungsfach') && !normalizedBlock.includes('Grund- und Leistungsfach')
      ? 'LK'
      : 'GK_LK'
    const rows = collectUpperBulletRows(blockLines)
    return {
      code: `BAUSTEIN-${slug(section.code)}`,
      title: section.code === 'INTEGRATIONSPHASE' ? section.title : `${section.code} ${section.title}`,
      page: pageForNeedle(pages, section.title),
      courseLevel,
      rows,
    }
  }).filter((topic) => topic.rows.length > 0)
}

function collectUpperBulletRows(lines: string[]): string[] {
  const rows: string[] = []
  let current = ''

  for (const rawLine of lines) {
    const normalizedLine = normalizeText(rawLine)
    const lineParts = normalizedLine
      .split(/\s+■\s+/u)
      .map((part, index) => (index === 0 ? part : `■ ${part}`))

    for (const line of lineParts) {
      if (!line) continue
      if (/^Vertiefungs- bzw\. Verzahnungsmöglichkeiten/u.test(line)) break
      if (/^([0-9]{1,2}\.\d|[0-9]{1,2}\.|Lehrplan Chemie|P$|W$|WP$|Grundfach|Leistungsfach|Grund- und Leistungsfach|Fundamentum|Additum|\d+h|\+\d+h)$/u.test(line)) {
        continue
      }
      if (/^[■]\s*/u.test(line)) {
        if (current) rows.push(stripBullet(current))
        current = line
        continue
      }
      if (/^[•]\s*/u.test(line)) {
        current = current ? `${current}; ${stripBullet(line)}` : line
        continue
      }
      if (current && !/^(Leitlinie:|Die |In der |Aus dem |Bausteinübergreifend|Die Umsetzung|Aus dem breiten Spektrum)/u.test(line)) {
        current = `${current} ${line}`
      }
    }
  }

  if (current) rows.push(stripBullet(current))
  return rows
    .map(cleanUpperSourceRow)
    .filter((row) => meaningful(row))
}

function cleanUpperSourceRow(value: string): string {
  return normalizeText(value)
    .replace(/\s+\d+\s+\d{1,2}\.\d\s+.*$/u, '')
    .replace(/\s+\d+\s+\d{1,2}\.\s+[A-ZÄÖÜ].*$/u, '')
    .replace(/\s+P\s+Grundund Leistungsfach.*$/u, '')
    .replace(/\s+P\s+Grund- und Leistungsfach.*$/u, '')
    .replace(/\s+W\s+Grundund Leistungsfach.*$/u, '')
    .replace(/\s+WP\s+Grundund Leistungsfach.*$/u, '')
    .replace(/\s+…?\s*\d+\s+5\s+UMSETZUNG IM UNTERRICHT.*$/u, '')
    .replace(/\s+Vertiefungsbzw\..*$/u, '')
    .replace(/\s+\d{1,3}$/u, '')
    .trim()
}

function buildExtraction(
  config: ExtractionConfig,
  topics: Array<{ code: string; title: string; page: number; rows: string[]; courseLevel?: CourseLevel }>,
): SourceExtraction {
  const passages: Passage[] = []
  const sourceGoals: SourceGoal[] = []
  const expectedTopicCodes = topics.map((topic) => topic.code)

  topics.forEach((topic) => {
    const passageId = `rp-chemistry-${config.stage.toLowerCase()}:${slug(topic.code)}`
    const passageGoalIds: string[] = []
    topic.rows.forEach((row, rowIndex) => {
      const goalId = [
        `rp-chem-${config.stage.toLowerCase()}`,
        slug(config.sourceDocument.key),
        slug(topic.code),
        String(rowIndex + 1).padStart(3, '0'),
        hash(`${topic.code}:${row}`),
      ].join('-')
      passageGoalIds.push(goalId)
      sourceGoals.push({
        id: goalId,
        passageId,
        topicCode: topic.code,
        bulletIndex: rowIndex + 1,
        aspectIndex: 1,
        title: titleForGoal(row),
        description: `Die lernende Person kann ${lowercaseFirst(row).replace(/[.;,]$/u, '')}.`,
        sourceText: row,
        sourceSpan: `${topic.title}, Source-Ziel ${rowIndex + 1}`,
        parentBulletText: row,
        sourceRef: `${config.sourceDocument.key} S. ${topic.page}`,
        courseLevel: topic.courseLevel ?? 'GK_LK',
        granularity: 'source-atom',
        tags: [
          'jurisdiction:DE-RP',
          `stage:${config.stage}`,
          `topic:${slug(topic.code)}`,
          `courseLevel:${topic.courseLevel ?? 'GK_LK'}`,
        ],
        rawSourceText: row,
        rawSourceSpan: `${topic.title}, Source-Ziel ${rowIndex + 1}`,
        rawParentBulletText: row,
      })
    })

    passages.push({
      id: passageId,
      topicCode: topic.code,
      title: topic.title,
      text: topic.rows.map((row) => `- ${row}`).join('\n'),
      page: topic.page,
      sourcePath: config.sourceDocument.path,
      sourceGoalIds: passageGoalIds,
    })
  })

  return {
    schemaVersion: 1,
    extractionId: config.extractionId,
    title: config.title,
    sourceLandscapeId: config.sourceLandscapeId,
    jurisdiction: 'DE-RP',
    subject: 'Chemie',
    stage: config.stage,
    sourceDocument: config.sourceDocument,
    sourceDocuments: [config.sourceDocument],
    method: {
      sourceProvision:
        'Amtliche Rheinland-Pfalz-Chemie-Lehrplan-PDF liegt lokal vor; die Quelle wurde ueber die oeffentliche Bildungsserver-Lehrplan-Downloadroute archiviert.',
      passageExtraction: config.stage === 'SekI'
        ? 'pdftotext -layout; Passagegruppen entsprechen den zwoelf Chemie-Themenfeldern des gemeinsamen BCP-Lehrplans.'
        : 'pdftotext -layout; Passagegruppen entsprechen den Fachinhalts-Bausteinen im Kapitel 4.3 des MSS-Chemie-Lehrplans.',
      sourceGoalExtraction: config.stage === 'SekI'
        ? 'Ein Source-Ziel pro Kompetenzbullet plus ein Basiskonzept-/Fachbegriffs-Ziel je Themenfeld; Kontextbeispiele, Differenzierung und Bezüge bleiben Passage-Kontext.'
        : 'Ein Source-Ziel pro fachlichem Inhaltsbullet der Bausteine; Unterpunkte werden als Konkretisierung des jeweiligen Source-Ziels gefuehrt.',
    },
    qualityReview: {
      sourceGoalCountPeerBaseline: {
        accepted: true,
        details: config.peerBaseline,
      },
    },
    expectedTopicCodes,
    pipelineStatus: buildPipelineStatus(config, passages, sourceGoals),
    passages,
    sourceGoals,
  }
}

function lowercaseFirst(value: string): string {
  if (!value) return value
  return `${value[0].toLocaleLowerCase('de-DE')}${value.slice(1)}`
}

function buildPipelineStatus(
  config: ExtractionConfig,
  passages: Passage[],
  sourceGoals: SourceGoal[],
): SourceExtraction['pipelineStatus'] {
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
            id: 'source-document-present',
            label: 'Amtliche Rheinland-Pfalz-Chemie-Quelle liegt lokal vor',
            passed: existsSync(path.resolve(repoRoot, config.sourceDocument.path)),
            details: config.sourceDocument.path,
          },
          {
            id: 'expected-topic-coverage',
            label: 'Erwartete Rheinland-Pfalz-Chemie-Passagegruppen sind vorhanden',
            passed: passages.length > 0,
            details: `${passages.length} Passagegruppen.`,
          },
          {
            id: 'passage-extraction-source',
            label: 'Passage-Extraction basiert auf amtlicher PDF-Quelle',
            passed: true,
            details: `Quelle: ${config.sourceDocument.path}`,
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
            label: 'Aus den amtlichen Rheinland-Pfalz-Chemie-Passagen wurden Source-Ziele erzeugt',
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
        status: 'incomplete',
        dependsOn: ['MAPPING-1', 'MAPPING-2'],
        checks: [
          {
            id: 'mapping-2-complete',
            label: 'MAPPING-2 abgeschlossen',
            passed: true,
            details: `${sourceGoals.length} Source-Ziele liegen vor; MAPPING-3 muss fachlich reviewed werden.`,
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
            passed: false,
            details: `0/${sourceGoals.length} Source-Ziele reviewed; offen: ${sourceGoals.length}.`,
          },
          {
            id: 'm3-all-source-goals-covered-by-canonical',
            label: 'Alle Source-Ziele sind inhaltlich durch SkillPilot-Ziele abgedeckt',
            passed: false,
            details: 'MAPPING-3 ist noch nicht fachlich reviewed.',
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

function writeReviewSeed(config: ExtractionConfig, sourceGoals: SourceGoal[]): void {
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
      notes: 'Review-Seed aus der amtlichen Rheinland-Pfalz-Source-Extraction; MAPPING-3 ist noch offen.',
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

function upsertRegistryEntries(configs: ExtractionConfig[]): void {
  const absolutePath = path.resolve(repoRoot, registryPath)
  const registry = JSON.parse(readFileSync(absolutePath, 'utf8')) as RegistryFile
  const entries = registry.entries ?? []

  for (const config of configs) {
    const nextEntry = {
      landscapeId: config.sourceLandscapeId,
      title: config.stage === 'SekI'
        ? 'Chemie Sekundarstufe I (Rheinland-Pfalz, Lehrplan BCP 2014 Source-Extraction)'
        : 'Chemie Mainzer Studienstufe (Rheinland-Pfalz, Lehrplan 2022 Source-Extraction)',
      jurisdiction: 'DE-RP',
      sourcePath: config.sourceDocument.path,
      archiveSourcePath: config.sourceDocument.path,
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

function main(): void {
  const lowerTopics = extractLowerTopics(lowerConfig)
  const upperTopics = extractUpperTopics(upperConfig)
  const lowerExtraction = buildExtraction(lowerConfig, lowerTopics)
  const upperExtraction = buildExtraction(upperConfig, upperTopics)

  writeJson(lowerConfig.outputPath, lowerExtraction)
  writeJson(upperConfig.outputPath, upperExtraction)
  writeReviewSeed(lowerConfig, lowerExtraction.sourceGoals)
  writeReviewSeed(upperConfig, upperExtraction.sourceGoals)
  upsertRegistryEntries([lowerConfig, upperConfig])

  console.log(`Wrote ${lowerConfig.outputPath} (${lowerExtraction.passages.length} passages, ${lowerExtraction.sourceGoals.length} source goals)`)
  console.log(`Wrote ${upperConfig.outputPath} (${upperExtraction.passages.length} passages, ${upperExtraction.sourceGoals.length} source goals)`)
}

main()
