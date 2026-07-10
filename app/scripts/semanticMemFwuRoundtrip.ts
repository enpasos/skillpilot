import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import {
  createReadStream,
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
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

const compareCodeUnits = (left: string, right: string) => (left < right ? -1 : left > right ? 1 : 0)

const chunkArgumentsByBytes = (values: string[], maxBytes = 256 * 1024) => {
  const chunks: string[][] = []
  let chunk: string[] = []
  let chunkBytes = 0
  values.forEach((value) => {
    const argumentBytes = Buffer.byteLength(value) + 1
    if (chunk.length > 0 && chunkBytes + argumentBytes > maxBytes) {
      chunks.push(chunk)
      chunk = []
      chunkBytes = 0
    }
    chunk.push(value)
    chunkBytes += argumentBytes
  })
  if (chunk.length > 0) chunks.push(chunk)
  return chunks
}

type CliOptions = {
  rdfPath: string
  zipPath: string
  outDir: string
  help: boolean
}

type TripleObject =
  | { kind: 'iri'; value: string }
  | { kind: 'literal'; value: string; datatype?: string; lang?: string }

type LiteralObject = Extract<TripleObject, { kind: 'literal' }>

type ParsedTriple = {
  subject: string
  predicate: string
  object: TripleObject
}

type RdfModel = {
  types: Map<string, Set<string>>
  literals: Map<string, Map<string, LiteralObject[]>>
  iris: Map<string, Map<string, string[]>>
  reverseIris: Map<string, Map<string, string[]>>
  hasReferenceRoles: boolean
}

type ReconstructedLandscape = {
  id?: string
  landscapeId?: string
  locale?: string
  country?: string
  region?: string
  schoolType?: string
  subject?: string
  frameworkId?: string
  title?: string
  titleEn?: string
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
  goalVisualizations: GoalVisualizationRecord[]
  sourceGoalReferences: JsonValue
  cardDecks: JsonValue[]
  mappingFiles: Record<string, JsonValue>
  canonicalMappings: Record<string, JsonValue[]>
  reviewDecisions: Record<string, JsonValue[]>
  compositionViews: Record<string, JsonValue>
}

type GoalVisualizationRecord = {
  referenceIri: string
  imageIri: string | null
  goalId: string | null
  order: number | null
  packagePath: string | null
  publicUrl: string | null
  mediaType: string | null
  bytes: number | null
  sha256: string | null
  skillpilotId: string | null
  role: string | null
  title: string | null
  provider: string | null
  description: string | null
  altText: string | null
  lang: string | null
  license: string | null
  reviewStatus: string | null
  zipPath: string | null
  structureIssues: string[]
}

type VisualizationValidationCounts = {
  canonicalLinks: number
  rdfReferences: number
  indexAssets: number
  sidecarsCopied: number
}

type CheckResult = {
  id: string
  passed: boolean
  details: string
}

type BoundInputArtifact = {
  path: string
  sha256: string
}

type ReferencePair = {
  reference: string
  source: string
  target: string
}

type ReferenceStructureValidation = {
  prerequisiteIssues: string[]
  competencyIssues: string[]
  visualizationIssues: string[]
}

type CoreFirstValidation = {
  goalIssues: string[]
  competencyIssues: string[]
  programIssues: string[]
  sourceIssues: string[]
  owlSafetyIssues: string[]
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '../..')

const DEFAULT_BASE = 'tmp/roundtrip/mem-fwu/skillpilot-de-gymnasium-mathematik-v0.1.0'
const DEFAULT_RDF = `${DEFAULT_BASE}/slim/bundle.nt`
const DEFAULT_ZIP = 'tmp/exports/skillpilot-de-gymnasium-mathematik-v0.1.0.zip'
const DEFAULT_OUT_DIR = `${DEFAULT_BASE}/slim/semantic-reconstructed`
const ZIP_COMMAND_MAX_BUFFER_BYTES = 512 * 1024 * 1024
const MAX_GOAL_VISUALIZATION_BYTES = 64 * 1024 * 1024
const MAX_GOAL_VISUALIZATION_TOTAL_BYTES = 8 * 1024 * 1024 * 1024
const MAX_ZIP_ENTRY_UNCOMPRESSED_BYTES = 512 * 1024 * 1024
const MAX_ZIP_TOTAL_UNCOMPRESSED_BYTES = 16 * 1024 * 1024 * 1024
const EXPECTED_DE_STATES = [
  'DE-BB',
  'DE-BE',
  'DE-BW',
  'DE-BY',
  'DE-HB',
  'DE-HE',
  'DE-HH',
  'DE-MV',
  'DE-NI',
  'DE-NW',
  'DE-RP',
  'DE-SH',
  'DE-SL',
  'DE-SN',
  'DE-ST',
  'DE-TH',
]

const RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
const RDFS = 'http://www.w3.org/2000/01/rdf-schema#'
const OWL = 'http://www.w3.org/2002/07/owl#'
const DCTERMS = 'http://purl.org/dc/terms/'
const BFO = 'http://purl.obolibrary.org/obo/'
const LP = 'https://w3id.org/lehrplan/ontology/'
const LP_CORE_ONTOLOGY = `${LP}lp/components/lehrplan-core.owl`
const SCHEMA = 'https://schema.org/'
const SP = 'https://skillpilot.de/ns/roundtrip#'

const LP_DIDACTIC_PREREQUISITE = `${LP}LP_0000554`
const LP_SUBJECT_SPECIFIC_COMPETENCY = `${LP}LP_0000336`
const LP_CURRICULAR_AREA = `${LP}LP_0000349`
const LP_PROCESS_COMPETENCY_AREA = `${LP}LP_0030265`
const LP_GUIDING_IDEA = `${LP}LP_0000268`
const LP_REFERENCE = `${LP}LP_0030065`
const LP_HAS_REFERENCE = `${LP}LP_0030071`
const LP_REFERS_TO = `${LP}LP_0030072`
const LP_DESCRIBED_BY = `${LP}LP_0000024`
const LP_HAS_DESCRIPTION = `${LP}LP_0030051`
const LP_HAS_TITLE = `${LP}LP_0030056`
const LP_HAS_NUMBER = `${LP}LP_0030057`
const LP_VALUE = `${LP}LP_0000344`
const LP_POSITION = `${LP}LP_0000460`
const LP_HAS_SCHOOL_SUBJECT = `${LP}LP_0000537`
const LP_HAS_GRADE = `${LP}LP_0000026`
const LP_HAS_STAGE = `${LP}LP_0000047`
const LP_OF_STATE = `${LP}LP_0000029`
const LP_HAS_UNIT = `${LP}LP_0000041`
const LP_HAS_REQUIREMENT_LEVEL = `${LP}LP_0000840`
const BFO_HAS_PART = `${BFO}BFO_0000051`
const BFO_PART_OF = `${BFO}BFO_0000050`
const SCHEMA_IMAGE_OBJECT = `${SCHEMA}ImageObject`
const KIM_MATHEMATICS = 'http://w3id.org/kim/schulfaecher/s1017'
const REFERENCE_ROLE_COMPETENCY_REFS = 'competencyRefs'
const REFERENCE_ROLE_PROCESS_COMPETENCIES = 'dimensionTags.processCompetencies'
const REFERENCE_ROLE_GUIDING_IDEAS = 'dimensionTags.guidingIdeas'

const FWU_GRADES = new Map(
  Array.from({ length: 9 }, (_, index) => {
    const grade = index + 5
    return [`de-gym-math-j${grade}`, `${LP}LP_${2_000_000 + grade}`]
  }),
)
const FWU_STAGE_SEK_I = `${LP}LP_0000045`
const FWU_STAGE_SEK_II = `${LP}LP_0000046`
const FWU_REQUIREMENT_LEVELS = new Map<string, string>([
  ['1', `${LP}LP_0000803`],
  ['2', `${LP}LP_0000804`],
  ['3', `${LP}LP_0000805`],
])
const FWU_STATE_BY_JURISDICTION = new Map<string, string>([
  ['DE-TH', `${LP}LP_3000031`],
  ['DE-NI', `${LP}LP_3000043`],
  ['DE-NW', `${LP}LP_3000044`],
  ['DE-HH', `${LP}LP_3000045`],
  ['DE-RP', `${LP}LP_3000046`],
  ['DE-SN', `${LP}LP_3000047`],
  ['DE-BE', `${LP}LP_3000048`],
  ['DE-BW', `${LP}LP_3000049`],
  ['DE-HE', `${LP}LP_3000050`],
  ['DE-BY', `${LP}LP_3000051`],
  ['DE-MV', `${LP}LP_3000052`],
  ['DE-ST', `${LP}LP_3000053`],
  ['DE-SH', `${LP}LP_3000054`],
  ['DE-SL', `${LP}LP_3000055`],
  ['DE-HB', `${LP}LP_3000056`],
  ['DE-BB', `${LP}LP_3000057`],
])

const P = {
  type: `${RDF}type`,
  label: `${RDFS}label`,
  description: `${DCTERMS}description`,
  source: `${DCTERMS}source`,
  title: `${DCTERMS}title`,
  format: `${DCTERMS}format`,
  dctermsLanguage: `${DCTERMS}language`,
  dctermsLicense: `${DCTERMS}license`,
  skillpilotId: `${SP}skillpilotId`,
  order: `${SP}order`,
  archiveRoot: `${SP}archiveRoot`,
  fwuOntologyCommit: `${SP}fwuOntologyCommit`,
  fwuOntologyCorePath: `${SP}fwuOntologyCorePath`,
  fwuOntologyIri: `${SP}fwuOntologyIri`,
  frameworkId: `${SP}frameworkId`,
  locale: `${SP}locale`,
  country: `${SP}country`,
  region: `${SP}region`,
  schoolType: `${SP}schoolType`,
  subject: `${SP}subject`,
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
  hasGoalVisualization: `${SP}hasGoalVisualization`,
  referencesAsset: `${SP}referencesAsset`,
  dimension: `${SP}dimension`,
  kind: `${SP}kind`,
  shortLabel: `${SP}shortLabel`,
  parentUnitId: `${SP}parentUnitId`,
  relation: `${SP}relation`,
  referenceRole: `${SP}referenceRole`,
  contextJson: `${SP}contextJson`,
  metadataJson: `${SP}metadataJson`,
  applicabilityJson: `${SP}applicabilityJson`,
  resourceLinksJson: `${SP}resourceLinksJson`,
  extendedDataJson: `${SP}extendedDataJson`,
  releaseJson: `${SP}releaseJson`,
  examDataJson: `${SP}examDataJson`,
  dimensionTag: `${SP}dimensionTag`,
  dimensionTagsJson: `${SP}dimensionTagsJson`,
  semanticAtomic: `${SP}semanticAtomic`,
  goalType: `${SP}goalType`,
  nodeKind: `${SP}nodeKind`,
  containsGoal: `${SP}containsGoal`,
  didacticRequires: `${SP}didacticRequires`,
  hasPart: BFO_HAS_PART,
  partOf: BFO_PART_OF,
  hasReference: LP_HAS_REFERENCE,
  refersTo: LP_REFERS_TO,
  placedGoal: `${SP}placedGoal`,
  placedInProgramUnit: `${SP}placedInProgramUnit`,
  zipPath: `${SP}zipPath`,
  viewId: `${SP}viewId`,
  scopeJson: `${SP}scopeJson`,
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
  sourceDocumentLandingUrl: `${SP}sourceDocumentLandingUrl`,
  sourceLine: `${SP}sourceLine`,
  parentBulletText: `${SP}parentBulletText`,
  passageJson: `${SP}passageJson`,
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
  schemaVersion: `${SP}schemaVersion`,
  version: `${SP}version`,
  generatedAt: `${SP}generatedAt`,
  sourceExtractionId: `${SP}sourceExtractionId`,
  sourceLandscapeId: `${SP}sourceLandscapeId`,
  sourceLandscapeTitle: `${SP}sourceLandscapeTitle`,
  targetLandscapeId: `${SP}targetLandscapeId`,
  targetLandscapeTitle: `${SP}targetLandscapeTitle`,
  canonicalCurriculumId: `${SP}canonicalCurriculumId`,
  stage: `${SP}stage`,
  statusJson: `${SP}statusJson`,
  reviewId: `${SP}reviewId`,
  reviewSummaryJson: `${SP}reviewSummaryJson`,
  courseLevelDecision: `${SP}courseLevelDecision`,
  courseLevelRationale: `${SP}courseLevelRationale`,
  evidenceJson: `${SP}evidenceJson`,
  suggestedCanonicalGapJson: `${SP}suggestedCanonicalGapJson`,
  mapsCanonicalGoal: `${SP}mapsCanonicalGoal`,
  mapsSourceGoal: `${SP}mapsSourceGoal`,
  sha256: `${SP}sha256`,
  byteLength: `${SP}byteLength`,
  contentUrl: `${SCHEMA}contentUrl`,
  encodingFormat: `${SCHEMA}encodingFormat`,
  provider: `${SCHEMA}provider`,
  accessibilitySummary: `${SCHEMA}accessibilitySummary`,
  schemaLicense: `${SCHEMA}license`,
  creativeWorkStatus: `${SCHEMA}creativeWorkStatus`,
  inLanguage: `${SCHEMA}inLanguage`,
  quarantinedRecordJson: `${SP}quarantinedRecordJson`,
}

const T = {
  skillPilotPackage: `${SP}SkillPilotPackage`,
  learningLandscape: `${SP}LearningLandscape`,
  learningGoal: `${SP}LearningGoal`,
  atomicGoal: `${SP}AtomicGoal`,
  clusterGoal: `${SP}ClusterGoal`,
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
  mappingFile: `${SP}MappingFile`,
  mappingRecord: `${SP}MappingRecord`,
  reviewDecision: `${SP}ReviewDecision`,
  goalVisualizationReference: `${SP}GoalVisualizationReference`,
  runtimeClusterGoal: `${SP}RuntimeClusterGoal`,
  unscopedCurricularGoal: `${SP}UnscopedCurricularGoal`,
  programStructureGoal: `${SP}ProgramStructureGoal`,
  practiceOrAssessmentGoal: `${SP}PracticeOrAssessmentGoal`,
  memorizationGoal: `${SP}MemorizationGoal`,
  orientationGoal: `${SP}OrientationGoal`,
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
  reverseIris: new Map(),
  hasReferenceRoles: false,
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
  || predicate === `${SP}lineCount`
  || predicate === `${SP}endsWithNewline`
)

const readRdfModel = async (rdfPath: string) => {
  const model = emptyModel()
  const input = createReadStream(rdfPath)
  const digest = createHash('sha256')
  input.on('data', (chunk: Buffer) => digest.update(chunk))
  const reader = createInterface({
    input,
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
      if (triple.predicate === P.hasReference || triple.predicate === P.hasGoalVisualization) {
        addMapValue(model.reverseIris, triple.predicate, triple.object.value, triple.subject)
      }
    } else {
      addMapValue(model.literals, triple.subject, triple.predicate, triple.object)
      if (triple.predicate === P.referenceRole) model.hasReferenceRoles = true
    }
  }
  return { model, sha256: digest.digest('hex') }
}

const resourcesOfType = (model: RdfModel, type: string) => [...model.types.entries()]
  .filter(([, values]) => values.has(type))
  .map(([resource]) => resource)

const literalObjects = (model: RdfModel, subject: string, predicate: string) => (
  model.literals.get(subject)?.get(predicate) ?? []
)

const lit = (model: RdfModel, subject: string, predicate: string) => (
  literalObjects(model, subject, predicate)[0]?.value
)

const lits = (model: RdfModel, subject: string, predicate: string) => (
  literalObjects(model, subject, predicate).map((value) => value.value)
)

const literalByLanguage = (
  values: LiteralObject[],
  language: 'de' | 'en',
) => {
  const normalizedLanguage = language.toLowerCase()
  return values.find((value) => value.lang?.toLowerCase() === normalizedLanguage)?.value
    ?? values.find((value) => value.lang?.toLowerCase().startsWith(`${normalizedLanguage}-`))?.value
}

const localizedLit = (
  model: RdfModel,
  subject: string,
  predicate: string,
  language: 'de' | 'en',
) => {
  const values = literalObjects(model, subject, predicate)
  return literalByLanguage(values, language)
    ?? values.find((value) => value.lang === undefined)?.value
}

const coreText = (
  model: RdfModel,
  subject: string,
  predicate: string,
  language: 'de' | 'en',
) => {
  const values = iris(model, subject, predicate)
    .flatMap((textResource) => literalObjects(model, textResource, LP_VALUE))
  return literalByLanguage(values, language)
    ?? values.find((value) => value.lang === undefined)?.value
}

const coreNumber = (model: RdfModel, subject: string) => iris(model, subject, LP_HAS_NUMBER)
  .flatMap((textResource) => literalObjects(model, textResource, LP_VALUE))[0]?.value

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

const jsonScalar = (value: string | undefined): JsonValue | undefined => {
  if (value === undefined) {
    return undefined
  }
  try {
    return JSON.parse(value) as JsonValue
  } catch {
    return value
  }
}

const idFromResource = (resource: string) => decodeURIComponent(resource.split('/').pop() ?? resource)

const skillpilotId = (model: RdfModel, resource: string) => lit(model, resource, P.skillpilotId) ?? idFromResource(resource)

const orderedResources = (model: RdfModel, resources: string[]) => [...resources].sort((left, right) => {
  const leftOrder = num(lit(model, left, P.order))
  const rightOrder = num(lit(model, right, P.order))
  if (leftOrder !== undefined && rightOrder !== undefined && leftOrder !== rightOrder) {
    return leftOrder - rightOrder
  }
  return compareCodeUnits(skillpilotId(model, left), skillpilotId(model, right))
})

const graphTargets = (model: RdfModel, source: string, predicate: string) => (
  [...new Set(iris(model, source, predicate).map((target) => skillpilotId(model, target)))]
    .sort(compareCodeUnits)
)

const resourceHasType = (model: RdfModel, resource: string, type: string) => model.types.get(resource)?.has(type) ?? false

const OWL_PROPERTY_TYPES = new Set([
  `${OWL}AnnotationProperty`,
  `${OWL}DatatypeProperty`,
  `${OWL}ObjectProperty`,
])

const isSelfContainedCoreFirstBundle = (model: RdfModel) => [...(model.types.get(P.skillpilotId) ?? [])]
  .some((type) => OWL_PROPERTY_TYPES.has(type))

const resourcesLinkingTo = (
  model: RdfModel,
  target: string,
  predicates: string[],
) => predicates.flatMap((predicate) => model.reverseIris.get(predicate)?.get(target) ?? [])

const reconstructRequires = (model: RdfModel, source: string) => {
  const prerequisiteReferences = iris(model, source, P.hasReference)
    .filter((reference) => resourceHasType(model, reference, LP_DIDACTIC_PREREQUISITE))
  return [...new Set([
    ...prerequisiteReferences
    .flatMap((reference) => iris(model, reference, P.refersTo))
    .map((target) => skillpilotId(model, target)),
    ...graphTargets(model, source, P.didacticRequires),
  ])]
    .sort(compareCodeUnits)
}

const subjectsReferringTo = (model: RdfModel, reference: string) => (
  resourcesLinkingTo(model, reference, [P.hasReference, P.hasGoalVisualization])
)

const reconstructCompetencyRefs = (model: RdfModel, source: string) => [...new Set([
  ...iris(model, source, P.hasReference)
    .filter((reference) => !model.hasReferenceRoles || lits(model, reference, P.referenceRole).includes('competencyRefs'))
    .flatMap((reference) => iris(model, reference, P.refersTo))
    .filter((target) => resourceHasType(model, target, T.competencyCatalogEntry))
    .map((competency) => skillpilotId(model, competency)),
  ...graphTargets(model, source, P.competencyRef),
])].sort(compareCodeUnits)

const nullableLiteral = (model: RdfModel, subject: string, predicate: string) => lit(model, subject, predicate) ?? null

const nullableNumber = (model: RdfModel, subject: string, predicate: string) => num(lit(model, subject, predicate)) ?? null

const packagePathFromZipPath = (zipPath: string | null) => {
  if (!zipPath) return null
  const separator = zipPath.indexOf('/')
  return separator >= 0 && separator < zipPath.length - 1 ? zipPath.slice(separator + 1) : null
}

const visualizationReferenceResources = (model: RdfModel) => {
  const imageResources = new Set(resourcesOfType(model, SCHEMA_IMAGE_OBJECT))
  const targetTypedReferences = [...model.iris.entries()]
    .filter(([, predicateMap]) => [P.refersTo, P.referencesAsset]
      .some((predicate) => (predicateMap.get(predicate) ?? []).some((target) => imageResources.has(target))))
    .map(([resource]) => resource)
  return [...new Set([
    ...resourcesOfType(model, T.goalVisualizationReference),
    ...targetTypedReferences,
  ])]
}

const reconstructGoalVisualizations = (model: RdfModel): GoalVisualizationRecord[] => (
  orderedResources(model, visualizationReferenceResources(model)).map((reference) => {
    const structureIssues: string[] = []
    if (
      !resourceHasType(model, reference, LP_REFERENCE)
      && !resourceHasType(model, reference, T.goalVisualizationReference)
    ) {
      structureIssues.push('reference is neither typed lp:LP_0030065 nor sp:GoalVisualizationReference')
    }

    const sourceCandidates = subjectsReferringTo(model, reference)
    if (sourceCandidates.length !== 1) {
      structureIssues.push(`expected exactly one source goal, found ${sourceCandidates.length}`)
    }
    const source = sourceCandidates[0]
    if (source && !resourceHasType(model, source, T.learningGoal)) {
      structureIssues.push('source is not typed sp:LearningGoal')
    }

    const imageCandidates = [
      ...iris(model, reference, P.refersTo),
      ...iris(model, reference, P.referencesAsset),
    ]
    if (imageCandidates.length !== 1) {
      structureIssues.push(`expected exactly one image target, found ${imageCandidates.length}`)
    }
    const image = imageCandidates[0] ?? null
    if (image && !resourceHasType(model, image, SCHEMA_IMAGE_OBJECT)) {
      structureIssues.push('image is not typed schema:ImageObject')
    }

    const order = nullableNumber(model, reference, LP_POSITION)
      ?? nullableNumber(model, reference, P.order)
    const role = nullableLiteral(model, reference, P.role)
    const goalId = source ? skillpilotId(model, source) : null
    const zipPath = image ? nullableLiteral(model, image, P.zipPath) : null
    const record: GoalVisualizationRecord = {
      referenceIri: reference,
      imageIri: image,
      goalId,
      order,
      packagePath: packagePathFromZipPath(zipPath),
      publicUrl: image ? nullableLiteral(model, image, P.contentUrl) : null,
      mediaType: image
        ? (nullableLiteral(model, image, P.encodingFormat) ?? nullableLiteral(model, image, P.format))
        : null,
      bytes: image ? nullableNumber(model, image, P.byteLength) : null,
      sha256: image ? nullableLiteral(model, image, P.sha256) : null,
      skillpilotId: image ? nullableLiteral(model, image, P.skillpilotId) : null,
      role,
      title: image ? nullableLiteral(model, image, P.title) : null,
      provider: image ? nullableLiteral(model, image, P.provider) : null,
      description: image ? nullableLiteral(model, image, P.description) : null,
      altText: image ? nullableLiteral(model, image, P.accessibilitySummary) : null,
      lang: image
        ? (nullableLiteral(model, image, P.inLanguage) ?? nullableLiteral(model, image, P.dctermsLanguage))
        : null,
      license: image
        ? (nullableLiteral(model, image, P.schemaLicense) ?? nullableLiteral(model, image, P.dctermsLicense))
        : null,
      reviewStatus: image ? nullableLiteral(model, image, P.creativeWorkStatus) : null,
      zipPath,
      structureIssues,
    }

    if (record.order === null || !Number.isInteger(record.order) || record.order < 0) {
      structureIssues.push('order is missing or not a non-negative integer')
    }
    ;([
      'goalId',
      'packagePath',
      'publicUrl',
      'mediaType',
      'sha256',
      'skillpilotId',
      'role',
      'title',
      'provider',
      'description',
      'altText',
      'lang',
      'license',
      'reviewStatus',
      'zipPath',
    ] as const).forEach((field) => {
      if (!record[field]) structureIssues.push(`${field} is missing`)
    })
    if (record.bytes === null || !Number.isInteger(record.bytes) || record.bytes < 0) {
      structureIssues.push('bytes is missing or not a non-negative integer')
    }
    if (record.sha256 !== null && !/^[a-f0-9]{64}$/u.test(record.sha256)) {
      structureIssues.push('sha256 is not a lowercase SHA-256 digest')
    }
    if (record.goalId && record.skillpilotId && record.goalId !== record.skillpilotId) {
      structureIssues.push(`image skillpilotId ${record.skillpilotId} does not match source goal ${record.goalId}`)
    }
    if (record.packagePath && record.publicUrl && record.publicUrl !== `/${record.packagePath}`) {
      structureIssues.push(`publicUrl ${record.publicUrl} does not match packagePath ${record.packagePath}`)
    }
    if (record.mediaType && record.mediaType !== 'image/jpeg' && record.mediaType !== 'image/png') {
      structureIssues.push(`unsupported mediaType ${record.mediaType}`)
    }

    return record
  })
)

const referencesTargetingType = (model: RdfModel, targetType: string) => [...model.iris.entries()]
  .filter(([, predicateMap]) => (predicateMap.get(P.refersTo) ?? [])
    .some((target) => resourceHasType(model, target, targetType)))
  .map(([reference]) => reference)

const inspectReifiedReferences = (params: {
  model: RdfModel
  references: string[]
  incomingPredicates: string[]
  targetType: string
  referenceLabel: string
  targetPredicates?: string[]
  requireCoreReferenceType?: boolean
  allowAppVisualizationType?: boolean
  rejectSelfLoop?: boolean
}) => {
  const issues: string[] = []
  const pairs: ReferencePair[] = []
  ;[...new Set(params.references)].forEach((reference) => {
    const shortReference = idFromResource(reference)
    if (
      params.requireCoreReferenceType
      && !resourceHasType(params.model, reference, LP_REFERENCE)
    ) {
      issues.push(`${params.referenceLabel} ${shortReference}: missing lp:LP_0030065 type`)
    }
    if (
      params.allowAppVisualizationType
      && !resourceHasType(params.model, reference, LP_REFERENCE)
      && !resourceHasType(params.model, reference, T.goalVisualizationReference)
    ) {
      issues.push(`${params.referenceLabel} ${shortReference}: missing core or app reference type`)
    }

    const sources = resourcesLinkingTo(params.model, reference, params.incomingPredicates)
    const targetPredicates = params.targetPredicates ?? [P.refersTo]
    const targets = targetPredicates.flatMap((predicate) => iris(params.model, reference, predicate))
    if (sources.length !== 1) {
      issues.push(`${params.referenceLabel} ${shortReference}: expected 1 incoming reference edge, found ${sources.length}`)
    }
    if (targets.length !== 1) {
      issues.push(`${params.referenceLabel} ${shortReference}: expected 1 target edge, found ${targets.length}`)
    }
    const source = sources[0]
    const target = targets[0]
    if (source && !resourceHasType(params.model, source, T.learningGoal)) {
      issues.push(`${params.referenceLabel} ${shortReference}: source is not a known learning goal`)
    }
    if (target && !resourceHasType(params.model, target, params.targetType)) {
      issues.push(`${params.referenceLabel} ${shortReference}: target has the wrong resource type`)
    }
    if (source && target && params.rejectSelfLoop && source === target) {
      issues.push(`${params.referenceLabel} ${shortReference}: self-loop`)
    }
    if (
      sources.length === 1
      && targets.length === 1
      && resourceHasType(params.model, source, T.learningGoal)
      && resourceHasType(params.model, target, params.targetType)
    ) {
      pairs.push({ reference, source, target })
    }
  })
  return { issues, pairs }
}

const inspectDirectGoalRelations = (params: {
  model: RdfModel
  predicate: string
  targetType: string
  relationLabel: string
  rejectSelfLoop?: boolean
}) => {
  const issues: string[] = []
  const pairs: ReferencePair[] = []
  ;[...params.model.iris.entries()].forEach(([source, predicateMap]) => {
    const targets = predicateMap.get(params.predicate) ?? []
    targets.forEach((target, index) => {
      const relation = `${params.relationLabel} ${skillpilotId(params.model, source)} -> ${skillpilotId(params.model, target)}`
      if (!resourceHasType(params.model, source, T.learningGoal)) {
        issues.push(`${relation}: source is not a known learning goal`)
      }
      if (!resourceHasType(params.model, target, params.targetType)) {
        issues.push(`${relation}: target has the wrong resource type`)
      }
      if (params.rejectSelfLoop && source === target) {
        issues.push(`${relation}: self-loop`)
      }
      if (
        resourceHasType(params.model, source, T.learningGoal)
        && resourceHasType(params.model, target, params.targetType)
      ) {
        pairs.push({ reference: `${params.predicate}#${index}`, source, target })
      }
    })
  })
  return { issues, pairs }
}

const duplicatePairIssues = (
  model: RdfModel,
  label: string,
  pairs: ReferencePair[],
) => {
  const referencesByPair = new Map<string, ReferencePair[]>()
  pairs.forEach((pair) => {
    const key = `${pair.source}\u0000${pair.target}`
    referencesByPair.set(key, [...(referencesByPair.get(key) ?? []), pair])
  })
  return [...referencesByPair.values()]
    .filter((entries) => entries.length > 1)
    .map((entries) => (
      `${label} ${skillpilotId(model, entries[0].source)} -> ${skillpilotId(model, entries[0].target)} is encoded ${entries.length} times`
    ))
}

const validateReferenceStructure = (model: RdfModel): ReferenceStructureValidation => {
  const prerequisites = inspectReifiedReferences({
    model,
    references: resourcesOfType(model, LP_DIDACTIC_PREREQUISITE),
    incomingPredicates: [P.hasReference],
    targetType: T.learningGoal,
    referenceLabel: 'prerequisite reference',
    rejectSelfLoop: true,
  })
  const directPrerequisites = inspectDirectGoalRelations({
    model,
    predicate: P.didacticRequires,
    targetType: T.learningGoal,
    relationLabel: 'direct prerequisite',
    rejectSelfLoop: true,
  })
  const prerequisitePairs = [...prerequisites.pairs, ...directPrerequisites.pairs]

  const competencies = inspectReifiedReferences({
    model,
    references: referencesTargetingType(model, T.competencyCatalogEntry),
    incomingPredicates: [P.hasReference],
    targetType: T.competencyCatalogEntry,
    referenceLabel: 'competency reference',
    requireCoreReferenceType: true,
  })
  const directCompetencies = inspectDirectGoalRelations({
    model,
    predicate: P.competencyRef,
    targetType: T.competencyCatalogEntry,
    relationLabel: 'direct competency reference',
  })
  const competencyPairs = [...competencies.pairs, ...directCompetencies.pairs]

  const visualizations = inspectReifiedReferences({
    model,
    references: visualizationReferenceResources(model),
    incomingPredicates: [P.hasReference, P.hasGoalVisualization],
    targetPredicates: [P.refersTo, P.referencesAsset],
    targetType: SCHEMA_IMAGE_OBJECT,
    referenceLabel: 'visualization reference',
    allowAppVisualizationType: true,
  })
  if (isSelfContainedCoreFirstBundle(model)) {
    visualizations.pairs.forEach(({ reference, source }) => {
      const isAppReference = resourceHasType(model, reference, T.goalVisualizationReference)
      const isCoreReference = resourceHasType(model, reference, LP_REFERENCE)
      const coreIncoming = resourcesLinkingTo(model, reference, [P.hasReference]).length
      const appIncoming = resourcesLinkingTo(model, reference, [P.hasGoalVisualization]).length
      const coreTargets = iris(model, reference, P.refersTo).length
      const appTargets = iris(model, reference, P.referencesAsset).length
      if (isCurricularGoal(model, source)) {
        if (!isCoreReference || isAppReference || coreIncoming !== 1 || coreTargets !== 1 || appIncoming !== 0 || appTargets !== 0) {
          visualizations.issues.push(`visualization reference ${idFromResource(reference)}: curricular source must use only the core reference pattern`)
        }
      } else if (!isAppReference || isCoreReference || appIncoming !== 1 || appTargets !== 1 || coreIncoming !== 0 || coreTargets !== 0) {
        visualizations.issues.push(`visualization reference ${idFromResource(reference)}: runtime source must use only the app reference pattern`)
      }
    })
  }

  return {
    prerequisiteIssues: [
      ...prerequisites.issues,
      ...directPrerequisites.issues,
      ...duplicatePairIssues(model, 'prerequisite relation', prerequisitePairs),
    ],
    competencyIssues: [
      ...competencies.issues,
      ...directCompetencies.issues,
      ...duplicatePairIssues(model, 'competency relation', competencyPairs),
    ],
    visualizationIssues: [
      ...visualizations.issues,
      ...duplicatePairIssues(model, 'visualization relation', visualizations.pairs),
    ],
  }
}

const isCurricularGoal = (model: RdfModel, resource: string) => (
  resourceHasType(model, resource, LP_SUBJECT_SPECIFIC_COMPETENCY)
  || resourceHasType(model, resource, LP_CURRICULAR_AREA)
)

const hasUnsafeRdfLiteralCharacters = (value: string) => {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index)
    if (
      code <= 0x08
      || code === 0x0B
      || code === 0x0C
      || (code >= 0x0E && code <= 0x1F)
      || code === 0x7F
      || code === 0xFFFE
      || code === 0xFFFF
    ) {
      return true
    }
    if (code >= 0xD800 && code <= 0xDBFF) {
      const next = value.charCodeAt(index + 1)
      if (next < 0xDC00 || next > 0xDFFF) {
        return true
      }
      index += 1
    } else if (code >= 0xDC00 && code <= 0xDFFF) {
      return true
    }
  }
  return false
}

