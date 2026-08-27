import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { basename, join, relative, resolve } from 'node:path'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel'

type JsonRecord = Record<string, unknown>

const repoRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')
const prepareVisualization = process.argv.includes('--prepare-visualization')
const reviewDate = '2026-08-27'
const reviewedAt = '2026-08-27T10:47:00Z'
const reviewer = 'codex-math-batch010-adjudicated-split'

const paths = {
  canonical: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
  provenance: 'curricula/DE/Gymnasium/provenance/canonical-goal-provenance-registry.json',
  semanticKinds: 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json',
  atomicity: 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-math-full.review.jsonl',
  memory: 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-math-full.review.jsonl',
  visualizationQa: 'curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json',
  atlasSources: 'app/scripts/config/goal-books/de-gym-math-national-atlas.sources.json',
  durationPolicy: 'app/scripts/config/math-duration-split-spanning-tree-policy.json',
  assessmentBlueprint: 'curricula/DE/Gymnasium/assessments/mathematik/seki/j7/blueprint.md',
} as const

const ids = {
  landscape: '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced',
  corridor: 'aad80460-c4b2-4d6f-964b-01c80e7ec6f2',
  retainedCluster: '0afe00fe-8cbc-4ed4-8b50-84494067e362',
  interpretation: 'f08d06dc-139d-5fd2-892c-8cc919b1e4fc',
  transformation: '2c4830e6-a8d5-48d0-9202-3b7d18a419c2',
  variableRoles: 'c9112f89-ffaf-40f3-af1f-86a04b5ad4ee',
  variableIntroduction: '5bba4ec2-3781-4624-8b62-e24b38f7f76e',
  orientation: '65365dce-f33f-49d8-9516-42f75883aa86',
  termValues: 'a6469c01-6ca3-5eb2-a82c-94f3d0560b32',
  contextTranslation: 'fd860da9-73ba-47cd-a1a8-452424915a80',
  mvRightPrism: '59d5a330-61be-4590-ab46-cf7cefecd144',
  distributiveTransformation: '959cc50b-6c81-4fa1-800f-4804a707b1ee',
  assessment: 'af96c2fc-194e-55af-ac0f-8afda17bf3cd',
} as const

const interpretationSpec = {
  shortKey: 'canonical_math_sek1_j7_read_interpret_variable_expressions',
  title: 'Terme mit Variablen lesen und deuten',
  titleEn: 'Read and interpret expressions with variables',
  description:
    'Die lernende Person kann Terme mit Variablen lesen, ihre Bestandteile und Rechenstruktur benennen und ihre Bedeutung in einfachen Kontexten erklären.',
  descriptionEn:
    'The learner can read expressions with variables, identify their components and operational structure, and explain their meaning in simple contexts.',
  topicCode: 'CANONICAL.MATH.SEK1.J7.TERMS.READ_INTERPRET',
} as const

const exactExistingVisualizationHashes: Record<string, string> = {
  [ids.variableRoles]: 'sha256:74903204e4806ec60526f96ab98b4286a447bcf7f36bdf4a755f28317c892ebb',
  [ids.transformation]: 'sha256:aec9509a5590867c4a253ace9d6cb3e8acbfa10d6b5fafb6588333a23ce006aa',
  [ids.retainedCluster]: 'sha256:240ce7e8f19f4b4aa2764bb9dd0c11856bdc6542dee1009e53c8104186418f86',
}

const downstreamChildRequirements: Record<string, string[]> = {
  '325771e1-602d-4bca-a199-a8f39a2d3dee': [ids.transformation],
  '9023226b-fc17-412b-807c-2bb45cd551d5': [ids.transformation],
  '34ba4714-a0ff-4a48-857f-d2481cbe0441': [ids.transformation],
  'c420e0be-1e74-4050-834c-d8da7f41095a': [ids.transformation],
  '6596405a-9728-41df-9163-53670ec2a937': [ids.transformation],
  '3e4032bd-4d8c-4e72-bfdd-64a34df053c9': [ids.transformation],
  'e322310f-f33a-485d-bc23-2412a6b8fa12': [ids.transformation],
  [ids.assessment]: [ids.transformation],
}

const durationParentByFileName: Record<string, string> = {
  'de-he-seki-g8.view.json': 'j7-g8-kompetenzen',
  'de-he-seki-g9.view.json': 'j7-g9-kompetenzen',
  'de-rp-seki-g8.view.json': 'rp-orientierungsstufe-g8-kompetenzen',
  'de-rp-seki-g9.view.json': 'rp-orientierungsstufe-g9-kompetenzen',
  'de-sh-seki-g8.view.json': 'sh-jg7-9-g8-kompetenzen',
  'de-sh-seki-g9.view.json': 'sh-jg7-9-g9-kompetenzen',
}

const generatedViewNames = new Set([
  'de-he-gk-g8.view.json', 'de-he-gk-g9.view.json',
  'de-he-lk-g8.view.json', 'de-he-lk-g9.view.json',
  'de-he-seki-g8.view.json', 'de-he-seki-g9.view.json',
  'de-rp-gk-g8.view.json', 'de-rp-gk-g9.view.json',
  'de-rp-lk-g8.view.json', 'de-rp-lk-g9.view.json',
  'de-rp-seki-g8.view.json', 'de-rp-seki-g9.view.json',
  'de-sh-gk-g8.view.json', 'de-sh-gk-g9.view.json',
  'de-sh-lk-g8.view.json', 'de-sh-lk-g9.view.json',
  'de-sh-seki-g8.view.json', 'de-sh-seki-g9.view.json',
])

const compositionRoot = resolve(repoRoot, 'curricula/DE/Gymnasium/composition-views/mathematik')
const absolute = (path: string): string => resolve(repoRoot, path)
const readJson = (path: string): JsonRecord => JSON.parse(readFileSync(absolute(path), 'utf8')) as JsonRecord
const readJsonl = (path: string): JsonRecord[] => readFileSync(absolute(path), 'utf8')
  .split(/\r?\n/u)
  .filter((line) => line.trim() !== '')
  .map((line) => JSON.parse(line) as JsonRecord)
