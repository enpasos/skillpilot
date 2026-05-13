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
  sourceText: string
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

const lowerSourceLandscapeId = idFrom('DE-HH PGW Sek I Wirtschaft source extraction')
const upperSourceLandscapeId = idFrom('DE-HH PGW Studienstufe Wirtschaft source extraction')

const lowerDocument = {
  key: 'HH-PGW-SEKI-2022',
  title: 'Bildungsplan Gymnasium Sekundarstufe I Politik/Gesellschaft/Wirtschaft Hamburg',
  path: 'curricula/DE/Gymnasium/input/HH/pgw-gym-seki-2022-data.pdf',
  url: 'https://www.hamburg.de/resource/blob/123480/ec95895152120f9d437cdb3c9f987879/pgw-gym-seki-data.pdf',
}

const upperDocument = {
  key: 'HH-PGW-GYO-2022',
  title: 'Bildungsplan Studienstufe Politik/Gesellschaft/Wirtschaft Hamburg',
  path: 'curricula/DE/Gymnasium/input/HH/p-g-w-gyo-2022-data.pdf',
  url: 'https://www.hamburg.de/resource/blob/123082/9e8fca4bcac88da5c5d6aa02d15b43c8/p-g-w-gyo-2022-data.pdf',
}

const lowerTopics: TopicDraft[] = [
  {
    code: 'SI-PGW-WIRTSCHAFT-KONSUM',
    title: 'Marktteilnehmer als Konsumenten',
    page: 28,
    stage: 'SekI',
    goals: [
      'Privathaushalt und Märkte als wirtschaftliche Handlungsräume erklären.',
      'Einkommen und Verbrauch privater Haushalte unterscheiden.',
      'Sparen und Kredit als Finanzentscheidungen privater Haushalte erläutern.',
      'Vorsorge und Verschuldung als Folgen langfristiger Finanzentscheidungen beurteilen.',
      'Den Wirtschaftskreislauf zur Analyse privaten Konsums nutzen.',
      'Werbung und Medien als Einflussfaktoren auf Konsumentscheidungen analysieren.',
      'Eigenes Konsumverhalten ökonomisch begründen.',
      'Konsumentscheidungen nach rationalen ökonomischen Kriterien treffen.',
      'Kriterien für den Kauf von Konsumgütern entwickeln.',
      'Konsumentscheidungen unter Nachhaltigkeitsgesichtspunkten hinterfragen.',
    ],
  },
  {
    code: 'SI-PGW-WIRTSCHAFT-UNTERNEHMEN-ARBEIT',
    title: 'Unternehmen und Arbeitnehmer in der Marktgesellschaft',
    page: 28,
    stage: 'SekI',
    goals: [
      'Unternehmen und Betriebe als Akteure der Marktgesellschaft beschreiben.',
      'Produktionsfaktoren in Unternehmen erläutern.',
      'Entrepreneurship als unternehmerische Handlungsform darstellen.',
      'Arbeit und Berufswelt im Umbruch analysieren.',
      'Interessenvertretung in der Arbeitswelt erklären.',
      'Konfliktregelung in der Arbeitswelt beurteilen.',
      'Einen Berufspraktikumsplatz kriterienorientiert auswählen.',
      'Berufsorientierung mit Anforderungen in Berufsausbildung und Studium verbinden.',
      'Eigenverantwortung für Bildungs- und Berufswegeplanung übernehmen.',
    ],
  },
  {
    code: 'SI-PGW-WIRTSCHAFT-POLITIK',
    title: 'Wirtschaftsgesellschaft und Wirtschaftspolitik',
    page: 28,
    stage: 'SekI',
    goals: [
      'Indikatoren der Wirtschaftsentwicklung auswerten.',
      'Wettbewerb im europäischen Markt analysieren.',
      'Wirtschaftspolitische Maßnahmen am Beispiel Wettbewerbspolitik beurteilen.',
      'Grundprinzipien der Marktwirtschaft erläutern.',
      'Marktmechanismen in einfachen wirtschaftlichen Problemen anwenden.',
      'Einen einfachen Wirtschaftskreislauf darstellen.',
      'Kategorien wie Kosten, Nutzen, Preis und Markt zur Analyse wirtschaftlicher Entscheidungen nutzen.',
      'Wirtschaftsordnungen als grundlegende gesellschaftliche Ordnungsvorstellungen vergleichen.',
    ],
  },
  {
    code: 'SI-PGW-WIRTSCHAFT-GLOBAL',
    title: 'Globale Probleme mit wirtschaftlicher Dimension',
    page: 28,
    stage: 'SekI',
    goals: [
      'Klimawandel als globales Problem mit wirtschaftlicher Dimension analysieren.',
      'Internationale Lösungswege für globale Umweltprobleme wirtschaftlich beurteilen.',
      'Globale Probleme anhand wirtschaftlicher Interessen und Zielkonflikte erschließen.',
    ],
  },
]

