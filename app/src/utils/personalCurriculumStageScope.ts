import type { UiGoal } from '../goalTypes'

export const GLOBAL_STAGE_SCOPE_CONFIG_IDS = {
  sek1: '__skillpilot_stage_scope_sek1__',
  sek2: '__skillpilot_stage_scope_sek2__',
} as const

export const GLOBAL_STAGE_SCOPE_OPTIONS = [
  { id: GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek1, label: 'Sekundarstufe I' },
  { id: GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek2, label: 'Sekundarstufe II' },
] as const

type PersonalCurriculumConfigLike = Record<string, { selected: boolean; filterId?: string }>

export const isCourseProfileFilterId = (filterId?: string) => {
  const normalized = (filterId ?? '').trim().toUpperCase()
  return normalized === 'GK' || normalized === 'LK' || normalized === 'ALL' || normalized === 'GK+LK'
}

export const getGlobalStageScopeSelection = (config: PersonalCurriculumConfigLike) => ({
  sek1Selected: config[GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek1]?.selected ?? true,
  sek2Selected: config[GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek2]?.selected ?? true,
})

export const applyDefaultGlobalStageScope = (config: PersonalCurriculumConfigLike) => {
  let corrected = false
  const next = { ...config }

  GLOBAL_STAGE_SCOPE_OPTIONS.forEach((option) => {
    if (next[option.id] !== undefined) return
    next[option.id] = { selected: true }
    corrected = true
  })

  const selection = getGlobalStageScopeSelection(next)
  if (!selection.sek1Selected && !selection.sek2Selected) {
    next[GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek1] = { selected: true }
    next[GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek2] = { selected: true }
    corrected = true
  }

  return { config: next, corrected }
}

export const goalMatchesGlobalStageScope = (
  goal: Pick<UiGoal, 'title' | 'tags'> | undefined,
  config: PersonalCurriculumConfigLike,
) => {
  if (!goal || !(goal.tags ?? []).includes('synthetic:program-unit')) {
    return true
  }

  const selection = getGlobalStageScopeSelection(config)

  if (goal.title === 'Sekundarstufe I') {
    return selection.sek1Selected
  }

  if (goal.title === 'Sekundarstufe II') {
    return selection.sek2Selected
  }

  return true
}
