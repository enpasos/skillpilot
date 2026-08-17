import { createHash, randomBytes } from 'node:crypto'
import { execFileSync } from 'node:child_process'
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
  rmSync,
} from 'node:fs'
import { basename, dirname, isAbsolute, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { crc32 } from 'node:zlib'

export type JsonValue = null | boolean | number | string | JsonValue[] | JsonObject
export type JsonObject = { [key: string]: JsonValue }

export type SourceSemanticBinding =
  | { kind: 'logical-artifact'; logicalId: string; normalizationRole: string }
  | { kind: 'binary-resource'; resourceId: string }
  | { kind: 'excluded-generated' }

export type SourceManifestFile = {
  path: string
  role: string
  mediaType: string
  bytes: number
  sha256: string
  runtimeRequired: boolean
  licenseExpression: string | null
  provenanceClass: string
  redistributionStatus: 'allowed' | 'review-required' | 'prohibited'
  validationSchemaId?: string
  semanticBinding: SourceSemanticBinding
}

export type SourceManifest = {
  packageFormatVersion: string
  runtimeContractVersion: string
  releaseProfile: string
  variant: string
  releaseId: string
  packageId: string
  packageVersion: string
  curriculumEdition: string
  contentDigest: string
  archiveRoot: string
  supportedSkillpilotSoftware: string
  licenseDocuments: Array<{
    licenseId: string
    path: string
  }>
  contractBindings: Record<string, {
    id: string
    path: string
    sha256: string
  }>
  files: SourceManifestFile[]
}

export type SemanticContentIndex = {
  contentDigest: string
  logicalArtifacts: Array<{
    logicalId: string
    role: string
    normalizedBytes: number
    normalizedSha256: string
    recordSha256: string
  }>
  binaryResources: Array<{
    resourceId: string
    canonicalReference: string
    mediaType: string
    bytes: number
    sha256: string
    recordSha256: string
  }>
  normalizationProfile: { id: string; version: string; sha256: string }
  fieldSemanticsRegistry: { id: string; version: string; sha256: string }
}

export type SourceLogicalArtifact = {
  logicalId: string
  normalizationRole: string
  path: string
  sourcePath: string
  bytes: number
  sha256: string
  normalizedBytes: number
  normalizedSha256: string
  recordSha256: string
  document: JsonValue
}

export type SourceBinaryResource = {
  resourceId: string
  canonicalReference: string
  path: string
  sourcePath: string
  mediaType: 'image/jpeg' | 'image/png'
  bytes: number
  sha256: string
  licenseExpression: string | null
  provenanceClass:
    | 'skillpilot-authored-deterministic-render'
    | 'ai-generated-curated'
    | 'user-provided-generated-claim'
    | 'third-party'
  redistributionStatus: 'allowed' | 'review-required' | 'prohibited'
  resourceRecord: JsonObject
}

export type SourceReleaseSupport = {
  supportType:
    | 'json-contract-schema'
    | 'json-release-profile'
    | 'redistribution-review'
    | 'source-verification-review'
    | 'source-verification-status'
    | 'assessment-source'
  supportId: string
  targetPath: string
  path: string
  sourcePath: string
  mediaType: 'application/json' | 'application/schema+json' | 'text/markdown'
  bytes: number
  sha256: string
  licenseExpression: string | null
  provenanceClass: 'skillpilot-authored' | 'official-source-metadata' | 'generated-package-metadata'
  redistributionStatus: 'allowed' | 'review-required'
}

export type ValidatedSourceJsonPackage = {
  zipPath: string
  zipFile: string
  zipBytes: number
  zipSha256: string
  manifestPath: string
  manifestBytes: number
  manifestSha256: string
  rootPath: string
  manifest: SourceManifest
  validationReport: JsonObject
  semanticContentIndexPath: string
  semanticContentIndexBytes: number
  semanticContentIndexSha256: string
  semanticContentIndex: SemanticContentIndex
  logicalArtifacts: SourceLogicalArtifact[]
  binaryResources: SourceBinaryResource[]
  releaseSupport: SourceReleaseSupport[]
  sourceContractBindings: Record<string, {
    id: string
    path: string
    sha256: string
  }>
}

export type PreparedSourceJsonPackage = {
  source: ValidatedSourceJsonPackage
  cleanup: () => void
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
export const repositoryRoot = resolve(scriptDir, '../..')

const SHA256_PATTERN = /^[a-f0-9]{64}$/u
const CONTENT_DIGEST_PATTERN = /^sha256:[a-f0-9]{64}$/u
const WINDOWS_RESERVED_SEGMENT = /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\..*)?$/iu
const SOURCE_CONTRACT_NAMES = [
  'semanticNormalForm',
  'fieldSemanticsRegistry',
  'definitionDigestProfile',
  'curriculumOntologyProfile',
  'publicationEvidenceProfile',
] as const
const REVIEW_SUPPORT = [
  ['redistribution-review', 'redistribution-review', 'metadata/provenance/redistribution-review.json'],
  ['source-verification-review', 'source-verification-review', 'metadata/provenance/source-verification-review.json'],
  ['source-verification-status', 'source-verification-status', 'metadata/provenance/source-verification-status.md'],
] as const

const compareCodeUnits = (left: string, right: string) => (left < right ? -1 : left > right ? 1 : 0)
const fail = (message: string): never => { throw new Error(message) }

const isStrictDescendant = (base: string, target: string) => {
  const rel = relative(resolve(base), resolve(target))
  return rel !== '' && rel !== '..' && !rel.startsWith(`..${sep}`) && !isAbsolute(rel)
}

export const assertSafePackagePath = (value: string, label = 'package path') => {
  const segments = value.split('/')
  if (
    !value
    || value.startsWith('/')
    || value.includes('\\')
    || [...value].some((character) => {
      const codePoint = character.codePointAt(0) ?? 0
      return codePoint < 0x20 || codePoint === 0x7f
    })
    || segments.some((segment) => (
      segment === ''
      || segment === '.'
      || segment === '..'
      || segment.includes(':')
      || segment.endsWith('.')
      || segment.endsWith(' ')
      || WINDOWS_RESERVED_SEGMENT.test(segment)
    ))
  ) fail(`Unsafe ${label}: ${value}`)
}

export const assertNoSymlinkComponents = (base: string, target: string, allowMissingTail: boolean) => {
  const resolvedBase = resolve(base)
  const resolvedTarget = resolve(target)
  const rel = relative(resolvedBase, resolvedTarget)
  if (rel === '..' || rel.startsWith(`..${sep}`) || isAbsolute(rel)) {
    fail(`Path escapes trusted base ${resolvedBase}: ${resolvedTarget}`)
  }
  let cursor = resolvedBase
  if (!existsSync(cursor) || lstatSync(cursor).isSymbolicLink()) fail(`Trusted path base is missing or a symlink: ${cursor}`)
  for (const segment of rel.split(sep).filter(Boolean)) {
    cursor = resolve(cursor, segment)
    if (!existsSync(cursor)) {
      if (allowMissingTail) return
      fail(`Required path component does not exist: ${cursor}`)
    }
    if (lstatSync(cursor).isSymbolicLink()) fail(`Symlink path component is forbidden: ${cursor}`)
  }
}

export const fileIntegrity = (path: string) => {
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
      fail(`File identity changed while opening: ${path}`)
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
    fail(`File identity changed while reading: ${path}`)
  }
  return { bytes, sha256: hash.digest('hex'), crc32: checksum }
}

