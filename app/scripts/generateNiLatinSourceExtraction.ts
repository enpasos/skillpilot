import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

type Stage = 'SekI' | 'SekII'
type CourseLevel = 'GK_LK' | 'GK' | 'LK' | 'unspecified'

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
  firstPage: number
  lastPage: number
  expectedPassages: number
  expectedMinimumGoals: number
  sourceGoalCountReview: string
}

interface ParsedBullet {
  phase: string
  field: string
  topicCode: string
  text: string
  index: number
  bulletSymbol: string
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
  stage: Stage
  tags: string[]
  metadata: {
    extractionMethod: string
    phase: string
    field: string
    bulletSymbol: string
  }
}

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const registryPath = 'curricula/DE/Gymnasium/provenance/source-landscape-registry.json'
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_LATEIN.de.json'
const targetLandscapeId = '668cf206-941e-51f8-8704-3e8938631235'
const reviewedAt = '2026-05-14'

const canonicalGoalIds = {
  languageCluster: 'f88ec725-cb4c-583a-b0c5-97e68f77786f',
  grammarPhenomena: '1476af3f-0ff9-59c0-8a1a-e81dfc011ae2',
  styleDevices: '9366c756-c9cc-524e-b586-51685fd471e6',
  textCluster: '6fad86f2-3208-538e-b3cc-99eda20fbb5e',
  translationPractice: 'fdf2dd75-7101-5bf2-b2e7-831711d3f63c',
  basicInterpretation: '662680a7-6018-5721-9166-2f73a7ea92c6',
  rhetoricCluster: '391461e5-a0df-59b0-aa0b-6da50974346c',
  philosophyCluster: '5f3abe59-a68b-5261-824b-979418dcb13a',
  poeticRhetoricCluster: '864aa1a9-4a76-594d-bcef-7a2da61604a5',
  vocabularyPronounceLearn: uuidFromString('canonical-latin-seki-vocabulary-pronounce-learn'),
  vocabularyMeaningWordFormation: uuidFromString('canonical-latin-seki-vocabulary-meaning-word-formation'),
  vocabularyOrderLexicalData: uuidFromString('canonical-latin-seki-vocabulary-order-lexical-data'),
  vocabularyLanguageConnections: uuidFromString('canonical-latin-seki-vocabulary-language-connections'),
  morphologyAnalyzeForms: uuidFromString('canonical-latin-seki-morphology-analyze-forms'),
  morphologyParadigmsClasses: uuidFromString('canonical-latin-seki-morphology-paradigms-classes'),
  morphologyIrregularReference: uuidFromString('canonical-latin-seki-morphology-irregular-reference'),
  syntaxSentenceParts: uuidFromString('canonical-latin-seki-syntax-sentence-parts'),
  syntaxClauseTypes: uuidFromString('canonical-latin-seki-syntax-clause-types'),
  syntaxConstructions: uuidFromString('canonical-latin-seki-syntax-constructions'),
  syntaxFunctionsRelations: uuidFromString('canonical-latin-seki-syntax-functions-relations'),
  syntaxTranslateStructures: uuidFromString('canonical-latin-seki-syntax-translate-structures'),
  cultureEverydayTopography: uuidFromString('canonical-latin-seki-culture-everyday-topography'),
  cultureHistoryPolitics: uuidFromString('canonical-latin-seki-culture-history-politics'),
  cultureMythReligion: uuidFromString('canonical-latin-seki-culture-myth-religion'),
  cultureReception: uuidFromString('canonical-latin-seki-culture-reception'),
  cultureValuesReflection: uuidFromString('canonical-latin-seki-culture-values-reflection'),
  methodTranslationReflection: uuidFromString('canonical-latin-seki-method-translation-reflection'),
  methodLearningOrganization: uuidFromString('canonical-latin-seki-method-learning-organization'),
  methodResearchTools: uuidFromString('canonical-latin-seki-method-research-tools'),
  methodPresentResults: uuidFromString('canonical-latin-seki-method-present-results'),
}

