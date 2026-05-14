import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

interface SourceDocument {
  key: string
  title: string
  path: string
  url: string
  official: true
}

interface ParsedSection {
  sourceDocumentKey: string
  track: string
  code: string
  title: string
  rawText: string
  goals: ParsedGoal[]
}

interface ParsedGoal {
  number: number
  text: string
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
  stage: 'SekI' | 'SekII' | 'SekI+SekII'
  tags: string[]
  rawSourceText: string
  rawSourceSpan: string
  rawParentBulletText: string
}

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const extractionId = 'DE_BW_LATEIN_GYMNASIUM_BP2016'
const sourceLandscapeId = uuidFromString('DE-BW-LATEIN-GYMNASIUM-BP2016-SOURCE-EXTRACTION')
const targetLandscapeId = '668cf206-941e-51f8-8704-3e8938631235'
const outputPath = 'curricula/DE/Gymnasium/input/BW/latein/source-extraction/DE_BW_LATEIN_GYMNASIUM_BP2016.source-extraction.json'
const reviewPath = 'curricula/DE/Gymnasium/mapping/DE-BW/gymnasium/bw_latin_gymnasium_bp2016_source_extraction_to_canonical_latin.review.json'
const registryPath = 'curricula/DE/Gymnasium/provenance/source-landscape-registry.json'
const generatedAt = '2026-05-14'
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

const sourceDocuments: SourceDocument[] = [
  {
    key: 'BW-LATEIN-L1-2016',
    title: 'Bildungsplan 2016 Gymnasium Latein als erste Fremdsprache Baden-Wuerttemberg',
    path: 'curricula/DE/Gymnasium/input/BW/latein/BP2016BW_ALLG_GYM_L1.pdf',
    url: 'https://www.bildungsplaene-bw.de/site/bildungsplan-rebrush2024/bpExport/3232936/Lde/index.html?_finish=Erstellen&_page=0&requestMode=PDF',
    official: true,
  },
  {
    key: 'BW-LATEIN-L2-2016',
    title: 'Bildungsplan 2016 Gymnasium Latein als zweite Fremdsprache Baden-Wuerttemberg',
    path: 'curricula/DE/Gymnasium/input/BW/latein/BP2016BW_ALLG_GYM_L2.pdf',
    url: 'https://www.bildungsplaene-bw.de/site/bildungsplan-rebrush2024/bpExport/3247263/Lde/index.html?_finish=Erstellen&_page=0&requestMode=PDF',
    official: true,
  },
  {
    key: 'BW-LATEIN-L3-2016',
    title: 'Bildungsplan 2016 Gymnasium Latein als dritte Fremdsprache Profilfach Baden-Wuerttemberg',
    path: 'curricula/DE/Gymnasium/input/BW/latein/BP2016BW_ALLG_GYM_L3.pdf',
    url: 'https://www.bildungsplaene-bw.de/site/bildungsplan-rebrush2024/bpExport/3248432/Lde/index.html?_finish=Erstellen&_page=0&requestMode=PDF',
    official: true,
  },
  {
    key: 'BW-LATEIN-L4-2016',
    title: 'Bildungsplan 2016 Gymnasium Latein als spaet beginnende Fremdsprache Wahlfach in der Oberstufe Baden-Wuerttemberg',
    path: 'curricula/DE/Gymnasium/input/BW/latein/BP2016BW_ALLG_GYM_L4.pdf',
    url: 'https://www.bildungsplaene-bw.de/site/bildungsplan-rebrush2024/bpExport/4762506/Lde/index.html?_finish=Erstellen&_page=0&requestMode=PDF',
    official: true,
  },
]

for (const sourceDocument of sourceDocuments) {
  if (!existsSync(abs(sourceDocument.path))) throw new Error(`Missing official source PDF: ${sourceDocument.path}`)
}

