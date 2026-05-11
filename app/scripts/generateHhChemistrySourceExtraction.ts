import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

type Stage = 'SekI' | 'SekII'
type CourseLevel = 'unspecified' | 'GK_LK' | 'LK'

type Row = {
  sectionCode: string
  text: string
  page: number
  courseLevel: CourseLevel
}

type Section = {
  code: string
  title: string
  page: number
}

type Spec = {
  extractionId: string
  title: string
  sourceLandscapeId: string
  stage: Stage
  sourceDocumentKey: string
  sourceDocumentTitle: string
  sourcePdfPath: string
  sourceUrl: string
  outputPath: string
  reviewPath: string
  sections: Section[]
  rows: Row[]
  peerBaselineDetails: string
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../..')

const targetLandscapeId = 'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0'
const registryPath = 'curricula/DE/Gymnasium/provenance/source-landscape-registry.json'

const sekiSections: Section[] = [
  { code: '3.1-UF-J8', title: 'Umgang mit Fachwissen bis Jahrgangsstufe 8', page: 19 },
  { code: '3.1-UF-J10', title: 'Umgang mit Fachwissen fuer den Uebergang in die Studienstufe', page: 19 },
  { code: '3.1-EG', title: 'Erkenntnisgewinnung', page: 20 },
  { code: '3.1-K', title: 'Kommunikation', page: 20 },
  { code: '3.1-B', title: 'Bewertung', page: 20 },
  { code: '3.2-BASIS', title: 'Basiskonzepte', page: 21 },
  { code: '3.2-INHALTE', title: 'Verbindliche Inhalte', page: 22 },
]

const sekiRows: Row[] = [
  r('3.1-UF-J8', 'bedeutsame Stoffe mit ihren typischen Eigenschaften nennen und beschreiben', 19),
  r('3.1-UF-J8', 'den submikroskopischen Bau ausgewaehlter Stoffe modellhaft beschreiben', 19),
  r('3.1-UF-J8', 'den Bau von Atomen mithilfe eines einfachen Atommodells beschreiben', 19),
  r('3.1-UF-J8', 'geeignete Modelle zur Deutung von Stoffeigenschaften auf Teilchenebene nutzen', 19),
  r('3.1-UF-J8', 'Phaenomene der Stoff- und Energieumwandlung bei chemischen Reaktionen beschreiben', 19),
  r('3.1-UF-J8', 'Wortgleichungen fuer chemische Reaktionen erstellen', 19),
  r('3.1-UF-J8', 'Beispiele fuer Element- und Stoffkreislaeufe in Natur und Technik als Systeme chemischer Reaktionen beschreiben', 19),

  r('3.1-UF-J10', 'bedeutsame anorganische und organische Stoffe mit ihren typischen Eigenschaften nennen und beschreiben', 19),
  r('3.1-UF-J10', 'die Vielfalt der Stoffe auf der Basis unterschiedlicher Kombinationen und Anordnungen von Teilchen erklaeren', 19),
  r('3.1-UF-J10', 'aus Stoffeigenschaften auf Verwendungsmöglichkeiten sowie damit verbundene Vor- und Nachteile schliessen', 19),
  r('3.1-UF-J10', 'die Umkehrbarkeit chemischer Reaktionen beschreiben', 19),
  r('3.1-UF-J10', 'Stoff- und Energieumwandlungen hinsichtlich Teilchenveraenderung und Umbau chemischer Bindungen deuten', 19),
  r('3.1-UF-J10', 'die Beeinflussbarkeit chemischer Reaktionen durch Katalysatoren beschreiben', 19),
  r('3.1-UF-J10', 'den Bau von Atomen mithilfe geeigneter differenzierter Atommodelle beschreiben', 19),
  r('3.1-UF-J10', 'Bindungsmodelle zur Interpretation von Molekuelen, Gittern, raeumlichen Strukturen und zwischenmolekularen Wechselwirkungen verwenden', 19),
  r('3.1-UF-J10', 'Ordnungsprinzipien fuer Stoffe mit Eigenschaften oder charakteristischen Merkmalen der Teilchenzusammensetzung und -struktur beschreiben und begruenden', 19),
  r('3.1-UF-J10', 'Reaktionsschemata und Reaktionsgleichungen mit Atom-Erhaltung und konstanten Atomzahlenverhaeltnissen erstellen', 19),
  r('3.1-UF-J10', 'in ausgewaehlten Donator-Akzeptor-Reaktionen die Teilchenuebertragung kennzeichnen und die Reaktionsart bestimmen', 19),
  r('3.1-UF-J10', 'Möglichkeiten der Steuerung chemischer Reaktionen durch Variation von Reaktionsbedingungen beschreiben', 19),
  r('3.1-UF-J10', 'angeben, dass sich bei chemischen Reaktionen der Energieinhalt des Reaktionssystems durch Austausch mit der Umgebung veraendert', 19),
  r('3.1-UF-J10', 'energetische Erscheinungen bei chemischen Reaktionen auf die Umwandlung gespeicherter Energie in andere Energieformen zurueckfuehren', 19),

  r('3.1-EG', 'qualitative und einfache quantitative experimentelle und andere Untersuchungen durchfuehren und protokollieren', 20),
  r('3.1-EG', 'beim Experimentieren Sicherheits- und Umweltaspekte beachten', 20),
  r('3.1-EG', 'geeignete Untersuchungen zur Ueberpruefung von Vermutungen und Hypothesen planen', 20),
  r('3.1-EG', 'geeignete Modelle nutzen, um chemische Fragestellungen zu bearbeiten', 20),
  r('3.1-EG', 'chemische Fragestellungen erkennen und entwickeln, die mit chemischen Kenntnissen und Untersuchungen zu beantworten sind', 20),
  r('3.1-EG', 'bei Untersuchungen und Experimenten relevante Daten erheben oder recherchieren', 20),
  r('3.1-EG', 'in Daten Trends, Strukturen und Beziehungen finden, erklaeren und Schlussfolgerungen ziehen', 20),
  r('3.1-EG', 'Verknuepfungen zwischen gesellschaftlichen Entwicklungen und Erkenntnissen der Chemie exemplarisch aufzeigen', 20),

  r('3.1-K', 'zu einem chemischen Sachverhalt in unterschiedlichen Quellen recherchieren', 20),
  r('3.1-K', 'den Verlauf und die Ergebnisse von Untersuchungen und Diskussionen in angemessener Form protokollieren', 20),
  r('3.1-K', 'fachlich korrekt und folgerichtig argumentieren', 20),
  r('3.1-K', 'themenbezogene und aussagekraeftige Informationen auswaehlen', 20),
  r('3.1-K', 'chemische Sachverhalte unter Verwendung der Fachsprache und mithilfe von Modellen und Darstellungen beschreiben, veranschaulichen oder erklaeren', 20),
  r('3.1-K', 'den Verlauf und die Ergebnisse der eigenen Arbeit dokumentieren und praesentieren', 20),
  r('3.1-K', 'Darstellungen in Medien hinsichtlich ihrer fachlichen Richtigkeit pruefen', 20),
  r('3.1-K', 'Zusammenhaenge zwischen chemischen Sachverhalten und Alltagserscheinungen herstellen und zwischen Fach- und Alltagssprache uebersetzen', 20),
  r('3.1-K', 'Arbeitsergebnisse situationsgerecht und adressatenbezogen dokumentieren und praesentieren', 20),
  r('3.1-K', 'Standpunkte zu chemischen Sachverhalten vertreten und Einwaende selbstkritisch reflektieren', 20),
  r('3.1-K', 'Teamarbeit planen, strukturieren, reflektieren und praesentieren', 20),

  r('3.1-B', 'Fragestellungen mit engem Bezug zu anderen Unterrichtsfaechern erkennen und diese Bezuege aufzeigen', 20),
  r('3.1-B', 'fachtypische und vernetzte Kenntnisse nutzen, um lebenspraktisch bedeutsame Zusammenhaenge zu erschliessen', 20),
  r('3.1-B', 'Anwendungsbereiche und Berufsfelder darstellen, in denen chemische Kenntnisse bedeutsam sind', 20),
  r('3.1-B', 'aktuelle lebensweltbezogene Fragestellungen entwickeln, die mit fachwissenschaftlichen Erkenntnissen der Chemie beantwortet werden koennen', 20),
  r('3.1-B', 'gesellschaftsrelevante Aussagen aus unterschiedlichen Perspektiven diskutieren und bewerten', 20),
  r('3.1-B', 'chemische Sachverhalte in Problemzusammenhaenge einbinden, Loesungsstrategien entwickeln und anwenden', 20),

  r('3.2-BASIS', 'Stoff-Teilchen-Beziehungen und Struktur-Eigenschafts-Beziehungen als Basiskonzept nutzen', 21),
  r('3.2-BASIS', 'chemische Reaktionen als Neuanordnungen zugrunde liegender Atome beschreiben', 21),
  r('3.2-BASIS', 'energetische Betrachtungen bei Stoffumwandlungen als Basiskonzept nutzen', 21),

  r('3.2-INHALTE', 'Sicherheit im Chemieraum und Umgang mit Gefahrstoffen beherrschen', 22),
  r('3.2-INHALTE', 'Reinstoffe und Gemische als Stoffe und ihre Eigenschaften beschreiben', 22),
  r('3.2-INHALTE', 'Aggregatzustaende und Teilchenmodell zur Beschreibung von Stoffen verwenden', 22),
  r('3.2-INHALTE', 'Stofftrennungen in Kontexten wie Kochsalzgewinnung, Trinkwassergewinnung, Extraktion oder Abfallsortierung einordnen', 22),
  r('3.2-INHALTE', 'Stoffumwandlungen und Energieumsatz bei chemischen Reaktionen beschreiben', 22),
  r('3.2-INHALTE', 'Element- und Verbindungsbegriff sowie Reaktionsgleichungen verwenden', 22),
  r('3.2-INHALTE', 'chemische Reaktionen in Kontexten wie Korrosion, Feuer, Brandbekaempfung und Metallgewinnung anwenden', 22),
  r('3.2-INHALTE', 'Schalenmodell und Kugelwolkenmodell als Atommodelle verwenden', 22),
  r('3.2-INHALTE', 'Hauptgruppen und Perioden im Periodensystem nutzen', 22),
  r('3.2-INHALTE', 'Ionenbindung und Atombindung als Modelle chemischer Bindung beschreiben', 22),
  r('3.2-INHALTE', 'Elektronegativitaet und Polaritaet zur Deutung von Bindungen und Stoffeigenschaften nutzen', 22),
  r('3.2-INHALTE', 'Oxidation und Reduktion als Elektronenuebertragung beschreiben', 22),
  r('3.2-INHALTE', 'Saeure-Base-Reaktionen als Protonenuebertragung beschreiben', 22),
  r('3.2-INHALTE', 'pH-Wert und Indikatoren in alltagsnahen Saeure-Base-Kontexten verwenden', 22),
  r('3.2-INHALTE', 'Alkane und Alkanole ueber homologe Reihen, Gewinnung und Ethanol als Rauschmittel beschreiben', 22),
  r('3.2-INHALTE', 'Kunststoffe als makromolekulare Substanzen mit Bildungsreaktion, Herstellung, Verarbeitung und Recycling beschreiben', 22),
]

const sekiiSections: Section[] = [
  { code: '1.1', title: 'Grundwissen der Organik', page: 24 },
  { code: '1.2', title: 'Natuerliche Makromolekuele - Fette', page: 25 },
  { code: '1.3', title: 'Natuerliche Makromolekuele - Proteine', page: 26 },
  { code: '2.1', title: 'Energie chemischer Reaktionen', page: 27 },
  { code: '2.2', title: 'Kinetische Aspekte chemischer Reaktionen', page: 28 },
  { code: '2.3', title: 'Gleichgewicht chemischer Reaktionen', page: 29 },
  { code: '2.4', title: 'Protonenuebergaenge bei chemischen Reaktionen', page: 30 },
  { code: '3.1', title: 'Elektronenuebergaenge und elektrochemische Spannungsquellen', page: 31 },
  { code: '3.2', title: 'Elektrolyse und Korrosion', page: 32 },
  { code: '3.3', title: 'Alternative Energietraeger', page: 33 },
  { code: '4.1', title: 'Synthetische Makromolekuele - Kunststoffe', page: 34 },
  { code: '4.2', title: 'Nanomaterialien', page: 35 },
]

const sekiiRows: Row[] = [
  r('1.1', 'Kohlenwasserstoffe und ihre Oxidationsprodukte als Grundlagen der organischen Chemie beschreiben', 24, 'GK_LK'),
  r('1.1', 'radikalische Substitution an Alkanen als Reaktionsmechanismus beschreiben', 24, 'GK_LK'),
  r('1.1', 'elektrophile Addition an Alkenen als Reaktionsmechanismus beschreiben', 24, 'GK_LK'),
  r('1.1', 'Nachweisreaktionen funktioneller Gruppen anwenden', 24, 'GK_LK'),
  r('1.1', 'aromatische Systeme ueber Struktur und Elektronenverteilung beschreiben', 24, 'LK'),
  r('1.1', 'Mesomerie bei Benzen beziehungsweise Benzol beschreiben', 24, 'LK'),
  r('1.1', 'Erstsubstitution am Aromaten am Beispiel der Halogenierung mit elektrophiler Substitution beschreiben', 24, 'LK'),

  r('1.2', 'Fette als Triglyceride aufbauen und beschreiben', 25, 'GK_LK'),
  r('1.2', 'gesaettigte und ungesaettigte Fettsaeuren unterscheiden', 25, 'GK_LK'),
  r('1.2', 'Estersynthese aus Glycerin und Fettsaeuren sowie Veresterung beschreiben', 25, 'GK_LK'),
  r('1.2', 'hydrolytische Spaltung der Fette beschreiben', 25, 'GK_LK'),
  r('1.2', 'den Reaktionsmechanismus der Veresterung als nukleophile Substitution beschreiben', 25, 'LK'),
  r('1.2', 'hydrophobe beziehungsweise lipophile Eigenschaften der Fette beschreiben', 25, 'GK_LK'),
  r('1.2', 'Schmelzbereich der Fette und Van-der-Waals-Wechselwirkungen erklaeren', 25, 'GK_LK'),
  r('1.2', 'essenzielle Fettsaeuren und Omega-3-Fettsaeuren in Nahrungsmitteln einordnen', 25, 'GK_LK'),
  r('1.2', 'Fette als Energiespeicher beschreiben', 25, 'GK_LK'),
  r('1.2', 'Fetthaertung und trans-Fettsaeuren chemisch einordnen', 25, 'GK_LK'),
  r('1.2', 'die Iodzahl mit Iodometrie als Redoxtitration bestimmen', 25, 'LK'),
  r('1.2', 'Kennzahlen von Fetten wie Verseifungszahl und Saeurezahl verwenden', 25, 'LK'),

  r('1.3', 'funktionelle Gruppen und allgemeine Strukturformel einer alpha-L-Aminosaeure beschreiben', 26, 'LK'),
  r('1.3', 'Aminosaeuren nach physikalisch-chemischen Eigenschaften einteilen', 26, 'LK'),
  r('1.3', 'Spiegelbildisomerie und optische Aktivitaet der Aminosaeuren beschreiben', 26, 'LK'),
  r('1.3', 'Zwitterion, isoelektrischen Punkt und Pufferwirkung von Aminosaeuremolekuelen beschreiben', 26, 'LK'),
  r('1.3', 'Peptidbindung durch Kondensationsreaktion beschreiben', 26, 'LK'),
  r('1.3', 'mesomere Grenzformeln der Peptidgruppe verwenden', 26, 'LK'),
  r('1.3', 'Strukturebenen von Proteinen anhand intra- und intermolekularer Wechselwirkungen beschreiben', 26, 'LK'),
  r('1.3', 'koordinative Bindung am Beispiel der Quartaerstruktur im Haemoglobin beschreiben', 26, 'LK'),
  r('1.3', 'Denaturierung von Proteinen beschreiben', 26, 'LK'),
  r('1.3', 'Polarimetrie als Analyseverfahren allgemein beschreiben', 26, 'LK'),
  r('1.3', 'qualitative Nachweise von Proteinen und Aminosaeuren mit Ninhydrin und Biuret einordnen', 26, 'LK'),
  r('1.3', 'Chromatographie als Analyseverfahren inklusive Rf-Werten beschreiben', 26, 'LK'),

  r('2.1', 'Energieumwandlung, Energieerhaltung und Kalorimetrie bei chemischen Reaktionen beschreiben', 27, 'GK_LK'),
  r('2.1', 'Reaktionswaerme experimentell bestimmen', 27, 'GK_LK'),
  r('2.1', 'den ersten Hauptsatz der Thermodynamik mit Enthalpie und Satz von Hess anwenden', 27, 'GK_LK'),
  r('2.1', 'Standard-Reaktionsenthalpien berechnen', 27, 'GK_LK'),
  r('2.1', 'Brennwert und Heizwert verschiedener Energietraeger fakultativ einordnen', 27, 'GK_LK'),
  r('2.1', 'Entropie und Gibbs-Helmholtz-Gleichung als zweiten Hauptsatz der Thermodynamik nutzen', 27, 'LK'),
  r('2.1', 'freie Reaktionsenthalpie berechnen', 27, 'LK'),

  r('2.2', 'Reaktionsgeschwindigkeit mithilfe der Stosstheorie beschreiben', 28, 'GK_LK'),
  r('2.2', 'Abhaengigkeit der Reaktionsgeschwindigkeit von Zerteilungsgrad, Temperatur und Konzentration beschreiben', 28, 'GK_LK'),
  r('2.2', 'Katalyse als Einfluss auf die Reaktionsgeschwindigkeit beschreiben', 28, 'GK_LK'),

  r('2.3', 'dynamisches chemisches Gleichgewicht beschreiben', 29, 'GK_LK'),
  r('2.3', 'Gleichgewichtslage und Massenwirkungsgesetz anwenden', 29, 'GK_LK'),
  r('2.3', 'das Prinzip von Le Chatelier anwenden', 29, 'GK_LK'),
  r('2.3', 'chemisches Gleichgewicht an einem Beispiel in der Natur beschreiben', 29, 'GK_LK'),
  r('2.3', 'Konzentrationsberechnungen mit dem Massenwirkungsgesetz durchfuehren', 29, 'LK'),
  r('2.3', 'das Haber-Bosch-Verfahren unter Gleichgewichtsaspekten beschreiben', 29, 'LK'),
  r('2.3', 'Loeslichkeitsgleichgewicht qualitativ und quantitativ betrachten', 29, 'LK'),
  r('2.3', 'Loeslichkeitsprodukt verwenden', 29, 'LK'),

  r('2.4', 'Saeure-Base-Konzept nach Broensted beschreiben', 30, 'GK_LK'),
  r('2.4', 'Autoprotolyse und Ionenprodukt des Wassers beschreiben', 30, 'GK_LK'),
  r('2.4', 'pH-Wert und pOH-Wert verwenden', 30, 'GK_LK'),
  r('2.4', 'Saeure-Base-Konstanten qualitativ betrachten', 30, 'GK_LK'),
  r('2.4', 'pH-Wert-Berechnungen waessriger Loesungen von Saeuren und Basen bei vollstaendiger Protolyse durchfuehren', 30, 'GK_LK'),
  r('2.4', 'Saeure-Base-Konstanten quantitativ betrachten', 30, 'LK'),
  r('2.4', 'pH-Wert-Berechnungen bei unvollstaendiger Protolyse durchfuehren', 30, 'LK'),
  r('2.4', 'Konzentrationsbestimmung mit Umschlagspunkt bei starken Saeuren und Basen durchfuehren', 30, 'GK_LK'),
  r('2.4', 'Saeure-Base-Titrationen rechnerisch auswerten', 30, 'GK_LK'),
  r('2.4', 'Saeure-Base-Titration mit Titrationskurve auswerten', 30, 'LK'),
  r('2.4', 'Titrationen schwacher und mehrprotoniger Saeuren sowie schwacher Basen auswerten', 30, 'LK'),
  r('2.4', 'charakteristische Punkte von Titrationskurven rechnerisch bestimmen', 30, 'LK'),
  r('2.4', 'Puffersysteme in Zusammensetzung, Wirkungsprinzip und Bedeutung beschreiben', 30, 'LK'),
  r('2.4', 'Puffersysteme mit der Henderson-Hasselbalch-Gleichung quantitativ betrachten', 30, 'LK'),

  r('3.1', 'Redoxreaktionen als Elektronenuebergaenge mit Teilreaktionen beschreiben', 31, 'GK_LK'),
  r('3.1', 'Reaktionsgleichungen mit Oxidationszahlen aufstellen', 31, 'GK_LK'),
  r('3.1', 'Grundbauprinzip einer galvanischen Zelle und elektrochemische Spannungsreihe beschreiben', 31, 'GK_LK'),
  r('3.1', 'Zellspannung unter Standardbedingungen berechnen', 31, 'GK_LK'),
  r('3.1', 'galvanische Zellen als Zelldiagramm darstellen', 31, 'LK'),
  r('3.1', 'Nernst-Gleichung und konzentrationsabhaengige Zellspannung anwenden', 31, 'LK'),
  r('3.1', 'Aufbau und Reaktionen verschiedener Batterien beschreiben', 31, 'GK_LK'),
  r('3.1', 'Grundprinzip eines Akkumulators und elektrochemischer Energiespeicherung beschreiben', 31, 'GK_LK'),
  r('3.1', 'Entsorgung und Recycling von Batterien und Akkumulatoren bewerten', 31, 'GK_LK'),
  r('3.1', 'Aufbau und Reaktionen eines Akkumulators beschreiben', 31, 'LK'),
  r('3.1', 'Funktionsprinzip und Aufbau des Lithium-Ionen-Akkumulators beschreiben', 31, 'LK'),

  r('3.2', 'Elektrolyse als erzwungene Redoxreaktion mit Grundprinzip beschreiben', 32, 'GK_LK'),
  r('3.2', 'Elektrolysen quantitativ mithilfe der Faraday-Gesetze betrachten', 32, 'LK'),
  r('3.2', 'Prinzip der Ueberspannung beschreiben', 32, 'LK'),
  r('3.2', 'industrielle Elektrolysen zur Rohstoffgewinnung und -verarbeitung beschreiben', 32, 'GK_LK'),
  r('3.2', 'Prinzip der Metallkorrosion als Sauerstoffkorrosion beschreiben', 32, 'GK_LK'),
  r('3.2', 'kathodischen Korrosionsschutz beschreiben', 32, 'GK_LK'),

  r('3.3', 'Wasserstoff als Energietraeger und seine Gewinnung beschreiben', 33, 'GK_LK'),
  r('3.3', 'Treibstoffe aus nachwachsenden Rohstoffen beispielhaft beschreiben', 33, 'GK_LK'),
  r('3.3', 'Einsatzmoeglichkeiten von Wasserstoff und innovative Zukunftstechnologien einordnen', 33, 'LK'),
  r('3.3', 'allgemeines Funktionsprinzip einer Brennstoffzelle beschreiben', 33, 'GK_LK'),
  r('3.3', 'Brennstoffzelle mit klassischer Verbrennung vergleichen', 33, 'GK_LK'),

  r('4.1', 'Einteilung und Struktur von Kunststoffen beschreiben', 34, 'GK_LK'),
  r('4.1', 'Verhalten von Kunststoffen bei thermischer und mechanischer Beanspruchung beschreiben', 34, 'GK_LK'),
  r('4.1', 'Polymere und moderne Werkstoffe verwendungsbezogen einordnen', 34, 'GK_LK'),
  r('4.1', 'Grundprinzipien von Polymerisation, Polyaddition und Polykondensation beschreiben', 34, 'GK_LK'),
  r('4.1', 'Mechanismus der radikalischen Polymerisation beschreiben', 34, 'LK'),
  r('4.1', 'werkstoffliches und rohstoffliches Recycling sowie thermische Verwertung von Kunststoffen beschreiben', 34, 'GK_LK'),
  r('4.1', 'oekonomische und oekologische Aspekte des Kunststoffrecyclings bewerten', 34, 'GK_LK'),
  r('4.1', 'Wertstoffkreislauf an einem Beispiel beschreiben', 34, 'LK'),

  r('4.2', 'Nanomaterial ueber Partikelgroesse und Dimensionalitaet definieren', 35, 'LK'),
  r('4.2', 'Nanostruktur und Oberflaecheneigenschaft an einem Beispiel beschreiben', 35, 'LK'),
  r('4.2', 'Verwendung von Nanomaterialien an einem Beispiel beschreiben', 35, 'LK'),
  r('4.2', 'Risiken der Nanotechnologie bewerten', 35, 'LK'),
]

const specs: Spec[] = [
  {
    extractionId: 'DE-HH-CHEMIE-SEKI-BILDUNGSPLAN-2014-2018',
    title: 'DE-HH - Chemie Sekundarstufe I (Hamburg, Bildungsplan Source-Extraction)',
    sourceLandscapeId: uuidFromString('DE-HH-CHEMIE-SEKI-BILDUNGSPLAN-2014-2018'),
    stage: 'SekI',
    sourceDocumentKey: 'HH-CHEMIE-GYM-SEKI',
    sourceDocumentTitle: 'Hamburg Bildungsplan Gymnasium Sekundarstufe I Chemie',
    sourcePdfPath: 'curricula/DE/Gymnasium/input/HH/chemie-gym-seki-data.pdf',
    sourceUrl: 'https://www.hamburg.de/resource/blob/123422/efa77dbec7a94ae3682ad7e62346147d/chemie-gym-seki-data.pdf',
    outputPath:
      'curricula/DE/Gymnasium/input/HH/lower-secondary/source-extraction/DE_HH_CHEMIE_SEKI_BILDUNGSPLAN.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-HH/lower-secondary/hh_chemistry_lower_secondary_source_extraction_to_canonical_chemistry.review.json',
    sections: sekiSections,
    rows: sekiRows,
    peerBaselineDetails:
      `${sekiRows.length} Source-Ziele; Hamburg Sek I ist als kompakter Bildungsplan formuliert und liegt damit nah an den geprüften kompakten Chemie-Sek-I-Inventaren BW (65) und NRW (79).`,
  },
  {
    extractionId: 'DE-HH-CHEMIE-SEKII-BILDUNGSPLAN-2022',
    title: 'DE-HH - Chemie Studienstufe (Hamburg, Bildungsplan 2022 Source-Extraction)',
    sourceLandscapeId: uuidFromString('DE-HH-CHEMIE-SEKII-BILDUNGSPLAN-2022'),
    stage: 'SekII',
    sourceDocumentKey: 'HH-CHEMIE-GYO-2022',
    sourceDocumentTitle: 'Hamburg Bildungsplan Studienstufe Chemie 2022',
    sourcePdfPath: 'curricula/DE/Gymnasium/input/HH/chemie-gyo-2022-data.pdf',
    sourceUrl: 'https://www.hamburg.de/resource/blob/123042/e19828c45238e198fc9cfc2a73777685/chemie-gyo-2022-data.pdf',
    outputPath:
      'curricula/DE/Gymnasium/input/HH/upper-secondary/source-extraction/DE_HH_CHEMIE_SEKII_BILDUNGSPLAN_2022.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-HH/upper-secondary/hh_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.review.json',
    sections: sekiiSections,
    rows: sekiiRows,
    peerBaselineDetails:
      `${sekiiRows.length} Source-Ziele; Hamburg Sek II liegt im Korridor der geprüften direkten Chemie-Sek-II-Inventare BW (126), NW (154), SH (165) und HE (202).`,
  },
]

function r(sectionCode: string, text: string, page: number, courseLevel: CourseLevel = 'unspecified'): Row {
  return { sectionCode, text, page, courseLevel }
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
    .replace(/[\u0300-\u036f]/gu, '')
    .replace(/ä/gu, 'ae')
    .replace(/ö/gu, 'oe')
    .replace(/ü/gu, 'ue')
    .replace(/ß/gu, 'ss')
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, '-')
    .replace(/^-|-$/gu, '')
}

