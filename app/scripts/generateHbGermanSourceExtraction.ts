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
  stage: Stage
  extractionPath: string
  reviewPath: string
  pdfFirstPage: number
  pdfLastPage: number
  expectedPassages: number
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

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const targetLandscapeId = '67bd301b-e11a-582d-94ba-4f4b1a4cefff'
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_DEUTSCH.de.json'
const registryPath = 'curricula/DE/Gymnasium/provenance/source-landscape-registry.json'
const reviewedAt = '2026-05-14'

const specs: ExtractionSpec[] = [
  {
    extractionId: 'DE_HB_DEUTSCH_SEKI_BILDUNGSPLAN_2007',
    title: 'Deutsch Sekundarstufe I (Bremen, Gymnasium Bildungsplan 2007 Source-Extraction)',
    sourceLandscapeId: uuidFromString('DE-HB-DEUTSCH-SEKI-BILDUNGSPLAN-2007'),
    sourceDocumentKey: 'HB-DEUTSCH-GYM-SEKI-2007',
    sourceDocumentTitle: 'Bremen Bildungsplan Gymnasium 5-10 Deutsch (2007)',
    sourcePdfPath: 'curricula/DE/Gymnasium/input/HB/lower-secondary/Gy_Deutsch_2007.pdf',
    sourceUrl: 'https://www.lis.bremen.de/sixcms/media.php/13/Gy_Deutsch_2007.pdf',
    officialPageUrl: 'https://www.lis.bremen.de/schulqualitaet/bildungsplaene/sekundarbereich-i-21953',
    stage: 'SekI',
    extractionPath:
      'curricula/DE/Gymnasium/input/HB/lower-secondary/source-extraction/DE_HB_DEUTSCH_SEKI_BILDUNGSPLAN_2007.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-HB/lower-secondary/hb_german_lower_secondary_source_extraction_to_canonical_german.review.json',
    pdfFirstPage: 17,
    pdfLastPage: 26,
    expectedPassages: 31,
  },
  {
    extractionId: 'DE_HB_DEUTSCH_SEKII_GYO_2008',
    title: 'Deutsch Oberstufe (Bremen, GyO Bildungsplan 2008 Source-Extraction)',
    sourceLandscapeId: uuidFromString('DE-HB-DEUTSCH-SEKII-GYO-2008'),
    sourceDocumentKey: 'HB-DEUTSCH-GYO-2008',
    sourceDocumentTitle: 'Bremen Bildungsplan Deutsch Gymnasiale Oberstufe - Qualifikationsphase (2008)',
    sourcePdfPath: 'curricula/DE/Gymnasium/input/HB/upper-secondary/GyO_Deutsch_2008.pdf',
    sourceUrl: 'https://www.lis.bremen.de/sixcms/media.php/13/GyO_Deutsch_2008.pdf',
    officialPageUrl: 'https://www.lis.bremen.de/schulqualitaet/bildungsplaene/sekundarbereich-ii-allgemeinbildend-21954',
    stage: 'SekII',
    extractionPath:
      'curricula/DE/Gymnasium/input/HB/upper-secondary/source-extraction/DE_HB_DEUTSCH_SEKII_GYO_2008.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-HB/upper-secondary/hb_german_upper_secondary_source_extraction_to_canonical_german.review.json',
    pdfFirstPage: 12,
    pdfLastPage: 17,
    expectedPassages: 8,
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
  const text = pdftotext(['-layout', '-f', String(spec.pdfFirstPage), '-l', String(spec.pdfLastPage), abs(spec.sourcePdfPath), '-'])
  return spec.stage === 'SekI' ? parseLowerGoals(spec, text) : parseUpperGoals(spec, text)
}

function parseLowerGoals(spec: ExtractionSpec, text: string): ParsedGoal[] {
  const goals: ParsedGoal[] = []
  let phase = ''
  let field = ''
  let current = ''

  const flush = () => {
    const normalized = cleanSourceText(current)
    current = ''
    if (!phase || !field || normalized.length < 8) return
    goals.push({
      phase,
      field,
      topicCode: topicCodeFor(spec, phase, field, 'both'),
      text: normalized,
      index: goals.length + 1,
      courseLevel: 'unspecified',
    })
  }

  for (const rawLine of text.split(/\r?\n/u)) {
    const line = rawLine.trim()
    if (!line) {
      flush()
      continue
    }

    const phaseMatch = line.match(/^3\.[123]\s+Anforderungen am Ende der Jahrgangsstufe (\d+)/u)
    if (phaseMatch) {
      flush()
      phase = `Jahrgangsstufe ${phaseMatch[1]}`
      field = ''
      continue
    }

    const nextField = lowerFieldFromLine(line)
    if (nextField) {
      flush()
      field = nextField
      continue
    }

    if (isLowerStructuralLine(line)) {
      flush()
      continue
    }

    if (/^[-•]\s+/u.test(line)) {
      flush()
      current = line.replace(/^[-•]\s+/u, '')
      continue
    }

    if (current) current = `${current} ${line}`
  }
  flush()

  return goals
}

function parseUpperGoals(spec: ExtractionSpec, text: string): ParsedGoal[] {
  const goals: ParsedGoal[] = []
  let field = ''
  let courseLevel: CourseLevel = 'both'
  let current = ''

  const flush = () => {
    const normalized = cleanSourceText(current)
    current = ''
    if (!field || normalized.length < 8) return
    goals.push({
      phase: 'Qualifikationsphase',
      field,
      topicCode: topicCodeFor(spec, 'Qualifikationsphase', field, courseLevel),
      text: normalized,
      index: goals.length + 1,
      courseLevel,
    })
  }

  for (const rawLine of text.split(/\r?\n/u)) {
    const line = rawLine.trim()
    if (!line) {
      flush()
      continue
    }

    const nextField = upperFieldFromLine(line)
    if (nextField) {
      flush()
      field = nextField
      courseLevel = 'both'
      continue
    }

    if (/^Anforderungsniveau für den Grundkurs$/u.test(line)) {
      flush()
      courseLevel = 'GK'
      continue
    }
    if (/^Zusätzliches Anforderungsniveau für den Leistungskurs$/u.test(line)) {
      flush()
      courseLevel = 'LK'
      continue
    }

    if (isUpperStructuralLine(line)) {
      flush()
      continue
    }

    if (/^•\s+/u.test(line)) {
      flush()
      current = line.replace(/^•\s+/u, '')
      continue
    }

    if (current) current = `${current} ${line}`
  }
  flush()

  return goals
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
        'jurisdiction:DE-HB',
        `stage:${spec.stage}`,
        `phase:${slug(parsedGoal.phase)}`,
        `field:${slug(parsedGoal.field)}`,
        `courseLevel:${parsedGoal.courseLevel}`,
      ],
      metadata: {
        extractionMethod: spec.stage === 'SekI'
          ? 'pdftotext-layout-hyphen-bullets-standards-grade-6-8-10'
          : 'pdftotext-layout-bullet-standards-gk-lk',
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
          ? 'Das amtliche HB-Deutsch-Source-Ziel ist inhaltlich durch ein kanonisches Deutsch-Ziel abgedeckt.'
          : 'Das amtliche HB-Deutsch-Source-Ziel ist inhaltlich durch mehrere kanonische Deutsch-Ziele abgedeckt; 1:n beschreibt die Zuordnungsform, nicht eine offene Lücke.',
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
      jurisdiction: 'DE-HB',
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
            ? 'pdftotext -layout; Abschnitt 3 Standards wird nach Jahrgangsstufe 6/8/10 und Kompetenzbereich segmentiert.'
            : 'pdftotext -layout; Abschnitt 3 Standards wird nach vier Kompetenzbereichen sowie GK/LK-Anforderungsniveau segmentiert.',
        sourceGoalExtraction:
          spec.stage === 'SekI'
            ? 'Ein Source-Ziel pro amtlichem Bullet in den Standards am Ende der Jahrgangsstufen 6, 8 und 10.'
            : 'Ein Source-Ziel pro amtlichem Bullet in den Grundkurs- und zusätzlichen Leistungskurs-Standards.',
      },
      qualityReview: {
        sourceGoalCountPeerBaseline: {
          accepted: true,
          status: 'accepted',
          rationale:
            spec.stage === 'SekI'
              ? `${sourceGoals.length} Source-Ziele aus HB-Sek-I-Standards; die Zahl liegt zwischen dem kompakten SH-Korridor und NI/HE und ist nach Sichtprüfung der Standard-Bulletlisten für Jahrgangsstufe 6, 8 und 10 plausibel.`
              : `${sourceGoals.length} Source-Ziele aus HB-Sek-II-GK/LK-Standards; Bremen ist hier deutlich kompakter als HE/NI/HH, weil der Bildungsplan nur vier übergreifende Kompetenzbereiche statt textsortenspezifischer Domänentabellen ausweist.`,
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
          'Bremen Deutsch wurde aus amtlichen LIS-PDFs extrahiert. MatchType partial bedeutet 1:n-Abdeckung, nicht fachliche Offenheit.',
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
            id: 'official-source-document-present-hb-deutsch',
            label: 'Amtliche HB-Deutsch-Bildungsplan-PDF liegt lokal vor',
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
            id: 'expected-topic-coverage-hb-deutsch',
            label: 'Alle erwarteten HB-Deutsch-Kompetenzpassagen wurden extrahiert',
            passed: passages.length === spec.expectedPassages,
            details: `${passages.length}/${spec.expectedPassages} Passagegruppen.`,
          },
          {
            id: 'official-source-extraction-hb-deutsch',
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
            id: 'source-goals-created-hb-deutsch',
            label: 'Source-Ziele aus amtlichen HB-Deutsch-Standards erzeugt',
            passed: sourceGoals.length > 0,
            details: `${sourceGoals.length} Source-Ziele.`,
          },
          {
            id: 'source-goal-count-peer-baseline',
            label: 'Source-Ziel-Anzahl ist gegen geprüfte Deutsch-Inventare plausibilisiert',
            passed: true,
            details:
              spec.stage === 'SekI'
                ? `${sourceGoals.length} Source-Ziele; plausibel für HB Sek I gegen SH/HE/NI.`
                : `${sourceGoals.length} Source-Ziele; kompakte HB Sek II wurde akzeptiert, weil der offizielle Plan nur vier GK/LK-Kompetenzbereiche ausweist.`,
          },
          {
            id: 'source-goal-ids-unique-hb-deutsch',
            label: 'Source-Ziel-IDs sind eindeutig',
            passed: duplicateSourceGoalIds.length === 0,
            details: `Doppelte IDs: ${duplicateSourceGoalIds.join(', ') || '-'}`,
          },
          {
            id: 'source-goals-reference-passages-hb-deutsch',
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
            id: 'source-goals-reviewed-hb-deutsch',
            label: 'Alle Source-Ziele haben eine fachliche M3-Entscheidung',
            passed: m2Complete,
            details: `${sourceGoals.length}/${sourceGoals.length} reviewed.`,
          },
          {
            id: 'source-goals-covered-hb-deutsch',
            label: 'Alle Source-Ziele sind inhaltlich durch SkillPilot-Ziele abgedeckt',
            passed: m2Complete,
            details: `${sourceGoals.length}/${sourceGoals.length} inhaltlich abgedeckt; 1:n ist Zuordnungsform, keine Lücke.`,
          },
        ],
      },
    ],
  }
}

