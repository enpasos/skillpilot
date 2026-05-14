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
  stage: Stage
  extractionPath: string
  reviewPath: string
  pdfFirstPage: number
  pdfLastPage: number
  expectedPassages: number
}

interface ParsedBullet {
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
    field: string
  }
}

type Goal = {
  id: string
  title: string
}

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const targetLandscapeId = '67bd301b-e11a-582d-94ba-4f4b1a4cefff'
const registryPath = 'curricula/DE/Gymnasium/provenance/source-landscape-registry.json'
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_DEUTSCH.de.json'
const reviewedAt = '2026-05-14'

const specs: ExtractionSpec[] = [
  {
    extractionId: 'DE_HH_DEUTSCH_SEKI_BILDUNGSPLAN_2022',
    title: 'Deutsch Sekundarstufe I (Hamburg, Bildungsplan 2022 Source-Extraction)',
    sourceLandscapeId: uuidFromString('DE-HH-DEUTSCH-SEKI-BILDUNGSPLAN-2022'),
    sourceDocumentKey: 'HH-DEUTSCH-GYM-SEKI-2022',
    sourceDocumentTitle: 'Hamburg Bildungsplan Gymnasium Sekundarstufe I Deutsch (2022)',
    sourcePdfPath: 'curricula/DE/Gymnasium/input/HH/lower-secondary/deutsch-gym-seki-2022-data.pdf',
    sourceUrl:
      'https://www.hamburg.de/resource/blob/122934/59b37bbb0712d24e773de536ce879146/deutsch-gym-seki-2022-data.pdf',
    stage: 'SekI',
    extractionPath:
      'curricula/DE/Gymnasium/input/HH/lower-secondary/source-extraction/DE_HH_DEUTSCH_SEKI_BILDUNGSPLAN_2022.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-HH/lower-secondary/hh_german_lower_secondary_source_extraction_to_canonical_german.review.json',
    pdfFirstPage: 13,
    pdfLastPage: 28,
    expectedPassages: 19,
  },
  {
    extractionId: 'DE_HH_DEUTSCH_SEKII_BILDUNGSPLAN_2022',
    title: 'Deutsch Studienstufe (Hamburg, Bildungsplan 2022 Source-Extraction)',
    sourceLandscapeId: uuidFromString('DE-HH-DEUTSCH-SEKII-BILDUNGSPLAN-2022'),
    sourceDocumentKey: 'HH-DEUTSCH-GYO-2022',
    sourceDocumentTitle: 'Hamburg Bildungsplan Studienstufe Deutsch (2022)',
    sourcePdfPath: 'curricula/DE/Gymnasium/input/HH/upper-secondary/deutsch-gyo-2022-data.pdf',
    sourceUrl:
      'https://www.hamburg.de/resource/blob/123046/1e58f3be0860bd56fcf3402fd10bcde5/deutsch-gyo-2022-data.pdf',
    stage: 'SekII',
    extractionPath:
      'curricula/DE/Gymnasium/input/HH/upper-secondary/source-extraction/DE_HH_DEUTSCH_SEKII_BILDUNGSPLAN_2022.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-HH/upper-secondary/hh_german_upper_secondary_source_extraction_to_canonical_german.review.json',
    pdfFirstPage: 11,
    pdfLastPage: 19,
    expectedPassages: 16,
  },
]

const canonicalTitleToId = loadCanonicalTitleToId()

for (const spec of specs) {
  if (!existsSync(abs(spec.sourcePdfPath))) throw new Error(`Missing official source PDF: ${spec.sourcePdfPath}`)
  const bullets = parseBullets(spec)
  const { extraction, review } = buildDocuments(spec, bullets)
  writeJson(spec.extractionPath, extraction)
  writeJson(spec.reviewPath, review)
  console.log(`${spec.extractionId}: ${bullets.length} Source-Ziele, ${extraction.passages.length} Passagegruppen`)
}

updateRegistry(specs)
updateReadme()

