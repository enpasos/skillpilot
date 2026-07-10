import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
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
  generatedAt?: string
  rulesVersion?: string
  curricula?: CurriculumStatusEntry[]
}

type CurriculumStatusEntry = {
  subject?: string
  title?: string
  landscapeId?: string
  maturity?: string
}

type SubjectBuildSummary = {
  validationScope: string
  zipPath: string
  releaseReportPath: string
  sha256: string
  bytes: number
  packageId: string
  archiveRoot: string
  version: string
  publicationProfile: string
  targetReadinessStatus: string
  standaloneProfileReady: boolean
  files: number
  mappingStates: number
  warnings: string[]
}

type BatchPackageRecord = SubjectBuildSummary & {
  subject: string
  zipIntegrity: 'pass'
  releaseReportVerdict: 'pass'
  maxArchivePathLength: number
}

type BatchFailure = {
  subject: string
  message: string
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const appRoot = resolve(scriptDir, '..')
const repoRoot = resolve(scriptDir, '../..')

const usage = () => `Usage:
  npm run export:m5-subject-packages -- [--version 0.1.0]

Options:
  --version <version>      Package version. Default: 0.1.0.
  --output-dir <path>      Output directory inside the repository. Default: tmp/exports.
  --status <path>          Quality status JSON. Default: docs/qa-ci/status/curriculum-quality-status.json.
  --subject <name>         Optional M5+ subject filter. Can be repeated or comma-separated.
  --help                   Show this help.
`

const parseArgs = (argv: string[]): CliOptions => {
  const options: CliOptions = {
    version: '0.1.0',
    outputDir: resolve(repoRoot, 'tmp/exports'),
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
    throw new Error(`Expected string field in build summary: ${key}`)
  }
  return value
}

const numberField = (data: Record<string, JsonValue>, key: string) => {
  const value = data[key]
  if (typeof value !== 'number') {
    throw new Error(`Expected number field in build summary: ${key}`)
  }
  return value
}

const booleanField = (data: Record<string, JsonValue>, key: string) => {
  const value = data[key]
  if (typeof value !== 'boolean') {
    throw new Error(`Expected boolean field in build summary: ${key}`)
  }
  return value
}

const stringArrayField = (data: Record<string, JsonValue>, key: string) => {
  const value = data[key]
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw new Error(`Expected string array field in build summary: ${key}`)
  }
  return value as string[]
}

const parseSingleBuildSummary = (stdout: string): SubjectBuildSummary => {
  const data = jsonObject(JSON.parse(stdout) as JsonValue)
  const summary = {
    validationScope: stringField(data, 'validationScope'),
    zipPath: stringField(data, 'zipPath'),
    releaseReportPath: stringField(data, 'releaseReportPath'),
    sha256: stringField(data, 'sha256'),
    bytes: numberField(data, 'bytes'),
    packageId: stringField(data, 'packageId'),
    archiveRoot: stringField(data, 'archiveRoot'),
    version: stringField(data, 'version'),
    publicationProfile: stringField(data, 'publicationProfile'),
    targetReadinessStatus: stringField(data, 'targetReadinessStatus'),
    standaloneProfileReady: booleanField(data, 'standaloneProfileReady'),
    files: numberField(data, 'files'),
    mappingStates: numberField(data, 'mappingStates'),
    warnings: stringArrayField(data, 'warnings'),
  }
  if (
    summary.validationScope !== 'legacy-subject-export'
    || summary.targetReadinessStatus !== 'not-ready-legacy'
    || summary.standaloneProfileReady !== false
  ) {
    throw new Error('Subject builder returned an unexpected target-readiness classification.')
  }
  return summary
}

const sha256File = (absolutePath: string) => createHash('sha256')
  .update(readFileSync(absolutePath))
  .digest('hex')

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

const isM5OrBetter = (entry: CurriculumStatusEntry) =>
  entry.maturity === 'M5' || entry.maturity === 'M6' || entry.maturity === 'M7'

const selectedM5Subjects = (statusPath: string, filters: string[]) => {
  if (!existsSync(statusPath)) {
    throw new Error(`Quality status file does not exist: ${repoRelative(statusPath)}`)
  }

  const status = jsonObject(readJson(statusPath)) as CurriculumQualityStatus
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
      if (seen.has(normalizedSubject)) {
        return false
      }
      seen.add(normalizedSubject)
      return true
    })
}

