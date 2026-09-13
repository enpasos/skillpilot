import { getFaqViewCopy } from './faqViewCopy'

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

const de = getFaqViewCopy('de')
const en = getFaqViewCopy('en')
const ids = <T extends { id: string }>(items: T[]) => items.map(item => item.id)
const section = (copy: typeof de, id: string) => {
  const found = copy.sections.find(item => item.id === id)
  assert(found, `FAQ section ${id} exists`)
  return found
}
const question = (copy: typeof de, sectionId: string, id: string) => {
  const found = section(copy, sectionId).questions.find(item => item.id === id)
  assert(found, `FAQ question ${id} belongs to ${sectionId}`)
  return found
}
const paragraphs = (copy: typeof de, sectionId: string, id: string) => question(copy, sectionId, id).paragraphs.join(' ')

for (const copy of [de, en]) {
  assert(JSON.stringify(ids(copy.sections)) === JSON.stringify(['claude', 'chatgpt', 'learning']), 'separate Claude, ChatGPT and shared-learning sections in that order')
  const allQuestions = copy.sections.flatMap(item => item.questions)
  assert(new Set(ids(allQuestions)).size === allQuestions.length, 'FAQ question IDs are unique across all sections')
  assert(!('warning' in copy) && !('compatibility' in copy), 'no global ChatGPT warning or compatibility matrix can be applied to Claude')
  assert(copy.recommendation.title.includes('Claude'), 'current recommendation names Claude')
  assert(copy.recommendation.actionLabel.includes('SkillPilot'), 'recommendation returns learners to SkillPilot')
  assert(question(copy, 'learning', 'provider-options').link?.href === '/faq/coach-setup', 'setup question links to access details')
  assert(Boolean(question(copy, 'learning', 'provider-options').link?.label), 'setup detail link is labeled')
  assert(question(copy, 'learning', 'ask-to-improve').bullets?.length, 'shared learning help keeps concrete examples')
  assert(question(copy, 'learning', 'disagree-with-coach').bullets?.length, 'shared learning help encourages reasoned disagreement')
  const serialized = JSON.stringify(copy).toLowerCase()
  for (const forbidden of ['skillpilot-id', 'skillpilotid', 'session id', 'session-id', 'stateversion', 'oauth', 'mcp', 'connector', 'workspace', 'provider account', 'embedded']) {
    assert(!serialized.includes(forbidden), `learner FAQ does not expose ${forbidden}`)
  }
}
for (const deSection of de.sections) {
  assert(JSON.stringify(ids(deSection.questions)) === JSON.stringify(ids(section(en, deSection.id).questions)), `${deSection.id}: DE and EN questions have identical IDs and order`)
}
assert(paragraphs(de, 'claude', 'claude-app').includes('funktioniert') && paragraphs(en, 'claude', 'claude-app').includes('works'), 'Claude app works in the current beta')
assert(paragraphs(de, 'claude', 'claude-app').includes('nicht eine vollständige Prüfung') && paragraphs(en, 'claude', 'claude-app').includes('not complete testing'), 'beta experience does not imply universal device acceptance')
assert(paragraphs(de, 'claude', 'claude-voice').includes('warte dann kurz') && paragraphs(en, 'claude', 'claude-voice').includes('wait briefly'), 'Claude voice guidance advises waiting through occasional pauses')
assert(paragraphs(de, 'claude', 'claude-voice').includes('anschließend weiter') && paragraphs(en, 'claude', 'claude-voice').includes('resumes speaking'), 'Claude voice guidance explains observed recovery')
assert(paragraphs(de, 'claude', 'continue-on-phone').includes('denselben bestehenden Chat') && paragraphs(en, 'claude', 'continue-on-phone').includes('same existing chat'), 'device switching keeps the existing Claude chat')
assert(paragraphs(de, 'claude', 'continue-on-phone').includes('24 Stunden') && paragraphs(en, 'claude', 'continue-on-phone').includes('24 hours'), 'cross-device continuation respects session validity')
assert(de.recommendation.paragraphs.some(item => item.includes('parallele ChatGPT-Beta bieten wir nicht an')) && en.recommendation.paragraphs.some(item => item.includes('not offering a parallel ChatGPT beta')), 'no parallel external ChatGPT beta is advertised')
assert(paragraphs(de, 'chatgpt', 'chatgpt-availability').includes('echten ChatGPT-Verbindung') && paragraphs(en, 'chatgpt', 'chatgpt-availability').includes('real ChatGPT connection'), 'ChatGPT needs real host-specific testing before submission')
assert(paragraphs(de, 'chatgpt', 'chatgpt-availability').includes('Veröffentlichungstermin können wir noch nicht nennen') && paragraphs(en, 'chatgpt', 'chatgpt-availability').includes('cannot give a release date'), 'no publication date is promised')
assert(paragraphs(de, 'chatgpt', 'chatgpt-app-voice').includes('gesondert') && paragraphs(en, 'chatgpt', 'chatgpt-app-voice').includes('separately'), 'Claude app and voice experience does not prove ChatGPT behavior')
assert(paragraphs(de, 'learning', 'session-duration').includes('24 Stunden') && paragraphs(en, 'learning', 'session-duration').includes('24 hours'), 'shared FAQ preserves session duration')
assert(paragraphs(de, 'learning', 'session-duration').includes('nicht mit anderen') && paragraphs(en, 'learning', 'session-duration').includes('not share'), 'shared FAQ preserves private start-message caution')
assert(paragraphs(de, 'learning', 'saved-progress').includes('kein Beleg') && paragraphs(en, 'learning', 'saved-progress').includes('not evidence'), 'coach praise is not proof of saved progress')
for (const [copy, goalContext, action, opinion, privacy] of [
  [de, 'aktuelles Lernziel automatisch', 'Feedback zu diesem Lernziel', 'deiner Meinung nach', 'keine Chattexte'],
  [en, 'automatically shows your current learning goal', 'Give feedback on this learning goal', 'in your opinion', 'Do not copy chat text'],
] as const) {
  const feedback = paragraphs(copy, 'learning', 'disagree-with-coach')
  assert(feedback.includes(goalContext) && feedback.includes(action), 'coach feedback points to the automatically selected goal and actual cockpit action')
  assert(feedback.includes(opinion), 'learners can report coach behavior they consider inappropriate')
  assert(feedback.includes(privacy), 'manual feedback must not copy chat content')
  assert(!feedback.includes('support@skillpilot.com'), 'goal-specific coach feedback uses the cockpit rather than email')
}
assert(paragraphs(de, 'learning', 'photo-upload').includes('persönliche Angaben') && paragraphs(en, 'learning', 'photo-upload').includes('personal information'), 'photo guidance preserves personal-data caution')
assert(paragraphs(de, 'learning', 'photo-upload').includes('Kamera in der Claude-App') && paragraphs(en, 'learning', 'photo-upload').includes('camera directly in the Claude app'), 'photo FAQ explicitly supports the Claude app camera')
assert(paragraphs(de, 'learning', 'photo-upload').includes('Handy') && paragraphs(en, 'learning', 'photo-upload').includes('phone'), 'photo FAQ recommends using a phone')
assert(!paragraphs(de, 'learning', 'photo-upload').includes('Wenn dein Chat') && !paragraphs(en, 'learning', 'photo-upload').includes('If your chat'), 'confirmed Claude photo support is not described as conditional')
assert(paragraphs(de, 'learning', 'photo-upload').includes('keine Chattexte oder Fotos') && paragraphs(en, 'learning', 'photo-upload').includes('does not receive chat text or photos'), 'privacy copy preserves the no-chat-prose-to-Core boundary')
assert(!JSON.stringify(de).includes('Der Inhalt ist dadurch nicht falsch') && !JSON.stringify(en).includes('The content is not wrong'), 'display guidance never guarantees correct mathematics')

console.log('FAQ view copy tests passed')
