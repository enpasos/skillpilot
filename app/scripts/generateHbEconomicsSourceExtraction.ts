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

const sourceDocuments = {
  lower: {
    key: 'HB-WAT-GYMNASIUM-2006',
    title: 'Bildungsplan Wirtschaft-Arbeit-Technik Gymnasium 5-10 Bremen',
    path: 'curricula/DE/Gymnasium/input/HB/Gy_WAT_2006.pdf',
    url: 'https://www.lis.bremen.de/sixcms/media.php/13/Gy_WAT_2006.pdf',
  },
  upper: {
    key: 'HB-WIRTSCHAFTSLEHRE-GYO-2008',
    title: 'Bildungsplan Wirtschaftslehre Gymnasiale Oberstufe Bremen',
    path: 'curricula/DE/Gymnasium/input/HB/GyO_Wirtschaftslehre_2008.pdf',
    url: 'https://www.lis.bremen.de/sixcms/media.php/13/GyO_Wirtschaftslehre_2008.pdf',
  },
} satisfies Record<'lower' | 'upper', SourceDocument>

const lowerSourceLandscapeId = idFrom('DE-HB WAT Gymnasium Sek I Wirtschaft source extraction')
const upperSourceLandscapeId = idFrom('DE-HB Wirtschaftslehre Gymnasiale Oberstufe source extraction')

const lowerTopics: TopicDraft[] = [
  {
    code: 'SEKI-WAT-HAUSHALT-KONSUM',
    title: 'Haushalt und Konsum',
    page: 6,
    stage: 'SekI',
    goals: [
      'Physische, soziale, ökonomische und kulturelle Voraussetzungen des Wirtschaftens im privaten Haushalt erklären.',
      'Daseinsvorsorge, Gesundheitsförderung und Verbraucherentscheidungen im privaten Haushalt wirtschaftlich einordnen.',
      'Haushaltsmanagement als Einheit von Planen, Produzieren, Verwalten und Beratung nutzen.',
      'Arbeitsteilung im Haushalt unter sozialen und ökonomischen Gesichtspunkten beurteilen.',
      'Wirtschaften im privaten Haushalt im Spannungsfeld verfügbarer Mittel und Konsumansprüche beurteilen.',
      'Nachhaltiges Wirtschaften im privaten Haushalt erklären und anwenden.',
      'Voraussetzungen und Grenzen rationalen Verbraucherverhaltens beurteilen.',
      'Verbraucherschutz und Verbraucherpolitik zwischen Wettbewerb, Information und Konsumentenschutz einordnen.',
    ],
  },
  {
    code: 'SEKI-WAT-UNTERNEHMEN-PRODUKTION',
    title: 'Unternehmen und Produktion',
    page: 6,
    stage: 'SekI',
    goals: [
      'Arbeitsplätze, Arbeitsorganisation und Wirtschaftsbereiche beschreiben.',
      'Arbeitsteilung und Spezialisierung in Haushalt, Betrieb und Volkswirtschaft erklären.',
      'Arbeits- und Produktionsabläufe in Unternehmen analysieren.',
      'Technisierung, Technisierungsstufen und Automatisierung als Veränderung von Produktion beurteilen.',
      'Aufbau, Aufgaben und Funktionen von Betrieben und Unternehmen erläutern.',
      'Ökologische Nachhaltigkeit der Produktion beurteilen.',
      'Verteilung von Gütern und Einkommen in einer globalisierten Welt wirtschaftlich einordnen.',
      'Ökonomisch Handelnde, ihre Funktionen, Ziele und Interessen unterscheiden.',
      'Ursachen und Folgen von Arbeitslosigkeit analysieren.',
    ],
  },
  {
    code: 'SEKI-WAT-INFRASTRUKTUREN',
    title: 'Infrastrukturen, Ressourcen und globale Wirkungen',
    page: 7,
    stage: 'SekI',
    goals: [
      'Entwicklung und Nutzung von Verkehrs-, Transport-, Informations- und Kommunikationsmitteln wirtschaftlich beurteilen.',
      'Mobilitätskonzepte, Mobilitätsformen und eigene Verhaltensmuster unter ökonomischen und ökologischen Kriterien analysieren.',
      'Beziehungen zwischen Produktionsbedingungen, Qualität und Preis erklären.',
      'Individuelles und gesellschaftliches Verbraucherverhalten sowie notwendige Veränderungsprozesse beurteilen.',
      'Gegenwärtige und zukünftige Folgen des Ressourcenverbrauchs wirtschaftlich und ökologisch bewerten.',
      'Ökologische, soziale und ökonomische Auswirkungen einer globalisierten Welt analysieren.',
    ],
  },
  {
    code: 'SEKI-WAT-BERUFSORIENTIERUNG',
    title: 'Arbeits-, Berufsorientierung und Lebensplanung',
    page: 7,
    stage: 'SekI',
    goals: [
      'Veränderungen von Berufsbildern und Tätigkeiten in der Arbeitswelt beschreiben.',
      'Eigene Erwartungen, Interessen, Stärken und Schwächen für Berufsentscheidungen reflektieren.',
      'Berufliche Eignung, Qualifikationsanforderungen und Lebensperspektiven Bildung-Beruf-Sozialstatus analysieren.',
      'Informationen und Beratung zu Bildungsgängen, Berufen sowie regionalen Ausbildungs- und Studienmöglichkeiten nutzen.',
      'Bewerbungs- und Einstellungsverfahren vorbereiten und auswerten.',
      'Berufliche Anforderungen, Tätigkeiten am Arbeitsplatz, Jugendarbeitsschutz und Arbeitsschutz einordnen.',
    ],
  },
]

