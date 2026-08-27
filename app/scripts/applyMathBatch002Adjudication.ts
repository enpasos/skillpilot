import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel'

type JsonRecord = Record<string, unknown>

const repoRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')

const paths = {
  canonical: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
  semanticKinds: 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json',
  atomicity: 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-math-full.review.jsonl',
  memory: 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-math-full.review.jsonl',
  visualizationQa: 'curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json',
} as const

const ids = {
  divisibilityCluster: 'f2d4a7de-57c3-5749-bbb4-6cd4b57b7562',
  divisibility: '6ff61721-b2cc-5b1b-ade5-b3c1fd7f7077',
  primeFactors: 'a4c2b831-02f0-5d55-a300-7823a71352c4',
  proportionalCluster: 'ca9093cd-9ccf-5fb4-9dd8-bf4f92af4e70',
  ruleOfThree: '596345cd-679e-5c7b-955f-e8cb1ec81e96',
  scale: '79dd11f0-ed20-5b92-a215-b061a2098c0c',
  fractionsCluster: 'a075ae99-7669-563d-807a-f91b119c020a',
  equivalentFractions: '339a7bf5-f1df-5d5a-9ec4-41f471f0c111',
  compareFractions: '02013455-72a0-5213-9509-ed77f7ede62b',
  rationalCluster: 'c9e01667-24c4-56a2-8cf4-dfb6c360d7b9',
  rationalNumberLine: 'f6b13b8e-1ecd-5420-905d-21290aa996a6',
  numberSets: '60c2418b-aaff-58f6-964a-bc7cda2a673c',
  units: 'f2e42af5-67a6-477e-82ea-e65b09cc6cb3',
} as const

const splitClusterIds = [
  ids.divisibilityCluster,
  ids.proportionalCluster,
  ids.fractionsCluster,
  ids.rationalCluster,
]