export const inlineIntegrity = (content: Buffer) => ({
  bytes: content.length,
  sha256: createHash('sha256').update(content).digest('hex'),
  crc32: crc32(content) >>> 0,
})

const jsonObject = (value: unknown, label: string): JsonObject => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(`${label} must be a JSON object.`)
  return value as JsonObject
}

const readJson = <T>(path: string, label: string): T => {
  const raw = readFileSync(path)
  if (raw.includes(0)) fail(`${label} is not UTF-8 JSON.`)
  const text = raw.toString('utf8')
  if (text.includes('\uFFFD')) fail(`${label} is not lossless UTF-8.`)
  try {
    return JSON.parse(text) as T
  } catch (error) {
    return fail(`${label} is invalid JSON: ${error instanceof Error ? error.message : String(error)}`)
  }
}

const sourceFilePath = (rootPath: string, packagePath: string) => {
  assertSafePackagePath(packagePath)
  const absolute = resolve(rootPath, packagePath)
  if (!isStrictDescendant(rootPath, absolute)) fail(`Source file path escapes package root: ${packagePath}`)
  assertNoSymlinkComponents(rootPath, absolute, false)
  const metadata = lstatSync(absolute)
  if (!metadata.isFile() || metadata.isSymbolicLink()) fail(`Source package entry is not a regular file: ${packagePath}`)
  return absolute
}

