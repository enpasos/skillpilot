import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { createReadStream, createWriteStream, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
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
  mode: 'roundtrip' | 'to-rdf' | 'to-slim-rdf' | 'from-rdf' | 'validate'
  zipPath: string
  outDir: string
  rdfPath: string
  profilePath: string
  slimDir: string
  reconstructedDir: string
  reconstructedZipPath: string
  ontologyDir: string
  help: boolean
}

type SlimRdfFile = {
  name: string
  path: string
  triples: number
  bytes: number
  description: string
}

type ZipEntryRecord = {
  path: string
  content: Buffer
  text: string
  sha256: string
}

type SemanticCounts = {
  files: number
  textLines: number
  canonicalGoals: number
  containsEdges: number
  requiresEdges: number
  competencyCatalogEntries: number
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
}

type RoundtripReport = {
  generatedAt: string
  inputZip: string
  rdfPath: string
  profilePath: string
  reconstructedZip: string
  archiveRoot: string
  fwuOntology: {
    repository: string
    localPath: string
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
  | 'program-structure'
  | 'practice-or-assessment'
  | 'memorization'
  | 'orientation'

type GoalFwuClassification = {
  kind: GoalFwuKind
  profileClass: string
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

const RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
const RDFS = 'http://www.w3.org/2000/01/rdf-schema#'
const OWL = 'http://www.w3.org/2002/07/owl#'
const XSD = 'http://www.w3.org/2001/XMLSchema#'
const DCTERMS = 'http://purl.org/dc/terms/'
const SKOS = 'http://www.w3.org/2004/02/skos/core#'
const BFO = 'http://purl.obolibrary.org/obo/'
const LP = 'https://w3id.org/lehrplan/ontology/'
const SP = 'https://skillpilot.de/ns/roundtrip#'
const ID = 'https://skillpilot.de/id/mem-fwu-roundtrip/'

const LP_CURRICULUM = `${LP}LP_0000438`
const LP_COMPETENCE = `${LP}LP_0000013`
const LP_CURRICULAR_ELEMENT = `${LP}LP_0000261`
const LP_COMPETENCY_SPECIFICATION = `${LP}LP_0000263`
const LP_CURRICULAR_AREA = `${LP}LP_0000349`
const LP_REFERENCE = `${LP}LP_0030065`
const LP_SCHOOL_SUBJECT = `${LP}LP_0000001`
const LP_SCHOOL_TYPE = `${LP}LP_0000111`
const LP_HAS_SCHOOL_SUBJECT = `${LP}LP_0000537`
const LP_FOR_TYPE_OF_SCHOOL = `${LP}LP_0000812`
const LP_HAS_REFERENCE = `${LP}LP_0030071`
const BFO_HAS_PART = `${BFO}BFO_0000051`
const KIM_MATHEMATICS = 'http://w3id.org/kim/schulfaecher/s1017'

const emptyCounts = (): SemanticCounts => ({
  files: 0,
  textLines: 0,
  canonicalGoals: 0,
  containsEdges: 0,
  requiresEdges: 0,
  competencyCatalogEntries: 0,
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
})

const usage = () => `Usage:
  npm run roundtrip:mem-fwu -- [--zip tmp/exports/skillpilot-de-gymnasium-mathematik-v0.1.0.zip]
  npm run roundtrip:mem-fwu:to-rdf -- --zip <package.zip> --out-dir <dir>
  npm run roundtrip:mem-fwu:slim -- --zip <package.zip> --out-dir <dir>
  npm run roundtrip:mem-fwu:from-rdf -- --rdf <data.nt> --out-dir <dir>
  npm run roundtrip:mem-fwu:validate -- --zip <package.zip> --rdf <data.nt> --out-dir <dir>

Options:
  --mode <roundtrip|to-rdf|to-slim-rdf|from-rdf|validate>
  --zip <path>                  Input SkillPilot ZIP. Default: ${DEFAULT_ZIP}
  --out-dir <path>              Roundtrip working directory. Default: ${DEFAULT_OUT_DIR}
  --rdf <path>                  RDF N-Triples path. Default: <out-dir>/rdf/skillpilot-mem-fwu.nt
  --profile <path>              SkillPilot profile Turtle path. Default: <out-dir>/rdf/skillpilot-mem-fwu-profile.ttl
  --slim-dir <path>             Slim semantic RDF bundle directory. Default: <out-dir>/slim
  --reconstructed-dir <path>    Directory for reconstructed package root. Default: <out-dir>/reconstructed
  --reconstructed-zip <path>    Reconstructed ZIP path. Default: <out-dir>/skillpilot-de-gymnasium-mathematik-v0.1.0.roundtrip.zip
  --ontology-dir <path>         Local FWU ontology checkout. Default: tmp/lehrplan-ontologie
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
      if (!['roundtrip', 'to-rdf', 'to-slim-rdf', 'from-rdf', 'validate'].includes(mode)) {
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

const listZipEntries = (zipPath: string) => execFileSync('zipinfo', ['-1', zipPath], {
  encoding: 'utf8',
  maxBuffer: ZIP_COMMAND_MAX_BUFFER_BYTES,
  stdio: ['ignore', 'pipe', 'pipe'],
})
  .split(/\r?\n/u)
  .filter(Boolean)

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
      profileClass: `${SP}CurricularGoalCluster`,
      fwuClasses: [LP_CURRICULAR_ELEMENT, LP_CURRICULAR_AREA],
      safeCurricularPartWholeSource: true,
      safeCurricularPartWholeTarget: true,
    }
  }

  return {
    kind: 'curricular-atomic',
    profileClass: `${SP}AtomicCurricularGoal`,
    fwuClasses: [LP_CURRICULAR_ELEMENT, LP_COMPETENCY_SPECIFICATION],
    safeCurricularPartWholeSource: false,
    safeCurricularPartWholeTarget: true,
  }
}

const shouldWriteStrictCurricularPart = (
  source: GoalFwuClassification,
  target: GoalFwuClassification | undefined,
) => Boolean(target?.safeCurricularPartWholeTarget && source.safeCurricularPartWholeSource)

const compactJsonLiteral = (value: JsonValue | undefined) => value === undefined ? null : JSON.stringify(value)

const escapeLiteral = (value: string) => {
  let escaped = ''
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index]
    const code = value.charCodeAt(index)
    if (char === '\\') escaped += '\\\\'
    else if (char === '"') escaped += '\\"'
    else if (char === '\n') escaped += '\\n'
    else if (char === '\r') escaped += '\\r'
    else if (char === '\t') escaped += '\\t'
    else if (code < 0x20 || (code >= 0xD800 && code <= 0xDFFF)) escaped += `\\u${code.toString(16).padStart(4, '0').toUpperCase()}`
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

const writeProfile = (profilePath: string, options: { includeCarrier?: boolean } = {}) => {
  mkdirSync(dirname(profilePath), { recursive: true })
  const carrierTerms = options.includeCarrier === false ? '' : `
sp:PackageFile a owl:Class ; rdfs:label "ZIP package file"@en .
sp:textLine a owl:ObjectProperty ; rdfs:label "lossless carrier text line"@en .
sp:hasFile a owl:ObjectProperty ; rdfs:domain sp:SkillPilotPackage ; rdfs:range sp:PackageFile .
sp:lineText a owl:DatatypeProperty ; rdfs:label "line text"@en .
sp:sha256 a owl:DatatypeProperty ; rdfs:label "SHA-256 checksum"@en .
sp:byteLength a owl:DatatypeProperty ; rdfs:label "byte length"@en .
sp:lineCount a owl:DatatypeProperty ; rdfs:label "line count"@en .
sp:endsWithNewline a owl:DatatypeProperty ; rdfs:label "ends with newline"@en .
sp:sourceIndexSummaryJson a owl:DatatypeProperty ; rdfs:label "source index summary JSON"@en .
`
  writeFileSync(profilePath, `@prefix sp: <${SP}> .
@prefix lp: <${LP}> .
@prefix bfo: <${BFO}> .
@prefix owl: <${OWL}> .
@prefix rdfs: <${RDFS}> .
@prefix dcterms: <${DCTERMS}> .

<${SP}> a owl:Ontology ;
  owl:imports <${LP}> ;
  dcterms:title "SkillPilot MEM/FWU Roundtrip Profile"@en ;
  dcterms:description "Minimal SkillPilot profile used to test whether a SkillPilot competence landscape can be carried through a MEM-compatible RDF/OWL representation based on the FWU Lehrplan-Ontologie and reconstructed afterwards."@en .

sp:SkillPilotPackage a owl:Class ; rdfs:subClassOf lp:LP_0000438 ; rdfs:label "SkillPilot release package"@en .
sp:LearningLandscape a owl:Class ; rdfs:subClassOf lp:LP_0000438 ; rdfs:label "SkillPilot learning landscape"@en .
sp:LearningGoal a owl:Class ;
  rdfs:label "SkillPilot learning goal"@en ;
  rdfs:comment "A SkillPilot graph node used for learning navigation. This application-level notion is not automatically a FWU competence or competency specification."@en .
sp:AtomicGoal a owl:Class ; rdfs:subClassOf sp:LearningGoal ; rdfs:label "SkillPilot atomic graph node"@en .
sp:ClusterGoal a owl:Class ; rdfs:subClassOf sp:LearningGoal ; rdfs:label "SkillPilot cluster graph node"@en .
sp:CurricularLearningGoal a owl:Class ;
  rdfs:subClassOf sp:LearningGoal, lp:LP_0000261 ;
  rdfs:label "SkillPilot curricular learning goal"@en ;
  rdfs:comment "A SkillPilot goal that can be interpreted as a curricular element. Runtime-only nodes such as memorization cards, practice nodes, assessment nodes, or view/program structure nodes are not instances of this class by default."@en .
sp:AtomicCurricularGoal a owl:Class ;
  rdfs:subClassOf sp:AtomicGoal, sp:CurricularLearningGoal, lp:LP_0000263 ;
  rdfs:label "SkillPilot atomic curricular learning goal"@en ;
  rdfs:comment "A SkillPilot atomic goal that corresponds to a FWU CE-Kompetenzspezifikation: a curriculum-level description of a competence, not the learner's competence itself."@en .
sp:CurricularGoalCluster a owl:Class ;
  rdfs:subClassOf sp:ClusterGoal, sp:CurricularLearningGoal, lp:LP_0000349 ;
  rdfs:label "SkillPilot curricular goal cluster"@en ;
  rdfs:comment "A SkillPilot cluster that groups competency specifications or subordinate areas under a common curricular focus."@en .
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
sp:CompetencyCatalogEntry a owl:Class ; rdfs:subClassOf lp:LP_0000013 ; rdfs:label "Competency catalog entry"@en .
sp:ProgramUnit a owl:Class ; rdfs:label "Curricular program unit"@en .
sp:GoalPlacement a owl:Class ; rdfs:label "Goal placement in a program unit"@en .
sp:CompositionView a owl:Class ; rdfs:label "Learner-facing composition view"@en .
sp:CompositionNode a owl:Class ; rdfs:label "Learner-facing composition node"@en .
sp:MappingFile a owl:Class ; rdfs:label "Mapping file metadata"@en .
sp:MappingRecord a owl:Class ; rdfs:label "Canonical curriculum mapping record"@en .
sp:ReviewDecision a owl:Class ; rdfs:label "Reviewed source-to-canonical mapping decision"@en .
sp:SourceCollection a owl:Class ; rdfs:label "Curriculum source extraction collection"@en .
sp:SourceDocument a owl:Class ; rdfs:subClassOf lp:LP_0030065 ; rdfs:label "Official curriculum source document"@en .
sp:SourceGoalReference a owl:Class ; rdfs:subClassOf lp:LP_0030065 ; rdfs:label "Source goal reference with official text span"@en .
sp:CardDeck a owl:Class ; rdfs:label "Memorization card deck"@en .
sp:Card a owl:Class ; rdfs:label "Memorization card"@en .
sp:ExternalGoalReference a owl:Class ; rdfs:label "External goal reference"@en .

sp:hasLandscape a owl:ObjectProperty ; rdfs:domain sp:SkillPilotPackage ; rdfs:range sp:LearningLandscape .
sp:fwuOntologyIri a owl:ObjectProperty ; rdfs:domain sp:SkillPilotPackage ; rdfs:label "FWU ontology IRI"@en .
sp:fwuOntologyRepository a owl:ObjectProperty ; rdfs:domain sp:SkillPilotPackage ; rdfs:label "FWU ontology repository"@en .
sp:hasCompetencyCatalogEntry a owl:ObjectProperty ; rdfs:domain sp:LearningLandscape ; rdfs:range sp:CompetencyCatalogEntry .
sp:hasProgramUnit a owl:ObjectProperty ; rdfs:domain sp:LearningLandscape ; rdfs:range sp:ProgramUnit .
sp:hasGoalPlacement a owl:ObjectProperty ; rdfs:domain sp:LearningLandscape ; rdfs:range sp:GoalPlacement .
sp:hasGoal a owl:ObjectProperty ; rdfs:domain sp:LearningLandscape ; rdfs:range sp:LearningGoal .
sp:placedGoal a owl:ObjectProperty ; rdfs:domain sp:GoalPlacement ; rdfs:range sp:LearningGoal .
sp:placedInProgramUnit a owl:ObjectProperty ; rdfs:domain sp:GoalPlacement ; rdfs:range sp:ProgramUnit .
sp:containsGoal a owl:ObjectProperty ;
  rdfs:domain sp:LearningGoal ;
  rdfs:range sp:LearningGoal ;
  rdfs:comment "SkillPilot graph containment. This preserves the application graph and is not automatically BFO parthood; use sp:hasCurricularPart only where strict curricular part-whole semantics is intended."@en .
sp:hasCurricularPart a owl:ObjectProperty ;
  rdfs:subPropertyOf bfo:BFO_0000051 ;
  rdfs:domain sp:CurricularLearningGoal ;
  rdfs:range sp:CurricularLearningGoal ;
  rdfs:comment "Strict curricular part-whole relation for learning-goal composition. Do not use for UI placement, ordering, loose topic association, state visibility, or view mappings."@en .
sp:didacticRequires a owl:ObjectProperty ;
  rdfs:domain sp:LearningGoal ;
  rdfs:range sp:LearningGoal ;
  rdfs:label "didactically requires"@en ;
  rdfs:comment "A didactic prerequisite relation for learning-path navigation. This is not a generic curriculum reference."@en .
sp:competencyRef a owl:ObjectProperty ; rdfs:domain sp:LearningGoal ; rdfs:range sp:CompetencyCatalogEntry .
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
sp:resourceLinksJson a owl:DatatypeProperty ; rdfs:label "resource links JSON"@en .
sp:extendedDataJson a owl:DatatypeProperty ; rdfs:label "extended data JSON"@en .
sp:releaseJson a owl:DatatypeProperty ; rdfs:label "release metadata JSON"@en .
sp:examDataJson a owl:DatatypeProperty ; rdfs:label "exam data JSON"@en .
sp:dimensionTag a owl:DatatypeProperty ; rdfs:label "dimension tag"@en .
sp:semanticAtomic a owl:DatatypeProperty ; rdfs:label "semantic atomicity flag"@en .
sp:goalType a owl:DatatypeProperty ; rdfs:label "goal type"@en .
sp:nodeKind a owl:DatatypeProperty ; rdfs:label "node kind"@en .
sp:tag a owl:DatatypeProperty ; rdfs:label "tag"@en .
sp:example a owl:DatatypeProperty ; rdfs:label "example reference"@en .
sp:relation a owl:DatatypeProperty ; rdfs:label "relation"@en .
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
sp:json a rdfs:Datatype ; rdfs:label "compact JSON literal"@en .
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

const readEntries = (zipPath: string) => {
  const entryPaths = listZipEntries(zipPath)
  const archiveRoot = archiveRootFrom(entryPaths)
  if (!archiveRoot) {
    throw new Error('ZIP must contain exactly one archive root.')
  }

  const entries = entryPaths.map((entryPath): ZipEntryRecord => {
    const content = readZipEntry(zipPath, entryPath)
    const text = content.toString('utf8')
    if (text.includes('\uFFFD')) {
      throw new Error(`ZIP entry is not valid UTF-8 text and cannot be represented by the line carrier: ${entryPath}`)
    }
    return {
      path: entryPath,
      content,
      text,
      sha256: sha256(content),
    }
  })

  return { archiveRoot, entries }
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
  write(tripleLine(subject, predicate, literal(json, `${SP}json`)))
}

const findEntry = (entries: ZipEntryRecord[], archiveRoot: string, relativePath: string) => {
  const entryPath = `${archiveRoot}/${relativePath}`
  const entry = entries.find((candidate) => candidate.path === entryPath)
  if (!entry) {
    throw new Error(`Missing package entry: ${entryPath}`)
  }
  return entry
}

const writeLandscapeSemantics = (
  write: (line: string) => void,
  archiveRoot: string,
  entries: ZipEntryRecord[],
  counts: SemanticCounts,
) => {
  const canonicalEntry = entries.find((entry) => (
    entry.path.startsWith(`${archiveRoot}/data/canonical/`) && entry.path.endsWith('.landscape.json')
  ))
  if (!canonicalEntry) {
    throw new Error('Package does not contain a canonical landscape JSON.')
  }

  const landscapeData = jsonObject(JSON.parse(canonicalEntry.text) as JsonValue, 'canonical landscape')
  const landscapeId = stringValue(landscapeData.id) ?? stringValue(landscapeData.landscapeId) ?? stringValue(landscapeData.frameworkId) ?? 'canonical-gymnasium-math'
  const landscape = `${packageIri(archiveRoot)}/landscape/${idSegment(landscapeId)}`
  const schoolType = `${ID}school-type/gymnasium`

  write(tripleLine(packageIri(archiveRoot), `${SP}hasLandscape`, iri(landscape)))
  write(tripleLine(landscape, `${RDF}type`, iri(`${SP}LearningLandscape`)))
  write(tripleLine(landscape, `${RDF}type`, iri(LP_CURRICULUM)))
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
    write(tripleLine(resource, `${RDF}type`, iri(LP_COMPETENCE)))
    write(tripleLine(resource, `${SP}skillpilotId`, literal(competencyId)))
    writeStringField(write, resource, `${RDFS}label`, data.label, 'de')
    writeStringField(write, resource, `${SP}dimension`, data.dimension)
  })

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
  })

  const goals = Array.isArray(landscapeData.goals) ? landscapeData.goals : []
  const goalClassifications = new Map<string, GoalFwuClassification>()
  goals.forEach((goal) => {
    const data = jsonObject(goal, 'canonical goal')
    const goalId = stringValue(data.id)
    if (!goalId) {
      return
    }
    goalClassifications.set(goalId, classifyGoalForFwu(data, stringArray(data.contains)))
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
    if (classification.safeCurricularPartWholeTarget) {
      write(tripleLine(landscape, BFO_HAS_PART, iri(resource)))
    }
    write(tripleLine(resource, `${RDF}type`, iri(`${SP}LearningGoal`)))
    write(tripleLine(resource, `${RDF}type`, iri(contains.length > 0 ? `${SP}ClusterGoal` : `${SP}AtomicGoal`)))
    write(tripleLine(resource, `${RDF}type`, iri(classification.profileClass)))
    classification.fwuClasses.forEach((fwuClass) => {
      write(tripleLine(resource, `${RDF}type`, iri(fwuClass)))
    })
    write(tripleLine(resource, `${SP}skillpilotId`, literal(goalId)))
    writeStringField(write, resource, `${SP}shortKey`, data.shortKey)
    writeStringField(write, resource, `${RDFS}label`, data.title, 'de')
    writeStringField(write, resource, `${RDFS}label`, data.titleEn, 'en')
    writeStringField(write, resource, `${DCTERMS}description`, data.description, 'de')
    writeStringField(write, resource, `${DCTERMS}description`, data.descriptionEn, 'en')
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
    writeJsonField(write, resource, `${SP}resourceLinksJson`, data.resourceLinks)
    writeJsonField(write, resource, `${SP}extendedDataJson`, data.extendedData)
    writeJsonField(write, resource, `${SP}releaseJson`, data.release)
    writeJsonField(write, resource, `${SP}examDataJson`, data.examData)
    stringArray(data.tags).forEach((tag) => write(tripleLine(resource, `${SP}tag`, literal(tag))))
    stringArray(data.dimensionTags).forEach((tag) => write(tripleLine(resource, `${SP}dimensionTag`, literal(tag))))
    stringArray(data.examples).forEach((example) => write(tripleLine(resource, `${SP}example`, literal(example))))
    ;[...new Set([...stringArray(data.kompetenzen), ...stringArray(data.competencyRefs)])].forEach((competencyId) => (
      write(tripleLine(resource, `${SP}competencyRef`, iri(`${packageIri(archiveRoot)}/competency/${idSegment(competencyId)}`)))
    ))
    contains.forEach((targetId) => {
      const target = iri(goalIri(archiveRoot, targetId))
      write(tripleLine(resource, `${SP}containsGoal`, target))
      if (shouldWriteStrictCurricularPart(classification, goalClassifications.get(targetId))) {
        write(tripleLine(resource, `${SP}hasCurricularPart`, target))
        write(tripleLine(resource, BFO_HAS_PART, target))
      }
    })
    requires.forEach((targetId) => {
      write(tripleLine(resource, `${SP}didacticRequires`, iri(goalIri(archiveRoot, targetId))))
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
      const data = jsonObject(JSON.parse(entry.text) as JsonValue, 'composition view')
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
      const data = jsonObject(JSON.parse(entry.text) as JsonValue, 'mapping file')
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
  const sourceReferences = jsonObject(JSON.parse(sourceReferencesEntry.text) as JsonValue, 'source-goal references')
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

    const documents = Array.isArray(sourceData.sourceDocuments) ? sourceData.sourceDocuments : []
    documents.forEach((document) => {
      const documentData = jsonObject(document, 'source document')
      const key = stringValue(documentData.key) ?? `${extractionId}-document-${counts.sourceDocuments}`
      const documentResource = sourceDocumentIri(archiveRoot, `${extractionId}/${key}`)
      counts.sourceDocuments += 1
      write(tripleLine(collection, `${SP}hasSourceDocument`, iri(documentResource)))
      write(tripleLine(documentResource, `${RDF}type`, iri(`${SP}SourceDocument`)))
      write(tripleLine(documentResource, `${RDF}type`, iri(LP_REFERENCE)))
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
      write(tripleLine(resource, `${RDF}type`, iri(`${SP}SourceGoalReference`)))
      write(tripleLine(resource, `${RDF}type`, iri(LP_REFERENCE)))
      write(tripleLine(resource, `${SP}skillpilotId`, literal(sourceGoalId)))
      if (documentKey) {
        const documentResource = sourceDocumentIri(archiveRoot, `${extractionId}/${documentKey}`)
        write(tripleLine(resource, LP_HAS_REFERENCE, iri(documentResource)))
        write(tripleLine(resource, `${DCTERMS}source`, iri(documentResource)))
      }
      writeStringField(write, resource, `${RDFS}label`, goalData.title, 'de')
      writeStringField(write, resource, `${DCTERMS}description`, goalData.description, 'de')
      writeStringField(write, resource, `${SP}sourceText`, goalData.sourceText)
      writeStringField(write, resource, `${SP}sourceSpan`, goalData.sourceSpan)
      writeStringField(write, resource, `${SP}sourceRef`, goalData.sourceRef)
      writeStringField(write, resource, `${SP}sourceTextSha256`, goalData.sourceTextSha256)
      writeStringField(write, resource, `${SP}sourceDocumentUrl`, goalData.sourceDocumentUrl)
      writeStringField(write, resource, `${SP}sourceDocumentLandingUrl`, goalData.sourceDocumentLandingUrl)
      writeStringField(write, resource, `${SP}sourceDocumentTitle`, goalData.sourceDocumentTitle, 'de')
      writeStringField(write, resource, `${SP}topicCode`, goalData.topicCode)
      writeStringField(write, resource, `${SP}passageId`, goalData.passageId)
      writeStringField(write, resource, `${SP}granularity`, goalData.granularity)
      writeNumberField(write, resource, `${SP}sourcePage`, goalData.sourcePage)
      writeNumberField(write, resource, `${SP}sourceLine`, goalData.sourceLine)
      writeStringField(write, resource, `${SP}parentBulletText`, goalData.parentBulletText)
      writeJsonField(write, resource, `${SP}passageJson`, goalData.passage)
      writeStringField(write, resource, `${SP}phase`, goalData.phase)
      writeStringField(write, resource, `${SP}courseLevel`, goalData.courseLevel)
      writeStringField(write, resource, `${SP}category`, goalData.category)
    })
  })

  if (options.includeSourceIndexSummary !== false) {
    const sourceIndexEntry = findEntry(entries, archiveRoot, 'data/sources/source-index.json')
    const sourceIndex = jsonObject(JSON.parse(sourceIndexEntry.text) as JsonValue, 'source index')
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
    ? (jsonObject(JSON.parse(cardIndexEntry.text) as JsonValue, 'card index').decks)
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
    const data = jsonObject(JSON.parse(entry.text) as JsonValue, 'card deck')
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
  const data = jsonObject(JSON.parse(dependencyEntry.text) as JsonValue, 'external dependencies')
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
  write(tripleLine(root, `${RDF}type`, iri(`${SP}SkillPilotPackage`)))
  write(tripleLine(root, `${RDF}type`, iri(LP_CURRICULUM)))
  write(tripleLine(root, `${DCTERMS}title`, langLiteral('SkillPilot Gymnasium Mathematik v0.1.0', 'de')))
  write(tripleLine(root, `${SP}archiveRoot`, literal(archiveRoot)))
  write(tripleLine(root, `${SP}sourceZipName`, literal(basename(inputZipPath))))
  write(tripleLine(root, `${SP}sourceZipSha256`, literal(sha256(readFileSync(inputZipPath)))))
  write(tripleLine(root, `${SP}fwuOntologyIri`, iri(LP)))
  write(tripleLine(root, `${SP}fwuOntologyRepository`, iri('https://github.com/FWU-DE/lehrplan-ontologie')))
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
) => {
  writePackageHeaderSemantics(write, archiveRoot, inputZipPath, ontologyDir)

  writeLandscapeSemantics(write, archiveRoot, entries, counts)
  writeViewSemantics(write, archiveRoot, entries, counts)
  writeMappingSemantics(write, archiveRoot, entries, counts)
  writeSourceSemantics(write, archiveRoot, entries, counts)
  writeCardSemantics(write, archiveRoot, entries, counts)
  writeExternalDependencySemantics(write, archiveRoot, entries, counts)
}

const writeRdf = async (options: CliOptions) => {
  const { archiveRoot, entries } = readEntries(options.zipPath)
  const counts = emptyCounts()

  rmSync(options.rdfPath, { force: true })
  rmSync(options.profilePath, { force: true })
  mkdirSync(dirname(options.rdfPath), { recursive: true })
  writeProfile(options.profilePath)

  const stream = createWriteStream(options.rdfPath, { encoding: 'utf8', highWaterMark: 64 * 1024 * 1024 })
  const write = (line: string) => {
    stream.write(line)
  }

  writeSemanticTriples(write, archiveRoot, entries, counts, options.zipPath, options.ontologyDir)
  writeCarrierTriples(write, archiveRoot, entries, counts)

  await new Promise<void>((resolvePromise, reject) => {
    stream.end((error?: Error | null) => {
      if (error) {
        reject(error)
        return
      }
      resolvePromise()
    })
  })

  return { archiveRoot, counts }
}

const writeNtFile = async (
  filePath: string,
  emit: (write: (line: string) => void) => void,
) => {
  rmSync(filePath, { force: true })
  mkdirSync(dirname(filePath), { recursive: true })
  const stream = createWriteStream(filePath, { encoding: 'utf8', highWaterMark: 16 * 1024 * 1024 })
  let triples = 0
  const write = (line: string) => {
    triples += 1
    stream.write(line)
  }

  emit(write)

  await new Promise<void>((resolvePromise, reject) => {
    stream.end((error?: Error | null) => {
      if (error) {
        reject(error)
        return
      }
      resolvePromise()
    })
  })

  return { triples, bytes: readFileSync(filePath).byteLength }
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
  return readFileSync(bundlePath).byteLength
}

const writeSlimReadme = (slimDir: string, data: {
  archiveRoot: string
  bundlePath: string
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

The official curriculum evidence needed for independent semantic checks is represented as source-document URLs plus exact source-goal spans in \`sources.nt\`.

\`sp:zipPath\` is retained only as a local package placement literal for deterministic reconstruction; it is not used as curriculum-source provenance.

## Files

| File | Purpose | Triples | Size |
| --- | --- | ---: | ---: |
${data.files.map((file) => `| \`${file.name}\` | ${file.description} | ${file.triples} | ${file.bytes} B |`).join('\n')}

\`bundle.nt\` is only a convenience concatenation of the semantic files for parsers that prefer one N-Triples input file.

## Semantic Counts

| Item | Count |
| --- | ---: |
${Object.entries(data.counts).map(([key, value]) => `| ${key} | ${value} |`).join('\n')}

## Validation

Run the semantic reconstruction check from this bundle:

\`\`\`bash
cd app
npm run roundtrip:mem-fwu:semantic-reconstruct -- \\
  --rdf ${repoRelative(data.bundlePath)} \\
  --zip tmp/exports/skillpilot-de-gymnasium-mathematik-v0.1.0.zip \\
  --out-dir ${repoRelative(resolve(slimDir, 'semantic-reconstructed'))}
\`\`\`
`)
}

