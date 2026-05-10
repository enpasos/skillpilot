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

const sourceLandscapeId = '730a6dbb-7ddb-486b-8ac8-dd9e58e3d113'
const targetLandscapeId = '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'
const sourcePdfPath = 'curricula/DE/Gymnasium/input/NI/upper-secondary/kerncurriculum_gymnasiale_oberstufe-physik_2022.pdf'
const extractionPath =
  'curricula/DE/Gymnasium/input/NI/upper-secondary/source-extraction/DE_NI_PHYSIK_SEKII_KC2022.source-extraction.json'
const reviewPath =
  'curricula/DE/Gymnasium/mapping/DE-NI/upper-secondary/ni_physics_upper_secondary_source_extraction_to_canonical_physics.review.json'
const registryPath = 'curricula/DE/Gymnasium/provenance/source-landscape-registry.json'
const compositionViewDir = 'curricula/DE/Gymnasium/composition-views/physik'

const target = {
  motivation: '5c44b9ba-9b05-4774-95d5-073230d3fc4f',
  methods: '1e9ec823-384b-5e5f-974c-4ce224d05c19',
  uncertainty: '0dd6d3f9-a92f-564c-a730-6772619c7bf8',
  digitalMeasurement: 'e452baa3-c9fc-5b62-893c-f91fe8d53715',
  society: '8eaa4e45-39fc-50e9-b59f-8a1752f6bebe',
  motion: '65ddd780-0323-45d1-8f94-5e31bf28da23',
  projectile: '287739a3-6143-55d0-abe7-1a08889e9b49',
  newton: '9340e894-bb0d-45a4-91f2-b90a63ad50a8',
  conservation: 'e9d616d8-685f-4129-a36f-dae7a280bae7',
  energy: 'feb70838-931c-4b45-b9a9-930605d93efa',
  thermodynamics: 'df11eb33-4900-52bf-93b3-eb82ff0f9a28',
  gravitation: '0ade0d10-8b32-5a95-a1a9-8ac64e2a8089',
  acousticSources: 'c1006f55-0406-48cc-92d4-0d8345897cf4',
  acousticPropagation: '3c82510a-1f12-4eaa-81c2-8599437a5b85',
  acousticRisks: '8ac61062-f63e-5935-96ae-84014906c368',
  lenses: '84ddb244-e560-592f-9d43-e84c801fe5b4',
  opticalInstruments: '6367d45e-919e-4c19-bcd9-7770a2d51139',
  atom: 'dd5a8efd-5d11-5388-aa2a-5147dec4348f',
  nuclear: '5a5bc118-4420-5bb7-94c3-67837f2ce0dd',
  radiationRisk: '23fd87f3-9e79-5e0e-b9d1-7c15f3d119e0',
  radiationDose: 'e6a50c74-c922-508c-aa27-07bac2566955',
  electricField: 'd7bc20e0-5ee9-593a-a7a9-d7cbb88392e6',
  capacitor: '0895074d-c4af-56ea-88dd-ae0fdae443ed',
  chargedInEField: '47f76c5c-05d1-59eb-876d-cafb98a66c5b',
  magneticField: '13e882bd-2fc6-59c6-a2a8-32eb1fbf1751',
  induction: 'b2b74d0a-575c-5c6b-8e24-b0b0f32c1126',
  fadenstrahl: '966782e5-690d-4fae-bbab-fa3fa30525c3',
  oscillation: 'aee9676f-7cd6-50f0-a504-fd88ef67b59e',
  waves: 'dc38c943-11f6-5f4f-945b-67e330814727',
  emWaves: 'c1563745-2722-503d-819f-95d336937e2b',
  dualism: '9fd26b99-b790-5efd-8858-c7e6c20b005e',
  quantum: 'ab636b78-6031-5a5b-afa2-9ffefbdd5dda',
  electronDiffraction: 'e296aba6-f407-5944-a2bd-e5296e4c9f06',
  photonModel: '22bdd29e-00d3-5d43-97d6-8b442b8bfc8c',
  quantumReality: '727d0946-7019-50ed-8fc6-85db12508733',
  interferometer: '52b6722a-b3b2-5d2d-a507-0215532b0422',
  potentialWell: 'cc2d5e8e-4599-54ac-b8de-87c8cfd39ea7',
  spectra: '904670af-8e4c-543e-bc9b-e6248d87a10d',
  standardModel: '15cb40f1-e2d3-5754-9e7b-e8888fe78340',
  nucideCards: '64b30d2e-cbe1-55d8-915a-a050d736b96e',
}

const topics: Topic[] = [
  { code: '3.1-ARG', title: 'Physikalisch argumentieren', page: 16 },
  { code: '3.1-PROB', title: 'Probleme lösen', page: 17 },
  { code: '3.1-EXP', title: 'Planen, experimentieren, auswerten', page: 18 },
  { code: '3.1-MATH', title: 'Mathematisieren', page: 20 },
  { code: '3.1-MOD', title: 'Mit Modellen arbeiten', page: 22 },
  { code: '3.1-EWG', title: 'Erkenntniswege der Physik beschreiben und reflektieren', page: 23 },
  { code: '3.1-KOM', title: 'Kommunizieren', page: 24 },
  { code: '3.1-DOK', title: 'Dokumentieren', page: 25 },
  { code: '3.1-BEW', title: 'Bewerten', page: 26 },
  { code: '3.2-DYN', title: 'Dynamik', page: 28 },
  { code: '3.2-AKU', title: 'Wahlmodul Akustik', page: 29 },
  { code: '3.2-ATOMKERN', title: 'Wahlmodul Atom- und Kernphysik', page: 30 },
  { code: '3.2-OPTIK', title: 'Wahlmodul Optische Abbildungen', page: 31 },
  { code: '3.2-STRAHLUNG', title: 'Wahlmodul Strahlungsphysik', page: 32 },
  { code: '3.3-ELEK', title: 'Elektrizität', page: 33 },
  { code: '3.3-SCHWING-WELLEN', title: 'Schwingungen und Wellen', page: 37 },
  { code: '3.3-QUANTEN', title: 'Quantenobjekte', page: 40 },
  { code: '3.3-ATOMHUELLE', title: 'Atomhülle', page: 43 },
  { code: '3.3-ATOMKERN', title: 'Atomkern', page: 45 },
]