const verifyFileRecord = (rootPath: string, record: SourceManifestFile) => {
  const absolute = sourceFilePath(rootPath, record.path)
  const integrity = fileIntegrity(absolute)
  if (integrity.bytes !== record.bytes || integrity.sha256 !== record.sha256) {
    fail(`Extracted source package entry differs from its manifest: ${record.path}`)
  }
  return absolute
}

const walkFiles = (rootPath: string) => {
  const paths: string[] = []
  const walk = (directory: string) => {
    readdirSync(directory, { withFileTypes: true })
      .sort((left, right) => compareCodeUnits(left.name, right.name))
      .forEach((item) => {
        const absolute = resolve(directory, item.name)
        if (item.isSymbolicLink()) fail(`Source package tree contains a symlink: ${absolute}`)
        if (item.isDirectory()) walk(absolute)
        else if (item.isFile()) paths.push(relative(rootPath, absolute).split(sep).join('/'))
        else fail(`Source package tree contains a special file: ${absolute}`)
      })
  }
  walk(rootPath)
  return paths
}

const mapProvenance = (value: string): SourceReleaseSupport['provenanceClass'] => {
  if (value === 'software-contract' || value === 'skillpilot-authored') return 'skillpilot-authored'
  if (value === 'official-source-metadata') return 'official-source-metadata'
  if (value === 'generated-metadata') return 'generated-package-metadata'
  return fail(`Unsupported release-support provenance class: ${value}`)
}

const mediaTypeForSupport = (value: string): SourceReleaseSupport['mediaType'] => {
  if (value === 'application/json' || value === 'application/schema+json' || value === 'text/markdown') return value
  return fail(`Unsupported release-support media type: ${value}`)
}

const supportIdForSchema = (targetPath: string) => basename(targetPath).replace(/\.schema\.json$/u, '')

const assertSourceManifest = (manifest: SourceManifest) => {
  if (
    manifest.packageFormatVersion !== '1.0'
    || manifest.runtimeContractVersion !== '1.0'
    || manifest.releaseProfile !== 'full-standalone-v1'
    || manifest.variant !== 'json'
    || manifest.releaseId !== `${manifest.packageId}@${manifest.packageVersion}`
    || !CONTENT_DIGEST_PATTERN.test(manifest.contentDigest)
    || !Array.isArray(manifest.licenseDocuments)
    || !Array.isArray(manifest.files)
  ) fail('Source JSON manifest identity or contract is not full-standalone-v1.')
  const paths = manifest.files.map((record) => record.path)
  if (new Set(paths).size !== paths.length) fail('Source JSON manifest has duplicate file paths.')
  manifest.files.forEach((record) => {
    assertSafePackagePath(record.path, 'source manifest path')
    if (!Number.isSafeInteger(record.bytes) || record.bytes <= 0 || !SHA256_PATTERN.test(record.sha256)) {
      fail(`Source JSON manifest file binding is invalid: ${record.path}`)
    }
  })
}

