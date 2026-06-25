package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.skillpilot.backend.api.MasteryUpdateRequest;
import com.skillpilot.backend.api.VerifiedRecallPromptCard;
import com.skillpilot.backend.api.VerifiedRecallResultRequest;
import com.skillpilot.backend.api.VerifiedRecallStartRequest;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.LearningState;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.PlannedGoalRepository;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
public class LearnerServiceTest {

    private static final String CANONICAL_GYMNASIUM_ROOT_ID = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
    private static final String COMPOSITION_J8_SCOPE_ID =
            "composition:merged:de-de-gym-math-lk+de-de-gym-math-gk:structure:j8";
    private static final String COMPOSITION_J9_SCOPE_ID =
            "composition:merged:de-de-gym-math-lk+de-de-gym-math-gk:structure:j9";
    private static final String COMPOSITION_J10_SCOPE_ID =
            "composition:merged:de-de-gym-math-lk+de-de-gym-math-gk:structure:j10";
    private static final String SEK1_EXERCISES_SCOPE_ID = "bfc4fe23-bfa4-4836-9bd2-793f4305d682";
    private static final String REMOVED_SEK1_CAPSTONE_ID = "30b62966-80d0-45f1-bdd9-b4fb815c7111";
    private static final String VISIBLE_POLYNOMIAL_FUNCTIONS_ID = "1ce8af38-082a-477b-af48-b924c92761bf";
    private static final String HIDDEN_TRIGONOMETRIC_EXPONENTIAL_CORRIDOR_ID =
            "0756b198-0074-49d5-becd-9bb9f161a291";
    private static final String HIDDEN_POLYNOMIAL_END_BEHAVIOR_ID = "283ec44e-747c-55e3-9a61-4a4cc70ebfab";
    private static final String SEK1_CORE_FORMULAS_FLASHCARDS_ID = "4eefbd04-9e49-41ea-a087-9ad6ac71ec5a";

    @Autowired
    private LearnerService learnerService;

    @Autowired
    private LearnerRepository learnerRepository;

    @Autowired
    private PlannedGoalRepository plannedGoalRepository;

    private String learnerId;

    @BeforeEach
    void setUp() {
        Learner learner = new Learner();
        learner.setSkillpilotId("test-learner");
        learnerRepository.save(learner);
        learnerId = learner.getSkillpilotId();
    }

    @AfterEach
    void tearDown() {
        plannedGoalRepository.deleteAll();
        learnerRepository.deleteAll();
    }

    @Test
    @Transactional
    void setPlannedGoals_isIdempotentForSameTargetSet() {
        assertThatCode(() -> learnerService.setPlannedGoals(learnerId, Set.of("GOAL_1"))).doesNotThrowAnyException();
        assertThatCode(() -> learnerService.setPlannedGoals(learnerId, Set.of("GOAL_1"))).doesNotThrowAnyException();

        var goals = plannedGoalRepository.findByLearner_SkillpilotId(learnerId);
        assertThat(goals).hasSize(1);
        assertThat(goals.get(0).getGoalId()).isEqualTo("GOAL_1");
    }

    @Test
    @Transactional
    void setPlannedGoals_updatesDiffWithoutDuplicates() {
        learnerService.setPlannedGoals(learnerId, Set.of("G1", "G2"));
        learnerService.setPlannedGoals(learnerId, Set.of("G2"));

        var goals = plannedGoalRepository.findByLearner_SkillpilotId(learnerId);
        assertThat(goals).hasSize(1);
        assertThat(goals.get(0).getGoalId()).isEqualTo("G2");
    }

