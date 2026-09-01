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

assert(de.effectiveDate.includes('1. September 2026'), 'German privacy copy carries the current planning-snapshot date')
assert(en.effectiveDate.includes('September 1, 2026'), 'English privacy copy carries the current planning-snapshot date')
assert(
  deTeacherSupervisionText.includes('Klassennamen')
    && deTeacherSupervisionText.includes('Namen oder Alias')
    && deTeacherSupervisionText.includes('lokale Kopie')
    && deTeacherSupervisionText.includes('denselben Lernstand, auf den auch die lernende Person')
    && deTeacherSupervisionText.includes('vollständigen personalisierten Umfang des ausgewählten Fachs')
    && deTeacherSupervisionText.includes('aktuelle Lernfokus schränkt diesen Planungsumfang nicht ein')
    && deTeacherSupervisionText.includes('noch nicht gemeistert')
    && deTeacherSupervisionText.includes('feste Planungsgrundlage')
    && deTeacherSupervisionText.includes('weder die SkillPilot-ID noch einzelne numerische Lernstandswerte')
    && deTeacherSupervisionText.includes('keine separate serverseitige Lehrkraft-, Klassen-, Berechtigungs- oder Mitgliedschaftsbeziehung')
    && deTeacherSupervisionText.includes('funktional nur lesend')
    && deTeacherSupervisionText.includes('„Im Cockpit bereitstellen“')
    && deTeacherSupervisionText.includes('unabhängige Kopie')
    && deTeacherSupervisionText.includes('persönlichen Fachzeitplan')
    && deTeacherSupervisionText.includes('Neu hinzukommende Ziel-IDs')
    && deTeacherSupervisionText.includes('für die Plankontinuität erhalten bleiben')
    && deTeacherSupervisionText.includes('Klassenbezug, Unterrichtsstand, Bestätigungen')
    && deTeacherSupervisionText.includes('spätere lokale Änderungen werden nicht automatisch synchronisiert')
    && deTeacherSupervisionText.includes('ausgeschaltetem planbegleitetem Lernen')
    && deTeacherSupervisionText.includes('Das erste Ziel startet sie bewusst')
    && deTeacherSupervisionText.includes('aktuell gültigen gespeicherten Plan')
    && deTeacherSupervisionText.includes('Plan, der das abgeschlossene Ziel enthält')
    && deTeacherSupervisionText.includes('genau ein Plankandidat')
    && deTeacherSupervisionText.includes('übrigen gültigen Pläne')
    && deTeacherSupervisionText.includes('keinem gespeicherten Plan')
    && deTeacherSupervisionText.includes('allgemeine Autopilot unterdrückt')
    && deTeacherSupervisionText.includes('Das Ausschalten beendet dieses Verhalten')
    && deTeacherSupervisionText.includes('einzige Zugangsschlüssel mit Vollzugriff')
    && deTeacherSupervisionText.includes('denselben Befugnissen wie die lernende Person')
    && deTeacherSupervisionText.includes('unabhängig kopierte Fachzeitplan')
    && deTeacherSupervisionText.includes('Passwortverschlüsselte Klassenexporte')
    && deTeacherSupervisionText.includes('dauerhafte SkillPilot-IDs')
    && deTeacherSupervisionText.includes('lokal gespeicherte Personalisierung'),
  'German privacy copy states the independent plan copy, direct-ID access, no server relationship, no automatic sync, and learner-controlled plan mode',
)
assert(
  enTeacherSupervisionText.includes('class name')
    && enTeacherSupervisionText.includes('learner name or alias')
    && enTeacherSupervisionText.includes('local copy')
    && enTeacherSupervisionText.includes('same learner profile and learning status that the learner can access')
    && enTeacherSupervisionText.includes('complete personalized scope for the selected subject')
    && enTeacherSupervisionText.includes('current learning focus does not restrict this planning scope')
    && enTeacherSupervisionText.includes('not yet mastered')
    && enTeacherSupervisionText.includes('fixed planning basis')
    && enTeacherSupervisionText.includes('neither the SkillPilot ID nor individual numeric learning-status values')
    && enTeacherSupervisionText.includes('no separate server-side teacher account, class, permission, or membership relationship')
    && enTeacherSupervisionText.includes('functionally read-only')
    && enTeacherSupervisionText.includes('“Make available in cockpit”')
    && enTeacherSupervisionText.includes('independent copy')
    && enTeacherSupervisionText.includes('personal subject schedule')
    && enTeacherSupervisionText.includes('Newly added goal IDs')
    && enTeacherSupervisionText.includes('to preserve plan continuity')
    && enTeacherSupervisionText.includes('no class reference, teaching coverage, attestations')
    && enTeacherSupervisionText.includes('later local changes are not synchronized automatically')
    && enTeacherSupervisionText.includes('plan-guided learning is off')
    && enTeacherSupervisionText.includes('the first goal is started deliberately')
    && enTeacherSupervisionText.includes('currently valid stored plan')
    && enTeacherSupervisionText.includes('a plan that contains the completed goal')
    && enTeacherSupervisionText.includes('exactly one such plan candidate')
    && enTeacherSupervisionText.includes('remaining valid plans')
    && enTeacherSupervisionText.includes('no stored plan')
    && enTeacherSupervisionText.includes('generic Autopilot is suppressed')
    && enTeacherSupervisionText.includes('Disabling the mode stops this behavior')
    && enTeacherSupervisionText.includes('sole key with full access')
    && enTeacherSupervisionText.includes('same powers as the learner')
    && enTeacherSupervisionText.includes('independently copied schedule')
    && enTeacherSupervisionText.includes('Password-encrypted class exports')
    && enTeacherSupervisionText.includes('permanent SkillPilot IDs')
    && enTeacherSupervisionText.includes('locally stored personalization'),
  'English privacy copy states the independent plan copy, direct-ID access, no server relationship, no automatic sync, and learner-controlled plan mode',
)
assert(
  !deTeacherSupervisionText.includes('nicht in den Datensatz der lernenden Person geschrieben')
    && !enTeacherSupervisionText.includes('not written to the learner record'),
  'privacy copy no longer claims that a confirmed teacher plan is never copied to learner-owned data',
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
