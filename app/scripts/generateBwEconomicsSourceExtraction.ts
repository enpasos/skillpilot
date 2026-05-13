import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

type Stage = 'SekI' | 'SekII'
type CourseLevel = 'GK_LK' | 'unspecified'

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
  page: number
  courseLevel: CourseLevel
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
  targetLandscapeId: string
  jurisdiction: 'DE-BW'
  subject: string
  stage: Stage
  title: string
  sourceDocument: SourceDocument
  expectedTopics: TopicSpec[]
  outputPath: string
  reviewPath: string
  sourceLabel: string
  sourceGoalPrefix: string
  startHeading: string
  topicHeadingPattern: RegExp
}

const repoRoot = existsSync(path.resolve(process.cwd(), 'curricula'))
  ? process.cwd()
  : path.resolve(process.cwd(), '..')

const canonicalEconomicsLandscapeId = '605bdaf6-32d5-56fd-8d92-5a80c2fd2901'

const wbsDocument: SourceDocument = {
  key: 'BP2016-WBS',
  title: 'Bildungsplan 2016 Gymnasium Wirtschaft / Berufs- und Studienorientierung Baden-Wuerttemberg',
  path: 'curricula/DE/Gymnasium/input/BW/BP2016BW_ALLG_GYM_WBS.pdf',
  official: true,
}

const economicsDocument: SourceDocument = {
  key: 'BP2016-WI',
  title: 'Bildungsplan 2016 Gymnasium Wirtschaft Baden-Wuerttemberg',
  path: 'curricula/DE/Gymnasium/input/BW/BP2016BW_ALLG_GYM_WI.pdf',
  official: true,
}

const lowerTopics: TopicSpec[] = [
  ['3.1.1', 'Verbraucher', 13],
  ['3.1.2.1', 'Berufswähler', 15],
  ['3.1.2.2', 'Arbeitnehmer', 17],
  ['3.1.2.3', 'Unternehmer', 18],
  ['3.1.3', 'Wirtschaftsbürger', 20],
].map(([code, title, page]) => ({
  code: String(code),
  title: String(title),
  stage: 'SekI',
  page: Number(page),
  courseLevel: 'unspecified',
}))

const upperTopics: TopicSpec[] = [
  ['3.1.1', 'Grundlagen der Ökonomie', 13],
  ['3.1.2', 'Grundlagen der Betriebswirtschaft', 15],
  ['3.1.3', 'Globale Gütermärkte', 17],
  ['3.1.4', 'Arbeitsmärkte', 19],
  ['3.1.5', 'Internationale Finanzmärkte', 20],
  ['3.1.6', 'Fallstudie', 22],
  ['3.1.7', 'Ökonomie und Kultur', 22],
].map(([code, title, page]) => ({
  code: String(code),
  title: String(title),
  stage: 'SekII',
  page: Number(page),
  courseLevel: 'GK_LK',
}))

const lowerConfig: ExtractionConfig = {
  extractionId: 'DE-BW-WBS-SEKI-BP2016',
  sourceLandscapeId: '4137eeb1-2c30-57a4-8390-d27971381e86',
  targetLandscapeId: canonicalEconomicsLandscapeId,
  jurisdiction: 'DE-BW',
  subject: 'Wirtschaft / Berufs- und Studienorientierung',
  stage: 'SekI',
  title: 'Wirtschaft / Berufs- und Studienorientierung Sekundarstufe I (Baden-Wuerttemberg, BP2016 Source-Extraction)',
  sourceDocument: wbsDocument,
  expectedTopics: lowerTopics,
  outputPath: 'curricula/DE/Gymnasium/input/BW/lower-secondary/source-extraction/DE_BW_WBS_SEKI_BP2016.source-extraction.json',
  reviewPath: 'curricula/DE/Gymnasium/mapping/DE-BW/lower-secondary/bw_wbs_lower_secondary_source_extraction_to_canonical_wirtschaft.review.json',
  sourceLabel: 'Bildungsplan 2016 Gymnasium Wirtschaft / Berufs- und Studienorientierung Baden-Wuerttemberg',
  sourceGoalPrefix: 'bw-wbs-seki',
  startHeading: '3.1 Klassen 8/9/10',
  topicHeadingPattern: /^(3\.1(?:\.\d+){0,2})\s+(.+?)$/u,
}

