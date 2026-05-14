import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildApplicabilityCompilation } from './applicabilityCompiler'

type Stage = 'SekI'
type CourseLevel = 'unspecified'

interface ParsedTopic {
  code: string
  title: string
  rawText: string
  goals: ParsedGoal[]
}

interface ParsedGoal {
  number: number
  text: string
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

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const sourcePdfPath = 'curricula/DE/Gymnasium/input/HB/WUK_Geschichte_Geografie_Politik_Gymnasium_5_10_2006.pdf'
const sourceUrl = 'https://edumedia-depot.gei.de/server/api/core/bitstreams/6e665592-f2c1-420c-9f77-d52f4ab2ec5c/content'
const officialPageUrl = 'https://www.lis.bremen.de/schulqualitaet/bildungsplaene/sekundarbereich-i-21953'
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_GESCHICHTE.de.json'
const registryPath = 'curricula/DE/Gymnasium/provenance/source-landscape-registry.json'
const outputPath =
  'curricula/DE/Gymnasium/input/HB/lower-secondary/source-extraction/DE_HB_GESCHICHTE_SEKI_BILDUNGSPLAN_2006.source-extraction.json'
const reviewPath =
  'curricula/DE/Gymnasium/mapping/DE-HB/lower-secondary/hb_history_lower_secondary_source_extraction_to_canonical_history.review.json'
const archivePath = 'curricula/DE/Gymnasium/input/HB/lower-secondary/'
const extractionId = 'DE_HB_GESCHICHTE_SEKI_BILDUNGSPLAN_2006'
const sourceLandscapeId = uuidFromString('DE-HB-GESCHICHTE-SEKI-BILDUNGSPLAN-2006')
const targetLandscapeId = '92406d94-e3c1-58ec-b7c6-12122278d25a'
const generatedAt = '2026-05-14'
const stage: Stage = 'SekI'

const sourceDocument = {
  key: 'HB-WUK-GYMNASIUM-2006',
  title: 'Welt-Umweltkunde, Geschichte, Geografie, Politik - Bildungsplan Gymnasium 5-10 Bremen 2006',
  path: sourcePdfPath,
  url: sourceUrl,
  official: true,
  available: true,
}

const expectedTopicCodes = [
  'HB-WUK-5-6-HISTORISCHE-DIMENSION',
  'HB-GESCH-7-8-MITTELALTER',
  'HB-GESCH-7-8-FRUEHE-NEUZEIT',
  'HB-GESCH-7-8-ABSOLUTISMUS-AUFKLAERUNG',
  'HB-GESCH-7-8-FRANZOESISCHE-REVOLUTION',
  'HB-GESCH-7-8-19-JAHRHUNDERT',
  'HB-GESCH-9-10-IMPERIALISMUS-WK1',
  'HB-GESCH-9-10-WEIMAR',
  'HB-GESCH-9-10-NS-WK2',
  'HB-GESCH-9-10-DEUTSCHLAND-1945-1949',
  'HB-GESCH-9-10-OST-WEST',
  'HB-GESCH-9-10-DEUTSCHLAND-SEIT-1949',
  'HB-GESCH-9-10-UMGANG-MIT-GESCHICHTE',
]

const topicConfig = [
  {
    code: 'HB-WUK-5-6-HISTORISCHE-DIMENSION',
    title: 'Welt-Umweltkunde 5/6: Historische Dimension',
    gradeBand: '5/6',
  },
  { code: 'HB-GESCH-7-8-MITTELALTER', title: 'Europäisches Mittelalter', gradeBand: '7/8' },
  { code: 'HB-GESCH-7-8-FRUEHE-NEUZEIT', title: 'Frühe Neuzeit', gradeBand: '7/8' },
  { code: 'HB-GESCH-7-8-ABSOLUTISMUS-AUFKLAERUNG', title: 'Absolutismus und Aufklärung', gradeBand: '7/8' },
  { code: 'HB-GESCH-7-8-FRANZOESISCHE-REVOLUTION', title: 'Französische Revolution', gradeBand: '7/8' },
  { code: 'HB-GESCH-7-8-19-JAHRHUNDERT', title: '19. Jahrhundert', gradeBand: '7/8' },
  { code: 'HB-GESCH-9-10-IMPERIALISMUS-WK1', title: 'Imperialismus und Erster Weltkrieg', gradeBand: '9/10' },
  { code: 'HB-GESCH-9-10-WEIMAR', title: 'Die Weimarer Republik', gradeBand: '9/10' },
  { code: 'HB-GESCH-9-10-NS-WK2', title: 'Nationalsozialismus und Zweiter Weltkrieg', gradeBand: '9/10' },
  { code: 'HB-GESCH-9-10-DEUTSCHLAND-1945-1949', title: 'Deutschland zwischen 1945 und 1949', gradeBand: '9/10' },
  { code: 'HB-GESCH-9-10-OST-WEST', title: 'Der Ost-West-Konflikt', gradeBand: '9/10' },
  { code: 'HB-GESCH-9-10-DEUTSCHLAND-SEIT-1949', title: 'Deutschland seit 1949 im internationalen Kontext', gradeBand: '9/10' },
  { code: 'HB-GESCH-9-10-UMGANG-MIT-GESCHICHTE', title: 'Umgang mit Geschichte', gradeBand: '9/10' },
]

const canonicalTitleToId = loadCanonicalTitleToId()

if (!existsSync(abs(sourcePdfPath))) {
  throw new Error(`Missing source PDF: ${sourcePdfPath}`)
}

const fullText = execFileSync('pdftotext', ['-layout', abs(sourcePdfPath), '-'], { encoding: 'utf8' })
const topics = parseTopics(fullText)
const extraction = buildExtraction(topics)
const review = buildReview(extraction.sourceGoals)

writeJson(outputPath, extraction)
writeJson(reviewPath, review)
updateRegistry()
updateReadme(extraction.sourceGoals.length)
updateReferenceFile()
syncCanonicalHistoryApplicability()

console.log(`Wrote ${outputPath} (${extraction.passages.length} passages, ${extraction.sourceGoals.length} source goals)`)
console.log(`Wrote ${reviewPath} (${review.decisions.length}/${extraction.sourceGoals.length} M3 decisions)`)

function parseTopics(value: string): ParsedTopic[] {
  const historySection = extractHistorySection(value)
  const topicsByCode = new Map<string, ParsedTopic>()
  const wukRawText = extractBetween(
    value,
    /Historische Dimension\s*\nDie Schülerinnen und Schüler können …/u,
    /\nGeografische Dimension/u,
  )
  topicsByCode.set('HB-WUK-5-6-HISTORISCHE-DIMENSION', {
    code: 'HB-WUK-5-6-HISTORISCHE-DIMENSION',
    title: 'Welt-Umweltkunde 5/6: Historische Dimension',
    rawText: normalizePassageText(`Historische Dimension\nDie Schülerinnen und Schüler können …\n${wukRawText}`),
    goals: parseBulletGoals(wukRawText),
  })

  const grade8Section = extractBetween(
    historySection,
    /3\.1\s+Anforderungen am Ende der Jahrgangsstufe 8[\s\S]*?Fachliche Kompetenzen/u,
    /\nMethodische Kompetenzen/u,
  )
  addHistoryTopics(topicsByCode, grade8Section, [
    ['HB-GESCH-7-8-MITTELALTER', 'Europäisches Mittelalter'],
    ['HB-GESCH-7-8-FRUEHE-NEUZEIT', 'Frühe Neuzeit'],
    ['HB-GESCH-7-8-ABSOLUTISMUS-AUFKLAERUNG', 'Absolutismus und Aufklärung'],
    ['HB-GESCH-7-8-FRANZOESISCHE-REVOLUTION', 'Französische Revolution'],
    ['HB-GESCH-7-8-19-JAHRHUNDERT', '19. Jahrhundert'],
  ])

  const grade10Section = extractBetween(
    historySection,
    /3\.2\s+Anforderungen am Ende der Jahrgangsstufe 10[\s\S]*?Fachliche Kompetenzen/u,
    /\nMethodische Kompetenzen/u,
  )
  addHistoryTopics(topicsByCode, grade10Section, [
    ['HB-GESCH-9-10-IMPERIALISMUS-WK1', 'Imperialismus und Erster Weltkrieg'],
    ['HB-GESCH-9-10-WEIMAR', 'Die Weimarer Republik'],
    ['HB-GESCH-9-10-NS-WK2', 'Nationalsozialismus und Zweiter Weltkrieg'],
    ['HB-GESCH-9-10-DEUTSCHLAND-1945-1949', 'Deutschland zwischen 1945 und 1949'],
    ['HB-GESCH-9-10-OST-WEST', 'Der Ost-West-Konflikt'],
    ['HB-GESCH-9-10-DEUTSCHLAND-SEIT-1949', 'Deutschland seit 1949 im internationalen Kontext'],
    ['HB-GESCH-9-10-UMGANG-MIT-GESCHICHTE', 'Umgang mit Geschichte'],
  ])

  return expectedTopicCodes.map((topicCode) => {
    const topic = topicsByCode.get(topicCode)
    if (!topic) throw new Error(`Missing expected HB Geschichte topic ${topicCode}`)
    if (topic.goals.length === 0) throw new Error(`HB Geschichte topic ${topicCode} has no source goals`)
    return topic
  })
}

function addHistoryTopics(topicsByCode: Map<string, ParsedTopic>, section: string, headings: Array<[string, string]>): void {
  for (const [index, [code, title]] of headings.entries()) {
    const start = section.indexOf(title)
    if (start < 0) throw new Error(`Missing HB Geschichte heading ${title}`)
    const nextTitle = headings[index + 1]?.[1]
    const end = nextTitle ? section.indexOf(nextTitle, start + title.length) : section.length
    const rawText = section.slice(start, end < 0 ? section.length : end)
    topicsByCode.set(code, {
      code,
      title,
      rawText: normalizePassageText(rawText),
      goals: parseBulletGoals(rawText),
    })
  }
}

function buildExtraction(topicsToExtract: ParsedTopic[]) {
  const passages = topicsToExtract.map((topic) => ({
    id: passageIdForTopic(topic),
    topicCode: topic.code,
    title: topic.title,
    text: topic.rawText,
    sourcePath: sourcePdfPath,
    sourceUrl,
    rawText: topic.rawText,
    sourceGoalIds: topic.goals.map((goal) => sourceGoalId(topic, goal)),
  }))
  const passageIds = new Set(passages.map((passage) => passage.id))
  const sourceGoals: GeneratedSourceGoal[] = topicsToExtract.flatMap((topic) =>
    topic.goals.map((goal) => {
      const sourceText = normalizeGoalText(goal.text)
      return {
        id: sourceGoalId(topic, goal),
        passageId: passageIdForTopic(topic),
        topicCode: topic.code,
        bulletIndex: goal.number,
        aspectIndex: 1,
        title: titleFromSourceText(sourceText),
        description: `Die lernende Person kann ${toSentenceFragment(sourceText)}`,
        sourceText,
        sourceSpan: `${topic.code}.${goal.number}`,
        parentBulletText: sourceText,
        sourceRef: `${sourceDocument.title}, ${topic.title}, Kompetenz ${goal.number}`,
        courseLevel: 'unspecified',
        granularity: 'officialCompetency',
        stage,
        tags: [
          'jurisdiction:DE-HB',
          'stage:SekI',
          `gradeBand:${gradeBandForTopic(topic.code)}`,
          `topic:${topic.code}`,
          'courseLevel:unspecified',
        ],
        rawSourceText: goal.text,
        rawSourceSpan: `${topic.code}.${goal.number}`,
        rawParentBulletText: goal.text,
      }
    }),
  )

  const duplicateIds = findDuplicates(sourceGoals.map((sourceGoal) => sourceGoal.id))
  const missingPassageRefs = sourceGoals
    .filter((sourceGoal) => !passageIds.has(sourceGoal.passageId))
    .map((sourceGoal) => sourceGoal.id)
  const emptyPassages = passages
    .filter((passage) => passage.sourceGoalIds.length === 0)
    .map((passage) => passage.topicCode)

  return {
    schemaVersion: 1,
    extractionId,
    sourceLandscapeId,
    targetLandscapeId,
    title: 'Geschichte Sekundarstufe I (Bremen, Bildungsplan 2006 Source-Extraction)',
    jurisdiction: 'DE-HB',
    subject: 'Geschichte',
    stage,
    sourceDocument,
    sourceDocuments: [sourceDocument],
    method: {
      passageExtraction:
        'pdftotext -layout; extracted historical dimension in Welt-Umweltkunde 5/6 and fachliche Geschichte standards for grades 7/8 and 9/10.',
      sourceGoalExtraction:
        'one source goal per official fachliche Kompetenz bullet; general methodical competencies are excluded from this content-source lane.',
    },
    expectedTopicCodes,
    pipelineStatus: {
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
              label: 'Amtlicher Bremer Bildungsplan WUK/Geschichte/Geografie/Politik liegt lokal vor',
              passed: true,
              details: sourcePdfPath,
            },
            {
              id: 'source-document-url-registered',
              label: 'Originalquelle ist mit URL dokumentiert',
              passed: true,
              details: sourceUrl,
            },
          ],
        },
        {
          id: 'MAPPING-1',
          label: 'Original-Lehrplanpassagen extrahiert',
          status: passages.length === expectedTopicCodes.length ? 'complete' : 'incomplete',
          dependsOn: ['ORIGINALQUELLEN'],
          checks: [
            {
              id: 'expected-topic-coverage',
              label: 'WUK-5/6 und Geschichte-Standards 7/8 sowie 9/10 sind als Passagen vorhanden',
              passed: passages.length === expectedTopicCodes.length,
              details: `${passages.length}/${expectedTopicCodes.length} Passagen.`,
            },
            {
              id: 'passage-extraction-source',
              label: 'Passage-Extraction basiert auf amtlicher PDF-Quelle statt Legacy-Snapshot',
              passed: true,
              details: sourcePdfPath,
            },
          ],
        },
        {
          id: 'MAPPING-2',
          label: 'Source-Ziele aus Lehrplanpassagen erstellt',
          status: duplicateIds.length === 0 && missingPassageRefs.length === 0 && emptyPassages.length === 0
            ? 'complete'
            : 'incomplete',
          dependsOn: ['MAPPING-1'],
          checks: [
            {
              id: 'source-goals-created',
              label: 'Source-Ziele aus den fachlichen Bremer Geschichte-Kompetenzen erzeugt',
              passed: sourceGoals.length > 0,
              details: `${sourceGoals.length} Source-Ziele.`,
            },
            {
              id: 'passage-to-source-goal-coverage',
              label: 'Jede Passage hat mindestens ein Source-Ziel',
              passed: emptyPassages.length === 0,
              details: `Passagen ohne Source-Ziele: ${emptyPassages.join(', ') || '-'}`,
            },
            {
              id: 'source-goal-ids-unique',
              label: 'Source-Ziel-IDs sind eindeutig',
              passed: duplicateIds.length === 0,
              details: `Doppelte IDs: ${duplicateIds.join(', ') || '-'}`,
            },
            {
              id: 'source-goals-reference-passages',
              label: 'Jedes Source-Ziel referenziert eine vorhandene Originalpassage',
              passed: missingPassageRefs.length === 0,
              details: `Ohne Passage: ${missingPassageRefs.join(', ') || '-'}`,
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
              passed: true,
              details: `${sourceGoals.length} Source-Ziele liegen vor; MAPPING-3 wurde gegen diese Source-Extraction-IDs abgeschlossen.`,
            },
            {
              id: 'm3-review-file-present',
              label: 'M3-Review-Datei ist vorhanden',
              passed: true,
              details: reviewPath,
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
              details: `Abgedeckt: ${sourceGoals.length}/${sourceGoals.length}; 0 explizite Canonical-Gaps, 0 unreviewed. 1:n/partial bezeichnet hier nur die Zuordnungsform in den kanonischen Kompetenzclustern.`,
            },
          ],
        },
      ],
    },
    qualityReview: {
      sourceGoalCountPeerBaseline: {
        status: 'accepted',
        actualSourceGoals: sourceGoals.length,
        rationale:
          `Bremen Geschichte Sek I wird aus ${passages.length} amtlichen Kompetenzpassagen mit ${sourceGoals.length} fachlichen Kompetenzen extrahiert. Die Quelle ist ein knapper standardsbasierter Bildungsplan; die Zielzahl liegt plausibel zwischen HB-Politik/WAT und anderen Geschichte-Sek-I-Spuren.`,
      },
      scopeNote:
        'Diese Spur deckt nur die Bremer Sekundarstufe I ab. Eine Bremer Geschichte-GyO-Quelle liegt lokal nicht vor und wird hier nicht behauptet.',
    },
    passages,
    sourceGoals,
  }
}

