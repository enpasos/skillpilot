import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import {
  closeSync,
  createReadStream,
  createWriteStream,
  existsSync,
  lstatSync,
  mkdirSync,
  openSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
  writeSync,
} from 'node:fs'
import { basename, dirname, isAbsolute, relative, resolve, sep } from 'node:path'
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
  mode: 'roundtrip' | 'to-rdf' | 'to-slim-rdf' | 'from-rdf' | 'validate' | 'validate-owl'
  zipPath: string
  outDir: string
  rdfPath: string
  profilePath: string
  slimDir: string
  reconstructedDir: string
  reconstructedZipPath: string
  ontologyDir: string
  reason: boolean
  help: boolean
}

type SlimRdfFile = {
  name: string
  path: string
  triples: number
  bytes: number
  sha256: string
  description: string
}

type ZipEntryRecord = {
  path: string
  uncompressedBytes: number
  content: Buffer | null
  text: string | null
  sha256: string | null
}

type GoalVisualizationAsset = {
  goalId: string
  order: number
  packagePath: string
  publicUrl: string
  mediaType: 'image/jpeg' | 'image/png'
  bytes: number
  sha256: string
  skillpilotId: string
  role: string
  title: string
  provider: string
  description: string
  altText: string
  lang: string
  license: string
  reviewStatus: string
}

type SemanticCounts = {
  files: number
  textLines: number
  canonicalGoals: number
  containsEdges: number
  requiresEdges: number
  competencyCatalogEntries: number
  coreAxisEntries: number
  coreAxisReferences: number
  programUnits: number
  goalPlacements: number
  compositionViews: number
  compositionNodes: number
  canonicalMappings: number
  reviewDecisions: number
  sourceCollections: number
  sourceDocuments: number
  sourceGoals: number
  cardDecks: number
  cards: number
  externalGoalReferences: number
  goalVisualizations: number
}

type RoundtripReport = {
  generatedAt: string
  inputZip: string
  rdfPath: string
  profilePath: string
  reconstructedZip: string
  hashes: {
    inputZipSha256: string | null
    rdfSha256: string | null
    profileSha256: string | null
    reconstructedZipSha256: string | null
    ontologyCoreSha256: string | null
  }
  archiveRoot: string
  fwuOntology: {
    repository: string
    localPath: string
    corePath: string
    commit: string | null
    ontologyIri: string
  }
  semanticCounts: SemanticCounts
  reconstruction: {
    comparedFiles: number
    byteIdenticalFiles: number
    mismatches: string[]
  } | null
  packageValidation: {
    command: string
    passed: boolean
    reportPath: string | null
    reportSha256: string | null
  } | null
}

type TripleObject =
  | { kind: 'iri'; value: string }
  | { kind: 'literal'; value: string; datatype?: string; lang?: string }

type ParsedTriple = {
  subject: string
  predicate: string
  object: TripleObject
}

type GoalFwuKind =
  | 'curricular-atomic'
  | 'curricular-cluster'
  | 'unscoped-curricular-atomic'
  | 'runtime-cluster'
  | 'program-structure'
  | 'practice-or-assessment'
  | 'memorization'
  | 'orientation'

type GoalFwuClassification = {
  kind: GoalFwuKind
  profileClass: string | null
  fwuClasses: string[]
  safeCurricularPartWholeSource: boolean
  safeCurricularPartWholeTarget: boolean
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '../..')
const appRoot = resolve(repoRoot, 'app')

const DEFAULT_ZIP = 'tmp/exports/skillpilot-de-gymnasium-mathematik-v0.1.0.zip'
const DEFAULT_OUT_DIR = 'tmp/roundtrip/mem-fwu/skillpilot-de-gymnasium-mathematik-v0.1.0'
const ZIP_COMMAND_MAX_BUFFER_BYTES = 512 * 1024 * 1024
const MAX_GOAL_VISUALIZATION_BYTES = 64 * 1024 * 1024
const MAX_GOAL_VISUALIZATION_TOTAL_BYTES = 8 * 1024 * 1024 * 1024
const MAX_ZIP_ENTRY_UNCOMPRESSED_BYTES = 512 * 1024 * 1024
const MAX_ZIP_TOTAL_UNCOMPRESSED_BYTES = 16 * 1024 * 1024 * 1024

const RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
const RDFS = 'http://www.w3.org/2000/01/rdf-schema#'
const OWL = 'http://www.w3.org/2002/07/owl#'
const XSD = 'http://www.w3.org/2001/XMLSchema#'
const DCTERMS = 'http://purl.org/dc/terms/'
const SKOS = 'http://www.w3.org/2004/02/skos/core#'
const BFO = 'http://purl.obolibrary.org/obo/'
const IAO = 'http://purl.obolibrary.org/obo/'
const SCHEMA = 'https://schema.org/'
const LP = 'https://w3id.org/lehrplan/ontology/'
const LP_CORE_ONTOLOGY = `${LP}lp/components/lehrplan-core.owl`
const SP = 'https://skillpilot.de/ns/roundtrip#'
const ID = 'https://skillpilot.de/id/mem-fwu-roundtrip/'

const LP_SUBJECT_SPECIFIC_COMPETENCY = `${LP}LP_0000336`
const LP_COMPETENCY_SPECIFICATION = `${LP}LP_0000263`
const LP_CURRICULAR_AREA = `${LP}LP_0000349`
const LP_PROCESS_COMPETENCY_AREA = `${LP}LP_0030265`
const LP_GUIDING_IDEA = `${LP}LP_0000268`
const LP_REFERENCE = `${LP}LP_0030065`
const LP_DIDACTIC_PREREQUISITE = `${LP}LP_0000554`
const LP_SCHOOL_SUBJECT = `${LP}LP_0000001`
const LP_SCHOOL_TYPE = `${LP}LP_0000111`
const LP_HAS_SCHOOL_SUBJECT = `${LP}LP_0000537`
const LP_FOR_TYPE_OF_SCHOOL = `${LP}LP_0000812`
const LP_HAS_GRADE = `${LP}LP_0000026`
const LP_HAS_STAGE = `${LP}LP_0000047`
const LP_OF_STATE = `${LP}LP_0000029`
const LP_HAS_UNIT = `${LP}LP_0000041`
const LP_HAS_REQUIREMENT_LEVEL = `${LP}LP_0000840`
const LP_HAS_REFERENCE = `${LP}LP_0030071`
const LP_REFERS_TO = `${LP}LP_0030072`
const LP_DESCRIBED_BY = `${LP}LP_0000024`
const LP_HAS_DESCRIPTION = `${LP}LP_0030051`
const LP_HAS_TITLE = `${LP}LP_0030056`
const LP_HAS_NUMBER = `${LP}LP_0030057`
const LP_VALUE = `${LP}LP_0000344`
const LP_TITLE = `${LP}LP_0000346`
const LP_DESCRIPTION = `${LP}LP_0030003`
const LP_IDENTIFIER = `${LP}LP_0000347`
const LP_POSITION = `${LP}LP_0000460`
const BFO_HAS_PART = `${BFO}BFO_0000051`
const BFO_PART_OF = `${BFO}BFO_0000050`
const KIM_MATHEMATICS = 'http://w3id.org/kim/schulfaecher/s1017'
const KIM_GYMNASIUM = 'https://w3id.org/kim/schularten/s08'

const REFERENCE_ROLE_COMPETENCY_REFS = 'competencyRefs'
const REFERENCE_ROLE_PROCESS_COMPETENCIES = 'dimensionTags.processCompetencies'
const REFERENCE_ROLE_GUIDING_IDEAS = 'dimensionTags.guidingIdeas'

const FWU_GRADES = new Map<string, string>(
  Array.from({ length: 9 }, (_, index) => {
    const grade = index + 5
    return [`de-gym-math-j${grade}`, `${LP}LP_${2_000_000 + grade}`]
  }),
)
const FWU_STAGES = new Map<string, string>([
  ['de-gym-math-sek1', `${LP}LP_0000045`],
  ['de-gym-math-sek2', `${LP}LP_0000046`],
])
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

const emptyCounts = (): SemanticCounts => ({
  files: 0,
  textLines: 0,
  canonicalGoals: 0,
  containsEdges: 0,
  requiresEdges: 0,
  competencyCatalogEntries: 0,
  coreAxisEntries: 0,
  coreAxisReferences: 0,
  programUnits: 0,
  goalPlacements: 0,
  compositionViews: 0,
  compositionNodes: 0,
  canonicalMappings: 0,
  reviewDecisions: 0,
  sourceCollections: 0,
  sourceDocuments: 0,
  sourceGoals: 0,
  cardDecks: 0,
  cards: 0,
  externalGoalReferences: 0,
  goalVisualizations: 0,
})

const usage = () => `Usage:
  npm run roundtrip:mem-fwu -- [--zip tmp/exports/skillpilot-de-gymnasium-mathematik-v0.1.0.zip]
  npm run roundtrip:mem-fwu:to-rdf -- --zip <package.zip> --out-dir <dir>
  npm run roundtrip:mem-fwu:slim -- --zip <package.zip> --out-dir <dir>
  npm run roundtrip:mem-fwu:from-rdf -- --rdf <data.nt> --out-dir <dir>
  npm run roundtrip:mem-fwu:validate -- --zip <package.zip> --rdf <data.nt> --out-dir <dir>

Options:
  --mode <roundtrip|to-rdf|to-slim-rdf|from-rdf|validate|validate-owl>
  --zip <path>                  Input SkillPilot ZIP. Default: ${DEFAULT_ZIP}
  --out-dir <path>              Roundtrip working directory. Default: ${DEFAULT_OUT_DIR}
  --rdf <path>                  RDF N-Triples path. Default: <out-dir>/rdf/skillpilot-mem-fwu.nt
  --profile <path>              SkillPilot profile Turtle path. Default: <out-dir>/rdf/skillpilot-mem-fwu-profile.ttl
  --slim-dir <path>             Slim semantic RDF bundle directory. Default: <out-dir>/slim
  --reconstructed-dir <path>    Directory for reconstructed package root. Default: <out-dir>/reconstructed
  --reconstructed-zip <path>    Reconstructed ZIP path. Default: <out-dir>/skillpilot-de-gymnasium-mathematik-v0.1.0.roundtrip.zip
  --ontology-dir <path>         Local FWU ontology checkout. Default: tmp/lehrplan-ontologie
  --reason                      With validate-owl, also run HermiT consistency reasoning.
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

const compareCodeUnits = (left: string, right: string) => left < right ? -1 : left > right ? 1 : 0

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

const repoRelative = (absolutePath: string) => {
  const relativePath = toPosixPath(relative(repoRoot, absolutePath))
  if (relativePath === '' || relativePath.startsWith('..')) {
    throw new Error(`Path is outside the repository: ${absolutePath}`)
  }
  return relativePath
}

const parseArgs = (argv: string[]): CliOptions => {
  const outDirDefault = resolveInsideRepo(DEFAULT_OUT_DIR)
  const options: CliOptions = {
    mode: 'roundtrip',
    zipPath: resolveInsideRepo(DEFAULT_ZIP),
    outDir: outDirDefault,
    rdfPath: resolve(outDirDefault, 'rdf/skillpilot-mem-fwu.nt'),
    profilePath: resolve(outDirDefault, 'rdf/skillpilot-mem-fwu-profile.ttl'),
    slimDir: resolve(outDirDefault, 'slim'),
    reconstructedDir: resolve(outDirDefault, 'reconstructed'),
    reconstructedZipPath: resolve(outDirDefault, 'skillpilot-de-gymnasium-mathematik-v0.1.0.roundtrip.zip'),
    ontologyDir: resolveInsideRepo('tmp/lehrplan-ontologie'),
    reason: false,
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
    if (arg === '--mode') {
      const mode = readValue(arg)
      if (!['roundtrip', 'to-rdf', 'to-slim-rdf', 'from-rdf', 'validate', 'validate-owl'].includes(mode)) {
        throw new Error(`Unsupported mode: ${mode}`)
      }
      options.mode = mode as CliOptions['mode']
      continue
    }
    if (arg === '--zip') {
      options.zipPath = resolveInsideRepo(readValue(arg))
      continue
    }
    if (arg === '--out-dir') {
      options.outDir = resolveInsideRepo(readValue(arg))
      if (!argv.some((value) => value === '--rdf')) {
        options.rdfPath = resolve(options.outDir, 'rdf/skillpilot-mem-fwu.nt')
      }
      if (!argv.some((value) => value === '--profile')) {
        options.profilePath = resolve(options.outDir, 'rdf/skillpilot-mem-fwu-profile.ttl')
      }
      if (!argv.some((value) => value === '--slim-dir')) {
        options.slimDir = resolve(options.outDir, 'slim')
      }
      if (!argv.some((value) => value === '--reconstructed-dir')) {
        options.reconstructedDir = resolve(options.outDir, 'reconstructed')
      }
      if (!argv.some((value) => value === '--reconstructed-zip')) {
        options.reconstructedZipPath = resolve(options.outDir, 'skillpilot-de-gymnasium-mathematik-v0.1.0.roundtrip.zip')
      }
      continue
    }
    if (arg === '--rdf') {
      options.rdfPath = resolveInsideRepo(readValue(arg))
      continue
    }
    if (arg === '--profile') {
      options.profilePath = resolveInsideRepo(readValue(arg))
      continue
    }
    if (arg === '--slim-dir') {
      options.slimDir = resolveInsideRepo(readValue(arg))
      continue
    }
    if (arg === '--reconstructed-dir') {
      options.reconstructedDir = resolveInsideRepo(readValue(arg))
      continue
    }
    if (arg === '--reconstructed-zip') {
      options.reconstructedZipPath = resolveInsideRepo(readValue(arg))
      continue
    }
    if (arg === '--ontology-dir') {
      options.ontologyDir = resolveInsideRepo(readValue(arg))
      continue
    }
    if (arg === '--reason') {
      options.reason = true
      continue
    }

    throw new Error(`Unknown argument: ${arg}`)
  }

  ;[options.outDir, options.rdfPath, options.profilePath, options.slimDir, options.reconstructedDir, options.reconstructedZipPath, options.ontologyDir]
    .forEach((path) => {
      if (!isInsideRepo(path)) {
        throw new Error(`Path must be inside the repository: ${path}`)
      }
    })

  return options
}

const sha256 = (content: Buffer | string) => createHash('sha256').update(content).digest('hex')

const sha256File = (filePath: string) => execFileSync('sha256sum', [filePath], {
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'pipe'],
  maxBuffer: 1024 * 1024,
}).trim().split(/\s+/u)[0]

const sha256RegularFile = (filePath: string) => (
  existsSync(filePath) && lstatSync(filePath).isFile() ? sha256File(filePath) : null
)

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

const readZipEntry = (zipPath: string, entryPath: string) => execFileSync('unzip', ['-p', zipPath, entryPath], {
  maxBuffer: ZIP_COMMAND_MAX_BUFFER_BYTES,
  stdio: ['ignore', 'pipe', 'pipe'],
})

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

const optionalJsonObject = (value: JsonValue | undefined): Record<string, JsonValue> | null => (
  value && typeof value === 'object' && !Array.isArray(value) ? value : null
)

const stringValue = (value: JsonValue | undefined) => typeof value === 'string' && value.trim() ? value.trim() : null

const numberValue = (value: JsonValue | undefined) => typeof value === 'number' && Number.isFinite(value) ? value : null

const booleanValue = (value: JsonValue | undefined) => typeof value === 'boolean' ? value : null

const stringArray = (value: JsonValue | undefined) => Array.isArray(value)
  ? value.filter((item): item is string => typeof item === 'string')
  : []

const lowerTags = (value: JsonValue | undefined) => stringArray(value).map((tag) => tag.toLocaleLowerCase('de-DE'))

const hasTag = (tags: string[], tag: string) => tags.includes(tag.toLocaleLowerCase('de-DE'))

const hasTagPrefix = (tags: string[], prefix: string) => tags.some((tag) => tag.startsWith(prefix.toLocaleLowerCase('de-DE')))

const classifyGoalForFwu = (data: Record<string, JsonValue>, contains: string[]): GoalFwuClassification => {
  const title = stringValue(data.title) ?? ''
  const goalType = stringValue(data.type)
  const nodeKind = stringValue(data.nodeKind)
  const tags = lowerTags(data.tags)
  const isCluster = goalType === 'cluster' || contains.length > 0
  const hasExamData = data.examData !== undefined && data.examData !== null

  if (nodeKind === 'memory' || hasTag(tags, 'memorization') || hasTagPrefix(tags, 'srs-deck:')) {
    return {
      kind: 'memorization',
      profileClass: `${SP}MemorizationGoal`,
      fwuClasses: [],
      safeCurricularPartWholeSource: false,
      safeCurricularPartWholeTarget: false,
    }
  }

  if (
    nodeKind === 'exam' ||
    hasExamData ||
    hasTag(tags, 'practice') ||
    hasTag(tags, 'assessment') ||
    /^(Übungen|Abiturprüfung|Sek-I-Abschlussaufgaben)\b/u.test(title)
  ) {
    return {
      kind: 'practice-or-assessment',
      profileClass: `${SP}PracticeOrAssessmentGoal`,
      fwuClasses: [],
      safeCurricularPartWholeSource: false,
      safeCurricularPartWholeTarget: false,
    }
  }

  if (
    hasTag(tags, 'root') ||
    title === 'Mathematik' ||
    /^Jahrgangsstufe \d+$/u.test(title) ||
    /^(Sekundarstufe [I]{1,3}|E-Phase|Qualifikationsphase)$/u.test(title)
  ) {
    return {
      kind: 'program-structure',
      profileClass: `${SP}ProgramStructureGoal`,
      fwuClasses: [],
      safeCurricularPartWholeSource: false,
      safeCurricularPartWholeTarget: false,
    }
  }

  if (hasTag(tags, 'motivation') || hasTag(tags, 'orientation') || title.startsWith('Warum Mathematik?')) {
    return {
      kind: 'orientation',
      profileClass: `${SP}OrientationGoal`,
      fwuClasses: [],
      safeCurricularPartWholeSource: false,
      safeCurricularPartWholeTarget: false,
    }
  }

  if (isCluster) {
    return {
      kind: 'curricular-cluster',
      profileClass: null,
      fwuClasses: [LP_CURRICULAR_AREA],
      safeCurricularPartWholeSource: true,
      safeCurricularPartWholeTarget: true,
    }
  }

  return {
    kind: 'curricular-atomic',
    profileClass: null,
    fwuClasses: [LP_SUBJECT_SPECIFIC_COMPETENCY],
    safeCurricularPartWholeSource: false,
    safeCurricularPartWholeTarget: true,
  }
}

const runtimeClusterClassification = (): GoalFwuClassification => ({
  kind: 'runtime-cluster',
  profileClass: `${SP}RuntimeClusterGoal`,
  fwuClasses: [],
  safeCurricularPartWholeSource: false,
  safeCurricularPartWholeTarget: false,
})

const unscopedCurricularAtomicClassification = (): GoalFwuClassification => ({
  kind: 'unscoped-curricular-atomic',
  profileClass: `${SP}UnscopedCurricularGoal`,
  fwuClasses: [],
  safeCurricularPartWholeSource: false,
  safeCurricularPartWholeTarget: false,
})

const refineRuntimeOnlyClusters = (
  goals: JsonValue[],
  classifications: Map<string, GoalFwuClassification>,
) => {
  let changed = true
  while (changed) {
    changed = false
    goals.forEach((goal) => {
      const data = jsonObject(goal, 'canonical goal')
      const goalId = stringValue(data.id)
      const children = stringArray(data.contains)
      if (!goalId || children.length === 0 || classifications.get(goalId)?.kind !== 'curricular-cluster') {
        return
      }
      const childKinds = children.map((childId) => classifications.get(childId)?.kind)
      if (childKinds.every((kind) => kind !== 'curricular-atomic' && kind !== 'curricular-cluster')) {
        classifications.set(goalId, runtimeClusterClassification())
        changed = true
      }
    })
  }
}

const classifyGoalsForFwu = (goals: JsonValue[]) => {
  const classifications = new Map<string, GoalFwuClassification>()
  goals.forEach((goal) => {
    const data = jsonObject(goal, 'canonical goal')
    const goalId = stringValue(data.id)
    if (goalId) {
      classifications.set(goalId, classifyGoalForFwu(data, stringArray(data.contains)))
    }
  })
  refineRuntimeOnlyClusters(goals, classifications)
  const childrenOfCurricularAreas = new Set<string>()
  goals.forEach((goal) => {
    const data = jsonObject(goal, 'canonical goal')
    const goalId = stringValue(data.id)
    if (goalId && classifications.get(goalId)?.kind === 'curricular-cluster') {
      stringArray(data.contains).forEach((childId) => childrenOfCurricularAreas.add(childId))
    }
  })
  classifications.forEach((classification, goalId) => {
    if (classification.kind === 'curricular-atomic' && !childrenOfCurricularAreas.has(goalId)) {
      classifications.set(goalId, unscopedCurricularAtomicClassification())
    }
  })
  return classifications
}

const shouldWriteStrictCurricularPart = (
  source: GoalFwuClassification,
  target: GoalFwuClassification | undefined,
) => Boolean(target?.safeCurricularPartWholeTarget && source.safeCurricularPartWholeSource)

const compactJsonLiteral = (value: JsonValue | undefined) => value === undefined ? null : JSON.stringify(value)

const compactResourceLinksForRdf = (value: JsonValue | undefined): JsonValue | undefined => {
  if (!Array.isArray(value)) {
    return value
  }
  return value.map((link) => {
    if (!link || typeof link !== 'object' || Array.isArray(link)) {
      return link
    }
    return link.type === 'goal-visualization' && link.resourceType === 'image' ? null : link
  })
}

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

const hasUnsafeJsonString = (value: JsonValue): boolean => {
  if (typeof value === 'string') {
    return hasUnsafeRdfLiteralCharacters(value)
  }
  if (Array.isArray(value)) {
    return value.some(hasUnsafeJsonString)
  }
  if (value && typeof value === 'object') {
    return Object.values(value).some(hasUnsafeJsonString)
  }
  return false
}

const escapeLiteral = (value: string) => {
  if (hasUnsafeRdfLiteralCharacters(value)) {
    throw new Error('RDF literal contains a forbidden control character or an unpaired surrogate.')
  }
  let escaped = ''
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index]
    const code = value.charCodeAt(index)
    if (char === '\\') escaped += '\\\\'
    else if (char === '"') escaped += '\\"'
    else if (char === '\n') escaped += '\\n'
    else if (char === '\r') escaped += '\\r'
    else if (char === '\t') escaped += '\\t'
    else if (code < 0x20) escaped += `\\u${code.toString(16).padStart(4, '0').toUpperCase()}`
    else escaped += char
  }
  return escaped
}

const escapeIri = (value: string) => value
  .replace(/\\/gu, '%5C')
  .replace(/</gu, '%3C')
  .replace(/>/gu, '%3E')
  .replace(/"/gu, '%22')
  .replace(/\s/gu, (match) => encodeURIComponent(match))

const iri = (value: string): TripleObject => ({ kind: 'iri', value })

const literal = (value: string | number | boolean, datatype?: string): TripleObject => ({
  kind: 'literal',
  value: String(value),
  datatype,
})

const langLiteral = (value: string, lang: string): TripleObject => ({ kind: 'literal', value, lang })

const formatObject = (object: TripleObject) => {
  if (object.kind === 'iri') {
    return `<${escapeIri(object.value)}>`
  }
  const datatype = object.datatype ? `^^<${escapeIri(object.datatype)}>` : ''
  const lang = object.lang ? `@${object.lang}` : ''
  return `"${escapeLiteral(object.value)}"${lang}${datatype}`
}

const tripleLine = (subject: string, predicate: string, object: TripleObject) => `<${escapeIri(subject)}> <${escapeIri(predicate)}> ${formatObject(object)} .\n`

const idSegment = (value: string) => encodeURIComponent(value)

const packageIri = (archiveRoot: string) => `${ID}package/${idSegment(archiveRoot)}`

const fileIri = (archiveRoot: string, entryPath: string) => `${packageIri(archiveRoot)}/file/${idSegment(entryPath)}`

const lineIri = (archiveRoot: string, entryPath: string, index: number) => `${fileIri(archiveRoot, entryPath)}/line/${index}`

const goalIri = (archiveRoot: string, goalId: string) => `${packageIri(archiveRoot)}/goal/${idSegment(goalId)}`

const goalTextIri = (goal: string, kind: 'title' | 'description' | 'number', language?: string) => (
  `${goal}/${kind}${language ? `/${idSegment(language)}` : ''}`
)

const didacticPrerequisiteIri = (archiveRoot: string, sourceGoalId: string, targetGoalId: string) => (
  `${goalIri(archiveRoot, sourceGoalId)}/didactic-prerequisite/${idSegment(targetGoalId)}`
)

const competencyReferenceIri = (archiveRoot: string, sourceGoalId: string, competencyId: string) => (
  `${goalIri(archiveRoot, sourceGoalId)}/competency-reference/${idSegment(competencyId)}`
)

const processAxisId = (code: string) => `PROCESS.${code}`
const guidingIdeaAxisId = (code: string) => `GUIDING.${code}`
const processAxisIri = (archiveRoot: string, code: string) => `${packageIri(archiveRoot)}/competency/${idSegment(processAxisId(code))}`
const guidingIdeaAxisIri = (archiveRoot: string, code: string) => `${packageIri(archiveRoot)}/guiding-idea/${idSegment(code)}`

const GUIDING_IDEA_TITLES = new Map<string, string>([
  ['L1', 'Leitidee L1'],
  ['L2', 'Leitidee L2'],
  ['L3', 'Leitidee L3'],
  ['L4', 'Leitidee L4'],
  ['L5', 'Leitidee L5'],
])

const goalVisualizationReferenceIri = (archiveRoot: string, goalId: string, order: number) => (
  `${goalIri(archiveRoot, goalId)}/goal-visualization/${order}`
)

const packageAssetIri = (archiveRoot: string, packagePath: string) => (
  `${packageIri(archiveRoot)}/asset/${idSegment(packagePath)}`
)

const sourceGoalIri = (archiveRoot: string, sourceGoalId: string) => `${packageIri(archiveRoot)}/source-goal/${idSegment(sourceGoalId)}`

const sourceDocumentIri = (archiveRoot: string, sourceKey: string) => `${packageIri(archiveRoot)}/source-document/${idSegment(sourceKey)}`

const collectionIri = (archiveRoot: string, extractionId: string) => `${packageIri(archiveRoot)}/source-collection/${idSegment(extractionId)}`

const mappingRecordIri = (archiveRoot: string, entryPath: string, index: number) => `${fileIri(archiveRoot, entryPath)}/mapping/${index}`

const decisionRecordIri = (archiveRoot: string, entryPath: string, index: number) => `${fileIri(archiveRoot, entryPath)}/decision/${index}`

const semanticMappingRecordIri = (archiveRoot: string, jurisdiction: string | null, entryPath: string, kind: 'canonical' | 'review', index: number) => (
  `${packageIri(archiveRoot)}/mapping/${idSegment(jurisdiction ?? 'unknown')}/${kind}/${sha256(entryPath).slice(0, 12)}/${index}`
)

const semanticMappingFileIri = (archiveRoot: string, entryPath: string) => (
  `${packageIri(archiveRoot)}/mapping-file/${sha256(entryPath).slice(0, 12)}`
)

const viewIri = (archiveRoot: string, entryPath: string) => `${fileIri(archiveRoot, entryPath)}/view`

const semanticViewIri = (archiveRoot: string, viewId: string | null, entryPath: string) => (
  `${packageIri(archiveRoot)}/composition-view/${idSegment(viewId ?? sha256(entryPath).slice(0, 12))}`
)

const viewNodeIri = (view: string, path: string) => `${view}/node/${idSegment(path)}`

const deckIri = (archiveRoot: string, entryPath: string, deckId: string, language: string | null) => (
  `${fileIri(archiveRoot, entryPath)}/deck/${idSegment(deckId)}${language ? `/${idSegment(language)}` : ''}`
)

const cardIri = (archiveRoot: string, entryPath: string, cardId: string) => `${fileIri(archiveRoot, entryPath)}/card/${idSegment(cardId)}`

const semanticDeckIri = (archiveRoot: string, deckId: string, language: string | null) => (
  `${packageIri(archiveRoot)}/card-deck/${idSegment(deckId)}${language ? `/${idSegment(language)}` : ''}`
)

const semanticCardIri = (deck: string, cardId: string) => `${deck}/card/${idSegment(cardId)}`

const writeProfile = (
  profilePath: string,
  options: { includeCarrier?: boolean } = {},
) => {
  mkdirSync(dirname(profilePath), { recursive: true })
  const carrierTerms = options.includeCarrier === false ? '' : `
