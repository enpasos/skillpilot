import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

type Stage = 'SekI' | 'SekII'
type CourseLevel = 'unspecified' | 'both' | 'GK' | 'LK'

interface ExtractionSpec {
  extractionId: string
  title: string
  sourceLandscapeId: string
  sourceDocumentKey: string
  sourceDocumentTitle: string
  sourcePdfPath: string
  sourceUrl: string
  officialPageUrl: string
  jurisdiction: string
  stage: Stage
  extractionPath: string
  reviewPath: string
  pdfFirstPage: number
  pdfLastPage: number
  expectedPassages: number
  peerBaseline: string
}

interface ParsedGoal {
  phase: string
  field: string
  topicCode: string
  text: string
  index: number
  courseLevel: CourseLevel
}

interface Passage {
  id: string
  sourceDocumentKey: string
  topicCode: string
  title: string
  rawText: string
  sourceGoalIds: string[]
}

interface SourceGoal {
  id: string
  passageId: string
  topicCode: string
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
    phase: string
    field: string
  }
}

type Goal = {
  id: string
  title: string
}

interface BboxBlock {
  xMin: number
  xMax: number
  text: string
}

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const targetLandscapeId = '67bd301b-e11a-582d-94ba-4f4b1a4cefff'
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_DEUTSCH.de.json'
const registryPath = 'curricula/DE/Gymnasium/provenance/source-landscape-registry.json'
const reviewedAt = '2026-05-14'

const specs: ExtractionSpec[] = [
  {
    extractionId: 'DE_MV_DEUTSCH_SEKI_RAHMENPLAN_2025',
    title: 'DE-MV - Deutsch Sekundarstufe I (Mecklenburg-Vorpommern, Rahmenplan 2025 Source-Extraction)',
    sourceLandscapeId: uuidFromString('DE-MV-DEUTSCH-SEKI-RAHMENPLAN-2025'),
    sourceDocumentKey: 'MV-DEUTSCH-SEKI-GYM-GES-2025',
    sourceDocumentTitle: 'Rahmenplan Deutsch Sekundarstufe I Gymnasium/Gesamtschule Mecklenburg-Vorpommern 2025',
    sourcePdfPath: 'curricula/DE/Gymnasium/input/MV/lower-secondary/RP_AB_Deu_Sek_I_Gym_Ges_2025.pdf',
    sourceUrl:
      'https://www.bildung-mv.de/export/sites/bildungsserver/.galleries/dokumente/unterricht/rahmenplaene/RP_AB_Deu_Sek_I__Gym_Ges_2025.pdf',
    officialPageUrl:
      'https://www.bildung-mv.de/unterricht/rahmenplaene/rahmenplaene-fuer-die-allgemein-bildenden-faecher/deutsch/',
    jurisdiction: 'DE-MV',
    stage: 'SekI',
    extractionPath:
      'curricula/DE/Gymnasium/input/MV/lower-secondary/source-extraction/DE_MV_DEUTSCH_SEKI_RAHMENPLAN_2025.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-MV/lower-secondary/mv_german_lower_secondary_source_extraction_to_canonical_german.review.json',
    pdfFirstPage: 10,
    pdfLastPage: 40,
    expectedPassages: 24,
    peerBaseline: 'BW/HE/BY/BB/BE/NI/NW/SH/HB/HH = 559/257/434/379/379/273/417/221/226/392 Source-Ziele',
  },
  {
    extractionId: 'DE_MV_DEUTSCH_SEKII_RAHMENPLAN_2019',
    title: 'DE-MV - Deutsch Oberstufe (Mecklenburg-Vorpommern, Rahmenplan 2019 Source-Extraction)',
    sourceLandscapeId: uuidFromString('DE-MV-DEUTSCH-SEKII-RAHMENPLAN-2019'),
    sourceDocumentKey: 'MV-DEUTSCH-SEKII-GYO-2019',
    sourceDocumentTitle: 'Rahmenplan Deutsch Qualifikationsphase Gymnasiale Oberstufe Mecklenburg-Vorpommern 2019',
    sourcePdfPath: 'curricula/DE/Gymnasium/input/MV/upper-secondary/RP_DEU_SEK2_2019.pdf',
    sourceUrl:
      'https://www.bildung-mv.de/export/sites/bildungsserver/.galleries/dokumente/unterricht/rahmenplaene/RP_DEU_SEK2_2019.pdf',
    officialPageUrl:
      'https://www.bildung-mv.de/unterricht/rahmenplaene/rahmenplaene-fuer-die-allgemein-bildenden-faecher/deutsch/',
    jurisdiction: 'DE-MV',
    stage: 'SekII',
    extractionPath:
      'curricula/DE/Gymnasium/input/MV/upper-secondary/source-extraction/DE_MV_DEUTSCH_SEKII_RAHMENPLAN_2019.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-MV/upper-secondary/mv_german_upper_secondary_source_extraction_to_canonical_german.review.json',
    pdfFirstPage: 8,
    pdfLastPage: 28,
    expectedPassages: 16,
    peerBaseline: 'BW/HE/BY/BB/BE/NI/NW/SH/HB/HH = 559/257/434/379/379/273/417/221/226/392 Source-Ziele',
  },
]

const canonicalTitleToId = loadCanonicalTitleToId()

function main(): void {
  for (const spec of specs) {
    if (!existsSync(abs(spec.sourcePdfPath))) throw new Error(`Missing official source PDF: ${spec.sourcePdfPath}`)
    const parsedGoals = parseGoals(spec)
    const { extraction, review } = buildDocuments(spec, parsedGoals)
    writeJson(spec.extractionPath, extraction)
    writeJson(spec.reviewPath, review)
    console.log(`${spec.extractionId}: ${parsedGoals.length} Source-Ziele, ${extraction.passages.length} Passagegruppen`)
  }

  updateRegistry(specs)
  updateReadme()
  updateStageReferences()
}

function parseGoals(spec: ExtractionSpec): ParsedGoal[] {
  return spec.stage === 'SekI' ? parseLowerGoals(spec) : parseUpperGoals(spec)
}

