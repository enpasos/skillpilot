import { getLegalTermsCopy } from './legalTermsCopy'
import { getLegalViewCopy } from './legalViewCopy'
import { CURRENT_TERMS_VERSION } from './legalTermsVersion'

const assert = {
  equal(actual: unknown, expected: unknown, message = 'values differ') {
    if (actual !== expected) throw new Error(`${message}: ${String(actual)} !== ${String(expected)}`)
  },
  match(actual: string, expected: RegExp, message = 'value does not match') {
    if (!expected.test(actual)) throw new Error(`${message}: ${expected}`)
  },
  doesNotMatch(actual: string, expected: RegExp, message = 'value unexpectedly matches') {
    if (expected.test(actual)) throw new Error(`${message}: ${expected}`)
  },
}

const de = getLegalViewCopy('de')
const en = getLegalViewCopy('en')

assert.equal(de.title, 'Nutzungsbedingungen & rechtliche Hinweise')
assert.equal(en.title, 'Terms of Use & Legal Notices')
assert.doesNotMatch(de.markdown, /^#\s/mu, 'the page header owns the only H1')
assert.doesNotMatch(en.markdown, /^#\s/mu, 'the page header owns the only H1')

for (const [language, markdown] of [['de', de.markdown], ['en', en.markdown]] as const) {
  assert.equal(markdown.includes(`Version ${CURRENT_TERMS_VERSION}`), true, `${language} copy identifies the accepted terms version`)
  assert.match(markdown, /(?:13\. September 2026|September 13, 2026)/u)
  assert.match(markdown, /enpasos - Enterprise Patterns & Solutions GmbH/u)
  assert.match(markdown, /\[.*(?:Impressum|Imprint).*\]\(\/imprint\)/u)
  assert.match(markdown, /\[.*(?:Datenschutzerklärung|Privacy Policy).*\]\(\/privacy\)/u)
  assert.match(markdown, /support@skillpilot\.com/u)
  assert.match(markdown, /Apache License, Version 2\.0/u)
  assert.match(markdown, /(?:gesetzlichen Vertretung|legal representative)/u)
  assert.match(markdown, /https:\/\/www\.anthropic\.com\/legal\/consumer-terms/u)
  assert.match(markdown, /(?:mindestens 18 Jahre|minimum age of 18)/u, `${language} copy includes the active Claude consumer age floor`)
  assert.match(markdown, /(?:Zustimmung eines Elternteils hebt diese Anbietergrenze nicht auf|Parental permission does not override this provider restriction)/u)
  assert.match(markdown, /(?:nicht anderen Personen zur Nutzung überlassen|must not be made available to other people)/u)
  assert.match(markdown, /(?:Verbindung für ChatGPT ist derzeit nicht verfügbar|connection for ChatGPT is not currently available)/u)
  assert.match(markdown, /(?:eigener ChatGPT-Integrationsabnahme|separate ChatGPT integration acceptance check)/u)
  assert.match(markdown, /(?:Claude-App|Claude app)/u)
  assert.match(markdown, /(?:Kameraaufnahmen|camera captures)/u)
  assert.match(markdown, /(?:Voice Mode|voice mode)/u)
  assert.match(markdown, /(?:Keine Chattexte an den SkillPilot Core|No chat text sent to the SkillPilot Core)/u)
  assert.match(markdown, /(?:strukturierten Tooldaten|structured tool data)/u)
  assert.match(markdown, /(?:Zusammenfassungen|summaries)/u)
  assert.match(markdown, /(?:freiwillig Feedback|voluntarily submit feedback)/u)
  assert.match(markdown, /(?:kein automatischer Export|not an automatic export)/u)
  assert.match(markdown, /(?:separat übermittelte Feedback- und Supportnachrichten|Separately submitted feedback and support messages)/u)
  assert.match(markdown, /(?:Lernmotive auf der Startseite sind KI-generierte Symbolbilder|learning scenes on the homepage are also AI-generated illustrations)/u)
  assert.match(markdown, /(?:keine echten Produktaufnahmen|not actual product captures)/u)
  assert.match(markdown, /(?:unentgeltlich|free of charge)/u)
  assert.match(markdown, /(?:weder eine automatische Zahlungsverpflichtung|neither an automatic payment obligation)/u)
  assert.match(markdown, /(?:Sicherheitsmaßnahmen|security measures)/u)
  assert.match(markdown, /(?:keine zusätzlichen Kosten|no additional cost)/u)
  assert.match(markdown, /(?:jederzeit ohne Frist durch eine eindeutige Erklärung|terminate the contract at any time without notice by sending an unambiguous declaration)/u)
  assert.match(markdown, /(?:365 aufeinanderfolgenden Tagen|365 consecutive days)/u)
  assert.match(markdown, /(?:SkillPilot-Weboberfläche|SkillPilot web interface)/u)
  assert.match(markdown, /(?:erfolgreiche Erstellung einer SkillPilot-ID|successful creation of a SkillPilot ID)/u)
  assert.match(markdown, /(?:aktive Laden oder Fortsetzen des Lernstands in der SkillPilot-Weboberfläche|foreground loading or resuming of the learning state in the SkillPilot web interface)/u)
  assert.match(markdown, /(?:vom Server abgeschlossener Import oder Export signierter Lerndaten|server-completed import or export of signed learner data)/u)
  assert.match(markdown, /(?:serverseitig erfolgreich gespeicherte Änderung des Lernstands|learner-state change successfully stored on the server)/u)
  assert.match(markdown, /(?:SkillPilot-Sitzungs- oder KI-Anbieter-Verbindungsaktion|SkillPilot session or AI-provider connection action)/u)
  assert.match(markdown, /(?:gültiger Coach-\/MCP-Aufruf, den SkillPilot mit einem fachlich erfolgreichen Ergebnis abschließt|valid Coach\/MCP call that SkillPilot completes with a successful domain result)/u)
  assert.match(markdown, /(?:Hintergrund-GET-Anfragen|Background GET requests)/u)
  assert.match(markdown, /(?:SSE-Verkehr|SSE traffic)/u)
  assert.match(markdown, /(?:OAuth-Token-Aktualisierungen|OAuth token refreshes)/u)
  assert.match(markdown, /(?:vom Server nicht abgeschlossene oder fachlich abgewiesene Aktionen|server operations that do not complete or are domain-rejected)/u)
  assert.match(markdown, /(?:lokalen Dateien|local files)/u)
  assert.match(markdown, /(?:Chats oder sonstigen Daten beim ausgewählten KI-Anbieter|chats or other data held by the selected AI provider)/u)
  assert.match(markdown, /(?:Sicherungskopien gehören nicht zum aktiven Lernstand|backup copies are not part of the active learning state)/u)
  assert.match(markdown, /(?:365-Tage-Ablauf löschen sie nicht unmittelbar einzeln|365-day expiry immediately deletes each backup copy individually)/u)
  assert.doesNotMatch(markdown, /(?:Aufbewahrungs- und Löschverfahren|operational retention and deletion procedures)/u)
  assert.match(markdown, /(?:Vorsatz und grober Fahrlässigkeit|intent and gross negligence)/u)
  assert.match(markdown, /(?:Leben, Körper oder Gesundheit|life, body, or health)/u)
  assert.match(markdown, /(?:zwingender Schutz|mandatory protection)/u)
  assert.match(markdown, /(?:Verbraucherschlichtungsstelle|consumer arbitration board)/u)
  assert.match(markdown, /(?:Schweigen gilt nicht als Zustimmung|silence does not count as consent)/u)
  assert.match(markdown, /## (?:KI-Transparenz|AI Transparency)/u)
}

assert.doesNotMatch(de.markdown, /jederzeit geändert oder entfernt/u)
assert.doesNotMatch(en.markdown, /changed or removed at any time/u)
assert.doesNotMatch(de.markdown, /Nutzung .* auf eigene Verantwortung/u)
assert.doesNotMatch(en.markdown, /use .* at your own risk/u)
assert.doesNotMatch(de.markdown, /Bloße Nichtnutzung löscht den pseudonymen Lernstand nicht/u)
assert.doesNotMatch(en.markdown, /Merely ceasing use does not delete the pseudonymous learning state/u)
assert.doesNotMatch(de.markdown, /derzeitige SkillPilot-Start mit ChatGPT/u)
assert.doesNotMatch(en.markdown, /current SkillPilot start with ChatGPT/u)
assert.doesNotMatch(de.markdown, /nicht automatisch das vollständige Chatprotokoll/u)
assert.doesNotMatch(en.markdown, /not automatically the complete chat transcript/u)

const deAcceptance = getLegalTermsCopy('de')
const enAcceptance = getLegalTermsCopy('en')
assert.match(deAcceptance.acceptanceLabel, /akzeptiere die Nutzungsbedingungen/u)
assert.match(enAcceptance.acceptanceLabel, /accept the Terms of Use/u)
assert.match(deAcceptance.acceptanceLabel, /Zustimmung meiner gesetzlichen Vertretung/u)
assert.match(enAcceptance.acceptanceLabel, /consent from my legal representative/u)
assert.match(deAcceptance.storageError, /Zustimmung nicht speichern/u)
assert.match(enAcceptance.storageError, /could not save the acceptance/u)
assert.match(deAcceptance.summary, /nach 365 Tagen zur automatischen Löschung fällig/u)
assert.match(enAcceptance.summary, /due for automatic deletion after 365 days/u)
for (const summary of [deAcceptance.summary, enAcceptance.summary]) {
  assert.equal(summary.includes(`Version ${CURRENT_TERMS_VERSION}`), true, 'the acceptance gate identifies the current version')
  assert.match(summary, /(?:Aktualisiert|Updated):/u, 'the acceptance gate identifies the material update')
  assert.match(summary, /(?:Claude-Beta|Claude beta)/u)
  assert.match(summary, /(?:mindestens 18 Jahre|minimum age of 18)/u)
  assert.match(summary, /(?:ChatGPT ist noch nicht verfügbar|ChatGPT is not available yet)/u)
  assert.match(summary, /(?:keine Chattexte, Fotos oder Audiodaten|not chat text, photos, or audio)/u)
  assert.match(summary, /(?:freiwillige Mitteilung|voluntary communication)/u)
}
for (const pattern of [
  /erfolgreiche ID-Erstellung/u,
  /aktive Laden oder Fortsetzen/u,
  /vom Server abgeschlossener Import oder Export signierter Lerndaten/u,
  /gespeicherte Lernstandsänderung/u,
  /SkillPilot-Sitzungs- oder KI-Anbieter-Verbindungsaktion/u,
  /gültiger Coach-\/MCP-Aufruf mit fachlich erfolgreichem Ergebnis/u,
]) {
  assert.match(deAcceptance.summary, pattern, 'German acceptance summary carries every activity boundary')
}
for (const pattern of [
  /successful ID creation/u,
  /foreground loading or resuming/u,
  /server-completed import or export of signed learner data/u,
  /stored learner-state change/u,
  /SkillPilot session or AI-provider connection action/u,
  /valid Coach\/MCP call with a successful domain result/u,
]) {
  assert.match(enAcceptance.summary, pattern, 'English acceptance summary carries every activity boundary')
}
for (const pattern of [
  /Hintergrund-GET-Anfragen/u,
  /SSE-Verkehr/u,
  /OAuth-Token-Aktualisierungen/u,
  /bloße Dateiauswahl oder -öffnung/u,
  /vom Server nicht abgeschlossene oder fachlich abgewiesene Aktionen/u,
]) {
  assert.match(deAcceptance.summary, pattern, 'German acceptance summary excludes every non-activity boundary')
}
for (const pattern of [
  /Background GET requests/u,
  /SSE traffic/u,
  /OAuth token refreshes/u,
  /merely selecting or opening a file/u,
  /server operations that do not complete or are domain-rejected/u,
]) {
  assert.match(enAcceptance.summary, pattern, 'English acceptance summary excludes every non-activity boundary')
}
assert.doesNotMatch(`${deAcceptance.summary}\n${deAcceptance.acceptanceLabel}`, /Haftungsausschluss/u)
assert.doesNotMatch(`${enAcceptance.summary}\n${enAcceptance.acceptanceLabel}`, /disclaimer/u)

console.log('legal view copy tests passed')
