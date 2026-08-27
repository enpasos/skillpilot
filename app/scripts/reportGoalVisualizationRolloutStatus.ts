import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { basename, dirname, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { SkillLandscape } from '../src/landscapeTypes'
import { isOrdinaryAtomicGoalForVisualization } from '../../scripts/goal_visualization_scope.mjs'

type ReviewDecision =
  | 'accepted_pilot'
  | 'accepted_pilot_after_regeneration'
  | 'accepted_pilot_after_resume'
  | 'accepted_pilot_after_second_regeneration'
  | 'accepted_pilot_after_third_regeneration'
  | 'accepted_pilot_after_user_review_correction'
  | 'blocked_provider_quota'
  | 'deferred_provider_limitation'
  | 'not_generated_provider_quota'
  | 'not_requested_provider_quota'
  | 'rejected_not_linked'
  | string

interface Args {
  checkMode: boolean
  requireCoverage: boolean
  subject: string
  landscapePath: string
  reviewDirPath: string
  currentResumeFilePath: string
  currentPromptAppendDirPath: string
  outputJsonPath: string
  outputMarkdownPath: string
}

interface SubjectDefaults {
  displayName: string
  scopeName: string
  landscapePath: string
  currentResumeFilePath: string
  currentPromptAppendDirPath: string
  outputJsonPath: string
  outputMarkdownPath: string
  qualityScriptName: string
}

export interface ReviewDecisionRow {
  batch: string
  goalId: string
  title: string
  decision: ReviewDecision
  notes: string
}

interface ReviewLedger {
  batch: string
  path: string
  reviewDate: string
  status: string | null
  decisions: ReviewDecisionRow[]
}

interface GoalVisualizationRow {
  goalId: string
  title: string
  phase: string
  area: string
  reviewStatus: string
  url: string
}

interface LinkedReviewMismatchRow {
  goalId: string
  title: string
  reviewStatus: string
  url: string
  latestDecision: string | null
}

interface GoalVisualizationRolloutReport {
  schemaVersion: 1
  generatedAt: string
  generator: string
  request: {
    subject: string
    landscapePath: string
    reviewDirPath: string
    currentResumeFilePath: string
    currentPromptAppendDirPath: string
  }
  summary: {
    totalGoals: number
    atomicGoalsInScope: number
    goalsWithPrimaryVisualization: number
    coveragePercent: number
    goalsAccountedForByAssetOrDeferred: number
    accountedCoveragePercent: number
    releaseApprovedVisualizationCount: number
    reviewStatusCounts: Record<string, number>
    linkedVisualizationReviewStatuses: Record<string, number>
    reviewLedgerFiles: number
    reviewDecisionCounts: Record<string, number>
    openProviderDeferredGoals: number
    openProviderQuotaGoals: number
    blockedProviderQuotaLedgers: number
    regularUnlinkedGoals: number
    coverageGatePassed: boolean
    linkedWithoutAcceptedReview: number
    acceptedReviewWithoutLink: number
  }
  currentBatch: {
    latestLedger: string | null
    latestLedgerStatus: string | null
    resumeFile: string
    promptAppendDir: string
  }
  qualityQueues: {
    openProviderDeferred: ReviewDecisionRow[]
    openProviderQuota: ReviewDecisionRow[]
    rejectedNotLinked: ReviewDecisionRow[]
    userReviewCorrections: ReviewDecisionRow[]
  }
  consistency: {
    linkedWithoutAcceptedReview: LinkedReviewMismatchRow[]
    acceptedReviewWithoutLink: ReviewDecisionRow[]
  }
  visualizedGoals: GoalVisualizationRow[]
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '../..')

const defaultReviewDirPath = 'curricula/DE/Gymnasium/quality/goal-visualization-review'

const subjectDefaults: Record<string, SubjectDefaults> = {
  mathematik: {
    displayName: 'Mathematik',
    scopeName: 'DE Gymnasium Mathematik',
    landscapePath: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
    currentResumeFilePath: '',
    currentPromptAppendDirPath: 'tmp/goal-visualization-prompt-appends/mathematik-final-gap-2026-07-17',
    outputJsonPath: `${defaultReviewDirPath}/mathematik-rollout-status.json`,
    outputMarkdownPath: `${defaultReviewDirPath}/mathematik-rollout-status.md`,
    qualityScriptName: 'quality:goal-visualization-rollout-status',
  },
  physik: {
    displayName: 'Physik',
    scopeName: 'DE Gymnasium Physik',
    landscapePath: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json',
    currentResumeFilePath: '',
    currentPromptAppendDirPath: 'tmp/goal-visualization-prompt-appends/physik-batch-073-regeneration-2',
    outputJsonPath: `${defaultReviewDirPath}/physik-rollout-status.json`,
    outputMarkdownPath: `${defaultReviewDirPath}/physik-rollout-status.md`,
    qualityScriptName: 'quality:goal-visualization-rollout-status:physik',
  },
  chemie: {
    displayName: 'Chemie',
    scopeName: 'DE Gymnasium Chemie',
    landscapePath: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json',
    currentResumeFilePath: '',
    currentPromptAppendDirPath: 'tmp/goal-visualization-prompt-appends/chemie-deferred-2026-07-17',
    outputJsonPath: `${defaultReviewDirPath}/chemie-rollout-status.json`,
    outputMarkdownPath: `${defaultReviewDirPath}/chemie-rollout-status.md`,
    qualityScriptName: 'quality:goal-visualization-rollout-status:chemie',
  },
}

function toPosixPath(path: string): string {
  return path.split(sep).join('/')
}

function repoRelative(path: string): string {
  return toPosixPath(relative(repoRoot, path))
}

function resolveRepoPath(path: string): string {
  return resolve(repoRoot, path)
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function subjectFromArgs(argv: string[]): string {
  const subjectArg = argv.find((arg) => arg.startsWith('--subject='))
  return subjectArg?.slice('--subject='.length) ?? 'mathematik'
}

function getSubjectDefaults(subject: string): SubjectDefaults {
  const defaults = subjectDefaults[subject]
  if (!defaults) {
    throw new Error(`Unknown subject: ${subject}. Supported subjects: ${Object.keys(subjectDefaults).join(', ')}`)
  }
  return defaults
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(resolveRepoPath(path), 'utf8')) as T
}

function parseArgs(argv: string[]): Args {
  const subject = subjectFromArgs(argv)
  const defaults = getSubjectDefaults(subject)
  const args: Args = {
    checkMode: false,
    requireCoverage: false,
    subject,
    landscapePath: defaults.landscapePath,
    reviewDirPath: defaultReviewDirPath,
    currentResumeFilePath: defaults.currentResumeFilePath,
    currentPromptAppendDirPath: defaults.currentPromptAppendDirPath,
    outputJsonPath: defaults.outputJsonPath,
    outputMarkdownPath: defaults.outputMarkdownPath,
  }

  argv.forEach((arg) => {
    if (arg === '--check') {
      args.checkMode = true
      return
    }
    if (arg === '--require-coverage') {
      args.requireCoverage = true
      return
    }
    if (arg.startsWith('--subject=')) {
      return
    }
    if (arg.startsWith('--landscape=')) {
      args.landscapePath = arg.slice('--landscape='.length)
      return
    }
    if (arg.startsWith('--review-dir=')) {
      args.reviewDirPath = arg.slice('--review-dir='.length)
      return
    }
    if (arg.startsWith('--current-resume-file=')) {
      args.currentResumeFilePath = arg.slice('--current-resume-file='.length)
      return
    }
    if (arg.startsWith('--current-prompt-append-dir=')) {
      args.currentPromptAppendDirPath = arg.slice('--current-prompt-append-dir='.length)
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
    throw new Error(`Unknown argument: ${arg}`)
  })

  return args
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null
}

function countBy<T extends string>(values: T[]): Record<string, number> {
  return values.reduce<Record<string, number>>((counts, value) => {
    counts[value] = (counts[value] ?? 0) + 1
    return counts
  }, {})
}

function sortedRecord(record: Record<string, number>): Record<string, number> {
  return Object.fromEntries(Object.entries(record).sort(([left], [right]) => left.localeCompare(right)))
}

function primaryVisualizationLink(goal: SkillLandscape['goals'][number], subject: string) {
  return (goal.resourceLinks ?? []).find((link) => {
    return link.type === 'goal-visualization'
      && link.resourceType === 'image'
      && link.role === 'primary'
      && link.url.includes(`/assets/goal-visualizations/${subject}/`)
  })
}

function parseLedgerStatus(text: string): string | null {
  const match = text.match(/^(?:Batch status|Status):\s*`([^`]+)`/m)
  return match?.[1] ?? null
}

function parseLedgerReviewDate(text: string, fileName: string): string {
  const metadataDate = text.match(/^(?:Review date|Date):\s*(\d{4}-\d{2}-\d{2})\s*$/imu)?.[1]
  return metadataDate ?? fileName.match(/(\d{4}-\d{2}-\d{2})/u)?.[1] ?? ''
}

export function splitMarkdownTableRow(line: string): string[] {
  const cells: string[] = []
  let cell = ''
  let codeFenceLength = 0
  let escaped = false

  const trimmed = line.trim()
  for (let index = 0; index < trimmed.length; index += 1) {
    const character = trimmed[index]
    if (escaped) {
      cell += character
      escaped = false
      continue
    }
    if (character === '\\') {
      cell += character
      escaped = true
      continue
    }
    if (character === '`') {
      let runLength = 1
      while (trimmed[index + runLength] === '`') runLength += 1
      const run = '`'.repeat(runLength)
      if (codeFenceLength === 0) {
        codeFenceLength = runLength
      } else if (codeFenceLength === runLength) {
        codeFenceLength = 0
      }
      cell += run
      index += runLength - 1
      continue
    }
    if (character === '|' && codeFenceLength === 0) {
      cells.push(cell.trim())
      cell = ''
      continue
    }
    cell += character
  }
  cells.push(cell.trim())

  if (cells[0] === '') cells.shift()
  if (cells.at(-1) === '') cells.pop()
  return cells
}

