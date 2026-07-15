import { createHash, randomBytes } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import {
  closeSync,
  constants,
  existsSync,
  fstatSync,
  lstatSync,
  mkdirSync,
  openSync,
  readFileSync,
  readSync,
  readdirSync,
  renameSync,
  rmSync,
  writeFileSync,
  writeSync,
} from 'node:fs'
import { basename, dirname, isAbsolute, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { crc32 } from 'node:zlib'
import {
  createDeterministicZip32,
  type DeterministicZip32Entry,
  type DeterministicZip32Limits,
} from './deterministicZip32'

type JsonObject = Record<string, unknown>

type RoleProfile = {
  role: string
  minimum?: number
  maximum?: number
  runtimeRequired: 'required' | 'forbidden' | 'either'
  mediaTypes: string[]
  semanticBinding: {
    kind: 'logical-artifact' | 'binary-resource' | 'excluded-generated'
    allowedNormalizationRoles?: string[]
  }
  validationSchemaIds: string[]
}

type FullStandaloneProfile = {
  profileFormatVersion: number
  profileId: string
  manifestSchema: { id: string; sha256: string }
  trustedContractSchemas: Array<{ id: string; sha256: string }>
  semanticContractBindings: Array<{ bindingName: string; validationSchemaId: string }>
  compatibility: {
    packageFormatVersion: string
    runtimeContractVersion: string
    variant: string
  }
  inventoryPolicy: { excludedPaths: string[]; allowUnknownRoles: boolean }
  archiveLimits: {
    outerZipBytes: number
    entryCount: number
    genericEntryBytes: number
    jsonEntryBytes: number
    jsonMaxDepth: number
    jsonMaxNodes: number
    goalVisualizationBytes: number
    imageLaneBytes: number
    totalUncompressedBytes: number
    archivePathBytes: number
  }
  manifestLimits: { manifestBytes: number; fileRecords: number; licenseDocuments: number }
  licensePolicy: { requireDocumentForEveryIdentifier: boolean; disallowedIdentifiers: string[] }
  roles: RoleProfile[]
}

type LogicalArtifact = {
  logicalId: string
  role: string
  mediaType: string
  normalizedBytes: number
  normalizedSha256: string
  recordSha256: string
}

type BinaryResource = {
  resourceId: string
  canonicalReference: string
  mediaType: string
  bytes: number
  sha256: string
  recordSha256: string
}

type SemanticContentIndex = {
  contentDigest: string
  logicalArtifacts: LogicalArtifact[]
  binaryResources: BinaryResource[]
  normalizationProfile: { id: string; version: string; sha256: string }
  fieldSemanticsRegistry: { id: string; version: string; sha256: string }
}

type BuildInputBinary = {
  artifactPath: string
  sourcePath: string
  resourceId: string
  mediaType?: string
  bytes: number
  sha256: string
}

type BuildInputAssessment = {
  artifactPath: string
  sourcePath: string
  bytes: number
  sha256: string
}

type ReleaseBuildInputs = {
  profilePath: string
  profileSha256: string
  binaryResources: BuildInputBinary[]
  assessmentSources: BuildInputAssessment[]
}

type ClassDecision = {
  classId: string
  artifactRoles: string[]
  provenanceClass: string
  licenseExpression: string | null
  redistributionStatus: 'allowed' | 'review-required' | 'prohibited'
  decisionStatus: string
  reviewer?: string | null
  reviewedAt?: string | null
  reviewEvidence?: unknown[]
}

type AssetDecision = {
  resourceId: string
  artifactPath: string
  mediaType: string
  bytes: number
  assetSha256: string
  userProvided?: boolean
  provenanceClass: string
  licenseExpression: string | null
  redistributionStatus: 'allowed' | 'review-required' | 'prohibited'
  decisionStatus: string
  reviewer?: string | null
  reviewedAt?: string | null
  reviewEvidence?: unknown[]
}

type RedistributionReview = {
  packageId: string
  contentDigest: string
  sourceReleaseModel: {
    profileId: string
    releaseId: string
    resourceIndexPath: string
    resourceIndexSha256: string
    buildInputsPath: string
    buildInputsSha256: string
  }
  targetReleaseProfile: {
    profileId: string
    path: string
    sha256: string
    nonBinaryRoles: string[]
  }
  rootLicenseEvidence: {
    licenseId: string
    path: string
    bytes: number
    sha256: string
  }
  classDecisions: ClassDecision[]
  pathClassificationOverrides: Array<{
    role: string
    pathPrefix: string
    classId: string
    provenanceClass: string
  }>
  assetDecisions: AssetDecision[]
  summary: {
    classDecisionCount: number
    automaticAllowedClassCount: number
    publicationReady: boolean
    humanReviewItemCount: number
    pendingClassCount: number
    humanApprovedClassCount: number
    prohibitedClassCount: number
    assetCount: number
    externalResourceCount: number
    userProvidedAssetCount: number
    pendingAssetCount: number
    humanApprovedAssetCount: number
    prohibitedAssetCount: number
  }
}

type FileSemanticBinding =
  | { kind: 'logical-artifact'; logicalId: string; normalizationRole: string }
  | { kind: 'binary-resource'; resourceId: string }
  | { kind: 'excluded-generated' }

export type FullStandaloneManifestFile = {
  path: string
  role: string
  mediaType: string
  bytes: number
  sha256: string
  runtimeRequired: boolean
  validationSchemaId?: string
  licenseExpression: string | null
  provenanceClass: string
  redistributionStatus: 'allowed' | 'review-required' | 'prohibited'
  semanticBinding: FileSemanticBinding
}

export type FullStandalonePackageEntry = {
  relativePath: string
  sourcePath?: string
  content?: Buffer
  bytes: number
  sha256: string
  crc32: number
  manifestFile?: FullStandaloneManifestFile
}

export type FullStandalonePackagePlan = {
  archiveRoot: string
  releaseId: string
  packageId: string
  packageVersion: string
  contentDigest: string
  publicationReady: boolean
  humanReviewItemCount: number
  sourceVerificationPendingCount: number
  entries: FullStandalonePackageEntry[]
  manifest: JsonObject
  zipLimits: DeterministicZip32Limits
}

export type FullStandalonePackagePlanOptions = {
  releaseRoot: string
  repositoryRoot?: string
  archiveRoot?: string
  redistributionReviewPath?: string
  fullStandaloneProfilePath?: string
  definitionDigestProfilePath?: string
  supportedSkillpilotSoftware?: string
  expectedTrustedSchemaCount?: number
  sourceVerificationReviewPath?: string
  sourceVerificationReportPath?: string
  additionalLicenseDocumentPaths?: Record<string, string>
  fixtureOnly?: boolean
}

export type MaterializeFullStandalonePackageOptions = {
  outputDirectory: string
  writeDirectory: boolean
  writeZip: boolean
  repositoryRoot?: string
}

export type MaterializedFullStandalonePackage = {
  directoryPath: string | null
  zipPath: string | null
  zipBytes: number | null
  zipSha256: string | null
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const defaultRepositoryRoot = resolve(scriptDir, '../..')
const DEFAULT_PROFILE_PATH = 'contracts/curriculum-package/v1/profiles/full-standalone-v1.profile.json'
const DEFAULT_REVIEW_PATH = 'curricula/DE/Gymnasium/quality/package-redistribution/de-gymnasium-mathematik-v1.review.json'
const DEFAULT_DEFINITION_PROFILE_PATH = 'contracts/curriculum-package/v1/profiles/canonical-definition-record-v1.profile.json'
const DEFAULT_SOURCE_VERIFICATION_REVIEW_PATH = 'curricula/DE/Gymnasium/quality/source-verification/de-gymnasium-mathematik-v1.review.json'
const DEFAULT_SOURCE_VERIFICATION_REPORT_PATH = 'docs/qa-ci/status/source-verification-de-gymnasium-mathematik-v1.md'
const RELEASE_MODEL_VALIDATOR_PATH = 'scripts/validate_curriculum_release_model.py'
const REDISTRIBUTION_REVIEW_CHECKER_PATH = 'scripts/generate_curriculum_package_redistribution_review.py'
const SOURCE_VERIFICATION_CHECKER_PATH = 'scripts/generate_curriculum_source_verification_review.py'
const MANIFEST_PATH = 'metadata/manifest.json'
const CHECKSUMS_PATH = 'metadata/SHA256SUMS'
const REDISTRIBUTION_EVIDENCE_PATH = 'metadata/provenance/redistribution-review.json'
const SOURCE_VERIFICATION_EVIDENCE_PATH = 'metadata/provenance/source-verification-review.json'
const SOURCE_VERIFICATION_REPORT_PATH = 'metadata/provenance/source-verification-status.md'
const README_PATH = 'README.md'
const FIXED_ZIP_TIME = new Date('1980-01-01T00:00:00.000Z')
const SHA256_DIGEST_PATTERN = /^sha256:[a-f0-9]{64}$/u
const PACKAGE_PATH_PATTERN = /^(?!\/)(?!.*\\)(?!.*(?:^|\/)\.\.?(?:\/|$))(?!.*\/\/)[A-Za-z0-9._-]+(?:\/[A-Za-z0-9._-]+)*$/u
const ARCHIVE_ROOT_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]*$/u
const WINDOWS_RESERVED_SEGMENT = /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\..*)?$/iu
const LICENSE_TOKEN_PATTERN = /\(|\)|[A-Za-z0-9][A-Za-z0-9.+-]*/y
const EXPECTED_SEMANTIC_BINDING_NAMES = [
  'semanticNormalForm',
  'fieldSemanticsRegistry',
  'definitionDigestProfile',
  'curriculumOntologyProfile',
  'publicationEvidenceProfile',
] as const

const compareCodeUnits = (left: string, right: string) => (left < right ? -1 : left > right ? 1 : 0)

const fail = (message: string): never => {
  throw new Error(message)
}

export const sourceVerificationCheckerArguments = (
  ledgerRepositoryPath: string,
  reportRepositoryPath: string,
  mode: string | undefined,
): string[] => {
  const args = [
    '--check',
    '--ledger', ledgerRepositoryPath,
    '--report', reportRepositoryPath,
  ]
  switch (mode ?? 'strict') {
    case 'strict':
      return args
    case 'committed-bindings':
      return [...args, '--allow-missing-source-pdfs']
    default:
      return fail(
        `Unsupported SKILLPILOT_SOURCE_PDF_MODE: ${mode}. Expected one of: strict, committed-bindings.`,
      )
  }
}

const objectValue = (value: unknown, label: string): JsonObject => {
  if (value === null || Array.isArray(value) || typeof value !== 'object') fail(`${label} must be an object.`)
  return value as JsonObject
}

const stringValue = (value: unknown, label: string) => {
  if (typeof value !== 'string' || value.length === 0) fail(`${label} must be a non-empty string.`)
  return value
}

const booleanValue = (value: unknown, label: string) => {
  if (typeof value !== 'boolean') fail(`${label} must be a boolean.`)
  return value
}

const arrayValue = <T = unknown>(value: unknown, label: string) => {
  if (!Array.isArray(value)) fail(`${label} must be an array.`)
  return value as T[]
}

const jsonBytes = (value: unknown) => Buffer.from(`${JSON.stringify(value, null, 2)}\n`, 'utf8')

const readJson = <T>(path: string, label: string): T => {
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as T
  } catch (error) {
    throw new Error(`Cannot parse ${label} at ${path}: ${error instanceof Error ? error.message : String(error)}`)
  }
}

const withoutDigestPrefix = (value: string, label: string) => {
  if (!SHA256_DIGEST_PATTERN.test(value)) fail(`${label} must be a sha256: digest, got ${value}.`)
  return value.slice('sha256:'.length)
}