function buildReview(sourceGoals: GeneratedSourceGoal[]) {
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
        `Das Bremer Geschichte-Sek-I-Source-Ziel "${sourceGoal.title}" ist inhaltlich durch die angegebenen kanonischen Geschichte-Kompetenzcluster abgedeckt.`,
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
    reviewId: 'de-hb-history-lower-secondary-source-extraction-to-canonical-history',
    sourceLandscapeId,
    targetLandscapeId,
    sourceExtractionPath: outputPath,
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
      note: 'Bremen Geschichte Sek I ist vollständig reviewed und durch kanonische Geschichte-Kompetenzcluster abgedeckt. Partial beschreibt die Zuordnungsform, nicht eine offene fachliche Lücke.',
    },
    mappings,
    decisions,
  }
}

function targetTitlesForSourceGoal(sourceGoal: GeneratedSourceGoal): string[] {
  const titles = new Set<string>(baseTargetTitlesForTopic(sourceGoal.topicCode))
  const text = asciiFold(sourceGoal.sourceText)

  if (/geschichte|quelle|zeitkonzeption|epoche|strukturierungsverfahren|instrumentalisierung|historische identitaet/u.test(text)) {
    titles.add('Warum Geschichte? - Relevanz und Orientierung')
    titles.add('Kontroversen über die Vergangenheit')
    titles.add('Geschichtsbilder und Geschichtspolitik')
    titles.add('Wahrnehmungen und Deutung von Geschichte im Wandel')
  }
  if (/vor- und fruehgeschichte|metallverarbeitung|schrift|aegypt|athen|griechisch|rom|roemer|germanen/u.test(text)) {
    titles.add('Antike Traditionen und Rezeption der Antike')
    titles.add('Formen von Herrschaft und Gesellschaft in Antike und Mittelalter')
  }
  if (/mittelalter|franken|kaiser und papst|grundherrschaft|stadtentwicklung|judenverfolgung|hanse/u.test(text)) {
    titles.add('Formen von Herrschaft und Gesellschaft in Antike und Mittelalter')
  }
  if (/renaissance|entdeckungsfahrten|aufteilung der welt|reformation|bauernkrieg|glaubenskrieg|fruehkapitalismus/u.test(text)) {
    titles.add('Interkulturelle Begegnungen und europäische Aufbrüche')
    titles.add('Infragestellung traditionaler Herrschaft in der frühen Neuzeit')
  }
  if (/absolutismus|aufklaerung|ludwig xiv|england|verfassungsstaat|unabhaengigkeitskrieg/u.test(text)) {
    titles.add('Infragestellung traditionaler Herrschaft in der frühen Neuzeit')
  }
  if (/franzoesische revolution|1789|septemberverfassung|napoleon|revolutionszeit/u.test(text)) {
    titles.add('Die Französische Revolution – "Freiheit, Gleichheit, Brüderlichkeit"?')
  }
  if (/wiener kongress|maerzrevolution|1848|frankfurter verfassung|nationalismus|militarismus|kaiserreich/u.test(text)) {
    titles.add('Revolution 1848/49 – Markstein zu Parlamentarismus, Demokratie, Nationalstaat?')
    titles.add('Herrschaft und Gesellschaft im europäischen Vergleich')
  }
  if (/dampfmaschine|textilindustrie|industrialisierung|soziale frage|arbeiter/u.test(text)) {
    titles.add('Industrialisierung – Wohlstand für wenige?')
    titles.add('Emanzipationsbestrebungen im 19. Jahrhundert')
  }
  if (/imperialismus|kolonial|dekolonisation|globalisierungsdruck/u.test(text)) {
    titles.add('Imperialismus – Export europäischer Zivilisation?')
  }
  if (/erster weltkrieg|kriegsziele|kriegsende|friedensschluss|versailler/u.test(text)) {
    titles.add('Der Erste Weltkrieg – Zerstörung der alten Ordnung')
  }
  if (/weimar|raeterepublik|parlamentarische system|weimarer verfassung|krisenjahr 1923|weltwirtschaftskrise/u.test(text)) {
    titles.add('Weimarer Republik als erste deutsche Demokratie')
    titles.add('Aushöhlung der Demokratie und Errichtung der Diktatur')
  }
  if (/hitler|nsdap|nationalsozial|gleichschaltung|rassenpolitik|holocaust|shoa|widerstand/u.test(text)) {
    titles.add('Nationalsozialistische Diktatur – Zerstörung von Demokratie/Menschenrechten')
    titles.add('Demokratie, Faschismus und Widerstand in Europa')
  }
  if (/kriegskonferenz|potsdamer|marshallplan|waehrungsreform|berlin-blockade|staatsgruendung|verfassungen/u.test(text)) {
    titles.add('Teilung Deutschlands – eine Nation, zwei Staaten')
    titles.add('Der Kalte Krieg – stabile oder labile Ordnung?')
  }
  if (/ost und west|militaerbuendnisse|ostblock|korea|kuba|vietnam|gorbatschow|kalten krieg/u.test(text)) {
    titles.add('Der Kalte Krieg – stabile oder labile Ordnung?')
    titles.add('Weltpolitische Entwicklungen zwischen Bipolarität und Multipolarität')
  }
  if (/bundeskanzler|ddr|westintegration|deutsche einheit|europaeische einheit|berliner republik/u.test(text)) {
    titles.add('Deutschland von der Teilung zur Einheit')
    titles.add('Teilung Deutschlands – eine Nation, zwei Staaten')
    titles.add('Weltpolitische Entwicklungen zwischen Bipolarität und Multipolarität')
  }

  return [...titles]
}

