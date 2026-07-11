import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import { basename, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  createFullStandalonePackagePlan,
  materializeFullStandalonePackage,
  type FullStandaloneManifestFile,
} from './buildFullStandaloneCurriculumPackage'

type JsonObject = Record<string, unknown>

const scriptDir = dirname(fileURLToPath(import.meta.url))
const realRepositoryRoot = resolve(scriptDir, '../..')
const tempParent = resolve(realRepositoryRoot, 'tmp')
mkdirSync(tempParent, { recursive: true })
const fixtureRepositoryRoot = mkdtempSync(resolve(tempParent, 'full-package-builder-self-test.'))
const fixtureTmp = resolve(fixtureRepositoryRoot, 'tmp')
const releaseRoot = resolve(fixtureTmp, 'release-model')
const contractRoot = resolve(fixtureRepositoryRoot, 'contracts/curriculum-package/v1')
const profileRepositoryPath = 'contracts/curriculum-package/v1/profiles/full-standalone-v1.profile.json'
const buildProfileRepositoryPath = 'contracts/curriculum-package/v1/profiles/fixture-release-model-v1.profile.json'
const reviewRepositoryPath = 'curricula/DE/Gymnasium/quality/package-redistribution/de-gymnasium-mathematik-v1.review.json'
const packageId = 'org.skillpilot.curriculum.de.gymnasium.mathematik'
const packageVersion = '1.0.0-fixture.1'
const releaseId = `${packageId}@${packageVersion}`
const contentDigest = `sha256:${'a'.repeat(64)}`

const sha256 = (content: Buffer | string) => createHash('sha256').update(content).digest('hex')
const digest = (content: Buffer | string) => `sha256:${sha256(content)}`

const ensureParent = (path: string) => mkdirSync(dirname(path), { recursive: true })

const writeBytes = (repositoryPath: string, content: Buffer | string) => {
  const path = resolve(fixtureRepositoryRoot, repositoryPath)
  ensureParent(path)
  writeFileSync(path, content)
  return path
}

const writeJson = (repositoryPath: string, value: unknown) => writeBytes(
  repositoryPath,
  `${JSON.stringify(value, null, 2)}\n`,
)

const readFixtureJson = <T>(repositoryPath: string): T => JSON.parse(
  readFileSync(resolve(fixtureRepositoryRoot, repositoryPath), 'utf8'),
) as T

const copyRepositoryFile = (repositoryPath: string) => {
  const source = resolve(realRepositoryRoot, repositoryPath)
  const target = resolve(fixtureRepositoryRoot, repositoryPath)
  ensureParent(target)
  copyFileSync(source, target)
  return target
}

const integrity = (path: string) => {
  const content = readFileSync(path)
  return { bytes: content.length, sha256: sha256(content) }
}

const packageProfile = JSON.parse(readFileSync(
  resolve(realRepositoryRoot, profileRepositoryPath),
  'utf8',
)) as JsonObject & {
  roles: Array<{ role: string }>
  trustedContractSchemas: Array<{ id: string; sha256: string }>
}

const contractPaths = [
  profileRepositoryPath,
  'contracts/curriculum-package/v1/profiles/semantic-normal-form-v1.profile.json',
  'contracts/curriculum-package/v1/profiles/skillpilot-fwu-field-semantics-v1.registry.json',
  'contracts/curriculum-package/v1/profiles/canonical-definition-record-v1.profile.json',
  'contracts/curriculum-package/v1/profiles/de-gymnasium-mathematik-v1.profile.json',
  'contracts/curriculum-package/v1/profiles/de-gymnasium-mathematik-publication-evidence-v1.profile.json',
]
contractPaths.forEach(copyRepositoryFile)
packageProfile.trustedContractSchemas.forEach((binding) => {
  copyRepositoryFile(`contracts/curriculum-package/v1/${basename(binding.id)}`)
})
copyRepositoryFile('LICENSE')

const semanticContract = (repositoryPath: string) => {
  const path = resolve(fixtureRepositoryRoot, repositoryPath)
  const document = JSON.parse(readFileSync(path, 'utf8')) as JsonObject
  return { path, document, ...integrity(path) }
}