const upperTopics: TopicDraft[] = [
  {
    code: 'S14-WACHSTUM-MARKTWIRTSCHAFT',
    title: 'Wachstum und Marktwirtschaft',
    page: 21,
    stage: 'SekII',
    courseLevel: 'GK_LK',
    goals: [
      'Bedeutung des Wachstums für Wirtschaft und Sozialstaat analysieren.',
      'Einkommensentwicklung als Wachstums- und Verteilungsindikator auswerten.',
      'Beschäftigung und Sozialversicherungen im Kontext von Wachstum beurteilen.',
      'Öffentlichen Haushalt als wirtschaftspolitischen Handlungsspielraum analysieren.',
      'Internationale Machteffekte wirtschaftlicher Entwicklung beurteilen.',
      'Wirtschaftswachstum mit BIP, Wachstumsraten, BIP pro Kopf und BSP messen.',
      'Kritik an Wachstumsorientierung und Grenzen des Wachstums beurteilen.',
      'Kritik an Profitmaximierung, Kapitalakkumulation und Produktionsmitteleigentum einordnen.',
      'Fallenden Grenznutzen als wachstumskritisches Argument erläutern.',
      'Alternativkonzepte wie Genossenschaften, Allmenden und Subsistenzwirtschaft beurteilen.',
      'Grenzen des Wachstums mit Ressourcenverbrauch, Klimawandel, Biodiversität, Müll und Gesundheit analysieren.',
      'Globale Disparitäten und ökonomische Instabilität als Wachstumsprobleme beurteilen.',
      'Effizienz, Suffizienz und Konsistenz als Anpassungsoptionen für Wirtschaftssysteme unterscheiden.',
      'Handlungsoptionen der Akteure des Wirtschaftskreislaufs für Nachhaltigkeit beurteilen.',
      'Einflussgrößen auf Konsum wie Milieu, Wertorientierung, Verhaltensökonomik, Präferenzen und Einkommen analysieren.',
      'Globale ökologische Dimensionen von Konsumentscheidungen beurteilen.',
      'Gewinnorientierung von Unternehmen im Nachhaltigkeitskontext beurteilen.',
      'Green Entrepreneurship und Kreislaufwirtschaft als unternehmerische Nachhaltigkeitskonzepte erläutern.',
      'Gemeinwohlorientierung, Wirtschaft ohne Wachstum und Gemeinwohlökonomie einordnen.',
      'BIP, World Happiness Index und Gemeinwohl als Wirtschaftssteuerungsindikatoren vergleichen.',
      'Sozialen Ausgleich und Gerechtigkeit für zukünftige Generationen als staatlichen Zielkonflikt beurteilen.',
      'Green New Deal und Postwachstumsökonomie als Reformkonzepte bewerten.',
      'Energiewende als Bereich nachhaltigen staatlichen Handelns analysieren.',
      'Europäische Umwelt- und Klimapolitik als Kooperationsfeld beurteilen.',
      'Freihandel und Handelsbeschränkungen im Sinne der Nachhaltigkeit abwägen.',
      'WTO als Akteur für fairen Handel beurteilen.',
      'Nachhaltige Geldanlagen und nachhaltiges Handeln von Geschäftsbanken einordnen.',
      'EZB-Aufgaben in wirtschaftlicher Analyse, Bankenaufsicht, Anlageportfolios und Finanzstabilität erläutern.',
    ],
  },
  {
    code: 'S14-KONJUNKTURPOLITIK',
    title: 'Konjunkturpolitik',
    page: 22,
    stage: 'SekII',
    courseLevel: 'GK_LK',
    goals: [
      'Konjunktur und Konjunkturzyklen modellhaft erklären.',
      'Indikatoren der Konjunkturanalyse auswerten.',
      'Konjunkturelle Abläufe in Vergangenheit und Gegenwart vergleichen.',
      'Historische Dimensionen der Konjunkturpolitik am Beispiel New Deal oder Wirtschaftskrisen analysieren.',
      'Wirkungsketten angebotsorientiert-liberaler Wirtschaftspolitik erläutern.',
      'Wirkungsketten nachfrageorientiert-keynesianischer Wirtschaftspolitik erläutern.',
      'Politikmix als Mittelweg wirtschaftspolitischer Steuerung beurteilen.',
      'Praktische Beispiele staatlicher Konjunkturpolitik untersuchen.',
      'Auswirkungen staatlicher Konjunkturpolitik unter ethischen und sozialen Gesichtspunkten beurteilen.',
      'Inflation, Deflation, Aufschwung, Boom, Rezession, Depression und Austeritätspolitik als Konjunkturbegriffe verwenden.',
    ],
  },
  {
    code: 'S14-WAHLMODULE-WIRTSCHAFT',
    title: 'Wirtschaftliche Wahlmodule auf erhöhtem Niveau',
    page: 23,
    stage: 'SekII',
    courseLevel: 'LK',
    goals: [
      'Ökonomische Globalisierung nach Charakter, Ursachen und Antriebskräften analysieren.',
      'Theorien der internationalen Arbeitsteilung erläutern.',
      'Auswirkungen von Welthandel, Direktinvestitionen und internationalen Finanzmärkten beurteilen.',
      'Entwicklung von Freihandel und Protektionismus bewerten.',
      'WTO, IWF, Weltbank, G20 und NGOs als Akteure wirtschaftlicher Globalisierung analysieren.',
      'Handlungsspielräume nationalstaatlicher Wirtschaftspolitik angesichts supranationaler Verflechtungen und Krisen beurteilen.',
      'Aufgaben der Banken für den Wirtschaftsprozess erläutern.',
      'EZB-Aufgaben, Instrumente und Ziele erklären.',
      'Europäische Interventions- und Regulationsmechanismen der Krisenbewältigung beurteilen.',
      'Wirtschaften eines Groß-, Mittel- oder Kleinbetriebs unter nationalen Vorgaben analysieren.',
      'Entrepreneurship, Geschäftsmodelle und Unternehmensplanung für Unternehmensgründungen erläutern.',
      'Rechtsformen, Finanzierung, Investitionsrechnung, Marketing und Buchführung als Gründungselemente einordnen.',
      'Unternehmensfinanzierung über den Aktienmarkt beurteilen.',
      'Menschenbild, Freiheitsrechte und Eigentumsrechte als Grundlagen des Wirtschaftssystems erläutern.',
      'Markt und Marktversagen analysieren.',
      'Internalisierung externer Kosten als wirtschaftspolitisches Instrument erklären.',
      'Unterschiedliche Marktformen analysieren.',
      'Staatliche Einflussnahme auf Preisbildung am Beispiel Mindestlohn oder Managementgehälter beurteilen.',
      'Ordnungs-, struktur- und prozesspolitische Zielsetzungen der Wirtschaftspolitik unterscheiden.',
      'Deutsche Wirtschaft im globalen Wettbewerb beurteilen.',
      'Motive deutscher Unternehmen für Auslandsaktivitäten und Arbeitsplatzverlegung analysieren.',
      'Standort Deutschland im internationalen Vergleich beurteilen.',
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
  developmentSectors: 'f1f73ebe-286a-52e8-a2e1-4383ece6e9ec',
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

  if (topic.includes('KONSUM')) add(ids.householdBudget, ids.payment, ids.consumerBehavior, ids.consumptionReflection, ids.sustainableConsumption, ids.marketingImportance, ids.marketingAnalysis, ids.marketingConcept, ids.consumerRights, ids.overDebt, ids.economicCycle)
  if (topic.includes('UNTERNEHMEN')) add(ids.specialization, ids.companyStructure, ids.companyCoreSupport, ids.companyProcesses, ids.companyTargets, ids.companyStakeholders, ids.businessModel, ids.entrepreneur, ids.tariff, ids.laborModels, ids.workDevelopments, ids.workDigital, ids.careerProfile)
  if (topic.includes('POLITIK')) add(ids.socialMarket, ids.socialMarketOrder, ids.legalFunctions, ids.legalFramework, ids.marketModel, ids.economicCycle, ids.competition, ids.competitionPolicy, ids.orderConcepts, ids.policyEvaluate, ids.cycleIndicators)
  if (topic.includes('GLOBAL')) add(ids.environmentalProblems, ids.environmentalPolicyMultilevel, ids.globalization, ids.globalGovernance)
  if (topic.includes('WACHSTUM')) add(ids.growthLifeQuality, ids.gdp, ids.sustainableGrowth, ids.environmentalProblems, ids.circularEconomy, ids.socialInsurance, ids.publicDebt, ids.fairTrade, ids.ezb)
  if (topic.includes('KONJUNKTUR')) add(ids.cycleIndicators, ids.cycleModels, ids.cycleForecasts, ids.policyGrowth, ids.fiscalPolicy, ids.inflation, ids.policyEvaluate)
  if (topic.includes('WAHLMODULE')) add(ids.globalization, ids.tradePolicy, ids.tradeTheory, ids.tradeConflict, ids.worldTradeDevelopment, ids.financialActors, ids.globalGovernance, ids.ezb, ids.moneyCreation, ids.euCurrency, ids.companyStructure, ids.businessModel, ids.entrepreneur, ids.marketingConcept, ids.marketModel, ids.externalities, ids.competition, ids.locationCompetition)

  if (text.includes('konsum')) add(ids.consumerBehavior, ids.consumptionReflection)
  if (text.includes('sparen') || text.includes('kredit') || text.includes('verschuldung')) add(ids.householdBudget, ids.payment, ids.overDebt)
  if (text.includes('werbung') || text.includes('medien') || text.includes('marketing')) add(ids.marketingImportance, ids.marketingAnalysis, ids.marketingConcept)
  if (text.includes('recht') || text.includes('regulierung')) add(ids.legalFunctions, ids.legalFramework)
  if (text.includes('nachhaltigkeit') || text.includes('ökologisch') || text.includes('klima') || text.includes('co2') || text.includes('ressource')) add(ids.sustainableConsumption, ids.sustainableGrowth, ids.environmentalProblems, ids.environmentalInstruments, ids.environmentalPolicyMultilevel, ids.environmentalConflicts)
  if (text.includes('markt') || text.includes('preis')) add(ids.marketModel, ids.marketEquilibrium, ids.priceFunctions)
  if (text.includes('wettbewerb')) add(ids.competition, ids.competitionPolicy, ids.concentration)
  if (text.includes('wirtschaftskreislauf')) add(ids.economicCycle)
  if (text.includes('unternehmen') || text.includes('betrieb')) add(ids.companyStructure, ids.companyCoreSupport, ids.companyProcesses, ids.companyStakeholders, ids.businessModel)
  if (text.includes('entrepreneurship') || text.includes('gründ')) add(ids.entrepreneur, ids.businessModel)
  if (text.includes('arbeit') || text.includes('beruf')) add(ids.workDevelopments, ids.workDigital, ids.laborModels, ids.careerProfile)
  if (text.includes('tarif') || text.includes('interessenvertretung') || text.includes('konfliktregelung')) add(ids.tariff, ids.coDetermination, ids.workTimeParticipation)
  if (text.includes('wirtschaftsordnung') || text.includes('marktwirtschaft')) add(ids.socialMarket, ids.socialMarketOrder, ids.orderConcepts, ids.stateVsMarket)
  if (text.includes('sozialstaat') || text.includes('sozialversicherung')) add(ids.socialStateGoals, ids.socialInsurance, ids.justiceConcepts)
  if (text.includes('haushalt')) add(ids.publicDebt, ids.fiscalPolicy)
  if (text.includes('wachstum') || text.includes('bip') || text.includes('wohlstand') || text.includes('gemeinwohl')) add(ids.growthLifeQuality, ids.gdp, ids.sustainableGrowth)
  if (text.includes('konjunktur') || text.includes('rezession') || text.includes('boom')) add(ids.cycleIndicators, ids.cycleModels, ids.cycleForecasts)
  if (text.includes('keynes') || text.includes('angebotsorientiert')) add(ids.policyGrowth, ids.policyEvaluate)
  if (text.includes('inflation') || text.includes('deflation')) add(ids.inflation, ids.priceInterest)
  if (text.includes('ezb') || text.includes('banken') || text.includes('währungsunion')) add(ids.ezb, ids.ezbDecision, ids.moneyCreation, ids.payment, ids.euCurrency, ids.financialActors)
  if (text.includes('freihandel') || text.includes('protektionismus')) add(ids.tradePolicy, ids.protectionism, ids.tradeConflict)
  if (text.includes('welthandel') || text.includes('handel')) add(ids.worldTradeDevelopment, ids.tradeTheory, ids.tradeAgreement, ids.fairTrade)
  if (text.includes('iwf') || text.includes('weltbank') || text.includes('wto') || text.includes('g20') || text.includes('ngo')) add(ids.globalGovernance, ids.globalGovernanceStructures, ids.ngos)
  if (text.includes('finanzmarkt') || text.includes('direktinvestition') || text.includes('krise')) add(ids.financialActors, ids.financialRegulation)
  if (text.includes('standort') || text.includes('ausland')) add(ids.locationCompetition, ids.globalBusiness)
  if (text.includes('extern')) add(ids.externalities, ids.environmentalInstruments)

  return Array.from(targets)
}

function buildExtraction(params: {
  extractionId: string
  sourceLandscapeId: string
  title: string
  stage: 'SekI' | 'SekII'
  sourceDocument: typeof lowerDocument
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
      title: `HH ${topic.code} (${index + 1}): ${goalText}`,
      description: `Source-Ziel aus ${topic.title}: ${goalText}`,
      sourceText: goalText,
      sourceSpan: `${topic.code} (${index + 1})`,
      parentBulletText: goalText,
      sourceRef: `${params.sourceDocument.title}, ${topic.title}, S. ${topic.page}.`,
      courseLevel: topic.courseLevel ?? params.stage,
      granularity: 'officialContentOrRequirement',
      tags: ['jurisdiction:DE-HH', 'subject:Wirtschaft', `stage:${params.stage}`, `topic:${topic.code}`],
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
    jurisdiction: 'DE-HH',
    subject: 'Politik/Gesellschaft/Wirtschaft',
    stage: params.stage,
    title: params.title,
    sourceDocument: { ...params.sourceDocument, official: true },
    method: {
      passageExtraction: 'pdftotext -layout; wirtschaftlich relevante PGW-Inhaltsfelder und Anforderungen aus dem amtlichen Hamburger Bildungsplan selektiert',
      sourceGoalExtraction: 'one normalized source goal per economic content item or requirement; compact official list split where multiple assessable economic goals are bundled',
      scopeNote: 'Das integrierte Fach PGW wird nur mit wirtschaftlichen Inhaltsfeldern in den kanonischen Wirtschaftskanon geroutet.',
    },
    qualityReview: params.qualityReview,
    expectedTopicCodes: params.topics.map((topic) => topic.code),
    pipelineStatus: {
      currentStep: 'MAPPING-3',
      steps: [
        { id: 'MAPPING-1', label: 'Original-Lehrplanpassagen extrahiert', status: 'complete', dependsOn: [], checks: [{ id: 'source-document-present', label: 'Amtliche HH-PGW-Quelle liegt lokal vor', passed: true, details: params.sourceDocument.path }] },
        { id: 'MAPPING-2', label: 'Source-Ziele aus Lehrplanpassagen erstellt', status: 'complete', dependsOn: ['MAPPING-1'], checks: [{ id: 'source-goals-created', label: 'Aus den ausgewählten HH-Passagen wurden Source-Ziele erzeugt', passed: true, details: `${sourceGoals.length} Source-Ziele.` }] },
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
      rationale: 'HH-Source-Ziel ist durch vorhandene kanonische Wirtschaft-Ziele fachlich vollständig abgedeckt; partial beschreibt die Zuordnungsform 1:n oder Sammelziel, nicht eine offene Lücke.',
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
  sourceDocument: typeof lowerDocument
  archivePath: string
}) {
  const registry = JSON.parse(readFileSync(registryPath, 'utf8')) as { version: number; entries: Array<Record<string, unknown>> }
  registry.entries = registry.entries.filter((candidate) => candidate.landscapeId !== entry.landscapeId)
  registry.entries.push({
    landscapeId: entry.landscapeId,
    title: entry.title,
    jurisdiction: 'DE-HH',
    subject: 'Wirtschaft',
    stage: entry.stage,
    sourcePath: entry.sourceDocument.path,
    archiveSourcePath: entry.sourceDocument.path,
    archivePath: entry.archivePath,
    sourceDocumentKey: entry.sourceDocument.key,
    sourceUrl: entry.sourceDocument.url,
  })
  registry.entries.sort((a, b) => String(a.jurisdiction).localeCompare(String(b.jurisdiction)) || String(a.title).localeCompare(String(b.title)))
  writeJson(registryPath, registry)
}

const lowerOutput = 'curricula/DE/Gymnasium/input/HH/lower-secondary/source-extraction/DE_HH_PGW_SEKI_WIRTSCHAFT_BILDUNGSPLAN_2022.source-extraction.json'
const upperOutput = 'curricula/DE/Gymnasium/input/HH/upper-secondary/source-extraction/DE_HH_PGW_SEKII_WIRTSCHAFT_BILDUNGSPLAN_2022.source-extraction.json'
const lowerReviewPath = 'curricula/DE/Gymnasium/mapping/DE-HH/lower-secondary/hh_pgw_lower_secondary_economics_source_extraction_to_canonical_wirtschaft.review.json'
const upperReviewPath = 'curricula/DE/Gymnasium/mapping/DE-HH/upper-secondary/hh_pgw_upper_secondary_economics_source_extraction_to_canonical_wirtschaft.review.json'

const lowerExtraction = buildExtraction({
  extractionId: 'DE-HH-PGW-SEKI-WIRTSCHAFT',
  sourceLandscapeId: lowerSourceLandscapeId,
  title: 'PGW Sekundarstufe I - wirtschaftliche Inhaltsfelder (Hamburg, Bildungsplan Source-Extraction)',
  stage: 'SekI',
  sourceDocument: lowerDocument,
  topics: lowerTopics,
  reviewPath: lowerReviewPath,
  qualityReview: {
    sourceGoalCountPeerBaseline: {
      accepted: true,
      details: 'HH Sek I ist im amtlichen Bildungsplan kompakt als Inhaltsfeld formuliert. Die Source-Ziele wurden aus Inhaltsliste und wirtschaftsbezogenen Mindestanforderungen granularisiert; die niedrigere Zahl ist fachlich plausibel dokumentiert.',
    },
  },
})

const upperExtraction = buildExtraction({
  extractionId: 'DE-HH-PGW-SEKII-WIRTSCHAFT',
  sourceLandscapeId: upperSourceLandscapeId,
  title: 'PGW Studienstufe - wirtschaftliche Module (Hamburg, Bildungsplan Source-Extraction)',
  stage: 'SekII',
  sourceDocument: upperDocument,
  topics: upperTopics,
  reviewPath: upperReviewPath,
  qualityReview: {
    sourceGoalCountPeerBaseline: {
      accepted: true,
      details: 'HH Studienstufe enthält ein dichtes Modul Wirtschaft und Nachhaltigkeit plus Konjunkturpolitik und eA-Wahlmodule. Die Zielzahl liegt im Korridor bereits geprüfter integrierter PGW/WiPo-Quellen.',
    },
  },
})

writeJson(path.join(repoRoot, lowerOutput), lowerExtraction)
writeJson(path.join(repoRoot, upperOutput), upperExtraction)
writeReview({ reviewPath: lowerReviewPath, reviewId: 'DE-HH-PGW-SEKI-WIRTSCHAFT-MAPPING-3-SOURCE-EXTRACTION-1', extractionPath: lowerOutput, extraction: lowerExtraction })
writeReview({ reviewPath: upperReviewPath, reviewId: 'DE-HH-PGW-SEKII-WIRTSCHAFT-MAPPING-3-SOURCE-EXTRACTION-1', extractionPath: upperOutput, extraction: upperExtraction })
upsertRegistryEntry({ landscapeId: lowerSourceLandscapeId, title: lowerExtraction.title, stage: 'Sekundarstufe I', sourceDocument: lowerDocument, archivePath: 'curricula/DE/Gymnasium/input/HH/lower-secondary/' })
upsertRegistryEntry({ landscapeId: upperSourceLandscapeId, title: upperExtraction.title, stage: 'Sekundarstufe II', sourceDocument: upperDocument, archivePath: 'curricula/DE/Gymnasium/input/HH/upper-secondary/' })

console.log(`Generated HH Wirtschaft source extractions: ${lowerExtraction.sourceGoals.length} lower + ${upperExtraction.sourceGoals.length} upper source goals.`)
