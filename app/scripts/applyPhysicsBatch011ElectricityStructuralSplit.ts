import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel'

type JsonRecord = Record<string, unknown>
type MatchType = 'exact' | 'partial'

const repoRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')

const paths = {
  canonical: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json',
  semanticKinds: 'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json',
  atomicity: 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-physics-full.review.jsonl',
  memory: 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-physics-full.review.jsonl',
  atlas: 'app/scripts/config/goal-books/de-gym-physics-national-atlas.sources.json',
  surrogate: 'curricula/DE/Gymnasium/provenance/canonical-goal-surrogate-evidence-registry.json',
  canonicalProvenance: 'curricula/DE/Gymnasium/provenance/canonical-goal-provenance-registry.json',
  heReview: 'curricula/DE/Gymnasium/mapping/DE-HE/lower-secondary/hessen_physics_lower_secondary_source_extraction_to_canonical_physics.review.json',
  heLegacy: 'curricula/DE/Gymnasium/mapping/DE-HE/lower-secondary/hessen_physics_lower_secondary_to_canonical_physics.json',
  bwReview: 'curricula/DE/Gymnasium/mapping/DE-BW/lower-secondary/bw_physics_lower_secondary_source_extraction_to_canonical_physics.review.json',
  byReview: 'curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_physics_source_extraction_to_canonical_physics.review.json',
  mvReview: 'curricula/DE/Gymnasium/mapping/DE-MV/lower-secondary/mv_physics_lower_secondary_source_extraction_to_canonical_physics.review.json',
  slReview: 'curricula/DE/Gymnasium/mapping/DE-SL/lower-secondary/sl_physics_lower_secondary_source_extraction_to_canonical_physics.review.json',
  snReview: 'curricula/DE/Gymnasium/mapping/DE-SN/lower-secondary/sn_physics_lower_secondary_source_extraction_to_canonical_physics.review.json',
  hbReview: 'curricula/DE/Gymnasium/mapping/DE-HB/lower-secondary/hb_physics_lower_secondary_source_extraction_to_canonical_physics.review.json',
  hhReview: 'curricula/DE/Gymnasium/mapping/DE-HH/lower-secondary/hh_physics_lower_secondary_source_extraction_to_canonical_physics.review.json',
  stReview: 'curricula/DE/Gymnasium/mapping/DE-ST/lower-secondary/st_physics_lower_secondary_source_extraction_to_canonical_physics.review.json',
  thReview: 'curricula/DE/Gymnasium/mapping/DE-TH/lower-secondary/th_physics_lower_secondary_source_extraction_to_canonical_physics.review.json',
} as const

const ids = {
  subjectRoot: 'bf980fff-b62b-4ea4-a20d-31681a7ad785',
  motivation: '5c44b9ba-9b05-4774-95d5-073230d3fc4f',
  magnets: 'f778a659-1467-4aa7-97b2-bed78c530634',
  circuitsCluster: '75bdf5ca-cda4-4658-9ec7-84c77b3759db',
  openClosed: '7ca44ba0-b77e-52bf-8562-f67b44767172',
  diagramTranslation: '69f8f59c-b0c3-5b0b-82db-834a0e655736',
  conductivity: 'baa2bf3c-798a-5ec3-a667-031bf062d96c',
  currentEffects: 'a5f652cc-e091-4c90-bec2-c357ae54fcf1',
  currentMeasurement: 'f1a078ae-6262-4444-a4bc-a5ab275621cf',
  electrostaticsCluster: '32111497-d5ca-453e-906d-d352f885b126',
  chargeSeparation: 'dc7dd287-6eac-574d-818d-65cfb23a2d94',
  voltageMeasurement: '28237994-9c24-5a06-82fe-be1f494768ba',
  capacitor: '80dd0a2b-1422-5b00-89ff-ec4d0faa047e',
  relation: '53196a71-9dbd-4835-b2f9-ff21b8a8962c',
  measurementCluster: '59d1145e-ac54-5917-880a-21b4b80526d3',
  resistanceCharacteristics: 'ec5cac7b-ad31-590c-8ab0-5b3ef24d2bca',
  solarModules: '0dd1e39c-8557-5a4e-b467-caae964fff67',
  powerBalance: '46e42b07-c098-5d65-8ef5-8472b7c4d8e2',
  nerveModel: '8cdef591-6ddb-5151-8c74-a80be0271079',
  assessment: 'a3c513d0-8fb9-5bd5-88cc-041527ff097d',
  conductivityAssessment: '924e1187-a067-5eb6-8d8d-85525ee6c837',
  electrostaticsAssessment: '119cb138-b0c4-559d-8f1a-a4ae42db0656',
  magnetismCurrentEffectsAssessment: '1ee79cae-a7da-53cb-86ff-872e8403f033',
  resistorNetworksAssessment: '5a530302-1303-517f-82cc-9cd457b792a8',
  nodeLoopBalancesAssessment: '5f3bbce4-b0b9-5997-8c41-f58b2a8a8fa6',
  practiceCluster: '21ab0854-4d67-5233-9495-ae208e152a3c',
  compatibilityCapstone: '3631c8f7-ff48-57ff-b7ee-8397ff1d166a',
  magnetismArea: '4924d83e-5e4b-4819-9d70-86cda3496195',
  voltageArea: 'bbabac7c-9613-4c7e-877e-d7dc3df5300f',
} as const

const splitParents = new Set([
  ids.circuitsCluster,
  ids.electrostaticsCluster,
  ids.measurementCluster,
])

const childSpecs = [
  {
    id: ids.openClosed,
    parentId: ids.circuitsCluster,
    shortKey: 'canonical_physics_sek1_build_interpret_open_closed_circuits',
    title: 'Offene und geschlossene Stromkreise aufbauen und deuten',
    titleEn: 'Build and interpret open and closed circuits',
    description: 'Die lernende Person kann mit einer sicheren Kleinspannungsquelle einfache offene und geschlossene Stromkreise aufbauen und anhand des durchgehenden leitfähigen Weges begründen, ob ein angeschlossener Verbraucher wirken kann.',
    descriptionEn: 'The learner can use a safe low-voltage source to build simple open and closed circuits and use the continuous conducting path to explain whether a connected device can operate.',
    requires: [ids.motivation],
    demandLevel: 'AB2',
    processCompetencies: ['PK1_EXPERIMENTIEREN', 'PK2_MODELLIEREN', 'PK4_KOMMUNIZIEREN'],
    guidingIdeas: ['LI_FELDER', 'LI_TECHNIK'],
    topicCode: 'CANONICAL.PHYSICS.SEK1.ELECTRICITY.CIRCUITS.OPEN_CLOSED',
    atomicityReason: 'Das Aufbauen und Deuten eines offenen oder geschlossenen Stromkreises anhand desselben Kriteriums des durchgehenden leitfähigen Weges ist eine einzelne, prüfbare Modell- und Experimentierkompetenz.',
    memoryReason: 'Das Ziel verlangt Aufbau, Beobachtung und kausale Deutung eines Stromkreises; isoliertes Faktenabfragen ersetzt diese zusammenhängende Experimentier- und Modellleistung nicht.',
  },
  {
    id: ids.diagramTranslation,
    parentId: ids.circuitsCluster,
    shortKey: 'canonical_physics_sek1_translate_circuit_setup_diagram',
    title: 'Zwischen Stromkreis und Schaltplan übersetzen',
    titleEn: 'Translate between a circuit and its diagram',
    description: 'Die lernende Person kann einen einfachen realen Stromkreis mit fachüblichen Schaltsymbolen als Schaltplan darstellen, einen vorgegebenen Schaltplan als Aufbau umsetzen und erklären, dass der Plan elektrische Verbindungen statt räumlicher Anordnung codiert.',
    descriptionEn: 'The learner can represent a simple physical circuit as a circuit diagram using standard symbols, build a physical setup from a given diagram, and explain that the diagram encodes electrical connections rather than spatial arrangement.',
    requires: [ids.openClosed],
    demandLevel: 'AB2',
    processCompetencies: ['PK1_EXPERIMENTIEREN', 'PK2_MODELLIEREN', 'PK4_KOMMUNIZIEREN'],
    guidingIdeas: ['LI_FELDER', 'LI_TECHNIK'],
    topicCode: 'CANONICAL.PHYSICS.SEK1.ELECTRICITY.CIRCUITS.DIAGRAM_TRANSLATION',
    atomicityReason: 'Die wechselseitige Übersetzung zwischen realem Aufbau und Schaltplan prüft eine einzige Repräsentationskompetenz; die Erklärung der codierten Verbindungen ist ihr notwendiges Verständnisskriterium.',
    memoryReason: 'Fachübliche Symbole werden hier zweckgebunden beim Übersetzen und Aufbauen verwendet; eine eigene Karte würde die geforderte Repräsentationsleistung nicht angemessen abbilden.',
  },
  {
    id: ids.chargeSeparation,
    parentId: ids.electrostaticsCluster,
    shortKey: 'canonical_physics_sek1_explain_electrostatic_charge_separation',
    title: 'Elektrostatische Aufladung durch Ladungsumverteilung erklären',
    titleEn: 'Explain electrostatic charging through charge redistribution',
    description: 'Die lernende Person kann in einfachen elektrostatischen Situationen mit einem Ladungsmodell erklären, wie positive und negative Ladungen getrennt oder ausgeglichen werden, ohne dass elektrische Gesamtladung erzeugt oder vernichtet wird.',
    descriptionEn: 'The learner can use a charge model in simple electrostatic situations to explain how positive and negative charges are separated or equalized without creating or destroying net electric charge.',
    requires: [ids.motivation],
    demandLevel: 'AB2',
    processCompetencies: ['PK2_MODELLIEREN', 'PK4_KOMMUNIZIEREN'],
    guidingIdeas: ['LI_FELDER', 'LI_MATERIE'],
    topicCode: 'CANONICAL.PHYSICS.SEK1.ELECTRICITY.ELECTROSTATICS.CHARGE_SEPARATION',
    atomicityReason: 'Ladungstrennung und Ladungsausgleich werden mit demselben Erhaltungs- und Umverteilungsmodell erklärt und bilden damit eine einzelne, prüfbare elektrostatische Modellkompetenz.',
    memoryReason: 'Das Ziel verlangt eine kausale Modellierung wechselnder elektrostatischer Situationen; das bloße Erinnern einer Definition genügt dafür nicht.',
  },
  {
    id: ids.voltageMeasurement,
    parentId: ids.electrostaticsCluster,
    shortKey: 'canonical_physics_sek1_measure_voltage_in_simple_circuits',
    title: 'Spannung in einfachen Stromkreisen messen',
    titleEn: 'Measure voltage in simple circuits',
    description: 'Die lernende Person kann ein Voltmeter parallel zwischen zwei Punkten eines einfachen Kleinspannungsstromkreises mit geeignetem Messbereich anschließen, die Spannung mit Einheit messen und erläutern, auf welches Punktepaar sich der Messwert bezieht.',
    descriptionEn: 'The learner can connect a voltmeter in parallel between two points of a simple low-voltage circuit using a suitable measurement range, measure the voltage with its unit, and explain which pair of points the reading refers to.',
    requires: [ids.diagramTranslation],
    demandLevel: 'AB2',
    processCompetencies: ['PK1_EXPERIMENTIEREN', 'PK3_MATHEMATISIEREN', 'PK4_KOMMUNIZIEREN'],
    guidingIdeas: ['LI_FELDER', 'LI_TECHNIK'],
    topicCode: 'CANONICAL.PHYSICS.SEK1.ELECTRICITY.VOLTAGE.MEASUREMENT',
    atomicityReason: 'Paralleler Anschluss, Messbereich, Ablesen und Bezug auf ein Punktepaar sind notwendige Bestandteile einer einzigen fachgerechten Spannungsmessroutine.',
    memoryReason: 'Die fachgerechte Spannungsmessung muss in realen oder dargestellten Schaltungen ausgeführt und begründet werden; eine Memorycard ist dafür nicht erforderlich.',
  },
  {
    id: ids.capacitor,
    parentId: ids.electrostaticsCluster,
    shortKey: 'canonical_physics_sek1_interpret_capacitor_charge_separation',
    title: 'Einen Kondensator als System getrennter Ladungen deuten',
    titleEn: 'Interpret a capacitor as a system of separated charges',
    description: 'Die lernende Person kann einen geladenen Kondensator als zwei voneinander isolierte Leiter mit getrennten entgegengesetzten Ladungen deuten und bei vertauschter Polung die veränderte Ladungsverteilung vorhersagen.',
    descriptionEn: 'The learner can interpret a charged capacitor as two insulated conductors carrying separated opposite charges and predict the changed charge distribution when the polarity is reversed.',
    requires: [ids.chargeSeparation],
    demandLevel: 'AB2',
    processCompetencies: ['PK2_MODELLIEREN', 'PK4_KOMMUNIZIEREN'],
    guidingIdeas: ['LI_FELDER', 'LI_MATERIE', 'LI_TECHNIK'],
    topicCode: 'CANONICAL.PHYSICS.SEK1.ELECTRICITY.CAPACITOR.CHARGE_SEPARATION',
    atomicityReason: 'Deutung und Polungswechsel prüfen dasselbe Ladungstrennungsmodell eines Kondensators und bilden eine einzelne, klar abgegrenzte Modellkompetenz.',
    memoryReason: 'Das Ziel verlangt Modellanwendung und Vorhersage bei veränderter Polung; isoliertes Erinnern eines Bauteilnamens oder Merksatzes reicht nicht aus.',
  },
] as const

