import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs'
import { dirname, relative, resolve, sep } from 'node:path'

type JsonRecord = Record<string, unknown>
type PlannedFile = { path: string; bytes: Buffer; purpose: string }

const repoRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')
const checkMode = process.argv.includes('--check')
const allowedArguments = new Set(['--write', '--check'])
const unexpectedArguments = process.argv.slice(2)
  .filter((argument) => !allowedArguments.has(argument))
if (unexpectedArguments.length > 0) {
  throw new Error(`Unexpected arguments: ${unexpectedArguments.join(', ')}`)
}
if (writeMode && checkMode) throw new Error('Use either --write or --check, not both')

const goalId = 'b42bdfcc-3db7-5697-8b3e-69e50962ca86'
const historicalHeadRevision = '017595fd8bd4232d38edf8292a725ed85f77b5ce'
const historicalBlobSha1 = '36345d0fd7110260950550b8d2ece44fbf61108c'
const historicalRasterSha256 = '42430b0e850fc21be654f6b914bd4545dfd619e0d1e356ccce437c33e6bfa5b2'
const originalPromptSha256 = '529bc2d58dedfafcdb80bc228893a25d9b601207b9f9951eb0a605eba343ddc0'
const activeRasterSha256 = '514af0868752c41d908acc4989b683026a90ee144571ee6d5ead4fdfb93dacd0'
const activeGeometrySha256 = '1b135b3a386bc1c568c6ee44ab06fc9f2f41711797473ffe521a7933ecd95713'
const canonicalSha256 = '100825c360d41b225cec01e06ceda10b0014f2987e7911756b4b9166aad2d0ae'
const qaSha256 = '10d45db9da6c7438a32cd7ab3bdbfd28aa9ad2cae85c5e270156f621d8f7bad8'
const batch216Sha256 = '4801a012a62f6d4e460fd522f81a1b77d2729d50340afaafb232274f7f90129d'
const archiveAlgorithmVersion = 'git-head-blob-copy-atomic-v1'
const expectedArchivePlanSha256: string =
  'fb089886ab5754b42c685472add137b8e7c4188d4341dc948fa242da75240a19'

const visualRoot = `assets/goal-visualizations/mathematik/${goalId}`
const canonicalVisualRoot = `curricula/DE/Gymnasium/visualizations/mathematik/${goalId}`
const publicVisualRoot = `app/public/${visualRoot}`
const backendVisualRoot = `backend/src/main/resources/static/${visualRoot}`
const oldAssetUrl = `/${visualRoot}/${goalId}.jpg`
const activeAssetUrl = `/${visualRoot}/${goalId}.png`

const canonicalPath =
  'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const qaPath = 'curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json'
const batch216Path =
  'curricula/DE/Gymnasium/quality/goal-visualization-review/mathematik-batch-216.md'
const batch217Path =
  'curricula/DE/Gymnasium/quality/goal-visualization-review/mathematik-batch-217.md'

const historicalSources = {
  canonical: `${canonicalVisualRoot}/${goalId}.jpg`,
  public: `${publicVisualRoot}/${goalId}.jpg`,
} as const

// There was no tracked backend blob for this goal in historicalHeadRevision.
// It is deliberately guarded only as an inactive path, never as archive input.
const inactiveJpgPaths = [
  historicalSources.canonical,
  historicalSources.public,
  `${backendVisualRoot}/${goalId}.jpg`,
] as const

const retainedPromptPath = `${canonicalVisualRoot}/prompt.nano-banana-original.de.md`
const activeReplacementFiles = [
  { path: `${canonicalVisualRoot}/${goalId}.png`, sha256: activeRasterSha256 },
  { path: `${publicVisualRoot}/${goalId}.png`, sha256: activeRasterSha256 },
  { path: `${backendVisualRoot}/${goalId}.png`, sha256: activeRasterSha256 },
  { path: `${canonicalVisualRoot}/repo-native-geometry-v4.svg`, sha256: activeGeometrySha256 },
  { path: `${publicVisualRoot}/repo-native-geometry-v4.svg`, sha256: activeGeometrySha256 },
  { path: `${backendVisualRoot}/repo-native-geometry-v4.svg`, sha256: activeGeometrySha256 },
] as const

