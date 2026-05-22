import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { LearningGoal, LearningLandscape } from '../src/landscapeTypes'
import { JURISDICTION_LABELS } from '../src/utils/jurisdictionMetadata'
import type { ApplicabilityEvidence } from './applicabilityCompiler'
import { buildApplicabilityCompilation } from './applicabilityCompiler'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '../..')
const statusDir = resolve(repoRoot, 'docs/qa-ci/status')
const auditJsonPath = resolve(statusDir, 'curriculum-source-coverage-audit.json')
const auditMarkdownPath = resolve(statusDir, 'curriculum-source-coverage-audit.md')
const surrogateEvidencePath = resolve(
  repoRoot,
  'curricula/DE/Gymnasium/provenance/canonical-goal-surrogate-evidence-registry.json',
)

const TARGET_LANDSCAPE_IDS = [
  '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced',
  '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a',
]

type CoverageStatus = 'covered' | 'partial' | 'error' | 'none'

interface GoalReference {
  goalId: string
  title: string
}

interface JurisdictionAudit {
  jurisdiction: string
  labelDe: string
  labelEn: string
  status: CoverageStatus
  viewStatus: CoverageStatus
  sourceBackedAtomicGoals: number
  surrogateBackedAtomicGoals: number
  missingSourceBackedAtomicGoals: number
  visibleAtomicGoals: number
  visibleCoveredAtomicGoals: number
  nonVisibleMissingSourceBackedAtomicGoals: number
  unsupportedAssignedAtomicGoals: number
  partialSourceLinkedAtomicGoals: number
  projectionWarnings: number
  projectionErrors: number
  missingSourceBackedAtomicGoalIds: GoalReference[]
  unsupportedAssignedAtomicGoalIds: GoalReference[]
}

interface CurriculumAudit {
  landscapeId: string
  title: string
  file: string
  totalAtomicGoals: number
  summary: CurriculumAuditSummary
  jurisdictions: JurisdictionAudit[]
}

interface CurriculumAuditSummary {
  jurisdictions: number
  coveredJurisdictions: number
  partialJurisdictions: number
  errorJurisdictions: number
  coveredViews: number
  partialViews: number
  errorViews: number
  unsupportedVisibleAtomicGoals: number
  nonVisibleMissingSourceBackedAtomicGoals: number
}

interface SourceCoverageAudit {
  schemaVersion: 1
  generatedAt: string
  generatedBy: string
  evidencePolicy: {
    sourceBackedEvidenceKinds: Array<'provenance' | 'mapping'>
    surrogateEvidenceKinds: Array<'requires-closure'>
    nonCoverageEvidenceKinds: Array<'override' | 'child-union' | 'requires-closure'>
  }
  curricula: CurriculumAudit[]
}

interface SurrogateEvidenceEntry {
  landscapeId?: string
  goalId?: string
  jurisdiction?: string
  evidenceType?: 'requires-closure'
  requiredByGoalId?: string
  status?: 'accepted' | 'rejected' | 'stale'
  rationale?: string
}

type CoverageReport = ReturnType<typeof buildApplicabilityCompilation>['reports'][number]
type CoverageGoalReport = CoverageReport['goals'][number]

function readLandscapeForReport(report: CoverageReport): LearningLandscape | null {
  const absolutePath = resolve(repoRoot, report.file)
  if (!existsSync(absolutePath)) return null
  return JSON.parse(readFileSync(absolutePath, 'utf8')) as LearningLandscape
}

function isMemoryGoal(goal: LearningGoal): boolean {
  const tags = goal.tags ?? []
  return goal.nodeKind === 'memory'
    || tags.includes('memorization')
    || tags.some((tag) => tag.startsWith('srs-deck:'))
}

function isPracticeOrAssessmentGoal(goal: LearningGoal): boolean {
  return (goal.tags ?? []).includes('Practice') || (goal.tags ?? []).includes('Assessment')
}

function isCurriculumSourceCoverageGoal(goal: LearningGoal | undefined): boolean {
  if (!goal) return true
  if (isMemoryGoal(goal) || isPracticeOrAssessmentGoal(goal)) return false
  const tags = goal.tags ?? []
  if (tags.includes('Motivation') || tags.includes('Orientation')) return false
  if (goal.examData) return false
  return true
}

