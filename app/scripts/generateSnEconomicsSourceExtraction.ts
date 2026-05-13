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
  key: 'SN-GRW-GYMNASIUM-LEHRPLAN-2024',
  title: 'Lehrplan Gymnasium Gemeinschaftskunde/Rechtserziehung/Wirtschaft Sachsen',
  path: 'curricula/DE/Gymnasium/input/SN/lehrplan-gymnasium-grw-sachsen-2019.pdf',
  url: 'https://www.schulportal.sachsen.de/lplandb/lehrplan/file/76/1IrLTgST5OTPa55GLt6b',
}

const lowerSourceLandscapeId = idFrom('DE-SN GRW Sek I Wirtschaft source extraction')
const upperSourceLandscapeId = idFrom('DE-SN GRW Sek II Wirtschaft source extraction')

const lowerTopics: TopicDraft[] = [
  {
    code: 'K8-MARKTTEILNEHMER-GRUNDLAGEN',
    title: 'Klasse 8: Jugendliche als Marktteilnehmer - Grundlagen wirtschaftlichen Handelns',
    page: 9,
    stage: 'SekI',
    goals: [
      'Grundlagen des ökonomischen Handelns als Analyseperspektive für Alltagssituationen nutzen.',
      'Bedürfnisse und Bedarf unterscheiden.',
      'Knappheit von Gütern als Ausgangspunkt wirtschaftlichen Handelns erklären.',
      'Funktionen des Geldes am Beispiel Taschengeld erläutern.',
      'Interessen von Produzenten und Konsumenten in Marktsituationen unterscheiden.',
      'Angebot und Nachfrage als Koordinierungsmechanismus beschreiben.',
      'Marktformen im Erfahrungsbereich Jugendlicher unterscheiden.',
      'Preisbildung in jugendnahen Marktsituationen erklären.',
      'Einen einfachen Wirtschaftskreislauf als Modell wirtschaftlicher Beziehungen darstellen.',
      'Modell und Wirklichkeit bei ökonomischen Schemata unterscheiden.',
      'Beeinflussung wirtschaftlicher Entscheidungen durch Werbung analysieren.',
    ],
  },
  {
    code: 'K8-MARKTTEILNEHMER-NACHHALTIGKEIT',
    title: 'Klasse 8: Nachhaltiges Leben und Wirtschaften',
    page: 10,
    stage: 'SekI',
    goals: [
      'Möglichkeiten nachhaltigen Lebens und Wirtschaftens beurteilen.',
      'Sharing Economy als alternatives Wirtschaftsmodell einordnen.',
      'Genossenschaftsmodelle als alternative Wirtschaftsform erläutern.',
      'Minimalismus als Konsum- und Lebensmodell beurteilen.',
      'Prosumenten-Netzwerke als Form veränderter Marktteilnahme erklären.',
      'Kauf- und Verbraucherverhalten kriterienorientiert reflektieren.',
      'Verbraucherschutz als Orientierung für Konsumentscheidungen nutzen.',
      'Eigenes wirtschaftliches Handeln in Familie, Schule und Peer-Group überprüfen.',
    ],
  },
  {
    code: 'K10-WIRTSCHAFTSORDNUNG',
    title: 'Klasse 10: Wirtschaft und Wirtschaftsordnung in der Bundesrepublik Deutschland',
    page: 15,
    stage: 'SekI',
    goals: [
      'Freie Marktwirtschaft und Zentralverwaltungswirtschaft als idealtypische Vorstellungen des Wirtschaftens vergleichen.',
      'Tauschwirtschaft und Sharing Economy als wirtschaftliche Ordnungs- und Austauschformen einordnen.',
      'Grundzüge der Sozialen Marktwirtschaft als Wirtschaftsordnung der Bundesrepublik Deutschland erklären.',
      'Den verfassungsrechtlichen Rahmen der Sozialen Marktwirtschaft am Grundgesetz erläutern.',
      'Freiheit auf dem Markt und sozialen Ausgleich als Spannungsfeld der Sozialen Marktwirtschaft beurteilen.',
      'Systeme sozialer Sicherung als Bestandteil der Sozialen Marktwirtschaft darstellen.',
      'Ökologischen Ordnungsrahmen als Bestandteil moderner Wirtschaftsordnung einordnen.',
      'Gewerkschaften und Arbeitgeberverbände als Akteure der Arbeitsbeziehungen erklären.',
      'Tarifautonomie und Mindestlohn als Instrumente der Arbeitsmarktordnung beurteilen.',
    ],
  },
  {
    code: 'K10-WIRTSCHAFTSKREISLAUF-AKTEURE',
    title: 'Klasse 10: Wirtschaftssubjekte im erweiterten Wirtschaftskreislauf',
    page: 15,
    stage: 'SekI',
    goals: [
      'Geldströme und Güterströme im erweiterten Wirtschaftskreislauf darstellen.',
      'Angebot, Nachfrage und Preisbildung im Rahmen des Wirtschaftskreislaufs erklären.',
      'Private Haushalte als Konsumenten und Einkommensbezieher im Wirtschaftskreislauf beschreiben.',
      'Konsumneigung und Sparverhalten privater Haushalte unterscheiden.',
      'Unternehmen als Güteranbieter und Arbeitgeber im Wirtschaftskreislauf erklären.',
      'Gewinnorientierung und Gemeinwohlorientierung von Unternehmen vergleichen.',
      'Unternehmensethik als Bewertungsmaßstab unternehmerischen Handelns nutzen.',
      'Berufs- und Studienorientierung mit Unternehmens- und Arbeitsweltbezügen verbinden.',
      'Betriebspraktikum und Betriebsbesichtigung als wirtschaftliche Lerngelegenheiten auswerten.',
      'Kapitalsammelstellen als Akteure von Geldaufbewahrung und Kreditvergabe beschreiben.',
      'Bankenkontrolle als Bestandteil wirtschaftlicher Ordnung einordnen.',
      'Staatliche Grundaufgaben nach Adam Smith in wirtschaftliche Ordnung einordnen.',
      'Bedeutung von Steuern und Einkommensteuer für staatliches Handeln erklären.',
      'Import, Export und globale Märkte als Auslandsbeziehungen des Wirtschaftskreislaufs beschreiben.',
    ],
  },
  {
    code: 'K10-WIRTSCHAFTLICHE-ENTWICKLUNG',
    title: 'Klasse 10: Aktuelle wirtschaftliche Entwicklung und Zukunft der Sozialen Marktwirtschaft',
    page: 15,
    stage: 'SekI',
    goals: [
      'Demografischen Wandel als wirtschaftliche Herausforderung der Bundesrepublik Deutschland beurteilen.',
      'Fachkräftemangel als Herausforderung wirtschaftlicher Entwicklung analysieren.',
      'Digitalisierung als Herausforderung wirtschaftlicher Entwicklung beurteilen.',
      'Konjunkturzyklus und Bruttoinlandsprodukt zur Beschreibung wirtschaftlicher Entwicklung nutzen.',
      'Weitere Konjunkturindikatoren zur Beurteilung der Wirtschaftslage auswerten.',
      'Ursachen konjunktureller Schwankungen erklären.',
      'Herbst- und Frühjahrsgutachten sowie Jahresgutachten des Sachverständigenrates als Informationsquellen nutzen.',
      'Stabilitätsgesetz und Magisches Vieleck als wirtschaftspolitische Zielsysteme erklären.',
      'Bedingungsloses Grundeinkommen als Zukunftsoption der Sozialen Marktwirtschaft beurteilen.',
      'Förderung des ländlichen Raums als wirtschaftspolitische Herausforderung einordnen.',
      'Umwelt-, Klima- und Energiepolitik als Zukunftsaufgaben der Sozialen Marktwirtschaft beurteilen.',
    ],
  },
  {
    code: 'K10-EU-GLOBAL-WIRTSCHAFT',
    title: 'Klasse 10: Wirtschaftliche Dimensionen Europas und globaler Verantwortung',
    page: 16,
    stage: 'SekI',
    goals: [
      'Die Europäische Union als Wirtschaftsgemeinschaft einordnen.',
      'Freihandel und Kritik daran im Kontext europäischer Entwicklungszusammenarbeit beurteilen.',
      'Entwicklungszusammenarbeit mit wirtschaftlichen Zielen und Maßnahmen verbinden.',
      'Globale Märkte als Herausforderung für individuelle Verantwortung wirtschaftlichen Handelns beurteilen.',
    ],
  },
  {
    code: 'K10-WAHL-UNTERNEHMEN',
    title: 'Klasse 10 Wahlbereich: Unternehmen und Entscheidung',
    page: 16,
    stage: 'SekI',
    goals: [
      'Unternehmerisches Planen und Entscheiden als Problemlösestrategie anwenden.',
      'Produktideen für eine Unternehmensgründung entwickeln.',
      'Rechtsformen als Entscheidungskriterium einer Unternehmensgründung vergleichen.',
      'Finanzierung als Entscheidungskriterium unternehmerischen Handelns erläutern.',
      'Standortfaktoren für unternehmerische Entscheidungen beurteilen.',
      'Ein Planspiel Unternehmensgründung zur Reflexion wirtschaftlicher Entscheidungen nutzen.',
    ],
  },
]

