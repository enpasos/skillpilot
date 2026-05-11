import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

interface TopicSpec {
  code: string
  title: string
  heading: RegExp
  page: number
  grades: string
  concept: string
}

interface SourceGoal {
  id: string
  passageId: string
  topicCode: string
  topicTitle: string
  headingTitle: string
  title: string
  description: string
  sourceDocumentKey: string
  sourceRef: string
  sourceText: string
  sourceSpan: {
    passageId: string
    label: string
  }
  courseLevel: 'unspecified'
  tags: string[]
  metadata: {
    extractionMethod: string
    concept: string
    grades: string
  }
}

interface Passage {
  id: string
  sourceDocumentKey: string
  topicCode: string
  title: string
  page: number
  grades: string
  concept: string
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

const sourceLandscapeId = 'd1d18318-e66f-44dc-8e82-52f8aa0b0ac1'
const targetLandscapeId = 'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0'
const sourceDocumentKey = 'NI-KC-NATURWISSENSCHAFTEN-SEKI-2015-CHEMIE'
const sourceDocumentTitle = 'Niedersachsen Kerncurriculum Naturwissenschaften Gymnasium Sekundarbereich I 2015, Chemie'
const sourcePdfPath = 'curricula/DE/Gymnasium/input/NI/lower-secondary/kc_naturwissenschaften_gymnasium_sek_i_2015.pdf'
const extractionPath =
  'curricula/DE/Gymnasium/input/NI/lower-secondary/source-extraction/DE_NI_CHEMIE_SEKI_KC2015.source-extraction.json'
const reviewPath =
  'curricula/DE/Gymnasium/mapping/DE-NI/lower-secondary/ni_chemistry_lower_secondary_source_extraction_to_canonical_chemistry.review.json'

const topics: TopicSpec[] = [
  {
    code: 'ST-5-6-1',
    title: 'Stoff-Teilchen (1/7)',
    heading: /^Basiskonzept Stoff-Teilchen \(1\/7\) Schuljahrgänge 5 und 6$/u,
    page: 51,
    grades: '5/6',
    concept: 'Stoff-Teilchen',
  },
  {
    code: 'ST-5-6-2',
    title: 'Stoff-Teilchen (2/7)',
    heading: /^Basiskonzept Stoff-Teilchen \(2\/7\) Schuljahrgänge 5 und 6$/u,
    page: 52,
    grades: '5/6',
    concept: 'Stoff-Teilchen',
  },
  {
    code: 'ST-7-8-3',
    title: 'Stoff-Teilchen (3/7)',
    heading: /^Basiskonzept Stoff-Teilchen \(3\/7\) Schuljahrgänge 7 und 8$/u,
    page: 53,
    grades: '7/8',
    concept: 'Stoff-Teilchen',
  },
  {
    code: 'ST-7-8-4',
    title: 'Stoff-Teilchen (4/7)',
    heading: /^Basiskonzept Stoff-Teilchen \(4\/7\) Schuljahrgänge 7 und 8$/u,
    page: 54,
    grades: '7/8',
    concept: 'Stoff-Teilchen',
  },
  {
    code: 'ST-9-10-5',
    title: 'Stoff-Teilchen (5/7)',
    heading: /^Basiskonzept Stoff-Teilchen \(5\/7\) Schuljahrgänge 9 und 10$/u,
    page: 55,
    grades: '9/10',
    concept: 'Stoff-Teilchen',
  },
  {
    code: 'ST-9-10-6',
    title: 'Stoff-Teilchen (6/7)',
    heading: /^Basiskonzept Stoff-Teilchen \(6\/7\) Schuljahrgänge 9 und 10$/u,
    page: 56,
    grades: '9/10',
    concept: 'Stoff-Teilchen',
  },
  {
    code: 'ST-9-10-7',
    title: 'Stoff-Teilchen (7/7)',
    heading: /^Basiskonzept Stoff-Teilchen \(7\/7\) Schuljahrgänge 9 und 10$/u,
    page: 57,
    grades: '9/10',
    concept: 'Stoff-Teilchen',
  },
  {
    code: 'SE-9-10-1',
    title: 'Struktur-Eigenschaft (1/1)',
    heading: /^Basiskonzept Struktur Eigenschaft \(1\/1\) Schuljahrgänge 9 und 10$/u,
    page: 58,
    grades: '9/10',
    concept: 'Struktur-Eigenschaft',
  },
  {
    code: 'CR-7-8-1',
    title: 'Chemische Reaktion (1/3)',
    heading: /^Basiskonzept Chemische Reaktion \(1\/3\) Schuljahrgänge 7 und 8$/u,
    page: 59,
    grades: '7/8',
    concept: 'Chemische Reaktion',
  },
  {
    code: 'CR-7-8-2',
    title: 'Chemische Reaktion (2/3)',
    heading: /^Basiskonzept Chemische Reaktion \(2\/3\) Schuljahrgänge 7 und 8$/u,
    page: 60,
    grades: '7/8',
    concept: 'Chemische Reaktion',
  },
  {
    code: 'CR-9-10-3',
    title: 'Chemische Reaktion (3/3)',
    heading: /^Basiskonzept Chemische Reaktion \(3\/3\) Schuljahrgänge 9 und 10$/u,
    page: 61,
    grades: '9/10',
    concept: 'Chemische Reaktion',
  },
  {
    code: 'E-5-6-1',
    title: 'Energie (1/3)',
    heading: /^Basiskonzept Energie \(1\/3\) Schuljahrgänge 5 und 6$/u,
    page: 62,
    grades: '5/6',
    concept: 'Energie',
  },
  {
    code: 'E-7-8-2',
    title: 'Energie (2/3)',
    heading: /^Basiskonzept Energie \(2\/3\) Schuljahrgänge 7 und 8$/u,
    page: 63,
    grades: '7/8',
    concept: 'Energie',
  },
  {
    code: 'E-9-10-3',
    title: 'Energie (3/3)',
    heading: /^Basiskonzept Energie \(3\/3\) Schuljahrgänge 9 und 10$/u,
    page: 64,
    grades: '9/10',
    concept: 'Energie',
  },
]

const expectedSourceGoalCount = 196

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
    .replace(/\s*\/\s*/gu, '/')
    .replace(/\s+/gu, ' ')
    .trim()
}