const electrostaticsAssessmentSpec = {
  id: ids.electrostaticsAssessment,
  shortKey: 'canonical_physics_sek1_assessment_charge_separation_and_capacitor_model',
  title: 'Prüfungsaufgabe: Ladungstrennung und Kondensator im Modell erklären',
  titleEn: 'Assessment Task: Explain Charge Separation and a Capacitor Using a Model',
  description: 'Die lernende Person kann Ladungsumverteilung zwischen zwei anschließend getrennten Leitern erklären, dabei die Erhaltung der Gesamtladung nutzen und das Modell auf einen geladenen Kondensator sowie eine umgekehrte Polung übertragen.',
  descriptionEn: 'The learner can explain charge redistribution between two conductors that are subsequently separated, use conservation of total charge, and transfer the model to a charged capacitor and reversed polarity.',
  requires: [ids.chargeSeparation, ids.capacitor],
  area: 'Elektrizitätslehre',
  topicCode: 'CANONICAL.PHYSICS.SEK1.PRACTICE.CHARGE_SEPARATION_AND_CAPACITOR_MODEL',
  processCompetencies: ['PK2_MODELLIEREN', 'PK4_KOMMUNIZIEREN'],
  guidingIdeas: ['LI_FELDER', 'LI_MATERIE', 'LI_TECHNIK'],
  taskContent: '**Kontext – elektrostatische Speicherstation mit Modellbildern:**\n\nEin Lehrmittelset enthält zwei gleiche Metallkugeln A und B auf isolierenden Ständern sowie einen Plattenkondensator an einer umpolbaren Gleichspannungsquelle mit höchstens 6 V.\n\n**Material A – Ladungsumverteilung:** Die zunächst neutralen Metallkugeln A und B berühren sich. Ein negativ geladener Stab wird ohne Berührung nahe an Kugel A gebracht. Während der Stab dort bleibt, werden die Kugeln voneinander getrennt; anschließend wird der Stab entfernt.\n\n**Material B – Kondensator:** Die voneinander isolierten Platten L und R werden in Stellung 1 so an die Quelle angeschlossen, dass L mit dem Pluspol und R mit dem Minuspol verbunden ist. Nach dem Laden wird die Quelle getrennt. In Stellung 2 werden die Anschlüsse der Quelle vertauscht.\n\n**Aufgaben:**\n\n1. Kennzeichnen Sie für Material A den neutralen Ausgangszustand beider Kugeln und bestimmen Sie die Richtung, in die sich Elektronen verschieben, solange der negativ geladene Stab nahe an A steht. (4 BE)\n2. Sagen Sie die Ladungsvorzeichen von A und B nach dem Trennen und Entfernen des Stabs voraus. Begründen Sie die Ladungsumverteilung und zeigen Sie mit einer Gesamtladungsbilanz, dass dabei keine elektrische Ladung erzeugt oder vernichtet wird. (6 BE)\n3. Kennzeichnen Sie für Material B nach dem Laden in Stellung 1 die Ladungsvorzeichen der Platten L und R. Erklären Sie den geladenen Kondensator als zwei voneinander isolierte Leiter mit getrennten entgegengesetzten Ladungen und begründen Sie, warum das Gesamtsystem im idealisierten Modell neutral bleiben kann. (5 BE)\n4. Sagen Sie für Stellung 2 die Ladungsvorzeichen beider Platten voraus. Vergleichen Sie die Ladungstrennung am Kondensator mit der an den beiden Kugeln und erklären Sie als Transfer, was bei einer leitenden Verbindung zwischen den entgegengesetzt geladenen Teilen geschieht. (5 BE)',
  solutionContent: 'Im neutralen Ausgangszustand tragen beide Kugeln gleich viele positive und negative Ladungsanteile. Der negativ geladene Stab stößt bewegliche Elektronen ab; sie verschieben sich von A nach B. Werden die Kugeln bei angenähertem Stab getrennt, bleibt A positiv und B negativ geladen. Die Beträge sind im idealisierten Gesamtsystem entgegengesetzt gleich, sodass die Gesamtladung weiterhin null ist: Ladung wurde umverteilt, nicht erzeugt. In Kondensatorstellung 1 ist L positiv und R negativ. Die isolierende Trennung verhindert einen unmittelbaren Ladungsausgleich; die Platten bilden zwei Leiter mit getrennten Gegenladungen, deren Summe im idealen Gesamtsystem null sein kann. Nach dem Umpolen in Stellung 2 ist L negativ und R positiv. Gemeinsam ist beiden Anordnungen die räumliche Trennung entgegengesetzter Ladungen bei erhaltener Gesamtladung; beim Kondensator wird die Trennung durch die Spannungsquelle auf zwei fest angeordneten Platten bewirkt. Eine leitende Verbindung ermöglicht den Ladungsausgleich, bis die Trennung abgebaut ist.',
  scoring: {
    maxPoints: 20,
    passingPoints: 12,
    steps: [
      { id: 'charge_capacitor_1', points: 4, description: 'Neutralen Ausgangszustand und Elektronenverschiebung von A nach B korrekt dargestellt' },
      { id: 'charge_capacitor_2', points: 6, description: 'Vorzeichen nach der Trennung vorhergesagt und Umverteilung mit Erhaltung der Gesamtladung erklärt' },
      { id: 'charge_capacitor_3', points: 5, description: 'Plattenvorzeichen angegeben und den Kondensator als zwei isolierte Leiter mit getrennten Gegenladungen bei neutralem Gesamtsystem gedeutet' },
      { id: 'charge_capacitor_4', points: 5, description: 'Polungswechsel, Modellvergleich und Ladungsausgleich bei leitender Verbindung erklärt' },
    ],
  },
} as const

const magnetismCurrentEffectsAssessmentSpec = {
  id: ids.magnetismCurrentEffectsAssessment,
  shortKey: 'canonical_physics_sek1_assessment_magnetic_poles_and_current_effects',
  title: 'Prüfungsaufgabe: Magnetpole und Wirkungen des elektrischen Stroms untersuchen',
  titleEn: 'Assessment Task: Investigate Magnetic Poles and Effects of Electric Current',
  description: 'Die lernende Person kann Anziehung und Abstoßung von Magnetpolen vorhersagen, Magnetisierung mit dem Elementarmagnetmodell erklären und magnetische, Licht-, Wärme- sowie chemische Wirkungen des elektrischen Stroms unterscheiden.',
  descriptionEn: 'The learner can predict attraction and repulsion between magnetic poles, explain magnetization using the elementary-magnet model, and distinguish magnetic, light, thermal, and chemical effects of electric current.',
  requires: [ids.magnets, ids.currentEffects],
  area: 'Magnetismus und Elektrizitätslehre',
  topicCode: 'CANONICAL.PHYSICS.SEK1.PRACTICE.MAGNETIC_POLES_AND_CURRENT_EFFECTS',
  processCompetencies: ['PK2_MODELLIEREN', 'PK4_KOMMUNIZIEREN'],
  guidingIdeas: ['LI_FELDER', 'LI_MATERIE', 'LI_ENERGIE', 'LI_TECHNIK'],
  taskContent: '**Kontext – Prüfstation eines Physik-Lernkoffers:**\n\n**Material A – Magnete:** Zwei Stabmagnete besitzen gekennzeichnete Nord- und Südpole. Zusätzlich wird ein zunächst unmagnetisierter Eisennagel mehrfach in derselben Richtung mit einem Magnetpol gestrichen. Danach zieht der Nagel Büroklammern an; nach mehreren kräftigen Erschütterungen wird die Wirkung schwächer.\n\n**Material B – Kleinspannungsstation, höchstens 6 V:** Dieselbe sichere Quelle wird nacheinander mit einer Lampe, einem Heizdraht, einer Spule mit Eisenkern und einer geeigneten Elektrolysezelle verbunden. Beobachtet werden Licht, Erwärmung, das Anziehen von Büroklammern sowie Gasbildung beziehungsweise eine Stoffabscheidung.\n\n**Aufgaben:**\n\n1. Sagen Sie die Wechselwirkung für einen Nordpol gegenüber einem Nordpol und für einen Nordpol gegenüber einem Südpol voraus. Erklären Sie außerdem, wie sich die Vorhersage ändert, wenn einer der beiden Magnete umgedreht wird. (4 BE)\n2. Erklären Sie die Magnetisierung des Nagels und die schwächere Wirkung nach den Erschütterungen mit dem Modell der Elementarmagnete. Unterscheiden Sie dabei den ungeordneten und den stärker ausgerichteten Zustand. (6 BE)\n3. Ordnen Sie die vier Beobachtungen aus Material B jeweils der Licht-, Wärme-, magnetischen und chemischen Wirkung des elektrischen Stroms zu und beschreiben Sie das jeweils beobachtbare Kennzeichen. (6 BE)\n4. Eine Spule mit Eisenkern und ein Permanentmagnet ziehen beide eine Büroklammer an. Planen Sie mithilfe des Schalters eine Unterscheidung und begründen Sie, was nach dem Ausschalten bei beiden Gegenständen zu erwarten ist. (4 BE)',
  solutionContent: 'Gleichnamige Magnetpole stoßen sich ab, ungleichnamige ziehen sich an; das Umdrehen eines Magneten vertauscht den zugewandten Pol und damit die Wechselwirkungsart. Im unmagnetisierten Nagel sind die magnetischen Bereiche im Elementarmagnetmodell weitgehend ungeordnet. Das Streichen richtet viele Bereiche bevorzugt aus; Erschütterungen können diese Ordnung teilweise wieder stören und die magnetische Wirkung schwächen. Die Lampe zeigt die Lichtwirkung, der Heizdraht die Wärmewirkung, die Spule mit Eisenkern die magnetische Wirkung und die Elektrolysezelle die chemische Wirkung des elektrischen Stroms. Nach dem Ausschalten verschwindet die stromabhängige Magnetwirkung der Spule weitgehend, während der Permanentmagnet seine Wirkung behält; der Schaltversuch unterscheidet deshalb beide Fälle.',
  scoring: {
    maxPoints: 20,
    passingPoints: 12,
    steps: [
      { id: 'magnet_current_1', points: 4, description: 'Polwechselwirkungen und Folge des Umdrehens korrekt vorhergesagt' },
      { id: 'magnet_current_2', points: 6, description: 'Magnetisierung und Abschwächung mit geordneten beziehungsweise ungeordneten Elementarmagneten erklärt' },
      { id: 'magnet_current_3', points: 6, description: 'Licht-, Wärme-, magnetische und chemische Stromwirkung vollständig zugeordnet und beschrieben' },
      { id: 'magnet_current_4', points: 4, description: 'Permanentmagnet und stromabhängige Spulenwirkung durch Ausschalten unterschieden' },
    ],
  },
} as const