const childSpecs: Array<JsonRecord & { parentId: string }> = [
  {
    parentId: ids.divisibilityCluster,
    id: ids.divisibility,
    shortKey: 'canonical_math_apply_divisibility_rules_2_3_5_10',
    title: 'Teilbarkeit durch 2, 3, 5 und 10 prüfen und begründen',
    titleEn: 'Test and justify divisibility by 2, 3, 5, and 10',
    description:
      'Die lernende Person kann für natürliche Zahlen anhand der Endziffern- und Quersummenregeln prüfen und begründen, ob sie durch 2, 3, 5 oder 10 teilbar sind.',
    descriptionEn:
      'The learner can use last-digit rules and the digit-sum rule to test and justify whether natural numbers are divisible by 2, 3, 5, or 10.',
    requires: [
      'cafd6520-c4af-4109-9863-cc49ba6fad4d',
      '65365dce-f33f-49d8-9516-42f75883aa86',
    ],
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Mathematik, M5.3.1',
    atomicityReason:
      'Das Ziel bündelt genau eine beobachtbare Kompetenz: die festgelegten Teilbarkeitsregeln anwenden und die Entscheidung aus der verwendeten Regel begründen.',
    memoryReason:
      'Die Teilbarkeitsregeln werden durch begründetes Anwenden in Aufgaben verankert; ein zusätzliches Memory-Deck ist für dieses Ziel nicht erforderlich.',
  },
  {
    parentId: ids.divisibilityCluster,
    id: ids.primeFactors,
    shortKey: 'canonical_math_factor_natural_numbers_into_primes',
    title: 'Natürliche Zahlen in Primfaktoren zerlegen',
    titleEn: 'Factor natural numbers into primes',
    description:
      'Die lernende Person kann natürliche Zahlen größer als 1 schrittweise in Primfaktoren zerlegen, die vollständige Zerlegung angeben und durch Rückmultiplikation prüfen.',
    descriptionEn:
      'The learner can factor natural numbers greater than 1 step by step into prime factors, state the complete prime factorization, and check it by multiplying the factors.',
    requires: [ids.divisibility],
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Mathematik, M5.3.1',
    atomicityReason:
      'Zerlegen, vollständiges Angeben und Rückprüfen sind zusammengehörige Schritte derselben Primfaktorzerlegungs-Kompetenz.',
    memoryReason:
      'Primfaktorzerlegungen müssen konstruiert und geprüft werden; isoliertes Auswendiglernen würde die fachliche Kompetenz nicht angemessen abbilden.',
  },
  {
    parentId: ids.proportionalCluster,
    id: ids.ruleOfThree,
    shortKey: 'canonical_math_solve_simple_proportional_tasks_with_rule_of_three',
    title: 'Einfache proportionale Sachaufgaben mit Dreisatz lösen',
    titleEn: 'Solve simple proportional contextual tasks using the rule of three',
    description:
      'Die lernende Person kann in einfachen Sachsituationen prüfen, ob eine proportionale Zuordnung vorliegt, einen gesuchten Wert durch Zurückführen auf 1 und anschließendes Vervielfachen bestimmen und die Rechenschritte nachvollziehbar darstellen.',
    descriptionEn:
      'In simple contexts, the learner can determine whether a relationship is proportional, find an unknown value by reducing to one unit and then scaling up, and present the calculation steps clearly.',
    requires: [
      'ca623958-c204-5d1b-bdd0-3f76765674cb',
      '65365dce-f33f-49d8-9516-42f75883aa86',
    ],
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Mathematik, M5.4.1',
    atomicityReason:
      'Erkennen der Proportionalität und Ausführen des Dreisatzes bilden eine zusammenhängende Modellierungs- und Lösungsleistung in einer einfachen Sachsituation.',
    memoryReason:
      'Die Kompetenz erfordert das Erkennen einer proportionalen Struktur und einen begründeten Rechenweg; dafür ist kein separates Memory-Deck nötig.',
  },
  {
    parentId: ids.proportionalCluster,
    id: ids.scale,
    shortKey: 'canonical_math_solve_scale_problems_with_consistent_units',
    title: 'Maßstabsaufgaben mit gleichartigen Längeneinheiten lösen',
    titleEn: 'Solve scale problems using equivalent length units',
    description:
      'Die lernende Person kann in Karten-, Plan- oder Modellsituationen einen Maßstab als Verhältnis von dargestellter zu realer Länge deuten, die Längen in gleichartige Einheiten umrechnen und eine gesuchte dargestellte oder reale Länge bestimmen.',
    descriptionEn:
      'In map, plan, or model contexts, the learner can interpret a scale as the ratio of represented length to real length, convert the lengths to equivalent units, and determine an unknown represented or real length.',
    requires: [ids.ruleOfThree, ids.units],
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Mathematik, M5.4.1',
    atomicityReason:
      'Maßstab deuten, Einheiten angleichen und eine Länge bestimmen sind untrennbare Teilschritte derselben Maßstabsaufgabe.',
    memoryReason:
      'Maßstabsaufgaben werden über Verhältnisverständnis, Einheitenkontrolle und Anwendung gelernt; ein Memory-Deck ist nicht erforderlich.',
  },
  {
    parentId: ids.fractionsCluster,
    id: ids.equivalentFractions,
    shortKey: 'canonical_math_expand_and_reduce_equivalent_fractions',
    title: 'Brüche erweitern und kürzen',
    titleEn: 'Expand and reduce fractions',
    description:
      'Die lernende Person kann Zähler und Nenner mit demselben positiven ganzen Faktor multiplizieren oder durch denselben gemeinsamen Teiler dividieren, so wertgleiche Brüche erzeugen und begründen, warum der Bruchwert erhalten bleibt.',
    descriptionEn:
      "The learner can multiply the numerator and denominator by the same positive integer factor or divide them by the same common divisor, produce equivalent fractions, and explain why the fraction's value is preserved.",
    requires: [
      'cafd6520-c4af-4109-9863-cc49ba6fad4d',
      '65365dce-f33f-49d8-9516-42f75883aa86',
    ],
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Mathematik, M6.1.1',
    atomicityReason:
      'Erweitern und Kürzen sind inverse Ausführungsformen derselben Kompetenz, wertgleiche Bruchdarstellungen bei erhaltenem Bruchwert zu erzeugen.',
    memoryReason:
      'Wertgleichheit beim Erweitern und Kürzen soll verstanden, begründet und angewendet werden; ein Memory-Deck wäre dafür kein geeigneter Primärweg.',
  },
  {
    parentId: ids.fractionsCluster,
    id: ids.compareFractions,
    shortKey: 'canonical_math_compare_fractions_with_suitable_strategies',
    title: 'Brüche mit geeigneten Strategien vergleichen',
    titleEn: 'Compare fractions using suitable strategies',
    description:
      'Die lernende Person kann Brüche mithilfe gemeinsamer Nenner oder Zähler, geeigneter Bezugsbrüche oder wertgleicher Darstellungen vergleichen, die jeweils passende Strategie auswählen und die Ordnung begründen.',
    descriptionEn:
      'The learner can compare fractions using common denominators or numerators, suitable benchmark fractions, or equivalent forms, choose an appropriate strategy in each case, and justify the ordering.',
    requires: [ids.equivalentFractions],
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Mathematik, M6.1.1',
    atomicityReason:
      'Die Auswahl einer passenden Vergleichsstrategie und die begründete Ordnung sind Bestandteile derselben Bruchvergleichs-Kompetenz.',
    memoryReason:
      'Der Bruchvergleich beruht auf flexibler Strategiewahl und Begründung; diese Leistung wird durch Aufgabenpraxis statt durch ein Memory-Deck aufgebaut.',
  },
  {
    parentId: ids.rationalCluster,
    id: ids.rationalNumberLine,
    shortKey: 'canonical_math_represent_and_order_rational_numbers_on_number_line',
    title: 'Rationale Zahlen an der Zahlengeraden darstellen und ordnen',
    titleEn: 'Represent and order rational numbers on the number line',
    description:
      'Die lernende Person kann positive und negative nicht ganze rationale Zahlen, insbesondere Bruch- und Dezimalzahlen, auf einer passend skalierten Zahlengeraden darstellen, begründet ordnen und wertgleiche Darstellungen demselben Punkt zuordnen.',
    descriptionEn:
      'The learner can represent positive and negative non-integer rational numbers, especially fractions and decimals, on a suitably scaled number line, order them with justification, and assign equivalent representations to the same point.',
    requires: [
      'cf474eab-1379-4877-907e-58b0892ce734',
      '9ef6c4fa-b97a-5d7a-86c1-96690f02d916',
      'd07ef7b1-8bd2-56e0-9e74-d90c3c3e02fe',
      '65365dce-f33f-49d8-9516-42f75883aa86',
    ],
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Mathematik, M6.1.1',
    atomicityReason:
      'Darstellen und Ordnen werden hier über dieselbe Zahlengeraden-Repräsentation beobachtet und bilden eine zusammenhängende Kompetenz.',
    memoryReason:
      'Die Kompetenz verlangt Darstellungswechsel, Skalierungsverständnis und Begründung; ein Memory-Deck ist dafür nicht erforderlich.',
  },
  {
    parentId: ids.rationalCluster,
    id: ids.numberSets,
    shortKey: 'canonical_math_explain_relationships_natural_integer_rational_numbers',
    title: 'Beziehungen zwischen natürlichen, ganzen und rationalen Zahlen erläutern',
    titleEn: 'Explain relationships between natural numbers, integers, and rational numbers',
    description:
      'Die lernende Person kann Zahlen passenden Zahlmengen zuordnen und anhand von Beispielen erläutern, dass jede natürliche Zahl ganz und jede ganze Zahl rational ist, während nicht jede rationale Zahl ganz und nicht jede ganze Zahl natürlich ist.',
    descriptionEn:
      'The learner can classify numbers into suitable number sets and use examples to explain that every natural number is an integer and every integer is rational, while not every rational number is an integer and not every integer is natural.',
    requires: [ids.rationalNumberLine],
    sourceRef: 'LehrplanPLUS Bayern Gymnasium Mathematik, M6.1.1',
    atomicityReason:
      'Das Zuordnen und Erläutern der Inklusionsbeziehungen bildet eine einzelne Zahlmengen-Kompetenz mit Beispielen und Gegenbeispielen.',
    memoryReason:
      'Die Zahlmengenbeziehungen sollen an Beispielen verstanden und erläutert werden; ein isoliertes Memory-Deck ist für dieses Ziel nicht erforderlich.',
  },
]