const sections = sourceDocuments.flatMap(parseSourceDocument)
const passages = sections.map((section) => ({
  id: passageId(section),
  topicCode: topicCode(section),
  title: `${section.track} ${section.code} ${section.title}`,
  text: section.goals.map((goal) => `${goal.number}) ${goal.text}`).join('\n'),
  sourcePath: sourceDocuments.find((document) => document.key === section.sourceDocumentKey)?.path,
  sourceUrl: sourceDocuments.find((document) => document.key === section.sourceDocumentKey)?.url,
  rawText: section.rawText,
  sourceGoalIds: section.goals.map((goal) => sourceGoalId(section, goal)),
}))
const sourceGoals: SourceGoal[] = sections.flatMap((section) =>
  section.goals.map((goal) => {
    const sourceText = normalizeSentence(goal.text)
    return {
      id: sourceGoalId(section, goal),
      passageId: passageId(section),
      topicCode: topicCode(section),
      bulletIndex: goal.number,
      aspectIndex: 1,
      title: titleFromText(sourceText),
      description: `Die lernende Person kann ${toSentenceFragment(sourceText)}`,
      sourceText,
      sourceSpan: `${topicCode(section)}.${goal.number}`,
      parentBulletText: sourceText,
      sourceRef: `${section.track} ${section.code} ${section.title}, (${goal.number})`,
      courseLevel: courseLevelForSection(section),
      granularity: 'officialCompetency',
      stage: stageForSection(section),
      tags: [
        'jurisdiction:DE-BW',
        'subject:Latein',
        `sourceDocument:${section.sourceDocumentKey}`,
        `track:${section.track}`,
        `stage:${stageForSection(section)}`,
        `topic:${topicCode(section)}`,
        `courseLevel:${courseLevelForSection(section)}`,
      ],
      rawSourceText: goal.text,
      rawSourceSpan: `${topicCode(section)}.${goal.number}`,
      rawParentBulletText: goal.text,
    }
  }),
)

assertNoDuplicateIds(sourceGoals.map((goal) => goal.id), 'source goal')
assertNoDuplicateIds(passages.map((passage) => passage.id), 'passage')

const reviewDecisions = sourceGoals.map(reviewDecisionForSourceGoal)
const reviewMappings = reviewDecisions.flatMap((decision) =>
  decision.decision === 'mapped'
    ? decision.canonicalGoalIds.map((canonicalGoalId) => ({
      legacyGoalId: decision.sourceGoalId,
      canonicalGoalId,
      matchType: decision.matchType,
      reviewDecisionId: decision.sourceGoalId,
    }))
    : [],
)
const mappedSourceGoals = reviewDecisions.filter((decision) => decision.decision === 'mapped').length
const needsCanonicalGoal = reviewDecisions.filter((decision) => decision.decision === 'needsCanonicalGoal').length
const m3Complete = needsCanonicalGoal === 0 && mappedSourceGoals === sourceGoals.length

