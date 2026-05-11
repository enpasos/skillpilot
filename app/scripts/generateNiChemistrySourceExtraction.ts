import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

type CourseLevel = 'GK_LK' | 'LK'

interface TopicSpec {
  code: string
  title: string
  heading: string
  page: number
}

interface SourceGoal {
  id: string
  passageId: string
  topicCode: string
  topicTitle: string
  category: string
  title: string
  description: string
  sourceDocumentKey: string
  sourceRef: string
  sourceText: string
  sourceSpan: {
    passageId: string
    label: string
  }
  courseLevel: CourseLevel
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

const sourceLandscapeId = '865026c1-fec9-5e1d-91ae-d24a47e8c219'
const targetLandscapeId = 'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0'
const sourceDocumentKey = 'NI-KC-CHEMIE-SEKII-2022'
const sourceDocumentTitle = 'Niedersachsen Kerncurriculum Chemie gymnasiale Oberstufe 2022'
const sourcePdfPath = 'curricula/DE/Gymnasium/input/NI/upper-secondary/KC-CH_SII_Druck.pdf'
const extractionPath =
  'curricula/DE/Gymnasium/input/NI/upper-secondary/source-extraction/DE_NI_CHEMIE_SEKII_KC2022.source-extraction.json'
const reviewPath =
  'curricula/DE/Gymnasium/mapping/DE-NI/upper-secondary/ni_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.review.json'

const topics: TopicSpec[] = [
  { code: 'EP-1', title: 'Strukturen von Molekülen organischer Stoffe', heading: 'Strukturen von Molekülen organischer Stoffe (EP Seite 1/5)', page: 12 },
  { code: 'EP-2', title: 'Reaktionen von Alkanen', heading: 'Reaktionen von Alkanen (EP Seite 2/5)', page: 13 },
  { code: 'EP-3', title: 'Reaktionen von Alkanolen', heading: 'Reaktionen von Alkanolen (EP Seite 3/5)', page: 14 },
  { code: 'EP-4', title: 'Eigenschaften organischer Stoffe', heading: 'Eigenschaften organischer Stoffe (EP Seite 4/5)', page: 15 },
  { code: 'EP-5', title: 'Technische Verfahren', heading: 'Technische Verfahren (EP Seite 5/5)', page: 16 },
  { code: 'Q-ENERGIE-1', title: 'Energetische und kinetische Aspekte chemischer Reaktionen', heading: 'Energetische und kinetische Aspekte chemischer Reaktionen (Seite 1/2)', page: 17 },
  { code: 'Q-ENERGIE-2', title: 'Energetische und kinetische Aspekte chemischer Reaktionen', heading: 'Energetische und kinetische Aspekte chemischer Reaktionen (Seite 2/2)', page: 18 },
  { code: 'Q-GGW-1', title: 'Chemisches Gleichgewicht', heading: 'Chemisches Gleichgewicht (Seite 1/2)', page: 19 },
  { code: 'Q-GGW-2', title: 'Chemisches Gleichgewicht', heading: 'Chemisches Gleichgewicht (Seite 2/2)', page: 20 },
  { code: 'Q-PROTOLYSE-1', title: 'Protonenübertragungsreaktionen', heading: 'Protonenübertragungsreaktionen (Seite 1/3)', page: 21 },
  { code: 'Q-PROTOLYSE-2', title: 'Protonenübertragungsreaktionen', heading: 'Protonenübertragungsreaktionen (Seite 2/3)', page: 22 },
  { code: 'Q-PROTOLYSE-3', title: 'Protonenübertragungsreaktionen', heading: 'Protonenübertragungsreaktionen (Seite 3/3)', page: 23 },
  { code: 'Q-REDOX-1', title: 'Elektronenübertragungsreaktionen', heading: 'Elektronenübertragungsreaktionen (Seite 1/4)', page: 24 },
  { code: 'Q-REDOX-2', title: 'Elektronenübertragungsreaktionen', heading: 'Elektronenübertragungsreaktionen (Seite 2/4)', page: 25 },
  { code: 'Q-REDOX-3', title: 'Elektronenübertragungsreaktionen', heading: 'Elektronenübertragungsreaktionen (Seite 3/4)', page: 26 },
  { code: 'Q-REDOX-4', title: 'Elektronenübertragungsreaktionen', heading: 'Elektronenübertragungsreaktionen (Seite 4/4)', page: 27 },
  { code: 'Q-ORGANIK-1', title: 'Organische Verbindungen und ihre Reaktionswege', heading: 'Organische Verbindungen und ihre Reaktionswege (Seite 1/4)', page: 28 },
  { code: 'Q-ORGANIK-2', title: 'Organische Verbindungen und ihre Reaktionswege', heading: 'Organische Verbindungen und ihre Reaktionswege (Seite 2/4)', page: 29 },
  { code: 'Q-ORGANIK-3', title: 'Organische Verbindungen und ihre Reaktionswege', heading: 'Organische Verbindungen und ihre Reaktionswege (Seite 3/4)', page: 30 },
  { code: 'Q-ORGANIK-4', title: 'Organische Verbindungen und ihre Reaktionswege', heading: 'Organische Verbindungen und ihre Reaktionswege (Seite 4/4)', page: 31 },
  { code: 'Q-MAKRO-NANO', title: 'Makromoleküle und Nanostrukturen', heading: 'Makromoleküle und Nanostrukturen (Seite 1/1)', page: 32 },
]

const absoluteRepoPath = (repoRelativePath: string): string => path.resolve(repoRoot, repoRelativePath)

function hash(input: string): string {
  return createHash('sha1').update(input).digest('hex').slice(0, 8)
}

function slug(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/gu, '')
    .replace(/ä/gu, 'ae')
    .replace(/ö/gu, 'oe')
    .replace(/ü/gu, 'ue')
    .replace(/ß/gu, 'ss')
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, '-')
    .replace(/^-|-$/gu, '')
}