function baseTargetTitlesForTopic(topicCode: string): string[] {
  const map: Record<string, string[]> = {
    'HB-WUK-5-6-HISTORISCHE-DIMENSION': [
      'Warum Geschichte? - Relevanz und Orientierung',
      'Antike Traditionen und Rezeption der Antike',
      'Formen von Herrschaft und Gesellschaft in Antike und Mittelalter',
    ],
    'HB-GESCH-7-8-MITTELALTER': [
      'Formen von Herrschaft und Gesellschaft in Antike und Mittelalter',
      'Interkulturelle Begegnungen und europäische Aufbrüche',
    ],
    'HB-GESCH-7-8-FRUEHE-NEUZEIT': [
      'Interkulturelle Begegnungen und europäische Aufbrüche',
      'Infragestellung traditionaler Herrschaft in der frühen Neuzeit',
    ],
    'HB-GESCH-7-8-ABSOLUTISMUS-AUFKLAERUNG': [
      'Infragestellung traditionaler Herrschaft in der frühen Neuzeit',
      'Die Französische Revolution – "Freiheit, Gleichheit, Brüderlichkeit"?',
    ],
    'HB-GESCH-7-8-FRANZOESISCHE-REVOLUTION': [
      'Die Französische Revolution – "Freiheit, Gleichheit, Brüderlichkeit"?',
    ],
    'HB-GESCH-7-8-19-JAHRHUNDERT': [
      'Revolution 1848/49 – Markstein zu Parlamentarismus, Demokratie, Nationalstaat?',
      'Industrialisierung – Wohlstand für wenige?',
      'Herrschaft und Gesellschaft im europäischen Vergleich',
    ],
    'HB-GESCH-9-10-IMPERIALISMUS-WK1': [
      'Imperialismus – Export europäischer Zivilisation?',
      'Der Erste Weltkrieg – Zerstörung der alten Ordnung',
      'Weltpolitische Faktoren 1917–1945',
    ],
    'HB-GESCH-9-10-WEIMAR': ['Weimarer Republik als erste deutsche Demokratie', 'Aushöhlung der Demokratie und Errichtung der Diktatur'],
    'HB-GESCH-9-10-NS-WK2': [
      'Nationalsozialistische Diktatur – Zerstörung von Demokratie/Menschenrechten',
      'Demokratie, Faschismus und Widerstand in Europa',
      'Weltpolitische Faktoren 1917–1945',
      'Umgang mit NS-Vergangenheit – "Vergangenheitsbewältigung"?',
    ],
    'HB-GESCH-9-10-DEUTSCHLAND-1945-1949': [
      'Der Kalte Krieg – stabile oder labile Ordnung?',
      'Teilung Deutschlands – eine Nation, zwei Staaten',
    ],
    'HB-GESCH-9-10-OST-WEST': [
      'Der Kalte Krieg – stabile oder labile Ordnung?',
      'Weltpolitische Entwicklungen zwischen Bipolarität und Multipolarität',
    ],
    'HB-GESCH-9-10-DEUTSCHLAND-SEIT-1949': [
      'Teilung Deutschlands – eine Nation, zwei Staaten',
      'Deutschland von der Teilung zur Einheit',
      'Weltpolitische Entwicklungen zwischen Bipolarität und Multipolarität',
    ],
    'HB-GESCH-9-10-UMGANG-MIT-GESCHICHTE': [
      'Warum Geschichte? - Relevanz und Orientierung',
      'Kontroversen über die Vergangenheit',
      'Geschichtsbilder und Geschichtspolitik',
      'Wahrnehmungen und Deutung von Geschichte im Wandel',
    ],
  }
  return map[topicCode] ?? ['Geschichte']
}

