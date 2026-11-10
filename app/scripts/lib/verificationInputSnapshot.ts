import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'

export interface VerificationDirectoryEntry {
  readonly name: string
  isDirectory(): boolean
  isFile(): boolean
}
export interface VerificationInputReader {
  readText(path: string): string
  readDirectory(path: string): readonly VerificationDirectoryEntry[]
  exists(path: string): boolean
}
export const liveVerificationInputs: VerificationInputReader = Object.freeze({
  readText: (path: string) => readFileSync(path, 'utf8'),
  readDirectory: (path: string) => readdirSync(path, { withFileTypes: true }),
  exists: existsSync,
})

/** One callback owns exact input bytes and discovery membership; no persisted PASS cache. */
export async function withVerificationInputSnapshot<T>(
  work: (reader: VerificationInputReader, assertCurrent: () => void) => T | Promise<T>,
): Promise<T> {
  let active = true
  const files = new Map<string, Buffer | null>()
  const directories = new Map<string, { signature: string; entries: readonly VerificationDirectoryEntry[] }>()
  const probes = new Map<string, boolean>()
  const requireActive = () => { if (!active) throw new Error('Verification input snapshot is closed') }
  const entries = (path: string) => readdirSync(path, { withFileTypes: true })
    .map(entry => ({ name: entry.name, directory: entry.isDirectory(), file: entry.isFile(), symlink: entry.isSymbolicLink() }))
    .sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)
  const changed = (path: string): never => { throw new Error(`Verification inputs changed: ${path}`) }
  const assertCurrent = () => {
    requireActive()
    for (const [path, expected] of files) {
      if (expected === null) { if (existsSync(path)) changed(path); continue }
      try { if (!readFileSync(path).equals(expected)) changed(path) }
      catch { changed(path) }
    }
    for (const [path, expected] of directories) {
      try { if (JSON.stringify(entries(path)) !== expected.signature) changed(path) }
      catch { changed(path) }
    }
    for (const [path, expected] of probes) if (existsSync(path) !== expected) changed(path)
  }
  const reader: VerificationInputReader = Object.freeze({
    readText(path: string) {
      requireActive(); path = resolve(path)
      if (!files.has(path)) {
        try { files.set(path, readFileSync(path)) }
        catch (error) {
          if ((error as NodeJS.ErrnoException).code === 'ENOENT') files.set(path, null)
          throw error
        }
      }
      const bytes = files.get(path)
      if (bytes === null) {
        const error = new Error(`ENOENT: no such file or directory, open '${path}'`) as NodeJS.ErrnoException
        error.code = 'ENOENT'; throw error
      }
      return bytes!.toString('utf8')
    },
    readDirectory(path: string) {
      requireActive(); path = resolve(path)
      if (!directories.has(path)) {
        const listing = entries(path)
        directories.set(path, { signature: JSON.stringify(listing), entries: Object.freeze(listing.map(entry => Object.freeze({
          name: entry.name, isDirectory: () => entry.directory, isFile: () => entry.file,
        }))) })
      }
      return directories.get(path)!.entries
    },
    exists(path: string) {
      requireActive(); path = resolve(path)
      if (!probes.has(path)) probes.set(path, existsSync(path))
      return probes.get(path)!
    },
  })
  try {
    const result = await work(reader, assertCurrent)
    assertCurrent()
    return result
  } finally { active = false }
}