export function parseReviewDecisionRow(line: string, batch: string): ReviewDecisionRow | null {
  if (!/^\s*\|/u.test(line)) return null
  const cells = splitMarkdownTableRow(line)
  // A small number of stable legacy curriculum IDs have an 11-character
  // final UUID-like segment. Accept those canonical IDs as table identities
  // without relaxing the requirement that the complete first cell is an ID.
  const goalId = cells[0]?.match(/^`?([0-9a-f]{8}-[0-9a-f-]{26,})`?$/iu)?.[1]
  if (!goalId) return null
  const codeCells = cells.flatMap((cell) => Array.from(cell.matchAll(/`([^`]+)`/g), (match) => match[1]))
  const decision = codeCells.find(isReviewDecision)
  if (!decision) return null
  const fallbackTitle = cells
    .slice(1)
    .find((cell) => !Array.from(cell.matchAll(/`([^`]+)`/g), (match) => match[1]).some(isReviewDecision))
    ?? ''
  return {
    batch,
    goalId,
    title: fallbackTitle.replace(/^`+|`+$/gu, '').trim(),
    decision,
    notes: cells.at(-1)?.trim() ?? '',
  }
}

function parseReviewLedger(path: string, subject: string): ReviewLedger {
  const text = readFileSync(resolveRepoPath(path), 'utf8')
  const fileName = basename(path)
  const batch = fileName.match(new RegExp(`${escapeRegExp(subject)}-batch-(\\d+)\\.md$`))?.[1]
    ?? fileName.replace(/\.md$/u, '')
  const decisions: ReviewDecisionRow[] = []

  text.split(/\r?\n/).forEach((line) => {
    const decision = parseReviewDecisionRow(line, batch)
    if (decision) decisions.push(decision)
  })

  return {
    batch,
    path,
    reviewDate: parseLedgerReviewDate(text, fileName),
    status: parseLedgerStatus(text),
    decisions,
  }
}

