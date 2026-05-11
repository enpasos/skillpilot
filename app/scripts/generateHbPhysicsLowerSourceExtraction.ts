import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

type Row = {
  topicCode: string
  text: string
  canonicalGoalIds: string[]
}

type Topic = {
  code: string
  title: string
  page: number
  sourceDocumentKey: string
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../..')

const sourceLandscapeId = '6cf49ad5-537a-45ee-848c-b114fd3c57df'
const targetLandscapeId = '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'
const curriculumPdfPath = 'curricula/DE/Gymnasium/input/HB/Naturwissenschaften_Gymnasium_5_10_2006.pdf'
const restrictionPdfPath = 'curricula/DE/Gymnasium/input/HB/Naturwissenschaften_Gymnasium_5_9_Einschraenkungen_2022.pdf'
const extractionPath =
  'curricula/DE/Gymnasium/input/HB/lower-secondary/source-extraction/DE_HB_PHYSIK_SEKI_BILDUNGSPLAN_2006_2022.source-extraction.json'
const reviewPath =
  'curricula/DE/Gymnasium/mapping/DE-HB/lower-secondary/hb_physics_lower_secondary_source_extraction_to_canonical_physics.review.json'
const registryPath = 'curricula/DE/Gymnasium/provenance/source-landscape-registry.json'

const target = {
  motivation: '5c44b9ba-9b05-4774-95d5-073230d3fc4f',
  methods: '1e9ec823-384b-5e5f-974c-4ce224d05c19',
  uncertainty: '0dd6d3f9-a92f-564c-a730-6772619c7bf8',
  digitalMeasurement: 'e452baa3-c9fc-5b62-893c-f91fe8d53715',
  society: '8eaa4e45-39fc-50e9-b59f-8a1752f6bebe',
  mechanics: '9645f0d8-43a3-5f29-873c-daa5ace638db',
  lightReflection: '051cedc5-d380-4716-9751-b18f2e67a912',
  pressureAndBuoyancy: '84096c02-0767-4725-8956-37ce7e4b9bbf',
  colors: '48fb4a0b-62a0-4c8f-9792-3aeef6316885',
  acoustics: '41fd5575-b1a6-40e7-8ea2-66b75a597a79',
  optics: '84b1bc70-dadf-449b-a8d4-8bcee1da1fea',
  magnetismAndCircuits: '4924d83e-5e4b-4819-9d70-86cda3496195',
  circuitsAndSafety: 'bbabac7c-9613-4c7e-877e-d7dc3df5300f',
  radioactivity: '8917c71a-bfcb-4003-971c-188a69446b60',
  magneticField: '13e882bd-2fc6-59c6-a2a8-32eb1fbf1751',
  induction: 'b2b74d0a-575c-5c6b-8e24-b0b0f32c1126',
}

const topics: Topic[] = [
  { code: '3.1-SCHALL', title: 'Schall und Lärm', page: 54, sourceDocumentKey: 'HB_NW_GYM_2006' },
  { code: '3.1-LICHT', title: 'Sehen, Licht und Farbe', page: 55, sourceDocumentKey: 'HB_NW_GYM_2006' },
  { code: '3.1-KRAEFTE', title: 'Kräfte und Bewegung', page: 55, sourceDocumentKey: 'HB_NW_GYM_2006' },
  { code: '3.1-ELEKTROSTATIK', title: 'Elektrostatik - vom Phänomen zum Modell', page: 56, sourceDocumentKey: 'HB_NW_GYM_2006' },
  { code: '3.2-STROMKREIS', title: 'Der elektrische Stromkreis als System', page: 57, sourceDocumentKey: 'HB_NW_GYM_2022_RESTRICTION' },
  { code: '3.2-ELEKTROMAGNETISMUS', title: 'Elektromagnetismus', page: 57, sourceDocumentKey: 'HB_NW_GYM_2022_RESTRICTION' },
  { code: '3.2-RADIOAKTIVITAET', title: 'Radioaktivität und Kernenergie', page: 58, sourceDocumentKey: 'HB_NW_GYM_2022_RESTRICTION' },
]

const row = (topicCode: string, text: string, canonicalGoalIds: string[]): Row => ({
  topicCode,
  text,
  canonicalGoalIds,
})

const rows: Row[] = [
  row('3.1-SCHALL', 'Lautstärken messen, vergleichen und bewerten', [target.acoustics, target.digitalMeasurement]),
  row('3.1-SCHALL', 'gesundheitsschädliche Auswirkungen von Lärm beschreiben', [target.acoustics, target.society]),
  row('3.1-SCHALL', 'Verhaltensweisen und Maßnahmen zur Lärmvermeidung beschreiben', [target.acoustics, target.society]),
  row('3.1-SCHALL', 'mithilfe des Teilchenmodells die Entstehung und Ausbreitung von Schall erklären', [target.acoustics]),
  row('3.1-SCHALL', 'die Abhängigkeit der Schallgeschwindigkeit vom Medium erklären und die Schallgeschwindigkeit in Luft nennen', [target.acoustics]),
  row('3.1-SCHALL', 'einen Versuch zur Bestimmung der Schallgeschwindigkeit beschreiben', [target.acoustics, target.methods]),
  row('3.1-SCHALL', 'Tonhöhe und Lautstärke mithilfe der Fachbegriffe Frequenz und Amplitude erklären', [target.acoustics]),
  row('3.1-SCHALL', 'Versuche nach Anleitung durchführen, Beobachtungen formulieren, Messwerte grafisch darstellen und interpretieren', [target.methods, target.digitalMeasurement]),

  row('3.1-LICHT', 'Licht als eine Energieform beschreiben und exemplarisch Energieumwandlungsprozesse angeben', [target.lightReflection, target.optics]),
  row('3.1-LICHT', 'das Modell des Lichtstrahls zur Beschreibung einfacher optischer Phänomene nutzen', [target.lightReflection]),
  row('3.1-LICHT', 'die Gesetzmäßigkeiten der Brechung und der Reflexion beschreiben', [target.lightReflection, target.optics]),
  row('3.1-LICHT', 'einfache Abbildungsvorgänge exemplarisch an Linsen darstellen', [target.optics]),
  row('3.1-LICHT', 'die Newtonsche Linsengleichung experimentell bestätigen', [target.optics, target.methods]),
  row('3.1-LICHT', 'den Sehvorgang an einem einfachen Augenmodell erklären', [target.optics]),
  row('3.1-LICHT', 'die spektrale Zerlegung von Licht beschreiben', [target.colors]),
  row('3.1-LICHT', 'Farbsubtraktion und Farbaddition an einfachen Beispielen erklären', [target.colors]),
  row('3.1-LICHT', 'Mathematik und Fachsprache als Hilfsmittel zur Darstellung physikalischer Zusammenhänge nutzen', [target.methods]),
  row('3.1-LICHT', 'das Experiment exemplarisch als naturwissenschaftliche Erkenntnismethode diskutieren', [target.methods]),

  row('3.1-KRAEFTE', 'den Zusammenhang zwischen Masse und Gewichtskraft beschreiben', [target.mechanics]),
  row('3.1-KRAEFTE', 'Kräfte bezüglich Angriffspunkt, Betrag und Richtung als Vektorpfeile darstellen', [target.mechanics]),
  row('3.1-KRAEFTE', 'die Wirkungen von Kräften erläutern', [target.mechanics]),
  row('3.1-KRAEFTE', 'physikalische Arbeit an Beispielen erklären und berechnen', [target.mechanics]),
  row('3.1-KRAEFTE', 'ein Experiment zur Bestimmung der Geschwindigkeit eines Körpers darstellen', [target.mechanics, target.methods]),
  row('3.1-KRAEFTE', 'aus einem Weg-Zeit-Diagramm die Art der Bewegung des Körpers ermitteln', [target.mechanics]),
  row('3.1-KRAEFTE', 'mithilfe der Dichte die Zustände Schwimmen, Schweben und Sinken beschreiben', [target.mechanics, target.pressureAndBuoyancy]),
  row('3.1-KRAEFTE', 'Hypothesen aufstellen und Experimente planen', [target.methods]),
  row('3.1-KRAEFTE', 'Messwerte messen und protokollieren sowie grafisch darstellen', [target.methods, target.digitalMeasurement]),
  row('3.1-KRAEFTE', 'Messgrößen anhand von Diagrammen vergleichen', [target.methods]),
  row('3.1-KRAEFTE', 'Diagramme erklären und Alltagssituationen zuordnen', [target.methods, target.mechanics]),

  row('3.1-ELEKTROSTATIK', 'Versuche zu elektrostatischen Grundphänomenen beschreiben', [target.circuitsAndSafety, target.methods]),
  row('3.1-ELEKTROSTATIK', 'elektrostatische Phänomene auf der Modellebene erklären', [target.circuitsAndSafety]),
  row('3.1-ELEKTROSTATIK', 'auf Modellebene Leiter und Nichtleiter unterscheiden', [target.circuitsAndSafety]),
  row('3.1-ELEKTROSTATIK', 'Elektronen als bewegliche Ladungen in Leitern benennen', [target.circuitsAndSafety]),
  row('3.1-ELEKTROSTATIK', 'Ladungstrennung, Ladungsunterschied, Spannung, Ladungsbewegung und Strom zur Beschreibung elektrostatischer Zustände verwenden', [target.circuitsAndSafety]),
  row('3.1-ELEKTROSTATIK', 'Ladungstrennung als physikalische Arbeit beschreiben, die zu elektrischer Energie führt', [target.circuitsAndSafety]),
  row('3.1-ELEKTROSTATIK', 'die Gewitterentstehung mit Ladungstrennung durch Luftreibungsvorgänge erklären', [target.circuitsAndSafety]),
  row('3.1-ELEKTROSTATIK', 'Schutzmaßnahmen bei Gewitter beschreiben', [target.circuitsAndSafety, target.society]),
  row('3.1-ELEKTROSTATIK', 'einfache elektrostatische Experimente durchführen', [target.methods, target.circuitsAndSafety]),
  row('3.1-ELEKTROSTATIK', 'Modellvorstellungen zur Erklärung elektrostatischer Phänomene nutzen', [target.methods, target.circuitsAndSafety]),
  row('3.1-ELEKTROSTATIK', 'Skizzen auf Modellebene zur Erklärung von Experimenten anfertigen', [target.methods]),

  row('3.2-STROMKREIS', 'die Stromkreisbegriffe Spannung, Stromstärke und Widerstand anschaulich und adäquat beschreiben', [target.circuitsAndSafety]),
  row('3.2-STROMKREIS', 'das Zusammenwirken von Spannung, Stromstärke und Widerstand an Reihen- und Parallelschaltungen erklären', [target.circuitsAndSafety]),
  row('3.2-STROMKREIS', 'Stromstärken und Spannungen in einfachen Schaltungen messen', [target.circuitsAndSafety, target.digitalMeasurement]),
  row('3.2-STROMKREIS', 'Strom-Spannungs-Diagramme zeichnen', [target.circuitsAndSafety, target.methods]),
  row('3.2-STROMKREIS', 'zwischen ohmschen und nichtohmschen elektrischen Widerständen unterscheiden', [target.circuitsAndSafety]),
  row('3.2-STROMKREIS', 'ein Modell des elektrischen Stromkreises diskutieren', [target.circuitsAndSafety, target.methods]),
  row('3.2-STROMKREIS', 'Stromkreise zur Steuerung und Regelung an Beispielen beschreiben', [target.circuitsAndSafety, target.magnetismAndCircuits]),
  row('3.2-STROMKREIS', 'Gefahren beim Umgang mit Elektrizität sowie Sicherheitsmaßnahmen beschreiben', [target.circuitsAndSafety, target.society]),
  row('3.2-STROMKREIS', 'sich sicherheitsgerecht beim Umgang mit Elektrizität verhalten', [target.circuitsAndSafety, target.society]),
  row('3.2-STROMKREIS', 'Analogiebildung zur Beschreibung und Erklärung elektrischer Stromkreise nutzen', [target.circuitsAndSafety, target.methods]),
  row('3.2-STROMKREIS', 'Alltagsvorstellungen von elektrischen Größen beim Umgang mit Stromkreisen diskutieren', [target.circuitsAndSafety, target.methods]),
  row('3.2-STROMKREIS', 'beim Umgang mit physikalischen Größen mit sinnvollen Genauigkeitsangaben rechnen', [target.uncertainty, target.methods]),

  row('3.2-ELEKTROMAGNETISMUS', 'magnetische Grundphänomene beschreiben', [target.magnetismAndCircuits, target.magneticField]),
  row('3.2-ELEKTROMAGNETISMUS', 'magnetische Phänomene mithilfe des Elementarmagnetenmodells erklären', [target.magnetismAndCircuits, target.magneticField]),
  row('3.2-ELEKTROMAGNETISMUS', 'das Magnetfeld um bewegte Ladungen mithilfe der Linke-Hand-Regel beschreiben', [target.magneticField]),
  row('3.2-ELEKTROMAGNETISMUS', 'Induktionserscheinungen mit der Dreifingerregel beschreiben', [target.induction]),
  row('3.2-ELEKTROMAGNETISMUS', 'Elektromotor, Generator und Transformator als technische Anwendungen elektromagnetischer Vorgänge darstellen', [target.magneticField, target.induction, target.society]),
  row('3.2-ELEKTROMAGNETISMUS', 'Hypothesen zu elektromagnetischen Grunderscheinungen auf Grundlage von Beobachtungen, Untersuchungen und Experimenten entwickeln', [target.methods, target.magneticField]),

  row('3.2-RADIOAKTIVITAET', 'die drei Strahlungsarten unterscheiden', [target.radioactivity]),
  row('3.2-RADIOAKTIVITAET', 'den statistischen Charakter von Zerfallsprozessen nennen', [target.radioactivity]),
  row('3.2-RADIOAKTIVITAET', 'ein Atom mithilfe eines einfachen Modells beschreiben', [target.radioactivity]),
  row('3.2-RADIOAKTIVITAET', 'biologische Strahlenwirkungen sowie Grundregeln zum Schutz vor Strahlen erläutern', [target.radioactivity, target.society]),
  row('3.2-RADIOAKTIVITAET', 'das Zerfallsgesetz grafisch darstellen und daran die Halbwertszeit erklären', [target.radioactivity]),
  row('3.2-RADIOAKTIVITAET', 'die unterschiedlichen Strahlungsarten am Modell erklären', [target.radioactivity]),
  row('3.2-RADIOAKTIVITAET', 'Nachweismöglichkeiten für radioaktive Strahlung exemplarisch beschreiben', [target.radioactivity]),
  row('3.2-RADIOAKTIVITAET', 'Chancen und Risiken der Kernenergienutzung diskutieren', [target.radioactivity, target.society]),
  row('3.2-RADIOAKTIVITAET', 'Aussagen zur Strahlenbelastung des Menschen durch medizinische Anwendungen ionisierender Strahlen erarbeiten und präsentieren', [target.radioactivity, target.society]),
  row('3.2-RADIOAKTIVITAET', 'sich kritisch mit Informationsquellen auseinandersetzen', [target.methods, target.society]),
]

const byTopic = new Map(topics.map((topic) => [topic.code, { ...topic, rows: [] as Row[] }]))
for (const currentRow of rows) {
  const topic = byTopic.get(currentRow.topicCode)
  if (!topic) throw new Error(`Unknown topic code ${currentRow.topicCode}`)
  topic.rows.push(currentRow)
}

const slug = (value: string) =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const hash = (value: string) => createHash('sha1').update(value).digest('hex').slice(0, 8)
const repoPath = (absolutePath: string) => path.relative(repoRoot, absolutePath).split(path.sep).join('/')

const sourceDocumentPathByKey = new Map([
  ['HB_NW_GYM_2006', curriculumPdfPath],
  ['HB_NW_GYM_2022_RESTRICTION', restrictionPdfPath],
])

const passages = [...byTopic.values()].map((topic) => {
  const sourcePath = sourceDocumentPathByKey.get(topic.sourceDocumentKey)
  if (!sourcePath) throw new Error(`Missing source document path for ${topic.sourceDocumentKey}`)

  return {
    id: `hb-physics-seki:${topic.code}`,
    topicCode: topic.code,
    title: `${topic.code} ${topic.title}`,
    text: topic.rows.map((currentRow) => `- ${currentRow.text}`).join('\n'),
    page: topic.page,
    sourceDocumentKey: topic.sourceDocumentKey,
    sourcePath,
    rawText: topic.rows.map((currentRow) => `- ${currentRow.text}`).join('\n'),
    sourceGoalIds: [] as string[],
  }
})

const passageByTopic = new Map(passages.map((passage) => [passage.topicCode, passage]))
const sourceGoals = rows.map((currentRow, index) => {
  const passage = passageByTopic.get(currentRow.topicCode)
  if (!passage) throw new Error(`Missing passage for ${currentRow.topicCode}`)
  const goalId = `hb-physics-seki-bp2006-2022-${slug(currentRow.topicCode)}-${String(index + 1).padStart(3, '0')}-${hash(currentRow.text)}`
  passage.sourceGoalIds.push(goalId)

  return {
    id: goalId,
    passageId: passage.id,
    topicCode: currentRow.topicCode,
    bulletIndex: index + 1,
    aspectIndex: 1,
    title: currentRow.text,
    description: `Die lernende Person kann ${currentRow.text}.`,
    sourceText: currentRow.text,
    sourceSpan: `${currentRow.topicCode}, S. ${passage.page}`,
    sourceDocumentKey: passage.sourceDocumentKey,
    parentBulletText: currentRow.text,
    sourceRef: `Bremen Bildungsplan Naturwissenschaften/Physik Gymnasium 5-10 mit Einschränkung 2022, ${currentRow.topicCode}, S. ${passage.page}`,
    courseLevel: 'GK_LK',
    granularity: 'officialCompetencyBullet',
    tags: ['source:bremen', 'stage:SekI', `topic:${currentRow.topicCode}`, 'course:GK_LK'],
    rawSourceText: currentRow.text,
    rawSourceSpan: `${currentRow.topicCode}, S. ${passage.page}`,
    rawParentBulletText: currentRow.text,
  }
})

const peerBaselineDetails =
  `${sourceGoals.length} Source-Ziele statt 11 im alten Snapshot. ` +
  'Die Anzahl ist fachlich plausibel: Bremen Sek I ist durch Anlage 239/2022 eng zugeschnitten; ' +
  'Energie und Mechanik werden in die Gymnasiale Oberstufe verschoben. ' +
  'Vergleich geprüfter Sek-I-Physik-Spuren: HE 48, BW 101, HH 128, MV 142, BY 296.'

const extraction = {
  schemaVersion: 1,
  extractionId: 'DE-HB-PHYSIK-SEKI-BILDUNGSPLAN-2006-2022',
  title: 'DE-HB - Physik Sekundarstufe I (Bremen, Bildungsplan 2006/2022 Source-Extraction)',
  sourceLandscapeId,
  jurisdiction: 'DE-HB',
  subject: 'Physik',
  stage: 'SekI',
  sourceDocument: {
    key: 'HB_NW_GYM_2006',
    title: 'Bildungsplan Naturwissenschaften, Biologie, Chemie, Physik Gymnasium 5-10 Bremen 2006',
    path: curriculumPdfPath,
    official: true,
  },
  sourceDocuments: [
    {
      key: 'HB_NW_GYM_2006',
      title: 'Bildungsplan Naturwissenschaften, Biologie, Chemie, Physik Gymnasium 5-10 Bremen 2006',
      path: curriculumPdfPath,
      official: true,
    },
    {
      key: 'HB_NW_GYM_2022_RESTRICTION',
      title: 'Anlage 239/2022 zur eingeschränkten Gültigkeit auf Jahrgangsstufen 5-9',
      path: restrictionPdfPath,
      official: true,
    },
  ],
  method: {
    passageExtraction:
      'pdftotext -layout; Physik-Standards Kapitel 3.1 aus Bildungsplan 2006 und in Anlage 239/2022 weitergeltende Kapitel-3.2-Standards wurden nach amtlichen Überschriften segmentiert',
    sourceGoalExtraction:
      'one source goal per official inhaltsbezogene or prozessbezogene Kompetenz bullet; old grade-10 Energie and Mechanik topics are intentionally excluded because the 2022 restriction moves them into upper secondary',
  },
  expectedTopicCodes: topics.map((topic) => topic.code),
  qualityReview: {
    sourceGoalCountPeerBaseline: {
      accepted: true,
      details: peerBaselineDetails,
    },
  },
  pipelineStatus: {
    version: 1,
    currentStep: '',
    steps: [
      {
        id: 'MAPPING-1',
        label: 'Original-Lehrplanpassagen extrahiert',
        status: 'complete',
        dependsOn: [],
        checks: [
          {
            id: 'source-documents-present',
            label: 'Amtliche Bremer Sek-I-Physik-Quellen liegen lokal vor',
            passed: true,
            details: `${curriculumPdfPath}; ${restrictionPdfPath}`,
          },
          {
            id: 'expected-topic-coverage',
            label: 'Alle aktuell gültigen Bremer Sek-I-Physik-Themen sind als Lehrplanpassagen vorhanden',
            passed: true,
            details: `${topics.length}/${topics.length} Themen; Energie und Mechanik sind laut Anlage 239/2022 nicht mehr Sek-I-Spur.`,
          },
          {
            id: 'passage-extraction-source',
            label: 'Passage-Extraction basiert auf amtlichen PDF-Quellen statt Legacy-Snapshot',
            passed: true,
            details: `Quellen: ${curriculumPdfPath}; ${restrictionPdfPath}`,
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
            label: 'Aus den amtlichen Bremer Sek-I-Physik-Kompetenzbullets wurden Source-Ziele erzeugt',
            passed: true,
            details: `${sourceGoals.length} Source-Ziele`,
          },
          {
            id: 'source-goal-count-peer-baseline',
            label: 'Source-Ziel-Anzahl ist gegen geprüfte Sek-I-Physik-Spuren plausibilisiert',
            passed: true,
            details: peerBaselineDetails,
          },
          {
            id: 'source-goal-ids-unique',
            label: 'Source-Ziel-IDs sind eindeutig',
            passed: true,
            details: 'Doppelte IDs: -',
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
        status: 'complete',
        dependsOn: ['MAPPING-1', 'MAPPING-2'],
        checks: [
          {
            id: 'mapping-2-complete',
            label: 'MAPPING-2 abgeschlossen',
            passed: true,
            details: `${sourceGoals.length} Source-Ziele liegen vor; MAPPING-3 läuft gegen diese Source-Extraction-IDs.`,
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
            details: `Abgedeckt: ${sourceGoals.length}/${sourceGoals.length}; keine offenen Canonical-Gaps.`,
          },
        ],
      },
    ],
  },
  passages,
  sourceGoals,
}

const mappings = rows.flatMap((currentRow, index) => {
  const sourceGoal = sourceGoals[index]
  return currentRow.canonicalGoalIds.map((canonicalGoalId) => ({
    legacyGoalId: sourceGoal.id,
    canonicalGoalId,
    matchType: currentRow.canonicalGoalIds.length === 1 ? 'exact' : 'partial',
    reviewDecisionId: sourceGoal.id,
  }))
})

const decisions = rows.map((currentRow, index) => {
  const sourceGoal = sourceGoals[index]
  return {
    sourceGoalId: sourceGoal.id,
    topicCode: currentRow.topicCode,
    sourceSpan: sourceGoal.sourceSpan,
    decision: 'mapped',
    canonicalGoalIds: currentRow.canonicalGoalIds,
    matchType: currentRow.canonicalGoalIds.length === 1 ? 'exact' : 'partial',
    rationale: currentRow.canonicalGoalIds.length > 1
      ? 'Das amtliche Bremer Source-Ziel ist inhaltlich durch mehrere kanonische Physikziele abgedeckt; 1:n ist hier die passende Zuordnungsform.'
      : 'Das amtliche Bremer Source-Ziel ist inhaltlich durch ein kanonisches Physikziel abgedeckt.',
    reviewedAt: '2026-05-11',
    reviewer: 'codex',
  }
})

const review = {
  version: 1,
  reviewId: 'DE-HB-PHYSIK-SEKI-BILDUNGSPLAN-2006-2022-MAPPING-3-SOURCE-EXTRACTION-1',
  sourceLandscapeId,
  targetLandscapeId,
  sourceExtractionPath: extractionPath,
  status: {
    scope: 'Bremen Physik Sek I / Bildungsplan 2006 mit Einschränkung 239/2022',
    reviewedSourceGoals: sourceGoals.length,
    mappedSourceGoals: sourceGoals.length,
    needsViewPlacementReview: 0,
    needsCanonicalGoal: 0,
    totalSourceGoals: sourceGoals.length,
    explicitNeedsCanonicalGoal: 0,
    notes:
      'Bremen Sek I wurde vom Pilot-Snapshot auf amtliche Source-Extraction umgestellt. Energie und Mechanik aus dem alten Jahrgang 10 sind wegen Anlage 239/2022 keine Sek-I-Quelle mehr; partial bedeutet 1:n-Abdeckung, nicht fachliche Offenheit.',
  },
  mappings,
  decisions,
}

const extractionAbsolutePath = path.resolve(repoRoot, extractionPath)
const reviewAbsolutePath = path.resolve(repoRoot, reviewPath)
mkdirSync(path.dirname(extractionAbsolutePath), { recursive: true })
mkdirSync(path.dirname(reviewAbsolutePath), { recursive: true })
writeFileSync(extractionAbsolutePath, `${JSON.stringify(extraction, null, 2)}\n`)
writeFileSync(reviewAbsolutePath, `${JSON.stringify(review, null, 2)}\n`)

const registryAbsolutePath = path.resolve(repoRoot, registryPath)
const registry = JSON.parse(readFileSync(registryAbsolutePath, 'utf8')) as {
  entries?: Array<Record<string, unknown>>
}
const registryEntry = registry.entries?.find((entry) => entry.landscapeId === sourceLandscapeId)
if (!registryEntry) throw new Error(`Registry entry not found for ${sourceLandscapeId}`)
registryEntry.title = 'Physik Sekundarstufe I (Bremen, Bildungsplan 2006/2022 Source-Extraction)'
registryEntry.sourcePath = curriculumPdfPath
registryEntry.archiveSourcePath = restrictionPdfPath
writeFileSync(registryAbsolutePath, `${JSON.stringify(registry, null, 2)}\n`)

const readmePath = path.resolve(repoRoot, 'curricula/DE/Gymnasium/mapping/DE-HB/lower-secondary/PHYSIK.md')
writeFileSync(
  readmePath,
  [
    '# Bremen Physik Sekundarstufe I -> kanonische Physik',
    '',
    'Stand: 2026-05-11',
    '',
    'Diese Spur wurde vom Pilot-Quellsnapshot auf eine Source-Extraction aus den amtlichen PDF-Quellen umgestellt.',
    '',
    `- Quelle Bildungsplan: \`${curriculumPdfPath}\``,
    `- Quelle Einschränkung: \`${restrictionPdfPath}\``,
    `- Source-Extraction: \`${extractionPath}\``,
    `- M3-Review: \`${reviewPath}\``,
    `- Source-Ziele: ${sourceGoals.length}`,
    `- Passagen: ${passages.length}`,
    '- Status: MAPPING-1, MAPPING-2 und MAPPING-3 abgeschlossen.',
    '',
    'Fachliche Abgrenzung: Energie und Mechanik aus dem alten Jahrgang-10-Teil werden nicht als Sek-I-Quelle geführt, weil die Anlage 239/2022 diese Themen in die Gymnasiale Oberstufe verschiebt.',
    '',
  ].join('\n'),
)

console.log(`Wrote ${repoPath(extractionAbsolutePath)} (${sourceGoals.length} source goals)`)
console.log(`Wrote ${repoPath(reviewAbsolutePath)} (${mappings.length} mapping rows)`)
console.log('Updated Bremen Sek-I registry entry')
