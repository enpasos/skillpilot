import { lstatSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

/** Preserve inherited read-only hardlinks and leave identical outputs untouched. */
export function writeAtomicAuthoringFile(path: string, content: string): boolean {
  const bytes = Buffer.from(content)
  const metadata = lstatSync(path, { throwIfNoEntry: false })
  if (metadata && (!metadata.isFile() || metadata.isSymbolicLink())) throw new Error(`Authoring output must be a regular file: ${path}`)
  if (metadata && readFileSync(path).equals(bytes)) return false
  const scratch = mkdtempSync(join(dirname(path), '.atomic-authoring-'))
  try {
    const temporary = join(scratch, 'output')
    writeFileSync(temporary, bytes, { flag: 'wx', mode: metadata ? metadata.mode & 0o777 : 0o644 })
    renameSync(temporary, path)
  } finally {
    rmSync(scratch, { recursive: true, force: true })
  }
  return true
}
