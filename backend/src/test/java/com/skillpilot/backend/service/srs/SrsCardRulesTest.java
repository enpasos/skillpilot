package com.skillpilot.backend.service.srs;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.Test;

/** Deck parsing, release, removal, due-ness and Verified Recall selection of issue #85. */
class SrsCardRulesTest {

    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final ZoneId BERLIN = ZoneId.of("Europe/Berlin");
    private static final Instant NOW = Instant.parse("2026-11-23T10:00:00Z");

    private static SrsDeck deck(String json) {
        return SrsDeck.parse(json.getBytes(StandardCharsets.UTF_8), MAPPER);
    }

    private static SrsCard card(String id, String... goals) {
        return new SrsCard(id, "front " + id, "back " + id, null, null, List.of(goals));
    }

    @Test
    void originGoalIdsReplaceGoalTagsAndTagsRemainTheFallback() {
        SrsDeck deck = deck("""
                {"cards":[
                  {"id":"field","front":"F","back":"B","originGoalIds":["g1","g2"],"tags":["goal:ignored"]},
                  {"id":"tagged","front":"F","back":"B","tags":["GK","goal:g3"]},
                  {"id":"plain","front":"F","back":"B"}
                ]}""");
        assertThat(deck.cards(true)).extracting(SrsCard::understandingGoalIds)
                .containsExactly(List.of("g1", "g2"), List.of("g3"), List.of());
        assertThat(deck.cardsForUnderstandingGoals(Set.of("g2", "g3"))).extracting(SrsCard::id)
                .containsExactly("field", "tagged");
        assertThat(deck.position("plain")).isEqualTo(2);
    }

    @Test
    void strictReadersKeepTheirFormerFailuresWhileTolerantReadersKeepTheirFormerList() {
        SrsDeck duplicated = deck("""
                {"cards":[{"id":"a","front":"F","back":"B"},{"id":"a","front":"F","back":"B"},{"id":"b","front":"F"}]}""");
        assertThatThrownBy(() -> duplicated.cards(true)).isInstanceOf(SrsStateUnavailableException.class)
                .hasMessage("Required memorization deck is invalid")
                .hasRootCauseMessage("Required memorization card identifier is duplicated");
        // Tolerant: duplicates kept, missing content kept, as the former reader did.
        assertThat(duplicated.cards(false)).extracting(SrsCard::id).containsExactly("a", "a", "b");

        assertThatThrownBy(() -> deck("not json").cards(true)).hasMessage("Required memorization deck is invalid");
        assertThat(deck("not json").cards(false)).isEmpty();
        assertThatThrownBy(() -> deck("{\"cards\":{}}").cards(true))
                .hasRootCauseMessage("Required memorization deck has no card list");
        assertThatThrownBy(() -> SrsDeck.missing().cards(true)).hasMessage("Required memorization deck is missing");
        assertThat(SrsDeck.missing().cards(false)).isEmpty();

        SrsDeck malformedOrigin = deck("""
                {"cards":[{"id":"a","front":"F","back":"B","originGoalIds":"g1","tags":["goal:g2"]}]}""");
        assertThatThrownBy(() -> malformedOrigin.cards(true))
                .hasRootCauseMessage("Required memorization card origin goals are invalid");
        assertThat(malformedOrigin.cards(false)).singleElement()
                .extracting(SrsCard::understandingGoalIds).isEqualTo(List.of("g2"));
    }

    @Test
    void selectionTagsFilterAsBefore() {
        SrsDeck deck = deck("""
                {"cards":[{"id":"a","front":"F","back":"B","tags":["select:x"]},
                          {"id":"b","front":"F","back":"B"},
                          {"id":"c","front":"F","back":"B","tags":["select:y","select:x"]}]}""");
        assertThat(deck.select(List.of("select:x"))).extracting(SrsCard::id).containsExactly("a", "c");
        assertThat(deck.select(List.of())).hasSize(3);
    }

    @Test
    void releaseNeedsEveryCountedUnderstandingGoalAndCountsCredits() {
        // g1, g2 are learner-facing target goals; g3 lies outside the Personal Curriculum.
        Set<String> counted = Set.of("g1", "g2");
        SrsCardRelease nothingPassed = new SrsCardRelease(counted, Set.of());
        SrsCardRelease g1Passed = new SrsCardRelease(counted, Set.of("g1"));
        SrsCardRelease g1PassedG2Credited = new SrsCardRelease(counted, Set.of("g1", "g2"));

        assertThat(nothingPassed.isReleased(card("single", "g1"))).isFalse();
        assertThat(g1Passed.isReleased(card("single", "g1"))).isTrue();
        assertThat(g1Passed.isReleased(card("several", "g1", "g2"))).isFalse();
        assertThat(g1PassedG2Credited.isReleased(card("several", "g1", "g2"))).isTrue();
        // A goal outside the Personal Curriculum does not count.
        assertThat(g1Passed.isReleased(card("outside", "g1", "g3"))).isTrue();
        assertThat(nothingPassed.isReleased(card("onlyOutside", "g3"))).isTrue();
        // Without an understanding goal the card stays released (language and legacy decks).
        assertThat(nothingPassed.isReleased(card("none"))).isTrue();
        assertThat(SrsCardRelease.all().isReleased(card("any", "g1"))).isTrue();
    }

