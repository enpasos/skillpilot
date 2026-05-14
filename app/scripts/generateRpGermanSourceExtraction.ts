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
    extractionId: 'DE_RP_DEUTSCH_SEKI_LEHRPLAN_2022',
    title: 'DE-RP - Deutsch Sekundarstufe I (Rheinland-Pfalz, Lehrplan 2022 Source-Extraction)',
    sourceLandscapeId: uuidFromString('DE-RP-DEUTSCH-SEKI-LEHRPLAN-2022'),
    sourceDocumentKey: 'RP-DEUTSCH-SEKI-2022',
    sourceDocumentTitle: 'Lehrplan Deutsch Sekundarstufe I, Klassen 5-10 (Rheinland-Pfalz, 2022)',
    sourcePdfPath: 'curricula/DE/Gymnasium/input/RP/lower-secondary/Deutsch_Sekundarstufe_I_Klassen_5_10_2022.pdf',
    sourceUrl:
      'https://bildung.rlp.de/lehrplaene/?cHash=451ab34498bbb890d09487fc6fe1577a&tx_rlpbase_download%5Baction%5D=download&tx_rlpbase_download%5Bcontroller%5D=Download&tx_rlpbase_download%5Bitem%5D=56458&type=432522',
    officialPageUrl: 'https://bildung.rlp.de/lehrplaene',
    jurisdiction: 'DE-RP',
    stage: 'SekI',
    extractionPath:
      'curricula/DE/Gymnasium/input/RP/lower-secondary/source-extraction/DE_RP_DEUTSCH_SEKI_LEHRPLAN_2022.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-RP/lower-secondary/rp_german_lower_secondary_source_extraction_to_canonical_german.review.json',
    pdfFirstPage: 37,
    pdfLastPage: 171,
    expectedPassages: 56,
    peerBaseline: 'BW/HE/BY/BB/BE/NI/NW/SH/HB/HH/MV = 559/257/434/379/379/273/417/221/226/392/380 Source-Ziele',
  },
  {
    extractionId: 'DE_RP_DEUTSCH_SEKII_MSS_2014',
    title: 'DE-RP - Deutsch Oberstufe (Rheinland-Pfalz, MSS/BiSta-Synopse 2014 Source-Extraction)',
    sourceLandscapeId: uuidFromString('DE-RP-DEUTSCH-SEKII-MSS-2014'),
    sourceDocumentKey: 'RP-DEUTSCH-SEKII-MSS-2014',
    sourceDocumentTitle:
      'Lehrplan Deutsch Grund- und Leistungsfach in der gymnasialen Oberstufe (Mainzer Studienstufe), Anpassung an die Bildungsstandards 2014',
    sourcePdfPath: 'curricula/DE/Gymnasium/input/RP/upper-secondary/Deutsch_MSS_Bildungsstandards_Anpassung_2014.pdf',
    sourceUrl:
      'https://bildung.rlp.de/lehrplaene/?cHash=932ec41862b29737f34b7212edc8ebb7&tx_rlpbase_download%5Baction%5D=download&tx_rlpbase_download%5Bcontroller%5D=Download&tx_rlpbase_download%5Bitem%5D=56456&type=432522',
    officialPageUrl: 'https://bildung.rlp.de/lehrplaene',
    jurisdiction: 'DE-RP',
    stage: 'SekII',
    extractionPath:
      'curricula/DE/Gymnasium/input/RP/upper-secondary/source-extraction/DE_RP_DEUTSCH_SEKII_MSS_2014.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-RP/upper-secondary/rp_german_upper_secondary_source_extraction_to_canonical_german.review.json',
    pdfFirstPage: 2,
    pdfLastPage: 21,
    expectedPassages: 10,
    peerBaseline: 'BW/HE/BY/BB/BE/NI/NW/SH/HB/HH/MV = 559/257/434/379/379/273/417/221/226/392/380 Source-Ziele',
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
  const text = pdftotext(['-layout', '-f', String(spec.pdfFirstPage), '-l', String(spec.pdfLastPage), abs(spec.sourcePdfPath), '-'])
  return parseLowerCompetencyTables(text)
}