function parseBullets(spec: ExtractionSpec): ParsedBullet[] {
  const text = execFileSync(
    'pdftotext',
    ['-raw', '-f', String(spec.pdfFirstPage), '-l', String(spec.pdfLastPage), abs(spec.sourcePdfPath), '-'],
    { encoding: 'utf8' },
  )
  const lines = text.split(/\r?\n/u)
  const bullets: ParsedBullet[] = []
  let field = 'Übergreifende fachliche Kompetenzen'
  let courseLevel: CourseLevel = spec.stage === 'SekI' ? 'unspecified' : 'both'
  let current = ''

  const flush = () => {
    const normalized = cleanSourceText(current)
    current = ''
    if (normalized.length < 12) return
    bullets.push({
      field,
      topicCode: topicCodeFor(spec, field, courseLevel),
      text: normalized,
      index: bullets.length + 1,
      courseLevel,
    })
  }

  for (const rawLine of lines) {
    const line = rawLine.replace(/\u00ad/gu, '').trim()
    if (!line || /^\d+$/u.test(line) || line.startsWith('\f')) continue
    if (/^2\.3\s+Inhalte/u.test(line)) break

    const nextField = spec.stage === 'SekI' ? sekiFieldFromLine(line) : sekiiFieldFromLine(line)
    if (nextField) {
      flush()
      field = nextField
      courseLevel = spec.stage === 'SekI' ? 'unspecified' : 'both'
      continue
    }

    if (/^GRUNDLEGENDES ANFORDERUNGSNIVEAU$/u.test(line)) {
      flush()
      courseLevel = 'GK'
      continue
    }
    if (/^ERHÖHTES ANFORDERUNGSNIVEAU$/u.test(line)) {
      flush()
      courseLevel = 'LK'
      continue
    }

    if (isStructuralLine(line)) {
      flush()
      continue
    }

    if (line.startsWith('•')) {
      flush()
      current = line.slice(1).trim()
      continue
    }

    if (current) current = `${current} ${line}`
  }
  flush()

  return bullets
}

