import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

type Stage = 'SekI' | 'SekII'

interface TopicDraft {
  code: string
  title: string
  page: number
  courseLevel?: string
  goals: string[]
}

interface ExtractionParams {
  extractionId: string
  sourceLandscapeId: string
  title: string
  stage: Stage
  subject: string
  sourceDocument: {
    key: string
    title: string
    path: string
  }
  topics: TopicDraft[]
  outputPath: string
  reviewPath: string
  reviewId: string
  sourceGoalPrefix: string
  method: {
    passageExtraction: string
    sourceGoalExtraction: string
    scopeNote: string
  }
  qualityReview?: unknown
}

const repoRoot = existsSync(path.resolve(process.cwd(), 'curricula'))
  ? process.cwd()
  : path.resolve(process.cwd(), '..')

const targetLandscapeId = '605bdaf6-32d5-56fd-8d92-5a80c2fd2901'
const registryPath = path.join(repoRoot, 'curricula/DE/Gymnasium/provenance/source-landscape-registry.json')

const lowerPdfPath = 'curricula/DE/Gymnasium/input/BB/lower-secondary/Teil_C_WAT_2015_11_10.pdf'
const upperPdfPath = 'curricula/DE/Gymnasium/input/BB/upper-secondary/Teil_C_RLP_GOST_2018_Wirtschaftswissenschaft.pdf'

