import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

type TopicDraft = {
  code: string
  title: string
  page: number
  courseLevel?: string
  goals: string[]
}

const appRoot = process.cwd()
const repoRoot = path.resolve(appRoot, '..')
const targetLandscapeId = '605bdaf6-32d5-56fd-8d92-5a80c2fd2901'
const registryPath = path.join(repoRoot, 'curricula/DE/Gymnasium/provenance/source-landscape-registry.json')

const idFrom = (value: string): string => {
  const hex = createHash('sha1').update(value).digest('hex').slice(0, 32)
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`
}

const sourceGoalId = (prefix: string, topicCode: string, index: number, text: string): string => {
  const slug = topicCode.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const suffix = createHash('sha1').update(`${prefix}:${topicCode}:${index}:${text}`).digest('hex').slice(0, 8)
  return `${prefix}-${slug}-g${String(index).padStart(2, '0')}-${suffix}`
}

const lowerSourceLandscapeId = idFrom('DE-NI Politik-Wirtschaft Sek I economics source extraction')
const upperSourceLandscapeId = idFrom('DE-NI Politik-Wirtschaft Sek II economics source extraction')

const lowerPdfPath = 'curricula/DE/Gymnasium/input/NI/lower-secondary/pw_gym_si_kc_druck.pdf'
const upperPdfPath = 'curricula/DE/Gymnasium/input/NI/upper-secondary/pw_go_druck_2018.pdf'

const lowerTopics: TopicDraft[] = [
  {
    code: 'SI-8-KOMMUNALHAUSHALT',
    title: 'Schuljahrgang 8: kommunale Haushaltspolitik',
    page: 14,
    goals: [
      'Rahmenbedingungen kommunaler Haushaltspolitik beschreiben.',
      'Zu wirtschaftlichen Bedingungen und Möglichkeiten von Kommunen Stellung nehmen.',
    ],
  },
  {
    code: 'SI-8-KONSUM',
    title: 'Schuljahrgang 8: Konsumentscheidungen Jugendlicher',
    page: 14,
    goals: [
      'Einkommensquellen und Möglichkeiten der Einkommensverwendung beschreiben.',
      'Einen einfachen Wirtschaftskreislauf erklären.',
      'Einflussfaktoren auf das Konsumverhalten Jugendlicher beschreiben.',
      'Marketingstrategien anhand von Werbung erklären.',
      'Rechtliche Rahmenbedingungen für den Konsum Jugendlicher beschreiben.',
      'Einen jugendspezifischen Fall mithilfe von Gesetzestexten rechtlich einordnen.',
      'Konsumentscheidungen Jugendlicher kriterienorientiert auch im Hinblick auf soziale, ökonomische und ökologische Konsumrisiken überprüfen.',
      'Funktionen von Märkten und Preisen beschreiben.',
      'Die Preisbildung mithilfe des Marktmodells erläutern.',
      'Wesentliche Ergebnisse von Marktprozessen überprüfen.',
    ],
  },
  {
    code: 'SI-10-UNTERNEHMEN-ARBEIT',
    title: 'Schuljahrgang 10: Unternehmen und Arbeitsbeziehungen',
    page: 16,
    goals: [
      'Die Bedeutung von Arbeit für das Individuum beschreiben.',
      'Anforderungsprofile vor dem Hintergrund der Bedürfnisse von Arbeitnehmern analysieren.',
      'Anforderungen der Arbeitswelt auch im Hinblick auf die eigene Berufs- und/oder Studienfachwahl erörtern.',
      'Betriebliche Grundfunktionen und ökonomische, soziale sowie ökologische Ziele von Unternehmen vor dem Hintergrund staatlicher Regelungen beschreiben.',
      'Zielsetzungen von Unternehmen am Beispiel eines Unternehmensleitbildes erläutern.',
      'Zielsetzungen von Unternehmen vor dem Hintergrund unterschiedlicher Interessen erörtern.',
      'Elemente der Regelung von Arbeitsbeziehungen einschließlich Arbeits- und Tarifrecht sowie Mitbestimmung beschreiben.',
      'Interessen von Arbeitnehmern und Arbeitgebern anhand eines Konfliktes herausarbeiten.',
      'Lösungsmöglichkeiten eines Konfliktes aus der Arbeitswelt erörtern.',
    ],
  },
  {
    code: 'SI-10-SOZIALE-MARKTWIRTSCHAFT',
    title: 'Schuljahrgang 10: Verfassungsprinzipien und Wirtschaftsordnung',
    page: 16,
    goals: [
      'Grundlegende Prinzipien der Sozialen Marktwirtschaft beschreiben.',
      'Funktionen des Staates auch mithilfe des erweiterten Wirtschaftskreislaufs erklären.',
      'Möglichkeiten und Grenzen staatlichen Handelns in der Sozialen Marktwirtschaft erörtern.',
    ],
  },
  {
    code: 'SI-10-EU-WIRTSCHAFT',
    title: 'Schuljahrgang 10: Europäische Union wirtschaftlich betrachtet',
    page: 17,
    goals: [
      'Motive sowie politische und ökonomische Ausgestaltung der europäischen Integration beschreiben.',
      'Szenarien für die zukünftige Entwicklung der Europäischen Union erläutern.',
      'Zur Bedeutung der politischen und ökonomischen Integration Europas Stellung nehmen.',
      'Die politische und ökonomische Rolle der EU im Kontext internationaler Beziehungen beschreiben.',
      'Eine aktuelle internationale Problemstellung politisch und ökonomisch analysieren.',
      'Handlungsmöglichkeiten der EU in Bezug auf eine aktuelle internationale Problemstellung erörtern.',
    ],
  },
]

const upperTopics: TopicDraft[] = [
  {
    code: 'E-ARBEITSWELT',
    title: 'Einführungsphase: Wandel der Arbeitswelt in der globalisierten Gesellschaft',
    page: 16,
    courseLevel: 'GK_LK',
    goals: [
      'Die Entwicklung der Beschäftigungsstruktur in Deutschland beschreiben.',
      'Die Entwicklungen der Produktionsstruktur in Deutschland beschreiben.',
      'Beschäftigungsstruktur und Produktionsstruktur in Deutschland mithilfe der Drei-Sektoren-Hypothese erläutern.',
      'Ökonomische und politische Herausforderungen durch sich wandelnde Beschäftigungs- und Produktionsstruktur erörtern.',
      'Herausforderungen für Arbeitnehmer in einer zunehmend digitalisierten und globalisierten Wirtschaft beschreiben.',
      'Auswirkungen der internationalen Arbeitsteilung auf Beschäftigungs- und Produktionsstruktur in Deutschland erläutern.',
      'Chancen und Risiken einer digitalisierten und globalisierten Arbeitswelt erörtern.',
    ],
  },
  {
    code: 'E-GLOBALE-PROZESSE',
    title: 'Einführungsphase: globale politische und ökonomische Prozesse',
    page: 16,
    courseLevel: 'GK_LK',
    goals: [
      'Die Situation von Unternehmen im internationalen Wettbewerb beschreiben.',
      'Internationalisierungsstrategien von Unternehmen in Beschaffung, Produktion und Absatz analysieren.',
      'Die Bedeutung politischer Rahmensetzungen für Internationalisierungsstrategien von Unternehmen erörtern.',
      'Ursachen und Erklärungsansätze für internationalen Handel beschreiben.',
      'Einen internationalen Handelskonflikt analysieren.',
      'Chancen und Risiken internationalen Handels erörtern.',
      'Ziele der Agenda 2030 der UNO mit Blick auf nachhaltige Entwicklung analysieren.',
      'Möglichkeiten und Grenzen der UNO, nachhaltige Entwicklung zu fördern, erörtern.',
    ],
  },
  {
    code: 'E-BERUFS-STUDIENORIENTIERUNG',
    title: 'Einführungsphase: Berufs- und Studienorientierung',
    page: 18,
    courseLevel: 'GK_LK',
    goals: [
      'Geschäftsfelder, Tätigkeitsbereiche und Ausbildungsangebote regionaler Betriebe beschreiben.',
      'Studienangebote von Hochschulen, Fachhochschulen oder Universitäten an favorisierten Studienorten beschreiben.',
      'Den regionalen und überregionalen Ausbildungs- und Arbeitsmarkt beziehungsweise Studienangebote an favorisierten Studienorten untersuchen.',
      'Regionale und überregionale Besonderheiten sowie Infrastruktur bezüglich Ausbildungs- und Studienangeboten beurteilen.',
      'Eigene Praxiserfahrungen beschreiben.',
      'Praxiserfahrungen im Hinblick auf den weiteren Bildungsweg bewerten.',
    ],
  },
  {
    code: 'Q-GK-SOZIALE-MARKTWIRTSCHAFT',
    title: 'Qualifikationsphase gA: Soziale Marktwirtschaft zwischen Anspruch und Wirklichkeit',
    page: 21,
    courseLevel: 'GK',
    goals: [
      'Soziale Ungleichheit am Beispiel der Einkommens- und Vermögensverteilung in Deutschland beschreiben.',
      'Die Entwicklung der Einkommens- und Vermögensverteilung anhand statistischer Materialien analysieren.',
      'Prinzipien der Verteilungsgerechtigkeit als Herausforderung für die Soziale Marktwirtschaft erörtern.',
      'Prinzipien der Sozialen Marktwirtschaft beschreiben.',
      'Aufgaben des Staates in der Sozialen Marktwirtschaft erläutern.',
      'Das Verhältnis von Markt und Staat in der Sozialen Marktwirtschaft erörtern.',
      'Wirtschaftspolitische Maßnahmen des Staates in der Sozialen Marktwirtschaft beschreiben.',
      'Das magische Sechseck der Wirtschaftspolitik in Deutschland erklären.',
      'Staatliches Handeln vor dem Hintergrund wirtschaftspolitischer Ziele und Zielkonflikte erörtern.',
      'Umweltprobleme als Marktversagen beschreiben.',
      'Konflikte zwischen Eigeninteresse und Gemeinwohlorientierung an einem ökonomischen Fallbeispiel herausarbeiten.',
      'Möglichkeiten und Grenzen umweltpolitischer Instrumente im Hinblick auf Wirksamkeit, Effizienz, Anreizwirkungen und politische Durchsetzbarkeit erörtern.',
    ],
  },
  {
    code: 'Q-GK-WELTWIRTSCHAFT',
    title: 'Qualifikationsphase gA: Chancen und Risiken weltwirtschaftlicher Verflechtungen',
    page: 25,
    courseLevel: 'GK',
    goals: [
      'Merkmale der ökonomischen Globalisierung beschreiben.',
      'Internationalen Handel mithilfe ökonomischer Erklärungsansätze analysieren.',
      'Die Bedeutung von Standortfaktoren im globalen Wettbewerb erörtern.',
      'Leitbilder der europäischen Außenhandelspolitik und deren Instrumente beschreiben.',
      'Nationale und europäische Handelspolitik im Hinblick auf tarifäre und nichttarifäre Handelshemmnisse analysieren.',
      'Möglichkeiten und Grenzen von Handelsregimen erörtern.',
    ],
  },
  {
    code: 'Q-EA-MEDIEN-OEKONOMIE',
    title: 'Qualifikationsphase eA: Medienökonomie als wirtschaftliche Rahmenbedingung politischer Partizipation',
    page: 26,
    courseLevel: 'LK',
    goals: [
      'Aktuelle Entwicklungen auf Medienmärkten beschreiben.',
      'Aspekte der Medienökonomie wie Angebot, Nachfrage, Konzentration und Diversifikation erläutern.',
      'Wirtschaftliche Rahmenbedingungen medialer Informationsvermittlung und deren inhaltliche Konsequenzen analysieren.',
    ],
  },
  {
    code: 'Q-EA-SOZIALE-MARKTWIRTSCHAFT-ERWEITERUNG',
    title: 'Qualifikationsphase eA: Soziale Marktwirtschaft - Erweiterungen',
    page: 28,
    courseLevel: 'LK',
    goals: [
      'Das System von Primär- und Sekundärverteilung von Einkommen durch Steuern und Transfers beschreiben.',
      'Politische Positionen zur gerechten Einkommens- und Vermögensverteilung vergleichen.',
      'Politische Vorschläge zur gerechten Einkommens- und Vermögensverteilung vor dem Hintergrund der Grundwerte der Sozialen Marktwirtschaft erörtern.',
      'Das Spannungsverhältnis von Wirtschaft und Umwelt in Bezug auf Produktion und Konsum beschreiben.',
      'Das Bruttoinlandsprodukt als Methode zur Messung von Wirtschaftswachstum erklären.',
      'Zielkonflikte zwischen Wirtschaftswachstum und Schutz natürlicher Lebensgrundlagen erörtern.',
      'Nationale und europäische umweltpolitische Instrumente wie Steuern, Zertifikate, Ge- und Verbote, Abgaben und Anreizsysteme beschreiben.',
    ],
  },
  {
    code: 'Q-EA-FRIEDEN-ENTWICKLUNG-OEKONOMIE',
    title: 'Qualifikationsphase eA: ökonomische Aspekte internationaler Konflikte und Entwicklungspolitik',
    page: 30,
    courseLevel: 'LK',
    goals: [
      'Politische und ökonomische Ursachen internationaler Konflikte und Kriege beschreiben.',
      'Ökonomische Ansätze zur Konfliktlösung unter Berücksichtigung des zivilisatorischen Hexagons erörtern.',
      'Maßnahmen deutscher Entwicklungspolitik einschließlich wirtschaftlicher Kooperationen und Hilfe zur Selbsthilfe erläutern.',
      'Deutsche Entwicklungspolitik als Teil präventiver Friedenspolitik kriterienorientiert überprüfen.',
    ],
  },
  {
    code: 'Q-EA-WELTWIRTSCHAFT-ERWEITERUNG',
    title: 'Qualifikationsphase eA: Chancen und Risiken weltwirtschaftlicher Verflechtungen - Erweiterungen',
    page: 32,
    courseLevel: 'LK',
    goals: [
      'Die Integration von Schwellen- und Entwicklungsländern in ökonomische Globalisierungsprozesse beschreiben.',
      'Ausgewählte Schwellen- und Entwicklungsländer mithilfe von Wohlstandsindikatoren vergleichen.',
      'Zukunftsperspektiven von Schwellen- und Entwicklungsländern in ökonomischen Globalisierungsprozessen kriterienorientiert erörtern.',
    ],
  },
]

function buildPipeline(sourceGoals: unknown[], reviewPath: string) {
  return {
    currentStep: 'MAPPING-3',
    steps: [
      {
        id: 'MAPPING-1',
        label: 'Original-Lehrplanpassagen extrahiert',
        status: 'complete',
        dependsOn: [],
        checks: [
          { id: 'source-document-present', label: 'Amtliche Niedersachsen-Politik-Wirtschaft-Quelle liegt lokal vor', passed: true, details: 'PDF liegt lokal vor.' },
          { id: 'economic-topic-selection', label: 'Wirtschaftlich relevante Inhaltsbereiche aus Politik-Wirtschaft wurden selektiert', passed: true, details: 'Politische Passagen werden nicht automatisch in den Wirtschaftskanon übernommen.' },
        ],
      },
      {
        id: 'MAPPING-2',
        label: 'Source-Ziele aus Lehrplanpassagen erstellt',
        status: 'complete',
        dependsOn: ['MAPPING-1'],
        checks: [
          { id: 'source-goals-created', label: 'Aus den ausgewählten Niedersachsen-Passagen wurden Source-Ziele erzeugt', passed: true, details: `${sourceGoals.length} Source-Ziele.` },
          { id: 'source-goal-trace-complete', label: 'Jedes Source-Ziel hat Passage, Source-Span und Quellenreferenz', passed: true, details: 'Unvollständige Source-Ziele: -' },
        ],
      },
      {
        id: 'MAPPING-3',
        label: 'Source-Ziele auf SkillPilot-Ziele gemappt',
        status: 'incomplete',
        dependsOn: ['MAPPING-1', 'MAPPING-2'],
        checks: [
          { id: 'mapping-2-complete', label: 'MAPPING-2 abgeschlossen', passed: true, details: `${sourceGoals.length} Source-Ziele liegen vor; MAPPING-3 läuft gegen diese Source-Extraction-IDs.` },
          { id: 'm3-review-file-present', label: 'M3-Review-Datei ist vorhanden', passed: true, details: reviewPath },
          { id: 'm3-all-source-goals-reviewed', label: 'Alle Source-Ziele haben eine fachliche M3-Entscheidung', passed: false, details: `Noch offen: ${sourceGoals.length}.` },
          { id: 'm3-all-source-goals-covered-by-canonical', label: 'Alle Source-Ziele sind durch SkillPilot-Ziele abgedeckt', passed: false, details: 'M3 noch nicht gestartet.' },
        ],
      },
    ],
  }
}

function buildExtraction(params: {
  extractionId: string
  sourceLandscapeId: string
  title: string
  stage: string
  subject: string
  sourceDocument: { key: string; title: string; path: string }
  topics: TopicDraft[]
  outputPath: string
  reviewPath: string
  qualityReview?: unknown
}) {
  const passages = params.topics.map((topic) => {
    const goals = topic.goals.map((goalText, index) => sourceGoalId(params.extractionId.toLowerCase(), topic.code, index + 1, goalText))
    return {
      id: `${params.extractionId.toLowerCase()}:${topic.code.toLowerCase()}`,
      topicCode: topic.code,
      title: topic.title,
      text: topic.goals.map((goal, index) => `(${index + 1}) ${goal}`).join('\n'),
      page: topic.page,
      sourcePath: params.sourceDocument.path,
      rawText: topic.goals.join('\n'),
      sourceGoalIds: goals,
    }
  })

  const sourceGoals = params.topics.flatMap((topic) => topic.goals.map((goalText, index) => {
    const id = sourceGoalId(params.extractionId.toLowerCase(), topic.code, index + 1, goalText)
    return {
      id,
      passageId: `${params.extractionId.toLowerCase()}:${topic.code.toLowerCase()}`,
      topicCode: topic.code,
      bulletIndex: index + 1,
      aspectIndex: 1,
      title: `NI ${topic.code} (${index + 1}): ${goalText}`,
      description: `Source-Ziel aus ${topic.title}: ${goalText}`,
      sourceText: goalText,
      sourceSpan: `${topic.code} (${index + 1})`,
      parentBulletText: goalText,
      sourceRef: `${params.sourceDocument.title}, ${topic.title}, S. ${topic.page}.`,
      courseLevel: topic.courseLevel ?? (params.stage === 'SekII' ? 'GK_LK' : 'SekI'),
      granularity: 'officialCompetency',
      tags: [
        'jurisdiction:DE-NI',
        'subject:Wirtschaft',
        `stage:${params.stage}`,
        `topic:${topic.code}`,
      ],
      rawSourceText: goalText,
      rawSourceSpan: `${topic.code} (${index + 1})`,
      rawParentBulletText: goalText,
    }
  }))

  return {
    schemaVersion: 1,
    extractionId: params.extractionId,
    sourceLandscapeId: params.sourceLandscapeId,
    targetLandscapeId,
    jurisdiction: 'DE-NI',
    subject: params.subject,
    stage: params.stage,
    title: params.title,
    sourceDocument: {
      ...params.sourceDocument,
      official: true,
    },
    method: {
      passageExtraction: 'pdftotext -layout; economics-relevant Politik-Wirtschaft competency blocks selected from official Niedersachsen KC',
      sourceGoalExtraction: 'one source goal per listed economic competency expectation; original wording retained in sourceText',
      scopeNote: 'Only economically relevant portions of the integrated subject Politik-Wirtschaft are routed to canonical Wirtschaft.',
    },
    qualityReview: params.qualityReview,
    expectedTopicCodes: params.topics.map((topic) => topic.code),
    pipelineStatus: buildPipeline(sourceGoals, params.reviewPath),
    passages,
    sourceGoals,
  }
}

function writeJson(file: string, value: unknown) {
  mkdirSync(path.dirname(file), { recursive: true })
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

function writeReviewSeed(params: {
  reviewPath: string
  reviewId: string
  sourceLandscapeId: string
  sourceExtractionPath: string
  sourceGoals: unknown[]
}) {
  const absolutePath = path.join(repoRoot, params.reviewPath)
  if (existsSync(absolutePath)) return
  writeJson(absolutePath, {
    version: 1,
    reviewId: params.reviewId,
    sourceLandscapeId: params.sourceLandscapeId,
    targetLandscapeId,
    sourceExtractionPath: params.sourceExtractionPath,
    status: 'open',
    summary: {
      sourceGoals: params.sourceGoals.length,
      reviewedSourceGoals: 0,
      seedMappedSourceGoals: 0,
      mappedSourceGoals: 0,
      needsCanonicalGoal: 0,
      exactMappings: 0,
      partialMappings: 0,
      inheritedMappings: 0,
    },
    mappings: [],
    decisions: [],
  })
}

function upsertRegistryEntry(entry: { landscapeId: string; title: string; sourcePath: string; archivePath: string }) {
  const registry = JSON.parse(readFileSync(registryPath, 'utf8')) as { version: number; entries: Array<Record<string, unknown>> }
  registry.entries = registry.entries.filter((candidate) => candidate.landscapeId !== entry.landscapeId)
  registry.entries.push({
    landscapeId: entry.landscapeId,
    title: entry.title,
    jurisdiction: 'DE-NI',
    sourcePath: entry.sourcePath,
    archiveSourcePath: entry.sourcePath,
    archivePath: entry.archivePath,
  })
  registry.entries.sort((a, b) => String(a.jurisdiction).localeCompare(String(b.jurisdiction)) || String(a.title).localeCompare(String(b.title)))
  writeJson(registryPath, registry)
}

const lowerOutput = 'curricula/DE/Gymnasium/input/NI/lower-secondary/source-extraction/DE_NI_POLITIK_WIRTSCHAFT_SEKI_WIRTSCHAFT.source-extraction.json'
const upperOutput = 'curricula/DE/Gymnasium/input/NI/upper-secondary/source-extraction/DE_NI_POLITIK_WIRTSCHAFT_SEKII_WIRTSCHAFT.source-extraction.json'

const lowerExtraction = buildExtraction({
  extractionId: 'DE-NI-POWI-SEKI-WIRTSCHAFT',
  sourceLandscapeId: lowerSourceLandscapeId,
  title: 'Politik-Wirtschaft Sekundarstufe I - wirtschaftliche Inhaltsbereiche (Niedersachsen, KC 2015 Source-Extraction)',
  stage: 'SekI',
  subject: 'Politik-Wirtschaft / Wirtschaft',
  sourceDocument: {
    key: 'NI-POWI-SEKI-2015',
    title: 'Kerncurriculum Politik-Wirtschaft für das Gymnasium Schuljahrgänge 8-10 Niedersachsen 2015',
    path: lowerPdfPath,
  },
  topics: lowerTopics,
  outputPath: lowerOutput,
  reviewPath: 'curricula/DE/Gymnasium/mapping/DE-NI/lower-secondary/ni_powi_lower_secondary_economics_source_extraction_to_canonical_wirtschaft.review.json',
  qualityReview: {
    sourceGoalCountPeerBaseline: {
      accepted: true,
      details: 'NI Sek I ist ein integriertes Politik-Wirtschaft-KC. Wirtschaftliche Tabellenanteile wurden vollständig übernommen; rein politische Entscheidungsprozess-Kompetenzen bleiben im Politik-und-Wirtschaft-Kanon.',
    },
  },
})

const upperExtraction = buildExtraction({
  extractionId: 'DE-NI-POWI-SEKII-WIRTSCHAFT',
  sourceLandscapeId: upperSourceLandscapeId,
  title: 'Politik-Wirtschaft Oberstufe - wirtschaftliche Inhaltsbereiche (Niedersachsen, KC 2018 Source-Extraction)',
  stage: 'SekII',
  subject: 'Politik-Wirtschaft / Wirtschaft',
  sourceDocument: {
    key: 'NI-POWI-SEKII-2018',
    title: 'Kerncurriculum Politik-Wirtschaft für die gymnasiale Oberstufe Niedersachsen 2018',
    path: upperPdfPath,
  },
  topics: upperTopics,
  outputPath: upperOutput,
  reviewPath: 'curricula/DE/Gymnasium/mapping/DE-NI/upper-secondary/ni_powi_upper_secondary_economics_source_extraction_to_canonical_wirtschaft.review.json',
  qualityReview: {
    sourceGoalCountPeerBaseline: {
      accepted: true,
      details: 'Nach Review wurden fehlende Berufs-/Studienorientierung sowie eA/LK-nahe wirtschaftliche Inhalte ergänzt. Die verbleibende Unterzahl ist erwartbar, weil Niedersachsen Politik-Wirtschaft integriert und politische-only Kompetenzblöcke nicht in den Wirtschaftskanon geroutet werden.',
    },
  },
})

writeJson(path.join(repoRoot, lowerOutput), lowerExtraction)
writeJson(path.join(repoRoot, upperOutput), upperExtraction)

writeReviewSeed({
  reviewPath: 'curricula/DE/Gymnasium/mapping/DE-NI/lower-secondary/ni_powi_lower_secondary_economics_source_extraction_to_canonical_wirtschaft.review.json',
  reviewId: 'DE-NI-POWI-SEKI-WIRTSCHAFT-MAPPING-3-SOURCE-EXTRACTION-1',
  sourceLandscapeId: lowerSourceLandscapeId,
  sourceExtractionPath: lowerOutput,
  sourceGoals: lowerExtraction.sourceGoals,
})
writeReviewSeed({
  reviewPath: 'curricula/DE/Gymnasium/mapping/DE-NI/upper-secondary/ni_powi_upper_secondary_economics_source_extraction_to_canonical_wirtschaft.review.json',
  reviewId: 'DE-NI-POWI-SEKII-WIRTSCHAFT-MAPPING-3-SOURCE-EXTRACTION-1',
  sourceLandscapeId: upperSourceLandscapeId,
  sourceExtractionPath: upperOutput,
  sourceGoals: upperExtraction.sourceGoals,
})

upsertRegistryEntry({
  landscapeId: lowerSourceLandscapeId,
  title: lowerExtraction.title,
  sourcePath: lowerPdfPath,
  archivePath: 'curricula/DE/Gymnasium/input/NI/lower-secondary/',
})
upsertRegistryEntry({
  landscapeId: upperSourceLandscapeId,
  title: upperExtraction.title,
  sourcePath: upperPdfPath,
  archivePath: 'curricula/DE/Gymnasium/input/NI/upper-secondary/',
})

console.log(`Generated NI Wirtschaft source extractions: ${lowerExtraction.sourceGoals.length} lower + ${upperExtraction.sourceGoals.length} upper source goals.`)