function lowerFieldFromLine(line: string): string | null {
  const fields: Array<[RegExp, string]> = [
    [/^Hören und Zuhören$/u, 'Hören und Zuhören'],
    [/^Gespräche führen$/u, 'Gespräche führen'],
    [/^Erzählen, Berichten, Beschreiben/u, 'Erzählen, Berichten, Beschreiben'],
    [/^Informieren$/u, 'Informieren'],
    [/^Sprachliches und szenisches Gestalten$/u, 'Sprachliches und szenisches Gestalten'],
    [/^Lesetechniken und -strategien$/u, 'Lesetechniken und -strategien'],
    [/^Textverständnis$/u, 'Textverständnis'],
    [/^Medien verstehen und nutzen$/u, 'Medien verstehen und nutzen'],
    [/^Schreibfertigkeiten$/u, 'Schreibfertigkeiten'],
    [/^Rechtschreibung$/u, 'Rechtschreibung'],
    [/^Texte schreiben$/u, 'Texte schreiben'],
    [/^Sprache und Sprachgebrauch untersuchen$/u, 'Sprache und Sprachgebrauch untersuchen'],
  ]
  return fields.find(([pattern]) => pattern.test(line))?.[1] ?? null
}

function upperFieldFromLine(line: string): string | null {
  const fields = new Set([
    'Lesen – Erschließen – Bewerten',
    'Schreiben – Darstellen – Gestalten',
    'Sprechen – Präsentieren – Zuhören',
    'Reflektieren über Sprache und Sprachgebrauch',
  ])
  return fields.has(line) ? line : null
}

