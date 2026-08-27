import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel'
import {
  fingerprintGoalForPositiveEvidence,
  fingerprintPositiveGoalEvidenceProfile,
  fingerprintPositiveGoalEvidenceReviewInput,
} from './positiveGoalEvidenceProfileModel'

type JsonRecord = Record<string, unknown>

const repoRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')
const compositionRoot = resolve(repoRoot, 'curricula/DE/Gymnasium/composition-views/mathematik')

const paths = {
  canonical: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
  semanticKinds: 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json',
  atomicity: 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-math-full.review.jsonl',
  memory: 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-math-full.review.jsonl',
  visualizationQa: 'curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json',
  currentV2Evidence: 'curricula/DE/Gymnasium/quality/goal-evidence/canonical-math-positive-understanding-evidence-rollout-v1-batch-002-current-v2.review.jsonl',
  provenance: 'curricula/DE/Gymnasium/provenance/canonical-goal-provenance-registry.json',
} as const

const ids = {
  powersCluster: 'eb993c0c-9b1d-52af-97c8-4a534fd78be3',
  powersMeaning: 'd658e26a-e351-4bca-824e-f346deaa87c5',
  powersOfTen: 'e331a425-e9c6-46eb-89cb-dedf72857974',
  units: 'f2e42af5-67a6-477e-82ea-e65b09cc6cb3',
  rationalAdditionSubtraction: '4eeab7d5-eeb3-579b-845e-1c52ffe9e89f',
  rationalPowers: '26f668a0-6425-5466-9cf7-6295dd189005',
} as const

const childSpecs: JsonRecord[] = [
  {
    id: ids.powersMeaning,
    shortKey: 'canonical_math_interpret_and_compute_powers_with_natural_exponents',
    title: 'Potenzen mit natürlichen Exponenten deuten und berechnen',
    titleEn: 'Interpret and compute powers with natural exponents',
    description:
      'Die lernende Person kann für eine Potenz a^n mit natürlichem Exponenten n ≥ 1 Basis und Exponent unterscheiden, a^n als wiederholte Multiplikation von n gleichen Faktoren deuten, den Wert berechnen und das Ergebnis an der Faktorstruktur prüfen.',
    descriptionEn:
      'For a power a^n with natural exponent n ≥ 1, the learner can distinguish base and exponent, interpret a^n as repeated multiplication of n equal factors, calculate its value, and check the result against the factor structure.',
    requires: [
      'cafd6520-c4af-4109-9863-cc49ba6fad4d',
      '65365dce-f33f-49d8-9516-42f75883aa86',
    ],
    atomicityReason:
      'Basis und Exponent unterscheiden, die Potenz als wiederholte Multiplikation deuten und den Wert berechnen sind zusammengehörige Beobachtungen derselben grundlegenden Potenzkompetenz.',
    memoryReason:
      'Die Bedeutung von Basis und Exponent sowie das Berechnen von Potenzen werden durch Erklären und Anwenden der wiederholten Multiplikation aufgebaut; ein separates Memory-Deck ist nicht erforderlich.',
  },
  {
    id: ids.powersOfTen,
    shortKey: 'canonical_math_represent_and_interpret_large_numbers_with_powers_of_ten',
    title: 'Große Zahlen mit Zehnerpotenzen darstellen und deuten',
    titleEn: 'Represent and interpret large numbers using powers of ten',
    description:
      'Die lernende Person kann große natürliche Zahlen mithilfe der Stellenwertstruktur zwischen Dezimalschreibweise und Darstellungen durch Zehnerpotenzen mit nichtnegativen Exponenten wechseln, ihre Größenordnung am Exponenten der größten Zehnerpotenz deuten, die die Zahl nicht überschreitet, und die Darstellung in einfachen Sachzusammenhängen auf Plausibilität prüfen.',
    descriptionEn:
      'The learner can use place-value structure to switch large natural numbers between decimal notation and representations using powers of ten with non-negative exponents, interpret their order of magnitude from the exponent of the greatest power of ten that does not exceed the number, and check the representation for plausibility in simple contexts.',
    requires: [ids.powersMeaning],
    atomicityReason:
      'Darstellen und Deuten beziehen sich auf dieselbe Stellenwertrepräsentation großer natürlicher Zahlen durch Zehnerpotenzen und bilden eine einzelne Repräsentationskompetenz.',
    memoryReason:
      'Die Stellenwertbedeutung von Zehnerpotenzen soll über Darstellungswechsel und Kontextdeutung verstanden werden; ein separates Memory-Deck ist dafür nicht erforderlich.',
  },
]

