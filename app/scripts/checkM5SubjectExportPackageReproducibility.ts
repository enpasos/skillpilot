import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
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
  sourceDateEpoch: string
  subjects: string[]
  help: boolean
}

type BatchPackageRecord = {
  subject: string
  zipPath: string
  releaseReportPath: string
  sha256: string
  bytes: number
  packageId: string
  files: number
  mappingStates: number
  maxArchivePathLength: number
  warnings: string[]
}

type BatchFailure = {
  subject: string
  message: string
}

type BatchSummary = {
  selectedSubjects: string[]
  packages: BatchPackageRecord[]
  warnings: string[]
  failures: BatchFailure[]
}

type ComparisonRecord = {
  subject: string
  status: 'pass' | 'fail'
  firstZipPath: string | null
  secondZipPath: string | null
  firstSha256: string | null
  secondSha256: string | null
  firstBytes: number | null
  secondBytes: number | null
  details: string[]
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const appRoot = resolve(scriptDir, '..')
const repoRoot = resolve(scriptDir, '../..')

const usage = () => `Usage:
  npm run export:m5-subject-packages:check-reproducible -- [--version 0.1.0]

Options:
  --version <version>              Package version. Default: 0.1.0.
  --source-date-epoch <timestamp>  Fixed ZIP/source timestamp. Default: 1767225600.
  --output-dir <path>              Output directory inside the repository. Default: tmp/exports/reproducibility.
  --status <path>                  Quality status JSON. Default: docs/qa-ci/status/curriculum-quality-status.json.
  --subject <name>                 Optional M5+ subject filter. Can be repeated or comma-separated.
  --help                           Show this help.
`

const parseArgs = (argv: string[]): CliOptions => {
  const options: CliOptions = {
    version: '0.1.0',
    outputDir: resolve(repoRoot, 'tmp/exports/reproducibility'),
    statusPath: resolve(repoRoot, 'docs/qa-ci/status/curriculum-quality-status.json'),
    sourceDateEpoch: '1767225600',
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
    if (arg === '--source-date-epoch') {
      const value = readValue(arg)
      if (!Number.isFinite(Number(value))) {
        throw new Error(`SOURCE_DATE_EPOCH must be a Unix timestamp, got: ${value}`)
      }
      options.sourceDateEpoch = value
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

const jsonObject = (value: JsonValue): Record<string, JsonValue> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Expected JSON object')
  }
  return value
}

const stringField = (data: Record<string, JsonValue>, key: string) => {
  const value = data[key]
  if (typeof value !== 'string') {
    throw new Error(`Expected string field: ${key}`)
  }
  return value
}

const numberField = (data: Record<string, JsonValue>, key: string) => {
  const value = data[key]
  if (typeof value !== 'number') {
    throw new Error(`Expected number field: ${key}`)
  }
  return value
}

const stringArrayField = (data: Record<string, JsonValue>, key: string) => {
  const value = data[key]
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw new Error(`Expected string array field: ${key}`)
  }
  return value as string[]
}

const parsePackageRecord = (value: JsonValue): BatchPackageRecord => {
  const data = jsonObject(value)
  return {
    subject: stringField(data, 'subject'),
    zipPath: stringField(data, 'zipPath'),
    releaseReportPath: stringField(data, 'releaseReportPath'),
    sha256: stringField(data, 'sha256'),
    bytes: numberField(data, 'bytes'),
    packageId: stringField(data, 'packageId'),
    files: numberField(data, 'files'),
    mappingStates: numberField(data, 'mappingStates'),
    maxArchivePathLength: numberField(data, 'maxArchivePathLength'),
    warnings: stringArrayField(data, 'warnings'),
  }
}

const parseFailure = (value: JsonValue): BatchFailure => {
  const data = jsonObject(value)
  return {
    subject: stringField(data, 'subject'),
    message: stringField(data, 'message'),
  }
}

const parseBatchSummary = (stdout: string): BatchSummary => {
  const data = jsonObject(JSON.parse(stdout) as JsonValue)
  const selectedSubjects = stringArrayField(data, 'selectedSubjects')
  const packages = data.packages
  const failures = data.failures
  if (!Array.isArray(packages) || !Array.isArray(failures)) {
    throw new Error('Batch summary is missing packages or failures arrays.')
  }

  return {
    selectedSubjects,
    packages: packages.map(parsePackageRecord),
    warnings: stringArrayField(data, 'warnings'),
    failures: failures.map(parseFailure),
  }
}

const commandErrorMessage = (error: unknown) => {
  const base = error instanceof Error ? error.message : String(error)
  if (!error || typeof error !== 'object' || !('stderr' in error)) {
    return base
  }

  const stderr = (error as { stderr?: Buffer | string }).stderr
  if (!stderr) {
    return base
  }
  const stderrText = Buffer.isBuffer(stderr) ? stderr.toString('utf8').trim() : stderr.trim()
  return stderrText ? `${base}\n${stderrText}` : base
}

const runBatch = (runOutputDir: string, options: CliOptions) => {
  const args = [
    'scripts/buildM5SubjectExportPackages.ts',
    '--version',
    options.version,
    '--output-dir',
    repoRelative(runOutputDir),
    '--status',
    repoRelative(options.statusPath),
  ]
  options.subjects.forEach((subject) => {
    args.push('--subject', subject)
  })

  try {
    return parseBatchSummary(execFileSync('tsx', args, {
      cwd: appRoot,
      encoding: 'utf8',
      env: {
        ...process.env,
        SOURCE_DATE_EPOCH: options.sourceDateEpoch,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    }))
  } catch (error) {
    throw new Error(commandErrorMessage(error))
  }
}

const bySubject = (packages: BatchPackageRecord[]) => new Map(packages.map((entry) => [entry.subject, entry]))

const compareRuns = (first: BatchSummary, second: BatchSummary): ComparisonRecord[] => {
  const firstBySubject = bySubject(first.packages)
  const secondBySubject = bySubject(second.packages)
  const subjects = [...new Set([
    ...first.selectedSubjects,
    ...second.selectedSubjects,
    ...first.packages.map((entry) => entry.subject),
    ...second.packages.map((entry) => entry.subject),
  ])].sort((left, right) => left.localeCompare(right))

  return subjects.map((subject) => {
    const firstEntry = firstBySubject.get(subject)
    const secondEntry = secondBySubject.get(subject)
    const details: string[] = []

    if (!firstEntry) {
      details.push('missing in first run')
    }
    if (!secondEntry) {
      details.push('missing in second run')
    }
    if (firstEntry && secondEntry && firstEntry.sha256 !== secondEntry.sha256) {
      details.push('sha256 differs')
    }
    if (firstEntry && secondEntry && firstEntry.bytes !== secondEntry.bytes) {
      details.push('byte size differs')
    }
    if (firstEntry && secondEntry && firstEntry.files !== secondEntry.files) {
      details.push('file count differs')
    }

    return {
      subject,
      status: details.length === 0 ? 'pass' : 'fail',
      firstZipPath: firstEntry?.zipPath ?? null,
      secondZipPath: secondEntry?.zipPath ?? null,
      firstSha256: firstEntry?.sha256 ?? null,
      secondSha256: secondEntry?.sha256 ?? null,
      firstBytes: firstEntry?.bytes ?? null,
      secondBytes: secondEntry?.bytes ?? null,
      details,
    }
  })
}

const buildMarkdownReport = (params: {
  generatedAt: string
  version: string
  sourceDateEpoch: string
  outputDir: string
  statusPath: string
  comparisons: ComparisonRecord[]
  firstFailures: BatchFailure[]
  secondFailures: BatchFailure[]
  warnings: string[]
}) => {
  const rows = params.comparisons
    .map((entry) => `| ${entry.subject} | ${entry.status} | ${entry.firstBytes ?? ''} | ${entry.secondBytes ?? ''} | \`${entry.firstSha256 ?? ''}\` | \`${entry.secondSha256 ?? ''}\` | ${entry.details.join('; ') || 'ok'} |`)
    .join('\n')
  const failureLines = [...params.firstFailures, ...params.secondFailures]
  const failures = failureLines.length === 0
    ? 'No batch failures.'
    : failureLines.map((failure) => `- ${failure.subject}: ${failure.message}`).join('\n')
  const warnings = params.warnings.length === 0
    ? 'No warnings.'
    : params.warnings.map((warning) => `- ${warning}`).join('\n')

  return `# M5+ Export Reproducibility Report

Generated at: ${params.generatedAt}

Version: \`${params.version}\`

SOURCE_DATE_EPOCH: \`${params.sourceDateEpoch}\`

Quality status: \`${params.statusPath}\`

Output directory: \`${params.outputDir}\`

## Result

${params.comparisons.every((entry) => entry.status === 'pass') && failureLines.length === 0
  ? 'All compared ZIP artifacts are byte-reproducible across two clean batch runs.'
  : 'At least one ZIP artifact differed or a batch run failed.'}

## Comparisons

| Subject | Status | First bytes | Second bytes | First SHA-256 | Second SHA-256 | Details |
| --- | --- | ---: | ---: | --- | --- | --- |
${rows}

## Batch Failures

${failures}

## Warnings

${warnings}
`
}

const main = () => {
  const options = parseArgs(process.argv.slice(2))
  if (options.help) {
    process.stdout.write(usage())
    return
  }

  mkdirSync(options.outputDir, { recursive: true })
  const firstOutputDir = resolve(options.outputDir, 'run-a')
  const secondOutputDir = resolve(options.outputDir, 'run-b')
  mkdirSync(firstOutputDir, { recursive: true })
  mkdirSync(secondOutputDir, { recursive: true })

  const first = runBatch(firstOutputDir, options)
  const second = runBatch(secondOutputDir, options)
  const comparisons = compareRuns(first, second)
  const generatedAt = new Date().toISOString()
  const warnings = [
    ...first.warnings.map((warning) => `run-a: ${warning}`),
    ...second.warnings.map((warning) => `run-b: ${warning}`),
  ]
  const reportPath = resolve(options.outputDir, 'm5-export-reproducibility-report.json')
  const markdownReportPath = resolve(options.outputDir, 'm5-export-reproducibility-report.md')
  const report = {
    generatedAt,
    version: options.version,
    sourceDateEpoch: options.sourceDateEpoch,
    qualityStatusPath: repoRelative(options.statusPath),
    outputDir: repoRelative(options.outputDir),
    firstRunOutputDir: repoRelative(firstOutputDir),
    secondRunOutputDir: repoRelative(secondOutputDir),
    comparedSubjects: comparisons.map((entry) => entry.subject),
    comparisons,
    warnings,
    firstRunFailures: first.failures,
    secondRunFailures: second.failures,
    passed: comparisons.every((entry) => entry.status === 'pass') && first.failures.length === 0 && second.failures.length === 0,
    reportPath: repoRelative(reportPath),
    markdownReportPath: repoRelative(markdownReportPath),
  }

  writeFileSync(reportPath, stableJson(report as unknown as JsonValue))
  writeFileSync(markdownReportPath, buildMarkdownReport({
    generatedAt,
    version: options.version,
    sourceDateEpoch: options.sourceDateEpoch,
    outputDir: repoRelative(options.outputDir),
    statusPath: repoRelative(options.statusPath),
    comparisons,
    firstFailures: first.failures,
    secondFailures: second.failures,
    warnings,
  }))

  process.stdout.write(stableJson(report as unknown as JsonValue))

  if (!report.passed) {
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