function loadReviewLedgers(reviewDirPath: string, subject: string): ReviewLedger[] {
  const absoluteReviewDirPath = resolveRepoPath(reviewDirPath)
  if (!existsSync(absoluteReviewDirPath)) return []
  const ledgerPattern = new RegExp(`^${escapeRegExp(subject)}-.+\\.md$`)

  return readdirSync(absoluteReviewDirPath)
    .filter((name) => ledgerPattern.test(name) && name !== `${subject}-rollout-status.md`)
    .map((name) => parseReviewLedger(`${reviewDirPath}/${name}`, subject))
    .filter((ledger) => ledger.decisions.length > 0)
    .sort((left, right) => (
      left.reviewDate.localeCompare(right.reviewDate)
      || basename(left.path).localeCompare(basename(right.path), 'en', { numeric: true })
    ))
}

function latestDecisionRows(ledgers: ReviewLedger[]): ReviewDecisionRow[] {
  const latestByGoal = new Map<string, ReviewDecisionRow>()
  ledgers.forEach((ledger) => {
    const latestByGoalInLedger = new Map<string, ReviewDecisionRow>()
    ledger.decisions.forEach((decision) => {
      // These rows explicitly document a superseded asset; the replacement's
      // own accepted row is the current evidence and may live in another
      // ledger on the same review date.
      if (/^rejected.*(?:then_)?replaced$/u.test(decision.decision)) return
      const previousDecision = latestByGoalInLedger.get(decision.goalId)
      // Correction ledgers commonly list the accepted final asset first and
      // rejected intermediate candidates afterwards. Keep the accepted final
      // disposition inside one ledger regardless of table row order.
      if (!previousDecision || !isAcceptedDecision(previousDecision.decision) || isAcceptedDecision(decision.decision)) {
        latestByGoalInLedger.set(decision.goalId, decision)
      }
    })
    latestByGoalInLedger.forEach((decision) => {
      latestByGoal.set(decision.goalId, decision)
    })
  })
  return Array.from(latestByGoal.values()).sort((left, right) => left.title.localeCompare(right.title))
}