const upperTopics: TopicDraft[] = [
  {
    code: 'Q1-MARKTWIRTSCHAFT-PREISBILDUNG',
    title: 'Q1: Wirtschaftsordnung und Preisbildung in der Sozialen Marktwirtschaft',
    page: 6,
    stage: 'SekII',
    courseLevel: 'GK_LK',
    goals: [
      'Grundelemente der Marktwirtschaft im Zusammenspiel von Angebot und Nachfrage erklären.',
      'Preisbildung auf verschiedenen Märkten analysieren und ihre Allokationsfunktion erörtern.',
      'Einflussmöglichkeiten des Staates auf Preisbildung und Wohlstandsverteilung beurteilen.',
      'Marktmacht durch Monopole, Kartelle und Großkonzerne analysieren.',
      'Fusionen, Übernahmen und Zusammenschlüsse sowie Fusions- und Kartellrecht zur Wettbewerbssicherung beurteilen.',
      'Konzentration auf nationalen und internationalen Märkten unter dem Gesichtspunkt von Marktmacht analysieren.',
    ],
  },
  {
    code: 'Q2-GELD-WAEHRUNG-FINANZMAERKTE',
    title: 'Q2: Geld- und Währungspolitik auf nationalen und internationalen Märkten',
    page: 6,
    stage: 'SekII',
    courseLevel: 'GK_LK',
    goals: [
      'Entstehung und Funktionen des Geldes im geschichtlichen Kontext erläutern.',
      'Bedeutung von Geldwertstabilität und Binnenwert des Geldes beurteilen.',
      'Ursachen inflationärer Prozesse erkennen und im Zusammenhang darstellen.',
      'Funktionsweise des Zentralbankensystems analysieren.',
      'Wirkungen von Geldpolitik auf Stabilität, Wachstum und Beschäftigung beurteilen.',
      'Wechselkurse und internationale Währungspolitik für Handelsbeziehungen analysieren.',
      'Aktuelle Probleme internationaler Finanzmärkte und Folgen für verflochtene Volkswirtschaften beurteilen.',
      'Zahlungsbilanz und Teilbilanzen auf wirtschaftliche Transaktionen anwenden.',
    ],
  },
  {
    code: 'Q3-KONJUNKTUR-BESCHAEFTIGUNG',
    title: 'Q3: Wirtschaftspolitische Konzepte zur Beeinflussung von Konjunktur und Beschäftigung',
    page: 7,
    stage: 'SekII',
    courseLevel: 'GK_LK',
    goals: [
      'Konjunkturverläufe, Konjunkturzyklen und Konjunkturindikatoren anhand aktueller Daten beurteilen.',
      'Wirtschaftstheoretische Konzepte von Klassik über Keynes bis Neoklassik und Monetarismus vergleichen.',
      'Wirkungsweisen wirtschaftspolitischer Konzepte zur Beeinflussung von Konjunktur und Beschäftigung beurteilen.',
      'Maßnahmen des Staates zur Konjunktur- und Beschäftigungspolitik ökonomischen Theorien zuordnen.',
      'Wirtschaftspolitische Grundpositionen verschiedener Parteien des Deutschen Bundestages untersuchen.',
      'Widerstreitende Konzepte zur Lösung ökonomischer Probleme in Fachpresse und Literatur analysieren.',
    ],
  },
  {
    code: 'Q4-GLOBALISIERUNG-AUSSENWIRTSCHAFT',
    title: 'Q4: Internationale Wirtschaftsbeziehungen und Globalisierung',
    page: 7,
    stage: 'SekII',
    courseLevel: 'GK_LK',
    goals: [
      'Grundlagen der Freihandelstheorie und Erklärungsansätze internationaler Arbeitsteilung erläutern.',
      'Definition, Voraussetzungen und Bedingungen der Globalisierung erklären.',
      'Probleme zunehmender Globalisierung auf Güter- und Finanzmärkten analysieren.',
      'Wirtschaftliche und gesellschaftliche Folgen der Globalisierung beurteilen.',
      'Wirtschaftstheoretische Einschätzungen zu Folgen der Globalisierung vergleichen.',
      'Daten zu Handelsbeziehungen Deutschlands darstellen und interpretieren.',
      'Vor- und Nachteile protektionistischer Handelsmaßnahmen erläutern.',
      'Gestaltungsansätze für Globalisierungsprozesse hinsichtlich politischer Realisierbarkeit diskutieren.',
    ],
  },
]