function hasSourceBackedJurisdictionEvidence(
  evidence: ApplicabilityEvidence,
  jurisdiction: string,
): boolean {
  return evidence.dimension === 'jurisdiction'
    && evidence.value === jurisdiction
    && (evidence.kind === 'provenance' || evidence.kind === 'mapping')
}

function hasPassgenauJurisdictionEvidence(
  evidence: ApplicabilityEvidence,
  jurisdiction: string,
): boolean {
  return evidence.dimension === 'jurisdiction'
    && evidence.value === jurisdiction
    && (evidence.kind === 'provenance' || (evidence.kind === 'mapping' && evidence.mappingStrength !== 'partial'))
}

function hasDirectSourceBackedJurisdictionEvidence(
  goal: CoverageGoalReport,
  jurisdiction: string,
): boolean {
  return goal.evidence.some((entry) => hasSourceBackedJurisdictionEvidence(entry, jurisdiction))
}

function hasPartialSourceLinkedJurisdictionEvidence(
  goal: CoverageGoalReport,
  jurisdiction: string,
): boolean {
  const matchingEvidence = goal.evidence.filter((entry) =>
    entry.dimension === 'jurisdiction' && entry.value === jurisdiction)
  return matchingEvidence.length > 0
    && !matchingEvidence.some((entry) => hasPassgenauJurisdictionEvidence(entry, jurisdiction))
    && matchingEvidence.some((entry) => entry.kind === 'mapping' && entry.mappingStrength === 'partial')
}

function surrogateEvidenceKey(landscapeId: string, goalId: string, jurisdiction: string): string {
  return [landscapeId, goalId, jurisdiction].join('|')
}

function readAcceptedSurrogateEvidenceByKey(): Map<string, SurrogateEvidenceEntry[]> {
  const entriesByKey = new Map<string, SurrogateEvidenceEntry[]>()
  if (!existsSync(surrogateEvidencePath)) return entriesByKey
  const registry = JSON.parse(readFileSync(surrogateEvidencePath, 'utf8')) as { entries?: SurrogateEvidenceEntry[] }
  for (const entry of registry.entries ?? []) {
    if (
      entry.status !== 'accepted'
      || entry.evidenceType !== 'requires-closure'
      || typeof entry.landscapeId !== 'string'
      || typeof entry.goalId !== 'string'
      || typeof entry.jurisdiction !== 'string'
      || typeof entry.requiredByGoalId !== 'string'
      || typeof entry.rationale !== 'string'
      || entry.rationale.trim().length === 0
    ) {
      continue
    }
    const key = surrogateEvidenceKey(entry.landscapeId, entry.goalId, entry.jurisdiction)
    entriesByKey.set(key, [...(entriesByKey.get(key) ?? []), entry])
  }
  return entriesByKey
}

function hasReviewedRequiresClosureSurrogateEvidence(
  report: CoverageReport,
  goal: CoverageGoalReport,
  jurisdiction: string,
  surrogateEntriesByKey: Map<string, SurrogateEvidenceEntry[]>,
  visitedGoalIds: Set<string> = new Set(),
): boolean {
  const entries = surrogateEntriesByKey.get(surrogateEvidenceKey(report.landscapeId, goal.goalId, jurisdiction)) ?? []
  if (entries.length === 0) return false
  const goalById = new Map(report.goals.map((candidate) => [candidate.goalId, candidate]))

  return entries.some((entry) => {
    const requiredByGoalId = entry.requiredByGoalId!
    const requiredByGoal = goalById.get(requiredByGoalId)
    if (!requiredByGoal || visitedGoalIds.has(requiredByGoalId)) return false

    return goal.evidence.some((evidence) =>
      evidence.kind === 'requires-closure'
      && evidence.dimension === 'jurisdiction'
      && evidence.value === jurisdiction
      && evidence.source === `required by ${requiredByGoalId}`)
      && hasCoverageBackedJurisdictionEvidence(
        report,
        requiredByGoal,
        jurisdiction,
        surrogateEntriesByKey,
        new Set([...visitedGoalIds, goal.goalId]),
      )
  })
}