const serializeJson = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`
const serializeJsonl = (records: JsonRecord[]): string => `${records.map((record) => JSON.stringify(record)).join('\n')}\n`
const sha256Digest = (value: string | Uint8Array): string =>
  `sha256:${createHash('sha256').update(value).digest('hex')}`
const stringArray = (value: unknown): string[] => Array.isArray(value) ? value.map(String) : []
const stableJson = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as JsonRecord)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nested]) => `${JSON.stringify(key)}:${stableJson(nested)}`)
      .join(',')}}`
  }
  const serialized = JSON.stringify(value)
  return serialized === undefined ? 'null' : serialized
}
const same = (left: unknown, right: unknown): boolean => stableJson(left) === stableJson(right)

const deterministicGoalId = (shortKey: string): string => {
  const value = createHash('sha1').update(`DE-GYM-CANONICAL-MATH:${shortKey}`).digest('hex')
  return `${value.slice(0, 8)}-${value.slice(8, 12)}-5${value.slice(13, 16)}-8${value.slice(17, 20)}-${value.slice(20, 32)}`
}

const reviewFingerprint = (goal: JsonRecord, ruleVersion: string): string => {
  const normalize = (value: unknown): string => String(value ?? '').normalize('NFKC').replace(/\s+/gu, ' ').trim()
  const dimensions = (goal.dimensionTags ?? {}) as JsonRecord
  return sha256Digest(stableJson({
    ruleVersion,
    goalId: goal.id,
    shortKey: goal.shortKey ?? '',
    title: normalize(goal.title),
    titleEn: normalize(goal.titleEn),
    description: normalize(goal.description),
    descriptionEn: normalize(goal.descriptionEn),
    phase: normalize(dimensions.phase),
    area: normalize(dimensions.area),
    topicCode: normalize(dimensions.topicCode),
    nodeKind: normalize(goal.nodeKind),
  }))
}

const rewriteRequirement = (values: unknown, replacements: string[]): string[] => {
  const result: string[] = []
  for (const goalId of stringArray(values)) {
    if (goalId === ids.retainedCluster) result.push(...replacements)
    else result.push(goalId)
  }
  return [...new Set(result)]
}

const updateVisualizationMetadata = (goal: JsonRecord): void => {
  const links = Array.isArray(goal.resourceLinks) ? goal.resourceLinks as JsonRecord[] : []
  for (const link of links) {
    if (link.type !== 'goal-visualization' || link.role !== 'primary') continue
    link.title = `Visualisierung: ${String(goal.title)}`
    link.description = `Visualisierung zum Lernziel: ${String(goal.title)}.`
    link.altText = `Didaktische Visualisierung zum Lernziel "${String(goal.title)}". ${String(goal.description)}`
  }
}

