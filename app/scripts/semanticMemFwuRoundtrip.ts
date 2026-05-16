import { execFileSync } from 'node:child_process'
import { createReadStream, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path'
import { createInterface } from 'node:readline'
import { fileURLToPath } from 'node:url'

type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [key: string]: JsonValue }

type CliOptions = {
  rdfPath: string
  zipPath: string
  outDir: string
  help: boolean
}

type TripleObject =
  | { kind: 'iri'; value: string }
  | { kind: 'literal'; value: string; datatype?: string; lang?: string }

type ParsedTriple = {
  subject: string
  predicate: string
  object: TripleObject
}

type RdfModel = {
  types: Map<string, Set<string>>
  literals: Map<string, Map<string, string[]>>
  iris: Map<string, Map<string, string[]>>
}

type ReconstructedLandscape = {
  id?: string
  frameworkId?: string
  description?: string
  descriptionEn?: string
  filters?: JsonValue
  competencyCatalog: JsonValue[]
  programUnits: JsonValue[]
  goalPlacements: JsonValue[]
  goals: JsonValue[]
}

type SemanticReconstruction = {
  landscape: ReconstructedLandscape
  sourceGoalReferences: JsonValue
  cardDecks: JsonValue[]
  canonicalMappings: Record<string, JsonValue[]>
  reviewDecisions: Record<string, JsonValue[]>
  compositionViews: Record<string, JsonValue>
}

type CheckResult = {
  id: string
  passed: boolean
  details: string
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '../..')

const DEFAULT_BASE = 'tmp/roundtrip/mem-fwu/skillpilot-de-gymnasium-mathematik-v0.1.0'
const DEFAULT_RDF = `${DEFAULT_BASE}/rdf/skillpilot-mem-fwu.nt`
const DEFAULT_ZIP = 'tmp/exports/skillpilot-de-gymnasium-mathematik-v0.1.0.zip'
const DEFAULT_OUT_DIR = `${DEFAULT_BASE}/semantic-reconstructed`
const ZIP_COMMAND_MAX_BUFFER_BYTES = 512 * 1024 * 1024

const RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
const RDFS = 'http://www.w3.org/2000/01/rdf-schema#'
const DCTERMS = 'http://purl.org/dc/terms/'
const SP = 'https://skillpilot.de/ns/roundtrip#'

const P = {
  type: `${RDF}type`,
  label: `${RDFS}label`,
  description: `${DCTERMS}description`,
  source: `${DCTERMS}source`,
  title: `${DCTERMS}title`,
  skillpilotId: `${SP}skillpilotId`,
  order: `${SP}order`,
  archiveRoot: `${SP}archiveRoot`,
  frameworkId: `${SP}frameworkId`,
  filtersJson: `${SP}filtersJson`,
  shortKey: `${SP}shortKey`,
  phase: `${SP}phase`,
  area: `${SP}area`,
  level: `${SP}level`,
  courseLevel: `${SP}courseLevel`,
  core: `${SP}core`,
  weight: `${SP}weight`,
  tag: `${SP}tag`,
  example: `${SP}example`,
  competencyRef: `${SP}competencyRef`,
  dimension: `${SP}dimension`,
  kind: `${SP}kind`,
  relation: `${SP}relation`,
  contextJson: `${SP}contextJson`,
  metadataJson: `${SP}metadataJson`,
  applicabilityJson: `${SP}applicabilityJson`,
  containsGoal: `${SP}containsGoal`,
  didacticRequires: `${SP}didacticRequires`,
  placedGoal: `${SP}placedGoal`,
  placedInProgramUnit: `${SP}placedInProgramUnit`,
  zipPath: `${SP}zipPath`,
  viewId: `${SP}viewId`,
  landscapeId: `${SP}landscapeId`,
  hasCompositionChild: `${SP}hasCompositionChild`,
  viewNodeKind: `${SP}viewNodeKind`,
  structureId: `${SP}structureId`,
  displayLabel: `${SP}displayLabel`,
  compositionGoal: `${SP}compositionGoal`,
  hasSourceDocument: `${SP}hasSourceDocument`,
  hasSourceGoal: `${SP}hasSourceGoal`,
  sourceDocumentKey: `${SP}sourceDocumentKey`,
  landingUrl: `${SP}landingUrl`,
  role: `${SP}role`,
  official: `${SP}official`,
  sourceText: `${SP}sourceText`,
  sourceSpan: `${SP}sourceSpan`,
  sourceRef: `${SP}sourceRef`,
  sourceTextSha256: `${SP}sourceTextSha256`,
  sourceDocumentUrl: `${SP}sourceDocumentUrl`,
  sourceDocumentTitle: `${SP}sourceDocumentTitle`,
  topicCode: `${SP}topicCode`,
  passageId: `${SP}passageId`,
  granularity: `${SP}granularity`,
  sourcePage: `${SP}sourcePage`,
  category: `${SP}category`,
  language: `${SP}language`,
  front: `${SP}front`,
  back: `${SP}back`,
  hasCard: `${SP}hasCard`,
  legacyGoalId: `${SP}legacyGoalId`,
  matchType: `${SP}matchType`,
  jurisdiction: `${SP}jurisdiction`,
  decision: `${SP}decision`,
  reviewedAt: `${SP}reviewedAt`,
  reviewer: `${SP}reviewer`,
  mapsCanonicalGoal: `${SP}mapsCanonicalGoal`,
  mapsSourceGoal: `${SP}mapsSourceGoal`,
}

