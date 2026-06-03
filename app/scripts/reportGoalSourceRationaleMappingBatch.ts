import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

interface CoveredSibling {
  goalId: string
  title: string
  sourceRationaleStatus: string
  jurisdiction: string | null
  sourceExtractionPath: string | null
  sourceGoalId: string | null
  sourceRef: string | null
  topicCode: string | null
  matchType: string | null
}

interface GapIssue {
  id: string
  lane: string
  goalId: string
  shortKey: string | null
  title: string
  description: string
  phase: string
  area: string
  topicCode: string | null
  pathTitles: string[]
  coveredSiblingGoals: number
  coveredSiblingExamples: CoveredSibling[]
}

interface GapIssueReport {
  generatedAt?: unknown
  summary?: unknown
  issues?: unknown
}

interface MappingBatchCandidate {
  batchItemId: string
  issueId: string
  priorityScore: number
  goalId: string
  shortKey: string | null
  title: string
  description: string
  phase: string
  area: string
  topicCode: string | null
  pathTitles: string[]
  proposedAnchor: CoveredSibling
  coveredSiblingGoals: number
  reviewAction: string
  nonAutomaticReason: string
}

interface MappingBatchReport {
  schemaVersion: 1
  generatedAt: string
  generator: string
  request: {
    gapIssueReportPath: string
    batchId: string
    maxItems: number
  }
  sourceReport: {
    generatedAt: string | null
    summary: unknown
  }
  summary: {
    batchId: string
    candidates: number
    totalSiblingMappingIssues: number
    remainingSiblingMappingIssuesOutsideBatch: number
    byJurisdiction: Array<{ jurisdiction: string; candidates: number }>
    byPhase: Array<{ phase: string; candidates: number }>
  }
  candidates: MappingBatchCandidate[]
}

interface Args {
  checkMode: boolean
  gapIssueReportPath: string
  outputJsonPath: string
  outputMarkdownPath: string
  batchId: string
  maxItems: number
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '../..')

const defaultGapIssueReportPath = 'docs/qa-ci/status/goal-source-rationale-gap-issues.json'
const defaultOutputJsonPath = 'docs/qa-ci/status/goal-source-rationale-mapping-batch-01.json'
const defaultOutputMarkdownPath = 'docs/qa-ci/status/goal-source-rationale-mapping-batch-01.md'
const defaultBatchId = 'GSR-MAP-BATCH-01'
const defaultMaxItems = 20

const stopWords = new Set([
  'eine',
  'einen',
  'einer',
  'einem',
  'eines',
  'oder',
  'und',
  'mit',
  'fuer',
  'fur',
  'die',
  'der',
  'das',
  'den',
  'dem',
  'des',
  'kann',
  'lk',
])

function resolveRepoPath(path: string): string {
  return resolve(repoRoot, path)
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(resolveRepoPath(path), 'utf8')) as T
}

function parseArgs(argv: string[]): Args {
  const args: Args = {
    checkMode: false,
    gapIssueReportPath: defaultGapIssueReportPath,
    outputJsonPath: defaultOutputJsonPath,
    outputMarkdownPath: defaultOutputMarkdownPath,
    batchId: defaultBatchId,
    maxItems: defaultMaxItems,
  }

  argv.forEach((arg) => {
    if (arg === '--check') {
      args.checkMode = true
      return
    }
    if (arg.startsWith('--gap-issues=')) {
      args.gapIssueReportPath = arg.slice('--gap-issues='.length)
      return
    }
    if (arg.startsWith('--output-json=')) {
      args.outputJsonPath = arg.slice('--output-json='.length)
      return
    }
    if (arg.startsWith('--output-md=')) {
      args.outputMarkdownPath = arg.slice('--output-md='.length)
      return
    }
    if (arg.startsWith('--batch-id=')) {
      args.batchId = arg.slice('--batch-id='.length)
      return
    }
    if (arg.startsWith('--max-items=')) {
      const value = Number.parseInt(arg.slice('--max-items='.length), 10)
      if (!Number.isFinite(value) || value <= 0) throw new Error(`Invalid --max-items value: ${arg}`)
      args.maxItems = value
      return
    }
    throw new Error(`Unknown argument: ${arg}`)
  })

  return args
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null
}