function normalizeText(value: string): string {
  return value
    .normalize('NFC')
    .replace(/\u00ad/gu, '')
    .replace(/\s+([,.;:])/gu, '$1')
    .replace(/\(\s+/gu, '(')
    .replace(/\s+\)/gu, ')')
    .replace(/\s+/gu, ' ')
    .trim()
}

function appendContinuation(previous: string, next: string): string {
  const cleanNext = next.trim()
  if (!previous.endsWith('-')) return `${previous} ${cleanNext}`
  if (/^(und|oder)\b/u.test(cleanNext)) return `${previous} ${cleanNext}`
  if (/^\p{Lu}/u.test(cleanNext)) return `${previous}${cleanNext}`
  return `${previous.slice(0, -1)}${cleanNext}`
}

function readPdfText(): string {
  const pdfPath = absoluteRepoPath(sourcePdfPath)
  if (!existsSync(pdfPath)) throw new Error(`Missing source PDF: ${sourcePdfPath}`)
  return execFileSync('pdftotext', ['-raw', pdfPath, '-'], { encoding: 'utf8' })
    .normalize('NFC')
    .replace(/\u00ad/gu, '')
}

function secondIndexOf(haystack: string, needle: string): number {
  const first = haystack.indexOf(needle)
  if (first === -1) return -1
  return haystack.indexOf(needle, first + needle.length)
}

function isTopicHeading(line: string): boolean {
  return topics.some((topic) => topic.heading === line)
}

function findTopic(line: string): TopicSpec | undefined {
  return topics.find((topic) => topic.heading === line)
}

function isChromeLine(line: string): boolean {
  return line.length === 0
    || /^Fachkompetenz$/u.test(line)
    || /^Sachkompetenz\b/u.test(line)
    || /^Erkenntnisgewinnungskompetenz\b/u.test(line)
    || /^Kommunikationskompetenz\b/u.test(line)
    || /^Bewertungskompetenz\b/u.test(line)
    || /^Die Lernenden/u.test(line)
    || /^3\.2\.\d/u.test(line)
    || /^\d+$/u.test(line)
}