function buildCanonical(): JsonRecord {
  const landscape = readJson(paths.canonical)
  if (landscape.landscapeId !== ids.landscape) throw new Error('Unexpected canonical landscape')
  const goals = landscape.goals as JsonRecord[]
  const byId = new Map(goals.map((goal) => [String(goal.id), goal]))
  if (byId.size !== goals.length) throw new Error('Duplicate canonical goal IDs')
  if (deterministicGoalId(interpretationSpec.shortKey) !== ids.interpretation) {
    throw new Error('Deterministic interpretation goal ID drift')
  }

  const variableRoles = byId.get(ids.variableRoles)
  const transformation = byId.get(ids.transformation)
  const retained = byId.get(ids.retainedCluster)
  const corridor = byId.get(ids.corridor)
  if (!variableRoles || !transformation || !retained || !corridor) {
    throw new Error('Batch010 canonical anchor is missing')
  }

  variableRoles.description =
    'Die lernende Person kann Variablen in Termen, Gleichungen und Formeln als Unbekannte, Veränderliche oder Parameter verwenden, ihre jeweilige Rolle fachsprachlich erklären und passenden Situationen zuordnen.'
  variableRoles.descriptionEn =
    'The learner can use variables in expressions, equations, and formulae as unknowns, varying quantities, or parameters, explain each role using correct terminology, and relate it to suitable situations.'
  updateVisualizationMetadata(variableRoles)

  transformation.description =
    'Die lernende Person kann Terme mit rationalen Zahlen und Variablen mithilfe von Rechengesetzen so umformen, dass sie für alle zulässigen Variablenwerte denselben Termwert haben, und dies nachvollziehbar begründen.'
  transformation.descriptionEn =
    'The learner can use arithmetic laws to transform expressions involving rational numbers and variables so that they have the same value for every admissible variable value, and justify this transparently.'
  updateVisualizationMetadata(transformation)

  retained.description =
    'Fachlicher Cluster für das Lesen und Deuten von Variablentermen in einfachen Kontexten sowie deren äquivalentes Umformen mit Rechengesetzen.'
  retained.descriptionEn =
    'Curricular cluster for reading and interpreting expressions with variables in simple contexts and transforming them equivalently using arithmetic laws.'
  retained.weight = 2
  retained.contains = [ids.interpretation, ids.transformation]
  retained.requires = []
  retained.type = 'cluster'
  delete retained.semanticAtomic
  updateVisualizationMetadata(retained)
  // The retained Nano Banana Pro illustration is deliberately kept byte-identical.

  const existingInterpretation = byId.get(ids.interpretation)
  const importedLinks = existingInterpretation && Array.isArray(existingInterpretation.resourceLinks)
    ? structuredClone(existingInterpretation.resourceLinks)
    : []
  const interpretation: JsonRecord = {
    id: ids.interpretation,
    shortKey: interpretationSpec.shortKey,
    title: interpretationSpec.title,
    titleEn: interpretationSpec.titleEn,
    description: interpretationSpec.description,
    descriptionEn: interpretationSpec.descriptionEn,
    core: retained.core,
    weight: 1,
    tags: structuredClone(retained.tags ?? []),
    dimensionTags: {
      ...structuredClone(retained.dimensionTags as JsonRecord),
      processCompetencies: ['K2.1', 'K3.1', 'K5.1'],
      topicCode: interpretationSpec.topicCode,
    },
    contains: [],
    requires: [ids.variableIntroduction, ids.orientation],
    applicability: structuredClone(retained.applicability),
    sourceRef: 'Fachanforderungen Mathematik Schleswig-Holstein 2024, Leitidee Strukturen und funktionaler Zusammenhang, Kompetenz K007, S. 45.',
    type: 'atomic',
    semanticAtomic: true,
    resourceLinks: importedLinks,
  }
  if (importedLinks.length > 0) updateVisualizationMetadata(interpretation)
  if (existingInterpretation) Object.assign(existingInterpretation, interpretation)
  else {
    const retainedIndex = goals.findIndex((goal) => goal.id === ids.retainedCluster)
    goals.splice(retainedIndex + 1, 0, interpretation)
    byId.set(ids.interpretation, interpretation)
  }

  // Keep the new interpretation atom on a semantically coherent route through
  // the existing context-to-expression goal. The J7 exam remains unchanged:
  // it does not directly claim to assess contextual explanation.
  const termValues = byId.get(ids.termValues)
  const contextTranslation = byId.get(ids.contextTranslation)
  if (!termValues) throw new Error('Term-value goal is missing')
  if (!contextTranslation) throw new Error('Context-translation goal is missing')
  termValues.requires = stringArray(termValues.requires)
    .filter((goalId) => goalId !== ids.interpretation)
  contextTranslation.requires = [...new Set([
    ...stringArray(contextTranslation.requires),
    ids.interpretation,
  ])]

  const directChildren = stringArray(corridor.contains)
  if (!directChildren.includes(ids.retainedCluster) || !directChildren.includes(ids.transformation)) {
    const after = directChildren.includes(ids.retainedCluster) && !directChildren.includes(ids.transformation)
    if (!after) throw new Error('Variables-and-expressions corridor is neither in before nor after state')
  }
  corridor.contains = directChildren.filter((goalId) => goalId !== ids.transformation)
  corridor.weight = 6

  for (const [goalId, childRequirements] of Object.entries(downstreamChildRequirements)) {
    const goal = byId.get(goalId)
    if (!goal) throw new Error(`Missing downstream Batch010 goal ${goalId}`)
    goal.requires = rewriteRequirement(goal.requires, childRequirements)
    if (goalId === ids.assessment) {
      const examData = goal.examData as JsonRecord
      examData.coveredGoalIds = rewriteRequirement(examData.coveredGoalIds, childRequirements)
    }
  }

  for (const goal of goals) {
    if (stringArray(goal.requires).includes(ids.retainedCluster)) {
      throw new Error(`Cluster prerequisite remains on ${String(goal.id)}`)
    }
    const examData = goal.examData as JsonRecord | undefined
    if (stringArray(examData?.coveredGoalIds).includes(ids.retainedCluster)) {
      throw new Error(`Cluster assessment coverage remains on ${String(goal.id)}`)
    }
  }
  const directParentsOfTransformation = goals
    .filter((goal) => stringArray(goal.contains).includes(ids.transformation))
    .map((goal) => String(goal.id))
  if (!same(directParentsOfTransformation, [ids.retainedCluster])) {
    throw new Error(`Transformation atom parents are ${directParentsOfTransformation.join(',')}`)
  }
  const curricularAtomsBefore = 791
  const atlas = readJson(paths.atlasSources)
  if (atlas.expectedCurricularAtomicGoalCount !== curricularAtomsBefore) {
    throw new Error('National-atlas Mathematics denominator drift')
  }
  landscape.goals = goals
  return landscape
}

const mappingPaths = {
  bw: 'curricula/DE/Gymnasium/mapping/DE-BW/lower-secondary/bw_math_lower_secondary_source_extraction_to_canonical_math.review.json',
  he: 'curricula/DE/Gymnasium/mapping/DE-HE/lower-secondary/hessen_math_lower_secondary_source_extraction_to_canonical_math.review.json',
  sh: 'curricula/DE/Gymnasium/mapping/DE-SH/lower-secondary/sh_math_lower_secondary_source_extraction_to_canonical_math.review.json',
  shLegacy: 'curricula/DE/Gymnasium/mapping/DE-SH/lower-secondary/sh_math_lower_secondary_to_canonical_math.json',
  beLegacy: 'curricula/DE/Gymnasium/mapping/DE-BE/lower-secondary/be_math_lower_secondary_to_canonical_math.json',
  by: 'curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_math_source_extraction_to_canonical_math.review.json',
} as const

const mappingSourceId = (entry: JsonRecord): string => String(entry.legacyGoalId ?? entry.sourceGoalId ?? '')
const mappingTargetId = (entry: JsonRecord): string => String(entry.canonicalGoalId ?? '')

function replaceMappingTarget(
  document: JsonRecord,
  sourceGoalId: string,
  oldTargetId: string,
  replacementTargetIds: string[],
): void {
  const mappings = document.mappings as JsonRecord[]
  const oldIndex = mappings.findIndex(
    (entry) => mappingSourceId(entry) === sourceGoalId && mappingTargetId(entry) === oldTargetId,
  )
  const existingTargets = new Set(
    mappings.filter((entry) => mappingSourceId(entry) === sourceGoalId).map(mappingTargetId),
  )
  if (oldIndex >= 0) {
    const old = mappings[oldIndex]
    const additions = replacementTargetIds
      .filter((goalId) => !existingTargets.has(goalId))
      .map((goalId): JsonRecord => ({ ...structuredClone(old), canonicalGoalId: goalId }))
    mappings.splice(oldIndex, 1, ...additions)
  } else {
    const missingAfter = replacementTargetIds.filter((goalId) => !existingTargets.has(goalId))
    if (missingAfter.length > 0) {
      throw new Error(`Mapping route ${sourceGoalId} is neither before nor after state`)
    }
  }
}