const T = {
  learningLandscape: `${SP}LearningLandscape`,
  learningGoal: `${SP}LearningGoal`,
  competencyCatalogEntry: `${SP}CompetencyCatalogEntry`,
  programUnit: `${SP}ProgramUnit`,
  goalPlacement: `${SP}GoalPlacement`,
  compositionView: `${SP}CompositionView`,
  compositionNode: `${SP}CompositionNode`,
  sourceCollection: `${SP}SourceCollection`,
  sourceDocument: `${SP}SourceDocument`,
  sourceGoalReference: `${SP}SourceGoalReference`,
  cardDeck: `${SP}CardDeck`,
  card: `${SP}Card`,
  mappingRecord: `${SP}MappingRecord`,
  reviewDecision: `${SP}ReviewDecision`,
}

const usage = () => `Usage:
  npm run roundtrip:mem-fwu:semantic-reconstruct -- [--rdf ${DEFAULT_RDF}]

Options:
  --rdf <path>      RDF N-Triples path. Default: ${DEFAULT_RDF}
  --zip <path>      Original ZIP used only for validation comparison. Default: ${DEFAULT_ZIP}
  --out-dir <path>  Output directory. Default: ${DEFAULT_OUT_DIR}
  --help
`

const isInsideRepo = (absolutePath: string) => {
  const relativePath = relative(repoRoot, absolutePath)
  return relativePath === '' || (!relativePath.startsWith('..') && !isAbsolute(relativePath))
}

const resolveInsideRepo = (inputPath: string) => {
  const candidates = [resolve(repoRoot, inputPath), resolve(process.cwd(), inputPath)]
  const absolutePath = candidates.find(isInsideRepo)
  if (!absolutePath) {
    throw new Error(`Path must be inside the repository: ${inputPath}`)
  }
  return absolutePath
}

const toPosixPath = (path: string) => path.split(sep).join('/')

const repoRelative = (absolutePath: string) => {
  const relativePath = toPosixPath(relative(repoRoot, absolutePath))
  if (relativePath === '' || relativePath.startsWith('..')) {
    throw new Error(`Path is outside the repository: ${absolutePath}`)
  }
  return relativePath
}

const parseArgs = (argv: string[]): CliOptions => {
  const options: CliOptions = {
    rdfPath: resolveInsideRepo(DEFAULT_RDF),
    zipPath: resolveInsideRepo(DEFAULT_ZIP),
    outDir: resolveInsideRepo(DEFAULT_OUT_DIR),
    help: false,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    const nextValue = argv[index + 1]
    const readValue = (name: string) => {
      if (!nextValue || nextValue.startsWith('--')) {
        throw new Error(`Missing value for ${name}`)
      }
      index += 1
      return nextValue
    }

    if (arg === '--help' || arg === '-h') {
      options.help = true
      continue
    }
    if (arg === '--rdf') {
      options.rdfPath = resolveInsideRepo(readValue(arg))
      continue
    }
    if (arg === '--zip') {
      options.zipPath = resolveInsideRepo(readValue(arg))
      continue
    }
    if (arg === '--out-dir') {
      options.outDir = resolveInsideRepo(readValue(arg))
      continue
    }
    throw new Error(`Unknown argument: ${arg}`)
  }

  return options
}

const unescapeLiteral = (value: string) => {
  let result = ''
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index]
    if (char !== '\\') {
      result += char
      continue
    }
    const next = value[index + 1]
    index += 1
    if (next === 'n') result += '\n'
    else if (next === 'r') result += '\r'
    else if (next === 't') result += '\t'
    else if (next === 'u') {
      const hex = value.slice(index + 1, index + 5)
      result += String.fromCharCode(Number.parseInt(hex, 16))
      index += 4
    } else if (next === 'U') {
      const hex = value.slice(index + 1, index + 9)
      result += String.fromCodePoint(Number.parseInt(hex, 16))
      index += 8
    } else if (next === '"' || next === '\\') result += next
    else result += next ?? ''
  }
  return result
}

const parseObject = (input: string): TripleObject => {
  if (input.startsWith('<')) {
    const end = input.indexOf('>')
    if (end < 0) {
      throw new Error(`Invalid IRI object: ${input}`)
    }
    return { kind: 'iri', value: input.slice(1, end) }
  }
  if (!input.startsWith('"')) {
    throw new Error(`Invalid literal object: ${input}`)
  }
  let escaped = false
  let end = -1
  for (let index = 1; index < input.length; index += 1) {
    const char = input[index]
    if (escaped) {
      escaped = false
      continue
    }
    if (char === '\\') {
      escaped = true
      continue
    }
    if (char === '"') {
      end = index
      break
    }
  }
  if (end < 0) {
    throw new Error(`Unterminated literal object: ${input}`)
  }
  const suffix = input.slice(end + 1)
  const datatypeMatch = suffix.match(/^\^\^<([^>]+)>/u)
  const langMatch = suffix.match(/^@([a-zA-Z-]+)/u)
  return {
    kind: 'literal',
    value: unescapeLiteral(input.slice(1, end)),
    datatype: datatypeMatch?.[1],
    lang: langMatch?.[1],
  }
}

