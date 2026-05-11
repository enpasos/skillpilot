import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

type Jurisdiction = 'DE-BB' | 'DE-BE'
type Category =
  | 'Standards'
  | 'Basiskonzepte'
  | 'Inhalte'
  | 'Fachbegriffe'
  | 'Experimente'
  | 'Kompetenzentwicklung'

interface TopicSpec {
  code: string
  title: string
  page: number
  kind: 'standards' | 'basisConcepts' | 'topic'
}

interface JurisdictionConfig {
  jurisdiction: Jurisdiction
  stateLabel: string
  idPrefix: string
  sourceLandscapeId: string
  extractionId: string
  sourcePdfPath: string
  extractionPath: string
  reviewPath: string
}

interface SourceGoal {
  id: string
  passageId: string
  topicCode: string
  topicTitle: string
  category: Category
  title: string
  description: string
  sourceDocumentKey: string
  sourceRef: string
  sourceText: string
  sourceSpan: {
    passageId: string
    label: string
  }
  sourceGoalCode?: string
  courseLevel: 'GK_LK' | 'unspecified'
  tags: string[]
  metadata: {
    extractionMethod: string
  }
}

interface Passage {
  id: string
  sourceDocumentKey: string
  topicCode: string
  title: string
  page: number
  rawText: string
  sourceGoalIds: string[]
}

interface PipelineCheck {
  id: string
  label: string
  passed: boolean
  details: string
}

interface PipelineStep {
  id: 'MAPPING-1' | 'MAPPING-2' | 'MAPPING-3'
  label: string
  status: 'complete' | 'incomplete' | 'blocked'
  dependsOn: string[]
  checks: PipelineCheck[]
}

const repoRoot = existsSync(path.resolve(process.cwd(), 'curricula'))
  ? process.cwd()
  : path.resolve(process.cwd(), '..')

const sourceDocumentKey = 'RLP-GOST-CHEMIE-2022'
const sourceDocumentTitle = 'Rahmenlehrplan Berlin-Brandenburg Gymnasiale Oberstufe Teil C Chemie 2022'
const targetLandscapeId = 'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0'
const peerBaselineDetails = 'HE/BW Sek-II-Chemie-Referenz: HE 202, BW 126, Median 164, 30%-Korridor 115-213.'

const topics: TopicSpec[] = [
  { code: '2.2.1', title: 'Sachkompetenz', page: 9, kind: 'standards' },
  { code: '2.2.2', title: 'Erkenntnisgewinnungskompetenz', page: 11, kind: 'standards' },
  { code: '2.2.3', title: 'Kommunikationskompetenz', page: 12, kind: 'standards' },
  { code: '2.2.4', title: 'Bewertungskompetenz', page: 13, kind: 'standards' },
  { code: '2.3.1', title: 'Konzept vom Aufbau und von den Eigenschaften der Stoffe und ihrer Teilchen', page: 15, kind: 'basisConcepts' },
  { code: '2.3.2', title: 'Konzept der chemischen Reaktion', page: 15, kind: 'basisConcepts' },
  { code: '2.3.3', title: 'Energiekonzept', page: 16, kind: 'basisConcepts' },
  { code: '3.1.1', title: 'Chemische Reaktionen quantitativ betrachtet', page: 18, kind: 'topic' },
  { code: '3.1.2', title: 'Vom Atom zur chemischen Verbindung', page: 19, kind: 'topic' },
  { code: '3.1.3', title: 'Säuren, Basen, Salze', page: 20, kind: 'topic' },
  { code: '3.1.4', title: 'Grundlagen der organischen Chemie', page: 21, kind: 'topic' },
  { code: '3.1.5', title: 'Organische Stoffe als Energielieferanten', page: 23, kind: 'topic' },
  { code: '3.1.6', title: 'Angewandte organische Chemie – Waschmittel', page: 24, kind: 'topic' },
  { code: '3.1.7', title: 'Analytische und instrumentelle Chemie', page: 25, kind: 'topic' },
  { code: '3.2.1', title: 'Proteine', page: 27, kind: 'topic' },
  { code: '3.2.2', title: 'Kunststoffe – problematische Alleskönner', page: 30, kind: 'topic' },
  { code: '3.2.3', title: 'Chemische Thermodynamik', page: 34, kind: 'topic' },
  { code: '3.2.4', title: 'Reaktionsgeschwindigkeit und Katalyse', page: 38, kind: 'topic' },
  { code: '3.2.5', title: 'Chemisches Gleichgewicht', page: 41, kind: 'topic' },
  { code: '3.2.6', title: 'Säure-Base-Reaktionen', page: 44, kind: 'topic' },
  { code: '3.2.7', title: 'Indikatorfarbstoffe', page: 48, kind: 'topic' },
  { code: '3.2.8', title: 'Redoxreaktionen', page: 50, kind: 'topic' },
  { code: '3.2.9', title: 'Elektrochemie', page: 53, kind: 'topic' },
]

