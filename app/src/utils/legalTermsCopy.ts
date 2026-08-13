import type { LabelLanguage } from './filterLabels'

export interface LegalTermsCopy {
  summary: string
  detailsPrefix: string
  detailsLinkLabel: string
  detailsSuffix: string
  acceptanceLabel: string
  confirmButton: string
  storageError: string
}

export const getLegalTermsCopy = (language: LabelLanguage): LegalTermsCopy => (
  language === 'en'
    ? {
        summary: `
# Please accept the Terms of Use to start with SkillPilot:

* **Free service**: The current standard SkillPilot service is free of charge and does not create a paid subscription.
* **Pseudonymous access**: My permanent SkillPilot ID is the sole key to my learning state and must be kept secure.
* **Learning and AI limits**: Learning models and AI assessments may be incomplete or incorrect and are not binding qualifications or examination decisions.
* **Third-party connection**: If I choose an AI provider, its own terms and privacy rules also apply.
`,
        detailsPrefix: 'You can read the full ',
        detailsLinkLabel: 'Terms of Use and Legal Notices',
        detailsSuffix: ' here.',
        acceptanceLabel: 'I accept the Terms of Use, acknowledge the Legal Notices, and confirm that I have legal capacity or any required consent from my legal representative.',
        confirmButton: 'Accept & Continue',
        storageError: 'Your browser could not save the acceptance. Enable local storage for skillpilot.com and try again.',
      }
    : {
        summary: `
# Bitte akzeptiere die Nutzungsbedingungen, um mit SkillPilot zu starten:

* **Kostenloser Dienst**: Die aktuelle Standardnutzung von SkillPilot ist unentgeltlich und begründet kein kostenpflichtiges Abonnement.
* **Pseudonymer Zugang**: Meine dauerhafte SkillPilot-ID ist der alleinige Schlüssel zu meinem Lernstand und muss sicher aufbewahrt werden.
* **Lern- und KI-Grenzen**: Lernmodelle und KI-Bewertungen können unvollständig oder falsch sein und sind keine verbindlichen Abschlüsse oder Prüfungsentscheidungen.
* **Drittanbieter-Verbindung**: Wenn ich einen KI-Anbieter wähle, gelten zusätzlich dessen Bedingungen und Datenschutzregeln.
`,
        detailsPrefix: 'Die vollständigen ',
        detailsLinkLabel: 'Nutzungsbedingungen und rechtlichen Hinweise',
        detailsSuffix: ' findest du hier.',
        acceptanceLabel: 'Ich akzeptiere die Nutzungsbedingungen, habe die rechtlichen Hinweise zur Kenntnis genommen und bestätige, dass ich geschäftsfähig bin oder die erforderliche Zustimmung meiner gesetzlichen Vertretung vorliegt.',
        confirmButton: 'Akzeptieren & Fortfahren',
        storageError: 'Dein Browser konnte die Zustimmung nicht speichern. Erlaube lokalen Speicher für skillpilot.com und versuche es erneut.',
      }
)
