import { createHash } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { lstat, mkdtemp, readFile, readdir, rename, rm } from 'node:fs/promises'
import { basename, dirname, join } from 'node:path'

export const GOAL_BOOK_BUILD_CACHE_FILE = '.build-cache.json'

export type GoalBookBuildCacheEntry = {
  inputDigest: string
  outputs: Record<string, string>
}

export type GoalBookBuildCache = {
  schemaVersion: 1
  books: Record<string, GoalBookBuildCacheEntry>
}

export const hashGoalBookBuildBytes = (bytes: string | Uint8Array): string => (
  `sha256:${createHash('sha256').update(bytes).digest('hex')}`
)

export const hashGoalBookBuildFile = async (path: string): Promise<string> => {
  if (!(await lstat(path)).isFile()) throw new Error(`Expected a regular build artifact: ${path}`)
  const hash = createHash('sha256')
  for await (const bytes of createReadStream(path)) hash.update(bytes)
  return `sha256:${hash.digest('hex')}`
}

export const readGoalBookBuildCache = async (directory: string): Promise<GoalBookBuildCache> => {
  try {
    const raw = await readFile(join(directory, GOAL_BOOK_BUILD_CACHE_FILE), 'utf8')
    if (raw.length > 100_000) throw new Error('Build cache receipt is oversized')
    const value = JSON.parse(raw)
    if (value?.schemaVersion === 1 && value.books && typeof value.books === 'object'
      && !Array.isArray(value.books)) return value as GoalBookBuildCache
  } catch {
    // A cache is never authoritative. Missing or malformed receipts require a build.
  }
  return { schemaVersion: 1, books: {} }
}

export const goalBookBuildCacheMatches = async (
  entry: GoalBookBuildCacheEntry | undefined,
  inputDigest: string,
  directory: string,
  filenames: readonly string[],
): Promise<boolean> => {
  if (entry?.inputDigest !== inputDigest || !entry.outputs || typeof entry.outputs !== 'object'
    || Object.keys(entry.outputs).length !== filenames.length) return false
  try {
    for (const name of filenames) {
      if (basename(name) !== name) throw new Error('Build artifacts must have flat filenames')
      if (entry.outputs[name] !== await hashGoalBookBuildFile(join(directory, name))) return false
    }
    return true
  } catch {
    return false
  }
}

/** Only the dedicated generated directory is exchanged, never arbitrary user files. */
export const promoteGoalBookBuildDirectory = async (
  stagingDirectory: string,
  outputDirectory: string,
  expectedFilenames: readonly string[],
): Promise<void> => {
  let hasPrevious = false
  try {
    const previous = await lstat(outputDirectory)
    if (!previous.isDirectory() || previous.isSymbolicLink()) {
      throw new Error(`Refusing to replace a non-directory publication target: ${outputDirectory}`)
    }
    const unexpected = (await readdir(outputDirectory, { withFileTypes: true }))
      .filter((entry) => !entry.isFile() || !expectedFilenames.includes(entry.name))
    if (unexpected.length) {
      throw new Error(`Refusing to replace unrelated publication files: ${unexpected.map(({ name }) => name).join(', ')}`)
    }
    hasPrevious = true
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
  }
  const backupRoot = await mkdtemp(join(dirname(outputDirectory), '.goal-book-previous-'))
  const backupPath = join(backupRoot, 'publication')
  let movedPrevious = false
  try {
    if (hasPrevious) {
      await rename(outputDirectory, backupPath)
      movedPrevious = true
    }
    try {
      await rename(stagingDirectory, outputDirectory)
    } catch (error) {
      if (movedPrevious) {
        await rename(backupPath, outputDirectory)
        movedPrevious = false
      }
      throw error
    }
  } finally {
    // On rollback failure preserve the backup for recovery rather than deleting it.
    if (!movedPrevious || await lstat(outputDirectory).then(() => true, () => false)) {
      await rm(backupRoot, { recursive: true, force: true })
    }
  }
}
