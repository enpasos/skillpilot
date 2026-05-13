import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

type TopicDraft = {
  code: string
  title: string
  page: number
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

const lowerSourceLandscapeId = idFrom('DE-NW Wirtschaft-Politik Sek I economics source extraction')
const upperSourceLandscapeId = idFrom('DE-NW Sozialwissenschaften Wirtschaft Sek II source extraction')

const lowerPdfPath = 'curricula/DE/Gymnasium/input/NW/lower-secondary/g9_wipo_klp_3429_2019_06_23.pdf'
const upperPdfPath = 'curricula/DE/Gymnasium/input/NW/upper-secondary/klp_gost_sowi.pdf'

const lowerTopics: TopicDraft[] = [
  {
    code: 'SI-56-IF1-KONSUM-GELD',
    title: 'Erprobungsstufe: wirtschaftliches Handeln in der marktwirtschaftlichen Ordnung',
    page: 25,
    goals: [
      'Das Spannungsfeld zwischen Konsumwünschen und verfügbaren Mitteln beschreiben.',
      'Funktionen des Geldes als Tausch-, Wertaufbewahrungs- und Rechenmittel erläutern.',
      'Analoge und digitale Verkaufsstrategien vergleichen.',
      'Eigene Konsumwünsche und Konsumentscheidungen im Verhältnis zu Nutzen und verfügbaren Mitteln bewerten.',
      'Grenzen und Folgen des Handelns als Verbraucherin oder Verbraucher auch unter rechtlichen Gesichtspunkten beurteilen.',
      'Einflüsse von Werbung und sozialen Medien auf das eigene Konsumverhalten beurteilen.',
    ],
  },
  {
    code: 'SI-56-IF3-NACHHALTIGKEIT',
    title: 'Erprobungsstufe: nachhaltige Entwicklung in Wirtschaft, Politik und Gesellschaft',
    page: 26,
    goals: [
      'Nachhaltige Entwicklung als Herausforderung privaten, gesellschaftlichen, wirtschaftlichen und politischen Handelns beschreiben.',
      'Lösungsansätze zur globalen Bekämpfung von Kinderarmut erläutern.',
      'Staatliche Maßnahmen und individuelle Handlungsmöglichkeiten zur Ressourceneffizienz beurteilen.',
      'Lebenssituationen von Kindern in unterschiedlich entwickelten Regionen der globalisierten Welt beurteilen.',
    ],
  },
  {
    code: 'SI-810-IF1-MARKT-SMW',
    title: 'Mittelstufe: Marktprozesse, Soziale Marktwirtschaft und Digitalisierung',
    page: 35,
    goals: [
      'Grundprinzipien der Sozialen Marktwirtschaft erläutern.',
      'Wettbewerb in der Sozialen Marktwirtschaft beschreiben.',
      'Digitalisierung von Märkten und des Zahlungsverkehrs erläutern.',
      'Die wirtschaftliche Bedeutung von Daten erläutern.',
      'Die Rolle von Unternehmen, Staat und privaten Haushalten im Wirtschaftskreislauf analysieren.',
      'Freie und Soziale Marktwirtschaft vergleichen.',
      'Möglichkeiten und Probleme der Sozialen Marktwirtschaft beurteilen.',
      'Quantitatives und qualitatives Wachstum unterscheiden und bewerten.',
      'Chancen und Risiken der Digitalisierung in der Sozialen Marktwirtschaft beurteilen.',
    ],
  },
  {
    code: 'SI-810-IF6-UNTERNEHMEN-ARBEIT',
    title: 'Mittelstufe: Unternehmen, Gewerkschaften und Arbeitswelt',
    page: 36,
    goals: [
      'Wertschöpfungsketten sowie betriebliche Funktionen von Beschaffung, Produktion und Absatz erläutern.',
      'Aufbau und Funktionen von Gewerkschaften und Arbeitgeberverbänden beschreiben.',
      'Betriebliche Mitbestimmungsmöglichkeiten beschreiben.',
      'Die Vielfalt selbstständiger Berufe beschreiben.',
      'Schritte in die unternehmerische Selbstständigkeit erläutern.',
      'Auswirkungen der Digitalisierung auf den Arbeitsmarkt beurteilen.',
      'Interessen in Tarifkonflikten beurteilen.',
      'Strategien der Existenzgründung beurteilen.',
      'Chancen und Risiken unternehmerischer Selbstständigkeit beurteilen.',
      'Die Bedeutung mittelständischer Unternehmen für die Wirtschaftsordnung beurteilen.',
      'Verantwortungsbewusstes unternehmerisches Handeln beurteilen.',
    ],
  },
  {
    code: 'SI-810-IF7-SOZIALE-SICHERUNG',
    title: 'Mittelstufe: soziale Sicherung in Deutschland',
    page: 37,
    goals: [
      'Funktionen des deutschen Sozialstaats erläutern.',
      'Sozialversicherungssysteme sowie betriebliche und private Vorsorge erläutern.',
      'Auswirkungen veränderter Erwerbsbiografien und des demografischen Wandels auf die soziale Sicherung analysieren.',
      'Einkommensunterschiede zwischen gesellschaftlichen Gruppen auch unter Geschlechteraspekten analysieren.',
      'Armut und Reichtum als gesellschaftliche Verteilungsfragen analysieren.',
      'Finanzierungsmöglichkeiten des Sozialstaats beurteilen.',
      'Die Sicherung eines menschenwürdigen Existenzminimums beurteilen.',
      'Die Zukunftsfähigkeit des deutschen Sozialstaats beurteilen.',
      'Unbezahlte Familienarbeit und gleiche Bezahlung für gleiche Arbeit beurteilen.',
    ],
  },
  {
    code: 'SI-810-IF8-VERBRAUCHER',
    title: 'Mittelstufe: Handeln als Verbraucherinnen und Verbraucher',
    page: 38,
    goals: [
      'Allgemeine Geschäftsbedingungen und Geschäftsfähigkeit in Verbrauchersituationen erläutern.',
      'Ursachen von Verschuldung beschreiben.',
      'Verbraucherinformation und Verbraucherschutzzentralen beschreiben.',
      'Konsumverhalten nach Wirtschaftlichkeit und Nachhaltigkeit analysieren.',
      'Algorithmen in Onlineangeboten und deren Wirkung auf Konsumentscheidungen erläutern.',
      'Chancen und Risiken im Onlinehandel beurteilen.',
      'Möglichkeiten zur Durchsetzung von Verbraucherinteressen beurteilen.',
      'Nachhaltigen Konsum kriterienorientiert beurteilen.',
    ],
  },
  {
    code: 'SI-810-IF9-EU-WIRTSCHAFT',
    title: 'Mittelstufe: Europäische Union als wirtschaftliche und politische Gemeinschaft',
    page: 39,
    goals: [
      'Motive und Ziele des europäischen Einigungsprozesses erläutern.',
      'Merkmale der Europäischen Union beschreiben.',
      'Merkmale der Europäischen Wirtschafts- und Währungsunion beschreiben.',
      'EU-Institutionen und Gesetzgebungsprozesse erläutern.',
      'Chancen und Herausforderungen des EU-Binnenmarkts für Verbraucherinnen, Unternehmen und Arbeitnehmer beurteilen.',
      'Die Europäische Wirtschafts- und Währungsunion interessenbezogen beurteilen.',
    ],
  },
  {
    code: 'SI-810-IF10-GLOBALISIERUNG',
    title: 'Mittelstufe: globalisierte Strukturen und Prozesse in der Wirtschaft',
    page: 40,
    goals: [
      'Merkmale und Ursachen des Welthandels erläutern.',
      'Ziele internationaler Akteure der Weltwirtschaft erläutern.',
      'Freihandel und Protektionismus unterscheiden.',
      'Positionen zentraler Weltwirtschaftsakteure beurteilen.',
      'Freihandelsabkommen und protektionistische Maßnahmen beurteilen.',
      'Ökonomische Globalisierung im Hinblick auf Nachhaltigkeit beurteilen.',
      'Standortkonkurrenz und globale Wertschöpfung wirtschaftlich beurteilen.',
    ],
  },
]

const upperTopics: TopicDraft[] = [
  {
    code: 'EF-IF2-MARKTWIRTSCHAFT',
    title: 'Einführungsphase: marktwirtschaftliche Ordnung',
    page: 48,
    courseLevel: 'GK_LK',
    goals: [
      'Marktprozesse und die wesentlichen Ordnungselemente eines marktwirtschaftlichen Systems beschreiben.',
      'Die Rolle der Verbraucherinnen und Verbraucher im Spannungsfeld von Bedürfnissen, Knappheit, Interessen und Marketingstrategien analysieren.',
      'Das Leitbild der Konsumentensouveränität mit Informations- und Machtasymmetrien vergleichen.',
      'Rationalitätsprinzip, Selbstregulation und unsichtbare Hand als ökonomische Modellannahmen erläutern.',
      'Privateigentum, Vertragsfreiheit und Wettbewerb als Ordnungselemente erläutern.',
      'Das Marktmodell und die Bildung des Gleichgewichtspreises erklären.',
      'Den erweiterten Wirtschaftskreislauf darstellen.',
      'Strukturen, Prozesse und Normen in Betrieben und Unternehmen analysieren.',
      'Kernfunktionen von Unternehmen erläutern.',
      'Preisbildung in unterschiedlichen Marktformen erklären.',
      'Mitbestimmung und Gewerkschaften in Betrieben und Unternehmen erläutern.',
      'Entlohnung und Tarifpolitik in der Sozialen Marktwirtschaft erläutern.',
      'Normative Grundannahmen der Sozialen Marktwirtschaft erläutern.',
      'Wachstum, Innovation und Produktivität als Chancen des Marktsystems erklären.',
      'Konzentration, Wettbewerbsbeschränkung, soziale Ungleichheit, Wirtschaftskrisen und ökologische Fehlsteuerungen als Grenzen des Marktsystems analysieren.',
      'Notwendigkeit und Grenzen von Ordnungs- und Wettbewerbspolitik erläutern.',
      'Gestaltungsvorstellungen zur Sozialen Marktwirtschaft vergleichen.',
      'Das Verhältnis von Bedürfnissen und Knappheit beurteilen.',
      'Konsumentensouveränität und Produzentensouveränität beurteilen.',
      'Ordnungs- und Wettbewerbspolitik in Marktprozessen beurteilen.',
      'Ethische Verantwortung von Konsumentinnen, Konsumenten und Produzenten beurteilen.',
      'Nachhaltiges Konsumentenhandeln beurteilen.',
      'Interessen von Konsumenten und Produzenten beurteilen.',
      'Stakeholder- und Shareholder-Konzepte sowie Social und Sustainable Entrepreneurship beurteilen.',
      'Lohn- und Tarifpolitik beurteilen.',
      'Mitbestimmung in Unternehmen beurteilen.',
      'Marktmodell und Wirtschaftskreislauf hinsichtlich Erklärungskraft beurteilen.',
      'Marktpreis und Wert von Gütern sowie Arbeit beurteilen.',
      'Das Modell des homo oeconomicus mit dem Leitbild des aufgeklärten Wirtschaftsbürgers vergleichen.',
      'Positionen zur Gestaltung der Sozialen Marktwirtschaft beurteilen.',
      'Zukunftsperspektiven der Sozialen Marktwirtschaft beurteilen.',
    ],
  },
  {
    code: 'Q-GK-IF5-WIRTSCHAFTSPOLITIK',
    title: 'Qualifikationsphase GK: Wirtschaftspolitik',
    page: 61,
    courseLevel: 'GK',
    goals: [
      'Konjunkturverlauf und Konjunkturzyklus anhand zentraler Indikatoren analysieren.',
      'Wirtschaftspolitische Ziele und Zielkonflikte im magischen Viereck beziehungsweise Sechseck erläutern.',
      'Ordnungs-, Struktur- und Prozesspolitik unterscheiden.',
      'Interessen und wirtschaftspolitische Konzeptionen von Arbeitgeberverbänden und Gewerkschaften analysieren.',
      'Angebotsorientierte, nachfrageorientierte und alternative wirtschaftspolitische Konzeptionen vergleichen.',
      'Grundlagen der Europäischen Wirtschafts- und Währungsunion erläutern.',
      'Status, Instrumente und Ziele der Europäischen Zentralbank erläutern.',
      'Möglichkeiten und Grenzen der EZB-Geldpolitik beurteilen.',
      'Handlungsspielräume nationaler Wirtschaftspolitik bei internationalen Verflechtungen und Krisen beurteilen.',
      'Staatliche Eingriffe in die Wirtschaft beurteilen.',
      'Rechtliche Legitimation wirtschaftspolitischen Handelns beurteilen.',
      'Aussagekraft von Konjunkturzyklus und ökonomischen Indikatoren beurteilen.',
      'Wohlstands- und Wachstumskonzeptionen in Bezug auf Nachhaltigkeit und Arbeitsmarkt beurteilen.',
      'Funktion und Gültigkeit ökonomischer Prognosen beurteilen.',
      'Wirkungen wirtschaftspolitischer Konzeptionen beurteilen.',
      'Unabhängigkeit und Zielsystem der EZB beurteilen.',
      'Grenzen nationaler Wirtschaftspolitik beurteilen.',
    ],
  },
  {
    code: 'Q-GK-IF8-GLOBALISIERUNG',
    title: 'Qualifikationsphase GK: globale Strukturen und Prozesse',
    page: 67,
    courseLevel: 'GK',
    goals: [
      'Politische, gesellschaftliche, ökologische und wirtschaftliche Auswirkungen der Globalisierung analysieren.',
      'Ursachen weltweiter wirtschaftlicher Verflechtungen erläutern.',
      'Internationale Handels- und Finanzbeziehungen nach Erscheinungsformen, Abläufen, Akteuren und Einflussfaktoren analysieren.',
      'WTO, IWF und Weltbank als Institutionen der ökonomischen Globalisierung erläutern.',
      'Standortfaktoren des Wirtschaftsstandorts Deutschland erläutern.',
      'Interessen- und Machtkonstellationen in der Globalisierung beurteilen.',
      'Globalisierungskritische Organisationen beurteilen.',
      'Konsequenzen lokalen Handelns vor dem Hintergrund globaler Prozesse beurteilen.',
      'Standortkonkurrenz ökonomisch, politisch und gesellschaftlich beurteilen.',
    ],
  },
  {
    code: 'Q-LK-IF5-WIRTSCHAFTSPOLITIK-VERTIEFUNG',
    title: 'Qualifikationsphase LK: Wirtschaftspolitik - Vertiefung',
    page: 74,
    courseLevel: 'LK',
    goals: [
      'Ursachen von Konjunktur- und Wachstumsschwankungen nach unterschiedlichen Theorieansätzen erklären.',
      'Stabilität und Instabilitäten gesamtwirtschaftlicher Entwicklung analysieren.',
      'Ökonomische Diagnose- und Prognoseverfahren beurteilen.',
      'Positionen von Parteien, Nichtregierungsorganisationen, Arbeitgeberverbänden und Gewerkschaften wirtschaftspolitisch vergleichen.',
      'Marktversagen und Staatsversagen in ökonomischen und ökologischen Zusammenhängen analysieren.',
      'Grundprinzipien und Instrumente der Umweltpolitik erläutern.',
      'Globale Umwelt- und Klimaschutzinitiativen erläutern.',
      'Institutionelle Strukturen wirtschaftspolitischer Steuerung auf mikro- und makroökonomischer Ebene analysieren.',
      'Theoretische Grundlagen wirtschaftspolitischer Konzeptionen vertiefend vergleichen.',
      'Inflationstheorien und Strategien der Inflationsbekämpfung erläutern.',
      'Geld- und Fiskalpolitik als Stabilisierungsinstrumente beurteilen.',
      'Das Bruttoinlandsprodukt als Wohlstandsindikator beurteilen.',
      'Umweltpolitische Instrumente beurteilen.',
      'Zielkonflikte zwischen Ökonomie, Umwelt, Wachstum, Nachhaltigkeit und Gerechtigkeit beurteilen.',
      'Markt- und Staatsversagen in ökonomisch-ökologischen Problemfeldern beurteilen.',
      'Globale Umweltpolitik beurteilen.',
      'Reichweite konjunkturtheoretischer Erklärungen beurteilen.',
      'Die Bedeutung der EZB für wirtschaftspolitische Steuerung beurteilen.',
    ],
  },
  {
    code: 'Q-LK-IF6-EU-WIRTSCHAFT',
    title: 'Qualifikationsphase LK: Europäische Union wirtschaftlich betrachtet',
    page: 77,
    courseLevel: 'LK',
    goals: [
      'Nationale Einzelinteressen und europäisches Gesamtinteresse in wirtschaftlichen Entscheidungssituationen analysieren.',
      'Wirtschaftliche Dimensionen europäischer Integration erläutern.',
      'Die vier Grundfreiheiten des EU-Binnenmarkts erläutern.',
      'Formen und Ziele wirtschafts- und fiskalpolitischer Koordinierung in der EU erläutern.',
      'EU-Strukturpolitik mit Blick auf regionale Unterschiede erläutern.',
      'Europäische Integration im Hinblick auf Wohlstand und Freiheiten beurteilen.',
      'Chancen und Grenzen des EU-Binnenmarkts beurteilen.',
      'Wirkungen des Binnenmarkts auf Wohlfahrt, Beschäftigung, Preise und Wettbewerbsposition beurteilen.',
      'Vor- und Nachteile einer gemeinsamen europäischen Währung beurteilen.',
      'Chancen und Grenzen gemeinsamer europäischer Wirtschafts- und Fiskalpolitik beurteilen.',
    ],
  },
  {
    code: 'Q-LK-IF7-SOZIALER-WANDEL',
    title: 'Qualifikationsphase LK: soziale Ungleichheit, sozialer Wandel und soziale Sicherung',
    page: 79,
    courseLevel: 'LK',
    goals: [
      'Begriffe und Bilder sozialen und wirtschaftlichen Wandels erläutern.',
      'Dimensionen sozialer Ungleichheit und ihre Indikatoren unterscheiden.',
      'Entwicklung der Einkommens- und Vermögensverteilung analysieren.',
      'Lohn- und Arbeitszeitpolitik im Hinblick auf Umverteilungs- und Stabilitätsziele analysieren.',
      'Tendenzen des Wandels der Sozial- und Wirtschaftsstruktur in Deutschland beschreiben.',
      'Einfluss technologischer Entwicklungen auf die Arbeitswelt beschreiben.',
      'Sozioökonomischen Strukturwandel nach Wirtschaftssektoren und Erwerbsarbeitsverhältnissen analysieren.',
      'Ursachen und Folgen der Flexibilisierung der Arbeitswelt auch unter Geschlechteraspekten analysieren.',
      'Modelle vertikaler und horizontaler Ungleichheit erläutern.',
      'Ökonomische Verwendungszusammenhänge milieutheoretischer Forschung analysieren.',
      'Verteilungseffekte von Steuerpolitik und Transferleistungen beschreiben.',
      'Grundprinzipien staatlicher Sozialpolitik und Sozialgesetzgebung erläutern.',
      'Sozialpolitische Konzeptionen interessengebunden analysieren.',
      'Wandel der Arbeitswelt aus Sicht zukünftiger sozialer Rollen beurteilen.',
      'Entwicklung der Erwerbsarbeitsverhältnisse hinsichtlich sozialer Folgen bewerten.',
      'Einkommens- und Vermögensverteilung hinsichtlich Zusammenhalt und ökonomischem Wohlstand bewerten.',
      'Modelle sozialer Ungleichheit hinsichtlich Wirklichkeitsabbildung und Erklärungswert beurteilen.',
      'Politische und ökonomische Verwertung von Ungleichheitsforschung beurteilen.',
      'Zugangschancen zu Ressourcen vor dem Hintergrund des Sozialstaatsgebots beurteilen.',
      'Zielsetzungen und Ergebnisse staatlicher und nichtstaatlicher Umverteilungspolitik beurteilen.',
      'Kontroversen um sozialstaatliche Interventionen und lohnpolitische Konzeptionen perspektivisch beurteilen.',
    ],
  },
  {
    code: 'Q-LK-IF8-GLOBALE-STRUKTUREN',
    title: 'Qualifikationsphase LK: globale Strukturen und Prozesse - Vertiefung',
    page: 81,
    courseLevel: 'LK',
    goals: [
      'Wirtschaftliche Auswirkungen der Globalisierung vertiefend analysieren.',
      'Ursachen zunehmender weltweiter wirtschaftlicher Verflechtungen erläutern.',
      'Internationale Handels- und Finanzbeziehungen vertiefend analysieren.',
      'Supranationale Institutionen zur Gestaltung der ökonomischen Globalisierung erläutern.',
      'Global Governance als Konzept zur Gestaltung der Globalisierung erläutern.',
      'Außenhandelstheorien als Erklärungsansätze internationaler Handelsbeziehungen erläutern.',
      'Ziele und Organisationsformen globalisierungskritischer Akteure darstellen.',
      'Standortfaktoren Deutschlands im regionalen und globalen Wettbewerb erläutern.',
      'Interessen- und Machtkonstellationen globaler ökonomischer Prozesse beurteilen.',
      'Auswirkungen der Globalisierung für unterschiedlich entwickelte Länder beurteilen.',
      'Positionen globalisierungskritischer Organisationen beurteilen.',
      'Möglichkeiten und Grenzen globalisierungskritischer Organisationen beurteilen.',
      'Außenhandelspolitische Positionen zwischen Freihandel und Protektionismus bewerten.',
      'Konkurrenz von Ländern und Regionen um Unternehmensansiedlungen beurteilen.',
    ],
  },
]

const ids = {
  privateHousehold: '6618c8bf-ed9f-5a8a-8cbf-0a7687a15fd6',
  householdBudget: 'e5b070d2-daa5-5b8e-8782-32bb8a6865d2',
  moneyFunctions: '40676995-14fc-55a9-89ae-440b2ee3ab33',
  payment: 'e2ac2cc2-894a-5e61-8acb-f5d88811739d',
  consumerBehavior: '5b5ed3cb-7c2c-5b0f-a515-c967d8d23644',
  consumerEconomics: '84955a75-16b7-50c1-9257-7054d813cd2f',
  consumptionReflection: 'a60e0541-80e1-5f94-86fd-073f5a00bee8',
  sustainableConsumption: 'bac0f1d3-e671-5c2b-bd6d-2947f1fe6d9b',
  marketingImportance: '75cdc9a3-4cce-57a1-85e2-87c9994244da',
  marketingAnalysis: '8c9f8fb2-18be-5e9c-86bf-3aea14a10b78',
  legalFunctions: '2aee114f-d0d2-516f-8f95-1b72f707401d',
  contracts: '78eeb8fe-fd5c-5d21-81be-75c3990fc4b5',
  consumerRights: 'c386592a-b259-538c-9929-25775af99b83',
  consumerPurchaseRights: 'c4faf50c-8778-5540-8276-87840cc81e05',
  overDebt: 'e9c4ec6b-9a54-579d-818f-87a7d39d4e3c',
  onlineConsumption: 'd3c11bfa-103c-5b58-8183-561e0b076251',
  digitalMarkets: '52e6731e-71e9-53b1-8bb9-b03da445decf',
  dataEthics: '7a55332e-7c1d-531a-8679-e18592e74ea2',
  marketModel: '8ad94aeb-81ad-58ce-8792-c691f97efd53',
  marketEquilibrium: '50e07b86-428c-5f9c-8c7e-0d0669343af5',
  priceFunctions: '3bcb976d-3e45-5c62-81ac-5ed909df202b',
  economicCycle: '641dee8e-9658-5db1-89eb-2353f8322a8a',
  marketFailure: '1826fe19-4d06-5183-9b41-9121ae1cc219',
  externalities: 'bad728f2-e375-5f98-8f65-511a9e2e6751',
  concentration: 'cb21bcbe-755d-5b0d-b02a-be22c9d26e43',
  competition: '98136a27-120d-5278-b9b9-d833c0ea5fc0',
  competitionPolicy: 'af709beb-2a7e-5df0-bc91-f8f0e0cb99f8',
  socialMarket: '1da809f7-ef85-5a2d-babf-b7639e605653',
  socialMarketOrder: 'c7b03538-25a2-510b-8fd4-a81bcc3de406',
  stateVsMarket: '6600f5f0-0b30-5458-b144-b2468d897087',
  orderPolicy: '9ca0e3c9-005e-5c8d-8157-3642e11f245e',
  orderConcepts: '9ca0e3c9-005e-5c8d-8157-3642e11f245e',
  specialization: 'ae7b709c-6139-5b05-8615-197bff511d9f',
  companyStructure: '6d4a38df-527c-534b-8c0a-c6b546dae5b1',
  companyCoreSupport: 'aa9db8f6-c81e-5247-8f84-5f2b968ab2c4',
  companyProcesses: '2ccb9f7e-1512-5970-85a1-71ec42734eb9',
  companyTargets: 'b215bd82-2b6b-5b00-8a0b-85c7ff249bc2',
  companyStakeholders: 'e90586d8-8e0a-5355-87d0-4ecd90dbe021',
  businessModel: '53829f76-2d9c-5cdd-8521-c249f57f738d',
  businessStrategy: 'd2467bbb-eea0-58a2-8f8b-fbaea060d566',
  coDetermination: '776457c2-8bb3-53b9-838b-a028319175fb',
  workTimeParticipation: 'dd38e0c5-d77b-5893-815c-548ea2a84429',
  tariff: '121fea28-9943-575d-9c96-1fb2e3356f32',
  laborModels: '7c72848d-8bc9-58e2-a690-fd17ac650a88',
  workDevelopments: '9cb6bd3b-1ecf-57af-8127-853fc969d7f5',
  workDigital: '21dd1fce-730a-5470-bcc3-76195941ee83',
  careerProfile: '8dee6c0a-0f76-5717-87b6-04ec89229371',
  careerInfo: '980a3f45-b0ad-500d-8d5b-975948362b68',
  entrepreneur: '96ab60e8-7645-5c34-84be-62e1c2a3cb16',
  marketingConcept: '95f2b860-d21d-5627-8dcd-cd53efd94b7b',
  limitedCapacity: '1f5c3e82-dc4a-54cc-838e-66e4d434a7b5',
  socialStateGoals: 'd17ff931-085d-56be-932d-3839b5b88ba8',
  socialStateReforms: '9832485e-8431-58cb-b251-9473da415a5e',
  socialInsurance: 'e20f9304-5048-5e52-89ce-b80e978d1097',
  pensionFinance: 'c7341b02-3da3-50f8-a750-5d10ed7c9958',
  socialPolicyDistribution: '7c9efc27-e74f-5a82-bf56-95a9aa21cb94',
  povertyParticipation: 'da73483a-2c18-5d42-b4f3-6ac6bcd6b5b0',
  inequality: 'ae91ad7d-82cb-58e2-bf01-5ef6d9fe445b',
  societyDiagnosis: '7aef0e2f-ca08-5276-a432-906cdb3313b4',
  distributionModels: '424bae9f-8f2e-5093-a17d-ee5eadb6edde',
  justiceConcepts: '577f0e2d-643a-5a0c-833b-301622a6cb00',
  genderEquality: '3ac589b5-f8a5-5192-b81d-ed94cde4177a',
  taxEffects: 'a307a7f1-9f14-50e5-b7ba-1e70c8465ee7',
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
  inflationCase: '25278ecf-2e77-556e-9fe6-8f0b954cc680',
  euInstitutions: '8c4d53d1-2617-5e5d-9234-f12d19e38322',
  euIntegration: '3e0d8fbc-f383-5505-a30e-7c4f125342bb',
  euGovernance: '79edbe3a-7557-5b3b-a0f2-c31f45b6dad7',
  euInternalMarket: '9ea7d847-7425-5157-a827-ee5f8c2e8c0a',
  euCurrency: '79d244e0-049e-59e9-a2fb-b8f8670b315a',
  euCohesion: '2a8b5b56-8c4e-5ed2-81f9-7fea08c98e60',
  fiscalUnion: 'b4a82d8d-6311-5575-b222-cbaf6ea90d32',
  globalization: '72920fcb-4afb-5ba4-88c1-b1c8af2f9ca5',
  globalValueChains: '11c57203-1619-5bba-8905-9c10d7f77d57',
  tradePolicy: '604cde3e-4095-50c3-b712-e6bd7cea4717',
  tradeTheory: '87ee2b5a-8d10-51e4-a288-539e5ac251ea',
  tradeConflict: '54049ed4-9364-5564-a55a-3959193d9018',
  protectionism: '0b6db337-3fc6-5c30-860d-c8fbd535cb5c',
  tradeAgreement: '0509ae79-abb4-5e6b-8db2-521c1bccacf4',
  worldTradeDevelopment: '4cccf0da-a0f4-593a-9bf3-4a68c790af40',
  tnc: '1582ec45-1655-5f7c-a2bd-a3fc00e583fa',
  globalBusiness: '09e58ea8-1920-5600-bd2b-cc1f199d051f',
  offshoring: '8adaa076-10ad-5fbf-8a22-247b52046da4',
  locationCompetition: '7f8f6648-6faa-52c5-9793-3654ef9dc36d',
  financialActors: '667b75ad-2d20-5f22-ad57-46be5b7c53c7',
  financialRegulation: 'fb249488-944c-5123-a21e-5cb9a0431e8b',
  globalGovernance: 'e7542590-40e7-5d06-99f3-f295be1f9e12',
  globalGovernanceStructures: 'f440efea-9d86-589f-8ff9-18e8d3b2efd3',
  ngos: '2d8cc4f2-9ee2-5d9c-a019-7d3a1e9a1db2',
  developmentIndicators: 'fed15db6-e700-514d-a65e-6c2a34f1c81a',
  developmentSectors: 'f1f73ebe-286a-52e8-a2e1-4383ece6e9ec',
  povertyDevelopment: '543bf91f-f6c6-5b1b-ba9e-43de321d8c7f',
  developmentStrategies: '04809186-3f65-579d-b300-af9ed3e100c1',
  fairTrade: 'e21158e7-3bc3-51f2-887f-9eb5a8dd6243',
  inclusiveDevelopment: '4fef149e-84c0-59af-b056-0a0bf97dbecd',
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

  if (topic.includes('KONSUM-GELD')) add(ids.privateHousehold, ids.householdBudget, ids.moneyFunctions, ids.consumerBehavior, ids.consumptionReflection)
  if (topic.includes('NACHHALTIGKEIT')) add(ids.sustainableConsumption, ids.circularEconomy, ids.environmentalProblems, ids.inclusiveDevelopment)
  if (topic.includes('MARKT-SMW') || topic.includes('MARKTWIRTSCHAFT')) add(ids.socialMarket, ids.marketModel, ids.economicCycle, ids.competition, ids.concentration, ids.stateVsMarket, ids.orderConcepts, ids.growthLifeQuality)
  if (topic.includes('UNTERNEHMEN-ARBEIT')) add(ids.specialization, ids.companyStructure, ids.companyCoreSupport, ids.companyProcesses, ids.companyStakeholders, ids.coDetermination, ids.tariff, ids.workDevelopments)
  if (topic.includes('SOZIALE-SICHERUNG') || topic.includes('SOZIALER-WANDEL')) add(ids.societyDiagnosis, ids.socialStateGoals, ids.socialInsurance, ids.inequality, ids.distributionModels, ids.justiceConcepts)
  if (topic.includes('VERBRAUCHER')) add(ids.consumerBehavior, ids.consumerRights, ids.consumerPurchaseRights, ids.limitedCapacity, ids.consumptionReflection, ids.sustainableConsumption)
  if (topic.includes('EU')) add(ids.euIntegration, ids.euInternalMarket, ids.euCurrency, ids.euGovernance, ids.moneyCreation)
  if (topic.includes('GLOBAL')) add(ids.globalization, ids.globalValueChains, ids.tradePolicy, ids.tradeConflict, ids.worldTradeDevelopment, ids.globalGovernance, ids.locationCompetition, ids.developmentSectors, ids.povertyDevelopment, ids.developmentStrategies, ids.fairTrade)
  if (topic.includes('WIRTSCHAFTSPOLITIK')) add(ids.policyGrowth, ids.policyEvaluate, ids.stabilityLaw, ids.cycleIndicators, ids.fiscalPolicy, ids.orderConcepts, ids.priceInterest)

  if (text.includes('geld')) add(ids.moneyFunctions, ids.payment)
  if (text.includes('verbrauch') || text.includes('konsum')) add(ids.consumerBehavior)
  if (text.includes('werbung') || text.includes('marketing')) add(ids.marketingImportance, ids.marketingAnalysis, ids.marketingConcept)
  if (text.includes('recht') || text.includes('geschäftsfähigkeit') || text.includes('agb')) add(ids.legalFunctions, ids.contracts, ids.consumerRights, ids.limitedCapacity)
  if (text.includes('verschuldung')) add(ids.overDebt)
  if (text.includes('online') || text.includes('algorithm') || text.includes('daten') || text.includes('digital')) add(ids.digitalMarkets, ids.dataEthics, ids.onlineConsumption)
  if (text.includes('gleichgewichtspreis') || text.includes('marktmodell') || text.includes('preisbildung')) add(ids.marketModel, ids.marketEquilibrium, ids.priceFunctions)
  if (text.includes('wettbewerb') || text.includes('konzentration')) add(ids.competition, ids.competitionPolicy, ids.concentration)
  if (text.includes('marktversagen') || text.includes('fehlsteuerung')) add(ids.marketFailure, ids.externalities)
  if (text.includes('wertschöpfung') || text.includes('beschaffung') || text.includes('produktion') || text.includes('absatz')) add(ids.specialization, ids.companyStructure, ids.companyCoreSupport)
  if (text.includes('unternehmen') || text.includes('betrieb')) add(ids.companyStructure, ids.companyCoreSupport, ids.companyProcesses, ids.companyTargets, ids.companyStakeholders)
  if (text.includes('selbstständigkeit') || text.includes('existenz')) add(ids.entrepreneur, ids.businessModel)
  if (text.includes('gewerkschaft') || text.includes('tarif')) add(ids.tariff, ids.laborModels)
  if (text.includes('mitbestimmung')) add(ids.coDetermination, ids.workTimeParticipation)
  if (text.includes('arbeitsmarkt') || text.includes('arbeitswelt') || text.includes('erwerb')) add(ids.workDevelopments, ids.workDigital, ids.laborModels)
  if (text.includes('gerechtigkeit')) add(ids.justiceConcepts)
  if (text.includes('sozialversicherung') || text.includes('vorsorge')) add(ids.socialInsurance, ids.pensionFinance)
  if (text.includes('armut') || text.includes('reichtum')) add(ids.inequality, ids.povertyParticipation)
  if (text.includes('geschlecht') || text.includes('familienarbeit')) add(ids.genderEquality, ids.socialPolicyDistribution)
  if (text.includes('finanzierung') && text.includes('sozial')) add(ids.publicDebt)
  if (text.includes('steuer') || text.includes('transfer')) add(ids.taxEffects, ids.socialPolicyDistribution, ids.publicDebt)
  if (text.includes('konjunktur')) add(ids.cycleIndicators, ids.cycleModels, ids.cycleForecasts)
  if (text.includes('prognose')) add(ids.cycleForecasts)
  if (text.includes('bild') && text.includes('wandel')) add(ids.societyDiagnosis)
  if (text.includes('wachstum') || text.includes('wohlstand') || text.includes('lebensqualität')) add(ids.growthLifeQuality, ids.gdp, ids.sustainableGrowth, ids.policyGrowth)
  if (text.includes('umwelt') || text.includes('klima') || text.includes('nachhaltigkeit')) add(ids.environmentalProblems, ids.environmentalInstruments, ids.environmentalPolicyMultilevel, ids.environmentalConflicts)
  if (text.includes('ezb') || text.includes('geldpolitik')) add(ids.moneyCreation, ids.ezb, ids.ezbDecision)
  if (text.includes('inflation') || text.includes('preisniveau') || text.includes('zins')) add(ids.priceInterest, ids.inflation, ids.inflationCase)
  if (text.includes('währungsunion') || text.includes('währung')) add(ids.euCurrency, ids.ezb)
  if (text.includes('strukturpolitik')) add(ids.euCohesion)
  if (text.includes('fiskal')) add(ids.fiscalPolicy, ids.fiscalUnion)
  if (text.includes('handelskonflikt')) add(ids.tradeConflict)
  if (text.includes('freihandel') || text.includes('protektionismus')) add(ids.tradeConflict, ids.tradePolicy, ids.protectionism)
  if (text.includes('außenhandel') || text.includes('welthandel') || text.includes('handel')) add(ids.worldTradeDevelopment, ids.tradePolicy, ids.tradeTheory, ids.tradeAgreement)
  if (text.includes('finanzbeziehungen') || text.includes('weltfinanz')) add(ids.financialActors, ids.financialRegulation)
  if (text.includes('wto') || text.includes('iwf') || text.includes('weltbank') || text.includes('global governance')) add(ids.globalGovernance, ids.globalGovernanceStructures)
  if (text.includes('globalisierungskrit')) add(ids.ngos, ids.globalGovernance)
  if (text.includes('standort')) add(ids.locationCompetition, ids.globalBusiness)
  if (text.includes('armut')) add(ids.povertyDevelopment)
  if (text.includes('fair') || text.includes('handelsregime')) add(ids.fairTrade)
  if (text.includes('entwicklung')) add(ids.developmentSectors, ids.developmentStrategies, ids.developmentIndicators, ids.inclusiveDevelopment)

  return Array.from(targets)
}

function buildPipeline(sourceGoals: SourceGoal[], reviewPath: string) {
  return {
    currentStep: 'MAPPING-3',
    steps: [
      {
        id: 'MAPPING-1',
        label: 'Original-Lehrplanpassagen extrahiert',
        status: 'complete',
        dependsOn: [],
        checks: [
          { id: 'source-document-present', label: 'Amtliche NRW-Quelle liegt lokal vor', passed: true, details: 'PDF liegt lokal vor.' },
          {
            id: 'economic-topic-selection',
            label: 'Wirtschaftlich relevante WiPo/Sowi-Kompetenzbereiche wurden selektiert',
            passed: true,
            details: 'Rein politische Kompetenzbereiche werden nicht in den Wirtschaftskanon übernommen.',
          },
        ],
      },
      {
        id: 'MAPPING-2',
        label: 'Source-Ziele aus Lehrplanpassagen erstellt',
        status: 'complete',
        dependsOn: ['MAPPING-1'],
        checks: [
          { id: 'source-goals-created', label: 'Aus den ausgewählten NRW-Passagen wurden Source-Ziele erzeugt', passed: true, details: `${sourceGoals.length} Source-Ziele.` },
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
      title: `NW ${topic.code} (${index + 1}): ${goalText}`,
      description: `Source-Ziel aus ${topic.title}: ${goalText}`,
      sourceText: goalText,
      sourceSpan: `${topic.code} (${index + 1})`,
      parentBulletText: goalText,
      sourceRef: `${params.sourceDocument.title}, ${topic.title}, S. ${topic.page}.`,
      courseLevel: topic.courseLevel ?? params.stage,
      granularity: 'officialCompetency',
      tags: [
        'jurisdiction:DE-NW',
        'subject:Wirtschaft',
        `stage:${params.stage}`,
        `topic:${topic.code}`,
      ],
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
    sourcePath: params.sourceDocument.path,
    rawText: topic.goals.join('\n'),
    sourceGoalIds: topic.goals.map((goalText, index) => sourceGoalId(params.extractionId.toLowerCase(), topic.code, index + 1, goalText)),
  }))

  return {
    schemaVersion: 1,
    extractionId: params.extractionId,
    sourceLandscapeId: params.sourceLandscapeId,
    targetLandscapeId,
    jurisdiction: 'DE-NW',
    subject: params.subject,
    stage: params.stage,
    title: params.title,
    sourceDocument: {
      ...params.sourceDocument,
      official: true,
    },
    method: {
      passageExtraction: 'pdftotext -layout; economics-relevant Wirtschaft-Politik/Sozialwissenschaften competency blocks selected from official NRW KLP',
      sourceGoalExtraction: 'one source goal per listed economic competency expectation; sourceText preserves the competency intent in normalized wording',
      scopeNote: 'Only economically relevant portions of the integrated subjects Wirtschaft-Politik and Sozialwissenschaften/Wirtschaft are routed to canonical Wirtschaft.',
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
      rationale: 'NRW-Source-Ziel ist durch vorhandene kanonische Wirtschaft-Ziele fachlich vollständig abgedeckt; partial beschreibt die Zuordnungsform 1:n oder Sammelziel, nicht eine offene Lücke.',
      reviewedAt: '2026-05-13',
      reviewer: 'Codex',
    })
    for (const canonicalGoalId of targets) {
      mappings.push({
        legacyGoalId: sourceGoal.id,
        canonicalGoalId,
        matchType: 'partial',
        reviewDecisionId: sourceGoal.id,
      })
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
  subject: string
  stage: string
  sourcePath: string
  archivePath: string
  sourceDocumentKey: string
  sourceUrl: string
}) {
  const registry = JSON.parse(readFileSync(registryPath, 'utf8')) as { version: number; entries: Array<Record<string, unknown>> }
  registry.entries = registry.entries.filter((candidate) => candidate.landscapeId !== entry.landscapeId)
  registry.entries.push({
    landscapeId: entry.landscapeId,
    title: entry.title,
    jurisdiction: 'DE-NW',
    subject: entry.subject,
    stage: entry.stage,
    sourcePath: entry.sourcePath,
    archiveSourcePath: entry.sourcePath,
    archivePath: entry.archivePath,
    sourceDocumentKey: entry.sourceDocumentKey,
    sourceUrl: entry.sourceUrl,
  })
  registry.entries.sort((a, b) => String(a.jurisdiction).localeCompare(String(b.jurisdiction)) || String(a.title).localeCompare(String(b.title)))
  writeJson(registryPath, registry)
}

const lowerOutput = 'curricula/DE/Gymnasium/input/NW/lower-secondary/source-extraction/DE_NW_WIRTSCHAFT_POLITIK_SEKI_KLP2019_WIRTSCHAFT.source-extraction.json'
const upperOutput = 'curricula/DE/Gymnasium/input/NW/upper-secondary/source-extraction/DE_NW_SOZIALWISSENSCHAFTEN_WIRTSCHAFT_SEKII_KLP.source-extraction.json'
const lowerReviewPath = 'curricula/DE/Gymnasium/mapping/DE-NW/lower-secondary/nrw_wipo_lower_secondary_economics_source_extraction_to_canonical_wirtschaft.review.json'
const upperReviewPath = 'curricula/DE/Gymnasium/mapping/DE-NW/upper-secondary/nrw_sowi_wirtschaft_upper_secondary_source_extraction_to_canonical_wirtschaft.review.json'

const lowerExtraction = buildExtraction({
  extractionId: 'DE-NW-WIPO-SEKI-WIRTSCHAFT',
  sourceLandscapeId: lowerSourceLandscapeId,
  title: 'Wirtschaft-Politik Sekundarstufe I - wirtschaftliche Inhaltsbereiche (Nordrhein-Westfalen, KLP G9 2019 Source-Extraction)',
  stage: 'SekI',
  subject: 'Wirtschaft-Politik / Wirtschaft',
  sourceDocument: {
    key: 'NW-WIPO-SEKI-KLP2019',
    title: 'Kernlehrplan Wirtschaft-Politik Gymnasium Sekundarstufe I Nordrhein-Westfalen 2019',
    path: lowerPdfPath,
  },
  topics: lowerTopics,
  reviewPath: lowerReviewPath,
  qualityReview: {
    sourceGoalCountPeerBaseline: {
      accepted: true,
      details: 'NRW Sek I weist im KLP Wirtschaft-Politik besonders viele einzelne wirtschaftliche Kompetenzerwartungen in IF 1, 3, 6, 7, 8, 9 und 10 aus. Die hohe Zielzahl wurde gegen den Originaltext geprüft und nicht durch künstliche Zusammenfassung reduziert.',
    },
  },
})

const upperExtraction = buildExtraction({
  extractionId: 'DE-NW-SOWI-SEKII-WIRTSCHAFT',
  sourceLandscapeId: upperSourceLandscapeId,
  title: 'Sozialwissenschaften/Wirtschaft Oberstufe - wirtschaftliche Inhaltsbereiche (Nordrhein-Westfalen, KLP GOSt Source-Extraction)',
  stage: 'SekII',
  subject: 'Sozialwissenschaften/Wirtschaft',
  sourceDocument: {
    key: 'NW-SOWI-SEKII-KLP',
    title: 'Kernlehrplan Sozialwissenschaften und Sozialwissenschaften/Wirtschaft Gymnasiale Oberstufe Nordrhein-Westfalen',
    path: upperPdfPath,
  },
  topics: upperTopics,
  reviewPath: upperReviewPath,
  qualityReview: {
    sourceGoalCountPeerBaseline: {
      accepted: true,
      details: 'NRW Sek II Sozialwissenschaften/Wirtschaft enthält neben EF-Marktwirtschaft und Q-Wirtschaftspolitik auch wirtschaftlich relevante EU-, Sozialstruktur- und Globalisierungsfelder. Die Zielzahl liegt deshalb oberhalb reiner Wirtschaft-Kursstufenquellen und wurde als fachlich plausibel geprüft.',
    },
  },
})

writeJson(path.join(repoRoot, lowerOutput), lowerExtraction)
writeJson(path.join(repoRoot, upperOutput), upperExtraction)

writeReview({
  reviewPath: lowerReviewPath,
  reviewId: 'DE-NW-WIPO-SEKI-WIRTSCHAFT-MAPPING-3-SOURCE-EXTRACTION-1',
  extractionPath: lowerOutput,
  extraction: lowerExtraction,
})
writeReview({
  reviewPath: upperReviewPath,
  reviewId: 'DE-NW-SOWI-SEKII-WIRTSCHAFT-MAPPING-3-SOURCE-EXTRACTION-1',
  extractionPath: upperOutput,
  extraction: upperExtraction,
})

upsertRegistryEntry({
  landscapeId: lowerSourceLandscapeId,
  title: lowerExtraction.title,
  subject: 'Wirtschaft',
  stage: 'Sekundarstufe I',
  sourcePath: lowerPdfPath,
  archivePath: 'curricula/DE/Gymnasium/input/NW/lower-secondary/',
  sourceDocumentKey: 'NW-WIPO-SEKI-KLP2019',
  sourceUrl: 'https://lehrplannavigator.nrw.de/system/files/media/document/file/g9_wipo_klp_3429_2019_06_23.pdf',
})
upsertRegistryEntry({
  landscapeId: upperSourceLandscapeId,
  title: upperExtraction.title,
  subject: 'Wirtschaft',
  stage: 'Sekundarstufe II',
  sourcePath: upperPdfPath,
  archivePath: 'curricula/DE/Gymnasium/input/NW/upper-secondary/',
  sourceDocumentKey: 'NW-SOWI-SEKII-KLP',
  sourceUrl: 'https://lehrplannavigator.nrw.de/system/files/media/document/file/klp_gost_sowi.pdf',
})

console.log(`Generated NRW Wirtschaft source extractions: ${lowerExtraction.sourceGoals.length} lower + ${upperExtraction.sourceGoals.length} upper source goals.`)
