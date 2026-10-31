package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.*;
import com.skillpilot.backend.completion.*;
import com.skillpilot.backend.domain.*;
import com.skillpilot.backend.repository.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.context.transaction.TestTransaction;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AssessmentCompletionIntegrationTest {
    static final String PROFILE = "math-dot-product-projection";
    static final String ROOT = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
    static final String MATH = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
    static final String PREPARATION = "3016ec37-1c2e-47db-83f5-e767923bc97e";
    static final String EXAM = "e98672c6-871a-5d0b-889c-5afc51040f0d";
    static final String UNRELATED = "1b67aeb4-2a55-531f-94da-283b4e3df5f1";
    @Autowired LearnerService learners;
    @Autowired LearnerRepository learnerRepository;
    @Autowired MasteryRepository masteryRepository;
    @Autowired PlannedGoalRepository focus;
    @Autowired ObjectMapper mapper;
    @Autowired com.skillpilot.backend.ui.LearnerUiController ui;
    @Autowired com.skillpilot.backend.ui.LearnerLearningPlanController planUi;
    @Autowired LearnerLearningPlanService learningPlans;
    Learner learner;
    Object originalApplication;

    @BeforeEach
    void setup() throws Exception {
        originalApplication = ReflectionTestUtils.getField(learners, "completionApplicationService");
        Path base = Path.of("../curricula/DE/Gymnasium");
        var profile = mapper.readValue(Files.readString(base.resolve("completion-profiles/" + PROFILE + ".json")),
                CompletionProfileDefinition.class);
        var scope = mapper.readValue(Files.readString(base.resolve("completion-scopes/" + PROFILE + ".json")),
                CompletionScopeDefinition.class);
        ReflectionTestUtils.setField(learners, "completionApplicationService", new CompletionApplicationService(
                new CompletionProfileCatalog(Map.of(PROFILE, profile), Map.of(PROFILE, scope), "test-generation")));
        learner = new Learner();
        learner.setSkillpilotId("completion-" + UUID.randomUUID());
        learner.setSelectedCurriculum(ROOT);
        Map<String, Object> config = new LinkedHashMap<>();
        config.put(ROOT, Map.of("selected", true, "filterId", "DE-HE", "stage", "CrossStage", "durationModel", "G9"));
        config.put("__skillpilot_stage_scope_sek1__", Map.of("selected", true));
        config.put("__skillpilot_stage_scope_sek2__", Map.of("selected", true));
        config.put(MATH, Map.of("selected", true, "filterId", "GK+LK"));
        config.put(CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY, Map.of(
                CurriculumPersonalizationPlanner.ROOT_LANDSCAPE_ID_KEY, ROOT,
                CurriculumPersonalizationPlanner.COMPLETED_OPTION_IDS_KEY, List.of(),
                CurriculumPersonalizationPlanner.MIGRATION_COMPLETED_KEY, true));
        learner.setPersonalCurriculum(mapper.writeValueAsString(config));
        learner.setAutoPilot(false);
        learner = learnerRepository.saveAndFlush(learner);
        focus.saveAndFlush(new PlannedGoal(learner, PREPARATION));
    }

    @AfterEach void restore() {
        ReflectionTestUtils.setField(learners, "completionApplicationService", originalApplication);
    }

    UnifiedLearnerStateResponse select() {
        return learners.chooseLevelCompletion(learner.getSkillpilotId(), new LevelCompletionActionRequest(
                "selectProfile", PROFILE, null, null, learner.getCoachStateRevision()));
    }

    private void nextRequestTransaction(boolean commit) {
        // Revision advancement is intentionally once per outer transaction.
        // Model separate client requests explicitly when asserting a new revision.
        String id = learner.getSkillpilotId();
        if (commit) TestTransaction.flagForCommit();
        else TestTransaction.flagForRollback();
        TestTransaction.end();
        TestTransaction.start();
        learner = learnerRepository.findById(id).orElseThrow();
    }

    @Test void discoveryPublishesOnlyAssessmentMetadataWithoutChangingOrdinaryLearning() throws Exception {
        learner.setActiveGoalId(PREPARATION);
        learner.setLearningState(LearningState.TEACHING);
        learner.setStrictMode(true);
        long before = learner.getCoachStateRevision();
        var state = learners.getLearnerState(learner.getSkillpilotId());
        assertThat(state.levelCompletion().profileId()).isNull();
        assertThat(state.levelCompletion().profileOptions()).singleElement().satisfies(option -> {
            assertThat(option.profileId()).isEqualTo(PROFILE);
            assertThat(option.assessments()).singleElement().satisfies(assessment -> {
                assertThat(assessment.goalId()).isEqualTo(EXAM);
                assertThat(assessment.startAvailable()).isTrue();
                assertThat(assessment.mastered()).isFalse();
            });
        });
        assertThat(mapper.writeValueAsString(state.levelCompletion())).doesNotContain(
                "taskContent", "solutionContent", "passingPoints", "evaluationCapability", "sessionBinding");
        learners.getLearnerState(learner.getSkillpilotId());
        assertThat(learner.getCoachStateRevision()).isEqualTo(before);
        assertThat(learner.getCompletionWorkflow()).isNull();
        assertThat(learner.getActiveGoalId()).isEqualTo(PREPARATION);
        assertThat(focus.findByLearner_SkillpilotId(learner.getSkillpilotId()))
                .extracting(PlannedGoal::getGoalId).containsExactly(PREPARATION);
        assertThat(masteryRepository.findByLearner_SkillpilotId(learner.getSkillpilotId())).isEmpty();
    }

    @Test void directEntrySelectsAndBindsItsSectionWithOneRevisionAndOneEvent() {
        learner.setActiveGoalId(PREPARATION);
        learner.setLearningState(LearningState.TEACHING);
        learner.setStrictMode(true);
        long before = learner.getCoachStateRevision();
        Object originalPublisher = ReflectionTestUtils.getField(learners, "eventPublisher");
        var publisher = org.mockito.Mockito.mock(org.springframework.context.ApplicationEventPublisher.class);
        ReflectionTestUtils.setField(learners, "eventPublisher", publisher);
        try {
            learners.startCompletionAssessment(learner.getSkillpilotId(),
                    new CompletionAssessmentStart(PROFILE, EXAM, before),
                    "claude", "direct-owner", Instant.now().plusSeconds(600));
            assertThat(learner.getCoachStateRevision()).isEqualTo(before + 1);
            var event = org.mockito.ArgumentCaptor.forClass(org.springframework.context.ApplicationEvent.class);
            org.mockito.Mockito.verify(publisher).publishEvent(event.capture());
            assertThat(event.getValue()).isInstanceOfSatisfying(com.skillpilot.backend.events.LearnerStateChangedEvent.class,
                    changed -> assertThat(changed.getChangeType()).isEqualTo("COMPLETION_ASSESSMENT_START"));
            org.mockito.Mockito.verifyNoMoreInteractions(publisher);
        } finally {
            ReflectionTestUtils.setField(learners, "eventPublisher", originalPublisher);
        }
        var current = learners.getLearnerState(learner.getSkillpilotId());
        assertThat(current.activeGoal().id()).isEqualTo(EXAM);
        assertThat(current.levelCompletion().profileId()).isEqualTo(PROFILE);
        assertThat(current.levelCompletion().directAssessmentRunning()).isTrue();
        assertThat(current.levelCompletion().profileOptions()).allSatisfy(option ->
                assertThat(option.assessments()).allSatisfy(assessment -> assertThat(assessment.startAvailable()).isFalse()));
        assertThat(learner.getStrictMode()).isTrue();
        assertThat(focus.findByLearner_SkillpilotId(learner.getSkillpilotId()))
                .extracting(PlannedGoal::getGoalId).containsExactly(PREPARATION);
        assertThat(masteryRepository.findByLearner_SkillpilotId(learner.getSkillpilotId())).isEmpty();
    }

    @Test void unsupportedCoachCanDiscoverButCannotExecuteAReviewedShortcut() {
        Instant expires = Instant.now().plusSeconds(600);
        var call = new CompletionCallContext("openai", "openai-session", expires, false);
        var preview = CompletionCallContext.with(call, () -> learners.getLearnerState(learner.getSkillpilotId()));
        assertThat(preview.levelCompletion().profileOptions().getFirst().assessments().getFirst().startAvailable()).isTrue();
        long before = learner.getCoachStateRevision();
        assertThatThrownBy(() -> CompletionCallContext.with(call, () -> {
            learners.startCompletionAssessment(learner.getSkillpilotId(),
                    new CompletionAssessmentStart(PROFILE, EXAM, before), "claude", "openai-session", expires);
            return null;
        })).isInstanceOf(ResponseStatusException.class);
        assertThat(learner.getCoachStateRevision()).isEqualTo(before);
        assertThat(learner.getCompletionWorkflow()).isNull();
        assertThat(learner.getActiveGoalId()).isNull();
    }

    @Test void newRouteRejectsStaleForgedExpiredAndOptedOutStartsWithoutMutation() {
        long before = learner.getCoachStateRevision();
        Instant expires = Instant.now().plusSeconds(600);
        for (var request : List.of(new CompletionAssessmentStart(PROFILE, EXAM, before + 1),
                new CompletionAssessmentStart("not-published", EXAM, before),
                new CompletionAssessmentStart(PROFILE, PREPARATION, before),
                new CompletionAssessmentStart(PROFILE, EXAM, before, true))) {
            assertThatThrownBy(() -> learners.startCompletionAssessment(learner.getSkillpilotId(), request,
                    "claude", "direct-owner", expires)).isInstanceOf(ResponseStatusException.class);
        }
        assertThatThrownBy(() -> learners.startCompletionAssessment(learner.getSkillpilotId(),
                new CompletionAssessmentStart(PROFILE, EXAM, before), "claude", "direct-owner", Instant.now().minusSeconds(1)))
                .isInstanceOf(ResponseStatusException.class);
        learner.setUseAssessmentShortcuts(false);
        assertThatThrownBy(() -> learners.startCompletionAssessment(learner.getSkillpilotId(),
                new CompletionAssessmentStart(PROFILE, EXAM, before), "claude", "direct-owner", expires))
                .isInstanceOf(ResponseStatusException.class);
        assertThat(learner.getCoachStateRevision()).isEqualTo(before);
        assertThat(learner.getCompletionWorkflow()).isNull();
        assertThat(learner.getActiveGoalId()).isNull();
        assertThat(masteryRepository.findByLearner_SkillpilotId(learner.getSkillpilotId())).isEmpty();
    }

    @Test void newRouteCannotReplaceAnInvalidWorkflowOrRestartAMasteredExam() {
        long before = learner.getCoachStateRevision();
        learner.setCompletionWorkflow("{broken");
        assertThatThrownBy(() -> learners.startCompletionAssessment(learner.getSkillpilotId(),
                new CompletionAssessmentStart(PROFILE, EXAM, before), "claude", "direct-owner", Instant.now().plusSeconds(600)))
                .isInstanceOf(ResponseStatusException.class);
        assertThat(learner.getCompletionWorkflow()).isEqualTo("{broken");
        learner.setCompletionWorkflow(null);
        masteryRepository.saveAndFlush(new Mastery(learner, EXAM, 1.0));
        var preview = learners.getLearnerState(learner.getSkillpilotId()).levelCompletion()
                .profileOptions().getFirst().assessments().getFirst();
        assertThat(preview.mastered()).isTrue();
        assertThat(preview.startAvailable()).isFalse();
        assertThatThrownBy(() -> learners.startCompletionAssessment(learner.getSkillpilotId(),
                new CompletionAssessmentStart(PROFILE, EXAM, before), "claude", "direct-owner", Instant.now().plusSeconds(600)))
                .isInstanceOf(ResponseStatusException.class);
        assertThat(learner.getCoachStateRevision()).isEqualTo(before);
        assertThat(learner.getCompletionWorkflow()).isNull();
    }

    @Test void unpreparedCatalogCannotBeWarmedOrEnteredThroughDiscovery() {
        var application = (CompletionApplicationService) ReflectionTestUtils.getField(learners, "completionApplicationService");
        application.sealPreparedContexts(Map.of());
        long before = learner.getCoachStateRevision();
        assertThat(learners.getLearnerState(learner.getSkillpilotId()).levelCompletion()).isNull();
        assertThatThrownBy(() -> learners.startCompletionAssessment(learner.getSkillpilotId(),
                new CompletionAssessmentStart(PROFILE, EXAM, before), "claude", "direct-owner", Instant.now().plusSeconds(600)))
                .isInstanceOf(ResponseStatusException.class);
        assertThat(learner.getCoachStateRevision()).isEqualTo(before);
        assertThat(learner.getCompletionWorkflow()).isNull();
    }

    @Test void directEntryStillRequiresCompletedPersonalization() throws Exception {
        var config = (com.fasterxml.jackson.databind.node.ObjectNode) mapper.readTree(learner.getPersonalCurriculum());
        ((com.fasterxml.jackson.databind.node.ObjectNode) config.get(CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY))
                .put(CurriculumPersonalizationPlanner.MIGRATION_COMPLETED_KEY, false);
        learner.setPersonalCurriculum(mapper.writeValueAsString(config));
        long before = learner.getCoachStateRevision();
        assertThat(learners.getPersonalizationPlan(learner.getSkillpilotId()).required()).isTrue();
        assertThatThrownBy(() -> learners.startCompletionAssessment(learner.getSkillpilotId(),
                new CompletionAssessmentStart(PROFILE, EXAM, before), "claude", "direct-owner", Instant.now().plusSeconds(600)))
                .isInstanceOf(ResponseStatusException.class);
        assertThat(learner.getCoachStateRevision()).isEqualTo(before);
        assertThat(learner.getCompletionWorkflow()).isNull();
        assertThat(learner.getActiveGoalId()).isNull();
    }

    @Test void failedDiscoveryMasteryReadPublishesUnavailableWithoutInventingAssessmentResults() {
        Object projection = ReflectionTestUtils.invokeMethod(learners, "getGoalProjection", ROOT, learner.getPersonalCurriculum());
        var unavailable = org.mockito.Mockito.mock(MasteryRepository.class);
        org.mockito.Mockito.when(unavailable.findByLearner_SkillpilotId(learner.getSkillpilotId()))
                .thenThrow(new IllegalStateException("synthetic result-store outage"));
        ReflectionTestUtils.setField(learners, "masteryRepository", unavailable);
        try {
            Object snapshot = ReflectionTestUtils.invokeMethod(learners, "completionSnapshot", learner, projection);
            var response = (LevelCompletionResponse) ReflectionTestUtils.getField(snapshot, "response");
            assertThat(response.calculationStatus()).isEqualTo("unavailable");
            assertThat(response.notice()).isEqualTo("completion_mastery_unavailable");
            assertThat(response.complete()).isNull();
            assertThat(response.profileOptions()).allSatisfy(option -> assertThat(option.assessments()).isEmpty());
            assertThatThrownBy(this::select).isInstanceOf(ResponseStatusException.class);
            org.mockito.Mockito.verify(unavailable, org.mockito.Mockito.times(2))
                    .findByLearner_SkillpilotId(learner.getSkillpilotId());
            org.mockito.Mockito.verifyNoMoreInteractions(unavailable);
            assertThat(learner.getCompletionWorkflow()).isNull();
        } finally {
            ReflectionTestUtils.setField(learners, "masteryRepository", masteryRepository);
        }
    }

    @Test void shortcutsDefaultOnAndAnOptOutGatesChoicesWithoutChangingOrdinaryMastery() {
        assertThat(learner.getUseAssessmentShortcuts()).isTrue();
        assertThat(learners.getLearnerState(learner.getSkillpilotId()).levelCompletion()).isNotNull();
        learners.setPreferences(learner.getSkillpilotId(), null, null, null, null, null, null, false);
        assertThat(learners.getLearnerState(learner.getSkillpilotId()).levelCompletion()).isNull();
        assertThatThrownBy(this::select).isInstanceOf(ResponseStatusException.class);
        learners.setPreferences(learner.getSkillpilotId(), null, false, null);
        assertThat(learner.getUseAssessmentShortcuts()).isFalse(); // Old clients omit the new choice.
        assertThat(masteryRepository.findByLearner_SkillpilotId(learner.getSkillpilotId())).isEmpty();
        learners.setPreferences(learner.getSkillpilotId(), null, null, null, null, null, null, true);
        assertThat(learner.getCompletionWorkflow()).isNull();
        assertThat(learners.getLearnerState(learner.getSkillpilotId()).levelCompletion().profileOptions())
                .extracting(LevelCompletionResponse.ProfileOption::profileId).contains(PROFILE);
    }

    @Test void disablingShortcutsEndsDirectAssessmentAndRejectsOldActionsAndGrading() {
        select();
        learner.setStrictMode(true);
        learner.setFollowLearningPlans(true);
        learners.startCompletionAssessment(learner.getSkillpilotId(),
                new CompletionAssessmentStart(PROFILE, EXAM, learner.getCoachStateRevision()),
                "claude", "owner-hash", Instant.now().plusSeconds(600));
        nextRequestTransaction(true);
        long previousRevision = learner.getCoachStateRevision();
        learners.setPreferences(learner.getSkillpilotId(), null, null, null, null, null, null, false);
        assertThat(learner.getCoachStateRevision()).isGreaterThan(previousRevision);
        assertThat(learner.getCompletionWorkflow()).isNull();
        assertThat(learner.getActiveGoalId()).isNull();
        assertThat(learner.getLearningState()).isEqualTo(LearningState.FRONTIER);
        assertThat(learner.getFollowLearningPlans()).isTrue();
        assertThat(learners.effectivePlanFollowing(learner)).isTrue();
        assertThat(learners.getLearnerState(learner.getSkillpilotId()).levelCompletion()).isNull();
        assertThatThrownBy(() -> learners.startCompletionAssessment(learner.getSkillpilotId(),
                new CompletionAssessmentStart(PROFILE, EXAM, previousRevision),
                "claude", "owner-hash", Instant.now().plusSeconds(600))).isInstanceOf(ResponseStatusException.class);
        assertThatThrownBy(() -> CompletionCallContext.with(new CompletionCallContext(
                "claude", "owner-hash", Instant.now().plusSeconds(600), true),
                () -> learners.setMastery(learner.getSkillpilotId(), new MasteryUpdateRequest(Map.of(EXAM, 1.0), EXAM))))
                .isInstanceOf(ResponseStatusException.class);
        assertThat(masteryRepository.findByLearner_SkillpilotId(learner.getSkillpilotId())).isEmpty();
        assertThat(focus.findByLearner_SkillpilotId(learner.getSkillpilotId())).extracting(PlannedGoal::getGoalId)
                .containsExactly(PREPARATION);
    }

    @Test void aPassCommittedBeforeDisablingKeepsItsSingleBinaryResult() {
        select();
        learners.startCompletionAssessment(learner.getSkillpilotId(),
                new CompletionAssessmentStart(PROFILE, EXAM, learner.getCoachStateRevision()),
                "claude", "owner-hash", Instant.now().plusSeconds(600));
        CompletionCallContext.with(new CompletionCallContext("claude", "owner-hash", Instant.now().plusSeconds(600), true),
                () -> learners.setMastery(learner.getSkillpilotId(), new MasteryUpdateRequest(Map.of(EXAM, 1.0), EXAM)));
        nextRequestTransaction(true);
        learners.setPreferences(learner.getSkillpilotId(), null, null, null, null, null, null, false);
        assertThat(masteryRepository.findByLearner_SkillpilotId(learner.getSkillpilotId())).singleElement()
                .satisfies(m -> { assertThat(m.getGoalKey()).isEqualTo(EXAM); assertThat(m.getValue()).isEqualTo(1); });
        assertThat(learners.getLearnerState(learner.getSkillpilotId()).levelCompletion()).isNull();
    }

    @Test void disabledShortcutsStillAllowAnOrdinaryPrerequisiteSatisfiedExam() {
        learners.setPreferences(learner.getSkillpilotId(), null, false, false, null, null, null, false);
        learners.setPlannedGoals(learner.getSkillpilotId(), Set.of(PREPARATION, EXAM));
        masteryRepository.saveAndFlush(new Mastery(learner, PREPARATION, 1.0));
        assertThat(learners.getFrontier(learner.getSkillpilotId())).contains(EXAM);
        learners.setActiveGoal(learner.getSkillpilotId(), EXAM);
        learners.setMastery(learner.getSkillpilotId(), new MasteryUpdateRequest(Map.of(EXAM, 1.0), EXAM));
        assertThat(masteryRepository.findByLearner_SkillpilotId(learner.getSkillpilotId()))
                .extracting(Mastery::getGoalKey).containsExactlyInAnyOrder(PREPARATION, EXAM);
        assertThat(learner.getUseAssessmentShortcuts()).isFalse();
        assertThat(learner.getCompletionWorkflow()).isNull();
    }

    @Test void shortcutPreferenceHttpRoundTripPreservesAnOmittedChoice() throws Exception {
        var mvc = org.springframework.test.web.servlet.setup.MockMvcBuilders.standaloneSetup(ui)
                .setMessageConverters(new org.springframework.http.converter.json.MappingJackson2HttpMessageConverter(mapper)).build();
        for (String payload : List.of("{\"useAssessmentShortcuts\":false}", "{\"autoPilot\":false}")) {
            mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put(
                    "/api/ui/learners/{id}/preferences", learner.getSkillpilotId())
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON).content(payload))
                    .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isOk());
            mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get(
                    "/api/ui/learners/{id}", learner.getSkillpilotId()))
                    .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isOk())
                    .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.useAssessmentShortcuts").value(false));
            assertThat(learners.getLearnerState(learner.getSkillpilotId()).levelCompletion()).isNull();
        }
        assertThat(masteryRepository.findByLearner_SkillpilotId(learner.getSkillpilotId())).isEmpty();
    }

    @Test void coachCannotChangeTheCockpitShortcutPreference() {
        assertThatThrownBy(() -> CompletionCallContext.with(new CompletionCallContext(
                "claude", "owner-hash", Instant.now().plusSeconds(600), true), () -> {
                    learners.setPreferences(learner.getSkillpilotId(), null, null, null, null, null, null, false);
                    return null;
                })).isInstanceOf(ResponseStatusException.class).hasMessageContaining("403");
        assertThat(learner.getUseAssessmentShortcuts()).isTrue();
    }

    @Test void planCountingPreferenceHttpRoundTripPreservesDirectAssessmentAndOmittedChoice() throws Exception {
        assertThat(learner.getLearningPlanCountOnlyExplicitGoals()).isFalse();
        select();
        learners.startCompletionAssessment(learner.getSkillpilotId(),
                new CompletionAssessmentStart(PROFILE, EXAM, learner.getCoachStateRevision()),
                "claude", "owner-hash", Instant.now().plusSeconds(600));
        nextRequestTransaction(true);
        String workflow = learner.getCompletionWorkflow();
        long revision = learner.getCoachStateRevision();
        var mvc = org.springframework.test.web.servlet.setup.MockMvcBuilders.standaloneSetup(ui)
                .setMessageConverters(new org.springframework.http.converter.json.MappingJackson2HttpMessageConverter(mapper)).build();
        for (String payload : List.of("{\"learningPlanCountOnlyExplicitGoals\":true}", "{\"autoPilot\":false}")) {
            mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put(
                    "/api/ui/learners/{id}/preferences", learner.getSkillpilotId())
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON).content(payload))
                    .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isOk());
            mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get(
                    "/api/ui/learners/{id}", learner.getSkillpilotId()))
                    .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isOk())
                    .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath(
                            "$.learningPlanCountOnlyExplicitGoals").value(true));
            assertThat(learner.getCompletionWorkflow()).isEqualTo(workflow);
            assertThat(learner.getActiveGoalId()).isEqualTo(EXAM);
            assertThat(learner.getUseAssessmentShortcuts()).isTrue();
        }
        assertThat(learner.getCoachStateRevision()).isEqualTo(revision + 1);
        learners.setPreferences(learner.getSkillpilotId(), null, null, null, null, null, null, null, false);
        assertThat(learner.getLearningPlanCountOnlyExplicitGoals()).isFalse();
        assertThat(learner.getCompletionWorkflow()).isEqualTo(workflow);
        assertThat(masteryRepository.findByLearner_SkillpilotId(learner.getSkillpilotId())).isEmpty();
    }

    @Test void coachCannotChangeTheCockpitPlanCountingPreference() {
        assertThatThrownBy(() -> CompletionCallContext.with(new CompletionCallContext(
                "claude", "owner-hash", Instant.now().plusSeconds(600), true), () -> {
                    learners.setPreferences(learner.getSkillpilotId(), null, null, null, null, null, null, null, true);
                    return null;
                })).isInstanceOf(ResponseStatusException.class).hasMessageContaining("403");
        assertThat(learner.getLearningPlanCountOnlyExplicitGoals()).isFalse();
    }

    @Test void planCompletionInputsDoNotRequireAnActiveRouteOrEnabledShortcutStarts() {
        learners.setPreferences(learner.getSkillpilotId(), null, null, null, null, null, null, false);
        var context = learners.getLearningPlanCompletionContext(learner.getSkillpilotId(), Set.of(PREPARATION));
        assertThat(context.reviewedProfiles()).extracting(p -> p.definition().id()).containsExactly(PROFILE);
        // A grant in the prerequisite closure must remain discoverable, even when
        // its target is not directly scheduled in the plan's captured goal set.
        assertThat(learners.getLearningPlanCompletionContext(learner.getSkillpilotId(), Set.of(EXAM))
                .reviewedProfiles()).extracting(p -> p.definition().id()).containsExactly(PROFILE);
        assertThat(learner.getCompletionWorkflow()).isNull();
        assertThat(learner.getUseAssessmentShortcuts()).isFalse();
        assertThat(masteryRepository.findByLearner_SkillpilotId(learner.getSkillpilotId())).isEmpty();
    }

    @Test void realReviewedAssessmentCreditsTheHttpPlanAndPreferenceChangesOnlyCounting() throws Exception {
        var today = java.time.LocalDate.now(java.time.ZoneId.of("Europe/Berlin"));
        var monday = today.with(java.time.temporal.TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));
        var block = new LearnerLearningPlanApi.Block("pilot", "learning", null, "Prüfungsabschnitt",
                monday, monday.plusDays(4), null, List.of(PREPARATION, EXAM), List.of(PREPARATION, EXAM), true);
        var mvc = org.springframework.test.web.servlet.setup.MockMvcBuilders.standaloneSetup(ui, planUi)
                .setMessageConverters(new org.springframework.http.converter.json.MappingJackson2HttpMessageConverter(mapper)).build();
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put(
                "/api/ui/learners/{id}/learning-plans/by-landscape", learner.getSkillpilotId())
                .queryParam("landscapeId", MATH).queryParam("asOf", today.toString())
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(new LearnerLearningPlanApi.UpsertRequest(0L,
                        "Prüfungsabschnitt", List.of(block)))))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isOk());
        var baseline = learningPlans.getPlan(learner.getSkillpilotId(), MATH, today).blocks();
        assertThat(baseline.getFirst().atomicGoalIds()).containsExactlyInAnyOrder(PREPARATION, EXAM);

        select();
        learners.startCompletionAssessment(learner.getSkillpilotId(),
                new CompletionAssessmentStart(PROFILE, EXAM, learner.getCoachStateRevision()),
                "claude", "owner-hash", Instant.now().plusSeconds(600));
        CompletionCallContext.with(new CompletionCallContext("claude", "owner-hash", Instant.now().plusSeconds(600), true),
                () -> learners.setMastery(learner.getSkillpilotId(), new MasteryUpdateRequest(Map.of(EXAM, 1.0), EXAM)));
        // Ending the route and disabling new shortcut starts must not remove valid credit.
        learners.setPreferences(learner.getSkillpilotId(), null, null, null, null, null, null, false);
        assertThat(learner.getCompletionWorkflow()).isNull();
        var events = learners.getGoalCompletionsBetween(learner.getSkillpilotId(), monday, monday.plusDays(6));
        assertThat(events).containsOnlyKeys(EXAM);
        var defaultStatus = learningPlans.getTodayStatus(learner.getSkillpilotId(), "de");
        assertThat(defaultStatus.subjects()).singleElement().satisfies(subject -> {
            assertThat(subject.balance().rohsaldo()).isZero();
            assertThat(subject.periodGauge().target()).isEqualTo(2);
            assertThat(subject.periodGauge().completed()).isEqualTo(2);
        });
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get(
                "/api/ui/learners/{id}/learning-plans/status", learner.getSkillpilotId()).queryParam("language", "de"))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isOk())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.subjects[0].periodGauge.completed").value(2))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.subjects[0].planCreditText").isNotEmpty());
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put(
                "/api/ui/learners/{id}/preferences", learner.getSkillpilotId())
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .content("{\"learningPlanCountOnlyExplicitGoals\":true}"))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isOk());
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get(
                "/api/ui/learners/{id}/learning-plans/status", learner.getSkillpilotId()).queryParam("language", "de"))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isOk())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.subjects[0].periodGauge.completed").value(1))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.subjects[0].periodGauge.target").value(2))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.subjects[0].planCreditText").doesNotExist());
        assertThat(learningPlans.getTodayStatus(learner.getSkillpilotId(), "de").subjects().getFirst().balance().rohsaldo()).isEqualTo(-1);
        assertThat(learningPlans.getPlan(learner.getSkillpilotId(), MATH, today).blocks()).isEqualTo(baseline);
        assertThat(learners.getGoalCompletionsBetween(learner.getSkillpilotId(), monday, monday.plusDays(6))).isEqualTo(events);
        assertThat(masteryRepository.findByLearner_SkillpilotId(learner.getSkillpilotId())).singleElement()
                .satisfies(result -> assertThat(result.getGoalKey()).isEqualTo(EXAM));
    }

    @Test void unrelatedPlanDoesNotDependOnUnavailableCompletionRules() {
        var application = (CompletionApplicationService) ReflectionTestUtils.getField(learners, "completionApplicationService");
        ReflectionTestUtils.setField(application.catalog(), "available", false);
        assertThat(learners.getLearningPlanCompletionContext(learner.getSkillpilotId(), Set.of(UNRELATED))).isNull();
        assertThatThrownBy(() -> learners.getLearningPlanCompletionContext(learner.getSkillpilotId(), Set.of(PREPARATION)))
                .isInstanceOf(IllegalStateException.class).hasMessageContaining("unavailable");
    }

    @Test void baseWithoutTheCompleteReviewedScopeDoesNotRequireAPreparedContext() {
        var application = (CompletionApplicationService) ReflectionTestUtils.getField(learners, "completionApplicationService");
        var originalScope = application.catalog().scope(PROFILE);
        var foreignScope = new CompletionScopeDefinition(originalScope.schemaVersion(), originalScope.id(),
                originalScope.revision(), originalScope.title(), List.of(PREPARATION, "foreign-assessment"));
        var otherApplication = new CompletionApplicationService(new CompletionProfileCatalog(
                application.catalog().profiles(), Map.of(PROFILE, foreignScope), "other-base"));
        ReflectionTestUtils.setField(otherApplication, "preparedContexts", Map.of());
        ReflectionTestUtils.setField(learners, "completionApplicationService", otherApplication);
        assertThat(learners.getLearningPlanCompletionContext(learner.getSkillpilotId(), Set.of(PREPARATION))).isNull();

        // Missing prepared inputs for a genuinely applicable scope are a real failure.
        ReflectionTestUtils.setField(application, "preparedContexts", Map.of());
        ReflectionTestUtils.setField(learners, "completionApplicationService", application);
        assertThatThrownBy(() -> learners.getLearningPlanCompletionContext(learner.getSkillpilotId(), Set.of(PREPARATION)))
                .isInstanceOf(CompletionApplicationService.PreparedContextUnavailableException.class);
    }

    @Test void existingAssessmentMasteryCompletesOnlyThisScopeWithoutCreatingPreparationMastery() {
        masteryRepository.saveAndFlush(new Mastery(learner, EXAM, 1.0));
        var state = select();
        assertThat(state.levelCompletion().calculationStatus()).isEqualTo("valid");
        assertThat(state.levelCompletion().complete()).isTrue();
        assertThat(state.levelCompletion().targetCount()).isEqualTo(2);
        assertThat(state.levelCompletion().masteredTargetCount()).isEqualTo(1);
        assertThat(state.levelCompletion().waivedTargetCount()).isEqualTo(1);
        assertThat(state.goals().scope_completed()).isFalse();
        assertThat(masteryRepository.findByLearner_SkillpilotId(learner.getSkillpilotId()))
                .extracting(Mastery::getGoalKey).containsExactly(EXAM);
        assertThat(learners.getFrontier(learner.getSkillpilotId())).contains(PREPARATION);
    }

    @Test void strictDirectAssessmentSurvivesCockpitRefreshAndRejectsForeignSession() {
        select();
        learner.setStrictMode(true);
        long version = learner.getCoachStateRevision();
        learners.startCompletionAssessment(learner.getSkillpilotId(),
                new CompletionAssessmentStart(PROFILE, EXAM, version), "claude", "owner-hash", Instant.now().plusSeconds(600));
        long startedVersion = learner.getCoachStateRevision();
        assertThat(learners.getLearnerState(learner.getSkillpilotId()).activeGoal().id()).isEqualTo(EXAM);
        assertThat(learner.getCoachStateRevision()).isEqualTo(startedVersion);
        assertThat(learner.getStrictMode()).isTrue();
        assertThat(focus.findByLearner_SkillpilotId(learner.getSkillpilotId()))
                .extracting(PlannedGoal::getGoalId).containsExactly(PREPARATION);
        assertThatThrownBy(() -> CompletionCallContext.with(new CompletionCallContext(
                "claude", "foreign-hash", Instant.now().plusSeconds(600), true),
                () -> learners.setMastery(learner.getSkillpilotId(), new MasteryUpdateRequest(Map.of(EXAM, 1.0), EXAM))))
                .isInstanceOf(ResponseStatusException.class);
        assertThat(masteryRepository.findByLearner_SkillpilotId(learner.getSkillpilotId())).isEmpty();
    }

    @Test void successfulWriteStopsDirectContextAndAutopilotDoesNotResumeWaivedPreparation() {
        select();
        learners.startCompletionAssessment(learner.getSkillpilotId(),
                new CompletionAssessmentStart(PROFILE, EXAM, learner.getCoachStateRevision()),
                "claude", "owner-hash", Instant.now().plusSeconds(600));
        learner.setAutoPilot(true);
        MasteryUpdateResponse written = CompletionCallContext.with(new CompletionCallContext("claude", "owner-hash", Instant.now().plusSeconds(600), true),
                () -> learners.setMastery(learner.getSkillpilotId(), new MasteryUpdateRequest(Map.of(EXAM, 1.0), EXAM)));
        assertThat(written.levelCompletion()).isNotNull();
        assertThat(written.levelCompletion().complete()).isTrue();
        var state = learners.getLearnerState(learner.getSkillpilotId());
        assertThat(state.levelCompletion().complete()).isTrue();
        assertThat(state.activeGoal()).isNull();
        assertThat(state.levelCompletion().directAssessmentRunning()).isFalse();
        assertThat(state.stateMachine().goalOptions()).isEmpty();
        assertThat(masteryRepository.findByLearner_SkillpilotId(learner.getSkillpilotId()))
                .extracting(Mastery::getGoalKey).containsExactly(EXAM);
    }

    @Test void staleChoicesDoNotMutateAndPlanPreferenceIsPreserved() {
        var meters = new io.micrometer.core.instrument.simple.SimpleMeterRegistry();
        var existing = (CompletionApplicationService) ReflectionTestUtils.getField(learners, "completionApplicationService");
        ReflectionTestUtils.setField(learners, "completionApplicationService", new CompletionApplicationService(
                existing.catalog(), new CompletionTelemetry(meters)));
        var conflicts = meters.get("skillpilot.completion.revision.conflicts").tag("source", "ui").counter();
        learner.setFollowLearningPlans(true);
        select();
        assertThat(learners.effectivePlanFollowing(learner)).isFalse();
        assertThat(learner.getFollowLearningPlans()).isTrue();
        String workflow = learner.getCompletionWorkflow();
        assertThatThrownBy(() -> learners.chooseLevelCompletion(learner.getSkillpilotId(),
                new LevelCompletionActionRequest("leaveProfile", null, null, null, learner.getCoachStateRevision() - 1)))
                .isInstanceOf(ResponseStatusException.class);
        assertThat(learner.getCompletionWorkflow()).isEqualTo(workflow);
        assertThat(conflicts.count()).isEqualTo(1);
        assertThatThrownBy(() -> learners.chooseLevelCompletion(learner.getSkillpilotId(),
                new LevelCompletionActionRequest("leaveProfile", null, null, null, null)))
                .isInstanceOf(ResponseStatusException.class);
        assertThatThrownBy(() -> learners.chooseLevelCompletion(learner.getSkillpilotId(),
                new LevelCompletionActionRequest("endAssessment", null, null, null, learner.getCoachStateRevision())))
                .isInstanceOf(ResponseStatusException.class);
        assertThat(conflicts.count()).isEqualTo(1); // Missing input and another 409 are not stale revisions.
        assertThatThrownBy(() -> learners.startCompletionAssessment(learner.getSkillpilotId(),
                new CompletionAssessmentStart(PROFILE, EXAM, learner.getCoachStateRevision() - 1),
                "claude", "unused-owner", Instant.now().plusSeconds(600)))
                .isInstanceOf(ResponseStatusException.class);
        assertThat(conflicts.count()).isEqualTo(2);
        assertThat(learner.getCompletionWorkflow()).isEqualTo(workflow);
        assertThat(masteryRepository.findByLearner_SkillpilotId(learner.getSkillpilotId())).isEmpty();
        learners.chooseLevelCompletion(learner.getSkillpilotId(),
                new LevelCompletionActionRequest("leaveProfile", null, null, null, learner.getCoachStateRevision()));
        assertThat(learners.effectivePlanFollowing(learner)).isTrue();
        assertThat(conflicts.count()).isEqualTo(2);
    }

    @org.junit.jupiter.params.ParameterizedTest
    @org.junit.jupiter.params.provider.ValueSource(booleans = {false, true})
    void pauseBeforeOrAfterCompletionKeepsTheProfileAndNeedsFreshDeliberateWorkToResume(boolean completed) throws Exception {
        learner.setAutoPilot(true);
        learner.setFollowLearningPlans(true);
        if (completed) masteryRepository.saveAndFlush(new Mastery(learner, EXAM, 1.0));
        var selected = select();
        nextRequestTransaction(true);
        String intent = completed ? "voluntary" : "required";
        var work = selected.levelCompletion().actions().stream()
                .filter(action -> "learnGoal".equals(action.action()) && PREPARATION.equals(action.goalId())
                        && intent.equals(action.intent())).findFirst().orElseThrow();
        learners.chooseLevelCompletion(learner.getSkillpilotId(), new LevelCompletionActionRequest(
                work.action(), PROFILE, work.goalId(), work.intent(), learner.getCoachStateRevision()));
        nextRequestTransaction(true);
        var working = learners.getLearnerState(learner.getSkillpilotId());
        assertThat(working.activeGoal().id()).isEqualTo(PREPARATION);
        assertThat(working.levelCompletion().actions()).anyMatch(action -> "pauseProfile".equals(action.action()));
        if (completed) assertThat(working.levelCompletion().actions()).noneMatch(action ->
                "includeSupport".equals(action.action()) || "includeTarget".equals(action.action())
                        || ("learnGoal".equals(action.action()) && "required".equals(action.intent())));
        var binding = mapper.readValue(learner.getCompletionWorkflow(), CompletionWorkflowState.class);
        long pauseRevision = learner.getCoachStateRevision();
        learners.chooseLevelCompletion(learner.getSkillpilotId(), new LevelCompletionActionRequest(
                "pauseProfile", PROFILE, null, null, pauseRevision));
        nextRequestTransaction(true);
        var paused = learners.getLearnerState(learner.getSkillpilotId());
        assertThat(paused.levelCompletion().profileId()).isEqualTo(PROFILE);
        assertThat(paused.levelCompletion().navigationIntent()).isEqualTo("paused");
        assertThat(paused.levelCompletion().complete()).isEqualTo(completed);
        assertThat(paused.activeGoal()).isNull();
        assertThat(paused.frontier()).isEmpty();
        assertThat(paused.stateMachine().goalOptions()).isEmpty();
        assertThat(paused.levelCompletion().actions()).noneMatch(action -> "pauseProfile".equals(action.action()));
        var preserved = mapper.readValue(learner.getCompletionWorkflow(), CompletionWorkflowState.class);
        assertThat(preserved.profileRevision()).isEqualTo(binding.profileRevision());
        assertThat(preserved.curriculumGeneration()).isEqualTo(binding.curriculumGeneration());
        assertThat(preserved.currentGoalId()).isNull();
        assertThat(preserved.directAssessment()).isNull();
        assertThat(learner.getFollowLearningPlans()).isTrue();
        assertThat(learners.effectivePlanFollowing(learner)).isFalse();
        assertThat(focus.findByLearner_SkillpilotId(learner.getSkillpilotId()))
                .extracting(PlannedGoal::getGoalId).containsExactly(PREPARATION);
        assertThat(masteryRepository.findByLearner_SkillpilotId(learner.getSkillpilotId()))
                .extracting(Mastery::getGoalKey).containsExactlyElementsOf(completed ? List.of(EXAM) : List.of());
        String pausedWorkflow = learner.getCompletionWorkflow();
        assertThatThrownBy(() -> learners.chooseLevelCompletion(learner.getSkillpilotId(),
                new LevelCompletionActionRequest("pauseProfile", PROFILE, null, null, pauseRevision)))
                .isInstanceOf(ResponseStatusException.class);
        assertThat(learner.getCompletionWorkflow()).isEqualTo(pausedWorkflow);
        nextRequestTransaction(false);
        var fresh = learners.getCoachLearnerState(learner.getSkillpilotId()).levelCompletion().actions().stream()
                .filter(action -> "learnGoal".equals(action.action()) && PREPARATION.equals(action.goalId())
                        && intent.equals(action.intent())).findFirst().orElseThrow();
        learners.chooseLevelCompletion(learner.getSkillpilotId(), new LevelCompletionActionRequest(
                fresh.action(), PROFILE, fresh.goalId(), fresh.intent(), learner.getCoachStateRevision()));
        nextRequestTransaction(true);
        var resumed = learners.getCoachLearnerState(learner.getSkillpilotId());
        assertThat(resumed.activeGoal().id()).isEqualTo(PREPARATION);
        assertThat(resumed.levelCompletion().navigationIntent()).isEqualTo(intent);
        assertThat(masteryRepository.findByLearner_SkillpilotId(learner.getSkillpilotId()))
                .extracting(Mastery::getGoalKey).containsExactlyElementsOf(completed ? List.of(EXAM) : List.of());
    }

    @Test void directAssessmentCanOnlyRestartThroughAnExplicitFreshChoice() {
        select();
        learners.startCompletionAssessment(learner.getSkillpilotId(),
                new CompletionAssessmentStart(PROFILE, EXAM, learner.getCoachStateRevision()),
                "claude", "owner-hash", Instant.now().plusSeconds(600));
        nextRequestTransaction(true);
        long started = learner.getCoachStateRevision();
        var running = learners.getLearnerState(learner.getSkillpilotId());
        assertThat(running.levelCompletion().actions()).anyMatch(a -> "retryAssessment".equals(a.action()));
        assertThat(running.levelCompletion().actions()).anyMatch(a -> "learnGoal".equals(a.action()) && PREPARATION.equals(a.goalId()));
        assertThatThrownBy(() -> learners.startCompletionAssessment(learner.getSkillpilotId(),
                new CompletionAssessmentStart(PROFILE, EXAM, started),
                "claude", "another-hash", Instant.now().plusSeconds(600)))
                .isInstanceOf(ResponseStatusException.class);
        assertThat(learner.getCoachStateRevision()).isEqualTo(started);
        nextRequestTransaction(false);
        learners.startCompletionAssessment(learner.getSkillpilotId(),
                new CompletionAssessmentStart(PROFILE, EXAM, started, true),
                "claude", "fresh-hash", Instant.now().plusSeconds(600));
        assertThat(learner.getCoachStateRevision()).isEqualTo(started + 1);
        assertThat(learner.getCompletionWorkflow()).contains("fresh-hash").doesNotContain("owner-hash");
        assertThat(masteryRepository.findByLearner_SkillpilotId(learner.getSkillpilotId())).isEmpty();
    }

    @Test void choosingPublishedSupportEndsTheDirectExceptionWithoutWritingAnExamResult() throws Exception {
        select();
        learners.startCompletionAssessment(learner.getSkillpilotId(),
                new CompletionAssessmentStart(PROFILE, EXAM, learner.getCoachStateRevision()),
                "claude", "owner-hash", Instant.now().plusSeconds(600));
        var running = learners.getLearnerState(learner.getSkillpilotId());
        var support = running.levelCompletion().actions().stream()
                .filter(a -> "learnGoal".equals(a.action()) && PREPARATION.equals(a.goalId())).findFirst().orElseThrow();
        var switched = learners.chooseLevelCompletion(learner.getSkillpilotId(), new LevelCompletionActionRequest(
                support.action(), PROFILE, support.goalId(), support.intent(), learner.getCoachStateRevision()));
        assertThat(switched.activeGoal().id()).isEqualTo(PREPARATION);
        assertThat(switched.levelCompletion().directAssessmentRunning()).isFalse();
        assertThat(mapper.readValue(learner.getCompletionWorkflow(), CompletionWorkflowState.class).directAssessment()).isNull();
        assertThat(masteryRepository.findByLearner_SkillpilotId(learner.getSkillpilotId())).isEmpty();
    }

    @Test void unofferedEndAndProfileChangeCannotMutateNavigation() {
        select();
        long version = learner.getCoachStateRevision();
        String workflow = learner.getCompletionWorkflow();
        assertThatThrownBy(() -> learners.chooseLevelCompletion(learner.getSkillpilotId(),
                new LevelCompletionActionRequest("endAssessment", null, null, null, version)))
                .isInstanceOf(ResponseStatusException.class);
        assertThatThrownBy(() -> learners.chooseLevelCompletion(learner.getSkillpilotId(),
                new LevelCompletionActionRequest("selectProfile", PROFILE, null, null, version)))
                .isInstanceOf(ResponseStatusException.class);
        assertThat(learner.getCompletionWorkflow()).isEqualTo(workflow);
        assertThat(learner.getCoachStateRevision()).isEqualTo(version);
    }

    @Test void oldCoachContractIsPausedAndPrivateStateCannotLeakIntoSignedExport() throws Exception {
        select();
        var state = CompletionCallContext.with(new CompletionCallContext("claude", "old", Instant.now().plusSeconds(60), false),
                () -> learners.getCoachLearnerState(learner.getSkillpilotId()));
        assertThat(state.levelCompletion().notice()).isEqualTo("completion_coach_contract_unsupported");
        assertThat(state.stateMachine().goalOptions()).isEmpty();
        String exported = mapper.writeValueAsString(learners.exportLearner(learner.getSkillpilotId()));
        assertThat(exported).doesNotContain("completionWorkflow", "test-generation", "owner-hash");
    }

    @Test void foreignSupportedSessionCannotTeachRenderOrEndTheRunningAssessment() {
        select();
        learners.startCompletionAssessment(learner.getSkillpilotId(),
                new CompletionAssessmentStart(PROFILE, EXAM, learner.getCoachStateRevision()),
                "claude", "owner-hash", Instant.now().plusSeconds(600));
        long version = learner.getCoachStateRevision();
        CompletionCallContext foreign = new CompletionCallContext("claude", "foreign-hash", Instant.now().plusSeconds(600), true);
        var projected = CompletionCallContext.with(foreign,
                () -> learners.getCoachLearnerState(learner.getSkillpilotId()));
        assertThat(projected.activeGoal()).isNull();
        assertThat(projected.stateMachine().activeGoal()).isNull();
        assertThat(projected.frontier()).isEmpty();
        assertThat(projected.nextAllowedActions()).isEmpty();
        assertThat(projected.levelCompletion().actions()).isEmpty();
        assertThat(projected.levelCompletion().notice()).isEqualTo("completion_assessment_owned_elsewhere");
        assertThatThrownBy(() -> CompletionCallContext.with(foreign,
                () -> learners.chooseLevelCompletion(learner.getSkillpilotId(),
                        new LevelCompletionActionRequest("leaveProfile", null, null, null, version))))
                .isInstanceOf(ResponseStatusException.class);
        assertThat(learner.getActiveGoalId()).isEqualTo(EXAM);
        assertThat(learner.getCoachStateRevision()).isEqualTo(version);
    }

    @Test void expiredDirectAssessmentCannotTurnIntoAnOrdinaryExamInsideTheFocus() throws Exception {
        focus.deleteByLearner_SkillpilotId(learner.getSkillpilotId());
        focus.saveAndFlush(new PlannedGoal(learner, EXAM));
        select();
        learners.startCompletionAssessment(learner.getSkillpilotId(),
                new CompletionAssessmentStart(PROFILE, EXAM, learner.getCoachStateRevision()),
                "claude", "owner-hash", Instant.now().plusSeconds(600));
        var workflow = mapper.readValue(learner.getCompletionWorkflow(), CompletionWorkflowState.class);
        learner.setCompletionWorkflow(mapper.writeValueAsString(workflow.withDirectAssessment(
                new CompletionWorkflowState.DirectAssessmentContext("claude", "owner-hash", EXAM, Instant.EPOCH))));
        nextRequestTransaction(true);
        long version = learner.getCoachStateRevision();
        var readOnly = learners.getCoachLearnerState(learner.getSkillpilotId());
        assertThat(readOnly.activeGoal()).isNull();
        assertThat(learner.getActiveGoalId()).isEqualTo(EXAM);
        assertThat(learner.getCoachStateRevision()).isEqualTo(version);
        learner.setAutoPilot(true);
        var reconciled = learners.getLearnerState(learner.getSkillpilotId());
        assertThat(reconciled.activeGoal()).isNull();
        assertThat(reconciled.levelCompletion().navigationIntent()).isEqualTo("paused");
        assertThat(reconciled.levelCompletion().directAssessmentRunning()).isFalse();
        long cleanedVersion = learner.getCoachStateRevision();
        assertThat(cleanedVersion).isGreaterThan(version);
        learners.getLearnerState(learner.getSkillpilotId());
        assertThat(learner.getCoachStateRevision()).isEqualTo(cleanedVersion);
        assertThat(masteryRepository.findByLearner_SkillpilotId(learner.getSkillpilotId())).isEmpty();
    }

    @Test void supportingPrerequisitesNeverBecomeAutomaticTargetRecommendations() {
        focus.deleteByLearner_SkillpilotId(learner.getSkillpilotId());
        focus.saveAndFlush(new PlannedGoal(learner, "c01b1ce9-a667-4a46-b251-ec33ae602b15"));
        learner.setAutoPilot(true);
        var state = select();
        if (state.activeGoal() != null) assertThat(state.activeGoal().id()).isIn(PREPARATION, EXAM);
        assertThat(state.stateMachine().goalOptions()).extracting(FrontierGoal::id)
                .allSatisfy(id -> assertThat(id).isIn(PREPARATION, EXAM));
        assertThat(state.levelCompletion().targetCount()).isEqualTo(2);
        assertThat(masteryRepository.findByLearner_SkillpilotId(learner.getSkillpilotId())).isEmpty();
    }

    @Test void explicitFocusAdditionPreservesIndependentRootsAndTheCompletionScope() {
        focus.deleteByLearner_SkillpilotId(learner.getSkillpilotId());
        String independent = "8dd9f210-2683-5902-acab-e3be22725232";
        focus.saveAndFlush(new PlannedGoal(learner, independent));
        focus.saveAndFlush(new PlannedGoal(learner, EXAM));
        var selected = select();
        assertThat(focus.findByLearner_SkillpilotId(learner.getSkillpilotId()))
                .extracting(PlannedGoal::getGoalId).containsExactlyInAnyOrder(independent, EXAM);
        var choice = selected.levelCompletion().actions().stream()
                .filter(a -> "includeTarget".equals(a.action()) && PREPARATION.equals(a.goalId())).findFirst().orElseThrow();
        var expanded = learners.chooseLevelCompletion(learner.getSkillpilotId(), new LevelCompletionActionRequest(
                choice.action(), PROFILE, choice.goalId(), null, learner.getCoachStateRevision()));
        assertThat(focus.findByLearner_SkillpilotId(learner.getSkillpilotId()))
                .extracting(PlannedGoal::getGoalId).containsExactlyInAnyOrder(independent, EXAM, PREPARATION);
        assertThat(expanded.levelCompletion().profileId()).isEqualTo(PROFILE);
        assertThat(expanded.levelCompletion().targetCount()).isEqualTo(2);
        assertThat(masteryRepository.findByLearner_SkillpilotId(learner.getSkillpilotId())).isEmpty();
    }

    @Test void strictModeOffersReachableSupportBeyondTheCurrentFocusWithoutTargetPromotion() {
        learner.setStrictMode(true);
        select();
        learners.startCompletionAssessment(learner.getSkillpilotId(),
                new CompletionAssessmentStart(PROFILE, EXAM, learner.getCoachStateRevision()),
                "claude", "owner-hash", Instant.now().plusSeconds(600));
        var state = learners.getLearnerState(learner.getSkillpilotId());
        var support = state.levelCompletion().actions().stream()
                .filter(a -> "includeSupport".equals(a.action())).findFirst().orElseThrow();
        var supported = learners.chooseLevelCompletion(learner.getSkillpilotId(), new LevelCompletionActionRequest(
                support.action(), PROFILE, support.goalId(), support.intent(), learner.getCoachStateRevision()));
        assertThat(supported.activeGoal().id()).isEqualTo(support.goalId());
        assertThat(supported.levelCompletion().navigationIntent()).isEqualTo("support");
        assertThat(supported.levelCompletion().targetCount()).isEqualTo(2);
        assertThat(supported.levelCompletion().directAssessmentRunning()).isFalse();
        assertThat(focus.findByLearner_SkillpilotId(learner.getSkillpilotId()))
                .extracting(PlannedGoal::getGoalId).contains(PREPARATION, support.goalId());
        assertThat(learner.getStrictMode()).isTrue();
        assertThat(masteryRepository.findByLearner_SkillpilotId(learner.getSkillpilotId())).isEmpty();
    }

    @Test void unofferedIntentsAndNewMasteryRequestsAreNotAcceptedAsReplays() {
        masteryRepository.saveAndFlush(new Mastery(learner, PREPARATION, 1.0));
        var selected = select();
        long version = learner.getCoachStateRevision();
        assertThat(selected.levelCompletion().actions()).noneMatch(a ->
                "learnGoal".equals(a.action()) && PREPARATION.equals(a.goalId()) && "support".equals(a.intent()));
        assertThatThrownBy(() -> learners.chooseLevelCompletion(learner.getSkillpilotId(),
                new LevelCompletionActionRequest("learnGoal", PROFILE, PREPARATION, "support", version)))
                .isInstanceOf(ResponseStatusException.class);
        assertThatThrownBy(() -> learners.setMastery(learner.getSkillpilotId(),
                new MasteryUpdateRequest(Map.of(PREPARATION, 1.0), PREPARATION)))
                .isInstanceOf(ResponseStatusException.class);
        assertThatThrownBy(() -> learners.setMastery(learner.getSkillpilotId(),
                new MasteryUpdateRequest(Map.of(PREPARATION, .5), PREPARATION)))
                .isInstanceOf(ResponseStatusException.class);
        assertThat(learner.getCoachStateRevision()).isEqualTo(version);
    }

    private void addUnrelatedFocus() {
        focus.saveAndFlush(new PlannedGoal(learner, UNRELATED));
        assertThat(learners.getFrontier(learner.getSkillpilotId())).contains(UNRELATED);
    }

    @Test void profileSelectionEndsUnrelatedActiveWorkButKeepsIndependentFocusRoots() throws Exception {
        addUnrelatedFocus();
        learner.setActiveGoalId(UNRELATED);
        learner.setLearningState(LearningState.TEACHING);
        var selected = select();
        assertThat(selected.activeGoal()).isNull();
        assertThat(selected.frontier()).isEmpty();
        assertThat(selected.stateMachine().requiredAction()).isEqualTo("chooseCompletionRoute");
        assertThat(selected.nextAllowedActions()).doesNotContain("setActiveGoal");
        assertThat(mapper.readValue(learner.getCompletionWorkflow(), CompletionWorkflowState.class).currentGoalId()).isNull();
        assertThat(focus.findByLearner_SkillpilotId(learner.getSkillpilotId()))
                .extracting(PlannedGoal::getGoalId).containsExactlyInAnyOrder(PREPARATION, UNRELATED);
        assertThat(learners.getFrontier(learner.getSkillpilotId())).contains(UNRELATED);
        assertThat(masteryRepository.findByLearner_SkillpilotId(learner.getSkillpilotId())).isEmpty();
    }

    @Test void genericUiActivationCannotEscapeThePublishedCompletionRoute() throws Exception {
        addUnrelatedFocus();
        select();
        long revision = learner.getCoachStateRevision();
        String workflow = learner.getCompletionWorkflow();
        var mvc = org.springframework.test.web.servlet.setup.MockMvcBuilders.standaloneSetup(ui)
                .setMessageConverters(new org.springframework.http.converter.json.MappingJackson2HttpMessageConverter(mapper)).build();
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post(
                "/api/ui/learners/{id}/active-goal", learner.getSkillpilotId())
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsBytes(new ActiveGoalRequest(UNRELATED, true))))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isConflict());
        assertThat(learner.getActiveGoalId()).isNull();
        assertThat(learner.getCoachStateRevision()).isEqualTo(revision);
        assertThat(learner.getCompletionWorkflow()).isEqualTo(workflow);
        assertThat(masteryRepository.findByLearner_SkillpilotId(learner.getSkillpilotId())).isEmpty();
    }

    @Test void evenAnInContextGoalRequiresAnExplicitPublishedRouteChoice() {
        select();
        long revision = learner.getCoachStateRevision();
        assertThatThrownBy(() -> learners.setActiveGoal(learner.getSkillpilotId(), PREPARATION))
                .isInstanceOf(ResponseStatusException.class);
        assertThat(learner.getActiveGoalId()).isNull();
        assertThat(learner.getCoachStateRevision()).isEqualTo(revision);
        var state = learners.getLearnerState(learner.getSkillpilotId());
        var choice = state.levelCompletion().actions().stream()
                .filter(action -> "learnGoal".equals(action.action()) && PREPARATION.equals(action.goalId())).findFirst().orElseThrow();
        var accepted = learners.chooseLevelCompletion(learner.getSkillpilotId(), new LevelCompletionActionRequest(
                choice.action(), PROFILE, choice.goalId(), choice.intent(), revision));
        assertThat(accepted.activeGoal().id()).isEqualTo(PREPARATION);
    }

    @Test void legacyUnrelatedActiveWorkIsHiddenReadOnlyAndReconciledWithoutMastery() throws Exception {
        addUnrelatedFocus();
        select();
        learner.setActiveGoalId(UNRELATED);
        learner.setLearningState(LearningState.TEACHING);
        var workflow = mapper.readValue(learner.getCompletionWorkflow(), CompletionWorkflowState.class);
        learner.setCompletionWorkflow(mapper.writeValueAsString(workflow.withNavigation("required", UNRELATED)));
        nextRequestTransaction(true);
        long revision = learner.getCoachStateRevision();
        var projected = learners.getCoachLearnerState(learner.getSkillpilotId());
        assertThat(projected.activeGoal()).isNull();
        assertThat(projected.frontier()).isEmpty();
        assertThat(learner.getActiveGoalId()).isEqualTo(UNRELATED);
        assertThat(learner.getCoachStateRevision()).isEqualTo(revision);
        var reconciled = learners.getLearnerState(learner.getSkillpilotId());
        assertThat(reconciled.activeGoal()).isNull();
        assertThat(learner.getActiveGoalId()).isNull();
        assertThat(learner.getCoachStateRevision()).isEqualTo(revision + 1);
        assertThat(mapper.readValue(learner.getCompletionWorkflow(), CompletionWorkflowState.class).currentGoalId()).isNull();
        assertThat(reconciled.levelCompletion().learnerRevision()).isEqualTo(learner.getCoachStateRevision());
        assertThat(masteryRepository.findByLearner_SkillpilotId(learner.getSkillpilotId())).isEmpty();
    }

    @Test void profileSelectionPreservesAlreadyActiveWaivedWorkInsideItsContext() throws Exception {
        masteryRepository.saveAndFlush(new Mastery(learner, EXAM, 1.0));
        learner.setActiveGoalId(PREPARATION);
        learner.setLearningState(LearningState.TEACHING);
        var selected = select();
        assertThat(selected.levelCompletion().complete()).isTrue();
        assertThat(selected.activeGoal().id()).isEqualTo(PREPARATION);
        assertThat(mapper.readValue(learner.getCompletionWorkflow(), CompletionWorkflowState.class).currentGoalId()).isEqualTo(PREPARATION);
        assertThat(masteryRepository.findByLearner_SkillpilotId(learner.getSkillpilotId()))
                .extracting(Mastery::getGoalKey).containsExactly(EXAM);
    }

    @Test void emptyAllowlistDoesNotReadTheCanonicalGraphOrPublishAnEmptyPicker() {
        ReflectionTestUtils.setField(learners, "completionApplicationService", new CompletionApplicationService(
                new CompletionProfileCatalog(Map.of(), Map.of(), "empty-generation")));
        Object originalResolver = ReflectionTestUtils.getField(learners, "completionCanonicalGraphResolver");
        var resolver = org.mockito.Mockito.mock(CompletionCanonicalGraphResolver.class);
        ReflectionTestUtils.setField(learners, "completionCanonicalGraphResolver", resolver);
        try {
            assertThat(learners.getLearnerState(learner.getSkillpilotId()).levelCompletion()).isNull();
            org.mockito.Mockito.verifyNoInteractions(resolver);
        } finally { ReflectionTestUtils.setField(learners, "completionCanonicalGraphResolver", originalResolver); }
    }

    @Test void inapplicableUnselectedProfileDoesNotPublishAnEmptyPicker() {
        var application = (CompletionApplicationService) ReflectionTestUtils.getField(learners, "completionApplicationService");
        var original = application.catalog().profile(PROFILE);
        var profile = new CompletionProfileDefinition(1, PROFILE, original.revision(), original.title(), original.levelScopeRef(),
                Map.of("jurisdiction", List.of("DE-BY")), original.protectedGoalIds(), original.review(), original.rules());
        ReflectionTestUtils.setField(learners, "completionApplicationService", new CompletionApplicationService(
                new CompletionProfileCatalog(Map.of(PROFILE, profile),
                        Map.of(profile.levelScopeRef(), application.catalog().scope(profile.levelScopeRef())), "generation")));
        assertThat(learners.getLearnerState(learner.getSkillpilotId()).levelCompletion()).isNull();
        assertThat(learner.getCompletionWorkflow()).isNull();
    }

    @Test void malformedExistingWorkflowRetainsItsExplicitExitEvenWithEmptyAllowlist() {
        ReflectionTestUtils.setField(learners, "completionApplicationService", new CompletionApplicationService(
                new CompletionProfileCatalog(Map.of(), Map.of(), "empty-generation")));
        learner.setCompletionWorkflow("{malformed");
        var state = learners.getLearnerState(learner.getSkillpilotId());
        assertThat(state.levelCompletion()).isNotNull();
        assertThat(state.levelCompletion().calculationStatus()).isEqualTo("invalid");
        assertThat(state.levelCompletion().actions()).anyMatch(action -> "leaveProfile".equals(action.action()));
    }

    private void replaceCompletionGeneration() {
        var previous = (CompletionApplicationService) ReflectionTestUtils.getField(learners, "completionApplicationService");
        var profile = previous.catalog().profile(PROFILE);
        ReflectionTestUtils.setField(learners, "completionApplicationService", new CompletionApplicationService(
                new CompletionProfileCatalog(Map.of(PROFILE, profile),
                        Map.of(profile.levelScopeRef(), previous.catalog().scope(profile.levelScopeRef())), "replacement-generation")));
    }

    @Test void updatedProfileIsExplainedWithoutClaimingThatThePersonalCurriculumChanged() {
        select();
        String storedWorkflow = learner.getCompletionWorkflow();
        long revision = learner.getCoachStateRevision();
        var previous = (CompletionApplicationService) ReflectionTestUtils.getField(learners, "completionApplicationService");
        var original = previous.catalog().profile(PROFILE);
        var updated = new CompletionProfileDefinition(1, PROFILE, "updated-profile", original.title(), original.levelScopeRef(),
                original.applicability(), original.protectedGoalIds(), original.review(), original.rules());
        ReflectionTestUtils.setField(learners, "completionApplicationService", new CompletionApplicationService(
                new CompletionProfileCatalog(Map.of(PROFILE, updated),
                        Map.of(updated.levelScopeRef(), previous.catalog().scope(updated.levelScopeRef())), previous.catalog().generation())));
        var state = learners.getCoachLearnerState(learner.getSkillpilotId());
        assertThat(state.levelCompletion().notice()).isEqualTo("completion_profile_changed");
        assertThat(state.levelCompletion().complete()).isNull();
        assertThat(learner.getCompletionWorkflow()).isEqualTo(storedWorkflow);
        assertThat(learner.getCoachStateRevision()).isEqualTo(revision);
    }

    @Test void verifiedOwnerCanLeaveAnInvalidLiveGenerationWithoutASecondAcademicAuthorization() throws Exception {
        select();
        learners.startCompletionAssessment(learner.getSkillpilotId(),
                new CompletionAssessmentStart(PROFILE, EXAM, learner.getCoachStateRevision()),
                "claude", "owner-hash", Instant.now().plusSeconds(600));
        nextRequestTransaction(true);
        replaceCompletionGeneration();
        String stored = learner.getCompletionWorkflow();
        long revision = learner.getCoachStateRevision();
        var owner = new CompletionCallContext("claude", "owner-hash", Instant.now().plusSeconds(600), true);
        var projected = CompletionCallContext.with(owner, () -> learners.getCoachLearnerState(learner.getSkillpilotId()));
        assertThat(projected.activeGoal()).isNull();
        assertThat(projected.levelCompletion().directAssessmentRunning()).isFalse();
        assertThat(projected.levelCompletion().notice()).isEqualTo("completion_generation_changed");
        assertThat(projected.levelCompletion().actions()).anyMatch(action -> "leaveProfile".equals(action.action()));
        assertThat(learner.getCompletionWorkflow()).isEqualTo(stored);
        assertThat(learner.getCoachStateRevision()).isEqualTo(revision);
        assertThatThrownBy(() -> CompletionCallContext.with(owner,
                () -> learners.setMastery(learner.getSkillpilotId(), new MasteryUpdateRequest(Map.of(EXAM, 1.0), EXAM))))
                .isInstanceOf(ResponseStatusException.class);
        nextRequestTransaction(false);
        CompletionCallContext.with(owner, () -> learners.chooseLevelCompletion(learner.getSkillpilotId(),
                new LevelCompletionActionRequest("leaveProfile", null, null, null, revision)));
        assertThat(learner.getCompletionWorkflow()).isNull();
        assertThat(learner.getActiveGoalId()).isNull();
        assertThat(focus.findByLearner_SkillpilotId(learner.getSkillpilotId()))
                .extracting(PlannedGoal::getGoalId).containsExactly(PREPARATION);
        assertThat(masteryRepository.findByLearner_SkillpilotId(learner.getSkillpilotId())).isEmpty();
    }

    @Test void anotherValidSessionCannotExitTheOwnersInvalidLiveBinding() throws Exception {
        select();
        learners.startCompletionAssessment(learner.getSkillpilotId(),
                new CompletionAssessmentStart(PROFILE, EXAM, learner.getCoachStateRevision()),
                "claude", "owner-hash", Instant.now().plusSeconds(600));
        replaceCompletionGeneration();
        long revision = learner.getCoachStateRevision();
        String stored = learner.getCompletionWorkflow();
        var foreign = new CompletionCallContext("claude", "foreign-hash", Instant.now().plusSeconds(600), true);
        var projected = CompletionCallContext.with(foreign, () -> learners.getCoachLearnerState(learner.getSkillpilotId()));
        assertThat(projected.activeGoal()).isNull();
        assertThat(projected.levelCompletion().actions()).isEmpty();
        assertThatThrownBy(() -> CompletionCallContext.with(foreign, () -> learners.chooseLevelCompletion(learner.getSkillpilotId(),
                new LevelCompletionActionRequest("leaveProfile", null, null, null, revision))))
                .isInstanceOf(ResponseStatusException.class);
        assertThat(learner.getActiveGoalId()).isEqualTo(EXAM);
        assertThat(learner.getCompletionWorkflow()).isEqualTo(stored);
        assertThat(learner.getCoachStateRevision()).isEqualTo(revision);
    }

    @Test void cockpitHealsAnInvalidLiveGenerationOnceWithoutChangingFocusOrMastery() throws Exception {
        select();
        learners.startCompletionAssessment(learner.getSkillpilotId(),
                new CompletionAssessmentStart(PROFILE, EXAM, learner.getCoachStateRevision()),
                "claude", "owner-hash", Instant.now().plusSeconds(600));
        nextRequestTransaction(true);
        replaceCompletionGeneration();
        long revision = learner.getCoachStateRevision();
        var state = learners.getLearnerState(learner.getSkillpilotId());
        assertThat(state.activeGoal()).isNull();
        assertThat(state.levelCompletion().directAssessmentRunning()).isFalse();
        assertThat(state.levelCompletion().navigationIntent()).isEqualTo("paused");
        assertThat(learner.getCoachStateRevision()).isEqualTo(revision + 1);
        var stored = mapper.readValue(learner.getCompletionWorkflow(), CompletionWorkflowState.class);
        assertThat(stored.directAssessment()).isNull();
        assertThat(stored.profileId()).isEqualTo(PROFILE);
        assertThat(stored.currentGoalId()).isNull();
        learners.getLearnerState(learner.getSkillpilotId());
        assertThat(learner.getCoachStateRevision()).isEqualTo(revision + 1);
        assertThat(focus.findByLearner_SkillpilotId(learner.getSkillpilotId()))
                .extracting(PlannedGoal::getGoalId).containsExactly(PREPARATION);
        assertThat(masteryRepository.findByLearner_SkillpilotId(learner.getSkillpilotId())).isEmpty();
    }

    @Test void aLiveDirectBindingToANonRequiredAssessmentCannotReleaseTeaching() throws Exception {
        select();
        learners.startCompletionAssessment(learner.getSkillpilotId(),
                new CompletionAssessmentStart(PROFILE, EXAM, learner.getCoachStateRevision()),
                "claude", "owner-hash", Instant.now().plusSeconds(600));
        var workflow = mapper.readValue(learner.getCompletionWorkflow(), CompletionWorkflowState.class);
        learner.setCompletionWorkflow(mapper.writeValueAsString(workflow.withDirectAssessment(
                new CompletionWorkflowState.DirectAssessmentContext("claude", "owner-hash", PREPARATION, Instant.now().plusSeconds(600)))));
        learner.setActiveGoalId(PREPARATION);
        nextRequestTransaction(true);
        var owner = new CompletionCallContext("claude", "owner-hash", Instant.now().plusSeconds(600), true);
        var projected = CompletionCallContext.with(owner, () -> learners.getCoachLearnerState(learner.getSkillpilotId()));
        assertThat(projected.activeGoal()).isNull();
        assertThat(projected.levelCompletion().directAssessmentRunning()).isFalse();
        assertThat(projected.levelCompletion().assessments()).noneMatch(LevelCompletionResponse.Assessment::startAvailable);
        assertThat(learner.getActiveGoalId()).isEqualTo(PREPARATION);
        assertThat(learners.getLearnerState(learner.getSkillpilotId()).activeGoal()).isNull();
        assertThat(mapper.readValue(learner.getCompletionWorkflow(), CompletionWorkflowState.class).directAssessment()).isNull();
        assertThat(masteryRepository.findByLearner_SkillpilotId(learner.getSkillpilotId())).isEmpty();
    }

    @Test void anOfferedAssessmentCanStartOutsideTheCurrentOfferFocusWithoutChangingIt() {
        focus.deleteByLearner_SkillpilotId(learner.getSkillpilotId());
        focus.saveAndFlush(new PlannedGoal(learner, UNRELATED));
        learner.setStrictMode(true);
        var offered = learners.getLearnerState(learner.getSkillpilotId());
        assertThat(offered.levelCompletion().profileOptions()).extracting(LevelCompletionResponse.ProfileOption::profileId).contains(PROFILE);
        assertThat(offered.levelCompletion().profileOptions()).filteredOn(option -> PROFILE.equals(option.profileId()))
                .singleElement().satisfies(option -> {
                    assertThat(option.targetCount()).isEqualTo(2);
                    assertThat(option.requiredAssessmentCount()).isEqualTo(1);
                });
        var selected = select();
        assertThat(selected.levelCompletion().assessments()).anyMatch(assessment -> EXAM.equals(assessment.goalId()) && assessment.startAvailable());
        learners.startCompletionAssessment(learner.getSkillpilotId(),
                new CompletionAssessmentStart(PROFILE, EXAM, learner.getCoachStateRevision()),
                "claude", "owner-hash", Instant.now().plusSeconds(600));
        var running = learners.getLearnerState(learner.getSkillpilotId());
        assertThat(running.activeGoal().id()).isEqualTo(EXAM);
        assertThat(running.levelCompletion().targetCount()).isEqualTo(2);
        assertThat(focus.findByLearner_SkillpilotId(learner.getSkillpilotId()))
                .extracting(PlannedGoal::getGoalId).containsExactly(UNRELATED);
        assertThat(learner.getStrictMode()).isTrue();
        assertThat(masteryRepository.findByLearner_SkillpilotId(learner.getSkillpilotId())).isEmpty();
    }

    @Test void aRequiredAssessmentDoesNotNeedDirectRequiresToBeOfferedAndStarted() {
        var originalResolver = (CompletionCanonicalGraphResolver) ReflectionTestUtils.getField(learners, "completionCanonicalGraphResolver");
        Map<String, com.skillpilot.backend.landscape.LearningGoal> definitions = originalResolver.load(ROOT);
        definitions.get(EXAM).setRequires(List.of());
        var original = ((CompletionApplicationService) ReflectionTestUtils.getField(learners, "completionApplicationService")).catalog().profile(PROFILE);
        var synthetic = new CompletionProfileDefinition(1, PROFILE, "q-only", original.title(), "q-only-scope",
                Map.of(), List.of(), original.review(), List.of());
        var scope = new CompletionScopeDefinition(1, "q-only-scope", "1", original.title(), List.of(EXAM));
        ReflectionTestUtils.setField(learners, "completionApplicationService", new CompletionApplicationService(
                new CompletionProfileCatalog(Map.of(PROFILE, synthetic), Map.of(scope.id(), scope), "q-only-generation")));
        var resolver = org.mockito.Mockito.mock(CompletionCanonicalGraphResolver.class);
        org.mockito.Mockito.when(resolver.load(ROOT)).thenReturn(definitions);
        ReflectionTestUtils.setField(learners, "completionCanonicalGraphResolver", resolver);
        try {
            learner.setStrictMode(true);
            var selected = select();
            assertThat(definitions.get(EXAM).getRequires()).isEmpty();
            assertThat(selected.levelCompletion().assessments()).singleElement()
                    .satisfies(assessment -> assertThat(assessment.startAvailable()).isTrue());
            learners.startCompletionAssessment(learner.getSkillpilotId(),
                    new CompletionAssessmentStart(PROFILE, EXAM, learner.getCoachStateRevision()),
                    "claude", "owner-hash", Instant.now().plusSeconds(600));
            assertThat(learners.getLearnerState(learner.getSkillpilotId()).activeGoal().id()).isEqualTo(EXAM);
            assertThat(focus.findByLearner_SkillpilotId(learner.getSkillpilotId()))
                    .extracting(PlannedGoal::getGoalId).containsExactly(PREPARATION);
            assertThat(masteryRepository.findByLearner_SkillpilotId(learner.getSkillpilotId())).isEmpty();
        } finally { ReflectionTestUtils.setField(learners, "completionCanonicalGraphResolver", originalResolver); }
    }

    @Test void parallelAssessmentMasteryPreservesCurrentWorkAndVoluntaryContinuationSurvivesReload() throws Exception {
        var selected = select();
        nextRequestTransaction(true);
        var required = selected.levelCompletion().actions().stream()
                .filter(action -> "learnGoal".equals(action.action()) && PREPARATION.equals(action.goalId())).findFirst().orElseThrow();
        learners.chooseLevelCompletion(learner.getSkillpilotId(), new LevelCompletionActionRequest(
                required.action(), PROFILE, required.goalId(), required.intent(), learner.getCoachStateRevision()));
        nextRequestTransaction(true);
        masteryRepository.saveAndFlush(new Mastery(learner, EXAM, 1.0));
        ReflectionTestUtils.invokeMethod(learners, "advanceCoachStateRevision", learner);
        nextRequestTransaction(true);
        var changed = learners.getLearnerState(learner.getSkillpilotId());
        assertThat(changed.levelCompletion().complete()).isTrue();
        assertThat(changed.activeGoal().id()).isEqualTo(PREPARATION);
        var voluntary = changed.levelCompletion().actions().stream()
                .filter(action -> "learnGoal".equals(action.action()) && PREPARATION.equals(action.goalId())
                        && "voluntary".equals(action.intent())).findFirst().orElseThrow();
        learners.chooseLevelCompletion(learner.getSkillpilotId(), new LevelCompletionActionRequest(
                voluntary.action(), PROFILE, voluntary.goalId(), voluntary.intent(), learner.getCoachStateRevision()));
        nextRequestTransaction(true);
        var reloaded = learners.getCoachLearnerState(learner.getSkillpilotId());
        assertThat(reloaded.activeGoal().id()).isEqualTo(PREPARATION);
        assertThat(reloaded.levelCompletion().navigationIntent()).isEqualTo("voluntary");
        assertThat(reloaded.levelCompletion().actions()).noneMatch(action -> "includeSupport".equals(action.action()));
        assertThat(mapper.readValue(learner.getCompletionWorkflow(), CompletionWorkflowState.class).currentGoalId()).isEqualTo(PREPARATION);
        assertThat(masteryRepository.findByLearner_SkillpilotId(learner.getSkillpilotId()))
                .extracting(Mastery::getGoalKey).containsExactly(EXAM);
    }

    @org.junit.jupiter.params.ParameterizedTest
    @org.junit.jupiter.params.provider.ValueSource(booleans = {true, false})
    void leavingTheRouteKeepsThePreferenceChangedDuringTheRoute(boolean latestPreference) {
        learner.setFollowLearningPlans(!latestPreference);
        select();
        assertThat(learners.effectivePlanFollowing(learner)).isFalse();
        learners.setPreferences(learner.getSkillpilotId(), null, null, null, null, latestPreference);
        assertThat(learners.effectivePlanFollowing(learner)).isFalse();
        learners.chooseLevelCompletion(learner.getSkillpilotId(), new LevelCompletionActionRequest(
                "leaveProfile", null, null, null, learner.getCoachStateRevision()));
        assertThat(learner.getFollowLearningPlans()).isEqualTo(latestPreference);
        assertThat(learners.effectivePlanFollowing(learner)).isEqualTo(latestPreference);
        assertThat(learner.getCompletionWorkflow()).isNull();
    }

    @Test void signedImportDropsTheDirectExceptionBeforeRevalidatingImportedFocus() throws Exception {
        // Archive the actual wire snapshot rather than retaining a managed Learner entity.
        var backup = mapper.readValue(mapper.writeValueAsString(learners.exportLearner(learner.getSkillpilotId())),
                SignedLearnerDataDTO.class);
        select();
        learners.startCompletionAssessment(learner.getSkillpilotId(),
                new CompletionAssessmentStart(PROFILE, EXAM, learner.getCoachStateRevision()),
                "claude", "owner-hash", Instant.now().plusSeconds(600));
        learners.importLearner(learner.getSkillpilotId(), backup);
        assertThat(learner.getCompletionWorkflow()).isNull();
        assertThat(learner.getActiveGoalId()).isNull();
        assertThat(focus.findByLearner_SkillpilotId(learner.getSkillpilotId()))
                .extracting(PlannedGoal::getGoalId).containsExactly(PREPARATION);
    }
}