function gapIssues(report: GapIssueReport): GapIssue[] {
  return Array.isArray(report.issues)
    ? report.issues.filter((issue): issue is GapIssue => (
      typeof issue === 'object'
      && issue !== null
      && typeof (issue as GapIssue).id === 'string'
      && typeof (issue as GapIssue).goalId === 'string'
      && Array.isArray((issue as GapIssue).coveredSiblingExamples)
    ))
    : []
}

function normalizeForTokens(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/ä/giu, 'ae')
    .replace(/ö/giu, 'oe')
    .replace(/ü/giu, 'ue')
    .replace(/ß/giu, 'ss')
    .toLocaleLowerCase('de-DE')
}

function tokenPrefixes(value: string): Set<string> {
  return new Set(
    normalizeForTokens(value)
      .split(/[^a-z0-9]+/iu)
      .filter((token) => token.length >= 5 && !stopWords.has(token))
      .map((token) => token.slice(0, 6)),
  )
}

function lexicalOverlapScore(issue: GapIssue, anchor: CoveredSibling): number {
  const issueTokens = tokenPrefixes(`${issue.title} ${issue.description}`)
  const anchorTokens = tokenPrefixes(`${anchor.title} ${anchor.sourceRef ?? ''} ${anchor.sourceGoalId ?? ''}`)
  return Array.from(issueTokens).filter((token) => anchorTokens.has(token)).length
}

function priorityScore(issue: GapIssue, anchor: CoveredSibling): number {
  let score = 0
  score += lexicalOverlapScore(issue, anchor) * 20
  score += Math.min(issue.coveredSiblingGoals, 10)
  if (anchor.sourceRationaleStatus === 'classic_source_reviewed') score += 8
  if (anchor.matchType === 'exact') score += 5
  if (anchor.matchType === 'partial') score -= 3
  if (anchor.jurisdiction === 'DE-BY') score += 3
  if (anchor.jurisdiction === 'DE-HE') score += 2
  if (anchor.sourceExtractionPath?.includes('/upper-secondary/')) score += 2
  return score
}

function reviewAction(candidate: MappingBatchCandidate): string {
  return [
    `Pruefe in \`${candidate.proposedAnchor.sourceExtractionPath ?? 'unbekannte Source-Extraction'}\``,
    `den Source-Goal-Anker \`${candidate.proposedAnchor.sourceGoalId ?? 'unbekannt'}\`.`,
    'Wenn der Quellenbeleg das Ziel fachlich direkt oder als sinnvoller Sammelbeleg traegt,',
    `ergaenze die passende Mapping-Review-Entscheidung um \`${candidate.goalId}\` oder splitte den Source-Beleg feiner.`,
  ].join(' ')
}

function batchCandidates(report: GapIssueReport, args: Args): MappingBatchCandidate[] {
  return gapIssues(report)
    .filter((issue) => issue.lane === 'covered-sibling-mapping-gap' && issue.coveredSiblingExamples.length > 0)
    .map((issue, index) => {
      const proposedAnchor = issue.coveredSiblingExamples[0] as CoveredSibling
      const candidate: MappingBatchCandidate = {
        batchItemId: `${args.batchId}-${String(index + 1).padStart(3, '0')}`,
        issueId: issue.id,
        priorityScore: priorityScore(issue, proposedAnchor),
        goalId: issue.goalId,
        shortKey: issue.shortKey,
        title: issue.title,
        description: issue.description,
        phase: issue.phase,
        area: issue.area,
        topicCode: issue.topicCode,
        pathTitles: issue.pathTitles,
        proposedAnchor,
        coveredSiblingGoals: issue.coveredSiblingGoals,
        reviewAction: '',
        nonAutomaticReason: 'Der primaere Anker ist ein Kandidat aus einem belegten Geschwisterziel. Die fachliche Tragfaehigkeit fuer das Gap-Ziel muss vor einer Mapping-Aenderung explizit geprueft werden.',
      }
      return {
        ...candidate,
        reviewAction: reviewAction(candidate),
      }
    })
    .sort((left, right) =>
      right.priorityScore - left.priorityScore
        || right.coveredSiblingGoals - left.coveredSiblingGoals
        || left.pathTitles.join('\0').localeCompare(right.pathTitles.join('\0'), 'de')
        || left.goalId.localeCompare(right.goalId, 'de'))
    .slice(0, args.maxItems)
    .map((candidate, index) => ({
      ...candidate,
      batchItemId: `${args.batchId}-${String(index + 1).padStart(3, '0')}`,
    }))
}