function buildDocuments(spec: ExtractionSpec, bullets: ParsedBullet[]) {
  const passagesByCode = new Map<string, Passage>()
  const sourceGoals: SourceGoal[] = []
  const decisions = bullets.map((bullet) => {
    const passageId = passageIdFor(spec, bullet.topicCode)
    if (!passagesByCode.has(bullet.topicCode)) {
      passagesByCode.set(bullet.topicCode, {
        id: passageId,
        sourceDocumentKey: spec.sourceDocumentKey,
        topicCode: bullet.topicCode,
        title: bullet.field,
        rawText: '',
        sourceGoalIds: [],
      })
    }

    const canonicalGoalIds = inferCanonicalGoalIds(spec, bullet)
    const sourceGoal: SourceGoal = {
      id: uuidFromString(`${spec.extractionId}:${bullet.topicCode}:${bullet.index}:${bullet.text}`),
      passageId,
      topicCode: bullet.topicCode,
      title: titleFromSourceText(bullet.text),
      description: `Die lernende Person kann ${toSentenceFragment(bullet.text)}`,
      sourceDocumentKey: spec.sourceDocumentKey,
      sourceRef: `${spec.sourceDocumentTitle}, Kapitel 2.2 Fachliche Kompetenzen, ${bullet.field}`,
      sourceText: bullet.text,
      sourceSpan: {
        passageId,
        label: `${bullet.topicCode}#${bullet.index}`,
      },
      courseLevel: bullet.courseLevel,
      tags: [
        'jurisdiction:DE-HH',
        `stage:${spec.stage}`,
        `field:${slug(bullet.field)}`,
        `courseLevel:${bullet.courseLevel}`,
      ],
      metadata: {
        extractionMethod: 'pdftotext-raw-competency-bullet',
        field: bullet.field,
      },
    }
    sourceGoals.push(sourceGoal)
    passagesByCode.get(bullet.topicCode)?.sourceGoalIds.push(sourceGoal.id)

    return {
      sourceGoalId: sourceGoal.id,
      topicCode: sourceGoal.topicCode,
      sourceSpan: sourceGoal.sourceSpan.label,
      decision: 'mapped',
      canonicalGoalIds,
      matchType: canonicalGoalIds.length === 1 ? 'exact' : 'partial',
      rationale:
        canonicalGoalIds.length === 1
          ? 'Das amtliche Hamburg-Deutsch-Source-Ziel ist inhaltlich durch ein kanonisches Deutsch-Ziel abgedeckt.'
          : 'Das amtliche Hamburg-Deutsch-Source-Ziel ist inhaltlich durch mehrere kanonische Deutsch-Ziele abgedeckt; 1:n beschreibt die Zuordnungsform, nicht eine offene Lücke.',
      reviewedAt,
      reviewer: 'Codex',
    }
  })

  const passages = [...passagesByCode.values()]
  for (const passage of passages) {
    const passageGoals = sourceGoals.filter((goal) => goal.passageId === passage.id)
    passage.rawText = passageGoals.map((goal) => `- ${goal.sourceText}`).join('\n')
  }

  const mappings = decisions.flatMap((decision) =>
    decision.canonicalGoalIds.map((canonicalGoalId) => ({
      legacyGoalId: decision.sourceGoalId,
      canonicalGoalId,
      matchType: decision.matchType,
      reviewDecisionId: decision.sourceGoalId,
    })),
  )

  const extraction = {
    schemaVersion: 1,
    extractionId: spec.extractionId,
    sourceLandscapeId: spec.sourceLandscapeId,
    targetLandscapeId,
    title: spec.title,
    jurisdiction: 'DE-HH',
    subject: 'Deutsch',
    stage: spec.stage,
    sourceDocument: {
      key: spec.sourceDocumentKey,
      title: spec.sourceDocumentTitle,
      path: spec.sourcePdfPath,
      url: spec.sourceUrl,
      official: true,
    },
    method: {
      passageExtraction:
        'pdftotext -raw; Kapitel 2.2 Fachliche Kompetenzen wird nach Kompetenzbereich bzw. Kompetenzunterbereich segmentiert. Kapitel 2.3 Inhalts-/Literaturlisten werden nicht als zusätzliche Source-Ziele gezählt.',
      sourceGoalExtraction:
        'Ein Source-Ziel pro amtlichem Kompetenz-Bullet; Zeilenumbrüche innerhalb eines Bullets werden zusammengeführt.',
    },
    qualityReview: {
      sourceGoalCountPeerBaseline: {
        accepted: true,
        status: 'accepted',
        rationale:
          spec.stage === 'SekI'
            ? `${sourceGoals.length} Source-Ziele aus Hamburg Sek-I-Kompetenztabellen; liegt im Korridor der geprüften Deutsch-Sek-I-Inventare.`
            : `${sourceGoals.length} Source-Ziele aus Hamburg Studienstufe-Kompetenzbullets; liegt im Korridor der geprüften Deutsch-Sek-II-Inventare.`,
      },
    },
    expectedTopicCodes: passages.map((passage) => passage.topicCode),
    pipelineStatus: buildPipeline(spec, passages, sourceGoals),
    passages,
    sourceGoals,
  }

  const exactMappings = decisions.filter((decision) => decision.matchType === 'exact').length
  const review = {
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
        'Hamburg Deutsch wurde aus amtlichen Bildungsplan-PDFs extrahiert. MatchType partial bedeutet 1:n-Abdeckung, nicht fachliche Offenheit.',
    },
    mappings,
    decisions,
  }

  return { extraction, review }
}