const upperConfig: ExtractionConfig = {
  extractionId: 'DE-BW-WIRTSCHAFT-SEKII-BP2016',
  sourceLandscapeId: '4a339f25-cf0f-54c7-8b5d-79ea00e4b72c',
  targetLandscapeId: canonicalEconomicsLandscapeId,
  jurisdiction: 'DE-BW',
  subject: 'Wirtschaft',
  stage: 'SekII',
  title: 'Wirtschaft Kursstufe (Baden-Wuerttemberg, BP2016 Source-Extraction)',
  sourceDocument: economicsDocument,
  expectedTopics: upperTopics,
  outputPath: 'curricula/DE/Gymnasium/input/BW/upper-secondary/source-extraction/DE_BW_WIRTSCHAFT_SEKII_BP2016.source-extraction.json',
  reviewPath: 'curricula/DE/Gymnasium/mapping/DE-BW/upper-secondary/bw_wirtschaft_upper_secondary_source_extraction_to_canonical_wirtschaft.review.json',
  sourceLabel: 'Bildungsplan 2016 Gymnasium Wirtschaft Baden-Wuerttemberg',
  sourceGoalPrefix: 'bw-wirtschaft-sekii',
  startHeading: '3.1 Klassen 11/12',
  topicHeadingPattern: /^(3\.1(?:\.\d+)?)\s+(.+?)$/u,
}

const absoluteRepoPath = (repoRelativePath: string): string => path.resolve(repoRoot, repoRelativePath)

const normalizeGermanText = (value: string): string =>
  value
    .replace(/\u00ad/gu, '')
    .replace(/’/gu, "'")
    .replace(/‘/gu, "'")
    .normalize('NFC')

const normalizeLine = (line: string): string =>
  normalizeGermanText(line)
    .replace(/\u00a0/gu, ' ')
    .replace(/[ \t]+/gu, ' ')
    .trim()

const appendContinuation = (previous: string, next: string): string => {
  if (!previous.endsWith('-')) return `${previous} ${next}`
  return /^\p{Lu}/u.test(next)
    ? `${previous}${next}`
    : `${previous.slice(0, -1)}${next}`
}

const cleanSourceGoalText = (value: string): string =>
  normalizeGermanText(value)
    .replace(/\s+-\s+/gu, ' ')
    .replace(/Zustande kommen/gu, 'Zustandekommen')
    .replace(/Konsumenten souveränität/gu, 'Konsumentensouveränität')
    .replace(/vollkom menen/gu, 'vollkommenen')
    .replace(/Voraus setzungen/gu, 'Voraussetzungen')
    .replace(/Erwerbs tätige/gu, 'Erwerbstätige')
    .replace(/analy sieren/gu, 'analysieren')
    .replace(/Arbeits losigkeit/gu, 'Arbeitslosigkeit')
    .replace(/Arbeits organisation/gu, 'Arbeitsorganisation')
    .replace(/Groß unternehmen/gu, 'Großunternehmen')
    .replace(/Standort faktoren/gu, 'Standortfaktoren')
    .replace(/Grund gesetzes/gu, 'Grundgesetzes')
    .replace(/\s+([,.;:])/gu, '$1')
    .replace(/\(\s+/gu, '(')
    .replace(/\s+\)/gu, ')')
    .replace(/\s+/gu, ' ')
    .trim()

const isChromeLine = (line: string): boolean =>
  line.length === 0
  || /^Bildungsplan 2016/u.test(line)
  || /^Wirtschaft \/ Berufs- und Studienorientierung/u.test(line)
  || /^Wirtschaft$/u.test(line)
  || /^Standards für inhaltsbezogene Kompetenzen/u.test(line)
  || /^\d+\s+Standards für inhaltsbezogene Kompetenzen/u.test(line)
  || /^Standards für inhaltsbezogene Kompetenzen.+\d+$/u.test(line)
  || /^4\. Operatoren$/u.test(line)
  || /^5\.\s+Anhang$/u.test(line)
  || /^Anhang$/u.test(line)
  || /^\d+$/u.test(line)

const isReferenceLine = (line: string): boolean =>
  /^2\.[1-4]\s/u.test(line)
  || /^3\.1(?:\.\d+){0,2}\s/u.test(line)
  || /^(?:A?ES|BK|BNT|D|E1|E2|ETH|F|G|GEO|GK|M|NWT|PORT3|SPA3)\s+\d/u.test(line)
  || /^(?:BNE|BO|BTV|MB|PG|VB)\s/u.test(line)

const sourceGoalStartPattern = /^\(?\s*(\d+)\)\s+(.+)$/u

function readPdfText(sourcePath: string): string {
  const pdfPath = absoluteRepoPath(sourcePath)
  if (!existsSync(pdfPath)) throw new Error(`Missing source PDF: ${sourcePath}`)
  return execFileSync('pdftotext', ['-layout', pdfPath, '-'], { encoding: 'utf8' })
}