export function isReviewDecision(decision: string | null | undefined): boolean {
  return /^(?:accepted(?:_|$)|rejected(?:_|$)|deferred_provider_limitation$|blocked_provider_quota$|not_(?:generated|requested|attempted)|correction_open_|provider_temporary_)/u.test(decision ?? '')
}

export function isAcceptedDecision(decision: string | null | undefined): boolean {
  return decision?.startsWith('accepted') === true
}

function percent(count: number, total: number): number {
  return total === 0 ? 0 : (count / total) * 100
}

function buildReport(args: Args, generatedAt: string): GoalVisualizationRolloutReport {
  const landscape = readJson<SkillLandscape>(args.landscapePath)
  const canonicalTitleByGoalId = new Map(landscape.goals.map((goal) => [goal.id, goal.title]))
  const atomicGoals = landscape.goals.filter(isOrdinaryAtomicGoalForVisualization)
  const visualizedGoals: GoalVisualizationRow[] = atomicGoals.flatMap((goal) => {
    const link = primaryVisualizationLink(goal, args.subject)
    if (!link) return []
    return [{
      goalId: goal.id,
      title: goal.title,
      phase: goal.dimensionTags.phase,
      area: goal.dimensionTags.area ?? '',
      reviewStatus: link.reviewStatus ?? 'unknown',
      url: link.url,
    }]
  }).sort((left, right) => left.title.localeCompare(right.title))

  const ledgers = loadReviewLedgers(args.reviewDirPath, args.subject).map((ledger) => ({
    ...ledger,
    decisions: ledger.decisions.map((decision) => ({
      ...decision,
      title: canonicalTitleByGoalId.get(decision.goalId) ?? decision.title,
    })),
  }))
  const decisions = ledgers.flatMap((ledger) => ledger.decisions)
  const latestDecisions = latestDecisionRows(ledgers)
  const latestDecisionByGoalId = new Map(latestDecisions.map((row) => [row.goalId, row]))
  const reviewStatusCounts = sortedRecord(countBy(visualizedGoals.map((row) => row.reviewStatus)))
  const decisionCounts = sortedRecord(countBy(decisions.map((row) => row.decision)))
  const openProviderQuota = latestDecisions.filter((row) => {
    return row.decision === 'blocked_provider_quota'
      || row.decision === 'not_generated_provider_quota'
      || row.decision === 'not_requested_provider_quota'
  })
  const rejectedNotLinked = decisions.filter((row) => row.decision === 'rejected_not_linked')
  const userReviewCorrections = decisions.filter((row) => row.decision === 'accepted_pilot_after_user_review_correction')
  const latestLedger = ledgers.at(-1)
  const releaseApprovedVisualizationCount = visualizedGoals.filter((row) => {
    return row.reviewStatus === 'released' || row.reviewStatus === 'release_approved'
  }).length
  const linkedGoalIds = new Set(visualizedGoals.map((row) => row.goalId))
  const atomicGoalIds = new Set(atomicGoals.map((goal) => goal.id))
  const openProviderDeferred = latestDecisions.filter((row) => {
    return row.decision === 'deferred_provider_limitation'
      && atomicGoalIds.has(row.goalId)
      && !linkedGoalIds.has(row.goalId)
  })
  const openProviderDeferredGoalIds = new Set(openProviderDeferred.map((row) => row.goalId))
  const regularUnlinkedGoals = atomicGoals.filter((goal) => {
    return !linkedGoalIds.has(goal.id) && !openProviderDeferredGoalIds.has(goal.id)
  })
  const linkedWithoutAcceptedReview = visualizedGoals.filter((row) => {
    return !isAcceptedDecision(latestDecisionByGoalId.get(row.goalId)?.decision)
  }).map((row) => ({
    goalId: row.goalId,
    title: row.title,
    reviewStatus: row.reviewStatus,
    url: row.url,
    latestDecision: latestDecisionByGoalId.get(row.goalId)?.decision ?? null,
  }))
  const acceptedReviewWithoutLink = latestDecisions.filter((row) => {
    return isAcceptedDecision(row.decision)
      && atomicGoalIds.has(row.goalId)
      && !linkedGoalIds.has(row.goalId)
  })
  const goalsAccountedForByAssetOrDeferred = linkedGoalIds.size + openProviderDeferredGoalIds.size

  return {
    schemaVersion: 1,
    generatedAt,
    generator: 'app/scripts/reportGoalVisualizationRolloutStatus.ts',
    request: {
      subject: args.subject,
      landscapePath: args.landscapePath,
      reviewDirPath: args.reviewDirPath,
      currentResumeFilePath: args.currentResumeFilePath,
      currentPromptAppendDirPath: args.currentPromptAppendDirPath,
    },
    summary: {
      totalGoals: landscape.goals.length,
      atomicGoalsInScope: atomicGoals.length,
      goalsWithPrimaryVisualization: visualizedGoals.length,
      coveragePercent: Number(percent(visualizedGoals.length, atomicGoals.length).toFixed(1)),
      goalsAccountedForByAssetOrDeferred,
      accountedCoveragePercent: Number(percent(goalsAccountedForByAssetOrDeferred, atomicGoals.length).toFixed(1)),
      releaseApprovedVisualizationCount,
      reviewStatusCounts,
      linkedVisualizationReviewStatuses: reviewStatusCounts,
      reviewLedgerFiles: ledgers.length,
      reviewDecisionCounts: decisionCounts,
      openProviderDeferredGoals: openProviderDeferred.length,
      openProviderQuotaGoals: openProviderQuota.length,
      blockedProviderQuotaLedgers: ledgers.filter((ledger) => ledger.status?.includes('blocked_provider_quota')).length,
      regularUnlinkedGoals: regularUnlinkedGoals.length,
      coverageGatePassed: regularUnlinkedGoals.length === 0,
      linkedWithoutAcceptedReview: linkedWithoutAcceptedReview.length,
      acceptedReviewWithoutLink: acceptedReviewWithoutLink.length,
    },
    currentBatch: {
      latestLedger: latestLedger ? latestLedger.path : null,
      latestLedgerStatus: latestLedger?.status ?? null,
      resumeFile: args.currentResumeFilePath,
      promptAppendDir: args.currentPromptAppendDirPath,
    },
    qualityQueues: {
      openProviderDeferred,
      openProviderQuota,
      rejectedNotLinked,
      userReviewCorrections,
    },
    consistency: {
      linkedWithoutAcceptedReview,
      acceptedReviewWithoutLink,
    },
    visualizedGoals,
  }
}