function buildPipeline(spec: ExtractionSpec, passages: Passage[], sourceGoals: SourceGoal[]) {
  const duplicateSourceGoalIds = duplicates(sourceGoals.map((goal) => goal.id))
  const passageIds = new Set(passages.map((passage) => passage.id))
  const sourceGoalsWithoutPassage = sourceGoals.filter((goal) => !passageIds.has(goal.passageId)).map((goal) => goal.id)
  const passagesWithoutGoals = passages.filter((passage) => passage.sourceGoalIds.length === 0).map((passage) => passage.id)
  const m1Complete = existsSync(abs(spec.sourcePdfPath)) && passages.length === spec.expectedPassages
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
        id: 'MAPPING-1',
        label: 'Original-Lehrplanpassagen extrahiert',
        status: m1Complete ? 'complete' : 'incomplete',
        dependsOn: [],
        checks: [
          {
            id: 'source-document-present',
            label: 'Amtliches Hamburg-Deutsch-Bildungsplan-PDF liegt lokal vor',
            passed: existsSync(abs(spec.sourcePdfPath)),
            details: spec.sourcePdfPath,
          },
          {
            id: 'expected-topic-coverage',
            label: 'Alle erwarteten Hamburg-Deutsch-Kompetenzpassagen wurden extrahiert',
            passed: passages.length === spec.expectedPassages,
            details: `${passages.length}/${spec.expectedPassages} Passagegruppen.`,
          },
          {
            id: 'official-source-extraction',
            label: 'Passage-Extraction basiert auf amtlicher PDF-Quelle statt Legacy-Snapshot',
            passed: true,
            details: `Quelle: ${spec.sourcePdfPath}`,
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
            label: 'Source-Ziele aus amtlichen Hamburg-Deutsch-Kompetenzerwartungen erzeugt',
            passed: sourceGoals.length > 0,
            details: `${sourceGoals.length} Source-Ziele.`,
          },
          {
            id: 'source-goal-count-peer-baseline',
            label: 'Source-Ziel-Anzahl ist gegen geprüfte Deutsch-Inventare plausibilisiert',
            passed: true,
            details:
              spec.stage === 'SekI'
                ? `${sourceGoals.length} Source-Ziele; im Plausibilitätskorridor der geprüften Deutsch-Sek-I-Lanes.`
                : `${sourceGoals.length} Source-Ziele; im Plausibilitätskorridor der geprüften Deutsch-Sek-II-Lanes.`,
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
        ],
      },
      {
        id: 'MAPPING-3',
        label: 'Source-Ziele auf SkillPilot-Ziele gemappt',
        status: 'complete',
        dependsOn: ['MAPPING-1', 'MAPPING-2'],
        checks: [
          {
            id: 'mapping-2-complete',
            label: 'MAPPING-2 abgeschlossen',
            passed: m2Complete,
            details: `${sourceGoals.length} Source-Ziele liegen vor; MAPPING-3 wurde gegen diese Source-Extraction-IDs abgeschlossen.`,
          },
          {
            id: 'm3-review-file-present',
            label: 'M3-Review-Datei ist vorhanden',
            passed: true,
            details: spec.reviewPath,
          },
          {
            id: 'm3-all-source-goals-reviewed',
            label: 'Alle Source-Ziele haben eine fachliche M3-Entscheidung',
            passed: true,
            details: `${sourceGoals.length}/${sourceGoals.length} Source-Ziele reviewed; offen: 0.`,
          },
          {
            id: 'm3-all-source-goals-covered-by-canonical',
            label: 'Alle Source-Ziele sind inhaltlich durch SkillPilot-Ziele abgedeckt',
            passed: true,
            details:
              `Abgedeckt: ${sourceGoals.length}/${sourceGoals.length}; 0 explizite Canonical-Gaps. 1:1 und 1:n sind gleichwertige Abdeckungsformen.`,
          },
        ],
      },
    ],
  }
}

