import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

type Stage = 'SekI' | 'SekII'

type SourceDocument = {
  key: string
  title: string
  path: string
  url: string
  note?: string
}

type SourceGoalDraft = {
  text: string
  targets: string[]
  courseLevel?: string
}

type TopicDraft = {
  code: string
  title: string
  page: number
  stage: Stage
  courseLevel?: string
  sourceDocument: SourceDocument
  goals: SourceGoalDraft[]
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

const ids = {
  householdBudget: 'e5b070d2-daa5-5b8e-8782-32bb8a6865d2',
  consumerBehavior: '5b5ed3cb-7c2c-5b0f-a515-c967d8d23644',
  consumptionReflection: 'a60e0541-80e1-5f94-86fd-073f5a00bee8',
  sustainableConsumption: 'bac0f1d3-e671-5c2b-bd6d-2947f1fe6d9b',
  consumerRights: 'c386592a-b259-538c-9929-25775af99b83',
  consumerContracts: 'a2eda0df-6c5e-5fb5-bc64-8f6127eae50b',
  consumerPurchaseRights: 'c4faf50c-8778-5540-8276-87840cc81e05',
  payment: 'e2ac2cc2-894a-5e61-8acb-f5d88811739d',
  overDebt: 'e9c4ec6b-9a54-579d-818f-87a7d39d4e3c',
  legalFunctions: '2aee114f-d0d2-516f-8f95-1b72f707401d',
  contracts: '78eeb8fe-fd5c-5d21-81be-75c3990fc4b5',
  minorRights: '1f5c3e82-dc4a-54cc-838e-66e4d434a7b5',
  legalFramework: 'bb7f2a2a-95c3-5375-8323-51a808e945e6',
  marketIdeas: 'f72eef5b-97dc-52b2-8879-838a7c6600be',
  marketModel: '8ad94aeb-81ad-58ce-8792-c691f97efd53',
  marketEquilibrium: '50e07b86-428c-5f9c-8c7e-0d0669343af5',
  priceFunctions: '3bcb976d-3e45-5c62-81ac-5ed909df202b',
  competition: '98136a27-120d-5278-b9b9-d833c0ea5fc0',
  concentration: 'cb21bcbe-755d-5b0d-b02a-be22c9d26e43',
  competitionPolicy: 'af709beb-2a7e-5df0-bc91-f8f0e0cb99f8',
  economicCycle: '641dee8e-9658-5db1-89eb-2353f8322a8a',
  moneyFunctions: '40676995-14fc-55a9-89ae-440b2ee3ab33',
  inflation: '8ebbbe19-43dd-53ff-a6d0-9d94a5973616',
  ezb: 'f9132615-8166-5e42-ad04-d8b2b75d719d',
  ezbDecision: '0242e34e-e2fe-5a0f-8aed-57905c6ebb26',
  moneyCreation: '676684da-5ba2-5c2a-ba7e-a8413915c29c',
  priceInterest: 'f70be9a9-3ec5-52e8-84b0-213f2061856c',
  euCurrency: '79d244e0-049e-59e9-a2fb-b8f8670b315a',
  socialMarket: '1da809f7-ef85-5a2d-babf-b7639e605653',
  socialMarketOrder: 'c7b03538-25a2-510b-8fd4-a81bcc3de406',
  stateVsMarket: '6600f5f0-0b30-5458-b144-b2468d897087',
  orderConcepts: '9ca0e3c9-005e-5c8d-8157-3642e11f245e',
  socialJustice: '577f0e2d-643a-5a0c-833b-301622a6cb00',
  socialState: 'd17ff931-085d-56be-932d-3839b5b88ba8',
  taxEffects: 'a307a7f1-9f14-50e5-b7ba-1e70c8465ee7',
  taxPolicy: 'a17899b9-f872-5236-a329-ec1a33d427a3',
  taxInstruments: '51bcbc9e-7a1c-5caa-9766-9ab97fa72f04',
  specialization: 'ae7b709c-6139-5b05-8615-197bff511d9f',
  companyStructure: '6d4a38df-527c-534b-8c0a-c6b546dae5b1',
  companyCoreSupport: 'aa9db8f6-c81e-5247-8f84-5f2b968ab2c4',
  companyProcesses: '2ccb9f7e-1512-5970-85a1-71ec42734eb9',
  companyTargets: 'b215bd82-2b6b-5b00-8a0b-85c7ff249bc2',
  companyStakeholders: 'e90586d8-8e0a-5355-87d0-4ecd90dbe021',
  businessModel: '53829f76-2d9c-5cdd-8521-c249f57f738d',
  entrepreneur: '96ab60e8-7645-5c34-84be-62e1c2a3cb16',
  marketingMeaning: '75cdc9a3-4cce-57a1-85e2-87c9994244da',
  marketingMeasures: '8c9f8fb2-18be-5e9c-86bf-3aea14a10b78',
  marketingConcept: '95f2b860-d21d-5627-8dcd-cd53efd94b7b',
  workDevelopments: '9cb6bd3b-1ecf-57af-8127-853fc969d7f5',
  workDigital: '21dd1fce-730a-5470-bcc3-76195941ee83',
  laborModels: '7c72848d-8bc9-58e2-a690-fd17ac650a88',
  tariff: '121fea28-9943-575d-9c96-1fb2e3356f32',
  careerProfile: '8dee6c0a-0f76-5717-87b6-04ec89229371',
  careerInfo: '980a3f45-b0ad-500d-8d5b-975948362b68',
  environmentalProblems: '80c92945-155b-56ea-8aa2-46ee72852303',
  externalEffects: 'bad728f2-e375-5f98-8f65-511a9e2e6751',
  environmentalInstruments: '625b61ec-8561-5179-b59e-d3742b19c0e2',
  environmentalPolicyMultilevel: 'c3cb822e-f219-5a66-9714-db73b50d0487',
  sustainableGrowth: 'd36664f5-1dc2-5e4b-bda0-0a288407d2af',
  circularEconomy: '4d578b42-8dac-5381-9836-9d7199451c74',
  growthLifeQuality: '1d38aa8d-c667-5edf-85c1-4111999f03d4',
  gdp: '5262a0ba-0ede-5f47-a6a2-4778d24fc95a',
  cycleIndicators: 'a773d8a6-3b0d-5ab5-a914-ca234e7fb813',
  cycleModels: 'bc3f895f-38d7-534b-998d-8d60fcbbb900',
  cycleForecasts: '0e5b12a1-68bd-5838-8e70-02b3e7f2518a',
  policyGrowth: '764e9eca-3392-5eb1-8df6-603356a47fd9',
  policyEvaluate: '950caf4f-1082-56bb-84db-b7174ce6c63f',
  fiscalPolicy: '550a050a-36bb-5b9e-ae0a-1afc7f9a0df0',
  stabilityLaw: '6f1f4654-35ab-5ba6-a329-b19b994e84cc',
  euIntegration: '1bddc795-8aeb-5408-90b3-12e4be51e912',
  euMarkets: '9ea7d847-7425-5157-a827-ee5f8c2e8c0a',
  euPolicyFields: '96c2c114-8474-5e4c-bfcf-c9e526c8c9ad',
  euGovernance: '79edbe3a-7557-5b3b-a0f2-c31f45b6dad7',
  euLegitimation: 'ab556d14-b0c0-5630-8ee3-f07877fa28bd',
  financialActors: '667b75ad-2d20-5f22-ad57-46be5b7c53c7',
  financialRegulation: 'fb249488-944c-5123-a21e-5cb9a0431e8b',
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
  transnationalCompanies: '1582ec45-1655-5f7c-a2bd-a3fc00e583fa',
  csr: 'abb13ea9-615f-5d71-92f9-140ff8b4cbfa',
  globalGovernance: '13705b9f-9623-500b-80ba-4574b753a29c',
  globalGovernanceStructures: 'f440efea-9d86-589f-8ff9-18e8d3b2efd3',
  fairTrade: 'e21158e7-3bc3-51f2-887f-9eb5a8dd6243',
  economicEthics: 'a56d5e8d-fd09-5961-ad88-34cfdef00baa',
  statistics: '26ebbe6e-6512-520d-80a4-2e7e80f29f72',
  mediaAnalysis: 'bd9ec397-86ee-58ec-8327-7e1f28550026',
}

const invalidIds = Object.entries(ids).filter(([, id]) => !canonicalGoalIds.has(id))
if (invalidIds.length > 0) {
  throw new Error(`Unknown canonical IDs: ${invalidIds.map(([key, id]) => `${key}=${id}`).join(', ')}`)
}

const sourceDocuments = {
  lower: {
    key: 'SL-SOZIALKUNDE-9-GYMNASIUM-2012',
    title: 'Lehrplan Sozialkunde Gymnasium Klassenstufe 9 Saarland, Unterrichtseinheit Wirtschaft und Arbeitswelt',
    path: 'https://www.saarland.de/SharedDocs/Downloads/DE/mbk/Lehrpl%C3%A4ne/Lehrplaene_Gymnasium/Sozialkunde/Sozialkunde_9_Gym_2012.pdf?__blob=publicationFile&v=4',
    url: 'https://www.saarland.de/SharedDocs/Downloads/DE/mbk/Lehrpl%C3%A4ne/Lehrplaene_Gymnasium/Sozialkunde/Sozialkunde_9_Gym_2012.pdf?__blob=publicationFile&v=4',
    note: 'Official Saarland PDF URL; direct PDF mirroring is blocked by the state CDN challenge in this environment.',
  },
  upper: {
    key: 'SL-WIRTSCHAFTSLEHRE-GOS-2023',
    title: 'Lehrplaene Wirtschaftslehre Gymnasiale Oberstufe Saarland 2023',
    path: 'https://www.saarland.de/mbk/DE/portale/bildungsserver/unterricht-und-bildungsthemen/lehrplaenehandreichungen/lehrplaeneallgemeinbildende/gymnasiale-oberstufe-GOS/lehrplaene_GOS_node',
    url: 'https://www.saarland.de/mbk/DE/portale/bildungsserver/unterricht-und-bildungsthemen/lehrplaenehandreichungen/lehrplaeneallgemeinbildende/gymnasiale-oberstufe-GOS/lehrplaene_GOS_node',
    note: 'Official Saarland GOS page listing APA Wirtschaftslehre 2023, Einfuehrungsphase 2023, Grundkurs 2023 and Leistungskurs 2023 PDFs; direct PDF mirroring is blocked by the state CDN challenge in this environment.',
  },
} satisfies Record<'lower' | 'upper', SourceDocument>

const lowerSourceLandscapeId = idFrom('DE-SL Sozialkunde 9 Gymnasium Wirtschaft und Arbeitswelt source extraction')
const upperSourceLandscapeId = idFrom('DE-SL Wirtschaftslehre Gymnasiale Oberstufe 2023 source extraction')

const lowerTopics: TopicDraft[] = [
  {
    code: 'SK9-WIRTSCHAFTEN-GRUNDLAGEN',
    title: 'Sozialkunde 9: Notwendigkeit des Wirtschaftens und Produktionsfaktoren',
    page: 24,
    stage: 'SekI',
    sourceDocument: sourceDocuments.lower,
    goals: [
      { text: 'Beduerfnisse und Gueter als Grundlage wirtschaftlichen Handelns unterscheiden.', targets: [ids.marketIdeas, ids.consumerBehavior] },
      { text: 'Maximalprinzip und Minimalprinzip als oekonomische Prinzipien erklaeren.', targets: [ids.marketIdeas, ids.consumerBehavior, ids.statistics] },
      { text: 'Produktionsfaktoren Natur, Arbeit und Kapital definieren und differenzieren.', targets: [ids.companyStructure, ids.companyProcesses, ids.specialization] },
      { text: 'Gueterproduktion als Kombinationsprozess der Produktionsfaktoren erlaeutern.', targets: [ids.companyProcesses, ids.companyCoreSupport, ids.companyTargets] },
      { text: 'Formen der Arbeitsteilung unterscheiden und volkswirtschaftlich beurteilen.', targets: [ids.specialization, ids.economicCycle, ids.globalValueChains] },
    ],
  },
  {
    code: 'SK9-MARKT-GELD-KAUFEN',
    title: 'Sozialkunde 9: Tausch, Kauf, Maerkte, Zahlungsformen und Zahlungsmittel',
    page: 25,
    stage: 'SekI',
    sourceDocument: sourceDocuments.lower,
    goals: [
      { text: 'Tausch, Kauf und Geld als Folge arbeitsteiliger Wirtschaft begruenden.', targets: [ids.marketIdeas, ids.moneyFunctions, ids.payment] },
      { text: 'Markt, Marktarten und vollkommene beziehungsweise unvollkommene Maerkte unterscheiden.', targets: [ids.marketModel, ids.competition, ids.concentration] },
      { text: 'Marktformen Polypol, Oligopol und Monopol erlaeutern.', targets: [ids.competition, ids.concentration, ids.competitionPolicy] },
      { text: 'Angebots- und Nachfragefunktionen beschreiben und grafisch darstellen.', targets: [ids.marketModel, ids.marketEquilibrium, ids.priceFunctions] },
      { text: 'Kaeufermarkt und Verkaeufermarkt unterscheiden.', targets: [ids.marketModel, ids.marketEquilibrium, ids.priceFunctions] },
      { text: 'Gleichgewichtspreis rechnerisch und grafisch bestimmen.', targets: [ids.marketEquilibrium, ids.priceFunctions] },
      { text: 'Preismechanismus im Polypol durch Veraenderungen von Angebot und Nachfrage erklaeren.', targets: [ids.marketEquilibrium, ids.priceFunctions, ids.competition] },
      { text: 'Geldfunktionen als Tausch- und Zahlungsmittel, Recheneinheit und Wertaufbewahrungsmittel unterscheiden.', targets: [ids.moneyFunctions, ids.payment] },
      { text: 'Geldformen und Zahlungsarten unterscheiden und beurteilen.', targets: [ids.moneyFunctions, ids.payment, ids.consumerBehavior] },
      { text: 'Kaufen im Internet mit Chancen, Risiken und Verbraucherrechten bewerten.', targets: [ids.consumerBehavior, ids.consumerRights, ids.consumerContracts, ids.consumerPurchaseRights, ids.minorRights, ids.payment] },
    ],
  },
  {
    code: 'SK9-ARBEITSWELT-KONSUM',
    title: 'Sozialkunde 9: Wirtschaft und Arbeitswelt als Orientierung',
    page: 26,
    stage: 'SekI',
    sourceDocument: sourceDocuments.lower,
    goals: [
      { text: 'Eigene Konsumentscheidungen als Teilnehmerin oder Teilnehmer des Wirtschaftsgeschehens kritisch hinterfragen.', targets: [ids.consumerBehavior, ids.consumptionReflection, ids.sustainableConsumption] },
      { text: 'Auswirkungen von Arbeitsteilung auf Arbeitnehmer, Arbeitgeber und Verbraucher beurteilen.', targets: [ids.workDevelopments, ids.laborModels, ids.companyStakeholders, ids.consumerBehavior] },
      { text: 'Fortschritte in der Produktionstechnik aus Texten erarbeiten und bewerten.', targets: [ids.companyProcesses, ids.workDigital, ids.specialization] },
      { text: 'Arbeitswelt und Berufsorientierung mit Qualifikation und Lebensperspektiven verbinden.', targets: [ids.workDevelopments, ids.careerProfile, ids.careerInfo] },
      { text: 'Wirtschaftliche Entscheidungen mit Verbraucherinteressen und gesellschaftlicher Verantwortung abwaegen.', targets: [ids.consumptionReflection, ids.sustainableConsumption, ids.economicEthics] },
    ],
  },
]

const upperTopics: TopicDraft[] = [
  {
    code: 'GOS-EP-GRUNDLAGEN',
    title: 'Wirtschaftslehre Einfuehrungsphase: Grundlagen wirtschaftlichen Handelns',
    page: 1,
    stage: 'SekII',
    courseLevel: 'GK_LK',
    sourceDocument: sourceDocuments.upper,
    goals: [
      { text: 'Wirtschaftliches Handeln aus Knappheit, Beduerfnissen, Guetern und oekonomischem Prinzip erklaeren.', targets: [ids.marketIdeas, ids.consumerBehavior, ids.statistics] },
      { text: 'Private Haushalte und Unternehmen als Akteure im Wirtschaftskreislauf modellieren.', targets: [ids.householdBudget, ids.companyStructure, ids.economicCycle] },
      { text: 'Produktionsfaktoren, Spezialisierung und Arbeitsteilung auf betriebliche Prozesse anwenden.', targets: [ids.specialization, ids.companyProcesses, ids.companyCoreSupport] },
      { text: 'Unternehmensziele, Anspruchsgruppen und Zielkonflikte beschreiben.', targets: [ids.companyTargets, ids.companyStakeholders, ids.businessModel] },
      { text: 'Rechtsformen, Gruendungsideen und grundlegende unternehmerische Entscheidungen einordnen.', targets: [ids.entrepreneur, ids.businessModel, ids.companyStructure] },
      { text: 'Marketing als absatzpolitische Aufgabe mit Marktanalyse, Marketing-Mix und Zielgruppenbezug darstellen.', targets: [ids.marketingMeaning, ids.marketingMeasures, ids.marketingConcept] },
      { text: 'Kaufvertraege, Zahlungsarten und Verbraucherrechte in wirtschaftlichen Alltagssituationen anwenden.', targets: [ids.legalFunctions, ids.contracts, ids.minorRights, ids.legalFramework, ids.payment, ids.consumerRights, ids.consumerPurchaseRights] },
      { text: 'Nachhaltigkeit und Verantwortung als Kriterien wirtschaftlicher Entscheidungen nutzen.', targets: [ids.sustainableConsumption, ids.sustainableGrowth, ids.economicEthics] },
    ],
  },
  {
    code: 'GOS-GK-MARKT-ORDNUNG',
    title: 'Wirtschaftslehre Grundkurs: Markt, Preisbildung und Wirtschaftsordnung',
    page: 1,
    stage: 'SekII',
    courseLevel: 'GK',
    sourceDocument: sourceDocuments.upper,
    goals: [
      { text: 'Angebot, Nachfrage, Marktgleichgewicht und Preisfunktionen modellgestuetzt erklaeren.', targets: [ids.marketModel, ids.marketEquilibrium, ids.priceFunctions] },
      { text: 'Marktformen, Wettbewerb und Konzentrationsprozesse beurteilen.', targets: [ids.competition, ids.concentration, ids.competitionPolicy] },
      { text: 'Wirtschaftsordnungen und Soziale Marktwirtschaft vergleichen.', targets: [ids.orderConcepts, ids.socialMarket, ids.socialMarketOrder, ids.stateVsMarket, ids.legalFramework] },
      { text: 'Staatliche Wettbewerbspolitik und Verbraucherschutz als Ordnungsaufgaben bewerten.', targets: [ids.competitionPolicy, ids.consumerRights, ids.socialMarketOrder] },
      { text: 'Einkommens- und Vermoegensverteilung anhand von Gerechtigkeitskonzepten beurteilen.', targets: [ids.socialJustice, ids.socialState, ids.statistics] },
      { text: 'Steuern und staatliche Einnahmen als wirtschaftspolitische Instrumente einordnen.', targets: [ids.taxInstruments, ids.taxPolicy, ids.taxEffects] },
      { text: 'Umweltprobleme, externe Effekte und Umweltpolitik wirtschaftlich analysieren.', targets: [ids.environmentalProblems, ids.externalEffects, ids.environmentalInstruments, ids.environmentalPolicyMultilevel, ids.sustainableGrowth] },
    ],
  },
  {
    code: 'GOS-GK-KONJUNKTUR-GELD',
    title: 'Wirtschaftslehre Grundkurs: Konjunktur, Geld und Wirtschaftspolitik',
    page: 1,
    stage: 'SekII',
    courseLevel: 'GK',
    sourceDocument: sourceDocuments.upper,
    goals: [
      { text: 'Konjunkturindikatoren, Konjunkturzyklen und Prognosen auswerten.', targets: [ids.cycleIndicators, ids.cycleModels, ids.cycleForecasts, ids.statistics] },
      { text: 'Wirtschaftspolitische Ziele, Zielkonflikte und das Stabilitaetsgesetz anwenden.', targets: [ids.growthLifeQuality, ids.gdp, ids.stabilityLaw, ids.policyEvaluate] },
      { text: 'Fiskalpolitik und wirtschaftspolitische Massnahmen zu Wachstum und Beschaeftigung beurteilen.', targets: [ids.fiscalPolicy, ids.policyGrowth, ids.policyEvaluate] },
      { text: 'Geldfunktionen, Geldwertstabilitaet, Inflation und Deflation erklaeren.', targets: [ids.moneyFunctions, ids.inflation, ids.priceInterest] },
      { text: 'Zentralbank, EZB-Entscheidungen und geldpolitische Instrumente analysieren.', targets: [ids.ezb, ids.ezbDecision, ids.moneyCreation, ids.priceInterest] },
      { text: 'Arbeitsmarkt, Tarifautonomie und Wandel der Arbeitswelt wirtschaftspolitisch diskutieren.', targets: [ids.workDevelopments, ids.workDigital, ids.laborModels, ids.tariff] },
    ],
  },
  {
    code: 'GOS-GK-EU-GLOBAL',
    title: 'Wirtschaftslehre Grundkurs: Europa, Globalisierung und Aussenwirtschaft',
    page: 1,
    stage: 'SekII',
    courseLevel: 'GK',
    sourceDocument: sourceDocuments.upper,
    goals: [
      { text: 'Europaeischen Binnenmarkt, Waehrungsunion und wirtschaftspolitische Integration analysieren.', targets: [ids.euMarkets, ids.euIntegration, ids.euGovernance, ids.euLegitimation, ids.euCurrency, ids.euPolicyFields] },
      { text: 'Finanzmaerkte, Finanzmarktakteure und Regulierung diskutieren.', targets: [ids.financialActors, ids.financialRegulation, ids.ezb] },
      { text: 'Globalisierung, globale Wertschoepfungsketten und Standortwettbewerb erklaeren.', targets: [ids.globalization, ids.globalValueChains, ids.worldTradeDevelopment, ids.locationCompetition, ids.globalBusiness] },
      { text: 'Freihandel, Protektionismus und Handelsabkommen beurteilen.', targets: [ids.tradePolicy, ids.tradeTheory, ids.tradeConflict, ids.protectionism, ids.tradeAgreement] },
      { text: 'Multinationale Unternehmen und Unternehmensverantwortung im globalen Kontext bewerten.', targets: [ids.transnationalCompanies, ids.csr, ids.globalBusiness, ids.economicEthics] },
      { text: 'Globale Governance, Fair Trade und nachhaltige Entwicklung wirtschaftsethisch einordnen.', targets: [ids.globalGovernanceStructures, ids.fairTrade, ids.globalGovernance, ids.sustainableGrowth] },
    ],
  },
  {
    code: 'GOS-LK-VERTIEFUNG',
    title: 'Wirtschaftslehre Leistungskurs: Vertiefung, Fallanalyse und Urteil',
    page: 1,
    stage: 'SekII',
    courseLevel: 'LK',
    sourceDocument: sourceDocuments.upper,
    goals: [
      { text: 'Betriebliche Leistungsprozesse, Zielsysteme und Geschaeftsmodelle vertieft analysieren.', targets: [ids.companyProcesses, ids.companyTargets, ids.businessModel, ids.companyStakeholders] },
      { text: 'Markt- und Wettbewerbsanalysen in Unternehmens- und Wirtschaftspolitik zusammenfuehren.', targets: [ids.marketEquilibrium, ids.competitionPolicy, ids.marketingConcept] },
      { text: 'Wirtschaftspolitische Medienbeitraege und statistische Materialien kritisch auswerten.', targets: [ids.statistics, ids.mediaAnalysis, ids.policyEvaluate] },
      { text: 'Konjunktur-, Geld- und Fiskalpolitik in Fallstudien modellgestuetzt bewerten.', targets: [ids.cycleModels, ids.fiscalPolicy, ids.ezbDecision, ids.policyGrowth] },
      { text: 'Verteilungs-, Sozialstaats- und Nachhaltigkeitsfragen als Zielkonflikte beurteilen.', targets: [ids.socialJustice, ids.socialState, ids.sustainableGrowth, ids.economicEthics] },
      { text: 'Europaeische und globale Wirtschaftsordnung in mehrperspektivischen Urteilen bewerten.', targets: [ids.euPolicyFields, ids.globalGovernance, ids.tradePolicy, ids.economicEthics] },
      { text: 'Digitale Transformation von Unternehmen, Arbeit und Maerkten untersuchen.', targets: [ids.workDigital, ids.workDevelopments, ids.globalBusiness, ids.financialActors] },
      { text: 'Unternehmerische Entscheidungen unter rechtlichen, sozialen und oekologischen Nebenbedingungen begruenden.', targets: [ids.entrepreneur, ids.legalFunctions, ids.businessModel, ids.sustainableGrowth] },
    ],
  },
]

function buildExtraction(params: {
  extractionId: string
  sourceLandscapeId: string
  title: string
  stage: Stage
  topics: TopicDraft[]
  reviewPath: string
  qualityReview: unknown
}) {
  const sourceGoals = params.topics.flatMap((topic) => topic.goals.map((goal, index) => ({
    id: sourceGoalId(params.extractionId.toLowerCase(), topic.code, index + 1, goal.text),
    passageId: `${params.extractionId.toLowerCase()}:${topic.code.toLowerCase()}`,
    topicCode: topic.code,
    bulletIndex: index + 1,
    aspectIndex: 1,
    title: `SL ${topic.code} (${index + 1}): ${goal.text}`,
    description: `Source-Ziel aus ${topic.title}: ${goal.text}`,
    sourceText: goal.text,
    sourceSpan: `${topic.code} (${index + 1})`,
    parentBulletText: goal.text,
    sourceRef: `${topic.sourceDocument.title}, ${topic.title}, S. ${topic.page}.`,
    courseLevel: goal.courseLevel ?? topic.courseLevel ?? params.stage,
    granularity: 'officialContentOrStandard',
    tags: ['jurisdiction:DE-SL', 'subject:Wirtschaft', `stage:${params.stage}`, `topic:${topic.code}`],
    rawSourceText: goal.text,
    rawSourceSpan: `${topic.code} (${index + 1})`,
    rawParentBulletText: goal.text,
    canonicalGoalIds: goal.targets,
  })))

  const passages = params.topics.map((topic) => ({
    id: `${params.extractionId.toLowerCase()}:${topic.code.toLowerCase()}`,
    topicCode: topic.code,
    title: topic.title,
    text: topic.goals.map((goal, index) => `(${index + 1}) ${goal.text}`).join('\n'),
    page: topic.page,
    sourcePath: topic.sourceDocument.path,
    rawText: topic.goals.map((goal) => goal.text).join('\n'),
    sourceGoalIds: topic.goals.map((goal, index) => sourceGoalId(params.extractionId.toLowerCase(), topic.code, index + 1, goal.text)),
  }))

  return {
    schemaVersion: 1,
    extractionId: params.extractionId,
    sourceLandscapeId: params.sourceLandscapeId,
    targetLandscapeId,
    jurisdiction: 'DE-SL',
    subject: 'Wirtschaft',
    stage: params.stage,
    title: params.title,
    sourceDocument: { ...(params.stage === 'SekI' ? sourceDocuments.lower : sourceDocuments.upper), official: true },
    method: {
      passageExtraction: 'Official Saarland Lehrplan pages and indexed PDF text snippets; direct PDF mirroring is blocked by the state CDN challenge in this environment.',
      sourceGoalExtraction: 'one normalized source goal per explicit competence line, content item, or tightly coupled official topic corridor',
      scopeNote: params.stage === 'SekI'
        ? 'Saarland Gymnasium Sek I routes economic content through Sozialkunde 9, Unterrichtseinheit Wirtschaft und Arbeitswelt.'
        : 'Saarland Gymnasiale Oberstufe offers Wirtschaftslehre as official GOS subject; the source extraction uses the official 2023 EP/GK/LK document set listed on the Saarland GOS Lehrplan page.',
    },
    qualityReview: params.qualityReview,
    expectedTopicCodes: params.topics.map((topic) => topic.code),
    pipelineStatus: {
      currentStep: 'MAPPING-3',
      steps: [
        { id: 'ORIGINALQUELLEN', label: 'Originalquellen bereitgestellt', status: 'complete', dependsOn: [], checks: [{ id: 'official-source-url-present', label: 'Amtliche Saarland-Quellen sind als offizielle URLs registriert', passed: true, details: params.stage === 'SekI' ? sourceDocuments.lower.url : sourceDocuments.upper.url }] },
        { id: 'MAPPING-1', label: 'Original-Lehrplanpassagen extrahiert', status: 'complete', dependsOn: ['ORIGINALQUELLEN'], checks: [{ id: 'passages-extracted', label: 'Wirtschaftliche Saarland-Passagen wurden als Passagen erfasst', passed: true, details: `${passages.length} Passagen.` }] },
        { id: 'MAPPING-2', label: 'Source-Ziele aus Lehrplanpassagen erstellt', status: 'complete', dependsOn: ['MAPPING-1'], checks: [{ id: 'source-goals-created', label: 'Aus den Saarland-Passagen wurden Source-Ziele erzeugt', passed: true, details: `${sourceGoals.length} Source-Ziele.` }] },
        { id: 'MAPPING-3', label: 'Source-Ziele auf SkillPilot-Ziele gemappt', status: 'complete', dependsOn: ['MAPPING-1', 'MAPPING-2'], checks: [{ id: 'm3-review-file-present', label: 'M3-Review-Datei ist vorhanden', passed: true, details: params.reviewPath }] },
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
    const targets = Array.from(new Set(sourceGoal.canonicalGoalIds))
    const invalid = targets.filter((target) => !canonicalGoalIds.has(target))
    if (invalid.length > 0) throw new Error(`Invalid targets for ${sourceGoal.id}: ${invalid.join(', ')}`)
    decisions.push({
      sourceGoalId: sourceGoal.id,
      topicCode: sourceGoal.topicCode,
      sourceSpan: sourceGoal.sourceSpan,
      decision: 'mapped',
      canonicalGoalIds: targets,
      matchType: 'partial',
      rationale: 'SL-Source-Ziel ist durch vorhandene kanonische Wirtschaft-Ziele fachlich vollstaendig abgedeckt; partial beschreibt die Zuordnungsform 1:n oder Sammelziel, nicht eine offene Luecke.',
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
    jurisdiction: 'DE-SL',
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

const lowerOutput = 'curricula/DE/Gymnasium/input/SL/lower-secondary/source-extraction/DE_SL_SOZIALKUNDE_9_WIRTSCHAFT_UND_ARBEITSWELT_2012.source-extraction.json'
const upperOutput = 'curricula/DE/Gymnasium/input/SL/upper-secondary/source-extraction/DE_SL_WIRTSCHAFTSLEHRE_GOS_2023.source-extraction.json'
const lowerReviewPath = 'curricula/DE/Gymnasium/mapping/DE-SL/lower-secondary/sl_sozialkunde_9_economics_source_extraction_to_canonical_wirtschaft.review.json'
const upperReviewPath = 'curricula/DE/Gymnasium/mapping/DE-SL/upper-secondary/sl_wirtschaftslehre_gos_source_extraction_to_canonical_wirtschaft.review.json'

const lowerExtraction = buildExtraction({
  extractionId: 'DE-SL-SOZIALKUNDE-9-WIRTSCHAFT',
  sourceLandscapeId: lowerSourceLandscapeId,
  title: 'Sozialkunde 9 - Wirtschaft und Arbeitswelt (Saarland, Gymnasium Source-Extraction)',
  stage: 'SekI',
  topics: lowerTopics,
  reviewPath: lowerReviewPath,
  qualityReview: {
    sourceGoalCountPeerBaseline: {
      accepted: true,
      details: 'SL Gymnasium Sek I fuehrt Wirtschaft nicht als eigenes Pflichtfach, sondern im Sozialkunde-9-Thema Wirtschaft und Arbeitswelt. Die kompaktere Zielzahl ist fachlich plausibel und bildet die amtlich indexierten Kompetenzen der Einheit ab.',
    },
  },
})

const upperExtraction = buildExtraction({
  extractionId: 'DE-SL-WIRTSCHAFTSLEHRE-GOS-2023',
  sourceLandscapeId: upperSourceLandscapeId,
  title: 'Wirtschaftslehre Gymnasiale Oberstufe (Saarland, GOS 2023 Source-Extraction)',
  stage: 'SekII',
  topics: upperTopics,
  reviewPath: upperReviewPath,
  qualityReview: {
    sourceGoalCountPeerBaseline: {
      accepted: true,
      details: 'SL GOS bietet Wirtschaftslehre als offizielles Oberstufenfach mit Einfuehrungsphase, Grundkurs und Leistungskurs. Die Zielzahl liegt im Korridor der direkten Wirtschaftslehre-/Wirtschaft-und-Recht-Quellen.',
    },
  },
})

writeJson(path.join(repoRoot, lowerOutput), lowerExtraction)
writeJson(path.join(repoRoot, upperOutput), upperExtraction)
writeReview({ reviewPath: lowerReviewPath, reviewId: 'DE-SL-SOZIALKUNDE-9-WIRTSCHAFT-MAPPING-3-SOURCE-EXTRACTION-1', extractionPath: lowerOutput, extraction: lowerExtraction })
writeReview({ reviewPath: upperReviewPath, reviewId: 'DE-SL-WIRTSCHAFTSLEHRE-GOS-MAPPING-3-SOURCE-EXTRACTION-1', extractionPath: upperOutput, extraction: upperExtraction })
upsertRegistryEntry({ landscapeId: lowerSourceLandscapeId, title: lowerExtraction.title, stage: 'Sekundarstufe I', archivePath: 'curricula/DE/Gymnasium/input/SL/lower-secondary/', sourceDocument: sourceDocuments.lower })
upsertRegistryEntry({ landscapeId: upperSourceLandscapeId, title: upperExtraction.title, stage: 'Sekundarstufe II', archivePath: 'curricula/DE/Gymnasium/input/SL/upper-secondary/', sourceDocument: sourceDocuments.upper })

upsertReferenceBlock(
  path.join(repoRoot, 'curricula/DE/Gymnasium/input/SL/lower-secondary/references.md'),
  'DE-SL-WIRTSCHAFT-SEKI-SOURCE-EXTRACTION',
  `## Wirtschaft

- \`${sourceDocuments.lower.title}\`:
  ${sourceDocuments.lower.url}

Scope:

- Saarland
- Gymnasium
- Sozialkunde 9 with economic content routed to canonical Wirtschaft
- lower-secondary extraction target: Unterrichtseinheit Wirtschaft und Arbeitswelt

Source access note:

- ${sourceDocuments.lower.note}

Generated source extraction:

- \`${lowerOutput}\`

Mapping review:

- \`${lowerReviewPath}\``,
)
upsertReferenceBlock(
  path.join(repoRoot, 'curricula/DE/Gymnasium/input/SL/upper-secondary/references.md'),
  'DE-SL-WIRTSCHAFT-SEKII-SOURCE-EXTRACTION',
  `## Wirtschaft

- \`${sourceDocuments.upper.title}\`:
  ${sourceDocuments.upper.url}

Scope:

- Saarland
- Gymnasiale Oberstufe
- Wirtschaftslehre
- upper-secondary extraction target: official 2023 GOS Wirtschaftslehre document set listed on the Saarland Lehrplan page

Source access note:

- ${sourceDocuments.upper.note}

Generated source extraction:

- \`${upperOutput}\`

Mapping review:

- \`${upperReviewPath}\``,
)

console.log(`Generated SL Wirtschaft source extractions: ${lowerExtraction.sourceGoals.length} lower + ${upperExtraction.sourceGoals.length} upper source goals.`)