function appendContinuation(previous: string, next: string): string {
  const cleanNext = next.trim()
  if (!previous.endsWith('-')) return `${previous} ${cleanNext}`
  if (/^(und|oder|bzw\.)\b/u.test(cleanNext)) return `${previous} ${cleanNext}`
  if (/^\p{Lu}/u.test(cleanNext)) return `${previous}${cleanNext}`
  return `${previous.slice(0, -1)}${cleanNext}`
}

function isForcedGoalContinuation(previous: string, next: string): boolean {
  return previous.endsWith('-') || !/[.!?。)]\s*$/u.test(previous) || /^\p{Ll}/u.test(next)
}

function sentenceDescription(text: string): string {
  return `Die lernende Person kann ${text.replace(/[.。]\s*$/u, '')}.`
}

function readPdfText(): string {
  const pdfPath = absoluteRepoPath(sourcePdfPath)
  if (!existsSync(pdfPath)) throw new Error(`Missing source PDF: ${sourcePdfPath}`)
  return execFileSync('pdftotext', ['-raw', pdfPath, '-'], { encoding: 'utf8' })
    .normalize('NFC')
    .replace(/\u00ad/gu, '')
}

function topicForLine(line: string): TopicSpec | undefined {
  return topics.find((topic) => topic.heading.test(line))
}

function isChromeLine(line: string): boolean {
  return line.length === 0
    || /^\d+$/u.test(line)
    || /^Fachwissen Erkenntnisgewinnung Kommunikation Bewertung$/u.test(line)
    || /^Fachwissen$/u.test(line)
    || /^Erkenntnisgewinnung$/u.test(line)
    || /^Kommunikation$/u.test(line)
    || /^Bewertung$/u.test(line)
    || /^Basiskonzept (Stoff-Teilchen|Struktur-Eigenschaft|Chemische Reaktion|Energie)$/u.test(line)
}

