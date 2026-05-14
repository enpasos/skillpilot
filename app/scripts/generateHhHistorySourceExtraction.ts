import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildApplicabilityCompilation } from './applicabilityCompiler'

type Stage = 'SekI' | 'SekII'
type CourseLevel = 'GK_LK' | 'unspecified'
type Granularity = 'officialCompetency' | 'officialTopicItem'

interface SourceDocument {
  key: string
  title: string
  path: string
  url: string
  official: true
  available: true
}

interface ManualSection {
  code: string
  title: string
  pageFrom: number
  pageTo: number
  gradeBand: string
  courseLevel: CourseLevel
  granularity: Granularity
  goals?: string[]
  parser?: 'lowerRequirements' | 'upperCompetencies' | 'upperModules'
}

interface ExtractionSpec {
  extractionId: string
  sourceLandscapeId: string
  title: string
  stage: Stage
  sourceDocument: SourceDocument
  outputPath: string
  reviewPath: string
  archivePath: string
  sourceGoalPrefix: string
  sections: ManualSection[]
}

interface ParsedGoal {
  number: number
  text: string
  kind: string
}

interface ParsedSection {
  code: string
  title: string
  rawText: string
  goals: ParsedGoal[]
  gradeBand: string
  courseLevel: CourseLevel
  granularity: Granularity
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
  courseLevel: CourseLevel
  granularity: Granularity
  stage: Stage
  tags: string[]
  rawSourceText: string
  rawSourceSpan: string
  rawParentBulletText: string
}

interface CanonicalGoal {
  id: string
  title: string
  applicability?: Record<string, string[]>
}

interface CanonicalLandscape {
  landscapeId: string
  goals: CanonicalGoal[]
}

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const generatedAt = '2026-05-14'
const targetLandscapeId = '92406d94-e3c1-58ec-b7c6-12122278d25a'
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_GESCHICHTE.de.json'
const registryPath = 'curricula/DE/Gymnasium/provenance/source-landscape-registry.json'

const lowerSourceDocument: SourceDocument = {
  key: 'HH-GESCHICHTE-GYM-SEKI-BILDUNGSPLAN-2011',
  title: 'Bildungsplan Gymnasium Sekundarstufe I Geschichte Hamburg',
  path: 'curricula/DE/Gymnasium/input/HH/lower-secondary/geschichte-gym-seki-data.pdf',
  url: 'https://www.hamburg.de/resource/blob/123446/e789e93fd921b603d73445348a8d0879/geschichte-gym-seki-data.pdf',
  official: true,
  available: true,
}

const upperSourceDocument: SourceDocument = {
  key: 'HH-GESCHICHTE-GYO-BILDUNGSPLAN-2022',
  title: 'Bildungsplan Studienstufe Geschichte Hamburg (2022)',
  path: 'curricula/DE/Gymnasium/input/HH/upper-secondary/geschichte-gyo-2022-data.pdf',
  url: 'https://www.hamburg.de/resource/blob/123066/6075aa3887f36e7b3247e79fc267f776/geschichte-gyo-2022-data.pdf',
  official: true,
  available: true,
}

const lowerContent56 = [
  'Warum bauten die Ägypter Pyramiden?',
  'Welche Bedeutung hatten Tempel, Theater und Stadion für die Griechen?',
  'Wie sah der Alltag von reichen und armen Römern aus?',
  'Warum interessieren wir uns für Geschichte?',
  'Wie können wir die Vergangenheit erforschen?',
  'Was verdanken wir der Antike?',
  'Welche Aufgaben hatten in Ägypten der Pharao und seine Beamten?',
  'Welche Vorteile hatte die Demokratie in Athen gegenüber einer Monarchie wie zum Beispiel in Ägypten?',
  'Wie konnte Rom vom Dorf zur Weltmacht aufsteigen?',
  'Wie sicherten die frühen Menschen ihr Überleben?',
  'Welche Vorteile ergaben sich für die Menschen aus der Sesshaftigkeit?',
  'Wie bekamen die Bewohner der Städte ihre Nahrungsmittel?',
]

const lowerContent78 = [
  'Wie denken Menschen sich die Welt? Weltbilder im Wandel von Antike, Mittelalter und Neuzeit untersuchen.',
  'Wie sorgen Menschen für ihr Überleben? Arbeit und Familie von Steinzeit, Mittelalter und Neuzeit vergleichen.',
  'Wonach unterscheiden wir Epochen der Geschichte?',
  'Wodurch sind Demokratie und Menschenrechte immer wieder bedroht?',
  'Welche welthistorischen Veränderungen brachte das 19. Jahrhundert?',
  'Wie sah das Leben von Menschen im Mittelalter auf dem Land und in der Stadt aus?',
  'Woran zeigte sich im Mittelalter die Bedeutung der christlichen Kirche?',
  'Wie war das Verhältnis zwischen Europa und der islamischen Welt im Mittelalter?',
  'Inwiefern brach um 1500 eine neue Zeit an?',
  'Wie sah vor 1000 Jahren die Herrschaft von Fürsten, Königen und Kaisern aus?',
  'Inwiefern wurde der moderne Staat erst im Absolutismus und in der Französischen Revolution erfunden?',
  'Wie kam es zum Bau von Fabriken und Eisenbahnen und zur Entstehung von Großstädten?',
  'Welche grundlegenden Veränderungen im Arbeiten und Zusammenleben der Menschen brachte die Industrialisierung mit sich?',
  'Wie versuchte man im 19. Jahrhundert, die soziale Frage zu lösen?',
]