const childIds = childSpecs.map(({ id }) => id)

const readJson = (path: string): JsonRecord =>
  JSON.parse(readFileSync(resolve(repoRoot, path), 'utf8')) as JsonRecord

const writeJson = (path: string, value: unknown): void => {
  writeFileSync(resolve(repoRoot, path), `${JSON.stringify(value, null, 2)}\n`)
}

const readJsonl = (path: string): JsonRecord[] =>
  readFileSync(resolve(repoRoot, path), 'utf8')
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line) as JsonRecord)

const writeJsonl = (path: string, records: JsonRecord[]): void => {
  writeFileSync(resolve(repoRoot, path), `${records.map((record) => JSON.stringify(record)).join('\n')}\n`)
}

const normalizeText = (value: unknown): string =>
  String(value ?? '')
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .trim()

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

const visualizationLink = (goal: JsonRecord): JsonRecord => ({
  type: 'goal-visualization',
  resourceType: 'image',
  role: 'primary',
  skillpilotId: goal.id,
  title: `Visualisierung: ${goal.title}`,
  url: `/assets/goal-visualizations/mathematik/${goal.id}/${goal.id}.png`,
  provider: 'Google Gemini / Nano Banana Pro (gemini-3-pro-image)',
  description: `Visualisierung zum Lernziel: ${goal.title}.`,
  altText: `Didaktische Visualisierung zum Lernziel "${goal.title}". ${goal.description}`,
  lang: 'de',
  license: 'AI-generated, SkillPilot-curated',
  reviewStatus: 'needs_review',
})

