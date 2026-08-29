import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import {
  existsSync,
  linkSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmdirSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs'
import { basename, dirname, relative, resolve, sep } from 'node:path'

const repoRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')
const checkMode = process.argv.includes('--check')
const allowedArguments = new Set(['--write', '--check'])
const unexpectedArguments = process.argv.slice(2).filter((argument) => !allowedArguments.has(argument))
if (unexpectedArguments.length > 0) throw new Error(`Unexpected arguments: ${unexpectedArguments.join(', ')}`)
if (writeMode && checkMode) throw new Error('Use either --write or --check, not both')

const goalId = '5cf160e5-e0c2-5552-b2cf-0f04871c5e7e'
const assetSha256 = 'df281eca0a3fc705be47d0f32afc73eef5823baf1edcf988168d3db1b68a8bfd'
const promptSha256 = '07d5bbf8e6164b019721bb45bec7ca45dbef9f13a78b97a6976e2feb10560112'
const qaSha256 = '8509b203651185e17cbb461e4802e22b8b7432a31ecb34b590c64a3e80aa1861'
const archiveAlgorithmVersion = 'same-filesystem-hardlink-verify-unlink-v2'
const expectedArchivePlanSha256 = '93d44e8b76ff187371bdf0db3c4b7e4abc54519962cb0883a2cf47f535f46b18'

const active = {
  canonicalAsset: `curricula/DE/Gymnasium/visualizations/physik/${goalId}/${goalId}.jpg`,
  canonicalPrompt: `curricula/DE/Gymnasium/visualizations/physik/${goalId}/prompt.de.md`,
  publicAsset: `app/public/assets/goal-visualizations/physik/${goalId}/${goalId}.jpg`,
  backendAsset: `backend/src/main/resources/static/assets/goal-visualizations/physik/${goalId}/${goalId}.jpg`,
} as const

const archiveRoot = (
  'curricula/DE/Gymnasium/quality/goal-visualization-archive/'
  + '2026-08-28-physics-b023-astronomical-unit'
)
const archive = {
  canonicalAsset: `${archiveRoot}/canonical/physik/${goalId}/${goalId}.jpg`,
  canonicalPrompt: `${archiveRoot}/canonical/physik/${goalId}/prompt.de.md`,
  publicAsset: `${archiveRoot}/public/physik/${goalId}/${goalId}.jpg`,
  backendAsset: `${archiveRoot}/backend/physik/${goalId}/${goalId}.jpg`,
  readme: `${archiveRoot}/README.md`,
  manifest: `${archiveRoot}/archive-manifest.json`,
} as const

const qaPath = 'curricula/DE/Gymnasium/quality/goal-visualization-qa/physik.qa.json'
const batch083Path = 'curricula/DE/Gymnasium/quality/goal-visualization-review/physik-batch-083.md'
const batch083Sha256 = '29bd07f0751577755714dc0136ff1263f1f2e5e92b1fbbfe0ea23a7db0660382'
const batch084Path = 'curricula/DE/Gymnasium/quality/goal-visualization-review/physik-batch-084.md'
const activeAssetUrl = `/assets/goal-visualizations/physik/${goalId}/${goalId}.jpg`
const activeReferencePaths = [
  'app/public/lernzielbuch/de-gym-physik-bundesweit.book-model.json',
  'app/public/lernzielbuch/de-gym-physik-bundesweit.pdf.render-manifest.json',
  'backend/src/main/resources/static/lernzielbuch/de-gym-physik-bundesweit.book-model.json',
  'backend/src/main/resources/static/lernzielbuch/de-gym-physik-bundesweit.pdf.render-manifest.json',
  'curricula/DE/Gymnasium/quality/goal-visualization-review/physik-rollout-status.json',
  'curricula/DE/Gymnasium/quality/goal-visualization-review/physik-rollout-status.md',
] as const

const absolute = (path: string): string => resolve(repoRoot, path)
const sha256 = (value: string | Uint8Array): string => createHash('sha256').update(value).digest('hex')
const assertFileHash = (path: string, expected: string, label: string): void => {
  if (!existsSync(absolute(path))) throw new Error(`${label}: missing ${path}`)
  const actual = sha256(readFileSync(absolute(path)))
  if (actual !== expected) throw new Error(`${label}: ${path} has ${actual}, expected ${expected}`)
}

const readme = `# Archived Physics B023 astronomical-unit visualization

Date: 2026-08-28

The Google Gemini / Nano Banana Pro visualization for canonical Physics goal
\`${goalId}\` is retained here byte-for-byte after its active primary link was
withdrawn in Batch 083. The revised learning goal now distinguishes the exact
modern definition of the astronomical unit from historical observation-based
inference. The image instead labels its simplified geometrical reconstruction
as exact, so keeping it in active or deployed asset roots would be misleading.

Nothing was replaced. The canonical, public, and backend image copies and the
original provider prompt were moved into this archive. All three image copies
have SHA-256 \`${assetSha256}\`; the prompt has SHA-256
\`${promptSha256}\`.

The exact source-to-archive mapping, hashes, prerequisite QA evidence, and the
bound migration-plan digest are recorded in \`archive-manifest.json\`.

The asset may be restored only after a targeted Nano Banana Pro correction is
separately reviewed, linked to the current goal, and propagated to all runtime
roots. Until then the canonical QA record remains
\`deferred_provider_limitation\`.
`

const batch084 = `# Physik goal visualization review – Batch 084

Review date: 2026-08-28

Scope: storage follow-up to Batch 083 for canonical Physics goal
\`${goalId}\`.

| Goal ID | Decision | Notes |
|---|---|---|
| \`${goalId}\` | \`deferred_provider_limitation\` | The incompatible Nano Banana Pro visualization stays withdrawn. Its three exact image copies and original prompt are preserved under \`${archiveRoot}/\`; no replacement asset was created. |

Batch 083 first removed the active canonical resource link while preserving all
asset bytes. The strict asset-integrity gate correctly rejects unlinked images
inside active canonical and deployed roots. This follow-up therefore moves the
files into the established quality archive instead of weakening the orphan
asset gate or deleting the provider work.

Image SHA-256: \`sha256:${assetSha256}\`  
Prompt SHA-256: \`sha256:${promptSha256}\`
`

const artifacts = [
  { source: active.canonicalAsset, target: archive.canonicalAsset, sha256: assetSha256 },
  { source: active.canonicalPrompt, target: archive.canonicalPrompt, sha256: promptSha256 },
  { source: active.publicAsset, target: archive.publicAsset, sha256: assetSha256 },
  { source: active.backendAsset, target: archive.backendAsset, sha256: assetSha256 },
] as const

const archivePlanSha256 = sha256(JSON.stringify({
  archiveAlgorithmVersion,
  goalId,
  assetSha256,
  promptSha256,
  qaPath,
  qaSha256,
  batch083Path,
  batch083Sha256,
  batch084Path,
  artifacts,
  archiveManifestPath: archive.manifest,
  readmeSha256: sha256(readme),
  batch084Sha256: sha256(batch084),
  activeAssetUrl,
  activeReferencePaths,
}))

const archiveManifest = `${JSON.stringify({
  schemaVersion: 1,
  archiveKind: 'goal-visualization-provider-provenance',
  archiveDate: '2026-08-28',
  subject: 'physik',
  goalId,
  provider: 'Google Gemini / Nano Banana Pro',
  decision: 'deferred_provider_limitation',
  archiveAlgorithmVersion,
  archivePlanSha256: `sha256:${archivePlanSha256}`,
  prerequisites: {
    visualizationQa: { path: qaPath, sha256: `sha256:${qaSha256}` },
    batch083: { path: batch083Path, sha256: `sha256:${batch083Sha256}` },
  },
  artifacts: artifacts.map((artifact) => ({
    sourcePath: artifact.source,
    archivePath: artifact.target,
    sha256: `sha256:${artifact.sha256}`,
  })),
  followUpReview: {
    path: batch084Path,
    sha256: `sha256:${sha256(batch084)}`,
  },
}, null, 2)}\n`

const stagingPath = (path: string): string => `${path}.b023-staging`

const writeAtomicExact = (
  path: string,
  bytes: string | Uint8Array,
  expectedSha256: string,
): void => {
  const target = absolute(path)
  const staging = absolute(stagingPath(path))
  mkdirSync(dirname(target), { recursive: true })
  if (existsSync(target)) {
    assertFileHash(path, expectedSha256, 'Existing exact B023 archive output')
    if (existsSync(staging)) unlinkSync(staging)
    return
  }
  if (existsSync(staging)) {
    if (sha256(readFileSync(staging)) === expectedSha256) {
      renameSync(staging, target)
      assertFileHash(path, expectedSha256, 'Recovered exact B023 archive output')
      return
    }
    unlinkSync(staging)
  }
  writeFileSync(staging, bytes, { flag: 'wx' })
  const stagingSha256 = sha256(readFileSync(staging))
  if (stagingSha256 !== expectedSha256) {
    throw new Error(`Atomic B023 staging hash mismatch for ${path}: ${stagingSha256}`)
  }
  renameSync(staging, target)
  assertFileHash(path, expectedSha256, 'New exact B023 archive output')
}

const assertActiveDirectoryShape = (): void => {
  const allowedByDirectory = new Map<string, Set<string>>()
  for (const { source } of artifacts) {
    const directory = dirname(absolute(source))
    const allowed = allowedByDirectory.get(directory) ?? new Set<string>()
    allowed.add(basename(source))
    allowedByDirectory.set(directory, allowed)
  }
  for (const [directory, allowed] of allowedByDirectory) {
    if (!existsSync(directory)) continue
    const actual = readdirSync(directory)
    if (actual.some((name) => !allowed.has(name))) {
      throw new Error(`Unexpected active astronomical-unit directory contents: ${directory}`)
    }
  }
}

const assertCanonicalState = (): void => {
  const landscape = JSON.parse(readFileSync(absolute(
    'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json',
  ), 'utf8')) as { goals?: Array<{ id?: string; resourceLinks?: Array<{ type?: string }> }> }
  const goal = landscape.goals?.find(({ id }) => id === goalId)
  if (!goal || (goal.resourceLinks ?? []).some(({ type }) => type === 'goal-visualization')) {
    throw new Error('Astronomical-unit primary visualization link is not withdrawn')
  }
  assertFileHash(qaPath, qaSha256, 'Fresh standard Physics visualization-QA ledger')
  const qa = JSON.parse(readFileSync(absolute(qaPath), 'utf8')) as {
    records?: Array<{ goalId?: string; visualizationState?: string; missingReason?: string }>
  }
  const record = qa.records?.find(({ goalId: candidate }) => candidate === goalId)
  if (
    record?.visualizationState !== 'missing'
    || record.missingReason !== 'deferred_provider_limitation'
  ) throw new Error('Astronomical-unit QA record is not fail-closed deferred')
  assertFileHash(batch083Path, batch083Sha256, 'Batch-083 review evidence')
}

const assertNoActivePublishedReferences = (): void => {
  for (const path of activeReferencePaths) {
    if (!existsSync(absolute(path))) throw new Error(`Published-reference guard is missing ${path}`)
    if (readFileSync(absolute(path)).includes(Buffer.from(activeAssetUrl))) {
      throw new Error(`Published-reference guard still contains retired asset URL: ${path}`)
    }
  }
}

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
      else throw new Error(`Unexpected non-file archive entry: ${path}`)
    }
  }
  return files.sort()
}