const publishedReferences = [
  {
    path: 'app/public/lernzielbuch/de-gym-mathematik-bundesweit.book-model.json',
    sha256: '8717d6a702c3fba61cbe379ca85b873d5ab9d8fff4f9143ae815b1916b5cbf79',
    activeUrlCount: 1,
  },
  {
    path: 'app/public/lernzielbuch/de-gym-mathematik-bundesweit.pdf.render-manifest.json',
    sha256: 'f43681d5ce7097f51e07eaa26bab78e6861b5f368ccfc7792dca2f0cbc49237c',
    activeUrlCount: 1,
  },
  {
    path: 'backend/src/main/resources/static/lernzielbuch/de-gym-mathematik-bundesweit.book-model.json',
    sha256: '8717d6a702c3fba61cbe379ca85b873d5ab9d8fff4f9143ae815b1916b5cbf79',
    activeUrlCount: 1,
  },
  {
    path: 'backend/src/main/resources/static/lernzielbuch/de-gym-mathematik-bundesweit.pdf.render-manifest.json',
    sha256: 'f43681d5ce7097f51e07eaa26bab78e6861b5f368ccfc7792dca2f0cbc49237c',
    activeUrlCount: 1,
  },
  {
    path: 'curricula/DE/Gymnasium/quality/goal-visualization-review/mathematik-rollout-status.json',
    sha256: '85ecd1faa6ff0106fb99c0318e18ea2e499b123a75f175a3d910b79bb94fecea',
    activeUrlCount: 1,
  },
  {
    path: 'curricula/DE/Gymnasium/quality/goal-visualization-review/mathematik-rollout-status.md',
    sha256: '5dee3de636994f498233d142488d3147997d40e6654570924745eb6421c075f4',
    activeUrlCount: 0,
  },
] as const

// The archive adds Batch 217, after which the deterministic rollout report is
// regenerated. Keep the pre-write report digests in the manifest/plan above,
// and accept only these exact post-report bytes during later read-only checks.
const postArchivePublishedReferenceSha256 = new Map<string, string>([
  [
    'curricula/DE/Gymnasium/quality/goal-visualization-review/mathematik-rollout-status.json',
    '29301f4b9380175b8436d9a2ad221bab6c62b4a362b67050f79b9772051eb5ba',
  ],
  [
    'curricula/DE/Gymnasium/quality/goal-visualization-review/mathematik-rollout-status.md',
    'cc79a915986c5d657a530b838fa6548fd8c545a53e4f68a840654f6cafacb033',
  ],
])

const archiveRoot = (
  'curricula/DE/Gymnasium/quality/goal-visualization-archive/'
  + '2026-08-28-math-b42-nano-banana-predecessor'
)
const archive = {
  canonicalRaster: `${archiveRoot}/canonical/mathematik/${goalId}/${goalId}.jpg`,
  publicRaster: `${archiveRoot}/public/mathematik/${goalId}/${goalId}.jpg`,
  originalPrompt:
    `${archiveRoot}/canonical/mathematik/${goalId}/prompt.nano-banana-original.de.md`,
  readme: `${archiveRoot}/README.md`,
  manifest: `${archiveRoot}/archive-manifest.json`,
} as const

const absolute = (path: string): string => resolve(repoRoot, path)
const sha256 = (value: string | Uint8Array): string => (
  createHash('sha256').update(value).digest('hex')
)

const assertFileHash = (path: string, expected: string, label: string): void => {
  if (!existsSync(absolute(path))) throw new Error(`${label}: missing ${path}`)
  const actual = sha256(readFileSync(absolute(path)))
  if (actual !== expected) {
    throw new Error(`${label}: ${path} has ${actual}, expected ${expected}`)
  }
}

const occurrences = (bytes: Buffer, needle: string): number => {
  let count = 0
  let offset = 0
  const encodedNeedle = Buffer.from(needle)
  while (offset <= bytes.length - encodedNeedle.length) {
    const index = bytes.indexOf(encodedNeedle, offset)
    if (index < 0) break
    count += 1
    offset = index + encodedNeedle.length
  }
  return count
}

