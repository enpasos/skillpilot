import { execFile } from 'node:child_process'
import { copyFile, mkdir, mkdtemp, realpath, rm, rmdir, writeFile } from 'node:fs/promises'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { promisify } from 'node:util'
import { chromium } from 'playwright'
import {
  GOAL_BOOK_PUBLICATION_REGISTRY,
  goalBookModelUrl,
  goalBookPdfUrl,
  goalBookRenderManifestUrl,
  type GoalBookPublicationDefinition,
} from '../src/utils/goalBookPublicationRegistry'
import { MAX_GOAL_BOOK_ORIGINAL_SOURCES_BYTES, parseGoalBookOriginalSources } from '../src/utils/goalBookOriginalSources'
import {
  goalBookPublicationPaths,
  parseGoalBookPublicationIndex,
  verifyPublishedGoalBook,
  type GoalBookPublicationIndex,
} from './checkGoalBookPublication'
import { loadGoalBookBuildInputs, type GoalBookModel } from './goalBookModel'
import { buildGoalBookOriginalSources, serializeGoalBookOriginalSources } from './goalBookOriginalSources'
import { writeGoalBookPdf, writeGoalBookRenderManifest } from './goalBookRenderer'
import {
  GOAL_BOOK_BUILD_CACHE_FILE,
  goalBookBuildCacheMatches,
  hashGoalBookBuildBytes,
  hashGoalBookBuildFile,
  promoteGoalBookBuildDirectory,
  readGoalBookBuildCache,
  type GoalBookBuildCache,
} from './goalBookBuildCache'

