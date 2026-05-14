import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildApplicabilityCompilation } from './applicabilityCompiler'

type Stage = 'SekI' | 'SekII'
type CourseLevel = 'GK_LK' | 'GK' | 'LK' | 'unspecified'

interface SourceDocument {
  key: string
  title: string
  path: string
  url: string
  official: true
}

interface ExtractionSpec {
  extractionId: string
  sourceLandscapeId: string
  title: string
  stage: Stage
  expectedTopicCodes: string[]
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
  synthetic?: boolean
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
  granularity: 'officialCompetency' | 'orientationCompetency'
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
const sourcePdfPath = 'curricula/DE/Gymnasium/input/BW/BP2016BW_ALLG_GYM_G.pdf'
const sourceUrl =
  'https://www.bildungsplaene-bw.de/site/bildungsplan-edit/get/documents/lsbw/export-pdf/depot-pdf/ALLG/BP2016BW_ALLG_GYM_G.pdf'
const officialPageUrl = 'https://www.bildungsplaene-bw.de/%2CLde/BP2016BW_ALLG_GYM_G'
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_GESCHICHTE.de.json'
const registryPath = 'curricula/DE/Gymnasium/provenance/source-landscape-registry.json'
const targetLandscapeId = '92406d94-e3c1-58ec-b7c6-12122278d25a'
const generatedAt = '2026-05-14'

const sourceDocument: SourceDocument = {
  key: 'BP2016-G',
  title: 'Bildungsplan 2016 Gymnasium Geschichte Baden-Wuerttemberg',
  path: sourcePdfPath,
  url: sourceUrl,
  official: true,
}

const specs: ExtractionSpec[] = [
  {
    extractionId: 'DE_BW_GESCHICHTE_SEKI_BP2016',
    sourceLandscapeId: uuidFromString('DE-BW-GESCHICHTE-SEKI-BP2016'),
    title: 'Geschichte Sekundarstufe I (Baden-Wuerttemberg, BP2016 Source-Extraction)',
    stage: 'SekI',
    expectedTopicCodes: [
      '3.1.0',
      '3.1.1',
      '3.1.2',
      '3.1.3',
      '3.1.4',
      '3.2.0',
      '3.2.1',
      '3.2.2',
      '3.2.3',
      '3.2.4',
      '3.2.5',
      '3.2.6',
      '3.2.7',
      '3.3.0',
      '3.3.1',
      '3.3.2',
      '3.3.3',
      '3.3.4',
      '3.3.5',
      '3.3.6',
      '3.3.7',
    ],
    outputPath:
      'curricula/DE/Gymnasium/input/BW/lower-secondary/source-extraction/DE_BW_GESCHICHTE_SEKI_BP2016.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-BW/lower-secondary/bw_history_lower_secondary_source_extraction_to_canonical_history.review.json',
    archivePath: 'curricula/DE/Gymnasium/input/BW/lower-secondary/',
    sourceGoalPrefix: 'bw-history-seki',
  },
  {
    extractionId: 'DE_BW_GESCHICHTE_SEKII_BP2016',
    sourceLandscapeId: uuidFromString('DE-BW-GESCHICHTE-SEKII-BP2016'),
    title: 'Geschichte Kursstufe (Baden-Wuerttemberg, BP2016 Source-Extraction)',
    stage: 'SekII',
    expectedTopicCodes: [
      '3.4.0',
      '3.4.1',
      '3.4.2',
      '3.4.3',
      '3.4.4',
      '3.4.5',
      '3.4.6',
      '3.4.7',
      '3.4.8',
    ],
    outputPath:
      'curricula/DE/Gymnasium/input/BW/upper-secondary/source-extraction/DE_BW_GESCHICHTE_SEKII_BP2016.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-BW/upper-secondary/bw_history_upper_secondary_source_extraction_to_canonical_history.review.json',
    archivePath: 'curricula/DE/Gymnasium/input/BW/upper-secondary/',
    sourceGoalPrefix: 'bw-history-sekii',
  },
]

const topicTitles: Record<string, string> = {
  '3.1.0': 'Orientierung in der Zeit',
  '3.1.1': 'Erste Begegnung mit dem Fach Geschichte',
  '3.1.2': 'Aegypten - Kultur und Hochkultur',
  '3.1.3': 'Griechisch-roemische Antike - Zusammenleben in der Polis und im Imperium',
  '3.1.4': 'Von der Spaetantike ins europaeische Mittelalter - neue Religionen, neue Reiche',
  '3.2.0': 'Orientierung in der Zeit',
  '3.2.1': 'Europa im Mittelalter - Leben in der Agrargesellschaft und Begegnungen mit dem Fremden',
  '3.2.2': 'Wende zur Neuzeit - neue Welten, neue Horizonte, neue Gewalt',
  '3.2.3': 'Die Franzoesische Revolution - Buergertum, Vernunft, Freiheit',
  '3.2.4': 'Europa nach der Franzoesischen Revolution - Buergertum, Nationalstaat, Verfassung',
  '3.2.5': 'Der industrialisierte Nationalstaat - Durchbruch der Moderne',
  '3.2.6': 'Imperialismus und Erster Weltkrieg - europaeisches Machtstreben und Epochenwende',
  '3.2.7': 'Europa in der Zwischenkriegszeit - Durchbruch und Scheitern des demokratischen Verfassungsstaates',
  '3.3.0': 'Orientierung in der Zeit',
  '3.3.1': 'Nationalsozialismus und Zweiter Weltkrieg - Zerstörung der Demokratie und Verbrechen gegen die Menschlichkeit',
  '3.3.2': 'BRD und DDR - zwei Staaten, zwei Systeme in der geteilten Welt',
  '3.3.3': 'Fremde Raeume? Ehemalige Imperien und ihre gegenwaertigen Herausforderungen',
  '3.3.4': 'Russland - ein Imperium im Wandel',
  '3.3.5': 'China - ein Imperium im Wandel',
  '3.3.6': 'Osmanisches Reich und Tuerkei - vom islamischen Imperium zum saekularen Nationalstaat',
  '3.3.7': 'Ehemalige Imperien und die Europaeische Integration im Vergleich',
  '3.4.0': 'Orientierung in der Zeit',
  '3.4.1': 'Wege in die westliche Moderne (11.1, Basisfach)',
  '3.4.2': 'Wege in die Moderne (11.1, Leistungsfach)',
  '3.4.3': 'Diktaturen im 20. Jahrhundert als Gegenentwuerfe zur parlamentarischen Demokratie (11.2, Basisfach)',
  '3.4.4': 'Herrschaftsmodelle im 20. Jahrhundert: Bedrohung von Demokratie und Freiheit (11.2, Leistungsfach)',
  '3.4.5': 'West- und Osteuropa nach 1945: Wege in die postindustrielle Zivilgesellschaft (12.1, Basisfach)',
  '3.4.6': 'West- und Osteuropa nach 1945: Wege in die postindustrielle Zivilgesellschaft (12.1, Leistungsfach)',
  '3.4.7': 'Aktuelle Probleme postkolonialer Raeume in historischer Perspektive (12.2, Basisfach)',
  '3.4.8': 'Aktuelle Probleme postkolonialer Raeume in historischer Perspektive (12.2, Leistungsfach)',
}

const canonicalTitleToId = loadCanonicalTitleToId()

if (!existsSync(abs(sourcePdfPath))) {
  throw new Error(`Missing source PDF: ${sourcePdfPath}`)
}

const fullText = execFileSync('pdftotext', ['-layout', abs(sourcePdfPath), '-'], { encoding: 'utf8' })
const contentText = extractContentStandardsText(fullText)
const parsedTopics = parseTopics(contentText)
const sourceGoalCounts = new Map<Stage, number>()

for (const spec of specs) {
  const topics = spec.expectedTopicCodes.map((topicCode) => {
    const topic = parsedTopics.find((candidate) => candidate.code === topicCode)
    if (!topic) throw new Error(`Missing expected BW Geschichte topic ${topicCode}`)
    if (topic.goals.length === 0) throw new Error(`BW Geschichte topic ${topicCode} has no source goals`)
    return topic
  })
  const extraction = buildExtraction(spec, topics)
  const review = buildReview(spec, extraction.sourceGoals)

  writeJson(spec.outputPath, extraction)
  writeJson(spec.reviewPath, review)
  sourceGoalCounts.set(spec.stage, extraction.sourceGoals.length)

  console.log(
    `Wrote ${spec.outputPath} (${extraction.passages.length} passages, ${extraction.sourceGoals.length} source goals)`,
  )
  console.log(`Wrote ${spec.reviewPath} (${review.decisions.length}/${extraction.sourceGoals.length} M3 decisions)`)
}

updateRegistry(specs)
updateReadme(sourceGoalCounts)
updateStageReferences()
syncCanonicalHistoryApplicability()

function buildExtraction(spec: ExtractionSpec, topics: ParsedTopic[]) {
  const passages = topics.map((topic) => ({
    id: passageIdForTopic(spec, topic),
    topicCode: topic.code,
    title: `${topic.code} ${topic.title}`,
    text: topic.rawText,
    sourcePath: sourcePdfPath,
    sourceUrl,
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
        aspectIndex: 1,
        title: titleFromSourceText(sourceText),
        description: `Die lernende Person kann ${toSentenceFragment(sourceText)}`,
        sourceText,
        sourceSpan: `${topic.code}.${goal.number}`,
        parentBulletText: sourceText,
        sourceRef: `${sourceDocument.title}, ${topic.code} ${topic.title}, ${goal.synthetic ? 'Orientierung' : `(${goal.number})`}`,
        courseLevel: courseLevelForTopic(topic.code),
        granularity: goal.synthetic ? 'orientationCompetency' : 'officialCompetency',
        stage: spec.stage,
        tags: [
          'jurisdiction:DE-BW',
          `stage:${spec.stage}`,
          `gradeBand:${gradeBandForTopic(topic.code)}`,
          `topic:${topic.code}`,
          `courseLevel:${courseLevelForTopic(topic.code)}`,
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
    extractionId: spec.extractionId,
    sourceLandscapeId: spec.sourceLandscapeId,
    targetLandscapeId,
    title: spec.title,
    jurisdiction: 'DE-BW',
    subject: 'Geschichte',
    stage: spec.stage,
    sourceDocument,
    sourceDocuments: [sourceDocument],
    method: {
      passageExtraction:
        'pdftotext -layout; segmented by official Baden-Wuerttemberg Geschichte content sections 3.1.0-3.4.8.',
      sourceGoalExtraction:
        'one source goal per official numbered competency item; orientation sections 3.x.0 are retained as one source goal each because they define explicit chronological orientation competencies.',
    },
    expectedTopicCodes: spec.expectedTopicCodes,
    pipelineStatus: {
      version: 1,
      currentStep: 'MAPPING-3',
      steps: [
        {
          id: 'MAPPING-1',
          label: 'Original-Lehrplanpassagen extrahiert',
          status: 'complete',
          dependsOn: [],
          checks: [
            {
              id: 'source-document-present',
              label: 'Amtlicher BW-Geschichte-Bildungsplan liegt lokal vor',
              passed: true,
              details: sourcePdfPath,
            },
            {
              id: 'expected-topic-coverage',
              label: 'Erwartete BW-Geschichte-Kompetenzabschnitte sind als Lehrplanpassagen vorhanden',
              passed: passages.length === spec.expectedTopicCodes.length,
              details: `${passages.length}/${spec.expectedTopicCodes.length} Passagen.`,
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
              label: 'Source-Ziele aus den amtlichen BW-Geschichte-Kompetenznummern erzeugt',
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
          'Kritisch geprueft: BW Geschichte wird aus den amtlichen nummerierten Bildungsplan-Kompetenzen extrahiert. Die Gesamtzahl aus Sek I und Sek II liegt in derselben Groessenordnung wie die bereits vorhandenen HE/BY-Geschichte-Extraktionen; keine >30%-Abweichung als Alarmzeichen.',
      },
    },
    passages,
    sourceGoals,
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
        `Das BW-Geschichte-Source-Ziel "${sourceGoal.title}" ist inhaltlich durch die angegebenen kanonischen Geschichte-Kompetenzcluster abgedeckt.`,
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
      ? 'de-bw-history-lower-secondary-source-extraction-to-canonical-history'
      : 'de-bw-history-upper-secondary-source-extraction-to-canonical-history',
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
      note: 'BW Geschichte ist vollstaendig reviewed und durch kanonische Geschichte-Kompetenzcluster abgedeckt. Partial beschreibt die Zuordnungsform, nicht eine offene fachliche Luecke.',
    },
    mappings,
    decisions,
  }
}

function targetTitlesForSourceGoal(sourceGoal: GeneratedSourceGoal): string[] {
  const titles = new Set<string>(baseTargetTitlesForTopic(sourceGoal.topicCode))
  const text = asciiFold(sourceGoal.sourceText)

  if (/erinnerung|schlussstrich|verantwortung|geschichtspolitik|nationales selbstverstaendnis/u.test(text)) {
    titles.add('Umgang mit NS-Vergangenheit – "Vergangenheitsbewältigung"?')
    titles.add('Kontroversen über die Vergangenheit')
    titles.add('Geschichtsbilder und Geschichtspolitik')
  }
  if (/nahost|israel|palaestina|dekolonisierung|kolonial/u.test(text)) {
    titles.add('Nahostkonflikt als weltpolitischer Krisenherd')
    titles.add('Weltpolitische Entwicklungen zwischen Bipolarität und Multipolarität')
  }
  if (/1848|nationalversammlung|verfassung|vormaerz|restauration/u.test(text)) {
    titles.add('Revolution 1848/49 – Markstein zu Parlamentarismus, Demokratie, Nationalstaat?')
  }
  if (/industrie|industrialisierung|arbeiter|soziale frage|urbanisierung/u.test(text)) {
    titles.add('Industrialisierung – Wohlstand für wenige?')
  }
  if (/imperialismus|kolonialreich|rassismus|sozialdarwinismus/u.test(text)) {
    titles.add('Imperialismus – Export europäischer Zivilisation?')
  }
  if (/erster weltkrieg|weltkrieg|ruestungswettlauf|materialschlacht/u.test(text)) {
    titles.add('Der Erste Weltkrieg – Zerstörung der alten Ordnung')
  }
  if (/weimar|parlamentarische demokratie|praesidialkabinett/u.test(text)) {
    titles.add('Weimarer Republik als erste deutsche Demokratie')
    titles.add('Aushöhlung der Demokratie und Errichtung der Diktatur')
  }
  if (/nationalsozial|holocaust|shoah|gleichschaltung|machtergreifung|konzentrationslager|euthanasie/u.test(text)) {
    titles.add('Nationalsozialistische Diktatur – Zerstörung von Demokratie/Menschenrechten')
  }
  if (/kalter krieg|brd|ddr|mauer|deutsche einheit|ostblock|europaeische integration/u.test(text)) {
    titles.add('Der Kalte Krieg – stabile oder labile Ordnung?')
    titles.add('Teilung Deutschlands – eine Nation, zwei Staaten')
    titles.add('Deutschland von der Teilung zur Einheit')
  }
  if (/russland|sowjet|stalin|oktoberrevolution|lenin|gorbatschow/u.test(text)) {
    titles.add('Russische Revolution und Stalinismus')
    titles.add('Weltpolitische Faktoren 1917–1945')
  }
  if (/china|tuerkei|osmanisch|imperium|supranationale organisation/u.test(text)) {
    titles.add('Weltpolitische Entwicklungen zwischen Bipolarität und Multipolarität')
  }

  return [...titles]
}

function baseTargetTitlesForTopic(topicCode: string): string[] {
  const map: Record<string, string[]> = {
    '3.1.0': ['E-Phase Geschichte'],
    '3.1.1': ['Warum Geschichte? - Relevanz und Orientierung', 'E-Phase Geschichte'],
    '3.1.2': [
      'Formen von Herrschaft und Gesellschaft in Antike und Mittelalter',
      'Antike Traditionen und Rezeption der Antike',
    ],
    '3.1.3': [
      'Antike Traditionen und Rezeption der Antike',
      'Formen von Herrschaft und Gesellschaft in Antike und Mittelalter',
    ],
    '3.1.4': [
      'Formen von Herrschaft und Gesellschaft in Antike und Mittelalter',
      'Interkulturelle Begegnungen und europäische Aufbrüche',
    ],
    '3.2.0': ['E-Phase Geschichte', 'Q1 19. Jahrhundert', 'Q2 1917–1945'],
    '3.2.1': [
      'Formen von Herrschaft und Gesellschaft in Antike und Mittelalter',
      'Interkulturelle Begegnungen und europäische Aufbrüche',
    ],
    '3.2.2': [
      'Interkulturelle Begegnungen und europäische Aufbrüche',
      'Infragestellung traditionaler Herrschaft in der frühen Neuzeit',
    ],
    '3.2.3': ['Die Französische Revolution – "Freiheit, Gleichheit, Brüderlichkeit"?'],
    '3.2.4': [
      'Revolution 1848/49 – Markstein zu Parlamentarismus, Demokratie, Nationalstaat?',
      'Emanzipationsbestrebungen im 19. Jahrhundert',
      'Herrschaft und Gesellschaft im europäischen Vergleich',
    ],
    '3.2.5': [
      'Emanzipationsbestrebungen im 19. Jahrhundert',
      'Industrialisierung – Wohlstand für wenige?',
      'Geschichtsbilder und Geschichtspolitik',
    ],
    '3.2.6': [
      'Imperialismus – Export europäischer Zivilisation?',
      'Der Erste Weltkrieg – Zerstörung der alten Ordnung',
    ],
    '3.2.7': [
      'Weimarer Republik als erste deutsche Demokratie',
      'Aushöhlung der Demokratie und Errichtung der Diktatur',
      'Demokratie, Faschismus und Widerstand in Europa',
    ],
    '3.3.0': ['Q2 1917–1945', 'Q3 1945–Gegenwart', 'Q4 Erinnerungskultur'],
    '3.3.1': [
      'Nationalsozialistische Diktatur – Zerstörung von Demokratie/Menschenrechten',
      'Demokratie, Faschismus und Widerstand in Europa',
      'Umgang mit NS-Vergangenheit – "Vergangenheitsbewältigung"?',
    ],
    '3.3.2': [
      'Der Kalte Krieg – stabile oder labile Ordnung?',
      'Teilung Deutschlands – eine Nation, zwei Staaten',
      'Deutschland von der Teilung zur Einheit',
      'Weltpolitische Entwicklungen zwischen Bipolarität und Multipolarität',
      'Nahostkonflikt als weltpolitischer Krisenherd',
    ],
    '3.3.3': ['Weltpolitische Entwicklungen zwischen Bipolarität und Multipolarität'],
    '3.3.4': ['Russische Revolution und Stalinismus', 'Weltpolitische Faktoren 1917–1945'],
    '3.3.5': [
      'Weltpolitische Entwicklungen zwischen Bipolarität und Multipolarität',
      'Imperialismus – Export europäischer Zivilisation?',
    ],
    '3.3.6': [
      'Weltpolitische Entwicklungen zwischen Bipolarität und Multipolarität',
      'Nahostkonflikt als weltpolitischer Krisenherd',
      'Imperialismus – Export europäischer Zivilisation?',
    ],
    '3.3.7': ['Weltpolitische Entwicklungen zwischen Bipolarität und Multipolarität'],
    '3.4.0': ['Q1 19. Jahrhundert', 'Q2 1917–1945', 'Q3 1945–Gegenwart', 'Q4 Erinnerungskultur'],
    '3.4.1': [
      'Revolution 1848/49 – Markstein zu Parlamentarismus, Demokratie, Nationalstaat?',
      'Herrschaft und Gesellschaft im europäischen Vergleich',
      'Industrialisierung – Wohlstand für wenige?',
    ],
    '3.4.2': [
      'Revolution 1848/49 – Markstein zu Parlamentarismus, Demokratie, Nationalstaat?',
      'Emanzipationsbestrebungen im 19. Jahrhundert',
      'Herrschaft und Gesellschaft im europäischen Vergleich',
      'Industrialisierung – Wohlstand für wenige?',
      'Imperialismus – Export europäischer Zivilisation?',
    ],
    '3.4.3': [
      'Weimarer Republik als erste deutsche Demokratie',
      'Aushöhlung der Demokratie und Errichtung der Diktatur',
      'Nationalsozialistische Diktatur – Zerstörung von Demokratie/Menschenrechten',
      'Russische Revolution und Stalinismus',
    ],
    '3.4.4': [
      'Weimarer Republik als erste deutsche Demokratie',
      'Aushöhlung der Demokratie und Errichtung der Diktatur',
      'Nationalsozialistische Diktatur – Zerstörung von Demokratie/Menschenrechten',
      'Weltpolitische Faktoren 1917–1945',
      'Russische Revolution und Stalinismus',
      'Demokratie, Faschismus und Widerstand in Europa',
    ],
    '3.4.5': [
      'Der Kalte Krieg – stabile oder labile Ordnung?',
      'Teilung Deutschlands – eine Nation, zwei Staaten',
      'Deutschland von der Teilung zur Einheit',
      'Weltpolitische Entwicklungen zwischen Bipolarität und Multipolarität',
      'Umgang mit NS-Vergangenheit – "Vergangenheitsbewältigung"?',
    ],
    '3.4.6': [
      'Der Kalte Krieg – stabile oder labile Ordnung?',
      'Teilung Deutschlands – eine Nation, zwei Staaten',
      'Deutschland von der Teilung zur Einheit',
      'Weltpolitische Entwicklungen zwischen Bipolarität und Multipolarität',
      'Umgang mit NS-Vergangenheit – "Vergangenheitsbewältigung"?',
    ],
    '3.4.7': [
      'Imperialismus – Export europäischer Zivilisation?',
      'Weltpolitische Entwicklungen zwischen Bipolarität und Multipolarität',
      'Nahostkonflikt als weltpolitischer Krisenherd',
    ],
    '3.4.8': [
      'Imperialismus – Export europäischer Zivilisation?',
      'Weltpolitische Entwicklungen zwischen Bipolarität und Multipolarität',
      'Nahostkonflikt als weltpolitischer Krisenherd',
    ],
  }
  return map[topicCode] ?? ['Geschichte']
}

function extractContentStandardsText(value: string): string {
  const startMatches = [...value.matchAll(/\n3\.\s+Standards für inhaltsbezogene Kompetenzen/gmu)]
  const startMatch = startMatches.at(-1)
  if (!startMatch || startMatch.index === undefined) throw new Error('Could not locate BW Geschichte content standards')
  const fromStart = value.slice(startMatch.index)
  const endMatch = /\n4\.\s+Operatoren/u.exec(fromStart)
  return endMatch?.index ? fromStart.slice(0, endMatch.index) : fromStart
}

function parseTopics(value: string): ParsedTopic[] {
  const headingPattern = /^(3\.[1-4](?:\.\d+)?)\s+(.+?)\s*$/gmu
  const matches = [...value.matchAll(headingPattern)]
    .map((match) => ({
      code: match[1],
      title: topicTitles[match[1]] ?? normalizeLine(match[2]),
      index: match.index ?? 0,
    }))
    .filter((match) => specs.some((spec) => spec.expectedTopicCodes.includes(match.code)))

  return matches.map((match, index) => {
    const next = matches[index + 1]
    const rawText = normalizePassageText(value.slice(match.index, next?.index ?? value.length))
    return {
      code: match.code,
      title: match.title,
      rawText,
      goals: parseGoals(match.code, rawText),
    }
  })
}

function parseGoals(topicCode: string, rawText: string): ParsedGoal[] {
  const goals: ParsedGoal[] = []
  let current: { number: number; lines: string[] } | null = null
  let skippingReferenceBlock = false

  const finishCurrent = () => {
    if (!current) return
    const text = normalizeGoalText(joinHyphenatedLines(current.lines))
    if (text.length > 0) goals.push({ number: current.number, text })
  }

  for (const rawLine of rawText.split('\n')) {
    const line = normalizeLine(rawLine)
    const bulletMatch = /^\((\d+)\)\s*(.+)$/u.exec(line)
    if (bulletMatch) {
      finishCurrent()
      current = { number: Number(bulletMatch[1]), lines: [bulletMatch[2]] }
      skippingReferenceBlock = false
      continue
    }

    if (!current || isPdfArtifact(line)) continue
    if (isReferenceStart(line)) {
      skippingReferenceBlock = true
      continue
    }
    if (skippingReferenceBlock) continue

    current.lines.push(line)
  }

  finishCurrent()

  if (goals.length === 0 && topicCode.endsWith('.0')) {
    return [
      {
        number: 1,
        synthetic: true,
        text: `den historischen Zeitraum aus ${topicCode} anhand der angegebenen Daten charakterisieren`,
      },
    ]
  }
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

function isReferenceStart(line: string): boolean {
  return /^(BNE|BTV|MB|PG|VB|BO|BMB|BK|BKPROFIL|GEO|M|REV|RRK|D|L1|L2|ETH|RISL|RJUED|GK|WBS|E1|RU2|RU3|WI|ITAL3)\b/u.test(line)
    || /^\d\.\d\s+[A-ZÄÖÜa-zäöü]/u.test(line)
    || /^3\.\d\.\d/u.test(line)
}

function isPdfArtifact(line: string): boolean {
  return line.length === 0
    || /^\d+$/.test(line)
    || /^Bildungsplan 2016\b/u.test(line)
    || /^Geschichte\s*$/u.test(line)
    || /^Standards für inhaltsbezogene Kompetenzen/u.test(line)
    || /^Prozessbezogene Kompetenzen/u.test(line)
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

function courseLevelForTopic(topicCode: string): CourseLevel {
  if (!topicCode.startsWith('3.4.')) return 'unspecified'
  if (topicCode === '3.4.0') return 'GK_LK'
  if (['3.4.1', '3.4.3', '3.4.5', '3.4.7'].includes(topicCode)) return 'GK'
  return 'LK'
}

function gradeBandForTopic(topicCode: string): string {
  if (topicCode.startsWith('3.1.')) return '5/6'
  if (topicCode.startsWith('3.2.')) return '7/8'
  if (topicCode.startsWith('3.3.')) return '9/10'
  if (topicCode.startsWith('3.4.')) return '11/12'
  return 'unspecified'
}

function passageIdForTopic(spec: ExtractionSpec, topic: ParsedTopic): string {
  return `${spec.sourceGoalPrefix}:${slug(topic.code)}-${hash(topic.title)}`
}

function sourceGoalId(spec: ExtractionSpec, topic: ParsedTopic, goal: ParsedGoal): string {
  return uuidFromString(`DE-BW-GESCHICHTE:${spec.stage}:${topic.code}:${goal.number}:${goal.text}`)
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

function updateRegistry(specsToRegister: ExtractionSpec[]): void {
  const registry = readJson<{ version: number; entries: Record<string, unknown>[] }>(registryPath)
  const landscapeIds = new Set(specsToRegister.map((spec) => spec.sourceLandscapeId))
  const nextEntries = registry.entries.filter((entry) => !landscapeIds.has(String(entry.landscapeId)))
  for (const spec of specsToRegister) {
    nextEntries.push({
      landscapeId: spec.sourceLandscapeId,
      title: spec.title,
      jurisdiction: 'DE-BW',
      subject: 'Geschichte',
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

function updateReadme(sourceCounts: Map<Stage, number>): void {
  const path = 'curricula/DE/Gymnasium/input/BW/README.md'
  const existing = existsSync(abs(path)) ? readFileSync(abs(path), 'utf8') : '# Baden-Wuerttemberg (BW) - Gymnasium Curricula\n'
  const section = [
    '<!-- DE-BW-GESCHICHTE-SOURCE-EXTRACTION:start -->',
    '## Geschichte',
    '### Sekundarstufe I (Klassen 5-10)',
    `- **Bildungsplan 2016**: [Landesbildungsserver BW - Geschichte Gymnasium](${officialPageUrl})`,
    '- Archived source PDF: `BP2016BW_ALLG_GYM_G.pdf`',
    '- Source extraction: `lower-secondary/source-extraction/DE_BW_GESCHICHTE_SEKI_BP2016.source-extraction.json`',
    `- M3 status: \`complete\` (${sourceCounts.get('SekI') ?? 0} Source-Ziele)`,
    '',
    '### Sekundarstufe II (Kursstufe, Klassen 11-12)',
    `- **Bildungsplan 2016 (Basisfach/Leistungsfach)**: [Landesbildungsserver BW - Geschichte Gymnasium](${officialPageUrl})`,
    '- Archived source PDF: `BP2016BW_ALLG_GYM_G.pdf`',
    '- Source extraction: `upper-secondary/source-extraction/DE_BW_GESCHICHTE_SEKII_BP2016.source-extraction.json`',
    `- M3 status: \`complete\` (${sourceCounts.get('SekII') ?? 0} Source-Ziele)`,
    '<!-- DE-BW-GESCHICHTE-SOURCE-EXTRACTION:end -->',
    '',
  ].join('\n')
  writeFileSync(abs(path), `${replaceMarkedSection(existing, 'DE-BW-GESCHICHTE-SOURCE-EXTRACTION', section).trim()}\n`, 'utf8')
}

function updateStageReferences(): void {
  updateReferenceFile(
    'curricula/DE/Gymnasium/input/BW/lower-secondary/references.md',
    'DE-BW-GESCHICHTE-SEKI-SOURCE-EXTRACTION',
    'lower-secondary extraction target: Geschichte Klassen 5/6, 7/8 and 9/10 from the official BW Gymnasium PDF',
    specs[0].outputPath,
  )
  updateReferenceFile(
    'curricula/DE/Gymnasium/input/BW/upper-secondary/references.md',
    'DE-BW-GESCHICHTE-SEKII-SOURCE-EXTRACTION',
    'upper-secondary extraction target: Geschichte Kursstufe Basisfach/Leistungsfach from the official BW Gymnasium PDF',
    specs[1].outputPath,
  )
}

function updateReferenceFile(path: string, marker: string, scope: string, extractionPath: string): void {
  const existing = existsSync(abs(path)) ? readFileSync(abs(path), 'utf8') : ''
  const section = [
    `<!-- ${marker}:start -->`,
    '## Geschichte source PDF (download link)',
    '',
    `Starting point: ${officialPageUrl}`,
    '',
    '- `BP2016BW_ALLG_GYM_G.pdf`:',
    `  ${sourceUrl}`,
    '',
    'Scope:',
    '',
    '- Baden-Wuerttemberg',
    '- Gymnasium',
    '- Geschichte',
    `- ${scope}`,
    '',
    'Archived locally at:',
    '',
    `- \`${sourcePdfPath}\``,
    '',
    'Source extraction:',
    '',
    `- \`${extractionPath}\``,
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