function hasCoverageBackedJurisdictionEvidence(
  report: CoverageReport,
  goal: CoverageGoalReport,
  jurisdiction: string,
  surrogateEntriesByKey: Map<string, SurrogateEvidenceEntry[]>,
  visitedGoalIds: Set<string> = new Set(),
): boolean {
  return hasDirectSourceBackedJurisdictionEvidence(goal, jurisdiction)
    || hasReviewedRequiresClosureSurrogateEvidence(report, goal, jurisdiction, surrogateEntriesByKey, visitedGoalIds)
}

function roundPercent(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0
  return Math.round((numerator / denominator) * 1000) / 10
}

function buildCurriculumAuditSummary(jurisdictions: JurisdictionAudit[]): CurriculumAuditSummary {
  return {
    jurisdictions: jurisdictions.length,
    coveredJurisdictions: jurisdictions.filter((entry) => entry.status === 'covered').length,
    partialJurisdictions: jurisdictions.filter((entry) => entry.status === 'partial').length,
    errorJurisdictions: jurisdictions.filter((entry) => entry.status === 'error').length,
    coveredViews: jurisdictions.filter((entry) => entry.viewStatus === 'covered').length,
    partialViews: jurisdictions.filter((entry) => entry.viewStatus === 'partial').length,
    errorViews: jurisdictions.filter((entry) => entry.viewStatus === 'error').length,
    unsupportedVisibleAtomicGoals: jurisdictions.reduce(
      (sum, entry) => sum + entry.unsupportedAssignedAtomicGoals,
      0,
    ),
    nonVisibleMissingSourceBackedAtomicGoals: jurisdictions.reduce(
      (sum, entry) => sum + entry.nonVisibleMissingSourceBackedAtomicGoals,
      0,
    ),
  }
}

function renderMarkdown(audit: SourceCoverageAudit): string {
  const lines: string[] = []
  lines.push('# Curriculum Source Coverage Audit')
  lines.push('')
  lines.push(`Generated: ${audit.generatedAt}`)
  lines.push('')
  lines.push('This audit separates inhaltliche Abdeckung from passgenaue Zuordnung. `provenance`, reviewed `mapping` entries including `partial`, and explicitly reviewed requires-closure surrogate entries count as Lehrplan evidence; `partial` mappings remain visible as quality warnings. `override`, `child-union`, and automatic `requires-closure` do not count as source coverage.')
  lines.push('')
  lines.push('`Covered` means direct source/mapping evidence plus explicitly accepted surrogate evidence. `Direct` excludes surrogate evidence; `Surrogate-only` is the accepted requires-closure bridge count. `View status` only evaluates the currently visible projection.')
  lines.push('')
  lines.push('Memory/SRS, practice, assessment, motivation, orientation, and `examData` goals are excluded from the source-coverage denominator; memory traceability is handled by the separate memory-card review.')
  lines.push('')
  lines.push('This file is a raw Applicability compiler audit. The Workbench `Curriculum Quality` cards use the composition-view based counters in `curriculum-quality-status.json`, including extracted source atoms and fully covered source original goals.')
  lines.push('')

  for (const curriculum of audit.curricula) {
    lines.push(`## ${curriculum.title}`)
    lines.push('')
    lines.push(`Source-coverage atomic goals: ${curriculum.totalAtomicGoals}`)
    lines.push(`Global status: ${curriculum.summary.coveredJurisdictions}/${curriculum.summary.jurisdictions} covered, ${curriculum.summary.partialJurisdictions} partial, ${curriculum.summary.errorJurisdictions} error.`)
    lines.push(`View status: ${curriculum.summary.coveredViews}/${curriculum.summary.jurisdictions} covered, ${curriculum.summary.partialViews} partial, ${curriculum.summary.errorViews} error.`)
    lines.push(`Unsupported visible atomic goals: ${curriculum.summary.unsupportedVisibleAtomicGoals}. Non-visible missing source-backed atomic goals: ${curriculum.summary.nonVisibleMissingSourceBackedAtomicGoals}.`)
    lines.push('')
    lines.push('| Bundesland | Status | View status | Covered | Direct | Surrogate-only | Missing | Visible | Visible covered | Unsupported visible | Partial source links | Warnings | Errors |')
    lines.push('| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |')
    for (const entry of curriculum.jurisdictions) {
      const sourcePercent = roundPercent(entry.sourceBackedAtomicGoals, curriculum.totalAtomicGoals)
      const directSourceBackedAtomicGoals = Math.max(
        0,
        entry.sourceBackedAtomicGoals - entry.surrogateBackedAtomicGoals,
      )
      lines.push(`| ${entry.jurisdiction} | ${entry.status} | ${entry.viewStatus} | ${entry.sourceBackedAtomicGoals}/${curriculum.totalAtomicGoals} (${sourcePercent}%) | ${directSourceBackedAtomicGoals} | ${entry.surrogateBackedAtomicGoals} | ${entry.missingSourceBackedAtomicGoals} | ${entry.visibleAtomicGoals} | ${entry.visibleCoveredAtomicGoals} | ${entry.unsupportedAssignedAtomicGoals} | ${entry.partialSourceLinkedAtomicGoals} | ${entry.projectionWarnings} | ${entry.projectionErrors} |`)
    }
    lines.push('')
  }

  return `${lines.join('\n')}\n`
}

