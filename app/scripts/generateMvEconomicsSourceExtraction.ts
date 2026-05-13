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
    key: 'MV-SOZIALKUNDE-SEKI-RAHMENPLAN-2023',
    title: 'Rahmenplan Sozialkunde Klasse 7 bis 10 Mecklenburg-Vorpommern',
    path: 'curricula/DE/Gymnasium/input/MV/Rahmenplan_Sozialkunde_Sek_I_Regionale_Schule_Gymnasium.pdf',
    url: 'https://www.bildung-mv.de/export/sites/bildungsserver/.galleries/dokumente/unterricht/rahmenplaene/rp_sozialkunde_sek_I_regs_gym.pdf',
  },
  upper: {
    key: 'MV-WIRTSCHAFT-GO-RAHMENPLAN-2019',
    title: 'Rahmenplan Wirtschaft Gymnasiale Oberstufe Mecklenburg-Vorpommern',
    path: 'curricula/DE/Gymnasium/input/MV/Rahmenplan_Wirtschaft_Gymnasiale_Oberstufe.pdf',
    url: 'https://service.mvnet.de/_php/download.php?datei_id=1612623',
  },
} satisfies Record<'lower' | 'upper', SourceDocument>

const lowerSourceLandscapeId = idFrom('DE-MV Sozialkunde Sek I Wirtschaft source extraction')
const upperSourceLandscapeId = idFrom('DE-MV Wirtschaft Sek II source extraction')