const normalization = semanticContract('contracts/curriculum-package/v1/profiles/semantic-normal-form-v1.profile.json')
const registry = semanticContract('contracts/curriculum-package/v1/profiles/skillpilot-fwu-field-semantics-v1.registry.json')
const ontology = semanticContract('contracts/curriculum-package/v1/profiles/de-gymnasium-mathematik-v1.profile.json')
const publication = semanticContract('contracts/curriculum-package/v1/profiles/de-gymnasium-mathematik-publication-evidence-v1.profile.json')

const buildProfilePath = writeJson(buildProfileRepositoryPath, {
  $schema: 'https://skillpilot.com/schemas/curriculum-package/v1/release-model-build-profile.schema.json',
  profileFormatVersion: 1,
  profileId: 'fixture-release-model-v1',
  profileVersion: '1.0.0',
  package: {
    packageId,
    packageVersion,
    releaseId,
    curriculumEdition: 'Fixture-2026-07',
    subject: 'Mathematik',
    locale: 'de-DE',
  },
  contracts: {
    runtimeContractVersion: '1.0',
    fieldSemanticsRegistryPath: 'contracts/curriculum-package/v1/profiles/skillpilot-fwu-field-semantics-v1.registry.json',
    normalizationProfilePath: 'contracts/curriculum-package/v1/profiles/semantic-normal-form-v1.profile.json',
    ontologyProfilePath: 'contracts/curriculum-package/v1/profiles/de-gymnasium-mathematik-v1.profile.json',
    ontologyProfileSha256: ontology.sha256,
    publicationEvidenceProfilePath: 'contracts/curriculum-package/v1/profiles/de-gymnasium-mathematik-publication-evidence-v1.profile.json',
    publicationEvidenceProfileSha256: publication.sha256,
  },
})
const buildProfileIntegrity = integrity(buildProfilePath)

const schema = (name: string) => `https://skillpilot.com/schemas/curriculum-package/v1/${name}.schema.json`
const logicalDocuments: Array<{
  path: string
  role: string
  logicalId: string
  document: JsonObject
}> = [
  {
    path: 'data/canonical/mathematik.landscape.json',
    role: 'canonical-landscape',
    logicalId: 'fixture-landscape',
    document: { $schema: schema('compiled-landscape'), id: 'fixture-landscape' },
  },
  {
    path: 'data/views/fixture.view.json',
    role: 'composition-view',
    logicalId: 'fixture-view',
    document: { $schema: schema('composition-view'), viewId: 'fixture-view' },
  },
  {
    path: 'data/views/index.json',
    role: 'composition-view-index',
    logicalId: 'fixture-landscape:views',
    document: { $schema: schema('composition-view-index'), views: [] },
  },
  {
    path: 'data/cards/card-index.json',
    role: 'card-index',
    logicalId: 'fixture-landscape:cards',
    document: { $schema: schema('card-index'), decks: [] },
  },
  {
    path: 'data/resources/resource-index.json',
    role: 'resource-index',
    logicalId: 'fixture-landscape:resources',
    document: {},
  },
  {
    path: 'data/runtime/dependency-closure.json',
    role: 'dependency-closure',
    logicalId: `${releaseId}:closure`,
    document: { $schema: schema('dependency-closure'), definitions: [], references: [] },
  },
  {
    path: 'data/runtime/migration-aliases.json',
    role: 'migration-aliases',
    logicalId: `${releaseId}:migrations`,
    document: { $schema: schema('migration-aliases'), rules: [] },
  },
  {
    path: 'data/runtime/catalog.json',
    role: 'runtime-catalog',
    logicalId: `${releaseId}:catalog`,
    document: {},
  },
]

const binaryContent = Buffer.from('tiny synthetic image bytes\n', 'utf8')
const binarySha256 = sha256(binaryContent)
const binarySourceRepositoryPath = 'app/public/assets/fixture/tiny.png'
const binaryArtifactPath = 'assets/fixture/tiny.png'
writeBytes(binarySourceRepositoryPath, binaryContent)
const assessmentContent = '# Fixture assessment\n\nA deterministic task.\n'
const assessmentArtifactPath = 'data/assessment-sources/seki/j5/fixture.md'
const assessmentSourceRepositoryPath = 'curricula/DE/Gymnasium/assessments/mathematik/seki/j5/fixture.md'
writeBytes(assessmentSourceRepositoryPath, assessmentContent)

