import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

interface SourceLandscape {
  landscapeId: string
  subject: string
  goals: SourceGoalNode[]
}

interface SourceGoalNode {
  id: string
  title: string
  description?: string
  contains?: string[]
  tags?: string[]
}

interface SourceDocument {
  key: string
  title: string
  path: string
  role: string
  official: true
  url: string
}

interface Passage {
  id: string
  topicCode: string
  title: string
  text: string
  sourcePath: string
  sourceUrl: string
  rawText: string
  sourceGoalIds: string[]
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
  courseLevel: 'GK_LK' | 'LK' | 'unspecified'
  granularity: 'officialCompetency'
  tags: string[]
  rawSourceText: string
  rawSourceSpan: string
  rawParentBulletText: string
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

interface ExtractionSpec {
  extractionId: string
  title: string
  sourceLandscapeId: string
  subject: string
  stage: string
  sourcePath: string
  outputPath: string
  reviewPath: string
  legacyMappingPath: string
  canonicalLandscapeId: string
  sourceDocument: SourceDocument
  expectedPassages: number
  expectedSourceGoals: number
  sourceGoalCountReview: {
    accepted: boolean
    details: string
  }
  passageTitlePattern: RegExp
  topicCode: (passage: SourceGoalNode, parent: SourceGoalNode | undefined) => string
  stageFromTopicCode: (topicCode: string) => 'SekI' | 'SekII'
}

const appRoot = process.cwd()
const repoRoot = path.resolve(appRoot, '..')
const canonicalChemistryLandscapeId = 'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0'

function absoluteRepoPath(repoRelativePath: string): string {
  return path.resolve(repoRoot, repoRelativePath)
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/gu, ' ').trim()
}

function normalizeTopicPart(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^A-Za-z0-9]+/gu, '_')
    .replace(/^_+|_+$/gu, '')
    .toUpperCase()
}

function parentByChild(goals: SourceGoalNode[]): Map<string, SourceGoalNode> {
  const result = new Map<string, SourceGoalNode>()
  goals.forEach((goal) => {
    goal.contains?.forEach((childId) => {
      if (!result.has(childId)) {
        result.set(childId, goal)
      }
    })
  })
  return result
}

function chemistryTopicCode(title: string): string {
  const year = title.match(/C(\d+)/u)?.[1]
  const learningArea = title.match(/Lernbereich\s+(\d+)/u)?.[1]
  if (!year || !learningArea) throw new Error(`Cannot derive chemistry topic code from passage title: ${title}`)

  const level = /erhöhtes Anforderungsniveau/u.test(title)
    ? '-EA'
    : /grundlegendes Anforderungsniveau/u.test(title)
      ? '-GA'
      : ''
  const profile = title.match(/Chemie\s+\d+\s+\(([^)]+)\)/u)?.[1]
  const profileSuffix = profile && !level ? `-${normalizeTopicPart(profile)}` : ''
  return `C${year}${level}${profileSuffix}.${learningArea}`
}

function bcpTopicCode(title: string, parent: SourceGoalNode | undefined): string {
  const year = parent?.title.match(/Jahrgangsstufe\s+(\d+)/u)?.[1]
  const learningArea = title.match(/Lernbereich\s+(\d+)/u)?.[1]
  if (!year || !learningArea) {
    throw new Error(`Cannot derive BcP topic code from passage title: ${title}`)
  }
  return `BcP${year}.${learningArea}`
}

function sourceRef(subject: string, topicCode: string, bulletIndex: number): string {
  return `LehrplanPLUS Bayern Gymnasium ${subject}, ${topicCode}.${bulletIndex}`
}

function courseLevelFromTitle(title: string): 'GK_LK' | 'LK' | 'unspecified' {
  if (/erhöhtes Anforderungsniveau/u.test(title)) return 'LK'
  if (/grundlegendes Anforderungsniveau/u.test(title)) return 'GK_LK'
  return 'unspecified'
}

function isSourceGoalNode(goal: SourceGoalNode): boolean {
  return !(goal.contains?.length)
    && !(goal.tags ?? []).includes('Motivation')
    && !/^Warum /u.test(goal.title)
    && normalizeWhitespace(goal.description ?? '').length > 0
}

