import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

type RuleStatus = 'pass' | 'warn' | 'fail' | 'not_configured'
type MaturityLevel = 'M0' | 'M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'M6' | 'M7'

interface RuleResult {
  id: string
  status: RuleStatus
  summary: string
  metrics?: Record<string, number>
}

interface CurriculumStatus {
  title: string
  subject?: string
  maturity: MaturityLevel
  path: string
  goals: number
  atomicGoals: number
  rules: RuleResult[]
  jurisdictionCoverage?: {
    totalJurisdictions?: number
    coveredJurisdictions?: number
    sourceBackedJurisdictions?: number
    sourceCompleteJurisdictions?: number
  }
}

interface StatusDocument {
  generatedAt: string
  rulesVersion: string
  summary: {
    curricula: number
    maturity: Record<MaturityLevel, number>
  }
  curricula: CurriculumStatus[]
}

interface Args {
  statusPath: string
  outputPath: string
}

interface RemediationRow {
  title: string
  category: string
  priority: number
  sourceCoverage: string
  qaScopes: string
  semanticAtomicity: string
  memoryReview: string
  nextAction: string
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '../..')

const defaultStatusPath = 'docs/qa-ci/status/curriculum-quality-status.json'
const defaultOutputPath = 'docs/qa-ci/status/m0-remediation-plan.md'

function parseArgs(argv: string[]): Args {
  const args: Args = {
    statusPath: defaultStatusPath,
    outputPath: defaultOutputPath,
  }

  argv.forEach((arg) => {
    if (arg.startsWith('--status=')) {
      args.statusPath = arg.slice('--status='.length)
    } else if (arg.startsWith('--output=')) {
      args.outputPath = arg.slice('--output='.length)
    } else {
      throw new Error(`Unknown argument: ${arg}`)
    }
  })

  return args
}

function readJson<T>(repoPath: string): T {
  return JSON.parse(readFileSync(resolve(repoRoot, repoPath), 'utf8')) as T
}

function rule(curriculum: CurriculumStatus, id: string): RuleResult | undefined {
  return curriculum.rules.find((candidate) => candidate.id === id)
}

function ruleStatus(curriculum: CurriculumStatus, id: string): RuleStatus | 'missing' {
  return rule(curriculum, id)?.status ?? 'missing'
}

function sourceCoverage(curriculum: CurriculumStatus): string {
  const cqr000 = rule(curriculum, 'CQR-000')
  const metrics = cqr000?.metrics
  const complete = metrics?.completeSourceJurisdictions
    ?? curriculum.jurisdictionCoverage?.sourceCompleteJurisdictions
    ?? 0
  const total = metrics?.totalJurisdictions
    ?? curriculum.jurisdictionCoverage?.totalJurisdictions
    ?? 16
  return `${complete}/${total}`
}

function qaScopeCount(curriculum: CurriculumStatus): number {
  const cqr101 = rule(curriculum, 'CQR-101')
  const cqr401 = rule(curriculum, 'CQR-401')
  return cqr101?.metrics?.scopes
    ?? cqr401?.metrics?.compositionViews
    ?? 0
}

function remediationCategory(curriculum: CurriculumStatus): string {
  if (curriculum.title === 'Gymnasium (DE)') return 'aggregate root'

  const cqr000 = rule(curriculum, 'CQR-000')
  const complete = cqr000?.metrics?.completeSourceJurisdictions ?? 0
  const total = cqr000?.metrics?.totalJurisdictions ?? 16

  if (cqr000?.status === 'fail' || complete === 0) return 'source bootstrap'
  if (complete > 0 && complete < total) return 'partial source expansion'
  return 'review and route layer'
}

function priorityFor(curriculum: CurriculumStatus, category: string): number {
  if (curriculum.title === 'Englisch (Gymnasium, DE)') return 10
  if (curriculum.title === 'Französisch (Gymnasium, DE)') return 20
  if (curriculum.title === 'Spanisch (Gymnasium, DE)') return 30
  if (curriculum.title === 'Musik (Gymnasium, DE)') return 40
  if (curriculum.title === 'Chinesisch (Gymnasium, DE)') return 50
  if (curriculum.title === 'Griechisch (Gymnasium, DE)') return 60
  if (category === 'aggregate root') return 70
  if (category === 'source bootstrap') return 80
  return 90
}

function nextActionFor(curriculum: CurriculumStatus, category: string): string {
  if (category === 'aggregate root') {
    return 'Decide whether the DE Gymnasium overview should be governed by aggregate-only rules or excluded from subject maturity counts.'
  }

  if (category === 'source bootstrap') {
    return 'Start with official source inventory and source-extraction before creating atomicity or memory ledgers.'
  }

  if (curriculum.title === 'Englisch (Gymnasium, DE)') {
    return 'Recommended next pilot: expand source coverage beyond HE/BY and define language-specific QA scopes before any memory review.'
  }

  if (curriculum.title === 'Französisch (Gymnasium, DE)') {
    return 'Good second language pilot after English; HE Sek I/Sek II and BY already provide an initial source base.'
  }

  return 'Complete 16/16 source coverage and Bundesland projections first; then add semantic atomicity, QA scopes, and finally CQR-302.'
}