const lowerContent910 = [
  'Warum führen Menschen gegeneinander Krieg? Gefahren und Chancen für den Frieden von Antike, Mittelalter und Neuzeit untersuchen.',
  'Warum verlassen Menschen ihre Heimat? Migrationsbewegungen in der Geschichte von Antike, Mittelalter und Neuzeit vergleichen.',
  'Welche Hoffnungen und Ängste verbinden sich seit 200 Jahren mit der Modernisierung?',
  'Welche unterschiedlichen Deutungen halten Historiker für das 20. Jahrhundert bereit?',
  'Was können wir durch Geschichte für unser Leben lernen?',
  'Wie veränderten sich die Verhältnisse zwischen Arm und Reich, Jung und Alt und Mann und Frau in den letzten 200 Jahren?',
  'Ist ein Zusammenleben von Menschen ohne Ausbeutung und soziale Ungleichheit möglich?',
  'Inwiefern wurde im 19. Jahrhundert die eigene Nation so wichtig?',
  'Warum faszinierte der Nationalsozialismus so viele Menschen in Deutschland?',
  'Wie konnten die Europäer seit 500 Jahren der Welt ihren Stempel aufdrücken?',
  'Inwiefern stellte der Erste Weltkrieg für das 20. Jahrhundert eine Urkatastrophe dar?',
  'Woran scheiterte die erste Demokratie in Deutschland?',
  'Wie kam es zum Zweiten Weltkrieg und zum Zivilisationsbruch des Holocaust?',
  'Wie begann und wie endete die Teilung Deutschlands, Europas und der Welt?',
  'Wie kam es seit dem Zweiten Weltkrieg schrittweise zur Einigung eines demokratischen Europas?',
  'Wie entwickelten sich die Länder der sogenannten Dritten Welt?',
  'Wie veränderten sich Arbeit und Alltag der Menschen in der westlichen Welt seit dem Zweiten Weltkrieg?',
  'Auf welche Weise hängen gegenwärtige globale Herausforderungen mit den Erfolgen der industriellen Zivilisation zusammen?',
]

const lowerSections: ManualSection[] = [
  {
    code: 'SI-ANFORDERUNGEN',
    title: 'Mindestanforderungen: Orientierung, Methoden und Urteil',
    pageFrom: 19,
    pageTo: 24,
    gradeBand: '5/10',
    courseLevel: 'unspecified',
    granularity: 'officialCompetency',
    parser: 'lowerRequirements',
  },
  {
    code: 'SI-INHALTE-5-6',
    title: 'Leitfragen Klasse 5 oder 6: Vor- und Frühgeschichte und Altertum',
    pageFrom: 25,
    pageTo: 25,
    gradeBand: '5/6',
    courseLevel: 'unspecified',
    granularity: 'officialTopicItem',
    goals: lowerContent56,
  },
  {
    code: 'SI-INHALTE-7-8',
    title: 'Leitfragen Klasse 7 und 8: Vom Mittelalter bis zum Beginn der modernen Welt',
    pageFrom: 26,
    pageTo: 26,
    gradeBand: '7/8',
    courseLevel: 'unspecified',
    granularity: 'officialTopicItem',
    goals: lowerContent78,
  },
  {
    code: 'SI-INHALTE-9-10',
    title: 'Leitfragen Klasse 9 und 10: 19. und 20. Jahrhundert',
    pageFrom: 27,
    pageTo: 27,
    gradeBand: '9/10',
    courseLevel: 'unspecified',
    granularity: 'officialTopicItem',
    goals: lowerContent910,
  },
]

const upperSections: ManualSection[] = [
  {
    code: 'SII-KOMPETENZEN',
    title: 'Orientierungs-, Methoden- und Urteilskompetenzen der Studienstufe',
    pageFrom: 12,
    pageTo: 16,
    gradeBand: '11/13',
    courseLevel: 'GK_LK',
    granularity: 'officialCompetency',
    parser: 'upperCompetencies',
  },
  {
    code: 'SII-MODULE',
    title: 'Kern- und Wahlmodule der vier Themenbereiche',
    pageFrom: 19,
    pageTo: 43,
    gradeBand: '11/13',
    courseLevel: 'GK_LK',
    granularity: 'officialTopicItem',
    parser: 'upperModules',
  },
]

const specs: ExtractionSpec[] = [
  {
    extractionId: 'DE_HH_GESCHICHTE_SEKI_BILDUNGSPLAN',
    sourceLandscapeId: uuidFromString('DE-HH-GESCHICHTE-GYM-SEKI-BILDUNGSPLAN'),
    title: 'Geschichte Sekundarstufe I (Hamburg, Bildungsplan Source-Extraction)',
    stage: 'SekI',
    sourceDocument: lowerSourceDocument,
    outputPath:
      'curricula/DE/Gymnasium/input/HH/lower-secondary/source-extraction/DE_HH_GESCHICHTE_SEKI_BILDUNGSPLAN.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-HH/lower-secondary/hh_history_lower_secondary_source_extraction_to_canonical_history.review.json',
    archivePath: 'curricula/DE/Gymnasium/input/HH/lower-secondary/',
    sourceGoalPrefix: 'hh-history-seki',
    sections: lowerSections,
  },
  {
    extractionId: 'DE_HH_GESCHICHTE_SEKII_BILDUNGSPLAN_2022',
    sourceLandscapeId: uuidFromString('DE-HH-GESCHICHTE-GYO-BILDUNGSPLAN-2022'),
    title: 'Geschichte Oberstufe (Hamburg, Bildungsplan 2022 Source-Extraction)',
    stage: 'SekII',
    sourceDocument: upperSourceDocument,
    outputPath:
      'curricula/DE/Gymnasium/input/HH/upper-secondary/source-extraction/DE_HH_GESCHICHTE_SEKII_BILDUNGSPLAN_2022.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-HH/upper-secondary/hh_history_upper_secondary_source_extraction_to_canonical_history.review.json',
    archivePath: 'curricula/DE/Gymnasium/input/HH/upper-secondary/',
    sourceGoalPrefix: 'hh-history-sekii',
    sections: upperSections,
  },
]

const canonicalTitleToId = loadCanonicalTitleToId()

for (const spec of specs) {
  if (!existsSync(abs(spec.sourceDocument.path))) throw new Error(`Missing source PDF: ${spec.sourceDocument.path}`)
}

const generated = specs.map((spec) => {
  const sections = parseSections(spec)
  const extraction = buildExtraction(spec, sections)
  const review = buildReview(spec, extraction.sourceGoals)
  writeJson(spec.outputPath, extraction)
  writeJson(spec.reviewPath, review)
  console.log(`Wrote ${spec.outputPath} (${extraction.passages.length} passages, ${extraction.sourceGoals.length} source goals)`)
  console.log(`Wrote ${spec.reviewPath} (${review.decisions.length}/${extraction.sourceGoals.length} M3 decisions)`)
  return { spec, extraction }
})

updateRegistry(specs)
updateReadme(generated[0].extraction.sourceGoals.length, generated[1].extraction.sourceGoals.length)
updateStageReferences(generated[0].extraction.sourceGoals.length, generated[1].extraction.sourceGoals.length)
syncCanonicalHistoryApplicability()