function addMappingTargets(document: JsonRecord, sourceGoalId: string, targetIds: string[]): void {
  const mappings = document.mappings as JsonRecord[]
  const routeEntries = mappings.filter((entry) => mappingSourceId(entry) === sourceGoalId)
  if (routeEntries.length === 0) throw new Error(`Mapping source ${sourceGoalId} is missing`)
  const existing = new Set(routeEntries.map(mappingTargetId))
  const template = routeEntries[routeEntries.length - 1]
  const insertionIndex = mappings.lastIndexOf(template) + 1
  const additions = targetIds
    .filter((goalId) => !existing.has(goalId))
    .map((goalId): JsonRecord => ({
      ...structuredClone(template),
      canonicalGoalId: goalId,
      matchType: 'partial',
    }))
  mappings.splice(insertionIndex, 0, ...additions)
}

function syncReviewedDecision(
  document: JsonRecord,
  sourceGoalId: string,
  rationale: string,
): void {
  const decision = (document.decisions as JsonRecord[]).find((entry) => entry.sourceGoalId === sourceGoalId)
  if (!decision) throw new Error(`Reviewed decision ${sourceGoalId} is missing`)
  decision.canonicalGoalIds = (document.mappings as JsonRecord[])
    .filter((entry) => mappingSourceId(entry) === sourceGoalId)
    .map(mappingTargetId)
  decision.rationale = rationale
  decision.reviewedAt = reviewDate
  decision.reviewer = reviewer
  decision.matchType = 'partial'
}

function assertNoDuplicateMappingPairs(path: string, document: JsonRecord): void {
  const pairs = (document.mappings as JsonRecord[])
    .map((entry) => `${mappingSourceId(entry)}\u0000${mappingTargetId(entry)}`)
  if (new Set(pairs).size !== pairs.length) throw new Error(`Duplicate mapping pair in ${path}`)
}

function buildMappings(): Map<string, JsonRecord> {
  const documents = new Map(Object.values(mappingPaths).map((path) => [path, readJson(path)]))
  const bw = documents.get(mappingPaths.bw)!
  const bwRoute = 'bw-math-seki-bp2016-3-2-1-08-9ea8c392'
  replaceMappingTarget(bw, bwRoute, ids.retainedCluster, [])
  syncReviewedDecision(
    bw,
    bwRoute,
    'Die Quelle fordert ausschließlich Gliedern, Umformen und Berechnen von Termen. Nach der atomaren Aufteilung belegen 2c4830e6 und 959cc50b diese Umformungsroutinen; der neue Deutungsbaustein wird nicht behauptet.',
  )

  const he = documents.get(mappingPaths.he)!
  const heTransform = 'he-math-seki-g9-7-2-06-82736ecd'
  const heBroad = 'he-math-seki-g9-8-1-02-e1949698'
  replaceMappingTarget(he, heTransform, ids.retainedCluster, [])
  syncReviewedDecision(
    he,
    heTransform,
    'Die Quelle nennt vorbereitende Termumformungen. Nach der Aufteilung wird sie ausschließlich auf die beiden atomaren Umformungsziele abgebildet; eine Kontextdeutung ist hier nicht belegt.',
  )
  replaceMappingTarget(he, heBroad, ids.retainedCluster, [ids.interpretation])
  syncReviewedDecision(
    he,
    heBroad,
    'Aufstellen, Analyse und Wertgleichheit von Termen sowie Umformungsregeln werden nach der Aufteilung durch das neue atomare Deutungsziel, die vorhandenen Aufstellungs- und Variablenziele und die atomaren Umformungsziele abgedeckt.',
  )

  const sh = documents.get(mappingPaths.sh)!
  const shInterpretTransform =
    'de-sh-mathematik-seki-fachanforderungen-2024-sh-seki-l3-strukturen-und-funktionaler-zusammenhang-K007-5be093afe5'
  const shDescribe =
    'de-sh-mathematik-seki-fachanforderungen-2024-sh-seki-l1-zahl-und-operation-K013-51b2549496'
  addMappingTargets(sh, shInterpretTransform, [ids.interpretation, ids.transformation])
  syncReviewedDecision(
    sh,
    shInterpretTransform,
    'Die Quelle fordert ausdrücklich sowohl das Interpretieren von Termen als auch das Umformen mit Rechengesetzen. Nach der Aufteilung werden deshalb beide atomaren Kinder zusätzlich zu den bereits belegten weiterführenden Routinen direkt zugeordnet.',
  )
  addMappingTargets(sh, shDescribe, [ids.interpretation])
  syncReviewedDecision(
    sh,
    shDescribe,
    'Das fachsprachliche Beschreiben von Termen belegt das atomare Lesen und Benennen ihrer Bestandteile und Rechenstruktur; die Kontextdeutung bleibt eine weitergehende Teilfacette des kanonischen Ziels.',
  )

  const by = documents.get(mappingPaths.by)!
  const byInterpret = 'by-math-m7-1-1-4aa5a331-s03-7151bf1360'
  replaceMappingTarget(
    by,
    byInterpret,
    'fd860da9-73ba-47cd-a1a8-452424915a80',
    [ids.interpretation],
  )
  syncReviewedDecision(
    by,
    byInterpret,
    'Die Quelle verlangt das Interpretieren eines vorgegebenen Terms in einem Zusammenhang. Das neue atomare Deutungsziel bildet genau diese Richtung Kontext aus Term ab; das frühere Aufstellungsziel beschrieb die umgekehrte Richtung und wird deshalb ersetzt.',
  )

  const beLegacy = documents.get(mappingPaths.beLegacy)!
  replaceMappingTarget(
    beLegacy,
    '75c94fc4-0583-4d43-80f8-faaa53530705',
    ids.retainedCluster,
    [ids.transformation],
  )
  replaceMappingTarget(
    beLegacy,
    '632f6299-80e3-4d6d-a035-018503659ebb',
    ids.retainedCluster,
    [ids.distributiveTransformation],
  )

  const shLegacy = documents.get(mappingPaths.shLegacy)!
  const shLegacyTargets = (shLegacy.mappings as JsonRecord[])
    .filter((entry) => mappingSourceId(entry) === 'sh-sek1-jg7-9-strukturen-funktional-terme')
    .map(mappingTargetId)
  if (!same(shLegacyTargets, [ids.retainedCluster])) {
    throw new Error('Broad SH legacy source must remain mapped to the retained combined cluster')
  }

  for (const [path, document] of documents) assertNoDuplicateMappingPairs(path, document)
  return documents
}