sp:PackageFile a owl:Class ; rdfs:label "UTF-8 ZIP package file"@en .
sp:textLine a owl:ObjectProperty ; rdfs:label "lossless UTF-8 carrier text line"@en .
sp:hasFile a owl:ObjectProperty ; rdfs:domain sp:SkillPilotPackage ; rdfs:range sp:PackageFile .
sp:lineText a owl:DatatypeProperty ; rdfs:label "line text"@en .
sp:lineCount a owl:DatatypeProperty ; rdfs:label "line count"@en .
sp:endsWithNewline a owl:DatatypeProperty ; rdfs:label "ends with newline"@en .
sp:sourceIndexSummaryJson a owl:DatatypeProperty ; rdfs:label "source index summary JSON"@en .
`
  writeFileSync(profilePath, `@prefix sp: <${SP}> .
@prefix lp: <${LP}> .
@prefix bfo: <${BFO}> .
@prefix iao: <${IAO}> .
@prefix schema: <${SCHEMA}> .
@prefix owl: <${OWL}> .
@prefix rdfs: <${RDFS}> .
@prefix dcterms: <${DCTERMS}> .

<${SP}> a owl:Ontology ;
  owl:imports <${LP_CORE_ONTOLOGY}> ;
  dcterms:title "SkillPilot MEM/FWU Roundtrip Profile"@en ;
  dcterms:description "Minimal SkillPilot profile used to test whether a SkillPilot competence landscape can be carried through a MEM-compatible RDF/OWL representation based on the FWU Lehrplan-Ontologie and reconstructed afterwards."@en .

sp:SkillPilotPackage a owl:Class ; rdfs:label "SkillPilot release package"@en .
sp:SkillLandscape a owl:Class ; rdfs:label "SkillPilot skill landscape"@en .
sp:LearningGoal a owl:Class ;
  rdfs:label "SkillPilot learning goal"@en ;
  rdfs:comment "A SkillPilot graph node used for learning navigation. This application-level notion is not automatically a FWU competence or competency specification."@en .
sp:AtomicGoal a owl:Class ; rdfs:subClassOf sp:LearningGoal ; rdfs:label "SkillPilot atomic graph node"@en .
sp:ClusterGoal a owl:Class ; rdfs:subClassOf sp:LearningGoal ; rdfs:label "SkillPilot cluster graph node"@en .
sp:RuntimeClusterGoal a owl:Class ;
  rdfs:subClassOf sp:ClusterGoal ;
  rdfs:label "SkillPilot runtime-only cluster"@en ;
  rdfs:comment "A learner-facing grouping whose children are application nodes rather than curricular elements."@en .
sp:UnscopedCurricularGoal a owl:Class ;
  rdfs:subClassOf sp:AtomicGoal ;
  rdfs:label "Unscoped curricular goal"@en ;
  rdfs:comment "A curricular learning goal that cannot safely be asserted as an FWU competency specification until it has a named curricular-area parent."@en .
sp:ProgramStructureGoal a owl:Class ;
  rdfs:subClassOf sp:ClusterGoal ;
  rdfs:label "SkillPilot program structure node"@en ;
  rdfs:comment "A SkillPilot navigation node for program structures such as roots, stages, or year levels. It is not treated as a FWU CE-Bereich unless that semantics is asserted separately."@en .
sp:PracticeOrAssessmentGoal a owl:Class ;
  rdfs:subClassOf sp:LearningGoal ;
  rdfs:label "SkillPilot practice or assessment node"@en .
sp:MemorizationGoal a owl:Class ;
  rdfs:subClassOf sp:AtomicGoal ;
  rdfs:label "SkillPilot memorization goal"@en .
sp:OrientationGoal a owl:Class ;
  rdfs:subClassOf sp:AtomicGoal ;
  rdfs:label "SkillPilot orientation goal"@en .
sp:CompetencyCatalogEntry a owl:Class ; rdfs:label "Competency catalog entry"@en .
sp:ProgramUnit a owl:Class ; rdfs:label "Curricular program unit"@en .
sp:GoalPlacement a owl:Class ; rdfs:label "Goal placement in a program unit"@en .
sp:CompositionView a owl:Class ; rdfs:label "Learner-facing composition view"@en .
sp:CompositionNode a owl:Class ; rdfs:label "Learner-facing composition node"@en .
sp:MappingFile a owl:Class ; rdfs:label "Mapping file metadata"@en .
sp:MappingRecord a owl:Class ; rdfs:label "Canonical curriculum mapping record"@en .
sp:ReviewDecision a owl:Class ; rdfs:label "Reviewed source-to-canonical mapping decision"@en .
sp:SourceCollection a owl:Class ; rdfs:label "Curriculum source extraction collection"@en .
sp:SourceDocument a owl:Class ; rdfs:subClassOf iao:IAO_0000030 ; rdfs:label "Official curriculum source document"@en .
sp:SourceGoalReference a owl:Class ; rdfs:subClassOf lp:LP_0030065 ; rdfs:label "Source goal reference with official text span"@en .
sp:GoalVisualizationReference a owl:Class ;
  rdfs:label "Runtime goal visualization reference"@en ;
  rdfs:comment "Application reference used only when the source graph node is not a curricular element."@en .
sp:CardDeck a owl:Class ; rdfs:label "Memorization card deck"@en .
sp:Card a owl:Class ; rdfs:label "Memorization card"@en .
sp:ExternalGoalReference a owl:Class ; rdfs:label "External goal reference"@en .

sp:hasLandscape a owl:ObjectProperty ; rdfs:domain sp:SkillPilotPackage ; rdfs:range sp:SkillLandscape .
sp:fwuOntologyIri a owl:ObjectProperty ; rdfs:domain sp:SkillPilotPackage ; rdfs:label "FWU ontology IRI"@en .
sp:fwuOntologyRepository a owl:ObjectProperty ; rdfs:domain sp:SkillPilotPackage ; rdfs:label "FWU ontology repository"@en .
sp:hasCompetencyCatalogEntry a owl:ObjectProperty ; rdfs:domain sp:SkillLandscape ; rdfs:range sp:CompetencyCatalogEntry .
sp:hasProgramUnit a owl:ObjectProperty ; rdfs:domain sp:SkillLandscape ; rdfs:range sp:ProgramUnit .
sp:hasGoalPlacement a owl:ObjectProperty ; rdfs:domain sp:SkillLandscape ; rdfs:range sp:GoalPlacement .
sp:hasGoal a owl:ObjectProperty ; rdfs:domain sp:SkillLandscape ; rdfs:range sp:LearningGoal .
sp:placedGoal a owl:ObjectProperty ; rdfs:domain sp:GoalPlacement ; rdfs:range sp:LearningGoal .
sp:placedInProgramUnit a owl:ObjectProperty ; rdfs:domain sp:GoalPlacement ; rdfs:range sp:ProgramUnit .
sp:containsGoal a owl:ObjectProperty ;
  rdfs:domain sp:LearningGoal ;
  rdfs:range sp:LearningGoal ;
  rdfs:comment "Direct SkillPilot containment edge retained as the lossless adjacency anchor; strict curricular edges additionally use transitive BFO has-part semantics."@en .
sp:didacticRequires a owl:ObjectProperty ;
  rdfs:domain sp:LearningGoal ;
  rdfs:range sp:LearningGoal ;
  rdfs:comment "Direct runtime prerequisite edge used only when either endpoint is not a curricular element; curricular prerequisite references use lp:LP_0000554."@en .
sp:hasGoalVisualization a owl:ObjectProperty ;
  rdfs:domain sp:LearningGoal ;
  rdfs:range sp:GoalVisualizationReference .
sp:referencesAsset a owl:ObjectProperty ;
  rdfs:domain sp:GoalVisualizationReference ;
  rdfs:range schema:ImageObject .
sp:competencyRef a owl:ObjectProperty ;
  rdfs:domain sp:LearningGoal ;
  rdfs:range sp:CompetencyCatalogEntry ;
  rdfs:comment "Runtime competency link used only when the source node is not a curricular element."@en .
sp:hasMappingRecord a owl:ObjectProperty ; rdfs:domain sp:SkillPilotPackage ; rdfs:range sp:MappingRecord .
sp:hasMappingFile a owl:ObjectProperty ; rdfs:domain sp:SkillPilotPackage ; rdfs:range sp:MappingFile .
sp:fromMappingFile a owl:ObjectProperty ; rdfs:range sp:MappingFile .
sp:hasReviewDecision a owl:ObjectProperty ; rdfs:domain sp:SkillPilotPackage ; rdfs:range sp:ReviewDecision .
sp:mapsSourceGoal a owl:ObjectProperty ; rdfs:domain sp:MappingRecord ; rdfs:range sp:SourceGoalReference .
sp:mapsCanonicalGoal a owl:ObjectProperty ; rdfs:domain sp:MappingRecord ; rdfs:range sp:LearningGoal .
sp:hasCompositionView a owl:ObjectProperty ; rdfs:domain sp:SkillPilotPackage ; rdfs:range sp:CompositionView .
sp:hasCompositionChild a owl:ObjectProperty ; rdfs:range sp:CompositionNode ; rdfs:label "has composition child"@en .
sp:compositionGoal a owl:ObjectProperty ; rdfs:domain sp:CompositionNode ; rdfs:range sp:LearningGoal .
sp:hasSourceCollection a owl:ObjectProperty ; rdfs:domain sp:SkillPilotPackage ; rdfs:range sp:SourceCollection .
sp:hasSourceDocument a owl:ObjectProperty ; rdfs:domain sp:SourceCollection ; rdfs:range sp:SourceDocument .
sp:hasSourceGoal a owl:ObjectProperty ; rdfs:domain sp:SourceCollection ; rdfs:range sp:SourceGoalReference .
sp:hasCardDeck a owl:ObjectProperty ; rdfs:domain sp:SkillPilotPackage ; rdfs:range sp:CardDeck .
sp:hasCard a owl:ObjectProperty ; rdfs:domain sp:CardDeck ; rdfs:range sp:Card .
sp:hasExternalGoalReference a owl:ObjectProperty ; rdfs:domain sp:SkillPilotPackage ; rdfs:range sp:ExternalGoalReference .

sp:skillpilotId a owl:DatatypeProperty ; rdfs:label "SkillPilot stable id"@en .
sp:zipPath a owl:DatatypeProperty ; rdfs:label "ZIP entry path"@en .
sp:archiveRoot a owl:DatatypeProperty ; rdfs:label "archive root"@en .
sp:sourceZipName a owl:DatatypeProperty ; rdfs:label "source ZIP file name"@en .
sp:sourceZipSha256 a owl:DatatypeProperty ; rdfs:label "source ZIP SHA-256 checksum"@en .
sp:fwuOntologyCommit a owl:DatatypeProperty ; rdfs:label "FWU ontology commit"@en .
sp:fwuOntologyCorePath a owl:DatatypeProperty ; rdfs:label "local FWU core ontology path"@en .
sp:sha256 a owl:DatatypeProperty ; rdfs:label "SHA-256 checksum"@en .
sp:byteLength a owl:DatatypeProperty ; rdfs:label "byte length"@en .
sp:shortKey a owl:DatatypeProperty ; rdfs:label "short key"@en .
sp:frameworkId a owl:DatatypeProperty ; rdfs:label "framework id"@en .
sp:locale a owl:DatatypeProperty ; rdfs:label "locale"@en .
sp:country a owl:DatatypeProperty ; rdfs:label "country"@en .
sp:region a owl:DatatypeProperty ; rdfs:label "region"@en .
sp:schoolType a owl:DatatypeProperty ; rdfs:label "school type"@en .
sp:subject a owl:DatatypeProperty ; rdfs:label "subject"@en .
sp:filtersJson a owl:DatatypeProperty ; rdfs:label "filter configuration JSON"@en .
sp:dimension a owl:DatatypeProperty ; rdfs:label "competency dimension"@en .
sp:kind a owl:DatatypeProperty ; rdfs:label "kind"@en .
sp:shortLabel a owl:DatatypeProperty ; rdfs:label "short label"@en .
sp:parentUnitId a owl:DatatypeProperty ; rdfs:label "parent program unit id"@en .
sp:contextJson a owl:DatatypeProperty ; rdfs:label "context JSON"@en .
sp:phase a owl:DatatypeProperty ; rdfs:label "phase"@en .
sp:area a owl:DatatypeProperty ; rdfs:label "area"@en .
sp:level a owl:DatatypeProperty ; rdfs:label "level"@en .
sp:courseLevel a owl:DatatypeProperty ; rdfs:label "course level"@en .
sp:core a owl:DatatypeProperty ; rdfs:label "core goal flag"@en .
sp:weight a owl:DatatypeProperty ; rdfs:label "progress weight"@en .
sp:applicabilityJson a owl:DatatypeProperty ; rdfs:label "applicability JSON"@en .
sp:metadataJson a owl:DatatypeProperty ; rdfs:label "metadata JSON"@en .
sp:resourceLinksJson a owl:DatatypeProperty ;
  rdfs:label "resource links JSON"@en ;
  rdfs:comment "Compact JSON fallback. Null positions reserve links represented as first-class RDF references."@en .
sp:extendedDataJson a owl:DatatypeProperty ; rdfs:label "extended data JSON"@en .
sp:releaseJson a owl:DatatypeProperty ; rdfs:label "release metadata JSON"@en .
sp:examDataJson a owl:DatatypeProperty ; rdfs:label "exam data JSON"@en .
sp:dimensionTag a owl:DatatypeProperty ; rdfs:label "dimension tag"@en .
sp:dimensionTagsJson a owl:DatatypeProperty ; rdfs:label "structured dimension tags JSON"@en .
sp:semanticAtomic a owl:DatatypeProperty ; rdfs:label "semantic atomicity flag"@en .
sp:goalType a owl:DatatypeProperty ; rdfs:label "goal type"@en .
sp:nodeKind a owl:DatatypeProperty ; rdfs:label "node kind"@en .
sp:tag a owl:DatatypeProperty ; rdfs:label "tag"@en .
sp:example a owl:DatatypeProperty ; rdfs:label "example reference"@en .
sp:relation a owl:DatatypeProperty ; rdfs:label "relation"@en .
sp:referenceRole a owl:DatatypeProperty ;
  rdfs:label "reference reconstruction role"@en ;
  rdfs:comment "Distinguishes authored competencyRefs from Core projections of structured dimension tags."@en .
