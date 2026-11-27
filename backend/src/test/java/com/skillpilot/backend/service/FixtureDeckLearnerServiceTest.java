package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.doReturn;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.skillpilot.backend.api.LearnerDataDTO;
import com.skillpilot.backend.api.MasteryEntryDTO;
import com.skillpilot.backend.api.PortableSrsData;
import com.skillpilot.backend.api.SignedLearnerDataDTO;
import com.skillpilot.backend.api.VerifiedRecallPromptCard;
import com.skillpilot.backend.completion.PersonalCurriculumLearningScope;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.LearningState;
import com.skillpilot.backend.domain.Mastery;
import com.skillpilot.backend.domain.MasteryId;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import com.skillpilot.backend.service.srs.SrsCardStateStore;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.annotation.Transactional;

/** Exercises the real learner projection, stored results and recall over one fixed graph and one deck. */
@SpringBootTest(properties = "skillpilot.landscapes.directory=src/test/resources/srs-regression-curriculum")
@ActiveProfiles("test")
@Transactional
class FixtureDeckLearnerServiceTest {

    private static final String LEARNER = "memory-regression-learner";
    private static final String LANDSCAPE = "memory-regression-fixture";
    private static final String DECK = "fixture-deck";
    private static final String SOURCE = "/data/regression_fixture_deck.json";
    private static final String REGULAR = "regular-understanding";
    private static final String OUTSIDE = "other-understanding";
    private static final String PREPARATION = "preparation-understanding";
    private static final Instant EARNED_AT = Instant.parse("2026-10-20T08:00:00Z");

    @Autowired LearnerService service;
    @Autowired LearnerRepository learners;
    @Autowired MasteryRepository mastery;
    @Autowired LandscapeService landscapes;
    @Autowired SrsCardStateStore cardStates;
    @Autowired ObjectMapper mapper;
    @PersistenceContext EntityManager entities;
    @MockitoSpyBean DeckResourceService decks;

    @BeforeEach
    void createLearner() {
        Learner learner = new Learner();
        learner.setSkillpilotId(LEARNER);
        learners.saveAndFlush(learner);
    }

    @Test
    void deckCheckReleasesCardsOutsideTheSelectedLearningScope() {
        Learner learner = activateDeck("GK");
        assertThat(scope(learner).learningAtomicGoalIds()).contains(REGULAR).doesNotContain(OUTSIDE);

        var before = service.startVerifiedRecallBatch(LEARNER, "de", DECK);
        assertThat(before.cards()).extracting(VerifiedRecallPromptCard::cardId).containsExactly("other-card");
        assertThat(before.totalCards()).isEqualTo(3);
        assertThat(before.pendingCards()).isEqualTo(3);
        assertThat(before.eligibleCards()).isOne();
        assertThat(before.blockedCards()).isEqualTo(2);
        assertThat(mastery.findByLearner_SkillpilotId(LEARNER)).isEmpty();

        mastery.saveAndFlush(new Mastery(learner, REGULAR, 1.0));
        var after = service.startVerifiedRecallBatch(LEARNER, "de", DECK);
        assertThat(after.cards()).extracting(VerifiedRecallPromptCard::cardId).containsExactly("regular-card", "other-card");
        assertThat(after.verifiedCards()).isZero();
    }

    @Test
    void deckCheckCountsARequiredPreparationInTheLearningBasis() {
        Learner learner = activateDeck("LK");
        var scope = scope(learner);
        assertThat(scope.seedAtomicGoalIds()).contains("advanced-target").doesNotContain(PREPARATION);
        assertThat(scope.learningAtomicGoalIds()).contains(PREPARATION);
        assertThat(service.startVerifiedRecallBatch(LEARNER, "de", DECK).cards()).isEmpty();

        mastery.saveAndFlush(new Mastery(learner, PREPARATION, 1.0));
        assertThat(service.startVerifiedRecallBatch(LEARNER, "de", DECK).cards())
                .extracting(VerifiedRecallPromptCard::cardId).containsExactly("preparation-card");
    }

    @Test
    void legacyDeckMasteryWithoutCardRowsIsReadInItsCurrentProjection() {
        Learner learner = learners.findById(LEARNER).orElseThrow();
        mastery.saveAndFlush(new Mastery(learner, DECK, 1.0));
        assertThat(service.getMastery(LEARNER)).containsEntry(DECK, 1.0);

        selectCourse("GK");
        assertThat(service.getMastery(LEARNER)).containsEntry(DECK, 0.0);
        entities.clear();
        assertThat(mastery.findById(new MasteryId(LEARNER, DECK)).orElseThrow().getValue()).isEqualTo(1.0);
        assertThat(cardStates.loadNode(LEARNER, DECK).cards()).isEmpty();
    }