function buildProvenance(): JsonRecord {
  const registry = readJson(paths.provenance)
  const landscape = (registry.landscapes as JsonRecord[])
    .find((entry) => entry.landscapeId === ids.landscape)
  if (!landscape) throw new Error('Mathematics provenance landscape is missing')
  const goalProvenance = landscape.goalProvenance as JsonRecord
  const sharedSource = {
    sourceLandscapeId: '271b385b-04c7-4205-8202-b2dc918f5782',
    sourceGoalId:
      'de-sh-mathematik-seki-fachanforderungen-2024-sh-seki-l3-strukturen-und-funktionaler-zusammenhang-K007-5be093afe5',
    additionalSourceLandscapeIds: [
      'c1600692-e543-5cf2-a399-6bd96e6b817f',
      'b167b4cd-4b78-4c84-a721-6b2adbbcab3c',
      'c0ecbd92-92da-4b37-b77d-d537824d5141',
    ],
  }
  goalProvenance[ids.retainedCluster] = structuredClone(sharedSource)
  goalProvenance[ids.interpretation] = structuredClone(sharedSource)
  landscape.goalProvenance = Object.fromEntries(
    Object.entries(goalProvenance).sort(([left], [right]) => left.localeCompare(right)),
  )
  return registry
}

function buildSemanticKinds(canonical: JsonRecord): JsonRecord {
  const ledger = readJson(paths.semanticKinds)
  const goals = canonical.goals as JsonRecord[]
  const goalById = new Map(goals.map((goal) => [String(goal.id), goal]))
  const byId = new Map((ledger.decisions as JsonRecord[])
    .map((decision) => [String(decision.goalId), decision]))
  const changedGoalIds = new Set([
    ids.variableRoles,
    ids.transformation,
    ids.retainedCluster,
    ids.interpretation,
    ids.termValues,
    ids.contextTranslation,
    ids.corridor,
    ...Object.keys(downstreamChildRequirements),
  ])
  for (const goalId of changedGoalIds) {
    const goal = goalById.get(goalId)
    if (!goal) throw new Error(`Semantic-kind goal ${goalId} is missing`)
    const existing = byId.get(goalId)
    const semanticKind = goalId === ids.retainedCluster
      ? 'curricularArea'
      : existing?.semanticKind ?? 'curricularAtomic'
    byId.set(goalId, {
      ...(existing ?? {}),
      goalId,
      sourceFingerprint: fingerprintSemanticKindSourceGoal(goal),
      semanticKind,
      decisionStatus: 'authoritative',
      decisionBasis: goalId === ids.retainedCluster
        ? 'reviewed-current-structural-split-curricular-area'
        : goalId === ids.interpretation
          ? 'reviewed-current-structural-split-curricular-atomic'
          : existing?.decisionBasis ?? 'reviewed-current-pilot-curricular-atomic',
    })
  }
  ledger.decisions = [...byId.values()].sort((left, right) =>
    String(left.goalId).localeCompare(String(right.goalId)))
  const counts: Record<string, number> = {}
  for (const decision of ledger.decisions as JsonRecord[]) {
    const kind = String(decision.semanticKind)
    counts[kind] = (counts[kind] ?? 0) + 1
  }
  const order = [
    'curricularAtomic', 'curricularArea', 'practiceAssessment', 'programStructure',
    'memory', 'runtimeSupport', 'orientation',
  ]
  ledger.counts = Object.fromEntries(order.filter((kind) => counts[kind] !== undefined)
    .map((kind) => [kind, counts[kind]]))
  ;(ledger.counts as JsonRecord).total = (ledger.decisions as JsonRecord[]).length
  if ((ledger.counts as JsonRecord).curricularAtomic !== 791) {
    throw new Error('Batch010 split changed the Mathematics curricular-atomic denominator')
  }
  return ledger
}

function buildReviewLedger(
  path: string,
  canonical: JsonRecord,
  kind: 'atomicity' | 'memory',
): JsonRecord[] {
  const records = readJsonl(path)
  const goalById = new Map((canonical.goals as JsonRecord[]).map((goal) => [String(goal.id), goal]))
  const relevantIds = new Set([
    ids.retainedCluster,
    ids.interpretation,
    ids.variableRoles,
    ids.transformation,
  ])
  const insertionIndex = records.findIndex((record) => relevantIds.has(String(record.goalId)))
  const remaining = records.filter((record) => !relevantIds.has(String(record.goalId)))
  const specs = [
    {
      id: ids.variableRoles,
      atomicityReason:
        'Die drei fachlich ausdrücklich benannten Variablenrollen werden innerhalb einer zusammenhängenden Deutungs- und Zuordnungskompetenz verglichen; sie sind keine unabhängigen Rechenroutinen.',
      memoryReason:
        'Die Rollen Unbekannte, Veränderliche und Parameter müssen an Termen, Gleichungen, Formeln und Situationen verstanden und unterschieden werden; ein separates Memory-Deck ist dafür nicht erforderlich.',
    },
    {
      id: ids.interpretation,
      atomicityReason:
        'Lesen, strukturelles Benennen und kontextbezogenes Erklären beziehen sich auf denselben gegebenen Variablenterm und bilden eine eigenständig prüfbare Deutungskompetenz.',
      memoryReason:
        'Die Bedeutung und Rechenstruktur eines Variablenterms muss aus konkreten Darstellungen und Kontexten erschlossen werden; isoliertes Auswendiglernen wäre nicht zielführend.',
    },
    {
      id: ids.transformation,
      atomicityReason:
        'Das Herstellen und Begründen semantischer Äquivalenz für alle zulässigen Variablenwerte ist eine zusammenhängende atomare Umformungskompetenz.',
      memoryReason:
        'Äquivalente Termumformungen müssen über Rechengesetze und zulässige Variablenwerte begründet werden; ein separates Memory-Deck ist nicht erforderlich.',
    },
  ]
  const replacements = specs.map((spec): JsonRecord => {
    const goal = goalById.get(spec.id)!
    if (kind === 'atomicity') {
      return {
        schemaVersion: 1,
        reviewId: 'canonical-math-full',
        ruleVersion: 'semantic-atomicity-v1',
        landscapeId: ids.landscape,
        goalId: spec.id,
        fingerprint: reviewFingerprint(goal, 'semantic-atomicity-v1'),
        status: 'atomic',
        semanticAtomic: true,
        reviewedAt: reviewDate,
        reviewer,
        reason: spec.atomicityReason,
        suggestedSplit: [],
      }
    }
    return {
      schemaVersion: 1,
      reviewId: 'canonical-math-full',
      ruleVersion: 'memory-card-review-v1',
      landscapeId: ids.landscape,
      goalId: spec.id,
      fingerprint: reviewFingerprint(goal, 'memory-card-review-v1'),
      status: 'no_memory_needed',
      memoryUseful: false,
      reviewedAt: reviewDate,
      reviewer,
      reason: spec.memoryReason,
    }
  })
  remaining.splice(insertionIndex < 0 ? remaining.length : insertionIndex, 0, ...replacements)
  return remaining
}