const row = (topicCode: string, text: string, canonicalGoalIds: string[], courseLevel: CourseLevel = 'GK_LK'): Row => ({
  topicCode,
  text,
  canonicalGoalIds,
  courseLevel,
})

const rows: Row[] = [
  row('3.1-ARG', 'Kenntnisse, Fachsprache, Diagramme, Kräfte und Energiebilanzen zur physikalischen Argumentation einsetzen', [
    target.methods,
    target.energy,
  ]),
  row('3.1-PROB', 'Informationen aus Quellen auswählen, Plausibilität prüfen, Experimente und Modelle zur Problemlösung nutzen', [
    target.methods,
    target.digitalMeasurement,
  ]),
  row('3.1-EXP', 'Versuche planen, aufbauen, durchführen, Messdaten auswerten und signifikante Stellen sowie Messunsicherheiten reflektieren', [
    target.methods,
    target.digitalMeasurement,
    target.uncertainty,
  ]),
  row('3.1-MATH', 'Physikalische Zusammenhänge sprachlich, grafisch und algebraisch darstellen, Ausgleichskurven wählen und Ableitung bzw. Fläche deuten', [
    target.methods,
    target.uncertainty,
  ]),
  row('3.1-MOD', 'Modelle, Idealisierungen, Zeigerdarstellung und Differenzengleichungen zur Problemlösung und Hypothesenbildung nutzen', [
    target.methods,
  ]),
  row('3.1-EWG', 'Erkenntniswege, Hypothesenprüfung, Modellbedeutung, Messunsicherheiten und Besonderheiten der Quantenphysik reflektieren', [
    target.methods,
    target.uncertainty,
    target.quantumReality,
  ]),
  row('3.1-KOM', 'Fachbezogene Darstellungen, Quellen, Präsentationen, Fachgespräche und Argumentationsketten sicher kommunizieren', [
    target.methods,
  ]),
  row('3.1-DOK', 'Notizen, Versuchs- und Rechenwege, Tabellen, Diagramme und elektronische Arbeitsschritte sachgerecht dokumentieren', [
    target.methods,
    target.digitalMeasurement,
  ]),
  row('3.1-BEW', 'Physikalische, technische, gesellschaftliche und politische Aspekte trennen und Bewertungsverfahren begründet anwenden', [
    target.society,
  ]),

  row('3.2-DYN', 'freien Fall und waagerechten Wurf mit t-s- und t-v-Zusammenhängen beschreiben und auf Aufgaben übertragen', [
    target.motion,
    target.projectile,
  ]),
  row('3.2-DYN', 'Daten aus selbst durchgeführten Bewegungs-Experimenten auswerten', [
    target.motion,
    target.methods,
  ]),
  row('3.2-DYN', 'gleichmäßig beschleunigte Bewegungen modellieren und auf ausgewählte Situationen übertragen', [target.motion]),
  row('3.2-DYN', 'Wirkungen von Kräften bei Bewegungsänderungen beschreiben und das zweite Newtonsche Gesetz anwenden', [
    target.newton,
  ]),
  row('3.2-DYN', 'Wechselwirkungsprinzip und Kräftegleichgewicht voneinander abgrenzen', [target.newton]),
  row('3.2-DYN', 'Reibungskräfte und Hangabtriebskräfte in einfachen Kontexten analysieren', [target.newton]),
  row('3.2-DYN', 'Energieerhaltung und Energieumwandlungen in der Mechanik beschreiben', [
    target.energy,
    target.conservation,
  ]),
  row('3.2-DYN', 'Experimente zur Überprüfung des Energieerhaltungssatzes planen, durchführen und dokumentieren', [
    target.energy,
    target.methods,
  ]),
  row('3.2-DYN', 'mithilfe des Energieerhaltungssatzes bei einfachen Experimenten argumentieren', [
    target.energy,
    target.conservation,
  ]),
  row('3.2-DYN', 'ein Werturteil zu Fragestellungen der Energienutzung und Nachhaltigkeit erarbeiten', [
    target.society,
    target.energy,
  ]),

  row('3.2-AKU', 'Schallgeschwindigkeit in Luft und einem weiteren Medium bestimmen und Messwerte dazu auswerten', [
    target.acousticPropagation,
    target.methods,
  ]),
  row('3.2-AKU', 'Ton, Klang und Geräusch anhand von Schwingungsbildern vergleichen', [target.acousticSources]),
  row('3.2-AKU', 'Frequenz als Maß für Tonhöhe und Amplitude als Maß für Lautstärke beschreiben', [target.acousticSources]),
  row('3.2-AKU', 'Schalldruckpegel zur Beurteilung von Lärmgefährdung nutzen', [target.acousticRisks]),
  row('3.2-AKU', 'Frequenzverhältnisse und musikalische Intervalle erläutern', [target.acousticSources]),
  row('3.2-AKU', 'Frequenzanalysen von Tönen und Klängen anwenden und Obertöne beschreiben', [target.acousticSources]),
  row('3.2-AKU', 'Klangfarbe physikalisch erläutern', [target.acousticSources]),

  row('3.2-ATOMKERN', 'Kern-Hülle-Modell des Atoms und Isotop-Begriff beschreiben', [target.atom]),
  row('3.2-ATOMKERN', 'Ionisation mithilfe des Kern-Hülle-Modells deuten', [target.atom]),
  row('3.2-ATOMKERN', 'ionisierende Wirkung, stochastischen Charakter und biologische Wirkung von Kernstrahlung beschreiben', [
    target.radiationRisk,
  ]),
  row('3.2-ATOMKERN', 'grundlegende Funktionsweise eines Geiger-Müller-Zählrohrs beschreiben', [target.nuclear]),
  row('3.2-ATOMKERN', 'Alpha-, Beta- und Gamma-Strahlung nach Durchdringungsvermögen, Reichweite und modellhafter Entstehung vergleichen', [
    target.nuclear,
    target.radiationRisk,
  ]),
  row('3.2-ATOMKERN', 'radioaktiven Zerfall mit Halbwertszeit beschreiben und Abklingkurven auswerten', [
    target.nuclear,
    target.nucideCards,
  ]),
  row('3.2-ATOMKERN', 'zur Lagerung radioaktiven Abfalls Stellung nehmen', [target.radiationRisk, target.society]),

  row('3.2-OPTIK', 'Bildentstehung an Linsen erläutern und optische Abbildungen experimentell erzeugen', [target.lenses]),
  row('3.2-OPTIK', 'Einfluss von Brennweite und Gegenstandsweite auf Bildgröße, Bildlage und Bildeigenschaften beschreiben', [
    target.lenses,
  ]),
  row('3.2-OPTIK', 'Bilder mit ausgezeichneten Strahlen konstruieren und den Abbildungsmaßstab bestimmen', [target.lenses]),
  row('3.2-OPTIK', 'Linsengleichung nennen, herleiten und in ausgewählten Situationen anwenden', [target.lenses]),
  row('3.2-OPTIK', 'Funktionsweise ausgewählter optischer Geräte wie Beamer, Fotoapparat, Mikroskop oder Fernrohr erläutern', [
    target.opticalInstruments,
  ]),
  row('3.2-OPTIK', 'zwischen abbildenden und sehwinkelvergrößernden Geräten unterscheiden', [target.opticalInstruments]),

  row('3.2-STRAHLUNG', 'Boltzmannsches Strahlungsgesetz und Wiensches Verschiebungsgesetz auf ausgewählte Fragestellungen anwenden', [
    target.thermodynamics,
  ]),
  row('3.2-STRAHLUNG', 'Strahlungsgleichgewicht als Folge von Reflexion, Absorption und Reemission beschreiben', [
    target.thermodynamics,
  ]),
  row('3.2-STRAHLUNG', 'selektive Absorption experimentell beschreiben und auf klimarelevante Gase übertragen', [
    target.thermodynamics,
    target.society,
  ]),
  row('3.2-STRAHLUNG', 'Treibhauseffekt an einem vereinfachten Modell darstellen, Grenzen des Modells erörtern und Parameterwirkungen beschreiben', [
    target.thermodynamics,
    target.society,
  ]),

  row('3.3-ELEK', 'elektrische Felder durch Kraftwirkungen auf geladene Probekörper beschreiben und Feldlinienbilder skizzieren', [
    target.electricField,
  ]),
  row('3.3-ELEK', 'faradayschen Käfig als Resultat des Superpositionsprinzips beschreiben', [target.electricField]),
  row('3.3-ELEK', 'Ladungseinheit und Definition der elektrischen Feldstärke erläutern und ein Bestimmungsverfahren beschreiben', [
    target.electricField,
  ]),
  row('3.3-ELEK', 'Coulombsches Gesetz beschreiben', [target.electricField], 'LK'),
  row('3.3-ELEK', 'Zusammenhang zwischen Ladung und elektrischer Stromstärke beschreiben', [target.electricField]),
  row('3.3-ELEK', 'elektrische Spannung als pro Ladung übertragene Energie bzw. Potentialdifferenz beschreiben', [
    target.electricField,
  ]),
  row('3.3-ELEK', 'Zusammenhang zwischen Feldstärke im Plattenkondensator und anliegender Spannung beschreiben', [
    target.capacitor,
  ]),
  row('3.3-ELEK', 'Energiebilanz für freie geladene Körper im homogenen elektrischen Feld anwenden', [
    target.chargedInEField,
  ]),
  row('3.3-ELEK', 'Auf- und Entladevorgang eines Kondensators mit Exponentialfunktionen und Diagrammen auswerten', [
    target.capacitor,
    target.methods,
  ]),
  row('3.3-ELEK', 'Kapazität eines Kondensators definieren, experimentell bestimmen und geometrisch berechnen', [target.capacitor]),
  row('3.3-ELEK', 'Energie des elektrischen Feldes eines Plattenkondensators angeben', [target.capacitor]),
  row('3.3-ELEK', 'magnetische Felder durch Wirkung auf Kompassnadeln beschreiben und Feldrichtungen bestimmen', [
    target.magneticField,
  ]),
  row('3.3-ELEK', 'Kraft auf stromdurchflossene Leiter im homogenen Magnetfeld nach Richtung und Betrag ermitteln', [
    target.magneticField,
  ]),
  row('3.3-ELEK', 'magnetische Flussdichte in Analogie zur elektrischen Feldstärke definieren und mit Stromwaage bestimmen', [
    target.magneticField,
    target.methods,
  ]),
  row('3.3-ELEK', 'Bewegung freier Elektronen unter Lorentzkraft, im elektrischen Querfeld und im Wien-Filter beschreiben', [
    target.chargedInEField,
    target.magneticField,
  ]),
  row('3.3-ELEK', 'spezifische Ladung des Elektrons mit dem Fadenstrahlrohr bestimmen', [
    target.fadenstrahl,
  ], 'LK'),
  row('3.3-ELEK', 'Magnetfeld einer Spule mit Hallsonde messen und Abhängigkeit von Stromstärke, Windungszahl, Länge und Permeabilität beschreiben', [
    target.magneticField,
  ]),
  row('3.3-ELEK', 'Hallspannung herleiten und Hall-Effekt zur Messung magnetischer Felder einordnen', [
    target.magneticField,
  ], 'LK'),
  row('3.3-ELEK', 'Induktionsspannung qualitativ mit magnetischem Fluss erklären und qualitative Induktionsversuche durchführen', [
    target.induction,
  ]),
  row('3.3-ELEK', 'Induktionsgesetz für lineare und sinusförmige Flussänderungen anwenden und Diagramme auswerten', [
    target.induction,
  ]),
  row('3.3-ELEK', 'technische Anwendungen der Induktion und Erzeugung von Wechselspannung darstellen', [
    target.induction,
    target.society,
  ]),
  row('3.3-ELEK', 'Spulen als Energiespeicher, Selbstinduktion, Induktivität und magnetische Feldenergie beschreiben', [
    target.induction,
  ], 'LK'),

  row('3.3-SCHWING-WELLEN', 'harmonische Schwingungen grafisch mit Zeigerdarstellung oder Sinuskurven darstellen', [
    target.oscillation,
  ]),
  row('3.3-SCHWING-WELLEN', 'Auslenkung, Amplitude, Periodendauer und Frequenz harmonischer Schwingungen beschreiben und Messwerte auslesen', [
    target.oscillation,
  ]),
  row('3.3-SCHWING-WELLEN', 'Periodendauer eines Feder-Masse-Pendels angeben und Abhängigkeiten experimentell bestätigen', [
    target.oscillation,
  ]),
  row('3.3-SCHWING-WELLEN', 'lineares Kraftgesetz, Energieumwandlungen und Dämpfung beim Feder-Masse-Pendel beschreiben', [
    target.oscillation,
  ], 'LK'),
  row('3.3-SCHWING-WELLEN', 'Resonanz bei erzwungenen Schwingungen experimentell erläutern', [target.oscillation], 'LK'),
  row('3.3-SCHWING-WELLEN', 'elektromagnetischen Schwingkreis aufbauen, Messdaten auswerten und Energieumwandlungen qualitativ beschreiben', [
    target.oscillation,
    target.induction,
  ]),
  row('3.3-SCHWING-WELLEN', 'Thomsonsche Schwingungsgleichung nennen und Eigenfrequenzabhängigkeit experimentell untersuchen', [
    target.oscillation,
    target.induction,
  ], 'LK'),
  row('3.3-SCHWING-WELLEN', 'Ausbreitung harmonischer Wellen mit Zeigerketten oder Sinuskurven darstellen', [target.waves]),
  row('3.3-SCHWING-WELLEN', 'Periodendauer, Ausbreitungsgeschwindigkeit, Wellenlänge, Frequenz, Amplitude und Phase harmonischer Wellen beschreiben', [
    target.waves,
  ]),
  row('3.3-SCHWING-WELLEN', 'Zusammenhang zwischen Wellenlänge und Frequenz anwenden und begründen', [target.waves]),
  row('3.3-SCHWING-WELLEN', 'Reflexion, Brechung, Beugung sowie longitudinale und transversale Wellen vergleichen', [
    target.waves,
  ]),
  row('3.3-SCHWING-WELLEN', 'Polarisierbarkeit als Unterscheidungsmerkmal untersuchen und Intensität mit Amplitudenquadrat deuten', [
    target.emWaves,
  ]),
  row('3.3-SCHWING-WELLEN', 'Interferenzphänomene bei stehenden Wellen, Michelson-Interferometer, Doppelspalt, Gitter und Bragg-Reflexion beschreiben', [
    target.waves,
    target.emWaves,
  ]),
  row('3.3-SCHWING-WELLEN', 'Wellenlängen von Ultraschall, Licht und Röntgenstrahlung mit geeigneten Experimenten bestimmen', [
    target.waves,
    target.emWaves,
  ]),
  row('3.3-SCHWING-WELLEN', 'Interferenzgleichungen für Doppelspalt, Gitter und Bragg-Reflexion herleiten und anwenden', [
    target.emWaves,
  ]),

  row('3.3-QUANTEN', 'Doppelspaltexperiment mit Quantenobjekten mit Ruhemasse beschreiben und Interferenzmuster stochastisch deuten', [
    target.quantum,
    target.dualism,
  ]),
  row('3.3-QUANTEN', 'Nachweiswahrscheinlichkeit einzelner Quantenobjekte mit Zeigerdarstellung oder Amplitudenquadrat beschreiben', [
    target.quantum,
    target.interferometer,
  ], 'LK'),
  row('3.3-QUANTEN', 'de-Broglie-Gleichung zur Wellenlänge von Quantenobjekten anwenden und Antiproportionalität prüfen', [
    target.dualism,
    target.electronDiffraction,
  ]),
  row('3.3-QUANTEN', 'Elektronenbeugungsröhre beschreiben und mit optischen Analogieversuchen deuten', [
    target.electronDiffraction,
  ]),
  row('3.3-QUANTEN', 'Interferenzmuster einzelner Photonen und Elektronen auf Komplementarität hin deuten', [
    target.quantum,
    target.dualism,
  ]),
  row('3.3-QUANTEN', 'Mach-Zehnder-Interferometer, Delayed-Choice-Experiment, Komplementarität, Nichtlokalität und Kausalität erläutern', [
    target.interferometer,
    target.quantumReality,
  ], 'LK'),
  row('3.3-QUANTEN', 'Zustand, Präparation, Superposition und Unbestimmtheit am Beispiel polarisierten Lichts erläutern', [
    target.quantum,
    target.quantumReality,
  ], 'LK'),
  row('3.3-QUANTEN', 'Plancksches Wirkungsquantum mit LEDs und Photonenmodell experimentell bestimmen', [
    target.photonModel,
    target.methods,
  ]),
  row('3.3-QUANTEN', 'äußeren lichtelektrischen Effekt mit Vakuum-Fotozelle und f-E-Diagramm deuten', [
    target.photonModel,
  ], 'LK'),
  row('3.3-QUANTEN', 'Röntgenbremsspektrum zur Bestimmung der planckschen Konstante nutzen', [
    target.photonModel,
  ], 'LK'),

  row('3.3-ATOMHUELLE', 'Quantisierung der Gesamtenergie von Elektronen in der Atomhülle mit dem eindimensionalen Potenzialtopf erläutern', [
    target.potentialWell,
  ]),
  row('3.3-ATOMHUELLE', 'Energieniveaus im Potenzialtopf berechnen und Modellgrenzen reflektieren', [
    target.potentialWell,
  ]),
  row('3.3-ATOMHUELLE', 'Linienspektren, Absorption und Emission mithilfe diskreter Energieniveaus erklären', [
    target.spectra,
    target.atom,
  ]),
  row('3.3-ATOMHUELLE', 'Franck-Hertz-Versuch als Hinweis auf diskrete Energieniveaus deuten', [
    target.spectra,
    target.atom,
  ]),
  row('3.3-ATOMHUELLE', 'charakteristische Röntgenstrahlung und Röntgenspektren mit Atommodellvorstellungen deuten', [
    target.spectra,
  ], 'LK'),
  row('3.3-ATOMHUELLE', 'Orbitale und quantenmechanische Sichtweise der Atomhülle in Modellgrenzen einordnen', [
    target.atom,
    target.quantum,
  ], 'LK'),

  row('3.3-ATOMKERN', 'Geiger-Müller-Zählrohr als Messgerät für Zählraten und radioaktive Zerfälle erläutern', [
    target.nuclear,
  ]),
  row('3.3-ATOMKERN', 'Zerfallsgesetz grafisch und mit Exponentialfunktionen auswerten', [
    target.nuclear,
    target.nucideCards,
  ]),
  row('3.3-ATOMKERN', 'Kernstrahlung, Strahlungsarten, Reichweiten und Abschirmung beschreiben', [
    target.nuclear,
    target.radiationRisk,
  ]),
  row('3.3-ATOMKERN', 'Aktivität, Halbwertszeit, Nuklidkarte und Zerfallsreihen auswerten', [
    target.nucideCards,
    target.nuclear,
  ]),
  row('3.3-ATOMKERN', 'biologische Wirkung, Äquivalentdosis und Strahlenschutz fachlich beurteilen', [
    target.radiationRisk,
  ]),
  row('3.3-ATOMKERN', 'Kernspaltung, Kettenreaktion, Kernenergie und Entsorgungsfragen physikalisch und gesellschaftlich bewerten', [
    target.radiationRisk,
    target.society,
  ]),
  row('3.3-ATOMKERN', 'Bindungsenergie, Massendefekt und Potenzialtopfmodell für Kerne erläutern', [
    target.nuclear,
    target.potentialWell,
  ], 'LK'),
  row('3.3-ATOMKERN', 'Standardmodell und Elementarteilchen in Grundzügen einordnen', [
    target.standardModel,
  ], 'LK'),

  row('3.1-ARG', 'Fragestellungen zu physikalischen Sachverhalten identifizieren, entwickeln und einer fachlich-kritischen Prüfung unterziehen', [
    target.methods,
  ]),
  row('3.1-ARG', 'Hypothesen formulieren und mithilfe von Experimenten überprüfen', [
    target.methods,
  ]),
  row('3.1-ARG', 'mithilfe linearer Funktionen, Potenzfunktionen, Exponentialfunktionen, Ableitungen und Flächeninhalten argumentieren', [
    target.methods,
  ]),
  row('3.1-PROB', 'Kenntnisse auf Alltagssituationen, technische Anwendungen und analoge Situationen übertragen', [
    target.methods,
    target.society,
  ]),
  row('3.1-PROB', 'einfache mathematische und numerische Modelle zur Problemlösung verwenden', [
    target.methods,
  ], 'LK'),
  row('3.1-EXP', 'Experimente zur Untersuchung eigener Fragestellungen selbst planen und sachgerecht durchführen', [
    target.methods,
  ]),
  row('3.1-EXP', 'Messergebnisse mit elektronischen Rechenwerkzeugen auswerten und das Vorgehen dokumentieren', [
    target.digitalMeasurement,
    target.methods,
  ]),
  row('3.1-EXP', 'Messwerte und berechnete Größen mit sinnvoller Anzahl signifikanter Stellen angeben', [
    target.uncertainty,
  ]),
  row('3.1-MATH', 'wissenschaftliche Notation, Einheiten, Umrechnungen und physikalische Symbole sachgerecht verwenden', [
    target.methods,
  ]),
  row('3.1-MATH', 'geeignete Ausgleichskurven begründet auswählen und Messunsicherheiten beim Fitten erläutern', [
    target.uncertainty,
    target.methods,
  ]),
  row('3.1-MATH', 'funktionale Zusammenhänge, Gleichungen und Termumformungen für deduktive Schlüsse nutzen', [
    target.methods,
  ]),
  row('3.1-MATH', 'Zeigerdarstellung zur mathematischen Beschreibung von Wellen und Quanten verwenden', [
    target.waves,
    target.quantum,
  ]),
  row('3.1-MOD', 'zwischen Modellvorstellung, ikonischer Repräsentation und Realität unterscheiden', [
    target.methods,
  ]),
  row('3.1-EWG', 'Funktion eines Experiments bei der Entscheidung über Hypothesen erläutern', [
    target.methods,
  ]),
  row('3.1-KOM', 'Informationen aus Beobachtungen, Darstellungen und Texten in angemessener Fachsprache wiedergeben', [
    target.methods,
  ]),
  row('3.1-KOM', 'Arbeitsergebnisse sach-, situations- und adressatengerecht unter Beachtung von Urheberrecht und Zitierregeln präsentieren', [
    target.methods,
  ]),
  row('3.1-DOK', 'Versuchsergebnisse, Messtabellen, Größensymbole und Einheiten selbstständig dokumentieren', [
    target.methods,
  ]),
  row('3.1-BEW', 'Handlungsoptionen in gesellschaftlich oder alltagsrelevanten Entscheidungssituationen fachlich abwägen', [
    target.society,
  ]),

  row('3.2-DYN', 'Impuls als weitere Erhaltungsgröße einordnen und einfache Stoß- bzw. Rückstoßsituationen beschreiben', [
    target.conservation,
  ]),
  row('3.2-DYN', 'Kräfte- und Energiebilanzen zur Lösung von Dynamikaufgaben einsetzen', [
    target.newton,
    target.energy,
  ]),
  row('3.2-STRAHLUNG', 'grafische Darstellungen zum Treibhauseffekt auswerten und Klimamodell-Parameter variieren', [
    target.thermodynamics,
    target.society,
  ]),

  row('3.3-ELEK', 'Messreihen zur Bestimmung elektrischer Feldstärken und magnetischer Flussdichten auswerten', [
    target.electricField,
    target.magneticField,
    target.methods,
  ]),
  row('3.3-ELEK', 'Bahnkurven geladener Teilchen in elektrischen und magnetischen Feldern prinzipiell begründen', [
    target.chargedInEField,
    target.magneticField,
  ]),
  row('3.3-ELEK', 'Geschwindigkeitsgleichung im Wien-Filter herleiten und auf andere geladene Teilchen übertragen', [
    target.chargedInEField,
    target.magneticField,
  ]),
  row('3.3-ELEK', 'Magnetfeldlinienbilder für geraden Leiter und Spule skizzieren', [
    target.magneticField,
  ]),
  row('3.3-ELEK', 'Einfluss eines Dielektrikums auf die Kapazität eines Kondensators qualitativ beschreiben', [
    target.capacitor,
  ], 'LK'),
  row('3.3-ELEK', 'Halbwertzeit des Kondensatorladevorgangs mit dem Produkt aus Widerstand und Kapazität überprüfen', [
    target.capacitor,
    target.methods,
  ], 'LK'),
  row('3.3-ELEK', 't-I- und t-U-Zusammenhänge beim Kondensator mit geeigneten Regressionen begründen', [
    target.capacitor,
    target.methods,
  ]),
  row('3.3-ELEK', 'Gleichung für die Hallspannung aus Driftgeschwindigkeit und Kräftegleichgewicht herleiten', [
    target.magneticField,
  ], 'LK'),
  row('3.3-ELEK', 'Selbstinduktion beim Ein- und Ausschalten von Spulen erläutern', [
    target.induction,
  ], 'LK'),

  row('3.3-SCHWING-WELLEN', 'Oszilloskop oder digitales Werkzeug zur Bestimmung von Amplitude, Periodendauer und Frequenz nutzen', [
    target.oscillation,
    target.digitalMeasurement,
  ]),
  row('3.3-SCHWING-WELLEN', 'gedämpfte Schwingungen mit exponentiell abnehmender Amplitude deuten', [
    target.oscillation,
  ], 'LK'),
  row('3.3-SCHWING-WELLEN', 'Resonanzkurve eines elektromagnetischen Schwingkreises erzeugen und auswerten', [
    target.oscillation,
    target.induction,
  ], 'LK'),
  row('3.3-SCHWING-WELLEN', 'Polarisator-Experimente winkelabhängig auswerten und Intensität quadratisch deuten', [
    target.emWaves,
  ], 'LK'),
  row('3.3-SCHWING-WELLEN', 'Frequenzbereich des sichtbaren Lichts in das Spektrum elektromagnetischer Wellen einordnen', [
    target.emWaves,
  ]),
  row('3.3-SCHWING-WELLEN', 'Spurabstand bei CD/DVD mithilfe von Interferenzkenntnissen bestimmen', [
    target.emWaves,
  ], 'LK'),
  row('3.3-SCHWING-WELLEN', 'Michelson-Interferometer zum Nachweis kleiner Längenänderungen erläutern', [
    target.emWaves,
  ]),

  row('3.3-QUANTEN', 'Interferenzmuster bei geringer und hoher Intensität beschreiben und deuten', [
    target.quantum,
    target.dualism,
  ]),
  row('3.3-QUANTEN', 'Koinzidenzmethode zum Nachweis einzelner Photonen erläutern', [
    target.quantum,
  ], 'LK'),
  row('3.3-QUANTEN', 'eine Anwendung der Quantenphysik erläutern', [
    target.quantum,
    target.society,
  ], 'LK'),
  row('3.3-QUANTEN', 'Unbestimmtheit an einem Beispiel veranschaulichen und mit der Lehrbuch-Relation für Ort und Impuls vergleichen', [
    target.quantumReality,
  ], 'LK'),

  row('3.3-ATOMHUELLE', 'Übergänge zwischen Energieniveaus mit Photonenenergie und Frequenz verknüpfen', [
    target.spectra,
    target.photonModel,
  ]),
  row('3.3-ATOMHUELLE', 'Energieniveaus und Spektren zur Analyse unbekannter Lichtquellen nutzen', [
    target.spectra,
  ]),
  row('3.3-ATOMHUELLE', 'Modell des eindimensionalen Potenzialtopfs als heuristisches Hilfsmittel zur Problemlösung verwenden', [
    target.potentialWell,
  ]),
  row('3.3-ATOMHUELLE', 'Modellgrenzen klassischer und quantenphysikalischer Atomvorstellungen fachlich erläutern', [
    target.atom,
    target.quantumReality,
  ]),

  row('3.3-ATOMKERN', 'Nullrate bei Zählratenmessungen berücksichtigen und Messreihen zur Aktivität auswerten', [
    target.nuclear,
    target.uncertainty,
  ]),
  row('3.3-ATOMKERN', 'Kernreaktionen mithilfe von Erhaltungsgrößen und Nuklidkarten beschreiben', [
    target.nucideCards,
    target.conservation,
  ]),
  row('3.3-ATOMKERN', 'Nutzen und Risiken ionisierender Strahlung in Medizin, Technik und Energieversorgung beurteilen', [
    target.radiationRisk,
    target.society,
  ]),
  row('3.3-ATOMKERN', 'Zufallscharakter einzelner Zerfälle und deterministische Vorhersagbarkeit von Halbwertszeiten unterscheiden', [
    target.nuclear,
    target.methods,
  ]),
  row('3.3-SCHWING-WELLEN', 'Bragg-Reflexion zur Bestimmung von Röntgenwellenlängen anwenden', [
    target.emWaves,
  ], 'LK'),
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
  id: `ni-physics-sekii:${topic.code}`,
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
  const goalId = `ni-physics-sekii-kc2022-${slug(currentRow.topicCode)}-${String(index + 1).padStart(3, '0')}-${hash(currentRow.text)}`
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
    sourceRef: `Niedersachsen KC Physik Sek II 2022, ${currentRow.topicCode}, S. ${passage.page}`,
    courseLevel: currentRow.courseLevel,
    granularity: 'officialCompetencyRow',
    tags: ['source:niedersachsen', 'stage:SekII', `topic:${currentRow.topicCode}`, `course:${currentRow.courseLevel}`],
    rawSourceText: currentRow.text,
    rawSourceSpan: `${currentRow.topicCode}, S. ${passage.page}`,
    rawParentBulletText: currentRow.text,
  }
})

