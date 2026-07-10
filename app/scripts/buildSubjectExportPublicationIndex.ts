import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
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
  dir: string
  version: string
  includeLinkAudit: boolean
  requireLinkAudit: boolean
  help: boolean
}

type CheckResult = {
  id: string
  passed: boolean
  details: string
}

type FileArtifact = {
  kind: string
  path: string
  bytes: number
  sha256: string
}

type PackageTargetReadiness = {
  reportPath: string
  reportSha256: string
  inputZipSha256: string
  manifestDialect: string
  status: string
  standaloneProfileReady: boolean
  primaryReasonCode: string
  inputIntegrity: string
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '../..')

const usage = () => `Usage:
  npm run export:subject-publication-index -- [--dir tmp/exports] [--version 0.1.0]

Options:
  --dir <path>              Export directory inside the repository. Default: tmp/exports.
  --version <version>       Package version. Default: 0.1.0.
  --include-link-audit      Include an existing live source-link audit report.
  --require-link-audit      Require and include a passing live source-link audit report.
  --help                    Show this help.
`

const parseArgs = (argv: string[]): CliOptions => {
  const options: CliOptions = {
    dir: resolve(repoRoot, 'tmp/exports'),
    version: '0.1.0',
    includeLinkAudit: false,
    requireLinkAudit: false,
    help: false,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--help' || arg === '-h') {
      options.help = true
      continue
    }
    if (arg === '--include-link-audit') {
      options.includeLinkAudit = true
      continue
    }
    if (arg === '--require-link-audit') {
      options.includeLinkAudit = true
      options.requireLinkAudit = true
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

    if (arg === '--dir') {
      options.dir = resolveInsideRepo(readValue(arg))
      continue
    }
    if (arg === '--version') {
      options.version = readValue(arg)
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

const readJson = (absolutePath: string): JsonValue => JSON.parse(readFileSync(absolutePath, 'utf8')) as JsonValue

const jsonObject = (value: JsonValue, context: string): Record<string, JsonValue> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Expected JSON object: ${context}`)
  }
  return value
}

const objectArrayField = (data: Record<string, JsonValue>, key: string) => {
  const value = data[key]
  if (!Array.isArray(value) || value.some((item) => !item || typeof item !== 'object' || Array.isArray(item))) {
    throw new Error(`Expected object array field: ${key}`)
  }
  return value as Record<string, JsonValue>[]
}

const stringField = (data: Record<string, JsonValue>, key: string) => {
  const value = data[key]
  if (typeof value !== 'string') {
    throw new Error(`Expected string field: ${key}`)
  }
  return value
}

const optionalStringField = (data: Record<string, JsonValue>, key: string) => {
  const value = data[key]
  if (value === undefined) {
    return undefined
  }
  if (typeof value !== 'string') {
    throw new Error(`Expected optional string field: ${key}`)
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

const booleanField = (data: Record<string, JsonValue>, key: string) => {
  const value = data[key]
  if (typeof value !== 'boolean') {
    throw new Error(`Expected boolean field: ${key}`)
  }
  return value
}

const objectField = (data: Record<string, JsonValue>, key: string) => jsonObject(data[key] ?? null, key)

const maybeObjectField = (data: Record<string, JsonValue>, key: string) => {
  const value = data[key]
  if (value === undefined) {
    return undefined
  }
  return jsonObject(value, key)
}

const parsePackageTargetReadiness = (value: JsonValue, context: string): PackageTargetReadiness => {
  const data = jsonObject(value, context)
  return {
    reportPath: stringField(data, 'reportPath'),
    reportSha256: stringField(data, 'reportSha256'),
    inputZipSha256: stringField(data, 'inputZipSha256'),
    manifestDialect: stringField(data, 'manifestDialect'),
    status: stringField(data, 'status'),
    standaloneProfileReady: booleanField(data, 'standaloneProfileReady'),
    primaryReasonCode: stringField(data, 'primaryReasonCode'),
    inputIntegrity: stringField(data, 'inputIntegrity'),
  }
}

const readCanonicalTargetReadiness = (
  reportArtifact: FileArtifact,
): PackageTargetReadiness => {
  const report = jsonObject(readJson(resolveReportPath(reportArtifact.path)), 'canonical target-readiness report')
  const input = objectField(report, 'input')
  const classification = objectField(report, 'classification')
  const decision = objectField(report, 'decision')
  const dimensions = objectField(report, 'dimensions')
  return {
    reportPath: reportArtifact.path,
    reportSha256: reportArtifact.sha256,
    inputZipSha256: stringField(input, 'sha256'),
    manifestDialect: stringField(classification, 'manifestDialect'),
    status: stringField(decision, 'status'),
    standaloneProfileReady: booleanField(decision, 'standaloneProfileReady'),
    primaryReasonCode: stringField(decision, 'primaryReasonCode'),
    inputIntegrity: stringField(dimensions, 'inputIntegrity'),
  }
}

const aggregateTargetReadiness = (records: PackageTargetReadiness[]) => {
  const singleValue = (values: string[]) => {
    const unique = [...new Set(values)]
    return records.length > 0 && unique.length === 1 ? unique[0] : null
  }
  return {
    status: singleValue(records.map((record) => record.status)),
    manifestDialect: singleValue(records.map((record) => record.manifestDialect)),
    standaloneProfileReady: records.length > 0
      && records.every((record) => record.standaloneProfileReady),
    inputIntegrity: records.length > 0
      && records.every((record) => record.inputIntegrity === 'pass')
      ? 'pass'
      : 'fail',
    reportCount: records.length,
  }
}

const stringArrayField = (data: Record<string, JsonValue>, key: string) => {
  const value = data[key]
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw new Error(`Expected string array field: ${key}`)
  }
  return value as string[]
}

const resolveReportPath = (inputPath: string) => resolveInsideRepo(inputPath)

const sha256File = (absolutePath: string) => createHash('sha256')
  .update(readFileSync(absolutePath))
  .digest('hex')

const fileArtifact = (kind: string, inputPath: string): FileArtifact => {
  const absolutePath = resolveReportPath(inputPath)
  if (!existsSync(absolutePath)) {
    throw new Error(`Missing artifact file: ${repoRelative(absolutePath)}`)
  }

  return {
    kind,
    path: repoRelative(absolutePath),
    bytes: statSync(absolutePath).size,
    sha256: sha256File(absolutePath),
  }
}

const addCheck = (checks: CheckResult[], id: string, passed: boolean, details: string) => {
  checks.push({ id, passed, details })
}

const byStringKey = (records: Record<string, JsonValue>[], key: string) => new Map(
  records.map((record) => [stringField(record, key), record]),
)

const compareStringSets = (left: string[], right: string[]) => {
  const leftSet = new Set(left)
  const rightSet = new Set(right)
  const missing = [...leftSet].filter((item) => !rightSet.has(item)).sort()
  const unexpected = [...rightSet].filter((item) => !leftSet.has(item)).sort()
  return { missing, unexpected }
}

const packageTableRow = (pkg: Record<string, JsonValue>) => {
  const zip = objectField(pkg, 'zip') as unknown as FileArtifact
  const validation = objectField(pkg, 'validation')
  const reproducibility = objectField(pkg, 'reproducibility')
  const targetReadiness = objectField(pkg, 'targetReadiness')
  return [
    stringField(pkg, 'subject'),
    `\`${zip.path}\``,
    `\`${zip.sha256}\``,
    String(numberField(pkg, 'bytes')),
    String(numberField(pkg, 'maxArchivePathLength')),
    booleanField(validation, 'passed') ? 'pass' : 'fail',
    stringField(reproducibility, 'status'),
    stringField(targetReadiness, 'status'),
    booleanField(targetReadiness, 'standaloneProfileReady') ? 'yes' : 'no',
  ]
}

const buildMarkdown = (params: {
  generatedAt: string
  releaseCandidateId: string
  version: string
  passed: boolean
  targetReadinessStatus: string | null
  standaloneProfileReady: boolean
  readinessInputIntegrity: string
  checks: CheckResult[]
  packages: Record<string, JsonValue>[]
  reports: FileArtifact[]
  linkAudit: Record<string, JsonValue> | null
}) => {
  const packageRows = params.packages
    .map(packageTableRow)
    .map((row) => `| ${row.join(' | ')} |`)
    .join('\n')

  const reportRows = params.reports
    .map((artifact) => `| ${artifact.kind} | \`${artifact.path}\` | ${artifact.bytes} | \`${artifact.sha256}\` |`)
    .join('\n')

  const linkAuditSection = params.linkAudit
    ? `\n## Source Link Audit\n\nUnique URLs: ${numberField(params.linkAudit, 'uniqueUrls')}\n\nSource URL occurrences: ${numberField(params.linkAudit, 'sourceUrlOccurrences')}\n\nPass: ${numberField(objectField(params.linkAudit, 'summary'), 'pass')}, Warn: ${numberField(objectField(params.linkAudit, 'summary'), 'warn')}, Fail: ${numberField(objectField(params.linkAudit, 'summary'), 'fail')}\n`
    : '\n## Source Link Audit\n\nNot included in this publication index.\n'

  return `# SkillPilot Subject Export Publication Index

Generated at: ${params.generatedAt}

Release candidate: \`${params.releaseCandidateId}\`

Version: \`${params.version}\`

Legacy export gate: ${params.passed ? 'pass' : 'fail'}

\`full-standalone-v1\` readiness: \`${params.targetReadinessStatus ?? 'mixed-or-unavailable'}\`

Standalone profile ready: \`${String(params.standaloneProfileReady)}\`

Readiness input integrity: \`${params.readinessInputIntegrity}\`

## Checks

| Check | Status | Details |
| --- | --- | --- |
${params.checks.map((check) => `| ${check.id} | ${check.passed ? 'pass' : 'fail'} | ${check.details.replace(/\|/g, '\\|')} |`).join('\n')}

## Packages

| Subject | ZIP | SHA-256 | Bytes | Max path | Legacy validation | Reproducibility | Target readiness | Standalone ready |
| --- | --- | --- | ---: | ---: | --- | --- | --- | --- |
${packageRows}

## Reports

| Kind | Path | Bytes | SHA-256 |
| --- | --- | ---: | --- |
${reportRows}
${linkAuditSection}`
}

const main = () => {
  const options = parseArgs(process.argv.slice(2))
  if (options.help) {
    process.stdout.write(usage())
    return
  }

  const generatedAt = new Date().toISOString()
  const summaryPath = resolve(options.dir, 'm5-subject-export-summary.json')
  const validationPath = resolve(options.dir, 'validation/subject-export-package-validation-report.json')
  const reproducibilityPath = resolve(options.dir, 'reproducibility/m5-export-reproducibility-report.json')
  const linkAuditPath = resolve(options.dir, 'link-audit/subject-export-source-link-audit.json')

  const checks: CheckResult[] = []

  const batch = jsonObject(readJson(summaryPath), repoRelative(summaryPath))
  const validation = jsonObject(readJson(validationPath), repoRelative(validationPath))
  const reproducibility = jsonObject(readJson(reproducibilityPath), repoRelative(reproducibilityPath))
  const linkAudit = options.includeLinkAudit && existsSync(linkAuditPath)
    ? jsonObject(readJson(linkAuditPath), repoRelative(linkAuditPath))
    : null

  if (options.requireLinkAudit && !linkAudit) {
    addCheck(checks, 'link-audit-present', false, 'Required live source-link audit report is missing.')
  }

  const batchPackages = objectArrayField(batch, 'packages')
  const validationResults = objectArrayField(validation, 'results')
  const reproducibilityComparisons = objectArrayField(reproducibility, 'comparisons')
  const validationByZip = byStringKey(validationResults, 'zipPath')
  const reproducibilityBySubject = byStringKey(reproducibilityComparisons, 'subject')
  const selectedSubjects = stringArrayField(batch, 'selectedSubjects')
  const comparedSubjects = stringArrayField(reproducibility, 'comparedSubjects')
  const packageSubjects = batchPackages.map((pkg) => stringField(pkg, 'subject'))
  const subjectComparison = compareStringSets(packageSubjects, selectedSubjects)
  const reproducibilityComparison = compareStringSets(packageSubjects, comparedSubjects)
  const validationTargetReadiness = objectField(validation, 'targetReadiness')

  addCheck(checks, 'batch-version-matches', stringField(batch, 'version') === options.version, `batch version ${stringField(batch, 'version')}`)
  addCheck(checks, 'batch-has-packages', batchPackages.length > 0, `${batchPackages.length} package(s)`)
  addCheck(checks, 'batch-has-no-failures', objectArrayField(batch, 'failures').length === 0, `${objectArrayField(batch, 'failures').length} failure(s)`)
  addCheck(checks, 'batch-selected-subjects-match-packages', subjectComparison.missing.length === 0 && subjectComparison.unexpected.length === 0, `${selectedSubjects.length} selected subject(s), ${packageSubjects.length} package subject(s)`)
  addCheck(checks, 'batch-validation-scope-legacy', stringField(batch, 'validationScope') === 'legacy-subject-export', stringField(batch, 'validationScope'))
  addCheck(checks, 'batch-legacy-export-gate-passed', booleanField(batch, 'legacyExportGatePassed'), String(booleanField(batch, 'legacyExportGatePassed')))
  addCheck(checks, 'batch-target-readiness-legacy', stringField(batch, 'targetReadinessStatus') === 'not-ready-legacy', stringField(batch, 'targetReadinessStatus'))
  addCheck(checks, 'batch-standalone-ready-false', booleanField(batch, 'standaloneProfileReady') === false, String(booleanField(batch, 'standaloneProfileReady')))
  addCheck(checks, 'validation-scope-legacy', stringField(validation, 'validationScope') === 'legacy-subject-export', stringField(validation, 'validationScope'))
  addCheck(checks, 'legacy-validation-passed', booleanField(validation, 'passed'), `${numberField(validation, 'packageCount')} legacy package(s) validated`)
  addCheck(checks, 'validation-package-count-matches', numberField(validation, 'packageCount') === batchPackages.length, `${numberField(validation, 'packageCount')}/${batchPackages.length}`)
  addCheck(checks, 'validation-readiness-report-count-matches', numberField(validationTargetReadiness, 'reportCount') === batchPackages.length, `${numberField(validationTargetReadiness, 'reportCount')}/${batchPackages.length}`)
  addCheck(checks, 'validation-target-readiness-legacy', stringField(validationTargetReadiness, 'status') === 'not-ready-legacy', stringField(validationTargetReadiness, 'status'))
  addCheck(checks, 'validation-readiness-dialect-legacy', stringField(validationTargetReadiness, 'manifestDialect') === 'legacy-subject-export', stringField(validationTargetReadiness, 'manifestDialect'))
  addCheck(checks, 'validation-standalone-ready-false', booleanField(validationTargetReadiness, 'standaloneProfileReady') === false, String(booleanField(validationTargetReadiness, 'standaloneProfileReady')))
  addCheck(checks, 'validation-readiness-input-integrity-passed', stringField(validationTargetReadiness, 'inputIntegrity') === 'pass', stringField(validationTargetReadiness, 'inputIntegrity'))
  addCheck(checks, 'reproducibility-passed', booleanField(reproducibility, 'passed'), `${comparedSubjects.length} package(s) compared`)
  addCheck(checks, 'reproducibility-subjects-match-packages', reproducibilityComparison.missing.length === 0 && reproducibilityComparison.unexpected.length === 0, `${comparedSubjects.length} compared subject(s)`)

  if (linkAudit) {
    const linkSummary = objectField(linkAudit, 'summary')
    addCheck(checks, 'link-audit-passed', booleanField(linkAudit, 'passed'), `${numberField(linkSummary, 'pass')} pass, ${numberField(linkSummary, 'warn')} warn, ${numberField(linkSummary, 'fail')} fail`)
  }

  const readinessReportArtifacts: FileArtifact[] = []
  const canonicalReadinessRecords: PackageTargetReadiness[] = []
  const packages = batchPackages.map((pkg) => {
    const subject = stringField(pkg, 'subject')
    const zipPath = stringField(pkg, 'zipPath')
    const releaseReportPath = stringField(pkg, 'releaseReportPath')
    const validationResult = validationByZip.get(zipPath)
    const reproducibilityResult = reproducibilityBySubject.get(subject)
    if (!validationResult) {
      throw new Error(`Missing validation result for ${zipPath}`)
    }
    const zip = fileArtifact('subject-package-zip', zipPath)
    const releaseReport = fileArtifact('subject-release-report', releaseReportPath)
    const expectedSha256 = stringField(pkg, 'sha256')
    const zipMatchesSummary = zip.sha256 === expectedSha256
    const validationZipSha256 = optionalStringField(validationResult, 'zipSha256')
    const zipMatchesValidation = validationZipSha256 === zip.sha256
    const validatorReadiness = parsePackageTargetReadiness(
      validationResult.targetReadiness ?? null,
      `target readiness for ${zipPath}`,
    )
    const readinessReport = fileArtifact('target-readiness-report', validatorReadiness.reportPath)
    const canonicalReadiness = readCanonicalTargetReadiness(readinessReport)
    readinessReportArtifacts.push(readinessReport)
    canonicalReadinessRecords.push(canonicalReadiness)
    const validatorReadinessMatchesCanonical = Object.entries(canonicalReadiness)
      .every(([key, value]) => validatorReadiness[key as keyof PackageTargetReadiness] === value)
    addCheck(checks, `zip-checksum-matches-summary:${subject}`, zipMatchesSummary, zipMatchesSummary ? zip.path : `${zip.path} expected ${expectedSha256} but got ${zip.sha256}`)
    addCheck(checks, `validation-result-present:${subject}`, true, zipPath)
    addCheck(
      checks,
      `zip-checksum-matches-validation:${subject}`,
      zipMatchesValidation,
      zipMatchesValidation ? zip.path : `${zip.path} validation hash ${validationZipSha256 ?? 'missing'} != ${zip.sha256}`,
    )
    addCheck(checks, `readiness-report-sha256-matches-validation:${subject}`, readinessReport.sha256 === validatorReadiness.reportSha256, `${readinessReport.sha256} / ${validatorReadiness.reportSha256}`)
    addCheck(checks, `readiness-values-match-canonical-report:${subject}`, validatorReadinessMatchesCanonical, readinessReport.path)
    addCheck(checks, `readiness-zip-sha256-matches:${subject}`, canonicalReadiness.inputZipSha256 === zip.sha256, `${canonicalReadiness.inputZipSha256} / ${zip.sha256}`)
    addCheck(checks, `readiness-dialect-legacy:${subject}`, canonicalReadiness.manifestDialect === 'legacy-subject-export', canonicalReadiness.manifestDialect)
    addCheck(checks, `readiness-status-not-ready-legacy:${subject}`, canonicalReadiness.status === 'not-ready-legacy', canonicalReadiness.status)
    addCheck(checks, `readiness-standalone-ready-false:${subject}`, canonicalReadiness.standaloneProfileReady === false, String(canonicalReadiness.standaloneProfileReady))
    addCheck(checks, `readiness-input-integrity-passed:${subject}`, canonicalReadiness.inputIntegrity === 'pass', canonicalReadiness.inputIntegrity)
    addCheck(checks, `builder-readiness-scope-matches:${subject}`, stringField(pkg, 'validationScope') === 'legacy-subject-export', stringField(pkg, 'validationScope'))
    addCheck(checks, `builder-readiness-status-matches:${subject}`, stringField(pkg, 'targetReadinessStatus') === canonicalReadiness.status, `${stringField(pkg, 'targetReadinessStatus')} / ${canonicalReadiness.status}`)
    addCheck(checks, `builder-standalone-ready-matches:${subject}`, booleanField(pkg, 'standaloneProfileReady') === canonicalReadiness.standaloneProfileReady, `${String(booleanField(pkg, 'standaloneProfileReady'))} / ${String(canonicalReadiness.standaloneProfileReady)}`)
    addCheck(checks, `reproducibility-result-present:${subject}`, Boolean(reproducibilityResult), subject)

    return {
      subject,
      packageId: stringField(pkg, 'packageId'),
      archiveRoot: stringField(pkg, 'archiveRoot'),
      version: stringField(pkg, 'version'),
      publicationProfile: stringField(pkg, 'publicationProfile'),
      bytes: numberField(pkg, 'bytes'),
      files: numberField(pkg, 'files'),
      mappingStates: numberField(pkg, 'mappingStates'),
      maxArchivePathLength: numberField(pkg, 'maxArchivePathLength'),
      warnings: stringArrayField(pkg, 'warnings'),
      zip,
      releaseReport,
      validation: {
        passed: booleanField(validationResult, 'passed'),
        zipSha256: validationZipSha256 ?? null,
        counts: maybeObjectField(validationResult, 'counts') ?? {},
      },
      targetReadiness: {
        ...canonicalReadiness,
        report: readinessReport,
      },
      reproducibility: reproducibilityResult
        ? {
            status: stringField(reproducibilityResult, 'status'),
            firstSha256: stringField(reproducibilityResult, 'firstSha256'),
            secondSha256: stringField(reproducibilityResult, 'secondSha256'),
          }
        : {
            status: 'missing',
            firstSha256: null,
            secondSha256: null,
          },
    }
  })

  const reports: FileArtifact[] = [
    fileArtifact('batch-summary-json', repoRelative(summaryPath)),
    fileArtifact('batch-summary-markdown', optionalStringField(batch, 'markdownSummaryPath') ?? 'tmp/exports/m5-subject-export-summary.md'),
    fileArtifact('validation-report-json', repoRelative(validationPath)),
    fileArtifact('validation-report-markdown', stringField(validation, 'markdownReportPath')),
    fileArtifact('reproducibility-report-json', repoRelative(reproducibilityPath)),
    fileArtifact('reproducibility-report-markdown', stringField(reproducibility, 'markdownReportPath')),
    ...readinessReportArtifacts,
  ]

  if (linkAudit) {
    reports.push(
      fileArtifact('source-link-audit-json', repoRelative(linkAuditPath)),
      fileArtifact('source-link-audit-markdown', stringField(linkAudit, 'markdownReportPath')),
    )
  }

  const outputDir = resolve(options.dir, 'publication')
  mkdirSync(outputDir, { recursive: true })
  const indexPath = resolve(outputDir, 'subject-export-publication-index.json')
  const markdownPath = resolve(outputDir, 'subject-export-publication-index.md')
  const releaseCandidateId = `skillpilot-de-gymnasium-subject-exports-v${options.version}`
  const targetReadiness = aggregateTargetReadiness(canonicalReadinessRecords)
  const validationReadinessPaths = stringArrayField(validationTargetReadiness, 'reportPaths')
  const readinessPathComparison = compareStringSets(
    canonicalReadinessRecords.map((record) => record.reportPath),
    validationReadinessPaths,
  )
  addCheck(checks, 'readiness-report-paths-match-validation', readinessPathComparison.missing.length === 0 && readinessPathComparison.unexpected.length === 0, `${canonicalReadinessRecords.length} canonical report(s), ${validationReadinessPaths.length} validation report path(s)`)
  addCheck(checks, 'canonical-readiness-status-matches-validation', targetReadiness.status === stringField(validationTargetReadiness, 'status'), `${targetReadiness.status ?? '(mixed)'} / ${stringField(validationTargetReadiness, 'status')}`)
  addCheck(checks, 'canonical-readiness-dialect-matches-validation', targetReadiness.manifestDialect === stringField(validationTargetReadiness, 'manifestDialect'), `${targetReadiness.manifestDialect ?? '(mixed)'} / ${stringField(validationTargetReadiness, 'manifestDialect')}`)
  addCheck(checks, 'canonical-standalone-ready-matches-validation', targetReadiness.standaloneProfileReady === booleanField(validationTargetReadiness, 'standaloneProfileReady'), `${String(targetReadiness.standaloneProfileReady)} / ${String(booleanField(validationTargetReadiness, 'standaloneProfileReady'))}`)
  addCheck(checks, 'canonical-readiness-input-matches-validation', targetReadiness.inputIntegrity === stringField(validationTargetReadiness, 'inputIntegrity'), `${targetReadiness.inputIntegrity} / ${stringField(validationTargetReadiness, 'inputIntegrity')}`)
  const passed = checks.every((check) => check.passed)
  const index = {
    generatedAt,
    validationScope: 'legacy-subject-export',
    releaseCandidateId,
    version: options.version,
    outputDir: repoRelative(options.dir),
    passed,
    legacyExportGatePassed: passed,
    targetReadinessStatus: targetReadiness.status,
    standaloneProfileReady: targetReadiness.standaloneProfileReady,
    targetReadiness,
    packageCount: packages.length,
    packages,
    reports,
    checks,
    linkAudit: linkAudit
      ? {
          passed: booleanField(linkAudit, 'passed'),
          failOnBroken: booleanField(linkAudit, 'failOnBroken'),
          uniqueUrls: numberField(linkAudit, 'uniqueUrls'),
          sourceUrlOccurrences: numberField(linkAudit, 'sourceUrlOccurrences'),
          summary: objectField(linkAudit, 'summary'),
          reportPath: stringField(linkAudit, 'reportPath'),
          markdownReportPath: stringField(linkAudit, 'markdownReportPath'),
        }
      : null,
    indexPath: repoRelative(indexPath),
    markdownPath: repoRelative(markdownPath),
  }

  writeFileSync(indexPath, stableJson(index as unknown as JsonValue))
  writeFileSync(markdownPath, buildMarkdown({
    generatedAt,
    releaseCandidateId,
    version: options.version,
    passed,
    targetReadinessStatus: targetReadiness.status,
    standaloneProfileReady: targetReadiness.standaloneProfileReady,
    readinessInputIntegrity: targetReadiness.inputIntegrity,
    checks,
    packages: packages as unknown as Record<string, JsonValue>[],
    reports,
    linkAudit: index.linkAudit as Record<string, JsonValue> | null,
  }))
  process.stdout.write(stableJson({
    generatedAt,
    validationScope: 'legacy-subject-export',
    releaseCandidateId,
    version: options.version,
    passed,
    legacyExportGatePassed: passed,
    targetReadinessStatus: targetReadiness.status,
    standaloneProfileReady: targetReadiness.standaloneProfileReady,
    packageCount: packages.length,
    indexPath: repoRelative(indexPath),
    markdownPath: repoRelative(markdownPath),
  }))

  if (!passed) {
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