const validateCoreFirstStructure = (
  model: RdfModel,
  expectedKinds?: Map<string, ExpectedGoalKind>,
  expectedGraphKinds?: Map<string, 'atomic' | 'cluster'>,
): CoreFirstValidation => {
  const goalIssues: string[] = []
  const competencyIssues: string[] = []
  const programIssues: string[] = []
  const sourceIssues: string[] = []
  const owlSafetyIssues: string[] = []
  if (!isSelfContainedCoreFirstBundle(model)) {
    return { goalIssues, competencyIssues, programIssues, sourceIssues, owlSafetyIssues }
  }

  const goalById = new Map(
    resourcesOfType(model, T.learningGoal).map((resource) => [skillpilotId(model, resource), resource]),
  )
  const appGoalTypes = [
    T.runtimeClusterGoal,
    T.unscopedCurricularGoal,
    T.programStructureGoal,
    T.practiceOrAssessmentGoal,
    T.memorizationGoal,
    T.orientationGoal,
  ]
  const appTypeByExpectedKind = new Map<ExpectedGoalKind, string>([
    ['runtime-cluster', T.runtimeClusterGoal],
    ['unscoped-curricular-atomic', T.unscopedCurricularGoal],
    ['program-structure', T.programStructureGoal],
    ['practice-or-assessment', T.practiceOrAssessmentGoal],
    ['memorization', T.memorizationGoal],
    ['orientation', T.orientationGoal],
  ])
  expectedKinds?.forEach((expectedKind, id) => {
    const resource = goalById.get(id)
    if (!resource) {
      goalIssues.push(`${id}: expected goal is missing from the RDF graph`)
      return
    }
    const isAtomic = resourceHasType(model, resource, LP_SUBJECT_SPECIFIC_COMPETENCY)
    const isArea = resourceHasType(model, resource, LP_CURRICULAR_AREA)
    const actualAppTypes = appGoalTypes.filter((type) => resourceHasType(model, resource, type))
    if (expectedKind === 'atomic' && (!isAtomic || isArea || actualAppTypes.length > 0)) {
      goalIssues.push(`${id}: expected only the subject-specific competency core type`)
    } else if (expectedKind === 'area' && (!isArea || isAtomic || actualAppTypes.length > 0)) {
      goalIssues.push(`${id}: expected only the curricular-area core type`)
    } else if (expectedKind !== 'atomic' && expectedKind !== 'area') {
      const expectedAppType = appTypeByExpectedKind.get(expectedKind)
      if (isAtomic || isArea || !expectedAppType || actualAppTypes.length !== 1 || actualAppTypes[0] !== expectedAppType) {
        goalIssues.push(`${id}: expected exactly the ${expectedKind} application goal type`)
      }
    }
  })
  expectedGraphKinds?.forEach((expectedGraphKind, id) => {
    const resource = goalById.get(id)
    if (!resource) return
    const isAtomicGoal = resourceHasType(model, resource, T.atomicGoal)
    const isClusterGoal = resourceHasType(model, resource, T.clusterGoal)
    if (
      (expectedGraphKind === 'atomic' && (!isAtomicGoal || isClusterGoal))
      || (expectedGraphKind === 'cluster' && (!isClusterGoal || isAtomicGoal))
    ) {
      goalIssues.push(`${id}: expected exactly the ${expectedGraphKind} runtime graph-node type`)
    }
  })

  const curricularGoals = [...new Set([
    ...resourcesOfType(model, LP_SUBJECT_SPECIFIC_COMPETENCY),
    ...resourcesOfType(model, LP_CURRICULAR_AREA),
  ])]
  curricularGoals.forEach((resource) => {
    const id = skillpilotId(model, resource)
    if (!resourceHasType(model, resource, T.learningGoal)) {
      goalIssues.push(`${id}: curricular resource is not a SkillPilot learning goal`)
    }
    if (
      resourceHasType(model, resource, LP_SUBJECT_SPECIFIC_COMPETENCY)
      && resourceHasType(model, resource, LP_CURRICULAR_AREA)
    ) {
      goalIssues.push(`${id}: typed as both subject-specific competency and curricular area`)
    }
    if (!iris(model, resource, LP_HAS_SCHOOL_SUBJECT).includes(KIM_MATHEMATICS)) {
      goalIssues.push(`${id}: missing mathematics subject assertion`)
    }
    ;(['de', 'en'] as const).forEach((language) => {
      const title = localizedLit(model, resource, P.label, language)
      if (title && coreText(model, resource, LP_HAS_TITLE, language) !== title) {
        goalIssues.push(`${id}: core ${language} title does not match rdfs:label`)
      }
      const description = localizedLit(model, resource, P.description, language)
      if (description && coreText(model, resource, LP_HAS_DESCRIPTION, language) !== description) {
        goalIssues.push(`${id}: core ${language} description does not match dcterms:description`)
      }
    })
    iris(model, resource, LP_HAS_TITLE).forEach((titleResource) => {
      if (!iris(model, resource, LP_DESCRIBED_BY).includes(titleResource)) {
        goalIssues.push(`${id}: named core title is not linked through lp:LP_0000024`)
      }
    })
    const shortKey = lit(model, resource, P.shortKey)
    if (shortKey && coreNumber(model, resource) !== shortKey) {
      goalIssues.push(`${id}: core number does not match sp:shortKey`)
    }
    const level = lit(model, resource, P.level)
    const requirementLevel = level ? FWU_REQUIREMENT_LEVELS.get(level) : undefined
    if (requirementLevel && !iris(model, resource, LP_HAS_REQUIREMENT_LEVEL).includes(requirementLevel)) {
      goalIssues.push(`${id}: missing FWU requirement-level assertion for level ${level}`)
    }
  })

  ;[
    T.runtimeClusterGoal,
    T.unscopedCurricularGoal,
    T.programStructureGoal,
    T.practiceOrAssessmentGoal,
    T.memorizationGoal,
    T.orientationGoal,
  ].flatMap((type) => resourcesOfType(model, type)).forEach((resource) => {
    if (isCurricularGoal(model, resource)) {
      goalIssues.push(`${skillpilotId(model, resource)}: runtime-only goal carries a curricular core type`)
    }
  })

  const atomsWithNamedAreaParent = new Set<string>()
  resourcesOfType(model, LP_CURRICULAR_AREA).forEach((source) => {
    iris(model, source, P.containsGoal).filter((target) => isCurricularGoal(model, target)).forEach((target) => {
      if (!iris(model, source, P.hasPart).includes(target)) {
        goalIssues.push(`${skillpilotId(model, source)} -> ${skillpilotId(model, target)}: missing strict BFO has-part edge`)
      }
      if (resourceHasType(model, target, LP_SUBJECT_SPECIFIC_COMPETENCY)) {
        atomsWithNamedAreaParent.add(target)
      }
    })
  })
  resourcesOfType(model, LP_SUBJECT_SPECIFIC_COMPETENCY).forEach((resource) => {
    if (!atomsWithNamedAreaParent.has(resource)) {
      goalIssues.push(`${skillpilotId(model, resource)}: competency specification has no named curricular-area parent`)
    }
  })
  ;[...model.iris.entries()].forEach(([source, predicateMap]) => {
    if (!resourceHasType(model, source, T.learningGoal)) {
      return
    }
    ;(predicateMap.get(P.hasPart) ?? []).filter((target) => resourceHasType(model, target, T.learningGoal)).forEach((target) => {
      if (!iris(model, source, P.containsGoal).includes(target)) {
        goalIssues.push(`${skillpilotId(model, source)} -> ${skillpilotId(model, target)}: BFO edge is not an authored direct contains edge`)
      }
    })
  })

  resourcesOfType(model, LP_DIDACTIC_PREREQUISITE).forEach((reference) => {
    const source = resourcesLinkingTo(model, reference, [P.hasReference])[0]
    const target = iris(model, reference, P.refersTo)[0]
    if (source && target && (!isCurricularGoal(model, source) || !isCurricularGoal(model, target))) {
      goalIssues.push(`${skillpilotId(model, source)} -> ${skillpilotId(model, target)}: core prerequisite has a runtime-only endpoint`)
    }
  })
  ;[...model.iris.entries()].forEach(([source, predicateMap]) => {
    ;(predicateMap.get(P.didacticRequires) ?? []).forEach((target) => {
      if (isCurricularGoal(model, source) && isCurricularGoal(model, target)) {
        goalIssues.push(`${skillpilotId(model, source)} -> ${skillpilotId(model, target)}: curricular prerequisite uses the app fallback`)
      }
    })
  })

  resourcesOfType(model, T.competencyCatalogEntry).forEach((resource) => {
    const id = skillpilotId(model, resource)
    if (!resourceHasType(model, resource, LP_PROCESS_COMPETENCY_AREA)) {
      competencyIssues.push(`${id}: missing process-competency-area core type`)
    }
    if (!iris(model, resource, LP_HAS_SCHOOL_SUBJECT).includes(KIM_MATHEMATICS)) {
      competencyIssues.push(`${id}: missing mathematics subject assertion`)
    }
    if (coreNumber(model, resource) !== id.replace(/^PROCESS\./u, '')) {
      competencyIssues.push(`${id}: core number does not match the curriculum code`)
    }
    const label = localizedLit(model, resource, P.label, 'de')
    if (label && coreText(model, resource, LP_HAS_TITLE, 'de') !== label) {
      competencyIssues.push(`${id}: core title does not match the catalog label`)
    }
  })
  ;[...model.iris.entries()].forEach(([source, predicateMap]) => {
    ;(predicateMap.get(P.competencyRef) ?? []).forEach((target) => {
      if (isCurricularGoal(model, source)) {
        competencyIssues.push(`${skillpilotId(model, source)} -> ${skillpilotId(model, target)}: curricular source uses the app competency fallback`)
      }
    })
  })
  referencesTargetingType(model, T.competencyCatalogEntry).forEach((reference) => {
    const source = resourcesLinkingTo(model, reference, [P.hasReference])[0]
    if (source && !isCurricularGoal(model, source)) {
      competencyIssues.push(`${skillpilotId(model, source)}: competency reference source is not a curricular goal`)
    }
  })

  resourcesOfType(model, T.programUnit).forEach((resource) => {
    const id = skillpilotId(model, resource)
    const expectedGrade = FWU_GRADES.get(id)
    if (expectedGrade && !iris(model, resource, LP_HAS_GRADE).includes(expectedGrade)) {
      programIssues.push(`${id}: missing grade assertion ${idFromResource(expectedGrade)}`)
    }
    const year = id.match(/^de-gym-math-j([0-9]+)$/u)?.[1]
    const yearNumber = year ? Number(year) : null
    const expectedStage = id === 'de-gym-math-sek1' || (yearNumber !== null && yearNumber <= 10)
      ? FWU_STAGE_SEK_I
      : (
          id === 'de-gym-math-sek2'
          || (yearNumber !== null && yearNumber > 10)
          || /^de-gym-math-(?:e|q[1-4])$/u.test(id)
        )
          ? FWU_STAGE_SEK_II
          : null
    if (expectedStage && !iris(model, resource, LP_HAS_STAGE).includes(expectedStage)) {
      programIssues.push(`${id}: missing school-stage assertion ${idFromResource(expectedStage)}`)
    }
    const parentId = lit(model, resource, P.parentUnitId)
    if (parentId) {
      const parent = resourcesOfType(model, T.programUnit)
        .find((candidate) => skillpilotId(model, candidate) === parentId)
      if (!parent || !iris(model, parent, LP_HAS_UNIT).includes(resource)) {
        programIssues.push(`${id}: parent ${parentId} does not use the core has-unit relation`)
      }
    }
  })

  resourcesOfType(model, T.sourceCollection).forEach((resource) => {
    const jurisdiction = lit(model, resource, P.jurisdiction)
    const expectedState = jurisdiction ? FWU_STATE_BY_JURISDICTION.get(jurisdiction) : undefined
    if (expectedState && !iris(model, resource, LP_OF_STATE).includes(expectedState)) {
      sourceIssues.push(`${skillpilotId(model, resource)}: missing federal-state assertion for ${jurisdiction}`)
    }
  })

  const usedProperties = new Set<string>()
  model.iris.forEach((predicateMap) => predicateMap.forEach((_values, predicate) => usedProperties.add(predicate)))
  model.literals.forEach((predicateMap) => predicateMap.forEach((_values, predicate) => usedProperties.add(predicate)))
  usedProperties.forEach((property) => {
    if (![...(model.types.get(property) ?? [])].some((type) => OWL_PROPERTY_TYPES.has(type))) {
      owlSafetyIssues.push(`${property}: property kind is not declared in bundle.nt`)
    }
  })
  model.types.forEach((types) => types.forEach((type) => {
    if (type.startsWith(OWL) || resourceHasType(model, type, `${OWL}Class`)) {
      return
    }
    owlSafetyIssues.push(`${type}: used class is not declared in bundle.nt`)
  }))
  model.literals.forEach((predicateMap, subject) => predicateMap.forEach((values, predicate) => values.forEach((value) => {
    if (value.datatype === `${SP}json`) {
      owlSafetyIssues.push(`${skillpilotId(model, subject)} ${predicate}: private sp:json datatype is forbidden`)
    }
    if (hasUnsafeRdfLiteralCharacters(value.value)) {
      owlSafetyIssues.push(`${skillpilotId(model, subject)} ${predicate}: unsafe RDF/XML literal character`)
    }
  })))

  return { goalIssues, competencyIssues, programIssues, sourceIssues, owlSafetyIssues }
}

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

