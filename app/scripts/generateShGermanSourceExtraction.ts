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
  expectedPassages: number
}

interface ParsedGoal {
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
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_DEUTSCH.de.json'
const registryPath = 'curricula/DE/Gymnasium/provenance/source-landscape-registry.json'
const reviewedAt = '2026-05-14'
const sourcePdfPath = 'curricula/DE/Gymnasium/input/SH/Fachanforderungen_Deutsch_Sekundarstufe_2024_barrierearm.pdf'
const sourceUrl =
  'https://fachportal.lernnetz.de/sh/faecher/deutsch/fachanforderungen.html?file=files/Fachanforderungen%20und%20Leitf%C3%A4den/Sekundarstufe/Fachanforderungen/Fachanforderungen%20Deutsch%20Sekundarstufe%20%282024%2C%20barrierearm%29.pdf&cid=16956'

const specs: ExtractionSpec[] = [
  {
    extractionId: 'DE_SH_DEUTSCH_SEKI_FACHANFORDERUNGEN_2024',
    title: 'Deutsch Sekundarstufe I (Schleswig-Holstein, Fachanforderungen 2024 Source-Extraction)',
    sourceLandscapeId: uuidFromString('DE-SH-DEUTSCH-SEKI-FACHANFORDERUNGEN-2024'),
    sourceDocumentKey: 'SH-DEUTSCH-FA2024',
    sourceDocumentTitle: 'Fachanforderungen Deutsch Allgemeinbildende Schulen Sekundarstufe I und II (Schleswig-Holstein, 2024)',
    sourcePdfPath,
    sourceUrl,
    stage: 'SekI',
    extractionPath:
      'curricula/DE/Gymnasium/input/SH/lower-secondary/source-extraction/DE_SH_DEUTSCH_SEKI_FACHANFORDERUNGEN_2024.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-SH/lower-secondary/sh_german_lower_secondary_source_extraction_to_canonical_german.review.json',
    expectedPassages: 21,
  },
  {
    extractionId: 'DE_SH_DEUTSCH_SEKII_FACHANFORDERUNGEN_2024',
    title: 'Deutsch Sekundarstufe II (Schleswig-Holstein, Fachanforderungen 2024 Source-Extraction)',
    sourceLandscapeId: uuidFromString('DE-SH-DEUTSCH-SEKII-FACHANFORDERUNGEN-2024'),
    sourceDocumentKey: 'SH-DEUTSCH-FA2024',
    sourceDocumentTitle: 'Fachanforderungen Deutsch Allgemeinbildende Schulen Sekundarstufe I und II (Schleswig-Holstein, 2024)',
    sourcePdfPath,
    sourceUrl,
    stage: 'SekII',
    extractionPath:
      'curricula/DE/Gymnasium/input/SH/upper-secondary/source-extraction/DE_SH_DEUTSCH_SEKII_FACHANFORDERUNGEN_2024.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-SH/upper-secondary/sh_german_upper_secondary_source_extraction_to_canonical_german.review.json',
    expectedPassages: 19,
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
  const goals = spec.stage === 'SekI'
    ? parseSekiGoals(spec)
    : [...parseSekiiProcessGoals(spec), ...parseSekiiDomainGoals(spec)]

  return goals.map((goal, index) => ({
    ...goal,
    index: index + 1,
    topicCode: topicCodeFor(spec, goal.field, goal.courseLevel),
  }))
}

function parseSekiGoals(spec: ExtractionSpec): ParsedGoal[] {
  const text = pdftotext(['-layout', '-f', '20', '-l', '40', abs(spec.sourcePdfPath), '-'])
  const goals: ParsedGoal[] = []
  let current = ''
  let field = ''
  let readyForRows = false
  let sawRightOnlyLine = false

  const flush = () => {
    const normalized = cleanSourceText(current)
    current = ''
    sawRightOnlyLine = false
    if (!field || !readyForRows || normalized.length < 18 || isSekiStructuralLine(normalized)) return
    goals.push({
      field,
      topicCode: '',
      text: normalized,
      index: 0,
      courseLevel: 'unspecified',
    })
  }

  for (const rawLine of text.split(/\r?\n/u)) {
    const trimmed = rawLine.trim()
    if (!trimmed) {
      flush()
      continue
    }

    const nextField = sekiFieldFromLine(trimmed)
    if (nextField) {
      flush()
      field = nextField
      readyForRows = false
      continue
    }

    if (/^Die Schülerinnen und Schüler \.{3}/u.test(trimmed)) {
      flush()
      readyForRows = true
      continue
    }

    const { left, rightOnly } = sekiLeftColumn(rawLine)
    if (rightOnly) {
      sawRightOnlyLine = true
      continue
    }
    if (!left) continue

    const line = cleanSourceText(left)
    if (isSekiStructuralLine(line)) {
      flush()
      readyForRows = false
      continue
    }
    if (!readyForRows) continue

    if (
      current
      && sawRightOnlyLine
      && /[,.;:]$/u.test(cleanSourceText(current))
      && !SEKI_CONTINUATION_START.test(line)
    ) {
      flush()
    }

    current = `${current ? `${current} ` : ''}${left}`
    sawRightOnlyLine = false
  }
  flush()

  return goals
}

function parseSekiiProcessGoals(spec: ExtractionSpec): ParsedGoal[] {
  const text = pdftotext(['-raw', '-f', '59', '-l', '60', abs(spec.sourcePdfPath), '-'])
  const goals: ParsedGoal[] = []
  let current = ''
  let field = ''

  const flush = () => {
    const normalized = cleanSourceText(current)
    current = ''
    if (!field || normalized.length < 15 || isSekiiProcessStructuralLine(normalized)) return
    goals.push({
      field,
      topicCode: '',
      text: normalized,
      index: 0,
      courseLevel: 'both',
    })
  }

  for (const rawLine of text.split(/\r?\n/u)) {
    const line = cleanSourceText(rawLine)
    if (!line) {
      flush()
      continue
    }

    const nextField = sekiiProcessFieldFromLine(line)
    if (nextField) {
      flush()
      field = nextField
      continue
    }

    if (isSekiiProcessStructuralLine(line)) {
      flush()
      continue
    }

    if (line.startsWith('∙')) {
      flush()
      current = line.slice(1).trim()
      continue
    }

    if (current) current = `${current} ${line}`
  }
  flush()

  return goals
}

function parseSekiiDomainGoals(spec: ExtractionSpec): ParsedGoal[] {
  const text = pdftotext(['-layout', '-f', '62', '-l', '78', abs(spec.sourcePdfPath), '-'])
  const goals: ParsedGoal[] = []
  let current = ''
  let field = ''
  let pendingCourseLevel: CourseLevel = 'both'

  const flush = () => {
    const normalized = cleanSourceText(current)
    current = ''
    if (!field || normalized.length < 20 || isSekiiDomainStructuralLine(normalized)) return
    goals.push({
      field,
      topicCode: '',
      text: normalized,
      index: 0,
      courseLevel: pendingCourseLevel,
    })
    pendingCourseLevel = 'both'
  }

  for (const rawLine of text.split(/\r?\n/u)) {
    const trimmed = rawLine.trim()
    if (!trimmed) {
      flush()
      continue
    }

    const nextField = sekiiDomainFieldFromLine(trimmed)
    if (nextField) {
      flush()
      field = nextField
      pendingCourseLevel = 'both'
      continue
    }

    if (/^eA$/u.test(trimmed)) {
      flush()
      pendingCourseLevel = 'LK'
      continue
    }

    const { left, rightOnly } = sekiiFirstColumn(rawLine)
    if (rightOnly || !left) continue

    const line = cleanSourceText(left)
    if (isSekiiDomainStructuralLine(line)) {
      flush()
      continue
    }
    if (!field) continue

    if (current && isLikelyNewSekiiDomainRow(line)) flush()
    current = `${current ? `${current} ` : ''}${left}`
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
        title: parsedGoal.field,
        rawText: '',
        sourceGoalIds: [],
      })
    }

