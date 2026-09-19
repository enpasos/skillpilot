export const curriculumQualityStatuses = [
  'experimental', 'machine_qa', 'human_trial_in_progress', 'human_trial_completed',
] as const
export type CurriculumQualityStatus = typeof curriculumQualityStatuses[number]
export type CurriculumQualityFilter = CurriculumQualityStatus | 'all'

export interface CurriculumHumanTrial {
  state: 'not_started' | 'in_progress' | 'completed'
  scopeLabel: string
  scopeCoverage: 'full' | 'partial'
  requiredGoals: number
  practicedGoals: number
}
export interface CurriculumQualityProjection {
  qualityStatus?: CurriculumQualityStatus | null
  humanTrial?: CurriculumHumanTrial | null
}
export interface CurriculumQualityCandidate extends CurriculumQualityProjection {
  curriculumId: string
  qualityMaturity?: string | null
  subjectQuality?: readonly CurriculumQualityProjection[] | null
}
export interface GymnasiumSubjectQualityLike extends CurriculumQualityProjection {
  subject: string
  maturity?: string | null
}
export interface GymnasiumSubjectQualityRow<Quality extends GymnasiumSubjectQualityLike> {
  subject: string
  quality: Quality | null
}
export const CURRICULUM_QUALITY_FILTER_AVAILABLE = true

/** A missing or unknown server status never becomes a quality judgement. */
export const getCurriculumQualityStatus = (
  candidate: { qualityStatus?: unknown } | null | undefined,
): CurriculumQualityStatus | null => {
  const status = candidate?.qualityStatus
  return curriculumQualityStatuses.includes(status as CurriculumQualityStatus)
    ? status as CurriculumQualityStatus : null
}
export const getGymnasiumSubjectQualityStatus = getCurriculumQualityStatus
export const matchesCurriculumQualityFilter = (
  status: CurriculumQualityStatus | null,
  filter: CurriculumQualityFilter,
): boolean => filter === 'all' || filter === status
export const filterCurriculaByQuality = <Candidate extends CurriculumQualityCandidate>(
  candidates: readonly Candidate[],
  filter: CurriculumQualityFilter,
  currentCurriculumId?: string,
): Candidate[] => candidates.filter((candidate) => (
  candidate.curriculumId === currentCurriculumId
  || matchesCurriculumQualityFilter(getCurriculumQualityStatus(candidate), filter)
  || (candidate.subjectQuality ?? []).some((subject) => (
    matchesCurriculumQualityFilter(getCurriculumQualityStatus(subject), filter)
  ))
))
export const buildGymnasiumSubjectQualityRows = <Quality extends GymnasiumSubjectQualityLike>(
  topLevelTopics: readonly string[] | undefined,
  topLevelTopicsEn: readonly string[] | undefined,
  subjectQuality: readonly Quality[] | undefined,
  language: 'de' | 'en',
): GymnasiumSubjectQualityRow<Quality>[] => {
  if (subjectQuality?.length) {
    return subjectQuality.map((quality) => {
      if (language !== 'en') return { subject: quality.subject, quality }
      // Labels select a translation only; they never determine quality.
      const topicIndex = topLevelTopics?.findIndex((topic) => (
        topic.trim().toLocaleLowerCase('de-DE') === quality.subject.trim().toLocaleLowerCase('de-DE')
      )) ?? -1
      return {
        subject: topicIndex >= 0 ? (topLevelTopicsEn?.[topicIndex] || quality.subject) : quality.subject,
        quality,
      }
    })
  }
  const topics = language === 'en' && topLevelTopicsEn?.length ? topLevelTopicsEn : topLevelTopics
  return (topics ?? []).map((subject) => ({ subject, quality: null }))
}
