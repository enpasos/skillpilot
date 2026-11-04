import type { LabelLanguage } from './filterLabels'

export interface CurriculaChampionCopy {
  achievementsTooltip: string
  issuesTooltip: string
  pullRequestsTooltip: string
  activeChampionshipsTitle: string
  stopChampionship: string
  connectWithGithub: string
  trialTitle: string
  trialSignIn: string
  trialStartHint: string
  trialLoading: string
  trialLoadError: string
  retry: string
  noAssignments: string
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
        trialTitle: 'Your human QA',
        trialSignIn: 'Already a Curriculum Champion? Sign in with the GitHub account linked to your role to manage your trial.',
        trialStartHint: 'From M5 onward, existing learning progress in your scope counts as a trial already begun; pauses remain in effect. With no progress yet, you can choose “Begin trial”. The M0–M7 maturity level stays separate.',
        trialLoading: 'Loading your Champion roles…',
        trialLoadError: 'Your Champion roles could not be loaded. Please try again.',
        retry: 'Retry',
        noAssignments: 'No active Champion role is linked to this GitHub account. You can register below.',
        deregisterModalTitle: 'Stop Championship',
        deregisterModalConfirm: 'Confirm',
        deregisterPrompt: 'Select the championships you want to end:',
        noActiveChampionships: 'No active championships found.',
        championSummary: (count: number) => `You are a champion for ${count} ${count === 1 ? 'curriculum' : 'curricula'}`,
      }
    : {
        achievementsTooltip: 'In der Rolle Lernender Lernziele nachvollzogen',
        issuesTooltip: 'GitHub Issues mit Hinweisen auf Fehler/Schwächen erstellt',
        pullRequestsTooltip: 'GitHub Pull-Requests mit Lösungsvorschlägen erstellt',
        activeChampionshipsTitle: 'Aktive Champion-Rollen',
        stopChampionship: 'Champion-Rolle beenden',
        connectWithGithub: 'Mit GitHub verbinden',
        trialTitle: 'Deine menschliche QS',
        trialSignIn: 'Du bist bereits Curriculum-Champion? Melde dich mit dem GitHub-Konto deiner Rolle an, um deine Erprobung zu verwalten.',
        trialStartHint: 'Ab M5 zählt vorhandener Lernfortschritt in deinem Prüfumfang als begonnene Erprobung; Pausen bleiben wirksam. Ohne bisherigen Fortschritt kannst du „Erprobung beginnen“ wählen. Der Reifegrad M0–M7 bleibt davon getrennt.',
        trialLoading: 'Deine Champion-Rollen werden geladen…',
        trialLoadError: 'Deine Champion-Rollen konnten nicht geladen werden. Bitte versuche es erneut.',
        retry: 'Erneut laden',
        noAssignments: 'Mit diesem GitHub-Konto ist keine aktive Champion-Rolle verknüpft. Du kannst dich unten registrieren.',
        deregisterModalTitle: 'Champion-Rolle beenden',
        deregisterModalConfirm: 'Bestätigen',
        deregisterPrompt: 'Wähle die Champion-Rollen aus, die du beenden möchtest:',
        noActiveChampionships: 'Keine aktiven Champion-Rollen gefunden.',
        championSummary: (count: number) => `Du bist Champion für ${count} ${count === 1 ? 'Lehrplan' : 'Lehrpläne'}`,
      }
)