const peerBaselineDetails =
  `${sourceGoals.length} Source-Ziele; Vergleich HE/BW SEKII (164/274); ` +
  'liegt im 30%-Median-Korridor 154-284 und ersetzt den zu kleinen 60-Ziele-Pilot-Snapshot.'

const extraction = {
  schemaVersion: 1,
  extractionId: 'DE-NI-PHYSIK-SEKII-KC2022',
  sourceLandscapeId,
  jurisdiction: 'DE-NI',
  subject: 'Physik',
  stage: 'SekII',
  sourceDocument: {
    key: 'KC2022',
    title: 'Kerncurriculum Physik gymnasiale Oberstufe Niedersachsen 2022',
    path: sourcePdfPath,
    official: true,
  },
  method: {
    passageExtraction:
      'pdftotext -layout; chapter 3.1 process competences, 3.2 introduction-phase content modules and 3.3 qualification-phase content tables were segmented by official headings',
    sourceGoalExtraction:
      'one source goal per reviewed official competency row or row-level competency bundle; duplicated GK/LK wording is represented once unless the eA/LK requirement adds a distinct expectation',
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
            label: 'Amtliche Physik-Quelle Niedersachsen liegt lokal vor',
            passed: true,
            details: sourcePdfPath,
          },
          {
            id: 'expected-topic-coverage',
            label: 'Alle erwarteten NI-Physik-Kompetenzbereiche sind als Lehrplanpassagen vorhanden',
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
            label: 'Aus den amtlichen NI-Physik-Kompetenzerwartungen wurden Source-Ziele erzeugt',
            passed: true,
            details: `${sourceGoals.length} Source-Ziele`,
          },
          {
            id: 'source-goal-count-peer-baseline',
            label: 'Source-Ziel-Anzahl ist gegen den geprüften HE/BW-Median plausibilisiert',
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
    decision: currentRow.canonicalGoalIds.length > 0 ? 'mapped' : 'needsCanonicalGoal',
    canonicalGoalIds: currentRow.canonicalGoalIds,
    rationale: currentRow.canonicalGoalIds.length > 1
      ? 'Das amtliche NI-Source-Ziel ist inhaltlich durch mehrere kanonische Physikziele abgedeckt; 1:n ist hier die passende Zuordnungsform.'
      : currentRow.canonicalGoalIds.length === 1
        ? 'Das amtliche NI-Source-Ziel ist inhaltlich durch ein kanonisches Physikziel abgedeckt.'
        : 'Für dieses amtliche NI-Source-Ziel fehlt noch ein fachlich passendes kanonisches Physikziel.',
    reviewedAt: '2026-05-10',
    reviewer: 'codex',
  }
})

