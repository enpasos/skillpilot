import type { UiGoal } from '../goalTypes'
import { splitFilterIds } from './goalFilters'
import { normalizeJurisdictionCode } from './jurisdictionMetadata'
import {
  resolveRuntimeApiHref,
  type RuntimeCatalogSourceEvidence,
  type RuntimeCurriculumCatalogState,
} from './runtimeCurriculumCatalog'
import type { GoalSourceRationaleItem } from './sourceRationaleTypes'

export interface PackageGoalSourceEvidenceRequest {
  discovery: RuntimeCatalogSourceEvidence
  generationSha256: string
  goalId: string
  jurisdiction?: string
  href: string
}

export interface PackageGoalSourceEvidencePayload {
  generationSha256: string
  packageId: string
  packageVersion: string
  targetLandscapeId: string
  goalId: string
  jurisdiction: string
  matchType: 'exact' | 'partial'
  sourceCollection: {
    sourceCollectionId: string
    sourceLandscapeId: string
    subject: string
    stage: string
    durationModels: readonly string[]
  }
  sourceGoal: {
    sourceGoalId: string
    title: string
    description: string
    sourceText: string
    sourceTextSha256: string
    parentBulletText?: string
    locator: {
      passageId: string
      topicCode: string
      sourceSpan: string
      sourceRef: string
      sourcePage?: number
      sourceLine?: number
    }
    classification?: Readonly<Record<string, string>>
    lineage?: {
      splitFromSourceGoalId: string
      splitIndex: number
      splitPartCount: number
    }
  }
  sourceDocument: {
    sourceDocumentId: string
    sourceKey: string
    title: string
    role: string
    semanticType: string
    url: string
    landingUrl?: string
    durationModel?: string
  }
}

const SHA256_PATTERN = /^sha256:[a-f0-9]{64}$/u
const HTTPS_URL_PATTERN = /^https:\/\/[^\s]+$/u

