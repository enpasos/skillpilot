import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [key: string]: JsonValue }

type CliOptions = {
  version: string
  outputDir: string
  statusPath: string
  subjects: string[]
  help: boolean
}

type CurriculumQualityStatus = {
  curricula?: CurriculumStatusEntry[]
}

type CurriculumStatusEntry = {
  subject?: string
  maturity?: string
}

type AuditPackageSummary = {
  packageId: string
  archiveRoot: string
  subject: string
  version: string
  zipPath: string
  releaseReportPath: string
  sha256: string
  bytes: number
  passed: boolean
  counts: {
    reviewMappingFiles: number
    sourceExtractionFiles: number
    sourceExtractions: number
    sourceDocuments: number
    sourceGoals: number
    mappingEvidence: number
    unresolvedSourceGoalRefs: number
    unresolvedCanonicalGoalRefs: number
  }
  warnings: string[]
}

type BatchFailure = {
  subject: string
  message: string
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const appRoot = resolve(scriptDir, '..')
const repoRoot = resolve(scriptDir, '../..')

const usage = () => `Usage:
  npm run export:m5-subject-provenance-audits -- [--version 0.1.0]

Options:
  --version <version>      Package version. Default: 0.1.0.
  --output-dir <path>      Output directory inside the repository. Default: tmp/exports/provenance-audits.
  --status <path>          Quality status JSON. Default: docs/qa-ci/status/curriculum-quality-status.json.
  --subject <name>         Optional M5+ subject filter. Can be repeated or comma-separated.
  --help                   Show this help.
`

const parseArgs = (argv: string[]): CliOptions => {
  const options: CliOptions = {
    version: '0.1.0',
    outputDir: resolve(repoRoot, 'tmp/exports/provenance-audits'),
    statusPath: resolve(repoRoot, 'docs/qa-ci/status/curriculum-quality-status.json'),
    subjects: [],
    help: false,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--help' || arg === '-h') {
      options.help = true
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

    if (arg === '--version') {
      options.version = readValue(arg)
      continue
    }
    if (arg === '--output-dir') {
      options.outputDir = resolveInsideRepo(readValue(arg))
      continue
    }
    if (arg === '--status') {
      options.statusPath = resolveInsideRepo(readValue(arg))
      continue
    }
    if (arg === '--subject') {
      options.subjects.push(...readValue(arg).split(',').map((subject) => subject.trim()).filter(Boolean))
      continue
    }

    throw new Error(`Unknown argument: ${arg}`)
  }

  return options
}

const resolveInsideRepo = (inputPath: string) => {
  const absolutePath = resolve(repoRoot, inputPath)
  const relativePath = relative(repoRoot, absolutePath)
  if (relativePath === '' || relativePath.startsWith('..')) {
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

const normalizeToken = (value: string) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '')

const readJson = (absolutePath: string): JsonValue => JSON.parse(readFileSync(absolutePath, 'utf8')) as JsonValue

const jsonObject = (value: JsonValue, context: string): Record<string, JsonValue> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Expected JSON object: ${context}`)
  }
  return value
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

const sha256File = (absolutePath: string) => createHash('sha256')
  .update(readFileSync(absolutePath))
  .digest('hex')

const stringField = (data: Record<string, JsonValue>, key: string) => {
  const value = data[key]
  if (typeof value !== 'string') throw new Error(`Expected string field: ${key}`)
  return value
}

const numberField = (data: Record<string, JsonValue>, key: string) => {
  const value = data[key]
  if (typeof value !== 'number') throw new Error(`Expected number field: ${key}`)
  return value
}

const booleanField = (data: Record<string, JsonValue>, key: string) => {
  const value = data[key]
  if (typeof value !== 'boolean') throw new Error(`Expected boolean field: ${key}`)
  return value
}

const stringArrayField = (data: Record<string, JsonValue>, key: string) => {
  const value = data[key]
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw new Error(`Expected string array field: ${key}`)
  }
  return value as string[]
}

const parseSummary = (stdout: string): AuditPackageSummary => {
  const data = jsonObject(JSON.parse(stdout) as JsonValue, 'provenance audit summary')
  const counts = jsonObject(data.counts ?? null, 'provenance audit counts')
  return {
    packageId: stringField(data, 'packageId'),
    archiveRoot: stringField(data, 'archiveRoot'),
    subject: stringField(data, 'subject'),
    version: stringField(data, 'version'),
    zipPath: stringField(data, 'zipPath'),
    releaseReportPath: stringField(data, 'releaseReportPath'),
    sha256: stringField(data, 'sha256'),
    bytes: numberField(data, 'bytes'),
    passed: booleanField(data, 'passed'),
    counts: {
      reviewMappingFiles: numberField(counts, 'reviewMappingFiles'),
      sourceExtractionFiles: numberField(counts, 'sourceExtractionFiles'),
      sourceExtractions: numberField(counts, 'sourceExtractions'),
      sourceDocuments: numberField(counts, 'sourceDocuments'),
      sourceGoals: numberField(counts, 'sourceGoals'),
      mappingEvidence: numberField(counts, 'mappingEvidence'),
      unresolvedSourceGoalRefs: numberField(counts, 'unresolvedSourceGoalRefs'),
      unresolvedCanonicalGoalRefs: numberField(counts, 'unresolvedCanonicalGoalRefs'),
    },
    warnings: stringArrayField(data, 'warnings'),
  }
}

const isM5OrBetter = (entry: CurriculumStatusEntry) =>
  entry.maturity === 'M5' || entry.maturity === 'M6' || entry.maturity === 'M7'

const selectedM5Subjects = (statusPath: string, filters: string[]) => {
  if (!existsSync(statusPath)) {
    throw new Error(`Quality status file does not exist: ${repoRelative(statusPath)}`)
  }

  const status = jsonObject(readJson(statusPath), repoRelative(statusPath)) as CurriculumQualityStatus
  const curricula = Array.isArray(status.curricula) ? status.curricula : []
  const normalizedFilters = filters.map(normalizeToken)
  const seen = new Set<string>()
  return curricula
    .filter(isM5OrBetter)
    .filter((entry) => typeof entry.subject === 'string')
    .filter((entry) => normalizedFilters.length === 0 || normalizedFilters.includes(normalizeToken(entry.subject ?? '')))
    .map((entry) => entry.subject as string)
    .filter((subject) => {
      const normalizedSubject = normalizeToken(subject)
      if (seen.has(normalizedSubject)) return false
      seen.add(normalizedSubject)
      return true
    })
}

const commandErrorMessage = (error: unknown) => {
  const base = error instanceof Error ? error.message : String(error)
  if (!error || typeof error !== 'object' || !('stderr' in error)) return base
  const stderr = (error as { stderr?: Buffer | string }).stderr
  if (!stderr) return base
  const stderrText = Buffer.isBuffer(stderr) ? stderr.toString('utf8').trim() : stderr.trim()
  return stderrText ? `${base}\n${stderrText}` : base
}

const buildSubjectAuditPackage = (subject: string, options: CliOptions): AuditPackageSummary => {
  const stdout = execFileSync('tsx', [
    'scripts/buildSubjectProvenanceAuditPackage.ts',
    '--subject',
    subject,
    '--version',
    options.version,
    '--output-dir',
    repoRelative(options.outputDir),
  ], {
    cwd: appRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  const summary = parseSummary(stdout)
  const zipPath = resolve(repoRoot, summary.zipPath)
  const recalculatedSha256 = sha256File(zipPath)
  if (recalculatedSha256 !== summary.sha256) {
    throw new Error(`ZIP checksum mismatch for ${summary.zipPath}`)
  }
  execFileSync('unzip', ['-tq', zipPath], { stdio: ['ignore', 'ignore', 'pipe'] })
  if (!summary.passed) {
    throw new Error(`Provenance audit validation failed for ${subject}: ${summary.releaseReportPath}`)
  }
  return summary
}

const buildMarkdownSummary = (params: {
  generatedAt: string
  version: string
  outputDir: string
  statusPath: string
  packages: AuditPackageSummary[]
  failures: BatchFailure[]
}) => `# M5+ Subject Provenance Audit Summary

Generated at: ${params.generatedAt}

Version: \`${params.version}\`

Quality status: \`${params.statusPath}\`

Output directory: \`${params.outputDir}\`

## Packages

| Subject | ZIP | Bytes | Source extractions | Source goals | Mapping evidence | SHA-256 |
| --- | --- | ---: | ---: | ---: | ---: | --- |
${params.packages.map((entry) => `| ${entry.subject} | \`${entry.zipPath}\` | ${entry.bytes} | ${entry.counts.sourceExtractionFiles} | ${entry.counts.sourceGoals} | ${entry.counts.mappingEvidence} | \`${entry.sha256}\` |`).join('\n')}