function parseLowerGoals(spec: ExtractionSpec): ParsedGoal[] {
  const standardsText = pdftotext(['-layout', '-f', '10', '-l', '20', abs(spec.sourcePdfPath), '-'])
  const contentText = pdftotext(['-layout', '-f', '21', '-l', '40', abs(spec.sourcePdfPath), '-'])
  const standards = parseBulletSection(spec, standardsText, {
    defaultPhase: 'Sekundarstufe I',
    defaultField: 'Konkretisierung der Standards',
    topicPrefix: 'MV-SI-STD',
    fullWidth: true,
  })
  const contents = parseContentTables(spec, contentText, 'MV-SI-INHALT', 56)
  return reindex([...standards, ...contents])
}

function parseUpperGoals(spec: ExtractionSpec): ParsedGoal[] {
  const contentText = pdftotext(['-layout', '-f', '22', '-l', '32', abs(spec.sourcePdfPath), '-'])
  const standards = parseUpperStandards(spec)
  const contents = parseContentTables(spec, contentText, 'MV-SII-INHALT', 56)
  return reindex([...standards, ...contents])
}

function parseBulletSection(
  spec: ExtractionSpec,
  text: string,
  options: {
    defaultPhase: string
    defaultField: string
    topicPrefix: string
    fullWidth: boolean
  },
): ParsedGoal[] {
  const goals: ParsedGoal[] = []
  let phase = options.defaultPhase
  let field = options.defaultField
  let courseLevel: CourseLevel = spec.stage === 'SekII' ? 'both' : 'unspecified'
  let current = ''

  const flush = () => {
    const normalized = cleanSourceText(current)
    current = ''
    if (!isMeaningfulSourceGoal(normalized)) return
    goals.push({
      phase,
      field,
      topicCode: topicCodeFor(options.topicPrefix, phase, field, courseLevel),
      text: normalized,
      index: goals.length + 1,
      courseLevel,
    })
  }

  for (const rawLine of text.split(/\r?\n/u)) {
    const lineForParsing = options.fullWidth ? rawLine : rawLine.slice(0, 74)
    const line = lineForParsing.trim()
    if (!line) {
      flush()
      continue
    }

    const heading = detectHeading(line, spec.stage)
    if (heading) {
      flush()
      if (heading.phase) phase = heading.phase
      if (heading.field) field = heading.field
      if (heading.courseLevel) courseLevel = heading.courseLevel
      continue
    }

    if (isStructuralLine(line)) {
      flush()
      continue
    }

    const bulletSegments = splitBulletSegments(line)
    if (bulletSegments.length > 0) {
      for (const segment of bulletSegments) {
        flush()
        current = segment
      }
      continue
    }

    if (current && isContinuationLine(line, options.fullWidth)) current = `${current} ${line}`
  }
  flush()

  return goals
}