function buildAudit(): SourceCoverageAudit {
  const compilation = buildApplicabilityCompilation()
  const targetIds = new Set(TARGET_LANDSCAPE_IDS)
  const surrogateEntriesByKey = readAcceptedSurrogateEvidenceByKey()
  const curricula: CurriculumAudit[] = []

  for (const report of compilation.reports) {
    if (!targetIds.has(report.landscapeId)) continue
    const landscape = readLandscapeForReport(report)
    const goalById = new Map((landscape?.goals ?? []).map((goal) => [goal.id, goal]))
    const atomicGoals = report.goals.filter((goal) =>
      goal.goalType === 'atomic' && isCurriculumSourceCoverageGoal(goalById.get(goal.goalId)))
    const jurisdictions = report.projections.map((projection) => {
      const sourceBackedAtomicGoals = atomicGoals.filter((goal) =>
        hasCoverageBackedJurisdictionEvidence(report, goal, projection.value, surrogateEntriesByKey))
      const surrogateBackedAtomicGoals = atomicGoals.filter((goal) =>
        !hasDirectSourceBackedJurisdictionEvidence(goal, projection.value)
        && hasReviewedRequiresClosureSurrogateEvidence(report, goal, projection.value, surrogateEntriesByKey))
      const visibleAtomicGoals = atomicGoals.filter((goal) =>
        (goal.compiledApplicability.jurisdiction ?? []).includes(projection.value))
      const unsupportedAssignedAtomicGoals = visibleAtomicGoals.filter((goal) =>
        !hasCoverageBackedJurisdictionEvidence(report, goal, projection.value, surrogateEntriesByKey))
      const visibleCoveredAtomicGoals = visibleAtomicGoals.filter((goal) =>
        hasCoverageBackedJurisdictionEvidence(report, goal, projection.value, surrogateEntriesByKey))
      const missingSourceBackedAtomicGoals = atomicGoals.filter((goal) =>
        !hasCoverageBackedJurisdictionEvidence(report, goal, projection.value, surrogateEntriesByKey))
      const nonVisibleMissingSourceBackedAtomicGoals = missingSourceBackedAtomicGoals.filter((goal) =>
        !(goal.compiledApplicability.jurisdiction ?? []).includes(projection.value))
      const partialSourceLinkedAtomicGoals = visibleAtomicGoals.filter((goal) =>
        hasPartialSourceLinkedJurisdictionEvidence(goal, projection.value))
      const labels = JURISDICTION_LABELS[projection.value]
      const status: CoverageStatus = projection.errors > 0 || unsupportedAssignedAtomicGoals.length > 0
        ? 'error'
        : sourceBackedAtomicGoals.length === 0
          ? 'none'
          : sourceBackedAtomicGoals.length < atomicGoals.length || projection.warnings > 0
            ? 'partial'
            : 'covered'
      const viewStatus: CoverageStatus = projection.errors > 0 || unsupportedAssignedAtomicGoals.length > 0
        ? 'error'
        : visibleAtomicGoals.length === 0
          ? 'none'
          : projection.warnings > 0
            ? 'partial'
            : 'covered'

      return {
        jurisdiction: projection.value,
        labelDe: labels.de,
        labelEn: labels.en,
        status,
        viewStatus,
        sourceBackedAtomicGoals: sourceBackedAtomicGoals.length,
        surrogateBackedAtomicGoals: surrogateBackedAtomicGoals.length,
        missingSourceBackedAtomicGoals: missingSourceBackedAtomicGoals.length,
        visibleAtomicGoals: visibleAtomicGoals.length,
        visibleCoveredAtomicGoals: visibleCoveredAtomicGoals.length,
        nonVisibleMissingSourceBackedAtomicGoals: nonVisibleMissingSourceBackedAtomicGoals.length,
        unsupportedAssignedAtomicGoals: unsupportedAssignedAtomicGoals.length,
        partialSourceLinkedAtomicGoals: partialSourceLinkedAtomicGoals.length,
        projectionWarnings: projection.warnings,
        projectionErrors: projection.errors,
        missingSourceBackedAtomicGoalIds: missingSourceBackedAtomicGoals.map((goal) => ({
          goalId: goal.goalId,
          title: goal.title,
        })),
        unsupportedAssignedAtomicGoalIds: unsupportedAssignedAtomicGoals.map((goal) => ({
          goalId: goal.goalId,
          title: goal.title,
        })),
      } satisfies JurisdictionAudit
    })

    curricula.push({
      landscapeId: report.landscapeId,
      title: report.title,
      file: report.file,
      totalAtomicGoals: atomicGoals.length,
      summary: buildCurriculumAuditSummary(jurisdictions),
      jurisdictions,
    })
  }

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    generatedBy: 'app/scripts/generateCurriculumSourceCoverageAudit.ts',
    evidencePolicy: {
      sourceBackedEvidenceKinds: ['provenance', 'mapping'],
      surrogateEvidenceKinds: ['requires-closure'],
      nonCoverageEvidenceKinds: ['override', 'child-union', 'requires-closure'],
    },
    curricula,
  }
}

