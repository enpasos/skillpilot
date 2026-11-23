package com.skillpilot.backend.service.srs;

import java.time.Instant;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * The card rules of issue #85 in one place: box, due-ness, Verified Recall
 * eligibility and its status, and the facts the coach's card step needs.
 *
 * <p>A card is in the box when it is released and not removed; it is removed
 * for good once its Verified Recall result is passed. A card in the box is due
 * when it has no practice schedule yet or its next review is reached. It is
 * eligible for Verified Recall when it is in the box and was not tested on the
 * same day. A locked card is never due, never delivered and never eligible.</p>
 */
public final class SrsCardSelection {

    /** Minimum consecutive successful practice reviews before the coach proposes the check. */
    public static final int RECALL_PROPOSAL_REPETITIONS = 2;

    private SrsCardSelection() { }

    public static boolean inBox(SrsCard card, SrsCardStateSummary state, SrsCardRelease release) {
        return release.isReleased(card) && (state == null || !state.recallPassed());
    }

    public static boolean due(SrsCard card, SrsCardStateSummary state, SrsCardRelease release, Instant now) {
        return inBox(card, state, release) && (state == null || state.due(now));
    }

    public static boolean recallEligible(SrsCard card, SrsCardStateSummary state, SrsCardRelease release,
            Instant now, ZoneId zone) {
        return inBox(card, state, release) && (state == null || !state.testedOn(now, zone));
    }

    /** Cards of a set that a Verified Recall batch may contain now: in the box and not tested today. */
    public static int recallEligibleCount(List<SrsCard> cards, Map<String, SrsCardStateSummary> states,
            SrsCardRelease release, Instant now, ZoneId zone) {
        int eligible = 0;
        if (cards != null) {
            for (SrsCard card : cards) {
                if (recallEligible(card, states.get(card.id()), release, now, zone)) eligible++;
            }
        }
        return eligible;
    }

    /** The next Verified Recall batch of a scope: its first eligible cards in deck order. */
    public static List<SrsCard> nextRecallBatch(List<SrsCard> scope, Map<String, SrsCardStateSummary> states,
            SrsCardRelease release, Instant now, ZoneId zone, int batchSize) {
        if (scope == null || scope.isEmpty() || batchSize <= 0) {
            return List.of();
        }
        List<SrsCard> selected = new ArrayList<>();
        for (SrsCard card : scope) {
            if (recallEligible(card, states.get(card.id()), release, now, zone)) {
                selected.add(card);
                if (selected.size() >= batchSize) {
                    break;
                }
            }
        }
        return selected;
    }

    /**
     * Finds the scope a server-issued batch belongs to: the batch must equal
     * the selection the server makes for one of the candidate scopes at the
     * issue instant. The candidates are every scope the server can issue for
     * the deck goal, so a later change of the learner's unit context does not
     * invalidate a batch, while a shortened, reordered or stale batch still
     * matches none.
     */
    public static Optional<List<SrsCard>> matchIssuedBatch(Collection<List<SrsCard>> candidateScopes,
            List<String> cardIds, Map<String, SrsCardStateSummary> states, SrsCardRelease release,
            Instant issuedAt, ZoneId zone, int batchSize) {
        return matchIssuedScope(candidateScopes, cardIds, states, release, issuedAt, zone, batchSize)
                .map(scope -> nextRecallBatch(scope, states, release, issuedAt, zone, batchSize));
    }

    /** The candidate scope whose selection at the issue instant is exactly the issued batch. */
    public static Optional<List<SrsCard>> matchIssuedScope(Collection<List<SrsCard>> candidateScopes,
            List<String> cardIds, Map<String, SrsCardStateSummary> states, SrsCardRelease release,
            Instant issuedAt, ZoneId zone, int batchSize) {
        for (List<SrsCard> scope : candidateScopes) {
            List<SrsCard> expected = nextRecallBatch(scope, states, release, issuedAt, zone, batchSize);
            if (expected.size() == cardIds.size()
                    && expected.stream().map(SrsCard::id).toList().equals(cardIds)) {
                return Optional.of(scope);
            }
        }
        return Optional.empty();
    }

    /**
     * Verified Recall status of a deck goal for one batch scope.
     *
     * <p>Totals describe the deck goal, because its mastery needs every card:
     * {@code pending} counts every card without a passed result. Only cards of
     * the scope that are in the box and not tested today are {@code eligible};
     * every other pending card is {@code blocked} (tested today, not released
     * yet, or outside the unit scope). {@code sameDayBlocked} counts the cards
     * of the scope blocked only by today's test.</p>
     */
    public record RecallStatus(int totalCards, int verifiedCards, int pendingCards, int eligibleCards,
            int blockedCards, int sameDayBlockedCards) { }

    public static RecallStatus recallStatus(List<SrsCard> deck, List<SrsCard> scope,
            Map<String, SrsCardStateSummary> states, SrsCardRelease release, Instant now, ZoneId zone) {
        int verified = 0;
        for (SrsCard card : deck) {
            SrsCardStateSummary state = states.get(card.id());
            if (state != null && state.recallPassed()) {
                verified++;
            }
        }
        int eligible = 0;
        int sameDay = 0;
        for (SrsCard card : scope) {
            SrsCardStateSummary state = states.get(card.id());
            if (!inBox(card, state, release)) {
                continue;
            }
            if (state != null && state.testedOn(now, zone)) {
                sameDay++;
            } else {
                eligible++;
            }
        }
        int pending = Math.max(0, deck.size() - verified);
        eligible = Math.min(eligible, pending);
        return new RecallStatus(deck.size(), verified, pending, eligible, pending - eligible, sameDay);
    }

    /** Box size and due cards of a card set (practice progress, coach step). */
    public record BoxTally(int boxCards, int dueCards, boolean recallProposalReady) { }

    public static BoxTally tally(List<SrsCard> cards, Map<String, SrsCardStateSummary> states,
            SrsCardRelease release, Instant now) {
        int box = 0;
        int dueCards = 0;
        boolean allKnownTwice = true;
        for (SrsCard card : cards) {
            SrsCardStateSummary state = states.get(card.id());
            if (!inBox(card, state, release)) {
                continue;
            }
            box++;
            if (state == null || state.due(now)) {
                dueCards++;
            }
            if (state == null || state.practiceRepetition() < RECALL_PROPOSAL_REPETITIONS) {
                allKnownTwice = false;
            }
        }
        return new BoxTally(box, dueCards, box > 0 && allKnownTwice);
    }
}
