package com.skillpilot.backend.service.srs;

import java.util.List;

/**
 * What the coach's card step needs about the learner's current card context
 * (issue #85). Counts and identifiers only; no card text, no learner identifier.
 *
 * @param practiceScopeId the unit of the context ({@code practiceScopeId} of memory practice), or {@code null}
 * @param deckGoalIds deck goals with at least one card in the box of the context, in projection order
 * @param dueCards due cards of the context's box
 * @param boxCards released, not yet removed cards of the context
 * @param recallProposalReady whether the coach may propose the unit check: every released,
 *        not yet verified card of the context was known in at least two successful practice reviews
 */
public record SrsCardStepFacts(
        String practiceScopeId,
        List<String> deckGoalIds,
        int dueCards,
        int boxCards,
        boolean recallProposalReady) {

    private static final SrsCardStepFacts NONE = new SrsCardStepFacts(null, List.of(), 0, 0, false);

    public SrsCardStepFacts {
        deckGoalIds = deckGoalIds == null ? List.of() : List.copyOf(deckGoalIds);
    }

    /** No card context, or guided card work is not available in it. */
    public static SrsCardStepFacts none() {
        return NONE;
    }
}