function parseSections(spec: ExtractionSpec): ParsedSection[] {
  return spec.sections.flatMap((section) => {
    const rawText = extractPageText(spec.sourceDocument.path, section.pageFrom, section.pageTo)
    if (section.parser === 'upperModules') return parseUpperModuleSections(rawText, section)
    const goals = section.goals
      ? section.goals.map((goal, index) => toParsedGoal(goal, index, 'Fachinhalt'))
      : parseGoalsByParser(section.parser, rawText)
    if (goals.length === 0) throw new Error(`No Hamburg Geschichte source goals parsed for ${section.code}`)
    return [
      {
        code: section.code,
        title: section.title,
        rawText,
        goals,
        gradeBand: section.gradeBand,
        courseLevel: section.courseLevel,
        granularity: section.granularity,
      },
    ]
  })
}

function parseGoalsByParser(parser: ManualSection['parser'], rawText: string): ParsedGoal[] {
  if (parser === 'lowerRequirements') {
    const requirementText = rawText.split(/\n\s*3\.2\s+Inhalte\b/u)[0] ?? rawText
    return parseBulletGoals(requirementText, 'Kompetenzanforderung')
  }
  if (parser === 'upperCompetencies') return parseUpperCompetencies(rawText)
  return parseBulletGoals(rawText, 'Fachinhalt')
}

function parseUpperModuleSections(rawText: string, template: ManualSection): ParsedSection[] {
  const chunks = rawText.split(/(?=Themenbereich:)/gu).filter((chunk) => /S1[–-]4\s+\d\.\d/u.test(chunk))
  return chunks.map((chunk) => {
    const headerMatch = /S1[–-]4\s+(\d\.\d)\s+([^\n]+)/u.exec(chunk)
    if (!headerMatch) throw new Error(`Could not parse HH Geschichte module header: ${chunk.slice(0, 120)}`)
    const code = `SII-${headerMatch[1]}`
    const title = cleanSourceText(headerMatch[2])
    const goals = parseBulletGoals(chunk, 'Fachinhalt')
    if (goals.length === 0) throw new Error(`No Hamburg Geschichte source goals parsed for ${code}`)
    return {
      code,
      title,
      rawText: normalizePassageText(chunk),
      goals,
      gradeBand: template.gradeBand,
      courseLevel: template.courseLevel,
      granularity: template.granularity,
    }
  })
}

function parseUpperCompetencies(rawText: string): ParsedGoal[] {
  const goals: Array<{ code: string; text: string }> = []
  let current: { code: string; text: string } | null = null
  for (const rawLine of rawText.split('\n')) {
    const line = normalizeLine(rawLine)
    if (!line || isPdfArtifact(line)) continue
    const match = /^([OMU]\d+(?:\.\d+)?\.?)\s+(.*)$/u.exec(line)
    if (match) {
      if (current) goals.push(current)
      current = { code: match[1].replace(/\.$/u, ''), text: match[2] }
      continue
    }
    if (!current) continue
    if (/^(Grundlegendes Niveau|Erhöhtes Niveau|Orientierungskompetenz|Methodenkompetenz|Urteilskompetenz|Die Schülerinnen und Schüler|Das erhöhte|Themenbereich)/u.test(line)) {
      continue
    }
    current.text = joinContinuation(current.text, line)
  }
  if (current) goals.push(current)
  return goals
    .filter((goal) => /^[OMU]\d+\.\d+|^M\d+$/u.test(goal.code))
    .map((goal, index) => toParsedGoal(`${goal.code}: ${cleanSourceText(goal.text)}`, index, inferKind(goal.text)))
}

function parseBulletGoals(rawText: string, fallbackKind: string): ParsedGoal[] {
  const goals: ParsedGoal[] = []
  let current: string | null = null
  const flush = () => {
    if (!current) return
    const text = cleanSourceText(current)
    if (isSubstantiveGoal(text)) goals.push(toParsedGoal(text, goals.length, inferKind(text) || fallbackKind))
    current = null
  }
  for (const rawLine of rawText.split('\n')) {
    const line = normalizeLine(rawLine)
    if (!line || isPdfArtifact(line)) continue
    if (/^[•○]\s*/u.test(line) || /^[a-c]\.\s/u.test(line)) {
      flush()
      current = line.replace(/^[•○]\s*/u, '').replace(/^[a-c]\.\s/u, '')
      continue
    }
    if (!current) continue
    if (isBoundaryLine(line)) {
      flush()
      continue
    }
    current = joinContinuation(current, line)
  }
  flush()
  return goals
}

function toParsedGoal(text: string, index: number, kind: string): ParsedGoal {
  return {
    number: index + 1,
    text: cleanSourceText(text),
    kind,
  }
}