const assertSafePackagePath = (value: string, label = 'package path') => {
  if (value.length > 180 || !PACKAGE_PATH_PATTERN.test(value)) fail(`Unsafe ${label}: ${value}`)
  value.split('/').forEach((segment) => {
    if (segment.endsWith('.') || segment.endsWith(' ') || WINDOWS_RESERVED_SEGMENT.test(segment)) {
      fail(`Non-portable ${label} segment in ${value}: ${segment}`)
    }
  })
}

const portablePathKey = (value: string) => value.normalize('NFC').toLocaleLowerCase('en-US')

const repositoryRelativePath = (repositoryRoot: string, absolutePath: string, label: string) => {
  const value = relative(repositoryRoot, absolutePath).split(sep).join('/')
  assertSafePackagePath(value, `${label} repository-relative path`)
  return value
}

const runTrustedProcess = (
  repositoryRoot: string,
  scriptRepositoryPath: string,
  args: string[],
  label: string,
) => {
  const scriptPath = resolveRepositoryFile(repositoryRoot, scriptRepositoryPath, label)
  const result = spawnSync(process.env.PYTHON ?? 'python3', ['-B', scriptPath, ...args], {
    cwd: repositoryRoot,
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  if (result.error) throw new Error(`${label} could not start: ${result.error.message}`)
  if (result.status !== 0) {
    const details = `${result.stderr ?? ''}\n${result.stdout ?? ''}`.trim()
    fail(`${label} rejected the package input${details ? `:\n${details}` : '.'}`)
  }
}

const isStrictDescendant = (base: string, candidate: string) => {
  const rel = relative(resolve(base), resolve(candidate))
  return rel !== '' && rel !== '..' && !rel.startsWith(`..${sep}`) && !isAbsolute(rel)
}

const assertNoSymlinkComponents = (base: string, target: string, allowMissingTail: boolean) => {
  const resolvedBase = resolve(base)
  const resolvedTarget = resolve(target)
  const rel = relative(resolvedBase, resolvedTarget)
  if (rel === '..' || rel.startsWith(`..${sep}`) || isAbsolute(rel)) {
    fail(`Path escapes its trusted base ${resolvedBase}: ${resolvedTarget}`)
  }
  let cursor = resolvedBase
  if (lstatSync(cursor).isSymbolicLink()) fail(`Trusted path base must not be a symlink: ${cursor}`)
  for (const segment of rel.split(sep).filter(Boolean)) {
    cursor = resolve(cursor, segment)
    if (!existsSync(cursor)) {
      if (allowMissingTail) return
      fail(`Required path component does not exist: ${cursor}`)
    }
    if (lstatSync(cursor).isSymbolicLink()) fail(`Symlink path component is forbidden: ${cursor}`)
  }
}

const resolveRepositoryFile = (repositoryRoot: string, repositoryPath: string, label: string) => {
  assertSafePackagePath(repositoryPath, `${label} repository path`)
  const path = resolve(repositoryRoot, repositoryPath)
  assertNoSymlinkComponents(repositoryRoot, path, false)
  const metadata = lstatSync(path)
  if (!metadata.isFile() || metadata.isSymbolicLink()) fail(`${label} must be a regular non-symlink file: ${repositoryPath}`)
  return path
}

const fileIntegrity = (path: string) => {
  const before = lstatSync(path)
  if (!before.isFile() || before.isSymbolicLink()) fail(`Expected a regular non-symlink file: ${path}`)
  const descriptor = openSync(path, constants.O_RDONLY | constants.O_NOFOLLOW)
  const chunk = Buffer.allocUnsafe(8 * 1024 * 1024)
  const hash = createHash('sha256')
  let checksum = 0
  let bytes = 0
  try {
    const opened = fstatSync(descriptor)
    if (!opened.isFile() || opened.dev !== before.dev || opened.ino !== before.ino) {
      fail(`File identity changed while opening integrity source: ${path}`)
    }
    while (true) {
      const count = readSync(descriptor, chunk, 0, chunk.length, null)
      if (count === 0) break
      const data = chunk.subarray(0, count)
      hash.update(data)
      checksum = crc32(data, checksum) >>> 0
      bytes += count
    }
  } finally {
    closeSync(descriptor)
  }
  const after = lstatSync(path)
  if (!after.isFile() || after.isSymbolicLink() || after.dev !== before.dev || after.ino !== before.ino) {
    fail(`File identity changed while reading integrity source: ${path}`)
  }
  return { bytes, sha256: hash.digest('hex'), crc32: checksum }
}

const inlineIntegrity = (content: Buffer) => ({
  bytes: content.length,
  sha256: createHash('sha256').update(content).digest('hex'),
  crc32: crc32(content) >>> 0,
})

const sourceEntry = (relativePath: string, sourcePath: string): FullStandalonePackageEntry => {
  assertSafePackagePath(relativePath)
  return { relativePath, sourcePath, ...fileIntegrity(sourcePath) }
}

const inlineEntry = (relativePath: string, content: Buffer): FullStandalonePackageEntry => {
  assertSafePackagePath(relativePath)
  return { relativePath, content, ...inlineIntegrity(content) }
}

const copyVerifiedSource = (entry: FullStandalonePackageEntry, target: string) => {
  const sourcePath = entry.sourcePath ?? fail(`Package source entry lacks a source path: ${entry.relativePath}`)
  const before = lstatSync(sourcePath)
  if (!before.isFile() || before.isSymbolicLink()) fail(`Package source must be a regular non-symlink file: ${entry.relativePath}`)
  const sourceDescriptor = openSync(sourcePath, constants.O_RDONLY | constants.O_NOFOLLOW)
  let targetDescriptor: number | null = null
  const chunk = Buffer.allocUnsafe(8 * 1024 * 1024)
  const hash = createHash('sha256')
  let checksum = 0
  let copied = 0
  try {
    const opened = fstatSync(sourceDescriptor)
    if (!opened.isFile() || opened.dev !== before.dev || opened.ino !== before.ino) {
      fail(`Package source identity changed while opening: ${entry.relativePath}`)
    }
    targetDescriptor = openSync(target, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL, 0o644)
    while (true) {
      const count = readSync(sourceDescriptor, chunk, 0, chunk.length, null)
      if (count === 0) break
      const data = chunk.subarray(0, count)
      hash.update(data)
      checksum = crc32(data, checksum) >>> 0
      let offset = 0
      while (offset < data.length) {
        const written = writeSync(targetDescriptor, data, offset, data.length - offset)
        if (written <= 0) fail(`Failed to make progress copying package source: ${entry.relativePath}`)
        offset += written
      }
      copied += count
    }
  } catch (error) {
    if (targetDescriptor !== null) closeSync(targetDescriptor)
    closeSync(sourceDescriptor)
    rmSync(target, { force: true })
    throw error
  }
  if (targetDescriptor !== null) closeSync(targetDescriptor)
  closeSync(sourceDescriptor)
  const after = lstatSync(sourcePath)
  if (
    !after.isFile()
    || after.isSymbolicLink()
    || after.dev !== before.dev
    || after.ino !== before.ino
    || copied !== entry.bytes
    || hash.digest('hex') !== entry.sha256
    || checksum !== entry.crc32
  ) {
    rmSync(target, { force: true })
    fail(`Package source changed while copying: ${entry.relativePath}`)
  }
}

const walkReleaseFiles = (releaseRoot: string) => {
  const result: string[] = []
  const walk = (directory: string) => {
    readdirSync(directory, { withFileTypes: true })
      .sort((left, right) => compareCodeUnits(left.name, right.name))
      .forEach((item) => {
        const absolute = resolve(directory, item.name)
        if (item.isSymbolicLink()) fail(`Release model contains a symlink: ${absolute}`)
        if (item.isDirectory()) {
          walk(absolute)
        } else if (item.isFile()) {
          const path = relative(releaseRoot, absolute).split(sep).join('/')
          assertSafePackagePath(path, 'release-model path')
          result.push(path)
        } else {
          fail(`Release model contains a non-regular filesystem entry: ${absolute}`)
        }
      })
  }
  walk(releaseRoot)
  return result.sort(compareCodeUnits)
}

const addEntry = (entries: Map<string, FullStandalonePackageEntry>, entry: FullStandalonePackageEntry) => {
  if (entries.has(entry.relativePath)) fail(`Duplicate package path: ${entry.relativePath}`)
  const key = portablePathKey(entry.relativePath)
  const collision = [...entries.keys()].find((path) => portablePathKey(path) === key)
  if (collision) fail(`Portable package-path collision: ${collision} and ${entry.relativePath}`)
  const prefixCollision = [...entries.keys()].find((path) => {
    const existingKey = portablePathKey(path)
    return key.startsWith(`${existingKey}/`) || existingKey.startsWith(`${key}/`)
  })
  if (prefixCollision) fail(`Package file/directory prefix collision: ${prefixCollision} and ${entry.relativePath}`)
  entries.set(entry.relativePath, entry)
}

const runtimeRequiredFor = (profile: RoleProfile, explicit?: boolean) => {
  if (profile.runtimeRequired === 'required') {
    if (explicit === false) fail(`Role ${profile.role} requires runtimeRequired=true.`)
    return true
  }
  if (profile.runtimeRequired === 'forbidden') {
    if (explicit === true) fail(`Role ${profile.role} requires runtimeRequired=false.`)
    return false
  }
  if (explicit === undefined) fail(`Role ${profile.role} requires an explicit runtimeRequired value.`)
  return explicit
}

const releaseRoleFromPath = (path: string): string | null => {
  if (/^data\/canonical\/.+\.landscape\.json$/u.test(path)) return 'canonical-landscape'
  if (path === 'data/cards/card-index.json') return 'card-index'
  if (/^data\/cards\/.+\.json$/u.test(path)) return 'card-deck'
  if (path === 'data/views/index.json') return 'composition-view-index'
  if (/^data\/views\/.+\.view\.json$/u.test(path)) return 'composition-view'
  if (path === 'data/resources/resource-index.json') return 'resource-index'
  if (path === 'data/runtime/catalog.json') return 'runtime-catalog'
  if (path === 'data/runtime/dependency-closure.json') return 'dependency-closure'
  if (path === 'data/runtime/migration-aliases.json') return 'migration-aliases'
  if (/^data\/dependencies\/.+\.json$/u.test(path)) return 'embedded-goal-dependency'
  if (/^data\/mappings\/.+\.json$/u.test(path)) return 'mapping'
  if (path === 'data/sources/source-index.json') return 'source-index'
  if (path === 'data/sources/source-goal-references.json') return 'source-goal-reference-index'
  if (/^metadata\/quality\/.+\.json$/u.test(path)) return 'quality-evidence'
  return null
}

const logicalArtifactPaths = (
  releaseRoot: string,
  index: SemanticContentIndex,
  runtimeCatalog: JsonObject,
  roles: Map<string, RoleProfile>,
) => {
  const byPath = new Map<string, { logicalId: string; normalizationRole: string; packageRole: string }>()
  const recordsByKey = new Map(index.logicalArtifacts.map((record) => [`${record.role}\0${record.logicalId}`, record]))
  if (recordsByKey.size !== index.logicalArtifacts.length) fail('Semantic content index contains duplicate logical role/ID pairs.')

  const bind = (path: string, packageRole: string, logicalId: string) => {
    assertSafePackagePath(path, 'runtime-catalog artifact path')
    const record = recordsByKey.get(`${packageRole}\0${logicalId}`)
    if (!record) fail(`Semantic content index lacks ${packageRole}/${logicalId} for ${path}.`)
    const role = roles.get(packageRole) ?? fail(`Package profile lacks semantic role ${packageRole}.`)
    const normalizationRoles = role.semanticBinding.allowedNormalizationRoles ?? []
    if (normalizationRoles.length !== 1) fail(`Package role ${packageRole} must select exactly one normalization role.`)
    if (byPath.has(path)) fail(`Runtime catalog maps multiple logical artifacts to ${path}.`)
    byPath.set(path, { logicalId, normalizationRole: normalizationRoles[0], packageRole })
  }

  arrayValue<JsonObject>(runtimeCatalog.landscapes, 'runtime catalog landscapes').forEach((raw, indexValue) => {
    const item = objectValue(raw, `runtime catalog landscape ${indexValue}`)
    bind(stringValue(item.artifactPath, 'landscape artifactPath'), 'canonical-landscape', stringValue(item.landscapeId, 'landscapeId'))
  })
  arrayValue<JsonObject>(runtimeCatalog.decks, 'runtime catalog decks').forEach((raw, indexValue) => {
    const item = objectValue(raw, `runtime catalog deck ${indexValue}`)
    const logicalId = `${stringValue(item.deckId, 'deckId')}@${stringValue(item.locale, 'deck locale')}`
    bind(stringValue(item.artifactPath, 'deck artifactPath'), 'card-deck', logicalId)
  })
  arrayValue<JsonObject>(runtimeCatalog.views, 'runtime catalog views').forEach((raw, indexValue) => {
    const item = objectValue(raw, `runtime catalog view ${indexValue}`)
    bind(stringValue(item.artifactPath, 'view artifactPath'), 'composition-view', stringValue(item.viewId, 'viewId'))
  })

  const artifactIndexes = objectValue(runtimeCatalog.artifactIndexes, 'runtime catalog artifactIndexes')
  const singletonPaths: Array<[string, string, string | undefined]> = [
    [stringValue(artifactIndexes.cardsPath, 'cardsPath'), 'card-index', undefined],
    [stringValue(artifactIndexes.compositionViewsPath, 'compositionViewsPath'), 'composition-view-index', undefined],
    [stringValue(artifactIndexes.migrationAliasesPath, 'migrationAliasesPath'), 'migration-aliases', undefined],
    [stringValue(artifactIndexes.resourcesPath, 'resourcesPath'), 'resource-index', undefined],
    [stringValue(objectValue(runtimeCatalog.dependencyClosure, 'dependencyClosure').path, 'dependencyClosure.path'), 'dependency-closure', undefined],
    ['data/runtime/catalog.json', 'runtime-catalog', undefined],
  ]

  const releasePaths = walkReleaseFiles(releaseRoot)
  const inferredRoles = new Map<string, string>()
  releasePaths.forEach((path) => {
    const role = releaseRoleFromPath(path)
    if (role) inferredRoles.set(path, role)
  })
  ;['mapping', 'source-index', 'source-goal-reference-index', 'quality-evidence', 'embedded-goal-dependency']
    .forEach((packageRole) => {
      [...inferredRoles.entries()]
        .filter(([, role]) => role === packageRole)
        .forEach(([path]) => {
          const candidates = index.logicalArtifacts.filter((record) => record.role === packageRole)
          if (candidates.length !== 1) {
            fail(`Cannot bind ${path}: package role ${packageRole} has ${candidates.length} semantic records.`)
          }
          singletonPaths.push([path, packageRole, candidates[0].logicalId])
        })
    })

  singletonPaths.forEach(([path, packageRole, selectedLogicalId]) => {
    if (byPath.has(path)) return
    const candidates = index.logicalArtifacts.filter((record) => record.role === packageRole)
    const logicalId = selectedLogicalId ?? (candidates.length === 1 ? candidates[0].logicalId : null)
    if (!logicalId) fail(`Package role ${packageRole} is not a singleton and has no catalog mapping.`)
    bind(path, packageRole, logicalId)
  })

  const boundKeys = new Set([...byPath.values()].map((item) => `${item.packageRole}\0${item.logicalId}`))
  const missing = index.logicalArtifacts.filter((record) => !boundKeys.has(`${record.role}\0${record.logicalId}`))
  if (missing.length > 0) {
    fail(`Semantic content index records are not bound to release files: ${missing.slice(0, 5).map((item) => `${item.role}/${item.logicalId}`).join(', ')}`)
  }
  return byPath
}

const mediaTypeForPath = (path: string) => {
  if (path.endsWith('.schema.json')) return 'application/schema+json'
  if (path.endsWith('.json')) return 'application/json'
  if (path.endsWith('.md')) return 'text/markdown'
  if (path.endsWith('.txt') || basename(path) === 'LICENSE') return 'text/plain'
  if (path.endsWith('.jpg') || path.endsWith('.jpeg')) return 'image/jpeg'
  if (path.endsWith('.png')) return 'image/png'
  fail(`No closed media-type mapping for ${path}.`)
}

const schemaIdFromJsonFile = (path: string, label: string) => {
  const value = readJson<JsonObject>(path, label)
  return stringValue(value.$schema, `${label} $schema`)
}

const profileRoleMap = (profile: FullStandaloneProfile) => {
  const map = new Map(profile.roles.map((role) => [role.role, role]))
  if (map.size !== profile.roles.length) fail('Full-standalone profile contains duplicate role declarations.')
  return map
}

const assertSchemaClosure = (schemas: Array<{ id: string; sourcePath: string }>) => {
  const ids = new Set(schemas.map((schema) => schema.id))
  schemas.forEach((schema) => {
    const document = readJson<JsonObject>(schema.sourcePath, `trusted schema ${schema.id}`)
    if (document.$id !== schema.id) fail(`Trusted schema ID mismatch in ${schema.sourcePath}.`)
    if (document.$schema !== 'https://json-schema.org/draft/2020-12/schema') {
      fail(`Trusted schema ${schema.id} is not Draft 2020-12.`)
    }
    const visit = (value: unknown) => {
      if (Array.isArray(value)) return value.forEach(visit)
      if (value === null || typeof value !== 'object') return
      Object.entries(value as JsonObject).forEach(([key, child]) => {
        if (key === '$ref' && typeof child === 'string' && !child.startsWith('#')) {
          const target = child.split('#', 1)[0]
          if (target.startsWith('https://skillpilot.com/schemas/') && !ids.has(target)) {
            fail(`Trusted schema ${schema.id} has an uncataloged package-schema reference: ${child}`)
          }
        }
        visit(child)
      })
    }
    visit(document)
  })
}

const assertDecisionState = (decision: ClassDecision | AssetDecision, label: string) => {
  const evidence = decision.reviewEvidence ?? []
  if (!Array.isArray(evidence)) fail(`${label} reviewEvidence must be an array.`)
  if (decision.decisionStatus === 'pending-human-review') {
    if (
      decision.redistributionStatus !== 'review-required'
      || decision.licenseExpression !== null
      || decision.reviewer != null
      || decision.reviewedAt != null
      || evidence.length !== 0
    ) fail(`${label} has a forged or inconsistent pending decision.`)
    return
  }
  if (decision.decisionStatus === 'automatic-allowed') {
    if (
      decision.redistributionStatus !== 'allowed'
      || decision.licenseExpression !== 'Apache-2.0'
      || decision.reviewer != null
      || decision.reviewedAt != null
      || evidence.length === 0
    ) fail(`${label} has an inconsistent automatic decision.`)
    return
  }
  if (decision.decisionStatus === 'human-approved') {
    if (
      decision.redistributionStatus !== 'allowed'
      || !decision.licenseExpression
      || typeof decision.reviewer !== 'string'
      || decision.reviewer.trim() === ''
      || typeof decision.reviewedAt !== 'string'
      || decision.reviewedAt.trim() === ''
      || evidence.length === 0
    ) fail(`${label} has an incomplete human approval.`)
    return
  }
  if (decision.decisionStatus === 'prohibited') {
    if (
      decision.redistributionStatus !== 'prohibited'
      || decision.licenseExpression !== null
      || typeof decision.reviewer !== 'string'
      || decision.reviewer.trim() === ''
      || typeof decision.reviewedAt !== 'string'
      || decision.reviewedAt.trim() === ''
      || evidence.length === 0
    ) fail(`${label} has an incomplete prohibited decision.`)
    return
  }
  fail(`${label} has an unknown decisionStatus: ${decision.decisionStatus}`)
}

const assertRedistributionReviewDerivedState = (
  review: RedistributionReview,
  expectedExternalResourceCount: number,
) => {
  review.classDecisions.forEach((decision) => assertDecisionState(decision, `class decision ${decision.classId}`))
  review.assetDecisions.forEach((decision) => assertDecisionState(decision, `asset decision ${decision.resourceId}`))
  const all = [...review.classDecisions, ...review.assetDecisions]
  const count = (values: Array<ClassDecision | AssetDecision>, status: string) => (
    values.filter((decision) => decision.decisionStatus === status).length
  )
  const expected = {
    classDecisionCount: review.classDecisions.length,
    automaticAllowedClassCount: count(review.classDecisions, 'automatic-allowed'),
    pendingClassCount: count(review.classDecisions, 'pending-human-review'),
    humanApprovedClassCount: count(review.classDecisions, 'human-approved'),
    prohibitedClassCount: count(review.classDecisions, 'prohibited'),
    assetCount: review.assetDecisions.length,
    userProvidedAssetCount: review.assetDecisions.filter((decision) => (
      (decision as AssetDecision & { userProvided?: boolean }).userProvided === true
    )).length,
    pendingAssetCount: count(review.assetDecisions, 'pending-human-review'),
    humanApprovedAssetCount: count(review.assetDecisions, 'human-approved'),
    prohibitedAssetCount: count(review.assetDecisions, 'prohibited'),
    externalResourceCount: expectedExternalResourceCount,
  }
  const humanReviewItemCount = expected.pendingClassCount + expected.pendingAssetCount
  const publicationReady = humanReviewItemCount === 0
    && expected.prohibitedClassCount === 0
    && expected.prohibitedAssetCount === 0
    && all.every((decision) => decision.redistributionStatus === 'allowed')
  Object.entries(expected).forEach(([key, value]) => {
    if ((review.summary as unknown as JsonObject)[key] !== value) fail(`Redistribution summary ${key} is forged or stale.`)
  })
  if (
    review.summary.humanReviewItemCount !== humanReviewItemCount
    || review.summary.publicationReady !== publicationReady
  ) fail('Redistribution summary readiness is forged or stale.')
  const override = review.pathClassificationOverrides[0]
  if (
    review.pathClassificationOverrides.length !== 1
    || Object.keys(override).sort(compareCodeUnits).join('\n') !== [
      'classId',
      'pathPrefix',
      'provenanceClass',
      'role',
    ].join('\n')
    || override.role !== 'package-documentation'
    || override.pathPrefix !== 'data/assessment-sources/'
    || override.classId !== 'skillpilot-data'
    || override.provenanceClass !== 'skillpilot-authored'
  ) {
    fail('Redistribution path-classification overrides differ from the closed package policy.')
  }
}

const parseLicenseExpression = (expression: string) => {
  const tokens: string[] = []
  let position = 0
  while (position < expression.length) {
    if (/\s/u.test(expression[position])) {
      position += 1
      continue
    }
    LICENSE_TOKEN_PATTERN.lastIndex = position
    const match = LICENSE_TOKEN_PATTERN.exec(expression)
    if (!match) fail(`Unsupported license-expression token at offset ${position}: ${expression}`)
    tokens.push(match[0])
    position = LICENSE_TOKEN_PATTERN.lastIndex
  }
  if (tokens.length === 0) fail('License expression must not be empty.')
  const identifiers = new Set<string>()
  let cursor = 0
  const parseFactor = (): void => {
    if (cursor >= tokens.length) fail(`Expected license identifier in expression: ${expression}`)
    if (tokens[cursor] === '(') {
      cursor += 1
      parseOr()
      if (tokens[cursor] !== ')') fail(`Unclosed license-expression parenthesis: ${expression}`)
      cursor += 1
      return
    }
    const token = tokens[cursor]
    if (['AND', 'OR', 'WITH', ')'].includes(token)) fail(`Expected license identifier, found ${token}.`)
    identifiers.add(token)
    cursor += 1
    if (tokens[cursor] === 'WITH') {
      cursor += 1
      const exception = tokens[cursor]
      if (!exception || ['AND', 'OR', 'WITH', '(', ')'].includes(exception)) {
        fail(`WITH must be followed by an exception identifier: ${expression}`)
      }
      identifiers.add(exception)
      cursor += 1
    }
  }
  const parseAnd = (): void => {
    parseFactor()
    while (tokens[cursor] === 'AND') {
      cursor += 1
      parseFactor()
    }
  }
  const parseOr = (): void => {
    parseAnd()
    while (tokens[cursor] === 'OR') {
      cursor += 1
      parseAnd()
    }
  }
  parseOr()
  if (cursor !== tokens.length) fail(`Unexpected license-expression token ${tokens[cursor]}.`)
  return identifiers
}

const decisionClassifier = (review: RedistributionReview, expectedExternalResourceCount: number) => {
  assertRedistributionReviewDerivedState(review, expectedExternalResourceCount)
  const classById = new Map(review.classDecisions.map((decision) => [decision.classId, decision]))
  if (classById.size !== review.classDecisions.length) fail('Redistribution review contains duplicate class decisions.')

  const classify = (role: string, path: string) => {
    const overrides = review.pathClassificationOverrides
      .filter((override) => override.role === role && path.startsWith(override.pathPrefix))
      .sort((left, right) => right.pathPrefix.length - left.pathPrefix.length)
    if (overrides.length > 1 && overrides[0].pathPrefix.length === overrides[1].pathPrefix.length) {
      fail(`Ambiguous redistribution path classification for ${path}.`)
    }
    const override = overrides[0]
    const candidates = override
      ? [classById.get(override.classId)].filter((item): item is ClassDecision => item !== undefined)
      : review.classDecisions.filter((decision) => decision.artifactRoles.includes(role))
    if (candidates.length !== 1) fail(`Role/path ${role}/${path} has ${candidates.length} redistribution class decisions.`)
    const decision = candidates[0]
    if (override && decision.provenanceClass !== override.provenanceClass) {
      fail(`Redistribution override provenance mismatch for ${path}.`)
    }
    if (decision.redistributionStatus === 'allowed' && !decision.licenseExpression) {
      fail(`Allowed redistribution decision lacks a license expression: ${decision.classId}`)
    }
    if (decision.redistributionStatus !== 'allowed' && decision.licenseExpression !== null) {
      fail(`Uncleared redistribution decision must not claim a license expression: ${decision.classId}`)
    }
    return decision
  }
  return classify
}

const attachManifestFile = (
  entry: FullStandalonePackageEntry,
  role: RoleProfile,
  decision: Pick<ClassDecision | AssetDecision, 'licenseExpression' | 'provenanceClass' | 'redistributionStatus'>,
  semanticBinding: FileSemanticBinding,
  validationSchemaId?: string,
  explicitRuntimeRequired?: boolean,
) => {
  const runtimeRequired = runtimeRequiredFor(role, explicitRuntimeRequired)
  const mediaType = mediaTypeForPath(entry.relativePath)
  if (!role.mediaTypes.includes(mediaType)) fail(`Role ${role.role} does not permit ${mediaType} for ${entry.relativePath}.`)
  if (role.validationSchemaIds.length > 0) {
    if (!validationSchemaId || !role.validationSchemaIds.includes(validationSchemaId)) {
      fail(`Role ${role.role} requires an exact validationSchemaId for ${entry.relativePath}.`)
    }
  } else if (validationSchemaId !== undefined) {
    fail(`Role ${role.role} forbids validationSchemaId for ${entry.relativePath}.`)
  }
  entry.manifestFile = {
    path: entry.relativePath,
    role: role.role,
    mediaType,
    bytes: entry.bytes,
    sha256: entry.sha256,
    runtimeRequired,
    ...(validationSchemaId ? { validationSchemaId } : {}),
    licenseExpression: decision.licenseExpression,
    provenanceClass: decision.provenanceClass,
    redistributionStatus: decision.redistributionStatus,
    semanticBinding,
  }
}

const defaultArchiveRoot = (packageVersion: string) => `skillpilot-curriculum-de-gymnasium-mathematik-${packageVersion}.json`

const assertArchiveRoot = (archiveRoot: string) => {
  if (
    archiveRoot.length > 180
    || !ARCHIVE_ROOT_PATTERN.test(archiveRoot)
    || archiveRoot.endsWith('.')
    || archiveRoot.endsWith(' ')
    || WINDOWS_RESERVED_SEGMENT.test(archiveRoot)
  ) {
    fail(`Unsafe or non-portable archive root: ${archiveRoot}`)
  }
}

const buildReadme = (params: {
  releaseId: string
  packageId: string
  packageVersion: string
  contentDigest: string
  publicationReady: boolean
  humanReviewItemCount: number
  sourceVerificationPendingCount: number
}) => Buffer.from(`# SkillPilot curriculum package: Mathematik (Gymnasium, DE)

This directory is the JSON runtime variant of \`${params.releaseId}\`.

- Package ID: \`${params.packageId}\`
- Package version: \`${params.packageVersion}\`
- Semantic content digest: \`${params.contentDigest}\`
- Runtime entry point: \`data/runtime/catalog.json\`
- Release profile: \`full-standalone-v1\`
- Redistribution review ready: \`${params.publicationReady}\`
- Open redistribution review items: \`${params.humanReviewItemCount}\`
- Open source-text verification items: \`${params.sourceVerificationPendingCount}\`

The package is self-contained at the file level. Consumers must validate \`metadata/manifest.json\`, \`metadata/SHA256SUMS\`, the package-local schema catalog, and all runtime closure rules before installation. A technically valid candidate with pending redistribution decisions is not approved for public release.
`, 'utf8')

const validateManifestPlanAgainstProfile = (
  entries: FullStandalonePackageEntry[],
  profile: FullStandaloneProfile,
) => {
  const roleMap = profileRoleMap(profile)
  const files = entries.flatMap((entry) => entry.manifestFile ? [entry.manifestFile] : [])
  if (files.length > profile.manifestLimits.fileRecords) fail('Manifest file-record count exceeds the release profile limit.')
  if (files.length !== entries.length) fail('Internal error: a non-excluded package entry lacks a manifest file record.')
  const counts = new Map<string, number>()
  files.forEach((file) => {
    const role = roleMap.get(file.role)
    if (!role) fail(`Manifest uses an unknown role: ${file.role}`)
    counts.set(file.role, (counts.get(file.role) ?? 0) + 1)
    if (!role.mediaTypes.includes(file.mediaType)) fail(`Manifest media type violates role ${file.role}: ${file.path}`)
    if (role.runtimeRequired === 'required' && !file.runtimeRequired) fail(`Manifest runtimeRequired violates role ${file.role}: ${file.path}`)
    if (role.runtimeRequired === 'forbidden' && file.runtimeRequired) fail(`Manifest runtimeRequired violates role ${file.role}: ${file.path}`)
    if (file.semanticBinding.kind !== role.semanticBinding.kind) fail(`Manifest semantic binding violates role ${file.role}: ${file.path}`)
    if (file.semanticBinding.kind === 'logical-artifact') {
      if (!role.semanticBinding.allowedNormalizationRoles?.includes(file.semanticBinding.normalizationRole)) {
        fail(`Manifest normalization role violates ${file.role}: ${file.path}`)
      }
    }
    if (role.validationSchemaIds.length > 0 && !role.validationSchemaIds.includes(file.validationSchemaId ?? '')) {
      fail(`Manifest validation schema violates role ${file.role}: ${file.path}`)
    }
    if (role.validationSchemaIds.length === 0 && file.validationSchemaId !== undefined) {
      fail(`Manifest unexpectedly assigns a schema to ${file.role}: ${file.path}`)
    }
  })
  profile.roles.forEach((role) => {
    const count = counts.get(role.role) ?? 0
    if (count < (role.minimum ?? 0)) fail(`Role ${role.role} requires at least ${role.minimum} files; planned ${count}.`)
    if (role.maximum !== undefined && count > role.maximum) fail(`Role ${role.role} allows at most ${role.maximum} files; planned ${count}.`)
  })
}

const schemaBindingId = (document: JsonObject, bindingName: typeof EXPECTED_SEMANTIC_BINDING_NAMES[number]) => {
  if (bindingName === 'fieldSemanticsRegistry') return stringValue(document.registryId, `${bindingName} registryId`)
  return stringValue(document.profileId, `${bindingName} profileId`)
}

export const createFullStandalonePackagePlan = (
  options: FullStandalonePackagePlanOptions,
): FullStandalonePackagePlan => {
  const repositoryRoot = resolve(options.repositoryRoot ?? defaultRepositoryRoot)
  const repositoryTmp = resolve(repositoryRoot, 'tmp')
  const releaseRoot = resolve(repositoryRoot, options.releaseRoot)
  if (!isStrictDescendant(repositoryTmp, releaseRoot)) fail(`Release root must be a strict descendant of ${repositoryTmp}.`)
  assertNoSymlinkComponents(repositoryRoot, releaseRoot, false)
  if (!lstatSync(releaseRoot).isDirectory()) fail(`Release root is not a directory: ${releaseRoot}`)

  const profileRepositoryPath = options.fullStandaloneProfilePath ?? DEFAULT_PROFILE_PATH
  const profilePath = resolveRepositoryFile(repositoryRoot, profileRepositoryPath, 'full-standalone release profile')
  const profile = readJson<FullStandaloneProfile>(profilePath, 'full-standalone release profile')
  if (profile.profileFormatVersion !== 1 || profile.profileId !== 'full-standalone-v1') fail('Unsupported full-standalone release profile identity.')
  if (profile.compatibility.variant !== 'json') fail('Full-standalone profile variant must be json.')
  const expectedSchemaCount = options.expectedTrustedSchemaCount ?? 22
  if (profile.trustedContractSchemas.length !== expectedSchemaCount) {
    fail(`Expected ${expectedSchemaCount} complete trusted schemas, profile declares ${profile.trustedContractSchemas.length}.`)
  }
  if (profile.semanticContractBindings.length !== EXPECTED_SEMANTIC_BINDING_NAMES.length) {
    fail('Full-standalone profile must declare exactly five semantic contract bindings.')
  }
  EXPECTED_SEMANTIC_BINDING_NAMES.forEach((name) => {
    if (profile.semanticContractBindings.filter((binding) => binding.bindingName === name).length !== 1) {
      fail(`Full-standalone profile must declare semantic binding ${name} exactly once.`)
    }
  })

  const roleMap = profileRoleMap(profile)
  const requiredRole = (role: string) => roleMap.get(role) ?? fail(`Full-standalone profile lacks role ${role}.`)
  const releaseFiles = walkReleaseFiles(releaseRoot)
  const releaseFileSet = new Set(releaseFiles)
  const requireReleaseFile = (path: string) => {
    assertSafePackagePath(path, 'release-model path')
    if (!releaseFileSet.has(path)) fail(`Release model is missing ${path}.`)
    return resolve(releaseRoot, path)
  }

  const semanticIndexPath = requireReleaseFile('metadata/semantic-content-index.json')
  const buildInputsPath = requireReleaseFile('metadata/build-inputs.json')
  const conformancePath = requireReleaseFile('metadata/release-model-conformance.json')
  const resourceIndexPath = requireReleaseFile('data/resources/resource-index.json')
  const runtimeCatalogPath = requireReleaseFile('data/runtime/catalog.json')
  const semanticIndex = readJson<SemanticContentIndex>(semanticIndexPath, 'semantic content index')
  const buildInputs = readJson<ReleaseBuildInputs>(buildInputsPath, 'release build inputs')
  const conformance = readJson<JsonObject>(conformancePath, 'release-model conformance report')
  const resourceIndex = readJson<JsonObject>(resourceIndexPath, 'resource index')
  const runtimeCatalog = readJson<JsonObject>(runtimeCatalogPath, 'runtime catalog')
  if (!SHA256_DIGEST_PATTERN.test(semanticIndex.contentDigest)) fail('Semantic content index has an invalid contentDigest.')
  if (conformance.contentDigest !== semanticIndex.contentDigest || conformance.passed !== true) {
    fail('Release-model conformance report is not passed or does not bind the semantic content digest.')
  }

  const buildProfilePath = resolveRepositoryFile(repositoryRoot, buildInputs.profilePath, 'release-model build profile')
  const buildProfileIntegrity = fileIntegrity(buildProfilePath)
  if (buildProfileIntegrity.sha256 !== buildInputs.profileSha256) fail('Release-model build profile hash drift.')
  const buildProfile = readJson<JsonObject>(buildProfilePath, 'release-model build profile')
  const packageDefinition = objectValue(buildProfile.package, 'release-model build profile package')
  const contractDefinition = objectValue(buildProfile.contracts, 'release-model build profile contracts')
  const packageId = stringValue(packageDefinition.packageId, 'packageId')
  const packageVersion = stringValue(packageDefinition.packageVersion, 'packageVersion')
  const releaseId = stringValue(packageDefinition.releaseId, 'releaseId')
  const curriculumEdition = stringValue(packageDefinition.curriculumEdition, 'curriculumEdition')
  if (
    conformance.packageId !== packageId
    || conformance.packageVersion !== packageVersion
    || conformance.releaseId !== releaseId
    || conformance.curriculumEdition !== curriculumEdition
    || conformance.profileId !== buildProfile.profileId
  ) {
    fail('Release-model conformance identity does not match its pinned build profile.')
  }
  if (contractDefinition.runtimeContractVersion !== profile.compatibility.runtimeContractVersion) {
    fail('Release model and package profile runtime contract versions differ.')
  }

  const fixtureOnly = options.fixtureOnly === true
  if (fixtureOnly) {
    const trustedFixtureParent = resolve(defaultRepositoryRoot, 'tmp')
    if (
      !isStrictDescendant(trustedFixtureParent, repositoryRoot)
      || !basename(repositoryRoot).startsWith('full-package-builder-self-test.')
      || !stringValue(buildProfile.profileId, 'fixture profileId').startsWith('fixture-')
      || !packageVersion.includes('-fixture.')
    ) {
      fail('fixtureOnly is restricted to the synthetic builder self-test repository and fixture identity.')
    }
  } else if (
    isStrictDescendant(resolve(defaultRepositoryRoot, 'tmp'), repositoryRoot)
    && basename(repositoryRoot).startsWith('full-package-builder-self-test.')
    && stringValue(buildProfile.profileId, 'fixture profileId').startsWith('fixture-')
  ) {
    fail('Synthetic builder fixtures require fixtureOnly; external security gates cannot be omitted implicitly.')
  }

  const archiveRoot = options.archiveRoot ?? defaultArchiveRoot(packageVersion)
  assertArchiveRoot(archiveRoot)
  const reviewRepositoryPath = options.redistributionReviewPath ?? DEFAULT_REVIEW_PATH
  const reviewPath = resolveRepositoryFile(repositoryRoot, reviewRepositoryPath, 'redistribution review')
  const sourceVerificationReviewRepositoryPath = options.sourceVerificationReviewPath ?? DEFAULT_SOURCE_VERIFICATION_REVIEW_PATH
  const sourceVerificationReportRepositoryPath = options.sourceVerificationReportPath ?? DEFAULT_SOURCE_VERIFICATION_REPORT_PATH
  const sourceVerificationReviewPath = fixtureOnly ? null : resolveRepositoryFile(
    repositoryRoot,
    sourceVerificationReviewRepositoryPath,
    'source-verification review',
  )
  const sourceVerificationReportPath = fixtureOnly ? null : resolveRepositoryFile(
    repositoryRoot,
    sourceVerificationReportRepositoryPath,
    'source-verification status report',
  )
  if (!fixtureOnly) {
    runTrustedProcess(
      repositoryRoot,
      REDISTRIBUTION_REVIEW_CHECKER_PATH,
      [
        '--check',
        '--release-root', releaseRoot,
        '--ledger', reviewPath,
        '--schema', resolve(repositoryRoot, 'contracts/curriculum-package/v1/package-redistribution-review.schema.json'),
      ],
      'redistribution review checker',
    )
    runTrustedProcess(
      repositoryRoot,
      SOURCE_VERIFICATION_CHECKER_PATH,
      sourceVerificationCheckerArguments(
        repositoryRelativePath(repositoryRoot, sourceVerificationReviewPath as string, 'source-verification review'),
        repositoryRelativePath(repositoryRoot, sourceVerificationReportPath as string, 'source-verification report'),
        process.env.SKILLPILOT_SOURCE_PDF_MODE,
      ),
      'source-verification checker',
    )
    runTrustedProcess(
      repositoryRoot,
      RELEASE_MODEL_VALIDATOR_PATH,
      ['--profile', buildProfilePath, '--release-root', releaseRoot, '--skip-adversarial-self-tests'],
      'independent release-model semantic preflight',
    )
  }
  const review = readJson<RedistributionReview>(reviewPath, 'redistribution review')
  const profileIntegrity = fileIntegrity(profilePath)
  if (
    review.packageId !== packageId
    || review.contentDigest !== semanticIndex.contentDigest
    || review.sourceReleaseModel.releaseId !== releaseId
    || review.sourceReleaseModel.profileId !== buildProfile.profileId
    || review.targetReleaseProfile.profileId !== profile.profileId
    || review.targetReleaseProfile.path !== profileRepositoryPath
    || withoutDigestPrefix(review.targetReleaseProfile.sha256, 'review target profile sha256') !== profileIntegrity.sha256
  ) {
    fail('Redistribution review is stale for the selected release model or package profile.')
  }
  const expectedNonBinaryRoles = profile.roles.map((role) => role.role).filter((role) => role !== 'binary-asset').sort(compareCodeUnits)
  if (JSON.stringify([...review.targetReleaseProfile.nonBinaryRoles].sort(compareCodeUnits)) !== JSON.stringify(expectedNonBinaryRoles)) {
    fail('Redistribution review non-binary role set differs from the selected package profile.')
  }
  const releaseResourceIntegrity = fileIntegrity(resourceIndexPath)
  const releaseBuildInputsIntegrity = fileIntegrity(buildInputsPath)
  if (
    review.sourceReleaseModel.resourceIndexPath !== 'data/resources/resource-index.json'
    || withoutDigestPrefix(review.sourceReleaseModel.resourceIndexSha256, 'review resource index sha256') !== releaseResourceIntegrity.sha256
    || review.sourceReleaseModel.buildInputsPath !== 'metadata/build-inputs.json'
    || withoutDigestPrefix(review.sourceReleaseModel.buildInputsSha256, 'review build inputs sha256') !== releaseBuildInputsIntegrity.sha256
  ) {
    fail('Redistribution review release-model source hashes are stale.')
  }
  const rootLicensePath = resolveRepositoryFile(repositoryRoot, review.rootLicenseEvidence.path, 'root license evidence')
  const rootLicenseIntegrity = fileIntegrity(rootLicensePath)
  if (
    rootLicenseIntegrity.bytes !== review.rootLicenseEvidence.bytes
    || rootLicenseIntegrity.sha256 !== withoutDigestPrefix(review.rootLicenseEvidence.sha256, 'root license evidence sha256')
  ) {
    fail('Root license evidence has drifted.')
  }

  const resourceItems = arrayValue<JsonObject>(resourceIndex.resources, 'resource index resources')
  const expectedExternalResourceCount = resourceItems.filter((item, index) => (
    objectValue(item, `resource index resources[${index}]`).delivery === 'external'
  )).length
  const classify = decisionClassifier(review, expectedExternalResourceCount)
  const entries = new Map<string, FullStandalonePackageEntry>()
  const logicalPaths = logicalArtifactPaths(releaseRoot, semanticIndex, runtimeCatalog, roleMap)
  const assessmentByPath = new Map(buildInputs.assessmentSources.map((item) => [item.artifactPath, item]))
  const consumedAssessmentPaths = new Set<string>()
  if (assessmentByPath.size !== buildInputs.assessmentSources.length) fail('Build inputs contain duplicate assessment artifact paths.')

  releaseFiles.forEach((path) => {
    const entry = sourceEntry(path, resolve(releaseRoot, path))
    const logical = logicalPaths.get(path)
    if (logical) {
      const packageRole = logical.packageRole
      const role = requiredRole(packageRole)
      const schemaId = schemaIdFromJsonFile(entry.sourcePath as string, path)
      attachManifestFile(
        entry,
        role,
        classify(packageRole, path),
        { kind: 'logical-artifact', logicalId: logical.logicalId, normalizationRole: logical.normalizationRole },
        schemaId,
      )
    } else if (path === 'metadata/semantic-content-index.json') {
      const role = requiredRole('semantic-content-index')
      attachManifestFile(entry, role, classify(role.role, path), { kind: 'excluded-generated' }, schemaIdFromJsonFile(entry.sourcePath as string, path))
    } else if (assessmentByPath.has(path)) {
      const expected = assessmentByPath.get(path) as BuildInputAssessment
      if (entry.bytes !== expected.bytes || entry.sha256 !== expected.sha256) fail(`Assessment source drift in release model: ${path}`)
      consumedAssessmentPaths.add(path)
      const role = requiredRole('package-documentation')
      attachManifestFile(entry, role, classify(role.role, path), { kind: 'excluded-generated' })
    } else if (path === 'metadata/build-inputs.json') {
      const role = requiredRole('provenance-report')
      attachManifestFile(entry, role, classify(role.role, path), { kind: 'excluded-generated' })
    } else if (path === 'metadata/field-coverage.json' || path === 'metadata/release-model-conformance.json') {
      const role = requiredRole('validation-report')
      attachManifestFile(entry, role, classify(role.role, path), { kind: 'excluded-generated' })
    } else {
      fail(`Release-model file has no closed package-role mapping: ${path}`)
    }
    addEntry(entries, entry)
  })
  if (logicalPaths.size !== semanticIndex.logicalArtifacts.length) fail('Logical release-path count differs from semantic-content-index count.')
  if (
    JSON.stringify([...consumedAssessmentPaths].sort(compareCodeUnits))
    !== JSON.stringify([...assessmentByPath.keys()].sort(compareCodeUnits))
  ) fail('Assessment-source mapping is incomplete or contains unconsumed build inputs.')

  const embeddedResources = arrayValue<JsonObject>(resourceIndex.resources, 'resource index resources')
    .filter((raw) => objectValue(raw, 'resource record').delivery === 'embedded')
  const resourceById = new Map(embeddedResources.map((raw) => {
    const item = objectValue(raw, 'embedded resource record')
    return [stringValue(item.resourceId, 'resourceId'), item]
  }))
  if (resourceById.size !== embeddedResources.length) fail('Resource index contains duplicate embedded resource IDs.')
  const semanticBinaryById = new Map(semanticIndex.binaryResources.map((resource) => [resource.resourceId, resource]))
  const inputBinaryById = new Map(buildInputs.binaryResources.map((resource) => [resource.resourceId, resource]))
  const reviewAssetById = new Map(review.assetDecisions.map((resource) => [resource.resourceId, resource]))
  if (
    semanticBinaryById.size !== semanticIndex.binaryResources.length
    || inputBinaryById.size !== buildInputs.binaryResources.length
    || reviewAssetById.size !== review.assetDecisions.length
  ) {
    fail('Binary resource IDs must be unique in every release input.')
  }
  const binaryIds = [...semanticBinaryById.keys()].sort(compareCodeUnits)
  for (const set of [resourceById, inputBinaryById, reviewAssetById]) {
    if (JSON.stringify([...set.keys()].sort(compareCodeUnits)) !== JSON.stringify(binaryIds)) {
      fail('Binary resource sets differ between semantic index, resource index, build inputs, and redistribution review.')
    }
  }
  binaryIds.forEach((resourceId) => {
    const semantic = semanticBinaryById.get(resourceId) as BinaryResource
    const input = inputBinaryById.get(resourceId) as BuildInputBinary
    const resource = resourceById.get(resourceId) as JsonObject
    const decision = reviewAssetById.get(resourceId) as AssetDecision
    const canonicalPath = semantic.canonicalReference.startsWith('/') ? semantic.canonicalReference.slice(1) : fail(`Binary canonicalReference must be root-relative: ${resourceId}`)
    const values = [canonicalPath, input.artifactPath, stringValue(resource.artifactPath, 'resource artifactPath'), decision.artifactPath]
    if (!values.every((value) => value === canonicalPath)) fail(`Binary artifact path mismatch for ${resourceId}.`)
    const bytes = [semantic.bytes, input.bytes, resource.bytes, decision.bytes]
    if (!bytes.every((value) => value === semantic.bytes)) fail(`Binary byte-length mismatch for ${resourceId}.`)
    const hashes = [semantic.sha256, input.sha256, resource.sha256, withoutDigestPrefix(decision.assetSha256, 'asset decision sha256')]
    if (!hashes.every((value) => value === semantic.sha256)) fail(`Binary SHA-256 mismatch for ${resourceId}.`)
    const mediaTypes = [semantic.mediaType, input.mediaType ?? semantic.mediaType, resource.mediaType, decision.mediaType]
    if (!mediaTypes.every((value) => value === semantic.mediaType)) fail(`Binary media-type mismatch for ${resourceId}.`)
    const sourcePath = resolveRepositoryFile(repositoryRoot, input.sourcePath, `binary asset ${resourceId}`)
    const entry = sourceEntry(canonicalPath, sourcePath)
    if (entry.bytes !== semantic.bytes || entry.sha256 !== semantic.sha256) fail(`Binary source bytes drifted for ${resourceId}.`)
    const role = requiredRole('binary-asset')
    attachManifestFile(
      entry,
      role,
      decision,
      { kind: 'binary-resource', resourceId },
      undefined,
      booleanValue(resource.runtimeRequired, `resource ${resourceId} runtimeRequired`),
    )
    addEntry(entries, entry)
  })

  const trustedSchemas = profile.trustedContractSchemas.map((binding) => {
    const name = binding.id.split('/').at(-1)
    if (!name) fail(`Trusted schema has an invalid ID: ${binding.id}`)
    const sourcePath = resolveRepositoryFile(repositoryRoot, `contracts/curriculum-package/v1/${name}`, `trusted schema ${binding.id}`)
    const integrity = fileIntegrity(sourcePath)
    if (integrity.sha256 !== binding.sha256) fail(`Trusted schema hash drift: ${binding.id}`)
    return { ...binding, sourcePath, packagePath: `schemas/${name}`, integrity }
  })
  if (new Set(trustedSchemas.map((schema) => schema.id)).size !== trustedSchemas.length) fail('Trusted schema IDs are not unique.')
  if (new Set(trustedSchemas.map((schema) => schema.packagePath)).size !== trustedSchemas.length) fail('Trusted schema package paths are not unique.')
  assertSchemaClosure(trustedSchemas)
  const schemaCatalog = {
    $schema: 'https://skillpilot.com/schemas/curriculum-package/v1/schema-catalog.schema.json',
    catalogFormatVersion: 1,
    entries: trustedSchemas
      .map((schema) => ({
        id: schema.id,
        path: schema.packagePath,
        dialect: 'https://json-schema.org/draft/2020-12/schema',
        bytes: schema.integrity.bytes,
        sha256: schema.integrity.sha256,
      }))
      .sort((left, right) => compareCodeUnits(left.id, right.id)),
  }
  const schemaCatalogEntry = inlineEntry('schemas/catalog.json', jsonBytes(schemaCatalog))
  attachManifestFile(
    schemaCatalogEntry,
    requiredRole('schema-catalog'),
    classify('schema-catalog', schemaCatalogEntry.relativePath),
    { kind: 'excluded-generated' },
    'https://skillpilot.com/schemas/curriculum-package/v1/schema-catalog.schema.json',
  )
  addEntry(entries, schemaCatalogEntry)
  trustedSchemas.forEach((schema) => {
    const entry = sourceEntry(schema.packagePath, schema.sourcePath)
    attachManifestFile(entry, requiredRole('schema'), classify('schema', entry.relativePath), { kind: 'excluded-generated' })
    addEntry(entries, entry)
  })

  const semanticSources: Record<typeof EXPECTED_SEMANTIC_BINDING_NAMES[number], string> = {
    semanticNormalForm: stringValue(contractDefinition.normalizationProfilePath, 'normalizationProfilePath'),
    fieldSemanticsRegistry: stringValue(contractDefinition.fieldSemanticsRegistryPath, 'fieldSemanticsRegistryPath'),
    definitionDigestProfile: options.definitionDigestProfilePath ?? DEFAULT_DEFINITION_PROFILE_PATH,
    curriculumOntologyProfile: stringValue(contractDefinition.ontologyProfilePath, 'ontologyProfilePath'),
    publicationEvidenceProfile: stringValue(contractDefinition.publicationEvidenceProfilePath, 'publicationEvidenceProfilePath'),
  }
  const semanticContractBindings: Record<string, JsonObject> = {}
  EXPECTED_SEMANTIC_BINDING_NAMES.forEach((bindingName) => {
    const sourcePath = resolveRepositoryFile(repositoryRoot, semanticSources[bindingName], `semantic contract ${bindingName}`)
    const document = readJson<JsonObject>(sourcePath, `semantic contract ${bindingName}`)
    const expectedBinding = profile.semanticContractBindings.find((binding) => binding.bindingName === bindingName) as {
      bindingName: string
      validationSchemaId: string
    }
    if (document.$schema !== expectedBinding.validationSchemaId) fail(`Semantic contract ${bindingName} has the wrong validation schema.`)
    const fileName = basename(semanticSources[bindingName])
    const packagePath = `schemas/profiles/${fileName}`
    const entry = sourceEntry(packagePath, sourcePath)
    attachManifestFile(
      entry,
      requiredRole('semantic-contract'),
      classify('semantic-contract', packagePath),
      { kind: 'excluded-generated' },
      expectedBinding.validationSchemaId,
    )
    addEntry(entries, entry)
    semanticContractBindings[bindingName] = {
      id: schemaBindingId(document, bindingName),
      path: packagePath,
      sha256: entry.sha256,
    }
  })
  if (
    semanticContractBindings.semanticNormalForm.sha256 !== semanticIndex.normalizationProfile.sha256
    || semanticContractBindings.semanticNormalForm.id !== semanticIndex.normalizationProfile.id
    || semanticContractBindings.fieldSemanticsRegistry.sha256 !== semanticIndex.fieldSemanticsRegistry.sha256
    || semanticContractBindings.fieldSemanticsRegistry.id !== semanticIndex.fieldSemanticsRegistry.id
  ) {
    fail('Package-local normalization or field-registry contract differs from semantic-content-index binding.')
  }
  if (
    semanticContractBindings.curriculumOntologyProfile.sha256 !== contractDefinition.ontologyProfileSha256
    || semanticContractBindings.publicationEvidenceProfile.sha256 !== contractDefinition.publicationEvidenceProfileSha256
  ) {
    fail('Package-local ontology or publication-evidence contract differs from release-model build-profile binding.')
  }

  const packagedProfilePath = 'schemas/profiles/full-standalone-v1.profile.json'
  const packagedProfileEntry = sourceEntry(packagedProfilePath, profilePath)
  attachManifestFile(packagedProfileEntry, requiredRole('release-profile'), classify('release-profile', packagedProfilePath), { kind: 'excluded-generated' })
  addEntry(entries, packagedProfileEntry)

  const reviewEntry = sourceEntry(REDISTRIBUTION_EVIDENCE_PATH, reviewPath)
  attachManifestFile(reviewEntry, requiredRole('provenance-report'), classify('provenance-report', REDISTRIBUTION_EVIDENCE_PATH), { kind: 'excluded-generated' })
  addEntry(entries, reviewEntry)

  let sourceVerificationPendingCount = 0
  if (!fixtureOnly) {
    const sourceVerification = readJson<JsonObject>(sourceVerificationReviewPath as string, 'source-verification review')
    const sourceVerificationScope = objectValue(sourceVerification.scope, 'source-verification scope')
    const sourceVerificationSummary = objectValue(sourceVerification.summary, 'source-verification summary')
    if (sourceVerificationScope.packageId !== packageId) fail('Source-verification review package ID differs from release package ID.')
    if (
      withoutDigestPrefix(
        stringValue(sourceVerificationScope.publicationEvidenceProfileSha256, 'source-verification publication profile SHA-256'),
        'source-verification publication profile SHA-256',
      ) !== semanticContractBindings.publicationEvidenceProfile.sha256
    ) {
      fail('Source-verification review is stale for the package-local publication-evidence profile.')
    }
    const pending = sourceVerificationSummary.pendingHumanReviewCount
    if (!Number.isSafeInteger(pending) || (pending as number) < 0) fail('Source-verification pending review count is invalid.')
    sourceVerificationPendingCount = pending as number
    const officialSourceDecisions = review.classDecisions.filter((decision) => decision.classId === 'official-source-evidence')
    if (officialSourceDecisions.length !== 1) fail('Redistribution review must classify official source evidence exactly once.')
    const officialSourceDecision = officialSourceDecisions[0]
    assertDecisionState(officialSourceDecision, 'official source-evidence decision')
    const sourceReviewEntry = sourceEntry(SOURCE_VERIFICATION_EVIDENCE_PATH, sourceVerificationReviewPath as string)
    attachManifestFile(
      sourceReviewEntry,
      requiredRole('provenance-report'),
      officialSourceDecision,
      { kind: 'excluded-generated' },
    )
    addEntry(entries, sourceReviewEntry)
    const sourceReportEntry = sourceEntry(SOURCE_VERIFICATION_REPORT_PATH, sourceVerificationReportPath as string)
    attachManifestFile(
      sourceReportEntry,
      requiredRole('provenance-report'),
      officialSourceDecision,
      { kind: 'excluded-generated' },
    )
    addEntry(entries, sourceReportEntry)
  }

  const readmeEntry = inlineEntry(README_PATH, buildReadme({
    releaseId,
    packageId,
    packageVersion,
    contentDigest: semanticIndex.contentDigest,
    publicationReady: review.summary.publicationReady,
    humanReviewItemCount: review.summary.humanReviewItemCount,
    sourceVerificationPendingCount,
  }))
  attachManifestFile(readmeEntry, requiredRole('package-documentation'), classify('package-documentation', README_PATH), { kind: 'excluded-generated' })
  addEntry(entries, readmeEntry)

  const requiredLicenseIds = new Set<string>()
  for (const entry of entries.values()) {
    const expression = entry.manifestFile?.licenseExpression
    if (expression) parseLicenseExpression(expression).forEach((identifier) => requiredLicenseIds.add(identifier))
  }
  profile.licensePolicy.disallowedIdentifiers.forEach((identifier) => {
    if (requiredLicenseIds.has(identifier)) fail(`Disallowed license identifier is referenced: ${identifier}`)
  })
  const additionalLicensePaths = options.additionalLicenseDocumentPaths ?? {}
  Object.keys(additionalLicensePaths).forEach((identifier) => {
    if (!requiredLicenseIds.has(identifier)) fail(`Additional license document is orphaned: ${identifier}`)
  })
  const licenseDocuments: Array<{ licenseId: string; path: string }> = []
  let additionalLicenseIndex = 0
  ;[...requiredLicenseIds].sort(compareCodeUnits).forEach((identifier) => {
    let packagePath: string
    let sourcePath: string
    let decision: Pick<ClassDecision | AssetDecision, 'licenseExpression' | 'provenanceClass' | 'redistributionStatus'>
    if (identifier === review.rootLicenseEvidence.licenseId) {
      packagePath = 'LICENSE'
      sourcePath = rootLicensePath
      decision = classify('license', packagePath)
    } else {
      const repositoryPath = additionalLicensePaths[identifier]
      if (!repositoryPath) fail(`No package-local license document input was supplied for ${identifier}.`)
      additionalLicenseIndex += 1
      packagePath = `licenses/license-${String(additionalLicenseIndex).padStart(3, '0')}.txt`
      sourcePath = resolveRepositoryFile(repositoryRoot, repositoryPath, `license document ${identifier}`)
      decision = {
        licenseExpression: identifier,
        provenanceClass: 'third-party',
        redistributionStatus: 'allowed',
      }
    }
    const licenseEntry = sourceEntry(packagePath, sourcePath)
    attachManifestFile(licenseEntry, requiredRole('license'), decision, { kind: 'excluded-generated' })
    addEntry(entries, licenseEntry)
    licenseDocuments.push({ licenseId: identifier, path: packagePath })
  })
  if (profile.licensePolicy.requireDocumentForEveryIdentifier && licenseDocuments.length !== requiredLicenseIds.size) {
    fail('Not every referenced license identifier has one package-local license document.')
  }
  if (licenseDocuments.length > profile.manifestLimits.licenseDocuments) {
    fail('License-document count exceeds the release profile manifest limit.')
  }

  const inventoryEntries = [...entries.values()].sort((left, right) => compareCodeUnits(left.relativePath, right.relativePath))
  validateManifestPlanAgainstProfile(inventoryEntries, profile)
  const manifestFiles = inventoryEntries.map((entry) => entry.manifestFile as FullStandaloneManifestFile)
  const schemaById = new Map(trustedSchemas.map((schema) => [schema.id, schema]))
  const requiredSchemaBinding = (id: string) => schemaById.get(id) ?? fail(`Trusted schemas lack binding ${id}.`)
  const runtimeCatalogSchema = requiredSchemaBinding('https://skillpilot.com/schemas/curriculum-package/v1/runtime-catalog.schema.json')
  const schemaCatalogSchema = requiredSchemaBinding('https://skillpilot.com/schemas/curriculum-package/v1/schema-catalog.schema.json')
  const manifestSchema = requiredSchemaBinding(profile.manifestSchema.id)
  if (manifestSchema.sha256 !== profile.manifestSchema.sha256) fail('Manifest schema binding differs between profile fields.')

  const manifest: JsonObject = {
    $schema: profile.manifestSchema.id,
    packageFormatVersion: profile.compatibility.packageFormatVersion,
    runtimeContractVersion: profile.compatibility.runtimeContractVersion,
    releaseProfile: profile.profileId,
    variant: profile.compatibility.variant,
    releaseId,
    packageId,
    packageVersion,
    curriculumEdition,
    contentDigest: semanticIndex.contentDigest,
    archiveRoot,
    supportedSkillpilotSoftware: options.supportedSkillpilotSoftware ?? '>=0.1.0 <1.0.0',
    licenseDocuments,
    contractBindings: {
      manifestSchema: { id: manifestSchema.id, path: manifestSchema.packagePath, sha256: manifestSchema.sha256 },
      releaseProfile: { id: profile.profileId, path: packagedProfilePath, sha256: packagedProfileEntry.sha256 },
      runtimeCatalogSchema: { id: runtimeCatalogSchema.id, path: runtimeCatalogSchema.packagePath, sha256: runtimeCatalogSchema.sha256 },
      schemaCatalogSchema: { id: schemaCatalogSchema.id, path: schemaCatalogSchema.packagePath, sha256: schemaCatalogSchema.sha256 },
      ...semanticContractBindings,
    },
    files: manifestFiles,
  }
  const manifestEntry = inlineEntry(MANIFEST_PATH, jsonBytes(manifest))
  if (manifestEntry.bytes > profile.manifestLimits.manifestBytes) {
    fail(`Manifest exceeds the ${profile.manifestLimits.manifestBytes}-byte release-profile limit.`)
  }
  addEntry(entries, manifestEntry)
  const checksumsContent = [...entries.values()]
    .sort((left, right) => compareCodeUnits(left.relativePath, right.relativePath))
    .map((entry) => `${entry.sha256}  ${entry.relativePath}`)
    .join('\n')
  const checksumsEntry = inlineEntry(CHECKSUMS_PATH, Buffer.from(`${checksumsContent}\n`, 'utf8'))
  addEntry(entries, checksumsEntry)

  const finalEntries = [...entries.values()].sort((left, right) => compareCodeUnits(left.relativePath, right.relativePath))
  const excluded = [...profile.inventoryPolicy.excludedPaths].sort(compareCodeUnits)
  if (JSON.stringify(excluded) !== JSON.stringify([MANIFEST_PATH, CHECKSUMS_PATH].sort(compareCodeUnits))) {
    fail('Release profile inventory exclusions must be exactly manifest and SHA256SUMS.')
  }
  const unrecorded = finalEntries.filter((entry) => !entry.manifestFile).map((entry) => entry.relativePath).sort(compareCodeUnits)
  if (JSON.stringify(unrecorded) !== JSON.stringify(excluded)) fail('Only profile-declared self-referential metadata may be absent from manifest files.')
  if (finalEntries.length > profile.archiveLimits.entryCount) fail('Package entry count exceeds release-profile archive limit.')
  const totalBytes = finalEntries.reduce((sum, entry) => sum + entry.bytes, 0)
  if (totalBytes > profile.archiveLimits.totalUncompressedBytes) fail('Package bytes exceed release-profile archive limit.')
  const binaryEntries = finalEntries.filter((entry) => entry.manifestFile?.role === 'binary-asset')
  binaryEntries.forEach((entry) => {
    if (entry.bytes > profile.archiveLimits.goalVisualizationBytes) {
      fail(`Binary visualization exceeds the ${profile.archiveLimits.goalVisualizationBytes}-byte limit: ${entry.relativePath}`)
    }
  })
  const imageLaneBytes = binaryEntries.reduce((sum, entry) => sum + entry.bytes, 0)
  if (imageLaneBytes > profile.archiveLimits.imageLaneBytes) {
    fail(`Binary image lane exceeds the ${profile.archiveLimits.imageLaneBytes}-byte limit.`)
  }
  finalEntries.forEach((entry) => {
    if (entry.bytes > profile.archiveLimits.genericEntryBytes) fail(`Package entry exceeds generic byte limit: ${entry.relativePath}`)
    const mediaType = entry.manifestFile?.mediaType
    if (
      (entry.relativePath === MANIFEST_PATH || mediaType === 'application/json' || mediaType === 'application/schema+json')
      && entry.bytes > profile.archiveLimits.jsonEntryBytes
    ) {
      fail(`JSON entry exceeds the ${profile.archiveLimits.jsonEntryBytes}-byte limit: ${entry.relativePath}`)
    }
    const zipPathBytes = Buffer.byteLength(`${archiveRoot}/${entry.relativePath}`, 'utf8')
    if (zipPathBytes > profile.archiveLimits.archivePathBytes) fail(`Archive path exceeds byte limit: ${entry.relativePath}`)
  })

  return {
    archiveRoot,
    releaseId,
    packageId,
    packageVersion,
    contentDigest: semanticIndex.contentDigest,
    publicationReady: review.summary.publicationReady,
    humanReviewItemCount: review.summary.humanReviewItemCount,
    sourceVerificationPendingCount,
    entries: finalEntries,
    manifest,
    zipLimits: {
      maxEntries: profile.archiveLimits.entryCount,
      maxEntryBytes: profile.archiveLimits.genericEntryBytes,
      maxPathBytes: profile.archiveLimits.archivePathBytes,
      maxOuterBytes: profile.archiveLimits.outerZipBytes,
      maxTotalUncompressedBytes: profile.archiveLimits.totalUncompressedBytes,
    },
  }
}

const atomicPromoteDirectory = (stagingPath: string, finalPath: string) => {
  const backupPath = `${finalPath}.backup-${process.pid}-${randomBytes(12).toString('hex')}`
  let movedExisting = false
  try {
    if (existsSync(finalPath)) {
      const metadata = lstatSync(finalPath)
      if (!metadata.isDirectory() || metadata.isSymbolicLink()) fail(`Existing package-directory target is not a regular directory: ${finalPath}`)
      renameSync(finalPath, backupPath)
      movedExisting = true
    }
    renameSync(stagingPath, finalPath)
  } catch (error) {
    if (!existsSync(finalPath) && movedExisting && existsSync(backupPath)) renameSync(backupPath, finalPath)
    if (existsSync(stagingPath)) rmSync(stagingPath, { recursive: true, force: true })
    throw error
  }
  if (movedExisting) {
    try {
      rmSync(backupPath, { recursive: true, force: true })
    } catch {
      // A stale private backup is cleanup debt, not a reason to invalidate a promoted package.
    }
  }
}

const atomicPromoteFile = (stagingPath: string, finalPath: string) => {
  const backupPath = `${finalPath}.backup-${process.pid}-${randomBytes(12).toString('hex')}`
  let movedExisting = false
  try {
    if (existsSync(finalPath)) {
      const metadata = lstatSync(finalPath)
      if (!metadata.isFile() || metadata.isSymbolicLink()) fail(`Existing package ZIP target is not a regular file: ${finalPath}`)
      renameSync(finalPath, backupPath)
      movedExisting = true
    }
    renameSync(stagingPath, finalPath)
  } catch (error) {
    if (!existsSync(finalPath) && movedExisting && existsSync(backupPath)) renameSync(backupPath, finalPath)
    if (existsSync(stagingPath)) rmSync(stagingPath, { force: true })
    throw error
  }
  if (movedExisting) {
    try {
      rmSync(backupPath, { force: true })
    } catch {
      // A stale private backup is cleanup debt, not a reason to invalidate a promoted package.
    }
  }
}

const materializeDirectory = (plan: FullStandalonePackagePlan, outputDirectory: string) => {
  const finalPath = resolve(outputDirectory, plan.archiveRoot)
  const stagingPath = resolve(outputDirectory, `.${plan.archiveRoot}.stage-${process.pid}-${randomBytes(12).toString('hex')}`)
  mkdirSync(stagingPath, { recursive: false, mode: 0o700 })
  try {
    plan.entries.forEach((entry) => {
      const target = resolve(stagingPath, entry.relativePath)
      if (!isStrictDescendant(stagingPath, target)) fail(`Directory materialization path escaped staging root: ${entry.relativePath}`)
      mkdirSync(dirname(target), { recursive: true, mode: 0o755 })
      if (entry.content) writeFileSync(target, entry.content, { flag: 'wx', mode: 0o644 })
      else if (entry.sourcePath) copyVerifiedSource(entry, target)
      else fail(`Package entry has no content source: ${entry.relativePath}`)
      const actual = fileIntegrity(target)
      if (actual.bytes !== entry.bytes || actual.sha256 !== entry.sha256 || actual.crc32 !== entry.crc32) {
        fail(`Materialized directory entry failed integrity verification: ${entry.relativePath}`)
      }
    })
    atomicPromoteDirectory(stagingPath, finalPath)
  } catch (error) {
    rmSync(stagingPath, { recursive: true, force: true })
    throw error
  }
  return finalPath
}

const zipEntriesForPlan = (plan: FullStandalonePackagePlan): DeterministicZip32Entry[] => plan.entries.map((entry) => ({
  packagePath: `${plan.archiveRoot}/${entry.relativePath}`,
  ...(entry.content ? { content: entry.content } : { sourcePath: entry.sourcePath as string }),
  bytes: entry.bytes,
  sha256: entry.sha256,
  crc32: entry.crc32,
}))

const materializeReproducibleZip = (plan: FullStandalonePackagePlan, outputDirectory: string) => {
  const finalPath = resolve(outputDirectory, `${plan.archiveRoot}.zip`)
  const firstPath = resolve(outputDirectory, `.${plan.archiveRoot}.first-${process.pid}-${randomBytes(12).toString('hex')}.zip`)
  const secondPath = resolve(outputDirectory, `.${plan.archiveRoot}.second-${process.pid}-${randomBytes(12).toString('hex')}.zip`)
  const zipEntries = zipEntriesForPlan(plan)
  try {
    createDeterministicZip32(zipEntries, FIXED_ZIP_TIME, firstPath, plan.zipLimits)
    createDeterministicZip32([...zipEntries].reverse(), FIXED_ZIP_TIME, secondPath, plan.zipLimits)
    const first = fileIntegrity(firstPath)
    const second = fileIntegrity(secondPath)
    if (first.bytes !== second.bytes || first.sha256 !== second.sha256) {
      fail(`Reproducibility failure: double ZIP build differs (${first.sha256} vs ${second.sha256}).`)
    }
    rmSync(secondPath, { force: true })
    atomicPromoteFile(firstPath, finalPath)
    const promoted = fileIntegrity(finalPath)
    if (promoted.bytes !== first.bytes || promoted.sha256 !== first.sha256) fail('Promoted ZIP bytes differ from verified staging ZIP.')
    return { path: finalPath, bytes: promoted.bytes, sha256: promoted.sha256 }
  } catch (error) {
    rmSync(firstPath, { force: true })
    rmSync(secondPath, { force: true })
    throw error
  }
}

export const materializeFullStandalonePackage = (
  plan: FullStandalonePackagePlan,
  options: MaterializeFullStandalonePackageOptions,
): MaterializedFullStandalonePackage => {
  if (options.writeDirectory === options.writeZip) {
    fail('Materialization must request exactly one artifact: directory-only or ZIP-only.')
  }
  const repositoryRoot = resolve(options.repositoryRoot ?? defaultRepositoryRoot)
  const repositoryTmp = resolve(repositoryRoot, 'tmp')
  const outputDirectory = resolve(repositoryRoot, options.outputDirectory)
  if (!isStrictDescendant(repositoryTmp, outputDirectory)) fail(`Package output must be a strict descendant of ${repositoryTmp}.`)
  assertNoSymlinkComponents(repositoryRoot, outputDirectory, true)
  mkdirSync(outputDirectory, { recursive: true, mode: 0o755 })
  assertNoSymlinkComponents(repositoryRoot, outputDirectory, false)
  if (!lstatSync(outputDirectory).isDirectory()) fail(`Package output is not a directory: ${outputDirectory}`)

  const directoryPath = options.writeDirectory ? materializeDirectory(plan, outputDirectory) : null
  const zip = options.writeZip ? materializeReproducibleZip(plan, outputDirectory) : null
  return {
    directoryPath,
    zipPath: zip?.path ?? null,
    zipBytes: zip?.bytes ?? null,
    zipSha256: zip?.sha256 ?? null,
  }
}

type CliOptions = FullStandalonePackagePlanOptions & {
  outputDirectory: string
  mode: 'plan-only' | 'directory-only' | 'zip-only'
  expectedEntryCount?: number
  expectedManifestFileCount?: number
  expectedBinaryAssetCount?: number
  expectedContentDigest?: string
}

const usage = () => `Usage:
  tsx app/scripts/buildFullStandaloneCurriculumPackage.ts \\
    --release-root tmp/curriculum-release-model/mathematik-a \\
    --output-dir tmp/curriculum-packages \\
    (--plan-only | --directory-only | --zip)

Optional:
  --archive-root <portable-segment>
  --supported-skillpilot-software ">=0.1.0 <1.0.0"
  --redistribution-review <repository-relative-path>
  --source-verification-review <repository-relative-path>
  --source-verification-report <repository-relative-path>
  --license-document <license-id>=<repository-relative-path>  (repeatable)
  --expect-entry-count <integer>
  --expect-manifest-file-count <integer>
  --expect-binary-asset-count <integer>
  --expect-content-digest <sha256:digest>
`

const parseCli = (args: string[]): CliOptions => {
  const valueFor = (name: string, index: number) => {
    const value = args[index + 1]
    if (!value || value.startsWith('--')) fail(`${name} requires a value.\n${usage()}`)
    return value
  }
  let releaseRoot: string | null = null
  let outputDirectory: string | null = null
  let archiveRoot: string | undefined
  let supportedSkillpilotSoftware: string | undefined
  let redistributionReviewPath: string | undefined
  let sourceVerificationReviewPath: string | undefined
  let sourceVerificationReportPath: string | undefined
  const additionalLicenseDocumentPaths: Record<string, string> = {}
  let expectedEntryCount: number | undefined
  let expectedManifestFileCount: number | undefined
  let expectedBinaryAssetCount: number | undefined
  let expectedContentDigest: string | undefined
  let mode: CliOptions['mode'] | null = null
  const positiveInteger = (name: string, value: string) => {
    const parsed = Number(value)
    if (!Number.isSafeInteger(parsed) || parsed < 0) fail(`${name} requires a non-negative safe integer.`)
    return parsed
  }
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]
    if (arg === '--release-root') releaseRoot = valueFor(arg, index++)
    else if (arg === '--output-dir') outputDirectory = valueFor(arg, index++)
    else if (arg === '--archive-root') archiveRoot = valueFor(arg, index++)
    else if (arg === '--supported-skillpilot-software') supportedSkillpilotSoftware = valueFor(arg, index++)
    else if (arg === '--redistribution-review') redistributionReviewPath = valueFor(arg, index++)
    else if (arg === '--source-verification-review') sourceVerificationReviewPath = valueFor(arg, index++)
    else if (arg === '--source-verification-report') sourceVerificationReportPath = valueFor(arg, index++)
    else if (arg === '--license-document') {
      const value = valueFor(arg, index++)
      const separator = value.indexOf('=')
      if (separator <= 0 || separator === value.length - 1) fail('--license-document requires <license-id>=<repository-relative-path>.')
      const identifier = value.slice(0, separator)
      if (additionalLicenseDocumentPaths[identifier]) fail(`Duplicate --license-document identifier: ${identifier}`)
      additionalLicenseDocumentPaths[identifier] = value.slice(separator + 1)
    }
    else if (arg === '--expect-entry-count') expectedEntryCount = positiveInteger(arg, valueFor(arg, index++))
    else if (arg === '--expect-manifest-file-count') expectedManifestFileCount = positiveInteger(arg, valueFor(arg, index++))
    else if (arg === '--expect-binary-asset-count') expectedBinaryAssetCount = positiveInteger(arg, valueFor(arg, index++))
    else if (arg === '--expect-content-digest') expectedContentDigest = valueFor(arg, index++)
    else if (arg === '--plan-only') mode = mode ? fail('Choose exactly one output mode.') : 'plan-only'
    else if (arg === '--directory-only') mode = mode ? fail('Choose exactly one output mode.') : 'directory-only'
    else if (arg === '--zip') mode = mode ? fail('Choose exactly one output mode.') : 'zip-only'
    else if (arg === '--help' || arg === '-h') {
      process.stdout.write(usage())
      process.exit(0)
    } else fail(`Unknown argument: ${arg}\n${usage()}`)
  }
  if (!releaseRoot || !outputDirectory || !mode) fail(usage())
  return {
    releaseRoot,
    outputDirectory,
    mode,
    ...(archiveRoot ? { archiveRoot } : {}),
    ...(supportedSkillpilotSoftware ? { supportedSkillpilotSoftware } : {}),
    ...(redistributionReviewPath ? { redistributionReviewPath } : {}),
    ...(sourceVerificationReviewPath ? { sourceVerificationReviewPath } : {}),
    ...(sourceVerificationReportPath ? { sourceVerificationReportPath } : {}),
    ...(Object.keys(additionalLicenseDocumentPaths).length > 0 ? { additionalLicenseDocumentPaths } : {}),
    ...(expectedEntryCount !== undefined ? { expectedEntryCount } : {}),
    ...(expectedManifestFileCount !== undefined ? { expectedManifestFileCount } : {}),
    ...(expectedBinaryAssetCount !== undefined ? { expectedBinaryAssetCount } : {}),
    ...(expectedContentDigest ? { expectedContentDigest } : {}),
  }
}