const writeSlimRdf = async (options: CliOptions) => {
  const { archiveRoot, entries } = readEntries(options.zipPath)
  const counts = emptyCounts()
  const slimDir = options.slimDir
  mkdirSync(slimDir, { recursive: true })

  const profilePath = resolve(slimDir, 'skillpilot-mem-fwu-profile.ttl')
  const bundlePath = resolve(slimDir, 'bundle.nt')
  const manifestPath = resolve(slimDir, 'manifest.json')
  const readmePath = resolve(slimDir, 'README.md')
  const generatedNames = [
    'landscape.nt',
    'views.nt',
    'mappings.nt',
    'sources.nt',
    'cards.nt',
    'bundle.nt',
    'skillpilot-mem-fwu-profile.ttl',
    'manifest.json',
    'README.md',
  ]
  generatedNames.forEach((name) => rmSync(resolve(slimDir, name), { force: true }))

  writeProfile(profilePath, { includeCarrier: false })

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
        writeLandscapeSemantics(write, archiveRoot, entries, counts)
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
      description: segment.description,
    })
  }

  const bundleBytes = await writeBundleFile(bundlePath, files.map((file) => resolve(repoRoot, file.path)))
  files.push({
    name: 'bundle.nt',
    path: repoRelative(bundlePath),
    triples: files.reduce((sum, file) => sum + file.triples, 0),
    bytes: bundleBytes,
    description: 'concatenated semantic bundle for single-file RDF loaders',
  })

  const manifest = {
    generatedAt: new Date().toISOString(),
    archiveRoot,
    inputZip: repoRelative(options.zipPath),
    inputZipSha256: sha256(readFileSync(options.zipPath)),
    profile: repoRelative(profilePath),
    bundle: repoRelative(bundlePath),
    fwuOntology: {
      repository: 'https://github.com/FWU-DE/lehrplan-ontologie',
      localPath: repoRelative(options.ontologyDir),
      commit: ontologyCommit(options.ontologyDir),
      ontologyIri: LP,
    },
    semantics: {
      carrierLaneIncluded: false,
      sourceIndexSummaryJsonIncluded: false,
      officialSourceTextSpansIncluded: true,
    },
    files,
    semanticCounts: counts,
  }
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
  writeSlimReadme(slimDir, { archiveRoot, bundlePath, files, counts })

  return {
    archiveRoot,
    counts,
    profilePath,
    bundlePath,
    manifestPath,
    readmePath,
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
    endsWithNewline: boolean
    lineResources: string[]
  }

  const files = new Map<string, FileCarrier>()
  const lineTexts = new Map<string, string>()
  let archiveRoot: string | null = null

  const ensureFile = (resource: string) => {
    const existing = files.get(resource)
    if (existing) {
      return existing
    }
    const carrier: FileCarrier = {
      path: null,
      endsWithNewline: false,
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
    if (triple.predicate === `${SP}zipPath`) {
      if (!isCarrierFileResource(triple.subject)) {
        continue
      }
      ensureFile(triple.subject).path = literalObjectValue(triple.object)
      continue
    }
    if (triple.predicate === `${SP}endsWithNewline`) {
      if (!isCarrierFileResource(triple.subject)) {
        continue
      }
      ensureFile(triple.subject).endsWithNewline = literalObjectValue(triple.object) === 'true'
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

  rmSync(options.reconstructedDir, { recursive: true, force: true })
  mkdirSync(options.reconstructedDir, { recursive: true })

  const orderedFiles = [...files.values()]
    .filter((file) => file.path !== null)
    .sort((left, right) => String(left.path).localeCompare(String(right.path)))

  orderedFiles.forEach((file) => {
    if (!file.path) {
      return
    }
    const target = resolve(options.reconstructedDir, file.path)
    if (!isInsideRepo(target)) {
      throw new Error(`Refusing to reconstruct outside repository: ${file.path}`)
    }
    mkdirSync(dirname(target), { recursive: true })
    const lines = file.lineResources
      .sort((left, right) => lineIndexFromIri(left) - lineIndexFromIri(right))
      .map((lineResource) => {
        const line = lineTexts.get(lineResource)
        if (line === undefined) {
          throw new Error(`Missing line text for ${lineResource}`)
        }
        return line
      })
    const content = `${lines.join('\n')}${file.endsWithNewline ? '\n' : ''}`
    writeFileSync(target, content)
  })

  return { archiveRoot, fileCount: orderedFiles.length }
}

const countRdfSemantics = async (rdfPath: string) => {
  const counts = emptyCounts()
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
    if (triple.predicate !== `${RDF}type` || triple.object.kind !== 'iri') {
      continue
    }
    if (triple.object.value === `${SP}PackageFile`) counts.files += 1
    if (triple.object.value === `${SP}LearningGoal`) counts.canonicalGoals += 1
    if (triple.object.value === `${SP}CompetencyCatalogEntry`) counts.competencyCatalogEntries += 1
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
  }

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
    .sort((left, right) => left.localeCompare(right))
    .join('\n')
  writeFileSync(zipListPath, `${fileList}\n`)
  execFileSync('zip', ['-X', '-0', '-q', options.reconstructedZipPath, '-@'], {
    cwd: options.reconstructedDir,
    input: readFileSync(zipListPath),
    stdio: ['pipe', 'ignore', 'pipe'],
  })
}

const compareZipEntries = (originalZip: string, reconstructedZip: string) => {
  const originalEntries = listZipEntries(originalZip)
  const reconstructedEntries = listZipEntries(reconstructedZip)
  const allEntries = [...new Set([...originalEntries, ...reconstructedEntries])].sort((left, right) => left.localeCompare(right))
  const mismatches: string[] = []
  let byteIdenticalFiles = 0

  allEntries.forEach((entry) => {
    const inOriginal = originalEntries.includes(entry)
    const inReconstructed = reconstructedEntries.includes(entry)
    if (!inOriginal || !inReconstructed) {
      mismatches.push(`${entry}: ${inOriginal ? 'missing in reconstructed ZIP' : 'unexpected in reconstructed ZIP'}`)
      return
    }
    const originalContent = readZipEntry(originalZip, entry)
    const reconstructedContent = readZipEntry(reconstructedZip, entry)
    const originalSha = sha256(originalContent)
    const reconstructedSha = sha256(reconstructedContent)
    if (originalSha !== reconstructedSha) {
      mismatches.push(`${entry}: ${originalSha} != ${reconstructedSha}`)
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
  const command = `npm run export:subject-packages:validate -- --zip ${repoRelative(options.reconstructedZipPath)} --report-dir ${repoRelative(resolve(options.outDir, 'package-validation'))}`
  try {
    execFileSync('npm', [
      'run',
      'export:subject-packages:validate',
      '--',
      '--zip',
      options.reconstructedZipPath,
      '--report-dir',
      resolve(options.outDir, 'package-validation'),
    ], {
      cwd: appRoot,
      stdio: ['ignore', 'pipe', 'pipe'],
      maxBuffer: ZIP_COMMAND_MAX_BUFFER_BYTES,
    })
    return { command, passed: true }
  } catch (error) {
    if (error instanceof Error) {
      process.stderr.write(`${error.message}\n`)
    }
    return { command, passed: false }
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
- Archive root: \`${report.archiveRoot}\`
- FWU ontology: \`${report.fwuOntology.repository}\`
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

Status: ${report.packageValidation.passed ? 'passed' : 'failed'}`
  : 'Not run in this mode.'}
`)
}

const run = async () => {
  const options = parseArgs(process.argv.slice(2))
  if (options.help) {
    process.stdout.write(usage())
    return
  }

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
    reconstruction = compareZipEntries(options.zipPath, options.reconstructedZipPath)
    packageValidation = runPackageValidation(options)
  }

  const report: RoundtripReport = {
    generatedAt: new Date().toISOString(),
    inputZip: repoRelative(options.zipPath),
    rdfPath: repoRelative(options.rdfPath),
    profilePath: repoRelative(options.profilePath),
    reconstructedZip: repoRelative(options.reconstructedZipPath),
    archiveRoot,
    fwuOntology: {
      repository: 'https://github.com/FWU-DE/lehrplan-ontologie',
      localPath: repoRelative(options.ontologyDir),
      commit: ontologyCommit(options.ontologyDir),
      ontologyIri: LP,
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