const resistorNetworksAssessmentSpec = {
  id: ids.resistorNetworksAssessment,
  shortKey: 'canonical_physics_sek1_assessment_characteristics_and_resistor_networks',
  title: 'Prüfungsaufgabe: Kennlinien und Widerstandsnetze untersuchen',
  titleEn: 'Assessment Task: Investigate Characteristics and Resistor Networks',
  description: 'Die lernende Person kann eine Strom-Spannungs-Kennlinie experimentell untersuchen und begründet vorhersagen, wie Widerstandsänderungen Reihen- und Parallelschaltungen einschließlich geeigneter Grenzfälle beeinflussen.',
  descriptionEn: 'The learner can experimentally investigate a current-voltage characteristic and justify predictions of how resistance changes affect series and parallel circuits, including appropriate limiting cases.',
  requires: [ids.resistanceCharacteristics, '8f833b36-4126-52db-b210-79fb0023c7d9'],
  area: 'Elektrizitätslehre',
  topicCode: 'CANONICAL.PHYSICS.SEK1.PRACTICE.CHARACTERISTICS_AND_RESISTOR_NETWORKS',
  processCompetencies: ['PK1_EXPERIMENTIEREN', 'PK2_MODELLIEREN', 'PK3_MATHEMATISIEREN'],
  guidingIdeas: ['LI_MATERIE', 'LI_FELDER', 'LI_TECHNIK'],
  taskContent: '**Praktische Station mit höchstens 12 V:**\n\n1. Nehmen Sie für einen Widerstand mindestens fünf U-I-Wertepaare auf, zeichnen und interpretieren Sie die Kennlinie und bestimmen Sie im proportionalen Bereich den Widerstand. Untersuchen Sie anschließend qualitativ je eine Änderung von Material, Leiterlänge und Querschnitt. (8 BE)\n2. Zwei gleiche Widerstände liegen zunächst in Reihe an konstanter Quellenspannung. Sagen Sie voraus und begründen Sie, wie Gesamtwiderstand und Stromstärke reagieren, wenn ein Widerstand hinzugefügt, entfernt oder stark vergrößert wird. Prüfen Sie den Grenzfall eines sehr großen Widerstands. (6 BE)\n3. Wiederholen Sie die Vorhersage für zwei parallele Zweige: Entfernen Sie gedanklich einen Zweig und vergrößern Sie anschließend nur einen Zweigwiderstand. Unterscheiden Sie Gesamtstrom und Zweigströme und prüfen Sie den Grenzfall eines nahezu offenen Zweigs. (6 BE)',
  solutionContent: 'Die U-I-Kennlinie eines ohmschen Widerstands verläuft im untersuchten proportionalen Bereich geradlinig durch den Ursprung; dort gilt R = U/I. Größere Leiterlänge und typischerweise schlechter leitendes Material erhöhen, ein größerer Querschnitt verringert den Widerstand. In Reihe erhöhen zusätzliche oder größere Widerstände den Gesamtwiderstand und verringern den Strom; beim sehr großen Widerstand geht der Strom gegen null. Das Entfernen eines Reihenwiderstands wirkt umgekehrt. In Parallelschaltung erhöht das Entfernen eines Zweigs den Gesamtwiderstand und senkt den Gesamtstrom; bei ideal konstanter Spannung bleibt der Strom des unveränderten Zweigs gleich. Wird nur ein Zweigwiderstand groß, sinken dessen Strom und der Gesamtstrom; der Grenzfall entspricht einem nahezu offenen Zweig.',
  scoring: {
    maxPoints: 20,
    passingPoints: 12,
    steps: [
      { id: 'characteristic_network_1', points: 8, description: 'Eigene Kennlinie aufgenommen, Widerstand bestimmt und drei Einflussgrößen untersucht' },
      { id: 'characteristic_network_2', points: 6, description: 'Änderungen in der Reihenschaltung einschließlich Grenzfall begründet' },
      { id: 'characteristic_network_3', points: 6, description: 'Gesamt- und Zweigströme in der Parallelschaltung einschließlich Grenzfall unterschieden' },
    ],
  },
} as const

const nodeLoopBalancesAssessmentSpec = {
  id: ids.nodeLoopBalancesAssessment,
  shortKey: 'canonical_physics_sek1_assessment_node_and_loop_balances',
  title: 'Prüfungsaufgabe: Strom- und Spannungsbilanzen in einem Versorgungsnetz begründen',
  titleEn: 'Assessment Task: Justify Current and Voltage Balances in a Supply Network',
  description: 'Die lernende Person kann an einem verzweigten Gleichspannungsnetz Strombilanzen mit Ladungserhaltung und Spannungsbilanzen mit der übertragenen Energie pro Ladung aufstellen, prüfen und begründen.',
  descriptionEn: 'The learner can formulate, check, and justify current balances using charge conservation and voltage balances using transferred energy per unit charge in a branched DC network.',
  requires: ['8a84de16-2fde-58ec-827a-f803e2ce8564', '267170bd-f880-56a7-9719-ffb9751872c5'],
  area: 'Elektrische Energie und Schaltungen',
  topicCode: 'CANONICAL.PHYSICS.SEK1.PRACTICE.NODE_AND_LOOP_BALANCES',
  processCompetencies: ['PK2_MODELLIEREN', 'PK3_MATHEMATISIEREN', 'PK4_KOMMUNIZIEREN'],
  guidingIdeas: ['LI_FELDER', 'LI_ENERGIE', 'LI_TECHNIK'],
  taskContent: '**Material – mobile 12-V-Gleichspannungsbox:** Eine Lampe und ein Lüfter liegen in zwei parallelen Zweigen. Vor der Verzweigung werden 2,5 A gemessen, im Lampenzweig 1,5 A. Im Lüfterzweig liegen zusätzlich ein Bauteil mit 2,0 V Spannungsabfall und der Lüfter mit zunächst unbekannter Spannung. Ideale Leitungen werden angenommen.\n\n1. Legen Sie Stromrichtungen am Verzweigungs- und Zusammenführungsknoten fest, bestimmen Sie den Lüfterstrom mit 2,5 A = 1,5 A + I_L und prüfen Sie die Bilanz an beiden Knoten. Begründen Sie die Knotenregel mit Ladungserhaltung unter der Bedingung, dass sich im stationären Zustand an keinem Knoten Ladung ansammelt. (7 BE)\n2. Legen Sie für den Lüfterzweig eine Umlaufrichtung fest, stellen Sie die vorzeichenrichtige Bilanz +12 V − 2 V − U_F = 0 auf und bestimmen Sie die Lüfterspannung. Formulieren Sie außerdem die entsprechende Bilanz für den Lampenzweig. (6 BE)\n3. Begründen Sie die Maschenregel mit der von der Quelle zugeführten und an Bauteile übertragenen Energie pro Ladung. Erklären Sie, warum eine umgekehrte Umlaufrichtung zwar alle Vorzeichen ändert, aber dieselbe physikalische Bilanz liefert. (4 BE)\n4. Ein Protokoll nennt vor dem Knoten 2,4 A und nach dem Knoten 1,5 A sowie 1,1 A. Prüfen Sie die Werte mithilfe der Knotenbilanz und benennen Sie eine fachlich mögliche Ursache der Abweichung. (3 BE)',
  solutionContent: 'An beiden Knoten gilt bei den festgelegten Stromrichtungen 2,5 A = 1,5 A + I_L, also I_L = 1,0 A. Im stationären Zustand darf sich am Knoten keine Ladung ansammeln; deshalb ist der zufließende Gesamtstrom gleich der Summe der abfließenden Zweigströme. Für den Lüfterzweig gilt +12 V − 2 V − U_F = 0 und damit U_F = 10 V. Im Lampenzweig ist die Summe aus Spannungsanstieg an der Quelle und Spannungsabfall an der Lampe ebenfalls null. Die Quelle überträgt pro Ladung dieselbe Energie, die die Bauteile zusammen aufnehmen; daher ist die Umlaufsumme der Spannungen null. Bei umgekehrter Umlaufrichtung wechseln alle Vorzeichen, nicht aber die Gleichheit. Die protokollierten Ströme sind inkonsistent, denn 1,5 A + 1,1 A = 2,6 A statt 2,4 A; mögliche Ursachen sind Messunsicherheit, ein zusätzlicher nicht erfasster Strompfad oder – falls die stationäre Annahme verletzt ist – eine vorübergehende Ladungsänderung am Knoten.',
  scoring: {
    maxPoints: 20,
    passingPoints: 12,
    steps: [
      { id: 'node_loop_1', points: 7, description: 'Stromrichtungen, unbekannten Zweigstrom und beide Knotenbilanzen mit Ladungserhaltung begründet' },
      { id: 'node_loop_2', points: 6, description: 'Vorzeichenrichtige Maschenbilanzen aufgestellt und Lüfterspannung bestimmt' },
      { id: 'node_loop_3', points: 4, description: 'Maschenregel mit Energie pro Ladung und Richtungswechsel erklärt' },
      { id: 'node_loop_4', points: 3, description: 'Inkonsistente Messwerte mit Knotenbilanz erkannt und fachlich eingeordnet' },
    ],
  },
} as const

const localAssessmentSpecs = [
  electrostaticsAssessmentSpec,
  magnetismCurrentEffectsAssessmentSpec,
  resistorNetworksAssessmentSpec,
  nodeLoopBalancesAssessmentSpec,
] as const

const deterministicPhysicsGoalId = (shortKey: string): string => {
  const digest = createHash('sha1').update(`DE-GYM-CANONICAL-PHYSICS:${shortKey}`).digest('hex')
  return `${digest.slice(0, 8)}-${digest.slice(8, 12)}-5${digest.slice(13, 16)}-8${digest.slice(17, 20)}-${digest.slice(20, 32)}`
}

for (const spec of localAssessmentSpecs) if (deterministicPhysicsGoalId(spec.shortKey) !== spec.id) {
  throw new Error(`Deterministic Physics assessment ID mismatch for ${spec.shortKey}`)
}

const revisedLeafReview = new Map<string, { atomicityReason: string; memoryReason: string }>([
  [ids.magnets, {
    atomicityReason: 'Anziehung und Abstoßung von Magnetpolen werden mit dem Elementarmagnetmodell als eine zusammenhängende qualitative Erklärungskompetenz geprüft.',
    memoryReason: 'Das Ziel verlangt die Anwendung des Elementarmagnetmodells auf einfache Phänomene; eine isolierte Merkkarte ist dafür nicht notwendig.',
  }],
  [ids.currentMeasurement, {
    atomicityReason: 'Reihenschaltung, Messbereichswahl, Ablesen und Einheitenangabe sind notwendige Bestandteile einer einzigen fachgerechten Strommessroutine.',
    memoryReason: 'Die fachgerechte Strommessung muss in konkreten Schaltungen ausgeführt und begründet werden; eine eigene Memorycard ersetzt diese Messpraxis nicht.',
  }],
  [ids.relation, {
    atomicityReason: 'Das Erheben zusammengehöriger Strom-Spannungs-Messwertpaare und ihre qualitative Deutung bilden eine einzelne experimentelle Auswertungskompetenz.',
    memoryReason: 'Das Ziel wird durch Messplanung, Messwertpaare und deren Deutung aufgebaut; eine isolierte Formel- oder Begriffskarte ist nicht erforderlich.',
  }],
])