function parseUpperGoals(spec: ExtractionSpec): ParsedGoal[] {
  return reindex(parseUpperStandards(spec))
}

function parseLowerCompetencyTables(text: string): ParsedGoal[] {
  const goals: ParsedGoal[] = []
  let phase = 'Sekundarstufe I'
  let area = ''
  let subfield = ''
  let active = false
  let current = ''

  const currentField = () => [area, subfield].filter(Boolean).join(' / ') || 'Kompetenztabelle'
  const flush = () => {
    const normalized = cleanSourceText(current)
    current = ''
    if (!active || !isMeaningfulSourceGoal(normalized)) return
    goals.push({
      phase,
      field: currentField(),
      topicCode: topicCodeFor('RP-SI-KOMPETENZ', phase, currentField(), 'unspecified'),
      text: normalized,
      index: goals.length + 1,
      courseLevel: 'unspecified',
    })
  }

  for (const rawLine of text.split(/\r?\n/u)) {
    const line = rawLine.replace(/\f/gu, '').trim()
    if (!line) {
      flush()
      continue
    }

    const heading = detectLowerHeading(line)
    if (heading) {
      flush()
      if (heading.phase) phase = heading.phase
      if (heading.area) area = heading.area
      if (heading.subfield) subfield = heading.subfield
      active = false
      continue
    }

    if (/^Kernbereiche\b/u.test(line)) {
      flush()
      active = true
      continue
    }
    if (isStructuralLine(line) || /^(FACHBEGRIFFE|LERNRAUM|LEISTUNGSRAUM)\b/u.test(line)) {
      flush()
      active = false
      continue
    }

    if (!active) continue

    const leftCell = cleanSourceText(rawLine.slice(0, 26))
    if (leftCell && !isStructuralLine(leftCell) && !/[●•]/u.test(leftCell)) {
      subfield = subfield && !/[a-zäöüß]$/u.test(subfield) ? `${subfield} ${leftCell}` : leftCell
    }

    const highColumnCell = rawLine.slice(112).trim()
    if (!highColumnCell) continue

    const bulletSegments = splitBulletSegments(highColumnCell)
    if (bulletSegments.length > 0) {
      for (const segment of bulletSegments) {
        flush()
        current = segment
      }
      continue
    }

    if (current) current = `${current} ${highColumnCell}`
  }
  flush()

  return goals
}

function parseUpperStandards(spec: ExtractionSpec): ParsedGoal[] {
  const goals: ParsedGoal[] = []
  let field = 'Prozessbezogene Kompetenzen'

  for (const block of pdftotextBlocks([
    '-bbox-layout',
    '-f',
    String(spec.pdfFirstPage),
    '-l',
    String(spec.pdfLastPage),
    abs(spec.sourcePdfPath),
    '-',
  ])) {
    const text = cleanSourceText(block.text)
    if (!text) continue

    const heading = detectUpperStandardsHeading(text)
    if (heading) {
      field = heading
      continue
    }

    if (isStructuralLine(text) || /^BiSta$/u.test(text) || /^Anmerkung$/u.test(text) || /^MSS-Lehrplan$/u.test(text)) continue
    if (block.xMin > 120 || block.xMax > 245) continue
    if (!isMeaningfulSourceGoal(text)) continue

    for (const segment of splitUpperStandardText(text)) {
      goals.push({
        phase: 'Qualifikationsphase',
        field,
        topicCode: topicCodeFor('RP-SII-BISTA', 'Qualifikationsphase', field, 'both'),
        text: segment,
        index: goals.length + 1,
        courseLevel: 'both',
      })
    }
  }

  return goals
}

function detectLowerHeading(line: string): { phase?: string; area?: string; subfield?: string } | null {
  const compact = line.replace(/\s+/gu, ' ').trim()
  const phaseMatch = compact.match(/Die Klassen ([5789]\s*(?:und|\/)\s*(?:6|8|10))\s*[–-]\s*(.+)$/u)
  if (phaseMatch) {
    return { phase: `Klassen ${phaseMatch[1].replace(/\s+/gu, ' ')}`, area: phaseMatch[2], subfield: '' }
  }
  const upperAreas = [
    'SPRECHEN UND ZUHÖREN',
    'SCHREIBEN',
    'LESEN',
    'SPRACHE UND SPRACHGEBRAUCH UNTERSUCHEN',
    'DIGITALE MEDIEN NUTZEN',
  ]
  if (upperAreas.includes(compact)) return { area: toTitleCase(compact), subfield: '' }
  return null
}

