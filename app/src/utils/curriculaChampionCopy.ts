import type { LabelLanguage } from './filterLabels'

export interface CurriculaChampionCopy {
  achievementsTooltip: string
  issuesTooltip: string
  pullRequestsTooltip: string
  activeChampionshipsTitle: string
  stopChampionship: string
  connectWithGithub: string
  deregisterModalTitle: string
  deregisterModalConfirm: string
  deregisterPrompt: string
  noActiveChampionships: string
  championSummary: (count: number) => string
}

export const getCurriculaChampionCopy = (language: LabelLanguage): CurriculaChampionCopy => (
  language === 'en'
    ? {
        achievementsTooltip: 'Learning goals completed as a learner',
        issuesTooltip: 'GitHub issues created to report errors or weaknesses',
        pullRequestsTooltip: 'GitHub pull requests created with proposed solutions',
        activeChampionshipsTitle: 'Active Championships',
        stopChampionship: 'Stop Championship',
        connectWithGithub: 'Connect with GitHub',
        deregisterModalTitle: 'Stop Championship',
        deregisterModalConfirm: 'Confirm',
        deregisterPrompt: 'Select the championships you want to end:',
        noActiveChampionships: 'No active championships found.',
        championSummary: (count: number) => `You are a champion for ${count} ${count === 1 ? 'curriculum' : 'curricula'}`,
      }
    : {
        achievementsTooltip: 'In der Rolle Lernender Lernziele nachvollzogen',
        issuesTooltip: 'GitHub Issues mit Hinweisen auf Fehler/Schwaechen erstellt',
        pullRequestsTooltip: 'GitHub Pull-Requests mit Loesungsvorschlaegen erstellt',
        activeChampionshipsTitle: 'Aktive Championships',
        stopChampionship: 'Championship beenden',
        connectWithGithub: 'Mit GitHub verbinden',
        deregisterModalTitle: 'Championship beenden',
        deregisterModalConfirm: 'Bestätigen',
        deregisterPrompt: 'Wähle die Championships aus, die du beenden möchtest:',
        noActiveChampionships: 'Keine aktiven Championships gefunden.',
        championSummary: (count: number) => `Du bist Champion für ${count} ${count === 1 ? 'Lehrplan' : 'Lehrpläne'}`,
      }
)