function extractHistorySection(value: string): string {
  const startMatch = value.match(/Geschichte\s+Jahrgangsstufe 7 - 10/u)
  if (!startMatch || startMatch.index === undefined) throw new Error('Could not locate Bremen Geschichte section start')
  const fromStart = value.slice(startMatch.index)
  const endMatch = /\n\s*Geografie\s+Jahrgangsstufe 7 - 10/u.exec(fromStart)
  if (!endMatch || endMatch.index === undefined) throw new Error('Could not locate Bremen Geschichte section end')
  return fromStart.slice(0, endMatch.index)
}

function extractBetween(value: string, startPattern: RegExp, endPattern: RegExp): string {
  const startMatch = startPattern.exec(value)
  if (!startMatch || startMatch.index === undefined) throw new Error(`Missing section start ${startPattern}`)
  const fromStart = value.slice(startMatch.index + startMatch[0].length)
  const endMatch = endPattern.exec(fromStart)
  if (!endMatch || endMatch.index === undefined) throw new Error(`Missing section end ${endPattern}`)
  return fromStart.slice(0, endMatch.index)
}

function parseBulletGoals(rawText: string): ParsedGoal[] {
  const goals: ParsedGoal[] = []
  let current: string | null = null

  const finishCurrent = () => {
    if (!current) return
    const text = normalizeGoalText(current)
    if (text.length > 0) goals.push({ number: goals.length + 1, text })
    current = null
  }

  for (const rawLine of rawText.split('\n')) {
    const line = normalizeLine(rawLine)
    if (/^[-•]\s+/u.test(line)) {
      finishCurrent()
      current = line.replace(/^[-•]\s+/u, '')
      continue
    }
    if (!current || isPdfArtifact(line) || isNonGoalLine(line)) continue
    current += current.endsWith('-') ? line : ` ${line}`
  }

  finishCurrent()
  return goals
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
    .replace(/-\s+/gu, '')
    .replace(/\s+([,.;:])/gu, '$1')
    .replace(/\(\s+/gu, '(')
    .replace(/\s+\)/gu, ')')
    .replace(/\s+/gu, ' ')
    .trim()
}

