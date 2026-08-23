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
  de.recommendation.actionLabel.includes('SkillPilot')
    && en.recommendation.actionLabel.includes('SkillPilot'),
  'both languages provide a direct learner-facing return to SkillPilot',
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
    && deContinueOnPhone.paragraphs.some(paragraph => paragraph.includes('24 Stunden')),
  'German copy keeps the same chat within the 24-hour learning session when moving to a phone',
)
assert(
  enContinueOnPhone?.paragraphs.some(paragraph => paragraph.includes('same existing chat'))
    && enContinueOnPhone.paragraphs.some(paragraph => paragraph.includes('24 hours')),
  'English copy keeps the same chat within the 24-hour learning session when moving to a phone',
)

const deProviderOptions = de.questions.find(question => question.id === 'provider-options')
const enProviderOptions = en.questions.find(question => question.id === 'provider-options')
assert(
  deProviderOptions?.link?.href === '/faq/coach-setup'
    && enProviderOptions?.link?.href === '/faq/coach-setup',
  'both languages link the setup question to the learner-facing detail page',
)
assert(
  Boolean(deProviderOptions?.link?.label) && Boolean(enProviderOptions?.link?.label),
  'the setup detail link has a learner-facing label in both languages',
)

const deSession = de.questions.find(question => question.id === 'session-duration')
const enSession = en.questions.find(question => question.id === 'session-duration')
assert(
  deSession?.paragraphs.some(paragraph => paragraph.includes('24 Stunden'))
    && deSession.paragraphs.some(paragraph => paragraph.includes('nicht mit anderen')),
  'German FAQ explains the session duration and that the learner should not share access',
)
assert(
  enSession?.paragraphs.some(paragraph => paragraph.includes('24 hours'))
    && enSession.paragraphs.some(paragraph => paragraph.includes('not share')),
  'English FAQ explains the session duration and that the learner should not share access',
)

const dePhotoUpload = de.questions.find(question => question.id === 'photo-upload')
const enPhotoUpload = en.questions.find(question => question.id === 'photo-upload')
assert(
  dePhotoUpload?.paragraphs.some(paragraph => paragraph.includes('persönliche Angaben'))
    && enPhotoUpload?.paragraphs.some(paragraph => paragraph.includes('personal information')),
  'both languages tell learners to remove personal information before uploading a photo',
)

for (const copy of [de, en]) {
  const serialized = JSON.stringify(copy).toLowerCase()
  for (const forbidden of [
    'skillpilot-id',
    'skillpilotid',
    'session id',
    'session-id',
    'stateversion',
    'oauth',
    'mcp',
    'connector',
    'workspace',
    'anbieter-konto',
    'provider account',
    'eingebettete',
    'embedded',
  ]) {
    assert(!serialized.includes(forbidden), `learner FAQ does not expose ${forbidden}`)
  }
}

assert(
  !JSON.stringify(de).includes('Der Inhalt ist dadurch nicht falsch')
    && !JSON.stringify(en).includes('The content is not wrong'),
  'formula-display guidance does not guarantee that the mathematical content is correct',
)

console.log('FAQ view copy tests passed')