function countBy<T extends string>(items: MappingBatchCandidate[], keyOf: (item: MappingBatchCandidate) => T): Array<{ key: T; candidates: number }> {
  return Array.from(new Set(items.map(keyOf)))
    .sort((left, right) => left.localeCompare(right, 'de'))
    .map((key) => ({
      key,
      candidates: items.filter((item) => keyOf(item) === key).length,
    }))
    .sort((left, right) => right.candidates - left.candidates || left.key.localeCompare(right.key, 'de'))
}

function buildReport(args: Args, generatedAt: string): MappingBatchReport {
  const gapIssueReport = readJson<GapIssueReport>(args.gapIssueReportPath)
  const candidates = batchCandidates(gapIssueReport, args)
  const totalSiblingMappingIssues = gapIssues(gapIssueReport)
    .filter((issue) => issue.lane === 'covered-sibling-mapping-gap').length

  return {
    schemaVersion: 1,
    generatedAt,
    generator: 'app/scripts/reportGoalSourceRationaleMappingBatch.ts',
    request: {
      gapIssueReportPath: args.gapIssueReportPath,
      batchId: args.batchId,
      maxItems: args.maxItems,
    },
    sourceReport: {
      generatedAt: asString(gapIssueReport.generatedAt),
      summary: gapIssueReport.summary ?? null,
    },
    summary: {
      batchId: args.batchId,
      candidates: candidates.length,
      totalSiblingMappingIssues,
      remainingSiblingMappingIssuesOutsideBatch: Math.max(0, totalSiblingMappingIssues - candidates.length),
      byJurisdiction: countBy(candidates, (candidate) => candidate.proposedAnchor.jurisdiction ?? 'unknown')
        .map(({ key, candidates: count }) => ({ jurisdiction: key, candidates: count })),
      byPhase: countBy(candidates, (candidate) => candidate.phase)
        .map(({ key, candidates: count }) => ({ phase: key, candidates: count })),
    },
    candidates,
  }
}

function existingGeneratedAt(path: string): string | null {
  if (!existsSync(resolveRepoPath(path))) return null
  try {
    return asString(readJson<{ generatedAt?: unknown }>(path).generatedAt)
  } catch {
    return null
  }
}

function markdownCell(value: string | number): string {
  return String(value).replace(/\|/g, '\\|').replace(/\n+/g, '<br>')
}

function markdownTable(headers: string[], rows: Array<Array<string | number>>): string[] {
  return [
    `| ${headers.map(markdownCell).join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => `| ${row.map(markdownCell).join(' | ')} |`),
  ]
}

function pushGeneratedMarkdownNotice(lines: string[]): void {
  lines.push('> Generated artifact. Do not edit manually.')
  lines.push('>')
  lines.push('> Generated by: `app/scripts/reportGoalSourceRationaleMappingBatch.ts`')
  lines.push('> Regenerate with: `cd app && npm run quality:goal-source-rationale-mapping-batch-01`')
  lines.push('> Source of truth: `app/scripts/reportGoalSourceRationaleMappingBatch.ts`')
  lines.push(`> Source of truth: \`${defaultGapIssueReportPath}\``)
  lines.push('')
}

function anchorLabel(anchor: CoveredSibling): string {
  return [
    anchor.title,
    anchor.jurisdiction ?? 'unknown',
    anchor.sourceRef ?? 'sourceRef:unknown',
    anchor.sourceGoalId ?? 'sourceGoalId:unknown',
  ].join(' | ')
}