function markdownCell(value: string | number): string {
  return String(value)
    .replace(/\|/g, '\\|')
    .replace(/\n+/g, '<br>')
}

function markdownTable(headers: string[], rows: Array<Array<string | number>>): string[] {
  return [
    `| ${headers.map(markdownCell).join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => `| ${row.map(markdownCell).join(' | ')} |`),
  ]
}

function pushGeneratedMarkdownNotice(lines: string[], statusPath: string): void {
  lines.push('> Generated artifact. Do not edit manually.')
  lines.push('>')
  lines.push('> Generated by: `app/scripts/reportM0RemediationPlan.ts`')
  lines.push('> Regenerate with: `cd app && npm run quality:m0-remediation`')
  lines.push('> Source of truth: `app/scripts/reportM0RemediationPlan.ts`')
  lines.push(`> Source of truth: \`${statusPath}\``)
  lines.push('')
}

function buildRows(status: StatusDocument): RemediationRow[] {
  return status.curricula
    .filter((curriculum) => curriculum.maturity === 'M0')
    .map((curriculum) => {
      const category = remediationCategory(curriculum)
      return {
        title: curriculum.title,
        category,
        priority: priorityFor(curriculum, category),
        sourceCoverage: sourceCoverage(curriculum),
        qaScopes: String(qaScopeCount(curriculum)),
        semanticAtomicity: ruleStatus(curriculum, 'CQR-301'),
        memoryReview: ruleStatus(curriculum, 'CQR-302'),
        nextAction: nextActionFor(curriculum, category),
      }
    })
    .sort((left, right) => left.priority - right.priority || left.title.localeCompare(right.title))
}

function renderReport(status: StatusDocument, statusPath: string): string {
  const rows = buildRows(status)
  const byCategory = rows.reduce<Record<string, number>>((accumulator, row) => {
    accumulator[row.category] = (accumulator[row.category] ?? 0) + 1
    return accumulator
  }, {})

  const lines: string[] = [
    '# M0 Remediation Plan',
    '',
  ]
  pushGeneratedMarkdownNotice(lines, statusPath)
  lines.push(
    `Generated from \`${statusPath}\`; status snapshot generated at ${status.generatedAt}.`,
    '',
    'This report is a reproducible work queue for curricula that are still at `M0`. It deliberately does not create review ledgers or memory-card configs. Those are only added after source coverage and route semantics are ready.',
    '',
    '## Current Snapshot',
    '',
    ...markdownTable(
      ['Metric', 'Value'],
      [
        ['Total curricula', status.summary.curricula],
        ['M0 curricula', status.summary.maturity.M0 ?? 0],
        ['M6 curricula', status.summary.maturity.M6 ?? 0],
        ['M7 curricula', status.summary.maturity.M7 ?? 0],
        ['Partial source expansion', byCategory['partial source expansion'] ?? 0],
        ['Source bootstrap', byCategory['source bootstrap'] ?? 0],
        ['Aggregate root', byCategory['aggregate root'] ?? 0],
      ],
    ),
    '',
    '## Recommended Next Work',
    '',
    '1. Start with `Englisch (Gymnasium, DE)` as the next source-expansion pilot. It is small enough to keep the process manageable, already has HE/BY source material, and will force the language-specific CEFR/skills modeling questions into the open. The concrete pilot plan is generated as `docs/qa-ci/status/english-remediation-pilot.md`.',
    '2. After English, use `Französisch (Gymnasium, DE)` to verify that the language workflow generalizes to a larger graph with Sek I and Sek II material.',
    '3. Keep `CQR-302` out of these subjects until source coverage, composition views, route scopes, and semantic atomicity are genuinely ready. Memory review is an M6 layer, not a shortcut out of M0.',
    '4. Decide separately how `Gymnasium (DE)` should be counted. It is an aggregate entry point, not a normal subject landscape with its own 16 Bundesland source inventories.',
    '',
    '## M0 Detail',
    '',
    ...markdownTable(
      ['Priority', 'Curriculum', 'Category', 'Sources', 'QA scopes', 'CQR-301', 'CQR-302', 'Next action'],
      rows.map((row) => [
        row.priority,
        row.title,
        row.category,
        row.sourceCoverage,
        row.qaScopes,
        row.semanticAtomicity,
        row.memoryReview,
        row.nextAction,
      ]),
    ),
    '',
    '## Done Criteria For A Subject Leaving M0',
    '',
    '- `CQR-000` is no longer warning or failing: official source inventories are readable, URL-backed, and registered.',
    '- `CQR-003` is clean for all 16 Bundeslaender or the subject has an explicitly reviewed different scope.',
    '- Learner-facing composition views and QA scopes exist before route quality is claimed.',
    '- `CQR-301` semantic atomicity is reviewed from actual goal semantics, not generated as a placeholder.',
    '- `CQR-302` is configured only after the above is stable and only if the subject is ready for M6.',
    '',
  )

  return `${lines.join('\n')}\n`
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  const status = readJson<StatusDocument>(args.statusPath)
  const outputPath = resolve(repoRoot, args.outputPath)
  const outputDir = dirname(outputPath)
  if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true })
  writeFileSync(outputPath, renderReport(status, args.statusPath))
  console.log(`Wrote ${args.outputPath}`)
}

main()