const assertArchiveExact = (): void => {
  for (const { target, sha256: expected } of artifacts) {
    assertFileHash(target, expected, 'Archived B023 visualization provenance')
  }
  assertFileHash(archive.readme, sha256(readme), 'B023 visualization archive README')
  assertFileHash(archive.manifest, sha256(archiveManifest), 'B023 visualization archive manifest')
  assertFileHash(batch084Path, sha256(batch084), 'Batch-084 visualization review')
  const expectedFiles = [
    ...artifacts.map(({ target }) => target),
    archive.readme,
    archive.manifest,
  ].map((path) => relative(absolute(archiveRoot), absolute(path)).split(sep).join('/')).sort()
  const actualFiles = filePathsBelow(archiveRoot)
  if (JSON.stringify(actualFiles) !== JSON.stringify(expectedFiles)) {
    throw new Error(`Unexpected B023 archive tree: ${JSON.stringify(actualFiles)}`)
  }
}

const moveArtifactRecoverably = ({
  source,
  target,
  sha256: expected,
}: (typeof artifacts)[number]): void => {
  const sourcePath = absolute(source)
  const targetPath = absolute(target)
  const sourceExists = existsSync(sourcePath)
  const targetExists = existsSync(targetPath)
  if (!sourceExists && !targetExists) {
    throw new Error(`B023 visualization provenance missing from active and archive paths: ${source}`)
  }
  if (sourceExists) assertFileHash(source, expected, 'Active B023 visualization provenance')
  if (targetExists) assertFileHash(target, expected, 'Archived B023 visualization provenance')
  if (!targetExists) {
    mkdirSync(dirname(targetPath), { recursive: true })
    linkSync(sourcePath, targetPath)
    assertFileHash(target, expected, 'New hard-linked B023 archive provenance')
  }
  if (existsSync(sourcePath)) {
    assertFileHash(source, expected, 'Immediate pre-unlink B023 source verification')
    const sourceStat = statSync(sourcePath)
    const targetStat = statSync(targetPath)
    if (sourceStat.dev !== targetStat.dev || sourceStat.ino !== targetStat.ino) {
      throw new Error(`Refusing to unlink non-identical B023 source inode: ${source}`)
    }
    unlinkSync(sourcePath)
  }
  assertFileHash(target, expected, 'Final archived B023 visualization provenance')
}

