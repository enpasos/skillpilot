import type { UiGoal } from '../goalTypes'
import { CANONICAL_GYMNASIUM_ROOT_ID } from './curriculumDisplay'
import { isDurationModelFilterId } from './durationModel'

export const GLOBAL_STAGE_SCOPE_CONFIG_IDS = {
  sek1: '__skillpilot_stage_scope_sek1__',
  sek2: '__skillpilot_stage_scope_sek2__',
} as const

export const GLOBAL_STAGE_SCOPE_OPTIONS = [
  { id: GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek1 },
  { id: GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek2 },
] as const

export const formatGlobalStageScopeLabel = (
  stageScopeId: string,
  language: 'de' | 'en',
): string => {
  switch (stageScopeId) {
    case GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek1:
      return language === 'de' ? 'Sekundarstufe I' : 'Lower secondary'
    case GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek2:
      return language === 'de' ? 'Sekundarstufe II' : 'Upper secondary'
    default:
      return stageScopeId
  }
}

export const getGlobalStageScopeOptions = (language: 'de' | 'en') =>
  GLOBAL_STAGE_SCOPE_OPTIONS.map((option) => ({
    ...option,
    label: formatGlobalStageScopeLabel(option.id, language),
  }))

export type PersonalCurriculumStageScope = 'SekI' | 'SekII' | 'CrossStage'

export interface PersonalCurriculumStageConfigEntry {
  selected?: boolean
  filterId?: string
  durationModel?: string
  stage?: string
}

export type PersonalCurriculumStageConfig = Record<string, PersonalCurriculumStageConfigEntry>

export interface PersonalCurriculumStageContext {
  rootLandscapeId?: string
  landscapeId?: string
}

export interface GlobalStageScopeSelection {
  sek1Selected: boolean
  sek2Selected: boolean
}

const normalizeComparableText = (value?: string) =>
  (value ?? '').trim().toUpperCase()

export const normalizePersonalCurriculumStageScope = (
  value?: string,
): PersonalCurriculumStageScope | undefined => {
  const normalized = normalizeComparableText(value).replace(/[^A-Z0-9]/gu, '')
  if (normalized === 'SEKI') return 'SekI'
  if (normalized === 'SEKII') return 'SekII'
  if (normalized === 'CROSSSTAGE') return 'CrossStage'
  return undefined
}

const stageScopeFromSelection = ({
  sek1Selected,
  sek2Selected,
}: GlobalStageScopeSelection): PersonalCurriculumStageScope | undefined => {
  if (sek1Selected && sek2Selected) return 'CrossStage'
  if (sek1Selected) return 'SekI'
  if (sek2Selected) return 'SekII'
  return undefined
}

const selectionFromStageScope = (
  stage: PersonalCurriculumStageScope,
): GlobalStageScopeSelection => {
  if (stage === 'SekI') {
    return { sek1Selected: true, sek2Selected: false }
  }
  if (stage === 'SekII') {
    return { sek1Selected: false, sek2Selected: true }
  }
  return { sek1Selected: true, sek2Selected: true }
}

const legacyStageScopeSelection = (
  config: PersonalCurriculumStageConfig,
): GlobalStageScopeSelection => ({
  sek1Selected: config[GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek1]?.selected === true,
  sek2Selected: config[GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek2]?.selected === true,
})

export const resolvePersonalCurriculumStageScope = (
  config: PersonalCurriculumStageConfig,
  {
    rootLandscapeId = CANONICAL_GYMNASIUM_ROOT_ID,
    landscapeId,
  }: PersonalCurriculumStageContext = {},
): PersonalCurriculumStageScope | undefined => {
  const rootStage = normalizePersonalCurriculumStageScope(
    config[rootLandscapeId]?.stage,
  )
  if (rootStage) {
    return rootStage
  }

  if (landscapeId && landscapeId !== rootLandscapeId) {
    const landscapeStage = normalizePersonalCurriculumStageScope(
      config[landscapeId]?.stage,
    )
    if (landscapeStage) {
      return landscapeStage
    }
  }

  const hasLegacyStageScope = GLOBAL_STAGE_SCOPE_OPTIONS.some(
    ({ id }) => typeof config[id]?.selected === 'boolean',
  )
  if (!hasLegacyStageScope) {
    return undefined
  }

  return stageScopeFromSelection(legacyStageScopeSelection(config))
}