const unique = <T>(values: T[]): T[] => [...new Set(values)]

const replaceReference = (values: string[] | undefined, oldId: string, replacements: string[]): string[] =>
  unique((values ?? []).flatMap((value) => (value === oldId ? replacements : [value])))

function buildCanonical(): JsonRecord {
  const landscape = readJson(paths.canonical)
  const goals = landscape.goals as JsonRecord[]
  const byId = new Map(goals.map((goal) => [goal.id, goal]))

  for (const oldId of splitClusterIds) {
    if (!byId.has(oldId)) throw new Error(`Missing split parent ${oldId}`)
  }

  const clusterTitles: Record<string, { title: string; titleEn: string }> = {
    [ids.divisibilityCluster]: {
      title: 'Teilbarkeitsregeln prüfen und Primfaktorzerlegungen angeben',
      titleEn: 'Apply divisibility rules and state prime factorizations',
    },
    [ids.proportionalCluster]: {
      title: 'Einfache proportionale Sachaufgaben mit Dreisatz und Maßstab lösen',
      titleEn: 'Solve simple proportional tasks using the rule of three and scale',
    },
    [ids.fractionsCluster]: {
      title: 'Brüche erweitern, kürzen und vergleichen',
      titleEn: 'Expand, reduce, and compare fractions',
    },
    [ids.rationalCluster]: {
      title: 'Rationale Zahlen darstellen, ordnen und in Zahlmengen einordnen',
      titleEn: 'Represent and order rational numbers and classify them into number sets',
    },
  }

  for (const oldId of splitClusterIds) {
    const parent = byId.get(oldId)!
    const { title, titleEn } = clusterTitles[oldId]
    const children = childSpecs.filter((child) => child.parentId === oldId).map((child) => child.id)
    parent.title = title
    parent.titleEn = titleEn
    parent.description = `Cluster für die fachlich getrennten Lernziele zu „${title}“. Die enthaltenen atomaren Ziele machen die eigenständig beobachtbaren Leistungen explizit.`
    parent.descriptionEn = `Cluster for the separated learning goals represented by “${titleEn}”. Its atomic children make the independently observable performances explicit.`
    parent.type = 'cluster'
    parent.weight = 2
    parent.requires = []
    parent.contains = children
    delete parent.semanticAtomic
  }

  for (const spec of childSpecs) {
    const parent = byId.get(spec.parentId)!
    const existing = byId.get(spec.id)
    const goal: JsonRecord = existing ?? {
      id: spec.id,
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
      sourceRef: spec.sourceRef,
      type: 'atomic',
      semanticAtomic: true,
      resourceLinks: [],
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
      sourceRef: spec.sourceRef,
      type: 'atomic',
      semanticAtomic: true,
    })
    goal.resourceLinks = [visualizationLink(goal)]
    byId.set(goal.id, goal)
  }

  for (const spec of [...childSpecs].reverse()) {
    if (goals.some((goal) => goal.id === spec.id)) continue
    const parentIndex = goals.findIndex((goal) => goal.id === spec.parentId)
    goals.splice(parentIndex + 1, 0, byId.get(spec.id)!)
  }

  const units = byId.get(ids.units)
  if (!units) throw new Error(`Missing units goal ${ids.units}`)
  units.description =
    'Die lernende Person kann für alltagsnahe Größen passende Einheiten auswählen, Größenangaben sicher in gleichartige Einheiten umrechnen, dabei den unveränderten Größenwert anhand des Einheitenverhältnisses begründen und Messergebnisse in einer gemeinsamen Einheit sinnvoll vergleichen.'
  units.descriptionEn =
    'The learner can choose suitable units for everyday quantities, reliably convert measurements into equivalent units, justify the unchanged quantity from the relationship between the units, and compare measurement results meaningfully in a common unit.'
  units.requires = (units.requires ?? []).filter((id: string) => id !== ids.divisibilityCluster)
  units.semanticAtomic = true
  if (Array.isArray(units.resourceLinks) && units.resourceLinks[0]) {
    units.resourceLinks[0].description = `Visualisierung zum Lernziel: ${units.title}.`
    units.resourceLinks[0].altText = `Didaktische Visualisierung zum Lernziel "${units.title}". ${units.description}`
    units.resourceLinks[0].reviewStatus = 'needs_review'
  }

  const rewires: Record<string, Record<string, string[]>> = {
    [ids.divisibilityCluster]: {
      'ca8b2e67-7d14-5baf-8404-26820fe3d548': [ids.primeFactors],
      '4eeab7d5-eeb3-579b-845e-1c52ffe9e89f': [ids.primeFactors],
      'ee48e811-4c9c-5080-9836-8403fc9f0810': [ids.primeFactors],
    },
    [ids.proportionalCluster]: {
      '71d43fcc-d787-4874-ae4a-2336364e9c0a': [ids.ruleOfThree],
    },
    [ids.fractionsCluster]: {
      'ec9f2ed4-c9e6-5fb3-a073-75b53127e55d': [ids.compareFractions],
      'f8704a7b-e93d-4e32-b0f9-1b171545fe28': [ids.compareFractions],
      '7676b0f9-340d-4a91-ab1f-92745a8f88db': [ids.compareFractions],
      'c9eb293a-9be7-4a3d-8cd0-a1d885a3fdc1': [ids.compareFractions],
      'fb81062a-4929-5f09-8d92-f9cf4b106c17': [ids.equivalentFractions, ids.compareFractions],
    },
    [ids.rationalCluster]: {
      'ec9f2ed4-c9e6-5fb3-a073-75b53127e55d': [ids.rationalNumberLine],
      'f8704a7b-e93d-4e32-b0f9-1b171545fe28': [ids.rationalNumberLine],
      '7676b0f9-340d-4a91-ab1f-92745a8f88db': [ids.rationalNumberLine, ids.numberSets],
      'c9eb293a-9be7-4a3d-8cd0-a1d885a3fdc1': [ids.rationalNumberLine],
      '13319b05-1654-5645-ab7b-733b0e180327': [ids.rationalNumberLine],
    },
  }

  for (const goal of goals) {
    for (const oldId of splitClusterIds) {
      if ((goal.requires ?? []).includes(oldId)) {
        const replacements = rewires[oldId]?.[goal.id]
        if (!replacements) {
          throw new Error(`Unadjudicated requires reference ${goal.id} -> ${oldId}`)
        }
        goal.requires = replaceReference(goal.requires, oldId, replacements)
      }
      if ((goal.examData?.coveredGoalIds ?? []).includes(oldId)) {
        const replacements = rewires[oldId]?.[goal.id]
        if (!replacements) {
          throw new Error(`Unadjudicated assessment reference ${goal.id} -> ${oldId}`)
        }
        goal.examData.coveredGoalIds = replaceReference(goal.examData.coveredGoalIds, oldId, replacements)
      }
    }
  }

  const scaledFigures = byId.get('2041f4ec-620d-4a20-9922-6ebf16f8f8fa')
  if (!scaledFigures) throw new Error('Missing scaled-figures goal 2041f4ec-620d-4a20-9922-6ebf16f8f8fa')
  scaledFigures.requires = unique([...(scaledFigures.requires ?? []), ids.scale])

  const scaleAssessment = byId.get('8a360e18-c40f-5e77-a445-1311a8f8430e')
  if (!scaleAssessment?.examData) throw new Error('Missing J9 scale assessment 8a360e18-c40f-5e77-a445-1311a8f8430e')
  scaleAssessment.requires = unique([...(scaleAssessment.requires ?? []), ids.scale])
  scaleAssessment.examData.coveredGoalIds = unique([
    ...(scaleAssessment.examData.coveredGoalIds ?? []),
    ids.scale,
  ])

  const parentIdsByChild = new Map<string, string[]>()
  for (const goal of goals) {
    for (const childId of goal.contains ?? []) {
      parentIdsByChild.set(childId, [...(parentIdsByChild.get(childId) ?? []), goal.id])
    }
  }
  const increments = new Map<string, Set<string>>()
  for (const splitId of splitClusterIds) {
    const queue = [...(parentIdsByChild.get(splitId) ?? [])]
    const visited = new Set<string>()
    while (queue.length > 0) {
      const ancestorId = queue.shift()!
      if (visited.has(ancestorId)) continue
      visited.add(ancestorId)
      increments.set(ancestorId, new Set([...(increments.get(ancestorId) ?? []), splitId]))
      queue.push(...(parentIdsByChild.get(ancestorId) ?? []))
    }
  }
  for (const [ancestorId, affectedSplits] of increments) {
    const ancestor = byId.get(ancestorId)
    if (!ancestor) throw new Error(`Missing ancestor ${ancestorId}`)
    if (splitClusterIds.includes(ancestorId)) continue
    const atomicDescendants = new Set<string>()
    const visit = (goalId: string): void => {
      const goal = byId.get(goalId)
      if (!goal) throw new Error(`Missing contains target ${goalId}`)
      if ((goal.contains ?? []).length === 0) {
        atomicDescendants.add(goalId)
        return
      }
      for (const childId of goal.contains) visit(childId)
    }
    visit(ancestorId)
    if (affectedSplits.size === 0) throw new Error(`Empty affected split set for ${ancestorId}`)
    ancestor.weight = atomicDescendants.size
  }

  for (const oldId of splitClusterIds) {
    for (const goal of goals) {
      if ((goal.requires ?? []).includes(oldId)) throw new Error(`Stale requires target ${oldId}`)
      if ((goal.examData?.coveredGoalIds ?? []).includes(oldId)) {
        throw new Error(`Stale assessment target ${oldId}`)
      }
    }
  }

  landscape.goals = goals
  return landscape
}