function buildExtraction(
  spec: ExtractionSpec,
  source: SourceLandscape,
): { passages: Passage[], sourceGoals: SourceGoal[], expectedTopicCodes: string[] } {
  const goalsById = new Map(source.goals.map((goal) => [goal.id, goal]))
  const directParentByChild = parentByChild(source.goals)
  const passageNodes = source.goals.filter((goal) =>
    Boolean(goal.contains?.length) && spec.passageTitlePattern.test(goal.title))
  const passages: Passage[] = []
  const sourceGoals: SourceGoal[] = []

  passageNodes.forEach((passageNode) => {
    const parent = directParentByChild.get(passageNode.id)
    const topicCode = spec.topicCode(passageNode, parent)
    const stage = spec.stageFromTopicCode(topicCode)
    const courseLevel = courseLevelFromTitle(passageNode.title)
    const childGoals = (passageNode.contains ?? [])
      .map((childId) => goalsById.get(childId))
      .filter((goal): goal is SourceGoalNode => Boolean(goal) && isSourceGoalNode(goal))

    const passage: Passage = {
      id: passageNode.id,
      topicCode,
      title: passageNode.title,
      text: childGoals.map((goal, index) => `${index + 1}) ${normalizeWhitespace(goal.description ?? goal.title)}`).join('\n'),
      sourcePath: spec.sourcePath,
      sourceUrl: spec.sourceDocument.url,
      rawText: passageNode.title,
      sourceGoalIds: childGoals.map((goal) => goal.id),
    }
    passages.push(passage)

    childGoals.forEach((goal, index) => {
      const description = normalizeWhitespace(goal.description ?? goal.title)
      sourceGoals.push({
        id: goal.id,
        passageId: passage.id,
        topicCode,
        bulletIndex: index + 1,
        aspectIndex: 1,
        title: normalizeWhitespace(goal.title),
        description,
        sourceText: description,
        sourceSpan: `${topicCode}.${index + 1}`,
        parentBulletText: description,
        sourceRef: sourceRef(spec.subject, topicCode, index + 1),
        courseLevel,
        granularity: 'officialCompetency',
        tags: [
          'jurisdiction:DE-BY',
          `stage:${stage}`,
          `courseLevel:${courseLevel}`,
          `topic:${topicCode}`,
        ],
        rawSourceText: description,
        rawSourceSpan: `${topicCode}.${index + 1}`,
        rawParentBulletText: description,
      })
    })
  })

  return {
    passages,
    sourceGoals,
    expectedTopicCodes: passages.map((passage) => passage.topicCode),
  }
}