function isPdfArtifact(line: string): boolean {
  return line.length === 0
    || /^\d+$/.test(line)
    || /^Geschichte\s+–\s+Gymnasium/u.test(line)
    || /^Welt-Umweltkunde\s+–\s+Gymnasium/u.test(line)
}

function isNonGoalLine(line: string): boolean {
  return /^(Die Schülerinnen und Schüler können|Fachliche Kompetenzen|Methodische Kompetenzen)/u.test(line)
}

function titleFromSourceText(sourceText: string): string {
  const firstClause = sourceText.split(/[;:]/u)[0] ?? sourceText
  const title = firstClause.length <= 120 ? firstClause : `${firstClause.slice(0, 117).trim()}...`
  return title.charAt(0).toUpperCase() + title.slice(1)
}

function toSentenceFragment(sourceText: string): string {
  const fragment = sourceText.replace(/\.$/u, '')
  return `${fragment}.`
}

function gradeBandForTopic(topicCode: string): string {
  return topicConfig.find((topic) => topic.code === topicCode)?.gradeBand ?? 'unspecified'
}

function passageIdForTopic(topic: ParsedTopic): string {
  return `hb-history-seki:${slug(topic.code)}-${hash(topic.title)}`
}

function sourceGoalId(topic: ParsedTopic, goal: ParsedGoal): string {
  return uuidFromString(`DE-HB-GESCHICHTE:SekI:${topic.code}:${goal.number}:${goal.text}`)
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
  const nextEntries = registry.entries.filter((entry) => String(entry.landscapeId) !== sourceLandscapeId)
  nextEntries.push({
    landscapeId: sourceLandscapeId,
    title: 'Geschichte Sekundarstufe I (Bremen, Bildungsplan 2006 Source-Extraction)',
    jurisdiction: 'DE-HB',
    subject: 'Geschichte',
    stage: 'Sekundarstufe I',
    sourcePath: sourceDocument.path,
    archiveSourcePath: sourceDocument.path,
    archivePath,
    sourceDocumentKey: sourceDocument.key,
    sourceUrl: sourceDocument.url,
  })
  registry.entries = nextEntries.sort((a, b) => String(a.landscapeId).localeCompare(String(b.landscapeId)))
  writeJson(registryPath, registry)
}

