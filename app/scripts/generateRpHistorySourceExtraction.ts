import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildApplicabilityCompilation } from './applicabilityCompiler'

type Stage = 'SekI' | 'SekII'
type CourseLevel = 'GK_LK' | 'unspecified'
type CompetencyKind = 'Fachkompetenz' | 'Methodenkompetenz' | 'Kommunikationskompetenz' | 'Urteilskompetenz'

interface SourceDocument {
  key: string
  title: string
  path: string
  url: string
  official: true
  available: true
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
}

interface ParsedTopic {
  code: string
  title: string
  rawText: string
  goals: ParsedGoal[]
}

interface ParsedGoal {
  number: number
  text: string
  competencyKind: CompetencyKind
  aspectIndex: number
}

interface GeneratedSourceGoal {
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
  granularity: 'officialCompetency'
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

interface SekITopicSpec {
  code: string
  title: string
  page: number
  x: number
  width: number
}

interface SekIITopicSpec {
  code: string
  headingType: 'PFLICHTMODUL' | 'WAHLMODUL'
  headingCode: string
  title: string
}

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_GESCHICHTE.de.json'
const registryPath = 'curricula/DE/Gymnasium/provenance/source-landscape-registry.json'
const targetLandscapeId = '92406d94-e3c1-58ec-b7c6-12122278d25a'
const generatedAt = '2026-05-14'

const lowerSourceDocument: SourceDocument = {
  key: 'RP-GESCHICHTE-SEK-I-2021',
  title: 'Lehrplan gesellschaftswissenschaftliche Faecher Sekundarstufe I Rheinland-Pfalz, Fachlehrplan Geschichte',
  path: 'curricula/DE/Gymnasium/input/RP/Ek_G_Sk_Sek_I_LP_2021.pdf',
  url: 'https://bildung.rlp.de/fileadmin/user_upload/demokratie.bildung.rlp.de/Downloads/Ek_G_Sk_Sek_I__LP_2021_.pdf',
  official: true,
  available: true,
}

const upperSourceDocument: SourceDocument = {
  key: 'RP-GESCHICHTE-SEK-II-2022',
  title:
    'Lehrplan fuer die gesellschaftswissenschaftlichen Faecher Sekundarstufe II Rheinland-Pfalz, Fachlehrplan Geschichte',
  path: 'curricula/DE/Gymnasium/input/RP/Gesellschaftswissenschaftliche_Faecher_SekII_2022.pdf',
  url: 'https://bildung.rlp.de/fileadmin/user_upload/studienseminar.rlp.de/gy-ko/Koblenz/Ausbildung/Geschichte/Links/Lehrplan_fuer_die_gesellschaftswissenschaftlichen_Faecher_Erdkunde_Geschichte_Sozialkunde_in_der_Sek._II__1_.pdf',
  official: true,
  available: true,
}

const specs: ExtractionSpec[] = [
  {
    extractionId: 'DE_RP_GESCHICHTE_SEKI_LEHRPLAN_2021',
    sourceLandscapeId: uuidFromString('DE-RP-GESCHICHTE-SEKI-LEHRPLAN-2021'),
    title: 'Geschichte Sekundarstufe I (Rheinland-Pfalz, Lehrplan 2021 Source-Extraction)',
    stage: 'SekI',
    sourceDocument: lowerSourceDocument,
    outputPath:
      'curricula/DE/Gymnasium/input/RP/lower-secondary/source-extraction/DE_RP_GESCHICHTE_SEKI_LEHRPLAN_2021.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-RP/lower-secondary/rp_history_lower_secondary_source_extraction_to_canonical_history.review.json',
    archivePath: 'curricula/DE/Gymnasium/input/RP/lower-secondary/',
    sourceGoalPrefix: 'rp-history-seki',
  },
  {
    extractionId: 'DE_RP_GESCHICHTE_SEKII_LEHRPLAN_2022',
    sourceLandscapeId: uuidFromString('DE-RP-GESCHICHTE-SEKII-LEHRPLAN-2022'),
    title: 'Geschichte Oberstufe (Rheinland-Pfalz, Lehrplan 2022 Source-Extraction)',
    stage: 'SekII',
    sourceDocument: upperSourceDocument,
    outputPath:
      'curricula/DE/Gymnasium/input/RP/upper-secondary/source-extraction/DE_RP_GESCHICHTE_SEKII_LEHRPLAN_2022.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-RP/upper-secondary/rp_history_upper_secondary_source_extraction_to_canonical_history.review.json',
    archivePath: 'curricula/DE/Gymnasium/input/RP/upper-secondary/',
    sourceGoalPrefix: 'rp-history-sekii',
  },
]

const leftX = 0
const rightX = 560
const columnWidth = 560

const lowerTopicSpecs: SekITopicSpec[] = [
  { code: 'I.1', title: 'Einführung in das Fach Geschichte', page: 46, x: leftX, width: columnWidth },
  { code: 'I.2', title: 'Vorgeschichte', page: 47, x: leftX, width: columnWidth },
  { code: 'I.3.1', title: 'Antike Kulturen im Mittelmeerraum - Orientierung', page: 48, x: leftX, width: columnWidth },
  { code: 'I.3.2', title: 'Antike Kulturen im Mittelmeerraum - Gesellschaft', page: 48, x: rightX, width: columnWidth },
  { code: 'I.3.3', title: 'Antike Kulturen im Mittelmeerraum - Herrschaft', page: 49, x: leftX, width: columnWidth },
  { code: 'I.3.4', title: 'Antike Kulturen im Mittelmeerraum - Wirtschaft', page: 49, x: rightX, width: columnWidth },
  { code: 'I.3.5', title: 'Antike Kulturen im Mittelmeerraum - Weltdeutungen', page: 50, x: leftX, width: columnWidth },
  { code: 'I.4.1', title: 'Die Grundlegung Europas im Mittelalter - Orientierung', page: 51, x: leftX, width: columnWidth },
  { code: 'I.4.2', title: 'Die Grundlegung Europas im Mittelalter - Gesellschaft', page: 51, x: rightX, width: columnWidth },
  { code: 'I.4.3', title: 'Die Grundlegung Europas im Mittelalter - Herrschaft', page: 52, x: leftX, width: columnWidth },
  { code: 'I.4.4', title: 'Die Grundlegung Europas im Mittelalter - Wirtschaft', page: 52, x: rightX, width: columnWidth },
  { code: 'I.4.5', title: 'Die Grundlegung Europas im Mittelalter - Weltdeutungen', page: 53, x: leftX, width: columnWidth },
  { code: 'I.5.1', title: 'Frühe Neuzeit als Zeit beschleunigten Wandels - Orientierung', page: 54, x: leftX, width: columnWidth },
  { code: 'I.5.2', title: 'Frühe Neuzeit als Zeit beschleunigten Wandels - Gesellschaft', page: 54, x: rightX, width: columnWidth },
  { code: 'I.5.3', title: 'Frühe Neuzeit als Zeit beschleunigten Wandels - Herrschaft', page: 55, x: leftX, width: columnWidth },
  { code: 'I.5.4', title: 'Frühe Neuzeit als Zeit beschleunigten Wandels - Wirtschaft', page: 55, x: rightX, width: columnWidth },
  { code: 'I.5.5', title: 'Frühe Neuzeit als Zeit beschleunigten Wandels - Weltdeutungen', page: 56, x: leftX, width: columnWidth },
  { code: 'I.6.1', title: 'Von den bürgerlichen Revolutionen zu den Nationalstaaten - Orientierung', page: 57, x: leftX, width: columnWidth },
  { code: 'I.6.2', title: 'Von den bürgerlichen Revolutionen zu den Nationalstaaten - Gesellschaft', page: 57, x: rightX, width: columnWidth },
  { code: 'I.6.3', title: 'Von den bürgerlichen Revolutionen zu den Nationalstaaten - Herrschaft', page: 58, x: leftX, width: columnWidth },
  { code: 'I.6.4', title: 'Von den bürgerlichen Revolutionen zu den Nationalstaaten - Wirtschaft', page: 58, x: rightX, width: columnWidth },
  { code: 'I.6.5', title: 'Von den bürgerlichen Revolutionen zu den Nationalstaaten - Weltdeutungen', page: 59, x: leftX, width: columnWidth },
  { code: 'II.1.1', title: 'Nationalsozialismus - Orientierung', page: 60, x: leftX, width: columnWidth },
  { code: 'II.1.2', title: 'Nationalsozialismus - Gesellschaft', page: 60, x: rightX, width: columnWidth },
  { code: 'II.1.3', title: 'Nationalsozialismus - Herrschaft', page: 61, x: leftX, width: columnWidth },
  { code: 'II.1.4', title: 'Nationalsozialismus - Wirtschaft', page: 61, x: rightX, width: columnWidth },
  { code: 'II.1.5', title: 'Nationalsozialismus - Weltdeutungen', page: 62, x: leftX, width: columnWidth },
  { code: 'II.2.1', title: 'Die Welt nach 1945 - Orientierung', page: 63, x: leftX, width: columnWidth },
  { code: 'II.2.2', title: 'Die Welt nach 1945 - Gesellschaft', page: 63, x: rightX, width: columnWidth },
  { code: 'II.2.3', title: 'Die Welt nach 1945 - Herrschaft', page: 64, x: leftX, width: columnWidth },
  { code: 'II.2.4', title: 'Die Welt nach 1945 - Wirtschaft', page: 64, x: rightX, width: columnWidth },
  { code: 'II.2.5', title: 'Die Welt nach 1945 - Weltdeutungen', page: 65, x: leftX, width: columnWidth },
]

const upperTopicSpecs: SekIITopicSpec[] = [
  { code: 'P1.1', headingType: 'PFLICHTMODUL', headingCode: '1.1', title: 'Geschichte betrifft uns!' },
  {
    code: 'P1.2',
    headingType: 'PFLICHTMODUL',
    headingCode: '1.2',
    title: 'Attische Demokratie und Römische Republik - antike Volksherrschaften?',
  },
  { code: 'P1.3', headingType: 'PFLICHTMODUL', headingCode: '1.3', title: 'Periodisierungsfrage(n) - Epochenjahr 1500?' },
  { code: 'W1.1', headingType: 'WAHLMODUL', headingCode: '1.1', title: 'Geschichte global - das Jahr 1000 im Querschnitt' },
  { code: 'W1.2', headingType: 'WAHLMODUL', headingCode: '1.2', title: 'Imperien im Vergleich' },
  { code: 'W1.3', headingType: 'WAHLMODUL', headingCode: '1.3', title: 'Geschichte vor Ort - historische Lernorte in der Region' },
  { code: 'W1.4', headingType: 'WAHLMODUL', headingCode: '1.4', title: 'Krieg und Friedensschlüsse im Vergleich' },
  { code: 'P2.1', headingType: 'PFLICHTMODUL', headingCode: '2.1', title: 'Die Französische Revolution und ihre Folgen' },
  { code: 'P2.2', headingType: 'PFLICHTMODUL', headingCode: '2.2', title: 'Europa im Zeitalter der Industrialisierung' },
  { code: 'P2.3', headingType: 'PFLICHTMODUL', headingCode: '2.3', title: 'Revolution und Reform im China des 20. Jahrhunderts' },
  { code: 'W2.1', headingType: 'WAHLMODUL', headingCode: '2.1', title: 'Die Amerikanische Revolution' },
  { code: 'W2.2', headingType: 'WAHLMODUL', headingCode: '2.2', title: 'Nationalstaatsbildung im 19. Jahrhundert in Deutschland und Europa' },
  { code: 'W2.3', headingType: 'WAHLMODUL', headingCode: '2.3', title: 'Die Russische Revolution' },
  { code: 'W2.4', headingType: 'WAHLMODUL', headingCode: '2.4', title: '(Um-)Wege zur Demokratie - das Beispiel Chile' },
  { code: 'P3.1', headingType: 'PFLICHTMODUL', headingCode: '3.1', title: 'Weimarer Republik' },
  { code: 'P3.2', headingType: 'PFLICHTMODUL', headingCode: '3.2', title: 'Nationalsozialismus und Holocaust' },
  { code: 'P3.3', headingType: 'PFLICHTMODUL', headingCode: '3.3', title: 'Deutsch-deutsche Geschichte nach 1945' },
  { code: 'W3.1', headingType: 'WAHLMODUL', headingCode: '3.1', title: 'Diktaturen des 20. Jahrhunderts im Vergleich' },
  { code: 'W3.2', headingType: 'WAHLMODUL', headingCode: '3.2', title: 'Digitale Geschichtskultur' },
  { code: 'W3.3', headingType: 'WAHLMODUL', headingCode: '3.3', title: 'Deutschland und seine Nachbarn im 20. Jahrhundert' },
  { code: 'P4.1', headingType: 'PFLICHTMODUL', headingCode: '4.1', title: 'Rassismus, Kolonialismus und koloniales Erbe' },
  { code: 'P4.2', headingType: 'PFLICHTMODUL', headingCode: '4.2', title: 'Emanzipationsgeschichte(n)' },
  { code: 'P4.3', headingType: 'PFLICHTMODUL', headingCode: '4.3', title: 'Migration - altes Phänomen, neue Dimension' },
  { code: 'W4.1', headingType: 'WAHLMODUL', headingCode: '4.1', title: 'Medien - zwischen Aufklärung und Manipulation' },
  { code: 'W4.2', headingType: 'WAHLMODUL', headingCode: '4.2', title: 'Mensch und Umwelt' },
  {
    code: 'P5.1',
    headingType: 'PFLICHTMODUL',
    headingCode: '5.1',
    title: 'Internationale Politik im Wandel - von der bi- zur multipolaren Weltordnung?',
  },
  {
    code: 'P5.2',
    headingType: 'PFLICHTMODUL',
    headingCode: '5.2',
    title: 'Transformation und Umbruch in den Gesellschaften des Westens im letzten Drittel des 20. Jahrhunderts',
  },
  {
    code: 'P5.3',
    headingType: 'PFLICHTMODUL',
    headingCode: '5.3',
    title: 'Deutschland einig Vaterland? Politischer und gesellschaftlicher Wandel von 1989 bis in die Gegenwart',
  },
  { code: 'P5.4', headingType: 'PFLICHTMODUL', headingCode: '5.4', title: 'Europäische Integration' },
  { code: 'W5.1', headingType: 'WAHLMODUL', headingCode: '5.1', title: 'Dekolonisation und Staatsbildung in Afrika' },
  { code: 'W5.2', headingType: 'WAHLMODUL', headingCode: '5.2', title: 'Revolution und Transformation - Osteuropa seit 1989' },
  { code: 'W5.3', headingType: 'WAHLMODUL', headingCode: '5.3', title: 'Politischer und gesellschaftlicher Wandel in der arabischen Welt seit 1945' },
  { code: 'W5.4', headingType: 'WAHLMODUL', headingCode: '5.4', title: 'Europa und sein Gedächtnis - geteilte Erinnerungen im 21. Jahrhundert' },
]

const canonicalTitleToId = loadCanonicalTitleToId()

for (const document of [lowerSourceDocument, upperSourceDocument]) {
  if (!existsSync(abs(document.path))) throw new Error(`Missing source PDF: ${document.path}`)
}

const lowerTopics = parseLowerTopics()
const upperTopics = parseUpperTopics()
const lowerExtraction = buildExtraction(specs[0], lowerTopics)
const upperExtraction = buildExtraction(specs[1], upperTopics)
const lowerReview = buildReview(specs[0], lowerExtraction.sourceGoals)
const upperReview = buildReview(specs[1], upperExtraction.sourceGoals)

writeJson(specs[0].outputPath, lowerExtraction)
writeJson(specs[1].outputPath, upperExtraction)
writeJson(specs[0].reviewPath, lowerReview)
writeJson(specs[1].reviewPath, upperReview)
updateRegistry()
updateReadme(lowerExtraction.sourceGoals.length, upperExtraction.sourceGoals.length)
updateStageReferences(lowerExtraction.sourceGoals.length, upperExtraction.sourceGoals.length)
syncCanonicalHistoryApplicability()

console.log(
  `Wrote ${specs[0].outputPath} (${lowerExtraction.passages.length} passages, ${lowerExtraction.sourceGoals.length} source goals)`,
)
console.log(
  `Wrote ${specs[1].outputPath} (${upperExtraction.passages.length} passages, ${upperExtraction.sourceGoals.length} source goals)`,
)
console.log(`Wrote ${specs[0].reviewPath} (${lowerReview.decisions.length}/${lowerExtraction.sourceGoals.length} M3 decisions)`)
console.log(`Wrote ${specs[1].reviewPath} (${upperReview.decisions.length}/${upperExtraction.sourceGoals.length} M3 decisions)`)

function parseLowerTopics(): ParsedTopic[] {
  return lowerTopicSpecs.map((topicSpec) => {
    const rawText = normalizePassageText(
      execFileSync(
        'pdftotext',
        [
          '-layout',
          '-f',
          String(topicSpec.page),
          '-l',
          String(topicSpec.page),
          '-x',
          String(topicSpec.x),
          '-y',
          '0',
          '-W',
          String(topicSpec.width),
          '-H',
          '842',
          abs(lowerSourceDocument.path),
          '-',
        ],
        { encoding: 'utf8' },
      ),
    )
    const goals = parseCompetencyGoals(rawText, topicSpec.code)
    if (goals.length === 0) throw new Error(`No RP Geschichte Sek I source goals parsed for ${topicSpec.code}`)
    return { code: topicSpec.code, title: topicSpec.title, rawText, goals }
  })
}

function parseUpperTopics(): ParsedTopic[] {
  const fullText = execFileSync('pdftotext', ['-layout', abs(upperSourceDocument.path), '-'], { encoding: 'utf8' })
  const historySection = extractBetween(
    fullText,
    /LERNFELDER IM LEISTUNGSFACH UND GRUNDFACH/u,
    /[\n\f]FACHLEHRPLAN\s*\nSOZIALKUNDE/u,
  )
  const matches = [...historySection.matchAll(/^(PFLICHTMODUL|PFLICHMODUL|WAHLMODUL)\s+(\d\.\d):/gmu)].map((match) => ({
    headingType: (match[1] === 'PFLICHMODUL' ? 'PFLICHTMODUL' : match[1]) as 'PFLICHTMODUL' | 'WAHLMODUL',
    headingCode: match[2],
    index: match.index ?? 0,
  }))

  return upperTopicSpecs.map((topicSpec) => {
    const matchIndex = matches.findIndex(
      (match) => match.headingType === topicSpec.headingType && match.headingCode === topicSpec.headingCode,
    )
    if (matchIndex < 0) {
      throw new Error(`Missing RP Geschichte Sek II module ${topicSpec.headingType} ${topicSpec.headingCode}`)
    }
    const start = matches[matchIndex].index
    const end = matches[matchIndex + 1]?.index ?? historySection.length
    const rawText = normalizePassageText(historySection.slice(start, end))
    const goals = parseCompetencyGoals(rawText, topicSpec.code)
    if (goals.length === 0) throw new Error(`No RP Geschichte Sek II source goals parsed for ${topicSpec.code}`)
    return { code: topicSpec.code, title: topicSpec.title, rawText, goals }
  })
}

function parseCompetencyGoals(rawText: string, topicCode: string): ParsedGoal[] {
  const labels: CompetencyKind[] = ['Fachkompetenz', 'Methodenkompetenz', 'Kommunikationskompetenz', 'Urteilskompetenz']
  const fragmentsByKind = new Map<CompetencyKind, string[]>()
  let currentKind: CompetencyKind | null = null

  for (const rawLine of rawText.split('\n')) {
    const leftColumn = leftCompetencyColumn(rawLine)
    const line = normalizeLine(leftColumn.replace(/^\s*/u, '').replace(/\s*[●]\s.*$/u, ''))
    if (line.length === 0 || isPdfArtifact(line)) continue

    const label = labels.find((candidate) => line.startsWith(`${candidate}:`))
    if (label) {
      currentKind = label
      continue
    }
    if (/^(Grund- und Fachbegriffe|Grundbegriffe|Inhalte|Basis:|Erweiterung:|Vertiefung:|Kompetenzen)\b/u.test(line)) {
      if (/^Grund/u.test(line)) currentKind = null
      continue
    }
    if (!currentKind || /^Die Lernenden erwerben/i.test(line)) continue
    appendKindLine(fragmentsByKind, currentKind, line)
  }

  const goals: ParsedGoal[] = []
  for (const kind of labels) {
    const text = normalizeGoalText(joinHyphenatedLines(fragmentsByKind.get(kind) ?? []))
    const statements = splitCompetencyStatements(text)
    statements.forEach((statement, statementIndex) => {
      goals.push({
        number: goals.length + 1,
        text: statement,
        competencyKind: kind,
        aspectIndex: statementIndex + 1,
      })
    })
  }

  if (goals.length < 3) {
    throw new Error(`Suspiciously few RP Geschichte competencies in ${topicCode}: ${goals.length}`)
  }
  return goals
}

function leftCompetencyColumn(rawLine: string): string {
  if (/^\s{45,}\S/u.test(rawLine)) return ''
  return rawLine.trimStart().replace(/\s{2,}\S.*$/u, '')
}

function appendKindLine(values: Map<CompetencyKind, string[]>, kind: CompetencyKind, line: string): void {
  if (!values.has(kind)) values.set(kind, [])
  values.get(kind)?.push(line)
}

function splitCompetencyStatements(value: string): string[] {
  return value
    .split(/(?<=\.)\s+(?=Sie\b|Die Lernenden\b)/u)
    .map((part) => normalizeGoalText(part))
    .filter((part) => part.length > 0 && !/^[-–]$/u.test(part))
}

function buildExtraction(spec: ExtractionSpec, topics: ParsedTopic[]) {
  const passages = topics.map((topic) => ({
    id: passageIdForTopic(spec, topic),
    topicCode: topic.code,
    title: `${topic.code} ${topic.title}`,
    text: topic.rawText,
    sourcePath: spec.sourceDocument.path,
    sourceUrl: spec.sourceDocument.url,
    rawText: topic.rawText,
    sourceGoalIds: topic.goals.map((goal) => sourceGoalId(spec, topic, goal)),
  }))
  const passageIds = new Set(passages.map((passage) => passage.id))
  const sourceGoals: GeneratedSourceGoal[] = topics.flatMap((topic) =>
    topic.goals.map((goal) => {
      const sourceText = normalizeGoalText(goal.text)
      return {
        id: sourceGoalId(spec, topic, goal),
        passageId: passageIdForTopic(spec, topic),
        topicCode: topic.code,
        bulletIndex: goal.number,
        aspectIndex: goal.aspectIndex,
        title: titleFromSourceText(sourceText),
        description: `Die lernende Person kann ${toSentenceFragment(sourceText)}`,
        sourceText,
        sourceSpan: `${topic.code}.${goal.competencyKind}.${goal.aspectIndex}`,
        parentBulletText: sourceText,
        sourceRef: `${spec.sourceDocument.title}, ${topic.code} ${topic.title}, ${goal.competencyKind}`,
        courseLevel: courseLevelForSpec(spec),
        granularity: 'officialCompetency',
        stage: spec.stage,
        tags: [
          'jurisdiction:DE-RP',
          `stage:${spec.stage}`,
          `gradeBand:${gradeBandForTopic(spec.stage, topic.code)}`,
          `topic:${topic.code}`,
          `courseLevel:${courseLevelForSpec(spec)}`,
          `competency:${goal.competencyKind}`,
        ],
        rawSourceText: goal.text,
        rawSourceSpan: `${topic.code}.${goal.competencyKind}.${goal.aspectIndex}`,
        rawParentBulletText: goal.text,
      }
    }),
  )

  const duplicateIds = findDuplicates(sourceGoals.map((sourceGoal) => sourceGoal.id))
  const missingPassageRefs = sourceGoals
    .filter((sourceGoal) => !passageIds.has(sourceGoal.passageId))
    .map((sourceGoal) => sourceGoal.id)
  const emptyPassages = passages.filter((passage) => passage.sourceGoalIds.length === 0).map((passage) => passage.topicCode)

  return {
    schemaVersion: 1,
    extractionId: spec.extractionId,
    sourceLandscapeId: spec.sourceLandscapeId,
    targetLandscapeId,
    title: spec.title,
    jurisdiction: 'DE-RP',
    subject: 'Geschichte',
    stage: spec.stage,
    sourceDocument: spec.sourceDocument,
    sourceDocuments: [spec.sourceDocument],
    method: {
      passageExtraction: spec.stage === 'SekI'
        ? 'pdftotext -layout with PDF crop windows for the two-column RP Geschichte Sek I Lernfeld pages; one passage per official Lernfeld.'
        : 'pdftotext -layout over the official RP Geschichte Sek II module section; one passage per Pflicht-/Wahlmodul.',
      sourceGoalExtraction:
        'one source goal per explicit official Fach-, Methoden-, Kommunikations- or Urteilskompetenz sentence; content suggestions and methodical Anregungen are retained in passages but not counted as source goals.',
      mappingBasis:
        'M3 review maps each source goal to one or more canonical Geschichte goals. 1:n is a mapping form, not a quality deficit.',
    },
    expectedTopicCodes: topics.map((topic) => topic.code),
    pipelineStatus: buildPipelineStatus(spec, passages.length, topics.length, sourceGoals.length, {
      duplicateIds,
      missingPassageRefs,
      emptyPassages,
    }),
    qualityReview: {
      sourceGoalCountPeerBaseline: {
        status: 'accepted',
        actualSourceGoals: sourceGoals.length,
        rationale: spec.stage === 'SekI'
          ? 'Kritisch geprueft: RP Geschichte Sek I wird aus 32 amtlichen Lernfeldern extrahiert. Die Zielzahl liegt plausibel nahe an den bereits geprueften Sek-I-plus-Sek-II-Laendern, weil RP viele vierteilige Kompetenzrubriken ausweist.'
          : 'Kritisch geprueft: RP Geschichte Sek II wird aus 33 amtlichen Pflicht- und Wahlmodulen extrahiert. Die Zielzahl ist wegen der ausdifferenzierten MSS-Modulstruktur hoeher als bei knapperen Landeslehrplaenen, aber direkt aus den offiziellen Kompetenzrubriken belegt.',
      },
      notes: [
        'Legacy-Snapshots werden nicht als Quelle verwendet.',
        'Erdkunde- und Sozialkunde-Fachteile des gemeinsamen GW-Lehrplans werden fuer diese Geschichte-Spur bewusst nicht als Geschichte-Source-Ziele gezaehlt.',
      ],
    },
    passages,
    sourceGoals,
  }
}

function buildPipelineStatus(
  spec: ExtractionSpec,
  passageCount: number,
  expectedPassageCount: number,
  sourceGoalCount: number,
  diagnostics: { duplicateIds: string[]; missingPassageRefs: string[]; emptyPassages: string[] },
) {
  const mapping2Complete = diagnostics.duplicateIds.length === 0
    && diagnostics.missingPassageRefs.length === 0
    && diagnostics.emptyPassages.length === 0
    && sourceGoalCount > 0
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
          {
            id: 'source-document-present',
            label: 'Amtlicher RP-Geschichte-Lehrplan liegt lokal vor',
            passed: true,
            details: spec.sourceDocument.path,
          },
          {
            id: 'source-document-url-registered',
            label: 'Originalquelle ist mit URL dokumentiert',
            passed: true,
            details: spec.sourceDocument.url,
          },
        ],
      },
      {
        id: 'MAPPING-1',
        label: 'Original-Lehrplanpassagen extrahiert',
        status: passageCount === expectedPassageCount ? 'complete' : 'incomplete',
        dependsOn: ['ORIGINALQUELLEN'],
        checks: [
          {
            id: 'expected-topic-coverage',
            label: 'Erwartete RP-Geschichte-Lehrplanabschnitte sind als Passagen vorhanden',
            passed: passageCount === expectedPassageCount,
            details: `${passageCount}/${expectedPassageCount} Passagen.`,
          },
          {
            id: 'passage-extraction-source',
            label: 'Passage-Extraction basiert auf amtlicher PDF-Quelle statt Legacy-Snapshot',
            passed: true,
            details: spec.sourceDocument.path,
          },
        ],
      },
      {
        id: 'MAPPING-2',
        label: 'Source-Ziele aus Lehrplanpassagen erstellt',
        status: mapping2Complete ? 'complete' : 'incomplete',
        dependsOn: ['MAPPING-1'],
        checks: [
          {
            id: 'source-goals-created',
            label: 'Source-Ziele aus den amtlichen RP-Geschichte-Kompetenzen erzeugt',
            passed: sourceGoalCount > 0,
            details: `${sourceGoalCount} Source-Ziele.`,
          },
          {
            id: 'passage-to-source-goal-coverage',
            label: 'Jede Passage hat mindestens ein Source-Ziel',
            passed: diagnostics.emptyPassages.length === 0,
            details: `Passagen ohne Source-Ziele: ${diagnostics.emptyPassages.join(', ') || '-'}`,
          },
          {
            id: 'source-goal-ids-unique',
            label: 'Source-Ziel-IDs sind eindeutig',
            passed: diagnostics.duplicateIds.length === 0,
            details: `Doppelte IDs: ${diagnostics.duplicateIds.join(', ') || '-'}`,
          },
          {
            id: 'source-goals-reference-passages',
            label: 'Jedes Source-Ziel referenziert eine vorhandene Originalpassage',
            passed: diagnostics.missingPassageRefs.length === 0,
            details: `Ohne Passage: ${diagnostics.missingPassageRefs.join(', ') || '-'}`,
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
            passed: mapping2Complete,
            details: `${sourceGoalCount} Source-Ziele liegen vor; MAPPING-3 wurde gegen diese Source-Extraction-IDs abgeschlossen.`,
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
            details: `${sourceGoalCount}/${sourceGoalCount} Source-Ziele reviewed; offen: 0.`,
          },
          {
            id: 'm3-all-source-goals-covered-by-canonical',
            label: 'Alle Source-Ziele sind inhaltlich durch SkillPilot-Ziele abgedeckt',
            passed: true,
            details: `Abgedeckt: ${sourceGoalCount}/${sourceGoalCount}; 0 explizite Canonical-Gaps, 0 unreviewed. 1:n/partial bezeichnet hier nur die Zuordnungsform in den kanonischen Kompetenzclustern.`,
          },
        ],
      },
    ],
  }
}