const parseTriple = (line: string): ParsedTriple | null => {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) {
    return null
  }
  const match = trimmed.match(/^<([^>]*)> <([^>]*)> (.*) \.$/u)
  if (!match) {
    throw new Error(`Invalid N-Triples line: ${trimmed.slice(0, 200)}`)
  }
  return {
    subject: match[1],
    predicate: match[2],
    object: parseObject(match[3]),
  }
}

const emptyModel = (): RdfModel => ({
  types: new Map(),
  literals: new Map(),
  iris: new Map(),
})

const addMapValue = <TValue>(map: Map<string, Map<string, TValue[]>>, subject: string, predicate: string, value: TValue) => {
  const predicateMap = map.get(subject) ?? new Map<string, TValue[]>()
  const values = predicateMap.get(predicate) ?? []
  values.push(value)
  predicateMap.set(predicate, values)
  map.set(subject, predicateMap)
}

const addType = (model: RdfModel, subject: string, type: string) => {
  const values = model.types.get(subject) ?? new Set<string>()
  values.add(type)
  model.types.set(subject, values)
}

const isCarrierPredicate = (predicate: string) => (
  predicate === `${SP}lineText`
  || predicate === `${SP}textLine`
  || predicate === `${SP}hasFile`
  || predicate === `${SP}byteLength`
  || predicate === `${SP}lineCount`
  || predicate === `${SP}endsWithNewline`
  || predicate === `${SP}sha256`
)

const readRdfModel = async (rdfPath: string) => {
  const model = emptyModel()
  const reader = createInterface({
    input: createReadStream(rdfPath, { encoding: 'utf8' }),
    crlfDelay: Infinity,
  })

  for await (const line of reader) {
    if (line.includes(`${SP}lineText`) || line.includes(`${SP}textLine`)) {
      continue
    }
    const triple = parseTriple(line)
    if (!triple || isCarrierPredicate(triple.predicate)) {
      continue
    }
    if (triple.predicate === P.type && triple.object.kind === 'iri') {
      addType(model, triple.subject, triple.object.value)
      continue
    }
    if (triple.object.kind === 'iri') {
      addMapValue(model.iris, triple.subject, triple.predicate, triple.object.value)
    } else {
      addMapValue(model.literals, triple.subject, triple.predicate, triple.object.value)
    }
  }
  return model
}

const resourcesOfType = (model: RdfModel, type: string) => [...model.types.entries()]
  .filter(([, values]) => values.has(type))
  .map(([resource]) => resource)

const lit = (model: RdfModel, subject: string, predicate: string) => model.literals.get(subject)?.get(predicate)?.[0]

const lits = (model: RdfModel, subject: string, predicate: string) => model.literals.get(subject)?.get(predicate) ?? []

const iris = (model: RdfModel, subject: string, predicate: string) => model.iris.get(subject)?.get(predicate) ?? []