sp:landscapeId a owl:DatatypeProperty ; rdfs:label "landscape id"@en .
sp:viewId a owl:DatatypeProperty ; rdfs:label "view id"@en .
sp:scopeJson a owl:DatatypeProperty ; rdfs:label "composition view scope JSON"@en .
sp:jurisdiction a owl:DatatypeProperty ; rdfs:label "jurisdiction"@en .
sp:decision a owl:DatatypeProperty ; rdfs:label "review decision"@en .
sp:topicCode a owl:DatatypeProperty ; rdfs:label "curricular topic code"@en .
sp:reviewedAt a owl:DatatypeProperty ; rdfs:label "review timestamp"@en .
sp:reviewer a owl:DatatypeProperty ; rdfs:label "reviewer"@en .
sp:schemaVersion a owl:DatatypeProperty ; rdfs:label "schema version"@en .
sp:version a owl:DatatypeProperty ; rdfs:label "version"@en .
sp:generatedAt a owl:DatatypeProperty ; rdfs:label "generation timestamp"@en .
sp:sourceExtractionId a owl:DatatypeProperty ; rdfs:label "source extraction id"@en .
sp:sourceLandscapeId a owl:DatatypeProperty ; rdfs:label "source landscape id"@en .
sp:sourceLandscapeTitle a owl:DatatypeProperty ; rdfs:label "source landscape title"@en .
sp:targetLandscapeId a owl:DatatypeProperty ; rdfs:label "target landscape id"@en .
sp:targetLandscapeTitle a owl:DatatypeProperty ; rdfs:label "target landscape title"@en .
sp:canonicalCurriculumId a owl:DatatypeProperty ; rdfs:label "canonical curriculum id"@en .
sp:stage a owl:DatatypeProperty ; rdfs:label "school stage"@en .
sp:statusJson a owl:DatatypeProperty ; rdfs:label "status JSON"@en .
sp:reviewId a owl:DatatypeProperty ; rdfs:label "review id"@en .
sp:reviewSummaryJson a owl:DatatypeProperty ; rdfs:label "review summary JSON"@en .
sp:courseLevelDecision a owl:DatatypeProperty ; rdfs:label "course-level decision"@en .
sp:courseLevelRationale a owl:DatatypeProperty ; rdfs:label "course-level rationale"@en .
sp:evidenceJson a owl:DatatypeProperty ; rdfs:label "review evidence JSON"@en .
sp:suggestedCanonicalGapJson a owl:DatatypeProperty ; rdfs:label "suggested canonical gap JSON"@en .
sp:legacyGoalId a owl:DatatypeProperty ; rdfs:label "legacy goal id"@en .
sp:matchType a owl:DatatypeProperty ; rdfs:label "mapping match type"@en .
sp:sourceDocumentKey a owl:DatatypeProperty ; rdfs:label "source document key"@en .
sp:landingUrl a owl:DatatypeProperty ; rdfs:label "source landing URL"@en .
sp:role a owl:DatatypeProperty ; rdfs:label "document role"@en .
sp:official a owl:DatatypeProperty ; rdfs:label "official source flag"@en .
sp:sourceText a owl:DatatypeProperty ; rdfs:label "official source text"@en .
sp:sourceSpan a owl:DatatypeProperty ; rdfs:label "official source span"@en .
sp:sourceRef a owl:DatatypeProperty ; rdfs:label "official source locator"@en .
sp:sourceTextSha256 a owl:DatatypeProperty ; rdfs:label "official source text SHA-256 checksum"@en .
sp:sourceDocumentUrl a owl:DatatypeProperty ; rdfs:label "source document URL"@en .
sp:sourceDocumentTitle a owl:DatatypeProperty ; rdfs:label "source document title"@en .
sp:sourceDocumentLandingUrl a owl:DatatypeProperty ; rdfs:label "source document landing URL"@en .
sp:sourceLine a owl:DatatypeProperty ; rdfs:label "source line number"@en .
sp:parentBulletText a owl:DatatypeProperty ; rdfs:label "parent bullet text"@en .
sp:passageJson a owl:DatatypeProperty ; rdfs:label "source passage JSON"@en .
sp:passageId a owl:DatatypeProperty ; rdfs:label "source passage id"@en .
sp:granularity a owl:DatatypeProperty ; rdfs:label "source reference granularity"@en .
sp:sourcePage a owl:DatatypeProperty ; rdfs:label "source page"@en .
sp:category a owl:DatatypeProperty ; rdfs:label "category"@en .
sp:language a owl:DatatypeProperty ; rdfs:label "language"@en .
sp:front a owl:DatatypeProperty ; rdfs:label "card front"@en .
sp:back a owl:DatatypeProperty ; rdfs:label "card back"@en .
sp:fromGoalId a owl:DatatypeProperty ; rdfs:label "source goal id for external dependency"@en .
sp:targetGoalId a owl:DatatypeProperty ; rdfs:label "target goal id for external dependency"@en .
sp:targetSubject a owl:DatatypeProperty ; rdfs:label "target subject for external dependency"@en .
sp:order a owl:DatatypeProperty ; rdfs:label "stable order"@en .
sp:viewNodeKind a owl:DatatypeProperty ; rdfs:domain sp:CompositionNode ; rdfs:label "composition node kind"@en .
sp:structureId a owl:DatatypeProperty ; rdfs:domain sp:CompositionNode ; rdfs:label "composition structure id"@en .
sp:displayLabel a owl:DatatypeProperty ; rdfs:domain sp:CompositionNode ; rdfs:label "composition display label"@en .
sp:quarantinedRecordJson a owl:DatatypeProperty ;
  rdfs:label "quarantined source record JSON"@en ;
  rdfs:comment "Lossless JSON fallback for a source record containing characters that cannot safely be materialized as RDF/OWL string literals."@en .

schema:ImageObject a owl:Class ; rdfs:subClassOf iao:IAO_0000030 .
schema:contentUrl a owl:DatatypeProperty .
schema:encodingFormat a owl:DatatypeProperty .
schema:provider a owl:DatatypeProperty .
schema:accessibilitySummary a owl:DatatypeProperty .
schema:license a owl:DatatypeProperty .
schema:creativeWorkStatus a owl:DatatypeProperty .
schema:inLanguage a owl:DatatypeProperty .
${carrierTerms}
`)
}

const ontologyCommit = (ontologyDir: string) => {
  if (!existsSync(resolve(ontologyDir, '.git'))) {
    return null
  }
  return execFileSync('git', ['-C', ontologyDir, 'rev-parse', 'HEAD'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim()
}

const ontologyCorePath = (ontologyDir: string) => resolve(ontologyDir, 'src/ontology/components/lehrplan-core.owl')

const writeOntologyCatalog = (catalogPath: string) => {
  mkdirSync(dirname(catalogPath), { recursive: true })
  writeFileSync(catalogPath, `<?xml version="1.0" encoding="UTF-8"?>
<catalog xmlns="urn:oasis:names:tc:entity:xmlns:xml:catalog" prefer="system">
  <uri name="${LP_CORE_ONTOLOGY}" uri="ontology/lehrplan-core.owl"/>