const runCli = () => {
  const options = parseCli(process.argv.slice(2))
  const plan = createFullStandalonePackagePlan(options)
  const summary: JsonObject = {
    archiveRoot: plan.archiveRoot,
    releaseId: plan.releaseId,
    packageId: plan.packageId,
    packageVersion: plan.packageVersion,
    contentDigest: plan.contentDigest,
    fileCount: plan.entries.length,
    manifestFileCount: arrayValue(plan.manifest.files, 'manifest files').length,
    binaryAssetCount: arrayValue<FullStandaloneManifestFile>(plan.manifest.files, 'manifest files').filter((file) => file.role === 'binary-asset').length,
    totalUncompressedBytes: plan.entries.reduce((sum, entry) => sum + entry.bytes, 0),
    publicationReady: plan.publicationReady,
    humanReviewItemCount: plan.humanReviewItemCount,
    sourceVerificationPendingCount: plan.sourceVerificationPendingCount,
  }
  const actualManifestFileCount = summary.manifestFileCount as number
  const actualBinaryAssetCount = summary.binaryAssetCount as number
  const expectations: Array<[string, unknown, unknown]> = [
    ['entry count', options.expectedEntryCount, plan.entries.length],
    ['manifest file count', options.expectedManifestFileCount, actualManifestFileCount],
    ['binary asset count', options.expectedBinaryAssetCount, actualBinaryAssetCount],
    ['content digest', options.expectedContentDigest, plan.contentDigest],
  ]
  expectations.forEach(([label, expected, actual]) => {
    if (expected !== undefined && expected !== actual) fail(`Expected ${label} ${expected}, got ${actual}.`)
  })
  if (options.mode !== 'plan-only') {
    const materialized = materializeFullStandalonePackage(plan, {
      outputDirectory: options.outputDirectory,
      writeDirectory: options.mode === 'directory-only',
      writeZip: options.mode === 'zip-only',
    })
    Object.assign(summary, materialized)
  }
  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`)
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : null
if (invokedPath === fileURLToPath(import.meta.url)) {
  try {
    runCli()
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
    process.exitCode = 1
  }
}
