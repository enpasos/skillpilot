import { readFileSync, readdirSync } from 'node:fs'
import { dirname, extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { normalizeCompositionView } from '../src/utils/authoring/compositionViewAuthoring'

type Scope = {
  schoolForm: string
  jurisdiction?: string
  stage?: string
  courseProfile?: string
  durationModel?: string
}

type MatchScore = {
  scopeSize: number
  stageFallbackCount: number
}

type ViewMatch = {
  viewId: string
  scope: Scope
  score: MatchScore
}

type ApprovedDeDefaultFallbackGroup = {
  jurisdictions: string[]
  rationale?: string
  scopes: Array<Scope & { expectedViewId: string }>
}

const CANONICAL_DE_MATH_ID = '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'
const CANONICAL_GYMNASIUM_OVERVIEW_PATH = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_OVERVIEW.de.json'
const COMPOSITION_VIEW_MATH_DIR = 'curricula/DE/Gymnasium/composition-views/mathematik'
const CANONICAL_MATH_FALLBACK_POLICY_PATH = 'curricula/DE/Gymnasium/provenance/canonical-math-composition-fallback-policy.json'
const STAGE_KEY = 'stage'
const STAGE_CROSS = 'CROSSSTAGE'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '../..')

const normalizeValue = (value?: string) => value?.trim().toUpperCase() ?? ''

const normalizeScope = (scope: Scope) => {
  const normalized: Record<string, string> = {}
  Object.entries(scope).forEach(([key, value]) => {
    if (!value?.trim()) return
    normalized[key] = value.trim()
  })
  return normalized
}

const composeScopeKey = (scope: Scope) => [
  scope.schoolForm ?? '',
  scope.jurisdiction ?? '',
  scope.stage ?? '',
  scope.courseProfile ?? '',
  scope.durationModel ?? '',
].join('|')

const matchStageScope = (viewStage?: string, requestedStage?: string): 'exact' | 'fallback' | 'none' => {
  const normalizedViewStage = normalizeValue(viewStage)
  const normalizedRequestedStage = normalizeValue(requestedStage)
  if (!normalizedViewStage || !normalizedRequestedStage) {
    return 'none'
  }
  if (normalizedViewStage === normalizedRequestedStage) {
    return 'exact'
  }
  if (
    normalizedRequestedStage === STAGE_CROSS
    && (normalizedViewStage === 'SEKI' || normalizedViewStage === 'SEKII')
  ) {
    return 'fallback'
  }
  return 'none'
}

const scoreScopeMatch = (viewScope: Record<string, string>, requestedScope: Record<string, string>): MatchScore | null => {
  if (Object.keys(viewScope).length === 0) {
    return Object.keys(requestedScope).length === 0 ? { scopeSize: 0, stageFallbackCount: 0 } : null
  }

  let stageFallbackCount = 0
  for (const [key, viewValue] of Object.entries(viewScope)) {
    const requestedValue = requestedScope[key]
    if (!requestedValue?.trim()) {
      return null
    }

    if (key === STAGE_KEY) {
      const stageMatch = matchStageScope(viewValue, requestedValue)
      if (stageMatch === 'none') {
        return null
      }
      if (stageMatch === 'fallback') {
        stageFallbackCount += 1
      }
      continue
    }

    if (normalizeValue(requestedValue) !== normalizeValue(viewValue)) {
      return null
    }
  }

  return { scopeSize: Object.keys(viewScope).length, stageFallbackCount }
}

const formatScope = (scope: Scope) => {
  const parts = [
    scope.schoolForm,
    scope.jurisdiction ?? 'DE-default',
    scope.stage ?? 'stage:∅',
    scope.courseProfile ?? 'course:∅',
    scope.durationModel ?? 'duration:∅',
  ]
  return parts.join(' | ')
}

const overview = JSON.parse(readFileSync(resolve(repoRoot, CANONICAL_GYMNASIUM_OVERVIEW_PATH), 'utf8')) as {
  filters?: Array<{ id?: string }>
}

const fallbackPolicy = JSON.parse(
  readFileSync(resolve(repoRoot, CANONICAL_MATH_FALLBACK_POLICY_PATH), 'utf8'),
) as {
  landscapeId?: string
  approvedDeDefaultFallbackGroups?: ApprovedDeDefaultFallbackGroup[]
};

const jurisdictions = [
  undefined,
  ...((overview.filters ?? [])
    .map((filter) => filter.id?.trim())
    .filter((filterId): filterId is string => !!filterId && filterId !== 'ALL')),
]

const durationVariants = <T extends Scope>(scope: T): T[] => [
  scope,
  { ...scope, durationModel: 'G8' },
  { ...scope, durationModel: 'G9' },
]

