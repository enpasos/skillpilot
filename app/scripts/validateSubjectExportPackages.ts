import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { lstatSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import { basename, dirname, isAbsolute, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [key: string]: JsonValue }

const compareCodeUnits = (left: string, right: string) => (left < right ? -1 : left > right ? 1 : 0)

type CliOptions = {
  zipPaths: string[]
  directory: string
  reportDir: string
  help: boolean
}

type CheckResult = {
  id: string
  passed: boolean
  details: string
}

type PackageValidationResult = {
  zipPath: string
  zipSha256: string | null
  archiveRoot: string | null
  passed: boolean
  checks: CheckResult[]
  counts: Record<string, number>
  errors: string[]
}

type ManifestFileRecord = {
  path: string
  sha256: string
  bytes: number
  category: string
  licenseCategory: string
}

type ManifestSourceSelection = {
  memoryCardReviewAuditCount?: number
  goalVisualizationAssetCount?: number
  goalVisualizationIndexPackagePath?: string
}

type GoalVisualizationAssetRecord = {
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

type GoalRecord = {
  id: string
  requires: string[]
  contains: string[]
}

type GoalReference = {
  fromGoalId: string
  targetGoalId: string
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '../..')

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

const WINDOWS_SAFE_ARCHIVE_PATH_LIMIT = 180
const ZIP_COMMAND_MAX_BUFFER_BYTES = 256 * 1024 * 1024
const MAX_GOAL_VISUALIZATION_BYTES = 64 * 1024 * 1024
const MAX_GOAL_VISUALIZATION_TOTAL_BYTES = 8 * 1024 * 1024 * 1024
const MAX_ZIP_ENTRY_UNCOMPRESSED_BYTES = 512 * 1024 * 1024
const MAX_ZIP_TOTAL_UNCOMPRESSED_BYTES = 16 * 1024 * 1024 * 1024

const REQUIRED_RELATIVE_PATHS = [
  'README.md',
  'LEGAL.md',
  'LICENSE.md',
  'NOTICE.md',
  'metadata/manifest.json',
  'metadata/validation-report.json',
  'metadata/provenance-report.md',
  'metadata/SHA256SUMS',
  'data/cards/card-index.json',
  'data/dependencies/external-goal-references.json',
  'data/sources/source-index.json',
  'data/sources/source-goal-references.json',
  'schemas/export-manifest.schema.json',
  'schemas/composition-view.schema.json',
  'schemas/canonical-mapping.schema.json',
  'schemas/source-extraction.schema.json',
  'schemas/source-goal-references.schema.json',
  'schemas/flashcard-deck.schema.json',
]

const GOAL_VISUALIZATION_CONTRACT_RELATIVE_PATHS = [
  'data/resources/goal-visualizations.json',
  'schemas/goal-visualization-index.schema.json',
]

const ALLOWED_LICENSE_CATEGORIES = new Set([
  'skillpilot-software-apache-2.0',
  'skillpilot-data-cc-by-4.0',
  'official-source-provenance-only',
  'generated-package-metadata',
  'goal-visualization-ai-generated-curated',
])

const GOAL_VISUALIZATION_LICENSE_CATEGORY = 'goal-visualization-ai-generated-curated'
const GOAL_VISUALIZATION_INDEX_PATH = 'data/resources/goal-visualizations.json'

const INTERNAL_DATA_PATTERNS = [
  /\/home\//u,
  /\\home\\/u,
  /curricula\/DE\/Gymnasium\//u,
  /app\/public\//u,
  /tmp\/exports\//u,
  /"sourceExtractionPath"/u,
  /"sourceExtractionPaths"/u,
  /"generatedRationale"/u,
]

const usage = () => `Usage:
  npm run export:subject-packages:validate -- [--dir tmp/exports]
  npm run export:subject-packages:validate -- --zip tmp/exports/skillpilot-de-gymnasium-mathematik-v0.1.0.zip

Options:
  --zip <path>         ZIP path. Can be repeated or comma-separated.
  --dir <path>         Directory to scan for direct skillpilot-*.zip files. Default: tmp/exports.
  --report-dir <path>  Directory for validation reports. Default: tmp/exports/validation.
  --help               Show this help.
`

const parseArgs = (argv: string[]): CliOptions => {
  const options: CliOptions = {
    zipPaths: [],
    directory: resolve(repoRoot, 'tmp/exports'),
    reportDir: resolve(repoRoot, 'tmp/exports/validation'),
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

    if (arg === '--zip') {
      options.zipPaths.push(...readValue(arg).split(',').map((path) => path.trim()).filter(Boolean).map(resolveInsideRepo))
      continue
    }
    if (arg === '--dir') {
      options.directory = resolveInsideRepo(readValue(arg))
      continue
    }
    if (arg === '--report-dir') {
      options.reportDir = resolveInsideRepo(readValue(arg))
      continue
    }

    throw new Error(`Unknown argument: ${arg}`)
  }

  return options
}

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

const stableSortJson = (value: JsonValue): JsonValue => {
  if (Array.isArray(value)) {
    return value.map(stableSortJson)
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => compareCodeUnits(left, right))
        .map(([key, child]) => [key, stableSortJson(child)]),
    )
  }
  return value
}

const stableJson = (value: JsonValue) => `${JSON.stringify(stableSortJson(value), null, 2)}\n`

