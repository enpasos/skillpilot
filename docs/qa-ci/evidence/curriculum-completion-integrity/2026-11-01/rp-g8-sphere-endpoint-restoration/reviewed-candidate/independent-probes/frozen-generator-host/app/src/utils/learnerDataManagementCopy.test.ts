import { getLearnerDataManagementCopy } from './learnerDataManagementCopy'

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

const de = getLearnerDataManagementCopy('de')
const en = getLearnerDataManagementCopy('en')

assert(de.title === 'Daten & SkillPilot-ID', 'German dialog has the agreed plain-language title')
assert(en.title === 'Data & SkillPilot ID', 'English dialog has a matching title')
assert(
  de.copySourcesTitle === 'Datenherkunft'
    && de.copySourcesEntrySingular === 'Eintrag'
    && de.copySourcesEntryPlural === 'Einträge'
    && en.copySourcesTitle === 'Data origin'
    && en.copySourcesEntrySingular === 'entry'
    && en.copySourcesEntryPlural === 'entries',
  'copy-source provenance has matching German and English counted summaries',
)
assert(
  de.scheduledDeletionLabel === 'Automatische Löschung ab'
    && en.scheduledDeletionLabel === 'Automatic deletion from',
  'the deadline labels do not promise an exact scheduler execution time',
)
assert(
  de.retentionExplanation.includes('Nach 365 Tagen ohne erfolgreiche Aktivität')
    && de.retentionExplanation.includes('nächsten Bereinigungslauf')
    && de.retentionExplanation.includes('erfolgreiche ID-Erstellung')
    && de.retentionExplanation.includes('aktive Laden oder Fortsetzen des Lernstands')
    && de.retentionExplanation.includes('vom Server abgeschlossener Import oder Export signierter Lerndaten')
    && de.retentionExplanation.includes('gespeicherte Lernstandsänderung')
    && de.retentionExplanation.includes('SkillPilot-Sitzungs- oder KI-Anbieter-Verbindungsaktion')
    && de.retentionExplanation.includes('gültiger Coach-/MCP-Aufruf mit fachlich erfolgreichem Ergebnis')
    && en.retentionExplanation.includes('After 365 days without successful activity')
    && en.retentionExplanation.includes('next cleanup run')
    && en.retentionExplanation.includes('successful ID creation')
    && en.retentionExplanation.includes('foreground loading or resuming of the learning state')
    && en.retentionExplanation.includes('server-completed import or export of signed learner data')
    && en.retentionExplanation.includes('stored learner-state change')
    && en.retentionExplanation.includes('SkillPilot session or AI-provider connection action')
    && en.retentionExplanation.includes('valid Coach/MCP call with a successful domain result'),
  'both languages carry every successful activity boundary and the cleanup timing',
)
assert(
  de.retentionExplanation.includes('Hintergrund-GET-Anfragen')
    && de.retentionExplanation.includes('SSE-Verkehr')
    && de.retentionExplanation.includes('OAuth-Token-Aktualisierungen')
    && de.retentionExplanation.includes('bloße Dateiauswahl oder -öffnung')
    && de.retentionExplanation.includes('vom Server nicht abgeschlossene oder fachlich abgewiesene Aktionen')
    && en.retentionExplanation.includes('Background GET requests')
    && en.retentionExplanation.includes('SSE traffic')
    && en.retentionExplanation.includes('OAuth token refreshes')
    && en.retentionExplanation.includes('merely selecting or opening a file')
    && en.retentionExplanation.includes('server operations that do not complete or are domain-rejected'),
  'both languages exclude background access, file opening, and failures',
)
assert(
  de.confirmServerData.includes('aktuell verwendete serverseitige Lernstand')
    && de.confirmServerData.includes('SkillPilot-seitige Verbindungs- und Autorisierungsdaten')
    && en.confirmServerData.includes('server-side learning state currently in use')
    && en.confirmServerData.includes('SkillPilot-side connection and authorization data'),
  'confirmation copy accurately scopes active SkillPilot-side product data',
)
assert(
  de.confirmExternalData.includes('Chatverläufe bei externen KI-Anbietern')
    && de.confirmExternalData.includes('nicht einzeln unmittelbar entfernt')
    && en.confirmExternalData.includes('chats held by external AI providers'),
  'confirmation copy excludes provider-held chats and device files',
)
assert(
  !Object.values(de).some(value => value.includes('alle zugehörigen Daten'))
    && !Object.values(en).some(value => value.includes('all associated data')),
  'dialog copy does not overpromise deletion beyond SkillPilot product data',
)
assert(
  de.resumeFailed.includes('konnte nicht bestätigen')
    && de.resumeFailed.includes('möglicherweise nicht aktuell')
    && en.resumeFailed.includes('could not confirm')
    && en.resumeFailed.includes('may not be current'),
  'a failed resume is surfaced without claiming that activity was recorded',
)

console.log('learner data management copy tests passed')
