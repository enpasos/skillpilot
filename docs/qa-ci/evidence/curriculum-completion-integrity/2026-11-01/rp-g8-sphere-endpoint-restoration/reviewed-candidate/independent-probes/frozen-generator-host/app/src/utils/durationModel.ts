import {
  GYMNASIUM_CONTENT_OFFERINGS,
  GYMNASIUM_DURATION_OFFERINGS,
  type GymnasiumStageOffering,
} from '../generated/gymnasiumDurationOfferings'
import type {
  RuntimeCurriculumCatalog,
  RuntimeCurriculumCatalogState,
} from './runtimeCurriculumCatalog'
import { normalizeJurisdictionCode } from './jurisdictionMetadata'

export const KNOWN_DURATION_MODELS = ['G8', 'G9'] as const

export type KnownDurationModel = (typeof KNOWN_DURATION_MODELS)[number]
const gymnasiumDurationOfferings: Record<string, Record<string, readonly KnownDurationModel[]>> =
  GYMNASIUM_DURATION_OFFERINGS
const gymnasiumContentOfferings: Record<string, Record<string, {
  readonly stages: readonly GymnasiumStageOffering[]
  readonly durationModels: readonly KnownDurationModel[]
}>> = GYMNASIUM_CONTENT_OFFERINGS

export type CurriculumOfferingSource =
  | { readonly mode: 'catalog'; readonly catalog: RuntimeCurriculumCatalog }
  | { readonly mode: 'repository' }
  | { readonly mode: 'unavailable' }

export const resolveCurriculumOfferingSource = (
  state: RuntimeCurriculumCatalogState,
): CurriculumOfferingSource => {
  if (state.mode === 'package') return { mode: 'catalog', catalog: state.catalog }
  if (state.mode === 'repository') return { mode: 'repository' }
  return { mode: 'unavailable' }
}

export const DEFAULT_DURATION_MODEL: KnownDurationModel = 'G9'

const DURATION_MODEL_ALIASES: Record<string, KnownDurationModel> = {
  G8: 'G8',
  G9: 'G9',
  'DURATIONMODEL:G8': 'G8',
  'DURATIONMODEL:G9': 'G9',
  'DURATION-MODEL:G8': 'G8',
  'DURATION-MODEL:G9': 'G9',
}

export const normalizeDurationModel = (raw: string | null | undefined): KnownDurationModel | null => {
  if (!raw) return null
  return DURATION_MODEL_ALIASES[raw.trim().toUpperCase()] ?? null
}

export const isDurationModelFilterId = (filterId?: string) =>
  normalizeDurationModel(filterId) !== null

export const getDurationModelOptions = (
  language: 'de' | 'en',
  allowedDurationModels: readonly KnownDurationModel[] = KNOWN_DURATION_MODELS,
) =>
  allowedDurationModels.map((id) => ({
    id,
    label: id,
    description: language === 'de'
      ? id === 'G8'
        ? 'Achtjähriger gymnasialer Bildungsgang'
        : 'Neunjähriger gymnasialer Bildungsgang'
      : id === 'G8'
        ? 'Eight-year Gymnasium path'
        : 'Nine-year Gymnasium path',
  }))

export const getOfferedGymnasiumDurationModels = (
  landscapeId?: string | null,
  jurisdiction?: string | null,
  source: CurriculumOfferingSource = { mode: 'repository' },
): readonly KnownDurationModel[] => {
  if (!landscapeId) return []
  if (source.mode === 'unavailable') return []
  if (source.mode === 'catalog') {
    const catalogJurisdiction = jurisdiction?.trim()
    if (!catalogJurisdiction) return []
    return KNOWN_DURATION_MODELS.filter((durationModel) => source.catalog.offerings.some((offering) => (
      offering.landscapeId === landscapeId
      && offering.scope.jurisdiction === catalogJurisdiction
      && normalizeDurationModel(offering.scope.durationModel) === durationModel
    )))
  }
  const normalizedJurisdiction = normalizeJurisdictionCode(jurisdiction)
  if (!normalizedJurisdiction) return []
  return gymnasiumDurationOfferings[landscapeId]?.[normalizedJurisdiction] ?? []
}

export interface GymnasiumStageSelection {
  sek1Selected: boolean
  sek2Selected: boolean
}

export const getOfferedGymnasiumStages = (
  landscapeId?: string | null,
  jurisdiction?: string | null,
  source: CurriculumOfferingSource = { mode: 'repository' },
): readonly GymnasiumStageOffering[] => {
  if (!landscapeId) return []
  if (source.mode === 'unavailable') return []
  if (source.mode === 'catalog') {
    const catalogJurisdiction = jurisdiction?.trim()
    if (!catalogJurisdiction) return []
    const stages = new Set<GymnasiumStageOffering>()
    source.catalog.offerings.forEach((offering) => {
      if (
        offering.landscapeId !== landscapeId
        || offering.scope.jurisdiction !== catalogJurisdiction
      ) return
      const stage = offering.scope.stage
      if (stage === 'SekI' || stage === 'SekII' || stage === 'CrossStage') {
        stages.add(stage)
      }
    })
    return ['SekI', 'SekII', 'CrossStage'].filter((stage) => stages.has(stage as GymnasiumStageOffering)) as GymnasiumStageOffering[]
  }
  const normalizedJurisdiction = normalizeJurisdictionCode(jurisdiction)
  if (!normalizedJurisdiction) return []
  return gymnasiumContentOfferings[landscapeId]?.[normalizedJurisdiction]?.stages ?? []
}

export const isGymnasiumSubjectOfferedForStageSelection = (
  landscapeId: string,
  jurisdiction: string | null | undefined,
  stageSelection: GymnasiumStageSelection,
  source: CurriculumOfferingSource = { mode: 'repository' },
) => {
  const offeredStages = getOfferedGymnasiumStages(landscapeId, jurisdiction, source)
  if (offeredStages.length === 0) return false
  if (stageSelection.sek1Selected && stageSelection.sek2Selected) {
    return offeredStages.includes('CrossStage')
  }
  if (stageSelection.sek1Selected) {
    return offeredStages.includes('SekI') || offeredStages.includes('CrossStage')
  }
  if (stageSelection.sek2Selected) {
    return offeredStages.includes('SekII') || offeredStages.includes('CrossStage')
  }
  return false
}

export const normalizeOfferedDurationModel = (
  raw: string | null | undefined,
  offeredDurationModels: readonly KnownDurationModel[],
): KnownDurationModel | null => {
  const normalized = normalizeDurationModel(raw)
  if (normalized && offeredDurationModels.includes(normalized)) {
    return normalized
  }
  return offeredDurationModels[0] ?? null
}
