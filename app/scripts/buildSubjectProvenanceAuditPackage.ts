import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { basename, dirname, extname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [key: string]: JsonValue }

type CliOptions = {
  subject: string
  subjectSlug?: string
  version: string
  outputDir: string
  help: boolean
}

type SubjectPreset = {
  subject: string
  subjectSlug: string
}

type PackageEntry = {
  packagePath: string
  content: Buffer
  category: string
  licenseCategory: string
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '../..')

const SUBJECT_PRESETS: Record<string, SubjectPreset> = {
  biologie: { subject: 'Biologie', subjectSlug: 'biologie' },
  chemie: { subject: 'Chemie', subjectSlug: 'chemie' },
  deutsch: { subject: 'Deutsch', subjectSlug: 'deutsch' },
  geschichte: { subject: 'Geschichte', subjectSlug: 'geschichte' },
  informatik: { subject: 'Informatik', subjectSlug: 'informatik' },
  latein: { subject: 'Latein', subjectSlug: 'latein' },
  mathematik: { subject: 'Mathematik', subjectSlug: 'mathematik' },
  physik: { subject: 'Physik', subjectSlug: 'physik' },
  politikundwirtschaft: { subject: 'Politik und Wirtschaft', subjectSlug: 'politik-und-wirtschaft' },
  wirtschaftswissenschaften: { subject: 'Wirtschaftswissenschaften', subjectSlug: 'wirtschaftswissenschaften' },
  wirtschaft: { subject: 'Wirtschaftswissenschaften', subjectSlug: 'wirtschaftswissenschaften' },
}

const usage = () => `Usage:
  npm run export:subject-provenance-audit -- --subject Mathematik [--version 0.1.0]

Options:
  --subject <name>       Subject preset, for example Mathematik.
  --subject-slug <slug>  Optional package slug. Default: derived from subject preset.
  --version <version>    Package version. Default: 0.1.0.
  --output-dir <path>    Output directory inside the repository. Default: tmp/exports.
  --help                 Show this help.
`

const parseArgs = (argv: string[]): CliOptions => {
  const options: CliOptions = {
    subject: '',
    version: '0.1.0',
    outputDir: resolve(repoRoot, 'tmp/exports'),
    help: false,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--help' || arg === '-h') {
      options.help = true
      continue
    }

    const nextValue = argv[index + 1]
    const readValue = (name: string) => {
      if (!nextValue || nextValue.startsWith('--')) {
        throw new Error(`Missing value for ${name}`)
      }
      index += 1
      return nextValue
    }

    if (arg === '--subject') {
      options.subject = readValue(arg)
      continue
    }
    if (arg === '--subject-slug') {
      options.subjectSlug = readValue(arg)
      continue
    }
    if (arg === '--version') {
      options.version = readValue(arg)
      continue
    }
    if (arg === '--output-dir') {
      options.outputDir = resolveInsideRepo(readValue(arg))
      continue
    }

    throw new Error(`Unknown argument: ${arg}`)
  }

  if (options.help) return options
  if (!options.subject) {
    throw new Error('Missing required --subject')
  }

  const preset = SUBJECT_PRESETS[normalizeToken(options.subject)]
  if (preset) {
    options.subject = preset.subject
    options.subjectSlug ??= preset.subjectSlug
  }
  options.subjectSlug ??= slugify(options.subject)

  return options
}

const normalizeToken = (value: string) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '')

const slugify = (value: string) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '') || 'subject'

const sanitizeVersionForPath = (version: string) => version.replace(/[^a-zA-Z0-9._+-]/g, '_')

const toPosixPath = (path: string) => path.split(sep).join('/')

const resolveInsideRepo = (inputPath: string) => {
  const absolutePath = resolve(repoRoot, inputPath)
  const relativePath = relative(repoRoot, absolutePath)
  if (relativePath === '' || relativePath.startsWith('..')) {
    throw new Error(`Path must be inside the repository: ${inputPath}`)
  }
  return absolutePath
}

const repoRelative = (absolutePath: string) => {
  const relativePath = toPosixPath(relative(repoRoot, absolutePath))
  if (relativePath === '' || relativePath.startsWith('..')) {
    throw new Error(`Path is outside the repository: ${absolutePath}`)
  }
  return relativePath
}

const resolveRepoPath = (repoPath: string) => resolveInsideRepo(repoPath)

const readJson = (absolutePath: string): JsonValue => JSON.parse(readFileSync(absolutePath, 'utf8')) as JsonValue