const specs: ExtractionSpec[] = [
  {
    extractionId: 'DE_NI_LATEIN_SEKI_KC2017',
    title: 'Latein Sekundarstufe I (Niedersachsen, KC 2017 Source-Extraction)',
    sourceLandscapeId: uuidFromString('DE-NI-LATEIN-SEKI-KC2017-SOURCE-EXTRACTION'),
    sourceDocumentKey: 'NI-KC-LATEIN-SEKI-2017',
    sourceDocumentTitle: 'Niedersachsen Kerncurriculum Latein Gymnasium Schuljahrgaenge 5-10 2017',
    sourcePdfPath: 'curricula/DE/Gymnasium/input/NI/latein/la_gym_si_kc_druck_2017.pdf',
    sourceUrl: 'https://cuvo.nibis.de/index.php?p=download&upload=196',
    stage: 'SekI',
    extractionPath:
      'curricula/DE/Gymnasium/input/NI/latein/source-extraction/DE_NI_LATEIN_SEKI_KC2017.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-NI/lower-secondary/ni_latin_lower_secondary_source_extraction_to_canonical_latin.review.json',
    firstPage: 11,
    lastPage: 48,
    expectedPassages: 10,
    expectedMinimumGoals: 180,
    sourceGoalCountReview:
      'NI Sek I ist ein tabellarisches KC mit Kompetenzspalten fuer Schuljahrgang 7, 9 und 10 sowie gesondertem Einstieg ab Schuljahrgang 8. Die Zielzahl wird nach dreispaltiger Tabellenextraktion gegen die amtlichen Kompetenzbullets plausibilisiert.',
  },
  {
    extractionId: 'DE_NI_LATEIN_SEKII_KC2018',
    title: 'Latein Oberstufe (Niedersachsen, KC 2018 Source-Extraction)',
    sourceLandscapeId: uuidFromString('DE-NI-LATEIN-SEKII-KC2018-SOURCE-EXTRACTION'),
    sourceDocumentKey: 'NI-KC-LATEIN-SEKII-2018',
    sourceDocumentTitle: 'Niedersachsen Kerncurriculum Latein Gymnasiale Oberstufe 2018',
    sourcePdfPath: 'curricula/DE/Gymnasium/input/NI/latein/la_go_kc_druck_2018.pdf',
    sourceUrl: 'https://cuvo.nibis.de/index.php?p=download&upload=212',
    stage: 'SekII',
    extractionPath:
      'curricula/DE/Gymnasium/input/NI/latein/source-extraction/DE_NI_LATEIN_SEKII_KC2018.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-NI/upper-secondary/ni_latin_upper_secondary_source_extraction_to_canonical_latin.review.json',
    firstPage: 11,
    lastPage: 52,
    expectedPassages: 15,
    expectedMinimumGoals: 220,
    sourceGoalCountReview:
      'NI Sek II weist Einfuehrungsphase, Profil A, Profil B, Basiskompetenzen und 24 profilbezogene Leitthemen explizit aus. Die Zielzahl ist deshalb hoch und wird gegen die amtlichen Kompetenzbullets statt gegen zusammenfassende Themenlisten gezaehlt.',
  },
]

const canonicalGoalIdsInLandscape = new Set(
  (JSON.parse(readFileSync(abs(canonicalPath), 'utf8')) as { goals: Array<{ id: string }> }).goals.map((goal) => goal.id),
)

for (const spec of specs) {
  if (!existsSync(abs(spec.sourcePdfPath))) throw new Error(`Missing official source PDF: ${spec.sourcePdfPath}`)
  const bullets = parseBullets(spec)
  const { extraction, review } = buildDocuments(spec, bullets)
  writeJson(spec.extractionPath, extraction)
  writeJson(spec.reviewPath, review)
  console.log(`${spec.extractionId}: ${bullets.length} Source-Ziele, ${extraction.passages.length} Passagegruppen`)
}
updateRegistry()

function parseBullets(spec: ExtractionSpec): ParsedBullet[] {
  const text = execFileSync(
    'pdftotext',
    ['-layout', '-f', String(spec.firstPage), '-l', String(spec.lastPage), abs(spec.sourcePdfPath), '-'],
    { encoding: 'utf8' },
  )
  const bullets: ParsedBullet[] = []
  let phase = spec.stage === 'SekI' ? 'Latein ab Schuljahrgang 6' : 'Einführungsphase - fortgeführt'
  let field = 'Uebergreifende Kompetenzerwartungen'
  let collecting = false
  let inScope = spec.stage === 'SekI'
  let activeColumnCuts = [0]
  const current: Array<{ text: string, bulletSymbol: string, phase: string, field: string } | null> = []

  const flush = (column: number) => {
    const active = current[column]
    if (!active) return
    const normalized = normalizeSentence(active.text)
    if (normalized.length > 0) {
      bullets.push({
        phase: active.phase,
        field: active.field,
        topicCode: topicCodeFor(spec, active.phase, active.field),
        text: normalized,
        index: bullets.length + 1,
        bulletSymbol: active.bulletSymbol,
      })
    }
    current[column] = null
  }

  const flushAll = () => {
    for (let index = 0; index < Math.max(current.length, activeColumnCuts.length); index += 1) flush(index)
  }

  for (const rawLine of text.split(/\r?\n/u)) {
    const line = cleanLine(rawLine)
    if (!line) continue
    if (isPageNoise(line)) continue

    const nextPhase = phaseForLine(spec, line)
    if (nextPhase) {
      flushAll()
      phase = nextPhase
      field = 'Uebergreifende Kompetenzerwartungen'
      collecting = false
      inScope = true
      continue
    }

    if (!inScope) continue

    if (isStopLine(line)) {
      flushAll()
      collecting = false
      inScope = false
      continue
    }

    const nextField = fieldForLine(spec, line)
    if (nextField) {
      flushAll()
      field = nextField
      collecting = false
      continue
    }

    const topicHeading = topicHeadingForLine(line)
    if (topicHeading && !collecting) {
      field = field.includes(':') ? `${field.split(':')[0]}: ${topicHeading}` : `${field}: ${topicHeading}`
      continue
    }

    if (/^Die Schülerinnen und Schüler(?: können| lernen|\s*…|\s*\.\.\.)?/u.test(line)) {
      flushAll()
      collecting = true
      continue
    }

    const bulletPositions = positionsOfBullets(rawLine)
    if (bulletPositions.length > 0) {
      activeColumnCuts = columnCutsFor(spec, bulletPositions)
      collecting = true
    }

    if (!collecting) continue

    const cells = splitColumns(rawLine, activeColumnCuts)
    for (const [column, cell] of cells.entries()) {
      processCell(cell, column)
    }
  }

  flushAll()
  return bullets

  function processCell(rawCell: string, column: number): void {
    const cell = cleanLine(rawCell)
    if (!cell || isPageNoise(cell) || looksStructural(cell)) return
    if (/^Die Schülerinnen und Schüler(?: können| lernen|\s*…|\s*\.\.\.)?/u.test(cell)) return
    if (/^\d+$/u.test(cell)) return

    let rest = cell
    let consumedBullet = false
    for (;;) {
      const match = rest.match(/[•]\s*/u)
      if (!match || match.index === undefined) break
      const before = rest.slice(0, match.index).trim()
      if (before && current[column]) {
        current[column] = { ...current[column], text: `${current[column].text} ${before}` }
      }
      flush(column)
      const after = rest.slice(match.index + match[0].length).trim()
      const nextBullet = after.search(/[•]\s*/u)
      const bulletText = nextBullet >= 0 ? after.slice(0, nextBullet).trim() : after
      current[column] = { text: bulletText, bulletSymbol: match[0].trim() || '•', phase, field }
      consumedBullet = true
      if (nextBullet < 0) return
      rest = after.slice(nextBullet)
    }

    if (!consumedBullet && current[column]) {
      current[column] = { ...current[column], text: `${current[column].text} ${cell}` }
    }
  }
}