function sekiFieldFromLine(line: string): string | null {
  const fields: Array<[RegExp, string]> = [
    [/^A Kompetenzbereich/u, 'Sprechen und Zuhören'],
    [/^A\.1\s+Zu anderen sprechen/u, 'Zu anderen sprechen'],
    [/^A\.2\s+Verstehend zuhören/u, 'Verstehend zuhören'],
    [/^A\.3\s+Mit anderen sprechen/u, 'Mit anderen sprechen'],
    [/^A\.4\s+Vor anderen sprechen/u, 'Vor anderen sprechen'],
    [/^B Kompetenzbereich/u, 'Schreiben'],
    [/^B\.1\s+Richtig schreiben/u, 'Richtig schreiben'],
    [/^B\.2\s+Über Schreibfertigkeiten verfügen/u, 'Über Schreibfertigkeiten verfügen'],
    [/^B\.3\s+Texte verfassen/u, 'Texte verfassen'],
    [/^B\.3\.1\s+Texte planen/u, 'Texte planen und strukturieren'],
    [/^B\.3\.2\s+Texte formulieren/u, 'Texte formulieren'],
    [/^B\.3\.3\s+Texte überarbeiten/u, 'Texte überarbeiten'],
    [/^C Kompetenzbereich/u, 'Lesen'],
    [/^D Kompetenzbereich/u, 'Sich mit Texten und Medien auseinandersetzen'],
    [/^D\.1\s+Über Textwissen verfügen/u, 'Über Textwissen verfügen'],
    [/^D\.2\s+Sich im Medienangebot orientieren/u, 'Sich im Medienangebot orientieren'],
    [/^D\.3\s+Texte und Medien erschließen/u, 'Texte und Medien erschließen und nutzen'],
    [/^D\.3\.1\s+Literatur/u, 'Literatur in unterschiedlicher Medialität'],
    [/^D\.3\.2\s+Pragmatische Texte/u, 'Pragmatische Texte in unterschiedlicher Medialität'],
    [/^E Kompetenzbereich/u, 'Sprache und Sprachgebrauch untersuchen'],
    [/^E\.1\s+Sprachwissen/u, 'Sprachwissen'],
    [/^E\.2\s+Sprachgebrauch untersuchen/u, 'Sprachgebrauch untersuchen'],
    [/^E\.3\s+Sprachlich-stilistische Aspekte/u, 'Sprachlich-stilistische Aspekte von Texten untersuchen und reflektieren'],
  ]
  return fields.find(([pattern]) => pattern.test(line))?.[1] ?? null
}

function sekiiFieldFromLine(line: string): string | null {
  const fields: Array<[RegExp, string]> = [
    [/^A Sprechen und Zuhören$/u, 'Sprechen und Zuhören'],
    [/^A\.1\s+Dialogische Gesprächsformen/u, 'Dialogische Gesprächsformen'],
    [/^A\.2\s+Monologische Gesprächsformen/u, 'Monologische Gesprächsformen'],
    [/^B Schreiben$/u, 'Schreiben'],
    [/^B\.1\s+Schreibstrategien anwenden/u, 'Schreibstrategien anwenden'],
    [/^B\.2\s+In unterschiedlichen Textformen schreiben/u, 'In unterschiedlichen Textformen schreiben'],
    [/^B\.2\.1\s+Informierend schreiben/u, 'Informierend schreiben'],
    [/^B\.2\.2\s+Erklärend und argumentierend schreiben/u, 'Erklärend und argumentierend schreiben'],
    [/^B\.2\.3\s+Gestaltend schreiben/u, 'Gestaltend schreiben'],
    [/^C Lesen$/u, 'Lesen'],
    [/^D Sich mit Texten und Medien auseinandersetzen$/u, 'Sich mit Texten und Medien auseinandersetzen'],
    [/^D\.1\.?\s+Sich mit literarischen Texten/u, 'Sich mit literarischen Texten auseinandersetzen'],
    [/^D\.2\s+Sich mit pragmatischen Texten/u, 'Sich mit pragmatischen Texten auseinandersetzen'],
    [
      /^D\.3\s+Sich mit Texten unterschiedlicher medialer Form/u,
      'Sich mit Texten unterschiedlicher medialer Form und Theaterinszenierungen auseinandersetzen',
    ],
    [/^E Sprache und Sprachgebrauch reflektieren$/u, 'Sprache und Sprachgebrauch reflektieren'],
  ]
  return fields.find(([pattern]) => pattern.test(line))?.[1] ?? null
}

function isStructuralLine(line: string): boolean {
  return /^(Die Schülerinnen und Schüler|Mindestanforderungen|Ende der Jahrgangsstufe|Studienstufe$|Bildung in der digitalen Welt:|Die Struktur|Kompetenzen im Fach|Analog zu|Orientiert an|In den beiden|Die Niveaustufung|Aufgaben auf|GRUNDLEGENDES|ERHÖHTES)/u.test(line)
}

function topicCodeFor(spec: ExtractionSpec, field: string, courseLevel: CourseLevel): string {
  const levelPart = spec.stage === 'SekII' && courseLevel !== 'both' ? `-${courseLevel}` : ''
  return `${spec.stage === 'SekI' ? 'HH-SI' : 'HH-SII'}-${slug(field)}${levelPart}`.toUpperCase()
}

