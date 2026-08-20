import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { dirname, isAbsolute, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import type { LearningGoal } from '../src/landscapeTypes'
import {
  buildCanonicalGraphIndex,
  normalizeCanonicalLandscape,
  normalizeGoalRef,
  resolveCanonicalNodeType,
  validateCanonicalLandscape,
  type CanonicalAuthoringGoal,
  type CanonicalAuthoringLandscape,
} from '../src/utils/authoring/canonicalAuthoring'
import {
  compileCompositionView,
  normalizeCompositionView,
  type CompositionView,
  type CompositionCompileResult,
  type CompiledCompositionPreviewNode,
} from '../src/utils/authoring/compositionViewAuthoring'
import { aiApprovalStatus } from '../src/utils/goalVisualizationQaStatus'
import {
  fingerprintGoalForEvidence,
  type GoalEvidenceReviewRecord,
  type GoalEvidenceReviewStatus,
  validateGoalEvidenceRecordSemantics,
} from './goalEvidenceProfileModel'

export const GOAL_BOOK_MODEL_SCHEMA_VERSION = '1.0.0' as const
export const GOAL_BOOK_CONFIG_SCHEMA_VERSION = 1 as const
export const GOAL_BOOK_GOAL_FINGERPRINT_RULE_VERSION = 'goal-evidence-v1' as const
export const GOAL_BOOK_EDITION = 'curricular-atomic-v1' as const
export const GOAL_BOOK_ATLAS_NAVIGATION_OWNERSHIP = 'common-topic-suffix-v1' as const

export type GoalBookPublicationMode = 'review' | 'public'
export type GoalBookVisualizationQaStatus = 'approved' | 'review_candidate' | 'rejected'

const SEMANTIC_KINDS = new Set([
  'orientation',
  'curricularAtomic',
  'curricularArea',
  'practiceAssessment',
  'memory',
  'programStructure',
  'runtimeSupport',
])

const REPOSITORY_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const GOAL_BOOK_MODEL_SCHEMA_PATH = resolve(
  REPOSITORY_ROOT,
  'contracts/goal-book/v1/goal-book-model.schema.json',
)
const GOAL_BOOK_SOURCE_MANIFEST_SCHEMA_PATH = resolve(
  REPOSITORY_ROOT,
  'contracts/goal-book/v1/goal-book-source-manifest.schema.json',
)
const SEMANTIC_KIND_LEDGER_SCHEMA_PATH = resolve(
  REPOSITORY_ROOT,
  'contracts/curriculum-package/v1/curriculum-ontology-profile.schema.json',
)
const GOAL_EVIDENCE_PROFILE_SCHEMA_PATH = resolve(
  REPOSITORY_ROOT,
  'contracts/goal-evidence/v1/goal-evidence-profile.schema.json',
)
export const SEMANTIC_KIND_SOURCE_FINGERPRINT_CONTRACT_ID = (
  'semantic-kind-source-fingerprint-v1'
) as const
const SEMANTIC_KIND_SOURCE_FINGERPRINT_DOMAIN = (
  'skillpilot:semantic-kind-source-fingerprint:v1'
) as const
const SEMANTIC_KIND_SOURCE_FINGERPRINT_PROFILE_ID = 'semantic-normal-form-v1' as const
const SEMANTIC_KIND_SOURCE_FINGERPRINT_PROFILE_VERSION = '1.0.0' as const
const SEMANTIC_KIND_SOURCE_FINGERPRINT_PROFILE_PATH = (
  'contracts/curriculum-package/v1/profiles/semantic-normal-form-v1.profile.json'
) as const
const SEMANTIC_KIND_SOURCE_FINGERPRINT_PROFILE_SHA256 = (
  '22e48f2dea55fbc3d6b39fc196c31258ab1559ef6751df4882f43318eadd48ca'
) as const
const SEMANTIC_KIND_SOURCE_FINGERPRINT_POINTERS = [
  '/id',
  '/type',
  '/nodeKind',
  '/title',
  '/titleEn',
  '/description',
  '/descriptionEn',
  '/tags',
  '/contains',
  '/requires',
  '/semanticAtomic',
  '/dimensionTags',
  '/examData',
  '/extendedData',
  '/release',
] as const
const SAFE_GOAL_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]*$/u

const createSchemaValidator = (schemaPath: string, includeFormats = false) => {
  const ajv = new Ajv2020({ allErrors: true, strict: true })
  if (includeFormats) addFormats(ajv)
  const schema = JSON.parse(readFileSync(schemaPath, 'utf8')) as Record<string, unknown>
  return { ajv, validate: ajv.compile(schema) }
}

let cachedGoalBookSchemaValidator: ReturnType<typeof createSchemaValidator> | null = null
let cachedEvidenceSchemaValidator: ReturnType<typeof createSchemaValidator> | null = null
let cachedSourceManifestSchemaValidator: ReturnType<typeof createSchemaValidator> | null = null
let cachedSemanticKindLedgerSchemaValidator: ReturnType<typeof createSchemaValidator> | null = null
let semanticKindFingerprintProfileVerified = false

export interface GoalBookApplicabilityScope {
  stage: 'SekI' | 'SekII'
  durationModel: 'G8' | 'G9' | null
  courseProfile: 'GK' | 'LK' | null
}

export interface GoalBookApplicabilityGroup {
  jurisdiction: string
  scopes: GoalBookApplicabilityScope[]
}

export interface GoalBookReference {
  goalId: string
  title: string
  anchor?: string
  pageNumber?: number
}

export interface GoalBookExternalReference extends GoalBookReference {
  landscapeId?: string
  canonicalUrl: string | null
}

export interface GoalBookExternalLandscapeSource {
  path: string
  landscapeId: string
  digest: string
}

export interface GoalBookChapter {
  chapterId: string
  label: string
  parentChapterId: string | null
  goalIds: string[]
  pageNumbers: number[]
}

export interface GoalBookVisualization {
  resourceType: 'image'
  title: string
  url: string
  altText?: string
  originalDigest: string
  qaStatus: GoalBookVisualizationQaStatus
  approvedForPublication: boolean
}

export interface GoalBookPage {
  pageNumber: number
  goalId: string
  shortKey?: string
  anchor: string
  title: string
  description: string
  breadcrumbs: string[]
  chapterIds: string[]
  applicability?: GoalBookApplicabilityGroup[]
  requires: GoalBookReference[]
  reverseRequires: GoalBookReference[]
  externalPrerequisites: GoalBookExternalReference[]
  externalReverseRequires: GoalBookExternalReference[]
  visualization: GoalBookVisualization | null
  evidenceReview: GoalBookEvidenceReviewSummary | null
  goalFingerprint: string
  pageFingerprint: string
}

export interface GoalBookEvidenceReviewSummary {
  reviewId: string
  status: GoalEvidenceReviewStatus
  reviewInputFingerprint: string
  profileFingerprint: string
  evidenceLevel: 'E0' | 'E1' | 'E2' | 'E3' | 'E4' | 'E5'
  maximumClaimScope: 'G0' | 'G1' | 'G2' | 'G3' | 'G4'
}

export interface GoalBookEvidenceReviewSource {
  path: string
  digest: string
}

export interface GoalBookCompositionViewSource {
  path: string
  viewId: string
  scope: Record<string, string>
  digest: string
  projectionFingerprint: string
}

export interface GoalBookExcludedTarget {
  goalId: string
  title: string
  semanticKind: string
  reason: 'not-curricular-atomic'
}

export interface GoalBookModel {
  schemaVersion: typeof GOAL_BOOK_MODEL_SCHEMA_VERSION
  book: {
    id: string
    title: string
    locale: string
    landscapeId: string
    viewId: string
    scope: Record<string, string>
    pageCount: number
    projectedAtomicGoalCount: number
    excludedTargetAtomicGoalCount: number
    edition: typeof GOAL_BOOK_EDITION
    publicationMode: GoalBookPublicationMode
    atlasBaseUrl: string | null
    oneGoalPerPage: true
  }
  source: {
    landscapePath: string
    compositionViewPath: string
    semanticKindLedgerPath: string
    goalVisualizationQaPath: string
    landscapeDigest: string
    compositionViewDigest: string
    semanticKindLedgerDigest: string
    goalVisualizationQaDigest: string
    compositionViewManifestPath?: string
    compositionViewManifestDigest?: string
    compositionViewSources?: GoalBookCompositionViewSource[]
    navigationOwnership?: typeof GOAL_BOOK_ATLAS_NAVIGATION_OWNERSHIP
    durationModelPolicyPath?: string
    durationModelPolicyDigest?: string
    externalLandscapes?: GoalBookExternalLandscapeSource[]
    evidenceReviewSources: GoalBookEvidenceReviewSource[]
    goalFingerprintRuleVersion: typeof GOAL_BOOK_GOAL_FINGERPRINT_RULE_VERSION
  }
  chapters: GoalBookChapter[]
  pages: GoalBookPage[]
  excludedTargetGoals: GoalBookExcludedTarget[]
  digest: string
}

export interface GoalBookConfigFile {
  schemaVersion: typeof GOAL_BOOK_CONFIG_SCHEMA_VERSION
  bookId: string
  title: string
  landscapePath: string
  compositionViewPath?: string
  compositionViewManifestPath?: string
  semanticKindLedgerPath: string
  goalVisualizationQaPath: string
  publicationMode: GoalBookPublicationMode
  atlasBaseUrl?: string
  evidenceReviewPaths: string[]
  externalLandscapePaths?: string[]
  outputPath: string
}

export interface GoalBookBuildConfig {
  bookId: string
  title: string
  landscapePath: string
  compositionViewPath?: string
  compositionViewManifestPath?: string
  semanticKindLedgerPath: string
  goalVisualizationQaPath: string
  publicationMode: GoalBookPublicationMode
  atlasBaseUrl?: string
  evidenceReviewPaths: string[]
  externalLandscapePaths?: string[]
}

export interface GoalBookEvidenceReviewBuildSource {
  path: string
  text: string
}

export interface GoalBookBuildInput {
  landscape: unknown
  compositionView?: unknown
  compositionViewManifest?: unknown
  compositionViewSources?: GoalBookCompositionViewBuildSource[]
  externalLandscapeSources?: GoalBookExternalLandscapeBuildSource[]
  durationModelPolicy?: unknown
  semanticKindLedger: unknown
  goalVisualizationQa: unknown
  goalVisualizationAssetDigests: Record<string, string>
  evidenceReviewSources: GoalBookEvidenceReviewBuildSource[]
  config: GoalBookBuildConfig
}

export interface GoalBookCompositionViewBuildSource {
  path: string
  view: unknown
}

export interface GoalBookExternalLandscapeBuildSource {
  path: string
  landscape: unknown
}

interface GoalBookSourceManifest {
  schemaVersion: 1
  manifestId: string
  landscapeId: string
  navigationOwnership: typeof GOAL_BOOK_ATLAS_NAVIGATION_OWNERSHIP
  expectedJurisdictions: string[]
  durationModelPolicyPath: string
  expectedCurricularAtomicGoalCount: number
  sourcePaths: string[]
}

interface GoalBookDurationModelPolicyDecision {
  jurisdiction: string
  stage: 'SekI' | 'SekI+SekII'
  durationModels: Array<'G8' | 'G9'>
  decision: 'single-duration-source' | 'duration-neutral-projection' | 'dual-duration-different-projection'
  compositionViewIds: string[]
}

export interface GoalBookDurationPolicyViewSource {
  viewId: string
  jurisdiction: string
  stage: string
  durationModel: 'G8' | 'G9' | null
  courseProfile: 'GK' | 'LK' | null
}

export interface LoadedGoalBookBuildInputs {
  config: GoalBookConfigFile
  configPath: string
  outputPath: string
  model: GoalBookModel
}

interface TargetGoalOccurrence {
  goalId: string
  breadcrumbs: string[]
  chapterIds: string[]
  viewOrder: number
}

interface GoalBookChapterDraft {
  chapterId: string
  label: string
  parentChapterId: string | null
}

interface TargetGoalCollection {
  occurrences: TargetGoalOccurrence[]
  chapterDrafts: GoalBookChapterDraft[]
}

interface CompiledGoalBookViewSource {
  path: string
  rawView: unknown
  view: CompositionView
  compilation: CompositionCompileResult
  targetCollection: TargetGoalCollection
  curricularAtomicGoalIds: Set<string>
}

interface SemanticKindLedgerResult {
  semanticKindByGoalId: Map<string, string>
  ledgerId: string
}

interface ResolvedExternalLandscapes {
  landscape: CanonicalAuthoringLandscape
  primaryGoalIds: Set<string>
  externalLandscapeIdByGoalId: Map<string, string>
  sourceBindings: GoalBookExternalLandscapeSource[]
}

interface GoalVisualizationQaRecord {
  goalId: string
  imageUrl: string
  assetSha256: string
  qaStatus: GoalBookVisualizationQaStatus
  approvedForPublication: boolean
}

interface EvidenceReviewParseResult {
  summaryByGoalId: Map<string, GoalBookEvidenceReviewSummary>
  sources: GoalBookEvidenceReviewSource[]
}

const fail = (message: string): never => {
  throw new Error(`Goal-book model: ${message}`)
}

const compareStrings = (left: string, right: string): number => {
  if (left < right) return -1
  if (left > right) return 1
  return 0
}

