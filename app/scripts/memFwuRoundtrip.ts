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
  mode: 'roundtrip' | 'to-rdf' | 'from-rdf' | 'validate'
  zipPath: string
  outDir: string
  rdfPath: string
  profilePath: string
  reconstructedDir: string
  reconstructedZipPath: string
  ontologyDir: string
  help: boolean
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
  npm run roundtrip:mem-fwu:from-rdf -- --rdf <data.nt> --out-dir <dir>
  npm run roundtrip:mem-fwu:validate -- --zip <package.zip> --rdf <data.nt> --out-dir <dir>

Options:
  --mode <roundtrip|to-rdf|from-rdf|validate>
  --zip <path>                  Input SkillPilot ZIP. Default: ${DEFAULT_ZIP}
  --out-dir <path>              Roundtrip working directory. Default: ${DEFAULT_OUT_DIR}
  --rdf <path>                  RDF N-Triples path. Default: <out-dir>/rdf/skillpilot-mem-fwu.nt
  --profile <path>              SkillPilot profile Turtle path. Default: <out-dir>/rdf/skillpilot-mem-fwu-profile.ttl
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
      if (!['roundtrip', 'to-rdf', 'from-rdf', 'validate'].includes(mode)) {
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

  ;[options.outDir, options.rdfPath, options.profilePath, options.reconstructedDir, options.reconstructedZipPath, options.ontologyDir]
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

const viewIri = (archiveRoot: string, entryPath: string) => `${fileIri(archiveRoot, entryPath)}/view`

const viewNodeIri = (archiveRoot: string, entryPath: string, path: string) => `${viewIri(archiveRoot, entryPath)}/node/${idSegment(path)}`

const deckIri = (archiveRoot: string, entryPath: string, deckId: string, language: string | null) => (
  `${fileIri(archiveRoot, entryPath)}/deck/${idSegment(deckId)}${language ? `/${idSegment(language)}` : ''}`
)

const cardIri = (archiveRoot: string, entryPath: string, cardId: string) => `${fileIri(archiveRoot, entryPath)}/card/${idSegment(cardId)}`

const writeProfile = (profilePath: string) => {
  mkdirSync(dirname(profilePath), { recursive: true })
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
sp:LearningGoal a owl:Class ; rdfs:subClassOf lp:LP_0000263 ; rdfs:label "SkillPilot learning goal"@en .
sp:AtomicGoal a owl:Class ; rdfs:subClassOf sp:LearningGoal ; rdfs:label "Atomic learning goal"@en .
sp:ClusterGoal a owl:Class ; rdfs:subClassOf sp:LearningGoal ; rdfs:label "Cluster learning goal"@en .
sp:CompositionView a owl:Class ; rdfs:label "Learner-facing composition view"@en .
sp:MappingRecord a owl:Class ; rdfs:label "Canonical curriculum mapping record"@en .
sp:SourceGoalReference a owl:Class ; rdfs:subClassOf lp:LP_0030065 ; rdfs:label "Source goal reference with official text span"@en .
sp:CardDeck a owl:Class ; rdfs:label "Memorization card deck"@en .
sp:Card a owl:Class ; rdfs:label "Memorization card"@en .

sp:containsGoal a owl:ObjectProperty ; rdfs:subPropertyOf bfo:BFO_0000051 ; rdfs:domain sp:LearningGoal ; rdfs:range sp:LearningGoal .
sp:didacticRequires a owl:ObjectProperty ; rdfs:domain sp:LearningGoal ; rdfs:range sp:LearningGoal ; rdfs:label "didactically requires"@en .
sp:mapsSourceGoal a owl:ObjectProperty ; rdfs:domain sp:MappingRecord ; rdfs:range sp:SourceGoalReference .
sp:mapsCanonicalGoal a owl:ObjectProperty ; rdfs:domain sp:MappingRecord ; rdfs:range sp:LearningGoal .
sp:textLine a owl:ObjectProperty ; rdfs:label "lossless carrier text line"@en .

sp:skillpilotId a owl:DatatypeProperty ; rdfs:label "SkillPilot stable id"@en .
sp:zipPath a owl:DatatypeProperty ; rdfs:label "ZIP entry path"@en .
sp:lineText a owl:DatatypeProperty ; rdfs:label "line text"@en .
sp:sourceSpan a owl:DatatypeProperty ; rdfs:label "official source span"@en .
sp:sourceRef a owl:DatatypeProperty ; rdfs:label "official source locator"@en .
sp:order a owl:DatatypeProperty ; rdfs:label "stable order"@en .
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
  writeStringField(write, landscape, `${SP}frameworkId`, landscapeData.frameworkId)
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
    writeStringField(write, resource, `${SP}kind`, data.kind)
    writeJsonField(write, resource, `${SP}contextJson`, data.context)
  })

  const goals = Array.isArray(landscapeData.goals) ? landscapeData.goals : []
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

    write(tripleLine(landscape, BFO_HAS_PART, iri(resource)))
    write(tripleLine(resource, `${RDF}type`, iri(`${SP}LearningGoal`)))
    write(tripleLine(resource, `${RDF}type`, iri(contains.length > 0 ? `${SP}ClusterGoal` : `${SP}AtomicGoal`)))
    write(tripleLine(resource, `${RDF}type`, iri(contains.length > 0 ? LP_CURRICULAR_AREA : LP_COMPETENCY_SPECIFICATION)))
    write(tripleLine(resource, `${SP}skillpilotId`, literal(goalId)))
    writeStringField(write, resource, `${SP}shortKey`, data.shortKey)
    writeStringField(write, resource, `${RDFS}label`, data.title, 'de')
    writeStringField(write, resource, `${DCTERMS}description`, data.description, 'de')
    writeStringField(write, resource, `${SP}phase`, data.phase)
    writeStringField(write, resource, `${SP}area`, data.area)
    writeStringField(write, resource, `${SP}level`, data.level)
    writeStringField(write, resource, `${SP}courseLevel`, data.courseLevel)
    writeBooleanField(write, resource, `${SP}core`, data.core)
    writeNumberField(write, resource, `${SP}weight`, data.weight)
    writeJsonField(write, resource, `${SP}applicabilityJson`, data.applicability)
    writeJsonField(write, resource, `${SP}metadataJson`, data.metadata)
    stringArray(data.tags).forEach((tag) => write(tripleLine(resource, `${SP}tag`, literal(tag))))
    stringArray(data.examples).forEach((example) => write(tripleLine(resource, `${SP}example`, literal(example))))
    stringArray(data.kompetenzen).forEach((competencyId) => (
      write(tripleLine(resource, `${SP}competencyRef`, iri(`${packageIri(archiveRoot)}/competency/${idSegment(competencyId)}`)))
    ))
    contains.forEach((targetId) => {
      write(tripleLine(resource, `${SP}containsGoal`, iri(goalIri(archiveRoot, targetId))))
      write(tripleLine(resource, BFO_HAS_PART, iri(goalIri(archiveRoot, targetId))))
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
  entryPath: string,
  nodes: JsonValue[],
  parent: string,
  counts: SemanticCounts,
  pathPrefix: string,
) => {
  nodes.forEach((node, index) => {
    const data = jsonObject(node, 'composition view node')
    const nodePath = `${pathPrefix}.${index}`
    const resource = viewNodeIri(archiveRoot, entryPath, nodePath)
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
      walkViewNodes(write, archiveRoot, entryPath, children, resource, counts, nodePath)
    }
  })
}

