import type { LabelLanguage } from './filterLabels'

export interface LearnerViewCopy {
  activeGoalNotAllowedTitle: string
  activeGoalNotInFrontierMessage: string
  importValidationFailedTitle: string
  importFailedTitle: string
  importErrorTitle: string
  importSystemMessage: string
  revealMarkedScopeTitle: string
  memoryGoalModeTitle: string
  memoryGoalModeBody: string
  memoryPracticeAction: string
  memoryPracticeBody: string
  memoryVerifiedRecallAction: string
  memoryVerifiedRecallBody: string
  memoryPracticeBackAction: string
  memoryVerifiedRecallPromptCopied: string
  memoryVerifiedRecallPromptCopyFailed: string
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
        memoryGoalModeTitle: 'Kartenknoten',
        memoryGoalModeBody: 'Üben findet im Cockpit statt. Die harte Prüfung läuft mit dem Trainer GPT, damit die Antwort ohne Kartenhilfe abgefragt und anschließend gespeichert wird.',
        memoryPracticeAction: 'Im Cockpit üben',
        memoryPracticeBody: 'Wiederhole fällige Karten mit dem SRS-Drill.',
        memoryVerifiedRecallAction: 'Mit Trainer GPT prüfen',
        memoryVerifiedRecallBody: 'Starte die harte Abfrage für dieses aktive Lernziel.',
        memoryPracticeBackAction: 'Zur Auswahl',
        memoryVerifiedRecallPromptCopied: 'Starttext für den Trainer GPT wurde kopiert.',
        memoryVerifiedRecallPromptCopyFailed: 'Trainer GPT wurde geöffnet. Bitte starte dort die harte Kartenprüfung für das aktive Lernziel.',
      }
    : {
        activeGoalNotAllowedTitle: 'Action not allowed',
        activeGoalNotInFrontierMessage: 'This goal is not in the current frontier.',
        importValidationFailedTitle: 'Import Validation Failed',
        importFailedTitle: 'Import Failed',
        importErrorTitle: 'Import Error',
        importSystemMessage: 'A network or system error occurred during import.',
        revealMarkedScopeTitle: 'Go to marked scope',
        memoryGoalModeTitle: 'Flashcard node',
        memoryGoalModeBody: 'Practice stays in the cockpit. Hard verification runs through Trainer GPT so the answer is recalled without card help and then saved.',
        memoryPracticeAction: 'Practice in cockpit',
        memoryPracticeBody: 'Review due cards with the SRS drill.',
        memoryVerifiedRecallAction: 'Verify with Trainer GPT',
        memoryVerifiedRecallBody: 'Start hard recall for this active goal.',
        memoryPracticeBackAction: 'Back to choices',
        memoryVerifiedRecallPromptCopied: 'Trainer GPT start text was copied.',
        memoryVerifiedRecallPromptCopyFailed: 'Trainer GPT was opened. Please start hard flashcard verification for the active goal there.',
      }
)
