import { execFileSync } from 'node:child_process'
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import { basename, dirname, isAbsolute, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [key: string]: JsonValue }

type CliOptions = {
  zipPaths: string[]
  directory: string
  reportDir: string
  concurrency: number
  timeoutMs: number
  failOnBroken: boolean
  help: boolean
}

type UrlOccurrence = {
  url: string
  zipPath: string
  extractionId: string | null
  title: string | null
}

type UrlAuditResult = {
  url: string
  status: 'pass' | 'warn' | 'fail'
  httpStatus: number | null
  method: string | null
  finalUrl: string | null
  elapsedMs: number
  error: string | null
  occurrences: number
  packages: string[]
  titles: string[]
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '../..')
const ZIP_COMMAND_MAX_BUFFER_BYTES = 256 * 1024 * 1024

const usage = () => `Usage:
  npm run export:subject-packages:audit-links -- [--dir tmp/exports]
  npm run export:subject-packages:audit-links -- --zip tmp/exports/skillpilot-de-gymnasium-mathematik-v0.1.0.zip

Options:
  --zip <path>          ZIP path. Can be repeated or comma-separated.
  --dir <path>          Directory to scan for direct skillpilot-*.zip files. Default: tmp/exports.
  --report-dir <path>   Directory for audit reports. Default: tmp/exports/link-audit.
  --concurrency <n>     Concurrent URL checks. Default: 6.
  --timeout-ms <n>      Per-request timeout. Default: 10000.
  --fail-on-broken      Exit non-zero if any URL cannot be reached.
  --help                Show this help.
`

const parseArgs = (argv: string[]): CliOptions => {
  const options: CliOptions = {
    zipPaths: [],
    directory: resolve(repoRoot, 'tmp/exports'),
    reportDir: resolve(repoRoot, 'tmp/exports/link-audit'),
    concurrency: 6,
    timeoutMs: 10000,
    failOnBroken: false,
    help: false,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--help' || arg === '-h') {
      options.help = true
      continue
    }
    if (arg === '--fail-on-broken') {
      options.failOnBroken = true
      continue
    }

    const nextValue = argv[index + 1]
    const readValue = (name: string) => {
      if (!nextValue || nextValue.startsWith('--')) {
        throw new Error(`Missing value for ${name}`)
      }
      index += 1
      return nextValue
    }

    if (arg === '--zip') {
      options.zipPaths.push(...readValue(arg).split(',').map((path) => path.trim()).filter(Boolean).map(resolveInsideRepo))
      continue
    }
    if (arg === '--dir') {
      options.directory = resolveInsideRepo(readValue(arg))
      continue
    }
    if (arg === '--report-dir') {
      options.reportDir = resolveInsideRepo(readValue(arg))
      continue
    }
    if (arg === '--concurrency') {
      options.concurrency = positiveInteger(readValue(arg), arg)
      continue
    }
    if (arg === '--timeout-ms') {
      options.timeoutMs = positiveInteger(readValue(arg), arg)
      continue
    }

    throw new Error(`Unknown argument: ${arg}`)
  }

  return options
}