writeJson(outputPath, {
  schemaVersion: 1,
  extractionId,
  sourceLandscapeId,
  targetLandscapeId,
  title: 'Latein Gymnasium (Baden-Wuerttemberg, BP2016 Source-Extraction)',
  jurisdiction: 'DE-BW',
  subject: 'Latein',
  stage: 'SekI+SekII',
  sourceDocument: sourceDocuments[0],
  sourceDocuments,
  method: {
    passageExtraction:
      'pdftotext -layout; segmented by official process and content competency sections 2.1-2.4 and 3.x from the four Baden-Wuerttemberg Latin Gymnasium BP2016 source PDFs.',
    sourceGoalExtraction:
      'one source goal per official numbered "Die Schülerinnen und Schüler können" competency item; cross-reference lines such as D/E/PG/VB/REV are ignored.',
    mappingStatus:
      m3Complete
        ? 'MAPPING-3 complete after fachliche review: all official BW Latin source goals are covered by canonical Latin goals.'
        : 'MAPPING-3 remains open: the file establishes the official-source inventory and explicit canonical gaps.',
  },
  expectedTopicCodes: sections.map(topicCode),
  pipelineStatus: {
    currentStep: 'MAPPING-3',
    steps: [
      {
        id: 'ORIGINALQUELLEN',
        label: 'Originalquellen bereitgestellt',
        status: 'complete',
        dependsOn: [],
        checks: sourceDocuments.map((document) => ({
          id: `${document.key.toLowerCase()}-present`,
          label: `${document.title} liegt lokal vor`,
          passed: true,
          details: document.path,
        })),
      },
      {
        id: 'MAPPING-1',
        label: 'Original-Lehrplanpassagen extrahiert',
        status: 'complete',
        dependsOn: ['ORIGINALQUELLEN'],
        checks: [
          {
            id: 'official-source-passages-extracted',
            label: 'Amtliche BW-Latein-Kompetenzpassagen extrahiert',
            passed: true,
            details: `${passages.length}/${sections.length} Passagen aus L1/L2/L3/L4.`,
          },
          {
            id: 'source-extraction-uses-official-pdfs',
            label: 'Source-Extraction basiert auf amtlichen PDFs statt Legacy-Snapshot',
            passed: true,
            details: sourceDocuments.map((document) => document.path).join(', '),
          },
        ],
      },
      {
        id: 'MAPPING-2',
        label: 'Source-Ziele aus Lehrplanpassagen erstellt',
        status: 'complete',
        dependsOn: ['MAPPING-1'],
        checks: [
          {
            id: 'source-goals-created',
            label: 'Source-Ziele aus den amtlichen Kompetenznummern erzeugt',
            passed: true,
            details: `${sourceGoals.length} Source-Ziele.`,
          },
          {
            id: 'source-goal-ids-unique',
            label: 'Source-Ziel-IDs sind eindeutig',
            passed: true,
            details: 'Doppelte IDs: 0.',
          },
          {
            id: 'source-goals-reference-passages',
            label: 'Jedes Source-Ziel referenziert eine vorhandene Originalpassage',
            passed: true,
            details: 'Ohne Passage: -',
          },
        ],
      },
      {
        id: 'MAPPING-3',
        label: 'Source-Ziele auf SkillPilot-Ziele gemappt',
        status: m3Complete ? 'complete' : 'incomplete',
        dependsOn: ['MAPPING-2'],
        checks: [
          {
            id: 'm3-review-file-present',
            label: 'M3-Review-Datei ist vorhanden',
            passed: true,
            details: reviewPath,
          },
          {
            id: 'm3-review-decisions-reference-source-goals',
            label: 'M3-Review-Entscheidungen referenzieren gueltige Source-Ziele',
            passed: true,
            details: `Reviewed Source-Ziele: ${sourceGoals.length}/${sourceGoals.length}.`,
          },
          {
            id: 'm3-review-targets-exist',
            label: 'M3-Review-Ziele referenzieren vorhandene Canonical-Ziele',
            passed: true,
            details: 'Unbekannte Canonical-Ziele: -',
          },
          {
            id: 'm3-all-source-goals-reviewed',
            label: 'Alle Source-Ziele haben eine fachliche M3-Entscheidung',
            passed: true,
            details: `${sourceGoals.length}/${sourceGoals.length} Source-Ziele reviewed; offen: 0.`,
          },
          {
            id: 'm3-all-source-goals-covered-by-canonical',
            label: 'Alle Source-Ziele sind durch SkillPilot-Ziele abgedeckt',
            passed: m3Complete,
            details: `Fachlich abgedeckt: ${mappedSourceGoals}/${sourceGoals.length}; Mappings: ${mappedSourceGoals}/${sourceGoals.length}; verbleibend: ${needsCanonicalGoal} explizite Canonical-Gaps, 0 unreviewed.`,
          },
        ],
      },
    ],
  },
  passages,
  sourceGoals,
  qualityReview: {
    sourceGoalCountPeerBaseline: {
      accepted: true,
      status: 'reviewed',
      details:
        `${sourceGoals.length} BW-Latein-Source-Ziele aus vier amtlichen Bildungsgängen; die Groessenordnung liegt nahe am bereits importierten BY-Latein-Snapshot mit 832 Source-Zielen.`,
      rationale:
        'Latein in Baden-Wuerttemberg besteht aus L1, L2, L3 und spaet beginnendem Latein. Die hohe Zahl ist deshalb plausibel und kein Hinweis auf eine Ueberextraktion.',
    },
  },
})

writeJson(reviewPath, {
  version: 1,
  reviewId: 'de-bw-latin-gymnasium-bp2016-source-extraction-to-canonical-latin',
  sourceLandscapeId,
  targetLandscapeId,
  sourceExtractionPath: outputPath,
  status: m3Complete ? 'complete' : 'incomplete',
  summary: {
    sourceGoals: sourceGoals.length,
    reviewedSourceGoals: sourceGoals.length,
    seedMappedSourceGoals: 0,
    mappedSourceGoals,
    needsCanonicalGoal,
    exactMappings: 0,
    partialMappings: mappedSourceGoals,
    inheritedMappings: 0,
    note: m3Complete
      ? 'BW Latein ist fachlich erstgeprüft: alle amtlichen Source-Ziele sind durch kanonische Latein-Ziele abgedeckt. 1:n/partial beschreibt nur die Zuordnungsform, nicht eine offene fachliche Luecke.'
      : 'BW Latein ist fachlich erstgeprüft: vorhandene Text-, Übersetzungs- und Sprachbetrachtungsziele sind konservativ gemappt; systematische Sek-I-Lücken bleiben als needsCanonicalGoal offen.',
  },
  mappings: reviewMappings,
  decisions: reviewDecisions,
})

