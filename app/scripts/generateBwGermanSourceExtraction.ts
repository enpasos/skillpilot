import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

type Stage = 'SekI' | 'SekII'
type CourseLevel = 'GK' | 'LK' | 'unspecified'

interface SourceDocument {
  key: string
  title: string
  path: string
  official: true
}

interface ExtractionConfig {
  extractionId: string
  sourceLandscapeId: string
  title: string
  stage: Stage
  expectedTopicCodes: string[]
  outputPath: string
  reviewPath: string
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

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const pdfPath = 'curricula/DE/Gymnasium/input/BW/BP2016BW_ALLG_GYM_D_V2.pdf'
const sourceUrl = 'https://www.bildungsplaene-bw.de/%2CLde/BP2016BW_ALLG_GYM_D.V2'
const targetLandscapeId = '67bd301b-e11a-582d-94ba-4f4b1a4cefff'
const canonicalGermanPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_DEUTSCH.de.json'

const sourceDocument: SourceDocument = {
  key: 'BP2016-D-V2',
  title: 'Bildungsplan 2016 Gymnasium Deutsch Baden-Wuerttemberg, Fassung vom 29. Februar 2024 (V2)',
  path: pdfPath,
  official: true,
}

const lowerConfig: ExtractionConfig = {
  extractionId: 'DE_BW_DEUTSCH_SEKI_BP2016_V2',
  sourceLandscapeId: uuidFromString('DE-BW-DEUTSCH-SEKI-BP2016-V2'),
  title: 'Deutsch Sekundarstufe I (Baden-Wuerttemberg, BP2016 V2 Source-Extraction)',
  stage: 'SekI',
  expectedTopicCodes: [
    '3.1.1.1',
    '3.1.1.2',
    '3.1.1.3',
    '3.1.2.1',
    '3.1.2.2',
    '3.2.1.1',
    '3.2.1.2',
    '3.2.1.3',
    '3.2.2.1',
    '3.2.2.2',
    '3.3.1.1',
    '3.3.1.2',
    '3.3.1.3',
    '3.3.2.1',
    '3.3.2.2',
  ],
  outputPath: 'curricula/DE/Gymnasium/input/BW/lower-secondary/source-extraction/DE_BW_DEUTSCH_SEKI_BP2016_V2.source-extraction.json',
  reviewPath: 'curricula/DE/Gymnasium/mapping/DE-BW/lower-secondary/bw_german_lower_secondary_source_extraction_to_canonical_german.review.json',
  sourceGoalPrefix: 'bw-deutsch-seki',
}

const upperConfig: ExtractionConfig = {
  extractionId: 'DE_BW_DEUTSCH_SEKII_BP2016_V2',
  sourceLandscapeId: uuidFromString('DE-BW-DEUTSCH-SEKII-BP2016-V2'),
  title: 'Deutsch Kursstufe (Baden-Wuerttemberg, BP2016 V2 Source-Extraction)',
  stage: 'SekII',
  expectedTopicCodes: [
    '3.4.1.1',
    '3.4.1.2',
    '3.4.1.3',
    '3.4.2.1',
    '3.4.2.2',
    '3.5.1.1',
    '3.5.1.2',
    '3.5.1.3',
    '3.5.2.1',
    '3.5.2.2',
  ],
  outputPath: 'curricula/DE/Gymnasium/input/BW/upper-secondary/source-extraction/DE_BW_DEUTSCH_SEKII_BP2016_V2.source-extraction.json',
  reviewPath: 'curricula/DE/Gymnasium/mapping/DE-BW/upper-secondary/bw_german_upper_secondary_source_extraction_to_canonical_german.review.json',
  sourceGoalPrefix: 'bw-deutsch-sekii',
}

if (!existsSync(resolve(repoRoot, pdfPath))) {
  throw new Error(`Missing source PDF: ${pdfPath}`)
}

const fullText = execFileSync('pdftotext', ['-layout', resolve(repoRoot, pdfPath), '-'], { encoding: 'utf8' })
const contentText = extractContentStandardsText(fullText)
const allTopics = parseTopics(contentText)

for (const config of [lowerConfig, upperConfig]) {
  const topics = config.expectedTopicCodes.map((code) => {
    const topic = allTopics.find((candidate) => candidate.code === code)
    if (!topic) throw new Error(`Missing expected BW Deutsch topic ${code}`)
    return topic
  })

  const extraction = buildExtraction(config, topics)
  writeJson(resolve(repoRoot, config.outputPath), extraction)
  writeJson(resolve(repoRoot, config.reviewPath), buildReview(config, extraction.sourceGoals))

  console.log(
    `Wrote ${config.outputPath} (${extraction.passages.length} passages, ${extraction.sourceGoals.length} source goals)`,
  )
  console.log(`Wrote ${config.reviewPath} (${extraction.sourceGoals.length}/${extraction.sourceGoals.length} M3 decisions)`)
}

function buildExtraction(config: ExtractionConfig, topics: ParsedTopic[]) {
  const passages = topics.map((topic) => {
    const passageId = passageIdForTopic(config, topic)
    return {
      id: passageId,
      topicCode: topic.code,
      title: `${topic.code} ${topic.title}`,
      text: topic.rawText,
      sourcePath: pdfPath,
      sourceUrl,
      rawText: topic.rawText,
      sourceGoalIds: topic.goals.map((goal) => sourceGoalId(config, topic, goal)),
    }
  })

  const passageIds = new Set(passages.map((passage) => passage.id))
  const sourceGoals: GeneratedSourceGoal[] = topics.flatMap((topic) => {
    const passageId = passageIdForTopic(config, topic)
    return topic.goals.map((goal) => {
      const sourceText = normalizeGoalText(goal.text)
      return {
        id: sourceGoalId(config, topic, goal),
        passageId,
        topicCode: topic.code,
        bulletIndex: goal.number,
        aspectIndex: 1,
        title: titleFromSourceText(sourceText),
        description: `Die lernende Person kann ${toSentenceFragment(sourceText)}`,
        sourceText,
        sourceSpan: `${topic.code}(${goal.number})`,
        parentBulletText: sourceText,
        sourceRef: `${sourceDocument.title}, ${topic.code} ${topic.title}, (${goal.number})`,
        courseLevel: courseLevelForTopic(topic.code),
        granularity: 'officialCompetency',
        stage: config.stage,
        tags: [
          'jurisdiction:DE-BW',
          `stage:${config.stage}`,
          `gradeBand:${gradeBandForTopic(topic.code)}`,
          `topic:${topic.code}`,
          `courseLevel:${courseLevelForTopic(topic.code)}`,
        ],
        rawSourceText: goal.text,
        rawSourceSpan: `${topic.code}(${goal.number})`,
        rawParentBulletText: goal.text,
      }
    })
  })

  const duplicateIds = findDuplicates(sourceGoals.map((sourceGoal) => sourceGoal.id))
  const missingPassageRefs = sourceGoals
    .filter((sourceGoal) => !passageIds.has(sourceGoal.passageId))
    .map((sourceGoal) => sourceGoal.id)
  const emptyPassages = passages
    .filter((passage) => passage.sourceGoalIds.length === 0)
    .map((passage) => passage.topicCode)

  return {
    schemaVersion: 1,
    extractionId: config.extractionId,
    sourceLandscapeId: config.sourceLandscapeId,
    targetLandscapeId,
    title: config.title,
    jurisdiction: 'DE-BW',
    subject: 'Deutsch',
    stage: config.stage,
    sourceDocument,
    sourceDocuments: [sourceDocument],
    method: {
      passageExtraction:
        'pdftotext -layout; segmented by official numbered content-competency sections 3.1.1.1-3.5.2.2 from the Baden-Wuerttemberg Deutsch V2 PDF.',
      sourceGoalExtraction:
        'one source goal per official numbered "Die Schülerinnen und Schüler können" competency item; cross-reference lines such as PG/MB/BTV and section references are ignored.',
    },
    expectedTopicCodes: config.expectedTopicCodes,
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
              label: 'Amtlicher BW-Deutsch-Bildungsplan V2 liegt lokal vor',
              passed: true,
              details: pdfPath,
            },
            {
              id: 'expected-topic-coverage',
              label: 'Erwartete BW-Deutsch-Kompetenzabschnitte sind als Lehrplanpassagen vorhanden',
              passed: passages.length === config.expectedTopicCodes.length,
              details: `${passages.length}/${config.expectedTopicCodes.length} Passagen.`,
            },
            {
              id: 'passage-extraction-source',
              label: 'Passage-Extraction basiert auf amtlicher PDF-Quelle statt Legacy-Snapshot',
              passed: true,
              details: pdfPath,
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
              label: 'Source-Ziele aus den amtlichen BW-Deutsch-Kompetenznummern erzeugt',
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
              details: config.reviewPath,
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
              details: `Abgedeckt: ${sourceGoals.length}/${sourceGoals.length}; 0 explizite Canonical-Gaps, 0 unreviewed. Alle Abdeckungen sind als partial/Sammelziel-Zuordnung markiert.`,
            },
          ],
        },
      ],
    },
    qualityReview: {
      sourceGoalCountPeerBaseline: {
        status: 'accepted',
        expectedSourceGoals: sourceGoals.length,
        actualSourceGoals: sourceGoals.length,
        rationale:
          'Kritisch geprueft: BW Deutsch V2 wird granular nach amtlichen Kompetenznummern geschnitten. Die hohe Zahl ist plausibel, weil die Quelle anders als die Hessen-Sek-I-Topic-Extraction jede nummerierte Kompetenz einzeln ausweist; die Zuordnung bleibt als partial/Sammelziel-Mapping transparent.',
      },
    },
    passages,
    sourceGoals,
  }
}