const inferGoalStageScope = (
  goal: Pick<UiGoal, 'title' | 'tags' | 'phase'> | undefined,
): 'sek1' | 'sek2' | undefined => {
  if (!goal) return undefined

  const title = normalizeComparableText(goal.title)
  const phase = normalizeComparableText(goal.phase)
  const normalizedTags = new Set(
    (goal.tags ?? []).map((tag) => normalizeComparableText(tag)),
  )

  if (title === 'SEKUNDARSTUFE I' || title.startsWith('SEKUNDARSTUFE I ') || title.endsWith('(SEK I)')) {
    return 'sek1'
  }

  if (
    title === 'SEKUNDARSTUFE II'
    || title.startsWith('SEKUNDARSTUFE II ')
    || title.endsWith('(SEK II)')
    || title === 'KURSSTUFE'
    || title.startsWith('KURSSTUFE ')
  ) {
    return 'sek2'
  }

  if (phase === 'SEKI') {
    return 'sek1'
  }

  if (phase === 'SEKII') {
    return 'sek2'
  }

  const hasSek1PhaseTag = normalizedTags.has('PHASE:SEKI')
  const hasSek2PhaseTag = normalizedTags.has('PHASE:SEKII')
  if (hasSek1PhaseTag !== hasSek2PhaseTag) {
    return hasSek1PhaseTag ? 'sek1' : 'sek2'
  }

  if (/^J([5-9]|10)$/.test(phase)) {
    return 'sek1'
  }

  if (/^(E|Q[1-4]|ABITUR)$/.test(phase)) {
    return 'sek2'
  }

  if (/^JAHRGANG(?:SSTUFE)?\s+([5-9]|10)\b/.test(title)) {
    return 'sek1'
  }

  if (/^(E-PHASE|Q[1-4]\b|ABITUR)/.test(title)) {
    return 'sek2'
  }

  return undefined
}

export const isCourseProfileFilterId = (filterId?: string) => {
  const normalized = (filterId ?? '').trim().toUpperCase()
  return normalized === 'GK' || normalized === 'LK' || normalized === 'ALL' || normalized === 'GK+LK'
}

export { isDurationModelFilterId }

export const getGlobalStageScopeSelection = (
  config: PersonalCurriculumStageConfig,
  context: PersonalCurriculumStageContext = {},
): GlobalStageScopeSelection => {
  const stage = resolvePersonalCurriculumStageScope(config, context)
  return stage ? selectionFromStageScope(stage) : legacyStageScopeSelection(config)
}

export const setGlobalStageScopeSelection = <
  Config extends PersonalCurriculumStageConfig,
>(
  config: Config,
  selection: GlobalStageScopeSelection,
  {
    rootLandscapeId = CANONICAL_GYMNASIUM_ROOT_ID,
  }: PersonalCurriculumStageContext = {},
): Config => {
  const stage = stageScopeFromSelection(selection)
  const currentRootConfig = config[rootLandscapeId]
  const rootStage = normalizePersonalCurriculumStageScope(currentRootConfig?.stage)
  const sek1Marker = config[GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek1]
  const sek2Marker = config[GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek2]
  const nonRootStageEntryIds = Object.keys(config).filter((configId) =>
    configId !== rootLandscapeId
    && configId !== GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek1
    && configId !== GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek2
    && config[configId]?.stage !== undefined
  )
  const rootNeedsUpdate = stage
    ? !currentRootConfig || rootStage !== stage || currentRootConfig.stage !== stage
    : !!currentRootConfig && currentRootConfig.stage !== undefined
  const sek1NeedsUpdate =
    sek1Marker?.selected !== selection.sek1Selected
    || Object.keys(sek1Marker ?? {}).length !== 1
  const sek2NeedsUpdate =
    sek2Marker?.selected !== selection.sek2Selected
    || Object.keys(sek2Marker ?? {}).length !== 1

  if (
    !rootNeedsUpdate
    && !sek1NeedsUpdate
    && !sek2NeedsUpdate
    && nonRootStageEntryIds.length === 0
  ) {
    return config
  }

  const next: PersonalCurriculumStageConfig = {
    ...config,
    [GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek1]: {
      selected: selection.sek1Selected,
    },
    [GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek2]: {
      selected: selection.sek2Selected,
    },
  }

  if (stage || currentRootConfig) {
    const nextRootConfig = { ...currentRootConfig }
    if (stage) {
      nextRootConfig.selected = nextRootConfig.selected ?? true
      nextRootConfig.stage = stage
    } else {
      delete nextRootConfig.stage
    }
    next[rootLandscapeId] = nextRootConfig
  }
  nonRootStageEntryIds.forEach((configId) => {
    const nextEntry = { ...next[configId] }
    delete nextEntry.stage
    next[configId] = nextEntry
  })

  return next as Config
}

export const synchronizePersonalCurriculumStageScope = <
  Config extends PersonalCurriculumStageConfig,
>(
  config: Config,
  context: PersonalCurriculumStageContext = {},
) => {
  const stage = resolvePersonalCurriculumStageScope(config, context)
  if (!stage) {
    return {
      config,
      corrected: false,
      stage,
      selection: getGlobalStageScopeSelection(config, context),
    }
  }

  const selection = selectionFromStageScope(stage)
  const next = setGlobalStageScopeSelection(config, selection, context)
  return {
    config: next,
    corrected: next !== config,
    stage,
    selection,
  }
}

export const goalMatchesGlobalStageScope = (
  goal: Pick<UiGoal, 'title' | 'tags' | 'phase'> | undefined,
  config: PersonalCurriculumStageConfig,
  context: PersonalCurriculumStageContext = {},
) => {
  const inferredStage = inferGoalStageScope(goal)
  if (!goal || !inferredStage) {
    return true
  }

  const selection = getGlobalStageScopeSelection(config, context)

  if (inferredStage === 'sek1') {
    return selection.sek1Selected
  }

  if (inferredStage === 'sek2') {
    return selection.sek2Selected
  }

  return true
}