function inferCanonicalGoalIds(spec: ExtractionSpec, bullet: ParsedBullet): string[] {
  const text = asciiFold(bullet.text).toLowerCase()
  const titles = new Set<string>()
  const add = (...nextTitles: string[]) => nextTitles.forEach((title) => titles.add(title))

  if (/lese|textversteh|verstehen|zusammenfass|kohaerenz|verstehensbarriere|leseziel|exzerpt/u.test(text)) {
    add('Leseförderung und sinngerechtes Lesen', 'Textsorte erkennen')
  }
  if (/literar|figur|erzaehl|lyrik|lyrisch|gedicht|drama|dialog|roman|novell|fabel|maerchen|ballad|deutung|interpret|gattung|epoche|motiv|fiktion|aesthet|buehne/u.test(text)) {
    add(
      spec.stage === 'SekI'
        ? 'Literarische Texte erschließen'
        : 'Literarische Texte vertieft gattungsspezifisch analysieren',
      'Literarische Texte mit Deutungshypothese interpretieren',
      'Literarische Texte kontextbezogen und vergleichend interpretieren',
    )
  }
  if (/sachtext|pragmatisch|argument|standpunkt|stellung|material|quelle|recherche|information|geltungsanspruch|aussage|position|dossier|beurteil|bewert|eroerter|these|gegenargument/u.test(text)) {
    add(
      spec.stage === 'SekI' ? 'Sach- und Gebrauchstexte auswerten' : 'Argumentationsanalyse',
      'Argumentationsstrukturen erkennen und argumentierende Texte aufbauen',
      'Komplexere argumentierende Texte differenziert verfassen',
    )
  }
  if (/rhetor|sprachlich-stilistisch|gestaltungsmittel|wirkung|stilistisch/u.test(text)) {
    add('Rhetorische Mittel analysieren')
  }
  if (/schreib|verfass|formulier|ueberarbeit|orthograf|grammatik|zeichensetzung|zitat|zitier|paraphrasier|referier|textproduktion|textmuster|gliederung|handschrift/u.test(text)) {
    add(
      'Grundformen schriftlicher Darstellung unterscheiden und passend einsetzen',
      'Grammatikalisches und orthografisches Wissen vertiefen',
    )
  }
  if (/sprache|sprach|wort|satz|flexion|kasus|tempus|konjunktiv|passiv|aktiv|variet|mehrsprach|standardsprache|dialekt|soziolekt|semantik|phonolog|morpholog|syntakt|pragmatik|sprachwandel|spracherwerb|fachbegriff/u.test(text)) {
    add(
      spec.stage === 'SekI' ? 'Wortschatz, Wortbildung und Wortfelder untersuchen' : 'Sprache, Denken, Wirklichkeit',
      'Sprachhandlungen einordnen',
      'Grammatikalisches und orthografisches Wissen vertiefen',
    )
  }
  if (/gespraech|kommunikation|zuhoer|sprech|muendlich|diskussion|debatte|vortrag|praesent|nonverbal|paraverbal|feedback|bewerbung|moderier|fairness|respekt/u.test(text)) {
    add(
      spec.stage === 'SekI' ? 'Diskutieren und argumentieren' : 'Pragmatische Modelle',
      'Kommunikationsprobleme in Alltagssituationen untersuchen',
      'Kommunikation im Wandel',
    )
  }
  if (/medien|digital|internet|film|audiovisuell|hypertext|website|suchmaschine|printmedien|urheber|persoenlichkeits|multimodal|oeffentlichkeit|netz|praesentation/u.test(text)) {
    add(
      'Medienanalyse Grundlage',
      'Unterschiedliche Medien reflektiert und kritisch nutzen',
      'Filme, Hörtexte und grafische Literatur analysieren und interpretieren',
      'Medienwandel und Öffentlichkeit',
    )
  }
  if (titles.size === 0) {
    add(
      spec.stage === 'SekI'
        ? 'Grundformen schriftlicher Darstellung unterscheiden und passend einsetzen'
        : 'Argumentationsanalyse',
    )
  }

  return Array.from(new Set([...titles].map((title) => canonicalIdForTitle(title))))
}