const asRecord = (value: unknown, label: string): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be an object`)
  return value as Record<string, unknown>
}

const asOptionalRecord = (value: unknown, label: string): Record<string, unknown> | undefined => {
  if (value === null || value === undefined) return undefined
  return asRecord(value, label)
}

const asString = (value: unknown, label: string): string => {
  if (typeof value !== 'string' || value.trim().length === 0) throw new Error(`${label} must be a non-empty string`)
  return value
}

const asOptionalString = (value: unknown, label: string): string | undefined => {
  if (value === null || value === undefined) return undefined
  return asString(value, label)
}

const asPositiveInteger = (value: unknown, label: string): number => {
  if (!Number.isSafeInteger(value) || Number(value) < 1) throw new Error(`${label} must be a positive integer`)
  return Number(value)
}

const asNonNegativeInteger = (value: unknown, label: string): number => {
  if (!Number.isSafeInteger(value) || Number(value) < 0) throw new Error(`${label} must be a non-negative integer`)
  return Number(value)
}

const readUniqueStringArray = (value: unknown, label: string): string[] => {
  if (!Array.isArray(value)) throw new Error(`${label} must be an array`)
  const result = value.map((entry, index) => asString(entry, `${label}[${index}]`))
  if (new Set(result).size !== result.length) throw new Error(`${label} contains duplicates`)
  return result
}

const assertExactKeys = (
  value: Record<string, unknown>,
  label: string,
  required: readonly string[],
  optional: readonly string[] = [],
): void => {
  const allowed = new Set([...required, ...optional])
  const unknown = Object.keys(value).filter((key) => !allowed.has(key))
  const missing = required.filter((key) => !(key in value))
  if (unknown.length > 0) throw new Error(`${label} contains unknown fields: ${unknown.join(', ')}`)
  if (missing.length > 0) throw new Error(`${label} is missing fields: ${missing.join(', ')}`)
}

const readOptionalHttpsUrl = (value: unknown, label: string): string | undefined => {
  const result = asOptionalString(value, label)
  if (result && !HTTPS_URL_PATTERN.test(result)) throw new Error(`${label} must be HTTPS`)
  return result
}

export const resolvePackageGoalSourceEvidenceRequest = (
  state: RuntimeCurriculumCatalogState,
  goal: Pick<UiGoal, 'id' | 'landscapeId'>,
  activeFilter?: string,
): PackageGoalSourceEvidenceRequest | undefined => {
  if (state.mode !== 'package' || !goal.landscapeId) return undefined

  const discoveryMatches = state.catalog.sourceEvidence.filter(
    (entry) => entry.targetLandscapeId === goal.landscapeId,
  )
  if (discoveryMatches.length !== 1) return undefined
  const discovery = discoveryMatches[0]
  const goalDiscovery = discovery.goals.find((entry) => entry.goalId === goal.id)
  if (!goalDiscovery) return undefined

  const activeJurisdiction = splitFilterIds(activeFilter)
    .map((filterId) => normalizeJurisdictionCode(filterId))
    .find((jurisdiction) => Boolean(jurisdiction)) ?? undefined
  if (activeJurisdiction && !goalDiscovery.jurisdictions.includes(activeJurisdiction)) return undefined

  const baseHref = resolveRuntimeApiHref(state.apiBase, discovery.href)
  const queryParameters = new URLSearchParams({ generation: state.catalog.generationSha256 })
  if (activeJurisdiction) queryParameters.set('jurisdiction', activeJurisdiction)
  return Object.freeze({
    discovery,
    generationSha256: state.catalog.generationSha256,
    goalId: goal.id,
    jurisdiction: activeJurisdiction,
    href: `${baseHref}/${encodeURIComponent(goal.id)}?${queryParameters.toString()}`,
  })
}

export const parsePackageGoalSourceEvidencePayload = (
  raw: unknown,
  request: PackageGoalSourceEvidenceRequest,
): PackageGoalSourceEvidencePayload => {
  const root = asRecord(raw, 'package source evidence')
  assertExactKeys(root, 'package source evidence', [
    'generationSha256',
    'packageId',
    'packageVersion',
    'targetLandscapeId',
    'goalId',
    'jurisdiction',
    'matchType',
    'sourceCollection',
    'sourceGoal',
    'sourceDocument',
  ])

  const generationSha256 = asString(root.generationSha256, 'generationSha256')
  const packageId = asString(root.packageId, 'packageId')
  const packageVersion = asString(root.packageVersion, 'packageVersion')
  const targetLandscapeId = asString(root.targetLandscapeId, 'targetLandscapeId')
  const goalId = asString(root.goalId, 'goalId')
  const jurisdiction = asString(root.jurisdiction, 'jurisdiction')
  const matchType = asString(root.matchType, 'matchType')
  if (generationSha256 !== request.generationSha256) throw new Error('Source evidence generation binding is invalid')
  if (
    packageId !== request.discovery.packageId
    || packageVersion !== request.discovery.packageVersion
    || targetLandscapeId !== request.discovery.targetLandscapeId
    || goalId !== request.goalId
  ) {
    throw new Error('Source evidence package or goal binding is invalid')
  }
  const goalDiscovery = request.discovery.goals.find((entry) => entry.goalId === request.goalId)
  if (
    !goalDiscovery?.jurisdictions.includes(jurisdiction)
    || (request.jurisdiction !== undefined && jurisdiction !== request.jurisdiction)
  ) {
    throw new Error('Source evidence jurisdiction binding is invalid')
  }
  if (matchType !== 'exact' && matchType !== 'partial') throw new Error('Source evidence matchType is invalid')

  const rawCollection = asRecord(root.sourceCollection, 'sourceCollection')
  assertExactKeys(rawCollection, 'sourceCollection', [
    'sourceCollectionId',
    'sourceLandscapeId',
    'subject',
    'stage',
    'durationModels',
  ])
  const sourceCollection = Object.freeze({
    sourceCollectionId: asString(rawCollection.sourceCollectionId, 'sourceCollection.sourceCollectionId'),
    sourceLandscapeId: asString(rawCollection.sourceLandscapeId, 'sourceCollection.sourceLandscapeId'),
    subject: asString(rawCollection.subject, 'sourceCollection.subject'),
    stage: asString(rawCollection.stage, 'sourceCollection.stage'),
    durationModels: Object.freeze(readUniqueStringArray(rawCollection.durationModels, 'sourceCollection.durationModels')),
  })

  const rawGoal = asRecord(root.sourceGoal, 'sourceGoal')
  assertExactKeys(rawGoal, 'sourceGoal', [
    'sourceGoalId',
    'title',
    'description',
    'sourceText',
    'sourceTextSha256',
    'locator',
  ], ['parentBulletText', 'classification', 'lineage'])
  const sourceTextSha256 = asString(rawGoal.sourceTextSha256, 'sourceGoal.sourceTextSha256')
  if (!SHA256_PATTERN.test(sourceTextSha256)) throw new Error('sourceGoal.sourceTextSha256 is invalid')

  const rawLocator = asRecord(rawGoal.locator, 'sourceGoal.locator')
  assertExactKeys(rawLocator, 'sourceGoal.locator', [
    'passageId',
    'topicCode',
    'sourceSpan',
    'sourceRef',
  ], ['sourcePage', 'sourceLine'])
  const locator = Object.freeze({
    passageId: asString(rawLocator.passageId, 'sourceGoal.locator.passageId'),
    topicCode: asString(rawLocator.topicCode, 'sourceGoal.locator.topicCode'),
    sourceSpan: asString(rawLocator.sourceSpan, 'sourceGoal.locator.sourceSpan'),
    sourceRef: asString(rawLocator.sourceRef, 'sourceGoal.locator.sourceRef'),
    sourcePage: rawLocator.sourcePage === null || rawLocator.sourcePage === undefined
      ? undefined
      : asNonNegativeInteger(rawLocator.sourcePage, 'sourceGoal.locator.sourcePage'),
    sourceLine: rawLocator.sourceLine === null || rawLocator.sourceLine === undefined
      ? undefined
      : asNonNegativeInteger(rawLocator.sourceLine, 'sourceGoal.locator.sourceLine'),
  })

  const rawClassification = asOptionalRecord(rawGoal.classification, 'sourceGoal.classification')
  let classification: Readonly<Record<string, string>> | undefined
  if (rawClassification) {
    const fields = ['granularity', 'category', 'stage', 'phase', 'courseLevel', 'grade', 'area', 'level'] as const
    assertExactKeys(rawClassification, 'sourceGoal.classification', [], fields)
    classification = Object.freeze(Object.fromEntries(
      fields
        .filter((field) => rawClassification[field] !== null && rawClassification[field] !== undefined)
        .map((field) => [field, asString(rawClassification[field], `sourceGoal.classification.${field}`)]),
    ))
  }

  const rawLineage = asOptionalRecord(rawGoal.lineage, 'sourceGoal.lineage')
  let lineage: PackageGoalSourceEvidencePayload['sourceGoal']['lineage']
  if (rawLineage) {
    assertExactKeys(rawLineage, 'sourceGoal.lineage', [
      'splitFromSourceGoalId',
      'splitIndex',
      'splitPartCount',
    ])
    const splitIndex = asPositiveInteger(rawLineage.splitIndex, 'sourceGoal.lineage.splitIndex')
    const splitPartCount = asPositiveInteger(rawLineage.splitPartCount, 'sourceGoal.lineage.splitPartCount')
    if (splitIndex > splitPartCount) throw new Error('sourceGoal.lineage splitIndex exceeds splitPartCount')
    lineage = Object.freeze({
      splitFromSourceGoalId: asString(rawLineage.splitFromSourceGoalId, 'sourceGoal.lineage.splitFromSourceGoalId'),
      splitIndex,
      splitPartCount,
    })
  }

  const sourceGoal = Object.freeze({
    sourceGoalId: asString(rawGoal.sourceGoalId, 'sourceGoal.sourceGoalId'),
    title: asString(rawGoal.title, 'sourceGoal.title'),
    description: asString(rawGoal.description, 'sourceGoal.description'),
    sourceText: asString(rawGoal.sourceText, 'sourceGoal.sourceText'),
    sourceTextSha256,
    parentBulletText: asOptionalString(rawGoal.parentBulletText, 'sourceGoal.parentBulletText'),
    locator,
    classification,
    lineage,
  })

  const rawDocument = asRecord(root.sourceDocument, 'sourceDocument')
  assertExactKeys(rawDocument, 'sourceDocument', [
    'sourceDocumentId',
    'sourceKey',
    'title',
    'role',
    'semanticType',
    'url',
  ], ['landingUrl', 'durationModel'])
  const url = asString(rawDocument.url, 'sourceDocument.url')
  if (!HTTPS_URL_PATTERN.test(url)) throw new Error('sourceDocument.url must be HTTPS')
  const sourceDocument = Object.freeze({
    sourceDocumentId: asString(rawDocument.sourceDocumentId, 'sourceDocument.sourceDocumentId'),
    sourceKey: asString(rawDocument.sourceKey, 'sourceDocument.sourceKey'),
    title: asString(rawDocument.title, 'sourceDocument.title'),
    role: asString(rawDocument.role, 'sourceDocument.role'),
    semanticType: asString(rawDocument.semanticType, 'sourceDocument.semanticType'),
    url,
    landingUrl: readOptionalHttpsUrl(rawDocument.landingUrl, 'sourceDocument.landingUrl'),
    durationModel: asOptionalString(rawDocument.durationModel, 'sourceDocument.durationModel'),
  })

  return Object.freeze({
    generationSha256,
    packageId,
    packageVersion,
    targetLandscapeId,
    goalId,
    jurisdiction,
    matchType,
    sourceCollection,
    sourceGoal,
    sourceDocument,
  })
}

export const toGoalSourceRationaleItem = (
  payload: PackageGoalSourceEvidencePayload,
  goal: Pick<UiGoal, 'id' | 'title' | 'description'>,
): GoalSourceRationaleItem => ({
  goal: {
    id: goal.id,
    title: goal.title,
    description: goal.description,
  },
  classicSourceRoute: {
    jurisdiction: payload.jurisdiction,
    sourceRef: payload.sourceGoal.locator.sourceRef,
    sourceText: payload.sourceGoal.sourceText,
    parentBulletText: payload.sourceGoal.parentBulletText,
    sourceDocument: {
      title: payload.sourceDocument.title,
      url: payload.sourceDocument.url,
    },
    matchType: payload.matchType,
  },
})

/** Package-only lazy load. Every non-200 or invalid payload fails closed and never invokes repository code. */
export const loadPackageGoalSourceEvidence = async (
  fetcher: typeof fetch,
  request: PackageGoalSourceEvidenceRequest,
  goal: Pick<UiGoal, 'id' | 'title' | 'description'>,
): Promise<GoalSourceRationaleItem | null> => {
  try {
    const response = await fetcher(request.href, {
      cache: 'force-cache',
      headers: { Accept: 'application/json' },
    })
    if (response.status !== 200) return null
    const payload = parsePackageGoalSourceEvidencePayload(await response.json(), request)
    return toGoalSourceRationaleItem(payload, goal)
  } catch {
    return null
  }
}