function buildSemanticKinds(landscape: JsonRecord): JsonRecord {
  const ledger = readJson(paths.semanticKinds)
  const goalById = new Map((landscape.goals as JsonRecord[]).map((goal) => [goal.id, goal]))
  const decisionById = new Map((ledger.decisions as JsonRecord[]).map((decision) => [decision.goalId, decision]))
  // The ledger schema intentionally constrains decisionBasis to reviewed release-model enums.
  // This adjudication was produced by AI synthesis after two candidate reviews under explicit
  // product-owner delegation; no human attestation is asserted by these semantic-kind records.

  const fingerprintOnlyIds = [
    'ca8b2e67-7d14-5baf-8404-26820fe3d548',
    '4eeab7d5-eeb3-579b-845e-1c52ffe9e89f',
    'ee48e811-4c9c-5080-9836-8403fc9f0810',
    '71d43fcc-d787-4874-ae4a-2336364e9c0a',
    'ec9f2ed4-c9e6-5fb3-a073-75b53127e55d',
    'f8704a7b-e93d-4e32-b0f9-1b171545fe28',
    '7676b0f9-340d-4a91-ab1f-92745a8f88db',
    'c9eb293a-9be7-4a3d-8cd0-a1d885a3fdc1',
    'fb81062a-4929-5f09-8d92-f9cf4b106c17',
    '13319b05-1654-5645-ab7b-733b0e180327',
    '2041f4ec-620d-4a20-9922-6ebf16f8f8fa',
    '8a360e18-c40f-5e77-a445-1311a8f8430e',
  ]

  for (const goalId of [...splitClusterIds, ...childIds, ids.units, ...fingerprintOnlyIds]) {
    const goal = goalById.get(goalId)
    if (!goal) throw new Error(`Missing semantic-kind goal ${goalId}`)
    const decision = decisionById.get(goalId) ?? { goalId }
    const semanticKind = splitClusterIds.includes(goalId)
      ? 'curricularArea'
      : childIds.includes(goalId) || goalId === ids.units
        ? 'curricularAtomic'
        : decision.semanticKind
    if (!semanticKind) throw new Error(`Missing retained semantic kind for ${goalId}`)
    const decisionBasis = semanticKind === 'curricularArea'
      ? 'reviewed-current-structural-split-curricular-area'
      : semanticKind === 'curricularAtomic'
        ? 'reviewed-current-structural-split-curricular-atomic'
        : semanticKind === 'practiceAssessment'
          ? 'reviewed-current-post-split-practice-assessment'
          : decision.decisionBasis
    if (!decisionBasis) throw new Error(`Missing retained semantic-kind basis for ${goalId}`)
    Object.assign(decision, {
      sourceFingerprint: fingerprintSemanticKindSourceGoal(goal),
      semanticKind,
      decisionStatus: 'authoritative',
      decisionBasis,
    })
    decisionById.set(goalId, decision)
  }

  ledger.decisions = [...decisionById.values()].sort((left, right) =>
    left.goalId < right.goalId ? -1 : left.goalId > right.goalId ? 1 : 0,
  )
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
  ledger.counts = Object.fromEntries(
    preferredOrder.filter((key) => counts[key] !== undefined).map((key) => [key, counts[key]]),
  )
  ledger.counts.total = (ledger.decisions as JsonRecord[]).length
  return ledger
}