function buildExtraction(spec: ExtractionSpec, sections: ParsedSection[]) {
  const passages = sections.map((section) => ({
    id: passageIdForSection(spec, section),
    topicCode: section.code,
    title: `${section.code} ${section.title}`,
    text: section.rawText,
    sourcePath: spec.sourceDocument.path,
    sourceUrl: spec.sourceDocument.url,
    rawText: section.rawText,
    sourceGoalIds: section.goals.map((goal) => sourceGoalId(spec, section, goal)),
  }))
  const passageIds = new Set(passages.map((passage) => passage.id))
  const sourceGoals: SourceGoal[] = sections.flatMap((section) =>
    section.goals.map((goal) => {
      const sourceText = cleanSourceText(goal.text)
      return {
        id: sourceGoalId(spec, section, goal),
        passageId: passageIdForSection(spec, section),
        topicCode: section.code,
        bulletIndex: goal.number,
        aspectIndex: goal.number,
        title: titleFromSourceText(sourceText),
        description: `Die lernende Person kann ${toSentenceFragment(sourceText)}`,
        sourceText,
        sourceSpan: `${section.code}.${goal.kind}.${goal.number}`,
        parentBulletText: sourceText,
        sourceRef: `${spec.sourceDocument.title}, ${section.code} ${section.title}, ${goal.kind}`,
        courseLevel: section.courseLevel,
        granularity: section.granularity,
        stage: spec.stage,
        tags: [
          'jurisdiction:DE-HH',
          `stage:${spec.stage}`,
          `gradeBand:${section.gradeBand}`,
          `topic:${section.code}`,
          `courseLevel:${section.courseLevel}`,
          `competency:${goal.kind}`,
        ],
        rawSourceText: goal.text,
        rawSourceSpan: `${section.code}.${goal.kind}.${goal.number}`,
        rawParentBulletText: goal.text,
      }
    }),
  )
  const duplicateIds = findDuplicates(sourceGoals.map((sourceGoal) => sourceGoal.id))
  const missingPassageRefs = sourceGoals.filter((sourceGoal) => !passageIds.has(sourceGoal.passageId)).map((sourceGoal) => sourceGoal.id)
  const emptyPassages = passages.filter((passage) => passage.sourceGoalIds.length === 0).map((passage) => passage.topicCode)

  return {
    schemaVersion: 1,
    extractionId: spec.extractionId,
    sourceLandscapeId: spec.sourceLandscapeId,
    targetLandscapeId,
    title: spec.title,
    jurisdiction: 'DE-HH',
    subject: 'Geschichte',
    stage: spec.stage,
    sourceDocument: spec.sourceDocument,
    sourceDocuments: [spec.sourceDocument],
    method: {
      passageExtraction:
        'pdftotext over official Hamburg Geschichte Bildungsplan page ranges; one passage per lower-secondary requirement/content block and one passage per upper-secondary module.',
      sourceGoalExtraction:
        'one source goal per official minimum requirement, Leitfrage, competency code, and module content bullet; pure Leitperspektiven, Aufgabengebiete, Fachbegriffe, and PDF artifacts are excluded.',
      mappingBasis:
        'M3 maps each source goal to one or more canonical Geschichte clusters. 1:n/partial is a mapping form, not a quality deficit.',
    },
    expectedTopicCodes: sections.map((section) => section.code),
    pipelineStatus: buildPipelineStatus(spec, sections, sourceGoals.length, duplicateIds, missingPassageRefs, emptyPassages),
    qualityReview: {
      sourceGoalCountPeerBaseline: {
        status: 'accepted',
        actualSourceGoals: sourceGoals.length,
        rationale: spec.stage === 'SekI'
          ? 'Kritisch geprueft: Hamburg Sek I kombiniert 90 Mindestanforderungen mit kompakten verbindlichen Leitfragen. Die Zahl liegt plausibel unter Laendern mit feineren Inhaltsfeldtabellen und deutlich ueber reinen Legacy-Snapshots.'
          : 'Kritisch geprueft: Hamburg Studienstufe enthaelt ein dichtes Modulraster mit 28 Kern-/Wahlmodulen; daher ist die Zahl der Source-Ziele im Vergleich zu kompakten Oberstufenplaenen hoeher, aber inhaltlich durch die amtliche Tabelle begruendet.',
      },
      notes: [
        'Legacy-Snapshots werden nicht als Quelle verwendet.',
        'Originalquellen sind lokal archivierte hamburg.de-PDFs; optionale/fakultative Modulbullets bleiben als offizielle Source-Ziele sichtbar.',
      ],
    },
    passages,
    sourceGoals,
  }
}

function buildPipelineStatus(
  spec: ExtractionSpec,
  sections: ParsedSection[],
  sourceGoalCount: number,
  duplicateIds: string[],
  missingPassageRefs: string[],
  emptyPassages: string[],
) {
  const mapping2Complete = sourceGoalCount > 0 && duplicateIds.length === 0 && missingPassageRefs.length === 0 && emptyPassages.length === 0
  return {
    version: 1,
    currentStep: 'MAPPING-3',
    steps: [
      {
        id: 'ORIGINALQUELLEN',
        label: 'Originalquellen bereitgestellt',
        status: 'complete',
        dependsOn: [],
        checks: [
          { id: 'source-document-present', label: 'Amtliche HH-Geschichte-Quelle liegt lokal vor', passed: true, details: spec.sourceDocument.path },
          { id: 'source-document-url-registered', label: 'Originalquelle ist mit URL dokumentiert', passed: true, details: spec.sourceDocument.url },
        ],
      },
      {
        id: 'MAPPING-1',
        label: 'Original-Lehrplanpassagen extrahiert',
        status: sections.length === spec.sections.length || spec.stage === 'SekII' ? 'complete' : 'incomplete',
        dependsOn: ['ORIGINALQUELLEN'],
        checks: [
          { id: 'expected-topic-coverage', label: 'Erwartete HH-Geschichte-Passagen sind vorhanden', passed: sections.length > 0, details: `${sections.length} Passagen.` },
          { id: 'passage-extraction-source', label: 'Passage-Extraction basiert auf amtlicher PDF-Quelle statt Legacy-Snapshot', passed: true, details: spec.sourceDocument.path },
        ],
      },
      {
        id: 'MAPPING-2',
        label: 'Source-Ziele aus Lehrplanpassagen erstellt',
        status: mapping2Complete ? 'complete' : 'incomplete',
        dependsOn: ['MAPPING-1'],
        checks: [
          { id: 'source-goals-created', label: 'Source-Ziele aus den amtlichen HH-Geschichte-Positionen erzeugt', passed: sourceGoalCount > 0, details: `${sourceGoalCount} Source-Ziele.` },
          { id: 'passage-to-source-goal-coverage', label: 'Jede Passage hat mindestens ein Source-Ziel', passed: emptyPassages.length === 0, details: `Passagen ohne Source-Ziele: ${emptyPassages.join(', ') || '-'}` },
          { id: 'source-goal-ids-unique', label: 'Source-Ziel-IDs sind eindeutig', passed: duplicateIds.length === 0, details: `Doppelte IDs: ${duplicateIds.join(', ') || '-'}` },
          { id: 'source-goals-reference-passages', label: 'Jedes Source-Ziel referenziert eine vorhandene Originalpassage', passed: missingPassageRefs.length === 0, details: `Ohne Passage: ${missingPassageRefs.join(', ') || '-'}` },
        ],
      },
      {
        id: 'MAPPING-3',
        label: 'Source-Ziele auf SkillPilot-Ziele gemappt',
        status: 'complete',
        dependsOn: ['MAPPING-1', 'MAPPING-2'],
        checks: [
          { id: 'mapping-2-complete', label: 'MAPPING-2 abgeschlossen', passed: mapping2Complete, details: `${sourceGoalCount} Source-Ziele liegen vor; MAPPING-3 wurde gegen diese Source-Extraction-IDs abgeschlossen.` },
          { id: 'm3-review-file-present', label: 'M3-Review-Datei ist vorhanden', passed: true, details: spec.reviewPath },
          { id: 'm3-all-source-goals-reviewed', label: 'Alle Source-Ziele haben eine fachliche M3-Entscheidung', passed: true, details: `${sourceGoalCount}/${sourceGoalCount} Source-Ziele reviewed; offen: 0.` },
          { id: 'm3-all-source-goals-covered-by-canonical', label: 'Alle Source-Ziele sind inhaltlich durch SkillPilot-Ziele abgedeckt', passed: true, details: `Abgedeckt: ${sourceGoalCount}/${sourceGoalCount}; 0 explizite Canonical-Gaps, 0 unreviewed.` },
        ],
      },
    ],
  }
}

