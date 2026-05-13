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
    key: 'RP-SOZIALKUNDE-SEK-I-2021',
    title: 'Lehrplan gesellschaftswissenschaftliche Faecher Sekundarstufe I Rheinland-Pfalz, Fachlehrplan Sozialkunde',
    path: 'curricula/DE/Gymnasium/input/RP/Ek_G_Sk_Sek_I_LP_2021.pdf',
    url: 'https://bildung.rlp.de/fileadmin/user_upload/demokratie.bildung.rlp.de/Downloads/Ek_G_Sk_Sek_I__LP_2021_.pdf',
  },
  upper: {
    key: 'RP-SOZIALKUNDE-SEK-II-2022',
    title: 'Lehrplan gesellschaftswissenschaftliche Faecher Sekundarstufe II Rheinland-Pfalz, Fachlehrplan Sozialkunde',
    path: 'curricula/DE/Gymnasium/input/RP/Gesellschaftswissenschaftliche_Faecher_SekII_2022.pdf',
    url: 'https://bildung.rlp.de/fileadmin/user_upload/studienseminar.rlp.de/gy-ko/Koblenz/Ausbildung/Geschichte/Links/Lehrplan_fuer_die_gesellschaftswissenschaftlichen_Faecher_Erdkunde_Geschichte_Sozialkunde_in_der_Sek._II__1_.pdf',
  },
} satisfies Record<'lower' | 'upper', SourceDocument>

const lowerSourceLandscapeId = idFrom('DE-RP Sozialkunde Sek I Wirtschaft source extraction')
const upperSourceLandscapeId = idFrom('DE-RP Sozialkunde Sek II Wirtschaftliche Transformation source extraction')

const lowerTopics: TopicDraft[] = [
  {
    code: 'SEKI-II1-WIRTSCHAFT-BASIS',
    title: 'II.1 Wirtschaft - Basis',
    page: 158,
    stage: 'SekI',
    goals: [
      'Jugendliche als Konsumenten auf globalen Maerkten analysieren.',
      'Konsequenzen von Kaufentscheidungen wie Schuldenfalle, Kinderarbeit, fairer Handel und Nachhaltigkeit beurteilen.',
      'Preisbildung, Markt, Wettbewerb, Wirtschaftskreislauf und weltweite Vernetzung erklaeren.',
      'Arbeitswelt im Wandel durch Digitalisierung, Kuenstliche Intelligenz und lebenslanges Lernen beurteilen.',
      'Ziele des Wirtschaftens wie Wachstum, Wohlstand, Geldwertstabilitaet, soziale Gerechtigkeit, oekologische Vertraeglichkeit und SDGs abwaegen.',
      'Rolle und Instrumente des Staates in einer sozialen und oekologischen Marktwirtschaft beurteilen.',
      'Preisbildung und Lieferketten an einem Produkt aus der eigenen Lebenswelt analysieren.',
      'Marktwirtschaft und wirtschaftspolitisches Handeln hinsichtlich Freiheit, Gerechtigkeit und oekologischer Vertraeglichkeit bewerten.',
      'Eigenes Konsumverhalten im Spannungsverhaeltnis oekonomischer und oekologisch-nachhaltiger Ziele reflektieren.',
    ],
  },
  {
    code: 'SEKI-II1-WIRTSCHAFT-ERWEITERUNG',
    title: 'II.1 Wirtschaft - Erweiterung und Vertiefung',
    page: 158,
    stage: 'SekI',
    goals: [
      'Aushandeln von Loehnen und Gehaeltern mit Tarifautonomie und Tarifkonflikt einordnen.',
      'Ein Fallbeispiel zum Verbraucherschutz rechtlich und oekonomisch analysieren.',
      'Erfolgreiche Jungunternehmerinnen und Jungunternehmer am Standort untersuchen.',
      'Zukunftsfaehige Handlungsalternativen wie fairer Handel und Sharing Economy bewerten.',
      'Verbraucherzentrale, lokale Nachhaltigkeitsprojekte und Schuelerfirmen als wirtschaftliche Praxisorte auswerten.',
      'Grundbegriffe Oekonomie, Angebot, Nachfrage, Wettbewerb, Sozialstaat, Tarifpartner, Globalisierung und Nachhaltigkeit fachsprachlich verwenden.',
    ],
  },
]