const mergeGoalVisualizationLinks = (
  serializedLinks: JsonValue | undefined,
  records: GoalVisualizationRecord[],
): JsonValue | undefined => {
  if (records.length === 0 || !Array.isArray(serializedLinks)) {
    return serializedLinks
  }
  const reconstructed = [...serializedLinks]
  records.forEach((record) => {
    if (record.order === null || !Number.isInteger(record.order) || record.order < 0) {
      return
    }
    while (reconstructed.length <= record.order) {
      reconstructed.push(null)
    }
    // Older bundles contain the complete visualization link in the compact JSON.
    // New core-first bundles retain its array position as null and put the actual
    // semantics on the reified LP reference. Do not append or duplicate old links.
    if (reconstructed[record.order] === null) {
      reconstructed[record.order] = visualizationLinkFromRecord(record)
    }
  })
  return reconstructed
}

const reconstructLandscape = (
  model: RdfModel,
  goalVisualizations: GoalVisualizationRecord[],
): ReconstructedLandscape => {
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
  withString(reconstructed as Record<string, JsonValue>, 'landscapeId', lit(model, landscapeResource, P.skillpilotId))
  withString(reconstructed as Record<string, JsonValue>, 'frameworkId', lit(model, landscapeResource, P.frameworkId))
  withString(reconstructed as Record<string, JsonValue>, 'locale', lit(model, landscapeResource, P.locale))
  withString(reconstructed as Record<string, JsonValue>, 'country', lit(model, landscapeResource, P.country))
  withString(reconstructed as Record<string, JsonValue>, 'region', lit(model, landscapeResource, P.region))
  withString(reconstructed as Record<string, JsonValue>, 'schoolType', lit(model, landscapeResource, P.schoolType))
  withString(reconstructed as Record<string, JsonValue>, 'subject', lit(model, landscapeResource, P.subject))
  withString(reconstructed as Record<string, JsonValue>, 'title', localizedLit(model, landscapeResource, P.title, 'de'))
  withString(reconstructed as Record<string, JsonValue>, 'titleEn', localizedLit(model, landscapeResource, P.title, 'en'))
  withString(reconstructed as Record<string, JsonValue>, 'description', localizedLit(model, landscapeResource, P.description, 'de'))
  withString(reconstructed as Record<string, JsonValue>, 'descriptionEn', localizedLit(model, landscapeResource, P.description, 'en'))
  withJson(reconstructed as Record<string, JsonValue>, 'filters', json(lit(model, landscapeResource, P.filtersJson)))

  reconstructed.competencyCatalog = orderedResources(model, resourcesOfType(model, T.competencyCatalogEntry)).map((resource) => {
    const entry: Record<string, JsonValue> = {}
    withString(entry, 'id', lit(model, resource, P.skillpilotId))
    withString(entry, 'label', coreText(model, resource, LP_HAS_TITLE, 'de')
      ?? localizedLit(model, resource, P.label, 'de'))
    withString(entry, 'dimension', lit(model, resource, P.dimension))
    return entry
  })

  reconstructed.programUnits = orderedResources(model, resourcesOfType(model, T.programUnit)).map((resource) => {
    const unit: Record<string, JsonValue> = {}
    withString(unit, 'id', lit(model, resource, P.skillpilotId))
    withString(unit, 'label', lit(model, resource, P.label))
    withString(unit, 'shortLabel', lit(model, resource, P.shortLabel))
    withString(unit, 'kind', lit(model, resource, P.kind))
    withString(unit, 'parentUnitId', lit(model, resource, P.parentUnitId))
    withNumber(unit, 'order', num(lit(model, resource, P.order)))
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
    withString(goal, 'shortKey', coreNumber(model, resource) ?? lit(model, resource, P.shortKey))
    withString(goal, 'title', coreText(model, resource, LP_HAS_TITLE, 'de')
      ?? localizedLit(model, resource, P.label, 'de'))
    withString(goal, 'titleEn', coreText(model, resource, LP_HAS_TITLE, 'en')
      ?? localizedLit(model, resource, P.label, 'en'))
    withString(goal, 'description', coreText(model, resource, LP_HAS_DESCRIPTION, 'de')
      ?? localizedLit(model, resource, P.description, 'de'))
    withString(goal, 'descriptionEn', coreText(model, resource, LP_HAS_DESCRIPTION, 'en')
      ?? localizedLit(model, resource, P.description, 'en'))
    withString(goal, 'phase', lit(model, resource, P.phase))
    withString(goal, 'area', lit(model, resource, P.area))
    withString(goal, 'level', lit(model, resource, P.level))
    withString(goal, 'courseLevel', lit(model, resource, P.courseLevel))
    withString(goal, 'sourceRef', lit(model, resource, P.sourceRef))
    withString(goal, 'type', lit(model, resource, P.goalType))
    withString(goal, 'nodeKind', lit(model, resource, P.nodeKind))
    withBoolean(goal, 'core', bool(lit(model, resource, P.core)))
    withNumber(goal, 'weight', num(lit(model, resource, P.weight)))
    withBoolean(goal, 'semanticAtomic', bool(lit(model, resource, P.semanticAtomic)))
    withJson(goal, 'metadata', json(lit(model, resource, P.metadataJson)))
    withJson(goal, 'applicability', json(lit(model, resource, P.applicabilityJson)))
    withJson(goal, 'resourceLinks', mergeGoalVisualizationLinks(
      json(lit(model, resource, P.resourceLinksJson)),
      goalVisualizations.filter((record) => record.goalId === skillpilotId(model, resource)),
    ))
    withJson(goal, 'extendedData', json(lit(model, resource, P.extendedDataJson)))
    withJson(goal, 'release', json(lit(model, resource, P.releaseJson)))
    withJson(goal, 'examData', json(lit(model, resource, P.examDataJson)))
    goal.tags = lits(model, resource, P.tag)
    const structuredDimensionTags = json(lit(model, resource, P.dimensionTagsJson))
    const legacyDimensionTags = lits(model, resource, P.dimensionTag)
    if (structuredDimensionTags !== undefined) {
      goal.dimensionTags = structuredDimensionTags
    } else if (legacyDimensionTags.length > 0) {
      goal.dimensionTags = legacyDimensionTags
    }
    goal.examples = lits(model, resource, P.example)
    goal.competencyRefs = reconstructCompetencyRefs(model, resource)
    // sp:containsGoal preserves the authored direct edge. BFO has-part is
    // transitive in the FWU core, so inferred BFO descendants must not become
    // direct SkillPilot children after a reasoning roundtrip.
    const directContains = graphTargets(model, resource, P.containsGoal)
    goal.contains = directContains.length > 0
      ? directContains
      : graphTargets(model, resource, P.hasPart)
    goal.requires = reconstructRequires(model, resource)
    return goal
  })

  return reconstructed
}

