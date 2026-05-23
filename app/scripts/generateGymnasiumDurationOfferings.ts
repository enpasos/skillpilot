import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

type DurationModel = 'G8' | 'G9'
type StageOffering = 'SekI' | 'SekII' | 'CrossStage'

interface CurriculumStatusEntry {
  landscapeId?: string
  subject?: string
  frameworkId?: string
  maturity?: string
}

interface CurriculumStatusDocument {
  curricula?: CurriculumStatusEntry[]
}

interface DurationPolicyDecision {
  subject?: string
  jurisdiction?: string
  stage?: string
  status?: string
  durationModels?: string[]
}

interface DurationPolicyDocument {
  decisions?: DurationPolicyDecision[]
}

interface GymnasiumOverview {
  filters?: Array<{ id?: string }>
}

interface CompositionView {
  landscapeId?: string
  viewId?: string
  scope?: Record<string, string | undefined>
}

interface CompositionViewSummary {
  subject: string
  viewId: string
  scope: Record<string, string | undefined>
}

interface ContentOffering {
  stages: Set<StageOffering>
  durationModels: Set<DurationModel>
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '../..')
const shouldWrite = process.argv.includes('--write')
const shouldCheck = process.argv.includes('--check')

const qualityStatusPath = resolve(repoRoot, 'docs/qa-ci/status/curriculum-quality-status.json')
const durationPolicyPath = resolve(repoRoot, 'curricula/DE/Gymnasium/provenance/gymnasium-duration-model-policy.json')
const compositionViewRoot = resolve(repoRoot, 'curricula/DE/Gymnasium/composition-views')
const gymnasiumOverviewPath = resolve(repoRoot, 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_OVERVIEW.de.json')
const outputPath = resolve(repoRoot, 'app/src/generated/gymnasiumDurationOfferings.ts')
const durationModels: DurationModel[] = ['G8', 'G9']
const stageOfferings: StageOffering[] = ['SekI', 'SekII', 'CrossStage']

const readJson = <T>(path: string): T => JSON.parse(readFileSync(path, 'utf8')) as T

const collectFiles = (directory: string, predicate: (path: string) => boolean, target: string[] = []): string[] => {
  let entries: ReturnType<typeof readdirSync>
  try {
    entries = readdirSync(directory, { withFileTypes: true })
  } catch {
    return target
  }

  for (const entry of entries) {
    const absolutePath = join(directory, entry.name)
    if (entry.isDirectory()) {
      collectFiles(absolutePath, predicate, target)
      continue
    }
    if (entry.isFile() && predicate(absolutePath)) {
      target.push(absolutePath)
    }
  }
  return target
}

const normalizeDurationModel = (value?: string): DurationModel | undefined => {
  const normalized = value?.trim().toUpperCase()
  return normalized === 'G8' || normalized === 'G9' ? normalized : undefined
}

const normalizeValue = (value?: string) => value?.trim().toLocaleUpperCase('de-DE') ?? ''

const stageTouchesSekI = (stage?: string) => {
  const normalized = normalizeValue(stage)
  return normalized === 'SEKI'
    || normalized === 'CROSSSTAGE'
    || normalized === 'GYMNASIUM'
    || normalized === 'SEKI+SEKII'
    || normalized === 'SEKI/SEKII'
    || normalized === 'SEKI-SEKII'
}

const matchStageScope = (viewStage?: string, requestedStage?: string) => {
  const normalizedViewStage = normalizeValue(viewStage)
  const normalizedRequestedStage = normalizeValue(requestedStage)
  if (!normalizedViewStage || !normalizedRequestedStage) return false
  if (normalizedViewStage === normalizedRequestedStage) return true
  return normalizedRequestedStage === 'CROSSSTAGE' && (normalizedViewStage === 'SEKI' || normalizedViewStage === 'SEKII')
}

const matchCourseProfileScope = (viewCourseProfile?: string, requestedCourseProfile?: string) => {
  const normalizedViewCourseProfile = normalizeValue(viewCourseProfile)
  const normalizedRequestedCourseProfile = normalizeValue(requestedCourseProfile)
  if (!normalizedViewCourseProfile || !normalizedRequestedCourseProfile) return false
  if (normalizedViewCourseProfile === normalizedRequestedCourseProfile) return true
  return (normalizedRequestedCourseProfile === 'ALL' || normalizedRequestedCourseProfile === 'GK+LK')
    && (normalizedViewCourseProfile === 'GK' || normalizedViewCourseProfile === 'LK')
}

const scopeMatches = (viewScope: Record<string, string | undefined>, requestedScope: Record<string, string>) => {
  const entries = Object.entries(viewScope).filter(([, value]) => typeof value === 'string' && value.trim())
  if (entries.length === 0) return false

  for (const [key, viewValue] of entries) {
    const requestedValue = requestedScope[key]
    if (!requestedValue) return false
    if (key === 'stage') {
      if (!matchStageScope(viewValue, requestedValue)) return false
      continue
    }
    if (key === 'courseProfile') {
      if (!matchCourseProfileScope(viewValue, requestedValue)) return false
      continue
    }
    if (normalizeValue(viewValue) !== normalizeValue(requestedValue)) return false
  }

  return true
}

const hasRuntimeView = (
  compositionViews: CompositionViewSummary[],
  subject: string,
  requestedScope: Record<string, string>,
) => {
  return compositionViews.some((view) => view.subject === subject && scopeMatches(view.scope, requestedScope))
}

const loadGymnasiumJurisdictions = () => {
  const overview = readJson<GymnasiumOverview>(gymnasiumOverviewPath)
  return (overview.filters ?? [])
    .map((filter) => filter.id?.trim())
    .filter((id): id is string => !!id && /^DE-[A-Z]{2}$/u.test(id))
}

const loadM6CanonicalGymnasiumSubjects = () => {
  const qualityStatus = readJson<CurriculumStatusDocument>(qualityStatusPath)
  const subjectToLandscapeId = new Map<string, string>()
  const landscapeIdToSubject = new Map<string, string>()

  for (const curriculum of qualityStatus.curricula ?? []) {
    if (!curriculum.subject || !curriculum.landscapeId) continue
    if (curriculum.maturity !== 'M6') continue
    if (!curriculum.frameworkId?.startsWith('canonical-gymnasium')) continue
    subjectToLandscapeId.set(curriculum.subject, curriculum.landscapeId)
    landscapeIdToSubject.set(curriculum.landscapeId, curriculum.subject)
  }

  return { subjectToLandscapeId, landscapeIdToSubject }
}

const loadCompositionViews = (landscapeIdToSubject: Map<string, string>) => (
  collectFiles(compositionViewRoot, (path) => /\.view\.json$/iu.test(path))
    .map((viewPath) => {
      try {
        const view = readJson<CompositionView>(viewPath)
        const subject = view.landscapeId ? landscapeIdToSubject.get(view.landscapeId) : undefined
        if (!subject || !view.viewId || !view.scope) return null
        return { subject, viewId: view.viewId, scope: view.scope }
      } catch {
        return null
      }
    })
    .filter((view): view is CompositionViewSummary => view !== null)
)

const renderGeneratedFile = ({
  durationOfferings,
  contentOfferings,
}: {
  durationOfferings: Record<string, Record<string, DurationModel[]>>
  contentOfferings: Record<string, Record<string, { stages: StageOffering[]; durationModels: DurationModel[] }>>
}) => {
  const durationJson = JSON.stringify(durationOfferings, null, 2)
    .replace(/"G8"/gu, "'G8'")
    .replace(/"G9"/gu, "'G9'")
    .replace(/"([^"]+)":/gu, "'$1':")

  const contentJson = JSON.stringify(contentOfferings, null, 2)
    .replace(/"G8"/gu, "'G8'")
    .replace(/"G9"/gu, "'G9'")
    .replace(/"SekI"/gu, "'SekI'")
    .replace(/"SekII"/gu, "'SekII'")
    .replace(/"CrossStage"/gu, "'CrossStage'")
    .replace(/"([^"]+)":/gu, "'$1':")

  return `// Generated by app/scripts/generateGymnasiumDurationOfferings.ts.\n// Source of truth: curricula/DE/Gymnasium/provenance/gymnasium-duration-model-policy.json plus registered composition views.\nimport type { KnownDurationModel } from '../utils/durationModel'\n\nexport type GymnasiumStageOffering = 'SekI' | 'SekII' | 'CrossStage'\nexport type GymnasiumDurationOfferings = Record<string, Record<string, readonly KnownDurationModel[]>>\nexport type GymnasiumContentOfferings = Record<string, Record<string, {\n  readonly stages: readonly GymnasiumStageOffering[]\n  readonly durationModels: readonly KnownDurationModel[]\n}>>\n\nexport const GYMNASIUM_DURATION_OFFERINGS = ${durationJson} as const satisfies GymnasiumDurationOfferings\n\nexport const GYMNASIUM_CONTENT_OFFERINGS = ${contentJson} as const satisfies GymnasiumContentOfferings\n`
}