const counts = () => ({
  active: artifacts.filter(({ source }) => existsSync(absolute(source))).length,
  archived: artifacts.filter(({ target }) => existsSync(absolute(target))).length,
})

assertCanonicalState()
assertActiveDirectoryShape()
for (const { source, target, sha256: expected } of artifacts) {
  if (!existsSync(absolute(source)) && !existsSync(absolute(target))) {
    throw new Error(`B023 visualization bytes are missing from both active and archive roots: ${source}`)
  }
  if (existsSync(absolute(source))) assertFileHash(source, expected, 'Active B023 visualization provenance')
  if (existsSync(absolute(target))) assertFileHash(target, expected, 'Archived B023 visualization provenance')
}

if (expectedArchivePlanSha256 !== 'PENDING' && archivePlanSha256 !== expectedArchivePlanSha256) {
  throw new Error(`B023 visualization archive plan drift: ${archivePlanSha256} != ${expectedArchivePlanSha256}`)
}

const before = counts()
const exactAfter = before.active === 0 && before.archived === artifacts.length
if (checkMode) {
  if (!exactAfter) throw new Error('B023 astronomical-unit visualization is not fully archived')
  assertArchiveExact()
  assertNoActivePublishedReferences()
}

if (writeMode) {
  if (expectedArchivePlanSha256 === 'PENDING') {
    throw new Error(`Refusing --write until expectedArchivePlanSha256 is bound to ${archivePlanSha256}`)
  }
  assertNoActivePublishedReferences()
  execFileSync('node', ['scripts/check_openai_plugin_review_freeze.mjs'], {
    cwd: repoRoot,
    stdio: 'inherit',
  })
  writeAtomicExact(archive.readme, readme, sha256(readme))
  writeAtomicExact(archive.manifest, archiveManifest, sha256(archiveManifest))
  writeAtomicExact(batch084Path, batch084, sha256(batch084))
  for (const artifact of artifacts) moveArtifactRecoverably(artifact)
  const activeDirectories = [...new Set(artifacts.map(({ source }) => dirname(absolute(source))))]
    .sort((left, right) => right.length - left.length)
  for (const directory of activeDirectories) {
    if (existsSync(directory) && readdirSync(directory).length === 0) rmdirSync(directory)
  }
  assertArchiveExact()
  const afterWrite = counts()
  if (afterWrite.active !== 0 || afterWrite.archived !== artifacts.length) {
    throw new Error(`Incomplete B023 archive write: ${JSON.stringify(afterWrite)}`)
  }
}

const final = counts()
console.log(
  `CHECK archive_physics_b023_astronomical_unit_visualization ${writeMode ? 'WRITE' : exactAfter ? 'PASS' : 'PLAN'} `
  + `active=${final.active}/${artifacts.length} archived=${final.archived}/${artifacts.length}`,
)
console.log(`ARCHIVE_PLAN_SHA256 ${archivePlanSha256} binding=${expectedArchivePlanSha256}`)
