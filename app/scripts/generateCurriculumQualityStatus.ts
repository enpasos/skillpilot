import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { convertLearningGoal } from '../src/goalTypes'
import type { LearningGoal, SkillLandscape } from '../src/landscapeTypes'
import {
  getCompositionProjectionRole,
  normalizeCompositionView,
  type CompositionViewNode,
} from '../src/utils/authoring/compositionViewAuthoring'
import { applyCompositionViewProjection } from '../src/utils/compositionViewRuntime'
import { goalMatchesFilters } from '../src/utils/goalFilters'
import { JURISDICTION_LABELS } from '../src/utils/jurisdictionMetadata'
import { buildDirectChildrenMap, getRenderedChildIds } from '../src/utils/treeProjectionRuntime'
import type { ApplicabilityCompilationResult, ApplicabilityEvidence, ApplicabilityFinding } from './applicabilityCompiler'
import { buildApplicabilityCompilation, hasOnlyPartialMappingSourceEvidence } from './applicabilityCompiler'
import {
  defaultMemoryCardReviewConfigDir,
  discoverMemoryCardReviewConfigs,
} from './memoryCardReviewConfigDiscovery'
import { isGoalVisualizationAiApproved } from './goalVisualizationQaModel'
import { createReviewedRequiresClosureCoverageChecker } from './sourceCoverageEvidence'

type RuleStatus = 'pass' | 'warn' | 'fail' | 'not_configured'
type MaturityLevel = 'M0' | 'M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'M6' | 'M7'
type SemanticReviewStatus = 'atomic' | 'needs_developer_review' | 'non_atomic'
type MemoryCardReviewStatus = 'no_memory_needed' | 'memory_required' | 'needs_developer_review'
type MemoryCardReviewCardStatus = 'kept' | 'remove' | 'needs_developer_review'
type DurationModel = 'G8' | 'G9'

interface QualityRuleDefinition {
  id: string
  label: string
  category: 'graph' | 'route' | 'assessment' | 'review' | 'view' | 'applicability' | 'visualization'
  maturityTarget: MaturityLevel
  description: string
}

interface RuleResult {
  id: string
  status: RuleStatus
  summary: string
  metrics?: Record<string, number>
  details?: string[]
}

interface ScopeStatus {
  scopeId: string
  label: string
  maturity: MaturityLevel
  selectedAtomicGoals: number
  rules: RuleResult[]
}

type JurisdictionCoverageStatus = 'covered' | 'partial' | 'error' | 'none'

interface JurisdictionCoverageEntry {
  jurisdiction: string
  labelDe: string
  labelEn: string
  visibleGoals: number
  visibleAtomicGoals: number
  visibleClusterGoals: number
  viewAtomicGoals: number
  sourceBackedAtomicGoals: number
  surrogateBackedAtomicGoals: number
  unsupportedAssignedAtomicGoals: number
  partialSourceLinkedAtomicGoals: number
  sourceAtomicGoals: number
  sourceMappedToViewAtomicGoals: number
  unmappedSourceAtomicGoals: number
  sourceExtractedGoals: number
  sourceUnregisteredGoals: number
  sourceExtractedAtomicGoals: number
  sourceUnregisteredAtomicGoals: number
  sourceOriginalGoals: number
  sourceFullyCoveredOriginalGoals: number
  sourcePartiallyCoveredOriginalGoals: number
  sourceUncoveredOriginalGoals: number
  errors: number
  warnings: number
  diagnosticPartialOnlyWarnings: number
  atomicCoveragePercent: number
  sourceBackedCoveragePercent: number
  sourceReverseCoveragePercent: number
  status: JurisdictionCoverageStatus
}

interface JurisdictionCoverage {
  dimension: 'jurisdiction'
  totalJurisdictions: number
  totalAtomicGoals: number
  rawAtomicGoals: number
  coveredJurisdictions: number
  sourceBackedJurisdictions: number
  sourceCompleteJurisdictions: number
  cleanJurisdictions: number
  partialJurisdictions: number
  errorJurisdictions: number
  maxVisibleAtomicGoals: number
  maxSourceBackedAtomicGoals: number
  maxAtomicCoveragePercent: number
  maxSourceBackedCoveragePercent: number
  unsupportedAssignedAtomicGoals: number
  surrogateBackedAtomicGoals: number
  partialSourceLinkedAtomicGoals: number
  sourceAtomicGoals: number
  sourceMappedToViewAtomicGoals: number
  unmappedSourceAtomicGoals: number
  sourceExtractedGoals: number
  sourceUnregisteredGoals: number
  sourceExtractedAtomicGoals: number
  sourceUnregisteredAtomicGoals: number
  sourceOriginalGoals: number
  sourceFullyCoveredOriginalGoals: number
  sourcePartiallyCoveredOriginalGoals: number
  sourceUncoveredOriginalGoals: number
  jurisdictions: JurisdictionCoverageEntry[]
}

type MappingPipelineStepState = 'complete' | 'incomplete' | 'blocked'

interface MappingPipelineCheck {
  id: string
  label: string
  passed: boolean
  details: string
}

interface MappingPipelineStep {
  id: string
  label: string
  status: MappingPipelineStepState
  dependsOn: string[]
  checks: MappingPipelineCheck[]
}

interface MappingPipelineSourceDocumentStatus {
  key?: string
  title: string
  path?: string
  url?: string
  landingUrl?: string
  official?: boolean
  available: boolean
  hasUsableUrl: boolean
}

interface DurationProjectionAuditStatus {
  evidenceLinks: number
  evidenceByDuration?: Record<string, number>
  canonicalGoalsWithDurationEvidence?: number
  canonicalGoalsWithDifferentG8G9Evidence?: number
  coveredEvidenceLinks: number
  uncoveredEvidenceLinks: number
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function normalizeMappingPipelineCheck(value: unknown): MappingPipelineCheck | null {
  if (!isRecord(value) || typeof value.id !== 'string' || typeof value.label !== 'string') return null
  const rawStatus = String(value.status ?? '').toLowerCase()
  const passed = typeof value.passed === 'boolean'
    ? value.passed
    : rawStatus === 'pass' || rawStatus === 'passed' || rawStatus === 'complete'

  return {
    id: value.id,
    label: value.label,
    passed,
    details: String(value.details ?? ''),
  }
}

function normalizeMappingPipelineStep(value: unknown): MappingPipelineStep | null {
  if (!isRecord(value) || typeof value.id !== 'string' || typeof value.label !== 'string') return null
  if (value.status !== 'complete' && value.status !== 'incomplete' && value.status !== 'blocked') return null
  const checks = Array.isArray(value.checks)
    ? value.checks.map(normalizeMappingPipelineCheck).filter((check): check is MappingPipelineCheck => check !== null)
    : []

  return {
    id: value.id,
    label: value.label,
    status: value.status,
    dependsOn: Array.isArray(value.dependsOn)
      ? value.dependsOn.filter((entry): entry is string => typeof entry === 'string')
      : [],
    checks,
  }
}

function normalizeSourceExtractionPipelineSteps(
  steps: MappingPipelineStep[],
  coverage: {
    totalSourceGoals: number
    mappedSourceGoals: number
    reviewedMappedSourceGoals: number
    unmappedSourceGoals: number
    explicitNeedsCanonicalGoal: number
    unreviewedSourceGoals: number
    hasM3ReviewFile: boolean
    extraDecisionGoals: number
    invalidMappedTargetGoals: number
  },
): MappingPipelineStep[] {
  const {
    totalSourceGoals,
    mappedSourceGoals,
    reviewedMappedSourceGoals,
    unmappedSourceGoals,
    explicitNeedsCanonicalGoal,
    unreviewedSourceGoals,
    hasM3ReviewFile,
    extraDecisionGoals,
    invalidMappedTargetGoals,
  } = coverage

  return steps.map((step) => {
    if (step.id !== 'MAPPING-3') return step

    const fullyCovered = unmappedSourceGoals <= 0
    const fullyReviewed = unreviewedSourceGoals <= 0
    const fachlichCovered = hasM3ReviewFile
      && fullyReviewed
      && fullyCovered
      && explicitNeedsCanonicalGoal <= 0
    const m3Complete = fachlichCovered

    const checks = step.checks
      .filter((check) => check.id !== 'm3-all-source-goals-exactly-mapped')
      .map((check) => {
        if (check.id === 'm3-review-file-present') {
          return {
            ...check,
            passed: hasM3ReviewFile,
            details: hasM3ReviewFile
              ? 'Review-Datei mit sourceExtractionPath fuer diese Source-Extraction ist vorhanden.'
              : check.details,
          }
        }

        if (check.id === 'm3-review-decisions-reference-source-goals') {
          return {
            ...check,
            passed: hasM3ReviewFile && extraDecisionGoals === 0,
            details: hasM3ReviewFile
              ? `Review-Entscheidungen mit unbekannter Source-ID: ${extraDecisionGoals}.`
              : check.details,
          }
        }

        if (check.id === 'm3-review-targets-exist') {
          return {
            ...check,
            passed: hasM3ReviewFile && invalidMappedTargetGoals === 0,
            details: hasM3ReviewFile
              ? `Unbekannte Canonical-Ziele in Mappings: ${invalidMappedTargetGoals}.`
              : check.details,
          }
        }

        if (check.id === 'm3-all-source-goals-reviewed') {
          return {
            ...check,
            passed: fullyReviewed,
            details: `${Math.max(0, totalSourceGoals - unreviewedSourceGoals)}/${totalSourceGoals} Source-Ziele reviewed; offen: ${unreviewedSourceGoals}.`,
          }
        }

        if (check.id === 'm3-all-source-goals-covered-by-canonical' || check.id === 'm3-all-source-goals-covered') {
          const blockedByUpstreamReview = step.status === 'blocked'
          return {
            ...check,
            label: blockedByUpstreamReview
              ? 'Vorläufige Abdeckung der aktuellen Source-IDs ist vorhanden'
              : 'Alle Source-Ziele sind durch SkillPilot-Ziele abgedeckt',
            passed: blockedByUpstreamReview ? fullyCovered : fachlichCovered,
            details: blockedByUpstreamReview
              ? `Abgedeckt: ${mappedSourceGoals}/${totalSourceGoals}; diese Abdeckung bewertet nur die aktuellen Source-IDs und ist kein fachlicher MAPPING-3-Abschluss, solange MAPPING-2 blockiert ist.`
              : `Fachlich abgedeckt: ${reviewedMappedSourceGoals}/${totalSourceGoals}; Mappings: ${mappedSourceGoals}/${totalSourceGoals}; verbleibend: ${explicitNeedsCanonicalGoal} explizite Canonical-Gaps, ${unreviewedSourceGoals} unreviewed.`,
          }
        }

        return check
      })

    return {
      ...step,
      status: step.status === 'blocked'
        ? step.status
        : m3Complete ? 'complete' : 'incomplete',
      checks,
    }
  })
}

interface MappingPipelineSourceStatus {
  sourceLandscapeId: string
  title: string
  jurisdiction: string
  subject?: string
  stage?: string
  durationModels?: string[]
  path: string
  sourceKind: 'source-extraction' | 'legacy-snapshot' | 'missing-extraction'
  sourceDocuments?: MappingPipelineSourceDocumentStatus[]
  currentStep: string
  completedSteps: number
  totalSteps: number
  sourceGoals: number
  passages: number
  mappedSourceGoals?: number
  unmappedSourceGoals?: number
  extraMappedGoals?: number
  exactMappings?: number
  partialMappings?: number
  otherMappings?: number
  sourceGoalCountPeerBaselineReview?: SourceGoalCountPeerBaselineReview
  sourceGoalGranularity?: SourceGoalGranularitySummary
  durationProjectionAudit?: DurationProjectionAuditStatus
  steps: MappingPipelineStep[]
}

interface SourceGoalCountPeerBaselineReview {
  accepted?: boolean
  details?: string
  status?: string
  rationale?: string
  assessment?: string
}

interface SourceGoalGranularitySummary {
  averageWords: number
  p90Words: number
  maxWords: number
  longGoals: number
  longGoalThreshold: number
  examples: Array<{
    id: string
    topicCode?: string
    words: number
    text: string
  }>
}

const SOURCE_GOAL_COUNT_DEVIATION_THRESHOLD = 0.3
const SOURCE_GOAL_COUNT_BASELINE_JURISDICTIONS = new Set(['DE-HE', 'DE-BW'])
const SOURCE_GOAL_GRANULARITY_LONG_GOAL_WORDS = 45

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  if (sorted.length === 0) return 0
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle]
}

function wordCount(value: string | undefined): number {
  return (value ?? '').trim().split(/\s+/).filter(Boolean).length
}

function sourceGoalText(sourceGoal: SourceExtractionGoal): string {
  return sourceGoal.sourceText
    ?? sourceGoal.sourceSpan
    ?? sourceGoal.description
    ?? sourceGoal.title
    ?? ''
}

function normalizeSourceGoalCountPeerBaselineReview(
  review: SourceGoalCountPeerBaselineReview | undefined,
): SourceGoalCountPeerBaselineReview | undefined {
  if (!review) return undefined
  const status = review.status?.trim().toLowerCase()
  const assessment = review.assessment?.trim().toLowerCase()
  const accepted = review.accepted === true
    || status === 'accepted'
    || assessment === 'accepted'
    || assessment === 'plausible'
  return {
    accepted,
    details: review.details ?? review.rationale ?? review.assessment,
    status: review.status,
    rationale: review.rationale,
    assessment: review.assessment,
  }
}

function normalizeDurationProjectionAudit(value: unknown): DurationProjectionAuditStatus | undefined {
  if (!isRecord(value)) return undefined
  if (
    typeof value.evidenceLinks !== 'number'
    || typeof value.coveredEvidenceLinks !== 'number'
    || typeof value.uncoveredEvidenceLinks !== 'number'
  ) {
    return undefined
  }

  const evidenceByDuration = isRecord(value.evidenceByDuration)
    ? Object.fromEntries(
        Object.entries(value.evidenceByDuration)
          .filter((entry): entry is [string, number] => typeof entry[1] === 'number'),
      )
    : undefined

  return {
    evidenceLinks: value.evidenceLinks,
    evidenceByDuration,
    canonicalGoalsWithDurationEvidence: typeof value.canonicalGoalsWithDurationEvidence === 'number'
      ? value.canonicalGoalsWithDurationEvidence
      : undefined,
    canonicalGoalsWithDifferentG8G9Evidence: typeof value.canonicalGoalsWithDifferentG8G9Evidence === 'number'
      ? value.canonicalGoalsWithDifferentG8G9Evidence
      : undefined,
    coveredEvidenceLinks: value.coveredEvidenceLinks,
    uncoveredEvidenceLinks: value.uncoveredEvidenceLinks,
  }
}

function normalizeDurationModels(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined
  const durationModels = value
    .filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
    .map((entry) => entry.trim().toUpperCase())
  return durationModels.length > 0 ? Array.from(new Set(durationModels)).sort() : undefined
}

function isMultiDurationModelSource(source: MappingPipelineSourceStatus): boolean {
  return (source.durationModels?.length ?? 0) > 1
}

function summarizeSourceGoalGranularity(sourceGoals: SourceExtractionGoal[]): SourceGoalGranularitySummary {
  const goalWordCounts = sourceGoals
    .map((sourceGoal) => ({
      id: sourceGoal.id ?? '',
      topicCode: sourceGoal.topicCode,
      words: wordCount(sourceGoalText(sourceGoal)),
      text: sourceGoalText(sourceGoal),
    }))
    .filter((entry) => entry.words > 0)
  const sortedWordCounts = goalWordCounts.map((entry) => entry.words).sort((left, right) => left - right)
  const averageWords = sortedWordCounts.length === 0
    ? 0
    : sortedWordCounts.reduce((sum, count) => sum + count, 0) / sortedWordCounts.length
  const p90Index = sortedWordCounts.length === 0 ? 0 : Math.floor((sortedWordCounts.length - 1) * 0.9)
  const longGoalEntries = goalWordCounts
    .filter((entry) => entry.words > SOURCE_GOAL_GRANULARITY_LONG_GOAL_WORDS)
    .sort((left, right) => right.words - left.words)
  return {
    averageWords,
    p90Words: sortedWordCounts[p90Index] ?? 0,
    maxWords: sortedWordCounts[sortedWordCounts.length - 1] ?? 0,
    longGoals: longGoalEntries.length,
    longGoalThreshold: SOURCE_GOAL_GRANULARITY_LONG_GOAL_WORDS,
    examples: longGoalEntries.slice(0, 5).map((entry) => ({
      id: entry.id,
      topicCode: entry.topicCode,
      words: entry.words,
      text: entry.text.length > 160 ? `${entry.text.slice(0, 157)}...` : entry.text,
    })),
  }
}

function sourceGoalCountGroupKey(source: MappingPipelineSourceStatus): string | null {
  if (source.sourceKind !== 'source-extraction') return null
  const subject = normalizedSourceGoalCountSubject(source.subject)
  const stageKeys = sourceGoalCountStageKeys(source.stage)
  if (!subject || stageKeys.length !== 1) return null
  return `${subject}:${stageKeys[0]}`
}

function normalizedSourceGoalCountSubject(subject: string | undefined): string | null {
  const normalized = subject?.trim().toLowerCase()
  if (!normalized) return null
  if (normalized.includes('politik') || normalized.includes('gemeinschaftskunde')) return 'politik-wirtschaft'
  if (normalized.includes('wirtschaft')) return 'wirtschaft'
  return normalized
}

function sourceGoalCountStageKeys(stage: string | undefined): string[] {
  return (stage ?? '')
    .trim()
    .toLowerCase()
    .split(/[+/,;&]+/)
    .map((entry) => entry.trim())
    .filter(Boolean)
}

function sourceGoalCountBaselineParts(
  source: MappingPipelineSourceStatus,
  baselineByGroup: Map<string, number[]>,
): Array<{ stage: string, peerCounts: number[], baseline: number }> {
  const subject = normalizedSourceGoalCountSubject(source.subject)
  const stageKeys = sourceGoalCountStageKeys(source.stage)
  if (!subject || stageKeys.length === 0) return []

  return stageKeys
    .map((stage) => {
      const peerCounts = baselineByGroup.get(`${subject}:${stage}`) ?? []
      return {
        stage,
        peerCounts,
        baseline: peerCounts.length >= 1 ? median(peerCounts) : 0,
      }
    })
    .filter((part) => part.peerCounts.length >= 1)
}

function appendSourceGoalCountPeerChecks(sources: Map<string, MappingPipelineSourceStatus>): void {
  const sourceExtractionStatuses = Array.from(sources.values())
    .filter((source) => source.sourceKind === 'source-extraction' && source.sourceGoals > 0)
  const baselineByGroup = new Map<string, number[]>()

  sourceExtractionStatuses
    .filter((source) =>
      source.currentStep === ''
      && source.completedSteps === source.totalSteps
      && !isMultiDurationModelSource(source)
      && SOURCE_GOAL_COUNT_BASELINE_JURISDICTIONS.has(source.jurisdiction))
    .forEach((source) => {
      const key = sourceGoalCountGroupKey(source)
      if (!key) return
      const counts = baselineByGroup.get(key) ?? []
      counts.push(source.sourceGoals)
      baselineByGroup.set(key, counts)
    })

  sourceExtractionStatuses
    .filter((source) => !SOURCE_GOAL_COUNT_BASELINE_JURISDICTIONS.has(source.jurisdiction))
    .filter((source) => !isMultiDurationModelSource(source))
    .forEach((source) => {
      const stageKeys = sourceGoalCountStageKeys(source.stage)
      const baselineParts = sourceGoalCountBaselineParts(source, baselineByGroup)
      if (baselineParts.length !== stageKeys.length || baselineParts.length === 0) return

      const baseline = baselineParts.reduce((sum, part) => sum + part.baseline, 0)
      const lowerBound = baseline * (1 - SOURCE_GOAL_COUNT_DEVIATION_THRESHOLD)
      const upperBound = baseline * (1 + SOURCE_GOAL_COUNT_DEVIATION_THRESHOLD)
      const withinRange = source.sourceGoals >= lowerBound && source.sourceGoals <= upperBound
      const acceptedDeviation = !withinRange && source.sourceGoalCountPeerBaselineReview?.accepted === true
      const percent = baseline === 0 ? 0 : Math.round(((source.sourceGoals - baseline) / baseline) * 100)
      const reviewDetails = acceptedDeviation && source.sourceGoalCountPeerBaselineReview?.details
        ? ` Kritisch gepruefte Abweichung: ${source.sourceGoalCountPeerBaselineReview.details}`
        : ''
      const passed = withinRange || acceptedDeviation
      const baselineDetails = baselineParts
        .map((part) => `${part.stage.toUpperCase()} (${part.peerCounts.join('/')})`)
        .join(' + ')
      const details = `${source.sourceGoals} Source-Ziele; Vergleich HE/BW ${baselineDetails}; Median ${Math.round(baseline)}; zulässiger 30%-Median-Korridor ${Math.ceil(lowerBound)}-${Math.floor(upperBound)}; Abweichung vom Median ${percent}%.${reviewDetails}`
      const nextSteps = source.steps.map((step) => {
        if (step.id !== 'MAPPING-2') return step
        const checks = step.checks.filter((check) => check.id !== 'source-goal-count-peer-baseline')
          .filter((check) => check.id !== 'source-goal-granularity-peer-audit')
        checks.push({
          id: 'source-goal-count-peer-baseline',
          label: 'Source-Ziel-Anzahl ist gegen den geprüften HE/BW-Median plausibilisiert',
          passed,
          details,
        })
        if (!passed && source.sourceGoalGranularity) {
          const granularity = source.sourceGoalGranularity
          const examples = granularity.examples
            .map((example) => {
              const prefix = example.topicCode ? `${example.topicCode} ` : ''
              return `${prefix}${example.id} (${example.words} Woerter): ${example.text}`
            })
            .join(' | ')
          checks.push({
            id: 'source-goal-granularity-peer-audit',
            label: 'Source-Ziele sind ausreichend granular statt als Sammelziele modelliert',
            passed: granularity.longGoals === 0,
            details: `${granularity.longGoals}/${source.sourceGoals} Source-Ziele haben mehr als ${granularity.longGoalThreshold} Woerter; Durchschnitt ${Math.round(granularity.averageWords)} Woerter, P90 ${granularity.p90Words}, Maximum ${granularity.maxWords}. ${examples ? `Beispiele: ${examples}` : ''}`.trim(),
          })
        }
        return {
          ...step,
          status: passed ? step.status : 'incomplete',
          checks,
        }
      })
      source.steps = nextSteps
      source.completedSteps = nextSteps.filter((step) => step.status === 'complete').length
      source.currentStep = source.completedSteps === nextSteps.length
        ? ''
        : nextSteps.find((step) => step.status !== 'complete')?.id ?? source.currentStep
    })
}

interface MappingPipelineStatus {
  totalSources: number
  completeSources: number
  incompleteSources: number
  blockedSources: number
  maxCompletedSteps: number
  totalSteps: number
  currentStep: string
  sources: MappingPipelineSourceStatus[]
}

interface CurriculumStatus {
  landscapeId: string
  title: string
  subject?: string
  frameworkId?: string
  path: string
  maturity: MaturityLevel
  goals: number
  atomicGoals: number
  clusterGoals: number
  jurisdictionCoverage?: JurisdictionCoverage
  mappingPipeline?: MappingPipelineStatus
  scopes: ScopeStatus[]
  rules: RuleResult[]
}

interface StatusDocument {
  schemaVersion: 1
  rulesVersion: 'curriculum-quality-v4'
  generatedAt: string
  generatedBy: string
  sources: {
    canonicalRoot: string
    sourceExtractionRoot: string
    semanticAtomicityRoot: string
    memoryCardReviewRoot: string
    goalVisualizationQaRoot: string
    compositionViewRoot: string
    acceptedWarningsPath: string
    sourceLandscapeRegistryPath: string
    sourceGoalMembershipRegistryPath: string
    sourceGoalClosureRegistryPath: string
    surrogateEvidencePath: string
  }
  summary: {
    curricula: number
    maturity: Record<MaturityLevel, number>
    ruleStatus: Record<RuleStatus, number>
  }
  ruleCatalog: QualityRuleDefinition[]
  curricula: CurriculumStatus[]
}

interface ReviewConfig {
  schemaVersion: 1
  reviewId: string
  ruleVersion: string
  landscapeId: string
  landscapePath: string
  reviewPath: string
  scope: {
    label: string
    rootGoalIds?: string[]
    leafGoalIds?: string[]
  }
}

interface ReviewRecord {
  schemaVersion: 1
  reviewId: string
  ruleVersion: string
  landscapeId: string
  goalId: string
  fingerprint: string
  status: SemanticReviewStatus
  semanticAtomic: boolean | null
  reviewedAt: string
  reviewer: string
  reason: string
}

interface MemoryCardReviewConfig {
  schemaVersion: 1
  reviewId: string
  ruleVersion: string
  landscapeId: string
  landscapePath: string
  reviewPath: string
  cardReviewPath?: string
  reportPath?: string
  visibilityScopeCoverageRequired?: boolean
  visibilityScopes?: MemoryVisibilityScope[]
  scope: {
    label: string
    rootGoalIds?: string[]
    leafGoalIds?: string[]
  }
}

interface MemoryVisibilityScope {
  label: string
  viewPath: string
}

interface MemoryCardReviewRecord {
  schemaVersion: 1
  reviewId: string
  ruleVersion: string
  landscapeId: string
  goalId: string
  fingerprint: string
  status: MemoryCardReviewStatus
  memoryUseful: boolean | null
  memoryGoalIds?: string[]
  deckIds?: string[]
  reviewedAt: string
  reviewer: string
  reason: string
}

interface MemoryCardReviewCardRecord {
  schemaVersion: 1
  reviewId: string
  ruleVersion: string
  landscapeId: string
  deckId: string
  cardId: string
  fingerprint: string
  status: MemoryCardReviewCardStatus
  necessary: boolean | null
  originGoalIds?: string[]
  reviewedAt: string
  reviewer: string
  reason: string
}

interface GoalVisualizationQaRecord {
  goalId: string
  title: string
  imageUrl: string
  publicAssetPath: string
  canonicalAssetPath: string
  assetSha256: string
  umlautsCorrectChatGpt: 'yes' | 'no'
  contentApprovedChatGpt: 'yes' | 'no'
  aiApproved?: 'yes' | 'no'
  aiApprovedAssetSha256?: string
  aiReviewedAt?: string | null
  aiReviewer?: string
  aiNotes?: string
  humanApproved: 'yes' | 'no'
  humanIssueIdentified: 'yes' | 'no'
  humanIssueDescription: string
}

interface GoalVisualizationQaLedger {
  schemaVersion: 1
  subject: string
  records: GoalVisualizationQaRecord[]
}

