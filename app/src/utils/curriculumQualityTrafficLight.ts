import { CANONICAL_GYMNASIUM_ROOT_ID } from './curriculumDisplay'

export type CurriculumQualityStatus = 'green' | 'orange' | 'red'
export type CurriculumQualityFilter = CurriculumQualityStatus | 'all'

export const CURRICULUM_QUALITY_FILTER_AVAILABLE = true

export interface CurriculumQualityCandidate {
  curriculumId: string
  qualityMaturity?: string | null
}

export interface GymnasiumSubjectQualityLike {
  subject: string
  maturity?: string | null
}

export interface GymnasiumSubjectQualityRow<
  Quality extends GymnasiumSubjectQualityLike,
> {
  subject: string
  quality: Quality | null
}

export const CANONICAL_GYMNASIUM_MATH_ID = '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'
export const CANONICAL_GYMNASIUM_PHYSICS_ID = '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'

const GREEN_CURRICULUM_IDS = new Set([
  CANONICAL_GYMNASIUM_ROOT_ID,
  CANONICAL_GYMNASIUM_PHYSICS_ID,
])

export const MANUAL_ORANGE_CURRICULUM_IDS = [
  '08a43a1b-d97e-522c-9dfa-c950a493364e', // Biologie
  'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0', // Chemie
  '67bd301b-e11a-582d-94ba-4f4b1a4cefff', // Deutsch
  '92406d94-e3c1-58ec-b7c6-12122278d25a', // Geschichte
  '7d51b38c-a149-5407-bddc-d2ce7878b020', // Informatik
  '668cf206-941e-51f8-8704-3e8938631235', // Latein
  '51b60137-46e8-5498-973e-ea38bb32f327', // Politik und Wirtschaft
] as const

const ORANGE_CURRICULUM_IDS = new Set<string>(MANUAL_ORANGE_CURRICULUM_IDS)

const GREEN_GYMNASIUM_SUBJECTS = new Set([
  'physik',
  'physics',
])

const ORANGE_GYMNASIUM_SUBJECTS = new Set([
  'biologie',
  'biology',
  'chemie',
  'chemistry',
  'deutsch',
  'german',
  'geschichte',
  'history',
  'informatik',
  'computer science',
  'latein',
  'latin',
  'politik und wirtschaft',
  'politics and economics',
])

export const getCurriculumQualityStatus = (
  curriculumId: string,
  maturity?: string | null,
): CurriculumQualityStatus => {
  if (GREEN_CURRICULUM_IDS.has(curriculumId)) {
    return 'green'
  }
  if (maturity != null) {
    return maturity === 'M6' ? 'orange' : 'red'
  }
  return ORANGE_CURRICULUM_IDS.has(curriculumId) ? 'orange' : 'red'
}

export const getGymnasiumSubjectQualityStatus = (
  subject: string,
  maturity?: string | null,
): CurriculumQualityStatus => {
  if (GREEN_GYMNASIUM_SUBJECTS.has(subject.trim().toLocaleLowerCase('de-DE'))) {
    return 'green'
  }
  if (maturity != null) {
    return maturity === 'M6' ? 'orange' : 'red'
  }
  return ORANGE_GYMNASIUM_SUBJECTS.has(
    subject.trim().toLocaleLowerCase('de-DE'),
  )
    ? 'orange'
    : 'red'
}

export const buildGymnasiumSubjectQualityRows = <
  Quality extends GymnasiumSubjectQualityLike,
>(
  topLevelTopics: readonly string[] | undefined,
  topLevelTopicsEn: readonly string[] | undefined,
  subjectQuality: readonly Quality[] | undefined,
  language: 'de' | 'en',
): GymnasiumSubjectQualityRow<Quality>[] => {
  if (subjectQuality?.length) {
    return subjectQuality.map((quality) => {
      if (language !== 'en') {
        return { subject: quality.subject, quality }
      }
      const topicIndex = topLevelTopics?.findIndex(
        (topic) => topic.trim().toLocaleLowerCase('de-DE')
          === quality.subject.trim().toLocaleLowerCase('de-DE'),
      ) ?? -1
      return {
        subject: topicIndex >= 0
          ? (topLevelTopicsEn?.[topicIndex] || quality.subject)
          : quality.subject,
        quality,
      }
    })
  }

  const localizedTopics = language === 'en' && topLevelTopicsEn?.length
    ? topLevelTopicsEn
    : topLevelTopics
  return (localizedTopics ?? []).map((subject) => ({
    subject,
    quality: null,
  }))
}

export const matchesCurriculumQualityFilter = (
  status: CurriculumQualityStatus,
  filter: CurriculumQualityFilter,
): boolean => filter === 'all' || filter === status

export const filterCurriculaByQuality = <
  Candidate extends CurriculumQualityCandidate,
>(
  candidates: readonly Candidate[],
  filter: CurriculumQualityFilter,
  currentCurriculumId?: string,
): Candidate[] => candidates.filter((candidate) => (
    candidate.curriculumId === currentCurriculumId
    || matchesCurriculumQualityFilter(
      getCurriculumQualityStatus(
        candidate.curriculumId,
        candidate.qualityMaturity,
      ),
      filter,
    )
  ))