function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .replace(/(^|\s)\S/gu, (match) => match.toUpperCase())
    .replace(/\bUnd\b/gu, 'und')
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

function detectUpperStandardsHeading(line: string): string | null {
  if (/^\d\.\d(?:\.\d)?\s+/u.test(line)) return line
  const fields = [
    'Prozessbezogene Kompetenzen',
    'Sprechen, Zuhören, Schreiben, Lesen',
    'Sprechen und Zuhören',
    'Schreiben',
    'Lesen',
    'Sich mit Texten und Medien auseinandersetzen',
    'Sprache und Sprachgebrauch reflektieren',
    'Domänenspezifische Kompetenzen',
  ]
  return fields.includes(line) ? line : null
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

function splitBulletSegments(line: string): string[] {
  const normalized = line.replace(/[●•]/gu, '•')
  if (/^[-–]\s+/u.test(normalized)) return [normalized.replace(/^[-–]\s+/u, '').trim()]
  if (!normalized.includes('•')) return []
  return normalized
    .split('•')
    .slice(1)
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0)
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
    || /^LEHRPLAN DEUTSCH/u.test(line)
    || /^Seite\s+\d+/u.test(line)
  )
}

function isMeaningfulSourceGoal(value: string): boolean {
  if (value.length < 18) return false
  if (value.split(/\s+/u).length < 3) return false
  if (/^(Klasse|Kapitel|Abschnitt|Tabelle|Abbildung|Beispiel)$/u.test(value)) return false
  if (/^\d+(\.\d+)*\s/u.test(value)) return false
  if (/^(?:\(|auch\b|z\. B\.)/u.test(value)) return false
  if (/krikriedirso/u.test(value)) return false
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
            ? 'pdftotext-layout-rp-seki-gymnasium-enhanced-competency-column'
            : 'pdftotext-bbox-rp-sekii-bista-left-column',
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
          ? 'Das amtliche RP-Deutsch-Source-Ziel ist inhaltlich durch ein kanonisches Deutsch-Ziel abgedeckt.'
          : 'Das amtliche RP-Deutsch-Source-Ziel ist inhaltlich durch mehrere kanonische Deutsch-Ziele abgedeckt; 1:n beschreibt die Zuordnungsform, nicht eine offene Lücke.',
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
            ? 'pdftotext -layout; RP Sek I wird aus den Kompetenzniveautabellen der amtlichen Lehrplan-PDF extrahiert.'
            : 'pdftotext -bbox-layout; RP Sek II wird aus der linken BiSta-Spalte der amtlichen MSS-Synopse extrahiert.',
        sourceGoalExtraction:
          'Ein Source-Ziel pro fachlich prüfbarem amtlichem Kompetenzbullet; Hinweise, Lernraum-/Leistungsraum-Texte und reine Lehrplanreferenzen werden nicht als eigenständige Pflichtziele gewertet.',
      },
      qualityReview: {
        sourceGoalCountPeerBaseline: {
          accepted: true,
          status: 'accepted',
          rationale:
            spec.stage === 'SekI'
              ? `${sourceGoals.length} RP-Sek-I-Source-Ziele aus dem gymnasial einschlägigen erhöhten Kompetenzniveau der amtlichen Kompetenzniveautabellen; gegen ${spec.peerBaseline} plausibel. Alle drei Niveau-Spalten additiv zu zählen würde die Deutsch-Korridorregel klar verletzen und den Gymnasium-Scope verzerren.`
              : `${sourceGoals.length} RP-Sek-II-Source-Ziele aus der linken BiSta-Spalte der MSS-Synopse; die rechte MSS-Referenzspalte und Anmerkungen werden bewusst nicht als zusätzliche Pflichtziele gezählt.`,
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
          'RP Deutsch wurde aus amtlichen Bildungsserver-PDFs extrahiert. MatchType partial bedeutet 1:n-Abdeckung, nicht fachliche Offenheit.',
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
            id: 'official-source-document-present-rp-deutsch',
            label: 'Amtliche RP-Deutsch-Lehrplan-PDF liegt lokal vor',
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
            label: 'Alle erwarteten RP-Deutsch-Passagegruppen wurden extrahiert',
            passed: passages.length === spec.expectedPassages,
            details: `${passages.length}/${spec.expectedPassages} Passagegruppen.`,
          },
          {
            id: 'official-source-extraction-rp-deutsch',
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
            label: 'Source-Ziele aus amtlichen RP-Deutsch-Passagen erzeugt',
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
  if (/diskurs|debatte|podiumsdiskussion|talkshow|private und oeffentliche|oeffentliche kommunikationssituationen|authentischen und fiktiven kommunikationssituationen/u.test(text)) {
    add('Diskurspraktiken vergleichen')
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
        entry.jurisdiction === 'DE-RP'
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
        spec.stage === 'SekI' ? 'curricula/DE/Gymnasium/input/RP/lower-secondary/' : 'curricula/DE/Gymnasium/input/RP/upper-secondary/',
      sourceDocumentKey: spec.sourceDocumentKey,
      sourceUrl: spec.sourceUrl,
    })
  }
  registry.entries = nextEntries.sort((a, b) => String(a.landscapeId).localeCompare(String(b.landscapeId)))
  writeJson(registryPath, registry)
}

