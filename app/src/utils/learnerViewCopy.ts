import type { LabelLanguage } from './filterLabels'

export interface LearnerViewCopy {
  activeGoalNotAllowedTitle: string
  activeGoalNotInFrontierMessage: string
  importValidationFailedTitle: string
  importFailedTitle: string
  importErrorTitle: string
  importSystemMessage: string
  revealMarkedScopeTitle: string
  revealActiveGoalTitle: string
  memoryGoalModeTitle: string
  memoryGoalModeBody: string
  memoryModeLabel: string
  memoryPracticeMode: string
  memoryVerifyMode: string
  memoryPracticeAction: string
  memoryPracticeBody: string
  memoryVerifiedRecallAction: string
  memoryVerifiedRecallBody: string
  memoryVerifiedRecallBatchLabel: string
  memoryPracticeStatusLabel: string
  memoryVerificationStatusLabel: string
  memoryPracticeDueStatus: string
  memoryVerificationPassedStatus: string
  memoryVerificationEligibleStatus: string
  memoryVerificationBlockedStatus: string
  memoryVerificationCompleteStatus: string
  memoryVerificationWaitingStatus: string
  memoryPracticeBackAction: string
  memoryVerifiedRecallLaunchFailed: string
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
        revealActiveGoalTitle: 'Gehe zum aktiven Ziel',
        memoryGoalModeTitle: 'Karteikarten lernen',
        memoryGoalModeBody: 'Lerne hier mit Karteikarten oder starte die harte Prüfung mit dem Lerncoach. Dabei wird die Antwort ohne Kartenhilfe abgefragt und anschließend gespeichert.',
        memoryModeLabel: 'Modus',
        memoryPracticeMode: 'Üben',
        memoryVerifyMode: 'Prüfen',
        memoryPracticeAction: 'Karteikarten lernen',
        memoryPracticeBody: 'Wiederhole die heute fälligen Karteikarten.',
        memoryVerifiedRecallAction: 'Mit Lerncoach prüfen',
        memoryVerifiedRecallBody: 'Starte die harte Abfrage für dieses aktive Lernziel.',
        memoryVerifiedRecallBatchLabel: 'Batchgröße',
        memoryPracticeStatusLabel: 'Üben',
        memoryVerificationStatusLabel: 'Prüfung',
        memoryPracticeDueStatus: '{0}/{1} fällig',
        memoryVerificationPassedStatus: '{0}/{1} bestanden',
        memoryVerificationEligibleStatus: '{0} heute prüfbar',
        memoryVerificationBlockedStatus: '{0} heute gesperrt',
        memoryVerificationCompleteStatus: 'Prüfung bestanden',
        memoryVerificationWaitingStatus: 'Heute keine Karte prüfbar',
        memoryPracticeBackAction: 'Zur Auswahl',
        memoryVerifiedRecallLaunchFailed: 'Der Lerncoach konnte nicht geöffnet werden. Bitte versuche es erneut.',
      }
    : {
        activeGoalNotAllowedTitle: 'Action not allowed',
        activeGoalNotInFrontierMessage: 'This goal is not in the current frontier.',
        importValidationFailedTitle: 'Import Validation Failed',
        importFailedTitle: 'Import Failed',
        importErrorTitle: 'Import Error',
        importSystemMessage: 'A network or system error occurred during import.',
        revealMarkedScopeTitle: 'Go to marked scope',
        revealActiveGoalTitle: 'Go to active goal',
        memoryGoalModeTitle: 'Learn with flashcards',
        memoryGoalModeBody: 'Learn here with flashcards or start strict verification with the Learning Coach. The answer is recalled without card help and then saved.',
        memoryModeLabel: 'Mode',
        memoryPracticeMode: 'Practice',
        memoryVerifyMode: 'Check',
        memoryPracticeAction: 'Learn with flashcards',
        memoryPracticeBody: 'Review the flashcards that are due today.',
        memoryVerifiedRecallAction: 'Verify with Learning Coach',
        memoryVerifiedRecallBody: 'Start hard recall for this active goal.',
        memoryVerifiedRecallBatchLabel: 'Batch size',
        memoryPracticeStatusLabel: 'Practice',
        memoryVerificationStatusLabel: 'Verification',
        memoryPracticeDueStatus: '{0}/{1} due',
        memoryVerificationPassedStatus: '{0}/{1} passed',
        memoryVerificationEligibleStatus: '{0} testable today',
        memoryVerificationBlockedStatus: '{0} locked today',
        memoryVerificationCompleteStatus: 'Verification complete',
        memoryVerificationWaitingStatus: 'No card testable today',
        memoryPracticeBackAction: 'Back to choices',
        memoryVerifiedRecallLaunchFailed: 'The Learning Coach could not be opened. Please try again.',
      }
)
