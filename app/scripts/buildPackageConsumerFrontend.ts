import { createHash } from 'node:crypto'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { build } from 'vite'

const APP_ROOT = path.resolve(import.meta.dirname, '..')
const REPO_ROOT = path.resolve(APP_ROOT, '..')
const DEFAULT_OUTPUT = path.resolve(REPO_ROOT, 'tmp', 'package-consumer-runtime', 'frontend')
const UUID_PATTERN = /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/giu
const SCANNABLE_EXTENSIONS = new Set(['.css', '.html', '.js', '.json', '.map', '.txt', '.webmanifest'])
const FORBIDDEN_REPOSITORY_POLICY_MARKERS = [
  'http://localhost:8080',
  'gymnasium-duration-model-policy.json',
  'GYMNASIUM_DURATION_OFFERINGS',
  'GYMNASIUM_CONTENT_OFFERINGS',
  'LEGACY_TO_CANONICAL_GYMNASIUM_LANDSCAPE_ID',
  '/data/',
  'goal-source-rationales',
  'repositoryGoalSourceRationales',
  'abi26-he-mathe',
  'curricula/DE/',
  'canonical-gymnasium',
] as const
const FORBIDDEN_REPOSITORY_CHUNK_MARKERS = [
  'UsersView',
  'WorkbenchView',
  'FlashcardEditorView',
  'GraphEditorView',
  'CanonicalClusterEditorView',
  'CompositionViewEditorView',
  'SemanticAtomicityReviewView',
  'GoalVisualizationQaView',
  'CurriculumQualityDashboardView',
  'CurriculumMappingWorkbenchView',
] as const

const parseOutputDirectory = (): string => {
  const marker = '--out-dir'
  const index = process.argv.indexOf(marker)
  if (index < 0) return DEFAULT_OUTPUT
  const value = process.argv[index + 1]?.trim()
  if (!value) throw new Error(`${marker} requires a directory`)
  return path.resolve(process.cwd(), value)
}