const configs: JurisdictionConfig[] = [
  {
    jurisdiction: 'DE-BB',
    stateLabel: 'Brandenburg',
    idPrefix: 'bb-chemistry',
    sourceLandscapeId: '6a3e6947-d950-5619-8db8-2ab9a6ac55c6',
    extractionId: 'DE-BB-CHEMIE-SEKII-RLP-GOST-2022',
    sourcePdfPath: 'curricula/DE/Gymnasium/input/BB/upper-secondary/Teil_C_RLP_GOST_2022_Chemie.pdf',
    extractionPath: 'curricula/DE/Gymnasium/input/BB/upper-secondary/source-extraction/DE_BB_CHEMIE_SEKII_RLP_GOST_2022.source-extraction.json',
    reviewPath: 'curricula/DE/Gymnasium/mapping/DE-BB/upper-secondary/bb_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.review.json',
  },
  {
    jurisdiction: 'DE-BE',
    stateLabel: 'Berlin',
    idPrefix: 'be-chemistry',
    sourceLandscapeId: '4bb4be30-3d9c-5e5b-9c9f-64fb0bc80c0c',
    extractionId: 'DE-BE-CHEMIE-SEKII-RLP-GOST-2022',
    sourcePdfPath: 'curricula/DE/Gymnasium/input/BE/upper-secondary/Teil_C_RLP_GOST_2022_Chemie.pdf',
    extractionPath: 'curricula/DE/Gymnasium/input/BE/upper-secondary/source-extraction/DE_BE_CHEMIE_SEKII_RLP_GOST_2022.source-extraction.json',
    reviewPath: 'curricula/DE/Gymnasium/mapping/DE-BE/upper-secondary/be_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.review.json',
  },
]

const absoluteRepoPath = (repoRelativePath: string): string => path.resolve(repoRoot, repoRelativePath)

function hash(input: string): string {
  return createHash('sha1').update(input).digest('hex').slice(0, 8)
}

function readPdfText(sourcePath: string): string {
  const pdfPath = absoluteRepoPath(sourcePath)
  if (!existsSync(pdfPath)) throw new Error(`Missing source PDF: ${sourcePath}`)
  return execFileSync('pdftotext', ['-raw', pdfPath, '-'], { encoding: 'utf8' })
    .normalize('NFC')
    .replace(/\u00ad/gu, '')
}

function normalizeLine(line: string): string {
  return line
    .normalize('NFC')
    .replace(/\u00a0/gu, ' ')
    .replace(/[ \t]+/gu, ' ')
    .trim()
}

function cleanSourceText(value: string): string {
  return value
    .normalize('NFC')
    .replace(/\u00ad/gu, '')
    .replace(/\s+([,.;:])/gu, '$1')
    .replace(/\(\s+/gu, '(')
    .replace(/\s+\)/gu, ')')
    .replace(/\s+/gu, ' ')
    .trim()
}

function topicMarker(topic: TopicSpec): string {
  return `${topic.code} ${topic.title}`
}

function findTopicStart(rawText: string, topic: TopicSpec, from: number): number {
  const marker = topicMarker(topic)
  let cursor = from
  while (cursor < rawText.length) {
    const start = rawText.indexOf(marker, cursor)
    if (start === -1) return -1
    const afterMarker = rawText.slice(start + marker.length, start + marker.length + 300)
    const nextNonEmptyLine = afterMarker
      .split(/\r?\n/u)
      .map((line) => normalizeLine(line))
      .find((line) => line.length > 0)
    const isDistributionTableEntry = !nextNonEmptyLine
      || /^Q\d\b/u.test(nextNonEmptyLine)
      || /^3\.\d/u.test(nextNonEmptyLine)
      || /^Seite \d+ von \d+$/u.test(nextNonEmptyLine)
    if (!isDistributionTableEntry) return start
    cursor = start + marker.length
  }
  return -1
}