const reconstructSourceGoal = (model: RdfModel, goal: string): Record<string, JsonValue> => {
  const quarantined = json(lit(model, goal, P.quarantinedRecordJson))
  const base = quarantined && typeof quarantined === 'object' && !Array.isArray(quarantined)
    ? { ...quarantined }
    : {}
  const explicit: Record<string, JsonValue | undefined> = {
    sourceGoalId: lit(model, goal, P.skillpilotId),
    title: localizedLit(model, goal, P.label, 'de'),
    description: localizedLit(model, goal, P.description, 'de'),
    sourceText: lit(model, goal, P.sourceText),
    sourceSpan: lit(model, goal, P.sourceSpan),
    sourceRef: lit(model, goal, P.sourceRef),
    sourceTextSha256: lit(model, goal, P.sourceTextSha256),
    sourceDocumentKey: iris(model, goal, P.refersTo)
      .map((document) => lit(model, document, P.sourceDocumentKey))
      .find((key) => key !== undefined),
    sourceDocumentUrl: lit(model, goal, P.sourceDocumentUrl),
    sourceDocumentLandingUrl: lit(model, goal, P.sourceDocumentLandingUrl),
    sourceDocumentTitle: localizedLit(model, goal, P.sourceDocumentTitle, 'de'),
    topicCode: lit(model, goal, P.topicCode),
    passageId: lit(model, goal, P.passageId),
    granularity: lit(model, goal, P.granularity),
    sourcePage: num(lit(model, goal, P.sourcePage)),
    sourceLine: num(lit(model, goal, P.sourceLine)),
    parentBulletText: lit(model, goal, P.parentBulletText),
    passage: json(lit(model, goal, P.passageJson)),
    phase: lit(model, goal, P.phase) ?? null,
    courseLevel: lit(model, goal, P.courseLevel) ?? null,
    category: lit(model, goal, P.category) ?? null,
  }
  Object.entries(explicit).forEach(([key, value]) => {
    if (value !== undefined) {
      base[key] = value
    }
  })
  return base
}