const assertSafeOutputDirectory = (outputDirectory: string): void => {
  const relative = path.relative(path.resolve(REPO_ROOT, 'tmp'), outputDirectory)
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Package-consumer frontend output must be below tmp/: ${outputDirectory}`)
  }
}

const sha256 = (bytes: Buffer | string): string =>
  createHash('sha256').update(bytes).digest('hex')

const collectFiles = async (root: string, current = root): Promise<string[]> => {
  const entries = await fs.readdir(current, { withFileTypes: true })
  const files: string[] = []
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const absolute = path.join(current, entry.name)
    if (entry.isDirectory()) files.push(...await collectFiles(root, absolute))
    else if (entry.isFile()) files.push(path.relative(root, absolute).split(path.sep).join('/'))
    else throw new Error(`Package-consumer frontend contains a non-regular entry: ${absolute}`)
  }
  return files
}

const digestTree = async (root: string, files: string[]): Promise<string> => {
  const digest = createHash('sha256')
  for (const relativePath of files) {
    const bytes = await fs.readFile(path.join(root, relativePath))
    digest.update(relativePath)
    digest.update('\0')
    digest.update(String(bytes.length))
    digest.update('\0')
    digest.update(sha256(bytes))
    digest.update('\n')
  }
  return digest.digest('hex')
}

const assertCatalogOnlyCurriculumPolicy = async (root: string, files: string[]): Promise<void> => {
  const forbiddenChunks = files.filter((relativePath) => (
    FORBIDDEN_REPOSITORY_CHUNK_MARKERS.some((marker) => relativePath.includes(marker))
  ))
  if (forbiddenChunks.length > 0) {
    throw new Error(`Package-consumer frontend includes repository authoring chunks: ${forbiddenChunks.join(', ')}`)
  }
  const embeddedCurriculumIds = new Map<string, Set<string>>()
  const forbiddenMarkers = new Map<string, Set<string>>()
  const catalogEndpointFiles: string[] = []

  for (const relativePath of files) {
    if (!SCANNABLE_EXTENSIONS.has(path.extname(relativePath).toLowerCase())) continue
    const text = await fs.readFile(path.join(root, relativePath), 'utf8')
    if (text.includes('/api/ui/curriculum-catalog')) catalogEndpointFiles.push(relativePath)

    for (const match of text.matchAll(UUID_PATTERN)) {
      const id = match[0].toLowerCase()
      const paths = embeddedCurriculumIds.get(id) ?? new Set<string>()
      paths.add(relativePath)
      embeddedCurriculumIds.set(id, paths)
    }
    FORBIDDEN_REPOSITORY_POLICY_MARKERS.forEach((marker) => {
      if (!text.includes(marker)) return
      const paths = forbiddenMarkers.get(marker) ?? new Set<string>()
      paths.add(relativePath)
      forbiddenMarkers.set(marker, paths)
    })
  }

  if (embeddedCurriculumIds.size > 0) {
    const evidence = [...embeddedCurriculumIds.entries()]
      .slice(0, 12)
      .map(([id, paths]) => `${id} in ${[...paths].join(', ')}`)
      .join('; ')
    throw new Error(`Package-consumer frontend embeds repository curriculum IDs: ${evidence}`)
  }
  if (forbiddenMarkers.size > 0) {
    const evidence = [...forbiddenMarkers.entries()]
      .map(([marker, paths]) => `${marker} in ${[...paths].join(', ')}`)
      .join('; ')
    throw new Error(`Package-consumer frontend embeds repository curriculum policy: ${evidence}`)
  }
  if (catalogEndpointFiles.length === 0) {
    throw new Error('Package-consumer frontend has no runtime curriculum catalog client')
  }
  const failClosedMarkerPresent = await Promise.all(files
    .filter((relativePath) => SCANNABLE_EXTENSIONS.has(path.extname(relativePath).toLowerCase()))
    .map(async (relativePath) => (await fs.readFile(path.join(root, relativePath), 'utf8')).includes('runtime-catalog-error')))
  if (!failClosedMarkerPresent.some(Boolean)) {
    throw new Error('Package-consumer frontend has no stable fail-closed catalog error marker')
  }
}

const main = async (): Promise<void> => {
  const outputDirectory = parseOutputDirectory()
  assertSafeOutputDirectory(outputDirectory)

  const originalWorkingDirectory = process.cwd()
  try {
    process.chdir(APP_ROOT)
    await build({
      root: APP_ROOT,
      configFile: path.join(APP_ROOT, 'vite.config.ts'),
      mode: 'package-consumer',
      // The repository public tree contains curriculum decks, visualizations, and
      // source-evidence projections. Package mode must obtain all such bytes from
      // the active package APIs, so none of that tree may enter this build.
      publicDir: false,
      build: {
        outDir: outputDirectory,
        emptyOutDir: true,
      },
    })
  } finally {
    process.chdir(originalWorkingDirectory)
  }

  const files = await collectFiles(outputDirectory)
  if (!files.includes('index.html')) {
    throw new Error('Package-consumer frontend has no index.html')
  }
  const forbiddenPrefixes = [
    'data/',
    'ai-assets/',
    'assets/goal-visualizations/',
    'curricula/',
    'docs/',
  ]
  const forbidden = files.filter((file) => forbiddenPrefixes.some((prefix) => file.startsWith(prefix)))
  if (forbidden.length > 0) {
    throw new Error(`Repository curriculum payload leaked into package-consumer frontend: ${forbidden.join(', ')}`)
  }
  await assertCatalogOnlyCurriculumPolicy(outputDirectory, files)

  const report = {
    reportFormatVersion: 1,
    mode: 'package-consumer',
    publicDirectoryCopied: false,
    apiBase: 'same-origin',
    curriculumPolicySource: 'runtime-catalog-only',
    embeddedCurriculumIdCount: 0,
    fileCount: files.length,
    frontendSha256: await digestTree(outputDirectory, files),
    files,
  }
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`)
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.stack ?? error.message : String(error)
  process.stderr.write(`FAIL package-consumer frontend build: ${message}\n`)
  process.exitCode = 1
})