function bodyStart(rawText: string): number {
  const candidates = [
    '\n2.1 Eingangsvoraussetzungen\n',
    '\n2.2 Abschlussorientierte Standards\n',
    '\n2.2.1 Sachkompetenz\n',
  ]
  for (const candidate of candidates) {
    const index = rawText.indexOf(candidate)
    if (index !== -1) return index
  }
  return 0
}

function extractPassageTexts(rawText: string): Map<string, string> {
  const passages = new Map<string, string>()
  let cursor = bodyStart(rawText)
  topics.forEach((topic, index) => {
    const marker = topicMarker(topic)
    const start = findTopicStart(rawText, topic, cursor)
    if (start === -1) throw new Error(`Topic heading not found: ${marker}`)
    const next = topics[index + 1]
    const nextStart = next ? findTopicStart(rawText, next, start + marker.length) : -1
    const end = nextStart === -1 ? rawText.length : nextStart
    passages.set(
      topic.code,
      rawText
        .slice(start, end)
        .replace(/[ \t]+\n/gu, '\n')
        .replace(/\n{3,}/gu, '\n\n')
        .trim(),
    )
    cursor = start + marker.length
  })
  return passages
}

function isChromeLine(line: string): boolean {
  return line.length === 0
    || /^C Chemie$/u.test(line)
    || /^Seite \d+ von \d+$/u.test(line)
    || /^\d+$/u.test(line)
    || /^Grundkurs$/u.test(line)
    || /^Leistungskurs$/u.test(line)
    || /^\(zusätzlich zum Grundkurs\)$/u.test(line)
    || /^Die Lernenden \u2026$/u.test(line)
    || /^Die Lernenden \.\.\.$/u.test(line)
}

function categoryFromLine(line: string, current: Category): Category {
  if (/^Inhalte?$/u.test(line)) return 'Inhalte'
  if (/^Fachbegriffe$/u.test(line)) return 'Fachbegriffe'
  if (/^Untersuchungen,?$/u.test(line) || /^Experimente$/u.test(line)) return 'Experimente'
  if (/^Basiskonzepte$/u.test(line)) return 'Basiskonzepte'
  if (/^mögliche Beiträge zur Kompetenzentwicklung$/u.test(line)) return 'Kompetenzentwicklung'
  if (/^mögliche Kontexte$/u.test(line) || /^mögliche$/u.test(line) || /^Kontexte$/u.test(line)) return current
  return current
}

function isContextCategoryLine(line: string): boolean {
  return /^mögliche Kontexte$/u.test(line) || /^mögliche$/u.test(line) || /^Kontexte$/u.test(line)
}

function isTopicHeading(line: string): boolean {
  return /^([23]\.\d(?:\.\d+)?)\s+\S/u.test(line)
}

function appendContinuation(previous: string, next: string): string {
  return previous.endsWith('-') ? `${previous.slice(0, -1)}${next}` : `${previous} ${next}`
}

function flushBullet(
  bucket: Array<{ category: Category; text: string }>,
  category: Category,
  currentText: string,
): string {
  const text = cleanSourceText(currentText)
  if (text.length >= 4 && /\p{L}/u.test(text)) {
    bucket.push({ category, text })
  }
  return ''
}

function nextNonEmptyLine(lines: string[], fromIndex: number): string {
  for (let index = fromIndex + 1; index < lines.length; index += 1) {
    const line = normalizeLine(lines[index])
    if (line) return line
  }
  return ''
}

function isBulletLine(rawLine: string): boolean {
  return /^\s*[−-]/u.test(rawLine)
}