function buildPipeline(
  spec: ExtractionSpec,
  parsed: { passages: Passage[], sourceGoals: SourceGoal[] },
): { version: 1, currentStep: string, steps: PipelineStep[] } {
  const sourcePathPresent = existsSync(absoluteRepoPath(spec.sourcePath))
  const passageIds = new Set(parsed.passages.map((passage) => passage.id))
  const duplicateSourceGoalIds = parsed.sourceGoals
    .map((sourceGoal) => sourceGoal.id)
    .filter((id, index, ids) => ids.indexOf(id) !== index)
  const missingPassageRefs = parsed.sourceGoals
    .filter((sourceGoal) => !passageIds.has(sourceGoal.passageId))
    .map((sourceGoal) => sourceGoal.id)
  const emptySourceTexts = parsed.sourceGoals
    .filter((sourceGoal) => sourceGoal.sourceText.length === 0)
    .map((sourceGoal) => sourceGoal.id)
  const m1Complete = sourcePathPresent && parsed.passages.length === spec.expectedPassages
  const m2Complete = m1Complete
    && parsed.sourceGoals.length === spec.expectedSourceGoals
    && duplicateSourceGoalIds.length === 0
    && missingPassageRefs.length === 0
    && emptySourceTexts.length === 0

  const steps: PipelineStep[] = [
    {
      id: 'MAPPING-1',
      label: 'Original-Lehrplanpassagen extrahiert',
      status: m1Complete ? 'complete' : 'incomplete',
      dependsOn: [],
      checks: [
        {
          id: 'source-document-present',
          label: `Strukturierte LehrplanPLUS-${spec.subject}-Quelle liegt lokal vor`,
          passed: sourcePathPresent,
          details: spec.sourcePath,
        },
        {
          id: 'topic-passages-extracted',
          label: `Alle zieltragenden LehrplanPLUS-${spec.subject}-Lernbereiche sind als Passagen extrahiert`,
          passed: parsed.passages.length === spec.expectedPassages,
          details: `Erfasst: ${parsed.passages.length}/${spec.expectedPassages} Passagen.`,
        },
        {
          id: 'no-legacy-snapshot-counted',
          label: 'Kein alter Pilot-Quellsnapshot wird als Passage-Extraction gewertet',
          passed: true,
          details: `Verwendet wird ${spec.sourcePath} als strukturierte LehrplanPLUS-Quelle; alte Mappingdateien werden nur als M3-Seed verwendet.`,
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
          label: 'Aus den LehrplanPLUS-Kompetenzerwartungen wurden Source-Ziele erzeugt',
          passed: parsed.sourceGoals.length === spec.expectedSourceGoals,
          details: `${parsed.sourceGoals.length}/${spec.expectedSourceGoals} Source-Ziele`,
        },
        {
          id: 'source-goal-ids-unique',
          label: 'Source-Ziel-IDs sind eindeutig',
          passed: duplicateSourceGoalIds.length === 0,
          details: `Doppelte IDs: ${duplicateSourceGoalIds.length > 0 ? duplicateSourceGoalIds.join(', ') : '-'}`,
        },
        {
          id: 'source-goals-reference-passages',
          label: 'Jedes Source-Ziel referenziert eine vorhandene Originalpassage',
          passed: missingPassageRefs.length === 0,
          details: `Ohne Passage: ${missingPassageRefs.length > 0 ? missingPassageRefs.join(', ') : '-'}`,
        },
        {
          id: 'source-goal-text-present',
          label: 'Jedes Source-Ziel enthält den LehrplanPLUS-Originaltext',
          passed: emptySourceTexts.length === 0,
          details: `Ohne Text: ${emptySourceTexts.length > 0 ? emptySourceTexts.join(', ') : '-'}`,
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
            ? `${parsed.sourceGoals.length} Source-Ziele liegen vor; MAPPING-3 kann gegen diese Source-Extraction-IDs laufen.`
            : 'MAPPING-3 wartet auf vollständige Source-Ziele.',
        },
        {
          id: 'm3-review-file-present',
          label: 'M3-Review-Datei ist vorhanden',
          passed: existsSync(absoluteRepoPath(spec.reviewPath)),
          details: spec.reviewPath,
        },
        {
          id: 'm3-review-decisions-reference-source-goals',
          label: 'M3-Review-Entscheidungen referenzieren gültige Source-Ziele',
          passed: false,
          details: 'Noch keine fachlichen M3-Review-Entscheidungen; die Datei enthält nur Seed-Mappingkanten.',
        },
        {
          id: 'm3-review-targets-exist',
          label: 'M3-Review-Ziele referenzieren vorhandene Canonical-Ziele',
          passed: false,
          details: 'Wird nach fachlicher M3-Review gegen den kanonischen Chemiegraphen geprüft.',
        },
        {
          id: 'm3-all-source-goals-reviewed',
          label: 'Alle Source-Ziele haben eine fachliche M3-Entscheidung',
          passed: false,
          details: `0/${parsed.sourceGoals.length} Source-Ziele fachlich reviewed.`,
        },
        {
          id: 'm3-all-source-goals-covered-by-canonical',
          label: 'Alle Source-Ziele sind durch SkillPilot-Ziele abgedeckt',
          passed: false,
          details: 'Offen: Seed-Mappingkanten sind noch keine abgeschlossene fachliche Abdeckung.',
        },
      ],
    },
  ]

  return {
    version: 1,
    currentStep: m2Complete ? 'MAPPING-3' : steps.find((step) => step.status !== 'complete')?.id ?? '',
    steps,
  }
}