const assertCurrentCanonicalAndQa = (): void => {
  assertFileHash(canonicalPath, canonicalSha256, 'Current canonical Mathematics landscape')
  const canonical = JSON.parse(readFileSync(absolute(canonicalPath), 'utf8')) as {
    goals?: Array<JsonRecord>
  }
  const goal = canonical.goals?.find(({ id }) => id === goalId)
  if (!goal) throw new Error(`${goalId}: missing from current canonical Mathematics landscape`)
  const links = Array.isArray(goal.resourceLinks) ? goal.resourceLinks as JsonRecord[] : []
  const visualizationLinks = links.filter(({ type }) => type === 'goal-visualization')
  if (visualizationLinks.length !== 1) {
    throw new Error(`${goalId}: expected exactly one current visualization link`)
  }
  const link = visualizationLinks[0]
  if (
    link.url !== activeAssetUrl
    || link.provider !== 'Repository-native SVG (documented Nano Banana Pro fallback)'
    || link.role !== 'primary'
    || link.resourceType !== 'image'
    || link.skillpilotId !== goalId
  ) throw new Error(`${goalId}: current canonical visualization binding drifted`)

  assertFileHash(qaPath, qaSha256, 'Current Mathematics visualization-QA ledger')
  const qa = JSON.parse(readFileSync(absolute(qaPath), 'utf8')) as {
    records?: Array<JsonRecord>
  }
  const records = qa.records?.filter(({ goalId: candidate }) => candidate === goalId) ?? []
  if (records.length !== 1) throw new Error(`${goalId}: expected exactly one current QA record`)
  const record = records[0]
  if (
    record.visualizationState !== 'available'
    || record.imageUrl !== activeAssetUrl
    || record.publicAssetPath !== `${publicVisualRoot}/${goalId}.png`
    || record.canonicalAssetPath !== `${canonicalVisualRoot}/${goalId}.png`
    || record.assetSha256 !== `sha256:${activeRasterSha256}`
    || record.aiApproved !== 'yes'
    || record.aiApprovedAssetSha256 !== `sha256:${activeRasterSha256}`
  ) throw new Error(`${goalId}: current visualization-QA binding drifted`)
}

const assertCurrentActiveState = (): void => {
  for (const path of inactiveJpgPaths) {
    if (existsSync(absolute(path))) throw new Error(`Retired JPG was reactivated: ${path}`)
  }
  for (const file of activeReplacementFiles) {
    assertFileHash(file.path, file.sha256, 'Current B42 replacement asset')
  }
  assertFileHash(retainedPromptPath, originalPromptSha256, 'Retained Nano Banana Pro prompt')
  assertFileHash(batch216Path, batch216Sha256, 'Batch-216 correction review')
  const batch216 = readFileSync(absolute(batch216Path))
  for (const binding of [historicalRasterSha256, activeRasterSha256]) {
    if (!batch216.includes(Buffer.from(binding))) {
      throw new Error(`Batch-216 correction review lost binding ${binding}`)
    }
  }
  assertCurrentCanonicalAndQa()
  for (const reference of publishedReferences) {
    const bytes = readFileSync(absolute(reference.path))
    const actualSha256 = sha256(bytes)
    const acceptedSha256 = [
      reference.sha256,
      postArchivePublishedReferenceSha256.get(reference.path),
    ].filter((value): value is string => value !== undefined)
    if (!acceptedSha256.includes(actualSha256)) {
      throw new Error(
        `Published B42 reference: ${reference.path} has ${actualSha256}, `
        + `expected one of ${acceptedSha256.join(', ')}`,
      )
    }
    if (occurrences(bytes, oldAssetUrl) !== 0) {
      throw new Error(`Published reference still contains retired JPG URL: ${reference.path}`)
    }
    const activeCount = occurrences(bytes, activeAssetUrl)
    if (activeCount !== reference.activeUrlCount) {
      throw new Error(
        `Published reference ${reference.path} has ${activeCount} active URLs, `
        + `expected ${reference.activeUrlCount}`,
      )
    }
  }
}

const gitText = (args: string[]): string => execFileSync('git', args, {
  cwd: repoRoot,
  encoding: 'utf8',
}).trim()

const readHistoricalHeadBlob = (sourcePath: string, archivePath: string): Buffer => {
  if (existsSync(absolute(archivePath))) {
    assertFileHash(archivePath, historicalRasterSha256, 'Existing historical B42 archive blob')
    return readFileSync(absolute(archivePath))
  }
  const currentHead = gitText(['rev-parse', 'HEAD'])
  if (currentHead !== historicalHeadRevision) {
    throw new Error(
      `Historical B42 blob is not archived and HEAD is ${currentHead}, `
      + `expected ${historicalHeadRevision}`,
    )
  }
  const objectSha1 = gitText(['rev-parse', `HEAD:${sourcePath}`])
  if (objectSha1 !== historicalBlobSha1) {
    throw new Error(`${sourcePath}: historical Git blob is ${objectSha1}, expected ${historicalBlobSha1}`)
  }
  const bytes = execFileSync('git', ['show', `HEAD:${sourcePath}`], {
    cwd: repoRoot,
    maxBuffer: 16 * 1024 * 1024,
  })
  const actual = sha256(bytes)
  if (actual !== historicalRasterSha256) {
    throw new Error(`${sourcePath}: historical raster is ${actual}, expected ${historicalRasterSha256}`)
  }
  return bytes
}