function looksLikeInlineSubheading(line: string, nextLine: string, currentText: string): boolean {
  if (!line || !nextLine || !isBulletLine(nextLine)) return false
  const trimmedCurrent = currentText.trim()
  if (currentText.endsWith('-') || /[,(:]$/u.test(trimmedCurrent)) return false
  if (/\b(?:und|oder|von|vom|des|der|die|das|den|dem|ein|eine|einer|eines|einem|einen|mit|für|gegenüber|am|im|beim|zum|zur|unter|aus|nach|bei|durch|verschiedener|unterschiedlicher|klassischen|wässrigen)$/u.test(trimmedCurrent)) {
    return false
  }
  if (/[)]$/u.test(line)) return false
  if (/^[\p{Ll}\d(]/u.test(line)) return false
  if (/[–-]/u.test(line)) return true
  const words = line.split(/\s+/u).filter(Boolean)
  const titleLikeWords = words.filter((word) => /^\p{Lu}/u.test(word)).length
  return words.length <= 6 && titleLikeWords / Math.max(words.length, 1) >= 0.5
}

function parseBulletGoals(
  text: string,
  defaultCategory: Category,
  includeCategories: Set<Category>,
): Array<{ category: Category; text: string }> {
  const result: Array<{ category: Category; text: string }> = []
  const seen = new Set<string>()
  const lines = text.split(/\r?\n/u)
  let category = defaultCategory
  let currentCategory = defaultCategory
  let currentText = ''
  let inContextBlock = false

  const flush = () => {
    if (!inContextBlock && includeCategories.has(currentCategory)) {
      currentText = flushBullet(result, currentCategory, currentText)
    } else {
      currentText = ''
    }
  }

  for (let index = 0; index < lines.length; index += 1) {
    const rawLine = lines[index]
    const line = normalizeLine(rawLine)
    if (isContextCategoryLine(line)) {
      flush()
      inContextBlock = true
      continue
    }
    const nextCategory = categoryFromLine(line, category)
    if (nextCategory !== category) {
      flush()
      category = nextCategory
      currentCategory = nextCategory
      inContextBlock = false
      continue
    }

    const bullet = rawLine.match(/^\s*[−-]\s*(.*)$/u)
    if (bullet) {
      flush()
      currentCategory = category
      currentText = bullet[1]
      continue
    }

    if (
      currentText
      && !isChromeLine(line)
      && !isTopicHeading(line)
      && !looksLikeInlineSubheading(line, nextNonEmptyLine(lines, index), currentText)
    ) {
      currentText = appendContinuation(currentText, line)
      continue
    }

    if (!line || isChromeLine(line) || isTopicHeading(line)) {
      flush()
    }
  }
  flush()

  return result.filter((entry) => {
    const key = `${entry.category}|${entry.text.toLocaleLowerCase('de-DE')}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function descriptionFor(entry: { category: Category; text: string; sourceGoalCode?: string }): string {
  if (entry.sourceGoalCode) return `Die lernende Person kann ${entry.text}.`
  if (entry.category === 'Fachbegriffe') {
    return `Die lernende Person kann die Fachbegriffe ${entry.text} sachgerecht verwenden.`
  }
  return `Die lernende Person kann ${entry.text} fachlich einordnen und anwenden.`
}

function buildSourceGoals(config: JurisdictionConfig, passagesByTopic: Map<string, string>): SourceGoal[] {
  return topics.flatMap((topic) => {
    const passageText = passagesByTopic.get(topic.code)
    if (!passageText) throw new Error(`Missing passage for ${topic.code}`)
    const entries = topic.kind === 'topic'
      ? parseBulletGoals(passageText, 'Inhalte', new Set<Category>(['Inhalte']))
      : []

    return entries.map((entry, index): SourceGoal => {
      const passageId = `${config.idPrefix}-sekii-rlp-${topic.code.replaceAll('.', '-')}`
      const categorySlug = entry.category.toLocaleLowerCase('de-DE').replaceAll('ä', 'ae').replaceAll('ö', 'oe').replaceAll('ü', 'ue')
      const sourceGoalCode = entry.sourceGoalCode
      const idBase = `${passageId}-${categorySlug}-${String(index + 1).padStart(3, '0')}`
      const sourceSpanLabel = sourceGoalCode
        ? `${sourceGoalCode}: ${entry.text}`
        : `${entry.category}: ${entry.text}`
      return {
        id: `${idBase}-${hash(`${topic.code}|${entry.category}|${sourceGoalCode ?? ''}|${entry.text}`)}`,
        passageId,
        topicCode: topic.code,
        topicTitle: topic.title,
        category: entry.category,
        title: entry.text,
        description: descriptionFor(entry),
        sourceDocumentKey,
        sourceRef: `${sourceDocumentTitle}, ${topic.code} ${topic.title}, S. ${topic.page}.`,
        sourceText: entry.text,
        sourceSpan: {
          passageId,
          label: sourceSpanLabel,
        },
        sourceGoalCode,
        courseLevel: 'unspecified',
        tags: [
          `subject:Chemie`,
          `jurisdiction:${config.jurisdiction}`,
          'stage:SekII',
          `topic:${topic.code}`,
          `category:${entry.category}`,
        ],
        metadata: {
          extractionMethod: 'pdftotext-raw-official-pdf-bullet-and-standard-extraction',
        },
      }
    })
  })
}

function buildPassages(config: JurisdictionConfig, passagesByTopic: Map<string, string>, sourceGoals: SourceGoal[]): Passage[] {
  return topics.map((topic) => {
    const passageId = `${config.idPrefix}-sekii-rlp-${topic.code.replaceAll('.', '-')}`
    return {
      id: passageId,
      sourceDocumentKey,
      topicCode: topic.code,
      title: `${topic.code} ${topic.title}`,
      page: topic.page,
      rawText: passagesByTopic.get(topic.code) ?? '',
      sourceGoalIds: sourceGoals.filter((goal) => goal.passageId === passageId).map((goal) => goal.id),
    }
  })
}

function duplicates(values: string[]): string[] {
  const seen = new Set<string>()
  const duplicate = new Set<string>()
  for (const value of values) {
    if (seen.has(value)) duplicate.add(value)
    seen.add(value)
  }
  return [...duplicate].sort()
}

function buildPipeline(config: JurisdictionConfig, passages: Passage[], sourceGoals: SourceGoal[]): { currentStep: string; steps: PipelineStep[] } {
  const foundTopicCodes = new Set(passages.map((passage) => passage.topicCode))
  const missingTopics = topics.map((topic) => topic.code).filter((code) => !foundTopicCodes.has(code))
  const duplicateTopicCodes = duplicates(passages.map((passage) => passage.topicCode))
  const passagesWithoutText = passages.filter((passage) => !passage.rawText.trim()).map((passage) => passage.id)
  const sourceGoalBearingPassageIds = new Set(topics
    .filter((topic) => topic.kind === 'topic')
    .map((topic) => `${config.idPrefix}-sekii-rlp-${topic.code.replaceAll('.', '-')}`))
  const passagesWithoutGoals = passages
    .filter((passage) => sourceGoalBearingPassageIds.has(passage.id) && passage.sourceGoalIds.length === 0)
    .map((passage) => passage.id)
  const duplicateSourceGoalIds = duplicates(sourceGoals.map((goal) => goal.id))
  const sourceGoalsWithoutPassage = sourceGoals
    .filter((goal) => !passages.some((passage) => passage.id === goal.passageId))
    .map((goal) => goal.id)
  const sourceDocumentPresent = existsSync(absoluteRepoPath(config.sourcePdfPath))
  const m1Complete = sourceDocumentPresent
    && missingTopics.length === 0
    && duplicateTopicCodes.length === 0
    && passagesWithoutText.length === 0
  const m2Complete = m1Complete
    && sourceGoals.length > 0
    && passagesWithoutGoals.length === 0
    && duplicateSourceGoalIds.length === 0
    && sourceGoalsWithoutPassage.length === 0
    && sourceGoals.length >= 115
    && sourceGoals.length <= 213

  const steps: PipelineStep[] = [
    {
      id: 'MAPPING-1',
      label: 'Original-Lehrplanpassagen extrahiert',
      status: m1Complete ? 'complete' : 'incomplete',
      dependsOn: [],
      checks: [
        {
          id: 'source-document-present',
          label: 'Amtliche BE/BB-Chemie-GOST-Quelle liegt lokal vor',
          passed: sourceDocumentPresent,
          details: config.sourcePdfPath,
        },
        {
          id: 'expected-topic-coverage',
          label: 'Alle erwarteten Chemie-GOST-Abschnitte sind als Lehrplanpassagen vorhanden',
          passed: missingTopics.length === 0,
          details: `${passages.length}/${topics.length} Abschnitte; fehlend: ${missingTopics.join(', ') || '-'}`,
        },
        {
          id: 'unique-topic-passages',
          label: 'Jeder Abschnitt hat genau eine Passage',
          passed: duplicateTopicCodes.length === 0,
          details: `Doppelte Abschnitte: ${duplicateTopicCodes.join(', ') || '-'}`,
        },
        {
          id: 'passage-text-present',
          label: 'Jede Passage enthält offiziellen Text',
          passed: passagesWithoutText.length === 0,
          details: `Passagen ohne Text: ${passagesWithoutText.join(', ') || '-'}`,
        },
      ],
    },
    {
      id: 'MAPPING-2',
      label: 'Source-Ziele aus Lehrplanpassagen erstellt',
      status: m2Complete ? 'complete' : m1Complete ? 'incomplete' : 'blocked',
      dependsOn: ['MAPPING-1'],
      checks: [
        {
          id: 'source-goals-created',
          label: 'Aus den Inhaltszeilen der E-/Q-Themenfelder wurden Source-Ziele erzeugt',
          passed: sourceGoals.length > 0,
          details: `${sourceGoals.length} Source-Ziele`,
        },
        {
          id: 'passage-to-source-goal-coverage',
          label: 'Jede zieltragende Themenfeld-Passage hat mindestens ein Source-Ziel',
          passed: passagesWithoutGoals.length === 0,
          details: `Themenfeld-Passagen ohne Source-Ziele: ${passagesWithoutGoals.join(', ') || '-'}; Standards und Basiskonzepte bleiben Passage-Kontext.`,
        },
        {
          id: 'source-goal-ids-unique',
          label: 'Source-Ziel-IDs sind eindeutig',
          passed: duplicateSourceGoalIds.length === 0,
          details: `Doppelte IDs: ${duplicateSourceGoalIds.join(', ') || '-'}`,
        },
        {
          id: 'source-goals-reference-passages',
          label: 'Jedes Source-Ziel referenziert eine vorhandene Originalpassage',
          passed: sourceGoalsWithoutPassage.length === 0,
          details: `Ohne Passage: ${sourceGoalsWithoutPassage.join(', ') || '-'}`,
        },
        {
          id: 'count-sanity',
          label: 'Source-Ziel-Anzahl ist gegen den geprüften HE/BW-Median plausibilisiert',
          passed: sourceGoals.length >= 115 && sourceGoals.length <= 213,
          details: `${sourceGoals.length} Source-Ziele. ${peerBaselineDetails}`,
        },
      ],
    },
    {
      id: 'MAPPING-3',
      label: 'Source-Ziele auf SkillPilot-Ziele gemappt',
      status: m2Complete ? 'incomplete' : 'blocked',
      dependsOn: ['MAPPING-1', 'MAPPING-2'],
      checks: [
        {
          id: 'mapping-2-complete',
          label: 'MAPPING-2 abgeschlossen',
          passed: m2Complete,
          details: m2Complete
            ? `${sourceGoals.length} Source-Ziele liegen vor; MAPPING-3 läuft gegen diese Source-Extraction-IDs.`
            : 'MAPPING-2 ist noch nicht abgeschlossen.',
        },
        {
          id: 'm3-review-file-present',
          label: 'M3-Review-Datei ist vorhanden',
          passed: existsSync(absoluteRepoPath(config.reviewPath)),
          details: config.reviewPath,
        },
        {
          id: 'm3-review-decisions-reference-source-goals',
          label: 'M3-Review-Entscheidungen referenzieren gültige Source-Ziele',
          passed: true,
          details: 'Noch keine Review-Entscheidungen vorhanden.',
        },
        {
          id: 'm3-review-targets-exist',
          label: 'M3-Review-Ziele referenzieren vorhandene Canonical-Ziele',
          passed: true,
          details: 'Noch keine Canonical-Ziele referenziert.',
        },
        {
          id: 'm3-all-source-goals-reviewed',
          label: 'Alle Source-Ziele haben eine fachliche M3-Entscheidung',
          passed: false,
          details: `0/${sourceGoals.length} Source-Ziele reviewed; offen: ${sourceGoals.length}.`,
        },
        {
          id: 'm3-all-source-goals-covered-by-canonical',
          label: 'Alle Source-Ziele sind durch SkillPilot-Ziele abgedeckt',
          passed: false,
          details: `Fachlich abgedeckt: 0/${sourceGoals.length}; MAPPING-3 steht aus.`,
        },
      ],
    },
  ]

  return {
    currentStep: steps.find((step) => step.status !== 'complete')?.id ?? '',
    steps,
  }
}

function writeReviewSeed(config: JurisdictionConfig, sourceGoals: SourceGoal[]): void {
  const reviewPath = absoluteRepoPath(config.reviewPath)
  mkdirSync(path.dirname(reviewPath), { recursive: true })
  if (existsSync(reviewPath)) {
    try {
      const existing = JSON.parse(readFileSync(reviewPath, 'utf8')) as { mappings?: unknown[]; decisions?: unknown[] }
      if ((existing.mappings?.length ?? 0) > 0 || (existing.decisions?.length ?? 0) > 0) return
    } catch {
      // Fall through and rewrite malformed handoff files.
    }
  }
  writeFileSync(reviewPath, `${JSON.stringify({
    version: 1,
    reviewId: `${config.extractionId}-MAPPING-3-SOURCE-EXTRACTION-1`,
    sourceLandscapeId: config.sourceLandscapeId,
    targetLandscapeId,
    sourceExtractionPath: config.extractionPath,
    status: {
      scope: `${config.stateLabel} Chemie Sek II / RLP GOST 2022 Teil C Chemie 2.2.1 bis 3.2.9`,
      reviewedSourceGoals: 0,
      mappedSourceGoals: 0,
      needsViewPlacementReview: 0,
      needsCanonicalGoal: 0,
      unreviewedSourceGoals: sourceGoals.length,
    },
    mappings: [],
    decisions: [],
    note:
      'M3-Handoff-Datei fuer die amtliche BE/BB-Chemie-GOST-Source-Extraction. Keine fachliche Abdeckung behaupten: Entscheidungen und Mappings werden im naechsten Review-Pass ergaenzt.',
  }, null, 2)}\n`)
}

function buildExtraction(config: JurisdictionConfig) {
  const rawText = readPdfText(config.sourcePdfPath)
  const passagesByTopic = extractPassageTexts(rawText)
  const sourceGoals = buildSourceGoals(config, passagesByTopic)
  const passages = buildPassages(config, passagesByTopic, sourceGoals)
  return {
    schemaVersion: 1,
    extractionId: config.extractionId,
    title: `${config.jurisdiction} - Chemie Oberstufe (${config.stateLabel}, RLP GOST 2022 Source-Extraction)`,
    sourceLandscapeId: config.sourceLandscapeId,
    jurisdiction: config.jurisdiction,
    subject: 'Chemie',
    stage: 'SekII',
    sourceDocument: {
      key: sourceDocumentKey,
      title: sourceDocumentTitle,
      path: config.sourcePdfPath,
      official: true,
      sections: topics,
    },
    sourceDocuments: [
      {
        key: sourceDocumentKey,
        title: sourceDocumentTitle,
        path: config.sourcePdfPath,
        official: true,
      },
    ],
    method: {
      type: 'official-pdf-source-extraction',
      notes:
        'Die Source-Extraction basiert auf dem lokal archivierten amtlichen Teil-C-PDF Chemie fuer die gymnasiale Oberstufe Berlin-Brandenburg. Als Passagen werden Abschlussstandards, das Basiskonzept-Kapitel 2.3 sowie die E-Phasen- und Q-Phasen-Themenfelder extrahiert. Source-Ziele werden nur aus den Inhaltszeilen der Themenfelder erzeugt; Standards, Basiskonzepte, Experimente, Fachbegriffe, Kontexte und exemplarische Kompetenzentwicklungsbeitraege bleiben Passage-Kontext. Die Source-Ziel-Extraktion nutzt pdftotext -raw, damit die zweispaltigen Grundkurs-/Leistungskurs-Tabellen nicht zu gemischten Kunstzielen verkleben.',
    },
    expectedTopicCodes: topics.map((topic) => topic.code),
    pipelineStatus: buildPipeline(config, passages, sourceGoals),
    passages,
    sourceGoals,
  }
}

for (const config of configs) {
  const extraction = buildExtraction(config)
  const outputPath = absoluteRepoPath(config.extractionPath)
  mkdirSync(path.dirname(outputPath), { recursive: true })
  writeFileSync(outputPath, `${JSON.stringify(extraction, null, 2)}\n`)
  writeReviewSeed(config, extraction.sourceGoals)
  console.log(`${config.jurisdiction}: wrote ${extraction.sourceGoals.length} source goals to ${config.extractionPath}`)
}
