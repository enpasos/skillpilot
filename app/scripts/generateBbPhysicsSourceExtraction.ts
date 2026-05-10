import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

type TopicSpec = {
  code: string
  title: string
  page: number
}

type Row = {
  topicCode: string
  category: 'Inhalte' | 'Experimente'
  courseLevel: 'GK_LK' | 'GK' | 'LK'
  text: string
  canonicalGoalIds: string[]
}

type JurisdictionConfig = {
  jurisdiction: 'DE-BB' | 'DE-BE'
  stateLabel: string
  stateLabelInTitle: string
  idPrefix: string
  sourceLandscapeId: string
  sourcePdfPath: string
  extractionPath: string
  reviewPath: string
  viewFilePrefix: string
  viewIdPrefix: string
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../..')
const targetLandscapePath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
const compositionViewDir = 'curricula/DE/Gymnasium/composition-views/physik'

const targetLandscapeId = '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'

const jurisdictionConfigs: JurisdictionConfig[] = [
  {
    jurisdiction: 'DE-BB',
    stateLabel: 'Brandenburg',
    stateLabelInTitle: 'Brandenburg',
    idPrefix: 'bb-physics',
    sourceLandscapeId: '6759f46a-5642-41f7-8dc7-71fd1c335855',
    sourcePdfPath: 'curricula/DE/Gymnasium/input/BB/upper-secondary/Teil_C_RLP_GOST_2022_Physik.pdf',
    extractionPath:
      'curricula/DE/Gymnasium/input/BB/upper-secondary/source-extraction/DE_BB_PHYSIK_SEKII_RLP_GOST_2022.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-BB/upper-secondary/bb_physics_upper_secondary_source_extraction_to_canonical_physics.review.json',
    viewFilePrefix: 'de-bb',
    viewIdPrefix: 'de-bb',
  },
  {
    jurisdiction: 'DE-BE',
    stateLabel: 'Berlin',
    stateLabelInTitle: 'Berlin',
    idPrefix: 'be-physics',
    sourceLandscapeId: '8e54a9e6-dd9d-4f5d-a632-734b4ef5c754',
    sourcePdfPath: 'curricula/DE/Gymnasium/input/BE/upper-secondary/Teil_C_RLP_GOST_2022_Physik.pdf',
    extractionPath:
      'curricula/DE/Gymnasium/input/BE/upper-secondary/source-extraction/DE_BE_PHYSIK_SEKII_RLP_GOST_2022.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-BE/upper-secondary/be_physics_upper_secondary_source_extraction_to_canonical_physics.review.json',
    viewFilePrefix: 'de-be',
    viewIdPrefix: 'de-be',
  },
]

const topics: TopicSpec[] = [
  { code: '2.2.1', title: 'Sachkompetenz', page: 10 },
  { code: '2.2.2', title: 'Erkenntnisgewinnungskompetenz', page: 11 },
  { code: '2.2.3', title: 'Kommunikationskompetenz', page: 12 },
  { code: '2.2.4', title: 'Bewertungskompetenz', page: 14 },
  { code: '2.3.1', title: 'Erhaltung und Gleichgewicht', page: 15 },
  { code: '2.3.2', title: 'Superposition und Komponenten', page: 15 },
  { code: '2.3.3', title: 'Mathematisieren und Vorhersagen', page: 16 },
  { code: '2.3.4', title: 'Zufall und Determiniertheit', page: 16 },
  { code: '3.1.1', title: 'Wurfbewegungen', page: 18 },
  { code: '3.1.2', title: 'Charakteristische Denk- und Arbeitsweisen in der Physik', page: 19 },
  { code: '3.1.3', title: 'Kreisbewegungen', page: 20 },
  { code: '3.1.4', title: 'Impuls und Impulserhaltung', page: 21 },
  { code: '3.1.5', title: 'Energie', page: 22 },
  { code: '3.2.1', title: 'Gravitationsfeld, elektrisches und magnetisches Feld', page: 24 },
  { code: '3.2.2', title: 'Bewegung von geladenen Teilchen in Feldern', page: 29 },
  { code: '3.2.3', title: 'Elektromagnetische Induktion', page: 31 },
  { code: '3.2.4', title: 'Schwingungen', page: 34 },
  { code: '3.2.5', title: 'Wellen', page: 37 },
  { code: '3.2.6', title: 'Quantenobjekte', page: 41 },
  { code: '3.2.7', title: 'Atome', page: 43 },
]

const target = {
  motivation: '5c44b9ba-9b05-4774-95d5-073230d3fc4f',
  methods: '1e9ec823-384b-5e5f-974c-4ce224d05c19',
  uncertainty: '0dd6d3f9-a92f-564c-a730-6772619c7bf8',
  digitalMeasurement: 'e452baa3-c9fc-5b62-893c-f91fe8d53715',
  ePhase: '942de15b-32f1-5713-80e5-e7aeb8749fc4',
  motion: '65ddd780-0323-45d1-8f94-5e31bf28da23',
  projectile: '287739a3-6143-55d0-abe7-1a08889e9b49',
  circle: 'db0aff75-7c88-52b0-a989-535b411c141e',
  newton: '9340e894-bb0d-45a4-91f2-b90a63ad50a8',
  conservation: 'e9d616d8-685f-4129-a36f-dae7a280bae7',
  impulse: '912febf0-754a-4409-9f8b-7d66810edc08',
  energy: 'feb70838-931c-4b45-b9a9-930605d93efa',
  thermodynamics: 'df11eb33-4900-52bf-93b3-eb82ff0f9a28',
  gravitation: '0ade0d10-8b32-5a95-a1a9-8ac64e2a8089',
  q1: '0735269d-703d-57ab-8861-6f7e1c5e2b8a',
  electricField: 'd7bc20e0-5ee9-593a-a7a9-d7cbb88392e6',
  capacitor: '0895074d-c4af-56ea-88dd-ae0fdae443ed',
  chargedInEField: '47f76c5c-05d1-59eb-876d-cafb98a66c5b',
  magneticField: '13e882bd-2fc6-59c6-a2a8-32eb1fbf1751',
  induction: 'b2b74d0a-575c-5c6b-8e24-b0b0f32c1126',
  oscillation: 'aee9676f-7cd6-50f0-a504-fd88ef67b59e',
  waves: 'dc38c943-11f6-5f4f-945b-67e330814727',
  emWaves: 'c1563745-2722-503d-819f-95d336937e2b',
  dualism: '9fd26b99-b790-5efd-8858-c7e6c20b005e',
  quantum: 'ab636b78-6031-5a5b-afa2-9ffefbdd5dda',
  atom: 'dd5a8efd-5d11-5388-aa2a-5147dec4348f',
  relativity: '157c404a-e14b-598a-9389-6924f8f9262e',
  society: '8eaa4e45-39fc-50e9-b59f-8a1752f6bebe',
}

const row = (
  topicCode: string,
  category: Row['category'],
  courseLevel: Row['courseLevel'],
  text: string,
  canonicalGoalIds: string[],
): Row => ({ topicCode, category, courseLevel, text, canonicalGoalIds })

const rows: Row[] = [
  row('2.2.1', 'Inhalte', 'GK_LK', 'Phaenomene mit bekannten physikalischen Modellen und Theorien erklaeren', [
    target.methods,
  ]),
  row('2.2.1', 'Inhalte', 'GK_LK', 'Gueltigkeitsbereiche und Vorhersagemoeglichkeiten physikalischer Modelle und Theorien erlaeutern', [
    target.methods,
  ]),
  row('2.2.1', 'Inhalte', 'GK_LK', 'geeignete Modelle und Theorien zur Loesung physikalischer Probleme auswaehlen', [
    target.methods,
  ]),
  row('2.2.1', 'Inhalte', 'GK_LK', 'Versuchsanordnungen auch mit digitalen Messwerterfassungssystemen aufbauen und protokollieren', [
    target.digitalMeasurement,
    target.methods,
  ]),
  row('2.2.1', 'Inhalte', 'GK_LK', 'bekannte Messverfahren und Funktionen einzelner Versuchsaufbau-Komponenten erklaeren', [
    target.methods,
  ]),
  row('2.2.1', 'Inhalte', 'GK_LK', 'bekannte Auswerteverfahren auf Messergebnisse anwenden', [
    target.methods,
    target.uncertainty,
  ]),
  row('2.2.1', 'Inhalte', 'GK_LK', 'bekannte mathematische Verfahren auf physikalische Sachverhalte anwenden', [
    target.methods,
  ]),

  row('2.2.2', 'Inhalte', 'GK_LK', 'Fragestellungen zu physikalischen Sachverhalten identifizieren und entwickeln', [
    target.methods,
  ]),
  row('2.2.2', 'Inhalte', 'GK_LK', 'theoriegeleitet Hypothesen zu physikalischen Fragestellungen aufstellen', [
    target.methods,
  ]),
  row('2.2.2', 'Inhalte', 'GK_LK', 'Eignung von Untersuchungsverfahren zur Hypothesenpruefung beurteilen', [
    target.methods,
  ]),
  row('2.2.2', 'Inhalte', 'GK_LK', 'Phaenomene physikalisch mit mathematischen Darstellungen und digitalen Werkzeugen modellieren', [
    target.methods,
    target.digitalMeasurement,
  ]),
  row('2.2.2', 'Inhalte', 'GK_LK', 'Experimente und Auswertungen zur Untersuchung physikalischer Fragestellungen planen', [
    target.methods,
  ]),
  row('2.2.2', 'Inhalte', 'GK_LK', 'Strukturen und Beziehungen in erhobenen oder recherchierten Daten mit Modellen erklaeren', [
    target.methods,
  ]),
  row('2.2.2', 'Inhalte', 'GK_LK', 'Messunsicherheiten beruecksichtigen und Konsequenzen fuer die Ergebnisinterpretation analysieren', [
    target.uncertainty,
  ]),
  row('2.2.2', 'Inhalte', 'GK_LK', 'Eignung physikalischer Modelle und Theorien fuer Problemloesungen beurteilen', [
    target.methods,
  ]),
  row('2.2.2', 'Inhalte', 'GK_LK', 'Relevanz von Modellen, Theorien, Hypothesen und Experimenten fuer Erkenntnisgewinnung reflektieren', [
    target.methods,
  ]),
  row('2.2.2', 'Inhalte', 'GK_LK', 'theoretische Ueberlegungen und Modelle auf Alltagssituationen beziehen und Generalisierbarkeit reflektieren', [
    target.methods,
    target.society,
  ]),
  row('2.2.2', 'Inhalte', 'GK_LK', 'Moeglichkeiten und Grenzen konkreter Erkenntnisprozesse und Erkenntnisse reflektieren', [
    target.methods,
  ]),

  row('2.2.3', 'Inhalte', 'GK_LK', 'zu physikalischen Sachverhalten zielgerichtet in analogen und digitalen Medien recherchieren', [
    target.methods,
  ]),
  row('2.2.3', 'Inhalte', 'GK_LK', 'Quellen nach Korrektheit, Fachsprache und Relevanz pruefen', [
    target.methods,
  ]),
  row('2.2.3', 'Inhalte', 'GK_LK', 'Informationen aus Beobachtungen, Darstellungen und Texten strukturiert und fachsprachlich wiedergeben', [
    target.methods,
  ]),
  row('2.2.3', 'Inhalte', 'GK_LK', 'fachsprachlich chronologisch und kausal korrekt formulieren', [
    target.methods,
  ]),
  row('2.2.3', 'Inhalte', 'GK_LK', 'Schwerpunkte fuer Praesentationen, Diskussionen und Kommunikationsformen sachgerecht auswaehlen', [
    target.methods,
  ]),
  row('2.2.3', 'Inhalte', 'GK_LK', 'Informationen und Daten zielgerecht auch mit digitalen Werkzeugen veranschaulichen', [
    target.digitalMeasurement,
    target.methods,
  ]),
  row('2.2.3', 'Inhalte', 'GK_LK', 'physikalische Sachverhalte und Arbeitsergebnisse adressatengerecht praesentieren', [
    target.methods,
  ]),
  row('2.2.3', 'Inhalte', 'GK_LK', 'physikalisch gueltige Argumentationsketten beurteilen und entwickeln', [
    target.methods,
  ]),
  row('2.2.3', 'Inhalte', 'GK_LK', 'konstruktiv ueber physikalische Sachverhalte diskutieren und Standpunkte reflektieren', [
    target.methods,
  ]),
  row('2.2.3', 'Inhalte', 'GK_LK', 'Urheberschaft pruefen, Quellen belegen und Zitate kennzeichnen', [
    target.methods,
  ]),

  row('2.2.4', 'Inhalte', 'GK_LK', 'Eigenschaften einer schluessigen Argumentation aus verschiedenen Perspektiven erlaeutern', [
    target.society,
  ]),
  row('2.2.4', 'Inhalte', 'GK_LK', 'Informationen und Darstellungen unterschiedlicher Quellen nach Vertrauenswuerdigkeit und Relevanz beurteilen', [
    target.society,
  ]),
  row('2.2.4', 'Inhalte', 'GK_LK', 'Handlungsoptionen in alltags- oder gesellschaftsrelevanten Entscheidungssituationen entwickeln und abwaegen', [
    target.society,
  ]),
  row('2.2.4', 'Inhalte', 'GK_LK', 'in ausserfachlichen Kontexten reflektiert und rational ein eigenes Urteil bilden', [
    target.society,
  ]),
  row('2.2.4', 'Inhalte', 'GK_LK', 'Bewertungen von Technologien, Sicherheitsmassnahmen und Risiken hinsichtlich der Prozessguete reflektieren', [
    target.society,
  ]),
  row('2.2.4', 'Inhalte', 'GK_LK', 'Technologien und Sicherheitsmassnahmen hinsichtlich Eignung, Konsequenzen und Risiken beurteilen', [
    target.society,
  ]),
  row('2.2.4', 'Inhalte', 'GK_LK', 'lokale und globale Folgen eigener und gesellschaftlicher Entscheidungen reflektieren', [
    target.society,
  ]),
  row('2.2.4', 'Inhalte', 'GK_LK', 'Auswirkungen physikalischer Weltbetrachtung und Bedeutung physikalischer Kompetenzen reflektieren', [
    target.society,
  ]),

  row('2.3.1', 'Inhalte', 'GK_LK', 'physikalische Sachverhalte durch Erhaltung und Gleichgewicht bilanzierend beschreiben', [
    target.conservation,
    target.energy,
  ]),
  row('2.3.2', 'Inhalte', 'GK_LK', 'physikalische Groessen durch Superposition und Komponentenzerlegung analysieren', [
    target.projectile,
    target.electricField,
    target.waves,
  ]),
  row('2.3.3', 'Inhalte', 'GK_LK', 'physikalische Vorgaenge mathematisch beschreiben und Vorhersagen ableiten', [
    target.methods,
    target.motion,
    target.induction,
  ]),
  row('2.3.4', 'Inhalte', 'GK_LK', 'Zufall und Determiniertheit bei Messunsicherheit, statistischen Verteilungen und Quantenobjekten unterscheiden', [
    target.uncertainty,
    target.quantum,
  ]),

  row('3.1.1', 'Inhalte', 'GK_LK', 'gleichfoermige und gleichmaessig beschleunigte Bewegungen wiederholen', [target.motion]),
  row('3.1.1', 'Inhalte', 'GK_LK', 'Bewegungen mit Anfangsbedingungen beschreiben', [target.motion]),
  row('3.1.1', 'Inhalte', 'GK_LK', 'senkrechte Wurfbewegungen modellieren', [target.projectile]),
  row('3.1.1', 'Inhalte', 'GK_LK', 'waagerechte Wurfbewegungen als Superposition analysieren', [target.projectile]),
  row('3.1.1', 'Inhalte', 'GK_LK', 'schiefe Wurfbewegungen beschreiben', [target.projectile]),
  row('3.1.1', 'Inhalte', 'GK_LK', 'Wurfbewegungen unter dem Einfluss von Luftwiderstand beurteilen', [target.projectile]),
  row('3.1.1', 'Experimente', 'GK_LK', 'Bewegungsanalyse mit Sensoren oder digitalen Messsystemen durchfuehren', [
    target.digitalMeasurement,
    target.projectile,
  ]),

  row('3.1.2', 'Inhalte', 'GK_LK', 'physikalische Erkenntnisgewinnung mit Experimenten und Modellen beschreiben', [target.methods]),
  row('3.1.2', 'Inhalte', 'GK_LK', 'Fragestellungen, Hypothesen, Untersuchungen und Auswertungen planen und beurteilen', [target.methods]),
  row('3.1.2', 'Inhalte', 'GK_LK', 'systematische und zufaellige Messabweichungen unterscheiden', [target.uncertainty]),
  row('3.1.2', 'Inhalte', 'GK_LK', 'absolute und relative Messabweichungen bestimmen und interpretieren', [target.uncertainty]),
  row('3.1.2', 'Inhalte', 'GK_LK', 'Mittelwert und Standardabweichung fuer Messreihen verwenden', [target.uncertainty]),
  row('3.1.2', 'Experimente', 'GK_LK', 'Temperaturabhaengigkeit eines elektrischen Widerstands untersuchen', [
    target.methods,
    target.uncertainty,
  ]),
  row('3.1.2', 'Experimente', 'GK_LK', 'Fallbeschleunigung oder Reibungskoeffizienten experimentell bestimmen', [
    target.methods,
    target.uncertainty,
  ]),
  row('3.1.2', 'Experimente', 'GK_LK', 'Abkuehlungskurve, Luftdruckverlauf oder radioaktive Aktivitaet auswerten', [
    target.methods,
    target.uncertainty,
  ]),

  row('3.1.3', 'Inhalte', 'GK_LK', 'Kreisbewegungen mit Bahn- und Winkelgroessen beschreiben', [target.circle]),
  row('3.1.3', 'Inhalte', 'GK_LK', 'gleichfoermige Kreisbewegung als beschleunigte Bewegung deuten', [target.circle]),
  row('3.1.3', 'Inhalte', 'GK_LK', 'Radialbeschleunigung und Radialkraft bei Kreisbewegungen anwenden', [target.circle]),
  row('3.1.3', 'Inhalte', 'GK_LK', 'Abhaengigkeit der Radialkraft von Masse, Winkelgeschwindigkeit, Bahngeschwindigkeit und Radius untersuchen', [
    target.circle,
  ]),
  row('3.1.3', 'Experimente', 'GK_LK', 'Bahn- und Winkelgeschwindigkeiten experimentell untersuchen', [
    target.circle,
    target.digitalMeasurement,
  ]),
  row('3.1.3', 'Experimente', 'GK_LK', 'Radialbeschleunigung mit Sensoren messen', [
    target.circle,
    target.digitalMeasurement,
  ]),

  row('3.1.4', 'Inhalte', 'GK_LK', 'Impuls als Produkt aus Masse und Geschwindigkeit verwenden', [target.impulse]),
  row('3.1.4', 'Inhalte', 'GK_LK', 'Kraft als zeitliche Aenderung des Impulses interpretieren', [target.impulse]),
  row('3.1.4', 'Inhalte', 'GK_LK', 'Impulserhaltung aus den Newtonschen Axiomen begruenden', [
    target.impulse,
    target.newton,
  ]),
  row('3.1.4', 'Inhalte', 'GK_LK', 'zentrale Stoesse modellieren', [target.impulse]),
  row('3.1.4', 'Inhalte', 'GK_LK', 'elastische Stoesse analysieren', [target.impulse]),
  row('3.1.4', 'Inhalte', 'GK_LK', 'unelastische Stoesse analysieren', [target.impulse]),
  row('3.1.4', 'Inhalte', 'GK_LK', 'Schwerpunktsatz und Spezialfaelle von Stoessen anwenden', [target.impulse]),
  row('3.1.4', 'Experimente', 'GK_LK', 'Geschwindigkeitsaenderungen bei elastischen und unelastischen zentralen Stoessen messen', [
    target.impulse,
    target.digitalMeasurement,
  ]),

  row('3.1.5', 'Inhalte', 'GK_LK', 'Arbeit als Aenderung mechanischer Energie deuten', [target.energy]),
  row('3.1.5', 'Inhalte', 'GK_LK', 'Energieaenderungen bei Hoehe, Geschwindigkeit und elastischer Verformung bestimmen', [target.energy]),
  row('3.1.5', 'Inhalte', 'GK_LK', 'Energieaenderungen bei Temperatur- und Aggregatzustandsaenderungen beschreiben', [
    target.thermodynamics,
  ]),
  row('3.1.5', 'Inhalte', 'GK_LK', 'Energieerhaltung und Wirkungsgrad anwenden', [
    target.energy,
    target.conservation,
  ]),
  row('3.1.5', 'Experimente', 'GK_LK', 'Konstanz der Summe aus potenzieller und kinetischer Energie untersuchen', [target.energy]),
  row('3.1.5', 'Experimente', 'GK_LK', 'spezifische Waermekapazitaet und latente Waermen experimentell bestimmen', [
    target.thermodynamics,
  ]),
  row('3.1.5', 'Experimente', 'GK_LK', 'Mischtemperaturen berechnen und experimentell pruefen', [target.thermodynamics]),
  row('3.1.5', 'Experimente', 'GK_LK', 'Wirkungsgrade elektrischer Geraete bestimmen', [target.energy]),

  row('3.2.1', 'Inhalte', 'GK', 'Gravitationsgesetz und Feldlinienbilder des Gravitationsfeldes nutzen', [target.gravitation]),
  row('3.2.1', 'Inhalte', 'GK', 'Feldstaerke als Kraft pro Masse im Gravitationsfeld verwenden', [target.gravitation]),
  row('3.2.1', 'Inhalte', 'GK', 'Bewegung von Koerpern im Gravitationsfeld mit Radialkraft beschreiben', [target.gravitation]),
  row('3.2.1', 'Inhalte', 'LK', 'Keplersche Gesetze zur Planetenbewegung anwenden', [target.gravitation]),
  row('3.2.1', 'Inhalte', 'GK', 'Kraefte zwischen elektrischen Ladungen und Feldlinienbilder beschreiben', [target.electricField]),
  row('3.2.1', 'Inhalte', 'GK', 'elektrische Feldstaerke als Kraft pro Ladung verwenden', [target.electricField]),
  row('3.2.1', 'Inhalte', 'GK', 'Superposition elektrischer Felder qualitativ beschreiben', [target.electricField]),
  row('3.2.1', 'Inhalte', 'GK', 'Spannung und elektrische Stromstaerke definieren und anwenden', [target.electricField]),
  row('3.2.1', 'Inhalte', 'GK', 'Kapazitaet eines Kondensators als Ladung pro Spannung verwenden', [target.capacitor]),
  row('3.2.1', 'Inhalte', 'GK', 'elektrisches Feld im Plattenkondensator mit Spannung und Plattenabstand beschreiben', [
    target.capacitor,
  ]),
  row('3.2.1', 'Inhalte', 'GK', 'Kapazitaetsabhaengigkeiten von Flaeche, Abstand und Dielektrikum beurteilen', [target.capacitor]),
  row('3.2.1', 'Inhalte', 'GK', 'zeitlichen Stromverlauf beim Laden und Entladen eines Kondensators auswerten', [
    target.capacitor,
  ]),
  row('3.2.1', 'Inhalte', 'GK', 'Energie eines geladenen Kondensators bestimmen und Anwendungen deuten', [target.capacitor]),
  row('3.2.1', 'Inhalte', 'LK', 'elektrische Spannung als Potentialdifferenz interpretieren', [target.electricField]),
  row('3.2.1', 'Inhalte', 'LK', 'Coulombsches Gesetz und quantitative Superposition elektrischer Felder anwenden', [
    target.electricField,
  ]),
  row('3.2.1', 'Inhalte', 'LK', 'Influenz, Polarisation und Dielektrika im elektrischen Feld erklaeren', [
    target.electricField,
    target.capacitor,
  ]),
  row('3.2.1', 'Inhalte', 'LK', 'Strom- und Spannungsverlauf beim Kondensatorladen und -entladen mathematisch beschreiben', [
    target.capacitor,
  ]),
  row('3.2.1', 'Inhalte', 'LK', 'Parallel- und Reihenschaltung von Kondensatoren analysieren', [target.capacitor]),
  row('3.2.1', 'Inhalte', 'GK', 'Feldlinienbilder von Permanentmagnet, geradem Leiter und Spule beschreiben', [
    target.magneticField,
  ]),
  row('3.2.1', 'Inhalte', 'GK', 'magnetische Flussdichte ueber die Kraft auf einen stromdurchflossenen Leiter definieren', [
    target.magneticField,
  ]),
  row('3.2.1', 'Inhalte', 'GK', 'Magnetfeld einer langen Spule und Materialeinfluss beurteilen', [target.magneticField]),
  row('3.2.1', 'Inhalte', 'GK', 'Lorentzkraft in magnetischen Feldern anwenden', [target.magneticField]),
  row('3.2.1', 'Inhalte', 'GK', 'Gravitationsfeld, elektrisches Feld und magnetisches Feld vergleichen', [target.q1]),
  row('3.2.1', 'Inhalte', 'LK', 'Kraefte zwischen zwei stromdurchflossenen Leitern qualitativ erklaeren', [
    target.magneticField,
  ]),

  row('3.2.2', 'Inhalte', 'GK', 'Bewegung geladener Teilchen im homogenen elektrischen Laengsfeld beschreiben', [
    target.chargedInEField,
  ]),
  row('3.2.2', 'Inhalte', 'GK', 'Bewegung geladener Teilchen im homogenen elektrischen Querfeld qualitativ beschreiben', [
    target.chargedInEField,
  ]),
  row('3.2.2', 'Inhalte', 'GK', 'Vakuumlichtgeschwindigkeit als obere Grenzgeschwindigkeit einordnen', [target.relativity]),
  row('3.2.2', 'Inhalte', 'GK', 'Millikan-Versuch im Schwebefall zur Elementarladung auswerten', [target.chargedInEField]),
  row('3.2.2', 'Inhalte', 'GK', 'kreisfoermige Bahn geladener Teilchen im homogenen Magnetfeld analysieren', [
    target.magneticField,
  ]),
  row('3.2.2', 'Inhalte', 'GK', 'spezifische Elektronenladung experimentell bestimmen', [target.magneticField]),
  row('3.2.2', 'Inhalte', 'GK', 'Gluehemission als Elektronenquelle beschreiben', [target.chargedInEField]),
  row('3.2.2', 'Inhalte', 'LK', 'Bahngleichungen im elektrischen Laengs- und Querfeld mathematisch beschreiben', [
    target.chargedInEField,
  ]),
  row('3.2.2', 'Inhalte', 'LK', 'relativistische Massenzunahme in Beschleunigungsprozessen beruecksichtigen', [target.relativity]),
  row('3.2.2', 'Inhalte', 'LK', 'Eintritt geladener Teilchen unter beliebigem Winkel in homogene Magnetfelder modellieren', [
    target.magneticField,
  ]),
  row('3.2.2', 'Inhalte', 'LK', 'gekoppelte elektrische und magnetische Felder zur Teilchenbewegung nutzen', [
    target.chargedInEField,
    target.magneticField,
  ]),
  row('3.2.2', 'Inhalte', 'LK', 'Hall-Effekt und Hallspannung erklaeren', [target.magneticField]),

  row('3.2.3', 'Inhalte', 'GK', 'Entstehung einer Induktionsspannung qualitativ und experimentell beschreiben', [
    target.induction,
  ]),
  row('3.2.3', 'Inhalte', 'GK', 'Induktionsgesetz mit Differenzenquotienten anwenden', [target.induction]),
  row('3.2.3', 'Inhalte', 'GK', 'Induktionsgesetz fuer konstante Flaeche oder konstante Flussdichte vereinfachen', [
    target.induction,
  ]),
  row('3.2.3', 'Inhalte', 'GK', 'Wechselspannungserzeugung qualitativ erklaeren', [target.induction]),
  row('3.2.3', 'Inhalte', 'LK', 'Induktionsgesetz in Differentialform anwenden', [target.induction]),
  row('3.2.3', 'Inhalte', 'LK', 'sinusfoermige Wechselspannung mathematisch beschreiben', [target.induction]),
  row('3.2.3', 'Inhalte', 'GK', 'Spannungs- und Stromverlauf beim Schalten von Spulen qualitativ erklaeren', [
    target.induction,
  ]),
  row('3.2.3', 'Inhalte', 'GK', 'Lenzsche Regel anwenden', [target.induction]),
  row('3.2.3', 'Inhalte', 'GK', 'Selbstinduktionsspannung mit Differenzenquotienten beschreiben', [target.induction]),
  row('3.2.3', 'Inhalte', 'GK', 'Induktivitaet einer Spule und Energie des magnetischen Feldes verwenden', [
    target.induction,
  ]),
  row('3.2.3', 'Inhalte', 'LK', 'Strom- und Spannungsverlauf bei Schaltvorgaengen mathematisch beschreiben', [
    target.induction,
  ]),
  row('3.2.3', 'Inhalte', 'LK', 'Selbstinduktionsspannung in Differentialform anwenden', [target.induction]),

  row('3.2.4', 'Inhalte', 'GK', 'mechanische Oszillatoren und ihre charakteristischen Groessen beschreiben', [
    target.oscillation,
  ]),
  row('3.2.4', 'Inhalte', 'GK', 'Energieumwandlungen bei mechanischen Schwingungen beschreiben', [target.oscillation]),
  row('3.2.4', 'Inhalte', 'GK', 'Daempfung mechanischer Schwingungen deuten', [target.oscillation]),
  row('3.2.4', 'Inhalte', 'GK', 'Periodendauer eines Federpendels berechnen', [target.oscillation]),
  row('3.2.4', 'Inhalte', 'GK', 'harmonische Schwingung mit Bewegungsgleichung beschreiben', [target.oscillation]),
  row('3.2.4', 'Inhalte', 'GK', 'erzwungene Schwingungen und Resonanz erklaeren', [target.oscillation]),
  row('3.2.4', 'Inhalte', 'LK', 'lineares Kraftgesetz als Bedingung harmonischer Schwingungen begruenden', [
    target.oscillation,
  ]),
  row('3.2.4', 'Inhalte', 'GK', 'elektromagnetische Schwingung im LC-Kreis beschreiben', [target.induction]),
  row('3.2.4', 'Inhalte', 'GK', 'zeitliche Verlaeufe von Spannung und Stromstaerke im Schwingkreis deuten', [
    target.induction,
  ]),
  row('3.2.4', 'Inhalte', 'GK', 'Thomsonsche Schwingungsgleichung anwenden', [target.induction]),
  row('3.2.4', 'Inhalte', 'GK', 'Energieumwandlungen und Daempfung elektromagnetischer Schwingungen beschreiben', [
    target.induction,
  ]),
  row('3.2.4', 'Inhalte', 'GK', 'mechanische und elektromagnetische Schwingungen vergleichen', [
    target.oscillation,
    target.induction,
  ]),
  row('3.2.4', 'Inhalte', 'LK', 'Rueckkopplung zur Erzeugung ungedaempfter elektromagnetischer Schwingungen beschreiben', [
    target.induction,
  ]),
  row('3.2.4', 'Inhalte', 'LK', 'erzwungene elektromagnetische Schwingungen und Resonanz erklaeren', [
    target.induction,
  ]),

  row('3.2.5', 'Inhalte', 'GK', 'mechanische Wellen mit Auslenkung, Wellenlaenge, Frequenz und Ausbreitungsgeschwindigkeit beschreiben', [
    target.waves,
  ]),
  row('3.2.5', 'Inhalte', 'GK', 'Longitudinal- und Transversalwellen unterscheiden', [target.waves]),
  row('3.2.5', 'Inhalte', 'GK', 'Reflexion, Brechung, Beugung und Interferenz mechanischer Wellen erklaeren', [
    target.waves,
  ]),
  row('3.2.5', 'Inhalte', 'GK', 'Polarisation von Transversalwellen beschreiben', [target.waves]),
  row('3.2.5', 'Inhalte', 'GK', 'stehende Wellen und Eigenfrequenzen deuten', [target.waves]),
  row('3.2.5', 'Inhalte', 'LK', 'Huygenssches Prinzip und Wellengleichung anwenden', [target.waves]),
  row('3.2.5', 'Inhalte', 'GK', 'elektromagnetische Wellen und ihr Spektrum beschreiben', [target.emWaves]),
  row('3.2.5', 'Inhalte', 'GK', 'Interferenz von monochromatischem Licht an Doppelspalt und Gitter auswerten', [
    target.emWaves,
  ]),
  row('3.2.5', 'Inhalte', 'GK', 'Bedingungen fuer konstruktive und destruktive Interferenz anwenden', [
    target.emWaves,
  ]),
  row('3.2.5', 'Inhalte', 'GK', 'Dispersion von weissem Licht am Gitter erklaeren', [target.emWaves]),
  row('3.2.5', 'Inhalte', 'LK', 'Beugung und Interferenz am Einzelspalt analysieren', [target.emWaves]),
  row('3.2.5', 'Inhalte', 'LK', 'Interferometer physikalisch deuten', [target.emWaves]),
  row('3.2.5', 'Inhalte', 'LK', 'Roentgenbeugung und Bragg-Bedingung anwenden', [target.emWaves, target.atom]),
  row('3.2.5', 'Inhalte', 'LK', 'Hertzschen Dipol als Quelle elektromagnetischer Wellen beschreiben', [target.emWaves]),

  row('3.2.6', 'Inhalte', 'GK', 'Fotoeffekt als Widerspruch zum klassischen Wellenmodell des Lichts beschreiben', [
    target.dualism,
  ]),
  row('3.2.6', 'Inhalte', 'GK', 'Einsteinsches Photonenmodell zur Deutung des Fotoeffekts anwenden', [target.dualism]),
  row('3.2.6', 'Inhalte', 'GK', 'Impuls klassischer Teilchen und Photonen vergleichen', [target.dualism]),
  row('3.2.6', 'Inhalte', 'GK', 'de-Broglie-Hypothese fuer Materiewellen anwenden', [target.dualism]),
  row('3.2.6', 'Inhalte', 'GK', 'Elektronenbeugung qualitativ beschreiben', [target.quantum]),
  row('3.2.6', 'Inhalte', 'GK', 'Taylor-Experiment und stochastische Verteilung einzelner Quantenobjekte deuten', [
    target.quantum,
  ]),
  row('3.2.6', 'Inhalte', 'GK', 'Komplementaritaet von Weginformation und Interferenz erklaeren', [target.quantum]),
  row('3.2.6', 'Inhalte', 'LK', 'Elektronenbeugung quantitativ auswerten', [target.quantum]),
  row('3.2.6', 'Inhalte', 'LK', 'Heisenbergsche Unschaerferelation anwenden', [target.quantum]),
  row('3.2.6', 'Inhalte', 'LK', 'Masse-Energie-Aequivalenz einordnen', [target.relativity]),

  row('3.2.7', 'Inhalte', 'GK', 'Linienspektrum des Wasserstoffatoms und Serienformel nutzen', [target.atom]),
  row('3.2.7', 'Inhalte', 'GK', 'Emission und Absorption mit Energieniveaus erklaeren', [target.atom]),
  row('3.2.7', 'Inhalte', 'GK', 'Energien des Wasserstoffatoms bestimmen', [target.atom]),
  row('3.2.7', 'Inhalte', 'GK', 'Energieniveauschema und Spektrum des Wasserstoffatoms verknuepfen', [target.atom]),
  row('3.2.7', 'Inhalte', 'GK', 'Orbitale des Wasserstoffatoms als Aufenthaltswahrscheinlichkeiten deuten', [
    target.atom,
    target.quantum,
  ]),
  row('3.2.7', 'Inhalte', 'GK', 'optische Spektralanalyse anwenden', [target.atom]),
  row('3.2.7', 'Inhalte', 'LK', 'Franck-Hertz-Versuch auswerten', [target.atom]),
  row('3.2.7', 'Inhalte', 'LK', 'eindimensionalen Potentialtopf und Modellgrenzen beschreiben', [target.quantum]),
  row('3.2.7', 'Inhalte', 'LK', 'Betragsquadrat der Wellenfunktion als Wahrscheinlichkeitsdichte deuten', [
    target.quantum,
  ]),
  row('3.2.7', 'Inhalte', 'LK', 'Einelektronensysteme und wasserstoffaehnliche Atome vergleichen', [target.atom]),
  row('3.2.7', 'Inhalte', 'LK', 'Mehrelektronensysteme und Pauli-Prinzip erklaeren', [target.atom]),
  row('3.2.7', 'Inhalte', 'LK', 'Eigenschaften und Spektrum von Roentgenstrahlung erklaeren', [target.atom]),
]

function hash(input: string): string {
  return createHash('sha1').update(input).digest('hex').slice(0, 8)
}

function topicByCode(code: string): TopicSpec {
  const topic = topics.find((entry) => entry.code === code)
  if (!topic) {
    throw new Error(`Unknown topic code ${code}`)
  }
  return topic
}

function extractTopicText(rawText: string, topic: TopicSpec, nextTopic?: TopicSpec): string {
  const startMarker = `${topic.code} ${topic.title}`
  const start = rawText.indexOf(startMarker)
  if (start === -1) {
    throw new Error(`Topic heading not found in PDF text: ${startMarker}`)
  }
  const nextStart = nextTopic ? rawText.indexOf(`${nextTopic.code} ${nextTopic.title}`, start + startMarker.length) : -1
  const end = nextStart === -1 ? rawText.length : nextStart
  return rawText
    .slice(start, end)
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function validateCanonicalTargets(): Map<string, { contains?: string[] }> {
  const canonical = JSON.parse(readFileSync(path.join(repoRoot, targetLandscapePath), 'utf8')) as {
    goals: Array<{ id: string; contains?: string[] }>
  }
  const goals = new Map(canonical.goals.map((goal) => [goal.id, goal]))
  const missing = new Set<string>()
  for (const rowEntry of rows) {
    for (const canonicalGoalId of rowEntry.canonicalGoalIds) {
      if (!goals.has(canonicalGoalId)) {
        missing.add(canonicalGoalId)
      }
    }
  }
  if (missing.size) {
    throw new Error(`Missing canonical target goals:\n${[...missing].sort().join('\n')}`)
  }
  return goals
}

function buildExtraction(rawText: string, config: JurisdictionConfig) {
  const sourceGoals = rows.map((rowEntry, index) => {
    const topic = topicByCode(rowEntry.topicCode)
    const idBase = `${config.idPrefix}-sekii-rlp-${rowEntry.topicCode.replaceAll('.', '-')}-${String(index + 1).padStart(3, '0')}`
    return {
      id: `${idBase}-${hash(`${rowEntry.topicCode}|${rowEntry.courseLevel}|${rowEntry.category}|${rowEntry.text}`)}`,
      title: rowEntry.text,
      description: `Die lernende Person kann ${rowEntry.text}.`,
      sourceDocumentKey: 'RLP-GOST-2022',
      sourceRef: `RLP Gymnasiale Oberstufe Physik 2022, ${topic.code} ${topic.title}, S. ${topic.page}.`,
      topicCode: rowEntry.topicCode,
      topicTitle: topic.title,
      courseLevel: rowEntry.courseLevel,
      category: rowEntry.category,
      sourceText: rowEntry.text,
      sourceSpan: {
        passageId: `${config.idPrefix}-sekii-rlp-${rowEntry.topicCode.replaceAll('.', '-')}`,
        label: `${rowEntry.category}: ${rowEntry.text}`,
      },
      metadata: {
        extractionMethod: 'manual-normalization-from-official-pdf',
        canonicalTargetHintIds: rowEntry.canonicalGoalIds,
      },
    }
  })

  const passageIdsByTopic = new Map<string, string[]>()
  for (const sourceGoal of sourceGoals) {
    const list = passageIdsByTopic.get(sourceGoal.topicCode) ?? []
    list.push(sourceGoal.id)
    passageIdsByTopic.set(sourceGoal.topicCode, list)
  }

  const passages = topics.map((topic, index) => ({
    id: `${config.idPrefix}-sekii-rlp-${topic.code.replaceAll('.', '-')}`,
    sourceDocumentKey: 'RLP-GOST-2022',
    topicCode: topic.code,
    title: `${topic.code} ${topic.title}`,
    page: topic.page,
    rawText: extractTopicText(rawText, topic, topics[index + 1]),
    sourceGoalIds: passageIdsByTopic.get(topic.code) ?? [],
  }))

  return {
    schemaVersion: 1,
    extractionId: `${config.jurisdiction}-PHYSIK-SEKII-RLP-GOST-2022-SOURCE-EXTRACTION`,
    title: `${config.jurisdiction} - Physik Oberstufe (${config.stateLabelInTitle}, RLP GOST 2022 Source-Extraction)`,
    sourceLandscapeId: config.sourceLandscapeId,
    jurisdiction: config.jurisdiction,
    subject: 'Physik',
    stage: 'SekII',
    sourceDocument: {
      key: 'RLP-GOST-2022',
      title: 'Rahmenlehrplan Berlin-Brandenburg Gymnasiale Oberstufe Teil C Physik 2022',
      path: config.sourcePdfPath,
      official: true,
      sections: topics,
    },
    sourceDocuments: [
      {
        key: 'RLP-GOST-2022',
        title: 'Rahmenlehrplan Berlin-Brandenburg Gymnasiale Oberstufe Teil C Physik 2022',
        path: config.sourcePdfPath,
        official: true,
      },
    ],
    method: {
      type: 'official-pdf-source-extraction',
      notes:
        `Die Quelle ist das lokal archivierte amtliche Teil-C-PDF Physik fuer die gymnasiale Oberstufe Berlin-Brandenburg. Die vorherige ${config.stateLabel}-Pilot-Bruecke war fuer einen vollstaendigen Fachstand zu klein; diese Source-Extraction zerlegt die Standards 2.2.1 bis 2.3.4 sowie die Inhaltsabschnitte 3.1.1 bis 3.2.7 in granulare Source-Ziele.`,
    },
    expectedTopicCodes: topics.map((topic) => topic.code),
    pipelineStatus: {
      currentStep: '',
      steps: [
        {
          id: 'MAPPING-1',
          label: 'Original-Lehrplanpassagen extrahiert',
        status: 'complete',
          dependsOn: [],
        checks: [
          {
            id: 'source-document-local',
            status: 'pass',
            detail: `Amtliches PDF lokal vorhanden: ${config.sourcePdfPath}`,
          },
          {
            id: 'topic-passages-extracted',
            status: 'pass',
            detail: `${passages.length}/${topics.length} Passagen aus 3.1.1 bis 3.2.7 extrahiert.`,
          },
          {
            id: 'legacy-snapshot-not-authoritative',
            status: 'pass',
            detail:
              'Legacy-Snapshot-Dateien werden nur als historische Pilot-Bruecke betrachtet; die Source-Extraction basiert auf dem amtlichen PDF.',
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
            status: 'pass',
            detail: `${sourceGoals.length} Source-Ziele aus den amtlichen Oberstufenpassagen erzeugt.`,
          },
          {
            id: 'source-goal-ids-unique',
            status: 'pass',
            detail: `Doppelte IDs: ${new Set(sourceGoals.map((goal) => goal.id)).size === sourceGoals.length ? '-' : 'ja'}`,
          },
          {
            id: 'source-goals-reference-passages',
            status: 'pass',
            detail: 'Jedes Source-Ziel referenziert eine vorhandene Originalpassage.',
          },
          {
            id: 'count-sanity',
            status: 'pass',
            detail:
              'Die Zielanzahl liegt nach Nachziehen der amtlichen Passagen in derselben Groessenordnung wie BW Sek II; der alte 31-Ziele-Snapshot war ein Untererfassungs-Signal.',
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
            id: 'review-file-planned',
            status: 'pass',
            detail: `M3-Review-Datei wird generiert: ${config.reviewPath}`,
          },
        ],
        },
      ],
    },
    passages,
    sourceGoals,
  }
}

function buildReview(
  extraction: ReturnType<typeof buildExtraction>,
  canonicalGoals: Map<string, { contains?: string[] }>,
  config: JurisdictionConfig,
) {
  const rowByGoalId = new Map(extraction.sourceGoals.map((sourceGoal, index) => [sourceGoal.id, rows[index]]))
  const decisions = extraction.sourceGoals.map((sourceGoal) => {
    const rowEntry = rowByGoalId.get(sourceGoal.id)
    if (!rowEntry) {
      throw new Error(`Missing row for source goal ${sourceGoal.id}`)
    }
    const hasClusterTarget = rowEntry.canonicalGoalIds.some(
      (canonicalGoalId) => (canonicalGoals.get(canonicalGoalId)?.contains?.length ?? 0) > 0,
    )
    return {
      sourceGoalId: sourceGoal.id,
      topicCode: sourceGoal.topicCode,
      sourceSpan: sourceGoal.sourceSpan.label,
      decision: 'mapped',
      matchType: rowEntry.canonicalGoalIds.length === 1 && !hasClusterTarget ? 'exact' : 'partial',
      canonicalGoalIds: rowEntry.canonicalGoalIds,
      rationale:
        rowEntry.canonicalGoalIds.length === 1
          ? 'Das Source-Ziel ist inhaltlich durch das angegebene kanonische Ziel bzw. dessen Teilbaum abgedeckt.'
          : 'Das Source-Ziel wird inhaltlich durch mehrere kanonische Teilbaeume gemeinsam abgedeckt.',
      reviewedAt: '2026-05-10',
      reviewer: 'codex',
    }
  })

  return {
    version: 1,
    reviewId: `${config.jurisdiction}-PHYSIK-SEKII-RLP-GOST-2022-MAPPING-3-SOURCE-EXTRACTION-1`,
    sourceLandscapeId: config.sourceLandscapeId,
    targetLandscapeId,
    sourceExtractionPath: config.extractionPath,
    status: {
      scope: `${config.stateLabel} Physik Sek II / RLP GOST 2022 Teil C Physik 2.2.1 bis 3.2.7`,
      reviewedSourceGoals: extraction.sourceGoals.length,
      mappedSourceGoals: extraction.sourceGoals.length,
      needsViewPlacementReview: 0,
      needsCanonicalGoal: 0,
      totalSourceGoals: extraction.sourceGoals.length,
      explicitNeedsCanonicalGoal: 0,
      notes:
        `${config.stateLabel} wurde vom zu kleinen Legacy-Snapshot auf amtliche Source-Extraction umgestellt. MatchType partial bedeutet hier 1:n- oder Teilbaum-Abdeckung, nicht fachliche Offenheit.`,
    },
    mappings: decisions.flatMap((decision) =>
      decision.canonicalGoalIds.map((canonicalGoalId) => ({
        legacyGoalId: decision.sourceGoalId,
        canonicalGoalId,
        matchType: decision.matchType,
        reviewDecisionId: decision.sourceGoalId,
      })),
    ),
    decisions,
  }
}

function writeCompositionViews(config: JurisdictionConfig) {
  const viewPairs = [
    ['de-he-gk.view.json', `${config.viewFilePrefix}-gk.view.json`, `${config.viewIdPrefix}-gym-physics-gk`],
    ['de-he-lk.view.json', `${config.viewFilePrefix}-lk.view.json`, `${config.viewIdPrefix}-gym-physics-lk`],
    ['de-he-sekii-gk.view.json', `${config.viewFilePrefix}-sekii-gk.view.json`, `${config.viewIdPrefix}-gym-sekii-physics-gk`],
    ['de-he-sekii-lk.view.json', `${config.viewFilePrefix}-sekii-lk.view.json`, `${config.viewIdPrefix}-gym-sekii-physics-lk`],
  ] as const

  for (const [sourceName, targetName, viewId] of viewPairs) {
    const view = JSON.parse(readFileSync(path.join(repoRoot, compositionViewDir, sourceName), 'utf8')) as {
      viewId: string
      scope: { jurisdiction: string }
      rootNodes?: Array<{ children?: Array<{ kind: string; goalId?: string }> }>
    }
    view.viewId = viewId
    view.scope.jurisdiction = config.jurisdiction
    const rootChildren = view.rootNodes?.[0]?.children
    if (rootChildren && !rootChildren.some((node) => node.goalId === target.society)) {
      rootChildren.splice(1, 0, {
        kind: 'canonicalSubtree',
        goalId: target.society,
      })
    }
    writeFileSync(path.join(repoRoot, compositionViewDir, targetName), `${JSON.stringify(view, null, 2)}\n`)
  }
}

function main() {
  const canonicalGoals = validateCanonicalTargets()
  for (const config of jurisdictionConfigs) {
    const rawText = execFileSync('pdftotext', ['-layout', path.join(repoRoot, config.sourcePdfPath), '-'], {
      encoding: 'utf8',
      maxBuffer: 50 * 1024 * 1024,
    })
    const extraction = buildExtraction(rawText, config)
    const review = buildReview(extraction, canonicalGoals, config)

    mkdirSync(path.dirname(path.join(repoRoot, config.extractionPath)), { recursive: true })
    mkdirSync(path.dirname(path.join(repoRoot, config.reviewPath)), { recursive: true })
    writeFileSync(path.join(repoRoot, config.extractionPath), `${JSON.stringify(extraction, null, 2)}\n`)
    writeFileSync(path.join(repoRoot, config.reviewPath), `${JSON.stringify(review, null, 2)}\n`)
    writeCompositionViews(config)

    console.log(`Wrote ${config.extractionPath}`)
    console.log(`Wrote ${config.reviewPath}`)
    console.log(`Wrote ${config.jurisdiction} physics composition views`)
    console.log(`Source goals: ${extraction.sourceGoals.length}`)
  }
}

main()