interface AcceptedWarningEntry {
  code: string
  landscapeId: string
  goalId?: string
  dimension?: string
  value?: string
  rationale?: string
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

interface GoalMappingEntry {
  legacyGoalId?: string
  canonicalGoalId?: string
  matchType?: string
  reviewDecisionId?: string
  courseLevelDecision?: string
  courseLevelRationale?: string
}

interface GoalMappingFile {
  sourceLandscapeId?: string
  targetLandscapeId?: string
  sourceExtractionPath?: string
  mappings?: GoalMappingEntry[]
  decisions?: SourceMappingReviewDecision[]
}

interface SourceMappingReviewDecision {
  sourceGoalId?: string
  decision?: string
  canonicalGoalIds?: string[]
  courseLevelDecision?: string
  courseLevelRationale?: string
  rationale?: string
}

interface SourceExtractionGoal {
  id?: string
  title?: string
  description?: string
  topicCode?: string
  sourceSpan?: string
  sourceText?: string
  sourceRef?: string
  courseLevel?: string
  contains?: string[]
}

interface SourceExtractionSourceDocument {
  key?: string
  title?: string
  path?: string
  url?: string
  landingUrl?: string
  official?: boolean
}

interface SourceLandscapeRegistryEntry {
  landscapeId?: string
  title?: string
  jurisdiction?: string
  sourcePath?: string
  archiveSourcePath?: string
}

interface SourceExtractionDocument {
  sourceLandscapeId?: string
  extractionId?: string
  title?: string
  subject?: string
  jurisdiction?: string
  stage?: string
  durationModels?: unknown
  sourceDocument?: {
    key?: string
    title?: string
    path?: string
    url?: string
    landingUrl?: string
    official?: boolean
  } | string
  sourceDocuments?: SourceExtractionSourceDocument[]
  passages?: unknown[]
  sourceGoals?: SourceExtractionGoal[]
  qualityReview?: {
    sourceGoalCountPeerBaseline?: SourceGoalCountPeerBaselineReview
  }
  durationProjectionAudit?: unknown
  pipelineStatus?: {
    currentStep?: string
    steps?: unknown[]
  }
}

interface SourceGoalMembershipRegistry {
  landscapes?: Array<{
    landscapeId?: string
    goalIds?: string[]
  }>
}

interface SourceGoalClosureRegistry {
  landscapes?: Array<{
    landscapeId?: string
    goalAtomicClosures?: Record<string, string[]>
    closures?: Record<string, string[]>
    goalIds?: string[]
  }>
}

type CoverageReport = ApplicabilityCompilationResult['reports'][number]
type CoverageGoalReport = CoverageReport['goals'][number]

interface RouteProfile {
  profileId: string
  landscapeId: string
  label: string
  motivationAnchorGoalIds: string[]
  terminalAutonomyClusterIds: string[]
  terminalAutonomyClusterIdsByDurationModel?: Partial<Record<DurationModel, string[]>>
  compositionViewStage?: 'SekI' | 'SekII' | 'CrossStage'
  compositionViewApplicabilityMode?: 'compiled-jurisdiction'
  compositionViewRoutePathMode?: 'visible-atomic'
  goalSelector: (goal: LearningGoal) => boolean
  clusterSelector: (goal: LearningGoal) => boolean
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '../..')
const canonicalRoot = resolve(repoRoot, 'curricula/DE/Gymnasium/canonical')
const sourceExtractionRoot = resolve(repoRoot, 'curricula/DE/Gymnasium/input')
const semanticAtomicityRoot = resolve(repoRoot, 'curricula/DE/Gymnasium/quality/semantic-atomicity')
const memoryCardReviewRoot = resolve(repoRoot, defaultMemoryCardReviewConfigDir)
const goalVisualizationQaRoot = resolve(repoRoot, 'curricula/DE/Gymnasium/quality/goal-visualization-qa')
const compositionViewRoot = resolve(repoRoot, 'curricula/DE/Gymnasium/composition-views')
const acceptedWarningsPath = resolve(repoRoot, 'docs/qa-ci/applicability-accepted-warnings.json')
const sourceLandscapeRegistryPath = resolve(repoRoot, 'curricula/DE/Gymnasium/provenance/source-landscape-registry.json')
const sourceGoalMembershipRegistryPath = resolve(repoRoot, 'curricula/DE/Gymnasium/provenance/source-goal-membership-registry.json')
const sourceGoalClosureRegistryPath = resolve(repoRoot, 'curricula/DE/Gymnasium/provenance/source-goal-closure-registry.json')
const surrogateEvidencePath = resolve(
  repoRoot,
  'curricula/DE/Gymnasium/provenance/canonical-goal-surrogate-evidence-registry.json',
)
const statusDir = resolve(repoRoot, 'docs/qa-ci/status')
const statusJsonPath = join(statusDir, 'curriculum-quality-status.json')
const statusMarkdownPath = join(statusDir, 'curriculum-quality-status.md')

const CANONICAL_GYM_MATH_LANDSCAPE_ID = '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'
const CANONICAL_GYM_MATH_SEK1_MOTIVATION_GOAL_ID = '65365dce-f33f-49d8-9516-42f75883aa86'
const CANONICAL_GYM_MATH_SEK1_EXAM_FOLDER_IDS = [
  '81c8da58-9258-488e-9ab8-48500ab31652',
  '7a2a5706-aff4-4fd0-b092-1779d6ecbc1f',
  '811d6d09-130e-47b2-aba8-a5c401fe3251',
  '5fb3ee61-059c-47f4-8c6f-7285d7982a41',
  'f6c9c2b8-3dbd-4839-972f-c60f33c44b63',
  'cb20dd6b-c4ff-4a1b-9636-3b3d6ea86aa8',
]
const CANONICAL_GYM_MATH_SEK2_MOTIVATION_GOAL_ID = '71cec9fb-3751-4d61-8b34-c5adbbf6e5f2'
const CANONICAL_GYM_MATH_SEK2_PRACTICE_CLUSTER_IDS = [
  '28b45b93-11e1-5a96-97a1-4cfee171802b',
  'c25158fc-4860-59b2-8ef0-dca355f3a8b1',
  '14b19ee4-364e-50bd-b6a3-499471356ef3',
  'f24096c6-6ca0-5c15-a2f5-7bdaec789a8d',
  '57f07e66-800c-5f7e-99ab-11dd6e520eb1',
  'd2560dc7-f29a-5e51-ba8c-ec2ca0fb8cc1',
]
const CANONICAL_GYM_PHYSICS_LANDSCAPE_ID = '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'
const CANONICAL_GYM_PHYSICS_MOTIVATION_GOAL_ID = '5c44b9ba-9b05-4774-95d5-073230d3fc4f'
const CANONICAL_GYM_PHYSICS_SEK1_PRACTICE_CLUSTER_ID = '21ab0854-4d67-5233-9495-ae208e152a3c'
const CANONICAL_GYM_PHYSICS_SEK2_PRACTICE_CLUSTER_IDS = [
  '424b07df-bf66-5d7f-99f5-f28b32ad1f22',
  '549a427d-f10a-5537-990e-6fdd7466848b',
  '9dd7c596-a751-523c-acba-916f73e900a5',
  'b47a2a23-b56d-5433-9036-075d6bb7c782',
  '85bbad98-2f48-5d64-85c4-ab6cf67f24c2',
]
const CANONICAL_GYM_CHEMISTRY_LANDSCAPE_ID = 'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0'
const CANONICAL_GYM_CHEMISTRY_MOTIVATION_GOAL_ID = 'a9c22adc-b543-5b0c-a2d8-3189facdff08'
const CANONICAL_GYM_CHEMISTRY_SEK2_PRACTICE_CLUSTER_IDS = [
  '9abac0f3-308d-536d-8454-56ed4fd98312',
  '4beeb141-2a59-5093-b599-e513403221b0',
  'e0f19114-9609-500d-8194-da7ee9bff72e',
  '8ee41a31-2b8e-5dd5-9496-86aab61cdf27',
  'b5f0201a-bc5b-5159-a36c-0925f198c32f',
  '5964272f-e835-5a24-b2b1-c162be6b75cb',
]
const CANONICAL_GYM_BIOLOGY_LANDSCAPE_ID = '08a43a1b-d97e-522c-9dfa-c950a493364e'
const CANONICAL_GYM_BIOLOGY_MOTIVATION_GOAL_ID = '2d451684-6e53-565e-a987-f362da919d2c'
const CANONICAL_GYM_BIOLOGY_SEK2_PRACTICE_CLUSTER_IDS = [
  '625aa68d-71cd-597f-b4c1-e1066eed2830',
  '0136a8bd-f945-5e7d-b8de-db156581869f',
  '28788f27-f079-5d78-936f-b7684760ff31',
  'dc4edb9a-8c9f-5700-84e5-b5f52b7e0d36',
  '950cbe9f-8e63-5bbb-a1ce-74c8ada43247',
  '5c731e13-f055-50ff-977c-877763d2d28b',
]
const CANONICAL_GYM_ECONOMICS_LANDSCAPE_ID = '605bdaf6-32d5-56fd-8d92-5a80c2fd2901'
const CANONICAL_GYM_ECONOMICS_MOTIVATION_GOAL_ID = '6bf2d1cc-e745-50dd-a617-71c06a6c6945'
const CANONICAL_GYM_ECONOMICS_PRACTICE_CLUSTER_IDS = [
  '14c05eec-87af-5fd6-832a-4f5d9d280e66',
  '1f0ed7e7-5f8b-512a-8d94-4bf05a065bbc',
  'a1c0e891-cb5b-56ef-9aa7-ac782e2099c3',
  '0fb8833c-4017-5052-819a-ecb5f6ebb36f',
  '5113c64b-405d-5f4b-bae9-70fe530b5e69',
]
const CANONICAL_GYM_POLITICS_ECONOMICS_LANDSCAPE_ID = '51b60137-46e8-5498-973e-ea38bb32f327'
const CANONICAL_GYM_POLITICS_ECONOMICS_MOTIVATION_GOAL_ID = 'b76a024a-55a6-5c77-85cd-b37ef10e5197'
const CANONICAL_GYM_POLITICS_ECONOMICS_PRACTICE_CLUSTER_IDS = [
  '550f7c15-340e-57a9-9558-a928a0225041',
  '9d8df353-53dd-53c2-a5b0-4a4086ac6da8',
  'c12243ad-1477-53e9-b6f9-99d38b0c7868',
  '0940abb4-7c9a-5419-926f-9bda8b8b580a',
  '535895ed-659e-5dd2-90c2-8a34e8b96afe',
  '54c26dc0-54d2-5067-a7c5-06b6fc5f43d5',
]
const CANONICAL_GYM_INFORMATICS_LANDSCAPE_ID = '7d51b38c-a149-5407-bddc-d2ce7878b020'
const CANONICAL_GYM_INFORMATICS_MOTIVATION_GOAL_ID = 'd848ceb9-cd73-5a13-9407-f3364764c223'
const CANONICAL_GYM_INFORMATICS_PRACTICE_CLUSTER_IDS = [
  'f05a9276-f27c-5d74-af65-588f12ab4de3',
  '91c5be09-cc6b-5f57-bfe1-9f0038faf26a',
  '6982b63a-c6c8-5a6f-b5cb-51568301ac1c',
  '010651ba-ddd0-510b-8ed1-e3610031f6e1',
  '70ef7a45-540a-5d8c-b970-19b9f740c40a',
  '4d22b75a-c395-5785-9131-68a8a5e203c1',
]
const CANONICAL_GYM_HISTORY_LANDSCAPE_ID = '92406d94-e3c1-58ec-b7c6-12122278d25a'
const CANONICAL_GYM_HISTORY_MOTIVATION_GOAL_ID = '178c5d72-5a0c-514e-abed-0dc65c8d1aa2'
const CANONICAL_GYM_HISTORY_PRACTICE_CLUSTER_IDS = [
  '036c1ed0-c535-5fe2-9ffc-739938359583',
]
const CANONICAL_GYM_GERMAN_LANDSCAPE_ID = '67bd301b-e11a-582d-94ba-4f4b1a4cefff'
const CANONICAL_GYM_GERMAN_MOTIVATION_GOAL_ID = 'eff86a92-e048-5494-b561-6ecdda1fbf67'
const CANONICAL_GYM_GERMAN_PRACTICE_CLUSTER_IDS = [
  '9d602daf-f4ce-513f-a425-b67240b5c309',
]
const CANONICAL_GYM_LATIN_LANDSCAPE_ID = '668cf206-941e-51f8-8704-3e8938631235'
const CANONICAL_GYM_LATIN_MOTIVATION_GOAL_ID = '551f2d6c-a030-57cc-9dbd-af30b2c3972a'
const CANONICAL_GYM_LATIN_PRACTICE_CLUSTER_IDS = [
  'bfd9bf1e-5751-5f40-f29a-edfab8cea4bf',
  'e82cc731-ebf4-588f-9fea-f0d31f7ad0e7',
  'f87f482c-8046-57cd-894f-5141ed7cb385',
  'c561c31d-a58d-5b77-84fd-6e0a3e478d73',
  '23f878bb-2080-5b98-8ade-e6e24679ece0',
  'd603f0a7-4c3a-55db-895e-4b19e9e7db8d',
]

const ruleCatalog: QualityRuleDefinition[] = [
  {
    id: 'CQR-000',
    label: 'Source inventory ingestion',
    category: 'applicability',
    maturityTarget: 'M1',
    description: 'Original source inventories are readable, linked to official HTTP(S) source URLs, and their extracted goals are registered in the source membership/closure ledger.',
  },
  {
    id: 'CQR-001',
    label: 'Basic graph integrity',
    category: 'graph',
    maturityTarget: 'M0',
    description: 'Goal IDs, local references, self-reference guards, and direct DAG checks are clean.',
  },
  {
    id: 'CQR-002',
    label: 'Explicit type consistency',
    category: 'graph',
    maturityTarget: 'M0',
    description: 'Stored type metadata agrees with structural atomic/cluster classification.',
  },
  {
    id: 'CQR-003',
    label: 'Bundesland atomic coverage',
    category: 'applicability',
    maturityTarget: 'M2',
    description: 'Bundesland composition-view source-coverage atoms are source-backed and registered source original goals are fully covered by view atoms.',
  },
  {
    id: 'CQR-004',
    label: 'Course-level mapping consistency',
    category: 'applicability',
    maturityTarget: 'M2',
    description: 'Upper-secondary GK/LK source-goal levels map only to canonical goals with compatible GK/LK tags; unspecified upper-secondary source goals default to GK/LK unless an LK-only decision is explicitly reviewed.',
  },
  {
    id: 'CQR-005',
    label: 'Source-goal count plausibility',
    category: 'applicability',
    maturityTarget: 'M2',
    description: 'Source-extraction goal counts are plausible against the reviewed HE/BW peer baseline or explicitly reviewed when they deviate strongly.',
  },
  {
    id: 'CQR-101',
    label: 'Effective full route coverage',
    category: 'route',
    maturityTarget: 'M3',
    description: 'Configured route scopes connect motivation anchors to terminal autonomy goals through effective requires.',
  },
  {
    id: 'CQR-102',
    label: 'Atomic direct route coverage',
    category: 'route',
    maturityTarget: 'M3',
    description: 'Configured route scopes connect motivation anchors to terminal autonomy goals through direct atomic requires.',
  },
  {
    id: 'CQR-103',
    label: 'No scoped cluster requires',
    category: 'route',
    maturityTarget: 'M3',
    description: 'Configured route scopes no longer depend on cluster-level requires for ordinary didactic sequencing.',
  },
  {
    id: 'CQR-104',
    label: 'Route endpoint composition visibility',
    category: 'route',
    maturityTarget: 'M3',
    description: 'Configured route scopes expose motivation anchors and terminal autonomy goals in relevant learner-facing composition views.',
  },
  {
    id: 'CQR-201',
    label: 'Terminal autonomy exam data presence',
    category: 'assessment',
    maturityTarget: 'M4',
    description: 'Terminal autonomy goals in configured scopes carry examData.',
  },
  {
    id: 'CQR-202',
    label: 'Concrete exam task readiness',
    category: 'assessment',
    maturityTarget: 'M4',
    description: 'Terminal autonomy examData is concrete enough for hard exam mode and is not placeholder prose.',
  },
  {
    id: 'CQR-203',
    label: 'Exam release and coverage metadata',
    category: 'assessment',
    maturityTarget: 'M4',
    description: 'Terminal autonomy examData has release status, covered goals, covered strands, and demand-level metadata.',
  },
  {
    id: 'CQR-301',
    label: 'Semantic atomicity review freshness',
    category: 'review',
    maturityTarget: 'M5',
    description: 'Configured semantic-atomicity ledgers are complete, current, and free of unresolved review queue entries.',
  },
  {
    id: 'CQR-302',
    label: 'Memory-card decision trace',
    category: 'review',
    maturityTarget: 'M6',
    description: 'Configured memory-card ledgers explicitly decide for ordinary atomic goals whether memorization is justified; every kept primary card traces to such a decision, every existing memory deck remains traced, and configured composition views expose referenced memory nodes where memory-required goals are visible.',
  },
  {
    id: 'CQR-303',
    label: 'Goal-visualization approval trace',
    category: 'visualization',
    maturityTarget: 'M7',
    description: 'All ordinary atomic learning goals have current primary goal-visualization assets, the QA ledger hashes match the active assets, and every active image has current human approval with no open human issue.',
  },
  {
    id: 'CQR-401',
    label: 'Composition view availability',
    category: 'view',
    maturityTarget: 'M5',
    description: 'The curriculum has at least one reviewed learner-facing composition view.',
  },
  {
    id: 'CQR-501',
    label: 'Applicability warning debt',
    category: 'applicability',
    maturityTarget: 'M5',
    description: 'Active applicability warnings are resolved and accepted warning records still match current findings.',
  },
]

const routeProfiles: RouteProfile[] = [
  {
    profileId: 'canonical-math-sek1',
    landscapeId: CANONICAL_GYM_MATH_LANDSCAPE_ID,
    label: 'Sekundarstufe I',
    motivationAnchorGoalIds: [CANONICAL_GYM_MATH_SEK1_MOTIVATION_GOAL_ID],
    terminalAutonomyClusterIds: CANONICAL_GYM_MATH_SEK1_EXAM_FOLDER_IDS,
    terminalAutonomyClusterIdsByDurationModel: {
      G8: CANONICAL_GYM_MATH_SEK1_EXAM_FOLDER_IDS.slice(0, 5),
      G9: CANONICAL_GYM_MATH_SEK1_EXAM_FOLDER_IDS,
    },
    compositionViewStage: 'SekI',
    goalSelector: (goal) => isAtomicGoal(goal)
      && isCanonicalGymMathSek1Goal(goal)
      && !isMemoryGoal(goal)
      && !isPracticeOrAssessmentGoal(goal),
    clusterSelector: isCanonicalGymMathSek1Goal,
  },
  {
    profileId: 'canonical-math-sek2',
    landscapeId: CANONICAL_GYM_MATH_LANDSCAPE_ID,
    label: 'Sekundarstufe II',
    motivationAnchorGoalIds: [CANONICAL_GYM_MATH_SEK2_MOTIVATION_GOAL_ID],
    terminalAutonomyClusterIds: CANONICAL_GYM_MATH_SEK2_PRACTICE_CLUSTER_IDS,
    goalSelector: (goal) => isAtomicGoal(goal) && isCanonicalGymMathSek2Goal(goal) && !isMemoryGoal(goal),
    clusterSelector: isCanonicalGymMathSek2Goal,
  },
  {
    profileId: 'canonical-physics-sek1',
    landscapeId: CANONICAL_GYM_PHYSICS_LANDSCAPE_ID,
    label: 'Sekundarstufe I',
    motivationAnchorGoalIds: [CANONICAL_GYM_PHYSICS_MOTIVATION_GOAL_ID],
    terminalAutonomyClusterIds: [CANONICAL_GYM_PHYSICS_SEK1_PRACTICE_CLUSTER_ID],
    compositionViewStage: 'SekI',
    compositionViewApplicabilityMode: 'compiled-jurisdiction',
    compositionViewRoutePathMode: 'visible-atomic',
    goalSelector: (goal) => isAtomicGoal(goal)
      && isCanonicalGymPhysicsSek1Goal(goal)
      && !isMemoryGoal(goal)
      && !isPracticeOrAssessmentGoal(goal),
    clusterSelector: isCanonicalGymPhysicsSek1Goal,
  },
  {
    profileId: 'canonical-physics-sek2',
    landscapeId: CANONICAL_GYM_PHYSICS_LANDSCAPE_ID,
    label: 'Sekundarstufe II',
    motivationAnchorGoalIds: [CANONICAL_GYM_PHYSICS_MOTIVATION_GOAL_ID],
    terminalAutonomyClusterIds: CANONICAL_GYM_PHYSICS_SEK2_PRACTICE_CLUSTER_IDS,
    goalSelector: (goal) => isAtomicGoal(goal)
      && isCanonicalGymPhysicsSek2Goal(goal)
      && !isMemoryGoal(goal)
      && !isPracticeOrAssessmentGoal(goal),
    clusterSelector: isCanonicalGymPhysicsSek2Goal,
  },
  {
    profileId: 'canonical-chemistry-sek2',
    landscapeId: CANONICAL_GYM_CHEMISTRY_LANDSCAPE_ID,
    label: 'Sekundarstufe II',
    motivationAnchorGoalIds: [CANONICAL_GYM_CHEMISTRY_MOTIVATION_GOAL_ID],
    terminalAutonomyClusterIds: CANONICAL_GYM_CHEMISTRY_SEK2_PRACTICE_CLUSTER_IDS,
    goalSelector: (goal) => isAtomicGoal(goal)
      && isCanonicalGymChemistrySek2Goal(goal)
      && !isMemoryGoal(goal)
      && !isPracticeOrAssessmentGoal(goal),
    clusterSelector: isCanonicalGymChemistrySek2Goal,
  },
  {
    profileId: 'canonical-biology-sek2',
    landscapeId: CANONICAL_GYM_BIOLOGY_LANDSCAPE_ID,
    label: 'Sekundarstufe II',
    motivationAnchorGoalIds: [CANONICAL_GYM_BIOLOGY_MOTIVATION_GOAL_ID],
    terminalAutonomyClusterIds: CANONICAL_GYM_BIOLOGY_SEK2_PRACTICE_CLUSTER_IDS,
    goalSelector: (goal) => isAtomicGoal(goal)
      && isCanonicalGymBiologySek2Goal(goal)
      && !isMemoryGoal(goal)
      && !isPracticeOrAssessmentGoal(goal),
    clusterSelector: isCanonicalGymBiologySek2Goal,
  },
  {
    profileId: 'canonical-economics-crossstage',
    landscapeId: CANONICAL_GYM_ECONOMICS_LANDSCAPE_ID,
    label: 'Sekundarstufe I/II',
    motivationAnchorGoalIds: [CANONICAL_GYM_ECONOMICS_MOTIVATION_GOAL_ID],
    terminalAutonomyClusterIds: CANONICAL_GYM_ECONOMICS_PRACTICE_CLUSTER_IDS,
    compositionViewStage: 'CrossStage',
    goalSelector: (goal) => isAtomicGoal(goal)
      && isCanonicalGymEconomicsGoal(goal)
      && !isMemoryGoal(goal)
      && !isPracticeOrAssessmentGoal(goal)
      && !goal.tags?.includes('Motivation')
      && !goal.tags?.includes('Orientation'),
    clusterSelector: (goal) => isCanonicalGymEconomicsGoal(goal)
      && !isPracticeOrAssessmentGoal(goal)
      && goal.dimensionTags?.phase !== 'Abitur'
      && (goal as { phase?: string }).phase !== 'Abitur'
      && !goal.tags?.includes('Abitur'),
  },
  {
    profileId: 'canonical-politics-economics-crossstage',
    landscapeId: CANONICAL_GYM_POLITICS_ECONOMICS_LANDSCAPE_ID,
    label: 'Sekundarstufe I/II',
    motivationAnchorGoalIds: [CANONICAL_GYM_POLITICS_ECONOMICS_MOTIVATION_GOAL_ID],
    terminalAutonomyClusterIds: CANONICAL_GYM_POLITICS_ECONOMICS_PRACTICE_CLUSTER_IDS,
    compositionViewStage: 'CrossStage',
    goalSelector: (goal) => isAtomicGoal(goal)
      && isCanonicalGymPoliticsEconomicsGoal(goal)
      && !isMemoryGoal(goal)
      && !isPracticeOrAssessmentGoal(goal)
      && !goal.tags?.includes('Motivation')
      && !goal.tags?.includes('Orientation'),
    clusterSelector: (goal) => isCanonicalGymPoliticsEconomicsGoal(goal)
      && !isPracticeOrAssessmentGoal(goal)
      && goal.dimensionTags?.phase !== 'Abitur'
      && (goal as { phase?: string }).phase !== 'Abitur'
      && !goal.tags?.includes('Abitur'),
  },
  {
    profileId: 'canonical-informatics-crossstage',
    landscapeId: CANONICAL_GYM_INFORMATICS_LANDSCAPE_ID,
    label: 'Sekundarstufe I/II',
    motivationAnchorGoalIds: [CANONICAL_GYM_INFORMATICS_MOTIVATION_GOAL_ID],
    terminalAutonomyClusterIds: CANONICAL_GYM_INFORMATICS_PRACTICE_CLUSTER_IDS,
    compositionViewStage: 'CrossStage',
    goalSelector: (goal) => isAtomicGoal(goal)
      && isCanonicalGymInformaticsGoal(goal)
      && !isMemoryGoal(goal)
      && !isPracticeOrAssessmentGoal(goal)
      && !goal.tags?.includes('Motivation')
      && !goal.tags?.includes('Orientation')
      && goal.dimensionTags?.phase !== 'Abitur'
      && (goal as { phase?: string }).phase !== 'Abitur',
    clusterSelector: (goal) => isCanonicalGymInformaticsGoal(goal)
      && !isPracticeOrAssessmentGoal(goal)
      && goal.dimensionTags?.phase !== 'Abitur'
      && (goal as { phase?: string }).phase !== 'Abitur'
      && !goal.tags?.includes('Abitur'),
  },
  {
    profileId: 'canonical-history-crossstage',
    landscapeId: CANONICAL_GYM_HISTORY_LANDSCAPE_ID,
    label: 'Sekundarstufe I/II',
    motivationAnchorGoalIds: [CANONICAL_GYM_HISTORY_MOTIVATION_GOAL_ID],
    terminalAutonomyClusterIds: CANONICAL_GYM_HISTORY_PRACTICE_CLUSTER_IDS,
    compositionViewStage: 'CrossStage',
    goalSelector: (goal) => isAtomicGoal(goal)
      && isCanonicalGymHistoryGoal(goal)
      && !isMemoryGoal(goal)
      && !isPracticeOrAssessmentGoal(goal)
      && !goal.tags?.includes('Motivation')
      && !goal.tags?.includes('Orientation')
      && goal.dimensionTags?.phase !== 'Abitur'
      && (goal as { phase?: string }).phase !== 'Abitur',
    clusterSelector: (goal) => isCanonicalGymHistoryGoal(goal)
      && !isPracticeOrAssessmentGoal(goal)
      && goal.dimensionTags?.phase !== 'Abitur'
      && (goal as { phase?: string }).phase !== 'Abitur'
      && !goal.tags?.includes('Abitur'),
  },
  {
    profileId: 'canonical-german-crossstage',
    landscapeId: CANONICAL_GYM_GERMAN_LANDSCAPE_ID,
    label: 'Sekundarstufe I/II',
    motivationAnchorGoalIds: [CANONICAL_GYM_GERMAN_MOTIVATION_GOAL_ID],
    terminalAutonomyClusterIds: CANONICAL_GYM_GERMAN_PRACTICE_CLUSTER_IDS,
    compositionViewStage: 'CrossStage',
    goalSelector: (goal) => isAtomicGoal(goal)
      && isCanonicalGymGermanGoal(goal)
      && !isMemoryGoal(goal)
      && !isPracticeOrAssessmentGoal(goal)
      && !goal.tags?.includes('Motivation')
      && !goal.tags?.includes('Orientation')
      && goal.dimensionTags?.phase !== 'Abitur'
      && (goal as { phase?: string }).phase !== 'Abitur',
    clusterSelector: (goal) => isCanonicalGymGermanGoal(goal)
      && !isPracticeOrAssessmentGoal(goal)
      && goal.dimensionTags?.phase !== 'Abitur'
      && (goal as { phase?: string }).phase !== 'Abitur'
      && !goal.tags?.includes('Abitur'),
  },
  {
    profileId: 'canonical-latin-crossstage',
    landscapeId: CANONICAL_GYM_LATIN_LANDSCAPE_ID,
    label: 'Sekundarstufe I/II',
    motivationAnchorGoalIds: [CANONICAL_GYM_LATIN_MOTIVATION_GOAL_ID],
    terminalAutonomyClusterIds: CANONICAL_GYM_LATIN_PRACTICE_CLUSTER_IDS,
    compositionViewStage: 'CrossStage',
    goalSelector: (goal) => isAtomicGoal(goal)
      && isCanonicalGymLatinGoal(goal)
      && !isMemoryGoal(goal)
      && !isPracticeOrAssessmentGoal(goal)
      && !(goal as { examData?: unknown }).examData
      && !goal.tags?.includes('Motivation')
      && !goal.tags?.includes('Orientation')
      && goal.dimensionTags?.phase !== 'Abitur'
      && (goal as { phase?: string }).phase !== 'Abitur',
    clusterSelector: (goal) => isCanonicalGymLatinGoal(goal)
      && !isPracticeOrAssessmentGoal(goal)
      && !/^Übungen\b/.test(goal.title)
      && goal.dimensionTags?.phase !== 'Abitur'
      && (goal as { phase?: string }).phase !== 'Abitur'
      && !goal.tags?.includes('Abitur'),
  },
]

function toRepoPath(path: string): string {
  return relative(repoRoot, path).split(/[\\/]/).join('/')
}

function loadJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T
}

let trackedRepoPathsCache: Set<string> | null | undefined