const viewPaths = [
  'curricula/DE/Gymnasium/composition-views/physik/de-bw-gk.view.json',
  'curricula/DE/Gymnasium/composition-views/physik/de-bw-lk.view.json',
  'curricula/DE/Gymnasium/composition-views/physik/de-by-gk.view.json',
  'curricula/DE/Gymnasium/composition-views/physik/de-by-lk.view.json',
  'curricula/DE/Gymnasium/composition-views/physik/de-by-sekii-gk.view.json',
  'curricula/DE/Gymnasium/composition-views/physik/de-by-sekii-lk.view.json',
] as const

const physicsViewRoot = 'curricula/DE/Gymnasium/composition-views/physik'
const overlapStructureId = 'physics-seki-voltage-circuits-safety-batch-011'
const genericOverlapViewPaths = readdirSync(resolve(repoRoot, physicsViewRoot))
  .filter((fileName) => fileName.endsWith('.view.json'))
  .map((fileName) => `${physicsViewRoot}/${fileName}`)
  .filter((path) => !viewPaths.includes(path as typeof viewPaths[number]))
  .filter((path) => {
    const content = readFileSync(resolve(repoRoot, path), 'utf8')
    return content.includes(ids.voltageArea) || content.includes(overlapStructureId)
  })

const readJson = (path: string): JsonRecord => JSON.parse(readFileSync(resolve(repoRoot, path), 'utf8'))
const writeJson = (path: string, value: unknown): void => writeFileSync(resolve(repoRoot, path), `${JSON.stringify(value, null, 2)}\n`)
const readJsonl = (path: string): JsonRecord[] => readFileSync(resolve(repoRoot, path), 'utf8')
  .split(/\r?\n/u).filter((line) => line.trim()).map((line) => JSON.parse(line))
const writeJsonl = (path: string, values: JsonRecord[]): void => writeFileSync(
  resolve(repoRoot, path), `${values.map((value) => JSON.stringify(value)).join('\n')}\n`,
)
const normalizeText = (value: unknown): string => String(value ?? '').normalize('NFKC').replace(/\s+/gu, ' ').trim()
const unique = <T>(values: T[]): T[] => [...new Set(values)]

const stableJson = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (value && typeof value === 'object') return `{${Object.entries(value as JsonRecord)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, nested]) => `${JSON.stringify(key)}:${stableJson(nested)}`).join(',')}}`
  return JSON.stringify(value)
}
const digest = (value: unknown): string => `sha256:${createHash('sha256').update(stableJson(value)).digest('hex')}`
const reviewFingerprint = (goal: JsonRecord, ruleVersion: string): string => digest({
  ruleVersion,
  goalId: goal.id,
  shortKey: goal.shortKey ?? '',
  title: normalizeText(goal.title),
  titleEn: normalizeText(goal.titleEn),
  description: normalizeText(goal.description),
  descriptionEn: normalizeText(goal.descriptionEn),
  phase: normalizeText(goal.dimensionTags?.phase),
  area: normalizeText(goal.dimensionTags?.area),
  topicCode: normalizeText(goal.dimensionTags?.topicCode),
  nodeKind: normalizeText(goal.nodeKind),
})

const replaceRequired = (values: string[], oldId: string, replacements: string[], label: string): string[] => {
  const oldCount = values.filter((value) => value === oldId).length
  if (oldCount === 0) {
    if (replacements.every((id) => values.includes(id))) return unique(values)
    throw new Error(`${label}: neither before nor after state for ${oldId}`)
  }
  if (oldCount !== 1) throw new Error(`${label}: duplicate ${oldId}`)
  return unique(values.flatMap((value) => value === oldId ? replacements : [value]))
}

const updateVisualizationText = (goal: JsonRecord): void => {
  for (const link of goal.resourceLinks ?? []) {
    if (link.type !== 'goal-visualization' && link.resourceType !== 'goal-visualization') continue
    link.title = `Visualisierung: ${goal.title}`
    link.description = `Visualisierung zum Lernziel: ${goal.title}.`
    link.altText = `Didaktische Visualisierung zum Lernziel "${goal.title}". ${goal.description}`
  }
}

function buildCanonical(): JsonRecord {
  const landscape = readJson(paths.canonical)
  const goals = landscape.goals as JsonRecord[]
  const byId = new Map(goals.map((goal) => [goal.id, goal]))
  if (byId.size !== goals.length) throw new Error('Duplicate canonical goal IDs')
  const goal = (id: string): JsonRecord => {
    const value = byId.get(id)
    if (!value) throw new Error(`Missing canonical goal ${id}`)
    return value
  }

  Object.assign(goal(ids.magnets), {
    description: 'Die lernende Person kann Anziehung und Abstoßung zwischen Magnetpolen qualitativ beschreiben und einfache magnetische Phänomene mit dem Modell der Elementarmagnete erklären.',
    descriptionEn: 'The learner can qualitatively describe attraction and repulsion between magnetic poles and explain simple magnetic phenomena using the elementary-magnet model.',
    requires: [ids.motivation],
  })

  const circuitsCluster = goal(ids.circuitsCluster)
  Object.assign(circuitsCluster, {
    title: 'Leitfähigkeit, Stromkreise und Schaltpläne',
    titleEn: 'Conductivity, circuits, and circuit diagrams',
    description: 'Bündelt das Prüfen elektrischer Leitfähigkeit, den Aufbau offener und geschlossener Stromkreise und die Übersetzung zwischen realem Aufbau und Schaltplan.',
    descriptionEn: 'Bundles testing electrical conductivity, building open and closed circuits, and translating between a physical setup and a circuit diagram.',
    type: 'cluster',
    weight: 3,
    contains: [ids.openClosed, ids.diagramTranslation, ids.conductivity],
    requires: [],
  })
  delete circuitsCluster.semanticAtomic

  const electrostaticsCluster = goal(ids.electrostaticsCluster)
  Object.assign(electrostaticsCluster, {
    title: 'Statische Elektrizität, Spannung und Kondensatoren',
    titleEn: 'Static electricity, voltage, and capacitors',
    description: 'Bündelt Kompetenzen zur elektrostatischen Ladungstrennung, zur Spannungsmessung in einfachen Stromkreisen und zur Deutung des Kondensators als System getrennter Gegenladungen.',
    descriptionEn: 'Bundles competencies in electrostatic charge separation, measuring voltage in simple circuits, and interpreting a capacitor as a system of separated opposite charges.',
    type: 'cluster',
    weight: 3,
    contains: [ids.chargeSeparation, ids.voltageMeasurement, ids.capacitor],
    requires: [],
  })
  delete electrostaticsCluster.semanticAtomic

  const measurementCluster = goal(ids.measurementCluster)
  Object.assign(measurementCluster, {
    description: 'Bündelt das fachgerechte Messen von Stromstärke und Spannung in einfachen Stromkreisen.',
    descriptionEn: 'Bundles the correct measurement of current and voltage in simple circuits.',
    type: 'cluster',
    weight: 2,
    contains: [ids.currentMeasurement, ids.voltageMeasurement],
    requires: [],
  })
  delete measurementCluster.semanticAtomic

  for (const spec of childSpecs) {
    const parent = goal(spec.parentId)
    const expected: JsonRecord = {
      id: spec.id,
      shortKey: spec.shortKey,
      title: spec.title,
      titleEn: spec.titleEn,
      description: spec.description,
      descriptionEn: spec.descriptionEn,
      weight: 1,
      tags: structuredClone(parent.tags),
      contains: [],
      requires: [...spec.requires],
      dimensionTags: {
        framework: 'canonical-gymnasium-physics',
        demandLevel: spec.demandLevel,
        processCompetencies: [...spec.processCompetencies],
        guidingIdeas: [...spec.guidingIdeas],
        phase: 'GLOBAL',
        area: 'Elektrizität',
        topicCode: spec.topicCode,
      },
      applicability: structuredClone(parent.applicability),
      type: 'atomic',
      semanticAtomic: true,
    }
    const existing = byId.get(spec.id)
    if (existing && (existing.resourceLinks ?? []).length > 0) {
      throw new Error(`New split child ${spec.id} unexpectedly has a visualization; refusing to overwrite it`)
    }
    if (existing) {
      for (const key of Object.keys(existing)) delete existing[key]
      Object.assign(existing, expected)
    } else {
      byId.set(spec.id, expected)
    }
  }

  for (const spec of childSpecs) {
    const index = goals.findIndex((candidate) => candidate.id === spec.id)
    if (index >= 0) goals.splice(index, 1)
  }
  const circuitIndex = goals.findIndex((candidate) => candidate.id === ids.circuitsCluster)
  goals.splice(circuitIndex + 1, 0, goal(ids.openClosed), goal(ids.diagramTranslation))
  const electrostaticsIndex = goals.findIndex((candidate) => candidate.id === ids.electrostaticsCluster)
  goals.splice(electrostaticsIndex + 1, 0, goal(ids.chargeSeparation), goal(ids.voltageMeasurement), goal(ids.capacitor))

  goal(ids.currentEffects).requires = [ids.openClosed]
  Object.assign(goal(ids.currentMeasurement), {
    description: 'Die lernende Person kann ein Amperemeter in einem einfachen Stromkreis in Reihe anschließen, einen geeigneten Messbereich wählen und die Stromstärke bestimmen sowie den Messwert mit Einheit angeben.',
    descriptionEn: 'The learner can connect an ammeter in series in a simple circuit, select a suitable measurement range, determine the current, and report the reading with its unit.',
    requires: [ids.diagramTranslation],
  })
  goal(ids.conductivity).requires = [ids.openClosed]
  Object.assign(goal(ids.relation), {
    description: 'Die lernende Person kann die Stromstärke durch und die Spannung an einem einfachen Bauteil messen und anhand zusammengehöriger Messwertpaare bei unveränderten Bedingungen ihren qualitativen Zusammenhang erläutern.',
    descriptionEn: 'The learner can measure the current through and voltage across a simple component and use paired measurements obtained under unchanged conditions to explain their qualitative relationship.',
    requires: [ids.currentMeasurement, ids.voltageMeasurement],
  })

  goal(ids.resistanceCharacteristics).requires = (goal(ids.resistanceCharacteristics).requires as string[])
    .filter((id) => id !== ids.measurementCluster)
  goal(ids.solarModules).requires = replaceRequired(
    goal(ids.solarModules).requires,
    ids.measurementCluster,
    [ids.currentMeasurement, ids.voltageMeasurement],
    `${ids.solarModules}.requires`,
  )
  goal(ids.powerBalance).requires = replaceRequired(
    goal(ids.powerBalance).requires,
    ids.measurementCluster,
    [ids.currentMeasurement, ids.voltageMeasurement],
    `${ids.powerBalance}.requires`,
  )
  goal(ids.nerveModel).requires = replaceRequired(
    goal(ids.nerveModel).requires,
    ids.measurementCluster,
    [ids.voltageMeasurement],
    `${ids.nerveModel}.requires`,
  )
  goal(ids.assessment).requires = [ids.currentMeasurement, ids.voltageMeasurement]
  goal(ids.assessment).examData.coveredGoalIds = [ids.currentMeasurement, ids.voltageMeasurement]

  const setJurisdiction = (goalId: string, jurisdiction: string, included: boolean): void => {
    const jurisdictions = new Set<string>(goal(goalId).applicability?.jurisdiction ?? [])
    if (included) jurisdictions.add(jurisdiction)
    else jurisdictions.delete(jurisdiction)
    goal(goalId).applicability = {
      ...(goal(goalId).applicability ?? {}),
      jurisdiction: [...jurisdictions],
    }
  }
  for (const goalId of [
    ids.magnets, ids.chargeSeparation, ids.capacitor,
    ids.conductivity, ids.conductivityAssessment,
  ]) setJurisdiction(goalId, 'DE-BY', false)
  for (const goalId of [ids.currentMeasurement, ids.assessment]) {
    setJurisdiction(goalId, 'DE-BY', true)
  }

  const practiceCluster = goal(ids.practiceCluster)
  for (const spec of localAssessmentSpecs) {
    const prerequisiteJurisdictionSets = spec.requires.map((requiredGoalId) => {
      const jurisdictions = goal(requiredGoalId).applicability?.jurisdiction
      if (!Array.isArray(jurisdictions) || jurisdictions.length === 0) {
        throw new Error(`${spec.id} prerequisite ${requiredGoalId} has no jurisdiction applicability`)
      }
      return new Set(jurisdictions as string[])
    })
    const assessmentJurisdictions = [...prerequisiteJurisdictionSets[0]]
      .filter((jurisdiction) => prerequisiteJurisdictionSets.every((values) => values.has(jurisdiction)))
      .sort()
    if (assessmentJurisdictions.length === 0) {
      throw new Error(`${spec.id} has no shared prerequisite jurisdiction applicability`)
    }
    const materializedAssessment: JsonRecord = {
      id: spec.id,
      shortKey: spec.shortKey,
      title: spec.title,
      titleEn: spec.titleEn,
      description: spec.description,
      descriptionEn: spec.descriptionEn,
      weight: 1,
      tags: ['GK', 'LK', 'Practice', 'Assessment', 'canonical', 'SekI'],
      dimensionTags: {
        framework: 'canonical-gymnasium-physics',
        demandLevel: 'AB3',
        processCompetencies: [...spec.processCompetencies],
        guidingIdeas: [...spec.guidingIdeas],
        phase: 'GLOBAL',
        area: spec.area,
        topicCode: spec.topicCode,
      },
      requires: [...spec.requires],
      contains: [],
      examples: [],
      applicability: { jurisdiction: assessmentJurisdictions },
      extendedData: {
        applicabilityFromRequires: true,
        applicabilityMappingInheritance: 'boundary',
      },
      type: 'atomic',
      examData: {
        reviewStatus: 'released',
        coveredGoalIds: [...spec.requires],
        coveredStrands: [...spec.guidingIdeas],
        demandLevels: ['AB1', 'AB2', 'AB3'],
        taskContent: spec.taskContent,
        solutionContent: spec.solutionContent,
        scoring: structuredClone(spec.scoring),
      },
    }
    const existing = byId.get(spec.id)
    if (existing && existing.shortKey !== spec.shortKey) throw new Error(`Assessment ID collision for ${spec.id}`)
    if (existing) {
      for (const key of Object.keys(existing)) delete existing[key]
      Object.assign(existing, materializedAssessment)
    } else {
      const memberIndices = (practiceCluster.contains as string[])
        .map((goalId) => goals.findIndex((candidate) => candidate.id === goalId))
        .filter((index) => index >= 0)
      const insertionIndex = memberIndices.length > 0 ? Math.max(...memberIndices) + 1 : goals.length
      goals.splice(insertionIndex, 0, materializedAssessment)
      byId.set(spec.id, materializedAssessment)
    }
    practiceCluster.contains = unique([...(practiceCluster.contains as string[]), spec.id])
  }

  const capstone = goal(ids.compatibilityCapstone)
  capstone.requires = (capstone.requires as string[]).filter((id) => !splitParents.has(id))
  capstone.examData.coveredGoalIds = (capstone.examData.coveredGoalIds as string[])
    .filter((id: string) => !splitParents.has(id))

  for (const changedId of [
    ids.magnets, ids.circuitsCluster, ids.currentMeasurement, ids.electrostaticsCluster,
    ids.relation, ids.measurementCluster,
  ]) updateVisualizationText(goal(changedId))

  for (const candidate of goals) {
    const staleRequires = (candidate.requires ?? []).filter((id: string) => splitParents.has(id))
    const staleCovered = (candidate.examData?.coveredGoalIds ?? []).filter((id: string) => splitParents.has(id))
    if (staleRequires.length || staleCovered.length) {
      throw new Error(`Unadjudicated canonical split-parent reference on ${candidate.id}: ${[...staleRequires, ...staleCovered].join(',')}`)
    }
  }

  const parentsByChild = new Map<string, string[]>()
  for (const candidate of goals) for (const childId of candidate.contains ?? []) {
    parentsByChild.set(childId, [...(parentsByChild.get(childId) ?? []), candidate.id])
  }
  const affected = new Set<string>([ids.circuitsCluster, ids.electrostaticsCluster, ids.measurementCluster])
  const queue = [...affected].flatMap((id) => parentsByChild.get(id) ?? [])
  while (queue.length) {
    const id = queue.shift()!
    if (affected.has(id)) continue
    affected.add(id)
    queue.push(...(parentsByChild.get(id) ?? []))
  }
  affected.delete(ids.subjectRoot)
  const atomicDescendants = (rootId: string): Set<string> => {
    const result = new Set<string>()
    const visiting = new Set<string>()
    const visit = (id: string): void => {
      if (visiting.has(id)) throw new Error(`Contains cycle at ${id}`)
      const candidate = goal(id)
      if ((candidate.contains ?? []).length === 0) { result.add(id); return }
      visiting.add(id)
      for (const childId of candidate.contains) visit(childId)
      visiting.delete(id)
    }
    visit(rootId)
    return result
  }
  for (const id of affected) goal(id).weight = atomicDescendants(id).size
  goal(ids.subjectRoot).weight = 1.2
  if (goal(ids.magnetismArea).weight !== 6 || goal(ids.voltageArea).weight !== 14) {
    throw new Error(`Unexpected recursive weights ${goal(ids.magnetismArea).weight}/${goal(ids.voltageArea).weight}`)
  }

  landscape.goals = goals
  return landscape
}

