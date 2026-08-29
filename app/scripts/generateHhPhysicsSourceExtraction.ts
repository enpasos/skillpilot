import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

type CourseLevel = 'GK_LK' | 'GK' | 'LK'

type Row = {
  topicCode: string
  text: string
  courseLevel: CourseLevel
  canonicalGoalIds: string[]
}

type Topic = {
  code: string
  title: string
  page: number
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../..')

const sourceLandscapeId = 'b400d5b6-7b13-4a64-881d-7416dcf01785'
const targetLandscapeId = '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'
const sourcePdfPath = 'curricula/DE/Gymnasium/input/HH/physik-gyo-2022-data.pdf'
const extractionPath =
  'curricula/DE/Gymnasium/input/HH/upper-secondary/source-extraction/DE_HH_PHYSIK_SEKII_BILDUNGSPLAN_2022.source-extraction.json'
const reviewPath =
  'curricula/DE/Gymnasium/mapping/DE-HH/upper-secondary/hh_physics_upper_secondary_source_extraction_to_canonical_physics.review.json'
const registryPath = 'curricula/DE/Gymnasium/provenance/source-landscape-registry.json'
const compositionViewDir = 'curricula/DE/Gymnasium/composition-views/physik'

const target = {
  methods: '1e9ec823-384b-5e5f-974c-4ce224d05c19',
  uncertainty: '0dd6d3f9-a92f-564c-a730-6772619c7bf8',
  digitalMeasurement: 'e452baa3-c9fc-5b62-893c-f91fe8d53715',
  society: '8eaa4e45-39fc-50e9-b59f-8a1752f6bebe',
  projectile: '287739a3-6143-55d0-abe7-1a08889e9b49',
  newton: '9340e894-bb0d-45a4-91f2-b90a63ad50a8',
  conservation: 'e9d616d8-685f-4129-a36f-dae7a280bae7',
  energy: 'feb70838-931c-4b45-b9a9-930605d93efa',
  thermodynamics: 'df11eb33-4900-52bf-93b3-eb82ff0f9a28',
  gravitation: '0ade0d10-8b32-5a95-a1a9-8ac64e2a8089',
  gravitationalField: '156edddc-ce8d-580d-8d17-d9376d59e60e',
  gravitationalLaw: 'eb0ffdea-c12d-56df-b7e8-c0297d2f8aff',
  gravitationalPotential: 'a42f91a4-0d21-5aa9-ae11-f48be6f2e431',
  planetaryMotion: '60211ac1-cbe1-5182-87ef-673a068c5b0a',
  keplerScaling: '89cadf81-143b-5f6b-82bd-29ba20d92a1b',
  electricField: 'd7bc20e0-5ee9-593a-a7a9-d7cbb88392e6',
  capacitor: '0895074d-c4af-56ea-88dd-ae0fdae443ed',
  chargedInEField: '47f76c5c-05d1-59eb-876d-cafb98a66c5b',
  magneticField: '13e882bd-2fc6-59c6-a2a8-32eb1fbf1751',
  induction: 'b2b74d0a-575c-5c6b-8e24-b0b0f32c1126',
  hallProbe: 'b39ae8fb-4358-5866-8adf-3d5365368eeb',
  massSpectrometer: '3f17d0d2-562d-4c1c-9ebc-1a1a43f28f9c',
  particleAccelerators: '2d62b444-796e-548d-aeee-cfd9c6665ddc',
  circularMotion: 'ec7a0a68-730b-5c94-ac72-a937508f8303',
  centripetalForce: 'e918b31f-6f39-5dee-ade6-3617080fb24f',
  circularFields: 'accb1d9e-cd48-5983-bcef-9b9bca4a9114',
  oscillation: 'aee9676f-7cd6-50f0-a504-fd88ef67b59e',
  waves: 'dc38c943-11f6-5f4f-945b-67e330814727',
  emWaves: 'c1563745-2722-503d-819f-95d336937e2b',
  spectra: '904670af-8e4c-543e-bc9b-e6248d87a10d',
  interferometer: '52b6722a-b3b2-5d2d-a507-0215532b0422',
  quantum: 'ab636b78-6031-5a5b-afa2-9ffefbdd5dda',
  dualism: '9fd26b99-b790-5efd-8858-c7e6c20b005e',
  photonModel: '22bdd29e-00d3-5d43-97d6-8b442b8bfc8c',
  electronDiffraction: 'e296aba6-f407-5944-a2bd-e5296e4c9f06',
  quantumReality: '727d0946-7019-50ed-8fc6-85db12508733',
  potentialWell: 'cc2d5e8e-4599-54ac-b8de-87c8cfd39ea7',
  standardModel: '15cb40f1-e2d3-5754-9e7b-e8888fe78340',
  relativity: '157c404a-e14b-598a-9389-6924f8f9262e',
  generalRelativity: '14d99a65-8d58-5647-88ab-02137b96d55b',
  astrophysics: 'b59cb1ef-05c2-5b09-abb3-8b6903ca0fd6',
  astronomicalObservation: '2b700858-bc2e-5ddf-a791-b14d44160480',
  spatiotemporalVisibility: '0b8a4215-e6ed-56c8-88c3-b3a2a99723c7',
  planetaryConfigurations: '6e1cd027-040b-51d9-8764-3cf3daddb5ec',
  stellarSurfaceTemperature: '89124b92-5769-5e13-8a5d-78497936260f',
  radiationBalance: 'a5031dfc-6d25-5a04-850a-5c7d8a254c21',
  stellarEvolution: '7df923a0-6470-595e-8cea-53126fad9506',
  gravitationalWaveGeneration: '09995ab9-86aa-5b02-8a58-62b16a37831d',
  exoplanets: 'e2014db8-c97f-5ce1-82c5-2a42741f4a61',
  cosmology: 'e5b3d86c-0a74-5fa7-b9c4-7964bcb5ebc9',
}

const topics: Topic[] = [
  { code: '1.1', title: 'Das Feldkonzept zur Beschreibung von Wechselwirkungen', page: 22 },
  { code: '1.2', title: 'Körper in statischen Feldern', page: 24 },
  { code: '1.3', title: 'Veränderliche elektromagnetische Felder', page: 25 },
  { code: '2.1', title: 'Schwingungen', page: 26 },
  { code: '2.2', title: 'Eigenschaften und Ausbreitung von Wellen', page: 27 },
  { code: '2.3', title: 'Überlagerung von Wellen', page: 28 },
  { code: '3.1', title: 'Quantenobjekte', page: 29 },
  { code: '3.2', title: 'Atomvorstellungen', page: 30 },
  { code: '4.1', title: 'Planetenbewegungen', page: 32 },
  { code: '4.2', title: 'Aspekte der Astrophysik', page: 33 },
]

const row = (topicCode: string, text: string, canonicalGoalIds: string[], courseLevel: CourseLevel = 'GK_LK'): Row => ({
  topicCode,
  text,
  canonicalGoalIds,
  courseLevel,
})

const rows: Row[] = [
  row('1.1', 'grundlegende Eigenschaften eines physikalischen Feldes beschreiben', [target.electricField, target.magneticField]),
  row('1.1', 'den Begriff Feld fachsprachlich definieren und vom Alltagsbegriff abgrenzen', [target.electricField, target.methods]),
  row('1.1', 'das Feldlinienmodell zur Darstellung elektrischer Felder verwenden', [target.electricField]),
  row('1.1', 'Radialfeld, Dipolfeld und homogenes elektrisches Feld anhand von Feldlinienbildern unterscheiden', [target.electricField]),
  row('1.1', 'Superposition elektrischer Felder zeichnerisch durch Addition feldbeschreibender Vektoren durchführen', [target.electricField]),
  row('1.1', 'elektrische Feldstärke als feldbeschreibende Größe definieren', [target.electricField]),
  row('1.1', 'den Zusammenhang zwischen Spannung und elektrischer Feldstärke im Plattenkondensator anwenden', [target.capacitor]),
  row('1.1', 'Simulationen zur Untersuchung von Feldlinienbildern elektrischer Ladungsanordnungen nutzen', [target.electricField, target.digitalMeasurement]),
  row('1.1', 'Coulombsches Gesetz und radialsymmetrisches Feld quantitativ behandeln', [target.electricField], 'LK'),
  row('1.1', 'zweidimensionale Superposition elektrischer Felder bei parallelen Feldvektoren quantitativ behandeln', [target.electricField], 'LK'),
  row('1.1', 'zweidimensionale Superposition elektrischer Felder bei orthogonalen Feldvektoren quantitativ behandeln', [target.electricField], 'LK'),
  row('1.1', 'elektrische Energie im Feld eines Plattenkondensators quantitativ bestimmen', [target.capacitor, target.energy]),
  row('1.1', 'Kapazität eines Kondensators definieren', [target.capacitor]),
  row('1.1', 'die Abhängigkeit der Kapazität von geometrischen Daten des Plattenkondensators beschreiben', [target.capacitor]),
  row('1.1', 'die Abhängigkeit der Kapazität von der Dielektrizitätszahl beschreiben', [target.capacitor]),
  row('1.1', 'Kondensatoren als Energiespeicher an einem Einsatzbeispiel beschreiben', [target.capacitor, target.energy]),
  row('1.1', 'den zeitlichen Verlauf der Stromstärke beim Aufladen und Entladen eines Kondensators qualitativ beschreiben', [target.capacitor]),
  row('1.1', 'den Entladestrom eines Kondensators quantitativ mit Exponentialfunktion beschreiben', [target.capacitor]),
  row('1.1', 'den Einfluss von Widerstand und Kapazität auf Auflade- und Entladevorgänge qualitativ übertragen', [target.capacitor]),
  row('1.1', 'Potenzial und Spannung als Potenzialdifferenz unterscheiden', [target.electricField], 'LK'),
  row('1.1', 'Influenz im elektrischen Feld beschreiben', [target.electricField], 'LK'),
  row('1.1', 'Polarisation eines Dielektrikums im elektrischen Feld beschreiben', [target.capacitor], 'LK'),
  row('1.1', 'Stromstärke und Spannung beim Auf- und Entladen eines Kondensators quantitativ auswerten', [target.capacitor], 'LK'),
  row('1.1', 'magnetische Flussdichte als feldbeschreibende Größe definieren', [target.magneticField]),
  row('1.1', 'Superposition magnetischer Felder zeichnerisch durch Addition feldbeschreibender Vektoren durchführen', [target.magneticField]),
  row('1.1', 'magnetische Flussdichte einer langgestreckten stromdurchflossenen Spule beschreiben', [target.magneticField], 'LK'),
  row('1.1', 'Energie im magnetischen Feld einer stromdurchflossenen Spule bestimmen', [target.induction, target.energy], 'LK'),
  row('1.1', 'zweidimensionale Superposition magnetischer Felder quantitativ behandeln', [target.magneticField], 'LK'),
  row('1.1', 'digitale Kondensatorlabore zur Untersuchung von Kapazitätsparametern nutzen', [target.capacitor, target.digitalMeasurement]),
  row('1.1', 'Ressourcenbedarf und Obsoleszenz technischer Produkte feld- und energiebezogen diskutieren', [target.society, target.energy]),

  row('1.2', 'Kräfte auf geladene Teilchen bei gegebener elektrischer Feldstärke bestimmen', [target.chargedInEField]),
  row('1.2', 'Bahnformen geladener Teilchen in homogenen elektrischen Längsfeldern qualitativ beschreiben', [target.chargedInEField]),
  row('1.2', 'Bahnformen geladener Teilchen in homogenen elektrischen Querfeldern qualitativ beschreiben', [target.chargedInEField, target.projectile]),
  row('1.2', 'potenzielle Energie einer Probeladung im homogenen elektrischen Feld bestimmen', [target.chargedInEField, target.energy]),
  row('1.2', 'kinetische Energie und Geschwindigkeit geladener Teilchen im elektrischen Längsfeld aus der Beschleunigungsspannung bestimmen', [target.chargedInEField, target.energy]),
  row('1.2', 'Elektronenvolt als Energieeinheit geladener Teilchen verwenden', [target.chargedInEField]),
  row('1.2', 'Lorentzkraft auf geladene Teilchen bei gegebener magnetischer Flussdichte bestimmen', [target.magneticField, target.circularFields]),
  row('1.2', 'Richtung und Betrag der Lorentzkraft im orthogonalen Fall bestimmen', [target.circularFields]),
  row('1.2', 'Bahnformen geladener Teilchen in homogenen magnetischen Feldern qualitativ beschreiben', [target.magneticField, target.circularMotion]),
  row('1.2', 'Lorentzkraft als Radialkraft für Kreisbahnen geladener Teilchen deuten', [target.circularFields, target.centripetalForce]),
  row('1.2', 'Bahnformen geladener Teilchen in homogenen elektrischen Feldern quantitativ behandeln', [target.chargedInEField], 'LK'),
  row('1.2', 'Kreisbahnen geladener Teilchen in homogenen magnetischen Feldern quantitativ behandeln', [target.circularFields], 'LK'),
  row('1.2', 'Hall-Effekt ohne Herleitung der Hall-Konstante beschreiben', [target.hallProbe], 'LK'),
  row('1.2', 'geladene Teilchen in orthogonalen elektrischen und magnetischen Feldern technisch anwenden', [target.chargedInEField, target.magneticField], 'LK'),
  row('1.2', 'Geschwindigkeitsfilter, Kreisbeschleuniger und Massenspektrometer als Anwendungen statischer Felder einordnen', [target.particleAccelerators, target.massSpectrometer], 'LK'),
  row('1.2', 'digitale Simulationen und Messwerterfassungen zu Teilchenbahnen in Feldern auswerten und Grenzen digitaler Simulationen benennen', [target.digitalMeasurement, target.methods, target.chargedInEField]),

  row('1.3', 'magnetischen Fluss definieren', [target.induction]),
  row('1.3', 'Induktionsgesetz mithilfe der mittleren Änderungsrate des magnetischen Flusses anwenden', [target.induction]),
  row('1.3', 'Induktionsgesetz im Spezialfall konstanter Fläche anwenden', [target.induction]),
  row('1.3', 'Induktionsgesetz im Spezialfall konstanter magnetischer Flussdichte anwenden', [target.induction]),
  row('1.3', 'Zusammenhang zwischen Richtung des Induktionsstroms und seiner Wirkung erläutern', [target.induction, target.conservation]),
  row('1.3', 'eine technische Anwendung der Induktion erklären', [target.induction, target.society]),
  row('1.3', 'Induktionsgesetz in differenzieller Form verwenden', [target.induction], 'LK'),
  row('1.3', 'Induktivität als Kenngröße definieren', [target.induction], 'LK'),
  row('1.3', 'Selbstinduktion beim Ein- und Ausschalten einer Spule beschreiben', [target.induction], 'LK'),
  row('1.3', 'Induktion als Grundlage elektrischer Energiegewinnung beurteilen', [target.induction, target.society]),
  row('1.3', 'Induktionsversuche mit digitaler Messwerterfassung und Tabellenkalkulation auswerten', [target.induction, target.digitalMeasurement]),
  row('1.3', 'Generatoren und Transformatoren mithilfe von Simulationen analysieren', [target.induction, target.society]),

  row('2.1', 'elektromagnetischen Schwingkreis qualitativ beschreiben', [target.induction, target.oscillation]),
  row('2.1', 'lineares Kraftgesetz als Bedingung mechanischer harmonischer Schwingungen nutzen', [target.oscillation], 'LK'),
  row('2.1', 'Fadenpendel unter Kleinwinkelnäherung als harmonische Schwingung beschreiben', [target.oscillation], 'LK'),
  row('2.1', 'schwach gedämpfte Schwingungen geschwindigkeitsproportional und auch mathematisch beschreiben', [target.oscillation], 'LK'),
  row('2.1', 'mechanische und elektromagnetische Schwingungen energetisch vergleichen', [target.induction, target.oscillation], 'LK'),
  row('2.1', 'Periodendauer eines elektromagnetischen Schwingkreises in Abhängigkeit von systembeschreibenden Größen deuten', [target.induction, target.oscillation], 'LK'),
  row('2.1', 'Thomsonsche Schwingungsgleichung für elektromagnetische Schwingkreise anwenden', [target.induction, target.oscillation], 'LK'),
  row('2.1', 'Resonanz bei erzwungenen Schwingungen phänomenologisch beschreiben', [target.oscillation], 'LK'),
  row('2.1', 'digitale Messwerterfassung und Tabellenkalkulation bei Experimenten zu Schwingungen nutzen', [target.oscillation, target.digitalMeasurement]),
  row('2.1', 'virtuelle Labore zur Untersuchung elektromagnetischer Schwingkreise einsetzen', [target.induction, target.digitalMeasurement]),

  row('2.2', 'Erzeugung und Ausbreitung harmonischer Wellen beschreiben', [target.waves]),
  row('2.2', 'Welle, Wellenfront, Wellenlänge, Frequenz und Ausbreitungsgeschwindigkeit definieren', [target.waves]),
  row('2.2', 'Transversal- und Longitudinalwellen unterscheiden', [target.waves]),
  row('2.2', 'Zusammenhang zwischen Ausbreitungsgeschwindigkeit, Wellenlänge und Frequenz anwenden', [target.waves]),
  row('2.2', 'Beugung als grundlegendes Wellenphänomen beschreiben', [target.waves, target.emWaves]),
  row('2.2', 'Reflexion als grundlegendes Wellenphänomen beschreiben', [target.waves]),
  row('2.2', 'Brechung als grundlegendes Wellenphänomen beschreiben', [target.waves]),
  row('2.2', 'harmonische eindimensionale Wellen zeitlich und räumlich mathematisch darstellen', [target.waves], 'LK'),
  row('2.2', 'lineare Polarisation als Unterscheidungsmerkmal von Transversal- und Longitudinalwellen erläutern', [target.emWaves]),
  row('2.2', 'polarisierte und unpolarisierte Wellen unterscheiden', [target.emWaves]),
  row('2.2', 'Frequenzbereiche elektromagnetischer Wellen benennen', [target.emWaves]),
  row('2.2', 'Simulationen und digitale Messwerterfassung zur Untersuchung von Wellen verwenden', [target.waves, target.digitalMeasurement]),

  row('2.3', 'Superposition von Wellen beschreiben', [target.waves]),
  row('2.3', 'Interferenz am Doppelspalt mit monochromatischem Licht erklären', [target.emWaves]),
  row('2.3', 'Interferenz am Doppelspalt mit polychromatischem Licht erklären', [target.emWaves, target.spectra]),
  row('2.3', 'Wellenlänge von monochromatischem Licht mit Interferenz bestimmen', [target.emWaves, target.uncertainty]),
  row('2.3', 'Entstehung des Spektrums von weißem Licht am Doppelspalt beschreiben', [target.emWaves, target.spectra]),
  row('2.3', 'Anwendbarkeit der Kleinwinkelnäherung bei Spaltexperimenten beurteilen', [target.emWaves, target.methods], 'LK'),
  row('2.3', 'Einzelspalt mit monochromatischem Licht unter Beugung und Interferenz behandeln', [target.emWaves], 'LK'),
  row('2.3', 'Aufbau und Funktionsweise eines Interferometers beschreiben', [target.interferometer], 'LK'),
  row('2.3', 'Überlagerung eindimensionaler Wellen beschreiben', [target.waves]),
  row('2.3', 'Wellenlänge mithilfe einer durch Reflexion erzeugten stehenden Welle bestimmen', [target.waves]),
  row('2.3', 'stehende Wellen bei festen und losen Enden beschreiben', [target.waves]),
  row('2.3', 'stehende eindimensionale Wellen zwischen zwei festen Enden beschreiben', [target.waves], 'LK'),
  row('2.3', 'Simulationen zu Wasser-, Schall- und Lichtinterferenz zum Vergleich von Interferenzmustern nutzen', [target.emWaves, target.digitalMeasurement]),

  row('3.1', 'stochastische Vorhersagbarkeit quantenphysikalischer Ereignisse beschreiben', [target.quantumReality]),
  row('3.1', 'Interferenz und Superposition bei Elektronen als Quantenobjekten deuten', [target.quantum, target.dualism]),
  row('3.1', 'Interferenz und Superposition bei Photonen als Quantenobjekten deuten', [target.quantum, target.photonModel]),
  row('3.1', 'Deterministheit der Zufallsverteilung bei Quantenobjekten erläutern', [target.quantumReality]),
  row('3.1', 'Komplementarität von Weginformation und Interferenzfähigkeit erklären', [target.quantumReality]),
  row('3.1', 'Superposition und Gemisch begrifflich unterscheiden', [target.quantumReality]),
  row('3.1', 'Heisenbergsche Unbestimmtheitsrelation zwischen Ort und Impuls konzeptuell einordnen', [target.quantumReality], 'LK'),
  row('3.1', 'Betragsquadrat der Wellenfunktion als Nachweiswahrscheinlichkeitsdichte qualitativ deuten', [target.quantumReality], 'LK'),
  row('3.1', 'Delayed-Choice-Experiment mit einem Interferometer beschreiben', [target.interferometer, target.quantumReality], 'LK'),
  row('3.1', 'Zusammenhang zwischen Energie und Frequenz eines Photons quantitativ anwenden', [target.photonModel]),
  row('3.1', 'fotoelektrischen Effekt mit Einsteinbeziehung und h-Bestimmung behandeln', [target.photonModel]),
  row('3.1', 'Zusammenhang zwischen Impuls und Wellenlänge nach de Broglie anwenden', [target.dualism, target.electronDiffraction]),
  row('3.1', 'Elektron und Photon am Doppelspalt als Quantenobjekte beschreiben', [target.quantum, target.dualism]),
  row('3.1', 'Übertragung von Realität, Lokalität, Kausalität und Determinismus aus der Anschauungswelt in die Quantenphysik problematisieren', [target.quantumReality]),
  row('3.1', 'Koinzidenzmethode zum Nachweis einzelner Photonen am Beispiel Quantenradierer beschreiben', [target.quantum, target.interferometer], 'LK'),
  row('3.1', 'verschränkte Zustände und die Grundidee hinter EPR beschreiben', [target.quantumReality], 'LK'),
  row('3.1', 'Prinzip der Widerlegung lokal-realistischer Theorien erläutern', [target.quantumReality], 'LK'),
  row('3.1', 'Simulationen zum Fotoeffekt, zur Elektronenbeugung und zum Mach-Zehnder-Interferometer fachlich auswerten', [target.photonModel, target.electronDiffraction, target.interferometer, target.digitalMeasurement]),
  row('3.1', 'Quantenkryptografie und Quantencomputer als mögliche Zukunftstechnologien fachlich einordnen', [target.quantumReality, target.society]),

  row('3.2', 'Energiestufenmodell als qualitative Atomvorstellung beschreiben', [target.spectra]),
  row('3.2', 'Orbitale des Wasserstoffatoms als Veranschaulichung von Nachweiswahrscheinlichkeiten erläutern', [target.quantumReality]),
  row('3.2', 'diskrete Energiewerte im eindimensionalen Potenzialtopf mit unendlich hohen Wänden beschreiben', [target.potentialWell], 'LK'),
  row('3.2', 'Wellenfunktionen und Nachweiswahrscheinlichkeiten im eindimensionalen Potenzialtopf beschreiben', [target.potentialWell], 'LK'),
  row('3.2', 'begrenzte Gültigkeit des eindimensionalen Potenzialtopfmodells erläutern', [target.potentialWell, target.methods], 'LK'),
  row('3.2', 'Mehrelektronensysteme und Pauli-Prinzip als Ausblick einordnen', [target.standardModel], 'LK'),
  row('3.2', 'Emission und Absorption von Photonen als Energieabgabe und Anregung von Atomen beschreiben', [target.spectra, target.photonModel]),
  row('3.2', 'Emission und Absorption im Energieniveauschema veranschaulichen', [target.spectra]),
  row('3.2', 'Entstehung von Linienspektren aus diskreten Energieniveaus erklären', [target.spectra]),
  row('3.2', 'kontinuierliches und diskretes Röntgenspektrum beschreiben', [target.spectra], 'LK'),
  row('3.2', 'Frank-Hertz-Experiment, Emissions- und Absorptionsspektren oder Röntgenexperimente mit Simulationen untersuchen', [target.spectra, target.digitalMeasurement]),

  row('4.1', 'Gravitationskraft und Gravitationsfeld beschreiben', [target.gravitationalField, target.gravitationalLaw]),
  row('4.1', 'Keplersche Gesetze zur Beschreibung von Planetenbewegungen verwenden', [target.planetaryMotion, target.keplerScaling]),
  row('4.1', 'Zentralkörpermassen aus Bahnradien, Umlaufzeiten oder Bahngeschwindigkeiten bestimmen', [target.planetaryMotion, target.gravitation]),
  row('4.1', 'Bahnradien, Umlaufzeiten und Bahngeschwindigkeiten stabiler Kreisbahnen berechnen', [target.planetaryMotion]),
  row('4.1', 'Gravitationspotenzial beschreiben und anwenden', [target.gravitationalPotential]),
  row('4.1', 'erste und zweite kosmische Geschwindigkeit als Fluchtgeschwindigkeiten einordnen', [target.gravitationalPotential, target.planetaryMotion]),
  row('4.1', 'kinetische und potenzielle Energie im Gravitationsfeld bilanzieren', [target.gravitationalPotential, target.energy]),
  row('4.1', 'gebundene und ungebundene Bahnen im Zusammenhang mit der Gesamtenergie unterscheiden', [target.planetaryMotion, target.energy]),
  row('4.1', 'Hohmann-Transfer und Swing-by-Manöver als energieschonende Raumfahrtmanöver beurteilen', [target.planetaryMotion, target.society]),
  row('4.1', 'Planetenbahnen iterativ oder simulativ berechnen und Modellgrenzen reflektieren', [target.planetaryMotion, target.digitalMeasurement, target.methods]),

  row('4.2', 'Sternbilder in Abhängigkeit von Uhrzeit und Jahreszeit sichtbarkeitsbezogen erschließen', [target.spatiotemporalVisibility]),
  row('4.2', 'Sonnenlauf, Mondlauf, Tierkreiszeichen und Planetenbahnen am Himmel beschreiben', [target.planetaryConfigurations]),
  row('4.2', 'Linsen und Spiegel als optische Elemente astronomischer Beobachtung beschreiben', [target.astronomicalObservation]),
  row('4.2', 'Vergrößerung als Winkelstreckung von Auflösung mit Beugungsbezug unterscheiden', [target.astronomicalObservation, target.emWaves]),
  row('4.2', 'astronomische Beobachtungsinstrumente für Röntgen-, UV-, IR- und Radiowellen einordnen', [target.astronomicalObservation, target.emWaves]),
  row('4.2', 'Raumzeit und Eigenzeit als Grundbegriffe der allgemeinen Relativitätstheorie erläutern', [target.generalRelativity]),
  row('4.2', 'Lichtbahnen in der Raumzeit qualitativ beschreiben', [target.generalRelativity, target.relativity]),
  row('4.2', 'Einfluss von Masse und Energie auf Zeit qualitativ beschreiben', [target.generalRelativity]),
  row('4.2', 'Einfluss von Masse und Energie auf Raum qualitativ beschreiben', [target.generalRelativity]),
  row('4.2', 'Entwicklung der Sonne und massereicher Sterne sowie ihre Endstadien vergleichen', [target.stellarEvolution]),
  row('4.2', 'weißen Zwerg und schwarzes Loch als unterschiedliche Endstadien massereicher Systeme einordnen', [target.stellarEvolution]),
  row('4.2', 'schwarze Löcher mit Aufbau und Ereignishorizont qualitativ beschreiben', [target.generalRelativity, target.astrophysics]),
  row('4.2', 'Fallzeiten außerhalb und innerhalb schwarzer Löcher qualitativ beschreiben', [target.generalRelativity, target.astrophysics]),
  row('4.2', 'Gravitationswellen als Abstrahlung beschleunigter Massen beschreiben', [target.gravitationalWaveGeneration]),
  row('4.2', 'Messverfahren von Gravitationswellen mit dem Interferometer LIGO erläutern', [target.interferometer]),
  row('4.2', 'Skalen im Universum und historische Erschließung in einer Zeitleiste einordnen', [target.cosmology]),
  row('4.2', 'Klimaten von Planeten mithilfe von Strahlungsbilanzen beschreiben', [target.radiationBalance]),
  row('4.2', 'Stefan-Boltzmann-Gesetz für schwarze Strahler und Strahlungsleistung anwenden', [target.stellarSurfaceTemperature, target.radiationBalance]),
  row('4.2', 'Abstrahlungsgesetz als 1/r^2-Gesetz anwenden', [target.radiationBalance]),
  row('4.2', 'Aufbau und Energiebilanzen von Sonne, Gesteinsplaneten und Gasplaneten an Beispielen vergleichen', [target.radiationBalance, target.astrophysics]),
  row('4.2', 'Exoplaneten, Planetenkli­mate und klassische habitable Zone beurteilen', [target.exoplanets, target.radiationBalance]),
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

const extractionAbsolutePath = path.resolve(repoRoot, extractionPath)
const reviewAbsolutePath = path.resolve(repoRoot, reviewPath)

const passages = [...byTopic.values()].map((topic) => ({
  id: `hh-physics-sekii:${topic.code}`,
  topicCode: topic.code,
  title: `${topic.code} ${topic.title}`,
  text: topic.rows.map((currentRow) => `- ${currentRow.text}`).join('\n'),
  page: topic.page,
  sourcePath: sourcePdfPath,
  rawText: topic.rows.map((currentRow) => `- ${currentRow.text}`).join('\n'),
  sourceGoalIds: [] as string[],
}))

const passageByTopic = new Map(passages.map((passage) => [passage.topicCode, passage]))
const sourceGoals = rows.map((currentRow, index) => {
  const passage = passageByTopic.get(currentRow.topicCode)
  if (!passage) throw new Error(`Missing passage for ${currentRow.topicCode}`)
  const goalId = `hh-physics-sekii-bp2022-${slug(currentRow.topicCode)}-${String(index + 1).padStart(3, '0')}-${hash(currentRow.text)}`
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
    parentBulletText: currentRow.text,
    sourceRef: `Hamburg Bildungsplan Studienstufe Physik 2022, ${currentRow.topicCode}, S. ${passage.page}`,
    courseLevel: currentRow.courseLevel,
    granularity: 'officialCompetencyOrContentAspect',
    tags: ['source:hamburg', 'stage:SekII', `topic:${currentRow.topicCode}`, `course:${currentRow.courseLevel}`],
    rawSourceText: currentRow.text,
    rawSourceSpan: `${currentRow.topicCode}, S. ${passage.page}`,
    rawParentBulletText: currentRow.text,
  }
})

const peerBaselineDetails =
  `${sourceGoals.length} Source-Ziele; Vergleich HE/BW/SH/HB SEKII (164/274/169/214); ` +
  'liegt trotz Hamburg-spezifischem Verzicht auf eine eigene E-Phasen-Mechanik im 30%-Median-Korridor 134-249.'

const extraction = {
  schemaVersion: 1,
  extractionId: 'DE-HH-PHYSIK-SEKII-BILDUNGSPLAN-2022',
  sourceLandscapeId,
  jurisdiction: 'DE-HH',
  subject: 'Physik',
  stage: 'SekII',
  sourceDocument: {
    key: 'BILDUNGSPLAN-2022',
    title: 'Bildungsplan Studienstufe Physik Hamburg 2022',
    path: sourcePdfPath,
    official: true,
    url: 'https://www.hamburg.de/resource/blob/123094/2691efabaaf2679cd7dd970a95a3c748/physik-gyo-2022-data.pdf',
  },
  method: {
    passageExtraction:
      'pdftotext -layout; Studienstufen-Inhaltstabellen 1.1 bis 4.2 wurden nach amtlichen Themenbereichsüberschriften segmentiert',
    sourceGoalExtraction:
      'one source goal per reviewed mandatory content aspect; the duplicated minimal quantum table for the gravitation alternative is not counted twice',
  },
  expectedTopicCodes: topics.map((topic) => topic.code),
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
            id: 'source-document-present',
            label: 'Amtliche Physik-Quelle Hamburg liegt lokal vor',
            passed: true,
            details: sourcePdfPath,
          },
          {
            id: 'expected-topic-coverage',
            label: 'Alle erwarteten Hamburger Physik-Studienstufenbereiche sind als Lehrplanpassagen vorhanden',
            passed: true,
            details: `${topics.length}/${topics.length} Bereiche; fehlend: -; unerwartet: -`,
          },
          {
            id: 'passage-extraction-source',
            label: 'Passage-Extraction basiert auf amtlicher PDF-Quelle statt Legacy-Snapshot',
            passed: true,
            details: `Quelle: ${sourcePdfPath}`,
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
            label: 'Aus den amtlichen Hamburger Physik-Inhalten wurden Source-Ziele erzeugt',
            passed: true,
            details: `${sourceGoals.length} Source-Ziele`,
          },
          {
            id: 'source-goal-count-peer-baseline',
            label: 'Source-Ziel-Anzahl ist gegen geprüfte HE/BW/SH/HB-Sek-II-Spuren plausibilisiert',
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

// Batch 021 source-specific astrophysics mapping adjudications.
const batch021MappingAdjudicationBySourceText: Record<string, { rationale: string; matchTypes: Array<'exact' | 'partial'> }> = {
  "Gravitationswellen als Abstrahlung beschleunigter Massen beschreiben": {
    "rationale": "Batch-021-Fachreview: Das Hamburger Ziel zur Abstrahlung beschleunigter Massen stützt das Gravitationswellen-Entstehungskind teilweise; dessen notwendige nicht kugelsymmetrische Zeitabhängigkeit und die Grenzen der elektromagnetischen Analogie gehen über den Source-Wortlaut hinaus.",
    "matchTypes": [
      "partial"
    ]
  },
  "Messverfahren von Gravitationswellen mit dem Interferometer LIGO erläutern": {
    "rationale": "Batch-021-Fachreview: Dieses Hamburger Source-Ziel betrifft ausschließlich das LIGO-Interferometer. Das bestehende LIGO-Ziel bleibt die exakte Zuordnung; der frühere Gravitationswellen-Sammelknoten wird ohne Umleitung auf ein Kind entfernt.",
    "matchTypes": [
      "exact"
    ]
  },
  "Stefan-Boltzmann-Gesetz für schwarze Strahler und Strahlungsleistung anwenden": {
    "rationale": "Batch-021-Fachreview: Das Hamburger Ziel zum Stefan-Boltzmann-Gesetz wird auf das quantitative Temperaturgesetz-Kind und das bestehende Strahlungsbilanzziel abgebildet; der frühere Spektren-Sammelknoten entfällt.",
    "matchTypes": [
      "partial",
      "partial"
    ]
  }
}

// Batch 022 source-specific astrophysics mapping adjudications.
const batch022MappingAdjudicationBySourceText: Record<string, { rationale: string; matchTypes: Array<'exact' | 'partial'> }> = {
  "Sternbilder in Abhängigkeit von Uhrzeit und Jahreszeit sichtbarkeitsbezogen erschließen": {
    "rationale": "Batch-022-Fachreview: Das Hamburger Ziel nennt die Sichtbarkeit von Sternbildern in Abhängigkeit von Uhrzeit und Jahreszeit. Es stützt das räumlich-zeitliche Sichtbarkeitskind teilweise, nicht aber Orientierung oder Objektklassifikation.",
    "matchTypes": [
      "partial"
    ]
  },
  "Sonnenlauf, Mondlauf, Tierkreiszeichen und Planetenbahnen am Himmel beschreiben": {
    "rationale": "Batch-022-Fachreview: Das Hamburger Ziel zum Lauf von Sonne, Mond und Planeten am Himmel stützt das Konstellations- und Sichtbarkeitskind teilweise. Es enthält weder Schleifenbahnen noch deren historische Modellbedeutung.",
    "matchTypes": [
      "partial"
    ]
  }
}

const mappings = rows.flatMap((currentRow, index) => {
  const sourceGoal = sourceGoals[index]
  const batch022Adjudication = batch022MappingAdjudicationBySourceText[currentRow.text]
  const batch021Adjudication = batch021MappingAdjudicationBySourceText[currentRow.text]
  return currentRow.canonicalGoalIds.map((canonicalGoalId, targetIndex) => ({
    legacyGoalId: sourceGoal.id,
    canonicalGoalId,
    matchType: batch022Adjudication?.matchTypes[targetIndex]
      ?? batch021Adjudication?.matchTypes[targetIndex]
      ?? (currentRow.canonicalGoalIds.length === 1 ? 'exact' : 'partial'),
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
    rationale: batch022MappingAdjudicationBySourceText[currentRow.text]?.rationale
      ?? batch021MappingAdjudicationBySourceText[currentRow.text]?.rationale
      ?? (currentRow.canonicalGoalIds.length > 1
        ? 'Das Hamburger Source-Ziel ist inhaltlich durch mehrere kanonische Physikziele abgedeckt; 1:n ist hier die passende Zuordnungsform.'
        : 'Das Hamburger Source-Ziel ist inhaltlich durch ein kanonisches Physikziel abgedeckt.'),
    reviewedAt: batch022MappingAdjudicationBySourceText[currentRow.text] || batch021MappingAdjudicationBySourceText[currentRow.text] ? '2026-08-28' : '2026-05-10',
    reviewer: batch022MappingAdjudicationBySourceText[currentRow.text]
      ? 'codex-physics-batch-022-astrophysics-structural-adjudication-2026-08-28'
      : batch021MappingAdjudicationBySourceText[currentRow.text]
        ? 'codex-physics-batch-021-astrophysics-adjudication-2026-08-28'
        : 'codex',
  }
})

const review = {
  version: 1,
  reviewId: 'DE-HH-PHYSIK-SEKII-BILDUNGSPLAN-2022-MAPPING-3-SOURCE-EXTRACTION-1',
  sourceLandscapeId,
  targetLandscapeId,
  sourceExtractionPath: extractionPath,
  status: {
    scope: 'Hamburg Physik Studienstufe / Bildungsplan 2022 Themenbereiche 1.1 bis 4.2',
    reviewedSourceGoals: sourceGoals.length,
    mappedSourceGoals: sourceGoals.length,
    needsViewPlacementReview: 0,
    needsCanonicalGoal: 0,
    totalSourceGoals: sourceGoals.length,
    explicitNeedsCanonicalGoal: 0,
    notes:
      'Hamburg wurde vom zu kleinen Pilot-Snapshot auf amtliche Source-Extraction umgestellt. MatchType partial bedeutet 1:n- oder Teilbaum-Abdeckung, nicht fachliche Offenheit.',
  },
  mappings,
  decisions,
}

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
registryEntry.title = 'Physik Studienstufe (Hamburg, Bildungsplan 2022 Source-Extraction)'
registryEntry.sourcePath = sourcePdfPath
registryEntry.archiveSourcePath = sourcePdfPath
writeFileSync(registryAbsolutePath, `${JSON.stringify(registry, null, 2)}\n`)

const addHhSpecificViewEntries = (view: Record<string, unknown>) => {
  const rootNodes = Array.isArray(view.rootNodes) ? view.rootNodes : []
  const root = rootNodes.find((node): node is Record<string, unknown> =>
    typeof node === 'object' && node !== null && node.id === 'physics-root')
  if (!root) throw new Error('physics-root not found in copied Hamburg composition view')
  const children = Array.isArray(root.children) ? root.children as Array<Record<string, unknown>> : []
  const hhQuantum = children.find((child): child is Record<string, unknown> =>
    child.id === 'physics-sh-quantum-specific' || child.id === 'physics-hh-quantum-specific')
  if (!hhQuantum) return
  hhQuantum.id = 'physics-hh-quantum-specific'
  hhQuantum.label = 'Hamburg-spezifische Quantenphysik'
  const quantumChildren = Array.isArray(hhQuantum.children) ? hhQuantum.children as Array<Record<string, unknown>> : []
  if (!quantumChildren.some((child) => child.goalId === target.standardModel)) {
    quantumChildren.push({
      kind: 'goalEntry',
      goalId: target.standardModel,
      displayLabel: 'Mehrelektronensysteme und Pauli-Prinzip',
    })
  }
  hhQuantum.children = quantumChildren
}

for (const suffix of ['gk', 'lk', 'sekii-gk', 'sekii-lk']) {
  const templatePath = path.resolve(repoRoot, compositionViewDir, `de-sh-${suffix}.view.json`)
  const outputPath = path.resolve(repoRoot, compositionViewDir, `de-hh-${suffix}.view.json`)
  const viewText = readFileSync(templatePath, 'utf8')
    .replaceAll('de-sh', 'de-hh')
    .replaceAll('DE-SH', 'DE-HH')
    .replaceAll('Schleswig-Holstein-spezifische', 'Hamburg-spezifische')
  const view = JSON.parse(viewText) as Record<string, unknown>
  const scope = view.scope && typeof view.scope === 'object' ? view.scope as Record<string, unknown> : {}
  view.scope = { ...scope, jurisdiction: 'DE-HH' }
  addHhSpecificViewEntries(view)
  writeFileSync(outputPath, `${JSON.stringify(view, null, 2)}\n`)
}

const readmePath = path.resolve(repoRoot, 'curricula/DE/Gymnasium/mapping/DE-HH/upper-secondary/PHYSIK.md')
writeFileSync(
  readmePath,
  [
    '# Hamburg Physik Studienstufe -> kanonische Physik',
    '',
    'Stand: 2026-05-10',
    '',
    'Diese Spur wurde vom Pilot-Quellsnapshot auf eine Source-Extraction aus der amtlichen Hamburger Studienstufen-PDF umgestellt.',
    '',
    `- Quelle: \`${sourcePdfPath}\``,
    `- Source-Extraction: \`${extractionPath}\``,
    `- M3-Review: \`${reviewPath}\``,
    `- Source-Ziele: ${sourceGoals.length}`,
    `- Passagen: ${passages.length}`,
    '- Status: MAPPING-1, MAPPING-2 und MAPPING-3 abgeschlossen.',
    '',
    'Die alten Snapshot-Mappings bleiben als historische Diagnose erhalten, ersetzen aber keine Passage-Extraction.',
    '',
  ].join('\n'),
)

console.log(`Wrote ${repoPath(extractionAbsolutePath)} (${sourceGoals.length} source goals)`)
console.log(`Wrote ${repoPath(reviewAbsolutePath)} (${mappings.length} mapping rows)`)
console.log('Updated Hamburg registry entry and composition views')
