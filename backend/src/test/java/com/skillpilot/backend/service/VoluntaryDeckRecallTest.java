package com.skillpilot.backend.service;

import static com.skillpilot.backend.service.VoluntaryOfferTestConfiguration.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doReturn;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.skillpilot.backend.ai.CoachToolFacade;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.VerifiedRecallBatchCardResult;
import com.skillpilot.backend.api.VerifiedRecallBatchResultRequest;
import com.skillpilot.backend.api.VerifiedRecallBatchResultResponse;
import com.skillpilot.backend.api.VerifiedRecallPromptResponse;
import com.skillpilot.backend.api.VerifiedRecallResultRequest;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.LearnerCardStateId;
import com.skillpilot.backend.domain.LearningState;
import com.skillpilot.backend.domain.Mastery;
import com.skillpilot.backend.domain.MasteryId;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import java.io.IOException;
import java.time.Clock;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Primary;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.server.ResponseStatusException;

@SpringBootTest
@ActiveProfiles("test")
@Import(VoluntaryDeckRecallTest.CardViews.class)
class VoluntaryDeckRecallTest {
    static final String REGULAR_DECK = "9f2f5ab8-0ae4-5792-b831-82a05af5895c";
    static final String VOLUNTARY_DECK = "69f0038a-6e2b-55b5-8ff0-d2ea8852e793";
    static final String FOCUS = "composition:test-voluntary-decks:structure:mixed";
    private static final String CHEMISTRY = "c436b994-8f44-5134-b9f8-0c9f5d6a5ba0";
    private static final String SALTS = "b5086548-169e-5d63-a14a-dabf631fa013";
    private static final String ATOMIC_STRUCTURE_DECK = "1e519951-9850-5a07-ac82-d9f0075e3d05";

    @TestConfiguration(proxyBeanMethods = false)
    static class CardViews {
        @Bean @Primary CompositionViewService cardViews(ObjectMapper mapper, LandscapeService landscapes) throws IOException {
            return VoluntaryOfferTestConfiguration.readViews("fixtures/voluntary-offer-cards", mapper, landscapes);
        }
    }

    @Autowired LearnerService service;
    @Autowired CoachToolFacade coach;
    @Autowired LearnerRepository learners;
    @Autowired MasteryRepository mastery;
    @Autowired com.skillpilot.backend.repository.LearnerCardStateRepository cardRows;
    @Autowired LandscapeService landscapes;
    @Autowired ObjectMapper mapper;
    @Autowired TransactionTemplate transactions;
    @MockitoSpyBean DeckResourceService decks;
    String id;

    @BeforeEach void selectPhysics() throws Exception {
        var learner = new Learner();
        id = "offer-cards-" + UUID.randomUUID();
        learner.setSkillpilotId(id);
        learner.setSelectedCurriculum(ROOT);
        learner.setPersonalCurriculum(mapper.writeValueAsString(Map.of(
                ROOT, Map.of("selected", true, "filterId", "DE-HE", "stage", "SekII", "durationModel", "G9"),
                PHYSICS, Map.of("selected", true, "filterId", "GK"),
                "__skillpilot_stage_scope_sek2__", Map.of("selected", true),
                CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY, Map.of(
                        CurriculumPersonalizationPlanner.ROOT_LANDSCAPE_ID_KEY, ROOT,
                        CurriculumPersonalizationPlanner.COMPLETED_OPTION_IDS_KEY, List.of(),
                        CurriculumPersonalizationPlanner.MIGRATION_COMPLETED_KEY, true))));
        learners.saveAndFlush(learner);
        pass(INTRO);
        deck(REGULAR_DECK, List.of(card("mixed", TEMPERATURE, ARROW), card("extra", INTRO, ARROW)));
        deck(VOLUNTARY_DECK, List.of(card("first", ARROW), card("later", MASS)));
    }

    private Map<String, Object> card(String cardId, String... origins) {
        return Map.of("id", cardId, "front", cardId, "back", cardId, "originGoalIds", List.of(origins),
                "tags", List.of("GK"));
    }

    private void deck(String deckId, List<Map<String, Object>> cards) throws Exception {
        var bytes = new ByteArrayResource(mapper.writeValueAsBytes(Map.of("cards", cards)), deckId);
        doReturn(bytes).when(decks).resolveDeckResource(eq(deckId), anyString());
    }