const semanticChangedIds = [
  ids.magnets, ids.circuitsCluster, ids.openClosed, ids.diagramTranslation, ids.conductivity,
  ids.currentEffects, ids.currentMeasurement, ids.electrostaticsCluster, ids.chargeSeparation,
  ids.voltageMeasurement, ids.capacitor, ids.relation, ids.measurementCluster,
  ids.resistanceCharacteristics, ids.solarModules, ids.powerBalance, ids.nerveModel,
  ids.assessment, ...localAssessmentSpecs.map((spec) => spec.id), ids.practiceCluster, ids.compatibilityCapstone,
]

function buildSemanticKinds(landscape: JsonRecord): JsonRecord {
  const ledger = readJson(paths.semanticKinds)
  const goalById = new Map((landscape.goals as JsonRecord[]).map((goal) => [goal.id, goal]))
  const decisions = new Map((ledger.decisions as JsonRecord[]).map((decision) => [decision.goalId, decision]))
  for (const goalId of semanticChangedIds) {
    const canonicalGoal = goalById.get(goalId)
    if (!canonicalGoal) throw new Error(`Missing semantic-kind goal ${goalId}`)
    const existing = decisions.get(goalId)
    const semanticKind = localAssessmentSpecs.some((spec) => spec.id === goalId)
      ? 'practiceAssessment'
      : splitParents.has(goalId)
      ? 'curricularArea'
      : childSpecs.some((spec) => spec.id === goalId)
        ? 'curricularAtomic'
        : existing?.semanticKind
    if (!semanticKind) throw new Error(`Missing semantic-kind decision ${goalId}`)
    decisions.set(goalId, {
      goalId,
      sourceFingerprint: fingerprintSemanticKindSourceGoal(canonicalGoal),
      semanticKind,
      decisionStatus: 'authoritative',
      decisionBasis: localAssessmentSpecs.some((spec) => spec.id === goalId)
        ? 'reviewed-current-post-split-practice-assessment'
        : splitParents.has(goalId)
        ? 'reviewed-current-structural-split-curricular-area'
        : childSpecs.some((spec) => spec.id === goalId)
          ? 'reviewed-current-structural-split-curricular-atomic'
          : existing.decisionBasis,
    })
  }
  ledger.decisions = [...decisions.values()].sort((left, right) => left.goalId.localeCompare(right.goalId))
  const counts: Record<string, number> = {}
  for (const decision of ledger.decisions) counts[decision.semanticKind] = (counts[decision.semanticKind] ?? 0) + 1
  const order = ['curricularAtomic', 'curricularArea', 'practiceAssessment', 'programStructure', 'memory', 'runtimeSupport', 'orientation']
  ledger.counts = Object.fromEntries(order.filter((key) => counts[key] !== undefined).map((key) => [key, counts[key]]))
  ledger.counts.total = ledger.decisions.length
  if (ledger.counts.curricularAtomic !== 441) throw new Error(`Unexpected curricularAtomic count ${ledger.counts.curricularAtomic}`)
  if (ledger.counts.practiceAssessment !== 130 || ledger.counts.total !== 669) {
    throw new Error(`Unexpected practiceAssessment/total counts ${ledger.counts.practiceAssessment}/${ledger.counts.total}`)
  }
  return ledger
}

function buildLeafReviewLedger(landscape: JsonRecord, path: string, ruleVersion: string): JsonRecord[] {
  const records = readJsonl(path)
  const goalById = new Map((landscape.goals as JsonRecord[]).map((goal) => [goal.id, goal]))
  const replacementIds = new Set([...childSpecs.map((spec) => spec.id), ...revisedLeafReview.keys()])
  const makeRecord = (goalId: string): JsonRecord => {
    const canonicalGoal = goalById.get(goalId)
    if (!canonicalGoal) throw new Error(`Missing review-ledger goal ${goalId}`)
    const spec = childSpecs.find((candidate) => candidate.id === goalId)
    const reasons = spec ?? revisedLeafReview.get(goalId)
    if (!reasons) throw new Error(`Missing individualized review reasons ${goalId}`)
    const base = {
      schemaVersion: 1,
      reviewId: 'canonical-physics-full',
      ruleVersion,
      landscapeId: landscape.landscapeId,
      goalId,
      fingerprint: reviewFingerprint(canonicalGoal, ruleVersion),
      reviewedAt: '2026-08-27',
      reviewer: 'codex-physics-batch-011-structural-synthesis',
    }
    return ruleVersion === 'semantic-atomicity-v1'
      ? { ...base, status: 'atomic', semanticAtomic: true, reason: reasons.atomicityReason, suggestedSplit: [] }
      : { ...base, status: 'no_memory_needed', memoryUseful: false, reason: reasons.memoryReason }
  }
  const result: JsonRecord[] = []
  const inserted = new Set<string>()
  for (const record of records) {
    if (splitParents.has(record.goalId)) {
      const relevant = childSpecs.filter((spec) => spec.parentId === record.goalId)
      for (const spec of relevant) if (!inserted.has(spec.id)) {
        result.push(makeRecord(spec.id)); inserted.add(spec.id)
      }
      continue
    }
    if (replacementIds.has(record.goalId)) {
      if (!inserted.has(record.goalId)) { result.push(makeRecord(record.goalId)); inserted.add(record.goalId) }
      continue
    }
    result.push(record)
  }
  for (const goalId of replacementIds) if (!inserted.has(goalId)) result.push(makeRecord(goalId))
  return result
}

type MappingRule = {
  sourceGoalId: string
  add?: Array<{ targetGoalId: string; matchType: MatchType }>
  remove?: string[]
}

const targetLabels = new Map<string, string>([
  [ids.openClosed, 'offene und geschlossene Stromkreise aufbauen und deuten'],
  [ids.diagramTranslation, 'zwischen realem Stromkreis und Schaltplan übersetzen'],
  [ids.conductivity, 'elektrische Leitfähigkeit untersuchen'],
  [ids.currentMeasurement, 'Stromstärke fachgerecht messen'],
  [ids.chargeSeparation, 'elektrostatische Ladungstrennung erklären'],
  [ids.voltageMeasurement, 'Spannung fachgerecht messen'],
  [ids.capacitor, 'den Kondensator als System getrennter Ladungen deuten'],
])