function trackedRepoPaths(): Set<string> | null {
  if (trackedRepoPathsCache !== undefined) return trackedRepoPathsCache
  try {
    const output = execFileSync('git', ['ls-files', '-z'], {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
    trackedRepoPathsCache = new Set(
      output
        .split('\0')
        .filter((entry) => entry.trim().length > 0)
        .map((entry) => entry.replace(/\\/g, '/')),
    )
  } catch {
    trackedRepoPathsCache = null
  }
  return trackedRepoPathsCache
}

function isRepoAvailableSourcePath(repoPath: string): boolean {
  const normalizedPath = repoPath.replace(/\\/g, '/')
  const trackedPaths = trackedRepoPaths()
  if (trackedPaths) return trackedPaths.has(normalizedPath)
  return existsSync(resolve(repoRoot, normalizedPath))
}

function hasUsableOriginalSourceUrl(value: unknown): value is string {
  if (typeof value !== 'string' || !value.trim()) return false
  try {
    const parsed = new URL(value.trim())
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false
    const hostname = parsed.hostname.toLowerCase()
    return ![
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
    ].includes(hostname)
      && !hostname.endsWith('.local')
      && !hostname.includes('example.')
  } catch {
    return false
  }
}

function sourceDocumentsForExtraction(extraction: SourceExtractionDocument): MappingPipelineSourceDocumentStatus[] {
  const rawDocuments = Array.isArray(extraction.sourceDocuments) && extraction.sourceDocuments.length > 0
    ? extraction.sourceDocuments
    : extraction.sourceDocument
      ? [extraction.sourceDocument]
      : []

  return rawDocuments
    .map((document) => {
      const documentRecord = isRecord(document) ? document : null
      const title = typeof document === 'string' && document.trim()
        ? document.trim()
        : typeof documentRecord?.title === 'string' && documentRecord.title.trim()
          ? documentRecord.title.trim()
          : typeof documentRecord?.key === 'string' && documentRecord.key.trim()
            ? documentRecord.key.trim()
            : typeof documentRecord?.path === 'string' && documentRecord.path.trim()
              ? documentRecord.path.trim()
              : ''
      if (!title) return null
      const sourcePath = typeof document === 'string' && document.trim()
        ? document.trim().replace(/\\/g, '/')
        : typeof documentRecord?.path === 'string' && documentRecord.path.trim()
          ? documentRecord.path.trim().replace(/\\/g, '/')
          : undefined
      const rawUrl = typeof documentRecord?.url === 'string' && documentRecord.url.trim()
        ? documentRecord.url.trim()
        : undefined
      const landingUrl = typeof documentRecord?.landingUrl === 'string' && documentRecord.landingUrl.trim()
        ? documentRecord.landingUrl.trim()
        : undefined
      const absolutePath = sourcePath ? resolve(repoRoot, sourcePath) : undefined
      const repoPath = absolutePath ? toRepoPath(absolutePath) : undefined
      return {
        key: typeof documentRecord?.key === 'string' && documentRecord.key.trim() ? documentRecord.key.trim() : undefined,
        title,
        path: repoPath,
        url: rawUrl,
        landingUrl,
        official: typeof documentRecord?.official === 'boolean' ? documentRecord.official : undefined,
        available: repoPath ? isRepoAvailableSourcePath(repoPath) : false,
        hasUsableUrl: hasUsableOriginalSourceUrl(rawUrl),
      }
    })
    .filter((document): document is MappingPipelineSourceDocumentStatus => document !== null)
}

function collectFiles(root: string, predicate: (fileName: string) => boolean): string[] {
  if (!existsSync(root)) return []

  const result: string[] = []
  const visit = (directory: string) => {
    const entries = readdirSync(directory, { withFileTypes: true })
    entries.forEach((entry) => {
      const absolutePath = join(directory, entry.name)
      if (entry.isDirectory()) {
        visit(absolutePath)
        return
      }
      if (entry.isFile() && predicate(entry.name)) {
        result.push(absolutePath)
      }
    })
  }

  visit(root)
  return result.sort((left, right) => left.localeCompare(right))
}

function hashFile(path: string): string {
  if (!existsSync(path)) return ''
  return `sha256:${createHash('sha256').update(readFileSync(path)).digest('hex')}`
}

function isAtomicGoal(goal: LearningGoal): boolean {
  return (goal.contains?.length ?? 0) === 0
}

function isGoalVisualizationRelevantGoal(goal: LearningGoal): boolean {
  const tags = goal.tags ?? []
  return isAtomicGoal(goal)
    && goal.nodeKind !== 'memory'
    && goal.nodeKind !== 'exam'
    && goal.nodeKind !== 'tutor'
    && (goal as { examData?: unknown }).examData === undefined
    && !tags.includes('memorization')
    && !tags.some((tag) => tag.startsWith('srs-deck:'))
}

function isSemanticAtomicityRelevantGoal(goal: LearningGoal): boolean {
  const tags = new Set(goal.tags ?? [])
  if (tags.has('Practice') || tags.has('Assessment')) return false
  if (tags.has('Motivation') || tags.has('Orientation')) return false
  if (isMemoryGoal(goal)) return false
  if ((goal as { examData?: unknown }).examData) return false
  return true
}

function isMemoryCardReviewRelevantGoal(goal: LearningGoal): boolean {
  return isSemanticAtomicityRelevantGoal(goal)
}

function isMemoryGoal(goal: LearningGoal): boolean {
  const tags = goal.tags ?? []
  return goal.nodeKind === 'memory'
    || tags.includes('memorization')
    || tags.some((tag) => tag.startsWith('srs-deck:'))
}

function isCanonicalGymMathSek1Goal(goal: LearningGoal): boolean {
  if (goal.id === CANONICAL_GYM_MATH_SEK1_MOTIVATION_GOAL_ID) return true
  if (goal.tags?.includes('phase:SekI')) return true
  const legacyPhase = (goal as { phase?: string }).phase
  if (/^J\d{1,2}$/.test(goal.dimensionTags?.phase ?? legacyPhase ?? '')) return true

  const topicCode = goal.dimensionTags?.topicCode ?? goal.themenfeld ?? ''
  return topicCode.includes('SEK1')
}

function isCanonicalGymMathSek2Goal(goal: LearningGoal): boolean {
  if (goal.id === CANONICAL_GYM_MATH_SEK2_MOTIVATION_GOAL_ID) return true
  if (goal.tags?.includes('phase:SekII')) return true

  const legacyPhase = (goal as { phase?: string }).phase
  if (['E', 'Q1', 'Q2', 'Q3', 'Q4'].includes(goal.dimensionTags?.phase ?? legacyPhase ?? '')) return true

  const topicCode = goal.dimensionTags?.topicCode ?? goal.themenfeld ?? ''
  return topicCode.includes('SEK2')
}

function isCanonicalGymMathGoal(goal: LearningGoal): boolean {
  return goal.dimensionTags?.framework === 'canonical-gymnasium-math'
    || isCanonicalGymMathSek1Goal(goal)
    || isCanonicalGymMathSek2Goal(goal)
}

function isPracticeOrAssessmentGoal(goal: LearningGoal): boolean {
  return (goal.tags ?? []).includes('Practice') || (goal.tags ?? []).includes('Assessment')
}

function isProjectedRouteTargetGoal(goal: LearningGoal | undefined): goal is LearningGoal {
  return !!goal
    && isAtomicGoal(goal)
    && !isMemoryGoal(goal)
    && !isPracticeOrAssessmentGoal(goal)
}

function isCurriculumSourceCoverageGoal(goal: LearningGoal | undefined): boolean {
  if (!goal) return false
  if (isMemoryGoal(goal) || isPracticeOrAssessmentGoal(goal)) return false
  const tags = goal.tags ?? []
  if (tags.includes('Motivation') || tags.includes('Orientation')) return false
  if ((goal as { examData?: unknown }).examData) return false
  return true
}

function isCanonicalGymPhysicsSek1Goal(goal: LearningGoal): boolean {
  if (goal.id === CANONICAL_GYM_PHYSICS_MOTIVATION_GOAL_ID) return true
  return goal.tags?.includes('SekI') ?? false
}

function isCanonicalGymPhysicsSek2Goal(goal: LearningGoal): boolean {
  if (goal.id === CANONICAL_GYM_PHYSICS_MOTIVATION_GOAL_ID) return true
  const legacyPhase = (goal as { phase?: string }).phase
  return ['E', 'Q1', 'Q2', 'Q3', 'Q4'].includes(goal.dimensionTags?.phase ?? legacyPhase ?? '')
}

function isCanonicalGymChemistrySek2Goal(goal: LearningGoal): boolean {
  if (goal.id === CANONICAL_GYM_CHEMISTRY_MOTIVATION_GOAL_ID) return true
  if (goal.tags?.includes('SekII')) return true
  const legacyPhase = (goal as { phase?: string }).phase
  return ['E', 'Q1', 'Q2', 'Q3', 'Q4'].includes(goal.dimensionTags?.phase ?? legacyPhase ?? '')
}

function isCanonicalGymBiologySek2Goal(goal: LearningGoal): boolean {
  if (goal.id === CANONICAL_GYM_BIOLOGY_MOTIVATION_GOAL_ID) return true
  if (goal.tags?.includes('SekII')) return true
  const legacyPhase = (goal as { phase?: string }).phase
  return ['E', 'Q1', 'Q2', 'Q3', 'Q4'].includes(goal.dimensionTags?.phase ?? legacyPhase ?? '')
}

function isCanonicalGymEconomicsGoal(goal: LearningGoal): boolean {
  if (goal.id === CANONICAL_GYM_ECONOMICS_MOTIVATION_GOAL_ID) return true
  if (goal.dimensionTags?.framework === 'canonical-gymnasium-economics') return true
  if (goal.tags?.includes('subject:economics')) return true
  if (goal.tags?.includes('subject:Wirtschaft')) return true
  const legacyPhase = (goal as { phase?: string }).phase
  return ['E', 'Q1', 'Q2', 'Q3', 'Q4', 'Katalog'].includes(goal.dimensionTags?.phase ?? legacyPhase ?? '')
}

function isCanonicalGymPoliticsEconomicsGoal(goal: LearningGoal): boolean {
  if (goal.id === CANONICAL_GYM_POLITICS_ECONOMICS_MOTIVATION_GOAL_ID) return true
  if (goal.dimensionTags?.framework === 'canonical-gymnasium-politics-economics') return true
  if (goal.dimensionTags?.framework === 'hessen-kc-2024-politik-wirtschaft') return true
  if (goal.tags?.includes('subject:politics_economics')) return true
  if (goal.tags?.includes('subject:Politik und Wirtschaft')) return true
  if (goal.tags?.includes('SekI') || goal.tags?.includes('SekII')) return true
  const legacyPhase = (goal as { phase?: string }).phase
  return ['E', 'Q1', 'Q2', 'Q3', 'Q4', 'GLOBAL'].includes(goal.dimensionTags?.phase ?? legacyPhase ?? '')
}

function isCanonicalGymInformaticsGoal(goal: LearningGoal): boolean {
  if (goal.id === CANONICAL_GYM_INFORMATICS_MOTIVATION_GOAL_ID) return true
  if (goal.dimensionTags?.framework === 'canonical-gymnasium-informatics') return true
  if (goal.dimensionTags?.framework === 'canonical-de-gymnasium-informatics') return true
  if (goal.dimensionTags?.framework === 'hessen-kc-2024-informatics') return true
  if (goal.tags?.includes('subject:informatics')) return true
  if (goal.tags?.includes('SekI') || goal.tags?.includes('SekII')) return true
  const legacyPhase = (goal as { phase?: string }).phase
  return ['E', 'Q1', 'Q2', 'Q3', 'Q4', 'GLOBAL'].includes(goal.dimensionTags?.phase ?? legacyPhase ?? '')
}

function isCanonicalGymHistoryGoal(goal: LearningGoal): boolean {
  if (goal.id === CANONICAL_GYM_HISTORY_MOTIVATION_GOAL_ID) return true
  if (goal.dimensionTags?.framework === 'canonical-gymnasium-history') return true
  if (goal.dimensionTags?.framework === 'hessen-kc-2024-history') return true
  if (goal.tags?.includes('subject:history')) return true
  if (goal.tags?.includes('subject:Geschichte')) return true
  const legacyPhase = (goal as { phase?: string }).phase
  return ['E', 'Q1', 'Q2', 'Q3', 'Q4', 'GLOBAL'].includes(goal.dimensionTags?.phase ?? legacyPhase ?? '')
}

function isCanonicalGymGermanGoal(goal: LearningGoal): boolean {
  if (goal.id === CANONICAL_GYM_GERMAN_MOTIVATION_GOAL_ID) return true
  if (goal.dimensionTags?.framework === 'canonical-gymnasium-german') return true
  if (goal.dimensionTags?.framework === 'hessen-kc-2024-german') return true
  if (goal.tags?.includes('subject:german')) return true
  if (goal.tags?.includes('subject:Deutsch')) return true
  if (goal.tags?.includes('SekI') || goal.tags?.includes('SekII')) return true
  const legacyPhase = (goal as { phase?: string }).phase
  return ['E', 'Q1', 'Q2', 'Q3', 'Q4', 'GLOBAL', 'SekI'].includes(goal.dimensionTags?.phase ?? legacyPhase ?? '')
}

function isCanonicalGymLatinGoal(goal: LearningGoal): boolean {
  if (goal.id === CANONICAL_GYM_LATIN_MOTIVATION_GOAL_ID) return true
  if (goal.dimensionTags?.framework === 'canonical-gymnasium-latin') return true
  if (goal.tags?.includes('subject:latin')) return true
  if (goal.tags?.includes('subject:Latein')) return true
  const legacyPhase = (goal as { phase?: string }).phase
  return ['E', 'Q1', 'Q2', 'Q3', 'Q4', 'GLOBAL'].includes(goal.dimensionTags?.phase ?? legacyPhase ?? '')
}

function parseReference(raw: string, currentLandscapeId: string): { landscapeId: string; goalId: string } {
  if (raw.includes(':')) {
    const [landscapeId, goalId] = raw.split(':', 2)
    return { landscapeId: landscapeId || currentLandscapeId, goalId }
  }
  return { landscapeId: currentLandscapeId, goalId: raw }
}

function buildParentByChild(goals: LearningGoal[]): Map<string, string[]> {
  const parentByChild = new Map<string, string[]>()
  goals.forEach((goal) => {
    goal.contains?.forEach((childId) => {
      const parsedChild = parseReference(childId, '')
      const childGoalId = parsedChild.goalId
      const parents = parentByChild.get(childGoalId) ?? []
      parents.push(goal.id)
      parentByChild.set(childGoalId, parents)
    })
  })
  return parentByChild
}

function buildDirectRequiresEdges(landscape: SkillLandscape): Map<string, string[]> {
  const edges = new Map<string, string[]>()
  landscape.goals.forEach((goal) => {
    const localRequires = (goal.requires ?? [])
      .map((ref) => parseReference(ref, landscape.landscapeId))
      .filter((ref) => ref.landscapeId === landscape.landscapeId)
      .map((ref) => ref.goalId)
    edges.set(goal.id, localRequires)
  })
  return edges
}

function buildAtomicDirectRequiresEdges(landscape: SkillLandscape): Map<string, string[]> {
  const goalById = new Map(landscape.goals.map((goal) => [goal.id, goal]))
  const edges = new Map<string, string[]>()
  landscape.goals.forEach((goal) => {
    if (!isAtomicGoal(goal)) {
      edges.set(goal.id, [])
      return
    }

    const atomicRequires = (goal.requires ?? [])
      .map((ref) => parseReference(ref, landscape.landscapeId))
      .filter((ref) => ref.landscapeId === landscape.landscapeId)
      .map((ref) => goalById.get(ref.goalId))
      .filter((requiredGoal): requiredGoal is LearningGoal => !!requiredGoal && isAtomicGoal(requiredGoal))
      .map((requiredGoal) => requiredGoal.id)
    edges.set(goal.id, atomicRequires)
  })
  return edges
}

function buildEffectiveRequiresEdges(landscape: SkillLandscape): Map<string, string[]> {
  const goalById = new Map(landscape.goals.map((goal) => [goal.id, goal]))
  const parentByChild = buildParentByChild(landscape.goals)
  const directEdges = buildDirectRequiresEdges(landscape)
  const ancestorCache = new Map<string, string[]>()

  const ancestorsOf = (goalId: string): string[] => {
    const cached = ancestorCache.get(goalId)
    if (cached) return cached

    const result: string[] = []
    const seen = new Set<string>()
    const stack = [...(parentByChild.get(goalId) ?? [])]
    while (stack.length > 0) {
      const current = stack.pop()
      if (!current || seen.has(current)) continue
      seen.add(current)
      result.push(current)
      stack.push(...(parentByChild.get(current) ?? []))
    }
    ancestorCache.set(goalId, result)
    return result
  }

  const effectiveEdges = new Map<string, string[]>()
  landscape.goals.forEach((goal) => {
    const requires = new Set(directEdges.get(goal.id) ?? [])
    ancestorsOf(goal.id).forEach((ancestorId) => {
      const ancestor = goalById.get(ancestorId)
      ancestor?.requires?.forEach((rawRef) => {
        const ref = parseReference(rawRef, landscape.landscapeId)
        if (ref.landscapeId === landscape.landscapeId) requires.add(ref.goalId)
      })
    })
    effectiveEdges.set(goal.id, Array.from(requires))
  })

  return effectiveEdges
}

function buildReverseEdges(edgeMap: Map<string, string[]>): Map<string, string[]> {
  const reverse = new Map<string, string[]>()
  edgeMap.forEach((targets, sourceId) => {
    if (!reverse.has(sourceId)) reverse.set(sourceId, [])
    targets.forEach((targetId) => {
      const existing = reverse.get(targetId) ?? []
      existing.push(sourceId)
      reverse.set(targetId, existing)
    })
  })
  return reverse
}

function createPathChecker(edgeMap: Map<string, string[]>): (startId: string, targetId: string) => boolean {
  const reachableByStart = new Map<string, Set<string>>()

  const reachableFrom = (startId: string): Set<string> => {
    const cached = reachableByStart.get(startId)
    if (cached) return cached

    const seen = new Set<string>()
    const stack = [startId]
    while (stack.length > 0) {
      const current = stack.pop()
      if (!current || seen.has(current)) continue
      seen.add(current)

      for (const next of edgeMap.get(current) ?? []) {
        if (!seen.has(next)) stack.push(next)
      }
    }

    reachableByStart.set(startId, seen)
    return seen
  }

  return (startId, targetId) => startId === targetId || reachableFrom(startId).has(targetId)
}

function createVisibleAtomicPathChecker(
  edgeMap: Map<string, string[]>,
  visibleAtomicGoalIds: Set<string>,
): (startId: string, targetId: string) => boolean {
  const reachableByStart = new Map<string, Set<string>>()

  const reachableFrom = (startId: string): Set<string> => {
    const cached = reachableByStart.get(startId)
    if (cached) return cached

    const seen = new Set<string>()
    const stack = visibleAtomicGoalIds.has(startId) ? [startId] : []
    while (stack.length > 0) {
      const current = stack.pop()
      if (!current || seen.has(current)) continue
      seen.add(current)
      for (const next of edgeMap.get(current) ?? []) {
        if (visibleAtomicGoalIds.has(next) && !seen.has(next)) stack.push(next)
      }
    }
    reachableByStart.set(startId, seen)
    return seen
  }

  return (startId, targetId) => (
    visibleAtomicGoalIds.has(startId)
    && visibleAtomicGoalIds.has(targetId)
    && (startId === targetId || reachableFrom(startId).has(targetId))
  )
}

function findCycle(edgeMap: Map<string, string[]>): string[] | null {
  const visiting = new Set<string>()
  const visited = new Set<string>()
  const stack: string[] = []

  const visit = (goalId: string): string[] | null => {
    if (visiting.has(goalId)) {
      const cycleStart = stack.indexOf(goalId)
      return stack.slice(Math.max(0, cycleStart)).concat(goalId)
    }
    if (visited.has(goalId)) return null

    visiting.add(goalId)
    stack.push(goalId)
    for (const nextId of edgeMap.get(goalId) ?? []) {
      const cycle = visit(nextId)
      if (cycle) return cycle
    }
    stack.pop()
    visiting.delete(goalId)
    visited.add(goalId)
    return null
  }

  for (const goalId of edgeMap.keys()) {
    const cycle = visit(goalId)
    if (cycle) return cycle
  }
  return null
}

function formatGoal(goal: LearningGoal | undefined, goalId: string): string {
  return goal ? `${goal.title} [${goalId}]` : goalId
}

function makeRule(
  id: string,
  status: RuleStatus,
  summary: string,
  metrics?: Record<string, number>,
  details?: string[],
): RuleResult {
  return {
    id,
    status,
    summary,
    ...(metrics ? { metrics } : {}),
    ...(details && details.length > 0 ? { details: details.slice(0, 20) } : {}),
  }
}

function evaluateGraphIntegrity(landscape: SkillLandscape, globalGoalIds: Set<string>): RuleResult {
  const errors: string[] = []
  const goalById = new Map<string, LearningGoal>()

  landscape.goals.forEach((goal) => {
    if (goalById.has(goal.id)) {
      errors.push(`Duplicate goal id ${goal.id}`)
    } else {
      goalById.set(goal.id, goal)
    }
  })

  const requireEdges = new Map<string, string[]>()
  const containsEdges = new Map<string, string[]>()

  landscape.goals.forEach((goal) => {
    const localRequires: string[] = []
    const localContains: string[] = []

    goal.requires?.forEach((rawRef) => {
      const ref = parseReference(rawRef, landscape.landscapeId)
      if (ref.goalId === goal.id && ref.landscapeId === landscape.landscapeId) {
        errors.push(`${formatGoal(goal, goal.id)} requires itself`)
      }
      if (ref.landscapeId === landscape.landscapeId && !goalById.has(ref.goalId) && !globalGoalIds.has(ref.goalId)) {
        errors.push(`${formatGoal(goal, goal.id)} requires missing local goal ${ref.goalId}`)
      }
      if (ref.landscapeId === landscape.landscapeId && goalById.has(ref.goalId)) localRequires.push(ref.goalId)
    })

    goal.contains?.forEach((rawRef) => {
      const ref = parseReference(rawRef, landscape.landscapeId)
      if (ref.goalId === goal.id && ref.landscapeId === landscape.landscapeId) {
        errors.push(`${formatGoal(goal, goal.id)} contains itself`)
      }
      if (ref.landscapeId === landscape.landscapeId && !goalById.has(ref.goalId) && !globalGoalIds.has(ref.goalId)) {
        errors.push(`${formatGoal(goal, goal.id)} contains missing local goal ${ref.goalId}`)
      }
      if (ref.landscapeId === landscape.landscapeId && goalById.has(ref.goalId)) localContains.push(ref.goalId)
    })

    requireEdges.set(goal.id, localRequires)
    containsEdges.set(goal.id, localContains)
  })

  const requiresCycle = findCycle(requireEdges)
  if (requiresCycle) errors.push(`Direct requires cycle: ${requiresCycle.join(' -> ')}`)

  const containsCycle = findCycle(containsEdges)
  if (containsCycle) errors.push(`Contains cycle: ${containsCycle.join(' -> ')}`)

  return makeRule(
    'CQR-001',
    errors.length === 0 ? 'pass' : 'fail',
    errors.length === 0 ? 'Basic graph integrity checks pass.' : `${errors.length} graph integrity issue(s).`,
    {
      goals: landscape.goals.length,
      localReferenceIssues: errors.length,
    },
    errors,
  )
}

function evaluateTypeConsistency(landscape: SkillLandscape): RuleResult {
  const mismatches = landscape.goals.filter((goal) => {
    if (!goal.type) return false
    const canonicalType = isAtomicGoal(goal) ? 'atomic' : 'cluster'
    return goal.type !== canonicalType
  })

  return makeRule(
    'CQR-002',
    mismatches.length === 0 ? 'pass' : 'fail',
    mismatches.length === 0 ? 'Explicit type metadata matches graph structure.' : `${mismatches.length} explicit type mismatch(es).`,
    { mismatches: mismatches.length },
    mismatches.map((goal) => `${formatGoal(goal, goal.id)} declares ${goal.type}`),
  )
}

function normalizeDurationModelForRouteScope(value: unknown): DurationModel | null {
  return value === 'G8' || value === 'G9' ? value : null
}

function terminalAutonomyGoalsForRouteScope(
  goalById: Map<string, LearningGoal>,
  profile: RouteProfile,
  scope: Record<string, unknown>,
  fallbackTerminalAutonomyGoals: LearningGoal[],
): LearningGoal[] {
  const durationModel = normalizeDurationModelForRouteScope(scope.durationModel)
  const clusterIds = durationModel
    ? profile.terminalAutonomyClusterIdsByDurationModel?.[durationModel]
    : undefined
  if (!clusterIds) return fallbackTerminalAutonomyGoals

  return clusterIds
    .flatMap((clusterId) => goalById.get(clusterId)?.contains ?? [])
    .map((goalId) => goalById.get(goalId))
    .filter((goal): goal is LearningGoal => !!goal)
    .filter((goal) => isAtomicGoal(goal) && !isMemoryGoal(goal))
}

function evaluateRouteEndpointCompositionVisibility(
  landscape: SkillLandscape,
  profile: RouteProfile,
  selectedGoals: LearningGoal[],
  terminalAutonomyGoals: LearningGoal[],
  applicabilityCompilation: ApplicabilityCompilationResult,
  effectiveEdges: Map<string, string[]>,
  reverseEffectiveEdges: Map<string, string[]>,
  atomicDirectEdges: Map<string, string[]>,
  reverseAtomicDirectEdges: Map<string, string[]>,
): RuleResult | null {
  if (!profile.compositionViewStage) return null
  const goalById = new Map(landscape.goals.map((goal) => [goal.id, goal]))
  const applicabilityReport = applicabilityCompilation.reports.find(
    (report) => report.landscapeId === profile.landscapeId,
  )
  const compiledJurisdictionsByGoalId = new Map(
    (applicabilityReport?.goals ?? []).map((goal) => [
      goal.goalId,
      new Set(goal.compiledApplicability.jurisdiction ?? []),
    ]),
  )
  const useCompiledJurisdiction = profile.compositionViewApplicabilityMode === 'compiled-jurisdiction'
  const enforceProjectionLocalRoutes = profile.compositionViewRoutePathMode === 'visible-atomic'
  const enforceProjectionLocalAssessmentRequires = (
    profile.landscapeId === CANONICAL_GYM_PHYSICS_LANDSCAPE_ID
  )

  const viewEntries = readCompositionViewFilesForLandscapeId(profile.landscapeId)
    .map((file) => ({ file, view: normalizeCompositionView(loadJson<unknown>(file)) }))
    .filter(({ view }) => view.landscapeId === profile.landscapeId
      && (view.scope.stage === profile.compositionViewStage || view.scope.stage === 'CrossStage'))
  const viewFiles = viewEntries.map(({ file }) => file)

  const missingMotivationScopes: string[] = []
  const missingTerminalScopes: string[] = []
  const unexpectedTerminalScopes: string[] = []
  const emptyExpectedTerminalScopes: string[] = []
  const invalidStageStructureScopes: string[] = []
  const terminalPrerequisiteClosureScopes: string[] = []
  const missingEffectiveMotivationRouteScopes: string[] = []
  const missingDirectMotivationRouteScopes: string[] = []
  const missingEffectiveTerminalRouteScopes: string[] = []
  const missingDirectTerminalRouteScopes: string[] = []
  const missingJurisdictionStageAuthorityScopes: string[] = []
  const ambiguousJurisdictionStageAuthorityScopes: string[] = []
  const uniqueGoalsMissingEffectiveMotivationRoute = new Set<string>()
  const uniqueGoalsMissingDirectMotivationRoute = new Set<string>()
  const uniqueGoalsMissingEffectiveTerminalRoute = new Set<string>()
  const uniqueGoalsMissingDirectTerminalRoute = new Set<string>()
  const uniqueTerminalPrerequisitesMissingFromProjection = new Set<string>()
  const uniqueProjectedRouteTargetsExcludedByProfileSelector = new Set<string>()
  const terminalGoalsMissingCompiledApplicability = useCompiledJurisdiction
    ? terminalAutonomyGoals
      .filter((goal) => (compiledJurisdictionsByGoalId.get(goal.id)?.size ?? 0) === 0)
      .map((goal) => goal.id)
    : []
  let evaluatedProjectionScopes = 0
  let visibleSelectedAtomicGoalOccurrences = 0
  let visibleProfileSelectedAtomicGoalOccurrences = 0
  let visibleProjectedRouteTargetGoalOccurrences = 0
  let visibleProjectedRouteTargetGoalOccurrencesExcludedByProfileSelector = 0
  let visibleProjectedRouteTargetGoalOccurrencesExcludedFromRouteChecks = 0
  let visibleSelectedGoalOccurrencesMissingEffectiveMotivationRoute = 0
  let visibleSelectedGoalOccurrencesMissingDirectMotivationRoute = 0
  let visibleSelectedGoalOccurrencesMissingEffectiveTerminalRoute = 0
  let visibleSelectedGoalOccurrencesMissingDirectTerminalRoute = 0
  let profileSelectorExcludedGoalOccurrencesMissingEffectiveMotivationRoute = 0
  let profileSelectorExcludedGoalOccurrencesMissingDirectMotivationRoute = 0
  let profileSelectorExcludedGoalOccurrencesMissingEffectiveTerminalRoute = 0
  let profileSelectorExcludedGoalOccurrencesMissingDirectTerminalRoute = 0
  let terminalPrerequisiteOccurrencesMissingFromProjection = 0
  let nationalProjectionScopesUsingJurisdictionStageAuthority = 0
  let nationalTargetAtomicGoalOccurrencesExcludedByJurisdictionStageAuthority = 0
  let nationalSelectedGoalOccurrencesExcludedByJurisdictionStageAuthority = 0
  let nationalPrerequisiteOnlyGoalOccurrencesImportedByJurisdictionStageAuthority = 0
  let minRequiredTerminalAutonomyGoals = Number.POSITIVE_INFINITY
  let maxRequiredTerminalAutonomyGoals = 0
  const selectedGoalIds = new Set(selectedGoals.map((goal) => goal.id))

  viewEntries.forEach(({ file, view }) => {
    const matchingStageStructures = enforceProjectionLocalRoutes
      ? collectCompositionStageStructures(view.rootNodes, profile.compositionViewStage!)
      : []
    const scopedTerminalGoals = terminalAutonomyGoalsForRouteScope(
      goalById,
      profile,
      view.scope,
      terminalAutonomyGoals,
    )
    const viewJurisdiction = typeof view.scope.jurisdiction === 'string'
      ? view.scope.jurisdiction
      : null
    const projectionJurisdictions: Array<string | null> = useCompiledJurisdiction
      ? (viewJurisdiction ? [viewJurisdiction] : [...applicabilityCompilation.summary.supportedValues])
      : [null]

    projectionJurisdictions.forEach((jurisdiction) => {
      evaluatedProjectionScopes += 1
      const scopeLabel = `${toRepoPath(file)}${jurisdiction ? ` [${jurisdiction}]` : ''}`

      const scopeFilters = useCompiledJurisdiction
        ? [view.scope.courseProfile, view.scope.durationModel]
          .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
        : []
      const removeGoalsOutsideCompiledProjection = (goalIds: Set<string>) => {
        if (!useCompiledJurisdiction || !jurisdiction) return
        Array.from(goalIds).forEach((goalId) => {
          if (!compiledJurisdictionsByGoalId.get(goalId)?.has(jurisdiction)) {
            goalIds.delete(goalId)
          }
        })
      }
      const visibleTargetAtomicGoalIds = collectRenderedAtomicGoalIdsFromCompositionView(
        landscape,
        file,
        scopeFilters,
        false,
        enforceProjectionLocalRoutes ? profile.compositionViewStage : undefined,
        enforceProjectionLocalRoutes ? profile.motivationAnchorGoalIds : [],
      )
      const visibleAtomicGoalIds = collectRenderedAtomicGoalIdsFromCompositionView(
        landscape,
        file,
        scopeFilters,
        true,
        enforceProjectionLocalRoutes ? profile.compositionViewStage : undefined,
        enforceProjectionLocalRoutes ? profile.motivationAnchorGoalIds : [],
      )
      if (useCompiledJurisdiction && jurisdiction) {
        removeGoalsOutsideCompiledProjection(visibleTargetAtomicGoalIds)
        removeGoalsOutsideCompiledProjection(visibleAtomicGoalIds)
      }
      let jurisdictionStageTargetAuthorityGoalIds: Set<string> | null = null
      let jurisdictionStageVisibleAuthorityGoalIds: Set<string> | null = null
      if (useCompiledJurisdiction && enforceProjectionLocalRoutes && !viewJurisdiction && jurisdiction) {
        // A jurisdiction-resolved national view gets its stage boundary and explicit
        // prerequisite-only support from the matching state view. State targets that
        // the national view does not itself expose are never imported as hidden path nodes.
        const jurisdictionViewEntries = viewEntries.filter(({ view: jurisdictionView }) => {
          if (jurisdictionView.scope.jurisdiction !== jurisdiction) return false
          if (
            typeof view.scope.courseProfile === 'string'
            && jurisdictionView.scope.courseProfile !== view.scope.courseProfile
          ) return false
          if (
            typeof view.scope.durationModel === 'string'
            && jurisdictionView.scope.durationModel !== view.scope.durationModel
          ) return false
          return true
        })
        const authorityProjectionSets = jurisdictionViewEntries.map(({ file: authorityFile, view: authorityView }) => {
          const authorityScopeFilters = [authorityView.scope.courseProfile, authorityView.scope.durationModel]
            .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
          const targetGoalIds = collectRenderedAtomicGoalIdsFromCompositionView(
            landscape,
            authorityFile,
            authorityScopeFilters,
            false,
            profile.compositionViewStage,
            profile.motivationAnchorGoalIds,
          )
          const visibleGoalIds = collectRenderedAtomicGoalIdsFromCompositionView(
            landscape,
            authorityFile,
            authorityScopeFilters,
            true,
            profile.compositionViewStage,
            profile.motivationAnchorGoalIds,
          )
          removeGoalsOutsideCompiledProjection(targetGoalIds)
          removeGoalsOutsideCompiledProjection(visibleGoalIds)
          return { file: authorityFile, targetGoalIds, visibleGoalIds }
        })

        if (authorityProjectionSets.length === 0) {
          missingJurisdictionStageAuthorityScopes.push(scopeLabel)
        } else {
          nationalProjectionScopesUsingJurisdictionStageAuthority += 1
          const jurisdictionStageTargetGoalIds = new Set(authorityProjectionSets[0].targetGoalIds)
          const jurisdictionStageVisibleGoalIds = new Set(authorityProjectionSets[0].visibleGoalIds)
          const authoritySetsAgree = authorityProjectionSets.every(({ targetGoalIds, visibleGoalIds }) => (
            targetGoalIds.size === jurisdictionStageTargetGoalIds.size
            && Array.from(targetGoalIds).every((goalId) => jurisdictionStageTargetGoalIds.has(goalId))
            && visibleGoalIds.size === jurisdictionStageVisibleGoalIds.size
            && Array.from(visibleGoalIds).every((goalId) => jurisdictionStageVisibleGoalIds.has(goalId))
          ))
          if (!authoritySetsAgree) {
            ambiguousJurisdictionStageAuthorityScopes.push(
              `${scopeLabel}: ${authorityProjectionSets.map(({ file: authorityFile }) => toRepoPath(authorityFile)).join(', ')}`,
            )
            authorityProjectionSets.slice(1).forEach(({ targetGoalIds, visibleGoalIds }) => {
              Array.from(jurisdictionStageTargetGoalIds).forEach((goalId) => {
                if (!targetGoalIds.has(goalId)) jurisdictionStageTargetGoalIds.delete(goalId)
              })
              Array.from(jurisdictionStageVisibleGoalIds).forEach((goalId) => {
                if (!visibleGoalIds.has(goalId)) jurisdictionStageVisibleGoalIds.delete(goalId)
              })
            })
          }
          jurisdictionStageTargetAuthorityGoalIds = new Set(jurisdictionStageTargetGoalIds)
          jurisdictionStageVisibleAuthorityGoalIds = new Set(jurisdictionStageVisibleGoalIds)

          const prerequisiteOnlySupportGoalIds = new Set(
            Array.from(visibleAtomicGoalIds)
              .filter((goalId) => !visibleTargetAtomicGoalIds.has(goalId)),
          )
          const excludedTargetGoalIds = Array.from(visibleTargetAtomicGoalIds)
            .filter((goalId) => !jurisdictionStageTargetGoalIds.has(goalId))
          nationalTargetAtomicGoalOccurrencesExcludedByJurisdictionStageAuthority += excludedTargetGoalIds.length
          nationalSelectedGoalOccurrencesExcludedByJurisdictionStageAuthority += excludedTargetGoalIds
            .filter((goalId) => selectedGoalIds.has(goalId))
            .length
          const jurisdictionPrerequisiteOnlySupportGoalIds = Array.from(jurisdictionStageVisibleGoalIds)
            .filter((goalId) => !jurisdictionStageTargetGoalIds.has(goalId))
          nationalPrerequisiteOnlyGoalOccurrencesImportedByJurisdictionStageAuthority += (
            jurisdictionPrerequisiteOnlySupportGoalIds.length
          )
          excludedTargetGoalIds.forEach((goalId) => visibleTargetAtomicGoalIds.delete(goalId))
          visibleAtomicGoalIds.clear()
          visibleTargetAtomicGoalIds.forEach((goalId) => visibleAtomicGoalIds.add(goalId))
          prerequisiteOnlySupportGoalIds.forEach((goalId) => visibleAtomicGoalIds.add(goalId))
          jurisdictionPrerequisiteOnlySupportGoalIds.forEach((goalId) => visibleAtomicGoalIds.add(goalId))
        }
      }
      if (enforceProjectionLocalRoutes) {
        visibleTargetAtomicGoalIds.forEach((goalId) => {
          if (!visibleAtomicGoalIds.has(goalId)) {
            throw new Error(`Route projection lost visible target ${goalId} in ${toRepoPath(file)}`)
          }
        })
      }
      const expectedTerminalGoalIds = scopedTerminalGoals
        .filter((goal) => !useCompiledJurisdiction
          || (!!jurisdiction && compiledJurisdictionsByGoalId.get(goal.id)?.has(jurisdiction)))
        .filter((goal) => !enforceProjectionLocalAssessmentRequires
          || !jurisdictionStageTargetAuthorityGoalIds
          || jurisdictionStageTargetAuthorityGoalIds.has(goal.id))
        .filter((goal) => {
          const extendedData = goal.extendedData as Record<string, unknown> | undefined
          if (
            !enforceProjectionLocalAssessmentRequires
            || extendedData?.applicabilityFromRequires !== true
          ) return true
          const authoritativeSupportGoalIds = jurisdictionStageVisibleAuthorityGoalIds
            ?? visibleAtomicGoalIds
          return (goal.requires ?? [])
            .map((rawRef) => parseReference(rawRef, landscape.landscapeId))
            .filter((ref) => ref.landscapeId === landscape.landscapeId)
            .every((ref) => authoritativeSupportGoalIds.has(ref.goalId))
        })
        .map((goal) => goal.id)
      minRequiredTerminalAutonomyGoals = Math.min(
        minRequiredTerminalAutonomyGoals,
        expectedTerminalGoalIds.length,
      )
      maxRequiredTerminalAutonomyGoals = Math.max(
        maxRequiredTerminalAutonomyGoals,
        expectedTerminalGoalIds.length,
      )
      const actualTerminalGoalIds = terminalAutonomyGoals
        .map((goal) => goal.id)
        .filter((goalId) => visibleTargetAtomicGoalIds.has(goalId))
      const expectedSet = new Set(expectedTerminalGoalIds)
      const actualSet = new Set(actualTerminalGoalIds)
      const visibleExpectedTerminalGoalIds = expectedTerminalGoalIds.filter((goalId) => actualSet.has(goalId))
      const missingGoalIds = expectedTerminalGoalIds.filter((goalId) => !actualSet.has(goalId))
      const unexpectedGoalIds = actualTerminalGoalIds.filter((goalId) => !expectedSet.has(goalId))
      const missingTerminalPrerequisiteIds = enforceProjectionLocalRoutes
        ? visibleExpectedTerminalGoalIds
          .filter((terminalId) => {
            const extendedData = goalById.get(terminalId)?.extendedData as Record<string, unknown> | undefined
            const overrides = extendedData?.applicabilityOverrides as Record<string, unknown> | undefined
            return Array.isArray(overrides?.jurisdiction)
              || (
                enforceProjectionLocalAssessmentRequires
                && extendedData?.applicabilityFromRequires === true
              )
          })
          .flatMap((terminalId) => {
            const terminalGoal = goalById.get(terminalId)
            return (terminalGoal?.requires ?? [])
              .map((rawRef) => parseReference(rawRef, landscape.landscapeId))
              .filter((ref) => ref.landscapeId === landscape.landscapeId)
              .map((ref) => ref.goalId)
              .filter((goalId) => !visibleAtomicGoalIds.has(goalId))
              .map((goalId) => `${terminalId}->${goalId}`)
          })
        : []
      const visibleProfileSelectedGoals = selectedGoals.filter((goal) => visibleTargetAtomicGoalIds.has(goal.id))
      const visibleProjectedRouteTargetGoals = enforceProjectionLocalRoutes
        ? Array.from(visibleTargetAtomicGoalIds)
          .map((goalId) => goalById.get(goalId))
          .filter(isProjectedRouteTargetGoal)
        : visibleProfileSelectedGoals
      // The resolved composition projection is authoritative for learner-facing
      // target semantics. A profile selector may describe the global route lane,
      // but it must never hide an explicitly projected target from a local route
      // check merely because phase/tag metadata is missing or differs.
      const visibleSelectedGoals = visibleProjectedRouteTargetGoals
      const visibleProfileSelectedGoalIds = new Set(visibleProfileSelectedGoals.map((goal) => goal.id))
      const routeCheckedGoalIds = new Set(visibleSelectedGoals.map((goal) => goal.id))
      const projectedTargetsExcludedByProfileSelector = visibleProjectedRouteTargetGoals
        .filter((goal) => !visibleProfileSelectedGoalIds.has(goal.id))
      const projectedTargetsExcludedFromRouteChecks = visibleProjectedRouteTargetGoals
        .filter((goal) => !routeCheckedGoalIds.has(goal.id))
      const projectedTargetIdsExcludedByProfileSelector = new Set(
        projectedTargetsExcludedByProfileSelector.map((goal) => goal.id),
      )
      const hasVisibleEffectiveMotivationPath = createVisibleAtomicPathChecker(
        effectiveEdges,
        visibleAtomicGoalIds,
      )
      const hasVisibleDirectMotivationPath = createVisibleAtomicPathChecker(
        atomicDirectEdges,
        visibleAtomicGoalIds,
      )
      const hasVisibleReverseEffectivePath = createVisibleAtomicPathChecker(
        reverseEffectiveEdges,
        visibleAtomicGoalIds,
      )
      const hasVisibleReverseDirectPath = createVisibleAtomicPathChecker(
        reverseAtomicDirectEdges,
        visibleAtomicGoalIds,
      )
      const goalsMissingEffectiveMotivationRoute = enforceProjectionLocalRoutes
        ? visibleSelectedGoals.filter((goal) => !profile.motivationAnchorGoalIds.some(
          (anchorId) => hasVisibleEffectiveMotivationPath(goal.id, anchorId),
        ))
        : []
      const goalsMissingDirectMotivationRoute = enforceProjectionLocalRoutes
        ? visibleSelectedGoals.filter((goal) => !profile.motivationAnchorGoalIds.some(
          (anchorId) => hasVisibleDirectMotivationPath(goal.id, anchorId),
        ))
        : []
      const goalsMissingEffectiveTerminalRoute = enforceProjectionLocalRoutes
        ? visibleSelectedGoals.filter((goal) => !visibleExpectedTerminalGoalIds.some(
          (terminalId) => hasVisibleReverseEffectivePath(goal.id, terminalId),
        ))
        : []
      const goalsMissingDirectTerminalRoute = enforceProjectionLocalRoutes
        ? visibleSelectedGoals.filter((goal) => !visibleExpectedTerminalGoalIds.some(
          (terminalId) => hasVisibleReverseDirectPath(goal.id, terminalId),
        ))
        : []
      visibleSelectedAtomicGoalOccurrences += visibleSelectedGoals.length
      visibleProfileSelectedAtomicGoalOccurrences += visibleProfileSelectedGoals.length
      visibleProjectedRouteTargetGoalOccurrences += visibleProjectedRouteTargetGoals.length
      visibleProjectedRouteTargetGoalOccurrencesExcludedByProfileSelector += (
        projectedTargetsExcludedByProfileSelector.length
      )
      visibleProjectedRouteTargetGoalOccurrencesExcludedFromRouteChecks += (
        projectedTargetsExcludedFromRouteChecks.length
      )
      visibleSelectedGoalOccurrencesMissingEffectiveMotivationRoute += goalsMissingEffectiveMotivationRoute.length
      visibleSelectedGoalOccurrencesMissingDirectMotivationRoute += goalsMissingDirectMotivationRoute.length
      visibleSelectedGoalOccurrencesMissingEffectiveTerminalRoute += goalsMissingEffectiveTerminalRoute.length
      visibleSelectedGoalOccurrencesMissingDirectTerminalRoute += goalsMissingDirectTerminalRoute.length
      profileSelectorExcludedGoalOccurrencesMissingEffectiveMotivationRoute += goalsMissingEffectiveMotivationRoute
        .filter((goal) => projectedTargetIdsExcludedByProfileSelector.has(goal.id))
        .length
      profileSelectorExcludedGoalOccurrencesMissingDirectMotivationRoute += goalsMissingDirectMotivationRoute
        .filter((goal) => projectedTargetIdsExcludedByProfileSelector.has(goal.id))
        .length
      profileSelectorExcludedGoalOccurrencesMissingEffectiveTerminalRoute += goalsMissingEffectiveTerminalRoute
        .filter((goal) => projectedTargetIdsExcludedByProfileSelector.has(goal.id))
        .length
      profileSelectorExcludedGoalOccurrencesMissingDirectTerminalRoute += goalsMissingDirectTerminalRoute
        .filter((goal) => projectedTargetIdsExcludedByProfileSelector.has(goal.id))
        .length
      terminalPrerequisiteOccurrencesMissingFromProjection += missingTerminalPrerequisiteIds.length
      goalsMissingEffectiveMotivationRoute.forEach((goal) => uniqueGoalsMissingEffectiveMotivationRoute.add(goal.id))
      goalsMissingDirectMotivationRoute.forEach((goal) => uniqueGoalsMissingDirectMotivationRoute.add(goal.id))
      goalsMissingEffectiveTerminalRoute.forEach((goal) => uniqueGoalsMissingEffectiveTerminalRoute.add(goal.id))
      goalsMissingDirectTerminalRoute.forEach((goal) => uniqueGoalsMissingDirectTerminalRoute.add(goal.id))
      projectedTargetsExcludedByProfileSelector.forEach((goal) => {
        uniqueProjectedRouteTargetsExcludedByProfileSelector.add(goal.id)
      })
      missingTerminalPrerequisiteIds.forEach((pair) => {
        uniqueTerminalPrerequisitesMissingFromProjection.add(pair.split('->')[1] ?? pair)
      })

      if (enforceProjectionLocalRoutes && matchingStageStructures.length !== 1) {
        invalidStageStructureScopes.push(
          `${scopeLabel}: expected 1 ${profile.compositionViewStage} structure, got ${matchingStageStructures.length}`,
        )
      }

      if (!profile.motivationAnchorGoalIds.every((goalId) => visibleAtomicGoalIds.has(goalId))) {
        missingMotivationScopes.push(scopeLabel)
      }
      if (expectedTerminalGoalIds.length === 0) {
        emptyExpectedTerminalScopes.push(scopeLabel)
      }
      if (missingGoalIds.length > 0) {
        missingTerminalScopes.push(`${scopeLabel}: ${missingGoalIds.join(', ')}`)
      }
      if (unexpectedGoalIds.length > 0) {
        unexpectedTerminalScopes.push(`${scopeLabel}: ${unexpectedGoalIds.join(', ')}`)
      }
      if (missingTerminalPrerequisiteIds.length > 0) {
        terminalPrerequisiteClosureScopes.push(`${scopeLabel}: ${missingTerminalPrerequisiteIds.join(', ')}`)
      }
      if (goalsMissingEffectiveMotivationRoute.length > 0) {
        missingEffectiveMotivationRouteScopes.push(
          `${scopeLabel}: ${goalsMissingEffectiveMotivationRoute.map((goal) => goal.id).join(', ')}`,
        )
      }
      if (goalsMissingDirectMotivationRoute.length > 0) {
        missingDirectMotivationRouteScopes.push(
          `${scopeLabel}: ${goalsMissingDirectMotivationRoute.map((goal) => goal.id).join(', ')}`,
        )
      }
      if (goalsMissingEffectiveTerminalRoute.length > 0) {
        missingEffectiveTerminalRouteScopes.push(
          `${scopeLabel}: ${goalsMissingEffectiveTerminalRoute.map((goal) => goal.id).join(', ')}`,
        )
      }
      if (goalsMissingDirectTerminalRoute.length > 0) {
        missingDirectTerminalRouteScopes.push(
          `${scopeLabel}: ${goalsMissingDirectTerminalRoute.map((goal) => goal.id).join(', ')}`,
        )
      }
    })
  })

  const pass = viewFiles.length > 0
    && evaluatedProjectionScopes > 0
    && terminalGoalsMissingCompiledApplicability.length === 0
    && invalidStageStructureScopes.length === 0
    && missingJurisdictionStageAuthorityScopes.length === 0
    && ambiguousJurisdictionStageAuthorityScopes.length === 0
    && missingMotivationScopes.length === 0
    && missingTerminalScopes.length === 0
    && unexpectedTerminalScopes.length === 0
    && emptyExpectedTerminalScopes.length === 0
    && terminalPrerequisiteClosureScopes.length === 0
    && missingEffectiveMotivationRouteScopes.length === 0
    && missingDirectMotivationRouteScopes.length === 0
    && missingEffectiveTerminalRouteScopes.length === 0
    && missingDirectTerminalRouteScopes.length === 0
    && visibleProjectedRouteTargetGoalOccurrencesExcludedFromRouteChecks === 0

  return makeRule(
    'CQR-104',
    pass ? 'pass' : 'fail',
    pass
      ? enforceProjectionLocalRoutes
        ? 'Route endpoints are exactly visible and every visible selected goal stays on a visible atomic route from motivation to a terminal in every relevant learner-facing projection scope.'
        : 'Route endpoints are exactly visible in every relevant learner-facing projection scope.'
      : 'Route endpoints or projection-local routes are missing, unexpected, or not applicability-bound in at least one learner-facing projection scope.',
    {
      relevantCompositionViews: viewFiles.length,
      evaluatedProjectionScopes,
      requiredMotivationAnchors: profile.motivationAnchorGoalIds.length,
      minimumRequiredTerminalAutonomyGoals: Number.isFinite(minRequiredTerminalAutonomyGoals)
        ? minRequiredTerminalAutonomyGoals
        : 0,
      requiredTerminalAutonomyGoals: maxRequiredTerminalAutonomyGoals,
      projectionScopesMissingMotivationAnchors: missingMotivationScopes.length,
      projectionScopesMissingTerminalAutonomyGoals: missingTerminalScopes.length,
      projectionScopesWithUnexpectedTerminalAutonomyGoals: unexpectedTerminalScopes.length,
      projectionScopesWithoutExpectedTerminalAutonomyGoals: emptyExpectedTerminalScopes.length,
      terminalGoalsMissingCompiledApplicability: terminalGoalsMissingCompiledApplicability.length,
      projectionScopesWithInvalidStageStructure: invalidStageStructureScopes.length,
      nationalProjectionScopesUsingJurisdictionStageAuthority,
      nationalProjectionScopesMissingJurisdictionStageAuthority: missingJurisdictionStageAuthorityScopes.length,
      nationalProjectionScopesWithAmbiguousJurisdictionStageAuthority: ambiguousJurisdictionStageAuthorityScopes.length,
      nationalTargetAtomicGoalOccurrencesExcludedByJurisdictionStageAuthority,
      nationalSelectedGoalOccurrencesExcludedByJurisdictionStageAuthority,
      nationalPrerequisiteOnlyGoalOccurrencesImportedByJurisdictionStageAuthority,
      projectionScopesWithIncompleteExplicitTerminalPrerequisites: terminalPrerequisiteClosureScopes.length,
      explicitTerminalPrerequisiteOccurrencesMissingFromProjection: terminalPrerequisiteOccurrencesMissingFromProjection,
      uniqueExplicitTerminalPrerequisitesMissingFromProjection: uniqueTerminalPrerequisitesMissingFromProjection.size,
      projectionLocalRouteChecksEnabled: enforceProjectionLocalRoutes ? 1 : 0,
      visibleSelectedAtomicGoalOccurrences,
      visibleProfileSelectedAtomicGoalOccurrences,
      visibleProjectedRouteTargetGoalOccurrences,
      visibleProjectedRouteTargetGoalOccurrencesExcludedByProfileSelector,
      uniqueProjectedRouteTargetsExcludedByProfileSelector: uniqueProjectedRouteTargetsExcludedByProfileSelector.size,
      visibleProjectedRouteTargetGoalOccurrencesExcludedFromRouteChecks,
      projectionScopesMissingEffectiveMotivationRoutes: missingEffectiveMotivationRouteScopes.length,
      projectionScopesMissingDirectMotivationRoutes: missingDirectMotivationRouteScopes.length,
      projectionScopesMissingEffectiveTerminalRoutes: missingEffectiveTerminalRouteScopes.length,
      projectionScopesMissingDirectTerminalRoutes: missingDirectTerminalRouteScopes.length,
      visibleSelectedGoalOccurrencesMissingEffectiveMotivationRoute,
      visibleSelectedGoalOccurrencesMissingDirectMotivationRoute,
      visibleSelectedGoalOccurrencesMissingEffectiveTerminalRoute,
      visibleSelectedGoalOccurrencesMissingDirectTerminalRoute,
      profileSelectorExcludedGoalOccurrencesMissingEffectiveMotivationRoute,
      profileSelectorExcludedGoalOccurrencesMissingDirectMotivationRoute,
      profileSelectorExcludedGoalOccurrencesMissingEffectiveTerminalRoute,
      profileSelectorExcludedGoalOccurrencesMissingDirectTerminalRoute,
      uniqueVisibleSelectedGoalsMissingEffectiveMotivationRoute: uniqueGoalsMissingEffectiveMotivationRoute.size,
      uniqueVisibleSelectedGoalsMissingDirectMotivationRoute: uniqueGoalsMissingDirectMotivationRoute.size,
      uniqueVisibleSelectedGoalsMissingEffectiveTerminalRoute: uniqueGoalsMissingEffectiveTerminalRoute.size,
      uniqueVisibleSelectedGoalsMissingDirectTerminalRoute: uniqueGoalsMissingDirectTerminalRoute.size,
    },
    [
      ...(viewFiles.length === 0 ? ['No relevant composition view found for configured route scope.'] : []),
      ...terminalGoalsMissingCompiledApplicability.map((goalId) => `Missing compiled applicability: ${goalId}`),
      ...invalidStageStructureScopes.map((scope) => `Invalid stage-local composition structure: ${scope}`),
      ...missingJurisdictionStageAuthorityScopes.map(
        (scope) => `Missing jurisdiction-specific stage-placement authority for national projection: ${scope}`,
      ),
      ...ambiguousJurisdictionStageAuthorityScopes.map(
        (scope) => `Ambiguous jurisdiction-specific stage-placement authority for national projection: ${scope}`,
      ),
      ...missingMotivationScopes.map((scope) => `Missing motivation anchor(s): ${scope}`),
      ...emptyExpectedTerminalScopes.map((scope) => `No applicable terminal autonomy goal: ${scope}`),
      ...missingTerminalScopes.map((scope) => `Missing terminal autonomy goal(s): ${scope}`),
      ...unexpectedTerminalScopes.map((scope) => `Unexpected terminal autonomy goal(s): ${scope}`),
      ...missingEffectiveTerminalRouteScopes.map((scope) => `No projection-local effective terminal route: ${scope}`),
      ...missingDirectTerminalRouteScopes.map((scope) => `No projection-local direct terminal route: ${scope}`),
      ...missingEffectiveMotivationRouteScopes.map((scope) => `No projection-local effective motivation route: ${scope}`),
      ...missingDirectMotivationRouteScopes.map((scope) => `No projection-local direct motivation route: ${scope}`),
      ...terminalPrerequisiteClosureScopes.map((scope) => `Explicitly scoped terminal prerequisite(s) missing from projection: ${scope}`),
    ],
  )
}

function normalizeExamTextForInspection(value: unknown): string {
  return String(value ?? '')
    .toLocaleLowerCase('de')
    .normalize('NFKC')
    .replace(/ü/g, 'ue')
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ß/g, 'ss')
    .replace(/\s+/g, ' ')
    .trim()
}

function hasExamSubtaskMarkers(normalizedTask: string): boolean {
  return /(?:\b1\.|\ba\)|\baufgabe\s+1\b|\bteilaufgabe\b)/u.test(normalizedTask)
}