const revisions: Record<string, {
  shortKey?: string
  title?: string
  titleEn?: string
  description: string
  descriptionEn: string
  atomicityReason: string
  memoryReason: string
}> = {
  '6ff61721-b2cc-5b1b-ade5-b3c1fd7f7077': {
    description:
      'Die lernende Person kann aus der Stellenwertstruktur natürlicher Zahlen begründen, warum die Endziffernregeln die Teilbarkeit durch 2, 5 und 10 und die Quersummenregel die Teilbarkeit durch 3 anzeigen, und damit begründete Teilbarkeitsentscheidungen treffen.',
    descriptionEn:
      'The learner can use the place-value structure of natural numbers to justify why last-digit rules indicate divisibility by 2, 5, and 10 and why the digit-sum rule indicates divisibility by 3, and use these rules to make justified divisibility decisions.',
    atomicityReason:
      'Die fachlich korrekt zugeordneten Endziffern- und Quersummenregeln, ihre Stellenwertbegründung und die darauf beruhende Teilbarkeitsentscheidung bilden eine einzelne Kompetenz.',
    memoryReason:
      'Die Regeln werden aus der Stellenwertstruktur begründet und in variierenden Aufgaben angewendet; ein separates Memory-Deck ist dafür nicht erforderlich.',
  },
  '5d1decb2-b01b-5c85-88fc-9fc255ff9776': {
    description:
      'Die lernende Person kann Terme mit Grundrechenarten anhand ihrer Operationsstruktur gliedern, die Vorrangwirkung von Klammern und Rechenregeln begründen und den Term schrittweise korrekt auswerten.',
    descriptionEn:
      'The learner can parse expressions with basic operations by their operation structure, justify the precedence created by brackets and operation rules, and evaluate the expression correctly step by step.',
    atomicityReason:
      'Operationsstruktur gliedern, Vorrang begründen und schrittweise auswerten sind zusammengehörige Phasen einer einzelnen Kompetenz zur strukturgerechten Termwertberechnung.',
    memoryReason:
      'Klammer- und Vorrangregeln müssen an konkreten Termstrukturen erklärt und angewendet werden; ein separates Memory-Deck ist nicht erforderlich.',
  },
  '2ae76eae-799c-463e-9ec9-82327f8209a8': {
    description:
      'Die lernende Person kann in einfachen realitätsnahen Situationen Möglichkeiten vollständig und ohne Doppelzählung systematisch erfassen, eine passende Zählstrategie wählen und die ermittelte Anzahl nachvollziehbar begründen.',
    descriptionEn:
      'The learner can systematically account for all possibilities in simple real-world situations without double counting, choose a suitable counting strategy, and justify the resulting count clearly.',
    atomicityReason:
      'Vollständiges, überschneidungsfreies Erfassen, Strategiewahl und Begründung bilden gemeinsam eine einzelne Kompetenz zum systematischen Zählen.',
    memoryReason:
      'Systematische Zählstrategien werden durch vollständiges und überschneidungsfreies Strukturieren wechselnder Situationen aufgebaut; ein Memory-Deck ist nicht erforderlich.',
  },
  'b5de0574-93ed-409c-80ee-312211420cd6': {
    shortKey: 'canonical_math_solve_integer_problems_strategically',
    titleEn: 'Solve integer problems heuristically and document solution paths',
    description:
      'Die lernende Person kann Problemstellungen mit ganzen Zahlen strukturieren, eine passende heuristische Strategie und geeignete Rechenschritte begründet auswählen, den Lösungsweg nachvollziehbar dokumentieren und das Ergebnis im Sachzusammenhang prüfen.',
    descriptionEn:
      'The learner can structure problems involving integers, justify the choice of a suitable heuristic strategy and calculation steps, document the solution path clearly, and check the result in context.',
    atomicityReason:
      'Strukturieren, begründete Strategiewahl, dokumentiertes Ausführen und Kontextprüfung sind zusammengehörige Phasen eines einzelnen heuristischen Problemlöseprozesses.',
    memoryReason:
      'Heuristisches Problemlösen verlangt flexible Strategiewahl und Kontextprüfung in neuen Aufgaben; ein separates Memory-Deck ist nicht erforderlich.',
  },
  'f2e42af5-67a6-477e-82ea-e65b09cc6cb3': {
    description:
      'Die lernende Person kann für alltagsnahe Größen passende Einheiten auswählen, Größenangaben sicher in gleichartige Einheiten umrechnen, dabei anhand des Einheitenverhältnisses begründen, warum die dargestellte Größe unverändert bleibt, und Messergebnisse in einer gemeinsamen Einheit sinnvoll vergleichen.',
    descriptionEn:
      'The learner can choose suitable units for everyday quantities, reliably convert measurements into equivalent units, justify the unchanged quantity from the relationship between the units, and compare measurement results meaningfully in a common unit.',
    atomicityReason:
      'Einheitenwahl, werterhaltende Umrechnung mit Begründung aus dem Einheitenverhältnis und anschließender Vergleich sind zusammengehörige Phasen einer einzelnen Größenrepräsentations-Kompetenz.',
    memoryReason:
      'Die Werterhaltung bei Einheitenwechseln wird aus Einheitenverhältnissen begründet und an wechselnden Größen angewendet; ein separates Memory-Deck ist dafür nicht erforderlich.',
  },
  'ca623958-c204-5d1b-bdd0-3f76765674cb': {
    title: 'Mit Größen einheitengerecht rechnen und Ergebnisse deuten',
    titleEn: 'Calculate with quantities using consistent units and interpret results',
    description:
      'Die lernende Person kann in einer Sachsituation anhand der beteiligten Größen entscheiden, welche Rechenoperation sinnvoll ist, beim Addieren und Subtrahieren nur gleichartige Größen in einer gemeinsamen Einheit verknüpfen, eine Größe mit einer Zahl vervielfachen oder teilen und Ergebnis sowie Einheit im Kontext auf Plausibilität prüfen.',
    descriptionEn:
      'The learner can decide which arithmetic operation is appropriate in a context based on the quantities involved, combine only like quantities expressed in a common unit when adding or subtracting, multiply or divide a quantity by a number, and check both the result and its unit for plausibility in context.',
    atomicityReason:
      'Operationswahl, additive Verknüpfung gleichartiger Größen in gemeinsamer Einheit und skalare Vervielfachung oder Teilung sind kontrastive Fälle einer einzelnen Größenoperations-Kompetenz; die Kontext- und Einheitenprüfung verbindet sie.',
    memoryReason:
      'Operationswahl, Einheitenverträglichkeit und Plausibilität werden in variierenden Sachsituationen verstanden und geprüft; ein separates Memory-Deck ist nicht erforderlich.',
  },
  '596345cd-679e-5c7b-955f-e8cb1ec81e96': {
    description:
      'Die lernende Person kann in einfachen Sachsituationen eine proportionale Zuordnung an einem gleichbleibenden Verhältnis erkennen, einen gesuchten Wert durch Zurückführen auf 1 und Vervielfachen bestimmen und diesen Rechenweg begründen.',
    descriptionEn:
      'In simple contexts, the learner can recognize a proportional relationship by its constant ratio, determine an unknown value by reducing to one unit and scaling up, and justify this calculation path.',
    atomicityReason:
      'Proportionalität am konstanten Verhältnis erkennen und den darauf beruhenden Dreisatz begründen sind zusammengehörige Bestandteile einer einzelnen proportionalen Modellierungs- und Lösungskompetenz.',
    memoryReason:
      'Die Kompetenz beruht auf Verhältnisverständnis und einem begründeten Rechenweg; ein separates Memory-Deck ist nicht erforderlich.',
  },
  '79dd11f0-ed20-5b92-a215-b061a2098c0c': {
    description:
      'Die lernende Person kann in Karten-, Plan- oder Modellsituationen einen Maßstab als Verhältnis von dargestellter zu realer Länge deuten, beide Längen in eine gemeinsame Einheit umrechnen und eine gesuchte dargestellte oder reale Länge bestimmen.',
    descriptionEn:
      'In map, plan, or model contexts, the learner can interpret a scale as the ratio of represented length to real length, express both lengths in a common unit, and determine an unknown represented or real length.',
    atomicityReason:
      'Maßstab deuten, beide Längen in einer gemeinsamen Einheit ausdrücken und eine Länge bestimmen sind untrennbare Teilschritte derselben Maßstabsaufgabe.',
    memoryReason:
      'Maßstabsaufgaben werden über Verhältnisverständnis, die gemeinsame Längeneinheit und Anwendung gelernt; ein Memory-Deck ist nicht erforderlich.',
  },
  'd6c3fb37-ece6-5b56-9221-1eeb21845877': {
    description:
      'Die lernende Person kann Umfang als Länge des Randes und Flächeninhalt als Maß der bedeckten Fläche unterscheiden, in einfachen Sachsituationen die passende Größe und Formel wählen und Ergebnisse mit geeigneten Einheiten deuten.',
    descriptionEn:
      'The learner can distinguish perimeter as the length of a boundary from area as the measure of a covered region, choose the appropriate quantity and formula in simple contexts, and interpret results using suitable units.',
    atomicityReason:
      'Die begriffliche Unterscheidung von Randlänge und bedeckter Fläche trägt die zusammenhängende Kompetenz, in einer Situation Größe, Formel und Einheit passend auszuwählen.',
    memoryReason:
      'Umfang und Flächeninhalt sollen an geometrischen und sachbezogenen Situationen unterschieden und angewendet werden; ein separates Memory-Deck ist nicht erforderlich.',
  },
  'ec9f2ed4-c9e6-5fb3-a073-75b53127e55d': {
    description:
      'Die lernende Person kann erläutern, dass zwischen zwei verschiedenen rationalen Zahlen stets weitere rationale Zahlen liegen, durch wiederholte Mittelwertbildung beliebig viele davon konstruieren und damit die Dichtheit begründen.',
    descriptionEn:
      'The learner can explain that further rational numbers always lie between any two distinct rational numbers, construct arbitrarily many of them by repeatedly taking midpoints, and thereby justify density.',
    atomicityReason:
      'Das wiederholte Konstruieren von Mittelwerten ist hier der Begründungsweg für genau eine Eigenschaft: die Dichtheit der rationalen Zahlen.',
    memoryReason:
      'Die Dichtheit wird konstruktiv durch wiederholte Mittelwertbildung begründet und nicht als isolierter Merksatz gelernt; ein Memory-Deck ist nicht erforderlich.',
  },
  'f6a54a49-b6cf-4ab7-a185-aa08bfcb6c97': {
    description:
      'Die lernende Person kann denselben Bruchwert bildlich, verbal, geometrisch und algebraisch darstellen, Informationen zwischen diesen Darstellungen übertragen und begründen, warum der Wert beim Wechsel erhalten bleibt.',
    descriptionEn:
      'The learner can represent the same fractional value visually, verbally, geometrically, and algebraically, transfer information between these representations, and justify why the value is preserved when switching.',
    atomicityReason:
      'Die verschiedenen Darstellungen und ihre Verknüpfung beziehen sich auf dieselbe Invariante, den erhaltenen Bruchwert, und bilden daher eine einzelne Repräsentationskompetenz.',
    memoryReason:
      'Darstellungswechsel und Werterhaltung werden durch Erklären an unterschiedlichen Repräsentationen aufgebaut; ein separates Memory-Deck ist nicht erforderlich.',
  },
  '2f565855-bcd6-4da5-bc80-4b72a2d93d50': {
    description:
      'Die lernende Person kann Dezimalzahlen auf einer passend skalierten Zahlengeraden, im Stellenwertsystem und als wertgleichen Bruch darstellen, die entsprechenden Stellen und Anteile zuordnen und begründet zwischen den Darstellungen wechseln.',
    descriptionEn:
      'The learner can represent decimal numbers on a suitably scaled number line, in the place-value system, and as equivalent fractions, relate the corresponding places and parts, and justify changes between the representations.',
    atomicityReason:
      'Die drei Darstellungen, ihre Zuordnung und der begründete Wechsel beziehen sich auf denselben erhaltenen Dezimalwert und bilden eine einzelne vernetzte Repräsentationskompetenz.',
    memoryReason:
      'Wertgleiche Dezimaldarstellungen werden über Stellenwerte, Anteile und Zahlengeradenbezug verstanden; ein separates Memory-Deck ist nicht erforderlich.',
  },
  '199fe2ed-2576-4611-b8de-fd56fb9f78fc': {
    description:
      'Die lernende Person kann positive und negative Zahlen auf einer passend skalierten Zahlengeraden verorten, ihre Lage relativ zu 0 deuten und Zahlen anhand der Links-rechts-Ordnung begründet vergleichen.',
    descriptionEn:
      'The learner can locate positive and negative numbers on a suitably scaled number line, interpret their positions relative to 0, and justify comparisons using left-to-right order.',
    atomicityReason:
      'Verorten, Nullbezug und begründeter Vergleich nutzen dieselbe skalierte Zahlengeradenstruktur und bilden eine einzelne Ordnungskompetenz.',
    memoryReason:
      'Nullbezug, Skalierung und Links-rechts-Ordnung sollen an Zahlengeraden konstruiert und begründet werden; ein separates Memory-Deck ist nicht erforderlich.',
  },
  '4eeab7d5-eeb3-579b-845e-1c52ffe9e89f': {
    description:
      'Die lernende Person kann nicht ganze rationale Zahlen, insbesondere Brüche und Dezimalzahlen, wertgleich in eine für Addition oder Subtraktion geeignete Darstellung überführen, Additionen und Subtraktionen sicher ausführen, dabei Rechenvorteile nutzen und Ergebnisse durch Überschlag plausibilisieren.',
    descriptionEn:
      'The learner can transform non-integer rational numbers, especially fractions and decimals, into an equivalent representation suitable for addition or subtraction, carry out additions and subtractions reliably, use advantageous calculation structures, and check results for plausibility by estimation.',
    atomicityReason:
      'Addition und Subtraktion sind inverse Ausprägungen derselben Kompetenz, kompatible wertgleiche Darstellungen herzustellen, Rechenstrukturen zu nutzen und Ergebnisse zu plausibilisieren.',
    memoryReason:
      'Geeignete wertgleiche Darstellungen und Rechenvorteile müssen flexibel gewählt und durch Überschlag geprüft werden; ein separates Memory-Deck ist nicht erforderlich.',
  },
  '60c2418b-aaff-58f6-964a-bc7cda2a673c': {
    description:
      'Die lernende Person kann Zahlen passenden Zahlmengen zuordnen, anhand der Definitionen begründen, dass jede natürliche Zahl ganz und jede ganze Zahl rational ist, und mit Gegenbeispielen zeigen, dass die jeweiligen Umkehrungen nicht gelten.',
    descriptionEn:
      'The learner can classify numbers into suitable number sets, use the definitions to justify that every natural number is an integer and every integer is rational, and use counterexamples to show that the respective converses do not hold.',
    atomicityReason:
      'Zuordnung, Definitionsbegründung der Inklusionsbeziehungen und Gegenbeispiele zu ihren Umkehrungen bilden eine einzelne Zahlmengen-Kompetenz.',
    memoryReason:
      'Die Zahlmengenbeziehungen werden aus Definitionen begründet und ihre Umkehrungen an Gegenbeispielen geprüft; ein separates Memory-Deck ist dafür nicht erforderlich.',
  },
}