const num = (value: string | undefined) => {
  if (value === undefined) {
    return undefined
  }
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

const bool = (value: string | undefined) => {
  if (value === 'true') return true
  if (value === 'false') return false
  return undefined
}

const json = (value: string | undefined) => {
  if (value === undefined) {
    return undefined
  }
  return JSON.parse(value) as JsonValue
}

const idFromResource = (resource: string) => decodeURIComponent(resource.split('/').pop() ?? resource)

const skillpilotId = (model: RdfModel, resource: string) => lit(model, resource, P.skillpilotId) ?? idFromResource(resource)

const orderedResources = (model: RdfModel, resources: string[]) => [...resources].sort((left, right) => {
  const leftOrder = num(lit(model, left, P.order))
  const rightOrder = num(lit(model, right, P.order))
  if (leftOrder !== undefined && rightOrder !== undefined && leftOrder !== rightOrder) {
    return leftOrder - rightOrder
  }
  return skillpilotId(model, left).localeCompare(skillpilotId(model, right))
})

const graphTargets = (model: RdfModel, source: string, predicate: string) => (
  [...new Set(iris(model, source, predicate).map((target) => skillpilotId(model, target)))]
    .sort((left, right) => left.localeCompare(right))
)

const withString = (data: Record<string, JsonValue>, key: string, value: string | undefined) => {
  if (value !== undefined) data[key] = value
}

const withNumber = (data: Record<string, JsonValue>, key: string, value: number | undefined) => {
  if (value !== undefined) data[key] = value
}

const withBoolean = (data: Record<string, JsonValue>, key: string, value: boolean | undefined) => {
  if (value !== undefined) data[key] = value
}

const withJson = (data: Record<string, JsonValue>, key: string, value: JsonValue | undefined) => {
  if (value !== undefined) data[key] = value
}

const reconstructLandscape = (model: RdfModel): ReconstructedLandscape => {
  const landscapeResource = resourcesOfType(model, T.learningLandscape)[0]
  if (!landscapeResource) {
    throw new Error('No sp:LearningLandscape resource found.')
  }

  const reconstructed: ReconstructedLandscape = {
    competencyCatalog: [],
    programUnits: [],
    goalPlacements: [],
    goals: [],
  }
  withString(reconstructed as Record<string, JsonValue>, 'id', lit(model, landscapeResource, P.skillpilotId))
  withString(reconstructed as Record<string, JsonValue>, 'frameworkId', lit(model, landscapeResource, P.frameworkId))
  withString(reconstructed as Record<string, JsonValue>, 'description', lits(model, landscapeResource, P.description)[0])
  withString(reconstructed as Record<string, JsonValue>, 'descriptionEn', lits(model, landscapeResource, P.description)[1])
  withJson(reconstructed as Record<string, JsonValue>, 'filters', json(lit(model, landscapeResource, P.filtersJson)))

  reconstructed.competencyCatalog = orderedResources(model, resourcesOfType(model, T.competencyCatalogEntry)).map((resource) => {
    const entry: Record<string, JsonValue> = {}
    withString(entry, 'id', lit(model, resource, P.skillpilotId))
    withString(entry, 'label', lit(model, resource, P.label))
    withString(entry, 'dimension', lit(model, resource, P.dimension))
    return entry
  })

  reconstructed.programUnits = orderedResources(model, resourcesOfType(model, T.programUnit)).map((resource) => {
    const unit: Record<string, JsonValue> = {}
    withString(unit, 'id', lit(model, resource, P.skillpilotId))
    withString(unit, 'label', lit(model, resource, P.label))
    withString(unit, 'kind', lit(model, resource, P.kind))
    withJson(unit, 'context', json(lit(model, resource, P.contextJson)))
    return unit
  })

  reconstructed.goalPlacements = orderedResources(model, resourcesOfType(model, T.goalPlacement)).map((resource) => {
    const placement: Record<string, JsonValue> = {}
    const goal = iris(model, resource, P.placedGoal)[0]
    const unit = iris(model, resource, P.placedInProgramUnit)[0]
    withString(placement, 'goalId', goal ? skillpilotId(model, goal) : undefined)
    withString(placement, 'unitId', unit ? skillpilotId(model, unit) : undefined)
    withString(placement, 'relation', lit(model, resource, P.relation))
    withJson(placement, 'context', json(lit(model, resource, P.contextJson)))
    return placement
  })

  reconstructed.goals = orderedResources(model, resourcesOfType(model, T.learningGoal)).map((resource) => {
    const goal: Record<string, JsonValue> = {}
    withString(goal, 'id', lit(model, resource, P.skillpilotId))
    withString(goal, 'shortKey', lit(model, resource, P.shortKey))
    withString(goal, 'title', lit(model, resource, P.label))
    withString(goal, 'description', lit(model, resource, P.description))
    withString(goal, 'phase', lit(model, resource, P.phase))
    withString(goal, 'area', lit(model, resource, P.area))
    withString(goal, 'level', lit(model, resource, P.level))
    withString(goal, 'courseLevel', lit(model, resource, P.courseLevel))
    withBoolean(goal, 'core', bool(lit(model, resource, P.core)))
    withNumber(goal, 'weight', num(lit(model, resource, P.weight)))
    withJson(goal, 'metadata', json(lit(model, resource, P.metadataJson)))
    withJson(goal, 'applicability', json(lit(model, resource, P.applicabilityJson)))
    goal.tags = lits(model, resource, P.tag)
    goal.examples = lits(model, resource, P.example)
    goal.kompetenzen = iris(model, resource, P.competencyRef).map((competency) => skillpilotId(model, competency))
    goal.contains = graphTargets(model, resource, P.containsGoal)
    goal.requires = graphTargets(model, resource, P.didacticRequires)
    return goal
  })

  return reconstructed
}

const reconstructSourceGoalReferences = (model: RdfModel) => ({
  note: 'Semantically reconstructed from RDF without using sp:textLine carrier triples.',
  schemaVersion: 1,
  sourceGoalReferenceCount: resourcesOfType(model, T.sourceGoalReference).length,
  sources: orderedResources(model, resourcesOfType(model, T.sourceCollection)).map((collection) => ({
    extractionId: lit(model, collection, P.skillpilotId),
    jurisdiction: lit(model, collection, P.jurisdiction),
    sourceDocuments: orderedResources(model, iris(model, collection, P.hasSourceDocument)).map((document) => ({
      key: lit(model, document, P.sourceDocumentKey),
      title: lit(model, document, P.title),
      url: lit(model, document, P.source),
      landingUrl: lit(model, document, P.landingUrl) ?? null,
      role: lit(model, document, P.role),
      official: bool(lit(model, document, P.official)),
    })),
    sourceGoals: orderedResources(model, iris(model, collection, P.hasSourceGoal)).map((goal) => ({
      sourceGoalId: lit(model, goal, P.skillpilotId),
      title: lit(model, goal, P.label),
      description: lit(model, goal, P.description),
      sourceText: lit(model, goal, P.sourceText),
      sourceSpan: lit(model, goal, P.sourceSpan),
      sourceRef: lit(model, goal, P.sourceRef),
      sourceTextSha256: lit(model, goal, P.sourceTextSha256),
      sourceDocumentUrl: lit(model, goal, P.sourceDocumentUrl),
      sourceDocumentTitle: lit(model, goal, P.sourceDocumentTitle),
      topicCode: lit(model, goal, P.topicCode),
      passageId: lit(model, goal, P.passageId),
      granularity: lit(model, goal, P.granularity),
      sourcePage: num(lit(model, goal, P.sourcePage)),
      phase: lit(model, goal, P.phase) ?? null,
      courseLevel: lit(model, goal, P.courseLevel) ?? null,
      category: lit(model, goal, P.category) ?? null,
    })),
  })),
})

const reconstructCardDecks = (model: RdfModel) => orderedResources(model, resourcesOfType(model, T.cardDeck)).map((deck) => ({
  zipPath: lit(model, deck, P.zipPath),
  deckId: lit(model, deck, P.skillpilotId),
  title: lit(model, deck, P.label),
  language: lit(model, deck, P.language),
  landscapeId: lit(model, deck, P.landscapeId),
  cards: orderedResources(model, iris(model, deck, P.hasCard)).map((card) => ({
    id: lit(model, card, P.skillpilotId),
    front: lit(model, card, P.front),
    back: lit(model, card, P.back),
    category: lit(model, card, P.category),
    tags: lits(model, card, P.tag),
  })),
}))

const reconstructMappings = (model: RdfModel) => {
  const canonicalMappings: Record<string, JsonValue[]> = {}
  orderedResources(model, resourcesOfType(model, T.mappingRecord)).forEach((resource) => {
    const zipPath = lit(model, resource, P.zipPath) ?? 'unknown'
    const canonicalGoal = iris(model, resource, P.mapsCanonicalGoal)[0]
    const mapping: Record<string, JsonValue> = {}
    withString(mapping, 'canonicalGoalId', canonicalGoal ? skillpilotId(model, canonicalGoal) : undefined)
    withString(mapping, 'legacyGoalId', lit(model, resource, P.legacyGoalId))
    withString(mapping, 'matchType', lit(model, resource, P.matchType))
    canonicalMappings[zipPath] = [...(canonicalMappings[zipPath] ?? []), mapping]
  })

  const reviewDecisions: Record<string, JsonValue[]> = {}
  orderedResources(model, resourcesOfType(model, T.reviewDecision)).forEach((resource) => {
    const zipPath = lit(model, resource, P.zipPath) ?? 'unknown'
    const sourceGoal = iris(model, resource, P.mapsSourceGoal)[0]
    const decision: Record<string, JsonValue> = {}
    withString(decision, 'sourceGoalId', sourceGoal ? skillpilotId(model, sourceGoal) : undefined)
    decision.canonicalGoalIds = iris(model, resource, P.mapsCanonicalGoal).map((goal) => skillpilotId(model, goal))
    withString(decision, 'decision', lit(model, resource, P.decision))
    withString(decision, 'topicCode', lit(model, resource, P.topicCode))
    withString(decision, 'reviewedAt', lit(model, resource, P.reviewedAt))
    withString(decision, 'reviewer', lit(model, resource, P.reviewer))
    reviewDecisions[zipPath] = [...(reviewDecisions[zipPath] ?? []), decision]
  })

  return { canonicalMappings, reviewDecisions }
}

const rebuildViewNode = (model: RdfModel, resource: string): JsonValue => {
  const node: Record<string, JsonValue> = {}
  withString(node, 'kind', lit(model, resource, P.viewNodeKind))
  withString(node, 'id', lit(model, resource, P.structureId))
  withString(node, 'label', lit(model, resource, P.label))
  withString(node, 'displayLabel', lit(model, resource, P.displayLabel))
  const goal = iris(model, resource, P.compositionGoal)[0]
  withString(node, 'goalId', goal ? skillpilotId(model, goal) : undefined)
  const children = orderedResources(model, iris(model, resource, P.hasCompositionChild)).map((child) => rebuildViewNode(model, child))
  if (children.length > 0) {
    node.children = children
  }
  return node
}

const reconstructViews = (model: RdfModel) => {
  const views: Record<string, JsonValue> = {}
  orderedResources(model, resourcesOfType(model, T.compositionView)).forEach((resource) => {
    const zipPath = lit(model, resource, P.zipPath) ?? resource
    views[zipPath] = {
      id: lit(model, resource, P.viewId),
      label: lit(model, resource, P.label),
      landscapeId: lit(model, resource, P.landscapeId),
      rootNodes: orderedResources(model, iris(model, resource, P.hasCompositionChild)).map((node) => rebuildViewNode(model, node)),
    }
  })
  return views
}

const reconstructSemantic = (model: RdfModel): SemanticReconstruction => {
  const mappings = reconstructMappings(model)
  return {
    landscape: reconstructLandscape(model),
    sourceGoalReferences: reconstructSourceGoalReferences(model) as JsonValue,
    cardDecks: reconstructCardDecks(model) as JsonValue[],
    canonicalMappings: mappings.canonicalMappings,
    reviewDecisions: mappings.reviewDecisions,
    compositionViews: reconstructViews(model),
  }
}

const listZipEntries = (zipPath: string) => execFileSync('zipinfo', ['-1', zipPath], {
  encoding: 'utf8',
  maxBuffer: ZIP_COMMAND_MAX_BUFFER_BYTES,
  stdio: ['ignore', 'pipe', 'pipe'],
})
  .split(/\r?\n/u)
  .filter(Boolean)

const readZipEntry = (zipPath: string, entryPath: string) => execFileSync('unzip', ['-p', zipPath, entryPath], {
  encoding: 'utf8',
  maxBuffer: ZIP_COMMAND_MAX_BUFFER_BYTES,
  stdio: ['ignore', 'pipe', 'pipe'],
})

const readZipJson = (zipPath: string, entryPath: string) => JSON.parse(readZipEntry(zipPath, entryPath)) as JsonValue

const archiveRootFrom = (entries: string[]) => {
  const roots = new Set(entries.map((entry) => entry.split('/')[0]).filter(Boolean))
  return roots.size === 1 ? [...roots][0] : null
}

const jsonObject = (value: JsonValue, context: string): Record<string, JsonValue> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Expected JSON object: ${context}`)
  }
  return value
}

const stringArray = (value: JsonValue | undefined) => Array.isArray(value)
  ? value.filter((item): item is string => typeof item === 'string')
  : []

const packageEntryPath = (archiveRoot: string, relativePath: string) => `${archiveRoot}/${relativePath}`

const canonicalLandscapeEntry = (entries: string[], archiveRoot: string) => {
  const candidates = entries.filter((entry) => entry.startsWith(`${archiveRoot}/data/canonical/`) && entry.endsWith('.landscape.json'))
  if (candidates.length !== 1) {
    throw new Error(`Expected exactly one canonical landscape entry, found ${candidates.length}.`)
  }
  return candidates[0]
}

const flattenSourceGoals = (value: JsonValue) => {
  const data = jsonObject(value, 'source-goal references')
  const sources = Array.isArray(data.sources) ? data.sources : []
  return sources.flatMap((source) => {
    const sourceData = jsonObject(source, 'source-goal reference source')
    const goals = Array.isArray(sourceData.sourceGoals) ? sourceData.sourceGoals : []
    return goals.map((goal) => jsonObject(goal, 'source-goal reference'))
  })
}

const collectViewGoalRefs = (value: JsonValue): string[] => {
  if (Array.isArray(value)) {
    return value.flatMap(collectViewGoalRefs)
  }
  if (!value || typeof value !== 'object') {
    return []
  }
  const data = value as Record<string, JsonValue>
  return [
    ...(typeof data.goalId === 'string' ? [data.goalId] : []),
    ...Object.values(data).flatMap(collectViewGoalRefs),
  ]
}

const normalize = (value: JsonValue) => JSON.stringify(value)

const normalizeStringSet = (value: JsonValue | undefined) => JSON.stringify(stringArray(value).sort((left, right) => left.localeCompare(right)))

const asMap = <TValue>(items: TValue[], key: (item: TValue) => string) => new Map(items.map((item) => [key(item), item]))

const check = (checks: CheckResult[], id: string, passed: boolean, details: string) => {
  checks.push({ id, passed, details })
}

const validateSemanticReconstruction = (params: {
  zipPath: string
  reconstruction: SemanticReconstruction
}) => {
  const checks: CheckResult[] = []
  const entries = listZipEntries(params.zipPath)
  const archiveRoot = archiveRootFrom(entries)
  if (!archiveRoot) {
    throw new Error('ZIP does not contain exactly one archive root.')
  }

  const canonicalOriginal = jsonObject(readZipJson(params.zipPath, canonicalLandscapeEntry(entries, archiveRoot)), 'canonical landscape')
  const originalGoals = Array.isArray(canonicalOriginal.goals) ? canonicalOriginal.goals.map((goal) => jsonObject(goal, 'goal')) : []
  const reconstructedGoals = params.reconstruction.landscape.goals.map((goal) => jsonObject(goal, 'reconstructed goal'))
  const reconstructedGoalById = asMap(reconstructedGoals, (goal) => String(goal.id))
  const missingGoals = originalGoals.filter((goal) => !reconstructedGoalById.has(String(goal.id))).map((goal) => String(goal.id))
  const changedGoalFields = originalGoals.flatMap((goal) => {
    const reconstructed = reconstructedGoalById.get(String(goal.id))
    if (!reconstructed) {
      return []
    }
    const issues: string[] = []
    ;['title', 'description', 'phase', 'area', 'level', 'courseLevel', 'core', 'weight'].forEach((field) => {
      if (normalize((goal[field] ?? null) as JsonValue) !== normalize((reconstructed[field] ?? null) as JsonValue)) {
        issues.push(`${String(goal.id)}.${field}`)
      }
    })
    ;['contains', 'requires'].forEach((field) => {
      if (normalizeStringSet(goal[field]) !== normalizeStringSet(reconstructed[field])) {
        issues.push(`${String(goal.id)}.${field}`)
      }
    })
    return issues
  })
  check(checks, 'semantic-goals-count-and-ids', missingGoals.length === 0 && originalGoals.length === reconstructedGoals.length, `${reconstructedGoals.length}/${originalGoals.length} goal(s); missing ${missingGoals.length}`)
  check(checks, 'semantic-goal-core-fields-match', changedGoalFields.length === 0, changedGoalFields.slice(0, 10).join(', ') || 'ok')

  const sourceOriginal = readZipJson(params.zipPath, packageEntryPath(archiveRoot, 'data/sources/source-goal-references.json'))
  const sourceOriginalGoals = flattenSourceGoals(sourceOriginal)
  const sourceReconstructedGoals = flattenSourceGoals(params.reconstruction.sourceGoalReferences)
  const sourceReconstructedById = asMap(sourceReconstructedGoals, (goal) => String(goal.sourceGoalId))
  const sourceIssues = sourceOriginalGoals.flatMap((goal) => {
    const reconstructed = sourceReconstructedById.get(String(goal.sourceGoalId))
    if (!reconstructed) {
      return [`missing ${String(goal.sourceGoalId)}`]
    }
    return ['sourceText', 'sourceSpan', 'sourceRef', 'sourceTextSha256', 'sourceDocumentUrl']
      .filter((field) => normalize((goal[field] ?? null) as JsonValue) !== normalize((reconstructed[field] ?? null) as JsonValue))
      .map((field) => `${String(goal.sourceGoalId)}.${field}`)
  })
  check(checks, 'semantic-source-goals-match', sourceIssues.length === 0 && sourceOriginalGoals.length === sourceReconstructedGoals.length, sourceIssues.slice(0, 10).join(', ') || `${sourceReconstructedGoals.length}/${sourceOriginalGoals.length} source goal(s)`)

  const cardOriginalEntries = entries.filter((entry) => entry.startsWith(`${archiveRoot}/data/cards/`) && entry.endsWith('.json') && !entry.endsWith('/card-index.json'))
  const originalCards = cardOriginalEntries.flatMap((entry) => {
    const deck = jsonObject(readZipJson(params.zipPath, entry), 'card deck')
    const cards = Array.isArray(deck.cards) ? deck.cards : []
    return cards.map((card) => {
      const cardData = jsonObject(card, 'card')
      return {
        key: `${entry}::${String(cardData.id)}`,
        front: cardData.front,
        back: cardData.back,
        category: cardData.category,
        tags: cardData.tags,
      }
    })
  })
  const reconstructedCards = params.reconstruction.cardDecks.flatMap((deckValue) => {
    const deck = jsonObject(deckValue, 'reconstructed deck')
    const cards = Array.isArray(deck.cards) ? deck.cards : []
    return cards.map((card) => {
      const cardData = jsonObject(card, 'reconstructed card')
      return {
        key: `${String(deck.zipPath)}::${String(cardData.id)}`,
        front: cardData.front,
        back: cardData.back,
        category: cardData.category,
        tags: cardData.tags,
      }
    })
  })
  const reconstructedCardByKey = asMap(reconstructedCards, (card) => card.key)
  const cardIssues = originalCards.flatMap((card) => {
    const reconstructed = reconstructedCardByKey.get(card.key)
    if (!reconstructed) {
      return [`missing ${card.key}`]
    }
    return normalize(card as unknown as JsonValue) === normalize(reconstructed as unknown as JsonValue) ? [] : [`changed ${card.key}`]
  })
  check(checks, 'semantic-cards-match', cardIssues.length === 0 && originalCards.length === reconstructedCards.length, cardIssues.slice(0, 10).join(', ') || `${reconstructedCards.length}/${originalCards.length} card(s)`)

  const mappingOriginalEntries = entries.filter((entry) => entry.startsWith(`${archiveRoot}/data/mappings/`) && entry.endsWith('.json'))
  const originalCanonicalMappingCount = mappingOriginalEntries
    .filter((entry) => !entry.endsWith('.review.json'))
    .reduce((count, entry) => {
      const data = jsonObject(readZipJson(params.zipPath, entry), 'canonical mapping')
      return count + (Array.isArray(data.mappings) ? data.mappings.length : 0)
    }, 0)
  const originalReviewDecisionCount = mappingOriginalEntries
    .filter((entry) => entry.endsWith('.review.json'))
    .reduce((count, entry) => {
      const data = jsonObject(readZipJson(params.zipPath, entry), 'review mapping')
      const decisions = Array.isArray(data.decisions) ? data.decisions : Array.isArray(data.mappings) ? data.mappings : []
      return count + decisions.length
    }, 0)
  const reconstructedCanonicalMappingCount = Object.values(params.reconstruction.canonicalMappings).reduce((count, mappings) => count + mappings.length, 0)
  const reconstructedReviewDecisionCount = Object.values(params.reconstruction.reviewDecisions).reduce((count, decisions) => count + decisions.length, 0)
  check(checks, 'semantic-mapping-counts-match', originalCanonicalMappingCount === reconstructedCanonicalMappingCount && originalReviewDecisionCount === reconstructedReviewDecisionCount, `${reconstructedCanonicalMappingCount}/${originalCanonicalMappingCount} mappings; ${reconstructedReviewDecisionCount}/${originalReviewDecisionCount} review decisions`)

  const viewOriginalEntries = entries.filter((entry) => entry.startsWith(`${archiveRoot}/data/views/`) && entry.endsWith('.view.json'))
  const originalViewGoalRefs = viewOriginalEntries.flatMap((entry) => collectViewGoalRefs(readZipJson(params.zipPath, entry)))
  const reconstructedViewGoalRefs = Object.values(params.reconstruction.compositionViews).flatMap(collectViewGoalRefs)
  check(checks, 'semantic-view-counts-and-goal-refs-match', viewOriginalEntries.length === Object.keys(params.reconstruction.compositionViews).length && originalViewGoalRefs.length === reconstructedViewGoalRefs.length, `${Object.keys(params.reconstruction.compositionViews).length}/${viewOriginalEntries.length} view(s); ${reconstructedViewGoalRefs.length}/${originalViewGoalRefs.length} view goal refs`)

  return {
    archiveRoot,
    passed: checks.every((entry) => entry.passed),
    checks,
  }
}

const writeOutputs = (params: {
  options: CliOptions
  reconstruction: SemanticReconstruction
  validation: ReturnType<typeof validateSemanticReconstruction>
}) => {
  mkdirSync(params.options.outDir, { recursive: true })
  writeFileSync(resolve(params.options.outDir, 'canonical-landscape.semantic.json'), `${JSON.stringify(params.reconstruction.landscape, null, 2)}\n`)
  writeFileSync(resolve(params.options.outDir, 'source-goal-references.semantic.json'), `${JSON.stringify(params.reconstruction.sourceGoalReferences, null, 2)}\n`)
  writeFileSync(resolve(params.options.outDir, 'card-decks.semantic.json'), `${JSON.stringify(params.reconstruction.cardDecks, null, 2)}\n`)
  writeFileSync(resolve(params.options.outDir, 'mappings.semantic.json'), `${JSON.stringify({
    canonicalMappings: params.reconstruction.canonicalMappings,
    reviewDecisions: params.reconstruction.reviewDecisions,
  }, null, 2)}\n`)
  writeFileSync(resolve(params.options.outDir, 'composition-views.semantic.json'), `${JSON.stringify(params.reconstruction.compositionViews, null, 2)}\n`)
  writeFileSync(resolve(params.options.outDir, 'semantic-reconstruction-report.json'), `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    rdfPath: repoRelative(params.options.rdfPath),
    comparisonZip: repoRelative(params.options.zipPath),
    archiveRoot: params.validation.archiveRoot,
    passed: params.validation.passed,
    checks: params.validation.checks,
  }, null, 2)}\n`)

  const failed = params.validation.checks.filter((entry) => !entry.passed)
  writeFileSync(resolve(params.options.outDir, 'semantic-reconstruction-report.md'), `# Semantic MEM/FWU Reconstruction Report