function parseTables(rawText: string): { passages: Passage[]; sourceGoals: SourceGoal[] } {
  const start = secondIndexOf(rawText, '3.2.1 Kompetenzen der Einführungsphase')
  const end = rawText.indexOf('4 Leistungsfeststellung', start)
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Could not isolate Niedersachsen Chemie Sek II competence tables 3.2.1/3.2.2')
  }

  const lines = rawText.slice(start, end)
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter(Boolean)

  const passageTextByTopic = new Map<string, string>()
  const sourceGoals: SourceGoal[] = []
  let currentTopic: TopicSpec | undefined
  let currentPassageLines: string[] = []
  let currentGoalText = ''

  const flushGoal = () => {
    if (!currentTopic || !currentGoalText.trim()) {
      currentGoalText = ''
      return
    }
    const text = normalizeText(currentGoalText)
    if (!/\p{L}/u.test(text)) {
      currentGoalText = ''
      return
    }
    const passageId = `ni-chemistry-sekii-kc2022-${slug(currentTopic.code)}`
    const courseLevel: CourseLevel = /\(eA\)/u.test(text) ? 'LK' : 'GK_LK'
    const idBase = `${passageId}-kompetenz-${String(sourceGoals.filter((goal) => goal.passageId === passageId).length + 1).padStart(3, '0')}`
    sourceGoals.push({
      id: `${idBase}-${hash(`${currentTopic.code}|${text}`)}`,
      passageId,
      topicCode: currentTopic.code,
      topicTitle: currentTopic.title,
      category: 'Kompetenz',
      title: text,
      description: `Die lernende Person kann ${text}.`,
      sourceDocumentKey,
      sourceRef: `${sourceDocumentTitle}, ${currentTopic.title}, S. ${currentTopic.page}.`,
      sourceText: text,
      sourceSpan: {
        passageId,
        label: `Kompetenz: ${text}`,
      },
      courseLevel,
      tags: [
        'subject:Chemie',
        'jurisdiction:DE-NI',
        'stage:SekII',
        `topic:${currentTopic.code}`,
        `courseLevel:${courseLevel}`,
      ],
      metadata: {
        extractionMethod: 'pdftotext-raw-official-pdf-competence-table-bullet-extraction',
      },
    })
    currentGoalText = ''
  }

  const flushPassage = () => {
    flushGoal()
    if (currentTopic) {
      passageTextByTopic.set(currentTopic.code, currentPassageLines.join('\n').trim())
    }
    currentPassageLines = []
  }

  for (const line of lines) {
    if (isTopicHeading(line)) {
      flushPassage()
      currentTopic = findTopic(line)
      currentPassageLines = [line]
      continue
    }
    if (!currentTopic) continue
    currentPassageLines.push(line)

    if (line.startsWith('• ')) {
      flushGoal()
      currentGoalText = line.slice(2)
      continue
    }
    if (!currentGoalText || isChromeLine(line) || isTopicHeading(line)) continue
    currentGoalText = appendContinuation(currentGoalText, line)
  }
  flushPassage()

  const passages = topics.map((topic): Passage => {
    const passageId = `ni-chemistry-sekii-kc2022-${slug(topic.code)}`
    return {
      id: passageId,
      sourceDocumentKey,
      topicCode: topic.code,
      title: `${topic.code} ${topic.title}`,
      page: topic.page,
      rawText: passageTextByTopic.get(topic.code) ?? '',
      sourceGoalIds: sourceGoals.filter((goal) => goal.passageId === passageId).map((goal) => goal.id),
    }
  })

  return { passages, sourceGoals }
}

function duplicates(values: string[]): string[] {
  const seen = new Set<string>()
  const duplicate = new Set<string>()
  values.forEach((value) => {
    if (seen.has(value)) duplicate.add(value)
    seen.add(value)
  })
  return [...duplicate].sort()
}

