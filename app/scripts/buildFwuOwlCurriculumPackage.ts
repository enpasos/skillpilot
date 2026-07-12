import { execFileSync } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
} from 'node:fs'
import { basename, dirname, relative, resolve, sep } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import {
  createDeterministicZip32,
  type DeterministicZip32Entry,
  type DeterministicZip32Limits,
} from './deterministicZip32'
import {
  assertNoSymlinkComponents,
  assertSafePackagePath,
  fileIntegrity,
  inlineIntegrity,
  prepareValidatedSourceJsonPackage,
  repositoryRoot as defaultRepositoryRoot,
  type JsonObject,
  type ValidatedSourceJsonPackage,
} from './fwuOwlPackageSource'
import {
  compileFwuOwlSemantics,
  FWU_OWL_SEGMENT_ORDER,
} from './fwuOwlSemanticCompiler'

type StaticBinding = {
  bindingName: string
  id: string
  sourcePath: string
  packagePath: string
  bytes: number
  sha256: string
}

type PackageRolePolicy = {
  role: string
  minimum: number
  maximum: number
  mediaTypes: string[]
  semanticBindingKinds: string[]
}

type FwuOwlPackageProfile = {
  profileFormatVersion: number
  profileId: string
  profileVersion: string
  compatibility: {
    packageFormatVersion: string
    variant: string
    manifestSchemaId: string
    validationReportSchemaId: string
  }
  inventoryPolicy: {
    excludedPaths: string[]
    requireExactFileSet: boolean
  }
  archiveLimits: {
    outerZipBytes: number
    entryCount: number
    genericEntryBytes: number
    rdfSegmentBytes: number
    rdfBundleBytes: number
    binaryResourceBytes: number
    binaryLaneBytes: number
    totalUncompressedBytes: number
    archivePathBytes: number
    jsonEntryBytes: number
  }
  manifestLimits: {
    manifestBytes: number
    fileRecords: number
    licenseDocuments: number
  }
  checksumPolicy: {
    path: string
    format: string
    entryOrder: string
    coverage: string
    selfEntryAllowed: boolean
    finalNewline: boolean
  }
  rdfPolicy: {
    segmentOrder: string[]
    bundlePath: string
    bundleConstruction: string
  }
  coreBindingPolicy: {
    canonicalOntologyIri: string
    sourceRepository: string
    sourceCommit: string
    sourcePath: string
    bundledPath: string
    catalogPath: string
    catalogSourcePath: string
    catalogMediaType: string
    catalogBytes: number
    catalogSha256: string
    mediaType: string
    syntax: string
    bytes: number
    sha256: string
  }
  applicationProfilePolicy: {
    ontologyIri: string
    versionIri: string
    version: string
    requiredImports: string[]
    sourcePath: string
    packagePath: string
    mediaType: string
    bytes: number
    sha256: string
  }
  shapesPolicy: {
    shapesIri: string
    versionIri: string
    version: string
    sourcePath: string
    packagePath: string
    mediaType: string
    bytes: number
    sha256: string
  }
  schemaCatalogPolicy: {
    path: string
    schemaId: string
    dialect: string
    requiredSchemaIds: string[]
    expectedEntryCount: number
  }
  contractPolicy: {
    requiredBindings: string[]
    trustedBootstrapSchemas: StaticBinding[]
    trustedGlobalContracts: StaticBinding[]
  }
  semanticContentPolicy: {
    indexPath: string
  }
  releaseSupportPolicy: {
    jsonContractSchemaCount: number
    assessmentSourceMinimum: number
    assessmentSourceMaximum: number
    trustedJsonReleaseProfile: {
      id: string
      targetPath: string
      packagePath: string
      bytes: number
      sha256: string
      trustedSchemaCount: number
    }
  }
  resourceCapabilities: {
    embeddedBinaryMediaTypes: string[]
  }
  roles: PackageRolePolicy[]
  reproducibility: {
    zipFormat: string
    compression: string
    entryOrder: string
    timestampPolicy: string
    locale: string
    timezone: string
    unixMode: string
    doubleBuildRequired: boolean
  }
}

type ContractBinding = {
  id: string
  path: string
  bytes: number
  sha256: string
}

type FileSemanticBinding =
  | { kind: 'normative-rdf-segment'; segmentId: string; position: number }
  | { kind: 'generated-rdf-bundle'; construction: string }
  | { kind: 'contract'; bindingName: string }
  | { kind: 'schema-catalog' }
  | { kind: 'semantic-content-index' }
  | { kind: 'ontology-core' }
  | { kind: 'ontology-profile' }
  | { kind: 'ontology-shapes' }
  | { kind: 'ontology-catalog' }
  | { kind: 'binary-resource'; resourceId: string; publicReference: string }
  | {
    kind: 'release-support'
    supportType: string
    supportId: string
    targetPath: string
  }
  | { kind: 'license'; licenseId: string }

export type FwuOwlManifestFile = {
  path: string
  role: string
  mediaType: string
  bytes: number
  sha256: string
  semanticBinding: FileSemanticBinding
  licenseExpression: string | null
  provenanceClass:
    | 'skillpilot-authored'
    | 'fwu-core-pinned-copy'
    | 'official-source-metadata'
    | 'ai-generated-curated'
    | 'user-provided-generated-claim'
    | 'third-party'
    | 'generated-package-metadata'
  redistributionStatus: 'allowed' | 'review-required'
}

type ManifestFileInput = Omit<FwuOwlManifestFile, 'bytes' | 'sha256'>

export type FwuOwlPackageEntry = {
  relativePath: string
  content?: Buffer
  sourcePath?: string
  bytes: number
  sha256: string
  crc32: number
  manifestFile?: FwuOwlManifestFile
}

export type FwuOwlPackagePlan = {
  archiveRoot: string
  sourceDateEpoch: number
  entries: FwuOwlPackageEntry[]
  manifest: Record<string, unknown>
  manifestBytes: number
  manifestSha256: string
  manifestFileCount: number
  binaryResourceCount: number
  releaseSupportCount: number
  logicalArtifactCount: number
  fieldRegistryEntryCount: number
  rdfTriples: number
  generatedFallbackAreaCount: number
  contentDigest: string
  zipLimits: DeterministicZip32Limits
}

export type CreateFwuOwlPackagePlanOptions = {
  source: ValidatedSourceJsonPackage
  repositoryRoot?: string
  coreCheckout?: string
  packageProfilePath?: string
  archiveRoot?: string
  sourceDateEpoch?: number
  expectedManifestFileCount?: number
  expectedEntryCount?: number
  expectedBinaryResourceCount?: number
  expectedReleaseSupportCount?: number
  expectedLogicalArtifactCount?: number
  expectedContentDigest?: string
  expectedFallbackAreaCount?: number
}

export type MaterializedFwuOwlPackage = {
  path: string
  bytes: number
  sha256: string
  manifestSha256: string
}

export type FwuOwlPackagePair = {
  archiveRoot: string
  sourceDateEpoch: number
  contentDigest: string
  primary: MaterializedFwuOwlPackage
  reproducibilityPeer: MaterializedFwuOwlPackage
  byteIdentical: boolean
  manifestFileCount: number
  entryCount: number
  binaryResourceCount: number
  releaseSupportCount: number
  logicalArtifactCount: number
  fieldRegistryEntryCount: number
  rdfTriples: number
  generatedFallbackAreaCount: number
}

export type BuildFwuOwlPackagePairOptions = Omit<CreateFwuOwlPackagePlanOptions, 'source'> & {
  source: ValidatedSourceJsonPackage
  outputDirectory: string
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const DEFAULT_PACKAGE_PROFILE = 'contracts/curriculum-package/v1/profiles/fwu-owl-v1.profile.json'
const DEFAULT_CORE_CHECKOUT = 'tmp/lehrplan-ontologie'
const DEFAULT_WORK_DIRECTORY = 'tmp/fwu-owl-package-builder-work'
const DEFAULT_OUTPUT_DIRECTORY = 'tmp/curriculum-release-model/fwu-owl-package'
const MANIFEST_PATH = 'metadata/manifest.json'
const CHECKSUMS_PATH = 'metadata/SHA256SUMS'
const FIXED_MINIMUM_ZIP_EPOCH = 315532800
const MAXIMUM_ZIP_EPOCH = 4354819199
const ARCHIVE_ROOT_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9._-]*[A-Za-z0-9])?$/u
const LICENSE_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9.+-]*$/u
const SOURCE_CONTRACT_NAMES = [
  'semanticNormalForm',
  'fieldSemanticsRegistry',
  'definitionDigestProfile',
  'curriculumOntologyProfile',
  'publicationEvidenceProfile',
] as const

