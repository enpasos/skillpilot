import { isVerifiedRecallPassed, isVerifiedRecallTestedToday, parseReviewTimestamp } from './srsLogic'

/**
 * The card box of issue #85 as the Cockpit shows it.
 *
 * The backend decides which cards are released: a card enters the learner's
 * box only when its understanding goals are passed, and the client-state
 * snapshot names the others in `lockedCardIds`. A card passed in Verified
 * Recall (`verifiedRecall.status == "passed"`) has left the box for good.
 * Practice numbers describe the box; the deck goal's mastery still needs every
 * card of the deck verified.
 */
export type CardBoxStatus = 'box' | 'locked' | 'removed'

type CardState = { interval?: unknown; nextReview?: unknown; verifiedRecall?: unknown } | undefined

const NO_LOCKED_CARDS: ReadonlySet<string> = new Set()

/** The server-computed locked cards of a snapshot; an older backend without the field locks none. */
export function readLockedCardIds(snapshot: unknown): ReadonlySet<string> {
    const value = snapshot && typeof snapshot === 'object' ? (snapshot as { lockedCardIds?: unknown }).lockedCardIds : undefined
    if (!Array.isArray(value)) return NO_LOCKED_CARDS
    const ids = value.filter((id): id is string => typeof id === 'string' && id.length > 0)
    return ids.length ? new Set(ids) : NO_LOCKED_CARDS
}

/** A verified card stays verified, even when its understanding goal no longer counts as passed. */
export function cardBoxStatus(cardId: string, state: CardState, lockedCardIds: ReadonlySet<string>): CardBoxStatus {
    if (isVerifiedRecallPassed(state?.verifiedRecall)) return 'removed'
    return lockedCardIds.has(cardId) ? 'locked' : 'box'
}

/** Practice schedule without a usable interval or review time counts as due now (backend rule). */
const hasSchedule = (state: CardState): state is NonNullable<CardState> =>
    !!state && Number.isFinite(Number(state.interval)) && Number.isFinite(parseReviewTimestamp(state.nextReview))

export function isCardDue(cardId: string, state: CardState, lockedCardIds: ReadonlySet<string>, now: number): boolean {
    if (cardBoxStatus(cardId, state, lockedCardIds) !== 'box') return false
    return !hasSchedule(state) || parseReviewTimestamp(state.nextReview) <= now
}

export interface CardBoxStats {
    /** Every card of the selection (deck goal or unit subset); the deck goal's mastery needs all of them verified. */
    total: number
    /** Released and not removed. */
    box: number
    /** Box cards without a practice schedule ("new"). */
    box0: number
    box1: number
    box2: number
    box3: number
    /** Box cards due now. */
    due: number
    /** Earliest future review of a box card; infinite when none is scheduled. */
    nextDueAt: number
    /** Removed cards: passed in Verified Recall. */
    verifiedPassed: number
    verifiedPending: number
    /** Box cards that may be checked today. */
    verifiedEligible: number
    /** Box cards already checked today. */
    verifiedBlockedToday: number
    /** Cards that follow once their understanding goals are passed. */
    locked: number
}

export function calculateCardBoxStats(
    cards: readonly { id: string }[],
    stateByCardId: Readonly<Record<string, CardState>>,
    lockedCardIds: ReadonlySet<string>,
    now = Date.now(),
): CardBoxStats {
    const stats: CardBoxStats = {
        total: cards.length, box: 0, box0: 0, box1: 0, box2: 0, box3: 0, due: 0, nextDueAt: Number.POSITIVE_INFINITY,
        verifiedPassed: 0, verifiedPending: 0, verifiedEligible: 0, verifiedBlockedToday: 0, locked: 0,
    }
    for (const card of cards) {
        const state = stateByCardId[card.id]
        const status = cardBoxStatus(card.id, state, lockedCardIds)
        if (status === 'removed') {
            stats.verifiedPassed += 1
            continue
        }
        if (status === 'locked') {
            stats.locked += 1
            continue
        }
        stats.box += 1
        if (!hasSchedule(state)) {
            stats.box0 += 1
        } else {
            const interval = Number(state.interval)
            if (interval < 3) stats.box1 += 1
            else if (interval <= 10) stats.box2 += 1
            else stats.box3 += 1
        }
        if (isCardDue(card.id, state, lockedCardIds, now)) {
            stats.due += 1
        } else {
            stats.nextDueAt = Math.min(stats.nextDueAt, parseReviewTimestamp(state?.nextReview))
        }
        if (isVerifiedRecallTestedToday(state?.verifiedRecall, now)) stats.verifiedBlockedToday += 1
        else stats.verifiedEligible += 1
    }
    stats.verifiedPending = Math.max(0, cards.length - stats.verifiedPassed)
    return stats
}

/**
 * What the drill shows when it offers no card: `nothingReleased` when its box
 * is empty and a card still waits for its understanding goal, `caughtUp` when
 * every box card is practised for now, `allVerified` when every card of the
 * selection has passed Verified Recall. `null` while a card is due or the
 * selection has no card at all.
 */
export type CardBoxIdleState = 'nothingReleased' | 'caughtUp' | 'allVerified'

export function cardBoxIdleState(stats: Pick<CardBoxStats, 'total' | 'box' | 'due' | 'locked'>): CardBoxIdleState | null {
    if (stats.total === 0 || stats.due > 0) return null
    if (stats.box > 0) return 'caughtUp'
    return stats.locked > 0 ? 'nothingReleased' : 'allVerified'
}

/** The cards a practice batch may offer: due box cards only. */
export function selectDueCards<T extends { id: string }>(
    cards: readonly T[],
    stateByCardId: Readonly<Record<string, CardState>>,
    lockedCardIds: ReadonlySet<string>,
    now: number,
): T[] {
    return cards.filter(card => isCardDue(card.id, stateByCardId[card.id], lockedCardIds, now))
}

/**
 * The state a practice sync sends: the drill never creates or changes the
 * state of a locked card. A locked card that the server already stores keeps
 * exactly its stored entry, because the server replaces the practice schedule
 * of every card a sync omits.
 */
export function practiceSyncState<T>(
    current: Readonly<Record<string, T>>,
    serverState: Readonly<Record<string, unknown>> | null | undefined,
    lockedCardIds: ReadonlySet<string>,
): Record<string, T> {
    if (!lockedCardIds.size) return { ...current }
    const result: Record<string, T> = {}
    for (const [cardId, state] of Object.entries(current)) {
        if (!lockedCardIds.has(cardId)) result[cardId] = state
        else if (serverState && Object.hasOwn(serverState, cardId)) result[cardId] = serverState[cardId] as T
    }
    return result
}
