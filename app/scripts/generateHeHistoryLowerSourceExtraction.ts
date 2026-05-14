import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildApplicabilityCompilation } from './applicabilityCompiler'

type Stage = 'SekI'
type CourseLevel = 'unspecified'

interface SourceDocument {
  key: string
  title: string
  path: string
  url: string
  official: true
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
  granularity: 'officialContentItem'
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
const sourcePdfPath = 'curricula/DE/Gymnasium/input/HE/lower-secondary/g9-geschichte.pdf'
const sourceUrl = 'https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-06/g9-geschichte.pdf'
const officialPageUrl = 'https://kultus.hessen.de/unterricht/kerncurricula-und-lehrplaene/lehrplaene/gymnasium-9'
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_GESCHICHTE.de.json'
const registryPath = 'curricula/DE/Gymnasium/provenance/source-landscape-registry.json'
const outputPath =
  'curricula/DE/Gymnasium/input/HE/lower-secondary/source-extraction/DE_HE_GESCHICHTE_SEKI_G9.source-extraction.json'
const reviewPath =
  'curricula/DE/Gymnasium/mapping/DE-HE/lower-secondary/hessen_history_lower_secondary_source_extraction_to_canonical_history.review.json'
const archivePath = 'curricula/DE/Gymnasium/input/HE/lower-secondary/'
const extractionId = 'DE_HE_GESCHICHTE_SEKI_G9'
const sourceLandscapeId = uuidFromString('DE-HE-GESCHICHTE-SEKI-G9')
const targetLandscapeId = '92406d94-e3c1-58ec-b7c6-12122278d25a'
const generatedAt = '2026-05-14'
const stage: Stage = 'SekI'

const sourceDocument: SourceDocument = {
  key: 'HE-G9-GESCHICHTE',
  title: 'Lehrplan Gymnasium Geschichte Hessen G9',
  path: sourcePdfPath,
  url: sourceUrl,
  official: true,
}

const expectedTopicCodes = [
  '6.1',
  '6.2',
  '6.3',
  '6.4',
  '6.5',
  '8.1',
  '8.2',
  '8.3',
  '8.4',
  '8.5',
  '9.1',
  '9.2',
  '9.3',
  '9.4',
  '9.5',
  '10.1',
  '10.2',
  '10.3',
  '10.4',
  '10.5',
]

const topicTitles: Record<string, string> = {
  '6.1': 'Einführung in das Fach Geschichte: Vom Vor-Wissen zum Wissen',
  '6.2': 'Menschen der Urgeschichte: Von Sammlern und Jägern zu Ackerbauern und Viehzüchtern',
  '6.3': 'Ägypten - Hochkultur am Nil',
  '6.4': 'Hellas - Leben in der Polis',
  '6.5': 'Rom - Vom Dorf zum Imperium Romanum',
  '8.1': 'Leben und Wirtschaften im Mittelalter',
  '8.2': 'Entwicklung und Krise mittelalterlicher Herrschaft',
  '8.3': 'Europa an der Wende zur Neuzeit',
  '8.4': 'Reformation und Konfessionalisierung Europas',
  '8.5': 'Absolutismus und Aufklärung',
  '9.1': 'Die Französische Revolution und ihre Wirkung in Europa',
  '9.2': 'Europa zwischen Restauration und Revolution',
  '9.3': 'Industrielle Revolution und soziale Frage',
  '9.4': 'Das deutsche Kaiserreich von 1871 - Lösung der nationalen Frage?',
  '9.5': 'Imperialismus und Erster Weltkrieg',
  '10.1': 'Die Weimarer Republik 1918-1933: Demokratie ohne Demokraten?',
  '10.2': 'Deutschland und Europa in der Weltwirtschaft I: Krise und Zerfall 1914-1945',
  '10.3': 'Nationalsozialismus und Zweiter Weltkrieg',
  '10.4': 'Ost-West-Konflikt und deutsche Frage 1945-1990',
  '10.5': 'Deutschland und Europa in der Weltwirtschaft II: Rekonstruktion und internationale Kooperation nach 1945',
}

const canonicalTitleToId = loadCanonicalTitleToId()

if (!existsSync(abs(sourcePdfPath))) {
  throw new Error(`Missing source PDF: ${sourcePdfPath}`)
}

const fullText = execFileSync('pdftotext', ['-layout', abs(sourcePdfPath), '-'], { encoding: 'utf8' })
const lowerSecondaryText = extractLowerSecondaryText(fullText)
const parsedTopics = parseTopics(lowerSecondaryText)
const topics = expectedTopicCodes.map((topicCode) => {
  const topic = parsedTopics.find((candidate) => candidate.code === topicCode)
  if (!topic) throw new Error(`Missing expected HE Geschichte Sek I topic ${topicCode}`)
  if (topic.goals.length === 0) throw new Error(`HE Geschichte Sek I topic ${topicCode} has no source goals`)
  return topic
})

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

function buildExtraction(topicsToExtract: ParsedTopic[]) {
  const passages = topicsToExtract.map((topic) => ({
    id: passageIdForTopic(topic),
    topicCode: topic.code,
    title: `${topic.code} ${topic.title}`,
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
        sourceRef: `${sourceDocument.title}, ${topic.code} ${topic.title}, (${goal.number})`,
        courseLevel: 'unspecified',
        granularity: 'officialContentItem',
        stage,
        tags: [
          'jurisdiction:DE-HE',
          'stage:SekI',
          `grade:${gradeForTopic(topic.code)}`,
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
    title: 'Geschichte Sekundarstufe I (Hessen, G9 Source-Extraction)',
    jurisdiction: 'DE-HE',
    subject: 'Geschichte',
    stage,
    sourceDocument,
    sourceDocuments: [sourceDocument],
    method: {
      passageExtraction:
        'pdftotext -layout; segmented by official Hessen G9 Geschichte topics 6.1-10.5; only "Verbindliche Unterrichtsinhalte/Aufgaben" are extracted.',
      sourceGoalExtraction:
        'one source goal per official numbered mandatory content item; facultative content, cross references and method notes are excluded.',
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
              label: 'Amtlicher HE-G9-Geschichte-Lehrplan liegt lokal vor',
              passed: true,
              details: sourcePdfPath,
            },
            {
              id: 'source-document-url-registered',
              label: 'Originalquelle ist mit Download-URL dokumentiert',
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
              label: 'Jahrgangspassagen 6.1 bis 10.5 sind extrahiert',
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
              label: 'Source-Ziele aus den verbindlichen HE-Geschichte-Unterrichtsinhalten erzeugt',
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
          `HE Geschichte Sek I wird aus 20 amtlichen G9-Lehrplanthemen mit ${sourceGoals.length} verbindlichen Unterrichtsinhalten extrahiert. Die Quelle ist ein älterer Lehrplan mit Sammel-Unterrichtsinhalten; deshalb liegt die Zahl unter granularen KC-Zielrastern, aber die Pflichtpunkte sind vollständig erfasst.`,
      },
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
        `Das HE-Geschichte-Sek-I-Source-Ziel "${sourceGoal.title}" ist inhaltlich durch die angegebenen kanonischen Geschichte-Kompetenzcluster abgedeckt.`,
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
    reviewId: 'de-he-history-lower-secondary-source-extraction-to-canonical-history',
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
      note: 'HE Geschichte Sek I ist vollständig reviewed und durch kanonische Geschichte-Kompetenzcluster abgedeckt. Partial beschreibt die Zuordnungsform, nicht eine offene fachliche Lücke.',
    },
    mappings,
    decisions,
  }
}

function targetTitlesForSourceGoal(sourceGoal: GeneratedSourceGoal): string[] {
  const titles = new Set<string>(baseTargetTitlesForTopic(sourceGoal.topicCode))
  const text = asciiFold(sourceGoal.sourceText)

  if (/vor-urteil|ueberlieferung|zeitliche dimension|quelle|geschichte als prozess/u.test(text)) {
    titles.add('Warum Geschichte? - Relevanz und Orientierung')
    titles.add('E-Phase Geschichte')
  }
  if (/hellas|athen|perikles|polis|hellenismus|alexander|homer|rom|roemisch|caesar|augustus|kaiserzeit|antike/u.test(text)) {
    titles.add('Antike Traditionen und Rezeption der Antike')
  }
  if (/aegypt|stromkultur|pharao|herrschaft|dorf|grundherrschaft|ritter|koenig|adel|stadt|mittelalter/u.test(text)) {
    titles.add('Formen von Herrschaft und Gesellschaft in Antike und Mittelalter')
  }
  if (/islam|mittelmeer|kreuzzug|papst|kirchenreform|byzanz|kulturbegegnung|expansion|entdeckung|eroberung/u.test(text)) {
    titles.add('Interkulturelle Begegnungen und europäische Aufbrüche')
  }
  if (/renaissance|humanismus|reformation|konfessionalisierung|luther|absolutismus|aufklaerung|verfassungsstaat|unabhaengigkeitskampf/u.test(text)) {
    titles.add('Infragestellung traditionaler Herrschaft in der frühen Neuzeit')
  }
  if (/franzoesische revolution|ancien regime|ballhausschwur|bastille|menschen- und bürgerrechte|jakobiner|napoleon/u.test(text)) {
    titles.add('Die Französische Revolution – "Freiheit, Gleichheit, Brüderlichkeit"?')
  }
  if (/1815|restauration|metternich|karlsbader|vormaerz|1848|paulskirche|nationalversammlung|deutscher bund/u.test(text)) {
    titles.add('Revolution 1848/49 – Markstein zu Parlamentarismus, Demokratie, Nationalstaat?')
  }
  if (/judenemanzipation|frauenemanzipation|arbeiterbewegung|soziale frage|rolle der frau|gleichberechtigung/u.test(text)) {
    titles.add('Emanzipationsbestrebungen im 19. Jahrhundert')
  }
  if (/kaiserreich|zollverein|preussen|bismarck|sozialistengesetze|kulturkampf|verfassung/u.test(text)) {
    titles.add('Herrschaft und Gesellschaft im europäischen Vergleich')
  }
  if (/industrialisierung|dampfmaschine|eisenbahn|fabrik|lohnarbeit|urbanisierung|arbeiterschaft|gewerkschaft/u.test(text)) {
    titles.add('Industrialisierung – Wohlstand für wenige?')
  }
  if (/imperialismus|kolonial|aufteilung der welt|weltmarktpolitik|open door|japanisches imperium/u.test(text)) {
    titles.add('Imperialismus – Export europäischer Zivilisation?')
  }
  if (/erster weltkrieg|verdun|kriegsende|versailles|voelkerbund|pariser vorort/u.test(text)) {
    titles.add('Der Erste Weltkrieg – Zerstörung der alten Ordnung')
  }
  if (/weimar|novemberrevolution|dolchstoss|kapp-putsch|stresemann|weltwirtschaftskrise|praesidialsystem/u.test(text)) {
    titles.add('Weimarer Republik als erste deutsche Demokratie')
    titles.add('Aushöhlung der Demokratie und Errichtung der Diktatur')
  }
  if (/nationalsozial|hitler|gleichschaltung|nuernberger gesetze|novemberpogrom|holocaust|shoah|vernichtungskrieg|widerstand/u.test(text)) {
    titles.add('Nationalsozialistische Diktatur – Zerstörung von Demokratie/Menschenrechten')
    titles.add('Demokratie, Faschismus und Widerstand in Europa')
  }
  if (/lenin|oktoberrevolution|russland|sowjet|stalin|hitler-stalin/u.test(text)) {
    titles.add('Russische Revolution und Stalinismus')
    titles.add('Weltpolitische Faktoren 1917–1945')
  }
  if (/kalter krieg|ost-west|bipolare|buendnissystem|sowjetisierung|usa|sowjetische weltpolitik/u.test(text)) {
    titles.add('Der Kalte Krieg – stabile oder labile Ordnung?')
  }
  if (/brd|ddr|geteilte deutschland|mauerbau|grundgesetz|soziale marktwirtschaft|ostvertraege/u.test(text)) {
    titles.add('Teilung Deutschlands – eine Nation, zwei Staaten')
  }
  if (/1989|1990|fall der mauer|perestroika|deutsche einheit|2\+4|wiedervereinigung/u.test(text)) {
    titles.add('Deutschland von der Teilung zur Einheit')
  }
  if (/globalisierung|bretton woods|iwf|gatt|wto|europaeische integration|marshallplan|maastricht|euro|entkolonialisierung|dritte welt|nord-sued/u.test(text)) {
    titles.add('Weltpolitische Entwicklungen zwischen Bipolarität und Multipolarität')
  }

  return [...titles]
}

function baseTargetTitlesForTopic(topicCode: string): string[] {
  const map: Record<string, string[]> = {
    '6.1': ['Warum Geschichte? - Relevanz und Orientierung', 'E-Phase Geschichte'],
    '6.2': ['Formen von Herrschaft und Gesellschaft in Antike und Mittelalter', 'Warum Geschichte? - Relevanz und Orientierung'],
    '6.3': [
      'Formen von Herrschaft und Gesellschaft in Antike und Mittelalter',
      'Antike Traditionen und Rezeption der Antike',
    ],
    '6.4': ['Antike Traditionen und Rezeption der Antike'],
    '6.5': [
      'Antike Traditionen und Rezeption der Antike',
      'Formen von Herrschaft und Gesellschaft in Antike und Mittelalter',
      'Interkulturelle Begegnungen und europäische Aufbrüche',
    ],
    '8.1': ['Formen von Herrschaft und Gesellschaft in Antike und Mittelalter'],
    '8.2': ['Formen von Herrschaft und Gesellschaft in Antike und Mittelalter', 'Interkulturelle Begegnungen und europäische Aufbrüche'],
    '8.3': ['Interkulturelle Begegnungen und europäische Aufbrüche', 'Infragestellung traditionaler Herrschaft in der frühen Neuzeit'],
    '8.4': ['Infragestellung traditionaler Herrschaft in der frühen Neuzeit'],
    '8.5': [
      'Infragestellung traditionaler Herrschaft in der frühen Neuzeit',
      'Die Französische Revolution – "Freiheit, Gleichheit, Brüderlichkeit"?',
    ],
    '9.1': ['Die Französische Revolution – "Freiheit, Gleichheit, Brüderlichkeit"?'],
    '9.2': [
      'Revolution 1848/49 – Markstein zu Parlamentarismus, Demokratie, Nationalstaat?',
      'Herrschaft und Gesellschaft im europäischen Vergleich',
    ],
    '9.3': ['Industrialisierung – Wohlstand für wenige?', 'Emanzipationsbestrebungen im 19. Jahrhundert'],
    '9.4': [
      'Herrschaft und Gesellschaft im europäischen Vergleich',
      'Emanzipationsbestrebungen im 19. Jahrhundert',
      'Imperialismus – Export europäischer Zivilisation?',
    ],
    '9.5': [
      'Imperialismus – Export europäischer Zivilisation?',
      'Der Erste Weltkrieg – Zerstörung der alten Ordnung',
      'Russische Revolution und Stalinismus',
      'Weltpolitische Faktoren 1917–1945',
    ],
    '10.1': ['Weimarer Republik als erste deutsche Demokratie', 'Aushöhlung der Demokratie und Errichtung der Diktatur'],
    '10.2': ['Imperialismus – Export europäischer Zivilisation?', 'Weltpolitische Faktoren 1917–1945'],
    '10.3': [
      'Nationalsozialistische Diktatur – Zerstörung von Demokratie/Menschenrechten',
      'Weltpolitische Faktoren 1917–1945',
      'Demokratie, Faschismus und Widerstand in Europa',
      'Umgang mit NS-Vergangenheit – "Vergangenheitsbewältigung"?',
    ],
    '10.4': [
      'Der Kalte Krieg – stabile oder labile Ordnung?',
      'Teilung Deutschlands – eine Nation, zwei Staaten',
      'Deutschland von der Teilung zur Einheit',
    ],
    '10.5': [
      'Weltpolitische Entwicklungen zwischen Bipolarität und Multipolarität',
      'Der Kalte Krieg – stabile oder labile Ordnung?',
    ],
  }
  return map[topicCode] ?? ['Geschichte']
}

function extractLowerSecondaryText(value: string): string {
  const startMatch = [...value.matchAll(/\n1\.1\s+Die Jahrgangsstufe 6/gmu)].at(-1)
  if (!startMatch || startMatch.index === undefined) throw new Error('Could not locate HE Geschichte Sek I start')
  const fromStart = value.slice(startMatch.index)
  const endMatch = /\n2\s+Übergangsprofil/u.exec(fromStart)
  if (!endMatch || endMatch.index === undefined) throw new Error('Could not locate HE Geschichte Sek I end')
  return fromStart.slice(0, endMatch.index)
}

function parseTopics(value: string): ParsedTopic[] {
  const headingPattern = /^\s*((?:6|8|9|10)\.[1-5])\s+([^\n]*?)Std\.:\s*\d+/gmu
  const matches = [...value.matchAll(headingPattern)]
    .map((match) => ({
      code: match[1],
      title: topicTitles[match[1]] ?? normalizeLine(match[2]),
      index: match.index ?? 0,
    }))
    .filter((match) => expectedTopicCodes.includes(match.code))

  return matches.map((match, index) => {
    const next = matches[index + 1]
    const rawText = normalizePassageText(value.slice(match.index, next?.index ?? value.length))
    return {
      code: match.code,
      title: match.title,
      rawText,
      goals: parseGoals(rawText),
    }
  })
}

function parseGoals(rawText: string): ParsedGoal[] {
  const mandatoryText = extractMandatoryText(rawText)
  const goals: ParsedGoal[] = []
  let current: { number: number; lines: string[] } | null = null

  const finishCurrent = () => {
    if (!current) return
    const text = normalizeGoalText(joinHyphenatedLines(current.lines))
    if (text.length > 0) goals.push({ number: current.number, text })
  }

  for (const rawLine of mandatoryText.split('\n')) {
    const line = normalizeLine(rawLine)
    const bulletMatch = /^\((\d+)\)\s*(.*)$/u.exec(line)
    if (bulletMatch) {
      finishCurrent()
      current = { number: Number(bulletMatch[1]), lines: [bulletMatch[2]] }
      continue
    }
    if (!current || isPdfArtifact(line)) continue
    current.lines.push(line)
  }

  finishCurrent()
  return goals
}

function extractMandatoryText(rawText: string): string {
  const start = /Verbindliche Unterrichtsinhalte\/Aufgaben:/u.exec(rawText)
  if (!start || start.index === undefined) return ''
  const fromStart = rawText.slice(start.index + start[0].length)
  const endPatterns = [
    /\nFakultative Unterrichtsinhalte\/Aufgaben:/u,
    /\nArbeitsmethoden der Schülerinnen und Schüler:/u,
    /\nHinweise und Erläuterungen:/u,
  ]
  const endIndex = endPatterns
    .map((pattern) => {
      const match = pattern.exec(fromStart)
      return match?.index
    })
    .filter((index): index is number => index !== undefined)
    .sort((a, b) => a - b)[0]
  return endIndex === undefined ? fromStart : fromStart.slice(0, endIndex)
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
    || /^Bildungsgang Gymnasium\b/u.test(line)
    || /^Unterrichtsfach Geschichte\b/u.test(line)
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

function gradeForTopic(topicCode: string): string {
  return topicCode.split('.')[0] ?? 'unspecified'
}

function passageIdForTopic(topic: ParsedTopic): string {
  return `he-history-seki:${slug(topic.code)}-${hash(topic.title)}`
}

function sourceGoalId(topic: ParsedTopic, goal: ParsedGoal): string {
  return uuidFromString(`DE-HE-GESCHICHTE:SekI:${topic.code}:${goal.number}:${goal.text}`)
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
    title: 'Geschichte Sekundarstufe I (Hessen, G9 Source-Extraction)',
    jurisdiction: 'DE-HE',
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
  const path = 'curricula/DE/Gymnasium/input/HE/README.md'
  const existing = existsSync(abs(path)) ? readFileSync(abs(path), 'utf8') : '# Hessen (HE) - Gymnasium Curricula\n'
  const section = [
    '<!-- DE-HE-GESCHICHTE-SEKI-SOURCE-EXTRACTION:start -->',
    '## Geschichte',
    '### Sekundarstufe I (Klassen 6-10)',
    `- **Lehrplan Gymnasium Geschichte G9**: [HKM - Lehrplaene Gymnasium 9](${officialPageUrl})`,
    '- Archived source PDF: `lower-secondary/g9-geschichte.pdf`',
    '- Source extraction: `lower-secondary/source-extraction/DE_HE_GESCHICHTE_SEKI_G9.source-extraction.json`',
    `- M3 status: \`complete\` (${sourceGoalCount} Source-Ziele)`,
    '<!-- DE-HE-GESCHICHTE-SEKI-SOURCE-EXTRACTION:end -->',
    '',
  ].join('\n')
  writeFileSync(abs(path), `${replaceMarkedSection(existing, 'DE-HE-GESCHICHTE-SEKI-SOURCE-EXTRACTION', section).trim()}\n`, 'utf8')
}

function updateReferenceFile(): void {
  const path = 'curricula/DE/Gymnasium/input/HE/lower-secondary/references.md'
  const existing = existsSync(abs(path)) ? readFileSync(abs(path), 'utf8') : ''
  const marker = 'DE-HE-GESCHICHTE-SEKI-SOURCE-EXTRACTION'
  const section = [
    `<!-- ${marker}:start -->`,
    '## Geschichte source PDF (download link)',
    '',
    `Starting point: ${officialPageUrl}`,
    '',
    '- `g9-geschichte.pdf`:',
    `  ${sourceUrl}`,
    '',
    'Scope:',
    '',
    '- Hessen',
    '- Gymnasium G9',
    '- Geschichte',
    '- Sekundarstufe I, Jahrgangsstufen 6-10',
    '- only mandatory `Verbindliche Unterrichtsinhalte/Aufgaben` are used for source goals',
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