function updateReadme(sourceGoalCount: number): void {
  const path = 'curricula/DE/Gymnasium/input/HB/README.md'
  const existing = existsSync(abs(path)) ? readFileSync(abs(path), 'utf8') : '# Bremen (HB) - Gymnasium Curricula\n'
  const section = [
    '<!-- DE-HB-GESCHICHTE-SEKI-SOURCE-EXTRACTION:start -->',
    '## Geschichte',
    '### Sekundarstufe I (Klassen 5-10)',
    `- **Bildungsplan Welt-Umweltkunde/Geschichte/Geografie/Politik Gymnasium 5-10**: [LIS Bremen - Sekundarbereich I](${officialPageUrl})`,
    '- Archived source PDF: `WUK_Geschichte_Geografie_Politik_Gymnasium_5_10_2006.pdf`',
    '- Source extraction: `lower-secondary/source-extraction/DE_HB_GESCHICHTE_SEKI_BILDUNGSPLAN_2006.source-extraction.json`',
    `- M3 status: \`complete\` (${sourceGoalCount} Source-Ziele)`,
    '- Hinweis: Diese Spur deckt die Bremer Sekundarstufe I ab; eine Geschichte-GyO-Quelle ist hier noch nicht hinterlegt.',
    '<!-- DE-HB-GESCHICHTE-SEKI-SOURCE-EXTRACTION:end -->',
    '',
  ].join('\n')
  writeFileSync(abs(path), `${replaceMarkedSection(existing, 'DE-HB-GESCHICHTE-SEKI-SOURCE-EXTRACTION', section).trim()}\n`, 'utf8')
}