    private void pass(String goal) {
        mastery.saveAndFlush(new Mastery(learners.findById(id).orElseThrow(), goal, 1.0));
    }

    private void activate(String goal) {
        activateWithin(goal, FOCUS);
    }

    private void activateWithin(String goal, String focus) {
        service.setPlannedGoals(id, Set.of(focus));
        var learner = learners.findById(id).orElseThrow();
        learner.setActiveGoalId(goal);
        learner.setLearningState(LearningState.TEACHING);
        learners.saveAndFlush(learner);
    }

    private VerifiedRecallBatchResultResponse mark(VerifiedRecallPromptResponse issued, boolean passed, String unit) {
        var ids = issued.cards().stream().map(card -> card.cardId()).toList();
        var results = ids.stream().map(card -> new VerifiedRecallBatchCardResult(card, passed)).toList();
        return service.recordVerifiedRecallResultsBatch(id, "de", new VerifiedRecallBatchResultRequest(
                issued.goalId(), issued.configuredBatchSize(), ids, issued.issuedAt(), results), unit);
    }

    @Test void aRegularDeckCanFinishBeforeItsVoluntaryCardAndThatCardRemainsTestableInTheUnit() {
        activate(REGULAR_DECK);
        assertThat(service.startVerifiedRecallBatch(id, "de", REGULAR_DECK).cards()).isEmpty();
        pass(TEMPERATURE);
        var ordinary = service.startVerifiedRecallBatch(id, "de", REGULAR_DECK);
        assertThat(ordinary.cards()).extracting(card -> card.cardId()).containsExactly("mixed");
        assertThat(ordinary.totalCards()).isOne();
        assertThat(mark(ordinary, true, null).masterySaved()).isTrue();
        var previous = mastery.findById(new MasteryId(id, REGULAR_DECK)).orElseThrow().getUpdatedAt();

        pass(ARROW);
        activate(TEMPERATURE);
        var extra = service.startVerifiedRecallUnitCheck(id, "de");
        assertThat(extra.goalId()).isEqualTo(REGULAR_DECK);
        assertThat(extra.prompt().cards()).extracting(card -> card.cardId()).containsExactly("extra");
        assertThat(mark(extra.prompt(), false, extra.practiceScopeId()).masterySaved()).isFalse();
        assertThat(service.getMastery(id)).containsEntry(REGULAR_DECK, 1.0);
        assertThat(service.resolveSrsMasterySnapshot(id, List.of(landscapes.getGoalDefinition(REGULAR_DECK))))
                .containsEntry(REGULAR_DECK, true);
        assertThat(mastery.findById(new MasteryId(id, REGULAR_DECK)).orElseThrow().getUpdatedAt()).isEqualTo(previous);
        assertThat(service.getClientState(id, REGULAR_DECK).srsState()).containsKeys("mixed", "extra");
    }

    @Test void anOfferDeckNeedsOneReleasedVerifiedCardAndKeepsItsEarnedResultAcrossNewReleaseAndRestore() throws Exception {
        activate(VOLUNTARY_DECK);
        var empty = service.startVerifiedRecallBatch(id, "de", VOLUNTARY_DECK);
        assertThat(empty.status()).isEqualTo("waiting");
        assertThat(mastery.findById(new MasteryId(id, VOLUNTARY_DECK))).isEmpty();
        assertThat(empty.totalCards()).isZero();
        assertThat(empty.instruction()).contains("Ziel bleibt offen");
        assertThat(service.getMastery(id)).containsEntry(VOLUNTARY_DECK, 0.0);
        pass(ARROW);
        var first = service.startVerifiedRecallBatch(id, "de", VOLUNTARY_DECK);
        assertThat(first.cards()).extracting(card -> card.cardId()).containsExactly("first");
        var testedAt = first.issuedAt().plusSeconds(1).truncatedTo(ChronoUnit.SECONDS).plusNanos(987_654_900);
        var priorClock = ReflectionTestUtils.getField(service, "verifiedRecallClock");
        ReflectionTestUtils.setField(service, "verifiedRecallClock", Clock.fixed(testedAt, ZoneOffset.UTC));
        try {
            assertThat(mark(first, true, null).masterySaved()).isTrue();
        } finally {
            ReflectionTestUtils.setField(service, "verifiedRecallClock", priorClock);
        }
        pass(MASS);
        deck(VOLUNTARY_DECK, List.of(card("first", ARROW), card("later", MASS), card("added", ARROW)));
        var result = mastery.findById(new MasteryId(id, VOLUNTARY_DECK)).orElseThrow();
        assertThat(result.getUpdatedAt()).isEqualTo(testedAt.truncatedTo(ChronoUnit.MICROS));
        assertThat(service.getMastery(id)).containsEntry(VOLUNTARY_DECK, 1.0);
        // A previously stored card need not have its indexed recall date. Its signed payload still does.
        var oldRow = cardRows.findById(new LearnerCardStateId(id, VOLUNTARY_DECK, "first")).orElseThrow();
        assertThat(oldRow.getRecallTestedAt()).isEqualTo(result.getUpdatedAt());
        oldRow.setRecallTestedAt(null);
        cardRows.saveAndFlush(oldRow);
        assertThat(service.getMastery(id)).containsEntry(VOLUNTARY_DECK, 1.0);
        var archive = service.exportLearner(id);
        assertThat(archive.data().mastery().get(VOLUNTARY_DECK).updatedAt()).isEqualTo(result.getUpdatedAt());
        var restored = service.createLearner().getSkillpilotId();
        service.importLearner(restored, archive);
        assertThat(service.getMastery(restored)).containsEntry(VOLUNTARY_DECK, 1.0);
        assertThat(service.getClientState(restored, VOLUNTARY_DECK).srsState())
                .isEqualTo(service.getClientState(id, VOLUNTARY_DECK).srsState());
        assertThat(mastery.findById(new MasteryId(restored, VOLUNTARY_DECK)).orElseThrow().getUpdatedAt())
                .isEqualTo(result.getUpdatedAt());
    }