export const stableGoalBookJson = (value: unknown): string => {
  if (Array.isArray(value)) {
    return `[${value.map(stableGoalBookJson).join(',')}]`
  }
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => compareStrings(left, right))
      .map(([key, nested]) => `${JSON.stringify(key)}:${stableGoalBookJson(nested)}`)
      .join(',')}}`
  }
  const serialized = JSON.stringify(value)
  return serialized === undefined ? 'null' : serialized
}

const digest = (value: unknown): string => (
  `sha256:${createHash('sha256').update(stableGoalBookJson(value)).digest('hex')}`
)

const digestBytes = (value: Uint8Array): string => (
  `sha256:${createHash('sha256').update(value).digest('hex')}`
)

const nonEmptyString = (value: unknown, label: string): string => {
  if (typeof value !== 'string' || value.trim() === '') {
    return fail(`${label} must be a non-empty string.`)
  }
  return value.trim()
}

const optionalString = (value: unknown): string | undefined => (
  typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined
)

const sha256Digest = (value: unknown, label: string): string => {
  const normalized = nonEmptyString(value, label)
  if (!/^sha256:[0-9a-f]{64}$/u.test(normalized)) {
    return fail(`${label} must be a sha256 digest.`)
  }
  return normalized
}

const uniqueStringArray = (value: unknown, label: string): string[] => {
  if (!Array.isArray(value)) return fail(`${label} must be an array.`)
  const result = value.map((entry, index) => nonEmptyString(entry, `${label}[${index}]`))
  if (new Set(result).size !== result.length) return fail(`${label} must not contain duplicates.`)
  return result
}

const publicationMode = (value: unknown, label: string): GoalBookPublicationMode => {
  if (value === 'review' || value === 'public') return value
  return fail(`${label} must be review or public.`)
}

const atlasBaseUrl = (value: unknown, label: string): string | undefined => {
  const normalized = optionalString(value)
  if (!normalized) return undefined
  let parsed: URL
  try {
    parsed = new URL(normalized)
  } catch {
    return fail(`${label} must be a valid HTTPS URL.`)
  }
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.hash) {
    return fail(`${label} must be an HTTPS URL without credentials or fragment.`)
  }
  return parsed.toString()
}

const canonicalGoalUrl = (
  baseUrl: string | undefined,
  landscapeId: string,
  goalId: string,
): string | null => {
  if (!baseUrl) return null
  const url = new URL(baseUrl)
  url.searchParams.set('landscape', landscapeId)
  url.searchParams.set('edition', GOAL_BOOK_EDITION)
  url.hash = goalAnchor(goalId)
  return url.toString()
}

const asRecord = (value: unknown, label: string): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return fail(`${label} must be an object.`)
  }
  return value as Record<string, unknown>
}

const compareUnicodeCodePoints = (left: string, right: string): number => {
  const leftPoints = Array.from(left, (value) => value.codePointAt(0) ?? 0)
  const rightPoints = Array.from(right, (value) => value.codePointAt(0) ?? 0)
  const length = Math.min(leftPoints.length, rightPoints.length)
  for (let index = 0; index < length; index += 1) {
    if (leftPoints[index] !== rightPoints[index]) return leftPoints[index] - rightPoints[index]
  }
  return leftPoints.length - rightPoints.length
}

const assertSemanticKindCanonicalString = (value: string, label: string): void => {
  for (let index = 0; index < value.length; index += 1) {
    const codeUnit = value.charCodeAt(index)
    let codePoint = codeUnit
    if (codeUnit >= 0xd800 && codeUnit <= 0xdbff) {
      const low = value.charCodeAt(index + 1)
      if (!(low >= 0xdc00 && low <= 0xdfff)) {
        fail(`${label} contains an unpaired Unicode surrogate.`)
      }
      codePoint = ((codeUnit - 0xd800) * 0x400) + (low - 0xdc00) + 0x10000
      index += 1
    } else if (codeUnit >= 0xdc00 && codeUnit <= 0xdfff) {
      fail(`${label} contains an unpaired Unicode surrogate.`)
    }
    if (
      (codePoint < 0x20 && codePoint !== 0x09 && codePoint !== 0x0a && codePoint !== 0x0d)
      || codePoint === 0xfffe
      || codePoint === 0xffff
    ) {
      fail(`${label} contains a character forbidden by semantic-normal-form-v1.`)
    }
  }
}

const semanticKindCanonicalJson = (value: unknown, label: string): string => {
  if (value === null) return 'null'
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'string') {
    assertSemanticKindCanonicalString(value, label)
    return JSON.stringify(value)
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) fail(`${label} contains a non-finite number.`)
    return JSON.stringify(Object.is(value, -0) ? 0 : value)
  }
  if (Array.isArray(value)) {
    return `[${value.map((item, index) => semanticKindCanonicalJson(item, `${label}[${index}]`)).join(',')}]`
  }
  if (value && typeof value === 'object') {
    return `{${Object.keys(value as Record<string, unknown>)
      .sort(compareUnicodeCodePoints)
      .map((key) => {
        assertSemanticKindCanonicalString(key, `${label} object key`)
        return `${JSON.stringify(key)}:${semanticKindCanonicalJson(
          (value as Record<string, unknown>)[key],
          `${label}.${key}`,
        )}`
      })
      .join(',')}}`
  }
  return fail(`${label} contains an unsupported canonical JSON value.`)
}

const assertPinnedSemanticKindFingerprintProfile = (): void => {
  if (semanticKindFingerprintProfileVerified) return
  const absolutePath = resolve(REPOSITORY_ROOT, SEMANTIC_KIND_SOURCE_FINGERPRINT_PROFILE_PATH)
  const bytes = readFileSync(absolutePath)
  const actualSha256 = createHash('sha256').update(bytes).digest('hex')
  if (actualSha256 !== SEMANTIC_KIND_SOURCE_FINGERPRINT_PROFILE_SHA256) {
    fail(
      `pinned ${SEMANTIC_KIND_SOURCE_FINGERPRINT_PROFILE_ID} bytes have SHA-256 ${actualSha256}, `
      + `expected ${SEMANTIC_KIND_SOURCE_FINGERPRINT_PROFILE_SHA256}.`,
    )
  }
  let profile: Record<string, unknown>
  try {
    profile = asRecord(JSON.parse(bytes.toString('utf8')), 'semantic-kind normalization profile')
  } catch (error) {
    fail(`pinned semantic-kind normalization profile is not valid JSON: ${String(error)}.`)
  }
  if (
    profile.profileId !== SEMANTIC_KIND_SOURCE_FINGERPRINT_PROFILE_ID
    || profile.version !== SEMANTIC_KIND_SOURCE_FINGERPRINT_PROFILE_VERSION
    || asRecord(profile.canonicalJson, 'semantic-kind normalization profile canonicalJson').algorithm
      !== 'skillpilot-canonical-json-v1'
  ) {
    fail('pinned semantic-kind normalization profile identity or algorithm is inconsistent.')
  }
  semanticKindFingerprintProfileVerified = true
}

export const fingerprintSemanticKindSourceGoal = (
  rawGoal: Record<string, unknown>,
): string => {
  assertPinnedSemanticKindFingerprintProfile()
  const goalId = nonEmptyString(rawGoal.id, 'semantic-kind source goal id')
  const fields = SEMANTIC_KIND_SOURCE_FINGERPRINT_POINTERS.map((pointer) => {
    const key = pointer.slice(1)
    if (!Object.prototype.hasOwnProperty.call(rawGoal, key)) {
      return { path: pointer, state: 'missing' }
    }
    let value = rawGoal[key]
    if (pointer === '/tags') {
      if (!Array.isArray(value) || !value.every((entry) => typeof entry === 'string')) {
        fail(`goal ${goalId} has invalid tags for semantic-kind fingerprint.`)
      }
      if (new Set(value).size !== value.length) {
        fail(`goal ${goalId} has duplicate tags for semantic-kind fingerprint.`)
      }
      value = [...value].sort(compareUnicodeCodePoints)
    }
    return { path: pointer, state: 'value', value }
  })
  const canonicalBytes = semanticKindCanonicalJson(
    { domain: SEMANTIC_KIND_SOURCE_FINGERPRINT_DOMAIN, fields },
    `semantic-kind source goal ${goalId}`,
  )
  return `sha256:${createHash('sha256').update(canonicalBytes, 'utf8').digest('hex')}`
}

const assertUniqueCanonicalGoalIds = (landscape: unknown) => {
  const record = asRecord(landscape, 'landscape')
  const rawGoals = record.goals
  if (!Array.isArray(rawGoals)) return fail('landscape.goals must be an array.')
  const seen = new Set<string>()
  rawGoals.forEach((rawGoal, index) => {
    const goal = asRecord(rawGoal, `landscape.goals[${index}]`)
    const goalId = nonEmptyString(goal.id, `landscape.goals[${index}].id`)
    if (seen.has(goalId)) fail(`duplicate canonical goal ID ${goalId}.`)
    seen.add(goalId)
  })
}

const resolveExternalLandscapes = (
  rawLandscape: unknown,
  externalSources: GoalBookExternalLandscapeBuildSource[],
): ResolvedExternalLandscapes => {
  assertUniqueCanonicalGoalIds(rawLandscape)
  const primaryRecord = asRecord(rawLandscape, 'landscape')
  const rawPrimaryGoals = Array.isArray(primaryRecord.goals)
    ? primaryRecord.goals.map((goal, index) => asRecord(goal, `landscape.goals[${index}]`))
    : fail('landscape.goals must be an array.')
  const primaryGoalIds = new Set(rawPrimaryGoals.map((goal, index) => (
    nonEmptyString(goal.id, `landscape.goals[${index}].id`)
  )))
  const externalLandscapeIdByGoalId = new Map<string, string>()
  const rawExternalGoalById = new Map<string, Record<string, unknown>>()
  const sourceBindings: GoalBookExternalLandscapeSource[] = []
  const seenPaths = new Set<string>()
  const seenLandscapeIds = new Set<string>()

  externalSources.forEach((source, sourceIndex) => {
    const path = nonEmptyString(source.path, `externalLandscapeSources[${sourceIndex}].path`)
    if (seenPaths.has(path)) fail(`external landscape source path ${path} is duplicated.`)
    seenPaths.add(path)
    assertUniqueCanonicalGoalIds(source.landscape)
    const externalLandscape = normalizeCanonicalLandscape(source.landscape)
    const externalErrors = validateCanonicalLandscape(externalLandscape)
      .filter(({ severity }) => severity === 'error')
    if (externalErrors.length > 0) {
      fail(`invalid external canonical landscape ${path}: ${externalErrors
        .map((finding) => `${finding.goalId ?? 'landscape'}: ${finding.message}`)
        .join(' | ')}`)
    }
    if (externalLandscape.landscapeId === primaryRecord.landscapeId) {
      fail(`external landscape ${path} duplicates the primary landscape identity.`)
    }
    if (seenLandscapeIds.has(externalLandscape.landscapeId)) {
      fail(`external landscape ID ${externalLandscape.landscapeId} is bound more than once.`)
    }
    seenLandscapeIds.add(externalLandscape.landscapeId)
    const externalRecord = asRecord(source.landscape, `external landscape ${path}`)
    const rawExternalGoals = Array.isArray(externalRecord.goals)
      ? externalRecord.goals
      : fail(`external landscape ${path}.goals must be an array.`)
    rawExternalGoals.forEach((rawGoal, goalIndex) => {
      const goal = asRecord(rawGoal, `external landscape ${path}.goals[${goalIndex}]`)
      const goalId = nonEmptyString(goal.id, `external landscape ${path}.goals[${goalIndex}].id`)
      if (primaryGoalIds.has(goalId) || externalLandscapeIdByGoalId.has(goalId)) {
        fail(`external goal ID ${goalId} is ambiguous across bound landscapes.`)
      }
      externalLandscapeIdByGoalId.set(goalId, externalLandscape.landscapeId)
      rawExternalGoalById.set(goalId, goal)
    })
    sourceBindings.push({
      path,
      landscapeId: externalLandscape.landscapeId,
      digest: digest(source.landscape),
    })
  })

  const requiredExternalGoalIds = new Set<string>()
  rawPrimaryGoals.forEach((goal, goalIndex) => {
    const ownerId = nonEmptyString(goal.id, `landscape.goals[${goalIndex}].id`)
    const contains = Array.isArray(goal.contains) ? goal.contains : []
    contains.forEach((reference) => {
      const goalId = normalizeGoalRef(reference)
      if (!goalId) fail(`goal ${ownerId} has malformed contains reference.`)
      if (!primaryGoalIds.has(goalId)) {
        const relation = externalLandscapeIdByGoalId.has(goalId) ? 'foreign' : 'unresolved'
        fail(`goal ${ownerId} has ${relation} contains reference ${goalId}; cross-landscape composition is forbidden.`)
      }
    })
    const requires = Array.isArray(goal.requires) ? goal.requires : []
    requires.forEach((reference) => {
      const goalId = normalizeGoalRef(reference)
      if (!goalId) fail(`goal ${ownerId} has malformed requires reference.`)
      if (primaryGoalIds.has(goalId)) return
      if (!externalLandscapeIdByGoalId.has(goalId)) {
        fail(`goal ${ownerId} has unresolved cross-landscape prerequisite ${goalId}.`)
      }
      requiredExternalGoalIds.add(goalId)
    })
  })

  const externalGoalStubs = [...requiredExternalGoalIds]
    .sort(compareStrings)
    .map((goalId) => {
      const goal = rawExternalGoalById.get(goalId)
        ?? fail(`cannot materialize external prerequisite ${goalId}.`)
      return {
        ...structuredClone(goal),
        type: 'atomic',
        contains: [],
        requires: [],
      }
    })
  const augmentedRawLandscape = {
    ...structuredClone(primaryRecord),
    goals: [...structuredClone(rawPrimaryGoals), ...externalGoalStubs],
  }
  const landscape = normalizeCanonicalLandscape(augmentedRawLandscape)
  const canonicalFindings = validateCanonicalLandscape(landscape)
    .filter(({ severity }) => severity === 'error')
  if (canonicalFindings.length > 0) {
    fail(`invalid canonical landscape: ${canonicalFindings
      .map((finding) => `${finding.goalId ?? 'landscape'}: ${finding.message}`)
      .join(' | ')}`)
  }
  return {
    landscape,
    primaryGoalIds,
    externalLandscapeIdByGoalId,
    sourceBindings,
  }
}

const parseSemanticKindLedger = (
  value: unknown,
  rawLandscape: unknown,
  landscapeId: string,
  landscapePath: string,
): SemanticKindLedgerResult => {
  const validator = cachedSemanticKindLedgerSchemaValidator
    ?? (cachedSemanticKindLedgerSchemaValidator = createSchemaValidator(
      SEMANTIC_KIND_LEDGER_SCHEMA_PATH,
      true,
    ))
  if (!validator.validate(value)) {
    fail(`semantic-kind ledger violates its closed JSON Schema: ${validator.ajv.errorsText(
      validator.validate.errors,
      { separator: '; ' },
    )}.`)
  }
  const record = asRecord(value, 'semanticKindLedger')
  const ledgerId = nonEmptyString(record.ledgerId, 'semanticKindLedger.ledgerId')
  const sourceLandscapeId = nonEmptyString(
    record.sourceLandscapeId,
    'semanticKindLedger.sourceLandscapeId',
  )
  if (sourceLandscapeId !== landscapeId) {
    fail(`semantic-kind ledger targets ${sourceLandscapeId}, expected ${landscapeId}.`)
  }
  const sourceLandscapePath = nonEmptyString(
    record.sourceLandscapePath,
    'semanticKindLedger.sourceLandscapePath',
  )
  if (sourceLandscapePath !== landscapePath) {
    fail(`semantic-kind ledger binds ${sourceLandscapePath}, expected ${landscapePath}.`)
  }
  if (record.sourceFingerprintContractId !== SEMANTIC_KIND_SOURCE_FINGERPRINT_CONTRACT_ID) {
    fail(
      `semantic-kind ledger uses unsupported source fingerprint contract `
      + `${String(record.sourceFingerprintContractId)}.`,
    )
  }
  const decisions = Array.isArray(record.decisions)
    ? record.decisions
    : fail('semanticKindLedger.decisions must be an array.')

  const rawLandscapeRecord = asRecord(rawLandscape, 'landscape')
  const rawGoals = Array.isArray(rawLandscapeRecord.goals)
    ? rawLandscapeRecord.goals
    : fail('landscape.goals must be an array.')
  const rawGoalById = new Map<string, Record<string, unknown>>()
  rawGoals.forEach((rawGoal, index) => {
    const goal = asRecord(rawGoal, `landscape.goals[${index}]`)
    const goalId = nonEmptyString(goal.id, `landscape.goals[${index}].id`)
    if (rawGoalById.has(goalId)) fail(`duplicate canonical goal ID ${goalId}.`)
    rawGoalById.set(goalId, goal)
  })
  const canonicalGoalIds = new Set(rawGoalById.keys())
  const semanticKindByGoalId = new Map<string, string>()
  const actualCounts = new Map<string, number>([...SEMANTIC_KINDS].map((kind) => [kind, 0]))
  decisions.forEach((rawDecision, index) => {
    const decision = asRecord(rawDecision, `semanticKindLedger.decisions[${index}]`)
    const goalId = nonEmptyString(decision.goalId, `semanticKindLedger.decisions[${index}].goalId`)
    const semanticKind = nonEmptyString(
      decision.semanticKind,
      `semanticKindLedger.decisions[${index}].semanticKind`,
    )
    if (!SEMANTIC_KINDS.has(semanticKind)) {
      fail(`semantic-kind ledger has unsupported semanticKind ${semanticKind} for ${goalId}.`)
    }
    if (decision.decisionStatus !== 'authoritative') {
      fail(`semantic-kind decision for ${goalId} is not authoritative.`)
    }
    if (!canonicalGoalIds.has(goalId)) {
      fail(`semantic-kind ledger references unknown goal ${goalId}.`)
    }
    if (semanticKindByGoalId.has(goalId)) {
      fail(`semantic-kind ledger contains duplicate decision for ${goalId}.`)
    }
    const currentFingerprint = fingerprintSemanticKindSourceGoal(rawGoalById.get(goalId)!)
    if (decision.sourceFingerprint !== currentFingerprint) {
      fail(`stale semantic-kind decision for goal ${goalId}; expected ${currentFingerprint}.`)
    }
    semanticKindByGoalId.set(goalId, semanticKind)
    actualCounts.set(semanticKind, (actualCounts.get(semanticKind) ?? 0) + 1)
  })

  const missingGoalIds = [...canonicalGoalIds]
    .filter((goalId) => !semanticKindByGoalId.has(goalId))
  if (missingGoalIds.length > 0) {
    fail(`semantic-kind ledger has no authoritative decision for ${missingGoalIds.slice(0, 10).join(', ')}${missingGoalIds.length > 10 ? ' ...' : ''}.`)
  }

  const declaredCounts = asRecord(record.counts, 'semanticKindLedger.counts')
  SEMANTIC_KINDS.forEach((semanticKind) => {
    if (declaredCounts[semanticKind] !== actualCounts.get(semanticKind)) {
      fail(`semantic-kind ledger count for ${semanticKind} does not match its decisions.`)
    }
  })
  if (declaredCounts.total !== decisions.length || decisions.length !== canonicalGoalIds.size) {
    fail('semantic-kind ledger total count must match exactly every canonical goal.')
  }

  return { semanticKindByGoalId, ledgerId }
}

const parseGoalVisualizationQa = (
  value: unknown,
  landscapeId: string,
  assetDigestsByUrl: Readonly<Record<string, string>>,
): Map<string, GoalVisualizationQaRecord> => {
  const record = asRecord(value, 'goalVisualizationQa')
  const records = Array.isArray(record.records)
    ? record.records
    : fail('goalVisualizationQa.records must be an array.')
  const recordsByGoalId = new Map<string, GoalVisualizationQaRecord>()
  const seenGoalIds = new Set<string>()
  records.forEach((rawQaRecord, index) => {
    const qaRecord = asRecord(rawQaRecord, `goalVisualizationQa.records[${index}]`)
    const recordLandscapeId = nonEmptyString(
      qaRecord.landscapeId,
      `goalVisualizationQa.records[${index}].landscapeId`,
    )
    if (recordLandscapeId !== landscapeId) {
      fail(`goal-visualization QA record ${index} targets ${recordLandscapeId}, expected ${landscapeId}.`)
    }
    const goalId = nonEmptyString(qaRecord.goalId, `goalVisualizationQa.records[${index}].goalId`)
    if (seenGoalIds.has(goalId)) fail(`goal-visualization QA contains duplicate record for ${goalId}.`)
    seenGoalIds.add(goalId)
    if (qaRecord.visualizationState !== 'available') return
    const ledgerAssetSha256 = sha256Digest(
      qaRecord.assetSha256,
      `goalVisualizationQa.records[${index}].assetSha256`,
    )
    const imageUrl = nonEmptyString(
      qaRecord.imageUrl,
      `goalVisualizationQa.records[${index}].imageUrl`,
    )
    const assetSha256 = sha256Digest(
      assetDigestsByUrl[imageUrl],
      `goalVisualization asset digest for ${imageUrl}`,
    )
    const qaMatchesCurrentAsset = ledgerAssetSha256 === assetSha256
    const humanApproved = qaRecord.humanApproved === 'yes'
    const humanRejected = qaRecord.humanIssueIdentified === 'yes'
    const aiStatus = aiApprovalStatus(qaRecord)
    const approvedForPublication = qaMatchesCurrentAsset && humanApproved && !humanRejected
    const qaStatus: GoalBookVisualizationQaStatus = approvedForPublication
      ? 'approved'
      : qaMatchesCurrentAsset && (humanRejected || aiStatus === 'rejected')
        ? 'rejected'
        : 'review_candidate'
    recordsByGoalId.set(goalId, {
      goalId,
      imageUrl,
      assetSha256,
      qaStatus,
      approvedForPublication,
    })
  })
  return recordsByGoalId
}

const parseEvidenceReviewSources = (
  sources: GoalBookEvidenceReviewBuildSource[],
  configuredPaths: string[],
  landscape: CanonicalAuthoringLandscape,
  semanticKindByGoalId: ReadonlyMap<string, string>,
  qaRecordsByGoalId: ReadonlyMap<string, GoalVisualizationQaRecord>,
): EvidenceReviewParseResult => {
  if (!Array.isArray(sources)) fail('evidenceReviewSources must be an array.')
  if (sources.length !== configuredPaths.length) {
    fail('evidenceReviewSources must match config.evidenceReviewPaths exactly.')
  }

  const goalById = buildCanonicalGraphIndex(landscape).goalById
  const summaryByGoalId = new Map<string, GoalBookEvidenceReviewSummary>()
  const parsedSources: GoalBookEvidenceReviewSource[] = []

  sources.forEach((source, sourceIndex) => {
    const sourceRecord = asRecord(source, `evidenceReviewSources[${sourceIndex}]`)
    const path = nonEmptyString(sourceRecord.path, `evidenceReviewSources[${sourceIndex}].path`)
    if (path !== configuredPaths[sourceIndex]) {
      fail(`evidenceReviewSources[${sourceIndex}].path does not match config.evidenceReviewPaths.`)
    }
    const text = nonEmptyString(sourceRecord.text, `evidenceReviewSources[${sourceIndex}].text`)
    const records = text
      .split(/\r?\n/u)
      .map((line, lineIndex) => ({ line: line.trim(), lineNumber: lineIndex + 1 }))
      .filter(({ line }) => line !== '')
      .map(({ line, lineNumber }) => parseJson(line, `${path}:${lineNumber}`))
    if (records.length === 0) fail(`evidence review source ${path} contains no records.`)
    parsedSources.push({ path, digest: digest(records) })

    records.forEach((rawRecord, recordIndex) => {
      const label = `${path} record ${recordIndex + 1}`
      const schemaValidator = cachedEvidenceSchemaValidator
        ?? (cachedEvidenceSchemaValidator = createSchemaValidator(
          GOAL_EVIDENCE_PROFILE_SCHEMA_PATH,
          true,
        ))
      if (!schemaValidator.validate(rawRecord)) {
        fail(`${label} violates the closed goal-evidence schema: ${schemaValidator.ajv.errorsText(
          schemaValidator.validate.errors,
          { separator: '; ' },
        )}.`)
      }
      const record = rawRecord as GoalEvidenceReviewRecord
      if (record.ruleVersion !== GOAL_BOOK_GOAL_FINGERPRINT_RULE_VERSION) {
        fail(`${label}.ruleVersion must be ${GOAL_BOOK_GOAL_FINGERPRINT_RULE_VERSION}.`)
      }
      if (record.landscapeId !== landscape.landscapeId) {
        fail(`${label} targets ${record.landscapeId}, expected ${landscape.landscapeId}.`)
      }
      const goalId = record.goalId
      if (summaryByGoalId.has(goalId)) fail(`duplicate evidence review record for ${goalId}.`)
      const goal = goalById.get(goalId)
        ?? fail(`${label} references unknown goal ${goalId}.`)
      const semanticKind = semanticKindByGoalId.get(goalId)
        ?? fail(`${label} references unclassified goal ${goalId}.`)

      const resourceDigests: Record<string, string> = {}
      const qaRecord = qaRecordsByGoalId.get(goalId)
      if (qaRecord) resourceDigests[qaRecord.imageUrl] = qaRecord.assetSha256
      const semanticErrors = validateGoalEvidenceRecordSemantics(
        record,
        goal as unknown as LearningGoal,
        resourceDigests,
        semanticKind,
      )
      if (semanticErrors.length > 0) {
        fail(`${label} violates goal-evidence semantics: ${semanticErrors.join(' | ')}.`)
      }
      summaryByGoalId.set(goalId, {
        reviewId: record.reviewId,
        status: record.status,
        reviewInputFingerprint: record.reviewInputFingerprint,
        profileFingerprint: record.profileFingerprint,
        evidenceLevel: record.evidenceLevel,
        maximumClaimScope: record.maximumClaimScope,
      })
    })
  })

  return { summaryByGoalId, sources: parsedSources }
}

const normalizeScope = (scope: Record<string, unknown>): Record<string, string> => {
  const normalized: Record<string, string> = {}
  Object.entries(scope)
    .sort(([left], [right]) => compareStrings(left, right))
    .forEach(([key, value]) => {
      if (typeof value === 'string' && value.trim() !== '') normalized[key] = value.trim()
    })
  return normalized
}

const goalAnchor = (goalId: string): string => {
  if (!SAFE_GOAL_ID_PATTERN.test(goalId)) {
    return fail(`goal ID ${JSON.stringify(goalId)} cannot form the required goal-<id> anchor.`)
  }
  return `goal-${goalId}`
}

const collectTargetAtomicGoals = (
  roots: CompiledCompositionPreviewNode[],
  landscape: CanonicalAuthoringLandscape,
): TargetGoalCollection => {
  const goalById = buildCanonicalGraphIndex(landscape).goalById
  const occurrences: TargetGoalOccurrence[] = []
  const chapterDrafts: GoalBookChapterDraft[] = []
  const chapterById = new Map<string, GoalBookChapterDraft>()
  let viewOrder = 0

  const enterChapter = (
    chapterId: string,
    label: string,
    parentChapterId: string | null,
  ) => {
    const existing = chapterById.get(chapterId)
    if (existing) {
      fail(`compiled composition produces duplicate chapter ID ${chapterId}.`)
    }
    const draft = { chapterId, label, parentChapterId }
    chapterById.set(chapterId, draft)
    chapterDrafts.push(draft)
  }

  const visit = (
    node: CompiledCompositionPreviewNode,
    breadcrumbs: string[],
    chapterIds: string[],
  ) => {
    if (node.kind === 'structure') {
      const chapterId = node.runtimeId
      enterChapter(chapterId, node.label, chapterIds.at(-1) ?? null)
      const nextBreadcrumbs = [...breadcrumbs, node.label]
      const nextChapterIds = [...chapterIds, chapterId]
      node.children.forEach((child) => visit(child, nextBreadcrumbs, nextChapterIds))
      return
    }

    const goalId = nonEmptyString(node.sourceGoalId, `compiled goal ${node.runtimeId}.sourceGoalId`)
    const goal = goalById.get(goalId)
      ?? fail(`compiled composition references missing goal ${goalId}.`)
    if (resolveCanonicalNodeType(goal) === 'atomic') {
      occurrences.push({ goalId, breadcrumbs, chapterIds, viewOrder })
      viewOrder += 1
      return
    }

    const chapterId = `goal:${goalId}`
    enterChapter(chapterId, node.label, chapterIds.at(-1) ?? null)
    const nextBreadcrumbs = [...breadcrumbs, node.label]
    const nextChapterIds = [...chapterIds, chapterId]
    node.children.forEach((child) => visit(child, nextBreadcrumbs, nextChapterIds))
  }

  roots.forEach((root) => visit(root, [], []))
  if (occurrences.length === 0) fail('compiled target projection contains no atomic goals.')

  const seen = new Set<string>()
  occurrences.forEach(({ goalId }) => {
    if (seen.has(goalId)) fail(`target atomic goal ${goalId} appears more than once.`)
    seen.add(goalId)
  })
  return { occurrences, chapterDrafts }
}

const mergeTargetCollections = (
  sources: CompiledGoalBookViewSource[],
  navigationOwnership: typeof GOAL_BOOK_ATLAS_NAVIGATION_OWNERSHIP,
  subject: string,
): TargetGoalCollection => {
  if (navigationOwnership !== GOAL_BOOK_ATLAS_NAVIGATION_OWNERSHIP) {
    fail(`unsupported atlas navigation ownership ${navigationOwnership}.`)
  }

  const occurrences: TargetGoalOccurrence[] = []
  const chapterDrafts: GoalBookChapterDraft[] = []
  const chapterByPath = new Map<string, GoalBookChapterDraft>()
  const breadcrumbPathsByGoalId = new Map<string, string[][]>()

  sources.forEach(({ targetCollection }) => targetCollection.occurrences.forEach((occurrence) => {
    const withoutSubjectRoot = occurrence.breadcrumbs[0] === subject
      ? occurrence.breadcrumbs.slice(1)
      : occurrence.breadcrumbs
    const paths = breadcrumbPathsByGoalId.get(occurrence.goalId) ?? []
    paths.push(withoutSubjectRoot)
    breadcrumbPathsByGoalId.set(occurrence.goalId, paths)
  }))

  const commonSuffix = (paths: string[][]): string[] => {
    const first = paths[0] ?? []
    let suffixLength = 0
    while (
      suffixLength < first.length
      && paths.every((path) => (
        path.length > suffixLength
        && path[path.length - suffixLength - 1] === first[first.length - suffixLength - 1]
      ))
    ) suffixLength += 1
    return suffixLength === 0 ? [] : first.slice(first.length - suffixLength)
  }

  const enterChapterPath = (labels: string[]): string[] => labels.map((label, index) => {
    const pathLabels = labels.slice(0, index + 1)
    const pathKey = pathLabels.join('\0')
    const existing = chapterByPath.get(pathKey)
    if (existing) return existing.chapterId
    const parentPathKey = pathLabels.slice(0, -1).join('\0')
    const parentChapterId = index === 0
      ? null
      : chapterByPath.get(parentPathKey)?.chapterId
        ?? fail(`cannot resolve atlas parent chapter path ${parentPathKey}.`)
    const chapter = {
      chapterId: `atlas:${digest(pathLabels).slice('sha256:'.length, 'sha256:'.length + 20)}`,
      label,
      parentChapterId,
    }
    chapterByPath.set(pathKey, chapter)
    chapterDrafts.push(chapter)
    return chapter.chapterId
  })

  breadcrumbPathsByGoalId.forEach((paths, goalId) => {
    const breadcrumbs = [subject, ...commonSuffix(paths)]
    occurrences.push({
      goalId,
      breadcrumbs,
      chapterIds: enterChapterPath(breadcrumbs),
      viewOrder: occurrences.length,
    })
  })
  if (occurrences.length === 0) fail('composition-view source union contains no atomic goals.')
  return { occurrences, chapterDrafts }
}

const normalizeAtlasApplicability = (
  sources: CompiledGoalBookViewSource[],
  targetGoalIds: ReadonlySet<string>,
  expectedJurisdictions: string[],
  durationPolicyByJurisdiction: ReadonlyMap<string, GoalBookDurationModelPolicyDecision>,
): Map<string, GoalBookApplicabilityGroup[]> => {
  const jurisdictionSet = new Set(expectedJurisdictions)
  const sourceJurisdictions = new Set<string>()
  const directSekiJurisdictions = new Set<string>()
  const upperIdsByJurisdiction = new Map<string, Set<string>>()
  const scopeKeysByGoalId = new Map<string, Set<string>>()

  const scopeKey = (
    jurisdiction: string,
    scope: GoalBookApplicabilityScope,
  ) => [jurisdiction, scope.stage, scope.durationModel ?? '', scope.courseProfile ?? ''].join('\0')
  const addScope = (
    goalId: string,
    jurisdiction: string,
    scope: GoalBookApplicabilityScope,
  ) => {
    if (!targetGoalIds.has(goalId)) return
    const keys = scopeKeysByGoalId.get(goalId) ?? new Set<string>()
    keys.add(scopeKey(jurisdiction, scope))
    scopeKeysByGoalId.set(goalId, keys)
  }

  sources.forEach(({ view, curricularAtomicGoalIds, path }) => {
    const jurisdiction = optionalString(view.scope.jurisdiction)
      ?? fail(`atlas source ${path} must have a jurisdiction.`)
    if (!jurisdictionSet.has(jurisdiction)) {
      fail(`atlas source ${path} has unexpected jurisdiction ${jurisdiction}.`)
    }
    sourceJurisdictions.add(jurisdiction)
    const stage = optionalString(view.scope.stage)
    if (stage === 'SekI') directSekiJurisdictions.add(jurisdiction)
    if (stage === 'SekII') {
      const upperIds = upperIdsByJurisdiction.get(jurisdiction) ?? new Set<string>()
      curricularAtomicGoalIds.forEach((goalId) => upperIds.add(goalId))
      upperIdsByJurisdiction.set(jurisdiction, upperIds)
    }
  })

  const missingJurisdictions = expectedJurisdictions.filter((id) => !sourceJurisdictions.has(id))
  if (missingJurisdictions.length > 0 || sourceJurisdictions.size !== jurisdictionSet.size) {
    fail(`atlas source manifest does not cover exactly its jurisdictions; missing ${missingJurisdictions.join(', ') || 'none'}.`)
  }

  sources.forEach(({ view, curricularAtomicGoalIds, path }) => {
    const jurisdiction = nonEmptyString(view.scope.jurisdiction, `${path}.scope.jurisdiction`)
    const stage = nonEmptyString(view.scope.stage, `${path}.scope.stage`)
    const duration = optionalString(view.scope.durationModel)
    const profile = optionalString(view.scope.courseProfile)
    if (duration && duration !== 'G8' && duration !== 'G9') {
      fail(`atlas source ${path} has unsupported durationModel ${duration}.`)
    }
    if (profile && profile !== 'GK' && profile !== 'LK') {
      fail(`atlas source ${path} has unsupported courseProfile ${profile}.`)
    }

    if (stage === 'SekI') {
      if (profile) fail(`atlas SekI source ${path} must not constrain courseProfile.`)
      const policy = durationPolicyByJurisdiction.get(jurisdiction)
        ?? fail(`atlas has no duration-model policy for ${jurisdiction}.`)
      const effectiveDurations = duration ? [duration as 'G8' | 'G9'] : policy.durationModels
      if (duration && !policy.durationModels.includes(duration as 'G8' | 'G9')) {
        fail(`atlas source ${path} contradicts the duration-model policy.`)
      }
      curricularAtomicGoalIds.forEach((goalId) => effectiveDurations.forEach((durationModel) => (
        addScope(goalId, jurisdiction, {
          stage: 'SekI',
          durationModel,
          courseProfile: null,
        })
      )))
      return
    }
    if (stage === 'SekII') {
      if (!profile) fail(`atlas SekII source ${path} must constrain courseProfile.`)
      const policy = durationPolicyByJurisdiction.get(jurisdiction)
        ?? fail(`atlas has no duration-model policy for ${jurisdiction}.`)
      const effectiveDurations: Array<'G8' | 'G9' | null> = duration
        ? [duration as 'G8' | 'G9']
        : policy.stage === 'SekI+SekII'
          ? policy.durationModels
          : [null]
      if (duration && (
        policy.stage !== 'SekI+SekII'
        || !policy.durationModels.includes(duration as 'G8' | 'G9')
      )) {
        fail(`atlas SekII source ${path} contradicts the duration-model policy.`)
      }
      curricularAtomicGoalIds.forEach((goalId) => effectiveDurations.forEach((durationModel) => (
        addScope(goalId, jurisdiction, {
          stage: 'SekII',
          durationModel,
          courseProfile: profile,
        })
      )))
      return
    }
    if (stage !== 'CrossStage') fail(`atlas source ${path} has unsupported stage ${stage}.`)

    // A CrossStage view is used only to recover Sek-I membership where the
    // jurisdiction has no authored Sek-I view. Authored Sek-II views identify
    // and remove the upper-secondary targets; profile is intentionally dropped
    // for the remaining lower-secondary scope.
    if (directSekiJurisdictions.has(jurisdiction)) return
    const upperIds = upperIdsByJurisdiction.get(jurisdiction)
      ?? fail(`atlas jurisdiction ${jurisdiction} has no authored SekII source.`)
    const policy = durationPolicyByJurisdiction.get(jurisdiction)
      ?? fail(`atlas has no duration-model policy for ${jurisdiction}.`)
    const effectiveDurations = duration ? [duration as 'G8' | 'G9'] : policy.durationModels
    if (duration && !policy.durationModels.includes(duration as 'G8' | 'G9')) {
      fail(`atlas source ${path} contradicts the duration-model policy.`)
    }
    curricularAtomicGoalIds.forEach((goalId) => {
      if (upperIds.has(goalId)) return
      effectiveDurations.forEach((durationModel) => addScope(goalId, jurisdiction, {
        stage: 'SekI',
        durationModel,
        courseProfile: null,
      }))
    })
  })

  const result = new Map<string, GoalBookApplicabilityGroup[]>()
  targetGoalIds.forEach((goalId) => {
    const keys = [...(scopeKeysByGoalId.get(goalId) ?? [])].sort(compareStrings)
    if (keys.length === 0) fail(`atlas target goal ${goalId} has no effective applicability scope.`)
    const scopesByJurisdiction = new Map<string, GoalBookApplicabilityScope[]>()
    keys.forEach((key) => {
      const [jurisdiction, stage, durationModel, courseProfile] = key.split('\0')
      const scopes = scopesByJurisdiction.get(jurisdiction) ?? []
      scopes.push({
        stage: stage as 'SekI' | 'SekII',
        durationModel: (durationModel || null) as 'G8' | 'G9' | null,
        courseProfile: (courseProfile || null) as 'GK' | 'LK' | null,
      })
      scopesByJurisdiction.set(jurisdiction, scopes)
    })
    result.set(goalId, [...scopesByJurisdiction.entries()]
      .sort(([left], [right]) => compareStrings(left, right))
      .map(([jurisdiction, scopes]) => ({ jurisdiction, scopes })))
  })
  return result
}

const directRequires = (
  goal: CanonicalAuthoringGoal,
  goalById: ReadonlyMap<string, CanonicalAuthoringGoal>,
): string[] => {
  const result: string[] = []
  const seen = new Set<string>()
  goal.requires.forEach((rawReference) => {
    const goalId = normalizeGoalRef(rawReference)
    if (!goalId || !goalById.has(goalId)) {
      fail(`goal ${goal.id} has unresolved direct prerequisite ${JSON.stringify(rawReference)}.`)
    }
    if (!seen.has(goalId)) {
      seen.add(goalId)
      result.push(goalId)
    }
  })
  return result
}

const topologicallyOrderTargets = (
  occurrences: TargetGoalOccurrence[],
  landscape: CanonicalAuthoringLandscape,
): string[] => {
  const graph = buildCanonicalGraphIndex(landscape)
  const targetIds = new Set(occurrences.map(({ goalId }) => goalId))
  const viewOrderById = new Map(occurrences.map(({ goalId, viewOrder }) => [goalId, viewOrder]))
  const prerequisiteIdsByGoalId = new Map<string, string[]>()
  const dependentIdsByPrerequisiteId = new Map<string, string[]>()
  const indegreeById = new Map<string, number>()

  const compareTargetIds = (leftId: string, rightId: string) => {
    const byView = (viewOrderById.get(leftId) ?? Number.MAX_SAFE_INTEGER)
      - (viewOrderById.get(rightId) ?? Number.MAX_SAFE_INTEGER)
    return byView || compareStrings(leftId, rightId)
  }

  occurrences.forEach(({ goalId }) => {
    const goal = graph.goalById.get(goalId)
      ?? fail(`target goal ${goalId} does not exist.`)
    const prerequisites = directRequires(goal, graph.goalById)
      .filter((prerequisiteId) => targetIds.has(prerequisiteId))
    prerequisiteIdsByGoalId.set(goalId, prerequisites)
    indegreeById.set(goalId, prerequisites.length)
    prerequisites.forEach((prerequisiteId) => {
      const dependents = dependentIdsByPrerequisiteId.get(prerequisiteId) ?? []
      dependents.push(goalId)
      dependentIdsByPrerequisiteId.set(prerequisiteId, dependents)
    })
  })

  const ready = occurrences
    .map(({ goalId }) => goalId)
    .filter((goalId) => (indegreeById.get(goalId) ?? 0) === 0)
    .sort(compareTargetIds)
  const ordered: string[] = []

  while (ready.length > 0) {
    const goalId = ready.shift()
    if (!goalId) break
    ordered.push(goalId)
    const dependents = [...(dependentIdsByPrerequisiteId.get(goalId) ?? [])].sort(compareTargetIds)
    dependents.forEach((dependentId) => {
      const nextIndegree = (indegreeById.get(dependentId) ?? 0) - 1
      indegreeById.set(dependentId, nextIndegree)
      if (nextIndegree === 0) {
        ready.push(dependentId)
        ready.sort(compareTargetIds)
      }
    })
  }

  if (ordered.length !== occurrences.length) {
    const cyclicGoalIds = occurrences
      .map(({ goalId }) => goalId)
      .filter((goalId) => (indegreeById.get(goalId) ?? 0) > 0)
      .sort(compareTargetIds)
    fail(`direct requires cycle inside the target projection: ${cyclicGoalIds.join(', ')}.`)
  }

  return ordered
}

const primaryVisualization = (
  goal: CanonicalAuthoringGoal,
  qaRecordsByGoalId: ReadonlyMap<string, GoalVisualizationQaRecord>,
  mode: GoalBookPublicationMode,
): GoalBookVisualization | null => {
  const rawLinks = Array.isArray(goal.resourceLinks) ? goal.resourceLinks : []
  const primaryLinks = rawLinks
    .map((link, index) => ({ record: asRecord(link, `goal ${goal.id} resourceLinks[${index}]`), index }))
    .filter(({ record }) => record.type === 'goal-visualization' && record.role === 'primary')

  if (primaryLinks.length > 1) {
    fail(`goal ${goal.id} has more than one primary goal visualization.`)
  }
  if (primaryLinks.length === 0) return null

  const link = primaryLinks[0].record
  if (link.resourceType !== 'image') {
    fail(`goal ${goal.id} primary visualization must have resourceType image.`)
  }
  const linkedGoalId = optionalString(link.skillpilotId)
  if (linkedGoalId && linkedGoalId !== goal.id) {
    fail(`goal ${goal.id} primary visualization carries mismatching skillpilotId ${linkedGoalId}.`)
  }
  const qaRecord = qaRecordsByGoalId.get(goal.id)
    ?? fail(`goal ${goal.id} primary visualization has no current available QA record.`)
  if (qaRecord.imageUrl !== link.url) {
    fail(`goal ${goal.id} primary visualization URL does not match its QA record.`)
  }
  if (mode === 'public' && !qaRecord.approvedForPublication) return null
  return {
    resourceType: 'image',
    title: nonEmptyString(link.title, `goal ${goal.id} primary visualization title`),
    url: nonEmptyString(link.url, `goal ${goal.id} primary visualization URL`),
    ...(optionalString(link.altText) ? { altText: optionalString(link.altText) } : {}),
    originalDigest: qaRecord.assetSha256,
    qaStatus: qaRecord.qaStatus,
    approvedForPublication: qaRecord.approvedForPublication,
  }
}

const resolvedInternalReference = (
  goalId: string,
  goalById: ReadonlyMap<string, CanonicalAuthoringGoal>,
  pageNumberById: ReadonlyMap<string, number>,
): GoalBookReference => {
  const goal = goalById.get(goalId)
    ?? fail(`cannot resolve in-book reference ${goalId}.`)
  const pageNumber = pageNumberById.get(goalId)
  if (pageNumber === undefined) fail(`cannot resolve in-book reference ${goalId}.`)
  return {
    goalId,
    title: nonEmptyString(goal.title, `goal ${goalId} title`),
    anchor: goalAnchor(goalId),
    pageNumber,
  }
}

const resolvedExternalReference = (
  goalId: string,
  goalById: ReadonlyMap<string, CanonicalAuthoringGoal>,
  referenceLandscapeId: string | undefined,
  canonicalUrl: string | null,
  mode: GoalBookPublicationMode,
): GoalBookExternalReference => {
  const goal = goalById.get(goalId)
    ?? fail(`cannot resolve external prerequisite ${goalId}.`)
  if (mode === 'public' && canonicalUrl === null) {
    fail(`public model cannot resolve external canonical URL for ${goalId}.`)
  }
  return {
    goalId,
    title: nonEmptyString(goal.title, `goal ${goalId} title`),
    ...(referenceLandscapeId ? { landscapeId: referenceLandscapeId } : {}),
    canonicalUrl,
  }
}

const parseSourceManifest = (value: unknown): GoalBookSourceManifest => {
  const validator = cachedSourceManifestSchemaValidator
    ?? (cachedSourceManifestSchemaValidator = createSchemaValidator(
      GOAL_BOOK_SOURCE_MANIFEST_SCHEMA_PATH,
    ))
  if (!validator.validate(value)) {
    fail(`composition-view source manifest violates its closed JSON Schema: ${validator.ajv.errorsText(
      validator.validate.errors,
      { separator: '; ' },
    )}.`)
  }
  const manifest = value as GoalBookSourceManifest
  if ([...manifest.expectedJurisdictions].sort(compareStrings).join('\0')
    !== manifest.expectedJurisdictions.join('\0')) {
    fail('composition-view source manifest expectedJurisdictions must be sorted.')
  }
  if ([...manifest.sourcePaths].sort(compareStrings).join('\0') !== manifest.sourcePaths.join('\0')) {
    fail('composition-view source manifest sourcePaths must be sorted.')
  }
  return manifest
}

export const parseSubjectDurationModelPolicy = (
  value: unknown,
  subject: string,
  expectedJurisdictions: string[],
  sourceViews: readonly GoalBookDurationPolicyViewSource[],
): Map<string, GoalBookDurationModelPolicyDecision> => {
  const normalizedSubject = nonEmptyString(subject, 'landscape.subject')
  const record = asRecord(value, 'durationModelPolicy')
  if (record.schemaVersion !== 1) fail('durationModelPolicy.schemaVersion must be 1.')
  const sourceByViewId = new Map<string, GoalBookDurationPolicyViewSource>()
  sourceViews.forEach((source, index) => {
    const viewId = nonEmptyString(source.viewId, `durationPolicySourceViews[${index}].viewId`)
    if (sourceByViewId.has(viewId)) {
      fail(`atlas source manifest contains duplicate composition view ID ${viewId}.`)
    }
    sourceByViewId.set(viewId, source)
  })
  const decisions = Array.isArray(record.decisions)
    ? record.decisions
    : fail('durationModelPolicy.decisions must be an array.')
  const byJurisdiction = new Map<string, GoalBookDurationModelPolicyDecision>()
  decisions.forEach((rawDecision, index) => {
    const decision = asRecord(rawDecision, `durationModelPolicy.decisions[${index}]`)
    if (decision.subject !== normalizedSubject) return
    if (decision.status !== 'reviewed') {
      fail(`${normalizedSubject} duration-model decision ${index} is not reviewed.`)
    }
    const jurisdiction = nonEmptyString(
      decision.jurisdiction,
      `durationModelPolicy.decisions[${index}].jurisdiction`,
    )
    if (byJurisdiction.has(jurisdiction)) {
      fail(`duration-model policy contains duplicate ${normalizedSubject} decision for ${jurisdiction}.`)
    }
    const durationModels = uniqueStringArray(
      decision.durationModels,
      `durationModelPolicy.decisions[${index}].durationModels`,
    )
    if (durationModels.some((duration) => duration !== 'G8' && duration !== 'G9')) {
      fail(`duration-model policy has unsupported duration for ${jurisdiction}.`)
    }
    const normalizedDurations = durationModels as Array<'G8' | 'G9'>
    if ([...normalizedDurations].sort(compareStrings).join('\0') !== normalizedDurations.join('\0')) {
      fail(`duration-model policy durations for ${jurisdiction} must be sorted.`)
    }
    const policyDecision = nonEmptyString(
      decision.decision,
      `durationModelPolicy.decisions[${index}].decision`,
    )
    if (![
      'single-duration-source',
      'duration-neutral-projection',
      'dual-duration-different-projection',
    ].includes(policyDecision)) {
      fail(`duration-model policy has unsupported decision for ${jurisdiction}.`)
    }
    if (policyDecision === 'single-duration-source' && normalizedDurations.length !== 1) {
      fail(`single-duration policy for ${jurisdiction} must declare exactly one duration.`)
    }
    if (
      policyDecision === 'duration-neutral-projection'
      && normalizedDurations.join('\0') !== 'G8\0G9'
    ) {
      fail(`duration-neutral policy for ${jurisdiction} must declare G8 and G9 exactly.`)
    }
    const stage = nonEmptyString(
      decision.stage,
      `durationModelPolicy.decisions[${index}].stage`,
    )
    if (stage !== 'SekI' && stage !== 'SekI+SekII') {
      fail(`duration-model policy has unsupported stage ${stage} for ${jurisdiction}.`)
    }
    const compositionViewIds = Array.isArray(decision.compositionViewIds)
      ? uniqueStringArray(
        decision.compositionViewIds,
        `durationModelPolicy.decisions[${index}].compositionViewIds`,
      )
      : []
    compositionViewIds.forEach((viewId) => {
      if (!sourceByViewId.has(viewId)) {
        fail(`duration-model policy for ${jurisdiction} references unbound composition view ${viewId}.`)
      }
    })
    if (policyDecision === 'dual-duration-different-projection') {
      if (normalizedDurations.join('\0') !== 'G8\0G9' || compositionViewIds.length === 0) {
        fail(`dual-duration policy for ${jurisdiction} lacks G8/G9 view bindings.`)
      }
    } else if (compositionViewIds.length > 0) {
      fail(`${policyDecision} policy for ${jurisdiction} must not bind duration-specific views.`)
    }
    byJurisdiction.set(jurisdiction, {
      jurisdiction,
      stage,
      durationModels: normalizedDurations,
      decision: policyDecision as GoalBookDurationModelPolicyDecision['decision'],
      compositionViewIds,
    })
  })
  const actualJurisdictions = [...byJurisdiction.keys()].sort(compareStrings)
  if (actualJurisdictions.join('\0') !== expectedJurisdictions.join('\0')) {
    fail(`duration-model policy must contain exactly one reviewed ${normalizedSubject} decision per atlas jurisdiction.`)
  }

  const durationRole = (source: GoalBookDurationPolicyViewSource): string => {
    if (source.stage === 'SekI' && source.courseProfile === null) return 'SekI'
    if (source.stage === 'CrossStage' && source.courseProfile === 'GK') return 'CrossStage:GK'
    if (source.stage === 'CrossStage' && source.courseProfile === 'LK') return 'CrossStage:LK'
    return fail(
      `duration-specific atlas source ${source.viewId} has unsupported role ${source.stage}/${source.courseProfile ?? 'none'}.`,
    )
  }
  expectedJurisdictions.forEach((jurisdiction) => {
    const decision = byJurisdiction.get(jurisdiction)
      ?? fail(`atlas has no duration-model policy for ${jurisdiction}.`)
    const durationSources = sourceViews.filter((source) => (
      source.jurisdiction === jurisdiction && source.durationModel !== null
    ))
    if (decision.decision !== 'dual-duration-different-projection') {
      if (durationSources.length > 0) {
        fail(
          `${decision.decision} policy for ${jurisdiction} must not admit duration-specific atlas sources.`,
        )
      }
      return
    }

    const declaredSources = decision.compositionViewIds.map((viewId) => {
      const source = sourceByViewId.get(viewId)
        ?? fail(`duration-model policy for ${jurisdiction} references unbound composition view ${viewId}.`)
      if (source.jurisdiction !== jurisdiction) {
        fail(`duration-model policy for ${jurisdiction} binds foreign view ${viewId} from ${source.jurisdiction}.`)
      }
      if (source.durationModel === null) {
        fail(`dual-duration policy for ${jurisdiction} binds duration-neutral view ${viewId}.`)
      }
      return source
    })
    const declaredIds = [...decision.compositionViewIds].sort(compareStrings)
    const actualIds = durationSources.map(({ viewId }) => viewId).sort(compareStrings)
    if (declaredIds.join('\0') !== actualIds.join('\0')) {
      fail(
        `dual-duration policy for ${jurisdiction} must bind exactly every duration-specific atlas source.`,
      )
    }

    const actualRoleKeys = declaredSources
      .map((source) => `${source.durationModel}\0${durationRole(source)}`)
      .sort(compareStrings)
    const expectedRoleKeys = (['G8', 'G9'] as const)
      .flatMap((durationModel) => [
        `${durationModel}\0CrossStage:GK`,
        `${durationModel}\0CrossStage:LK`,
        `${durationModel}\0SekI`,
      ])
      .sort(compareStrings)
    if (
      actualRoleKeys.length !== expectedRoleKeys.length
      || actualRoleKeys.join('\0') !== expectedRoleKeys.join('\0')
    ) {
      fail(
        `dual-duration policy for ${jurisdiction} must bind exactly one SekI, CrossStage/GK, and CrossStage/LK view for each of G8 and G9.`,
      )
    }
  })
  return byJurisdiction
}

const compileGoalBookViewSource = (
  source: GoalBookCompositionViewBuildSource,
  landscape: CanonicalAuthoringLandscape,
  semanticKindByGoalId: ReadonlyMap<string, string>,
): CompiledGoalBookViewSource => {
  const path = nonEmptyString(source.path, 'composition-view source path')
  const view = normalizeCompositionView(source.view)
  if (view.landscapeId !== landscape.landscapeId) {
    fail(`composition view ${path} landscapeId ${view.landscapeId} does not match ${landscape.landscapeId}.`)
  }
  const compilation = compileCompositionView(view, landscape)
  const errors = compilation.findings.filter(({ severity }) => severity === 'error')
  if (errors.length > 0) {
    fail(`invalid composition view ${path}: ${errors
      .map((finding) => `${finding.code}${finding.goalId ? ` ${finding.goalId}` : ''}: ${finding.message}`)
      .join(' | ')}`)
  }
  const targetCollection = collectTargetAtomicGoals(compilation.compiledRootNodes, landscape)
  const curricularAtomicGoalIds = new Set(targetCollection.occurrences
    .filter(({ goalId }) => semanticKindByGoalId.get(goalId) === 'curricularAtomic')
    .map(({ goalId }) => goalId))
  return { path, rawView: source.view, view, compilation, targetCollection, curricularAtomicGoalIds }
}

export const buildGoalBookModel = ({
  landscape: rawLandscape,
  compositionView: rawCompositionView,
  compositionViewManifest: rawCompositionViewManifest,
  compositionViewSources: rawCompositionViewSources,
  externalLandscapeSources: rawExternalLandscapeSources,
  durationModelPolicy: rawDurationModelPolicy,
  semanticKindLedger: rawSemanticKindLedger,
  goalVisualizationQa: rawGoalVisualizationQa,
  goalVisualizationAssetDigests,
  evidenceReviewSources: rawEvidenceReviewSources,
  config,
}: GoalBookBuildInput): GoalBookModel => {
  const bookId = nonEmptyString(config.bookId, 'config.bookId')
  const bookTitle = nonEmptyString(config.title, 'config.title')
  const landscapePath = nonEmptyString(config.landscapePath, 'config.landscapePath')
  const compositionViewPath = optionalString(config.compositionViewPath)
  const compositionViewManifestPath = optionalString(config.compositionViewManifestPath)
  if ((compositionViewPath ? 1 : 0) + (compositionViewManifestPath ? 1 : 0) !== 1) {
    fail('config must define exactly one of compositionViewPath or compositionViewManifestPath.')
  }
  const semanticKindLedgerPath = nonEmptyString(
    config.semanticKindLedgerPath,
    'config.semanticKindLedgerPath',
  )
  const goalVisualizationQaPath = nonEmptyString(
    config.goalVisualizationQaPath,
    'config.goalVisualizationQaPath',
  )
  const mode = publicationMode(config.publicationMode, 'config.publicationMode')
  const normalizedAtlasBaseUrl = atlasBaseUrl(config.atlasBaseUrl, 'config.atlasBaseUrl')
  const evidenceReviewPaths = uniqueStringArray(
    config.evidenceReviewPaths,
    'config.evidenceReviewPaths',
  )
  const externalLandscapePaths = config.externalLandscapePaths
    ? uniqueStringArray(config.externalLandscapePaths, 'config.externalLandscapePaths')
    : []
  const externalLandscapeSources = rawExternalLandscapeSources ?? []
  if (externalLandscapeSources.length !== externalLandscapePaths.length) {
    fail('externalLandscapeSources must match config.externalLandscapePaths exactly.')
  }
  externalLandscapeSources.forEach((source, index) => {
    if (source.path !== externalLandscapePaths[index]) {
      fail(`externalLandscapeSources[${index}].path does not match config.externalLandscapePaths.`)
    }
  })

  const resolvedExternalLandscapes = resolveExternalLandscapes(
    rawLandscape,
    externalLandscapeSources,
  )
  const {
    landscape,
    primaryGoalIds,
    externalLandscapeIdByGoalId,
    sourceBindings: externalLandscapeBindings,
  } = resolvedExternalLandscapes

  const locale = nonEmptyString((landscape as Record<string, unknown>).locale, 'landscape.locale')
  const landscapeId = nonEmptyString(landscape.landscapeId, 'landscape.landscapeId')

  const semanticKindLedger = parseSemanticKindLedger(
    rawSemanticKindLedger,
    rawLandscape,
    landscapeId,
    landscapePath,
  )
  const sourceManifest = compositionViewManifestPath
    ? parseSourceManifest(rawCompositionViewManifest)
    : null
  if (sourceManifest && sourceManifest.landscapeId !== landscapeId) {
    fail(`composition-view source manifest targets ${sourceManifest.landscapeId}, expected ${landscapeId}.`)
  }
  let compiledViewSources: CompiledGoalBookViewSource[]
  if (sourceManifest) {
    if (!Array.isArray(rawCompositionViewSources)) {
      fail('compositionViewSources must be provided for a source manifest.')
    }
    if (rawCompositionViewSources.length !== sourceManifest.sourcePaths.length) {
      fail('compositionViewSources must match source manifest paths exactly.')
    }
    compiledViewSources = rawCompositionViewSources.map((source, index) => {
      if (source.path !== sourceManifest.sourcePaths[index]) {
        fail(`compositionViewSources[${index}].path does not match the source manifest.`)
      }
      return compileGoalBookViewSource(source, landscape, semanticKindLedger.semanticKindByGoalId)
    })
  } else {
    if (rawCompositionView === undefined || !compositionViewPath) {
      fail('compositionView must be provided for a single-view build.')
    }
    compiledViewSources = [compileGoalBookViewSource(
      { path: compositionViewPath, view: rawCompositionView },
      landscape,
      semanticKindLedger.semanticKindByGoalId,
    )]
  }
  const viewId = sourceManifest?.manifestId ?? compiledViewSources[0].view.viewId
  const subject = sourceManifest
    ? nonEmptyString((landscape as Record<string, unknown>).subject, 'landscape.subject')
    : null
  const durationPolicyByJurisdiction = sourceManifest
    ? parseSubjectDurationModelPolicy(
      rawDurationModelPolicy,
      subject!,
      sourceManifest.expectedJurisdictions,
      compiledViewSources.map(({ view }) => ({
        viewId: view.viewId,
        jurisdiction: optionalString(view.scope.jurisdiction) ?? '',
        stage: optionalString(view.scope.stage) ?? '',
        durationModel: (optionalString(view.scope.durationModel) ?? null) as 'G8' | 'G9' | null,
        courseProfile: (optionalString(view.scope.courseProfile) ?? null) as 'GK' | 'LK' | null,
      })),
    )
    : null
  const targetCollection = sourceManifest
    ? mergeTargetCollections(compiledViewSources, sourceManifest.navigationOwnership, subject!)
    : compiledViewSources[0].targetCollection
  const compositionScope = sourceManifest
    ? { schoolForm: 'Gymnasium' }
    : compiledViewSources[0].view.scope
  const goalVisualizationQaRecords = parseGoalVisualizationQa(
    rawGoalVisualizationQa,
    landscapeId,
    goalVisualizationAssetDigests,
  )
  const evidenceReviews = parseEvidenceReviewSources(
    rawEvidenceReviewSources,
    evidenceReviewPaths,
    landscape,
    semanticKindLedger.semanticKindByGoalId,
    goalVisualizationQaRecords,
  )
  const projectedOccurrences = targetCollection.occurrences
  const occurrences = projectedOccurrences.filter(({ goalId }) => (
    semanticKindLedger.semanticKindByGoalId.get(goalId) === 'curricularAtomic'
  ))
  if (occurrences.length === 0) {
    fail(`edition ${GOAL_BOOK_EDITION} contains no target curricularAtomic goals.`)
  }
  if (sourceManifest && occurrences.length !== sourceManifest.expectedCurricularAtomicGoalCount) {
    fail(`atlas source union has ${occurrences.length} curricularAtomic targets; expected ${sourceManifest.expectedCurricularAtomicGoalCount}.`)
  }
  const excludedTargetGoals: GoalBookExcludedTarget[] = projectedOccurrences
    .filter(({ goalId }) => semanticKindLedger.semanticKindByGoalId.get(goalId) !== 'curricularAtomic')
    .map(({ goalId }) => {
      const goal = landscape.goals.find((candidate) => candidate.id === goalId)
        ?? fail(`cannot classify projected target goal ${goalId}.`)
      const semanticKind = semanticKindLedger.semanticKindByGoalId.get(goalId)
        ?? fail(`cannot classify projected target goal ${goalId}.`)
      return {
        goalId,
        title: nonEmptyString(goal.title, `goal ${goalId} title`),
        semanticKind,
        reason: 'not-curricular-atomic' as const,
      }
    })
  const occurrenceById = new Map(occurrences.map((occurrence) => [occurrence.goalId, occurrence]))
  const orderedGoalIds = topologicallyOrderTargets(occurrences, landscape)
  const pageNumberById = new Map(orderedGoalIds.map((goalId, index) => [goalId, index + 1]))
  const targetIds = new Set(orderedGoalIds)
  const applicabilityByGoalId = sourceManifest
    ? normalizeAtlasApplicability(
      compiledViewSources,
      targetIds,
      sourceManifest.expectedJurisdictions,
      durationPolicyByJurisdiction!,
    )
    : null
  const graph = buildCanonicalGraphIndex(landscape)
  const internalDependentsById = new Map<string, string[]>()
  const allDependentsById = new Map<string, string[]>()

  landscape.goals.filter(({ id }) => primaryGoalIds.has(id)).forEach((goal) => {
    directRequires(goal, graph.goalById).forEach((prerequisiteId) => {
      const dependents = allDependentsById.get(prerequisiteId) ?? []
      dependents.push(goal.id)
      allDependentsById.set(prerequisiteId, dependents)
    })
  })

  orderedGoalIds.forEach((goalId) => {
    const goal = graph.goalById.get(goalId)
      ?? fail(`target goal ${goalId} is missing after ordering.`)
    directRequires(goal, graph.goalById)
      .filter((prerequisiteId) => targetIds.has(prerequisiteId))
      .forEach((prerequisiteId) => {
        const dependents = internalDependentsById.get(prerequisiteId) ?? []
        dependents.push(goalId)
        internalDependentsById.set(prerequisiteId, dependents)
      })
  })

  const pagesWithoutFingerprints = orderedGoalIds.map((goalId, index) => {
    const goal = graph.goalById.get(goalId)
      ?? fail(`cannot materialize target goal ${goalId}.`)
    const occurrence = occurrenceById.get(goalId)
      ?? fail(`cannot materialize target goal ${goalId}.`)
    const allPrerequisiteIds = directRequires(goal, graph.goalById)
    const internalPrerequisiteIds = allPrerequisiteIds.filter((prerequisiteId) => targetIds.has(prerequisiteId))
    const externalPrerequisiteIds = allPrerequisiteIds.filter((prerequisiteId) => !targetIds.has(prerequisiteId))
    const compareByPage = (leftId: string, rightId: string) => (
      (pageNumberById.get(leftId) ?? Number.MAX_SAFE_INTEGER)
      - (pageNumberById.get(rightId) ?? Number.MAX_SAFE_INTEGER)
      || compareStrings(leftId, rightId)
    )
    const shortKey = optionalString(goal.shortKey)
    return {
      pageNumber: index + 1,
      goalId,
      ...(shortKey ? { shortKey } : {}),
      anchor: goalAnchor(goalId),
      title: nonEmptyString(goal.title, `goal ${goalId} title`),
      description: nonEmptyString(goal.description, `goal ${goalId} description`),
      breadcrumbs: [...occurrence.breadcrumbs],
      chapterIds: [...occurrence.chapterIds],
      ...(applicabilityByGoalId
        ? { applicability: applicabilityByGoalId.get(goalId)
          ?? fail(`cannot materialize applicability for ${goalId}.`) }
        : {}),
      requires: internalPrerequisiteIds
        .sort(compareByPage)
        .map((prerequisiteId) => resolvedInternalReference(prerequisiteId, graph.goalById, pageNumberById)),
      reverseRequires: [...(internalDependentsById.get(goalId) ?? [])]
        .sort(compareByPage)
        .map((dependentId) => resolvedInternalReference(dependentId, graph.goalById, pageNumberById)),
      externalPrerequisites: externalPrerequisiteIds
        .map((prerequisiteId) => {
          const referenceLandscapeId = externalLandscapeIdByGoalId.get(prerequisiteId)
          return resolvedExternalReference(
            prerequisiteId,
            graph.goalById,
            referenceLandscapeId,
            canonicalGoalUrl(normalizedAtlasBaseUrl, landscapeId, prerequisiteId),
            mode,
          )
        }),
      externalReverseRequires: [...(allDependentsById.get(goalId) ?? [])]
        .filter((dependentId) => !targetIds.has(dependentId))
        .sort(compareStrings)
        .map((dependentId) => resolvedExternalReference(
          dependentId,
          graph.goalById,
          undefined,
          canonicalGoalUrl(normalizedAtlasBaseUrl, landscapeId, dependentId),
          mode,
        )),
      visualization: primaryVisualization(goal, goalVisualizationQaRecords, mode),
      evidenceReview: evidenceReviews.summaryByGoalId.get(goalId) ?? null,
    }
  })

  const pages: GoalBookPage[] = pagesWithoutFingerprints.map((page) => {
    const goal = graph.goalById.get(page.goalId)
      ?? fail(`cannot fingerprint target goal ${page.goalId}.`)
    const effectiveSemanticKind = semanticKindLedger.semanticKindByGoalId.get(goal.id)
      ?? fail(`cannot bind authoritative semanticKind for target goal ${page.goalId}.`)
    const pageWithGoalFingerprint = {
      ...page,
      goalFingerprint: fingerprintGoalForEvidence(
        goal as unknown as LearningGoal,
        GOAL_BOOK_GOAL_FINGERPRINT_RULE_VERSION,
        effectiveSemanticKind,
      ),
    }
    return {
      ...pageWithGoalFingerprint,
      pageFingerprint: digest({
        modelSchemaVersion: GOAL_BOOK_MODEL_SCHEMA_VERSION,
        edition: GOAL_BOOK_EDITION,
        page: pageWithGoalFingerprint,
      }),
    }
  })

  const chapters: GoalBookChapter[] = targetCollection.chapterDrafts
    .map((chapter) => {
      const chapterPages = pages.filter((page) => page.chapterIds.includes(chapter.chapterId))
      return {
        ...chapter,
        goalIds: chapterPages.map(({ goalId }) => goalId),
        pageNumbers: chapterPages.map(({ pageNumber }) => pageNumber),
      }
    })
    .filter(({ goalIds }) => goalIds.length > 0)

  const modelWithoutDigest = {
    schemaVersion: GOAL_BOOK_MODEL_SCHEMA_VERSION,
    book: {
      id: bookId,
      title: bookTitle,
      locale,
      landscapeId,
      viewId,
      scope: normalizeScope(compositionScope),
      pageCount: pages.length,
      projectedAtomicGoalCount: projectedOccurrences.length,
      excludedTargetAtomicGoalCount: excludedTargetGoals.length,
      edition: GOAL_BOOK_EDITION,
      publicationMode: mode,
      atlasBaseUrl: normalizedAtlasBaseUrl ?? null,
      oneGoalPerPage: true as const,
    },
    source: {
      landscapePath,
      compositionViewPath: compositionViewPath ?? compositionViewManifestPath!,
      semanticKindLedgerPath,
      goalVisualizationQaPath,
      landscapeDigest: digest(rawLandscape),
      compositionViewDigest: digest(sourceManifest ? rawCompositionViewManifest : rawCompositionView),
      semanticKindLedgerDigest: digest(rawSemanticKindLedger),
      goalVisualizationQaDigest: digest(rawGoalVisualizationQa),
      ...(sourceManifest && compositionViewManifestPath ? {
        compositionViewManifestPath,
        compositionViewManifestDigest: digest(rawCompositionViewManifest),
        compositionViewSources: compiledViewSources.map((source) => ({
          path: source.path,
          viewId: source.view.viewId,
          scope: normalizeScope(source.view.scope),
          digest: digest(source.rawView),
          projectionFingerprint: digest({
            viewId: source.view.viewId,
            scope: normalizeScope(source.view.scope),
            curricularAtomicGoalIds: [...source.curricularAtomicGoalIds].sort(compareStrings),
          }),
        })),
        navigationOwnership: sourceManifest.navigationOwnership,
        durationModelPolicyPath: sourceManifest.durationModelPolicyPath,
        durationModelPolicyDigest: digest(rawDurationModelPolicy),
      } : {}),
      ...(externalLandscapeBindings.length > 0
        ? { externalLandscapes: externalLandscapeBindings }
        : {}),
      evidenceReviewSources: evidenceReviews.sources,
      goalFingerprintRuleVersion: GOAL_BOOK_GOAL_FINGERPRINT_RULE_VERSION,
    },
    chapters,
    pages,
    excludedTargetGoals,
  }

  return {
    ...modelWithoutDigest,
    digest: digest(modelWithoutDigest),
  }
}

export const parseAndValidateGoalBookModel = (raw: unknown): GoalBookModel => {
  const value = typeof raw === 'string'
    ? parseJson(raw, 'goal-book model')
    : raw
  const schemaValidator = cachedGoalBookSchemaValidator
    ?? (cachedGoalBookSchemaValidator = createSchemaValidator(GOAL_BOOK_MODEL_SCHEMA_PATH))
  if (!schemaValidator.validate(value)) {
    fail(`model violates its closed JSON Schema: ${schemaValidator.ajv.errorsText(
      schemaValidator.validate.errors,
      { separator: '; ' },
    )}.`)
  }
  const model = value as GoalBookModel
  if (model.book.pageCount !== model.pages.length) {
    fail(`book.pageCount ${model.book.pageCount} does not match ${model.pages.length} pages.`)
  }
  if (
    model.book.projectedAtomicGoalCount
    !== model.book.pageCount + model.book.excludedTargetAtomicGoalCount
  ) {
    fail('projected atomic goal counts are inconsistent.')
  }
  if (model.book.excludedTargetAtomicGoalCount !== model.excludedTargetGoals.length) {
    fail('excluded target goal count is inconsistent.')
  }

  const pageByGoalId = new Map<string, GoalBookPage>()
  const hasManifestSources = (model.source.compositionViewSources?.length ?? 0) > 0
  const manifestBindingFlags = [
    hasManifestSources,
    Boolean(model.source.compositionViewManifestPath),
    Boolean(model.source.compositionViewManifestDigest),
    Boolean(model.source.navigationOwnership),
    Boolean(model.source.durationModelPolicyPath),
    Boolean(model.source.durationModelPolicyDigest),
  ]
  if (manifestBindingFlags.some(Boolean) && !manifestBindingFlags.every(Boolean)) {
    fail('composition-view manifest source bindings are incomplete.')
  }
  if (model.source.compositionViewSources) {
    const sourcePaths = model.source.compositionViewSources.map(({ path }) => path)
    const sourceViewIds = model.source.compositionViewSources.map(({ viewId }) => viewId)
    if (new Set(sourcePaths).size !== sourcePaths.length) {
      fail('source.compositionViewSources contains duplicate paths.')
    }
    if (new Set(sourceViewIds).size !== sourceViewIds.length) {
      fail('source.compositionViewSources contains duplicate view IDs.')
    }
  }
  const externalLandscapeIds = new Set<string>()
  const externalLandscapePaths = new Set<string>()
  ;(model.source.externalLandscapes ?? []).forEach(({ path, landscapeId: externalId }) => {
    if (
      externalId === model.book.landscapeId
      || externalLandscapeIds.has(externalId)
      || externalLandscapePaths.has(path)
    ) {
      fail('source.externalLandscapes must bind unique foreign paths and landscape IDs.')
    }
    externalLandscapeIds.add(externalId)
    externalLandscapePaths.add(path)
  })
  model.pages.forEach((page, index) => {
    if (pageByGoalId.has(page.goalId)) fail(`duplicate page for goal ${page.goalId}.`)
    pageByGoalId.set(page.goalId, page)
    if (page.pageNumber !== index + 1) {
      fail(`page ${page.goalId} has non-contiguous pageNumber ${page.pageNumber}.`)
    }
    if (page.anchor !== goalAnchor(page.goalId)) {
      fail(`page ${page.goalId} has invalid anchor ${page.anchor}.`)
    }
    if (page.breadcrumbs.length !== page.chapterIds.length) {
      fail(`page ${page.goalId} breadcrumb and chapter paths differ in length.`)
    }
    if (hasManifestSources !== Boolean(page.applicability)) {
      fail(`page ${page.goalId} applicability does not match the model source kind.`)
    }
    if (page.applicability) {
      const jurisdictions = page.applicability.map(({ jurisdiction }) => jurisdiction)
      if (new Set(jurisdictions).size !== jurisdictions.length
        || [...jurisdictions].sort(compareStrings).join('\0') !== jurisdictions.join('\0')) {
        fail(`page ${page.goalId} applicability jurisdictions must be unique and sorted.`)
      }
      page.applicability.forEach(({ jurisdiction, scopes }) => {
        const scopeKeys = scopes.map((scope) => [
          scope.stage,
          scope.durationModel ?? '',
          scope.courseProfile ?? '',
        ].join('\0'))
        if (new Set(scopeKeys).size !== scopeKeys.length
          || [...scopeKeys].sort(compareStrings).join('\u0001') !== scopeKeys.join('\u0001')) {
          fail(`page ${page.goalId} applicability scopes for ${jurisdiction} must be unique and sorted.`)
        }
        scopes.forEach((scope) => {
          if (scope.stage === 'SekI' && scope.courseProfile !== null) {
            fail(`page ${page.goalId} SekI applicability must not carry courseProfile.`)
          }
          if (scope.stage === 'SekII' && scope.courseProfile === null) {
            fail(`page ${page.goalId} SekII applicability must carry courseProfile.`)
          }
        })
      })
    }
    if (page.visualization) {
      const approvalFieldsAgree = page.visualization.approvedForPublication
        === (page.visualization.qaStatus === 'approved')
      if (!approvalFieldsAgree) {
        fail(`page ${page.goalId} visualization QA approval fields disagree.`)
      }
      if (model.book.publicationMode === 'public' && !page.visualization.approvedForPublication) {
        fail(`public model contains an unapproved visualization for ${page.goalId}.`)
      }
    }
    const { pageFingerprint, ...pageWithoutFingerprint } = page
    const expectedPageFingerprint = digest({
      modelSchemaVersion: model.schemaVersion,
      edition: model.book.edition,
      page: pageWithoutFingerprint,
    })
    if (pageFingerprint !== expectedPageFingerprint) {
      fail(`page ${page.goalId} has stale pageFingerprint; expected ${expectedPageFingerprint}.`)
    }
  })

  const exactInternalReference = (
    owner: GoalBookPage,
    relation: 'requires' | 'reverseRequires',
    reference: GoalBookReference,
  ) => {
    const target = pageByGoalId.get(reference.goalId)
      ?? fail(`${owner.goalId}.${relation} references missing in-book goal ${reference.goalId}.`)
    if (
      reference.title !== target.title
      || reference.anchor !== target.anchor
      || reference.pageNumber !== target.pageNumber
    ) {
      fail(`${owner.goalId}.${relation} does not resolve exactly to ${reference.goalId}.`)
    }
    if (relation === 'requires' && target.pageNumber >= owner.pageNumber) {
      fail(`${owner.goalId}.requires points forward to ${reference.goalId}.`)
    }
    if (relation === 'reverseRequires' && target.pageNumber <= owner.pageNumber) {
      fail(`${owner.goalId}.reverseRequires points backward to ${reference.goalId}.`)
    }
    const reciprocal = relation === 'requires' ? target.reverseRequires : target.requires
    if (!reciprocal.some(({ goalId }) => goalId === owner.goalId)) {
      fail(`${owner.goalId}.${relation} has no reciprocal reference at ${reference.goalId}.`)
    }
  }

  model.pages.forEach((page) => {
    page.requires.forEach((reference) => exactInternalReference(page, 'requires', reference))
    page.reverseRequires.forEach((reference) => (
      exactInternalReference(page, 'reverseRequires', reference)
    ))
    const validateExternalReference = (reference: GoalBookExternalReference) => {
      const { goalId } = reference
      if (pageByGoalId.has(goalId)) {
        fail(`${page.goalId} contains in-book goal ${goalId} as external reference.`)
      }
      if (reference.landscapeId !== undefined) {
        if (
          reference.landscapeId === model.book.landscapeId
          || !externalLandscapeIds.has(reference.landscapeId)
        ) {
          fail(`${page.goalId} references unbound external landscape ${reference.landscapeId}.`)
        }
      }
      const expectedUrl = canonicalGoalUrl(
        model.book.atlasBaseUrl ?? undefined,
        model.book.landscapeId,
        goalId,
      )
      if (reference.canonicalUrl !== expectedUrl) {
        fail(`${page.goalId} has invalid external canonical URL for ${goalId}.`)
      }
      if (model.book.publicationMode === 'public' && reference.canonicalUrl === null) {
        fail(`public model has no external canonical URL for ${goalId}.`)
      }
    }
    page.externalPrerequisites.forEach(validateExternalReference)
    page.externalReverseRequires.forEach(validateExternalReference)
  })

  const chapterById = new Map<string, GoalBookChapter>()
  model.chapters.forEach((chapter) => {
    if (chapterById.has(chapter.chapterId)) fail(`duplicate chapter ${chapter.chapterId}.`)
    if (chapter.parentChapterId !== null && !chapterById.has(chapter.parentChapterId)) {
      fail(`chapter ${chapter.chapterId} has missing or forward parent ${chapter.parentChapterId}.`)
    }
    const expectedPages = model.pages.filter((page) => page.chapterIds.includes(chapter.chapterId))
    if (
      stableGoalBookJson(chapter.goalIds) !== stableGoalBookJson(expectedPages.map(({ goalId }) => goalId))
      || stableGoalBookJson(chapter.pageNumbers)
        !== stableGoalBookJson(expectedPages.map(({ pageNumber }) => pageNumber))
    ) {
      fail(`chapter ${chapter.chapterId} page membership is inconsistent.`)
    }
    expectedPages.forEach((page) => {
      const pathIndex = page.chapterIds.indexOf(chapter.chapterId)
      if (page.breadcrumbs[pathIndex] !== chapter.label) {
        fail(`page ${page.goalId} has inconsistent label for chapter ${chapter.chapterId}.`)
      }
      const expectedParent = pathIndex === 0 ? null : page.chapterIds[pathIndex - 1]
      if (chapter.parentChapterId !== expectedParent) {
        fail(`page ${page.goalId} has inconsistent parent for chapter ${chapter.chapterId}.`)
      }
    })
    chapterById.set(chapter.chapterId, chapter)
  })
  model.pages.forEach((page) => page.chapterIds.forEach((chapterId) => {
    if (!chapterById.has(chapterId)) fail(`page ${page.goalId} references missing chapter ${chapterId}.`)
  }))

  const excludedGoalIds = new Set<string>()
  model.excludedTargetGoals.forEach(({ goalId }) => {
    if (excludedGoalIds.has(goalId)) fail(`duplicate excluded target goal ${goalId}.`)
    if (pageByGoalId.has(goalId)) fail(`goal ${goalId} is both included and excluded.`)
    excludedGoalIds.add(goalId)
  })
  const evidenceSourcePaths = model.source.evidenceReviewSources.map(({ path }) => path)
  if (new Set(evidenceSourcePaths).size !== evidenceSourcePaths.length) {
    fail('source.evidenceReviewSources contains duplicate paths.')
  }

  const { digest: modelDigest, ...modelWithoutDigest } = model
  const expectedModelDigest = digest(modelWithoutDigest)
  if (modelDigest !== expectedModelDigest) {
    fail(`model has stale digest; expected ${expectedModelDigest}.`)
  }
  return model
}

const resolveRepositoryPath = (repositoryRoot: string, configuredPath: string, label: string): string => {
  const root = resolve(repositoryRoot)
  const absolutePath = isAbsolute(configuredPath) ? resolve(configuredPath) : resolve(root, configuredPath)
  const relativePath = relative(root, absolutePath)
  if (relativePath === '..' || relativePath.startsWith(`..${process.platform === 'win32' ? '\\' : '/'}`)) {
    fail(`${label} must stay inside the repository root.`)
  }
  return absolutePath
}

const loadGoalVisualizationAssetDigests = async (
  rawGoalVisualizationQa: unknown,
  repositoryRoot: string,
): Promise<Record<string, string>> => {
  const qa = asRecord(rawGoalVisualizationQa, 'goalVisualizationQa')
  const records = Array.isArray(qa.records)
    ? qa.records
    : fail('goalVisualizationQa.records must be an array.')
  const result: Record<string, string> = {}

  await Promise.all(records.map(async (rawRecord, index) => {
    const record = asRecord(rawRecord, `goalVisualizationQa.records[${index}]`)
    if (record.visualizationState !== 'available') return
    const imageUrl = nonEmptyString(record.imageUrl, `goalVisualizationQa.records[${index}].imageUrl`)
    if (!imageUrl.startsWith('/assets/goal-visualizations/')) {
      fail(`goalVisualizationQa.records[${index}].imageUrl is outside the goal-visualization asset root.`)
    }
    if (Object.prototype.hasOwnProperty.call(result, imageUrl)) {
      fail(`goalVisualizationQa contains duplicate available image URL ${imageUrl}.`)
    }
    const configuredAssetPath = nonEmptyString(
      record.publicAssetPath,
      `goalVisualizationQa.records[${index}].publicAssetPath`,
    )
    const assetPath = resolveRepositoryPath(
      repositoryRoot,
      configuredAssetPath,
      `goalVisualizationQa.records[${index}].publicAssetPath`,
    )
    const expectedAssetPath = resolveRepositoryPath(
      repositoryRoot,
      `app/public${imageUrl}`,
      `goalVisualizationQa.records[${index}].imageUrl`,
    )
    if (assetPath !== expectedAssetPath) {
      fail(`goalVisualizationQa.records[${index}] publicAssetPath does not match imageUrl.`)
    }
    result[imageUrl] = digestBytes(await readFile(assetPath))
  }))
  return result
}

const parseGoalBookConfig = (value: unknown): GoalBookConfigFile => {
  const record = asRecord(value, 'config')
  if (record.schemaVersion !== GOAL_BOOK_CONFIG_SCHEMA_VERSION) {
    fail(`config.schemaVersion must be ${GOAL_BOOK_CONFIG_SCHEMA_VERSION}.`)
  }
  const compositionViewPath = optionalString(record.compositionViewPath)
  const compositionViewManifestPath = optionalString(record.compositionViewManifestPath)
  if ((compositionViewPath ? 1 : 0) + (compositionViewManifestPath ? 1 : 0) !== 1) {
    fail('config must define exactly one of compositionViewPath or compositionViewManifestPath.')
  }
  return {
    schemaVersion: GOAL_BOOK_CONFIG_SCHEMA_VERSION,
    bookId: nonEmptyString(record.bookId, 'config.bookId'),
    title: nonEmptyString(record.title, 'config.title'),
    landscapePath: nonEmptyString(record.landscapePath, 'config.landscapePath'),
    ...(compositionViewPath ? { compositionViewPath } : {}),
    ...(compositionViewManifestPath ? { compositionViewManifestPath } : {}),
    semanticKindLedgerPath: nonEmptyString(
      record.semanticKindLedgerPath,
      'config.semanticKindLedgerPath',
    ),
    goalVisualizationQaPath: nonEmptyString(
      record.goalVisualizationQaPath,
      'config.goalVisualizationQaPath',
    ),
    publicationMode: publicationMode(record.publicationMode, 'config.publicationMode'),
    ...(atlasBaseUrl(record.atlasBaseUrl, 'config.atlasBaseUrl')
      ? { atlasBaseUrl: atlasBaseUrl(record.atlasBaseUrl, 'config.atlasBaseUrl') }
      : {}),
    evidenceReviewPaths: uniqueStringArray(
      record.evidenceReviewPaths,
      'config.evidenceReviewPaths',
    ),
    ...(record.externalLandscapePaths === undefined
      ? {}
      : {
          externalLandscapePaths: uniqueStringArray(
            record.externalLandscapePaths,
            'config.externalLandscapePaths',
          ),
        }),
    outputPath: nonEmptyString(record.outputPath, 'config.outputPath'),
  }
}

const parseJson = (text: string, label: string): unknown => {
  try {
    return JSON.parse(text)
  } catch (error) {
    fail(`${label} is not valid JSON: ${error instanceof Error ? error.message : String(error)}.`)
  }
}

export const loadGoalBookBuildInputs = async (
  configPath: string,
  repositoryRoot = REPOSITORY_ROOT,
): Promise<LoadedGoalBookBuildInputs> => {
  const absoluteConfigPath = resolveRepositoryPath(repositoryRoot, configPath, 'configPath')
  const config = parseGoalBookConfig(parseJson(await readFile(absoluteConfigPath, 'utf8'), absoluteConfigPath))
  const landscapePath = resolveRepositoryPath(repositoryRoot, config.landscapePath, 'config.landscapePath')
  const compositionViewPath = config.compositionViewPath
    ? resolveRepositoryPath(repositoryRoot, config.compositionViewPath, 'config.compositionViewPath')
    : null
  const compositionViewManifestPath = config.compositionViewManifestPath
    ? resolveRepositoryPath(
      repositoryRoot,
      config.compositionViewManifestPath,
      'config.compositionViewManifestPath',
    )
    : null
  const semanticKindLedgerPath = resolveRepositoryPath(
    repositoryRoot,
    config.semanticKindLedgerPath,
    'config.semanticKindLedgerPath',
  )
  const goalVisualizationQaPath = resolveRepositoryPath(
    repositoryRoot,
    config.goalVisualizationQaPath,
    'config.goalVisualizationQaPath',
  )
  const outputPath = resolveRepositoryPath(repositoryRoot, config.outputPath, 'config.outputPath')
  const evidenceReviewAbsolutePaths = config.evidenceReviewPaths.map((configuredPath, index) => (
    resolveRepositoryPath(repositoryRoot, configuredPath, `config.evidenceReviewPaths[${index}]`)
  ))
  const externalLandscapeAbsolutePaths = (config.externalLandscapePaths ?? [])
    .map((configuredPath, index) => resolveRepositoryPath(
      repositoryRoot,
      configuredPath,
      `config.externalLandscapePaths[${index}]`,
    ))
  const [
    landscapeText,
    compositionViewText,
    compositionViewManifestText,
    semanticKindLedgerText,
    goalVisualizationQaText,
    evidenceReviewTexts,
    externalLandscapeTexts,
  ] = await Promise.all([
    readFile(landscapePath, 'utf8'),
    compositionViewPath ? readFile(compositionViewPath, 'utf8') : Promise.resolve(null),
    compositionViewManifestPath
      ? readFile(compositionViewManifestPath, 'utf8')
      : Promise.resolve(null),
    readFile(semanticKindLedgerPath, 'utf8'),
    readFile(goalVisualizationQaPath, 'utf8'),
    Promise.all(evidenceReviewAbsolutePaths.map((path) => readFile(path, 'utf8'))),
    Promise.all(externalLandscapeAbsolutePaths.map((path) => readFile(path, 'utf8'))),
  ])
  const goalVisualizationQa = parseJson(goalVisualizationQaText, config.goalVisualizationQaPath)
  const compositionViewManifest = compositionViewManifestText
    ? parseJson(compositionViewManifestText, config.compositionViewManifestPath!)
    : undefined
  const sourceManifest = compositionViewManifest
    ? parseSourceManifest(compositionViewManifest)
    : null
  const compositionViewSources = sourceManifest
    ? await Promise.all(sourceManifest.sourcePaths.map(async (configuredPath, index) => {
      const sourcePath = resolveRepositoryPath(
        repositoryRoot,
        configuredPath,
        `compositionViewManifest.sourcePaths[${index}]`,
      )
      return {
        path: configuredPath,
        view: parseJson(await readFile(sourcePath, 'utf8'), configuredPath),
      }
    }))
    : undefined
  const durationModelPolicy = sourceManifest
    ? parseJson(
      await readFile(resolveRepositoryPath(
        repositoryRoot,
        sourceManifest.durationModelPolicyPath,
        'compositionViewManifest.durationModelPolicyPath',
      ), 'utf8'),
      sourceManifest.durationModelPolicyPath,
    )
    : undefined
  const goalVisualizationAssetDigests = await loadGoalVisualizationAssetDigests(
    goalVisualizationQa,
    repositoryRoot,
  )
  const model = buildGoalBookModel({
    landscape: parseJson(landscapeText, config.landscapePath),
    ...(compositionViewText && config.compositionViewPath
      ? { compositionView: parseJson(compositionViewText, config.compositionViewPath) }
      : {}),
    ...(compositionViewManifest ? { compositionViewManifest } : {}),
    ...(compositionViewSources ? { compositionViewSources } : {}),
    ...(externalLandscapeTexts.length > 0 ? {
      externalLandscapeSources: externalLandscapeTexts.map((text, index) => ({
        path: config.externalLandscapePaths![index],
        landscape: parseJson(text, config.externalLandscapePaths![index]),
      })),
    } : {}),
    ...(durationModelPolicy ? { durationModelPolicy } : {}),
    semanticKindLedger: parseJson(semanticKindLedgerText, config.semanticKindLedgerPath),
    goalVisualizationQa,
    goalVisualizationAssetDigests,
    evidenceReviewSources: config.evidenceReviewPaths.map((path, index) => ({
      path,
      text: evidenceReviewTexts[index],
    })),
    config,
  })
  return {
    config,
    configPath: absoluteConfigPath,
    outputPath,
    model,
  }
}

export const writeGoalBookModel = async (model: GoalBookModel, outputPath: string): Promise<void> => {
  const parentDirectory = dirname(outputPath)
  await mkdir(parentDirectory, { recursive: true })
  const temporaryPath = `${outputPath}.tmp-${process.pid}`
  try {
    await writeFile(temporaryPath, `${JSON.stringify(model, null, 2)}\n`, { encoding: 'utf8', flag: 'wx' })
    await rename(temporaryPath, outputPath)
  } finally {
    await rm(temporaryPath, { force: true })
  }
}