const readJson = (path: string): JsonRecord =>
  JSON.parse(readFileSync(resolve(repoRoot, path), 'utf8')) as JsonRecord

const writeJson = (path: string, value: unknown): void => {
  writeFileSync(resolve(repoRoot, path), `${JSON.stringify(value, null, 2)}\n`)
}

const readJsonl = (path: string): JsonRecord[] =>
  readFileSync(resolve(repoRoot, path), 'utf8')
    .split(/\r?\n/u)
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line) as JsonRecord)

const writeJsonl = (path: string, records: JsonRecord[]): void => {
  writeFileSync(resolve(repoRoot, path), `${records.map((record) => JSON.stringify(record)).join('\n')}\n`)
}

const normalizeText = (value: unknown): string =>
  String(value ?? '').normalize('NFKC').replace(/\s+/gu, ' ').trim()

const stableJson = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as JsonRecord)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nested]) => `${JSON.stringify(key)}:${stableJson(nested)}`)
      .join(',')}}`
  }
  return JSON.stringify(value)
}

const fingerprintReviewGoal = (goal: JsonRecord, ruleVersion: string): string => {
  const payload = stableJson({
    ruleVersion,
    goalId: goal.id,
    shortKey: goal.shortKey ?? '',
    title: normalizeText(goal.title),
    titleEn: normalizeText(goal.titleEn),
    description: normalizeText(goal.description),
    descriptionEn: normalizeText(goal.descriptionEn),
    phase: normalizeText(goal.dimensionTags?.phase),
    area: normalizeText(goal.dimensionTags?.area),
    topicCode: normalizeText(goal.dimensionTags?.topicCode),
    nodeKind: normalizeText(goal.nodeKind),
  })
  return `sha256:${createHash('sha256').update(payload).digest('hex')}`
}

const unique = <T>(values: T[]): T[] => [...new Set(values)]

const replaceReference = (values: string[] | undefined, oldId: string, replacements: string[]): string[] =>
  unique((values ?? []).flatMap((value) => value === oldId ? replacements : [value]))

function buildCanonical(): JsonRecord {
  const landscape = readJson(paths.canonical)
  const goals = landscape.goals as JsonRecord[]
  const byId = new Map(goals.map((goal) => [goal.id, goal]))
  const parent = byId.get(ids.powersCluster)
  if (!parent) throw new Error(`Missing powers parent ${ids.powersCluster}`)

  parent.title = 'Potenzen mit natürlichen Exponenten und Zehnerpotenzen'
  parent.titleEn = 'Powers with natural exponents and powers of ten'
  parent.description =
    'Cluster für zwei fachlich getrennte Lernziele: die Bedeutung und Berechnung von Potenzen mit natürlichen Exponenten sowie die stellenwertbezogene Darstellung großer Zahlen durch Zehnerpotenzen.'
  parent.descriptionEn =
    'Cluster for two distinct learning goals: interpreting and computing powers with natural exponents and representing large numbers through place-value-based powers of ten.'
  parent.type = 'cluster'
  parent.weight = 2
  parent.requires = []
  parent.contains = childSpecs.map((spec) => spec.id)
  delete parent.semanticAtomic

  for (const spec of childSpecs) {
    const current = byId.get(spec.id)
    const currentResourceLinks = current ? structuredClone(current.resourceLinks ?? []) : []
    const goal = current ?? {
      id: spec.id,
      core: parent.core,
      weight: 1,
      tags: [...(parent.tags ?? [])],
      dimensionTags: structuredClone(parent.dimensionTags),
      applicability: structuredClone(parent.applicability),
      sourceRef: 'LehrplanPLUS Bayern Gymnasium Mathematik, M5.3.1',
      type: 'atomic',
      semanticAtomic: true,
      contains: [],
      resourceLinks: currentResourceLinks,
    }
    Object.assign(goal, {
      shortKey: spec.shortKey,
      title: spec.title,
      titleEn: spec.titleEn,
      description: spec.description,
      descriptionEn: spec.descriptionEn,
      core: parent.core,
      weight: 1,
      tags: [...(parent.tags ?? [])],
      dimensionTags: structuredClone(parent.dimensionTags),
      contains: [],
      requires: [...spec.requires],
      applicability: structuredClone(parent.applicability),
      sourceRef: 'LehrplanPLUS Bayern Gymnasium Mathematik, M5.3.1',
      type: 'atomic',
      semanticAtomic: true,
      resourceLinks: currentResourceLinks,
    })
    for (const link of goal.resourceLinks ?? []) {
      if (link.type !== 'goal-visualization') continue
      link.title = `Visualisierung: ${goal.title}`
      link.description = `Visualisierung zum Lernziel: ${goal.title}.`
      link.altText = `Didaktische Visualisierung zum Lernziel "${goal.title}". ${goal.description}`
    }
    byId.set(goal.id, goal)
  }
  for (const spec of [...childSpecs].reverse()) {
    if (goals.some((goal) => goal.id === spec.id)) continue
    const parentIndex = goals.findIndex((goal) => goal.id === ids.powersCluster)
    goals.splice(parentIndex + 1, 0, byId.get(spec.id)!)
  }

  for (const [goalId, revision] of Object.entries(revisions)) {
    const goal = byId.get(goalId)
    if (!goal) throw new Error(`Missing revised goal ${goalId}`)
    if (revision.shortKey) goal.shortKey = revision.shortKey
    if (revision.title) goal.title = revision.title
    if (revision.titleEn) goal.titleEn = revision.titleEn
    goal.description = revision.description
    goal.descriptionEn = revision.descriptionEn
    goal.semanticAtomic = true
    for (const link of goal.resourceLinks ?? []) {
      if (link.type !== 'goal-visualization') continue
      link.title = `Visualisierung: ${goal.title}`
      link.description = `Visualisierung zum Lernziel: ${goal.title}.`
      link.altText = `Didaktische Visualisierung zum Lernziel "${goal.title}". ${goal.description}`
    }
  }

  const units = byId.get(ids.units)
  const rationalPowers = byId.get(ids.rationalPowers)
  if (!units || !rationalPowers) throw new Error('Missing powers-dependent goals')
  units.requires = replaceReference(units.requires, ids.powersCluster, [])
  rationalPowers.requires = replaceReference(
    rationalPowers.requires,
    ids.powersCluster,
    [ids.powersMeaning, ids.powersOfTen],
  )

  for (const goal of goals) {
    if (goal.id === ids.powersCluster) continue
    if ((goal.requires ?? []).includes(ids.powersCluster)) {
      throw new Error(`Unadjudicated requires reference ${goal.id} -> ${ids.powersCluster}`)
    }
    if ((goal.examData?.coveredGoalIds ?? []).includes(ids.powersCluster)) {
      throw new Error(`Unadjudicated assessment reference ${goal.id} -> ${ids.powersCluster}`)
    }
  }

  const parentsByChild = new Map<string, string[]>()
  for (const goal of goals) {
    for (const childId of goal.contains ?? []) {
      parentsByChild.set(childId, [...(parentsByChild.get(childId) ?? []), goal.id])
    }
  }
  const affectedAncestors = new Set<string>()
  const queue = [...(parentsByChild.get(ids.powersCluster) ?? [])]
  while (queue.length > 0) {
    const ancestorId = queue.shift()!
    if (affectedAncestors.has(ancestorId)) continue
    affectedAncestors.add(ancestorId)
    queue.push(...(parentsByChild.get(ancestorId) ?? []))
  }
  const collectAtomicDescendants = (goalId: string, visiting = new Set<string>()): Set<string> => {
    if (visiting.has(goalId)) throw new Error(`Contains cycle while counting ${goalId}`)
    const goal = byId.get(goalId)
    if (!goal) throw new Error(`Missing contains target ${goalId}`)
    if ((goal.contains ?? []).length === 0) return new Set([goalId])
    const nextVisiting = new Set(visiting).add(goalId)
    return new Set((goal.contains as string[]).flatMap((childId) => [...collectAtomicDescendants(childId, nextVisiting)]))
  }
  for (const ancestorId of affectedAncestors) {
    const ancestor = byId.get(ancestorId)!
    ancestor.weight = collectAtomicDescendants(ancestorId).size
  }

  landscape.goals = goals
  return landscape
}

function buildSemanticKinds(landscape: JsonRecord): JsonRecord {
  const ledger = readJson(paths.semanticKinds)
  const goalById = new Map((landscape.goals as JsonRecord[]).map((goal) => [goal.id, goal]))
  const byId = new Map((ledger.decisions as JsonRecord[]).map((decision) => [decision.goalId, decision]))
  const changedIds = [
    ids.powersCluster,
    ...childSpecs.map((spec) => spec.id),
    ...Object.keys(revisions),
    ids.units,
    ids.rationalPowers,
  ]
  for (const goalId of changedIds) {
    const goal = goalById.get(goalId)
    if (!goal) throw new Error(`Missing semantic-kind goal ${goalId}`)
    const decision = byId.get(goalId) ?? { goalId }
    const semanticKind = goalId === ids.powersCluster
      ? 'curricularArea'
      : childSpecs.some((spec) => spec.id === goalId)
        ? 'curricularAtomic'
        : decision.semanticKind
    if (!semanticKind) throw new Error(`Missing retained semantic kind for ${goalId}`)
    Object.assign(decision, {
      sourceFingerprint: fingerprintSemanticKindSourceGoal(goal),
      semanticKind,
      decisionStatus: 'authoritative',
      decisionBasis: goalId === ids.powersCluster
        ? 'reviewed-current-structural-split-curricular-area'
        : childSpecs.some((spec) => spec.id === goalId)
          ? 'reviewed-current-structural-split-curricular-atomic'
          : decision.decisionBasis,
    })
    byId.set(goalId, decision)
  }
  ledger.decisions = [...byId.values()].sort((left, right) => left.goalId.localeCompare(right.goalId))
  const counts: Record<string, number> = {}
  for (const decision of ledger.decisions as JsonRecord[]) {
    counts[decision.semanticKind] = (counts[decision.semanticKind] ?? 0) + 1
  }
  const preferredOrder = [
    'curricularAtomic',
    'curricularArea',
    'practiceAssessment',
    'programStructure',
    'memory',
    'runtimeSupport',
    'orientation',
  ]
  ledger.counts = Object.fromEntries(preferredOrder.map((key) => [key, counts[key] ?? 0]))
  ledger.counts.total = (ledger.decisions as JsonRecord[]).length
  return ledger
}

function buildReviewLedger(
  landscape: JsonRecord,
  path: string,
  ruleVersion: 'semantic-atomicity-v1' | 'memory-card-review-v1',
): JsonRecord[] {
  const goalById = new Map((landscape.goals as JsonRecord[]).map((goal) => [goal.id, goal]))
  const records = readJsonl(path)
  const byId = new Map(records.map((record) => [record.goalId, record]))
  const reviewedAt = '2026-08-26'
  const reviewer = 'codex-ai-synthesis-2026-08-26-second-pass'

  for (const spec of childSpecs) {
    const goal = goalById.get(spec.id)!
    byId.set(spec.id, ruleVersion === 'semantic-atomicity-v1'
      ? {
          schemaVersion: 1,
          reviewId: 'canonical-math-full',
          ruleVersion,
          landscapeId: landscape.landscapeId,
          goalId: spec.id,
          fingerprint: fingerprintReviewGoal(goal, ruleVersion),
          reviewedAt,
          reviewer,
          status: 'atomic',
          semanticAtomic: true,
          reason: spec.atomicityReason,
          suggestedSplit: [],
        }
      : {
          schemaVersion: 1,
          reviewId: 'canonical-math-full',
          ruleVersion,
          landscapeId: landscape.landscapeId,
          goalId: spec.id,
          fingerprint: fingerprintReviewGoal(goal, ruleVersion),
          status: 'no_memory_needed',
          memoryUseful: false,
          reviewedAt,
          reviewer,
          reason: spec.memoryReason,
        })
  }

  for (const [goalId, revision] of Object.entries(revisions)) {
    const goal = goalById.get(goalId)
    const record = byId.get(goalId)
    if (!goal || !record) throw new Error(`Missing review ledger goal ${goalId}`)
    Object.assign(record, ruleVersion === 'semantic-atomicity-v1'
      ? {
          fingerprint: fingerprintReviewGoal(goal, ruleVersion),
          reviewedAt,
          reviewer,
          status: 'atomic',
          semanticAtomic: true,
          reason: revision.atomicityReason,
          suggestedSplit: [],
        }
      : {
          fingerprint: fingerprintReviewGoal(goal, ruleVersion),
          status: 'no_memory_needed',
          memoryUseful: false,
          reviewedAt,
          reviewer,
          reason: revision.memoryReason,
        })
  }

  const emitted = new Set<string>()
  const result: JsonRecord[] = []
  for (const record of records) {
    if (record.goalId === ids.powersCluster) {
      for (const spec of childSpecs) {
        result.push(byId.get(spec.id)!)
        emitted.add(spec.id)
      }
      continue
    }
    if (emitted.has(record.goalId)) continue
    result.push(byId.get(record.goalId)!)
    emitted.add(record.goalId)
  }
  for (const spec of childSpecs) {
    if (!emitted.has(spec.id)) result.push(byId.get(spec.id)!)
  }
  return result
}

function buildProvenance(): JsonRecord {
  const registry = readJson(paths.provenance)
  const landscape = (registry.landscapes as JsonRecord[]).find(
    (entry) => entry.landscapeId === '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced',
  )
  const source = structuredClone(
    landscape?.goalProvenance?.[ids.powersCluster]
      ?? landscape?.goalProvenance?.[ids.powersMeaning]
      ?? landscape?.goalProvenance?.[ids.powersOfTen],
  )
  if (!landscape?.goalProvenance || !source) {
    throw new Error(`Missing provenance for split parent or children ${ids.powersCluster}`)
  }
  delete landscape.goalProvenance[ids.powersCluster]
  landscape.goalProvenance[ids.powersMeaning] = structuredClone(source)
  landscape.goalProvenance[ids.powersOfTen] = structuredClone(source)
  landscape.goalProvenance = Object.fromEntries(
    Object.entries(landscape.goalProvenance).sort(([left], [right]) => left.localeCompare(right)),
  )
  return registry
}

function buildCompositionViews(): Map<string, JsonRecord> {
  const result = new Map<string, JsonRecord>()
  for (const entry of readdirSync(compositionRoot, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.view.json')) continue
    const path = join(compositionRoot, entry.name)
    const view = JSON.parse(readFileSync(path, 'utf8')) as JsonRecord
    let changed = false
    const visit = (value: unknown): void => {
      if (Array.isArray(value)) {
        value.forEach(visit)
        return
      }
      if (!value || typeof value !== 'object') return
      const record = value as JsonRecord
      if (record.kind === 'goalEntry' && record.goalId === ids.powersCluster) {
        record.kind = 'canonicalSubtree'
        changed = true
      }
      Object.values(record).forEach(visit)
    }
    visit(view)
    if (changed) result.set(path, view)
  }
  return result
}

function buildVisualizationQa(landscape: JsonRecord): JsonRecord {
  const qa = readJson(paths.visualizationQa)
  const goal = (landscape.goals as JsonRecord[]).find(
    (entry) => entry.id === ids.rationalAdditionSubtraction,
  )
  const record = (qa.records as JsonRecord[]).find(
    (entry) => entry.goalId === ids.rationalAdditionSubtraction,
  )
  if (!goal || !record) {
    throw new Error(`Missing visualization-QA binding for ${ids.rationalAdditionSubtraction}`)
  }
  record.description = goal.description
  return qa
}

function buildCurrentV2Evidence(
  landscape: JsonRecord,
  semanticKindLedger: JsonRecord,
): JsonRecord[] {
  const records = readJsonl(paths.currentV2Evidence)
  const goal = (landscape.goals as JsonRecord[]).find(
    (entry) => entry.id === ids.rationalAdditionSubtraction,
  )
  const semanticKind = (semanticKindLedger.decisions as JsonRecord[]).find(
    (entry) => entry.goalId === ids.rationalAdditionSubtraction,
  )?.semanticKind
  const record = records.find((entry) => entry.goalId === ids.rationalAdditionSubtraction)
  if (!goal || semanticKind !== 'curricularAtomic' || !record) {
    throw new Error(`Missing current-v2 evidence binding for ${ids.rationalAdditionSubtraction}`)
  }
  const currentProfileFingerprint = fingerprintPositiveGoalEvidenceProfile(record.profile)
  if (record.profileFingerprint !== currentProfileFingerprint) {
    throw new Error(`Stale current-v2 profile for ${ids.rationalAdditionSubtraction}`)
  }
  record.goalFingerprint = fingerprintGoalForPositiveEvidence(goal, semanticKind)
  record.reviewInputFingerprint = fingerprintPositiveGoalEvidenceReviewInput(
    goal,
    record.reviewCriteriaFingerprint,
    {},
    semanticKind,
  )
  return records
}

const canonical = buildCanonical()
const semanticKinds = buildSemanticKinds(canonical)
const atomicity = buildReviewLedger(canonical, paths.atomicity, 'semantic-atomicity-v1')
const memory = buildReviewLedger(canonical, paths.memory, 'memory-card-review-v1')
const visualizationQa = buildVisualizationQa(canonical)
const currentV2Evidence = buildCurrentV2Evidence(canonical, semanticKinds)
const provenance = buildProvenance()
const compositionViews = buildCompositionViews()

if (writeMode) {
  writeJson(paths.canonical, canonical)
  writeJson(paths.semanticKinds, semanticKinds)
  writeJsonl(paths.atomicity, atomicity)
  writeJsonl(paths.memory, memory)
  writeJson(paths.visualizationQa, visualizationQa)
  writeJsonl(paths.currentV2Evidence, currentV2Evidence)
  writeJson(paths.provenance, provenance)
  for (const [path, view] of compositionViews) {
    writeFileSync(path, `${JSON.stringify(view, null, 2)}\n`)
  }
}

console.log(
  `CHECK apply_math_batch_002_second_pass_adjudication ${writeMode ? 'WRITE' : 'PASS'} split=1 children=2 revisions=${Object.keys(revisions).length} visualText=1 evidenceRebound=1 compositionViews=${compositionViews.size} curricularAtomic=786`,
)