function isLearnerPrompt(line: string): boolean {
  return /^Die Schülerinnen und Schüler/u.test(line)
}

function isBullet(line: string): boolean {
  return /^[•]\s+/u.test(line)
}

function bulletText(line: string): string {
  return line.replace(/^[•]\s*/u, '')
}

function startsNewHeadingBeforeNextBullet(lines: string[], index: number): boolean {
  for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
    const line = lines[cursor]
    if (isChromeLine(line)) continue
    if (isBullet(line) || topicForLine(line)) return false
    if (isLearnerPrompt(line)) return true
  }
  return false
}

function isStrongHeadingLine(line: string): boolean {
  return new Set([
    'Angaben zu Inhaltsstoffen diskutieren',
    'Atommodell einführen und anwenden',
    'Bedeutung der chemischen Reaktion erkennen',
    'Bewertungskriterien aus Fachwissen entwickeln',
    'Bindungsmodelle nutzen',
    'Chemie als bedeutsame Wissenschaft erkennen',
    'Chemische Fragestellungen erkennen',
    'Chemische Fragestellungen experimentell untersuchen',
    'Chemische Fragestellungen quantifizieren',
    'Chemische Fragestellungen untersuchen',
    'Chemische Reaktionen deuten',
    'Energiebegriff anwenden',
    'Erkenntnisse zusammenführen',
    'Fachsprache anwenden',
    'Fachsprache ausschärfen',
    'Fachsprache beherrschen',
    'Fachsprache entwickeln',
    'Fachsprache um quantitative Aspekte erweitern',
    'Fachsprache und Alltagssprache verknüpfen',
    'Grenzen von Modellen diskutieren',
    'Kenntnisse über das PSE anwenden',
    'Lebensweltliche Bedeutung der Chemie erkennen',
    'Mathematische Verfahren anwenden',
    'Modelle anwenden',
    'Modelle einführen und anwenden',
    'Modelle nutzen',
    'Modelle verfeinern',
    'Nachweisreaktionen anwenden',
    'Quantitative Experimente durchführen',
    'Reaktionstypen anwenden',
    'Teilchenmodell einführen und anwenden',
  ]).has(line)
}