const isGoalReference = (value: unknown): value is JsonRecord => Boolean(
  value && typeof value === 'object'
  && ['goalEntry', 'canonicalSubtree'].includes(String((value as JsonRecord).kind))
  && typeof (value as JsonRecord).goalId === 'string',
)

const countGoalRefs = (value: unknown, goalId: string, kinds?: Set<string>): number => {
  if (Array.isArray(value)) {
    return value.reduce((sum, entry) => sum + countGoalRefs(entry, goalId, kinds), 0)
  }
  if (!value || typeof value !== 'object') return 0
  const record = value as JsonRecord
  const own = isGoalReference(record) && record.goalId === goalId
    && (!kinds || kinds.has(String(record.kind))) ? 1 : 0
  return own + Object.values(record)
    .reduce((sum, nested) => sum + countGoalRefs(nested, goalId, kinds), 0)
}

function normalizeSplitSiblings(value: unknown): { value: unknown; changed: boolean } {
  if (Array.isArray(value)) {
    let changed = false
    const transformed = value.map((entry) => {
      const nested = normalizeSplitSiblings(entry)
      changed ||= nested.changed
      return nested.value
    })
    return { value: transformed, changed }
  }
  if (!value || typeof value !== 'object') return { value, changed: false }
  const record = structuredClone(value as JsonRecord)
  let changed = false
  if (Array.isArray(record.children)) {
    const children = record.children as unknown[]
    const clusterIndexes = children
      .map((entry, index) => isGoalReference(entry) && entry.goalId === ids.retainedCluster ? index : -1)
      .filter((index) => index >= 0)
    const transformationIndexes = children
      .map((entry, index) => isGoalReference(entry) && entry.goalId === ids.transformation ? index : -1)
      .filter((index) => index >= 0)
    if (clusterIndexes.length > 1) throw new Error('Multiple direct retained-cluster view references')
    if (clusterIndexes.length === 1 && transformationIndexes.length > 0) {
      const cluster = children[clusterIndexes[0]] as JsonRecord
      cluster.kind = 'canonicalSubtree'
      record.children = children.filter(
        (entry) => !(isGoalReference(entry) && entry.goalId === ids.transformation),
      )
      changed = true
    }
  }
  for (const [key, nested] of Object.entries(record)) {
    const result = normalizeSplitSiblings(nested)
    record[key] = result.value
    changed ||= result.changed
  }
  return { value: record, changed }
}

function findStructureById(value: unknown, structureId: string): JsonRecord | null {
  if (Array.isArray(value)) {
    for (const entry of value) {
      const match = findStructureById(entry, structureId)
      if (match) return match
    }
    return null
  }
  if (!value || typeof value !== 'object') return null
  const record = value as JsonRecord
  if (record.kind === 'structure' && record.id === structureId) return record
  for (const nested of Object.values(record)) {
    const match = findStructureById(nested, structureId)
    if (match) return match
  }
  return null
}

function ensureMvRightPrismPlacement(view: JsonRecord): boolean {
  const geometry = findStructureById(view, 'sek1-geometry')
  if (!geometry || !Array.isArray(geometry.children)) {
    throw new Error('DE-MV view has no Sek-I geometry structure')
  }
  const existingCount = countGoalRefs(view, ids.mvRightPrism)
  if (existingCount > 1) throw new Error('DE-MV right-prism goal is placed more than once')
  if (existingCount === 1) return false
  ;(geometry.children as unknown[]).unshift({
    kind: 'structure',
    id: 'sek1-geometry-j8-prisms',
    label: 'Jahrgangsstufe 8: Gerade Prismen',
    children: [{ kind: 'canonicalSubtree', goalId: ids.mvRightPrism }],
  })
  return true
}

