package com.skillpilot.backend.service.srs;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
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
 * @param practiceGoalId the deck goal whose due cards the step opens first (projection order), or {@code null}
 * @param checkGoalId the deck goal the unit check covers: the first one with released, not yet
 *        verified cards that were not tested today, or {@code null} when no unit check is available
 * @param backendChooses whether the backend chooses the next step (Autopilot on): the coach opens the
 *        practice directly; otherwise the learner chooses and the cards are the first option
 * @param offerKey stable for one goal boundary (the latest completed goal, or the start when none),
 *        unit and opened deck goal; {@code null} when the step has nothing to offer
 */
public record SrsCardStepFacts(
        String practiceScopeId,
        List<String> deckGoalIds,
        int dueCards,
        int boxCards,
        boolean recallProposalReady,
        String practiceGoalId,
        String checkGoalId,
        boolean backendChooses,
        String offerKey) {

    private static final SrsCardStepFacts NONE =
            new SrsCardStepFacts(null, List.of(), 0, 0, false, null, null, false, null);

    public SrsCardStepFacts {
        deckGoalIds = deckGoalIds == null ? List.of() : List.copyOf(deckGoalIds);
    }

    /** No card context, or guided card work is not available in it. */
    public static SrsCardStepFacts none() {
        return NONE;
    }

    /** Whether the step offers anything now: due cards to practise or the proposal of the unit check. */
    public boolean offersStep() {
        return practiceGoalId != null || (recallProposalReady && checkGoalId != null);
    }

    /**
     * The opaque offer key of one step: a hash of the goal boundary, the unit and
     * the opened deck goal. It changes when another goal is completed or when the
     * due cards of the first deck are done and another deck's cards open next.
     */
    public static String offerKey(String boundary, String practiceScopeId, String deckGoalId) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            String material = String.join("\u0000", "card-step-v1", boundary == null ? "start" : boundary,
                    practiceScopeId == null ? "" : practiceScopeId, deckGoalId == null ? "check" : deckGoalId);
            byte[] hash = digest.digest(material.getBytes(StandardCharsets.UTF_8));
            return "cs-" + HexFormat.of().formatHex(hash, 0, 8);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 is unavailable", e);
        }
    }
}