</catalog>
`)
}

const writeBoundCore = (outputDir: string, sourceCorePath: string) => {
  const bundledCorePath = resolve(outputDir, 'ontology/lehrplan-core.owl')
  const catalogPath = resolve(outputDir, 'catalog-v001.xml')
  mkdirSync(dirname(bundledCorePath), { recursive: true })
  writeFileSync(bundledCorePath, readFileSync(sourceCorePath))
  writeOntologyCatalog(catalogPath)
  return { bundledCorePath, catalogPath }
}

const requireOntologyCore = (ontologyDir: string) => {
  const corePath = ontologyCorePath(ontologyDir)
  if (!existsSync(corePath)) {
    throw new Error(`FWU core ontology is missing: ${repoRelative(corePath)}`)
  }
  const coreRepoPath = toPosixPath(relative(ontologyDir, corePath))
  const coreStatus = execFileSync('git', ['status', '--porcelain', '--', coreRepoPath], {
    cwd: ontologyDir,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim()
  if (coreStatus) {
    throw new Error(`FWU core working-tree file is not clean: ${coreStatus}`)
  }
  const committedCore = execFileSync('git', ['show', `HEAD:${coreRepoPath}`], {
    cwd: ontologyDir,
    maxBuffer: ZIP_COMMAND_MAX_BUFFER_BYTES,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  if (sha256(committedCore) !== sha256File(corePath)) {
    throw new Error('FWU core file does not match the recorded ontology HEAD commit.')
  }
  const syntax = readFileSync(corePath, 'utf8').replace(/\s+/gu, '')
  const declarations = new Map<string, { kind: 'Class' | 'DataProperty' | 'NamedIndividual' | 'ObjectProperty'; iri: string }>([
    ['subject-specific competency', { kind: 'Class', iri: LP_SUBJECT_SPECIFIC_COMPETENCY }],
    ['competency specification', { kind: 'Class', iri: LP_COMPETENCY_SPECIFICATION }],
    ['curricular area', { kind: 'Class', iri: LP_CURRICULAR_AREA }],
    ['process competency area', { kind: 'Class', iri: LP_PROCESS_COMPETENCY_AREA }],
    ['guiding idea', { kind: 'Class', iri: LP_GUIDING_IDEA }],
    ['reference', { kind: 'Class', iri: LP_REFERENCE }],
    ['didactic prerequisite', { kind: 'Class', iri: LP_DIDACTIC_PREREQUISITE }],
    ['school subject class', { kind: 'Class', iri: LP_SCHOOL_SUBJECT }],
    ['school type class', { kind: 'Class', iri: LP_SCHOOL_TYPE }],
    ['title class', { kind: 'Class', iri: LP_TITLE }],
    ['description class', { kind: 'Class', iri: LP_DESCRIPTION }],
    ['identifier class', { kind: 'Class', iri: LP_IDENTIFIER }],
    ['described-by property', { kind: 'ObjectProperty', iri: LP_DESCRIBED_BY }],
    ['school-subject property', { kind: 'ObjectProperty', iri: LP_HAS_SCHOOL_SUBJECT }],
    ['school-type property', { kind: 'ObjectProperty', iri: LP_FOR_TYPE_OF_SCHOOL }],
    ['grade property', { kind: 'ObjectProperty', iri: LP_HAS_GRADE }],
    ['stage property', { kind: 'ObjectProperty', iri: LP_HAS_STAGE }],
    ['federal-state property', { kind: 'ObjectProperty', iri: LP_OF_STATE }],
    ['unit property', { kind: 'ObjectProperty', iri: LP_HAS_UNIT }],
    ['requirement-level property', { kind: 'ObjectProperty', iri: LP_HAS_REQUIREMENT_LEVEL }],
    ['has-reference property', { kind: 'ObjectProperty', iri: LP_HAS_REFERENCE }],
    ['refers-to property', { kind: 'ObjectProperty', iri: LP_REFERS_TO }],
    ['has-description property', { kind: 'ObjectProperty', iri: LP_HAS_DESCRIPTION }],
    ['has-title property', { kind: 'ObjectProperty', iri: LP_HAS_TITLE }],
    ['has-number property', { kind: 'ObjectProperty', iri: LP_HAS_NUMBER }],
    ['BFO has-part property', { kind: 'ObjectProperty', iri: BFO_HAS_PART }],
    ['BFO part-of property', { kind: 'ObjectProperty', iri: BFO_PART_OF }],
    ['value property', { kind: 'DataProperty', iri: LP_VALUE }],
    ['reference position property', { kind: 'DataProperty', iri: LP_POSITION }],
    ['mathematics individual', { kind: 'NamedIndividual', iri: KIM_MATHEMATICS }],
    ['Gymnasium individual', { kind: 'NamedIndividual', iri: KIM_GYMNASIUM }],
  ])
  ;[
    ...FWU_GRADES.values(),
    ...FWU_STAGES.values(),
    ...FWU_REQUIREMENT_LEVELS.values(),
    ...FWU_STATE_BY_JURISDICTION.values(),
  ].forEach((individual) => declarations.set(`individual ${idSegment(individual)}`, { kind: 'NamedIndividual', iri: individual }))

  const requiredFragments = new Map<string, string>([
    ['canonical ontology IRI', `Ontology(<${LP_CORE_ONTOLOGY}>`],
    ['didactic prerequisite specialization', `SubClassOf(<${LP_DIDACTIC_PREREQUISITE}><${LP_REFERENCE}>)`],
    ['subject-specific competency specialization', `SubClassOf(<${LP_SUBJECT_SPECIFIC_COMPETENCY}><${LP_COMPETENCY_SPECIFICATION}>)`],
    ['competency specification area and title restrictions', `EquivalentClasses(<${LP_COMPETENCY_SPECIFICATION}>ObjectIntersectionOf(<${LP}LP_0000261>ObjectSomeValuesFrom(<${BFO_PART_OF}><${LP_CURRICULAR_AREA}>)ObjectSomeValuesFrom(<${LP_DESCRIBED_BY}><${LP_TITLE}>)`],
    ['BFO part inverse', `InverseObjectProperties(<${BFO_PART_OF}><${BFO_HAS_PART}>)`],
    ['process competency area specialization', `SubClassOf(<${LP_PROCESS_COMPETENCY_AREA}>ObjectIntersectionOf(<${LP}LP_0030263>ObjectHasValue(<${LP}LP_0000483><${LP}LP_0000500>)))`],
    ['guiding-idea specialization', `SubClassOf(<${LP_GUIDING_IDEA}>ObjectIntersectionOf(<${LP}LP_0030263>ObjectHasValue(<${LP}LP_0000483><${LP}LP_0000501>)))`],
    ['has-reference range', `ObjectPropertyRange(<${LP_HAS_REFERENCE}><${LP_REFERENCE}>)`],
    ['refers-to domain', `ObjectPropertyDomain(<${LP_REFERS_TO}><${LP_REFERENCE}>)`],
    ['unit parthood specialization', `SubObjectPropertyOf(<${LP_HAS_UNIT}><${BFO_HAS_PART}>)`],
    ['grade range', `ObjectPropertyRange(<${LP_HAS_GRADE}><${LP}LP_0000009>)`],
    ['stage range', `ObjectPropertyRange(<${LP_HAS_STAGE}><${LP}LP_0000020>)`],
    ['requirement-level range', `ObjectPropertyRange(<${LP_HAS_REQUIREMENT_LEVEL}><${LP}LP_0000037>)`],
    ['description range', `ObjectPropertyRange(<${LP_HAS_DESCRIPTION}><${LP_DESCRIPTION}>)`],
    ['title range', `ObjectPropertyRange(<${LP_HAS_TITLE}><${LP_TITLE}>)`],
    ['number range', `ObjectPropertyRange(<${LP_HAS_NUMBER}><${LP_IDENTIFIER}>)`],
    ['reference position range', `DataPropertyRange(<${LP_POSITION}>xsd:int)`],
  ])
  const missingContracts = [
    ...[...declarations]
      .filter(([, declaration]) => !syntax.includes(`Declaration(${declaration.kind}(<${declaration.iri}>))`))
      .map(([label]) => label),
    ...[...requiredFragments]
      .filter(([, fragment]) => !syntax.includes(fragment))
      .map(([label]) => label),
  ]
  if (missingContracts.length > 0) {
    throw new Error(`FWU core ontology does not satisfy the required contract: ${missingContracts.join(', ')}`)
  }
  return corePath
}

const binaryEntryPattern = /\.(?:avif|bmp|gif|ico|jpe?g|pdf|png|webp|zip)$/iu

const decodeZipEntryText = (entryPath: string, content: Buffer) => {
  if (binaryEntryPattern.test(entryPath) || content.includes(0)) {
    return null
  }
  const text = content.toString('utf8')
  return text.includes('\uFFFD') ? null : text
}

const readEntries = (zipPath: string) => {
  const entryPaths = listZipEntries(zipPath)
  const entryMetadata = listZipEntryMetadata(zipPath)
  const archiveRoot = archiveRootFrom(entryPaths)
  if (!archiveRoot || !isSafeArchiveRootSegment(archiveRoot)) {
    throw new Error('ZIP must contain exactly one archive root.')
  }
  if (new Set(entryPaths).size !== entryPaths.length) {
    throw new Error('ZIP contains duplicate entry names.')
  }
  if (
    entryMetadata.length !== entryPaths.length
    || entryMetadata.some((entry, index) => entry.path !== entryPaths[index])
    || entryMetadata.some((entry) => !entry.mode.startsWith('-'))
  ) {
    throw new Error('ZIP entries must all be regular files with unambiguous metadata.')
  }
  if (entryMetadata.some((entry) => (
    !Number.isSafeInteger(entry.uncompressedBytes)
    || entry.uncompressedBytes < 0
    || entry.uncompressedBytes > MAX_ZIP_ENTRY_UNCOMPRESSED_BYTES
  ))) {
    throw new Error(`ZIP entry exceeds the ${MAX_ZIP_ENTRY_UNCOMPRESSED_BYTES}-byte extraction limit.`)
  }
  const totalUncompressedBytes = entryMetadata.reduce((sum, entry) => sum + entry.uncompressedBytes, 0)
  if (!Number.isSafeInteger(totalUncompressedBytes) || totalUncompressedBytes > MAX_ZIP_TOTAL_UNCOMPRESSED_BYTES) {
    throw new Error(`ZIP exceeds the ${MAX_ZIP_TOTAL_UNCOMPRESSED_BYTES}-byte total extraction limit.`)
  }
  if (entryPaths.some((entryPath) => !isSafePackagePath(entryPath))) {
    throw new Error('ZIP contains a non-portable or unsafe entry path.')
  }
  const portableKeys = entryPaths.map((entryPath) => entryPath.normalize('NFC').toLowerCase())
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

  const entries = entryPaths.map((entryPath, index): ZipEntryRecord => {
    if (binaryEntryPattern.test(entryPath)) {
      return {
        path: entryPath,
        uncompressedBytes: entryMetadata[index].uncompressedBytes,
        content: null,
        text: null,
        sha256: null,
      }
    }
    const content = readZipEntry(zipPath, entryPath)
    return {
      path: entryPath,
      uncompressedBytes: entryMetadata[index].uncompressedBytes,
      content,
      text: decodeZipEntryText(entryPath, content),
      sha256: sha256(content),
    }
  })

  return { archiveRoot, entries }
}

const entryText = (entry: ZipEntryRecord, context: string) => {
  if (entry.text === null) {
    throw new Error(`Expected UTF-8 text for ${context}: ${entry.path}`)
  }
  return entry.text
}

const splitCarrierLines = (text: string) => {
  const endsWithNewline = text.endsWith('\n')
  const body = endsWithNewline ? text.slice(0, -1) : text
  const lines = body.length === 0 ? [] : body.split('\n')
  return { lines, endsWithNewline }
}

const writeCarrierTriples = (
  write: (line: string) => void,
  archiveRoot: string,
  entries: ZipEntryRecord[],
  counts: SemanticCounts,
) => {
  const root = packageIri(archiveRoot)
  entries.forEach((entry) => {
    if (entry.text === null || entry.content === null || entry.sha256 === null) {
      return
    }
    const file = fileIri(archiveRoot, entry.path)
    const { lines, endsWithNewline } = splitCarrierLines(entry.text)
    counts.files += 1
    counts.textLines += lines.length

    write(tripleLine(root, `${SP}hasFile`, iri(file)))
    write(tripleLine(file, `${RDF}type`, iri(`${SP}PackageFile`)))
    write(tripleLine(file, `${SP}zipPath`, literal(entry.path)))
    write(tripleLine(file, `${SP}sha256`, literal(entry.sha256)))
    write(tripleLine(file, `${SP}byteLength`, literal(entry.content.length, `${XSD}integer`)))
    write(tripleLine(file, `${SP}lineCount`, literal(lines.length, `${XSD}integer`)))
    write(tripleLine(file, `${SP}endsWithNewline`, literal(endsWithNewline, `${XSD}boolean`)))

    lines.forEach((line, index) => {
      const lineResource = lineIri(archiveRoot, entry.path, index)
      write(tripleLine(file, `${SP}textLine`, iri(lineResource)))
      write(tripleLine(lineResource, `${SP}lineText`, literal(line)))
    })
  })
}

const writeStringField = (
  write: (line: string) => void,
  subject: string,
  predicate: string,
  value: JsonValue | undefined,
  lang?: string,
) => {
  if (typeof value !== 'string') {
    return
  }
  write(tripleLine(subject, predicate, lang ? langLiteral(value, lang) : literal(value)))
}

const writeNumberField = (write: (line: string) => void, subject: string, predicate: string, value: JsonValue | undefined) => {
  const number = numberValue(value)
  if (number === null) {
    return
  }
  write(tripleLine(subject, predicate, literal(number, `${XSD}decimal`)))
}

const writeBooleanField = (write: (line: string) => void, subject: string, predicate: string, value: JsonValue | undefined) => {
  const boolean = booleanValue(value)
  if (boolean === null) {
    return
  }
  write(tripleLine(subject, predicate, literal(boolean, `${XSD}boolean`)))
}

const writeJsonField = (write: (line: string) => void, subject: string, predicate: string, value: JsonValue | undefined) => {
  const json = compactJsonLiteral(value)
  if (json === null) {
    return
  }
  write(tripleLine(subject, predicate, literal(json, `${XSD}string`)))
}

const writeCoreTextEntity = (
  write: (line: string) => void,
  subject: string,
  property: string,
  entity: string,
  entityClass: string,
  value: JsonValue | undefined,
  language?: string,
) => {
  const text = stringValue(value)
  if (!text) {
    return
  }
  write(tripleLine(subject, property, iri(entity)))
  if (property === LP_HAS_TITLE) {
    write(tripleLine(subject, LP_DESCRIBED_BY, iri(entity)))
  }
  write(tripleLine(entity, `${RDF}type`, iri(entityClass)))
  write(tripleLine(entity, LP_VALUE, language ? langLiteral(text, language) : literal(text)))
}

const writeCurricularTextSemantics = (
  write: (line: string) => void,
  resource: string,
  data: Record<string, JsonValue>,
) => {
  writeCoreTextEntity(write, resource, LP_HAS_TITLE, goalTextIri(resource, 'title', 'de'), LP_TITLE, data.title, 'de')
  writeCoreTextEntity(write, resource, LP_HAS_TITLE, goalTextIri(resource, 'title', 'en'), LP_TITLE, data.titleEn, 'en')
  writeCoreTextEntity(write, resource, LP_HAS_DESCRIPTION, goalTextIri(resource, 'description', 'de'), LP_DESCRIPTION, data.description, 'de')
  writeCoreTextEntity(write, resource, LP_HAS_DESCRIPTION, goalTextIri(resource, 'description', 'en'), LP_DESCRIPTION, data.descriptionEn, 'en')
  writeCoreTextEntity(write, resource, LP_HAS_NUMBER, goalTextIri(resource, 'number'), LP_IDENTIFIER, data.shortKey)
}

const findEntry = (entries: ZipEntryRecord[], archiveRoot: string, relativePath: string) => {
  const entryPath = `${archiveRoot}/${relativePath}`
  const entry = entries.find((candidate) => candidate.path === entryPath)
  if (!entry) {
    throw new Error(`Missing package entry: ${entryPath}`)
  }
  return entry
}

const readGoalClassifications = (archiveRoot: string, entries: ZipEntryRecord[]) => {
  const canonicalEntry = entries.find((entry) => (
    entry.path.startsWith(`${archiveRoot}/data/canonical/`) && entry.path.endsWith('.landscape.json')
  ))
  if (!canonicalEntry) {
    throw new Error('Package does not contain a canonical landscape JSON.')
  }
  const landscape = jsonObject(
    JSON.parse(entryText(canonicalEntry, 'canonical landscape')) as JsonValue,
    'canonical landscape',
  )
  return classifyGoalsForFwu(Array.isArray(landscape.goals) ? landscape.goals : [])
}

const requiredManifestString = (data: Record<string, JsonValue>, key: string, context: string) => {
  const value = stringValue(data[key])
  if (!value) {
    throw new Error(`Missing ${key} in ${context}.`)
  }
  return value
}

const requiredManifestInteger = (data: Record<string, JsonValue>, key: string, context: string) => {
  const value = numberValue(data[key])
  if (value === null || !Number.isSafeInteger(value) || value < 0) {
    throw new Error(`Expected non-negative integer ${key} in ${context}.`)
  }
  return value
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

const isSafePackagePath = (value: string) => (
  !value.startsWith('/')
  && !value.includes('\\')
  && value.split('/').every(isSafePackagePathSegment)
)

const isSafeArchiveRootSegment = (value: string) => (
  /^[A-Za-z0-9][A-Za-z0-9._-]*$/u.test(value)
  && isSafePackagePathSegment(value)
)

const readGoalVisualizationAssets = (archiveRoot: string, entries: ZipEntryRecord[]): GoalVisualizationAsset[] => {
  const manifestPath = `${archiveRoot}/data/resources/goal-visualizations.json`
  const manifestEntry = entries.find((entry) => entry.path === manifestPath)
  if (!manifestEntry) {
    // Backwards-compatible regression support for publication packages created
    // before visualization sidecars became part of the contract.
    return []
  }
  const manifest = jsonObject(
    JSON.parse(entryText(manifestEntry, 'goal visualization manifest')) as JsonValue,
    'goal visualization manifest',
  )
  if (numberValue(manifest.schemaVersion) !== 1) {
    throw new Error('Goal visualization manifest must use schemaVersion 1.')
  }
  if (!Array.isArray(manifest.assets)) {
    throw new Error('Goal visualization manifest must contain an assets array.')
  }

  const seenPaths = new Set<string>()
  const seenReferences = new Set<string>()
  const assets = manifest.assets.map((value, index): GoalVisualizationAsset => {
    const context = `goal visualization asset ${index}`
    const data = jsonObject(value, context)
    const packagePath = requiredManifestString(data, 'packagePath', context)
    const publicUrl = requiredManifestString(data, 'publicUrl', context)
    const mediaType = requiredManifestString(data, 'mediaType', context)
    const bytes = requiredManifestInteger(data, 'bytes', context)
    const order = requiredManifestInteger(data, 'order', context)
    const goalId = requiredManifestString(data, 'goalId', context)
    const digest = requiredManifestString(data, 'sha256', context).toLowerCase()
    if (!isSafePackagePath(packagePath)) {
      throw new Error(`Unsafe packagePath in ${context}: ${packagePath}`)
    }
    if (publicUrl !== `/${packagePath}`) {
      throw new Error(`publicUrl/packagePath mismatch in ${context}: ${publicUrl}`)
    }
    if (mediaType !== 'image/jpeg' && mediaType !== 'image/png') {
      throw new Error(`Unsupported mediaType in ${context}: ${mediaType}`)
    }
    if (!/^[a-f0-9]{64}$/u.test(digest)) {
      throw new Error(`Invalid SHA-256 in ${context}: ${digest}`)
    }
    if (seenPaths.has(packagePath)) {
      throw new Error(`Duplicate goal visualization packagePath: ${packagePath}`)
    }
    const referenceKey = `${goalId}\u0000${order}`
    if (seenReferences.has(referenceKey)) {
      throw new Error(`Duplicate goal visualization reference for ${goalId} at order ${order}.`)
    }
    seenPaths.add(packagePath)
    seenReferences.add(referenceKey)

    const zipPath = `${archiveRoot}/${packagePath}`
    const assetEntry = entries.find((entry) => entry.path === zipPath)
    if (!assetEntry) {
      throw new Error(`Missing indexed goal visualization sidecar: ${zipPath}`)
    }
    if (assetEntry.uncompressedBytes !== bytes) {
      throw new Error(`ZIP metadata byte-length mismatch in ${context}: ${assetEntry.uncompressedBytes} != ${bytes}`)
    }

    return {
      goalId,
      order,
      packagePath,
      publicUrl,
      mediaType,
      bytes,
      sha256: digest,
      skillpilotId: requiredManifestString(data, 'skillpilotId', context),
      role: requiredManifestString(data, 'role', context),
      title: requiredManifestString(data, 'title', context),
      provider: requiredManifestString(data, 'provider', context),
      description: requiredManifestString(data, 'description', context),
      altText: requiredManifestString(data, 'altText', context),
      lang: requiredManifestString(data, 'lang', context),
      license: requiredManifestString(data, 'license', context),
      reviewStatus: requiredManifestString(data, 'reviewStatus', context),
    }
  })
  const indexedPaths = new Set(assets.map((asset) => `${archiveRoot}/${asset.packagePath}`))
  if (assets.some((asset) => asset.bytes > MAX_GOAL_VISUALIZATION_BYTES)) {
    throw new Error(`A goal visualization exceeds the ${MAX_GOAL_VISUALIZATION_BYTES}-byte extraction limit.`)
  }
  const totalAssetBytes = assets.reduce((sum, asset) => sum + asset.bytes, 0)
  if (totalAssetBytes > MAX_GOAL_VISUALIZATION_TOTAL_BYTES) {
    throw new Error(`Goal visualizations exceed the ${MAX_GOAL_VISUALIZATION_TOTAL_BYTES}-byte total extraction limit.`)
  }
  const unindexedAssets = entries
    .filter((entry) => entry.path.startsWith(`${archiveRoot}/assets/goal-visualizations/`))
    .filter((entry) => !entry.path.endsWith('/'))
    .filter((entry) => !indexedPaths.has(entry.path))
  if (unindexedAssets.length > 0) {
    throw new Error(`Unindexed goal visualization sidecars: ${unindexedAssets.map((entry) => entry.path).join(', ')}`)
  }
  return assets
}

const assertNoUnsupportedBinaryEntries = (
  archiveRoot: string,
  entries: ZipEntryRecord[],
  goalVisualizationAssets: GoalVisualizationAsset[],
) => {
  const supportedPaths = new Set(goalVisualizationAssets.map((asset) => `${archiveRoot}/${asset.packagePath}`))
  const unsupportedPaths = entries
    .filter((entry) => entry.text === null && !entry.path.endsWith('/'))
    .map((entry) => entry.path)
    .filter((entryPath) => !supportedPaths.has(entryPath))
  if (unsupportedPaths.length > 0) {
    throw new Error(
      `Unsupported binary package entries would be lost by the current RDF carrier: ${unsupportedPaths.join(', ')}`,
    )
  }
}

const writeGoalVisualizationSemantics = (
  write: (line: string) => void,
  archiveRoot: string,
  assets: GoalVisualizationAsset[],
  counts: SemanticCounts,
  goalClassifications: Map<string, GoalFwuClassification>,
) => {
  assets.forEach((asset) => {
    const goal = goalIri(archiveRoot, asset.goalId)
    const reference = goalVisualizationReferenceIri(archiveRoot, asset.goalId, asset.order)
    const image = packageAssetIri(archiveRoot, asset.packagePath)
    const isCurricularSource = goalClassifications.get(asset.goalId)?.safeCurricularPartWholeTarget === true
    counts.goalVisualizations += 1

    if (isCurricularSource) {
      write(tripleLine(goal, LP_HAS_REFERENCE, iri(reference)))
      write(tripleLine(reference, `${RDF}type`, iri(LP_REFERENCE)))
      write(tripleLine(reference, LP_REFERS_TO, iri(image)))
      write(tripleLine(reference, LP_POSITION, literal(asset.order, `${XSD}int`)))
    } else {
      write(tripleLine(goal, `${SP}hasGoalVisualization`, iri(reference)))
      write(tripleLine(reference, `${RDF}type`, iri(`${SP}GoalVisualizationReference`)))
      write(tripleLine(reference, `${SP}referencesAsset`, iri(image)))
      write(tripleLine(reference, `${SP}order`, literal(asset.order, `${XSD}integer`)))
    }
    write(tripleLine(reference, `${SP}role`, literal(asset.role)))

    write(tripleLine(image, `${RDF}type`, iri(`${SCHEMA}ImageObject`)))
    write(tripleLine(image, `${SP}skillpilotId`, literal(asset.skillpilotId)))
    write(tripleLine(image, `${SP}zipPath`, literal(`${archiveRoot}/${asset.packagePath}`)))
    write(tripleLine(image, `${SP}sha256`, literal(asset.sha256)))
    write(tripleLine(image, `${SP}byteLength`, literal(asset.bytes, `${XSD}integer`)))
    write(tripleLine(image, `${SCHEMA}contentUrl`, literal(asset.publicUrl)))
    write(tripleLine(image, `${SCHEMA}encodingFormat`, literal(asset.mediaType)))
    write(tripleLine(image, `${SCHEMA}provider`, literal(asset.provider)))
    write(tripleLine(image, `${SCHEMA}accessibilitySummary`, langLiteral(asset.altText, asset.lang)))
    write(tripleLine(image, `${SCHEMA}license`, literal(asset.license)))
    write(tripleLine(image, `${SCHEMA}creativeWorkStatus`, literal(asset.reviewStatus)))
    write(tripleLine(image, `${SCHEMA}inLanguage`, literal(asset.lang)))
    write(tripleLine(image, `${DCTERMS}title`, langLiteral(asset.title, asset.lang)))
    write(tripleLine(image, `${DCTERMS}description`, langLiteral(asset.description, asset.lang)))
  })
}

const writeGoalVisualizationSidecars = (
  inputZipPath: string,
  outputDir: string,
  archiveRoot: string,
  entries: ZipEntryRecord[],
  assets: GoalVisualizationAsset[],
) => {
  if (assets.length === 0) return []

  const entryPaths = new Set(entries.map((entry) => entry.path))
  const zipPaths = assets.map((asset) => `${archiveRoot}/${asset.packagePath}`)
  zipPaths.forEach((zipPath) => {
    if (!entryPaths.has(zipPath)) {
      throw new Error(`Missing validated goal visualization entry: ${zipPath}`)
    }
  })

  const extractRoot = resolve(outputDir, '.goal-visualization-extract')
  rmSync(extractRoot, { recursive: true, force: true })
  mkdirSync(extractRoot, { recursive: true })
  try {
    chunkArgumentsByBytes(zipPaths.map((zipPath) => zipPath.replaceAll('[', '[[]'))).forEach((literalZipPatterns) => {
      execFileSync('unzip', ['-qq', '-o', inputZipPath, ...literalZipPatterns, '-d', extractRoot], {
        stdio: ['ignore', 'ignore', 'pipe'],
        maxBuffer: ZIP_COMMAND_MAX_BUFFER_BYTES,
      })
    })

    return assets.map((asset) => {
      const zipPath = `${archiveRoot}/${asset.packagePath}`
      const extracted = resolve(extractRoot, zipPath)
      const relativeExtracted = relative(extractRoot, extracted)
      if (relativeExtracted.startsWith('..') || isAbsolute(relativeExtracted) || !existsSync(extracted)) {
        throw new Error(`Bulk extraction did not produce the expected goal visualization: ${zipPath}`)
      }
      const extractedStat = lstatSync(extracted)
      if (!extractedStat.isFile()) {
        throw new Error(`Goal visualization is not a regular file: ${zipPath}`)
      }
      if (extractedStat.size !== asset.bytes) {
        throw new Error(`Byte-length mismatch for ${zipPath}: ${extractedStat.size} != ${asset.bytes}`)
      }
      const digest = sha256(readFileSync(extracted))
      if (digest !== asset.sha256) {
        throw new Error(`SHA-256 mismatch for ${zipPath}: ${digest} != ${asset.sha256}`)
      }
      const target = resolve(outputDir, asset.packagePath)
      const relativeTarget = relative(outputDir, target)
      if (relativeTarget.startsWith('..') || isAbsolute(relativeTarget)) {
        throw new Error(`Refusing to write goal visualization outside output directory: ${asset.packagePath}`)
      }
      mkdirSync(dirname(target), { recursive: true })
      rmSync(target, { force: true })
      renameSync(extracted, target)
      return {
        goalId: asset.goalId,
        order: asset.order,
        packagePath: asset.packagePath,
        zipPath,
        sidecarPath: repoRelative(target),
        mediaType: asset.mediaType,
        bytes: asset.bytes,
        sha256: asset.sha256,
      }
    })
  } finally {
    rmSync(extractRoot, { recursive: true, force: true })
  }
}

const writeIndependentFile = (target: string, content: Buffer) => {
  mkdirSync(dirname(target), { recursive: true })
  rmSync(target, { force: true })
  writeFileSync(target, content)
}

const writeLandscapeSemantics = (
  write: (line: string) => void,
  archiveRoot: string,
  entries: ZipEntryRecord[],
  counts: SemanticCounts,
  knownGoalClassifications?: Map<string, GoalFwuClassification>,
) => {
  const canonicalEntry = entries.find((entry) => (
    entry.path.startsWith(`${archiveRoot}/data/canonical/`) && entry.path.endsWith('.landscape.json')
  ))
  if (!canonicalEntry) {
    throw new Error('Package does not contain a canonical landscape JSON.')
  }

  const landscapeData = jsonObject(JSON.parse(entryText(canonicalEntry, 'canonical landscape')) as JsonValue, 'canonical landscape')
  const landscapeId = stringValue(landscapeData.id) ?? stringValue(landscapeData.landscapeId) ?? stringValue(landscapeData.frameworkId) ?? 'canonical-gymnasium-math'
  const landscape = `${packageIri(archiveRoot)}/landscape/${idSegment(landscapeId)}`
  const schoolType = KIM_GYMNASIUM

  write(tripleLine(packageIri(archiveRoot), `${SP}hasLandscape`, iri(landscape)))
  write(tripleLine(landscape, `${RDF}type`, iri(`${SP}SkillLandscape`)))
  write(tripleLine(landscape, LP_HAS_SCHOOL_SUBJECT, iri(KIM_MATHEMATICS)))
  write(tripleLine(KIM_MATHEMATICS, `${RDF}type`, iri(LP_SCHOOL_SUBJECT)))
  write(tripleLine(KIM_MATHEMATICS, `${SKOS}prefLabel`, langLiteral('Mathematik', 'de')))
  write(tripleLine(schoolType, `${RDF}type`, iri(LP_SCHOOL_TYPE)))
  write(tripleLine(schoolType, `${RDFS}label`, langLiteral('Gymnasium', 'de')))
  write(tripleLine(landscape, LP_FOR_TYPE_OF_SCHOOL, iri(schoolType)))
  writeStringField(write, landscape, `${SP}skillpilotId`, landscapeData.id)
  writeStringField(write, landscape, `${SP}skillpilotId`, landscapeData.landscapeId)
  writeStringField(write, landscape, `${SP}frameworkId`, landscapeData.frameworkId)
  writeStringField(write, landscape, `${SP}locale`, landscapeData.locale)
  writeStringField(write, landscape, `${SP}country`, landscapeData.country)
  writeStringField(write, landscape, `${SP}region`, landscapeData.region)
  writeStringField(write, landscape, `${SP}schoolType`, landscapeData.schoolType)
  writeStringField(write, landscape, `${SP}subject`, landscapeData.subject)
  writeStringField(write, landscape, `${DCTERMS}title`, landscapeData.title, 'de')
  writeStringField(write, landscape, `${DCTERMS}title`, landscapeData.titleEn, 'en')
  writeStringField(write, landscape, `${DCTERMS}description`, landscapeData.description, 'de')
  writeStringField(write, landscape, `${DCTERMS}description`, landscapeData.descriptionEn, 'en')
  writeJsonField(write, landscape, `${SP}filtersJson`, landscapeData.filters)

  const goals = Array.isArray(landscapeData.goals) ? landscapeData.goals : []
  const goalClassifications = knownGoalClassifications ?? classifyGoalsForFwu(goals)

  const competencyCatalog = Array.isArray(landscapeData.competencyCatalog) ? landscapeData.competencyCatalog : []
  competencyCatalog.forEach((entry) => {
    const data = jsonObject(entry, 'competency catalog entry')
    const competencyId = stringValue(data.id)
    if (!competencyId) {
      return
    }
    const resource = `${packageIri(archiveRoot)}/competency/${idSegment(competencyId)}`
    counts.competencyCatalogEntries += 1
    write(tripleLine(landscape, `${SP}hasCompetencyCatalogEntry`, iri(resource)))
    write(tripleLine(resource, `${RDF}type`, iri(`${SP}CompetencyCatalogEntry`)))
    write(tripleLine(resource, `${RDF}type`, iri(LP_PROCESS_COMPETENCY_AREA)))
    write(tripleLine(resource, LP_HAS_SCHOOL_SUBJECT, iri(KIM_MATHEMATICS)))
    write(tripleLine(resource, `${SP}skillpilotId`, literal(competencyId)))
    writeStringField(write, resource, `${RDFS}label`, data.label, 'de')
    writeStringField(write, resource, `${SP}dimension`, data.dimension)
    writeCoreTextEntity(write, resource, LP_HAS_TITLE, goalTextIri(resource, 'title', 'de'), LP_TITLE, data.label, 'de')
    writeCoreTextEntity(
      write,
      resource,
      LP_HAS_NUMBER,
      goalTextIri(resource, 'number'),
      LP_IDENTIFIER,
      competencyId.replace(/^PROCESS\./u, ''),
    )
  })

  const curricularDimensionTags = goals.flatMap((goalValue) => {
    const goal = jsonObject(goalValue, 'canonical goal')
    const goalId = stringValue(goal.id)
    const classification = goalId ? goalClassifications.get(goalId) : undefined
    const dimensionTags = optionalJsonObject(goal.dimensionTags)
    return classification?.safeCurricularPartWholeTarget && dimensionTags ? [dimensionTags] : []
  })
  const processCodes = new Set(curricularDimensionTags
    .flatMap((dimensionTags) => stringArray(dimensionTags.processCompetencies))
    .filter((code) => /^K[1-6](?:\.\d+)?$/u.test(code)))
  const guidingIdeaCodes = new Set(curricularDimensionTags
    .flatMap((dimensionTags) => stringArray(dimensionTags.guidingIdeas))
    .filter((code) => /^L[1-5]$/u.test(code)))
  const catalogIds = new Set(competencyCatalog.flatMap((entryValue) => {
    const entry = jsonObject(entryValue, 'competency catalog entry')
    return stringValue(entry.id) ? [String(entry.id)] : []
  }))

  ;[...processCodes].sort(compareCodeUnits).forEach((code) => {
    const resource = processAxisIri(archiveRoot, code)
    const axisId = processAxisId(code)
    if (!catalogIds.has(axisId)) {
      write(tripleLine(resource, `${RDF}type`, iri(LP_PROCESS_COMPETENCY_AREA)))
      write(tripleLine(resource, LP_HAS_SCHOOL_SUBJECT, iri(KIM_MATHEMATICS)))
      write(tripleLine(resource, `${SP}skillpilotId`, literal(axisId)))
      write(tripleLine(resource, `${RDFS}label`, langLiteral(code, 'de')))
      writeCoreTextEntity(write, resource, LP_HAS_TITLE, goalTextIri(resource, 'title', 'de'), LP_TITLE, code, 'de')
      writeCoreTextEntity(write, resource, LP_HAS_NUMBER, goalTextIri(resource, 'number'), LP_IDENTIFIER, code)
    }
    const parentCode = code.match(/^(K[1-6])\./u)?.[1]
    if (parentCode) {
      write(tripleLine(processAxisIri(archiveRoot, parentCode), BFO_HAS_PART, iri(resource)))
    }
  })

  ;[...guidingIdeaCodes].sort(compareCodeUnits).forEach((code) => {
    const resource = guidingIdeaAxisIri(archiveRoot, code)
    const title = GUIDING_IDEA_TITLES.get(code) ?? code
    write(tripleLine(resource, `${RDF}type`, iri(LP_GUIDING_IDEA)))
    write(tripleLine(resource, LP_HAS_SCHOOL_SUBJECT, iri(KIM_MATHEMATICS)))
    write(tripleLine(resource, `${SP}skillpilotId`, literal(guidingIdeaAxisId(code))))
    write(tripleLine(resource, `${RDFS}label`, langLiteral(title, 'de')))
    writeCoreTextEntity(write, resource, LP_HAS_TITLE, goalTextIri(resource, 'title', 'de'), LP_TITLE, title, 'de')
    writeCoreTextEntity(write, resource, LP_HAS_NUMBER, goalTextIri(resource, 'number'), LP_IDENTIFIER, code)
  })
  counts.coreAxisEntries += new Set([
    ...[...catalogIds].filter((id) => /^PROCESS\.K[1-6](?:\.\d+)?$/u.test(id)),
    ...[...processCodes].map(processAxisId),
    ...[...guidingIdeaCodes].map(guidingIdeaAxisId),
  ]).size

  const programUnits = Array.isArray(landscapeData.programUnits) ? landscapeData.programUnits : []
  programUnits.forEach((unit) => {
    const data = jsonObject(unit, 'program unit')
    const unitId = stringValue(data.id)
    if (!unitId) {
      return
    }
    const resource = `${packageIri(archiveRoot)}/program-unit/${idSegment(unitId)}`
    counts.programUnits += 1
    write(tripleLine(landscape, `${SP}hasProgramUnit`, iri(resource)))
    write(tripleLine(resource, `${RDF}type`, iri(`${SP}ProgramUnit`)))
    write(tripleLine(resource, `${SP}skillpilotId`, literal(unitId)))
    writeStringField(write, resource, `${RDFS}label`, data.label, 'de')
    writeStringField(write, resource, `${SP}shortLabel`, data.shortLabel)
    writeStringField(write, resource, `${SP}kind`, data.kind)
    writeStringField(write, resource, `${SP}parentUnitId`, data.parentUnitId)
    writeNumberField(write, resource, `${SP}order`, data.order)
    writeJsonField(write, resource, `${SP}contextJson`, data.context)
    const grade = FWU_GRADES.get(unitId)
    const year = unitId.match(/^de-gym-math-j([0-9]+)$/u)?.[1]
    const yearNumber = year ? Number(year) : null
    const stage = FWU_STAGES.get(unitId)
      ?? (yearNumber !== null && yearNumber <= 10 ? FWU_STAGES.get('de-gym-math-sek1') : undefined)
      ?? (yearNumber !== null && yearNumber > 10 ? FWU_STAGES.get('de-gym-math-sek2') : undefined)
      ?? (/^de-gym-math-(?:e|q[1-4])$/u.test(unitId) ? FWU_STAGES.get('de-gym-math-sek2') : undefined)
    if (grade) {
      write(tripleLine(resource, LP_HAS_GRADE, iri(grade)))
    }
    if (stage) {
      write(tripleLine(resource, LP_HAS_STAGE, iri(stage)))
    }
    const parentUnitId = stringValue(data.parentUnitId)
    if (parentUnitId) {
      write(tripleLine(`${packageIri(archiveRoot)}/program-unit/${idSegment(parentUnitId)}`, LP_HAS_UNIT, iri(resource)))
    }
  })

  const strictCurricularChildren = new Set<string>()
  goals.forEach((goal) => {
    const data = jsonObject(goal, 'canonical goal')
    const goalId = stringValue(data.id)
    if (!goalId) {
      return
    }
    const sourceClassification = goalClassifications.get(goalId)
    stringArray(data.contains).forEach((targetId) => {
      if (sourceClassification && shouldWriteStrictCurricularPart(sourceClassification, goalClassifications.get(targetId))) {
        strictCurricularChildren.add(targetId)
      }
    })
  })

  goals.forEach((goal) => {
    const data = jsonObject(goal, 'canonical goal')
    const goalId = stringValue(data.id)
    if (!goalId) {
      return
    }
    const resource = goalIri(archiveRoot, goalId)
    const contains = stringArray(data.contains)
    const requires = stringArray(data.requires)
    counts.canonicalGoals += 1
    counts.containsEdges += contains.length
    counts.requiresEdges += requires.length

    const classification = goalClassifications.get(goalId) ?? classifyGoalForFwu(data, contains)
    write(tripleLine(landscape, `${SP}hasGoal`, iri(resource)))
    if (classification.safeCurricularPartWholeTarget && !strictCurricularChildren.has(goalId)) {
      write(tripleLine(landscape, BFO_HAS_PART, iri(resource)))
    }
    write(tripleLine(resource, `${RDF}type`, iri(`${SP}LearningGoal`)))
    write(tripleLine(resource, `${RDF}type`, iri(data.type === 'cluster' || contains.length > 0 ? `${SP}ClusterGoal` : `${SP}AtomicGoal`)))
    if (classification.profileClass) {
      write(tripleLine(resource, `${RDF}type`, iri(classification.profileClass)))
    }
    classification.fwuClasses.forEach((fwuClass) => {
      write(tripleLine(resource, `${RDF}type`, iri(fwuClass)))
    })
    write(tripleLine(resource, `${SP}skillpilotId`, literal(goalId)))
    writeStringField(write, resource, `${SP}shortKey`, data.shortKey)
    writeStringField(write, resource, `${RDFS}label`, data.title, 'de')
    writeStringField(write, resource, `${RDFS}label`, data.titleEn, 'en')
    writeStringField(write, resource, `${DCTERMS}description`, data.description, 'de')
    writeStringField(write, resource, `${DCTERMS}description`, data.descriptionEn, 'en')
    if (classification.safeCurricularPartWholeTarget) {
      writeCurricularTextSemantics(write, resource, data)
      write(tripleLine(resource, LP_HAS_SCHOOL_SUBJECT, iri(KIM_MATHEMATICS)))
      const level = data.level === undefined || data.level === null ? null : String(data.level)
      const requirementLevel = level ? FWU_REQUIREMENT_LEVELS.get(level) : undefined
      if (requirementLevel) {
        write(tripleLine(resource, LP_HAS_REQUIREMENT_LEVEL, iri(requirementLevel)))
      }
    }
    writeStringField(write, resource, `${SP}phase`, data.phase)
    writeStringField(write, resource, `${SP}area`, data.area)
    writeStringField(write, resource, `${SP}level`, data.level)
    writeStringField(write, resource, `${SP}courseLevel`, data.courseLevel)
    writeStringField(write, resource, `${SP}sourceRef`, data.sourceRef)
    writeStringField(write, resource, `${SP}goalType`, data.type)
    writeStringField(write, resource, `${SP}nodeKind`, data.nodeKind)
    writeBooleanField(write, resource, `${SP}core`, data.core)
    writeNumberField(write, resource, `${SP}weight`, data.weight)
    writeBooleanField(write, resource, `${SP}semanticAtomic`, data.semanticAtomic)
    writeJsonField(write, resource, `${SP}applicabilityJson`, data.applicability)
    writeJsonField(write, resource, `${SP}metadataJson`, data.metadata)
    writeJsonField(write, resource, `${SP}resourceLinksJson`, compactResourceLinksForRdf(data.resourceLinks))
    writeJsonField(write, resource, `${SP}extendedDataJson`, data.extendedData)
    writeJsonField(write, resource, `${SP}releaseJson`, data.release)
    writeJsonField(write, resource, `${SP}examDataJson`, data.examData)
    stringArray(data.tags).forEach((tag) => write(tripleLine(resource, `${SP}tag`, literal(tag))))
    if (Array.isArray(data.dimensionTags)) {
      stringArray(data.dimensionTags).forEach((tag) => write(tripleLine(resource, `${SP}dimensionTag`, literal(tag))))
    }
    writeJsonField(write, resource, `${SP}dimensionTagsJson`, data.dimensionTags)
    stringArray(data.examples).forEach((example) => write(tripleLine(resource, `${SP}example`, literal(example))))
    const authoredCompetencyIds = [...new Set([...stringArray(data.kompetenzen), ...stringArray(data.competencyRefs)])]
      .map((competencyId) => /^K[1-6](?:\.\d+)?$/u.test(competencyId) ? processAxisId(competencyId) : competencyId)
    if (classification.safeCurricularPartWholeTarget) {
      const references = new Map<string, { roles: Set<string>; target: string }>()
      const addReferenceRole = (axisId: string, target: string, role: string) => {
        const existing = references.get(axisId) ?? { roles: new Set<string>(), target }
        existing.roles.add(role)
        references.set(axisId, existing)
      }
      authoredCompetencyIds.forEach((competencyId) => {
        addReferenceRole(
          competencyId,
          `${packageIri(archiveRoot)}/competency/${idSegment(competencyId)}`,
          REFERENCE_ROLE_COMPETENCY_REFS,
        )
      })
      const dimensionTags = optionalJsonObject(data.dimensionTags)
      stringArray(dimensionTags?.processCompetencies)
        .filter((code) => processCodes.has(code))
        .forEach((code) => addReferenceRole(processAxisId(code), processAxisIri(archiveRoot, code), REFERENCE_ROLE_PROCESS_COMPETENCIES))
      stringArray(dimensionTags?.guidingIdeas)
        .filter((code) => guidingIdeaCodes.has(code))
        .forEach((code) => addReferenceRole(guidingIdeaAxisId(code), guidingIdeaAxisIri(archiveRoot, code), REFERENCE_ROLE_GUIDING_IDEAS))

      ;[...references].sort(([left], [right]) => compareCodeUnits(left, right)).forEach(([axisId, referenceData]) => {
        const reference = competencyReferenceIri(archiveRoot, goalId, axisId)
        write(tripleLine(resource, LP_HAS_REFERENCE, iri(reference)))
        write(tripleLine(reference, `${RDF}type`, iri(LP_REFERENCE)))
        write(tripleLine(reference, LP_REFERS_TO, iri(referenceData.target)))
        ;[...referenceData.roles].sort(compareCodeUnits).forEach((role) => {
          write(tripleLine(reference, `${SP}referenceRole`, literal(role)))
        })
      })
      counts.coreAxisReferences += references.size
    } else {
      authoredCompetencyIds.forEach((competencyId) => {
        write(tripleLine(resource, `${SP}competencyRef`, iri(`${packageIri(archiveRoot)}/competency/${idSegment(competencyId)}`)))
      })
    }
    contains.forEach((targetId) => {
      const target = iri(goalIri(archiveRoot, targetId))
      write(tripleLine(resource, `${SP}containsGoal`, target))
      if (shouldWriteStrictCurricularPart(classification, goalClassifications.get(targetId))) {
        write(tripleLine(resource, BFO_HAS_PART, target))
      }
    })
    requires.forEach((targetId) => {
      const targetClassification = goalClassifications.get(targetId)
      if (classification.safeCurricularPartWholeTarget && targetClassification?.safeCurricularPartWholeTarget) {
        const prerequisite = didacticPrerequisiteIri(archiveRoot, goalId, targetId)
        write(tripleLine(resource, LP_HAS_REFERENCE, iri(prerequisite)))
        write(tripleLine(prerequisite, `${RDF}type`, iri(LP_DIDACTIC_PREREQUISITE)))
        write(tripleLine(prerequisite, LP_REFERS_TO, iri(goalIri(archiveRoot, targetId))))
      } else {
        write(tripleLine(resource, `${SP}didacticRequires`, iri(goalIri(archiveRoot, targetId))))
      }
    })
  })

  const placements = Array.isArray(landscapeData.goalPlacements) ? landscapeData.goalPlacements : []
  placements.forEach((placement, index) => {
    const data = jsonObject(placement, 'goal placement')
    const goalId = stringValue(data.goalId)
    const unitId = stringValue(data.unitId)
    if (!goalId || !unitId) {
      return
    }
    const resource = `${packageIri(archiveRoot)}/goal-placement/${index}`
    counts.goalPlacements += 1
    write(tripleLine(landscape, `${SP}hasGoalPlacement`, iri(resource)))
    write(tripleLine(resource, `${RDF}type`, iri(`${SP}GoalPlacement`)))
    write(tripleLine(resource, `${SP}placedGoal`, iri(goalIri(archiveRoot, goalId))))
    write(tripleLine(resource, `${SP}placedInProgramUnit`, iri(`${packageIri(archiveRoot)}/program-unit/${idSegment(unitId)}`)))
    writeStringField(write, resource, `${SP}relation`, data.relation)
    writeJsonField(write, resource, `${SP}contextJson`, data.context)
  })
}

const walkViewNodes = (
  write: (line: string) => void,
  archiveRoot: string,
  view: string,
  nodes: JsonValue[],
  parent: string,
  counts: SemanticCounts,
  pathPrefix: string,
) => {
  nodes.forEach((node, index) => {
    const data = jsonObject(node, 'composition view node')
    const nodePath = `${pathPrefix}.${index}`
    const resource = viewNodeIri(view, nodePath)
    counts.compositionNodes += 1
    write(tripleLine(parent, `${SP}hasCompositionChild`, iri(resource)))
    write(tripleLine(resource, `${RDF}type`, iri(`${SP}CompositionNode`)))
    write(tripleLine(resource, `${SP}order`, literal(index, `${XSD}integer`)))
    writeStringField(write, resource, `${SP}viewNodeKind`, data.kind)
    writeStringField(write, resource, `${SP}structureId`, data.id)
    writeStringField(write, resource, `${RDFS}label`, data.label, 'de')
    writeStringField(write, resource, `${SP}displayLabel`, data.displayLabel)
    const goalId = stringValue(data.goalId)
    if (goalId) {
      write(tripleLine(resource, `${SP}compositionGoal`, iri(goalIri(archiveRoot, goalId))))
    }
    const children = Array.isArray(data.children) ? data.children : []
    if (children.length > 0) {
      walkViewNodes(write, archiveRoot, view, children, resource, counts, nodePath)
    }
  })
}

const writeViewSemantics = (
  write: (line: string) => void,
  archiveRoot: string,
  entries: ZipEntryRecord[],
  counts: SemanticCounts,
  options: { semanticIris?: boolean } = {},
) => {
  entries
    .filter((entry) => entry.path.startsWith(`${archiveRoot}/data/views/`) && entry.path.endsWith('.view.json'))
    .forEach((entry) => {
      const data = jsonObject(JSON.parse(entryText(entry, 'composition view')) as JsonValue, 'composition view')
      const viewId = stringValue(data.id) ?? stringValue(data.viewId)
      const view = options.semanticIris
        ? semanticViewIri(archiveRoot, viewId, entry.path)
        : viewIri(archiveRoot, entry.path)
      counts.compositionViews += 1
      write(tripleLine(packageIri(archiveRoot), `${SP}hasCompositionView`, iri(view)))
      write(tripleLine(view, `${RDF}type`, iri(`${SP}CompositionView`)))
      write(tripleLine(view, `${SP}zipPath`, literal(entry.path)))
      writeStringField(write, view, `${SP}landscapeId`, data.landscapeId)
      writeStringField(write, view, `${SP}viewId`, viewId)
      writeStringField(write, view, `${RDFS}label`, data.label, 'de')
      writeJsonField(write, view, `${SP}scopeJson`, data.scope)
      const rootNodes = Array.isArray(data.rootNodes) ? data.rootNodes : []
      walkViewNodes(write, archiveRoot, view, rootNodes, view, counts, 'root')
    })
}

const jurisdictionFromEntryPath = (entryPath: string) => {
  const match = entryPath.match(/\/data\/mappings\/(DE-[A-Z]{2})\//u)
  return match?.[1] ?? null
}

const sourceGoalIdFromReviewDecision = (data: Record<string, JsonValue>) => (
  stringValue(data.sourceGoalId) ?? stringValue(data.legacyGoalId) ?? stringValue(data.reviewDecisionId)
)

const writeMappingSemantics = (
  write: (line: string) => void,
  archiveRoot: string,
  entries: ZipEntryRecord[],
  counts: SemanticCounts,
  options: { semanticIris?: boolean } = {},
) => {
  entries
    .filter((entry) => entry.path.startsWith(`${archiveRoot}/data/mappings/`) && entry.path.endsWith('.json'))
    .forEach((entry) => {
      const data = jsonObject(JSON.parse(entryText(entry, 'mapping file')) as JsonValue, 'mapping file')
      const jurisdiction = jurisdictionFromEntryPath(entry.path)
      const mappingFile = options.semanticIris ? semanticMappingFileIri(archiveRoot, entry.path) : fileIri(archiveRoot, entry.path)
      write(tripleLine(packageIri(archiveRoot), `${SP}hasMappingFile`, iri(mappingFile)))
      write(tripleLine(mappingFile, `${RDF}type`, iri(`${SP}MappingFile`)))
      write(tripleLine(mappingFile, `${SP}zipPath`, literal(entry.path)))
      writeStringField(write, mappingFile, `${DCTERMS}title`, data.title)
      writeStringField(write, mappingFile, `${SP}jurisdiction`, data.jurisdiction)
      if (!stringValue(data.jurisdiction)) {
        writeStringField(write, mappingFile, `${SP}jurisdiction`, jurisdiction)
      }
      writeJsonField(write, mappingFile, `${SP}schemaVersion`, data.schemaVersion)
      writeJsonField(write, mappingFile, `${SP}version`, data.version)
      writeStringField(write, mappingFile, `${SP}generatedAt`, data.generatedAt)
      writeStringField(write, mappingFile, `${SP}sourceExtractionId`, data.sourceExtractionId)
      writeStringField(write, mappingFile, `${SP}sourceLandscapeId`, data.sourceLandscapeId)
      writeStringField(write, mappingFile, `${SP}sourceLandscapeTitle`, data.sourceLandscapeTitle)
      writeStringField(write, mappingFile, `${SP}targetLandscapeId`, data.targetLandscapeId)
      writeStringField(write, mappingFile, `${SP}targetLandscapeTitle`, data.targetLandscapeTitle)
      writeStringField(write, mappingFile, `${SP}canonicalCurriculumId`, data.canonicalCurriculumId)
      writeStringField(write, mappingFile, `${SP}stage`, data.stage)
      writeStringField(write, mappingFile, `${SP}subject`, data.subject)
      writeJsonField(write, mappingFile, `${SP}statusJson`, data.status)
      writeStringField(write, mappingFile, `${SP}reviewId`, data.reviewId)
      writeJsonField(write, mappingFile, `${SP}reviewSummaryJson`, data.reviewSummary)
      if (entry.path.endsWith('.review.json')) {
        const decisions = Array.isArray(data.decisions) ? data.decisions : Array.isArray(data.mappings) ? data.mappings : []
        decisions.forEach((decision, index) => {
        const decisionData = jsonObject(decision, 'review decision')
        const sourceGoalId = sourceGoalIdFromReviewDecision(decisionData)
        const resource = options.semanticIris
          ? semanticMappingRecordIri(archiveRoot, jurisdiction, entry.path, 'review', index)
          : decisionRecordIri(archiveRoot, entry.path, index)
          counts.reviewDecisions += 1
          write(tripleLine(packageIri(archiveRoot), `${SP}hasReviewDecision`, iri(resource)))
          write(tripleLine(resource, `${RDF}type`, iri(`${SP}ReviewDecision`)))
          write(tripleLine(resource, `${SP}fromMappingFile`, iri(mappingFile)))
          write(tripleLine(resource, `${SP}zipPath`, literal(entry.path)))
          writeStringField(write, resource, `${SP}jurisdiction`, jurisdiction)
          writeStringField(write, resource, `${SP}decision`, decisionData.decision)
          writeStringField(write, resource, `${SP}topicCode`, decisionData.topicCode)
          writeStringField(write, resource, `${SP}matchType`, decisionData.matchType)
          writeStringField(write, resource, `${SP}courseLevelDecision`, decisionData.courseLevelDecision)
          writeStringField(write, resource, `${SP}courseLevelRationale`, decisionData.courseLevelRationale)
          writeStringField(write, resource, `${SP}reviewedAt`, decisionData.reviewedAt)
          writeStringField(write, resource, `${SP}reviewer`, decisionData.reviewer)
          writeJsonField(write, resource, `${SP}evidenceJson`, decisionData.evidence)
          writeJsonField(write, resource, `${SP}suggestedCanonicalGapJson`, decisionData.suggestedCanonicalGap)
          if (sourceGoalId) {
            write(tripleLine(resource, `${SP}mapsSourceGoal`, iri(sourceGoalIri(archiveRoot, sourceGoalId))))
          }
          stringArray(decisionData.canonicalGoalIds).forEach((goalId) => {
            write(tripleLine(resource, `${SP}mapsCanonicalGoal`, iri(goalIri(archiveRoot, goalId))))
          })
        })
        return
      }

      const mappings = Array.isArray(data.mappings) ? data.mappings : []
      mappings.forEach((mapping, index) => {
        const mappingData = jsonObject(mapping, 'canonical mapping')
        const canonicalGoalId = stringValue(mappingData.canonicalGoalId)
        const legacyGoalId = stringValue(mappingData.legacyGoalId)
        if (!canonicalGoalId || !legacyGoalId) {
          return
        }
        const resource = options.semanticIris
          ? semanticMappingRecordIri(archiveRoot, jurisdiction, entry.path, 'canonical', index)
          : mappingRecordIri(archiveRoot, entry.path, index)
        counts.canonicalMappings += 1
        write(tripleLine(packageIri(archiveRoot), `${SP}hasMappingRecord`, iri(resource)))
        write(tripleLine(resource, `${RDF}type`, iri(`${SP}MappingRecord`)))
        write(tripleLine(resource, `${SP}fromMappingFile`, iri(mappingFile)))
        write(tripleLine(resource, `${SP}zipPath`, literal(entry.path)))
        writeStringField(write, resource, `${SP}jurisdiction`, jurisdiction)
        writeStringField(write, resource, `${SP}legacyGoalId`, legacyGoalId)
        writeStringField(write, resource, `${SP}matchType`, mappingData.matchType)
        write(tripleLine(resource, `${SP}mapsCanonicalGoal`, iri(goalIri(archiveRoot, canonicalGoalId))))
      })
    })
}

const writeSourceSemantics = (
  write: (line: string) => void,
  archiveRoot: string,
  entries: ZipEntryRecord[],
  counts: SemanticCounts,
  options: { includeSourceIndexSummary?: boolean } = {},
) => {
  const sourceReferencesEntry = findEntry(entries, archiveRoot, 'data/sources/source-goal-references.json')
  const sourceReferences = jsonObject(JSON.parse(entryText(sourceReferencesEntry, 'source-goal references')) as JsonValue, 'source-goal references')
  const sources = Array.isArray(sourceReferences.sources) ? sourceReferences.sources : []

  sources.forEach((source) => {
    const sourceData = jsonObject(source, 'source collection')
    const extractionId = stringValue(sourceData.extractionId)
    if (!extractionId) {
      return
    }
    const collection = collectionIri(archiveRoot, extractionId)
    counts.sourceCollections += 1
    write(tripleLine(packageIri(archiveRoot), `${SP}hasSourceCollection`, iri(collection)))
    write(tripleLine(collection, `${RDF}type`, iri(`${SP}SourceCollection`)))
    write(tripleLine(collection, `${SP}skillpilotId`, literal(extractionId)))
    writeStringField(write, collection, `${SP}jurisdiction`, sourceData.jurisdiction)
    writeStringField(write, collection, `${SP}sourceLandscapeId`, sourceData.sourceLandscapeId)
    writeStringField(write, collection, `${SP}stage`, sourceData.stage)
    writeStringField(write, collection, `${SP}subject`, sourceData.subject)
    const jurisdiction = stringValue(sourceData.jurisdiction)
    const federalState = jurisdiction ? FWU_STATE_BY_JURISDICTION.get(jurisdiction) : undefined
    if (federalState) {
      write(tripleLine(collection, LP_OF_STATE, iri(federalState)))
    }

    const documents = Array.isArray(sourceData.sourceDocuments) ? sourceData.sourceDocuments : []
    documents.forEach((document) => {
      const documentData = jsonObject(document, 'source document')
      const key = stringValue(documentData.key) ?? `${extractionId}-document-${counts.sourceDocuments}`
      const documentResource = sourceDocumentIri(archiveRoot, `${extractionId}/${key}`)
      counts.sourceDocuments += 1
      write(tripleLine(collection, `${SP}hasSourceDocument`, iri(documentResource)))
      write(tripleLine(documentResource, `${RDF}type`, iri(`${SP}SourceDocument`)))
      writeStringField(write, documentResource, `${SP}sourceDocumentKey`, key)
      writeStringField(write, documentResource, `${DCTERMS}title`, documentData.title, 'de')
      writeStringField(write, documentResource, `${DCTERMS}source`, documentData.url)
      writeStringField(write, documentResource, `${SP}landingUrl`, documentData.landingUrl)
      writeStringField(write, documentResource, `${SP}role`, documentData.role)
      writeBooleanField(write, documentResource, `${SP}official`, documentData.official)
    })

    const goals = Array.isArray(sourceData.sourceGoals) ? sourceData.sourceGoals : []
    goals.forEach((goal) => {
      const goalData = jsonObject(goal, 'source goal')
      const sourceGoalId = stringValue(goalData.sourceGoalId)
      if (!sourceGoalId) {
        return
      }
      const resource = sourceGoalIri(archiveRoot, sourceGoalId)
      const documentKey = stringValue(goalData.sourceDocumentKey)
      counts.sourceGoals += 1
      write(tripleLine(collection, `${SP}hasSourceGoal`, iri(resource)))
      write(tripleLine(collection, LP_HAS_REFERENCE, iri(resource)))
      write(tripleLine(resource, `${RDF}type`, iri(`${SP}SourceGoalReference`)))
      write(tripleLine(resource, `${SP}skillpilotId`, literal(sourceGoalId)))
      if (documentKey) {
        const documentResource = sourceDocumentIri(archiveRoot, `${extractionId}/${documentKey}`)
        write(tripleLine(resource, LP_REFERS_TO, iri(documentResource)))
        write(tripleLine(resource, `${DCTERMS}source`, iri(documentResource)))
      }
      const isQuarantined = hasUnsafeJsonString(goalData)
      if (isQuarantined) {
        writeJsonField(write, resource, `${SP}quarantinedRecordJson`, goalData)
      }
      const writeSafeSourceString = (predicate: string, value: JsonValue | undefined, lang?: string) => {
        if (typeof value === 'string' && !hasUnsafeRdfLiteralCharacters(value)) {
          writeStringField(write, resource, predicate, value, lang)
        }
      }
      writeSafeSourceString(`${RDFS}label`, goalData.title, 'de')
      writeSafeSourceString(`${DCTERMS}description`, goalData.description, 'de')
      writeSafeSourceString(`${SP}sourceText`, goalData.sourceText)
      writeSafeSourceString(`${SP}sourceSpan`, goalData.sourceSpan)
      writeSafeSourceString(`${SP}sourceRef`, goalData.sourceRef)
      writeSafeSourceString(`${SP}sourceTextSha256`, goalData.sourceTextSha256)
      writeSafeSourceString(`${SP}sourceDocumentUrl`, goalData.sourceDocumentUrl)
      writeSafeSourceString(`${SP}sourceDocumentLandingUrl`, goalData.sourceDocumentLandingUrl)
      writeSafeSourceString(`${SP}sourceDocumentTitle`, goalData.sourceDocumentTitle, 'de')
      writeSafeSourceString(`${SP}topicCode`, goalData.topicCode)
      writeSafeSourceString(`${SP}passageId`, goalData.passageId)
      writeSafeSourceString(`${SP}granularity`, goalData.granularity)
      writeNumberField(write, resource, `${SP}sourcePage`, goalData.sourcePage)
      writeNumberField(write, resource, `${SP}sourceLine`, goalData.sourceLine)
      writeSafeSourceString(`${SP}parentBulletText`, goalData.parentBulletText)
      writeJsonField(write, resource, `${SP}passageJson`, goalData.passage)
      writeSafeSourceString(`${SP}phase`, goalData.phase)
      writeSafeSourceString(`${SP}courseLevel`, goalData.courseLevel)
      writeSafeSourceString(`${SP}category`, goalData.category)
    })
  })

  if (options.includeSourceIndexSummary !== false) {
    const sourceIndexEntry = findEntry(entries, archiveRoot, 'data/sources/source-index.json')
    const sourceIndex = jsonObject(JSON.parse(entryText(sourceIndexEntry, 'source index')) as JsonValue, 'source index')
    writeJsonField(write, packageIri(archiveRoot), `${SP}sourceIndexSummaryJson`, sourceIndex)
  }
}

const writeCardSemantics = (
  write: (line: string) => void,
  archiveRoot: string,
  entries: ZipEntryRecord[],
  counts: SemanticCounts,
  options: { semanticIris?: boolean } = {},
) => {
  const cardIndexEntry = entries.find((entry) => entry.path === `${archiveRoot}/data/cards/card-index.json`)
  const cardIndexDecks = cardIndexEntry
    ? (jsonObject(JSON.parse(entryText(cardIndexEntry, 'card index')) as JsonValue, 'card index').decks)
    : []
  const cardIndexByPath = new Map(
    (Array.isArray(cardIndexDecks) ? cardIndexDecks : [])
      .map((deck) => jsonObject(deck, 'card index deck'))
      .flatMap((deck) => {
        const packagePath = stringValue(deck.packagePath)
        return packagePath ? [[packagePath, deck] as const] : []
      }),
  )
  const cardEntries = entries.filter((entry) => (
    entry.path.startsWith(`${archiveRoot}/data/cards/`)
    && entry.path.endsWith('.json')
    && !entry.path.endsWith('/card-index.json')
  ))

  cardEntries.forEach((entry) => {
    const data = jsonObject(JSON.parse(entryText(entry, 'card deck')) as JsonValue, 'card deck')
    const deckId = stringValue(data.deckId)
    if (!deckId) {
      return
    }
    const packagePath = entry.path.slice(`${archiveRoot}/`.length)
    const cardIndexDeck = cardIndexByPath.get(packagePath)
    const language = stringValue(data.language) ?? stringValue(cardIndexDeck?.language)
    const deck = options.semanticIris
      ? semanticDeckIri(archiveRoot, deckId, language)
      : deckIri(archiveRoot, entry.path, deckId, language)
    counts.cardDecks += 1
    write(tripleLine(packageIri(archiveRoot), `${SP}hasCardDeck`, iri(deck)))
    write(tripleLine(deck, `${RDF}type`, iri(`${SP}CardDeck`)))
    write(tripleLine(deck, `${SP}skillpilotId`, literal(deckId)))
    write(tripleLine(deck, `${SP}zipPath`, literal(entry.path)))
    writeStringField(write, deck, `${RDFS}label`, stringValue(data.title) ?? stringValue(cardIndexDeck?.title) ?? undefined)
    writeStringField(write, deck, `${SP}language`, data.language)
    if (!stringValue(data.language)) {
      writeStringField(write, deck, `${SP}language`, cardIndexDeck?.language)
    }
    writeStringField(write, deck, `${SP}landscapeId`, data.landscapeId)

    const cards = Array.isArray(data.cards) ? data.cards : []
    cards.forEach((card, index) => {
      const cardData = jsonObject(card, 'card')
      const cardId = stringValue(cardData.id) ?? `card-${index}`
      const resource = options.semanticIris
        ? semanticCardIri(deck, cardId)
        : cardIri(archiveRoot, entry.path, cardId)
      counts.cards += 1
      write(tripleLine(deck, `${SP}hasCard`, iri(resource)))
      write(tripleLine(resource, `${RDF}type`, iri(`${SP}Card`)))
      write(tripleLine(resource, `${SP}skillpilotId`, literal(cardId)))
      write(tripleLine(resource, `${SP}order`, literal(index, `${XSD}integer`)))
      writeStringField(write, resource, `${SP}front`, cardData.front)
      writeStringField(write, resource, `${SP}back`, cardData.back)
      writeStringField(write, resource, `${SP}category`, cardData.category)
      stringArray(cardData.tags).forEach((tag) => write(tripleLine(resource, `${SP}tag`, literal(tag))))
    })
  })
}

const writeExternalDependencySemantics = (
  write: (line: string) => void,
  archiveRoot: string,
  entries: ZipEntryRecord[],
  counts: SemanticCounts,
  options: { semanticIris?: boolean } = {},
) => {
  const dependencyEntry = findEntry(entries, archiveRoot, 'data/dependencies/external-goal-references.json')
  const data = jsonObject(JSON.parse(entryText(dependencyEntry, 'external dependencies')) as JsonValue, 'external dependencies')
  const references = Array.isArray(data.references) ? data.references : []
  references.forEach((reference, index) => {
    const referenceData = jsonObject(reference, 'external dependency reference')
    const resource = options.semanticIris
      ? `${packageIri(archiveRoot)}/external-goal-reference/${index}`
      : `${fileIri(archiveRoot, dependencyEntry.path)}/external-reference/${index}`
    counts.externalGoalReferences += 1
    write(tripleLine(packageIri(archiveRoot), `${SP}hasExternalGoalReference`, iri(resource)))
    write(tripleLine(resource, `${RDF}type`, iri(`${SP}ExternalGoalReference`)))
    writeStringField(write, resource, `${SP}fromGoalId`, referenceData.fromGoalId)
    writeStringField(write, resource, `${SP}targetGoalId`, referenceData.targetGoalId)
    writeStringField(write, resource, `${SP}relation`, referenceData.relation)
    writeStringField(write, resource, `${SP}targetSubject`, referenceData.targetSubject)
    writeStringField(write, resource, `${SP}targetLandscapeId`, referenceData.targetLandscapeId)
  })
}

const writePackageHeaderSemantics = (
  write: (line: string) => void,
  archiveRoot: string,
  inputZipPath: string,
  ontologyDir: string,
) => {
  const root = packageIri(archiveRoot)
  const commit = ontologyCommit(ontologyDir)
  const corePath = requireOntologyCore(ontologyDir)
  write(tripleLine(root, `${RDF}type`, iri(`${SP}SkillPilotPackage`)))
  write(tripleLine(root, `${DCTERMS}title`, langLiteral('SkillPilot Gymnasium Mathematik v0.1.0', 'de')))
  write(tripleLine(root, `${SP}archiveRoot`, literal(archiveRoot)))
  write(tripleLine(root, `${SP}sourceZipName`, literal(basename(inputZipPath))))
  write(tripleLine(root, `${SP}sourceZipSha256`, literal(sha256File(inputZipPath))))
  write(tripleLine(root, `${SP}fwuOntologyIri`, iri(LP_CORE_ONTOLOGY)))
  write(tripleLine(root, `${SP}fwuOntologyRepository`, iri('https://github.com/FWU-DE/lehrplan-ontologie')))
  write(tripleLine(root, `${SP}fwuOntologyCorePath`, literal(repoRelative(corePath))))
  if (commit) {
    write(tripleLine(root, `${SP}fwuOntologyCommit`, literal(commit)))
  }
}

const writeSemanticTriples = (
  write: (line: string) => void,
  archiveRoot: string,
  entries: ZipEntryRecord[],
  counts: SemanticCounts,
  inputZipPath: string,
  ontologyDir: string,
  goalVisualizationAssets: GoalVisualizationAsset[],
) => {
  const goalClassifications = readGoalClassifications(archiveRoot, entries)
  writePackageHeaderSemantics(write, archiveRoot, inputZipPath, ontologyDir)

  writeLandscapeSemantics(write, archiveRoot, entries, counts, goalClassifications)
  writeViewSemantics(write, archiveRoot, entries, counts)
  writeMappingSemantics(write, archiveRoot, entries, counts)
  writeSourceSemantics(write, archiveRoot, entries, counts)
  writeCardSemantics(write, archiveRoot, entries, counts)
  writeExternalDependencySemantics(write, archiveRoot, entries, counts)
  writeGoalVisualizationSemantics(write, archiveRoot, goalVisualizationAssets, counts, goalClassifications)
}

const writeBufferedText = (
  filePath: string,
  emit: (write: (text: string) => void) => void,
  bufferLimit = 4 * 1024 * 1024,
) => {
  rmSync(filePath, { force: true })
  mkdirSync(dirname(filePath), { recursive: true })
  const descriptor = openSync(filePath, 'w')
  let buffered = ''
  let bufferedBytes = 0
  const flush = () => {
    if (bufferedBytes === 0) {
      return
    }
    const content = Buffer.from(buffered, 'utf8')
    let offset = 0
    while (offset < content.length) {
      offset += writeSync(descriptor, content, offset, content.length - offset)
    }
    buffered = ''
    bufferedBytes = 0
  }
  try {
    emit((text) => {
      buffered += text
      bufferedBytes += Buffer.byteLength(text)
      if (bufferedBytes >= bufferLimit) {
        flush()
      }
    })
    flush()
  } finally {
    closeSync(descriptor)
  }
}

const writeRdf = async (options: CliOptions) => {
  const { archiveRoot, entries } = readEntries(options.zipPath)
  const goalVisualizationAssets = readGoalVisualizationAssets(archiveRoot, entries)
  assertNoUnsupportedBinaryEntries(archiveRoot, entries, goalVisualizationAssets)
  const counts = emptyCounts()

  rmSync(options.rdfPath, { force: true })
  rmSync(options.profilePath, { force: true })
  mkdirSync(dirname(options.rdfPath), { recursive: true })
  writeProfile(options.profilePath)
  writeBoundCore(dirname(options.profilePath), requireOntologyCore(options.ontologyDir))

  writeBufferedText(options.rdfPath, (write) => {
    writeSemanticTriples(
      write,
      archiveRoot,
      entries,
      counts,
      options.zipPath,
      options.ontologyDir,
      goalVisualizationAssets,
    )
    writeCarrierTriples(write, archiveRoot, entries, counts)
  })

  rmSync(resolve(dirname(options.rdfPath), 'assets'), { recursive: true, force: true })
  if (goalVisualizationAssets.length > 0) {
    writeGoalVisualizationSidecars(
      options.zipPath,
      dirname(options.rdfPath),
      archiveRoot,
      entries,
      goalVisualizationAssets,
    )
  }

  return { archiveRoot, counts }
}

const writeNtFile = async (
  filePath: string,
  emit: (write: (line: string) => void) => void,
) => {
  let triples = 0
  writeBufferedText(filePath, (writeText) => {
    emit((line) => {
      triples += 1
      writeText(line)
    })
  })
  return { triples, bytes: statSync(filePath).size }
}

const appendFileToStream = (sourcePath: string, targetStream: ReturnType<typeof createWriteStream>) => (
  new Promise<void>((resolvePromise, reject) => {
    const sourceStream = createReadStream(sourcePath, { encoding: 'utf8' })
    sourceStream.on('error', reject)
    targetStream.on('error', reject)
    sourceStream.on('end', resolvePromise)
    sourceStream.pipe(targetStream, { end: false })
  })
)

const writeBundleFile = async (bundlePath: string, sourcePaths: string[]) => {
  rmSync(bundlePath, { force: true })
  const stream = createWriteStream(bundlePath, { encoding: 'utf8', highWaterMark: 16 * 1024 * 1024 })
  for (const sourcePath of sourcePaths) {
    await appendFileToStream(sourcePath, stream)
  }
  await new Promise<void>((resolvePromise, reject) => {
    stream.end((error?: Error | null) => {
      if (error) {
        reject(error)
        return
      }
      resolvePromise()
    })
  })
  return statSync(bundlePath).size
}

const writeSemanticDeclarations = async (filePath: string, sourcePaths: string[]) => {
  const classIris = new Set<string>()
  const propertyUsage = new Map<string, { iri: boolean; literal: boolean }>()
  for (const sourcePath of sourcePaths) {
    const reader = createInterface({
      input: createReadStream(sourcePath, { encoding: 'utf8' }),
      crlfDelay: Infinity,
    })
    for await (const line of reader) {
      const triple = parseTriple(line)
      if (!triple) {
        continue
      }
      if (triple.predicate === `${RDF}type` && triple.object.kind === 'iri') {
        classIris.add(triple.object.value)
        continue
      }
      const usage = propertyUsage.get(triple.predicate) ?? { iri: false, literal: false }
      usage[triple.object.kind] = true
      propertyUsage.set(triple.predicate, usage)
    }
  }

  const annotationProperties = new Set([
    `${RDFS}label`,
    `${DCTERMS}description`,
    `${DCTERMS}source`,
    `${DCTERMS}title`,
    `${SKOS}prefLabel`,
  ])
  return writeNtFile(filePath, (write) => {
    [...classIris].sort(compareCodeUnits).forEach((classIri) => {
      write(tripleLine(classIri, `${RDF}type`, iri(`${OWL}Class`)))
    })
    ;[...propertyUsage].sort(([left], [right]) => compareCodeUnits(left, right)).forEach(([property, usage]) => {
      const propertyType = annotationProperties.has(property) || (usage.iri && usage.literal)
        ? `${OWL}AnnotationProperty`
        : usage.iri
          ? `${OWL}ObjectProperty`
          : `${OWL}DatatypeProperty`
      write(tripleLine(property, `${RDF}type`, iri(propertyType)))
    })
  })
}

const writeSlimReadme = (slimDir: string, data: {
  archiveRoot: string
  bundlePath: string
  zipPath: string
  files: SlimRdfFile[]
  counts: SemanticCounts
}) => {
  writeFileSync(resolve(slimDir, 'README.md'), `# SkillPilot MEM/FWU Slim RDF Bundle

This directory contains the semantic MEM/FWU representation of the SkillPilot mathematics Gymnasium publication package.

Archive root: \`${data.archiveRoot}\`

It intentionally excludes the lossless package-file carrier lane used by the technical byte-identical roundtrip proof:

- no \`sp:PackageFile\`
- no \`sp:hasFile\`
- no \`sp:textLine\`
- no \`sp:lineText\`
- no file-path-derived SkillPilot resource IRIs such as \`/file/...\`
- no embedded source ZIP file lines

Binary goal visualizations are batch-extracted and verified byte-for-byte as package-relative sidecars under \`assets/\`. Their Core or application reference lane and checksums are represented in \`assets.nt\`; binary bytes are never embedded in \`bundle.nt\`.

The profile imports the canonical FWU core IRI. \`catalog-v001.xml\` resolves that IRI to the pinned, hashed copy at \`ontology/lehrplan-core.owl\` for offline and reproducible OWL tooling.

The exact FWU core source used for the export is pinned under \`ontology/lehrplan-core.owl\`, because the current generated upstream release artifacts do not yet contain every term used by this bundle.

\`declarations.nt\` makes \`bundle.nt\` self-contained for RDF-to-OWL parsers: terms are declared in the same RDF graph before the application profile and the imported core add their richer axioms.

The official curriculum evidence needed for independent semantic checks is represented as source-document URLs plus exact source-goal spans in \`sources.nt\`.

\`sp:zipPath\` is retained only as a local package placement literal for deterministic reconstruction; it is not used as curriculum-source provenance.

Source records containing RDF/XML-forbidden control characters or unpaired UTF-16 surrogates are kept losslessly in an explicit \`sp:quarantinedRecordJson\` fallback. Safe fields remain queryable as ordinary RDF literals, and the semantic importer reconstructs the exact source record.

Structured \`dimensionTags\` remain lossless JSON while curricular process competencies and guiding ideas are additionally projected to FWU Core axis resources. \`sp:referenceRole\` keeps derived axis projections distinct from authored \`competencyRefs\`.

\`manifest.json\` binds every RDF file plus profile, catalog, Core, and input ZIP by SHA-256 before independent ROBOT validation.

## Files

| File | Purpose | Triples | Size | SHA-256 |
| --- | --- | ---: | ---: | --- |
${data.files.map((file) => `| \`${file.name}\` | ${file.description} | ${file.triples} | ${file.bytes} B | \`${file.sha256}\` |`).join('\n')}

\`bundle.nt\` is only a convenience concatenation of the semantic files for parsers that prefer one N-Triples input file.

## Semantic Counts

| Item | Count |
| --- | ---: |
${Object.entries(data.counts).map(([key, value]) => `| ${key} | ${value} |`).join('\n')}

## Validation

Run the semantic reconstruction check from this bundle:

\`\`\`bash
npm --prefix app run roundtrip:mem-fwu:semantic-reconstruct -- \\
  --rdf ${repoRelative(data.bundlePath)} \\
  --zip ${repoRelative(data.zipPath)} \\
  --out-dir ${repoRelative(resolve(slimDir, 'semantic-reconstructed'))}
\`\`\`

Run the manifest-bound OWL 2 DL and HermiT release gate with [ROBOT](http://robot.obolibrary.org/):

\`\`\`bash
ROBOT_JAR=/absolute/path/to/robot.jar npm --prefix app run roundtrip:mem-fwu:owl:reason -- \\
  --slim-dir ${repoRelative(slimDir)} \\
  --zip ${repoRelative(data.zipPath)}
\`\`\`

The gate verifies every manifest-bound input before running ROBOT, rejects inputs that change during the run, and writes \`owl-validation-report.{json,md}\`, \`robot-dl-report.txt\`, and \`robot-hermit-reasoned.owl\` next to this README.
`)
}