const requestedScopes: Scope[] = [
  ...jurisdictions.flatMap((jurisdiction) => durationVariants({
    schoolForm: 'Gymnasium',
    ...(jurisdiction ? { jurisdiction } : {}),
    stage: 'SekI',
  })),
  ...jurisdictions.flatMap((jurisdiction) => ([
    ...durationVariants({
      schoolForm: 'Gymnasium',
      ...(jurisdiction ? { jurisdiction } : {}),
      stage: 'SekII',
      courseProfile: 'GK',
    }),
    ...durationVariants({
      schoolForm: 'Gymnasium',
      ...(jurisdiction ? { jurisdiction } : {}),
      stage: 'SekII',
      courseProfile: 'LK',
    }),
    ...durationVariants({
      schoolForm: 'Gymnasium',
      ...(jurisdiction ? { jurisdiction } : {}),
      stage: 'CrossStage',
      courseProfile: 'GK',
    }),
    ...durationVariants({
      schoolForm: 'Gymnasium',
      ...(jurisdiction ? { jurisdiction } : {}),
      stage: 'CrossStage',
      courseProfile: 'LK',
    }),
  ])),
]

const compositionViewDirectory = resolve(repoRoot, COMPOSITION_VIEW_MATH_DIR)
const mathViews = readdirSync(compositionViewDirectory)
  .filter((fileName) => extname(fileName).toLowerCase() === '.json')
  .map((fileName) => normalizeCompositionView(JSON.parse(readFileSync(join(compositionViewDirectory, fileName), 'utf8'))))
  .filter((view) => view.landscapeId === CANONICAL_DE_MATH_ID);

const approvedFallbacksByScopeKey = new Map<string, { expectedViewId: string; rationale?: string }>();
for (const group of (fallbackPolicy.approvedDeDefaultFallbackGroups ?? [])) {
  group.jurisdictions.forEach((jurisdiction) => {
    group.scopes.forEach(({ expectedViewId, ...scope }) => {
      approvedFallbacksByScopeKey.set(
        composeScopeKey({ ...scope, jurisdiction }),
        { expectedViewId, rationale: group.rationale },
      )
    })
  })
}

const results = requestedScopes.map((scope) => {
  const normalizedRequestedScope = normalizeScope(scope)
  const matches = mathViews
    .map((view) => ({
      viewId: view.viewId,
      scope: view.scope,
      score: scoreScopeMatch(normalizeScope(view.scope), normalizedRequestedScope),
    }))
    .filter((match): match is ViewMatch => match.score !== null)
    .sort((left, right) => {
      if (left.score.scopeSize !== right.score.scopeSize) {
        return right.score.scopeSize - left.score.scopeSize
      }
      if (left.score.stageFallbackCount !== right.score.stageFallbackCount) {
        return left.score.stageFallbackCount - right.score.stageFallbackCount
      }
      return left.viewId.localeCompare(right.viewId, 'de', { sensitivity: 'base' })
    })

  const bestMatch = matches[0]
  const approvedFallback = scope.jurisdiction && !bestMatch?.scope.jurisdiction
    ? approvedFallbacksByScopeKey.get(composeScopeKey(scope))
      ?? (scope.durationModel
        ? approvedFallbacksByScopeKey.get(composeScopeKey({ ...scope, durationModel: undefined }))
        : undefined)
    : undefined
  const resolutionKind = !bestMatch
    ? 'missing'
    : scope.jurisdiction && !bestMatch.scope.jurisdiction
      ? approvedFallback?.expectedViewId === bestMatch.viewId
        ? 'approved-de-default-fallback'
        : 'unapproved-de-default-fallback'
      : 'specific-or-default'

  return {
    scope,
    bestMatch,
    approvedFallback,
    resolutionKind,
  }
})

const missing = results.filter((result) => result.resolutionKind === 'missing')
const approvedFallbacks = results.filter((result) => result.resolutionKind === 'approved-de-default-fallback')
const unapprovedFallbacks = results.filter((result) => result.resolutionKind === 'unapproved-de-default-fallback')
const exactOrDefault = results.filter((result) => result.resolutionKind === 'specific-or-default')

console.log('Canonical Math Composition-View Scope Coverage')
console.log(`Landscape: ${CANONICAL_DE_MATH_ID}`)
console.log(`Math composition views: ${mathViews.length}`)
console.log(`Requested scopes: ${results.length}`)
console.log(`Covered by specific/default scope: ${exactOrDefault.length}`)
console.log(`Covered by approved DE-default fallback: ${approvedFallbacks.length}`)
console.log(`Covered by unapproved DE-default fallback: ${unapprovedFallbacks.length}`)
console.log(`Missing: ${missing.length}`)
console.log('')

results.forEach((result) => {
  const scopeLabel = formatScope(result.scope)
  if (!result.bestMatch) {
    console.log(`❌ ${scopeLabel} -> no matching composition view`)
    return
  }

  const matchedScope = formatScope(result.bestMatch.scope)
  const prefix = result.resolutionKind === 'approved-de-default-fallback'
    ? '↪'
    : result.resolutionKind === 'unapproved-de-default-fallback'
      ? '⚠️'
      : '✅'
  console.log(`${prefix} ${scopeLabel} -> ${result.bestMatch.viewId} [${matchedScope}]`)
})

if (missing.length > 0 || unapprovedFallbacks.length > 0) {
  process.exitCode = 1
}