    @Test void earlierPartialRecallCannotValidateALaterStoredDeckNumberEvenAfterTheCardIsRemoved() throws Exception {
        pass(ARROW);
        pass(MASS);
        activate(VOLUNTARY_DECK);
        var partial = service.recordVerifiedRecallResult(id, "de", new VerifiedRecallResultRequest(VOLUNTARY_DECK, "first", true));
        assertThat(partial.masterySaved()).isFalse();
        var cardKey = new LearnerCardStateId(id, VOLUNTARY_DECK, "first");
        var original = cardRows.findById(cardKey).orElseThrow();
        var laterNumberDate = original.getRecallTestedAt().plusSeconds(1);

        pass(VOLUNTARY_DECK);
        transactions.executeWithoutResult(status -> mastery.updateTimestamp(id, VOLUNTARY_DECK, laterNumberDate));
        assertThat(service.getMastery(id)).containsEntry(VOLUNTARY_DECK, 0.0);

        deck(VOLUNTARY_DECK, List.of(card("later", MASS), card("added", ARROW)));
        assertThat(service.getMastery(id)).containsEntry(VOLUNTARY_DECK, 0.0);
        assertThat(service.startVerifiedRecallBatch(id, "de", VOLUNTARY_DECK).cards())
                .extracting(card -> card.cardId()).containsExactly("later", "added");
        var retained = mastery.findById(new MasteryId(id, VOLUNTARY_DECK)).orElseThrow();
        assertThat(retained.getValue()).isEqualTo(1.0);
        assertThat(retained.getUpdatedAt()).isEqualTo(laterNumberDate);
        assertThat(cardRows.findById(cardKey)).get().satisfies(saved ->
                assertThat(saved.getCardState()).isEqualTo(original.getCardState()));
    }

    @Test void laterPartialRecallDoesNotTurnAnUnsupportedHistoricalDeckNumberIntoANewPass() throws Exception {
        activate(VOLUNTARY_DECK);
        pass(ARROW);
        pass(MASS);
        pass(VOLUNTARY_DECK); // Historical mastery with no evidence for either released card.
        assertThat(service.getMastery(id)).containsEntry(VOLUNTARY_DECK, 0.0);
        var first = service.recordVerifiedRecallResult(id, "de", new VerifiedRecallResultRequest(VOLUNTARY_DECK, "first", true));
        assertThat(first.masterySaved()).isFalse();
        assertThat(service.getMastery(id)).containsEntry(VOLUNTARY_DECK, 0.0);
        var second = service.recordVerifiedRecallResult(id, "de", new VerifiedRecallResultRequest(VOLUNTARY_DECK, "later", true));
        assertThat(second.masterySaved()).isTrue();
        deck(VOLUNTARY_DECK, List.of(card("first", ARROW), card("later", MASS), card("added", MASS)));
        assertThat(service.getMastery(id)).containsEntry(VOLUNTARY_DECK, 1.0);
    }

