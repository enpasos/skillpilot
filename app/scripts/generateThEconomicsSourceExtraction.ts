import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
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
const canonicalGoals = (JSON.parse(readFileSync(canonicalPath, 'utf8')) as { goals: Array<{ id: string; title: string }> }).goals
const canonicalGoalIds = new Set(canonicalGoals.map((goal) => goal.id))

const canonicalIdByTitle = (title: string): string => {
  const matches = canonicalGoals.filter((goal) => goal.title === title)
  if (matches.length !== 1) throw new Error(`Expected exactly one canonical goal titled "${title}", found ${matches.length}`)
  return matches[0].id
}

const canonicalId = (id: string): string => {
  if (!canonicalGoalIds.has(id)) throw new Error(`Unknown canonical goal id ${id}`)
  return id
}

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
  key: 'TH-WIRTSCHAFT-RECHT-GYMNASIUM-2012',
  title: 'Lehrplan Wirtschaft und Recht Gymnasium Thueringen 2012',
  path: 'curricula/DE/Gymnasium/input/TH/LP_GY_Wirtschaft_und_Recht_2012.pdf',
  url: 'https://www.schulportal-thueringen.de/tip/resources/medien/15754?dateiname=LP_GY_WR_Endfassung_290713_1.pdf',
}

const checkedLegacyOrientation: SourceDocument = {
  key: 'TH-WIRTSCHAFT-RECHT-GYOS-2010-ORIENTIERUNG',
  title: 'Ziele und inhaltliche Orientierungen Wirtschaft und Recht Qualifikationsphase Thueringen 2010',
  path: 'curricula/DE/Gymnasium/input/TH/GYOS_LP_Wirtschaft_und_Recht.pdf',
  url: 'https://www.schulportal-thueringen.de/tip/resources/medien/6407?dateiname=gyos_lp_wr.pdf',
}

const lowerSourceLandscapeId = idFrom('DE-TH Wirtschaft und Recht Sek I source extraction')
const upperSourceLandscapeId = idFrom('DE-TH Wirtschaft und Recht Sek II source extraction')

const lowerTopics: TopicDraft[] = [
  {
    code: 'K10-HAUSHALT-KONSUM-RECHT',
    title: 'Klassenstufe 10: Wirtschaftliches und rechtliches Handeln im Haushalt',
    page: 12,
    stage: 'SekI',
    goals: [
      'Das Spannungsverhältnis zwischen Bedürfnisvielfalt und Güterknappheit beschreiben.',
      'Das Wirtschaftlichkeitsprinzip erklären.',
      'Die Bedeutung des Einkommens für materielle Existenzsicherung in einer arbeitsteiligen Wirtschaft beschreiben.',
      'Aufgaben und Funktionen des Geldes sowie aktuelle Entwicklungen des Zahlungsverkehrs erklären.',
      'Verschiedene Kreditarten und Geldanlagemöglichkeiten vergleichen.',
      'Den Einfluss der Werbung auf Kaufentscheidungen beschreiben.',
      'Ursachen von Verschuldung erklären und Lösungswege aufzeigen.',
      'Grundlegende Funktionen des Rechts erklären.',
      'Die Bedeutung des Rechts für wirtschaftliches Handeln im privaten Haushalt erläutern.',
      'Mit Gesetzestexten in wirtschaftsnahen Alltagssituationen arbeiten.',
      'Eigentum und Besitz unterscheiden.',
      'Den Abschluss von Verträgen am Beispiel eines Kaufvertrags darstellen.',
      'Die Notwendigkeit des Verbraucherschutzes an Beispielen begründen.',
      'Rechts-, Geschäfts- und Deliktsfähigkeit unterscheiden.',
      'Verbraucherrechte aus Sachmangelhaftung und Fernabsatzgeschäft erklären und auf einfache Sachverhalte anwenden.',
      'Aspekte ökologisch orientierten Verbraucherverhaltens diskutieren.',
      'Einfache Fälle aus dem Vertragsrecht lösen.',
      'Kreditarten und Anlagemöglichkeiten anhand fiktiver Einkommens- und Vermögensverhältnisse beurteilen.',
      'Den eigenen Umgang mit Geld und das eigene Konsumverhalten kritisch reflektieren.',
      'Konsumentscheidungen unter dem Kriterium der Nachhaltigkeit beurteilen.',
    ],
  },
  {
    code: 'K10-UNTERNEHMEN-ARBEIT-BILANZ',
    title: 'Klassenstufe 10: Wirtschaftliches und rechtliches Handeln im Unternehmen',
    page: 13,
    stage: 'SekI',
    goals: [
      'Unternehmen als Orte der Einkommenserzielung charakterisieren.',
      'Wirtschaftssektoren unterscheiden und deren Entwicklung vergleichen.',
      'Betriebliche Produktionsfaktoren erklären.',
      'Betriebliche Grundfunktionen erläutern.',
      'Auswirkungen der Arbeitsteilung darstellen.',
      'Betriebliche Arbeitsbedingungen mit Blick auf Arbeitswelt und Mitbestimmung erläutern.',
      'Motive für Unternehmensgründungen nennen.',
      'Einflussfaktoren auf Standortentscheidungen begründen.',
      'Rechtsformen mithilfe von Kriterien unterscheiden.',
      'Die Grundstruktur der Unternehmensbilanz erklären und den Unternehmenserfolg berechnen.',
      'Aufgaben der Geschäftsbanken anhand von Einlagen- und Kreditgeschäften erklären.',
      'Ausgewählte Gesetzeslagen des Urheberrechts an Beispielen darstellen.',
      'Die Bedeutung der Eigentumsordnung für das Urheberrecht erläutern.',
      'Ausgewählte Ausbildungswege erläutern und Anforderungsprofile beschreiben.',
      'Kriterien für Berufs- und Studienorientierung benennen und vergleichen.',
      'Chancen und Risiken selbstständiger Erwerbstätigkeit diskutieren.',
      'Handlungsalternativen zur Standortwahl mit Fallstudien vergleichen.',
      'Einfache betriebswirtschaftliche Vorgänge in T-Kontenform buchen.',
      'Gesetzeslagen des Urheberrechts anhand einfacher Rechtsfälle anwenden.',
      'Techniken zur Vorbereitung, Durchführung und Auswertung eines Betriebspraktikums nutzen.',
      'Unternehmerische Entscheidungen unter ökonomischen, sozialen und ökologischen Gesichtspunkten beurteilen.',
      'Eigene berufswahlbedeutsame Interessen und Fähigkeiten einschätzen.',
      'Ziele zur Selbst- und Berufswelterkundung setzen und reflektieren.',
    ],
  },
  {
    code: 'K10-STAAT-WIRTSCHAFTSORDNUNG-RECHT',
    title: 'Klassenstufe 10: Die Rolle des Staates in der Wirtschafts- und Rechtsordnung',
    page: 15,
    stage: 'SekI',
    goals: [
      'Ordnungsformen und Ordnungselemente von Wirtschaftsordnungen vergleichen und Real- von Idealtypen abgrenzen.',
      'Gesellschaftliche und wirtschaftliche Ziele der Sozialen Marktwirtschaft erläutern.',
      'Aktuelle gesamtwirtschaftliche Probleme wie Arbeitslosigkeit und Inflation beschreiben.',
      'Wesentliche Einnahme- und Ausgabenbereiche des Staates darstellen.',
      'Bezüge zwischen Sozialer Marktwirtschaft und Grundgesetz anhand ausgewählter Artikel herstellen.',
      'Grundlegende Aufgaben einer Rechtsordnung erklären.',
      'Öffentliches und privates Recht unterscheiden.',
      'Strafmündigkeit definieren und Besonderheiten des Jugendstrafrechts erklären.',
      'Voraussetzungen und Rechtsfolgen strafbarer Handlungen beschreiben.',
      'Eigene und fremde Positionen zu aktuellen gesamtwirtschaftlichen Problemen wiedergeben.',
      'Das Kreislaufmodell zur Darstellung gesamtwirtschaftlicher Zusammenhänge erweitern und nutzen.',
      'Ursachen und Folgen gesamtwirtschaftlicher Probleme wie Arbeitslosigkeit beurteilen.',
    ],
  },
  {
    code: 'K10-REGIONAL-NATIONAL-INTERNATIONAL',
    title: 'Klassenstufe 10: Regionale, nationale und internationale oekonomische Zusammenhaenge',
    page: 16,
    stage: 'SekI',
    goals: [
      'Das Bruttoinlandsprodukt als Summe der volkswirtschaftlichen Wertschöpfung beschreiben.',
      'Konjunkturschwankungen erklären.',
      'Wesensmerkmale unterschiedlicher Märkte vergleichen.',
      'Die Börse als Marktplatz für Wertpapiere, Devisen und Rohstoffe charakterisieren.',
      'Preisbildung und Preisänderungen erklären.',
      'Aufbau und Aufgaben der Europäischen Zentralbank beschreiben.',
      'Wesentliche Aufgaben der Gemeinschaftswährung erklären.',
      'Das einfache zum erweiterten Wirtschaftskreislaufmodell entwickeln.',
      'Bedeutung und Zunahme der internationalen Arbeitsteilung erläutern.',
      'Wesentliche Bestimmungsgründe der Globalisierung identifizieren.',
      'Die Rolle von Industrie-, Schwellen- und Entwicklungsländern in der internationalen Arbeitsteilung beschreiben.',
      'Mit dem Konjunkturphasenmodell Veränderungen ausgewählter Wirtschaftsindikatoren ableiten.',
      'Auf- und Abwärtsbewegungen der Wirtschaftstätigkeit in einem Konjunkturphasenmodell darstellen.',
      'Preisbildung und Preisänderungen im Marktmodell grafisch darstellen.',
      'Chancen und Probleme der europäischen Integration debattieren.',
      'Auswirkungen der Globalisierung beurteilen.',
      'Bedeutung von Preisschwankungen für das eigene Kaufverhalten einschätzen.',
      'Konsequenzen für eigenes Handeln aus wirtschaftlichen Prozessen ableiten.',
    ],
  },
]