const jsonObject = (value: JsonValue, context: string): Record<string, JsonValue> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Expected JSON object: ${context}`)
  }
  return value
}

const stringField = (data: Record<string, JsonValue>, key: string, context: string) => {
  const value = data[key]
  if (typeof value !== 'string') {
    throw new Error(`Expected string field ${key}: ${context}`)
  }
  return value
}

const numberField = (data: Record<string, JsonValue>, key: string, context: string) => {
  const value = data[key]
  if (typeof value !== 'number') {
    throw new Error(`Expected number field ${key}: ${context}`)
  }
  return value
}

const stringArray = (value: JsonValue) => (
  Array.isArray(value) && value.every((item) => typeof item === 'string')
    ? value
    : []
) as string[]

const readZipEntry = (zipPath: string, entryPath: string) => execFileSync('unzip', ['-p', zipPath, entryPath], {
  maxBuffer: ZIP_COMMAND_MAX_BUFFER_BYTES,
  stdio: ['ignore', 'pipe', 'pipe'],
})

const readZipEntryText = (zipPath: string, entryPath: string) => readZipEntry(zipPath, entryPath).toString('utf8')

const readZipEntryJson = (zipPath: string, entryPath: string) => JSON.parse(readZipEntryText(zipPath, entryPath)) as JsonValue

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

const listZipEntryModes = (zipPath: string) => listZipEntryMetadata(zipPath).map((entry) => entry.mode)

const sha256 = (content: Buffer | string) => createHash('sha256').update(content).digest('hex')

const sha256RegularFile = (filePath: string) => {
  try {
    if (!lstatSync(filePath).isFile()) return null
    const output = execFileSync('sha256sum', ['--', filePath], {
      encoding: 'utf8',
      maxBuffer: 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    return output.match(/[a-f0-9]{64}/u)?.[0] ?? null
  } catch {
    return null
  }
}

const directExportZips = (directory: string) => readdirSync(directory, { withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) => resolve(directory, entry.name))
  .filter((path) => /^skillpilot-.+\.zip$/u.test(basename(path)))
  .sort((left, right) => compareCodeUnits(repoRelative(left), repoRelative(right)))

const check = (checks: CheckResult[], id: string, passed: boolean, details: string) => {
  checks.push({ id, passed, details })
}

const archiveRootFrom = (entries: string[]) => {
  const roots = new Set(entries.map((entry) => entry.split('/')[0]).filter(Boolean))
  return roots.size === 1 ? [...roots][0] : null
}

const duplicateValues = (values: string[]) => {
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  values.forEach((value) => {
    if (seen.has(value)) {
      duplicates.add(value)
    } else {
      seen.add(value)
    }
  })
  return [...duplicates]
}

const portablePathCollisionIssues = (paths: string[]) => {
  const issues: string[] = []
  const pathsByKey = new Map<string, string[]>()
  paths.forEach((path) => {
    const key = path.normalize('NFC').toLowerCase()
    pathsByKey.set(key, [...(pathsByKey.get(key) ?? []), path])
  })
  pathsByKey.forEach((collidingPaths) => {
    if (collidingPaths.length > 1) issues.push(`portable collision: ${collidingPaths.join(' <> ')}`)
  })
  const keySet = new Set(pathsByKey.keys())
  pathsByKey.forEach((_paths, key) => {
    const segments = key.split('/')
    segments.slice(1, -1).forEach((_segment, index) => {
      const parent = segments.slice(0, index + 2).join('/')
      if (keySet.has(parent)) issues.push(`file/child collision: ${parent} <> ${key}`)
    })
  })
  return issues
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
const hasUnsafePathSegments = (path: string, allowTrailingSlash = false) => {
  const segments = path.split('/')
  if (allowTrailingSlash && segments.at(-1) === '') segments.pop()
  return segments.some((segment) => (
    segment.length === 0
    || segment === '.'
    || segment === '..'
    || hasUnsafeWindowsPathCharacter(segment)
    || windowsReservedSegment.test(segment)
    || segment.endsWith('.')
    || segment.endsWith(' ')
  ))
}

const hasUnsafeEntryPath = (entry: string) => (
  entry.startsWith('/')
  || entry.includes('\\')
  || hasUnsafePathSegments(entry, entry.endsWith('/'))
  || entry.includes('/curricula/')
  || entry.includes('/source-extraction/')
  || entry.endsWith('.source-extraction.json')
  || entry.toLowerCase().endsWith('.pdf')
)

const isPortableArchiveRoot = (value: string | null): value is string => Boolean(
  value
  && /^[A-Za-z0-9][A-Za-z0-9._-]*$/u.test(value)
  && !hasUnsafePathSegments(value),
)

const hasUnsafeManifestFilePath = (path: string) => path.endsWith('/') || hasUnsafeEntryPath(path)

const parseManifestFileRecord = (value: JsonValue): ManifestFileRecord => {
  const data = jsonObject(value, 'manifest.files[]')
  return {
    path: stringField(data, 'path', 'manifest.files[]'),
    sha256: stringField(data, 'sha256', 'manifest.files[]'),
    bytes: numberField(data, 'bytes', 'manifest.files[]'),
    category: stringField(data, 'category', 'manifest.files[]'),
    licenseCategory: stringField(data, 'licenseCategory', 'manifest.files[]'),
  }
}

const parseChecksumFile = (content: string) => {
  const checksums = new Map<string, string>()
  const invalidLines: string[] = []
  content
    .trim()
    .split(/\r?\n/u)
    .filter(Boolean)
    .forEach((line) => {
      const match = line.match(/^([a-f0-9]{64}) {2}(.+)$/u)
      if (!match) {
        invalidLines.push(line)
        return
      }
      if (checksums.has(match[2])) {
        invalidLines.push(`duplicate checksum path: ${match[2]}`)
        return
      }
      checksums.set(match[2], match[1])
    })
  return { checksums, invalidLines }
}

const parseGoals = (canonicalData: JsonValue): GoalRecord[] => {
  const data = jsonObject(canonicalData, 'canonical landscape')
  const goals = data.goals
  if (!Array.isArray(goals)) {
    throw new Error('Canonical landscape does not contain a goals array.')
  }

  return goals.map((goal) => {
    const goalObject = jsonObject(goal, 'goal')
    return {
      id: stringField(goalObject, 'id', 'goal'),
      requires: stringArray(goalObject.requires),
      contains: stringArray(goalObject.contains),
    }
  })
}

const GOAL_VISUALIZATION_LINK_FIELDS = [
  'skillpilotId',
  'role',
  'title',
  'provider',
  'description',
  'altText',
  'lang',
  'license',
  'reviewStatus',
] as const

type CanonicalGoalVisualizationRecord = Pick<GoalVisualizationAssetRecord,
  | 'goalId'
  | 'order'
  | 'packagePath'
  | 'publicUrl'
  | 'skillpilotId'
  | 'role'
  | 'title'
  | 'provider'
  | 'description'
  | 'altText'
  | 'lang'
  | 'license'
  | 'reviewStatus'
>

const expectedGoalVisualizationPath = (subjectSlug: string, goalId: string, extension: string) => (
  `assets/goal-visualizations/${subjectSlug}/${goalId}/${goalId}${extension}`
)

const safeGoalVisualizationPackagePath = (value: string) => {
  const segments = value.split('/')
  return value.startsWith('assets/goal-visualizations/')
    && !value.includes('\\')
    && !value.includes('?')
    && !value.includes('#')
    && !value.includes('\0')
    && segments.every((segment) => segment.length > 0 && segment !== '.' && segment !== '..')
}

const collectCanonicalGoalVisualizations = (canonicalData: JsonValue, subjectSlug: string) => {
  const data = jsonObject(canonicalData, 'canonical landscape')
  const goals = Array.isArray(data.goals) ? data.goals : []
  const records: CanonicalGoalVisualizationRecord[] = []
  const issues: string[] = []
  let declaredLinks = 0

  goals.forEach((goalValue) => {
    const goal = jsonObject(goalValue, 'canonical goal')
    const goalId = typeof goal.id === 'string' ? goal.id : ''
    if (!goalId || !Array.isArray(goal.resourceLinks)) return
    goal.resourceLinks.forEach((linkValue, order) => {
      if (!linkValue || typeof linkValue !== 'object' || Array.isArray(linkValue)) return
      const link = linkValue as Record<string, JsonValue>
      if (link.type !== 'goal-visualization') return
      declaredLinks += 1
      const context = `${goalId}:resourceLinks[${order}]`
      if (link.resourceType !== 'image') {
        issues.push(`${context}: resourceType must be image`)
        return
      }
      const values: Record<string, string> = {}
      let valid = true
      GOAL_VISUALIZATION_LINK_FIELDS.forEach((field) => {
        const value = link[field]
        if (typeof value !== 'string' || value.trim().length === 0) {
          issues.push(`${context}: missing non-empty ${field}`)
          valid = false
        } else {
          values[field] = value
        }
      })
      const publicUrl = typeof link.url === 'string' ? link.url : ''
      if (!publicUrl.startsWith('/') || publicUrl.startsWith('//')) {
        issues.push(`${context}: url must be root-relative`)
        valid = false
      }
      if (!valid) return
      if (values.skillpilotId !== goalId) {
        issues.push(`${context}: skillpilotId must equal goal id`)
        return
      }
      if (values.role !== 'primary') {
        issues.push(`${context}: role must be primary`)
        return
      }
      if (!/^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/u.test(values.lang)) {
        issues.push(`${context}: invalid language tag`)
        return
      }
      const packagePath = publicUrl.slice(1)
      const extension = packagePath.toLowerCase().endsWith('.jpg')
        ? '.jpg'
        : packagePath.toLowerCase().endsWith('.png')
          ? '.png'
          : ''
      if (!extension || !safeGoalVisualizationPackagePath(packagePath)) {
        issues.push(`${context}: unsafe or unsupported visualization URL ${publicUrl}`)
        return
      }
      const expectedPath = expectedGoalVisualizationPath(subjectSlug, goalId, extension)
      if (packagePath !== expectedPath) {
        issues.push(`${context}: expected /${expectedPath}, got ${publicUrl}`)
        return
      }
      records.push({
        goalId,
        order,
        packagePath,
        publicUrl,
        skillpilotId: values.skillpilotId,
        role: values.role,
        title: values.title,
        provider: values.provider,
        description: values.description,
        altText: values.altText,
        lang: values.lang,
        license: values.license,
        reviewStatus: values.reviewStatus,
      })
    })
  })

  return { records, issues, declaredLinks }
}

const parseGoalVisualizationAssetRecord = (value: JsonValue): GoalVisualizationAssetRecord => {
  const data = jsonObject(value, 'goal visualization asset')
  const mediaType = stringField(data, 'mediaType', 'goal visualization asset')
  if (mediaType !== 'image/jpeg' && mediaType !== 'image/png') {
    throw new Error(`Unsupported goal visualization mediaType: ${mediaType}`)
  }
  const record: GoalVisualizationAssetRecord = {
    goalId: stringField(data, 'goalId', 'goal visualization asset'),
    order: numberField(data, 'order', 'goal visualization asset'),
    packagePath: stringField(data, 'packagePath', 'goal visualization asset'),
    publicUrl: stringField(data, 'publicUrl', 'goal visualization asset'),
    mediaType,
    bytes: numberField(data, 'bytes', 'goal visualization asset'),
    sha256: stringField(data, 'sha256', 'goal visualization asset'),
    skillpilotId: stringField(data, 'skillpilotId', 'goal visualization asset'),
    role: stringField(data, 'role', 'goal visualization asset'),
    title: stringField(data, 'title', 'goal visualization asset'),
    provider: stringField(data, 'provider', 'goal visualization asset'),
    description: stringField(data, 'description', 'goal visualization asset'),
    altText: stringField(data, 'altText', 'goal visualization asset'),
    lang: stringField(data, 'lang', 'goal visualization asset'),
    license: stringField(data, 'license', 'goal visualization asset'),
    reviewStatus: stringField(data, 'reviewStatus', 'goal visualization asset'),
  }
  if (!Number.isInteger(record.order) || record.order < 0) {
    throw new Error(`Invalid goal visualization order: ${record.order}`)
  }
  if (!Number.isInteger(record.bytes) || record.bytes < 0) {
    throw new Error(`Invalid goal visualization byte length: ${record.bytes}`)
  }
  if (!/^[a-f0-9]{64}$/u.test(record.sha256)) {
    throw new Error(`Invalid goal visualization SHA-256: ${record.sha256}`)
  }
  GOAL_VISUALIZATION_LINK_FIELDS.forEach((field) => {
    if (record[field].trim().length === 0) {
      throw new Error(`Empty goal visualization field: ${field}`)
    }
  })
  return record
}

const goalVisualizationMagicMatches = (record: GoalVisualizationAssetRecord, content: Buffer) => {
  if (record.mediaType === 'image/jpeg') {
    return record.packagePath.endsWith('.jpg')
      && content.length >= 3
      && content[0] === 0xff
      && content[1] === 0xd8
      && content[2] === 0xff
  }
  const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
  return record.packagePath.endsWith('.png')
    && content.length >= pngSignature.length
    && pngSignature.every((byte, index) => content[index] === byte)
}

const unknownReferences = (goals: GoalRecord[], relation: 'contains' | 'requires'): GoalReference[] => {
  const ids = new Set(goals.map((goal) => goal.id))
  return goals.flatMap((goal) => goal[relation]
    .filter((targetId) => !ids.has(targetId))
    .map((targetId) => ({ fromGoalId: goal.id, targetGoalId: targetId })))
}

const formatReferences = (references: GoalReference[]) => references
  .slice(0, 5)
  .map((reference) => `${reference.fromGoalId} -> ${reference.targetGoalId}`)
  .join(' | ')

const cycleCount = (goals: GoalRecord[], relation: 'contains' | 'requires') => {
  const byId = new Map(goals.map((goal) => [goal.id, goal]))
  const visiting = new Set<string>()
  const visited = new Set<string>()
  let cycles = 0

  const visit = (goalId: string) => {
    if (visiting.has(goalId)) {
      cycles += 1
      return
    }
    if (visited.has(goalId)) {
      return
    }
    const goal = byId.get(goalId)
    if (!goal) {
      return
    }
    visiting.add(goalId)
    goal[relation].forEach(visit)
    visiting.delete(goalId)
    visited.add(goalId)
  }

  goals.forEach((goal) => visit(goal.id))
  return cycles
}

const collectGoalIdsFromView = (value: JsonValue): string[] => {
  if (Array.isArray(value)) {
    return value.flatMap(collectGoalIdsFromView)
  }
  if (!value || typeof value !== 'object') {
    return []
  }
  const data = value as Record<string, JsonValue>
  return [
    ...(typeof data.goalId === 'string' ? [data.goalId] : []),
    ...Object.values(data).flatMap(collectGoalIdsFromView),
  ]
}

const collectCardRuntimePaths = (value: JsonValue): string[] => {
  if (Array.isArray(value)) {
    return value.flatMap(collectCardRuntimePaths)
  }
  if (!value || typeof value !== 'object') {
    return []
  }
  const data = value as Record<string, JsonValue>
  return Object.entries(data).flatMap(([key, child]) => (
    (key === 'vocabularySource' || key === 'vocabularySourceEn') && typeof child === 'string'
      ? [child]
      : collectCardRuntimePaths(child)
  ))
}

const collectUrlValues = (value: JsonValue): string[] => {
  if (Array.isArray(value)) {
    return value.flatMap(collectUrlValues)
  }
  if (!value || typeof value !== 'object') {
    return []
  }
  const data = value as Record<string, JsonValue>
  return Object.entries(data).flatMap(([key, child]) => (
    key === 'url' && typeof child === 'string'
      ? [child]
      : collectUrlValues(child)
  ))
}

const sourceGoalIdFromMapping = (mapping: Record<string, JsonValue>) => {
  const sourceGoalId = mapping.sourceGoalId
  const legacyGoalId = mapping.legacyGoalId
  const reviewDecisionId = mapping.reviewDecisionId
  if (typeof sourceGoalId === 'string' && sourceGoalId.trim()) return sourceGoalId.trim()
  if (typeof legacyGoalId === 'string' && legacyGoalId.trim()) return legacyGoalId.trim()
  if (typeof reviewDecisionId === 'string' && reviewDecisionId.trim()) return reviewDecisionId.trim()
  return null
}

const packageEntryPath = (archiveRoot: string, relativePath: string) => `${archiveRoot}/${relativePath}`

const validationReportHasPassed = (validationReport: JsonValue) => {
  const data = jsonObject(validationReport, 'validation report')
  const errors = Array.isArray(data.errors) ? data.errors : []
  const checks = Array.isArray(data.checks) ? data.checks : []
  return errors.length === 0
    && checks.length > 0
    && checks.every((entry) => {
      const checkData = jsonObject(entry, 'validation report check')
      return checkData.passed === true
    })
}

const packageRelativePathFromManifestValue = (value: JsonValue) => {
  if (typeof value !== 'string' || value !== value.trim() || value.length === 0) return null
  return !value.includes('\\') && !value.startsWith('/') && !hasUnsafePathSegments(value)
    ? value
    : null
}

const validatePackage = (zipPath: string): PackageValidationResult => {
  const checks: CheckResult[] = []
  const errors: string[] = []
  const counts: Record<string, number> = {}
  let archiveRoot: string | null = null
  const zipSha256 = sha256RegularFile(zipPath)
  const checkZipInputStability = () => {
    const finalZipSha256 = sha256RegularFile(zipPath)
    const stable = zipSha256 !== null && finalZipSha256 === zipSha256
    check(
      checks,
      'zip-input-stable',
      stable,
      stable ? `outer ZIP SHA-256 ${zipSha256}` : 'outer ZIP is not a stable regular file',
    )
  }

  let zipPreflightPassed = false
  try {
    const preflightEntries = listZipEntries(zipPath)
    const preflightMetadata = listZipEntryMetadata(zipPath)
    const totalUncompressedBytes = preflightMetadata.reduce((sum, entry) => sum + entry.uncompressedBytes, 0)
    const safe = preflightMetadata.length === preflightEntries.length
      && preflightMetadata.every((entry, index) => entry.path === preflightEntries[index])
      && preflightMetadata.every((entry) => entry.mode.startsWith('-'))
      && preflightMetadata.every((entry) => entry.uncompressedBytes <= MAX_ZIP_ENTRY_UNCOMPRESSED_BYTES)
      && totalUncompressedBytes <= MAX_ZIP_TOTAL_UNCOMPRESSED_BYTES
      && duplicateValues(preflightEntries).length === 0
      && portablePathCollisionIssues(preflightEntries).length === 0
      && preflightEntries.every((entry) => !hasUnsafeEntryPath(entry))
    if (!safe) throw new Error('unsafe ZIP metadata')
    zipPreflightPassed = true
    check(checks, 'zip-metadata-preflight', true, `${preflightEntries.length} bounded regular-file entry/entries; ${totalUncompressedBytes} uncompressed bytes`)
  } catch {
    check(checks, 'zip-metadata-preflight', false, 'ZIP metadata is unsafe, ambiguous, unsupported, or exceeds extraction limits')
  }

  if (zipPreflightPassed) {
    try {
      execFileSync('unzip', ['-tq', zipPath], { stdio: ['ignore', 'ignore', 'pipe'] })
      check(checks, 'zip-integrity', true, 'unzip -tq passed after metadata preflight')
    } catch {
      check(checks, 'zip-integrity', false, 'unzip -tq failed')
    }
  } else {
    check(checks, 'zip-integrity', false, 'skipped because ZIP metadata preflight failed')
  }

  if (!zipPreflightPassed) {
    errors.push('ZIP metadata preflight failed; content inspection was skipped.')
    checkZipInputStability()
    return {
      zipPath: repoRelative(zipPath),
      zipSha256,
      archiveRoot,
      passed: false,
      checks,
      counts,
      errors,
    }
  }

  try {
    const entries = listZipEntries(zipPath)
    const entryModes = listZipEntryModes(zipPath)
    const duplicateEntries = duplicateValues(entries)
    const portableCollisions = portablePathCollisionIssues(entries)
    const entrySet = new Set(entries)
    const fileEntries = entries.filter((entry) => !entry.endsWith('/'))
    const entryIntegrity = new Map<string, { bytes: number; sha256: string; head: Buffer }>()
    const inspectZipEntry = (entry: string) => {
      const cached = entryIntegrity.get(entry)
      if (cached) return cached
      const content = readZipEntry(zipPath, entry)
      const inspected = {
        bytes: content.length,
        sha256: sha256(content),
        head: Buffer.from(content.subarray(0, 8)),
      }
      entryIntegrity.set(entry, inspected)
      return inspected
    }
    archiveRoot = archiveRootFrom(entries)
    counts.files = entries.length
    counts.uniqueFiles = entrySet.size
    counts.maxArchivePathLength = entries.reduce((maxLength, entry) => Math.max(maxLength, entry.length), 0)

    check(
      checks,
      'zip-entry-names-unique',
      duplicateEntries.length === 0,
      duplicateEntries.slice(0, 5).join(', ') || `${entries.length} unique entry name(s)`,
    )
    check(
      checks,
      'zip-entry-paths-portably-distinct',
      portableCollisions.length === 0,
      portableCollisions.slice(0, 5).join(' | ') || 'no case-folded, Unicode-normalized, or file/child collisions',
    )
    check(
      checks,
      'zip-entry-types-regular-files-only',
      entryModes.length === entries.length && entryModes.every((mode) => mode.startsWith('-')),
      entryModes.length !== entries.length
        ? `zipinfo described ${entryModes.length}/${entries.length} entries`
        : entryModes.filter((mode) => !mode.startsWith('-')).slice(0, 5).join(', ') || `${entryModes.length} regular file entry/entries`,
    )
    check(checks, 'single-archive-root', archiveRoot !== null, archiveRoot ?? 'Archive has multiple roots.')
    check(
      checks,
      'portable-archive-root',
      isPortableArchiveRoot(archiveRoot),
      archiveRoot ?? 'Archive has no unique root.',
    )
    check(
      checks,
      'windows-safe-entry-paths',
      counts.maxArchivePathLength <= WINDOWS_SAFE_ARCHIVE_PATH_LIMIT,
      `Longest entry path: ${counts.maxArchivePathLength}`,
    )
    const unsafeEntries = entries.filter(hasUnsafeEntryPath)
    check(checks, 'no-internal-or-source-file-paths', unsafeEntries.length === 0, unsafeEntries.slice(0, 5).join(', ') || 'ok')

    if (!archiveRoot) {
      throw new Error('Cannot continue package validation without a single archive root.')
    }

    const requiredMissing = REQUIRED_RELATIVE_PATHS
      .map((relativePath) => packageEntryPath(archiveRoot, relativePath))
      .filter((entryPath) => !entrySet.has(entryPath))
    check(checks, 'required-package-files-present', requiredMissing.length === 0, requiredMissing.join(', ') || 'ok')

    const manifestPath = packageEntryPath(archiveRoot, 'metadata/manifest.json')
    const manifest = jsonObject(readZipEntryJson(zipPath, manifestPath), 'manifest')
    check(checks, 'manifest-archive-root-matches', manifest.archiveRoot === archiveRoot, String(manifest.archiveRoot ?? '(missing)'))
    const sourceSelection = jsonObject(manifest.sourceSelection ?? {}, 'manifest.sourceSelection') as ManifestSourceSelection

    const manifestFiles = Array.isArray(manifest.files)
      ? manifest.files.map(parseManifestFileRecord)
      : []
    counts.manifestFiles = manifestFiles.length
    const manifestFilePaths = manifestFiles.map((file) => file.path)
    const duplicateManifestFilePaths = duplicateValues(manifestFilePaths)
    const unsafeManifestFilePaths = manifestFilePaths.filter(hasUnsafeManifestFilePath)
    check(
      checks,
      'manifest-file-paths-unique',
      duplicateManifestFilePaths.length === 0,
      duplicateManifestFilePaths.slice(0, 5).join(', ') || `${manifestFilePaths.length} unique manifest file path(s)`,
    )
    check(
      checks,
      'manifest-file-paths-safe',
      unsafeManifestFilePaths.length === 0,
      unsafeManifestFilePaths.slice(0, 5).join(', ') || 'ok',
    )
    const invalidLicenseFiles = manifestFiles.filter((file) => !ALLOWED_LICENSE_CATEGORIES.has(file.licenseCategory))
    check(checks, 'manifest-license-categories-known', invalidLicenseFiles.length === 0, invalidLicenseFiles.map((file) => file.path).join(', ') || 'ok')

    const shaPath = packageEntryPath(archiveRoot, 'metadata/SHA256SUMS')
    const manifestFilePathSet = new Set(manifestFilePaths)
    const manifestExcludedEntries = new Set([manifestPath, shaPath])
    const expectedManifestFilePaths = fileEntries.filter((entry) => !manifestExcludedEntries.has(entry))
    const expectedManifestFilePathSet = new Set(expectedManifestFilePaths)
    const missingManifestFilePaths = expectedManifestFilePaths
      .filter((entry) => !manifestFilePathSet.has(entry))
    const unexpectedManifestFilePaths = manifestFilePaths
      .filter((entry) => !expectedManifestFilePathSet.has(entry))
    check(
      checks,
      'manifest-file-set-exact',
      missingManifestFilePaths.length === 0
        && unexpectedManifestFilePaths.length === 0
        && manifestFiles.length === expectedManifestFilePaths.length,
      missingManifestFilePaths.length === 0
        && unexpectedManifestFilePaths.length === 0
        && manifestFiles.length === expectedManifestFilePaths.length
        ? `${manifestFiles.length} file record(s); metadata/manifest.json and metadata/SHA256SUMS intentionally excluded`
        : `missing: ${missingManifestFilePaths.slice(0, 5).join(', ') || '-'}; unexpected: ${unexpectedManifestFilePaths.slice(0, 5).join(', ') || '-'}; records: ${manifestFiles.length}/${expectedManifestFilePaths.length}`,
    )
    const { checksums, invalidLines } = parseChecksumFile(readZipEntryText(zipPath, shaPath))
    check(checks, 'checksum-file-format', invalidLines.length === 0, invalidLines.slice(0, 3).join(' | ') || 'ok')

    const checksumMissingEntries = entries
      .filter((entry) => entry !== shaPath)
      .filter((entry) => !checksums.has(entry))
    check(checks, 'checksum-file-covers-package', checksumMissingEntries.length === 0, checksumMissingEntries.slice(0, 5).join(', ') || 'ok')

    const checksumMismatches = [...checksums.entries()].flatMap(([entry, expected]) => {
      if (!entrySet.has(entry)) {
        return [`missing entry: ${entry}`]
      }
      const actual = inspectZipEntry(entry).sha256
      return actual === expected ? [] : [`${entry}: ${actual} != ${expected}`]
    })
    check(checks, 'checksum-file-values-match', checksumMismatches.length === 0, checksumMismatches.slice(0, 3).join(' | ') || 'ok')

    const manifestFileIssues = manifestFiles.flatMap((file) => {
      if (!entrySet.has(file.path)) {
        return [`missing entry: ${file.path}`]
      }
      const content = inspectZipEntry(file.path)
      const issues: string[] = []
      if (content.sha256 !== file.sha256) {
        issues.push(`${file.path}: sha256 mismatch`)
      }
      if (content.bytes !== file.bytes) {
        issues.push(`${file.path}: byte length mismatch`)
      }
      return issues
    })
    check(checks, 'manifest-file-records-match', manifestFileIssues.length === 0, manifestFileIssues.slice(0, 5).join(' | ') || 'ok')

    const validationReportPath = packageEntryPath(archiveRoot, 'metadata/validation-report.json')
    const validationReport = readZipEntryJson(zipPath, validationReportPath)
    check(checks, 'embedded-validation-report-passed', validationReportHasPassed(validationReport), 'embedded checks pass and errors array is empty')

    const sourceIndexPath = packageEntryPath(archiveRoot, 'data/sources/source-index.json')
    const sourceIndex = readZipEntryJson(zipPath, sourceIndexPath)
    const sourceIndexObject = jsonObject(sourceIndex, 'source index')
    const sources = Array.isArray(sourceIndexObject.sources) ? sourceIndexObject.sources : []
    const urls = collectUrlValues(sourceIndex)
    const invalidUrls = urls.filter((url) => !/^https?:\/\/\S+$/u.test(url))
    counts.sourceRecords = sources.length
    counts.sourceUrls = urls.length
    check(checks, 'source-index-present-and-nonempty', sources.length > 0, `${sources.length} source record(s)`)
    check(checks, 'source-index-uses-official-http-links', urls.length > 0 && invalidUrls.length === 0, invalidUrls.join(', ') || `${urls.length} URL(s)`)

    const sourceGoalReferencesPath = packageEntryPath(archiveRoot, 'data/sources/source-goal-references.json')
    const sourceGoalReferences = jsonObject(readZipEntryJson(zipPath, sourceGoalReferencesPath), 'source-goal references')
    const sourceGoalReferenceSources = Array.isArray(sourceGoalReferences.sources) ? sourceGoalReferences.sources : []
    const sourceGoalReferenceRecords = sourceGoalReferenceSources.flatMap((source) => {
      const sourceData = jsonObject(source, 'source-goal reference source')
      const sourceGoals = Array.isArray(sourceData.sourceGoals) ? sourceData.sourceGoals : []
      return sourceGoals.map((goal) => jsonObject(goal, 'source-goal reference'))
    })
    const sourceGoalIds = sourceGoalReferenceRecords
      .flatMap((goal) => (typeof goal.sourceGoalId === 'string' && goal.sourceGoalId.trim() ? [goal.sourceGoalId.trim()] : []))
    const duplicateSourceGoalIds = sourceGoalIds.filter((goalId, index) => sourceGoalIds.indexOf(goalId) !== index)
    const sourceGoalIdSet = new Set(sourceGoalIds)
    const sourceGoalReferencesWithoutText = sourceGoalReferenceRecords
      .filter((goal) => typeof goal.sourceText !== 'string' || goal.sourceText.trim().length === 0)
      .map((goal) => String(goal.sourceGoalId ?? '(missing-id)'))
    const sourceGoalReferencesWithoutUrl = sourceGoalReferenceRecords
      .filter((goal) => typeof goal.sourceDocumentUrl !== 'string' || !/^https?:\/\/\S+$/u.test(goal.sourceDocumentUrl))
      .map((goal) => String(goal.sourceGoalId ?? '(missing-id)'))
    counts.sourceGoalReferenceSources = sourceGoalReferenceSources.length
    counts.sourceGoalReferences = sourceGoalReferenceRecords.length
    check(
      checks,
      'source-goal-references-present-and-nonempty',
      sourceGoalReferenceRecords.length > 0,
      `${sourceGoalReferenceRecords.length} source-goal reference(s)`,
    )
    check(
      checks,
      'source-goal-reference-ids-unique',
      duplicateSourceGoalIds.length === 0,
      duplicateSourceGoalIds.slice(0, 5).join(', ') || 'ok',
    )
    check(
      checks,
      'source-goal-references-have-text-and-official-links',
      sourceGoalReferencesWithoutText.length === 0 && sourceGoalReferencesWithoutUrl.length === 0,
      sourceGoalReferencesWithoutText.length === 0 && sourceGoalReferencesWithoutUrl.length === 0
        ? 'ok'
        : `missing text: ${sourceGoalReferencesWithoutText.slice(0, 3).join(', ') || '-'}; missing URL: ${sourceGoalReferencesWithoutUrl.slice(0, 3).join(', ') || '-'}`,
    )

    const externalDependencyPath = packageEntryPath(archiveRoot, 'data/dependencies/external-goal-references.json')
    const externalDependencies = jsonObject(readZipEntryJson(zipPath, externalDependencyPath), 'external goal references')
    const externalReferences = Array.isArray(externalDependencies.references) ? externalDependencies.references : []
    const malformedExternalReferences = externalReferences.flatMap((reference) => {
      const referenceData = jsonObject(reference, 'external goal reference')
      const targetGoalId = referenceData.targetGoalId
      const fromGoalId = referenceData.fromGoalId
      const relation = referenceData.relation
      const targetSubject = referenceData.targetSubject
      const targetLandscapeId = referenceData.targetLandscapeId
      return typeof targetGoalId === 'string'
        && typeof fromGoalId === 'string'
        && (relation === 'contains' || relation === 'requires')
        && typeof targetSubject === 'string'
        && typeof targetLandscapeId === 'string'
        ? []
        : [`Malformed external reference: ${JSON.stringify(referenceData)}`]
    })
    const declaredExternalGoalIds = new Set(externalReferences.flatMap((reference) => {
      const referenceData = jsonObject(reference, 'external goal reference')
      return typeof referenceData.targetGoalId === 'string' ? [referenceData.targetGoalId] : []
    }))
    counts.externalGoalReferences = externalReferences.length
    check(
      checks,
      'external-goal-references-file-valid',
      malformedExternalReferences.length === 0,
      malformedExternalReferences.slice(0, 3).join(' | ') || `${externalReferences.length} external reference(s)`,
    )

    const forbiddenDataEntries = entries
      .filter((entry) => entry.startsWith(`${archiveRoot}/data/`) || entry.startsWith(`${archiveRoot}/metadata/`))
      .filter((entry) => entry.endsWith('.json') || entry.endsWith('.jsonl') || entry.endsWith('.md'))
      .flatMap((entry) => {
        const text = readZipEntryText(zipPath, entry)
        return INTERNAL_DATA_PATTERNS
          .filter((pattern) => pattern.test(text))
          .map((pattern) => `${entry}: ${pattern.source}`)
      })
    check(checks, 'no-internal-repository-references-in-data', forbiddenDataEntries.length === 0, forbiddenDataEntries.slice(0, 5).join(' | ') || 'ok')

    const canonicalEntries = entries.filter((entry) => entry.startsWith(`${archiveRoot}/data/canonical/`) && entry.endsWith('.landscape.json'))
    check(checks, 'single-canonical-landscape', canonicalEntries.length === 1, `${canonicalEntries.length} canonical landscape file(s)`)
    const canonicalData = readZipEntryJson(zipPath, canonicalEntries[0])
    const goals = parseGoals(canonicalData)
    const goalIds = goals.map((goal) => goal.id)
    const duplicateGoalIds = goalIds.filter((goalId, index) => goalIds.indexOf(goalId) !== index)
    counts.canonicalGoals = goals.length
    check(checks, 'canonical-goals-present-and-unique', goals.length > 0 && duplicateGoalIds.length === 0, `${goals.length} goal(s)`)

    const subjectSlug = typeof manifest.subjectSlug === 'string' && manifest.subjectSlug.trim()
      ? manifest.subjectSlug.trim()
      : ''
    check(checks, 'manifest-subject-slug-present', subjectSlug.length > 0, subjectSlug || '(missing)')
    const canonicalVisualizations = collectCanonicalGoalVisualizations(canonicalData, subjectSlug)
    const actualVisualizationEntries = entries.filter((entry) => entry.startsWith(`${archiveRoot}/assets/goal-visualizations/`))
    const visualizationContractMarkers = GOAL_VISUALIZATION_CONTRACT_RELATIVE_PATHS
      .map((relativePath) => packageEntryPath(archiveRoot, relativePath))
      .filter((entry) => entrySet.has(entry))
    const manifestDeclaresVisualizations = Object.prototype.hasOwnProperty.call(sourceSelection, 'goalVisualizationAssetCount')
      || Object.prototype.hasOwnProperty.call(sourceSelection, 'goalVisualizationIndexPackagePath')
      || manifestFiles.some((file) => file.category === 'goal-visualization' || file.category === 'goal-visualization-index')
    const hasVisualizationContract = canonicalVisualizations.declaredLinks > 0
      || actualVisualizationEntries.length > 0
      || visualizationContractMarkers.length > 0
      || manifestDeclaresVisualizations
    const missingVisualizationContractEntries = hasVisualizationContract
      ? GOAL_VISUALIZATION_CONTRACT_RELATIVE_PATHS
        .map((relativePath) => packageEntryPath(archiveRoot, relativePath))
        .filter((entry) => !entrySet.has(entry))
      : []
    check(
      checks,
      'goal-visualization-contract-files-present-when-declared',
      missingVisualizationContractEntries.length === 0,
      hasVisualizationContract
        ? missingVisualizationContractEntries.join(', ') || 'index and schema present'
        : 'legacy package without a goal-visualization contract',
    )

    if (hasVisualizationContract) {
      counts.goalVisualizationLinks = canonicalVisualizations.records.length
      check(
        checks,
        'canonical-goal-visualization-links-valid',
        canonicalVisualizations.issues.length === 0
          && canonicalVisualizations.records.length === canonicalVisualizations.declaredLinks,
        canonicalVisualizations.issues.slice(0, 5).join(' | ') || `${canonicalVisualizations.records.length} active link(s)`,
      )
    }

    if (hasVisualizationContract && missingVisualizationContractEntries.length === 0) {
      const visualizationIndexEntry = packageEntryPath(archiveRoot, GOAL_VISUALIZATION_INDEX_PATH)
    const visualizationIndex = jsonObject(readZipEntryJson(zipPath, visualizationIndexEntry), 'goal visualization index')
    check(checks, 'goal-visualization-index-schema-version', visualizationIndex.schemaVersion === 1, String(visualizationIndex.schemaVersion ?? '(missing)'))
    const visualizationIndexValues = Array.isArray(visualizationIndex.assets) ? visualizationIndex.assets : []
    const indexedVisualizations: GoalVisualizationAssetRecord[] = []
    const visualizationIndexParseIssues: string[] = []
    visualizationIndexValues.forEach((value, index) => {
      try {
        indexedVisualizations.push(parseGoalVisualizationAssetRecord(value))
      } catch (error) {
        visualizationIndexParseIssues.push(`assets[${index}]: ${error instanceof Error ? error.message : String(error)}`)
      }
    })
    counts.goalVisualizationIndexAssets = indexedVisualizations.length
    counts.goalVisualizationBytes = indexedVisualizations.reduce((sum, asset) => sum + asset.bytes, 0)
    check(
      checks,
      'goal-visualization-index-records-valid',
      visualizationIndexParseIssues.length === 0 && indexedVisualizations.length === visualizationIndexValues.length,
      visualizationIndexParseIssues.slice(0, 5).join(' | ') || `${indexedVisualizations.length} valid asset record(s)`,
    )
    const oversizedVisualizations = indexedVisualizations.filter((asset) => asset.bytes > MAX_GOAL_VISUALIZATION_BYTES)
    const visualizationExtractionSizeSafe = oversizedVisualizations.length === 0
      && counts.goalVisualizationBytes <= MAX_GOAL_VISUALIZATION_TOTAL_BYTES
    check(
      checks,
      'goal-visualization-extraction-size-limits',
      visualizationExtractionSizeSafe,
      oversizedVisualizations.slice(0, 5).map((asset) => `${asset.packagePath}: ${asset.bytes} bytes`).join(' | ')
        || `${counts.goalVisualizationBytes} total visualization bytes`,
    )

    const visualizationKey = (record: { goalId: string; order: number }) => `${record.goalId}:${record.order}`
    const indexedKeys = indexedVisualizations.map(visualizationKey)
    const duplicateIndexedKeys = indexedKeys.filter((key, index) => indexedKeys.indexOf(key) !== index)
    const indexedPaths = indexedVisualizations.map((record) => record.packagePath)
    const duplicateIndexedPaths = indexedPaths.filter((path, index) => indexedPaths.indexOf(path) !== index)
    check(
      checks,
      'goal-visualization-index-records-unique',
      duplicateIndexedKeys.length === 0 && duplicateIndexedPaths.length === 0,
      duplicateIndexedKeys.length === 0 && duplicateIndexedPaths.length === 0
        ? 'unique by goal/link index and package path'
        : `duplicate keys: ${duplicateIndexedKeys.slice(0, 3).join(', ') || '-'}; duplicate paths: ${duplicateIndexedPaths.slice(0, 3).join(', ') || '-'}`,
    )

    const indexedByKey = new Map(indexedVisualizations.map((record) => [visualizationKey(record), record]))
    const canonicalByKey = new Map(canonicalVisualizations.records.map((record) => [visualizationKey(record), record]))
    const visualizationMetadataFields = [
      'goalId',
      'order',
      'packagePath',
      'publicUrl',
      'skillpilotId',
      'role',
      'title',
      'provider',
      'description',
      'altText',
      'lang',
      'license',
      'reviewStatus',
    ] as const
    const visualizationMetadataIssues = canonicalVisualizations.records.flatMap((expected) => {
      const key = visualizationKey(expected)
      const actual = indexedByKey.get(key)
      if (!actual) return [`missing index record ${key}`]
      return visualizationMetadataFields.flatMap((field) => (
        actual[field] === expected[field] ? [] : [`${key}: ${field} mismatch`]
      ))
    })
    const unexpectedVisualizationRecords = indexedVisualizations
      .filter((record) => !canonicalByKey.has(visualizationKey(record)))
      .map((record) => `unexpected index record ${visualizationKey(record)}`)
    check(
      checks,
      'goal-visualization-index-matches-canonical-links',
      visualizationMetadataIssues.length === 0
        && unexpectedVisualizationRecords.length === 0
        && indexedVisualizations.length === canonicalVisualizations.records.length,
      [...visualizationMetadataIssues, ...unexpectedVisualizationRecords].slice(0, 5).join(' | ')
        || `${indexedVisualizations.length}/${canonicalVisualizations.records.length} index record(s) match`,
    )

    const expectedVisualizationEntries = new Set(indexedVisualizations.map((record) => packageEntryPath(archiveRoot, record.packagePath)))
    const missingVisualizationEntries = [...expectedVisualizationEntries].filter((entry) => !entrySet.has(entry))
    const orphanVisualizationEntries = actualVisualizationEntries.filter((entry) => !expectedVisualizationEntries.has(entry))
    counts.goalVisualizationAssets = actualVisualizationEntries.length
    check(
      checks,
      'goal-visualization-assets-complete-without-orphans',
      missingVisualizationEntries.length === 0
        && orphanVisualizationEntries.length === 0
        && actualVisualizationEntries.length === indexedVisualizations.length,
      missingVisualizationEntries.length === 0 && orphanVisualizationEntries.length === 0
        ? `${actualVisualizationEntries.length} packaged asset(s)`
        : `missing: ${missingVisualizationEntries.slice(0, 3).join(', ') || '-'}; orphan: ${orphanVisualizationEntries.slice(0, 3).join(', ') || '-'}`,
    )

    const manifestByPath = new Map(manifestFiles.map((file) => [file.path, file]))
    const visualizationManifestFiles = manifestFiles.filter((file) => file.category === 'goal-visualization')
    const visualizationBinaryIssues = indexedVisualizations.flatMap((record) => {
      const entry = packageEntryPath(archiveRoot, record.packagePath)
      const manifestFile = manifestByPath.get(entry)
      const issues: string[] = []
      if (!safeGoalVisualizationPackagePath(record.packagePath) || record.publicUrl !== `/${record.packagePath}`) {
        issues.push(`${visualizationKey(record)}: unsafe packagePath/publicUrl`)
      }
      const extension = record.mediaType === 'image/jpeg' ? '.jpg' : '.png'
      if (record.packagePath !== expectedGoalVisualizationPath(subjectSlug, record.goalId, extension)) {
        issues.push(`${visualizationKey(record)}: unexpected package path`)
      }
      if (record.skillpilotId !== record.goalId || record.role !== 'primary') {
        issues.push(`${visualizationKey(record)}: goal/skillpilot ID or role mismatch`)
      }
      if (!manifestFile) {
        issues.push(`${entry}: missing manifest record`)
      } else {
        if (manifestFile.category !== 'goal-visualization') issues.push(`${entry}: wrong manifest category`)
        if (manifestFile.licenseCategory !== GOAL_VISUALIZATION_LICENSE_CATEGORY) issues.push(`${entry}: wrong license category`)
        if (manifestFile.bytes !== record.bytes) issues.push(`${entry}: manifest/index byte mismatch`)
        if (manifestFile.sha256 !== record.sha256) issues.push(`${entry}: manifest/index hash mismatch`)
      }
      if (!entrySet.has(entry)) return issues
      if (!visualizationExtractionSizeSafe) {
        issues.push(`${entry}: visualization extraction size contract failed`)
        return issues
      }
      const content = inspectZipEntry(entry)
      if (content.bytes !== record.bytes) issues.push(`${entry}: packaged byte length mismatch`)
      if (content.sha256 !== record.sha256) issues.push(`${entry}: packaged SHA-256 mismatch`)
      if (!goalVisualizationMagicMatches(record, content.head)) issues.push(`${entry}: extension, MIME, or magic-byte mismatch`)
      return issues
    })
    const unexpectedVisualizationManifestFiles = visualizationManifestFiles
      .filter((file) => !expectedVisualizationEntries.has(file.path))
      .map((file) => `${file.path}: orphan manifest visualization record`)
    check(
      checks,
      'goal-visualization-binaries-and-manifest-valid',
      visualizationBinaryIssues.length === 0
        && unexpectedVisualizationManifestFiles.length === 0
        && visualizationManifestFiles.length === indexedVisualizations.length,
      [...visualizationBinaryIssues, ...unexpectedVisualizationManifestFiles].slice(0, 5).join(' | ')
        || `${indexedVisualizations.length} image(s) passed path, MIME, magic-byte, byte-length, SHA-256, and manifest checks`,
    )

    const expectedVisualizationCount = typeof sourceSelection.goalVisualizationAssetCount === 'number'
      ? sourceSelection.goalVisualizationAssetCount
      : -1
    const configuredVisualizationIndexPath = sourceSelection.goalVisualizationIndexPackagePath
    check(
      checks,
      'goal-visualization-counts-match-manifest',
      expectedVisualizationCount === indexedVisualizations.length
        && configuredVisualizationIndexPath === visualizationIndexEntry,
      `${indexedVisualizations.length} indexed; manifest expects ${expectedVisualizationCount}; index ${String(configuredVisualizationIndexPath ?? '(missing)')}`,
    )
    } else if (!hasVisualizationContract) {
      counts.goalVisualizationLinks = 0
      counts.goalVisualizationIndexAssets = 0
      counts.goalVisualizationAssets = 0
      counts.goalVisualizationBytes = 0
      check(
        checks,
        'legacy-package-without-goal-visualizations-supported',
        true,
        'No canonical links, manifest declarations, index/schema markers, or packaged visualization assets are present.',
      )
    }

    const containsUnknown = unknownReferences(goals, 'contains')
    const requiresUnknown = unknownReferences(goals, 'requires')
    const undeclaredContainsUnknown = containsUnknown.filter((reference) => !declaredExternalGoalIds.has(reference.targetGoalId))
    const undeclaredRequiresUnknown = requiresUnknown.filter((reference) => !declaredExternalGoalIds.has(reference.targetGoalId))
    check(
      checks,
      'canonical-contains-references-resolve',
      undeclaredContainsUnknown.length === 0,
      undeclaredContainsUnknown.length === 0 ? `local ok, ${containsUnknown.length} declared external reference(s)` : formatReferences(undeclaredContainsUnknown),
    )
    check(
      checks,
      'canonical-requires-references-resolve',
      undeclaredRequiresUnknown.length === 0,
      undeclaredRequiresUnknown.length === 0 ? `local ok, ${requiresUnknown.length} declared external reference(s)` : formatReferences(undeclaredRequiresUnknown),
    )
    check(checks, 'canonical-contains-is-acyclic', cycleCount(goals, 'contains') === 0, 'contains cycle check')
    check(checks, 'canonical-requires-is-acyclic', cycleCount(goals, 'requires') === 0, 'requires cycle check')

    const goalIdSet = new Set(goalIds)
    const viewEntries = entries.filter((entry) => entry.startsWith(`${archiveRoot}/data/views/`) && entry.endsWith('.json'))
    const viewUnknownRefs = viewEntries.flatMap((entry) => collectGoalIdsFromView(readZipEntryJson(zipPath, entry))
      .filter((goalId) => !goalIdSet.has(goalId))
      .map((goalId) => `${entry}: ${goalId}`))
    counts.compositionViews = viewEntries.length
    check(checks, 'composition-views-present', viewEntries.length > 0, `${viewEntries.length} view file(s)`)
    check(checks, 'composition-view-goal-references-resolve', viewUnknownRefs.length === 0, viewUnknownRefs.slice(0, 5).join(' | ') || 'ok')

    const mappingStates = [...new Set(entries.flatMap((entry) => {
      const match = entry.match(/\/data\/mappings\/(DE-[A-Z]{2})\//u)
      return match ? [match[1]] : []
    }))].sort(compareCodeUnits)
    counts.mappingStates = mappingStates.length
    const missingStates = EXPECTED_DE_STATES.filter((state) => !mappingStates.includes(state))
    check(checks, 'all-de-state-mapping-lanes-present', missingStates.length === 0, missingStates.join(', ') || 'all 16 state lanes')

    const reviewMappingEntries = entries.filter((entry) => entry.startsWith(`${archiveRoot}/data/mappings/`) && entry.endsWith('.review.json'))
    const reviewMappingSourceReferences = reviewMappingEntries.flatMap((entry) => {
      const mappingData = jsonObject(readZipEntryJson(zipPath, entry), 'review mapping')
      const mappings = Array.isArray(mappingData.mappings) ? mappingData.mappings : []
      return mappings.flatMap((mapping) => {
        const mappingObject = jsonObject(mapping, 'review mapping entry')
        const sourceGoalId = sourceGoalIdFromMapping(mappingObject)
        return sourceGoalId ? [{ entry, sourceGoalId }] : []
      })
    })
    const unresolvedReviewMappingSourceReferences = reviewMappingSourceReferences
      .filter((reference) => !sourceGoalIdSet.has(reference.sourceGoalId))
    counts.reviewMappingFiles = reviewMappingEntries.length
    counts.reviewMappingSourceReferences = reviewMappingSourceReferences.length
    counts.unresolvedReviewMappingSourceReferences = unresolvedReviewMappingSourceReferences.length
    check(
      checks,
      'review-mapping-source-references-resolve',
      reviewMappingSourceReferences.length > 0 && unresolvedReviewMappingSourceReferences.length === 0,
      unresolvedReviewMappingSourceReferences.length === 0
        ? `${reviewMappingSourceReferences.length} review mapping source reference(s)`
        : unresolvedReviewMappingSourceReferences.slice(0, 5).map((reference) => `${reference.entry}: ${reference.sourceGoalId}`).join(' | '),
    )

    const cardRuntimePaths = [...new Set(collectCardRuntimePaths(canonicalData))]
    const cardEntries = new Set(entries.filter((entry) => entry.startsWith(`${archiveRoot}/data/cards/`)))
    const missingCards = cardRuntimePaths
      .map((runtimePath) => packageEntryPath(archiveRoot, `data/cards/${basename(runtimePath)}`))
      .filter((entry) => !cardEntries.has(entry))
    counts.cardRuntimeReferences = cardRuntimePaths.length
    check(checks, 'canonical-card-references-are-packaged', missingCards.length === 0, missingCards.join(', ') || `${cardRuntimePaths.length} runtime reference(s)`)

    const cardIndex = jsonObject(readZipEntryJson(zipPath, packageEntryPath(archiveRoot, 'data/cards/card-index.json')), 'card index')
    const cardIndexDecks = Array.isArray(cardIndex.decks) ? cardIndex.decks : []
    const missingCardIndexEntries = cardIndexDecks.flatMap((deck) => {
      const deckData = jsonObject(deck, 'card index deck')
      const packagePath = typeof deckData.packagePath === 'string' ? deckData.packagePath : null
      if (!packagePath) {
        return ['card-index deck without packagePath']
      }
      const entry = packageEntryPath(archiveRoot, packagePath)
      return entrySet.has(entry) ? [] : [`missing card-index packagePath: ${entry}`]
    })
    counts.cardIndexDecks = cardIndexDecks.length
    check(checks, 'card-index-package-paths-resolve', missingCardIndexEntries.length === 0, missingCardIndexEntries.join(' | ') || `${cardIndexDecks.length} deck(s)`)

    const memoryAuditRoot = `${archiveRoot}/metadata/quality/memory-card-review/`
    const memoryAuditEntries = entries.filter((entry) => entry.startsWith(memoryAuditRoot))
    const memoryAuditReports = memoryAuditEntries.filter((entry) => entry.endsWith('.md'))
    const memoryAuditConfigs = memoryAuditEntries.filter((entry) => entry.endsWith('.config.json'))
    const expectedMemoryAuditCount = typeof sourceSelection.memoryCardReviewAuditCount === 'number'
      ? sourceSelection.memoryCardReviewAuditCount
      : 0
    counts.memoryCardReviewAuditReports = memoryAuditReports.length
    counts.memoryCardReviewAuditConfigs = memoryAuditConfigs.length
    check(
      checks,
      'memory-card-review-audit-count-matches-manifest',
      memoryAuditReports.length === expectedMemoryAuditCount && memoryAuditConfigs.length === expectedMemoryAuditCount,
      `${memoryAuditReports.length} report(s), ${memoryAuditConfigs.length} config(s), manifest expects ${expectedMemoryAuditCount}`,
    )

    const memoryAuditReferenceIssues = memoryAuditConfigs.flatMap((entry) => {
      const config = jsonObject(readZipEntryJson(zipPath, entry), 'memory-card review config')
      return ['landscapePackagePath', 'goalLedgerPackagePath', 'cardLedgerPackagePath', 'reportPackagePath']
        .flatMap((key) => {
          const relativePath = packageRelativePathFromManifestValue(config[key])
          if (!relativePath) {
            return [`${entry}: invalid ${key}`]
          }
          const referencedEntry = packageEntryPath(archiveRoot, relativePath)
          return entrySet.has(referencedEntry) ? [] : [`${entry}: missing ${key} ${referencedEntry}`]
        })
    })
    check(
      checks,
      'memory-card-review-audit-references-resolve',
      memoryAuditReferenceIssues.length === 0,
      memoryAuditReferenceIssues.slice(0, 5).join(' | ') || `${memoryAuditConfigs.length} audit config(s)`,
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    errors.push(message)
    check(checks, 'validator-runtime', false, message)
  }

  checkZipInputStability()
  const failedChecks = checks.filter((entry) => !entry.passed)
  return {
    zipPath: repoRelative(zipPath),
    zipSha256,
    archiveRoot,
    passed: failedChecks.length === 0 && errors.length === 0,
    checks,
    counts,
    errors,
  }
}

const buildMarkdownReport = (params: {
  generatedAt: string
  results: PackageValidationResult[]
}) => {
  const rows = params.results
    .map((result) => `| \`${result.zipPath}\` | \`${result.zipSha256 ?? 'not available'}\` | ${result.passed ? 'pass' : 'fail'} | ${result.counts.files ?? 0} | ${result.counts.canonicalGoals ?? 0} | ${result.counts.goalVisualizationAssets ?? 0} | ${result.counts.mappingStates ?? 0}/16 | ${result.counts.sourceUrls ?? 0} | ${result.counts.sourceGoalReferences ?? 0} | ${result.counts.reviewMappingSourceReferences ?? 0} | ${result.counts.memoryCardReviewAuditReports ?? 0} | ${result.counts.externalGoalReferences ?? 0} | ${result.counts.maxArchivePathLength ?? 0} |`)
    .join('\n')
  const failedChecks = params.results.flatMap((result) => result.checks
    .filter((checkResult) => !checkResult.passed)
    .map((checkResult) => `- \`${result.zipPath}\` ${checkResult.id}: ${checkResult.details}`))

  return `# Subject Export Package Validation Report

Generated at: ${params.generatedAt}

## Result

${params.results.every((result) => result.passed)
  ? 'All subject export packages passed independent ZIP validation.'
  : 'At least one subject export package failed independent ZIP validation.'}

## Packages

| ZIP | SHA-256 | Status | Files | Goals | Images | State lanes | Source URLs | Source-goal refs | Review source refs | Memory audits | External refs | Max path |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${rows}

## Failed Checks

${failedChecks.length === 0 ? 'No failed checks.' : failedChecks.join('\n')}
`
}

const main = () => {
  const options = parseArgs(process.argv.slice(2))
  if (options.help) {
    process.stdout.write(usage())
    return
  }

  const zipPaths = options.zipPaths.length > 0 ? options.zipPaths : directExportZips(options.directory)
  if (zipPaths.length === 0) {
    throw new Error(`No export ZIP files found in ${repoRelative(options.directory)}`)
  }

  const generatedAt = new Date().toISOString()
  const results = zipPaths.map(validatePackage)
  mkdirSync(options.reportDir, { recursive: true })
  const reportPath = resolve(options.reportDir, 'subject-export-package-validation-report.json')
  const markdownReportPath = resolve(options.reportDir, 'subject-export-package-validation-report.md')
  const report = {
    generatedAt,
    reportPath: repoRelative(reportPath),
    markdownReportPath: repoRelative(markdownReportPath),
    packageCount: results.length,
    passed: results.every((result) => result.passed),
    results,
  }

  writeFileSync(reportPath, stableJson(report as unknown as JsonValue))
  writeFileSync(markdownReportPath, buildMarkdownReport({ generatedAt, results }))
  process.stdout.write(stableJson(report as unknown as JsonValue))

  if (!report.passed) {
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