const writeSlimRdf = async (options: CliOptions) => {
  const sourceCorePath = requireOntologyCore(options.ontologyDir)
  const inputZipSha256 = sha256File(options.zipPath)
  const sourceCoreSha256 = sha256File(sourceCorePath)
  const { archiveRoot, entries } = readEntries(options.zipPath)
  const goalVisualizationAssets = readGoalVisualizationAssets(archiveRoot, entries)
  const goalClassifications = readGoalClassifications(archiveRoot, entries)
  assertNoUnsupportedBinaryEntries(archiveRoot, entries, goalVisualizationAssets)
  const counts = emptyCounts()
  const slimDir = options.slimDir
  mkdirSync(slimDir, { recursive: true })
  const bundledCorePath = resolve(slimDir, 'ontology/lehrplan-core.owl')

  const profilePath = resolve(slimDir, 'skillpilot-mem-fwu-profile.ttl')
  const catalogPath = resolve(slimDir, 'catalog-v001.xml')
  const bundlePath = resolve(slimDir, 'bundle.nt')
  const manifestPath = resolve(slimDir, 'manifest.json')
  const readmePath = resolve(slimDir, 'README.md')
  const generatedNames = [
    'declarations.nt',
    'landscape.nt',
    'views.nt',
    'mappings.nt',
    'sources.nt',
    'cards.nt',
    'assets.nt',
    'bundle.nt',
    'skillpilot-mem-fwu-profile.ttl',
    'catalog-v001.xml',
    'manifest.json',
    'README.md',
    'robot-dl-report.txt',
    'robot-hermit-reasoned.owl',
    'owl-validation-report.json',
    'owl-validation-report.md',
  ]
  generatedNames.forEach((name) => rmSync(resolve(slimDir, name), { force: true }))
  rmSync(resolve(slimDir, 'semantic-reconstructed'), { recursive: true, force: true })
  rmSync(resolve(slimDir, 'assets'), { recursive: true, force: true })
  rmSync(resolve(slimDir, 'ontology'), { recursive: true, force: true })

  writeProfile(profilePath, { includeCarrier: false })
  writeBoundCore(slimDir, sourceCorePath)

  const segments: Array<{
    name: string
    description: string
    emit: (write: (line: string) => void) => void
  }> = [
    {
      name: 'landscape.nt',
      description: 'package metadata, canonical goals, contains/requires edges, program placements, external references',
      emit: (write) => {
        writePackageHeaderSemantics(write, archiveRoot, options.zipPath, options.ontologyDir)
        writeLandscapeSemantics(write, archiveRoot, entries, counts, goalClassifications)
        writeExternalDependencySemantics(write, archiveRoot, entries, counts, { semanticIris: true })
      },
    },
    {
      name: 'sources.nt',
      description: 'official source documents and exact source-goal spans',
      emit: (write) => writeSourceSemantics(write, archiveRoot, entries, counts, { includeSourceIndexSummary: false }),
    },
    {
      name: 'mappings.nt',
      description: 'canonical/state mapping records and reviewed source-to-canonical decisions',
      emit: (write) => writeMappingSemantics(write, archiveRoot, entries, counts, { semanticIris: true }),
    },
    {
      name: 'views.nt',
      description: 'learner-facing Bundesland and aggregate composition views',
      emit: (write) => writeViewSemantics(write, archiveRoot, entries, counts, { semanticIris: true }),
    },
    {
      name: 'cards.nt',
      description: 'memorization decks and cards',
      emit: (write) => writeCardSemantics(write, archiveRoot, entries, counts, { semanticIris: true }),
    },
    {
      name: 'assets.nt',
      description: 'goal-to-visualization references and metadata for binary image sidecars',
      emit: (write) => writeGoalVisualizationSemantics(
        write,
        archiveRoot,
        goalVisualizationAssets,
        counts,
        goalClassifications,
      ),
    },
  ]

  const files: SlimRdfFile[] = []
  for (const segment of segments) {
    const segmentPath = resolve(slimDir, segment.name)
    const result = await writeNtFile(segmentPath, segment.emit)
    files.push({
      name: segment.name,
      path: repoRelative(segmentPath),
      triples: result.triples,
      bytes: result.bytes,
      sha256: sha256File(segmentPath),
      description: segment.description,
    })
  }

  const declarationsPath = resolve(slimDir, 'declarations.nt')
  const declarations = await writeSemanticDeclarations(
    declarationsPath,
    files.map((file) => resolve(repoRoot, file.path)),
  )
  files.unshift({
    name: 'declarations.nt',
    path: repoRelative(declarationsPath),
    triples: declarations.triples,
    bytes: declarations.bytes,
    sha256: sha256File(declarationsPath),
    description: 'self-contained OWL class and property declarations for single-graph RDF loaders',
  })

  const bundleBytes = await writeBundleFile(bundlePath, files.map((file) => resolve(repoRoot, file.path)))
  files.push({
    name: 'bundle.nt',
    path: repoRelative(bundlePath),
    triples: files.reduce((sum, file) => sum + file.triples, 0),
    bytes: bundleBytes,
    sha256: sha256File(bundlePath),
    description: 'concatenated semantic bundle for single-file RDF loaders',
  })

  const assetSidecars = writeGoalVisualizationSidecars(
    options.zipPath,
    slimDir,
    archiveRoot,
    entries,
    goalVisualizationAssets,
  )

  const manifest = {
    generatedAt: new Date().toISOString(),
    archiveRoot,
    inputZip: repoRelative(options.zipPath),
    inputZipSha256,
    profile: repoRelative(profilePath),
    bundle: repoRelative(bundlePath),
    fwuOntology: {
      repository: 'https://github.com/FWU-DE/lehrplan-ontologie',
      localPath: repoRelative(options.ontologyDir),
      corePath: repoRelative(sourceCorePath),
      bundledCorePath: repoRelative(bundledCorePath),
      bundledCoreSha256: sha256File(bundledCorePath),
      profileImport: LP_CORE_ONTOLOGY,
      profileSha256: sha256File(profilePath),
      catalogPath: repoRelative(catalogPath),
      catalogSha256: sha256File(catalogPath),
      commit: ontologyCommit(options.ontologyDir),
      ontologyIri: LP_CORE_ONTOLOGY,
    },
    semantics: {
      carrierLaneIncluded: false,
      sourceIndexSummaryJsonIncluded: false,
      officialSourceTextSpansIncluded: true,
      goalVisualizationManifestIncluded: goalVisualizationAssets.length > 0,
      binaryGoalVisualizationSidecarsIncluded: goalVisualizationAssets.length > 0,
      bundleNtContainsBinaryData: false,
    },
    files,
    assets: assetSidecars,
    semanticCounts: counts,
  }
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
  writeSlimReadme(slimDir, { archiveRoot, bundlePath, zipPath: options.zipPath, files, counts })

  if (sha256File(options.zipPath) !== inputZipSha256 || sha256File(sourceCorePath) !== sourceCoreSha256) {
    throw new Error('Slim RDF inputs changed while the bundle was being written.')
  }

  return {
    archiveRoot,
    counts,
    profilePath,
    bundlePath,
    manifestPath,
    readmePath,
    catalogPath,
    files,
  }
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
  const value = unescapeLiteral(input.slice(1, end))
  const suffix = input.slice(end + 1)
  const datatypeMatch = suffix.match(/^\^\^<([^>]+)>/u)
  const langMatch = suffix.match(/^@([a-zA-Z-]+)/u)
  return {
    kind: 'literal',
    value,
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

const literalObjectValue = (object: TripleObject) => {
  if (object.kind !== 'literal') {
    throw new Error('Expected literal object.')
  }
  return object.value
}

const iriObjectValue = (object: TripleObject) => {
  if (object.kind !== 'iri') {
    throw new Error('Expected IRI object.')
  }
  return object.value
}

const lineIndexFromIri = (resource: string) => {
  const match = resource.match(/\/line\/([0-9]+)$/u)
  if (!match) {
    throw new Error(`Cannot derive line index from IRI: ${resource}`)
  }
  return Number(match[1])
}

const isCarrierFileResource = (resource: string) => /\/file\/[^/]+$/u.test(resource)

const reconstructFromRdf = async (options: CliOptions) => {
  type FileCarrier = {
    path: string | null
    byteLength: number | null
    sha256: string | null
    lineCount: number | null
    endsWithNewline: boolean | null
    lineResources: string[]
  }

  const files = new Map<string, FileCarrier>()
  const lineTexts = new Map<string, string>()
  const imageResources = new Set<string>()
  const imagePaths = new Map<string, string>()
  const imageSha256 = new Map<string, string>()
  const imageByteLengths = new Map<string, number>()
  let archiveRoot: string | null = null

  const ensureFile = (resource: string) => {
    const existing = files.get(resource)
    if (existing) {
      return existing
    }
    const carrier: FileCarrier = {
      path: null,
      byteLength: null,
      sha256: null,
      lineCount: null,
      endsWithNewline: null,
      lineResources: [],
    }
    files.set(resource, carrier)
    return carrier
  }

  const reader = createInterface({
    input: createReadStream(options.rdfPath, { encoding: 'utf8' }),
    crlfDelay: Infinity,
  })

  for await (const line of reader) {
    const triple = parseTriple(line)
    if (!triple) {
      continue
    }
    if (triple.predicate === `${SP}archiveRoot`) {
      archiveRoot = literalObjectValue(triple.object)
      continue
    }
    if (
      triple.predicate === `${RDF}type`
      && triple.object.kind === 'iri'
      && triple.object.value === `${SCHEMA}ImageObject`
    ) {
      imageResources.add(triple.subject)
      continue
    }
    if (triple.predicate === `${SP}zipPath`) {
      if (!isCarrierFileResource(triple.subject)) {
        imagePaths.set(triple.subject, literalObjectValue(triple.object))
        continue
      }
      ensureFile(triple.subject).path = literalObjectValue(triple.object)
      continue
    }
    if (triple.predicate === `${SP}sha256`) {
      if (isCarrierFileResource(triple.subject)) {
        ensureFile(triple.subject).sha256 = literalObjectValue(triple.object)
        continue
      }
      imageSha256.set(triple.subject, literalObjectValue(triple.object))
      continue
    }
    if (triple.predicate === `${SP}byteLength`) {
      if (isCarrierFileResource(triple.subject)) {
        ensureFile(triple.subject).byteLength = Number(literalObjectValue(triple.object))
        continue
      }
      imageByteLengths.set(triple.subject, Number(literalObjectValue(triple.object)))
      continue
    }
    if (triple.predicate === `${SP}lineCount`) {
      if (isCarrierFileResource(triple.subject)) {
        ensureFile(triple.subject).lineCount = Number(literalObjectValue(triple.object))
      }
      continue
    }
    if (triple.predicate === `${SP}endsWithNewline`) {
      if (!isCarrierFileResource(triple.subject)) {
        continue
      }
      const value = literalObjectValue(triple.object)
      if (value !== 'true' && value !== 'false') {
        throw new Error(`Invalid sp:endsWithNewline value for ${triple.subject}: ${value}`)
      }
      ensureFile(triple.subject).endsWithNewline = value === 'true'
      continue
    }
    if (triple.predicate === `${SP}textLine`) {
      if (!isCarrierFileResource(triple.subject)) {
        continue
      }
      ensureFile(triple.subject).lineResources.push(iriObjectValue(triple.object))
      continue
    }
    if (triple.predicate === `${SP}lineText`) {
      lineTexts.set(triple.subject, literalObjectValue(triple.object))
    }
  }

  if (!archiveRoot) {
    throw new Error('RDF does not contain sp:archiveRoot.')
  }
  if (!isSafeArchiveRootSegment(archiveRoot)) {
    throw new Error(`RDF contains unsafe archive root: ${archiveRoot}`)
  }

  rmSync(options.reconstructedDir, { recursive: true, force: true })
  mkdirSync(options.reconstructedDir, { recursive: true })

  const orderedFiles = [...files.values()]
    .filter((file) => file.path !== null)
    .sort((left, right) => compareCodeUnits(String(left.path), String(right.path)))

  orderedFiles.forEach((file) => {
    if (!file.path) {
      return
    }
    const archivePrefix = `${archiveRoot}/`
    if (!file.path.startsWith(archivePrefix)) {
      throw new Error(`Carrier file path is outside archive root ${archiveRoot}: ${file.path}`)
    }
    const packagePath = file.path.slice(archivePrefix.length)
    if (!isSafePackagePath(packagePath)) {
      throw new Error(`Unsafe carrier package path in RDF: ${packagePath}`)
    }
    if (file.endsWithNewline === null) {
      throw new Error(`Carrier file does not contain sp:endsWithNewline: ${file.path}`)
    }
    if (file.lineCount === null || !Number.isSafeInteger(file.lineCount) || file.lineCount < 0) {
      throw new Error(`Carrier file does not contain a valid sp:lineCount: ${file.path}`)
    }
    if (file.byteLength === null || !Number.isSafeInteger(file.byteLength) || file.byteLength < 0) {
      throw new Error(`Carrier file does not contain a valid sp:byteLength: ${file.path}`)
    }
    if (!file.sha256 || !/^[a-f0-9]{64}$/u.test(file.sha256)) {
      throw new Error(`Carrier file does not contain a valid sp:sha256: ${file.path}`)
    }
    const target = resolve(options.reconstructedDir, file.path)
    const relativeTarget = relative(options.reconstructedDir, target)
    if (relativeTarget.startsWith('..') || isAbsolute(relativeTarget)) {
      throw new Error(`Refusing to reconstruct outside repository: ${file.path}`)
    }
    mkdirSync(dirname(target), { recursive: true })
    const orderedLineResources = [...file.lineResources]
      .sort((left, right) => lineIndexFromIri(left) - lineIndexFromIri(right))
    const lineIndexes = orderedLineResources.map(lineIndexFromIri)
    if (
      orderedLineResources.length !== file.lineCount
      || new Set(orderedLineResources).size !== orderedLineResources.length
      || lineIndexes.some((lineIndex, index) => lineIndex !== index)
    ) {
      throw new Error(`Carrier line structure does not match sp:lineCount for ${file.path}`)
    }
    const lines = orderedLineResources
      .map((lineResource) => {
        const line = lineTexts.get(lineResource)
        if (line === undefined) {
          throw new Error(`Missing line text for ${lineResource}`)
        }
        return line
      })
    const content = Buffer.from(`${lines.join('\n')}${file.endsWithNewline ? '\n' : ''}`, 'utf8')
    if (content.length !== file.byteLength) {
      throw new Error(`Carrier byte-length mismatch for ${file.path}: ${content.length} != ${file.byteLength}`)
    }
    const contentSha256 = sha256(content)
    if (contentSha256 !== file.sha256) {
      throw new Error(`Carrier SHA-256 mismatch for ${file.path}: ${contentSha256} != ${file.sha256}`)
    }
    writeFileSync(target, content)
  })

  let reconstructedImages = 0
  imageResources.forEach((resource) => {
    const zipPath = imagePaths.get(resource)
    if (!zipPath) {
      throw new Error(`Image resource does not contain sp:zipPath: ${resource}`)
    }
    const archivePrefix = `${archiveRoot}/`
    if (!zipPath.startsWith(archivePrefix)) {
      throw new Error(`Image ZIP path is outside archive root ${archiveRoot}: ${zipPath}`)
    }
    const packagePath = zipPath.slice(archivePrefix.length)
    if (!isSafePackagePath(packagePath)) {
      throw new Error(`Unsafe image package path in RDF: ${packagePath}`)
    }
    const sidecar = resolve(dirname(options.rdfPath), packagePath)
    const relativeSidecar = relative(dirname(options.rdfPath), sidecar)
    if (relativeSidecar.startsWith('..') || isAbsolute(relativeSidecar) || !existsSync(sidecar)) {
      throw new Error(`Image sidecar is missing or outside RDF directory: ${packagePath}`)
    }
    const content = readFileSync(sidecar)
    const expectedBytes = imageByteLengths.get(resource)
    const expectedSha = imageSha256.get(resource)
    if (expectedBytes === undefined || !Number.isSafeInteger(expectedBytes) || expectedBytes < 0) {
      throw new Error(`Image resource does not contain a valid sp:byteLength: ${resource}`)
    }
    if (!expectedSha || !/^[a-f0-9]{64}$/u.test(expectedSha)) {
      throw new Error(`Image resource does not contain a valid sp:sha256: ${resource}`)
    }
    if (content.length !== expectedBytes) {
      throw new Error(`Image sidecar byte-length mismatch for ${packagePath}.`)
    }
    if (sha256(content) !== expectedSha) {
      throw new Error(`Image sidecar SHA-256 mismatch for ${packagePath}.`)
    }
    const target = resolve(options.reconstructedDir, zipPath)
    const relativeTarget = relative(options.reconstructedDir, target)
    if (relativeTarget.startsWith('..') || isAbsolute(relativeTarget)) {
      throw new Error(`Refusing to reconstruct image outside repository: ${zipPath}`)
    }
    writeIndependentFile(target, content)
    const targetStat = lstatSync(target)
    if (!targetStat.isFile() || targetStat.size !== expectedBytes || sha256File(target) !== expectedSha) {
      throw new Error(`Materialized image is not an independent byte-identical regular file: ${packagePath}`)
    }
    reconstructedImages += 1
  })

  return { archiveRoot, fileCount: orderedFiles.length + reconstructedImages }
}

const countRdfSemantics = async (rdfPath: string) => {
  const counts = emptyCounts()
  const roleReferences = new Set<string>()
  const reader = createInterface({
    input: createReadStream(rdfPath, { encoding: 'utf8' }),
    crlfDelay: Infinity,
  })

  for await (const line of reader) {
    const triple = parseTriple(line)
    if (!triple) {
      continue
    }
    if (triple.predicate === `${SP}lineText`) counts.textLines += 1
    if (triple.predicate === `${SP}containsGoal`) counts.containsEdges += 1
    if (triple.predicate === `${SP}didacticRequires`) counts.requiresEdges += 1
    if (triple.predicate === `${SP}referenceRole`) roleReferences.add(triple.subject)
    if (triple.predicate !== `${RDF}type` || triple.object.kind !== 'iri') {
      continue
    }
    if (triple.object.value === `${SP}PackageFile`) counts.files += 1
    if (triple.object.value === `${SP}LearningGoal`) counts.canonicalGoals += 1
    if (triple.object.value === `${SP}CompetencyCatalogEntry`) counts.competencyCatalogEntries += 1
    if (triple.object.value === LP_PROCESS_COMPETENCY_AREA || triple.object.value === LP_GUIDING_IDEA) counts.coreAxisEntries += 1
    if (triple.object.value === `${SP}ProgramUnit`) counts.programUnits += 1
    if (triple.object.value === `${SP}GoalPlacement`) counts.goalPlacements += 1
    if (triple.object.value === `${SP}CompositionView`) counts.compositionViews += 1
    if (triple.object.value === `${SP}CompositionNode`) counts.compositionNodes += 1
    if (triple.object.value === `${SP}MappingRecord`) counts.canonicalMappings += 1
    if (triple.object.value === `${SP}ReviewDecision`) counts.reviewDecisions += 1
    if (triple.object.value === `${SP}SourceCollection`) counts.sourceCollections += 1
    if (triple.object.value === `${SP}SourceDocument`) counts.sourceDocuments += 1
    if (triple.object.value === `${SP}SourceGoalReference`) counts.sourceGoals += 1
    if (triple.object.value === `${SP}CardDeck`) counts.cardDecks += 1
    if (triple.object.value === `${SP}Card`) counts.cards += 1
    if (triple.object.value === `${SP}ExternalGoalReference`) counts.externalGoalReferences += 1
    if (triple.object.value === LP_DIDACTIC_PREREQUISITE) counts.requiresEdges += 1
    if (triple.object.value === `${SCHEMA}ImageObject`) counts.goalVisualizations += 1
  }

  counts.coreAxisReferences = roleReferences.size

  return counts
}

const zipReconstructedPackage = (options: CliOptions, archiveRoot: string) => {
  const archiveRootDir = resolve(options.reconstructedDir, archiveRoot)
  if (!existsSync(archiveRootDir)) {
    throw new Error(`Reconstructed archive root missing: ${archiveRootDir}`)
  }

  rmSync(options.reconstructedZipPath, { force: true })
  mkdirSync(dirname(options.reconstructedZipPath), { recursive: true })
  const zipListPath = resolve(options.outDir, 'reconstructed-zip-file-list.txt')
  const fileList = execFileSync('find', [archiveRoot, '-type', 'f'], {
    cwd: options.reconstructedDir,
    encoding: 'utf8',
    maxBuffer: ZIP_COMMAND_MAX_BUFFER_BYTES,
  })
    .split(/\r?\n/u)
    .filter(Boolean)
    .sort(compareCodeUnits)
    .join('\n')
  writeFileSync(zipListPath, `${fileList}\n`)
  execFileSync('zip', ['-X', '-0', '-q', options.reconstructedZipPath, '-@'], {
    cwd: options.reconstructedDir,
    input: readFileSync(zipListPath),
    stdio: ['pipe', 'ignore', 'pipe'],
  })
}

const parseSha256Sums = (content: Buffer, context: string) => {
  const records = new Map<string, string>()
  content.toString('utf8').split(/\r?\n/u).filter(Boolean).forEach((line) => {
    const match = line.match(/^([a-f0-9]{64}) {2}(.+)$/u)
    if (!match) {
      throw new Error(`Malformed SHA256SUMS line in ${context}: ${line}`)
    }
    const [, digest, path] = match
    if (records.has(path)) {
      throw new Error(`Duplicate SHA256SUMS path in ${context}: ${path}`)
    }
    records.set(path, digest)
  })
  return records
}

const hashReconstructedFiles = (reconstructedDir: string, entryPaths: string[]) => {
  const hashes = new Map<string, string>()
  chunkArgumentsByBytes(entryPaths).forEach((paths) => {
    const output = execFileSync('sha256sum', ['--', ...paths], {
      cwd: reconstructedDir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      maxBuffer: ZIP_COMMAND_MAX_BUFFER_BYTES,
    })
    output.split(/\r?\n/u).filter(Boolean).forEach((line) => {
      const match = line.match(/^([a-f0-9]{64}) {2}(.+)$/u)
      if (!match) throw new Error(`Malformed sha256sum output: ${line}`)
      hashes.set(match[2], match[1])
    })
  })
  return hashes
}

const compareZipEntries = (originalZip: string, reconstructedZip: string, reconstructedDir: string) => {
  const originalEntries = listZipEntries(originalZip)
  const reconstructedEntries = listZipEntries(reconstructedZip)
  if (new Set(originalEntries).size !== originalEntries.length || new Set(reconstructedEntries).size !== reconstructedEntries.length) {
    throw new Error('Cannot compare ZIPs containing duplicate entry names.')
  }
  const allEntries = [...new Set([...originalEntries, ...reconstructedEntries])].sort(compareCodeUnits)
  const mismatches: string[] = []
  let byteIdenticalFiles = 0

  const checksumEntries = originalEntries.filter((entry) => entry.endsWith('/metadata/SHA256SUMS'))
  if (checksumEntries.length !== 1) {
    throw new Error(`Expected exactly one original SHA256SUMS entry, got ${checksumEntries.length}.`)
  }
  const checksumEntry = checksumEntries[0]
  const originalChecksumContent = readZipEntry(originalZip, checksumEntry)
  const reconstructedChecksumContent = reconstructedEntries.includes(checksumEntry)
    ? readZipEntry(reconstructedZip, checksumEntry)
    : Buffer.alloc(0)
  const originalHashes = parseSha256Sums(originalChecksumContent, originalZip)
  const expectedChecksumPaths = new Set(originalEntries.filter((entry) => entry !== checksumEntry))
  const missingChecksumPaths = [...expectedChecksumPaths].filter((entry) => !originalHashes.has(entry))
  const unexpectedChecksumPaths = [...originalHashes.keys()].filter((entry) => !expectedChecksumPaths.has(entry))
  if (missingChecksumPaths.length > 0 || unexpectedChecksumPaths.length > 0) {
    throw new Error([
      ...missingChecksumPaths.map((entry) => `missing checksum ${entry}`),
      ...unexpectedChecksumPaths.map((entry) => `unexpected checksum ${entry}`),
    ].slice(0, 10).join(' | '))
  }
  const reconstructedHashes = hashReconstructedFiles(reconstructedDir, reconstructedEntries)

  allEntries.forEach((entry) => {
    const inOriginal = originalEntries.includes(entry)
    const inReconstructed = reconstructedEntries.includes(entry)
    if (!inOriginal || !inReconstructed) {
      mismatches.push(`${entry}: ${inOriginal ? 'missing in reconstructed ZIP' : 'unexpected in reconstructed ZIP'}`)
      return
    }
    const originalSha = entry === checksumEntry
      ? sha256(originalChecksumContent)
      : originalHashes.get(entry)
    const reconstructedSha = entry === checksumEntry
      ? sha256(reconstructedChecksumContent)
      : reconstructedHashes.get(entry)
    if (originalSha !== reconstructedSha) {
      mismatches.push(`${entry}: ${String(originalSha)} != ${String(reconstructedSha)}`)
      return
    }
    byteIdenticalFiles += 1
  })

  return {
    comparedFiles: allEntries.length,
    byteIdenticalFiles,
    mismatches,
  }
}

const runPackageValidation = (options: CliOptions) => {
  const reportDir = resolve(options.outDir, 'package-validation')
  const reportPath = resolve(reportDir, 'subject-export-package-validation-report.json')
  const markdownReportPath = resolve(reportDir, 'subject-export-package-validation-report.md')
  const command = `npm run export:subject-packages:validate -- --zip ${repoRelative(options.reconstructedZipPath)} --report-dir ${repoRelative(reportDir)}`
  rmSync(reportPath, { force: true })
  rmSync(markdownReportPath, { force: true })
  try {
    execFileSync('npm', [
      'run',
      'export:subject-packages:validate',
      '--',
      '--zip',
      options.reconstructedZipPath,
      '--report-dir',
      reportDir,
    ], {
      cwd: appRoot,
      stdio: ['ignore', 'pipe', 'pipe'],
      maxBuffer: ZIP_COMMAND_MAX_BUFFER_BYTES,
    })
    const reportSha256 = sha256RegularFile(reportPath)
    if (!reportSha256) throw new Error('Package validator did not write a regular JSON report.')
    return {
      command,
      passed: true,
      reportPath: repoRelative(reportPath),
      reportSha256,
    }
  } catch (error) {
    if (error instanceof Error) {
      process.stderr.write(`${error.message}\n`)
    }
    const reportSha256 = sha256RegularFile(reportPath)
    return {
      command,
      passed: false,
      reportPath: reportSha256 ? repoRelative(reportPath) : null,
      reportSha256,
    }
  }
}

const writeReport = (options: CliOptions, report: RoundtripReport) => {
  mkdirSync(options.outDir, { recursive: true })
  writeFileSync(resolve(options.outDir, 'roundtrip-report.json'), `${JSON.stringify(report, null, 2)}\n`)
  writeFileSync(resolve(options.outDir, 'roundtrip-report.md'), `# MEM/FWU Roundtrip Report

Generated at: ${report.generatedAt}

## Input

- Input ZIP: \`${report.inputZip}\`
- RDF: \`${report.rdfPath}\`
- SkillPilot profile: \`${report.profilePath}\`
- Reconstructed ZIP: \`${report.reconstructedZip}\`
- Input ZIP SHA-256: \`${report.hashes.inputZipSha256 ?? 'not available'}\`
- RDF SHA-256: \`${report.hashes.rdfSha256 ?? 'not available'}\`
- SkillPilot profile SHA-256: \`${report.hashes.profileSha256 ?? 'not available'}\`
- Reconstructed ZIP SHA-256: \`${report.hashes.reconstructedZipSha256 ?? 'not available'}\`
- FWU core SHA-256: \`${report.hashes.ontologyCoreSha256 ?? 'not available'}\`
- Archive root: \`${report.archiveRoot}\`
- FWU ontology: \`${report.fwuOntology.repository}\`
- FWU core: \`${report.fwuOntology.corePath}\`
- FWU ontology commit: \`${report.fwuOntology.commit ?? 'not available'}\`

## Semantic Counts

| Item | Count |
| --- | ---: |
${Object.entries(report.semanticCounts).map(([key, value]) => `| ${key} | ${value} |`).join('\n')}

## Reconstruction

${report.reconstruction
  ? `Compared files: ${report.reconstruction.comparedFiles}

Byte-identical files: ${report.reconstruction.byteIdenticalFiles}

Mismatches: ${report.reconstruction.mismatches.length === 0 ? 'none' : report.reconstruction.mismatches.join('\n')}`
  : 'Not run in this mode.'}

## Package Validation

${report.packageValidation
  ? `Command: \`${report.packageValidation.command}\`

Status: ${report.packageValidation.passed ? 'passed' : 'failed'}

Report: ${report.packageValidation.reportPath ? `\`${report.packageValidation.reportPath}\`` : 'not available'}

Report SHA-256: \`${report.packageValidation.reportSha256 ?? 'not available'}\``
  : 'Not run in this mode.'}
`)
}

const validateOwlBundle = (options: CliOptions) => {
  const profileReportPath = resolve(options.slimDir, 'robot-dl-report.txt')
  const reasonedPath = resolve(options.slimDir, 'robot-hermit-reasoned.owl')
  const jsonPath = resolve(options.slimDir, 'owl-validation-report.json')
  const markdownPath = resolve(options.slimDir, 'owl-validation-report.md')
  ;[profileReportPath, reasonedPath, jsonPath, markdownPath].forEach((path) => rmSync(path, { force: true }))

  const configuredRobotJar = process.env.ROBOT_JAR
  const robotJarPath = configuredRobotJar
    ? resolve(process.cwd(), configuredRobotJar)
    : resolve(repoRoot, 'tmp/tools/robot-1.9.10/robot.jar')
  if (!existsSync(robotJarPath)) {
    throw new Error('ROBOT JAR is missing. Set ROBOT_JAR or place ROBOT 1.9.10 under tmp/tools/robot-1.9.10/robot.jar.')
  }

  const manifestPath = resolve(options.slimDir, 'manifest.json')
  if (!existsSync(manifestPath)) throw new Error(`OWL validation manifest is missing: ${manifestPath}`)
  const manifest = jsonObject(JSON.parse(readFileSync(manifestPath, 'utf8')) as JsonValue, 'slim manifest')
  const fwuOntology = jsonObject(manifest.fwuOntology, 'slim manifest fwuOntology')
  const rdfFiles = Array.isArray(manifest.files)
    ? manifest.files.map((file) => jsonObject(file, 'slim manifest RDF file'))
    : []
  const expectedRdfNames = ['declarations.nt', 'landscape.nt', 'views.nt', 'mappings.nt', 'sources.nt', 'cards.nt', 'assets.nt', 'bundle.nt']
  const rdfNames = rdfFiles.map((file) => stringValue(file.name)).filter((name): name is string => !!name)
  if (new Set(rdfNames).size !== rdfNames.length || JSON.stringify([...rdfNames].sort(compareCodeUnits)) !== JSON.stringify([...expectedRdfNames].sort(compareCodeUnits))) {
    throw new Error('Slim manifest RDF file set is duplicate, incomplete, or unexpected.')
  }
  if (fwuOntology.ontologyIri !== LP_CORE_ONTOLOGY || fwuOntology.profileImport !== LP_CORE_ONTOLOGY) {
    throw new Error('Slim manifest does not bind the canonical FWU Core IRI.')
  }
  const fwuCommit = stringValue(fwuOntology.commit)
  if (!fwuCommit || !/^[a-f0-9]{40}(?:[a-f0-9]{24})?$/u.test(fwuCommit)) {
    throw new Error('Slim manifest does not contain a valid FWU ontology commit hash.')
  }

  const inputPaths = new Map<string, string>([
    ...rdfFiles.map((file) => [`rdf:${String(file.name)}`, resolve(options.slimDir, String(file.name))] as const),
    ['profile', resolve(options.slimDir, 'skillpilot-mem-fwu-profile.ttl')],
    ['catalog', resolve(options.slimDir, 'catalog-v001.xml')],
    ['core', resolve(options.slimDir, 'ontology/lehrplan-core.owl')],
    ['package', options.zipPath],
    ['manifest', manifestPath],
    ['robotJar', robotJarPath],
  ])
  inputPaths.forEach((path, label) => {
    if (!existsSync(path) || !lstatSync(path).isFile()) throw new Error(`OWL validation input is missing or not a regular file (${label}): ${path}`)
  })
  const beforeHashes = Object.fromEntries([...inputPaths].map(([label, path]) => [label, sha256File(path)]))

  const assertManifestArtifact = (
    label: string,
    actualPath: string,
    recordedPath: JsonValue | undefined,
    recordedSha: JsonValue | undefined,
    hashLabel: string,
  ) => {
    if (typeof recordedPath !== 'string' || resolve(repoRoot, recordedPath) !== resolve(actualPath)) {
      throw new Error(`${label} manifest path does not identify the co-located OWL input.`)
    }
    if (typeof recordedSha !== 'string' || recordedSha !== beforeHashes[hashLabel]) {
      throw new Error(`${label} manifest SHA-256 does not match the OWL input.`)
    }
  }
  rdfFiles.forEach((file) => {
    const name = String(file.name)
    assertManifestArtifact(`RDF ${name}`, resolve(options.slimDir, name), file.path, file.sha256, `rdf:${name}`)
  })
  assertManifestArtifact('profile', inputPaths.get('profile') as string, manifest.profile, fwuOntology.profileSha256, 'profile')
  assertManifestArtifact('catalog', inputPaths.get('catalog') as string, fwuOntology.catalogPath, fwuOntology.catalogSha256, 'catalog')
  assertManifestArtifact('bound core', inputPaths.get('core') as string, fwuOntology.bundledCorePath, fwuOntology.bundledCoreSha256, 'core')
  if (typeof manifest.bundle !== 'string' || resolve(repoRoot, manifest.bundle) !== resolve(inputPaths.get('rdf:bundle.nt') as string)) {
    throw new Error('Slim manifest bundle path does not identify the co-located RDF bundle.')
  }
  if (typeof manifest.inputZip !== 'string' || resolve(repoRoot, manifest.inputZip) !== resolve(options.zipPath)) {
    throw new Error('Slim manifest inputZip path does not identify the package input.')
  }
  if (manifest.inputZipSha256 !== beforeHashes.package) {
    throw new Error('Slim manifest input ZIP SHA-256 does not match the package input.')
  }

  const profileText = readFileSync(inputPaths.get('profile') as string, 'utf8')
  const profileImports = [...profileText.matchAll(/\bowl:imports\s+<([^>]+)>/gu)].map((match) => match[1])
  if (
    !profileText.includes(`@prefix owl: <${OWL}> .`)
    || profileImports.length !== 1
    || profileImports[0] !== LP_CORE_ONTOLOGY
  ) {
    throw new Error('SkillPilot profile does not import exactly the canonical FWU Core IRI.')
  }
  const catalogText = readFileSync(inputPaths.get('catalog') as string, 'utf8')
  const catalogMappings = catalogText.match(/<uri\b/gu) ?? []
  const expectedCatalogMapping = `<uri name="${LP_CORE_ONTOLOGY}" uri="ontology/lehrplan-core.owl"/>`
  if (catalogMappings.length !== 1 || !catalogText.includes(expectedCatalogMapping)) {
    throw new Error('OWL catalog does not map exactly the canonical FWU Core IRI to the bundled Core.')
  }

  const commonMergeArguments = [
    'merge',
    '--catalog', inputPaths.get('catalog') as string,
    '--input', inputPaths.get('profile') as string,
    '--input', inputPaths.get('rdf:bundle.nt') as string,
    '--collapse-import-closure', 'true',
  ]
  execFileSync('java', [
    '-Xmx3g',
    '-jar', robotJarPath,
    ...commonMergeArguments,
    'validate-profile', '--profile', 'DL',
    '--output', profileReportPath,
  ], {
    cwd: repoRoot,
    stdio: ['ignore', 'inherit', 'inherit'],
  })
  const profileReport = readFileSync(profileReportPath, 'utf8')
  if (!profileReport.includes('Ontology and imports closure in profile')) {
    throw new Error(`ROBOT did not confirm OWL 2 DL: ${profileReport.trim()}`)
  }

  if (options.reason) {
    execFileSync('java', [
      '-Xmx3g',
      '-jar', robotJarPath,
      ...commonMergeArguments,
      'reason', '--reasoner', 'HermiT', '--equivalent-classes-allowed', 'all',
      '--output', reasonedPath,
    ], {
      cwd: repoRoot,
      stdio: ['ignore', 'inherit', 'inherit'],
    })
  }

  const afterHashes = Object.fromEntries([...inputPaths].map(([label, path]) => [label, sha256File(path)]))
  if (JSON.stringify(beforeHashes) !== JSON.stringify(afterHashes)) {
    throw new Error('OWL validation inputs changed while ROBOT was running.')
  }
  const report = {
    generatedAt: new Date().toISOString(),
    passed: true,
    owlProfile: 'OWL 2 DL',
    reasoning: options.reason ? 'HermiT passed' : 'not requested',
    fwuOntologyCommit: fwuCommit,
    robotJar: isInsideRepo(robotJarPath) ? repoRelative(robotJarPath) : robotJarPath,
    robotJarSha256: beforeHashes.robotJar,
    inputs: Object.fromEntries([...inputPaths].map(([label, path]) => [label, {
      path: isInsideRepo(path) ? repoRelative(path) : path,
      sha256: beforeHashes[label],
    }])),
    outputs: {
      profileReport: {
        path: repoRelative(profileReportPath),
        sha256: sha256File(profileReportPath),
      },
      reasonedOntology: options.reason ? {
        path: repoRelative(reasonedPath),
        sha256: sha256File(reasonedPath),
      } : null,
    },
  }
  writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`)
  writeFileSync(markdownPath, `# MEM/FWU OWL Validation Report

Generated at: ${report.generatedAt}

Result: passed

- Profile: OWL 2 DL
- Reasoning: ${report.reasoning}
- FWU ontology commit: \`${report.fwuOntologyCommit ?? 'not available'}\`
- ROBOT JAR SHA-256: \`${report.robotJarSha256}\`

## Bound inputs

| Input | Path | SHA-256 |
| --- | --- | --- |
${Object.entries(report.inputs).map(([label, input]) => `| ${label} | \`${input.path}\` | \`${input.sha256}\` |`).join('\n')}

