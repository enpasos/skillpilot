import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import path from 'node:path'

type Goal = {
  id: string
  title?: string
  titleEn?: string
  description?: string
  descriptionEn?: string
  weight?: number
  tags?: string[]
  contains?: string[]
  requires?: string[]
  sourceRef?: string
  dimensionTags?: {
    framework?: string
    demandLevel?: string
    processCompetencies?: string[]
    guidingIdeas?: string[]
    phase?: string
  }
  applicability?: {
    jurisdiction?: string[]
  }
  extendedData?: {
    provenance?: {
      sourceLandscapeId?: string
      sourceLandscapeTitle?: string
      sourceGoalId?: string
    }
  }
  type?: string
}

type Landscape = {
  goals: Goal[]
}

type SupplementDraft = {
  sourceGoalId: string
  title: string
  description: string
  requires: string[]
  clusterId?: string
  guidingIdeas?: string[]
  sourceRef?: string
  phase?: string
}

const appRoot = process.cwd()
const repoRoot = path.resolve(appRoot, '..')
const canonicalPath = path.resolve(repoRoot, 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json')
const rootClusterId = '96183c48-b499-54d7-8530-578f6ff40207'
const consumerClusterId = 'f14dcf9f-66c5-5907-9e06-08f59a9a0e13'
const consumerBehaviorId = '5b5ed3cb-7c2c-5b0f-a515-c967d8d23644'
const socialMarketGoalId = '1da809f7-ef85-5a2d-babf-b7639e605653'
const foreignTradePolicyGoalId = '40f72858-337d-5f96-973d-e8041c112b12'
const sourceLandscapeId = '4959d7df-e430-5c1d-bb7b-873d6252a27f'
const sourceLandscapeTitle = 'Wirtschaft und Recht (Gymnasium)'

const uuidFromString = (value: string): string => {
  const hex = createHash('sha1').update(value).digest('hex').slice(0, 32)
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`
}

const canonicalGoalId = (sourceGoalId: string): string =>
  uuidFromString(`canonical-gymnasium-economics:DE-BY:${sourceGoalId}`)

const phaseForDraft = (draft: SupplementDraft): string => {
  if (draft.phase) return draft.phase
  if (draft.sourceRef?.includes('J13')) return 'Q3'
  if (draft.sourceRef?.includes('J12')) return 'Q2'
  if (draft.sourceRef?.includes('J11')) return 'Q1'
  return 'E'
}

const entrepreneurshipClusterId = canonicalGoalId('J8-J9-unternehmerisch-denken-und-entscheiden')
const paymentGoalId = canonicalGoalId('c542a2cd-204d-5c5b-8abb-578f3f14dd01')
const budgetGoalId = canonicalGoalId('a4ea8ae4-056e-5cc2-b736-00809bb3369b')
const divisionOfLaborGoalId = canonicalGoalId('a8b0cec5-d0e2-530c-8484-fd90562da6fd')
const companyStructureGoalId = canonicalGoalId('2f642332-2914-5736-999b-e695a728fe15')
const businessProcessesGoalId = canonicalGoalId('d3aded8a-9c6c-5275-b349-69666f0611a6')
const marketingImportanceGoalId = canonicalGoalId('88facb62-98c7-5c8c-8edd-9cd9c84f7a1e')
const marketingMeasuresGoalId = canonicalGoalId('795cf371-65a3-5775-9c03-a1e83ac12b1d')
const marketingConceptGoalId = canonicalGoalId('40ba994b-0129-53db-bda1-0b9c71879d36')
const legalClusterId = canonicalGoalId('J8-rechtlich-verantwortliches-handeln')
const legalFunctionsGoalId = canonicalGoalId('4f66392b-a818-56c4-8d30-f6a543dbe89e')
const civilCriminalCasesGoalId = canonicalGoalId('089de811-249b-502e-a941-ea5ec7be0652')
const legalConsequencesGoalId = canonicalGoalId('9e36343d-0908-5fac-beae-9cdc1af11468')
const safeInternetGoalId = canonicalGoalId('d0c38d56-8d30-5aa8-9d5f-0f36435b5070')
const intellectualRightsGoalId = canonicalGoalId('c3911589-7f5c-5263-a10b-d45912702ba9')
const privateHouseholdPracticeGoalId = canonicalGoalId('76d2efd3-a767-5106-9cc3-6adf180ad8f6')
const enterprisePracticeGoalId = canonicalGoalId('3f9f7357-c9cc-5070-9b4a-da8995deb02e')
const legalPracticeGoalId = canonicalGoalId('981a4616-9069-5f2f-a33b-b9e52e85651f')
const contractConsequencesGoalId = canonicalGoalId('3138849d-e24c-5463-979f-1aa1d5d48d08')
const limitedCapacityGoalId = canonicalGoalId('864f1592-c03e-51eb-9802-d4a2551ef194')
const consumerRightsGoalId = canonicalGoalId('1cd3d05d-7e9c-5900-87d0-c64bfd4a383f')
const legalNormApplicationGoalId = canonicalGoalId('369807d1-ecd5-5fed-873a-7fe1f885925c')
const legalFrameworkGoalId = canonicalGoalId('fa01d441-9b2e-504a-8c54-78f3ec91cc03')
const businessModelGoalId = canonicalGoalId('d6a5a9f0-36e0-5b98-836e-9c6e77e5e519')
const balanceSheetGoalId = canonicalGoalId('a1020ccf-e61a-5791-b3e7-821ef5222b7f')
const transactionBalanceGoalId = canonicalGoalId('a81d9138-f155-53ad-9457-d8e383c6297f')
const incomeAccountsGoalId = canonicalGoalId('4ecb96ce-092f-50d3-88df-fffbca4db5be')
const profitLossGoalId = canonicalGoalId('25a1e6f1-69de-5280-aaca-992d13dc9bc4')
const financialStatementsAnalysisGoalId = canonicalGoalId('01fa0918-3a8f-5600-a174-0a56cade5c53')
const marketModelGoalId = canonicalGoalId('2af07ecf-4f3a-5e96-9c95-b4fdbf911468')
const stakeholderResponsibilityGoalId = canonicalGoalId('ac5568d6-7d04-5747-9f67-cb3ebad91fdf')
const priceFunctionsGoalId = canonicalGoalId('0d5d368a-b381-5a77-a454-d9ebe11555e9')
const circularFlowGoalId = canonicalGoalId('cc22ad59-4210-5d39-a2d9-66c1d3bff261')
const economicStatisticsGoalId = canonicalGoalId('67d63a2d-f6cb-5aab-b728-23eee7b9663e')
const socialMarketMediaGoalId = canonicalGoalId('906b0e1e-624c-5f39-a991-07641affe894')
const legalJusticeGoalId = canonicalGoalId('6fb924b6-08fc-5378-ad7d-e734987f201b')
const propertyOrderGoalId = canonicalGoalId('68c90688-316b-5b0f-8d4f-6edfa1b80d6e')
const exchangeEffectsGoalId = canonicalGoalId('7a8078ed-1b10-5249-b4d7-839167e523b6')
const internationalMediaGoalId = canonicalGoalId('6a8e28b9-43e6-53b4-ac79-1c3f2d77e8bb')
const currentDevelopmentsGoalId = canonicalGoalId('ab9b75fe-7ada-515e-ab29-d3cf5d76db0e')
const futureScenariosGoalId = canonicalGoalId('753e5d57-7b6e-5e5c-8c24-dfef67f0c8c5')
const capitalMarketActorsGoalId = canonicalGoalId('eb8dadeb-5984-51e2-b120-79da3ed1bc95')
const institutionEconomicsGoalId = canonicalGoalId('a58ee47a-a4cf-5d4a-8a5e-19bd95e75080')
const gameTheoryModelsGoalId = canonicalGoalId('85a758dd-b2e2-5a33-af42-6c6712ce01c1')
const companyObjectivesGoalId = canonicalGoalId('92cb4d42-17ca-5151-b026-e72f3153736b')
const procurementSalesGoalId = canonicalGoalId('771e680c-f104-5a54-adef-fad397969ef2')
const breakEvenGoalId = canonicalGoalId('fb8aad23-a7a3-55f5-a600-b6a3f00ea617')
const investmentAlternativesGoalId = canonicalGoalId('7bfd3f10-e183-5aaf-8aaf-b594d1c03e09')
const companyFinancialAnalysisGoalId = canonicalGoalId('1f8286d9-19c9-570f-bef0-4ba0ee1f3bd2')
const economicPolicyGrowthGoalId = canonicalGoalId('3daf13aa-26c6-5619-ba7f-8e54a50e9811')
const economicPolicyEvaluationGoalId = canonicalGoalId('16f970b8-3b70-5e64-80b1-8cc96510c911')
const socialInsuranceGoalId = canonicalGoalId('380ab03f-0bcb-58dd-ab25-ecd123483720')
const legalTechniqueGoalId = canonicalGoalId('e514bbdd-a33b-5736-aa76-9fa493eeca96')
const legalClaimsGoalId = canonicalGoalId('98ef4dae-128d-5427-b926-dc9a3c65f6b0')
const interestBalanceGoalId = canonicalGoalId('a69e70a9-982c-56a0-9db3-08ec01e9672b')
const performanceDisruptionGoalId = canonicalGoalId('dccf7718-6c99-5068-8e97-8eb0a678b1d6')
const criminalLiabilityGoalId = canonicalGoalId('ee4907aa-de79-5b61-8061-b58e9e1a7470')
const priceInterestEffectsGoalId = canonicalGoalId('88a94b70-375c-5131-8926-c66efdcc845c')
const ezbDecisionGoalId = canonicalGoalId('7ce93a3b-53ac-547c-930e-bd3f6e9d3043')
const balanceOfPaymentsGoalId = canonicalGoalId('1fa89de7-a24e-5211-bc74-af6c1c2e96dd')
const publicLawConsequencesGoalId = canonicalGoalId('4a3abb78-0ddd-53d4-9a84-5396286a1498')
const publicLawRulesGoalId = canonicalGoalId('dea88714-753a-5e84-8d6c-f5724fcb93b9')
const youthCrimeElementsGoalId = canonicalGoalId('04384cc4-e922-5424-b38c-beed124b6f75')
const digitalMarketsGoalId = canonicalGoalId('d05c4f60-f16f-54b7-b0fc-c525603dd5fe')
const boundedRationalityGoalId = canonicalGoalId('fa4253bd-54b5-5995-84be-0516ab721f44')

const supplements: SupplementDraft[] = [
  {
    sourceGoalId: 'e89d9698-7ae3-55d2-88bb-4395e8572c75',
    title: 'Geldwertstabilität und Geldfunktionen einordnen',
    description:
      'Die lernende Person kann die Bedeutung von Geldwertstabilität aus Sicht privater Haushalte, Unternehmen und Staat sowie vor dem Hintergrund zentraler Geldfunktionen erläutern.',
    requires: [],
  },
  {
    sourceGoalId: 'c542a2cd-204d-5c5b-8abb-578f3f14dd01',
    title: 'Zahlungsarten situationsbezogen auswählen',
    description:
      'Die lernende Person kann Zahlungsarten nach Sicherheit, Kosten, Verfügbarkeit und Zweckmäßigkeit situationsbezogen vergleichen und auswählen.',
    requires: [consumerBehaviorId],
  },
  {
    sourceGoalId: 'a4ea8ae4-056e-5cc2-b736-00809bb3369b',
    title: 'Haushaltsbudget und Sparziele planen',
    description:
      'Die lernende Person kann erwartete Einnahmen, Ausgaben und Sparziele in einem einfachen Haushaltsbudget planen und mithilfe einer Tabellenkalkulation auswerten.',
    requires: [consumerBehaviorId],
  },
  {
    sourceGoalId: '8f126f41-feb3-5976-9efa-9d799847c24d',
    title: 'Überschuldungsrisiken beurteilen',
    description:
      'Die lernende Person kann finanzielle Folgen von Konsumentscheidungen beurteilen und Risiken von Kreditnutzung und Überschuldung erklären.',
    requires: [paymentGoalId, budgetGoalId],
  },
  {
    sourceGoalId: 'a8b0cec5-d0e2-530c-8484-fd90562da6fd',
    title: 'Spezialisierung, Kooperation und Koordination anwenden',
    description:
      'Die lernende Person kann Spezialisierung, Kooperation und Koordination als Grundprinzipien arbeitsteiliger Abläufe erklären und auf Verbesserungen im eigenen Lebensumfeld anwenden.',
    requires: [],
    clusterId: entrepreneurshipClusterId,
  },
  {
    sourceGoalId: '2f642332-2914-5736-999b-e695a728fe15',
    title: 'Grundlegenden Unternehmensaufbau darstellen',
    description:
      'Die lernende Person kann den grundlegenden Aufbau von Unternehmen mit zentralen Funktionsbereichen und deren Zusammenwirken darstellen.',
    requires: [divisionOfLaborGoalId],
    clusterId: entrepreneurshipClusterId,
  },
  {
    sourceGoalId: 'd3aded8a-9c6c-5275-b349-69666f0611a6',
    title: 'Kern- und Unterstützungsprozesse in Unternehmen analysieren',
    description:
      'Die lernende Person kann Unternehmen nach Kernprozessen der Leistungserstellung und unterstützenden Geschäftsprozessen analysieren.',
    requires: [divisionOfLaborGoalId, companyStructureGoalId],
    clusterId: entrepreneurshipClusterId,
  },
  {
    sourceGoalId: '0ee635ec-dd4c-5f5b-ad80-761bb84539f3',
    title: 'Betriebliche Abläufe und Produktion analysieren',
    description:
      'Die lernende Person kann betriebliche Abläufe, Arbeitsteilung, Produktionsgestaltung und informationstechnologische Unterstützung an konkreten Unternehmensbeispielen analysieren.',
    requires: [businessProcessesGoalId],
    clusterId: entrepreneurshipClusterId,
  },
  {
    sourceGoalId: '3e482f10-e50c-56dd-b772-1a14f9d066b0',
    title: 'Unternehmenspräsentationen adressatenbezogen analysieren',
    description:
      'Die lernende Person kann Unternehmenspräsentationen hinsichtlich Adressatenwirkung und Kriterien erfolgreicher Präsentation analysieren.',
    requires: [companyStructureGoalId],
    clusterId: entrepreneurshipClusterId,
  },
  {
    sourceGoalId: '88facb62-98c7-5c8c-8edd-9cd9c84f7a1e',
    title: 'Bedeutung des Marketings für Unternehmen einschätzen',
    description:
      'Die lernende Person kann an konkreten Produkten aus ihrer Erfahrungswelt die Bedeutung von Marketing für den Unternehmenserfolg einschätzen.',
    requires: [companyStructureGoalId],
    clusterId: entrepreneurshipClusterId,
  },
  {
    sourceGoalId: '795cf371-65a3-5775-9c03-a1e83ac12b1d',
    title: 'Marketingmaßnahmen zielbezogen analysieren',
    description:
      'Die lernende Person kann konkrete Maßnahmen verschiedener Marketingbereiche nach Zielen, Ausgestaltung und Wirkungsweise analysieren.',
    requires: [marketingImportanceGoalId],
    clusterId: entrepreneurshipClusterId,
  },
  {
    sourceGoalId: '40ba994b-0129-53db-bda1-0b9c71879d36',
    title: 'Einfaches Marketingkonzept kriterienbezogen entwickeln',
    description:
      'Die lernende Person kann für ausgewählte Produkte aufeinander abgestimmte Marketingmaßnahmen zu einem einfachen Marketingkonzept zusammenstellen und die Auswahl kriterienbezogen begründen.',
    requires: [marketingMeasuresGoalId],
    clusterId: entrepreneurshipClusterId,
  },
  {
    sourceGoalId: '4f66392b-a818-56c4-8d30-f6a543dbe89e',
    title: 'Funktionen rechtlicher Regelungen beurteilen',
    description:
      'Die lernende Person kann die Notwendigkeit rechtlicher Regelungen vor dem Hintergrund zentraler Funktionen des Rechts beurteilen.',
    requires: [],
    clusterId: legalClusterId,
    guidingIdeas: ['WW_GESELLSCHAFT', 'WW_POLITIK'],
  },
  {
    sourceGoalId: '089de811-249b-502e-a941-ea5ec7be0652',
    title: 'Unerlaubte Handlung und Strafrecht fallbezogen anwenden',
    description:
      'Die lernende Person kann an authentischen Fallbeispielen zur unerlaubten Handlung und zum Strafrecht einschlägige Normen in vereinfachter Form analysieren und anwenden.',
    requires: [legalFunctionsGoalId],
    clusterId: legalClusterId,
    guidingIdeas: ['WW_GESELLSCHAFT', 'WW_POLITIK'],
  },
  {
    sourceGoalId: '9e36343d-0908-5fac-beae-9cdc1af11468',
    title: 'Rechtliche Konsequenzen widerrechtlichen Handelns abschätzen',
    description:
      'Die lernende Person kann rechtliche Konsequenzen widerrechtlichen Handelns in lebensnahen Fällen abschätzen.',
    requires: [civilCriminalCasesGoalId],
    clusterId: legalClusterId,
    guidingIdeas: ['WW_GESELLSCHAFT', 'WW_POLITIK'],
  },
  {
    sourceGoalId: 'd0c38d56-8d30-5aa8-9d5f-0f36435b5070',
    title: 'Rechtssicher im Internet handeln',
    description:
      'Die lernende Person kann im Internet rechtssicher handeln, indem sie wesentliche für Jugendliche relevante Rechtsnormen beachtet.',
    requires: [legalFunctionsGoalId],
    clusterId: legalClusterId,
    guidingIdeas: ['WW_GESELLSCHAFT', 'WW_POLITIK'],
  },
  {
    sourceGoalId: 'c3911589-7f5c-5263-a10b-d45912702ba9',
    title: 'Geistiges Eigentum und Persönlichkeitsrechte beachten',
    description:
      'Die lernende Person kann den Schutz von geistigem Eigentum und Persönlichkeitsrechten im privaten und schulischen Alltag reflektieren und wesentliche Bestimmungen des Urheberrechts beachten.',
    requires: [safeInternetGoalId],
    clusterId: legalClusterId,
    guidingIdeas: ['WW_GESELLSCHAFT', 'WW_POLITIK'],
  },
  {
    sourceGoalId: '76d2efd3-a767-5106-9cc3-6adf180ad8f6',
    title: 'Private-Haushalt-Kompetenzen vertiefen',
    description:
      'Die lernende Person kann Kompetenzen zum ökonomischen Handeln im privaten Haushalt anhand vertiefender Inhalte zusammenhängend anwenden.',
    requires: [paymentGoalId, budgetGoalId, canonicalGoalId('8f126f41-feb3-5976-9efa-9d799847c24d')],
  },
  {
    sourceGoalId: '3f9f7357-c9cc-5070-9b4a-da8995deb02e',
    title: 'Unternehmenskompetenzen vertiefen',
    description:
      'Die lernende Person kann Kompetenzen zum ökonomischen Handeln im Unternehmen anhand vertiefender Inhalte zusammenhängend anwenden.',
    requires: [businessProcessesGoalId, marketingConceptGoalId],
    clusterId: entrepreneurshipClusterId,
  },
  {
    sourceGoalId: '981a4616-9069-5f2f-a33b-b9e52e85651f',
    title: 'Rechtskompetenzen vertiefen',
    description:
      'Die lernende Person kann Kompetenzen zum rechtlich verantwortlichen Handeln anhand vertiefender Inhalte zusammenhängend anwenden.',
    requires: [legalConsequencesGoalId, safeInternetGoalId, intellectualRightsGoalId],
    clusterId: legalClusterId,
    guidingIdeas: ['WW_GESELLSCHAFT', 'WW_POLITIK'],
  },
  {
    sourceGoalId: '1984630f-362e-59d1-9a39-dde98be9cd35',
    title: 'Wirtschaft-und-Recht-Projekt durchführen',
    description:
      'Die lernende Person kann ein Projekt zu einer ausgewählten Themenstellung aus Wirtschaft und Recht planen, durchführen und fachlich auswerten.',
    requires: [privateHouseholdPracticeGoalId, enterprisePracticeGoalId, legalPracticeGoalId],
    clusterId: rootClusterId,
    guidingIdeas: ['WW_GESELLSCHAFT', 'WW_POLITIK', 'WW_WIRTSCHAFT'],
  },
  {
    sourceGoalId: '3138849d-e24c-5463-979f-1aa1d5d48d08',
    title: 'Verträge und rechtliche Folgen des eigenen Handelns analysieren',
    description:
      'Die lernende Person kann das Zustandekommen und rechtliche Folgen von Verträgen erklären und die rechtlichen Konsequenzen eigenen Handelns analysieren.',
    requires: [legalFunctionsGoalId],
    clusterId: legalClusterId,
    guidingIdeas: ['WW_GESELLSCHAFT', 'WW_POLITIK'],
  },
  {
    sourceGoalId: '864f1592-c03e-51eb-9802-d4a2551ef194',
    title: 'Rechte beschränkt Geschäftsfähiger bei Kaufhandlungen wahrnehmen',
    description:
      'Die lernende Person kann bei Kaufhandlungen des täglichen Lebens rechtliche Handlungsmöglichkeiten als beschränkt geschäftsfähige Person erkennen und wahrnehmen.',
    requires: [contractConsequencesGoalId],
    clusterId: legalClusterId,
    guidingIdeas: ['WW_GESELLSCHAFT', 'WW_POLITIK'],
  },
  {
    sourceGoalId: '1cd3d05d-7e9c-5900-87d0-c64bfd4a383f',
    title: 'Verbraucherrechte in Kaufsituationen kommunizieren',
    description:
      'Die lernende Person kann in konkreten Problemsituationen beim Kauf passende Verbraucherrechte erkennen und gegenüber Verkäuferinnen und Verkäufern situationsgerecht kommunizieren.',
    requires: [limitedCapacityGoalId],
    clusterId: legalClusterId,
    guidingIdeas: ['WW_GESELLSCHAFT', 'WW_POLITIK'],
  },
  {
    sourceGoalId: '369807d1-ecd5-5fed-873a-7fe1f885925c',
    title: 'Rechtsnormen auf konkrete Sachverhalte anwenden',
    description:
      'Die lernende Person kann Rechtsnormen auf konkrete Sachverhalte anwenden, indem sie Tatbestandsmerkmale und Rechtsfolgen strukturiert herausarbeitet.',
    requires: [contractConsequencesGoalId],
    clusterId: legalClusterId,
    guidingIdeas: ['WW_GESELLSCHAFT', 'WW_POLITIK'],
  },
  {
    sourceGoalId: 'fa01d441-9b2e-504a-8c54-78f3ec91cc03',
    title: 'Rechtliche Rahmenbedingungen nach Rechtsfunktionen analysieren',
    description:
      'Die lernende Person kann rechtliche Rahmenbedingungen im Hinblick auf zentrale Funktionen des Rechts analysieren.',
    requires: [legalFunctionsGoalId],
    clusterId: legalClusterId,
    guidingIdeas: ['WW_GESELLSCHAFT', 'WW_POLITIK'],
  },
  {
    sourceGoalId: 'd6a5a9f0-36e0-5b98-836e-9c6e77e5e519',
    title: 'Geschäftsmodell und unternehmerische Grundentscheidungen darstellen',
    description:
      'Die lernende Person kann im Rahmen eines Projekts ein eigenes Geschäftsmodell mit wesentlichen Elementen eines erfolgreichen Unternehmens, Kernprozess und grundlegenden unternehmerischen Entscheidungen systematisch darstellen.',
    requires: [businessProcessesGoalId, marketingConceptGoalId],
    clusterId: entrepreneurshipClusterId,
  },
  {
    sourceGoalId: '3aa4b56c-21d8-52d3-8955-c3a7a9a6aae1',
    title: 'Projektmanagement im Team anwenden',
    description:
      'Die lernende Person kann im Team grundlegende Methoden des Projektmanagements ergebnisorientiert anwenden und digitale Medien bedarfsgerecht einsetzen.',
    requires: [businessModelGoalId],
    clusterId: entrepreneurshipClusterId,
  },
  {
    sourceGoalId: 'a1020ccf-e61a-5791-b3e7-821ef5222b7f',
    title: 'Vereinfachte Bilanz erstellen',
    description:
      'Die lernende Person kann eine vereinfachte Bilanz erstellen, indem sie Vermögenswerte und Kapitalquellen gegenüberstellt.',
    requires: [businessProcessesGoalId],
    clusterId: entrepreneurshipClusterId,
  },
  {
    sourceGoalId: 'a81d9138-f155-53ad-9457-d8e383c6297f',
    title: 'Geschäftsvorfälle in der Bilanz darstellen',
    description:
      'Die lernende Person kann Auswirkungen einfacher Geschäftsvorfälle auf die Bilanz darstellen und das Grundprinzip der doppelten Buchführung einordnen.',
    requires: [balanceSheetGoalId],
    clusterId: entrepreneurshipClusterId,
  },
  {
    sourceGoalId: '4ecb96ce-092f-50d3-88df-fffbca4db5be',
    title: 'Erfolgswirksame Geschäftsvorfälle beschreiben',
    description:
      'Die lernende Person kann Auswirkungen einfacher erfolgswirksamer Geschäftsvorfälle beschreiben und Erfolgskonten als Unterkonten des Eigenkapitals einordnen.',
    requires: [transactionBalanceGoalId],
    clusterId: entrepreneurshipClusterId,
  },
  {
    sourceGoalId: '25a1e6f1-69de-5280-aaca-992d13dc9bc4',
    title: 'Unternehmenserfolg mit der GuV ermitteln',
    description:
      'Die lernende Person kann den Erfolg eines Unternehmens ermitteln, indem sie Aufwendungen und Erträge in der Gewinn- und Verlustrechnung gegenüberstellt.',
    requires: [incomeAccountsGoalId],
    clusterId: entrepreneurshipClusterId,
  },
  {
    sourceGoalId: '01fa0918-3a8f-5600-a174-0a56cade5c53',
    title: 'Bilanz und GuV mit Kennzahlen analysieren',
    description:
      'Die lernende Person kann Bilanz und Gewinn- und Verlustrechnung in vereinfachter Form analysieren, ausgewählte Kennzahlen ermitteln und branchenspezifisch interpretieren.',
    requires: [profitLossGoalId],
    clusterId: entrepreneurshipClusterId,
  },
  {
    sourceGoalId: '7019c3e0-9780-5b12-9af0-03d0875842b3',
    title: 'Bilanz- und GuV-Informationen grafisch darstellen',
    description:
      'Die lernende Person kann Informationen aus Bilanz und GuV oder deren Entwicklung zielgruppenorientiert mit einem Tabellenkalkulationsprogramm grafisch darstellen.',
    requires: [financialStatementsAnalysisGoalId],
    clusterId: entrepreneurshipClusterId,
  },
  {
    sourceGoalId: '3d5d71b6-7e5e-58c8-8665-61b239e4c1d7',
    title: 'Konsumentscheidungen kritisch reflektieren',
    description:
      'Die lernende Person kann Konsumentscheidungen bei knappen Mitteln unter Berücksichtigung eigener Anreize, Nachhaltigkeit, Werbung, Verkaufspsychologie und verhaltensökonomischer Einflussfaktoren reflektiert begründen.',
    requires: [consumerBehaviorId, paymentGoalId],
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J10',
  },
  {
    sourceGoalId: '8b887305-116a-5955-a4c1-d74cadd50c82',
    title: 'Anlageentscheidungen und Geldwertstabilität reflektieren',
    description:
      'Die lernende Person kann Anlageentscheidungen anhand ausgewählter Kriterien reflektieren und dabei Geldwertstabilität sowie zentrale Funktionen des Geldes einbeziehen.',
    requires: [paymentGoalId, canonicalGoalId('e89d9698-7ae3-55d2-88bb-4395e8572c75')],
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J10',
  },
  {
    sourceGoalId: '2af07ecf-4f3a-5e96-9c95-b4fdbf911468',
    title: 'Marktmodell anwenden und kritisch einordnen',
    description:
      'Die lernende Person kann das Marktmodell auf konkrete Beispiele anwenden, die Koordinationsfunktion von Märkten erklären und Modellannahmen kritisch mit realen Märkten vergleichen.',
    requires: [consumerBehaviorId],
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J10',
  },
  {
    sourceGoalId: 'c183226a-0c94-59ba-8a88-09dd00a89858',
    title: 'Unternehmerische Persönlichkeitsanforderungen reflektieren',
    description:
      'Die lernende Person kann eigene Interessen und Stärken mit Anforderungen an Unternehmerinnen und Unternehmer sowie an Beschäftigte in Unternehmen vergleichen und für die berufliche Orientierung nutzen.',
    requires: [companyStructureGoalId],
    clusterId: entrepreneurshipClusterId,
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J10',
  },
  {
    sourceGoalId: '4f65fa97-5cf5-555c-aa6b-0d61a3d1de76',
    title: 'Unternehmenslandschaft datenbasiert analysieren',
    description:
      'Die lernende Person kann die deutsche Unternehmenslandschaft mit quantitativen Daten analysieren, Diagramme mithilfe einer Tabellenkalkulation erstellen und daraus Schlüsse für Berufs- und Unternehmensentscheidungen ziehen.',
    requires: [companyStructureGoalId],
    clusterId: entrepreneurshipClusterId,
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J10',
  },
  {
    sourceGoalId: 'f67003d8-7d88-5854-8ddf-5d9a2f83a955',
    title: 'Entwicklungen der Arbeitswelt beurteilen',
    description:
      'Die lernende Person kann Chancen und Risiken aktueller Entwicklungen der Arbeitswelt beurteilen und Konsequenzen für die eigene berufliche Orientierung ableiten.',
    requires: [companyStructureGoalId],
    clusterId: entrepreneurshipClusterId,
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J10',
  },
  {
    sourceGoalId: 'a23e7154-4efc-5985-a1c5-0488f726e60c',
    title: 'Staatliche Rahmenbedingungen für Unternehmen beurteilen',
    description:
      'Die lernende Person kann beurteilen, wie staatliche Rahmenbedingungen unternehmerisches Handeln beeinflussen.',
    requires: [businessModelGoalId],
    clusterId: entrepreneurshipClusterId,
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J10',
  },
  {
    sourceGoalId: 'ac5568d6-7d04-5747-9f67-cb3ebad91fdf',
    title: 'Unternehmerisches Handeln aus Stakeholder-Perspektiven bewerten',
    description:
      'Die lernende Person kann unternehmerisches Handeln aus der Sicht verschiedener Stakeholder bewerten und dabei gesellschaftliche Verantwortung sowie Bedeutung von Unternehmen für Wirtschaft und Gesellschaft einbeziehen.',
    requires: [businessModelGoalId],
    clusterId: entrepreneurshipClusterId,
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J10',
  },
  {
    sourceGoalId: '4a3abb78-0ddd-53d4-9a84-5396286a1498',
    title: 'Öffentlich-rechtliche Folgen jugendlichen Handelns analysieren',
    description:
      'Die lernende Person kann rechtliche Konsequenzen jugendlichen Handelns in ausgewählten öffentlich-rechtlichen Situationen analysieren.',
    requires: [legalFrameworkGoalId],
    clusterId: legalClusterId,
    guidingIdeas: ['WW_GESELLSCHAFT', 'WW_POLITIK'],
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J10',
  },
  {
    sourceGoalId: 'dea88714-753a-5e84-8d6c-f5724fcb93b9',
    title: 'Öffentlich-rechtliche Regelungen beurteilen',
    description:
      'Die lernende Person kann Zweck und Ausgestaltung ausgewählter öffentlich-rechtlicher Regelungen im Hinblick auf Rechtsfunktionen, Gerechtigkeit und gesellschaftlichen Wandel beurteilen.',
    requires: [publicLawConsequencesGoalId],
    clusterId: legalClusterId,
    guidingIdeas: ['WW_GESELLSCHAFT', 'WW_POLITIK'],
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J10',
  },
  {
    sourceGoalId: '04384cc4-e922-5424-b38c-beed124b6f75',
    title: 'Jugendstrafrechtliche Tatbestände prüfen',
    description:
      'Die lernende Person kann Fälle der Jugendkriminalität mithilfe juristischer Arbeitstechniken auf Tatbestandsmerkmale prüfen.',
    requires: [legalNormApplicationGoalId, publicLawRulesGoalId],
    clusterId: legalClusterId,
    guidingIdeas: ['WW_GESELLSCHAFT', 'WW_POLITIK'],
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J10',
  },
  {
    sourceGoalId: '24405502-a6f5-5b06-ad5e-cee67bfe7b79',
    title: 'Rechtsfolgen von Jugendstraftaten beurteilen',
    description:
      'Die lernende Person kann Rechtsfolgen von Jugendstraftaten im Hinblick auf den Erziehungsgedanken beurteilen.',
    requires: [youthCrimeElementsGoalId],
    clusterId: legalClusterId,
    guidingIdeas: ['WW_GESELLSCHAFT', 'WW_POLITIK'],
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J10',
  },
  {
    sourceGoalId: 'd05c4f60-f16f-54b7-b0fc-c525603dd5fe',
    title: 'Digitalisierung von Märkten bewerten',
    description:
      'Die lernende Person kann Auswirkungen der Digitalisierung auf Märkte analysieren und Folgen für Anbieter und Nachfrager beurteilen.',
    requires: [marketModelGoalId],
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J10',
  },
  {
    sourceGoalId: '1cc47390-b533-5cc2-a1e6-bef5c7813829',
    title: 'Konsumentscheidungen auf virtuellen Marktplätzen reflektieren',
    description:
      'Die lernende Person kann eigene Konsumentscheidungen auf virtuellen Marktplätzen reflektieren und Nutzen sowie Probleme des Online-Shoppings abwägen.',
    requires: [digitalMarketsGoalId, consumerRightsGoalId],
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J10',
  },
  {
    sourceGoalId: 'fa4253bd-54b5-5995-84be-0516ab721f44',
    title: 'Begrenzte Rationalität in Entscheidungen erklären',
    description:
      'Die lernende Person kann eigene Entscheidungen hinsichtlich rationaler Kriterien kritisch beurteilen und systematische Einflüsse begrenzter Rationalität erklären.',
    requires: [consumerBehaviorId],
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J10',
  },
  {
    sourceGoalId: '7a6d4384-0601-5920-aae9-7366c3d6959e',
    title: 'Verhaltensökonomische Maßnahmen ethisch beurteilen',
    description:
      'Die lernende Person kann unternehmerische und politische Maßnahmen aus verhaltensökonomischer Sicht analysieren und die ethischen Grenzen von Verhaltensbeeinflussung und Nudging diskutieren.',
    requires: [boundedRationalityGoalId],
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J10',
  },
  {
    sourceGoalId: '8aa67097-4931-508b-877e-528be730cb8e',
    title: 'Unternehmen in Wirtschaft und Gesellschaft vertiefen',
    description:
      'Die lernende Person kann Kompetenzen zu Unternehmen als Teil von Wirtschaft und Gesellschaft anhand vertiefender Inhalte zusammenhängend anwenden.',
    requires: [businessModelGoalId, stakeholderResponsibilityGoalId],
    clusterId: entrepreneurshipClusterId,
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J10',
  },
  {
    sourceGoalId: '117f4895-2cc7-5405-bbc7-6e7e9f635eac',
    title: 'Recht als Handlungsrahmen vertiefen',
    description:
      'Die lernende Person kann Kompetenzen zu Recht als Handlungsrahmen anhand vertiefender Inhalte zusammenhängend anwenden.',
    requires: [legalNormApplicationGoalId, youthCrimeElementsGoalId],
    clusterId: legalClusterId,
    guidingIdeas: ['WW_GESELLSCHAFT', 'WW_POLITIK'],
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J10',
  },
  {
    sourceGoalId: 'c51f9dbb-de45-5ed5-9a09-09c1a1cebee3',
    title: 'Ökonomisches Handeln auf Märkten vertiefen',
    description:
      'Die lernende Person kann Kompetenzen zum ökonomischen Handeln auf Märkten anhand vertiefender Inhalte zusammenhängend anwenden.',
    requires: [marketModelGoalId, digitalMarketsGoalId],
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J10',
  },
  {
    sourceGoalId: '239d260b-7a6b-565c-872e-af4817f2c999',
    title: 'Verhaltensökonomische Entscheidungen vertiefen',
    description:
      'Die lernende Person kann Kompetenzen zu Entscheidungen aus verhaltensökonomischer Sicht anhand vertiefender Inhalte zusammenhängend anwenden.',
    requires: [boundedRationalityGoalId, canonicalGoalId('7a6d4384-0601-5920-aae9-7366c3d6959e')],
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J10',
  },
  {
    sourceGoalId: '0d5d368a-b381-5a77-a454-d9ebe11555e9',
    title: 'Preisfunktionen und dezentrale Koordination erklären',
    description:
      'Die lernende Person kann an konkreten Märkten die Funktionen von Preisen erklären und Vorzüge dezentraler gegenüber zentral gelenkten Ordnungssystemen begründen.',
    requires: [marketModelGoalId],
    clusterId: rootClusterId,
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J11',
  },
  {
    sourceGoalId: 'cc22ad59-4210-5d39-a2d9-66c1d3bff261',
    title: 'Gesamtwirtschaftliche Zusammenhänge im Kreislaufmodell darstellen',
    description:
      'Die lernende Person kann gesamtwirtschaftliche Zusammenhänge mithilfe des Kreislaufmodells darstellen und Ursache-Wirkungs-Zusammenhänge fachsprachlich formulieren.',
    requires: [priceFunctionsGoalId],
    clusterId: rootClusterId,
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J11',
  },
  {
    sourceGoalId: '67d63a2d-f6cb-5aab-b728-23eee7b9663e',
    title: 'Wirtschafts-, Sozial- und Umweltstatistiken auswerten',
    description:
      'Die lernende Person kann Statistiken zu wirtschafts-, sozial- und umweltpolitischen Themen auswerten und deren Aussagekraft beurteilen.',
    requires: [circularFlowGoalId],
    clusterId: rootClusterId,
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J11',
  },
  {
    sourceGoalId: '906b0e1e-624c-5f39-a991-07641affe894',
    title: 'Wirtschaftspolitische Medienbeiträge beurteilen',
    description:
      'Die lernende Person kann journalistische Texte und Karikaturen zu wirtschafts-, sozial- und umweltpolitischen Themen hinsichtlich Aussagekraft, Intention und Bezug zur Sozialen Marktwirtschaft beurteilen.',
    requires: [socialMarketGoalId, economicStatisticsGoalId],
    clusterId: rootClusterId,
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J11',
  },
  {
    sourceGoalId: '6fb924b6-08fc-5378-ad7d-e734987f201b',
    title: 'Rechtliche Regelungen und Rechtsstaatlichkeit beurteilen',
    description:
      'Die lernende Person kann aktuelle rechtliche Regelungen und Entscheidungen aus öffentlichem und privatem Recht im Hinblick auf Rechtsfunktionen, rechtsstaatliche Prinzipien und gerechten Interessenausgleich beurteilen.',
    requires: [legalFrameworkGoalId],
    clusterId: legalClusterId,
    guidingIdeas: ['WW_GESELLSCHAFT', 'WW_POLITIK'],
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J11',
  },
  {
    sourceGoalId: '68c90688-316b-5b0f-8d4f-6edfa1b80d6e',
    title: 'Eigentumsordnung in der Sozialen Marktwirtschaft analysieren',
    description:
      'Die lernende Person kann Inhalt, Grenzen und Wertgrundlagen des Eigentums als institutionelles Element der Sozialen Marktwirtschaft an konkreten Beispielen analysieren.',
    requires: [legalJusticeGoalId, socialMarketGoalId],
    clusterId: legalClusterId,
    guidingIdeas: ['WW_GESELLSCHAFT', 'WW_POLITIK', 'WW_WIRTSCHAFT'],
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J11',
  },
  {
    sourceGoalId: '7a82caee-ea34-5bc2-a986-bae192ba27c2',
    title: 'Schutzfunktion rechtlicher Regelungen und Vertragsfreiheit abwägen',
    description:
      'Die lernende Person kann an konkreten Beispielen das Spannungsverhältnis zwischen Schutzfunktion rechtlicher Regelungen und Vertragsfreiheit in der Sozialen Marktwirtschaft analysieren und beurteilen.',
    requires: [legalJusticeGoalId, socialMarketGoalId],
    clusterId: legalClusterId,
    guidingIdeas: ['WW_GESELLSCHAFT', 'WW_POLITIK', 'WW_WIRTSCHAFT'],
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J13',
  },
  {
    sourceGoalId: '7a8078ed-1b10-5249-b4d7-839167e523b6',
    title: 'Wechselkursschwankungen für Haushalte und Unternehmen analysieren',
    description:
      'Die lernende Person kann Auswirkungen von Wechselkursschwankungen auf private Haushalte und Unternehmen analysieren.',
    requires: [foreignTradePolicyGoalId],
    clusterId: rootClusterId,
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J11',
    phase: 'Q3',
  },
  {
    sourceGoalId: '6a8e28b9-43e6-53b4-ac79-1c3f2d77e8bb',
    title: 'Medienbeiträge zur internationalen Verflechtung beurteilen',
    description:
      'Die lernende Person kann journalistische Texte und Karikaturen zur internationalen wirtschaftlichen Verflechtung hinsichtlich Aussagekraft und Intention analysieren und politisch einordnen.',
    requires: [foreignTradePolicyGoalId],
    clusterId: rootClusterId,
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J11',
    phase: 'Q3',
  },
  {
    sourceGoalId: 'ab9b75fe-7ada-515e-ab29-d3cf5d76db0e',
    title: 'Aktuelle wirtschaftliche und rechtliche Entwicklungen bewerten',
    description:
      'Die lernende Person kann aktuelle wirtschaftliche und rechtliche Entwicklungen auf Grundlage ihrer Fachkenntnisse analysieren und bewerten, auch unter Berücksichtigung der Digitalisierung.',
    requires: [socialMarketMediaGoalId, legalJusticeGoalId, digitalMarketsGoalId],
    clusterId: rootClusterId,
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J11',
  },
  {
    sourceGoalId: '753e5d57-7b6e-5e5c-8c24-dfef67f0c8c5',
    title: 'Zukunftsszenarien und Gestaltungsoptionen beurteilen',
    description:
      'Die lernende Person kann Zukunftsszenarien und Gestaltungsoptionen entwickeln und vor dem Hintergrund ihrer Voraussetzungen und Rahmenbedingungen beurteilen.',
    requires: [currentDevelopmentsGoalId],
    clusterId: rootClusterId,
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J11',
  },
  {
    sourceGoalId: '31ed900b-65fe-5ea5-aa71-47acccd1a344',
    title: 'Ökonomische Zukunft verantwortungsbewusst mitgestalten',
    description:
      'Die lernende Person kann als mündige Staatsbürgerin oder mündiger Staatsbürger an der Gestaltung der ökonomischen Zukunft verantwortungsbewusst mitwirken.',
    requires: [futureScenariosGoalId],
    clusterId: rootClusterId,
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J11',
  },
  {
    sourceGoalId: 'faa5fb99-2858-5725-9f88-d9022d157d18',
    title: 'Internationale wirtschaftliche Verflechtung Deutschlands beurteilen',
    description:
      'Die lernende Person kann die Bedeutung internationaler wirtschaftlicher Verflechtung für Deutschland beurteilen und Folgen von Außenhandelsveränderungen mithilfe des Kreislaufmodells analysieren.',
    requires: [foreignTradePolicyGoalId, circularFlowGoalId],
    clusterId: rootClusterId,
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J11',
    phase: 'Q3',
  },
  {
    sourceGoalId: 'eb8dadeb-5984-51e2-b120-79da3ed1bc95',
    title: 'Akteure des Geld- und Kapitalmarkts analysieren',
    description:
      'Die lernende Person kann Akteure des Geld- und Kapitalmarkts im Hinblick auf ihre Bedeutung für die Wirtschaft analysieren.',
    requires: [canonicalGoalId('8b887305-116a-5955-a4c1-d74cadd50c82')],
    clusterId: rootClusterId,
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J11',
  },
  {
    sourceGoalId: 'a58ee47a-a4cf-5d4a-8a5e-19bd95e75080',
    title: 'Institutionenökonomische Perspektive auf die Soziale Marktwirtschaft anwenden',
    description:
      'Die lernende Person kann Regelungen der Sozialen Marktwirtschaft aus institutionenökonomischer Sicht analysieren und bekannte wirtschaftliche Zusammenhänge sowie rechtliche Normen damit vertieft einordnen.',
    requires: [socialMarketGoalId, legalFrameworkGoalId],
    clusterId: rootClusterId,
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J11',
  },
  {
    sourceGoalId: '85a758dd-b2e2-5a33-af42-6c6712ce01c1',
    title: 'Spieltheoretische Grundmodelle auf Entscheidungssituationen anwenden',
    description:
      'Die lernende Person kann reale soziale und wirtschaftliche Entscheidungssituationen spieltheoretischen Grundmodellen zuordnen und daraus mögliche Strategien von Entscheidungsträgern ableiten.',
    requires: [institutionEconomicsGoalId],
    clusterId: rootClusterId,
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J11',
  },
  {
    sourceGoalId: '56ee6d59-ee06-5159-b4b7-98e007efe8c3',
    title: 'Handlungsstrategien spieltheoretisch entwickeln',
    description:
      'Die lernende Person kann vor dem Hintergrund spieltheoretischer Überlegungen Strategien für eigenes und kollektives Handeln entwickeln.',
    requires: [gameTheoryModelsGoalId],
    clusterId: rootClusterId,
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J11',
  },
  {
    sourceGoalId: '8a0be6a4-9e4c-5650-b55b-f91a89b0c29d',
    title: 'Wirtschaftsordnung als Handlungsrahmen vertiefen',
    description:
      'Die lernende Person kann Kompetenzen zur Wirtschaftsordnung als Handlungsrahmen anhand vertiefender Inhalte zusammenhängend anwenden.',
    requires: [priceFunctionsGoalId, socialMarketMediaGoalId],
    clusterId: rootClusterId,
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J11',
  },
  {
    sourceGoalId: 'a509fe46-4ac1-554b-bfa5-a8b617ab8ee2',
    title: 'Recht als Handlungsrahmen in der Kursstufe vertiefen',
    description:
      'Die lernende Person kann Kompetenzen zu Recht als Handlungsrahmen anhand kursstufengerechter Vertiefungsinhalte zusammenhängend anwenden.',
    requires: [legalJusticeGoalId, propertyOrderGoalId],
    clusterId: legalClusterId,
    guidingIdeas: ['WW_GESELLSCHAFT', 'WW_POLITIK'],
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J11',
  },
  {
    sourceGoalId: '7775eb00-e4c8-5ea0-ba5f-39ff870f8c6d',
    title: 'Internationale wirtschaftliche Verflechtung vertiefen',
    description:
      'Die lernende Person kann Kompetenzen zur internationalen wirtschaftlichen Verflechtung anhand vertiefender Inhalte zusammenhängend anwenden.',
    requires: [internationalMediaGoalId, exchangeEffectsGoalId],
    clusterId: rootClusterId,
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J11',
    phase: 'Q3',
  },
  {
    sourceGoalId: '307743e0-ebbf-52ee-82bb-06c78227b167',
    title: 'Kapitalmarkt und Geldanlage vertiefen',
    description:
      'Die lernende Person kann Kompetenzen zu Kapitalmarkt und Geldanlage anhand vertiefender Inhalte zusammenhängend anwenden.',
    requires: [capitalMarketActorsGoalId],
    clusterId: rootClusterId,
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J11',
  },
  {
    sourceGoalId: 'f95fcf35-0c69-5d29-a5b3-b32fb8c25ac2',
    title: 'Institutionenökonomisches Handeln vertiefen',
    description:
      'Die lernende Person kann Kompetenzen zu wirtschaftlichem und rechtlichem Handeln aus institutionenökonomischer Sicht anhand vertiefender Inhalte zusammenhängend anwenden.',
    requires: [institutionEconomicsGoalId, gameTheoryModelsGoalId],
    clusterId: rootClusterId,
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J11',
  },
  {
    sourceGoalId: '88152378-bd58-564a-9453-bd3f7858b9af',
    title: 'Globale Zukunftstrends vertiefen',
    description:
      'Die lernende Person kann Kompetenzen zu globalen Zukunftstrends anhand vertiefender Inhalte zusammenhängend anwenden.',
    requires: [currentDevelopmentsGoalId, futureScenariosGoalId],
    clusterId: rootClusterId,
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J11',
  },
  {
    sourceGoalId: '92cb4d42-17ca-5151-b026-e72f3153736b',
    title: 'Unternehmerische Zielsetzungen stakeholderbezogen analysieren',
    description:
      'Die lernende Person kann Wechselwirkungen unternehmerischer Zielsetzungen vor dem Hintergrund unterschiedlicher Stakeholder-Interessen analysieren und die Bedeutung langfristiger Zielorientierung begründen.',
    requires: [stakeholderResponsibilityGoalId],
    clusterId: entrepreneurshipClusterId,
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J12',
  },
  {
    sourceGoalId: '771e680c-f104-5a54-adef-fad397969ef2',
    title: 'Beschaffungs- und Absatzentscheidungen nachhaltig beurteilen',
    description:
      'Die lernende Person kann unternehmerische Beschaffungs- und Absatzentscheidungen mit Blick auf Kundeninteressen sowie ökologische, soziale und ethische Aspekte nachvollziehen und beurteilen.',
    requires: [companyObjectivesGoalId],
    clusterId: entrepreneurshipClusterId,
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J12',
  },
  {
    sourceGoalId: 'fb8aad23-a7a3-55f5-a600-b6a3f00ea617',
    title: 'Break-even-Analysen für Unternehmensentscheidungen nutzen',
    description:
      'Die lernende Person kann mithilfe einer Break-even-Analyse Auswirkungen von Veränderungen der Erlös- und Kostenstruktur auf die Gewinnsituation eines Unternehmens analysieren.',
    requires: [companyObjectivesGoalId],
    clusterId: entrepreneurshipClusterId,
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J12',
  },
  {
    sourceGoalId: '7bfd3f10-e183-5aaf-8aaf-b594d1c03e09',
    title: 'Investitionsalternativen statisch und dynamisch beurteilen',
    description:
      'Die lernende Person kann Investitionsalternativen mithilfe statischer und dynamischer Verfahren beurteilen und dabei Risikoaspekte sowie nicht quantifizierbare Einflüsse berücksichtigen.',
    requires: [breakEvenGoalId],
    clusterId: entrepreneurshipClusterId,
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J12',
  },
  {
    sourceGoalId: 'fe55af60-102b-587b-baf8-6e1c89d1cebd',
    title: 'Finanzierungsentscheidungen zielbezogen beurteilen',
    description:
      'Die lernende Person kann Finanzierungsentscheidungen im Hinblick auf finanzwirtschaftliche Ziele beurteilen.',
    requires: [investmentAlternativesGoalId],
    clusterId: entrepreneurshipClusterId,
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J12',
  },
  {
    sourceGoalId: '1f8286d9-19c9-570f-bef0-4ba0ee1f3bd2',
    title: 'Finanz- und Ertragslage mit Kennzahlen darstellen',
    description:
      'Die lernende Person kann die Finanz- und Ertragslage von Unternehmen mithilfe geeigneter Kennzahlen darstellen, auch mit Tabellenkalkulationsprogrammen.',
    requires: [financialStatementsAnalysisGoalId],
    clusterId: entrepreneurshipClusterId,
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J12',
  },
  {
    sourceGoalId: '2cc1db50-48bb-5409-a06d-545e2314f102',
    title: 'Unternehmen mit Analyseinstrumenten untersuchen',
    description:
      'Die lernende Person kann Unternehmen mithilfe verschiedener betriebswirtschaftlicher Analyseinstrumente untersuchen.',
    requires: [companyFinancialAnalysisGoalId],
    clusterId: entrepreneurshipClusterId,
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J12',
  },
  {
    sourceGoalId: 'e092eb54-dd34-51ef-abd7-fabf1ce911d2',
    title: 'Unternehmensstrategien und Managementbedeutung identifizieren',
    description:
      'Die lernende Person kann mögliche Strategien von Unternehmen identifizieren und die Bedeutung des Managements für strategische Entscheidungen erläutern.',
    requires: [companyFinancialAnalysisGoalId, companyObjectivesGoalId],
    clusterId: entrepreneurshipClusterId,
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J12',
  },
  {
    sourceGoalId: '3daf13aa-26c6-5619-ba7f-8e54a50e9811',
    title: 'Wirtschaftspolitische Maßnahmen zu Wachstum und Beschäftigung modellgestützt erklären',
    description:
      'Die lernende Person kann die intendierte Wirkung konkreter wirtschaftspolitischer Maßnahmen auf Wachstum und Beschäftigung mithilfe volkswirtschaftlicher Modelle darstellen.',
    requires: [circularFlowGoalId],
    clusterId: rootClusterId,
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J12',
  },
  {
    sourceGoalId: '16f970b8-3b70-5e64-80b1-8cc96510c911',
    title: 'Wirtschaftspolitische Maßnahmen perspektivisch bewerten',
    description:
      'Die lernende Person kann wirtschaftspolitische Maßnahmen aus unterschiedlichen Perspektiven bewerten, nachfrage- und angebotsorientierter Wirtschaftspolitik zuordnen und kurz- sowie langfristige Folgen für Staatshaushalt und Umwelt berücksichtigen.',
    requires: [economicPolicyGrowthGoalId],
    clusterId: rootClusterId,
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J12',
  },
  {
    sourceGoalId: '12cd2cf3-0672-588d-af33-38562f963714',
    title: 'Tarifpolitische Forderungen im Hinblick auf Wachstum und Beschäftigung beurteilen',
    description:
      'Die lernende Person kann Forderungen der Tarifpartner bei aktuellen Tarifverhandlungen im Hinblick auf Wachstum, Beschäftigung sowie Lohn- und Gewinnquote beurteilen.',
    requires: [economicPolicyGrowthGoalId],
    clusterId: rootClusterId,
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J12',
  },
  {
    sourceGoalId: '380ab03f-0bcb-58dd-ab25-ecd123483720',
    title: 'Gesetzliche Sozialversicherung finanzierungs- und gerechtigkeitsbezogen bewerten',
    description:
      'Die lernende Person kann ausgewählte Zweige der gesetzlichen Sozialversicherung hinsichtlich aktueller und zukünftiger Herausforderungen bewerten und dabei Finanzierbarkeit sowie soziale Gerechtigkeit berücksichtigen.',
    requires: [socialMarketGoalId],
    clusterId: rootClusterId,
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J12',
  },
  {
    sourceGoalId: '59fde11d-0e5a-5967-9357-a7ee5d8d3d1c',
    title: 'Alternative Konzepte sozialer Sicherung diskutieren',
    description:
      'Die lernende Person kann alternative Maßnahmen und Konzepte sozialer Sicherung vor dem Hintergrund sozialer Gerechtigkeit und Finanzierbarkeit diskutieren.',
    requires: [socialInsuranceGoalId],
    clusterId: rootClusterId,
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J12',
  },
  {
    sourceGoalId: 'e514bbdd-a33b-5736-aa76-9fa493eeca96',
    title: 'Juristische Arbeitstechniken im Kaufrecht anwenden',
    description:
      'Die lernende Person kann zur Klärung rechtlicher Fragestellungen, insbesondere bei Kaufhandlungen, grundlegende juristische Arbeitstechniken und die Systematik des Bürgerlichen Gesetzbuches anwenden.',
    requires: [legalNormApplicationGoalId, consumerRightsGoalId],
    clusterId: legalClusterId,
    guidingIdeas: ['WW_GESELLSCHAFT', 'WW_POLITIK'],
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J12',
  },
  {
    sourceGoalId: '98ef4dae-128d-5427-b926-dc9a3c65f6b0',
    title: 'Gesetzliche Ansprüche juristisch begründen',
    description:
      'Die lernende Person kann gesetzliche Ansprüche in konkreten Fallbeispielen rechtstechnisch begründen und juristisch fundierte Texte zur Durchsetzung dieser Ansprüche formulieren.',
    requires: [legalTechniqueGoalId],
    clusterId: legalClusterId,
    guidingIdeas: ['WW_GESELLSCHAFT', 'WW_POLITIK'],
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J12',
  },
  {
    sourceGoalId: 'a69e70a9-982c-56a0-9db3-08ec01e9672b',
    title: 'Gerechten Interessenausgleich in Rechtsfällen diskutieren',
    description:
      'Die lernende Person kann Möglichkeiten eines gerechten Interessenausgleichs anhand praxisnaher Fallbeispiele vor dem Hintergrund einschlägiger gesetzlicher Regelungen diskutieren.',
    requires: [legalClaimsGoalId],
    clusterId: legalClusterId,
    guidingIdeas: ['WW_GESELLSCHAFT', 'WW_POLITIK'],
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J12',
  },
  {
    sourceGoalId: 'fd15b0b2-d9a4-5b6a-8f6c-5eabbc27bcbb',
    title: 'Beschaffungsprozesse und Lieferkettenstandards analysieren',
    description:
      'Die lernende Person kann Beschaffungsprozesse von Unternehmen im Hinblick auf Beschaffungsarten sowie ökologische, soziale und ethische Lieferkettenstandards analysieren.',
    requires: [procurementSalesGoalId],
    clusterId: entrepreneurshipClusterId,
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J12',
  },
  {
    sourceGoalId: 'bd02d210-c093-58be-9713-5ab2166f1914',
    title: 'Produktionsprozesse nach Rationalisierung und Individualisierung analysieren',
    description:
      'Die lernende Person kann Produktionsprozesse hinsichtlich Rationalisierung, Individualisierung, Flexibilität, Durchlaufzeit, Qualität und Kosten analysieren.',
    requires: [procurementSalesGoalId],
    clusterId: entrepreneurshipClusterId,
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J12',
  },
  {
    sourceGoalId: '6d1e50f5-a039-56fd-9a95-0bdb89a2838a',
    title: 'Marktsituation und Marktpotenzial eines Produkts analysieren',
    description:
      'Die lernende Person kann die Marktsituation analysieren und das Marktpotenzial eines Produkts ermitteln.',
    requires: [marketModelGoalId, procurementSalesGoalId],
    clusterId: entrepreneurshipClusterId,
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J12',
  },
  {
    sourceGoalId: 'dad43bb7-613a-57de-a2ca-005b8ff2fb8b',
    title: 'Nutzen und Grenzen volkswirtschaftlicher Modelle an Maßnahmen erklären',
    description:
      'Die lernende Person kann an konkreten wirtschaftspolitischen Maßnahmen Nutzen und Grenzen volkswirtschaftlicher Modelle aufzeigen.',
    requires: [economicPolicyGrowthGoalId],
    clusterId: rootClusterId,
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J12',
  },
  {
    sourceGoalId: '93ea510d-0a2f-556c-98b3-1ecfc844aa16',
    title: 'Umweltschutzmaßnahmen zwischen Wachstum und lebenswerter Umwelt analysieren',
    description:
      'Die lernende Person kann anhand staatlicher Umweltschutzmaßnahmen Wechselwirkungen zwischen Wachstum und lebenswerter Umwelt darstellen.',
    requires: [economicPolicyEvaluationGoalId],
    clusterId: rootClusterId,
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J12',
  },
  {
    sourceGoalId: 'f643c7c3-e802-5a1b-b3b0-f0b04d6f9b80',
    title: 'Tatbestandsmerkmale im Rahmen der Subsumtion abwägen',
    description:
      'Die lernende Person kann im Zuge der Subsumtion Tatbestandsmerkmale erörtern, die aufgrund des Sachverhalts interpretiert oder abgewogen werden müssen.',
    requires: [legalTechniqueGoalId, legalClaimsGoalId],
    clusterId: legalClusterId,
    guidingIdeas: ['WW_GESELLSCHAFT', 'WW_POLITIK'],
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J12',
  },
  {
    sourceGoalId: 'dccf7718-6c99-5068-8e97-8eb0a678b1d6',
    title: 'Leistungsstörungen im Kaufrecht systematisch analysieren',
    description:
      'Die lernende Person kann anhand konkreter Fälle die grundlegende Systematik des Rechts der Leistungsstörungen nachvollziehen und die gesetzgeberische Intention eines gerechten Interessenausgleichs einordnen.',
    requires: [legalTechniqueGoalId, interestBalanceGoalId],
    clusterId: legalClusterId,
    guidingIdeas: ['WW_GESELLSCHAFT', 'WW_POLITIK'],
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J13',
  },
  {
    sourceGoalId: '56716b6d-0159-5957-945c-f262449caecf',
    title: 'Schadensersatz neben der Leistung bei Nebenpflichtverletzung begründen',
    description:
      'Die lernende Person kann in konkreten Kaufrechtsfällen den Anspruch auf Schadensersatz neben der Leistung bei Nebenpflichtverletzung rechtstechnisch begründen und juristisch fundiert formulieren.',
    requires: [performanceDisruptionGoalId, legalClaimsGoalId],
    clusterId: legalClusterId,
    guidingIdeas: ['WW_GESELLSCHAFT', 'WW_POLITIK'],
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J13',
  },
  {
    sourceGoalId: '04715398-1711-5d77-93d4-88972ed07a77',
    title: 'Ansprüche bei verspäteter und unmöglicher Leistung begründen',
    description:
      'Die lernende Person kann in konkreten Kaufrechtsfällen Ansprüche und Rechte bei verspäteter Leistung und Unmöglichkeit rechtstechnisch begründen und juristisch fundiert formulieren.',
    requires: [performanceDisruptionGoalId, legalClaimsGoalId],
    clusterId: legalClusterId,
    guidingIdeas: ['WW_GESELLSCHAFT', 'WW_POLITIK'],
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J13',
  },
  {
    sourceGoalId: '50e98220-7421-520f-bf7e-ff0423c77ff8',
    title: 'Mangelhafte Leistung im Kaufrecht identifizieren',
    description:
      'Die lernende Person kann in konkreten Kaufrechtsfällen mangelhafte Leistungen anhand der Systematik der Mangelfreiheit identifizieren.',
    requires: [performanceDisruptionGoalId],
    clusterId: legalClusterId,
    guidingIdeas: ['WW_GESELLSCHAFT', 'WW_POLITIK'],
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J13',
  },
  {
    sourceGoalId: '2d2c784c-3a1e-5b32-a72f-ef2c22169b85',
    title: 'Vertragstypen und Pflichten der Vertragsparteien abgrenzen',
    description:
      'Die lernende Person kann in Fallbeispielen Vertragstypen identifizieren, Pflichten der Vertragsparteien aufzeigen und diese vom Kaufvertrag abgrenzen.',
    requires: [legalTechniqueGoalId],
    clusterId: legalClusterId,
    guidingIdeas: ['WW_GESELLSCHAFT', 'WW_POLITIK'],
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J13',
  },
  {
    sourceGoalId: 'ee4907aa-de79-5b61-8061-b58e9e1a7470',
    title: 'Strafbarkeit anhand des Deliktsaufbaus begründen',
    description:
      'Die lernende Person kann anhand des Aufbaus einer Straftat die Strafbarkeit einer Handlung begründen und objektive sowie subjektive Tatbestandsmerkmale prüfen.',
    requires: [youthCrimeElementsGoalId, legalTechniqueGoalId],
    clusterId: legalClusterId,
    guidingIdeas: ['WW_GESELLSCHAFT', 'WW_POLITIK'],
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J13',
  },
  {
    sourceGoalId: '3a8dabdf-1af6-5e06-b43e-772f16d046f1',
    title: 'Ordnungswidrigkeiten und strafbare Handlungen abgrenzen',
    description:
      'Die lernende Person kann Fallbeispiele Ordnungswidrigkeiten und strafbaren Handlungen zuordnen, mögliche Rechtsfolgen abschätzen und die gesetzgeberische Intention einordnen.',
    requires: [publicLawConsequencesGoalId, criminalLiabilityGoalId],
    clusterId: legalClusterId,
    guidingIdeas: ['WW_GESELLSCHAFT', 'WW_POLITIK'],
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J13',
  },
  {
    sourceGoalId: '09ce276b-f407-573e-ab8b-e91349d48173',
    title: 'Rechtfertigungs- und Entschuldigungsgründe beurteilen',
    description:
      'Die lernende Person kann an Strafrechtsfällen Rechtfertigungs- und Entschuldigungsgründe vor dem Hintergrund von Gerechtigkeit und allgemeinen Wertvorstellungen beurteilen.',
    requires: [criminalLiabilityGoalId],
    clusterId: legalClusterId,
    guidingIdeas: ['WW_GESELLSCHAFT', 'WW_POLITIK'],
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J13',
  },
  {
    sourceGoalId: 'a7bf736f-a5b9-5ac1-8b8e-16dfcf7a9749',
    title: 'Rechtsfolgen von Straftaten nach Strafzwecken beurteilen',
    description:
      'Die lernende Person kann Rechtsfolgen von Straftaten im Hinblick auf Strafzwecktheorien, Strafzumessung und rechtsstaatliche Prinzipien beurteilen.',
    requires: [criminalLiabilityGoalId],
    clusterId: legalClusterId,
    guidingIdeas: ['WW_GESELLSCHAFT', 'WW_POLITIK'],
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J13',
  },
  {
    sourceGoalId: '88a94b70-375c-5131-8926-c66efdcc845c',
    title: 'Preis- und Zinsniveauwirkungen makroökonomisch analysieren',
    description:
      'Die lernende Person kann Auswirkungen von Preis- und Zinsniveauentwicklungen auf private Haushalte, Unternehmen und Staat darstellen und dabei volkswirtschaftliche Modelle nutzen.',
    requires: [economicPolicyGrowthGoalId],
    clusterId: rootClusterId,
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J13',
  },
  {
    sourceGoalId: '7ce93a3b-53ac-547c-930e-bd3f6e9d3043',
    title: 'EZB-Entscheidungen mandatsbezogen nachvollziehen',
    description:
      'Die lernende Person kann geldpolitische Entscheidungen der Europäischen Zentralbank auf Grundlage monetärer und realwirtschaftlicher Größen nachvollziehen und mit Blick auf das Mandat einordnen.',
    requires: [priceInterestEffectsGoalId],
    clusterId: rootClusterId,
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J13',
  },
  {
    sourceGoalId: 'a989d6d1-f1ae-5d16-9a5c-6c37a182742e',
    title: 'Aktuelle Fragen zu Geld und Geldpolitik erörtern',
    description:
      'Die lernende Person kann aktuelle Fragen zu Geld und Geldpolitik fachlich fundiert erörtern.',
    requires: [ezbDecisionGoalId],
    clusterId: rootClusterId,
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J13',
  },
  {
    sourceGoalId: '1fa89de7-a24e-5211-bc74-af6c1c2e96dd',
    title: 'Leistungsbilanz und außenwirtschaftliches Gleichgewicht interpretieren',
    description:
      'Die lernende Person kann die Leistungsbilanz vor dem Hintergrund außenwirtschaftlichen Gleichgewichts interpretieren und mögliche volkswirtschaftliche Probleme auch mit Blick auf die Kapitalbilanz ableiten.',
    requires: [foreignTradePolicyGoalId, circularFlowGoalId],
    clusterId: rootClusterId,
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J13',
  },
  {
    sourceGoalId: '5faf10c2-c641-5ab0-9f05-a838a42b0bf2',
    title: 'Komplexe gesamtwirtschaftliche Problemstellungen vernetzt bearbeiten',
    description:
      'Die lernende Person kann Lösungsansätze für aktuelle komplexe gesamtwirtschaftliche Problemstellungen entwickeln und erörtern, indem sie erworbene Kompetenzen und volkswirtschaftliche Kenntnisse vernetzt anwendet.',
    requires: [balanceOfPaymentsGoalId, ezbDecisionGoalId, economicPolicyEvaluationGoalId],
    clusterId: rootClusterId,
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J13',
  },
]

const main = () => {
  const landscape = JSON.parse(readFileSync(canonicalPath, 'utf8')) as Landscape
  const goalsById = new Map(landscape.goals.map((goal) => [goal.id, goal]))
  const rootCluster = goalsById.get(rootClusterId)
  if (!rootCluster) throw new Error(`Missing canonical root cluster ${rootClusterId}`)
  rootCluster.contains = rootCluster.contains ?? []
  const cluster = goalsById.get(consumerClusterId)
  if (!cluster) throw new Error(`Missing canonical consumer cluster ${consumerClusterId}`)
  cluster.contains = cluster.contains ?? []

  if (!goalsById.has(entrepreneurshipClusterId)) {
    const entrepreneurshipCluster: Goal = {
      id: entrepreneurshipClusterId,
      title: 'Unternehmerisch denken und entscheiden',
      titleEn: 'Unternehmerisch denken und entscheiden',
      description:
        'BY-Ergänzungscluster für Arbeitsteilung, Unternehmensaufbau, Marketing, Geschäftsmodelle, Projektmanagement und grundlegende Unternehmensrechnung.',
      descriptionEn:
        'BY-Ergänzungscluster für Arbeitsteilung, Unternehmensaufbau, Marketing, Geschäftsmodelle, Projektmanagement und grundlegende Unternehmensrechnung.',
      weight: 0.9,
      tags: ['GK', 'LK'],
      contains: [],
      requires: ['6bf2d1cc-e745-50dd-a617-71c06a6c6945'],
      sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J8-J9',
      dimensionTags: {
        framework: 'canonical-gymnasium-economics',
        demandLevel: 'AB1',
        processCompetencies: [],
        guidingIdeas: ['WW_GESELLSCHAFT', 'WW_WIRTSCHAFT'],
        phase: 'E',
      },
      applicability: {
        jurisdiction: ['DE-BY'],
      },
      extendedData: {
        provenance: {
          sourceLandscapeId,
          sourceLandscapeTitle,
          sourceGoalId: 'a7f5eaf3-d85d-56a4-aff6-de4e68ada680',
        },
      },
      type: 'cluster',
    }
    landscape.goals.push(entrepreneurshipCluster)
    goalsById.set(entrepreneurshipClusterId, entrepreneurshipCluster)
  }
  if (!rootCluster.contains.includes(entrepreneurshipClusterId)) rootCluster.contains.push(entrepreneurshipClusterId)

  if (!goalsById.has(legalClusterId)) {
    const legalCluster: Goal = {
      id: legalClusterId,
      title: 'Rechtlich verantwortliches Handeln',
      titleEn: 'Rechtlich verantwortliches Handeln',
      description:
        'BY-Ergänzungscluster für grundlegende Rechtsfunktionen, Vertrags- und Kaufrecht, Fallanalyse, rechtssicheres Handeln und digitale Rechte.',
      descriptionEn:
        'BY-Ergänzungscluster für grundlegende Rechtsfunktionen, Vertrags- und Kaufrecht, Fallanalyse, rechtssicheres Handeln und digitale Rechte.',
      weight: 0.9,
      tags: ['GK', 'LK'],
      contains: [],
      requires: ['6bf2d1cc-e745-50dd-a617-71c06a6c6945'],
      sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J8',
      dimensionTags: {
        framework: 'canonical-gymnasium-economics',
        demandLevel: 'AB1',
        processCompetencies: [],
        guidingIdeas: ['WW_GESELLSCHAFT', 'WW_POLITIK'],
        phase: 'E',
      },
      applicability: {
        jurisdiction: ['DE-BY'],
      },
      extendedData: {
        provenance: {
          sourceLandscapeId,
          sourceLandscapeTitle,
          sourceGoalId: 'f03ecc3d-fd18-571b-bfec-bb0c61bc7187',
        },
      },
      type: 'cluster',
    }
    landscape.goals.push(legalCluster)
    goalsById.set(legalClusterId, legalCluster)
  }
  if (!rootCluster.contains.includes(legalClusterId)) rootCluster.contains.push(legalClusterId)

  supplements.forEach((draft) => {
    const id = canonicalGoalId(draft.sourceGoalId)
    const targetClusterId = draft.clusterId ?? consumerClusterId
    const targetCluster = goalsById.get(targetClusterId)
    if (!targetCluster) throw new Error(`Missing supplement target cluster ${targetClusterId}`)
    targetCluster.contains = targetCluster.contains ?? []
    if (!goalsById.has(id)) {
      const goal: Goal = {
        id,
        title: draft.title,
        titleEn: draft.title,
        description: draft.description,
        descriptionEn: draft.description,
        weight: 0.9,
        tags: ['GK', 'LK'],
        contains: [],
        requires: draft.requires,
        sourceRef: draft.sourceRef ?? 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht',
        dimensionTags: {
          framework: 'canonical-gymnasium-economics',
          demandLevel: 'AB1',
          processCompetencies: [],
          guidingIdeas: draft.guidingIdeas ?? ['WW_GESELLSCHAFT', 'WW_WIRTSCHAFT'],
          phase: phaseForDraft(draft),
        },
        applicability: {
          jurisdiction: ['DE-BY'],
        },
        extendedData: {
          provenance: {
            sourceLandscapeId,
            sourceLandscapeTitle,
            sourceGoalId: draft.sourceGoalId,
          },
        },
        type: 'atomic',
      }
      landscape.goals.push(goal)
      goalsById.set(id, goal)
    }
    const supplementGoal = goalsById.get(id)
    if (supplementGoal) {
      supplementGoal.requires = draft.requires
      supplementGoal.sourceRef = draft.sourceRef ?? 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht'
      supplementGoal.dimensionTags = supplementGoal.dimensionTags ?? {}
      supplementGoal.dimensionTags.phase = phaseForDraft(draft)
      supplementGoal.dimensionTags.guidingIdeas = draft.guidingIdeas ?? ['WW_GESELLSCHAFT', 'WW_WIRTSCHAFT']
    }

    landscape.goals.forEach((goal) => {
      if (goal.id === targetClusterId || !goal.contains?.includes(id)) return
      goal.contains = goal.contains.filter((childId) => childId !== id)
    })
    if (!targetCluster.contains?.includes(id)) targetCluster.contains?.push(id)
  })

  writeFileSync(canonicalPath, `${JSON.stringify(landscape, null, 2)}\n`)
  console.log(`Applied ${supplements.length} BY economics canonical supplements to ${path.relative(repoRoot, canonicalPath)}`)
}

main()
