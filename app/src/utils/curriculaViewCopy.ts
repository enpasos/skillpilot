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
          green: 'Human QA',
          orange: 'Automated QA',
          red: 'Experimental',
          all: 'All',
        },
        qualityStatusLabels: {
          green: 'Human QA',
          orange: 'Automated QA',
          red: 'Experimental',
        },
        qualityStatusTitle: (status: CurriculumQualityStatus) => (
          `Quality status: ${
            status === 'green'
              ? 'Human QA'
              : status === 'orange'
                ? 'Automated QA'
                : 'Experimental'
          }`
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
          green: 'Menschliche QS',
          orange: 'Maschinelle QS',
          red: 'Experimentell',
          all: 'Alle',
        },
        qualityStatusLabels: {
          green: 'Menschliche QS',
          orange: 'Maschinelle QS',
          red: 'Experimentell',
        },
        qualityStatusTitle: (status: CurriculumQualityStatus) => (
          `Qualitätsstatus: ${
            status === 'green'
              ? 'Menschliche QS'
              : status === 'orange'
                ? 'Maschinelle QS'
                : 'Experimentell'
          }`
        ),
      }
)