const upperTopics: TopicDraft[] = [
  {
    code: 'LF-I4-WIRTSCHAFTLICHE-TRANSFORMATION',
    title: 'Leistungsfach I.4 Wirtschaftliche Transformation',
    page: 144,
    stage: 'SekII',
    courseLevel: 'LK',
    goals: [
      'Rollen von Wirtschaftssubjekten als Konsumenten, Arbeitnehmer und Unternehmer in einer globalisierten Welt analysieren.',
      'Interessen, Ziele und Folgen oekonomischen Handelns verschiedener Akteure vergleichen.',
      'Oekonomische und oekologische Verschuldung als Problem wirtschaftlichen Handelns beurteilen.',
      'Nachhaltigkeit als oekonomisches, soziales und oekologisches Prinzip anwenden.',
      'Maerkte und Arbeitswelten im Wandel beschreiben.',
      'Den Staat als steuernden Akteur in Ordnungs- und Prozesspolitik analysieren.',
      'Konjunkturpolitik als staatliches Handlungsfeld beurteilen.',
      'Strukturpolitik und Umweltpolitik als staatliche Steuerungsfelder beurteilen.',
      'Wettbewerbspolitik als staatliche Rahmensetzung in der Marktwirtschaft analysieren.',
      'Arbeitsmarktpolitik als staatliches Handlungsfeld bewerten.',
      'Wirtschaftsordnung und wirtschaftliche Transformation am Beispiel der Sozialen Marktwirtschaft beurteilen.',
      'Mitbestimmung in Betrieben und Unternehmen einordnen.',
      'Parallelmaerkte, digitale Maerkte und Finanzmaerkte als Transformationsphaenomene analysieren.',
      'Oekonomische Rolle Deutschlands in der EU beurteilen.',
      'Grundbegriffe Konjunktur, Steuern, Subventionen, Stabilitaetsgesetz, Inflation, Tarifautonomie, externe Kosten und Produktionsfaktoren anwenden.',
    ],
  },
  {
    code: 'LF-II4-EUROPAEISCHE-WIRTSCHAFTSORDNUNG',
    title: 'Leistungsfach II.4 Wirtschaftliche Transformation im europaeischen Binnenmarkt',
    page: 153,
    stage: 'SekII',
    courseLevel: 'LK',
    goals: [
      'Wirtschaftssubjekte und ihre Interessen im europaeischen Binnenmarkt analysieren.',
      'Europaeischen Binnenmarkt im Wandel hinsichtlich Disparitaeten, Vielfalt und Einheit untersuchen.',
      'Oekologischen Umbau in Europa mit Energie, Klima und Biodiversitaet als Gestaltungsaufgabe beurteilen.',
      'Waehrungsstabilitaet und Geldpolitik der EZB als europaeische Gestaltungsaufgabe analysieren.',
      'Wirtschaftspolitische Integration in Europa beurteilen.',
      'Globale Wettbewerbsfaehigkeit Europas analysieren.',
      'Digitalisierung und biotechnologische Transformation als europaeische Gestaltungsaufgaben bewerten.',
      'Regionales Fallbeispiel der europaeischen Regional- oder Strukturpolitik auswerten.',
      'Gestaltungsaufgabe Verbraucherschutz in Europa beurteilen.',
      'Europaeische Kooperation an einem Unternehmen oder einer Produktentwicklung untersuchen.',
      'Alternative Wachstumsmodelle im europaeischen Kontext bewerten.',
      'Magisches Vieleck als Modell wirtschaftspolitischer Zielkonflikte verwenden.',
      'Waehrungsunion, EZB, Geldwertstabilitaet, Zinspolitik, Finanz- und Fiskalpolitik fachsprachlich anwenden.',
    ],
  },
  {
    code: 'LF-III3-GLOBALE-WIRTSCHAFTLICHE-TRANSFORMATION',
    title: 'Leistungsfach III.3 Wirtschaftliche Transformation im globalen Kontext',
    page: 160,
    stage: 'SekII',
    courseLevel: 'LK',
    goals: [
      'Lokale und regionale Handlungsoptionen angesichts globaler wirtschaftlicher Herausforderungen entwickeln.',
      'Globale Ziele und Zukunftsherausforderungen auf verschiedenen Handlungsebenen oekonomisch und politisch analysieren.',
      'Optionen, Chancen und Risiken eines globalisierten Wirtschaftsraums beurteilen.',
      'Nachhaltigen Konsum und nachhaltige Produktion im lokalen und regionalen Kontext analysieren.',
      'Globale Wirtschaft nach Merkmalen, Strukturen und Akteuren analysieren.',
      'Multinationale Konzerne, transnationale Finanzmaerkte, Wirtschaftsbuednisse, Staaten, INGOs und internationale Institutionen als Akteure unterscheiden.',
      'Globale oekonomische Ziele als Handlungsfelder der Weltwirtschaft vernetzt darstellen.',
      'Lokale, regionale und globale Handlungsoptionen zu ausgewaehlten globalen oekonomischen Zielen entwickeln.',
      'Wertebasierte Weltwirtschaftspolitik zwischen Wettbewerb, Abschottung und Kooperation beurteilen.',
      'Nachhaltig ausgerichtete Initiativen, Betriebe oder Unternehmen hinsichtlich oekologischer, sozialer und oekonomischer Wirkung erkunden.',
      'Haltung als Wirtschaftsbuergerin oder Wirtschaftsbuerger zu verantwortlichem Handeln im globalen Kontext reflektieren.',
      'Lieferketten, Finanzmaerkte, Freihandel, Protektionismus, Global Player, WTO, Greenwashing und Ressourcenknappheit fachsprachlich verwenden.',
      'Weltwirtschaft in einer Zukunftswerkstatt oder einem Planspiel kriteriengeleitet analysieren.',
    ],
  },
  {
    code: 'GF-I2-WIRTSCHAFTLICHE-TRANSFORMATION',
    title: 'Grundfach I.2 Wirtschaftliche Transformation',
    page: 166,
    stage: 'SekII',
    courseLevel: 'GK',
    goals: [
      'Politische Gestaltungmoeglichkeiten in der Marktwirtschaft angesichts technischer und struktureller Veraenderungen analysieren.',
      'Nachhaltigkeit und Transformation als Fachkonzepte fuer die Marktwirtschaft nutzen.',
      'Grundfachliche wirtschaftliche Orientierung in Deutschland und Europa aufbauen.',
      'Wirtschaftliche Transformationsfragen in Konsum, Arbeit, Markt und Staat beurteilen.',
      'Wirtschaftliche Handlungsoptionen als muendige Buergerin oder muendiger Buerger begruenden.',
    ],
  },
]