const resourceIndex = {
  $schema: schema('resource-index'),
  indexFormatVersion: '1.0',
  resources: [{
    resourceId: 'fixture-resource',
    artifactPath: binaryArtifactPath,
    publicUrl: '/assets/fixture/tiny.png',
    delivery: 'embedded',
    mediaType: 'image/png',
    bytes: binaryContent.length,
    sha256: binarySha256,
    runtimeRequired: true,
  }],
}
logicalDocuments.find((item) => item.role === 'resource-index')!.document = resourceIndex

const runtimeCatalog = {
  $schema: schema('runtime-catalog'),
  runtimeContractVersion: '1.0',
  landscapes: [{ landscapeId: 'fixture-landscape', artifactPath: 'data/canonical/mathematik.landscape.json' }],
  decks: [],
  views: [{ viewId: 'fixture-view', landscapeId: 'fixture-landscape', artifactPath: 'data/views/fixture.view.json' }],
  artifactIndexes: {
    cardsPath: 'data/cards/card-index.json',
    compositionViewsPath: 'data/views/index.json',
    migrationAliasesPath: 'data/runtime/migration-aliases.json',
    resourcesPath: 'data/resources/resource-index.json',
  },
  dependencyClosure: { path: 'data/runtime/dependency-closure.json' },
}
logicalDocuments.find((item) => item.role === 'runtime-catalog')!.document = runtimeCatalog
logicalDocuments.forEach((item) => writeJson(`tmp/release-model/${item.path}`, item.document))
writeBytes(`tmp/release-model/${assessmentArtifactPath}`, assessmentContent)

const semanticIndex = {
  $schema: schema('semantic-content-index'),
  indexFormatVersion: '1.0',
  normalizationProfile: {
    id: normalization.document.profileId,
    version: normalization.document.version,
    sha256: normalization.sha256,
  },
  fieldSemanticsRegistry: {
    id: registry.document.registryId,
    version: registry.document.version,
    sha256: registry.sha256,
  },
  logicalArtifacts: logicalDocuments.map((item, index) => ({
    logicalId: item.logicalId,
    role: item.role,
    mediaType: 'application/json',
    normalizedBytes: 100 + index,
    normalizedSha256: String(index + 1).padStart(64, '0'),
    recordSha256: String(index + 101).padStart(64, '0'),
  })),
  binaryResources: [{
    resourceId: 'fixture-resource',
    canonicalReference: `/${binaryArtifactPath}`,
    mediaType: 'image/png',
    bytes: binaryContent.length,
    sha256: binarySha256,
    recordSha256: 'f'.repeat(64),
  }],
  contentDigest,
}
writeJson('tmp/release-model/metadata/semantic-content-index.json', semanticIndex)

const buildInputs = {
  buildInputFormatVersion: '1.0',
  profilePath: buildProfileRepositoryPath,
  profileSha256: buildProfileIntegrity.sha256,
  binaryResources: [{
    resourceId: 'fixture-resource',
    artifactPath: binaryArtifactPath,
    sourcePath: binarySourceRepositoryPath,
    mediaType: 'image/png',
    bytes: binaryContent.length,
    sha256: binarySha256,
  }],
  assessmentSources: [{
    artifactPath: assessmentArtifactPath,
    sourcePath: assessmentSourceRepositoryPath,
    bytes: Buffer.byteLength(assessmentContent),
    sha256: sha256(assessmentContent),
  }],
}
const buildInputsPath = writeJson('tmp/release-model/metadata/build-inputs.json', buildInputs)
writeJson('tmp/release-model/metadata/field-coverage.json', { reportFormatVersion: '1.0', passed: true })
writeJson('tmp/release-model/metadata/release-model-conformance.json', {
  reportFormatVersion: '1.0',
  profileId: 'fixture-release-model-v1',
  releaseId,
  packageId,
  packageVersion,
  curriculumEdition: 'Fixture-2026-07',
  contentDigest,
  passed: true,
})

