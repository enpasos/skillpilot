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

const normalizeComparableText = (value?: string) =>
  (value ?? '').trim().toUpperCase()

const inferGoalStageScope = (
  goal: Pick<UiGoal, 'title' | 'tags' | 'phase'> | undefined,
): 'sek1' | 'sek2' | undefined => {
  if (!goal) return undefined

  const title = normalizeComparableText(goal.title)
  const phase = normalizeComparableText(goal.phase)

  if (title === 'SEKUNDARSTUFE I' || title.endsWith('(SEK I)')) {
    return 'sek1'
  }

  if (title === 'SEKUNDARSTUFE II' || title.endsWith('(SEK II)')) {
    return 'sek2'
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
  goal: Pick<UiGoal, 'title' | 'tags' | 'phase'> | undefined,
  config: PersonalCurriculumConfigLike,
) => {
  const inferredStage = inferGoalStageScope(goal)
  if (!goal || !inferredStage) {
    return true
  }

  const selection = getGlobalStageScopeSelection(config)

  if (inferredStage === 'sek1') {
    return selection.sek1Selected
  }

  if (inferredStage === 'sek2') {
    return selection.sek2Selected
  }

  return true
}