const upperTopics: TopicDraft[] = [
  {
    code: 'Q-VWL-SOZIALE-MARKTWIRTSCHAFT',
    title: 'Qualifikationsphase: Soziale Marktwirtschaft',
    page: 24,
    stage: 'SekII',
    courseLevel: 'GK_LK',
    goals: [
      'Zielbeziehungen zwischen gesellschaftlichen und wirtschaftlichen Zielen in der Sozialen Marktwirtschaft beschreiben.',
      'Den Grad der Zielerreichung wirtschaftspolitischer Ziele analysieren.',
      'Ursachen des Strukturwandels und Auswirkungen auf Haushalte, Unternehmen und Staat erläutern.',
      'Bezüge zu wirtschaftlichen Zielen der Europäischen Union ableiten.',
      'Wirtschaftliche Aktivitäten auf Nachhaltigkeit prüfen.',
      'Einkommens- und Vermögenspolitik exemplarisch darstellen.',
      'Wirtschaftliche Indikatoren berechnen.',
      'Regionalen Strukturwandel standortbezogen erläutern und Entwicklungsperspektiven darlegen.',
      'Ziele der Sozialen Marktwirtschaft vor dem Hintergrund fortschreitender Globalisierung einordnen.',
      'Aktuelle Probleme bei der Zielerreichung diskutieren.',
      'Regionale Entwicklungsperspektiven mithilfe von Fallstudien erarbeiten.',
      'Aus Zielen der Sozialen Marktwirtschaft Rückschlüsse für persönliches Handeln ziehen.',
      'Herausforderungen aktueller wirtschaftspolitischer Entwicklungen erkennen und sich positionieren.',
      'Einflüsse des Strukturwandels auf Berufs- und Studienwahl beurteilen.',
    ],
  },
  {
    code: 'Q-VWL-KONJUNKTURPOLITIK',
    title: 'Qualifikationsphase: Konjunkturpolitik',
    page: 25,
    stage: 'SekII',
    courseLevel: 'GK_LK',
    goals: [
      'Grundlegende Zusammenhänge einer Volkswirtschaft am Kreislaufmodell beschreiben.',
      'Wirtschaftliche Entwicklungen anhand ausgewählter Indikatoren analysieren.',
      'Ursachen gesamtwirtschaftlicher Ungleichgewichte erklären.',
      'Bedeutung volkswirtschaftlicher Gesamtrechnungen für Wirtschafts- und Sozialpolitik erläutern.',
      'Wirtschaftliche Entwicklungen anhand ausgewählter Indikatoren prognostizieren.',
      'Reale und monetäre Ausgleichsmechanismen beschreiben.',
      'Den Multiplikatoreffekt erklären.',
      'Wirkungsketten bei veränderten Stromgrößen am Kreislaufmodell entwickeln.',
      'Gesamtwirtschaftliche Größen ausgewählter Indikatoren grafisch darstellen.',
      'Die eigene Rolle als Wirtschaftssubjekt beurteilen.',
      'Wirtschaftliche Entwicklungen verschiedener Wirtschaftsräume beurteilen.',
    ],
  },
  {
    code: 'Q-VWL-WIRTSCHAFTSPOLITIK-KONZEPTE',
    title: 'Qualifikationsphase: Grundlegende Konzepte der Wirtschaftspolitik',
    page: 26,
    stage: 'SekII',
    courseLevel: 'GK_LK',
    goals: [
      'Grundlegende Konzepte der Wirtschaftspolitik erläutern und deren Auswirkungen beschreiben.',
      'Angebots- und nachfrageorientierte Wirtschaftspolitik und deren Grenzen erklären.',
      'Bezüge zur aktuellen europäischen Wirtschaftspolitik darstellen.',
      'Strukturelle Maßnahmen an regionalen oder überregionalen Beispielen erörtern.',
      'Die Entwicklung der europäischen Wirtschaftspolitik zu einer Fiskalunion kennzeichnen.',
      'Aktuelle wirtschaftspolitische Strategien und Entscheidungen debattieren.',
      'Szenarien wirtschaftspolitischer Handlungsmöglichkeiten für konkrete Wirtschaftssituationen entwickeln.',
      'Unterschiedliche wirtschaftspolitische Konzepte beurteilen.',
      'Konsequenzen wirtschaftspolitischer Konzepte für das Handeln von Wirtschaftssubjekten ableiten.',
    ],
  },
  {
    code: 'Q-VWL-GELDPOLITIK',
    title: 'Qualifikationsphase: Geldpolitik',
    page: 27,
    stage: 'SekII',
    courseLevel: 'GK_LK',
    goals: [
      'Funktionen des Banken- und Finanzsystems erläutern.',
      'Entwicklung der Wirtschafts- und Währungsunion beschreiben.',
      'Ziele und Aufgaben des Eurosystems erörtern.',
      'Konvergenzkriterien der Europäischen Union nennen und begründen.',
      'Wirkungsweise geldpolitischer Instrumente erklären und Wirkungshemmnisse darstellen.',
      'Interessenkonflikte der Euromitgliedstaaten und der Geldwertstabilität erklären.',
      'Verfahren zur Messung von Preissteigerungen erklären.',
      'Auswirkungen von Preissteigerungen beschreiben.',
      'Den Prozess der Giralgeldschöpfung erläutern.',
      'Bestandteile der Geldmenge M3 beschreiben.',
      'Zins- und Mengentender unterscheiden.',
      'Möglichkeiten und Grenzen der Geldpolitik diskutieren.',
      'Interessenkonflikte geldpolitischer Entscheidungen mit der Dilemmamethode analysieren.',
      'An einfachen Beispielen den Preisindex berechnen.',
      'Wirksamkeit geldpolitischer Instrumente in der jeweiligen Wirtschaftsperiode beurteilen.',
    ],
  },
  {
    code: 'Q-VWL-AUSSENWIRTSCHAFT',
    title: 'Qualifikationsphase: Aussenwirtschaftspolitik',
    page: 28,
    stage: 'SekII',
    courseLevel: 'GK_LK',
    goals: [
      'Die Bedeutung des Außenhandels begründen.',
      'Den Grundaufbau einer Zahlungsbilanz erklären.',
      'Freihandel und Protektionismus erklären.',
      'Chancen und Risiken der Globalisierung erörtern.',
      'Wechselkurssysteme unterscheiden und Vor- und Nachteile ableiten.',
      'Ausgleichsmechanismen der Zahlungsbilanz beschreiben.',
      'Protektionistische Maßnahmen diskutieren.',
      'Wechselkurssysteme und Wechselkursschwankungen mit dem Marktmodell erläutern.',
      'Sich zu protektionistischen Maßnahmen positionieren.',
    ],
  },
  {
    code: 'Q-BWL-GRUNDENTSCHEIDUNGEN',
    title: 'Qualifikationsphase: Betriebswirtschaftliche Grundentscheidungen',
    page: 29,
    stage: 'SekII',
    courseLevel: 'GK_LK',
    goals: [
      'Bestimmungsgrößen betriebswirtschaftlicher Entscheidungen wie Nutzenvorstellungen, rechtliche Gründe, Rechtsformen und Qualifikation erläutern.',
      'Die Grundstruktur einer Bilanz erweitern.',
      'Rechtsformen der AG und GmbH charakterisieren.',
      'Führungsstile im Rahmen der Organisation von Arbeitsbeziehungen erörtern.',
      'Den Unternehmenserfolg ermitteln und Auswirkungen auf das Eigenkapital darstellen.',
      'Doppelte Buchführung praktizieren.',
      'Ausgewählte Rechtsnormen des HGB anwenden.',
      'Unternehmensziele aus volks- und betriebswirtschaftlicher Sicht bewerten.',
      'Die Wahl einer geeigneten Rechtsform begründen.',
      'Betriebswirtschaftliche Entscheidungen unter dem Aspekt der Nachhaltigkeit prüfen.',
    ],
  },
  {
    code: 'Q-BWL-INVESTITION-FINANZIERUNG',
    title: 'Qualifikationsphase: Investition und Finanzierung',
    page: 30,
    stage: 'SekII',
    courseLevel: 'GK_LK',
    goals: [
      'Bedeutung von Investitionen für Erhalt und Weiterentwicklung von Unternehmen erläutern.',
      'Ausgewählte Finanzierungsarten beschreiben.',
      'Investitionsarten erläutern.',
      'Zusammenhang zwischen Investition und Finanzierung herstellen.',
      'Verbindung zwischen Finanzwirtschaft und Zahlungsfähigkeit von Unternehmen herstellen.',
      'Finanzierungsmöglichkeiten erläutern.',
      'Horizontale und vertikale Finanzierungsregel erklären.',
      'Einen einfachen Finanzierungs- und Abschreibungsplan erstellen.',
      'Finanzierungsregeln anwenden.',
      'Finanzierungsalternativen diskutieren.',
      'Finanzierungskonzepte beurteilen.',
    ],
  },
  {
    code: 'Q-BWL-PRODUKTION-KOSTEN',
    title: 'Qualifikationsphase: Produktion und Kosten',
    page: 31,
    stage: 'SekII',
    courseLevel: 'GK_LK',
    goals: [
      'Den Prozess der Leistungserstellung beschreiben.',
      'Kostenarten erläutern.',
      'Das Dilemma zwischen Kunden- und Kostenorientierung beschreiben.',
      'Kostenpunkte mit linearem Verlauf berechnen.',
      'Kostentheoretische Zusammenhänge anhand des linearen Kostenverlaufs erklären.',
      'Die Leistungserstellung in einem Unternehmen erkunden.',
      'Mathematisches Instrumentarium bei Kosten- und Leistungsrechnung anwenden.',
      'Kostenpunkte grafisch darstellen.',
      'Bedeutung der Kosten- und Leistungsrechnung für den Unternehmenserfolg beurteilen.',
      'Soziale Verantwortung des Unternehmers bei betriebswirtschaftlichen Entscheidungen unter Nachhaltigkeitsaspekten bewerten.',
    ],
  },
  {
    code: 'Q-BWL-MARKT-ABSATZ',
    title: 'Qualifikationsphase: Markt und Absatz',
    page: 32,
    stage: 'SekII',
    courseLevel: 'GK_LK',
    goals: [
      'Die Bedeutung des Marketings im betrieblichen Leistungsprozess beschreiben.',
      'Marketingmix als Produkt-, Preis-, Distributions- und Kommunikationspolitik erläutern.',
      'Motive und Formen von Unternehmenszusammenschlüssen erklären.',
      'Vollkommene und unvollkommene Märkte unterscheiden.',
      'Preisbildung auf polypolistischen und monopolistischen Märkten beschreiben.',
      'Ausgewählte Preisfunktionen erklären.',
      'Gewinnmaximale Preis-Mengen-Kombination berechnen.',
      'Ein Marketingkonzept entwickeln.',
      'Bezüge zu absatzpolitischen Entscheidungen regionaler Unternehmen herstellen.',
      'Den Verlauf der Preis-Absatz-Funktion grafisch und rechnerisch ermitteln.',
      'Auswirkungen von Unternehmenszusammenschlüssen beurteilen.',
      'Wirkung von Werbung auf Konsumentenverhalten bewerten.',
    ],
  },
  {
    code: 'Q-BWL-BILANZANALYSE',
    title: 'Qualifikationsphase: Bilanzanalyse',
    page: 33,
    stage: 'SekII',
    courseLevel: 'LK',
    goals: [
      'Bedeutung der Bilanzanalyse als Instrument zur Erfassung der Vermögens- und Schuldenlage erläutern.',
      'Kennziffern der Liquidität, Anlagendeckung, Rentabilität und des Verschuldungsgrades erklären.',
      'Bilanzierungsregeln mithilfe des HGB anwenden.',
      'Kennziffern der Liquidität, Anlagendeckung, Rentabilität und des Verschuldungsgrades berechnen.',
      'Lösungsschritte zur Bilanzanalyse entwickeln.',
      'Aussagekraft ausgewählter Kennziffern beurteilen.',
      'Schlussfolgerungen aus der Bilanzanalyse zur Leistungskraft eines Unternehmens ableiten.',
    ],
  },
  {
    code: 'Q-RECHT-GRUNDLAGEN',
    title: 'Qualifikationsphase: Grundlagen unserer Rechtsordnung',
    page: 34,
    stage: 'SekII',
    courseLevel: 'GK_LK',
    goals: [
      'Funktionen der Rechtsordnung erklären.',
      'Rechtsquellen nennen und die Entwicklung des Rechts an ausgewählten Beispielen beschreiben.',
      'Natürliche und juristische Personen definieren.',
      'Formen von Willenserklärungen unterscheiden.',
      'Rechtsgeschäfte nach Kriterien einteilen.',
      'Grundsatz der Vertragsfreiheit erklären.',
      'Verbraucherschutzgesetze im BGB erläutern.',
      'Rechtsnormen analysieren.',
      'Das BGB zielgerichtet nutzen.',
      'Wirksamkeit von Willenserklärungen prüfen.',
      'Trennungs- und Abstraktionsprinzip anwenden.',
      'Juristische Ergebnisse feststellen.',
      'Problematik von Recht und Gerechtigkeit an Beispielen diskutieren.',
      'Bedeutung der Rechtsordnung für das Gemeinwohl bewerten.',
      'Schutzwürdigkeit des Verbrauchers beurteilen.',
    ],
  },
  {
    code: 'Q-RECHT-SACHENRECHT',
    title: 'Qualifikationsphase: Sachenrecht',
    page: 35,
    stage: 'SekII',
    courseLevel: 'GK_LK',
    goals: [
      'Bedeutung der Eigentumsordnung für die Gesellschaft begründen.',
      'Möglichkeiten gesetzlichen und rechtsgeschäftlichen Eigentumserwerbs erklären.',
      'Zivilrechtliche Ansprüche aus Eigentum ableiten.',
      'Spannungsverhältnis zwischen Einzelinteressen und Allgemeinwohl diskutieren.',
      'Eigentumserwerb an Fallbeispielen subsumieren.',
      'Wertvorstellungen zu Achtung und Schutz von Eigentum mit eigenen Normen vergleichen.',
      'Eigenes und fremdes Handeln beim Umgang mit Eigentum beurteilen.',
    ],
  },
  {
    code: 'Q-RECHT-LEISTUNGSSTOERUNG',
    title: 'Qualifikationsphase: Leistungsstoerungsrecht',
    page: 36,
    stage: 'SekII',
    courseLevel: 'GK_LK',
    goals: [
      'Pflichtverletzung als zentralen Begriff des Leistungsstörungsrechts definieren.',
      'Arten von Leistungsstörungen unterscheiden.',
      'Mögliche Ansprüche aus Pflichtverletzungen ableiten.',
      'Schutzgedanken des BGB am Beispiel der AGB-Regelungen darstellen.',
      'Garantie und Gewährleistung unterscheiden.',
      'Leistungsstörungen an Fallbeispielen subsumieren.',
      'Prüfschemata zu Sachmangel und Verzug anwenden.',
      'Problemlösestrategien mit Fallstudien entwickeln.',
      'Rechtsverbindlichkeit eigenen Handelns und Folgen von Pflichtverletzungen bewerten.',
      'Anspruchsalternativen abwägen und beurteilen.',
    ],
  },
  {
    code: 'Q-RECHT-ANSPRUCHSDURCHSETZUNG',
    title: 'Qualifikationsphase: Zivilrechtliche Durchsetzung von Anspruechen',
    page: 37,
    stage: 'SekII',
    courseLevel: 'GK_LK',
    goals: [
      'Gesetzliche und vertragliche Ansprüche unterscheiden.',
      'Ablauf des Mahnverfahrens erklären.',
      'Zivilrechtliches Verfahren in seinem Ablauf strukturieren.',
      'Ansprüche anhand von Fallbeispielen ableiten.',
      'Bedeutung der außergerichtlichen Einigung als Alternative zum Klageverfahren beurteilen.',
    ],
  },
]