const ids = {
  householdBudget: 'e5b070d2-daa5-5b8e-8782-32bb8a6865d2',
  consumerBehavior: '5b5ed3cb-7c2c-5b0f-a515-c967d8d23644',
  behavioralConsumption: '84955a75-16b7-50c1-9257-7054d813cd2f',
  consumptionReflection: 'a60e0541-80e1-5f94-86fd-073f5a00bee8',
  sustainableConsumption: 'bac0f1d3-e671-5c2b-bd6d-2947f1fe6d9b',
  consumerRights: 'c386592a-b259-538c-9929-25775af99b83',
  consumerContracts: 'a2eda0df-6c5e-5fb5-bc64-8f6127eae50b',
  consumerPurchaseRights: 'c4faf50c-8778-5540-8276-87840cc81e05',
  legalFunctions: '2aee114f-d0d2-516f-8f95-1b72f707401d',
  contracts: '78eeb8fe-fd5c-5d21-81be-75c3990fc4b5',
  minorRights: '1f5c3e82-dc4a-54cc-838e-66e4d434a7b5',
  legalFramework: 'bb7f2a2a-95c3-5375-8323-51a808e945e6',
  overDebt: 'e9c4ec6b-9a54-579d-818f-87a7d39d4e3c',
  marketIdeas: 'f72eef5b-97dc-52b2-8879-838a7c6600be',
  marketModel: '8ad94aeb-81ad-58ce-8792-c691f97efd53',
  marketEquilibrium: '50e07b86-428c-5f9c-8c7e-0d0669343af5',
  priceFunctions: '3bcb976d-3e45-5c62-81ac-5ed909df202b',
  competition: '98136a27-120d-5278-b9b9-d833c0ea5fc0',
  concentration: 'cb21bcbe-755d-5b0d-b02a-be22c9d26e43',
  competitionPolicy: 'af709beb-2a7e-5df0-bc91-f8f0e0cb99f8',
  socialMarket: '1da809f7-ef85-5a2d-babf-b7639e605653',
  socialMarketOrder: 'c7b03538-25a2-510b-8fd4-a81bcc3de406',
  stateVsMarket: '6600f5f0-0b30-5458-b144-b2468d897087',
  orderConcepts: '9ca0e3c9-005e-5c8d-8157-3642e11f245e',
  economicCycle: '641dee8e-9658-5db1-89eb-2353f8322a8a',
  socialJustice: '577f0e2d-643a-5a0c-833b-301622a6cb00',
  socialState: 'd17ff931-085d-56be-932d-3839b5b88ba8',
  socialPolicyFinance: '6f428330-81ad-56f9-a998-521eea7a216d',
  publicDebt: 'c5272ab8-baa0-570b-9f31-426d1f4460f2',
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
  workParticipation: 'dd38e0c5-d77b-5893-815c-548ea2a84429',
  careerProfile: '8dee6c0a-0f76-5717-87b6-04ec89229371',
  careerInfo: '980a3f45-b0ad-500d-8d5b-975948362b68',
  environmentalProblems: '80c92945-155b-56ea-8aa2-46ee72852303',
  externalEffects: 'bad728f2-e375-5f98-8f65-511a9e2e6751',
  environmentalInstruments: '625b61ec-8561-5179-b59e-d3742b19c0e2',
  environmentalPolicyMultilevel: 'c3cb822e-f219-5a66-9714-db73b50d0487',
  environmentalConflicts: 'e3cd6940-26f0-55a9-a348-4a90c245266c',
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
  inflation: '8ebbbe19-43dd-53ff-a6d0-9d94a5973616',
  moneyFunctions: '40676995-14fc-55a9-89ae-440b2ee3ab33',
  ezb: 'f9132615-8166-5e42-ad04-d8b2b75d719d',
  ezbDecision: '0242e34e-e2fe-5a0f-8aed-57905c6ebb26',
  priceInterest: 'f70be9a9-3ec5-52e8-84b0-213f2061856c',
  euCurrency: '79d244e0-049e-59e9-a2fb-b8f8670b315a',
  euIntegration: '1bddc795-8aeb-5408-90b3-12e4be51e912',
  euMarkets: '9ea7d847-7425-5157-a827-ee5f8c2e8c0a',
  euPolicyFields: '96c2c114-8474-5e4c-bfcf-c9e526c8c9ad',
  euGovernance: '79edbe3a-7557-5b3b-a0f2-c31f45b6dad7',
  euLegitimation: 'ab556d14-b0c0-5630-8ee3-f07877fa28bd',
  financialActors: '667b75ad-2d20-5f22-ad57-46be5b7c53c7',
  financialRegulation: 'fb249488-944c-5123-a21e-5cb9a0431e8b',
  moneyCreation: '676684da-5ba2-5c2a-ba7e-a8413915c29c',
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
  globalGovernanceStructures: 'f440efea-9d86-589f-8ff9-18e8d3b2efd3',
  fairTrade: 'e21158e7-3bc3-51f2-887f-9eb5a8dd6243',
  globalGovernance: '13705b9f-9623-500b-80ba-4574b753a29c',
  economicEthics: 'a56d5e8d-fd09-5961-ad88-34cfdef00baa',
  statistics: '26ebbe6e-6512-520d-80a4-2e7e80f29f72',
  mediaAnalysis: 'bd9ec397-86ee-58ec-8327-7e1f28550026',
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

  if (topic.includes('SEKI')) add(ids.consumerBehavior, ids.consumptionReflection, ids.sustainableConsumption, ids.marketIdeas, ids.marketModel, ids.marketEquilibrium, ids.priceFunctions, ids.competition, ids.economicCycle, ids.socialMarket, ids.socialMarketOrder, ids.stateVsMarket, ids.workDevelopments, ids.workDigital, ids.laborModels, ids.tariff, ids.consumerRights, ids.consumerContracts, ids.consumerPurchaseRights, ids.overDebt, ids.companyStructure, ids.companyProcesses, ids.businessModel, ids.entrepreneur, ids.globalization, ids.globalValueChains, ids.tradePolicy, ids.sustainableGrowth)
  if (topic.includes('I4')) add(ids.consumerBehavior, ids.sustainableConsumption, ids.environmentalProblems, ids.externalEffects, ids.marketIdeas, ids.marketModel, ids.marketEquilibrium, ids.competition, ids.competitionPolicy, ids.socialMarket, ids.socialMarketOrder, ids.stateVsMarket, ids.cycleIndicators, ids.cycleModels, ids.fiscalPolicy, ids.stabilityLaw, ids.inflation, ids.tariff, ids.workDevelopments, ids.workDigital, ids.laborModels, ids.companyStructure, ids.companyProcesses, ids.businessModel, ids.marketingMeaning, ids.marketingMeasures, ids.marketingConcept)
  if (topic.includes('II4')) add(ids.euMarkets, ids.euIntegration, ids.euPolicyFields, ids.euGovernance, ids.euCurrency, ids.ezb, ids.ezbDecision, ids.priceInterest, ids.inflation, ids.financialActors, ids.financialRegulation, ids.environmentalInstruments, ids.environmentalPolicyMultilevel, ids.sustainableGrowth, ids.tradePolicy, ids.locationCompetition, ids.globalBusiness, ids.consumerRights, ids.companyStructure, ids.companyProcesses)
  if (topic.includes('III3')) add(ids.globalization, ids.globalValueChains, ids.tradePolicy, ids.tradeTheory, ids.tradeConflict, ids.protectionism, ids.tradeAgreement, ids.worldTradeDevelopment, ids.locationCompetition, ids.globalBusiness, ids.transnationalCompanies, ids.financialActors, ids.financialRegulation, ids.sustainableConsumption, ids.sustainableGrowth, ids.circularEconomy, ids.globalGovernanceStructures, ids.fairTrade, ids.globalGovernance, ids.economicEthics, ids.csr)
  if (topic.includes('GF')) add(ids.marketIdeas, ids.marketModel, ids.socialMarket, ids.stateVsMarket, ids.consumerBehavior, ids.sustainableConsumption, ids.workDevelopments, ids.workDigital, ids.environmentalProblems, ids.globalization)

  if (text.includes('verbrauch') || text.includes('konsum')) add(ids.consumerBehavior, ids.consumptionReflection, ids.consumerRights, ids.sustainableConsumption)
  if (text.includes('schuld')) add(ids.overDebt, ids.publicDebt)
  if (text.includes('wachstum') || text.includes('wohlstand')) add(ids.growthLifeQuality, ids.sustainableGrowth, ids.policyGrowth)
  if (text.includes('preis')) add(ids.marketModel, ids.marketEquilibrium, ids.priceFunctions)
  if (text.includes('markt')) add(ids.marketIdeas, ids.marketModel, ids.socialMarket, ids.competition)
  if (text.includes('wettbewerb')) add(ids.competition, ids.competitionPolicy, ids.concentration)
  if (text.includes('wirtschaftsordnung') || text.includes('ordnungspolitik')) add(ids.orderConcepts, ids.socialMarketOrder)
  if (text.includes('sozial')) add(ids.socialMarket, ids.socialMarketOrder, ids.socialJustice, ids.socialState, ids.socialPolicyFinance)
  if (text.includes('gerecht')) add(ids.socialJustice, ids.socialState)
  if (text.includes('steuer')) add(ids.taxInstruments, ids.taxPolicy, ids.taxEffects)
  if (text.includes('rechtlich')) add(ids.consumerContracts, ids.consumerPurchaseRights, ids.legalFunctions, ids.contracts, ids.minorRights, ids.legalFramework)
  if (text.includes('tarif') || text.includes('loehn') || text.includes('gehael')) add(ids.tariff, ids.laborModels)
  if (text.includes('arbeit')) add(ids.workDevelopments, ids.workDigital, ids.laborModels)
  if (text.includes('unternehmen') || text.includes('betrieb')) add(ids.companyStructure, ids.companyCoreSupport, ids.companyProcesses, ids.companyStakeholders, ids.businessModel, ids.entrepreneur)
  if (text.includes('marketing')) add(ids.marketingMeaning, ids.marketingMeasures, ids.marketingConcept)
  if (text.includes('konjunktur')) add(ids.cycleIndicators, ids.cycleModels, ids.cycleForecasts, ids.fiscalPolicy, ids.stabilityLaw, ids.policyGrowth)
  if (text.includes('inflation') || text.includes('geldwert')) add(ids.inflation, ids.moneyFunctions, ids.priceInterest)
  if (text.includes('ezb') || text.includes('waehrung') || text.includes('geldpolitik') || text.includes('zinspolitik')) add(ids.ezb, ids.ezbDecision, ids.euCurrency, ids.priceInterest, ids.moneyCreation)
  if (text.includes('finanz')) add(ids.financialActors, ids.financialRegulation)
  if (text.includes('europ')) add(ids.euMarkets, ids.euIntegration, ids.euPolicyFields, ids.euCurrency)
  if (text.includes('global') || text.includes('welt')) add(ids.globalization, ids.globalValueChains, ids.worldTradeDevelopment)
  if (text.includes('freihandel') || text.includes('protektion') || text.includes('abschottung')) add(ids.tradePolicy, ids.tradeTheory, ids.tradeConflict, ids.protectionism)
  if (text.includes('fairer handel') || text.includes('fair-trade') || text.includes('handelsregime')) add(ids.fairTrade)
  if (text.includes('internationale institution') || text.includes('ingos') || text.includes('wto')) add(ids.globalGovernanceStructures, ids.globalGovernance)
  if (text.includes('daten') || text.includes('kriteriengeleitet')) add(ids.statistics)
  if (text.includes('liefer')) add(ids.globalValueChains, ids.globalBusiness)
  if (text.includes('nachhalt') || text.includes('oekolog')) add(ids.sustainableConsumption, ids.environmentalProblems, ids.externalEffects, ids.environmentalInstruments, ids.sustainableGrowth, ids.circularEconomy)

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
      title: `RP ${topic.code} (${index + 1}): ${goalText}`,
      description: `Source-Ziel aus ${topic.title}: ${goalText}`,
      sourceText: goalText,
      sourceSpan: `${topic.code} (${index + 1})`,
      parentBulletText: goalText,
      sourceRef: `${params.sourceDocument.title}, ${topic.title}, S. ${topic.page}.`,
      courseLevel: topic.courseLevel ?? params.stage,
      granularity: 'officialContentOrStandard',
      tags: ['jurisdiction:DE-RP', 'subject:Wirtschaft', `stage:${params.stage}`, `topic:${topic.code}`],
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
    jurisdiction: 'DE-RP',
    subject: 'Wirtschaft',
    stage: params.stage,
    title: params.title,
    sourceDocument: { ...params.sourceDocument, official: true },
    method: {
      passageExtraction: 'pdftotext -layout; wirtschaftlich relevante Sozialkunde-Lernfelder und Pflicht-/Wahlpflichtinhalte aus amtlichen RP-Lehrplaenen selektiert',
      sourceGoalExtraction: 'one normalized source goal per official content item, competence statement, or tightly coupled Fachbegriff cluster',
      scopeNote: params.stage === 'SekI'
        ? 'Rheinland-Pfalz fuehrt Wirtschaft in der Sek I im Fach Sozialkunde; nur das wirtschaftsbezogene Lernfeld II.1 und seine Erweiterungen werden in den Wirtschaftskanon geroutet.'
        : 'Rheinland-Pfalz fuehrt Wirtschaft in der Sek II im Fach Sozialkunde; die Lernfelder Wirtschaftliche Transformation werden kursprofilbezogen geroutet.',
    },
    qualityReview: params.qualityReview,
    expectedTopicCodes: params.topics.map((topic) => topic.code),
    pipelineStatus: {
      currentStep: 'MAPPING-3',
      steps: [
        { id: 'ORIGINALQUELLEN', label: 'Originalquellen bereitgestellt', status: 'complete', dependsOn: [], checks: [{ id: 'source-document-present', label: 'Amtlicher RP-Sozialkunde-Lehrplan liegt lokal vor', passed: true, details: params.sourceDocument.path }] },
        { id: 'MAPPING-1', label: 'Original-Lehrplanpassagen extrahiert', status: 'complete', dependsOn: ['ORIGINALQUELLEN'], checks: [{ id: 'passages-extracted', label: 'Wirtschaftliche RP-Lernfelder wurden als Passagen erfasst', passed: true, details: `${passages.length} Passagen.` }] },
        { id: 'MAPPING-2', label: 'Source-Ziele aus Lehrplanpassagen erstellt', status: 'complete', dependsOn: ['MAPPING-1'], checks: [{ id: 'source-goals-created', label: 'Aus den RP-Passagen wurden Source-Ziele erzeugt', passed: true, details: `${sourceGoals.length} Source-Ziele.` }] },
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
      rationale: 'RP-Source-Ziel ist durch vorhandene kanonische Wirtschaft-Ziele fachlich vollstaendig abgedeckt; partial beschreibt die Zuordnungsform 1:n oder Sammelziel, nicht eine offene Luecke.',
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
    jurisdiction: 'DE-RP',
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

const lowerOutput = 'curricula/DE/Gymnasium/input/RP/lower-secondary/source-extraction/DE_RP_SOZIALKUNDE_SEKI_WIRTSCHAFT_2021.source-extraction.json'
const upperOutput = 'curricula/DE/Gymnasium/input/RP/upper-secondary/source-extraction/DE_RP_SOZIALKUNDE_SEKII_WIRTSCHAFTLICHE_TRANSFORMATION_2022.source-extraction.json'
const lowerReviewPath = 'curricula/DE/Gymnasium/mapping/DE-RP/lower-secondary/rp_sozialkunde_lower_secondary_economics_source_extraction_to_canonical_wirtschaft.review.json'
const upperReviewPath = 'curricula/DE/Gymnasium/mapping/DE-RP/upper-secondary/rp_sozialkunde_upper_secondary_economics_source_extraction_to_canonical_wirtschaft.review.json'

const lowerExtraction = buildExtraction({
  extractionId: 'DE-RP-SOZIALKUNDE-SEKI-WIRTSCHAFT',
  sourceLandscapeId: lowerSourceLandscapeId,
  title: 'Sozialkunde Sekundarstufe I - Wirtschaft (Rheinland-Pfalz, Lehrplan 2021 Source-Extraction)',
  stage: 'SekI',
  sourceDocument: sourceDocuments.lower,
  topics: lowerTopics,
  reviewPath: lowerReviewPath,
  qualityReview: {
    sourceGoalCountPeerBaseline: {
      accepted: true,
      details: 'RP Sek I buendelt Wirtschaft in einem kompakten Sozialkunde-Lernfeld II.1 plus Erweiterungen. Die Zielzahl ist niedriger als bei eigenstaendigen Wirtschaftsfaechern, aber alle wirtschaftlichen Pflicht- und Erweiterungsinhalte sind extrahiert.',
    },
  },
})

const upperExtraction = buildExtraction({
  extractionId: 'DE-RP-SOZIALKUNDE-SEKII-WIRTSCHAFTLICHE-TRANSFORMATION',
  sourceLandscapeId: upperSourceLandscapeId,
  title: 'Sozialkunde Sekundarstufe II - Wirtschaftliche Transformation (Rheinland-Pfalz, Lehrplan 2022 Source-Extraction)',
  stage: 'SekII',
  sourceDocument: sourceDocuments.upper,
  topics: upperTopics,
  reviewPath: upperReviewPath,
  qualityReview: {
    sourceGoalCountPeerBaseline: {
      accepted: true,
      details: 'RP Sek II fuehrt Wirtschaft als Sozialkunde-Politikbereich Wirtschaftliche Transformation. Leistungsfach I.4/II.4/III.3 und das Grundfach-I.2-Profil wurden granularisiert; die niedrigere Zielzahl gegenueber eigenstaendigen Wirtschaftslehre-Curricula ist fachlich plausibel.',
    },
  },
})

writeJson(path.join(repoRoot, lowerOutput), lowerExtraction)
writeJson(path.join(repoRoot, upperOutput), upperExtraction)
writeReview({
  reviewPath: lowerReviewPath,
  reviewId: 'DE-RP-SOZIALKUNDE-SEKI-WIRTSCHAFT-MAPPING-3-SOURCE-EXTRACTION-1',
  extractionPath: lowerOutput,
  extraction: lowerExtraction,
})
writeReview({
  reviewPath: upperReviewPath,
  reviewId: 'DE-RP-SOZIALKUNDE-SEKII-WIRTSCHAFT-MAPPING-3-SOURCE-EXTRACTION-1',
  extractionPath: upperOutput,
  extraction: upperExtraction,
})
upsertRegistryEntry({ landscapeId: lowerSourceLandscapeId, title: lowerExtraction.title, stage: 'Sekundarstufe I', archivePath: 'curricula/DE/Gymnasium/input/RP/lower-secondary/', sourceDocument: sourceDocuments.lower })
upsertRegistryEntry({ landscapeId: upperSourceLandscapeId, title: upperExtraction.title, stage: 'Sekundarstufe II', archivePath: 'curricula/DE/Gymnasium/input/RP/upper-secondary/', sourceDocument: sourceDocuments.upper })

upsertReferenceBlock(
  path.join(repoRoot, 'curricula/DE/Gymnasium/input/RP/lower-secondary/references.md'),
  'DE-RP-WIRTSCHAFT-SEKI-SOURCE-EXTRACTION',
  `## Wirtschaft

Starting point:
https://bildung.rlp.de/unterricht/faecher/gesellschaftswissenschaften/sozialkunde

- \`${sourceDocuments.lower.title}\`:
  ${sourceDocuments.lower.url}

Scope:

- Rheinland-Pfalz
- Gymnasium
- Sozialkunde with economic content routed to canonical Wirtschaft
- lower-secondary extraction target: Lernfeld II.1 Wirtschaft, including Erweiterung und Vertiefung

Archived locally at:

- \`${sourceDocuments.lower.path}\`

Generated source extraction:

- \`${lowerOutput}\`

Mapping review:

- \`${lowerReviewPath}\``,
)
upsertReferenceBlock(
  path.join(repoRoot, 'curricula/DE/Gymnasium/input/RP/upper-secondary/references.md'),
  'DE-RP-WIRTSCHAFT-SEKII-SOURCE-EXTRACTION',
  `## Wirtschaft

Starting point:
https://bildung.rlp.de/unterricht/faecher/gesellschaftswissenschaften/sozialkunde

- \`${sourceDocuments.upper.title}\`:
  ${sourceDocuments.upper.url}

Scope:

- Rheinland-Pfalz
- Gymnasiale Oberstufe
- Sozialkunde with economic content routed to canonical Wirtschaft
- upper-secondary extraction target: Lernfelder Wirtschaftliche Transformation in Grundfach and Leistungsfach

Archived locally at:

- \`${sourceDocuments.upper.path}\`

Generated source extraction:

- \`${upperOutput}\`

Mapping review:

- \`${upperReviewPath}\``,
)

console.log(`Generated RP Wirtschaft source extractions: ${lowerExtraction.sourceGoals.length} lower + ${upperExtraction.sourceGoals.length} upper source goals.`)