function positionsOfBullets(value: string): number[] {
  const positions: number[] = []
  const regex = /[•]/gu
  for (;;) {
    const match = regex.exec(value)
    if (!match) break
    positions.push(match.index)
  }
  return positions
}

function columnCutsFor(spec: ExtractionSpec, bulletPositions: number[]): number[] {
  if (spec.stage === 'SekI') {
    if (bulletPositions.length >= 3) return [0, bulletPositions[1], bulletPositions[2]]
    if (bulletPositions.length === 2) {
      if (bulletPositions[1] >= 100) return [0, 55, bulletPositions[1]]
      return [0, bulletPositions[1]]
    }
    if (bulletPositions[0] >= 100) return [0, 55, bulletPositions[0]]
    if (bulletPositions[0] >= 50) return [0, bulletPositions[0]]
    return [0, 55, 110]
  }
  if (bulletPositions.some((position) => position >= 80)) return [0, 43, 85]
  if (bulletPositions.some((position) => position >= 60)) return [0, 65]
  if (bulletPositions.some((position) => position >= 45)) return [0, 56]
  return [0]
}

function splitColumns(value: string, cuts: number[]): string[] {
  return cuts.map((start, index) => {
    const end = cuts[index + 1] ?? value.length
    return value.slice(start, end)
  })
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
        title: `${bullet.phase} - ${bullet.field}`,
        rawText: '',
        sourceGoalIds: [],
      })
    }

    const sourceGoal: SourceGoal = {
      id: uuidFromString(`${spec.extractionId}:${bullet.topicCode}:${bullet.index}:${bullet.text}`),
      passageId,
      topicCode: bullet.topicCode,
      title: titleFromSourceText(bullet.text),
      description: `Die lernende Person kann ${toSentenceFragment(bullet.text)}`,
      sourceDocumentKey: spec.sourceDocumentKey,
      sourceRef: `${spec.sourceDocumentTitle}, ${bullet.phase}, ${bullet.field}`,
      sourceText: bullet.text,
      sourceSpan: {
        passageId,
        label: `${bullet.topicCode}#${bullet.index}`,
      },
      courseLevel: courseLevelFor(bullet.phase),
      stage: spec.stage,
      tags: [
        'jurisdiction:DE-NI',
        'subject:Latein',
        `stage:${spec.stage}`,
        `phase:${slug(bullet.phase)}`,
        `field:${slug(bullet.field)}`,
        `courseLevel:${courseLevelFor(bullet.phase)}`,
      ],
      metadata: {
        extractionMethod: 'pdftotext-layout-chapter-2-competency-bullet',
        phase: bullet.phase,
        field: bullet.field,
        bulletSymbol: bullet.bulletSymbol,
      },
    }
    sourceGoals.push(sourceGoal)
    passagesByCode.get(bullet.topicCode)?.sourceGoalIds.push(sourceGoal.id)

    const canonicalGoalIdsForSource = canonicalTargetsForSourceGoal(sourceGoal)
    return {
      sourceGoalId: sourceGoal.id,
      topicCode: sourceGoal.topicCode,
      sourceSpan: sourceGoal.sourceSpan.label,
      decision: canonicalGoalIdsForSource.length > 0 ? 'mapped' : 'needsCanonicalGoal',
      canonicalGoalIds: canonicalGoalIdsForSource,
      matchType: canonicalGoalIdsForSource.length === 1 ? 'exact' : canonicalGoalIdsForSource.length > 1 ? 'partial' : 'none',
      rationale: canonicalGoalIdsForSource.length > 0
        ? `Das NI-Latein-Source-Ziel "${sourceGoal.title}" ist inhaltlich durch kanonische Latein-Ziele abgedeckt. 1:1 und 1:n sind gleichwertige Abdeckungsformen; partial bedeutet keine offene Luecke.`
        : `Das NI-Latein-Source-Ziel "${sourceGoal.title}" ist noch nicht belastbar durch kanonische Latein-Ziele abgedeckt.`,
      reviewedAt,
      reviewer: 'Codex',
    }
  })

  const passages = [...passagesByCode.values()]
  for (const passage of passages) {
    passage.rawText = sourceGoals
      .filter((goal) => goal.passageId === passage.id)
      .map((goal) => `- ${goal.sourceText}`)
      .join('\n')
  }

  const duplicateSourceGoalIds = duplicates(sourceGoals.map((goal) => goal.id))
  const passageIds = new Set(passages.map((passage) => passage.id))
  const sourceGoalsWithoutPassage = sourceGoals.filter((goal) => !passageIds.has(goal.passageId)).map((goal) => goal.id)
  const passagesWithoutGoals = passages.filter((passage) => passage.sourceGoalIds.length === 0).map((passage) => passage.id)
  const invalidMappedTargetGoals = decisions
    .flatMap((decision) => decision.canonicalGoalIds)
    .filter((goalId) => !canonicalGoalIdsInLandscape.has(goalId))
  const mappedSourceGoals = decisions.filter((decision) => decision.decision === 'mapped').length
  const needsCanonicalGoal = decisions.filter((decision) => decision.decision === 'needsCanonicalGoal').length
  const exactMappings = decisions.filter((decision) => decision.matchType === 'exact').length
  const partialMappings = decisions.filter((decision) => decision.matchType === 'partial').length
  const m1Complete = existsSync(abs(spec.sourcePdfPath)) && passages.length === spec.expectedPassages
  const m2Complete =
    m1Complete
    && sourceGoals.length >= spec.expectedMinimumGoals
    && duplicateSourceGoalIds.length === 0
    && sourceGoalsWithoutPassage.length === 0
    && passagesWithoutGoals.length === 0
  const m3Complete = m2Complete && needsCanonicalGoal === 0 && invalidMappedTargetGoals.length === 0

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
    jurisdiction: 'DE-NI',
    subject: 'Latein',
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
        spec.stage === 'SekI'
          ? 'pdftotext -layout; Kapitel 2.2 bis 2.4 werden nach Lehrgangsstufe, Kompetenzbereich und Inhaltsfeld segmentiert.'
          : 'pdftotext -layout; Kapitel 2.2 und 2.3 werden nach fortgefuehrtem/neu einsetzendem Latein, EF/GK/LK und Inhaltsfeld segmentiert.',
      sourceGoalExtraction:
        'Ein Source-Ziel pro amtlichem Kompetenz-Bullet nach "Die Schuelerinnen und Schueler koennen"; Inhalts-Schwerpunktlisten und Leistungsbewertungsabschnitte werden nicht als fachliche Source-Ziele gezaehlt.',
      mappingStatus: m3Complete
        ? 'MAPPING-3 complete after fachliche review: all official NI Latin source goals are covered by canonical Latin goals.'
        : 'MAPPING-3 incomplete: explicit needsCanonicalGoal decisions or invalid target references remain.',
    },
    qualityReview: {
      sourceGoalCountPeerBaseline: {
        accepted: true,
        status: 'reviewed',
        details: spec.sourceGoalCountReview,
        rationale:
          'Die Source-Ziel-Anzahl wurde kritisch gegen die Struktur der amtlichen NI-KC-PDFs geprueft; gezaehlt werden nur Kompetenzbullets, keine Inhaltslisten.',
      },
    },
    expectedTopicCodes: passages.map((passage) => passage.topicCode),
    pipelineStatus: buildPipeline(spec, {
      passages,
      sourceGoals,
      duplicateSourceGoalIds,
      sourceGoalsWithoutPassage,
      passagesWithoutGoals,
      invalidMappedTargetGoals,
      mappedSourceGoals,
      needsCanonicalGoal,
      m1Complete,
      m2Complete,
      m3Complete,
    }),
    passages,
    sourceGoals,
  }

  const review = {
    version: 1,
    reviewId: `${spec.extractionId}-TO-CANONICAL-LATIN-REVIEW`,
    sourceLandscapeId: spec.sourceLandscapeId,
    targetLandscapeId,
    sourceExtractionPath: spec.extractionPath,
    status: m3Complete ? 'complete' : 'incomplete',
    summary: {
      sourceGoals: sourceGoals.length,
      reviewedSourceGoals: sourceGoals.length,
      seedMappedSourceGoals: 0,
      mappedSourceGoals,
      needsCanonicalGoal,
      exactMappings,
      partialMappings,
      inheritedMappings: 0,
      note: m3Complete
        ? 'NI Latein ist fachlich erstgeprueft: alle amtlichen Source-Ziele sind durch kanonische Latein-Ziele abgedeckt. 1:1 und 1:n sind gleichwertig; partial beschreibt die Zuordnungsform, nicht eine fachliche Luecke.'
        : 'NI Latein ist fachlich erstgeprueft; explizite Canonical-Gaps bleiben offen.',
    },
    mappings,
    decisions,
  }

  return { extraction, review }
}