const resourceIndexIntegrity = integrity(resolve(releaseRoot, 'data/resources/resource-index.json'))
const buildInputsIntegrity = integrity(buildInputsPath)
const packageProfilePath = resolve(fixtureRepositoryRoot, profileRepositoryPath)
const packageProfileIntegrity = integrity(packageProfilePath)
const rootLicensePath = resolve(fixtureRepositoryRoot, 'LICENSE')
const rootLicenseIntegrity = integrity(rootLicensePath)
const nonBinaryRoles = packageProfile.roles.map((role) => role.role).filter((role) => role !== 'binary-asset').sort()

writeJson(reviewRepositoryPath, {
  $schema: 'https://skillpilot.com/schemas/curriculum-package/v1/package-redistribution-review.schema.json',
  reviewFormatVersion: '1.0',
  reviewId: 'fixture-review',
  packageId,
  contentDigest,
  sourceReleaseModel: {
    profileId: 'fixture-release-model-v1',
    releaseId,
    resourceIndexPath: 'data/resources/resource-index.json',
    resourceIndexSha256: digest(readFileSync(resolve(releaseRoot, 'data/resources/resource-index.json'))),
    buildInputsPath: 'metadata/build-inputs.json',
    buildInputsSha256: digest(readFileSync(buildInputsPath)),
  },
  targetReleaseProfile: {
    profileId: 'full-standalone-v1',
    path: profileRepositoryPath,
    sha256: digest(readFileSync(packageProfilePath)),
    nonBinaryRoles,
  },
  rootLicenseEvidence: {
    licenseId: 'Apache-2.0',
    path: 'LICENSE',
    bytes: rootLicenseIntegrity.bytes,
    sha256: `sha256:${rootLicenseIntegrity.sha256}`,
  },
  classDecisions: [
    {
      classId: 'skillpilot-data',
      artifactRoles: ['canonical-landscape', 'card-deck', 'composition-view', 'mapping', 'migration-aliases'],
      provenanceClass: 'skillpilot-authored',
      decisionStatus: 'pending-human-review',
      redistributionStatus: 'review-required',
      licenseExpression: null,
      reviewer: null,
      reviewedAt: null,
      reviewEvidence: [],
    },
    {
      classId: 'official-source-evidence',
      artifactRoles: ['source-index', 'source-goal-reference-index'],
      provenanceClass: 'official-source-metadata',
      decisionStatus: 'pending-human-review',
      redistributionStatus: 'review-required',
      licenseExpression: null,
      reviewer: null,
      reviewedAt: null,
      reviewEvidence: [],
    },
    {
      classId: 'software-contracts',
      artifactRoles: ['license', 'release-profile', 'schema', 'schema-catalog', 'semantic-contract'],
      provenanceClass: 'software-contract',
      decisionStatus: 'automatic-allowed',
      redistributionStatus: 'allowed',
      licenseExpression: 'Apache-2.0',
      reviewer: null,
      reviewedAt: null,
      reviewEvidence: [{ kind: 'root-license', reference: 'LICENSE', sha256: `sha256:${rootLicenseIntegrity.sha256}` }],
    },
    {
      classId: 'generated-metadata',
      artifactRoles: [
        'card-index',
        'composition-view-index',
        'dependency-closure',
        'embedded-goal-dependency',
        'package-documentation',
        'provenance-report',
        'quality-evidence',
        'resource-index',
        'runtime-catalog',
        'semantic-content-index',
        'validation-report',
      ],
      provenanceClass: 'generated-metadata',
      decisionStatus: 'pending-human-review',
      redistributionStatus: 'review-required',
      licenseExpression: null,
      reviewer: null,
      reviewedAt: null,
      reviewEvidence: [],
    },
  ],
  pathClassificationOverrides: [{
    role: 'package-documentation',
    pathPrefix: 'data/assessment-sources/',
    classId: 'skillpilot-data',
    provenanceClass: 'skillpilot-authored',
  }],
  assetDecisions: [{
    resourceId: 'fixture-resource',
    artifactPath: binaryArtifactPath,
    mediaType: 'image/png',
    bytes: binaryContent.length,
    assetSha256: `sha256:${binarySha256}`,
    provenanceClass: 'ai-generated-curated',
    userProvided: false,
    decisionStatus: 'pending-human-review',
    redistributionStatus: 'review-required',
    licenseExpression: null,
    reviewer: null,
    reviewedAt: null,
    reviewEvidence: [],
  }],
  summary: {
    classDecisionCount: 4,
    automaticAllowedClassCount: 1,
    pendingClassCount: 3,
    humanApprovedClassCount: 0,
    prohibitedClassCount: 0,
    assetCount: 1,
    externalResourceCount: 0,
    userProvidedAssetCount: 0,
    pendingAssetCount: 1,
    humanApprovedAssetCount: 0,
    prohibitedAssetCount: 0,
    publicationReady: false,
    humanReviewItemCount: 4,
  },
})