const audit = buildAudit()

function formatGoalExamples(goals: GoalReference[], limit = 5): string {
  const examples = goals.slice(0, limit).map((goal) => `${goal.goalId} (${goal.title})`)
  if (goals.length > limit) examples.push(`... +${goals.length - limit} more`)
  return examples.join(', ')
}

function collectAuditProblems(auditToCheck: SourceCoverageAudit): string[] {
  const problems: string[] = []

  for (const curriculum of auditToCheck.curricula) {
    if (curriculum.totalAtomicGoals === 0) {
      problems.push(`${curriculum.title}: no source-coverage atomic goals found.`)
    }

    for (const entry of curriculum.jurisdictions) {
      if (entry.viewStatus !== 'covered') {
        problems.push(
          `${curriculum.title} ${entry.jurisdiction}: visible projection status is ${entry.viewStatus} `
            + `(visible=${entry.visibleAtomicGoals}, covered=${entry.visibleCoveredAtomicGoals}, `
            + `unsupported=${entry.unsupportedAssignedAtomicGoals}, warnings=${entry.projectionWarnings}, `
            + `errors=${entry.projectionErrors}).`,
        )
      }

      if (entry.unsupportedAssignedAtomicGoals > 0) {
        problems.push(
          `${curriculum.title} ${entry.jurisdiction}: ${entry.unsupportedAssignedAtomicGoals} visible atomic goals `
            + `lack direct or reviewed surrogate source evidence: `
            + formatGoalExamples(entry.unsupportedAssignedAtomicGoalIds),
        )
      }

      if (entry.projectionErrors > 0) {
        problems.push(
          `${curriculum.title} ${entry.jurisdiction}: ${entry.projectionErrors} projection errors reported.`,
        )
      }
    }
  }

  return problems
}

function writeAudit(auditToWrite: SourceCoverageAudit): void {
  mkdirSync(statusDir, { recursive: true })
  writeFileSync(auditJsonPath, `${JSON.stringify(auditToWrite, null, 2)}\n`)
  writeFileSync(auditMarkdownPath, renderMarkdown(auditToWrite))
  console.log(`Wrote ${auditJsonPath}`)
  console.log(`Wrote ${auditMarkdownPath}`)
}

if (process.argv.includes('--check')) {
  const problems = collectAuditProblems(audit)
  if (problems.length > 0) {
    console.error('Curriculum source coverage audit check failed:')
    for (const problem of problems) {
      console.error(`- ${problem}`)
    }
    process.exit(1)
  }

  console.log('Curriculum source coverage audit check passed.')
} else {
  writeAudit(audit)
}
