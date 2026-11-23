import assert from 'node:assert/strict'
import {
  calculateCardBoxStats, cardBoxIdleState, cardBoxStatus, isCardDue, practiceSyncState, readLockedCardIds, selectDueCards,
} from '../src/components/srs/cardBox'
import { getFlashcardDrillCopy } from '../src/utils/flashcardDrillCopy'
import { getLearnerViewCopy } from '../src/utils/learnerViewCopy'

// Box rules of issue #85 as the Cockpit applies them: the server names locked
// cards, a passed Verified Recall removes a card, practice counts the box.
const now = Date.parse('2026-11-23T10:00:00Z')
const day = 86_400_000
const passed = { status: 'passed', passedAt: '2026-11-20T08:00:00Z', lastTestedAt: '2026-11-20T08:00:00Z', attempts: 1, failures: 0 }
const failedToday = { status: 'failed', attempts: 1, failures: 1, lastTestedAt: new Date(now).toISOString() }
const schedule = (interval: number, nextReview: number) => ({ interval, repetition: 1, ef: 2.5, nextReview })

assert.equal(readLockedCardIds({ srsState: {}, updatedAt: null }).size, 0, 'an older backend without the field locks no card')
assert.equal(readLockedCardIds(null).size, 0)
assert.equal(readLockedCardIds({ lockedCardIds: 'c1' }).size, 0, 'a malformed field locks no card')
assert.deepEqual([...readLockedCardIds({ lockedCardIds: ['c1', 7, '', 'c2', 'c1'] })], ['c1', 'c2'])

const locked = readLockedCardIds({ lockedCardIds: ['locked-new', 'locked-practised', 'locked-verified'] })
const state: Record<string, Record<string, unknown> | undefined> = {
  'locked-practised': { id: 'locked-practised', ...schedule(1, now - day) },
  'locked-verified': { id: 'locked-verified', ...schedule(12, now - day), verifiedRecall: passed },
  removed: { id: 'removed', ...schedule(1, now - day), verifiedRecall: passed },
  due: { id: 'due', ...schedule(1, now - 1) },
  later: { id: 'later', ...schedule(6, now + 2 * day) },
  mastered: { id: 'mastered', ...schedule(20, now + 9 * day) },
  'checked-today': { id: 'checked-today', ...schedule(1, now + day), verifiedRecall: failedToday },
  'no-interval': { id: 'no-interval', nextReview: now + day },
  'unpassed-without-time': { id: 'unpassed-without-time', ...schedule(1, now + day), verifiedRecall: { status: 'passed' } },
}
const cards = ['locked-new', 'locked-practised', 'locked-verified', 'removed', 'new', 'due', 'later', 'mastered',
  'checked-today', 'no-interval', 'unpassed-without-time'].map(id => ({ id }))

assert.equal(cardBoxStatus('locked-new', undefined, locked), 'locked')
assert.equal(cardBoxStatus('locked-verified', state['locked-verified'], locked), 'removed', 'a verified card stays verified')
assert.equal(cardBoxStatus('removed', state.removed, locked), 'removed')
assert.equal(cardBoxStatus('checked-today', state['checked-today'], locked), 'box', 'a failed check keeps the card in the box')
assert.equal(cardBoxStatus('unpassed-without-time', state['unpassed-without-time'], locked), 'box',
  'a pass without passedAt is no result, as on the server')

for (const id of ['locked-new', 'locked-practised', 'locked-verified', 'removed']) {
  assert.equal(isCardDue(id, state[id], locked, now), false, `${id} is never due`)
}
assert.equal(isCardDue('new', undefined, locked, now), true, 'a released card without practice state is due')
assert.equal(isCardDue('due', state.due, locked, now), true)
assert.equal(isCardDue('later', state.later, locked, now), false)
assert.equal(isCardDue('no-interval', state['no-interval'], locked, now), true, 'an unusable schedule is due now (server rule)')

const stats = calculateCardBoxStats(cards, state, locked, now)
assert.deepEqual(stats, {
  total: 11,
  box: 7,
  box0: 2, // new, no-interval: never a locked card
  box1: 3, // due, checked-today, unpassed-without-time
  box2: 1, // later
  box3: 1, // mastered
  due: 3, // new, due, no-interval
  nextDueAt: now + day,
  verifiedPassed: 2, // removed, locked-verified
  verifiedPending: 9,
  verifiedEligible: 6,
  verifiedBlockedToday: 1,
  locked: 2,
})
assert.equal(stats.box0 + stats.box1 + stats.box2 + stats.box3, stats.box, 'the bars describe the box')
assert.equal(stats.box + stats.locked + stats.verifiedPassed, stats.total)
assert.deepEqual(selectDueCards(cards, state, locked, now).map(card => card.id), ['new', 'due', 'no-interval'],
  'practice offers due box cards only')