function parseTopics(config: ExtractionConfig): ParsedTopic[] {
  const expectedByCode = new Map(config.expectedTopics.map((spec) => [spec.code, spec]))
  const expectedCodes = new Set(config.expectedTopics.map((spec) => spec.code))
  const rawLines = readPdfText(config.sourceDocument.path).split(/\r?\n/u)
  const normalizedLines = rawLines.map(normalizeLine)
  const startIndex = normalizedLines.findIndex((line, index) => index > 300 && line === config.startHeading)
  const endIndex = normalizedLines.findIndex((line, index) => index > startIndex && line === '4. Operatoren')
  if (startIndex < 0 || endIndex < 0) {
    throw new Error(`Could not find competency section boundaries for ${config.extractionId}`)
  }

  const topics = new Map<string, ParsedTopic>()
  let current: ParsedTopic | null = null
  let currentGoalIndex = -1
  let inReferenceTail = false

  for (const rawLine of rawLines.slice(startIndex, endIndex)) {
    const lineWithoutPageBreak = rawLine.replace(/^\f/u, '')
    const allowHeading = !/^\s/u.test(lineWithoutPageBreak)
    const line = normalizeLine(lineWithoutPageBreak)
    if (line.length === 0) continue

    if (allowHeading) {
      const heading = line.match(config.topicHeadingPattern)
      if (heading) {
        const [, code, headingTitle] = heading
        if (!expectedCodes.has(code)) {
          current = null
          currentGoalIndex = -1
          inReferenceTail = false
          continue
        }
        const spec = expectedByCode.get(code)
        if (!spec) continue
        current = {
          spec,
          rawText: `${code} ${headingTitle}`,
          sourceGoalTexts: [],
        }
        topics.set(code, current)
        currentGoalIndex = -1
        inReferenceTail = false
        continue
      }
    }

    if (!current || isChromeLine(line)) continue

    const goalStart = line.match(sourceGoalStartPattern)
    if (goalStart) {
      currentGoalIndex += 1
      inReferenceTail = false
      current.sourceGoalTexts[currentGoalIndex] = cleanSourceGoalText(goalStart[2])
      current.rawText = appendContinuation(current.rawText, line)
      continue
    }

    current.rawText = appendContinuation(current.rawText, line)
    if (currentGoalIndex < 0) continue
    if (/^Die Schülerinnen und Schüler können$/u.test(line)) continue
    if (isReferenceLine(line)) {
      inReferenceTail = true
      continue
    }
    if (inReferenceTail) continue

    current.sourceGoalTexts[currentGoalIndex] = cleanSourceGoalText(
      appendContinuation(current.sourceGoalTexts[currentGoalIndex], line),
    )
  }

  return config.expectedTopics
    .map((spec) => topics.get(spec.code))
    .filter((topic): topic is ParsedTopic => topic !== undefined)
}

function sourceGoalId(prefix: string, topicCode: string, bulletIndex: number, value: string): string {
  const hash = createHash('sha1').update(`${prefix}:${topicCode}:${bulletIndex}:${value}`).digest('hex').slice(0, 8)
  const slug = topicCode.toLowerCase().replace(/[^a-z0-9]+/gu, '-').replace(/^-|-$/gu, '')
  return `${prefix}-${slug}-b${String(bulletIndex).padStart(2, '0')}-a01-${hash}`
}

function tagsFor(config: ExtractionConfig, topic: TopicSpec): string[] {
  return [
    'jurisdiction:DE-BW',
    `subject:${config.subject}`,
    `stage:${topic.stage}`,
    `topic:${topic.code}`,
    `courseLevel:${topic.courseLevel}`,
    config.stage === 'SekI' ? 'Klassen8-10' : 'Klassen11-12',
  ]
}

