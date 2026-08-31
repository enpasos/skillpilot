import { getPrivacyViewCopy } from './privacyViewCopy'

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

const de = getPrivacyViewCopy('de')
const en = getPrivacyViewCopy('en')
const deAiText = de.sections.find(section => section.title.includes('KI-Assistenten'))
  ?.paragraphs.join(' ') ?? ''
const enAiText = en.sections.find(section => section.title.includes('AI Assistants'))
  ?.paragraphs.join(' ') ?? ''
const deRetentionText = de.sections.find(section => section.title.includes('Speicherdauer'))
  ?.paragraphs.join(' ') ?? ''
const enRetentionText = en.sections.find(section => section.title.includes('Storage Period'))
  ?.paragraphs.join(' ') ?? ''
const deTeacherSupervisionText = de.sections.find(section => section.title.includes('Betreuung durch eine Lehrkraft'))
  ?.paragraphs.join(' ') ?? ''
const enTeacherSupervisionText = en.sections.find(section => section.title.includes('Teacher Supervision'))
  ?.paragraphs.join(' ') ?? ''

assert(de.effectiveDate.includes('31. August 2026'), 'German privacy copy carries the current supervision date')
assert(en.effectiveDate.includes('August 31, 2026'), 'English privacy copy carries the current supervision date')
assert(
  deTeacherSupervisionText.includes('ausdrücklich bestätigen')
    && deTeacherSupervisionText.includes('freigegebenen Leserechte')
    && deTeacherSupervisionText.includes('dauerhafte SkillPilot-ID')
    && deTeacherSupervisionText.includes('sieben Tagen')
    && deTeacherSupervisionText.includes('Aufbewahrungsfrist von 30 Tagen')
    && deTeacherSupervisionText.includes('nächsten täglichen Löschlauf'),
  'German privacy copy states supervision consent, minimization, expiry, and terminal retention',
)
assert(
  enTeacherSupervisionText.includes('explicitly approve')
    && enTeacherSupervisionText.includes('approved read capabilities')
    && enTeacherSupervisionText.includes('permanent SkillPilot ID')
    && enTeacherSupervisionText.includes('seven days')
    && enTeacherSupervisionText.includes('30-day retention period')
    && enTeacherSupervisionText.includes('next daily deletion run'),
  'English privacy copy states supervision consent, minimization, expiry, and terminal retention',
)
assert(
  deAiText.includes('Visible Session')
    && deAiText.includes('OAuth/MCP')
    && deAiText.includes('Toolanfragen und Argumente'),
  'German privacy copy discloses both coach variants and explicit tool arguments',
)
assert(
  enAiText.includes('Visible Session')
    && enAiText.includes('OAuth/MCP')
    && enAiText.includes('tool requests and arguments'),
  'English privacy copy discloses both coach variants and explicit tool arguments',
)
assert(
  !deAiText.includes('ausschließlich ein temporäres Sitzungstoken')
    && !enAiText.includes('only a temporary session token'),
  'privacy copy no longer describes the Visible Session transport as the only architecture',
)
assert(
  deRetentionText.includes('365 aufeinanderfolgenden Tagen')
    && deRetentionText.includes('erfolgreiche Erstellung einer SkillPilot-ID')
    && deRetentionText.includes('aktive Laden oder Fortsetzen des Lernstands in der SkillPilot-Weboberfläche')
    && deRetentionText.includes('vom Server abgeschlossener Import oder Export signierter Lerndaten')
    && deRetentionText.includes('serverseitig erfolgreich gespeicherte Änderung des Lernstands')
    && deRetentionText.includes('SkillPilot-Sitzungs- oder KI-Anbieter-Verbindungsaktion')
    && deRetentionText.includes('gültiger Coach-/MCP-Aufruf')
    && deRetentionText.includes('fachlich erfolgreichen Ergebnis'),
  'German privacy copy defines every successful activity boundary',
)
assert(
  enRetentionText.includes('365 consecutive days')
    && enRetentionText.includes('successful creation of a SkillPilot ID')
    && enRetentionText.includes('foreground loading or resuming of the learning state in the SkillPilot web interface')
    && enRetentionText.includes('server-completed import or export of signed learner data')
    && enRetentionText.includes('learner-state change successfully stored on the server')
    && enRetentionText.includes('SkillPilot session or AI-provider connection action')
    && enRetentionText.includes('valid Coach/MCP call')
    && enRetentionText.includes('successful domain result'),
  'English privacy copy defines every successful activity boundary',
)
assert(
  deRetentionText.includes('SkillPilot-Datenbank')
    && deRetentionText.includes('SkillPilot-Lernsessions')
    && deRetentionText.includes('SkillPilot-Verbindungen')
    && enRetentionText.includes('SkillPilot database')
    && enRetentionText.includes('SkillPilot learning sessions')
    && enRetentionText.includes('SkillPilot connections'),
  'privacy copy limits deletion to active SkillPilot database state and associated SkillPilot records',
)
assert(
  deRetentionText.includes('lokalen Dateien')
    && deRetentionText.includes('Hintergrund-GET-Anfragen')
    && deRetentionText.includes('SSE-Verkehr')
    && deRetentionText.includes('OAuth-Token-Aktualisierungen')
    && deRetentionText.includes('vom Server nicht abgeschlossene oder fachlich abgewiesene Aktionen')
    && deRetentionText.includes('Chats oder sonstigen Daten bei einem KI-Anbieter')
    && enRetentionText.includes('local files')
    && enRetentionText.includes('Background GET requests')
    && enRetentionText.includes('SSE traffic')
    && enRetentionText.includes('OAuth token refreshes')
    && enRetentionText.includes('server operations that do not complete or are domain-rejected')
    && enRetentionText.includes('chats or other data held by an AI provider'),
  'privacy copy excludes every non-activity boundary and local/provider data from deletion',
)
assert(
  deRetentionText.includes('Sicherungskopien gehören nicht zum aktiven Lernstand')
    && deRetentionText.includes('365-Tage-Ablauf löschen sie nicht unmittelbar einzeln')
    && enRetentionText.includes('backup copies are not part of the active learning state')
    && enRetentionText.includes('365-day expiry immediately deletes each backup copy individually'),
  'privacy copy states only that backups are outside active state and immediate per-copy deletion',
)
assert(
  !deRetentionText.includes('Aufbewahrungs- und Löschverfahren')
    && !enRetentionText.includes('operational retention and deletion procedures'),
  'privacy copy does not promise a backup retention or deletion procedure',
)
assert(
  !de.sections.some(section => section.paragraphs.some(paragraph => paragraph.includes('sofern implementiert')))
    && !en.sections.some(section => section.paragraphs.some(paragraph => paragraph.includes('if implemented'))),
  'privacy copy describes the implemented deletion function without a future-feature qualifier',
)

console.log('privacy view copy tests passed')
