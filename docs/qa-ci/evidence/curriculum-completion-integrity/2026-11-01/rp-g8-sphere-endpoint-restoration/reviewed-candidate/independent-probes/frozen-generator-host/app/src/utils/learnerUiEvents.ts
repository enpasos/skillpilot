export const LEARNER_UI_REFRESH_EVENT = 'skillpilot:learner-ui-refresh'

export type LearnerUiRefreshTarget = 'history' | 'tree' | 'all'

export type LearnerUiRefreshDetail = {
  skillpilotId: string
  reason?: string
  targets?: LearnerUiRefreshTarget[]
}

export const dispatchLearnerUiRefresh = (detail: LearnerUiRefreshDetail) => {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent<LearnerUiRefreshDetail>(LEARNER_UI_REFRESH_EVENT, { detail }))
}