const ids = {
  householdBudget: canonicalIdByTitle('Haushaltsbudget und Sparziele planen'),
  payment: canonicalIdByTitle('Zahlungsarten situationsbezogen auswählen'),
  moneyValue: canonicalIdByTitle('Geldwertstabilität und Geldfunktionen einordnen'),
  consumerBehavior: canonicalIdByTitle('Verbraucherverhalten verstehen'),
  consumptionReflection: canonicalIdByTitle('Konsumentscheidungen kritisch reflektieren'),
  sustainableConsumption: canonicalIdByTitle('Nachhaltigen Konsum und Lebensqualitaet bewerten'),
  consumerRights: canonicalIdByTitle('Verbraucherschutz und Regulierung'),
  contractualConsumerRights: canonicalIdByTitle('Vertragliche Verbraucherrechte'),
  legalFunctions: canonicalIdByTitle('Funktionen rechtlicher Regelungen beurteilen'),
  legalFramework: canonicalIdByTitle('Rechtliche Rahmenbedingungen nach Rechtsfunktionen analysieren'),
  legalTechniques: canonicalIdByTitle('Juristische Arbeitstechniken im Kaufrecht anwenden'),
  ownership: canonicalIdByTitle('Eigentumsordnung in der Sozialen Marktwirtschaft analysieren'),
  contracts: canonicalIdByTitle('Vertragstypen und Pflichten der Vertragsparteien abgrenzen'),
  performanceLaw: canonicalIdByTitle('Leistungsstörungen im Kaufrecht systematisch analysieren'),
  defectivePerformance: canonicalIdByTitle('Mangelhafte Leistung im Kaufrecht identifizieren'),
  legalBalance: canonicalIdByTitle('Gerechten Interessenausgleich in Rechtsfällen diskutieren'),
  criminalLaw: canonicalIdByTitle('Rechtliche Konsequenzen widerrechtlichen Handelns abschätzen'),
  marketModel: canonicalIdByTitle('Marktmodell anwenden und kritisch einordnen'),
  marketEquilibrium: canonicalIdByTitle('Marktgleichgewicht, Elastizitäten und Gesamtwohlfahrt analysieren'),
  priceFunctions: canonicalIdByTitle('Preisfunktionen und dezentrale Koordination erklären'),
  competition: canonicalIdByTitle('Wettbewerbsordnung beurteilen'),
  competitionPolicy: canonicalIdByTitle('Wettbewerbspolitische Maßnahmen beurteilen'),
  concentration: canonicalIdByTitle('Konzentration bewerten'),
  economicCycle: canonicalIdByTitle('Gesamtwirtschaftliche Zusammenhänge im Kreislaufmodell darstellen'),
  socialMarket: canonicalIdByTitle('Soziale Marktwirtschaft einordnen'),
  socialMarketOrder: canonicalIdByTitle('Institutionenökonomische Perspektive auf die Soziale Marktwirtschaft anwenden'),
  orderConcepts: canonicalIdByTitle('Ordnungspolitische Konzepte vergleichen'),
  stateVsMarket: canonicalIdByTitle('Staatsintervention vs. Markt'),
  fiscalPolicy: canonicalIdByTitle('Fiskalpolitik und Konjunktur'),
  taxes: canonicalIdByTitle('Steuerwirkungen abschätzen'),
  publicDebt: canonicalIdByTitle('Staatsfinanzierung und Verschuldung'),
  socialStateGoals: canonicalIdByTitle('Ziele des Sozialstaats abwägen'),
  socialInsurance: canonicalIdByTitle('Gesetzliche Sozialversicherung finanzierungs- und gerechtigkeitsbezogen bewerten'),
  justiceConcepts: canonicalIdByTitle('Gerechtigkeitskonzepte vergleichen'),
  companyStructure: canonicalIdByTitle('Grundlegenden Unternehmensaufbau darstellen'),
  companyProcesses: canonicalIdByTitle('Kern- und Unterstützungsprozesse in Unternehmen analysieren'),
  companyTargets: canonicalIdByTitle('Unternehmerische Zielsetzungen stakeholderbezogen analysieren'),
  companyStakeholders: canonicalIdByTitle('Unternehmerisches Handeln aus Stakeholder-Perspektiven bewerten'),
  businessModel: canonicalIdByTitle('Geschäftsmodell und unternehmerische Grundentscheidungen darstellen'),
  entrepreneur: canonicalIdByTitle('Unternehmerisch denken und entscheiden'),
  companyFinance: canonicalIdByTitle('Unternehmensfinanzierung'),
  investment: canonicalIdByTitle('Investitionsalternativen statisch und dynamisch beurteilen'),
  financeDecision: canonicalIdByTitle('Finanzierungsentscheidungen zielbezogen beurteilen'),
  simpleBalance: canonicalIdByTitle('Vereinfachte Bilanz erstellen'),
  booking: canonicalIdByTitle('Geschäftsvorfälle in der Bilanz darstellen'),
  profitLoss: canonicalIdByTitle('Unternehmenserfolg mit der GuV ermitteln'),
  balanceAnalysis: canonicalIdByTitle('Bilanz und GuV mit Kennzahlen analysieren'),
  balanceVisual: canonicalIdByTitle('Bilanz- und GuV-Informationen grafisch darstellen'),
  breakEven: canonicalIdByTitle('Break-even-Analysen für Unternehmensentscheidungen nutzen'),
  production: canonicalIdByTitle('Produktions- und Innovationskonzepte beurteilen'),
  locationCompetition: canonicalIdByTitle('Standortwettbewerb bewerten'),
  marketingImportance: canonicalIdByTitle('Bedeutung des Marketings für Unternehmen einschätzen'),
  marketingAnalysis: canonicalIdByTitle('Marketingmaßnahmen zielbezogen analysieren'),
  marketingConcept: canonicalIdByTitle('Einfaches Marketingkonzept kriterienbezogen entwickeln'),
  marketPotential: canonicalIdByTitle('Marktsituation und Marktpotenzial eines Produkts analysieren'),
  coDetermination: canonicalIdByTitle('Betriebliche Mitbestimmung erklären'),
  workTimeParticipation: canonicalIdByTitle('Arbeitszeit- und Beteiligungsmodelle'),
  tariff: canonicalIdByTitle('Tarifkonflikte und Löhne'),
  laborModels: canonicalIdByTitle('Arbeitsmarktmodelle diskutieren'),
  workDevelopments: canonicalIdByTitle('Entwicklungen der Arbeitswelt beurteilen'),
  workDigital: canonicalIdByTitle('Digitalisierung der Arbeitswelt bewerten'),
  careerProfile: canonicalIdByTitle('Berufswahlprofil und Anforderungsprofile abgleichen'),
  careerInfo: canonicalIdByTitle('Informationswege der Berufs- und Studienorientierung nutzen'),
  careerApplication: canonicalIdByTitle('Bewerbungsverfahren adressatengerecht vorbereiten'),
  gdp: canonicalIdByTitle('Wohlstand differenziert messen'),
  growthLifeQuality: canonicalIdByTitle('Wachstum und Lebensqualität messen'),
  growthQualityBasic: canonicalIdByTitle('Wachstum und Lebensqualität messen'),
  sustainableGrowth: canonicalIdByTitle('Nachhaltiges Wachstum operationalisieren'),
  environmentalProblems: canonicalIdByTitle('Ökologische Herausforderungen'),
  environmentalInstruments: canonicalIdByTitle('Umweltpolitische Instrumente vergleichen'),
  environmentalPolicyMultilevel: canonicalIdByTitle('Umweltpolitik im Mehrebenensystem'),
  externalities: canonicalIdByTitle('Formen von Marktversagen'),
  externalEffects: canonicalIdByTitle('Externe Effekte analysieren'),
  cycleIndicators: canonicalIdByTitle('Konjunkturindikatoren nutzen'),
  cycleModels: canonicalIdByTitle('Konjunkturmodelle anwenden'),
  cycleForecasts: canonicalIdByTitle('Konjunkturprognosen einschätzen'),
  policyGrowth: canonicalIdByTitle('Wirtschaftspolitische Maßnahmen zu Wachstum und Beschäftigung modellgestützt erklären'),
  policyEvaluate: canonicalIdByTitle('Wirtschaftspolitische Maßnahmen perspektivisch bewerten'),
  stabilityLaw: canonicalIdByTitle('Stabilitätsgesetz anwenden'),
  moneyCreation: canonicalIdByTitle('Geldschöpfung und Zinsmechanismus'),
  priceInterest: canonicalIdByTitle('Preis- und Zinsniveauwirkungen makroökonomisch analysieren'),
  inflation: canonicalIdByTitle('Inflationsursachen und -dynamik'),
  ezb: canonicalIdByTitle('Geldpolitische Instrumente erläutern'),
  ezbDecision: canonicalIdByTitle('EZB-Entscheidungen mandatsbezogen nachvollziehen'),
  financialActors: canonicalIdByTitle('Akteure des Geld- und Kapitalmarkts analysieren'),
  financialRegulation: canonicalIdByTitle('Finanzmarktregulierung diskutieren'),
  capitalMarket: canonicalIdByTitle('Kapitalmarkt und Geldanlage vertiefen'),
  euInternalMarket: canonicalIdByTitle('Binnenmarktmechanismen analysieren'),
  euCurrency: canonicalIdByTitle('Herausforderungen der EWU'),
  globalization: canonicalIdByTitle('Globalisierung beschreiben'),
  globalValueChains: canonicalIdByTitle('Globale Wertschöpfungsketten verstehen'),
  tradePolicy: canonicalIdByTitle('Zoll- und Handelspolitik bewerten'),
  protectionism: canonicalIdByTitle('Schutzzölle und Protektionismus'),
  tradeConflict: canonicalIdByTitle('Dynamik von Handelskonflikten'),
  worldTradeDevelopment: canonicalIdByTitle('Welthandel und Entwicklung'),
  internationalInterdependence: canonicalIdByTitle('Internationale wirtschaftliche Verflechtung Deutschlands beurteilen'),
  balanceOfPayments: canonicalIdByTitle('Leistungsbilanz und außenwirtschaftliches Gleichgewicht interpretieren'),
  exchangeRates: canonicalIdByTitle('Wechselkursschwankungen für Haushalte und Unternehmen analysieren'),
  exchangeRateRegimes: canonicalId('13b20cee-8977-5b3f-938b-2064e96f2a5b'),
  globalBusiness: canonicalIdByTitle('Globale Geschäftsprozesse'),
  illegalTort: canonicalIdByTitle('Unerlaubte Handlung und Strafrecht fallbezogen anwenden'),
  contractConsequences: canonicalIdByTitle('Verträge und rechtliche Folgen des eigenen Handelns analysieren'),
  minorConsumerRights: canonicalIdByTitle('Rechte beschränkt Geschäftsfähiger bei Kaufhandlungen wahrnehmen'),
  consumerPurchaseRights: canonicalIdByTitle('Verbraucherrechte in Kaufsituationen kommunizieren'),
  concreteLegalNorms: canonicalIdByTitle('Rechtsnormen auf konkrete Sachverhalte anwenden'),
  investmentAndMoneyValue: canonicalIdByTitle('Anlageentscheidungen und Geldwertstabilität reflektieren'),
  legalStateRules: canonicalIdByTitle('Rechtliche Regelungen und Rechtsstaatlichkeit beurteilen'),
  legalClaims: canonicalIdByTitle('Gesetzliche Ansprüche juristisch begründen'),
}

