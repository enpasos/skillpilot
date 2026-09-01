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
const deTeacherSupervisionText = de.sections.find(section => section.title.includes('bestehender SkillPilot-ID'))
  ?.paragraphs.join(' ') ?? ''
const enTeacherSupervisionText = en.sections.find(section => section.title.includes('Existing SkillPilot ID'))
  ?.paragraphs.join(' ') ?? ''

assert(de.effectiveDate.includes('31. August 2026'), 'German privacy copy carries the current supervision date')
assert(en.effectiveDate.includes('August 31, 2026'), 'English privacy copy carries the current supervision date')
assert(
  deTeacherSupervisionText.includes('Klassennamen')
    && deTeacherSupervisionText.includes('Namen oder Alias')
    && deTeacherSupervisionText.includes('lokale Kopie')
    && deTeacherSupervisionText.includes('normalen SkillPilot-Lernenden-Endpunkte')
    && deTeacherSupervisionText.includes('keine separate serverseitige Lehrkraft-, Klassen-, Berechtigungs- oder Mitgliedschaftsbeziehung')
    && deTeacherSupervisionText.includes('funktional nur lesend')
    && deTeacherSupervisionText.includes('geplante Lernziele')
    && deTeacherSupervisionText.includes('lokaler Kursplan der Lehrkraft')
    && deTeacherSupervisionText.includes('nicht in den Datensatz der lernenden Person geschrieben')
    && deTeacherSupervisionText.includes('Bearer-Geheimnis')
    && deTeacherSupervisionText.includes('Vollzugriffsschlüssel')
    && deTeacherSupervisionText.includes('Passwortverschlüsselte Klassenexporte')
    && deTeacherSupervisionText.includes('dauerhafte SkillPilot-IDs')
    && deTeacherSupervisionText.includes('lokal gespeicherte Personalisierung'),
  'German privacy copy states local storage, direct learner-ID access, UI-only read-only behavior, and encrypted-export contents',
)
assert(
  enTeacherSupervisionText.includes('class name')
    && enTeacherSupervisionText.includes('learner name or alias')
    && enTeacherSupervisionText.includes('local copy')
    && enTeacherSupervisionText.includes('normal learner endpoints')
    && enTeacherSupervisionText.includes('no separate server-side teacher account, class, authorization record, or membership relationship')
    && enTeacherSupervisionText.includes('functionally read-only')
    && enTeacherSupervisionText.includes('planned learning goals')
    && enTeacherSupervisionText.includes('local teacher course plan')
    && enTeacherSupervisionText.includes('not written to the learner record')
    && enTeacherSupervisionText.includes('bearer secret')
    && enTeacherSupervisionText.includes('full-access key')
    && enTeacherSupervisionText.includes('Password-encrypted class exports')
    && enTeacherSupervisionText.includes('permanent SkillPilot IDs')
    && enTeacherSupervisionText.includes('locally stored personalization'),
  'English privacy copy states local storage, direct learner-ID access, UI-only read-only behavior, and encrypted-export contents',
)
assert(
  !deTeacherSupervisionText.includes('Einladung')
    && !deTeacherSupervisionText.includes('sieben Tagen')
    && !deTeacherSupervisionText.includes('Widerruf')
    && !deTeacherSupervisionText.includes('widerruf')
    && !deTeacherSupervisionText.includes('30 Tagen')
    && !deTeacherSupervisionText.includes('Betreuungsmitgliedschaften')
    && !enTeacherSupervisionText.includes('invitation')
    && !enTeacherSupervisionText.includes('seven days')
    && !enTeacherSupervisionText.includes('revoke')
    && !enTeacherSupervisionText.includes('revocation')
    && !enTeacherSupervisionText.includes('30-day')
    && !enTeacherSupervisionText.includes('supervision memberships'),
  'privacy copy makes no invitation, revocation, membership, seven-day, or thirty-day claims',
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