    @Test
    void computeEffectiveRequires_inheritsAlongContainsChain() {
        Map<String, LearningGoal> goals = new HashMap<>();
        goals.put("ROOT", goal("ROOT", List.of("PREREQ_ROOT"), List.of("A")));
        goals.put("A", goal("A", List.of("PREREQ_A"), List.of("B")));
        goals.put("B", goal("B", List.of(), List.of()));

        Map<String, List<String>> effective = learnerService.computeEffectiveRequires(goals);

        assertThat(effective.get("ROOT")).containsExactly("PREREQ_ROOT");
        assertThat(effective.get("A")).containsExactlyInAnyOrder("PREREQ_A", "PREREQ_ROOT");
        assertThat(effective.get("B")).containsExactlyInAnyOrder("PREREQ_A", "PREREQ_ROOT");
    }

    @Test
    void computeEffectiveRequires_dropsSelfDependencyFromInherited() {
        Map<String, LearningGoal> goals = new HashMap<>();
        // Parent requires child; child would otherwise inherit itself
        goals.put("PARENT", goal("PARENT", List.of("CHILD"), List.of("CHILD")));
        goals.put("CHILD", goal("CHILD", List.of("LEAF_REQ"), List.of()));

        Map<String, List<String>> effective = learnerService.computeEffectiveRequires(goals);

        assertThat(effective.get("CHILD")).containsExactlyInAnyOrder("LEAF_REQ");
    }

    @Test
    void computeEffectiveRequires_normalizesColonReferences() {
        Map<String, LearningGoal> goals = new HashMap<>();
        goals.put("P", goal("P", List.of("X"), List.of("L1:CH")));
        goals.put("CH", goal("CH", List.of(), List.of()));

        Map<String, List<String>> effective = learnerService.computeEffectiveRequires(goals);
        assertThat(effective.get("CH")).contains("X");
    }

    @Test
    @Transactional
    void getLearnerState_returnsUpdateCurriculum_whenNoCurriculumSelected() {
        var state = learnerService.getLearnerState(learnerId);
        assertThat(state.nextAllowedActions()).containsExactly("setCurriculum");
    }

    @Test
    @Transactional
    void getLearnerState_returnsStandardActions_whenCurriculumSelected() {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum("TEST_CURRICULUM");
        learnerRepository.save(learner);

        var state = learnerService.getLearnerState(learnerId);
        assertThat(state.nextAllowedActions()).containsExactlyInAnyOrder(
                "setPersonalization", "setScope", "getFrontier");
    }

    @Test
    @Transactional
    void getLearnerState_resolvesCompositionViewPlannedScopeForAiFrontier() {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setPersonalCurriculum("""
                {
                  "a0e13c56-c25f-4742-9272-3a1a603ee52e": {"selected": true, "filterId": "ALL"},
                  "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced": {"selected": true, "filterId": "GK"},
                  "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a": {"selected": true, "filterId": "ALL"}
                }
                """);
        learnerRepository.save(learner);

        learnerService.setPlannedGoals(learnerId, Set.of(COMPOSITION_J8_SCOPE_ID));

        var state = learnerService.getLearnerState(learnerId);

        assertThat(state.goals().planned())
                .singleElement()
                .satisfies(goal -> {
                    assertThat(goal.id()).isEqualTo(COMPOSITION_J8_SCOPE_ID);
                    assertThat(goal.title()).isEqualTo("Jahrgangsstufe 8");
                    assertThat(goal.type()).isEqualTo("cluster");
                });
        assertThat(state.goals().scope()).isNotNull();
        assertThat(state.goals().scope().total_atomic()).isLessThan(state.goals().personalized().total_atomic());
        assertThat(state.frontier())
                .extracting(goal -> goal.title())
                .doesNotContain("Mathematik", "Physik");
        assertThat(state.stateMachine().requiredAction()).isNotEqualTo("setScope");
    }