const loadSourceFromRoot = (
  zipPath: string,
  rootPath: string,
  validationReport: JsonObject,
  expectedZipIntegrity?: { bytes: number; sha256: string },
): ValidatedSourceJsonPackage => {
  const zipIntegrity = expectedZipIntegrity ?? fileIntegrity(zipPath)
  const manifestPath = sourceFilePath(rootPath, 'metadata/manifest.json')
  const manifestIntegrity = fileIntegrity(manifestPath)
  const manifest = readJson<SourceManifest>(manifestPath, 'source JSON package manifest')
  assertSourceManifest(manifest)
  if (basename(rootPath) !== manifest.archiveRoot) fail('Extracted source archive root differs from its manifest.')

  const reportInput = jsonObject(validationReport.input, 'source validation input')
  const reportPackage = jsonObject(validationReport.package, 'source validation package')
  if (
    validationReport.status !== 'valid'
    || validationReport.validatorId !== 'skillpilot-full-standalone-package-validator-v2'
    || reportInput.bytes !== zipIntegrity.bytes
    || reportInput.sha256 !== zipIntegrity.sha256
    || reportPackage.manifestSha256 !== manifestIntegrity.sha256
    || reportPackage.releaseId !== manifest.releaseId
    || reportPackage.contentDigest !== manifest.contentDigest
    || reportPackage.archiveRoot !== manifest.archiveRoot
  ) fail('Source JSON validation report does not bind the exact ZIP, manifest, and release identity.')

  const expectedPaths = new Set(manifest.files.map((record) => record.path))
  expectedPaths.add('metadata/manifest.json')
  expectedPaths.add('metadata/SHA256SUMS')
  const actualPaths = walkFiles(rootPath)
  if (actualPaths.length !== expectedPaths.size || actualPaths.some((path) => !expectedPaths.has(path))) {
    fail('Extracted source package tree differs from the closed manifest inventory.')
  }
  const recordByPath = new Map(manifest.files.map((record) => [record.path, record]))
  manifest.files.forEach((record) => verifyFileRecord(rootPath, record))

  const semanticRecord = manifest.files.find((record) => record.role === 'semantic-content-index')
    ?? fail('Source JSON package lacks its semantic-content-index.')
  const semanticContentIndexPath = verifyFileRecord(rootPath, semanticRecord)
  const semanticContentIndex = readJson<SemanticContentIndex>(semanticContentIndexPath, 'source semantic-content-index')
  if (
    semanticContentIndex.contentDigest !== manifest.contentDigest
    || semanticContentIndex.fieldSemanticsRegistry.id !== 'skillpilot-fwu-field-semantics-v1'
  ) fail('Source semantic-content-index identity differs from the manifest.')

  const logicalById = new Map(semanticContentIndex.logicalArtifacts.map((record) => [record.logicalId, record]))
  const logicalArtifacts = manifest.files
    .filter((record): record is SourceManifestFile & {
      semanticBinding: Extract<SourceSemanticBinding, { kind: 'logical-artifact' }>
    } => record.semanticBinding.kind === 'logical-artifact')
    .map((record): SourceLogicalArtifact => {
      const indexRecord = logicalById.get(record.semanticBinding.logicalId)
        ?? fail(`Logical source artifact is absent from semantic-content-index: ${record.semanticBinding.logicalId}`)
      const sourcePath = verifyFileRecord(rootPath, record)
      return {
        logicalId: record.semanticBinding.logicalId,
        normalizationRole: record.semanticBinding.normalizationRole,
        path: record.path,
        sourcePath,
        bytes: record.bytes,
        sha256: record.sha256,
        normalizedBytes: indexRecord.normalizedBytes,
        normalizedSha256: indexRecord.normalizedSha256,
        recordSha256: indexRecord.recordSha256,
        document: readJson<JsonValue>(sourcePath, `logical artifact ${record.path}`),
      }
    })
    .sort((left, right) => compareCodeUnits(left.logicalId, right.logicalId))
  if (logicalArtifacts.length !== logicalById.size) fail('Logical artifact inventory is not bijective.')

  const resourceArtifact = logicalArtifacts.find((artifact) => artifact.normalizationRole === 'resource-index')
    ?? fail('Source JSON package lacks its resource index.')
  const resourceIndex = jsonObject(resourceArtifact.document, 'resource index')
  const resources = resourceIndex.resources
  if (!Array.isArray(resources)) return fail('Resource index resources must be an array.')
  const resourceRecords = new Map<string, JsonObject>()
  resources.forEach((value, index) => {
    const record = jsonObject(value, `resource index record ${index}`)
    const resourceId = record.resourceId
    if (typeof resourceId !== 'string' || resourceRecords.has(resourceId)) {
      fail(`Resource index has an invalid or duplicate resourceId at ${index}.`)
    }
    resourceRecords.set(resourceId as string, record)
  })
  const binaryIndex = new Map(semanticContentIndex.binaryResources.map((record) => [record.resourceId, record]))
  const binaryResources = manifest.files
    .filter((record): record is SourceManifestFile & {
      semanticBinding: Extract<SourceSemanticBinding, { kind: 'binary-resource' }>
    } => record.semanticBinding.kind === 'binary-resource')
    .map((record): SourceBinaryResource => {
      const resourceId = record.semanticBinding.resourceId
      const indexRecord = binaryIndex.get(resourceId) ?? fail(`Binary resource is absent from semantic-content-index: ${resourceId}`)
      const resourceRecord = resourceRecords.get(resourceId) ?? fail(`Binary resource is absent from resource index: ${resourceId}`)
      if (
        indexRecord.bytes !== record.bytes
        || indexRecord.sha256 !== record.sha256
        || indexRecord.mediaType !== record.mediaType
        || resourceRecord.publicUrl !== indexRecord.canonicalReference
        || resourceRecord.artifactPath !== record.path
        || resourceRecord.bytes !== record.bytes
        || resourceRecord.sha256 !== record.sha256
        || record.path !== String(indexRecord.canonicalReference).replace(/^\//u, '')
      ) fail(`Binary resource binding differs across source records: ${resourceId}`)
      if (record.mediaType !== 'image/jpeg' && record.mediaType !== 'image/png') {
        fail(`FWU-OWL v1 cannot embed binary media type ${record.mediaType}: ${resourceId}`)
      }
      if (
        record.provenanceClass !== 'skillpilot-authored-deterministic-render'
        && record.provenanceClass !== 'ai-generated-curated'
        && record.provenanceClass !== 'user-provided-generated-claim'
        && record.provenanceClass !== 'third-party'
      ) fail(`Unsupported binary provenance class: ${record.provenanceClass}`)
      if (
        record.provenanceClass === 'skillpilot-authored-deterministic-render'
        && record.mediaType !== 'image/png'
      ) fail(`Deterministically rendered binary resource must be PNG: ${resourceId}`)
      const mediaType = record.mediaType as SourceBinaryResource['mediaType']
      const provenanceClass = record.provenanceClass as SourceBinaryResource['provenanceClass']
      return {
        resourceId,
        canonicalReference: indexRecord.canonicalReference,
        path: record.path,
        sourcePath: verifyFileRecord(rootPath, record),
        mediaType,
        bytes: record.bytes,
        sha256: record.sha256,
        licenseExpression: record.licenseExpression,
        provenanceClass,
        redistributionStatus: record.redistributionStatus,
        resourceRecord,
      }
    })
    .sort((left, right) => compareCodeUnits(left.resourceId, right.resourceId))
  if (binaryResources.length !== binaryIndex.size) fail('Binary resource inventory is not bijective.')

  const releaseBinding = manifest.contractBindings.releaseProfile
    ?? fail('Source JSON manifest lacks releaseProfile contract binding.')
  const releaseProfileRecord = recordByPath.get(releaseBinding.path)
    ?? fail('Source JSON release-profile binding lacks a file record.')
  const releaseProfileDocument = readJson<JsonObject>(sourceFilePath(rootPath, releaseBinding.path), 'source JSON release profile')
  const trustedContractSchemas = releaseProfileDocument.trustedContractSchemas
  if (releaseProfileDocument.profileId !== 'full-standalone-v1' || !Array.isArray(trustedContractSchemas)) {
    fail('Source JSON release profile is not full-standalone-v1.')
  }
  const releaseSupport: SourceReleaseSupport[] = (trustedContractSchemas as JsonValue[]).map((value, index) => {
    const binding = jsonObject(value, `trusted source JSON schema ${index}`)
    if (typeof binding.id !== 'string' || typeof binding.sha256 !== 'string') fail('Source JSON schema binding is malformed.')
    const targetPath = `schemas/${(binding.id as string).split('/').at(-1)}`
    const record = recordByPath.get(targetPath) ?? fail(`Source JSON schema file record is missing: ${targetPath}`)
    if (record.sha256 !== binding.sha256 || record.role !== 'schema') fail(`Source JSON schema trust binding differs: ${targetPath}`)
    return {
      supportType: 'json-contract-schema',
      supportId: supportIdForSchema(targetPath),
      targetPath,
      path: `support/json/${targetPath}`,
      sourcePath: verifyFileRecord(rootPath, record),
      mediaType: 'application/schema+json',
      bytes: record.bytes,
      sha256: record.sha256,
      licenseExpression: record.licenseExpression,
      provenanceClass: mapProvenance(record.provenanceClass),
      redistributionStatus: record.redistributionStatus === 'allowed' ? 'allowed' : 'review-required',
    }
  })
  if (releaseSupport.length !== 22) fail(`Source JSON release profile must bind exactly 22 schemas, got ${releaseSupport.length}.`)
  releaseSupport.push({
    supportType: 'json-release-profile',
    supportId: 'full-standalone-v1',
    targetPath: releaseBinding.path,
    path: `support/json/${releaseBinding.path}`,
    sourcePath: verifyFileRecord(rootPath, releaseProfileRecord),
    mediaType: 'application/json',
    bytes: releaseProfileRecord.bytes,
    sha256: releaseProfileRecord.sha256,
    licenseExpression: releaseProfileRecord.licenseExpression,
    provenanceClass: mapProvenance(releaseProfileRecord.provenanceClass),
    redistributionStatus: releaseProfileRecord.redistributionStatus === 'allowed' ? 'allowed' : 'review-required',
  })
  REVIEW_SUPPORT.forEach(([supportType, supportId, targetPath]) => {
    const record = recordByPath.get(targetPath) ?? fail(`Source JSON review support is missing: ${targetPath}`)
    releaseSupport.push({
      supportType,
      supportId,
      targetPath,
      path: `support/json/${targetPath}`,
      sourcePath: verifyFileRecord(rootPath, record),
      mediaType: mediaTypeForSupport(record.mediaType),
      bytes: record.bytes,
      sha256: record.sha256,
      licenseExpression: record.licenseExpression,
      provenanceClass: mapProvenance(record.provenanceClass),
      redistributionStatus: record.redistributionStatus === 'allowed' ? 'allowed' : 'review-required',
    })
  })
  manifest.files
    .filter((record) => record.path.startsWith('data/assessment-sources/') && record.path.endsWith('.md'))
    .forEach((record) => {
      releaseSupport.push({
        supportType: 'assessment-source',
        supportId: record.path,
        targetPath: record.path,
        path: `support/json/${record.path}`,
        sourcePath: verifyFileRecord(rootPath, record),
        mediaType: 'text/markdown',
        bytes: record.bytes,
        sha256: record.sha256,
        licenseExpression: record.licenseExpression,
        provenanceClass: mapProvenance(record.provenanceClass),
        redistributionStatus: record.redistributionStatus === 'allowed' ? 'allowed' : 'review-required',
      })
    })
  releaseSupport.sort((left, right) => compareCodeUnits(left.path, right.path))
  if (new Set(releaseSupport.map((record) => record.path)).size !== releaseSupport.length) {
    fail('Release-support paths are not unique.')
  }

  const sourceContractBindings: ValidatedSourceJsonPackage['sourceContractBindings'] = {}
  SOURCE_CONTRACT_NAMES.forEach((name) => {
    const binding = manifest.contractBindings[name] ?? fail(`Source JSON manifest lacks semantic contract ${name}.`)
    const record = recordByPath.get(binding.path) ?? fail(`Source JSON semantic contract file is missing: ${name}`)
    if (record.sha256 !== binding.sha256) fail(`Source JSON semantic contract file differs: ${name}`)
    sourceContractBindings[name] = { id: binding.id, path: binding.path, sha256: binding.sha256 }
  })

  return {
    zipPath,
    zipFile: basename(zipPath),
    zipBytes: zipIntegrity.bytes,
    zipSha256: zipIntegrity.sha256,
    manifestPath,
    manifestBytes: manifestIntegrity.bytes,
    manifestSha256: manifestIntegrity.sha256,
    rootPath,
    manifest,
    validationReport,
    semanticContentIndexPath,
    semanticContentIndexBytes: semanticRecord.bytes,
    semanticContentIndexSha256: semanticRecord.sha256,
    semanticContentIndex,
    logicalArtifacts,
    binaryResources,
    releaseSupport,
    sourceContractBindings,
  }
}

export const loadValidatedSourceJsonPackage = (
  zipPath: string,
  rootPath: string,
  validationReportPath: string,
) => {
  const resolvedZip = resolve(zipPath)
  const resolvedRoot = resolve(rootPath)
  const resolvedReport = resolve(validationReportPath)
  return loadSourceFromRoot(
    resolvedZip,
    resolvedRoot,
    readJson<JsonObject>(resolvedReport, 'source JSON validation report'),
  )
}

export const prepareValidatedSourceJsonPackage = (
  zipPath: string,
  options: {
    workDirectory: string
    sourceRoot?: string
    validatorPath?: string
  },
): PreparedSourceJsonPackage => {
  const resolvedZip = resolve(zipPath)
  const workDirectory = resolve(options.workDirectory)
  if (!isStrictDescendant(resolve(repositoryRoot, 'tmp'), workDirectory)) {
    fail(`Source preparation work directory must be below ${resolve(repositoryRoot, 'tmp')}.`)
  }
  assertNoSymlinkComponents(repositoryRoot, workDirectory, true)
  mkdirSync(workDirectory, { recursive: true, mode: 0o700 })
  const zipBefore = fileIntegrity(resolvedZip)
  const token = `${process.pid}-${randomBytes(12).toString('hex')}`
  const stagePath = resolve(workDirectory, `.fwu-owl-source-${token}`)
  const validationReportPath = resolve(workDirectory, `.fwu-owl-source-validation-${token}.json`)
  let ownsStage = false
  try {
    const validatorPath = resolve(repositoryRoot, options.validatorPath ?? 'scripts/validate_full_standalone_curriculum_package.py')
    execFileSync('python3', [
      '-B', validatorPath,
      '--zip', resolvedZip,
      '--report', validationReportPath,
    ], { cwd: repositoryRoot, stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 16 * 1024 * 1024 })
    const validationReport = readJson<JsonObject>(validationReportPath, 'source JSON validation report')
    let rootPath: string
    if (options.sourceRoot) {
      rootPath = resolve(options.sourceRoot)
      assertNoSymlinkComponents(repositoryRoot, rootPath, false)
    } else {
      mkdirSync(stagePath, { recursive: false, mode: 0o700 })
      ownsStage = true
      execFileSync('unzip', ['-qq', resolvedZip, '-d', stagePath], {
        cwd: repositoryRoot,
        stdio: ['ignore', 'pipe', 'pipe'],
        maxBuffer: 16 * 1024 * 1024,
      })
      const reportPackage = jsonObject(validationReport.package, 'source validation package')
      if (typeof reportPackage.archiveRoot !== 'string') fail('Source validation report lacks archiveRoot.')
      rootPath = resolve(stagePath, reportPackage.archiveRoot as string)
    }
    const source = loadSourceFromRoot(resolvedZip, rootPath, validationReport, zipBefore)
    const zipAfter = fileIntegrity(resolvedZip)
    if (zipAfter.bytes !== zipBefore.bytes || zipAfter.sha256 !== zipBefore.sha256) {
      fail('Source JSON ZIP changed while being validated and prepared.')
    }
    return {
      source,
      cleanup: () => {
        rmSync(validationReportPath, { force: true })
        if (ownsStage) rmSync(stagePath, { recursive: true, force: true })
      },
    }
  } catch (error) {
    rmSync(validationReportPath, { force: true })
    if (ownsStage) rmSync(stagePath, { recursive: true, force: true })
    throw error
  }
}