const main = () => {
  if (!existsSync(qualityStatusPath)) {
    throw new Error(`Missing quality status: ${qualityStatusPath}`)
  }
  if (!existsSync(durationPolicyPath)) {
    throw new Error(`Missing duration policy: ${durationPolicyPath}`)
  }
  if (!existsSync(gymnasiumOverviewPath)) {
    throw new Error(`Missing Gymnasium overview: ${gymnasiumOverviewPath}`)
  }

  const { subjectToLandscapeId, landscapeIdToSubject } = loadM6CanonicalGymnasiumSubjects()
  const compositionViews = loadCompositionViews(landscapeIdToSubject)
  const jurisdictions = loadGymnasiumJurisdictions()
  const policy = readJson<DurationPolicyDocument>(durationPolicyPath)
  const offerings: Record<string, Record<string, Set<DurationModel>>> = {}
  const contentOfferings: Record<string, Record<string, ContentOffering>> = {}

  const addContentOffering = (
    landscapeId: string,
    jurisdiction: string,
    stage: StageOffering,
    durationModel?: DurationModel,
  ) => {
    const byJurisdiction = contentOfferings[landscapeId] ?? {}
    const current = byJurisdiction[jurisdiction] ?? {
      stages: new Set<StageOffering>(),
      durationModels: new Set<DurationModel>(),
    }
    current.stages.add(stage)
    if (durationModel) {
      current.durationModels.add(durationModel)
    }
    byJurisdiction[jurisdiction] = current
    contentOfferings[landscapeId] = byJurisdiction
  }

  for (const decision of policy.decisions ?? []) {
    if (decision.status !== 'reviewed') continue
    if (!stageTouchesSekI(decision.stage)) continue
    const subject = decision.subject
    const jurisdiction = decision.jurisdiction
    if (!subject || !jurisdiction) continue
    const landscapeId = subjectToLandscapeId.get(subject)
    if (!landscapeId) continue

    const offeredDurationModels = (decision.durationModels ?? [])
      .map(normalizeDurationModel)
      .filter((durationModel): durationModel is DurationModel => !!durationModel)
      .filter((durationModel) => hasRuntimeView(compositionViews, subject, {
        schoolForm: 'Gymnasium',
        jurisdiction,
        stage: 'SekI',
        durationModel,
      }))

    if (offeredDurationModels.length === 0) continue

    const byJurisdiction = offerings[landscapeId] ?? {}
    const current = byJurisdiction[jurisdiction] ?? new Set<DurationModel>()
    offeredDurationModels.forEach((durationModel) => current.add(durationModel))
    byJurisdiction[jurisdiction] = current
    offerings[landscapeId] = byJurisdiction
    offeredDurationModels.forEach((durationModel) => addContentOffering(landscapeId, jurisdiction, 'SekI', durationModel))
  }

  for (const [subject, landscapeId] of subjectToLandscapeId.entries()) {
    for (const jurisdiction of jurisdictions) {
      if (hasRuntimeView(compositionViews, subject, {
        schoolForm: 'Gymnasium',
        jurisdiction,
        stage: 'SekII',
        courseProfile: 'GK+LK',
      })) {
        addContentOffering(landscapeId, jurisdiction, 'SekII')
      }
      if (hasRuntimeView(compositionViews, subject, {
        schoolForm: 'Gymnasium',
        jurisdiction,
        stage: 'CrossStage',
        courseProfile: 'GK+LK',
      })) {
        addContentOffering(landscapeId, jurisdiction, 'CrossStage')
      }
    }
  }

  const sorted: Record<string, Record<string, DurationModel[]>> = {}
  for (const landscapeId of Object.keys(offerings).sort()) {
    sorted[landscapeId] = {}
    for (const jurisdiction of Object.keys(offerings[landscapeId]).sort()) {
      sorted[landscapeId][jurisdiction] = durationModels.filter((durationModel) =>
        offerings[landscapeId][jurisdiction].has(durationModel),
      )
    }
  }
  const sortedContent: Record<string, Record<string, { stages: StageOffering[]; durationModels: DurationModel[] }>> = {}
  for (const landscapeId of Object.keys(contentOfferings).sort()) {
    sortedContent[landscapeId] = {}
    for (const jurisdiction of Object.keys(contentOfferings[landscapeId]).sort()) {
      const current = contentOfferings[landscapeId][jurisdiction]
      sortedContent[landscapeId][jurisdiction] = {
        stages: stageOfferings.filter((stage) => current.stages.has(stage)),
        durationModels: durationModels.filter((durationModel) => current.durationModels.has(durationModel)),
      }
    }
  }

  const nextContent = renderGeneratedFile({
    durationOfferings: sorted,
    contentOfferings: sortedContent,
  })
  const currentContent = existsSync(outputPath) ? readFileSync(outputPath, 'utf8') : ''
  if (shouldCheck && currentContent !== nextContent) {
    throw new Error('Generated Gymnasium duration offerings are out of date. Run npm run generate:gymnasium-duration-offerings.')
  }
  if (shouldWrite && currentContent !== nextContent) {
    mkdirSync(dirname(outputPath), { recursive: true })
    writeFileSync(outputPath, nextContent)
  }
  if (!shouldWrite && !shouldCheck) {
    process.stdout.write(nextContent)
  }
}

main()