    @Test
    @Transactional
    @SuppressWarnings("unchecked")
    void getFilteredGoals_appliesCanonicalDeCompositionViewWithoutDurationModel() {
        Map<String, LearningGoal> filteredGoals = (Map<String, LearningGoal>) ReflectionTestUtils.invokeMethod(
                learnerService,
                "getFilteredGoals",
                CANONICAL_GYMNASIUM_ROOT_ID,
                """
                        {
                          "a0e13c56-c25f-4742-9272-3a1a603ee52e": {"selected": true, "filterId": "ALL"},
                          "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced": {"selected": true, "filterId": "GK"},
                          "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a": {"selected": true, "filterId": "ALL"}
                        }
                        """);

        assertThat(filteredGoals).isNotNull();
        assertThat(filteredGoals).containsKeys(VISIBLE_POLYNOMIAL_FUNCTIONS_ID, SEK1_EXERCISES_SCOPE_ID);
        assertThat(filteredGoals)
                .doesNotContainKeys(HIDDEN_TRIGONOMETRIC_EXPONENTIAL_CORRIDOR_ID, HIDDEN_POLYNOMIAL_END_BEHAVIOR_ID);
    }

    @Test
    @Transactional
    void getLearnerState_offersNextCompositionYearWhenCurrentYearScopeIsComplete() {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setPersonalCurriculum("""
                {
                  "a0e13c56-c25f-4742-9272-3a1a603ee52e": {"selected": true, "filterId": "ALL"},
                  "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced": {"selected": true, "filterId": "GK"},
                  "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a": {"selected": true, "filterId": "ALL"}
                }
                """);
        learnerRepository.save(learner);
        learnerService.setPlannedGoals(learnerId, Set.of(COMPOSITION_J8_SCOPE_ID));

        completeCurrentScope();

        var state = learnerService.getLearnerState(learnerId);

        assertThat(state.goals().scope_completed()).isTrue();
        assertThat(state.stateMachine().requiredAction()).isEqualTo("setScope");
        assertThat(state.stateMachine().goalOptions())
                .extracting(goal -> goal.id())
                .contains(COMPOSITION_J9_SCOPE_ID);
        assertThat(state.stateMachine().goalOptions())
                .filteredOn(goal -> COMPOSITION_J9_SCOPE_ID.equals(goal.id()))
                .singleElement()
                .satisfies(goal -> {
                    assertThat(goal.title()).isEqualTo("Jahrgangsstufe 9");
                    assertThat(goal.type()).isEqualTo("cluster");
                });
    }

    @Test
    @Transactional
    void getLearnerState_requiresMemoryModeChoiceForActiveFlashcardGoal() {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setPersonalCurriculum("""
                {
                  "a0e13c56-c25f-4742-9272-3a1a603ee52e": {"selected": true, "filterId": "ALL"},
                  "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced": {"selected": true, "filterId": "GK"}
                }
                """);
        learner.setActiveGoalId(SEK1_CORE_FORMULAS_FLASHCARDS_ID);
        learner.setLearningState(LearningState.TEACHING);
        learnerRepository.save(learner);
        learnerService.setPlannedGoals(learnerId, Set.of(SEK1_CORE_FORMULAS_FLASHCARDS_ID));

        var state = learnerService.getLearnerState(learnerId);

        assertThat(state.stateMachine().requiredAction()).isEqualTo("chooseMemoryMode");
        assertThat(state.stateMachine().activeGoal()).isNotNull();
        assertThat(state.stateMachine().activeGoal().nodeKind()).isEqualTo("memory");
        assertThat(state.stateMachine().modeOptions())
                .extracting(option -> option.id())
                .containsExactly("practice", "verify");
        assertThat(state.stateMachine().modeOptions())
                .filteredOn(option -> "verify".equals(option.id()))
                .singleElement()
                .satisfies(option -> {
                    assertThat(option.action()).isEqualTo("startVerifiedRecall");
                    assertThat(option.target()).isEqualTo("gpt");
                    assertThat(option.goalId()).isEqualTo(SEK1_CORE_FORMULAS_FLASHCARDS_ID);
                });
        assertThat(state.nextAllowedActions()).contains("chooseMemoryMode", "startVerifiedRecall");
        assertThat(state.nextAllowedActions()).doesNotContain("setMastery");
    }