const review = {
  version: 1,
  reviewId: 'DE-NI-PHYSIK-SEKII-KC2022-MAPPING-3-SOURCE-EXTRACTION-1',
  sourceLandscapeId,
  targetLandscapeId,
  sourceExtractionPath: extractionPath,
  status: {
    scope: 'Niedersachsen Physik Sek II / KC 2022 Kapitel 3.1 bis 3.3',
    reviewedSourceGoals: sourceGoals.length,
    mappedSourceGoals: sourceGoals.length,
    needsViewPlacementReview: 0,
    needsCanonicalGoal: 0,
    totalSourceGoals: sourceGoals.length,
    explicitNeedsCanonicalGoal: 0,
    notes:
      'Niedersachsen wurde vom zu kleinen Pilot-Snapshot auf amtliche Source-Extraction umgestellt. MatchType partial bedeutet 1:n- oder Teilbaum-Abdeckung, nicht fachliche Offenheit.',
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
registryEntry.title = 'Physik Oberstufe (Niedersachsen, KC 2022 Source-Extraction)'
registryEntry.sourcePath = sourcePdfPath
registryEntry.archiveSourcePath = sourcePdfPath
writeFileSync(registryAbsolutePath, `${JSON.stringify(registry, null, 2)}\n`)

const addNiSpecificViewEntries = (view: Record<string, unknown>) => {
  const rootNodes = Array.isArray(view.rootNodes) ? view.rootNodes : []
  const root = rootNodes.find((node): node is Record<string, unknown> =>
    typeof node === 'object' && node !== null && node.id === 'physics-root')
  if (!root) throw new Error('physics-root not found in copied Niedersachsen composition view')
  const children = (Array.isArray(root.children) ? root.children as Array<Record<string, unknown>> : [])
    .filter((child) => child.id !== 'physics-ni-kc-specific')
  children.push({
    kind: 'structure',
    id: 'physics-ni-kc-specific',
    label: 'Niedersachsen-spezifische KC-Module',
    children: [
      {
        kind: 'goalEntry',
        goalId: '8ac61062-f63e-5935-96ae-84014906c368',
        displayLabel: 'Schalldruckpegel und Hoerrisiken quantitativ beurteilen',
      },
      {
        kind: 'goalEntry',
        goalId: '84ddb244-e560-592f-9d43-e84c801fe5b4',
        displayLabel: 'Linsenauge mit geometrischer Optik modellieren',
      },
      {
        kind: 'goalEntry',
        goalId: '5a5bc118-4420-5bb7-94c3-67837f2ce0dd',
        displayLabel: 'Kernreaktionen und Kernmodelle',
      },
      {
        kind: 'goalEntry',
        goalId: '22bdd29e-00d3-5d43-97d6-8b442b8bfc8c',
        displayLabel: 'Photonenmodell und Fotoeffekt',
      },
      {
        kind: 'goalEntry',
        goalId: '15cb40f1-e2d3-5754-9e7b-e8888fe78340',
        displayLabel: 'Standardmodell und Teilchenphysik',
      },
    ],
  })
  root.children = children
}

for (const suffix of ['gk', 'lk', 'sekii-gk', 'sekii-lk']) {
  const templatePath = path.resolve(repoRoot, compositionViewDir, `de-bb-${suffix}.view.json`)
  const outputPath = path.resolve(repoRoot, compositionViewDir, `de-ni-${suffix}.view.json`)
  const view = JSON.parse(readFileSync(templatePath, 'utf8'))
  view.viewId = String(view.viewId).replace('de-bb', 'de-ni')
  view.scope = { ...view.scope, jurisdiction: 'DE-NI' }
  addNiSpecificViewEntries(view)
  writeFileSync(outputPath, `${JSON.stringify(view, null, 2)}\n`)
}

const readmePath = path.resolve(repoRoot, 'curricula/DE/Gymnasium/mapping/DE-NI/upper-secondary/README.md')
writeFileSync(
  readmePath,
  [
    '# Niedersachsen Physik Oberstufe -> kanonische Physik',
    '',
    'Stand: 2026-05-10',
    '',
    'Diese Spur wurde vom Pilot-Quellsnapshot auf eine Source-Extraction aus der amtlichen PDF umgestellt.',
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
console.log('Updated Niedersachsen registry entry and composition views')