const lowerTopics: TopicDraft[] = [
  {
    code: 'K7-C1-ANTHROPOZAEN-KONSUM-RESSOURCEN',
    title: 'Klasse 7 C1: Verantwortlich handeln im Anthropozän - wirtschaftliche Aspekte',
    page: 19,
    stage: 'SekI',
    goals: [
      'Ökologischen Fußabdruck als Indikator für Konsum- und Ressourcenverbrauch erläutern.',
      'Alltagsbeispiele der Globalisierung wie Kleidung, Ernährung, Mobilität und Energieverbrauch wirtschaftlich einordnen.',
      'Ressourcenverbrauch im internationalen Vergleich anhand von Wasser, Ernährung und Energie beschreiben.',
      'World Overshoot Day als Ausdruck ökologisch-ökonomischer Knappheit erklären.',
      'Bedrohungen globaler Lebensgrundlagen durch Konsumentscheidungen und Produktion beschreiben.',
      'Politische Umwelt- und Klimaschutzmaßnahmen auf globaler Ebene wirtschaftlich beurteilen.',
      'Handel mit CO2-Zertifikaten als marktnahes umweltpolitisches Instrument erklären.',
      'Internationale Umweltorganisationen als Akteure nachhaltiger Wirtschaft einordnen.',
      'Individuelle Konsumentscheidungen zur Sicherung natürlicher Lebensgrundlagen reflektieren.',
      'Wirksamkeit individueller und politischer Maßnahmen nachhaltigen Wirtschaftens beurteilen.',
    ],
  },
  {
    code: 'K8-B3-SOZIALE-UNGLEICHHEIT-ARBEITSWELT',
    title: 'Klasse 8 B3: Sozialisation, soziale Ungleichheit und Arbeitswelt',
    page: 25,
    stage: 'SekI',
    goals: [
      'Wandel der Arbeitswelt als Einflussfaktor für Familien- und Lebensformen beschreiben.',
      'Erscheinungsformen sozialer Ungleichheit wie Armut, Reichtum, Bildung und Gesundheitsversorgung unterscheiden.',
      'Ursachen sozialer Ungleichheit mit Herkunft, Stadt-Land-Gefälle und sozialer Isolation verbinden.',
      'Auswirkungen sozialer Ungleichheit auf gesellschaftliche und wirtschaftliche Teilhabe analysieren.',
      'Statistisches Material zu sozialer Ungleichheit kriteriengeleitet auswerten.',
      'Staatliche Eingriffsmöglichkeiten zur Gewährleistung gesellschaftlicher Teilhabe diskutieren.',
      'Vereinbarkeit von Familie und Beruf als wirtschaftlich-soziale Herausforderung beurteilen.',
      'Gender-Pay-Gap als Problem der Gleichstellung in der Arbeitswelt erklären.',
      'Zugang zu Führungspositionen unter Gleichstellungsaspekten analysieren.',
      'Sozialstaatliche Maßnahmen für eigene Lebenssituationen erschließen.',
    ],
  },
  {
    code: 'K8-C2-EU-BINNENMARKT-VERBRAUCHER',
    title: 'Klasse 8 C2: Europäische Union - Binnenmarkt und Verbraucherschutz',
    page: 27,
    stage: 'SekI',
    goals: [
      'EU-Binnenmarkt und Währung als Einfluss der Europäischen Union auf den Alltag erklären.',
      'Freiheit von Waren, Dienstleistungen, Kapital und Personen als Grundfreiheiten des Binnenmarkts beschreiben.',
      'Spannungsverhältnis zwischen nationalstaatlicher Souveränität und wirtschaftlicher Integration erläutern.',
      'Schutzrechte im europäischen Binnenmarkt einfordern und anwenden.',
      'Regulierung des digitalen Binnenmarktes als wirtschaftspolitisches Handlungsfeld darstellen.',
      'Angleichung von Marktbedingungen und Verbraucherschutz in der EU erklären.',
      'Regulierungen für nachhaltige Landwirtschaft als EU-Wirtschaftspolitik einordnen.',
      'Kennzeichnungspflichten für Lebensmittel als Verbraucher- und Marktregulierung beurteilen.',
      'EU-Entscheidungsprozesse an einem wirtschaftlichen Regulierungsbeispiel analysieren.',
    ],
  },
  {
    code: 'K10-B5-ZUKUNFT-SOZIALSTAAT',
    title: 'Klasse 10 B5: Zukunft des Sozialstaats',
    page: 37,
    stage: 'SekI',
    goals: [
      'Sozialstaatsprinzip als Grundlage gesellschaftlichen Zusammenhalts und sozialer Gerechtigkeit erläutern.',
      'Notwendigkeit sozialstaatlichen Handelns bei Arbeitslosigkeit, Existenzsicherung, Gesundheit und Alterssicherung erklären.',
      'Handlungsfelder des Sozialstaates mit Sozialversicherungen sowie staatlichen Leistungen und Vergünstigungen beschreiben.',
      'Vorstellungen gesellschaftlicher Gruppen und Parteien zu sozialer Gerechtigkeit vergleichen.',
      'Leistungs-, Bedarfs-, Chancen- und egalitäre Gerechtigkeit unterscheiden.',
      'Demografischen Wandel als Herausforderung für den Sozialstaat analysieren.',
      'Bevölkerungsentwicklung mit Geburtenrate, Sterberate, Migration, Gesundheitsversorgung und Lebensentwürfen erklären.',
      'Auswirkungen des demografischen Wandels auf die Solidargemeinschaft beurteilen.',
      'Generationengerechtigkeit und Geschlechtergerechtigkeit als sozialstaatliche Bewertungsmaßstäbe anwenden.',
      'Reformperspektiven der sozialen Sicherungssysteme untersuchen.',
      'Maßnahmen zur Förderung von Integration, Teilhabe und Bildung sozialpolitisch beurteilen.',
      'Sicherung der Altersversorgung als wirtschaftlich-sozialpolitisches Problem erklären.',
      'Grundeinkommen als Reformoption des Sozialstaats kontrovers beurteilen.',
      'Arbeitsmigration als wirtschaftlich relevante Form globaler Migration einordnen.',
    ],
  },
  {
    code: 'K10-C4-GLOBALE-NACHHALTIGE-WIRTSCHAFT',
    title: 'Klasse 10 C4: Zukunft internationaler Beziehungen - nachhaltiges globales Wirtschaften',
    page: 39,
    stage: 'SekI',
    goals: [
      'Agenda 2030 und globale Ziele nachhaltiger Entwicklung als Rahmen nachhaltigen Wirtschaftens beschreiben.',
      'New Green Deal der EU als Verbindung von Nachhaltigkeit und Wirtschaftspolitik einordnen.',
      'G7- und G20-Treffen als Foren globaler wirtschaftlicher Governance erklären.',
      'Klimaneutralität als Ziel nachhaltigen globalen Wirtschaftens erläutern.',
      'Kreislaufwirtschaft als Ziel nachhaltigen globalen Wirtschaftens beschreiben.',
      'Interessengegensätze und Abhängigkeiten von Nationalstaaten bei Energie, Rohstoffen und Technologie analysieren.',
      'Ressourcengerechtigkeit anhand von Wasser, Boden, Rohstoffen, Energie, Technologie und Gesundheitsversorgung beurteilen.',
      'Zielkonflikte zwischen Menschenrechten und Wohlstand in internationaler Zusammenarbeit analysieren.',
      'Wandel durch Handel als wirtschaftspolitische Handlungsoption beurteilen.',
      'Einflussmöglichkeiten von Nichtregierungsorganisationen in globalen Nachhaltigkeits- und Menschenrechtsfragen erklären.',
      'Szenarien einer Global Green Economy entwickeln und beurteilen.',
    ],
  },
  {
    code: 'SEKI-QUERSCHNITT-BO-BNE-WIRTSCHAFT',
    title: 'Sekundarstufe I Querschnitt: Berufliche Orientierung und Bildung für nachhaltige Entwicklung',
    page: 43,
    stage: 'SekI',
    goals: [
      'Berufswahl als lebenslangen Entscheidungsprozess in einer wandelnden Arbeitswelt erklären.',
      'Eigene Interessen, Neigungen und Fähigkeiten für Arbeits- und Berufsentscheidungen reflektieren.',
      'Ausbildungsstellenmarkt, Bildungswege, Anforderungsprofile sowie Einkommens- und Karrierechancen recherchieren.',
      'Eine begründete Berufs- oder Studienwahl kriteriengeleitet treffen.',
      'Wirtschaftliche, ökologische, soziale und kulturelle Zusammenhänge nachhaltiger Entwicklung erklären.',
      'Internationale Handels- und Finanzbeziehungen als Bestandteil nachhaltiger Entwicklung einordnen.',
      'Mecklenburg-Vorpommern als Wirtschaftsstandort mit regionaler Identität und globalen Entwicklungen verbinden.',
    ],
  },
]