function buildReviewedMapping(path: string, rules: MappingRule[]): JsonRecord {
  const review = readJson(path)
  const ruleBySource = new Map(rules.map((rule) => [rule.sourceGoalId, rule]))
  const globalRemove = splitParents
  const decisionBySource = new Map((review.decisions as JsonRecord[]).map((decision) => [decision.sourceGoalId, decision]))
  const mappingSources = unique((review.mappings as JsonRecord[]).map((mapping) => mapping.legacyGoalId))
  for (const sourceGoalId of ruleBySource.keys()) if (!decisionBySource.has(sourceGoalId)) {
    throw new Error(`${path}: missing adjudicated source decision ${sourceGoalId}`)
  }

  const nextMappings: JsonRecord[] = []
  for (const sourceGoalId of mappingSources) {
    const rule = ruleBySource.get(sourceGoalId)
    const remove = new Set([...(rule?.remove ?? []), ...globalRemove])
    const existing = (review.mappings as JsonRecord[]).filter((mapping) => mapping.legacyGoalId === sourceGoalId)
      .filter((mapping) => !remove.has(mapping.canonicalGoalId))
    for (const addition of rule?.add ?? []) {
      const found = existing.find((mapping) => mapping.canonicalGoalId === addition.targetGoalId)
      if (found) found.matchType = addition.matchType
      else existing.push({
        legacyGoalId: sourceGoalId,
        canonicalGoalId: addition.targetGoalId,
        matchType: addition.matchType,
        reviewDecisionId: sourceGoalId,
      })
    }
    nextMappings.push(...existing)
  }
  for (const [sourceGoalId, rule] of ruleBySource) if (!mappingSources.includes(sourceGoalId)) {
    for (const addition of rule.add ?? []) nextMappings.push({
      legacyGoalId: sourceGoalId,
      canonicalGoalId: addition.targetGoalId,
      matchType: addition.matchType,
      reviewDecisionId: sourceGoalId,
    })
  }

  const mappingTargetsBySource = new Map<string, string[]>()
  for (const mapping of nextMappings) mappingTargetsBySource.set(
    mapping.legacyGoalId,
    [...(mappingTargetsBySource.get(mapping.legacyGoalId) ?? []), mapping.canonicalGoalId],
  )
  for (const decision of review.decisions as JsonRecord[]) {
    const mappedTargets = mappingTargetsBySource.get(decision.sourceGoalId) ?? []
    const changed = stableJson(decision.canonicalGoalIds ?? []) !== stableJson(mappedTargets)
    decision.canonicalGoalIds = mappedTargets
    if (decision.canonicalGoalIds.length === 0) {
      throw new Error(`${path}: adjudication would leave ${decision.sourceGoalId} without any canonical target`)
    }
    if (changed) {
      const rule = ruleBySource.get(decision.sourceGoalId)
      const labels = (rule?.add ?? []).map((entry) => targetLabels.get(entry.targetGoalId) ?? entry.targetGoalId)
      decision.rationale = labels.length > 0
        ? `Batch-011-Fachreview: Das frühere Sammelziel wurde auf atomare Teilkompetenzen entflochten. Direkt gestützt werden ${labels.join('; ')}; weitere bereits geprüfte Zuordnungen bleiben unverändert.`
        : 'Batch-011-Fachreview: Das frühere Sammelziel war für diesen Source-Aspekt fachlich zu breit und wurde entfernt; keine der neuen Teilkompetenzen wird dadurch hinreichend direkt gestützt. Weitere bereits geprüfte Zuordnungen bleiben unverändert.'
      decision.reviewedAt = '2026-08-27'
      decision.reviewer = 'codex-physics-batch-011-structural-synthesis'
    }
  }
  review.mappings = nextMappings
  const staleMappings = nextMappings.filter((mapping) => splitParents.has(mapping.canonicalGoalId))
  const staleDecisions = (review.decisions as JsonRecord[]).filter((decision) =>
    (decision.canonicalGoalIds ?? []).some((id: string) => splitParents.has(id)))
  if (staleMappings.length || staleDecisions.length) throw new Error(`${path}: split-parent source mappings remain`)
  return review
}

function buildLegacyMapping(): JsonRecord {
  const mapping = readJson(paths.heLegacy)
  const specs = new Map<string, Array<{ targetGoalId: string; matchType: MatchType }>>([
    ['303d4fb2-00c8-41ce-99b4-4adac0105897', [
      { targetGoalId: ids.openClosed, matchType: 'partial' },
      { targetGoalId: ids.diagramTranslation, matchType: 'partial' },
      { targetGoalId: ids.conductivity, matchType: 'partial' },
    ]],
    ['1e84b1e2-6802-45d3-9cac-f124cdcc39d8', [
      { targetGoalId: ids.chargeSeparation, matchType: 'partial' },
      { targetGoalId: ids.voltageMeasurement, matchType: 'partial' },
      { targetGoalId: ids.capacitor, matchType: 'partial' },
    ]],
  ])
  const result: JsonRecord[] = []
  const seen = new Set<string>()
  for (const row of mapping.mappings as JsonRecord[]) {
    const desired = specs.get(row.legacyGoalId) ?? []
    if (splitParents.has(row.canonicalGoalId) || desired.some((entry) => entry.targetGoalId === row.canonicalGoalId)) {
      if (!seen.has(row.legacyGoalId)) {
        result.push(...desired.map((entry) => ({
          legacyGoalId: row.legacyGoalId,
          canonicalGoalId: entry.targetGoalId,
          matchType: entry.matchType,
        })))
        seen.add(row.legacyGoalId)
      }
      continue
    }
    result.push(row)
  }
  for (const [sourceGoalId, entries] of specs) if (!seen.has(sourceGoalId)) {
    result.push(...entries.map((entry) => ({ legacyGoalId: sourceGoalId, canonicalGoalId: entry.targetGoalId, matchType: entry.matchType })))
  }
  mapping.mappings = result
  if (result.some((row) => splitParents.has(row.canonicalGoalId))) throw new Error('HE legacy split-parent mapping remains')
  return mapping
}

const heRules: MappingRule[] = [
  { sourceGoalId: 'he-phys-seki-7-3-b02-a01-6eddc605', add: [
    { targetGoalId: ids.openClosed, matchType: 'partial' },
    { targetGoalId: ids.conductivity, matchType: 'partial' },
  ] },
  { sourceGoalId: 'he-phys-seki-8-2-b01-a01-ded9fd82', add: [
    { targetGoalId: ids.chargeSeparation, matchType: 'partial' },
    { targetGoalId: ids.voltageMeasurement, matchType: 'partial' },
    { targetGoalId: ids.capacitor, matchType: 'partial' },
  ] },
  { sourceGoalId: 'he-phys-seki-7-3-b04-a01-50887db3', add: [
    { targetGoalId: ids.currentMeasurement, matchType: 'partial' },
  ] },
]

const bwRules: MappingRule[] = [
  { sourceGoalId: 'bw-phys-seki-3-2-5-b01-a01-e6784a50', add: [{ targetGoalId: ids.diagramTranslation, matchType: 'partial' }] },
  { sourceGoalId: 'bw-phys-seki-3-2-5-b04-a01-576e4d90', add: [{ targetGoalId: ids.openClosed, matchType: 'partial' }] },
  { sourceGoalId: 'bw-phys-seki-3-2-5-b05-a01-5a3f127a', add: [{ targetGoalId: ids.diagramTranslation, matchType: 'exact' }] },
  { sourceGoalId: 'bw-phys-seki-3-2-5-b06-a01-3c19202b', add: [
    { targetGoalId: ids.currentMeasurement, matchType: 'partial' },
    { targetGoalId: ids.voltageMeasurement, matchType: 'partial' },
  ] },
]

const byRules: MappingRule[] = [
  { sourceGoalId: '69fe06ff-cf18-50d8-9f41-ef480c157a0c' },
  { sourceGoalId: 'ca6eda33-e8f1-598d-be39-c768f9db4c6c', add: [
    { targetGoalId: ids.currentMeasurement, matchType: 'partial' }, { targetGoalId: ids.voltageMeasurement, matchType: 'partial' },
  ] },
  { sourceGoalId: 'cd80eb78-832e-56f1-99be-9dd851e497f0', add: [
    { targetGoalId: ids.currentMeasurement, matchType: 'partial' }, { targetGoalId: ids.voltageMeasurement, matchType: 'partial' },
  ] },
  { sourceGoalId: '5d0ef1e3-a14f-5108-8c11-56f972943783', remove: [ids.conductivity], add: [
    { targetGoalId: ids.voltageMeasurement, matchType: 'partial' },
  ] },
  { sourceGoalId: '06516caa-8438-5dcf-965a-b08d786e669f', add: [
    { targetGoalId: ids.currentMeasurement, matchType: 'partial' }, { targetGoalId: ids.voltageMeasurement, matchType: 'partial' },
  ] },
  { sourceGoalId: '02dd9cae-846e-5dfb-91a5-253e851e4789', add: [
    { targetGoalId: ids.voltageMeasurement, matchType: 'partial' },
  ] },
]

const mvRules: MappingRule[] = [
  { sourceGoalId: 'mv-phys-seki-rp2022-j8-ladung-002-e67986f6', add: [{ targetGoalId: ids.chargeSeparation, matchType: 'partial' }] },
  { sourceGoalId: 'mv-phys-seki-rp2022-j8-ladung-006-7947c2ec', add: [{ targetGoalId: ids.chargeSeparation, matchType: 'partial' }] },
  { sourceGoalId: 'mv-phys-seki-rp2022-j8-ladung-009-9b16b23a', remove: [ids.currentMeasurement] },
  { sourceGoalId: 'mv-phys-seki-rp2022-j9-induktion-007-575785eb', remove: [ids.currentMeasurement] },
  { sourceGoalId: 'mv-phys-seki-rp2022-j8-kabel-008-f6e8fdc8', add: [{ targetGoalId: ids.conductivity, matchType: 'partial' }] },
  { sourceGoalId: 'mv-phys-seki-rp2022-j8-stromkreise-001-35bae5a5', add: [
    { targetGoalId: ids.currentMeasurement, matchType: 'partial' }, { targetGoalId: ids.voltageMeasurement, matchType: 'partial' },
  ] },
]

