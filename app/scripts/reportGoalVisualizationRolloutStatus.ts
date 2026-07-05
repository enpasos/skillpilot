import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { LearningGoal, LearningLandscape } from '../src/landscapeTypes'

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

interface ReviewDecisionRow {
  batch: string
  goalId: string
  title: string
  decision: ReviewDecision
  notes: string
}

interface ReviewLedger {
  batch: string
  path: string
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
    releaseApprovedVisualizationCount: number
    reviewStatusCounts: Record<string, number>
    linkedVisualizationReviewStatuses: Record<string, number>
    reviewLedgerFiles: number
    reviewDecisionCounts: Record<string, number>
    openProviderDeferredGoals: number
    openProviderQuotaGoals: number
    blockedProviderQuotaLedgers: number
    regularUnlinkedGoals: number
    linkedWithoutAcceptedReview: number
    acceptedReviewWithoutLink: number
  }
  currentBatch: {
    latestLedger: string | null
    latestLedgerStatus: string | null
    resumeFile: string
    resumeFileExists: boolean
    resumeGoalIds: string[]
    promptAppendDir: string
    promptAppendDirExists: boolean
    promptAppendFiles: number
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
    currentResumeFilePath: 'tmp/goal-visualization-batch-076.resume.txt',
    currentPromptAppendDirPath: 'tmp/goal-visualization-prompt-appends/batch-076',
    outputJsonPath: `${defaultReviewDirPath}/mathematik-rollout-status.json`,
    outputMarkdownPath: `${defaultReviewDirPath}/mathematik-rollout-status.md`,
    qualityScriptName: 'quality:goal-visualization-rollout-status',
  },
  physik: {
    displayName: 'Physik',
    scopeName: 'DE Gymnasium Physik',
    landscapePath: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json',
    currentResumeFilePath: 'tmp/goal-visualization-physik-batch-057.resume.txt',
    currentPromptAppendDirPath: 'tmp/goal-visualization-prompt-appends/physik-batch-057',
    outputJsonPath: `${defaultReviewDirPath}/physik-rollout-status.json`,
    outputMarkdownPath: `${defaultReviewDirPath}/physik-rollout-status.md`,
    qualityScriptName: 'quality:goal-visualization-rollout-status:physik',
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

function hasChildren(goal: LearningGoal): boolean {
  return Array.isArray(goal.contains) && goal.contains.length > 0
}

function isAtomicVisualizationGoal(goal: LearningGoal): boolean {
  const tags = goal.tags ?? []
  return !hasChildren(goal)
    && goal.nodeKind !== 'memory'
    && goal.nodeKind !== 'exam'
    && goal.nodeKind !== 'tutor'
    && goal.examData === undefined
    && !tags.includes('memorization')
    && !tags.some((tag) => tag.startsWith('srs-deck:'))
}

function primaryVisualizationLink(goal: LearningGoal, subject: string) {
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

function parseReviewLedger(path: string, subject: string): ReviewLedger {
  const text = readFileSync(resolveRepoPath(path), 'utf8')
  const batch = path.match(new RegExp(`${escapeRegExp(subject)}-batch-(\\d+)\\.md$`))?.[1] ?? path
  const decisions: ReviewDecisionRow[] = []

  text.split(/\r?\n/).forEach((line) => {
    const match = line.match(/^\|\s*`([0-9a-f-]+)`\s*\|\s*([^|]+?)\s*\|\s*`([^`]+)`\s*\|\s*(.*?)\s*\|$/i)
    if (!match) return
    decisions.push({
      batch,
      goalId: match[1],
      title: match[2].trim(),
      decision: match[3].trim(),
      notes: match[4].trim(),
    })
  })

  return {
    batch,
    path,
    status: parseLedgerStatus(text),
    decisions,
  }
}

function loadReviewLedgers(reviewDirPath: string, subject: string): ReviewLedger[] {
  const absoluteReviewDirPath = resolveRepoPath(reviewDirPath)
  if (!existsSync(absoluteReviewDirPath)) return []
  const ledgerPattern = new RegExp(`^${escapeRegExp(subject)}-batch-\\d+\\.md$`)

  return readdirSync(absoluteReviewDirPath)
    .filter((name) => ledgerPattern.test(name))
    .sort()
    .map((name) => parseReviewLedger(`${reviewDirPath}/${name}`, subject))
}

function latestDecisionRows(ledgers: ReviewLedger[]): ReviewDecisionRow[] {
  const latestByGoal = new Map<string, ReviewDecisionRow>()
  ledgers.forEach((ledger) => {
    const latestByGoalInLedger = new Map<string, ReviewDecisionRow>()
    ledger.decisions.forEach((decision) => {
      const previousDecision = latestByGoalInLedger.get(decision.goalId)
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

function isAcceptedDecision(decision: string | null | undefined): boolean {
  return decision?.startsWith('accepted_pilot') === true
}

function readResumeGoalIds(path: string): string[] {
  const absolutePath = resolveRepoPath(path)
  if (!existsSync(absolutePath)) return []
  return readFileSync(absolutePath, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'))
}

function countPromptAppendFiles(path: string): number {
  const absolutePath = resolveRepoPath(path)
  if (!existsSync(absolutePath)) return 0
  return readdirSync(absolutePath).filter((name) => name.endsWith('.md')).length
}

function percent(count: number, total: number): number {
  return total === 0 ? 0 : (count / total) * 100
}

function buildReport(args: Args, generatedAt: string): GoalVisualizationRolloutReport {
  const landscape = readJson<LearningLandscape>(args.landscapePath)
  const atomicGoals = landscape.goals.filter(isAtomicVisualizationGoal)
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

  const ledgers = loadReviewLedgers(args.reviewDirPath, args.subject)
  const decisions = ledgers.flatMap((ledger) => ledger.decisions)
  const latestDecisions = latestDecisionRows(ledgers)
  const latestDecisionByGoalId = new Map(latestDecisions.map((row) => [row.goalId, row]))
  const reviewStatusCounts = sortedRecord(countBy(visualizedGoals.map((row) => row.reviewStatus)))
  const decisionCounts = sortedRecord(countBy(decisions.map((row) => row.decision)))
  const openProviderDeferred = latestDecisions.filter((row) => row.decision === 'deferred_provider_limitation')
  const openProviderQuota = latestDecisions.filter((row) => {
    return row.decision === 'blocked_provider_quota'
      || row.decision === 'not_generated_provider_quota'
      || row.decision === 'not_requested_provider_quota'
  })
  const rejectedNotLinked = decisions.filter((row) => row.decision === 'rejected_not_linked')
  const userReviewCorrections = decisions.filter((row) => row.decision === 'accepted_pilot_after_user_review_correction')
  const latestLedger = ledgers.at(-1)
  const resumeGoalIds = readResumeGoalIds(args.currentResumeFilePath)
  const promptAppendDirPath = resolveRepoPath(args.currentPromptAppendDirPath)
  const releaseApprovedVisualizationCount = visualizedGoals.filter((row) => {
    return row.reviewStatus === 'released' || row.reviewStatus === 'release_approved'
  }).length
  const linkedGoalIds = new Set(visualizedGoals.map((row) => row.goalId))
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
    return isAcceptedDecision(row.decision) && !linkedGoalIds.has(row.goalId)
  })

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
      releaseApprovedVisualizationCount,
      reviewStatusCounts,
      linkedVisualizationReviewStatuses: reviewStatusCounts,
      reviewLedgerFiles: ledgers.length,
      reviewDecisionCounts: decisionCounts,
      openProviderDeferredGoals: openProviderDeferred.length,
      openProviderQuotaGoals: openProviderQuota.length,
      blockedProviderQuotaLedgers: ledgers.filter((ledger) => ledger.status?.includes('blocked_provider_quota')).length,
      regularUnlinkedGoals: regularUnlinkedGoals.length,
      linkedWithoutAcceptedReview: linkedWithoutAcceptedReview.length,
      acceptedReviewWithoutLink: acceptedReviewWithoutLink.length,
    },
    currentBatch: {
      latestLedger: latestLedger ? latestLedger.path : null,
      latestLedgerStatus: latestLedger?.status ?? null,
      resumeFile: args.currentResumeFilePath,
      resumeFileExists: existsSync(resolveRepoPath(args.currentResumeFilePath)),
      resumeGoalIds,
      promptAppendDir: args.currentPromptAppendDirPath,
      promptAppendDirExists: existsSync(promptAppendDirPath),
      promptAppendFiles: countPromptAppendFiles(args.currentPromptAppendDirPath),
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
  const hasCurrentResumeWork = report.currentBatch.resumeFileExists && report.currentBatch.resumeGoalIds.length > 0
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
      ['Resume file', `\`${report.currentBatch.resumeFile}\``],
      ['Resume file exists', report.currentBatch.resumeFileExists ? 'yes' : 'no'],
      ['Resume goals', report.currentBatch.resumeGoalIds.length],
      ['Prompt append dir', `\`${report.currentBatch.promptAppendDir}\``],
      ['Prompt append dir exists', report.currentBatch.promptAppendDirExists ? 'yes' : 'no'],
      ['Prompt append files', report.currentBatch.promptAppendFiles],
    ],
  ))
  lines.push('')
  lines.push('## Interpretation')
  lines.push('')
  lines.push('- Die aktuellen Assets sind kuratierte Pilot-Assets; extern release-approved ist noch nichts.')
  lines.push('- Neue Bilder bleiben erst `--no-import`-Kandidaten und werden erst nach visueller und fachlicher Kontrolle in die Landschaft gelinkt.')
  if (hasCurrentResumeWork) {
    lines.push(`- Im aktuellen Resume stehen ${report.currentBatch.resumeGoalIds.length} Ziel(e); der naechste produktive Schritt ist ein spaeterer Resume-Lauf, sobald Provider-Kapazitaet verfuegbar ist.`)
  } else if (summary.regularUnlinkedGoals === 0 && summary.openProviderDeferredGoals > 0) {
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
  lines.push(hasCurrentResumeWork ? '## Next Command When Quota Is Available' : '## Next Command')
  lines.push('')
  lines.push('```bash')
  if (hasCurrentResumeWork) {
    lines.push('npm --prefix app run visualization:generate:nano-banana:batch -- \\')
    lines.push(`  --file ${report.currentBatch.resumeFile} \\`)
    lines.push('  --continue-on-error \\')
    lines.push('  --no-import \\')
    lines.push(`  --prompt-append-dir=${report.currentBatch.promptAppendDir}`)
  } else if (summary.regularUnlinkedGoals === 0 && summary.openProviderDeferredGoals > 0) {
    lines.push(`npm --prefix app run visualization:plan-batch -- --count 6 --landscape ${report.request.landscapePath} --output tmp/goal-visualization-${report.request.subject}-next-batch.txt --include-deferred`)
  } else {
    lines.push(`npm --prefix app run visualization:plan-batch -- --count 6 --landscape ${report.request.landscapePath} --output tmp/goal-visualization-${report.request.subject}-next-batch.txt`)
  }
  lines.push('```')
  lines.push('')
  if (hasCurrentResumeWork) {
    lines.push('After generated candidates exist: inspect, reject or regenerate faulty images, import only accepted candidates, deploy assets, update the batch ledger, and run validation.')
  } else if (summary.regularUnlinkedGoals === 0 && summary.openProviderDeferredGoals > 0) {
    lines.push('Use this only for an intentional provider-limitation revisit. Generated candidates still require full mathematical review before import; otherwise keep the existing deferred ledger decisions.')
  } else {
    lines.push('After planning a batch: create prompt append files, generate candidates with `--no-import`, inspect, reject or regenerate faulty images, import only accepted candidates, deploy assets, update the batch ledger, and run validation.')
  }
  lines.push('')
  lines.push('## Sources')
  lines.push('')
  lines.push(`- Landscape: \`${report.request.landscapePath}\``)
  lines.push(`- Review ledgers: \`${report.request.reviewDirPath}\``)
  lines.push(`- Resume file: \`${report.request.currentResumeFilePath}\``)
  lines.push(`- Prompt append dir: \`${report.request.currentPromptAppendDirPath}\``)
  lines.push('')
  return `${lines.join('\n')}\n`
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
}

function main(): void {
  const args = parseArgs(process.argv.slice(2))
  const generatedAt = args.checkMode
    ? existingGeneratedAt(args.outputJsonPath) ?? new Date().toISOString()
    : new Date().toISOString()
  const report = buildReport(args, generatedAt)
  writeOrCheck(args, report)
}

main()