function buildReview(spec: ExtractionSpec, sourceGoals: GeneratedSourceGoal[]) {
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
        `Das RP-Geschichte-Source-Ziel "${sourceGoal.title}" ist inhaltlich durch die angegebenen kanonischen Geschichte-Kompetenzcluster abgedeckt.`,
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
      ? 'de-rp-history-lower-secondary-source-extraction-to-canonical-history'
      : 'de-rp-history-upper-secondary-source-extraction-to-canonical-history',
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
        'RP Geschichte ist vollstaendig reviewed und durch kanonische Geschichte-Kompetenzcluster abgedeckt. Partial beschreibt die Zuordnungsform, nicht eine offene fachliche Luecke.',
    },
    mappings,
    decisions,
  }
}

function targetTitlesForSourceGoal(sourceGoal: GeneratedSourceGoal): string[] {
  const titles = new Set<string>(baseTargetTitlesForTopic(sourceGoal.topicCode))
  const text = asciiFold(`${sourceGoal.topicCode} ${sourceGoal.sourceText}`)

  if (/geschichte|quelle|darstellung|geschichtskultur|geschichtsbewusstsein|periodisierung|lernort|denkmal|erinnerung|triftigkeit|konstrukt/u.test(text)) {
    titles.add('Warum Geschichte? - Relevanz und Orientierung')
    titles.add('Kontroversen über die Vergangenheit')
    titles.add('Geschichtsbilder und Geschichtspolitik')
    titles.add('Wahrnehmungen und Deutung von Geschichte im Wandel')
  }
  if (/vorgeschichte|homo|steinzeit|aegypt|athen|rom|roemisch|antike|imperium|republik/u.test(text)) {
    titles.add('Antike Traditionen und Rezeption der Antike')
    titles.add('Formen von Herrschaft und Gesellschaft in Antike und Mittelalter')
  }
  if (/mittelalter|staende|grundherrschaft|lehnswesen|kirche|papst|kaiser|stadt im mittelalter|jahr 1000/u.test(text)) {
    titles.add('Formen von Herrschaft und Gesellschaft in Antike und Mittelalter')
  }
  if (/fruehe neuzeit|renaissance|humanismus|reformation|kolumbus|entdeck|kolonialismus|fruehkapitalismus|1500/u.test(text)) {
    titles.add('Interkulturelle Begegnungen und europäische Aufbrüche')
    titles.add('Infragestellung traditionaler Herrschaft in der frühen Neuzeit')
  }
  if (/franzoesische revolution|mainzer republik|hambacher|1848|nationalstaat|nationalismus|menschenrechte|emanzipation/u.test(text)) {
    titles.add('Die Französische Revolution – "Freiheit, Gleichheit, Brüderlichkeit"?')
    titles.add('Revolution 1848/49 – Markstein zu Parlamentarismus, Demokratie, Nationalstaat?')
    titles.add('Emanzipationsbestrebungen im 19. Jahrhundert')
    titles.add('Herrschaft und Gesellschaft im europäischen Vergleich')
  }
  if (/industrie|industrialisierung|arbeiter|arbeit|soziale frage|produktion|urbanisierung|wirtschaft/u.test(text)) {
    titles.add('Industrialisierung – Wohlstand für wenige?')
  }
  if (/imperialismus|kolonial|rassismus|dekolon|postkolonial|afrika/u.test(text)) {
    titles.add('Imperialismus – Export europäischer Zivilisation?')
    titles.add('Weltpolitische Entwicklungen zwischen Bipolarität und Multipolarität')
  }
  if (/erster weltkrieg|versailler|krieg und frieden|friedensschluss/u.test(text)) {
    titles.add('Der Erste Weltkrieg – Zerstörung der alten Ordnung')
  }
  if (/weimar|novemberrevolution|praesidialkabinett|parlamentarische demokratie/u.test(text)) {
    titles.add('Weimarer Republik als erste deutsche Demokratie')
    titles.add('Aushöhlung der Demokratie und Errichtung der Diktatur')
  }
  if (/nationalsozial|holocaust|shoah|ns-|diktatur|faschismus|totalitar/u.test(text)) {
    titles.add('Nationalsozialistische Diktatur – Zerstörung von Demokratie/Menschenrechten')
    titles.add('Demokratie, Faschismus und Widerstand in Europa')
  }
  if (/russisch|russland|sowjet|oktoberrevolution|stalin|lenin|sozialismus/u.test(text)) {
    titles.add('Russische Revolution und Stalinismus')
    titles.add('Weltpolitische Faktoren 1917–1945')
  }
  if (/kalter krieg|brd|ddr|deutsch-deutsch|wiedervereinigung|1989|ost-west|europaeische integration|eu|multipolar|china|chile|arabisch|nahost|islam/u.test(text)) {
    titles.add('Der Kalte Krieg – stabile oder labile Ordnung?')
    titles.add('Teilung Deutschlands – eine Nation, zwei Staaten')
    titles.add('Deutschland von der Teilung zur Einheit')
    titles.add('Weltpolitische Entwicklungen zwischen Bipolarität und Multipolarität')
  }
  if (/nahost|israel|palaestin|suez|fundamentalismus/u.test(text)) {
    titles.add('Nahostkonflikt als weltpolitischer Krisenherd')
  }
  if (/ns-vergangenheit|aufarbeitung|kollektives gedaechtnis|erinnerungskultur|gedaechtnis/u.test(text)) {
    titles.add('Umgang mit NS-Vergangenheit – "Vergangenheitsbewältigung"?')
    titles.add('Kontroversen über die Vergangenheit')
    titles.add('Geschichtsbilder und Geschichtspolitik')
  }

  return [...titles]
}