function renderMarkdown(report: MappingBatchReport): string {
  const lines: string[] = ['# Goal Source Rationale Mapping Batch 01', '']
  pushGeneratedMarkdownNotice(lines)
  lines.push(`Generated: ${report.generatedAt}`)
  lines.push('')
  lines.push('Dieser Batch ist eine Review-Vorlage fuer naheliegende Mapping-Ergaenzungen. Er schreibt keine Mapping-Dateien um. Jeder Eintrag muss fachlich geprueft werden, bevor eine Mapping-Review-Entscheidung erweitert oder ein Source-Beleg gesplittet wird.')
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push(...markdownTable(
    ['Metric', 'Value'],
    [
      ['Batch ID', report.summary.batchId],
      ['Candidates in batch', report.summary.candidates],
      ['Sibling-supported mapping issues total', report.summary.totalSiblingMappingIssues],
      ['Remaining sibling-supported issues outside batch', report.summary.remainingSiblingMappingIssuesOutsideBatch],
    ],
  ))
  lines.push('')
  lines.push('## By Jurisdiction')
  lines.push('')
  lines.push(...markdownTable(
    ['Jurisdiction', 'Candidates'],
    report.summary.byJurisdiction.map((row) => [row.jurisdiction, row.candidates]),
  ))
  lines.push('')
  lines.push('## Candidates')
  lines.push('')
  lines.push(...markdownTable(
    ['Batch item', 'Score', 'Issue', 'Phase', 'Goal', 'Primary source anchor', 'Action'],
    report.candidates.map((candidate) => [
      candidate.batchItemId,
      candidate.priorityScore,
      candidate.issueId,
      candidate.phase,
      candidate.shortKey === null ? candidate.title : `${candidate.title} (${candidate.shortKey})`,
      anchorLabel(candidate.proposedAnchor),
      candidate.reviewAction,
    ]),
  ))
  lines.push('')
  lines.push('## Sources')
  lines.push('')
  lines.push(`- Gap issues: \`${report.request.gapIssueReportPath}\``)
  lines.push(`- Gap issues generated: ${report.sourceReport.generatedAt ?? 'unknown'}`)
  lines.push('')
  return `${lines.join('\n')}\n`
}

function writeOrCheck(args: Args, report: MappingBatchReport): void {
  const renderedJson = `${JSON.stringify(report, null, 2)}\n`
  const renderedMarkdown = renderMarkdown(report)

  if (args.checkMode) {
    const failures: string[] = []
    if (!existsSync(resolveRepoPath(args.outputJsonPath))) {
      failures.push(`${args.outputJsonPath} does not exist. Run: cd app && npm run quality:goal-source-rationale-mapping-batch-01`)
    } else if (readFileSync(resolveRepoPath(args.outputJsonPath), 'utf8') !== renderedJson) {
      failures.push(`${args.outputJsonPath} is stale. Run: cd app && npm run quality:goal-source-rationale-mapping-batch-01`)
    }
    if (!existsSync(resolveRepoPath(args.outputMarkdownPath))) {
      failures.push(`${args.outputMarkdownPath} does not exist. Run: cd app && npm run quality:goal-source-rationale-mapping-batch-01`)
    } else if (readFileSync(resolveRepoPath(args.outputMarkdownPath), 'utf8') !== renderedMarkdown) {
      failures.push(`${args.outputMarkdownPath} is stale. Run: cd app && npm run quality:goal-source-rationale-mapping-batch-01`)
    }
    if (failures.length > 0) {
      console.error(failures.join('\n'))
      process.exit(1)
    }
    console.log(`${args.outputMarkdownPath} and ${args.outputJsonPath} are up to date.`)
    return
  }

  mkdirSync(dirname(resolveRepoPath(args.outputJsonPath)), { recursive: true })
  mkdirSync(dirname(resolveRepoPath(args.outputMarkdownPath)), { recursive: true })
  writeFileSync(resolveRepoPath(args.outputJsonPath), renderedJson)
  writeFileSync(resolveRepoPath(args.outputMarkdownPath), renderedMarkdown)
  console.log(`Wrote ${args.outputJsonPath}`)
  console.log(`Wrote ${args.outputMarkdownPath}`)
}

function main(): void {
  const args = parseArgs(process.argv.slice(2))
  const generatedAt = args.checkMode
    ? existingGeneratedAt(args.outputJsonPath) ?? new Date().toISOString()
    : new Date().toISOString()
  writeOrCheck(args, buildReport(args, generatedAt))
}

main()