function hasScoringStructure(goal: LearningGoal): boolean {
  const scoring = goal.examData?.scoring
  return !!scoring
    && Number(scoring.maxPoints) > 0
    && Number(scoring.passingPoints) > 0
    && Array.isArray(scoring.steps)
    && scoring.steps.length > 0
    && scoring.steps.every((step) =>
      typeof step.id === 'string'
      && step.id.trim().length > 0
      && Number(step.points) > 0
      && typeof step.description === 'string'
      && step.description.trim().length > 0)
}

function hasBlockingExamReviewStatus(goal: LearningGoal): boolean {
  const status = String(goal.examData?.reviewStatus ?? '').trim().toLowerCase()
  return status.length > 0 && status !== 'released'
}

function isPlaceholderExamData(goal: LearningGoal): boolean {
  if (!goal.examData) return false
  const task = normalizeExamTextForInspection(goal.examData.taskContent)
  const solution = normalizeExamTextForInspection(goal.examData.solutionContent)
  if (/^eine materialgestuetzte j\d+[- ]uebungsaufgabe\b/u.test(task)) return true
  if (/^eine integrative sek[- ]i[- ]abschlussaufgabe\b/u.test(task)) return true
  if (task.includes('uebungsaufgabe verbindet') && !hasExamSubtaskMarkers(task)) return true
  return solution.startsWith('die loesung zeigt ')
    && !hasExamSubtaskMarkers(task)
    && !/\b\d+[,.]?\d*\b/u.test(task)
}

function concreteExamReadinessIssues(goal: LearningGoal): string[] {
  if (!goal.examData) return ['missing examData']
  const issues: string[] = []
  if (hasBlockingExamReviewStatus(goal)) {
    issues.push(`reviewStatus=${String(goal.examData.reviewStatus)}`)
  }
  if (typeof goal.examData.taskContent !== 'string' || goal.examData.taskContent.trim().length === 0) {
    issues.push('missing taskContent')
  }
  if (typeof goal.examData.solutionContent !== 'string' || goal.examData.solutionContent.trim().length === 0) {
    issues.push('missing solutionContent')
  }
  if (!hasScoringStructure(goal)) {
    issues.push('incomplete scoring')
  }
  if (isPlaceholderExamData(goal)) {
    issues.push('placeholder examData')
  }
  return issues
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
    : []
}

function examReleaseCoverageIssues(goal: LearningGoal): string[] {
  if (!goal.examData) return ['missing examData']
  const issues: string[] = []
  if (String(goal.examData.reviewStatus ?? '').trim().toLowerCase() !== 'released') {
    issues.push('reviewStatus is not released')
  }
  if (stringArray(goal.examData.coveredGoalIds).length === 0) {
    issues.push('missing coveredGoalIds')
  }
  if (stringArray(goal.examData.coveredStrands).length === 0) {
    issues.push('missing coveredStrands')
  }
  if (stringArray(goal.examData.demandLevels).length === 0) {
    issues.push('missing demandLevels')
  }
  return issues
}

function evaluateRouteProfile(
  landscape: SkillLandscape,
  profile: RouteProfile,
  applicabilityCompilation: ApplicabilityCompilationResult,
): ScopeStatus {
  const goalById = new Map(landscape.goals.map((goal) => [goal.id, goal]))
  const selectedGoals = landscape.goals.filter(profile.goalSelector)
  const effectiveEdges = buildEffectiveRequiresEdges(landscape)
  const reverseEffectiveEdges = buildReverseEdges(effectiveEdges)
  const atomicDirectEdges = buildAtomicDirectRequiresEdges(landscape)
  const reverseAtomicDirectEdges = buildReverseEdges(atomicDirectEdges)
  const hasEffectivePath = createPathChecker(effectiveEdges)
  const hasReverseEffectivePath = createPathChecker(reverseEffectiveEdges)
  const hasAtomicDirectPath = createPathChecker(atomicDirectEdges)
  const hasReverseAtomicDirectPath = createPathChecker(reverseAtomicDirectEdges)
  const terminalAutonomyGoals = profile.terminalAutonomyClusterIds
    .flatMap((clusterId) => goalById.get(clusterId)?.contains ?? [])
    .map((goalId) => goalById.get(goalId))
    .filter((goal): goal is LearningGoal => !!goal)
    .filter((goal) => isAtomicGoal(goal) && !isMemoryGoal(goal))
  const terminalGoalIds = terminalAutonomyGoals.map((goal) => goal.id)

  const missingEffectiveMotivation = selectedGoals.filter((goal) =>
    !profile.motivationAnchorGoalIds.some((anchorId) => hasEffectivePath(goal.id, anchorId)))
  const missingEffectiveTerminal = selectedGoals.filter((goal) =>
    !terminalGoalIds.some((terminalId) => hasReverseEffectivePath(goal.id, terminalId)))

  const missingDirectMotivation = selectedGoals.filter((goal) =>
    !profile.motivationAnchorGoalIds.some((anchorId) => hasAtomicDirectPath(goal.id, anchorId)))
  const missingDirectTerminal = selectedGoals.filter((goal) =>
    !terminalGoalIds.some((terminalId) => hasReverseAtomicDirectPath(goal.id, terminalId)))

  const scopedClusterRequires = landscape.goals.filter((goal) =>
    !isAtomicGoal(goal) && profile.clusterSelector(goal) && (goal.requires?.length ?? 0) > 0)

  const terminalAutonomyGoalsWithoutExamData = terminalAutonomyGoals.filter((goal) => !goal.examData)
  const terminalAutonomyGoalsWithWeakExamData = terminalAutonomyGoals
    .map((goal) => ({ goal, issues: concreteExamReadinessIssues(goal).filter((issue) => issue !== 'missing examData') }))
    .filter((entry) => entry.issues.length > 0)
  const terminalAutonomyGoalsWithMissingReleaseCoverage = terminalAutonomyGoals
    .map((goal) => ({ goal, issues: examReleaseCoverageIssues(goal).filter((issue) => issue !== 'missing examData') }))
    .filter((entry) => entry.issues.length > 0)
  const routeEndpointCompositionVisibility = evaluateRouteEndpointCompositionVisibility(
    landscape,
    profile,
    selectedGoals,
    terminalAutonomyGoals,
    applicabilityCompilation,
    effectiveEdges,
    reverseEffectiveEdges,
    atomicDirectEdges,
    reverseAtomicDirectEdges,
  )

  const rules: RuleResult[] = [
    makeRule(
      'CQR-101',
      missingEffectiveMotivation.length === 0 && missingEffectiveTerminal.length === 0 ? 'pass' : 'fail',
      missingEffectiveMotivation.length === 0 && missingEffectiveTerminal.length === 0
        ? 'Effective route coverage is complete for the configured scope.'
        : 'Effective route coverage has missing route segments.',
      {
        selectedAtomicGoals: selectedGoals.length,
        missingMotivationPath: missingEffectiveMotivation.length,
        missingTerminalPath: missingEffectiveTerminal.length,
      },
      [
        ...missingEffectiveMotivation.map((goal) => `No effective motivation path: ${formatGoal(goal, goal.id)}`),
        ...missingEffectiveTerminal.map((goal) => `No effective terminal path: ${formatGoal(goal, goal.id)}`),
      ],
    ),
    makeRule(
      'CQR-102',
      missingDirectMotivation.length === 0 && missingDirectTerminal.length === 0 ? 'pass' : 'warn',
      missingDirectMotivation.length === 0 && missingDirectTerminal.length === 0
        ? 'Direct atomic route coverage is complete for the configured scope.'
        : 'Direct atomic route coverage still needs migration work.',
      {
        selectedAtomicGoals: selectedGoals.length,
        missingDirectMotivationPath: missingDirectMotivation.length,
        missingDirectTerminalPath: missingDirectTerminal.length,
      },
      [
        ...missingDirectMotivation.map((goal) => `No direct atomic motivation path: ${formatGoal(goal, goal.id)}`),
        ...missingDirectTerminal.map((goal) => `No direct atomic terminal path: ${formatGoal(goal, goal.id)}`),
      ],
    ),
    makeRule(
      'CQR-103',
      scopedClusterRequires.length === 0 ? 'pass' : 'warn',
      scopedClusterRequires.length === 0
        ? 'No scoped cluster-level requires remain.'
        : `${scopedClusterRequires.length} scoped cluster-level requires remain.`,
      { scopedClusterRequires: scopedClusterRequires.length },
      scopedClusterRequires.map((goal) => `${formatGoal(goal, goal.id)} has ${goal.requires.length} requires`),
    ),
    ...(routeEndpointCompositionVisibility ? [routeEndpointCompositionVisibility] : []),
    makeRule(
      'CQR-201',
      terminalAutonomyGoalsWithoutExamData.length === 0 ? 'pass' : 'warn',
      terminalAutonomyGoalsWithoutExamData.length === 0
        ? 'All configured terminal autonomy goals have examData.'
        : `${terminalAutonomyGoalsWithoutExamData.length} terminal autonomy goal(s) lack examData.`,
      {
        terminalAutonomyGoals: terminalAutonomyGoals.length,
        terminalAutonomyGoalsWithExamData: terminalAutonomyGoals.length - terminalAutonomyGoalsWithoutExamData.length,
        terminalAutonomyGoalsWithoutExamData: terminalAutonomyGoalsWithoutExamData.length,
      },
      terminalAutonomyGoalsWithoutExamData.map((goal) => `Missing examData: ${formatGoal(goal, goal.id)}`),
    ),
    makeRule(
      'CQR-202',
      terminalAutonomyGoalsWithWeakExamData.length === 0 ? 'pass' : 'fail',
      terminalAutonomyGoalsWithWeakExamData.length === 0
        ? 'All terminal autonomy examData is concrete enough for hard exam mode.'
        : `${terminalAutonomyGoalsWithWeakExamData.length} terminal autonomy examData item(s) are placeholders or incomplete.`,
      {
        terminalAutonomyGoals: terminalAutonomyGoals.length,
        concreteExamData: terminalAutonomyGoals.length - terminalAutonomyGoalsWithWeakExamData.length,
        weakExamData: terminalAutonomyGoalsWithWeakExamData.length,
      },
      terminalAutonomyGoalsWithWeakExamData.map(({ goal, issues }) =>
        `Weak examData: ${formatGoal(goal, goal.id)} (${issues.join(', ')})`),
    ),
    makeRule(
      'CQR-203',
      terminalAutonomyGoalsWithMissingReleaseCoverage.length === 0 ? 'pass' : 'warn',
      terminalAutonomyGoalsWithMissingReleaseCoverage.length === 0
        ? 'All terminal autonomy examData has release and coverage metadata.'
        : `${terminalAutonomyGoalsWithMissingReleaseCoverage.length} terminal autonomy examData item(s) lack release or coverage metadata.`,
      {
        terminalAutonomyGoals: terminalAutonomyGoals.length,
        releasedCoverageCompleteExamData: terminalAutonomyGoals.length - terminalAutonomyGoalsWithMissingReleaseCoverage.length,
        releaseCoverageIncompleteExamData: terminalAutonomyGoalsWithMissingReleaseCoverage.length,
      },
      terminalAutonomyGoalsWithMissingReleaseCoverage.map(({ goal, issues }) =>
        `Incomplete exam release/coverage: ${formatGoal(goal, goal.id)} (${issues.join(', ')})`),
    ),
  ]

  return {
    scopeId: profile.profileId,
    label: profile.label,
    selectedAtomicGoals: selectedGoals.length,
    maturity: deriveScopeMaturity(rules),
    rules,
  }
}

