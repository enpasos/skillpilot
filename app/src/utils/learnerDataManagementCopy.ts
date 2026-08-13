import type { LabelLanguage } from './filterLabels'

export interface LearnerDataManagementCopy {
  openAction: string
  closeAction: string
  title: string
  description: string
  idLabel: string
  retentionTitle: string
  lastActivityLabel: string
  scheduledDeletionLabel: string
  retentionExplanation: string
  retentionLoading: string
  retentionFailed: string
  resumeFailed: string
  missingLearner: string
  exportTitle: string
  exportDescription: string
  exportAction: string
  importTitle: string
  importDescription: string
  importAction: string
  copySourcesTitle: string
  copySourcesEntrySingular: string
  copySourcesEntryPlural: string
  dangerTitle: string
  dangerDescription: string
  beginDeleteAction: string
  confirmTitle: string
  confirmDescription: string
  confirmServerData: string
  confirmExternalData: string
  confirmBackupHint: string
  confirmCheckbox: string
  cancelDeleteAction: string
  finalDeleteAction: string
  deletingAction: string
  deleteFailed: string
  deleteMissing: string
  deleteSuccess: string
}

export const getLearnerDataManagementCopy = (
  language: LabelLanguage,
): LearnerDataManagementCopy => language === 'de'
  ? {
      openAction: 'Daten & SkillPilot-ID',
      closeAction: 'Dialog schließen',
      title: 'Daten & SkillPilot-ID',
      description: 'Hier kannst du deinen Lernstand sichern, wiederherstellen oder deine SkillPilot-ID mit den aktuell verwendeten SkillPilot-Produktdaten löschen.',
      idLabel: 'Aktuelle SkillPilot-ID',
      retentionTitle: 'Aufbewahrung',
      lastActivityLabel: 'Letzte Aktivität',
      scheduledDeletionLabel: 'Automatische Löschung ab',
      retentionExplanation: 'Nach 365 Tagen ohne erfolgreiche Aktivität ist die SkillPilot-ID zur automatischen Löschung fällig und wird beim nächsten Bereinigungslauf entfernt. Als Aktivität zählen nur erfolgreiche ID-Erstellung, das aktive Laden oder Fortsetzen des Lernstands in der Weboberfläche, ein vom Server abgeschlossener Import oder Export signierter Lerndaten, eine gespeicherte Lernstandsänderung, eine erfolgreiche SkillPilot-Sitzungs- oder KI-Anbieter-Verbindungsaktion oder ein gültiger Coach-/MCP-Aufruf mit fachlich erfolgreichem Ergebnis. Hintergrund-GET-Anfragen, SSE-Verkehr, OAuth-Token-Aktualisierungen, bloße Dateiauswahl oder -öffnung sowie vom Server nicht abgeschlossene oder fachlich abgewiesene Aktionen zählen nicht.',
      retentionLoading: 'Aufbewahrungsdaten werden geladen …',
      retentionFailed: 'Die Aufbewahrungsdaten konnten nicht geladen werden. Bitte versuche es erneut.',
      resumeFailed: 'SkillPilot konnte nicht bestätigen, dass die Aktivität gespeichert wurde. Die angezeigte Löschfrist ist möglicherweise nicht aktuell. Bitte lade die Seite neu und versuche es erneut.',
      missingLearner: 'Diese SkillPilot-ID wurde nicht gefunden. Sie wurde möglicherweise bereits gelöscht oder ist nicht korrekt.',
      exportTitle: 'Lernstand sichern',
      exportDescription: 'Lade eine Sicherung deines aktuellen Lernstands herunter.',
      exportAction: 'Lernstand exportieren',
      importTitle: 'Lernstand wiederherstellen',
      importDescription: 'Importiere eine zuvor von SkillPilot erzeugte Sicherungsdatei in diese SkillPilot-ID.',
      importAction: 'Sicherungsdatei importieren',
      copySourcesTitle: 'Datenherkunft',
      copySourcesEntrySingular: 'Eintrag',
      copySourcesEntryPlural: 'Einträge',
      dangerTitle: 'SkillPilot-ID löschen',
      dangerDescription: 'Die SkillPilot-ID, der aktuell verwendete serverseitige Lernstand sowie zugehörige SkillPilot-Sitzungen und -Verbindungen werden aus dem aktiven SkillPilot-System gelöscht. Diese Aktion lässt sich nicht rückgängig machen.',
      beginDeleteAction: 'SkillPilot-ID und Daten löschen',
      confirmTitle: 'Löschung endgültig bestätigen',
      confirmDescription: 'Diese Aktion kann nicht rückgängig gemacht werden. Nach der Löschung funktioniert diese SkillPilot-ID nicht mehr.',
      confirmServerData: 'Gelöscht werden der aktuell verwendete serverseitige Lernstand sowie zugehörige SkillPilot-Sitzungen und SkillPilot-seitige Verbindungs- und Autorisierungsdaten zu dieser ID.',
      confirmExternalData: 'Dateien auf deinen Geräten und Chatverläufe bei externen KI-Anbietern werden dadurch nicht gelöscht. Bestehende technische Sicherungskopien werden durch diese Löschung nicht einzeln unmittelbar entfernt.',
      confirmBackupHint: 'Sichere jetzt zuerst alles, was du behalten möchtest.',
      confirmCheckbox: 'Ich verstehe, dass die SkillPilot-ID und die genannten aktiven SkillPilot-Produktdaten unwiderruflich gelöscht werden.',
      cancelDeleteAction: 'Nicht löschen',
      finalDeleteAction: 'Endgültig löschen',
      deletingAction: 'Wird gelöscht …',
      deleteFailed: 'Die SkillPilot-ID konnte nicht gelöscht werden. Es wurden keine lokalen Daten entfernt.',
      deleteMissing: 'Diese SkillPilot-ID wurde nicht gefunden. Sie wurde möglicherweise bereits automatisch oder auf einem anderen Gerät gelöscht.',
      deleteSuccess: 'Die SkillPilot-ID, der aktuell verwendete serverseitige Lernstand sowie zugehörige SkillPilot-Sitzungen und -Verbindungen wurden gelöscht.',
    }
  : {
      openAction: 'Data & SkillPilot ID',
      closeAction: 'Close dialog',
      title: 'Data & SkillPilot ID',
      description: 'Back up or restore your learning state here, or delete your SkillPilot ID and the SkillPilot product data currently in use.',
      idLabel: 'Current SkillPilot ID',
      retentionTitle: 'Retention',
      lastActivityLabel: 'Last activity',
      scheduledDeletionLabel: 'Automatic deletion from',
      retentionExplanation: 'After 365 days without successful activity, the SkillPilot ID becomes due for automatic deletion and is removed during the next cleanup run. Only successful ID creation, foreground loading or resuming of the learning state in the WebGUI, a server-completed import or export of signed learner data, a stored learner-state change, a successful SkillPilot session or AI-provider connection action, or a valid Coach/MCP call with a successful domain result counts as activity. Background GET requests, SSE traffic, OAuth token refreshes, merely selecting or opening a file, and server operations that do not complete or are domain-rejected do not count.',
      retentionLoading: 'Loading retention information …',
      retentionFailed: 'Retention information could not be loaded. Please try again.',
      resumeFailed: 'SkillPilot could not confirm that activity was saved. The displayed deletion deadline may not be current. Reload the page and try again.',
      missingLearner: 'This SkillPilot ID was not found. It may already have been deleted or may be incorrect.',
      exportTitle: 'Back up learning state',
      exportDescription: 'Download a backup of your current learning state.',
      exportAction: 'Export learning state',
      importTitle: 'Restore learning state',
      importDescription: 'Import a backup file previously created by SkillPilot into this SkillPilot ID.',
      importAction: 'Import backup file',
      copySourcesTitle: 'Data origin',
      copySourcesEntrySingular: 'entry',
      copySourcesEntryPlural: 'entries',
      dangerTitle: 'Delete SkillPilot ID',
      dangerDescription: 'The SkillPilot ID, the server-side learning state currently in use, and associated SkillPilot sessions and connections will be deleted from the active SkillPilot system. This action cannot be undone.',
      beginDeleteAction: 'Delete SkillPilot ID and data',
      confirmTitle: 'Confirm permanent deletion',
      confirmDescription: 'This action cannot be undone. This SkillPilot ID will no longer work after deletion.',
      confirmServerData: 'The server-side learning state currently in use, associated SkillPilot sessions, and SkillPilot-side connection and authorization data for this ID will be deleted.',
      confirmExternalData: 'Files on your devices and chats held by external AI providers are not deleted by this action. This deletion does not individually and immediately remove existing technical backup copies.',
      confirmBackupHint: 'Back up anything you want to keep before continuing.',
      confirmCheckbox: 'I understand that the SkillPilot ID and the active SkillPilot product data described above will be permanently deleted.',
      cancelDeleteAction: 'Do not delete',
      finalDeleteAction: 'Delete permanently',
      deletingAction: 'Deleting …',
      deleteFailed: 'The SkillPilot ID could not be deleted. No local data was removed.',
      deleteMissing: 'This SkillPilot ID was not found. It may already have been deleted automatically or on another device.',
      deleteSuccess: 'The SkillPilot ID, the server-side learning state currently in use, and associated SkillPilot sessions and connections were deleted.',
    }