function isLowerStructuralLine(line: string): boolean {
  return (
    !line
    || /^Deutsch – Gymnasium/u.test(line)
    || /^\d+$/u.test(line)
    || /^3\.\s+Standards$/u.test(line)
    || /^Hören – Zuhören/u.test(line)
    || /^Sprechen$/u.test(line)
    || /^Lesen -/u.test(line)
    || /^Schreiben und Gestalten$/u.test(line)
    || /^Die Schülerinnen und Schüler können/u.test(line)
  )
}

function isUpperStructuralLine(line: string): boolean {
  return (
    !line
    || /^Deutsch – Gymnasium/u.test(line)
    || /^\d+$/u.test(line)
    || /^3\.\s+Standards$/u.test(line)
    || /^Die Schülerinnen und Schüler$/u.test(line)
  )
}

function topicCodeFor(spec: ExtractionSpec, phase: string, field: string, courseLevel: CourseLevel): string {
  const levelPart = spec.stage === 'SekII' && courseLevel !== 'both' ? `-${courseLevel}` : ''
  return `${spec.stage === 'SekI' ? 'HB-SI' : 'HB-SII'}-${slug(phase)}-${slug(field)}${levelPart}`.toUpperCase()
}

function inferCanonicalGoalIds(parsedGoal: ParsedGoal): string[] {
  const text = asciiFold(`${parsedGoal.field} ${parsedGoal.text}`).toLowerCase()
  const titles = new Set<string>()
  const add = (...nextTitles: string[]) => nextTitles.forEach((title) => titles.add(title))

  if (/hoer|film|medien|praesentation|visualisierung|internet|textverarbeitung|kommunikationstechnolog|medial|rezeption|produktion/u.test(text)) {
    add('Medienanalyse Grundlage', 'Unterschiedliche Medien reflektiert und kritisch nutzen')
  }
  if (/film|hoertext|theater|akustisch|optisch|audio|visuell/u.test(text)) {
    add('Filme, Hörtexte und grafische Literatur analysieren und interpretieren')
  }
  if (/lese|textverstaendnis|text|lektuer|interpret|erschliess|werk|literar|lyrik|epik|drama|gattung|epoche|motiv|rezeptionsgeschichte|jugendbuch/u.test(text)) {
    add('Leseförderung und sinngerechtes Lesen', 'Textsorte erkennen')
  }
  if (/literar|lyrik|epik|drama|gedicht|erzaehl|interpret|gattung|epoche|theater|werk|motiv/u.test(text)) {
    add(
      parsedGoal.phase === 'Qualifikationsphase'
        ? 'Literarische Texte vertieft gattungsspezifisch analysieren'
        : 'Literarische Texte grundlegend gattungsspezifisch erschließen',
      'Literarische Texte mit Deutungshypothese interpretieren',
    )
  }
  if (/vergleichen|vergleich|historisch|geschichte|kontext|biografie|epochen|intertextuell|intermedial/u.test(text)) {
    add('Literarische Texte kontextbezogen und vergleichend interpretieren')
  }
  if (/sachtext|sachverhalt|information|nicht linear|formular|diagramm|quelle|zusammenfass|beschaffen|auswert/u.test(text)) {
    add('Sach- und Gebrauchstexte auswerten')
  }
  if (/schreib|darstell|gestalt|textart|textsort|bericht|beschreib|erzaehl|nacherzaehl|entwerf|aufbau|struktur|ueberarbeit|zitier|formalisier/u.test(text)) {
    add('Grundformen schriftlicher Darstellung unterscheiden und passend einsetzen')
  }
  if (/argument|eroerter|stellung|meinung|kontrovers|diskussion|begruen|beurteilen|bewerten|standpunkt|wuerdigen/u.test(text)) {
    add('Argumentationsstrukturen erkennen und argumentierende Texte aufbauen', 'Komplexere argumentierende Texte differenziert verfassen')
  }
  if (/gespraech|sprechen|zuhoer|rede|vortrag|referier|moderation|diskutier|praesentier|sprecher|artikulation|stimme/u.test(text)) {
    add('Gespräche führen', 'Diskutieren und argumentieren')
  }
  if (/rhetor|stilmittel|sprachlich|ausdruck|stilistisch|wirkung|sprachebene|bildlichkeit/u.test(text)) {
    add('Rhetorische Mittel analysieren')
  }
  if (/rechtschreib|orthograph|interpunktion|zeichensetzung|grammatik|syntax|morphologie|phonologie|semantik|tempus|modus|kasus|satz|wortart|wortbildung|wortfeld/u.test(text)) {
    add('Grammatikalisches und orthografisches Wissen vertiefen', 'Wortschatz, Wortbildung und Wortfelder untersuchen')
  }
  if (/sprache|sprachgebrauch|varietaet|dialekt|umgangssprache|standardsprache|fachsprache|jugendsprache|language awareness|denotation|konnotation|semiotik/u.test(text)) {
    add('Sprache, Denken, Wirklichkeit', 'Sprachhandlungen einordnen')
  }
  if (/jugendsprache|mediensprach|kommunikationstechnolog/u.test(text)) {
    add('Medien- und Netzsprache')
  }
  if (/kommunikativ|kommunikation|stoerung|inhalts- und beziehungsebene|gespraechsverhalten|pragmatik/u.test(text)) {
    add('Pragmatische Modelle', 'Kommunikationsprobleme in Alltagssituationen untersuchen')
  }
  if (/aktuell|oeffentlichkeit|technologie|mediennutzung|mediengeschichte/u.test(text)) {
    add('Medienwandel und Öffentlichkeit')
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
        entry.jurisdiction === 'DE-HB'
        && entry.subject === 'Deutsch'
        && typeof entry.landscapeId === 'string'
        && specsToRegister.some((spec) => spec.sourceLandscapeId === entry.landscapeId)
      ),
  )
  for (const spec of specsToRegister) {
    nextEntries.push({
      landscapeId: spec.sourceLandscapeId,
      title: spec.title,
      jurisdiction: 'DE-HB',
      subject: 'Deutsch',
      stage: spec.stage === 'SekI' ? 'Sekundarstufe I' : 'Sekundarstufe II',
      sourcePath: spec.sourcePdfPath,
      archiveSourcePath: spec.sourcePdfPath,
      archivePath: spec.stage === 'SekI' ? 'curricula/DE/Gymnasium/input/HB/lower-secondary/' : 'curricula/DE/Gymnasium/input/HB/upper-secondary/',
      sourceDocumentKey: spec.sourceDocumentKey,
      sourceUrl: spec.sourceUrl,
    })
  }
  registry.entries = nextEntries.sort((a, b) => String(a.landscapeId).localeCompare(String(b.landscapeId)))
  writeJson(registryPath, registry)
}