const legacy = calculateCardBoxStats(cards, state, readLockedCardIds({ srsState: state }), now)
assert.equal(legacy.locked, 0, 'without lockedCardIds every card that is not verified is in the box')
assert.equal(legacy.box, 9)
assert.equal(legacy.due, 5, 'the former due cards, minus the removed ones')
assert.deepEqual(selectDueCards(cards, state, readLockedCardIds(undefined), now).map(card => card.id),
  ['locked-new', 'locked-practised', 'new', 'due', 'no-interval'])

const allLocked = calculateCardBoxStats([{ id: 'locked-new' }], {}, locked, now)
assert.equal(allLocked.due, 0)
assert.equal(allLocked.box0, 0, 'a locked card is not counted as new')
assert.equal(allLocked.verifiedEligible, 0)
assert.equal(allLocked.verifiedPending, 1, 'the deck goal still needs every card verified')

// The deck goal's mastery rule: every card of the deck verified, locked or not.
const verifiedDeck = calculateCardBoxStats([{ id: 'removed' }, { id: 'locked-verified' }], state, locked, now)
assert.equal(verifiedDeck.verifiedPending, 0)
assert.equal(verifiedDeck.box, 0)

// The drill's idle state: an empty box with locked cards is not "practice done".
assert.equal(cardBoxIdleState(stats), null, 'a due card keeps the drill practising')
assert.equal(cardBoxIdleState(allLocked), 'nothingReleased')
assert.equal(cardBoxIdleState(calculateCardBoxStats([{ id: 'removed' }, { id: 'locked-new' }], state, locked, now)), 'nothingReleased',
  'an empty box with a waiting card has nothing released, even beside verified cards')
assert.equal(cardBoxIdleState(calculateCardBoxStats([{ id: 'later' }, { id: 'locked-new' }], state, locked, now)), 'caughtUp',
  'everything due was practised')
assert.equal(cardBoxIdleState(verifiedDeck), 'allVerified', 'the completion display stays for an all-verified selection')
assert.equal(cardBoxIdleState(calculateCardBoxStats([], state, locked, now)), null, 'an empty selection has its own message')
assert.equal(cardBoxIdleState(calculateCardBoxStats([{ id: 'later' }, { id: 'mastered' }], state, readLockedCardIds({}), now)), 'caughtUp',
  'an older backend never reports nothing released')

// The sync payload: a practice rating of a released card plus every stored
// entry, but never a state the drill made up for a locked card.
const server = { ...state }
const current: Record<string, unknown> = {
  ...state,
  new: { id: 'new', ...schedule(1, now + day) },
  'locked-new': { id: 'locked-new', ...schedule(1, now + day) },
  'locked-practised': { id: 'locked-practised', ...schedule(6, now + 6 * day) },
}
const payload = practiceSyncState(current, server, locked)
assert(!Object.hasOwn(payload, 'locked-new'), 'a locked card without stored state is never sent')
assert.deepEqual(payload['locked-practised'], server['locked-practised'], 'a stored locked card keeps its stored entry')
assert.deepEqual(payload['locked-verified'], server['locked-verified'])
assert.deepEqual(payload.new, current.new, 'a released card carries its new rating')
assert.deepEqual(payload.removed, state.removed, 'a Verified Recall result passes through unchanged')
for (const id of locked) {
  assert(!Object.hasOwn(payload, id) || payload[id] === server[id], `${id}: only the stored entry, never a client change`)
}
assert.deepEqual(Object.keys(payload).sort(), Object.keys(current).filter(id => id !== 'locked-new').sort())
assert.deepEqual(practiceSyncState(current, null, locked)['locked-practised'], undefined,
  'without a server state no locked card is sent')
assert.deepEqual(practiceSyncState(current, server, readLockedCardIds({})), current, 'an older backend: the former payload')
assert.notEqual(practiceSyncState(current, server, readLockedCardIds({})), current, 'the payload is a copy')

// Neutral wording, German addressed with "du".
const de = getFlashcardDrillCopy('de')
const en = getFlashcardDrillCopy('en')
assert.equal(de.lockedCards(1), '1 weitere Karte kommt dazu, sobald du ihr Lernziel geschafft hast.')
assert.equal(de.lockedCards(3), '3 weitere Karten kommen dazu, sobald du ihre Lernziele geschafft hast.')
assert.equal(en.lockedCards(1), '1 more card joins once you have passed its learning goal.')
assert.equal(en.lockedCards(2), '2 more cards join once you have passed their learning goals.')
assert.equal(de.nothingReleased, 'Noch keine Karte freigeschaltet')
assert.equal(en.nothingReleased, 'No card unlocked yet')
assert.equal(getLearnerViewCopy('de').memoryLockedCardsHint(2), de.lockedCards(2))
assert.equal(getLearnerViewCopy('en').memoryLockedCardsHint(2), en.lockedCards(2))
console.log('Flashcard box rules passed: locked, removed, due, counts, idle state, missing lockedCardIds, sync payload, copy.')