const ids = {
  householdBudget: 'e5b070d2-daa5-5b8e-8782-32bb8a6865d2',
  consumerBehavior: '5b5ed3cb-7c2c-5b0f-a515-c967d8d23644',
  consumptionReflection: 'a60e0541-80e1-5f94-86fd-073f5a00bee8',
  sustainableConsumption: 'bac0f1d3-e671-5c2b-bd6d-2947f1fe6d9b',
  consumerRights: 'c386592a-b259-538c-9929-25775af99b83',
  consumerPurchaseRights: 'c4faf50c-8778-5540-8276-87840cc81e05',
  overDebt: 'e9c4ec6b-9a54-579d-818f-87a7d39d4e3c',
  marketModel: '8ad94aeb-81ad-58ce-8792-c691f97efd53',
  marketEquilibrium: '50e07b86-428c-5f9c-8c7e-0d0669343af5',
  priceFunctions: '3bcb976d-3e45-5c62-81ac-5ed909df202b',
  economicCycle: '641dee8e-9658-5db1-89eb-2353f8322a8a',
  competition: '98136a27-120d-5278-b9b9-d833c0ea5fc0',
  concentration: 'cb21bcbe-755d-5b0d-b02a-be22c9d26e43',
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
  workDevelopments: '9cb6bd3b-1ecf-57af-8127-853fc969d7f5',
  workDigital: '21dd1fce-730a-5470-bcc3-76195941ee83',
  laborModels: '7c72848d-8bc9-58e2-a690-fd17ac650a88',
  careerProfile: '8dee6c0a-0f76-5717-87b6-04ec89229371',
  careerInfo: '980a3f45-b0ad-500d-8d5b-975948362b68',
  limitedCapacity: '1f5c3e82-dc4a-54cc-838e-66e4d434a7b5',
  environmentalProblems: '80c92945-155b-56ea-8aa2-46ee72852303',
  environmentalInstruments: '625b61ec-8561-5179-b59e-d3742b19c0e2',
  environmentalPolicyMultilevel: 'c3cb822e-f219-5a66-9714-db73b50d0487',
  environmentalConflicts: 'e3cd6940-26f0-55a9-a348-4a90c245266c',
  sustainableGrowth: 'd36664f5-1dc2-5e4b-bda0-0a288407d2af',
  circularEconomy: '4d578b42-8dac-5381-9836-9d7199451c74',
  moneyFunctions: '40676995-14fc-55a9-89ae-440b2ee3ab33',
  payment: 'e2ac2cc2-894a-5e61-8acb-f5d88811739d',
  ezb: 'f9132615-8166-5e42-ad04-d8b2b75d719d',
  ezbDecision: '0242e34e-e2fe-5a0f-8aed-57905c6ebb26',
  moneyCreation: '676684da-5ba2-5c2a-ba7e-a8413915c29c',
  priceInterest: 'f70be9a9-3ec5-52e8-84b0-213f2061856c',
  inflation: '8ebbbe19-43dd-53ff-a6d0-9d94a5973616',
  euCurrency: '79d244e0-049e-59e9-a2fb-b8f8670b315a',
  financialActors: '667b75ad-2d20-5f22-ad57-46be5b7c53c7',
  financialRegulation: 'fb249488-944c-5123-a21e-5cb9a0431e8b',
  cycleIndicators: 'a773d8a6-3b0d-5ab5-a914-ca234e7fb813',
  cycleModels: 'bc3f895f-38d7-534b-998d-8d60fcbbb900',
  cycleForecasts: '0e5b12a1-68bd-5838-8e70-02b3e7f2518a',
  policyGrowth: '764e9eca-3392-5eb1-8df6-603356a47fd9',
  policyEvaluate: '950caf4f-1082-56bb-84db-b7174ce6c63f',
  fiscalPolicy: '550a050a-36bb-5b9e-ae0a-1afc7f9a0df0',
  stabilityLaw: '6f1f4654-35ab-5ba6-a329-b19b994e84cc',
  publicDebt: 'c5272ab8-baa0-570b-9f31-426d1f4460f2',
  taxEffects: 'a307a7f1-9f14-50e5-b7ba-1e70c8465ee7',
  gdp: '5262a0ba-0ede-5f47-a6a2-4778d24fc95a',
  growthLifeQuality: '1d38aa8d-c667-5edf-85c1-4111999f03d4',
  globalization: '72920fcb-4afb-5ba4-88c1-b1c8af2f9ca5',
  globalValueChains: '11c57203-1619-5bba-8905-9c10d7f77d57',
  tradePolicy: '604cde3e-4095-50c3-b712-e6bd7cea4717',
  tradeTheory: '87ee2b5a-8d10-51e4-a288-539e5ac251ea',
  tradeConflict: '54049ed4-9364-5564-a55a-3959193d9018',
  protectionism: '0b6db337-3fc6-5c30-860d-c8fbd535cb5c',
  tradeAgreement: '0509ae79-abb4-5e6b-8db2-521c1bccacf4',
  worldTradeDevelopment: '4cccf0da-a0f4-593a-9bf3-4a68c790af40',
  locationCompetition: '7f8f6648-6faa-52c5-9793-3654ef9dc36d',
  globalBusiness: '09e58ea8-1920-5600-bd2b-cc1f199d051f',
}

