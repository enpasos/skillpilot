import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, extname, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

interface IndexCoverageSpec {
  dir: string
  indexPath: string
  recursive?: boolean
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '../..')

const indexCoverageSpecs: IndexCoverageSpec[] = [
  {
    dir: 'docs/concept',
    indexPath: 'docs/concept/index.md',
    recursive: true,
  },
  {
    dir: 'docs/dev',
    indexPath: 'docs/dev/index.md',
  },
  {
    dir: 'docs/deploy',
    indexPath: 'docs/deploy/index.md',
  },
  {
    dir: 'docs/production-pipelines',
    indexPath: 'docs/production-pipelines/index.md',
  },
  {
    dir: 'docs/quickstart',
    indexPath: 'docs/quickstart/index.md',
  },
  {
    dir: 'docs/qa-ci',
    indexPath: 'docs/qa-ci/index.md',
  },
  {
    dir: 'docs/security',
    indexPath: 'docs/security/index.md',
  },
  {
    dir: 'docs/whitepaper',
    indexPath: 'docs/whitepaper/index.md',
  },
]

function toPosixPath(path: string): string {
  return path.split(sep).join('/')
}

function repoRelative(path: string): string {
  return toPosixPath(relative(repoRoot, path))
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

function isExternalLink(target: string): boolean {
  return /^[a-z][a-z0-9+.-]*:/i.test(target)
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

function resolveLocalMarkdownTargets(indexAbsolutePath: string): Set<string> {
  const markdown = readFileSync(indexAbsolutePath, 'utf8')
  return new Set(
    extractMarkdownLinkTargets(markdown)
      .map(stripMarkdownLinkTarget)
      .map(stripFragmentAndQuery)
      .filter((target) => target.length > 0 && !isExternalLink(target) && !target.startsWith('/'))
      .map((target) => repoRelative(resolve(dirname(indexAbsolutePath), target)))
      .filter((target) => extname(target).toLowerCase() === '.md'),
  )
}

function collectMarkdownFiles(dir: string): string[] {
  const absoluteDir = resolve(repoRoot, dir)
  return readdirSync(absoluteDir, { withFileTypes: true })
    .flatMap((entry) => {
      const absolutePath = resolve(absoluteDir, entry.name)
      const relativePath = repoRelative(absolutePath)
      if (entry.isDirectory()) return collectMarkdownFiles(relativePath)
      if (entry.isFile() && entry.name.endsWith('.md')) return [relativePath]
      return []
    })
}

function listMarkdownFilesForSpec(spec: IndexCoverageSpec): string[] {
  const absoluteDir = resolve(repoRoot, spec.dir)
  const files = spec.recursive
    ? collectMarkdownFiles(spec.dir)
    : readdirSync(absoluteDir, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
      .map((entry) => `${spec.dir}/${entry.name}`)

  return files
    .filter((path) => path !== spec.indexPath)
    .sort((left, right) => left.localeCompare(right, 'en'))
}

const failures: string[] = []

indexCoverageSpecs.forEach((spec) => {
  const indexAbsolutePath = resolve(repoRoot, spec.indexPath)
  if (!existsSync(indexAbsolutePath)) {
    failures.push(`index file does not exist: ${spec.indexPath}`)
    return
  }

  const linkedMarkdownTargets = resolveLocalMarkdownTargets(indexAbsolutePath)
  const indexedMarkdownFiles = listMarkdownFilesForSpec(spec)
  indexedMarkdownFiles.forEach((file) => {
    if (!linkedMarkdownTargets.has(file)) {
      failures.push(`${spec.indexPath}: missing link to ${file}`)
    }
  })
})

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log(`Documentation index coverage check passed for ${indexCoverageSpecs.length} indexes.`)
