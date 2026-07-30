import type { LabelLanguage } from './filterLabels'
import type {
  CurriculumQualityFilter,
  CurriculumQualityStatus,
} from './curriculumQualityTrafficLight'

export interface CurriculaViewCopy {
  topicsLabel: string
  noTopicsAvailable: string
  loggedInAsGithubUser: string
  deregisterEntriesBadge: (count: number) => string
  deregisterGoalsBadge: (count: number) => string
  qualityFilterLabel: string
  qualityFilterOptions: Record<CurriculumQualityFilter, string>
  qualityStatusLabels: Record<CurriculumQualityStatus, string>
  qualityStatusTitle: (status: CurriculumQualityStatus) => string
}

export const getCurriculaViewCopy = (language: LabelLanguage): CurriculaViewCopy => (
  language === 'en'
    ? {
        topicsLabel: 'Topics',
        noTopicsAvailable: 'No topics available.',
        loggedInAsGithubUser: 'Logged in as GitHub user',
        deregisterEntriesBadge: (count: number) => `${count} entries`,
        deregisterGoalsBadge: (count: number) => `${count} goals`,
        qualityFilterLabel: 'Quality status',
        qualityFilterOptions: {
          green: 'Green',
          orange: 'Orange',
          red: 'Red',
          all: 'All',
        },
        qualityStatusLabels: {
          green: 'Green',
          orange: 'Orange',
          red: 'Red',
        },
        qualityStatusTitle: (status: CurriculumQualityStatus) => (
          `Quality status: ${status === 'green' ? 'Green' : status === 'orange' ? 'Orange' : 'Red'}`
        ),
      }
    : {
        topicsLabel: 'Themen',
        noTopicsAvailable: 'Keine Themen verfügbar.',
        loggedInAsGithubUser: 'Als GitHub-Nutzer eingeloggt',
        deregisterEntriesBadge: (count: number) => `${count} Einträge`,
        deregisterGoalsBadge: (count: number) => `${count} Ziele`,
        qualityFilterLabel: 'Qualitätsampel',
        qualityFilterOptions: {
          green: 'Grün',
          orange: 'Orange',
          red: 'Rot',
          all: 'Alle',
        },
        qualityStatusLabels: {
          green: 'Grün',
          orange: 'Orange',
          red: 'Rot',
        },
        qualityStatusTitle: (status: CurriculumQualityStatus) => (
          `Qualitätsstatus: ${status === 'green' ? 'Grün' : status === 'orange' ? 'Orange' : 'Rot'}`
        ),
      }
)