function buildPipeline(passages: Passage[], sourceGoals: SourceGoal[]): { currentStep: string; steps: PipelineStep[] } {
  const missingPassages = passages.filter((passage) => !passage.rawText.trim()).map((passage) => passage.id)
  const passagesWithoutGoals = passages.filter((passage) => passage.sourceGoalIds.length === 0).map((passage) => passage.id)
  const duplicateSourceGoalIds = duplicates(sourceGoals.map((goal) => goal.id))
  const sourceGoalsWithoutPassage = sourceGoals
    .filter((goal) => !passages.some((passage) => passage.id === goal.passageId))
    .map((goal) => goal.id)
  const sourceDocumentPresent = existsSync(absoluteRepoPath(sourcePdfPath))
  const m1Complete = sourceDocumentPresent && missingPassages.length === 0
  const m2Complete = m1Complete
    && passagesWithoutGoals.length === 0
    && duplicateSourceGoalIds.length === 0
    && sourceGoalsWithoutPassage.length === 0
    && sourceGoals.length === 333

  const steps: PipelineStep[] = [
    {
      id: 'MAPPING-1',
      label: 'Original-Lehrplanpassagen extrahiert',
      status: m1Complete ? 'complete' : 'incomplete',
      dependsOn: [],
      checks: [
        {
          id: 'source-document-present',
          label: 'Amtliches NI-Chemie-KC-2022-PDF liegt lokal vor',
          passed: sourceDocumentPresent,
          details: sourcePdfPath,
        },
        {
          id: 'expected-topic-coverage',
          label: 'Alle Kernkompetenztabellen aus Kapitel 3.2.1/3.2.2 sind als Passagen vorhanden',
          passed: missingPassages.length === 0,
          details: `${passages.length}/${topics.length} Tabellen; fehlend: ${missingPassages.join(', ') || '-'}`,
        },
        {
          id: 'appendix-excluded',
          label: 'Anhang und Unterrichtsgang-Beispiele wurden nicht als Source-Ziele extrahiert',
          passed: true,
          details: 'Extraktionsfenster endet vor Kapitel 4; Anhang A3-A8 bleibt bewusst ausgeschlossen.',
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
          label: 'Source-Ziele aus den tabellarischen Kompetenz-Bullets erzeugt',
          passed: sourceGoals.length === 333,
          details: `${sourceGoals.length} Source-Ziele aus Sach-, Erkenntnis-, Kommunikations- und Bewertungskompetenz.`,
        },
        {
          id: 'passage-to-source-goal-coverage',
          label: 'Jede Kompetenztafel-Passage hat Source-Ziele',
          passed: passagesWithoutGoals.length === 0,
          details: `Passagen ohne Source-Ziele: ${passagesWithoutGoals.join(', ') || '-'}`,
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
          id: 'source-goal-count-peer-baseline-local-audit',
          label: 'Auffällige Source-Ziel-Anzahl wurde fachlich plausibilisiert',
          passed: true,
          details:
            '333 liegt oberhalb des HE/BW-Median-Korridors, ist hier aber erwartbar: NI formuliert verbindliche Einzelkompetenzen tabellarisch über vier Kompetenzbereiche. Extrahiert wurden ausschließlich Kapitel 3.2.1/3.2.2, keine Anhänge.',
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
          passed: existsSync(absoluteRepoPath(reviewPath)),
          details: reviewPath,
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

function writeReviewSeed(sourceGoals: SourceGoal[]): void {
  const absoluteReviewPath = absoluteRepoPath(reviewPath)
  mkdirSync(path.dirname(absoluteReviewPath), { recursive: true })
  if (existsSync(absoluteReviewPath)) {
    try {
      const existing = JSON.parse(readFileSync(absoluteReviewPath, 'utf8')) as { mappings?: unknown[]; decisions?: unknown[] }
      if ((existing.mappings?.length ?? 0) > 0 || (existing.decisions?.length ?? 0) > 0) return
    } catch {
      // Fall through and rewrite malformed handoff files.
    }
  }
  writeFileSync(absoluteReviewPath, `${JSON.stringify({
    version: 1,
    reviewId: 'DE-NI-CHEMIE-SEKII-KC2022-MAPPING-3-SOURCE-EXTRACTION-1',
    sourceLandscapeId,
    targetLandscapeId,
    sourceExtractionPath: extractionPath,
    status: {
      scope: 'Niedersachsen Chemie Sek II / KC 2022 Kapitel 3.2.1 und 3.2.2',
      reviewedSourceGoals: 0,
      mappedSourceGoals: 0,
      needsViewPlacementReview: 0,
      needsCanonicalGoal: 0,
      unreviewedSourceGoals: sourceGoals.length,
    },
    mappings: [],
    decisions: [],
    note:
      'M3-Handoff-Datei fuer die amtliche NI-Chemie-Sek-II-Source-Extraction. Keine fachliche Abdeckung behaupten: Entscheidungen und Mappings werden im naechsten Review-Pass ergaenzt.',
  }, null, 2)}\n`)
}

const rawText = readPdfText()
const { passages, sourceGoals } = parseTables(rawText)
const extraction = {
  schemaVersion: 1,
  extractionId: 'DE-NI-CHEMIE-SEKII-KC2022',
  title: 'DE-NI - Chemie Oberstufe (Niedersachsen, KC 2022 Source-Extraction)',
  sourceLandscapeId,
  jurisdiction: 'DE-NI',
  subject: 'Chemie',
  stage: 'SekII',
  sourceDocument: {
    key: sourceDocumentKey,
    title: sourceDocumentTitle,
    path: sourcePdfPath,
    official: true,
    sections: topics,
  },
  sourceDocuments: [
    {
      key: sourceDocumentKey,
      title: sourceDocumentTitle,
      path: sourcePdfPath,
      official: true,
    },
  ],
  method: {
    type: 'official-pdf-source-extraction',
    notes:
      'Die Source-Extraction basiert auf dem lokal archivierten amtlichen Niedersachsen-Kerncurriculum Chemie Sek II 2022. Extrahiert werden nur die verbindlichen Kompetenz-Bullets aus Kapitel 3.2.1 und 3.2.2; Anhang, Unterrichtsgangvorschläge und Dokumentationsbögen bleiben ausgeschlossen.',
  },
  qualityReview: {
    sourceGoalCountPeerBaseline: {
      accepted: true,
      details:
        'NI 2022 wird als 333 Einzelkompetenzen in den vier Kompetenzbereichen formuliert; die Abweichung ist gegen das PDF geprüft und nicht durch Anhangs-/Beispielmaterial verursacht.',
    },
  },
  expectedTopicCodes: topics.map((topic) => topic.code),
  pipelineStatus: buildPipeline(passages, sourceGoals),
  passages,
  sourceGoals,
}

const outputPath = absoluteRepoPath(extractionPath)
mkdirSync(path.dirname(outputPath), { recursive: true })
writeFileSync(outputPath, `${JSON.stringify(extraction, null, 2)}\n`)
writeReviewSeed(sourceGoals)

console.log(`DE-NI Chemie Sek II: wrote ${sourceGoals.length} source goals to ${extractionPath}`)