const APP_ROOT = fileURLToPath(new URL('../', import.meta.url))
const REPOSITORY_ROOT = resolve(APP_ROOT, '..')
const DEFAULT_PUBLIC_ROOT = resolve(APP_ROOT, 'public')
const DEFAULT_OUTPUT_DIRECTORY = resolve(DEFAULT_PUBLIC_ROOT, 'lernzielbuch')
const FEEDBACK_BASE_URL = 'https://skillpilot.com/lernziel-feedback'
const execFileAsync = promisify(execFile)
const serialize = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`

export type GoalBookPublicationsBuildOptions = {
  force?: boolean
  outputDirectory?: string
  chromiumExecutablePath?: string
}

export const goalBookBuildArtifactNames = (definition: GoalBookPublicationDefinition): string[] => [
  `${definition.artifactStem}.book-model.json`,
  `${definition.artifactStem}.original-sources.json`,
  `${definition.artifactStem}.pdf`,
  `${definition.artifactStem}.pdf.render-manifest.json`,
]

const publicationFilenames = (): string[] => [
  ...GOAL_BOOK_PUBLICATION_REGISTRY.flatMap(goalBookBuildArtifactNames),
  'index.json',
  GOAL_BOOK_BUILD_CACHE_FILE,
]

/** All effective data are in the rebuilt model/source index; also bind rendering code and tools. */
const renderEnvironmentDigest = async (chromiumExecutablePath: string): Promise<string> => {
  const paths = [
    'scripts/buildGoalBookPublications.ts',
    'scripts/goalBookBuildCache.ts',
    'scripts/goalBookModel.ts',
    'scripts/goalBookRenderer.ts',
    'scripts/goalBookOriginalSources.ts',
    'scripts/checkGoalBookPublication.ts',
    'src/utils/goalBookPublicationRegistry.ts',
    'package-lock.json',
    '../contracts/goal-book/v1/goal-book-render-manifest-v2.schema.json',
  ]
  const code = await Promise.all(paths.map(async (path) => [path, await hashGoalBookBuildFile(resolve(APP_ROOT, path))]))
  let fontList: string
  try {
    fontList = (await execFileAsync('fc-list', ['--format', '%{file}\n'], { maxBuffer: 8 * 1024 * 1024 })).stdout
  } catch (error) {
    throw new Error(`Goal-book builds require fontconfig (fc-list): ${error instanceof Error ? error.message : String(error)}`)
  }
  const fontPaths = [...new Set(fontList.split('\n').filter(Boolean))].sort()
  if (!fontPaths.length) throw new Error('Goal-book builds require installed system fonts')
  const fontDigests = new Map<string, string>()
  for (const path of fontPaths) fontDigests.set(path, await hashGoalBookBuildFile(await realpath(path)))
  // Same font bytes with different fontconfig preferences can produce different layout.
  // Bind ordered fallback choices, without making CI cache keys depend on home paths.
  const fontPreferences = []
  for (const family of ['Arial', 'Helvetica', 'sans-serif', 'Courier New', 'Courier', 'monospace']) {
    for (const style of ['regular', 'bold']) {
      const { stdout } = await execFileAsync('fc-match', ['-s', '--format', '%{file}\t%{index}\n', `${family}:style=${style}`])
      const preferences = []
      for (const line of stdout.trimEnd().split('\n')) {
        const [path, index] = line.split('\t')
        if (!path) throw new Error(`No installed fallback font for ${family}`)
        preferences.push([fontDigests.get(path) ?? await hashGoalBookBuildFile(await realpath(path)), index])
      }
      fontPreferences.push([family, style, preferences])
    }
  }
  const tools = await Promise.all(['pdfinfo', 'pdftohtml'].map(async (command) => {
    const { stdout, stderr } = await execFileAsync(command, ['-v'])
    return [command, stdout + stderr]
  }))
  return hashGoalBookBuildBytes(serialize({
    code, fonts: [...fontDigests.values()].sort(), fontPreferences, tools,
    chromium: await hashGoalBookBuildFile(await realpath(chromiumExecutablePath)),
    node: process.version, platform: process.platform, arch: process.arch,
    feedbackBaseUrl: FEEDBACK_BASE_URL, printDerivativeProfile: 'bounded-atlas',
  }))
}

const publicationIndexEntry = async (
  definition: GoalBookPublicationDefinition,
  model: GoalBookModel,
  publicationDirectory: string,
): Promise<GoalBookPublicationIndex['books'][number]> => {
  const paths = goalBookPublicationPaths(definition, publicationDirectory)
  return {
    bookId: model.book.id,
    title: model.book.title,
    locale: model.book.locale,
    publicationMode: model.book.publicationMode,
    pageCount: model.pages.length,
    model: {
      url: goalBookModelUrl(definition),
      sha256: await hashGoalBookBuildFile(paths.modelPath),
      modelDigest: model.digest,
    },
    pdf: {
      url: goalBookPdfUrl(definition),
      sha256: await hashGoalBookBuildFile(paths.pdfPath),
      renderManifestUrl: goalBookRenderManifestUrl(definition),
      renderManifestSha256: await hashGoalBookBuildFile(paths.renderManifestPath),
    },
  }
}

export const buildGoalBookPublications = async (options: GoalBookPublicationsBuildOptions = {}) => {
  const outputDirectory = resolve(options.outputDirectory ?? DEFAULT_OUTPUT_DIRECTORY)
  if ([REPOSITORY_ROOT, APP_ROOT, DEFAULT_PUBLIC_ROOT, resolve('/')].includes(outputDirectory)) {
    throw new Error('Goal-book output must be a dedicated generated publication directory')
  }
  const executablePath = options.chromiumExecutablePath
    ?? process.env.GOAL_BOOK_CHROMIUM_EXECUTABLE_PATH
    ?? chromium.executablePath()
  const lockPath = join(dirname(outputDirectory), `.${basename(outputDirectory)}.build-lock`)
  await mkdir(dirname(outputDirectory), { recursive: true })
  try {
    await mkdir(lockPath)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'EEXIST') {
      throw new Error(`Another goal-book build holds ${lockPath}; do not run publication builds concurrently. If a previous build crashed, remove only this empty lock directory after confirming no build is running.`)
    }
    throw error
  }
  let stagingDirectory: string | undefined
  try {
    const environmentDigest = await renderEnvironmentDigest(executablePath)
    const previousCache = await readGoalBookBuildCache(outputDirectory)
    const nextCache: GoalBookBuildCache = { schemaVersion: 1, books: {} }
    const index: GoalBookPublicationIndex = { schemaVersion: 1, books: [] }
    stagingDirectory = await mkdtemp(join(dirname(outputDirectory), '.goal-book-build-'))
    let rendered = 0
    for (const definition of GOAL_BOOK_PUBLICATION_REGISTRY) {
      const paths = goalBookPublicationPaths(definition, stagingDirectory)
      const { model } = await loadGoalBookBuildInputs(paths.configPath)
      const modelBytes = serialize(model)
      const originalSources = await buildGoalBookOriginalSources(model)
      parseGoalBookOriginalSources(originalSources, model)
      const sourceBytes = serializeGoalBookOriginalSources(originalSources)
      if (Buffer.byteLength(sourceBytes) > MAX_GOAL_BOOK_ORIGINAL_SOURCES_BYTES) {
        throw new Error(`Original-source index exceeds its size budget: ${definition.bookId}`)
      }
      const inputDigest = hashGoalBookBuildBytes(serialize({
        environmentDigest,
        model: hashGoalBookBuildBytes(modelBytes),
        originalSources: hashGoalBookBuildBytes(sourceBytes),
      }))
      const filenames = goalBookBuildArtifactNames(definition)
      const cached = !options.force && await goalBookBuildCacheMatches(
        previousCache.books[definition.bookId], inputDigest, outputDirectory, filenames,
      )
      if (cached) {
        for (const filename of filenames) {
          await copyFile(join(outputDirectory, filename), join(stagingDirectory, filename))
        }
        console.log(`Goal book reused after input/output hash checks: ${definition.bookId}`)
      } else {
        console.log(`Building goal book: ${definition.bookId}; ${model.pages.length} goal pages`)
        await writeFile(paths.modelPath, modelBytes, 'utf8')
        await writeFile(paths.originalSourcesPath, sourceBytes, 'utf8')
        const manifest = await writeGoalBookPdf(model, paths.pdfPath, {
          feedbackBaseUrl: FEEDBACK_BASE_URL,
          publicRoot: DEFAULT_PUBLIC_ROOT,
          printDerivativeProfile: 'bounded-atlas',
          chromiumExecutablePath: executablePath,
        })
        await writeGoalBookRenderManifest(manifest, paths.renderManifestPath)
        rendered += 1
      }
      const outputs: Record<string, string> = {}
      for (const filename of filenames) outputs[filename] = await hashGoalBookBuildFile(join(stagingDirectory, filename))
      nextCache.books[definition.bookId] = { inputDigest, outputs }
      index.books.push(await publicationIndexEntry(definition, model, stagingDirectory))
    }
    const indexBytes = serialize(index)
    parseGoalBookPublicationIndex(indexBytes)
    await writeFile(join(stagingDirectory, 'index.json'), indexBytes, 'utf8')
    await writeFile(join(stagingDirectory, GOAL_BOOK_BUILD_CACHE_FILE), serialize(nextCache), 'utf8')
    for (const definition of GOAL_BOOK_PUBLICATION_REGISTRY) {
      await verifyPublishedGoalBook(goalBookPublicationPaths(definition, stagingDirectory))
      console.log(`Goal-book publication verified: ${definition.bookId}`)
    }
    // No book becomes visible until the complete registry passes the original strict gate.
    await promoteGoalBookBuildDirectory(stagingDirectory, outputDirectory, publicationFilenames())
    stagingDirectory = undefined
    console.log(`Goal-book publication ready: ${GOAL_BOOK_PUBLICATION_REGISTRY.length} books; ${rendered} rendered; ${outputDirectory}`)
    return { outputDirectory, rendered, reused: GOAL_BOOK_PUBLICATION_REGISTRY.length - rendered }
  } finally {
    if (stagingDirectory) await rm(stagingDirectory, { recursive: true, force: true })
    await rmdir(lockPath)
  }
}

const main = async () => {
  const options: GoalBookPublicationsBuildOptions = {}
  const args = process.argv.slice(2)
  for (let index = 0; index < args.length; index += 1) {
    const flag = args[index]
    if (flag === '--help' || flag === '-h') {
      console.log('Usage: tsx scripts/buildGoalBookPublications.ts [--force] [--output-dir <directory>] [--chromium-executable-path <file>]')
      return
    }
    if (flag === '--force') { options.force = true; continue }
    if (!['--output-dir', '--chromium-executable-path'].includes(flag)) throw new Error(`Unknown goal-book build argument: ${flag}`)
    const value = args[++index]
    if (!value || value.startsWith('--')) throw new Error(`Missing value for ${flag}`)
    if (flag === '--output-dir') options.outputDirectory = resolve(value)
    else options.chromiumExecutablePath = resolve(value)
  }
  await buildGoalBookPublications(options)
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  })
}