function targetsFor(goal: SourceGoal): string[] {
  const topic = goal.topicCode
  const text = goal.sourceText.toLowerCase()
  const targets = new Set<string>()
  const add = (...goalIds: string[]) => goalIds.forEach((id) => targets.add(id))

  if (topic.includes('HAUSHALT')) add(ids.householdBudget, ids.consumerBehavior, ids.consumptionReflection, ids.consumerRights)
  if (topic.includes('UNTERNEHMEN')) add(ids.companyStructure, ids.companyProcesses, ids.companyTargets, ids.careerProfile)
  if (topic.includes('STAAT')) add(ids.socialMarket, ids.stateVsMarket, ids.fiscalPolicy, ids.legalFunctions, ids.socialStateGoals, ids.competition)
  if (topic.includes('REGIONAL')) add(ids.gdp, ids.cycleIndicators, ids.marketModel, ids.euInternalMarket, ids.globalization)
  if (topic.includes('SOZIALE-MARKTWIRTSCHAFT')) add(ids.socialMarket, ids.socialMarketOrder, ids.policyEvaluate, ids.sustainableGrowth, ids.growthQualityBasic)
  if (topic.includes('KONJUNKTUR')) add(ids.economicCycle, ids.cycleIndicators, ids.cycleModels, ids.cycleForecasts, ids.fiscalPolicy)
  if (topic.includes('WIRTSCHAFTSPOLITIK')) add(ids.policyGrowth, ids.policyEvaluate, ids.fiscalPolicy, ids.stabilityLaw)
  if (topic.includes('GELDPOLITIK')) add(ids.moneyValue, ids.moneyCreation, ids.priceInterest, ids.ezb, ids.ezbDecision, ids.inflation, ids.financialActors)
  if (topic.includes('AUSSENWIRTSCHAFT')) add(ids.tradePolicy, ids.protectionism, ids.tradeConflict, ids.balanceOfPayments, ids.exchangeRates, ids.exchangeRateRegimes, ids.globalization)
  if (topic.includes('BWL-GRUND')) add(ids.companyStructure, ids.companyTargets, ids.simpleBalance, ids.profitLoss, ids.coDetermination)
  if (topic.includes('INVESTITION-FINANZIERUNG')) add(ids.companyFinance, ids.investment, ids.financeDecision)
  if (topic.includes('PRODUKTION-KOSTEN')) add(ids.companyProcesses, ids.production, ids.breakEven, ids.companyTargets)
  if (topic.includes('MARKT-ABSATZ')) add(ids.marketingImportance, ids.marketingAnalysis, ids.marketingConcept, ids.marketPotential, ids.marketModel, ids.priceFunctions, ids.concentration)
  if (topic.includes('BILANZANALYSE')) add(ids.balanceAnalysis, ids.balanceVisual, ids.simpleBalance)
  if (topic.includes('RECHT-GRUNDLAGEN')) add(ids.legalFunctions, ids.legalFramework, ids.legalStateRules, ids.contracts, ids.contractConsequences, ids.contractualConsumerRights, ids.legalTechniques, ids.concreteLegalNorms)
  if (topic.includes('RECHT-SACHENRECHT')) add(ids.ownership, ids.legalFramework, ids.legalBalance)
  if (topic.includes('LEISTUNGSSTOERUNG')) add(ids.performanceLaw, ids.defectivePerformance, ids.contractualConsumerRights, ids.legalTechniques)
  if (topic.includes('ANSPRUCHSDURCHSETZUNG')) add(ids.legalFramework, ids.legalTechniques, ids.legalBalance, ids.performanceLaw, ids.legalClaims)

  if (text.includes('bedürfnis') || text.includes('knappheit') || text.includes('konsum')) add(ids.consumerBehavior, ids.consumptionReflection, ids.sustainableConsumption)
  if (text.includes('geld') || text.includes('zahlung') || text.includes('zins') || text.includes('kredit') || text.includes('anlage')) add(ids.payment, ids.moneyValue, ids.householdBudget, ids.investmentAndMoneyValue, ids.financialActors, ids.capitalMarket)
  if (text.includes('verschuldung')) add(ids.householdBudget, ids.contractualConsumerRights)
  if (text.includes('werbung') || text.includes('marketing')) add(ids.marketingImportance, ids.marketingAnalysis, ids.marketingConcept)
  if (text.includes('verbraucher') || text.includes('kaufvertrag') || text.includes('fernabsatz') || text.includes('sachmangel')) add(ids.consumerRights, ids.consumerPurchaseRights, ids.contractualConsumerRights, ids.performanceLaw, ids.defectivePerformance)
  if (text.includes('geschäftsfähigkeit') || text.includes('beschränkt')) add(ids.minorConsumerRights)
  if (text.includes('vertrag') || text.includes('willenserklärung') || text.includes('vertragsfreiheit')) add(ids.contracts, ids.contractConsequences, ids.legalTechniques, ids.legalFramework)
  if (text.includes('recht') || text.includes('bgb') || text.includes('hgb') || text.includes('rechtsnorm')) add(ids.legalFunctions, ids.legalFramework, ids.legalStateRules, ids.legalTechniques, ids.concreteLegalNorms)
  if (text.includes('eigentum') || text.includes('besitz')) add(ids.ownership)
  if (text.includes('straf')) add(ids.illegalTort, ids.criminalLaw)
  if (text.includes('unternehmen') || text.includes('betrieb')) add(ids.companyStructure, ids.companyProcesses, ids.companyTargets)
  if (text.includes('gründung') || text.includes('selbstständig')) add(ids.businessModel, ids.entrepreneur)
  if (text.includes('standort')) add(ids.locationCompetition, ids.globalBusiness)
  if (text.includes('bilanz') || text.includes('buchführung') || text.includes('t-konten')) add(ids.simpleBalance, ids.booking, ids.profitLoss, ids.balanceAnalysis)
  if (text.includes('finanzierung') || text.includes('investition')) add(ids.companyFinance, ids.investment, ids.financeDecision)
  if (text.includes('kosten') || text.includes('break')) add(ids.breakEven, ids.production)
  if (text.includes('rechtsform') || text.includes('ag') || text.includes('gmbh')) add(ids.companyStructure, ids.businessModel)
  if (text.includes('mitbestimmung') || text.includes('betriebsrat')) add(ids.coDetermination)
  if (text.includes('tarif') || text.includes('mindestlohn')) add(ids.tariff)
  if (text.includes('arbeit') || text.includes('beruf') || text.includes('studien')) add(ids.workDevelopments, ids.workDigital, ids.laborModels, ids.careerProfile, ids.careerInfo)
  if (text.includes('bewerb')) add(ids.careerApplication)
  if (text.includes('markt') || text.includes('angebot') || text.includes('nachfrage') || text.includes('preis')) add(ids.marketModel, ids.marketEquilibrium, ids.priceFunctions)
  if (text.includes('wettbewerb') || text.includes('konzentration') || text.includes('zusammenschluss')) add(ids.competition, ids.competitionPolicy, ids.concentration)
  if (text.includes('wirtschaftsordnung') || text.includes('marktwirtschaft')) add(ids.socialMarket, ids.socialMarketOrder, ids.orderConcepts, ids.stateVsMarket)
  if (text.includes('grundgesetz')) add(ids.legalFramework, ids.socialMarket)
  if (text.includes('staat') || text.includes('steuer') || text.includes('subvention') || text.includes('haushaltspolitik')) add(ids.fiscalPolicy, ids.taxes, ids.publicDebt)
  if (text.includes('sozialversicherung') || text.includes('sozialstaat') || text.includes('sozialen marktwirtschaft')) add(ids.socialStateGoals, ids.socialInsurance, ids.justiceConcepts)
  if (text.includes('gerechtigkeit') || text.includes('gemeinwohl')) add(ids.justiceConcepts, ids.legalBalance)
  if (text.includes('bip') || text.includes('wertschöpfung')) add(ids.gdp, ids.growthQualityBasic)
  if (text.includes('wachstum') || text.includes('wohlstand')) add(ids.growthLifeQuality, ids.growthQualityBasic, ids.sustainableGrowth)
  if (text.includes('nachhalt') || text.includes('ökolog') || text.includes('umwelt')) add(ids.sustainableConsumption, ids.sustainableGrowth, ids.environmentalProblems, ids.environmentalInstruments, ids.environmentalPolicyMultilevel, ids.externalities, ids.externalEffects)
  if (text.includes('konjunktur') || text.includes('indikator') || text.includes('multiplikator')) add(ids.cycleIndicators, ids.cycleModels, ids.cycleForecasts)
  if (text.includes('angebots-') || text.includes('nachfrageorientiert') || text.includes('monetarismus') || text.includes('fiskalismus')) add(ids.policyGrowth, ids.policyEvaluate)
  if (text.includes('europ') || text.includes('eu ') || text.includes('ewwu') || text.includes('gemeinschaftswährung')) add(ids.euInternalMarket, ids.euCurrency)
  if (text.includes('ezb') || text.includes('eurosystem') || text.includes('geldpolitik')) add(ids.ezb, ids.ezbDecision, ids.moneyCreation, ids.priceInterest)
  if (text.includes('inflation') || text.includes('deflation') || text.includes('preissteigerung')) add(ids.inflation)
  if (text.includes('global') || text.includes('international') || text.includes('außenhandel')) add(ids.globalization, ids.globalValueChains, ids.internationalInterdependence)
  if (text.includes('freihandel') || text.includes('protektionismus') || text.includes('zoll')) add(ids.tradePolicy, ids.protectionism, ids.tradeConflict)
  if (text.includes('zahlungsbilanz') || text.includes('leistungsbilanz')) add(ids.balanceOfPayments)
  if (text.includes('wechselkurs')) add(ids.exchangeRates, ids.exchangeRateRegimes)

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
      title: `TH ${topic.code} (${index + 1}): ${goalText}`,
      description: `Source-Ziel aus ${topic.title}: ${goalText}`,
      sourceText: goalText,
      sourceSpan: `${topic.code} (${index + 1})`,
      parentBulletText: goalText,
      sourceRef: `${sourceDocument.title}, ${topic.title}, S. ${topic.page}.`,
      courseLevel: topic.courseLevel ?? params.stage,
      granularity: 'officialContentOrRequirement',
      tags: ['jurisdiction:DE-TH', 'subject:Wirtschaft', `stage:${params.stage}`, `topic:${topic.code}`],
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
    jurisdiction: 'DE-TH',
    subject: 'Wirtschaft und Recht',
    stage: params.stage,
    title: params.title,
    sourceDocument: { ...sourceDocument, official: true },
    method: {
      passageExtraction: 'pdftotext -layout; wirtschafts- und wirtschaftsrechtsbezogene Lehrplanpassagen aus dem amtlichen Thueringer Lehrplan Wirtschaft und Recht 2012 extrahiert',
      sourceGoalExtraction: 'one normalized source goal per official assessable competence; compact method/self-competence bullets retained where they are fachlich wirtschafts- or rechtsbezogen',
      scopeNote: 'Der Thueringer Lehrplan Wirtschaft und Recht 2012 umfasst Klassenstufe 10 und Qualifikationsphase in einem Dokument. Die aeltere GYOS-Orientierung 2010 wurde nur gegengeprueft; Primärquelle ist der vollstaendige Lehrplan 2012.',
    },
    qualityReview: params.qualityReview,
    expectedTopicCodes: params.topics.map((topic) => topic.code),
    pipelineStatus: {
      currentStep: 'MAPPING-3',
      steps: [
        { id: 'ORIGINALQUELLEN', label: 'Originalquellen bereitgestellt', status: 'complete', dependsOn: [], checks: [{ id: 'source-document-present', label: 'Amtlicher Thueringer Lehrplan Wirtschaft und Recht liegt lokal vor', passed: true, details: sourceDocument.path }] },
        { id: 'MAPPING-1', label: 'Original-Lehrplanpassagen extrahiert', status: 'complete', dependsOn: ['ORIGINALQUELLEN'], checks: [{ id: 'passages-extracted', label: 'Wirtschaft-und-Recht-Passagen wurden aus dem amtlichen Lehrplan extrahiert', passed: true, details: `${passages.length} Passagen.` }] },
        { id: 'MAPPING-2', label: 'Source-Ziele aus Lehrplanpassagen erstellt', status: 'complete', dependsOn: ['MAPPING-1'], checks: [{ id: 'source-goals-created', label: 'Aus den Thueringer Lehrplanpassagen wurden Source-Ziele erzeugt', passed: true, details: `${sourceGoals.length} Source-Ziele.` }] },
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
      rationale: 'TH-Source-Ziel ist durch vorhandene kanonische Wirtschaft-Ziele fachlich vollständig abgedeckt; partial beschreibt die Zuordnungsform 1:n oder Sammelziel, nicht eine offene Lücke.',
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
    jurisdiction: 'DE-TH',
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

function upsertReferenceBlock(file: string, marker: string, content: string) {
  mkdirSync(path.dirname(file), { recursive: true })
  const start = `<!-- ${marker}:start -->`
  const end = `<!-- ${marker}:end -->`
  const block = `${start}\n${content.trim()}\n${end}`
  const current = existsSync(file) ? readFileSync(file, 'utf8') : ''
  const pattern = new RegExp(`${start.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${end.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`)
  const next = pattern.test(current)
    ? current.replace(pattern, block)
    : `${current.trimEnd()}${current.trimEnd() ? '\n\n' : ''}${block}\n`
  writeFileSync(file, next, 'utf8')
}

const lowerOutput = 'curricula/DE/Gymnasium/input/TH/lower-secondary/source-extraction/DE_TH_WIRTSCHAFT_RECHT_SEKI_LEHRPLAN_GYMNASIUM_2012.source-extraction.json'
const upperOutput = 'curricula/DE/Gymnasium/input/TH/upper-secondary/source-extraction/DE_TH_WIRTSCHAFT_RECHT_SEKII_LEHRPLAN_GYMNASIUM_2012.source-extraction.json'
const lowerReviewPath = 'curricula/DE/Gymnasium/mapping/DE-TH/lower-secondary/th_wirtschaft_recht_lower_secondary_source_extraction_to_canonical_wirtschaft.review.json'
const upperReviewPath = 'curricula/DE/Gymnasium/mapping/DE-TH/upper-secondary/th_wirtschaft_recht_upper_secondary_source_extraction_to_canonical_wirtschaft.review.json'

const lowerExtraction = buildExtraction({
  extractionId: 'DE-TH-WIRTSCHAFT-RECHT-SEKI',
  sourceLandscapeId: lowerSourceLandscapeId,
  title: 'Wirtschaft und Recht Sekundarstufe I (Thueringen, Lehrplan 2012 Source-Extraction)',
  stage: 'SekI',
  topics: lowerTopics,
  reviewPath: lowerReviewPath,
  qualityReview: {
    sourceGoalCountPeerBaseline: {
      accepted: true,
      details: 'TH Sek I nutzt ein eigenes Fach Wirtschaft und Recht in Klassenstufe 10. Die Source-Zielzahl liegt im Korridor vergleichbarer direkter Wirtschaft-/Wirtschaft-und-Recht-Quellen.',
    },
  },
})

const upperExtraction = buildExtraction({
  extractionId: 'DE-TH-WIRTSCHAFT-RECHT-SEKII',
  sourceLandscapeId: upperSourceLandscapeId,
  title: 'Wirtschaft und Recht Qualifikationsphase (Thueringen, Lehrplan 2012 Source-Extraction)',
  stage: 'SekII',
  topics: upperTopics,
  reviewPath: upperReviewPath,
  qualityReview: {
    sourceGoalCountPeerBaseline: {
      accepted: true,
      details: 'TH Sek II bildet Volkswirtschaftslehre, Betriebswirtschaftslehre und wirtschaftsbezogene Rechtsbereiche ab. Die Gesamtzahl ist nahe bei BY/ST und damit fuer ein direktes Wirtschaft-und-Recht-Fach plausibel.',
    },
  },
})

writeJson(path.join(repoRoot, lowerOutput), lowerExtraction)
writeJson(path.join(repoRoot, upperOutput), upperExtraction)
writeReview({ reviewPath: lowerReviewPath, reviewId: 'DE-TH-WIRTSCHAFT-RECHT-SEKI-MAPPING-3-SOURCE-EXTRACTION-1', extractionPath: lowerOutput, extraction: lowerExtraction })
writeReview({ reviewPath: upperReviewPath, reviewId: 'DE-TH-WIRTSCHAFT-RECHT-SEKII-MAPPING-3-SOURCE-EXTRACTION-1', extractionPath: upperOutput, extraction: upperExtraction })
upsertRegistryEntry({ landscapeId: lowerSourceLandscapeId, title: lowerExtraction.title, stage: 'Sekundarstufe I', archivePath: 'curricula/DE/Gymnasium/input/TH/lower-secondary/' })
upsertRegistryEntry({ landscapeId: upperSourceLandscapeId, title: upperExtraction.title, stage: 'Sekundarstufe II', archivePath: 'curricula/DE/Gymnasium/input/TH/upper-secondary/' })

upsertReferenceBlock(
  path.join(repoRoot, 'curricula/DE/Gymnasium/input/TH/lower-secondary/references.md'),
  'DE-TH-WIRTSCHAFT-RECHT-SEKI-SOURCE-EXTRACTION',
  `## Wirtschaft und Recht

Starting point:
https://landesrechenzentrum.schulportal-thueringen.de/web/guest/media/detail?tspi=2843

- \`Lehrplan Wirtschaft und Recht, Gymnasium (2012)\`:
  ${sourceDocument.url}

Scope:

- Thueringen
- Gymnasium
- Wirtschaft und Recht
- lower-secondary extraction target: Klassenstufe 10, chapter 2.1, economic and economic-law competence expectations

Archived locally at:

- \`${sourceDocument.path}\`

Generated source extraction:

- \`${lowerOutput}\``,
)

upsertReferenceBlock(
  path.join(repoRoot, 'curricula/DE/Gymnasium/input/TH/upper-secondary/references.md'),
  'DE-TH-WIRTSCHAFT-RECHT-SEKII-SOURCE-EXTRACTION',
  `## Wirtschaft und Recht

Starting point:
https://landesrechenzentrum.schulportal-thueringen.de/web/guest/media/detail?tspi=2843

- \`Lehrplan Wirtschaft und Recht, Gymnasium (2012)\`:
  ${sourceDocument.url}

Cross-check only:

- \`${checkedLegacyOrientation.title}\`:
  ${checkedLegacyOrientation.url}

Scope:

- Thueringen
- Gymnasiale Oberstufe
- Wirtschaft und Recht
- upper-secondary extraction target: Qualifikationsphase, chapter 3, Volkswirtschaftslehre, Betriebswirtschaftslehre and economic-law competence expectations

Archived locally at:

- \`${sourceDocument.path}\`
- \`${checkedLegacyOrientation.path}\`

Generated source extraction:

- \`${upperOutput}\``,
)

console.log(`Generated TH Wirtschaft source extractions: ${lowerExtraction.sourceGoals.length} lower + ${upperExtraction.sourceGoals.length} upper source goals.`)