function normalizeText(value: unknown): string {
  return String(value ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim()
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nested]) => `${JSON.stringify(key)}:${stableJson(nested)}`)
      .join(',')}}`
  }
  return JSON.stringify(value)
}

function statusWithoutGeneratedAt(status: StatusDocument): Omit<StatusDocument, 'generatedAt'> {
  const rest: Partial<StatusDocument> = { ...status }
  delete rest.generatedAt
  return rest as Omit<StatusDocument, 'generatedAt'>
}

function comparableStatusPayload(status: StatusDocument): unknown {
  return JSON.parse(JSON.stringify(statusWithoutGeneratedAt(status)))
}

function reusableGeneratedAt(nextStatus: StatusDocument): string | null {
  if (!existsSync(statusJsonPath)) return null
  try {
    const existingStatus = loadJson<StatusDocument>(statusJsonPath)
    if (stableJson(comparableStatusPayload(existingStatus)) !== stableJson(comparableStatusPayload(nextStatus))) {
      return null
    }
    return typeof existingStatus.generatedAt === 'string' && existingStatus.generatedAt.trim()
      ? existingStatus.generatedAt
      : null
  } catch {
    return null
  }
}

function fingerprintGoal(goal: LearningGoal, ruleVersion: string): string {
  const payload = stableJson({
    ruleVersion,
    goalId: goal.id,
    shortKey: goal.shortKey ?? '',
    title: normalizeText(goal.title),
    titleEn: normalizeText((goal as { titleEn?: string }).titleEn),
    description: normalizeText(goal.description),
    descriptionEn: normalizeText((goal as { descriptionEn?: string }).descriptionEn),
    phase: normalizeText(goal.dimensionTags?.phase),
    area: normalizeText(goal.dimensionTags?.area),
    topicCode: normalizeText(goal.dimensionTags?.topicCode),
    nodeKind: normalizeText(goal.nodeKind),
  })
  return `sha256:${createHash('sha256').update(payload).digest('hex')}`
}

function collectScopeGoalIds(rootGoalIds: string[], goalById: Map<string, LearningGoal>): Set<string> {
  const result = new Set<string>()
  const visiting = new Set<string>()

  const visit = (goalId: string) => {
    if (result.has(goalId) || visiting.has(goalId)) return
    const goal = goalById.get(goalId)
    if (!goal) return
    visiting.add(goalId)
    result.add(goalId)
    goal.contains?.forEach(visit)
    visiting.delete(goalId)
  }

  rootGoalIds.forEach(visit)
  return result
}

function parseReviewRecords(path: string): { records: ReviewRecord[]; parseErrors: string[] } {
  if (!existsSync(path)) return { records: [], parseErrors: [`Missing review file: ${toRepoPath(path)}`] }

  const parseErrors: string[] = []
  const records = readFileSync(path, 'utf8')
    .split(/\r?\n/)
    .map((line, index) => ({ line: line.trim(), lineNumber: index + 1 }))
    .filter(({ line }) => line.length > 0)
    .flatMap(({ line, lineNumber }) => {
      try {
        return [JSON.parse(line) as ReviewRecord]
      } catch (error) {
        parseErrors.push(`Line ${lineNumber}: ${(error as Error).message}`)
        return []
      }
  })
  return { records, parseErrors }
}

function parseMemoryCardReviewRecords(path: string): { records: MemoryCardReviewRecord[]; parseErrors: string[] } {
  if (!existsSync(path)) return { records: [], parseErrors: [`Missing review file: ${toRepoPath(path)}`] }

  const parseErrors: string[] = []
  const records = readFileSync(path, 'utf8')
    .split(/\r?\n/)
    .map((line, index) => ({ line: line.trim(), lineNumber: index + 1 }))
    .filter(({ line }) => line.length > 0)
    .flatMap(({ line, lineNumber }) => {
      try {
        return [JSON.parse(line) as MemoryCardReviewRecord]
      } catch (error) {
        parseErrors.push(`Line ${lineNumber}: ${(error as Error).message}`)
        return []
      }
    })
  return { records, parseErrors }
}

function parseMemoryCardReviewCardRecords(path: string): { records: MemoryCardReviewCardRecord[]; parseErrors: string[] } {
  if (!existsSync(path)) return { records: [], parseErrors: [`Missing card review file: ${toRepoPath(path)}`] }

  const parseErrors: string[] = []
  const records = readFileSync(path, 'utf8')
    .split(/\r?\n/)
    .map((line, index) => ({ line: line.trim(), lineNumber: index + 1 }))
    .filter(({ line }) => line.length > 0)
    .flatMap(({ line, lineNumber }) => {
      try {
        return [JSON.parse(line) as MemoryCardReviewCardRecord]
      } catch (error) {
        parseErrors.push(`Line ${lineNumber}: ${(error as Error).message}`)
        return []
      }
    })
  return { records, parseErrors }
}

function memoryDeckIdsFromGoal(goal: LearningGoal): string[] {
  return (goal.tags ?? [])
    .filter((tag) => tag.startsWith('srs-deck:'))
    .map((tag) => tag.slice('srs-deck:'.length))
    .filter(Boolean)
}

function memoryVocabularySources(goal: LearningGoal): string[] {
  const extendedData = (goal as { extendedData?: Record<string, unknown> }).extendedData
  if (!extendedData) return []
  return [extendedData.vocabularySource, extendedData.vocabularySourceEn]
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
}

function resolveVocabularySourcePath(source: string): string {
  if (source.startsWith('/data/')) {
    return resolve(repoRoot, 'app/public', source.replace(/^\//, ''))
  }
  return resolve(repoRoot, source.replace(/^\//, ''))
}

function isPrimaryMemoryDeckSource(source: string): boolean {
  return !/(^|[._-])en(?=\.json$|[._-])/i.test(source)
}

function fingerprintMemoryCard(card: MemoryDeckCard, ruleVersion: string): string {
  const payload = stableJson({
    ruleVersion,
    deckId: card.deckId,
    cardId: card.cardId,
    front: card.front,
    back: card.back,
    category: card.category,
    tags: card.tags,
  })
  return `sha256:${createHash('sha256').update(payload).digest('hex')}`
}

function memoryCardKey(deckId: string, cardId: string): string {
  return `${deckId}::${cardId}`
}

interface MemoryDeckEvidence {
  memoryGoalIds: Set<string>
  deckIdsByMemoryGoalId: Map<string, Set<string>>
  knownDeckIds: Set<string>
  deckFiles: number
  cardRows: number
  primaryCards: MemoryDeckCard[]
  errors: string[]
}

interface MemoryDeckCard {
  deckId: string
  cardId: string
  source: string
  front: string
  back: string
  category: string
  tags: string[]
}

interface MemoryVisibilityReport {
  scopes: number
  checkedMemoryRequiredGoals: number
  missingVisibleMemoryGoals: number
  errors: string[]
}

function collectMemoryDeckEvidence(landscape: SkillLandscape): MemoryDeckEvidence {
  const evidence: MemoryDeckEvidence = {
    memoryGoalIds: new Set(),
    deckIdsByMemoryGoalId: new Map(),
    knownDeckIds: new Set(),
    deckFiles: 0,
    cardRows: 0,
    primaryCards: [],
    errors: [],
  }

  landscape.goals.filter(isMemoryGoal).forEach((goal) => {
    evidence.memoryGoalIds.add(goal.id)
    const deckIds = new Set(memoryDeckIdsFromGoal(goal))
    memoryVocabularySources(goal).forEach((source) => {
      const sourcePath = resolveVocabularySourcePath(source)
      if (!existsSync(sourcePath)) {
        evidence.errors.push(`${formatGoal(goal, goal.id)}: missing deck file ${source}`)
        return
      }
      try {
        const parsed = loadJson<{ deckId?: unknown, cards?: unknown[] }>(sourcePath)
        evidence.deckFiles += 1
        if (typeof parsed.deckId !== 'string' || parsed.deckId.trim().length === 0) {
          evidence.errors.push(`${formatGoal(goal, goal.id)}: deck file ${source} has no deckId`)
        } else {
          deckIds.add(parsed.deckId)
        }
        if (!Array.isArray(parsed.cards)) {
          evidence.errors.push(`${formatGoal(goal, goal.id)}: deck file ${source} has no cards array`)
        } else {
          evidence.cardRows += parsed.cards.length
          if (typeof parsed.deckId === 'string' && parsed.deckId.trim().length > 0 && isPrimaryMemoryDeckSource(source)) {
            parsed.cards.forEach((card, index) => {
              if (!card || typeof card !== 'object') {
                evidence.errors.push(`${formatGoal(goal, goal.id)}: deck file ${source} card ${index + 1} is not an object`)
                return
              }
              const row = card as Record<string, unknown>
              const cardId = typeof row.id === 'string' ? row.id.trim() : ''
              if (!cardId) {
                evidence.errors.push(`${formatGoal(goal, goal.id)}: deck file ${source} card ${index + 1} has no id`)
                return
              }
              evidence.primaryCards.push({
                deckId: parsed.deckId,
                cardId,
                source,
                front: normalizeText(row.front),
                back: normalizeText(row.back),
                category: normalizeText(row.category),
                tags: Array.isArray(row.tags) ? row.tags.map((tag) => normalizeText(tag)).filter(Boolean) : [],
              })
            })
          }
        }
      } catch (error) {
        evidence.errors.push(`${formatGoal(goal, goal.id)}: cannot parse deck file ${source}: ${(error as Error).message}`)
      }
    })
    if (deckIds.size === 0) {
      evidence.errors.push(`${formatGoal(goal, goal.id)}: memory goal has no srs-deck tag or readable deck file`)
    }
    evidence.deckIdsByMemoryGoalId.set(goal.id, deckIds)
    deckIds.forEach((deckId) => evidence.knownDeckIds.add(deckId))
  })

  return evidence
}

function collectCompositionViewVisibleGoalIds(
  viewPath: string,
  goalById: Map<string, LearningGoal>,
): { visibleGoalIds: Set<string>; errors: string[] } {
  const errors: string[] = []
  const visibleGoalIds = new Set<string>()
  const absoluteViewPath = resolve(repoRoot, viewPath)
  if (!existsSync(absoluteViewPath)) {
    return {
      visibleGoalIds,
      errors: [`Composition view missing: ${viewPath}`],
    }
  }

  const addSubtree = (goalId: string, visiting = new Set<string>()) => {
    if (visibleGoalIds.has(goalId) || visiting.has(goalId)) return
    const goal = goalById.get(goalId)
    if (!goal) {
      errors.push(`${viewPath}: references missing goal ${goalId}`)
      return
    }
    visiting.add(goalId)
    visibleGoalIds.add(goalId)
    ;(goal.contains ?? []).forEach((childId) => addSubtree(childId, visiting))
    visiting.delete(goalId)
  }

  const visitNode = (node: unknown) => {
    if (!node || typeof node !== 'object') return
    const row = node as {
      kind?: unknown
      goalId?: unknown
      projectionRole?: unknown
      children?: unknown
    }
    if (row.projectionRole === 'prerequisiteOnly') return
    if (row.kind === 'canonicalSubtree') {
      if (typeof row.goalId === 'string' && row.goalId.trim()) {
        addSubtree(row.goalId)
      } else {
        errors.push(`${viewPath}: canonicalSubtree without goalId`)
      }
      return
    }
    if (row.kind === 'goalEntry') {
      if (typeof row.goalId === 'string' && row.goalId.trim()) {
        if (goalById.has(row.goalId)) {
          visibleGoalIds.add(row.goalId)
        } else {
          errors.push(`${viewPath}: goalEntry references missing goal ${row.goalId}`)
        }
      } else {
        errors.push(`${viewPath}: goalEntry without goalId`)
      }
      return
    }
    if (Array.isArray(row.children)) {
      row.children.forEach(visitNode)
    }
  }

  try {
    const parsed = loadJson<{ rootNodes?: unknown[] }>(absoluteViewPath)
    if (!Array.isArray(parsed.rootNodes)) {
      errors.push(`${viewPath}: rootNodes must be an array`)
      return { visibleGoalIds, errors }
    }
    parsed.rootNodes.forEach(visitNode)
  } catch (error) {
    errors.push(`${viewPath}: cannot parse composition view (${(error as Error).message})`)
  }

  return { visibleGoalIds, errors }
}

function collectMemoryVisibilityReport(
  config: MemoryCardReviewConfig,
  goalById: Map<string, LearningGoal>,
  currentRecords: MemoryCardReviewRecord[],
): MemoryVisibilityReport {
  const report: MemoryVisibilityReport = {
    scopes: 0,
    checkedMemoryRequiredGoals: 0,
    missingVisibleMemoryGoals: 0,
    errors: [],
  }
  const configuredScopes = Array.isArray(config.visibilityScopes) ? config.visibilityScopes : []
  const memoryRequiredRecords = currentRecords.filter((record) => record.status === 'memory_required')
  const coveredMemoryRequiredGoalIds = new Set<string>()
  const visibleMemoryGoalIdsAcrossScopes = new Set<string>()

  if (config.visibilityScopes !== undefined && !Array.isArray(config.visibilityScopes)) {
    report.errors.push(`${config.reviewId}: visibilityScopes must be an array`)
  }
  if (
    config.visibilityScopeCoverageRequired !== undefined
    && typeof config.visibilityScopeCoverageRequired !== 'boolean'
  ) {
    report.errors.push(`${config.reviewId}: visibilityScopeCoverageRequired must be a boolean`)
  }
  if (config.visibilityScopeCoverageRequired === true && configuredScopes.length === 0) {
    report.errors.push(
      `${config.reviewId}: visibilityScopeCoverageRequired requires at least one visibilityScopes entry`,
    )
  }

  configuredScopes.forEach((scope, index) => {
    if (!scope || typeof scope.label !== 'string' || !scope.label.trim()) {
      report.errors.push(`${config.reviewId}: visibilityScopes[${index}].label must be a non-empty string`)
      return
    }
    if (typeof scope.viewPath !== 'string' || !scope.viewPath.trim()) {
      report.errors.push(`${config.reviewId}: visibilityScopes[${index}].viewPath must be a non-empty string`)
      return
    }
    report.scopes += 1
    const { visibleGoalIds, errors } = collectCompositionViewVisibleGoalIds(scope.viewPath, goalById)
    const visibleMemoryGoalIds = new Set(Array.from(visibleGoalIds)
      .filter((goalId) => {
        const goal = goalById.get(goalId)
        return !!goal && isMemoryGoal(goal)
      }))
    visibleMemoryGoalIds.forEach((goalId) => visibleMemoryGoalIdsAcrossScopes.add(goalId))
    const memoryRequiredInView = memoryRequiredRecords
      .filter((record) => visibleGoalIds.has(record.goalId))
    memoryRequiredInView.forEach((record) => coveredMemoryRequiredGoalIds.add(record.goalId))
    const missingVisibleMemoryGoalRecords = memoryRequiredInView
      .filter((record) => !(record.memoryGoalIds ?? []).some((memoryGoalId) => visibleMemoryGoalIds.has(memoryGoalId)))

    errors.forEach((error) => report.errors.push(`${config.reviewId}: ${error}`))
    missingVisibleMemoryGoalRecords.forEach((record) => {
      report.errors.push(
        `${config.reviewId}: ${scope.label}: ${formatGoal(goalById.get(record.goalId), record.goalId)} is visible, but none of its referenced memoryGoalIds is visible in ${scope.viewPath}`,
      )
    })
    report.checkedMemoryRequiredGoals += memoryRequiredInView.length
    report.missingVisibleMemoryGoals += missingVisibleMemoryGoalRecords.length
  })

  if (config.visibilityScopeCoverageRequired === true) {
    memoryRequiredRecords
      .filter((record) => !coveredMemoryRequiredGoalIds.has(record.goalId))
      .forEach((record) => report.errors.push(
        `${config.reviewId}: visibility coverage required: ${formatGoal(goalById.get(record.goalId), record.goalId)} is not visible in any configured scope`,
      ))
    const referencedMemoryGoalIds = new Set(memoryRequiredRecords
      .flatMap((record) => record.memoryGoalIds ?? []))
    referencedMemoryGoalIds.forEach((memoryGoalId) => {
      if (!visibleMemoryGoalIdsAcrossScopes.has(memoryGoalId)) {
        report.errors.push(
          `${config.reviewId}: visibility coverage required: referenced memory goal ${formatGoal(goalById.get(memoryGoalId), memoryGoalId)} is not visible in any configured scope`,
        )
      }
    })
  }

  return report
}

const memoryCardReviewStatuses: MemoryCardReviewStatus[] = [
  'no_memory_needed',
  'memory_required',
  'needs_developer_review',
]

const memoryCardReviewCardStatuses: MemoryCardReviewCardStatus[] = [
  'kept',
  'remove',
  'needs_developer_review',
]

function validateMemoryCardRecordShape(
  record: MemoryCardReviewRecord,
  config: MemoryCardReviewConfig,
  goalById: Map<string, LearningGoal>,
  deckEvidence: MemoryDeckEvidence,
): string[] {
  const errors: string[] = []
  if (record.schemaVersion !== 1) errors.push(`${record.goalId}: schemaVersion must be 1`)
  if (record.reviewId !== config.reviewId) errors.push(`${record.goalId}: reviewId does not match ${config.reviewId}`)
  if (record.ruleVersion !== config.ruleVersion) errors.push(`${record.goalId}: ruleVersion does not match ${config.ruleVersion}`)
  if (record.landscapeId !== config.landscapeId) errors.push(`${record.goalId}: landscapeId does not match ${config.landscapeId}`)
  if (!memoryCardReviewStatuses.includes(record.status)) {
    errors.push(`${record.goalId}: status ${String(record.status)} is not supported`)
  }
  if (!record.reason?.trim()) errors.push(`${record.goalId}: reason is required`)

  const memoryGoalIds = record.memoryGoalIds ?? []
  const deckIds = record.deckIds ?? []
  if (record.status === 'no_memory_needed') {
    if (record.memoryUseful !== false) errors.push(`${record.goalId}: no_memory_needed requires memoryUseful false`)
    if (memoryGoalIds.length > 0 || deckIds.length > 0) {
      errors.push(`${record.goalId}: no_memory_needed must not reference memory goals or decks`)
    }
  }
  if (record.status === 'memory_required') {
    if (record.memoryUseful !== true) errors.push(`${record.goalId}: memory_required requires memoryUseful true`)
    if (memoryGoalIds.length === 0) errors.push(`${record.goalId}: memory_required requires at least one memoryGoalId`)
    if (deckIds.length === 0) errors.push(`${record.goalId}: memory_required requires at least one deckId`)
  }
  if (record.status === 'needs_developer_review' && record.memoryUseful !== null) {
    errors.push(`${record.goalId}: needs_developer_review requires memoryUseful null`)
  }

  memoryGoalIds.forEach((memoryGoalId) => {
    const memoryGoal = goalById.get(memoryGoalId)
    if (!memoryGoal || !isMemoryGoal(memoryGoal)) {
      errors.push(`${record.goalId}: memoryGoalId ${memoryGoalId} does not reference a memory goal`)
    }
  })

  deckIds.forEach((deckId) => {
    if (!deckEvidence.knownDeckIds.has(deckId)) {
      errors.push(`${record.goalId}: deckId ${deckId} is not exposed by any memory goal deck`)
      return
    }
    const linkedByReferencedGoal = memoryGoalIds.some((memoryGoalId) =>
      deckEvidence.deckIdsByMemoryGoalId.get(memoryGoalId)?.has(deckId) === true)
    if (memoryGoalIds.length > 0 && !linkedByReferencedGoal) {
      errors.push(`${record.goalId}: deckId ${deckId} is not exposed by the referenced memoryGoalIds`)
    }
  })

  return errors
}

function validateMemoryCardReviewCardRecordShape(
  record: MemoryCardReviewCardRecord,
  config: MemoryCardReviewConfig,
  goalById: Map<string, LearningGoal>,
  currentGoalRecordsById: Map<string, MemoryCardReviewRecord>,
): string[] {
  const errors: string[] = []
  if (record.schemaVersion !== 1) errors.push(`${record.deckId}/${record.cardId}: schemaVersion must be 1`)
  if (record.reviewId !== config.reviewId) errors.push(`${record.deckId}/${record.cardId}: reviewId does not match ${config.reviewId}`)
  if (record.ruleVersion !== config.ruleVersion) errors.push(`${record.deckId}/${record.cardId}: ruleVersion does not match ${config.ruleVersion}`)
  if (record.landscapeId !== config.landscapeId) errors.push(`${record.deckId}/${record.cardId}: landscapeId does not match ${config.landscapeId}`)
  if (!memoryCardReviewCardStatuses.includes(record.status)) {
    errors.push(`${record.deckId}/${record.cardId}: status ${String(record.status)} is not supported`)
  }
  if (!record.reason?.trim()) errors.push(`${record.deckId}/${record.cardId}: reason is required`)

  const originGoalIds = record.originGoalIds ?? []
  if (record.status === 'kept') {
    if (record.necessary !== true) errors.push(`${record.deckId}/${record.cardId}: kept requires necessary true`)
    if (originGoalIds.length === 0) errors.push(`${record.deckId}/${record.cardId}: kept requires at least one originGoalId`)
  }
  if (record.status === 'remove') {
    if (record.necessary !== false) errors.push(`${record.deckId}/${record.cardId}: remove requires necessary false`)
  }
  if (record.status === 'needs_developer_review' && record.necessary !== null) {
    errors.push(`${record.deckId}/${record.cardId}: needs_developer_review requires necessary null`)
  }

  originGoalIds.forEach((goalId) => {
    const goal = goalById.get(goalId)
    if (!goal || !isAtomicGoal(goal) || !isMemoryCardReviewRelevantGoal(goal)) {
      errors.push(`${record.deckId}/${record.cardId}: originGoalId ${goalId} does not reference an ordinary atomic review goal`)
      return
    }
    const goalRecord = currentGoalRecordsById.get(goalId)
    if (!goalRecord || goalRecord.status !== 'memory_required') {
      errors.push(`${record.deckId}/${record.cardId}: originGoalId ${goalId} is not currently marked memory_required`)
    }
    if (record.status === 'kept' && !(goalRecord?.deckIds ?? []).includes(record.deckId)) {
      errors.push(`${record.deckId}/${record.cardId}: originGoalId ${goalId} does not reference deck ${record.deckId}`)
    }
  })

  return errors
}

function evaluateSemanticAtomicity(landscape: SkillLandscape, configs: ReviewConfig[]): RuleResult {
  if (configs.length === 0) {
    return makeRule('CQR-301', 'not_configured', 'No semantic atomicity review config is registered for this curriculum.')
  }

  const goalById = new Map(landscape.goals.map((goal) => [goal.id, goal]))
  let leafGoals = 0
  let atomic = 0
  let needsDeveloperReview = 0
  let nonAtomic = 0
  let missing = 0
  let stale = 0
  let obsolete = 0
  const details: string[] = []

  configs.forEach((config) => {
    const scopeGoalIds = Array.isArray(config.scope.leafGoalIds) && config.scope.leafGoalIds.length > 0
      ? new Set(config.scope.leafGoalIds)
      : collectScopeGoalIds(config.scope.rootGoalIds ?? [], goalById)
    const scopedLeafGoals = Array.from(scopeGoalIds)
      .map((goalId) => goalById.get(goalId))
      .filter((goal): goal is LearningGoal => !!goal && isAtomicGoal(goal) && isSemanticAtomicityRelevantGoal(goal))
    const scopedLeafGoalIds = new Set(scopedLeafGoals.map((goal) => goal.id))
    const fingerprintsByGoalId = new Map(scopedLeafGoals.map((goal) => [goal.id, fingerprintGoal(goal, config.ruleVersion)]))
    const reviewPath = resolve(repoRoot, config.reviewPath)
    const { records, parseErrors } = parseReviewRecords(reviewPath)
    const recordsByGoalId = new Map(records.map((record) => [record.goalId, record]))

    leafGoals += scopedLeafGoals.length
    parseErrors.forEach((issue) => details.push(`${config.reviewId}: ${issue}`))

    scopedLeafGoals.forEach((goal) => {
      const record = recordsByGoalId.get(goal.id)
      if (!record) {
        missing += 1
        if (details.length < 20) details.push(`${config.reviewId}: missing ${formatGoal(goal, goal.id)}`)
        return
      }
      const expectedFingerprint = fingerprintsByGoalId.get(goal.id)
      if (record.fingerprint !== expectedFingerprint) {
        stale += 1
        if (details.length < 20) details.push(`${config.reviewId}: stale ${formatGoal(goal, goal.id)}`)
        return
      }
      if (record.status === 'atomic') atomic += 1
      if (record.status === 'needs_developer_review') needsDeveloperReview += 1
      if (record.status === 'non_atomic') nonAtomic += 1
    })

    records.forEach((record) => {
      if (!scopedLeafGoalIds.has(record.goalId)) obsolete += 1
    })
  })

  const unresolved = missing + stale + needsDeveloperReview + nonAtomic + obsolete
  return makeRule(
    'CQR-301',
    unresolved === 0 ? 'pass' : 'warn',
    unresolved === 0
      ? 'Semantic atomicity review ledgers are current and fully accepted.'
      : 'Semantic atomicity review still has missing, stale, or unresolved entries.',
    {
      configs: configs.length,
      leafGoals,
      atomic,
      needsDeveloperReview,
      nonAtomic,
      missing,
      stale,
      obsolete,
    },
    details,
  )
}

function readSemanticConfigs(): Map<string, ReviewConfig[]> {
  const configsByLandscapeId = new Map<string, ReviewConfig[]>()
  collectFiles(semanticAtomicityRoot, (fileName) => /\.config\.json$/i.test(fileName)).forEach((file) => {
    const config = loadJson<ReviewConfig>(file)
    const existing = configsByLandscapeId.get(config.landscapeId) ?? []
    existing.push(config)
    configsByLandscapeId.set(config.landscapeId, existing)
  })
  return configsByLandscapeId
}

function evaluateMemoryCardReview(landscape: SkillLandscape, configs: MemoryCardReviewConfig[]): RuleResult {
  if (configs.length === 0) {
    return makeRule('CQR-302', 'not_configured', 'No memory-card review config is registered for this curriculum.')
  }

  const goalById = new Map(landscape.goals.map((goal) => [goal.id, goal]))
  const deckEvidence = collectMemoryDeckEvidence(landscape)
  let reviewedGoals = 0
  let noMemoryNeeded = 0
  let memoryRequired = 0
  let needsDeveloperReview = 0
  let missing = 0
  let stale = 0
  let obsolete = 0
  let duplicateRecords = 0
  let invalidRecords = 0
  let primaryCards = 0
  let keptCards = 0
  let cardsMarkedRemove = 0
  let cardNeedsDeveloperReview = 0
  let missingCardReviews = 0
  let staleCardReviews = 0
  let obsoleteCardReviews = 0
  let duplicateCardReviewRecords = 0
  let invalidCardReviewRecords = 0
  let untracedMemoryRequiredGoals = 0
  let visibilityScopes = 0
  let visibilityCheckedMemoryRequiredGoals = 0
  let visibilityMissingVisibleMemoryGoals = 0
  let visibilityErrors = 0
  const tracedMemoryGoalIds = new Set<string>()
  const scopedMemoryGoalIds = new Set<string>()
  const details: string[] = []

  configs.forEach((config) => {
    if (config.reportPath && details.length < 30) {
      details.push(`${config.reviewId}: audit report ${config.reportPath}`)
    }
    const scopeGoalIds = Array.isArray(config.scope.leafGoalIds) && config.scope.leafGoalIds.length > 0
      ? new Set(config.scope.leafGoalIds)
      : collectScopeGoalIds(config.scope.rootGoalIds ?? [], goalById)
    const configScopedMemoryGoalIds = new Set<string>()
    Array.from(scopeGoalIds)
      .map((goalId) => goalById.get(goalId))
      .filter((goal): goal is LearningGoal => !!goal && isMemoryGoal(goal))
      .forEach((goal) => {
        configScopedMemoryGoalIds.add(goal.id)
        scopedMemoryGoalIds.add(goal.id)
      })

    const scopedReviewGoals = Array.from(scopeGoalIds)
      .map((goalId) => goalById.get(goalId))
      .filter((goal): goal is LearningGoal => !!goal && isAtomicGoal(goal) && isMemoryCardReviewRelevantGoal(goal))
    const scopedReviewGoalIds = new Set(scopedReviewGoals.map((goal) => goal.id))
    const fingerprintsByGoalId = new Map(scopedReviewGoals.map((goal) => [goal.id, fingerprintGoal(goal, config.ruleVersion)]))
    const reviewPath = resolve(repoRoot, config.reviewPath)
    const { records, parseErrors } = parseMemoryCardReviewRecords(reviewPath)
    const seenRecordGoalIds = new Set<string>()
    const duplicateGoalIds = new Set<string>()
    records.forEach((record) => {
      if (seenRecordGoalIds.has(record.goalId)) duplicateGoalIds.add(record.goalId)
      seenRecordGoalIds.add(record.goalId)
    })
    duplicateRecords += duplicateGoalIds.size
    const shapeErrors = records.flatMap((record) => validateMemoryCardRecordShape(record, config, goalById, deckEvidence))
    invalidRecords += parseErrors.length + shapeErrors.length
    parseErrors.forEach((issue) => {
      if (details.length < 30) details.push(`${config.reviewId}: ${issue}`)
    })
    shapeErrors.forEach((issue) => {
      if (details.length < 30) details.push(`${config.reviewId}: ${issue}`)
    })
    duplicateGoalIds.forEach((goalId) => {
      if (details.length < 30) details.push(`${config.reviewId}: duplicate review record for ${goalId}`)
    })

    const recordsByGoalId = new Map(records.map((record) => [record.goalId, record]))
    reviewedGoals += scopedReviewGoals.length
    const currentGoalRecordsById = new Map<string, MemoryCardReviewRecord>()

    scopedReviewGoals.forEach((goal) => {
      const record = recordsByGoalId.get(goal.id)
      if (!record) {
        missing += 1
        if (details.length < 30) details.push(`${config.reviewId}: missing ${formatGoal(goal, goal.id)}`)
        return
      }
      const expectedFingerprint = fingerprintsByGoalId.get(goal.id)
      if (record.fingerprint !== expectedFingerprint) {
        stale += 1
        if (details.length < 30) details.push(`${config.reviewId}: stale ${formatGoal(goal, goal.id)}`)
        return
      }
      currentGoalRecordsById.set(goal.id, record)
      if (record.status === 'no_memory_needed') noMemoryNeeded += 1
      if (record.status === 'needs_developer_review') needsDeveloperReview += 1
      if (record.status === 'memory_required') {
        memoryRequired += 1
        record.memoryGoalIds?.forEach((memoryGoalId) => tracedMemoryGoalIds.add(memoryGoalId))
      }
    })

    records.forEach((record) => {
      if (!scopedReviewGoalIds.has(record.goalId)) obsolete += 1
    })

    const scopedDeckIds = new Set<string>()
    configScopedMemoryGoalIds.forEach((memoryGoalId) => {
      deckEvidence.deckIdsByMemoryGoalId.get(memoryGoalId)?.forEach((deckId) => scopedDeckIds.add(deckId))
    })
    const scopedPrimaryCards = deckEvidence.primaryCards
      .filter((card) => scopedDeckIds.has(card.deckId))
    const scopedPrimaryCardKeys = new Set(scopedPrimaryCards.map((card) => memoryCardKey(card.deckId, card.cardId)))
    const cardFingerprintsByKey = new Map(scopedPrimaryCards.map((card) => [
      memoryCardKey(card.deckId, card.cardId),
      fingerprintMemoryCard(card, config.ruleVersion),
    ]))
    primaryCards += scopedPrimaryCards.length

    const cardReviewPath = resolve(repoRoot, config.cardReviewPath
      ?? config.reviewPath.replace(/\.review\.jsonl$/i, '.cards.review.jsonl'))
    const { records: cardRecords, parseErrors: cardParseErrors } = parseMemoryCardReviewCardRecords(cardReviewPath)
    const seenCardKeys = new Set<string>()
    const duplicateCardKeys = new Set<string>()
    cardRecords.forEach((record) => {
      const key = memoryCardKey(record.deckId, record.cardId)
      if (seenCardKeys.has(key)) duplicateCardKeys.add(key)
      seenCardKeys.add(key)
    })
    duplicateCardReviewRecords += duplicateCardKeys.size
    const cardRecordsByKey = new Map(cardRecords.map((record) => [memoryCardKey(record.deckId, record.cardId), record]))
    cardParseErrors.forEach((issue) => {
      if (details.length < 30) details.push(`${config.reviewId}: ${issue}`)
    })
    invalidCardReviewRecords += cardParseErrors.length
    duplicateCardKeys.forEach((key) => {
      if (details.length < 30) details.push(`${config.reviewId}: duplicate card review record for ${key}`)
    })

    const tracedMemoryRequiredGoalIds = new Set<string>()
    scopedPrimaryCards.forEach((card) => {
      const key = memoryCardKey(card.deckId, card.cardId)
      const record = cardRecordsByKey.get(key)
      if (!record) {
        missingCardReviews += 1
        if (details.length < 30) details.push(`${config.reviewId}: missing card review ${card.deckId}/${card.cardId}`)
        return
      }
      const expectedFingerprint = cardFingerprintsByKey.get(key)
      if (record.fingerprint !== expectedFingerprint) {
        staleCardReviews += 1
        if (details.length < 30) details.push(`${config.reviewId}: stale card review ${card.deckId}/${card.cardId}`)
        return
      }
      const cardShapeErrors = validateMemoryCardReviewCardRecordShape(record, config, goalById, currentGoalRecordsById)
      invalidCardReviewRecords += cardShapeErrors.length
      cardShapeErrors.forEach((issue) => {
        if (details.length < 30) details.push(`${config.reviewId}: ${issue}`)
      })
      if (record.status === 'kept') {
        keptCards += 1
        record.originGoalIds?.forEach((goalId) => tracedMemoryRequiredGoalIds.add(goalId))
      }
      if (record.status === 'remove') cardsMarkedRemove += 1
      if (record.status === 'needs_developer_review') cardNeedsDeveloperReview += 1
    })

    cardRecords.forEach((record) => {
      if (!scopedPrimaryCardKeys.has(memoryCardKey(record.deckId, record.cardId)) && record.status !== 'remove') {
        obsoleteCardReviews += 1
      }
    })

    currentGoalRecordsById.forEach((record) => {
      if (record.status === 'memory_required' && !tracedMemoryRequiredGoalIds.has(record.goalId)) {
        untracedMemoryRequiredGoals += 1
        if (details.length < 30) {
          details.push(`${config.reviewId}: memory-required goal is not traced by a kept card: ${formatGoal(goalById.get(record.goalId), record.goalId)}`)
        }
      }
    })

    const visibilityReport = collectMemoryVisibilityReport(
      config,
      goalById,
      Array.from(currentGoalRecordsById.values()),
    )
    visibilityScopes += visibilityReport.scopes
    visibilityCheckedMemoryRequiredGoals += visibilityReport.checkedMemoryRequiredGoals
    visibilityMissingVisibleMemoryGoals += visibilityReport.missingVisibleMemoryGoals
    visibilityErrors += visibilityReport.errors.length
    visibilityReport.errors.forEach((issue) => {
      if (details.length < 30) details.push(issue)
    })
  })

  deckEvidence.errors.forEach((issue) => {
    if (details.length < 30) details.push(issue)
  })

  const untracedMemoryGoalIds = Array.from(scopedMemoryGoalIds)
    .filter((goalId) => !tracedMemoryGoalIds.has(goalId))
  untracedMemoryGoalIds.forEach((goalId) => {
    if (details.length < 30) details.push(`untraced memory goal: ${formatGoal(goalById.get(goalId), goalId)}`)
  })

  const unresolved = missing
    + stale
    + needsDeveloperReview
    + obsolete
    + duplicateRecords
    + invalidRecords
    + missingCardReviews
    + staleCardReviews
    + obsoleteCardReviews
    + duplicateCardReviewRecords
    + invalidCardReviewRecords
    + cardsMarkedRemove
    + cardNeedsDeveloperReview
    + untracedMemoryRequiredGoals
    + visibilityErrors
    + deckEvidence.errors.length
    + untracedMemoryGoalIds.length
  return makeRule(
    'CQR-302',
    unresolved === 0 ? 'pass' : 'warn',
    unresolved === 0
      ? `Memory-card review is current: ${memoryRequired}/${reviewedGoals} ordinary atomic goals intentionally use memorization support, ${keptCards}/${primaryCards} primary cards are kept with origin traces, all ${scopedMemoryGoalIds.size} memory goals are traced, and ${visibilityCheckedMemoryRequiredGoals} view-visible memory-required goals resolve to visible memory nodes.`
      : 'Memory-card review still has missing, stale, invalid, or untraced entries.',
    {
      configs: configs.length,
      reviewedGoals,
      noMemoryNeeded,
      memoryRequired,
      needsDeveloperReview,
      missing,
      stale,
      obsolete,
      duplicateRecords,
      invalidRecords,
      primaryCards,
      keptCards,
      cardsMarkedRemove,
      cardNeedsDeveloperReview,
      missingCardReviews,
      staleCardReviews,
      obsoleteCardReviews,
      duplicateCardReviewRecords,
      invalidCardReviewRecords,
      untracedMemoryRequiredGoals,
      visibilityScopes,
      visibilityCheckedMemoryRequiredGoals,
      visibilityMissingVisibleMemoryGoals,
      visibilityErrors,
      memoryGoals: scopedMemoryGoalIds.size,
      tracedMemoryGoals: tracedMemoryGoalIds.size,
      untracedMemoryGoals: untracedMemoryGoalIds.length,
      deckIds: deckEvidence.knownDeckIds.size,
      deckFiles: deckEvidence.deckFiles,
      cardRows: deckEvidence.cardRows,
    },
    details,
  )
}

function readMemoryCardReviewConfigs(): Map<string, MemoryCardReviewConfig[]> {
  const configsByLandscapeId = new Map<string, MemoryCardReviewConfig[]>()
  discoverMemoryCardReviewConfigs(defaultMemoryCardReviewConfigDir, { allowEmpty: true }).forEach(({ configPath }) => {
    const config = loadJson<MemoryCardReviewConfig>(resolve(repoRoot, configPath))
    const existing = configsByLandscapeId.get(config.landscapeId) ?? []
    existing.push(config)
    configsByLandscapeId.set(config.landscapeId, existing)
  })
  return configsByLandscapeId
}

function normalizeGoalVisualizationSubject(value: string | undefined): string {
  return (value ?? '')
    .trim()
    .toLocaleLowerCase('de-DE')
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function goalVisualizationSubjectFromUrl(url: string | undefined): string {
  const match = url?.match(/^\/assets\/goal-visualizations\/([^/]+)\//u)
  return match?.[1] ?? ''
}

function goalVisualizationPublicAssetPath(url: string | undefined): string {
  if (!url?.startsWith('/assets/goal-visualizations/')) return ''
  return resolve(repoRoot, 'app/public', url.replace(/^\/+/u, ''))
}

function primaryGoalVisualizationLink(goal: LearningGoal) {
  return (goal.resourceLinks ?? []).find((link) =>
    link.type === 'goal-visualization'
    && link.resourceType === 'image'
    && link.role === 'primary'
    && typeof link.url === 'string')
}

function readGoalVisualizationQaLedgers(): Map<string, GoalVisualizationQaLedger> {
  const ledgersBySubject = new Map<string, GoalVisualizationQaLedger>()
  collectFiles(goalVisualizationQaRoot, (fileName) => /\.qa\.json$/i.test(fileName)).forEach((file) => {
    const ledger = loadJson<GoalVisualizationQaLedger>(file)
    const subject = normalizeGoalVisualizationSubject(ledger.subject) || (file.match(/([^/\\]+)\.qa\.json$/i)?.[1] ?? '')
    if (subject && ledger.schemaVersion === 1 && Array.isArray(ledger.records)) {
      ledgersBySubject.set(subject, ledger)
    }
  })
  return ledgersBySubject
}

function evaluateGoalVisualizationQa(
  landscape: SkillLandscape,
  ledgersBySubject: Map<string, GoalVisualizationQaLedger>,
): RuleResult {
  const relevantGoals = landscape.goals.filter(isGoalVisualizationRelevantGoal)
  const linksByGoalId = new Map<string, NonNullable<ReturnType<typeof primaryGoalVisualizationLink>>>()
  relevantGoals.forEach((goal) => {
    const link = primaryGoalVisualizationLink(goal)
    if (link) linksByGoalId.set(goal.id, link)
  })
  const subjectSlug = Array.from(linksByGoalId.values())
    .map((link) => goalVisualizationSubjectFromUrl(link.url))
    .find(Boolean)
    ?? normalizeGoalVisualizationSubject(landscape.subject)
  const ledger = ledgersBySubject.get(subjectSlug)
  if (!ledger) {
    return makeRule(
      'CQR-303',
      'not_configured',
      `No goal-visualization QA ledger is registered for subject ${subjectSlug || '(unknown)'}.`,
      {
        expectedGoals: relevantGoals.length,
        linkedGoals: linksByGoalId.size,
      },
    )
  }

  let missingLinks = 0
  let missingRecords = 0
  let staleRecords = 0
  let duplicateRecords = 0
  let missingAssets = 0
  let humanApproved = 0
  let humanNotApproved = 0
  let humanIssues = 0
  let chatGptReady = 0
  let chatGptOpen = 0
  let aiApproved = 0
  let aiNotApproved = 0
  const details: string[] = []

  const recordsByGoalAndUrl = new Map<string, GoalVisualizationQaRecord>()
  const duplicateKeys = new Set<string>()
  ledger.records.forEach((record) => {
    const key = `${record.goalId}\n${record.imageUrl}`
    if (recordsByGoalAndUrl.has(key)) duplicateKeys.add(key)
    recordsByGoalAndUrl.set(key, record)
  })
  duplicateRecords += duplicateKeys.size
  duplicateKeys.forEach((key) => {
    if (details.length < 30) details.push(`duplicate QA record for ${key.replace('\n', ' ')}`)
  })

  relevantGoals.forEach((goal) => {
    const link = linksByGoalId.get(goal.id)
    if (!link) {
      missingLinks += 1
      if (details.length < 30) details.push(`missing visualization link: ${formatGoal(goal, goal.id)}`)
      return
    }

    const record = recordsByGoalAndUrl.get(`${goal.id}\n${link.url}`)
    if (!record) {
      missingRecords += 1
      if (details.length < 30) details.push(`missing QA record: ${formatGoal(goal, goal.id)} ${link.url}`)
      return
    }

    const publicAssetPath = goalVisualizationPublicAssetPath(link.url)
    const currentHash = hashFile(publicAssetPath)
    if (!currentHash) {
      missingAssets += 1
      if (details.length < 30) details.push(`missing public asset: ${formatGoal(goal, goal.id)} ${link.url}`)
      return
    }
    if (record.assetSha256 !== currentHash) {
      staleRecords += 1
      if (details.length < 30) details.push(`stale QA record: ${formatGoal(goal, goal.id)} ledger ${record.assetSha256 || '(empty)'} current ${currentHash}`)
      return
    }

    if (record.umlautsCorrectChatGpt === 'yes' && record.contentApprovedChatGpt === 'yes') {
      chatGptReady += 1
    } else {
      chatGptOpen += 1
    }

    if (isGoalVisualizationAiApproved(record)) {
      aiApproved += 1
    } else {
      aiNotApproved += 1
    }

    if (record.humanIssueIdentified === 'yes') {
      humanIssues += 1
      if (details.length < 30) {
        const issue = record.humanIssueDescription?.trim() ? `: ${record.humanIssueDescription.trim()}` : ''
        details.push(`open human issue: ${formatGoal(goal, goal.id)}${issue}`)
      }
    }

    if (record.humanApproved === 'yes' && record.humanIssueIdentified !== 'yes') {
      humanApproved += 1
    } else {
      humanNotApproved += 1
      if (details.length < 30 && record.humanIssueIdentified !== 'yes') {
        details.push(`missing human approval: ${formatGoal(goal, goal.id)}`)
      }
    }
  })

  const unresolved = missingLinks
    + missingRecords
    + staleRecords
    + duplicateRecords
    + missingAssets
    + humanNotApproved
    + humanIssues

  return makeRule(
    'CQR-303',
    unresolved === 0 ? 'pass' : 'warn',
    unresolved === 0
      ? `Goal visualizations are complete and human-approved for all ${relevantGoals.length} ordinary atomic goals.`
      : 'Goal-visualization rollout or human approval is still incomplete.',
    {
      expectedGoals: relevantGoals.length,
      linkedGoals: linksByGoalId.size,
      missingLinks,
      qaRecords: ledger.records.length,
      missingRecords,
      staleRecords,
      duplicateRecords,
      missingAssets,
      currentRecords: relevantGoals.length - missingLinks - missingRecords - staleRecords - missingAssets,
      chatGptReady,
      chatGptOpen,
      aiApproved,
      aiNotApproved,
      humanApproved,
      humanNotApproved,
      humanIssues,
    },
    details,
  )
}

function readCompositionViewCountsByLandscapeId(): Map<string, number> {
  const counts = new Map<string, number>()
  collectFiles(compositionViewRoot, (fileName) => /\.view\.json$/i.test(fileName)).forEach((file) => {
    const parsed = loadJson<{ landscapeId?: string }>(file)
    if (!parsed.landscapeId) return
    counts.set(parsed.landscapeId, (counts.get(parsed.landscapeId) ?? 0) + 1)
  })
  return counts
}

function applicabilityWarningKey(
  warning: Pick<ApplicabilityFinding, 'code' | 'landscapeId' | 'goalId' | 'dimension' | 'value'>,
): string {
  return [
    warning.code,
    warning.landscapeId,
    warning.goalId ?? '',
    warning.dimension ?? '',
    warning.value ?? '',
  ].join('|')
}

function readAcceptedWarningEntries(): AcceptedWarningEntry[] {
  if (!existsSync(acceptedWarningsPath)) return []
  const registry = loadJson<{ acceptedWarnings?: AcceptedWarningEntry[] }>(acceptedWarningsPath)
  return Array.isArray(registry.acceptedWarnings) ? registry.acceptedWarnings : []
}

function metricKeyPart(value: string): string {
  return value.replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
}

function metricLabel(value: string): string {
  return value.replace(/_/g, '-')
}

function incrementMetric(metrics: Record<string, number>, key: string, amount = 1) {
  metrics[key] = (metrics[key] ?? 0) + amount
}

function addApplicabilityWarningBreakdown(
  metrics: Record<string, number>,
  prefix: 'active' | 'accepted' | 'obsolete' | 'diagnostic',
  warning: Pick<AcceptedWarningEntry, 'code' | 'dimension' | 'value'>,
) {
  incrementMetric(metrics, `${prefix}Code_${metricKeyPart(warning.code)}`)
  if (warning.dimension === 'jurisdiction' && warning.value) {
    incrementMetric(metrics, `${prefix}Jurisdiction_${metricKeyPart(warning.value)}`)
  } else {
    incrementMetric(metrics, `${prefix}GlobalWarnings`)
  }
}

function readSurrogateEvidenceEntries(): SurrogateEvidenceEntry[] {
  if (!existsSync(surrogateEvidencePath)) return []
  const registry = loadJson<{ entries?: SurrogateEvidenceEntry[] }>(surrogateEvidencePath)
  return Array.isArray(registry.entries) ? registry.entries : []
}

function readApplicabilityWarningMetricsByLandscapeId(
  applicabilityCompilation: ApplicabilityCompilationResult,
): Map<string, Record<string, number>> {
  const acceptedEntries = readAcceptedWarningEntries()
  const acceptedWarningEntries = acceptedEntries.filter((entry) => entry.code !== 'APV-202')
  const acceptedKeys = new Set(acceptedWarningEntries.map(applicabilityWarningKey))
  const currentWarningKeys = new Set<string>()
  const counts = new Map<string, Record<string, number>>()

  const ensureMetrics = (landscapeId: string): Record<string, number> => {
    const existing = counts.get(landscapeId)
    if (existing) return existing
    const metrics = {
      activeWarnings: 0,
      acceptedWarnings: 0,
      obsoleteAcceptedWarnings: 0,
      diagnostics: 0,
    }
    counts.set(landscapeId, metrics)
    return metrics
  }

  const warningFindings = Array.from(
    new Map(
      applicabilityCompilation.reports
        .flatMap((report) => report.findings)
        .filter((finding) => finding.severity === 'warning')
        .map((finding) => [
          [
            finding.severity,
            finding.code,
            finding.landscapeId,
            finding.goalId ?? '',
            finding.dimension ?? '',
            finding.value ?? '',
            finding.message,
          ].join('|'),
          finding,
        ]),
    ).values(),
  )

  const diagnosticFindings = Array.from(
    new Map(
      applicabilityCompilation.reports
        .flatMap((report) => report.findings)
        .filter((finding) => finding.severity === 'diagnostic')
        .map((finding) => [
          [
            finding.severity,
            finding.code,
            finding.landscapeId,
            finding.goalId ?? '',
            finding.dimension ?? '',
            finding.value ?? '',
            finding.message,
          ].join('|'),
          finding,
        ]),
    ).values(),
  )

  warningFindings.forEach((finding) => {
    const key = applicabilityWarningKey(finding)
    currentWarningKeys.add(key)
    const metrics = ensureMetrics(finding.landscapeId)
    if (acceptedKeys.has(key)) {
      metrics.acceptedWarnings += 1
      addApplicabilityWarningBreakdown(metrics, 'accepted', finding)
    } else {
      metrics.activeWarnings += 1
      addApplicabilityWarningBreakdown(metrics, 'active', finding)
    }
  })

  diagnosticFindings.forEach((finding) => {
    const metrics = ensureMetrics(finding.landscapeId)
    metrics.diagnostics += 1
    addApplicabilityWarningBreakdown(metrics, 'diagnostic', finding)
  })

  acceptedWarningEntries.forEach((entry) => {
    if (!entry.landscapeId || currentWarningKeys.has(applicabilityWarningKey(entry))) return
    const metrics = ensureMetrics(entry.landscapeId)
    metrics.obsoleteAcceptedWarnings += 1
    addApplicabilityWarningBreakdown(metrics, 'obsolete', entry)
  })

  return counts
}

function roundPercent(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0
  return Math.round((numerator / denominator) * 1000) / 10
}

function isSourceBackedJurisdictionEvidence(
  evidence: ApplicabilityEvidence,
  jurisdiction: string,
): boolean {
  return evidence.dimension === 'jurisdiction'
    && evidence.value === jurisdiction
    && (evidence.kind === 'provenance' || evidence.kind === 'mapping')
}

function isPartialSourceLinkedJurisdictionEvidence(
  evidence: ApplicabilityEvidence[],
  jurisdiction: string,
): boolean {
  return hasOnlyPartialMappingSourceEvidence(evidence, jurisdiction)
}

function surrogateEvidenceKey(
  landscapeId: string,
  goalId: string,
  jurisdiction: string,
): string {
  return [landscapeId, goalId, jurisdiction].join('|')
}

function readAcceptedSurrogateEvidenceByKey(): Map<string, SurrogateEvidenceEntry[]> {
  const entriesByKey = new Map<string, SurrogateEvidenceEntry[]>()
  readSurrogateEvidenceEntries()
    .filter((entry) =>
      entry.status === 'accepted'
      && entry.evidenceType === 'requires-closure'
      && typeof entry.landscapeId === 'string'
      && typeof entry.goalId === 'string'
      && typeof entry.jurisdiction === 'string'
      && typeof entry.requiredByGoalId === 'string'
      && typeof entry.rationale === 'string'
      && entry.rationale.trim().length > 0)
    .forEach((entry) => {
      const key = surrogateEvidenceKey(entry.landscapeId!, entry.goalId!, entry.jurisdiction!)
      entriesByKey.set(key, [...(entriesByKey.get(key) ?? []), entry])
    })
  return entriesByKey
}

function hasDirectSourceBackedJurisdictionEvidence(
  goal: CoverageGoalReport,
  jurisdiction: string,
): boolean {
  return goal.evidence.some((evidence) => isSourceBackedJurisdictionEvidence(evidence, jurisdiction))
}

function createCoverageEvidenceChecker(
  report: CoverageReport,
  jurisdiction: string,
  surrogateEntriesByKey: Map<string, SurrogateEvidenceEntry[]>,
  canonicalGoalById: Map<string, LearningGoal>,
): {
  hasCoverageBackedJurisdictionEvidence: (goal: CoverageGoalReport) => boolean
  hasReviewedRequiresClosureSurrogateEvidence: (goal: CoverageGoalReport) => boolean
} {
  return createReviewedRequiresClosureCoverageChecker({
    landscapeId: report.landscapeId,
    jurisdiction,
    goals: report.goals,
    canonicalGoalById,
    surrogateEntriesByKey,
    isEligibleCanonicalGoal: isCurriculumSourceCoverageGoal,
  })
}

const compositionViewDirectoryByLandscapeId = new Map<string, string>([
  [CANONICAL_GYM_MATH_LANDSCAPE_ID, 'mathematik'],
  [CANONICAL_GYM_PHYSICS_LANDSCAPE_ID, 'physik'],
  [CANONICAL_GYM_CHEMISTRY_LANDSCAPE_ID, 'chemie'],
  [CANONICAL_GYM_BIOLOGY_LANDSCAPE_ID, 'biologie'],
  [CANONICAL_GYM_ECONOMICS_LANDSCAPE_ID, 'wirtschaft'],
  [CANONICAL_GYM_POLITICS_ECONOMICS_LANDSCAPE_ID, 'politik-und-wirtschaft'],
  [CANONICAL_GYM_INFORMATICS_LANDSCAPE_ID, 'informatik'],
  [CANONICAL_GYM_HISTORY_LANDSCAPE_ID, 'geschichte'],
  [CANONICAL_GYM_GERMAN_LANDSCAPE_ID, 'deutsch'],
  [CANONICAL_GYM_LATIN_LANDSCAPE_ID, 'latein'],
])

function readLandscapeForReport(report: CoverageReport): SkillLandscape | null {
  const absolutePath = resolve(repoRoot, report.file)
  if (!existsSync(absolutePath)) return null
  return loadJson<SkillLandscape>(absolutePath)
}

function readCompositionViewFilesForLandscapeId(landscapeId: string): string[] {
  const directoryName = compositionViewDirectoryByLandscapeId.get(landscapeId)
  if (!directoryName) return []
  const directory = resolve(compositionViewRoot, directoryName)
  if (!existsSync(directory)) return []
  return collectFiles(directory, (fileName) => fileName.endsWith('.view.json'))
}

function readCompositionViewFilesForReport(report: CoverageReport): string[] {
  return readCompositionViewFilesForLandscapeId(report.landscapeId)
}

type CompositionRouteStage = 'SekI' | 'SekII'

function compositionStructureStage(node: CompositionViewNode): CompositionRouteStage | null {
  if (node.kind !== 'structure') return null
  const normalizedLabel = node.label.trim().toLocaleUpperCase('de')
  if (
    /^SEKUNDARSTUFE II(?:$|[\s(:\-–])/u.test(normalizedLabel)
    || normalizedLabel === 'KURSSTUFE'
    || normalizedLabel.startsWith('KURSSTUFE ')
  ) return 'SekII'
  if (/^SEKUNDARSTUFE I(?:$|[\s(:\-–])/u.test(normalizedLabel)) return 'SekI'
  return null
}

function collectCompositionStageStructures(
  nodes: CompositionViewNode[],
  stage: CompositionRouteStage,
  matches: Extract<CompositionViewNode, { kind: 'structure' }>[] = [],
): Extract<CompositionViewNode, { kind: 'structure' }>[] {
  nodes.forEach((node) => {
    if (node.kind !== 'structure') return
    if (compositionStructureStage(node) === stage) matches.push(node)
    collectCompositionStageStructures(node.children, stage, matches)
  })
  return matches
}

function collectRenderedAtomicGoalIdsFromCompositionView(
  landscape: SkillLandscape,
  viewFile: string,
  scopeFilters: string[] = [],
  includePrerequisiteOnly = false,
  compositionStage?: CompositionRouteStage,
  additionalVisibleGoalIds: string[] = [],
): Set<string> {
  const entry = {
    meta: landscape,
    goals: landscape.goals.map((goal) => convertLearningGoal(goal, { landscapeId: landscape.landscapeId })),
  }
  const rawView = loadJson<unknown>(viewFile)
  const normalizedView = normalizeCompositionView(rawView)
  const projectedEntry = applyCompositionViewProjection([entry], normalizedView)[0]
  if (!projectedEntry) return new Set<string>()

  const goalById = new Map(projectedEntry.goals.map((goal) => [goal.id, goal]))
  const directChildrenByParent = buildDirectChildrenMap(goalById)
  if (scopeFilters.length > 0) {
    directChildrenByParent.forEach((childIds, parentId) => {
      directChildrenByParent.set(
        parentId,
        childIds.filter((childId) => {
          const child = goalById.get(childId)
          return !!child && goalMatchesFilters(child, scopeFilters)
        }),
      )
    })
  }
  const rootGoalIds = projectedEntry.goals
    .filter((goal) => (goal.tags ?? []).includes('root'))
    .map((goal) => goal.id)
  const collectVisibleGoalIds = (startGoalIds: string[]): Set<string> => {
    const visibleGoalIds = new Set<string>()
    const stack = [...startGoalIds]
    while (stack.length > 0) {
      const goalId = stack.pop()
      if (!goalId || visibleGoalIds.has(goalId)) continue
      visibleGoalIds.add(goalId)
      getRenderedChildIds(goalId, goalById, directChildrenByParent).forEach((childId) => stack.push(childId))
    }
    return visibleGoalIds
  }
  const fullVisibleGoalIds = collectVisibleGoalIds(rootGoalIds)
  const stageStructureGoalIds = compositionStage
    ? collectCompositionStageStructures(normalizedView.rootNodes, compositionStage)
      .map((node) => `composition:${normalizedView.viewId}:structure:${node.id}`)
      .filter((goalId) => goalById.has(goalId))
    : []
  const visibleGoalIds = compositionStage
    ? collectVisibleGoalIds(stageStructureGoalIds)
    : fullVisibleGoalIds

  const atomicGoalIds = new Set<string>()
  const addRenderedAtomicGoal = (goalId: string) => {
    if (goalId.startsWith('composition:')) return
    const goal = goalById.get(goalId)
    if (goal && (goal.contains?.length ?? 0) === 0) atomicGoalIds.add(goalId)
  }
  visibleGoalIds.forEach(addRenderedAtomicGoal)
  additionalVisibleGoalIds
    .filter((goalId) => fullVisibleGoalIds.has(goalId))
    .forEach(addRenderedAtomicGoal)
  if (includePrerequisiteOnly) {
    const sourceGoalById = new Map(entry.goals.map((goal) => [goal.id, goal]))
    const addAtomicIfIncluded = (goalId: string) => {
      const goal = sourceGoalById.get(goalId)
      if (
        goal
        && (goal.contains?.length ?? 0) === 0
        && (scopeFilters.length === 0 || goalMatchesFilters(goal, scopeFilters))
      ) {
        atomicGoalIds.add(goalId)
      }
    }
    const addAtomicSubtree = (rootGoalId: string) => {
      const stack = [rootGoalId]
      const seen = new Set<string>()
      while (stack.length > 0) {
        const goalId = stack.pop()
        if (!goalId || seen.has(goalId)) continue
        seen.add(goalId)
        const goal = sourceGoalById.get(goalId)
        if (!goal) continue
        if ((goal.contains?.length ?? 0) === 0) {
          addAtomicIfIncluded(goalId)
        } else {
          stack.push(...(goal.contains ?? []))
        }
      }
    }
    const collectPrerequisiteOnly = (nodes: CompositionViewNode[]) => {
      nodes.forEach((node) => {
        if (node.kind === 'structure') {
          const nodeStage = compositionStructureStage(node)
          if (compositionStage && nodeStage && nodeStage !== compositionStage) return
          collectPrerequisiteOnly(node.children)
          return
        }
        if (getCompositionProjectionRole(node) !== 'prerequisiteOnly') return
        if (node.kind === 'canonicalSubtree') {
          addAtomicSubtree(node.goalId)
        } else if (node.kind === 'goalEntry') {
          addAtomicIfIncluded(node.goalId)
        }
      })
    }
    collectPrerequisiteOnly(normalizedView.rootNodes)
  }
  return atomicGoalIds
}

function readCompositionViewAtomicGoalIds(report: CoverageReport): {
  canonicalViewAtomicGoalIds: Set<string>
  viewAtomicGoalIdsByJurisdiction: Map<string, Set<string>>
} {
  const landscape = readLandscapeForReport(report)
  const viewFiles = readCompositionViewFilesForReport(report)
  const canonicalViewAtomicGoalIds = new Set<string>()
  const viewAtomicGoalIdsByJurisdiction = new Map<string, Set<string>>()
  if (!landscape || viewFiles.length === 0) {
    return { canonicalViewAtomicGoalIds, viewAtomicGoalIdsByJurisdiction }
  }

  const addViewAtoms = (target: Set<string>, file: string) => {
    collectRenderedAtomicGoalIdsFromCompositionView(landscape, file).forEach((goalId) => target.add(goalId))
  }

  viewFiles
    .filter((file) => file.split(/[\\/]/).pop()?.toLowerCase().startsWith('de-de'))
    .forEach((file) => addViewAtoms(canonicalViewAtomicGoalIds, file))

  Object.keys(JURISDICTION_LABELS).forEach((jurisdiction) => {
    const prefix = jurisdiction.toLowerCase()
    const target = new Set<string>()
    viewFiles
      .filter((file) => file.split(/[\\/]/).pop()?.toLowerCase().startsWith(prefix))
      .forEach((file) => addViewAtoms(target, file))
    if (target.size > 0) {
      viewAtomicGoalIdsByJurisdiction.set(jurisdiction, target)
    }
  })

  return { canonicalViewAtomicGoalIds, viewAtomicGoalIdsByJurisdiction }
}

function normalizeJurisdiction(value: unknown): string | null {
  if (typeof value !== 'string' || value.trim().length === 0) return null
  const normalized = value.trim().toUpperCase()
  if (Object.prototype.hasOwnProperty.call(JURISDICTION_LABELS, normalized)) return normalized
  const prefixed = `DE-${normalized}`
  return Object.prototype.hasOwnProperty.call(JURISDICTION_LABELS, prefixed) ? prefixed : null
}

let sourceLandscapeJurisdictionByIdCache: Map<string, string> | null = null
function readSourceLandscapeJurisdictionById(): Map<string, string> {
  if (sourceLandscapeJurisdictionByIdCache) return sourceLandscapeJurisdictionByIdCache
  if (!existsSync(sourceLandscapeRegistryPath)) return new Map<string, string>()
  const registry = loadJson<{ entries?: SourceLandscapeRegistryEntry[] }>(sourceLandscapeRegistryPath)
  const result = new Map<string, string>()
  for (const entry of registry.entries ?? []) {
    if (typeof entry.landscapeId !== 'string') continue
    const jurisdiction = normalizeJurisdiction(entry.jurisdiction)
    if (jurisdiction) result.set(entry.landscapeId, jurisdiction)
  }
  sourceLandscapeJurisdictionByIdCache = result
  return result
}

let sourceLandscapeRegistryEntriesByIdCache: Map<string, SourceLandscapeRegistryEntry> | null = null
function readSourceLandscapeRegistryEntriesById(): Map<string, SourceLandscapeRegistryEntry> {
  if (sourceLandscapeRegistryEntriesByIdCache) return sourceLandscapeRegistryEntriesByIdCache
  if (!existsSync(sourceLandscapeRegistryPath)) return new Map<string, SourceLandscapeRegistryEntry>()
  const registry = loadJson<{ entries?: SourceLandscapeRegistryEntry[] }>(sourceLandscapeRegistryPath)
  const result = new Map<string, SourceLandscapeRegistryEntry>()
  for (const entry of registry.entries ?? []) {
    if (typeof entry.landscapeId !== 'string') continue
    result.set(entry.landscapeId, entry)
  }
  sourceLandscapeRegistryEntriesByIdCache = result
  return result
}

const sourceExtractionGoalIdsByAtomicOnlyCache = new Map<boolean, Map<string, Set<string>>>()
function readSourceExtractionGoalIdsByLandscapeId(atomicOnly: boolean): Map<string, Set<string>> {
  const cached = sourceExtractionGoalIdsByAtomicOnlyCache.get(atomicOnly)
  if (cached) return cached
  const result = new Map<string, Set<string>>()
  if (!existsSync(sourceExtractionRoot)) {
    sourceExtractionGoalIdsByAtomicOnlyCache.set(atomicOnly, result)
    return result
  }

  const files = collectFiles(sourceExtractionRoot, (fileName) => /\.source-extraction\.json$/i.test(fileName))
  files.forEach((file) => {
    try {
      const extraction = loadJson<SourceExtractionDocument>(file)
      if (typeof extraction.sourceLandscapeId !== 'string' || !extraction.sourceLandscapeId.trim()) return
      const goalIds = new Set(
        (extraction.sourceGoals ?? [])
          .filter((goal) => !atomicOnly || !Array.isArray(goal.contains) || goal.contains.length === 0)
          .map((goal) => goal.id)
          .filter((goalId): goalId is string => typeof goalId === 'string' && goalId.trim().length > 0),
      )
      if (goalIds.size > 0) result.set(extraction.sourceLandscapeId, goalIds)
    } catch {
      // Diagnostic source-extraction files should not block the quality dashboard.
    }
  })

  sourceExtractionGoalIdsByAtomicOnlyCache.set(atomicOnly, result)
  return result
}

let extractedSourceAtomicGoalIdsByLandscapeIdCache: Map<string, Set<string>> | null = null
function readExtractedSourceAtomicGoalIdsByLandscapeId(): Map<string, Set<string>> {
  if (extractedSourceAtomicGoalIdsByLandscapeIdCache) return extractedSourceAtomicGoalIdsByLandscapeIdCache
  const result = readSourceExtractionGoalIdsByLandscapeId(true)
  const allSourceGoalIdsByLandscapeId = readExtractedSourceGoalIdsByLandscapeId()
  const registryEntriesById = readSourceLandscapeRegistryEntriesById()
  for (const [landscapeId, allGoalIds] of allSourceGoalIdsByLandscapeId.entries()) {
    if (result.has(landscapeId)) continue
    const entry = registryEntriesById.get(landscapeId)
    const candidatePaths = [entry?.sourcePath, entry?.archiveSourcePath]
      .filter((candidate): candidate is string => typeof candidate === 'string' && candidate.trim().length > 0)
      .map((candidate) => resolve(repoRoot, candidate))
    const sourcePath = candidatePaths.find((candidate) => existsSync(candidate))
    if (!sourcePath) continue

    try {
      const sourceLandscape = loadJson<SkillLandscape>(sourcePath)
      const atomicGoalIds = new Set(
        (sourceLandscape.goals ?? [])
          .filter((goal) => allGoalIds.has(goal.id) && isAtomicGoal(goal))
          .map((goal) => goal.id),
      )
      result.set(landscapeId, atomicGoalIds)
    } catch {
      // Source snapshots are diagnostic input. A malformed archived source must not
      // prevent the dashboard from reporting the coverage data that is still usable.
    }
  }
  extractedSourceAtomicGoalIdsByLandscapeIdCache = result
  return result
}

let extractedSourceGoalIdsByLandscapeIdCache: Map<string, Set<string>> | null = null
function readExtractedSourceGoalIdsByLandscapeId(): Map<string, Set<string>> {
  if (extractedSourceGoalIdsByLandscapeIdCache) return extractedSourceGoalIdsByLandscapeIdCache
  const result = readSourceExtractionGoalIdsByLandscapeId(false)
  const registryEntriesById = readSourceLandscapeRegistryEntriesById()
  for (const [landscapeId, entry] of registryEntriesById.entries()) {
    if (result.has(landscapeId)) continue
    const candidatePaths = [entry.sourcePath, entry.archiveSourcePath]
      .filter((candidate): candidate is string => typeof candidate === 'string' && candidate.trim().length > 0)
      .map((candidate) => resolve(repoRoot, candidate))
    const sourcePath = candidatePaths.find((candidate) => existsSync(candidate))
    if (!sourcePath) continue

    try {
      const sourceLandscape = loadJson<SkillLandscape>(sourcePath)
      const goalIds = new Set(
        (sourceLandscape.goals ?? [])
          .map((goal) => goal.id),
      )
      result.set(landscapeId, goalIds)
    } catch {
      // Source snapshots are diagnostic input. A malformed archived source must not
      // prevent the dashboard from reporting the coverage data that is still usable.
    }
  }
  extractedSourceGoalIdsByLandscapeIdCache = result
  return result
}

let sourceGoalMembershipByLandscapeIdCache: Map<string, Set<string>> | null = null
function readSourceGoalMembershipByLandscapeId(): Map<string, Set<string>> {
  if (sourceGoalMembershipByLandscapeIdCache) return sourceGoalMembershipByLandscapeIdCache
  if (!existsSync(sourceGoalMembershipRegistryPath)) return new Map<string, Set<string>>()
  const registry = loadJson<SourceGoalMembershipRegistry>(sourceGoalMembershipRegistryPath)
  const result = new Map<string, Set<string>>()
  for (const entry of registry.landscapes ?? []) {
    if (typeof entry.landscapeId !== 'string' || !Array.isArray(entry.goalIds)) continue
    result.set(entry.landscapeId, new Set(entry.goalIds.filter((goalId) => typeof goalId === 'string' && goalId.trim())))
  }
  sourceGoalMembershipByLandscapeIdCache = result
  return result
}

let sourceGoalClosureByLandscapeIdCache: Map<string, Map<string, Set<string>>> | null = null
function readSourceGoalClosureByLandscapeId(): Map<string, Map<string, Set<string>>> {
  if (sourceGoalClosureByLandscapeIdCache) return sourceGoalClosureByLandscapeIdCache
  if (!existsSync(sourceGoalClosureRegistryPath)) return new Map<string, Map<string, Set<string>>>()
  const registry = loadJson<SourceGoalClosureRegistry>(sourceGoalClosureRegistryPath)
  const result = new Map<string, Map<string, Set<string>>>()
  for (const entry of registry.landscapes ?? []) {
    if (typeof entry.landscapeId !== 'string') continue
    const rawClosures = entry.goalAtomicClosures ?? entry.closures ?? {}
    const closures = new Map<string, Set<string>>()
    Object.entries(rawClosures).forEach(([goalId, atomicGoalIds]) => {
      if (!Array.isArray(atomicGoalIds)) return
      closures.set(goalId, new Set(atomicGoalIds.filter((atomicGoalId) =>
        typeof atomicGoalId === 'string' && atomicGoalId.trim())))
    })
    result.set(entry.landscapeId, closures)
  }
  sourceGoalClosureByLandscapeIdCache = result
  return result
}

let allGoalMappingFilesCache: Array<GoalMappingFile & { file: string }> | null = null
function readAllGoalMappingFiles(): Array<GoalMappingFile & { file: string }> {
  if (allGoalMappingFilesCache) return allGoalMappingFilesCache
  const mappingRoot = resolve(repoRoot, 'curricula/DE')
  if (!existsSync(mappingRoot)) {
    allGoalMappingFilesCache = []
    return allGoalMappingFilesCache
  }
  allGoalMappingFilesCache = collectFiles(mappingRoot, (fileName) => fileName.endsWith('.json'))
    .filter((file) => file.replace(/\\/g, '/').includes('/mapping/'))
    .map((file) => ({ ...loadJson<GoalMappingFile>(file), file: toRepoPath(file) }))
  return allGoalMappingFilesCache
}

function readGoalMappingFilesForReport(report: CoverageReport): Array<GoalMappingFile & { file: string }> {
  return readAllGoalMappingFiles()
    .filter((mappingFile) => mappingFile.targetLandscapeId === report.landscapeId)
}

type CourseLevelTag = 'GK' | 'LK'

function addCourseLevelTokens(target: Set<CourseLevelTag>, value: unknown): void {
  if (Array.isArray(value)) {
    value.forEach((entry) => addCourseLevelTokens(target, entry))
    return
  }
  if (typeof value !== 'string') return

  const normalized = value.trim().toUpperCase().replace(/\s+/g, '_')
  if (!normalized) return
  if (normalized === 'GK' || normalized === 'GRUNDKURS') {
    target.add('GK')
    return
  }
  if (normalized === 'LK' || normalized === 'LEISTUNGSKURS') {
    target.add('LK')
    return
  }
  if (
    normalized === 'GK_LK'
    || normalized === 'GK+LK'
    || normalized === 'GK/LK'
    || normalized === 'BOTH'
    || normalized === 'ALL'
    || normalized.includes('GRUNDKURS_UND_LEISTUNGSKURS')
  ) {
    target.add('GK')
    target.add('LK')
  }
}

function readCanonicalGoalCourseLevels(goal: LearningGoal | undefined): Set<CourseLevelTag> {
  const levels = new Set<CourseLevelTag>()
  if (!goal) return levels

  ;(goal.tags ?? []).forEach((tag) => addCourseLevelTokens(levels, tag))
  const dimensionTags = goal.dimensionTags as Record<string, unknown> | undefined
  addCourseLevelTokens(levels, dimensionTags?.courseLevel)
  addCourseLevelTokens(levels, dimensionTags?.courseLevels)
  addCourseLevelTokens(levels, (goal as { courseLevel?: unknown }).courseLevel)
  addCourseLevelTokens(levels, (goal as { courseLevels?: unknown }).courseLevels)
  return levels
}

function readEffectiveCanonicalGoalCourseLevels(goal: LearningGoal | undefined): Set<CourseLevelTag> {
  const explicitLevels = readCanonicalGoalCourseLevels(goal)
  if (!goal || explicitLevels.size > 0) return explicitLevels

  const semanticText = `${goal.title ?? ''} ${goal.description ?? ''}`.toUpperCase()
  const inferredLevels = new Set<CourseLevelTag>()
  if (/\bGK\b/.test(semanticText) || semanticText.includes('GRUNDKURS')) inferredLevels.add('GK')
  if (/\bLK\b/.test(semanticText) || semanticText.includes('LEISTUNGSKURS')) inferredLevels.add('LK')
  if (inferredLevels.size > 0) return inferredLevels

  if (!isCanonicalGymMathGoal(goal)) return explicitLevels

  return new Set<CourseLevelTag>(['GK', 'LK'])
}

function hasNonEmptyRationale(...candidates: unknown[]): boolean {
  return candidates.some((candidate) => typeof candidate === 'string' && candidate.trim().length > 0)
}

function readReviewedCourseLevelDecision(
  sourceGoal: SourceExtractionGoal,
  mapping: GoalMappingEntry,
  decisionBySourceGoalId: Map<string, SourceMappingReviewDecision>,
): { levels: Set<CourseLevelTag>; reviewedException: boolean } | null {
  const reviewDecision = sourceGoal.id ? decisionBySourceGoalId.get(sourceGoal.id) : undefined
  const levelDecision = mapping.courseLevelDecision ?? reviewDecision?.courseLevelDecision
  if (!levelDecision) return null

  const levels = new Set<CourseLevelTag>()
  addCourseLevelTokens(levels, levelDecision)
  if (levels.size === 0) return null

  const reviewedException = hasNonEmptyRationale(
    mapping.courseLevelRationale,
    reviewDecision?.courseLevelRationale,
    reviewDecision?.rationale,
  )
  return reviewedException ? { levels, reviewedException } : null
}

function isUpperSecondarySourceGoal(sourceGoal: SourceExtractionGoal): boolean {
  const values = [
    sourceGoal.stage,
    sourceGoal.phase,
    sourceGoal.sourcePath,
    sourceGoal.sourceRef,
    sourceGoal.passageId,
    sourceGoal.id,
  ]
    .filter((value): value is string => typeof value === 'string')
    .map((value) => value.toLowerCase())

  return values.some((value) =>
    value.includes('upper-secondary')
    || value.includes('sekii')
    || value.includes('sek ii')
    || value.includes('oberstufe')
    || value.includes('kursstufe')
    || value.includes('qualifikationsphase')
    || value.includes('studienstufe')
    || value.includes('gost')
    || value.includes('mss'))
}

function expectedCourseLevelsForSourceGoal(
  sourceGoal: SourceExtractionGoal,
  mapping: GoalMappingEntry,
  decisionBySourceGoalId: Map<string, SourceMappingReviewDecision>,
): { levels: Set<CourseLevelTag>; defaultedFromUnspecified: boolean; reviewedException: boolean } | null {
  if (!isUpperSecondarySourceGoal(sourceGoal)) return null

  const rawCourseLevel = typeof sourceGoal.courseLevel === 'string'
    ? sourceGoal.courseLevel.trim()
    : ''
  const normalized = rawCourseLevel.toUpperCase()
  const reviewedDecision = readReviewedCourseLevelDecision(sourceGoal, mapping, decisionBySourceGoalId)

  if (reviewedDecision) {
    return {
      levels: reviewedDecision.levels,
      defaultedFromUnspecified: false,
      reviewedException: reviewedDecision.reviewedException,
    }
  }

  if (normalized === 'UNSPECIFIED' || normalized === '') {
    return {
      levels: new Set<CourseLevelTag>(['GK', 'LK']),
      defaultedFromUnspecified: true,
      reviewedException: false,
    }
  }

  const levels = new Set<CourseLevelTag>()
  addCourseLevelTokens(levels, rawCourseLevel)
  return levels.size > 0
    ? { levels, defaultedFromUnspecified: false, reviewedException: false }
    : null
}

function formatCourseLevelSet(levels: Set<CourseLevelTag>): string {
  return Array.from(levels).sort().join('+') || '-'
}

function evaluateCourseLevelMappingConsistency(landscape: SkillLandscape): RuleResult {
  const goalById = new Map(landscape.goals.map((goal) => [goal.id, goal]))
  const configuredMappingFiles = readAllGoalMappingFiles()
    .filter((mappingFile) =>
      mappingFile.targetLandscapeId === landscape.landscapeId
      && typeof mappingFile.sourceExtractionPath === 'string'
      && mappingFile.sourceExtractionPath.trim().length > 0)

  if (configuredMappingFiles.length === 0) {
    return makeRule(
      'CQR-004',
      'not_configured',
      'No persisted source-extraction mapping with GK/LK course-level metadata is configured for this curriculum.',
    )
  }

  let sourceGoals = 0
  let sourceGoalsWithCourseLevel = 0
  let gkLkSourceGoals = 0
  let lkSourceGoals = 0
  let unspecifiedSourceGoals = 0
  let checkedMappingEdges = 0
  let defaultedUnspecifiedMappingEdges = 0
  let reviewedCourseLevelExceptions = 0
  let missingSourceGoals = 0
  let missingTargetGoals = 0
  let unmappedCourseLevelSourceGoals = 0
  const mismatches: string[] = []
  const details: string[] = []

  configuredMappingFiles.forEach((mappingFile) => {
    const extractionPath = resolve(repoRoot, mappingFile.sourceExtractionPath!)
    if (!existsSync(extractionPath)) {
      details.push(`${mappingFile.file}: missing source-extraction file ${mappingFile.sourceExtractionPath}`)
      return
    }

    const extraction = loadJson<SourceExtractionDocument>(extractionPath)
    const sourceGoalById = new Map(
      (extraction.sourceGoals ?? [])
        .filter((goal): goal is SourceExtractionGoal & { id: string } =>
          typeof goal.id === 'string' && goal.id.trim().length > 0)
        .map((goal) => [goal.id, goal]),
    )
    const mappedSourceGoalIds = new Set(
      (mappingFile.mappings ?? [])
        .map((mapping) => mapping.legacyGoalId)
        .filter((goalId): goalId is string => typeof goalId === 'string' && goalId.trim().length > 0),
    )
    const decisionBySourceGoalId = new Map(
      (mappingFile.decisions ?? [])
        .filter((decision): decision is SourceMappingReviewDecision & { sourceGoalId: string } =>
          typeof decision.sourceGoalId === 'string' && decision.sourceGoalId.trim().length > 0)
        .map((decision) => [decision.sourceGoalId, decision]),
    )

    const upperSecondarySourceGoals = Array.from(sourceGoalById.values()).filter(isUpperSecondarySourceGoal)
    sourceGoals += upperSecondarySourceGoals.length
    upperSecondarySourceGoals.forEach((sourceGoal) => {
      const expected = expectedCourseLevelsForSourceGoal(sourceGoal, {}, decisionBySourceGoalId)
      if (!expected) return
      sourceGoalsWithCourseLevel += 1
      if (expected.levels.has('GK') && expected.levels.has('LK')) gkLkSourceGoals += 1
      if (!expected.levels.has('GK') && expected.levels.has('LK')) lkSourceGoals += 1
      if (String(sourceGoal.courseLevel ?? '').trim().toUpperCase() === 'UNSPECIFIED') unspecifiedSourceGoals += 1
      if (!mappedSourceGoalIds.has(sourceGoal.id!)) {
        const decision = decisionBySourceGoalId.get(sourceGoal.id!)
        if (decision?.decision === 'needsCanonicalGoal') return
        unmappedCourseLevelSourceGoals += 1
        if (details.length < 20) details.push(`${sourceGoal.id}: no canonical mapping exists for course-level checked source goal`)
      }
    })

    ;(mappingFile.mappings ?? []).forEach((mapping) => {
      if (mapping.matchType === 'partial') return
      if (!mapping.legacyGoalId || !mapping.canonicalGoalId) return

      const sourceGoal = sourceGoalById.get(mapping.legacyGoalId)
      if (!sourceGoal) {
        missingSourceGoals += 1
        if (details.length < 20) details.push(`${mappingFile.file}: source goal ${mapping.legacyGoalId} is not present in ${mappingFile.sourceExtractionPath}`)
        return
      }

      const expected = expectedCourseLevelsForSourceGoal(sourceGoal, mapping, decisionBySourceGoalId)
      if (!expected) return

      const targetGoal = goalById.get(mapping.canonicalGoalId)
      if (!targetGoal) {
        missingTargetGoals += 1
        if (details.length < 20) details.push(`${mappingFile.file}: canonical goal ${mapping.canonicalGoalId} is missing`)
        return
      }

      checkedMappingEdges += 1
      if (expected.defaultedFromUnspecified) defaultedUnspecifiedMappingEdges += 1
      if (expected.reviewedException) reviewedCourseLevelExceptions += 1

      const targetLevels = readEffectiveCanonicalGoalCourseLevels(targetGoal)
      const compatible = Array.from(expected.levels).every((level) => targetLevels.has(level))
      if (!compatible) {
        if (expected.reviewedException) return
        const message = `${sourceGoal.id} (${sourceGoal.courseLevel ?? 'unspecified'} -> ${formatCourseLevelSet(expected.levels)}) maps to ${formatGoal(targetGoal, targetGoal.id)} with tags ${formatCourseLevelSet(targetLevels)}`
        mismatches.push(message)
        if (details.length < 20) details.push(message)
      }
    })
  })

  const issueCount = mismatches.length + missingSourceGoals + missingTargetGoals + unmappedCourseLevelSourceGoals
  return makeRule(
    'CQR-004',
    issueCount === 0 ? 'pass' : 'fail',
    issueCount === 0
      ? `Course-level mapping is clean for ${checkedMappingEdges} upper-secondary source-to-canonical mapping edge(s), including ${reviewedCourseLevelExceptions} reviewed course-level exception(s); unspecified upper-secondary source goals default to GK/LK unless explicitly reviewed.`
      : `${issueCount} upper-secondary course-level mapping issue(s); unspecified upper-secondary source goals default to GK/LK unless explicitly reviewed as LK-only.`,
    {
      configuredMappingFiles: configuredMappingFiles.length,
      sourceGoals,
      sourceGoalsWithCourseLevel,
      gkLkSourceGoals,
      lkSourceGoals,
      unspecifiedSourceGoals,
      checkedMappingEdges,
      defaultedUnspecifiedMappingEdges,
      reviewedCourseLevelExceptions,
      mismatches: mismatches.length,
      missingSourceGoals,
      missingTargetGoals,
      unmappedCourseLevelSourceGoals,
    },
    details,
  )
}

function readSourceExtractionPipelinesByLandscapeId(): Map<string, MappingPipelineSourceStatus> {
  const result = new Map<string, MappingPipelineSourceStatus>()
  const registryEntriesById = readSourceLandscapeRegistryEntriesById()
  const files = collectFiles(sourceExtractionRoot, (fileName) => /\.source-extraction\.json$/i.test(fileName))
  const knownCanonicalGoalIds = new Set(
    collectFiles(canonicalRoot, (fileName) => /\.json$/i.test(fileName) && !/_deck/i.test(fileName))
      .flatMap((file) => {
        try {
          const landscape = loadJson<SkillLandscape>(file)
          return landscape.goals.map((goal) => goal.id)
        } catch {
          return []
        }
      }),
  )
  const mappingFilesBySourceExtractionPath = new Map<string, Array<GoalMappingFile & { file: string }>>()

  readAllGoalMappingFiles().forEach((mappingFile) => {
    if (typeof mappingFile.sourceExtractionPath !== 'string' || !mappingFile.sourceExtractionPath.trim()) return
    const sourceExtractionPath = mappingFile.sourceExtractionPath.replace(/\\/g, '/')
    const mappingFiles = mappingFilesBySourceExtractionPath.get(sourceExtractionPath) ?? []
    mappingFiles.push(mappingFile)
    mappingFilesBySourceExtractionPath.set(sourceExtractionPath, mappingFiles)
  })

  files.forEach((file) => {
    try {
      const extraction = loadJson<SourceExtractionDocument>(file)
      if (typeof extraction.sourceLandscapeId !== 'string' || !extraction.sourceLandscapeId.trim()) return
      const steps = (extraction.pipelineStatus?.steps ?? [])
        .map(normalizeMappingPipelineStep)
        .filter((step): step is MappingPipelineStep => step !== null)
      if (steps.length === 0) return

      const registryEntry = registryEntriesById.get(extraction.sourceLandscapeId)
      const sourceGoals = Array.isArray(extraction.sourceGoals) ? extraction.sourceGoals : []
      const sourceGoalIds = new Set(
        sourceGoals
          .map((sourceGoal) => sourceGoal.id)
          .filter((sourceGoalId): sourceGoalId is string => typeof sourceGoalId === 'string' && sourceGoalId.trim().length > 0),
      )
      const repoPath = toRepoPath(file)
      const mappingFilesForExtraction = mappingFilesBySourceExtractionPath.get(repoPath) ?? []
      const mappingEntries = mappingFilesForExtraction
        .flatMap((mappingFile) => mappingFile.mappings ?? [])
        .filter((mapping): mapping is GoalMappingEntry & { legacyGoalId: string } =>
          typeof mapping.legacyGoalId === 'string' && mapping.legacyGoalId.trim().length > 0)
      const decisionEntries = mappingFilesForExtraction
        .flatMap((mappingFile) => mappingFile.decisions ?? [])
        .filter((decision): decision is SourceMappingReviewDecision & { sourceGoalId: string; decision: string } =>
          typeof decision.sourceGoalId === 'string'
          && decision.sourceGoalId.trim().length > 0
          && typeof decision.decision === 'string'
          && decision.decision.trim().length > 0)
      const mappedSourceGoalIds = new Set(mappingEntries.map((mapping) => mapping.legacyGoalId))
      const validMappedSourceGoalIds = new Set(Array.from(mappedSourceGoalIds).filter((sourceGoalId) => sourceGoalIds.has(sourceGoalId)))
      const extraMappedGoalIds = Array.from(mappedSourceGoalIds).filter((sourceGoalId) => !sourceGoalIds.has(sourceGoalId))
      const extraDecisionGoalIds = decisionEntries
        .map((decision) => decision.sourceGoalId)
        .filter((sourceGoalId) => !sourceGoalIds.has(sourceGoalId))
      const invalidMappedTargetGoalIds = mappingEntries
        .map((mapping) => mapping.canonicalGoalId)
        .filter((canonicalGoalId): canonicalGoalId is string => typeof canonicalGoalId === 'string' && canonicalGoalId.trim().length > 0)
        .filter((canonicalGoalId) => !knownCanonicalGoalIds.has(canonicalGoalId))
      const matchTypesBySourceGoalId = new Map<string, Set<string>>()
      mappingEntries.forEach((mapping) => {
        if (!sourceGoalIds.has(mapping.legacyGoalId)) return
        const matchTypes = matchTypesBySourceGoalId.get(mapping.legacyGoalId) ?? new Set<string>()
        if (typeof mapping.matchType === 'string' && mapping.matchType.trim().length > 0) {
          matchTypes.add(mapping.matchType)
        }
        matchTypesBySourceGoalId.set(mapping.legacyGoalId, matchTypes)
      })
      const exactMappings = Array.from(validMappedSourceGoalIds).filter((sourceGoalId) =>
        matchTypesBySourceGoalId.get(sourceGoalId)?.has('exact')).length
      const partialMappings = Array.from(validMappedSourceGoalIds).filter((sourceGoalId) => {
        const matchTypes = matchTypesBySourceGoalId.get(sourceGoalId)
        return !matchTypes?.has('exact') && matchTypes?.has('partial')
      }).length
      const otherMappings = Math.max(0, validMappedSourceGoalIds.size - exactMappings - partialMappings)
      const unmappedSourceGoals = Math.max(0, sourceGoalIds.size - validMappedSourceGoalIds.size)
      const reviewedSourceGoalIds = new Set(
        decisionEntries
          .map((decision) => decision.sourceGoalId)
          .filter((sourceGoalId) => sourceGoalIds.has(sourceGoalId)),
      )
      const reviewedMappedSourceGoalIds = new Set(
        Array.from(reviewedSourceGoalIds).filter((sourceGoalId) => validMappedSourceGoalIds.has(sourceGoalId)),
      )
      const explicitNeedsCanonicalGoal = decisionEntries.filter((decision) =>
        sourceGoalIds.has(decision.sourceGoalId)
        && decision.decision === 'needsCanonicalGoal'
        && !validMappedSourceGoalIds.has(decision.sourceGoalId)).length
      const unreviewedSourceGoals = Math.max(0, sourceGoalIds.size - reviewedSourceGoalIds.size)
      const normalizedSteps = normalizeSourceExtractionPipelineSteps(steps, {
        totalSourceGoals: sourceGoalIds.size,
        mappedSourceGoals: validMappedSourceGoalIds.size,
        reviewedMappedSourceGoals: reviewedMappedSourceGoalIds.size,
        unmappedSourceGoals,
        explicitNeedsCanonicalGoal,
        unreviewedSourceGoals,
        hasM3ReviewFile: mappingFilesForExtraction.length > 0,
        extraDecisionGoals: extraDecisionGoalIds.length,
        invalidMappedTargetGoals: invalidMappedTargetGoalIds.length,
      })
      const completedSteps = normalizedSteps.filter((step) => step.status === 'complete').length
      const currentStep = completedSteps === normalizedSteps.length
        ? ''
        : normalizedSteps.find((step) => step.status !== 'complete')?.id
          ?? extraction.pipelineStatus?.currentStep
          ?? ''
      result.set(extraction.sourceLandscapeId, {
        sourceLandscapeId: extraction.sourceLandscapeId,
        title: extraction.title ?? registryEntry?.title ?? extraction.extractionId ?? extraction.sourceLandscapeId,
        jurisdiction: normalizeJurisdiction(registryEntry?.jurisdiction ?? extraction.jurisdiction) ?? String(registryEntry?.jurisdiction ?? extraction.jurisdiction ?? ''),
        subject: typeof extraction.subject === 'string' ? extraction.subject : undefined,
        stage: typeof extraction.stage === 'string' ? extraction.stage : undefined,
        durationModels: normalizeDurationModels(extraction.durationModels),
        path: repoPath,
        sourceKind: 'source-extraction',
        sourceDocuments: sourceDocumentsForExtraction(extraction),
        currentStep,
        completedSteps,
        totalSteps: steps.length,
        sourceGoals: sourceGoals.length,
        passages: Array.isArray(extraction.passages) ? extraction.passages.length : 0,
        mappedSourceGoals: validMappedSourceGoalIds.size,
        unmappedSourceGoals,
        extraMappedGoals: extraMappedGoalIds.length,
        exactMappings,
        partialMappings,
        otherMappings,
        sourceGoalCountPeerBaselineReview: normalizeSourceGoalCountPeerBaselineReview(extraction.qualityReview?.sourceGoalCountPeerBaseline),
        sourceGoalGranularity: summarizeSourceGoalGranularity(sourceGoals),
        durationProjectionAudit: normalizeDurationProjectionAudit(extraction.durationProjectionAudit),
        steps: normalizedSteps,
      })
    } catch {
      // A malformed diagnostic extraction should not prevent the rest of the quality dashboard from rendering.
    }
  })

  appendSourceGoalCountPeerChecks(result)
  return result
}

function createMissingSourceExtractionPipeline(
  mappingFile: GoalMappingFile & { file: string },
  registryEntriesById: Map<string, SourceLandscapeRegistryEntry>,
): MappingPipelineSourceStatus | null {
  if (typeof mappingFile.sourceLandscapeId !== 'string' || !mappingFile.sourceLandscapeId.trim()) return null
  const registryEntry = registryEntriesById.get(mappingFile.sourceLandscapeId)
  const jurisdiction = normalizeJurisdiction(registryEntry?.jurisdiction) ?? String(registryEntry?.jurisdiction ?? '')
  const sourceSnapshotPipeline = createSourceSnapshotMappingPipeline(mappingFile, registryEntry, jurisdiction)
  if (sourceSnapshotPipeline) return sourceSnapshotPipeline

  const steps: MappingPipelineStep[] = [
    {
      id: 'MAPPING-1',
      label: 'Original-Lehrplanpassagen extrahiert',
      status: 'incomplete',
      dependsOn: [],
      checks: [
        {
          id: 'source-extraction-file-present',
          label: 'Persistiertes Source-Extraction-Artefakt vorhanden',
          passed: false,
          details: 'Für diese Source-Landschaft ist noch keine geprüfte source-extraction-Datei registriert.',
        },
      ],
    },
    {
      id: 'MAPPING-2',
      label: 'Source-Ziele aus Lehrplanpassagen erstellt',
      status: 'blocked',
      dependsOn: ['MAPPING-1'],
      checks: [
        {
          id: 'mapping-1-complete',
          label: 'MAPPING-1 abgeschlossen',
          passed: false,
          details: 'Source-Ziele dürfen erst nach vollständig extrahierten Originalpassagen als abgeschlossen gelten.',
        },
      ],
    },
    {
      id: 'MAPPING-3',
      label: 'Source-Ziele auf SkillPilot-Ziele gemappt',
      status: 'blocked',
      dependsOn: ['MAPPING-2'],
      checks: [
        {
          id: 'mapping-2-complete',
          label: 'MAPPING-2 abgeschlossen',
          passed: false,
          details: 'Das Mapping auf SkillPilot-Ziele darf erst nach geprüften Source-Zielen als abgeschlossen gelten.',
        },
      ],
    },
  ]

  return {
    sourceLandscapeId: mappingFile.sourceLandscapeId,
    title: registryEntry?.title ?? mappingFile.sourceLandscapeId,
    jurisdiction,
    path: mappingFile.file,
    sourceKind: 'missing-extraction',
    currentStep: 'MAPPING-1',
    completedSteps: 0,
    totalSteps: steps.length,
    sourceGoals: 0,
    passages: 0,
    steps,
  }
}

function createSourceSnapshotMappingPipeline(
  mappingFile: GoalMappingFile & { file: string },
  registryEntry: SourceLandscapeRegistryEntry | undefined,
  jurisdiction: string,
): MappingPipelineSourceStatus | null {
  const candidatePaths = [registryEntry?.sourcePath, registryEntry?.archiveSourcePath]
    .filter((candidate): candidate is string => typeof candidate === 'string' && candidate.trim().length > 0)
    .map((candidate) => resolve(repoRoot, candidate))
  const sourcePath = candidatePaths.find((candidate) => existsSync(candidate))
  if (!sourcePath) return null

  let sourceLandscape: SkillLandscape
  try {
    sourceLandscape = loadJson<SkillLandscape>(sourcePath)
  } catch {
    return null
  }

  const sourceGoalIds = (sourceLandscape.goals ?? [])
    .map((goal) => goal.id)
    .filter((goalId): goalId is string => typeof goalId === 'string' && goalId.trim().length > 0)
  if (sourceGoalIds.length === 0) return null

  const sourceGoalIdSet = new Set(sourceGoalIds)
  const mappingEntries = mappingFile.mappings ?? []
  const mappedGoalIds = new Set(
    mappingEntries
      .map((mapping) => mapping.legacyGoalId)
      .filter((goalId): goalId is string => typeof goalId === 'string' && goalId.trim().length > 0),
  )
  const missingSourceGoalIds = sourceGoalIds.filter((goalId) => !mappedGoalIds.has(goalId))
  const extraMappedGoalIds = Array.from(mappedGoalIds).filter((goalId) => !sourceGoalIdSet.has(goalId))
  const mappingComplete = missingSourceGoalIds.length === 0 && extraMappedGoalIds.length === 0
  const exactMappings = mappingEntries.filter((mapping) => mapping.matchType === 'exact').length
  const partialMappings = mappingEntries.filter((mapping) => mapping.matchType === 'partial').length
  const otherMappings = mappingEntries.filter((mapping) => (
    typeof mapping.matchType === 'string'
    && mapping.matchType.length > 0
    && mapping.matchType !== 'exact'
    && mapping.matchType !== 'partial'
  )).length

  const detailsFor = (goalIds: string[], noun: string): string => {
    if (goalIds.length === 0) return `Keine ${noun}.`
    const sample = goalIds.slice(0, 8).join(', ')
    const suffix = goalIds.length > 8 ? `, ... (+${goalIds.length - 8})` : ''
    return `${goalIds.length} ${noun}: ${sample}${suffix}`
  }

  const steps: MappingPipelineStep[] = [
    {
      id: 'MAPPING-1',
      label: 'Original-Lehrplanpassagen extrahiert',
      status: 'incomplete',
      dependsOn: [],
      checks: [
        {
          id: 'source-extraction-file-present',
          label: 'Keine geprüfte Passage-Extraction',
          passed: false,
          details: `Snapshot-Diagnose ist registriert: ${toRepoPath(sourcePath)}. Diese Spur zählt nicht als abgeschlossene MAPPING-Pipeline, weil keine einzeln extrahierten Originalpassagen vorliegen.`,
        },
      ],
    },
    {
      id: 'MAPPING-2',
      label: 'Source-Ziele aus Lehrplanpassagen erstellt',
      status: 'blocked',
      dependsOn: ['MAPPING-1'],
      checks: [
        {
          id: 'mapping-1-complete',
          label: 'MAPPING-1 abgeschlossen',
          passed: false,
          details: 'Snapshot-Goals aus einem Archiv ersetzen keine geprüfte Herleitung aus Original-Lehrplanpassagen.',
        },
      ],
    },
    {
      id: 'MAPPING-3',
      label: 'Source-Ziele auf SkillPilot-Ziele gemappt',
      status: 'blocked',
      dependsOn: ['MAPPING-2'],
      checks: [
        {
          id: 'mapping-2-complete',
          label: 'MAPPING-2 abgeschlossen',
          passed: false,
          details: mappingComplete
            ? `${sourceGoalIds.length}/${sourceGoalIds.length} Snapshot-Goal(s) sind in ${mappingFile.file} inventarisiert, werden ohne MAPPING-1/2-Review aber nicht als abgeschlossenes Pipeline-Mapping gewertet.`
            : [
              detailsFor(missingSourceGoalIds, 'ungemappte Snapshot-Goal(s)'),
              detailsFor(extraMappedGoalIds, 'Mapping-Goal(s) ohne Snapshot-Eintrag'),
            ].join(' '),
        },
      ],
    },
  ]

  return {
    sourceLandscapeId: mappingFile.sourceLandscapeId!,
    title: registryEntry?.title ?? sourceLandscape.title ?? mappingFile.sourceLandscapeId!,
    jurisdiction,
    path: mappingFile.file,
    sourceKind: 'legacy-snapshot',
    currentStep: 'MAPPING-1',
    completedSteps: 0,
    totalSteps: steps.length,
    sourceGoals: sourceGoalIds.length,
    passages: 0,
    mappedSourceGoals: mappedGoalIds.size,
    unmappedSourceGoals: missingSourceGoalIds.length,
    extraMappedGoals: extraMappedGoalIds.length,
    exactMappings,
    partialMappings,
    otherMappings,
    steps,
  }
}

function readMappingPipelineByLandscapeId(): Map<string, MappingPipelineStatus> {
  const sourcePipelineBySourceLandscapeId = readSourceExtractionPipelinesByLandscapeId()
  const registryEntriesById = readSourceLandscapeRegistryEntriesById()
  const sourcesByTargetLandscapeId = new Map<string, MappingPipelineSourceStatus[]>()

  readAllGoalMappingFiles().forEach((mappingFile) => {
    if (typeof mappingFile.targetLandscapeId !== 'string' || typeof mappingFile.sourceLandscapeId !== 'string') return
    const sourcePipeline = sourcePipelineBySourceLandscapeId.get(mappingFile.sourceLandscapeId)
      ?? createMissingSourceExtractionPipeline(mappingFile, registryEntriesById)
    if (!sourcePipeline) return
    const sources = sourcesByTargetLandscapeId.get(mappingFile.targetLandscapeId) ?? []
    if (!sources.some((source) => source.sourceLandscapeId === sourcePipeline.sourceLandscapeId)) {
      sources.push(sourcePipeline)
      sourcesByTargetLandscapeId.set(mappingFile.targetLandscapeId, sources)
    }
  })

  const result = new Map<string, MappingPipelineStatus>()
  sourcesByTargetLandscapeId.forEach((sources, targetLandscapeId) => {
    const totalSteps = Math.max(0, ...sources.map((source) => source.totalSteps))
    const completeSources = sources.filter((source) => source.completedSteps === source.totalSteps).length
    const blockedSources = sources.filter((source) => source.steps.some((step) => step.status === 'blocked')).length
    const incompleteSources = sources.length - completeSources - blockedSources
    const currentStep = sources
      .map((source) => source.currentStep)
      .find((stepId) => stepId)
      ?? ''

    result.set(targetLandscapeId, {
      totalSources: sources.length,
      completeSources,
      incompleteSources,
      blockedSources,
      maxCompletedSteps: Math.max(0, ...sources.map((source) => source.completedSteps)),
      totalSteps,
      currentStep,
      sources: [...sources].sort((left, right) =>
        left.jurisdiction.localeCompare(right.jurisdiction)
        || left.title.localeCompare(right.title, 'de', { sensitivity: 'base' })),
    })
  })

  return result
}

function buildCanonicalAtomicDescendantsByGoalId(report: CoverageReport): Map<string, Set<string>> {
  const landscape = readLandscapeForReport(report)
  const result = new Map<string, Set<string>>()
  if (!landscape) return result
  const goalById = new Map(landscape.goals.map((goal) => [goal.id, goal]))

  const collect = (goalId: string, visiting = new Set<string>()): Set<string> => {
    const cached = result.get(goalId)
    if (cached) return cached
    if (visiting.has(goalId)) return new Set<string>()
    visiting.add(goalId)

    const goal = goalById.get(goalId)
    const atomicGoalIds = new Set<string>()
    if (goal) {
      if (isAtomicGoal(goal)) {
        atomicGoalIds.add(goal.id)
      } else {
        ;(goal.contains ?? []).forEach((rawChildId) => {
          const childId = rawChildId.includes(':') ? rawChildId.split(':').pop()! : rawChildId
          collect(childId, visiting).forEach((atomicGoalId) => atomicGoalIds.add(atomicGoalId))
        })
      }
    }

    visiting.delete(goalId)
    result.set(goalId, atomicGoalIds)
    return atomicGoalIds
  }

  landscape.goals.forEach((goal) => collect(goal.id))
  return result
}

function targetIntersectsView(
  canonicalGoalId: string | undefined,
  viewAtomicGoalIds: Set<string>,
  canonicalAtomicDescendantsByGoalId: Map<string, Set<string>>,
): boolean {
  if (!canonicalGoalId) return false
  if (viewAtomicGoalIds.has(canonicalGoalId)) return true
  const descendants = canonicalAtomicDescendantsByGoalId.get(canonicalGoalId)
  if (!descendants) return false
  for (const goalId of descendants) {
    if (viewAtomicGoalIds.has(goalId)) return true
  }
  return false
}

function expandSourceAtomicGoalIds(
  sourceLandscapeId: string,
  goalId: string,
  sourceGoalClosureByLandscapeId: Map<string, Map<string, Set<string>>>,
): Set<string> {
  const closure = sourceGoalClosureByLandscapeId.get(sourceLandscapeId)?.get(goalId)
  return closure && closure.size > 0 ? closure : new Set([goalId])
}

function sourceGoalKey(sourceLandscapeId: string, goalId: string): string {
  return `${sourceLandscapeId}:${goalId}`
}

function readReverseSourceCoverageByJurisdiction(
  report: CoverageReport,
  viewAtomicGoalIdsByJurisdiction: Map<string, Set<string>>,
): Map<string, {
  sourceAtomicGoals: number
  sourceMappedToViewAtomicGoals: number
  unmappedSourceAtomicGoals: number
  sourceExtractedGoals: number
  sourceUnregisteredGoals: number
  sourceExtractedAtomicGoals: number
  sourceUnregisteredAtomicGoals: number
  sourceOriginalGoals: number
  sourceFullyCoveredOriginalGoals: number
  sourcePartiallyCoveredOriginalGoals: number
  sourceUncoveredOriginalGoals: number
}> {
  const sourceLandscapeJurisdictionById = readSourceLandscapeJurisdictionById()
  const sourceGoalMembershipByLandscapeId = readSourceGoalMembershipByLandscapeId()
  const sourceGoalClosureByLandscapeId = readSourceGoalClosureByLandscapeId()
  const sourceExtractedGoalIdsByLandscapeId = readExtractedSourceGoalIdsByLandscapeId()
  const sourceExtractedAtomicGoalIdsByLandscapeId = readExtractedSourceAtomicGoalIdsByLandscapeId()
  const sourceExtractionLandscapeIds = new Set(sourceExtractedGoalIdsByLandscapeId.keys())
  const canonicalAtomicDescendantsByGoalId = buildCanonicalAtomicDescendantsByGoalId(report)
  const landscape = readLandscapeForReport(report)
  const canonicalGoalById = new Map((landscape?.goals ?? []).map((goal) => [goal.id, goal]))
  const mappingFiles = readGoalMappingFilesForReport(report)
  const mappingsByJurisdiction = new Map<string, Array<GoalMappingEntry & { sourceLandscapeId: string }>>()
  const sourceLandscapeIdsByJurisdiction = new Map<string, Set<string>>()

  for (const mappingFile of mappingFiles) {
    if (typeof mappingFile.sourceLandscapeId !== 'string') continue
    if (
      sourceExtractionLandscapeIds.has(mappingFile.sourceLandscapeId)
      && (typeof mappingFile.sourceExtractionPath !== 'string' || mappingFile.sourceExtractionPath.trim().length === 0)
    ) {
      continue
    }
    const jurisdiction = sourceLandscapeJurisdictionById.get(mappingFile.sourceLandscapeId)
    if (!jurisdiction) continue
    const sourceLandscapeIds = sourceLandscapeIdsByJurisdiction.get(jurisdiction) ?? new Set<string>()
    sourceLandscapeIds.add(mappingFile.sourceLandscapeId)
    sourceLandscapeIdsByJurisdiction.set(jurisdiction, sourceLandscapeIds)

    const entries = mappingsByJurisdiction.get(jurisdiction) ?? []
    const reviewedCoveredSourceGoalIds = typeof mappingFile.sourceExtractionPath === 'string'
      && mappingFile.sourceExtractionPath.trim().length > 0
      ? new Set(
        (mappingFile.decisions ?? [])
          .filter((decision) => decision.decision === 'mapped')
          .map((decision) => decision.sourceGoalId)
          .filter((sourceGoalId): sourceGoalId is string => typeof sourceGoalId === 'string' && sourceGoalId.trim().length > 0),
      )
      : null
    for (const mapping of mappingFile.mappings ?? []) {
      if (
        reviewedCoveredSourceGoalIds
        && (!mapping.legacyGoalId || !reviewedCoveredSourceGoalIds.has(mapping.legacyGoalId))
      ) {
        continue
      }
      entries.push({ ...mapping, sourceLandscapeId: mappingFile.sourceLandscapeId })
    }
    mappingsByJurisdiction.set(jurisdiction, entries)
  }

  const result = new Map<string, {
    sourceAtomicGoals: number
    sourceMappedToViewAtomicGoals: number
    unmappedSourceAtomicGoals: number
    sourceExtractedGoals: number
    sourceUnregisteredGoals: number
    sourceExtractedAtomicGoals: number
    sourceUnregisteredAtomicGoals: number
    sourceOriginalGoals: number
    sourceFullyCoveredOriginalGoals: number
    sourcePartiallyCoveredOriginalGoals: number
    sourceUncoveredOriginalGoals: number
  }>()

  for (const [jurisdiction, sourceLandscapeIds] of sourceLandscapeIdsByJurisdiction.entries()) {
    const explicitViewAtomicGoalIds = viewAtomicGoalIdsByJurisdiction.get(jurisdiction)
    const viewAtomicGoalIds = explicitViewAtomicGoalIds && explicitViewAtomicGoalIds.size > 0
      ? explicitViewAtomicGoalIds
      : new Set(
        report.goals
          .filter((goal) =>
            goal.goalType === 'atomic'
            && (goal.compiledApplicability.jurisdiction ?? []).includes(jurisdiction)
            && isCurriculumSourceCoverageGoal(canonicalGoalById.get(goal.goalId)))
          .map((goal) => goal.goalId),
      )
    const sourceExtractedGoalIds = new Set<string>()
    const sourceExtractedAtomicGoalIds = new Set<string>()
    const sourceAtomicGoalIds = new Set<string>()
    const sourceOriginalGoalIds = new Set<string>()
    const atomicClosureBySourceOriginalGoalId = new Map<string, Set<string>>()
    const expandForCoverage = (sourceLandscapeId: string, goalId: string): Set<string> =>
      sourceExtractionLandscapeIds.has(sourceLandscapeId)
        ? new Set([goalId])
        : expandSourceAtomicGoalIds(sourceLandscapeId, goalId, sourceGoalClosureByLandscapeId)

    for (const sourceLandscapeId of sourceLandscapeIds) {
      ;(sourceExtractedGoalIdsByLandscapeId.get(sourceLandscapeId) ?? new Set<string>())
        .forEach((goalId) => sourceExtractedGoalIds.add(sourceGoalKey(sourceLandscapeId, goalId)))
      ;(sourceExtractedAtomicGoalIdsByLandscapeId.get(sourceLandscapeId) ?? new Set<string>())
        .forEach((goalId) => sourceExtractedAtomicGoalIds.add(sourceGoalKey(sourceLandscapeId, goalId)))

      const extractedMembershipGoalIds = sourceExtractedGoalIdsByLandscapeId.get(sourceLandscapeId)
      const membershipGoalIds = extractedMembershipGoalIds && extractedMembershipGoalIds.size > 0
        ? extractedMembershipGoalIds
        : sourceGoalMembershipByLandscapeId.get(sourceLandscapeId)
        ?? new Set((mappingsByJurisdiction.get(jurisdiction) ?? [])
          .filter((mapping) => mapping.sourceLandscapeId === sourceLandscapeId)
          .map((mapping) => mapping.legacyGoalId)
          .filter((goalId): goalId is string => typeof goalId === 'string' && goalId.trim().length > 0))
      membershipGoalIds.forEach((goalId) => {
        const sourceOriginalGoalId = sourceGoalKey(sourceLandscapeId, goalId)
        const atomicClosure = new Set<string>()
        expandForCoverage(sourceLandscapeId, goalId).forEach((atomicGoalId) => {
          const atomicGoalKey = sourceGoalKey(sourceLandscapeId, atomicGoalId)
          sourceAtomicGoalIds.add(atomicGoalKey)
          atomicClosure.add(atomicGoalKey)
        })
        sourceOriginalGoalIds.add(sourceOriginalGoalId)
        atomicClosureBySourceOriginalGoalId.set(sourceOriginalGoalId, atomicClosure)
      })
    }

    const mappedSourceAtomicGoalIds = new Set<string>()
    for (const mapping of mappingsByJurisdiction.get(jurisdiction) ?? []) {
      if (!mapping.legacyGoalId) continue
      if (!targetIntersectsView(mapping.canonicalGoalId, viewAtomicGoalIds, canonicalAtomicDescendantsByGoalId)) {
        continue
      }
      expandForCoverage(mapping.sourceLandscapeId, mapping.legacyGoalId)
        .forEach((atomicGoalId) => mappedSourceAtomicGoalIds.add(sourceGoalKey(mapping.sourceLandscapeId, atomicGoalId)))
    }

    const mappedSourceAtomicGoalIdsInUniverse = new Set(
      Array.from(mappedSourceAtomicGoalIds).filter((goalId) => sourceAtomicGoalIds.has(goalId)),
    )
    const unmappedSourceAtomicGoals = Array.from(sourceAtomicGoalIds)
      .filter((goalId) => !mappedSourceAtomicGoalIdsInUniverse.has(goalId)).length
    const sourceUnregisteredGoals = Array.from(sourceExtractedGoalIds)
      .filter((goalId) => !sourceOriginalGoalIds.has(goalId)).length
    const sourceUnregisteredAtomicGoals = Array.from(sourceExtractedAtomicGoalIds)
      .filter((goalId) => !sourceAtomicGoalIds.has(goalId)).length
    let sourceFullyCoveredOriginalGoals = 0
    let sourcePartiallyCoveredOriginalGoals = 0
    let sourceUncoveredOriginalGoals = 0
    for (const atomicClosure of atomicClosureBySourceOriginalGoalId.values()) {
      const closureGoalIds = Array.from(atomicClosure)
      const coveredGoalIds = closureGoalIds.filter((goalId) => mappedSourceAtomicGoalIdsInUniverse.has(goalId))
      if (closureGoalIds.length > 0 && coveredGoalIds.length === closureGoalIds.length) {
        sourceFullyCoveredOriginalGoals += 1
      } else if (coveredGoalIds.length > 0) {
        sourcePartiallyCoveredOriginalGoals += 1
      } else {
        sourceUncoveredOriginalGoals += 1
      }
    }
    result.set(jurisdiction, {
      sourceAtomicGoals: sourceAtomicGoalIds.size,
      sourceMappedToViewAtomicGoals: mappedSourceAtomicGoalIdsInUniverse.size,
      unmappedSourceAtomicGoals,
      sourceExtractedGoals: sourceExtractedGoalIds.size,
      sourceUnregisteredGoals,
      sourceExtractedAtomicGoals: sourceExtractedAtomicGoalIds.size,
      sourceUnregisteredAtomicGoals,
      sourceOriginalGoals: sourceOriginalGoalIds.size,
      sourceFullyCoveredOriginalGoals,
      sourcePartiallyCoveredOriginalGoals,
      sourceUncoveredOriginalGoals,
    })
  }

  return result
}

function readJurisdictionCoverageByLandscapeId(
  applicabilityCompilation: ApplicabilityCompilationResult,
): Map<string, JurisdictionCoverage> {
  const coverageByLandscapeId = new Map<string, JurisdictionCoverage>()
  const surrogateEntriesByKey = readAcceptedSurrogateEvidenceByKey()

  applicabilityCompilation.reports.forEach((report) => {
    const rawAtomicGoals = report.goals.filter((goal) => goal.goalType === 'atomic')
    const landscape = readLandscapeForReport(report)
    const canonicalGoalById = new Map((landscape?.goals ?? []).map((goal) => [goal.id, goal]))
    const {
      canonicalViewAtomicGoalIds,
      viewAtomicGoalIdsByJurisdiction,
    } = readCompositionViewAtomicGoalIds(report)
    const reverseSourceCoverageByJurisdiction = readReverseSourceCoverageByJurisdiction(
      report,
      viewAtomicGoalIdsByJurisdiction,
    )
    const canonicalAtomicGoalIds = canonicalViewAtomicGoalIds.size > 0
      ? canonicalViewAtomicGoalIds
      : new Set(rawAtomicGoals.map((goal) => goal.goalId))
    const sourceCoverageAtomicGoalIds = new Set(
      Array.from(canonicalAtomicGoalIds).filter((goalId) =>
        isCurriculumSourceCoverageGoal(canonicalGoalById.get(goalId))),
    )
    const totalAtomicGoals = sourceCoverageAtomicGoalIds.size
    const jurisdictions = report.projections.map((projection) => {
      const projectionFindings = report.findings.filter((finding) =>
        finding.dimension === 'jurisdiction' && finding.value === projection.value)
      const diagnosticPartialOnlyWarnings = projectionFindings.filter((finding) =>
        finding.severity === 'diagnostic' && finding.code === 'APV-202').length
      const blockingWarnings = projectionFindings.filter((finding) =>
        finding.severity === 'warning').length
      const visibleGoals = report.goals.filter((goal) =>
        (goal.compiledApplicability.jurisdiction ?? []).includes(projection.value))
      const viewAtomicGoalIds = viewAtomicGoalIdsByJurisdiction.get(projection.value)
      const visibleAtomicGoalReports = (viewAtomicGoalIds && viewAtomicGoalIds.size > 0
        ? rawAtomicGoals.filter((goal) => viewAtomicGoalIds.has(goal.goalId))
        : visibleGoals.filter((goal) => goal.goalType === 'atomic' && canonicalAtomicGoalIds.has(goal.goalId)))
        .filter((goal) => sourceCoverageAtomicGoalIds.has(goal.goalId))
      const visibleAtomicGoals = visibleAtomicGoalReports.length
      const visibleClusterGoals = Math.max(0, projection.visibleGoals - visibleAtomicGoals)
      const coverageEvidence = createCoverageEvidenceChecker(
        report,
        projection.value,
        surrogateEntriesByKey,
        canonicalGoalById,
      )
      const sourceBackedAtomicGoals = visibleAtomicGoalReports.filter((goal) =>
        coverageEvidence.hasCoverageBackedJurisdictionEvidence(goal)).length
      const surrogateBackedAtomicGoals = visibleAtomicGoalReports.filter((goal) =>
        !hasDirectSourceBackedJurisdictionEvidence(goal, projection.value)
        && coverageEvidence.hasReviewedRequiresClosureSurrogateEvidence(goal)).length
      const unsupportedAssignedAtomicGoals = visibleAtomicGoalReports.filter((goal) =>
        !coverageEvidence.hasCoverageBackedJurisdictionEvidence(goal)).length
      const partialSourceLinkedAtomicGoals = visibleAtomicGoalReports.filter((goal) =>
        !coverageEvidence.hasCoverageBackedJurisdictionEvidence(goal)
        && isPartialSourceLinkedJurisdictionEvidence(goal.evidence, projection.value)).length
      const reverseSourceCoverage = reverseSourceCoverageByJurisdiction.get(projection.value) ?? {
        sourceAtomicGoals: 0,
        sourceMappedToViewAtomicGoals: 0,
        unmappedSourceAtomicGoals: 0,
        sourceExtractedGoals: 0,
        sourceUnregisteredGoals: 0,
        sourceExtractedAtomicGoals: 0,
        sourceUnregisteredAtomicGoals: 0,
        sourceOriginalGoals: 0,
        sourceFullyCoveredOriginalGoals: 0,
        sourcePartiallyCoveredOriginalGoals: 0,
        sourceUncoveredOriginalGoals: 0,
      }
      const labels = JURISDICTION_LABELS[projection.value]
      const hasSourceBackedAtomicCoverage = sourceBackedAtomicGoals > 0
      const hasFullSourceBackedAtomicCoverage = visibleAtomicGoals > 0 && sourceBackedAtomicGoals === visibleAtomicGoals
      const hasFullReverseSourceCoverage = reverseSourceCoverage.sourceAtomicGoals === 0
        || reverseSourceCoverage.unmappedSourceAtomicGoals === 0
      const hasFullSourceRegistration = reverseSourceCoverage.sourceExtractedGoals === 0
        ? reverseSourceCoverage.sourceOriginalGoals === 0
        : reverseSourceCoverage.sourceUnregisteredGoals === 0
          && reverseSourceCoverage.sourceUnregisteredAtomicGoals === 0
      const status: JurisdictionCoverageStatus = projection.errors > 0
        || unsupportedAssignedAtomicGoals > 0
        || reverseSourceCoverage.unmappedSourceAtomicGoals > 0
        || reverseSourceCoverage.sourceUnregisteredGoals > 0
        || reverseSourceCoverage.sourceUnregisteredAtomicGoals > 0
        || (reverseSourceCoverage.sourceOriginalGoals > 0 && reverseSourceCoverage.sourceExtractedGoals === 0)
        ? 'error'
        : !hasSourceBackedAtomicCoverage
          ? 'none'
          : !hasFullSourceBackedAtomicCoverage
              || !hasFullReverseSourceCoverage
              || !hasFullSourceRegistration
              || blockingWarnings > 0
            ? 'partial'
            : 'covered'

      return {
        jurisdiction: projection.value,
        labelDe: labels.de,
        labelEn: labels.en,
        visibleGoals: projection.visibleGoals,
        visibleAtomicGoals,
        visibleClusterGoals,
        viewAtomicGoals: visibleAtomicGoals,
        sourceBackedAtomicGoals,
        surrogateBackedAtomicGoals,
        unsupportedAssignedAtomicGoals,
        partialSourceLinkedAtomicGoals,
        sourceAtomicGoals: reverseSourceCoverage.sourceAtomicGoals,
        sourceMappedToViewAtomicGoals: reverseSourceCoverage.sourceMappedToViewAtomicGoals,
        unmappedSourceAtomicGoals: reverseSourceCoverage.unmappedSourceAtomicGoals,
        sourceExtractedGoals: reverseSourceCoverage.sourceExtractedGoals,
        sourceUnregisteredGoals: reverseSourceCoverage.sourceUnregisteredGoals,
        sourceExtractedAtomicGoals: reverseSourceCoverage.sourceExtractedAtomicGoals,
        sourceUnregisteredAtomicGoals: reverseSourceCoverage.sourceUnregisteredAtomicGoals,
        sourceOriginalGoals: reverseSourceCoverage.sourceOriginalGoals,
        sourceFullyCoveredOriginalGoals: reverseSourceCoverage.sourceFullyCoveredOriginalGoals,
        sourcePartiallyCoveredOriginalGoals: reverseSourceCoverage.sourcePartiallyCoveredOriginalGoals,
        sourceUncoveredOriginalGoals: reverseSourceCoverage.sourceUncoveredOriginalGoals,
        errors: projection.errors,
        warnings: blockingWarnings,
        diagnosticPartialOnlyWarnings,
        atomicCoveragePercent: roundPercent(visibleAtomicGoals, totalAtomicGoals),
        sourceBackedCoveragePercent: roundPercent(sourceBackedAtomicGoals, visibleAtomicGoals),
        sourceReverseCoveragePercent: roundPercent(
          reverseSourceCoverage.sourceMappedToViewAtomicGoals,
          reverseSourceCoverage.sourceAtomicGoals,
        ),
        status,
      } satisfies JurisdictionCoverageEntry
    })

    const maxVisibleAtomicGoals = Math.max(0, ...jurisdictions.map((entry) => entry.visibleAtomicGoals))
    const maxSourceBackedAtomicGoals = Math.max(0, ...jurisdictions.map((entry) => entry.sourceBackedAtomicGoals))
    const maxAtomicCoveragePercent = Math.max(0, ...jurisdictions.map((entry) => entry.atomicCoveragePercent))
    const maxSourceBackedCoveragePercent = Math.max(
      0,
      ...jurisdictions.map((entry) => entry.sourceBackedCoveragePercent),
    )
    const sourceCompleteJurisdictions = jurisdictions.filter((entry) =>
      entry.visibleAtomicGoals > 0
        && entry.sourceBackedAtomicGoals === entry.visibleAtomicGoals
        && entry.unsupportedAssignedAtomicGoals === 0
        && entry.unmappedSourceAtomicGoals === 0
        && entry.sourceUnregisteredGoals === 0
        && entry.sourceUnregisteredAtomicGoals === 0
        && !(entry.sourceOriginalGoals > 0 && entry.sourceExtractedGoals === 0)
        && entry.errors === 0).length
    coverageByLandscapeId.set(report.landscapeId, {
      dimension: 'jurisdiction',
      totalJurisdictions: jurisdictions.length,
      totalAtomicGoals,
      rawAtomicGoals: rawAtomicGoals.length,
      coveredJurisdictions: jurisdictions.filter((entry) => entry.visibleAtomicGoals > 0).length,
      sourceBackedJurisdictions: jurisdictions.filter((entry) => entry.sourceBackedAtomicGoals > 0).length,
      sourceCompleteJurisdictions,
      cleanJurisdictions: jurisdictions.filter((entry) => entry.status === 'covered').length,
      partialJurisdictions: jurisdictions.filter((entry) => entry.status === 'partial').length,
      errorJurisdictions: jurisdictions.filter((entry) => entry.status === 'error').length,
      maxVisibleAtomicGoals,
      maxSourceBackedAtomicGoals,
      maxAtomicCoveragePercent,
      maxSourceBackedCoveragePercent,
      unsupportedAssignedAtomicGoals: jurisdictions.reduce(
        (sum, entry) => sum + entry.unsupportedAssignedAtomicGoals,
        0,
      ),
      surrogateBackedAtomicGoals: jurisdictions.reduce(
        (sum, entry) => sum + entry.surrogateBackedAtomicGoals,
        0,
      ),
      partialSourceLinkedAtomicGoals: jurisdictions.reduce(
        (sum, entry) => sum + entry.partialSourceLinkedAtomicGoals,
        0,
      ),
      sourceAtomicGoals: jurisdictions.reduce((sum, entry) => sum + entry.sourceAtomicGoals, 0),
      sourceMappedToViewAtomicGoals: jurisdictions.reduce(
        (sum, entry) => sum + entry.sourceMappedToViewAtomicGoals,
        0,
      ),
      unmappedSourceAtomicGoals: jurisdictions.reduce((sum, entry) => sum + entry.unmappedSourceAtomicGoals, 0),
      sourceExtractedGoals: jurisdictions.reduce((sum, entry) => sum + entry.sourceExtractedGoals, 0),
      sourceUnregisteredGoals: jurisdictions.reduce((sum, entry) => sum + entry.sourceUnregisteredGoals, 0),
      sourceExtractedAtomicGoals: jurisdictions.reduce((sum, entry) => sum + entry.sourceExtractedAtomicGoals, 0),
      sourceUnregisteredAtomicGoals: jurisdictions.reduce((sum, entry) => sum + entry.sourceUnregisteredAtomicGoals, 0),
      sourceOriginalGoals: jurisdictions.reduce((sum, entry) => sum + entry.sourceOriginalGoals, 0),
      sourceFullyCoveredOriginalGoals: jurisdictions.reduce(
        (sum, entry) => sum + entry.sourceFullyCoveredOriginalGoals,
        0,
      ),
      sourcePartiallyCoveredOriginalGoals: jurisdictions.reduce(
        (sum, entry) => sum + entry.sourcePartiallyCoveredOriginalGoals,
        0,
      ),
      sourceUncoveredOriginalGoals: jurisdictions.reduce((sum, entry) => sum + entry.sourceUncoveredOriginalGoals, 0),
      jurisdictions,
    })
  })

  return coverageByLandscapeId
}

function evaluateCompositionViews(count: number): RuleResult {
  return makeRule(
    'CQR-401',
    count > 0 ? 'pass' : 'not_configured',
    count > 0 ? `${count} composition view(s) are registered.` : 'No composition view is registered for this curriculum.',
    { compositionViews: count },
  )
}

function evaluateApplicabilityWarnings(
  metrics: Record<string, number> | undefined,
): RuleResult {
  const activeWarnings = metrics?.activeWarnings ?? 0
  const rawActiveWarnings = activeWarnings
  const diagnosticPartialOnlyWarnings = metrics?.diagnosticCode_APV_202 ?? 0
  const acceptedWarnings = metrics?.acceptedWarnings ?? 0
  const obsoleteAcceptedWarnings = metrics?.obsoleteAcceptedWarnings ?? 0
  const unresolvedWarnings = activeWarnings + obsoleteAcceptedWarnings
  const topMetricDetails = (
    prefix: string,
    label: string,
    limit: number,
    excludedKeys: string[] = [],
  ): string[] => Object.entries(metrics ?? {})
    .filter(([key]) => key.startsWith(prefix))
    .filter(([key]) => !excludedKeys.includes(key.slice(prefix.length)))
    .sort(([, left], [, right]) => right - left)
    .slice(0, limit)
    .map(([key, count]) => `${label} ${metricLabel(key.slice(prefix.length))}: ${count}`)

  const details = [
    ...(diagnosticPartialOnlyWarnings > 0
      ? [`non-blocking partial-only applicability diagnostics APV-202: ${diagnosticPartialOnlyWarnings}`]
      : []),
    ...topMetricDetails(
      'activeCode_',
      'active warning type',
      5,
    ),
    ...topMetricDetails(
      'activeJurisdiction_',
      'active warning jurisdiction',
      10,
    ),
    ...topMetricDetails('diagnosticCode_', 'diagnostic finding type', 3),
    ...topMetricDetails('acceptedCode_', 'accepted current warning type', 3),
    ...topMetricDetails('obsoleteCode_', 'obsolete accepted warning type', 3),
  ]

  return makeRule(
    'CQR-501',
    unresolvedWarnings === 0 ? 'pass' : 'warn',
    unresolvedWarnings === 0
      ? acceptedWarnings > 0
        ? `${acceptedWarnings} accepted applicability warning(s) are current and no active applicability warning debt is visible.`
        : 'No active applicability warning debt is visible.'
      : `${activeWarnings} active and ${obsoleteAcceptedWarnings} obsolete accepted applicability warning(s) need review${diagnosticPartialOnlyWarnings > 0 ? `; ${diagnosticPartialOnlyWarnings} partial-only diagnostic finding(s) are non-blocking` : ''}.`,
    {
      activeWarnings,
      rawActiveWarnings,
      diagnosticPartialOnlyWarnings,
      acceptedWarnings,
      obsoleteAcceptedWarnings,
    },
    details,
  )
}

function sourceOriginalUrlIssues(mappingPipeline: MappingPipelineStatus | undefined): string[] {
  if (!mappingPipeline) return []

  return mappingPipeline.sources
    .filter((source) => source.sourceKind === 'source-extraction')
    .flatMap((source) => {
      const documents = source.sourceDocuments ?? []
      if (documents.length === 0) {
        return [`${source.jurisdiction} ${source.title}: no structured original source document metadata is present`]
      }
      return documents
        .filter((document) => !document.hasUsableUrl)
        .map((document) =>
          `${source.jurisdiction} ${source.title}: original source document "${document.title}" has no usable official HTTP(S) URL`)
    })
}

function evaluateSourceSnapshotIngestion(
  coverage: JurisdictionCoverage | undefined,
  mappingPipeline: MappingPipelineStatus | undefined,
): RuleResult {
  if (!coverage) {
    return makeRule('CQR-000', 'not_configured', 'No source-ingestion projection is available for this curriculum.')
  }

  const urlIssues = sourceOriginalUrlIssues(mappingPipeline)
  const missingSourceInventories = coverage.jurisdictions.filter((entry) =>
    entry.sourceOriginalGoals > 0 && entry.sourceExtractedGoals === 0)
  const unregistered = coverage.jurisdictions.filter((entry) =>
    entry.sourceUnregisteredGoals > 0 || entry.sourceUnregisteredAtomicGoals > 0)
  const empty = coverage.jurisdictions.filter((entry) =>
    entry.sourceOriginalGoals === 0 && entry.sourceExtractedGoals === 0 && entry.sourceAtomicGoals === 0)
  const completeJurisdictions = coverage.jurisdictions.filter((entry) =>
    entry.sourceExtractedGoals > 0
      && entry.sourceUnregisteredGoals === 0
      && entry.sourceUnregisteredAtomicGoals === 0).length
  const status: RuleStatus = missingSourceInventories.length > 0 || unregistered.length > 0 || urlIssues.length > 0
    ? 'fail'
    : completeJurisdictions < coverage.totalJurisdictions
      ? 'warn'
      : 'pass'

  return makeRule(
    'CQR-000',
    status,
    status === 'pass'
      ? `All ${coverage.totalJurisdictions} declared Bundesland source inventories are readable, linked to official source URLs, and fully registered.`
      : `${completeJurisdictions}/${coverage.totalJurisdictions} declared Bundesland source inventories are readable and fully registered; ${urlIssues.length} original source URL issue(s).`,
    {
      totalJurisdictions: coverage.totalJurisdictions,
      completeSourceJurisdictions: completeJurisdictions,
      emptySourceJurisdictions: empty.length,
      missingReadableSourceInventoryJurisdictions: missingSourceInventories.length,
      originalSourceUrlIssues: urlIssues.length,
      sourceExtractedGoals: coverage.sourceExtractedGoals,
      sourceOriginalGoals: coverage.sourceOriginalGoals,
      sourceUnregisteredGoals: coverage.sourceUnregisteredGoals,
      sourceExtractedAtomicGoals: coverage.sourceExtractedAtomicGoals,
      sourceUnregisteredAtomicGoals: coverage.sourceUnregisteredAtomicGoals,
    },
    [
      ...missingSourceInventories.map((entry) =>
        `${entry.jurisdiction}: ${entry.sourceOriginalGoals} source original goal(s) are registered, but no readable source inventory goals were extracted`),
      ...unregistered.map((entry) =>
        `${entry.jurisdiction}: ${entry.sourceUnregisteredGoals} extracted source goal(s) and ${entry.sourceUnregisteredAtomicGoals} extracted source atom(s) are not registered in membership/closure`),
      ...empty.map((entry) => `${entry.jurisdiction}: no source inventory goals are registered or extracted`),
      ...urlIssues,
    ],
  )
}

function evaluateJurisdictionCoverage(coverage: JurisdictionCoverage | undefined): RuleResult {
  if (!coverage) {
    return makeRule('CQR-003', 'not_configured', 'No Bundesland coverage projection is available for this curriculum.')
  }

  const uncovered = coverage.jurisdictions.filter((entry) => entry.sourceBackedAtomicGoals === 0)
  const incomplete = coverage.jurisdictions.filter((entry) => entry.sourceBackedAtomicGoals < entry.visibleAtomicGoals)
  const unsupported = coverage.jurisdictions.filter((entry) => entry.unsupportedAssignedAtomicGoals > 0)
  const sourceUnmapped = coverage.jurisdictions.filter((entry) => entry.unmappedSourceAtomicGoals > 0)
  const warninged = coverage.jurisdictions.filter((entry) => entry.warnings > 0)
  const errored = coverage.jurisdictions.filter((entry) => entry.errors > 0)
  const minSourceBackedAtomicGoals = coverage.jurisdictions.length > 0
    ? Math.min(...coverage.jurisdictions.map((entry) => entry.sourceBackedAtomicGoals))
    : 0
  const fullCoverageJurisdictions = coverage.sourceCompleteJurisdictions
  const status: RuleStatus = errored.length > 0
    || unsupported.length > 0
    || sourceUnmapped.length > 0
    ? 'fail'
    : fullCoverageJurisdictions < coverage.totalJurisdictions
      ? 'warn'
      : 'pass'

  return makeRule(
    'CQR-003',
    status,
    status === 'pass'
      ? `All ${coverage.totalJurisdictions} declared Bundesland projection(s) have source-backed atom-level view coverage, no unsupported assignments, and complete source-to-view mapping.`
      : `${fullCoverageJurisdictions}/${coverage.totalJurisdictions} declared Bundesland projection(s) have source-backed atom-level view coverage, no unsupported assignments, and complete source-to-view mapping.`,
    {
      totalJurisdictions: coverage.totalJurisdictions,
      coveredJurisdictions: coverage.coveredJurisdictions,
      sourceBackedJurisdictions: coverage.sourceBackedJurisdictions,
      sourceCompleteJurisdictions: coverage.sourceCompleteJurisdictions,
      fullCoverageJurisdictions,
      uncoveredJurisdictions: uncovered.length,
      incompleteJurisdictions: incomplete.length,
      unsupportedAssignmentJurisdictions: unsupported.length,
      sourceUnmappedJurisdictions: sourceUnmapped.length,
      unsupportedAssignedAtomicGoals: coverage.unsupportedAssignedAtomicGoals,
      unmappedSourceAtomicGoals: coverage.unmappedSourceAtomicGoals,
      sourceAtomicGoals: coverage.sourceAtomicGoals,
      sourceMappedToViewAtomicGoals: coverage.sourceMappedToViewAtomicGoals,
      sourceOriginalGoals: coverage.sourceOriginalGoals,
      sourceFullyCoveredOriginalGoals: coverage.sourceFullyCoveredOriginalGoals,
      sourcePartiallyCoveredOriginalGoals: coverage.sourcePartiallyCoveredOriginalGoals,
      sourceUncoveredOriginalGoals: coverage.sourceUncoveredOriginalGoals,
      surrogateBackedAtomicGoals: coverage.surrogateBackedAtomicGoals,
      partialSourceLinkedAtomicGoals: coverage.partialSourceLinkedAtomicGoals,
      warningedJurisdictions: warninged.length,
      cleanJurisdictions: coverage.cleanJurisdictions,
      partialJurisdictions: coverage.partialJurisdictions,
      errorJurisdictions: coverage.errorJurisdictions,
      minSourceBackedAtomicGoals,
      maxVisibleAtomicGoals: coverage.maxVisibleAtomicGoals,
      maxSourceBackedAtomicGoals: coverage.maxSourceBackedAtomicGoals,
      totalAtomicGoals: coverage.totalAtomicGoals,
    },
    [
      ...errored.map((entry) => `${entry.jurisdiction}: ${entry.errors} projection error(s), ${entry.sourceBackedAtomicGoals}/${entry.visibleAtomicGoals} source-backed view atomic goal(s)`),
      ...unsupported.map((entry) => `${entry.jurisdiction}: ${entry.unsupportedAssignedAtomicGoals} assigned atomic goal(s) without source-backed Lehrplan evidence`),
      ...sourceUnmapped.map((entry) => `${entry.jurisdiction}: ${entry.unmappedSourceAtomicGoals} source Lehrplan atom(s) do not map into the Bundesland view`),
      ...incomplete.map((entry) => `${entry.jurisdiction}: ${entry.sourceBackedAtomicGoals}/${entry.visibleAtomicGoals} source-backed view atomic goal(s)`),
      ...uncovered.map((entry) => `${entry.jurisdiction}: no source-backed atomic goals`),
    ],
  )
}

function evaluateSourceGoalCountPlausibility(pipeline: MappingPipelineStatus | undefined): RuleResult {
  if (!pipeline) {
    return makeRule(
      'CQR-005',
      'not_configured',
      'No source-extraction pipeline status is available for source-goal count plausibility.',
    )
  }

  const peerBaselineFailures: string[] = []
  const granularityFailures: string[] = []
  let peerBaselineChecks = 0
  let granularityChecks = 0
  const sourceExtractionSources = pipeline.sources.filter((source) => source.sourceKind === 'source-extraction')

  sourceExtractionSources.forEach((source) => {
    source.steps.forEach((step) => {
      step.checks.forEach((check) => {
        if (check.id === 'source-goal-count-peer-baseline') {
          peerBaselineChecks += 1
          if (!check.passed) {
            peerBaselineFailures.push(`${source.jurisdiction}: ${source.title} - ${check.details}`)
          }
        }
        if (check.id === 'source-goal-granularity-peer-audit') {
          granularityChecks += 1
          if (!check.passed) {
            granularityFailures.push(`${source.jurisdiction}: ${source.title} - ${check.details}`)
          }
        }
      })
    })
  })

  const failures = [...peerBaselineFailures, ...granularityFailures]
  const status: RuleStatus = failures.length > 0 ? 'warn' : 'pass'

  return makeRule(
    'CQR-005',
    status,
    status === 'pass'
      ? 'Source-goal counts are inside the configured peer-baseline corridor or explicitly reviewed.'
      : `${failures.length} source-goal count plausibility issue(s) need review before this curriculum can be treated as mature.`,
    {
      sourceExtractionSources: sourceExtractionSources.length,
      peerBaselineChecks,
      failedPeerBaselineChecks: peerBaselineFailures.length,
      granularityChecks,
      failedGranularityChecks: granularityFailures.length,
    },
    failures,
  )
}

function deriveScopeMaturity(rules: RuleResult[]): MaturityLevel {
  if (rules.find((rule) => rule.id === 'CQR-101')?.status !== 'pass') return 'M0'
  if (rules.find((rule) => rule.id === 'CQR-102')?.status !== 'pass') return 'M1'
  if (rules.find((rule) => rule.id === 'CQR-103')?.status !== 'pass') return 'M1'
  const routeEndpointVisibility = rules.find((rule) => rule.id === 'CQR-104')
  if (routeEndpointVisibility && routeEndpointVisibility.status !== 'pass') return 'M2'
  if (rules.find((rule) => rule.id === 'CQR-201')?.status !== 'pass') return 'M2'
  if (rules.find((rule) => rule.id === 'CQR-202')?.status !== 'pass') return 'M2'
  if (rules.find((rule) => rule.id === 'CQR-203')?.status !== 'pass') return 'M3'
  return 'M4'
}

function deriveCurriculumMaturity(curriculumRules: RuleResult[], scopes: ScopeStatus[]): MaturityLevel {
  const graphReady = curriculumRules.find((rule) => rule.id === 'CQR-001')?.status === 'pass'
    && curriculumRules.find((rule) => rule.id === 'CQR-002')?.status === 'pass'
  if (!graphReady) return 'M0'
  if (curriculumRules.find((rule) => rule.id === 'CQR-000')?.status !== 'pass') return 'M0'
  if (curriculumRules.find((rule) => rule.id === 'CQR-003')?.status !== 'pass') return 'M1'
  if (curriculumRules.find((rule) => rule.id === 'CQR-004')?.status === 'fail') return 'M1'
  if (curriculumRules.find((rule) => rule.id === 'CQR-005')?.status === 'warn') return 'M1'

  const routeScopes = scopes.filter((scope) => scope.rules.some((rule) => rule.id === 'CQR-101'))
  if (routeScopes.length === 0) return 'M2'
  if (!routeScopes.every((scope) => scope.rules.find((rule) => rule.id === 'CQR-101')?.status === 'pass')) return 'M2'
  if (!routeScopes.every((scope) => scope.maturity === 'M2' || scope.maturity === 'M3' || scope.maturity === 'M4')) return 'M2'
  if (!routeScopes.every((scope) => scope.maturity === 'M3' || scope.maturity === 'M4')) return 'M3'
  if (!routeScopes.every((scope) => scope.maturity === 'M4')) return 'M4'

  const m5Ready = curriculumRules.find((rule) => rule.id === 'CQR-301')?.status === 'pass'
    && curriculumRules.find((rule) => rule.id === 'CQR-401')?.status === 'pass'
    && curriculumRules.find((rule) => rule.id === 'CQR-501')?.status === 'pass'
  if (!m5Ready) return 'M4'

  if (curriculumRules.find((rule) => rule.id === 'CQR-302')?.status !== 'pass') return 'M5'
  return curriculumRules.find((rule) => rule.id === 'CQR-303')?.status === 'pass' ? 'M7' : 'M6'
}

function pushGeneratedMarkdownNotice(lines: string[]): void {
  lines.push('> Generated artifact. Do not edit manually.')
  lines.push('>')
  lines.push('> Generated by: `app/scripts/generateCurriculumQualityStatus.ts`')
  lines.push('> Regenerate with: `cd app && npm run quality:curriculum-status`')
  lines.push('> Source of truth: `app/scripts/generateCurriculumQualityStatus.ts`')
  lines.push('> Source of truth: `curricula/`')
  lines.push('')
}

function renderMarkdown(status: StatusDocument): string {
  const lines: string[] = []
  const sourceEvidenceLabel = (source: MappingPipelineSourceStatus): string => {
    if (source.sourceKind === 'source-extraction') {
      const documents = source.sourceDocuments ?? []
      const available = documents.filter((document) => document.available).length
      const linked = documents.filter((document) => document.hasUsableUrl).length
      return documents.length > 0
        ? `${linked}/${documents.length} URL; local cache ${available}/${documents.length}`
        : '0 original source(s)'
    }
    if (source.sourceKind === 'legacy-snapshot') return 'Snapshot diagnostic'
    return 'No extraction'
  }
  const sourceExtractionProgress = (pipeline?: MappingPipelineStatus): string => {
    if (!pipeline) return '-'
    const sourceExtractionSources = pipeline.sources.filter((source) => source.sourceKind === 'source-extraction')
    const ready = sourceExtractionSources.filter((source) =>
      source.steps.some((step) => step.id === 'MAPPING-1' && step.status === 'complete')).length
    return `${ready}/${pipeline.totalSources}`
  }

  lines.push('# Curriculum Quality Status')
  lines.push('')
  pushGeneratedMarkdownNotice(lines)
  lines.push(`Generated: ${status.generatedAt}`)
  lines.push(`Rules version: ${status.rulesVersion}`)
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push('| Metric | Value |')
  lines.push('| --- | ---: |')
  lines.push(`| Curricula | ${status.summary.curricula} |`)
  Object.entries(status.summary.maturity).forEach(([level, count]) => {
    lines.push(`| ${level} | ${count} |`)
  })
  lines.push('')
  lines.push('## Curricula')
  lines.push('')
  lines.push('| Curriculum | Maturity | Goals | Atomic | Passage extraction | Bundeslaender | QA scopes | Warn | Fail |')
  lines.push('| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |')
  status.curricula.forEach((curriculum) => {
    const allRules = [...curriculum.rules, ...curriculum.scopes.flatMap((scope) => scope.rules)]
    const warnCount = allRules.filter((rule) => rule.status === 'warn').length
    const failCount = allRules.filter((rule) => rule.status === 'fail').length
    const jurisdictionCoverage = curriculum.jurisdictionCoverage
      ? `${curriculum.jurisdictionCoverage.sourceCompleteJurisdictions}/${curriculum.jurisdictionCoverage.totalJurisdictions}`
      : '-'
    const pipeline = sourceExtractionProgress(curriculum.mappingPipeline)
    lines.push(`| ${curriculum.title} | ${curriculum.maturity} | ${curriculum.goals} | ${curriculum.atomicGoals} | ${pipeline} | ${jurisdictionCoverage} | ${curriculum.scopes.length} | ${warnCount} | ${failCount} |`)
  })
  lines.push('')
  lines.push('## Mapping Pipeline')
  lines.push('')
  lines.push('| Curriculum | Source | Jurisdiction | Original sources | Complete | Current step | Passages | Source goals | Exact | Partial | Exact share | Duration projection | Evidence note |')
  lines.push('| --- | --- | --- | --- | ---: | --- | ---: | ---: | ---: | ---: | ---: | --- | --- |')
  status.curricula.forEach((curriculum) => {
    curriculum.mappingPipeline?.sources.forEach((source) => {
      const evidenceNote = source.sourceKind === 'legacy-snapshot' ? 'not pipeline-capable: no passage extraction' : ''
      const durationProjection = source.durationProjectionAudit
        ? `${source.durationProjectionAudit.coveredEvidenceLinks}/${source.durationProjectionAudit.evidenceLinks}; diff ${source.durationProjectionAudit.canonicalGoalsWithDifferentG8G9Evidence ?? 0}; open ${source.durationProjectionAudit.uncoveredEvidenceLinks}`
        : '-'
      const mappedSourceGoals = source.mappedSourceGoals ?? Math.max(0, source.sourceGoals - (source.unmappedSourceGoals ?? 0))
      const exactShare = mappedSourceGoals > 0
        ? Math.round(((source.exactMappings ?? 0) / mappedSourceGoals) * 100)
        : 0
      lines.push(`| ${curriculum.title} | ${source.title} | ${source.jurisdiction || '-'} | ${sourceEvidenceLabel(source)} | ${source.completedSteps}/${source.totalSteps} | ${source.currentStep || '-'} | ${source.passages} | ${source.sourceGoals} | ${source.exactMappings ?? 0} | ${source.partialMappings ?? 0} | ${exactShare}% | ${durationProjection} | ${evidenceNote} |`)
    })
  })
  lines.push('')
  lines.push('## Bundesland Coverage')
  lines.push('')
  lines.push('| Curriculum | Complete | DE source-view atoms | Raw atoms | Source-backed states | Extracted source goals | Registered source originals | Fully covered originals | Unregistered source goals | Extracted source atoms | Unregistered source atoms | Unsupported assignments | Unmapped source atoms | Partial | Error | Max source-backed view coverage |')
  lines.push('| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |')
  status.curricula.forEach((curriculum) => {
    const coverage = curriculum.jurisdictionCoverage
    if (!coverage) return
    lines.push(`| ${curriculum.title} | ${coverage.sourceCompleteJurisdictions}/${coverage.totalJurisdictions} | ${coverage.totalAtomicGoals} | ${coverage.rawAtomicGoals} | ${coverage.sourceBackedJurisdictions} | ${coverage.sourceExtractedGoals} | ${coverage.sourceOriginalGoals} | ${coverage.sourceFullyCoveredOriginalGoals} | ${coverage.sourceUnregisteredGoals} | ${coverage.sourceExtractedAtomicGoals} | ${coverage.sourceUnregisteredAtomicGoals} | ${coverage.unsupportedAssignedAtomicGoals} | ${coverage.unmappedSourceAtomicGoals} | ${coverage.partialJurisdictions} | ${coverage.errorJurisdictions} | ${coverage.maxSourceBackedAtomicGoals} (${coverage.maxSourceBackedCoveragePercent}%) |`)
  })
  lines.push('')
  lines.push('## Rule Catalog')
  lines.push('')
  lines.push('| Rule | Target | Category | Description |')
  lines.push('| --- | --- | --- | --- |')
  status.ruleCatalog.forEach((rule) => {
    lines.push(`| ${rule.id} | ${rule.maturityTarget} | ${rule.category} | ${rule.description} |`)
  })
  lines.push('')
  return `${lines.join('\n')}\n`
}

function main() {
  const shouldCheck = process.argv.includes('--check')
  const applicabilityCompilation = buildApplicabilityCompilation()
  const semanticConfigsByLandscapeId = readSemanticConfigs()
  const memoryCardReviewConfigsByLandscapeId = readMemoryCardReviewConfigs()
  const goalVisualizationQaLedgersBySubject = readGoalVisualizationQaLedgers()
  const compositionViewCountsByLandscapeId = readCompositionViewCountsByLandscapeId()
  const applicabilityWarningMetricsByLandscapeId = readApplicabilityWarningMetricsByLandscapeId(applicabilityCompilation)
  const jurisdictionCoverageByLandscapeId = readJurisdictionCoverageByLandscapeId(applicabilityCompilation)
  const mappingPipelineByLandscapeId = readMappingPipelineByLandscapeId()

  const canonicalFiles = collectFiles(canonicalRoot, (fileName) => /\.json$/i.test(fileName) && !/_deck/i.test(fileName))
  const loadedLandscapes = canonicalFiles.map((file) => ({
    file,
    landscape: loadJson<SkillLandscape>(file),
  }))
  const globalGoalIds = new Set(loadedLandscapes.flatMap(({ landscape }) => landscape.goals.map((goal) => goal.id)))

  const curricula = loadedLandscapes
    .map(({ file, landscape }) => {
      const atomicGoals = landscape.goals.filter(isAtomicGoal).length
      const jurisdictionCoverage = jurisdictionCoverageByLandscapeId.get(landscape.landscapeId)
      const mappingPipeline = mappingPipelineByLandscapeId.get(landscape.landscapeId)
      const memoryCardReviewConfigs = memoryCardReviewConfigsByLandscapeId.get(landscape.landscapeId) ?? []
      const curriculumRules: RuleResult[] = [
        evaluateGraphIntegrity(landscape, globalGoalIds),
        evaluateTypeConsistency(landscape),
        evaluateSourceSnapshotIngestion(jurisdictionCoverage, mappingPipeline),
        evaluateJurisdictionCoverage(jurisdictionCoverage),
        evaluateCourseLevelMappingConsistency(landscape),
        evaluateSourceGoalCountPlausibility(mappingPipeline),
        evaluateSemanticAtomicity(landscape, semanticConfigsByLandscapeId.get(landscape.landscapeId) ?? []),
      ]
      curriculumRules.push(
        evaluateMemoryCardReview(landscape, memoryCardReviewConfigs),
        evaluateGoalVisualizationQa(landscape, goalVisualizationQaLedgersBySubject),
        evaluateCompositionViews(compositionViewCountsByLandscapeId.get(landscape.landscapeId) ?? 0),
        evaluateApplicabilityWarnings(applicabilityWarningMetricsByLandscapeId.get(landscape.landscapeId)),
      )
      const scopedProfiles = routeProfiles.filter((profile) => profile.landscapeId === landscape.landscapeId)
      const scopes = scopedProfiles.map((profile) => evaluateRouteProfile(
        landscape,
        profile,
        applicabilityCompilation,
      ))
      if (scopes.length === 0) {
        curriculumRules.push(makeRule(
          'CQR-101',
          'not_configured',
          'No explicit route-coverage profile is registered for this curriculum.',
        ))
      }

      return {
        landscapeId: landscape.landscapeId,
        title: landscape.title,
        subject: landscape.subject,
        frameworkId: landscape.frameworkId,
        path: toRepoPath(file),
        maturity: deriveCurriculumMaturity(curriculumRules, scopes),
        goals: landscape.goals.length,
        atomicGoals,
        clusterGoals: landscape.goals.length - atomicGoals,
        jurisdictionCoverage: jurisdictionCoverageByLandscapeId.get(landscape.landscapeId),
        mappingPipeline,
        scopes,
        rules: curriculumRules,
      } satisfies CurriculumStatus
    })
    .sort((left, right) => left.title.localeCompare(right.title, 'de', { sensitivity: 'base' }))

  const allRules = curricula.flatMap((curriculum) => [
    ...curriculum.rules,
    ...curriculum.scopes.flatMap((scope) => scope.rules),
  ])
  const maturity: Record<MaturityLevel, number> = { M0: 0, M1: 0, M2: 0, M3: 0, M4: 0, M5: 0, M6: 0, M7: 0 }
  curricula.forEach((curriculum) => {
    maturity[curriculum.maturity] += 1
  })
  const ruleStatus: Record<RuleStatus, number> = { pass: 0, warn: 0, fail: 0, not_configured: 0 }
  allRules.forEach((rule) => {
    ruleStatus[rule.status] += 1
  })

  const statusDraft: StatusDocument = {
    schemaVersion: 1,
    rulesVersion: 'curriculum-quality-v4',
    generatedAt: new Date().toISOString(),
    generatedBy: 'app/scripts/generateCurriculumQualityStatus.ts',
    sources: {
      canonicalRoot: toRepoPath(canonicalRoot),
      sourceExtractionRoot: toRepoPath(sourceExtractionRoot),
      semanticAtomicityRoot: toRepoPath(semanticAtomicityRoot),
      memoryCardReviewRoot: toRepoPath(memoryCardReviewRoot),
      goalVisualizationQaRoot: toRepoPath(goalVisualizationQaRoot),
      compositionViewRoot: toRepoPath(compositionViewRoot),
      acceptedWarningsPath: toRepoPath(acceptedWarningsPath),
      sourceLandscapeRegistryPath: toRepoPath(sourceLandscapeRegistryPath),
      sourceGoalMembershipRegistryPath: toRepoPath(sourceGoalMembershipRegistryPath),
      sourceGoalClosureRegistryPath: toRepoPath(sourceGoalClosureRegistryPath),
      surrogateEvidencePath: toRepoPath(surrogateEvidencePath),
    },
    summary: {
      curricula: curricula.length,
      maturity,
      ruleStatus,
    },
    ruleCatalog,
    curricula,
  }
  const status: StatusDocument = {
    ...statusDraft,
    generatedAt: reusableGeneratedAt(statusDraft) ?? statusDraft.generatedAt,
  }

  const jsonOutput = `${JSON.stringify(status, null, 2)}\n`
  const markdownOutput = renderMarkdown(status)
  if (shouldCheck) {
    const stale = [
      [statusJsonPath, jsonOutput],
      [statusMarkdownPath, markdownOutput],
    ].filter(([file, expected]) => !existsSync(file) || readFileSync(file, 'utf8') !== expected)
    if (stale.length > 0) {
      stale.forEach(([file]) => console.error(`${toRepoPath(file)} is stale. Run: npm run quality:curriculum-status`))
      process.exitCode = 1
      return
    }
    console.log('Curriculum quality status is up to date.')
    return
  }

  mkdirSync(statusDir, { recursive: true })
  writeFileSync(statusJsonPath, jsonOutput, 'utf8')
  writeFileSync(statusMarkdownPath, markdownOutput, 'utf8')
  console.log(`Wrote ${toRepoPath(statusJsonPath)}`)
  console.log(`Wrote ${toRepoPath(statusMarkdownPath)}`)
}

main()