const historicalArtifacts = [
  {
    sourcePath: historicalSources.canonical,
    archivePath: archive.canonicalRaster,
    gitBlobSha1: historicalBlobSha1,
  },
  {
    sourcePath: historicalSources.public,
    archivePath: archive.publicRaster,
    gitBlobSha1: historicalBlobSha1,
  },
] as const

assertCurrentActiveState()

const historicalBytes = historicalArtifacts.map((artifact) => ({
  ...artifact,
  bytes: readHistoricalHeadBlob(artifact.sourcePath, artifact.archivePath),
}))
const originalPromptBytes = readFileSync(absolute(retainedPromptPath))

const readme = `# Archived Math B42 Nano Banana Pro predecessor

Date: 2026-08-28

This archive preserves the former Google Gemini / Nano Banana Pro image for
canonical Mathematics goal \`${goalId}\` as rejected predecessor evidence. The
image was withdrawn in Batch 216 because Q3(1.01|1.0201) was drawn left and
below P(1|1), contradicting the numerical difference quotient represented by
the diagram. The reviewed repository-native PNG/SVG correction remains active.

Exactly two historically tracked copies were reconstructed byte-for-byte from
Git revision \`${historicalHeadRevision}\` with \`git show HEAD:<path>\`: the
canonical copy and the public copy. Both share Git blob SHA-1
\`${historicalBlobSha1}\` and SHA-256 \`${historicalRasterSha256}\`. That
revision contains no tracked backend copy, so this archive deliberately makes
no such claim.

The retained original provider prompt was copied, not moved, from
\`${retainedPromptPath}\` and has SHA-256 \`${originalPromptSha256}\`. No
active or deployed asset, curriculum link, QA record, goal-book reference, or
rollout-status reference is changed or reactivated by this archive.

The exact sources, outputs, hashes, current-state prerequisites, and bounded
materialization-plan digest are recorded in \`archive-manifest.json\`.
`

const batch217 = `# Mathematik goal visualization review – Batch 217

Review date: 2026-08-28

Scope: provenance-only storage follow-up to Batch 216 for canonical Mathematics
goal \`${goalId}\`.

| Goal ID | Decision | Notes |
|---|---|---|
| \`${goalId}\` | \`archived_rejected_nano_banana_predecessor\` | The mathematically misleading Nano Banana Pro predecessor remains inactive. Its two historically tracked copies and retained original prompt are preserved under \`${archiveRoot}/\`; the accepted PNG/SVG correction and all published references remain byte-identical. |

This follow-up does not create, replace, reactivate, or deploy an image. It
adds only revision-safe provenance evidence for the predecessor that Batch 216
replaced after an exact independent geometry review. No tracked historical
backend copy exists in the bound Git revision and none is claimed here.

Historical image SHA-256: \`sha256:${historicalRasterSha256}\`  
Retained prompt SHA-256: \`sha256:${originalPromptSha256}\`  
Active PNG SHA-256: \`sha256:${activeRasterSha256}\`  
Active SVG SHA-256: \`sha256:${activeGeometrySha256}\`
`

const outputBoundary = [
  archive.canonicalRaster,
  archive.publicRaster,
  archive.originalPrompt,
  archive.readme,
  archive.manifest,
  batch217Path,
] as const