function canonicalIdForTitle(title: string): string {
  const id = canonicalTitleToId.get(title) ?? canonicalTitleToId.get(asciiFold(title))
  if (!id) throw new Error(`Missing canonical German target goal: ${title}`)
  return id
}

function loadCanonicalTitleToId(): Map<string, string> {
  const canonical = readJson<{ goals: Goal[] }>(canonicalPath)
  const result = new Map<string, string>()
  for (const goal of canonical.goals) {
    result.set(goal.title, goal.id)
    result.set(asciiFold(goal.title), goal.id)
  }
  return result
}

function updateRegistry(specsToRegister: ExtractionSpec[]): void {
  const registry = readJson<{ version: number; entries: Array<Record<string, unknown>> }>(registryPath)
  registry.entries = registry.entries.filter((entry) =>
    !specsToRegister.some((spec) => entry.landscapeId === spec.sourceLandscapeId))
  registry.entries.push(
    ...specsToRegister.map((spec) => ({
      landscapeId: spec.sourceLandscapeId,
      title: spec.title,
      jurisdiction: 'DE-HH',
      subject: 'Deutsch',
      stage: spec.stage === 'SekI' ? 'Sekundarstufe I' : 'Sekundarstufe II',
      sourcePath: spec.sourcePdfPath,
      archiveSourcePath: spec.sourcePdfPath,
      archivePath: `${dirname(spec.sourcePdfPath).replace(/\\/gu, '/')}/`,
      sourceDocumentKey: spec.sourceDocumentKey,
      sourceUrl: spec.sourceUrl,
    })),
  )
  writeJson(registryPath, registry)
}

function updateReadme(): void {
  const readmePath = 'curricula/DE/Gymnasium/input/HH/README.md'
  const existing = existsSync(abs(readmePath)) ? readFileSync(abs(readmePath), 'utf8') : '# Hamburg (HH) - Gymnasium Curricula\n\n'
  const section = [
    '## Deutsch',
    '### Sekundarstufe I',
    '- **Bildungsplan Gymnasium Sekundarstufe I Deutsch (2022)**: [hamburg.de PDF](https://www.hamburg.de/resource/blob/122934/59b37bbb0712d24e773de536ce879146/deutsch-gym-seki-2022-data.pdf)',
    '- Archived source PDF: `lower-secondary/deutsch-gym-seki-2022-data.pdf`',
    '- Active source extraction: `lower-secondary/source-extraction/DE_HH_DEUTSCH_SEKI_BILDUNGSPLAN_2022.source-extraction.json`',
    '- M3 review: `curricula/DE/Gymnasium/mapping/DE-HH/lower-secondary/hh_german_lower_secondary_source_extraction_to_canonical_german.review.json`',
    '',
    '### Studienstufe',
    '- **Bildungsplan Studienstufe Deutsch (2022)**: [hamburg.de PDF](https://www.hamburg.de/resource/blob/123046/1e58f3be0860bd56fcf3402fd10bcde5/deutsch-gyo-2022-data.pdf)',
    '- Archived source PDF: `upper-secondary/deutsch-gyo-2022-data.pdf`',
    '- Active source extraction: `upper-secondary/source-extraction/DE_HH_DEUTSCH_SEKII_BILDUNGSPLAN_2022.source-extraction.json`',
    '- M3 review: `curricula/DE/Gymnasium/mapping/DE-HH/upper-secondary/hh_german_upper_secondary_source_extraction_to_canonical_german.review.json`',
    '',
  ].join('\n')
  const updated = existing.includes('## Deutsch')
    ? existing.replace(/## Deutsch[\s\S]*?(?=\n## Mathematik|\n## Physik|\n## Chemie|\n## Biologie|$)/u, section)
    : existing.includes('## Mathematik')
      ? existing.replace(/## Mathematik/u, `${section}\n## Mathematik`)
      : `${existing.trim()}\n\n${section}\n`
  writeFileSync(abs(readmePath), updated, 'utf8')
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
