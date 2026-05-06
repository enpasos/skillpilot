import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
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
  sourceBackedAtomicGoals: number
  surrogateBackedAtomicGoals: number
  missingSourceBackedAtomicGoals: number
  visibleAtomicGoals: number
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
  jurisdictions: JurisdictionAudit[]
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

function hasSourceBackedJurisdictionEvidence(
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
    && !matchingEvidence.some((entry) => hasSourceBackedJurisdictionEvidence(entry, jurisdiction))
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
): boolean {
  const entries = surrogateEntriesByKey.get(surrogateEvidenceKey(report.landscapeId, goal.goalId, jurisdiction)) ?? []
  if (entries.length === 0) return false
  const sourceBackedRequiredGoalIds = new Set(
    report.goals
      .filter((candidate) => hasDirectSourceBackedJurisdictionEvidence(candidate, jurisdiction))
      .map((candidate) => candidate.goalId),
  )
  return entries.some((entry) =>
    goal.evidence.some((evidence) =>
      evidence.kind === 'requires-closure'
      && evidence.dimension === 'jurisdiction'
      && evidence.value === jurisdiction
      && evidence.source === `required by ${entry.requiredByGoalId}`)
    && sourceBackedRequiredGoalIds.has(entry.requiredByGoalId!))
}

function hasCoverageBackedJurisdictionEvidence(
  report: CoverageReport,
  goal: CoverageGoalReport,
  jurisdiction: string,
  surrogateEntriesByKey: Map<string, SurrogateEvidenceEntry[]>,
): boolean {
  return hasDirectSourceBackedJurisdictionEvidence(goal, jurisdiction)
    || hasReviewedRequiresClosureSurrogateEvidence(report, goal, jurisdiction, surrogateEntriesByKey)
}

function roundPercent(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0
  return Math.round((numerator / denominator) * 1000) / 10
}

function renderMarkdown(audit: SourceCoverageAudit): string {
  const lines: string[] = []
  lines.push('# Curriculum Source Coverage Audit')
  lines.push('')
  lines.push(`Generated: ${audit.generatedAt}`)
  lines.push('')
  lines.push('This audit is intentionally stricter than runtime visibility. `provenance`, exact `mapping`, and explicitly reviewed requires-closure surrogate entries count as Lehrplan evidence; `override`, `child-union`, automatic `requires-closure`, and partial mappings do not.')
  lines.push('')
  lines.push('This file is a raw Applicability compiler audit. The Workbench `Curriculum Quality` cards use the composition-view based counters in `curriculum-quality-status.json`, including extracted source atoms and fully covered source original goals.')
  lines.push('')

  for (const curriculum of audit.curricula) {
    lines.push(`## ${curriculum.title}`)
    lines.push('')
    lines.push(`Atomic goals: ${curriculum.totalAtomicGoals}`)
    lines.push('')
    lines.push('| Bundesland | Status | Source-backed | Surrogate | Missing | Visible | Unsupported visible | Partial source links | Warnings | Errors |')
    lines.push('| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |')
    for (const entry of curriculum.jurisdictions) {
      const sourcePercent = roundPercent(entry.sourceBackedAtomicGoals, curriculum.totalAtomicGoals)
      lines.push(`| ${entry.jurisdiction} | ${entry.status} | ${entry.sourceBackedAtomicGoals}/${curriculum.totalAtomicGoals} (${sourcePercent}%) | ${entry.surrogateBackedAtomicGoals} | ${entry.missingSourceBackedAtomicGoals} | ${entry.visibleAtomicGoals} | ${entry.unsupportedAssignedAtomicGoals} | ${entry.partialSourceLinkedAtomicGoals} | ${entry.projectionWarnings} | ${entry.projectionErrors} |`)
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
    const atomicGoals = report.goals.filter((goal) => goal.goalType === 'atomic')
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
      const missingSourceBackedAtomicGoals = atomicGoals.filter((goal) =>
        !hasCoverageBackedJurisdictionEvidence(report, goal, projection.value, surrogateEntriesByKey))
      const partialSourceLinkedAtomicGoals = visibleAtomicGoals.filter((goal) =>
        !hasCoverageBackedJurisdictionEvidence(report, goal, projection.value, surrogateEntriesByKey)
        && hasPartialSourceLinkedJurisdictionEvidence(goal, projection.value))
      const labels = JURISDICTION_LABELS[projection.value]
      const status: CoverageStatus = projection.errors > 0 || unsupportedAssignedAtomicGoals.length > 0
        ? 'error'
        : sourceBackedAtomicGoals.length === 0
          ? 'none'
          : sourceBackedAtomicGoals.length < atomicGoals.length || projection.warnings > 0
            ? 'partial'
            : 'covered'

      return {
        jurisdiction: projection.value,
        labelDe: labels.de,
        labelEn: labels.en,
        status,
        sourceBackedAtomicGoals: sourceBackedAtomicGoals.length,
        surrogateBackedAtomicGoals: surrogateBackedAtomicGoals.length,
        missingSourceBackedAtomicGoals: missingSourceBackedAtomicGoals.length,
        visibleAtomicGoals: visibleAtomicGoals.length,
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
      jurisdictions,
    })
  }

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    generatedBy: 'app/scripts/generateCurriculumSourceCoverageAudit.ts',
    evidencePolicy: {
      sourceBackedEvidenceKinds: ['provenance', 'mapping'],
      nonCoverageEvidenceKinds: ['override', 'child-union', 'requires-closure'],
    },
    curricula,
  }
}

mkdirSync(statusDir, { recursive: true })
const audit = buildAudit()
writeFileSync(auditJsonPath, `${JSON.stringify(audit, null, 2)}\n`)
writeFileSync(auditMarkdownPath, renderMarkdown(audit))
console.log(`Wrote ${auditJsonPath}`)
console.log(`Wrote ${auditMarkdownPath}`)