const archiveManifestBody = {
  schemaVersion: 1,
  archiveKind: 'goal-visualization-rejected-provider-predecessor-provenance',
  archiveDate: '2026-08-28',
  subject: 'mathematik',
  goalId,
  provider: 'Google Gemini / Nano Banana Pro',
  decision: 'archived_rejected_nano_banana_predecessor',
  archiveAlgorithmVersion,
  historicalGitRevision: historicalHeadRevision,
  historicalArtifacts: historicalArtifacts.map((artifact) => ({
    sourceKind: 'tracked-git-head-blob',
    sourcePath: artifact.sourcePath,
    sourceGitBlobSha1: artifact.gitBlobSha1,
    archivePath: artifact.archivePath,
    sha256: `sha256:${historicalRasterSha256}`,
  })),
  retainedPrompt: {
    sourceKind: 'retained-current-provider-prompt',
    sourcePath: retainedPromptPath,
    archivePath: archive.originalPrompt,
    retainedAtSource: true,
    sha256: `sha256:${originalPromptSha256}`,
  },
  currentReplacement: {
    state: 'active_and_unchanged',
    rasterSha256: `sha256:${activeRasterSha256}`,
    geometrySha256: `sha256:${activeGeometrySha256}`,
    files: activeReplacementFiles,
  },
  prerequisites: {
    canonical: { path: canonicalPath, sha256: `sha256:${canonicalSha256}` },
    visualizationQa: { path: qaPath, sha256: `sha256:${qaSha256}` },
    batch216: { path: batch216Path, sha256: `sha256:${batch216Sha256}` },
    publishedReferences,
    inactiveJpgPaths,
  },
  followUpReview: {
    path: batch217Path,
    sha256: `sha256:${sha256(batch217)}`,
  },
} as const

const archivePlanSha256 = sha256(JSON.stringify({
  archiveAlgorithmVersion,
  outputBoundary,
  archiveManifestPath: archive.manifest,
  archiveManifestBody,
  readmeSha256: sha256(readme),
  batch217Sha256: sha256(batch217),
}))

const archiveManifest = `${JSON.stringify({
  ...archiveManifestBody,
  archivePlanSha256: `sha256:${archivePlanSha256}`,
}, null, 2)}\n`

const plannedFiles: PlannedFile[] = [
  ...historicalBytes.map((artifact) => ({
    path: artifact.archivePath,
    bytes: artifact.bytes,
    purpose: `historical HEAD blob ${artifact.sourcePath}`,
  })),
  {
    path: archive.originalPrompt,
    bytes: originalPromptBytes,
    purpose: 'retained original Nano Banana Pro prompt copy',
  },
  { path: archive.readme, bytes: Buffer.from(readme), purpose: 'archive README' },
  {
    path: archive.manifest,
    bytes: Buffer.from(archiveManifest),
    purpose: 'archive manifest',
  },
  { path: batch217Path, bytes: Buffer.from(batch217), purpose: 'Batch-217 follow-up review' },
]

const plannedPaths = plannedFiles.map(({ path }) => path)
if (
  plannedPaths.length !== outputBoundary.length
  || new Set(plannedPaths).size !== outputBoundary.length
  || plannedPaths.some((path) => !outputBoundary.includes(path as (typeof outputBoundary)[number]))
) throw new Error('Math B42 predecessor archive escaped its exact six-file output boundary')

if (
  expectedArchivePlanSha256 !== 'PENDING'
  && archivePlanSha256 !== expectedArchivePlanSha256
) {
  throw new Error(
    `Math B42 predecessor archive plan drift: ${archivePlanSha256} `
    + `!= ${expectedArchivePlanSha256}`,
  )
}

const stagingPath = (path: string): string => `${path}.b42-nbp-archive-staging`

const filePathsBelow = (root: string): string[] => {
  const rootPath = absolute(root)
  if (!existsSync(rootPath)) return []
  const pending = [rootPath]
  const files: string[] = []
  while (pending.length > 0) {
    const directory = pending.pop()!
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = resolve(directory, entry.name)
      if (entry.isDirectory()) pending.push(path)
      else if (entry.isFile()) files.push(relative(rootPath, path).split(sep).join('/'))
      else throw new Error(`Unexpected non-file Math B42 archive entry: ${path}`)
    }
  }
  return files.sort()
}

const expectedArchiveFiles = plannedFiles
  .filter(({ path }) => path.startsWith(`${archiveRoot}/`))
  .map(({ path }) => relative(absolute(archiveRoot), absolute(path)).split(sep).join('/'))
  .sort()
const allowedPartialArchiveFiles = [
  ...expectedArchiveFiles,
  ...plannedFiles
    .filter(({ path }) => path.startsWith(`${archiveRoot}/`))
    .map(({ path }) => (
      relative(absolute(archiveRoot), absolute(stagingPath(path))).split(sep).join('/')
    )),
].sort()