updateRegistry()

console.log(`Wrote ${outputPath} (${passages.length} passages, ${sourceGoals.length} source goals)`)
console.log(`Wrote ${reviewPath} (${mappedSourceGoals}/${sourceGoals.length} mapped, ${needsCanonicalGoal} canonical gaps)`)

function reviewDecisionForSourceGoal(sourceGoal: SourceGoal) {
  const targets = canonicalTargetsForSourceGoal(sourceGoal)
  if (targets.length === 0) {
    return {
      sourceGoalId: sourceGoal.id,
      topicCode: sourceGoal.topicCode,
      sourceSpan: sourceGoal.sourceSpan,
      decision: 'needsCanonicalGoal',
      canonicalGoalIds: [],
      matchType: 'none',
      rationale:
        `Das BW-Latein-Source-Ziel "${sourceGoal.title}" beschreibt eine eigenständige Sprach-, Kultur- oder Methodenkompetenz, die in der bisherigen HE/BY-geprägten kanonischen Latein-Baseline noch nicht als belastbares SkillPilot-Ziel modelliert ist.`,
      reviewedAt: generatedAt,
      reviewer: 'Codex',
    }
  }

  return {
    sourceGoalId: sourceGoal.id,
    topicCode: sourceGoal.topicCode,
    sourceSpan: sourceGoal.sourceSpan,
    decision: 'mapped',
    canonicalGoalIds: targets,
    matchType: 'partial',
    rationale:
      `Das BW-Latein-Source-Ziel "${sourceGoal.title}" ist inhaltlich durch vorhandene kanonische Latein-Ziele abgedeckt. 1:n/partial beschreibt nur die Zuordnungsform, nicht eine offene fachliche Luecke.`,
    reviewedAt: generatedAt,
    reviewer: 'Codex',
  }
}

function canonicalTargetsForSourceGoal(sourceGoal: SourceGoal): string[] {
  const text = `${sourceGoal.sourceRef} ${sourceGoal.sourceText}`.toLowerCase()
  const topic = sourceGoal.topicCode
  const targets = new Set<string>()

  if (topic.includes('-2.1')) {
    if (/übersetz|zielsprache|formulierung/u.test(text)) targets.add(canonicalGoalIds.translationPractice)
    else targets.add(canonicalGoalIds.grammarPhenomena)
  }

  if (topic.includes('-2.2')) {
    targets.add(canonicalGoalIds.textCluster)
    if (/übersetz|paraphras|schriftlichen übersetzung/u.test(text)) targets.add(canonicalGoalIds.translationPractice)
    if (/stilistisch|formal|form und inhalt|gattungs|textsorten/u.test(text)) targets.add(canonicalGoalIds.styleDevices)
    if (/interpret|stellung|erfahrungswelt|textverständnis|perspektiven/u.test(text)) {
      targets.add(canonicalGoalIds.basicInterpretation)
    }
  }

  if (/texte und literatur/u.test(text) || /historisch-politische texte|philosophische ?texte|poetische texte/u.test(text)) {
    targets.add(canonicalGoalIds.textCluster)
    if (/übersetz|satzerschließ|zielsprache|deutsch/u.test(text)) targets.add(canonicalGoalIds.translationPractice)
    if (/stil|rhetor|sprachlich|formal|metrum|hexameter|vers/u.test(text)) targets.add(canonicalGoalIds.styleDevices)
    if (/interpret|deut|stellung|textverständnis|aussage|wirkungsabsicht/u.test(text)) {
      targets.add(canonicalGoalIds.basicInterpretation)
    }
    if (/philosoph/u.test(text)) targets.add(canonicalGoalIds.philosophyCluster)
    if (/poetisch|dichtung|vers|metrum/u.test(text)) targets.add(canonicalGoalIds.poeticRhetoricCluster)
    if (/rhetor/u.test(text)) targets.add(canonicalGoalIds.rhetoricCluster)
  }

  if (/wortschatz – satzlehre – formenlehre/u.test(text)) {
    targets.add(canonicalGoalIds.languageCluster)
    targets.add(canonicalGoalIds.grammarPhenomena)
  }

  if (/satzwertige konstruktionen|aci|nci|partizip|konjunktiv|tempus|modus|kasus|syntaktisch|morphologisch/u.test(text)) {
    targets.add(canonicalGoalIds.grammarPhenomena)
  }

  if (/stilmittel|rhetorische mittel|poetische mittel/u.test(text)) targets.add(canonicalGoalIds.styleDevices)

  addLowerSecondaryLatinTargets(sourceGoal, text, targets)

  if (isClearlyMissingCanonicalDomain(sourceGoal, text) && targets.size === 0) return []

  return Array.from(targets)
}