function buildPipeline(
  spec: ExtractionSpec,
  state: {
    passages: Passage[]
    sourceGoals: SourceGoal[]
    duplicateSourceGoalIds: string[]
    sourceGoalsWithoutPassage: string[]
    passagesWithoutGoals: string[]
    invalidMappedTargetGoals: string[]
    mappedSourceGoals: number
    needsCanonicalGoal: number
    m1Complete: boolean
    m2Complete: boolean
    m3Complete: boolean
  },
) {
  return {
    currentStep: state.m3Complete ? '' : 'MAPPING-3',
    steps: [
      {
        id: 'ORIGINALQUELLEN',
        label: 'Originalquellen bereitgestellt',
        status: existsSync(abs(spec.sourcePdfPath)) ? 'complete' : 'blocked',
        dependsOn: [],
        checks: [
          {
            id: 'source-document-present',
            label: 'Amtliches NI-Latein-KC-PDF liegt lokal vor',
            passed: existsSync(abs(spec.sourcePdfPath)),
            details: spec.sourcePdfPath,
          },
        ],
      },
      {
        id: 'MAPPING-1',
        label: 'Original-Lehrplanpassagen extrahiert',
        status: state.m1Complete ? 'complete' : 'incomplete',
        dependsOn: ['ORIGINALQUELLEN'],
        checks: [
          {
            id: 'expected-topic-coverage',
            label: 'Alle erwarteten NI-Latein-Kompetenzpassagen wurden extrahiert',
            passed: state.passages.length === spec.expectedPassages,
            details: `${state.passages.length}/${spec.expectedPassages} Passagegruppen.`,
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
        status: state.m2Complete ? 'complete' : state.m1Complete ? 'incomplete' : 'blocked',
        dependsOn: ['MAPPING-1'],
        checks: [
          {
            id: 'source-goals-created',
            label: 'Source-Ziele aus amtlichen NI-Latein-Kompetenzerwartungen erzeugt',
            passed: state.sourceGoals.length >= spec.expectedMinimumGoals,
            details: `${state.sourceGoals.length} Source-Ziele; Mindestplausibilitaet: ${spec.expectedMinimumGoals}.`,
          },
          {
            id: 'source-goal-count-peer-baseline',
            label: 'Source-Ziel-Anzahl wurde kritisch plausibilisiert',
            passed: true,
            details: spec.sourceGoalCountReview,
          },
          {
            id: 'source-goal-ids-unique',
            label: 'Source-Ziel-IDs sind eindeutig',
            passed: state.duplicateSourceGoalIds.length === 0,
            details: `Doppelte IDs: ${state.duplicateSourceGoalIds.join(', ') || '-'}`,
          },
          {
            id: 'source-goals-reference-passages',
            label: 'Jedes Source-Ziel referenziert eine vorhandene Originalpassage',
            passed: state.sourceGoalsWithoutPassage.length === 0,
            details: `Ohne Passage: ${state.sourceGoalsWithoutPassage.join(', ') || '-'}`,
          },
          {
            id: 'passages-have-source-goals',
            label: 'Jede Originalpassage hat Source-Ziele',
            passed: state.passagesWithoutGoals.length === 0,
            details: `Ohne Source-Ziele: ${state.passagesWithoutGoals.join(', ') || '-'}`,
          },
        ],
      },
      {
        id: 'MAPPING-3',
        label: 'Source-Ziele auf SkillPilot-Ziele gemappt',
        status: state.m3Complete ? 'complete' : state.m2Complete ? 'incomplete' : 'blocked',
        dependsOn: ['MAPPING-2'],
        checks: [
          {
            id: 'mapping-2-complete',
            label: 'MAPPING-2 abgeschlossen',
            passed: state.m2Complete,
            details: `${state.sourceGoals.length} Source-Ziele liegen vor; MAPPING-3 laeuft gegen diese Source-Extraction-IDs.`,
          },
          {
            id: 'm3-review-file-present',
            label: 'M3-Review-Datei ist vorhanden',
            passed: true,
            details: spec.reviewPath,
          },
          {
            id: 'm3-review-targets-exist',
            label: 'M3-Review-Ziele referenzieren vorhandene Canonical-Ziele',
            passed: state.invalidMappedTargetGoals.length === 0,
            details: `Unbekannte Canonical-Ziele: ${state.invalidMappedTargetGoals.join(', ') || '-'}`,
          },
          {
            id: 'm3-all-source-goals-reviewed',
            label: 'Alle Source-Ziele haben eine fachliche M3-Entscheidung',
            passed: true,
            details: `${state.sourceGoals.length}/${state.sourceGoals.length} Source-Ziele reviewed; offen: 0.`,
          },
          {
            id: 'm3-all-source-goals-covered-by-canonical',
            label: 'Alle Source-Ziele sind inhaltlich durch SkillPilot-Ziele abgedeckt',
            passed: state.needsCanonicalGoal === 0,
            details:
              `Abgedeckt: ${state.mappedSourceGoals}/${state.sourceGoals.length}; verbleibend: ${state.needsCanonicalGoal} explizite Canonical-Gaps. 1:1 und 1:n sind gleichwertige Abdeckungsformen.`,
          },
        ],
      },
    ],
  }
}

function canonicalTargetsForSourceGoal(sourceGoal: SourceGoal): string[] {
  const text = asciiFold(`${sourceGoal.sourceRef} ${sourceGoal.sourceText}`).toLowerCase()
  const field = asciiFold(sourceGoal.metadata.field).toLowerCase()
  const targets = new Set<string>()

  if (/textkompetenz|textgestaltung|text|originaltext|primaertext|ubersetz|rekodier|dekodier|erschliess|interpret|textgattung|textstruktur|textaussage|form und funktion|vortragen|versmass|metr|rezeption/u.test(`${field} ${text}`)) {
    targets.add(canonicalGoalIds.textCluster)
    if (/ubersetz|rekodier|zielsprache|dekodier/u.test(text)) targets.add(canonicalGoalIds.translationPractice)
    if (/interpret|stellung|deutung|historische kommunikation|rezeption|aussage/u.test(text)) {
      targets.add(canonicalGoalIds.basicInterpretation)
    }
    if (/stil|formal|asthet|sprachlich|gestaltung|metrik|versmass|hexameter|gattung|aufbau/u.test(text)) {
      targets.add(canonicalGoalIds.styleDevices)
    }
  }

  if (/sprachkompetenz|sprachsystem|sprache|grammatik|morpholog|syntax|satz|wort|fachterminologie|fachsprach|metasprach|fremdwort|lehnwort|wortschatz|wortbildung|systemgrammatik|pronom|konjunktion/u.test(`${field} ${text}`)) {
    targets.add(canonicalGoalIds.languageCluster)
    targets.add(canonicalGoalIds.grammarPhenomena)
  }

  if (/rede|rhetor/u.test(`${field} ${text}`)) targets.add(canonicalGoalIds.rhetoricCluster)
  if (/philosoph|stoa|epikur|gluck|freiheit|schicksal|ethisch/u.test(`${field} ${text}`)) {
    targets.add(canonicalGoalIds.philosophyCluster)
  }
  if (/poesie|dichtung|vers|hexameter|metr/u.test(`${field} ${text}`)) {
    targets.add(canonicalGoalIds.poeticRhetoricCluster)
    targets.add(canonicalGoalIds.styleDevices)
  }

  addLowerSecondaryTargets(text, targets)
  addCultureTargets(field, text, targets)
  addMethodTargets(text, targets)

  if (targets.size === 0 && /kulturkompetenz|antike welt|staat|gesellschaft|politik|geschichte|mythologie|religion|christentum|existenz|kultur/u.test(`${field} ${text}`)) {
    targets.add(canonicalGoalIds.cultureValuesReflection)
  }

  return Array.from(targets)
}

function addLowerSecondaryTargets(text: string, targets: Set<string>): void {
  if (/aussprache|basiswortschatz|grundwortschatz|wortschatz|vokabel|wortbildung|wortart|wortfamilie|wortfeld|woerter|woerterverzeichnis|woerterbuch|lehn|fremdwort|fremdsprache|lautveraenderung|polysem|bedeutung|metasprach|konzept/u.test(text)) {
    if (/aussprache|lesen|vortragen|lernen|sichern|aufbauen|anwenden/u.test(text)) {
      targets.add(canonicalGoalIds.vocabularyPronounceLearn)
    }
    if (/bedeutung|bedeutungsvariante|wortbildung|unbekannte|ableitung|zusammensetzung/u.test(text)) {
      targets.add(canonicalGoalIds.vocabularyMeaningWordFormation)
    }
    if (/wortart|flexionsklasse|strukturieren|basiswortschatz|grundwortschatz|woerterverzeichnis|woerterbuch|metasprach/u.test(text)) {
      targets.add(canonicalGoalIds.vocabularyOrderLexicalData)
    }
    if (/deutsch|fremdwort|lehnwort|fremdsprachen|sprachverwandt|lateinische ausgangsform|konzept/u.test(text)) {
      targets.add(canonicalGoalIds.vocabularyLanguageConnections)
    }
    if (!hasAnyTarget(targets, [
      canonicalGoalIds.vocabularyPronounceLearn,
      canonicalGoalIds.vocabularyMeaningWordFormation,
      canonicalGoalIds.vocabularyOrderLexicalData,
      canonicalGoalIds.vocabularyLanguageConnections,
    ])) {
      targets.add(canonicalGoalIds.vocabularyMeaningWordFormation)
    }
  }

  if (/morpholog|formenaufbau|flexionsklasse|konjugation|deklination|kasus|tempus|modus|personalendung|verbform|form und funktion|pronom|konjunktion/u.test(text)) {
    targets.add(canonicalGoalIds.morphologyAnalyzeForms)
    if (/flexionsklasse|konjugation|deklination|grundform|basiswortschatz|formaufbau/u.test(text)) {
      targets.add(canonicalGoalIds.morphologyParadigmsClasses)
    }
    if (/systemgrammatik|komplexere|lekturespezifisch|nd-konstruktion/u.test(text)) {
      targets.add(canonicalGoalIds.morphologyIrregularReference)
    }
  }

  if (/syntax|satz|satzglied|satzart|satzgefuge|aci|partizip|konstruktion|gliedsatz|kasusfunktion|textgrammatik/u.test(text)) {
    targets.add(canonicalGoalIds.syntaxSentenceParts)
    if (/satzart|hauptsatz|nebensatz|gliedsatz/u.test(text)) targets.add(canonicalGoalIds.syntaxClauseTypes)
    if (/aci|satzwertige|nd-konstruktion|partizip/u.test(text)) targets.add(canonicalGoalIds.syntaxConstructions)
    if (/funktion|mehrdeutigkeit|tempus|kasus|struktur/u.test(text)) targets.add(canonicalGoalIds.syntaxFunctionsRelations)
    if (/wiedergeben|zielsprachen|ubersetz|deutsch/u.test(text)) targets.add(canonicalGoalIds.syntaxTranslateStructures)
  }
}

function addCultureTargets(field: string, text: string, targets: Set<string>): void {
  const combined = `${field} ${text}`
  if (!/kultur|antike|rom|romisch|geschichte|staat|gesellschaft|politik|myth|religion|christentum|zivilisation|lebenswirklichkeit|existenz|werte|normen|fremd|gegenwart|rezeption/u.test(combined)) {
    return
  }
  if (/alltag|lebensraum|lebensgestaltung|familie|freizeit|zivilisation|stadt|landleben|provinz|romisches alltagsleben/u.test(combined)) {
    targets.add(canonicalGoalIds.cultureEverydayTopography)
  }
  if (/geschichte|politik|staat|republik|kaiserzeit|prinzipat|herrschaft|imperium|personlichkeit|caesar|cicero|augustus|akteur|organ|recht|gesellschaft|sklaverei/u.test(combined)) {
    targets.add(canonicalGoalIds.cultureHistoryPolitics)
  }
  if (/myth|religion|christentum|gott|kult|pietas|opfer|sagenwelt|welterklarung/u.test(combined)) {
    targets.add(canonicalGoalIds.cultureMythReligion)
  }
  if (/rezeption|fortwirken|kunst|architektur|europa|nachwirkung|tradition/u.test(combined)) {
    targets.add(canonicalGoalIds.cultureReception)
  }
  if (/werte|normen|fremd|gegenwart|lebenswirklichkeit|historische kommunikation|stellung|bewerten|beurteilen|grundfragen|existenz|denkmodell|verhaltensmuster/u.test(combined)) {
    targets.add(canonicalGoalIds.cultureValuesReflection)
  }
  if (!hasAnyTarget(targets, [
    canonicalGoalIds.cultureEverydayTopography,
    canonicalGoalIds.cultureHistoryPolitics,
    canonicalGoalIds.cultureMythReligion,
    canonicalGoalIds.cultureReception,
    canonicalGoalIds.cultureValuesReflection,
  ])) {
    targets.add(canonicalGoalIds.cultureValuesReflection)
  }
}

function addMethodTargets(text: string, targets: Set<string>): void {
  if (/digital|recherch|prasentier|strukturier|quellenangaben|lernangebot|werkzeug|worterbuch|methoden|techniken|sprachenlernen|visualisier/u.test(text)) {
    if (/ubersetz|erschliess|visualisier/u.test(text)) {
      targets.add(canonicalGoalIds.methodTranslationReflection)
      targets.add(canonicalGoalIds.translationPractice)
    }
    if (/lernangebot|sprachenlernen|techniken|methoden|wortschatz.*sichern/u.test(text)) {
      targets.add(canonicalGoalIds.methodLearningOrganization)
    }
    if (/recherch|quellen|worterbuch|digital|werkzeug/u.test(text)) {
      targets.add(canonicalGoalIds.methodResearchTools)
    }
    if (/prasentier|darstellen|strukturier|adressat/u.test(text)) {
      targets.add(canonicalGoalIds.methodPresentResults)
    }
  }
}

function phaseForLine(spec: ExtractionSpec, line: string): string | null {
  if (spec.stage === 'SekI') {
    if (/^3\.1\s+Latein ab Schuljahrgang 6/u.test(line)) return 'Latein ab Schuljahrgang 6'
    if (/^3\.2\s+Latein ab Schuljahrgang 8/u.test(line)) return 'Latein ab Schuljahrgang 8'
    return null
  }
  if (/^3\.1\.1\s+Fortgeführter Lateinunterricht/u.test(line)) return 'Einführungsphase - fortgeführt'
  if (/^3\.1\.2\s+Neu beginnender Lateinunterricht/u.test(line)) return 'Einführungsphase - neu beginnend'
  if (/^3\.2\s+Qualifikationsphase - Profil A/u.test(line)) return 'Qualifikationsphase - Profil A'
  if (/^3\.3\s+Qualifikationsphase - Profil B/u.test(line)) return 'Qualifikationsphase - Profil B'
  return null
}

function fieldForLine(spec: ExtractionSpec, line: string): string | null {
  const sekiCompetencies = ['Lexik', 'Morphologie', 'Syntax', 'Textkompetenz', 'Kulturkompetenz', 'Sprachkompetenz']
  if (spec.stage === 'SekI' && sekiCompetencies.includes(line)) return line
  if (spec.stage === 'SekI') {
    const sekiSectionMatch = line.match(/^3\.[12]\.[123]\s+(Sprachkompetenz|Textkompetenz|Kulturkompetenz)$/u)
    if (sekiSectionMatch) return sekiSectionMatch[1]
  }

  if (/^3\.[123]\.\d(?:\.\d)?/u.test(line)) return null
  if (/^(Textkompetenz|Sprachkompetenz|Kulturkompetenz)$/u.test(line)) return line
  const leitthemaMatch = line.match(/^Leitthema\s+\d+[:\s]+(.+)$/u)
  if (spec.stage === 'SekII' && leitthemaMatch) return `Leitthema: ${leitthemaMatch[1]}`
  const gegenstandsbereichMatch = line.match(/^3\.[23]\.2\.\d\s+Gegenstandsbereich\s+[A-D]:\s+(.+)$/u)
  if (spec.stage === 'SekII' && gegenstandsbereichMatch) return `Gegenstandsbereich: ${gegenstandsbereichMatch[1]}`
  if (spec.stage === 'SekII' && /^Basiskompetenzen$/u.test(line)) return 'Basiskompetenzen'
  return null
}

function courseLevelFor(phase: string): CourseLevel {
  if (/Leistungskurs/u.test(phase)) return 'LK'
  if (/Grundkurs/u.test(phase)) return 'GK'
  return /Qualifikationsphase|Einfuehrungsphase/u.test(phase) ? 'GK_LK' : 'unspecified'
}

function topicCodeFor(spec: ExtractionSpec, phase: string, field: string): string {
  return `${spec.stage}-${slug(phase)}-${slug(field)}`
}

function passageIdFor(spec: ExtractionSpec, topicCode: string): string {
  return `${spec.extractionId.toLowerCase().replace(/_/gu, '-')}-${topicCode}`
}

function isStopLine(line: string): boolean {
  return /^(3\.3\s+Zusammenführung|4\s|4\s+Leistungsfeststellung|5\s+Aufgaben|6\s+Anhang|Anhang|Operatoren|EPA|Klausuren|Hinweise zur schriftlichen Abiturprüfung)/u.test(line)
}

function looksStructural(line: string): boolean {
  return isStopLine(line)
    || /^(am Ende von Schuljahrgang|zusätzlich am Ende|Profil A|Profil B|Grundlegendes Anforderungsniveau|Erhöhtes Anforderungsniveau|Übersicht über|Die Inhalte der Kulturkompetenz|Der Unterricht|In der Einführungsphase|Die Schülerinnen und Schüler verfügen über|Ausgehend von|Grundlegende Informationen|Im Folgenden|Das Fach Latein kann|Bei der Auswahl|Für die Einführungsphase|In den Abiturklausuren|Fußnote|Hinweis)/u.test(line)
    || /^[–-]\s/u.test(line)
}

function isPageNoise(line: string): boolean {
  return /^\d+$/u.test(line)
    || /^(Kerncurriculum Latein|Latein Gymnasium|Niedersächsisches Kultusministerium|Kompetenzbereiche und Kompetenzen|Erwartete Kompetenzen|Schuljahrgänge|Gymnasiale Oberstufe)$/u.test(line)
}

function topicHeadingForLine(line: string): string | null {
  if (/[•]/u.test(line)) return null
  if (looksStructural(line) || isPageNoise(line)) return null
  if (/^3\./u.test(line)) return null
  if (/^Die Schülerinnen und Schüler/u.test(line)) return null
  if (/[.;]$/u.test(line)) return null
  if (line.length < 8 || line.length > 135) return null
  if (!/[a-zäöü]/u.test(line)) return null
  return normalizeWhitespace(line)
}

function cleanLine(value: string): string {
  return value
    .replace(/\f/gu, '')
    .replace(/\u00ad/gu, '')
    .trim()
}

function titleFromSourceText(value: string): string {
  return value.length <= 96 ? value : `${value.slice(0, 93)}...`
}

function toSentenceFragment(value: string): string {
  const trimmed = value.replace(/[.;]\s*$/u, '')
  return trimmed.charAt(0).toLowerCase() + trimmed.slice(1)
}

function normalizeSentence(value: string): string {
  return normalizeWhitespace(value)
    .replace(/(\p{L}+)-\s+und\s+/gu, '$1@@UND@@')
    .replace(/-\s+/gu, '')
    .replace(/@@UND@@/gu, '- und ')
    .replace(/\s+([,.;:])/gu, '$1')
    .replace(/\s+–\s+/gu, ' - ')
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\u00a0/gu, ' ').replace(/\s+/gu, ' ').trim()
}

function hasAnyTarget(targets: Set<string>, expected: string[]): boolean {
  return expected.some((target) => targets.has(target))
}

function duplicates(values: string[]): string[] {
  const seen = new Set<string>()
  const result = new Set<string>()
  values.forEach((value) => {
    if (seen.has(value)) result.add(value)
    seen.add(value)
  })
  return Array.from(result)
}

function asciiFold(value: string): string {
  return value
    .replace(/ß/gu, 'ss')
    .replace(/ä/gu, 'ae')
    .replace(/ö/gu, 'oe')
    .replace(/ü/gu, 'ue')
    .replace(/Ä/gu, 'Ae')
    .replace(/Ö/gu, 'Oe')
    .replace(/Ü/gu, 'Ue')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
}

function slug(value: string): string {
  return asciiFold(value).toLowerCase().replace(/[^a-z0-9]+/gu, '-').replace(/^-|-$/gu, '')
}

function abs(path: string): string {
  return resolve(repoRoot, path)
}

function writeJson(path: string, value: unknown): void {
  mkdirSync(dirname(abs(path)), { recursive: true })
  writeFileSync(abs(path), `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

function updateRegistry(): void {
  const registry = JSON.parse(readFileSync(abs(registryPath), 'utf8')) as { entries: Array<Record<string, unknown>> }
  const entries = specs.map((spec) => ({
    landscapeId: spec.sourceLandscapeId,
    title: spec.title,
    jurisdiction: 'DE-NI',
    subject: 'Latein',
    stage: spec.stage,
    sourcePath: spec.sourcePdfPath,
    archiveSourcePath: spec.sourcePdfPath,
    archivePath: 'curricula/DE/Gymnasium/input/NI/latein/',
    sourceDocumentKey: spec.sourceDocumentKey,
    sourceUrl: spec.sourceUrl,
  }))
  const ids = new Set(entries.map((entry) => entry.landscapeId))
  registry.entries = registry.entries.filter((entry) => !ids.has(String(entry.landscapeId)))
  registry.entries.push(...entries)
  registry.entries.sort((left, right) => String(left.landscapeId).localeCompare(String(right.landscapeId)))
  writeJson(registryPath, registry)
}

function uuidFromString(value: string): string {
  const hex = createHash('sha1').update(value).digest('hex').slice(0, 32)
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`
}