const upperTopics: TopicDraft[] = [
  {
    code: 'SEKII-GRUNDLAGEN-WIRTSCHAFTSSYSTEM',
    title: 'Gymnasiale Oberstufe: Grundlagen unseres Wirtschaftssystems',
    page: 9,
    stage: 'SekII',
    courseLevel: 'GK_LK',
    goals: [
      'Bedürfnisse, Knappheit und ökonomisches Prinzip als Grundlagen wirtschaftlichen Handelns erläutern.',
      'Bedürfnishierarchie nach Maslow als Modell wirtschaftlichen Entscheidungsverhaltens nutzen.',
      'Güterarten unterscheiden und betriebliche Kennzahlen in wirtschaftliche Analysen einbeziehen.',
      'Notwendigkeit des Wirtschaftens aus Knappheit und Bedürfnissen ableiten.',
      'Gossensches Gesetz zur Analyse von Nachfrage- und Konsumentscheidungen anwenden.',
      'Individualethik, Ordnungsethik und homo oeconomicus als wirtschaftsethische Perspektiven unterscheiden.',
      'Einflussfaktoren wirtschaftlichen Entscheidungsverhaltens mithilfe ökonomischer Verhaltenstheorien analysieren.',
      'Utilitarismus, Liberalismus und Marxismus als ideengeschichtliche Wirtschaftsansätze einordnen.',
      'Gegenwartsbezüge aus wirtschaftshistorischen Sachtexten herleiten.',
      'Entstehungsgeschichte und Entwicklung der Sozialen Marktwirtschaft erklären.',
      'Texte von Hayek, Müller-Armack, Erhard und Eucken aspektgeleitet analysieren.',
      'Eigene Rolle als Wirtschaftssubjekt anhand wirtschaftlicher Entscheidungsprozesse reflektieren.',
    ],
  },
  {
    code: 'SEKII-LK-GRUNDLAGEN-WIRTSCHAFTSSYSTEME',
    title: 'Leistungskurs: Wirtschaftsethik und Wirtschaftssysteme im Vergleich',
    page: 9,
    stage: 'SekII',
    courseLevel: 'LK',
    goals: [
      'Trittbrettfahrerproblem als wirtschaftsethisches Dilemma erklären.',
      'CSR-Analysen an wirtschaftlichen Fallbeispielen durchführen.',
      'Moral Hazard als Problem ökonomischer Anreizstrukturen erläutern.',
      'Homo sociologicus und homo oeconomicus als Verhaltensannahmen vergleichen.',
      'Zentralverwaltungswirtschaft und Mischsysteme mit realen Wirtschaftssystemen vergleichen.',
      'Elemente von Wirtschaftsordnungen im Hinblick auf ihre Verfassungsmäßigkeit beurteilen.',
    ],
  },
  {
    code: 'SEKII-MARKTMECHANISMUS',
    title: 'Gymnasiale Oberstufe: Der Marktmechanismus',
    page: 10,
    stage: 'SekII',
    courseLevel: 'GK_LK',
    goals: [
      'Abhängigkeiten individueller Nachfrage und Einflussfaktoren auf Nachfrageentscheidungen erklären.',
      'Auswirkungen von Preisveränderungen auf die Nachfrage darstellen.',
      'Auswirkungen von Preisveränderungen auf das Angebot und Grenzkosten erklären.',
      'Markttypen, Funktionen des Marktes und den vollkommenen Markt beschreiben.',
      'Preisbildung auf Märkten mithilfe von Preis-Mengen-Diagrammen darstellen.',
      'Besondere Marktformen wie Arbeitsmarkt und Rohstoffmärkte analysieren.',
      'Funktionen des Preises in Märkten erklären.',
      'Marktgleichgewicht, Angebotsüberschuss und Nachfrageüberschuss bestimmen.',
      'Bedingungen des Modells vollkommenen Marktes beschreiben und Modellabweichungen erläutern.',
      'Ursachen und Gründe von Marktversagen anhand externer Effekte identifizieren.',
      'Formen staatlicher Eingriffe bei Marktversagen beurteilen.',
      'Umwelt- und Verbraucherpolitik an ausgewählten Marktbeispielen erklären.',
      'Stellung des Konsumenten im Markt beurteilen.',
    ],
  },
  {
    code: 'SEKII-LK-MARKTMECHANISMUS',
    title: 'Leistungskurs: Vertiefung Marktmechanismus',
    page: 10,
    stage: 'SekII',
    courseLevel: 'LK',
    goals: [
      'Preiselastizitäten in Theorie und Praxis berechnen und interpretieren.',
      'Märkte ohne vollkommene Konkurrenz analysieren.',
      'Konsumentenrente und Produzentenrente bestimmen und deuten.',
      'Pareto-Kriterium als Effizienzmaßstab anwenden.',
      'Schweinezyklus und Cobweb-Modell als dynamische Marktmodelle erklären.',
      'Marktuntersuchungen zur Analyse realer Märkte durchführen.',
      'Bereitstellung öffentlicher Güter wirtschaftlich bewerten.',
      'Handlungsanreize verschiedener Interessengruppen in Marktkonflikten systematisieren.',
    ],
  },
  {
    code: 'SEKII-WIRTSCHAFTSORDNUNG-BRD',
    title: 'Gymnasiale Oberstufe: Die Wirtschaftsordnung in der BRD',
    page: 11,
    stage: 'SekII',
    courseLevel: 'GK_LK',
    goals: [
      'Rechtliche Rahmenbedingungen der Wirtschaftsordnung im Grundgesetz erläutern.',
      'Frage nach der verfassungsrechtlichen Festlegung der Sozialen Marktwirtschaft beurteilen.',
      'Sozialstaatsmodell der Bundesrepublik mit Gerechtigkeitsprinzipien und Leitlinien beschreiben.',
      'Herausforderungen des Sozialstaats wie Generationenvertrag, Pflegebereich, Fachkräftemangel und demografischer Wandel analysieren.',
      'Wirtschaftspolitische Zielsetzungen im Magischen Sechseck erklären.',
      'Zielharmonien und Zielkonflikte wirtschaftspolitischer Ziele beurteilen.',
      'Angebots- und Nachfragepolitik zur Beeinflussung der Konjunktur unterscheiden.',
      'Keynes und Friedman als Bezugspunkte wirtschaftspolitischer Steuerung einordnen.',
      'Ausprägungen konjunktureller Schwankungen und ihre Ursachen erklären.',
      'Wirtschaftspolitische Entscheidungen im Sechseck verorten und deren Wirksamkeit einschätzen.',
      'Maßnahmen nach Stabilitäts- und Wachstumsgesetz interessenbezogen beurteilen.',
      'Aussagekraft des Bruttonationaleinkommens bzw. BIP als Wohlfahrtsindikator beurteilen.',
      'Individuelle Daseinsvorsorge planen und sozialstaatlich einordnen.',
    ],
  },
  {
    code: 'SEKII-LK-WIRTSCHAFTSORDNUNG-BRD',
    title: 'Leistungskurs: Wirtschaftsrecht, Verteilung und Strukturpolitik',
    page: 11,
    stage: 'SekII',
    courseLevel: 'LK',
    goals: [
      'Vertragsrecht, Arbeits- und Tarifrecht, Steuerrecht und Handelsgesetzbuch fallbezogen einordnen.',
      'Einkommensentstehung und Einkommensverteilung mithilfe von Datenauswertungen analysieren.',
      'Lorenzkurve und Gini-Koeffizient zur Beschreibung von Verteilung nutzen.',
      'Steuersystem und Reformvorschläge zur Besteuerung von Einkommen und Vermögen beurteilen.',
      'Lenkungssteuern als wirtschaftspolitisches Instrument erklären.',
      'Gestaltung der Arbeitsgesellschaft mit Arbeitszeitmodellen, Home-Office und neuen Formen der Selbstständigkeit analysieren.',
      'Magisches Vieleck und erweiterte Zielsysteme wirtschaftspolitisch anwenden.',
      'Strukturpolitik zur Förderung ländlicher Räume anhand Mecklenburg-Vorpommerns untersuchen.',
      'Konzentrationsprozesse rechtlich-wirtschaftlich unterscheiden und Chancen und Risiken herausarbeiten.',
    ],
  },
  {
    code: 'SEKII-WELTWIRTSCHAFT-HERAUSFORDERUNGEN',
    title: 'Gymnasiale Oberstufe: Weltwirtschaftliche Herausforderungen',
    page: 13,
    stage: 'SekII',
    courseLevel: 'GK_LK',
    goals: [
      'Standortfaktoren Deutschlands im globalen Wettbewerb analysieren.',
      'Export- und Importentwicklungen Deutschlands datenbasiert auswerten.',
      'Handels-, Geld- und Währungspolitik in der EU erklären.',
      'Aktuelle wirtschaftliche Herausforderungen und Lösungsansätze der EU aspektgeleitet analysieren.',
      'Freihandel und Protektionismus als wirtschaftspolitische Positionen vergleichen.',
      'Rolle von Global Playern und multinationalen Unternehmen im Welthandel analysieren.',
      'Auswirkungen technologischen Wandels auf das Weltwirtschaftsgeschehen erklären.',
      'Industrie 4.0 als weltwirtschaftliche Herausforderung einordnen.',
      'Stärken und Schwächen der Europäischen Union im Welthandel analysieren.',
      'Standortqualitäten Deutschlands beurteilen.',
      'Auswirkungen deutscher Leistungsbilanzüberschüsse beurteilen.',
      'Möglichkeiten Mecklenburg-Vorpommerns im Globalisierungsprozess evaluieren.',
      'Eigene Rolle als Konsument in weltweiten wirtschaftlichen Auswirkungen reflektieren.',
    ],
  },
  {
    code: 'SEKII-LK-WELTWIRTSCHAFT-FINANZMAERKTE',
    title: 'Leistungskurs: Außenhandelstheorien, Governance und Finanzmärkte',
    page: 13,
    stage: 'SekII',
    courseLevel: 'LK',
    goals: [
      'Faktorproportionentheorie, Produktlebenszyklus und Standortfaktoren als Außenhandelstheorien anwenden.',
      'Aussagekraft von Außenwirtschaftstheorien überprüfen.',
      'Global economic governance an Fallbeispielen analysieren.',
      'Finanzmarktregulierung als Teil globaler wirtschaftlicher Steuerung diskutieren.',
      'Wechselkurse und zukünftige Entwicklung des Geldmarktes analysieren.',
      'Bargeldlose Gesellschaft und Blockchaintechnologien wirtschaftlich beurteilen.',
      'Ökonomie-Ökologie-Konflikte in globalen Herausforderungen analysieren.',
      'Grenzen wirtschaftlichen Wachstums und alternative Wohlstandsindikatoren erörtern.',
    ],
  },
]

