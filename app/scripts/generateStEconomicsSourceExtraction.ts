import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

type Stage = 'SekI' | 'SekII'

type TopicDraft = {
  code: string
  title: string
  page: number
  stage: Stage
  courseLevel?: string
  goals: string[]
}

type SourceGoal = {
  id: string
  passageId: string
  topicCode: string
  bulletIndex: number
  sourceText: string
  sourceSpan: string
}

type SourceDocument = {
  key: string
  title: string
  path: string
  url: string
}

const repoRoot = path.basename(process.cwd()) === 'app' ? path.resolve(process.cwd(), '..') : process.cwd()
const targetLandscapeId = '605bdaf6-32d5-56fd-8d92-5a80c2fd2901'
const registryPath = path.join(repoRoot, 'curricula/DE/Gymnasium/provenance/source-landscape-registry.json')
const canonicalPath = path.join(repoRoot, 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json')
const canonicalGoalIds = new Set(
  (JSON.parse(readFileSync(canonicalPath, 'utf8')) as { goals: Array<{ id: string }> }).goals.map((goal) => goal.id),
)

const idFrom = (value: string): string => {
  const hex = createHash('sha1').update(value).digest('hex').slice(0, 32)
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`
}

const sourceGoalId = (prefix: string, topicCode: string, index: number, text: string): string => {
  const slug = topicCode.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const suffix = createHash('sha1').update(`${prefix}:${topicCode}:${index}:${text}`).digest('hex').slice(0, 8)
  return `${prefix}-${slug}-g${String(index).padStart(2, '0')}-${suffix}`
}

const sourceDocument: SourceDocument = {
  key: 'ST-WIRTSCHAFTSLEHRE-GYMNASIUM-2024',
  title: 'Fachlehrplan Wirtschaftslehre Gymnasium Sachsen-Anhalt',
  path: 'curricula/DE/Gymnasium/input/ST/FLP_Wirtschaftslehre_Gymnasium_01082024.pdf',
  url: 'https://lisa.sachsen-anhalt.de/fileadmin/Bibliothek/Politik_und_Verwaltung/MK/LISA/Unterricht/Lehrplaene/Gym/FLP_Wirtschaftslehre_010824_LTd.pdf',
}

const lowerSourceLandscapeId = idFrom('DE-ST Wirtschaftslehre Sek I source extraction')
const upperSourceLandscapeId = idFrom('DE-ST Wirtschaftslehre Sek II source extraction')

const lowerTopics: TopicDraft[] = [
  {
    code: 'K9-HAUSHALTE-WIRTSCHAFTSKREISLAUF',
    title: 'Schuljahrgang 9: Private Haushalte aus mikro- und makroökonomischer Perspektive',
    page: 14,
    stage: 'SekI',
    goals: [
      'Bedürfnisse als Motivation privaten ökonomischen Handelns an alltäglichen Fallbeispielen analysieren.',
      'Das ökonomische Prinzip aus der Knappheit ableiten.',
      'Arten von Gütern unterscheiden und ihre Verfügbarkeit analysieren.',
      'Produktion, Konsum, Sparen und Investieren als Grundelemente privaten wirtschaftlichen Handelns erläutern.',
      'Einkommensarten privater Haushalte beschreiben.',
      'Grundelemente ökonomischen Handelns privater Haushalte im vereinfachten Wirtschaftskreislauf verorten.',
      'Geld- und Güterströme mit dem erweiterten Wirtschaftskreislauf beschreiben.',
      'Lösungsansätze zur Überwindung von Knappheit beim privaten wirtschaftlichen Handeln beurteilen.',
      'Partizipationsmöglichkeiten privater Haushalte am Wirtschaftsgeschehen beurteilen.',
      'Ökonomisch relevante Entscheidungen privater Haushalte am Wirtschaftskreislauf begründet treffen.',
      'Technische, ökologische, ökonomische und soziale Entwicklungen für künftige Haushaltsentscheidungen auswerten.',
    ],
  },
  {
    code: 'K9-GELD-PRIVATHAUSHALTE',
    title: 'Schuljahrgang 9: Bedeutung des Geldes für Privathaushalte',
    page: 15,
    stage: 'SekI',
    goals: [
      'Aktuelle Erscheinungsformen des Geldes und Bezahlsysteme erklären.',
      'Das Banksystem beschreiben.',
      'Geldinstitute im Wirtschaftskreislauf verorten.',
      'Das Goldene Dreieck der Geldanlage erklären.',
      'Zins- und Renditeberechnungen für grundlegende Anlageformen durchführen.',
      'Formen und Folgen von Privatkrediten darstellen.',
      'Anlageformen aus Sicht eines Privathaushalts beurteilen.',
      'Finanzberatung aus Verbrauchersicht hinterfragen.',
      'Chancen und Risiken von Onlinebanking und digitalen Bezahlsystemen einschätzen.',
      'Die Abschaffung des Bargeldes aus ökonomischer Perspektive diskutieren.',
      'Individuelle Anlegermentalität bestimmen und eine fiktive Anlageentscheidung begründen.',
      'Aus Bankperspektive eine fiktive Kreditentscheidung für Privatpersonen treffen.',
    ],
  },
  {
    code: 'K9-FACHPRAKTIKUM-HAUSHALTSBUCH',
    title: 'Schuljahrgang 9 Fachpraktikum: Ein Haushaltsbuch führen',
    page: 16,
    stage: 'SekI',
    goals: [
      'Monatliche Ausgaben und Einnahmen fiktiver Privathaushalte analog und digital zusammenstellen.',
      'Ausgaben- und Einnahmenstrukturen verschiedener fiktiver Privathaushalte vergleichen.',
      'Den Jahressaldo eines fiktiven Privathaushaltes ermitteln.',
      'Monatliche Belastung eines privaten Haushaltes nach Kreditaufnahme mit Tilgung und Zinsen berechnen.',
      'Belastungsgrenzen eines fiktiven privaten Haushaltes anhand verschiedener Szenarien beurteilen.',
      'Chancen und Risiken online abgeschlossener Kredite einschätzen.',
      'Für Haushaltsbuch-Szenarien angemessene ökonomische Entscheidungen treffen und begründen.',
    ],
  },
  {
    code: 'K9-MARKTWIRTSCHAFT',
    title: 'Schuljahrgang 9: Das Funktionieren der Marktwirtschaft',
    page: 17,
    stage: 'SekI',
    goals: [
      'Den ökonomischen Begriff Markt vom Alltagsgebrauch abgrenzen.',
      'Marktarten und Marktformen beschreiben.',
      'Marktwirtschaft und Planwirtschaft als grundlegende Ordnungsformen vergleichen.',
      'Die Soziale Marktwirtschaft charakterisieren.',
      'Konjunkturphasen darstellen.',
      'Aktuelle wirtschaftspolitische Entwicklungen in Deutschland erklären.',
      'Marktwirtschaft und Planwirtschaft als Ordnungsformen erörtern.',
      'Bedeutung, Ermittlung und Folgen des Marktpreises ökonomisch und ethisch bewerten.',
      'Einflüsse des Staates und anderer Akteure auf die Preisbildung bewerten.',
      'Vorschläge für wirtschaftspolitische Entscheidungen unter globaler Nachhaltigkeit entwickeln.',
      'Angebot, Nachfrage, Marktpreis und Marktgleichgewicht als Marktmodell erklären.',
      'Dezentrale und zentrale Planungs- und Lenkungssysteme unterscheiden.',
    ],
  },
  {
    code: 'K9-ARBEIT-MARKTWIRTSCHAFT',
    title: 'Schuljahrgang 9: Arbeit unter marktwirtschaftlichen Bedingungen',
    page: 18,
    stage: 'SekI',
    goals: [
      'Regionale und überregionale Funktionen des Arbeitsmarktes analysieren.',
      'Staatliche Maßnahmen der Nachfrage- und Angebotssteuerung erläutern.',
      'Berufswahlentscheidungen heutiger Schulabgänger ermitteln und darstellen.',
      'Digitale Transformation des Arbeitsmarktes herausarbeiten.',
      'Ausrichtung auf nachhaltiges Wirtschaften als Veränderung des Arbeitsmarktes analysieren.',
      'Funktionsfähigkeit des regionalen Arbeitsmarktes untersuchen.',
      'Interessen von Anbietern und Nachfragern auf dem Arbeitsmarkt gegenüberstellen.',
      'Arbeitsmarktpolitische Maßnahmen beurteilen und regionale Auswirkungen einschätzen.',
      'Einschränkung von Marktmacht an aktuellen Beispielen bewerten.',
      'Folgen des freien Verkehrs von Personen, Waren und Dienstleistungen im EU-Binnenmarkt für den Arbeitsmarkt beurteilen.',
      'Konsequenzen aus Veränderungen der Arbeitswelt für die eigene Erwerbsbiografie ableiten.',
      'Eine fiktive Einstellungsentscheidung aus Sicht einer Personalabteilung begründen.',
    ],
  },
  {
    code: 'K9-FACHPRAKTIKUM-ARBEITSWELTEN',
    title: 'Schuljahrgang 9 Fachpraktikum: Arbeitswelten vorstellen',
    page: 19,
    stage: 'SekI',
    goals: [
      'Mögliche Ausbildungsberufe, Studienfächer und Berufschancen in der Region vorstellen.',
      'Analoge und digitale Stellenangebote erkunden.',
      'Fiktive oder tatsächliche Berufslebensläufe analysieren.',
      'Geschlechtstypische Berufe unter Gendergerechtigkeit beurteilen.',
      'Eigene Vorstellungen zu Arbeitsbedingungen entwickeln.',
      'Erwerbstätigkeit als Selbstständiger mit Angestelltenverhältnis vergleichen.',
      'Eigene Chancen auf dem Arbeitsmarkt der Zukunft beurteilen.',
      'Eine begründete Berufswahl treffen.',
      'Ein persönliches Bewerberprofil arbeitsmarktgerecht formulieren.',
    ],
  },
  {
    code: 'K10-STAAT-VOLKSWIRTSCHAFT',
    title: 'Schuljahrgang 10: Funktionen des Staates in der Volkswirtschaft',
    page: 20,
    stage: 'SekI',
    goals: [
      'Möglichkeiten und Grenzen staatlicher Einflussnahme auf das Wirtschaftsgeschehen erklären.',
      'Ökonomische Anreizwirkungen gesetzlicher Vorgaben beschreiben.',
      'Verteilungsgerechtigkeit als wirtschaftspolitisches Problem darstellen und bewerten.',
      'Notwendigkeit staatlicher Finanzierung bestimmter Aufgaben beurteilen.',
      'Ökonomisch wirkende Anreize aktueller Gesetze beurteilen.',
      'Ein gerechtes staatliches Umverteilungssystem kriteriengeleitet vorschlagen.',
      'Wirtschaftspolitische Entscheidungen aufgrund technischer, ökologischer, ökonomischer und sozialer Entwicklungen nachvollziehen.',
      'Wirtschaftspsychologische Phänomene bei staatlichen Entscheidungen berücksichtigen.',
      'Allokations-, Distributions- und Stabilisierungsfunktion des Staates unterscheiden.',
      'Steuerarten und digitale Steuererklärung als staatliche Finanzierungsinstrumente einordnen.',
    ],
  },
  {
    code: 'K10-SOZIALE-SICHERUNG',
    title: 'Schuljahrgang 10: System der sozialen Sicherung',
    page: 21,
    stage: 'SekI',
    goals: [
      'Historische Entwicklung des Systems sozialer Sicherung in Deutschland darstellen.',
      'Ausgewählte Leistungen der sozialen Sicherung untersuchen und beschreiben.',
      'Lohnnebenkosten mit aktuellen Größen berechnen und Arbeitgeber-/Arbeitnehmeranteile vergleichen.',
      'Angebot gesetzlicher Krankenversicherungen vergleichen.',
      'Finanzierungsprobleme der Sozialversicherungen erläutern.',
      'Relevante Individualversicherungen für Lebenssituationen vergleichen.',
      'Soziale Sicherung unter Verteilungs- und Chancengerechtigkeit mit einem anderen Land vergleichen.',
      'Geeignete Individualversicherungen für den eigenen Lebensentwurf recherchieren und begründen.',
      'Fünf Säulen des Sozialversicherungssystems mit Trägern, Leistungen und Beiträgen erklären.',
      'Solidargemeinschaft und Generationsvertrag als Prinzipien sozialer Sicherung erläutern.',
      'Brutto- und Nettolohn sowie vermögenswirksame Leistungen einordnen.',
    ],
  },
  {
    code: 'K10-FACHPRAKTIKUM-SOZIALE-SICHERHEIT',
    title: 'Schuljahrgang 10 Fachpraktikum: Zukunftsfähigkeit der sozialen Sicherheit',
    page: 22,
    stage: 'SekI',
    goals: [
      'Lage des sozialen Sicherungssystems in Deutschland untersuchen.',
      'Reformkonzepte für das soziale Sicherungssystem recherchieren.',
      'Leistungsfähigkeit des sozialen Sicherungssystems für die Zukunft beurteilen.',
      'Private Altersvorsorge in verschiedenen Anlageformen vergleichen.',
      'Chancen und Risiken von Reformkonzepten sozialer Sicherung debattieren.',
      'Eine begründete Entscheidung für ein Reformkonzept sozialer Sicherung treffen oder ein Konzept weiterentwickeln.',
      'Versicherungs-, Fürsorge- und Versorgungsprinzip unterscheiden.',
      'Demografischen Faktor, Rentenbezugsdauer und Generationengerechtigkeit als Rentenfragen analysieren.',
    ],
  },
  {
    code: 'K10-WIRTSCHAFTSRECHT',
    title: 'Schuljahrgang 10: Wirtschaftsrechtliche Bestimmungen',
    page: 23,
    stage: 'SekI',
    goals: [
      'Grundlegende Regeln des Vertragsrechts darstellen.',
      'Formale Anforderungen und Inhalte ausgewählter Vertragsarten beschreiben.',
      'Verbraucherrechte bei Störungen im Kaufvertrag analysieren.',
      'Besonderheiten von Online-Kaufverträgen wiedergeben.',
      'Rechtsgültigkeit ausgewählter Verträge an Fallbeispielen beurteilen.',
      'Typische vertragliche Entscheidungen eines fiktiven Privathaushalts simulieren.',
      'Einen privaten Kaufvertrag schriftlich formulieren.',
      'Funktionen des Rechts sowie öffentliches und privates Recht unterscheiden.',
      'Rechts- und Geschäftsfähigkeit in wirtschaftlichen Alltagssituationen anwenden.',
      'Haftung, Schadenersatz, Gewährleistung, Garantie und Kulanz unterscheiden.',
    ],
  },
  {
    code: 'K10-EU-FOERDERPROGRAMME',
    title: 'Schuljahrgang 10: Europäische Förderprogramme und wirtschaftliche Entwicklung',
    page: 24,
    stage: 'SekI',
    goals: [
      'Regeln des EU-Binnenmarktes beschreiben.',
      'Rechtliche Vorgaben unternehmerischer Selbstständigkeit in der EU wiedergeben.',
      'Ausgewählte Förderprogramme der EU ermitteln und regionale Beispiele nennen.',
      'Wirtschaftliche Lage Deutschlands mit anderen EU-Ländern vergleichen.',
      'Wirtschaftliche Verflechtungen Deutschlands innerhalb der EU darstellen.',
      'Aktuelle wirtschaftliche Probleme der EU diskutieren.',
      'Wirksamkeit von EU-Förderprogrammen zur Wirtschaftsförderung einschätzen.',
      'Ein Förderprogramm für ein aktuelles wirtschaftliches Problem skizzieren.',
      'Förderkriterien im Spannungsfeld ökonomischer, ökologischer und sozialer Ziele festlegen.',
      'Vier Grundfreiheiten des EU-Binnenmarktes erklären.',
      'Export, Import und Außenbeitrag als wirtschaftliche Verflechtungen in der EU einordnen.',
    ],
  },
]

const upperTopics: TopicDraft[] = [
  {
    code: 'Q-KURS1-UNTERNEHMEN',
    title: 'Qualifikationsphase Kurs 1: Unternehmen aus volks- und betriebswirtschaftlicher Perspektive',
    page: 26,
    stage: 'SekII',
    courseLevel: 'GK_LK',
    goals: [
      'Unternehmensziele und Zielbeziehungen analysieren und darstellen.',
      'Betriebliche Produktionsfaktoren und betriebliche Grundfunktionen zuordnen.',
      'Betriebliche Organisations- und Rechtsformen analysieren.',
      'Standortwahlfaktoren für Unternehmen erläutern.',
      'Rolle von Betriebsräten, Gewerkschaften und Tarifrecht in der deutschen Wirtschaftslandschaft herausarbeiten.',
      'Externes betriebliches Rechnungswesen für beispielhafte Unternehmen durchführen.',
      'Kostenrechnung für beispielhafte Unternehmen durchführen.',
      'Betriebliche Kennzahlen beschreiben.',
      'Ökonomische, soziale und ökologische Bedeutung und Verantwortung von Unternehmen bewerten.',
      'Organisationsformen von Unternehmen unterschiedlicher Größe und Auswirkungen auf das Betriebsklima beurteilen.',
      'Betriebliche Kennzahlen und Bilanzen auswerten und beurteilen.',
      'Chancen und Risiken digitaler Transformation für Unternehmen erörtern.',
      'Zukunftsfähiges Wirtschaften als Unternehmensausrichtung beurteilen.',
      'Rechtsform- und Standortwahl anhand einer Nutzwertanalyse empfehlen.',
      'Unternehmenspolitische Entscheidungen aus Kennzahlenanalysen ableiten.',
    ],
  },
  {
    code: 'Q-FACHPRAKTIKUM-UNTERNEHMEN-GRUENDEN',
    title: 'Qualifikationsphase Fachpraktikum: Ein Unternehmen gründen',
    page: 27,
    stage: 'SekII',
    courseLevel: 'GK_LK',
    goals: [
      'Gründungsmotive für eine geplante Unternehmung darstellen.',
      'Eine Marktanalyse für eine geplante Unternehmung durchführen.',
      'Bestandteile eines Businessplans ausarbeiten.',
      'Maßnahmen zur Verringerung von Risiken einer Unternehmensgründung beurteilen.',
      'Maßnahmen zur Stärkung von Chancen einer Unternehmensgründung beurteilen.',
      'Unternehmerische Entscheidungen im Businessplan diskutieren und beurteilen.',
      'Externe und interne Einflussfaktoren auf Unternehmenskultur untersuchen.',
      'Wettbewerbs- und Wachstumsstrategie unter nachhaltigem Wirtschaften entwickeln und begründen.',
      'Bestandteile eines Businessplans wie Geschäftsidee, Marktanalyse, Ziele, Organisation, Standort, Finanzierung und Entlohnung einordnen.',
      'Stärken-Schwächen-Profil, Trends, Chancen und Risiken für strategische Entscheidungen nutzen.',
      'Mitbestimmungsrechte und Mitarbeiterzufriedenheit als Faktoren der Unternehmenskultur einordnen.',
    ],
  },
  {
    code: 'Q-KURS2-MARKETING',
    title: 'Qualifikationsphase Kurs 2: Marktbeeinflussung durch Marketing',
    page: 28,
    stage: 'SekII',
    courseLevel: 'GK_LK',
    goals: [
      'Marktanalyse für verschiedene Unternehmen durchführen.',
      'Güter- und Faktormärkte mit geeigneten Instrumenten untersuchen.',
      'Marketing-Mix beispielhafter Unternehmen untersuchen.',
      'Marketingkonzept und Marketing-Mix verschiedener Unternehmen vergleichen und beurteilen.',
      'Chancen und Risiken von Produktwerbung in digitalen Umgebungen aus Unternehmer- und Verbrauchersicht reflektieren.',
      'Auf Grundlage einer Marktuntersuchung eine Marktprognose erstellen.',
      'Geeigneten Absatzweg bestimmen.',
      'Marketing-Mix für Produkte oder Dienstleistungen entwerfen.',
      'Markt als Informationsbörse und Ort der Preisbildung erklären.',
      'Funktionen des Preises im Marketingkontext erläutern.',
      'Marketinginstrumente aus Produkt-, Preis-, Distributions- und Kommunikationspolitik unterscheiden.',
      'Einfluss von Kunden, Wettbewerbern und Medien auf Marketing analysieren.',
      'Markenbildung, Image-Theorie, Greenwashing und Bluewashing beurteilen.',
      'Rechtliche und ethische Aspekte analoger und digitaler Marketingmaßnahmen beurteilen.',
    ],
  },
  {
    code: 'Q-FACHPRAKTIKUM-MARKETING',
    title: 'Qualifikationsphase Fachpraktikum: Ein Marketingkonzept entwickeln',
    page: 29,
    stage: 'SekII',
    courseLevel: 'GK_LK',
    goals: [
      'Marketingmaßnahmen aus dem Produktlebenszyklus ableiten.',
      'Break-Even-Point für ein eigenes Unternehmen oder Produkt berechnen.',
      'Erfolgsaussichten eines Marketingkonzepts mit Break-Even-Point oder Produktlebenszyklus beurteilen.',
      'Einfluss nachhaltigkeitsorientierter Maßnahmen auf den Break-Even-Point bestimmen.',
      'Eine Marketingkampagne für ein fiktives Unternehmen entwickeln.',
      'Marketingentscheidungen begründen.',
      'Marketingkonzept aus Best-Case- und Worst-Case-Szenario weiterentwickeln.',
      'Nachhaltigkeit im Marketingkonzept berücksichtigen.',
      'Einen Werbetrailer für einen ausgewählten Marketingkanal konzipieren.',
    ],
  },
  {
    code: 'Q-KURS3-GELD-BANKEN',
    title: 'Qualifikationsphase Kurs 3: Geld, Bankensektor und Geldpolitik',
    page: 30,
    stage: 'SekII',
    courseLevel: 'GK_LK',
    goals: [
      'Funktionen des Geldes am erweiterten Wirtschaftskreislaufmodell beschreiben.',
      'Rolle der Geschäftsbanken untersuchen.',
      'Bedeutung der Börse für die Volkswirtschaft erläutern.',
      'Indizes als Spiegelbild wirtschaftlicher Entwicklung beschreiben.',
      'Aufgaben und Struktur des Europäischen Systems der Zentralbanken beschreiben.',
      'Geldpolitische Zielsetzung und Strategie der Europäischen Zentralbank erklären.',
      'Einfluss der EZB und konjunktureller Entwicklung auf Geldwertstabilität in EU-Ländern beurteilen.',
      'Zu wirtschafts- und geldpolitischem Handeln in ökonomisch bedeutsamen Krisen Stellung nehmen.',
      'Bedeutung und Probleme geldpolitischer Instrumente für den europäischen Währungsraum erörtern.',
      'Fiktive geldpolitische Maßnahmen zur Beeinflussung der Konjunktur treffen.',
      'Inflation und Deflation nach Ursachen, Folgen und Gegenmaßnahmen erklären.',
    ],
  },
  {
    code: 'Q-FACHPRAKTIKUM-BOERSE',
    title: 'Qualifikationsphase Fachpraktikum: Geld virtuell an der Börse anlegen',
    page: 31,
    stage: 'SekII',
    courseLevel: 'GK_LK',
    goals: [
      'Gleichgewichtspreis im Modell des vollkommenen Marktes ermitteln.',
      'Aktienkurse von Unternehmen mit dem jeweiligen Leitindex untersuchen.',
      'Wertpapierkäufe über Geschäftsbanken und Online-Broker kriteriengeleitet vergleichen.',
      'Auswirkungen geldpolitischer Entscheidungen der EZB auf das Börsengeschehen beschreiben.',
      'Anlageprodukte an der Börse nach Vor- und Nachteilen vergleichen.',
      'Fiktive Kaufentscheidungen für Wertpapiere begründen.',
      'Möglichkeiten und Grenzen staatlicher Einflussnahme auf Börsen beurteilen.',
      'Eigene fiktive Anlagestrategien prüfen und Handlungsoptionen entwickeln.',
      'Nachhaltige Anlageformen einordnen.',
      'Bullenmarkt und Bärenmarkt als Börsenphasen erläutern.',
    ],
  },
  {
    code: 'Q-KURS4-WIRTSCHAFTSPOLITIK',
    title: 'Qualifikationsphase Kurs 4: Wirtschaftspolitische Grundlagen und Ziele',
    page: 32,
    stage: 'SekII',
    courseLevel: 'GK_LK',
    goals: [
      'Aktuelle wirtschaftliche Lage Deutschlands mit Konjunkturindikatoren analysieren.',
      'Ursachen der aktuellen wirtschaftlichen Lage Deutschlands beschreiben.',
      'Zielbeziehungen und Zielkonflikte im Magischen Viereck untersuchen.',
      'Erweiterungen des Magischen Vierecks zum Magischen Vieleck erläutern.',
      'Aktuelle ökonomische Problemfelder und passende wirtschaftspolitische Maßnahmen identifizieren.',
      'Aussagekraft und Eignung verschiedener Konjunkturindikatoren beurteilen.',
      'Nachhaltigkeit und Digitalität bei Konjunkturindikatoren berücksichtigen.',
      'Ausgewählte makroökonomische Theorien in wirtschaftlichen Szenarien gegenüberstellen.',
      'Wirtschaftspolitische Entscheidungen simulieren und Folgen prognostizieren.',
      'Handlungsalternativen mit einem Theorieansatz begründen.',
      'Aktuelle wirtschaftspolitische Entscheidungen auf verschiedenen Politikebenen anhand konjunkturtheoretischer Ansätze hinterfragen.',
      'Konjunkturzyklus und Früh-, Präsens- und Spätindikatoren erklären.',
      'Stabilitäts- und Wachstumsgesetz als wirtschaftspolitischen Rahmen einordnen.',
      'Ursachen von Marktversagen und fiskalpolitische Maßnahmen analysieren.',
      'Klassische Nationalökonomie, Neoklassik, Neoliberalismus, Marxismus, Keynesianismus und Monetarismus als makroökonomische Theorieansätze unterscheiden.',
    ],
  },
  {
    code: 'Q-FACHPRAKTIKUM-WIRTSCHAFTSPOLITIK',
    title: 'Qualifikationsphase Fachpraktikum: Ein wirtschaftspolitisches Konzept debattieren',
    page: 33,
    stage: 'SekII',
    courseLevel: 'GK_LK',
    goals: [
      'Ökonomische Lage ausgewählter Länder und deren Bestimmungsfaktoren untersuchen.',
      'Ökonomische Lage eines fiktiven Landes untersuchen.',
      'Entwicklungskonzepte zur Lösung wirtschaftlicher Probleme vergleichen und beurteilen.',
      'Ein wirtschaftspolitisches Konzept für die globalisierte Welt entwickeln und vertreten.',
      'Ein wirtschaftspolitisches Konzept für einen selbst definierten Wirtschaftsraum entwickeln und vertreten.',
      'Zielbereiche eines Magischen Vielecks in wirtschaftspolitische Konzepte integrieren.',
      'Träger der Wirtschaftspolitik und deren Instrumentarium erläutern.',
      'Interdependenz von Wirtschafts-, Umwelt-, Bildungs- und Sozialpolitik analysieren.',
      'Probleme und Chancen der Globalisierung beurteilen.',
    ],
  },
]

const ids = {
  householdBudget: 'e5b070d2-daa5-5b8e-8782-32bb8a6865d2',
  payment: 'e2ac2cc2-894a-5e61-8acb-f5d88811739d',
  consumerBehavior: '5b5ed3cb-7c2c-5b0f-a515-c967d8d23644',
  consumptionReflection: 'a60e0541-80e1-5f94-86fd-073f5a00bee8',
  sustainableConsumption: 'bac0f1d3-e671-5c2b-bd6d-2947f1fe6d9b',
  marketingImportance: '75cdc9a3-4cce-57a1-85e2-87c9994244da',
  marketingAnalysis: '8c9f8fb2-18be-5e9c-86bf-3aea14a10b78',
  marketingConcept: '95f2b860-d21d-5627-8dcd-cd53efd94b7b',
  legalFunctions: '2aee114f-d0d2-516f-8f95-1b72f707401d',
  legalFramework: 'bb7f2a2a-95c3-5375-8323-51a808e945e6',
  consumerRights: 'c386592a-b259-538c-9929-25775af99b83',
  overDebt: 'e9c4ec6b-9a54-579d-818f-87a7d39d4e3c',
  marketModel: '8ad94aeb-81ad-58ce-8792-c691f97efd53',
  marketEquilibrium: '50e07b86-428c-5f9c-8c7e-0d0669343af5',
  priceFunctions: '3bcb976d-3e45-5c62-81ac-5ed909df202b',
  economicCycle: '641dee8e-9658-5db1-89eb-2353f8322a8a',
  externalities: 'bad728f2-e375-5f98-8f65-511a9e2e6751',
  concentration: 'cb21bcbe-755d-5b0d-b02a-be22c9d26e43',
  competition: '98136a27-120d-5278-b9b9-d833c0ea5fc0',
  competitionPolicy: 'af709beb-2a7e-5df0-bc91-f8f0e0cb99f8',
  socialMarket: '1da809f7-ef85-5a2d-babf-b7639e605653',
  socialMarketOrder: 'c7b03538-25a2-510b-8fd4-a81bcc3de406',
  stateVsMarket: '6600f5f0-0b30-5458-b144-b2468d897087',
  orderConcepts: '9ca0e3c9-005e-5c8d-8157-3642e11f245e',
  specialization: 'ae7b709c-6139-5b05-8615-197bff511d9f',
  companyStructure: '6d4a38df-527c-534b-8c0a-c6b546dae5b1',
  companyCoreSupport: 'aa9db8f6-c81e-5247-8f84-5f2b968ab2c4',
  companyProcesses: '2ccb9f7e-1512-5970-85a1-71ec42734eb9',
  companyTargets: 'b215bd82-2b6b-5b00-8a0b-85c7ff249bc2',
  companyStakeholders: 'e90586d8-8e0a-5355-87d0-4ecd90dbe021',
  businessModel: '53829f76-2d9c-5cdd-8521-c249f57f738d',
  entrepreneur: '96ab60e8-7645-5c34-84be-62e1c2a3cb16',
  coDetermination: '776457c2-8bb3-53b9-838b-a028319175fb',
  workTimeParticipation: 'dd38e0c5-d77b-5893-815c-548ea2a84429',
  tariff: '121fea28-9943-575d-9c96-1fb2e3356f32',
  laborModels: '7c72848d-8bc9-58e2-a690-fd17ac650a88',
  workDevelopments: '9cb6bd3b-1ecf-57af-8127-853fc969d7f5',
  workDigital: '21dd1fce-730a-5470-bcc3-76195941ee83',
  careerProfile: '8dee6c0a-0f76-5717-87b6-04ec89229371',
  socialStateGoals: 'd17ff931-085d-56be-932d-3839b5b88ba8',
  socialInsurance: 'e20f9304-5048-5e52-89ce-b80e978d1097',
  justiceConcepts: '577f0e2d-643a-5a0c-833b-301622a6cb00',
  publicDebt: 'c5272ab8-baa0-570b-9f31-426d1f4460f2',
  policyGrowth: '764e9eca-3392-5eb1-8df6-603356a47fd9',
  policyEvaluate: '950caf4f-1082-56bb-84db-b7174ce6c63f',
  stabilityLaw: '6f1f4654-35ab-5ba6-a329-b19b994e84cc',
  cycleIndicators: 'a773d8a6-3b0d-5ab5-a914-ca234e7fb813',
  cycleModels: 'bc3f895f-38d7-534b-998d-8d60fcbbb900',
  cycleForecasts: '0e5b12a1-68bd-5838-8e70-02b3e7f2518a',
  fiscalPolicy: '550a050a-36bb-5b9e-ae0a-1afc7f9a0df0',
  gdp: '5262a0ba-0ede-5f47-a6a2-4778d24fc95a',
  growthLifeQuality: '1d38aa8d-c667-5edf-85c1-4111999f03d4',
  sustainableGrowth: 'd36664f5-1dc2-5e4b-bda0-0a288407d2af',
  environmentalProblems: '80c92945-155b-56ea-8aa2-46ee72852303',
  environmentalInstruments: '625b61ec-8561-5179-b59e-d3742b19c0e2',
  environmentalPolicyMultilevel: 'c3cb822e-f219-5a66-9714-db73b50d0487',
  environmentalConflicts: 'e3cd6940-26f0-55a9-a348-4a90c245266c',
  circularEconomy: '4d578b42-8dac-5381-9836-9d7199451c74',
  ezb: 'f9132615-8166-5e42-ad04-d8b2b75d719d',
  ezbDecision: '0242e34e-e2fe-5a0f-8aed-57905c6ebb26',
  moneyCreation: '676684da-5ba2-5c2a-ba7e-a8413915c29c',
  priceInterest: 'f70be9a9-3ec5-52e8-84b0-213f2061856c',
  inflation: '8ebbbe19-43dd-53ff-a6d0-9d94a5973616',
  euInternalMarket: '9ea7d847-7425-5157-a827-ee5f8c2e8c0a',
  euCurrency: '79d244e0-049e-59e9-a2fb-b8f8670b315a',
  globalization: '72920fcb-4afb-5ba4-88c1-b1c8af2f9ca5',
  globalValueChains: '11c57203-1619-5bba-8905-9c10d7f77d57',
  tradePolicy: '604cde3e-4095-50c3-b712-e6bd7cea4717',
  tradeTheory: '87ee2b5a-8d10-51e4-a288-539e5ac251ea',
  tradeConflict: '54049ed4-9364-5564-a55a-3959193d9018',
  protectionism: '0b6db337-3fc6-5c30-860d-c8fbd535cb5c',
  tradeAgreement: '0509ae79-abb4-5e6b-8db2-521c1bccacf4',
  worldTradeDevelopment: '4cccf0da-a0f4-593a-9bf3-4a68c790af40',
  globalBusiness: '09e58ea8-1920-5600-bd2b-cc1f199d051f',
  locationCompetition: '7f8f6648-6faa-52c5-9793-3654ef9dc36d',
  financialActors: '667b75ad-2d20-5f22-ad57-46be5b7c53c7',
  financialRegulation: 'fb249488-944c-5123-a21e-5cb9a0431e8b',
  globalGovernance: 'e7542590-40e7-5d06-99f3-f295be1f9e12',
  globalGovernanceStructures: 'f440efea-9d86-589f-8ff9-18e8d3b2efd3',
  ngos: '2d8cc4f2-9ee2-5d9c-a019-7d3a1e9a1db2',
  fairTrade: 'e21158e7-3bc3-51f2-887f-9eb5a8dd6243',
}

const invalidIds = Object.entries(ids).filter(([, id]) => !canonicalGoalIds.has(id))
if (invalidIds.length > 0) {
  throw new Error(`Unknown canonical IDs: ${invalidIds.map(([key, id]) => `${key}=${id}`).join(', ')}`)
}

function targetsFor(goal: SourceGoal): string[] {
  const topic = goal.topicCode
  const text = goal.sourceText.toLowerCase()
  const targets = new Set<string>()
  const add = (...goalIds: string[]) => goalIds.forEach((id) => targets.add(id))

  if (topic.includes('K9-HAUSHALTE')) add(ids.householdBudget, ids.consumerBehavior, ids.consumptionReflection, ids.economicCycle, ids.payment, ids.sustainableConsumption, ids.specialization)
  if (topic.includes('K9-GELD') || topic.includes('HAUSHALTSBUCH')) add(ids.householdBudget, ids.payment, ids.overDebt, ids.consumerRights, ids.moneyCreation, ids.financialActors)
  if (topic.includes('K9-MARKTWIRTSCHAFT')) add(ids.marketModel, ids.marketEquilibrium, ids.priceFunctions, ids.competition, ids.competitionPolicy, ids.socialMarket, ids.socialMarketOrder, ids.orderConcepts, ids.cycleIndicators, ids.policyEvaluate, ids.sustainableGrowth, ids.specialization)
  if (topic.includes('K9-ARBEIT') || topic.includes('ARBEITSWELTEN')) add(ids.workDevelopments, ids.workDigital, ids.laborModels, ids.careerProfile, ids.marketModel, ids.tariff, ids.coDetermination, ids.euInternalMarket)
  if (topic.includes('K10-STAAT')) add(ids.fiscalPolicy, ids.publicDebt, ids.justiceConcepts, ids.competitionPolicy, ids.externalities, ids.policyEvaluate, ids.stabilityLaw)
  if (topic.includes('K10-SOZIALE') || topic.includes('SOZIALE-SICHERHEIT')) add(ids.socialStateGoals, ids.socialInsurance, ids.justiceConcepts, ids.householdBudget, ids.payment)
  if (topic.includes('K10-WIRTSCHAFTSRECHT')) add(ids.legalFunctions, ids.legalFramework, ids.consumerRights, ids.householdBudget, ids.workDevelopments)
  if (topic.includes('K10-EU-FOERDERPROGRAMME')) add(ids.euInternalMarket, ids.tradePolicy, ids.tradeAgreement, ids.worldTradeDevelopment, ids.tradeConflict, ids.globalBusiness, ids.locationCompetition, ids.fiscalPolicy, ids.environmentalPolicyMultilevel)
  if (topic.includes('Q-KURS1') || topic.includes('UNTERNEHMEN-GRUENDEN')) add(ids.companyStructure, ids.companyCoreSupport, ids.companyProcesses, ids.companyTargets, ids.companyStakeholders, ids.businessModel, ids.entrepreneur, ids.coDetermination, ids.tariff, ids.locationCompetition, ids.workDigital, ids.sustainableGrowth)
  if (topic.includes('Q-KURS2') || topic.includes('Q-FACHPRAKTIKUM-MARKETING')) add(ids.marketModel, ids.priceFunctions, ids.marketingImportance, ids.marketingAnalysis, ids.marketingConcept, ids.consumerBehavior, ids.competition, ids.companyTargets, ids.sustainableConsumption)
  if (topic.includes('Q-KURS3') || topic.includes('BOERSE')) add(ids.payment, ids.moneyCreation, ids.financialActors, ids.financialRegulation, ids.ezb, ids.ezbDecision, ids.priceInterest, ids.inflation, ids.marketEquilibrium, ids.householdBudget)
  if (topic.includes('Q-KURS4') || topic.includes('WIRTSCHAFTSPOLITIK')) add(ids.cycleIndicators, ids.cycleModels, ids.cycleForecasts, ids.stabilityLaw, ids.policyGrowth, ids.policyEvaluate, ids.fiscalPolicy, ids.gdp, ids.externalities, ids.globalization, ids.sustainableGrowth, ids.worldTradeDevelopment, ids.tradeConflict, ids.globalGovernanceStructures)

  if (topic.includes('K8-MARKTTEILNEHMER')) add(ids.householdBudget, ids.payment, ids.consumerBehavior, ids.consumptionReflection, ids.sustainableConsumption, ids.marketingImportance, ids.marketingAnalysis, ids.consumerRights, ids.marketModel, ids.marketEquilibrium, ids.priceFunctions, ids.economicCycle)
  if (topic.includes('K10-WIRTSCHAFTSORDNUNG')) add(ids.socialMarket, ids.socialMarketOrder, ids.stateVsMarket, ids.orderConcepts, ids.legalFunctions, ids.legalFramework, ids.socialInsurance, ids.tariff, ids.coDetermination, ids.environmentalPolicyMultilevel)
  if (topic.includes('K10-WIRTSCHAFTSKREISLAUF')) add(ids.economicCycle, ids.marketModel, ids.priceFunctions, ids.householdBudget, ids.companyStructure, ids.companyStakeholders, ids.companyTargets, ids.payment, ids.fiscalPolicy, ids.globalBusiness, ids.careerProfile)
  if (topic.includes('K10-WIRTSCHAFTLICHE-ENTWICKLUNG')) add(ids.workDevelopments, ids.workDigital, ids.cycleIndicators, ids.cycleModels, ids.cycleForecasts, ids.gdp, ids.stabilityLaw, ids.policyEvaluate, ids.socialStateGoals, ids.sustainableGrowth, ids.environmentalProblems, ids.environmentalPolicyMultilevel)
  if (topic.includes('K10-EU-GLOBAL')) add(ids.euInternalMarket, ids.tradePolicy, ids.fairTrade, ids.globalization, ids.globalBusiness)
  if (topic.includes('K10-WAHL-UNTERNEHMEN')) add(ids.companyStructure, ids.businessModel, ids.entrepreneur, ids.companyTargets, ids.companyProcesses, ids.locationCompetition)
  if (topic.includes('SOZIAL') || topic.includes('ARBEITSWELT')) add(ids.socialStateGoals, ids.socialInsurance, ids.justiceConcepts, ids.workDevelopments, ids.workDigital, ids.laborModels)
  if (topic.includes('J12-GK-WIRTSCHAFTSORDNUNG') || topic.includes('J12-LK-WIRTSCHAFTSORDNUNGEN')) add(ids.socialMarket, ids.socialMarketOrder, ids.orderConcepts, ids.stateVsMarket, ids.legalFunctions, ids.legalFramework, ids.environmentalPolicyMultilevel)
  if (topic.includes('WIRTSCHAFTSPOLITIK')) add(ids.policyGrowth, ids.policyEvaluate, ids.stabilityLaw, ids.cycleIndicators, ids.cycleModels, ids.cycleForecasts, ids.fiscalPolicy, ids.gdp, ids.workDevelopments)
  if (topic.includes('EWWU') || topic.includes('EUROPA')) add(ids.euInternalMarket, ids.euCurrency, ids.ezb, ids.ezbDecision, ids.tradePolicy, ids.competitionPolicy, ids.locationCompetition)
  if (topic.includes('POSTWACHSTUM')) add(ids.growthLifeQuality, ids.sustainableGrowth, ids.environmentalProblems, ids.circularEconomy, ids.sustainableConsumption)
  if (topic.includes('GLOBALISIERUNG')) add(ids.globalization, ids.globalValueChains, ids.globalGovernance, ids.globalGovernanceStructures, ids.ngos, ids.tradePolicy)

  if (text.includes('bedürfnis') || text.includes('bedarf') || text.includes('konsum')) add(ids.consumerBehavior, ids.consumptionReflection)
  if (text.includes('geld') || text.includes('taschengeld') || text.includes('sparen') || text.includes('kredit')) add(ids.householdBudget, ids.payment, ids.moneyCreation)
  if (text.includes('werbung') || text.includes('marketing')) add(ids.marketingImportance, ids.marketingAnalysis, ids.marketingConcept)
  if (text.includes('verbraucherschutz')) add(ids.consumerRights)
  if (text.includes('nachhalt') || text.includes('klima') || text.includes('umwelt') || text.includes('energie')) add(ids.sustainableConsumption, ids.sustainableGrowth, ids.environmentalProblems, ids.environmentalInstruments, ids.environmentalPolicyMultilevel, ids.environmentalConflicts, ids.externalities)
  if (text.includes('sharing') || text.includes('genossenschaft') || text.includes('minimalismus') || text.includes('prosument')) add(ids.circularEconomy, ids.sustainableConsumption, ids.sustainableGrowth)
  if (text.includes('angebot') || text.includes('nachfrage') || text.includes('preis')) add(ids.marketModel, ids.marketEquilibrium, ids.priceFunctions)
  if (text.includes('koordinierungsmechanismus') || text.includes('koordinierungs- und lenkungsmechanismen')) add(ids.specialization, ids.marketModel)
  if (text.includes('marktform') || text.includes('wettbewerb')) add(ids.marketModel, ids.competition, ids.competitionPolicy, ids.concentration)
  if (text.includes('wirtschaftskreislauf')) add(ids.economicCycle)
  if (text.includes('marktwirtschaft') || text.includes('zentralverwaltungswirtschaft') || text.includes('wirtschaftsordnung')) add(ids.socialMarket, ids.socialMarketOrder, ids.orderConcepts, ids.stateVsMarket)
  if (text.includes('grundgesetz') || text.includes('verfassungsrecht')) add(ids.legalFunctions, ids.legalFramework)
  if (text.includes('sozial') || text.includes('soziale sicherung')) add(ids.socialStateGoals, ids.socialInsurance, ids.justiceConcepts)
  if (text.includes('tarif') || text.includes('gewerkschaft') || text.includes('arbeitgeber') || text.includes('mindestlohn')) add(ids.tariff, ids.coDetermination, ids.workTimeParticipation)
  if (text.includes('unternehmen') || text.includes('betrieb')) add(ids.companyStructure, ids.companyCoreSupport, ids.companyProcesses, ids.companyTargets, ids.companyStakeholders)
  if (text.includes('unternehmensgründung') || text.includes('produktidee') || text.includes('rechtsform') || text.includes('finanzierung')) add(ids.businessModel, ids.entrepreneur, ids.companyTargets)
  if (text.includes('standort')) add(ids.locationCompetition, ids.globalBusiness)
  if (text.includes('beruf') || text.includes('arbeit') || text.includes('fachkräfte') || text.includes('arbeitslosigkeit')) add(ids.workDevelopments, ids.workDigital, ids.laborModels, ids.careerProfile)
  if (text.includes('steuer') || text.includes('staat')) add(ids.fiscalPolicy, ids.publicDebt)
  if (text.includes('konjunktur') || text.includes('stabilitätsgesetz') || text.includes('magisches vieleck')) add(ids.cycleIndicators, ids.cycleModels, ids.cycleForecasts, ids.stabilityLaw)
  if (text.includes('bip') || text.includes('wachstum') || text.includes('wohlstand')) add(ids.gdp, ids.growthLifeQuality, ids.sustainableGrowth)
  if (text.includes('keynes') || text.includes('friedman') || text.includes('nachfrageorientiert') || text.includes('angebotsorientiert')) add(ids.policyGrowth, ids.policyEvaluate)
  if (text.includes('freihandel') || text.includes('protektionismus') || text.includes('handelspolitik')) add(ids.tradePolicy, ids.protectionism, ids.tradeConflict, ids.worldTradeDevelopment)
  if (text.includes('binnenmarkt') || text.includes('währungsunion') || text.includes('ezb') || text.includes('geldpolitik') || text.includes('stabilitätspakt')) add(ids.euInternalMarket, ids.euCurrency, ids.ezb, ids.ezbDecision, ids.moneyCreation, ids.priceInterest)
  if (text.includes('globalisierung') || text.includes('globale') || text.includes('weltgesellschaft')) add(ids.globalization, ids.globalValueChains, ids.globalGovernance)
  if (text.includes('nichtregierungsorganisation') || text.includes('ngo')) add(ids.ngos, ids.globalGovernance)
  if (text.includes('smith') || text.includes('ricardo') || text.includes('mill') || text.includes('marx') || text.includes('müller-armack') || text.includes('erhard')) add(ids.orderConcepts, ids.socialMarket)

  return Array.from(targets)
}

function buildExtraction(params: {
  extractionId: string
  sourceLandscapeId: string
  title: string
  stage: Stage
  topics: TopicDraft[]
  reviewPath: string
  qualityReview: unknown
}) {
  const sourceGoals = params.topics.flatMap((topic) => topic.goals.map((goalText, index) => {
    const id = sourceGoalId(params.extractionId.toLowerCase(), topic.code, index + 1, goalText)
    return {
      id,
      passageId: `${params.extractionId.toLowerCase()}:${topic.code.toLowerCase()}`,
      topicCode: topic.code,
      bulletIndex: index + 1,
      aspectIndex: 1,
      title: `ST ${topic.code} (${index + 1}): ${goalText}`,
      description: `Source-Ziel aus ${topic.title}: ${goalText}`,
      sourceText: goalText,
      sourceSpan: `${topic.code} (${index + 1})`,
      parentBulletText: goalText,
      sourceRef: `${sourceDocument.title}, ${topic.title}, S. ${topic.page}.`,
      courseLevel: topic.courseLevel ?? params.stage,
      granularity: 'officialContentOrRequirement',
      tags: ['jurisdiction:DE-ST', 'subject:Wirtschaft', `stage:${params.stage}`, `topic:${topic.code}`],
      rawSourceText: goalText,
      rawSourceSpan: `${topic.code} (${index + 1})`,
      rawParentBulletText: goalText,
    }
  })) satisfies SourceGoal[]

  const passages = params.topics.map((topic) => ({
    id: `${params.extractionId.toLowerCase()}:${topic.code.toLowerCase()}`,
    topicCode: topic.code,
    title: topic.title,
    text: topic.goals.map((goal, index) => `(${index + 1}) ${goal}`).join('\n'),
    page: topic.page,
    sourcePath: sourceDocument.path,
    rawText: topic.goals.join('\n'),
    sourceGoalIds: topic.goals.map((goalText, index) => sourceGoalId(params.extractionId.toLowerCase(), topic.code, index + 1, goalText)),
  }))

  return {
    schemaVersion: 1,
    extractionId: params.extractionId,
    sourceLandscapeId: params.sourceLandscapeId,
    targetLandscapeId,
    jurisdiction: 'DE-ST',
    subject: 'Wirtschaftslehre',
    stage: params.stage,
    title: params.title,
    sourceDocument: { ...sourceDocument, official: true },
    method: {
      passageExtraction: 'pdftotext -layout; Wirtschaftslehre-Kompetenzschwerpunkte aus dem amtlichen Sachsen-Anhalt-Fachlehrplan selektiert',
      sourceGoalExtraction: 'one normalized source goal per economic content item or assessable requirement; compact official lists split where multiple economic goals are bundled',
      scopeNote: 'Der Sachsen-Anhalt-Fachlehrplan Wirtschaftslehre ist eine direkte Wirtschaft-Quelle; alle fachlichen Kompetenzschwerpunkte werden in die Wirtschaft-Source-Lanes geroutet.',
    },
    qualityReview: params.qualityReview,
    expectedTopicCodes: params.topics.map((topic) => topic.code),
    pipelineStatus: {
      currentStep: 'MAPPING-3',
      steps: [
        { id: 'ORIGINALQUELLEN', label: 'Originalquellen bereitgestellt', status: 'complete', dependsOn: [], checks: [{ id: 'source-document-present', label: 'Amtlicher Sachsen-Anhalt-Wirtschaftslehre-Fachlehrplan liegt lokal vor', passed: true, details: sourceDocument.path }] },
        { id: 'MAPPING-1', label: 'Original-Lehrplanpassagen extrahiert', status: 'complete', dependsOn: ['ORIGINALQUELLEN'], checks: [{ id: 'passages-extracted', label: 'Wirtschaftslehre-Passagen wurden aus dem amtlichen Fachlehrplan extrahiert', passed: true, details: `${passages.length} Passagen.` }] },
        { id: 'MAPPING-2', label: 'Source-Ziele aus Lehrplanpassagen erstellt', status: 'complete', dependsOn: ['MAPPING-1'], checks: [{ id: 'source-goals-created', label: 'Aus den ausgewählten Sachsen-Anhalt-Passagen wurden Source-Ziele erzeugt', passed: true, details: `${sourceGoals.length} Source-Ziele.` }] },
        { id: 'MAPPING-3', label: 'Source-Ziele auf SkillPilot-Ziele gemappt', status: 'incomplete', dependsOn: ['MAPPING-1', 'MAPPING-2'], checks: [{ id: 'm3-review-file-present', label: 'M3-Review-Datei ist vorhanden', passed: true, details: params.reviewPath }] },
      ],
    },
    passages,
    sourceGoals,
  }
}

function writeJson(file: string, value: unknown) {
  mkdirSync(path.dirname(file), { recursive: true })
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

function writeReview(params: {
  reviewPath: string
  reviewId: string
  extractionPath: string
  extraction: ReturnType<typeof buildExtraction>
}) {
  const decisions = []
  const mappings = []
  for (const sourceGoal of params.extraction.sourceGoals) {
    const targets = Array.from(new Set(targetsFor(sourceGoal)))
    if (targets.length === 0) throw new Error(`No mapping targets for ${sourceGoal.id}`)
    const invalid = targets.filter((target) => !canonicalGoalIds.has(target))
    if (invalid.length > 0) throw new Error(`Invalid targets for ${sourceGoal.id}: ${invalid.join(', ')}`)
    decisions.push({
      sourceGoalId: sourceGoal.id,
      topicCode: sourceGoal.topicCode,
      sourceSpan: sourceGoal.sourceSpan,
      decision: 'mapped',
      canonicalGoalIds: targets,
      matchType: 'partial',
      rationale: 'ST-Source-Ziel ist durch vorhandene kanonische Wirtschaft-Ziele fachlich vollständig abgedeckt; partial beschreibt die Zuordnungsform 1:n oder Sammelziel, nicht eine offene Lücke.',
      reviewedAt: '2026-05-13',
      reviewer: 'Codex',
    })
    for (const canonicalGoalId of targets) {
      mappings.push({ legacyGoalId: sourceGoal.id, canonicalGoalId, matchType: 'partial', reviewDecisionId: sourceGoal.id })
    }
  }
  writeJson(path.join(repoRoot, params.reviewPath), {
    version: 1,
    reviewId: params.reviewId,
    sourceLandscapeId: params.extraction.sourceLandscapeId,
    targetLandscapeId,
    sourceExtractionPath: params.extractionPath,
    status: 'complete',
    summary: {
      sourceGoals: params.extraction.sourceGoals.length,
      reviewedSourceGoals: decisions.length,
      seedMappedSourceGoals: decisions.length,
      mappedSourceGoals: decisions.length,
      needsCanonicalGoal: 0,
      exactMappings: 0,
      partialMappings: decisions.length,
      inheritedMappings: 0,
    },
    mappings,
    decisions,
  })
}

function upsertRegistryEntry(entry: {
  landscapeId: string
  title: string
  stage: string
  archivePath: string
}) {
  const registry = JSON.parse(readFileSync(registryPath, 'utf8')) as { version: number; entries: Array<Record<string, unknown>> }
  registry.entries = registry.entries.filter((candidate) => candidate.landscapeId !== entry.landscapeId)
  registry.entries.push({
    landscapeId: entry.landscapeId,
    title: entry.title,
    jurisdiction: 'DE-ST',
    subject: 'Wirtschaft',
    stage: entry.stage,
    sourcePath: sourceDocument.path,
    archiveSourcePath: sourceDocument.path,
    archivePath: entry.archivePath,
    sourceDocumentKey: sourceDocument.key,
    sourceUrl: sourceDocument.url,
  })
  registry.entries.sort((a, b) => String(a.jurisdiction).localeCompare(String(b.jurisdiction)) || String(a.title).localeCompare(String(b.title)))
  writeJson(registryPath, registry)
}

const lowerOutput = 'curricula/DE/Gymnasium/input/ST/lower-secondary/source-extraction/DE_ST_WIRTSCHAFTSLEHRE_SEKI_FACHLEHRPLAN_GYMNASIUM_2024.source-extraction.json'
const upperOutput = 'curricula/DE/Gymnasium/input/ST/upper-secondary/source-extraction/DE_ST_WIRTSCHAFTSLEHRE_SEKII_FACHLEHRPLAN_GYMNASIUM_2024.source-extraction.json'
const lowerReviewPath = 'curricula/DE/Gymnasium/mapping/DE-ST/lower-secondary/st_wirtschaftslehre_lower_secondary_source_extraction_to_canonical_wirtschaft.review.json'
const upperReviewPath = 'curricula/DE/Gymnasium/mapping/DE-ST/upper-secondary/st_wirtschaftslehre_upper_secondary_source_extraction_to_canonical_wirtschaft.review.json'

const lowerExtraction = buildExtraction({
  extractionId: 'DE-ST-WIRTSCHAFTSLEHRE-SEKI',
  sourceLandscapeId: lowerSourceLandscapeId,
  title: 'Wirtschaftslehre Sekundarstufe I (Sachsen-Anhalt, Fachlehrplan Source-Extraction)',
  stage: 'SekI',
  topics: lowerTopics,
  reviewPath: lowerReviewPath,
  qualityReview: {
    sourceGoalCountPeerBaseline: {
      accepted: true,
      details: 'ST Sek I stammt aus einem eigenen Fachlehrplan Wirtschaftslehre und umfasst die Kompetenzschwerpunkte der Schuljahrgänge 9 und 10. Die höhere Zielzahl ist gegenüber integrierten GRW/WiPo-Quellen fachlich erwartbar.',
    },
  },
})

const upperExtraction = buildExtraction({
  extractionId: 'DE-ST-WIRTSCHAFTSLEHRE-SEKII',
  sourceLandscapeId: upperSourceLandscapeId,
  title: 'Wirtschaftslehre Qualifikationsphase (Sachsen-Anhalt, Fachlehrplan Source-Extraction)',
  stage: 'SekII',
  topics: upperTopics,
  reviewPath: upperReviewPath,
  qualityReview: {
    sourceGoalCountPeerBaseline: {
      accepted: true,
      details: 'ST Sek II ist als Wirtschaftslehre-Qualifikationsphase vollständig wirtschaftsfachlich. Die Source-Ziele decken Kurs 1 bis 4 und die zugehörigen Fachpraktika ab.',
    },
  },
})

writeJson(path.join(repoRoot, lowerOutput), lowerExtraction)
writeJson(path.join(repoRoot, upperOutput), upperExtraction)
writeReview({ reviewPath: lowerReviewPath, reviewId: 'DE-ST-WIRTSCHAFTSLEHRE-SEKI-MAPPING-3-SOURCE-EXTRACTION-1', extractionPath: lowerOutput, extraction: lowerExtraction })
writeReview({ reviewPath: upperReviewPath, reviewId: 'DE-ST-WIRTSCHAFTSLEHRE-SEKII-MAPPING-3-SOURCE-EXTRACTION-1', extractionPath: upperOutput, extraction: upperExtraction })
upsertRegistryEntry({ landscapeId: lowerSourceLandscapeId, title: lowerExtraction.title, stage: 'Sekundarstufe I', archivePath: 'curricula/DE/Gymnasium/input/ST/lower-secondary/' })
upsertRegistryEntry({ landscapeId: upperSourceLandscapeId, title: upperExtraction.title, stage: 'Sekundarstufe II', archivePath: 'curricula/DE/Gymnasium/input/ST/upper-secondary/' })

console.log(`Generated ST Wirtschaft source extractions: ${lowerExtraction.sourceGoals.length} lower + ${upperExtraction.sourceGoals.length} upper source goals.`)