    @Test
    void signedRestorePreservesFormerDeckMasteryAndItsPassedAndFailedCardRows() {
        selectCourse("GK");
        Map<String, Object> archivedCards = Map.of(
                "regular-card", passed("regular-card"),
                "other-card", Map.of("id", "other-card", "verifiedRecall",
                        Map.of("status", "failed", "lastTestedAt", "2026-10-21T08:00:00Z")));
        var archive = new LearnerDataDTO(null, Map.of(DECK, new MasteryEntryDTO(1, EARNED_AT)),
                List.of(), Set.of(), null, new PortableSrsData(1, Map.of(DECK, archivedCards)));
        String signature = ReflectionTestUtils.invokeMethod(service, "calculateSignature", archive);

        service.importLearner(LEARNER, new SignedLearnerDataDTO(archive, signature));
        entities.flush();
        entities.clear();

        assertThat(service.getMastery(LEARNER)).containsEntry(DECK, 0.0);
        Mastery stored = mastery.findById(new MasteryId(LEARNER, DECK)).orElseThrow();
        assertThat(stored.getValue()).isEqualTo(1.0);
        assertThat(stored.getUpdatedAt()).isEqualTo(EARNED_AT);
        assertThat(service.getClientState(LEARNER, DECK).srsState()).isEqualTo(archivedCards);
    }

    @Test
    void aNewCardReopensAPreviouslyVerifiedDeckWithoutErasingItsResults() throws Exception {
        Learner learner = selectCourse("GK");
        mastery.saveAndFlush(new Mastery(learner, DECK, 1.0));
        cardStates.replaceNode(LEARNER, DECK, Map.of(
                "regular-card", passed("regular-card"),
                "other-card", passed("other-card"),
                "preparation-card", passed("preparation-card")), EARNED_AT);
        var deck = landscapes.getGoalDefinition(DECK);
        assertThat(service.resolveSrsMasterySnapshot(LEARNER, List.of(deck))).containsEntry(DECK, true);
        var priorEvidence = cardStates.loadNode(LEARNER, DECK).cards();

        var expanded = mapper.readTree(decks.resolveDeckResource(DECK, SOURCE).getContentAsByteArray());
        ((ArrayNode) expanded.required("cards")).addObject()
                .put("id", "new-card").put("front", "New question").put("back", "New answer");
        doReturn(new ByteArrayResource(mapper.writeValueAsBytes(expanded))).when(decks).resolveDeckResource(DECK, SOURCE);
        assertThat(service.resolveSrsMasterySnapshot(LEARNER, List.of(deck))).containsEntry(DECK, false);
        entities.flush();
        entities.clear();
        assertThat(mastery.findById(new MasteryId(LEARNER, DECK)).orElseThrow().getValue()).isEqualTo(1.0);
        assertThat(cardStates.loadNode(LEARNER, DECK).cards()).isEqualTo(priorEvidence);

        cardStates.updateCards(LEARNER, DECK, List.of("new-card"), (cardId, state) -> passed(cardId), EARNED_AT);
        assertThat(service.resolveSrsMasterySnapshot(LEARNER, List.of(deck))).containsEntry(DECK, true);
    }

    private static Map<String, Object> passed(String cardId) {
        return Map.of("id", cardId, "verifiedRecall", Map.of("status", "passed", "passedAt", EARNED_AT.toString()));
    }

    private Learner selectCourse(String course) {
        Learner learner = learners.findById(LEARNER).orElseThrow();
        learner.setSelectedCurriculum(LANDSCAPE);
        learner.setPersonalCurriculum("""
                {"memory-regression-fixture":{"selected":true,"stage":"SekII","filterId":"%s"}}
                """.formatted(course));
        return learners.saveAndFlush(learner);
    }

    private Learner activateDeck(String course) {
        Learner learner = selectCourse(course);
        learner.setActiveGoalId(DECK);
        learner.setLearningState(LearningState.TEACHING);
        learners.saveAndFlush(learner);
        service.setPlannedGoals(LEARNER, Set.of(DECK));
        return learner;
    }

    private PersonalCurriculumLearningScope scope(Learner learner) {
        Object projection = ReflectionTestUtils.invokeMethod(service, "getGoalProjection",
                learner.getSelectedCurriculum(), learner.getPersonalCurriculum());
        return ReflectionTestUtils.invokeMethod(projection, "learningScope");
    }
}