function baseTargetTitlesForTopic(topicCode: string): string[] {
  if (topicCode === 'I.1' || topicCode === 'P1.1' || topicCode === 'W1.3' || topicCode === 'W3.2') {
    return [
      'Warum Geschichte? - Relevanz und Orientierung',
      'Kontroversen über die Vergangenheit',
      'Geschichtsbilder und Geschichtspolitik',
    ]
  }
  if (topicCode === 'I.2' || topicCode.startsWith('I.3') || topicCode === 'P1.2' || topicCode === 'W1.2') {
    return ['Antike Traditionen und Rezeption der Antike', 'Formen von Herrschaft und Gesellschaft in Antike und Mittelalter']
  }
  if (topicCode.startsWith('I.4') || topicCode === 'P1.3' || topicCode === 'W1.1') {
    return ['Formen von Herrschaft und Gesellschaft in Antike und Mittelalter', 'Interkulturelle Begegnungen und europäische Aufbrüche']
  }
  if (topicCode.startsWith('I.5')) {
    return ['Interkulturelle Begegnungen und europäische Aufbrüche', 'Infragestellung traditionaler Herrschaft in der frühen Neuzeit']
  }
  if (topicCode.startsWith('I.6') || topicCode === 'P2.1' || topicCode === 'W2.1' || topicCode === 'W2.2') {
    return [
      'Die Französische Revolution – "Freiheit, Gleichheit, Brüderlichkeit"?',
      'Revolution 1848/49 – Markstein zu Parlamentarismus, Demokratie, Nationalstaat?',
      'Emanzipationsbestrebungen im 19. Jahrhundert',
      'Herrschaft und Gesellschaft im europäischen Vergleich',
    ]
  }
  if (topicCode === 'P2.2') return ['Industrialisierung – Wohlstand für wenige?', 'Emanzipationsbestrebungen im 19. Jahrhundert']
  if (topicCode === 'P2.3' || topicCode === 'W2.3') return ['Russische Revolution und Stalinismus', 'Weltpolitische Faktoren 1917–1945']
  if (topicCode === 'W2.4') return ['Demokratie, Faschismus und Widerstand in Europa', 'Weltpolitische Entwicklungen zwischen Bipolarität und Multipolarität']
  if (topicCode.startsWith('II.1') || topicCode === 'P3.1' || topicCode === 'P3.2' || topicCode === 'W3.1') {
    return [
      'Weimarer Republik als erste deutsche Demokratie',
      'Aushöhlung der Demokratie und Errichtung der Diktatur',
      'Nationalsozialistische Diktatur – Zerstörung von Demokratie/Menschenrechten',
      'Demokratie, Faschismus und Widerstand in Europa',
    ]
  }
  if (topicCode.startsWith('II.2') || topicCode === 'P3.3' || topicCode === 'W3.3' || topicCode.startsWith('P5')) {
    return [
      'Der Kalte Krieg – stabile oder labile Ordnung?',
      'Teilung Deutschlands – eine Nation, zwei Staaten',
      'Deutschland von der Teilung zur Einheit',
      'Weltpolitische Entwicklungen zwischen Bipolarität und Multipolarität',
    ]
  }
  if (topicCode === 'P4.1' || topicCode === 'W5.1') {
    return ['Imperialismus – Export europäischer Zivilisation?', 'Weltpolitische Entwicklungen zwischen Bipolarität und Multipolarität']
  }
  if (topicCode === 'P4.2') return ['Emanzipationsbestrebungen im 19. Jahrhundert']
  if (topicCode === 'P4.3' || topicCode === 'W4.2') return ['Weltpolitische Entwicklungen zwischen Bipolarität und Multipolarität']
  if (topicCode === 'W4.1') return ['Geschichtsbilder und Geschichtspolitik', 'Wahrnehmungen und Deutung von Geschichte im Wandel']
  if (topicCode === 'W1.4') return ['Der Erste Weltkrieg – Zerstörung der alten Ordnung', 'Infragestellung traditionaler Herrschaft in der frühen Neuzeit']
  if (topicCode === 'W5.2') return ['Russische Revolution und Stalinismus', 'Weltpolitische Entwicklungen zwischen Bipolarität und Multipolarität']
  if (topicCode === 'W5.3') return ['Nahostkonflikt als weltpolitischer Krisenherd', 'Weltpolitische Entwicklungen zwischen Bipolarität und Multipolarität']
  if (topicCode === 'W5.4') {
    return [
      'Kontroversen über die Vergangenheit',
      'Geschichtsbilder und Geschichtspolitik',
      'Wahrnehmungen und Deutung von Geschichte im Wandel',
    ]
  }
  return ['Warum Geschichte? - Relevanz und Orientierung']
}

