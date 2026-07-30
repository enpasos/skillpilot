export type CurriculumQualityStatus = 'green' | 'orange' | 'red'
export type CurriculumQualityFilter = CurriculumQualityStatus | 'all'

export const CURRICULUM_QUALITY_FILTER_AVAILABLE = false

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

export const getCurriculumQualityStatus = (): CurriculumQualityStatus => 'red'

export const getGymnasiumSubjectQualityStatus = (): CurriculumQualityStatus => 'red'

export const buildGymnasiumSubjectQualityRows = <
  Quality extends GymnasiumSubjectQualityLike,
>(): GymnasiumSubjectQualityRow<Quality>[] => []

export const matchesCurriculumQualityFilter = (
  status: CurriculumQualityStatus,
  filter: CurriculumQualityFilter,
): boolean => filter === 'all' || filter === status

export const filterCurriculaByQuality = <
  Candidate extends CurriculumQualityCandidate,
>(
  candidates: readonly Candidate[],
): Candidate[] => [...candidates]
