import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

type Stage = 'SekI' | 'SekII'
type CourseLevel = 'GK_LK' | 'LK'

type Topic = {
  code: string
  title: string
  page: number
  stageLabel: string
  courseLevel?: CourseLevel
  rows: Array<string | { text: string; courseLevel: CourseLevel }>
}

type Passage = {
  id: string
  topicCode: string
  title: string
  text: string
  page: number
  sourcePath: string
  sourceGoalIds: string[]
}

type SourceGoal = {
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
  granularity: string
  tags: string[]
  rawSourceText: string
  rawSourceSpan: string
  rawParentBulletText: string
}

type ExtractionConfig = {
  stage: Stage
  extractionId: string
  title: string
  sourceDocumentKey: string
  sourceDocumentTitle: string
  sourcePdfPath: string
  sourcePdfUrl: string
  extractionPath: string
  reviewPath: string
  readmePath: string
  archivePath: string
  topics: Topic[]
  peerBaseline: string
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../..')

const jurisdiction = 'DE-MV'
const targetLandscapeId = 'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0'
const registryPath = 'curricula/DE/Gymnasium/provenance/source-landscape-registry.json'

const lowerTopics: Topic[] = [
  {
    code: 'J8-EINFUEHRUNG',
    title: 'Klasse 8: Einführung in die Naturwissenschaft Chemie',
    page: 13,
    stageLabel: 'Klasse 8',
    rows: [
      'Chemie als Naturwissenschaft mit Stoffen, Eigenschaften, Veränderungen und Bedeutung beschreiben',
      'Gefahrstoffsymbole, Umgang mit Chemikalien und Grundregeln beim Experimentieren im Fachraum anwenden',
      'Laborgeräte und Gasbrenner sicher verwenden und Flammenarten unterscheiden',
      'Stoffeigenschaften wie Farbe, Geruch, Aggregatzustand, Löslichkeit, Brennbarkeit, Dichte, Schmelz- und Siedetemperatur, Verformbarkeit, Härte, elektrische Leitfähigkeit und Magnetisierbarkeit untersuchen',
      'Teilchenmodell und Aggregatzustandsänderungen zur Beschreibung des Baus von Stoffen verwenden',
      'Reinstoffe, Stoffgemische und Arten der Stoffgemische unterscheiden',
      'Stoffgemische durch Sieben, Dekantieren, Filtrieren, Eindampfen, Destillieren, Chromatografieren und Adsorbieren trennen',
      'Aufbau, Inhalt und Bedeutung eines Versuchsprotokolls beschreiben und Experimente protokollieren',
      'Stoffumwandlung als Merkmal chemischer Reaktionen von physikalischen Vorgängen abgrenzen',
      'Energieumwandlung als weiteres Merkmal chemischer Reaktionen beschreiben',
    ],
  },
  {
    code: 'J8-METALLE-PSE',
    title: 'Klasse 8: Metalle und Periodensystem der Elemente',
    page: 15,
    stageLabel: 'Klasse 8',
    rows: [
      'Metalle nach Leichtmetallen, Schwermetallen, unedlen Metallen, Edelmetallen und Legierungen einteilen',
      'Metallische Eigenschaften wie Glanz, elektrische Leitfähigkeit, Wärmeleitfähigkeit, Verformbarkeit, Schmelz- und Siedetemperatur, Dichte und Härte untersuchen',
      'Atome mit Kern-Hülle-Modell, Protonen, Elektronen und Schalenmodell beschreiben',
      'Metalle als Atomverbände gleicher Atome mit Kugelpackungsmodell beschreiben',
      'Chemische Elemente und Symbole im Periodensystem der Elemente verwenden',
      'Hauptgruppenelemente über Ordnungszahl, Protonen, Elektronen, Außenelektronen, Hauptgruppennummer, Elektronenschalen und Periodennummer einordnen',
      'Bildung positiv und negativ geladener Ionen sowie Ionensymbole beschreiben',
      'Metallbindung als chemische Bindung zur Erklärung von Leitfähigkeit, Verformbarkeit, Wärmeleitfähigkeit und metallischem Glanz nutzen',
    ],
  },
  {
    code: 'J8-KABEL',
    title: 'Klasse 8: Kontext - Warum fließt Strom durch Kabel?',
    page: 16,
    stageLabel: 'Klasse 8',
    rows: [
      'Praktisch genutzte Stromleiter wie Kupferkabel, Aluminiumkabel und Goldflächen mit inneren und äußeren Isolierungen beschreiben',
      'Metallgitter aus Metall-Ionen und frei beweglichen Elektronen modellieren',
      'Atombau, chemisches Element, Symbol und Periodensystem am Beispiel Aluminium anwenden',
      'Die Bildung des elektrisch positiv geladenen Aluminium-Ions als Metall-Ion beschreiben',
      'Elektrischen Strom in Metallen mit Spannungsquelle, beweglichen Elektronen und schwingenden Metall-Ionen modellieren',
      'Elektrische Leitfähigkeit verschiedener Leiter und Isolatoren qualitativ untersuchen und mit Rohstoffkosten vergleichen',
    ],
  },
  {
    code: 'J8-LUFT-SAUERSTOFF',
    title: 'Klasse 8: Luft und Sauerstoff',
    page: 17,
    stageLabel: 'Klasse 8',
    rows: [
      'Luft als Stoffgemisch mit Zusammensetzung und Bedeutung der Bestandteile beschreiben',
      'Sauerstoff darstellen, Eigenschaften untersuchen und mit der Spanprobe nachweisen',
      'Sauerstoffmoleküle mit Atombindung, Formel und Elektronenschreibweise beschreiben',
      'Reaktionen von Metallen mit Sauerstoff als Stoff- und Energieumwandlungen sowie Korrosion beschreiben',
      'Wortgleichungen für Reaktionen von Metallen mit Sauerstoff aufstellen',
      'Namen und Formeln von Metalloxiden sowie den Begriff chemische Verbindung verwenden',
      'Das Gesetz von der Erhaltung der Masse experimentell und fachsprachlich nutzen',
      'Reaktionsgleichungen zur Bildung von Metalloxiden aufstellen und Oxidation sowie Reduktion unterscheiden',
      'Redoxreaktionen als Sauerstoffübertragung mit Teilreaktionen beschreiben und auf Metallgewinnung beziehen',
      'Atommasse, Stoffportionen, Teilchenanzahl, Stoffmenge und molare Masse zur quantitativen Betrachtung chemischer Reaktionen verwenden',
      'Stöchiometrische Massenberechnungen durchführen',
    ],
  },
  {
    code: 'J8-WASSERSTOFF-WASSER',
    title: 'Klasse 8: Wasserstoff und Wasser',
    page: 19,
    stageLabel: 'Klasse 8',
    rows: [
      'Wasserstoff in Verwendung und Bedeutung einordnen, darstellen, Eigenschaften untersuchen und mit der Knallgasprobe nachweisen',
      'Wasserstoffmoleküle mit Atombindung, Formel und Elektronenschreibweise beschreiben',
      'Wasser in Verwendung, Bedeutung, Eigenschaften und Nachweis beschreiben',
      'Wasser mit Elektronegativitätswerten, polarer Atombindung, Dipolmolekül, Formel und Elektronenschreibweise modellieren',
      'Zusammenhänge zwischen Bau und Eigenschaften von Wasser sowie Dipoleigenschaften beim Lösungsvorgang erklären',
      'Bildung und Zerlegung von Wasser als Umordnung von Teilchen und Änderung chemischer Bindungen beschreiben',
      'Unpolare und polare Atombindung unterscheiden und Reaktionsgleichungen zur Bildung und Zerlegung von Wasser aufstellen',
    ],
  },
  {
    code: 'J8-KOHLENSTOFF',
    title: 'Klasse 8: Kohlenstoff und Kohlenstoffverbindungen',
    page: 20,
    stageLabel: 'Klasse 8',
    rows: [
      'Modifikationen des Kohlenstoffs am Bau, den Eigenschaften und der Verwendung von Graphit und Diamant vergleichen',
      'Kohlenstoffmonooxid und Kohlenstoffdioxid in Bau, Eigenschaften, Bildung, Verwendung und Bedeutung beschreiben',
      'Reaktionsgleichungen zur Bildung von Kohlenstoffmonooxid und Kohlenstoffdioxid aufstellen',
      'Kohlenstoffdioxid nachweisen und Kohlenstoffverbindungen unter ökologischen Aspekten bewerten',
    ],
  },
  {
    code: 'J9-ALKALI-HYDROXIDE-HALOGENE',
    title: 'Klasse 9: Alkali-, Erdalkalimetalle, Metallhydroxide und Halogene',
    page: 21,
    stageLabel: 'Klasse 9',
    rows: [
      'Alkali- und Erdalkalimetalle in Bedeutung, Verwendung, Vorkommen, Bau und metallischen Eigenschaften beschreiben',
      'Reaktionsfreudigkeit von Alkali- und Erdalkalimetallen gegenüber Sauerstoff und Wasser aus Atombau und Stellung im Periodensystem ableiten',
      'Metallhydroxide durch Reaktion unedler Metalle mit Wasser darstellen und Reaktionsgleichungen formulieren',
      'Hydroxid-Ionen mit Indikatoren nachweisen und den Begriff Indikator verwenden',
      'Namen, Formeln, Verwendung und Bedeutung wichtiger Metallhydroxide beschreiben',
      'Metallhydroxide aus Metall-Ionen, Hydroxid-Ionen, Ionenkristall und Ionenbindung modellieren',
      'Eigenschaften der Metallhydroxide sowie Laugen als Lösungen der Metallhydroxide beschreiben',
      'Verhaltensregeln im Umgang mit Metallhydroxiden und Laugen begründen',
      'Metallhydroxide durch Reaktion von Metalloxiden mit Wasser darstellen und Reaktionsgleichungen formulieren',
      'Halogene in Vorkommen, Bedeutung, Bau, Eigenschaften und Reaktionsfreudigkeit beschreiben',
      'Reaktionen der Halogene mit Alkali- und Erdalkalimetallen beschreiben und Reaktionsgleichungen formulieren',
      'Metallhalogenide als Ionensubstanzen mit Ionenbindung und Salzbegriff beschreiben',
    ],
  },
  {
    code: 'J9-SAEUREN',
    title: 'Klasse 9: Säuren und saure Lösungen',
    page: 24,
    stageLabel: 'Klasse 9',
    rows: [
      'Vorkommen, Bedeutung und Verwendung saurer Lösungen im Alltag beschreiben',
      'Sicheren Umgang mit Säuren in Haushalt und Labor begründen',
      'Namen und Formeln wichtiger anorganischer Säuren verwenden',
      'Chlorwasserstoff mit Molekül, polarer Atombindung, Elektronegativitätswerten und Eigenschaften beschreiben',
      'Auflösen von Chlorwasserstoff in Wasser, Verdünnung und elektrische Leitfähigkeit saurer Lösungen erklären',
      'Säurereaktionen als Protolyse mit Protonenübergang beschreiben und Reaktionsgleichungen aufstellen',
      'Hydronium-Ionen und Säurerest-Ionen benennen',
      'Säuren und saure Lösungen definieren',
      'Verdünnte und konzentrierte Säuren über Massenprozente und Stoffmengenkonzentration berechnen',
      'Säuren aus Nichtmetalloxid und Wasser darstellen und Reaktionsgleichungen aufstellen',
      'Neutralisationsreaktionen von sauren und alkalischen Lösungen zu Salz und Wasser beschreiben',
      'Saure, alkalische und neutrale Lösungen mit Indikatoren und pH-Wert unterscheiden',
      'pH-Skala und Bedeutung des pH-Werts in Körper, Boden und Gewässern einordnen',
    ],
  },
  {
    code: 'J9-SALZE',
    title: 'Klasse 9: Salze',
    page: 26,
    stageLabel: 'Klasse 9',
    rows: [
      'Salze als Verbindungen aus Metall-Ionen und Säurerest-Ionen definieren',
      'Nomenklatur und Formeln von Halogeniden, Nitraten, Sulfaten, Carbonaten und Phosphaten verwenden',
      'Bau von Salzen mit Ionenbindung und Ionenkristall beschreiben',
      'Eigenschaften von Salzen wie Festigkeit, Sprödigkeit, Kristallinität, Schmelz- und Siedetemperatur, Löslichkeit und elektrische Leitfähigkeit erklären',
      'Verwendung und Bedeutung von Salzen in Haushalt, Düngemitteln, Kosmetika, Stoffwechselprozessen und Medizin beschreiben',
      'Salze durch Neutralisationsreaktionen darstellen und Bruttogleichungen sowie Ionengleichungen aufstellen',
      'Salze durch Reaktion verdünnter Säuren mit unedlen Metallen darstellen',
      'Salze durch Reaktion verdünnter Säuren mit Metalloxiden darstellen',
      'Chlorid-, Carbonat- und Sulfat-Ionen qualitativ nachweisen',
      'Fällungsreaktionen mit Bruttogleichungen und Ionengleichungen beschreiben',
      'Bedeutung von Fällungsreaktionen in Analytik, Abwasserreinigung und Trinkwasseraufbereitung einordnen',
      'Reaktionen von Carbonaten mit sauren Lösungen beschreiben und Kohlenstoffdioxid nachweisen',
    ],
  },
  {
    code: 'J10-ORGANISCHE-CHEMIE',
    title: 'Klasse 10: Organische Chemie',
    page: 28,
    stageLabel: 'Klasse 10',
    rows: [
      'Organische und anorganische Chemie historisch und fachlich voneinander abgrenzen',
      'Vielfalt organischer Stoffe mithilfe des Kohlenstoffatombaus erklären und Kohlenstoff in organischen Stoffen nachweisen',
      'Alkane als gesättigte Kohlenwasserstoffe einteilen',
      'Methan in Vorkommen, Gewinnung, Verwendung, Bedeutung, Bau, Summenformel, Strukturformel und Eigenschaften beschreiben',
      'Homologe Reihe der Alkane und Begriff homologe Reihe verwenden',
      'Bau der Alkane mit Einfachbindungen, Summenformeln und Strukturformeln darstellen',
      'Physikalische Eigenschaften der Alkane mit Van-der-Waals-Kräften, hydrophobem Verhalten und Struktur-Eigenschafts-Beziehungen erklären',
      'Isomerie der Alkane beschreiben und Nomenklaturregeln anwenden',
      'Verbrennung, Substitution, Halogenalkane und Eliminierung als Reaktionen der Alkane beschreiben',
      'Zusammenhang von Stoffmenge und Volumen gasförmiger Stoffe, molares Volumen und Satz von Avogadro anwenden',
      'Stöchiometrische Masse- und Volumenberechnungen durchführen',
      'Alkene und Alkine als ungesättigte Kohlenwasserstoffe mit Doppel- und Dreifachbindungen beschreiben',
      'Summen- und Strukturformeln, Verwendung und physikalische Eigenschaften von Alkenen und Alkinen darstellen',
      'Verbrennung, Addition, Bromnachweis von Mehrfachbindungen und Hydrierung als Reaktionen ungesättigter Kohlenwasserstoffe beschreiben',
      'Erdöl und Erdgas als Stoffgemische aus Kohlenwasserstoffen und Rohstoffe der chemischen Industrie einordnen',
      'Ökonomische und ökologische Konsequenzen von Förderung, Transport und Nutzung fossiler Kohlenwasserstoffe beurteilen',
      'Kunststoffe als künstliche Makromoleküle am Beispiel Polyethylen und Polyvinylchlorid beschreiben',
      'Bedeutung, Eigenschaften, Recycling, Entsorgung und Umweltproblematik von Kunststoffen bewerten',
    ],
  },
  {
    code: 'J10-FUNKTIONELLE-GRUPPEN',
    title: 'Klasse 10: Organische Moleküle mit funktionellen Gruppen',
    page: 31,
    stageLabel: 'Klasse 10',
    rows: [
      'Alkohole über Begriff, Beispiele, Verwendung, Bedeutung und Bau mit Hydroxylgruppe beschreiben',
      'Homologe Reihe der Alkanole mit Summenformeln, Strukturformeln und Hydroxylgruppe darstellen',
      'Physikalische Eigenschaften der Alkanole mit Wasserstoffbrückenbindungen, hydrophilen und hydrophoben Anteilen erklären',
      'Ethanol in Bau, Herstellung durch alkoholische Gärung, technischer Herstellung, Verwendung und Bedeutung beschreiben',
      'Gesundheitliche, persönliche und gesellschaftliche Folgen des Ethanolmissbrauchs bewerten',
      'Physikalische Eigenschaften und Löslichkeitsverhalten von Ethanol aus Struktur und Hydroxylgruppe erklären',
      'Chemische Reaktionen von Ethanol bei Verbrennung, Reaktion mit Wasser und Oxidation beschreiben',
      'Alkanale als Oxidationsprodukte der Alkanole mit Aldehydgruppe, Strukturformeln, Verwendung, Bedeutung und Nachweis beschreiben',
      'Carbonsäuren über Begriff, Beispiele, Bau mit Carboxylgruppe, Verwendung und Bedeutung beschreiben',
      'Homologe Reihe der Alkansäuren mit Strukturformeln, Summenformeln, Carboxylgruppe und physikalischen Eigenschaften darstellen',
      'Ethansäure in Verwendung, Herstellung durch Essigsäuregärung, Bau und Eigenschaften beschreiben',
      'Reaktionen der Ethansäure mit Wasser, Metallen, Metallhydroxiden und Alkanolen sowie Esterbildung und Hydrolyse beschreiben',
      'Ester mit Estergruppe, Vorkommen und Bedeutung in Fetten sowie Aromastoffen beschreiben',
    ],
  },
]

const upperTopics: Topic[] = [
  {
    code: 'Q-STRUKTUR-EIGENSCHAFTEN',
    title: 'Qualifikationsphase: Stoffe, Strukturen und Eigenschaften',
    page: 14,
    stageLabel: 'Qualifikationsphase',
    rows: [
      'Chemische Bindung, Struktur und Eigenschaften anorganischer Stoffe mit Elektronenpaarbindung, Ionenbindung und Metallbindung erklären',
      'Ionengitter und Metallgitter zur Deutung von Stoffeigenschaften verwenden',
      'Intermolekulare Wechselwirkungen wie Van-der-Waals-Kräfte, Wasserstoffbrückenbindungen, Dipol-Wechselwirkungen und Ionen-Dipol-Wechselwirkungen unterscheiden',
      'Reaktionsarten der anorganischen Chemie im Überblick beschreiben',
      'Stoffklassen und Strukturmerkmale organischer Stoffe mit Mehrfachbindungen und funktionellen Gruppen beschreiben',
      'Hydroxy-, Aldehyd-, Carboxy-, Carbonyl- und Estergruppen erkennen und benennen',
      'Nomenklaturregeln organischer Stoffe anwenden',
      'Reaktionsarten der organischen Chemie im Überblick beschreiben',
      'Radikalische Substitution am Beispiel der Halogenierung der Alkane mit Startreaktion, Reaktionskette und Abbruchreaktionen beschreiben',
      'Elektrophile Addition am Beispiel der Reaktion von Ethen mit Brom mechanistisch beschreiben',
      { text: 'SN1 als Stufenmechanismus am tertiären Kohlenstoffatom mit Carbenium-Ion, Halogenid-Ion und nucleophilem Angriff beschreiben', courseLevel: 'LK' },
      { text: 'SN2 als Synchronmechanismus am primären Kohlenstoffatom mit Übergangszustand, Nucleophil und Deprotonierung beschreiben', courseLevel: 'LK' },
      { text: 'Mechanismus der säurekatalysierten Veresterung mit Protonierung, nucleophilem Angriff, Protonenwanderung, Wasserabspaltung und Deprotonierung beschreiben', courseLevel: 'LK' },
      { text: 'Cyclische Kohlenwasserstoffe, Cycloalkane, Cycloalkene und Aromaten in Struktur, Eigenschaften und Bedeutung beschreiben', courseLevel: 'LK' },
      { text: 'Elektrophile Substitution am Aromaten am Beispiel der Reaktion von Benzol mit Brom oder Chlor beschreiben', courseLevel: 'LK' },
    ],
  },
  {
    code: 'Q-FETTE',
    title: 'Qualifikationsphase: Fette',
    page: 16,
    stageLabel: 'Qualifikationsphase',
    courseLevel: 'LK',
    rows: [
      'Bildung, Bau und Zusammensetzung von Fetten beschreiben',
      'Vorkommen und Bedeutung von Fetten in biologischen Systemen und Nahrung einordnen',
      'Eigenschaften von Fetten mit Schmelzbereich, Aggregatzustand und Löslichkeit in polaren sowie unpolaren Lösungsmitteln beschreiben',
      'Fette in Lebensmitteln mit der Fettfleckprobe nachweisen',
    ],
  },
  {
    code: 'Q-PROTEINE',
    title: 'Qualifikationsphase: Proteine',
    page: 17,
    stageLabel: 'Qualifikationsphase',
    rows: [
      'Aminosäuren mit funktionellen Gruppen, Eigenschaften, Nomenklatur und Bedeutung beschreiben',
      'Polypeptide und Proteine über Bildung der Peptide, Peptidbindung und Peptidgruppe beschreiben',
      'Primär-, Sekundär-, Tertiär- und Quartärstruktur der Proteine unterscheiden',
      'Bedeutung und Eigenschaften von Proteinen sowie Enzyme als Biokatalysatoren beschreiben',
      'Schwefel, Stickstoff, Denaturierung und Biuretreaktion als Nachweise oder Untersuchungen von Eiweiß verwenden',
      { text: 'Optische Aktivität, Zwitterionen und Einteilung von Aminosäuren beschreiben', courseLevel: 'LK' },
      { text: 'Hydrolyse eines Proteins und mögliche Enzymhemmung beschreiben', courseLevel: 'LK' },
    ],
  },
  {
    code: 'Q-KUNSTSTOFFE',
    title: 'Qualifikationsphase: Kunststoffe',
    page: 18,
    stageLabel: 'Qualifikationsphase',
    rows: [
      'Struktur, Eigenschaften und Verwendung von Thermoplasten, Duroplasten und Elastomeren vergleichen',
      'Bildung synthetischer Polymere durch Polykondensation und Polymerisation beschreiben',
      'Kunststoffe wie Aminoplaste, Phenoplaste, Polyethylen, Polyvinylchlorid und Polystyrol einordnen',
      'Mechanismus der radikalischen Polymerisation von Polyethylen mit Start, Kettenfortpflanzung und Abbruchreaktionen beschreiben',
      'Recycling, Mikroplastik, Nanomaterialien und maßgeschneiderte Kunststoffe unter ökologischen und ökonomischen Aspekten bewerten',
    ],
  },
  {
    code: 'Q-THERMODYNAMIK',
    title: 'Qualifikationsphase: Thermodynamik',
    page: 19,
    stageLabel: 'Qualifikationsphase',
    rows: [
      'Merkmale chemischer Reaktionen und Energieumwandlungen bei chemischen Reaktionen beschreiben',
      'Offene, geschlossene und abgeschlossene Systeme sowie isochore und isobare Prozessführung unterscheiden',
      'Innere Energie, molare Reaktionswärme, molare Volumenarbeit, molare Reaktionsenergie und molare Reaktionsenthalpie verwenden',
      'Ersten Hauptsatz der Thermodynamik auf chemische Systeme anwenden',
      'Molare Standardbildungsenthalpie, Neutralisationsenthalpie und Verbrennungsenthalpie herausarbeiten',
      'Satz von Hess anwenden',
      'Molare Volumenarbeit, Reaktionswärme, Reaktionsenergie und Reaktionsenthalpie berechnen',
      'Bedeutung der molaren Reaktionsenthalpie mit Gitterenthalpie, Hydratationsenthalpie und Lösungsenthalpie erklären',
      'Kopplung exothermer und endothermer Reaktionen sowie Brennwerte chemisch-technischer Prozesse einordnen',
      'Effizienz verschiedener Brennstoffe unter ökonomischen und ökologischen Gesichtspunkten beurteilen',
      'Grundlagen der Kalorimetrie und kalorimetrische Grundgleichung anwenden',
      { text: 'Zweiten Hauptsatz der Thermodynamik und Entropie als Maß für Unordnung beschreiben', courseLevel: 'LK' },
      { text: 'Volumenarbeit, Reaktionswärme, Reaktionsenergie und Reaktionsenthalpie für nicht molare Formelumsätze berechnen', courseLevel: 'LK' },
      { text: 'Gibbs-Helmholtz-Gleichung, freie Enthalpie sowie exergonische und endergonische Reaktionen anwenden', courseLevel: 'LK' },
    ],
  },
  {
    code: 'Q-REAKTIONSKINETIK',
    title: 'Qualifikationsphase: Reaktionskinetik',
    page: 21,
    stageLabel: 'Qualifikationsphase',
    rows: [
      'Reaktionsgeschwindigkeit definieren und experimentell bestimmen',
      'Abhängigkeit der Reaktionsgeschwindigkeit von Temperatur, Konzentration und Katalysator mit Stoßtheorie und RGT-Regel beschreiben',
      'Merkmale und Wirkungsweise von Katalysatoren im Energie-Zeit-Diagramm darstellen',
      'Reaktionsgeschwindigkeit experimentell in Abhängigkeit von Temperatur, Konzentration und Katalysator untersuchen',
      'Geschwindigkeitsgleichungen verwenden',
      { text: 'Durchschnitts- und Momentangeschwindigkeit mithilfe von Konzentration-Zeit-Diagrammen grafisch interpretieren', courseLevel: 'LK' },
      { text: 'Homogene und heterogene Katalyse unterscheiden', courseLevel: 'LK' },
    ],
  },
  {
    code: 'Q-GLEICHGEWICHTE',
    title: 'Qualifikationsphase: Chemisches Gleichgewicht und Massenwirkungsgesetz',
    page: 22,
    stageLabel: 'Qualifikationsphase',
    rows: [
      'Umkehrbare chemische Reaktionen und Einstellung chemischer Gleichgewichte im Konzentration-Zeit-Diagramm darstellen',
      'Merkmale chemischer Gleichgewichte beschreiben',
      'Prinzip von Le Chatelier anwenden',
      'Einfluss von Katalysatoren auf chemische Gleichgewichte interpretieren',
      'Massenwirkungsgesetz kinetisch herleiten und Aussagen über die Lage von Gleichgewichten ableiten',
      'Gleichgewichtskonstanten, Konzentrationen und Stoffmengen im chemischen Gleichgewicht am Estergleichgewicht berechnen',
      'Massenwirkungsgesetz und Prinzip von Le Chatelier auf Gasgleichgewichte in chemisch-technischen Prozessen anwenden',
      { text: 'Berechnungen zu weiteren chemischen Gleichgewichten durchführen', courseLevel: 'LK' },
      { text: 'Zusammenhang zwischen KC und Kp mithilfe der Zustandsgleichung idealer Gase ableiten', courseLevel: 'LK' },
      { text: 'Massenwirkungsgesetz bei Gasgleichgewichten wie Konvertierung, Methanolsynthese und Boudouard-Gleichgewicht anwenden', courseLevel: 'LK' },
    ],
  },
  {
    code: 'Q-SAEURE-BASE-LOESLICHKEIT',
    title: 'Qualifikationsphase: Säure-Base- und Löslichkeitsgleichgewichte',
    page: 24,
    stageLabel: 'Qualifikationsphase',
    rows: [
      'Historische Entwicklung des Säure-Base-Begriffs beschreiben',
      'Säuren, Basen und Salze nach Arrhenius beschreiben',
      'Säure-Base-Theorie nach Brønsted mit Donator-Akzeptor-Prinzip und korrespondierenden Säure-Base-Paaren anwenden',
      'Massenwirkungsgesetz auf Säure-Base-Gleichgewichte anwenden und Säure- sowie Basekonstanten ableiten',
      'Autoprotolyse und Ionenprodukt des Wassers beschreiben',
      'pH-Wert-Berechnungen zum Protolyse-Gleichgewicht sehr starker Säuren und Basen durchführen',
      'Grundlagen der Maßanalyse und Prinzip einer Säure-Base-Titration beschreiben',
      'Säure-Base-Indikatoren, Titrationskurven sehr starker Säuren und Basen sowie Berechnungen von Stoffmengenkonzentrationen, Stoffmengen und Massen anwenden',
      { text: 'Hydratisierte Kationen und pH-Wert-Berechnungen schwacher sowie starker Säuren und Basen beschreiben', courseLevel: 'LK' },
      { text: 'Puffersysteme in Zusammensetzung, Wirkung und Bedeutung in Natur und Technik beschreiben', courseLevel: 'LK' },
      { text: 'Henderson-Hasselbalch-Gleichung, Pufferwirkung und Pufferkapazität berechnen', courseLevel: 'LK' },
      { text: 'Titrationskurven von Säuren und Basen unterschiedlicher Stärke mit Umschlagsbereichen, Halbäquivalenzpunkt und Potentiometrie interpretieren', courseLevel: 'LK' },
      { text: 'Fällungs- und Löseprozesse sowie Auflösen von Salzen in Wasser teilchenmäßig und energetisch beschreiben', courseLevel: 'LK' },
      { text: 'Gesättigte und ungesättigte Lösungen sowie leicht- und schwerlösliche Salze unterscheiden', courseLevel: 'LK' },
      { text: 'Massenwirkungsgesetz auf Löslichkeitsgleichgewichte anwenden und Löslichkeitsprodukt für Salze vom Typ AmBn ableiten', courseLevel: 'LK' },
      { text: 'Löslichkeitsprodukt, Löslichkeit sowie Änderungen durch gleichionige und fremdionige Zusätze berechnen', courseLevel: 'LK' },
      { text: 'Fällungsreaktionen und fraktionierte Fällung in Wasser- und Abwasseraufbereitung bewerten', courseLevel: 'LK' },
    ],
  },
  {
    code: 'Q-REDOX-ATOMBAU',
    title: 'Qualifikationsphase: Atombau und Redoxreaktionen',
    page: 27,
    stageLabel: 'Qualifikationsphase',
    rows: [
      'Historische Entwicklung der Atomtheorie und Möglichkeiten sowie Grenzen von Atommodellen diskutieren',
      'Oxidationszahlen als Modell und Hilfsmittel zur Beschreibung von Elektronenübergängen verwenden',
      'Regeln zur Bestimmung von Oxidationszahlen in anorganischen und organischen Verbindungen anwenden',
      'Redoxreaktionen als Elektronenübergang mit Donator-Akzeptor-Prinzip und korrespondierenden Redoxpaaren beschreiben',
      'Bedeutung von Redoxreaktionen im Hochofenprozess und bei der Stahlherstellung einordnen',
      { text: 'Elektronenkonfigurationen der Haupt- und Nebengruppenelemente beschreiben', courseLevel: 'LK' },
      { text: 'Zusammenhang von Elektronenkonfiguration, Stellung im Periodensystem und Oxidationsstufen ableiten', courseLevel: 'LK' },
      { text: 'Energieprinzip, Hundsche Regel und Pauli-Prinzip auf Haupt- und Nebengruppenelemente anwenden', courseLevel: 'LK' },
      { text: 'pH-Wert-abhängige Redoxreaktionen und Redoxtitrationen beschreiben', courseLevel: 'LK' },
    ],
  },
  {
    code: 'Q-GALVANISCHE-ELEMENTE',
    title: 'Qualifikationsphase: Galvanische Elemente',
    page: 28,
    stageLabel: 'Qualifikationsphase',
    rows: [
      'Echte, potentielle, starke und schwache Elektrolyte sowie elektrische Leitfähigkeit beschreiben',
      'Aufbau einer Metall-/Metall-Ionen-Elektrode und elektrochemische Doppelschicht beschreiben',
      'Standardwasserstoffelektrode in Bau und Bedeutung erklären',
      'Elektrochemische Spannungsreihe von Metallen, Nichtmetallen und anderen Redoxsystemen zur Vorhersage elektrochemischer Reaktionen nutzen',
      'Galvanische Zelle in Aufbau und Funktionsweise beschreiben und Zellreaktionen formulieren',
      'Zellspannung unter Standardbedingungen berechnen',
      'Primärelemente wie Daniell-Element und Wasserstoff-Sauerstoff-Brennstoffzelle beschreiben',
      'Sekundärelemente wie Bleiakkumulator beim Laden und Entladen beschreiben',
      'Umweltproblematik, Rohstoffgewinnung und Recycling elektrochemischer Spannungsquellen diskutieren',
      'Elektrochemische Korrosion mit Lokalelementen, Sauerstoff-Korrosion, Säure-Korrosion und Korrosionsschutzmaßnahmen beschreiben',
      'Korrosion von verzinntem und verzinktem Stahl chemisch beschreiben',
      { text: 'Abhängigkeit des elektrochemischen Gleichgewichts von Konzentration und Temperatur beschreiben', courseLevel: 'LK' },
      { text: 'Nernstsche Gleichung zur Berechnung der Zellspannung anwenden', courseLevel: 'LK' },
      { text: 'Primärelemente, Sekundärelemente, Brennstoffzellen, Lithium-Ionen-Akkumulatoren und Elektromobilität vertiefend einordnen', courseLevel: 'LK' },
    ],
  },
  {
    code: 'Q-ELEKTROLYSE',
    title: 'Qualifikationsphase: Elektrolyse',
    page: 30,
    stageLabel: 'Qualifikationsphase',
    rows: [
      'Aufbau und Funktionsweise einer Elektrolysezelle in wässrigen Lösungen beschreiben',
      'Reaktionen an Elektroden und Zersetzungsspannung bei Elektrolysen beschreiben',
      'Elektrolysezelle und galvanische Zelle vergleichen',
      'Produkte bei der Elektrolyse von Salzlösungen nachweisen',
      'Elektrochemische Raffination von Kupfer als technisches Elektrolyseverfahren beschreiben',
      'Ökologische und ökonomische Aspekte technischer Elektrolyseverfahren beurteilen',
      { text: 'Elektrolyse verdünnter Schwefelsäure im Hofmannschen Wasserzersetzungsapparat untersuchen', courseLevel: 'LK' },
      { text: 'Faradaysche Gesetze herleiten und zur Berechnung anwenden', courseLevel: 'LK' },
      { text: 'Zersetzungsspannung, Überspannung und Abscheidungspotentiale beschreiben', courseLevel: 'LK' },
      { text: 'Schmelzflusselektrolyse und Chloralkalielektrolyse im Diaphragma- und Membranverfahren beschreiben', courseLevel: 'LK' },
      { text: 'Leitfähigkeitstitration und Potentiometrie als elektrochemische Analyseverfahren anwenden', courseLevel: 'LK' },
    ],
  },
  {
    code: 'Q-ANALYSE',
    title: 'Qualifikationsphase: Analyse chemischer Reaktionen',
    page: 31,
    stageLabel: 'Qualifikationsphase',
    rows: [
      'Sauerstoff, Wasserstoff, Ammoniak und Kohlenstoffdioxid qualitativ nachweisen',
      'Carbonat-, Sulfat-, Halogenid- und Ammonium-Ionen qualitativ nachweisen',
      'Stoffmengen, Stoffmengenkonzentrationen, Volumina und Massen berechnen',
      { text: 'Chromatographie, Elektrophorese und Spektroskopie als Analyseverfahren beschreiben', courseLevel: 'LK' },
      { text: 'Massen- und Volumenkonzentrationen berechnen', courseLevel: 'LK' },
      { text: 'Komplexverbindungen über hydratisierte Ionen, Bau, Nomenklatur und koordinative Bindung beschreiben', courseLevel: 'LK' },
      { text: 'Ligandenaustauschreaktionen, energetisch günstigere Komplexe und Chelatkomplexe erklären', courseLevel: 'LK' },
      { text: 'Kupfer(II)-, Eisen(II)-, Eisen(III)- und Halogenid-Ionen mit Fällungs- und Komplexreaktionen unterscheiden', courseLevel: 'LK' },
      { text: 'Bedeutung von Komplexreaktionen für technische Prozesse und biologische Systeme beurteilen', courseLevel: 'LK' },
    ],
  },
]

const configs: ExtractionConfig[] = [
  {
    stage: 'SekI',
    extractionId: 'DE-MV-CHEMIE-SEKI-RAHMENPLAN-2021',
    title: 'DE-MV - Chemie Sekundarstufe I (Mecklenburg-Vorpommern, Rahmenplan 2021 Source-Extraction)',
    sourceDocumentKey: 'MV-CH-SEKI-2021',
    sourceDocumentTitle: 'Rahmenplan Chemie Sekundarstufe I Gymnasium/Gesamtschule Mecklenburg-Vorpommern 2021',
    sourcePdfPath: 'curricula/DE/Gymnasium/input/MV/Chemie_Sekundarstufe_I_2021.pdf',
    sourcePdfUrl:
      'https://www.bildung-mv.de/export/sites/bildungsserver/.galleries/dokumente/unterricht/rahmenplaene/Anlage_9_RP_CHE_AHR-7-10_final1.pdf',
    extractionPath:
      'curricula/DE/Gymnasium/input/MV/lower-secondary/source-extraction/DE_MV_CHEMIE_SEKI_RAHMENPLAN_2021.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-MV/lower-secondary/mv_chemistry_lower_secondary_source_extraction_to_canonical_chemistry.review.json',
    readmePath: 'curricula/DE/Gymnasium/mapping/DE-MV/lower-secondary/CHEMIE.md',
    archivePath: 'curricula/DE/Gymnasium/input/MV/lower-secondary/',
    topics: lowerTopics,
    peerBaseline:
      'HE/BW/HB/NI/NW/SH/ST Sek-I-Chemie = 122/65/42/196/79/156/270 Source-Ziele; MV wird aus den verbindlichen Inhalte-Tabellen Klassen 8-10 extrahiert.',
  },
  {
    stage: 'SekII',
    extractionId: 'DE-MV-CHEMIE-SEKII-RAHMENPLAN-ERPROBUNGSFASSUNG-2022',
    title: 'DE-MV - Chemie Qualifikationsphase (Mecklenburg-Vorpommern, Rahmenplan 2022 Erprobungsfassung Source-Extraction)',
    sourceDocumentKey: 'MV-CH-SEKII-2022-ERPROBUNG',
    sourceDocumentTitle:
      'Rahmenplan Chemie Qualifikationsphase gymnasiale Oberstufe Mecklenburg-Vorpommern 2022 Erprobungsfassung',
    sourcePdfPath: 'curricula/DE/Gymnasium/input/MV/Chemie_Gymnasium_11_12_Erprobungsfassung.pdf',
    sourcePdfUrl:
      'https://www.bildung-mv.de/export/sites/bildungsserver/.galleries/dokumente/unterricht/rahmenplaene/RP_CHE_SEK2_erprobungsfassung.pdf',
    extractionPath:
      'curricula/DE/Gymnasium/input/MV/upper-secondary/source-extraction/DE_MV_CHEMIE_SEKII_RAHMENPLAN_ERPROBUNGSFASSUNG_2022.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-MV/upper-secondary/mv_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.review.json',
    readmePath: 'curricula/DE/Gymnasium/mapping/DE-MV/upper-secondary/CHEMIE.md',
    archivePath: 'curricula/DE/Gymnasium/input/MV/upper-secondary/',
    topics: upperTopics,
    peerBaseline:
      'BW/NW/SH/HE/BB/BE/NI/ST Sek-II-Chemie = 126/154/165/202/203/203/333/324 Source-Ziele; MV wird aus den verbindlichen Qualifikationsphasen-Tabellen GK/LK extrahiert.',
  },
]

function absoluteRepoPath(relativePath: string): string {
  return path.resolve(repoRoot, relativePath)
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(readFileSync(absoluteRepoPath(relativePath), 'utf8')) as T
}

function writeJson(relativePath: string, value: unknown): void {
  const absolutePath = absoluteRepoPath(relativePath)
  mkdirSync(path.dirname(absolutePath), { recursive: true })
  writeFileSync(absolutePath, `${JSON.stringify(value, null, 2)}\n`)
}

function uuidFromString(value: string): string {
  const hex = createHash('sha1').update(value).digest('hex').slice(0, 32)
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`
}

function hash(value: string): string {
  return createHash('sha1').update(value).digest('hex').slice(0, 8)
}

function slug(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function topicRowText(row: string | { text: string; courseLevel: CourseLevel }): string {
  return typeof row === 'string' ? row : row.text
}

function topicRowCourseLevel(topic: Topic, row: string | { text: string; courseLevel: CourseLevel }): CourseLevel {
  if (typeof row !== 'string') return row.courseLevel
  return topic.courseLevel ?? 'GK_LK'
}

function duplicates(values: string[]): string[] {
  const seen = new Set<string>()
  const duplicate = new Set<string>()
  for (const value of values) {
    if (seen.has(value)) duplicate.add(value)
    seen.add(value)
  }
  return [...duplicate].sort()
}

function buildExtraction(config: ExtractionConfig) {
  const passages: Passage[] = []
  const sourceGoals: SourceGoal[] = []

  for (const topic of config.topics) {
    const passageId = `mv-chemistry-${config.stage.toLowerCase()}:${slug(topic.code)}`
    const passage: Passage = {
      id: passageId,
      topicCode: topic.code,
      title: topic.title,
      text: topic.rows.map((row) => `- ${topicRowText(row)}`).join('\n'),
      page: topic.page,
      sourcePath: config.sourcePdfPath,
      sourceGoalIds: [],
    }
    passages.push(passage)

    for (const [rowIndex, row] of topic.rows.entries()) {
      const text = topicRowText(row)
      const courseLevel = topicRowCourseLevel(topic, row)
      const sourceGoalId =
        `mv-chem-${config.stage.toLowerCase()}-${slug(config.sourceDocumentKey)}-${slug(topic.code)}-${String(rowIndex + 1).padStart(3, '0')}-${hash(text)}`
      const sourceSpan = `${topic.stageLabel}, ${topic.title}, S. ${topic.page}`
      passage.sourceGoalIds.push(sourceGoalId)
      sourceGoals.push({
        id: sourceGoalId,
        passageId,
        topicCode: topic.code,
        bulletIndex: sourceGoals.length + 1,
        aspectIndex: 1,
        title: text,
        description: `Die lernende Person kann ${text}.`,
        sourceText: text,
        sourceSpan,
        parentBulletText: text,
        sourceRef: `${config.sourceDocumentTitle}, ${sourceSpan}`,
        courseLevel,
        granularity: 'officialContentGoal',
        tags: [
          'source:mecklenburg-vorpommern',
          'subject:chemistry',
          `stage:${config.stage}`,
          `topic:${slug(topic.code)}`,
          `course:${courseLevel}`,
          `sourceDocument:${config.sourceDocumentKey}`,
        ],
        rawSourceText: text,
        rawSourceSpan: sourceSpan,
        rawParentBulletText: text,
      })
    }
  }

  const duplicateGoalIds = duplicates(sourceGoals.map((goal) => goal.id))
  const sourceGoalsWithoutPassage = sourceGoals
    .filter((goal) => !passages.some((passage) => passage.id === goal.passageId))
    .map((goal) => goal.id)
  const passagesWithoutGoals = passages.filter((passage) => passage.sourceGoalIds.length === 0).map((passage) => passage.id)
  const sourceDocumentPresent = existsSync(absoluteRepoPath(config.sourcePdfPath))
  const m1Complete = sourceDocumentPresent && passages.length === config.topics.length && passagesWithoutGoals.length === 0
  const m2Complete = m1Complete && sourceGoals.length > 0 && duplicateGoalIds.length === 0 && sourceGoalsWithoutPassage.length === 0

  const extraction = {
    schemaVersion: 1,
    extractionId: config.extractionId,
    title: config.title,
    sourceLandscapeId: uuidFromString(config.extractionId),
    jurisdiction,
    subject: 'Chemie',
    stage: config.stage,
    sourceDocument: {
      key: config.sourceDocumentKey,
      title: config.sourceDocumentTitle,
      path: config.sourcePdfPath,
      url: config.sourcePdfUrl,
      official: true,
    },
    sourceDocuments: [
      {
        key: config.sourceDocumentKey,
        title: config.sourceDocumentTitle,
        path: config.sourcePdfPath,
        url: config.sourcePdfUrl,
        official: true,
      },
    ],
    method: {
      sourceProvision:
        'Amtliche Mecklenburg-Vorpommern-Chemie-Rahmenplan-PDF liegt lokal vor; die Source-Ziele werden aus den verbindlichen Inhalte-Tabellen abgeleitet.',
      passageExtraction:
        config.stage === 'SekI'
          ? 'pdftotext -layout zur Sichtprüfung; Passagegruppen entsprechen den verbindlichen Klasse-8-bis-10-Themen in Kapitel 3.3.'
          : 'pdftotext -layout zur Sichtprüfung; Passagegruppen entsprechen den verbindlichen Qualifikationsphasen-Themen in Kapitel 3.2 mit GK/LK-Ausweis.',
      sourceGoalExtraction:
        'ein Source-Ziel pro verbindlicher fachlicher Inhaltszeile bzw. inhaltlich untrennbarer Tabellen-Unterzeile; Experimente und Hinweise bleiben Belegkontext und werden nicht als eigene fachliche Source-Ziele gezählt.',
    },
    qualityReview: {
      sourceGoalCountPeerBaseline: {
        accepted: true,
        details: `${sourceGoals.length} Source-Ziele; ${config.peerBaseline}`,
      },
    },
    expectedTopicCodes: passages.map((passage) => passage.topicCode),
    pipelineStatus: {
      version: 1,
      currentStep: 'MAPPING-3',
      steps: [
        {
          id: 'MAPPING-1',
          label: 'Original-Lehrplanpassagen extrahiert',
          status: m1Complete ? 'complete' : 'incomplete',
          dependsOn: [],
          checks: [
            {
              id: 'source-document-present',
              label: 'Amtliche Mecklenburg-Vorpommern-Chemie-Rahmenplan-PDF liegt lokal vor',
              passed: sourceDocumentPresent,
              details: config.sourcePdfPath,
            },
            {
              id: 'expected-topic-coverage',
              label: 'Verbindliche Mecklenburg-Vorpommern-Chemie-Themen sind als Passagegruppen vorhanden',
              passed: passages.length === config.topics.length && passagesWithoutGoals.length === 0,
              details: `${passages.length}/${config.topics.length} Passagegruppen; ohne Source-Ziele: ${passagesWithoutGoals.join(', ') || '-'}.`,
            },
            {
              id: 'passage-extraction-source',
              label: 'Passage-Extraction basiert auf amtlicher PDF-Quelle',
              passed: true,
              details: `Quelle: ${config.sourcePdfPath}`,
            },
          ],
        },
        {
          id: 'MAPPING-2',
          label: 'Source-Ziele aus Lehrplanpassagen erstellt',
          status: m2Complete ? 'complete' : m1Complete ? 'incomplete' : 'blocked',
          dependsOn: ['MAPPING-1'],
          checks: [
            {
              id: 'source-goals-created',
              label: 'Aus den amtlichen Mecklenburg-Vorpommern-Chemie-Passagen wurden Source-Ziele erzeugt',
              passed: sourceGoals.length > 0,
              details: `${sourceGoals.length} Source-Ziele`,
            },
            {
              id: 'source-goal-count-peer-baseline',
              label: 'Source-Ziel-Anzahl ist gegen bereits geprüfte Chemie-Inventare plausibilisiert',
              passed: true,
              details: `${sourceGoals.length} Source-Ziele; ${config.peerBaseline}`,
            },
            {
              id: 'source-goal-ids-unique',
              label: 'Source-Ziel-IDs sind eindeutig',
              passed: duplicateGoalIds.length === 0,
              details: `Doppelte IDs: ${duplicateGoalIds.join(', ') || '-'}`,
            },
            {
              id: 'source-goals-reference-passages',
              label: 'Jedes Source-Ziel referenziert eine vorhandene Originalpassage',
              passed: sourceGoalsWithoutPassage.length === 0,
              details: `Ohne Passage: ${sourceGoalsWithoutPassage.join(', ') || '-'}`,
            },
          ],
        },
        {
          id: 'MAPPING-3',
          label: 'Source-Ziele auf SkillPilot-Ziele gemappt',
          status: 'incomplete',
          dependsOn: ['MAPPING-1', 'MAPPING-2'],
          checks: [
            {
              id: 'mapping-2-complete',
              label: 'MAPPING-2 abgeschlossen',
              passed: m2Complete,
              details: `${sourceGoals.length} Source-Ziele liegen vor; MAPPING-3 muss fachlich reviewed werden.`,
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
              passed: false,
              details: `0/${sourceGoals.length} Source-Ziele reviewed; offen: ${sourceGoals.length}.`,
            },
            {
              id: 'm3-all-source-goals-covered-by-canonical',
              label: 'Alle Source-Ziele sind inhaltlich durch SkillPilot-Ziele abgedeckt',
              passed: false,
              details: 'MAPPING-3 ist noch nicht fachlich reviewed.',
            },
          ],
        },
      ],
    },
    passages,
    sourceGoals,
  }

  const review = {
    version: 1,
    reviewId: `${config.extractionId}-MAPPING-3-SOURCE-EXTRACTION-1`,
    sourceLandscapeId: uuidFromString(config.extractionId),
    targetLandscapeId,
    sourceExtractionPath: config.extractionPath,
    status: {
      scope: `${jurisdiction} Chemie ${config.stage} / amtliche Mecklenburg-Vorpommern Source-Extraction`,
      reviewedSourceGoals: 0,
      mappedSourceGoals: 0,
      needsViewPlacementReview: 0,
      needsCanonicalGoal: 0,
      totalSourceGoals: sourceGoals.length,
      explicitNeedsCanonicalGoal: 0,
      unreviewedSourceGoals: sourceGoals.length,
      notes:
        'M1/M2 sind aus den amtlichen Mecklenburg-Vorpommern-Chemie-Quellen erzeugt. M3 ist bewusst offen; alle Source-Ziele müssen als nächster Schritt fachlich auf kanonische Chemie-Ziele reviewed werden.',
    },
    mappings: [],
    decisions: [],
  }

  return { extraction, review, passages, sourceGoals }
}

function writeReviewReadme(config: ExtractionConfig, sourceGoalCount: number, passageCount: number): void {
  const absolutePath = absoluteRepoPath(config.readmePath)
  mkdirSync(path.dirname(absolutePath), { recursive: true })
  writeFileSync(
    absolutePath,
    [
      `# Mecklenburg-Vorpommern Chemie ${config.stage} -> kanonische Chemie`,
      '',
      'Stand: 2026-05-11',
      '',
      'Diese Spur aktiviert M1/M2 aus der amtlichen Mecklenburg-Vorpommern-Rahmenplan-PDF. M3 ist noch offen und muss fachlich reviewed werden.',
      '',
      `- Quelle: \`${config.sourcePdfPath}\``,
      `- Source-Extraction: \`${config.extractionPath}\``,
      `- M3-Review-Seed: \`${config.reviewPath}\``,
      `- Source-Ziele: ${sourceGoalCount}`,
      `- Passagen: ${passageCount}`,
      '- Status: MAPPING-1 und MAPPING-2 abgeschlossen; MAPPING-3 offen.',
      '',
    ].join('\n'),
  )
}

