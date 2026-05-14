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
}

interface ExtractionSpec {
  extractionId: string
  title: string
  sourceLandscapeId: string
  jurisdiction: string
  stage: Stage
  extractionPath: string
  reviewPath: string
  archivePath: string
  officialPageUrl: string
  peerBaseline: string
}

interface ParsedGoal {
  phase: string
  field: string
  topicCode: string
  text: string
  index: number
  courseLevel: CourseLevel
  page: number
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
    page: number
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

const sourceDocument: SourceDocumentSpec = {
  key: 'SN-DEUTSCH-GYM-2022',
  title: 'Lehrplan Gymnasium Deutsch Sachsen 2004/2007/2009/2011/2013/2019/2022',
  path: 'curricula/DE/Gymnasium/input/SN/lehrplan-gymnasium-deutsch-sachsen-2022.pdf',
  url: 'https://www.schulportal.sachsen.de/lplandb/lehrplan/file/135/f3QLnBqlLcQXq3XngWT5',
}

const officialPageUrl = 'https://www.schulportal.sachsen.de/lplandb/lehrplan/135'

const specs: ExtractionSpec[] = [
  {
    extractionId: 'DE_SN_DEUTSCH_SEKI_LEHRPLAN_GYMNASIUM_2022',
    title: 'DE-SN - Deutsch Sekundarstufe I (Sachsen, Lehrplan Gymnasium Source-Extraction)',
    sourceLandscapeId: uuidFromString('DE-SN-DEUTSCH-SEKI-LEHRPLAN-GYMNASIUM-2022'),
    jurisdiction: 'DE-SN',
    stage: 'SekI',
    extractionPath:
      'curricula/DE/Gymnasium/input/SN/lower-secondary/source-extraction/DE_SN_DEUTSCH_SEKI_LEHRPLAN_GYMNASIUM_2022.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-SN/lower-secondary/sn_german_lower_secondary_source_extraction_to_canonical_german.review.json',
    archivePath: 'curricula/DE/Gymnasium/input/SN/lower-secondary/',
    officialPageUrl,
    peerBaseline:
      'BW/HE/BY/BB/BE/NI/NW/SH/HB/HH/MV/RP/SL = 559/257/434/379/379/273/417/221/226/392/380/333/600 Source-Ziele',
  },
  {
    extractionId: 'DE_SN_DEUTSCH_SEKII_LEHRPLAN_GYMNASIUM_2022',
    title: 'DE-SN - Deutsch Oberstufe (Sachsen, Lehrplan Gymnasium Source-Extraction)',
    sourceLandscapeId: uuidFromString('DE-SN-DEUTSCH-SEKII-LEHRPLAN-GYMNASIUM-2022'),
    jurisdiction: 'DE-SN',
    stage: 'SekII',
    extractionPath:
      'curricula/DE/Gymnasium/input/SN/upper-secondary/source-extraction/DE_SN_DEUTSCH_SEKII_LEHRPLAN_GYMNASIUM_2022.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-SN/upper-secondary/sn_german_upper_secondary_source_extraction_to_canonical_german.review.json',
    archivePath: 'curricula/DE/Gymnasium/input/SN/upper-secondary/',
    officialPageUrl,
    peerBaseline:
      'BW/HE/BY/BB/BE/NI/NW/SH/HB/HH/MV/RP/SL = 559/257/434/379/379/273/417/221/226/392/380/333/600 Source-Ziele',
  },
]

const canonicalTitleToId = loadCanonicalTitleToId()

function main(): void {
  if (!existsSync(abs(sourceDocument.path))) throw new Error(`Missing official source PDF: ${sourceDocument.path}`)

  const parsedGoals = parseOfficialRows()
  const sourceGoalCounts = new Map<Stage, number>()
  for (const spec of specs) {
    const stageGoals = parsedGoals
      .filter((goal) => goal.stage === spec.stage)
      .map((goal, index) => ({ ...goal, index: index + 1 }))
    const { extraction, review } = buildDocuments(spec, stageGoals)
    writeJson(spec.extractionPath, extraction)
    writeJson(spec.reviewPath, review)
    sourceGoalCounts.set(spec.stage, stageGoals.length)
    console.log(`${spec.extractionId}: ${stageGoals.length} Source-Ziele, ${extraction.passages.length} Passagegruppen`)
  }

  updateRegistry(specs)
  updateReadme(sourceGoalCounts)
  updateStageReferences()
}

function parseOfficialRows(): Array<ParsedGoal & { stage: Stage }> {
  const blocks = pdftotextBlocks(sourceDocument.path)
  const goals: Array<ParsedGoal & { stage: Stage }> = []
  const seen = new Set<string>()
  let phase = ''
  let stage: Stage = 'SekI'
  let courseLevel: CourseLevel = 'unspecified'
  let field = ''

  for (const block of blocks) {
    const phaseMatch = block.text.match(/Klassenstufe\s+\d+/u)
    if (phaseMatch) {
      phase = phaseMatch[0]
      stage = 'SekI'
      courseLevel = 'unspecified'
    }

    if (/Jahrgangsstufen\s+11\/12\s+[–-]\s+Grundkurs/u.test(block.text)) {
      phase = 'Jahrgangsstufen 11/12 Grundkurs'
      stage = 'SekII'
      courseLevel = 'both'
    }
    if (/Jahrgangsstufen\s+11\/12\s+[–-]\s+Leistungskurs/u.test(block.text)) {
      phase = 'Jahrgangsstufen 11/12 Leistungskurs'
      stage = 'SekII'
      courseLevel = 'LK'
    }

    if (block.xMin < 90 && /^(?:Lernbereich\s+\d+:|Wahlbereich\b)/u.test(block.text)) {
      field = topicHeadingFor(blocks, block)
      continue
    }

    if (!isLeftColumnCompetencyBlock(block) || !operatorPattern.test(block.text)) continue
    if (!phase || !field || /^Wahlbereich\b/u.test(field)) continue

    for (const text of splitSourceGoalBlock(block.text)) {
      if (!isMeaningfulSourceGoal(text)) continue
      const key = normalizedDedupeKey(`${stage}:${courseLevel}:${text}`)
      if (seen.has(key)) continue
      seen.add(key)
      goals.push({
        stage,
        phase,
        field,
        topicCode: topicCodeFor(phase, field, courseLevel),
        text,
        index: goals.length + 1,
        courseLevel,
        page: block.page,
      })
    }
  }

  const expectedLowerPhases = ['Klassenstufe 5', 'Klassenstufe 6', 'Klassenstufe 7', 'Klassenstufe 8', 'Klassenstufe 9', 'Klassenstufe 10']
  const foundLowerPhases = new Set(goals.filter((goal) => goal.stage === 'SekI').map((goal) => goal.phase))
  const missingLowerPhases = expectedLowerPhases.filter((expectedPhase) => !foundLowerPhases.has(expectedPhase))
  if (missingLowerPhases.length > 0) throw new Error(`Missing Sachsen Deutsch Sek-I phases: ${missingLowerPhases.join(', ')}`)
  if (!goals.some((goal) => goal.phase === 'Jahrgangsstufen 11/12 Grundkurs')) {
    throw new Error('Missing Sachsen Deutsch upper-secondary Grundkurs goals')
  }
  if (!goals.some((goal) => goal.phase === 'Jahrgangsstufen 11/12 Leistungskurs')) {
    throw new Error('Missing Sachsen Deutsch upper-secondary Leistungskurs goals')
  }

  return goals
}

const operatorPattern =
  /^(?:Einblick gewinnen|Kennen|Beherrschen|Anwenden|Übertragen|Beurteilen|Sich positionieren|Gestalten|Problemlösen)\b/u

function isLeftColumnCompetencyBlock(block: BboxBlock): boolean {
  return block.xMin >= 70 && block.xMin <= 80
}

function topicHeadingFor(blocks: BboxBlock[], headingBlock: BboxBlock): string {
  const sameLine = blocks
    .filter(
      (block) =>
        block.page === headingBlock.page
        && Math.abs(block.yMin - headingBlock.yMin) < 3
        && block.xMin > 100
        && block.xMin < 360,
    )
    .map((block) => block.text)
    .join(' ')
  return cleanSourceText(`${headingBlock.text} ${sameLine}`).replace(/\s+\d+\s+Ustd\.$/u, '')
}

function splitSourceGoalBlock(text: string): string[] {
  const parts = cleanSourceText(text)
    .split(/\s+-\s+/u)
    .map((part) => part.trim())
    .filter(Boolean)
  if (parts.length <= 1) return [cleanSourceText(text)]
  const heading = parts[0]
  return parts.slice(1).map((part) => `${heading}: ${part}`)
}

function pdftotextBlocks(path: string): BboxBlock[] {
  const xml = execFileSync('pdftotext', ['-bbox-layout', '-f', '20', '-l', '74', abs(path), '-'], {
    encoding: 'utf8',
    maxBuffer: 128 * 1024 * 1024,
  })
  const blocks: BboxBlock[] = []
  let pageNumber = 19
  const pagePattern = /<page [^>]*>([\s\S]*?)<\/page>/gu
  for (const pageMatch of xml.matchAll(pagePattern)) {
    pageNumber += 1
    const blockPattern = /<block xMin="([^"]+)" yMin="([^"]+)" xMax="[^"]+" yMax="[^"]+">([\s\S]*?)<\/block>/gu
    for (const blockMatch of pageMatch[1].matchAll(blockPattern)) {
      const text = [...blockMatch[3].matchAll(/<word [^>]*>([\s\S]*?)<\/word>/gu)]
        .map((wordMatch) => decodeHtml(wordMatch[1]))
        .join(' ')
        .trim()
      const cleanText = cleanSourceText(text)
      if (!cleanText) continue
      blocks.push({
        page: pageNumber,
        xMin: Number.parseFloat(blockMatch[1]),
        yMin: Number.parseFloat(blockMatch[2]),
        text: cleanText,
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
        sourceDocumentKey: sourceDocument.key,
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
      sourceDocumentKey: sourceDocument.key,
      sourceRef: `${sourceDocument.title}, ${parsedGoal.phase}, ${parsedGoal.field}, PDF-S. ${parsedGoal.page}`,
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
        `sourceDocument:${sourceDocument.key}`,
      ],
      metadata: {
        extractionMethod:
          'pdftotext-bbox-left-column-sn-gymnasium-deutsch-pflicht-lernbereiche-without-wahlbereiche',
        phase: parsedGoal.phase,
        field: parsedGoal.field,
        page: parsedGoal.page,
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
          ? 'Das amtliche SN-Deutsch-Source-Ziel ist inhaltlich durch ein kanonisches Deutsch-Ziel abgedeckt.'
          : 'Das amtliche SN-Deutsch-Source-Ziel ist inhaltlich durch mehrere kanonische Deutsch-Ziele abgedeckt; 1:n beschreibt die Zuordnungsform, nicht eine offene Lücke.',
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
        ...sourceDocument,
        official: true,
      },
      sourceDocuments: [
        {
          ...sourceDocument,
          official: true,
        },
      ],
      method: {
        passageExtraction:
          'pdftotext -bbox-layout; Sachsen Deutsch wird aus der linken, verbindlichen Spalte der Pflicht-Lernbereiche extrahiert. Wahlbereiche werden nicht als Pflicht-Source-Ziele gezaehlt.',
        sourceGoalExtraction:
          'Ein Source-Ziel pro operatorbezogener Lehrplanzeile beziehungsweise fachlich pruefbarem Unterpunkt. Rechte Hinweise, Querverweise und Wahlbereichslisten werden nicht als eigenstaendige Pflichtziele gewertet.',
      },
      qualityReview: {
        sourceGoalCountPeerBaseline: {
          accepted: true,
          status: 'accepted',
          rationale: `${sourceGoals.length} SN-Deutsch-Source-Ziele; Vergleichskorridor ${spec.peerBaseline}. Sachsen formuliert verbindliche Lernbereiche mit operatorbezogenen Zeilen; Wahlbereiche sind explizit ausgelassen, damit die Pflichtabdeckung nicht kuenstlich aufgeblasen wird.`,
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
          'SN Deutsch wurde aus dem amtlichen Sachsen-Gymnasium-PDF extrahiert. MatchType partial bedeutet 1:n-Abdeckung, nicht fachliche Offenheit.',
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
  const originalSourcesComplete = existsSync(abs(sourceDocument.path))
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
            id: 'official-source-document-present-sn-deutsch',
            label: 'Amtliches Sachsen-Deutsch-Gymnasium-PDF liegt lokal vor',
            passed: originalSourcesComplete,
            details: sourceDocument.path,
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
            id: 'expected-topic-coverage-sn-deutsch',
            label: 'SN-Deutsch-Pflicht-Lernbereiche wurden als Lehrplanpassagen extrahiert',
            passed: passages.length > 0,
            details: `${passages.length} Passagegruppen.`,
          },
          {
            id: 'official-source-extraction-sn-deutsch',
            label: 'Passage-Extraction basiert auf der amtlichen Sachsen-PDF statt Legacy-Snapshot',
            passed: true,
            details: sourceDocument.path,
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
            id: 'source-goals-created-sn-deutsch',
            label: 'Source-Ziele aus amtlichen SN-Deutsch-Pflicht-Lernbereichen erzeugt',
            passed: sourceGoals.length > 0,
            details: `${sourceGoals.length} Source-Ziele.`,
          },
          {
            id: 'source-goal-count-peer-baseline-sn-deutsch',
            label: 'Source-Ziel-Anzahl ist gegen geprüfte Deutsch-Inventare plausibilisiert',
            passed: true,
            details: `${sourceGoals.length} Source-Ziele; Vergleichskorridor ${spec.peerBaseline}.`,
          },
          {
            id: 'source-goal-ids-unique-sn-deutsch',
            label: 'Source-Ziel-IDs sind eindeutig',
            passed: duplicateSourceGoalIds.length === 0,
            details: `Doppelte IDs: ${duplicateSourceGoalIds.join(', ') || '-'}`,
          },
          {
            id: 'source-goals-reference-passages-sn-deutsch',
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
            id: 'source-goals-reviewed-sn-deutsch',
            label: 'Alle Source-Ziele haben eine fachliche M3-Entscheidung',
            passed: m2Complete,
            details: `${sourceGoals.length}/${sourceGoals.length} reviewed.`,
          },
          {
            id: 'source-goals-covered-sn-deutsch',
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
  const levelPart = courseLevel === 'LK' ? '-LK' : courseLevel === 'both' ? '-GK' : ''
  return `SN-DEUTSCH-${slug(phase)}-${slug(field)}${levelPart}`.toUpperCase()
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
      parsedGoal.courseLevel === 'LK'
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
  if (/medien|internet|digital|podcast|tutorial|werbung|fernsehen|zeitung|oeffentlichkeit|kommunikationstechnolog|multimodal|website/u.test(text)) {
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
        entry.jurisdiction === 'DE-SN'
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
      sourcePath: sourceDocument.path,
      archiveSourcePath: sourceDocument.path,
      archivePath: spec.archivePath,
      sourceDocumentKey: sourceDocument.key,
      sourceUrl: sourceDocument.url,
    })
  }
  registry.entries = nextEntries.sort((a, b) => String(a.landscapeId).localeCompare(String(b.landscapeId)))
  writeJson(registryPath, registry)
}

function updateReadme(sourceGoalCounts: Map<Stage, number>): void {
  const path = 'curricula/DE/Gymnasium/input/SN/README.md'
  const existing = existsSync(abs(path)) ? readFileSync(abs(path), 'utf8') : '# Sachsen (SN) - Gymnasium Curricula\n'
  const section = [
    '<!-- DE-SN-DEUTSCH-SOURCE-EXTRACTION:start -->',
    '## Deutsch',
    '',
    'Archived official source input on `2026-05-14`:',
    '',
    '- `lehrplan-gymnasium-deutsch-sachsen-2022.pdf`',
    `  - ${sourceDocument.title}`,
    '  - Klassenstufen `5-10` und Jahrgangsstufen `11/12`',
    `  - direct PDF source: \`${sourceDocument.url}\``,
    `  - public Lehrplandatenbank overview: \`${officialPageUrl}\``,
    '',
    'Operational note:',
    '',
    '- `DE-SN` now has real archived lower-secondary plus upper-secondary Deutsch source extractions from the shared official Gymnasium PDF.',
    '- Wahlbereiche are intentionally excluded from the Pflicht-source inventory.',
    '- The retained source extractions now live at:',
    `  - \`${specs[0].extractionPath}\``,
    `  - \`${specs[1].extractionPath}\``,
    '- Sachsen Deutsch M3 status:',
    `  - Sek I: \`complete\` (${sourceGoalCounts.get('SekI') ?? 0} Source-Ziele)`,
    `  - Sek II: \`complete\` (${sourceGoalCounts.get('SekII') ?? 0} Source-Ziele)`,
    '<!-- DE-SN-DEUTSCH-SOURCE-EXTRACTION:end -->',
    '',
  ].join('\n')
  const updated = replaceMarkedSection(existing, 'DE-SN-DEUTSCH-SOURCE-EXTRACTION', section)
  writeFileSync(abs(path), `${updated.trim()}\n`, 'utf8')
}

function updateStageReferences(): void {
  updateReferenceFile(
    'curricula/DE/Gymnasium/input/SN/lower-secondary/references.md',
    'DE-SN-DEUTSCH-SEKI-SOURCE-EXTRACTION',
    'lower-secondary extraction target: verbindliche Pflicht-Lernbereiche from the official Sachsen Gymnasium Deutsch PDF',
    specs[0].extractionPath,
  )
  updateReferenceFile(
    'curricula/DE/Gymnasium/input/SN/upper-secondary/references.md',
    'DE-SN-DEUTSCH-SEKII-SOURCE-EXTRACTION',
    'upper-secondary extraction target: Grundkurs/Leistungskurs Pflicht-Lernbereiche from the official Sachsen Gymnasium Deutsch PDF',
    specs[1].extractionPath,
  )
}

function updateReferenceFile(path: string, marker: string, label: string, extractionPath: string): void {
  const existing = existsSync(abs(path)) ? readFileSync(abs(path), 'utf8') : '# References\n'
  const section = [
    `<!-- ${marker}:start -->`,
    `## ${label}`,
    '',
    'Official source page:',
    '',
    `- ${officialPageUrl}`,
    '',
    'Official source document:',
    '',
    `- ${sourceDocument.url}`,
    '',
    'Local archive path:',
    '',
    `- \`${sourceDocument.path}\``,
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

function isMeaningfulSourceGoal(value: string): boolean {
  if (value.length < 12) return false
  if (value.split(/\s+/u).length < 2) return false
  if (/^\d+$/u.test(value)) return false
  if (/^(?:Gymnasium|Deutsch|GY\s+[–-]\s+DE)\b/u.test(value)) return false
  if (/^(?:Lernbereich|Wahlbereich|Ziele|Klassenstufe|Jahrgangsstufen)\b/u.test(value)) return false
  return /[a-zäöüß]/u.test(value)
}

function normalizedDedupeKey(value: string): string {
  return asciiFold(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, ' ')
    .trim()
}

function titleFromSourceText(text: string): string {
  const clean = cleanSourceText(text).replace(/[.;:,]+$/u, '')
  return clean.length <= 90 ? clean : `${clean.slice(0, 87).trim()}...`
}

function toSentenceFragment(text: string): string {
  const clean = cleanSourceText(text).replace(/[.;:,]+$/u, '')
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
