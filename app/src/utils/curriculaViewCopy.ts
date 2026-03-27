import type { LabelLanguage } from './filterLabels'

export interface CurriculaViewCopy {
  topicsLabel: string
  noTopicsAvailable: string
  loggedInAsGithubUser: string
  deregisterEntriesBadge: (count: number) => string
  deregisterGoalsBadge: (count: number) => string
}

export const getCurriculaViewCopy = (language: LabelLanguage): CurriculaViewCopy => (
  language === 'en'
    ? {
        topicsLabel: 'Topics',
        noTopicsAvailable: 'No topics available.',
        loggedInAsGithubUser: 'Logged in as GitHub user',
        deregisterEntriesBadge: (count: number) => `${count} entries`,
        deregisterGoalsBadge: (count: number) => `${count} goals`,
      }
    : {
        topicsLabel: 'Themen',
        noTopicsAvailable: 'Keine Themen verfuegbar.',
        loggedInAsGithubUser: 'Als GitHub-Nutzer eingeloggt',
        deregisterEntriesBadge: (count: number) => `${count} Eintraege`,
        deregisterGoalsBadge: (count: number) => `${count} Ziele`,
      }
)