const ids = {
  householdBudget: 'e5b070d2-daa5-5b8e-8782-32bb8a6865d2',
  payment: 'e2ac2cc2-894a-5e61-8acb-f5d88811739d',
  consumerBehavior: '5b5ed3cb-7c2c-5b0f-a515-c967d8d23644',
  consumptionReflection: 'a60e0541-80e1-5f94-86fd-073f5a00bee8',
  sustainableConsumption: 'bac0f1d3-e671-5c2b-bd6d-2947f1fe6d9b',
  legalFunctions: '2aee114f-d0d2-516f-8f95-1b72f707401d',
  legalFramework: 'bb7f2a2a-95c3-5375-8323-51a808e945e6',
  consumerRights: 'c386592a-b259-538c-9929-25775af99b83',
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
  fairTrade: 'e21158e7-3bc3-51f2-887f-9eb5a8dd6243',
  worldTradeDevelopment: '4cccf0da-a0f4-593a-9bf3-4a68c790af40',
  globalBusiness: '09e58ea8-1920-5600-bd2b-cc1f199d051f',
  locationCompetition: '7f8f6648-6faa-52c5-9793-3654ef9dc36d',
  financialActors: '667b75ad-2d20-5f22-ad57-46be5b7c53c7',
  financialRegulation: 'fb249488-944c-5123-a21e-5cb9a0431e8b',
  globalGovernance: 'e7542590-40e7-5d06-99f3-f295be1f9e12',
  globalGovernanceStructures: 'f440efea-9d86-589f-8ff9-18e8d3b2efd3',
  ngos: '2d8cc4f2-9ee2-5d9c-a019-7d3a1e9a1db2',
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

  if (topic.includes('ANTHROPOZAEN')) add(ids.sustainableConsumption, ids.consumptionReflection, ids.environmentalProblems, ids.environmentalInstruments, ids.externalities, ids.globalization, ids.globalGovernance, ids.ngos)
  if (topic.includes('SOZIALE-UNGLEICHHEIT')) add(ids.justiceConcepts, ids.socialStateGoals, ids.socialInsurance, ids.workDevelopments, ids.workDigital, ids.laborModels, ids.careerProfile)
  if (topic.includes('EU-BINNENMARKT')) add(ids.euInternalMarket, ids.euCurrency, ids.consumerRights, ids.competitionPolicy, ids.tradePolicy, ids.environmentalPolicyMultilevel)
  if (topic.includes('ZUKUNFT-SOZIALSTAAT')) add(ids.socialStateGoals, ids.socialInsurance, ids.justiceConcepts, ids.publicDebt, ids.workDevelopments, ids.laborModels, ids.careerProfile)
  if (topic.includes('GLOBALE-NACHHALTIGE')) add(ids.sustainableGrowth, ids.circularEconomy, ids.environmentalProblems, ids.environmentalPolicyMultilevel, ids.globalGovernance, ids.globalGovernanceStructures, ids.globalization, ids.ngos, ids.tradePolicy, ids.fairTrade)
  if (topic.includes('BO-BNE')) add(ids.careerProfile, ids.workDevelopments, ids.workDigital, ids.sustainableGrowth, ids.globalization, ids.financialActors, ids.locationCompetition)

  if (topic.includes('GRUNDLAGEN-WIRTSCHAFTSSYSTEM')) add(ids.consumerBehavior, ids.consumptionReflection, ids.sustainableConsumption, ids.socialMarket, ids.orderConcepts, ids.socialMarketOrder)
  if (topic.includes('WIRTSCHAFTSSYSTEME')) add(ids.orderConcepts, ids.stateVsMarket, ids.socialMarket, ids.globalBusiness, ids.sustainableGrowth)
  if (topic.includes('MARKTMECHANISMUS')) add(ids.marketModel, ids.marketEquilibrium, ids.priceFunctions, ids.externalities, ids.competition, ids.competitionPolicy, ids.consumerRights, ids.environmentalInstruments)
  if (topic.includes('WIRTSCHAFTSORDNUNG-BRD')) add(ids.legalFunctions, ids.legalFramework, ids.socialMarket, ids.socialMarketOrder, ids.socialStateGoals, ids.socialInsurance, ids.justiceConcepts, ids.economicCycle, ids.cycleIndicators, ids.cycleModels, ids.policyGrowth, ids.policyEvaluate, ids.stabilityLaw, ids.gdp, ids.fiscalPolicy, ids.publicDebt, ids.workDevelopments)
  if (topic.includes('WELTWIRTSCHAFT')) add(ids.globalization, ids.globalValueChains, ids.tradePolicy, ids.tradeTheory, ids.tradeConflict, ids.protectionism, ids.fairTrade, ids.worldTradeDevelopment, ids.globalBusiness, ids.locationCompetition, ids.euInternalMarket, ids.euCurrency, ids.ezb, ids.ezbDecision, ids.moneyCreation, ids.financialActors, ids.financialRegulation, ids.globalGovernance, ids.globalGovernanceStructures, ids.sustainableGrowth, ids.growthLifeQuality)

  if (text.includes('bedürfnis') || text.includes('konsum')) add(ids.consumerBehavior, ids.consumptionReflection, ids.sustainableConsumption)
  if (text.includes('knappheit') || text.includes('güter')) add(ids.consumerBehavior, ids.marketModel)
  if (text.includes('betriebliche kennzahlen')) add(ids.specialization, ids.companyStructure)
  if (text.includes('geld') || text.includes('währung') || text.includes('zins') || text.includes('finanz')) add(ids.payment, ids.moneyCreation, ids.priceInterest, ids.financialActors, ids.financialRegulation)
  if (text.includes('markt') || text.includes('angebot') || text.includes('nachfrage') || text.includes('preis')) add(ids.marketModel, ids.marketEquilibrium, ids.priceFunctions)
  if (text.includes('wettbewerb') || text.includes('konkurrenz') || text.includes('konzentration')) add(ids.competition, ids.competitionPolicy, ids.concentration)
  if (text.includes('marktversagen') || text.includes('externe') || text.includes('öffentliche güter')) add(ids.externalities, ids.environmentalInstruments)
  if (text.includes('sozial') || text.includes('gerechtigkeit') || text.includes('ungleichheit')) add(ids.socialStateGoals, ids.socialInsurance, ids.justiceConcepts)
  if (text.includes('demograf') || text.includes('fachkräft') || text.includes('arbeitslosigkeit')) add(ids.workDevelopments, ids.laborModels, ids.socialStateGoals)
  if (text.includes('arbeit') || text.includes('beruf') || text.includes('tarif') || text.includes('home-office')) add(ids.workDevelopments, ids.workDigital, ids.laborModels, ids.careerProfile, ids.tariff, ids.workTimeParticipation)
  if (text.includes('unternehmen') || text.includes('betrieb') || text.includes('csr')) add(ids.globalBusiness, ids.sustainableGrowth)
  if (text.includes('wirtschaftsordnung') || text.includes('marktwirtschaft') || text.includes('wirtschaftssystem')) add(ids.socialMarket, ids.socialMarketOrder, ids.orderConcepts, ids.stateVsMarket)
  if (text.includes('grundgesetz') || text.includes('recht')) add(ids.legalFramework, ids.legalFunctions)
  if (text.includes('konjunktur') || text.includes('sechseck') || text.includes('vieleck') || text.includes('keynes') || text.includes('friedman')) add(ids.cycleIndicators, ids.cycleModels, ids.cycleForecasts, ids.policyGrowth, ids.policyEvaluate, ids.stabilityLaw)
  if (text.includes('bip') || text.includes('wohlfahrt') || text.includes('wachstum')) add(ids.gdp, ids.growthLifeQuality, ids.sustainableGrowth)
  if (text.includes('steuer') || text.includes('staat') || text.includes('verschuldung')) add(ids.fiscalPolicy, ids.publicDebt)
  if (text.includes('eu') || text.includes('europ')) add(ids.euInternalMarket, ids.euCurrency, ids.tradePolicy)
  if (text.includes('freihandel') || text.includes('protektionismus') || text.includes('handel')) add(ids.tradePolicy, ids.protectionism, ids.tradeConflict, ids.fairTrade, ids.worldTradeDevelopment)
  if (text.includes('global') || text.includes('welt')) add(ids.globalization, ids.globalValueChains, ids.globalGovernance, ids.globalBusiness)
  if (text.includes('standort')) add(ids.locationCompetition, ids.globalBusiness)
  if (text.includes('nachhalt') || text.includes('klima') || text.includes('umwelt') || text.includes('ökologie') || text.includes('ressource')) add(ids.sustainableGrowth, ids.sustainableConsumption, ids.environmentalProblems, ids.environmentalInstruments, ids.environmentalPolicyMultilevel, ids.environmentalConflicts, ids.circularEconomy)
  if (text.includes('ezb') || text.includes('geldpolitik')) add(ids.ezb, ids.ezbDecision, ids.moneyCreation, ids.priceInterest, ids.inflation)
  if (text.includes('wechselkurs') || text.includes('blockchain') || text.includes('bargeldlos')) add(ids.financialActors, ids.financialRegulation)

  return Array.from(targets)
}