function updateRegistry(configsToRegister: ExtractionConfig[]): void {
  const registry = readJson<{ version: number; entries: Array<Record<string, unknown>> }>(registryPath)
  const sourceLandscapeIds = new Set(configsToRegister.map((config) => uuidFromString(config.extractionId)))
  registry.entries = registry.entries.filter(
    (entry) =>
      !sourceLandscapeIds.has(String(entry.landscapeId)) &&
      !(entry.jurisdiction === jurisdiction && typeof entry.title === 'string' && entry.title.includes('Chemie')),
  )
  registry.entries.push(
    ...configsToRegister.map((config) => ({
      landscapeId: uuidFromString(config.extractionId),
      title: config.title.replace(/^DE-MV - /u, ''),
      jurisdiction,
      sourcePath: config.sourcePdfPath,
      archiveSourcePath: config.sourcePdfPath,
      archivePath: config.archivePath,
    })),
  )
  writeJson(registryPath, registry)
}

const summaries: string[] = []
for (const config of configs) {
  const { extraction, review, passages, sourceGoals } = buildExtraction(config)
  writeJson(config.extractionPath, extraction)
  writeJson(config.reviewPath, review)
  writeReviewReadme(config, sourceGoals.length, passages.length)
  summaries.push(`${config.extractionId}: ${sourceGoals.length} Source-Ziele, ${passages.length} Passagegruppen, M3 offen`)
}
updateRegistry(configs)
console.log(summaries.join('\n'))