    @Test
    @Transactional
    void verifiedRecallForSekOneFlashcardsStartsAndControlsSrsMastery() {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setPersonalCurriculum("""
                {
                  "a0e13c56-c25f-4742-9272-3a1a603ee52e": {"selected": true, "filterId": "ALL"},
                  "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced": {"selected": true, "filterId": "GK"},
                  "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a": {"selected": true, "filterId": "ALL"}
                }
                """);
        learner.setActiveGoalId(SEK1_CORE_FORMULAS_FLASHCARDS_ID);
        learner.setLearningState(LearningState.TEACHING);
        learnerRepository.save(learner);
        learnerService.setPlannedGoals(learnerId, Set.of(SEK1_CORE_FORMULAS_FLASHCARDS_ID));

        assertThat(learnerService.getMastery(learnerId).getOrDefault(SEK1_CORE_FORMULAS_FLASHCARDS_ID, 0.0))
                .isZero();

        var prompt = learnerService.startVerifiedRecall(
                learnerId,
                "de",
                new VerifiedRecallStartRequest(null, false));

        assertThat(prompt.status()).isEqualTo("ready");
        assertThat(prompt.goalId()).isEqualTo(SEK1_CORE_FORMULAS_FLASHCARDS_ID);
        assertThat(prompt.goalTitle()).isEqualTo("Lernkarten - Sek I Kernformeln");
        assertThat(prompt.totalCards()).isPositive();
        assertThat(prompt.verifiedCards()).isZero();
        assertThat(prompt.pendingCards()).isEqualTo(prompt.totalCards());
        assertThat(prompt.batchSize()).isEqualTo(1);
        assertThat(prompt.cards()).hasSize(1);
        assertThat(prompt.cardId()).isNotBlank();
        assertThat(prompt.prompt()).isNotBlank();

        for (int i = 0; i < prompt.totalCards(); i++) {
            assertThat(prompt.cardId()).isNotBlank();
            var result = learnerService.recordVerifiedRecallResult(
                    learnerId,
                    "de",
                    new VerifiedRecallResultRequest(SEK1_CORE_FORMULAS_FLASHCARDS_ID, prompt.cardId(), true, "ok"));
            assertThat(result.passed()).isTrue();
            prompt = result.next();
        }

        assertThat(prompt.status()).isEqualTo("complete");
        assertThat(prompt.pendingCards()).isZero();
        assertThat(learnerService.getMastery(learnerId).get(SEK1_CORE_FORMULAS_FLASHCARDS_ID)).isEqualTo(1.0);
    }

    @Test
    @Transactional
    void verifiedRecallStartCanReturnOptInBatchForNewClients() {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setPersonalCurriculum("""
                {
                  "a0e13c56-c25f-4742-9272-3a1a603ee52e": {"selected": true, "filterId": "ALL"},
                  "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced": {"selected": true, "filterId": "GK"},
                  "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a": {"selected": true, "filterId": "ALL"}
                }
                """);
        learner.setActiveGoalId(SEK1_CORE_FORMULAS_FLASHCARDS_ID);
        learner.setLearningState(LearningState.TEACHING);
        learnerRepository.save(learner);
        learnerService.setPlannedGoals(learnerId, Set.of(SEK1_CORE_FORMULAS_FLASHCARDS_ID));

        var prompt = learnerService.startVerifiedRecall(
                learnerId,
                "de",
                new VerifiedRecallStartRequest(null, false, 10));

        assertThat(prompt.status()).isEqualTo("ready");
        assertThat(prompt.batchSize()).isEqualTo(Math.min(10, prompt.totalCards()));
        assertThat(prompt.cards()).hasSize(prompt.batchSize());
        assertThat(prompt.cardId()).isEqualTo(prompt.cards().get(0).cardId());
        assertThat(prompt.prompt()).isEqualTo(prompt.cards().get(0).prompt());
        assertThat(prompt.cards())
                .extracting(VerifiedRecallPromptCard::cardId)
                .doesNotHaveDuplicates();
    }