const positiveInteger = (value: string, name: string) => {
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${name} must be a positive integer, got: ${value}`)
  }
  return parsed
}

const isInsideRepo = (absolutePath: string) => {
  const relativePath = relative(repoRoot, absolutePath)
  return relativePath === '' || (!relativePath.startsWith('..') && !isAbsolute(relativePath))
}

const resolveInsideRepo = (inputPath: string) => {
  const candidates = [resolve(repoRoot, inputPath), resolve(process.cwd(), inputPath)]
  const absolutePath = candidates.find(isInsideRepo)
  if (!absolutePath) {
    throw new Error(`Path must be inside the repository: ${inputPath}`)
  }
  return absolutePath
}

const toPosixPath = (path: string) => path.split(sep).join('/')

const repoRelative = (absolutePath: string) => {
  const relativePath = toPosixPath(relative(repoRoot, absolutePath))
  if (relativePath === '' || relativePath.startsWith('..')) {
    throw new Error(`Path is outside the repository: ${absolutePath}`)
  }
  return relativePath
}

const stableSortJson = (value: JsonValue): JsonValue => {
  if (Array.isArray(value)) {
    return value.map(stableSortJson)
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, stableSortJson(child)]),
    )
  }
  return value
}

const stableJson = (value: JsonValue) => `${JSON.stringify(stableSortJson(value), null, 2)}\n`

const isJsonObject = (value: JsonValue): value is Record<string, JsonValue> => (
  value !== null && typeof value === 'object' && !Array.isArray(value)
)

const directExportZips = (directory: string) => readdirSync(directory, { withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) => resolve(directory, entry.name))
  .filter((path) => /^skillpilot-.+\.zip$/u.test(basename(path)))
  .sort((left, right) => repoRelative(left).localeCompare(repoRelative(right)))

const listZipEntries = (zipPath: string) => execFileSync('zipinfo', ['-1', zipPath], {
  encoding: 'utf8',
  maxBuffer: ZIP_COMMAND_MAX_BUFFER_BYTES,
  stdio: ['ignore', 'pipe', 'pipe'],
})
  .split(/\r?\n/u)
  .filter(Boolean)

const readZipEntryJson = (zipPath: string, entryPath: string) => JSON.parse(execFileSync('unzip', ['-p', zipPath, entryPath], {
  encoding: 'utf8',
  maxBuffer: ZIP_COMMAND_MAX_BUFFER_BYTES,
  stdio: ['ignore', 'pipe', 'pipe'],
})) as JsonValue

const sourceDocumentsFromRecord = (record: Record<string, JsonValue>) => {
  const documents: JsonValue[] = []
  if (isJsonObject(record.sourceDocument)) {
    documents.push(record.sourceDocument)
  }
  if (Array.isArray(record.sourceDocuments)) {
    documents.push(...record.sourceDocuments.filter(isJsonObject))
  }
  return documents
}

const sourceUrlOccurrencesFromZip = (zipPath: string): UrlOccurrence[] => {
  const entries = listZipEntries(zipPath)
  const sourceIndexPath = entries.find((entry) => entry.endsWith('/data/sources/source-index.json'))
  const sourceGoalReferencesPath = entries.find((entry) => entry.endsWith('/data/sources/source-goal-references.json'))
  if (!sourceIndexPath) {
    throw new Error(`Missing data/sources/source-index.json in ${repoRelative(zipPath)}`)
  }
  if (!sourceGoalReferencesPath) {
    throw new Error(`Missing data/sources/source-goal-references.json in ${repoRelative(zipPath)}`)
  }

  const sourceIndex = readZipEntryJson(zipPath, sourceIndexPath)
  if (!isJsonObject(sourceIndex) || !Array.isArray(sourceIndex.sources)) {
    throw new Error(`Invalid source-index.json in ${repoRelative(zipPath)}`)
  }

  const sourceIndexOccurrences = sourceIndex.sources.flatMap((source) => {
    if (!isJsonObject(source)) {
      return []
    }
    const extractionId = typeof source.extractionId === 'string' ? source.extractionId : null
    return sourceDocumentsFromRecord(source).flatMap((document) => {
      if (!isJsonObject(document) || typeof document.url !== 'string') {
        return []
      }
      return [{
        url: document.url,
        zipPath: repoRelative(zipPath),
        extractionId,
        title: typeof document.title === 'string' ? document.title : null,
      }]
    })
  })
  const sourceGoalReferences = readZipEntryJson(zipPath, sourceGoalReferencesPath)
  if (!isJsonObject(sourceGoalReferences) || !Array.isArray(sourceGoalReferences.sources)) {
    throw new Error(`Invalid source-goal-references.json in ${repoRelative(zipPath)}`)
  }
  const sourceGoalOccurrences = sourceGoalReferences.sources.flatMap((source) => {
    if (!isJsonObject(source)) return []
    const extractionId = typeof source.extractionId === 'string' ? source.extractionId : null
    const sourceGoals = Array.isArray(source.sourceGoals) ? source.sourceGoals : []
    return sourceGoals.flatMap((goal) => {
      if (!isJsonObject(goal) || typeof goal.sourceDocumentUrl !== 'string') {
        return []
      }
      return [{
        url: goal.sourceDocumentUrl,
        zipPath: repoRelative(zipPath),
        extractionId,
        title: typeof goal.sourceDocumentTitle === 'string' ? goal.sourceDocumentTitle : null,
      }]
    })
  })
  return [...sourceIndexOccurrences, ...sourceGoalOccurrences]
}

const uniqueOccurrencesByUrl = (occurrences: UrlOccurrence[]) => {
  const grouped = new Map<string, UrlOccurrence[]>()
  occurrences.forEach((occurrence) => {
    grouped.set(occurrence.url, [...(grouped.get(occurrence.url) ?? []), occurrence])
  })
  return [...grouped.entries()].sort(([left], [right]) => left.localeCompare(right))
}

const fetchWithTimeout = async (url: string, method: 'HEAD' | 'GET', timeoutMs: number) => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  const headers: Record<string, string> = {
    accept: method === 'HEAD' ? '*/*' : 'text/html,application/pdf,*/*',
    'accept-language': 'de-DE,de;q=0.9,en;q=0.8',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36',
  }
  if (method === 'GET') {
    headers.range = 'bytes=0-0'
  }
  try {
    return await fetch(url, {
      method,
      redirect: 'follow',
      signal: controller.signal,
      headers,
    })
  } finally {
    clearTimeout(timeout)
  }
}

const auditUrl = async (url: string, occurrences: UrlOccurrence[], timeoutMs: number): Promise<UrlAuditResult> => {
  const startedAt = Date.now()
  let method: 'HEAD' | 'GET' = 'HEAD'

  try {
    let response: Response
    try {
      response = await fetchWithTimeout(url, method, timeoutMs)
    } catch {
      method = 'GET'
      response = await fetchWithTimeout(url, method, timeoutMs)
    }
    if (response.status < 200 || response.status >= 400) {
      method = 'GET'
      response = await fetchWithTimeout(url, method, timeoutMs)
    }

    const elapsedMs = Date.now() - startedAt
    const status = response.status >= 200 && response.status < 400
      ? 'pass'
      : response.status >= 400 && response.status < 500
        ? 'warn'
        : 'fail'

    return {
      url,
      status,
      httpStatus: response.status,
      method,
      finalUrl: response.url,
      elapsedMs,
      error: null,
      occurrences: occurrences.length,
      packages: [...new Set(occurrences.map((occurrence) => occurrence.zipPath))].sort(),
      titles: [...new Set(occurrences.flatMap((occurrence) => occurrence.title ? [occurrence.title] : []))].sort(),
    }
  } catch (error) {
    return {
      url,
      status: 'fail',
      httpStatus: null,
      method,
      finalUrl: null,
      elapsedMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : String(error),
      occurrences: occurrences.length,
      packages: [...new Set(occurrences.map((occurrence) => occurrence.zipPath))].sort(),
      titles: [...new Set(occurrences.flatMap((occurrence) => occurrence.title ? [occurrence.title] : []))].sort(),
    }
  }
}

const runWithConcurrency = async <T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<R>,
) => {
  const results: R[] = []
  let nextIndex = 0
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (nextIndex < items.length) {
      const index = nextIndex
      nextIndex += 1
      results[index] = await worker(items[index] as T, index)
    }
  }))
  return results
}

const markdownCell = (value: string | number | null | undefined) => String(value ?? '')
  .replace(/\|/gu, '\\|')
  .replace(/\r?\n/gu, ' ')

const buildMarkdownReport = (params: {
  generatedAt: string
  packageCount: number
  sourceUrlOccurrences: number
  uniqueUrls: number
  timeoutMs: number
  concurrency: number
  results: UrlAuditResult[]
}) => {
  const failingRows = params.results
    .filter((result) => result.status !== 'pass')
    .map((result) => `| ${markdownCell(result.status)} | ${markdownCell(result.httpStatus)} | ${markdownCell(result.method)} | <${result.url}> | ${markdownCell(result.error)} | ${result.packages.length} |`)
    .join('\n')

  return `# Subject Export Source Link Audit

Generated at: ${params.generatedAt}

Packages: ${params.packageCount}

Source URL occurrences: ${params.sourceUrlOccurrences}

Unique URLs: ${params.uniqueUrls}

Timeout: ${params.timeoutMs} ms

Concurrency: ${params.concurrency}

## Result

${params.results.every((result) => result.status === 'pass')
  ? 'All unique source URLs were reachable.'
  : 'At least one source URL returned a warning or failed the live reachability check.'}

## Summary

| Status | Count |
| --- | ---: |
| pass | ${params.results.filter((result) => result.status === 'pass').length} |
| warn | ${params.results.filter((result) => result.status === 'warn').length} |
| fail | ${params.results.filter((result) => result.status === 'fail').length} |

## Non-Passing URLs

${failingRows
    ? `| Status | HTTP | Method | URL | Error | Packages |\n| --- | ---: | --- | --- | --- | ---: |\n${failingRows}`
    : 'No non-passing URLs.'}
`
}

const main = async () => {
  const options = parseArgs(process.argv.slice(2))
  if (options.help) {
    process.stdout.write(usage())
    return
  }

  const zipPaths = options.zipPaths.length > 0 ? options.zipPaths : directExportZips(options.directory)
  if (zipPaths.length === 0) {
    throw new Error(`No export ZIP files found in ${repoRelative(options.directory)}`)
  }

  const occurrences = zipPaths.flatMap(sourceUrlOccurrencesFromZip)
  const groupedUrls = uniqueOccurrencesByUrl(occurrences)
  const generatedAt = new Date().toISOString()
  const results = await runWithConcurrency(groupedUrls, options.concurrency, async ([url, urlOccurrences]) => (
    auditUrl(url, urlOccurrences, options.timeoutMs)
  ))
  const passed = results.every((result) => result.status === 'pass')
  const report = {
    generatedAt,
    packageCount: zipPaths.length,
    sourceUrlOccurrences: occurrences.length,
    uniqueUrls: groupedUrls.length,
    timeoutMs: options.timeoutMs,
    concurrency: options.concurrency,
    passed,
    failOnBroken: options.failOnBroken,
    results,
    summary: {
      pass: results.filter((result) => result.status === 'pass').length,
      warn: results.filter((result) => result.status === 'warn').length,
      fail: results.filter((result) => result.status === 'fail').length,
    },
  }

  mkdirSync(options.reportDir, { recursive: true })
  const reportPath = resolve(options.reportDir, 'subject-export-source-link-audit.json')
  const markdownReportPath = resolve(options.reportDir, 'subject-export-source-link-audit.md')
  writeFileSync(reportPath, stableJson({
    ...report,
    reportPath: repoRelative(reportPath),
    markdownReportPath: repoRelative(markdownReportPath),
  } as unknown as JsonValue))
  writeFileSync(markdownReportPath, buildMarkdownReport({
    generatedAt,
    packageCount: zipPaths.length,
    sourceUrlOccurrences: occurrences.length,
    uniqueUrls: groupedUrls.length,
    timeoutMs: options.timeoutMs,
    concurrency: options.concurrency,
    results,
  }))

  process.stdout.write(stableJson({
    ...report,
    reportPath: repoRelative(reportPath),
    markdownReportPath: repoRelative(markdownReportPath),
  } as unknown as JsonValue))

  if (!passed && options.failOnBroken) {
    process.exitCode = 1
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  process.stderr.write(`${message}\n`)
  process.exitCode = 1
})