function writeReviewSeed(spec: ExtractionSpec, parsed: { sourceGoals: SourceGoal[] }): void {
  const reviewAbsolutePath = absoluteRepoPath(spec.reviewPath)
  const legacyMappingAbsolutePath = absoluteRepoPath(spec.legacyMappingPath)
  if (!existsSync(legacyMappingAbsolutePath)) return

  const legacyMapping = JSON.parse(readFileSync(legacyMappingAbsolutePath, 'utf8')) as {
    mappings?: Array<{ legacyGoalId?: string; canonicalGoalId?: string; matchType?: string }>
  }
  const sourceGoalIds = new Set(parsed.sourceGoals.map((sourceGoal) => sourceGoal.id))
  const mappings = (legacyMapping.mappings ?? [])
    .filter((mapping) =>
      typeof mapping.legacyGoalId === 'string'
      && sourceGoalIds.has(mapping.legacyGoalId)
      && typeof mapping.canonicalGoalId === 'string'
      && mapping.canonicalGoalId.trim().length > 0)
    .map((mapping) => ({
      legacyGoalId: mapping.legacyGoalId!,
      canonicalGoalId: mapping.canonicalGoalId!,
      matchType: mapping.matchType === 'exact' ? 'exact' : 'partial',
    }))

  mkdirSync(path.dirname(reviewAbsolutePath), { recursive: true })
  writeFileSync(reviewAbsolutePath, `${JSON.stringify({
    version: 1,
    reviewId: path.basename(spec.reviewPath, '.json'),
    sourceLandscapeId: spec.sourceLandscapeId,
    targetLandscapeId: spec.canonicalLandscapeId,
    sourceExtractionPath: spec.outputPath,
    status: 'in_progress',
    note: 'Seed aus vorhandenen BY-Chemie-Legacy-Mappingkanten. Diese Datei beweist noch keine fachliche M3-Abdeckung; Review-Entscheidungen bleiben bewusst leer.',
    mappings,
    decisions: [],
  }, null, 2)}\n`)
}

function runSpec(spec: ExtractionSpec): void {
  const source = JSON.parse(readFileSync(absoluteRepoPath(spec.sourcePath), 'utf8')) as SourceLandscape
  const parsed = buildExtraction(spec, source)
  writeReviewSeed(spec, parsed)
  const extraction = {
    schemaVersion: 1,
    extractionId: spec.extractionId,
    title: spec.title,
    sourceLandscapeId: spec.sourceLandscapeId,
    jurisdiction: 'DE-BY',
    subject: spec.subject,
    stage: spec.stage,
    sourceDocument: spec.sourceDocument,
    sourceDocuments: [spec.sourceDocument],
    method: {
      sourceAcquisition: `Die strukturierte lokale LehrplanPLUS-${spec.subject}-Quelle fuer Gymnasium Bayern ist registriert; die offizielle LehrplanPLUS-Fachseite ist als Kontroll-URL hinterlegt.`,
      passageExtraction: `Aus der strukturierten LehrplanPLUS-${spec.subject}-Quelle wurden alle zieltragenden Lernbereichsabschnitte als Passage-Einheiten persistiert; synthetische Jahrgangs- und Motivationsknoten werden nicht als Lehrplanpassagen gewertet.`,
      sourceGoalExtraction: 'Alle in den Passage-Einheiten enthaltenen Kompetenzerwartungen mit Zieltext wurden als Source-Ziele persistiert.',
    },
    expectedTopicCodes: parsed.expectedTopicCodes,
    pipelineStatus: buildPipeline(spec, parsed),
    passages: parsed.passages,
    sourceGoals: parsed.sourceGoals,
    qualityReview: {
      sourceGoalCountPeerBaseline: spec.sourceGoalCountReview,
    },
  }

  const outputAbsolutePath = absoluteRepoPath(spec.outputPath)
  mkdirSync(path.dirname(outputAbsolutePath), { recursive: true })
  writeFileSync(outputAbsolutePath, `${JSON.stringify(extraction, null, 2)}\n`)
  console.log(`${spec.extractionId}: ${parsed.passages.length} passages, ${parsed.sourceGoals.length} source goals`)
  console.log(spec.outputPath)
}