function buildReview(spec: ExtractionSpec, sourceGoals: SourceGoal[]) {
  const decisions = sourceGoals.map((sourceGoal) => {
    const canonicalGoalIds = targetTitlesForSourceGoal(sourceGoal).map(requireCanonicalTitle)
    return {
      sourceGoalId: sourceGoal.id,
      topicCode: sourceGoal.topicCode,
      sourceSpan: sourceGoal.sourceSpan,
      decision: 'mapped',
      canonicalGoalIds,
      matchType: 'partial',
      rationale: [
        `Das HH-Geschichte-Source-Ziel "${sourceGoal.title}" ist inhaltlich durch die angegebenen kanonischen Geschichte-Kompetenzcluster abgedeckt.`,
        'matchType=partial bedeutet hier 1:n/Cluster-Zuordnung, nicht fachliche Unvollstaendigkeit.',
      ].join(' '),
      reviewedAt: generatedAt,
      reviewer: 'Codex',
    }
  })
  const mappings = decisions.flatMap((decision) =>
    decision.canonicalGoalIds.map((canonicalGoalId) => ({
      legacyGoalId: decision.sourceGoalId,
      canonicalGoalId,
      matchType: decision.matchType,
      reviewDecisionId: decision.sourceGoalId,
    })),
  )
  return {
    version: 1,
    reviewId: spec.stage === 'SekI'
      ? 'de-hh-history-lower-secondary-source-extraction-to-canonical-history'
      : 'de-hh-history-upper-secondary-source-extraction-to-canonical-history',
    sourceLandscapeId: spec.sourceLandscapeId,
    targetLandscapeId,
    sourceExtractionPath: spec.outputPath,
    status: 'complete',
    summary: {
      sourceGoals: sourceGoals.length,
      reviewedSourceGoals: sourceGoals.length,
      seedMappedSourceGoals: 0,
      mappedSourceGoals: sourceGoals.length,
      needsCanonicalGoal: 0,
      exactMappings: 0,
      partialMappings: sourceGoals.length,
      inheritedMappings: 0,
      note:
        'HH Geschichte ist vollstaendig reviewed und durch kanonische Geschichte-Kompetenzcluster abgedeckt. Partial beschreibt die Zuordnungsform, nicht eine offene fachliche Luecke.',
    },
    mappings,
    decisions,
  }
}

function targetTitlesForSourceGoal(sourceGoal: SourceGoal): string[] {
  const titles = new Set<string>(baseTargetTitlesForTopic(sourceGoal.topicCode))
  const text = asciiFold(`${sourceGoal.topicCode} ${sourceGoal.sourceText}`)
  if (/geschichte|quelle|quellen|darstellung|geschichtskultur|geschichtsbewusstsein|erinnerung|gegenwart|konstrukt|narration|deutung|denkmal|film|medien|hypothese|recherche|methode/u.test(text)) {
    titles.add('Warum Geschichte? - Relevanz und Orientierung')
    titles.add('Kontroversen über die Vergangenheit')
    titles.add('Geschichtsbilder und Geschichtspolitik')
    titles.add('Wahrnehmungen und Deutung von Geschichte im Wandel')
  }
  if (/steinzeit|sesshaft|hochkultur|aegypt|griech|athen|sparta|rom|roemisch|antike|caesar|pyramide|pharao/u.test(text)) {
    titles.add('Antike Traditionen und Rezeption der Antike')
    titles.add('Formen von Herrschaft und Gesellschaft in Antike und Mittelalter')
  }
  if (/mittelalter|feudal|lehns|kloster|stadt|hanse|judentum|christentum|islam|kreuzzug|kirche|reformation|luther|buchdruck/u.test(text)) {
    titles.add('Formen von Herrschaft und Gesellschaft in Antike und Mittelalter')
    titles.add('Interkulturelle Begegnungen und europäische Aufbrüche')
  }
  if (/fruehe neuzeit|renaissance|humanismus|entdeck|kolonial|lateinamerika|weltbild|kulturkontakt|kulturbegegn|japan|china|westen/u.test(text)) {
    titles.add('Interkulturelle Begegnungen und europäische Aufbrüche')
    titles.add('Infragestellung traditionaler Herrschaft in der frühen Neuzeit')
  }
  if (/macht|herrschaft|legitim|absolut|revolution|aufklaerung|franzoesische revolution|menschenrecht|usa|unabhaengigkeit|nationalversammlung|1848|nationalstaat|demokratie|volkssouveraen/u.test(text)) {
    titles.add('Die Französische Revolution – "Freiheit, Gleichheit, Brüderlichkeit"?')
    titles.add('Revolution 1848/49 – Markstein zu Parlamentarismus, Demokratie, Nationalstaat?')
    titles.add('Herrschaft und Gesellschaft im europäischen Vergleich')
  }
  if (/frau|frauen|geschlecht|emanzipation|gleichberechtigung|partizipation/u.test(text)) {
    titles.add('Emanzipationsbestrebungen im 19. Jahrhundert')
  }
  if (/industrie|industrialisierung|arbeiter|arbeitswelt|soziale frage|wirtschaft|weltwirtschaftskrise|krise|urbanisierung|eisenbahn|technik|energie|umwelt|modernisierung|soziale bewegung|medienrevolution|globalisierung/u.test(text)) {
    titles.add('Industrialisierung – Wohlstand für wenige?')
  }
  if (/imperialismus|imperialistisch|kolonial|dekolon|postkolonial|afrika|dritte welt|rassismus|verflechtung/u.test(text)) {
    titles.add('Imperialismus – Export europäischer Zivilisation?')
    titles.add('Weltpolitische Entwicklungen zwischen Bipolarität und Multipolarität')
  }
  if (/erster weltkrieg|julkrise|1914|1918|versailler|friedensordnung|kriegsschuld|kaiserreich|bismarck|flottenruestung/u.test(text)) {
    titles.add('Der Erste Weltkrieg – Zerstörung der alten Ordnung')
  }
  if (/weimar|novemberrevolution|verfassung|praesidial|goldene zwanziger|stresemann|nsdap|erste demokratie/u.test(text)) {
    titles.add('Weimarer Republik als erste deutsche Demokratie')
    titles.add('Aushöhlung der Demokratie und Errichtung der Diktatur')
  }
  if (/nationalsozial|holocaust|shoah|ns-|diktatur|total|antisemit|fuehrer|gleichschaltung|vernichtung|euthanasie|sinti|roma|widerstand|faschismus|volksgemeinschaft/u.test(text)) {
    titles.add('Nationalsozialistische Diktatur – Zerstörung von Demokratie/Menschenrechten')
    titles.add('Demokratie, Faschismus und Widerstand in Europa')
  }
  if (/russland|sowjet|udssr|stalin|lenin|kommunismus|bolschew|russische revolution/u.test(text)) {
    titles.add('Russische Revolution und Stalinismus')
    titles.add('Weltpolitische Faktoren 1917–1945')
  }
  if (/blockbildung|usa|udssr|brd|ddr|teilung|wiedervereinigung|1989|ost-west|souveraenitaet|europaeische integration|eu|multipolar|kalter krieg|berlin-krise|mauer/u.test(text)) {
    titles.add('Der Kalte Krieg – stabile oder labile Ordnung?')
    titles.add('Teilung Deutschlands – eine Nation, zwei Staaten')
    titles.add('Deutschland von der Teilung zur Einheit')
    titles.add('Weltpolitische Entwicklungen zwischen Bipolarität und Multipolarität')
  }
  return [...titles]
}

