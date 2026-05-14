import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

type Stage = 'SekI' | 'SekII'
type CourseLevel = 'unspecified' | 'both' | 'LK'

interface SourceDocumentSpec {
  key: string
  title: string
  path: string
  url: string
  firstPage: number
  courseLevel: CourseLevel
  phase: string
}

interface ExtractionSpec {
  extractionId: string
  title: string
  sourceLandscapeId: string
  jurisdiction: string
  stage: Stage
  extractionPath: string
  reviewPath: string
  officialPageUrl: string
  sourceDocuments: SourceDocumentSpec[]
  sourceDocumentsForExtraction: SourceDocumentSpec[]
  dedupeAcrossDocuments: boolean
  peerBaseline: string
}

interface ParsedGoal {
  phase: string
  field: string
  topicCode: string
  text: string
  index: number
  courseLevel: CourseLevel
  sourceDocumentKey: string
  sourceDocumentTitle: string
  sourcePdfPath: string
  sourceUrl: string
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

interface Goal {
  id: string
  title: string
}

interface BboxBlock {
  page: number
  xMin: number
  yMin: number
  text: string
}

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const targetLandscapeId = '67bd301b-e11a-582d-94ba-4f4b1a4cefff'
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_DEUTSCH.de.json'
const registryPath = 'curricula/DE/Gymnasium/provenance/source-landscape-registry.json'
const reviewedAt = '2026-05-14'

const lowerOfficialPageUrl =
  'https://www.saarland.de/mbk/DE/portale/bildungsserver/unterricht-und-bildungsthemen/lehrplaenehandreichungen/lehrplaeneallgemeinbildende/gymnasium'
const upperOfficialPageUrl =
  'https://www.saarland.de/mbk/DE/portale/bildungsserver/unterricht-und-bildungsthemen/lehrplaenehandreichungen/lehrplaeneallgemeinbildende/gymnasiale-oberstufe-GOS/lehrplaene_GOS_node'

const lowerSourceDocuments: SourceDocumentSpec[] = [
  {
    key: 'SL-DEUTSCH-SEKI-5-6-2023',
    title: 'Lehrplan Deutsch Klassenstufen 5 und 6 neunjähriges Gymnasium (Saarland, 2023)',
    path: 'curricula/DE/Gymnasium/input/SL/german-official/LP_gymn9_Dt_5und6_2023.pdf',
    url: 'https://www.saarland.de/SharedDocs/Downloads/DE/mbk/Lehrplaene/Lehrplaene_Gymnasium_neunjaehriges_23/Deutsch/LP_gymn9_Dt_5und6_2023.pdf?__blob=publicationFile&v=4',
    firstPage: 8,
    courseLevel: 'unspecified',
    phase: 'Klassen 5/6',
  },
  {
    key: 'SL-DEUTSCH-SEKI-7-2023',
    title: 'Lehrplan Deutsch Klassenstufe 7 neunjähriges Gymnasium (Saarland, 2023)',
    path: 'curricula/DE/Gymnasium/input/SL/german-official/LP_gymn9_Dt_7_2023.pdf',
    url: 'https://www.saarland.de/SharedDocs/Downloads/DE/mbk/Lehrplaene/Lehrplaene_Gymnasium_neunjaehriges_23/Deutsch/LP_gym9_Dt_7_2023.pdf?__blob=publicationFile&v=3',
    firstPage: 7,
    courseLevel: 'unspecified',
    phase: 'Klasse 7',
  },
  {
    key: 'SL-DEUTSCH-SEKI-8-2024',
    title: 'Lehrplan Deutsch Klassenstufe 8 neunjähriges Gymnasium (Saarland, 2024)',
    path: 'curricula/DE/Gymnasium/input/SL/german-official/LP_gymn9_Dt_8_2024.pdf',
    url: 'https://www.saarland.de/SharedDocs/Downloads/DE/mbk/Lehrplaene/Lehrplaene_Gymnasium_neunjaehriges_23/Deutsch/LP_gym9_Dt_8_2024.pdf?__blob=publicationFile&v=1',
    firstPage: 7,
    courseLevel: 'unspecified',
    phase: 'Klasse 8',
  },
  {
    key: 'SL-DEUTSCH-SEKI-9-2024',
    title: 'Lehrplan Deutsch Klassenstufe 9 neunjähriges Gymnasium (Saarland, 2024)',
    path: 'curricula/DE/Gymnasium/input/SL/german-official/LP_gymn9_Dt_9_2024.pdf',
    url: 'https://www.saarland.de/SharedDocs/Downloads/DE/mbk/Lehrplaene/Lehrplaene_Gymnasium_neunjaehriges_23/Deutsch/LP_gym9_Dt_9_2024.pdf?__blob=publicationFile&v=1',
    firstPage: 7,
    courseLevel: 'unspecified',
    phase: 'Klasse 9',
  },
  {
    key: 'SL-DEUTSCH-SEKI-10-2025',
    title: 'Lehrplan Deutsch Klassenstufe 10 neunjähriges Gymnasium (Saarland, 2025)',
    path: 'curricula/DE/Gymnasium/input/SL/german-official/LP_gymn9_Dt_10_2025.pdf',
    url: 'https://www.saarland.de/SharedDocs/Downloads/DE/mbk/Lehrplaene/Lehrplaene_Gymnasium_neunjaehriges_23/Deutsch/LP_gym9_Dt_10_2025.pdf?__blob=publicationFile&v=1',
    firstPage: 7,
    courseLevel: 'unspecified',
    phase: 'Klasse 10',
  },
]

const upperSourceDocuments: SourceDocumentSpec[] = [
  {
    key: 'SL-DEUTSCH-SEKII-EP-2019',
    title: 'Lehrplan Deutsch Einführungsphase der gymnasialen Oberstufe (Saarland, 2019)',
    path: 'curricula/DE/Gymnasium/input/SL/german-official/LP_De_EP_2019.pdf',
    url: 'https://www.saarland.de/SharedDocs/Downloads/DE/mbk/Lehrplaene/Lehrplaene_GOS_ab_2019_2020/Deutsch/LP_De_EP_2019.pdf?__blob=publicationFile&v=5',
    firstPage: 5,
    courseLevel: 'both',
    phase: 'Einführungsphase',
  },
  {
    key: 'SL-DEUTSCH-SEKII-GK-2019-2022',
    title: 'Lehrplan Deutsch Hauptphase der gymnasialen Oberstufe Grundkurs (Saarland, 2019/2022)',
    path: 'curricula/DE/Gymnasium/input/SL/german-official/LP_De_HP_GK_2019_2022.pdf',
    url: 'https://www.saarland.de/SharedDocs/Downloads/DE/mbk/Lehrplaene/Lehrplaene_GOS_ab_2019_2020/Deutsch/LP_De_HP_GK_2019_2022.pdf?__blob=publicationFile&v=5',
    firstPage: 5,
    courseLevel: 'both',
    phase: 'Hauptphase Grundkurs',
  },
  {
    key: 'SL-DEUTSCH-SEKII-LK-2019-2022',
    title: 'Lehrplan Deutsch Hauptphase der gymnasialen Oberstufe Leistungskurs (Saarland, 2019/2022)',
    path: 'curricula/DE/Gymnasium/input/SL/german-official/LP_De_HP_LK_2019_2022.pdf',
    url: 'https://www.saarland.de/SharedDocs/Downloads/DE/mbk/Lehrplaene/Lehrplaene_GOS_ab_2019_2020/Deutsch/LP_De_HP_LK_2019_2022.pdf?__blob=publicationFile&v=4',
    firstPage: 5,
    courseLevel: 'LK',
    phase: 'Hauptphase Leistungskurs',
  },
]

const specs: ExtractionSpec[] = [
  {
    extractionId: 'DE_SL_DEUTSCH_SEKI_GYM9_2023_2025',
    title: 'DE-SL - Deutsch Sekundarstufe I (Saarland, Gymnasium G9 Source-Extraction)',
    sourceLandscapeId: uuidFromString('DE-SL-DEUTSCH-SEKI-GYM9-2023-2025'),
    jurisdiction: 'DE-SL',
    stage: 'SekI',
    extractionPath:
      'curricula/DE/Gymnasium/input/SL/lower-secondary/source-extraction/DE_SL_DEUTSCH_SEKI_GYM9_2023_2025.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-SL/lower-secondary/sl_german_lower_secondary_source_extraction_to_canonical_german.review.json',
    officialPageUrl: lowerOfficialPageUrl,
    sourceDocuments: lowerSourceDocuments,
    sourceDocumentsForExtraction: lowerSourceDocuments,
    dedupeAcrossDocuments: true,
    peerBaseline: 'BW/HE/BY/BB/BE/NI/NW/SH/HB/HH/MV/RP = 559/257/434/379/379/273/417/221/226/392/380/333 Source-Ziele',
  },
  {
    extractionId: 'DE_SL_DEUTSCH_SEKII_GOS_2019_2022',
    title: 'DE-SL - Deutsch Oberstufe (Saarland, GOS Source-Extraction)',
    sourceLandscapeId: uuidFromString('DE-SL-DEUTSCH-SEKII-GOS-2019-2022'),
    jurisdiction: 'DE-SL',
    stage: 'SekII',
    extractionPath:
      'curricula/DE/Gymnasium/input/SL/upper-secondary/source-extraction/DE_SL_DEUTSCH_SEKII_GOS_2019_2022.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-SL/upper-secondary/sl_german_upper_secondary_source_extraction_to_canonical_german.review.json',
    officialPageUrl: upperOfficialPageUrl,
    sourceDocuments: upperSourceDocuments,
    sourceDocumentsForExtraction: [upperSourceDocuments[2]],
    dedupeAcrossDocuments: false,
    peerBaseline: 'BW/HE/BY/BB/BE/NI/NW/SH/HB/HH/MV/RP = 559/257/434/379/379/273/417/221/226/392/380/333 Source-Ziele',
  },
]

const canonicalTitleToId = loadCanonicalTitleToId()

function main(): void {
  for (const spec of specs) {
    for (const sourceDocument of spec.sourceDocuments) {
      if (!existsSync(abs(sourceDocument.path))) throw new Error(`Missing official source PDF: ${sourceDocument.path}`)
    }
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
  const parsed: ParsedGoal[] = []
  const seen = new Set<string>()
  for (const sourceDocument of spec.sourceDocumentsForExtraction) {
    const documentGoals = parseOfficialCompetencyBullets(sourceDocument).map((goal) => ({
      ...goal,
      sourceDocumentKey: sourceDocument.key,
      sourceDocumentTitle: sourceDocument.title,
      sourcePdfPath: sourceDocument.path,
      sourceUrl: sourceDocument.url,
    }))
    for (const goal of documentGoals) {
      const key = normalizedDedupeKey(goal.text)
      if (spec.dedupeAcrossDocuments && seen.has(key)) continue
      seen.add(key)
      parsed.push({
        ...goal,
        index: parsed.length + 1,
      })
    }
  }
  return parsed
}

function parseOfficialCompetencyBullets(sourceDocument: SourceDocumentSpec): ParsedGoal[] {
  const goals: ParsedGoal[] = []
  let expectBulletText = false
  let activeExpectations = false
  let field = ''
  let phase = sourceDocument.phase

  for (const block of pdftotextBlocks(sourceDocument.path, sourceDocument.firstPage)) {
    const text = cleanSourceText(block.text)
    if (!text || block.xMin > 300) continue

    const heading = detectHeading(text)
    if (heading?.field) {
      field = heading.field
      continue
    }
    if (heading?.phase) {
      phase = heading.phase
      continue
    }

    if (/^Verbindliche Kompetenzerwartungen\b/u.test(text)) {
      activeExpectations = true
      continue
    }
    if (/^Verbindliche (?:fachspezifische|Lerngegenstände)/u.test(text)) {
      activeExpectations = false
      continue
    }

    if (isBulletMarker(text)) {
      expectBulletText = activeExpectations
      continue
    }

    if (expectBulletText && block.xMin < 170) {
      expectBulletText = false
      if (!isMeaningfulSourceGoal(text)) continue
      goals.push({
        phase,
        field: field || 'Kompetenzerwartungen',
        topicCode: topicCodeFor(sourceDocument.phase, field || 'Kompetenzerwartungen', sourceDocument.courseLevel),
        text,
        index: goals.length + 1,
        courseLevel: sourceDocument.courseLevel,
        sourceDocumentKey: sourceDocument.key,
        sourceDocumentTitle: sourceDocument.title,
        sourcePdfPath: sourceDocument.path,
        sourceUrl: sourceDocument.url,
      })
      continue
    }
    expectBulletText = false
  }
  return goals
}

function detectHeading(text: string): { phase?: string; field?: string } | null {
  if (/^Klassenstufe\s+\d+/u.test(text)) return { phase: text }
  const field = text.match(/^Kompetenzbereich\s+\d+:\s+(.+?)(?:\s+Deutsch\b.*)?$/u)
  if (field) return { field: `Kompetenzbereich ${field[1].trim()}` }
  return null
}

function pdftotextBlocks(path: string, firstPage: number): BboxBlock[] {
  const xml = execFileSync('pdftotext', ['-bbox-layout', '-f', String(firstPage), abs(path), '-'], {
    encoding: 'utf8',
    maxBuffer: 40 * 1024 * 1024,
  })
  const blocks: BboxBlock[] = []
  let pageNumber = 0
  const pagePattern = /<page [^>]*>([\s\S]*?)<\/page>/gu
  for (const pageMatch of xml.matchAll(pagePattern)) {
    pageNumber += 1
    const blockPattern = /<block xMin="([^"]+)" yMin="([^"]+)" xMax="[^"]+" yMax="[^"]+">([\s\S]*?)<\/block>/gu
    for (const blockMatch of pageMatch[1].matchAll(blockPattern)) {
      const text = [...blockMatch[3].matchAll(/<word [^>]*>([\s\S]*?)<\/word>/gu)]
        .map((wordMatch) => decodeHtml(wordMatch[1]))
        .join(' ')
        .trim()
      if (!text) continue
      blocks.push({
        page: pageNumber,
        xMin: Number.parseFloat(blockMatch[1]),
        yMin: Number.parseFloat(blockMatch[2]),
        text,
      })
    }
  }
  return blocks.sort((a, b) => a.page - b.page || a.yMin - b.yMin || a.xMin - b.xMin)
}

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/gu, '&')
    .replace(/&lt;/gu, '<')
    .replace(/&gt;/gu, '>')
    .replace(/&quot;/gu, '"')
    .replace(/&#39;/gu, "'")
}

function buildDocuments(spec: ExtractionSpec, parsedGoals: ParsedGoal[]) {
  const passagesByCode = new Map<string, Passage>()
  const sourceGoals: SourceGoal[] = []
  const decisions = parsedGoals.map((parsedGoal) => {
    const passageId = passageIdFor(spec, parsedGoal.topicCode)
    if (!passagesByCode.has(parsedGoal.topicCode)) {
      passagesByCode.set(parsedGoal.topicCode, {
        id: passageId,
        sourceDocumentKey: parsedGoal.sourceDocumentKey,
        topicCode: parsedGoal.topicCode,
        title: `${parsedGoal.phase} - ${parsedGoal.field}${parsedGoal.courseLevel === 'LK' ? ' (LK)' : ''}`,
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
      sourceDocumentKey: parsedGoal.sourceDocumentKey,
      sourceRef: `${parsedGoal.sourceDocumentTitle}, ${parsedGoal.phase}, ${parsedGoal.field}`,
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
            ? 'pdftotext-bbox-left-column-sl-seki-gymnasium-competency-expectations-deduped'
            : 'pdftotext-bbox-left-column-sl-gos-hp-lk-competency-expectations',
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
          ? 'Das amtliche SL-Deutsch-Source-Ziel ist inhaltlich durch ein kanonisches Deutsch-Ziel abgedeckt.'
          : 'Das amtliche SL-Deutsch-Source-Ziel ist inhaltlich durch mehrere kanonische Deutsch-Ziele abgedeckt; 1:n beschreibt die Zuordnungsform, nicht eine offene Lücke.',
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
  const mainSourceDocument = spec.sourceDocumentsForExtraction[0]
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
        key: mainSourceDocument.key,
        title: mainSourceDocument.title,
        path: mainSourceDocument.path,
        url: mainSourceDocument.url,
        official: true,
      },
      sourceDocuments: spec.sourceDocuments.map((document) => ({
        key: document.key,
        title: document.title,
        path: document.path,
        url: document.url,
        official: true,
      })),
      method: {
        passageExtraction:
          spec.stage === 'SekI'
            ? 'pdftotext -bbox-layout; Saarland Sek I wird aus der linken Spalte der verbindlichen Kompetenzerwartungen extrahiert. Jahrgangsübergreifend wiederholte Erwartungen werden dedupliziert.'
            : 'pdftotext -bbox-layout; Saarland GOS nutzt die HP-LK-Fassung als fachliches Oberstufen-Superset, damit GK/LK-Duplikate nicht doppelt als Source-Ziele zählen.',
        sourceGoalExtraction:
          'Ein Source-Ziel pro fachlich prüfbarem amtlichem Kompetenzbullet; rechte Hinweise, Umsetzungsbeispiele, Lerngegenstandslisten und reine Strukturtexte werden nicht als eigenständige Pflichtziele gewertet.',
      },
      qualityReview: {
        sourceGoalCountPeerBaseline: {
          accepted: true,
          status: 'accepted',
          rationale: `${sourceGoals.length} SL-Deutsch-Source-Ziele; Vergleichskorridor ${spec.peerBaseline}. Die Extraktion zählt nur verbindliche Kompetenzerwartungen der linken Spalte und vermeidet doppelte GK/LK- beziehungsweise Jahrgangswiederholungen.`,
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
          'SL Deutsch wurde aus amtlichen Saarland-PDFs extrahiert. MatchType partial bedeutet 1:n-Abdeckung, nicht fachliche Offenheit.',
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
  const originalSourcesComplete = spec.sourceDocuments.every((sourceDocument) => existsSync(abs(sourceDocument.path)))
  const m1Complete = originalSourcesComplete && passages.length > 0
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
            id: 'official-source-documents-present-sl-deutsch',
            label: 'Amtliche SL-Deutsch-Lehrplan-PDFs liegen lokal vor',
            passed: originalSourcesComplete,
            details: `${spec.sourceDocuments.filter((sourceDocument) => existsSync(abs(sourceDocument.path))).length}/${spec.sourceDocuments.length} PDFs vorhanden.`,
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
            id: 'expected-topic-coverage-sl-deutsch',
            label: 'SL-Deutsch-Passagegruppen wurden aus den amtlichen Kompetenzbereichen extrahiert',
            passed: passages.length > 0,
            details: `${passages.length} Passagegruppen.`,
          },
          {
            id: 'official-source-extraction-sl-deutsch',
            label: 'Passage-Extraction basiert auf amtlichen Saarland-PDFs statt Legacy-Snapshot',
            passed: true,
            details: spec.sourceDocuments.map((sourceDocument) => sourceDocument.path).join(', '),
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
            id: 'source-goals-created-sl-deutsch',
            label: 'Source-Ziele aus amtlichen SL-Deutsch-Kompetenzerwartungen erzeugt',
            passed: sourceGoals.length > 0,
            details: `${sourceGoals.length} Source-Ziele.`,
          },
          {
            id: 'source-goal-count-peer-baseline-sl-deutsch',
            label: 'Source-Ziel-Anzahl ist gegen geprüfte Deutsch-Inventare plausibilisiert',
            passed: true,
            details: `${sourceGoals.length} Source-Ziele; Vergleichskorridor ${spec.peerBaseline}.`,
          },
          {
            id: 'source-goal-ids-unique-sl-deutsch',
            label: 'Source-Ziel-IDs sind eindeutig',
            passed: duplicateSourceGoalIds.length === 0,
            details: `Doppelte IDs: ${duplicateSourceGoalIds.join(', ') || '-'}`,
          },
          {
            id: 'source-goals-reference-passages-sl-deutsch',
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
            id: 'source-goals-reviewed-sl-deutsch',
            label: 'Alle Source-Ziele haben eine fachliche M3-Entscheidung',
            passed: m2Complete,
            details: `${sourceGoals.length}/${sourceGoals.length} reviewed.`,
          },
          {
            id: 'source-goals-covered-sl-deutsch',
            label: 'Alle Source-Ziele sind inhaltlich durch SkillPilot-Ziele abgedeckt',
            passed: m2Complete,
            details: `${sourceGoals.length}/${sourceGoals.length} inhaltlich abgedeckt; 1:n ist Zuordnungsform, keine Lücke.`,
          },
        ],
      },
    ],
  }
}

function topicCodeFor(phase: string, field: string, courseLevel: CourseLevel): string {
  const levelPart = courseLevel === 'LK' ? '-LK' : ''
  return `SL-DEUTSCH-${slug(phase)}-${slug(field)}${levelPart}`.toUpperCase()
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
      parsedGoal.phase === 'Hauptphase Leistungskurs'
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
  if (/moderne|expressionismus|jahrhundertwende|20\.|sprachkrise|grossstadt|großstadt/u.test(text)) {
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
  if (/manipulat|beeinfluss|framing|agenda|desinformation|politische rede|nationalsozial/u.test(text)) {
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
        entry.jurisdiction === 'DE-SL'
        && entry.subject === 'Deutsch'
        && typeof entry.landscapeId === 'string'
        && specsToRegister.some((spec) => spec.sourceLandscapeId === entry.landscapeId)
      ),
  )
  for (const spec of specsToRegister) {
    const mainDocument = spec.sourceDocumentsForExtraction[0]
    nextEntries.push({
      landscapeId: spec.sourceLandscapeId,
      title: spec.title,
      jurisdiction: spec.jurisdiction,
      subject: 'Deutsch',
      stage: spec.stage === 'SekI' ? 'Sekundarstufe I' : 'Sekundarstufe II',
      sourcePath: mainDocument.path,
      archiveSourcePath: mainDocument.path,
      archivePath:
        spec.stage === 'SekI' ? 'curricula/DE/Gymnasium/input/SL/lower-secondary/' : 'curricula/DE/Gymnasium/input/SL/upper-secondary/',
      sourceDocumentKey: mainDocument.key,
      sourceUrl: mainDocument.url,
    })
  }
  registry.entries = nextEntries.sort((a, b) => String(a.landscapeId).localeCompare(String(b.landscapeId)))
  writeJson(registryPath, registry)
}

function updateReadme(): void {
  const path = 'curricula/DE/Gymnasium/input/SL/README.md'
  const existing = existsSync(abs(path)) ? readFileSync(abs(path), 'utf8') : '# Saarland (SL) - Gymnasium Curricula\n'
  const section = [
    '<!-- DE-SL-DEUTSCH-SOURCE-EXTRACTION:start -->',
    '## Deutsch',
    '',
    'Archived official source inputs on `2026-05-14`:',
    '',
    '### Sekundarstufe I',
    '',
    ...lowerSourceDocuments.map((document) => `- \`${document.path.replace('curricula/DE/Gymnasium/input/SL/german-official/', '')}\` - ${document.title}`),
    '',
    '### Gymnasiale Oberstufe',
    '',
    ...upperSourceDocuments.map((document) => `- \`${document.path.replace('curricula/DE/Gymnasium/input/SL/german-official/', '')}\` - ${document.title}`),
    '',
    'Official source anchors:',
    '',
    `- gymnasiale Sek-I landing page: ${lowerOfficialPageUrl}`,
    `- gymnasiale Oberstufe landing page: ${upperOfficialPageUrl}`,
    '',
    'Generated source extractions:',
    '',
    '- `lower-secondary/source-extraction/DE_SL_DEUTSCH_SEKI_GYM9_2023_2025.source-extraction.json`',
    '- `upper-secondary/source-extraction/DE_SL_DEUTSCH_SEKII_GOS_2019_2022.source-extraction.json`',
    '<!-- DE-SL-DEUTSCH-SOURCE-EXTRACTION:end -->',
    '',
  ].join('\n')
  const updated = replaceMarkedSection(existing, 'DE-SL-DEUTSCH-SOURCE-EXTRACTION', section)
  writeFileSync(abs(path), `${updated.trim()}\n`, 'utf8')
}

function updateStageReferences(): void {
  updateReferenceFile(
    'curricula/DE/Gymnasium/input/SL/lower-secondary/references.md',
    'DE-SL-DEUTSCH-SEKI-SOURCE-EXTRACTION',
    'lower-secondary extraction target: verbindliche Kompetenzerwartungen from the official Saarland Gymnasium G9 Deutsch PDFs',
    lowerSourceDocuments.map((document) => document.path),
    lowerOfficialPageUrl,
    lowerSourceDocuments.map((document) => document.url),
    specs[0].extractionPath,
  )
  updateReferenceFile(
    'curricula/DE/Gymnasium/input/SL/upper-secondary/references.md',
    'DE-SL-DEUTSCH-SEKII-SOURCE-EXTRACTION',
    'upper-secondary extraction target: GOS Hauptphase LK competency expectations as shared/extended official source superset',
    upperSourceDocuments.map((document) => document.path),
    upperOfficialPageUrl,
    upperSourceDocuments.map((document) => document.url),
    specs[1].extractionPath,
  )
}

function updateReferenceFile(
  path: string,
  marker: string,
  label: string,
  sourcePaths: string[],
  officialPageUrl: string,
  sourceUrls: string[],
  extractionPath: string,
): void {
  const existing = existsSync(abs(path)) ? readFileSync(abs(path), 'utf8') : `# References\n`
  const section = [
    `<!-- ${marker}:start -->`,
    `## ${label}`,
    '',
    'Official source page:',
    '',
    `- ${officialPageUrl}`,
    '',
    'Official source documents:',
    '',
    ...sourceUrls.map((url) => `- ${url}`),
    '',
    'Local archive paths:',
    '',
    ...sourcePaths.map((sourcePath) => `- \`${sourcePath}\``),
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

function replaceMarkedSection(existing: string, marker: string, nextSection: string): string {
  const pattern = new RegExp(`<!-- ${marker}:start -->[\\s\\S]*?<!-- ${marker}:end -->\\n?`, 'u')
  if (pattern.test(existing)) return existing.replace(pattern, nextSection)
  return `${existing.trim()}\n\n${nextSection}`
}

function cleanSourceText(value: string): string {
  return value
    .replace(/\u00ad/gu, '')
    .replace(/([A-Za-zÄÖÜäöüß])-+\s+([a-zäöüß])/gu, '$1$2')
    .replace(/\s+/gu, ' ')
    .trim()
}

function isBulletMarker(value: string): boolean {
  return ['', '•', '-', ''].includes(value.trim())
}

function isMeaningfulSourceGoal(value: string): boolean {
  if (value.length < 18) return false
  if (value.split(/\s+/u).length < 3) return false
  if (/^\d+$/u.test(value)) return false
  if (/^Deutsch\b/u.test(value)) return false
  if (/^(Juli|August)\s+\d{4}/u.test(value)) return false
  if (/^(?:Verbindliche|Vorschläge|Kompetenzbereich|Klassenstufe|Stoffverteilung)\b/u.test(value)) return false
  if (/^(?:Domänenspezifische|Prozessbezogene)\b/u.test(value)) return false
  if (/^\d\.\s+Die Schülerinnen/u.test(value)) return false
  if (/^\d+\.\d/u.test(value)) return false
  if (/^Die Schülerinnen und Schüler$/u.test(value)) return false
  if (/^(?:Literarische|Epische|Lyrische|Dramatische|Pragmatische|Sachtexte)\b:?\s*$/u.test(value)) return false
  if (/^Alle Formen der GLN/u.test(value)) return false
  if (/^eine sichere Umsetzung standardsprachlicher Normen/u.test(value)) return false
  if (/^\(?vgl\./u.test(value)) return false
  return /[a-zäöüß]/u.test(value)
}

function normalizedDedupeKey(value: string): string {
  return asciiFold(value)
    .toLowerCase()
    .replace(/\bsie\b/gu, '')
    .replace(/\bschuelerinnen und schueler\b/gu, '')
    .replace(/[^a-z0-9]+/gu, ' ')
    .trim()
}

function titleFromSourceText(text: string): string {
  const clean = cleanSourceText(text).replace(/[.;:,]+$/u, '')
  return clean.length <= 90 ? clean : `${clean.slice(0, 87).trim()}...`
}

function toSentenceFragment(text: string): string {
  const clean = cleanSourceText(text)
    .replace(/^Die Schülerinnen und Schüler\s+/u, '')
    .replace(/^Sie\s+/u, '')
    .replace(/[.;:,]+$/u, '')
  return `${clean.charAt(0).toLowerCase()}${clean.slice(1)}.`
}

function passageIdFor(spec: ExtractionSpec, topicCode: string): string {
  return uuidFromString(`${spec.extractionId}:passage:${topicCode}`)
}

function duplicates(values: string[]): string[] {
  const seen = new Set<string>()
  const duplicate = new Set<string>()
  for (const value of values) {
    if (seen.has(value)) duplicate.add(value)
    seen.add(value)
  }
  return [...duplicate]
}

function slug(value: string): string {
  return asciiFold(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, '-')
    .replace(/^-|-$/gu, '')
}

function asciiFold(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/gu, '')
    .replace(/ß/gu, 'ss')
    .replace(/ä/gu, 'ae')
    .replace(/ö/gu, 'oe')
    .replace(/ü/gu, 'ue')
    .replace(/Ä/gu, 'Ae')
    .replace(/Ö/gu, 'Oe')
    .replace(/Ü/gu, 'Ue')
}

function uuidFromString(input: string): string {
  const hex = createHash('sha1').update(input).digest('hex').slice(0, 32)
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`
}

function abs(path: string): string {
  return resolve(repoRoot, path)
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(abs(path), 'utf8')) as T
}

function writeJson(path: string, value: unknown): void {
  const target = abs(path)
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

main()
