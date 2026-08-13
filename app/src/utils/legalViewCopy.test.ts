import { getLegalTermsCopy } from './legalTermsCopy'
import { getLegalViewCopy } from './legalViewCopy'

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
  assert.match(markdown, /Version 1\.0\.0/u, `${language} copy identifies the accepted terms version`)
  assert.match(markdown, /enpasos - Enterprise Patterns & Solutions GmbH/u)
  assert.match(markdown, /\[.*(?:Impressum|Imprint).*\]\(\/imprint\)/u)
  assert.match(markdown, /\[.*(?:Datenschutzerklärung|Privacy Policy).*\]\(\/privacy\)/u)
  assert.match(markdown, /support@skillpilot\.com/u)
  assert.match(markdown, /Apache License, Version 2\.0/u)
  assert.match(markdown, /13/u, `${language} copy includes the provider-specific ChatGPT age floor`)
  assert.match(markdown, /(?:gesetzlichen Vertretung|parent or legal guardian)/u)
  assert.match(markdown, /(?:unentgeltlich|free of charge)/u)
  assert.match(markdown, /(?:weder eine automatische Zahlungsverpflichtung|neither an automatic payment obligation)/u)
  assert.match(markdown, /(?:Sicherheitsmaßnahmen|security measures)/u)
  assert.match(markdown, /(?:keine zusätzlichen Kosten|no additional cost)/u)
  assert.match(markdown, /(?:jederzeit ohne Frist durch eine eindeutige Erklärung|terminate the contract at any time without notice by sending an unambiguous declaration)/u)
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

const deAcceptance = getLegalTermsCopy('de')
const enAcceptance = getLegalTermsCopy('en')
assert.match(deAcceptance.acceptanceLabel, /akzeptiere die Nutzungsbedingungen/u)
assert.match(enAcceptance.acceptanceLabel, /accept the Terms of Use/u)
assert.match(deAcceptance.acceptanceLabel, /Zustimmung meiner gesetzlichen Vertretung/u)
assert.match(enAcceptance.acceptanceLabel, /consent from my legal representative/u)
assert.match(deAcceptance.storageError, /Zustimmung nicht speichern/u)
assert.match(enAcceptance.storageError, /could not save the acceptance/u)
assert.doesNotMatch(`${deAcceptance.summary}\n${deAcceptance.acceptanceLabel}`, /Haftungsausschluss/u)
assert.doesNotMatch(`${enAcceptance.summary}\n${enAcceptance.acceptanceLabel}`, /disclaimer/u)

console.log('legal view copy tests passed')