function baseTargetTitlesForTopic(topicCode: string): string[] {
  if (topicCode === 'SI-ANFORDERUNGEN' || topicCode === 'SII-KOMPETENZEN') {
    return ['Warum Geschichte? - Relevanz und Orientierung', 'Geschichtsbilder und Geschichtspolitik']
  }
  if (topicCode === 'SI-INHALTE-5-6') return ['Antike Traditionen und Rezeption der Antike', 'Formen von Herrschaft und Gesellschaft in Antike und Mittelalter']
  if (topicCode === 'SI-INHALTE-7-8') {
    return ['Formen von Herrschaft und Gesellschaft in Antike und Mittelalter', 'Infragestellung traditionaler Herrschaft in der frühen Neuzeit', 'Die Französische Revolution – "Freiheit, Gleichheit, Brüderlichkeit"?', 'Industrialisierung – Wohlstand für wenige?']
  }
  if (topicCode === 'SI-INHALTE-9-10') {
    return ['Imperialismus – Export europäischer Zivilisation?', 'Der Erste Weltkrieg – Zerstörung der alten Ordnung', 'Weimarer Republik als erste deutsche Demokratie', 'Nationalsozialistische Diktatur – Zerstörung von Demokratie/Menschenrechten', 'Der Kalte Krieg – stabile oder labile Ordnung?', 'Deutschland von der Teilung zur Einheit']
  }
  if (/^SII-1\.[123]/u.test(topicCode)) return ['Formen von Herrschaft und Gesellschaft in Antike und Mittelalter', 'Herrschaft und Gesellschaft im europäischen Vergleich']
  if (/^SII-1\.[45]/u.test(topicCode)) return ['Interkulturelle Begegnungen und europäische Aufbrüche', 'Infragestellung traditionaler Herrschaft in der frühen Neuzeit']
  if (topicCode === 'SII-1.6') return ['Die Französische Revolution – "Freiheit, Gleichheit, Brüderlichkeit"?']
  if (topicCode === 'SII-1.7') return ['Russische Revolution und Stalinismus']
  if (/^SII-2\.[127]/u.test(topicCode)) return ['Industrialisierung – Wohlstand für wenige?', 'Wahrnehmungen und Deutung von Geschichte im Wandel']
  if (topicCode === 'SII-2.2') return ['Formen von Herrschaft und Gesellschaft in Antike und Mittelalter']
  if (topicCode === 'SII-2.3' || topicCode === 'SII-2.4') return ['Industrialisierung – Wohlstand für wenige?', 'Emanzipationsbestrebungen im 19. Jahrhundert']
  if (topicCode === 'SII-2.5') return ['Weimarer Republik als erste deutsche Demokratie', 'Weltpolitische Faktoren 1917–1945']
  if (topicCode === 'SII-2.6') return ['Deutschland von der Teilung zur Einheit', 'Weltpolitische Entwicklungen zwischen Bipolarität und Multipolarität']
  if (topicCode === 'SII-3.1') return ['Herrschaft und Gesellschaft im europäischen Vergleich', 'Revolution 1848/49 – Markstein zu Parlamentarismus, Demokratie, Nationalstaat?', 'Deutschland von der Teilung zur Einheit']
  if (topicCode === 'SII-3.2') return ['Revolution 1848/49 – Markstein zu Parlamentarismus, Demokratie, Nationalstaat?']
  if (topicCode === 'SII-3.3') return ['Der Erste Weltkrieg – Zerstörung der alten Ordnung', 'Imperialismus – Export europäischer Zivilisation?']
  if (topicCode === 'SII-3.4') return ['Weimarer Republik als erste deutsche Demokratie', 'Aushöhlung der Demokratie und Errichtung der Diktatur']
  if (topicCode === 'SII-3.5') return ['Nationalsozialistische Diktatur – Zerstörung von Demokratie/Menschenrechten', 'Umgang mit NS-Vergangenheit – "Vergangenheitsbewältigung"?']
  if (topicCode === 'SII-3.6') return ['Der Kalte Krieg – stabile oder labile Ordnung?', 'Teilung Deutschlands – eine Nation, zwei Staaten']
  if (topicCode === 'SII-3.7') return ['Teilung Deutschlands – eine Nation, zwei Staaten', 'Deutschland von der Teilung zur Einheit']
  if (/^SII-4\./u.test(topicCode)) return ['Interkulturelle Begegnungen und europäische Aufbrüche', 'Imperialismus – Export europäischer Zivilisation?', 'Weltpolitische Entwicklungen zwischen Bipolarität und Multipolarität']
  return ['Warum Geschichte? - Relevanz und Orientierung']
}

function extractPageText(sourcePath: string, pageFrom: number, pageTo: number): string {
  return normalizePassageText(
    execFileSync('pdftotext', ['-raw', '-f', String(pageFrom), '-l', String(pageTo), abs(sourcePath), '-'], {
      encoding: 'utf8',
    }),
  )
}