const compareCodeUnits = (left: string, right: string) => (left < right ? -1 : left > right ? 1 : 0)
const fail = (message: string): never => { throw new Error(message) }
const jsonBytes = (value: unknown) => Buffer.from(`${JSON.stringify(value, null, 2)}\n`, 'utf8')

const readJson = <T>(path: string, label: string): T => {
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as T
  } catch (error) {
    return fail(`Cannot parse ${label} at ${path}: ${error instanceof Error ? error.message : String(error)}`)
  }
}

const validateJsonDocument = (
  document: unknown,
  schemaPath: string,
  label: string,
) => {
  const schema = readJson<object>(schemaPath, `${label} schema`)
  const validator = new Ajv2020({
    allErrors: true,
    strict: true,
    strictTuples: false,
    strictTypes: false,
    validateFormats: true,
  })
  addFormats(validator)
  const validate = validator.compile(schema)
  if (!validate(document)) {
    const diagnostics = (validate.errors ?? [])
      .slice(0, 20)
      .map((error) => `${error.instancePath || '/'} ${error.message ?? 'is invalid'}`)
      .join('; ')
    fail(`${label} does not satisfy its bound JSON Schema: ${diagnostics}`)
  }
}

const absoluteRepositoryPath = (repositoryRoot: string, repositoryPath: string, label: string) => {
  assertSafePackagePath(repositoryPath, `${label} repository path`)
  const absolute = resolve(repositoryRoot, repositoryPath)
  assertNoSymlinkComponents(repositoryRoot, absolute, false)
  const metadata = lstatSync(absolute)
  if (!metadata.isFile() || metadata.isSymbolicLink()) fail(`${label} is not a regular repository file: ${absolute}`)
  return absolute
}

const sourcePackagePath = (source: ValidatedSourceJsonPackage, packagePath: string, label: string) => {
  assertSafePackagePath(packagePath, `${label} source-package path`)
  const absolute = resolve(source.rootPath, packagePath)
  assertNoSymlinkComponents(source.rootPath, absolute, false)
  const metadata = lstatSync(absolute)
  if (!metadata.isFile() || metadata.isSymbolicLink()) fail(`${label} is not a regular source-package file: ${absolute}`)
  return absolute
}

const assertIntegrity = (
  path: string,
  expected: { bytes: number; sha256: string },
  label: string,
) => {
  const actual = fileIntegrity(path)
  if (actual.bytes !== expected.bytes || actual.sha256 !== expected.sha256) {
    fail(`${label} differs from its pinned byte binding.`)
  }
  return actual
}

const assertSourceZipIntegrity = (source: ValidatedSourceJsonPackage, phase: string) => {
  const actual = fileIntegrity(source.zipPath)
  if (actual.bytes !== source.zipBytes || actual.sha256 !== source.zipSha256) {
    fail(`Source JSON ZIP changed ${phase}.`)
  }
}

const checkedSourceDateEpoch = (value: number | undefined) => {
  const candidate = value ?? FIXED_MINIMUM_ZIP_EPOCH
  if (!Number.isSafeInteger(candidate) || candidate < 0 || candidate > MAXIMUM_ZIP_EPOCH) {
    fail(`SOURCE_DATE_EPOCH must be an integer between 0 and ${MAXIMUM_ZIP_EPOCH}, got ${candidate}.`)
  }
  return Math.max(candidate, FIXED_MINIMUM_ZIP_EPOCH)
}

const defaultArchiveRoot = (sourceRoot: string) => sourceRoot.endsWith('.json')
  ? `${sourceRoot.slice(0, -'.json'.length)}.fwu-owl`
  : `${sourceRoot}.fwu-owl`

const assertArchiveRoot = (archiveRoot: string) => {
  if (archiveRoot.length > 180 || !ARCHIVE_ROOT_PATTERN.test(archiveRoot)) {
    fail(`FWU-OWL archive root is not portable: ${archiveRoot}`)
  }
  assertSafePackagePath(archiveRoot, 'FWU-OWL archive root')
}

const mappedProvenance = (value: string): FwuOwlManifestFile['provenanceClass'] => {
  if (value === 'software-contract' || value === 'skillpilot-authored') return 'skillpilot-authored'
  if (value === 'generated-metadata') return 'generated-package-metadata'
  if (value === 'official-source-metadata') return 'official-source-metadata'
  if (value === 'ai-generated-curated') return 'ai-generated-curated'
  if (value === 'user-provided-generated-claim') return 'user-provided-generated-claim'
  if (value === 'third-party') return 'third-party'
  return fail(`Cannot map source provenance class into FWU-OWL v1: ${value}`)
}

const assertLicenseState = (record: ManifestFileInput) => {
  if (record.redistributionStatus === 'allowed' && typeof record.licenseExpression !== 'string') {
    fail(`Allowed FWU-OWL file has no license expression: ${record.path}`)
  }
  if (record.redistributionStatus === 'review-required' && record.licenseExpression !== null) {
    fail(`Review-required FWU-OWL file must have a null license expression: ${record.path}`)
  }
}

class PackageEntries {
  readonly entries: FwuOwlPackageEntry[] = []
  private readonly byPath = new Map<string, FwuOwlPackageEntry>()

  private add(entry: FwuOwlPackageEntry) {
    assertSafePackagePath(entry.relativePath)
    if (this.byPath.has(entry.relativePath)) fail(`Duplicate FWU-OWL package path: ${entry.relativePath}`)
    this.byPath.set(entry.relativePath, entry)
    this.entries.push(entry)
    return entry
  }

  addInline(relativePath: string, content: Buffer, manifestInput?: ManifestFileInput) {
    const integrity = inlineIntegrity(content)
    if (manifestInput && manifestInput.path !== relativePath) fail(`Inline manifest path differs: ${relativePath}`)
    if (manifestInput) assertLicenseState(manifestInput)
    return this.add({
      relativePath,
      content,
      ...integrity,
      ...(manifestInput ? { manifestFile: { ...manifestInput, bytes: integrity.bytes, sha256: integrity.sha256 } } : {}),
    })
  }

  addSource(
    relativePath: string,
    sourcePath: string,
    expected: { bytes: number; sha256: string },
    manifestInput?: ManifestFileInput,
  ) {
    const integrity = assertIntegrity(sourcePath, expected, relativePath)
    if (manifestInput && manifestInput.path !== relativePath) fail(`Source manifest path differs: ${relativePath}`)
    if (manifestInput) assertLicenseState(manifestInput)
    return this.add({
      relativePath,
      sourcePath,
      ...integrity,
      ...(manifestInput ? { manifestFile: { ...manifestInput, bytes: integrity.bytes, sha256: integrity.sha256 } } : {}),
    })
  }
}

const staticAllowedFile = (
  path: string,
  role: string,
  mediaType: string,
  semanticBinding: FileSemanticBinding,
): ManifestFileInput => ({
  path,
  role,
  mediaType,
  semanticBinding,
  licenseExpression: 'Apache-2.0',
  provenanceClass: 'skillpilot-authored',
  redistributionStatus: 'allowed',
})

const sourceRecordByPath = (source: ValidatedSourceJsonPackage, path: string) => source.manifest.files.find(
  (record) => record.path === path,
) ?? fail(`Source manifest file record is missing: ${path}`)

const validatePackageProfile = (profile: FwuOwlPackageProfile) => {
  if (
    profile.profileFormatVersion !== 1
    || profile.profileId !== 'fwu-owl-v1'
    || profile.compatibility.packageFormatVersion !== '1.0'
    || profile.compatibility.variant !== 'fwu-owl'
    || profile.rdfPolicy.segmentOrder.join('\n') !== FWU_OWL_SEGMENT_ORDER.join('\n')
    || profile.rdfPolicy.bundlePath !== 'rdf/bundle.nt'
    || profile.rdfPolicy.bundleConstruction !== 'ordered-rdf-segment-byte-concatenation-v1'
    || profile.reproducibility.zipFormat !== 'zip32'
    || profile.reproducibility.compression !== 'store'
    || profile.reproducibility.locale !== 'C.UTF-8'
    || profile.reproducibility.timezone !== 'UTC'
    || profile.reproducibility.unixMode !== '0644'
    || profile.reproducibility.doubleBuildRequired !== true
    || profile.inventoryPolicy.requireExactFileSet !== true
  ) fail('FWU-OWL package profile identity, segment, or reproducibility policy drifted.')
  if (
    profile.inventoryPolicy.excludedPaths.length !== 2
    || !profile.inventoryPolicy.excludedPaths.includes(MANIFEST_PATH)
    || !profile.inventoryPolicy.excludedPaths.includes(CHECKSUMS_PATH)
    || profile.checksumPolicy.path !== CHECKSUMS_PATH
    || profile.checksumPolicy.selfEntryAllowed !== false
    || profile.checksumPolicy.finalNewline !== true
  ) fail('FWU-OWL metadata/checksum exclusion policy drifted.')
}