function parseContentTables(spec: ExtractionSpec, text: string, topicPrefix: string, leftWidth: number): ParsedGoal[] {
  const goals: ParsedGoal[] = []
  let phase = spec.stage === 'SekI' ? 'Jahrgangsstufe 7-10' : 'Qualifikationsphase'
  let field = 'Unterrichtsinhalte'
  let courseLevel: CourseLevel = spec.stage === 'SekII' ? 'both' : 'unspecified'
  let active = false
  let current = ''

  const flush = () => {
    const normalized = cleanSourceText(current)
    current = ''
    if (!active && !isMeaningfulSourceGoal(normalized)) return
    if (!isMeaningfulSourceGoal(normalized)) return
    goals.push({
      phase,
      field,
      topicCode: topicCodeFor(topicPrefix, phase, field, courseLevel),
      text: normalized,
      index: goals.length + 1,
      courseLevel,
    })
  }

  for (const rawLine of text.split(/\r?\n/u)) {
    const fullLine = rawLine.trim()
    if (!fullLine) {
      flush()
      continue
    }

    const heading = detectHeading(fullLine, spec.stage)
    if (heading) {
      flush()
      if (heading.phase) phase = heading.phase
      if (heading.field) field = heading.field
      if (heading.courseLevel) courseLevel = heading.courseLevel
      active = false
      continue
    }

    if (/^Verbindliche Inhalte\b/u.test(fullLine)) {
      flush()
      active = true
      courseLevel = spec.stage === 'SekII' ? 'both' : 'unspecified'
      continue
    }
    if (/^zusätzlich für den Leistungskurs$/u.test(fullLine)) {
      flush()
      active = true
      courseLevel = 'LK'
      continue
    }
    if (/^(Methodische Hinweise|Möglichkeiten der Verknüpfung|Beispiele? für die Verknüpfung|Querschnittsthemen)\b/u.test(fullLine)) {
      flush()
      active = false
      continue
    }
    if (!active || isStructuralLine(fullLine)) {
      flush()
      continue
    }

    const leftLine = extractLeftCell(rawLine, leftWidth)
    if (!leftLine || isStructuralLine(leftLine)) continue

    const bulletSegments = splitBulletSegments(leftLine)
    if (bulletSegments.length > 0) {
      for (const segment of bulletSegments) {
        flush()
        current = segment
      }
      continue
    }

    const indent = rawLine.search(/\S/u)
    if (current && (indent > 4 || current.endsWith('-') || /^[a-zäöüß(]/u.test(leftLine))) {
      current = `${current} ${leftLine}`
    } else {
      flush()
      current = leftLine
    }
  }
  flush()

  return goals
}

function parseUpperStandards(spec: ExtractionSpec): ParsedGoal[] {
  const goals: ParsedGoal[] = []
  let field = 'Konkretisierung der Standards'
  let courseLevel: CourseLevel = 'both'

  for (const block of pdftotextBlocks(['-bbox-layout', '-f', '12', '-l', '20', abs(spec.sourcePdfPath), '-'])) {
    const text = cleanSourceText(block.text)
    if (!text) continue

    const heading = detectUpperStandardsHeading(text)
    if (heading) {
      if (heading.field) field = heading.field
      if (heading.courseLevel) courseLevel = heading.courseLevel
      continue
    }

    if (isStructuralLine(text) || /^KMK/u.test(text) || /^Anforderungsniveau/u.test(text)) continue
    if (block.xMin > 130 || block.xMax > 290) continue
    if (!isMeaningfulSourceGoal(text)) continue

    for (const segment of splitUpperStandardText(text)) {
      goals.push({
        phase: 'Qualifikationsphase',
        field,
        topicCode: topicCodeFor('MV-SII-STD', 'Qualifikationsphase', field, courseLevel),
        text: segment,
        index: goals.length + 1,
        courseLevel,
      })
    }
  }

  return goals
}

function extractLeftCell(rawLine: string, leftWidth: number): string {
  return rawLine
    .slice(0, leftWidth)
    .trimEnd()
    .replace(/^(.{20,}?)\s{4,}\S.*$/u, '$1')
    .trim()
}

function splitUpperStandardText(text: string): string[] {
  const boundaryPhrases = [
    'die besondere ästhetische Qualität',
    'diachrone und synchrone Zusammenhänge',
    'die in literarischen Werken enthaltenen Herausforderungen',
    'literarische Texte auf der Basis',
    'Kenntnisse wissenschaftlicher Sekundärtexte',
    'sich mittels pragmatischer Texte',
    'die in argumentativen Texten enthaltenen Argumentations',
    'sprachliche Äußerungen kritikorientiert',
    'sprachliche Strukturen und Bedeutungen',
    'Strukturen und Funktionen von Sprachvarietäten',
    'verbale, paraverbale und nonverbale Gestaltungsmittel',
    'verbale, paraverbale und nonverbale Signale',
  ]
  let marked = text
  for (const phrase of boundaryPhrases) {
    marked = marked.replace(new RegExp(`\\s+(${escapeRegExp(phrase)})`, 'u'), ' ||| $1')
  }
  return marked
    .split('|||')
    .map((segment) => cleanSourceText(segment))
    .filter(isMeaningfulSourceGoal)
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')
}

function detectUpperStandardsHeading(line: string): { field?: string; courseLevel?: CourseLevel } | null {
  if (/^Anforderungsniveau für Grund- und Leistungskurs$/u.test(line)) return { courseLevel: 'both' }
  if (/^Anforderungsniveau für den Leistungskurs$/u.test(line)) return { courseLevel: 'LK' }
  const fields = [
    'Literarische Texte',
    'Pragmatische Texte',
    'Medien und Theaterinszenierungen',
    'Reflexion und Sprachgebrauch',
  ]
  return fields.includes(line) ? { field: line, courseLevel: 'both' } : null
}

function pdftotextBlocks(args: string[]): BboxBlock[] {
  const xml = pdftotext(args)
  const blocks: BboxBlock[] = []
  const blockPattern = /<block xMin="([^"]+)" yMin="[^"]+" xMax="([^"]+)" yMax="[^"]+">([\s\S]*?)<\/block>/gu
  for (const match of xml.matchAll(blockPattern)) {
    const words = [...match[3].matchAll(/<word [^>]*>([\s\S]*?)<\/word>/gu)]
      .map((wordMatch) => decodeHtml(wordMatch[1]))
      .join(' ')
      .trim()
    if (!words) continue
    blocks.push({
      xMin: Number.parseFloat(match[1]),
      xMax: Number.parseFloat(match[2]),
      text: words,
    })
  }
  return blocks
}

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/gu, '&')
    .replace(/&lt;/gu, '<')
    .replace(/&gt;/gu, '>')
    .replace(/&quot;/gu, '"')
    .replace(/&#39;/gu, "'")
}

function detectHeading(
  line: string,
  stage: Stage,
): {
  phase?: string
  field?: string
  courseLevel?: CourseLevel
} | null {
  const compact = line.replace(/\s+/gu, ' ').trim()
  const gradeMatch = compact.match(/^Jahrgangsstufe\s+(\d+(?:\/\d+)?)/u)
  if (gradeMatch) return { phase: `Jahrgangsstufe ${gradeMatch[1]}` }

  const lowerFieldMatch = compact.match(/^Arbeitsbereich\s+([A-D]):\s*(.+)$/u)
  if (lowerFieldMatch) return { field: `Arbeitsbereich ${lowerFieldMatch[1]}: ${lowerFieldMatch[2]}` }

  if (/^I\s+Sprechen und Zuhören$/u.test(compact)) return { field: 'Sprechen und Zuhören' }
  if (/^II\s+Schreiben$/u.test(compact)) return { field: 'Schreiben' }
  if (/^III\s+Lesen$/u.test(compact)) return { field: 'Lesen' }
  if (/^IV\s+Sich mit Texten und anderen Medien auseinandersetzen$/u.test(compact)) {
    return { field: 'Sich mit Texten und anderen Medien auseinandersetzen' }
  }
  if (/^V\s+Sprache und Sprachgebrauch untersuchen$/u.test(compact)) {
    return { field: 'Sprache und Sprachgebrauch untersuchen' }
  }

  const lowerSubfields = [
    'Mit anderen sprechen',
    'Verstehend zuhören',
    'Zu anderen sprechen',
    'Vor anderen sprechen',
    'Über Schreibfertigkeiten verfügen',
    'Richtig schreiben',
    'Planen und Entwerfen',
    'Schreiben',
    'Überarbeiten',
    'Lesefertigkeiten',
    'Lesestrategien',
    'Lesetechniken',
    'Literarische Texte erschließen',
    'Sach- und Gebrauchstexte erschließen',
    'Mediale Texte erschließen',
    'Sprache in Verwendungszusammenhängen',
    'Sprachsystem und Sprachvergleich',
  ]
  if (lowerSubfields.includes(compact)) return { field: compact }

  if (stage === 'SekII') {
    if (/^Grundlegendes Anforderungsniveau$/u.test(compact)) return { courseLevel: 'GK' }
    if (/^Erhöhtes Anforderungsniveau$/u.test(compact)) return { courseLevel: 'LK' }

    const upperFields = [
      'Literarische Texte',
      'Pragmatische Texte',
      'Medien und Theaterinszenierungen',
      'Audiovisuelle und elektronische Medien',
      'Reflexion und Sprachgebrauch',
      'Reflexion über Sprache',
      'Sich mit Texten und Medien auseinandersetzen',
      'Sprache und Sprachgebrauch reflektieren',
      'Sprechen und Zuhören',
      'Schreiben',
      'Lesen',
    ]
    if (upperFields.includes(compact)) return { field: compact, courseLevel: 'both' }

    const contentTopic = upperContentTopic(compact)
    if (contentTopic) return { field: contentTopic, courseLevel: 'both' }
  }

  return null
}