const assertArchiveTree = (complete: boolean): void => {
  const actual = filePathsBelow(archiveRoot)
  const allowed = complete ? expectedArchiveFiles : allowedPartialArchiveFiles
  if (actual.some((path) => !allowed.includes(path))) {
    throw new Error(`Unexpected Math B42 predecessor archive tree: ${JSON.stringify(actual)}`)
  }
  if (complete && JSON.stringify(actual) !== JSON.stringify(expectedArchiveFiles)) {
    throw new Error(`Incomplete Math B42 predecessor archive tree: ${JSON.stringify(actual)}`)
  }
}

const assertExistingOutputs = (): void => {
  for (const file of plannedFiles) {
    const expected = sha256(file.bytes)
    if (existsSync(absolute(file.path))) {
      assertFileHash(file.path, expected, `Existing ${file.purpose}`)
    }
    const staging = stagingPath(file.path)
    if (existsSync(absolute(staging))) {
      assertFileHash(staging, expected, `Restart staging for ${file.purpose}`)
    }
  }
  assertArchiveTree(false)
}

const assertNoStagingFiles = (): void => {
  for (const file of plannedFiles) {
    const staging = stagingPath(file.path)
    if (existsSync(absolute(staging))) {
      throw new Error(`Redundant Math B42 predecessor staging file remains: ${staging}`)
    }
  }
}

const writeAtomicExact = (file: PlannedFile): void => {
  const expected = sha256(file.bytes)
  const target = absolute(file.path)
  const staging = absolute(stagingPath(file.path))
  mkdirSync(dirname(target), { recursive: true })
  if (existsSync(target)) {
    assertFileHash(file.path, expected, `Existing exact ${file.purpose}`)
    if (existsSync(staging)) {
      assertFileHash(stagingPath(file.path), expected, `Redundant staging for ${file.purpose}`)
      unlinkSync(staging)
    }
    return
  }
  if (existsSync(staging)) {
    assertFileHash(stagingPath(file.path), expected, `Recoverable staging for ${file.purpose}`)
    renameSync(staging, target)
    assertFileHash(file.path, expected, `Recovered exact ${file.purpose}`)
    return
  }
  writeFileSync(staging, file.bytes, { flag: 'wx' })
  assertFileHash(stagingPath(file.path), expected, `Atomic staging for ${file.purpose}`)
  renameSync(staging, target)
  assertFileHash(file.path, expected, `New exact ${file.purpose}`)
}

assertExistingOutputs()

const changed = plannedFiles.filter(({ path, bytes }) => (
  !existsSync(absolute(path)) || !readFileSync(absolute(path)).equals(bytes)
))
const exactAfter = changed.length === 0

if (checkMode) {
  if (!exactAfter) {
    throw new Error(`Math B42 predecessor archive is not materialized; writes=${changed.length}`)
  }
  assertArchiveTree(true)
  assertNoStagingFiles()
  assertCurrentActiveState()
}

if (writeMode) {
  if (expectedArchivePlanSha256 === 'PENDING') {
    throw new Error(
      `Refusing --write until expectedArchivePlanSha256 is bound to ${archivePlanSha256}`,
    )
  }
  execFileSync('node', ['scripts/check_openai_plugin_review_freeze.mjs'], {
    cwd: repoRoot,
    stdio: 'inherit',
  })
  for (const file of plannedFiles) writeAtomicExact(file)
  assertArchiveTree(true)
  assertNoStagingFiles()
  assertCurrentActiveState()
  const incomplete = plannedFiles.filter(({ path, bytes }) => (
    !existsSync(absolute(path)) || !readFileSync(absolute(path)).equals(bytes)
  ))
  if (incomplete.length > 0) {
    throw new Error(`Incomplete Math B42 predecessor archive write: ${incomplete.length}`)
  }
}

const finalWrites = plannedFiles.filter(({ path, bytes }) => (
  !existsSync(absolute(path)) || !readFileSync(absolute(path)).equals(bytes)
))
const status = writeMode ? 'WRITE' : finalWrites.length === 0 ? 'PASS' : 'PLAN'
console.log(
  `CHECK archive_math_b42_nano_banana_predecessor ${status} `
  + `plannedWrites=${finalWrites.length} outputs=${plannedFiles.length}`,
)
for (const file of plannedFiles) {
  console.log(
    `PLANNED_OUTPUT ${sha256(file.bytes)} `
    + `${finalWrites.some(({ path }) => path === file.path) ? 'WRITE' : 'UNCHANGED'} `
    + file.path,
  )
}
console.log(`ARCHIVE_PLAN_SHA256 ${archivePlanSha256} binding=${expectedArchivePlanSha256}`)