const writeViewSemantics = (
  write: (line: string) => void,
  archiveRoot: string,
  entries: ZipEntryRecord[],
  counts: SemanticCounts,
) => {
  entries
    .filter((entry) => entry.path.startsWith(`${archiveRoot}/data/views/`) && entry.path.endsWith('.view.json'))
    .forEach((entry) => {
      const data = jsonObject(JSON.parse(entry.text) as JsonValue, 'composition view')
      const view = viewIri(archiveRoot, entry.path)
      counts.compositionViews += 1
      write(tripleLine(packageIri(archiveRoot), `${SP}hasCompositionView`, iri(view)))
      write(tripleLine(view, `${RDF}type`, iri(`${SP}CompositionView`)))
      write(tripleLine(view, `${SP}zipPath`, literal(entry.path)))
      writeStringField(write, view, `${SP}landscapeId`, data.landscapeId)
      writeStringField(write, view, `${SP}viewId`, data.id)
      writeStringField(write, view, `${RDFS}label`, data.label, 'de')
      const rootNodes = Array.isArray(data.rootNodes) ? data.rootNodes : []
      walkViewNodes(write, archiveRoot, entry.path, rootNodes, view, counts, 'root')
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
) => {
  entries
    .filter((entry) => entry.path.startsWith(`${archiveRoot}/data/mappings/`) && entry.path.endsWith('.json'))
    .forEach((entry) => {
      const data = jsonObject(JSON.parse(entry.text) as JsonValue, 'mapping file')
      const jurisdiction = jurisdictionFromEntryPath(entry.path)
      if (entry.path.endsWith('.review.json')) {
        const decisions = Array.isArray(data.decisions) ? data.decisions : Array.isArray(data.mappings) ? data.mappings : []
        decisions.forEach((decision, index) => {
          const decisionData = jsonObject(decision, 'review decision')
          const sourceGoalId = sourceGoalIdFromReviewDecision(decisionData)
          const resource = decisionRecordIri(archiveRoot, entry.path, index)
          counts.reviewDecisions += 1
          write(tripleLine(packageIri(archiveRoot), `${SP}hasReviewDecision`, iri(resource)))
          write(tripleLine(resource, `${RDF}type`, iri(`${SP}ReviewDecision`)))
          write(tripleLine(resource, `${SP}zipPath`, literal(entry.path)))
          writeStringField(write, resource, `${SP}jurisdiction`, jurisdiction)
          writeStringField(write, resource, `${SP}decision`, decisionData.decision)
          writeStringField(write, resource, `${SP}topicCode`, decisionData.topicCode)
          writeStringField(write, resource, `${SP}reviewedAt`, decisionData.reviewedAt)
          writeStringField(write, resource, `${SP}reviewer`, decisionData.reviewer)
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
        const resource = mappingRecordIri(archiveRoot, entry.path, index)
        counts.canonicalMappings += 1
        write(tripleLine(packageIri(archiveRoot), `${SP}hasMappingRecord`, iri(resource)))
        write(tripleLine(resource, `${RDF}type`, iri(`${SP}MappingRecord`)))
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
      writeStringField(write, resource, `${SP}sourceDocumentTitle`, goalData.sourceDocumentTitle, 'de')
      writeStringField(write, resource, `${SP}topicCode`, goalData.topicCode)
      writeStringField(write, resource, `${SP}passageId`, goalData.passageId)
      writeStringField(write, resource, `${SP}granularity`, goalData.granularity)
      writeNumberField(write, resource, `${SP}sourcePage`, goalData.sourcePage)
      writeStringField(write, resource, `${SP}phase`, goalData.phase)
      writeStringField(write, resource, `${SP}courseLevel`, goalData.courseLevel)
      writeStringField(write, resource, `${SP}category`, goalData.category)
    })
  })

  const sourceIndexEntry = findEntry(entries, archiveRoot, 'data/sources/source-index.json')
  const sourceIndex = jsonObject(JSON.parse(sourceIndexEntry.text) as JsonValue, 'source index')
  writeJsonField(write, packageIri(archiveRoot), `${SP}sourceIndexSummaryJson`, sourceIndex)
}

const writeCardSemantics = (
  write: (line: string) => void,
  archiveRoot: string,
  entries: ZipEntryRecord[],
  counts: SemanticCounts,
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
    const deck = deckIri(archiveRoot, entry.path, deckId, language)
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
      const resource = cardIri(archiveRoot, entry.path, cardId)
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
) => {
  const dependencyEntry = findEntry(entries, archiveRoot, 'data/dependencies/external-goal-references.json')
  const data = jsonObject(JSON.parse(dependencyEntry.text) as JsonValue, 'external dependencies')
  const references = Array.isArray(data.references) ? data.references : []
  references.forEach((reference, index) => {
    const referenceData = jsonObject(reference, 'external dependency reference')
    const resource = `${fileIri(archiveRoot, dependencyEntry.path)}/external-reference/${index}`
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

const writeSemanticTriples = (
  write: (line: string) => void,
  archiveRoot: string,
  entries: ZipEntryRecord[],
  counts: SemanticCounts,
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