    @Test void aStaleActiveOfferDeckDoesNotAuthorizeRecallOutsideTheCurrentFocus() {
        for (String unrelatedFocus : List.of(TEMPERATURE, ARROW_TASK)) {
            activateWithin(VOLUNTARY_DECK, unrelatedFocus);
            assertThatThrownBy(() -> service.startVerifiedRecallBatch(id, "de", VOLUNTARY_DECK))
                    .isInstanceOfSatisfying(ResponseStatusException.class, error -> {
                        assertThat(error.getStatusCode().value()).isEqualTo(409);
                        assertThat(error.getReason()).contains("requires the current active");
                    });
        }
    }

    @Test void aDeckStartedAsAnOfferedPrerequisiteCanRunVerifiedRecallInTheSelectedFocus() throws Exception {
        var learner = learners.findById(id).orElseThrow();
        var configuration = (ObjectNode) mapper.readTree(learner.getPersonalCurriculum());
        configuration.set(CHEMISTRY, mapper.valueToTree(Map.of("selected", true, "filterId", "GK")));
        learner.setPersonalCurriculum(mapper.writeValueAsString(configuration));
        learners.saveAndFlush(learner);
        var definition = landscapes.getGoalDefinition(ATOMIC_STRUCTURE_DECK);
        assertThat(landscapes.getGoalDefinition(SALTS).getRequires()).contains(ATOMIC_STRUCTURE_DECK);
        definition.getRequires().forEach(this::pass);

        service.setPlannedGoals(id, Set.of(SALTS));
        var frontier = service.getUncompactedRichFrontier(id);
        assertThat(frontier).filteredOn(goal -> ATOMIC_STRUCTURE_DECK.equals(goal.id()))
                .singleElement().matches(FrontierGoal::voluntaryStudy);
        assertThat(frontier).extracting(FrontierGoal::id).doesNotContain(SALTS);
        service.setActiveGoal(id, ATOMIC_STRUCTURE_DECK);
        assertThat(service.getCoachLearnerState(id).activeGoal()).extracting(FrontierGoal::id)
                .isEqualTo(ATOMIC_STRUCTURE_DECK);
        assertThat(service.getPlannedGoals(id)).containsExactly(SALTS);

        var prompt = coach.startVerifiedRecallBatch(id, "de", ATOMIC_STRUCTURE_DECK);
        assertThat(prompt.status()).isEqualTo("ready");
        assertThat(prompt.cards()).extracting(card -> card.cardId()).contains("chem_bond_004");
        var result = mark(prompt, true, null);
        assertThat(result.savedResults()).anySatisfy(card -> {
            assertThat(card.cardId()).isEqualTo("chem_bond_004");
            assertThat(card.passed()).isTrue();
        });
        assertThat(cardRows.findById(new LearnerCardStateId(id, ATOMIC_STRUCTURE_DECK, "chem_bond_004")))
                .hasValueSatisfying(card -> assertThat(card.getRecallStatus()).isEqualTo("passed"));
    }

    @Test void aReleasedCardCanBeCheckedInAnEntirelyVoluntaryUnit() throws Exception {
        deck(REGULAR_DECK, List.of(card("mass", MASS)));
        pass(MASS);
        activate(MASS);
        var check = service.startVerifiedRecallUnitCheck(id, "de");
        assertThat(check.practiceScopeId()).isEqualTo("optional");
        assertThat(check.prompt().cards()).extracting(card -> card.cardId()).containsExactly("mass");
        assertThat(mark(check.prompt(), true, check.practiceScopeId()).masterySaved()).isFalse();
        assertThat(service.getMastery(id)).containsEntry(REGULAR_DECK, 0.0);
    }

    @Test void aRegularDeckWithOnlyOfferCardsNeverPassesItsEmptyCountedSet() throws Exception {
        deck(REGULAR_DECK, List.of(card("extra", ARROW)));
        activate(REGULAR_DECK);
        pass(ARROW);
        var prompt = service.startVerifiedRecallBatch(id, "de", REGULAR_DECK);
        assertThat(prompt.status()).isEqualTo("waiting");
        assertThat(prompt.cards()).isEmpty();
        assertThat(prompt.totalCards()).isZero();
        assertThat(service.getMastery(id)).containsEntry(REGULAR_DECK, 0.0);
    }
}