const slRules: MappingRule[] = [
  { sourceGoalId: 'sl-phys-seki-sl-ph-seki-7-2023-p12-001-43a3ba0e', add: [{ targetGoalId: ids.conductivity, matchType: 'partial' }] },
  { sourceGoalId: 'sl-phys-seki-sl-ph-seki-7-2023-p11-017-84b2d7a1', add: [{ targetGoalId: ids.diagramTranslation, matchType: 'partial' }] },
  { sourceGoalId: 'sl-phys-seki-sl-ph-seki-7-2023-p11-018-d1216402', add: [{ targetGoalId: ids.diagramTranslation, matchType: 'partial' }] },
  { sourceGoalId: 'sl-phys-seki-sl-ph-seki-9-nw-2024-p22-013-e6b978a3', add: [{ targetGoalId: ids.chargeSeparation, matchType: 'partial' }] },
  { sourceGoalId: 'sl-phys-seki-sl-ph-seki-9-nw-2024-p22-014-4294e622', add: [{ targetGoalId: ids.chargeSeparation, matchType: 'partial' }] },
  { sourceGoalId: 'sl-phys-seki-sl-ph-seki-9-nw-2024-p24-003-d873b3b4', add: [{ targetGoalId: ids.chargeSeparation, matchType: 'partial' }] },
  { sourceGoalId: 'sl-phys-seki-sl-ph-seki-9-nw-2024-p35-005-6ad4cc0f', add: [{ targetGoalId: ids.capacitor, matchType: 'partial' }] },
  { sourceGoalId: 'sl-phys-seki-sl-ph-seki-7-2023-p12-010-6d0166c4', remove: [ids.currentMeasurement], add: [{ targetGoalId: ids.voltageMeasurement, matchType: 'partial' }] },
  { sourceGoalId: 'sl-phys-seki-sl-ph-seki-9-nw-2024-p24-004-0468f7b9', add: [{ targetGoalId: ids.voltageMeasurement, matchType: 'partial' }] },
  { sourceGoalId: 'sl-phys-seki-sl-ph-seki-9-nw-2024-p32-001-70b8c647', add: [{ targetGoalId: ids.voltageMeasurement, matchType: 'partial' }] },
  { sourceGoalId: 'sl-phys-seki-sl-ph-seki-7-2023-p14-001-0c1f8ce9', add: [{ targetGoalId: ids.currentMeasurement, matchType: 'partial' }] },
  { sourceGoalId: 'sl-phys-seki-sl-ph-seki-7-2023-p14-002-cab87e8e', add: [{ targetGoalId: ids.currentMeasurement, matchType: 'partial' }] },
  ...[
    'sl-phys-seki-sl-ph-seki-7-2023-p09-003-c08c9f6e',
    'sl-phys-seki-sl-ph-seki-7-2023-p12-008-7b751cc1',
    'sl-phys-seki-sl-ph-seki-7-2023-p13-011-5984ba61',
    'sl-phys-seki-sl-ph-seki-8-nw-2024-p10-001-c08c9f6e',
    'sl-phys-seki-sl-ph-seki-9-nw-2024-p10-001-c08c9f6e',
    'sl-phys-seki-sl-ph-seki-10-nw-2026-p09-001-c08c9f6e',
  ].map((sourceGoalId) => ({ sourceGoalId, remove: [ids.currentMeasurement] })),
]

const snRules: MappingRule[] = [
  ...[
    'sn-phys-seki-sn-klassenstufe-6-lb4-018-01-07e8417d',
    'sn-phys-seki-sn-klassenstufe-6-lb4-018-02-e119ab24',
    'sn-phys-seki-sn-klassenstufe-6-lb4-018-03-485e3ae0',
    'sn-phys-seki-sn-klassenstufe-6-lb4-018-04-be1dc757',
  ].map((sourceGoalId) => ({ sourceGoalId, add: [{ targetGoalId: ids.diagramTranslation, matchType: 'partial' as const }] })),
  { sourceGoalId: 'sn-phys-seki-sn-klassenstufe-6-lb4-018-03-485e3ae0', add: [
    { targetGoalId: ids.diagramTranslation, matchType: 'partial' }, { targetGoalId: ids.openClosed, matchType: 'partial' },
  ] },
  { sourceGoalId: 'sn-phys-seki-sn-klassenstufe-7-lb2-035-01-1be9fb64', add: [
    { targetGoalId: ids.currentMeasurement, matchType: 'partial' }, { targetGoalId: ids.voltageMeasurement, matchType: 'partial' },
  ] },
]

const hbRules: MappingRule[] = [
  { sourceGoalId: 'hb-physics-seki-bp2006-2022-3-2-stromkreis-043-8df1f4d1', add: [
    { targetGoalId: ids.currentMeasurement, matchType: 'partial' }, { targetGoalId: ids.voltageMeasurement, matchType: 'partial' },
  ] },
  { sourceGoalId: 'hb-physics-seki-bp2006-2022-3-1-elektrostatik-032-4d3cb6d3', add: [{ targetGoalId: ids.conductivity, matchType: 'partial' }] },
  { sourceGoalId: 'hb-physics-seki-bp2006-2022-3-1-elektrostatik-034-5283dfb6', add: [{ targetGoalId: ids.chargeSeparation, matchType: 'partial' }] },
  { sourceGoalId: 'hb-physics-seki-bp2006-2022-3-1-elektrostatik-035-c10bc215', add: [{ targetGoalId: ids.chargeSeparation, matchType: 'partial' }] },
  { sourceGoalId: 'hb-physics-seki-bp2006-2022-3-1-elektrostatik-036-94f1334e', add: [{ targetGoalId: ids.chargeSeparation, matchType: 'partial' }] },
]

const hhRules: MappingRule[] = [
  { sourceGoalId: 'hh-physics-seki-bp2022-3-1-elek-008-8df1f4d1', add: [
    { targetGoalId: ids.currentMeasurement, matchType: 'partial' }, { targetGoalId: ids.voltageMeasurement, matchType: 'partial' },
  ] },
  { sourceGoalId: 'hh-physics-seki-bp2022-3-1-elek-012-5e312a0f', add: [{ targetGoalId: ids.diagramTranslation, matchType: 'partial' }] },
  { sourceGoalId: 'hh-physics-seki-bp2022-3-1-elek-013-cafc1295', add: [{ targetGoalId: ids.diagramTranslation, matchType: 'partial' }] },
]

const stRules: MappingRule[] = [
  { sourceGoalId: 'st-phys-seki-st-schuljahrgange-7-8-elektrischer-strom-und-seine-wirkungen-134-14ee0f7b', add: [{ targetGoalId: ids.chargeSeparation, matchType: 'partial' }] },
  { sourceGoalId: 'st-phys-seki-st-schuljahrgange-7-8-elektrischer-strom-und-seine-wirkungen-157-a5369600', add: [
    { targetGoalId: ids.currentMeasurement, matchType: 'partial' }, { targetGoalId: ids.voltageMeasurement, matchType: 'partial' },
  ] },
  { sourceGoalId: 'st-phys-seki-st-schuljahrgange-7-8-elektrischer-strom-und-seine-wirkungen-158-89866e8d', add: [
    { targetGoalId: ids.currentMeasurement, matchType: 'partial' }, { targetGoalId: ids.voltageMeasurement, matchType: 'partial' },
  ] },
  { sourceGoalId: 'st-phys-seki-st-schuljahrgange-7-8-stromkreise-und-elektromagnetismus-229-0f0416d6', add: [
    { targetGoalId: ids.currentMeasurement, matchType: 'partial' }, { targetGoalId: ids.voltageMeasurement, matchType: 'partial' },
  ] },
]

const thRules: MappingRule[] = [
  { sourceGoalId: 'th-phys-seki-th-2-1-2-geladene-korper-stromkreise-elektrische-gro-en-und-elektrische-leitungsvorgange-038-d2ed1a4c', add: [{ targetGoalId: ids.diagramTranslation, matchType: 'partial' }] },
  { sourceGoalId: 'th-phys-seki-th-2-1-2-geladene-korper-stromkreise-elektrische-gro-en-und-elektrische-leitungsvorgange-040-110a437e', add: [{ targetGoalId: ids.conductivity, matchType: 'partial' }] },
  { sourceGoalId: 'th-phys-seki-th-2-1-2-geladene-korper-stromkreise-elektrische-gro-en-und-elektrische-leitungsvorgange-045-fee04f8c', add: [
    { targetGoalId: ids.currentMeasurement, matchType: 'partial' }, { targetGoalId: ids.voltageMeasurement, matchType: 'partial' },
  ] },
]

function transformBwView(view: JsonRecord): JsonRecord {
  const walk = (value: unknown): unknown => {
    if (Array.isArray(value)) {
      const hasCircuits = value.some((entry) => entry?.kind === 'goalEntry' && entry.goalId === ids.circuitsCluster)
      const hasMeasurements = value.some((entry) => entry?.kind === 'goalEntry' && entry.goalId === ids.measurementCluster)
      return value.flatMap((entry) => {
        if (entry?.kind === 'goalEntry' && entry.goalId === ids.electrostaticsCluster) return []
        if (hasCircuits && entry?.kind === 'goalEntry' && entry.goalId === ids.conductivity) return []
        if (hasMeasurements && entry?.kind === 'goalEntry' && entry.goalId === ids.currentMeasurement) return []
        if (entry?.kind === 'goalEntry' && entry.goalId === ids.circuitsCluster) return [{ ...entry, kind: 'canonicalSubtree' }]
        if (entry?.kind === 'goalEntry' && entry.goalId === ids.measurementCluster) return [{ ...entry, kind: 'canonicalSubtree' }]
        return [walk(entry)]
      })
    }
    if (!value || typeof value !== 'object') return value
    return Object.fromEntries(Object.entries(value as JsonRecord).map(([key, nested]) => [key, walk(nested)]))
  }
  return walk(view) as JsonRecord
}

function transformByView(view: JsonRecord, sekII: boolean): JsonRecord {
  const walk = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.flatMap((entry) => {
      if (entry?.kind === 'goalEntry' && entry.goalId === ids.measurementCluster) {
        return sekII
          ? [
            { kind: 'goalEntry', goalId: ids.openClosed, projectionRole: 'prerequisiteOnly' },
            { kind: 'goalEntry', goalId: ids.diagramTranslation, projectionRole: 'prerequisiteOnly' },
            { kind: 'goalEntry', goalId: ids.voltageMeasurement },
          ]
          : [{ ...entry, kind: 'canonicalSubtree' }]
      }
      if (!sekII && entry?.kind === 'goalEntry' && [
        ids.electrostaticsCluster,
        ids.conductivity,
        ids.conductivityAssessment,
      ].includes(entry.goalId)) return []
      return [walk(entry)]
    })
    if (!value || typeof value !== 'object') return value
    const record = value as JsonRecord
    if (!sekII && record.kind === 'structure' && record.id === 'physics-seki-practice-assessments') {
      const children = (record.children as JsonRecord[])
        .filter((entry) => entry.goalId !== ids.conductivityAssessment)
      if (!children.some((entry) => entry.goalId === ids.assessment)) {
        children.push({ kind: 'goalEntry', goalId: ids.assessment })
      }
      return {
        ...Object.fromEntries(Object.entries(record).filter(([key]) => key !== 'children')),
        children,
      }
    }
    if (!sekII && record.kind === 'structure' && record.id === 'physics-seki-route-prerequisites') {
      const children = (record.children as JsonRecord[]).filter((entry) =>
        ![
          ids.currentEffects, ids.circuitsCluster, ids.magnets,
          ids.openClosed, ids.diagramTranslation,
        ].includes(entry.goalId))
      const withoutChildren = Object.fromEntries(Object.entries(record).filter(([key]) => key !== 'children'))
      return {
        ...withoutChildren,
        children: [
          ...children,
          { kind: 'goalEntry', goalId: ids.openClosed, projectionRole: 'prerequisiteOnly' },
          { kind: 'goalEntry', goalId: ids.diagramTranslation, projectionRole: 'prerequisiteOnly' },
          { kind: 'goalEntry', goalId: ids.currentEffects, projectionRole: 'prerequisiteOnly' },
        ],
      }
    }
    return Object.fromEntries(Object.entries(record).map(([key, nested]) => [key, walk(nested)]))
  }
  return walk(view) as JsonRecord
}

function appendPracticeAssessments(view: JsonRecord, assessmentIds: string[]): JsonRecord {
  const walk = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(walk)
    if (!value || typeof value !== 'object') return value
    const record = value as JsonRecord
    if (record.kind === 'structure' && record.id === 'physics-seki-practice-assessments') {
      const children = (record.children as JsonRecord[])
        .filter((entry) => !assessmentIds.includes(entry.goalId))
      children.push(...assessmentIds.map((goalId) => ({ kind: 'goalEntry', goalId })))
      return { ...record, children }
    }
    return Object.fromEntries(Object.entries(record).map(([key, nested]) => [key, walk(nested)]))
  }
  return walk(view) as JsonRecord
}

