import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

type Stage = 'SekI' | 'SekII'
type CourseLevel = 'GK_LK' | 'LK' | 'unspecified'

interface SourceDocument {
  key: string
  title: string
  path: string
  official: true
}

interface TopicSpec {
  code: string
  title: string
  stage: Stage
  courseLevel: CourseLevel
  page: number
}

interface ParsedTopic {
  spec: TopicSpec
  rawText: string
  sourceGoalTexts: string[]
}

interface SourceGoal {
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
  granularity: 'officialCompetency'
  tags: string[]
  rawSourceText: string
  rawSourceSpan: string
  rawParentBulletText: string
}

interface Passage {
  id: string
  topicCode: string
  title: string
  text: string
  page: number
  sourcePath: string
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

interface ExtractionConfig {
  extractionId: string
  sourceLandscapeId: string
  jurisdiction: 'DE-BW'
  subject: 'Chemie'
  stage: Stage
  title: string
  sourceDocument: SourceDocument
  expectedTopics: TopicSpec[]
  outputPath: string
  reviewPath: string
}

const repoRoot = existsSync(path.resolve(process.cwd(), 'curricula'))
  ? process.cwd()
  : path.resolve(process.cwd(), '..')

const canonicalChemistryLandscapeId = 'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0'
const sourceDocument: SourceDocument = {
  key: 'BP2016-CH-V2',
  title: 'Bildungsplan 2016 Gymnasium Chemie Baden-Wuerttemberg, ueberarbeitete Fassung vom 25. Maerz 2022',
  path: 'curricula/DE/Gymnasium/input/BW/BP2016BW_ALLG_GYM_CH_V2.pdf',
  official: true,
}

const topicSpecs: TopicSpec[] = [
  ['3.2.1.1', 'Stoffe und ihre Eigenschaften', 'SekI', 'unspecified', 13],
  ['3.2.1.2', 'Stoffe und ihre Teilchen', 'SekI', 'unspecified', 15],
  ['3.2.1.3', 'Bindungs- und Wechselwirkungsmodelle', 'SekI', 'unspecified', 17],
  ['3.2.2.1', 'Qualitative Aspekte chemischer Reaktionen', 'SekI', 'unspecified', 19],
  ['3.2.2.2', 'Quantitative Aspekte chemischer Reaktionen', 'SekI', 'unspecified', 21],
  ['3.2.2.3', 'Energetische Aspekte chemischer Reaktionen', 'SekI', 'unspecified', 22],
  ['3.3.1', 'Chemische Energetik', 'SekII', 'GK_LK', 24],
  ['3.3.2', 'Chemische Gleichgewichte', 'SekII', 'GK_LK', 24],
  ['3.3.3', 'Naturstoffe', 'SekII', 'GK_LK', 26],
  ['3.3.4', 'Kunststoffe', 'SekII', 'GK_LK', 27],
  ['3.3.5', 'Elektrische Energie und Chemie', 'SekII', 'GK_LK', 28],
  ['3.4.1', 'Chemische Energetik', 'SekII', 'LK', 30],
  ['3.4.2', 'Chemisches Gleichgewicht', 'SekII', 'LK', 31],
  ['3.4.3', 'Saeure-Base-Gleichgewichte', 'SekII', 'LK', 32],
  ['3.4.4', 'Naturstoffe', 'SekII', 'LK', 34],
  ['3.4.5', 'Aromaten und Reaktionsmechanismen', 'SekII', 'LK', 36],
  ['3.4.6', 'Kunststoffe', 'SekII', 'LK', 37],
  ['3.4.7', 'Elektrochemie', 'SekII', 'LK', 38],
  ['3.4.8', 'Chemie in Wissenschaft, Forschung und Anwendung', 'SekII', 'LK', 40],
].map(([code, title, stage, courseLevel, page]) => ({
  code: String(code),
  title: String(title),
  stage: stage as Stage,
  courseLevel: courseLevel as CourseLevel,
  page: Number(page),
}))

const lowerConfig: ExtractionConfig = {
  extractionId: 'DE-BW-CHEMIE-SEKI-BP2016-V2',
  sourceLandscapeId: 'ac4d5c1c-b2c9-5724-b0bc-64b9d666ad87',
  jurisdiction: 'DE-BW',
  subject: 'Chemie',
  stage: 'SekI',
  title: 'Chemie Sekundarstufe I (Baden-Wuerttemberg, BP2016 V2 Source-Extraction)',
  sourceDocument,
  expectedTopics: topicSpecs.filter((topic) => topic.stage === 'SekI'),
  outputPath: 'curricula/DE/Gymnasium/input/BW/lower-secondary/source-extraction/DE_BW_CHEMIE_SEKI_BP2016_V2.source-extraction.json',
  reviewPath: 'curricula/DE/Gymnasium/mapping/DE-BW/lower-secondary/bw_chemistry_lower_secondary_source_extraction_to_canonical_chemistry.review.json',
}

const upperConfig: ExtractionConfig = {
  extractionId: 'DE-BW-CHEMIE-SEKII-BP2016-V2',
  sourceLandscapeId: '880ae6cd-852f-5861-b3ae-2326e3ac7dec',
  jurisdiction: 'DE-BW',
  subject: 'Chemie',
  stage: 'SekII',
  title: 'Chemie Kursstufe (Baden-Wuerttemberg, BP2016 V2 Source-Extraction)',
  sourceDocument,
  expectedTopics: topicSpecs.filter((topic) => topic.stage === 'SekII'),
  outputPath: 'curricula/DE/Gymnasium/input/BW/upper-secondary/source-extraction/DE_BW_CHEMIE_SEKII_BP2016_V2.source-extraction.json',
  reviewPath: 'curricula/DE/Gymnasium/mapping/DE-BW/upper-secondary/bw_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.review.json',
}

const absoluteRepoPath = (repoRelativePath: string): string => path.resolve(repoRoot, repoRelativePath)

const normalizeGermanText = (value: string): string =>
  value
    .replace(/Säure/gu, 'Säure')
    .replace(/Säure- Base/gu, 'Säure-Base')
    .replace(/’/gu, "'")
    .replace(/‘/gu, "'")
    .replace(/­/gu, '')
    .normalize('NFC')

const normalizeLine = (line: string): string =>
  normalizeGermanText(line)
    .replace(/\u00a0/gu, ' ')
    .replace(/[ \t]+/gu, ' ')
    .trim()

const stripFormulaWhitespace = (value: string): string =>
  value
    .replace(/\s+,/gu, ',')
    .replace(/\s+\)/gu, ')')
    .replace(/\(\s+/gu, '(')
    .replace(/\s+([,.;:])/gu, '$1')
    .replace(/\s+/gu, ' ')
    .trim()

const appendContinuation = (previous: string, next: string): string =>
  previous.endsWith('-') ? `${previous.slice(0, -1)}${next}` : `${previous} ${next}`

const cleanSourceGoalText = (value: string): string =>
  stripFormulaWhitespace(
    normalizeGermanText(value)
      .replace(/\s*-\s+/gu, ' '),
  )

const isChromeLine = (line: string): boolean =>
  line.length === 0
  || /^Bildungsplan 2016/u.test(line)
  || /^Chemie – Überarbeitete Fassung/u.test(line)
  || /^Standards für inhaltsbezogene Kompetenzen/u.test(line)
  || /^\d+\s+Standards für inhaltsbezogene Kompetenzen/u.test(line)
  || /^Standards für inhaltsbezogene Kompetenzen.+\d+$/u.test(line)
  || /^Operatoren$/u.test(line)
  || /^Anhang$/u.test(line)
  || /^\d+$/u.test(line)

const isReferenceLine = (line: string): boolean =>
  /^(?:[23]\.\d(?:\.\d+){0,2}|BNT|PH(?:\.V2)?|NWT|BIO(?:\.V2)?|M|GEO|REV|MUS|MUSPROFIL|BK|BKPROFIL)\b/u.test(line)
  || /^(?:BNE|BTV|PG|BO|MB|VB)\b/u.test(line)
  || /^(?:unter anderem|zum Beispiel)\s*$/iu.test(line)

const headingPattern = /^(3\.(?:2|3|4)(?:\.\d+){1,2})\s+(.+?)$/u
const sourceGoalStartPattern = /^\(?\s*(\d+)\)\s+(.+)$/u

function readPdfText(sourcePath: string): string {
  const pdfPath = absoluteRepoPath(sourcePath)
  if (!existsSync(pdfPath)) throw new Error(`Missing source PDF: ${sourcePath}`)
  return execFileSync('pdftotext', ['-layout', pdfPath, '-'], { encoding: 'utf8' })
}

function parseTopics(rawText: string, specs: TopicSpec[]): ParsedTopic[] {
  const expectedByCode = new Map(specs.map((spec) => [spec.code, spec]))
  const allExpectedCodes = new Set(topicSpecs.map((spec) => spec.code))
  const rawLines = rawText.split(/\r?\n/u)
  const normalizedLines = rawLines.map(normalizeLine)
  const startIndex = normalizedLines.findIndex((line, index) => index > 300 && line === '3.2 Klassen 8/9/10')
  const endIndex = normalizedLines.findIndex((line, index) => index > startIndex && line === '4. Operatoren')
  const lines = rawLines.slice(startIndex >= 0 ? startIndex : 0, endIndex >= 0 ? endIndex : rawLines.length)

  const topics = new Map<string, ParsedTopic>()
  let current: ParsedTopic | null = null
  let currentGoalIndex = -1
  let skippingReferenceBlock = false

  const ensureCurrent = (line: string, allowHeading: boolean): boolean => {
    if (!allowHeading) return false
    const match = line.match(headingPattern)
    if (!match) return false
    const [, code, title] = match
    if (!allExpectedCodes.has(code)) {
      current = null
      currentGoalIndex = -1
      skippingReferenceBlock = false
      return true
    }
    const spec = expectedByCode.get(code)
    if (!spec) {
      current = null
      currentGoalIndex = -1
      skippingReferenceBlock = false
      return true
    }
    current = {
      spec,
      rawText: `${code} ${title}`,
      sourceGoalTexts: [],
    }
    topics.set(code, current)
    currentGoalIndex = -1
    skippingReferenceBlock = false
    return true
  }

  for (const rawLine of lines) {
    const lineWithoutPageBreak = rawLine.replace(/^\f/u, '')
    const allowHeading = !/^\s/u.test(lineWithoutPageBreak)
    const line = normalizeLine(lineWithoutPageBreak)
    if (line.length === 0) {
      skippingReferenceBlock = false
      continue
    }
    if (current && currentGoalIndex >= 0 && skippingReferenceBlock && isReferenceLine(line)) {
      current.rawText = appendContinuation(current.rawText, line)
      continue
    }
    if (ensureCurrent(line, allowHeading)) continue
    if (!current || isChromeLine(line)) continue

    const goalStart = line.match(sourceGoalStartPattern)
    if (goalStart) {
      currentGoalIndex += 1
      skippingReferenceBlock = false
      current.sourceGoalTexts[currentGoalIndex] = cleanSourceGoalText(goalStart[2])
      current.rawText = appendContinuation(current.rawText, line)
      continue
    }

    current.rawText = appendContinuation(current.rawText, line)
    if (currentGoalIndex < 0) continue
    if (isReferenceLine(line)) {
      skippingReferenceBlock = true
      continue
    }
    if (skippingReferenceBlock) continue
    if (/^Die Schülerinnen und Schüler können$/u.test(line)) continue
    current.sourceGoalTexts[currentGoalIndex] = cleanSourceGoalText(
      appendContinuation(current.sourceGoalTexts[currentGoalIndex], line),
    )
  }

  return specs.map((spec) => topics.get(spec.code)).filter((topic): topic is ParsedTopic => topic !== undefined)
}

function sourceGoalId(prefix: string, topicCode: string, bulletIndex: number, value: string): string {
  const hash = createHash('sha1').update(`${prefix}:${topicCode}:${bulletIndex}:${value}`).digest('hex').slice(0, 8)
  const slug = topicCode.toLowerCase().replace(/[^a-z0-9]+/gu, '-').replace(/^-|-$/gu, '')
  return `${prefix}-${slug}-b${String(bulletIndex).padStart(2, '0')}-a01-${hash}`
}

function tagsFor(topic: TopicSpec): string[] {
  const tags = [
    'jurisdiction:DE-BW',
    'subject:Chemie',
    `stage:${topic.stage}`,
    `topic:${topic.code}`,
    `courseLevel:${topic.courseLevel}`,
  ]
  if (topic.code.startsWith('3.2')) tags.push('Klassen8-10')
  if (topic.code.startsWith('3.3')) tags.push('Basisfach')
  if (topic.code.startsWith('3.4')) tags.push('Leistungsfach', 'LK')
  return tags
}

function buildExtraction(config: ExtractionConfig, parsedTopics: ParsedTopic[]): { passages: Passage[]; sourceGoals: SourceGoal[] } {
  const passages: Passage[] = []
  const sourceGoals: SourceGoal[] = []
  const prefix = config.stage === 'SekII' ? 'bw-chem-sekii' : 'bw-chem-seki'

  parsedTopics.forEach((topic) => {
    const passageId = `${prefix}:${topic.spec.code}`
    const passage: Passage = {
      id: passageId,
      topicCode: topic.spec.code,
      title: `${topic.spec.code} ${topic.spec.title}`,
      text: topic.sourceGoalTexts.map((entry, index) => `(${index + 1}) ${entry}`).join('\n'),
      page: topic.spec.page,
      sourcePath: config.sourceDocument.path,
      rawText: topic.rawText,
      sourceGoalIds: [],
    }

    topic.sourceGoalTexts.forEach((sourceText, goalIndex) => {
      const bulletIndex = goalIndex + 1
      const id = sourceGoalId(prefix, topic.spec.code, bulletIndex, sourceText)
      const sourceSpan = `${topic.spec.code} (${bulletIndex})`
      const sourceRef = `Bildungsplan 2016 Gymnasium Chemie Baden-Wuerttemberg, ${sourceSpan}, S. ${topic.spec.page}.`
      const goal: SourceGoal = {
        id,
        passageId,
        topicCode: topic.spec.code,
        bulletIndex,
        aspectIndex: 1,
        title: `BW ${sourceSpan}: ${sourceText.slice(0, 96)}${sourceText.length > 96 ? '...' : ''}`,
        description: `Source-Ziel aus ${sourceSpan}: ${sourceText}`,
        sourceText,
        sourceSpan,
        parentBulletText: sourceText,
        sourceRef,
        courseLevel: topic.spec.courseLevel,
        granularity: 'officialCompetency',
        tags: tagsFor(topic.spec),
        rawSourceText: sourceText,
        rawSourceSpan: sourceSpan,
        rawParentBulletText: sourceText,
      }
      sourceGoals.push(goal)
      passage.sourceGoalIds.push(id)
    })

    passages.push(passage)
  })

  return { passages, sourceGoals }
}

const duplicates = (values: string[]): string[] => {
  const seen = new Set<string>()
  const duplicate = new Set<string>()
  values.forEach((value) => {
    if (seen.has(value)) duplicate.add(value)
    seen.add(value)
  })
  return Array.from(duplicate).sort()
}

function buildPipeline(config: ExtractionConfig, parsed: { passages: Passage[]; sourceGoals: SourceGoal[] }): { currentStep: string; steps: PipelineStep[] } {
  const foundTopicCodes = new Set(parsed.passages.map((passage) => passage.topicCode))
  const missingTopics = config.expectedTopics.map((topic) => topic.code).filter((code) => !foundTopicCodes.has(code))
  const duplicateTopicCodes = duplicates(parsed.passages.map((passage) => passage.topicCode))
  const passagesWithoutText = parsed.passages.filter((passage) => !passage.text.trim()).map((passage) => passage.id)
  const passagesWithoutGoals = parsed.passages.filter((passage) => passage.sourceGoalIds.length === 0).map((passage) => passage.id)
  const duplicateSourceGoalIds = duplicates(parsed.sourceGoals.map((goal) => goal.id))
  const sourceGoalsWithoutPassage = parsed.sourceGoals
    .filter((goal) => !parsed.passages.some((passage) => passage.id === goal.passageId))
    .map((goal) => goal.id)
  const incompleteSourceGoals = parsed.sourceGoals
    .filter((goal) => !goal.sourceText || !goal.sourceSpan || !goal.sourceRef || !goal.parentBulletText)
    .map((goal) => goal.id)
  const reviewPath = absoluteRepoPath(config.reviewPath)

  const m1Complete = existsSync(absoluteRepoPath(config.sourceDocument.path))
    && missingTopics.length === 0
    && duplicateTopicCodes.length === 0
    && passagesWithoutText.length === 0
  const m2Complete = m1Complete
    && parsed.sourceGoals.length > 0
    && passagesWithoutGoals.length === 0
    && duplicateSourceGoalIds.length === 0
    && sourceGoalsWithoutPassage.length === 0
    && incompleteSourceGoals.length === 0

  const steps: PipelineStep[] = [
    {
      id: 'MAPPING-1',
      label: 'Original-Lehrplanpassagen extrahiert',
      status: m1Complete ? 'complete' : 'incomplete',
      dependsOn: [],
      checks: [
        {
          id: 'source-document-present',
          label: 'Amtliche BW-Chemie-Quelle liegt lokal vor',
          passed: existsSync(absoluteRepoPath(config.sourceDocument.path)),
          details: config.sourceDocument.path,
        },
        {
          id: 'expected-topic-coverage',
          label: 'Alle erwarteten BW-Chemie-Kompetenzbereiche sind als Lehrplanpassagen vorhanden',
          passed: missingTopics.length === 0,
          details: `${parsed.passages.length}/${config.expectedTopics.length} Bereiche; fehlend: ${missingTopics.join(', ') || '-'}`,
        },
        {
          id: 'unique-topic-passages',
          label: 'Jeder Kompetenzbereich hat genau eine Passage',
          passed: duplicateTopicCodes.length === 0,
          details: `Doppelte Bereiche: ${duplicateTopicCodes.join(', ') || '-'}`,
        },
        {
          id: 'passage-text-present',
          label: 'Jede Passage enthält offiziellen Text',
          passed: passagesWithoutText.length === 0,
          details: `Passagen ohne Text: ${passagesWithoutText.join(', ') || '-'}`,
        },
        {
          id: 'passage-extraction-source',
          label: 'Passage-Extraction basiert auf amtlicher PDF-Quelle statt Legacy-Snapshot',
          passed: true,
          details: `Quelle: ${config.sourceDocument.path}`,
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
          label: 'Aus den amtlichen BW-Chemie-Kompetenzerwartungen wurden Source-Ziele erzeugt',
          passed: parsed.sourceGoals.length > 0,
          details: `${parsed.sourceGoals.length} Source-Ziele`,
        },
        {
          id: 'passage-to-source-goal-coverage',
          label: 'Jede Passage hat mindestens ein Source-Ziel',
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
          id: 'source-goal-trace-complete',
          label: 'Jedes Source-Ziel hat Source-Span, Parent-Bullet und Quellenreferenz',
          passed: incompleteSourceGoals.length === 0,
          details: `Unvollständige Source-Ziele: ${incompleteSourceGoals.join(', ') || '-'}`,
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
            ? `${parsed.sourceGoals.length} Source-Ziele liegen vor; MAPPING-3 läuft gegen diese Source-Extraction-IDs.`
            : 'MAPPING-2 ist noch nicht abgeschlossen.',
        },
        {
          id: 'm3-review-file-present',
          label: 'M3-Review-Datei ist vorhanden',
          passed: existsSync(reviewPath),
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
          details: `0/${parsed.sourceGoals.length} Source-Ziele reviewed; offen: ${parsed.sourceGoals.length}.`,
        },
        {
          id: 'm3-all-source-goals-covered-by-canonical',
          label: 'Alle Source-Ziele sind durch SkillPilot-Ziele abgedeckt',
          passed: false,
          details: `Fachlich abgedeckt: 0/${parsed.sourceGoals.length}; MAPPING-3 steht aus.`,
        },
      ],
    },
  ]

  return {
    currentStep: steps.find((step) => step.status !== 'complete')?.id ?? '',
    steps,
  }
}

function writeReviewSeed(config: ExtractionConfig): void {
  const reviewPath = absoluteRepoPath(config.reviewPath)
  mkdirSync(path.dirname(reviewPath), { recursive: true })
  writeFileSync(reviewPath, `${JSON.stringify({
    version: 1,
    reviewId: path.basename(config.reviewPath, '.json'),
    sourceLandscapeId: config.sourceLandscapeId,
    targetLandscapeId: canonicalChemistryLandscapeId,
    sourceExtractionPath: config.outputPath,
    status: 'in_progress',
    note: 'MAPPING-1/2 aus der amtlichen BW-Chemie-PDF-Quelle. MAPPING-3 ist absichtlich noch leer und fachlich zu reviewen.',
    mappings: [],
    decisions: [],
  }, null, 2)}\n`, 'utf8')
}

function runConfig(config: ExtractionConfig): void {
  const parsedTopics = parseTopics(readPdfText(config.sourceDocument.path), config.expectedTopics)
  const parsed = buildExtraction(config, parsedTopics)
  writeReviewSeed(config)
  const pipelineStatus = buildPipeline(config, parsed)
  const outputPath = absoluteRepoPath(config.outputPath)
  mkdirSync(path.dirname(outputPath), { recursive: true })
  writeFileSync(outputPath, `${JSON.stringify({
    schemaVersion: 1,
    extractionId: config.extractionId,
    sourceLandscapeId: config.sourceLandscapeId,
    jurisdiction: config.jurisdiction,
    subject: config.subject,
    stage: config.stage,
    title: config.title,
    sourceDocument: config.sourceDocument,
    method: {
      passageExtraction: 'pdftotext -layout; segmented by official BW Chemie competency section headings 3.2.* to 3.4.*',
      sourceGoalExtraction: 'one source goal per official numbered competency expectation; original statement retained in sourceText',
    },
    expectedTopicCodes: config.expectedTopics.map((topic) => topic.code),
    pipelineStatus,
    passages: parsed.passages,
    sourceGoals: parsed.sourceGoals,
  }, null, 2)}\n`, 'utf8')
  console.log(`${config.extractionId}: ${parsed.passages.length} passages, ${parsed.sourceGoals.length} source goals`)
}

runConfig(lowerConfig)
runConfig(upperConfig)