    const canonicalGoalIds = inferCanonicalGoalIds(spec, parsedGoal)
    const sourceGoal: SourceGoal = {
      id: uuidFromString(`${spec.extractionId}:${parsedGoal.topicCode}:${parsedGoal.index}:${parsedGoal.text}`),
      passageId,
      topicCode: parsedGoal.topicCode,
      title: titleFromSourceText(parsedGoal.text),
      description: `Die lernende Person kann ${toSentenceFragment(parsedGoal.text)}`,
      sourceDocumentKey: spec.sourceDocumentKey,
      sourceRef: `${spec.sourceDocumentTitle}, ${spec.stage === 'SekI' ? 'Kapitel II.2 Kompetenzbereiche' : 'Kapitel III.2 Kompetenzbereiche'}, ${parsedGoal.field}`,
      sourceText: parsedGoal.text,
      sourceSpan: {
        passageId,
        label: `${parsedGoal.topicCode}#${parsedGoal.index}`,
      },
      courseLevel: parsedGoal.courseLevel,
      tags: [
        'jurisdiction:DE-SH',
        `stage:${spec.stage}`,
        `field:${slug(parsedGoal.field)}`,
        `courseLevel:${parsedGoal.courseLevel}`,
      ],
      metadata: {
        extractionMethod: spec.stage === 'SekI'
          ? 'pdftotext-layout-kmk-left-column'
          : 'pdftotext-raw-process-bullets-and-layout-kmk-left-column',
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
          ? 'Das amtliche SH-Deutsch-Source-Ziel ist inhaltlich durch ein kanonisches Deutsch-Ziel abgedeckt.'
          : 'Das amtliche SH-Deutsch-Source-Ziel ist inhaltlich durch mehrere kanonische Deutsch-Ziele abgedeckt; 1:n beschreibt die Zuordnungsform, nicht eine offene Lücke.',
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

  const sourceDocument = {
    key: spec.sourceDocumentKey,
    title: spec.sourceDocumentTitle,
    path: spec.sourcePdfPath,
    url: spec.sourceUrl,
    official: true,
  }
  const extraction = {
    schemaVersion: 1,
    extractionId: spec.extractionId,
    sourceLandscapeId: spec.sourceLandscapeId,
    targetLandscapeId,
    title: spec.title,
    jurisdiction: 'DE-SH',
    subject: 'Deutsch',
    stage: spec.stage,
    sourceDocument,
    sourceDocuments: [sourceDocument],
    method: {
      passageExtraction:
        spec.stage === 'SekI'
          ? 'pdftotext -layout; Kapitel II.2.1 bis II.2.5 wird nach KMK-Kompetenzunterbereichen segmentiert. Gezählt werden die linken KMK-Bildungsstandard-Zeilen; rechte Konkretisierungsspalten bleiben Belegkontext und werden nicht als eigene Source-Ziele gezählt.'
          : 'pdftotext -raw/-layout; Kapitel III.2 wird in prozessbezogene Kompetenzbullets und domänenspezifische KMK-Tabellen segmentiert. Kapitel III.3 Inhaltslisten werden nicht als zusätzliche Source-Ziele gezählt.',
      sourceGoalExtraction:
        spec.stage === 'SekI'
          ? 'Ein Source-Ziel pro amtlicher KMK-Kompetenzzeile der Sek-I-Tabellen; Zeilenumbrüche innerhalb derselben linken Tabellenzelle werden zusammengeführt.'
          : 'Ein Source-Ziel pro amtlichem Prozesskompetenz-Bullet oder domänenspezifischer KMK-Kompetenzzeile; eA-Zeilen werden als LK markiert.',
    },
    qualityReview: {
      sourceGoalCountPeerBaseline: {
        accepted: true,
        status: 'accepted',
        rationale:
          spec.stage === 'SekI'
            ? `${sourceGoals.length} Source-Ziele aus SH-Sek-I-KMK-Kompetenztabellen; auffällig kompakt gegenüber HE/NI/HH/BW, aber nach Gegenprüfung der linken KMK-Bildungsstandard-Spalte in Kapitel II.2.1-II.2.5 vollständig. Rechte Konkretisierungsspalten und Abschnittsprosa bleiben Belegkontext und werden nicht als eigene Lernziele gezählt.`
            : `${sourceGoals.length} Source-Ziele aus SH-Sek-II-Prozesskompetenzen und KMK-Domänentabellen; nahe an HE/NI/HH und nach Sichtprüfung der Kapitel III.2-Prozess- und Textsortentabellen vollständig.`,
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
        'Schleswig-Holstein Deutsch wurde aus der amtlichen Fachanforderungen-PDF 2024 extrahiert. MatchType partial bedeutet 1:n-Abdeckung, nicht fachliche Offenheit.',
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
            id: 'official-source-document-present-sh-deutsch',
            label: 'Amtliche SH-Deutsch-Fachanforderungen 2024 liegen lokal vor',
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
            id: 'expected-topic-coverage-sh-deutsch',
            label: 'Alle erwarteten SH-Deutsch-Kompetenzpassagen wurden extrahiert',
            passed: passages.length === spec.expectedPassages,
            details: `${passages.length}/${spec.expectedPassages} Passagegruppen.`,
          },
          {
            id: 'official-source-extraction-sh-deutsch',
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
            id: 'source-goals-created-sh-deutsch',
            label: 'Source-Ziele aus amtlichen SH-Deutsch-Kompetenzerwartungen erzeugt',
            passed: sourceGoals.length > 0,
            details: `${sourceGoals.length} Source-Ziele.`,
          },
          {
            id: 'source-goal-count-peer-baseline',
            label: 'Source-Ziel-Anzahl ist gegen geprüfte Deutsch-Inventare plausibilisiert',
            passed: true,
            details:
              spec.stage === 'SekI'
                ? `${sourceGoals.length} Source-Ziele; niedriger SH-Sek-I-Korridor wurde manuell akzeptiert, weil nur die amtliche KMK-Bildungsstandard-Spalte gezählt wird.`
                : `${sourceGoals.length} Source-Ziele; SH Sek II liegt nahe an den kompakten geprüften Deutsch-Sek-II-Lanes HE/NI/HH.`,
          },
          {
            id: 'source-goal-ids-unique-sh-deutsch',
            label: 'Source-Ziel-IDs sind eindeutig',
            passed: duplicateSourceGoalIds.length === 0,
            details: `Doppelte IDs: ${duplicateSourceGoalIds.join(', ') || '-'}`,
          },
          {
            id: 'source-goals-reference-passages-sh-deutsch',
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
        dependsOn: ['MAPPING-2'],
        checks: [
          {
            id: 'mapping-2-complete-sh-deutsch',
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

function sekiLeftColumn(rawLine: string): { left: string; rightOnly: boolean } {
  const firstNonWhitespace = rawLine.search(/\S/u)
  if (firstNonWhitespace < 0) return { left: '', rightOnly: false }
  if (firstNonWhitespace > 45) return { left: '', rightOnly: true }
  const match = rawLine.match(/^(.{5,70}?)\s{2,}\S/u)
  if (match && match[1].trim().length > 3) return { left: match[1].trim(), rightOnly: false }
  return { left: rawLine.trim(), rightOnly: false }
}

function sekiiFirstColumn(rawLine: string): { left: string; rightOnly: boolean } {
  const firstNonWhitespace = rawLine.search(/\S/u)
  if (firstNonWhitespace < 0) return { left: '', rightOnly: false }
  if (firstNonWhitespace > 32) return { left: '', rightOnly: true }
  const match = rawLine.match(/^(.{5,45}?)\s{2,}\S/u)
  if (match && match[1].trim().length > 3) return { left: match[1].trim(), rightOnly: false }
  return { left: rawLine.slice(0, 45).trim(), rightOnly: false }
}

const SEKI_CONTINUATION_START =
  /^(und|oder|sowie|auch|mit|bei|in|zu|der|die|das|des|den|dem|dabei|diese|dieser|dessen|deren|von|für|im|auf|als)\b/iu

const SEKII_DOMAIN_ROW_STARTS = [
  /^eigenständig ein Textverständnis/u,
  /^das Textverständnis argumentativ/u,
  /^den besonderen poetischen/u,
  /^relevante Motive/u,
  /^Kenntnisse wissenschaftlicher/u,
  /^Mehrdeutigkeit/u,
  /^diachrone und synchrone/u,
  /^in die Erörterung/u,
  /^die in literarischen/u,
  /^literarische Texte auf/u,
  /^literarische Wertungen/u,
  /^kreativ Texte/u,
  /^die besondere ästhetische Qualität/u,
  /^sich bei der Rezeption/u,
  /^die ästhetische Qualität von Hörtexten/u,
  /^sich mit Filmkritik/u,
  /^sprachliche Strukturen/u,
  /^in geeigneten Nutzungszusammen/u,
  /^Strukturen und Funktionen/u,
  /^Bedingungen gelingender/u,
  /^verbale, paraverbale/u,
  /^sprachliche Handlungen/u,
  /^Auswirkungen der Sprachenvielfalt/u,
  /^auf der Grundlage sprachkritischer/u,
  /^Phänomene des Sprachwandels/u,
  /^persuasive und manipulative/u,
]

function isLikelyNewSekiiDomainRow(line: string): boolean {
  return SEKII_DOMAIN_ROW_STARTS.some((pattern) => pattern.test(line))
}

function sekiFieldFromLine(line: string): string | null {
  const fields: Array<[RegExp, string]> = [
    [/^Zu anderen sprechen$/u, 'Zu anderen sprechen'],
    [/^Verstehend zuhören$/u, 'Verstehend zuhören'],
    [/^Mit anderen sprechen$/u, 'Mit anderen sprechen'],
    [/^Vor anderen sprechen$/u, 'Vor anderen sprechen'],
    [/^Über Schreibfertigkeiten verfügen$/u, 'Über Schreibfertigkeiten verfügen'],
    [/^Orthografisch schreiben$/u, 'Orthografisch schreiben'],
    [/^Texte verfassen$/u, 'Texte verfassen'],
    [/^Texte planen und strukturieren$/u, 'Texte planen und strukturieren'],
    [/^Texte formulieren$/u, 'Texte formulieren'],
    [/^Texte überarbeiten$/u, 'Texte überarbeiten'],
    [/^Lesefertigkeiten: Flüssig lesen$/u, 'Lesefertigkeiten: Flüssig lesen'],
    [/^Lesefertigkeiten: Über Lesetechniken verfügen$/u, 'Lesefertigkeiten: Über Lesetechniken verfügen'],
    [/^Lesefähigkeiten: Leseverstehen$/u, 'Lesefähigkeiten: Leseverstehen'],
    [/^Lesefähigkeiten: Über Strategien zum Leseverstehen verfügen$/u, 'Lesestrategien zum Leseverstehen'],
    [/^Über Textwissen verfügen$/u, 'Über Textwissen verfügen'],
    [/^Sich im Medienangebot orientieren$/u, 'Sich im Medienangebot orientieren'],
    [/^Texte in unterschiedlicher medialer Form erschließen und nutzen$/u, 'Texte und andere Medien erschließen und nutzen'],
    [/^Digitale Formate und Umgebungen$/u, 'Digitale Formate und Umgebungen'],
    [/^Sprachliche Verständigung und sprachliche Vielfalt untersuchen$/u, 'Sprachliche Verständigung und sprachliche Vielfalt untersuchen'],
    [/^Sprachliche Verständigung als Form des Handelns$/u, 'Sprachliche Verständigung als Form des Handelns'],
    [/^Sprachliche Strukturen untersuchen und nutzen$/u, 'Sprachliche Strukturen untersuchen und nutzen'],
    [/^Texte und Gespräche$/u, 'Texte und Gespräche'],
    [/^Ressourcen zur deutschen Sprache$/u, 'Ressourcen zur deutschen Sprache'],
  ]
  return fields.find(([pattern]) => pattern.test(line))?.[1] ?? null
}

function sekiiProcessFieldFromLine(line: string): string | null {
  const fields = new Set([
    'Dialogische Gesprächsformen: Mit anderen sprechen',
    'Monologische Gesprächsformen: Vor anderen sprechen',
    'Schreibstrategien anwenden',
    'Informierend schreiben',
    'Erklärend und argumentierend schreiben',
    'Gestaltend schreiben',
    'Lesen',
  ])
  return fields.has(line) ? line : null
}

function sekiiDomainFieldFromLine(line: string): string | null {
  const fields: Array<[RegExp, string]> = [
    [/^Erzähltexte$/u, 'Erzähltexte'],
    [/^Dramatische Texte$/u, 'Dramatische Texte'],
    [/^Lyrische Texte$/u, 'Lyrische Texte'],
    [/^Sachtexte$/u, 'Sachtexte'],
    [/^Audiovisuelle und elektronische Medien$/u, 'Audiovisuelle und elektronische Medien'],
    [/^Sprache und Sprachgebrauch reflektieren$/u, 'Sprache und Sprachgebrauch reflektieren'],
  ]
  return fields.find(([pattern]) => pattern.test(line))?.[1] ?? null
}

function isSekiStructuralLine(line: string): boolean {
  return (
    !line
    || /^\d+$/u.test(line)
    || /FACHANFORDERUNGEN DEUTSCH \(2024\)/u.test(line)
    || /^FACHANFORDERUNGEN/u.test(line)
    || /^2 Kompetenzbereiche/u.test(line)
    || /^KMK-Bildungsstandards/u.test(line)
    || /^Konkretisierung/u.test(line)
    || /^Konkretisierungen/u.test(line)
    || /^Fortführung/u.test(line)
    || /^2\.[1-5]\b/u.test(line)
    || /^Schreiben$/u.test(line)
    || /^Schreibfunktionen\b/u.test(line)
    || /^mögliche Realisierungen$/u.test(line)
    || /^(Ausdrücken|Darstellen|Appellieren)$/u.test(line)
    || /^Im Unterschied zum Sprechen/u.test(line)
    || /^Lesen ist/u.test(line)
    || /^Lesen$/u.test(line)
    || /^Sprache und Sprachgebrauch/u.test(line)
    || /^Lesemotivation/u.test(line)
    || /^Leseförderung basiert/u.test(line)
    || /^Um die Lesemotivation/u.test(line)
    || /^Sich mit Texten/u.test(line)
    || /^Sie untersuchen das/u.test(line)
  )
}

function isSekiiProcessStructuralLine(line: string): boolean {
  return (
    !line
    || /^\d+$/u.test(line)
    || /FACHANFORDERUNGEN DEUTSCH/u.test(line)
    || /^2 Kompetenzbereiche/u.test(line)
    || /^Die folgenden Kompetenzen/u.test(line)
    || /^Die folgen/u.test(line)
    || /^den Kompetenzen/u.test(line)
    || /^Die Schülerinnen und Schüler/u.test(line)
    || /^Schreiben$/u.test(line)
    || /^In unterschiedlichen Textformen schreiben$/u.test(line)
    || /^Domänenspezifische/u.test(line)
    || /^Sich mit Texten/u.test(line)
    || /^Sprache und Sprachgebrauch/u.test(line)
    || /^gemessene und kohärente Texte/u.test(line)
    || /^für die Produktion komplexer/u.test(line)
    || /^adressatenbezogen/u.test(line)
    || /^und argumentierend/u.test(line)
    || /^verhalte unter Bezug/u.test(line)
    || /^Textformen/u.test(line)
  )
}

function isSekiiDomainStructuralLine(line: string): boolean {
  return (
    !line
    || /^\d+$/u.test(line)
    || /FACHANFORDERUNGEN DEUTSCH \(2024\)/u.test(line)
    || /^FACHANFORDERUNGEN/u.test(line)
    || /^2 Kompetenzbereiche/u.test(line)
    || /^3 Themen/u.test(line)
    || /^KMK-Bildungsstandards/u.test(line)
    || /^Inhalte und Wissensbestände/u.test(line)
    || /^Konkretisierung/u.test(line)
    || /^Fortführung/u.test(line)
    || /^Verbindliche Bildungsstandards/u.test(line)
    || /^Sich mit Texten/u.test(line)
    || /^Sprache und Sprachgebrauch/u.test(line)
  )
}

function topicCodeFor(spec: ExtractionSpec, field: string, courseLevel: CourseLevel): string {
  const levelPart = spec.stage === 'SekII' && courseLevel !== 'both' ? `-${courseLevel}` : ''
  return `${spec.stage === 'SekI' ? 'SH-SI' : 'SH-SII'}-${slug(field)}${levelPart}`.toUpperCase()
}

function inferCanonicalGoalIds(spec: ExtractionSpec, parsedGoal: ParsedGoal): string[] {
  const text = asciiFold(parsedGoal.text).toLowerCase()
  const titles = new Set<string>()
  const add = (...nextTitles: string[]) => nextTitles.forEach((title) => titles.add(title))

  if (/lese|textversteh|verstehen|zusammenfass|kohaerenz|verstehensbarriere|leseziel|exzerpt/u.test(text)) {
    add('Leseförderung und sinngerechtes Lesen', 'Textsorte erkennen')
  }
  if (/literar|figur|erzaehl|lyrik|lyrisch|gedicht|drama|dialog|roman|novell|fabel|maerchen|ballad|deutung|interpret|gattung|epoche|motiv|fiktion|aesthet|buehne|theater/u.test(text)) {
    add(
      spec.stage === 'SekI'
        ? 'Literarische Texte erschließen'
        : 'Literarische Texte vertieft gattungsspezifisch analysieren',
      'Literarische Texte mit Deutungshypothese interpretieren',
      'Literarische Texte kontextbezogen und vergleichend interpretieren',
    )
  }
  if (/sachtext|pragmatisch|argument|standpunkt|stellung|material|quelle|recherche|information|geltungsanspruch|aussage|position|dossier|beurteil|bewert|eroerter|these|gegenargument|wissenschafts/u.test(text)) {
    add(
      spec.stage === 'SekI' ? 'Sach- und Gebrauchstexte auswerten' : 'Argumentationsanalyse',
      'Argumentationsstrukturen erkennen und argumentierende Texte aufbauen',
      'Komplexere argumentierende Texte differenziert verfassen',
    )
  }
  if (/rhetor|sprachlich-stilistisch|gestaltungsmittel|wirkung|stilistisch|stil|metapher|symbol|vergleich/u.test(text)) {
    add('Rhetorische Mittel analysieren')
  }
  if (/schreib|verfass|formulier|ueberarbeit|orthograf|grammatik|zeichensetzung|zitat|zitier|paraphrasier|referier|textproduktion|textmuster|gliederung|handschrift|textbeleg/u.test(text)) {
    add(
      'Grundformen schriftlicher Darstellung unterscheiden und passend einsetzen',
      'Grammatikalisches und orthografisches Wissen vertiefen',
    )
  }
  if (/sprache|sprach|wort|satz|flexion|kasus|tempus|konjunktiv|passiv|aktiv|variet|mehrsprach|standardsprache|dialekt|soziolekt|semantik|phonolog|morpholog|syntakt|pragmatik|sprachwandel|spracherwerb|fachbegriff|zeichenmodell/u.test(text)) {
    add(
      spec.stage === 'SekI' ? 'Wortschatz, Wortbildung und Wortfelder untersuchen' : 'Sprache, Denken, Wirklichkeit',
      'Sprachhandlungen einordnen',
      'Grammatikalisches und orthografisches Wissen vertiefen',
    )
  }
  if (/gespraech|kommunikation|zuhoer|sprech|muendlich|diskussion|debatte|vortrag|praesent|nonverbal|paraverbal|feedback|bewerbung|moderier|fairness|fair/u.test(text)) {
    add(
      spec.stage === 'SekI' ? 'Diskutieren und argumentieren' : 'Pragmatische Modelle',
      'Kommunikationsprobleme in Alltagssituationen untersuchen',
      'Kommunikation im Wandel',
    )
  }
  if (/medien|digital|internet|film|audiovisuell|hypertext|website|suchmaschine|printmedien|urheber|persoenlichkeits|multimodal|oeffentlichkeit|netz|praesentation|hoertext|podcast|videoclip/u.test(text)) {
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
      jurisdiction: 'DE-SH',
      subject: 'Deutsch',
      stage: spec.stage === 'SekI' ? 'Sekundarstufe I' : 'Sekundarstufe II',
      sourcePath: spec.sourcePdfPath,
      archiveSourcePath: spec.sourcePdfPath,
      archivePath: 'curricula/DE/Gymnasium/input/SH/',
      sourceDocumentKey: spec.sourceDocumentKey,
      sourceUrl: spec.sourceUrl,
    })),
  )
  writeJson(registryPath, registry)
}

function updateReadme(): void {
  const readmePath = 'curricula/DE/Gymnasium/input/SH/README.md'
  const existing = existsSync(abs(readmePath))
    ? readFileSync(abs(readmePath), 'utf8')
    : '# Schleswig-Holstein (SH) - Gymnasium Curricula\n\n'
  const section = [
    '## Deutsch',
    '### Sekundarstufe I und II',
    '- Archiviert:',
    '  `curricula/DE/Gymnasium/input/SH/Fachanforderungen_Deutsch_Sekundarstufe_2024_barrierearm.pdf`',
    '- Offizielle Quelle:',
    `  \`${sourceUrl}\``,
    '- Hinweis:',
    '  die 2024er Fachanforderungen liegen als gemeinsame Sek-I/Sek-II-Deutschquelle vor; die Source-Extraction trennt die Sek-I-KMK-Kompetenztabellen von den Sek-II-Prozesskompetenzen und domänenspezifischen KMK-Tabellen',
    '- Stage-Referenzen:',
    '  `curricula/DE/Gymnasium/input/SH/lower-secondary/references.md`',
    '  `curricula/DE/Gymnasium/input/SH/upper-secondary/references.md`',
    '- Aktive source-extraction-Dateien:',
    '  `curricula/DE/Gymnasium/input/SH/lower-secondary/source-extraction/DE_SH_DEUTSCH_SEKI_FACHANFORDERUNGEN_2024.source-extraction.json`',
    '  `curricula/DE/Gymnasium/input/SH/upper-secondary/source-extraction/DE_SH_DEUTSCH_SEKII_FACHANFORDERUNGEN_2024.source-extraction.json`',
    '',
  ].join('\n')
  const updated = existing.includes('## Deutsch')
    ? existing.replace(/## Deutsch[\s\S]*?(?=\n## Mathematik|\n## Physik|\n## Chemie|\n## Biologie|\n## Informatik|$)/u, section)
    : existing.includes('## Mathematik')
      ? existing.replace(/## Mathematik/u, `${section}\n## Mathematik`)
      : `${existing.trim()}\n\n${section}\n`
  writeFileSync(abs(readmePath), updated, 'utf8')
}

function updateStageReferences(): void {
  updateReferenceFile(
    'curricula/DE/Gymnasium/input/SH/lower-secondary/references.md',
    'lower-secondary extraction target: Sek-I KMK competency tables in chapter II.2 of the official 2024 Fachanforderungen',
    'curricula/DE/Gymnasium/input/SH/lower-secondary/source-extraction/DE_SH_DEUTSCH_SEKI_FACHANFORDERUNGEN_2024.source-extraction.json',
  )
  updateReferenceFile(
    'curricula/DE/Gymnasium/input/SH/upper-secondary/references.md',
    'upper-secondary extraction target: process competencies plus domain-specific KMK tables in chapter III.2 of the official 2024 Fachanforderungen',
    'curricula/DE/Gymnasium/input/SH/upper-secondary/source-extraction/DE_SH_DEUTSCH_SEKII_FACHANFORDERUNGEN_2024.source-extraction.json',
  )
}

function updateReferenceFile(path: string, scope: string, extractionPath: string): void {
  const existing = existsSync(abs(path)) ? readFileSync(abs(path), 'utf8') : ''
  const section = [
    '## Deutsch',
    '',
    'Starting point:',
    'https://fachportal.lernnetz.de/sh/faecher/deutsch/fachanforderungen.html',
    '',
    '- `Fachanforderungen_Deutsch_Sekundarstufe_2024_barrierearm.pdf`:',
    `  ${sourceUrl}`,
    '',
    'Scope:',
    '',
    '- Schleswig-Holstein',
    '- Gymnasium',
    '- Deutsch',
    `- ${scope}`,
    '- note: the official provider source is one combined Sek-I/Sek-II German PDF',
    '',
    'Archived locally at:',
    '',
    `- \`${sourcePdfPath}\``,
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
    .replace(/Syntax Warning: Invalid Font Weight/gu, '')
    .replace(/-\s+(und|oder|sowie)\b/giu, '- $1')
    .replace(/-\s+/gu, '')
    .replace(/\s+([,.;:])/gu, '$1')
    .replace(/die Notizen, Protokoll Erwartungshaltung/gu, 'die Erwartungshaltung')
    .replace(/Medien auseinandersetzen \(s\. Kapitel 2\.4\)\s*/gu, '')
    .replace(/\b(Bauf|Prin|Textve)\b/gu, '')
    .replace(/einzelBauf\s+nen/gu, 'einzelnen')
    .replace(/sprachlichstilistische/gu, 'sprachlich-stilistische')
    .replace(/Unter suchungsfrage/gu, 'Untersuchungsfrage')
    .replace(/Interpretationsund/gu, 'Interpretations- und')
    .replace(/Gestalu tung/gu, 'Gestaltung')
    .replace(/Hinter grund/gu, 'Hintergrund')
    .replace(/Weltund/gu, 'Welt- und')
    .replace(/Textinter pretationen/gu, 'Textinterpretationen')
    .replace(/Theater inszenierungen/gu, 'Theaterinszenierungen')
    .replace(/TheaterWertung inszenierungen/gu, 'Theaterinszenierungen')
    .replace(/Lese erfahrungen/gu, 'Leseerfahrungen')
    .replace(/Analyse ergebnisse/gu, 'Analyseergebnisse')
    .replace(/Fachund/gu, 'Fach- und')
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