    @Test
    void changedCurriculumRechecksOnlyCountedUnderstandingGoalsForTheBoxAndRecall() {
        SrsCard mixed = card("mixed", "regular", "second-subject");
        SrsCard outside = card("outside", "other-subject");
        List<SrsCard> deck = List.of(mixed, outside);
        SrsCardRelease firstSubject = new SrsCardRelease(Set.of("regular"), Set.of("regular"));
        SrsCardRelease bothSubjects = new SrsCardRelease(Set.of("regular", "second-subject"), Set.of("regular"));

        assertThat(SrsCardSelection.nextRecallBatch(deck, Map.of(), firstSubject, NOW, BERLIN, 10))
                .containsExactly(mixed, outside);
        assertThat(SrsCardSelection.nextRecallBatch(deck, Map.of(), bothSubjects, NOW, BERLIN, 10))
                .containsExactly(outside);
        assertThat(SrsCardSelection.tally(deck, Map.of(), bothSubjects, NOW))
                .isEqualTo(new SrsCardSelection.BoxTally(1, 1, false));
        var passed = SrsCardStateSummary.of(Map.of("verifiedRecall",
                Map.of("status", "passed", "passedAt", "2026-11-20T08:00:00Z")));
        assertThat(SrsCardSelection.recallStatus(deck, deck, Map.of("mixed", passed), bothSubjects, NOW, BERLIN))
                .isEqualTo(new SrsCardSelection.RecallStatus(2, 1, 1, 1, 0, 0));
    }

    @Test
    void stateProjectionFollowsTheFormerJsonRules() {
        assertThat(SrsCardStateSummary.of(null).due(NOW)).isTrue();
        assertThat(SrsCardStateSummary.of(Map.of("interval", 1, "nextReview", NOW.plusSeconds(60).toEpochMilli())).due(NOW))
                .isFalse();
        assertThat(SrsCardStateSummary.of(Map.of("interval", 1, "nextReview", NOW.minusSeconds(60).toEpochMilli())).due(NOW))
                .isTrue();
        // Without a usable schedule a card is due.
        assertThat(SrsCardStateSummary.of(Map.of("nextReview", NOW.plusSeconds(60).toEpochMilli())).due(NOW)).isTrue();
        assertThat(SrsCardStateSummary.of(Map.of("interval", 1, "nextReview", "not a time")).due(NOW)).isTrue();
        assertThat(SrsCardStateSummary.of(Map.of("interval", 1, "nextReview", NOW.plusSeconds(60).toString())).due(NOW))
                .isFalse();
        assertThat(SrsCardStateSummary.of(Map.of("repetitions", 3)).practiceRepetition()).isEqualTo(3);
        assertThat(SrsCardStateSummary.of(Map.of("verifiedRecall", Map.of("status", "passed"))).recallPassed())
                .as("a pass needs passedAt").isFalse();
        SrsCardStateSummary tested = SrsCardStateSummary.of(Map.of("verifiedRecall",
                Map.of("status", "failed", "lastTestedAt", "2026-11-23T08:00:00Z")));
        assertThat(tested.testedOn(NOW, BERLIN)).isTrue();
        assertThat(tested.testedAfter(NOW)).isFalse();
    }

    @Test
    void aPassedCardLeavesTheBoxForGoodAndALockedCardIsNeverDue() {
        SrsCardRelease release = new SrsCardRelease(Set.of("g1"), Set.of());
        SrsCardStateSummary passed = SrsCardStateSummary.of(Map.of("interval", 1, "nextReview", 0,
                "verifiedRecall", Map.of("status", "passed", "passedAt", "2026-11-01T10:00:00Z")));
        SrsCard free = card("free");
        assertThat(SrsCardSelection.inBox(free, passed, release)).isFalse();
        assertThat(SrsCardSelection.due(free, passed, release, NOW)).isFalse();
        assertThat(SrsCardSelection.recallEligible(free, passed, release, NOW, BERLIN)).isFalse();

        SrsCard locked = card("locked", "g1");
        assertThat(SrsCardSelection.due(locked, null, release, NOW)).isFalse();
        assertThat(SrsCardSelection.recallEligible(locked, null, release, NOW, BERLIN)).isFalse();
        assertThat(SrsCardSelection.due(free, null, release, NOW)).isTrue();
    }