const isJsonObject = (value: JsonValue): value is Record<string, JsonValue> => (
  value !== null && typeof value === 'object' && !Array.isArray(value)
)

const jsonObject = (value: JsonValue, context: string): Record<string, JsonValue> => {
  if (!isJsonObject(value)) {
    throw new Error(`Expected JSON object: ${context}`)
  }
  return value
}

const optionalString = (value: JsonValue) => (typeof value === 'string' && value.trim() ? value.trim() : null)

const stableSortJson = (value: JsonValue): JsonValue => {
  if (Array.isArray(value)) {
    return value.map(stableSortJson)
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, stableSortJson(child)]),
    )
  }
  return value
}

const stableJson = (value: JsonValue) => `${JSON.stringify(stableSortJson(value), null, 2)}\n`

const sha256 = (content: Buffer | string) => createHash('sha256').update(content).digest('hex')

const walkFiles = (absoluteDirectory: string): string[] => {
  if (!existsSync(absoluteDirectory)) return []
  return readdirSync(absoluteDirectory)
    .sort((left, right) => left.localeCompare(right))
    .flatMap((entryName) => {
      const absolutePath = join(absoluteDirectory, entryName)
      const stat = statSync(absolutePath)
      if (stat.isDirectory()) return walkFiles(absolutePath)
      if (stat.isFile()) return [absolutePath]
      return []
    })
}

const sourceDocumentsFromExtraction = (data: Record<string, JsonValue>) => {
  if (Array.isArray(data.sourceDocuments) && data.sourceDocuments.length > 0) {
    return data.sourceDocuments.filter(isJsonObject)
  }
  return isJsonObject(data.sourceDocument) ? [data.sourceDocument] : []
}