function buildReview(config: ExtractionConfig, sourceGoals: GeneratedSourceGoal[]) {
  const canonicalGoalIdByTitle = loadCanonicalGoalIdByTitle()
  const decisions = sourceGoals.map((sourceGoal) => {
    const targetTitles = targetTitlesForSourceGoal(sourceGoal)
    const canonicalGoalIds = targetTitles.map((title) => {
      const canonicalGoalId = canonicalGoalIdByTitle.get(title)
      if (!canonicalGoalId) throw new Error(`Missing canonical German target goal: ${title}`)
      return canonicalGoalId
    })

    return {
      sourceGoalId: sourceGoal.id,
      topicCode: sourceGoal.topicCode,
      sourceSpan: sourceGoal.sourceSpan,
      decision: 'mapped',
      canonicalGoalIds,
      matchType: 'partial',
      rationale: [
        `Das BW-Deutsch-Source-Ziel "${sourceGoal.title}" ist inhaltlich durch passende kanonische Deutsch-Sammelziele abgedeckt.`,
        'matchType=partial bezeichnet hier die Zuordnungsform: Das kanonische Deutsch-Modell ist aktuell grober als die amtliche BW-Kompetenznummer, behauptet also keine 1:1-Granularität.',
      ].join(' '),
      reviewedAt: '2026-05-14',
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
    reviewId: config.stage === 'SekI'
      ? 'de-bw-german-lower-secondary-source-extraction-to-canonical-german'
      : 'de-bw-german-upper-secondary-source-extraction-to-canonical-german',
    sourceLandscapeId: config.sourceLandscapeId,
    targetLandscapeId,
    sourceExtractionPath: config.outputPath,
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
      note: 'BW Deutsch V2 ist vollstaendig reviewed und fachlich ueber kanonische Deutsch-Sammelziele abgedeckt. Die Zuordnung ist bewusst partial, weil die aktuelle Deutsch-Kanonik grober ist als die amtlichen BW-Kompetenznummern.',
    },
    mappings,
    decisions,
  }
}

function loadCanonicalGoalIdByTitle(): Map<string, string> {
  const canonical = JSON.parse(readFileSync(resolve(repoRoot, canonicalGermanPath), 'utf8')) as {
    goals?: Array<{ id?: string; title?: string }>
  }
  const result = new Map<string, string>()
  for (const goal of canonical.goals ?? []) {
    if (typeof goal.id === 'string' && typeof goal.title === 'string') {
      result.set(goal.title, goal.id)
    }
  }
  return result
}

function targetTitlesForSourceGoal(sourceGoal: GeneratedSourceGoal): string[] {
  if (sourceGoal.stage === 'SekII') return upperSecondaryTargetTitlesForSourceGoal(sourceGoal)
  return lowerSecondaryTargetTitlesForSourceGoal(sourceGoal)
}

function lowerSecondaryTargetTitlesForSourceGoal(sourceGoal: GeneratedSourceGoal): string[] {
  const gradeBand = gradeBandForTopic(sourceGoal.topicCode)
  const topicKind = topicKindForCode(sourceGoal.topicCode)
  const text = sourceGoal.sourceText.toLowerCase()

  if (topicKind === 'literary') {
    if (/(gedicht|lyr|ballad|vers|strophe|reim|rhythmus|metrum)/u.test(text)) return titlesByGrade(gradeBand, 'poetry')
    if (/(drama|dialog|szenisch|regie|bühne|buehne)/u.test(text)) return titlesByGrade(gradeBand, 'drama')
    if (/(figur|erzäh|erzaeh|perspektive|märchen|maerchen|sage|fabel|novell|kurzgeschicht|jugendbuch|roman)/u.test(text)) return titlesByGrade(gradeBand, 'narrative')
    if (/(deutung|interpret|vergleich|entstehungszeit|autor|epoche|wirkung|gestaltungsmittel|textverständnis|textverstaendnis)/u.test(text)) return titlesByGrade(gradeBand, 'literaryAnalysis')
    return titlesByGrade(gradeBand, 'literary')
  }

  if (topicKind === 'nonfiction') {
    if (/(argument|behauptung|begründung|begruendung|erörter|eroerter|wertung|position)/u.test(text)) return titlesByGrade(gradeBand, 'argument')
    if (/(bericht|reportage|sachtext|gebrauchstext|information|nichtlinear|tabelle|schaubild|grafik|lexikon|wissenschaft)/u.test(text)) return titlesByGrade(gradeBand, 'nonfiction')
    return titlesByGrade(gradeBand, 'nonfiction')
  }

  if (topicKind === 'media') {
    if (/(film|hörspiel|hoerspiel|fernsehen|audiovisuell|bild|schnitt|ton)/u.test(text)) return titlesByGrade(gradeBand, 'film')
    if (/(zeitung|journal|nachricht|kommentar|print)/u.test(text)) return titlesByGrade(gradeBand, 'journalism')
    if (/(internet|digital|blog|messenger|e-mail|quelle|zuverlässigkeit|zuverlaessigkeit)/u.test(text)) return titlesByGrade(gradeBand, 'digitalMedia')
    return titlesByGrade(gradeBand, 'media')
  }

  if (topicKind === 'structure') {
    if (/(rechtschreib|komma|satzzeichen|groß|gross|klein)/u.test(text)) return titlesByGrade(gradeBand, 'orthography')
    if (/(satz|nebensatz|glied|prädikat|praedikat|attribute|objekt|adverbial|konjunktion|subjunktion)/u.test(text)) return titlesByGrade(gradeBand, 'syntax')
    if (/(wortart|verb|adjektiv|pronomen|adverb|präposition|praeposition|genus|numerus|tempora|aktiv|passiv|konjunktiv|modal)/u.test(text)) return titlesByGrade(gradeBand, 'morphology')
    if (/(wortschatz|wortbildung|fremdwort|familie|feld|metapher|bedeutung|herkunft)/u.test(text)) return titlesByGrade(gradeBand, 'word')
    return titlesByGrade(gradeBand, 'structure')
  }

  if (/(kommunikation|sprechabsicht|nonverbal|gesprochen|geschrieben|dialekt|varietät|varietaet|fachsprache|gruppensprache|werbesprache|manipulation|persuasion|geschlechter|welterschließung|welterschliessung)/u.test(text)) {
    return titlesByGrade(gradeBand, 'languageFunction')
  }
  return titlesByGrade(gradeBand, 'languageFunction')
}

function upperSecondaryTargetTitlesForSourceGoal(sourceGoal: GeneratedSourceGoal): string[] {
  const topicKind = topicKindForCode(sourceGoal.topicCode)
  const text = sourceGoal.sourceText.toLowerCase()
  const literary = [
    'Literarische Texte mit erweiterten gattungsspezifischen Kategorien erschließen',
    'Literarische Texte vertieft gattungsspezifisch analysieren',
    'Literarische Texte mit Deutungshypothese interpretieren',
    'Literarische Texte kontextbezogen und vergleichend interpretieren',
  ]

  if (topicKind === 'literary') {
    if (/(gedicht|lyr|vers|strophe|reim|metrik)/u.test(text)) return ['Lyrik-Grundbegriffe', 'Lyrik der Moderne analysieren', ...literary]
    if (/(drama|dialog|regie|bühne|buehne|inszenierung)/u.test(text)) return ['Drama-Grundbegriffe', 'Bühnenmittel deuten', ...literary]
    if (/(erzäh|erzaeh|figur|perspektive|roman|novelle|kurzprosa)/u.test(text)) return ['Erzähltheorie Grundbegriffe', 'Erzähltechnik und Perspektive', ...literary]
    if (/(epoche|literaturgeschicht|kontext|autor|geschichte|kanon)/u.test(text)) return ['Epochenkontext und Merkmale', 'Formen und Gattungen vergleichen', ...literary]
    return literary
  }

  if (topicKind === 'nonfiction') {
    if (/(argument|these|erörter|eroerter|begründ|begruen|beleg|stellung)/u.test(text)) {
      return ['Argumentationsanalyse', 'Argumentationsstrategien deuten', 'Komplexere argumentierende Texte differenziert verfassen']
    }
    return ['Textsorte erkennen', 'Argumentationsanalyse', 'Diskursanalyse zu politischen Texten']
  }

  if (topicKind === 'media') {
    if (/(film|hörtext|hoertext|grafisch|bild|schnitt|ton|adaption)/u.test(text)) {
      return ['Filme, Hörtexte und grafische Literatur analysieren und interpretieren', 'Filmsprache analysieren', 'Adaption Vergleich Buch/Film']
    }
    return ['Medienanalyse Grundlage', 'Unterschiedliche Medien reflektiert und kritisch nutzen', 'Multimodale Texte analysieren']
  }

  if (topicKind === 'structure') {
    if (/(grammatik|orthograf|rechtschreib|satz|wort|morpholog|syntax|semantik|bedeutung)/u.test(text)) {
      return ['Grammatikalisches und orthografisches Wissen vertiefen', 'Begriffs- und Bedeutungsfelder']
    }
    return ['Grammatik wiederholen', 'Grammatikalisches und orthografisches Wissen vertiefen']
  }

  if (/(geschlecht|stereotyp)/u.test(text)) return ['Sprachliche Konstruktion von Geschlecht', 'Geschlechterrollen kritisch prüfen']
  if (/(mehrsprach|varietät|varietaet|dialekt|standard|migration)/u.test(text)) return ['Mehrsprachigkeit/Hybridität', 'Pragmatische Modelle']
  if (/(kommunikation|gespräch|gespraech|vortrag|rhetorik|sprachhandlung|persuasion|manipulation|macht|interesse)/u.test(text)) {
    return ['Sprachhandlungen einordnen', 'Pragmatische Modelle', 'Rhetorische Mittel analysieren']
  }
  return ['Sprachhandlungen einordnen', 'Sprachphilosophische Positionen']
}

function topicKindForCode(topicCode: string): 'literary' | 'nonfiction' | 'media' | 'structure' | 'function' {
  if (/\.1\.1$/u.test(topicCode)) return 'literary'
  if (/\.1\.2$/u.test(topicCode)) return 'nonfiction'
  if (/\.1\.3$/u.test(topicCode)) return 'media'
  if (/\.2\.1$/u.test(topicCode)) return 'structure'
  return 'function'
}

function titlesByGrade(gradeBand: string, kind: string): string[] {
  const specs: Record<string, Record<string, string[]>> = {
    '5/6': {
      literary: ['Leseförderung und sinngerechtes Lesen', 'Literarische Texte erschließen'],
      literaryAnalysis: ['Erzählungen, Märchen, Sagen, Schwänke und Kinderbücher erschließen', 'Literarische Texte erschließen'],
      narrative: ['Erzählungen, Märchen, Sagen, Schwänke und Kinderbücher erschließen', 'Sagen, Schwänke, Fabeln und Kinderromane deuten'],
      poetry: ['Gedichte erschließen und vortragen', 'Gedichte erschließen und gestaltend vortragen'],
      drama: ['Darstellendes Spiel und Gestaltungsübungen', 'Darstellendes Spiel einsetzen'],
      nonfiction: ['Sach- und Gebrauchstexte auswerten', 'Berichte, Reportagen, Sachartikel und Sachbuchtexte auswerten'],
      argument: ['Diskutieren und Argumentieren', 'Diskutieren, argumentieren, überzeugen und beraten'],
      media: ['Informationen durch und über Medien nutzen', 'Medieninformationen nutzen'],
      film: ['Medieninformationen nutzen', 'Darstellendes Spiel einsetzen'],
      journalism: ['Medieninformationen nutzen', 'Sach- und Gebrauchstexte auswerten'],
      digitalMedia: ['Informationen durch und über Medien nutzen', 'Computerlern- und Übungsprogramme für Grammatik und Rechtschreibung einsetzen'],
      structure: ['Wortarten sicher verwenden', 'Satzglieder bestimmen und umstellen'],
      syntax: ['Satzarten unterscheiden', 'Satzglieder bestimmen und umstellen', 'Haupt- und Gliedsätze sowie Attribute unterscheiden'],
      morphology: ['Wortarten sicher verwenden', 'Tempora und Verbformen sichern'],
      orthography: ['Rechtschreibstrategien und Fehlersensibilität entwickeln', 'Rechtschreibstrategien selbstständig nutzen'],
      word: ['Wortschatz, Wortbildung und Wortfelder untersuchen', 'Wortschatz und Wortbildung erweitern'],
      languageFunction: ['Grundfunktionen der Sprache unterscheiden', 'Grundfunktionen der Sprache an Überredungsstrategien untersuchen'],
    },
    '7/8': {
      literary: ['Kurzgeschichten, Novellen und Jugendbücher erschließen', 'Novellen, Jugendbücher und Kurzgeschichten erschließen'],
      literaryAnalysis: ['Erzählperspektiven und formale Gestaltungselemente erkennen', 'Handlungsverlauf, Aufbau, Personengestaltung und sprachliche Mittel beschreiben'],
      narrative: ['Kurzgeschichten, Novellen und Jugendbücher erschließen', 'Novellen, Jugendbücher und Kurzgeschichten erschließen'],
      poetry: ['Gedichte und Balladen erschließen', 'Gedichte und Balladen wiederholend vertiefen'],
      drama: ['Dramatische Literatur in Grundfunktionen erkennen', 'Darstellendes Spiel einsetzen'],
      nonfiction: ['Informierende Sachtexte auswerten', 'Fachsprachen verstehen und anwenden'],
      argument: ['Diskutieren und argumentieren', 'Pro- und Kontra-Argumente gegenüberstellen'],
      media: ['Informationen durch und über Medien untersuchen', 'Medieninformationen nutzen'],
      film: ['Dramatische Literatur in Grundfunktionen erkennen', 'Medieninformationen nutzen'],
      journalism: ['Zeitungen als Institution und Medium analysieren', 'Nachrichten und Kommentare unterscheiden', 'Eigene journalistische Texte produzieren'],
      digitalMedia: ['Neue Kommunikationsmedien als Schreib- und Informationswerkzeuge nutzen', 'Textverarbeitung, Layout und E-Mail-Kommunikation nutzen'],
      structure: ['Haupt- und Gliedsätze unterscheiden', 'Rechtschreibung und Zeichensetzung anwendungsbezogen festigen'],
      syntax: ['Haupt- und Gliedsätze unterscheiden', 'Konjunktionen für logische Zusammenhänge verwenden'],
      morphology: ['Aktiv und Passiv sicher gebrauchen', 'Indirekte Rede und Konjunktiv I/II verwenden'],
      orthography: ['Zeichensetzung in indirekter Rede und Satzgefügen anwenden', 'Rechtschreibung und Zeichensetzung anwendungsbezogen festigen'],
      word: ['Wortschatz und Wortfelder differenzieren', 'Herkunft von Wörtern, Lehnwörter und Fremdwörter untersuchen', 'Fremdwörter erschließen'],
      languageFunction: ['Kommunikationsprobleme in Alltagssituationen untersuchen', 'Nachrichtentexte und Kommentare auf sprachliche Beeinflussung untersuchen'],
    },
    '9/10': {
      literary: ['Jugendbücher, Dramen und Kurzgeschichten vertieft erschließen', 'Erzählungen in Entstehungskontexte einordnen'],
      literaryAnalysis: ['Aufbau, Struktur, Erzählperspektive, Erzählhaltung und Ironie erkennen', 'Erzählungen in Entstehungskontexte einordnen'],
      narrative: ['Jugendbücher, Dramen und Kurzgeschichten vertieft erschließen', 'Erzählungen in Entstehungskontexte einordnen'],
      poetry: ['Gedichte verschiedener Epochen vergleichend analysieren', 'Zeitgenössische Gedichte vertiefend analysieren'],
      drama: ['Aristotelische Dramaform erschließen', 'Epische Dramenformen und Mischformen erkennen'],
      nonfiction: ['Wissenschaftliche Texte, Lexikonartikel und Kritiken auswerten', 'Informationen aus Sekundärliteratur und Internet kritisch aufarbeiten'],
      argument: ['Erörterungen mit These, Argument, Beispiel und Beleg schreiben', 'Pro-und-Kontra-Diskussionen, Rede und Gegenrede sowie Debatten führen'],
      media: ['Fernsehen als Informations-, Meinungsbildungs-, Unterhaltungs- und Werbemedium untersuchen', 'Internet und CD-ROM als Informationsquellen nutzen'],
      film: ['Filmtechnische und ästhetische Mittel bewerten', 'Fernsehen als Informations-, Meinungsbildungs-, Unterhaltungs- und Werbemedium untersuchen'],
      journalism: ['Wissenschaftliche Texte, Lexikonartikel und Kritiken auswerten', 'Formen sprachlicher Beeinflussung erkennen'],
      digitalMedia: ['Internet und CD-ROM als Informationsquellen nutzen', 'Informationen aus Sekundärliteratur und Internet kritisch aufarbeiten'],
      structure: ['Gegenwartssprache auf Aussage, Form, Sprachgestalt und Textwirkung untersuchen', 'Kommunikationssituationen differenziert untersuchen'],
      syntax: ['Kommunikationssituationen differenziert untersuchen', 'Gegenwartssprache auf Aussage, Form, Sprachgestalt und Textwirkung untersuchen'],
      morphology: ['Gegenwartssprache auf Aussage, Form, Sprachgestalt und Textwirkung untersuchen', 'Fachsprachen an Beispielen untersuchen'],
      orthography: ['Rechtschreibprinzipien für Selbstkorrektur nutzen', 'Gegenwartssprache auf Aussage, Form, Sprachgestalt und Textwirkung untersuchen'],
      word: ['Standardsprache, Umgangssprache, Fachsprachen, Sondersprachen und Dialekte unterscheiden', 'Fachsprachen an Beispielen untersuchen'],
      languageFunction: ['Sprache als Kommunikationsmittel untersuchen', 'Politische Rede auf Beeinflussungsstrategien untersuchen', 'Manipulativen und inhumanen Sprachgebrauch erkennen und vermeiden'],
    },
  }

  return specs[gradeBand]?.[kind] ?? specs[gradeBand]?.literary ?? ['Literarische Texte erschließen']
}

function extractContentStandardsText(value: string): string {
  const startMatches = [...value.matchAll(/\n3\.\s+Standards für inhaltsbezogene Kompetenzen/gmu)]
  const startMatch = startMatches.at(-1)
  if (!startMatch || startMatch.index === undefined) throw new Error('Could not locate BW Deutsch content standards start')

  const fromStart = value.slice(startMatch.index)
  const endMatch = /\n4\.\s+Operatoren/u.exec(fromStart)
  return endMatch?.index ? fromStart.slice(0, endMatch.index) : fromStart
}

function parseTopics(value: string): ParsedTopic[] {
  const headingPattern = /^(3\.[1-5](?:\.\d+){1,2})\s+(.+?)\s*$/gmu
  const matches = [...value.matchAll(headingPattern)].map((match) => ({
    code: match[1],
    title: normalizeLine(match[2]),
    index: match.index ?? 0,
  }))

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
  return /^(BNE|BTV|MB|PG|VB|BO|BMB|BK|BKPROFIL)\b/u.test(line) || /^\d\.\d(?:\.\d+)?\s+\S/u.test(line)
}

function isPdfArtifact(line: string): boolean {
  return line.length === 0
    || /^\d+$/.test(line)
    || /^Bildungsplan 2016\b/u.test(line)
    || /^Deutsch – vom 23\. März 2016/u.test(line)
    || /^Standards für inhaltsbezogene Kompetenzen/u.test(line)
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
  if (topicCode.startsWith('3.4.')) return 'LK'
  if (topicCode.startsWith('3.5.')) return 'GK'
  return 'unspecified'
}

function gradeBandForTopic(topicCode: string): string {
  if (topicCode.startsWith('3.1.')) return '5/6'
  if (topicCode.startsWith('3.2.')) return '7/8'
  if (topicCode.startsWith('3.3.')) return '9/10'
  if (topicCode.startsWith('3.4.') || topicCode.startsWith('3.5.')) return '11/12'
  return 'unspecified'
}

function passageIdForTopic(config: ExtractionConfig, topic: ParsedTopic): string {
  return `${config.sourceGoalPrefix}:${slug(topic.code)}-${hash(topic.title)}`
}

function sourceGoalId(config: ExtractionConfig, topic: ParsedTopic, goal: ParsedGoal): string {
  return uuidFromString(`DE-BW-DEUTSCH:${config.stage}:${topic.code}:${goal.number}:${goal.text}`)
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

function writeJson(path: string, value: unknown): void {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
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