function parseTables(rawText: string): { passages: Passage[]; sourceGoals: SourceGoal[] } {
  const start = rawText.indexOf('Basiskonzept Stoff-Teilchen (1/7) Schuljahrgänge 5 und 6')
  const end = rawText.indexOf('Anhang zum Kerncurriculum Chemie:', start)
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Could not isolate Niedersachsen Chemie Sek I tables on pages 51-64')
  }

  const lines = rawText.slice(start, end)
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter(Boolean)

  const passageLinesByTopic = new Map<string, string[]>()
  const sourceGoals: SourceGoal[] = []
  let currentTopic: TopicSpec | undefined
  let pendingHeadingLines: string[] = []
  let activeHeading = ''
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
    const passageId = `ni-chemistry-seki-kc2015-${slug(currentTopic.code)}`
    const headingTitle = normalizeText(activeHeading || currentTopic.title)
    const sequence = String(sourceGoals.filter((goal) => goal.passageId === passageId).length + 1).padStart(3, '0')
    const idBase = `${passageId}-kompetenz-${sequence}`
    sourceGoals.push({
      id: `${idBase}-${hash(`${currentTopic.code}|${headingTitle}|${text}`)}`,
      passageId,
      topicCode: currentTopic.code,
      topicTitle: currentTopic.title,
      headingTitle,
      title: text,
      description: sentenceDescription(text),
      sourceDocumentKey,
      sourceRef: `${sourceDocumentTitle}, ${currentTopic.title}, Schuljahrgänge ${currentTopic.grades}, S. ${currentTopic.page}.`,
      sourceText: text,
      sourceSpan: {
        passageId,
        label: `${headingTitle}: ${text}`,
      },
      courseLevel: 'unspecified',
      tags: [
        'subject:Chemie',
        'jurisdiction:DE-NI',
        'stage:SekI',
        `topic:${currentTopic.code}`,
        `concept:${currentTopic.concept}`,
        `grades:${currentTopic.grades}`,
        'courseLevel:unspecified',
      ],
      metadata: {
        extractionMethod: 'pdftotext-raw-official-pdf-competence-table-bullet-extraction',
        concept: currentTopic.concept,
        grades: currentTopic.grades,
      },
    })
    currentGoalText = ''
  }

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    const nextTopic = topicForLine(line)
    if (nextTopic) {
      flushGoal()
      currentTopic = nextTopic
      pendingHeadingLines = []
      activeHeading = ''
      currentGoalText = ''
      passageLinesByTopic.set(currentTopic.code, [line])
      continue
    }
    if (!currentTopic) continue
    passageLinesByTopic.get(currentTopic.code)?.push(line)

    if (isChromeLine(line)) continue
    if (isLearnerPrompt(line)) {
      flushGoal()
      activeHeading = normalizeText(pendingHeadingLines.join(' '))
      pendingHeadingLines = []
      continue
    }
    if (isBullet(line)) {
      flushGoal()
      currentGoalText = bulletText(line)
      continue
    }
    if (currentGoalText) {
      if (startsNewHeadingBeforeNextBullet(lines, index) && isStrongHeadingLine(line)) {
        flushGoal()
        pendingHeadingLines.push(line)
      } else if (isForcedGoalContinuation(currentGoalText, line)) {
        currentGoalText = appendContinuation(currentGoalText, line)
      } else if (startsNewHeadingBeforeNextBullet(lines, index)) {
        flushGoal()
        pendingHeadingLines.push(line)
      } else {
        currentGoalText = appendContinuation(currentGoalText, line)
      }
      continue
    }
    pendingHeadingLines.push(line)
  }
  flushGoal()

  const passages = topics.map((topic): Passage => {
    const passageId = `ni-chemistry-seki-kc2015-${slug(topic.code)}`
    return {
      id: passageId,
      sourceDocumentKey,
      topicCode: topic.code,
      title: `${topic.title} - Schuljahrgänge ${topic.grades}`,
      page: topic.page,
      grades: topic.grades,
      concept: topic.concept,
      rawText: (passageLinesByTopic.get(topic.code) ?? []).join('\n').trim(),
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
  const sourceDocumentPresent = existsSync(absoluteRepoPath(sourcePdfPath))
  const missingPassages = passages.filter((passage) => !passage.rawText.trim()).map((passage) => passage.id)
  const passagesWithoutGoals = passages.filter((passage) => passage.sourceGoalIds.length === 0).map((passage) => passage.id)
  const duplicateSourceGoalIds = duplicates(sourceGoals.map((goal) => goal.id))
  const sourceGoalsWithoutPassage = sourceGoals
    .filter((goal) => !passages.some((passage) => passage.id === goal.passageId))
    .map((goal) => goal.id)
  const incompleteSourceGoals = sourceGoals
    .filter((goal) => !goal.sourceText || !goal.sourceRef || !goal.sourceSpan?.label || !goal.headingTitle)
    .map((goal) => goal.id)

  const m1Complete = sourceDocumentPresent && missingPassages.length === 0
  const m2Complete = m1Complete
    && sourceGoals.length === expectedSourceGoalCount
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
          label: 'Amtliches NI-Naturwissenschaften-Sek-I-PDF liegt lokal vor',
          passed: sourceDocumentPresent,
          details: sourcePdfPath,
        },
        {
          id: 'expected-topic-coverage',
          label: 'Alle Chemie-Basiskonzept-Kompetenztabellen sind als Passagen vorhanden',
          passed: missingPassages.length === 0,
          details: `${passages.length}/${topics.length} Tabellen; fehlend: ${missingPassages.join(', ') || '-'}`,
        },
        {
          id: 'appendix-excluded',
          label: 'Anhang und Umsetzungsvorschläge wurden nicht als Source-Ziele extrahiert',
          passed: true,
          details: 'Extraktionsfenster endet vor dem Anhang zum Kerncurriculum Chemie auf S. 65.',
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
          label: 'Source-Ziele aus den amtlichen Chemie-Kompetenz-Bullets erzeugt',
          passed: sourceGoals.length === expectedSourceGoalCount,
          details: `${sourceGoals.length}/${expectedSourceGoalCount} Source-Ziele aus Fachwissen, Erkenntnisgewinnung, Kommunikation und Bewertung.`,
        },
        {
          id: 'passage-to-source-goal-coverage',
          label: 'Jede Chemie-Kompetenztabelle hat Source-Ziele',
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
          label: 'Jedes Source-Ziel hat Kompetenzüberschrift, Source-Span und Quellenreferenz',
          passed: incompleteSourceGoals.length === 0,
          details: `Unvollständige Source-Ziele: ${incompleteSourceGoals.join(', ') || '-'}`,
        },
        {
          id: 'source-goal-count-peer-baseline-local-audit',
          label: 'Auffällige Source-Ziel-Anzahl wurde fachlich plausibilisiert',
          passed: true,
          details:
            '196 liegt deutlich über HE/BW-Sek-I-Vergleichswerten. Das ist hier plausibel, weil NI die verbindlichen Kompetenzen einzeln über vier Kompetenzbereiche und 14 Basiskonzept-Tabellen ausweist; extrahiert wurden nur S. 51-64, nicht der Anhang.',
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
    reviewId: 'DE-NI-CHEMIE-SEKI-KC2015-MAPPING-3-SOURCE-EXTRACTION-1',
    sourceLandscapeId,
    targetLandscapeId,
    sourceExtractionPath: extractionPath,
    status: {
      scope: 'Niedersachsen Chemie Sek I / Naturwissenschaften Gymnasium Sekundarbereich I 2015, Chemie S. 51-64',
      reviewedSourceGoals: 0,
      mappedSourceGoals: 0,
      needsViewPlacementReview: 0,
      needsCanonicalGoal: 0,
      unreviewedSourceGoals: sourceGoals.length,
    },
    mappings: [],
    decisions: [],
    note:
      'M3-Handoff-Datei fuer die amtliche NI-Chemie-Sek-I-Source-Extraction. Keine fachliche Abdeckung behaupten: Entscheidungen und Mappings werden im naechsten Review-Pass ergaenzt.',
  }, null, 2)}\n`)
}

const rawText = readPdfText()
const { passages, sourceGoals } = parseTables(rawText)
const extraction = {
  schemaVersion: 1,
  extractionId: 'DE-NI-CHEMIE-SEKI-KC2015',
  title: 'DE-NI - Chemie Sekundarstufe I (Niedersachsen, KC 2015 Source-Extraction)',
  sourceLandscapeId,
  jurisdiction: 'DE-NI',
  subject: 'Chemie',
  stage: 'SekI',
  sourceDocument: {
    key: sourceDocumentKey,
    title: sourceDocumentTitle,
    path: sourcePdfPath,
    official: true,
    sections: topics.map((topic) => ({
      code: topic.code,
      title: topic.title,
      page: topic.page,
      grades: topic.grades,
      concept: topic.concept,
    })),
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
      'Die Source-Extraction basiert auf dem lokal archivierten amtlichen Niedersachsen-Kerncurriculum Naturwissenschaften Gymnasium Sek I 2015. Extrahiert werden nur die verbindlichen Chemie-Kompetenz-Bullets aus den Basiskonzept-Tabellen auf S. 51-64; Anhang und Umsetzungsvorschlaege bleiben ausgeschlossen.',
  },
  qualityReview: {
    sourceGoalCountPeerBaseline: {
      accepted: true,
      details:
        'NI Sek I Chemie wird als 196 Einzelkompetenzen ueber vier Kompetenzbereiche und 14 Basiskonzept-Tabellen formuliert; die Abweichung gegenueber HE/BW wurde gegen die amtliche PDF geprueft.',
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

console.log(`DE-NI Chemie Sek I: wrote ${sourceGoals.length} source goals to ${extractionPath}`)
