import { getFaqViewCopy } from './faqViewCopy'

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

const de = getFaqViewCopy('de')
const en = getFaqViewCopy('en')
const ids = <T extends { id: string }>(items: T[]) => items.map(item => item.id)

assert(
  JSON.stringify(ids(de.compatibility.rows)) === JSON.stringify(ids(en.compatibility.rows)),
  'German and English compatibility rows have identical IDs and ordering',
)
assert(
  JSON.stringify(ids(de.questions)) === JSON.stringify(ids(en.questions)),
  'German and English FAQ questions have identical IDs and ordering',
)
assert(
  new Set(ids(de.compatibility.rows)).size === de.compatibility.rows.length,
  'compatibility row IDs are unique',
)
assert(
  new Set(ids(de.questions)).size === de.questions.length,
  'FAQ question IDs are unique',
)

const deVoiceRow = de.compatibility.rows.find(row => row.id === 'voice-mode')
const enVoiceRow = en.compatibility.rows.find(row => row.id === 'voice-mode')
assert(deVoiceRow?.status === 'unsupported', 'German compatibility matrix rejects voice mode')
assert(enVoiceRow?.status === 'unsupported', 'English compatibility matrix rejects voice mode')
assert(
  de.warning.evidenceWarning.includes('kein Beleg')
    && en.warning.evidenceWarning.includes('not evidence'),
  'both languages explain that a convincing response does not prove SkillPilot is connected',
)
assert(
  de.warning.recoverySteps.some(step => step.includes('neuen Chat'))
    && en.warning.recoverySteps.some(step => step.includes('new chat')),
  'both languages tell learners to recover in a new SkillPilot chat',
)
assert(
  de.compatibility.rows.find(row => row.id === 'browser-mobile')?.status === 'recommended'
    && en.compatibility.rows.find(row => row.id === 'browser-mobile')?.status === 'recommended',
  'both languages recommend the mobile browser',
)
assert(
  de.compatibility.rows.find(row => row.id === 'cross-device-chat')?.status === 'supported'
    && en.compatibility.rows.find(row => row.id === 'cross-device-chat')?.status === 'supported',
  'both languages support continuing an existing chat in a browser on another device',
)
const deContinueOnPhone = de.questions.find(question => question.id === 'continue-on-phone')
const enContinueOnPhone = en.questions.find(question => question.id === 'continue-on-phone')
assert(
  deContinueOnPhone?.paragraphs.some(paragraph => paragraph.includes('denselben bestehenden Chat'))
    && deContinueOnPhone.paragraphs.some(paragraph => paragraph.includes('Lernsession-ID')),
  'German copy keeps the existing chat and its learning session ID when moving to a phone',
)
assert(
  enContinueOnPhone?.paragraphs.some(paragraph => paragraph.includes('same existing chat'))
    && enContinueOnPhone.paragraphs.some(paragraph => paragraph.includes('learning session ID')),
  'English copy keeps the existing chat and its learning session ID when moving to a phone',
)

console.log('FAQ view copy tests passed')