function transformGenericOverlapView(view: JsonRecord, path: string): JsonRecord {
  const serialized = stableJson(view)
  if (!serialized.includes(ids.magnetismArea) && !serialized.includes(overlapStructureId)) {
    throw new Error(`${path}: voltage-area expansion would omit shared current/conductivity goals without the magnetism area`)
  }
  const voltageChildren = [
    ids.electrostaticsCluster,
    ids.relation,
    '01bebdfc-5819-4610-a03e-ea5e794fc954',
    '8a84de16-2fde-58ec-827a-f803e2ce8564',
    '267170bd-f880-56a7-9719-ffb9751872c5',
    '8f833b36-4126-52db-b210-79fb0023c7d9',
    '1911920e-b099-4310-82f2-b47f51a78b33',
    ids.resistanceCharacteristics,
    '50431e92-eec9-54d6-b437-ea7a51b6f474',
    ids.solarModules,
  ]
  const walk = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(walk)
    if (!value || typeof value !== 'object') return value
    const record = value as JsonRecord
    if (record.kind === 'structure' && record.id === 'physics-seki-practice-assessments') {
      const batchAssessmentIds = [
        ids.electrostaticsAssessment,
        ids.magnetismCurrentEffectsAssessment,
        ids.resistorNetworksAssessment,
        ids.nodeLoopBalancesAssessment,
      ]
      const children = (record.children as JsonRecord[])
        .filter((entry) => !batchAssessmentIds.includes(entry.goalId))
      children.push(...batchAssessmentIds.map((goalId) => ({ kind: 'goalEntry', goalId })))
      return { ...record, children }
    }
    if (record.kind === 'canonicalSubtree' && record.goalId === ids.voltageArea) {
      const projectionRole = record.projectionRole
      return {
        kind: 'structure',
        id: overlapStructureId,
        label: 'Spannung, Schaltungen und Sicherheit (Sek I)',
        children: voltageChildren.map((goalId) => ({
          kind: goalId === ids.electrostaticsCluster ? 'canonicalSubtree' : 'goalEntry',
          goalId,
          ...(projectionRole ? { projectionRole } : {}),
        })),
      }
    }
    return Object.fromEntries(Object.entries(record).map(([key, nested]) => [key, walk(nested)]))
  }
  return walk(view) as JsonRecord
}

function buildSurrogate(): JsonRecord {
  const registry = readJson(paths.surrogate)
  const stale = new Set([
    `${ids.magnets}|${ids.circuitsCluster}`,
    `${ids.circuitsCluster}|${ids.measurementCluster}`,
    `${ids.currentEffects}|${ids.electrostaticsCluster}`,
  ])
  registry.entries = (registry.entries as JsonRecord[]).filter((entry) => !(
    entry.landscapeId === '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'
    && entry.jurisdiction === 'DE-BY'
    && entry.evidenceType === 'requires-closure'
    && stale.has(`${entry.goalId}|${entry.requiredByGoalId}`)
  ))
  const desired = [
    {
      goalId: ids.openClosed,
      requiredByGoalId: ids.diagramTranslation,
      rationale: 'Bayern Physik: Das learner-facing Ziel „Zwischen Stromkreis und Schaltplan übersetzen“ macht „Offene und geschlossene Stromkreise aufbauen und deuten“ als kanonische prerequisite-only-Brücke sichtbar. Akzeptiert ausschließlich als didaktische requires-closure-Brücke, nicht als Behauptung originaler BY-Source-Coverage.',
    },
    {
      goalId: ids.diagramTranslation,
      requiredByGoalId: ids.voltageMeasurement,
      rationale: 'Bayern Physik: Das learner-facing Ziel „Spannung in einfachen Stromkreisen messen“ macht „Zwischen Stromkreis und Schaltplan übersetzen“ als kanonische prerequisite-only-Brücke sichtbar. Akzeptiert ausschließlich als didaktische requires-closure-Brücke, nicht als Behauptung originaler BY-Source-Coverage.',
    },
  ].map((entry) => ({
    landscapeId: '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a',
    jurisdiction: 'DE-BY',
    evidenceType: 'requires-closure',
    status: 'accepted',
    ...entry,
  }))
  for (const entry of desired) {
    const existing = (registry.entries as JsonRecord[]).find((candidate) =>
      candidate.landscapeId === entry.landscapeId
      && candidate.jurisdiction === entry.jurisdiction
      && candidate.evidenceType === entry.evidenceType
      && candidate.goalId === entry.goalId
      && candidate.requiredByGoalId === entry.requiredByGoalId)
    if (existing) Object.assign(existing, entry)
    else registry.entries.push(entry)
  }
  return registry
}

function buildCanonicalProvenance(): JsonRecord {
  const registry = readJson(paths.canonicalProvenance)
  const landscape = (registry.landscapes as JsonRecord[]).find(
    (candidate) => candidate.landscapeId === '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a',
  )
  if (!landscape?.goalProvenance) throw new Error('Missing canonical Physics provenance registry')
  const HE = '996d097a-cac2-4b5f-979a-b3a0b9803265'
  const BW = '3f58b4cf-2b02-4ae0-bb0f-8d8ab6d7f4f1'
  const BY = '42c2f7e3-91b4-5de8-bef0-d563440e9d52'
  const MV = '27da5587-bef3-49ad-9fec-3907253b85bd'
  const SL = 'e5f66ad7-8f49-41f5-b8b2-52ab9a0ebcac'
  const SN = 'd2e1fbb7-9e42-49a7-a07b-a7973156da12'
  const HB = '6cf49ad5-537a-45ee-848c-b114fd3c57df'
  const HH = 'cc3245a5-2980-4019-aa51-84904e073195'
  const ST = '3eedae6b-7e62-4e6e-a96c-78cd6df4c4aa'
  const TH = '2b1b8596-f8c5-44ba-9dec-4cccb834769a'
  const desired: Record<string, JsonRecord> = {
    [ids.openClosed]: {
      sourceLandscapeId: HE,
      sourceGoalId: 'he-phys-seki-7-3-b02-a01-6eddc605',
      additionalSourceLandscapeIds: [BW, SN],
    },
    [ids.diagramTranslation]: {
      sourceLandscapeId: BW,
      sourceGoalId: 'bw-phys-seki-3-2-5-b05-a01-5a3f127a',
      additionalSourceLandscapeIds: [SL, SN, HH, TH],
    },
    [ids.chargeSeparation]: {
      sourceLandscapeId: HE,
      sourceGoalId: 'he-phys-seki-8-2-b01-a01-ded9fd82',
      additionalSourceLandscapeIds: [MV, SL, HB, ST],
    },
    [ids.voltageMeasurement]: {
      sourceLandscapeId: HE,
      sourceGoalId: 'he-phys-seki-8-2-b01-a01-ded9fd82',
      additionalSourceLandscapeIds: [BW, BY, MV, SL, SN, HB, HH, ST, TH],
    },
    [ids.capacitor]: {
      sourceLandscapeId: HE,
      sourceGoalId: 'he-phys-seki-8-2-b01-a01-ded9fd82',
      additionalSourceLandscapeIds: [SL],
    },
  }
  for (const [goalId, provenance] of Object.entries(desired)) {
    const existing = landscape.goalProvenance[goalId]
    if (existing && stableJson(existing) !== stableJson(provenance)) {
      const samePrimary = existing.sourceLandscapeId === provenance.sourceLandscapeId
        && existing.sourceGoalId === provenance.sourceGoalId
      const onlyPreviouslyAdjudicatedAdditional = (existing.additionalSourceLandscapeIds ?? [])
        .every((id: string) => (provenance.additionalSourceLandscapeIds ?? []).includes(id))
      if (!samePrimary || !onlyPreviouslyAdjudicatedAdditional) {
        throw new Error(`Conflicting canonical provenance for new split child ${goalId}`)
      }
    }
    landscape.goalProvenance[goalId] = provenance
  }
  return registry
}

const canonical = buildCanonical()
const semanticKinds = buildSemanticKinds(canonical)
const atomicity = buildLeafReviewLedger(canonical, paths.atomicity, 'semantic-atomicity-v1')
const memory = buildLeafReviewLedger(canonical, paths.memory, 'memory-card-review-v1')
const atlas = readJson(paths.atlas)
if (![439, 441].includes(atlas.expectedCurricularAtomicGoalCount)) {
  throw new Error(`Unexpected Physics atlas denominator ${atlas.expectedCurricularAtomicGoalCount}`)
}
atlas.expectedCurricularAtomicGoalCount = 441

const mappings = new Map<string, JsonRecord>([
  [paths.heReview, buildReviewedMapping(paths.heReview, heRules)],
  [paths.heLegacy, buildLegacyMapping()],
  [paths.bwReview, buildReviewedMapping(paths.bwReview, bwRules)],
  [paths.byReview, buildReviewedMapping(paths.byReview, byRules)],
  [paths.mvReview, buildReviewedMapping(paths.mvReview, mvRules)],
  [paths.slReview, buildReviewedMapping(paths.slReview, slRules)],
  [paths.snReview, buildReviewedMapping(paths.snReview, snRules)],
  [paths.hbReview, buildReviewedMapping(paths.hbReview, hbRules)],
  [paths.hhReview, buildReviewedMapping(paths.hhReview, hhRules)],
  [paths.stReview, buildReviewedMapping(paths.stReview, stRules)],
  [paths.thReview, buildReviewedMapping(paths.thReview, thRules)],
])
const views = new Map<string, JsonRecord>()
for (const path of viewPaths) {
  const original = readJson(path)
  if (path.includes('/de-bw-')) {
    views.set(path, appendPracticeAssessments(transformBwView(original), [
      ids.magnetismCurrentEffectsAssessment,
      ids.resistorNetworksAssessment,
      ids.nodeLoopBalancesAssessment,
    ]))
    continue
  }
  const sekII = path.includes('-sekii-')
  const transformed = transformByView(original, sekII)
  views.set(path, sekII ? transformed : appendPracticeAssessments(transformed, [
    ids.resistorNetworksAssessment,
    ids.nodeLoopBalancesAssessment,
  ]))
}
for (const path of genericOverlapViewPaths) {
  views.set(path, transformGenericOverlapView(readJson(path), path))
}
const surrogate = buildSurrogate()
const canonicalProvenance = buildCanonicalProvenance()

if (writeMode) {
  writeJson(paths.canonical, canonical)
  writeJson(paths.semanticKinds, semanticKinds)
  writeJsonl(paths.atomicity, atomicity)
  writeJsonl(paths.memory, memory)
  writeJson(paths.atlas, atlas)
  for (const [path, value] of mappings) writeJson(path, value)
  for (const [path, value] of views) writeJson(path, value)
  writeJson(paths.surrogate, surrogate)
  writeJson(paths.canonicalProvenance, canonicalProvenance)
}

console.log(
  `CHECK apply_physics_batch_011_electricity_structural_split ${writeMode ? 'WRITE' : 'PASS'} `
  + `clusters=3 children=5 views=${views.size} mappings=${mappings.size} curricularAtomic=${semanticKinds.counts.curricularAtomic}`,
)
console.log('OPEN source-edge audit: SL p11-019 short-circuit source does not explicitly state the open/closed continuous-path criterion; no openClosed mapping added.')
console.log('OPEN source-edge audit: advanced SL diagram/build sources are dominated by advanced circuit content; no bulk diagramTranslation mapping added.')
console.log('OPEN source-edge audit: SN aspect 02 „Arten von Stromkreisen“ is ambiguous for open/closed semantics; no openClosed mapping added.')
console.log('OPEN source-edge audit: MV charge-001 does not explicitly establish charge separation; no chargeSeparation mapping added.')
console.log('OPEN source-edge audit: ST source 150-49e8f650 names charge/charge separation only as a knowledge inventory; no chargeSeparation mapping added without an explicit explanatory competence.')
console.log('OPEN source-edge audit: TH source 039-00c69dc7 says only „Stromkreise aufbauen“ and does not state open/closed or the continuous-path criterion; no openClosed mapping added.')
console.log('CONSERVATIVE match audit: MV j8-kabel-008 supports conductivity directly but not the full experimental wording; conductivity is therefore partial, not exact.')
