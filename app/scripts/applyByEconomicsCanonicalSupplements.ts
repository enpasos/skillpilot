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
}

const appRoot = process.cwd()
const repoRoot = path.resolve(appRoot, '..')
const canonicalPath = path.resolve(repoRoot, 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json')
const rootClusterId = '96183c48-b499-54d7-8530-578f6ff40207'
const consumerClusterId = 'f14dcf9f-66c5-5907-9e06-08f59a9a0e13'
const entrepreneurshipClusterId = canonicalGoalId('J8-J9-unternehmerisch-denken-und-entscheiden')
const consumerBehaviorId = '5b5ed3cb-7c2c-5b0f-a515-c967d8d23644'
const sourceLandscapeId = '4959d7df-e430-5c1d-bb7b-873d6252a27f'
const sourceLandscapeTitle = 'Wirtschaft und Recht (Gymnasium)'

const uuidFromString = (value: string): string => {
  const hex = createHash('sha1').update(value).digest('hex').slice(0, 32)
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`
}

const canonicalGoalId = (sourceGoalId: string): string =>
  uuidFromString(`canonical-gymnasium-economics:DE-BY:${sourceGoalId}`)

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
const businessModelGoalId = canonicalGoalId('d6a5a9f0-36e0-5b98-836e-9c6e77e5e519')
const balanceSheetGoalId = canonicalGoalId('a1020ccf-e61a-5791-b3e7-821ef5222b7f')
const transactionBalanceGoalId = canonicalGoalId('a81d9138-f155-53ad-9457-d8e383c6297f')
const incomeAccountsGoalId = canonicalGoalId('4ecb96ce-092f-50d3-88df-fffbca4db5be')
const profitLossGoalId = canonicalGoalId('25a1e6f1-69de-5280-aaca-992d13dc9bc4')
const financialStatementsAnalysisGoalId = canonicalGoalId('01fa0918-3a8f-5600-a174-0a56cade5c53')

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
        sourceRef: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, J8',
        dimensionTags: {
          framework: 'canonical-gymnasium-economics',
          demandLevel: 'AB1',
          processCompetencies: [],
          guidingIdeas: draft.guidingIdeas ?? ['WW_GESELLSCHAFT', 'WW_WIRTSCHAFT'],
          phase: 'E',
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