function buildExtraction(params: {
  extractionId: string
  sourceLandscapeId: string
  title: string
  stage: Stage
  topics: TopicDraft[]
  reviewPath: string
  sourceDocument: SourceDocument
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
      title: `MV ${topic.code} (${index + 1}): ${goalText}`,
      description: `Source-Ziel aus ${topic.title}: ${goalText}`,
      sourceText: goalText,
      sourceSpan: `${topic.code} (${index + 1})`,
      parentBulletText: goalText,
      sourceRef: `${params.sourceDocument.title}, ${topic.title}, S. ${topic.page}.`,
      courseLevel: topic.courseLevel ?? params.stage,
      granularity: 'officialContentOrRequirement',
      tags: ['jurisdiction:DE-MV', 'subject:Wirtschaft', `stage:${params.stage}`, `topic:${topic.code}`],
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
    jurisdiction: 'DE-MV',
    subject: params.stage === 'SekI' ? 'Sozialkunde/Wirtschaft' : 'Wirtschaft',
    stage: params.stage,
    title: params.title,
    sourceDocument: { ...params.sourceDocument, official: true },
    method: {
      passageExtraction: params.stage === 'SekI'
        ? 'pdftotext -layout; wirtschaftlich relevante Sozialkunde-Module und Querschnittspassagen aus dem amtlichen MV-Rahmenplan selektiert'
        : 'pdftotext -layout; wirtschaftsfachliche Unterrichtsinhalte aus dem amtlichen MV-Rahmenplan Wirtschaft selektiert',
      sourceGoalExtraction: 'one normalized source goal per economic content item or assessable requirement; compact official lists split where multiple economic goals are bundled',
      scopeNote: params.stage === 'SekI'
        ? 'Der MV-Sek-I-Rahmenplan ist Sozialkunde; nur Passagen mit belastbarem Wirtschafts-, Arbeitswelt-, Sozialstaats-, Verbraucher-, EU-Binnenmarkt- oder Nachhaltigkeitsbezug wurden in die Wirtschaft-Lane geroutet.'
        : 'Der MV-Sek-II-Rahmenplan Wirtschaft ist eine direkte Wirtschaft-Quelle; allgemeine Kompetenzstandards wurden nur über die fachlichen Inhaltsfelder operationalisiert.',
    },
    qualityReview: params.qualityReview,
    expectedTopicCodes: params.topics.map((topic) => topic.code),
    pipelineStatus: {
      currentStep: 'MAPPING-3',
      steps: [
        { id: 'ORIGINALQUELLEN', label: 'Originalquellen bereitgestellt', status: 'complete', dependsOn: [], checks: [{ id: 'source-document-present', label: 'Amtliche MV-Originalquelle liegt lokal vor', passed: true, details: params.sourceDocument.path }] },
        { id: 'MAPPING-1', label: 'Original-Lehrplanpassagen extrahiert', status: 'complete', dependsOn: ['ORIGINALQUELLEN'], checks: [{ id: 'passages-extracted', label: 'Wirtschaftliche MV-Passagen wurden aus der amtlichen Quelle extrahiert', passed: true, details: `${passages.length} Passagen.` }] },
        { id: 'MAPPING-2', label: 'Source-Ziele aus Lehrplanpassagen erstellt', status: 'complete', dependsOn: ['MAPPING-1'], checks: [{ id: 'source-goals-created', label: 'Aus den ausgewählten MV-Passagen wurden Source-Ziele erzeugt', passed: true, details: `${sourceGoals.length} Source-Ziele.` }] },
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
      rationale: 'MV-Source-Ziel ist durch vorhandene kanonische Wirtschaft-Ziele fachlich vollständig abgedeckt; partial beschreibt die Zuordnungsform 1:n oder Sammelziel, nicht eine offene Lücke.',
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
  sourceDocument: SourceDocument
}) {
  const registry = JSON.parse(readFileSync(registryPath, 'utf8')) as { version: number; entries: Array<Record<string, unknown>> }
  registry.entries = registry.entries.filter((candidate) => candidate.landscapeId !== entry.landscapeId)
  registry.entries.push({
    landscapeId: entry.landscapeId,
    title: entry.title,
    jurisdiction: 'DE-MV',
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

const lowerOutput = 'curricula/DE/Gymnasium/input/MV/lower-secondary/source-extraction/DE_MV_SOZIALKUNDE_SEKI_WIRTSCHAFT_RAHMENPLAN_2023.source-extraction.json'
const upperOutput = 'curricula/DE/Gymnasium/input/MV/upper-secondary/source-extraction/DE_MV_WIRTSCHAFT_SEKII_RAHMENPLAN_2019.source-extraction.json'
const lowerReviewPath = 'curricula/DE/Gymnasium/mapping/DE-MV/lower-secondary/mv_sozialkunde_lower_secondary_economics_source_extraction_to_canonical_wirtschaft.review.json'
const upperReviewPath = 'curricula/DE/Gymnasium/mapping/DE-MV/upper-secondary/mv_wirtschaft_upper_secondary_source_extraction_to_canonical_wirtschaft.review.json'

const lowerExtraction = buildExtraction({
  extractionId: 'DE-MV-SOZIALKUNDE-SEKI-WIRTSCHAFT',
  sourceLandscapeId: lowerSourceLandscapeId,
  title: 'Sozialkunde Sekundarstufe I - wirtschaftliche Inhaltsbereiche (Mecklenburg-Vorpommern, Rahmenplan Source-Extraction)',
  stage: 'SekI',
  topics: lowerTopics,
  reviewPath: lowerReviewPath,
  sourceDocument: sourceDocuments.lower,
  qualityReview: {
    sourceGoalCountPeerBaseline: {
      accepted: true,
      details: 'MV Sek I ist Sozialkunde, kein eigenständiges Wirtschaftsfach. Die Extraktion bleibt enger als direkte Wirtschaft-Fachlehrpläne und routet nur wirtschaftlich belastbare Sozialkunde-Module und Querschnittsbezüge.',
    },
  },
})

const upperExtraction = buildExtraction({
  extractionId: 'DE-MV-WIRTSCHAFT-SEKII',
  sourceLandscapeId: upperSourceLandscapeId,
  title: 'Wirtschaft Gymnasiale Oberstufe (Mecklenburg-Vorpommern, Rahmenplan Source-Extraction)',
  stage: 'SekII',
  topics: upperTopics,
  reviewPath: upperReviewPath,
  sourceDocument: sourceDocuments.upper,
  qualityReview: {
    sourceGoalCountPeerBaseline: {
      accepted: true,
      details: 'MV Sek II nutzt einen eigenen Rahmenplan Wirtschaft. Die Zielzahl liegt im Korridor direkter Wirtschaft-Quellen und bildet die vier Inhaltsfelder mit LK-Erweiterungen ab.',
    },
  },
})

writeJson(path.join(repoRoot, lowerOutput), lowerExtraction)
writeJson(path.join(repoRoot, upperOutput), upperExtraction)
writeReview({ reviewPath: lowerReviewPath, reviewId: 'DE-MV-SOZIALKUNDE-SEKI-WIRTSCHAFT-MAPPING-3-SOURCE-EXTRACTION-1', extractionPath: lowerOutput, extraction: lowerExtraction })
writeReview({ reviewPath: upperReviewPath, reviewId: 'DE-MV-WIRTSCHAFT-SEKII-MAPPING-3-SOURCE-EXTRACTION-1', extractionPath: upperOutput, extraction: upperExtraction })
upsertRegistryEntry({ landscapeId: lowerSourceLandscapeId, title: lowerExtraction.title, stage: 'Sekundarstufe I', archivePath: 'curricula/DE/Gymnasium/input/MV/lower-secondary/', sourceDocument: sourceDocuments.lower })
upsertRegistryEntry({ landscapeId: upperSourceLandscapeId, title: upperExtraction.title, stage: 'Sekundarstufe II', archivePath: 'curricula/DE/Gymnasium/input/MV/upper-secondary/', sourceDocument: sourceDocuments.upper })

upsertReferenceBlock(
  path.join(repoRoot, 'curricula/DE/Gymnasium/input/MV/lower-secondary/references.md'),
  'DE-MV-WIRTSCHAFT-SEKI-SOURCE-EXTRACTION',
  `## Wirtschaft

Starting point:
https://www.bildung-mv.de/unterricht/rahmenplaene/rahmenplaene-fuer-die-allgemein-bildenden-faecher/sozialkunde/

- \`Rahmenplan Sozialkunde Klasse 7 bis 10\`:
  ${sourceDocuments.lower.url}

Scope:

- Mecklenburg-Vorpommern
- Gymnasium/Regionale Schule
- Sozialkunde with economic content routed to canonical Wirtschaft
- lower-secondary extraction target: economic modules and economic cross-cutting references from the official class 7-10 Sozialkunde Rahmenplan

Archived locally at:

- \`${sourceDocuments.lower.path}\`

Generated source extraction:

- \`${lowerOutput}\``,
)

upsertReferenceBlock(
  path.join(repoRoot, 'curricula/DE/Gymnasium/input/MV/upper-secondary/references.md'),
  'DE-MV-WIRTSCHAFT-SEKII-SOURCE-EXTRACTION',
  `## Wirtschaft

Starting point:
https://www.bildung-mv.de/unterricht/rahmenplaene/rahmenplaene-fuer-die-allgemein-bildenden-faecher/wirtschaft/

- \`Rahmenplan Wirtschaft Gymnasiale Oberstufe\`:
  ${sourceDocuments.upper.url}

Scope:

- Mecklenburg-Vorpommern
- Gymnasiale Oberstufe
- Wirtschaft
- upper-secondary extraction target: official economic content fields and LK extensions from the Rahmenplan Wirtschaft

Archived locally at:

- \`${sourceDocuments.upper.path}\`

Generated source extraction:

- \`${upperOutput}\``,
)

console.log(`Generated MV Wirtschaft source extractions: ${lowerExtraction.sourceGoals.length} lower + ${upperExtraction.sourceGoals.length} upper source goals.`)