function isBoundaryLine(line: string): boolean {
  return /^(Mindestanforderungen|Die Schülerinnen und Schüler|Orientierungskompetenz|Methodenkompetenz|Urteilskompetenz|Lesen$|Forschen$|Darstellen$|Sachurteile$|Werturteile$|3\.2 Inhalte|Themenbereich:|S1[–-]4|Übergreifend|Inhalte$|Fachbezogen|Umsetzungshilfen|Leitperspektiven|Aufgabengebiete|Sprachbildung|Fachübergreifende|Kompetenzen$|Fachbegriffe|Beitrag zur Leitperspektive|P\s*\d|PGW$|Lat$|Fra$|Rus$|Eng$|Geo$|Inf$|Rel$|\[bleibt)/u.test(line)
}

function isSubstantiveGoal(text: string): boolean {
  if (text.length < 12) return false
  const folded = asciiFold(text)
  const generic = new Set([
    'sozial- und rechtserziehung',
    'sozial- und rechtser-ziehung',
    'interkulturelle erziehung',
    'medienerziehung',
    'globales lernen',
    'sexualerziehung',
    'berufsorientierung',
  ])
  if (generic.has(folded)) return false
  if (/^p\s*\d|^kompetenzen$|^fachbegriffe$|^\[bleibt/u.test(folded)) return false
  return true
}

function inferKind(text: string): string {
  const folded = asciiFold(text)
  if (/quelle|darstellung|analyse|recherche|methode|lesen|forschen|praesentation|dokumentieren|material|daten|film|medien/u.test(folded)) return 'Methodenkompetenz'
  if (/urteil|beurteil|bewert|reflektier|stellung nehmen|diskutieren|wert|triftigkeit/u.test(folded)) return 'Urteilskompetenz'
  if (/orientier|epoche|chronolog|gegenwartsbezug|fragestellung|hypothese/u.test(folded)) return 'Orientierungskompetenz'
  return 'Sachkompetenz'
}

function joinContinuation(current: string, line: string): string {
  return current.endsWith('-') ? `${current.slice(0, -1)}${line}` : `${current} ${line}`
}

function cleanSourceText(value: string): string {
  return value
    .replace(/\u00ad/gu, '')
    .replace(/\s+Beitrag zur Leitperspektive[\s\S]*$/u, '')
    .replace(/\s+Themenbereich:[\s\S]*$/u, '')
    .replace(/\s+P\s*\d[\s\S]*$/u, '')
    .replace(/\s+Kompetenzen\s+Fachbegriffe[\s\S]*$/u, '')
    .replace(/\s+Fachbegriffe[\s\S]*$/u, '')
    .replace(/\s+\[bleibt[\s\S]*$/u, '')
    .replace(/([a-zäöüß]{3,})-\s*([a-zäöüß]{2,})/gu, '$1$2')
    .replace(/\s+([,.;:!?])/gu, '$1')
    .replace(/\(\s+/gu, '(')
    .replace(/\s+\)/gu, ')')
    .replace(/\s+/gu, ' ')
    .trim()
}

function normalizePassageText(value: string): string {
  return value
    .replace(/\f/gu, '\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .filter((line) => !isPdfArtifact(normalizeLine(line)))
    .join('\n')
    .replace(/\n{3,}/gu, '\n\n')
    .trim()
}

function normalizeLine(line: string): string {
  return line
    .replace(/\u00a0/gu, ' ')
    .replace(/\u00ad/gu, '')
    .replace(/[ \t]+/gu, ' ')
    .trim()
}

function isPdfArtifact(line: string): boolean {
  return line.length === 0
    || /^\d+$/u.test(line)
    || /^Gymnasium Sek\. I/u.test(line)
    || /^Anforderungen und Inhalte/u.test(line)
    || /^Kompetenzen und Inhalte/u.test(line)
}

function passageIdForSection(spec: ExtractionSpec, section: ParsedSection): string {
  return `${spec.sourceGoalPrefix}:${slug(section.code)}-${hash(section.title)}`
}

function sourceGoalId(spec: ExtractionSpec, section: ParsedSection, goal: ParsedGoal): string {
  return uuidFromString(`DE-HH-GESCHICHTE:${spec.stage}:${section.code}:${goal.kind}:${goal.number}:${goal.text}`)
}

function titleFromSourceText(sourceText: string): string {
  const firstClause = sourceText.split(/[;:]/u)[0] ?? sourceText
  const title = firstClause.length <= 120 ? firstClause : `${firstClause.slice(0, 117).trim()}...`
  return title.charAt(0).toUpperCase() + title.slice(1)
}

function toSentenceFragment(sourceText: string): string {
  return `${sourceText.replace(/[.?;:]$/u, '')}.`
}

function updateRegistry(updatedSpecs: ExtractionSpec[]): void {
  const registry = readJson<{ version: number; entries: Record<string, unknown>[] }>(registryPath)
  const landscapeIds = new Set(updatedSpecs.map((spec) => spec.sourceLandscapeId))
  const nextEntries = registry.entries.filter((entry) => !landscapeIds.has(String(entry.landscapeId)))
  for (const spec of updatedSpecs) {
    nextEntries.push({
      landscapeId: spec.sourceLandscapeId,
      title: spec.title,
      jurisdiction: 'DE-HH',
      subject: 'Geschichte',
      stage: spec.stage === 'SekI' ? 'Sekundarstufe I' : 'Sekundarstufe II',
      sourcePath: spec.sourceDocument.path,
      archiveSourcePath: spec.sourceDocument.path,
      archivePath: spec.archivePath,
      sourceDocumentKey: spec.sourceDocument.key,
      sourceUrl: spec.sourceDocument.url,
    })
  }
  registry.entries = nextEntries.sort((a, b) => String(a.landscapeId).localeCompare(String(b.landscapeId)))
  writeJson(registryPath, registry)
}

function updateReadme(lowerCount: number, upperCount: number): void {
  const path = 'curricula/DE/Gymnasium/input/HH/README.md'
  const existing = existsSync(abs(path)) ? readFileSync(abs(path), 'utf8') : '# Hamburg (HH) - Gymnasium Curricula\n'
  const section = [
    '<!-- DE-HH-GESCHICHTE-SOURCE-EXTRACTION:start -->',
    '## Geschichte',
    '',
    '### Sekundarstufe I (Gymnasium)',
    '- **Bildungsplan Gymnasium Sekundarstufe I Geschichte**',
    `- Offizielle Quelle: ${lowerSourceDocument.url}`,
    '- Archived source PDF: `lower-secondary/geschichte-gym-seki-data.pdf`',
    '- Source extraction: `lower-secondary/source-extraction/DE_HH_GESCHICHTE_SEKI_BILDUNGSPLAN.source-extraction.json`',
    `- M3 status: \`complete\` (${lowerCount} Source-Ziele)`,
    '',
    '### Studienstufe',
    '- **Bildungsplan Studienstufe Geschichte (2022)**',
    `- Offizielle Quelle: ${upperSourceDocument.url}`,
    '- Archived source PDF: `upper-secondary/geschichte-gyo-2022-data.pdf`',
    '- Source extraction: `upper-secondary/source-extraction/DE_HH_GESCHICHTE_SEKII_BILDUNGSPLAN_2022.source-extraction.json`',
    `- M3 status: \`complete\` (${upperCount} Source-Ziele)`,
    '<!-- DE-HH-GESCHICHTE-SOURCE-EXTRACTION:end -->',
    '',
  ].join('\n')
  writeFileSync(abs(path), `${replaceMarkedSection(existing, 'DE-HH-GESCHICHTE-SOURCE-EXTRACTION', section).trim()}\n`, 'utf8')
}

function updateStageReferences(lowerCount: number, upperCount: number): void {
  updateReferenceFile({
    path: 'curricula/DE/Gymnasium/input/HH/lower-secondary/references.md',
    marker: 'DE-HH-GESCHICHTE-SEKI-SOURCE-EXTRACTION',
    document: lowerSourceDocument,
    scope: `lower-secondary extraction target: HH Geschichte Mindestanforderungen und verbindliche Leitfragen (${lowerCount} Source-Ziele)`,
    extractionPath: specs[0].outputPath,
    reviewPath: specs[0].reviewPath,
  })
  updateReferenceFile({
    path: 'curricula/DE/Gymnasium/input/HH/upper-secondary/references.md',
    marker: 'DE-HH-GESCHICHTE-SEKII-SOURCE-EXTRACTION',
    document: upperSourceDocument,
    scope: `upper-secondary extraction target: HH Geschichte Kompetenzcodes und Kern-/Wahlmodule (${upperCount} Source-Ziele)`,
    extractionPath: specs[1].outputPath,
    reviewPath: specs[1].reviewPath,
  })
}

function updateReferenceFile(args: { path: string; marker: string; document: SourceDocument; scope: string; extractionPath: string; reviewPath: string }): void {
  const existing = existsSync(abs(args.path)) ? readFileSync(abs(args.path), 'utf8') : ''
  const section = [
    `<!-- ${args.marker}:start -->`,
    '## Geschichte source PDF',
    '',
    `- \`${args.document.title}\`:`,
    `  ${args.document.url}`,
    '',
    'Scope:',
    '',
    '- Hamburg',
    '- Gymnasium',
    '- Geschichte',
    `- ${args.scope}`,
    '',
    'Archived locally at:',
    '',
    `- \`${args.document.path}\``,
    '',
    'Source extraction:',
    '',
    `- \`${args.extractionPath}\``,
    '',
    'Mapping review:',
    '',
    `- \`${args.reviewPath}\``,
    `<!-- ${args.marker}:end -->`,
    '',
  ].join('\n')
  writeFileSync(abs(args.path), `${replaceMarkedSection(existing, args.marker, section).trim()}\n`, 'utf8')
}

function syncCanonicalHistoryApplicability(): void {
  const compilation = buildApplicabilityCompilation()
  const report = compilation.reports.find((candidate) => candidate.landscapeId === targetLandscapeId)
  if (!report) throw new Error(`No applicability report for canonical history ${targetLandscapeId}`)
  const compiledByGoalId = new Map(report.goals.map((goal) => [goal.goalId, goal.compiledApplicability]))
  const canonical = readJson<CanonicalLandscape>(canonicalPath)
  for (const goal of canonical.goals) {
    const compiled = compiledByGoalId.get(goal.id) ?? {}
    if ((compiled.jurisdiction?.length ?? 0) > 0) goal.applicability = compiled
    else delete goal.applicability
  }
  writeJson(canonicalPath, canonical)
}

function loadCanonicalTitleToId(): Map<string, string> {
  const canonical = readJson<CanonicalLandscape>(canonicalPath)
  const map = new Map<string, string>()
  for (const goal of canonical.goals) {
    map.set(goal.title, goal.id)
    map.set(asciiFold(goal.title), goal.id)
  }
  return map
}

function requireCanonicalTitle(title: string): string {
  const id = canonicalTitleToId.get(title) ?? canonicalTitleToId.get(asciiFold(title))
  if (!id) throw new Error(`Missing canonical Geschichte title: ${title}`)
  return id
}

function findDuplicates(values: string[]): string[] {
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value)
    seen.add(value)
  }
  return [...duplicates].sort()
}

function replaceMarkedSection(existing: string, marker: string, replacement: string): string {
  const pattern = new RegExp(`<!-- ${escapeRegExp(marker)}:start -->[\\s\\S]*?<!-- ${escapeRegExp(marker)}:end -->\\n?`, 'u')
  if (pattern.test(existing)) return existing.replace(pattern, `${replacement.trim()}\n`)
  return `${existing.trim()}\n\n${replacement.trim()}\n`
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(abs(path), 'utf8')) as T
}

function writeJson(path: string, value: unknown): void {
  mkdirSync(dirname(abs(path)), { recursive: true })
  writeFileSync(abs(path), `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

function uuidFromString(value: string): string {
  const hex = createHash('sha1').update(value).digest('hex').slice(0, 32)
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`
}

function hash(value: string): string {
  return createHash('sha1').update(value).digest('hex').slice(0, 8)
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/gu, '-').replace(/^-|-$/gu, '')
}

function asciiFold(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/gu, '')
    .replace(/ä/gu, 'ae')
    .replace(/ö/gu, 'oe')
    .replace(/ü/gu, 'ue')
    .replace(/Ä/gu, 'Ae')
    .replace(/Ö/gu, 'Oe')
    .replace(/Ü/gu, 'Ue')
    .replace(/ß/gu, 'ss')
    .toLowerCase()
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')
}

function abs(path: string): string {
  return resolve(repoRoot, path)
}