const reconstructSourceGoalReferences = (model: RdfModel) => ({
  note: 'Semantically reconstructed from RDF without using sp:textLine carrier triples.',
  schemaVersion: 1,
  sourceGoalReferenceCount: resourcesOfType(model, T.sourceGoalReference).length,
  sources: orderedResources(model, resourcesOfType(model, T.sourceCollection)).map((collection) => ({
    extractionId: lit(model, collection, P.skillpilotId),
    jurisdiction: lit(model, collection, P.jurisdiction),
    sourceLandscapeId: lit(model, collection, P.sourceLandscapeId),
    stage: lit(model, collection, P.stage),
    subject: lit(model, collection, P.subject),
    sourceDocuments: orderedResources(model, iris(model, collection, P.hasSourceDocument)).map((document) => ({
      key: lit(model, document, P.sourceDocumentKey),
      title: lit(model, document, P.title),
      url: lit(model, document, P.source),
      landingUrl: lit(model, document, P.landingUrl) ?? null,
      role: lit(model, document, P.role),
      official: bool(lit(model, document, P.official)),
    })),
    sourceGoals: orderedResources(model, iris(model, collection, P.hasSourceGoal))
      .map((goal) => reconstructSourceGoal(model, goal)),
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

const reconstructMappingFiles = (model: RdfModel) => {
  const mappingFiles: Record<string, JsonValue> = {}
  orderedResources(model, resourcesOfType(model, T.mappingFile)).forEach((resource) => {
    const zipPath = lit(model, resource, P.zipPath) ?? resource
    const data: Record<string, JsonValue> = {}
    withString(data, 'title', lit(model, resource, P.title))
    withString(data, 'jurisdiction', lit(model, resource, P.jurisdiction))
    withJson(data, 'schemaVersion', jsonScalar(lit(model, resource, P.schemaVersion)))
    withJson(data, 'version', jsonScalar(lit(model, resource, P.version)))
    withString(data, 'generatedAt', lit(model, resource, P.generatedAt))
    withString(data, 'sourceExtractionId', lit(model, resource, P.sourceExtractionId))
    withString(data, 'sourceLandscapeId', lit(model, resource, P.sourceLandscapeId))
    withString(data, 'sourceLandscapeTitle', lit(model, resource, P.sourceLandscapeTitle))
    withString(data, 'targetLandscapeId', lit(model, resource, P.targetLandscapeId))
    withString(data, 'targetLandscapeTitle', lit(model, resource, P.targetLandscapeTitle))
    withString(data, 'canonicalCurriculumId', lit(model, resource, P.canonicalCurriculumId))
    withString(data, 'stage', lit(model, resource, P.stage))
    withString(data, 'subject', lit(model, resource, P.subject))
    withJson(data, 'status', jsonScalar(lit(model, resource, P.statusJson)))
    withString(data, 'reviewId', lit(model, resource, P.reviewId))
    withJson(data, 'reviewSummary', json(lit(model, resource, P.reviewSummaryJson)))
    mappingFiles[zipPath] = data
  })
  return mappingFiles
}

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
    withString(decision, 'matchType', lit(model, resource, P.matchType))
    withString(decision, 'courseLevelDecision', lit(model, resource, P.courseLevelDecision))
    withString(decision, 'courseLevelRationale', lit(model, resource, P.courseLevelRationale))
    withString(decision, 'reviewedAt', lit(model, resource, P.reviewedAt))
    withString(decision, 'reviewer', lit(model, resource, P.reviewer))
    withJson(decision, 'evidence', json(lit(model, resource, P.evidenceJson)))
    withJson(decision, 'suggestedCanonicalGap', json(lit(model, resource, P.suggestedCanonicalGapJson)))
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
      viewId: lit(model, resource, P.viewId),
      label: lit(model, resource, P.label),
      landscapeId: lit(model, resource, P.landscapeId),
      scope: json(lit(model, resource, P.scopeJson)),
      rootNodes: orderedResources(model, iris(model, resource, P.hasCompositionChild)).map((node) => rebuildViewNode(model, node)),
    }
  })
  return views
}

const reconstructSemantic = (model: RdfModel): SemanticReconstruction => {
  const mappings = reconstructMappings(model)
  const goalVisualizations = reconstructGoalVisualizations(model)
  return {
    landscape: reconstructLandscape(model, goalVisualizations),
    goalVisualizations,
    sourceGoalReferences: reconstructSourceGoalReferences(model) as JsonValue,
    cardDecks: reconstructCardDecks(model) as JsonValue[],
    mappingFiles: reconstructMappingFiles(model),
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

const listZipEntryMetadata = (zipPath: string) => execFileSync('zipinfo', ['-l', zipPath], {
  encoding: 'utf8',
  maxBuffer: ZIP_COMMAND_MAX_BUFFER_BYTES,
  stdio: ['ignore', 'pipe', 'pipe'],
})
  .split(/\r?\n/u)
  .flatMap((line) => {
    const match = line.match(/^([bcdlps-][rwxStTs-]{9})\s+\S+\s+\S+\s+(\d+)\s+\S+\s+\d+\s+\S+\s+\S+\s+\S+\s+(.+)$/u)
    return match ? [{ mode: match[1], uncompressedBytes: Number(match[2]), path: match[3] }] : []
  })

const readZipEntryBuffer = (zipPath: string, entryPath: string) => execFileSync('unzip', ['-p', zipPath, entryPath], {
  maxBuffer: ZIP_COMMAND_MAX_BUFFER_BYTES,
  stdio: ['ignore', 'pipe', 'pipe'],
})

const readZipEntry = (zipPath: string, entryPath: string) => readZipEntryBuffer(zipPath, entryPath).toString('utf8')

const readZipJson = (zipPath: string, entryPath: string) => JSON.parse(readZipEntry(zipPath, entryPath)) as JsonValue

const archiveRootFrom = (entries: string[]) => {
  const roots = new Set(entries.map((entry) => entry.split('/')[0]).filter(Boolean))
  return roots.size === 1 ? [...roots][0] : null
}

const windowsReservedSegment = /^(?:aux|com[1-9]|con|lpt[1-9]|nul|prn)(?:\.|$)/iu
const unsafeWindowsPathCharacter = /[<>:"|?*]/u
const hasUnsafeWindowsPathCharacter = (segment: string) => (
  unsafeWindowsPathCharacter.test(segment)
  || [...segment].some((character) => {
    const codePoint = character.codePointAt(0) ?? 0
    return codePoint <= 0x1f || codePoint === 0x7f
  })
)
const isSafePackagePathSegment = (segment: string) => (
  segment !== ''
  && segment !== '.'
  && segment !== '..'
  && !hasUnsafeWindowsPathCharacter(segment)
  && !windowsReservedSegment.test(segment)
  && !segment.endsWith('.')
  && !segment.endsWith(' ')
)
const isSafeArchiveRootSegment = (value: string) => (
  /^[A-Za-z0-9][A-Za-z0-9._-]*$/u.test(value)
  && isSafePackagePathSegment(value)
)

type ZipEntryMetadata = { mode: string; path: string; uncompressedBytes: number }

const assertSafeRegularZipEntries = (entries: string[], metadata: ZipEntryMetadata[]) => {
  if (new Set(entries).size !== entries.length) {
    throw new Error('ZIP contains duplicate entry names.')
  }
  if (
    metadata.length !== entries.length
    || metadata.some((entry, index) => entry.path !== entries[index])
    || metadata.some((entry) => !entry.mode.startsWith('-'))
  ) {
    throw new Error('ZIP entries must all be regular files with unambiguous metadata.')
  }
  if (metadata.some((entry) => (
    !Number.isSafeInteger(entry.uncompressedBytes)
    || entry.uncompressedBytes < 0
    || entry.uncompressedBytes > MAX_ZIP_ENTRY_UNCOMPRESSED_BYTES
  ))) {
    throw new Error(`ZIP entry exceeds the ${MAX_ZIP_ENTRY_UNCOMPRESSED_BYTES}-byte extraction limit.`)
  }
  const totalUncompressedBytes = metadata.reduce((sum, entry) => sum + entry.uncompressedBytes, 0)
  if (!Number.isSafeInteger(totalUncompressedBytes) || totalUncompressedBytes > MAX_ZIP_TOTAL_UNCOMPRESSED_BYTES) {
    throw new Error(`ZIP exceeds the ${MAX_ZIP_TOTAL_UNCOMPRESSED_BYTES}-byte total extraction limit.`)
  }
  if (entries.some((entry) => entry.startsWith('/') || entry.includes('\\') || !entry.split('/').every(isSafePackagePathSegment))) {
    throw new Error('ZIP contains a non-portable or unsafe entry path.')
  }
  const portableKeys = entries.map((entry) => entry.normalize('NFC').toLowerCase())
  if (new Set(portableKeys).size !== portableKeys.length) {
    throw new Error('ZIP contains case-insensitive or Unicode-normalized path collisions.')
  }
  const portableKeySet = new Set(portableKeys)
  if (portableKeys.some((portableKey) => {
    const segments = portableKey.split('/')
    return segments.slice(1, -1).some((_segment, index) => portableKeySet.has(segments.slice(0, index + 2).join('/')))
  })) {
    throw new Error('ZIP contains a file/child path-prefix collision.')
  }
}

const jsonObject = (value: JsonValue, context: string): Record<string, JsonValue> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Expected JSON object: ${context}`)
  }
  return value
}

const optionalJsonObject = (value: JsonValue | undefined): Record<string, JsonValue> | null => (
  value && typeof value === 'object' && !Array.isArray(value) ? value : null
)

type ExpectedGoalKind =
  | 'area'
  | 'atomic'
  | 'memorization'
  | 'orientation'
  | 'practice-or-assessment'
  | 'program-structure'
  | 'runtime-cluster'
  | 'unscoped-curricular-atomic'

const expectedGoalKinds = (landscape: Record<string, JsonValue>) => {
  const goals = Array.isArray(landscape.goals)
    ? landscape.goals.map((goal) => jsonObject(goal, 'canonical goal'))
    : []
  const kinds = new Map<string, ExpectedGoalKind>()
  goals.forEach((goal) => {
    const id = typeof goal.id === 'string' ? goal.id : null
    if (!id) return
    const title = typeof goal.title === 'string' ? goal.title : ''
    const goalType = typeof goal.type === 'string' ? goal.type : null
    const nodeKind = typeof goal.nodeKind === 'string' ? goal.nodeKind : null
    const tags = stringArray(goal.tags).map((tag) => tag.toLocaleLowerCase('de-DE'))
    const contains = stringArray(goal.contains)
    const hasTag = (tag: string) => tags.includes(tag)
    const hasTagPrefix = (prefix: string) => tags.some((tag) => tag.startsWith(prefix))
    const hasExamData = goal.examData !== undefined && goal.examData !== null
    const kind: ExpectedGoalKind = nodeKind === 'memory' || hasTag('memorization') || hasTagPrefix('srs-deck:')
      ? 'memorization'
      : nodeKind === 'exam'
        || hasExamData
        || hasTag('practice')
        || hasTag('assessment')
        || /^(Übungen|Abiturprüfung|Sek-I-Abschlussaufgaben)\b/u.test(title)
        ? 'practice-or-assessment'
        : hasTag('root')
          || title === 'Mathematik'
          || /^Jahrgangsstufe \d+$/u.test(title)
          || /^(Sekundarstufe [I]{1,3}|E-Phase|Qualifikationsphase)$/u.test(title)
          ? 'program-structure'
          : hasTag('motivation') || hasTag('orientation') || title.startsWith('Warum Mathematik?')
            ? 'orientation'
            : goalType === 'cluster' || contains.length > 0
              ? 'area'
              : 'atomic'
    kinds.set(id, kind)
  })

  let changed = true
  while (changed) {
    changed = false
    goals.forEach((goal) => {
      const id = typeof goal.id === 'string' ? goal.id : null
      const children = stringArray(goal.contains)
      if (!id || children.length === 0 || kinds.get(id) !== 'area') return
      if (children.every((childId) => !['area', 'atomic'].includes(kinds.get(childId) ?? ''))) {
        kinds.set(id, 'runtime-cluster')
        changed = true
      }
    })
  }
  const childrenOfAreas = new Set<string>()
  goals.forEach((goal) => {
    const id = typeof goal.id === 'string' ? goal.id : null
    if (id && kinds.get(id) === 'area') {
      stringArray(goal.contains).forEach((childId) => childrenOfAreas.add(childId))
    }
  })
  kinds.forEach((kind, id) => {
    if (kind === 'atomic' && !childrenOfAreas.has(id)) kinds.set(id, 'unscoped-curricular-atomic')
  })
  return kinds
}

const stringArray = (value: JsonValue | undefined) => Array.isArray(value)
  ? value.filter((item): item is string => typeof item === 'string')
  : []

const expectedGoalGraphKinds = (landscape: Record<string, JsonValue>) => new Map<string, 'atomic' | 'cluster'>(
  (Array.isArray(landscape.goals) ? landscape.goals : []).flatMap((goalValue) => {
    const goal = jsonObject(goalValue, 'canonical goal')
    return typeof goal.id === 'string'
      ? [[goal.id, goal.type === 'cluster' || stringArray(goal.contains).length > 0 ? 'cluster' : 'atomic'] as const]
      : []
  }),
)

const validateCoreAxisProjection = (model: RdfModel, landscape: Record<string, JsonValue>) => {
  const issues: string[] = []
  const expectedRoles = new Set<string>()
  const expectedProcessIds = new Set<string>()
  const expectedGuidingIdeaIds = new Set<string>()
  const expectedProcessTitles = new Map<string, string>()
  const goalKinds = expectedGoalKinds(landscape)
  const goals = Array.isArray(landscape.goals) ? landscape.goals.map((goal) => jsonObject(goal, 'canonical goal')) : []
  const competencyCatalog = Array.isArray(landscape.competencyCatalog)
    ? landscape.competencyCatalog.map((entry) => jsonObject(entry, 'competency catalog entry'))
    : []
  competencyCatalog.forEach((entry) => {
    if (typeof entry.id === 'string') {
      expectedProcessIds.add(entry.id)
      if (typeof entry.label === 'string') expectedProcessTitles.set(entry.id, entry.label)
    }
  })
  const roleKey = (goalId: string, role: string, axisId: string) => `${goalId}\u0000${role}\u0000${axisId}`

  goals.forEach((goal) => {
    if (typeof goal.id !== 'string' || !['area', 'atomic'].includes(goalKinds.get(goal.id) ?? '')) return
    ;[...new Set([...stringArray(goal.kompetenzen), ...stringArray(goal.competencyRefs)])].forEach((competencyId) => {
      const normalizedId = /^K[1-6](?:\.\d+)?$/u.test(competencyId) ? `PROCESS.${competencyId}` : competencyId
      expectedRoles.add(roleKey(goal.id as string, REFERENCE_ROLE_COMPETENCY_REFS, normalizedId))
    })
    const dimensionTags = optionalJsonObject(goal.dimensionTags)
    stringArray(dimensionTags?.processCompetencies).filter((code) => /^K[1-6](?:\.\d+)?$/u.test(code)).forEach((code) => {
      const axisId = `PROCESS.${code}`
      expectedProcessIds.add(axisId)
      if (!expectedProcessTitles.has(axisId)) expectedProcessTitles.set(axisId, code)
      expectedRoles.add(roleKey(goal.id as string, REFERENCE_ROLE_PROCESS_COMPETENCIES, axisId))
    })
    stringArray(dimensionTags?.guidingIdeas).filter((code) => /^L[1-5]$/u.test(code)).forEach((code) => {
      const axisId = `GUIDING.${code}`
      expectedGuidingIdeaIds.add(axisId)
      expectedRoles.add(roleKey(goal.id as string, REFERENCE_ROLE_GUIDING_IDEAS, axisId))
    })
  })

  const actualProcessPairs = resourcesOfType(model, LP_PROCESS_COMPETENCY_AREA)
    .map((resource) => [skillpilotId(model, resource), resource] as const)
  const actualGuidingPairs = resourcesOfType(model, LP_GUIDING_IDEA)
    .map((resource) => [skillpilotId(model, resource), resource] as const)
  const actualProcessResources = new Map(actualProcessPairs)
  const actualGuidingResources = new Map(actualGuidingPairs)
  if (actualProcessResources.size !== actualProcessPairs.length) issues.push('duplicate process-axis skillpilotId')
  if (actualGuidingResources.size !== actualGuidingPairs.length) issues.push('duplicate guiding-idea skillpilotId')
  ;[
    ...[...expectedProcessIds].filter((id) => !actualProcessResources.has(id)).map((id) => `missing process-axis resource ${id}`),
    ...[...actualProcessResources.keys()].filter((id) => !expectedProcessIds.has(id)).map((id) => `unexpected process-axis resource ${id}`),
    ...[...expectedGuidingIdeaIds].filter((id) => !actualGuidingResources.has(id)).map((id) => `missing guiding-idea resource ${id}`),
    ...[...actualGuidingResources.keys()].filter((id) => !expectedGuidingIdeaIds.has(id)).map((id) => `unexpected guiding-idea resource ${id}`),
  ].forEach((issue) => issues.push(issue))
  ;[...actualProcessResources, ...actualGuidingResources].forEach(([id, resource]) => {
    const explicitIds = literalObjects(model, resource, P.skillpilotId)
    if (explicitIds.length !== 1 || explicitIds[0].value !== id) {
      issues.push(`${id}: axis resource must have exactly one explicit skillpilotId`)
    }
    const subjects = iris(model, resource, LP_HAS_SCHOOL_SUBJECT)
    if (subjects.length !== 1 || subjects[0] !== KIM_MATHEMATICS) {
      issues.push(`${id}: axis resource must have exactly the mathematics subject`)
    }
  })
  actualProcessResources.forEach((resource, id) => {
    const code = id.replace(/^PROCESS\./u, '')
    const expectedTitle = expectedProcessTitles.get(id)
    if (coreNumber(model, resource) !== code || iris(model, resource, LP_HAS_NUMBER).length !== 1) {
      issues.push(`${id}: process axis must have exactly the Core number ${code}`)
    }
    if (
      !expectedTitle
      || coreText(model, resource, LP_HAS_TITLE, 'de') !== expectedTitle
      || localizedLit(model, resource, P.label, 'de') !== expectedTitle
      || iris(model, resource, LP_HAS_TITLE).length !== 1
    ) {
      issues.push(`${id}: process axis title/label does not match ${String(expectedTitle)}`)
    }
  })
  actualGuidingResources.forEach((resource, id) => {
    const code = id.replace(/^GUIDING\./u, '')
    const expectedTitle = `Leitidee ${code}`
    if (coreNumber(model, resource) !== code || iris(model, resource, LP_HAS_NUMBER).length !== 1) {
      issues.push(`${id}: guiding idea must have exactly the Core number ${code}`)
    }
    if (
      coreText(model, resource, LP_HAS_TITLE, 'de') !== expectedTitle
      || localizedLit(model, resource, P.label, 'de') !== expectedTitle
      || iris(model, resource, LP_HAS_TITLE).length !== 1
    ) {
      issues.push(`${id}: guiding-idea title/label does not match ${expectedTitle}`)
    }
  })
  const expectedHierarchy = new Set([...expectedProcessIds].flatMap((id) => {
    const childCode = id.match(/^PROCESS\.(K[1-6])\./u)
    return childCode ? [`PROCESS.${childCode[1]}\u0000${id}`] : []
  }))
  const processIdByResource = new Map([...actualProcessResources].map(([id, resource]) => [resource, id]))
  const actualHierarchy = new Set<string>()
  actualProcessResources.forEach((source, sourceId) => {
    iris(model, source, P.hasPart).forEach((target) => {
      const targetId = processIdByResource.get(target)
      if (targetId) actualHierarchy.add(`${sourceId}\u0000${targetId}`)
      else issues.push(`${sourceId}: unexpected BFO axis child ${skillpilotId(model, target)}`)
    })
  })
  actualGuidingResources.forEach((source, sourceId) => {
    iris(model, source, P.hasPart).forEach((target) => {
      issues.push(`${sourceId}: unexpected BFO axis child ${skillpilotId(model, target)}`)
    })
  })
  ;[...actualProcessResources, ...actualGuidingResources].forEach(([id, resource]) => {
    iris(model, resource, P.partOf).forEach((target) => {
      issues.push(`${id}: unexpected direct BFO part-of assertion to ${skillpilotId(model, target)}`)
    })
  })
  ;[
    ...[...expectedHierarchy].filter((key) => !actualHierarchy.has(key)).map((key) => `missing process hierarchy ${key.replace('\u0000', ' -> ')}`),
    ...[...actualHierarchy].filter((key) => !expectedHierarchy.has(key)).map((key) => `unexpected process hierarchy ${key.replace('\u0000', ' -> ')}`),
  ].forEach((issue) => issues.push(issue))

  const axisResources = new Set([...actualProcessResources.values(), ...actualGuidingResources.values()])
  model.iris.forEach((predicateMap, reference) => {
    if (!(predicateMap.get(P.refersTo) ?? []).some((target) => axisResources.has(target))) return
    if (lits(model, reference, P.referenceRole).length === 0) {
      issues.push(`${idFromResource(reference)}: Core axis reference is missing a reconstruction role`)
    }
  })

  const actualRoleReferences = new Map<string, Set<string>>()
  model.literals.forEach((predicateMap, reference) => {
    const roles = (predicateMap.get(P.referenceRole) ?? []).map((value) => value.value)
    if (roles.length === 0) return
    if (new Set(roles).size !== roles.length) issues.push(`${idFromResource(reference)}: duplicate reconstruction role literal`)
    const sources = resourcesLinkingTo(model, reference, [P.hasReference])
    const targets = iris(model, reference, P.refersTo)
    if (!resourceHasType(model, reference, LP_REFERENCE) || sources.length !== 1 || targets.length !== 1) {
      issues.push(`${idFromResource(reference)}: axis reference must have one Core source and target`)
      return
    }
    const goalId = skillpilotId(model, sources[0])
    const axisId = skillpilotId(model, targets[0])
    if (!resourceHasType(model, sources[0], T.learningGoal) || !isCurricularGoal(model, sources[0])) {
      issues.push(`${goalId} -> ${axisId}: axis source is not a curricular learning goal`)
    }
    roles.forEach((role) => {
      if (![REFERENCE_ROLE_COMPETENCY_REFS, REFERENCE_ROLE_PROCESS_COMPETENCIES, REFERENCE_ROLE_GUIDING_IDEAS].includes(role)) {
        issues.push(`${goalId} -> ${axisId}: unsupported reference role ${role}`)
        return
      }
      if (role === REFERENCE_ROLE_PROCESS_COMPETENCIES && !resourceHasType(model, targets[0], LP_PROCESS_COMPETENCY_AREA)) {
        issues.push(`${goalId} -> ${axisId}: process role target has the wrong Core type`)
      }
      if (role === REFERENCE_ROLE_GUIDING_IDEAS && !resourceHasType(model, targets[0], LP_GUIDING_IDEA)) {
        issues.push(`${goalId} -> ${axisId}: guiding-idea role target has the wrong Core type`)
      }
      if (role === REFERENCE_ROLE_COMPETENCY_REFS && !resourceHasType(model, targets[0], T.competencyCatalogEntry)) {
        issues.push(`${goalId} -> ${axisId}: authored competency role target is not a catalog entry`)
      }
      const key = roleKey(goalId, role, axisId)
      const references = actualRoleReferences.get(key) ?? new Set<string>()
      references.add(reference)
      actualRoleReferences.set(key, references)
    })
  })
  actualRoleReferences.forEach((references, key) => {
    if (references.size !== 1) issues.push(`axis role is encoded by ${references.size} references: ${key.replaceAll('\u0000', ' | ')}`)
  })
  const actualRoles = new Set(actualRoleReferences.keys())
  ;[
    ...[...expectedRoles].filter((key) => !actualRoles.has(key)).map((key) => `missing axis role ${key.replaceAll('\u0000', ' | ')}`),
    ...[...actualRoles].filter((key) => !expectedRoles.has(key)).map((key) => `unexpected axis role ${key.replaceAll('\u0000', ' | ')}`),
  ].forEach((issue) => issues.push(issue))

  return {
    issues,
    processEntries: actualProcessResources.size,
    guidingIdeaEntries: actualGuidingResources.size,
    referenceRoles: actualRoles.size,
  }
}

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

const stableValue = (value: JsonValue | undefined): JsonValue => {
  if (value === undefined) {
    return null
  }
  if (Array.isArray(value)) {
    return value.map((item) => stableValue(item))
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, entryValue]) => entryValue !== undefined && entryValue !== null)
        .sort(([left], [right]) => compareCodeUnits(left, right))
        .map(([key, entryValue]) => [key, stableValue(entryValue)]),
    )
  }
  return value
}

const normalize = (value: JsonValue | undefined) => JSON.stringify(stableValue(value))

const asMap = <TValue>(items: TValue[], key: (item: TValue) => string) => new Map(items.map((item) => [key(item), item]))

const normalizeRecordSet = (items: JsonValue[]) => JSON.stringify(items.map((item) => normalize(item)).sort(compareCodeUnits))

const normalizedStringArray = (value: JsonValue | undefined) => stringArray(value).sort(compareCodeUnits)

const compareJsonField = (
  issues: string[],
  label: string,
  original: JsonValue | undefined,
  reconstructed: JsonValue | undefined,
) => {
  if (normalize(original) !== normalize(reconstructed)) {
    issues.push(label)
  }
}

const compareStringSetField = (
  issues: string[],
  label: string,
  original: JsonValue | undefined,
  reconstructed: JsonValue | undefined,
) => {
  if (normalize(normalizedStringArray(original) as JsonValue) !== normalize(normalizedStringArray(reconstructed) as JsonValue)) {
    issues.push(label)
  }
}

const check = (checks: CheckResult[], id: string, passed: boolean, details: string) => {
  checks.push({ id, passed, details })
}

const sha256 = (content: Buffer) => createHash('sha256').update(content).digest('hex')

const sha256File = (filePath: string) => execFileSync('sha256sum', [filePath], {
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'pipe'],
  maxBuffer: 1024 * 1024,
}).trim().split(/\s+/u)[0]

const visualizationKey = (goalId: JsonValue | null | undefined, order: JsonValue | null | undefined) => `${String(goalId)}#${String(order)}`

const isGoalVisualizationLink = (value: JsonValue) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  return value.type === 'goal-visualization' && value.resourceType === 'image'
}

const visualizationLinkFromRecord = (record: GoalVisualizationRecord): JsonValue => stableValue({
  type: 'goal-visualization',
  resourceType: 'image',
  role: record.role,
  skillpilotId: record.skillpilotId,
  title: record.title,
  url: record.publicUrl,
  provider: record.provider,
  description: record.description,
  altText: record.altText,
  lang: record.lang,
  license: record.license,
  reviewStatus: record.reviewStatus,
} as unknown as JsonValue)

const visualizationIndexAssetFromRecord = (record: GoalVisualizationRecord): JsonValue => stableValue({
  goalId: record.goalId,
  order: record.order,
  packagePath: record.packagePath,
  publicUrl: record.publicUrl,
  mediaType: record.mediaType,
  bytes: record.bytes,
  sha256: record.sha256,
  skillpilotId: record.skillpilotId,
  role: record.role,
  title: record.title,
  provider: record.provider,
  description: record.description,
  altText: record.altText,
  lang: record.lang,
  license: record.license,
  reviewStatus: record.reviewStatus,
} as unknown as JsonValue)

const resolveSafeRelativePath = (baseDir: string, packagePath: string) => {
  if (
    packagePath.length === 0
    || packagePath.startsWith('/')
    || packagePath.includes('\\')
    || !packagePath.split('/').every(isSafePackagePathSegment)
  ) {
    return null
  }
  const absolutePath = resolve(baseDir, packagePath)
  const relativePath = relative(baseDir, absolutePath)
  return relativePath !== '' && !relativePath.startsWith('..') && !isAbsolute(relativePath)
    ? absolutePath
    : null
}

const bulkExtractZipEntries = (zipPath: string, entryPaths: string[], outputRoot: string) => {
  const uniquePaths = [...new Set(entryPaths)].sort(compareCodeUnits)
  if (uniquePaths.some((entryPath) => (
    entryPath.startsWith('/')
    || entryPath.includes('\\')
    || !entryPath.split('/').every(isSafePackagePathSegment)
  ))) {
    throw new Error('Refusing to bulk-extract an unsafe ZIP entry path.')
  }
  rmSync(outputRoot, { recursive: true, force: true })
  mkdirSync(outputRoot, { recursive: true })
  if (uniquePaths.length > 0) {
    chunkArgumentsByBytes(uniquePaths.map((entryPath) => entryPath.replaceAll('[', '[[]'))).forEach((literalZipPatterns) => {
      execFileSync('unzip', ['-qq', '-o', zipPath, ...literalZipPatterns, '-d', outputRoot], {
        stdio: ['ignore', 'ignore', 'pipe'],
        maxBuffer: ZIP_COMMAND_MAX_BUFFER_BYTES,
      })
    })
  }
}

const writeIndependentFile = (target: string, content: Buffer) => {
  mkdirSync(dirname(target), { recursive: true })
  rmSync(target, { force: true })
  writeFileSync(target, content)
}

const validateSemanticReconstruction = (params: {
  zipPath: string
  rdfPath: string
  outDir: string
  model: RdfModel
  reconstruction: SemanticReconstruction
  initialRdfSha256: string
  initialZipSha256: string
}) => {
  const checks: CheckResult[] = []
  const boundInputs = new Map<string, BoundInputArtifact>()
  const trackBoundInput = (label: string, path: string, digest = sha256File(path)) => {
    boundInputs.set(label, { path: repoRelative(path), sha256: digest })
    return digest
  }
  const comparisonZipSha256 = trackBoundInput('comparisonZip', params.zipPath, params.initialZipSha256)
  trackBoundInput('rdf', params.rdfPath, params.initialRdfSha256)
  const entries = listZipEntries(params.zipPath)
  const zipEntryMetadata = listZipEntryMetadata(params.zipPath)
  assertSafeRegularZipEntries(entries, zipEntryMetadata)
  const zipMetadataByPath = new Map(zipEntryMetadata.map((entry) => [entry.path, entry]))
  const archiveRoot = archiveRootFrom(entries)
  if (!archiveRoot || !isSafeArchiveRootSegment(archiveRoot)) {
    throw new Error('ZIP does not contain exactly one archive root.')
  }

  const bindingIssues: string[] = []
  const slimManifestPath = resolve(dirname(params.rdfPath), 'manifest.json')
  let slimManifest: Record<string, JsonValue> | null = null
  let boundOntology: { ontologyIri: string | null; commit: string | null; corePath: string | null } | null = null
  if (existsSync(slimManifestPath)) {
    if (!lstatSync(slimManifestPath).isFile()) throw new Error(`Slim manifest is not a regular file: ${repoRelative(slimManifestPath)}`)
    const slimManifestBytes = readFileSync(slimManifestPath)
    trackBoundInput('manifest', slimManifestPath, sha256(slimManifestBytes))
    slimManifest = jsonObject(JSON.parse(slimManifestBytes.toString('utf8')) as JsonValue, 'slim manifest')
    const fwuOntology = jsonObject(slimManifest.fwuOntology, 'slim manifest fwuOntology')
    const manifestCommit = typeof fwuOntology.commit === 'string' ? fwuOntology.commit : null
    const manifestCorePath = typeof fwuOntology.corePath === 'string' ? fwuOntology.corePath : null
    boundOntology = {
      ontologyIri: typeof fwuOntology.ontologyIri === 'string' ? fwuOntology.ontologyIri : null,
      commit: manifestCommit,
      corePath: manifestCorePath,
    }
    if (!manifestCommit || !/^[a-f0-9]{40}(?:[a-f0-9]{24})?$/u.test(manifestCommit)) {
      bindingIssues.push('manifest does not contain a valid FWU ontology commit hash')
    }
    const absoluteManifestCorePath = manifestCorePath ? resolve(repoRoot, manifestCorePath) : null
    if (
      !manifestCorePath
      || manifestCorePath !== manifestCorePath.trim()
      || manifestCorePath.includes('\\')
      || !absoluteManifestCorePath
      || !isInsideRepo(absoluteManifestCorePath)
      || repoRelative(absoluteManifestCorePath) !== manifestCorePath
    ) {
      bindingIssues.push('manifest does not contain a canonical repository-relative FWU Core source path')
    }
    const rdfFiles = Array.isArray(slimManifest.files)
      ? slimManifest.files.map((file) => jsonObject(file, 'slim manifest RDF file'))
      : []
    const bundleRecord = rdfFiles.find((file) => file.name === 'bundle.nt')
    const slimDir = dirname(params.rdfPath)
    const checkArtifact = (
      label: string,
      recordedPath: JsonValue | undefined,
      recordedSha: JsonValue | undefined,
      expectedPath: string,
    ) => {
      if (typeof recordedPath !== 'string' || typeof recordedSha !== 'string' || !/^[a-f0-9]{64}$/u.test(recordedSha)) {
        bindingIssues.push(`${label}: missing path or SHA-256`)
        return
      }
      const absolutePath = resolve(repoRoot, recordedPath)
      if (absolutePath !== resolve(expectedPath)) {
        bindingIssues.push(`${label}: recorded path does not identify the expected co-located artifact`)
        return
      }
      if (!isInsideRepo(absolutePath) || !existsSync(absolutePath) || !lstatSync(absolutePath).isFile()) {
        bindingIssues.push(`${label}: recorded artifact is missing or unsafe`)
        return
      }
      const actualSha = sha256File(absolutePath)
      trackBoundInput(label, absolutePath, actualSha)
      if (actualSha !== recordedSha) bindingIssues.push(`${label}: ${actualSha} != ${recordedSha}`)
    }
    const expectedRdfNames = ['declarations.nt', 'landscape.nt', 'views.nt', 'mappings.nt', 'sources.nt', 'cards.nt', 'assets.nt', 'bundle.nt']
    const rdfNames = rdfFiles.map((file) => file.name).filter((name): name is string => typeof name === 'string')
    if (new Set(rdfNames).size !== rdfNames.length || normalize(rdfNames.sort(compareCodeUnits) as JsonValue) !== normalize([...expectedRdfNames].sort(compareCodeUnits) as JsonValue)) {
      bindingIssues.push('manifest RDF file set is duplicate, incomplete, or unexpected')
    }
    rdfFiles.forEach((file) => {
      if (typeof file.name !== 'string') {
        bindingIssues.push('manifest RDF file is missing its name')
        return
      }
      checkArtifact(`RDF ${file.name}`, file.path, file.sha256, resolve(slimDir, file.name))
    })
    checkArtifact('bundle input', bundleRecord?.path, bundleRecord?.sha256, params.rdfPath)
    checkArtifact('profile', slimManifest.profile, fwuOntology.profileSha256, resolve(slimDir, 'skillpilot-mem-fwu-profile.ttl'))
    checkArtifact('catalog', fwuOntology.catalogPath, fwuOntology.catalogSha256, resolve(slimDir, 'catalog-v001.xml'))
    checkArtifact('bound core', fwuOntology.bundledCorePath, fwuOntology.bundledCoreSha256, resolve(slimDir, 'ontology/lehrplan-core.owl'))
    if (typeof slimManifest.inputZip !== 'string' || resolve(repoRoot, slimManifest.inputZip) !== resolve(params.zipPath)) {
      bindingIssues.push('manifest inputZip path does not identify the comparison ZIP')
    }
    if (typeof slimManifest.bundle !== 'string' || resolve(repoRoot, slimManifest.bundle) !== resolve(params.rdfPath)) {
      bindingIssues.push('manifest bundle path does not identify the selected RDF input')
    }
    if (slimManifest.archiveRoot !== archiveRoot) bindingIssues.push('manifest archiveRoot does not match the ZIP')
    if (slimManifest.inputZipSha256 !== comparisonZipSha256) bindingIssues.push('manifest input ZIP SHA-256 does not match')
    if (fwuOntology.ontologyIri !== LP_CORE_ONTOLOGY || fwuOntology.profileImport !== LP_CORE_ONTOLOGY) {
      bindingIssues.push('manifest does not bind the canonical FWU Core IRI')
    }
    const packageResources = resourcesOfType(params.model, T.skillPilotPackage)
    if (packageResources.length !== 1) {
      bindingIssues.push(`expected one package resource, found ${packageResources.length}`)
    } else {
      const packageResource = packageResources[0]
      if (!iris(params.model, packageResource, P.fwuOntologyIri).includes(LP_CORE_ONTOLOGY)) {
        bindingIssues.push('RDF package does not reference the canonical FWU Core IRI')
      }
      const rdfCommit = lit(params.model, packageResource, P.fwuOntologyCommit)
      if (!rdfCommit || rdfCommit !== manifestCommit) {
        bindingIssues.push('RDF/package manifest FWU commit mismatch')
      }
      const rdfCorePath = lit(params.model, packageResource, P.fwuOntologyCorePath)
      if (!rdfCorePath || rdfCorePath !== manifestCorePath) {
        bindingIssues.push('RDF/package manifest FWU Core path mismatch')
      }
    }
  } else if (isSelfContainedCoreFirstBundle(params.model) || params.model.hasReferenceRoles) {
    bindingIssues.push('current role-based bundle is missing slim/manifest.json')
  }
  check(
    checks,
    'semantic-slim-manifest-and-core-binding',
    bindingIssues.length === 0,
    bindingIssues.slice(0, 10).join(' | ') || (existsSync(slimManifestPath) ? 'manifest paths, hashes, Core IRI, and commit are bound' : 'legacy bundle without a slim manifest'),
  )

  const canonicalOriginal = jsonObject(readZipJson(params.zipPath, canonicalLandscapeEntry(entries, archiveRoot)), 'canonical landscape')
  const reconstructedLandscape = params.reconstruction.landscape as unknown as Record<string, JsonValue>
  const landscapeMetadataIssues: string[] = []
  ;[
    'landscapeId',
    'locale',
    'country',
    'region',
    'schoolType',
    'subject',
    'frameworkId',
    'title',
    'titleEn',
    'description',
    'descriptionEn',
    'filters',
  ].forEach((field) => {
    compareJsonField(landscapeMetadataIssues, field, canonicalOriginal[field], reconstructedLandscape[field])
  })
  check(checks, 'semantic-landscape-metadata-match', landscapeMetadataIssues.length === 0, landscapeMetadataIssues.slice(0, 10).join(', ') || 'ok')

  const originalCompetencies = Array.isArray(canonicalOriginal.competencyCatalog) ? canonicalOriginal.competencyCatalog as JsonValue[] : []
  check(
    checks,
    'semantic-competency-catalog-match',
    normalizeRecordSet(originalCompetencies) === normalizeRecordSet(params.reconstruction.landscape.competencyCatalog),
    `${params.reconstruction.landscape.competencyCatalog.length}/${originalCompetencies.length} competency catalog entr${originalCompetencies.length === 1 ? 'y' : 'ies'}`,
  )

  const originalProgramUnits = Array.isArray(canonicalOriginal.programUnits) ? canonicalOriginal.programUnits as JsonValue[] : []
  check(
    checks,
    'semantic-program-units-match',
    normalizeRecordSet(originalProgramUnits) === normalizeRecordSet(params.reconstruction.landscape.programUnits),
    `${params.reconstruction.landscape.programUnits.length}/${originalProgramUnits.length} program unit(s)`,
  )

  const originalGoalPlacements = Array.isArray(canonicalOriginal.goalPlacements) ? canonicalOriginal.goalPlacements as JsonValue[] : []
  check(
    checks,
    'semantic-goal-placements-match',
    normalizeRecordSet(originalGoalPlacements) === normalizeRecordSet(params.reconstruction.landscape.goalPlacements),
    `${params.reconstruction.landscape.goalPlacements.length}/${originalGoalPlacements.length} goal placement(s)`,
  )

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
    ;[
      'shortKey',
      'title',
      'titleEn',
      'description',
      'descriptionEn',
      'phase',
      'area',
      'level',
      'courseLevel',
      'sourceRef',
      'core',
      'weight',
      'semanticAtomic',
      'type',
      'nodeKind',
      'applicability',
      'metadata',
      'dimensionTags',
      'resourceLinks',
      'extendedData',
      'release',
      'examData',
    ].forEach((field) => {
      compareJsonField(issues, `${String(goal.id)}.${field}`, goal[field], reconstructed[field])
    })
    ;['tags', 'examples', 'competencyRefs', 'contains', 'requires'].forEach((field) => {
      compareStringSetField(issues, `${String(goal.id)}.${field}`, goal[field], reconstructed[field])
    })
    return issues
  })
  check(checks, 'semantic-goals-count-and-ids', missingGoals.length === 0 && originalGoals.length === reconstructedGoals.length, `${reconstructedGoals.length}/${originalGoals.length} goal(s); missing ${missingGoals.length}`)
  check(checks, 'semantic-goal-fields-match', changedGoalFields.length === 0, changedGoalFields.slice(0, 10).join(', ') || 'ok')

  const referenceStructure = validateReferenceStructure(params.model)
  const coreFirstStructure = validateCoreFirstStructure(
    params.model,
    expectedGoalKinds(canonicalOriginal),
    expectedGoalGraphKinds(canonicalOriginal),
  )
  const coreAxisProjection = validateCoreAxisProjection(params.model, canonicalOriginal)
  check(
    checks,
    'semantic-core-prerequisite-reference-structure',
    referenceStructure.prerequisiteIssues.length === 0,
    referenceStructure.prerequisiteIssues.slice(0, 10).join(' | ') || 'all prerequisite relations are structurally valid',
  )
  check(
    checks,
    'semantic-core-competency-reference-structure',
    referenceStructure.competencyIssues.length === 0,
    referenceStructure.competencyIssues.slice(0, 10).join(' | ') || 'all competency relations are structurally valid',
  )
  check(
    checks,
    'semantic-goal-visualization-reference-structure',
    referenceStructure.visualizationIssues.length === 0,
    referenceStructure.visualizationIssues.slice(0, 10).join(' | ') || 'all visualization relations are structurally valid',
  )
  check(
    checks,
    'semantic-core-goal-modeling',
    coreFirstStructure.goalIssues.length === 0,
    coreFirstStructure.goalIssues.slice(0, 10).join(' | ') || 'curricular goal types, subjects, texts, and BFO edges are valid',
  )
  check(
    checks,
    'semantic-core-competency-catalog',
    coreFirstStructure.competencyIssues.length === 0,
    coreFirstStructure.competencyIssues.slice(0, 10).join(' | ') || 'process competency catalog uses the FWU core',
  )
  check(
    checks,
    'semantic-core-dimension-axis-projection',
    coreAxisProjection.issues.length === 0,
    coreAxisProjection.issues.slice(0, 10).join(' | ')
      || `${coreAxisProjection.processEntries} process axes, ${coreAxisProjection.guidingIdeaEntries} guiding ideas, ${coreAxisProjection.referenceRoles} exact reference role(s)`,
  )
  check(
    checks,
    'semantic-core-program-metadata',
    coreFirstStructure.programIssues.length === 0,
    coreFirstStructure.programIssues.slice(0, 10).join(' | ') || 'program grades, stages, and unit hierarchy use the FWU core',
  )
  check(
    checks,
    'semantic-core-source-jurisdictions',
    coreFirstStructure.sourceIssues.length === 0,
    coreFirstStructure.sourceIssues.slice(0, 10).join(' | ') || 'source collections use FWU federal-state individuals',
  )
  check(
    checks,
    'semantic-owl-safe-literals-and-declarations',
    coreFirstStructure.owlSafetyIssues.length === 0,
    coreFirstStructure.owlSafetyIssues.slice(0, 10).join(' | ') || 'all RDF terms are declared and literals are OWL/XML safe',
  )

  const canonicalVisualizations = originalGoals.flatMap((goal) => {
    const resourceLinks = Array.isArray(goal.resourceLinks) ? goal.resourceLinks : []
    return resourceLinks.flatMap((link, order) => isGoalVisualizationLink(link)
      ? [{ goalId: String(goal.id), order, link }]
      : [])
  })
  const visualizationIndexPath = packageEntryPath(archiveRoot, 'data/resources/goal-visualizations.json')
  const visualizationIndexPresent = entries.includes(visualizationIndexPath)
  const visualizationIndex = visualizationIndexPresent
    ? jsonObject(readZipJson(params.zipPath, visualizationIndexPath), 'goal visualization resource index')
    : null
  const visualizationIndexAssets = visualizationIndex && Array.isArray(visualizationIndex.assets)
    ? visualizationIndex.assets.map((asset) => jsonObject(asset, 'goal visualization index asset'))
    : []
  const rdfVisualizations = params.reconstruction.goalVisualizations
  const visualizationLaneActive = canonicalVisualizations.length > 0
    || rdfVisualizations.length > 0
    || visualizationIndexPresent

  const structureIssues = rdfVisualizations.flatMap((record) => record.structureIssues
    .map((issue) => `${visualizationKey(record.goalId, record.order)}: ${issue}`))
  check(
    checks,
    'semantic-goal-visualization-rdf-structure',
    structureIssues.length === 0,
    structureIssues.slice(0, 10).join(' | ') || `${rdfVisualizations.length} explicit visualization reference(s)`,
  )

  const canonicalKeys = canonicalVisualizations.map((entry) => visualizationKey(entry.goalId, entry.order))
  const rdfKeys = rdfVisualizations.map((entry) => visualizationKey(entry.goalId, entry.order))
  const duplicateCanonicalKeys = canonicalKeys.filter((key, index) => canonicalKeys.indexOf(key) !== index)
  const duplicateRdfKeys = rdfKeys.filter((key, index) => rdfKeys.indexOf(key) !== index)
  const rdfPaths = rdfVisualizations.map((entry) => entry.packagePath).filter((path): path is string => path !== null)
  const duplicateRdfPaths = rdfPaths.filter((path, index) => rdfPaths.indexOf(path) !== index)
  const rdfByKey = asMap(rdfVisualizations, (record) => visualizationKey(record.goalId, record.order))
  const canonicalMetadataIssues = canonicalVisualizations.flatMap((entry) => {
    const reconstructed = rdfByKey.get(visualizationKey(entry.goalId, entry.order))
    if (!reconstructed) return [`missing RDF reference ${visualizationKey(entry.goalId, entry.order)}`]
    return normalize(entry.link) === normalize(visualizationLinkFromRecord(reconstructed))
      ? []
      : [`changed RDF metadata ${visualizationKey(entry.goalId, entry.order)}`]
  })
  check(
    checks,
    'semantic-goal-visualization-metadata-match',
    canonicalMetadataIssues.length === 0
      && duplicateCanonicalKeys.length === 0
      && duplicateRdfKeys.length === 0
      && duplicateRdfPaths.length === 0
      && canonicalVisualizations.length === rdfVisualizations.length,
    [...duplicateCanonicalKeys.map((key) => `duplicate canonical ${key}`),
      ...duplicateRdfKeys.map((key) => `duplicate RDF ${key}`),
      ...duplicateRdfPaths.map((path) => `duplicate RDF path ${path}`),
      ...canonicalMetadataIssues]
      .slice(0, 10).join(' | ')
      || `${rdfVisualizations.length}/${canonicalVisualizations.length} visualization metadata record(s)`,
  )

  const indexKeys = visualizationIndexAssets.map((asset) => visualizationKey(asset.goalId, asset.order))
  const duplicateIndexKeys = indexKeys.filter((key, index) => indexKeys.indexOf(key) !== index)
  const indexPaths = visualizationIndexAssets
    .map((asset) => asset.packagePath)
    .filter((path): path is string => typeof path === 'string')
  const duplicateIndexPaths = indexPaths.filter((path, index) => indexPaths.indexOf(path) !== index)
  const indexByKey = asMap(visualizationIndexAssets, (asset) => visualizationKey(asset.goalId, asset.order))
  const indexIssues: string[] = []
  if (visualizationLaneActive && !visualizationIndexPresent) {
    indexIssues.push(`missing ${visualizationIndexPath}`)
  }
  if (visualizationIndexPresent && visualizationIndex?.schemaVersion !== 1) {
    indexIssues.push(`unexpected resource index schemaVersion ${String(visualizationIndex?.schemaVersion)}`)
  }
  if (visualizationIndexPresent && !Array.isArray(visualizationIndex?.assets)) {
    indexIssues.push('resource index does not contain an assets array')
  }
  rdfVisualizations.forEach((record) => {
    const key = visualizationKey(record.goalId, record.order)
    const indexed = indexByKey.get(key)
    if (!indexed) {
      indexIssues.push(`missing index asset ${key}`)
      return
    }
    if (normalize(indexed as JsonValue) !== normalize(visualizationIndexAssetFromRecord(record))) {
      indexIssues.push(`changed index asset ${key}`)
    }
  })
  check(
    checks,
    'semantic-goal-visualization-resource-index-match',
    indexIssues.length === 0
      && duplicateIndexKeys.length === 0
      && duplicateIndexPaths.length === 0
      && visualizationIndexAssets.length === rdfVisualizations.length,
    [...duplicateIndexKeys.map((key) => `duplicate index ${key}`),
      ...duplicateIndexPaths.map((path) => `duplicate index path ${path}`),
      ...indexIssues]
      .slice(0, 10).join(' | ')
      || `${visualizationIndexAssets.length}/${rdfVisualizations.length} indexed visualization asset(s)`,
  )

  const sidecarRoot = dirname(params.rdfPath)
  const slimManifestAssetIssues: string[] = []
  const slimManifestAssets = slimManifest && Array.isArray(slimManifest.assets)
    ? slimManifest.assets.map((asset) => jsonObject(asset, 'slim manifest visualization asset'))
    : []
  if (slimManifest && !Array.isArray(slimManifest.assets)) {
    slimManifestAssetIssues.push('slim manifest does not contain an assets array')
  }
  const expectedSlimManifestAssets = rdfVisualizations.map((record) => {
    const sidecarPath = typeof record.packagePath === 'string'
      ? resolveSafeRelativePath(sidecarRoot, record.packagePath)
      : null
    return stableValue({
      goalId: record.goalId,
      order: record.order,
      packagePath: record.packagePath,
      zipPath: record.zipPath,
      sidecarPath: sidecarPath ? repoRelative(sidecarPath) : null,
      mediaType: record.mediaType,
      bytes: record.bytes,
      sha256: record.sha256,
    })
  })
  const slimManifestAssetKeys = slimManifestAssets.map((asset) => visualizationKey(asset.goalId, asset.order))
  const slimManifestAssetPaths = slimManifestAssets
    .map((asset) => asset.packagePath)
    .filter((path): path is string => typeof path === 'string')
  const duplicateSlimManifestAssetKeys = slimManifestAssetKeys
    .filter((key, index) => slimManifestAssetKeys.indexOf(key) !== index)
  const duplicateSlimManifestAssetPaths = slimManifestAssetPaths
    .filter((path, index) => slimManifestAssetPaths.indexOf(path) !== index)
  if (slimManifest && normalizeRecordSet(slimManifestAssets) !== normalizeRecordSet(expectedSlimManifestAssets)) {
    slimManifestAssetIssues.push('slim manifest assets do not exactly match the RDF visualization sidecars')
  }
  check(
    checks,
    'semantic-slim-manifest-assets-match',
    slimManifestAssetIssues.length === 0
      && duplicateSlimManifestAssetKeys.length === 0
      && duplicateSlimManifestAssetPaths.length === 0,
    [
      ...duplicateSlimManifestAssetKeys.map((key) => `duplicate manifest asset ${key}`),
      ...duplicateSlimManifestAssetPaths.map((path) => `duplicate manifest asset path ${path}`),
      ...slimManifestAssetIssues,
    ].slice(0, 10).join(' | ')
      || (slimManifest ? `${slimManifestAssets.length}/${rdfVisualizations.length} manifest sidecar record(s)` : 'legacy bundle without a slim manifest'),
  )

  const sidecarIssues: string[] = []
  const originalByteIssues: string[] = []
  const copyIssues: string[] = []
  const verifiedSidecarStates: Array<{
    key: string
    path: string
    dev: number
    ino: number
    size: number
    mtimeMs: number
    ctimeMs: number
  }> = []
  let sidecarsCopied = 0
  const packageAssetsRoot = resolve(params.outDir, 'package-assets')
  rmSync(packageAssetsRoot, { recursive: true, force: true })
  const zipEntrySet = new Set(entries)
  const originalExtractRoot = resolve(params.outDir, '.original-goal-visualization-assets')
  const extractableZipPaths = rdfVisualizations.flatMap((record) => {
    if (!record.packagePath || !resolveSafeRelativePath(packageAssetsRoot, record.packagePath)) return []
    const expectedZipPath = packageEntryPath(archiveRoot, record.packagePath)
    const metadata = zipMetadataByPath.get(expectedZipPath)
    if (!metadata || metadata.uncompressedBytes !== record.bytes) {
      originalByteIssues.push(`${visualizationKey(record.goalId, record.order)}: ZIP metadata byteLength does not match RDF`)
      return []
    }
    if (metadata.uncompressedBytes > MAX_GOAL_VISUALIZATION_BYTES) {
      originalByteIssues.push(`${visualizationKey(record.goalId, record.order)}: visualization exceeds the extraction size limit`)
      return []
    }
    return zipEntrySet.has(expectedZipPath) ? [expectedZipPath] : []
  })
  const totalExtractBytes = [...new Set(extractableZipPaths)]
    .reduce((sum, zipPath) => sum + (zipMetadataByPath.get(zipPath)?.uncompressedBytes ?? 0), 0)
  if (totalExtractBytes > MAX_GOAL_VISUALIZATION_TOTAL_BYTES) {
    throw new Error(`Goal visualization extraction would exceed ${MAX_GOAL_VISUALIZATION_TOTAL_BYTES} bytes.`)
  }
  bulkExtractZipEntries(params.zipPath, extractableZipPaths, originalExtractRoot)
  try {
    rdfVisualizations.forEach((record) => {
      const key = visualizationKey(record.goalId, record.order)
      const packagePath = record.packagePath
      if (!packagePath) {
        sidecarIssues.push(`${key}: missing packagePath`)
        return
      }
      const expectedZipPath = packageEntryPath(archiveRoot, packagePath)
      if (record.zipPath !== expectedZipPath) {
        sidecarIssues.push(`${key}: zipPath ${String(record.zipPath)} != ${expectedZipPath}`)
      }

      const sidecarPath = resolveSafeRelativePath(sidecarRoot, packagePath)
      const copyPath = resolveSafeRelativePath(packageAssetsRoot, packagePath)
      const originalPath = resolveSafeRelativePath(originalExtractRoot, expectedZipPath)
      if (!sidecarPath || !copyPath || !originalPath) {
        sidecarIssues.push(`${key}: unsafe packagePath ${packagePath}`)
        return
      }
      if (!existsSync(sidecarPath) || !lstatSync(sidecarPath).isFile()) {
        sidecarIssues.push(`${key}: missing regular-file sidecar ${toPosixPath(relative(repoRoot, sidecarPath))}`)
        return
      }

      const sidecarStat = lstatSync(sidecarPath)
      if (
        typeof record.bytes !== 'number'
        || !Number.isSafeInteger(record.bytes)
        || record.bytes < 0
        || record.bytes > MAX_GOAL_VISUALIZATION_BYTES
        || sidecarStat.size !== record.bytes
      ) {
        sidecarIssues.push(`${key}: sidecar size ${sidecarStat.size} is invalid or does not match RDF ${String(record.bytes)}`)
        return
      }
      const sidecar = readFileSync(sidecarPath)
      const sidecarSha256 = sha256(sidecar)
      let sidecarValid = true
      if (record.bytes !== sidecar.length) {
        sidecarIssues.push(`${key}: sidecar byteLength ${sidecar.length} != ${String(record.bytes)}`)
        sidecarValid = false
      }
      if (record.sha256 !== sidecarSha256) {
        sidecarIssues.push(`${key}: sidecar sha256 ${sidecarSha256} != ${String(record.sha256)}`)
        sidecarValid = false
      }

      let originalValid = true
      if (!zipEntrySet.has(expectedZipPath) || !existsSync(originalPath) || !lstatSync(originalPath).isFile()) {
        originalByteIssues.push(`${key}: original ZIP is missing regular-file entry ${expectedZipPath}`)
        originalValid = false
      } else {
        const originalStat = lstatSync(originalPath)
        if (originalStat.size !== record.bytes || originalStat.size > MAX_GOAL_VISUALIZATION_BYTES) {
          originalByteIssues.push(`${key}: extracted original size ${originalStat.size} is invalid or does not match RDF ${String(record.bytes)}`)
          originalValid = false
          return
        }
        const original = readFileSync(originalPath)
        const originalSha256 = sha256(original)
        if (original.length !== sidecar.length || originalSha256 !== sidecarSha256) {
          originalByteIssues.push(`${key}: sidecar bytes differ from original ZIP (${sidecarSha256} != ${originalSha256})`)
          originalValid = false
        }
        if (record.bytes !== original.length || record.sha256 !== originalSha256) {
          originalByteIssues.push(`${key}: RDF digest/length differ from original ZIP`)
          originalValid = false
        }
      }

      if (sidecarValid && originalValid && record.zipPath === expectedZipPath) {
        try {
          writeIndependentFile(copyPath, sidecar)
          const sourceAfterMaterialization = lstatSync(sidecarPath)
          const copyBeforeVerification = lstatSync(copyPath)
          const sourceStable = sourceAfterMaterialization.dev === sidecarStat.dev
            && sourceAfterMaterialization.ino === sidecarStat.ino
            && sourceAfterMaterialization.size === sidecarStat.size
            && sourceAfterMaterialization.mtimeMs === sidecarStat.mtimeMs
            && sourceAfterMaterialization.ctimeMs === sidecarStat.ctimeMs
          const materializedSha256 = sha256(readFileSync(copyPath))
          const finalSourceStat = lstatSync(sidecarPath)
          const finalCopyStat = lstatSync(copyPath)
          const sourceStableDuringVerification = finalSourceStat.dev === sourceAfterMaterialization.dev
            && finalSourceStat.ino === sourceAfterMaterialization.ino
            && finalSourceStat.size === sourceAfterMaterialization.size
            && finalSourceStat.mtimeMs === sourceAfterMaterialization.mtimeMs
            && finalSourceStat.ctimeMs === sourceAfterMaterialization.ctimeMs
          const copyStableDuringVerification = finalCopyStat.dev === copyBeforeVerification.dev
            && finalCopyStat.ino === copyBeforeVerification.ino
            && finalCopyStat.size === copyBeforeVerification.size
            && finalCopyStat.mtimeMs === copyBeforeVerification.mtimeMs
            && finalCopyStat.ctimeMs === copyBeforeVerification.ctimeMs
          const materializedValid = copyBeforeVerification.isFile()
            && copyBeforeVerification.size === record.bytes
            && materializedSha256 === record.sha256
            && sourceStableDuringVerification
            && copyStableDuringVerification
          if (!sourceStable || !materializedValid) {
            copyIssues.push(`${key}: sidecar changed or materialized bytes are invalid`)
            return
          }
          verifiedSidecarStates.push({
            key,
            path: sidecarPath,
            dev: finalSourceStat.dev,
            ino: finalSourceStat.ino,
            size: finalSourceStat.size,
            mtimeMs: finalSourceStat.mtimeMs,
            ctimeMs: finalSourceStat.ctimeMs,
          })
          sidecarsCopied += 1
        } catch (error) {
          copyIssues.push(`${key}: ${error instanceof Error ? error.message : String(error)}`)
        }
      }
    })
  } finally {
    rmSync(originalExtractRoot, { recursive: true, force: true })
  }
  const unstableSidecars = verifiedSidecarStates.flatMap((state) => {
    if (!existsSync(state.path) || !lstatSync(state.path).isFile()) return [`${state.key}: verified sidecar disappeared`]
    const current = lstatSync(state.path)
    return current.dev === state.dev
      && current.ino === state.ino
      && current.size === state.size
      && current.mtimeMs === state.mtimeMs
      && current.ctimeMs === state.ctimeMs
      ? []
      : [`${state.key}: verified sidecar changed during validation`]
  })
  check(
    checks,
    'semantic-goal-visualization-sidecars-valid',
    sidecarIssues.length === 0 && unstableSidecars.length === 0,
    [...sidecarIssues, ...unstableSidecars].slice(0, 10).join(' | ') || `${rdfVisualizations.length} stable sidecar asset(s) verified`,
  )
  check(
    checks,
    'semantic-goal-visualization-original-bytes-match',
    originalByteIssues.length === 0,
    originalByteIssues.slice(0, 10).join(' | ') || `${rdfVisualizations.length} original ZIP asset(s) match`,
  )
  check(
    checks,
    'semantic-goal-visualization-assets-copied',
    copyIssues.length === 0 && sidecarsCopied === rdfVisualizations.length,
    copyIssues.slice(0, 10).join(' | ') || `${sidecarsCopied}/${rdfVisualizations.length} asset(s) materialized in package-assets`,
  )

  const visualizationCounts: VisualizationValidationCounts = {
    canonicalLinks: canonicalVisualizations.length,
    rdfReferences: rdfVisualizations.length,
    indexAssets: visualizationIndexAssets.length,
    sidecarsCopied,
  }

  const sourceOriginal = readZipJson(params.zipPath, packageEntryPath(archiveRoot, 'data/sources/source-goal-references.json'))
  const originalSources = jsonObject(sourceOriginal, 'source-goal references').sources
  const reconstructedSources = jsonObject(params.reconstruction.sourceGoalReferences, 'reconstructed source-goal references').sources
  const sourceCollectionIssues: string[] = []
  const reconstructedSourceById = asMap(
    (Array.isArray(reconstructedSources) ? reconstructedSources : []).map((source) => jsonObject(source, 'reconstructed source collection')),
    (source) => String(source.extractionId),
  )
  ;(Array.isArray(originalSources) ? originalSources : []).map((source) => jsonObject(source, 'source collection')).forEach((source) => {
    const reconstructed = reconstructedSourceById.get(String(source.extractionId))
    if (!reconstructed) {
      sourceCollectionIssues.push(`missing ${String(source.extractionId)}`)
      return
    }
    ;['jurisdiction', 'sourceLandscapeId', 'stage', 'subject'].forEach((field) => {
      compareJsonField(sourceCollectionIssues, `${String(source.extractionId)}.${field}`, source[field], reconstructed[field])
    })
    const documents = Array.isArray(source.sourceDocuments) ? source.sourceDocuments as JsonValue[] : []
    const reconstructedDocuments = Array.isArray(reconstructed.sourceDocuments) ? reconstructed.sourceDocuments as JsonValue[] : []
    if (normalizeRecordSet(documents) !== normalizeRecordSet(reconstructedDocuments)) {
      sourceCollectionIssues.push(`${String(source.extractionId)}.sourceDocuments`)
    }
  })
  check(
    checks,
    'semantic-source-collections-match',
    sourceCollectionIssues.length === 0 && (Array.isArray(originalSources) ? originalSources.length : 0) === (Array.isArray(reconstructedSources) ? reconstructedSources.length : 0),
    sourceCollectionIssues.slice(0, 10).join(', ') || `${Array.isArray(reconstructedSources) ? reconstructedSources.length : 0}/${Array.isArray(originalSources) ? originalSources.length : 0} source collection(s)`,
  )

  const sourceOriginalGoals = flattenSourceGoals(sourceOriginal)
  const sourceReconstructedGoals = flattenSourceGoals(params.reconstruction.sourceGoalReferences)
  const sourceReconstructedById = asMap(sourceReconstructedGoals, (goal) => String(goal.sourceGoalId))
  const sourceIssues = sourceOriginalGoals.flatMap((goal) => {
    const reconstructed = sourceReconstructedById.get(String(goal.sourceGoalId))
    if (!reconstructed) {
      return [`missing ${String(goal.sourceGoalId)}`]
    }
    const issues: string[] = []
    ;[
      'title',
      'description',
      'sourceText',
      'sourceSpan',
      'sourceRef',
      'sourceTextSha256',
      'sourceDocumentKey',
      'sourceDocumentUrl',
      'sourceDocumentLandingUrl',
      'sourceDocumentTitle',
      'topicCode',
      'passageId',
      'granularity',
      'sourcePage',
      'sourceLine',
      'parentBulletText',
      'passage',
      'phase',
      'courseLevel',
      'category',
    ].forEach((field) => {
      compareJsonField(issues, `${String(goal.sourceGoalId)}.${field}`, goal[field], reconstructed[field])
    })
    return issues
  })
  check(checks, 'semantic-source-goals-match', sourceIssues.length === 0 && sourceOriginalGoals.length === sourceReconstructedGoals.length, sourceIssues.slice(0, 10).join(', ') || `${sourceReconstructedGoals.length}/${sourceOriginalGoals.length} source goal(s)`)

  const cardOriginalEntries = entries.filter((entry) => entry.startsWith(`${archiveRoot}/data/cards/`) && entry.endsWith('.json') && !entry.endsWith('/card-index.json'))
  const originalDecks = cardOriginalEntries.map((entry) => {
    const deck = jsonObject(readZipJson(params.zipPath, entry), 'card deck')
    return { entry, deck }
  })
  const reconstructedDeckByPath = asMap(params.reconstruction.cardDecks.map((deck) => jsonObject(deck, 'reconstructed deck')), (deck) => String(deck.zipPath))
  const cardIssues = originalDecks.flatMap(({ entry, deck }) => {
    const reconstructed = reconstructedDeckByPath.get(entry)
    if (!reconstructed) {
      return [`missing ${entry}`]
    }
    const originalComparable = {
      deckId: deck.deckId,
      title: deck.title,
      landscapeId: deck.landscapeId,
      cards: deck.cards,
    } as JsonValue
    const reconstructedComparable = {
      deckId: reconstructed.deckId,
      title: reconstructed.title,
      landscapeId: reconstructed.landscapeId,
      cards: reconstructed.cards,
    } as JsonValue
    return normalize(originalComparable) === normalize(reconstructedComparable) ? [] : [`changed ${entry}`]
  })
  check(checks, 'semantic-card-decks-match', cardIssues.length === 0 && originalDecks.length === params.reconstruction.cardDecks.length, cardIssues.slice(0, 10).join(', ') || `${params.reconstruction.cardDecks.length}/${originalDecks.length} deck(s)`)

  const cardIndexPath = packageEntryPath(archiveRoot, 'data/cards/card-index.json')
  const cardIndex = jsonObject(readZipJson(params.zipPath, cardIndexPath), 'card index')
  const indexDecks = Array.isArray(cardIndex.decks) ? cardIndex.decks.map((deck) => jsonObject(deck, 'card index deck')) : []
  const cardIndexIssues = indexDecks.flatMap((deck) => {
    const reconstructed = reconstructedDeckByPath.get(`${archiveRoot}/${String(deck.packagePath)}`)
    if (!reconstructed) {
      return [`missing ${String(deck.packagePath)}`]
    }
    const issues: string[] = []
    ;['title', 'language'].forEach((field) => {
      compareJsonField(issues, `${String(deck.packagePath)}.${field}`, deck[field], reconstructed[field])
    })
    return issues
  })
  check(checks, 'semantic-card-index-match', cardIndexIssues.length === 0, cardIndexIssues.slice(0, 10).join(', ') || `${indexDecks.length} card index deck(s)`)

  const mappingOriginalEntries = entries.filter((entry) => entry.startsWith(`${archiveRoot}/data/mappings/`) && entry.endsWith('.json'))
  const mappingMetadataIssues = mappingOriginalEntries.flatMap((entry) => {
    const data = jsonObject(readZipJson(params.zipPath, entry), 'mapping file')
    const reconstructed = jsonObject(params.reconstruction.mappingFiles[entry] ?? {}, `reconstructed mapping file ${entry}`)
    const issues: string[] = []
    ;[
      'title',
      'jurisdiction',
      'schemaVersion',
      'version',
      'generatedAt',
      'sourceExtractionId',
      'sourceLandscapeId',
      'sourceLandscapeTitle',
      'targetLandscapeId',
      'targetLandscapeTitle',
      'canonicalCurriculumId',
      'stage',
      'subject',
      'status',
      'reviewId',
      'reviewSummary',
    ].forEach((field) => {
      if (data[field] !== undefined) {
        compareJsonField(issues, `${entry}.${field}`, data[field], reconstructed[field])
      }
    })
    return issues
  })
  check(checks, 'semantic-mapping-file-metadata-match', mappingMetadataIssues.length === 0 && Object.keys(params.reconstruction.mappingFiles).length === mappingOriginalEntries.length, mappingMetadataIssues.slice(0, 10).join(', ') || `${Object.keys(params.reconstruction.mappingFiles).length}/${mappingOriginalEntries.length} mapping file metadata record(s)`)

  const canonicalMappingIssues = mappingOriginalEntries.filter((entry) => !entry.endsWith('.review.json')).flatMap((entry) => {
    const data = jsonObject(readZipJson(params.zipPath, entry), 'canonical mapping')
    const original = Array.isArray(data.mappings) ? data.mappings as JsonValue[] : []
    const reconstructed = params.reconstruction.canonicalMappings[entry] ?? []
    return normalizeRecordSet(original) === normalizeRecordSet(reconstructed) ? [] : [`changed ${entry}`]
  })
  const reviewDecisionIssues = mappingOriginalEntries.filter((entry) => entry.endsWith('.review.json')).flatMap((entry) => {
    const data = jsonObject(readZipJson(params.zipPath, entry), 'review mapping')
    const original = (Array.isArray(data.decisions) ? data.decisions : Array.isArray(data.mappings) ? data.mappings : []) as JsonValue[]
    const reconstructed = params.reconstruction.reviewDecisions[entry] ?? []
    const normalizeDecision = (decision: JsonValue) => {
      const data = jsonObject(decision, 'review decision normalization')
      return stableValue({
        ...data,
        canonicalGoalIds: normalizedStringArray(data.canonicalGoalIds),
      } as JsonValue)
    }
    return normalizeRecordSet(original.map(normalizeDecision)) === normalizeRecordSet(reconstructed.map(normalizeDecision))
      ? []
      : [`changed ${entry}`]
  })
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
  check(checks, 'semantic-mapping-records-match', canonicalMappingIssues.length === 0 && reviewDecisionIssues.length === 0 && originalCanonicalMappingCount === reconstructedCanonicalMappingCount && originalReviewDecisionCount === reconstructedReviewDecisionCount, [...canonicalMappingIssues, ...reviewDecisionIssues].slice(0, 10).join(', ') || `${reconstructedCanonicalMappingCount}/${originalCanonicalMappingCount} mappings; ${reconstructedReviewDecisionCount}/${originalReviewDecisionCount} review decisions`)
  const mappingKeys = [
    ...Object.keys(params.reconstruction.canonicalMappings),
    ...Object.keys(params.reconstruction.reviewDecisions),
  ]
  const reconstructedMappingStates = [...new Set(mappingKeys.flatMap((key) => {
    const match = key.match(/\/data\/mappings\/(DE-[A-Z]{2})\//u)
    return match ? [match[1]] : []
  }))].sort(compareCodeUnits)
  const missingMappingStates = EXPECTED_DE_STATES.filter((state) => !reconstructedMappingStates.includes(state))
  check(
    checks,
    'semantic-mapping-state-coverage',
    missingMappingStates.length === 0,
    missingMappingStates.length === 0 ? `all ${EXPECTED_DE_STATES.length} state mapping lanes` : missingMappingStates.join(', '),
  )

  const viewOriginalEntries = entries.filter((entry) => entry.startsWith(`${archiveRoot}/data/views/`) && entry.endsWith('.view.json'))
  const viewIssues = viewOriginalEntries.flatMap((entry) => {
    const original = readZipJson(params.zipPath, entry)
    const reconstructed = params.reconstruction.compositionViews[entry]
    if (!reconstructed) {
      return [`missing ${entry}`]
    }
    return normalize(original) === normalize(reconstructed) ? [] : [`changed ${entry}`]
  })
  const originalViewGoalRefs = viewOriginalEntries.flatMap((entry) => collectViewGoalRefs(readZipJson(params.zipPath, entry)))
  const reconstructedViewGoalRefs = Object.values(params.reconstruction.compositionViews).flatMap(collectViewGoalRefs)
  check(checks, 'semantic-views-match', viewIssues.length === 0 && viewOriginalEntries.length === Object.keys(params.reconstruction.compositionViews).length && originalViewGoalRefs.length === reconstructedViewGoalRefs.length, viewIssues.slice(0, 10).join(', ') || `${Object.keys(params.reconstruction.compositionViews).length}/${viewOriginalEntries.length} view(s); ${reconstructedViewGoalRefs.length}/${originalViewGoalRefs.length} view goal refs`)
  const reconstructedViewKeys = Object.keys(params.reconstruction.compositionViews)
  const missingViewStates = EXPECTED_DE_STATES.filter((state) => {
    const stateSlug = state.toLocaleLowerCase()
    return !reconstructedViewKeys.some((key) => key.includes(`/data/views/${stateSlug}-`))
  })
  const aggregateViews = reconstructedViewKeys.filter((key) => key.includes('/data/views/de-de-')).length
  check(
    checks,
    'semantic-view-state-coverage',
    missingViewStates.length === 0 && aggregateViews > 0,
    missingViewStates.length === 0
      ? `all ${EXPECTED_DE_STATES.length} state view lanes plus ${aggregateViews} DE aggregate view(s)`
      : `missing ${missingViewStates.join(', ')}; aggregate views ${aggregateViews}`,
  )

  const changedBoundInputs = [...boundInputs.entries()].flatMap(([label, input]) => {
    const absolutePath = resolve(repoRoot, input.path)
    if (!existsSync(absolutePath) || !lstatSync(absolutePath).isFile()) return [`${label}: input disappeared`]
    const currentSha256 = sha256File(absolutePath)
    return currentSha256 === input.sha256 ? [] : [`${label}: ${input.sha256} -> ${currentSha256}`]
  })
  check(
    checks,
    'semantic-bound-inputs-stable',
    changedBoundInputs.length === 0,
    changedBoundInputs.slice(0, 10).join(' | ') || `${boundInputs.size} bound input artifact(s) remained unchanged`,
  )

  return {
    archiveRoot,
    passed: checks.every((entry) => entry.passed),
    checks,
    visualizationCounts,
    boundInputs: Object.fromEntries(boundInputs),
    boundOntology,
  }
}

const writeOutputs = (params: {
  options: CliOptions
  reconstruction: SemanticReconstruction
  validation: ReturnType<typeof validateSemanticReconstruction>
}) => {
  mkdirSync(params.options.outDir, { recursive: true })
  const generatedAt = new Date().toISOString()
  writeFileSync(resolve(params.options.outDir, 'canonical-landscape.semantic.json'), `${JSON.stringify(params.reconstruction.landscape, null, 2)}\n`)
  writeFileSync(resolve(params.options.outDir, 'goal-visualizations.semantic.json'), `${JSON.stringify({
    schemaVersion: 1,
    assets: params.reconstruction.goalVisualizations.map(visualizationIndexAssetFromRecord),
  }, null, 2)}\n`)
  writeFileSync(resolve(params.options.outDir, 'goal-visualizations.diagnostic.json'), `${JSON.stringify({
    schemaVersion: 1,
    references: params.reconstruction.goalVisualizations,
  }, null, 2)}\n`)
  writeFileSync(resolve(params.options.outDir, 'source-goal-references.semantic.json'), `${JSON.stringify(params.reconstruction.sourceGoalReferences, null, 2)}\n`)
  writeFileSync(resolve(params.options.outDir, 'card-decks.semantic.json'), `${JSON.stringify(params.reconstruction.cardDecks, null, 2)}\n`)
  writeFileSync(resolve(params.options.outDir, 'mappings.semantic.json'), `${JSON.stringify({
    mappingFiles: params.reconstruction.mappingFiles,
    canonicalMappings: params.reconstruction.canonicalMappings,
    reviewDecisions: params.reconstruction.reviewDecisions,
  }, null, 2)}\n`)
  writeFileSync(resolve(params.options.outDir, 'composition-views.semantic.json'), `${JSON.stringify(params.reconstruction.compositionViews, null, 2)}\n`)
  writeFileSync(resolve(params.options.outDir, 'semantic-reconstruction-report.json'), `${JSON.stringify({
    generatedAt,
    rdfPath: repoRelative(params.options.rdfPath),
    comparisonZip: repoRelative(params.options.zipPath),
    boundInputs: params.validation.boundInputs,
    boundOntology: params.validation.boundOntology,
    archiveRoot: params.validation.archiveRoot,
    passed: params.validation.passed,
    counts: {
      ...params.validation.visualizationCounts,
    },
    checks: params.validation.checks,
  }, null, 2)}\n`)

  const failed = params.validation.checks.filter((entry) => !entry.passed)
  writeFileSync(resolve(params.options.outDir, 'semantic-reconstruction-report.md'), `# Semantic MEM/FWU Reconstruction Report

Generated at: ${generatedAt}

RDF: \`${repoRelative(params.options.rdfPath)}\`

Comparison ZIP: \`${repoRelative(params.options.zipPath)}\`

## Bound Inputs

| Input | Path | SHA-256 |
| --- | --- | --- |
${Object.entries(params.validation.boundInputs).map(([label, input]) => `| ${label} | \`${input.path}\` | \`${input.sha256}\` |`).join('\n')}

FWU Core IRI: \`${params.validation.boundOntology?.ontologyIri ?? 'not available'}\`

FWU ontology commit: \`${params.validation.boundOntology?.commit ?? 'not available'}\`

## Result

${params.validation.passed ? 'Semantic reconstruction passed.' : 'Semantic reconstruction failed.'}

## Visualization Assets

| Canonical links | RDF references | Resource index assets | Materialized sidecars |
| ---: | ---: | ---: | ---: |
| ${params.validation.visualizationCounts.canonicalLinks} | ${params.validation.visualizationCounts.rdfReferences} | ${params.validation.visualizationCounts.indexAssets} | ${params.validation.visualizationCounts.sidecarsCopied} |

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
  const initialRdfSha256 = sha256File(options.rdfPath)
  const initialZipSha256 = sha256File(options.zipPath)
  const parsedRdf = await readRdfModel(options.rdfPath)
  if (parsedRdf.sha256 !== initialRdfSha256) {
    throw new Error(`RDF input changed while it was parsed: ${initialRdfSha256} -> ${parsedRdf.sha256}`)
  }
  const model = parsedRdf.model
  const reconstruction = reconstructSemantic(model)
  const validation = validateSemanticReconstruction({
    zipPath: options.zipPath,
    rdfPath: options.rdfPath,
    outDir: options.outDir,
    model,
    reconstruction,
    initialRdfSha256,
    initialZipSha256,
  })
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