const validateSourceProfileBindings = (
  source: ValidatedSourceJsonPackage,
  profile: FwuOwlPackageProfile,
) => {
  const globalByName = new Map(profile.contractPolicy.trustedGlobalContracts.map((binding) => [binding.bindingName, binding]))
  for (const name of SOURCE_CONTRACT_NAMES) {
    const sourceBinding = source.sourceContractBindings[name]
      ?? fail(`Source package lacks semantic contract ${name}.`)
    const global = globalByName.get(name)
    if (global && (global.id !== sourceBinding.id || global.sha256 !== sourceBinding.sha256)) {
      fail(`Source package semantic contract ${name} differs from the FWU-OWL trust root.`)
    }
  }
}

const buildSchemaCatalog = (
  profile: FwuOwlPackageProfile,
  source: ValidatedSourceJsonPackage,
) => {
  const byId = new Map<string, {
    id: string
    path: string
    dialect: string
    bytes: number
    sha256: string
  }>()
  for (const binding of profile.contractPolicy.trustedBootstrapSchemas) {
    byId.set(binding.id, {
      id: binding.id,
      path: binding.packagePath,
      dialect: profile.schemaCatalogPolicy.dialect,
      bytes: binding.bytes,
      sha256: binding.sha256,
    })
  }
  for (const support of source.releaseSupport.filter((record) => record.supportType === 'json-contract-schema')) {
    const schema = readJson<Record<string, unknown>>(support.sourcePath, `reverse-support schema ${support.targetPath}`)
    const id = typeof schema.$id === 'string' ? schema.$id : fail(`Reverse-support schema has no $id: ${support.targetPath}`)
    const existing = byId.get(id)
    if (existing) {
      if (existing.bytes !== support.bytes || existing.sha256 !== support.sha256) {
        fail(`Bootstrap/reverse-support schema binding conflict: ${id}`)
      }
      continue
    }
    byId.set(id, {
      id,
      path: support.path,
      dialect: profile.schemaCatalogPolicy.dialect,
      bytes: support.bytes,
      sha256: support.sha256,
    })
  }
  const requiredIds = [...profile.schemaCatalogPolicy.requiredSchemaIds].sort(compareCodeUnits)
  const actualIds = [...byId].map(([id]) => id).sort(compareCodeUnits)
  if (
    byId.size !== profile.schemaCatalogPolicy.expectedEntryCount
    || requiredIds.join('\n') !== actualIds.join('\n')
  ) fail('Offline FWU-OWL schema catalog does not equal its closed 25-schema trust set.')
  return {
    $schema: profile.schemaCatalogPolicy.schemaId,
    catalogFormatVersion: 1,
    entries: actualIds.map((id) => byId.get(id) as NonNullable<ReturnType<typeof byId.get>>),
  }
}

