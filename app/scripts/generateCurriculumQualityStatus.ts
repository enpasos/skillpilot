import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { convertLearningGoal } from '../src/goalTypes'
import type { LearningGoal, LearningLandscape } from '../src/landscapeTypes'
import { normalizeCompositionView } from '../src/utils/authoring/compositionViewAuthoring'
import { applyCompositionViewProjection } from '../src/utils/compositionViewRuntime'
import { JURISDICTION_LABELS } from '../src/utils/jurisdictionMetadata'
import { buildDirectChildrenMap, getRenderedChildIds } from '../src/utils/treeProjectionRuntime'
import type { ApplicabilityCompilationResult, ApplicabilityEvidence, ApplicabilityFinding } from './applicabilityCompiler'
import { buildApplicabilityCompilation } from './applicabilityCompiler'

type RuleStatus = 'pass' | 'warn' | 'fail' | 'not_configured'
type MaturityLevel = 'M0' | 'M1' | 'M2' | 'M3' | 'M4' | 'M5'
type SemanticReviewStatus = 'atomic' | 'needs_developer_review' | 'non_atomic'

interface QualityRuleDefinition {
  id: string
  label: string
  category: 'graph' | 'route' | 'assessment' | 'review' | 'view' | 'applicability'
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
  official?: boolean
  available: boolean
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
    unmappedSourceGoals: number
    explicitNeedsCanonicalGoal: number
    unreviewedSourceGoals: number
    hasM3ReviewFile: boolean
  },
): MappingPipelineStep[] {
  const {
    totalSourceGoals,
    mappedSourceGoals,
    unmappedSourceGoals,
    explicitNeedsCanonicalGoal,
    unreviewedSourceGoals,
    hasM3ReviewFile,
  } = coverage

  return steps.map((step) => {
    if (step.id !== 'MAPPING-3') return step

    const fullyCovered = unmappedSourceGoals <= 0
    const fullyReviewed = unreviewedSourceGoals <= 0
    const m3Complete = hasM3ReviewFile && fullyReviewed && fullyCovered && explicitNeedsCanonicalGoal <= 0

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
            passed: fullyCovered,
            details: blockedByUpstreamReview
              ? `Abgedeckt: ${mappedSourceGoals}/${totalSourceGoals}; diese Abdeckung bewertet nur die aktuellen Source-IDs und ist kein fachlicher MAPPING-3-Abschluss, solange MAPPING-2 blockiert ist.`
              : `Abgedeckt: ${mappedSourceGoals}/${totalSourceGoals}; verbleibend: ${explicitNeedsCanonicalGoal} explizite Canonical-Gaps, ${unreviewedSourceGoals} unreviewed.`,
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
  steps: MappingPipelineStep[]
}

interface SourceGoalCountPeerBaselineReview {
  accepted?: boolean
  details?: string
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
  const subject = source.subject?.trim().toLowerCase()
  const stageKeys = sourceGoalCountStageKeys(source.stage)
  if (!subject || stageKeys.length !== 1) return null
  return `${subject}:${stageKeys[0]}`
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
  const subject = source.subject?.trim().toLowerCase()
  const stageKeys = sourceGoalCountStageKeys(source.stage)
  if (!subject || stageKeys.length === 0) return []

  return stageKeys
    .map((stage) => {
      const peerCounts = baselineByGroup.get(`${subject}:${stage}`) ?? []
      return {
        stage,
        peerCounts,
        baseline: peerCounts.length >= 2 ? median(peerCounts) : 0,
      }
    })
    .filter((part) => part.peerCounts.length >= 2)
}

function appendSourceGoalCountPeerChecks(sources: Map<string, MappingPipelineSourceStatus>): void {
  const sourceExtractionStatuses = Array.from(sources.values())
    .filter((source) => source.sourceKind === 'source-extraction' && source.sourceGoals > 0)
  const baselineByGroup = new Map<string, number[]>()

  sourceExtractionStatuses
    .filter((source) =>
      source.currentStep === ''
      && source.completedSteps === source.totalSteps
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
  rulesVersion: 'curriculum-quality-v1'
  generatedAt: string
  generatedBy: string
  sources: {
    canonicalRoot: string
    sourceExtractionRoot: string
    semanticAtomicityRoot: string
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
  sourceDocument?: {
    key?: string
    title?: string
    path?: string
    official?: boolean
  }
  sourceDocuments?: Array<{
    key?: string
    title?: string
    path?: string
    official?: boolean
  }>
  passages?: unknown[]
  sourceGoals?: SourceExtractionGoal[]
  qualityReview?: {
    sourceGoalCountPeerBaseline?: SourceGoalCountPeerBaselineReview
  }
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
  terminalGoalIds?: string[]
  terminalAutonomyClusterIds: string[]
  goalSelector: (goal: LearningGoal) => boolean
  clusterSelector: (goal: LearningGoal) => boolean
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '../..')
const canonicalRoot = resolve(repoRoot, 'curricula/DE/Gymnasium/canonical')
const sourceExtractionRoot = resolve(repoRoot, 'curricula/DE/Gymnasium/input')
const semanticAtomicityRoot = resolve(repoRoot, 'curricula/DE/Gymnasium/quality/semantic-atomicity')
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
const CANONICAL_GYM_MATH_SEK1_PRACTICE_CLUSTER_ID = 'bfc4fe23-bfa4-4836-9bd2-793f4305d682'
const CANONICAL_GYM_MATH_SEK1_CAPSTONE_GOAL_ID = '30b62966-80d0-45f1-bdd9-b4fb815c7111'
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

const ruleCatalog: QualityRuleDefinition[] = [
  {
    id: 'CQR-000',
    label: 'Source inventory ingestion',
    category: 'applicability',
    maturityTarget: 'M1',
    description: 'Original source inventories are readable and their extracted goals are registered in the source membership/closure ledger.',
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
    description: 'Bundesland composition-view atoms are source-backed and registered source original goals are fully covered by view atoms.',
  },
  {
    id: 'CQR-004',
    label: 'Course-level mapping consistency',
    category: 'applicability',
    maturityTarget: 'M2',
    description: 'Upper-secondary GK/LK source-goal levels map only to canonical goals with compatible GK/LK tags; unspecified upper-secondary source goals default to GK/LK unless an LK-only decision is explicitly reviewed.',
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
    id: 'CQR-201',
    label: 'Terminal autonomy exam data',
    category: 'assessment',
    maturityTarget: 'M4',
    description: 'Terminal autonomy goals in configured scopes are exam-mode-capable or explicitly reviewed.',
  },
  {
    id: 'CQR-301',
    label: 'Semantic atomicity review freshness',
    category: 'review',
    maturityTarget: 'M5',
    description: 'Configured semantic-atomicity ledgers are complete, current, and free of unresolved review queue entries.',
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
    terminalGoalIds: [CANONICAL_GYM_MATH_SEK1_CAPSTONE_GOAL_ID],
    terminalAutonomyClusterIds: [CANONICAL_GYM_MATH_SEK1_PRACTICE_CLUSTER_ID],
    goalSelector: (goal) => isAtomicGoal(goal) && isCanonicalGymMathSek1Goal(goal),
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
]

function toRepoPath(path: string): string {
  return relative(repoRoot, path).split(/[\\/]/).join('/')
}

function loadJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T
}

function sourceDocumentsForExtraction(extraction: SourceExtractionDocument): MappingPipelineSourceDocumentStatus[] {
  const rawDocuments = Array.isArray(extraction.sourceDocuments) && extraction.sourceDocuments.length > 0
    ? extraction.sourceDocuments
    : extraction.sourceDocument
      ? [extraction.sourceDocument]
      : []

  return rawDocuments
    .map((document) => {
      const title = typeof document.title === 'string' && document.title.trim()
        ? document.title.trim()
        : typeof document.key === 'string' && document.key.trim()
          ? document.key.trim()
          : typeof document.path === 'string' && document.path.trim()
            ? document.path.trim()
            : ''
      if (!title) return null
      const sourcePath = typeof document.path === 'string' && document.path.trim()
        ? document.path.trim().replace(/\\/g, '/')
        : undefined
      const absolutePath = sourcePath ? resolve(repoRoot, sourcePath) : undefined
      return {
        key: typeof document.key === 'string' && document.key.trim() ? document.key.trim() : undefined,
        title,
        path: absolutePath ? toRepoPath(absolutePath) : undefined,
        official: document.official,
        available: absolutePath ? existsSync(absolutePath) : false,
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

function isAtomicGoal(goal: LearningGoal): boolean {
  return (goal.contains?.length ?? 0) === 0
}

function isSemanticAtomicityRelevantGoal(goal: LearningGoal): boolean {
  const tags = new Set(goal.tags ?? [])
  if (tags.has('Practice') || tags.has('Assessment')) return false
  if (tags.has('Motivation') || tags.has('Orientation')) return false
  if (isMemoryGoal(goal)) return false
  if ((goal as { examData?: unknown }).examData) return false
  return true
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

function isCurriculumSourceCoverageGoal(goal: LearningGoal | undefined): boolean {
  if (!goal) return true
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

function buildDirectRequiresEdges(landscape: LearningLandscape): Map<string, string[]> {
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

function buildAtomicDirectRequiresEdges(landscape: LearningLandscape): Map<string, string[]> {
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

function buildEffectiveRequiresEdges(landscape: LearningLandscape): Map<string, string[]> {
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

function hasPath(startId: string, targetId: string, edgeMap: Map<string, string[]>): boolean {
  if (startId === targetId) return true
  const seen = new Set<string>()
  const stack = [startId]

  while (stack.length > 0) {
    const current = stack.pop()
    if (!current || seen.has(current)) continue
    seen.add(current)

    for (const next of edgeMap.get(current) ?? []) {
      if (next === targetId) return true
      if (!seen.has(next)) stack.push(next)
    }
  }

  return false
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

function evaluateGraphIntegrity(landscape: LearningLandscape, globalGoalIds: Set<string>): RuleResult {
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

function evaluateTypeConsistency(landscape: LearningLandscape): RuleResult {
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

function evaluateRouteProfile(landscape: LearningLandscape, profile: RouteProfile): ScopeStatus {
  const goalById = new Map(landscape.goals.map((goal) => [goal.id, goal]))
  const selectedGoals = landscape.goals.filter(profile.goalSelector)
  const effectiveEdges = buildEffectiveRequiresEdges(landscape)
  const reverseEffectiveEdges = buildReverseEdges(effectiveEdges)
  const atomicDirectEdges = buildAtomicDirectRequiresEdges(landscape)
  const reverseAtomicDirectEdges = buildReverseEdges(atomicDirectEdges)
  const terminalAutonomyGoals = profile.terminalAutonomyClusterIds
    .flatMap((clusterId) => goalById.get(clusterId)?.contains ?? [])
    .map((goalId) => goalById.get(goalId))
    .filter((goal): goal is LearningGoal => !!goal)
    .filter(isAtomicGoal)
  const terminalGoalIds = profile.terminalGoalIds && profile.terminalGoalIds.length > 0
    ? profile.terminalGoalIds
    : terminalAutonomyGoals.map((goal) => goal.id)

  const missingEffectiveMotivation = selectedGoals.filter((goal) =>
    !profile.motivationAnchorGoalIds.some((anchorId) => hasPath(goal.id, anchorId, effectiveEdges)))
  const missingEffectiveTerminal = selectedGoals.filter((goal) =>
    !terminalGoalIds.some((terminalId) => hasPath(goal.id, terminalId, reverseEffectiveEdges)))

  const missingDirectMotivation = selectedGoals.filter((goal) =>
    !profile.motivationAnchorGoalIds.some((anchorId) => hasPath(goal.id, anchorId, atomicDirectEdges)))
  const missingDirectTerminal = selectedGoals.filter((goal) =>
    !terminalGoalIds.some((terminalId) => hasPath(goal.id, terminalId, reverseAtomicDirectEdges)))

  const scopedClusterRequires = landscape.goals.filter((goal) =>
    !isAtomicGoal(goal) && profile.clusterSelector(goal) && (goal.requires?.length ?? 0) > 0)

  const terminalAutonomyGoalsWithoutExamData = terminalAutonomyGoals.filter((goal) => !goal.examData)

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

function evaluateSemanticAtomicity(landscape: LearningLandscape, configs: ReviewConfig[]): RuleResult {
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
  prefix: 'active' | 'accepted' | 'obsolete',
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
  const acceptedKeys = new Set(acceptedEntries.map(applicabilityWarningKey))
  const currentWarningKeys = new Set<string>()
  const counts = new Map<string, Record<string, number>>()

  const ensureMetrics = (landscapeId: string): Record<string, number> => {
    const existing = counts.get(landscapeId)
    if (existing) return existing
    const metrics = {
      activeWarnings: 0,
      acceptedWarnings: 0,
      obsoleteAcceptedWarnings: 0,
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

  acceptedEntries.forEach((entry) => {
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
  const matchingEvidence = evidence.filter((entry) =>
    entry.dimension === 'jurisdiction' && entry.value === jurisdiction)
  return matchingEvidence.length > 0
    && !matchingEvidence.some((entry) => isSourceBackedJurisdictionEvidence(entry, jurisdiction))
    && matchingEvidence.some((entry) => entry.kind === 'mapping' && entry.mappingStrength === 'partial')
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

const compositionViewDirectoryByLandscapeId = new Map<string, string>([
  [CANONICAL_GYM_MATH_LANDSCAPE_ID, 'mathematik'],
  [CANONICAL_GYM_PHYSICS_LANDSCAPE_ID, 'physik'],
])

function readLandscapeForReport(report: CoverageReport): LearningLandscape | null {
  const absolutePath = resolve(repoRoot, report.file)
  if (!existsSync(absolutePath)) return null
  return loadJson<LearningLandscape>(absolutePath)
}

function readCompositionViewFilesForReport(report: CoverageReport): string[] {
  const directoryName = compositionViewDirectoryByLandscapeId.get(report.landscapeId)
  if (!directoryName) return []
  const directory = resolve(compositionViewRoot, directoryName)
  if (!existsSync(directory)) return []
  return collectFiles(directory, (fileName) => fileName.endsWith('.view.json'))
}

function collectRenderedAtomicGoalIdsFromCompositionView(
  landscape: LearningLandscape,
  viewFile: string,
): Set<string> {
  const entry = {
    meta: landscape,
    goals: landscape.goals.map((goal) => convertLearningGoal(goal, { landscapeId: landscape.landscapeId })),
  }
  const rawView = loadJson<unknown>(viewFile)
  const projectedEntry = applyCompositionViewProjection([entry], normalizeCompositionView(rawView))[0]
  if (!projectedEntry) return new Set<string>()

  const goalById = new Map(projectedEntry.goals.map((goal) => [goal.id, goal]))
  const directChildrenByParent = buildDirectChildrenMap(goalById)
  const rootGoalIds = projectedEntry.goals
    .filter((goal) => (goal.tags ?? []).includes('root'))
    .map((goal) => goal.id)
  const visibleGoalIds = new Set<string>()
  const stack = [...rootGoalIds]

  while (stack.length > 0) {
    const goalId = stack.pop()
    if (!goalId || visibleGoalIds.has(goalId)) continue
    visibleGoalIds.add(goalId)
    getRenderedChildIds(goalId, goalById, directChildrenByParent).forEach((childId) => stack.push(childId))
  }

  const atomicGoalIds = new Set<string>()
  visibleGoalIds.forEach((goalId) => {
    if (goalId.startsWith('composition:')) return
    const goal = goalById.get(goalId)
    if (goal && (goal.contains?.length ?? 0) === 0) {
      atomicGoalIds.add(goalId)
    }
  })
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

function readSourceLandscapeJurisdictionById(): Map<string, string> {
  if (!existsSync(sourceLandscapeRegistryPath)) return new Map<string, string>()
  const registry = loadJson<{ entries?: SourceLandscapeRegistryEntry[] }>(sourceLandscapeRegistryPath)
  const result = new Map<string, string>()
  for (const entry of registry.entries ?? []) {
    if (typeof entry.landscapeId !== 'string') continue
    const jurisdiction = normalizeJurisdiction(entry.jurisdiction)
    if (jurisdiction) result.set(entry.landscapeId, jurisdiction)
  }
  return result
}

function readSourceLandscapeRegistryEntriesById(): Map<string, SourceLandscapeRegistryEntry> {
  if (!existsSync(sourceLandscapeRegistryPath)) return new Map<string, SourceLandscapeRegistryEntry>()
  const registry = loadJson<{ entries?: SourceLandscapeRegistryEntry[] }>(sourceLandscapeRegistryPath)
  const result = new Map<string, SourceLandscapeRegistryEntry>()
  for (const entry of registry.entries ?? []) {
    if (typeof entry.landscapeId !== 'string') continue
    result.set(entry.landscapeId, entry)
  }
  return result
}

function readSourceExtractionGoalIdsByLandscapeId(atomicOnly: boolean): Map<string, Set<string>> {
  const result = new Map<string, Set<string>>()
  if (!existsSync(sourceExtractionRoot)) return result

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

  return result
}

function readExtractedSourceAtomicGoalIdsByLandscapeId(): Map<string, Set<string>> {
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
      const sourceLandscape = loadJson<LearningLandscape>(sourcePath)
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
  return result
}

function readExtractedSourceGoalIdsByLandscapeId(): Map<string, Set<string>> {
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
      const sourceLandscape = loadJson<LearningLandscape>(sourcePath)
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
  return result
}

function readSourceGoalMembershipByLandscapeId(): Map<string, Set<string>> {
  if (!existsSync(sourceGoalMembershipRegistryPath)) return new Map<string, Set<string>>()
  const registry = loadJson<SourceGoalMembershipRegistry>(sourceGoalMembershipRegistryPath)
  const result = new Map<string, Set<string>>()
  for (const entry of registry.landscapes ?? []) {
    if (typeof entry.landscapeId !== 'string' || !Array.isArray(entry.goalIds)) continue
    result.set(entry.landscapeId, new Set(entry.goalIds.filter((goalId) => typeof goalId === 'string' && goalId.trim())))
  }
  return result
}

function readSourceGoalClosureByLandscapeId(): Map<string, Map<string, Set<string>>> {
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
  return result
}

function readAllGoalMappingFiles(): Array<GoalMappingFile & { file: string }> {
  const mappingRoot = resolve(repoRoot, 'curricula/DE')
  if (!existsSync(mappingRoot)) return []
  return collectFiles(mappingRoot, (fileName) => fileName.endsWith('.json'))
    .filter((file) => file.replace(/\\/g, '/').includes('/mapping/'))
    .map((file) => ({ ...loadJson<GoalMappingFile>(file), file: toRepoPath(file) }))
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

function evaluateCourseLevelMappingConsistency(landscape: LearningLandscape): RuleResult {
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
      const explicitNeedsCanonicalGoal = decisionEntries.filter((decision) =>
        sourceGoalIds.has(decision.sourceGoalId)
        && decision.decision === 'needsCanonicalGoal'
        && !validMappedSourceGoalIds.has(decision.sourceGoalId)).length
      const unreviewedSourceGoals = Math.max(0, sourceGoalIds.size - reviewedSourceGoalIds.size)
      const normalizedSteps = normalizeSourceExtractionPipelineSteps(steps, {
        totalSourceGoals: sourceGoalIds.size,
        mappedSourceGoals: validMappedSourceGoalIds.size,
        unmappedSourceGoals,
        explicitNeedsCanonicalGoal,
        unreviewedSourceGoals,
        hasM3ReviewFile: mappingFilesForExtraction.length > 0,
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
        sourceGoalCountPeerBaselineReview: extraction.qualityReview?.sourceGoalCountPeerBaseline,
        sourceGoalGranularity: summarizeSourceGoalGranularity(sourceGoals),
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

  let sourceLandscape: LearningLandscape
  try {
    sourceLandscape = loadJson<LearningLandscape>(sourcePath)
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
  const canonicalAtomicDescendantsByGoalId = buildCanonicalAtomicDescendantsByGoalId(report)
  const mappingFiles = readGoalMappingFilesForReport(report)
  const mappingsByJurisdiction = new Map<string, Array<GoalMappingEntry & { sourceLandscapeId: string }>>()
  const sourceLandscapeIdsByJurisdiction = new Map<string, Set<string>>()

  for (const mappingFile of mappingFiles) {
    if (typeof mappingFile.sourceLandscapeId !== 'string') continue
    const jurisdiction = sourceLandscapeJurisdictionById.get(mappingFile.sourceLandscapeId)
    if (!jurisdiction) continue
    const sourceLandscapeIds = sourceLandscapeIdsByJurisdiction.get(jurisdiction) ?? new Set<string>()
    sourceLandscapeIds.add(mappingFile.sourceLandscapeId)
    sourceLandscapeIdsByJurisdiction.set(jurisdiction, sourceLandscapeIds)

    const entries = mappingsByJurisdiction.get(jurisdiction) ?? []
    for (const mapping of mappingFile.mappings ?? []) {
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
    const viewAtomicGoalIds = viewAtomicGoalIdsByJurisdiction.get(jurisdiction) ?? new Set<string>()
    const sourceExtractedGoalIds = new Set<string>()
    const sourceExtractedAtomicGoalIds = new Set<string>()
    const sourceAtomicGoalIds = new Set<string>()
    const sourceOriginalGoalIds = new Set<string>()
    const atomicClosureBySourceOriginalGoalId = new Map<string, Set<string>>()

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
        expandSourceAtomicGoalIds(sourceLandscapeId, goalId, sourceGoalClosureByLandscapeId)
          .forEach((atomicGoalId) => {
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
      expandSourceAtomicGoalIds(mapping.sourceLandscapeId, mapping.legacyGoalId, sourceGoalClosureByLandscapeId)
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
        finding.severity === 'warning' && finding.code === 'APV-202').length
      const blockingWarnings = projectionFindings.filter((finding) =>
        finding.severity === 'warning' && finding.code !== 'APV-202').length
      const visibleGoals = report.goals.filter((goal) =>
        (goal.compiledApplicability.jurisdiction ?? []).includes(projection.value))
      const viewAtomicGoalIds = viewAtomicGoalIdsByJurisdiction.get(projection.value)
      const visibleAtomicGoalReports = (viewAtomicGoalIds && viewAtomicGoalIds.size > 0
        ? rawAtomicGoals.filter((goal) => viewAtomicGoalIds.has(goal.goalId))
        : visibleGoals.filter((goal) => goal.goalType === 'atomic' && canonicalAtomicGoalIds.has(goal.goalId)))
        .filter((goal) => sourceCoverageAtomicGoalIds.has(goal.goalId))
      const visibleAtomicGoals = visibleAtomicGoalReports.length
      const visibleClusterGoals = Math.max(0, projection.visibleGoals - visibleAtomicGoals)
      const sourceBackedAtomicGoals = visibleAtomicGoalReports.filter((goal) =>
        hasCoverageBackedJurisdictionEvidence(report, goal, projection.value, surrogateEntriesByKey)).length
      const surrogateBackedAtomicGoals = visibleAtomicGoalReports.filter((goal) =>
        !hasDirectSourceBackedJurisdictionEvidence(goal, projection.value)
        && hasReviewedRequiresClosureSurrogateEvidence(report, goal, projection.value, surrogateEntriesByKey)).length
      const unsupportedAssignedAtomicGoals = visibleAtomicGoalReports.filter((goal) =>
        !hasCoverageBackedJurisdictionEvidence(report, goal, projection.value, surrogateEntriesByKey)).length
      const partialSourceLinkedAtomicGoals = visibleAtomicGoalReports.filter((goal) =>
        !hasCoverageBackedJurisdictionEvidence(report, goal, projection.value, surrogateEntriesByKey)
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
  coverage: JurisdictionCoverage | undefined,
): RuleResult {
  const rawActiveWarnings = metrics?.activeWarnings ?? 0
  const rawActivePartialOnlyWarnings = metrics?.activeCode_APV_202 ?? 0
  const canTreatPartialOnlyWarningsAsDiagnostic = !!coverage
    && coverage.totalJurisdictions > 0
    && coverage.sourceCompleteJurisdictions === coverage.totalJurisdictions
    && coverage.unsupportedAssignedAtomicGoals === 0
    && coverage.unmappedSourceAtomicGoals === 0
  const diagnosticPartialOnlyWarnings = canTreatPartialOnlyWarningsAsDiagnostic
    ? rawActivePartialOnlyWarnings
    : 0
  const activeWarnings = rawActiveWarnings - diagnosticPartialOnlyWarnings
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
      canTreatPartialOnlyWarningsAsDiagnostic ? ['APV_202'] : [],
    ),
    ...topMetricDetails(
      'activeJurisdiction_',
      'active warning jurisdiction',
      canTreatPartialOnlyWarningsAsDiagnostic ? 0 : 10,
    ),
    ...topMetricDetails('acceptedCode_', 'accepted current warning type', 3),
    ...topMetricDetails('obsoleteCode_', 'obsolete accepted warning type', 3),
  ]

  return makeRule(
    'CQR-501',
    unresolvedWarnings === 0 ? 'pass' : 'warn',
    unresolvedWarnings === 0
      ? `${acceptedWarnings} accepted applicability warning(s) are current and no active applicability warning debt is visible.`
      : `${activeWarnings} active and ${obsoleteAcceptedWarnings} obsolete accepted applicability warning(s) need review${diagnosticPartialOnlyWarnings > 0 ? `; ${diagnosticPartialOnlyWarnings} partial-only diagnostic warning(s) are non-blocking because source-to-view coverage is complete` : ''}.`,
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

function evaluateSourceSnapshotIngestion(coverage: JurisdictionCoverage | undefined): RuleResult {
  if (!coverage) {
    return makeRule('CQR-000', 'not_configured', 'No source-ingestion projection is available for this curriculum.')
  }

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
  const status: RuleStatus = missingSourceInventories.length > 0 || unregistered.length > 0
    ? 'fail'
    : completeJurisdictions < coverage.totalJurisdictions
      ? 'warn'
      : 'pass'

  return makeRule(
    'CQR-000',
    status,
    status === 'pass'
      ? `All ${coverage.totalJurisdictions} declared Bundesland source inventories are readable and fully registered.`
      : `${completeJurisdictions}/${coverage.totalJurisdictions} declared Bundesland source inventories are readable and fully registered.`,
    {
      totalJurisdictions: coverage.totalJurisdictions,
      completeSourceJurisdictions: completeJurisdictions,
      emptySourceJurisdictions: empty.length,
      missingReadableSourceInventoryJurisdictions: missingSourceInventories.length,
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

function deriveScopeMaturity(rules: RuleResult[]): MaturityLevel {
  if (rules.find((rule) => rule.id === 'CQR-101')?.status !== 'pass') return 'M0'
  if (rules.find((rule) => rule.id === 'CQR-102')?.status !== 'pass') return 'M1'
  if (rules.find((rule) => rule.id === 'CQR-103')?.status !== 'pass') return 'M1'
  if (rules.find((rule) => rule.id === 'CQR-201')?.status !== 'pass') return 'M2'
  return 'M3'
}

function deriveCurriculumMaturity(curriculumRules: RuleResult[], scopes: ScopeStatus[]): MaturityLevel {
  const graphReady = curriculumRules.find((rule) => rule.id === 'CQR-001')?.status === 'pass'
    && curriculumRules.find((rule) => rule.id === 'CQR-002')?.status === 'pass'
  if (!graphReady) return 'M0'
  if (curriculumRules.find((rule) => rule.id === 'CQR-000')?.status !== 'pass') return 'M0'
  if (curriculumRules.find((rule) => rule.id === 'CQR-003')?.status !== 'pass') return 'M1'
  if (curriculumRules.find((rule) => rule.id === 'CQR-004')?.status === 'fail') return 'M1'

  const routeScopes = scopes.filter((scope) => scope.rules.some((rule) => rule.id === 'CQR-101'))
  if (routeScopes.length === 0) return 'M2'
  if (!routeScopes.every((scope) => scope.rules.find((rule) => rule.id === 'CQR-101')?.status === 'pass')) return 'M2'
  if (!routeScopes.every((scope) => scope.maturity === 'M2' || scope.maturity === 'M3')) return 'M2'
  if (!routeScopes.every((scope) => scope.maturity === 'M3')) return 'M3'

  const m4Ready = curriculumRules.find((rule) => rule.id === 'CQR-301')?.status === 'pass'
    && curriculumRules.find((rule) => rule.id === 'CQR-401')?.status === 'pass'
    && curriculumRules.find((rule) => rule.id === 'CQR-501')?.status === 'pass'
  return m4Ready ? 'M5' : 'M4'
}

function renderMarkdown(status: StatusDocument): string {
  const lines: string[] = []
  const sourceEvidenceLabel = (source: MappingPipelineSourceStatus): string => {
    if (source.sourceKind === 'source-extraction') {
      const documents = source.sourceDocuments ?? []
      const available = documents.filter((document) => document.available).length
      return documents.length > 0 ? `${available}/${documents.length} original source(s)` : '0 original source(s)'
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
  lines.push('| Curriculum | Source | Jurisdiction | Original sources | Complete | Current step | Passages | Source goals | Exact | Partial | Exact share | Evidence note |')
  lines.push('| --- | --- | --- | --- | ---: | --- | ---: | ---: | ---: | ---: | ---: | --- |')
  status.curricula.forEach((curriculum) => {
    curriculum.mappingPipeline?.sources.forEach((source) => {
      const evidenceNote = source.sourceKind === 'legacy-snapshot' ? 'not pipeline-capable: no passage extraction' : ''
      const mappedSourceGoals = source.mappedSourceGoals ?? Math.max(0, source.sourceGoals - (source.unmappedSourceGoals ?? 0))
      const exactShare = mappedSourceGoals > 0
        ? Math.round(((source.exactMappings ?? 0) / mappedSourceGoals) * 100)
        : 0
      lines.push(`| ${curriculum.title} | ${source.title} | ${source.jurisdiction || '-'} | ${sourceEvidenceLabel(source)} | ${source.completedSteps}/${source.totalSteps} | ${source.currentStep || '-'} | ${source.passages} | ${source.sourceGoals} | ${source.exactMappings ?? 0} | ${source.partialMappings ?? 0} | ${exactShare}% | ${evidenceNote} |`)
    })
  })
  lines.push('')
  lines.push('## Bundesland Coverage')
  lines.push('')
  lines.push('| Curriculum | Complete | DE view atoms | Raw atoms | Source-backed states | Extracted source goals | Registered source originals | Fully covered originals | Unregistered source goals | Extracted source atoms | Unregistered source atoms | Unsupported assignments | Unmapped source atoms | Partial | Error | Max source-backed view coverage |')
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
  const applicabilityCompilation = buildApplicabilityCompilation()
  const semanticConfigsByLandscapeId = readSemanticConfigs()
  const compositionViewCountsByLandscapeId = readCompositionViewCountsByLandscapeId()
  const applicabilityWarningMetricsByLandscapeId = readApplicabilityWarningMetricsByLandscapeId(applicabilityCompilation)
  const jurisdictionCoverageByLandscapeId = readJurisdictionCoverageByLandscapeId(applicabilityCompilation)
  const mappingPipelineByLandscapeId = readMappingPipelineByLandscapeId()

  const canonicalFiles = collectFiles(canonicalRoot, (fileName) => /\.json$/i.test(fileName) && !/_deck/i.test(fileName))
  const loadedLandscapes = canonicalFiles.map((file) => ({
    file,
    landscape: loadJson<LearningLandscape>(file),
  }))
  const globalGoalIds = new Set(loadedLandscapes.flatMap(({ landscape }) => landscape.goals.map((goal) => goal.id)))

  const curricula = loadedLandscapes
    .map(({ file, landscape }) => {
      const atomicGoals = landscape.goals.filter(isAtomicGoal).length
      const jurisdictionCoverage = jurisdictionCoverageByLandscapeId.get(landscape.landscapeId)
      const curriculumRules: RuleResult[] = [
        evaluateGraphIntegrity(landscape, globalGoalIds),
        evaluateTypeConsistency(landscape),
        evaluateSourceSnapshotIngestion(jurisdictionCoverage),
        evaluateJurisdictionCoverage(jurisdictionCoverage),
        evaluateCourseLevelMappingConsistency(landscape),
        evaluateSemanticAtomicity(landscape, semanticConfigsByLandscapeId.get(landscape.landscapeId) ?? []),
        evaluateCompositionViews(compositionViewCountsByLandscapeId.get(landscape.landscapeId) ?? 0),
        evaluateApplicabilityWarnings(
          applicabilityWarningMetricsByLandscapeId.get(landscape.landscapeId),
          jurisdictionCoverage,
        ),
      ]
      const scopedProfiles = routeProfiles.filter((profile) => profile.landscapeId === landscape.landscapeId)
      const scopes = scopedProfiles.map((profile) => evaluateRouteProfile(landscape, profile))
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
        mappingPipeline: mappingPipelineByLandscapeId.get(landscape.landscapeId),
        scopes,
        rules: curriculumRules,
      } satisfies CurriculumStatus
    })
    .sort((left, right) => left.title.localeCompare(right.title, 'de', { sensitivity: 'base' }))

  const allRules = curricula.flatMap((curriculum) => [
    ...curriculum.rules,
    ...curriculum.scopes.flatMap((scope) => scope.rules),
  ])
  const maturity: Record<MaturityLevel, number> = { M0: 0, M1: 0, M2: 0, M3: 0, M4: 0, M5: 0 }
  curricula.forEach((curriculum) => {
    maturity[curriculum.maturity] += 1
  })
  const ruleStatus: Record<RuleStatus, number> = { pass: 0, warn: 0, fail: 0, not_configured: 0 }
  allRules.forEach((rule) => {
    ruleStatus[rule.status] += 1
  })

  const status: StatusDocument = {
    schemaVersion: 1,
    rulesVersion: 'curriculum-quality-v1',
    generatedAt: new Date().toISOString(),
    generatedBy: 'app/scripts/generateCurriculumQualityStatus.ts',
    sources: {
      canonicalRoot: toRepoPath(canonicalRoot),
      sourceExtractionRoot: toRepoPath(sourceExtractionRoot),
      semanticAtomicityRoot: toRepoPath(semanticAtomicityRoot),
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

  mkdirSync(statusDir, { recursive: true })
  writeFileSync(statusJsonPath, `${JSON.stringify(status, null, 2)}\n`, 'utf8')
  writeFileSync(statusMarkdownPath, renderMarkdown(status), 'utf8')
  console.log(`Wrote ${toRepoPath(statusJsonPath)}`)
  console.log(`Wrote ${toRepoPath(statusMarkdownPath)}`)
}

main()