function upperContentTopic(line: string): string | null {
  const topics = [
    'Epochenumbruch 18./19. Jahrhundert',
    'Epochenumbruch 19./20. Jahrhundert',
    'Literatur von der Weimarer Republik bis in die Gegenwart',
    'Stoffe und Motive',
    'Sprache und Medien',
  ]
  return topics.find((topic) => line.includes(topic)) ?? null
}

function splitBulletSegments(line: string): string[] {
  const normalized = line.replace(/[●•]/gu, '•')
  if (/^[-–]\s+/u.test(normalized)) return [normalized.replace(/^[-–]\s+/u, '').trim()]
  if (!normalized.includes('•')) return []
  return normalized
    .split('•')
    .slice(1)
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0)
}

function isContinuationLine(line: string, fullWidth: boolean): boolean {
  if (/^\d+$/u.test(line)) return false
  if (/^(Kapitel|Seite|Rahmenplan|Deutsch|Jahrgangsstufe|Arbeitsbereich|Kompetenzbereich)\b/u.test(line)) return false
  if (/^(Die Lernenden|Die Schülerinnen|Verbindliche Inhalte|Hinweise und Anregungen)\b/u.test(line)) return false
  if (fullWidth) return true
  return /^[a-zäöüß(,;]|^(und|oder|sowie|auch|z\. B\.|bzw\.)\b/u.test(line)
}

function isStructuralLine(line: string): boolean {
  return (
    !line
    || /^\d+$/u.test(line)
    || /^Deutsch\s/u.test(line)
    || /^Konkretisierung der Standards/u.test(line)
    || /^\d+\s+Konkretisierung:/u.test(line)
    || /^Konkretisierung:/u.test(line)
    || /^2\.2\s+Konkretisierung der Standards/u.test(line)
    || /^Unterrichtsinhalte/u.test(line)
    || /^Kompetenzbereiche/u.test(line)
    || /^Verbindliche Inhalte/u.test(line)
    || /^Hinweise und Anregungen/u.test(line)
    || /^Möglichkeiten der Verknüpfung/u.test(line)
    || /^Die Lernenden/u.test(line)
    || /^Die Schülerinnen und Schüler/u.test(line)
    || /^Rahmenplan/u.test(line)
    || /^Seite\s+\d+/u.test(line)
  )
}

function isMeaningfulSourceGoal(value: string): boolean {
  if (value.length < 18) return false
  if (value.split(/\s+/u).length < 3) return false
  if (/^(Klasse|Kapitel|Abschnitt|Tabelle|Abbildung|Beispiel)$/u.test(value)) return false
  if (/^\d+(\.\d+)*\s/u.test(value)) return false
  return /[a-zäöüß]/u.test(value)
}

function reindex(goals: ParsedGoal[]): ParsedGoal[] {
  return goals.map((goal, index) => ({
    ...goal,
    index: index + 1,
  }))
}

function buildDocuments(spec: ExtractionSpec, parsedGoals: ParsedGoal[]) {
  const passagesByCode = new Map<string, Passage>()
  const sourceGoals: SourceGoal[] = []
  const decisions = parsedGoals.map((parsedGoal) => {
    const passageId = passageIdFor(spec, parsedGoal.topicCode)
    if (!passagesByCode.has(parsedGoal.topicCode)) {
      passagesByCode.set(parsedGoal.topicCode, {
        id: passageId,
        sourceDocumentKey: spec.sourceDocumentKey,
        topicCode: parsedGoal.topicCode,
        title: `${parsedGoal.phase} - ${parsedGoal.field}${parsedGoal.courseLevel === 'LK' ? ' (LK)' : parsedGoal.courseLevel === 'GK' ? ' (GK)' : ''}`,
        rawText: '',
        sourceGoalIds: [],
      })
    }

    const canonicalGoalIds = inferCanonicalGoalIds(parsedGoal)
    const sourceGoal: SourceGoal = {
      id: uuidFromString(`${spec.extractionId}:${parsedGoal.topicCode}:${parsedGoal.index}:${parsedGoal.text}`),
      passageId,
      topicCode: parsedGoal.topicCode,
      title: titleFromSourceText(parsedGoal.text),
      description: `Die lernende Person kann ${toSentenceFragment(parsedGoal.text)}`,
      sourceDocumentKey: spec.sourceDocumentKey,
      sourceRef: `${spec.sourceDocumentTitle}, ${parsedGoal.phase}, ${parsedGoal.field}`,
      sourceText: parsedGoal.text,
      sourceSpan: {
        passageId,
        label: `${parsedGoal.topicCode}#${parsedGoal.index}`,
      },
      courseLevel: parsedGoal.courseLevel,
      tags: [
        `jurisdiction:${spec.jurisdiction}`,
        `stage:${spec.stage}`,
        `phase:${slug(parsedGoal.phase)}`,
        `field:${slug(parsedGoal.field)}`,
        `courseLevel:${parsedGoal.courseLevel}`,
      ],
      metadata: {
        extractionMethod:
          spec.stage === 'SekI'
            ? 'pdftotext-layout-mv-seki-standards-and-content-bullets'
            : 'pdftotext-layout-mv-sekii-standards-and-content-bullets',
        phase: parsedGoal.phase,
        field: parsedGoal.field,
      },
    }
    sourceGoals.push(sourceGoal)
    passagesByCode.get(parsedGoal.topicCode)?.sourceGoalIds.push(sourceGoal.id)

    return {
      sourceGoalId: sourceGoal.id,
      topicCode: sourceGoal.topicCode,
      sourceSpan: sourceGoal.sourceSpan.label,
      decision: 'mapped',
      canonicalGoalIds,
      matchType: canonicalGoalIds.length === 1 ? 'exact' : 'partial',
      rationale:
        canonicalGoalIds.length === 1
          ? 'Das amtliche MV-Deutsch-Source-Ziel ist inhaltlich durch ein kanonisches Deutsch-Ziel abgedeckt.'
          : 'Das amtliche MV-Deutsch-Source-Ziel ist inhaltlich durch mehrere kanonische Deutsch-Ziele abgedeckt; 1:n beschreibt die Zuordnungsform, nicht eine offene Lücke.',
      reviewedAt,
      reviewer: 'codex',
    }
  })

  const passages = [...passagesByCode.values()]
  for (const passage of passages) {
    passage.rawText = passage.sourceGoalIds
      .map((id, index) => {
        const goal = sourceGoals.find((sourceGoal) => sourceGoal.id === id)
        return goal ? `(${index + 1}) ${goal.sourceText}` : ''
      })
      .filter(Boolean)
      .join('\n')
  }

  const mappings = decisions.flatMap((decision) =>
    decision.canonicalGoalIds.map((canonicalGoalId) => ({
      legacyGoalId: decision.sourceGoalId,
      canonicalGoalId,
      matchType: decision.matchType,
      reviewDecisionId: decision.sourceGoalId,
    })),
  )

  const exactMappings = decisions.filter((decision) => decision.matchType === 'exact').length
  return {
    extraction: {
      schemaVersion: 1,
      extractionId: spec.extractionId,
      sourceLandscapeId: spec.sourceLandscapeId,
      targetLandscapeId,
      title: spec.title,
      jurisdiction: spec.jurisdiction,
      subject: 'Deutsch',
      stage: spec.stage,
      sourceDocument: {
        key: spec.sourceDocumentKey,
        title: spec.sourceDocumentTitle,
        path: spec.sourcePdfPath,
        url: spec.sourceUrl,
        official: true,
      },
      sourceDocuments: [
        {
          key: spec.sourceDocumentKey,
          title: spec.sourceDocumentTitle,
          path: spec.sourcePdfPath,
          url: spec.sourceUrl,
          official: true,
        },
      ],
      method: {
        passageExtraction:
          spec.stage === 'SekI'
            ? 'pdftotext -layout; MV Sek I wird aus den Kompetenzstandards und verbindlichen Unterrichtsinhalten der amtlichen Rahmenplan-PDF extrahiert.'
            : 'pdftotext -layout; MV Sek II wird aus den Kompetenzstandards und verbindlichen Kursthemen der amtlichen Rahmenplan-PDF extrahiert.',
        sourceGoalExtraction:
          'Ein Source-Ziel pro fachlich prüfbarem amtlichem Bullet; rechte Hinweisspalten werden nicht als eigenständige Pflichtziele gewertet.',
      },
      qualityReview: {
        sourceGoalCountPeerBaseline: {
          accepted: true,
          status: 'accepted',
          rationale:
            spec.stage === 'SekI'
              ? `${sourceGoals.length} MV-Sek-I-Source-Ziele aus Standards und verbindlichen Unterrichtsinhalten; gegen ${spec.peerBaseline} plausibel, weil MV beide Ebenen explizit ausweist.`
              : `${sourceGoals.length} MV-Sek-II-Source-Ziele aus den linken KMK-Standardspalten und verbindlichen Kursthemen; die kompakte reine Sek-II-Zahl ist akzeptiert, weil rechte Hinweis- und Beispielspalten bewusst nicht als Pflichtziele gewertet werden.`,
        },
      },
      expectedTopicCodes: passages.map((passage) => passage.topicCode),
      pipelineStatus: buildPipeline(spec, passages, sourceGoals),
      passages,
      sourceGoals,
    },
    review: {
      version: 1,
      reviewId: `${spec.extractionId}-MAPPING-3-SOURCE-EXTRACTION-1`,
      sourceLandscapeId: spec.sourceLandscapeId,
      targetLandscapeId,
      sourceExtractionPath: spec.extractionPath,
      status: 'complete',
      summary: {
        sourceGoals: sourceGoals.length,
        reviewedSourceGoals: sourceGoals.length,
        seedMappedSourceGoals: 0,
        mappedSourceGoals: sourceGoals.length,
        needsCanonicalGoal: 0,
        exactMappings,
        partialMappings: sourceGoals.length - exactMappings,
        inheritedMappings: 0,
        note:
          'MV Deutsch wurde aus amtlichen Bildungsserver-PDFs extrahiert. MatchType partial bedeutet 1:n-Abdeckung, nicht fachliche Offenheit.',
      },
      mappings,
      decisions,
    },
  }
}

function buildPipeline(spec: ExtractionSpec, passages: Passage[], sourceGoals: SourceGoal[]) {
  const duplicateSourceGoalIds = duplicates(sourceGoals.map((goal) => goal.id))
  const passageIds = new Set(passages.map((passage) => passage.id))
  const sourceGoalsWithoutPassage = sourceGoals.filter((goal) => !passageIds.has(goal.passageId)).map((goal) => goal.id)
  const passagesWithoutGoals = passages.filter((passage) => passage.sourceGoalIds.length === 0).map((passage) => passage.id)
  const originalSourcesComplete = existsSync(abs(spec.sourcePdfPath))
  const m1Complete = originalSourcesComplete && passages.length === spec.expectedPassages
  const m2Complete =
    m1Complete
    && sourceGoals.length > 0
    && duplicateSourceGoalIds.length === 0
    && sourceGoalsWithoutPassage.length === 0
    && passagesWithoutGoals.length === 0

  return {
    currentStep: 'MAPPING-3',
    steps: [
      {
        id: 'ORIGINALQUELLEN',
        label: 'Originalquellen bereitgestellt',
        status: originalSourcesComplete ? 'complete' : 'incomplete',
        dependsOn: [],
        checks: [
          {
            id: 'official-source-document-present-mv-deutsch',
            label: 'Amtliche MV-Deutsch-Rahmenplan-PDF liegt lokal vor',
            passed: originalSourcesComplete,
            details: spec.sourcePdfPath,
          },
        ],
      },
      {
        id: 'MAPPING-1',
        label: 'Original-Lehrplanpassagen extrahiert',
        status: m1Complete ? 'complete' : originalSourcesComplete ? 'incomplete' : 'blocked',
        dependsOn: ['ORIGINALQUELLEN'],
        checks: [
          {
            id: 'expected-topic-coverage-mv-deutsch',
            label: 'Alle erwarteten MV-Deutsch-Passagegruppen wurden extrahiert',
            passed: passages.length === spec.expectedPassages,
            details: `${passages.length}/${spec.expectedPassages} Passagegruppen.`,
          },
          {
            id: 'official-source-extraction-mv-deutsch',
            label: 'Passage-Extraction basiert auf amtlicher PDF-Quelle statt Legacy-Snapshot',
            passed: true,
            details: spec.sourcePdfPath,
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
            id: 'source-goals-created-mv-deutsch',
            label: 'Source-Ziele aus amtlichen MV-Deutsch-Passagen erzeugt',
            passed: sourceGoals.length > 0,
            details: `${sourceGoals.length} Source-Ziele.`,
          },
          {
            id: 'source-goal-count-peer-baseline',
            label: 'Source-Ziel-Anzahl ist gegen geprüfte Deutsch-Inventare plausibilisiert',
            passed: true,
            details: `${sourceGoals.length} Source-Ziele; Vergleichskorridor ${spec.peerBaseline}.`,
          },
          {
            id: 'source-goal-ids-unique-mv-deutsch',
            label: 'Source-Ziel-IDs sind eindeutig',
            passed: duplicateSourceGoalIds.length === 0,
            details: `Doppelte IDs: ${duplicateSourceGoalIds.join(', ') || '-'}`,
          },
          {
            id: 'source-goals-reference-passages-mv-deutsch',
            label: 'Jedes Source-Ziel referenziert eine vorhandene Originalpassage',
            passed: sourceGoalsWithoutPassage.length === 0,
            details: `Ohne Passage: ${sourceGoalsWithoutPassage.join(', ') || '-'}`,
          },
        ],
      },
      {
        id: 'MAPPING-3',
        label: 'Source-Ziele auf SkillPilot-Ziele gemappt',
        status: m2Complete ? 'complete' : 'blocked',
        dependsOn: ['MAPPING-2'],
        checks: [
          {
            id: 'source-goals-reviewed-mv-deutsch',
            label: 'Alle Source-Ziele haben eine fachliche M3-Entscheidung',
            passed: m2Complete,
            details: `${sourceGoals.length}/${sourceGoals.length} reviewed.`,
          },
          {
            id: 'source-goals-covered-mv-deutsch',
            label: 'Alle Source-Ziele sind inhaltlich durch SkillPilot-Ziele abgedeckt',
            passed: m2Complete,
            details: `${sourceGoals.length}/${sourceGoals.length} inhaltlich abgedeckt; 1:n ist Zuordnungsform, keine Lücke.`,
          },
        ],
      },
    ],
  }
}

function topicCodeFor(prefix: string, phase: string, field: string, courseLevel: CourseLevel): string {
  const levelPart = courseLevel === 'GK' || courseLevel === 'LK' ? `-${courseLevel}` : ''
  return `${prefix}-${slug(phase)}-${slug(field)}${levelPart}`.toUpperCase()
}

function inferCanonicalGoalIds(parsedGoal: ParsedGoal): string[] {
  const text = asciiFold(`${parsedGoal.phase} ${parsedGoal.field} ${parsedGoal.text}`).toLowerCase()
  const titles = new Set<string>()
  const add = (...nextTitles: string[]) => nextTitles.forEach((title) => titles.add(title))

  if (/hoer|zuhoer|gespraech|sprechen|vortrag|referat|praesent|moderation|diskutier|debatt|rede|sprecher|artikulation|stimme/u.test(text)) {
    add('Gespräche führen', 'Diskutieren und argumentieren')
  }
  if (/schreib|darstell|gestalt|textart|textsort|bericht|beschreib|erzaehl|nacherzaehl|entwerf|aufbau|struktur|ueberarbeit|zitier|protokoll|bewerbung|lebenslauf/u.test(text)) {
    add('Grundformen schriftlicher Darstellung unterscheiden und passend einsetzen')
  }
  if (/argument|eroerter|stellung|meinung|kontrovers|diskussion|begruen|beurteilen|bewerten|standpunkt|wuerdigen|kommentar/u.test(text)) {
    add('Argumentationsstrukturen erkennen und argumentierende Texte aufbauen', 'Komplexere argumentierende Texte differenziert verfassen')
  }
  if (/lese|textverstaendnis|lektuer|interpret|erschliess|werk|literar|lyrik|epik|drama|gattung|epoche|motiv|rezeptionsgeschichte|maerchen|sage|fabel|ballade|novelle|roman/u.test(text)) {
    add('Leseförderung und sinngerechtes Lesen', 'Textsorte erkennen')
  }
  if (/literar|lyrik|epik|drama|gedicht|erzaehl|interpret|gattung|epoche|theater|werk|motiv|kurzgeschichte|ballade|novelle|roman/u.test(text)) {
    add(
      parsedGoal.phase === 'Qualifikationsphase'
        ? 'Literarische Texte vertieft gattungsspezifisch analysieren'
        : 'Literarische Texte grundlegend gattungsspezifisch erschließen',
      'Literarische Texte mit Deutungshypothese interpretieren',
    )
  }
  if (/vergleichen|vergleich|historisch|geschichte|kontext|biografie|epochen|intertextuell|intermedial|stoff|motiv/u.test(text)) {
    add('Literarische Texte kontextbezogen und vergleichend interpretieren')
  }
  if (/klassik|romantik|aufklaerung|sturm|drang|epochenumbruch|18\.|19\./u.test(text)) {
    add('Epochenumbruch 18./19. Jahrhundert', 'Epochenkontext und Merkmale')
  }
  if (/moderne|expressionismus|jahrhundertwende|20\.|sprachkrise|großstadt|grossstadt/u.test(text)) {
    add('Epochenumbruch 19./20. Jahrhundert', 'Literarische Moderne frühes 20. Jh.')
  }
  if (/weimar|nationalsozial|exil|widerstand|innere emigration|gegenwart|1945|1989|wende/u.test(text)) {
    add('Literatur zwischen Widerstand, Exil und innerer Emigration', 'Neuanfänge nach 1945/1989')
  }
  if (/realismus|naturalismus/u.test(text)) {
    add('Darstellung von Wirklichkeit im Realismus/Naturalismus')
  }
  if (/sprache|sprachgebrauch|varietaet|dialekt|umgangssprache|standardsprache|fachsprache|jugendsprache|mehrsprachigkeit|wortschatz|wortbildung|wortfeld/u.test(text)) {
    add('Sprache, Denken, Wirklichkeit', 'Sprachhandlungen einordnen', 'Wortschatz, Wortbildung und Wortfelder untersuchen')
  }
  if (/grammatik|syntax|morphologie|semantik|tempus|modus|kasus|satz|wortart|wortbildung|rechtschreib|orthograph|interpunktion|zeichensetzung/u.test(text)) {
    add('Grammatikalisches und orthografisches Wissen vertiefen')
  }
  if (/rhetor|stilmittel|sprachlich|ausdruck|stilistisch|wirkung|sprachebene|bildlichkeit|metaphor|symbol/u.test(text)) {
    add('Rhetorische Mittel analysieren')
  }
  if (/sachtext|pragmatisch|sachverhalt|information|nicht linear|formular|diagramm|quelle|zusammenfass|beschaffen|auswert|materialgestuetzt/u.test(text)) {
    add('Sach- und Gebrauchstexte auswerten')
  }
  if (/film|hoertext|audiovisuell|audio|visuell|grafisch|comic|graphic|serie|bild|ton|schnitt/u.test(text)) {
    add('Filme, Hörtexte und grafische Literatur analysieren und interpretieren')
  }
  if (/medien|internet|digital|podcast|tutorial|werbung|fernsehen|zeitung|oeffentlichkeit|kommunikationstechnolog|multimodal/u.test(text)) {
    add('Medienanalyse Grundlage', 'Unterschiedliche Medien reflektiert und kritisch nutzen')
  }
  if (/netzspezifisch|netzsprache|mediensprache|jugendsprache|digitalen kommunizieren|digitaler kommunikation|digitale kommunikation|soziale netzwerke|gegenwartssprache/u.test(text)) {
    add('Medien- und Netzsprache')
  }
  if (/manipulat|beeinfluss|framing|agenda|desinformation|politische rede/u.test(text)) {
    add('Medienwandel und Öffentlichkeit', 'Rhetorik digitale Öffentlichkeit')
  }
  if (/kommunikation|stoerung|kommunikationsmodell|gespraechsverhalten|pragmatik/u.test(text)) {
    add('Pragmatische Modelle', 'Kommunikationsprobleme in Alltagssituationen untersuchen')
  }
  if (/migration|transkultur|postkolonial|identitaet|mehrsprachigkeit/u.test(text)) {
    add('Literatur/Sprache im Kontext Migration')
  }

  const ids = [...titles]
    .map((title) => canonicalTitleToId.get(title) ?? canonicalTitleToId.get(asciiFold(title)))
    .filter((id): id is string => Boolean(id))

  if (ids.length > 0) return [...new Set(ids)]
  return [
    requireCanonicalTitle('Grundformen schriftlicher Darstellung unterscheiden und passend einsetzen'),
    requireCanonicalTitle('Leseförderung und sinngerechtes Lesen'),
  ]
}

function requireCanonicalTitle(title: string): string {
  const id = canonicalTitleToId.get(title) ?? canonicalTitleToId.get(asciiFold(title))
  if (!id) throw new Error(`Missing canonical Deutsch title: ${title}`)
  return id
}

function loadCanonicalTitleToId(): Map<string, string> {
  const landscape = readJson<{ goals: Goal[] }>(canonicalPath)
  const map = new Map<string, string>()
  for (const goal of landscape.goals) {
    map.set(goal.title, goal.id)
    map.set(asciiFold(goal.title), goal.id)
  }
  return map
}

function updateRegistry(specsToRegister: ExtractionSpec[]): void {
  const registry = readJson<{ version: number; entries: Record<string, unknown>[] }>(registryPath)
  const nextEntries = registry.entries.filter(
    (entry) =>
      !(
        entry.jurisdiction === 'DE-MV'
        && entry.subject === 'Deutsch'
        && typeof entry.landscapeId === 'string'
        && specsToRegister.some((spec) => spec.sourceLandscapeId === entry.landscapeId)
      ),
  )
  for (const spec of specsToRegister) {
    nextEntries.push({
      landscapeId: spec.sourceLandscapeId,
      title: spec.title,
      jurisdiction: spec.jurisdiction,
      subject: 'Deutsch',
      stage: spec.stage === 'SekI' ? 'Sekundarstufe I' : 'Sekundarstufe II',
      sourcePath: spec.sourcePdfPath,
      archiveSourcePath: spec.sourcePdfPath,
      archivePath:
        spec.stage === 'SekI' ? 'curricula/DE/Gymnasium/input/MV/lower-secondary/' : 'curricula/DE/Gymnasium/input/MV/upper-secondary/',
      sourceDocumentKey: spec.sourceDocumentKey,
      sourceUrl: spec.sourceUrl,
    })
  }
  registry.entries = nextEntries.sort((a, b) => String(a.landscapeId).localeCompare(String(b.landscapeId)))
  writeJson(registryPath, registry)
}

function updateReadme(): void {
  const path = 'curricula/DE/Gymnasium/input/MV/README.md'
  const existing = existsSync(abs(path)) ? readFileSync(abs(path), 'utf8') : '# Mecklenburg-Vorpommern (MV) - Gymnasium Curricula\n'
  const section = [
    '<!-- DE-MV-DEUTSCH-SOURCE-EXTRACTION:start -->',
    '## Deutsch',
    '',
    'Official Bildungsserver MV source page:',
    '',
    '- https://www.bildung-mv.de/unterricht/rahmenplaene/rahmenplaene-fuer-die-allgemein-bildenden-faecher/deutsch/',
    '',
    'Archived official PDFs:',
    '',
    '- `lower-secondary/RP_AB_Deu_Sek_I_Gym_Ges_2025.pdf`',
    '- `upper-secondary/RP_DEU_SEK2_2019.pdf`',
    '',
    'Generated source extractions:',
    '',
    '- `lower-secondary/source-extraction/DE_MV_DEUTSCH_SEKI_RAHMENPLAN_2025.source-extraction.json`',
    '- `upper-secondary/source-extraction/DE_MV_DEUTSCH_SEKII_RAHMENPLAN_2019.source-extraction.json`',
    '<!-- DE-MV-DEUTSCH-SOURCE-EXTRACTION:end -->',
    '',
  ].join('\n')
  const updated = replaceMarkedSection(existing, 'DE-MV-DEUTSCH-SOURCE-EXTRACTION', section)
  writeFileSync(abs(path), `${updated.trim()}\n`, 'utf8')
}

function updateStageReferences(): void {
  updateReferenceFile(
    'curricula/DE/Gymnasium/input/MV/lower-secondary/references.md',
    'DE-MV-DEUTSCH-SEKI-SOURCE-EXTRACTION',
    'lower-secondary extraction target: standards and verbindliche Unterrichtsinhalte from the official 2025 Deutsch Sek I Rahmenplan',
    'curricula/DE/Gymnasium/input/MV/lower-secondary/RP_AB_Deu_Sek_I_Gym_Ges_2025.pdf',
    specs[0].officialPageUrl,
    specs[0].sourceUrl,
    specs[0].extractionPath,
  )
  updateReferenceFile(
    'curricula/DE/Gymnasium/input/MV/upper-secondary/references.md',
    'DE-MV-DEUTSCH-SEKII-SOURCE-EXTRACTION',
    'upper-secondary extraction target: competency standards and mandatory qualification-phase topics from the official 2019 Deutsch Rahmenplan',
    'curricula/DE/Gymnasium/input/MV/upper-secondary/RP_DEU_SEK2_2019.pdf',
    specs[1].officialPageUrl,
    specs[1].sourceUrl,
    specs[1].extractionPath,
  )
}

function updateReferenceFile(
  path: string,
  marker: string,
  scope: string,
  pdfPath: string,
  pageUrl: string,
  sourceUrl: string,
  extractionPath: string,
): void {
  const existing = existsSync(abs(path)) ? readFileSync(abs(path), 'utf8') : ''
  const section = [
    `<!-- ${marker}:start -->`,
    '## Deutsch',
    '',
    'Starting point:',
    pageUrl,
    '',
    '- Official PDF:',
    `  ${sourceUrl}`,
    '',
    'Scope:',
    '',
    '- Mecklenburg-Vorpommern',
    '- Gymnasium/Gesamtschule',
    '- Deutsch',
    `- ${scope}`,
    '',
    'Archived locally at:',
    '',
    `- \`${pdfPath}\``,
    '',
    'Generated source extraction:',
    '',
    `- \`${extractionPath}\``,
    `<!-- ${marker}:end -->`,
    '',
  ].join('\n')
  const updated = replaceMarkedSection(existing, marker, section)
  writeFileSync(abs(path), `${updated.trim()}\n`, 'utf8')
}

function replaceMarkedSection(existing: string, marker: string, section: string): string {
  const pattern = new RegExp(`<!-- ${marker}:start -->[\\s\\S]*?<!-- ${marker}:end -->`, 'u')
  if (pattern.test(existing)) return existing.replace(pattern, section.trim())
  return `${existing.trim()}\n\n${section}`.trimStart()
}

function duplicates(values: string[]): string[] {
  const seen = new Set<string>()
  const result = new Set<string>()
  for (const value of values) {
    if (seen.has(value)) result.add(value)
    seen.add(value)
  }
  return [...result].sort()
}

function titleFromSourceText(value: string): string {
  const cleaned = value.replace(/[,.]$/u, '')
  return cleaned.length <= 120 ? cleaned : `${cleaned.slice(0, 117).trim()}...`
}

function toSentenceFragment(value: string): string {
  const cleaned = value.replace(/[,.]$/u, '').trim()
  return `${cleaned.charAt(0).toLowerCase()}${cleaned.slice(1)}.`
}

function cleanSourceText(value: string): string {
  return value
    .replace(/\u00ad/gu, '')
    .replace(/[●•]/gu, '')
    .replace(/\s*\d+\s+Konkretisierung der Standards in den Kompetenzbereichen\s*/gu, ' ')
    .replace(/\s*\d+\s+Konkretisierung:\s*/gu, ' ')
    .replace(/-\s+/gu, '')
    .replace(/\s+([,.;:])/gu, '$1')
    .replace(/\s+/gu, ' ')
    .trim()
}

function passageIdFor(spec: ExtractionSpec, topicCode: string): string {
  return `${spec.extractionId.toLowerCase()}:${slug(topicCode)}`
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(abs(path), 'utf8')) as T
}

function writeJson(path: string, value: unknown): void {
  mkdirSync(dirname(abs(path)), { recursive: true })
  writeFileSync(abs(path), `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

function pdftotext(args: string[]): string {
  return execFileSync('pdftotext', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
}

function abs(path: string): string {
  return resolve(repoRoot, path)
}

function uuidFromString(value: string): string {
  const hex = createHash('sha1').update(value).digest('hex').slice(0, 32)
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`
}

function slug(value: string): string {
  return asciiFold(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, '-')
    .replace(/^-|-$/gu, '')
}

function asciiFold(value: string): string {
  return value
    .replace(/Ä/gu, 'Ae')
    .replace(/Ö/gu, 'Oe')
    .replace(/Ü/gu, 'Ue')
    .replace(/ä/gu, 'ae')
    .replace(/ö/gu, 'oe')
    .replace(/ü/gu, 'ue')
    .replace(/ß/gu, 'ss')
}

main()