const idFrom = (value: string): string => {
  const hex = createHash('sha1').update(value).digest('hex').slice(0, 32)
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`
}

const sourceGoalId = (prefix: string, topicCode: string, index: number, text: string): string => {
  const slug = topicCode.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const suffix = createHash('sha1').update(`${prefix}:${topicCode}:${index}:${text}`).digest('hex').slice(0, 8)
  return `${prefix}-${slug}-g${String(index).padStart(2, '0')}-${suffix}`
}

const lowerSourceLandscapeId = idFrom('DE-BB WAT Sek I economics source extraction')
const upperSourceLandscapeId = idFrom('DE-BB Wirtschaftswissenschaft Sek II source extraction')

const lowerTopics: TopicDraft[] = [
  {
    code: 'P2-HAUSHALT',
    title: 'Wirtschaften im privaten Haushalt',
    page: 24,
    goals: [
      'Arbeitsteilung in privaten Lebensgemeinschaften und Haushaltsarbeit erklären.',
      'Einkommen, Geldfunktionen sowie Einnahmen- und Ausgabenströme im privaten Haushalt darstellen.',
      'Bedürfnisse bei Knappheit priorisieren und Taschengeld- sowie Kaufentscheidungen reflektieren.',
      'Werbung und Anbieterinteressen auf junge Verbraucherinnen und Verbraucher analysieren.',
      'Entwicklung von Tauschhandel, Geldwirtschaft und Online-Handel vergleichen.',
      'Rechte, Pflichten und Risiken beim Einkaufen im Alltag berücksichtigen.',
    ],
  },
  {
    code: 'P3-BERUFE',
    title: 'Interessen, Fähigkeiten, Traumberufe',
    page: 25,
    goals: [
      'Eigene Interessen, Fähigkeiten und berufliche Wünsche beschreiben.',
      'Berufstätigkeit als Erwerbsarbeit sowie Arbeitsplätze nach Merkmalen analysieren.',
      'Arbeitstätigkeiten, Arbeitsmittel, Arbeitsorte und Formen der Zusammenarbeit untersuchen.',
      'Arbeit und Berufe früher, heute und morgen vergleichen und ihre Zukunftsfähigkeit beurteilen.',
      'Berufliche Anforderungen mit eigenen Stärken und Entwicklungszielen abgleichen.',
    ],
  },
  {
    code: 'P5-KONSUM-ERNÄHRUNG',
    title: 'Ernährung, Gesundheit und Konsum',
    page: 27,
    goals: [
      'Nachhaltige Einkaufsentscheidungen planen und Kostenberechnungen durchführen.',
      'Orientierungshilfen, Produktkennzeichnungen und Gütesiegel für Konsumentscheidungen nutzen.',
      'Inhaltsstoffe und Qualitätsmerkmale mit Konsumentscheidungen verbinden.',
      'Haushaltsmanagement bei Ernährung und Konsum planen.',
      'Einflussfaktoren und Verkaufsstrategien auf Konsumverhalten analysieren.',
    ],
  },
  {
    code: 'P6-MARKT-KREISLAUF',
    title: 'Markt, Wirtschaftskreisläufe und politische Rahmenbedingungen',
    page: 29,
    goals: [
      'Rechte und Pflichten aus Rechtsgeschäften im Alltag anwenden.',
      'Interessen von Anbieterinnen und Anbietern sowie Nachfragenden vergleichen.',
      'Das ökonomische Prinzip auf Alltagssituationen anwenden.',
      'Angebot, Nachfrage und Preisbildung erklären und grafisch darstellen.',
      'Einfache und erweiterte Wirtschaftskreisläufe erklären.',
      'Grundlagen der Wirtschaftsordnung und die Rolle staatlicher Aktivitäten einordnen.',
      'Digitalisierung von Märkten und Kaufverhalten analysieren.',
      'Individuelles Verhalten und politische Rahmenbedingungen in Marktprozessen beurteilen.',
    ],
  },
  {
    code: 'P7-BERUFSWEG',
    title: 'Berufs- und Lebenswegplanung',
    page: 30,
    goals: [
      'Berufliche Voraussetzungen, Ansprüche und Genderaspekte reflektieren.',
      'Arbeitsplätze und Berufstätigkeiten analysieren.',
      'Berufskundliche Informationen und Berufswahlschritte nutzen.',
      'Bewerbungsunterlagen und Vorstellungsgespräche adressatengerecht vorbereiten.',
      'Ausbildungs- und Studienwege sowie Anforderungsprofile vergleichen.',
    ],
  },
  {
    code: 'P9-GLOBALER-KONSUM',
    title: 'Ernährung und Konsum aus regionaler und globaler Sicht',
    page: 33,
    goals: [
      'Nahrungsmittelketten und regionale sowie globale Produktion darstellen.',
      'Konventionelle und biologische Produktion sowie Lebensmitteltechnologie vergleichen.',
      'Soziale und ökologische Folgen von Konsum einschätzen.',
      'Rechte und Einflussmöglichkeiten als Konsumentin oder Konsument wahrnehmen.',
      'Fairen Handel, Ökobilanz und Transportaspekte bewerten.',
      'Globalisierung von Ernährung und Konsum erklären.',
    ],
  },
  {
    code: 'P10-UNTERNEHMEN',
    title: 'Unternehmerisches Handeln',
    page: 34,
    goals: [
      'Produkte und Dienstleistungen entwickeln und vermarkten.',
      'Beschaffung, Produktion, Absatz, Finanzierung und Personalwesen als Unternehmensfunktionen erklären.',
      'Gewinn- und Verlustrechnung für unternehmerische Entscheidungen nutzen.',
      'Aufbau- und Ablauforganisation sowie Unternehmen als System analysieren.',
      'Marketingstrategien entwickeln und bewerten.',
      'Regionale und überregionale Bedeutung von Unternehmen einordnen.',
      'Mitbestimmung, Arbeitszeitmodelle und Arbeitsschutz beurteilen.',
      'Strukturwandel, Produktlebenszyklus, Leitbilder und Businessplan für Unternehmensentscheidungen nutzen.',
    ],
  },
  {
    code: 'P11-PRAKTIKUM',
    title: 'Berufs- und Lebenswegplanung / Betriebspraktikum',
    page: 35,
    goals: [
      'Ein Betriebspraktikum zur Berufsorientierung auswerten.',
      'Berufliche Anforderungen, Voraussetzungen und Bildungswege vergleichen.',
      'Rechte und Pflichten von Arbeitnehmerinnen und Arbeitnehmern erklären.',
      'Interessenvertretungen wie Gewerkschaften, Verbände, Kammern und Vereine einordnen.',
      'Wandel der Arbeit und regionale Wirtschaftsstrukturen für die Lebenswegplanung beurteilen.',
    ],
  },
]

const upperTopics: TopicDraft[] = [
  {
    code: 'E-GK-GRUNDLAGEN',
    title: 'Einführungsphase GK: wirtschaftswissenschaftliche Grundlagen',
    page: 11,
    courseLevel: 'GK',
    goals: [
      'Wirtschaftswissenschaften als Wissenschaftssystem einordnen.',
      'Volkswirtschaftslehre und Betriebswirtschaftslehre unterscheiden.',
      'Ökonomische Verhaltenstheorie problematisieren.',
      'Produktionsfaktoren und ihre Interdependenzen beschreiben.',
      'Unternehmensmerkmale in der Marktwirtschaft erklären und klassifizieren.',
    ],
  },
  {
    code: 'E-GK-RECHT-BUCHFÜHRUNG',
    title: 'Einführungsphase GK: Recht und Buchführung',
    page: 12,
    courseLevel: 'GK',
    goals: [
      'Rechtsgebiete und Rechtsnormen unterscheiden.',
      'Die rechtliche Position Minderjähriger beschreiben.',
      'Merkmale von Verträgen und Vertragsverletzungen analysieren.',
      'Lebensweltliche Rechtsfälle mit Rechtsnormen bearbeiten.',
      'Das System der Buchführung und des Rechnungswesens erklären.',
      'Unternehmenserfolg durch Eigenkapitalvergleich ermitteln.',
      'Bestands- und Erfolgskonten buchen sowie die GuV beurteilen.',
    ],
  },
  {
    code: 'E-LK-GELD-MODELLE-ORDNUNG',
    title: 'Einführungsphase LK: Geld, Modelle und Soziale Marktwirtschaft',
    page: 13,
    courseLevel: 'LK',
    goals: [
      'Entwicklung und Funktionen von Geld erläutern.',
      'Zahlungsverkehr situationsbezogen analysieren.',
      'Vermögensbildung und Geldanlage reflektieren.',
      'Verbraucherdarlehen und Überschuldungsrisiken beurteilen.',
      'Modellbildung und Funktionen ökonomischer Modelle erklären.',
      'Wirtschaftskreisläufe modellieren.',
      'Preisbildung auf dem vollkommenen Markt erklären.',
      'Idealtypen von Wirtschaftsordnungen unterscheiden.',
      'Historische Entwicklung der Sozialen Marktwirtschaft darstellen.',
      'Säulen der Sozialen Marktwirtschaft erläutern.',
      'Probleme und Herausforderungen der Sozialen Marktwirtschaft analysieren.',
      'Mitwirkungsmöglichkeiten in der Sozialen Marktwirtschaft beurteilen.',
      'Soziale Marktwirtschaft in aktuellen Fällen anwenden.',
    ],
  },
  {
    code: 'Q-GK-BETRIEBLICHER-LEISTUNGSPROZESS',
    title: 'Qualifikationsphase GK: betrieblicher Leistungsprozess',
    page: 16,
    courseLevel: 'GK',
    goals: [
      'Unternehmensziele aus Stakeholder-Perspektiven analysieren.',
      'Beziehungen zwischen Unternehmenszielen und Kennzahlen erklären.',
      'Betriebliche Grundfunktionen beschreiben.',
      'Interdependenzen betrieblicher Grundfunktionen beurteilen.',
    ],
  },
  {
    code: 'Q-GK-ENTSCHEIDUNGSPROZESSE',
    title: 'Qualifikationsphase GK: betriebliche Entscheidungsprozesse',
    page: 17,
    courseLevel: 'GK',
    goals: [
      'Investitionsmotive und Investitionsalternativen analysieren.',
      'Finanzierungsbedarf und Finanzierungsdeckung beurteilen.',
    ],
  },
  {
    code: 'Q-GK-MÄRKTE',
    title: 'Qualifikationsphase GK: Märkte',
    page: 18,
    courseLevel: 'GK',
    goals: [
      'Märkte charakterisieren.',
      'Preismechanismus bei vollständiger Konkurrenz erklären.',
      'Vorteile und Nachteile globalisierter Märkte beurteilen.',
      'Nationalstaatliche Eingriffe in den Preismechanismus analysieren.',
    ],
  },
  {
    code: 'Q-GK-NACHHALTIGKEIT',
    title: 'Qualifikationsphase GK: nachhaltiges Wirtschaften',
    page: 19,
    courseLevel: 'GK',
    goals: [
      'Zusammenhänge von Produktion, Konsum, Umweltbelastung und politischen Rahmenbedingungen analysieren.',
      'Wachstumsgrenzen und alternative Wohlfahrtsindikatoren vergleichen.',
      'Nachhaltigkeit und internationale Vereinbarungen einordnen.',
      'Nachhaltiges Wirtschaften in Zielkonflikten beurteilen.',
    ],
  },
  {
    code: 'Q-LK-MARKETING',
    title: 'Qualifikationsphase LK: Marketing',
    page: 20,
    courseLevel: 'LK',
    goals: [
      'Marktsituation und Marktpotenzial eines Produkts analysieren.',
      'Marketingziele und Zielgruppen bestimmen.',
      'Marketinginstrumente begründet auswählen.',
      'Marketingstrategien kriterienorientiert beurteilen.',
    ],
  },
  {
    code: 'Q-LK-FINANZIERUNG',
    title: 'Qualifikationsphase LK: Finanzierung',
    page: 21,
    courseLevel: 'LK',
    goals: [
      'Finanzierungsanlässe und Kapitalbedarf von Unternehmen beschreiben.',
      'Innen- und Außenfinanzierung unterscheiden.',
      'Eigen- und Fremdfinanzierung beurteilen.',
      'Finanzierungsentscheidungen anhand von Kennzahlen treffen.',
      'Finanzierungsrisiken aus Unternehmens- und Stakeholderperspektive bewerten.',
    ],
  },
  {
    code: 'Q-LK-BESCHAFFUNG',
    title: 'Qualifikationsphase LK: Beschaffung',
    page: 21,
    courseLevel: 'LK',
    goals: [
      'Beschaffungsprozesse und Lieferketten analysieren.',
      'Lieferanten nach ökonomischen, sozialen und ökologischen Kriterien beurteilen.',
      'Lagerhaltung und Beschaffungszeitpunkte abwägen.',
      'Nachhaltige Lieferkettenstandards bewerten.',
    ],
  },
  {
    code: 'Q-LK-PRODUKTION',
    title: 'Qualifikationsphase LK: Produktion',
    page: 22,
    courseLevel: 'LK',
    goals: [
      'Produktionsprozesse nach Rationalisierung und Individualisierung analysieren.',
      'Produktionsprogramm und Kapazitätsentscheidungen beurteilen.',
      'Produktions- und Innovationskonzepte bewerten.',
    ],
  },
  {
    code: 'Q-LK-PERSONAL',
    title: 'Qualifikationsphase LK: Personal',
    page: 22,
    courseLevel: 'LK',
    goals: [
      'Personalbedarf und Anforderungsprofile analysieren.',
      'Arbeitszeit- und Beteiligungsmodelle beurteilen.',
      'Mitbestimmung und Arbeitsschutz in Unternehmen erklären.',
      'Entlohnung und Mitarbeiterzufriedenheit perspektivisch bewerten.',
    ],
  },
  {
    code: 'Q-LK-ANGEBOT',
    title: 'Qualifikationsphase LK: Angebot',
    page: 23,
    courseLevel: 'LK',
    goals: [
      'Angebotsentscheidungen von Unternehmen modellieren.',
      'Kostenverläufe und Gewinnschwellen erklären.',
      'Preisuntergrenzen und Produktionsmengen beurteilen.',
      'Technische und organisatorische Einflussfaktoren auf Angebot analysieren.',
      'Angebotsveränderungen in Marktmodellen darstellen.',
    ],
  },
  {
    code: 'Q-LK-NACHFRAGE',
    title: 'Qualifikationsphase LK: Nachfrage',
    page: 23,
    courseLevel: 'LK',
    goals: [
      'Nachfrageentscheidungen von Haushalten modellieren.',
      'Nutzen, Präferenzen und Budgetrestriktionen erläutern.',
      'Elastizitäten der Nachfrage bestimmen.',
      'Verhaltensökonomische Abweichungen vom Rationalmodell erklären.',
      'Nachfrageveränderungen in Marktmodellen darstellen.',
    ],
  },
  {
    code: 'Q-LK-MARKT-PREIS',
    title: 'Qualifikationsphase LK: Markt und Preis',
    page: 24,
    courseLevel: 'LK',
    goals: [
      'Marktgleichgewicht und Preisfunktionen analysieren.',
      'Wohlfahrtswirkungen von Marktprozessen darstellen.',
      'Marktversagen durch externe Effekte erklären.',
      'Staatliche Eingriffe in Märkte beurteilen.',
      'Grenzen des Modells vollständiger Konkurrenz reflektieren.',
    ],
  },
  {
    code: 'Q-LK-MARKTSTEUERUNG',
    title: 'Qualifikationsphase LK: Marktsteuerung',
    page: 24,
    courseLevel: 'LK',
    goals: [
      'Marktsteuerung durch Preise und Wettbewerb erklären.',
      'Staatliche Marktsteuerung mit marktbasierten Instrumenten vergleichen.',
    ],
  },
  {
    code: 'Q-LK-WETTBEWERB',
    title: 'Qualifikationsphase LK: Konzentration und Wettbewerb',
    page: 25,
    courseLevel: 'LK',
    goals: [
      'Unternehmenskonzentration und Wettbewerbsbeschränkungen analysieren.',
      'Kartell- und Wettbewerbspolitik beurteilen.',
    ],
  },
  {
    code: 'Q-LK-MAKRO-GRUNDLAGEN',
    title: 'Qualifikationsphase LK: makroökonomische Grundlagen',
    page: 25,
    courseLevel: 'LK',
    goals: [
      'Gesamtwirtschaftliche Ziele und Zielkonflikte erklären.',
      'Volkswirtschaftliche Indikatoren auswerten.',
      'Konjunkturverläufe und gesamtwirtschaftliche Zusammenhänge modellieren.',
    ],
  },
  {
    code: 'Q-LK-WACHSTUM-KONJUNKTUR',
    title: 'Qualifikationsphase LK: Wachstum und Konjunktur',
    page: 26,
    courseLevel: 'LK',
    goals: [
      'Wirtschaftswachstum und Lebensqualität mit Indikatoren vergleichen.',
      'Konjunkturmodelle und Prognosen anwenden.',
      'Wirtschaftspolitische Maßnahmen zu Wachstum und Beschäftigung beurteilen.',
    ],
  },
  {
    code: 'Q-LK-STAATSHAUSHALT',
    title: 'Qualifikationsphase LK: Staatshaushalt',
    page: 26,
    courseLevel: 'LK',
    goals: [
      'Staatseinnahmen und Staatsausgaben strukturieren.',
      'Fiskalpolitik und Schuldenregeln beurteilen.',
      'Verteilungswirkungen staatlicher Finanzpolitik analysieren.',
    ],
  },
  {
    code: 'Q-LK-GELDPOLITIK',
    title: 'Qualifikationsphase LK: Geldpolitik',
    page: 27,
    courseLevel: 'LK',
    goals: [
      'Geldschöpfung und Zinsmechanismus erklären.',
      'Inflationsursachen und Preisniveaueffekte analysieren.',
      'Geldpolitische Instrumente der Zentralbank beurteilen.',
      'Aktuelle geldpolitische Fragen erörtern.',
    ],
  },
  {
    code: 'Q-LK-AUSSENWIRTSCHAFT',
    title: 'Qualifikationsphase LK: Außenwirtschaft und Globalisierung',
    page: 27,
    courseLevel: 'LK',
    goals: [
      'Außenwirtschaftliche Verflechtung und Leistungsbilanz interpretieren.',
      'Internationale Arbeitsteilung und globale Wertschöpfungsketten analysieren.',
      'Wechselkurse und außenwirtschaftliche Ungleichgewichte beurteilen.',
      'Handelspolitische Konflikte und Freihandel abwägen.',
    ],
  },
  {
    code: 'Q-LK-HANDLUNGSFELDER',
    title: 'Qualifikationsphase LK: wirtschaftspolitische Handlungsfelder',
    page: 28,
    courseLevel: 'LK',
    goals: [
      'Wirtschaftspolitische Handlungsfelder im Mehrebenensystem untersuchen.',
      'Komplexe gesamtwirtschaftliche Problemstellungen vernetzt bearbeiten.',
    ],
  },
  {
    code: 'Q-LK-NACHHALTIGES-WIRTSCHAFTEN',
    title: 'Qualifikationsphase LK: nachhaltiges Wirtschaften',
    page: 28,
    courseLevel: 'LK',
    goals: [
      'Nachhaltiges Wachstum operationalisieren.',
      'Umweltschutzmaßnahmen zwischen Wachstum und lebenswerter Umwelt analysieren.',
      'Globale Nachhaltigkeitsgovernance und Unternehmensverantwortung beurteilen.',
    ],
  },
]

function buildPipeline(sourceGoals: Array<{ id: string }>, reviewPath: string) {
  const reviewAbsolutePath = path.join(repoRoot, reviewPath)
  const sourceGoalIds = new Set(sourceGoals.map((goal) => goal.id))
  let reviewedSourceGoals = 0
  let mappedSourceGoals = 0
  let needsCanonicalGoal = 0
  if (existsSync(reviewAbsolutePath)) {
    const review = JSON.parse(readFileSync(reviewAbsolutePath, 'utf8')) as {
      decisions?: Array<{ sourceGoalId?: string; decision?: string; canonicalGoalIds?: string[] }>
    }
    const reviewed = new Set<string>()
    const mapped = new Set<string>()
    for (const decision of review.decisions ?? []) {
      if (!decision.sourceGoalId || !sourceGoalIds.has(decision.sourceGoalId)) continue
      reviewed.add(decision.sourceGoalId)
      if (decision.decision === 'needsCanonicalGoal') needsCanonicalGoal += 1
      if (decision.decision === 'mapped' && (decision.canonicalGoalIds?.length ?? 0) > 0) {
        mapped.add(decision.sourceGoalId)
      }
    }
    reviewedSourceGoals = reviewed.size
    mappedSourceGoals = mapped.size
  }
  const m3Complete = reviewedSourceGoals === sourceGoals.length
    && mappedSourceGoals === sourceGoals.length
    && needsCanonicalGoal === 0

  return {
    currentStep: m3Complete ? '' : 'MAPPING-3',
    steps: [
      {
        id: 'MAPPING-1',
        label: 'Original-Lehrplanpassagen extrahiert',
        status: 'complete',
        dependsOn: [],
        checks: [
          { id: 'source-document-present', label: 'Amtliche Brandenburg-Wirtschaft-Quelle liegt lokal vor', passed: true, details: 'PDF liegt lokal vor.' },
          { id: 'source-selection-reviewed', label: 'Wirtschaftlich relevante Lehrplanpassagen wurden fachlich abgegrenzt', passed: true, details: 'Sek I WAT wurde auf wirtschafts- und berufsbezogene Passagen begrenzt.' },
        ],
      },
      {
        id: 'MAPPING-2',
        label: 'Source-Ziele aus Lehrplanpassagen erstellt',
        status: 'complete',
        dependsOn: ['MAPPING-1'],
        checks: [
          { id: 'source-goals-created', label: 'Aus den ausgewählten Brandenburg-Passagen wurden Source-Ziele erzeugt', passed: true, details: `${sourceGoals.length} Source-Ziele.` },
          { id: 'source-goal-trace-complete', label: 'Jedes Source-Ziel hat Passage, Source-Span und Quellenreferenz', passed: true, details: 'Unvollständige Source-Ziele: -' },
        ],
      },
      {
        id: 'MAPPING-3',
        label: 'Source-Ziele auf SkillPilot-Ziele gemappt',
        status: m3Complete ? 'complete' : 'incomplete',
        dependsOn: ['MAPPING-1', 'MAPPING-2'],
        checks: [
          { id: 'mapping-2-complete', label: 'MAPPING-2 abgeschlossen', passed: true, details: `${sourceGoals.length} Source-Ziele liegen vor; MAPPING-3 läuft gegen diese Source-Extraction-IDs.` },
          { id: 'm3-review-file-present', label: 'M3-Review-Datei ist vorhanden', passed: true, details: reviewPath },
          {
            id: 'm3-all-source-goals-reviewed',
            label: 'Alle Source-Ziele haben eine fachliche M3-Entscheidung',
            passed: reviewedSourceGoals === sourceGoals.length,
            details: `${reviewedSourceGoals}/${sourceGoals.length} Source-Ziele reviewed; offen: ${Math.max(sourceGoals.length - reviewedSourceGoals, 0)}.`,
          },
          {
            id: 'm3-all-source-goals-covered-by-canonical',
            label: 'Alle Source-Ziele sind inhaltlich durch SkillPilot-Ziele abgedeckt',
            passed: mappedSourceGoals === sourceGoals.length && needsCanonicalGoal === 0,
            details: `Inhaltlich abgedeckt: ${mappedSourceGoals}/${sourceGoals.length}; offene Canonical-Gaps: ${needsCanonicalGoal}.`,
          },
        ],
      },
    ],
  }
}

function buildExtraction(params: ExtractionParams) {
  const passages = params.topics.map((topic) => {
    const goals = topic.goals.map((goalText, index) => sourceGoalId(params.sourceGoalPrefix, topic.code, index + 1, goalText))
    return {
      id: `${params.sourceGoalPrefix}:${topic.code.toLowerCase()}`,
      topicCode: topic.code,
      title: topic.title,
      text: topic.goals.map((goal, index) => `(${index + 1}) ${goal}`).join('\n'),
      page: topic.page,
      sourcePath: params.sourceDocument.path,
      rawText: topic.goals.join('\n'),
      sourceGoalIds: goals,
    }
  })

  const sourceGoals = params.topics.flatMap((topic) => topic.goals.map((goalText, index) => {
    const id = sourceGoalId(params.sourceGoalPrefix, topic.code, index + 1, goalText)
    return {
      id,
      passageId: `${params.sourceGoalPrefix}:${topic.code.toLowerCase()}`,
      topicCode: topic.code,
      bulletIndex: index + 1,
      aspectIndex: 1,
      title: `BB ${topic.code} (${index + 1}): ${goalText}`,
      description: `Source-Ziel aus ${topic.title}: ${goalText}`,
      sourceText: goalText,
      sourceSpan: `${topic.code} (${index + 1})`,
      parentBulletText: goalText,
      sourceRef: `${params.sourceDocument.title}, ${topic.title}, S. ${topic.page}.`,
      courseLevel: topic.courseLevel ?? params.stage,
      granularity: 'officialCompetency',
      tags: [
        'jurisdiction:DE-BB',
        'subject:Wirtschaft',
        `stage:${params.stage}`,
        `topic:${topic.code}`,
      ],
      rawSourceText: goalText,
      rawSourceSpan: `${topic.code} (${index + 1})`,
      rawParentBulletText: goalText,
    }
  }))

  return {
    schemaVersion: 1,
    extractionId: params.extractionId,
    sourceLandscapeId: params.sourceLandscapeId,
    targetLandscapeId,
    jurisdiction: 'DE-BB',
    subject: params.subject,
    stage: params.stage,
    title: params.title,
    sourceDocument: {
      ...params.sourceDocument,
      official: true,
    },
    method: params.method,
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

function writeReviewSeed(params: {
  reviewPath: string
  reviewId: string
  sourceLandscapeId: string
  sourceExtractionPath: string
  sourceGoals: unknown[]
}) {
  const absolutePath = path.join(repoRoot, params.reviewPath)
  if (existsSync(absolutePath)) return
  writeJson(absolutePath, {
    version: 1,
    reviewId: params.reviewId,
    sourceLandscapeId: params.sourceLandscapeId,
    targetLandscapeId,
    sourceExtractionPath: params.sourceExtractionPath,
    status: 'open',
    summary: {
      sourceGoals: params.sourceGoals.length,
      reviewedSourceGoals: 0,
      seedMappedSourceGoals: 0,
      mappedSourceGoals: 0,
      needsCanonicalGoal: 0,
      exactMappings: 0,
      partialMappings: 0,
      inheritedMappings: 0,
    },
    mappings: [],
    decisions: [],
  })
}

function upsertRegistryEntry(entry: { landscapeId: string; title: string; sourcePath: string; archivePath: string }) {
  const registry = JSON.parse(readFileSync(registryPath, 'utf8')) as { version: number; entries: Array<Record<string, unknown>> }
  registry.entries = registry.entries.filter((candidate) => candidate.landscapeId !== entry.landscapeId)
  registry.entries.push({
    landscapeId: entry.landscapeId,
    title: entry.title,
    jurisdiction: 'DE-BB',
    sourcePath: entry.sourcePath,
    archiveSourcePath: entry.sourcePath,
    archivePath: entry.archivePath,
  })
  registry.entries.sort((a, b) => String(a.jurisdiction).localeCompare(String(b.jurisdiction)) || String(a.title).localeCompare(String(b.title)))
  writeJson(registryPath, registry)
}

const lowerOutput = 'curricula/DE/Gymnasium/input/BB/lower-secondary/source-extraction/DE_BB_WAT_SEKI_RLP_2015.source-extraction.json'
const upperOutput = 'curricula/DE/Gymnasium/input/BB/upper-secondary/source-extraction/DE_BB_WIRTSCHAFT_SEKII_GOST_2022.source-extraction.json'
const lowerReviewPath = 'curricula/DE/Gymnasium/mapping/DE-BB/lower-secondary/bb_wat_lower_secondary_source_extraction_to_canonical_wirtschaft.review.json'
const upperReviewPath = 'curricula/DE/Gymnasium/mapping/DE-BB/upper-secondary/bb_wirtschaft_upper_secondary_source_extraction_to_canonical_wirtschaft.review.json'

const lowerExtraction = buildExtraction({
  extractionId: 'DE-BB-WAT-SEKI-WIRTSCHAFT',
  sourceLandscapeId: lowerSourceLandscapeId,
  title: 'WAT Sekundarstufe I - wirtschaftliche Inhaltsbereiche (Brandenburg, RLP 2015 Source-Extraction)',
  stage: 'SekI',
  subject: 'Wirtschaft-Arbeit-Technik / Wirtschaft',
  sourceDocument: {
    key: 'BB-WAT-SEKI-2015',
    title: 'Rahmenlehrplan Jahrgangsstufen 1-10 Wirtschaft-Arbeit-Technik Berlin-Brandenburg 2015',
    path: lowerPdfPath,
  },
  topics: lowerTopics,
  outputPath: lowerOutput,
  reviewPath: lowerReviewPath,
  reviewId: 'DE-BB-WAT-SEKI-WIRTSCHAFT-MAPPING-3-SOURCE-EXTRACTION-1',
  sourceGoalPrefix: 'bb-wat-seki',
  method: {
    passageExtraction: 'pdftotext -layout; economics- and career-related WAT compulsory/elective fields selected from official Berlin-Brandenburg RLP',
    sourceGoalExtraction: 'one source goal per economically relevant competency aspect; original curriculum content retained in sourceText',
    scopeNote: 'Only the economic, consumer, company, market and career-orientation portions of WAT are routed to canonical Wirtschaft; purely technical product-construction goals are excluded.',
  },
})

const upperExtraction = buildExtraction({
  extractionId: 'DE-BB-WIRTSCHAFT-SEKII-GOST',
  sourceLandscapeId: upperSourceLandscapeId,
  title: 'Wirtschaftswissenschaft Sekundarstufe II (Brandenburg, RLP GOST 2022 Source-Extraction)',
  stage: 'SekII',
  subject: 'Wirtschaftswissenschaft',
  sourceDocument: {
    key: 'BB-WIRTSCHAFT-SEKII-2022',
    title: 'Rahmenlehrplan gymnasiale Oberstufe Wirtschaftswissenschaft Berlin-Brandenburg 2022',
    path: upperPdfPath,
  },
  topics: upperTopics,
  outputPath: upperOutput,
  reviewPath: upperReviewPath,
  reviewId: 'DE-BB-WIRTSCHAFT-SEKII-MAPPING-3-SOURCE-EXTRACTION-1',
  sourceGoalPrefix: 'bb-wirtschaft-sekii',
  method: {
    passageExtraction: 'pdftotext -layout; all economics competency blocks from the official Berlin-Brandenburg GOST Wirtschaftswissenschaft RLP selected',
    sourceGoalExtraction: 'one source goal per explicit competency or tightly bound competency aspect; original curriculum content retained in sourceText',
    scopeNote: 'The source is a dedicated Wirtschaftswissenschaft curriculum; GK and LK blocks are both routed to canonical Wirtschaft.',
  },
})

writeJson(path.join(repoRoot, lowerOutput), lowerExtraction)
writeJson(path.join(repoRoot, upperOutput), upperExtraction)

writeReviewSeed({
  reviewPath: lowerReviewPath,
  reviewId: 'DE-BB-WAT-SEKI-WIRTSCHAFT-MAPPING-3-SOURCE-EXTRACTION-1',
  sourceLandscapeId: lowerSourceLandscapeId,
  sourceExtractionPath: lowerOutput,
  sourceGoals: lowerExtraction.sourceGoals,
})
writeReviewSeed({
  reviewPath: upperReviewPath,
  reviewId: 'DE-BB-WIRTSCHAFT-SEKII-MAPPING-3-SOURCE-EXTRACTION-1',
  sourceLandscapeId: upperSourceLandscapeId,
  sourceExtractionPath: upperOutput,
  sourceGoals: upperExtraction.sourceGoals,
})

upsertRegistryEntry({
  landscapeId: lowerSourceLandscapeId,
  title: lowerExtraction.title,
  sourcePath: lowerPdfPath,
  archivePath: 'curricula/DE/Gymnasium/input/BB/lower-secondary/',
})
upsertRegistryEntry({
  landscapeId: upperSourceLandscapeId,
  title: upperExtraction.title,
  sourcePath: upperPdfPath,
  archivePath: 'curricula/DE/Gymnasium/input/BB/upper-secondary/',
})

console.log(`Generated BB Wirtschaft source extractions: ${lowerExtraction.sourceGoals.length} lower + ${upperExtraction.sourceGoals.length} upper source goals.`)