const hasUsableOfficialUrl = (value: JsonValue) => {
  if (typeof value !== 'string' || !value.trim()) return false
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

const isHttpUrl = (value: string) => {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

const sourceDocumentRecord = (document: Record<string, JsonValue>) => ({
  key: optionalString(document.key),
  title: optionalString(document.title),
  role: optionalString(document.role),
  official: typeof document.official === 'boolean' ? document.official : null,
  url: optionalString(document.url),
  landingUrl: optionalString(document.landingUrl),
})

const sourceDocumentKeyFromGoal = (goal: Record<string, JsonValue>) => {
  const direct = optionalString(goal.sourceDocumentKey)
  if (direct) return direct
  const tags = Array.isArray(goal.tags) ? goal.tags : []
  const tag = tags.find((item): item is string => typeof item === 'string' && item.startsWith('sourceDocument:'))
  return tag ? tag.slice('sourceDocument:'.length) : null
}

const sourceDocumentsByKey = (documents: Record<string, JsonValue>[]) => new Map(
  documents
    .map(sourceDocumentRecord)
    .filter((document) => document.key)
    .map((document) => [document.key as string, document]),
)

const walkJsonStrings = (value: JsonValue, visitor: (value: string) => void) => {
  if (typeof value === 'string') {
    visitor(value)
    return
  }
  if (Array.isArray(value)) {
    value.forEach((child) => walkJsonStrings(child, visitor))
    return
  }
  if (value && typeof value === 'object') {
    Object.values(value).forEach((child) => walkJsonStrings(child, visitor))
  }
}

const containsInternalReference = (value: JsonValue) => {
  const offenders: string[] = []
  walkJsonStrings(value, (text) => {
    if (isHttpUrl(text)) {
      return
    }
    const normalized = text.split('\\').join('/')
    if (normalized.includes('/home/') || normalized.includes('curricula/') || normalized.includes('app/public/')) {
      offenders.push(text)
    }
  })
  return offenders
}

const findCanonicalLandscape = (subject: string) => {
  const canonicalDirectory = resolveRepoPath('curricula/DE/Gymnasium/canonical')
  const candidates = walkFiles(canonicalDirectory)
    .filter((path) => extname(path).toLowerCase() === '.json')
    .map((absolutePath) => ({
      absolutePath,
      data: jsonObject(readJson(absolutePath), repoRelative(absolutePath)),
    }))

  const normalizedSubject = normalizeToken(subject)
  const match = candidates.find(({ data }) => typeof data.subject === 'string' && normalizeToken(data.subject) === normalizedSubject)
    ?? candidates.find(({ absolutePath }) => normalizeToken(basename(absolutePath)).includes(normalizedSubject))

  if (!match) {
    throw new Error(`No canonical Gymnasium landscape found for subject "${subject}"`)
  }
  return match
}

const targetLandscapeIdFrom = (value: JsonValue): string | null => (
  isJsonObject(value) && typeof value.targetLandscapeId === 'string' ? value.targetLandscapeId : null
)

const selectReviewMappingFiles = (targetLandscapeId: string) => {
  const mappingRoot = resolveRepoPath('curricula/DE/Gymnasium/mapping')
  return walkFiles(mappingRoot)
    .filter((path) => path.endsWith('.review.json'))
    .filter((path) => targetLandscapeIdFrom(readJson(path)) === targetLandscapeId)
    .sort((left, right) => repoRelative(left).localeCompare(repoRelative(right)))
}

const collectSourceExtractionPaths = (value: JsonValue): string[] => {
  const paths: string[] = []
  const visit = (child: JsonValue) => {
    if (Array.isArray(child)) {
      child.forEach(visit)
      return
    }
    if (!isJsonObject(child)) return
    Object.entries(child).forEach(([key, nested]) => {
      if (key === 'sourceExtractionPath' && typeof nested === 'string') {
        paths.push(nested)
        return
      }
      if (key === 'sourceExtractionPaths' && Array.isArray(nested)) {
        nested.forEach((item) => {
          if (typeof item === 'string') paths.push(item)
          else visit(item)
        })
        return
      }
      visit(nested)
    })
  }
  visit(value)
  return [...new Set(paths)].sort((left, right) => left.localeCompare(right))
}

const shortenStage = (stage: string) => stage
  .replace(/^lower-secondary$/u, 'lower')
  .replace(/^upper-secondary$/u, 'upper')

const mappingPackageFileName = (fileName: string) => fileName
  .replace(/lower_secondary/gu, 'lower')
  .replace(/upper_secondary/gu, 'upper')
  .replace(/source_extraction/gu, 'src')
  .replace(/full_src/gu, 'fullsrc')
  .replace(/to_canonical/gu, 'to')
  .replace(/politics_economics/gu, 'powi')
  .replace(/politik_wirtschaftslehre/gu, 'powi')
  .replace(/wirtschaftswissenschaft/gu, 'wirtschaft')

const runtimeMappingPackagePath = (absolutePath: string) => {
  const sourcePath = repoRelative(absolutePath)
  const match = sourcePath.match(/^curricula\/DE\/Gymnasium\/mapping\/(DE-[A-Z]{2})\/([^/]+)\/(.+)$/u)
  if (!match) return `data/mappings/${mappingPackageFileName(basename(absolutePath))}`
  return `data/mappings/${match[1]}/${shortenStage(match[2])}/${mappingPackageFileName(match[3])}`
}

const stateAndStageFromMappingPath = (absolutePath: string) => {
  const match = repoRelative(absolutePath).match(/^curricula\/DE\/Gymnasium\/mapping\/(DE-[A-Z]{2})\/([^/]+)\//u)
  return {
    jurisdiction: match?.[1] ?? null,
    stage: match?.[2] ?? null,
  }
}

const canonicalGoalIndex = (canonicalData: Record<string, JsonValue>) => {
  const goals = Array.isArray(canonicalData.goals) ? canonicalData.goals : []
  return new Map(goals
    .filter(isJsonObject)
    .filter((goal) => typeof goal.id === 'string')
    .map((goal) => [goal.id as string, {
      id: goal.id as string,
      title: optionalString(goal.title),
      description: optionalString(goal.description),
      area: optionalString(goal.area),
      phase: optionalString(goal.phase),
    }]))
}

const sourceGoalIdFromMapping = (mapping: Record<string, JsonValue>) => (
  optionalString(mapping.sourceGoalId)
    ?? optionalString(mapping.legacyGoalId)
    ?? optionalString(mapping.reviewDecisionId)
)

const packageGoalRecord = (
  goal: Record<string, JsonValue>,
  sourceDocuments: Map<string, ReturnType<typeof sourceDocumentRecord>>,
  fallbackDocument: ReturnType<typeof sourceDocumentRecord> | null,
) => {
  const sourceText = optionalString(goal.sourceText)
    ?? optionalString(goal.rawSourceText)
    ?? optionalString(goal.parentBulletText)
    ?? optionalString(goal.description)
    ?? ''
  const documentKey = sourceDocumentKeyFromGoal(goal)
  const document = documentKey ? sourceDocuments.get(documentKey) ?? fallbackDocument : fallbackDocument

  return {
    sourceGoalId: optionalString(goal.id),
    passageId: optionalString(goal.passageId),
    topicCode: optionalString(goal.topicCode),
    title: optionalString(goal.title),
    description: optionalString(goal.description),
    sourceText,
    sourceTextSha256: sha256(sourceText),
    sourceSpan: optionalString(goal.sourceSpan) ?? optionalString(goal.rawSourceSpan),
    sourceRef: optionalString(goal.sourceRef),
    sourcePage: typeof goal.sourcePage === 'number' ? goal.sourcePage : null,
    sourceLine: typeof goal.sourceLine === 'number' ? goal.sourceLine : null,
    granularity: optionalString(goal.granularity),
    category: optionalString(goal.category),
    phase: optionalString(goal.phase),
    courseLevel: optionalString(goal.courseLevel),
    sourceDocumentKey: document?.key ?? documentKey,
    sourceDocumentTitle: document?.title ?? null,
    sourceDocumentUrl: document?.url ?? null,
  }
}

const extractSourceEvidence = (absolutePath: string) => {
  const data = jsonObject(readJson(absolutePath), repoRelative(absolutePath))
  const rawDocuments = sourceDocumentsFromExtraction(data)
  const documentRecords = rawDocuments.map(sourceDocumentRecord)
  const documentMap = sourceDocumentsByKey(rawDocuments)
  const fallbackDocument = documentRecords[0] ?? null
  const sourceGoals = Array.isArray(data.sourceGoals)
    ? data.sourceGoals.filter(isJsonObject)
    : []
  const passages = Array.isArray(data.passages)
    ? data.passages.filter(isJsonObject)
    : []
  const passageIndex = new Map(passages
    .filter((passage) => typeof passage.id === 'string')
    .map((passage) => [passage.id as string, {
      passageId: passage.id as string,
      topicCode: optionalString(passage.topicCode),
      title: optionalString(passage.title),
      sourceRef: optionalString(passage.sourceRef),
      sourceDocumentKey: optionalString(passage.sourceDocumentKey),
    }]))

  return {
    extractionId: optionalString(data.extractionId) ?? basename(absolutePath, '.source-extraction.json'),
    title: optionalString(data.title),
    sourceLandscapeId: optionalString(data.sourceLandscapeId),
    jurisdiction: optionalString(data.jurisdiction),
    subject: optionalString(data.subject),
    stage: optionalString(data.stage),
    sourceDocuments: documentRecords,
    counts: {
      passages: passages.length,
      sourceGoals: sourceGoals.length,
    },
    sourceGoals: sourceGoals.map((goal) => {
      const packaged = packageGoalRecord(goal, documentMap, fallbackDocument)
      const passage = packaged.passageId ? passageIndex.get(packaged.passageId) : undefined
      return {
        ...packaged,
        passage: passage ?? null,
      }
    }),
  }
}

const addEntry = (entriesByPath: Map<string, PackageEntry>, entry: PackageEntry) => {
  const existing = entriesByPath.get(entry.packagePath)
  if (existing) {
    if (!existing.content.equals(entry.content)) {
      throw new Error(`Package path collision with different content: ${entry.packagePath}`)
    }
    return
  }
  entriesByPath.set(entry.packagePath, entry)
}

const generatedEntry = (
  packageRoot: string,
  packagePath: string,
  value: string | JsonValue,
  category: string,
  licenseCategory = 'generated-package-metadata',
): PackageEntry => ({
  packagePath: `${packageRoot}/${packagePath}`,
  content: Buffer.from(typeof value === 'string' ? value : stableJson(value), 'utf8'),
  category,
  licenseCategory,
})

const fileRecords = (entries: PackageEntry[]) => entries
  .map((entry) => ({
    path: entry.packagePath,
    sha256: sha256(entry.content),
    bytes: entry.content.length,
    category: entry.category,
    licenseCategory: entry.licenseCategory,
  }))
  .sort((left, right) => left.path.localeCompare(right.path))

const createZip = (entries: PackageEntry[], mtime: Date) => {
  const sortedEntries = [...entries].sort((left, right) => left.packagePath.localeCompare(right.packagePath))
  const localParts: Buffer[] = []
  const centralParts: Buffer[] = []
  let offset = 0
  const { dosTime, dosDate } = toDosDateTime(mtime)

  sortedEntries.forEach((entry) => {
    const name = Buffer.from(entry.packagePath, 'utf8')
    const data = entry.content
    const crc = crc32(data)
    const localHeader = Buffer.alloc(30)
    localHeader.writeUInt32LE(0x04034b50, 0)
    localHeader.writeUInt16LE(20, 4)
    localHeader.writeUInt16LE(0x0800, 6)
    localHeader.writeUInt16LE(0, 8)
    localHeader.writeUInt16LE(dosTime, 10)
    localHeader.writeUInt16LE(dosDate, 12)
    localHeader.writeUInt32LE(crc, 14)
    localHeader.writeUInt32LE(data.length, 18)
    localHeader.writeUInt32LE(data.length, 22)
    localHeader.writeUInt16LE(name.length, 26)
    localHeader.writeUInt16LE(0, 28)
    localParts.push(localHeader, name, data)

    const centralHeader = Buffer.alloc(46)
    centralHeader.writeUInt32LE(0x02014b50, 0)
    centralHeader.writeUInt16LE(20, 4)
    centralHeader.writeUInt16LE(20, 6)
    centralHeader.writeUInt16LE(0x0800, 8)
    centralHeader.writeUInt16LE(0, 10)
    centralHeader.writeUInt16LE(dosTime, 12)
    centralHeader.writeUInt16LE(dosDate, 14)
    centralHeader.writeUInt32LE(crc, 16)
    centralHeader.writeUInt32LE(data.length, 20)
    centralHeader.writeUInt32LE(data.length, 24)
    centralHeader.writeUInt16LE(name.length, 28)
    centralHeader.writeUInt16LE(0, 30)
    centralHeader.writeUInt16LE(0, 32)
    centralHeader.writeUInt16LE(0, 34)
    centralHeader.writeUInt16LE(0, 36)
    centralHeader.writeUInt32LE((0o100644 << 16) >>> 0, 38)
    centralHeader.writeUInt32LE(offset, 42)
    centralParts.push(centralHeader, name)
    offset += localHeader.length + name.length + data.length
  })

  const centralDirectory = Buffer.concat(centralParts)
  const endOfCentralDirectory = Buffer.alloc(22)
  endOfCentralDirectory.writeUInt32LE(0x06054b50, 0)
  endOfCentralDirectory.writeUInt16LE(0, 4)
  endOfCentralDirectory.writeUInt16LE(0, 6)
  endOfCentralDirectory.writeUInt16LE(sortedEntries.length, 8)
  endOfCentralDirectory.writeUInt16LE(sortedEntries.length, 10)
  endOfCentralDirectory.writeUInt32LE(centralDirectory.length, 12)
  endOfCentralDirectory.writeUInt32LE(offset, 16)
  endOfCentralDirectory.writeUInt16LE(0, 20)
  return Buffer.concat([...localParts, centralDirectory, endOfCentralDirectory])
}

const toDosDateTime = (date: Date) => {
  const year = Math.max(1980, date.getUTCFullYear())
  const month = date.getUTCMonth() + 1
  const day = date.getUTCDate()
  const hours = date.getUTCHours()
  const minutes = date.getUTCMinutes()
  const seconds = Math.floor(date.getUTCSeconds() / 2)
  return {
    dosTime: (hours << 11) | (minutes << 5) | seconds,
    dosDate: ((year - 1980) << 9) | (month << 5) | day,
  }
}

const CRC_TABLE = new Uint32Array(256)
for (let index = 0; index < 256; index += 1) {
  let crc = index
  for (let bit = 0; bit < 8; bit += 1) {
    crc = (crc & 1) ? (0xedb88320 ^ (crc >>> 1)) : (crc >>> 1)
  }
  CRC_TABLE[index] = crc >>> 0
}

const crc32 = (content: Buffer) => {
  let crc = 0xffffffff
  for (const byte of content) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

const sourceDate = () => {
  const sourceDateEpoch = process.env.SOURCE_DATE_EPOCH
  if (sourceDateEpoch) {
    const parsedEpoch = Number(sourceDateEpoch)
    if (!Number.isFinite(parsedEpoch)) {
      throw new Error(`SOURCE_DATE_EPOCH must be a Unix timestamp, got: ${sourceDateEpoch}`)
    }
    return new Date(parsedEpoch * 1000)
  }
  try {
    const commitDate = execFileSync('git', ['show', '-s', '--format=%cI', 'HEAD'], {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
    if (commitDate) {
      return new Date(commitDate)
    }
  } catch {
    // Fall through to the ZIP epoch fallback when Git metadata is unavailable.
  }
  return new Date('1980-01-01T00:00:00Z')
}

const buildReadme = (params: {
  packageId: string
  subject: string
  version: string
  sourceExtractionFiles: number
  sourceGoals: number
  mappingEvidence: number
}) => `# ${params.packageId}

SkillPilot provenance audit package for ${params.subject}.

This package is the audit companion to the public runtime export. It resolves mapping source IDs to exact source-goal evidence from the persisted source-extraction artifacts.

## Contents

- \`data/source-evidence-index.json\`: official source documents, extracted source goals with text anchors, locators, and mapping evidence to canonical SkillPilot goals.
- \`metadata/validation-report.json\`: package-time consistency checks.
- \`metadata/manifest.json\` and \`metadata/SHA256SUMS\`: integrity metadata.

## Scope

- Package version: ${params.version}
- Source-extraction files represented: ${params.sourceExtractionFiles}
- Source goals represented: ${params.sourceGoals}
- Mapping evidence records: ${params.mappingEvidence}

The package does not include original curriculum PDFs. Official source URLs are included so source-goal anchors can be checked against the original publications.
`

const buildLegal = () => `# Legal and provenance notes

This audit package contains exact extracted source-goal text from official curriculum sources. SkillPilot does not relicense those official source texts.

Use this artifact for provenance review, mapping audit, and reproducibility checks. Before broad public redistribution, review the applicable legal basis and quotation limits for the included official-source excerpts.

The SkillPilot-authored mapping structure, packaging metadata, and validation logic remain SkillPilot-authored material; official curriculum passages remain attributable to their original publishers.
`

const buildMarkdownReport = (params: {
  packageId: string
  zipPath: string
  sha256: string
  bytes: number
  checks: Array<{ id: string; passed: boolean; details: string }>
  counts: Record<string, number>
}) => `# Provenance audit package: ${params.packageId}

ZIP: \`${params.zipPath}\`

SHA-256: \`${params.sha256}\`

Bytes: ${params.bytes}

## Counts

| Count | Value |
| --- | ---: |
${Object.entries(params.counts).map(([key, value]) => `| ${key} | ${value} |`).join('\n')}

## Checks

| Check | Status | Details |
| --- | --- | --- |
${params.checks.map((check) => `| ${check.id} | ${check.passed ? 'pass' : 'fail'} | ${check.details.replace(/\|/g, '\\|')} |`).join('\n')}
`

const main = () => {
  const options = parseArgs(process.argv.slice(2))
  if (options.help) {
    process.stdout.write(usage())
    return
  }

  const canonical = findCanonicalLandscape(options.subject)
  const canonicalData = canonical.data
  const targetLandscapeId = typeof canonicalData.landscapeId === 'string' ? canonicalData.landscapeId : null
  if (!targetLandscapeId) {
    throw new Error(`Canonical landscape has no landscapeId: ${repoRelative(canonical.absolutePath)}`)
  }
  const canonicalGoals = canonicalGoalIndex(canonicalData)
  const mappingFiles = selectReviewMappingFiles(targetLandscapeId)
  const sourceExtractionPaths = [...new Set(mappingFiles.flatMap((mappingFile) => collectSourceExtractionPaths(readJson(mappingFile))))]
  const sourceExtractionFiles = sourceExtractionPaths.map(resolveRepoPath)

  sourceExtractionFiles.forEach((path) => {
    if (!existsSync(path)) {
      throw new Error(`Missing source extraction file: ${repoRelative(path)}`)
    }
  })

  const extractions = sourceExtractionFiles
    .map(extractSourceEvidence)
    .sort((left, right) => left.extractionId.localeCompare(right.extractionId))
  const sourceGoalIndex = new Map<string, { extractionId: string; goal: Record<string, JsonValue> }>()
  const duplicateSourceGoalIds = new Set<string>()
  extractions.forEach((extraction) => {
    extraction.sourceGoals.forEach((goal) => {
      const sourceGoalId = goal.sourceGoalId
      if (!sourceGoalId) return
      if (sourceGoalIndex.has(sourceGoalId)) duplicateSourceGoalIds.add(sourceGoalId)
      sourceGoalIndex.set(sourceGoalId, { extractionId: extraction.extractionId, goal: goal as unknown as Record<string, JsonValue> })
    })
  })

  const unresolvedSourceGoalRefs: string[] = []
  const unresolvedCanonicalGoalRefs: string[] = []
  const mappingEvidence = mappingFiles.flatMap((mappingFile) => {
    const mappingData = jsonObject(readJson(mappingFile), repoRelative(mappingFile))
    const mappings = Array.isArray(mappingData.mappings) ? mappingData.mappings.filter(isJsonObject) : []
    const pathScope = stateAndStageFromMappingPath(mappingFile)
    return mappings.map((mapping) => {
      const sourceGoalId = sourceGoalIdFromMapping(mapping)
      const canonicalGoalId = optionalString(mapping.canonicalGoalId)
      const sourceGoal = sourceGoalId ? sourceGoalIndex.get(sourceGoalId) : undefined
      const canonicalGoal = canonicalGoalId ? canonicalGoals.get(canonicalGoalId) : undefined
      if (!sourceGoalId || !sourceGoal) {
        unresolvedSourceGoalRefs.push(`${runtimeMappingPackagePath(mappingFile)}:${sourceGoalId ?? '(missing)'}`)
      }
      if (!canonicalGoalId || !canonicalGoal) {
        unresolvedCanonicalGoalRefs.push(`${runtimeMappingPackagePath(mappingFile)}:${canonicalGoalId ?? '(missing)'}`)
      }
      return {
        runtimeMappingPackagePath: runtimeMappingPackagePath(mappingFile),
        reviewId: optionalString(mappingData.reviewId),
        jurisdiction: optionalString(mappingData.jurisdiction) ?? pathScope.jurisdiction,
        stage: optionalString(mappingData.stage) ?? pathScope.stage,
        sourceLandscapeId: optionalString(mappingData.sourceLandscapeId),
        targetLandscapeId: optionalString(mappingData.targetLandscapeId),
        sourceExtractionId: sourceGoal?.extractionId ?? null,
        sourceGoalId,
        canonicalGoalId,
        canonicalGoalTitle: canonicalGoal?.title ?? null,
        matchType: optionalString(mapping.matchType),
        reviewDecisionId: optionalString(mapping.reviewDecisionId),
      }
    })
  })

  const sourceDocumentsWithoutUrls = extractions.flatMap((extraction) => extraction.sourceDocuments
    .filter((document) => !hasUsableOfficialUrl(document.url))
    .map((document) => `${extraction.extractionId}:${document.key ?? document.title ?? '(untitled)'}`))
  const sourceGoalsWithoutText = extractions.flatMap((extraction) => extraction.sourceGoals
    .filter((goal) => !goal.sourceText)
    .map((goal) => `${extraction.extractionId}:${goal.sourceGoalId ?? '(missing-id)'}`))
  const evidenceIndex = {
    schemaVersion: 1,
    packageKind: 'skillpilot-subject-provenance-audit',
    subject: options.subject,
    version: options.version,
    targetLandscapeId,
    canonicalLandscape: {
      landscapeId: targetLandscapeId,
      subject: optionalString(canonicalData.subject),
      title: optionalString(canonicalData.title),
      goalCount: canonicalGoals.size,
    },
    sourceExtractions: extractions,
    mappingEvidence,
  }
  const internalReferenceOffenders = containsInternalReference(evidenceIndex as unknown as JsonValue)
  const packageDate = sourceDate()
  const checks = [
    {
      id: 'review-mapping-files-present',
      passed: mappingFiles.length > 0,
      details: `${mappingFiles.length} review mapping file(s)`,
    },
    {
      id: 'source-extraction-files-present',
      passed: sourceExtractionFiles.length > 0,
      details: `${sourceExtractionFiles.length} source extraction file(s)`,
    },
    {
      id: 'source-goal-ids-unique',
      passed: duplicateSourceGoalIds.size === 0,
      details: `${duplicateSourceGoalIds.size} duplicate source goal id(s)`,
    },
    {
      id: 'official-source-urls-present',
      passed: sourceDocumentsWithoutUrls.length === 0,
      details: `${sourceDocumentsWithoutUrls.length} source document(s) without official URL`,
    },
    {
      id: 'source-goal-text-present',
      passed: sourceGoalsWithoutText.length === 0,
      details: `${sourceGoalsWithoutText.length} source goal(s) without source text`,
    },
    {
      id: 'mapping-source-goals-resolve',
      passed: unresolvedSourceGoalRefs.length === 0,
      details: `${unresolvedSourceGoalRefs.length} unresolved source goal reference(s)`,
    },
    {
      id: 'mapping-canonical-goals-resolve',
      passed: unresolvedCanonicalGoalRefs.length === 0,
      details: `${unresolvedCanonicalGoalRefs.length} unresolved canonical goal reference(s)`,
    },
    {
      id: 'no-internal-repository-references',
      passed: internalReferenceOffenders.length === 0,
      details: `${internalReferenceOffenders.length} internal reference(s)`,
    },
  ]
  const counts = {
    reviewMappingFiles: mappingFiles.length,
    sourceExtractionFiles: sourceExtractionFiles.length,
    sourceExtractions: extractions.length,
    sourceDocuments: extractions.reduce((sum, extraction) => sum + extraction.sourceDocuments.length, 0),
    sourceGoals: extractions.reduce((sum, extraction) => sum + extraction.sourceGoals.length, 0),
    mappingEvidence: mappingEvidence.length,
    unresolvedSourceGoalRefs: unresolvedSourceGoalRefs.length,
    unresolvedCanonicalGoalRefs: unresolvedCanonicalGoalRefs.length,
  }
  const validationReport = {
    generatedAt: packageDate.toISOString(),
    passed: checks.every((check) => check.passed),
    checks,
    counts,
    unresolvedSourceGoalRefs: unresolvedSourceGoalRefs.slice(0, 100),
    unresolvedCanonicalGoalRefs: unresolvedCanonicalGoalRefs.slice(0, 100),
  }

  const packageId = `skillpilot-de-gymnasium-${options.subjectSlug}-provenance-audit-v${sanitizeVersionForPath(options.version)}`
  const archiveRoot = packageId
  const entriesByPath = new Map<string, PackageEntry>()
  addEntry(entriesByPath, generatedEntry(archiveRoot, 'README.md', buildReadme({
    packageId,
    subject: options.subject,
    version: options.version,
    sourceExtractionFiles: sourceExtractionFiles.length,
    sourceGoals: counts.sourceGoals,
    mappingEvidence: mappingEvidence.length,
  }), 'package-documentation'))
  addEntry(entriesByPath, generatedEntry(archiveRoot, 'LEGAL.md', buildLegal(), 'package-documentation'))
  addEntry(entriesByPath, generatedEntry(archiveRoot, 'data/source-evidence-index.json', evidenceIndex as unknown as JsonValue, 'source-evidence', 'official-source-audit-evidence'))
  addEntry(entriesByPath, generatedEntry(archiveRoot, 'metadata/validation-report.json', validationReport as unknown as JsonValue, 'metadata'))

  const entriesWithoutManifest = [...entriesByPath.values()]
  const manifest = {
    packageId,
    packageVersion: options.version,
    packageKind: 'skillpilot-subject-provenance-audit',
    subject: options.subject,
    archiveRoot,
    createdAt: validationReport.generatedAt,
    files: fileRecords(entriesWithoutManifest),
    licenseCategories: {
      'official-source-audit-evidence': 'Exact source-goal evidence extracted from official curriculum sources; not relicensed by SkillPilot.',
      'generated-package-metadata': 'Generated package metadata and integrity files.',
    },
  }
  addEntry(entriesByPath, generatedEntry(archiveRoot, 'metadata/manifest.json', manifest as unknown as JsonValue, 'metadata'))
  const entriesWithManifest = [...entriesByPath.values()]
  const checksumLines = fileRecords(entriesWithManifest)
    .map((file) => `${file.sha256}  ${file.path}`)
    .join('\n')
  addEntry(entriesByPath, generatedEntry(archiveRoot, 'metadata/SHA256SUMS', `${checksumLines}\n`, 'metadata'))

  mkdirSync(options.outputDir, { recursive: true })
  const zipPath = resolve(options.outputDir, `${archiveRoot}.zip`)
  const zipContent = createZip([...entriesByPath.values()], packageDate)
  writeFileSync(zipPath, zipContent)
  const zipSha256 = sha256(zipContent)
  const releaseReportPath = resolve(options.outputDir, `${archiveRoot}-release-report.md`)
  writeFileSync(releaseReportPath, buildMarkdownReport({
    packageId,
    zipPath: repoRelative(zipPath),
    sha256: zipSha256,
    bytes: zipContent.length,
    checks,
    counts,
  }))
  const summary = {
    packageId,
    archiveRoot,
    subject: options.subject,
    version: options.version,
    zipPath: repoRelative(zipPath),
    releaseReportPath: repoRelative(releaseReportPath),
    sha256: zipSha256,
    bytes: zipContent.length,
    passed: validationReport.passed,
    counts,
    warnings: [
      'This audit package contains official-source excerpts and is not the default public runtime package.',
      'Legal review is recommended before broad redistribution.',
    ],
  }
  process.stdout.write(stableJson(summary as unknown as JsonValue))
  if (!validationReport.passed) {
    process.exitCode = 1
  }
}

try {
  main()
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  process.stderr.write(`${message}\n`)
  process.exitCode = 1
}
