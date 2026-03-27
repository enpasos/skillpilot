import type { LabelLanguage } from './filterLabels'

export interface LearnerViewCopy {
  activeGoalNotAllowedTitle: string
  activeGoalNotInFrontierMessage: string
  importValidationFailedTitle: string
  importFailedTitle: string
  importErrorTitle: string
  importSystemMessage: string
  revealMarkedScopeTitle: string
}

export const getLearnerViewCopy = (language: LabelLanguage): LearnerViewCopy => (
  language === 'de'
    ? {
        activeGoalNotAllowedTitle: 'Aktion nicht möglich',
        activeGoalNotInFrontierMessage: 'Dieses Ziel ist nicht im aktuellen Frontier.',
        importValidationFailedTitle: 'Import-Validierung fehlgeschlagen',
        importFailedTitle: 'Import fehlgeschlagen',
        importErrorTitle: 'Import-Fehler',
        importSystemMessage: 'Ein Netzwerk- oder Systemfehler ist während des Imports aufgetreten.',
        revealMarkedScopeTitle: 'Gehe zum markierten Scope',
      }
    : {
        activeGoalNotAllowedTitle: 'Action not allowed',
        activeGoalNotInFrontierMessage: 'This goal is not in the current frontier.',
        importValidationFailedTitle: 'Import Validation Failed',
        importFailedTitle: 'Import Failed',
        importErrorTitle: 'Import Error',
        importSystemMessage: 'A network or system error occurred during import.',
        revealMarkedScopeTitle: 'Go to marked scope',
      }
)