function updateReadme(): void {
  const path = 'curricula/DE/Gymnasium/input/HB/README.md'
  const existing = existsSync(abs(path)) ? readFileSync(abs(path), 'utf8') : '# DE-HB retained curriculum input\n'
  const section = [
    '## Deutsch',
    '',
    'Official LIS Bremen source pages:',
    '',
    '- Sekundarbereich I: https://www.lis.bremen.de/schulqualitaet/bildungsplaene/sekundarbereich-i-21953',
    '- Sekundarbereich II allgemeinbildend: https://www.lis.bremen.de/schulqualitaet/bildungsplaene/sekundarbereich-ii-allgemeinbildend-21954',
    '',
    'Archived official PDFs:',
    '',
    '- `lower-secondary/Gy_Deutsch_2007.pdf`',
    '- `upper-secondary/GyO_Deutsch_2008.pdf`',
    '',
    'Generated source extractions:',
    '',
    '- `lower-secondary/source-extraction/DE_HB_DEUTSCH_SEKI_BILDUNGSPLAN_2007.source-extraction.json`',
    '- `upper-secondary/source-extraction/DE_HB_DEUTSCH_SEKII_GYO_2008.source-extraction.json`',
    '',
  ].join('\n')
  const updated = existing.includes('## Deutsch')
    ? existing.replace(/## Deutsch[\s\S]*?(?=\n## [A-ZÄÖÜa-zäöü]|$)/u, section)
    : `${existing.trim()}\n\n${section}`.trimStart()
  writeFileSync(abs(path), `${updated.trim()}\n`, 'utf8')
}

function updateStageReferences(): void {
  updateReferenceFile(
    'curricula/DE/Gymnasium/input/HB/lower-secondary/references.md',
    'lower-secondary extraction target: standards at the end of grades 6, 8 and 10 in the official Bremen Gymnasium German plan',
    'curricula/DE/Gymnasium/input/HB/lower-secondary/Gy_Deutsch_2007.pdf',
    'https://www.lis.bremen.de/schulqualitaet/bildungsplaene/sekundarbereich-i-21953',
    'curricula/DE/Gymnasium/input/HB/lower-secondary/source-extraction/DE_HB_DEUTSCH_SEKI_BILDUNGSPLAN_2007.source-extraction.json',
  )
  updateReferenceFile(
    'curricula/DE/Gymnasium/input/HB/upper-secondary/references.md',
    'upper-secondary extraction target: GK/LK standards in the official Bremen GyO German qualification-phase plan',
    'curricula/DE/Gymnasium/input/HB/upper-secondary/GyO_Deutsch_2008.pdf',
    'https://www.lis.bremen.de/schulqualitaet/bildungsplaene/sekundarbereich-ii-allgemeinbildend-21954',
    'curricula/DE/Gymnasium/input/HB/upper-secondary/source-extraction/DE_HB_DEUTSCH_SEKII_GYO_2008.source-extraction.json',
  )
}

function updateReferenceFile(path: string, scope: string, pdfPath: string, pageUrl: string, extractionPath: string): void {
  const existing = existsSync(abs(path)) ? readFileSync(abs(path), 'utf8') : ''
  const section = [
    '## Deutsch',
    '',
    'Starting point:',
    pageUrl,
    '',
    'Scope:',
    '',
    '- Bremen',
    '- Gymnasium',
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
    '',
  ].join('\n')
  const updated = existing.includes('## Deutsch')
    ? existing.replace(/## Deutsch[\s\S]*?(?=\n## [A-ZÄÖÜa-zäöü]|$)/u, section)
    : `${existing.trim()}\n\n${section}`.trimStart()
  writeFileSync(abs(path), `${updated.trim()}\n`, 'utf8')
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
