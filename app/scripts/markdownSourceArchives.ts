import { createHash } from 'node:crypto'
import { lstatSync, readFileSync } from 'node:fs'
import { isAbsolute, posix, resolve } from 'node:path'

export const markdownSourceArchiveInventoryPath = 'app/scripts/config/markdown-source-archives.json'

type ArchivedMarkdownSource = { path: string; sha256: string; reason: string }

/** Raw historical source copies keep their original links and exact bytes. */
export function loadMarkdownSourceArchives(repoRoot: string): Set<string> {
  const inventory = JSON.parse(readFileSync(resolve(repoRoot, markdownSourceArchiveInventoryPath), 'utf8')) as {
    schemaVersion: number; archivedMarkdownSources: ArchivedMarkdownSource[]
  }
  if (inventory.schemaVersion !== 1 || !Array.isArray(inventory.archivedMarkdownSources)
    || inventory.archivedMarkdownSources.length === 0) {
    throw new Error('Invalid Markdown source archive inventory')
  }
  const paths = new Set<string>()
  for (const entry of inventory.archivedMarkdownSources) {
    if (typeof entry.path !== 'string' || !entry.path.startsWith('docs/qa-ci/evidence/')
      || !entry.path.endsWith('.md') || isAbsolute(entry.path) || posix.normalize(entry.path) !== entry.path
      || /[\\*?!#\[\]]/.test(entry.path) || !/^[a-f0-9]{64}$/.test(entry.sha256)
      || typeof entry.reason !== 'string' || !entry.reason.trim() || paths.has(entry.path)) {
      throw new Error(`Invalid or duplicate Markdown source archive: ${entry.path}`)
    }
    paths.add(entry.path)
    const file = resolve(repoRoot, entry.path)
    if (!lstatSync(file).isFile()) throw new Error(`Markdown source archive is not a regular file: ${entry.path}`)
    const actual = createHash('sha256').update(readFileSync(file)).digest('hex')
    if (actual !== entry.sha256) throw new Error(`Markdown source archive SHA-256 mismatch: ${entry.path}`)
  }

  // Keep the build's gitignore-style exclusion list exact, without a YAML
  // dependency or support for broad patterns/aliases in this managed block.
  const lines = readFileSync(resolve(repoRoot, 'mkdocs.yml'), 'utf8').split(/\r?\n/)
  const starts = lines.flatMap((line, index) => /^(?:exclude_docs|["']exclude_docs["']):/.test(line) ? [index] : [])
  if (starts.length !== 1 || lines[starts[0]] !== 'exclude_docs: |') {
    throw new Error('MkDocs must declare one exact exclude_docs archive block')
  }
  const start = starts[0] + 1
  let end = start
  while (end < lines.length && (lines[end].trim() === '' || /^\s/.test(lines[end]))) end++
  const actualExclusions = lines.slice(start, end).filter(line => line.trim() !== '').sort()
  const expectedExclusions = [...paths].map(path => `  /${path.slice('docs/'.length)}`).sort()
  if (JSON.stringify(actualExclusions) !== JSON.stringify(expectedExclusions)) {
    throw new Error('MkDocs exclude_docs must match the exact Markdown source archive inventory; no broader exclusions')
  }
  return new Set([...paths].map(path => resolve(repoRoot, path)))
}
