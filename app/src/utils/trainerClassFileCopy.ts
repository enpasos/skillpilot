import type { TrainerClassFilePasswordDialogCopy } from '../components/TrainerClassFilePasswordDialog'

export interface TrainerClassFileCopy {
  exportTooltip: string
  exported: string
  imported: string
  importedLegacy: string
  importInvalid: string
  dialog: TrainerClassFilePasswordDialogCopy & {
    decryptFailed: string
    exportFailed: string
    encryptionUnavailable: string
  }
}

const germanCopy: TrainerClassFileCopy = {
  exportTooltip: 'Klasse passwortgeschützt speichern',
  exported: 'Geschützte Klassendatei exportiert.',
  imported: 'Geschützte Klassendatei importiert.',
  importedLegacy: 'Alte ungeschützte Klassendatei importiert. Exportiere die Klasse erneut, um sie künftig zu schützen.',
  importInvalid: 'Klasse konnte nicht importiert werden. Die Datei ist beschädigt oder hat ein nicht unterstütztes Format.',
  dialog: {
    exportTitle: 'Klassendatei schützen',
    exportDescription: 'Lege ein Passwort fest. Klarnamen und SkillPilot-IDs werden vor dem Download im Browser verschlüsselt.',
    importTitle: 'Geschützte Klasse importieren',
    importDescription: 'Gib das Passwort für „{{fileName}}“ ein.',
    passwordLabel: 'Passwort',
    confirmPasswordLabel: 'Passwort bestätigen',
    passwordHint: 'Mindestens 15 Zeichen; am besten eine lange, einmalige Passphrase.',
    passwordNotRecoverable: 'SkillPilot speichert dieses Passwort nicht und kann es nicht wiederherstellen. Bewahre die einmalige Passphrase getrennt von der Datei auf.',
    showPassword: 'Passwort anzeigen',
    hidePassword: 'Passwort ausblenden',
    passwordTooShort: 'Das Passwort muss mindestens 15 Zeichen lang sein.',
    passwordsMismatch: 'Die Passwörter stimmen nicht überein.',
    cancel: 'Abbrechen',
    exportAction: 'Geschützte Datei herunterladen',
    importAction: 'Klasse importieren',
    encrypting: 'Datei wird verschlüsselt …',
    decrypting: 'Datei wird geöffnet …',
    close: 'Dialog schließen',
    decryptFailed: 'Die Datei konnte nicht geöffnet werden. Prüfe das Passwort und ob die Datei vollständig ist.',
    exportFailed: 'Die geschützte Klassendatei konnte nicht erstellt werden.',
    encryptionUnavailable: 'Dein Browser unterstützt die benötigte Verschlüsselung nicht. Es wurde keine Datei erstellt.',
  },
}

const englishCopy: TrainerClassFileCopy = {
  exportTooltip: 'Save class with password protection',
  exported: 'Protected class file exported.',
  imported: 'Protected class file imported.',
  importedLegacy: 'An older unprotected class file was imported. Export the class again to protect it from now on.',
  importInvalid: 'The class could not be imported. The file is damaged or uses an unsupported format.',
  dialog: {
    exportTitle: 'Protect class file',
    exportDescription: 'Set a password. Student names and SkillPilot IDs are encrypted in your browser before download.',
    importTitle: 'Import protected class',
    importDescription: 'Enter the password for “{{fileName}}”.',
    passwordLabel: 'Password',
    confirmPasswordLabel: 'Confirm password',
    passwordHint: 'At least 15 characters; preferably use a long, unique passphrase.',
    passwordNotRecoverable: 'SkillPilot does not store this password and cannot recover it. Keep the unique passphrase separate from the file.',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    passwordTooShort: 'The password must contain at least 15 characters.',
    passwordsMismatch: 'The passwords do not match.',
    cancel: 'Cancel',
    exportAction: 'Download protected file',
    importAction: 'Import class',
    encrypting: 'Encrypting file …',
    decrypting: 'Opening file …',
    close: 'Close dialog',
    decryptFailed: 'The file could not be opened. Check the password and that the file is complete.',
    exportFailed: 'The protected class file could not be created.',
    encryptionUnavailable: 'Your browser does not support the required encryption. No file was created.',
  },
}

export const getTrainerClassFileCopy = (language: 'de' | 'en'): TrainerClassFileCopy => (
  language === 'en' ? englishCopy : germanCopy
)