    @Test
    @Transactional
    void verifiedRecallFailureLocksCardForRestOfDay() {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setPersonalCurriculum("""
                {
                  "a0e13c56-c25f-4742-9272-3a1a603ee52e": {"selected": true, "filterId": "ALL"},
                  "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced": {"selected": true, "filterId": "GK"},
                  "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a": {"selected": true, "filterId": "ALL"}
                }
                """);
        learner.setActiveGoalId(SEK1_CORE_FORMULAS_FLASHCARDS_ID);
        learner.setLearningState(LearningState.TEACHING);
        learnerRepository.save(learner);
        learnerService.setPlannedGoals(learnerId, Set.of(SEK1_CORE_FORMULAS_FLASHCARDS_ID));

        var firstPrompt = learnerService.startVerifiedRecall(
                learnerId,
                "de",
                new VerifiedRecallStartRequest(null, false));
        String failedCardId = firstPrompt.cardId();

        var failedResult = learnerService.recordVerifiedRecallResult(
                learnerId,
                "de",
                new VerifiedRecallResultRequest(SEK1_CORE_FORMULAS_FLASHCARDS_ID, failedCardId, false, "nicht gewusst"));

        assertThat(failedResult.passed()).isFalse();
        assertThat(failedResult.next().status()).isEqualTo("ready");
        assertThat(failedResult.next().cardId()).isNotEqualTo(failedCardId);
        assertThat(failedResult.next().blockedCards()).isEqualTo(1);
        assertThat(failedResult.next().nextEligibleAt()).isNotBlank();
        assertThat(Instant.parse(failedResult.next().nextEligibleAt())).isAfter(Instant.now());
        assertThat(learnerService.getMastery(learnerId).getOrDefault(SEK1_CORE_FORMULAS_FLASHCARDS_ID, 0.0))
                .isZero();

        assertThatThrownBy(() -> learnerService.recordVerifiedRecallResult(
                learnerId,
                "de",
                new VerifiedRecallResultRequest(SEK1_CORE_FORMULAS_FLASHCARDS_ID, failedCardId, true, "zweiter Versuch")))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("already been tested today");

        var restartedPrompt = learnerService.startVerifiedRecall(
                learnerId,
                "de",
                new VerifiedRecallStartRequest(null, false));

        assertThat(restartedPrompt.status()).isEqualTo("ready");
        assertThat(restartedPrompt.cardId()).isNotEqualTo(failedCardId);
        assertThat(restartedPrompt.blockedCards()).isEqualTo(1);
        assertThat(restartedPrompt.pendingCards()).isEqualTo(restartedPrompt.totalCards());
    }