function buildAtomicity(landscape: JsonRecord): JsonRecord[] {
  const goalById = new Map((landscape.goals as JsonRecord[]).map((goal) => [goal.id, goal]))
  const records = readJsonl(paths.atomicity)
  const byId = new Map(records.map((record) => [record.goalId, record]))
  const reviewedAt = '2026-08-26'
  const reviewer = 'codex-ai-synthesis-2026-08-26'

  for (const spec of childSpecs) {
    const goal = goalById.get(spec.id)!
    byId.set(spec.id, {
      schemaVersion: 1,
      reviewId: 'canonical-math-full',
      ruleVersion: 'semantic-atomicity-v1',
      landscapeId: landscape.landscapeId,
      goalId: spec.id,
      fingerprint: fingerprintReviewGoal(goal, 'semantic-atomicity-v1'),
      reviewedAt,
      reviewer,
      status: 'atomic',
      semanticAtomic: true,
      reason: spec.atomicityReason,
      suggestedSplit: [],
    })
  }

  const units = goalById.get(ids.units)!
  const unitsRecord = byId.get(ids.units)
  if (!unitsRecord) throw new Error(`Missing atomicity record ${ids.units}`)
  Object.assign(unitsRecord, {
    fingerprint: fingerprintReviewGoal(units, 'semantic-atomicity-v1'),
    reviewedAt,
    reviewer,
    status: 'atomic',
    semanticAtomic: true,
    reason:
      'Einheiten auswählen, in gleichartige Einheiten umrechnen und anschließend vergleichen sind aufeinander bezogene Schritte einer einzelnen Größenvergleichs-Kompetenz; das eigenständige Messen ist ausdrücklich nicht enthalten.',
    suggestedSplit: [],
  })
  const emitted = new Set<string>()
  const result: JsonRecord[] = []
  for (const record of records) {
    const replacements = childSpecs.filter((spec) => spec.parentId === record.goalId)
    if (replacements.length > 0) {
      for (const spec of replacements) {
        result.push(byId.get(spec.id)!)
        emitted.add(spec.id)
      }
      continue
    }
    if (splitClusterIds.includes(record.goalId) || emitted.has(record.goalId)) continue
    result.push(byId.get(record.goalId)!)
    emitted.add(record.goalId)
  }
  for (const spec of childSpecs) {
    if (!emitted.has(spec.id)) result.push(byId.get(spec.id)!)
  }
  return result
}

