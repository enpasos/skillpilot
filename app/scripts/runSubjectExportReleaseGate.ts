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
  enforceCommittedQualityStatus: boolean
  enforceCleanSourceTree: boolean
  auditSourceLinks: boolean
  strictSourceLinks: boolean
  help: boolean
}

type StepResult = {
  name: string
  command: string
  passed: boolean
  startedAt: string
  finishedAt: string
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const appRoot = resolve(scriptDir, '..')
const repoRoot = resolve(scriptDir, '../..')

const QUALITY_STATUS_PATHS = [
  'docs/qa-ci/status/curriculum-quality-status.json',
  'docs/qa-ci/status/curriculum-quality-status.md',
]

const usage = () => `Usage:
  npm run export:subject-release-gate -- [--version 0.1.0]

Options:
  --version <version>                         Package version. Default: 0.1.0.
  --enforce-committed-quality-status          Fail if regenerated quality status files differ from Git.
  --no-enforce-committed-quality-status       Disable committed-status enforcement.
  --enforce-clean-source-tree                 Fail if the Git worktree has tracked or untracked changes before building packages.
  --no-enforce-clean-source-tree              Disable clean-source-tree enforcement.
  --audit-source-links                        Run live official-source URL reachability checks after package validation.
  --no-audit-source-links                     Disable live source-link checks.
  --strict-source-links                       Fail the release gate on broken live source links. Implies --audit-source-links.
  --no-strict-source-links                    Run source-link checks in report-only mode.
  --help                                      Show this help.
`

const parseArgs = (argv: string[]): CliOptions => {
  const options: CliOptions = {
    version: '0.1.0',
    enforceCommittedQualityStatus: process.env.CI === 'true',
    enforceCleanSourceTree: process.env.CI === 'true',
    auditSourceLinks: false,
    strictSourceLinks: false,
    help: false,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--help' || arg === '-h') {
      options.help = true
      continue
    }
    if (arg === '--enforce-committed-quality-status') {
      options.enforceCommittedQualityStatus = true
      continue
    }
    if (arg === '--no-enforce-committed-quality-status') {
      options.enforceCommittedQualityStatus = false
      continue
    }
    if (arg === '--enforce-clean-source-tree') {
      options.enforceCleanSourceTree = true
      continue
    }
    if (arg === '--no-enforce-clean-source-tree') {
      options.enforceCleanSourceTree = false
      continue
    }
    if (arg === '--audit-source-links') {
      options.auditSourceLinks = true
      continue
    }
    if (arg === '--no-audit-source-links') {
      options.auditSourceLinks = false
      options.strictSourceLinks = false
      continue
    }
    if (arg === '--strict-source-links') {
      options.auditSourceLinks = true
      options.strictSourceLinks = true
      continue
    }
    if (arg === '--no-strict-source-links') {
      options.strictSourceLinks = false
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

    throw new Error(`Unknown argument: ${arg}`)
  }

  return options
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

const shellQuote = (value: string) => (/\s/u.test(value) ? JSON.stringify(value) : value)

const runStep = (name: string, command: string, args: string[]): StepResult => {
  const startedAt = new Date().toISOString()
  execFileSync(command, args, {
    cwd: appRoot,
    stdio: 'inherit',
  })
  return {
    name,
    command: [command, ...args].map(shellQuote).join(' '),
    passed: true,
    startedAt,
    finishedAt: new Date().toISOString(),
  }
}

const enforceCommittedQualityStatus = () => {
  try {
    execFileSync('git', ['diff', '--exit-code', '--', ...QUALITY_STATUS_PATHS], {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    })
  } catch (error) {
    const diff = error && typeof error === 'object' && 'stdout' in error
      ? String((error as { stdout?: string }).stdout ?? '')
      : ''
    throw new Error([
      'Regenerated curriculum quality status differs from the committed files.',
      'Run `cd app && npm run quality:curriculum-status`, review the status files, and commit them.',
      diff.trim(),
    ].filter(Boolean).join('\n\n'))
  }
}

const enforceCleanSourceTree = () => {
  const status = execFileSync('git', ['status', '--porcelain', '--untracked-files=all'], {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim()

  if (!status) {
    return
  }

  throw new Error([
    'Subject export release packages must be built from a clean source tree.',
    'Commit or explicitly discard source changes before running the enforced release gate.',
    status,
  ].join('\n\n'))
}

const buildMarkdownReport = (params: {
  generatedAt: string
  version: string
  enforceCommittedQualityStatus: boolean
  enforceCleanSourceTree: boolean
  auditSourceLinks: boolean
  strictSourceLinks: boolean
  steps: StepResult[]
}) => `# Subject Export Release Gate

Generated at: ${params.generatedAt}

Version: \`${params.version}\`

Committed quality status enforced: ${params.enforceCommittedQualityStatus}

Clean source tree enforced: ${params.enforceCleanSourceTree}

Live source-link audit enabled: ${params.auditSourceLinks}

Strict source-link audit: ${params.strictSourceLinks}

## Steps

| Step | Status | Command |
| --- | --- | --- |
${params.steps.map((step) => `| ${step.name} | ${step.passed ? 'pass' : 'fail'} | \`${step.command}\` |`).join('\n')}
`

const main = () => {
  const options = parseArgs(process.argv.slice(2))
  if (options.help) {
    process.stdout.write(usage())
    return
  }

  const steps: StepResult[] = []
  const generatedAt = new Date().toISOString()

  steps.push(runStep('refresh-curriculum-quality-status', 'npm', ['run', 'quality:curriculum-status']))
  if (options.enforceCommittedQualityStatus) {
    enforceCommittedQualityStatus()
  }
  if (options.enforceCleanSourceTree) {
    enforceCleanSourceTree()
  }
  steps.push(runStep('build-m5-subject-export-packages', 'npm', ['run', 'export:m5-subject-packages', '--', '--version', options.version]))
  steps.push(runStep('validate-subject-export-packages', 'npm', ['run', 'export:subject-packages:validate', '--', '--dir', 'tmp/exports']))
  if (options.auditSourceLinks) {
    const auditArgs = ['run', 'export:subject-packages:audit-links', '--', '--dir', 'tmp/exports']
    if (options.strictSourceLinks) {
      auditArgs.push('--fail-on-broken')
    }
    steps.push(runStep('audit-subject-export-source-links', 'npm', auditArgs))
  }
  steps.push(runStep('check-m5-subject-export-reproducibility', 'npm', ['run', 'export:m5-subject-packages:check-reproducible', '--', '--version', options.version]))
  steps.push(runStep('build-subject-export-publication-index', 'npm', [
    'run',
    'export:subject-publication-index',
    '--',
    '--dir',
    'tmp/exports',
    '--version',
    options.version,
    ...(options.auditSourceLinks ? ['--require-link-audit'] : []),
  ]))

  const outputDir = resolve(repoRoot, 'tmp/exports/release-gate')
  mkdirSync(outputDir, { recursive: true })
  const reportPath = resolve(outputDir, 'subject-export-release-gate-report.json')
  const markdownReportPath = resolve(outputDir, 'subject-export-release-gate-report.md')
  const report = {
    generatedAt,
    version: options.version,
    enforceCommittedQualityStatus: options.enforceCommittedQualityStatus,
    enforceCleanSourceTree: options.enforceCleanSourceTree,
    auditSourceLinks: options.auditSourceLinks,
    strictSourceLinks: options.strictSourceLinks,
    passed: true,
    steps,
    reportPath: repoRelative(reportPath),
    markdownReportPath: repoRelative(markdownReportPath),
  }

  writeFileSync(reportPath, stableJson(report as unknown as JsonValue))
  writeFileSync(markdownReportPath, buildMarkdownReport({
    generatedAt,
    version: options.version,
    enforceCommittedQualityStatus: options.enforceCommittedQualityStatus,
    enforceCleanSourceTree: options.enforceCleanSourceTree,
    auditSourceLinks: options.auditSourceLinks,
    strictSourceLinks: options.strictSourceLinks,
    steps,
  }))
  process.stdout.write(stableJson(report as unknown as JsonValue))
}

try {
  main()
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  process.stderr.write(`${message}\n`)
  process.exitCode = 1
}