    @Test
    @Transactional
    void getLearnerStateDoesNotOfferFlashcardGoalWhenNoCardsAreEligibleToday() {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setPersonalCurriculum("""
                {
                  "a0e13c56-c25f-4742-9272-3a1a603ee52e": {"selected": true, "filterId": "ALL"},
                  "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced": {"selected": true, "filterId": "GK"},
                  "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a": {"selected": true, "filterId": "ALL"}
                }
                """);
        learner.setActiveGoalId(SEK1_CORE_FORMULAS_FLASHCARDS_ID);
        learner.setLearningState(LearningState.TEACHING);
        learnerRepository.save(learner);
        learnerService.setPlannedGoals(learnerId, Set.of(SEK1_EXERCISES_SCOPE_ID));

        var prompt = learnerService.startVerifiedRecall(
                learnerId,
                "de",
                new VerifiedRecallStartRequest(null, false));
        boolean failedOneCard = false;
        while ("ready".equals(prompt.status())) {
            boolean passed = failedOneCard;
            var result = learnerService.recordVerifiedRecallResult(
                    learnerId,
                    "de",
                    new VerifiedRecallResultRequest(
                            SEK1_CORE_FORMULAS_FLASHCARDS_ID,
                            prompt.cardId(),
                            passed,
                            passed ? "ok" : "nicht gewusst"));
            failedOneCard = true;
            prompt = result.next();
        }

        assertThat(failedOneCard).isTrue();
        assertThat(prompt.status()).isEqualTo("waiting");
        assertThat(prompt.eligibleCards()).isZero();
        assertThat(prompt.blockedCards()).isPositive();

        var state = learnerService.getLearnerState(learnerId);

        assertThat(state.activeGoal()).isNull();
        assertThat(state.stateMachine().activeGoal()).isNull();
        assertThat(state.stateMachine().requiredAction()).isNotEqualTo("chooseMemoryMode");
        assertThat(state.nextAllowedActions()).doesNotContain("chooseMemoryMode", "startVerifiedRecall");
        assertThat(state.frontier())
                .extracting(goal -> goal.id())
                .doesNotContain(SEK1_CORE_FORMULAS_FLASHCARDS_ID);
        assertThat(state.stateMachine().goalOptions())
                .extracting(goal -> goal.id())
                .doesNotContain(SEK1_CORE_FORMULAS_FLASHCARDS_ID);
        assertThatThrownBy(() -> learnerService.setActiveGoal(learnerId, SEK1_CORE_FORMULAS_FLASHCARDS_ID))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("goalId must be an atomic goal from the current frontier");
    }

    @Test
    @Transactional
    void getLearnerState_doesNotOfferSeparateSekOneCapstoneAfterFinalCompositionYearScopeIsComplete() {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setPersonalCurriculum("""
                {
                  "a0e13c56-c25f-4742-9272-3a1a603ee52e": {"selected": true, "filterId": "ALL"},
                  "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced": {"selected": true, "filterId": "GK"},
                  "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a": {"selected": true, "filterId": "ALL"}
                }
                """);
        learnerRepository.save(learner);
        learnerService.setPlannedGoals(learnerId, Set.of(COMPOSITION_J10_SCOPE_ID));

        completeCurrentScope(200);

        var state = learnerService.getLearnerState(learnerId);

        assertThat(state.goals().scope_completed()).isTrue();
        assertThat(state.stateMachine().requiredAction()).isEqualTo("setScope");
        assertThat(state.stateMachine().goalOptions())
                .extracting(goal -> goal.id())
                .doesNotContain(REMOVED_SEK1_CAPSTONE_ID);
        assertThat(state.stateMachine().goalOptions())
                .extracting(goal -> goal.title())
                .doesNotContain("Sek-I-Abschlussaufgaben Mathematik");
    }

    private void completeCurrentScope() {
        completeCurrentScope(50);
    }

    private void completeCurrentScope(int maxIterations) {
        for (int iteration = 0; iteration < maxIterations; iteration += 1) {
            var state = learnerService.getLearnerState(learnerId);
            if (Boolean.TRUE.equals(state.goals().scope_completed())) {
                return;
            }
            var nextGoal = state.frontier().stream()
                    .filter(goal -> "atomic".equals(goal.type()))
                    .findFirst()
                    .orElseThrow(() -> new AssertionError("Expected an atomic frontier goal before scope completion."));
            learnerService.setMastery(
                    learnerId,
                    new MasteryUpdateRequest(Map.of(nextGoal.id(), 1.0), nextGoal.id()));
        }
        throw new AssertionError("Scope did not complete within " + maxIterations + " mastery updates.");
    }

    private static LearningGoal goal(String id, List<String> requires, List<String> contains) {
        LearningGoal g = new LearningGoal();
        g.setId(id);
        g.setRequires(requires == null ? List.of() : new ArrayList<>(requires));
        g.setContains(contains == null ? List.of() : new ArrayList<>(contains));
        return g;
    }
}