## Totals

| Count | Value |
| --- | ---: |
| Packages | ${params.packages.length} |
| Source extraction files | ${params.packages.reduce((sum, entry) => sum + entry.counts.sourceExtractionFiles, 0)} |
| Source documents | ${params.packages.reduce((sum, entry) => sum + entry.counts.sourceDocuments, 0)} |
| Source goals | ${params.packages.reduce((sum, entry) => sum + entry.counts.sourceGoals, 0)} |
| Mapping evidence records | ${params.packages.reduce((sum, entry) => sum + entry.counts.mappingEvidence, 0)} |

## Failures

${params.failures.length === 0 ? 'No failures.' : params.failures.map((failure) => `- ${failure.subject}: ${failure.message}`).join('\n')}

## Publication Note

These ZIPs contain exact extracted official-source text snippets. They are provenance/audit companion artifacts, not the default public runtime packages.
`

const main = () => {
  const options = parseArgs(process.argv.slice(2))
  if (options.help) {
    process.stdout.write(usage())
    return
  }

  const subjects = selectedM5Subjects(options.statusPath, options.subjects)
  if (subjects.length === 0) {
    throw new Error(options.subjects.length === 0
      ? 'No M5+ subjects found in the quality status file.'
      : `No requested subject is currently M5 or better: ${options.subjects.join(', ')}`)
  }

  mkdirSync(options.outputDir, { recursive: true })
  const packages: AuditPackageSummary[] = []
  const failures: BatchFailure[] = []
  subjects.forEach((subject) => {
    try {
      packages.push(buildSubjectAuditPackage(subject, options))
    } catch (error) {
      failures.push({ subject, message: commandErrorMessage(error) })
    }
  })

  const generatedAt = new Date().toISOString()
  const summaryPath = resolve(options.outputDir, 'm5-subject-provenance-audit-summary.json')
  const markdownSummaryPath = resolve(options.outputDir, 'm5-subject-provenance-audit-summary.md')
  const summary = {
    generatedAt,
    version: options.version,
    statusPath: repoRelative(options.statusPath),
    outputDir: repoRelative(options.outputDir),
    selectedSubjects: subjects,
    packages,
    totals: {
      packages: packages.length,
      sourceExtractionFiles: packages.reduce((sum, entry) => sum + entry.counts.sourceExtractionFiles, 0),
      sourceDocuments: packages.reduce((sum, entry) => sum + entry.counts.sourceDocuments, 0),
      sourceGoals: packages.reduce((sum, entry) => sum + entry.counts.sourceGoals, 0),
      mappingEvidence: packages.reduce((sum, entry) => sum + entry.counts.mappingEvidence, 0),
    },
    failures,
    warnings: [
      'Provenance audit packages contain exact extracted official-source text snippets.',
      'Use as reviewer-facing audit companions, not as default public runtime artifacts.',
    ],
    summaryPath: repoRelative(summaryPath),
    markdownSummaryPath: repoRelative(markdownSummaryPath),
  }
  writeFileSync(summaryPath, stableJson(summary as unknown as JsonValue))
  writeFileSync(markdownSummaryPath, buildMarkdownSummary({
    generatedAt,
    version: options.version,
    outputDir: repoRelative(options.outputDir),
    statusPath: repoRelative(options.statusPath),
    packages,
    failures,
  }))
  process.stdout.write(stableJson(summary as unknown as JsonValue))
  if (failures.length > 0) {
    process.exitCode = 1
  }
}

try {
  main()
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  process.stderr.write(`${message}\n`)
  process.exitCode = 1
}