## Outputs

| Output | Path | SHA-256 |
| --- | --- | --- |
| OWL 2 DL report | \`${report.outputs.profileReport.path}\` | \`${report.outputs.profileReport.sha256}\` |
${report.outputs.reasonedOntology ? `| HermiT reasoned ontology | \`${report.outputs.reasonedOntology.path}\` | \`${report.outputs.reasonedOntology.sha256}\` |` : '| HermiT reasoned ontology | not requested | — |'}
`)
  return { jsonPath, markdownPath }
}

const run = async () => {
  const options = parseArgs(process.argv.slice(2))
  if (options.help) {
    process.stdout.write(usage())
    return
  }
  if (options.mode === 'validate-owl') {
    const result = validateOwlBundle(options)
    process.stdout.write(`OWL validation passed: ${repoRelative(result.markdownPath)}\n`)
    return
  }

  const corePath = requireOntologyCore(options.ontologyDir)

  if (options.mode === 'to-slim-rdf') {
    const result = await writeSlimRdf(options)
    process.stdout.write(`Wrote slim MEM/FWU RDF bundle: ${repoRelative(result.bundlePath)}\n`)
    process.stdout.write(`Wrote slim MEM/FWU profile: ${repoRelative(result.profilePath)}\n`)
    process.stdout.write(`Wrote slim MEM/FWU manifest: ${repoRelative(result.manifestPath)}\n`)
    return
  }

  let archiveRoot = ''
  let semanticCounts = emptyCounts()
  let reconstruction: RoundtripReport['reconstruction'] = null
  let packageValidation: RoundtripReport['packageValidation'] = null
  const inputZipIsRead = ['roundtrip', 'to-rdf', 'validate'].includes(options.mode)
  const rdfIsReadWithoutRewrite = ['from-rdf', 'validate'].includes(options.mode)
  const stableReadInputs = new Map<string, { path: string; sha256: string }>()
  if (inputZipIsRead) stableReadInputs.set('input ZIP', { path: options.zipPath, sha256: sha256File(options.zipPath) })
  if (rdfIsReadWithoutRewrite) stableReadInputs.set('RDF', { path: options.rdfPath, sha256: sha256File(options.rdfPath) })
  stableReadInputs.set('FWU core', { path: corePath, sha256: sha256File(corePath) })

  if (options.mode === 'roundtrip' || options.mode === 'to-rdf') {
    const rdfResult = await writeRdf(options)
    archiveRoot = rdfResult.archiveRoot
    semanticCounts = rdfResult.counts
  }

  if (options.mode === 'roundtrip' || options.mode === 'from-rdf' || options.mode === 'validate') {
    const result = await reconstructFromRdf(options)
    archiveRoot = archiveRoot || result.archiveRoot
    zipReconstructedPackage(options, result.archiveRoot)
  }

  if (options.mode === 'roundtrip' || options.mode === 'validate') {
    if (semanticCounts.files === 0 && existsSync(options.rdfPath)) {
      semanticCounts = await countRdfSemantics(options.rdfPath)
    }
    reconstruction = compareZipEntries(options.zipPath, options.reconstructedZipPath, options.reconstructedDir)
    packageValidation = runPackageValidation(options)
  }

  stableReadInputs.forEach((input, label) => {
    const finalSha256 = sha256File(input.path)
    if (finalSha256 !== input.sha256) throw new Error(`${label} changed during the technical roundtrip.`)
  })
  const reconstructsZip = ['roundtrip', 'from-rdf', 'validate'].includes(options.mode)
  const writesProfile = ['roundtrip', 'to-rdf'].includes(options.mode)
  const report: RoundtripReport = {
    generatedAt: new Date().toISOString(),
    inputZip: repoRelative(options.zipPath),
    rdfPath: repoRelative(options.rdfPath),
    profilePath: repoRelative(options.profilePath),
    reconstructedZip: repoRelative(options.reconstructedZipPath),
    hashes: {
      inputZipSha256: inputZipIsRead ? stableReadInputs.get('input ZIP')?.sha256 ?? null : null,
      rdfSha256: sha256RegularFile(options.rdfPath),
      profileSha256: writesProfile ? sha256RegularFile(options.profilePath) : null,
      reconstructedZipSha256: reconstructsZip ? sha256RegularFile(options.reconstructedZipPath) : null,
      ontologyCoreSha256: stableReadInputs.get('FWU core')?.sha256 ?? null,
    },
    archiveRoot,
    fwuOntology: {
      repository: 'https://github.com/FWU-DE/lehrplan-ontologie',
      localPath: repoRelative(options.ontologyDir),
      corePath: repoRelative(corePath),
      commit: ontologyCommit(options.ontologyDir),
      ontologyIri: LP_CORE_ONTOLOGY,
    },
    semanticCounts,
    reconstruction,
    packageValidation,
  }
  writeReport(options, report)

  const failed = (reconstruction?.mismatches.length ?? 0) > 0 || packageValidation?.passed === false
  if (failed) {
    process.exitCode = 1
  }
}

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  process.stderr.write(`${message}\n`)
  process.exitCode = 1
})