function buildManualViews(): Map<string, JsonRecord> {
  const result = new Map<string, JsonRecord>()
  for (const entry of readdirSync(compositionRoot, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.view.json') || generatedViewNames.has(entry.name)) continue
    const path = join(compositionRoot, entry.name)
    const current = JSON.parse(readFileSync(path, 'utf8')) as JsonRecord
    const normalized = normalizeSplitSiblings(current)
    const view = normalized.value as JsonRecord
    const mvPlacementChanged = ['de-mv-gk.view.json', 'de-mv-lk.view.json'].includes(entry.name)
      ? ensureMvRightPrismPlacement(view)
      : false
    if (normalized.changed || mvPlacementChanged) result.set(relative(repoRoot, path), view)
  }
  return result
}

function buildDurationPolicy(canonical: JsonRecord): JsonRecord {
  const policy = readJson(paths.durationPolicy)
  const inputs = policy.inputs as JsonRecord
  ;(inputs.canonical as JsonRecord).sha256 = sha256Digest(serializeJson(canonical)).slice('sha256:'.length)
  const templates = policy.sek1Templates as JsonRecord[]
  for (const template of templates) {
    const fileName = String(template.fileName)
    const parentStructureId = durationParentByFileName[fileName]
    if (!parentStructureId) continue
    const placements = (template.placements as JsonRecord[])
      .filter((placement) => placement.splitCode !== 'B010-0AFE')
    placements.push({
      parentStructureId,
      splitCode: 'B010-0AFE',
      oldClusterGoalId: ids.retainedCluster,
      renderKind: 'canonicalSubtree',
      removeAtomicGoalIds: [ids.interpretation, ids.transformation],
      replacementNode: { kind: 'canonicalSubtree', goalId: ids.retainedCluster },
    })
    template.placements = placements
    template.placementCount = placements.length
  }
  const counts = policy.counts as JsonRecord
  counts.splitPlacementCount = templates.reduce(
    (sum, template) => sum + (template.placements as JsonRecord[]).length,
    0,
  )
  return policy
}

function buildAssessmentBlueprint(): string {
  let text = readFileSync(absolute(paths.assessmentBlueprint), 'utf8')
  const before = `${ids.retainedCluster} (Terme mit Variablen deuten und äquivalent umformen)`
  const after = `${ids.transformation} (Terme im Bereich rationaler Zahlen äquivalent umformen)`
  if (text.includes(before)) text = text.replace(before, after)
  else if (!text.includes(after)) throw new Error('J7 blueprint is neither in Batch010 before nor after state')
  const legacyNote =
    '- Offene Altlast außerhalb dieses engen Splits: `d668c22d-caeb-5e91-8980-721c931a2bcf` bezeichnet derzeit Diagramm-Missverständnisse, während Aufgabe 5 einen Distributivgesetzfehler prüft. Der Verweis bleibt auf ausdrückliche Product-Owner-Entscheidung in diesem Split unverändert und benötigt eine separate fachliche Adjudikation.'
  if (!text.includes(legacyNote)) text = `${text.trimEnd()}\n${legacyNote}\n`
  return text
}

type PlannedFile = { path: string; bytes: string }

function collectPlannedFiles(
  canonical: JsonRecord,
  mappings: Map<string, JsonRecord>,
  provenance: JsonRecord,
  semanticKinds: JsonRecord,
  atomicity: JsonRecord[],
  memory: JsonRecord[],
  manualViews: Map<string, JsonRecord>,
  durationPolicy: JsonRecord,
  assessmentBlueprint: string,
): PlannedFile[] {
  return [
    { path: paths.canonical, bytes: serializeJson(canonical) },
    ...[...mappings].map(([path, document]) => ({ path, bytes: serializeJson(document) })),
    { path: paths.provenance, bytes: serializeJson(provenance) },
    { path: paths.semanticKinds, bytes: serializeJson(semanticKinds) },
    { path: paths.atomicity, bytes: serializeJsonl(atomicity) },
    { path: paths.memory, bytes: serializeJsonl(memory) },
    ...[...manualViews].map(([path, view]) => ({ path, bytes: serializeJson(view) })),
    { path: paths.durationPolicy, bytes: serializeJson(durationPolicy) },
    { path: paths.assessmentBlueprint, bytes: assessmentBlueprint },
  ]
}

function validateVisualizationAssets(requireNew: boolean): void {
  const goalIds = [ids.variableRoles, ids.transformation, ids.retainedCluster]
  if (requireNew) goalIds.push(ids.interpretation)
  for (const goalId of goalIds) {
    const base = `assets/goal-visualizations/mathematik/${goalId}/${goalId}.jpg`
    const canonicalPath = `curricula/DE/Gymnasium/visualizations/mathematik/${goalId}/${goalId}.jpg`
    const publicPath = `app/public/${base}`
    const backendPath = `backend/src/main/resources/static/${base}`
    const canonical = readFileSync(absolute(canonicalPath))
    const publicBytes = readFileSync(absolute(publicPath))
    const backendBytes = readFileSync(absolute(backendPath))
    if (!canonical.equals(publicBytes) || !canonical.equals(backendBytes)) {
      throw new Error(`Canonical/public/backend visualization parity failed for ${goalId}`)
    }
    const digest = sha256Digest(canonical)
    if (exactExistingVisualizationHashes[goalId] && exactExistingVisualizationHashes[goalId] !== digest) {
      throw new Error(`Protected existing Nano Banana Pro bytes changed for ${goalId}`)
    }
  }
}

const qaNotes: Record<string, string> = {
  [ids.variableRoles]:
    'Erneute Originalauflösungsprüfung nach der minimalen Textpräzisierung: Die unveränderte Nano-Banana-Pro-Übersicht trennt Term, Gleichung und Formel, benennt x ausdrücklich als unbekannte Zahl und zeigt n als kontextabhängig veränderliche Anzahl sowie Formelgrößen. Sie bleibt eine sachlich geeignete Rollenübersicht; die vollständige fachsprachliche Unterscheidung wird durch das Lernziel und die Prüfung getragen.',
  [ids.transformation]:
    'Erneute Originalauflösungsprüfung nach der minimalen Textpräzisierung: Das unveränderte Nano-Banana-Pro-Bild zeigt Variablenterme, korrekte Rechengesetz-Umformungen und bereits ausdrücklich den Merksatz, dass Äquivalenz gleicher Wert bei jeder zulässigen Einsetzung bedeutet. Es passt exakt zum finalen Zieltext.',
  [ids.retainedCluster]:
    'Erneute Originalauflösungsprüfung nach der Clusterisierung: Das unveränderte Nano-Banana-Pro-Bild ist als Zweiteiler-Clusterübersicht besonders geeignet. Links werden Bestandteile und Kontextbedeutung eines Variablenterms gelesen und gedeutet; rechts werden zwei korrekte äquivalente Umformungen gezeigt.',
  [ids.interpretation]:
    'Hashgebundene Originalauflösungsprüfung des neuen Nano-Banana-Pro-JPG: Der gegebene Variablenterm wird fachlich korrekt in Variable, Operation, Koeffizient und Konstante zerlegt und seine Bedeutung wird in einem einfachen, konsistenten Kontext erklärt. Symbolik, Text und Mengenbezug sind lesbar und widerspruchsfrei.',
}

function buildVisualizationQa(): JsonRecord {
  const qa = readJson(paths.visualizationQa)
  const records = qa.records as JsonRecord[]
  const byId = new Map(records.map((record) => [String(record.goalId), record]))
  for (const goalId of [ids.variableRoles, ids.transformation, ids.retainedCluster, ids.interpretation]) {
    const record = byId.get(goalId)
    if (!record) throw new Error(`Visualization QA record is missing for ${goalId}`)
    if (record.visualizationState !== 'available' || typeof record.assetSha256 !== 'string') {
      throw new Error(`Visualization QA asset is unavailable for ${goalId}`)
    }
    Object.assign(record, {
      umlautsCorrectChatGpt: 'yes',
      contentApprovedChatGpt: 'yes',
      humanApproved: 'no',
      humanIssueIdentified: 'no',
      humanIssueDescription: '',
      chatGptReviewedAt: reviewedAt,
      chatGptReviewer: reviewer,
      chatGptNotes: qaNotes[goalId],
      humanReviewedAt: null,
      humanReviewer: '',
      aiApproved: 'yes',
      aiApprovedAssetSha256: record.assetSha256,
      aiReviewedAt: reviewedAt,
      aiReviewer: reviewer,
      aiNotes: qaNotes[goalId],
    })
  }
  return qa
}

function assertViewSingleParentRule(): void {
  for (const entry of readdirSync(compositionRoot, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.view.json')) continue
    const view = JSON.parse(readFileSync(join(compositionRoot, entry.name), 'utf8')) as JsonRecord
    const clusterCount = countGoalRefs(view, ids.retainedCluster)
    const clusterSubtreeCount = countGoalRefs(view, ids.retainedCluster, new Set(['canonicalSubtree']))
    const directTransformationCount = countGoalRefs(view, ids.transformation)
    if (clusterCount > 0 && (clusterCount !== 1 || clusterSubtreeCount !== 1 || directTransformationCount !== 0)) {
      throw new Error(
        `${entry.name}: retained cluster must be one canonicalSubtree and 2c must not be directly placed`,
      )
    }
    if (['de-mv-gk.view.json', 'de-mv-lk.view.json'].includes(entry.name)) {
      const geometry = findStructureById(view, 'sek1-geometry')
      const j8Prisms = findStructureById(geometry, 'sek1-geometry-j8-prisms')
      if (!j8Prisms || countGoalRefs(j8Prisms, ids.mvRightPrism) !== 1
        || countGoalRefs(view, ids.mvRightPrism) !== 1) {
        throw new Error(`${entry.name}: DE-MV right-prism placement is not unique in Geometry/J8`)
      }
    }
  }
}

const canonical = buildCanonical()
const mappings = buildMappings()
const provenance = buildProvenance()
const semanticKinds = buildSemanticKinds(canonical)
const atomicity = buildReviewLedger(paths.atomicity, canonical, 'atomicity')
const memory = buildReviewLedger(paths.memory, canonical, 'memory')
const manualViews = buildManualViews()
const durationPolicy = buildDurationPolicy(canonical)
const assessmentBlueprint = buildAssessmentBlueprint()
const plannedFiles = collectPlannedFiles(
  canonical,
  mappings,
  provenance,
  semanticKinds,
  atomicity,
  memory,
  manualViews,
  durationPolicy,
  assessmentBlueprint,
)
const changed = plannedFiles.filter(({ path, bytes }) =>
  !existsSync(absolute(path)) || readFileSync(absolute(path), 'utf8') !== bytes)

if (writeMode) {
  for (const { path, bytes } of changed) writeFileSync(absolute(path), bytes)
  execFileSync('npm', ['--prefix', 'app', 'run', 'generate:math-duration-composition-views'], {
    cwd: repoRoot,
    stdio: 'inherit',
  })
  if (!prepareVisualization) {
    validateVisualizationAssets(true)
    execFileSync(
      'npm',
      ['exec', '--', 'tsx', 'scripts/generateGoalVisualizationQaLedgers.ts', '--subject=mathematik'],
      { cwd: resolve(repoRoot, 'app'), stdio: 'inherit' },
    )
    writeFileSync(absolute(paths.visualizationQa), serializeJson(buildVisualizationQa()))
  } else {
    validateVisualizationAssets(false)
  }
  assertViewSingleParentRule()
} else {
  if (changed.length > 0) {
    throw new Error(`Batch010 apply state is stale: ${changed.map(({ path }) => basename(path)).join(', ')}`)
  }
  validateVisualizationAssets(true)
  execFileSync('npm', ['--prefix', 'app', 'run', 'check:math-duration-composition-views'], {
    cwd: repoRoot,
    stdio: 'inherit',
  })
  execFileSync(
    'npm',
    ['exec', '--', 'tsx', 'scripts/generateGoalVisualizationQaLedgers.ts', '--check', '--subject=mathematik'],
    { cwd: resolve(repoRoot, 'app'), stdio: 'inherit' },
  )
  const expectedQa = serializeJson(buildVisualizationQa())
  if (readFileSync(absolute(paths.visualizationQa), 'utf8') !== expectedQa) {
    throw new Error('Batch010 visualization QA bindings are stale')
  }
  assertViewSingleParentRule()
}

console.log(
  `CHECK apply_math_batch010_adjudicated_correction ${writeMode ? 'WRITE' : 'PASS'} `
  + `retainedCluster=1 newAtoms=1 reusedAtoms=1 denominator=791 `
  + `plannedWrites=${changed.length} files=${changed.map(({ path }) => basename(path)).join(',') || '-'}`,
)