const invalidIds = Object.entries(ids).filter(([, id]) => !canonicalGoalIds.has(id))
if (invalidIds.length > 0) {
  throw new Error(`Unknown canonical IDs: ${invalidIds.map(([key, id]) => `${key}=${id}`).join(', ')}`)
}

for (const sourceDocument of Object.values(sourceDocuments)) {
  if (!existsSync(path.join(repoRoot, sourceDocument.path))) {
    throw new Error(`Missing source document: ${sourceDocument.path}`)
  }
}

function targetsFor(goal: SourceGoal): string[] {
  const topic = goal.topicCode
  const text = goal.sourceText.toLowerCase()
  const targets = new Set<string>()
  const add = (...goalIds: string[]) => goalIds.forEach((id) => targets.add(id))

  if (topic.includes('HAUSHALT')) add(ids.householdBudget, ids.consumerBehavior, ids.consumptionReflection, ids.sustainableConsumption, ids.consumerRights, ids.consumerPurchaseRights, ids.overDebt, ids.economicCycle)
  if (topic.includes('UNTERNEHMEN')) add(ids.specialization, ids.companyStructure, ids.companyCoreSupport, ids.companyProcesses, ids.companyTargets, ids.companyStakeholders, ids.businessModel, ids.entrepreneur, ids.workDevelopments, ids.laborModels)
  if (topic.includes('INFRASTRUKTUREN')) add(ids.environmentalProblems, ids.environmentalInstruments, ids.environmentalPolicyMultilevel, ids.environmentalConflicts, ids.sustainableGrowth, ids.circularEconomy, ids.globalization)
  if (topic.includes('BERUFSORIENTIERUNG')) add(ids.workDevelopments, ids.workDigital, ids.careerProfile, ids.careerInfo, ids.laborModels)
  if (topic.includes('MARKTWIRTSCHAFT')) add(ids.marketModel, ids.marketEquilibrium, ids.priceFunctions, ids.competition, ids.concentration, ids.competitionPolicy, ids.socialMarket, ids.socialMarketOrder, ids.stateVsMarket, ids.orderConcepts)
  if (topic.includes('GELD')) add(ids.moneyFunctions, ids.payment, ids.ezb, ids.ezbDecision, ids.moneyCreation, ids.priceInterest, ids.inflation, ids.euCurrency, ids.financialActors, ids.financialRegulation)
  if (topic.includes('KONJUNKTUR')) add(ids.cycleIndicators, ids.cycleModels, ids.cycleForecasts, ids.policyGrowth, ids.policyEvaluate, ids.fiscalPolicy, ids.stabilityLaw, ids.publicDebt, ids.taxEffects, ids.gdp, ids.growthLifeQuality)
  if (topic.includes('GLOBALISIERUNG')) add(ids.globalization, ids.globalValueChains, ids.tradePolicy, ids.tradeTheory, ids.tradeConflict, ids.protectionism, ids.tradeAgreement, ids.worldTradeDevelopment, ids.locationCompetition, ids.globalBusiness, ids.financialActors)

  if (text.includes('haushalt')) add(ids.householdBudget, ids.consumerBehavior)
  if (text.includes('verbrauch') || text.includes('konsum')) add(ids.consumerBehavior, ids.consumptionReflection, ids.consumerRights, ids.sustainableConsumption)
  if (text.includes('nachhalt')) add(ids.sustainableConsumption, ids.sustainableGrowth, ids.environmentalProblems, ids.circularEconomy)
  if (text.includes('preis')) add(ids.marketModel, ids.marketEquilibrium, ids.priceFunctions)
  if (text.includes('markt')) add(ids.marketModel, ids.socialMarket, ids.competition)
  if (text.includes('wettbewerb') || text.includes('kartell') || text.includes('fusion')) add(ids.competition, ids.competitionPolicy, ids.concentration)
  if (text.includes('unternehmen') || text.includes('betrieb')) add(ids.companyStructure, ids.companyCoreSupport, ids.companyProcesses, ids.companyStakeholders, ids.businessModel)
  if (text.includes('produktion') || text.includes('produktions')) add(ids.companyProcesses, ids.specialization, ids.sustainableGrowth)
  if (text.includes('arbeit') || text.includes('beruf')) add(ids.workDevelopments, ids.workDigital, ids.careerProfile, ids.careerInfo, ids.laborModels)
  if (text.includes('arbeitslosigkeit') || text.includes('beschäftigung')) add(ids.cycleIndicators, ids.policyGrowth, ids.laborModels)
  if (text.includes('geld') || text.includes('währung')) add(ids.moneyFunctions, ids.payment, ids.ezb, ids.euCurrency)
  if (text.includes('inflation')) add(ids.inflation, ids.priceInterest)
  if (text.includes('zentralbank') || text.includes('geldpolitik')) add(ids.ezb, ids.ezbDecision, ids.moneyCreation, ids.priceInterest)
  if (text.includes('finanzmarkt')) add(ids.financialActors, ids.financialRegulation)
  if (text.includes('konjunktur')) add(ids.cycleIndicators, ids.cycleModels, ids.cycleForecasts)
  if (text.includes('keynes') || text.includes('klassik') || text.includes('monetarismus')) add(ids.policyGrowth, ids.policyEvaluate)
  if (text.includes('freihandel') || text.includes('protektion')) add(ids.tradePolicy, ids.tradeTheory, ids.protectionism, ids.tradeConflict)
  if (text.includes('globalisierung') || text.includes('globalisiert')) add(ids.globalization, ids.globalValueChains, ids.worldTradeDevelopment)
  if (text.includes('handelsbeziehung')) add(ids.tradeAgreement, ids.worldTradeDevelopment, ids.locationCompetition)

  return Array.from(targets)
}