function buildMemory(landscape: JsonRecord): JsonRecord[] {
  const goalById = new Map((landscape.goals as JsonRecord[]).map((goal) => [goal.id, goal]))
  const records = readJsonl(paths.memory)
  const byId = new Map(records.map((record) => [record.goalId, record]))
  const reviewedAt = '2026-08-26'
  const reviewer = 'codex-ai-synthesis-2026-08-26'

  for (const spec of childSpecs) {
    const goal = goalById.get(spec.id)!
    byId.set(spec.id, {
      schemaVersion: 1,
      reviewId: 'canonical-math-full',
      ruleVersion: 'memory-card-review-v1',
      landscapeId: landscape.landscapeId,
      goalId: spec.id,
      fingerprint: fingerprintReviewGoal(goal, 'memory-card-review-v1'),
      status: 'no_memory_needed',
      memoryUseful: false,
      reviewedAt,
      reviewer,
      reason: spec.memoryReason,
    })
  }

  const units = goalById.get(ids.units)!
  const unitsRecord = byId.get(ids.units)
  if (!unitsRecord) throw new Error(`Missing memory review ${ids.units}`)
  Object.assign(unitsRecord, {
    fingerprint: fingerprintReviewGoal(units, 'memory-card-review-v1'),
    status: 'no_memory_needed',
    memoryUseful: false,
    reviewedAt,
    reviewer,
    reason:
      'Passende Einheiten auswählen, Größenangaben umrechnen und anschließend vergleichen wird durch verständnisorientierte Aufgabenpraxis aufgebaut; ein eigenes Memory-Deck ist nicht erforderlich.',
  })
  const emitted = new Set<string>()
  const result: JsonRecord[] = []
  for (const record of records) {
    const replacements = childSpecs.filter((spec) => spec.parentId === record.goalId)
    if (replacements.length > 0) {
      for (const spec of replacements) {
        result.push(byId.get(spec.id)!)
        emitted.add(spec.id)
      }
      continue
    }
    if (splitClusterIds.includes(record.goalId) || emitted.has(record.goalId)) continue
    result.push(byId.get(record.goalId)!)
    emitted.add(record.goalId)
  }
  for (const spec of childSpecs) {
    if (!emitted.has(spec.id)) result.push(byId.get(spec.id)!)
  }
  return result
}

function buildVisualizationQa(): JsonRecord {
  const qa = readJson(paths.visualizationQa)
  const deliberatelyOpen = new Set([...splitClusterIds, ...childIds, ids.units])
  qa.records = (qa.records as JsonRecord[]).filter((record) => !deliberatelyOpen.has(record.goalId))
  return qa
}

const canonical = buildCanonical()
const semanticKinds = buildSemanticKinds(canonical)
const atomicity = buildAtomicity(canonical)
const memory = buildMemory(canonical)
const visualizationQa = buildVisualizationQa()

if (writeMode) {
  writeJson(paths.canonical, canonical)
  writeJson(paths.semanticKinds, semanticKinds)
  writeJsonl(paths.atomicity, atomicity)
  writeJsonl(paths.memory, memory)
  writeJson(paths.visualizationQa, visualizationQa)
}

console.log(
  `CHECK apply_math_batch_002_adjudication ${writeMode ? 'WRITE' : 'PASS'} splits=4 children=8 revision=1 visualizationQaOpen=9`,
)