function existingGeneratedAt(path: string): string | null {
  if (!existsSync(resolveRepoPath(path))) return null
  try {
    const current = readJson<{ generatedAt?: unknown }>(path)
    return asString(current.generatedAt)
  } catch {
    return null
  }
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

function pushGeneratedMarkdownNotice(
  lines: string[],
  report: GoalVisualizationRolloutReport,
  defaults: SubjectDefaults,
): void {
  lines.push('> Generated artifact. Do not edit manually.')
  lines.push('>')
  lines.push('> Generated by: `app/scripts/reportGoalVisualizationRolloutStatus.ts`')
  lines.push(`> Regenerate with: \`cd app && npm run ${defaults.qualityScriptName}\``)
  lines.push('> Source of truth: `app/scripts/reportGoalVisualizationRolloutStatus.ts`')
  lines.push(`> Source of truth: \`${report.request.landscapePath}\``)
  lines.push(`> Source of truth: \`${report.request.reviewDirPath}\``)
  lines.push('')
}

function renderDecisionRows(rows: ReviewDecisionRow[], maxRows: number): string[] {
  if (rows.length === 0) return ['Keine Eintraege.', '']
  const lines = markdownTable(
    ['Batch', 'Goal ID', 'Title', 'Decision'],
    rows.slice(0, maxRows).map((row) => [row.batch, `\`${row.goalId}\``, row.title, `\`${row.decision}\``]),
  )
  if (rows.length > maxRows) {
    lines.push('')
    lines.push(`Weitere ${rows.length - maxRows} Eintraege stehen in der JSON-Begleitdatei.`)
  }
  lines.push('')
  return lines
}

function renderLinkedReviewMismatchRows(rows: LinkedReviewMismatchRow[], maxRows: number): string[] {
  if (rows.length === 0) return ['Keine Eintraege.', '']
  const lines = markdownTable(
    ['Goal ID', 'Title', 'Link status', 'Latest ledger decision'],
    rows.slice(0, maxRows).map((row) => [
      `\`${row.goalId}\``,
      row.title,
      `\`${row.reviewStatus}\``,
      row.latestDecision ? `\`${row.latestDecision}\`` : '-',
    ]),
  )
  if (rows.length > maxRows) {
    lines.push('')
    lines.push(`Weitere ${rows.length - maxRows} Eintraege stehen in der JSON-Begleitdatei.`)
  }
  lines.push('')
  return lines
}

function renderMarkdown(report: GoalVisualizationRolloutReport): string {
  const { summary } = report
  const defaults = getSubjectDefaults(report.request.subject)
  const lines: string[] = [`# ${defaults.displayName} Goal Visualization Rollout Status`, '']
  pushGeneratedMarkdownNotice(lines, report, defaults)
  lines.push(`Generated: ${report.generatedAt}`)
  lines.push('')
  lines.push(`Scope: canonical \`${defaults.scopeName}\`, atomic goal visualizations.`)
  lines.push('')
  lines.push('## Current Coverage')
  lines.push('')
  lines.push(...markdownTable(
    ['Metric', 'Value'],
    [
      ['Alle Ziele in der Landschaft', summary.totalGoals],
      ['Atomare Ziele im Visualisierungs-Scope', summary.atomicGoalsInScope],
      ['Ziele mit primaerem Visualisierungslink', summary.goalsWithPrimaryVisualization],
      ['Coverage', `${summary.coveragePercent.toFixed(1)}%`],
      ['Durch Asset oder Provider-Deferred dokumentierte Ziele', summary.goalsAccountedForByAssetOrDeferred],
      ['Dokumentierte Coverage', `${summary.accountedCoveragePercent.toFixed(1)}%`],
      ['Coverage-Gate', summary.coverageGatePassed ? 'bestanden' : 'nicht bestanden'],
      ['Release-approved Visualisierungen', summary.releaseApprovedVisualizationCount],
      ['Review-Ledger-Dateien', summary.reviewLedgerFiles],
      ['Offene Provider-Deferred-Ziele', summary.openProviderDeferredGoals],
      ['Offene Provider-Quota-Ziele', summary.openProviderQuotaGoals],
      ['Provider-Quota-blockierte Ledger', summary.blockedProviderQuotaLedgers],
      ['Regulaere unvisualisierte Ziele ohne Deferred-Status', summary.regularUnlinkedGoals],
      ['Verlinkt ohne akzeptierende Review-Entscheidung', summary.linkedWithoutAcceptedReview],
      ['Akzeptierende Review-Entscheidung ohne Link', summary.acceptedReviewWithoutLink],
    ],
  ))
  lines.push('')
  lines.push('## Linked Review Status')
  lines.push('')
  lines.push(...markdownTable(
    ['Status', 'Count'],
    Object.entries(summary.linkedVisualizationReviewStatuses).map(([status, count]) => [`\`${status}\``, count]),
  ))
  lines.push('')
  lines.push('## Ledger Decisions')
  lines.push('')
  lines.push(...markdownTable(
    ['Decision', 'Count'],
    Object.entries(summary.reviewDecisionCounts).map(([decision, count]) => [`\`${decision}\``, count]),
  ))
  lines.push('')
  lines.push('## Current Batch')
  lines.push('')
  lines.push(...markdownTable(
    ['Metric', 'Value'],
    [
      ['Latest ledger', report.currentBatch.latestLedger ? `\`${report.currentBatch.latestLedger}\`` : '-'],
      ['Latest ledger status', report.currentBatch.latestLedgerStatus ? `\`${report.currentBatch.latestLedgerStatus}\`` : '-'],
      ['Configured resume file', report.currentBatch.resumeFile ? `\`${report.currentBatch.resumeFile}\`` : '-'],
      ['Configured prompt append dir', `\`${report.currentBatch.promptAppendDir}\``],
    ],
  ))
  lines.push('')
  lines.push('## Interpretation')
  lines.push('')
  lines.push('- Die aktuellen Assets sind kuratierte Pilot-Assets; extern release-approved ist noch nichts.')
  lines.push('- Neue Bilder bleiben erst `--no-import`-Kandidaten und werden erst nach visueller und fachlicher Kontrolle in die Landschaft gelinkt.')
  lines.push('- Das Coverage-Gate erlaubt nur Ziele mit aktivem primaerem Asset oder einer aktuellen `deferred_provider_limitation`-Entscheidung; regulaer fehlende Ziele lassen das Gate scheitern.')
  if (summary.regularUnlinkedGoals === 0 && summary.openProviderDeferredGoals > 0) {
    lines.push(`- Es gibt keine regulaeren unvisualisierten Ziele ohne Deferred-Status mehr; offen sind nur ${summary.openProviderDeferredGoals} Provider-Deferred-Ziel(e).`)
  } else {
    lines.push('- Der aktuelle Batch hat kein offenes Resume; der naechste produktive Schritt ist die Planung eines neuen Batches.')
  }
  lines.push('')
  lines.push('## Quality Queues')
  lines.push('')
  lines.push('### Open Provider Deferred')
  lines.push('')
  lines.push(...renderDecisionRows(report.qualityQueues.openProviderDeferred, 20))
  lines.push('### Open Provider Quota')
  lines.push('')
  lines.push(...renderDecisionRows(report.qualityQueues.openProviderQuota, 20))
  lines.push('### Rejected Not Linked')
  lines.push('')
  lines.push(...renderDecisionRows(report.qualityQueues.rejectedNotLinked, 20))
  lines.push('### User Review Corrections')
  lines.push('')
  lines.push(...renderDecisionRows(report.qualityQueues.userReviewCorrections, 20))
  lines.push('## Review/Link Consistency')
  lines.push('')
  lines.push('### Linked Without Accepted Review')
  lines.push('')
  lines.push(...renderLinkedReviewMismatchRows(report.consistency.linkedWithoutAcceptedReview, 30))
  lines.push('### Accepted Review Without Link')
  lines.push('')
  lines.push(...renderDecisionRows(report.consistency.acceptedReviewWithoutLink, 30))
  lines.push('## Next Command')
  lines.push('')
  lines.push('```bash')
  if (summary.regularUnlinkedGoals === 0 && summary.openProviderDeferredGoals > 0) {
    lines.push(`npm --prefix app run visualization:plan-batch -- --count 6 --landscape ${report.request.landscapePath} --output tmp/goal-visualization-${report.request.subject}-next-batch.txt --include-deferred`)
  } else {
    lines.push(`npm --prefix app run visualization:plan-batch -- --count 6 --landscape ${report.request.landscapePath} --output tmp/goal-visualization-${report.request.subject}-next-batch.txt`)
  }
  lines.push('```')
  lines.push('')
  if (summary.regularUnlinkedGoals === 0 && summary.openProviderDeferredGoals > 0) {
    lines.push('Use this only for an intentional provider-limitation revisit. Generated candidates still require full mathematical review before import; otherwise keep the existing deferred ledger decisions.')
  } else {
    lines.push('After planning a batch: create prompt append files, generate candidates with `--no-import`, inspect, reject or regenerate faulty images, import only accepted candidates, deploy assets, update the batch ledger, and run validation.')
  }
  lines.push('')
  lines.push('## Sources')
  lines.push('')
  lines.push(`- Landscape: \`${report.request.landscapePath}\``)
  lines.push(`- Review ledgers: \`${report.request.reviewDirPath}\``)
  if (report.request.currentResumeFilePath) {
    lines.push(`- Resume file: \`${report.request.currentResumeFilePath}\``)
  }
  lines.push(`- Prompt append dir: \`${report.request.currentPromptAppendDirPath}\``)
  lines.push('')
  return `${lines.join('\n')}\n`
}

export function coverageGateFailure(report: {
  request: { subject: string }
  summary: { regularUnlinkedGoals: number }
}): string | null {
  if (report.summary.regularUnlinkedGoals === 0) return null
  return `${report.request.subject}: coverage gate failed: ${report.summary.regularUnlinkedGoals} ordinary atomic goal(s) have neither a primary visualization nor a current deferred_provider_limitation decision.`
}

function writeOrCheck(args: Args, report: GoalVisualizationRolloutReport): void {
  const defaults = getSubjectDefaults(args.subject)
  const regenerateCommand = `cd app && npm run ${defaults.qualityScriptName}`
  const renderedJson = `${JSON.stringify(report, null, 2)}\n`
  const renderedMarkdown = renderMarkdown(report)
  if (args.checkMode) {
    const failures: string[] = []
    const jsonPath = resolveRepoPath(args.outputJsonPath)
    const markdownPath = resolveRepoPath(args.outputMarkdownPath)
    if (!existsSync(jsonPath)) {
      failures.push(`${args.outputJsonPath} does not exist. Run: ${regenerateCommand}`)
    } else if (readFileSync(jsonPath, 'utf8') !== renderedJson) {
      failures.push(`${args.outputJsonPath} is stale. Run: ${regenerateCommand}`)
    }
    if (!existsSync(markdownPath)) {
      failures.push(`${args.outputMarkdownPath} does not exist. Run: ${regenerateCommand}`)
    } else if (readFileSync(markdownPath, 'utf8') !== renderedMarkdown) {
      failures.push(`${args.outputMarkdownPath} is stale. Run: ${regenerateCommand}`)
    }
    const coverageFailure = args.requireCoverage ? coverageGateFailure(report) : null
    if (coverageFailure) failures.push(coverageFailure)
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
  console.log(`Wrote ${repoRelative(resolveRepoPath(args.outputJsonPath))}`)
  console.log(`Wrote ${repoRelative(resolveRepoPath(args.outputMarkdownPath))}`)
  const coverageFailure = args.requireCoverage ? coverageGateFailure(report) : null
  if (coverageFailure) {
    console.error(coverageFailure)
    process.exit(1)
  }
}

function main(): void {
  const args = parseArgs(process.argv.slice(2))
  const generatedAt = args.checkMode
    ? existingGeneratedAt(args.outputJsonPath) ?? new Date().toISOString()
    : new Date().toISOString()
  const report = buildReport(args, generatedAt)
  writeOrCheck(args, report)
}

const invokedScriptPath = process.argv[1] ? resolve(process.argv[1]) : ''
if (invokedScriptPath === fileURLToPath(import.meta.url)) {
  main()
}
