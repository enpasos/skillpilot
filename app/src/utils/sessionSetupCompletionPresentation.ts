import type { PersonalizationPlan } from './personalCurriculumEditorApi'
import { getPersonalizationOptionLabel } from './personalCurriculumOptionLabel'

export type SkillpilotIdSource = 'existing' | 'generated' | 'file' | null

export interface CompactCompletedSetupState {
  idSource: SkillpilotIdSource
  setupChangedInVisit: boolean
  curriculumConfirmed: boolean
  plan: PersonalizationPlan | null
  loading: boolean
  busy: boolean
  hasError: boolean
}

export const shouldCompactLoadedLearnerSetup = ({
  idSource,
  setupChangedInVisit,
  curriculumConfirmed,
  plan,
  loading,
  busy,
  hasError,
}: CompactCompletedSetupState) => (
  (idSource === 'existing' || idSource === 'file')
  && !setupChangedInVisit
  && curriculumConfirmed
  && plan?.stage === 'COMPLETE'
  && !loading
  && !busy
  && !hasError
)

/**
 * Short form of a SkillPilot ID for the collapsed step summary. The full ID
 * stays in its input; the summary only needs to be recognizable.
 */
export const formatSkillpilotIdSummary = (skillpilotId: string) => {
  const id = skillpilotId.trim()
  if (id.length <= 14) return id
  return `${id.slice(0, 8)}…${id.slice(-4)}`
}

export const getPersonalCurriculumSummaryItems = (
  plan: PersonalizationPlan | null,
  language: 'de' | 'en',
): string[] => {
  if (!plan || plan.stage !== 'COMPLETE') return []

  const seen = new Set<string>()
  const items: string[] = []
  for (const decision of [
    ...plan.completedDecisions,
    ...plan.preservedDecisions,
  ]) {
    for (const option of decision.selectedOptions) {
      const value = getPersonalizationOptionLabel(option, language).trim()
      if (!value || seen.has(value)) continue
      seen.add(value)
      items.push(value)
    }
  }
  return items
}