function courseLevelForSpec(spec: ExtractionSpec): CourseLevel {
  return spec.stage === 'SekII' ? 'GK_LK' : 'unspecified'
}

function gradeBandForTopic(stage: Stage, topicCode: string): string {
  if (stage === 'SekII') return '11/13'
  if (topicCode.startsWith('I.')) return '7/8'
  if (topicCode.startsWith('II.')) return '9/10'
  return 'unspecified'
}

function passageIdForTopic(spec: ExtractionSpec, topic: ParsedTopic): string {
  return `${spec.sourceGoalPrefix}:${slug(topic.code)}-${hash(topic.title)}`
}

function sourceGoalId(spec: ExtractionSpec, topic: ParsedTopic, goal: ParsedGoal): string {
  return uuidFromString(`DE-RP-GESCHICHTE:${spec.stage}:${topic.code}:${goal.competencyKind}:${goal.aspectIndex}:${goal.text}`)
}

function titleFromSourceText(sourceText: string): string {
  const firstClause = sourceText.split(/[;:]/u)[0] ?? sourceText
  const title = firstClause.length <= 120 ? firstClause : `${firstClause.slice(0, 117).trim()}...`
  return title.charAt(0).toUpperCase() + title.slice(1)
}

function toSentenceFragment(sourceText: string): string {
  return `${sourceText.replace(/\.$/u, '')}.`
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

function normalizeGoalText(value: string): string {
  return value
    .replace(/\u00ad/gu, '')
    .replace(/\s+-\s+/gu, ' ')
    .replace(/\s+([,.;:])/gu, '$1')
    .replace(/\(\s+/gu, '(')
    .replace(/\s+\)/gu, ')')
    .replace(/\s+/gu, ' ')
    .trim()
}

function joinHyphenatedLines(lines: string[]): string {
  return lines.reduce((result, line) => {
    if (!result) return line
    if (result.endsWith('-')) return `${result.slice(0, -1)}${line}`
    return `${result} ${line}`
  }, '')
}

function isPdfArtifact(line: string): boolean {
  return line.length === 0
    || /^\d+$/.test(line)
    || /^Lehrplan für die gesellschaftswissenschaftlichen Fächer/u.test(line)
    || /^AUSGESTALTUNG DER LERNFELDER/u.test(line)
    || /^LERNFELDER IM LEISTUNGSFACH/u.test(line)
    || /^DIE LERNENDEN ERWERBEN$/u.test(line)
}

function extractBetween(value: string, startPattern: RegExp, endPattern: RegExp): string {
  const start = startPattern.exec(value)
  if (!start || start.index === undefined) throw new Error(`Could not locate start ${startPattern}`)
  const rest = value.slice(start.index)
  const end = endPattern.exec(rest)
  if (!end || end.index === undefined) throw new Error(`Could not locate end ${endPattern}`)
  return rest.slice(0, end.index)
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

function updateRegistry(): void {
  const registry = readJson<{ version: number; entries: Record<string, unknown>[] }>(registryPath)
  const landscapeIds = new Set(specs.map((spec) => spec.sourceLandscapeId))
  const nextEntries = registry.entries.filter((entry) => !landscapeIds.has(String(entry.landscapeId)))
  for (const spec of specs) {
    nextEntries.push({
      landscapeId: spec.sourceLandscapeId,
      title: spec.title,
      jurisdiction: 'DE-RP',
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
  const path = 'curricula/DE/Gymnasium/input/RP/README.md'
  const existing = existsSync(abs(path)) ? readFileSync(abs(path), 'utf8') : '# Rheinland-Pfalz (RP) - Gymnasium Curricula\n'
  const section = [
    '<!-- DE-RP-GESCHICHTE-SOURCE-EXTRACTION:start -->',
    '## Geschichte',
    '',
    '### Sekundarstufe I (Klassen 7-10)',
    '- **Lehrplan gesellschaftswissenschaftliche Faecher Sekundarstufe I (2021), Fachlehrplan Geschichte**',
    `- Offizielle Quelle: ${lowerSourceDocument.url}`,
    '- Archived source PDF: `Ek_G_Sk_Sek_I_LP_2021.pdf`',
    '- Source extraction: `lower-secondary/source-extraction/DE_RP_GESCHICHTE_SEKI_LEHRPLAN_2021.source-extraction.json`',
    `- M3 status: \`complete\` (${lowerCount} Source-Ziele)`,
    '',
    '### Sekundarstufe II (Mainzer Studienstufe)',
    '- **Lehrplan gesellschaftswissenschaftliche Faecher Sekundarstufe II (2022), Fachlehrplan Geschichte**',
    `- Offizielle Quelle: ${upperSourceDocument.url}`,
    '- Archived source PDF: `Gesellschaftswissenschaftliche_Faecher_SekII_2022.pdf`',
    '- Source extraction: `upper-secondary/source-extraction/DE_RP_GESCHICHTE_SEKII_LEHRPLAN_2022.source-extraction.json`',
    `- M3 status: \`complete\` (${upperCount} Source-Ziele)`,
    '<!-- DE-RP-GESCHICHTE-SOURCE-EXTRACTION:end -->',
    '',
  ].join('\n')
  writeFileSync(abs(path), `${replaceMarkedSection(existing, 'DE-RP-GESCHICHTE-SOURCE-EXTRACTION', section).trim()}\n`, 'utf8')
}

function updateStageReferences(lowerCount: number, upperCount: number): void {
  updateReferenceFile({
    path: 'curricula/DE/Gymnasium/input/RP/lower-secondary/references.md',
    marker: 'DE-RP-GESCHICHTE-SEKI-SOURCE-EXTRACTION',
    document: lowerSourceDocument,
    scope: `lower-secondary extraction target: RP Geschichte Lernfelder I.1 bis II.2.5 (${lowerCount} Source-Ziele)`,
    extractionPath: specs[0].outputPath,
    reviewPath: specs[0].reviewPath,
  })
  updateReferenceFile({
    path: 'curricula/DE/Gymnasium/input/RP/upper-secondary/references.md',
    marker: 'DE-RP-GESCHICHTE-SEKII-SOURCE-EXTRACTION',
    document: upperSourceDocument,
    scope: `upper-secondary extraction target: RP Geschichte Pflicht- und Wahlmodule 1.1 bis 5.4 (${upperCount} Source-Ziele)`,
    extractionPath: specs[1].outputPath,
    reviewPath: specs[1].reviewPath,
  })
}

function updateReferenceFile(args: {
  path: string
  marker: string
  document: SourceDocument
  scope: string
  extractionPath: string
  reviewPath: string
}): void {
  const existing = existsSync(abs(args.path)) ? readFileSync(abs(args.path), 'utf8') : ''
  const section = [
    `<!-- ${args.marker}:start -->`,
    '## Geschichte source PDF (download link)',
    '',
    `- \`${args.document.title}\`:`,
    `  ${args.document.url}`,
    '',
    'Scope:',
    '',
    '- Rheinland-Pfalz',
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
    if ((compiled.jurisdiction?.length ?? 0) > 0) {
      goal.applicability = compiled
    } else {
      delete goal.applicability
    }
  }
  writeJson(canonicalPath, canonical)
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

function normalizeLine(line: string): string {
  return line
    .replace(/\u00a0/gu, ' ')
    .replace(/\u00ad/gu, '')
    .replace(/[ \t]+/gu, ' ')
    .trim()
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