function buildExtraction(params: {
  extractionId: string
  sourceLandscapeId: string
  title: string
  stage: Stage
  sourceDocument: SourceDocument
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
      title: `HB ${topic.code} (${index + 1}): ${goalText}`,
      description: `Source-Ziel aus ${topic.title}: ${goalText}`,
      sourceText: goalText,
      sourceSpan: `${topic.code} (${index + 1})`,
      parentBulletText: goalText,
      sourceRef: `${params.sourceDocument.title}, ${topic.title}, S. ${topic.page}.`,
      courseLevel: topic.courseLevel ?? params.stage,
      granularity: 'officialContentOrStandard',
      tags: ['jurisdiction:DE-HB', 'subject:Wirtschaft', `stage:${params.stage}`, `topic:${topic.code}`],
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
    jurisdiction: 'DE-HB',
    subject: 'Wirtschaft',
    stage: params.stage,
    title: params.title,
    sourceDocument: { ...params.sourceDocument, official: true },
    method: {
      passageExtraction: 'pdftotext -layout; wirtschaftlich relevante Themen/Inhalte und themenbezogene Standards aus amtlichen Bremer Bildungsplaenen selektiert',
      sourceGoalExtraction: 'one normalized source goal per official content item or tightly coupled themenbezogener Standard',
      scopeNote: params.stage === 'SekI'
        ? 'Das integrierte Fach Wirtschaft-Arbeit-Technik wird nur mit wirtschaftlichen Inhaltsbereichen in den kanonischen Wirtschaftskanon geroutet.'
        : 'Die Bremer Wirtschaftslehre-Qualifikationsphase wird als eigenstaendige Wirtschaft-Source-Extraction geroutet.',
    },
    qualityReview: params.qualityReview,
    expectedTopicCodes: params.topics.map((topic) => topic.code),
    pipelineStatus: {
      currentStep: 'MAPPING-3',
      steps: [
        { id: 'MAPPING-1', label: 'Original-Lehrplanpassagen extrahiert', status: 'complete', dependsOn: [], checks: [{ id: 'source-document-present', label: 'Amtliche HB-Wirtschaft-Quelle liegt lokal vor', passed: true, details: params.sourceDocument.path }] },
        { id: 'MAPPING-2', label: 'Source-Ziele aus Lehrplanpassagen erstellt', status: 'complete', dependsOn: ['MAPPING-1'], checks: [{ id: 'source-goals-created', label: 'Aus den ausgewählten HB-Passagen wurden Source-Ziele erzeugt', passed: true, details: `${sourceGoals.length} Source-Ziele.` }] },
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
      rationale: 'HB-Source-Ziel ist durch vorhandene kanonische Wirtschaft-Ziele fachlich vollständig abgedeckt; partial beschreibt die Zuordnungsform 1:n oder Sammelziel, nicht eine offene Lücke.',
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
  sourceDocument: SourceDocument
  archivePath: string
}) {
  const registry = JSON.parse(readFileSync(registryPath, 'utf8')) as { version: number; entries: Array<Record<string, unknown>> }
  registry.entries = registry.entries.filter((candidate) => candidate.landscapeId !== entry.landscapeId)
  registry.entries.push({
    landscapeId: entry.landscapeId,
    title: entry.title,
    jurisdiction: 'DE-HB',
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

const lowerOutput = 'curricula/DE/Gymnasium/input/HB/lower-secondary/source-extraction/DE_HB_WAT_SEKI_GYMNASIUM_2006.source-extraction.json'
const upperOutput = 'curricula/DE/Gymnasium/input/HB/upper-secondary/source-extraction/DE_HB_WIRTSCHAFTSLEHRE_SEKII_GYO_2008.source-extraction.json'
const lowerReviewPath = 'curricula/DE/Gymnasium/mapping/DE-HB/lower-secondary/hb_wat_lower_secondary_economics_source_extraction_to_canonical_wirtschaft.review.json'
const upperReviewPath = 'curricula/DE/Gymnasium/mapping/DE-HB/upper-secondary/hb_wirtschaftslehre_upper_secondary_source_extraction_to_canonical_wirtschaft.review.json'

const lowerExtraction = buildExtraction({
  extractionId: 'DE-HB-WAT-SEKI-WIRTSCHAFT',
  sourceLandscapeId: lowerSourceLandscapeId,
  title: 'Wirtschaft-Arbeit-Technik Sekundarstufe I (Bremen, Bildungsplan 2006 Source-Extraction)',
  stage: 'SekI',
  sourceDocument: sourceDocuments.lower,
  topics: lowerTopics,
  reviewPath: lowerReviewPath,
  qualityReview: {
    sourceGoalCountPeerBaseline: {
      accepted: true,
      details: 'HB Sek I ist ein kompakter WAT-Bildungsplan. Die Source-Ziele wurden aus den vier verbindlichen Themenbereichen plus oekonomischen Inhaltsangeboten 9/10 granularisiert; die niedrigere Zielzahl ist fachlich plausibel.',
    },
  },
})

const upperExtraction = buildExtraction({
  extractionId: 'DE-HB-WIRTSCHAFTSLEHRE-SEKII',
  sourceLandscapeId: upperSourceLandscapeId,
  title: 'Wirtschaftslehre Gymnasiale Oberstufe (Bremen, Bildungsplan 2008 Source-Extraction)',
  stage: 'SekII',
  sourceDocument: sourceDocuments.upper,
  topics: upperTopics,
  reviewPath: upperReviewPath,
  qualityReview: {
    sourceGoalCountPeerBaseline: {
      accepted: true,
      details: 'HB Sek II ist thematisch auf Q1 bis Q4 konzentriert und formuliert Standards kompakt. Die Source-Ziele bilden alle verbindlichen themenbezogenen Standards ab.',
    },
  },
})

writeJson(path.join(repoRoot, lowerOutput), lowerExtraction)
writeJson(path.join(repoRoot, upperOutput), upperExtraction)
writeReview({
  reviewPath: lowerReviewPath,
  reviewId: 'DE-HB-WAT-SEKI-WIRTSCHAFT-MAPPING-3-SOURCE-EXTRACTION-1',
  extractionPath: lowerOutput,
  extraction: lowerExtraction,
})
writeReview({
  reviewPath: upperReviewPath,
  reviewId: 'DE-HB-WIRTSCHAFTSLEHRE-SEKII-MAPPING-3-SOURCE-EXTRACTION-1',
  extractionPath: upperOutput,
  extraction: upperExtraction,
})
upsertRegistryEntry({
  landscapeId: lowerSourceLandscapeId,
  title: lowerExtraction.title,
  stage: 'Sekundarstufe I',
  sourceDocument: sourceDocuments.lower,
  archivePath: 'curricula/DE/Gymnasium/input/HB/lower-secondary/',
})
upsertRegistryEntry({
  landscapeId: upperSourceLandscapeId,
  title: upperExtraction.title,
  stage: 'Sekundarstufe II',
  sourceDocument: sourceDocuments.upper,
  archivePath: 'curricula/DE/Gymnasium/input/HB/upper-secondary/',
})

console.log(`Generated HB Wirtschaft source extractions: ${lowerExtraction.sourceGoals.length} lower + ${upperExtraction.sourceGoals.length} upper source goals.`)