Generated at: ${new Date().toISOString()}

RDF: \`${repoRelative(params.options.rdfPath)}\`

Comparison ZIP: \`${repoRelative(params.options.zipPath)}\`

## Result

${params.validation.passed ? 'Semantic reconstruction passed.' : 'Semantic reconstruction failed.'}

## Checks

| Check | Status | Details |
| --- | --- | --- |
${params.validation.checks.map((entry) => `| \`${entry.id}\` | ${entry.passed ? 'pass' : 'fail'} | ${entry.details.replace(/\|/gu, '\\|')} |`).join('\n')}

## Failed Checks

${failed.length === 0 ? 'No failed checks.' : failed.map((entry) => `- \`${entry.id}\`: ${entry.details}`).join('\n')}
`)
}

const run = async () => {
  const options = parseArgs(process.argv.slice(2))
  if (options.help) {
    process.stdout.write(usage())
    return
  }
  const model = await readRdfModel(options.rdfPath)
  const reconstruction = reconstructSemantic(model)
  const validation = validateSemanticReconstruction({ zipPath: options.zipPath, reconstruction })
  writeOutputs({ options, reconstruction, validation })
  process.stdout.write(`Semantic reconstruction ${validation.passed ? 'passed' : 'failed'}\n`)
  process.stdout.write(`Report: ${repoRelative(resolve(options.outDir, 'semantic-reconstruction-report.md'))}\n`)
  if (!validation.passed) {
    process.exitCode = 1
  }
}

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  process.stderr.write(`${message}\n`)
  process.exitCode = 1
})
