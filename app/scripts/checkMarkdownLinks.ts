import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, extname, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '../..')
const repoAbsolutePrefixes = [
  `${repoRoot}${sep}`,
  '/home/enpasos/projects/skillpilot/',
]

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

function resolveTarget(linkSource: string, target: string): string | null {
  const cleaned = stripFragmentAndQuery(stripMarkdownLinkTarget(target))
  if (cleaned.length === 0) return null
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
  extractMarkdownLinkTargets(text).forEach((target) => {
    const resolved = resolveTarget(file, target)
    if (resolved === null) return
    if (!existsSync(resolved)) {
      failures.push(`${repoRelative(file)}: missing ${target}`)
    }
  })
})

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log(`Markdown link check passed for ${markdownFiles.length} files.`)