const verifyCoreCheckout = (
  repositoryRoot: string,
  coreCheckout: string,
  profile: FwuOwlPackageProfile,
) => {
  const resolvedCheckout = resolve(repositoryRoot, coreCheckout)
  assertNoSymlinkComponents(repositoryRoot, resolvedCheckout, false)
  const commit = execFileSync('git', ['-C', resolvedCheckout, 'rev-parse', 'HEAD'], {
    cwd: repositoryRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim()
  if (commit !== profile.coreBindingPolicy.sourceCommit) {
    fail(`FWU Core checkout commit ${commit} differs from ${profile.coreBindingPolicy.sourceCommit}.`)
  }
  const corePath = resolve(resolvedCheckout, profile.coreBindingPolicy.sourcePath)
  assertNoSymlinkComponents(resolvedCheckout, corePath, false)
  assertIntegrity(corePath, profile.coreBindingPolicy, 'FWU Core')
  return corePath
}

const validateCurriculumCoreBinding = (
  curriculumProfile: JsonObject,
  profile: FwuOwlPackageProfile,
) => {
  const value = curriculumProfile.coreBinding
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail('Curriculum ontology profile lacks coreBinding.')
  const binding = value as JsonObject
  if (
    binding.ontologyIri !== profile.coreBindingPolicy.canonicalOntologyIri
    || binding.commit !== profile.coreBindingPolicy.sourceCommit
    || binding.sourcePath !== profile.coreBindingPolicy.sourcePath
    || binding.fileSha256 !== profile.coreBindingPolicy.sha256
  ) fail('Curriculum ontology profile Core binding differs from the FWU-OWL package profile.')
}

const addContractFile = (
  entries: PackageEntries,
  binding: StaticBinding,
  repositoryRoot: string,
  role: 'contract-schema' | 'contract',
  mediaType: 'application/schema+json' | 'application/json',
) => {
  const sourcePath = absoluteRepositoryPath(repositoryRoot, binding.sourcePath, binding.bindingName)
  entries.addSource(
    binding.packagePath,
    sourcePath,
    binding,
    staticAllowedFile(
      binding.packagePath,
      role,
      mediaType,
      { kind: 'contract', bindingName: binding.bindingName },
    ),
  )
  return {
    id: binding.id,
    path: binding.packagePath,
    bytes: binding.bytes,
    sha256: binding.sha256,
  }
}

const addSourceContractFile = (
  entries: PackageEntries,
  source: ValidatedSourceJsonPackage,
  bindingName: 'curriculumOntologyProfile' | 'publicationEvidenceProfile',
) => {
  const binding = source.sourceContractBindings[bindingName]
    ?? fail(`Source semantic contract is missing: ${bindingName}`)
  const sourceRecord = sourceRecordByPath(source, binding.path)
  const packagePath = `contracts/${basename(binding.path)}`
  const sourcePath = sourcePackagePath(source, binding.path, bindingName)
  entries.addSource(packagePath, sourcePath, sourceRecord, {
    path: packagePath,
    role: 'contract',
    mediaType: 'application/json',
    semanticBinding: { kind: 'contract', bindingName },
    licenseExpression: sourceRecord.licenseExpression,
    provenanceClass: mappedProvenance(sourceRecord.provenanceClass),
    redistributionStatus: sourceRecord.redistributionStatus === 'allowed' ? 'allowed' : 'review-required',
  })
  return {
    id: binding.id,
    path: packagePath,
    bytes: sourceRecord.bytes,
    sha256: sourceRecord.sha256,
  }
}

const validateFileInventory = (
  profile: FwuOwlPackageProfile,
  archiveRoot: string,
  files: FwuOwlManifestFile[],
) => {
  if (files.length > profile.manifestLimits.fileRecords) fail('FWU-OWL manifest file-record limit exceeded.')
  const byRole = new Map<string, number>()
  let totalBytes = 0
  let binaryBytes = 0
  for (const file of files) {
    totalBytes += file.bytes
    byRole.set(file.role, (byRole.get(file.role) ?? 0) + 1)
    const fullPathBytes = Buffer.byteLength(`${archiveRoot}/${file.path}`, 'utf8')
    if (fullPathBytes > profile.archiveLimits.archivePathBytes) fail(`FWU-OWL full archive path is too long: ${file.path}`)
    const rolePolicy = profile.roles.find((rule) => rule.role === file.role)
      ?? fail(`Unknown FWU-OWL manifest role: ${file.role}`)
    if (!rolePolicy.mediaTypes.includes(file.mediaType) || !rolePolicy.semanticBindingKinds.includes(file.semanticBinding.kind)) {
      fail(`FWU-OWL role/media/semantic mismatch: ${file.path}`)
    }
    let maximum = profile.archiveLimits.genericEntryBytes
    if (file.role === 'rdf-segment') maximum = profile.archiveLimits.rdfSegmentBytes
    else if (file.role === 'rdf-bundle') maximum = profile.archiveLimits.rdfBundleBytes
    else if (file.role === 'binary-resource') maximum = profile.archiveLimits.binaryResourceBytes
    else if (file.mediaType === 'application/json' || file.mediaType === 'application/schema+json') {
      maximum = profile.archiveLimits.jsonEntryBytes
    }
    if (file.bytes > maximum) fail(`FWU-OWL entry exceeds its profile byte limit: ${file.path}`)
    if (file.role === 'binary-resource') binaryBytes += file.bytes
  }
  if (totalBytes > profile.archiveLimits.totalUncompressedBytes) fail('FWU-OWL uncompressed inventory byte limit exceeded.')
  if (binaryBytes > profile.archiveLimits.binaryLaneBytes) fail('FWU-OWL binary-resource lane byte limit exceeded.')
  for (const rule of profile.roles) {
    const count = byRole.get(rule.role) ?? 0
    if (count < rule.minimum || count > rule.maximum) {
      fail(`FWU-OWL role ${rule.role} count ${count} is outside ${rule.minimum}..${rule.maximum}.`)
    }
  }
}

const expectedCount = (actual: number, expected: number | undefined, label: string) => {
  if (expected !== undefined && actual !== expected) fail(`${label} differs: ${actual} != ${expected}.`)
}

export const createFwuOwlCurriculumPackagePlan = (
  options: CreateFwuOwlPackagePlanOptions,
): FwuOwlPackagePlan => {
  assertSourceZipIntegrity(options.source, 'before FWU-OWL plan construction')
  const repositoryRoot = resolve(options.repositoryRoot ?? defaultRepositoryRoot)
  const packageProfileRepositoryPath = options.packageProfilePath ?? DEFAULT_PACKAGE_PROFILE
  const packageProfilePath = absoluteRepositoryPath(repositoryRoot, packageProfileRepositoryPath, 'FWU-OWL package profile')
  const packageProfileIntegrity = fileIntegrity(packageProfilePath)
  const canonicalPackageProfilePath = absoluteRepositoryPath(
    repositoryRoot,
    DEFAULT_PACKAGE_PROFILE,
    'canonical FWU-OWL package profile',
  )
  const canonicalPackageProfileIntegrity = fileIntegrity(canonicalPackageProfilePath)
  if (
    packageProfileIntegrity.bytes !== canonicalPackageProfileIntegrity.bytes
    || packageProfileIntegrity.sha256 !== canonicalPackageProfileIntegrity.sha256
  ) fail('FWU-OWL package profile differs from the repository trust root.')
  const packageProfileSchemaPath = absoluteRepositoryPath(
    repositoryRoot,
    'contracts/curriculum-package/v1/fwu-owl-package-profile.schema.json',
    'FWU-OWL package-profile schema',
  )
  const profileDocument = readJson<JsonObject>(packageProfilePath, 'FWU-OWL package profile')
  validateJsonDocument(profileDocument, packageProfileSchemaPath, 'FWU-OWL package profile')
  const profile = profileDocument as unknown as FwuOwlPackageProfile
  validatePackageProfile(profile)
  validateSourceProfileBindings(options.source, profile)

  const archiveRoot = options.archiveRoot ?? defaultArchiveRoot(options.source.manifest.archiveRoot)
  assertArchiveRoot(archiveRoot)
  const sourceDateEpoch = checkedSourceDateEpoch(options.sourceDateEpoch)
  const entries = new PackageEntries()
  const contractBindings: Record<string, ContractBinding> = {}

  for (const binding of profile.contractPolicy.trustedBootstrapSchemas) {
    contractBindings[binding.bindingName] = addContractFile(
      entries,
      binding,
      repositoryRoot,
      'contract-schema',
      'application/schema+json',
    )
  }

  const packageProfilePackagePath = 'profiles/fwu-owl-v1.profile.json'
  entries.addSource(
    packageProfilePackagePath,
    packageProfilePath,
    packageProfileIntegrity,
    staticAllowedFile(
      packageProfilePackagePath,
      'package-profile',
      'application/json',
      { kind: 'contract', bindingName: 'packageProfile' },
    ),
  )
  contractBindings.packageProfile = {
    id: profile.profileId,
    path: packageProfilePackagePath,
    bytes: packageProfileIntegrity.bytes,
    sha256: packageProfileIntegrity.sha256,
  }

  for (const binding of profile.contractPolicy.trustedGlobalContracts) {
    contractBindings[binding.bindingName] = addContractFile(
      entries,
      binding,
      repositoryRoot,
      'contract',
      'application/json',
    )
  }
  contractBindings.curriculumOntologyProfile = addSourceContractFile(
    entries,
    options.source,
    'curriculumOntologyProfile',
  )
  contractBindings.publicationEvidenceProfile = addSourceContractFile(
    entries,
    options.source,
    'publicationEvidenceProfile',
  )
  const requiredBindingNames = [...profile.contractPolicy.requiredBindings].sort(compareCodeUnits)
  const actualBindingNames = Object.keys(contractBindings).sort(compareCodeUnits)
  if (requiredBindingNames.join('\n') !== actualBindingNames.join('\n')) {
    fail('FWU-OWL manifest contract binding set is incomplete.')
  }

  const registryBinding = profile.contractPolicy.trustedGlobalContracts.find(
    (binding) => binding.bindingName === 'fieldSemanticsRegistry',
  ) ?? fail('FWU-OWL profile has no field-semantics registry trust root.')
  const registryPath = absoluteRepositoryPath(repositoryRoot, registryBinding.sourcePath, 'field-semantics registry')
  const registryValue = readJson<JsonObject>(registryPath, 'field-semantics registry')
  const curriculumSourceBinding = options.source.sourceContractBindings.curriculumOntologyProfile
    ?? fail('Source package lacks its curriculum ontology profile.')
  const curriculumProfilePath = sourcePackagePath(
    options.source,
    curriculumSourceBinding.path,
    'curriculum ontology profile',
  )
  const curriculumProfile = readJson<JsonObject>(curriculumProfilePath, 'curriculum ontology profile')
  validateCurriculumCoreBinding(curriculumProfile, profile)
  const compilation = compileFwuOwlSemantics({
    source: options.source,
    registryValue,
    curriculumProfile,
    packageProfile: profileDocument,
  })

  const rdfSegments = FWU_OWL_SEGMENT_ORDER.map((segmentId, position) => {
    const segment = compilation.segments[segmentId]
    const path = `rdf/${segmentId}.nt`
    const entry = entries.addInline(path, segment.content, {
      path,
      role: 'rdf-segment',
      mediaType: 'application/n-triples',
      semanticBinding: { kind: 'normative-rdf-segment', segmentId, position },
      licenseExpression: null,
      provenanceClass: 'generated-package-metadata',
      redistributionStatus: 'review-required',
    })
    return {
      position,
      segmentId,
      path,
      mediaType: 'application/n-triples',
      triples: segment.tripleCount,
      bytes: entry.bytes,
      sha256: entry.sha256,
    }
  })
  const bundleContent = Buffer.concat(FWU_OWL_SEGMENT_ORDER.map((segmentId) => compilation.segments[segmentId].content))
  const bundleEntry = entries.addInline(profile.rdfPolicy.bundlePath, bundleContent, {
    path: profile.rdfPolicy.bundlePath,
    role: 'rdf-bundle',
    mediaType: 'application/n-triples',
    semanticBinding: { kind: 'generated-rdf-bundle', construction: profile.rdfPolicy.bundleConstruction },
    licenseExpression: null,
    provenanceClass: 'generated-package-metadata',
    redistributionStatus: 'review-required',
  })
  const rdfTriples = rdfSegments.reduce((sum, segment) => sum + segment.triples, 0)
  if (rdfTriples <= 0 || bundleEntry.bytes !== rdfSegments.reduce((sum, segment) => sum + segment.bytes, 0)) {
    fail('FWU-OWL RDF bundle is empty or not the exact segment byte sum.')
  }

  const schemaCatalog = buildSchemaCatalog(profile, options.source)
  const schemaCatalogSchemaBinding = profile.contractPolicy.trustedBootstrapSchemas.find(
    (binding) => binding.bindingName === 'schemaCatalogSchema',
  ) ?? fail('FWU-OWL profile lacks its schema-catalog schema binding.')
  validateJsonDocument(
    schemaCatalog,
    absoluteRepositoryPath(repositoryRoot, schemaCatalogSchemaBinding.sourcePath, 'schema-catalog schema'),
    'generated FWU-OWL schema catalog',
  )
  const schemaCatalogContent = jsonBytes(schemaCatalog)
  const schemaCatalogEntry = entries.addInline(
    profile.schemaCatalogPolicy.path,
    schemaCatalogContent,
    {
      path: profile.schemaCatalogPolicy.path,
      role: 'schema-catalog',
      mediaType: 'application/json',
      semanticBinding: { kind: 'schema-catalog' },
      licenseExpression: 'Apache-2.0',
      provenanceClass: 'generated-package-metadata',
      redistributionStatus: 'allowed',
    },
  )

  const semanticSourceRecord = sourceRecordByPath(options.source, profile.semanticContentPolicy.indexPath)
  entries.addSource(
    profile.semanticContentPolicy.indexPath,
    options.source.semanticContentIndexPath,
    { bytes: options.source.semanticContentIndexBytes, sha256: options.source.semanticContentIndexSha256 },
    {
      path: profile.semanticContentPolicy.indexPath,
      role: 'semantic-content-index',
      mediaType: 'application/json',
      semanticBinding: { kind: 'semantic-content-index' },
      licenseExpression: semanticSourceRecord.licenseExpression,
      provenanceClass: mappedProvenance(semanticSourceRecord.provenanceClass),
      redistributionStatus: semanticSourceRecord.redistributionStatus === 'allowed' ? 'allowed' : 'review-required',
    },
  )

  const corePath = verifyCoreCheckout(
    repositoryRoot,
    options.coreCheckout ?? DEFAULT_CORE_CHECKOUT,
    profile,
  )
  entries.addSource(profile.coreBindingPolicy.bundledPath, corePath, profile.coreBindingPolicy, {
    path: profile.coreBindingPolicy.bundledPath,
    role: 'ontology-core',
    mediaType: profile.coreBindingPolicy.mediaType,
    semanticBinding: { kind: 'ontology-core' },
    licenseExpression: null,
    provenanceClass: 'fwu-core-pinned-copy',
    redistributionStatus: 'review-required',
  })
  const ontologyCatalogPath = absoluteRepositoryPath(
    repositoryRoot,
    profile.coreBindingPolicy.catalogSourcePath,
    'FWU-OWL XML catalog',
  )
  entries.addSource(
    profile.coreBindingPolicy.catalogPath,
    ontologyCatalogPath,
    { bytes: profile.coreBindingPolicy.catalogBytes, sha256: profile.coreBindingPolicy.catalogSha256 },
    staticAllowedFile(
      profile.coreBindingPolicy.catalogPath,
      'ontology-catalog',
      profile.coreBindingPolicy.catalogMediaType,
      { kind: 'ontology-catalog' },
    ),
  )
  const applicationPath = absoluteRepositoryPath(
    repositoryRoot,
    profile.applicationProfilePolicy.sourcePath,
    'FWU-OWL application ontology',
  )
  entries.addSource(
    profile.applicationProfilePolicy.packagePath,
    applicationPath,
    profile.applicationProfilePolicy,
    staticAllowedFile(
      profile.applicationProfilePolicy.packagePath,
      'ontology-profile',
      profile.applicationProfilePolicy.mediaType,
      { kind: 'ontology-profile' },
    ),
  )
  const shapesPath = absoluteRepositoryPath(repositoryRoot, profile.shapesPolicy.sourcePath, 'FWU-OWL shapes')
  entries.addSource(
    profile.shapesPolicy.packagePath,
    shapesPath,
    profile.shapesPolicy,
    staticAllowedFile(
      profile.shapesPolicy.packagePath,
      'ontology-shapes',
      profile.shapesPolicy.mediaType,
      { kind: 'ontology-shapes' },
    ),
  )

  for (const binary of options.source.binaryResources) {
    if (binary.redistributionStatus === 'prohibited') fail(`Prohibited binary resource cannot enter FWU-OWL package: ${binary.resourceId}`)
    if (!profile.resourceCapabilities.embeddedBinaryMediaTypes.includes(binary.mediaType)) {
      fail(`Unsupported FWU-OWL binary media type: ${binary.mediaType}`)
    }
    entries.addSource(binary.path, binary.sourcePath, binary, {
      path: binary.path,
      role: 'binary-resource',
      mediaType: binary.mediaType,
      semanticBinding: {
        kind: 'binary-resource',
        resourceId: binary.resourceId,
        publicReference: binary.canonicalReference,
      },
      licenseExpression: binary.licenseExpression,
      provenanceClass: binary.provenanceClass,
      redistributionStatus: binary.redistributionStatus === 'allowed' ? 'allowed' : 'review-required',
    })
  }

  const releaseSupport = options.source.releaseSupport.map((support) => {
    entries.addSource(support.path, support.sourcePath, support, {
      path: support.path,
      role: 'release-support',
      mediaType: support.mediaType,
      semanticBinding: {
        kind: 'release-support',
        supportType: support.supportType,
        supportId: support.supportId,
        targetPath: support.targetPath,
      },
      licenseExpression: support.licenseExpression,
      provenanceClass: support.provenanceClass,
      redistributionStatus: support.redistributionStatus,
    })
    return {
      supportType: support.supportType,
      supportId: support.supportId,
      targetPath: support.targetPath,
      path: support.path,
      mediaType: support.mediaType,
      bytes: support.bytes,
      sha256: support.sha256,
    }
  })
  const assessmentCount = releaseSupport.filter((record) => record.supportType === 'assessment-source').length
  if (
    releaseSupport.filter((record) => record.supportType === 'json-contract-schema').length
      !== profile.releaseSupportPolicy.jsonContractSchemaCount
    || assessmentCount < profile.releaseSupportPolicy.assessmentSourceMinimum
    || assessmentCount > profile.releaseSupportPolicy.assessmentSourceMaximum
  ) fail('FWU-OWL reverse-build release support differs from its profile.')
  const releaseProfileSupport = releaseSupport.find((record) => record.supportType === 'json-release-profile')
    ?? fail('FWU-OWL reverse-build support lacks the JSON release profile.')
  const trustedReleaseProfile = profile.releaseSupportPolicy.trustedJsonReleaseProfile
  if (
    releaseProfileSupport.supportId !== trustedReleaseProfile.id
    || releaseProfileSupport.targetPath !== trustedReleaseProfile.targetPath
    || releaseProfileSupport.path !== trustedReleaseProfile.packagePath
    || releaseProfileSupport.bytes !== trustedReleaseProfile.bytes
    || releaseProfileSupport.sha256 !== trustedReleaseProfile.sha256
  ) fail('FWU-OWL reverse-build JSON release-profile support differs from its pinned binding.')

  const sourceLicenseRecords = new Map(
    options.source.manifest.files
      .filter((record) => record.role === 'license')
      .map((record) => [record.path, record]),
  )
  const licenseDocuments = options.source.manifest.licenseDocuments.map((document) => {
    if (!LICENSE_ID_PATTERN.test(document.licenseId)) {
      fail(`Source license document has an unsafe licenseId: ${document.licenseId}`)
    }
    const sourceLicense = sourceLicenseRecords.get(document.path)
      ?? fail(`Source license document lacks its manifest file: ${document.path}`)
    if (
      sourceLicense.redistributionStatus !== 'allowed'
      || sourceLicense.licenseExpression !== document.licenseId
      || sourceLicense.mediaType !== 'text/plain'
    ) fail(`Source license document is not an allowed text binding: ${document.licenseId}`)
    const licensePath = `licenses/${document.licenseId}.txt`
    entries.addSource(
      licensePath,
      sourcePackagePath(options.source, sourceLicense.path, `source license ${document.licenseId}`),
      sourceLicense,
      {
        path: licensePath,
        role: 'license',
        mediaType: 'text/plain',
        semanticBinding: { kind: 'license', licenseId: document.licenseId },
        licenseExpression: document.licenseId,
        provenanceClass: 'third-party',
        redistributionStatus: 'allowed',
      },
    )
    return { licenseId: document.licenseId, path: licensePath }
  })
  if (
    licenseDocuments.length === 0
    || new Set(licenseDocuments.map((document) => document.licenseId)).size !== licenseDocuments.length
    || new Set(licenseDocuments.map((document) => document.path)).size !== licenseDocuments.length
    || sourceLicenseRecords.size !== licenseDocuments.length
  ) fail('Source license-document inventory is empty, duplicated, or not bijective.')

  const releaseProfileSourceRecord = sourceRecordByPath(
    options.source,
    options.source.manifest.contractBindings.releaseProfile.path,
  )
  const sourceSemanticContracts = Object.fromEntries(SOURCE_CONTRACT_NAMES.map((name) => {
    const binding = options.source.sourceContractBindings[name]
      ?? fail(`Source semantic binding is missing: ${name}`)
    return [name, binding]
  }))
  const sourceJsonPackage = {
    file: options.source.zipFile,
    bytes: options.source.zipBytes,
    sha256: options.source.zipSha256,
    manifestSha256: options.source.manifestSha256,
    releaseId: options.source.manifest.releaseId,
    curriculumEdition: options.source.manifest.curriculumEdition,
    contentDigest: options.source.manifest.contentDigest,
    runtimeContractVersion: options.source.manifest.runtimeContractVersion,
    releaseProfile: options.source.manifest.releaseProfile,
    releaseProfileBinding: {
      id: options.source.manifest.contractBindings.releaseProfile.id,
      path: options.source.manifest.contractBindings.releaseProfile.path,
      bytes: releaseProfileSourceRecord.bytes,
      sha256: options.source.manifest.contractBindings.releaseProfile.sha256,
    },
    supportedSkillpilotSoftware: options.source.manifest.supportedSkillpilotSoftware,
    semanticContracts: sourceSemanticContracts,
  }

  const manifestFiles = entries.entries
    .map((entry) => entry.manifestFile)
    .filter((record): record is FwuOwlManifestFile => record !== undefined)
    .sort((left, right) => compareCodeUnits(left.path, right.path))
  const packagedLicenseIds = new Set(licenseDocuments.map((document) => document.licenseId))
  if (licenseDocuments.length > profile.manifestLimits.licenseDocuments) {
    fail('FWU-OWL license-document limit exceeded.')
  }
  manifestFiles.forEach((file) => {
    if (
      file.redistributionStatus === 'allowed'
      && (file.licenseExpression === null || !packagedLicenseIds.has(file.licenseExpression))
    ) fail(`Allowed FWU-OWL file references an unbundled license: ${file.path}`)
  })
  validateFileInventory(profile, archiveRoot, manifestFiles)
  const semanticContentIndexDescriptor = {
    path: profile.semanticContentPolicy.indexPath,
    bytes: options.source.semanticContentIndexBytes,
    sha256: options.source.semanticContentIndexSha256,
    contentDigest: options.source.semanticContentIndex.contentDigest,
    logicalArtifactCount: compilation.logicalArtifactCount,
    binaryResourceCount: options.source.binaryResources.length,
    fieldRegistryEntryCount: compilation.fieldRegistryEntryCount,
  }
  const manifest: Record<string, unknown> = {
    $schema: profile.compatibility.manifestSchemaId,
    packageFormatVersion: profile.compatibility.packageFormatVersion,
    runtimeContractVersion: options.source.manifest.runtimeContractVersion,
    releaseProfile: profile.profileId,
    variant: profile.compatibility.variant,
    releaseId: options.source.manifest.releaseId,
    packageId: options.source.manifest.packageId,
    packageVersion: options.source.manifest.packageVersion,
    curriculumEdition: options.source.manifest.curriculumEdition,
    contentDigest: options.source.manifest.contentDigest,
    archiveRoot,
    supportedSkillpilotSoftware: options.source.manifest.supportedSkillpilotSoftware,
    sourceJsonPackage,
    contractBindings,
    schemaCatalog: {
      schemaId: profile.schemaCatalogPolicy.schemaId,
      path: profile.schemaCatalogPolicy.path,
      mediaType: 'application/json',
      entries: profile.schemaCatalogPolicy.expectedEntryCount,
      bytes: schemaCatalogEntry.bytes,
      sha256: schemaCatalogEntry.sha256,
    },
    semanticContentIndex: semanticContentIndexDescriptor,
    fwuCore: {
      ontologyIri: profile.coreBindingPolicy.canonicalOntologyIri,
      sourceRepository: profile.coreBindingPolicy.sourceRepository,
      commit: profile.coreBindingPolicy.sourceCommit,
      sourcePath: profile.coreBindingPolicy.sourcePath,
      bundledPath: profile.coreBindingPolicy.bundledPath,
      catalogPath: profile.coreBindingPolicy.catalogPath,
      catalogMediaType: profile.coreBindingPolicy.catalogMediaType,
      catalogBytes: profile.coreBindingPolicy.catalogBytes,
      catalogSha256: profile.coreBindingPolicy.catalogSha256,
      mediaType: profile.coreBindingPolicy.mediaType,
      syntax: profile.coreBindingPolicy.syntax,
      bytes: profile.coreBindingPolicy.bytes,
      sha256: profile.coreBindingPolicy.sha256,
    },
    applicationProfile: {
      ontologyIri: profile.applicationProfilePolicy.ontologyIri,
      versionIri: profile.applicationProfilePolicy.versionIri,
      version: profile.applicationProfilePolicy.version,
      imports: profile.applicationProfilePolicy.requiredImports,
      path: profile.applicationProfilePolicy.packagePath,
      mediaType: profile.applicationProfilePolicy.mediaType,
      bytes: profile.applicationProfilePolicy.bytes,
      sha256: profile.applicationProfilePolicy.sha256,
    },
    shapes: {
      shapesIri: profile.shapesPolicy.shapesIri,
      versionIri: profile.shapesPolicy.versionIri,
      version: profile.shapesPolicy.version,
      path: profile.shapesPolicy.packagePath,
      mediaType: profile.shapesPolicy.mediaType,
      bytes: profile.shapesPolicy.bytes,
      sha256: profile.shapesPolicy.sha256,
    },
    rdfSegments,
    rdfBundle: {
      path: profile.rdfPolicy.bundlePath,
      mediaType: 'application/n-triples',
      construction: profile.rdfPolicy.bundleConstruction,
      segmentOrder: profile.rdfPolicy.segmentOrder,
      triples: rdfTriples,
      bytes: bundleEntry.bytes,
      sha256: bundleEntry.sha256,
    },
    releaseSupport,
    licenseDocuments,
    files: manifestFiles,
  }
  const manifestSchemaBinding = profile.contractPolicy.trustedBootstrapSchemas.find(
    (binding) => binding.bindingName === 'manifestSchema',
  ) ?? fail('FWU-OWL profile lacks its manifest-schema binding.')
  validateJsonDocument(
    manifest,
    absoluteRepositoryPath(repositoryRoot, manifestSchemaBinding.sourcePath, 'FWU-OWL manifest schema'),
    'generated FWU-OWL manifest',
  )
  const manifestContent = jsonBytes(manifest)
  if (manifestContent.length > profile.manifestLimits.manifestBytes) fail('FWU-OWL manifest byte limit exceeded.')
  const manifestEntry = entries.addInline(MANIFEST_PATH, manifestContent)
  const checksumContent = Buffer.from(
    `${entries.entries
      .slice()
      .sort((left, right) => compareCodeUnits(left.relativePath, right.relativePath))
      .map((entry) => `${entry.sha256}  ${entry.relativePath}`)
      .join('\n')}\n`,
    'utf8',
  )
  entries.addInline(CHECKSUMS_PATH, checksumContent)
  const excludedPaths = [...profile.inventoryPolicy.excludedPaths].sort(compareCodeUnits)
  const unmanifestedPaths = entries.entries
    .filter((entry) => entry.manifestFile === undefined)
    .map((entry) => entry.relativePath)
    .sort(compareCodeUnits)
  if (
    excludedPaths.join('\n') !== unmanifestedPaths.join('\n')
    || manifestFiles.length !== entries.entries.length - excludedPaths.length
  ) fail('FWU-OWL inventory contains an undeclared or unexpectedly manifested package entry.')

  const zipLimits: DeterministicZip32Limits = {
    maxEntries: profile.archiveLimits.entryCount,
    maxEntryBytes: profile.archiveLimits.genericEntryBytes,
    maxPathBytes: profile.archiveLimits.archivePathBytes,
    maxOuterBytes: profile.archiveLimits.outerZipBytes,
    maxTotalUncompressedBytes: profile.archiveLimits.totalUncompressedBytes,
  }
  expectedCount(manifestFiles.length, options.expectedManifestFileCount, 'FWU-OWL manifest-file count')
  expectedCount(entries.entries.length, options.expectedEntryCount, 'FWU-OWL ZIP-entry count')
  expectedCount(options.source.binaryResources.length, options.expectedBinaryResourceCount, 'FWU-OWL binary-resource count')
  expectedCount(releaseSupport.length, options.expectedReleaseSupportCount, 'FWU-OWL release-support count')
  expectedCount(compilation.logicalArtifactCount, options.expectedLogicalArtifactCount, 'FWU-OWL logical-artifact count')
  expectedCount(compilation.generatedFallbackAreaCount, options.expectedFallbackAreaCount, 'FWU-OWL fallback-area count')
  if (options.expectedContentDigest !== undefined && options.source.manifest.contentDigest !== options.expectedContentDigest) {
    fail(`FWU-OWL content digest differs: ${options.source.manifest.contentDigest} != ${options.expectedContentDigest}.`)
  }
  const plan: FwuOwlPackagePlan = {
    archiveRoot,
    sourceDateEpoch,
    entries: entries.entries,
    manifest,
    manifestBytes: manifestEntry.bytes,
    manifestSha256: manifestEntry.sha256,
    manifestFileCount: manifestFiles.length,
    binaryResourceCount: options.source.binaryResources.length,
    releaseSupportCount: releaseSupport.length,
    logicalArtifactCount: compilation.logicalArtifactCount,
    fieldRegistryEntryCount: compilation.fieldRegistryEntryCount,
    rdfTriples,
    generatedFallbackAreaCount: compilation.generatedFallbackAreaCount,
    contentDigest: options.source.manifest.contentDigest,
    zipLimits,
  }
  assertSourceZipIntegrity(options.source, 'during FWU-OWL plan construction')
  return plan
}

const assertOutputBelowRepositoryTmp = (repositoryRoot: string, outputPath: string) => {
  const tmpRoot = resolve(repositoryRoot, 'tmp')
  const rel = relative(tmpRoot, resolve(outputPath))
  if (rel === '..' || rel.startsWith(`..${sep}`) || resolve(rel) === rel) {
    fail(`FWU-OWL output must remain below ${tmpRoot}: ${outputPath}`)
  }
  assertNoSymlinkComponents(repositoryRoot, resolve(outputPath), true)
}

export const materializeFwuOwlCurriculumPackage = (
  plan: FwuOwlPackagePlan,
  outputPath: string,
  repositoryRoot = defaultRepositoryRoot,
): MaterializedFwuOwlPackage => {
  const resolvedOutput = resolve(outputPath)
  assertOutputBelowRepositoryTmp(resolve(repositoryRoot), resolvedOutput)
  mkdirSync(dirname(resolvedOutput), { recursive: true, mode: 0o700 })
  assertNoSymlinkComponents(resolve(repositoryRoot), dirname(resolvedOutput), false)
  const zipEntries: DeterministicZip32Entry[] = plan.entries.map((entry) => ({
    packagePath: `${plan.archiveRoot}/${entry.relativePath}`,
    ...(entry.content ? { content: entry.content } : { sourcePath: entry.sourcePath as string }),
    bytes: entry.bytes,
    sha256: entry.sha256,
    crc32: entry.crc32,
  }))
  const bytes = createDeterministicZip32(
    zipEntries,
    new Date(plan.sourceDateEpoch * 1000),
    resolvedOutput,
    plan.zipLimits,
  )
  const integrity = fileIntegrity(resolvedOutput)
  if (integrity.bytes !== bytes) fail('FWU-OWL ZIP byte count changed after materialization.')
  return {
    path: resolvedOutput,
    bytes: integrity.bytes,
    sha256: integrity.sha256,
    manifestSha256: plan.manifestSha256,
  }
}

export const buildFwuOwlCurriculumPackagePair = (
  options: BuildFwuOwlPackagePairOptions,
): FwuOwlPackagePair => {
  const repositoryRoot = resolve(options.repositoryRoot ?? defaultRepositoryRoot)
  const outputDirectory = resolve(options.outputDirectory)
  assertOutputBelowRepositoryTmp(repositoryRoot, outputDirectory)
  mkdirSync(dirname(outputDirectory), { recursive: true, mode: 0o700 })
  assertNoSymlinkComponents(repositoryRoot, dirname(outputDirectory), false)
  const priorOutput = existsSync(outputDirectory) ? lstatSync(outputDirectory) : null
  if (priorOutput) {
    if (!priorOutput.isDirectory() || priorOutput.isSymbolicLink()) {
      fail(`FWU-OWL output target is not a regular directory: ${outputDirectory}`)
    }
  }
  const token = `${process.pid}-${randomBytes(12).toString('hex')}`
  const stagingDirectory = `${outputDirectory}.stage-${token}`
  const backupDirectory = `${outputDirectory}.backup-${token}`
  mkdirSync(stagingDirectory, { recursive: false, mode: 0o700 })
  let backupCreated = false
  let promoted = false
  try {
    assertSourceZipIntegrity(options.source, 'before FWU-OWL double build')
    let primaryPlan: FwuOwlPackagePlan | null = createFwuOwlCurriculumPackagePlan(options)
    const primaryStagePath = resolve(stagingDirectory, `${primaryPlan.archiveRoot}.zip`)
    const primaryStage = materializeFwuOwlCurriculumPackage(primaryPlan, primaryStagePath, repositoryRoot)
    const primarySummary = {
      archiveRoot: primaryPlan.archiveRoot,
      sourceDateEpoch: primaryPlan.sourceDateEpoch,
      contentDigest: primaryPlan.contentDigest,
      manifestSha256: primaryPlan.manifestSha256,
      manifestFileCount: primaryPlan.manifestFileCount,
      entryCount: primaryPlan.entries.length,
      binaryResourceCount: primaryPlan.binaryResourceCount,
      releaseSupportCount: primaryPlan.releaseSupportCount,
      logicalArtifactCount: primaryPlan.logicalArtifactCount,
      fieldRegistryEntryCount: primaryPlan.fieldRegistryEntryCount,
      rdfTriples: primaryPlan.rdfTriples,
      generatedFallbackAreaCount: primaryPlan.generatedFallbackAreaCount,
    }
    primaryPlan = null

    const peerPlan = createFwuOwlCurriculumPackagePlan(options)
    if (
      peerPlan.archiveRoot !== primarySummary.archiveRoot
      || peerPlan.sourceDateEpoch !== primarySummary.sourceDateEpoch
      || peerPlan.contentDigest !== primarySummary.contentDigest
      || peerPlan.manifestSha256 !== primarySummary.manifestSha256
      || peerPlan.manifestFileCount !== primarySummary.manifestFileCount
      || peerPlan.entries.length !== primarySummary.entryCount
      || peerPlan.binaryResourceCount !== primarySummary.binaryResourceCount
      || peerPlan.releaseSupportCount !== primarySummary.releaseSupportCount
      || peerPlan.logicalArtifactCount !== primarySummary.logicalArtifactCount
      || peerPlan.fieldRegistryEntryCount !== primarySummary.fieldRegistryEntryCount
      || peerPlan.rdfTriples !== primarySummary.rdfTriples
      || peerPlan.generatedFallbackAreaCount !== primarySummary.generatedFallbackAreaCount
    ) fail('Independent FWU-OWL package plans are not deterministic.')
    const peerStagePath = resolve(
      stagingDirectory,
      'reproducibility-peer',
      `${peerPlan.archiveRoot}.zip`,
    )
    const peerStage = materializeFwuOwlCurriculumPackage(peerPlan, peerStagePath, repositoryRoot)
    const byteIdentical = primaryStage.bytes === peerStage.bytes && primaryStage.sha256 === peerStage.sha256
    if (!byteIdentical || primaryStage.manifestSha256 !== peerStage.manifestSha256) {
      fail('FWU-OWL primary and reproducibility-peer builds are not byte-identical.')
    }
    assertSourceZipIntegrity(options.source, 'during FWU-OWL double build')

    if (priorOutput) {
      const currentOutput = lstatSync(outputDirectory)
      if (
        !currentOutput.isDirectory()
        || currentOutput.isSymbolicLink()
        || currentOutput.dev !== priorOutput.dev
        || currentOutput.ino !== priorOutput.ino
      ) fail('FWU-OWL output directory changed during double build.')
      renameSync(outputDirectory, backupDirectory)
      backupCreated = true
    } else if (existsSync(outputDirectory)) {
      fail('FWU-OWL output directory appeared during double build.')
    }
    renameSync(stagingDirectory, outputDirectory)
    promoted = true
    if (backupCreated) {
      rmSync(backupDirectory, { recursive: true, force: true })
      backupCreated = false
    }
    const primary: MaterializedFwuOwlPackage = {
      ...primaryStage,
      path: resolve(outputDirectory, basename(primaryStage.path)),
    }
    const reproducibilityPeer: MaterializedFwuOwlPackage = {
      ...peerStage,
      path: resolve(outputDirectory, 'reproducibility-peer', basename(peerStage.path)),
    }
    return {
      archiveRoot: primarySummary.archiveRoot,
      sourceDateEpoch: primarySummary.sourceDateEpoch,
      contentDigest: primarySummary.contentDigest,
      primary,
      reproducibilityPeer,
      byteIdentical,
      manifestFileCount: primarySummary.manifestFileCount,
      entryCount: primarySummary.entryCount,
      binaryResourceCount: primarySummary.binaryResourceCount,
      releaseSupportCount: primarySummary.releaseSupportCount,
      logicalArtifactCount: primarySummary.logicalArtifactCount,
      fieldRegistryEntryCount: primarySummary.fieldRegistryEntryCount,
      rdfTriples: primarySummary.rdfTriples,
      generatedFallbackAreaCount: primarySummary.generatedFallbackAreaCount,
    }
  } catch (error) {
    if (!promoted) rmSync(stagingDirectory, { recursive: true, force: true })
    if (backupCreated && !existsSync(outputDirectory)) renameSync(backupDirectory, outputDirectory)
    throw error
  }
}

type CliOptions = {
  sourceJson: string
  sourceRoot?: string
  workDirectory: string
  outputDirectory: string
  coreCheckout: string
  packageProfilePath: string
  archiveRoot?: string
  sourceDateEpoch: number
  expectedManifestFileCount?: number
  expectedEntryCount?: number
  expectedBinaryResourceCount?: number
  expectedReleaseSupportCount?: number
  expectedLogicalArtifactCount?: number
  expectedContentDigest?: string
  expectedFallbackAreaCount?: number
}

const usage = `Usage:
  npm --prefix app exec -- tsx scripts/buildFwuOwlCurriculumPackage.ts -- \\
    --source-json <full-standalone.json.zip> [options]

Options:
  --source-root <dir>                    Already validated/extracted archive root.
  --work-directory <dir>                 Temporary source-validation directory.
  --output-directory <dir>               Primary and reproducibility-peer output.
  --core-checkout <dir>                  Pinned lehrplan-ontologie checkout.
  --package-profile <file>               fwu-owl-v1 profile repository path.
  --archive-root <name>                  Override derived *.fwu-owl archive root.
  --source-date-epoch <seconds>           ZIP timestamp; values before 1980 clamp to 1980.
  --expect-manifest-file-count <count>    Fail on unexpected manifest inventory.
  --expect-entry-count <count>            Fail on unexpected ZIP inventory.
  --expect-binary-resource-count <count>  Fail on unexpected binary inventory.
  --expect-release-support-count <count>  Fail on unexpected reverse-support inventory.
  --expect-logical-artifact-count <count> Fail on unexpected logical inventory.
  --expect-content-digest <sha256:...>    Fail on unexpected semantic digest.
  --expect-fallback-area-count <count>    Fail on unexpected Core fallback projection.
`

const integerArgument = (value: string, name: string) => {
  const parsed = Number(value)
  if (!Number.isSafeInteger(parsed) || parsed < 0) fail(`${name} must be a non-negative integer.`)
  return parsed
}

const parseCli = (args: string[]): CliOptions => {
  const values = new Map<string, string>()
  for (let index = 0; index < args.length; index += 1) {
    const key = args[index]
    if (key === '--help' || key === '-h') {
      process.stdout.write(usage)
      process.exit(0)
    }
    if (!key.startsWith('--')) fail(`Unexpected positional argument: ${key}`)
    const value = args[index + 1]
    if (value === undefined || value.startsWith('--')) fail(`Missing value for ${key}.`)
    if (values.has(key)) fail(`Duplicate CLI option: ${key}`)
    values.set(key, value)
    index += 1
  }
  const sourceJson = values.get('--source-json') ?? fail('--source-json is required.')
  const known = new Set([
    '--source-json', '--source-root', '--work-directory', '--output-directory', '--core-checkout',
    '--package-profile', '--archive-root', '--source-date-epoch', '--expect-manifest-file-count',
    '--expect-entry-count', '--expect-binary-resource-count', '--expect-release-support-count',
    '--expect-logical-artifact-count', '--expect-content-digest', '--expect-fallback-area-count',
  ])
  for (const key of values.keys()) if (!known.has(key)) fail(`Unknown CLI option: ${key}`)
  const optionalInteger = (name: string) => {
    const value = values.get(name)
    return value === undefined ? undefined : integerArgument(value, name)
  }
  return {
    sourceJson,
    ...(values.has('--source-root') ? { sourceRoot: values.get('--source-root') as string } : {}),
    workDirectory: values.get('--work-directory') ?? DEFAULT_WORK_DIRECTORY,
    outputDirectory: values.get('--output-directory') ?? DEFAULT_OUTPUT_DIRECTORY,
    coreCheckout: values.get('--core-checkout') ?? DEFAULT_CORE_CHECKOUT,
    packageProfilePath: values.get('--package-profile') ?? DEFAULT_PACKAGE_PROFILE,
    ...(values.has('--archive-root') ? { archiveRoot: values.get('--archive-root') as string } : {}),
    sourceDateEpoch: optionalInteger('--source-date-epoch') ?? FIXED_MINIMUM_ZIP_EPOCH,
    expectedManifestFileCount: optionalInteger('--expect-manifest-file-count'),
    expectedEntryCount: optionalInteger('--expect-entry-count'),
    expectedBinaryResourceCount: optionalInteger('--expect-binary-resource-count'),
    expectedReleaseSupportCount: optionalInteger('--expect-release-support-count'),
    expectedLogicalArtifactCount: optionalInteger('--expect-logical-artifact-count'),
    ...(values.has('--expect-content-digest') ? { expectedContentDigest: values.get('--expect-content-digest') as string } : {}),
    expectedFallbackAreaCount: optionalInteger('--expect-fallback-area-count'),
  }
}

const main = () => {
  const cli = parseCli(process.argv.slice(2))
  const repositoryRoot = resolve(scriptDir, '../..')
  const prepared = prepareValidatedSourceJsonPackage(resolve(repositoryRoot, cli.sourceJson), {
    workDirectory: resolve(repositoryRoot, cli.workDirectory),
    ...(cli.sourceRoot ? { sourceRoot: resolve(repositoryRoot, cli.sourceRoot) } : {}),
  })
  try {
    const result = buildFwuOwlCurriculumPackagePair({
      source: prepared.source,
      repositoryRoot,
      outputDirectory: resolve(repositoryRoot, cli.outputDirectory),
      coreCheckout: cli.coreCheckout,
      packageProfilePath: cli.packageProfilePath,
      archiveRoot: cli.archiveRoot,
      sourceDateEpoch: cli.sourceDateEpoch,
      expectedManifestFileCount: cli.expectedManifestFileCount,
      expectedEntryCount: cli.expectedEntryCount,
      expectedBinaryResourceCount: cli.expectedBinaryResourceCount,
      expectedReleaseSupportCount: cli.expectedReleaseSupportCount,
      expectedLogicalArtifactCount: cli.expectedLogicalArtifactCount,
      expectedContentDigest: cli.expectedContentDigest,
      expectedFallbackAreaCount: cli.expectedFallbackAreaCount,
    })
    process.stdout.write(`${JSON.stringify({
      status: 'built',
      sourceJsonPackage: {
        file: prepared.source.zipFile,
        bytes: prepared.source.zipBytes,
        sha256: prepared.source.zipSha256,
        manifestSha256: prepared.source.manifestSha256,
      },
      ...result,
    }, null, 2)}\n`)
  } finally {
    prepared.cleanup()
  }
}

const isMain = process.argv[1] !== undefined
  && import.meta.url === pathToFileURL(resolve(process.argv[1])).href

if (isMain) {
  try {
    main()
  } catch (error) {
    process.stderr.write(`FWU-OWL package build failed: ${error instanceof Error ? error.message : String(error)}\n`)
    process.exitCode = 1
  }
}
