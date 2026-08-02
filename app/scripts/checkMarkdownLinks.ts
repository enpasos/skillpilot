import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, extname, isAbsolute, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '../..')
const docsRoot = resolve(repoRoot, 'docs')
const repoAbsolutePrefixes = [
  `${repoRoot}${sep}`,
  '/home/enpasos/projects/skillpilot/',
]

// Docs are published as a MkDocs site whose root is `docs/`. A relative link
// that escapes that tree resolves on GitHub but 404s on the published site, so
// links to repository files outside `docs/` must use these prefixes instead.
const repoBlobPrefix = 'https://github.com/enpasos/skillpilot/blob/main/'
const repoTreePrefix = 'https://github.com/enpasos/skillpilot/tree/main/'

function repoUrlFor(absolutePath: string): string {
  const prefix = statSync(absolutePath).isDirectory() ? repoTreePrefix : repoBlobPrefix
  return `${prefix}${encodeURI(repoRelative(absolutePath))}`
}

function toPosixPath(path: string): string {
  return path.split(sep).join('/')
}

function repoRelative(path: string): string {
  return toPosixPath(relative(repoRoot, path))
}

function isExternalLink(target: string): boolean {
  return /^[a-z][a-z0-9+.-]*:/i.test(target)
}

function stripMarkdownLinkTarget(target: string): string {
  const trimmed = target.trim()
  if (trimmed.startsWith('<') && trimmed.endsWith('>')) {
    return trimmed.slice(1, -1)
  }
  return trimmed
}

function stripFragmentAndQuery(target: string): string {
  const withoutFragment = target.split('#')[0]
  return withoutFragment.split('?')[0]
}

function isInsideDocs(absolutePath: string): boolean {
  const relativePath = relative(docsRoot, absolutePath)
  return relativePath.length > 0 && !relativePath.startsWith('..') && !isAbsolute(relativePath)
}

function resolveTarget(linkSource: string, target: string): string | null {
  const cleaned = stripFragmentAndQuery(stripMarkdownLinkTarget(target))
  if (cleaned.length === 0) return null

  const repoUrlPrefix = [repoBlobPrefix, repoTreePrefix].find((prefix) => cleaned.startsWith(prefix))
  if (repoUrlPrefix) {
    return resolve(repoRoot, decodeURI(cleaned.slice(repoUrlPrefix.length)))
  }

  if (isExternalLink(cleaned)) return null

  if (cleaned.startsWith('/')) {
    const repoAbsolutePrefix = repoAbsolutePrefixes.find((prefix) => cleaned.startsWith(prefix))
    if (repoAbsolutePrefix) {
      return resolve(repoRoot, cleaned.slice(repoAbsolutePrefix.length))
    }
    return null
  }

  return resolve(dirname(linkSource), cleaned)
}

function discoverMarkdownFiles(args: string[]): string[] {
  const inputs = args.length > 0 ? args : ['docs']
  const files = new Set<string>()

  inputs.forEach((input) => {
    const absolute = resolve(repoRoot, input)
    if (!existsSync(absolute)) {
      throw new Error(`Markdown link check input does not exist: ${input}`)
    }

    const stats = statSync(absolute)
    if (stats.isDirectory()) {
      collectMarkdownFiles(absolute).forEach((file) => files.add(file))
      return
    }

    if (stats.isFile() && extname(absolute).toLowerCase() === '.md') {
      files.add(absolute)
      return
    }

    throw new Error(`Markdown link check input is not a Markdown file or directory: ${input}`)
  })

  return Array.from(files).sort((left, right) => repoRelative(left).localeCompare(repoRelative(right), 'en'))
}

function collectMarkdownFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const absolute = resolve(dir, entry.name)
      if (entry.isDirectory()) return collectMarkdownFiles(absolute)
      if (entry.isFile() && extname(absolute).toLowerCase() === '.md') return [absolute]
      return []
    })
}

function extractMarkdownLinkTargets(markdown: string): string[] {
  const targets: string[] = []
  const linkPattern = /!?\[[^\]]*]\(([^)\n]+)\)/g
  let match: RegExpExecArray | null
  while ((match = linkPattern.exec(markdown)) !== null) {
    targets.push(match[1])
  }
  return targets
}

const markdownFiles = discoverMarkdownFiles(process.argv.slice(2))
const failures: string[] = []

markdownFiles.forEach((file) => {
  const text = readFileSync(file, 'utf8')
  const sourceIsPublished = isInsideDocs(file)
  extractMarkdownLinkTargets(text).forEach((target) => {
    const resolved = resolveTarget(file, target)
    if (resolved === null) return
    if (!existsSync(resolved)) {
      failures.push(`${repoRelative(file)}: missing ${target}`)
      return
    }

    const cleaned = stripFragmentAndQuery(stripMarkdownLinkTarget(target))
    const escapesDocsTree = sourceIsPublished && !isExternalLink(cleaned) && !isInsideDocs(resolved)
    if (escapesDocsTree) {
      failures.push(
        `${repoRelative(file)}: ${target} leaves the docs/ tree and would 404 on the published site; ` +
          `link it as ${repoUrlFor(resolved)}`,
      )
    }
  })
})

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log(`Markdown link check passed for ${markdownFiles.length} files.`)