function buildExtraction(config: ExtractionConfig, parsedTopics: ParsedTopic[]): { passages: Passage[]; sourceGoals: SourceGoal[] } {
  const passages: Passage[] = []
  const sourceGoals: SourceGoal[] = []

  parsedTopics.forEach((topic) => {
    const passageId = `${config.sourceGoalPrefix}:${topic.spec.code}`
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
      const id = sourceGoalId(config.sourceGoalPrefix, topic.spec.code, bulletIndex, sourceText)
      const sourceSpan = `${topic.spec.code} (${bulletIndex})`
      const sourceRef = `${config.sourceLabel}, ${sourceSpan}, S. ${topic.spec.page}.`
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
        tags: tagsFor(config, topic.spec),
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
  const passageIds = new Set(parsed.passages.map((passage) => passage.id))
  const sourceGoalsWithoutPassage = parsed.sourceGoals
    .filter((goal) => !passageIds.has(goal.passageId))
    .map((goal) => goal.id)
  const incompleteSourceGoals = parsed.sourceGoals
    .filter((goal) => !goal.sourceText || !goal.sourceSpan || !goal.sourceRef || !goal.parentBulletText)
    .map((goal) => goal.id)
  const reviewPath = absoluteRepoPath(config.reviewPath)
  const sourceGoalIds = new Set(parsed.sourceGoals.map((goal) => goal.id))
  let reviewedSourceGoals = 0
  let mappedSourceGoals = 0
  let needsCanonicalGoal = 0
  if (existsSync(reviewPath)) {
    const review = JSON.parse(readFileSync(reviewPath, 'utf8')) as {
      decisions?: Array<{ sourceGoalId?: string; decision?: string; canonicalGoalIds?: string[] }>
    }
    const reviewed = new Set<string>()
    const mapped = new Set<string>()
    for (const decision of review.decisions ?? []) {
      if (!decision.sourceGoalId || !sourceGoalIds.has(decision.sourceGoalId)) continue
      reviewed.add(decision.sourceGoalId)
      if (decision.decision === 'needsCanonicalGoal') needsCanonicalGoal += 1
      if (decision.decision === 'mapped' && (decision.canonicalGoalIds?.length ?? 0) > 0) {
        mapped.add(decision.sourceGoalId)
      }
    }
    reviewedSourceGoals = reviewed.size
    mappedSourceGoals = mapped.size
  }

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

  const m3Complete = m2Complete
    && reviewedSourceGoals === parsed.sourceGoals.length
    && mappedSourceGoals === parsed.sourceGoals.length
    && needsCanonicalGoal === 0

  const steps: PipelineStep[] = [
    {
      id: 'MAPPING-1',
      label: 'Original-Lehrplanpassagen extrahiert',
      status: m1Complete ? 'complete' : 'incomplete',
      dependsOn: [],
      checks: [
        {
          id: 'source-document-present',
          label: 'Amtliche BW-Wirtschaft-Quelle liegt lokal vor',
          passed: existsSync(absoluteRepoPath(config.sourceDocument.path)),
          details: config.sourceDocument.path,
        },
        {
          id: 'expected-topic-coverage',
          label: 'Alle erwarteten BW-Wirtschaft-Kompetenzbereiche sind als Lehrplanpassagen vorhanden',
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
          label: 'Aus den amtlichen BW-Wirtschaft-Kompetenzerwartungen wurden Source-Ziele erzeugt',
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
      status: m3Complete ? 'complete' : m2Complete ? 'incomplete' : 'blocked',
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
          id: 'm3-all-source-goals-reviewed',
          label: 'Alle Source-Ziele haben eine fachliche M3-Entscheidung',
          passed: reviewedSourceGoals === parsed.sourceGoals.length,
          details: `${reviewedSourceGoals}/${parsed.sourceGoals.length} Source-Ziele reviewed; offen: ${Math.max(parsed.sourceGoals.length - reviewedSourceGoals, 0)}.`,
        },
        {
          id: 'm3-all-source-goals-covered-by-canonical',
          label: 'Alle Source-Ziele sind durch SkillPilot-Ziele abgedeckt',
          passed: mappedSourceGoals === parsed.sourceGoals.length && needsCanonicalGoal === 0,
          details: `Fachlich abgedeckt: ${mappedSourceGoals}/${parsed.sourceGoals.length}; offene Canonical-Gaps: ${needsCanonicalGoal}.`,
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
  if (existsSync(reviewPath)) {
    const existing = JSON.parse(readFileSync(reviewPath, 'utf8')) as { mappings?: unknown[]; decisions?: unknown[] }
    if ((existing.mappings?.length ?? 0) > 0 || (existing.decisions?.length ?? 0) > 0) {
      return
    }
  }
  writeFileSync(reviewPath, `${JSON.stringify({
    version: 1,
    reviewId: path.basename(config.reviewPath, '.json'),
    sourceLandscapeId: config.sourceLandscapeId,
    targetLandscapeId: config.targetLandscapeId,
    sourceExtractionPath: config.outputPath,
    status: 'in_progress',
    note: 'MAPPING-1/2 aus der amtlichen BW-Wirtschaft-PDF-Quelle. MAPPING-3 ist absichtlich noch leer und fachlich zu reviewen.',
    mappings: [],
    decisions: [],
  }, null, 2)}\n`, 'utf8')
}

function runConfig(config: ExtractionConfig): void {
  const parsedTopics = parseTopics(config)
  const parsed = buildExtraction(config, parsedTopics)
  writeReviewSeed(config)
  const pipelineStatus = buildPipeline(config, parsed)
  const outputPath = absoluteRepoPath(config.outputPath)
  mkdirSync(path.dirname(outputPath), { recursive: true })
  writeFileSync(outputPath, `${JSON.stringify({
    schemaVersion: 1,
    extractionId: config.extractionId,
    sourceLandscapeId: config.sourceLandscapeId,
    targetLandscapeId: config.targetLandscapeId,
    jurisdiction: config.jurisdiction,
    subject: config.subject,
    stage: config.stage,
    title: config.title,
    sourceDocument: config.sourceDocument,
    method: {
      passageExtraction: 'pdftotext -layout; segmented by official BW Wirtschaft/WBS competency section headings',
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