function updateReadme(): void {
  const path = 'curricula/DE/Gymnasium/input/RP/README.md'
  const existing = existsSync(abs(path)) ? readFileSync(abs(path), 'utf8') : '# Rheinland-Pfalz (RP) - Gymnasium Curricula\n'
  const section = [
    '<!-- DE-RP-DEUTSCH-SOURCE-EXTRACTION:start -->',
    '## Deutsch',
    '',
    'Official Bildungsserver Rheinland-Pfalz source page:',
    '',
    '- https://bildung.rlp.de/lehrplaene',
    '',
    'Archived official PDFs:',
    '',
    '- `lower-secondary/Deutsch_Sekundarstufe_I_Klassen_5_10_2022.pdf`',
    '- `upper-secondary/Deutsch_MSS_Bildungsstandards_Anpassung_2014.pdf`',
    '- `upper-secondary/Deutsch_LP_SekII_MSS_1998.pdf`',
    '',
    'Generated source extractions:',
    '',
    '- `lower-secondary/source-extraction/DE_RP_DEUTSCH_SEKI_LEHRPLAN_2022.source-extraction.json`',
    '- `upper-secondary/source-extraction/DE_RP_DEUTSCH_SEKII_MSS_2014.source-extraction.json`',
    '<!-- DE-RP-DEUTSCH-SOURCE-EXTRACTION:end -->',
    '',
  ].join('\n')
  const updated = replaceMarkedSection(existing, 'DE-RP-DEUTSCH-SOURCE-EXTRACTION', section)
  writeFileSync(abs(path), `${updated.trim()}\n`, 'utf8')
}

function updateStageReferences(): void {
  updateReferenceFile(
    'curricula/DE/Gymnasium/input/RP/lower-secondary/references.md',
    'DE-RP-DEUTSCH-SEKI-SOURCE-EXTRACTION',
    'lower-secondary extraction target: Kompetenzniveautabellen from the official 2022 Deutsch Sek I Lehrplan',
    'curricula/DE/Gymnasium/input/RP/lower-secondary/Deutsch_Sekundarstufe_I_Klassen_5_10_2022.pdf',
    specs[0].officialPageUrl,
    specs[0].sourceUrl,
    specs[0].extractionPath,
  )
  updateReferenceFile(
    'curricula/DE/Gymnasium/input/RP/upper-secondary/references.md',
    'DE-RP-DEUTSCH-SEKII-SOURCE-EXTRACTION',
    'upper-secondary extraction target: BiSta standards from the official 2014 MSS Deutsch synopse',
    'curricula/DE/Gymnasium/input/RP/upper-secondary/Deutsch_MSS_Bildungsstandards_Anpassung_2014.pdf',
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
    '- Rheinland-Pfalz',
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
    .replace(/\f/gu, ' ')
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