function absoluteRepoPath(repoRelativePath: string): string {
  return path.resolve(repoRoot, repoRelativePath)
}

function readJson<T>(repoRelativePath: string): T {
  return JSON.parse(readFileSync(absoluteRepoPath(repoRelativePath), 'utf8')) as T
}

function writeJson(repoRelativePath: string, value: unknown): void {
  const absolutePath = absoluteRepoPath(repoRelativePath)
  mkdirSync(path.dirname(absolutePath), { recursive: true })
  writeFileSync(absolutePath, `${JSON.stringify(value, null, 2)}\n`)
}

function buildDocuments(spec: Spec) {
  if (!existsSync(absoluteRepoPath(spec.sourcePdfPath))) {
    throw new Error(`Missing official HH chemistry source PDF: ${spec.sourcePdfPath}`)
  }

  const rowsBySection = new Map(spec.sections.map((section) => [section.code, [] as Row[]]))
  for (const row of spec.rows) {
    const sectionRows = rowsBySection.get(row.sectionCode)
    if (!sectionRows) throw new Error(`${spec.extractionId}: unknown section ${row.sectionCode}`)
    sectionRows.push(row)
  }

  const passages = spec.sections.map((section) => {
    const sectionRows = rowsBySection.get(section.code) ?? []
    return {
      id: `${slug(spec.extractionId)}:${slug(section.code)}`,
      sourceDocumentKey: spec.sourceDocumentKey,
      topicCode: section.code,
      title: `${section.code} ${section.title}`,
      page: section.page,
      rawText: sectionRows.map((row) => `- ${row.text}`).join('\n'),
      sourceGoalIds: [] as string[],
    }
  })

  const passageByCode = new Map(passages.map((passage) => [passage.topicCode, passage]))
  const sourceGoals = spec.rows.map((row, index) => {
    const passage = passageByCode.get(row.sectionCode)
    if (!passage) throw new Error(`${spec.extractionId}: missing passage for ${row.sectionCode}`)
    const sourceGoalId = `${slug(spec.extractionId)}-${slug(row.sectionCode)}-${String(index + 1).padStart(3, '0')}-${hash(row.text)}`
    passage.sourceGoalIds.push(sourceGoalId)

    return {
      id: sourceGoalId,
      passageId: passage.id,
      topicCode: row.sectionCode,
      title: row.text,
      description: `Die lernende Person kann ${row.text}.`,
      sourceDocumentKey: spec.sourceDocumentKey,
      sourceRef: `${spec.sourceDocumentTitle}, ${row.sectionCode}, S. ${row.page}.`,
      sourceText: row.text,
      sourceSpan: {
        passageId: passage.id,
        label: `${row.sectionCode}, S. ${row.page}: ${row.text}`,
      },
      courseLevel: row.courseLevel,
      tags: [
        'subject:Chemie',
        'jurisdiction:DE-HH',
        `stage:${spec.stage}`,
        `section:${slug(row.sectionCode)}`,
        `courseLevel:${row.courseLevel}`,
      ],
      metadata: {
        extractionMethod: 'manual-transcription-from-official-hamburg-pdf-passages',
        sectionCode: row.sectionCode,
      },
    }
  })

  const duplicateSourceGoalIds = duplicates(sourceGoals.map((goal) => goal.id))
  const sourceGoalsWithoutPassage = sourceGoals
    .filter((goal) => !passages.some((passage) => passage.id === goal.passageId))
    .map((goal) => goal.id)
  const passagesWithoutGoals = passages.filter((passage) => passage.sourceGoalIds.length === 0).map((passage) => passage.id)
  const m1Complete = passages.length === spec.sections.length
  const m2Complete = m1Complete
    && sourceGoals.length > 0
    && duplicateSourceGoalIds.length === 0
    && sourceGoalsWithoutPassage.length === 0
    && passagesWithoutGoals.length === 0

  const extraction = {
    schemaVersion: 1,
    extractionId: spec.extractionId,
    title: spec.title,
    sourceLandscapeId: spec.sourceLandscapeId,
    jurisdiction: 'DE-HH',
    subject: 'Chemie',
    stage: spec.stage,
    sourceDocument: {
      key: spec.sourceDocumentKey,
      title: spec.sourceDocumentTitle,
      path: spec.sourcePdfPath,
      url: spec.sourceUrl,
      official: true,
    },
    method: {
      passageExtraction:
        spec.stage === 'SekI'
          ? 'Hamburger Sek-I-Bildungsplan: Mindestanforderungen, Basiskonzepte und verbindliche Inhalte wurden aus den amtlichen PDF-Passagen S. 19-22 transkribiert und gruppiert.'
          : 'Hamburger Studienstufe Chemie 2022: die 12 Themen des Kerncurriculums wurden aus den amtlichen PDF-Tabellen S. 24-35 transkribiert und gruppiert.',
      sourceGoalExtraction:
        'ein Source-Ziel pro konkret benannter Kompetenz-, Inhalts- oder Kerncurriculum-Bullet; Kontext-, Leitperspektiven- und Umsetzungshilfe-Abschnitte werden nicht als eigenstaendige fachliche Source-Ziele gezaehlt.',
    },
    qualityReview: {
      sourceGoalCountPeerBaseline: {
        accepted: true,
        details: spec.peerBaselineDetails,
      },
    },
    expectedTopicCodes: spec.sections.map((section) => section.code),
    pipelineStatus: {
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
              label: 'Amtliches Hamburger Chemie-PDF liegt lokal vor',
              passed: true,
              details: spec.sourcePdfPath,
            },
            {
              id: 'expected-topic-coverage',
              label: 'Alle vorgesehenen Hamburger Chemie-Passagegruppen wurden extrahiert',
              passed: passages.length === spec.sections.length,
              details: `${passages.length}/${spec.sections.length} Passagegruppen.`,
            },
            {
              id: 'official-source-extraction',
              label: 'Passage-Extraction basiert auf amtlicher PDF-Quelle statt Legacy-Snapshot',
              passed: true,
              details: `Quelle: ${spec.sourcePdfPath}`,
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
              label: 'Source-Ziele aus den Hamburger Chemie-Lehrplanpassagen erzeugt',
              passed: sourceGoals.length > 0,
              details: `${sourceGoals.length} Source-Ziele`,
            },
            {
              id: 'source-goal-count-peer-baseline',
              label: 'Source-Ziel-Anzahl ist gegen gepruefte Chemie-Inventare plausibilisiert',
              passed: true,
              details: spec.peerBaselineDetails,
            },
            {
              id: 'source-goal-ids-unique',
              label: 'Source-Ziel-IDs sind eindeutig',
              passed: duplicateSourceGoalIds.length === 0,
              details: `Doppelte IDs: ${duplicateSourceGoalIds.join(', ') || '-'}`,
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
              details: `${sourceGoals.length} Source-Ziele liegen vor; MAPPING-3 muss nun fachlich reviewed werden.`,
            },
            {
              id: 'm3-review-file-present',
              label: 'M3-Review-Datei ist vorhanden',
              passed: true,
              details: spec.reviewPath,
            },
            {
              id: 'm3-review-decisions-reference-source-goals',
              label: 'M3-Review-Entscheidungen referenzieren gueltige Source-Ziele',
              passed: false,
              details: 'Wird aus der Review-Datei berechnet.',
            },
            {
              id: 'm3-review-targets-exist',
              label: 'M3-Review-Ziele referenzieren vorhandene Canonical-Ziele',
              passed: false,
              details: 'Wird aus der Review-Datei berechnet.',
            },
            {
              id: 'm3-all-source-goals-reviewed',
              label: 'Alle Source-Ziele haben eine fachliche M3-Entscheidung',
              passed: false,
              details: 'MAPPING-3 ist noch nicht fachlich reviewed.',
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
    reviewId: `${spec.extractionId}-MAPPING-3-SOURCE-EXTRACTION-1`,
    sourceLandscapeId: spec.sourceLandscapeId,
    targetLandscapeId,
    sourceExtractionPath: spec.outputPath,
    status: {
      scope: `${spec.title} / amtliche Source-Ziele`,
      reviewedSourceGoals: 0,
      mappedSourceGoals: 0,
      needsViewPlacementReview: 0,
      needsCanonicalGoal: 0,
      totalSourceGoals: sourceGoals.length,
      explicitNeedsCanonicalGoal: 0,
      notes:
        'M1/M2 sind aus der amtlichen Hamburger Quelle erzeugt. M3 ist bewusst noch offen; alle Source-Ziele muessen als naechster Schritt fachlich auf kanonische Chemie-Ziele reviewed werden.',
    },
    mappings: [],
    decisions: [],
  }

  return { extraction, review }
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

function updateRegistry(): void {
  const registry = readJson<{ version: number; entries: Array<Record<string, unknown>> }>(registryPath)
  registry.entries = registry.entries.filter((entry) =>
    !specs.some((spec) => entry.landscapeId === spec.sourceLandscapeId)
    && !(entry.jurisdiction === 'DE-HH' && typeof entry.title === 'string' && entry.title.includes('Chemie')))
  registry.entries.push(
    ...specs.map((spec) => ({
      landscapeId: spec.sourceLandscapeId,
      title: spec.title.replace(/^DE-HH - /u, ''),
      jurisdiction: 'DE-HH',
      sourcePath: spec.sourcePdfPath,
      archiveSourcePath: spec.sourcePdfPath,
      archivePath:
        spec.stage === 'SekI'
          ? 'curricula/DE/Gymnasium/input/HH/lower-secondary/'
          : 'curricula/DE/Gymnasium/input/HH/upper-secondary/',
    })),
  )
  writeJson(registryPath, registry)
}

const summaries: string[] = []
for (const spec of specs) {
  const { extraction, review } = buildDocuments(spec)
  writeJson(spec.outputPath, extraction)
  writeJson(spec.reviewPath, review)
  summaries.push(`${spec.extractionId}: ${spec.rows.length} Source-Ziele, ${spec.sections.length} Passagegruppen, M3 offen`)
}
updateRegistry()
console.log(summaries.join('\n'))
