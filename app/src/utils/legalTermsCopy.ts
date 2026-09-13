import type { LabelLanguage } from './filterLabels'
import { CURRENT_TERMS_VERSION } from './legalTermsVersion'

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

**Version ${CURRENT_TERMS_VERSION} · September 13, 2026.** Updated: Claude beta and age requirements, separation of coach conversations and voluntary feedback, and AI-image notices.

* **Free service**: The current standard SkillPilot service is free of charge and does not create a paid subscription.
* **Pseudonymous access**: My permanent SkillPilot ID is the sole key to my learning state and must be kept secure.
* **Storage and deletion**: I can delete my active SkillPilot server data in the web interface; without successful activity, it and the associated SkillPilot sessions and connections become due for automatic deletion after 365 days. Only successful ID creation, foreground loading or resuming of the learning state in the WebGUI, a server-completed import or export of signed learner data, a stored learner-state change, a successful SkillPilot session or AI-provider connection action, or a valid Coach/MCP call with a successful domain result counts as activity. Background GET requests, SSE traffic, OAuth token refreshes, merely selecting or opening a file, and server operations that do not complete or are domain-rejected do not count.
* **Learning and AI limits**: Learning models and AI assessments may be incomplete or incorrect and are not binding qualifications or examination decisions.
* **Claude beta**: The learning beta currently uses Claude, including its app and voice mode. ChatGPT is not available yet. A personal Claude account requires a minimum age of 18 or a higher local minimum; parental permission does not override this restriction. The provider's own terms, privacy rules, and any charges also apply.
* **Conversation stays with the provider**: SkillPilot processes defined structured learning and tool data, not chat text, photos, or audio from my coach conversation. Feedback I deliberately submit in the cockpit is a separate, voluntary communication to SkillPilot.
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

**Version ${CURRENT_TERMS_VERSION} · 13. September 2026.** Aktualisiert: Claude-Beta und Altersregeln, Trennung von Coach-Dialog und freiwilligem Feedback sowie KI-Bildhinweise.

* **Kostenloser Dienst**: Die aktuelle Standardnutzung von SkillPilot ist unentgeltlich und begründet kein kostenpflichtiges Abonnement.
* **Pseudonymer Zugang**: Meine dauerhafte SkillPilot-ID ist der alleinige Schlüssel zu meinem Lernstand und muss sicher aufbewahrt werden.
* **Speicherung und Löschung**: Ich kann meine aktiven SkillPilot-Serverdaten in der Weboberfläche löschen; ohne erfolgreiche Tätigkeit werden sie und die zugehörigen SkillPilot-Sitzungen und -Verbindungen nach 365 Tagen zur automatischen Löschung fällig. Als Tätigkeit zählen nur erfolgreiche ID-Erstellung, das aktive Laden oder Fortsetzen des Lernstands in der Weboberfläche, ein vom Server abgeschlossener Import oder Export signierter Lerndaten, eine gespeicherte Lernstandsänderung, eine erfolgreiche SkillPilot-Sitzungs- oder KI-Anbieter-Verbindungsaktion oder ein gültiger Coach-/MCP-Aufruf mit fachlich erfolgreichem Ergebnis. Hintergrund-GET-Anfragen, SSE-Verkehr, OAuth-Token-Aktualisierungen, bloße Dateiauswahl oder -öffnung sowie vom Server nicht abgeschlossene oder fachlich abgewiesene Aktionen zählen nicht.
* **Lern- und KI-Grenzen**: Lernmodelle und KI-Bewertungen können unvollständig oder falsch sein und sind keine verbindlichen Abschlüsse oder Prüfungsentscheidungen.
* **Claude-Beta**: Die Lern-Beta läuft derzeit mit Claude, auch in dessen App und Voice Mode. ChatGPT ist noch nicht verfügbar. Ein persönliches Claude-Konto setzt mindestens 18 Jahre oder eine höhere örtliche Altersgrenze voraus; elterliche Zustimmung hebt diese Grenze nicht auf. Zusätzlich gelten die Bedingungen, Datenschutzregeln und gegebenenfalls Kosten des Anbieters.
* **Dialog bleibt beim Anbieter**: SkillPilot verarbeitet vorgesehene strukturierte Lern- und Tooldaten, keine Chattexte, Fotos oder Audiodaten aus meinem Coach-Gespräch. Feedback, das ich bewusst im Cockpit abgebe, ist eine getrennte, freiwillige Mitteilung an SkillPilot.
`,
        detailsPrefix: 'Die vollständigen ',
        detailsLinkLabel: 'Nutzungsbedingungen und rechtlichen Hinweise',
        detailsSuffix: ' findest du hier.',
        acceptanceLabel: 'Ich akzeptiere die Nutzungsbedingungen, habe die rechtlichen Hinweise zur Kenntnis genommen und bestätige, dass ich geschäftsfähig bin oder die erforderliche Zustimmung meiner gesetzlichen Vertretung vorliegt.',
        confirmButton: 'Akzeptieren & Fortfahren',
        storageError: 'Dein Browser konnte die Zustimmung nicht speichern. Erlaube lokalen Speicher für skillpilot.com und versuche es erneut.',
      }
)