const specs: ExtractionSpec[] = [
  {
    extractionId: 'DE-BY-CHEMIE-GYMNASIUM-LEHRPLANPLUS',
    title: 'DE-BY - Chemie Gymnasium (Bayern, LehrplanPLUS Source-Extraction)',
    sourceLandscapeId: 'ff1ca997-b6cc-5ece-8e13-5498b4bbf808',
    subject: 'Chemie',
    stage: 'SekI+SekII',
    sourcePath: 'curricula/DE/Gymnasium/input/BY/gymnasium/Chemie.json',
    outputPath: 'curricula/DE/Gymnasium/input/BY/gymnasium/source-extraction/DE_BY_CHEMIE_GYMNASIUM_LEHRPLANPLUS.source-extraction.json',
    reviewPath: 'curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_chemistry_source_extraction_to_canonical_chemistry.review.json',
    legacyMappingPath: 'curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_chemistry_to_canonical_chemistry.json',
    canonicalLandscapeId: canonicalChemistryLandscapeId,
    sourceDocument: {
      key: 'LEHRPLANPLUS_CHEMIE_GYMNASIUM',
      title: 'LehrplanPLUS Gymnasium Bayern - Chemie',
      path: 'curricula/DE/Gymnasium/input/BY/gymnasium/Chemie.json',
      role: 'binding-core',
      official: true,
      url: 'https://www.lehrplanplus.bayern.de/schulart/gymnasium/fach/chemie',
    },
    expectedPassages: 54,
    expectedSourceGoals: 559,
    sourceGoalCountReview: {
      accepted: false,
      details: 'BY Chemie enthaelt mehrere parallele Ausbildungsrichtungen sowie GA/EA-Oberstufenprofile; die hohe Zielzahl muss im M3-Review gegen den kanonischen Graphen kritisch normalisiert werden.',
    },
    passageTitlePattern: /^(.+:\s+)?C\d+\s+Lernbereich\s+\d+:/u,
    topicCode: (passage) => chemistryTopicCode(passage.title),
    stageFromTopicCode: (topicCode) => /^C(?:8|9|10)(?:[.-]|$)/u.test(topicCode) ? 'SekI' : 'SekII',
  },
  {
    extractionId: 'DE-BY-BIOLOGISCH-CHEMISCHES-PRAKTIKUM-GYMNASIUM-LEHRPLANPLUS',
    title: 'DE-BY - Biologisch-chemisches Praktikum Gymnasium (Bayern, LehrplanPLUS Source-Extraction)',
    sourceLandscapeId: '55e02c7e-ddca-4b30-a895-dc27c5f107ca',
    subject: 'Biologisch-chemisches Praktikum',
    stage: 'SekII',
    sourcePath: 'curricula/DE/Gymnasium/input/BY/gymnasium/Biologisch-chemisches_Praktikum.json',
    outputPath: 'curricula/DE/Gymnasium/input/BY/gymnasium/source-extraction/DE_BY_BIOLOGISCH_CHEMISCHES_PRAKTIKUM_GYMNASIUM_LEHRPLANPLUS.source-extraction.json',
    reviewPath: 'curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_biologisch_chemisches_praktikum_source_extraction_to_canonical_chemistry.review.json',
    legacyMappingPath: 'curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_biologisch_chemisches_praktikum_to_canonical_chemistry.json',
    canonicalLandscapeId: canonicalChemistryLandscapeId,
    sourceDocument: {
      key: 'LEHRPLANPLUS_BCP_GYMNASIUM',
      title: 'LehrplanPLUS Gymnasium Bayern - Biologisch-chemisches Praktikum',
      path: 'curricula/DE/Gymnasium/input/BY/gymnasium/Biologisch-chemisches_Praktikum.json',
      role: 'binding-core',
      official: true,
      url: 'https://www.lehrplanplus.bayern.de/schulart/gymnasium/fach/biologisch-chemisches-praktikum',
    },
    expectedPassages: 14,
    expectedSourceGoals: 52,
    sourceGoalCountReview: {
      accepted: false,
      details: 'BcP ist ein eigenes bayerisches Profilfach und darf nicht als vollstaendiger Ersatz fuer Chemie-Sek-II-Coverage gelesen werden.',
    },
    passageTitlePattern: /^BcP12\/13\s+Lernbereich\s+\d+:/u,
    topicCode: (passage, parent) => bcpTopicCode(passage.title, parent),
    stageFromTopicCode: () => 'SekII',
  },
]

specs.forEach(runSpec)