const parseLocalZipNames = (content: Buffer) => {
  const names: string[] = []
  let cursor = 0
  while (content.readUInt32LE(cursor) === 0x04034b50) {
    const nameBytes = content.readUInt16LE(cursor + 26)
    const extraBytes = content.readUInt16LE(cursor + 28)
    const payloadBytes = content.readUInt32LE(cursor + 22)
    const nameStart = cursor + 30
    names.push(content.subarray(nameStart, nameStart + nameBytes).toString('utf8'))
    cursor = nameStart + nameBytes + extraBytes + payloadBytes
  }
  assert.equal(content.readUInt32LE(cursor), 0x02014b50, 'local entries end at the central directory')
  return names
}

const manifestFiles = (plan: ReturnType<typeof createFullStandalonePackagePlan>) => (
  plan.manifest.files as FullStandaloneManifestFile[]
)

try {
  const fixturePlanOptions = {
    repositoryRoot: fixtureRepositoryRoot,
    releaseRoot,
    redistributionReviewPath: reviewRepositoryPath,
    fixtureOnly: true,
  } as const
  const plan = createFullStandalonePackagePlan(fixturePlanOptions)
  assert.equal(
    plan.archiveRoot,
    `skillpilot-curriculum-de-gymnasium-mathematik-${packageVersion}.json`,
    'default archive root encodes the JSON package variant',
  )
  assert.equal(
    plan.manifest.supportedSkillpilotSoftware,
    '>=0.1.0 <1.0.0',
    'default package range accepts the stable curriculum-consumer API version 0.1.0',
  )
  assert.equal(plan.entries.length, 48, 'fixture package entry count')
  assert.equal(manifestFiles(plan).length, plan.entries.length - 2, 'manifest excludes only itself and SHA256SUMS')
  assert.equal(plan.publicationReady, false, 'pending review remains non-public')
  assert.equal(plan.sourceVerificationPendingCount, 0, 'fixture explicitly omits external source-review evidence')
  assert.equal(manifestFiles(plan).filter((file) => file.role === 'schema').length, 22, 'complete schema set')
  assert.equal(manifestFiles(plan).filter((file) => file.role === 'semantic-contract').length, 5, 'five semantic contracts')
  assert.equal(manifestFiles(plan).filter((file) => file.semanticBinding.kind === 'logical-artifact').length, 8, 'all logical fixture artifacts are bound')
  const assetRecord = manifestFiles(plan).find((file) => file.path === binaryArtifactPath)
  assert.deepEqual(assetRecord?.semanticBinding, { kind: 'binary-resource', resourceId: 'fixture-resource' })
  assert.equal(assetRecord?.runtimeRequired, true)
  assert.equal(assetRecord?.redistributionStatus, 'review-required')
  assert.equal(assetRecord?.licenseExpression, null)
  const assessmentRecord = manifestFiles(plan).find((file) => file.path === assessmentArtifactPath)
  assert.equal(assessmentRecord?.role, 'package-documentation')
  assert.equal(assessmentRecord?.provenanceClass, 'skillpilot-authored', 'assessment path override is honored')
  assert.equal(assessmentRecord?.redistributionStatus, 'review-required')

  assert.throws(
    () => createFullStandalonePackagePlan({
      repositoryRoot: fixtureRepositoryRoot,
      releaseRoot,
      redistributionReviewPath: reviewRepositoryPath,
    }),
    /external security gates|source-verification review|semantic preflight|checker/iu,
    'external security gates cannot be omitted outside the tightly bound fixture mode',
  )
  assert.throws(
    () => createFullStandalonePackagePlan({ ...fixturePlanOptions, archiveRoot: 'invalid-root.' }),
    /archive root/iu,
    'trailing-dot archive roots are rejected',
  )
  assert.throws(
    () => materializeFullStandalonePackage(plan, {
      repositoryRoot: fixtureRepositoryRoot,
      outputDirectory: resolve(fixtureTmp, 'combined-output'),
      writeDirectory: true,
      writeZip: true,
    }),
    /exactly one artifact/iu,
    'directory and ZIP cannot be promoted as a non-atomic pair',
  )

  const originalReview = readFixtureJson<JsonObject>(reviewRepositoryPath)
  const forgedReview = structuredClone(originalReview)
  ;(forgedReview.summary as JsonObject).publicationReady = true
  writeJson(reviewRepositoryPath, forgedReview)
  assert.throws(
    () => createFullStandalonePackagePlan(fixturePlanOptions),
    /summary readiness is forged or stale/iu,
    'forged review summary cannot promote publication readiness',
  )
  writeJson(reviewRepositoryPath, originalReview)

  const originalBuildInputs = readFixtureJson<JsonObject>('tmp/release-model/metadata/build-inputs.json')
  const ghostBuildInputs = structuredClone(originalBuildInputs)
  ;(ghostBuildInputs.assessmentSources as unknown[]).push({
    artifactPath: 'data/assessment-sources/seki/j6/ghost.md',
    sourcePath: 'curricula/DE/Gymnasium/assessments/mathematik/seki/j6/ghost.md',
    bytes: 1,
    sha256: '0'.repeat(64),
  })
  writeJson('tmp/release-model/metadata/build-inputs.json', ghostBuildInputs)
  const ghostReview = structuredClone(originalReview)
  ;(ghostReview.sourceReleaseModel as JsonObject).buildInputsSha256 = digest(
    readFileSync(resolve(releaseRoot, 'metadata/build-inputs.json')),
  )
  writeJson(reviewRepositoryPath, ghostReview)
  assert.throws(
    () => createFullStandalonePackagePlan(fixturePlanOptions),
    /unconsumed build inputs/iu,
    'an unconsumed assessment build input fails exact-set closure',
  )
  writeJson('tmp/release-model/metadata/build-inputs.json', originalBuildInputs)
  writeJson(reviewRepositoryPath, originalReview)

  const approvedReview = structuredClone(originalReview)
  const approvedAsset = (approvedReview.assetDecisions as JsonObject[])[0]
  Object.assign(approvedAsset, {
    provenanceClass: 'user-provided-generated-claim',
    decisionStatus: 'human-approved',
    redistributionStatus: 'allowed',
    licenseExpression: 'CC-BY-4.0',
    reviewer: 'Fixture Reviewer',
    reviewedAt: '2026-07-11T00:00:00Z',
    reviewEvidence: [{ kind: 'rights-holder-license', reference: 'fixture', sha256: null }],
  })
  Object.assign(approvedReview.summary as JsonObject, {
    pendingAssetCount: 0,
    humanApprovedAssetCount: 1,
    humanReviewItemCount: 3,
  })
  writeJson(reviewRepositoryPath, approvedReview)
  assert.throws(
    () => createFullStandalonePackagePlan(fixturePlanOptions),
    /No package-local license document input was supplied for CC-BY-4.0/iu,
    'approved content cannot reference an undocumented license identifier',
  )
  const ccLicenseRepositoryPath = 'legal/cc-by-4.0.txt'
  writeBytes(ccLicenseRepositoryPath, 'Fixture CC-BY-4.0 license text\n')
  const approvedPlan = createFullStandalonePackagePlan({
    ...fixturePlanOptions,
    additionalLicenseDocumentPaths: { 'CC-BY-4.0': ccLicenseRepositoryPath },
  })
  assert.deepEqual(
    approvedPlan.manifest.licenseDocuments,
    [
      { licenseId: 'Apache-2.0', path: 'LICENSE' },
      { licenseId: 'CC-BY-4.0', path: 'licenses/license-001.txt' },
    ],
    'each real license identifier resolves to one deterministic package-local document',
  )
  assert.equal(
    manifestFiles(approvedPlan).find((file) => file.path === binaryArtifactPath)?.provenanceClass,
    'user-provided-generated-claim',
    'honest user-provided provenance survives an approved manifest projection',
  )
  writeJson(reviewRepositoryPath, originalReview)

  const originalProfile = readFixtureJson<JsonObject>(profileRepositoryPath)
  for (const [field, value, expectedError] of [
    ['goalVisualizationBytes', binaryContent.length - 1, /visualization exceeds/iu],
    ['imageLaneBytes', binaryContent.length - 1, /image lane exceeds/iu],
    ['jsonEntryBytes', 1, /JSON entry exceeds/iu],
  ] as const) {
    const limitedProfile = structuredClone(originalProfile)
    ;(limitedProfile.archiveLimits as JsonObject)[field] = value
    writeJson(profileRepositoryPath, limitedProfile)
    const limitedReview = structuredClone(originalReview)
    ;(limitedReview.targetReleaseProfile as JsonObject).sha256 = digest(readFileSync(packageProfilePath))
    writeJson(reviewRepositoryPath, limitedReview)
    assert.throws(() => createFullStandalonePackagePlan(fixturePlanOptions), expectedError)
  }
  const tinyManifestProfile = structuredClone(originalProfile)
  ;(tinyManifestProfile.manifestLimits as JsonObject).manifestBytes = 1
  writeJson(profileRepositoryPath, tinyManifestProfile)
  const tinyManifestReview = structuredClone(originalReview)
  ;(tinyManifestReview.targetReleaseProfile as JsonObject).sha256 = digest(readFileSync(packageProfilePath))
  writeJson(reviewRepositoryPath, tinyManifestReview)
  assert.throws(
    () => createFullStandalonePackagePlan(fixturePlanOptions),
    /Manifest exceeds/iu,
    'manifest byte limit is enforced before promotion',
  )
  writeJson(profileRepositoryPath, originalProfile)
  writeJson(reviewRepositoryPath, originalReview)

  const firstOutput = resolve(fixtureTmp, 'first-output')
  const firstDirectory = materializeFullStandalonePackage(plan, {
    repositoryRoot: fixtureRepositoryRoot,
    outputDirectory: firstOutput,
    writeDirectory: true,
    writeZip: false,
  })
  const first = materializeFullStandalonePackage(plan, {
    repositoryRoot: fixtureRepositoryRoot,
    outputDirectory: firstOutput,
    writeDirectory: false,
    writeZip: true,
  })
  assert.ok(firstDirectory.directoryPath && existsSync(firstDirectory.directoryPath))
  assert.ok(first.zipPath && existsSync(first.zipPath))
  assert.equal(basename(first.zipPath as string), `${plan.archiveRoot}.zip`)
  assert.ok((first.zipPath as string).endsWith('.json.zip'), 'JSON package filename uses the contract suffix')
  const second = materializeFullStandalonePackage(plan, {
    repositoryRoot: fixtureRepositoryRoot,
    outputDirectory: resolve(fixtureTmp, 'second-output'),
    writeDirectory: false,
    writeZip: true,
  })
  assert.equal(first.zipSha256, second.zipSha256, 'independent builder runs produce byte-identical ZIPs')
  assert.deepEqual(readFileSync(first.zipPath as string), readFileSync(second.zipPath as string), 'independent ZIP bytes')

  const zipNames = parseLocalZipNames(readFileSync(first.zipPath as string))
  assert.equal(zipNames.length, plan.entries.length)
  assert.ok(zipNames.every((name) => name.startsWith(`${plan.archiveRoot}/`)), 'every ZIP entry has the one archive root')
  assert.equal(new Set(zipNames.map((name) => name.split('/')[0])).size, 1, 'ZIP has exactly one archive root')

  const checksums = readFileSync(resolve(firstDirectory.directoryPath as string, 'metadata/SHA256SUMS'), 'utf8').trim().split('\n')
  assert.equal(checksums.length, plan.entries.length - 1, 'SHA256SUMS excludes only itself')
  assert.ok(checksums.some((line) => line.endsWith('  metadata/manifest.json')), 'SHA256SUMS binds the manifest')
  assert.ok(!checksums.some((line) => line.endsWith('  metadata/SHA256SUMS')), 'SHA256SUMS has no self-reference')

  writeFileSync(resolve(firstDirectory.directoryPath as string, 'README.md'), 'corrupt old output')
  const replaced = materializeFullStandalonePackage(plan, {
    repositoryRoot: fixtureRepositoryRoot,
    outputDirectory: firstOutput,
    writeDirectory: true,
    writeZip: false,
  })
  assert.match(readFileSync(resolve(replaced.directoryPath as string, 'README.md'), 'utf8'), /SkillPilot curriculum package/u)

  const failureOutput = resolve(fixtureTmp, 'failure-output')
  mkdirSync(failureOutput, { recursive: true })
  const protectedZip = resolve(failureOutput, `${plan.archiveRoot}.zip`)
  writeFileSync(protectedZip, 'existing verified artifact')
  const assetSource = resolve(fixtureRepositoryRoot, binarySourceRepositoryPath)
  const assetBackup = `${assetSource}.regular-backup`
  const alternateSource = writeBytes('tmp/alternate-source.bin', binaryContent)
  renameSync(assetSource, assetBackup)
  symlinkSync(alternateSource, assetSource)
  assert.throws(
    () => materializeFullStandalonePackage(plan, {
      repositoryRoot: fixtureRepositoryRoot,
      outputDirectory: failureOutput,
      writeDirectory: false,
      writeZip: true,
    }),
    /regular non-symlink|too many levels of symbolic links/iu,
    'source symlink swap fails closed',
  )
  assert.equal(readFileSync(protectedZip, 'utf8'), 'existing verified artifact', 'failed ZIP build preserves prior output')
  assert.throws(
    () => materializeFullStandalonePackage(plan, {
      repositoryRoot: fixtureRepositoryRoot,
      outputDirectory: firstOutput,
      writeDirectory: true,
      writeZip: false,
    }),
    /regular non-symlink|too many levels of symbolic links/iu,
    'directory materialization also rejects a source symlink swap',
  )
  assert.match(
    readFileSync(resolve(replaced.directoryPath as string, 'README.md'), 'utf8'),
    /SkillPilot curriculum package/u,
    'failed directory rebuild preserves the prior promoted package',
  )
  rmSync(assetSource)
  renameSync(assetBackup, assetSource)

  const symlinkTarget = resolve(fixtureTmp, 'outside-output-target')
  mkdirSync(symlinkTarget)
  const symlinkOutput = resolve(fixtureTmp, 'symlink-output')
  symlinkSync(symlinkTarget, symlinkOutput)
  assert.throws(
    () => materializeFullStandalonePackage(plan, {
      repositoryRoot: fixtureRepositoryRoot,
      outputDirectory: symlinkOutput,
      writeDirectory: true,
      writeZip: false,
    }),
    /Symlink path component is forbidden/iu,
    'output symlink is rejected',
  )

  assert.equal(resourceIndexIntegrity.sha256, sha256(readFileSync(resolve(releaseRoot, 'data/resources/resource-index.json'))))
  assert.equal(buildInputsIntegrity.sha256, sha256(readFileSync(buildInputsPath)))
  assert.equal(packageProfileIntegrity.sha256, sha256(readFileSync(packageProfilePath)))
  assert.ok(existsSync(contractRoot), 'fixture copied its complete local contract tree')
  process.stdout.write(`Full-standalone package builder self-test passed: ${plan.entries.length} entries, 8 logical artifacts, 1 binary asset, 2 byte-identical independent ZIPs.\n`)
} finally {
  rmSync(fixtureRepositoryRoot, { recursive: true, force: true })
}
