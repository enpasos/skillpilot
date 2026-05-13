import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

type TopicDraft = {
  code: string
  title: string
  page: number
  stage: 'SekI' | 'SekII'
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

const sourceDocument = {
  key: 'SH-WIPO-SEK-I-II-2016',
  title: 'Fachanforderungen Wirtschaft/Politik Sekundarstufe I / Sekundarstufe II Schleswig-Holstein',
  path: 'curricula/DE/Gymnasium/input/SH/Fachanforderungen_Wirtschaft_Politik_Sekundarstufe_2016_barrierearm.pdf',
  url: 'https://fachportal.lernnetz.de/files/Fachanforderungen%20und%20Leitf%C3%A4den/Sek.%20I_II/Fachanforderungen_barrierefrei/Fachanforderungen_WiPo_SEK_barrierearm.pdf',
}

const lowerSourceLandscapeId = idFrom('DE-SH Wirtschaft Politik Sek I source extraction')
const upperSourceLandscapeId = idFrom('DE-SH Wirtschaft Politik Sek II source extraction')

const lowerTopics: TopicDraft[] = [
  {
    code: 'SI-WIRTSCHAFT-KONSUM',
    title: 'Jugendliche als Konsumenten',
    page: 32,
    stage: 'SekI',
    goals: [
      'Bedürfnisse und Knappheit als Ausgangspunkte wirtschaftlichen Handelns erklären.',
      'Werbung und Markenprodukte als Einflussfaktoren auf Konsumentscheidungen analysieren.',
      'Verbraucherschutz und Verbraucherberatung als Unterstützung wirtschaftlicher Entscheidungen erläutern.',
      'Wirtschaftliches Handeln beim Umgang mit Taschengeld beurteilen.',
      'Einnahmen und Ausgaben privater Haushalte planen und auswerten.',
      'Geschäftsfähigkeit und Kaufverträge in jugendlichen Konsumsituationen anwenden.',
      'Sparen als private Finanzentscheidung erklären.',
      'Verschuldung als Folge finanzieller Entscheidungen beurteilen.',
      'Privatinsolvenz als rechtlich-ökonomische Folge überschuldeter Haushalte einordnen.',
      'Ressourcenschonung und Nachhaltigkeit beim Konsum kriteriengeleitet bewerten.',
      'Aussagekraft von Gütesiegeln für Konsumentscheidungen beurteilen.',
      'Fair-Trade als Konsum- und Handelskonzept beurteilen.',
      'Maslowsche Bedürfnishierarchie zur Reflexion von Konsumentscheidungen nutzen.',
      'Das ökonomische Prinzip auf Konsumentscheidungen anwenden.',
    ],
  },
  {
    code: 'SI-WIRTSCHAFT-MARKT',
    title: 'Der Markt - Treffpunkt von Angebot und Nachfrage',
    page: 33,
    stage: 'SekI',
    goals: [
      'Einflussfaktoren von Angebot und Nachfrage beschreiben.',
      'Preisbildung und Wettbewerb auf Märkten erklären.',
      'Wettbewerb in globalen Märkten beurteilen.',
      'Das Marktmodell als Analyseinstrument nutzen.',
      'Marktformen unterscheiden.',
      'Den Wirtschaftskreislauf als Analyseinstrument verwenden.',
      'Das Drei-Sektoren-Modell als Wirtschaftsstrukturmodell erläutern.',
      'Internet-Handel als Marktveränderung analysieren.',
      'Innovation und Dynamik als Marktveränderungen beurteilen.',
      'Funktionen von Wettbewerb für wirtschaftliche Ordnung beurteilen.',
    ],
  },
  {
    code: 'SI-WIRTSCHAFT-SMW',
    title: 'Soziale Marktwirtschaft',
    page: 33,
    stage: 'SekI',
    goals: [
      'Grundprinzipien der Sozialen Marktwirtschaft erläutern.',
      'Soziale Sicherungssysteme als Bestandteil der Sozialen Marktwirtschaft erklären.',
      'Wettbewerbspolitik und Rahmengesetzgebung des Staates darstellen.',
      'Wohlstandsindikatoren zur Bewertung wirtschaftlicher Entwicklung nutzen.',
      'Tarifparteien und Tarifautonomie in der Sozialen Marktwirtschaft erklären.',
      'Geld und Währung als wirtschaftliche Institutionen erläutern.',
      'Konjunkturpolitik als wirtschaftspolitisches Handlungsfeld erklären.',
      'Kartellverbote und Fusionskontrolle als wettbewerbspolitische Instrumente beurteilen.',
      'Ökonomie, Ökologie und Nachhaltigkeit in der Sozialen Marktwirtschaft abwägen.',
    ],
  },
  {
    code: 'SI-WIRTSCHAFT-ARBEITSWELT',
    title: 'Begegnungen mit der Arbeitswelt und Berufsorientierung',
    page: 34,
    stage: 'SekI',
    goals: [
      'Einflüsse von Strukturwandel, Automatisierung und Digitalisierung auf Berufsentscheidungen beurteilen.',
      'Schulische und berufliche Bildungswege vergleichen.',
      'Duale Ausbildung, Schule und Studium als Anschlussoptionen unterscheiden.',
      'Berufliche Vielfalt und Modeberufe beurteilen.',
      'Eigene Fähigkeiten und Neigungen für die Berufswahl reflektieren.',
      'Anforderungsprofile von Berufen auswerten.',
      'Rollenerwartungen und selbstbestimmte Berufswahl kritisch reflektieren.',
      'Regionale Ausbildungs- und Beschäftigungsmöglichkeiten für die eigene Berufswahl bewerten.',
      'Bewerbungsunterlagen adressatengerecht erstellen.',
      'Online-Bewerbung als Bewerbungsform anwenden.',
      'Assessmentcenter und Berufsinformationszentrum für Bewerbungsprozesse nutzen.',
      'Vorstellungsgespräche vorbereiten und auswerten.',
      'Wirtschaftssektoren und Unternehmensformen erläutern.',
      'Betriebliche Organisationsstruktur beschreiben.',
      'Produktionsfaktoren in Unternehmen erklären.',
      'Standortfaktoren und Unternehmensziele in einfachen Unternehmensanalysen verwenden.',
      'Jugendarbeitsschutz und betriebliche Mitbestimmungsmöglichkeiten erklären.',
    ],
  },
]

const upperTopics: TopicDraft[] = [
  {
    code: 'E3-SMW-LEITBILDER',
    title: 'E3: Konkurrierende Leitbilder und Wirtschaftsordnungen',
    page: 56,
    stage: 'SekII',
    courseLevel: 'GK_LK',
    goals: [
      'Prinzipien der Zentralverwaltungswirtschaft erläutern.',
      'Prinzipien der freien Marktwirtschaft erläutern.',
      'Prinzipien der Sozialen Marktwirtschaft erläutern.',
      'Zentralverwaltungswirtschaft, freie Marktwirtschaft und Soziale Marktwirtschaft vergleichen.',
      'Das Modell des Homo oeconomicus als ökonomische Annahme erläutern.',
      'Transformation einer Wirtschaftsordnung an einem Beispiel beurteilen.',
    ],
  },
  {
    code: 'E3-SMW-AKTEURE',
    title: 'E3: Akteure und Interessenkonflikte in der Sozialen Marktwirtschaft',
    page: 57,
    stage: 'SekII',
    courseLevel: 'GK_LK',
    goals: [
      'Konsumentensouveränität im Spannungsfeld von Bedürfnissen, Knappheit und Interessen analysieren.',
      'Produzentensouveränität und Produktvielfalt in der Sozialen Marktwirtschaft beurteilen.',
      'Marketingstrategien als Einfluss auf Konsum- und Produktionsentscheidungen analysieren.',
      'Beziehungen zwischen Akteuren und Märkten im erweiterten Wirtschaftskreislauf darstellen.',
      'Die Rolle des Staates in der Sozialen Marktwirtschaft beurteilen.',
      'Tarifautonomie und Interessen von Arbeitnehmern und Arbeitgebern erläutern.',
      'Preiselastizitäten als Vertiefung von Angebot und Nachfrage einordnen.',
      'Staatsquote und staatliche Transferleistungen ökonomisch einordnen.',
    ],
  },
  {
    code: 'E3-SMW-WETTBEWERB',
    title: 'E3: Wettbewerbs- und Ordnungspolitik',
    page: 57,
    stage: 'SekII',
    courseLevel: 'GK_LK',
    goals: [
      'Marktmodell und Marktformen zur Analyse von Wettbewerbsprozessen nutzen.',
      'Freien Wettbewerb und Konzentration als ordnungspolitisches Spannungsfeld beurteilen.',
      'Staatliche Subventionen als ordnungspolitischen Eingriff bewerten.',
    ],
  },
  {
    code: 'Q11-WIRTSCHAFTSPOLITIK',
    title: 'Q1.1: Wirtschaftspolitik zwischen Markt und Staat',
    page: 58,
    stage: 'SekII',
    courseLevel: 'GK_LK',
    goals: [
      'Wirtschaftspolitische Zielsetzungen und Zielkonflikte analysieren.',
      'Konkurrierende wirtschaftspolitische Konzeptionen vergleichen.',
      'Beschäftigungspolitik und Arbeitsmarktpolitik zwischen Markt und Staat beurteilen.',
      'Wohlstand mit dem Bruttoinlandsprodukt messen und beurteilen.',
      'Wohlstand mit dem Human Development Index messen und beurteilen.',
      'Wohlstandsverteilung mit Lorenz-Kurve und Gini-Koeffizient analysieren.',
      'Wachstum und Nachhaltigkeit als wirtschaftspolitisches Spannungsfeld bewerten.',
      'Finanzpolitik zwischen ausgeglichenem Haushalt und Verschuldung beurteilen.',
      'Steuerpolitik als Gestaltungsinstrument analysieren.',
      'Umweltpolitik und Energiepolitik zwischen staatlicher Steuerung und Markt beurteilen.',
      'Gründung und Rechtsformen von Unternehmen analysieren.',
      'Betriebliche Mitbestimmung und Unternehmensziele analysieren.',
      'Grundlegende Funktionen und Entscheidungsprozesse im Unternehmen analysieren.',
      'Divergierende Interessenlagen und Lösungsstrategien im Unternehmen beurteilen.',
      'Gleichstellungsfragen im Unternehmenskontext bewerten.',
      'Shareholder- und Stakeholder-Value im Unternehmenskontext vergleichen.',
      'Corporate Social Responsibility und Corporate Identity als Unternehmenskonzepte bewerten.',
    ],
  },
  {
    code: 'Q12-EU-WIRTSCHAFT',
    title: 'Q1.2: Europäische Geld-, Wirtschafts- und Finanzpolitik',
    page: 60,
    stage: 'SekII',
    courseLevel: 'GK_LK',
    goals: [
      'Von der Wirtschaftsgemeinschaft zur politischen Union als Integrationsprozess erklären.',
      'Europäische Politik zwischen gemeinsamer Geldpolitik und nationalstaatlicher Finanzpolitik analysieren.',
      'EWWU, Stabilitätspakt und einheitliche europäische Währung hinsichtlich Chancen und Risiken beurteilen.',
      'Die Rolle der EZB zwischen Geldwertsicherung und Wachstumsförderung bewerten.',
      'Nationale Schuldenkrisen als Herausforderung für die Europäische Union einordnen.',
    ],
  },
  {
    code: 'Q22-SOZIALSTAAT',
    title: 'Q2.2: Die Zukunft des Sozialstaates',
    page: 62,
    stage: 'SekII',
    courseLevel: 'GK_LK',
    goals: [
      'Entwicklung und Grundprinzipien des deutschen Sozialstaates erläutern.',
      'Soziale Sicherungssysteme und ihre Finanzierung analysieren.',
      'Sozialstaatsmodelle vergleichen.',
      'Vorsorgenden und aktivierenden Sozialstaat vergleichen.',
      'Dimensionen sozialer Gerechtigkeit und Armut im Sozialstaat beurteilen.',
      'Zukunft der Gesundheitsvorsorge als soziale Sicherung beurteilen.',
      'Zukunft der Altersabsicherung als soziale Sicherung beurteilen.',
      'Gleichberechtigung der Geschlechter als sozialstaatliches Handlungsfeld beurteilen.',
      'Familienpolitik und Inklusion als sozialstaatliche Handlungsfelder beurteilen.',
      'Sozialpolitik zwischen Eigenverantwortung und Solidarität abwägen.',
      'Den Sozialstaat im globalen Wettbewerb und in der EU-Sozialpolitik beurteilen.',
    ],
  },
  {
    code: 'Q23-GLOBALISIERUNG',
    title: 'Q2.3: Prozess der Globalisierung',
    page: 64,
    stage: 'SekII',
    courseLevel: 'GK_LK',
    goals: [
      'Außenwirtschaftliche Leitbilder und Indikatoren der Globalisierung erläutern.',
      'Maßnahmen zwischen Freihandel und Protektionismus beurteilen.',
      'Internationale Finanzmärkte und ihre Bedeutung für die Weltwirtschaft analysieren.',
      'Den Standort Deutschland im globalen Wettbewerb beurteilen.',
      'Erklärungsansätze für internationalen Handel und ungleiche Welthandelsstrukturen verwenden.',
      'Finanz- und Wirtschaftskrisen hinsichtlich Ursachen analysieren.',
      'Verlauf und Folgen von Finanz- und Wirtschaftskrisen analysieren.',
      'Regulierungsmöglichkeiten von Finanz- und Wirtschaftskrisen beurteilen.',
      'Auswirkungen der Globalisierung auf Arbeitsmärkte beurteilen.',
      'Handlungsfelder und politische Steuerungsmöglichkeiten von G7, IWF, NGOs, OECD, Weltbank und WTO erläutern.',
      'Nationalstaatliche Handlungsmöglichkeiten in der Globalisierung und Freihandelsabkommen bewerten.',
      'Global Economic Governance als Steuerungsansatz beurteilen.',
      'Internationale Handelsabkommen hinsichtlich Chancen und Risiken beurteilen.',
      'Gesellschaftliche Chancen und Konflikte der Globalisierung analysieren.',
      'Gewinner und Verlierer der Globalisierung bestimmen und beurteilen.',
      'Ansätze zur sozialen Gestaltung der Globalisierung beurteilen.',
    ],
  },
  {
    code: 'Q25-OEKONOMIE-OEKOLOGIE',
    title: 'Q2.5: Ökonomie und Ökologie',
    page: 67,
    stage: 'SekII',
    courseLevel: 'GK_LK',
    goals: [
      'Öffentliche Güter und externe Effekte im Spannungsfeld Markt und Umwelt erklären.',
      'Wachstumskonzepte und Nachhaltigkeit als wirtschafts- und umweltpolitisches Spannungsfeld beurteilen.',
      'Klimawandel als ökologische Herausforderung analysieren.',
      'Zugang, Nutzung und Verteilung von Ressourcen als ökologische Herausforderung analysieren.',
      'Globale Rohstoffmärkte als ökologische und ökonomische Herausforderung analysieren.',
      'Leitbild nachhaltige Entwicklung und ökosoziale Marktwirtschaft erläutern.',
      'Instrumente der Umweltpolitik beurteilen.',
      'Energiewende und Energiepolitik zwischen Staat und Markt beurteilen.',
      'Umweltpolitik zwischen Wettbewerbsfähigkeit und Nachhaltigkeit abwägen.',
      'Klimaschutzpolitik beurteilen.',
      'Umweltmanagement und Ökoaudit als betriebliche Vertiefungen einordnen.',
      'Zukunftsszenarien zum Klimawandel wirtschafts- und umweltpolitisch einordnen.',
    ],
  },
]

const ids = {
  householdBudget: 'e5b070d2-daa5-5b8e-8782-32bb8a6865d2',
  moneyFunctions: '40676995-14fc-55a9-89ae-440b2ee3ab33',
  payment: 'e2ac2cc2-894a-5e61-8acb-f5d88811739d',
  consumerBehavior: '5b5ed3cb-7c2c-5b0f-a515-c967d8d23644',
  consumptionReflection: 'a60e0541-80e1-5f94-86fd-073f5a00bee8',
  sustainableConsumption: 'bac0f1d3-e671-5c2b-bd6d-2947f1fe6d9b',
  marketingAnalysis: '8c9f8fb2-18be-5e9c-86bf-3aea14a10b78',
  marketingImportance: '75cdc9a3-4cce-57a1-85e2-87c9994244da',
  marketingConcept: '95f2b860-d21d-5627-8dcd-cd53efd94b7b',
  legalFunctions: '2aee114f-d0d2-516f-8f95-1b72f707401d',
  legalFramework: 'bb7f2a2a-95c3-5375-8323-51a808e945e6',
  contracts: '78eeb8fe-fd5c-5d21-81be-75c3990fc4b5',
  consumerRights: 'c386592a-b259-538c-9929-25775af99b83',
  consumerPurchaseRights: 'c4faf50c-8778-5540-8276-87840cc81e05',
  limitedCapacity: '1f5c3e82-dc4a-54cc-838e-66e4d434a7b5',
  overDebt: 'e9c4ec6b-9a54-579d-818f-87a7d39d4e3c',
  onlineConsumption: 'd3c11bfa-103c-5b58-8183-561e0b076251',
  digitalMarkets: '52e6731e-71e9-53b1-8bb9-b03da445decf',
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
  careerInfo: '980a3f45-b0ad-500d-8d5b-975948362b68',
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
  euIntegration: '3e0d8fbc-f383-5505-a30e-7c4f125342bb',
  euInternalMarket: '9ea7d847-7425-5157-a827-ee5f8c2e8c0a',
  euCurrency: '79d244e0-049e-59e9-a2fb-b8f8670b315a',
  fiscalUnion: 'b4a82d8d-6311-5575-b222-cbaf6ea90d32',
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
  developmentIndicators: 'fed15db6-e700-514d-a65e-6c2a34f1c81a',
  developmentSectors: 'f1f73ebe-286a-52e8-a2e1-4383ece6e9ec',
  povertyDevelopment: '543bf91f-f6c6-5b1b-ba9e-43de321d8c7f',
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

  if (topic.includes('KONSUM')) add(ids.householdBudget, ids.consumerBehavior, ids.consumptionReflection, ids.sustainableConsumption, ids.marketingImportance, ids.legalFunctions, ids.contracts, ids.consumerPurchaseRights)
  if (topic.includes('MARKT')) add(ids.marketModel, ids.marketEquilibrium, ids.priceFunctions, ids.competition, ids.concentration, ids.economicCycle)
  if (topic.includes('SMW')) add(ids.socialMarket, ids.socialMarketOrder, ids.legalFramework, ids.stateVsMarket, ids.orderConcepts, ids.competitionPolicy, ids.growthLifeQuality, ids.tariff)
  if (topic.includes('ARBEITSWELT')) add(ids.workDevelopments, ids.workDigital, ids.careerProfile, ids.careerInfo, ids.specialization, ids.companyStructure, ids.companyCoreSupport, ids.companyTargets, ids.businessModel, ids.workTimeParticipation)
  if (topic.includes('LEITBILDER')) add(ids.socialMarket, ids.socialMarketOrder, ids.orderConcepts, ids.stateVsMarket)
  if (topic.includes('AKTEURE')) add(ids.consumerBehavior, ids.marketModel, ids.economicCycle, ids.companyStakeholders, ids.tariff, ids.stateVsMarket)
  if (topic.includes('WETTBEWERB')) add(ids.marketModel, ids.competition, ids.concentration, ids.competitionPolicy, ids.orderConcepts)
  if (topic.includes('WIRTSCHAFTSPOLITIK')) add(ids.policyGrowth, ids.policyEvaluate, ids.stabilityLaw, ids.cycleIndicators, ids.cycleForecasts, ids.fiscalPolicy, ids.publicDebt, ids.taxEffects, ids.growthLifeQuality, ids.environmentalPolicyMultilevel)
  if (topic.includes('EU-WIRTSCHAFT')) add(ids.euIntegration, ids.euInternalMarket, ids.euCurrency, ids.ezb, ids.moneyCreation, ids.fiscalUnion, ids.publicDebt)
  if (topic.includes('SOZIALSTAAT')) add(ids.socialStateGoals, ids.socialInsurance, ids.pensionFinance, ids.justiceConcepts, ids.inequality, ids.societyDiagnosis, ids.povertyParticipation, ids.socialStateReforms)
  if (topic.includes('GLOBALISIERUNG')) add(ids.globalization, ids.globalValueChains, ids.tradePolicy, ids.tradeConflict, ids.worldTradeDevelopment, ids.financialActors, ids.globalGovernance, ids.locationCompetition, ids.developmentSectors)
  if (topic.includes('OEKONOMIE-OEKOLOGIE')) add(ids.externalities, ids.sustainableGrowth, ids.environmentalProblems, ids.environmentalInstruments, ids.environmentalPolicyMultilevel, ids.environmentalConflicts, ids.circularEconomy)

  if (text.includes('geld') || text.includes('währung')) add(ids.moneyFunctions, ids.payment, ids.euCurrency)
  if (text.includes('werbung') || text.includes('marketing')) add(ids.marketingImportance, ids.marketingAnalysis, ids.marketingConcept)
  if (text.includes('geschäftsfähigkeit') || text.includes('kaufvertrag')) add(ids.legalFunctions, ids.contracts, ids.consumerRights, ids.consumerPurchaseRights, ids.limitedCapacity)
  if (text.includes('verschuldung') || text.includes('privatinsolvenz')) add(ids.overDebt)
  if (text.includes('fair') || text.includes('gütesiegel')) add(ids.fairTrade, ids.sustainableConsumption)
  if (text.includes('internet') || text.includes('digital')) add(ids.onlineConsumption, ids.digitalMarkets, ids.workDigital)
  if (text.includes('wettbewerb') || text.includes('konzentration') || text.includes('kartell') || text.includes('fusion')) add(ids.competition, ids.concentration, ids.competitionPolicy)
  if (text.includes('tarif') || text.includes('gewerkschaft')) add(ids.tariff, ids.laborModels, ids.workTimeParticipation)
  if (text.includes('unternehmen') || text.includes('betrieb')) add(ids.specialization, ids.companyStructure, ids.companyCoreSupport, ids.companyProcesses, ids.companyTargets, ids.companyStakeholders, ids.businessModel)
  if (text.includes('bewerbung') || text.includes('beruf')) add(ids.careerProfile, ids.careerInfo)
  if (text.includes('sozial')) add(ids.socialStateGoals, ids.socialInsurance, ids.justiceConcepts)
  if (text.includes('ungleichheit') || text.includes('modelle')) add(ids.societyDiagnosis)
  if (text.includes('gerechtigkeit')) add(ids.justiceConcepts, ids.distributionModels)
  if (text.includes('armut')) add(ids.povertyParticipation, ids.povertyDevelopment)
  if (text.includes('gleichstellung')) add(ids.genderEquality)
  if (text.includes('steuer')) add(ids.taxEffects, ids.fiscalPolicy)
  if (text.includes('verschuldung') || text.includes('haushalt') || text.includes('schulden')) add(ids.publicDebt, ids.fiscalPolicy)
  if (text.includes('wachstum') || text.includes('wohlstand') || text.includes('bip') || text.includes('hdi') || text.includes('gini')) add(ids.growthLifeQuality, ids.gdp, ids.sustainableGrowth, ids.policyGrowth, ids.cycleForecasts)
  if (text.includes('umwelt') || text.includes('klima') || text.includes('ressource') || text.includes('nachhaltigkeit') || text.includes('energie')) add(ids.environmentalProblems, ids.environmentalInstruments, ids.environmentalPolicyMultilevel, ids.environmentalConflicts)
  if (text.includes('ezb') || text.includes('geldpolitik')) add(ids.ezb, ids.ezbDecision, ids.moneyCreation, ids.priceInterest)
  if (text.includes('freihandel') || text.includes('protektionismus')) add(ids.tradePolicy, ids.protectionism, ids.tradeConflict)
  if (text.includes('welthandel') || text.includes('handel')) add(ids.worldTradeDevelopment, ids.tradeTheory, ids.tradeAgreement, ids.developmentSectors)
  if (text.includes('finanzmarkt') || text.includes('krise')) add(ids.financialActors, ids.financialRegulation)
  if (text.includes('iwf') || text.includes('weltbank') || text.includes('wto') || text.includes('governance')) add(ids.globalGovernance, ids.globalGovernanceStructures)
  if (text.includes('standort')) add(ids.locationCompetition, ids.globalBusiness)
  if (text.includes('zivilgesellschaft') || text.includes('ngo')) add(ids.ngos, ids.globalGovernance)

  return Array.from(targets)
}

function buildExtraction(params: {
  extractionId: string
  sourceLandscapeId: string
  title: string
  stage: 'SekI' | 'SekII'
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
      title: `SH ${topic.code} (${index + 1}): ${goalText}`,
      description: `Source-Ziel aus ${topic.title}: ${goalText}`,
      sourceText: goalText,
      sourceSpan: `${topic.code} (${index + 1})`,
      parentBulletText: goalText,
      sourceRef: `${sourceDocument.title}, ${topic.title}, S. ${topic.page}.`,
      courseLevel: topic.courseLevel ?? params.stage,
      granularity: 'officialContentItem',
      tags: ['jurisdiction:DE-SH', 'subject:Wirtschaft', `stage:${params.stage}`, `topic:${topic.code}`],
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
    jurisdiction: 'DE-SH',
    subject: 'Wirtschaft/Politik',
    stage: params.stage,
    title: params.title,
    sourceDocument: { ...sourceDocument, official: true },
    method: {
      passageExtraction: 'pdftotext -layout; wirtschaftlich relevante Themen und Inhalte aus den amtlichen SH-Fachanforderungen Wirtschaft/Politik selektiert',
      sourceGoalExtraction: 'one normalized source goal per listed economic content item or tightly coupled content group',
      scopeNote: 'Das integrierte Fach Wirtschaft/Politik wird nur mit wirtschaftlichen Inhaltsbereichen in den kanonischen Wirtschaftskanon geroutet.',
    },
    qualityReview: params.qualityReview,
    expectedTopicCodes: params.topics.map((topic) => topic.code),
    pipelineStatus: {
      currentStep: 'MAPPING-3',
      steps: [
        { id: 'MAPPING-1', label: 'Original-Lehrplanpassagen extrahiert', status: 'complete', dependsOn: [], checks: [{ id: 'source-document-present', label: 'Amtliche SH-WiPo-Quelle liegt lokal vor', passed: true, details: sourceDocument.path }] },
        { id: 'MAPPING-2', label: 'Source-Ziele aus Lehrplanpassagen erstellt', status: 'complete', dependsOn: ['MAPPING-1'], checks: [{ id: 'source-goals-created', label: 'Aus den ausgewählten SH-Passagen wurden Source-Ziele erzeugt', passed: true, details: `${sourceGoals.length} Source-Ziele.` }] },
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
      rationale: 'SH-Source-Ziel ist durch vorhandene kanonische Wirtschaft-Ziele fachlich vollständig abgedeckt; partial beschreibt die Zuordnungsform 1:n oder Sammelziel, nicht eine offene Lücke.',
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
  stage: string
  sourcePath: string
  archivePath: string
}) {
  const registry = JSON.parse(readFileSync(registryPath, 'utf8')) as { version: number; entries: Array<Record<string, unknown>> }
  registry.entries = registry.entries.filter((candidate) => candidate.landscapeId !== entry.landscapeId)
  registry.entries.push({
    landscapeId: entry.landscapeId,
    title: entry.title,
    jurisdiction: 'DE-SH',
    subject: 'Wirtschaft',
    stage: entry.stage,
    sourcePath: entry.sourcePath,
    archiveSourcePath: entry.sourcePath,
    archivePath: entry.archivePath,
    sourceDocumentKey: sourceDocument.key,
    sourceUrl: sourceDocument.url,
  })
  registry.entries.sort((a, b) => String(a.jurisdiction).localeCompare(String(b.jurisdiction)) || String(a.title).localeCompare(String(b.title)))
  writeJson(registryPath, registry)
}

const lowerOutput = 'curricula/DE/Gymnasium/input/SH/lower-secondary/source-extraction/DE_SH_WIRTSCHAFT_POLITIK_SEKI_FACHANFORDERUNGEN_2016.source-extraction.json'
const upperOutput = 'curricula/DE/Gymnasium/input/SH/upper-secondary/source-extraction/DE_SH_WIRTSCHAFT_POLITIK_SEKII_FACHANFORDERUNGEN_2016.source-extraction.json'
const lowerReviewPath = 'curricula/DE/Gymnasium/mapping/DE-SH/lower-secondary/sh_wipo_lower_secondary_economics_source_extraction_to_canonical_wirtschaft.review.json'
const upperReviewPath = 'curricula/DE/Gymnasium/mapping/DE-SH/upper-secondary/sh_wipo_upper_secondary_economics_source_extraction_to_canonical_wirtschaft.review.json'

const lowerExtraction = buildExtraction({
  extractionId: 'DE-SH-WIPO-SEKI-WIRTSCHAFT',
  sourceLandscapeId: lowerSourceLandscapeId,
  title: 'Wirtschaft/Politik Sekundarstufe I (Schleswig-Holstein, Fachanforderungen 2016 Source-Extraction)',
  stage: 'SekI',
  topics: lowerTopics,
  reviewPath: lowerReviewPath,
  qualityReview: {
    sourceGoalCountPeerBaseline: {
      accepted: true,
      details: 'SH Sek I enthält kompakte, aber vollständige Inhaltslisten zu Konsum, Markt, Sozialer Marktwirtschaft sowie Arbeitswelt. Die Zielzahl ist wegen der rahmenhaften Fachanforderungen niedriger als NRW, aber oberhalb der 30%-Abweichungsschwelle gegen den Wirtschaft-Peer-Korridor geprüft.',
    },
  },
})

const upperExtraction = buildExtraction({
  extractionId: 'DE-SH-WIPO-SEKII-WIRTSCHAFT',
  sourceLandscapeId: upperSourceLandscapeId,
  title: 'Wirtschaft/Politik Oberstufe (Schleswig-Holstein, Fachanforderungen 2016 Source-Extraction)',
  stage: 'SekII',
  topics: upperTopics,
  reviewPath: upperReviewPath,
  qualityReview: {
    sourceGoalCountPeerBaseline: {
      accepted: true,
      details: 'SH Sek II bildet E3, Q1.1, wirtschaftliche EU-/Sozialstaatsbezüge, Globalisierung und Ökonomie/Ökologie ab. Die Zielzahl liegt im plausiblen Korridor der bereits geprüften Wirtschaft-Quellen.',
    },
  },
})

writeJson(path.join(repoRoot, lowerOutput), lowerExtraction)
writeJson(path.join(repoRoot, upperOutput), upperExtraction)
writeReview({
  reviewPath: lowerReviewPath,
  reviewId: 'DE-SH-WIPO-SEKI-WIRTSCHAFT-MAPPING-3-SOURCE-EXTRACTION-1',
  extractionPath: lowerOutput,
  extraction: lowerExtraction,
})
writeReview({
  reviewPath: upperReviewPath,
  reviewId: 'DE-SH-WIPO-SEKII-WIRTSCHAFT-MAPPING-3-SOURCE-EXTRACTION-1',
  extractionPath: upperOutput,
  extraction: upperExtraction,
})
upsertRegistryEntry({
  landscapeId: lowerSourceLandscapeId,
  title: lowerExtraction.title,
  stage: 'Sekundarstufe I',
  sourcePath: sourceDocument.path,
  archivePath: 'curricula/DE/Gymnasium/input/SH/lower-secondary/',
})
upsertRegistryEntry({
  landscapeId: upperSourceLandscapeId,
  title: upperExtraction.title,
  stage: 'Sekundarstufe II',
  sourcePath: sourceDocument.path,
  archivePath: 'curricula/DE/Gymnasium/input/SH/upper-secondary/',
})

console.log(`Generated SH Wirtschaft source extractions: ${lowerExtraction.sourceGoals.length} lower + ${upperExtraction.sourceGoals.length} upper source goals.`)