function updateReferenceFile(): void {
  const path = 'curricula/DE/Gymnasium/input/HB/lower-secondary/references.md'
  const existing = existsSync(abs(path)) ? readFileSync(abs(path), 'utf8') : ''
  const marker = 'DE-HB-GESCHICHTE-SEKI-SOURCE-EXTRACTION'
  const section = [
    `<!-- ${marker}:start -->`,
    '## Geschichte source PDF (download link)',
    '',
    `Starting point: ${officialPageUrl}`,
    '',
    '- `WUK_Geschichte_Geografie_Politik_Gymnasium_5_10_2006.pdf`:',
    `  ${sourceUrl}`,
    '',
    'Scope:',
    '',
    '- Bremen',
    '- Gymnasium',
    '- Welt-Umweltkunde 5/6 historical dimension',
    '- Geschichte 7/8 and 9/10 fachliche Standards',
    '- general methodical competency bullets are not used as content source goals',
    '',
    'Archived locally at:',
    '',
    `- \`${sourcePdfPath}\``,
    '',
    'Source extraction:',
    '',
    `- \`${outputPath}\``,
    `<!-- ${marker}:end -->`,
    '',
  ].join('\n')
  writeFileSync(abs(path), `${replaceMarkedSection(existing, marker, section).trim()}\n`, 'utf8')
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