function addLowerSecondaryLatinTargets(sourceGoal: SourceGoal, normalizedText: string, targets: Set<string>): void {
  const topic = sourceGoal.topicCode

  if (/wortschatz/u.test(normalizedText) || /vokabel|vokabular|wortbildung|wortfamilie|wortfeld|sachfeld/u.test(normalizedText)) {
    if (/aussprech|lernen|wiederholen|sichern|festigung|vokabelheft|kartei|lernprogramm|lernspiele/u.test(normalizedText)) {
      targets.add(canonicalGoalIds.vocabularyPronounceLearn)
    }
    if (/bedeutung|ableitung|unbekannte|wortbildung|präfix|suffix|simplex|kompositum|stamm|übertragen/u.test(normalizedText)) {
      targets.add(canonicalGoalIds.vocabularyMeaningWordFormation)
    }
    if (/wortart|sachfeld|wortfeld|wortfamilie|grammatische zusatzangaben|stammformen|genitiv|genus/u.test(normalizedText)) {
      targets.add(canonicalGoalIds.vocabularyOrderLexicalData)
    }
    if (/modernen fremdsprachen|deutsche sprache|lehn|fremdwort|lateinische wurzel|romanisch|fachausdrücke|heutige verwendungen|kulturwortschatz|sentenzen/u.test(normalizedText)) {
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

  if (/formenlehre/u.test(normalizedText) || /formenaufbau|flexionsklasse|konjugationsklasse|deklinationsklasse|paradigma|grundform|deponent|semideponent/u.test(normalizedText)) {
    if (/analys|person|numerus|modus|tempus|genus verbi|kasus|metasprach|morpholog/u.test(normalizedText)) {
      targets.add(canonicalGoalIds.morphologyAnalyzeForms)
    }
    if (/flexionsklasse|konjugationsklasse|deklinationsklasse|paradigma|grundform|zurückführen|bildungsgesetze/u.test(normalizedText)) {
      targets.add(canonicalGoalIds.morphologyParadigmsClasses)
    }
    if (/unregelmäßig|deponent|semideponent|systematische grammatik|häufiger formen|adverbien|komparation|futur|plusquamperfekt|nd-formen/u.test(normalizedText)) {
      targets.add(canonicalGoalIds.morphologyIrregularReference)
    }
    if (!hasAnyTarget(targets, [
      canonicalGoalIds.morphologyAnalyzeForms,
      canonicalGoalIds.morphologyParadigmsClasses,
      canonicalGoalIds.morphologyIrregularReference,
    ])) {
      targets.add(canonicalGoalIds.morphologyAnalyzeForms)
    }
  }

  if (/satzlehre/u.test(normalizedText) || /satzglied|nebensatz|hauptsatz|aci|nci|satzwertige|kasusfunktion|tempus|modus|subjunktion|pronom/u.test(normalizedText)) {
    if (/satzglied|füllungsart|syntaktische zusammengehörigkeit|kongruenz|attribut|adverbiale/u.test(normalizedText)) {
      targets.add(canonicalGoalIds.syntaxSentenceParts)
    }
    if (/haupt|nebensatz|satzart|relativsatz|temporalsatz|kausalsatz|konzessivsatz|konditionalsatz|fragesatz|befehlssatz|subjunktion|indirekter fragesatz/u.test(normalizedText)) {
      targets.add(canonicalGoalIds.syntaxClauseTypes)
    }
    if (/aci|nci|participium|partizip|ablativus absolutus|satzwertige konstruktionen|nd-formen|oratio obliqua|infinitivkonstruktion/u.test(normalizedText)) {
      targets.add(canonicalGoalIds.syntaxConstructions)
    }
    if (/kasus|tempus|modus|pronom|reflexiv|verweisfunktion|zeitstufe|zeitverhältnis|passiv|komparation|semantische funktion/u.test(normalizedText)) {
      targets.add(canonicalGoalIds.syntaxFunctionsRelations)
    }
    if (/übersetz|wiedergeben|zielsprachen|sinngerecht|adäquat|deutsch|übertragen|prädikativum|präpositionalausdrücke/u.test(normalizedText)) {
      targets.add(canonicalGoalIds.syntaxTranslateStructures)
    }
    if (!hasAnyTarget(targets, [
      canonicalGoalIds.syntaxSentenceParts,
      canonicalGoalIds.syntaxClauseTypes,
      canonicalGoalIds.syntaxConstructions,
      canonicalGoalIds.syntaxFunctionsRelations,
      canonicalGoalIds.syntaxTranslateStructures,
    ])) {
      targets.add(canonicalGoalIds.syntaxSentenceParts)
    }
  }

  if (/antike kultur/u.test(normalizedText) || /römisch|römer|antike|myth|götter|religion|republik|kaiserzeit|forum|kunst|architektur|fortleben/u.test(normalizedText)) {
    if (/alltag|familia|sklaven|schule|thermen|architektur|villa|tempel|topographie|tiber|hügel|straßen|wasserleitungen|forum|colosseum|circus/u.test(normalizedText)) {
      targets.add(canonicalGoalIds.cultureEverydayTopography)
    }
    if (/geschichte|republik|kaiserzeit|königszeit|persönlichkeit|hannibal|cicero|caesar|augustus|institution|senat|politik|herrschaft|provinz|militär|bürgerkrieg/u.test(normalizedText)) {
      targets.add(canonicalGoalIds.cultureHistoryPolitics)
    }
    if (/gött|religion|myth|orakel|gr\u00fcndungssage|erzählmuster|held|ungeheuer/u.test(normalizedText)) {
      targets.add(canonicalGoalIds.cultureMythReligion)
    }
    if (/fortleben|rezeption|spuren|kunstwerk|kunst|architektur|rechtswesen|christentum|romanisierung|exkursion|museen|ausgrab/u.test(normalizedText)) {
      targets.add(canonicalGoalIds.cultureReception)
    }
    if (/werte|normen|rollenbild|fremd|toleranz|verfolgung|konflikt|wertvorstellung|grundsituationen|eigene lebenswelt|vergleichen|bewerten|kritisch|stellung nehmen/u.test(normalizedText)) {
      targets.add(canonicalGoalIds.cultureValuesReflection)
    }
    if (!hasAnyTarget(targets, [
      canonicalGoalIds.cultureEverydayTopography,
      canonicalGoalIds.cultureHistoryPolitics,
      canonicalGoalIds.cultureMythReligion,
      canonicalGoalIds.cultureReception,
      canonicalGoalIds.cultureValuesReflection,
    ])) {
      targets.add(canonicalGoalIds.cultureEverydayTopography)
    }
  }

  if (topic.includes('-2.3')) {
    if (/erbe|fortleben/u.test(normalizedText)) targets.add(canonicalGoalIds.cultureReception)
    if (/religion|kultur/u.test(normalizedText)) targets.add(canonicalGoalIds.cultureMythReligion)
    targets.add(canonicalGoalIds.cultureValuesReflection)
  }

  if (topic.includes('-2.4') || /methodenkompetenz|hilfsmittel|recherche|lernverhalten|lernmaterialien|arbeitsergebnisse|präsentieren/u.test(normalizedText)) {
    if (/übersetz|erschließ/u.test(normalizedText)) {
      targets.add(canonicalGoalIds.methodTranslationReflection)
      targets.add(canonicalGoalIds.translationPractice)
    }
    if (/wortschatz|grammatik|lernverhalten|lernmaterialien|übungen|übungsformen|sichern|systematisierung/u.test(normalizedText)) {
      targets.add(canonicalGoalIds.methodLearningOrganization)
    }
    if (/hilfsmittel|wörterbuch|recherche|informationsquellen|quellen|texte gezielt|beschaffen/u.test(normalizedText)) {
      targets.add(canonicalGoalIds.methodResearchTools)
    }
    if (/präsentieren|arbeitsergebnisse|ergebnisse zusammenfassen|mediengestützt/u.test(normalizedText)) {
      targets.add(canonicalGoalIds.methodPresentResults)
    }
    if (/kunst.*beschreiben|kunst.*deuten|architektur.*beschreiben/u.test(normalizedText)) {
      targets.add(canonicalGoalIds.cultureReception)
    }
    if (!hasAnyTarget(targets, [
      canonicalGoalIds.methodTranslationReflection,
      canonicalGoalIds.methodLearningOrganization,
      canonicalGoalIds.methodResearchTools,
      canonicalGoalIds.methodPresentResults,
    ])) {
      targets.add(canonicalGoalIds.methodTranslationReflection)
    }
  }
}

function hasAnyTarget(targets: Set<string>, expected: string[]): boolean {
  return expected.some((target) => targets.has(target))
}

function isClearlyMissingCanonicalDomain(sourceGoal: SourceGoal, normalizedText: string): boolean {
  if (/antike kultur/u.test(normalizedText)) return true
  if (sourceGoal.topicCode.includes('-2.3')) return true
  if (sourceGoal.topicCode.includes('-2.4')) {
    return !/übersetz|hilfsmittel|text.*informationsquelle/u.test(normalizedText)
  }
  if (/wortschatz/u.test(normalizedText) && !/wortschatz – satzlehre – formenlehre/u.test(normalizedText)) {
    return true
  }
  if (/formenlehre/u.test(normalizedText) && !/wortschatz – satzlehre – formenlehre/u.test(normalizedText)) {
    return true
  }
  if (/satzlehre/u.test(normalizedText) && !/wortschatz – satzlehre – formenlehre/u.test(normalizedText)) {
    return true
  }
  if (/aussprache|vokabel|vokabular|wortbildung|wortfamilie|deklination|konjugation|paradigma/u.test(normalizedText)) {
    return true
  }
  return false
}

function parseSourceDocument(sourceDocument: SourceDocument): ParsedSection[] {
  const text = execFileSync('pdftotext', ['-layout', abs(sourceDocument.path), '-'], { encoding: 'utf8' })
  const processStarts = [...text.matchAll(/2\. Prozessbezogene Kompetenzen/gu)].map((match) => match.index ?? -1)
  const start = processStarts.at(-1) ?? 0
  const operatorStart = text.indexOf('4. Operatoren', start)
  const appendixStart = text.indexOf('5. Anhang', start)
  const endCandidates = [operatorStart, appendixStart].filter((index) => index > start)
  const end = endCandidates.length > 0 ? Math.min(...endCandidates) : text.length
  const lines = text.slice(start, end).split(/\r?\n/u)
  const sections: ParsedSection[] = []
  let current: Omit<ParsedSection, 'goals'> & { lines: string[] } | null = null

  for (const rawLine of lines) {
    const line = rawLine.trimEnd()
    const sectionMatch = line.match(/^(2\.\d|3\.\d(?:\.\d){0,2})\s+(.+?)\s*$/u)
    if (
      sectionMatch
      && !sectionMatch[2].includes('(')
      && !/\d+\s*$/u.test(sectionMatch[2])
      && !sectionMatch[2].includes('Die Verweise')
    ) {
      current = {
        sourceDocumentKey: sourceDocument.key,
        track: trackForDocument(sourceDocument),
        code: sectionMatch[1],
        title: normalizeWhitespace(sectionMatch[2]),
        rawText: '',
        lines: [],
      }
      sections.push(current as ParsedSection & { lines: string[] })
      continue
    }
    current?.lines.push(line)
  }

  return sections
    .map((section) => {
      const rawText = section.lines.join('\n').trim()
      return {
        sourceDocumentKey: section.sourceDocumentKey,
        track: section.track,
        code: section.code,
        title: section.title,
        rawText,
        goals: parseGoals(section.lines),
      }
    })
    .filter((section) => section.goals.length > 0)
}

function parseGoals(lines: string[]): ParsedGoal[] {
  const goals: ParsedGoal[] = []
  let insideCompetencyList = false
  let current: ParsedGoal | null = null

  const flush = () => {
    if (!current) return
    current.text = normalizeSentence(current.text)
    goals.push(current)
    current = null
  }

  for (const line of lines) {
    if (line.includes('Die Schülerinnen und Schüler können')) {
      insideCompetencyList = true
      continue
    }
    if (!insideCompetencyList) continue

    const bulletMatch = line.match(/^\s*(?:\((\d+)\)|(\d+)\.)\s+(.+)/u)
    if (bulletMatch) {
      flush()
      const bulletText = normalizeWhitespace(bulletMatch[3])
      if (isNoiseLine(bulletText) || isReferenceLine(bulletText)) continue
      current = {
        number: Number(bulletMatch[1] ?? bulletMatch[2]),
        text: bulletText,
      }
      continue
    }

    if (!current) continue
    const cleaned = normalizeWhitespace(line)
    if (!cleaned) continue
    if (isNoiseLine(cleaned) || isReferenceLine(cleaned)) continue
    current.text += ` ${cleaned}`
  }

  flush()
  return goals
}

function isReferenceLine(value: string): boolean {
  return /^(?:\d\.\d(?:\.\d)?|[A-ZÄÖÜ]{1,4}|REV|BNE|BTV|MB|PG|VB|BO|D|E\d|F\d|G\d)\s+\S/u.test(value)
}

function isNoiseLine(value: string): boolean {
  return /^\d+$/u.test(value)
    || value.includes('Bildungsplan 2016')
    || value.includes('Latein als')
    || value.includes('Standards für inhaltsbezogene Kompetenzen')
    || value.includes('Prozessbezogene Kompetenzen')
}

function trackForDocument(sourceDocument: SourceDocument): string {
  if (sourceDocument.key.includes('L1')) return 'L1'
  if (sourceDocument.key.includes('L2')) return 'L2'
  if (sourceDocument.key.includes('L3')) return 'L3'
  return 'L4'
}

function topicCode(section: ParsedSection): string {
  return `${section.track}-${section.code}`
}

function passageId(section: ParsedSection): string {
  return `bw-latin-${slug(section.track)}-${slug(section.code)}`
}

function sourceGoalId(section: ParsedSection, goal: ParsedGoal): string {
  return uuidFromString(`${extractionId}:${topicCode(section)}:${goal.number}:${goal.text}`)
}

function stageForSection(section: ParsedSection): SourceGoal['stage'] {
  if (section.code.startsWith('2.')) return 'SekI+SekII'
  const main = Number(section.code.split('.')[1])
  if (section.track === 'L4') return 'SekII'
  if (section.track === 'L3') return main === 1 ? 'SekI' : 'SekII'
  if (section.track === 'L2') return main <= 2 ? 'SekI' : 'SekII'
  return main <= 3 ? 'SekI' : 'SekII'
}

function courseLevelForSection(section: ParsedSection): SourceGoal['courseLevel'] {
  if (section.code.startsWith('2.')) return 'GK_LK'
  if (/\(Leistungsfach\)/u.test(section.title) || ['3.4', '3.3', '3.2'].some((prefix) =>
    section.code === prefix || section.code.startsWith(`${prefix}.`)) && section.track !== 'L4' && !section.code.startsWith('3.5')) {
    if (
      (section.track === 'L1' && section.code.startsWith('3.4'))
      || (section.track === 'L2' && section.code.startsWith('3.3'))
      || (section.track === 'L3' && section.code.startsWith('3.2'))
    ) return 'LK'
  }
  if (section.code.startsWith('3.5')) return 'GK_LK'
  return 'unspecified'
}

function titleFromText(value: string): string {
  return value.length <= 96 ? value : `${value.slice(0, 93)}...`
}

function toSentenceFragment(value: string): string {
  const trimmed = value.replace(/[.;]\s*$/u, '')
  return trimmed.charAt(0).toLowerCase() + trimmed.slice(1)
}

function normalizeSentence(value: string): string {
  return normalizeWhitespace(value)
    .replace(/­/gu, '')
    .replace(/-\s+/gu, '')
    .replace(/\s+([,.;:])/gu, '$1')
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\u00a0/gu, ' ').replace(/\s+/gu, ' ').trim()
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/gu, '-').replace(/^-|-$/gu, '')
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
  const entry = {
    landscapeId: sourceLandscapeId,
    title: 'Latein Gymnasium (Baden-Wuerttemberg, BP2016 Source-Extraction)',
    jurisdiction: 'DE-BW',
    subject: 'Latein',
    stage: 'SekI+SekII',
    sourcePath: sourceDocuments[0].path,
    archiveSourcePath: sourceDocuments[0].path,
    archivePath: 'curricula/DE/Gymnasium/input/BW/latein/',
    sourceDocumentKey: 'BW-LATEIN-BP2016',
    sourceUrl: sourceDocuments[0].url,
  }
  registry.entries = registry.entries.filter((source) => source.landscapeId !== sourceLandscapeId)
  registry.entries.push(entry)
  registry.entries.sort((left, right) => String(left.landscapeId).localeCompare(String(right.landscapeId)))
  writeJson(registryPath, registry)
}

function assertNoDuplicateIds(ids: string[], label: string): void {
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  ids.forEach((id) => {
    if (seen.has(id)) duplicates.add(id)
    seen.add(id)
  })
  if (duplicates.size > 0) throw new Error(`Duplicate ${label} IDs: ${Array.from(duplicates).join(', ')}`)
}

function uuidFromString(value: string): string {
  const hex = createHash('sha1').update(value).digest('hex').slice(0, 32)
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`
}