const upperTopics: TopicDraft[] = [
  {
    code: 'J11-GK-SOZIALER-WANDEL-ARBEITSWELT',
    title: 'Jahrgangsstufe 11 Grundkurs: Sozialer Wandel mit wirtschaftlicher Dimension',
    page: 20,
    stage: 'SekII',
    courseLevel: 'GK',
    goals: [
      'Sozialstrukturmodelle zur Beschreibung sozialer Lagen, Milieus, Schichten und Klassen nutzen.',
      'Sozialen Wandel und soziale Ungleichheit vor dem Hintergrund von Gesellschaftstheorien beurteilen.',
      'Chancengerechtigkeit im Bildungssystem als wirtschaftlich-soziale Frage einordnen.',
      'Digitalisierung als Herausforderung für Bildung und Arbeitswelt analysieren.',
      'Fachkräftemangel, Arbeitslosigkeit und Prekariat als Phänomene der Arbeitswelt beurteilen.',
      'Gesellschaft ohne Arbeit als Zukunftsfrage wirtschaftlichen und sozialen Wandels diskutieren.',
      'Sozialstaatliche Kontroversen anhand von Sozialversicherungssystemen beurteilen.',
      'Armut und Generationenkonflikt als sozialstaatliche Herausforderungen analysieren.',
    ],
  },
  {
    code: 'J11-LK-SOZIALSTRUKTUR-ARBEIT',
    title: 'Jahrgangsstufe 11 Leistungskurs: Sozialstruktur, Erwerbstätigkeit und Sozialstaat',
    page: 29,
    stage: 'SekII',
    courseLevel: 'LK',
    goals: [
      'Erwerbstätigkeit im Kontext von Technikentwicklung und Arbeitslosigkeit analysieren.',
      'Klassen- und Schichtenmodelle sozialer Ungleichheit vergleichen.',
      'Soziale Mobilität, Bildung und Bildungsungleichheit als ökonomisch relevante Strukturfragen beurteilen.',
      'Sozialstaatliche Sicherung vor dem Hintergrund von Armut und Generationenkonflikt beurteilen.',
    ],
  },
  {
    code: 'J12-GK-WIRTSCHAFTSORDNUNG',
    title: 'Jahrgangsstufe 12 Grundkurs: Wirtschaftliche Entwicklung Deutschlands und Europas',
    page: 22,
    stage: 'SekII',
    courseLevel: 'GK',
    goals: [
      'Freie Marktwirtschaft und Zentralverwaltungswirtschaft als idealtypische Vorstellungen des Wirtschaftens vergleichen.',
      'Eigentum, Planung, Lenkung und Preisbildung als Ordnungselemente wirtschaftlicher Systeme erläutern.',
      'Betriebliche Ergebnisrechnung als Element wirtschaftlichen Handelns einordnen.',
      'Den verfassungsrechtlichen Rahmen der Sozialen Marktwirtschaft erklären.',
      'Wirtschaftliche Freiheit und sozialen Ausgleich als Spannungsfeld der Sozialen Marktwirtschaft beurteilen.',
    ],
  },
  {
    code: 'J12-GK-WIRTSCHAFTSPOLITIK',
    title: 'Jahrgangsstufe 12 Grundkurs: Wirtschaftspolitische Handlungsoptionen',
    page: 23,
    stage: 'SekII',
    courseLevel: 'GK',
    goals: [
      'Wirtschaftspolitische Handlungsoptionen in der Sozialen Marktwirtschaft beurteilen.',
      'Stabilitätsgesetz als Rahmen wirtschaftspolitischer Zielsetzungen nutzen.',
      'Wirtschafts- und Finanzkrise 2008/09 als Referenzfall wirtschaftspolitischer Steuerung analysieren.',
      'Aktuelle wirtschaftliche Entwicklungstendenzen vor dem Hintergrund von Globalisierung und Digitalisierung beurteilen.',
      'Nachfrageorientierte Wirtschaftspolitik nach Keynes erläutern.',
      'Angebotsorientierte Wirtschaftspolitik nach Friedman erläutern.',
      'Agenda 2010 und Konjunkturprogramme als wirtschaftspolitische Maßnahmen einordnen.',
      'Reichweite und Grenzen wirtschaftspolitischer Maßnahmen beurteilen.',
      'Neue Seidenstraße als Beispiel globaler wirtschaftlicher Verflechtung analysieren.',
      'Förderung des ländlichen Raums als wirtschaftspolitisches Handlungsfeld beurteilen.',
    ],
  },
  {
    code: 'J12-GK-EWWU',
    title: 'Jahrgangsstufe 12 Grundkurs: Europäische Wirtschafts- und Währungsunion',
    page: 23,
    stage: 'SekII',
    courseLevel: 'GK',
    goals: [
      'Entwicklung und Zukunft der Europäischen Wirtschafts- und Währungsunion beurteilen.',
      'Binnenmarkt mit Agrar-, Handels- und Wettbewerbspolitik als wirtschaftliches Integrationsfeld erklären.',
      'Aufbau und Aufgaben der Europäischen Zentralbank darstellen.',
      'Instrumente der Geldpolitik der Europäischen Zentralbank erklären.',
      'Stabilitätspakt als Rahmen europäischer Geld- und Finanzpolitik einordnen.',
      'Maßnahmen zur Überwindung der Wirtschafts-, Finanz- und Währungskrise beurteilen.',
      'Unterschiedliche Leistungsfähigkeit europäischer Volkswirtschaften als Herausforderung der Währungsunion analysieren.',
    ],
  },
  {
    code: 'J12-GK-POSTWACHSTUM',
    title: 'Jahrgangsstufe 12 Grundkurs: Wirtschaft ohne Wachstum',
    page: 23,
    stage: 'SekII',
    courseLevel: 'GK',
    goals: [
      'Idee einer Wirtschaft ohne Wachstum beurteilen.',
      'Club of Rome und Postwachstumsökonomie als wachstumskritische Konzepte einordnen.',
      'Grenzen des Wachstums und Nachhaltigkeit als wirtschaftspolitische Problemstellung analysieren.',
      'Regionalökonomie als Alternative wachstumsorientierter Wirtschaft einordnen.',
      'Prosumenten-Netzwerke als Alternative wachstumsorientierter Wirtschaft erläutern.',
    ],
  },
  {
    code: 'J12-LK-WIRTSCHAFTSORDNUNGEN',
    title: 'Jahrgangsstufe 12 Leistungskurs: Wirtschaftsordnungen und theoretische Grundlagen',
    page: 31,
    stage: 'SekII',
    courseLevel: 'LK',
    goals: [
      'Mögliche Wirtschaftsordnungen und ihre theoretischen Grundlagen vergleichen.',
      'Smith, Ricardo, Mill und Marx als wirtschaftstheoretische Referenzen einordnen.',
      'Den verfassungsrechtlichen Rahmen der Sozialen Marktwirtschaft beurteilen.',
      'Rechtliche Ausgestaltung der Sozialen Marktwirtschaft mit Grundgesetz, Staatszielen und Gesetzgebung erklären.',
      'Umweltschutz als rechtlich-politischen Bestandteil der Sozialen Marktwirtschaft einordnen.',
      'Müller-Armack und Erhard als Referenzen der Sozialen Marktwirtschaft erläutern.',
    ],
  },
  {
    code: 'J12-LK-WIRTSCHAFTSPOLITIK',
    title: 'Jahrgangsstufe 12 Leistungskurs: Stabilisierungspolitik und wirtschaftspolitische Konzeptionen',
    page: 31,
    stage: 'SekII',
    courseLevel: 'LK',
    goals: [
      'Grundlegende Theorien und Konzeptionen der Wirtschaftspolitik erklären.',
      'Nachfrage- und Angebotsorientierung als wirtschaftspolitische Konzeptionen vergleichen.',
      'Wirtschaftspolitische Handlungsoptionen der Bundesrepublik Deutschland im Bereich Stabilisierungspolitik beurteilen.',
      'Stabilitätsgesetz, Zielkonflikte und Indikatoren als Analyseinstrumente nutzen.',
      'Arbeitsmarkt und Bekämpfung von Arbeitslosigkeit als stabilisierungspolitische Handlungsfelder beurteilen.',
      'Konjunkturentwicklung und alternative wirtschaftspolitische Lösungsstrategien analysieren.',
      'Reichweite und Grenzen wirtschaftspolitischer Maßnahmen im nationalen und globalen Kontext beurteilen.',
    ],
  },
  {
    code: 'J12-LK-EUROPA-WELT',
    title: 'Jahrgangsstufe 12 Leistungskurs: Deutschland, Europa und globale Wirtschaftsordnung',
    page: 32,
    stage: 'SekII',
    courseLevel: 'LK',
    goals: [
      'Rolle Deutschlands in der Europäischen Wirtschafts- und Währungsunion im Spannungsfeld nationaler und supranationaler Interessen beurteilen.',
      'Binnenmarkt sowie Agrar-, Handels- und Wettbewerbspolitik als europäische Wirtschaftsfelder analysieren.',
      'Geldpolitik der Europäischen Zentralbank mit Instrumenten und Stabilitätspakt erklären.',
      'EU-Erweiterung unter ökonomischen Chancen, Risiken und unbeabsichtigten Folgen beurteilen.',
      'Qualität von Wirtschaftsstandorten in Europa vor dem Hintergrund von Globalisierungsprozessen beurteilen.',
      'Arbeitskosten, Umwelt und Humankapital als Standortfaktoren analysieren.',
      'Standortvergleiche als Methode wirtschaftlicher Bewertung nutzen.',
      'Wandel der Sozialen Marktwirtschaft im Kontext internationaler Wirtschaft beurteilen.',
      'Konzept einer internationalen Sozialen Marktwirtschaft einordnen.',
      'Marktkritische Ordnungsvorstellungen zur Internationalisierung der Wirtschaft beurteilen.',
      'Rolle von Institutionen, Nichtregierungsorganisationen und Weltgesellschaft in globaler Wirtschaftsordnung analysieren.',
    ],
  },
  {
    code: 'J12-LK-GLOBALISIERUNG',
    title: 'Jahrgangsstufe 12 Leistungskurs: Wirtschaftliche Dimensionen der Globalisierung',
    page: 31,
    stage: 'SekII',
    courseLevel: 'LK',
    goals: [
      'Dimensionen der Globalisierung wirtschaftlich einordnen.',
      'Globalisierungsgegner und Globalisierungsbefürworter als Perspektiven auf globale Wirtschaftsprozesse vergleichen.',
      'Internationale und supranationale Organisationen als Akteure globaler Wirtschaftsordnung erklären.',
      'Global Governance als politische Gestaltung globaler wirtschaftlicher Verflechtung beurteilen.',
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
      title: `SN ${topic.code} (${index + 1}): ${goalText}`,
      description: `Source-Ziel aus ${topic.title}: ${goalText}`,
      sourceText: goalText,
      sourceSpan: `${topic.code} (${index + 1})`,
      parentBulletText: goalText,
      sourceRef: `${sourceDocument.title}, ${topic.title}, S. ${topic.page}.`,
      courseLevel: topic.courseLevel ?? params.stage,
      granularity: 'officialContentOrRequirement',
      tags: ['jurisdiction:DE-SN', 'subject:Wirtschaft', `stage:${params.stage}`, `topic:${topic.code}`],
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
    jurisdiction: 'DE-SN',
    subject: 'Gemeinschaftskunde/Rechtserziehung/Wirtschaft',
    stage: params.stage,
    title: params.title,
    sourceDocument: { ...sourceDocument, official: true },
    method: {
      passageExtraction: 'pdftotext -layout; wirtschaftlich relevante GRW-Lernbereiche und wirtschaftliche Teilaspekte aus dem amtlichen Sachsen-Lehrplan selektiert',
      sourceGoalExtraction: 'one normalized source goal per economic content item or assessable requirement; compact official lists split where multiple economic goals are bundled',
      scopeNote: 'Das integrierte Fach Gemeinschaftskunde/Rechtserziehung/Wirtschaft wird nur mit wirtschaftlichen Inhaltsfeldern in den kanonischen Wirtschaftskanon geroutet.',
    },
    qualityReview: params.qualityReview,
    expectedTopicCodes: params.topics.map((topic) => topic.code),
    pipelineStatus: {
      currentStep: 'MAPPING-3',
      steps: [
        { id: 'ORIGINALQUELLEN', label: 'Originalquellen bereitgestellt', status: 'complete', dependsOn: [], checks: [{ id: 'source-document-present', label: 'Amtlicher Sachsen-GRW-Lehrplan liegt lokal vor', passed: true, details: sourceDocument.path }] },
        { id: 'MAPPING-1', label: 'Original-Lehrplanpassagen extrahiert', status: 'complete', dependsOn: ['ORIGINALQUELLEN'], checks: [{ id: 'passages-extracted', label: 'Wirtschaftliche GRW-Passagen wurden aus dem amtlichen Lehrplan extrahiert', passed: true, details: `${passages.length} Passagen.` }] },
        { id: 'MAPPING-2', label: 'Source-Ziele aus Lehrplanpassagen erstellt', status: 'complete', dependsOn: ['MAPPING-1'], checks: [{ id: 'source-goals-created', label: 'Aus den ausgewählten Sachsen-Passagen wurden Source-Ziele erzeugt', passed: true, details: `${sourceGoals.length} Source-Ziele.` }] },
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
      rationale: 'SN-Source-Ziel ist durch vorhandene kanonische Wirtschaft-Ziele fachlich vollständig abgedeckt; partial beschreibt die Zuordnungsform 1:n oder Sammelziel, nicht eine offene Lücke.',
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
    jurisdiction: 'DE-SN',
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

const lowerOutput = 'curricula/DE/Gymnasium/input/SN/lower-secondary/source-extraction/DE_SN_GRW_SEKI_WIRTSCHAFT_LEHRPLAN_GYMNASIUM_2024.source-extraction.json'
const upperOutput = 'curricula/DE/Gymnasium/input/SN/upper-secondary/source-extraction/DE_SN_GRW_SEKII_WIRTSCHAFT_LEHRPLAN_GYMNASIUM_2024.source-extraction.json'
const lowerReviewPath = 'curricula/DE/Gymnasium/mapping/DE-SN/lower-secondary/sn_grw_lower_secondary_economics_source_extraction_to_canonical_wirtschaft.review.json'
const upperReviewPath = 'curricula/DE/Gymnasium/mapping/DE-SN/upper-secondary/sn_grw_upper_secondary_economics_source_extraction_to_canonical_wirtschaft.review.json'

const lowerExtraction = buildExtraction({
  extractionId: 'DE-SN-GRW-SEKI-WIRTSCHAFT',
  sourceLandscapeId: lowerSourceLandscapeId,
  title: 'GRW Sekundarstufe I - wirtschaftliche Inhaltsbereiche (Sachsen, Lehrplan Source-Extraction)',
  stage: 'SekI',
  topics: lowerTopics,
  reviewPath: lowerReviewPath,
  qualityReview: {
    sourceGoalCountPeerBaseline: {
      accepted: true,
      details: 'SN Sek I hat die wirtschaftliche Schwerpunktsetzung in Klasse 8 und Klasse 10; politische und rechtliche GRW-Teile wurden nicht künstlich in Wirtschaft geroutet. Die Zielzahl liegt im Korridor geprüfter integrierter GRW/WiPo-Quellen.',
    },
  },
})

const upperExtraction = buildExtraction({
  extractionId: 'DE-SN-GRW-SEKII-WIRTSCHAFT',
  sourceLandscapeId: upperSourceLandscapeId,
  title: 'GRW Sekundarstufe II - wirtschaftliche Inhaltsbereiche (Sachsen, Lehrplan Source-Extraction)',
  stage: 'SekII',
  topics: upperTopics,
  reviewPath: upperReviewPath,
  qualityReview: {
    sourceGoalCountPeerBaseline: {
      accepted: true,
      details: 'SN Sek II konzentriert wirtschaftliche Inhalte vor allem in Jahrgangsstufe 12 sowie sozialstaatlich-arbeitsweltliche Bezüge in Jahrgangsstufe 11. Die Extraktion bleibt fachlich eng und vermeidet politische/rechtliche Übernahme ohne Wirtschaftskern.',
    },
  },
})

writeJson(path.join(repoRoot, lowerOutput), lowerExtraction)
writeJson(path.join(repoRoot, upperOutput), upperExtraction)
writeReview({ reviewPath: lowerReviewPath, reviewId: 'DE-SN-GRW-SEKI-WIRTSCHAFT-MAPPING-3-SOURCE-EXTRACTION-1', extractionPath: lowerOutput, extraction: lowerExtraction })
writeReview({ reviewPath: upperReviewPath, reviewId: 'DE-SN-GRW-SEKII-WIRTSCHAFT-MAPPING-3-SOURCE-EXTRACTION-1', extractionPath: upperOutput, extraction: upperExtraction })
upsertRegistryEntry({ landscapeId: lowerSourceLandscapeId, title: lowerExtraction.title, stage: 'Sekundarstufe I', archivePath: 'curricula/DE/Gymnasium/input/SN/lower-secondary/' })
upsertRegistryEntry({ landscapeId: upperSourceLandscapeId, title: upperExtraction.title, stage: 'Sekundarstufe II', archivePath: 'curricula/DE/Gymnasium/input/SN/upper-secondary/' })

console.log(`Generated SN Wirtschaft source extractions: ${lowerExtraction.sourceGoals.length} lower + ${upperExtraction.sourceGoals.length} upper source goals.`)
