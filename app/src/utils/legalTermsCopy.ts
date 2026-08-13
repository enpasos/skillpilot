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
* **Storage and deletion**: I can delete my active SkillPilot server data in the web interface; without successful activity, it and the associated SkillPilot sessions and connections become due for automatic deletion after 365 days. Only successful ID creation, foreground loading or resuming of the learning state in the WebGUI, a server-completed import or export of signed learner data, a stored learner-state change, a successful SkillPilot session or AI-provider connection action, or a valid Coach/MCP call with a successful domain result counts as activity. Background GET requests, SSE traffic, OAuth token refreshes, merely selecting or opening a file, and server operations that do not complete or are domain-rejected do not count.
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
* **Speicherung und Löschung**: Ich kann meine aktiven SkillPilot-Serverdaten in der Weboberfläche löschen; ohne erfolgreiche Tätigkeit werden sie und die zugehörigen SkillPilot-Sitzungen und -Verbindungen nach 365 Tagen zur automatischen Löschung fällig. Als Tätigkeit zählen nur erfolgreiche ID-Erstellung, das aktive Laden oder Fortsetzen des Lernstands in der Weboberfläche, ein vom Server abgeschlossener Import oder Export signierter Lerndaten, eine gespeicherte Lernstandsänderung, eine erfolgreiche SkillPilot-Sitzungs- oder KI-Anbieter-Verbindungsaktion oder ein gültiger Coach-/MCP-Aufruf mit fachlich erfolgreichem Ergebnis. Hintergrund-GET-Anfragen, SSE-Verkehr, OAuth-Token-Aktualisierungen, bloße Dateiauswahl oder -öffnung sowie vom Server nicht abgeschlossene oder fachlich abgewiesene Aktionen zählen nicht.
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