    @Test
    void aBatchIssuedForOneScopeStaysValidWhenTheCurrentScopeChanges() {
        List<SrsCard> deck = List.of(card("a", "u1"), card("b", "other"), card("c", "u1"), card("d", "u1"));
        List<SrsCard> unit = List.of(deck.get(0), deck.get(2), deck.get(3));
        Map<String, SrsCardStateSummary> states = Map.of();
        SrsCardRelease release = SrsCardRelease.all();

        List<SrsCard> issuedForUnit = SrsCardSelection.nextRecallBatch(unit, states, release, NOW, BERLIN, 2);
        assertThat(issuedForUnit).extracting(SrsCard::id).containsExactly("a", "c");
        List<String> ids = issuedForUnit.stream().map(SrsCard::id).toList();
        // The current context is now the whole deck; the unit stays a candidate scope.
        assertThat(SrsCardSelection.matchIssuedBatch(List.of(deck), ids, states, release, NOW, BERLIN, 2)).isEmpty();
        assertThat(SrsCardSelection.matchIssuedBatch(List.of(deck, unit), ids, states, release, NOW, BERLIN, 2))
                .hasValueSatisfying(batch -> assertThat(batch).extracting(SrsCard::id).containsExactly("a", "c"));
        // Shortened, reordered and stale batches match no scope.
        assertThat(SrsCardSelection.matchIssuedBatch(List.of(deck, unit), List.of("a"), states, release, NOW, BERLIN, 2))
                .isEmpty();
        assertThat(SrsCardSelection.matchIssuedBatch(List.of(deck, unit), List.of("c", "a"), states, release, NOW, BERLIN, 2))
                .isEmpty();
        Map<String, SrsCardStateSummary> gradedToday = Map.of("a", SrsCardStateSummary.of(Map.of("verifiedRecall",
                Map.of("status", "failed", "lastTestedAt", NOW.plusSeconds(5).toString()))));
        assertThat(SrsCardSelection.matchIssuedBatch(List.of(deck, unit), ids, gradedToday, release, NOW, BERLIN, 2))
                .isEmpty();
    }

    @Test
    void recallStatusKeepsDeckTotalsAndNeverReportsAUnitAsComplete() {
        SrsCardStateSummary passed = SrsCardStateSummary.of(Map.of("verifiedRecall",
                Map.of("status", "passed", "passedAt", "2026-11-01T10:00:00Z")));
        SrsCardStateSummary failedToday = SrsCardStateSummary.of(Map.of("verifiedRecall",
                Map.of("status", "failed", "lastTestedAt", "2026-11-23T08:00:00Z")));
        List<SrsCard> deck = List.of(card("a", "u1"), card("b", "u1"), card("c", "g2"), card("d"));
        List<SrsCard> unit = deck.subList(0, 2);
        SrsCardRelease release = new SrsCardRelease(Set.of("u1", "g2"), Set.of("u1"));

        var unitDone = SrsCardSelection.recallStatus(deck, unit, Map.of("a", passed, "b", passed), release, NOW, BERLIN);
        assertThat(unitDone).isEqualTo(new SrsCardSelection.RecallStatus(4, 2, 2, 0, 2, 0));

        var deckScope = SrsCardSelection.recallStatus(deck, deck, Map.of("a", passed, "b", failedToday), release, NOW, BERLIN);
        // c is locked, d is released; b was tested today.
        assertThat(deckScope).isEqualTo(new SrsCardSelection.RecallStatus(4, 1, 3, 1, 2, 1));
    }

    @Test
    void theCheckIsProposedOnlyWhenEveryOpenCardWasKnownTwice() {
        List<SrsCard> cards = List.of(card("a"), card("b"));
        SrsCardStateSummary twice = SrsCardStateSummary.of(Map.of("interval", 6, "repetition", 2,
                "nextReview", NOW.plusSeconds(3600).toEpochMilli()));
        SrsCardStateSummary once = SrsCardStateSummary.of(Map.of("interval", 1, "repetition", 1,
                "nextReview", NOW.minusSeconds(60).toEpochMilli()));
        SrsCardRelease release = SrsCardRelease.all();
        assertThat(SrsCardSelection.tally(cards, Map.of("a", twice, "b", once), release, NOW))
                .isEqualTo(new SrsCardSelection.BoxTally(2, 1, false));
        assertThat(SrsCardSelection.tally(cards, Map.of("a", twice, "b", twice), release, NOW))
                .isEqualTo(new SrsCardSelection.BoxTally(2, 0, true));
        assertThat(SrsCardSelection.tally(List.of(), Map.of(), release, NOW))
                .isEqualTo(new SrsCardSelection.BoxTally(0, 0, false));
    }
}