const maxZipEntryPathLength = (zipPath: string) => {
  const stdout = execFileSync('zipinfo', ['-1', zipPath], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  return stdout
    .split(/\r?\n/u)
    .filter(Boolean)
    .reduce((maxLength, entryPath) => Math.max(maxLength, entryPath.length), 0)
}

const verifyReleaseReport = (releaseReportPath: string) => {
  const report = readFileSync(releaseReportPath, 'utf8')
  if (!report.includes('Legacy subject-export package passed all export-time validation checks.')) {
    throw new Error(`Release report does not contain a passing verdict: ${repoRelative(releaseReportPath)}`)
  }
}

const cleanDirectBatchArtifacts = (outputDir: string) => {
  if (!existsSync(outputDir)) {
    return
  }

  readdirSync(outputDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .filter((entry) => /^skillpilot-.+-v[^/]+\.zip$/u.test(entry.name) || /^skillpilot-.+-v[^/]+-release-report\.md$/u.test(entry.name))
    .forEach((entry) => rmSync(resolve(outputDir, entry.name)))
}

const buildSubjectPackage = (subject: string, options: CliOptions): BatchPackageRecord => {
  const stdout = execFileSync('tsx', [
    'scripts/buildSkillpilotExportPackage.ts',
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

  const summary = parseSingleBuildSummary(stdout)
  const zipPath = resolve(repoRoot, summary.zipPath)
  const releaseReportPath = resolve(repoRoot, summary.releaseReportPath)
  const recalculatedSha256 = sha256File(zipPath)
  if (recalculatedSha256 !== summary.sha256) {
    throw new Error(`ZIP checksum mismatch for ${summary.zipPath}`)
  }

  execFileSync('unzip', ['-tq', zipPath], {
    stdio: ['ignore', 'ignore', 'pipe'],
  })
  verifyReleaseReport(releaseReportPath)

  return {
    ...summary,
    subject,
    zipIntegrity: 'pass',
    releaseReportVerdict: 'pass',
    maxArchivePathLength: maxZipEntryPathLength(zipPath),
  }
}

const aggregateBuildReadiness = (packages: BatchPackageRecord[]) => {
  const singleValue = (values: string[]) => {
    const unique = [...new Set(values)]
    return packages.length > 0 && unique.length === 1 ? unique[0] : null
  }
  return {
    validationScope: singleValue(packages.map((entry) => entry.validationScope)),
    targetReadinessStatus: singleValue(packages.map((entry) => entry.targetReadinessStatus)),
    standaloneProfileReady: packages.length > 0
      && packages.every((entry) => entry.standaloneProfileReady),
  }
}

const buildMarkdownSummary = (params: {
  generatedAt: string
  version: string
  statusPath: string
  outputDir: string
  subjects: string[]
  packages: BatchPackageRecord[]
  failures: BatchFailure[]
}) => {
  const targetReadiness = aggregateBuildReadiness(params.packages)
  const rows = params.packages
    .map((entry) => `| ${entry.subject} | \`${entry.zipPath}\` | ${entry.bytes} | ${entry.files} | ${entry.mappingStates}/16 | ${entry.maxArchivePathLength} | \`${entry.sha256}\` |`)
    .join('\n')
  const failureRows = params.failures.length === 0
    ? 'No failures.'
    : params.failures.map((failure) => `- ${failure.subject}: ${failure.message}`).join('\n')

  return `# M5+ Subject Export Summary

Generated at: ${params.generatedAt}

Quality status: \`${params.statusPath}\`

Output directory: \`${params.outputDir}\`

Version: \`${params.version}\`

Subjects: ${params.subjects.length}

## Packages

| Subject | ZIP | Bytes | Files | State lanes | Max path | SHA-256 |
| --- | --- | ---: | ---: | ---: | ---: | --- |
${rows}

## Verification

- ZIP integrity: ${params.packages.length} package(s) passed \`unzip -tq\`.
- Legacy export reports: ${params.packages.length} package(s) contain a passing export-time verdict.
- SHA-256: all package checksums were recalculated after writing.
- Target readiness from builder summaries: \`${targetReadiness.targetReadinessStatus ?? 'mixed-or-unavailable'}\`; standalone profile ready: \`${String(targetReadiness.standaloneProfileReady)}\`.

## Failures

${failureRows}
`
}

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
  cleanDirectBatchArtifacts(options.outputDir)

  const packages: BatchPackageRecord[] = []
  const failures: BatchFailure[] = []
  subjects.forEach((subject) => {
    try {
      packages.push(buildSubjectPackage(subject, options))
    } catch (error) {
      failures.push({ subject, message: commandErrorMessage(error) })
    }
  })

  const generatedAt = new Date().toISOString()
  const summaryPath = resolve(options.outputDir, 'm5-subject-export-summary.json')
  const markdownSummaryPath = resolve(options.outputDir, 'm5-subject-export-summary.md')
  const warnings = packages
    .flatMap((entry) => entry.warnings.map((warning) => `${entry.subject}: ${warning}`))
  const targetReadiness = aggregateBuildReadiness(packages)
  const batchSummary = {
    generatedAt,
    validationScope: targetReadiness.validationScope,
    legacyExportGatePassed: failures.length === 0,
    targetReadinessStatus: targetReadiness.targetReadinessStatus,
    standaloneProfileReady: targetReadiness.standaloneProfileReady,
    version: options.version,
    qualityStatusPath: repoRelative(options.statusPath),
    outputDir: repoRelative(options.outputDir),
    selectedSubjects: subjects,
    packages,
    warnings,
    failures,
    summaryPath: repoRelative(summaryPath),
    markdownSummaryPath: repoRelative(markdownSummaryPath),
  }

  writeFileSync(summaryPath, stableJson(batchSummary as unknown as JsonValue))
  writeFileSync(markdownSummaryPath, buildMarkdownSummary({
    generatedAt,
    version: options.version,
    statusPath: repoRelative(options.statusPath),
    outputDir: repoRelative(options.outputDir),
    subjects,
    packages,
    failures,
  }))

  process.stdout.write(stableJson(batchSummary as unknown as JsonValue))

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
