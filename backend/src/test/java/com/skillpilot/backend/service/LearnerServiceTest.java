package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.ai.CoachStateProjection;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.ClientStateRequest;
import com.skillpilot.backend.api.MasteryUpdateRequest;
import com.skillpilot.backend.api.MemoryPracticeReviewRequest;
import com.skillpilot.backend.api.MemoryPracticeStartRequest;
import com.skillpilot.backend.api.VerifiedRecallAnswerRequest;
import com.skillpilot.backend.api.VerifiedRecallBatchAnswerCard;
import com.skillpilot.backend.api.VerifiedRecallBatchAnswerRequest;
import com.skillpilot.backend.api.VerifiedRecallBatchCardResult;
import com.skillpilot.backend.api.VerifiedRecallBatchResultRequest;
import com.skillpilot.backend.api.VerifiedRecallPromptCard;
import com.skillpilot.backend.api.VerifiedRecallResultRequest;
import com.skillpilot.backend.api.VerifiedRecallStartRequest;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.LearnerLearningPlan;
import com.skillpilot.backend.domain.LearningState;
import com.skillpilot.backend.domain.Mastery;
import com.skillpilot.backend.domain.MasteryId;
import com.skillpilot.backend.domain.PlannedGoal;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.SkillLandscape;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.repository.LearnerClientStateRepository;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.LearnerLearningPlanRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import com.skillpilot.backend.repository.PlannedGoalRepository;
import com.skillpilot.backend.service.CompositionViewService.CompositionStructureResolution;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
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

    private static final int SCOPE_COMPLETION_SAFETY_MARGIN = 5;
    private static final String CANONICAL_GYMNASIUM_ROOT_ID = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
    private static final String CANONICAL_MATH_LANDSCAPE_ID = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
    private static final String CANONICAL_MATH_ROOT_SCOPE_ID =
            "c01b1ce9-a667-4a46-b251-ec33ae602b15";
    private static final String CANONICAL_PHYSICS_ROOT_SCOPE_ID =
            "bf980fff-b62b-4ea4-a20d-31681a7ad785";
    private static final String CANONICAL_PHYSICS_LANDSCAPE_ID =
            "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
    private static final String CANONICAL_PHYSICS_ORIENTATION_ID =
            "5c44b9ba-9b05-4774-95d5-073230d3fc4f";
    private static final String CANONICAL_MATH_ORIENTATION_ID =
            "71cec9fb-3751-4d61-8b34-c5adbbf6e5f2";
    private static final String CANONICAL_E_ONE_SCOPE_ID =
            "c9d92f32-167a-4006-a940-b8063a6ed434";
    private static final String CANONICAL_REPRESENTATION_CLUSTER_ID =
            "34047d7c-3a92-59fa-91b4-354211ff36e1";
    private static final String CANONICAL_CHOOSE_REPRESENTATION_ID =
            "8dd9f210-2683-5902-acab-e3be22725232";
    private static final String CANONICAL_CREATE_REPRESENTATION_ID =
            "3f4d1340-1fbb-5109-b9c2-08fc61303133";
    private static final String CANONICAL_MATH_SEK_ONE_ORIENTATION_ID =
            "65365dce-f33f-49d8-9516-42f75883aa86";
    private static final String COMPOSITION_SEK_ONE_G9_SCOPE_ID =
            "composition:de-he-gym-math-gk-g9:structure:sek1-g9";
    private static final String COMPOSITION_HE_G9_MATH_ROOT_SCOPE_ID =
            "composition:de-he-gym-math-gk-g9:structure:math-root";
    private static final String COMPOSITION_J7_SCOPE_ID =
            "composition:de-he-gym-math-gk-g9:structure:j7-g9";
    private static final String COMPOSITION_J8_SCOPE_ID =
            "composition:de-he-gym-math-gk-g9:structure:j8-g9";
    private static final String COMPOSITION_J9_SCOPE_ID =
            "composition:de-he-gym-math-gk-g9:structure:j9-g9";
    private static final String COMPOSITION_J10_SCOPE_ID =
            "composition:de-he-gym-math-gk-g9:structure:j10-g9";
    private static final String COMPOSITION_MERGED_DE_J8_SCOPE_ID =
            "composition:merged:de-de-gym-math-lk+de-de-gym-math-gk:structure:j8";
    private static final String COMPOSITION_MERGED_DE_J8_ADDITIONAL_SCOPE_ID =
            "composition:merged:de-de-gym-math-lk+de-de-gym-math-gk:structure:j8-additional-competencies";
    private static final String COMPOSITION_DE_MATH_LK_ROOT_SCOPE_ID =
            "composition:de-de-gym-math-lk:structure:math-root";
    private static final String COMPOSITION_DE_MATH_LK_ANALYSIS_BASICS_SCOPE_ID =
            "composition:de-de-gym-math-lk:structure:analysis-basics";
    private static final String COMPOSITION_HE_SEK_TWO_MATH_LK_ROOT_SCOPE_ID =
            "composition:de-he-gym-sekii-math-lk:structure:sek2-lk";
    private static final String COMPOSITION_HE_SEK_TWO_MATH_LK_E_PHASE_SCOPE_ID =
            "composition:de-he-gym-sekii-math-lk:structure:e-phase";
    private static final String COMPOSITION_DE_PHYSICS_LK_ROOT_SCOPE_ID =
            "composition:de-de-gym-physics-lk:structure:physics-root";
    private static final String CANONICAL_SPANISH_LANDSCAPE_ID =
            "90eedebf-9ea8-5247-85dd-31c147f907c3";
    private static final String CANONICAL_SPANISH_ROOT_SCOPE_ID =
            "1b23eb50-e5f6-5958-8c99-ff8ca9668031";
    private static final String SEK1_EXERCISES_SCOPE_ID = "bfc4fe23-bfa4-4836-9bd2-793f4305d682";
    private static final String REMOVED_SEK1_CAPSTONE_ID = "30b62966-80d0-45f1-bdd9-b4fb815c7111";
    private static final String VISIBLE_POLYNOMIAL_FUNCTIONS_ID = "1ce8af38-082a-477b-af48-b924c92761bf";
    private static final String HIDDEN_TRIGONOMETRIC_EXPONENTIAL_CORRIDOR_ID =
            "0756b198-0074-49d5-becd-9bb9f161a291";
    private static final String HIDDEN_POLYNOMIAL_END_BEHAVIOR_ID = "283ec44e-747c-55e3-9a61-4a4cc70ebfab";
    private static final String SEK1_CORE_FORMULAS_FLASHCARDS_ID = "4eefbd04-9e49-41ea-a087-9ad6ac71ec5a";
    private static final String FUNCTIONS_FLASHCARDS_ID = "77259806-add7-5fcb-b89c-376e1b0c88d6";
    private static final String LEGACY_HIDDEN_CURRICULUM_ID = "f050ee48-6891-4f83-995f-0f8be5e31b7f";
    private static final String COMPATIBILITY_CURRICULUM_ID = "bbbf39f3-4a5b-46cf-9edd-48f2c54ae0da";
    private static final String J8_EXAM_TASK_3_ID = "9accf4e2-f92d-5ff1-8d47-dfec33a8a707";
    private static final String J8_EXAM_TASK_1_ID = "4553367f-6265-511b-8632-46d99109e69b";
    private static final String J8_EXAM_TASK_2_ID = "df9ecf0f-f4c9-5859-b99e-11cb62f6bb35";
    private static final String J8_EXAM_TASK_4_ID = "e96bc8e4-463b-5e86-b0c4-2c87b74d68f5";
    private static final String J8_EXAM_TASK_5_ID = "3045f00d-a5b9-547c-b568-593aeac9ffa3";
    private static final String J8_EXAM_TASK_6_ID = "fbf10244-9e55-597a-98d4-006d972a5c41";
    private static final String J8_EXAM_TASK_7_ID = "10a77422-6ceb-57ce-a90f-0ebc1179aaae";
    private static final String J8_EXAM_TASK_8_ID = "a70d4194-1f95-5dc4-884d-8ca856663601";
    private static final String J8_EXAM_TASK_9_ID = "0d2cfddc-7af6-5709-819f-929e6cf9c192";

    @Autowired
    private LearnerService learnerService;

    @Autowired
    private LearnerLearningPlanService learnerLearningPlanService;

    @Autowired
    private LearnerRepository learnerRepository;

    @Autowired
    private MasteryRepository masteryRepository;

    @Autowired
    private PlannedGoalRepository plannedGoalRepository;

    @Autowired
    private LearnerLearningPlanRepository learnerLearningPlanRepository;

    @Autowired
    private LearnerClientStateRepository learnerClientStateRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private LandscapeService landscapeService;

    @Autowired
    private CompositionViewService compositionViewService;

    private String learnerId;

    @BeforeEach
    void setUp() {
        Learner learner = new Learner();
        learner.setSkillpilotId("test-learner");
        learner.setLearningStrategy("RANDOM");
        learner.setAutoPilot(false);
        learnerRepository.save(learner);
        learnerId = learner.getSkillpilotId();
    }

    @AfterEach
    void tearDown() {
        ReflectionTestUtils.setField(learnerService, "verifiedRecallClock", Clock.systemUTC());
        ReflectionTestUtils.setField(
                learnerService,
                "learningPlanClock",
                Clock.system(ZoneId.of("Europe/Berlin")));
        learnerClientStateRepository.deleteAll();
        learnerLearningPlanRepository.deleteAll();
        masteryRepository.deleteAll();
        plannedGoalRepository.deleteAll();
        learnerRepository.deleteAll();
    }

    @Test
    void newLearnersUseSequentialLearningWithAutopilotByDefault() {
        Learner created = learnerService.createLearner();

        Learner persisted = learnerRepository.findById(created.getSkillpilotId()).orElseThrow();
        assertThat(persisted.getLearningStrategy()).isEqualTo("SEQUENTIAL");
        assertThat(persisted.getAutoPilot()).isTrue();
        assertThat(persisted.getFollowLearningPlans()).isFalse();
    }

    @Test
    void explicitManualPreferencesRemainUnchanged() {
        Learner created = learnerService.createLearner();
        learnerService.setPreferences(created.getSkillpilotId(), "RANDOM", false, null, null);

        Learner persisted = learnerRepository.findById(created.getSkillpilotId()).orElseThrow();
        assertThat(persisted.getLearningStrategy()).isEqualTo("RANDOM");
        assertThat(persisted.getAutoPilot()).isFalse();
    }

    @Test
    @Transactional
    void setPlannedGoals_isIdempotentForSameTargetSet() {
        selectCompletedCanonicalMathCurriculum();
        assertThatCode(() -> learnerService.setPlannedGoals(
                        learnerId,
                        Set.of(COMPOSITION_J8_SCOPE_ID)))
                .doesNotThrowAnyException();
        assertThatCode(() -> learnerService.setPlannedGoals(
                        learnerId,
                        Set.of(COMPOSITION_J8_SCOPE_ID)))
                .doesNotThrowAnyException();

        var goals = plannedGoalRepository.findByLearner_SkillpilotId(learnerId);
        assertThat(goals).hasSize(1);
        assertThat(goals.get(0).getGoalId()).isEqualTo(COMPOSITION_J8_SCOPE_ID);
    }

    @Test
    void cockpitWritesAdvanceTheCanonicalCoachStateRevision() {
        Learner initialLearner = learnerRepository.findById(learnerId).orElseThrow();
        assertThat(initialLearner.getCoachStateRevision()).isZero();
        assertThat(initialLearner.getShowGoalVisualizationsInChat()).isTrue();
        assertThat(initialLearner.getFollowLearningPlans()).isFalse();
        assertThat(learnerService.showGoalVisualizationsInChat(learnerId)).isTrue();

        learnerService.setCurriculum(learnerId, CANONICAL_GYMNASIUM_ROOT_ID);
        assertThat(learnerRepository.findById(learnerId).orElseThrow()
                .getCoachStateRevision()).isEqualTo(1L);

        learnerService.upsertClientState(
                learnerId,
                "recall-node",
                new ClientStateRequest(Instant.now(), Map.of("card-1", Map.of("status", "pending"))));
        assertThat(learnerRepository.findById(learnerId).orElseThrow()
                .getCoachStateRevision()).isEqualTo(2L);

        learnerService.setPlannedGoals(learnerId, Set.of());
        assertThat(learnerRepository.findById(learnerId).orElseThrow()
                .getCoachStateRevision()).isEqualTo(3L);

        learnerService.setPreferences(learnerId, "SEQUENTIAL", true, true, false, true);
        Learner updatedLearner = learnerRepository.findById(learnerId).orElseThrow();
        assertThat(updatedLearner.getCoachStateRevision()).isEqualTo(4L);
        assertThat(updatedLearner.getShowGoalVisualizationsInChat()).isFalse();
        assertThat(updatedLearner.getFollowLearningPlans()).isTrue();
        assertThat(learnerService.showGoalVisualizationsInChat(learnerId)).isFalse();

        learnerService.setPreferences(learnerId, "SEQUENTIAL", true, true, null, null);
        Learner unchangedLearner = learnerRepository.findById(learnerId).orElseThrow();
        assertThat(unchangedLearner.getCoachStateRevision()).isEqualTo(4L);
        assertThat(unchangedLearner.getShowGoalVisualizationsInChat()).isFalse();
        assertThat(unchangedLearner.getFollowLearningPlans()).isTrue();
    }

    @Test
    void followLearningPlansPreferenceAdvancesCoachRevisionExactlyOncePerRealChange() {
        long initialRevision = learnerRepository.findById(learnerId).orElseThrow()
                .getCoachStateRevision();

        learnerService.setPreferences(learnerId, null, null, null, null, true);
        assertThat(learnerRepository.findById(learnerId).orElseThrow().getCoachStateRevision())
                .isEqualTo(initialRevision + 1L);

        learnerService.setPreferences(learnerId, null, null, null, null, true);
        assertThat(learnerRepository.findById(learnerId).orElseThrow().getCoachStateRevision())
                .isEqualTo(initialRevision + 1L);

        learnerService.setPreferences(learnerId, null, null, null, null, false);
        assertThat(learnerRepository.findById(learnerId).orElseThrow().getCoachStateRevision())
                .isEqualTo(initialRevision + 2L);
    }

    @Test
    @Transactional
    void setPlannedGoals_updatesDiffWithoutDuplicates() {
        selectCompletedCanonicalMathCurriculum();
        learnerService.setPlannedGoals(
                learnerId,
                Set.of(COMPOSITION_J8_SCOPE_ID, COMPOSITION_J9_SCOPE_ID));
        learnerService.setPlannedGoals(
                learnerId,
                Set.of(COMPOSITION_J9_SCOPE_ID));

        var goals = plannedGoalRepository.findByLearner_SkillpilotId(learnerId);
        assertThat(goals).hasSize(1);
        assertThat(goals.get(0).getGoalId()).isEqualTo(COMPOSITION_J9_SCOPE_ID);
    }

    @Test
    @Transactional
    void setPlannedGoals_requiresABaseCurriculumForNonEmptyFocusButAllowsClearing() {
        assertThatThrownBy(() ->
                        learnerService.setPlannedGoals(learnerId, Set.of("GOAL_1")))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(error -> assertThat(
                                ((ResponseStatusException) error).getStatusCode())
                        .isEqualTo(org.springframework.http.HttpStatus.CONFLICT));

        assertThat(learnerService.setPlannedGoals(learnerId, Set.of()))
                .isEmpty();
    }

    @Test
    void importLearnerPreservesCurriculumAndMasteryWhileDiscardingFocusFromIncompletePersonalization() {
        String sourceLearnerId = "legacy-export-source";
        String staleFocusId = "legacy-stale-focus";
        String masteryGoalId = "legacy-global-mastery";
        Learner sourceLearner = new Learner();
        sourceLearner.setSkillpilotId(sourceLearnerId);
        sourceLearner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        sourceLearner.setPersonalCurriculum("{}");
        sourceLearner.setShowGoalVisualizationsInChat(false);
        learnerRepository.saveAndFlush(sourceLearner);
        plannedGoalRepository.saveAndFlush(new PlannedGoal(sourceLearner, staleFocusId));
        masteryRepository.saveAndFlush(new Mastery(sourceLearner, masteryGoalId, 0.625));

        assertThat(learnerService.getPlannedGoals(sourceLearnerId)).isEmpty();
        var signedExport = learnerService.exportLearner(sourceLearnerId);
        assertThat(signedExport.data().plannedGoals()).containsExactly(staleFocusId);
        assertThat(signedExport.data().copySources()).isEmpty();
        assertThat(objectMapper.valueToTree(signedExport).toString())
                .doesNotContain("lastActivityAt");

        assertThatCode(() -> learnerService.importLearner(learnerId, signedExport))
                .doesNotThrowAnyException();

        Learner importedLearner = learnerRepository.findById(learnerId).orElseThrow();
        assertThat(importedLearner.getSelectedCurriculum())
                .isEqualTo(CANONICAL_GYMNASIUM_ROOT_ID);
        assertThat(importedLearner.getPersonalCurriculum()).isEqualTo("{}");
        assertThat(importedLearner.getShowGoalVisualizationsInChat()).isFalse();
        assertThat(importedLearner.getCopySources())
                .extracting(com.skillpilot.backend.domain.CopySource::getSourceId)
                .contains(sourceLearnerId);
        assertThat(plannedGoalRepository.findByLearner_SkillpilotId(learnerId))
                .isEmpty();
        assertThat(masteryRepository.findById(new MasteryId(learnerId, masteryGoalId)))
                .get()
                .extracting(Mastery::getValue)
                .isEqualTo(0.625);
    }

    @Test
    void importFromAnAlreadyDeletedSourceSucceedsWithoutRecreatingItsIdAsProvenance() {
        Learner sourceLearner = new Learner();
        sourceLearner.setSkillpilotId("deleted-export-source");
        learnerRepository.saveAndFlush(sourceLearner);
        var signedExport = learnerService.exportLearner(sourceLearner.getSkillpilotId());
        learnerRepository.delete(sourceLearner);
        learnerRepository.flush();

        assertThatCode(() -> learnerService.importLearner(learnerId, signedExport))
                .doesNotThrowAnyException();

        Learner importedLearner = learnerRepository.findById(learnerId).orElseThrow();
        assertThat(importedLearner.getCopySources()).isEmpty();
    }

    @Test
    void signedExportAndImportCarryOnlyTheLearnerOwnedPortablePlans() throws Exception {
        selectCompletedCanonicalMathCurriculum();
        Learner targetConfiguration = learnerRepository.findById(learnerId).orElseThrow();

        Learner source = new Learner();
        source.setSkillpilotId("personal-plan-export-source");
        source.setSelectedCurriculum(targetConfiguration.getSelectedCurriculum());
        source.setPersonalCurriculum(targetConfiguration.getPersonalCurriculum());
        source.setFollowLearningPlans(true);
        learnerRepository.saveAndFlush(source);

        var scope = learnerService.getPlanningScope(
                source.getSkillpilotId(),
                CANONICAL_MATH_LANDSCAPE_ID);
        String atomicGoalId = scope.openAtomicGoalIds().get(0);
        var blocks = List.of(new com.skillpilot.backend.api.LearnerLearningPlanApi.Block(
                "math-section",
                "learning",
                COMPOSITION_HE_G9_MATH_ROOT_SCOPE_ID,
                "Mathematik",
                java.time.LocalDate.parse("2026-09-01"),
                java.time.LocalDate.parse("2026-09-30"),
                null,
                List.of(atomicGoalId)));
        LearnerLearningPlan sourcePlan = new LearnerLearningPlan();
        sourcePlan.setLearner(source);
        sourcePlan.setLandscapeId(CANONICAL_MATH_LANDSCAPE_ID);
        sourcePlan.setCurriculumId(scope.curriculumId());
        sourcePlan.setScopeFingerprint(learnerService.learningPlanFingerprint(
                source.getSkillpilotId(),
                CANONICAL_MATH_LANDSCAPE_ID,
                blocks));
        sourcePlan.setRevision(7);
        sourcePlan.setPlanLabel("Mein Matheplan");
        sourcePlan.setBlocksJson(objectMapper.writeValueAsString(blocks));
        sourcePlan.setCapturedAt(scope.capturedAt());
        sourcePlan = learnerLearningPlanRepository.saveAndFlush(sourcePlan);
        java.util.UUID sourcePlanId = sourcePlan.getId();

        var signed = learnerService.exportLearner(source.getSkillpilotId());
        assertThat(signed.data().learningPlans())
                .singleElement()
                .satisfies(portable -> {
                    assertThat(portable.landscapeId()).isEqualTo(CANONICAL_MATH_LANDSCAPE_ID);
                    assertThat(portable.planLabel()).isEqualTo("Mein Matheplan");
                    assertThat(portable.blocks().get(0).atomicGoalIds()).containsExactly(atomicGoalId);
                });
        String portableJson = objectMapper.writeValueAsString(signed.data().learningPlans());
        assertThat(portableJson)
                .doesNotContain(source.getSkillpilotId())
                .doesNotContain("teacher")
                .doesNotContain("classId")
                .doesNotContain("planId")
                .doesNotContain("scopeFingerprint")
                .doesNotContain("revision");

        learnerService.importLearner(learnerId, signed);

        Learner imported = learnerRepository.findById(learnerId).orElseThrow();
        assertThat(imported.getFollowLearningPlans()).isTrue();
        assertThat(learnerLearningPlanRepository
                        .findByLearner_SkillpilotIdOrderByLandscapeIdAsc(learnerId))
                .singleElement()
                .satisfies(plan -> {
                    assertThat(plan.getId()).isNotEqualTo(sourcePlanId);
                    assertThat(plan.getRevision()).isEqualTo(1);
                    assertThat(plan.getPlanLabel()).isEqualTo("Mein Matheplan");
                    assertThat(plan.getBlocksJson()).contains(atomicGoalId);
                });
    }

    @Test
    void importAcceptsLegacySignedPayloadWithoutLearningPlansField() throws Exception {
        Learner source = new Learner();
        source.setSkillpilotId("legacy-no-plan-field-source");
        learnerRepository.saveAndFlush(source);
        var data = new com.skillpilot.backend.api.LearnerDataDTO(
                source,
                Map.of(),
                List.of(),
                Set.of(),
                null);

        var legacyJson = objectMapper.createObjectNode();
        legacyJson.set("learner", objectMapper.valueToTree(source));
        legacyJson.set("mastery", objectMapper.valueToTree(Map.of()));
        legacyJson.set("plannedGoals", objectMapper.valueToTree(List.of()));
        legacyJson.set("copySources", objectMapper.valueToTree(Set.of()));
        String legacySerialized = objectMapper.writeValueAsString(legacyJson);
        String currentSerialized = objectMapper.writeValueAsString(data);
        assertThat(currentSerialized).isEqualTo(legacySerialized);
        assertThat(currentSerialized).doesNotContain("learningPlans", "followLearningPlans");

        String signingSecret = (String) ReflectionTestUtils.getField(learnerService, "signingSecret");
        javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
        mac.init(new javax.crypto.spec.SecretKeySpec(
                signingSecret.getBytes(java.nio.charset.StandardCharsets.UTF_8),
                "HmacSHA256"));
        String legacySignature = java.util.HexFormat.of().formatHex(mac.doFinal(
                legacySerialized.getBytes(java.nio.charset.StandardCharsets.UTF_8)));

        assertThatCode(() -> learnerService.importLearner(
                        learnerId,
                        new com.skillpilot.backend.api.SignedLearnerDataDTO(data, legacySignature)))
                .doesNotThrowAnyException();
    }

    @Test
    void signedPlanImportRejectsAtomicGoalsOutsideThePersonalSubjectScope() {
        selectCompletedCanonicalMathCurriculum();
        Learner targetConfiguration = learnerRepository.findById(learnerId).orElseThrow();
        Learner source = new Learner();
        source.setSkillpilotId("invalid-plan-source");
        source.setSelectedCurriculum(targetConfiguration.getSelectedCurriculum());
        source.setPersonalCurriculum(targetConfiguration.getPersonalCurriculum());
        learnerRepository.saveAndFlush(source);

        var invalidBlock = new com.skillpilot.backend.api.LearnerLearningPlanApi.Block(
                "foreign-section",
                "learning",
                COMPOSITION_HE_G9_MATH_ROOT_SCOPE_ID,
                "Fachfremder Inhalt",
                java.time.LocalDate.parse("2026-09-01"),
                java.time.LocalDate.parse("2026-09-30"),
                null,
                List.of(CANONICAL_PHYSICS_ROOT_SCOPE_ID));
        var portable = new com.skillpilot.backend.api.LearnerLearningPlanApi.PortablePlan(
                CANONICAL_MATH_LANDSCAPE_ID,
                "Manipulierter Plan",
                List.of(invalidBlock));
        var data = new com.skillpilot.backend.api.LearnerDataDTO(
                source,
                Map.of(),
                List.of(),
                Set.of(),
                List.of(portable));
        String signature = ReflectionTestUtils.invokeMethod(
                learnerService,
                "calculateSignature",
                data);

        assertThatThrownBy(() -> learnerService.importLearner(
                        learnerId,
                        new com.skillpilot.backend.api.SignedLearnerDataDTO(data, signature)))
                .isInstanceOfSatisfying(ResponseStatusException.class, exception ->
                        assertThat(exception.getStatusCode())
                                .isEqualTo(org.springframework.http.HttpStatus.BAD_REQUEST));
        assertThat(learnerLearningPlanRepository
                .findByLearner_SkillpilotIdOrderByLandscapeIdAsc(learnerId)).isEmpty();
    }

    @Test
    void learningPlanBlockFocusMustStayInSubjectAndContainItsMaterializedAtoms() {
        selectCompletedCanonicalMathCurriculum();
        var scope = learnerService.getPlanningScope(
                learnerId,
                CANONICAL_MATH_LANDSCAPE_ID);
        assertThat(scope.scopeAtomicGoalIds()).contains(CANONICAL_MATH_ORIENTATION_ID);

        var validBlock = new com.skillpilot.backend.api.LearnerLearningPlanApi.Block(
                "math-root",
                "learning",
                COMPOSITION_HE_G9_MATH_ROOT_SCOPE_ID,
                "Mathematik",
                java.time.LocalDate.parse("2026-09-01"),
                java.time.LocalDate.parse("2026-09-30"),
                null,
                List.of(CANONICAL_MATH_ORIENTATION_ID));
        assertThatCode(() -> learnerService.validateLearningPlanBlockFoci(
                        learnerId,
                        CANONICAL_MATH_LANDSCAPE_ID,
                        List.of(validBlock)))
                .doesNotThrowAnyException();

        var foreignFocus = new com.skillpilot.backend.api.LearnerLearningPlanApi.Block(
                "foreign-focus",
                "learning",
                CANONICAL_PHYSICS_ROOT_SCOPE_ID,
                "Falsches Fach",
                validBlock.startDate(),
                validBlock.endDate(),
                null,
                validBlock.atomicGoalIds());
        var unrelatedMathFocus = new com.skillpilot.backend.api.LearnerLearningPlanApi.Block(
                "unrelated-focus",
                "learning",
                COMPOSITION_J8_SCOPE_ID,
                "Falscher Abschnitt",
                validBlock.startDate(),
                validBlock.endDate(),
                null,
                validBlock.atomicGoalIds());

        for (var invalid : List.of(foreignFocus, unrelatedMathFocus)) {
            assertThatThrownBy(() -> learnerService.validateLearningPlanBlockFoci(
                            learnerId,
                            CANONICAL_MATH_LANDSCAPE_ID,
                            List.of(invalid)))
                    .isInstanceOfSatisfying(ResponseStatusException.class, exception ->
                            assertThat(exception.getStatusCode())
                                    .isEqualTo(org.springframework.http.HttpStatus.BAD_REQUEST));
        }
    }

    @Test
    void learningPlanActivationGuardPreservesAnotherUnmasteredActiveGoal() {
        selectCompletedCanonicalMathCurriculum();
        var scope = learnerService.getPlanningScope(learnerId, CANONICAL_MATH_LANDSCAPE_ID);
        assertThat(scope.openAtomicGoalIds()).hasSizeGreaterThan(1);
        String activeGoalId = scope.openAtomicGoalIds().get(0);
        String proposedGoalId = scope.openAtomicGoalIds().get(1);
        learnerService.setPlannedGoals(learnerId, Set.of(COMPOSITION_HE_G9_MATH_ROOT_SCOPE_ID));
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setActiveGoalId(activeGoalId);
        learner.setLearningState(LearningState.TEACHING);
        learnerRepository.saveAndFlush(learner);

        assertThatThrownBy(() -> learnerService.assertLearningPlanMayActivateGoal(
                        learnerId,
                        proposedGoalId))
                .isInstanceOfSatisfying(ResponseStatusException.class, exception ->
                        assertThat(exception.getStatusCode())
                                .isEqualTo(org.springframework.http.HttpStatus.CONFLICT));
        assertThat(learnerRepository.findById(learnerId).orElseThrow().getActiveGoalId())
                .isEqualTo(activeGoalId);
        assertThat(plannedGoalRepository.findByLearner_SkillpilotId(learnerId))
                .extracting(PlannedGoal::getGoalId)
                .containsExactly(COMPOSITION_HE_G9_MATH_ROOT_SCOPE_ID);

        assertThatCode(() -> learnerService.assertLearningPlanMayActivateGoal(
                        learnerId,
                        activeGoalId))
                .doesNotThrowAnyException();

        masteryRepository.saveAndFlush(new Mastery(learner, activeGoalId, 1.0));
        assertThatCode(() -> learnerService.assertLearningPlanMayActivateGoal(
                        learnerId,
                        proposedGoalId))
                .doesNotThrowAnyException();
    }

    @Test
    void learnerPlanPersistsPrerequisitesBeforeDependentsWithoutReorderingUnrelatedBlocks() {
        selectCompletedCanonicalMathCurriculum();
        var scope = learnerService.getPlanningScope(learnerId, CANONICAL_MATH_LANDSCAPE_ID);
        assertThat(scope.openAtomicGoalIds())
                .contains(CANONICAL_CHOOSE_REPRESENTATION_ID, CANONICAL_CREATE_REPRESENTATION_ID);
        var reversed = new com.skillpilot.backend.api.LearnerLearningPlanApi.Block(
                "representations",
                "learning",
                CANONICAL_REPRESENTATION_CLUSTER_ID,
                "Darstellungen",
                java.time.LocalDate.parse("2026-09-01"),
                java.time.LocalDate.parse("2026-09-02"),
                null,
                List.of(CANONICAL_CREATE_REPRESENTATION_ID, CANONICAL_CHOOSE_REPRESENTATION_ID));

        var created = learnerLearningPlanService.upsert(
                learnerId,
                CANONICAL_MATH_LANDSCAPE_ID,
                new com.skillpilot.backend.api.LearnerLearningPlanApi.UpsertRequest(
                        0L,
                        "Topologischer Plan",
                        List.of(reversed)),
                java.time.LocalDate.parse("2026-09-01"));

        assertThat(created.blocks().get(0).atomicGoalIds()).containsExactly(
                CANONICAL_CHOOSE_REPRESENTATION_ID,
                CANONICAL_CREATE_REPRESENTATION_ID);
        assertThat(created.metrics().dueThroughToday()).isEqualTo(1);
        assertThat(learnerLearningPlanRepository
                        .findByLearner_SkillpilotIdAndLandscapeId(
                                learnerId,
                                CANONICAL_MATH_LANDSCAPE_ID))
                .get()
                .extracting(LearnerLearningPlan::getBlocksJson)
                .asString()
                .contains(CANONICAL_CHOOSE_REPRESENTATION_ID)
                .contains(CANONICAL_CREATE_REPRESENTATION_ID);
    }

    @Test
    void learnerPlanKeepsAnAlreadyDueValidCrossBlockOrderExactly() {
        selectCompletedCanonicalMathCurriculum();
        var prerequisiteBlock = new com.skillpilot.backend.api.LearnerLearningPlanApi.Block(
                "same-due-prerequisites",
                "learning",
                null,
                "Voraussetzungen am selben Tag",
                java.time.LocalDate.parse("2026-09-07"),
                java.time.LocalDate.parse("2026-09-09"),
                null,
                List.of(
                        CANONICAL_MATH_SEK_ONE_ORIENTATION_ID,
                        CANONICAL_CHOOSE_REPRESENTATION_ID,
                        J8_EXAM_TASK_3_ID));
        var dependentBlock = new com.skillpilot.backend.api.LearnerLearningPlanApi.Block(
                "later-dependent",
                "learning",
                null,
                "Spaeteres abhaengiges Ziel",
                java.time.LocalDate.parse("2026-09-08"),
                java.time.LocalDate.parse("2026-09-08"),
                null,
                List.of(CANONICAL_CREATE_REPRESENTATION_ID));

        assertThat(learnerService.orderLearningPlanBlocksByPrerequisites(
                        learnerId,
                        List.of(prerequisiteBlock, dependentBlock)))
                .containsExactly(prerequisiteBlock, dependentBlock);
    }

    @Test
    void learnerPlanRepairsPrerequisiteDueAfterDependentAcrossFixedBlocks() {
        selectCompletedCanonicalMathCurriculum();
        var prerequisiteBlock = new com.skillpilot.backend.api.LearnerLearningPlanApi.Block(
                "prerequisite-block",
                "learning",
                null,
                "Voraussetzung und unabhaengiges Ziel",
                java.time.LocalDate.parse("2026-09-07"),
                java.time.LocalDate.parse("2026-09-08"),
                null,
                List.of(
                        CANONICAL_MATH_SEK_ONE_ORIENTATION_ID,
                        CANONICAL_CHOOSE_REPRESENTATION_ID));
        var dependentBlock = new com.skillpilot.backend.api.LearnerLearningPlanApi.Block(
                "dependent-block",
                "learning",
                null,
                "Abhaengiges Ziel",
                java.time.LocalDate.parse("2026-09-07"),
                java.time.LocalDate.parse("2026-09-08"),
                null,
                List.of(CANONICAL_CREATE_REPRESENTATION_ID));

        var ordered = learnerService.orderLearningPlanBlocksByPrerequisites(
                learnerId,
                List.of(prerequisiteBlock, dependentBlock));

        assertThat(ordered).extracting(com.skillpilot.backend.api.LearnerLearningPlanApi.Block::id)
                .containsExactly("prerequisite-block", "dependent-block");
        assertThat(ordered.get(0).startDate()).isEqualTo(prerequisiteBlock.startDate());
        assertThat(ordered.get(0).endDate()).isEqualTo(prerequisiteBlock.endDate());
        assertThat(ordered.get(0).atomicGoalIds()).containsExactly(
                CANONICAL_CHOOSE_REPRESENTATION_ID,
                CANONICAL_MATH_SEK_ONE_ORIENTATION_ID);
        assertThat(ordered.get(1)).isEqualTo(dependentBlock);
        assertThat(learnerService.orderLearningPlanBlocksByPrerequisites(learnerId, ordered))
                .containsExactlyElementsOf(ordered);
    }

    @Test
    void learnerPlanCombinesEarlierAndLaterRepairAcrossFixedBlocks() {
        var blockA = learningPlanBlock(
                "block-a",
                "2026-09-07",
                "2026-09-08",
                List.of("a0", "a1"));
        var blockB = learningPlanBlock(
                "block-b",
                "2026-09-07",
                "2026-09-08",
                List.of("b0", "b1"));
        Map<String, Set<String>> prerequisitesByDependent = Map.of(
                "a0", Set.of("b0", "b1"),
                "a1", Set.of("b1"),
                "b0", Set.of(),
                "b1", Set.of());

        var ordered = learnerService.orderLearningPlanBlocksForPrerequisites(
                List.of(blockA, blockB),
                prerequisitesByDependent);

        assertThat(ordered).extracting(com.skillpilot.backend.api.LearnerLearningPlanApi.Block::id)
                .containsExactly("block-a", "block-b");
        assertThat(ordered.get(0).atomicGoalIds()).containsExactly("a1", "a0");
        assertThat(ordered.get(1).atomicGoalIds()).containsExactly("b1", "b0");
    }

    @Test
    void learnerPlanRejectsCumulativeTuesdayConflictThatPerBlockMidpointsMiss() {
        var prerequisiteBlock = learningPlanBlock(
                "prerequisite-block",
                "2026-09-07",
                "2026-09-11",
                List.of("prerequisite"));
        var dependentBlock = learningPlanBlock(
                "dependent-block",
                "2026-09-07",
                "2026-09-11",
                List.of("dependent"));

        assertThat(LearnerLearningPlanService.dueAtomicGoalIdsForSchedule(
                List.of(prerequisiteBlock, dependentBlock),
                LocalDate.parse("2026-09-08")))
                .containsExactly("dependent");
        assertThatThrownBy(() -> learnerService.orderLearningPlanBlocksForPrerequisites(
                        List.of(prerequisiteBlock, dependentBlock),
                        Map.of(
                                "prerequisite", Set.of(),
                                "dependent", Set.of("prerequisite"))))
                .isInstanceOf(LearningPlanPrerequisiteScheduleConflictException.class);
    }

    @Test
    void learnerPlanRepairsPositionViolationEvenWhenCumulativeDownSetIsSafe() {
        var prerequisiteBlock = learningPlanBlock(
                "dense-prerequisite-block",
                "2026-09-01",
                "2026-09-02",
                List.of("unrelated-0", "unrelated-1", "prerequisite"));
        var dependentBlock = learningPlanBlock(
                "dependent-block",
                "2026-09-01",
                "2026-09-02",
                List.of("dependent"));

        assertThat(LearnerLearningPlanService.dueAtomicGoalIdsForSchedule(
                List.of(prerequisiteBlock, dependentBlock),
                LocalDate.parse("2026-09-01")))
                .containsExactly("unrelated-0", "unrelated-1");

        var ordered = learnerService.orderLearningPlanBlocksForPrerequisites(
                List.of(prerequisiteBlock, dependentBlock),
                Map.of(
                        "unrelated-0", Set.of(),
                        "unrelated-1", Set.of(),
                        "prerequisite", Set.of(),
                        "dependent", Set.of("prerequisite")));

        assertThat(ordered.get(0).atomicGoalIds())
                .containsExactly("prerequisite", "unrelated-0", "unrelated-1");
        assertThat(ordered.get(1)).isEqualTo(dependentBlock);
    }

    @Test
    void learnerPlanUsesCumulativeViolationToPullPrerequisiteForward() {
        var prerequisiteBlock = learningPlanBlock(
                "prerequisite-block",
                "2026-09-01",
                "2026-09-03",
                List.of("independent-a", "prerequisite"));
        var dependentBlock = learningPlanBlock(
                "dependent-block",
                "2026-09-01",
                "2026-09-03",
                List.of("independent-b", "dependent"));

        assertThat(LearnerLearningPlanService.dueAtomicGoalIdsForSchedule(
                List.of(prerequisiteBlock, dependentBlock),
                LocalDate.parse("2026-09-02")))
                .containsExactly("independent-a", "independent-b", "dependent");

        var ordered = learnerService.orderLearningPlanBlocksForPrerequisites(
                List.of(prerequisiteBlock, dependentBlock),
                Map.of(
                        "independent-a", Set.of(),
                        "prerequisite", Set.of(),
                        "independent-b", Set.of(),
                        "dependent", Set.of("prerequisite")));

        assertThat(ordered.get(0).atomicGoalIds())
                .containsExactly("prerequisite", "independent-a");
        assertThat(ordered.get(1)).isEqualTo(dependentBlock);
    }

    @Test
    void learnerPlanRejectsMoreThanOneThousandActiveWorkdaysBeforeDueSweep() {
        LocalDate start = LocalDate.parse("2026-01-01");
        var oversizedBlock = new com.skillpilot.backend.api.LearnerLearningPlanApi.Block(
                "oversized-block",
                "learning",
                null,
                "oversized-block",
                start,
                start.plusDays(1_400),
                null,
                List.of("goal"));

        assertThatThrownBy(() -> learnerService.orderLearningPlanBlocksForPrerequisites(
                        List.of(oversizedBlock),
                        Map.of("goal", Set.of())))
                .isInstanceOf(LearningPlanPrerequisiteScheduleConflictException.class);
    }

    @Test
    void learnerPlanRejectsScheduleChecksBeyondTheSharedOperationBudget() {
        List<String> goalIds = new ArrayList<>();
        Map<String, Set<String>> prerequisitesByDependent = new LinkedHashMap<>();
        for (int index = 0; index < 320; index++) {
            String goalId = "budget-goal-" + index;
            prerequisitesByDependent.put(goalId, new LinkedHashSet<>(goalIds));
            goalIds.add(goalId);
        }
        LocalDate start = LocalDate.parse("2026-01-01");
        var denseBlock = learningPlanBlock(
                "dense-budget-block",
                start.toString(),
                start.plusDays(1_399).toString(),
                goalIds);

        assertThatThrownBy(() -> learnerService.orderLearningPlanBlocksForPrerequisites(
                        List.of(denseBlock),
                        prerequisitesByDependent))
                .isInstanceOf(LearningPlanPrerequisiteScheduleConflictException.class);
    }

    @Test
    void learnerPlanRejectsDependentScheduledBeforeItsPrerequisiteAcrossBlocks() {
        selectCompletedCanonicalMathCurriculum();
        var dependent = new com.skillpilot.backend.api.LearnerLearningPlanApi.Block(
                "dependent",
                "learning",
                null,
                "Abhaengiges Ziel",
                java.time.LocalDate.parse("2026-09-01"),
                java.time.LocalDate.parse("2026-09-01"),
                null,
                List.of(CANONICAL_CREATE_REPRESENTATION_ID));
        var prerequisite = new com.skillpilot.backend.api.LearnerLearningPlanApi.Block(
                "prerequisite",
                "learning",
                null,
                "Voraussetzung",
                java.time.LocalDate.parse("2026-09-02"),
                java.time.LocalDate.parse("2026-09-02"),
                null,
                List.of(CANONICAL_CHOOSE_REPRESENTATION_ID));

        assertThatThrownBy(() -> learnerService.orderLearningPlanBlocksByPrerequisites(
                        learnerId,
                        List.of(dependent, prerequisite)))
                .isInstanceOfSatisfying(
                        LearningPlanPrerequisiteScheduleConflictException.class,
                        exception ->
                        assertThat(exception.getStatusCode())
                                .isEqualTo(org.springframework.http.HttpStatus.BAD_REQUEST));
    }

    @Test
    void followedPlanStartsExplicitlyThenHandsOffAfterCompletionEvenWithAutopilotDisabled() {
        prepareRepresentationLearningPlan();
        learnerService.setPreferences(learnerId, "SEQUENTIAL", false, null, null, true);

        var beforeExplicitStart = learnerService.getLearnerState(learnerId);
        assertThat(beforeExplicitStart.activeGoal()).isNull();
        assertThat(learnerRepository.findById(learnerId).orElseThrow().getActiveGoalId()).isNull();

        learnerService.setActiveGoal(learnerId, CANONICAL_CHOOSE_REPRESENTATION_ID);
        var completion = learnerService.setMastery(
                learnerId,
                new MasteryUpdateRequest(
                        Map.of(CANONICAL_CHOOSE_REPRESENTATION_ID, 1.0),
                        CANONICAL_CHOOSE_REPRESENTATION_ID));

        assertThat(completion.activeGoal()).isNotNull();
        assertThat(completion.activeGoal().id())
                .isEqualTo(CANONICAL_CREATE_REPRESENTATION_ID);
        assertThat(learnerRepository.findById(learnerId).orElseThrow().getActiveGoalId())
                .isEqualTo(CANONICAL_CREATE_REPRESENTATION_ID);
        assertThat(plannedGoalRepository.findByLearner_SkillpilotId(learnerId))
                .extracting(PlannedGoal::getGoalId)
                .containsExactly(CANONICAL_REPRESENTATION_CLUSTER_ID);
    }

    @Test
    void completingAnUnrelatedGoalDoesNotStartTheFirstGoalOfAStoredPlan() {
        prepareRepresentationLearningPlan();
        learnerService.setPreferences(learnerId, "SEQUENTIAL", false, null, null, true);
        learnerService.setPlannedGoals(learnerId, Set.of(CANONICAL_MATH_ROOT_SCOPE_ID));
        assertThat(learnerService.getRichFrontier(learnerId))
                .extracting(FrontierGoal::id)
                .contains(CANONICAL_MATH_SEK_ONE_ORIENTATION_ID);
        learnerService.setActiveGoal(learnerId, CANONICAL_MATH_SEK_ONE_ORIENTATION_ID);

        var completion = learnerService.setMastery(
                learnerId,
                new MasteryUpdateRequest(
                        Map.of(CANONICAL_MATH_SEK_ONE_ORIENTATION_ID, 1.0),
                        CANONICAL_MATH_SEK_ONE_ORIENTATION_ID));

        assertThat(completion.activeGoal()).isNull();
        assertThat(learnerRepository.findById(learnerId).orElseThrow().getActiveGoalId()).isNull();
        assertThat(plannedGoalRepository.findByLearner_SkillpilotId(learnerId))
                .extracting(PlannedGoal::getGoalId)
                .containsExactly(CANONICAL_MATH_ROOT_SCOPE_ID);
    }

    @Test
    void followedPlanKeepsAnUnfinishedActiveGoal() {
        prepareRepresentationLearningPlan();
        learnerService.setPreferences(learnerId, "SEQUENTIAL", true, null, null, true);
        learnerService.setActiveGoal(learnerId, CANONICAL_CHOOSE_REPRESENTATION_ID);

        var partial = learnerService.setMastery(
                learnerId,
                new MasteryUpdateRequest(
                        Map.of(CANONICAL_CHOOSE_REPRESENTATION_ID, 0.5),
                        CANONICAL_CHOOSE_REPRESENTATION_ID));

        assertThat(partial.activeGoal()).isNotNull();
        assertThat(partial.activeGoal().id())
                .isEqualTo(CANONICAL_CHOOSE_REPRESENTATION_ID);
        assertThat(learnerRepository.findById(learnerId).orElseThrow().getActiveGoalId())
                .isEqualTo(CANONICAL_CHOOSE_REPRESENTATION_ID);
    }

    @Test
    void completionHandsOffToTheOnlyEligiblePlanInAnotherPersonalizedSubject() {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setPersonalCurriculum(completedPersonalizationConfig("""
                {
                  "a0e13c56-c25f-4742-9272-3a1a603ee52e": {
                    "selected": true,
                    "filterId": "DE-HE",
                    "stage": "CrossStage",
                    "durationModel": "G9"
                  },
                  "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced": {
                    "selected": true,
                    "filterId": "GK"
                  },
                  "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a": {
                    "selected": true,
                    "filterId": "GK"
                  }
                }
                """));
        learnerRepository.saveAndFlush(learner);
        masteryRepository.saveAndFlush(new Mastery(learner, CANONICAL_MATH_ORIENTATION_ID, 1.0));
        learnerService.setPlannedGoals(learnerId, Set.of(CANONICAL_REPRESENTATION_CLUSTER_ID));
        assertThat(learnerService.getUncompactedRichFrontierForFocus(
                        learnerId,
                        List.of(CANONICAL_REPRESENTATION_CLUSTER_ID)))
                .extracting(FrontierGoal::id)
                .contains(CANONICAL_CHOOSE_REPRESENTATION_ID);
        assertThat(learnerService.getPlanningScope(learnerId, CANONICAL_PHYSICS_LANDSCAPE_ID)
                        .openAtomicGoalIds())
                .contains(CANONICAL_PHYSICS_ORIENTATION_ID);

        LocalDate planDate = LocalDate.parse("2026-09-01");
        ZoneId berlin = ZoneId.of("Europe/Berlin");
        ReflectionTestUtils.setField(
                learnerService,
                "learningPlanClock",
                Clock.fixed(planDate.atStartOfDay(berlin).toInstant(), berlin));
        learnerLearningPlanService.upsert(
                learnerId,
                CANONICAL_MATH_LANDSCAPE_ID,
                new com.skillpilot.backend.api.LearnerLearningPlanApi.UpsertRequest(
                        0L,
                        "Mathematik",
                        List.of(new com.skillpilot.backend.api.LearnerLearningPlanApi.Block(
                                "math",
                                "learning",
                                CANONICAL_REPRESENTATION_CLUSTER_ID,
                                "Mathematik",
                                planDate,
                                planDate,
                                null,
                                List.of(CANONICAL_CHOOSE_REPRESENTATION_ID)))),
                planDate);
        learnerLearningPlanService.upsert(
                learnerId,
                CANONICAL_PHYSICS_LANDSCAPE_ID,
                new com.skillpilot.backend.api.LearnerLearningPlanApi.UpsertRequest(
                        0L,
                        "Physik",
                        List.of(new com.skillpilot.backend.api.LearnerLearningPlanApi.Block(
                                "physics",
                                "learning",
                                CANONICAL_PHYSICS_ROOT_SCOPE_ID,
                                "Physik",
                                planDate,
                                planDate,
                                null,
                                List.of(CANONICAL_PHYSICS_ORIENTATION_ID)))),
                planDate);
        learnerService.setPreferences(learnerId, "SEQUENTIAL", false, null, null, true);
        learnerService.setActiveGoal(learnerId, CANONICAL_CHOOSE_REPRESENTATION_ID);

        var completion = learnerService.setMastery(
                learnerId,
                new MasteryUpdateRequest(
                        Map.of(CANONICAL_CHOOSE_REPRESENTATION_ID, 1.0),
                        CANONICAL_CHOOSE_REPRESENTATION_ID));

        assertThat(completion.activeGoal()).isNotNull();
        assertThat(completion.activeGoal().id()).isEqualTo(CANONICAL_PHYSICS_ORIENTATION_ID);
        assertThat(landscapeService.getLandscapeIdForGoal(completion.activeGoal().id()))
                .isEqualTo(CANONICAL_PHYSICS_LANDSCAPE_ID);
        assertThat(plannedGoalRepository.findByLearner_SkillpilotId(learnerId))
                .extracting(PlannedGoal::getGoalId)
                .containsExactly(CANONICAL_PHYSICS_ROOT_SCOPE_ID);
    }

    @Test
    void followingWithoutAStoredPlanSuppressesGenericAutopilotButLeavesManualFrontier() {
        selectCompletedCanonicalMathCurriculum();
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        masteryRepository.saveAndFlush(new Mastery(learner, CANONICAL_MATH_ORIENTATION_ID, 1.0));
        learnerService.setPlannedGoals(learnerId, Set.of(CANONICAL_REPRESENTATION_CLUSTER_ID));
        learnerService.setPreferences(learnerId, "SEQUENTIAL", true, null, null, true);

        var state = learnerService.getLearnerState(learnerId);

        assertThat(state.activeGoal()).isNull();
        assertThat(state.frontier())
                .extracting(FrontierGoal::id)
                .contains(CANONICAL_CHOOSE_REPRESENTATION_ID);
        assertThat(state.nextAllowedActions()).contains("setActiveGoal");
    }

    @Test
    void stalePlanFingerprintFailsClosedAfterCompletion() {
        prepareRepresentationLearningPlan();
        LearnerLearningPlan plan = learnerLearningPlanRepository
                .findByLearner_SkillpilotIdAndLandscapeId(
                        learnerId,
                        CANONICAL_MATH_LANDSCAPE_ID)
                .orElseThrow();
        plan.setScopeFingerprint("sha256:stale-structure");
        learnerLearningPlanRepository.saveAndFlush(plan);
        learnerService.setPreferences(learnerId, "SEQUENTIAL", true, null, null, true);
        learnerService.setActiveGoal(learnerId, CANONICAL_CHOOSE_REPRESENTATION_ID);

        var completion = learnerService.setMastery(
                learnerId,
                new MasteryUpdateRequest(
                        Map.of(CANONICAL_CHOOSE_REPRESENTATION_ID, 1.0),
                        CANONICAL_CHOOSE_REPRESENTATION_ID));

        assertThat(completion.activeGoal()).isNull();
        assertThat(learnerRepository.findById(learnerId).orElseThrow().getActiveGoalId()).isNull();
        assertThat(plannedGoalRepository.findByLearner_SkillpilotId(learnerId))
                .extracting(PlannedGoal::getGoalId)
                .containsExactly(CANONICAL_REPRESENTATION_CLUSTER_ID);
    }

    @Test
    void planPackageActivationEnablesFollowingAndSelectsTheFirstGoalWithoutAnotherAction() {
        selectCompletedCanonicalMathCurriculum();
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        masteryRepository.saveAndFlush(new Mastery(learner, CANONICAL_MATH_ORIENTATION_ID, 1.0));
        LocalDate planDate = LocalDate.now(ZoneId.of("Europe/Berlin"));
        var block = new com.skillpilot.backend.api.LearnerLearningPlanApi.Block(
                "representations",
                "learning",
                CANONICAL_REPRESENTATION_CLUSTER_ID,
                "Darstellungen",
                planDate,
                planDate,
                null,
                List.of(CANONICAL_CHOOSE_REPRESENTATION_ID));

        var activation = learnerLearningPlanService.activatePlans(
                learnerId,
                new com.skillpilot.backend.api.LearnerLearningPlanApi.ActivateRequest(
                        planDate,
                        List.of(new com.skillpilot.backend.api.LearnerLearningPlanApi.ActivationPlan(
                                CANONICAL_MATH_LANDSCAPE_ID,
                                0L,
                                "Mathematik",
                                List.of(block)))));

        Learner activated = learnerRepository.findById(learnerId).orElseThrow();
        assertThat(activation.followLearningPlans()).isTrue();
        assertThat(activation.selectedLandscapeId()).isEqualTo(CANONICAL_MATH_LANDSCAPE_ID);
        assertThat(activation.activeGoalId()).isEqualTo(CANONICAL_CHOOSE_REPRESENTATION_ID);
        assertThat(activation.state().activeGoal().id()).isEqualTo(CANONICAL_CHOOSE_REPRESENTATION_ID);
        assertThat(activated.getFollowLearningPlans()).isTrue();
        assertThat(activated.getActiveGoalId()).isEqualTo(CANONICAL_CHOOSE_REPRESENTATION_ID);
        assertThat(plannedGoalRepository.findByLearner_SkillpilotId(learnerId))
                .extracting(PlannedGoal::getGoalId)
                .containsExactly(CANONICAL_REPRESENTATION_CLUSTER_ID);
    }

    @Test
    void learningPlanTransitionParksWithoutChangingMasteryAndUsesOneRevision() {
        prepareRepresentationLearningPlan();
        learnerService.setActiveGoal(learnerId, CANONICAL_CHOOSE_REPRESENTATION_ID);
        Learner before = learnerRepository.findById(learnerId).orElseThrow();
        long revisionBeforeParking = before.getCoachStateRevision();
        Map<String, Double> masteryBeforeParking = new LinkedHashMap<>(
                learnerService.getMastery(learnerId));

        LearnerService.LearningPlanTransitionResult transition =
                learnerService.applyLearningPlanTransition(
                        learnerId,
                        true,
                        true,
                        null,
                        null,
                        false,
                        "LEARNING_PLAN_PACKAGE_ACTIVATED");

        Learner parked = learnerRepository.findById(learnerId).orElseThrow();
        assertThat(transition.changed()).isTrue();
        assertThat(parked.getFollowLearningPlans()).isTrue();
        assertThat(parked.getActiveGoalId()).isNull();
        assertThat(parked.getLearningState()).isEqualTo(LearningState.FRONTIER);
        assertThat(parked.getCoachStateRevision()).isEqualTo(revisionBeforeParking + 1);
        assertThat(learnerService.getMastery(learnerId)).isEqualTo(masteryBeforeParking);
        assertThat(plannedGoalRepository.findByLearner_SkillpilotId(learnerId))
                .extracting(PlannedGoal::getGoalId)
                .containsExactly(CANONICAL_REPRESENTATION_CLUSTER_ID);
    }

    @Test
    void completedAnchorPlanWinsThenCrossSubjectHandoffUsesOldestDueCandidate() {
        var anchor = new LearnerService.LearningPlanHandoffCandidate(
                java.util.UUID.fromString("00000000-0000-0000-0000-000000000001"),
                "math",
                "math-focus",
                "math-next",
                LocalDate.parse("2026-09-01"),
                LocalDate.parse("2026-09-08"),
                true);
        var unrelated = new LearnerService.LearningPlanHandoffCandidate(
                java.util.UUID.fromString("00000000-0000-0000-0000-000000000002"),
                "physics",
                "physics-focus",
                "physics-next",
                LocalDate.parse("2026-08-20"),
                LocalDate.parse("2026-08-27"),
                false);
        var secondAnchor = new LearnerService.LearningPlanHandoffCandidate(
                java.util.UUID.fromString("00000000-0000-0000-0000-000000000003"),
                "chemistry",
                "chemistry-focus",
                "chemistry-next",
                LocalDate.parse("2026-09-01"),
                LocalDate.parse("2026-09-05"),
                true);
        var secondUnrelated = new LearnerService.LearningPlanHandoffCandidate(
                java.util.UUID.fromString("00000000-0000-0000-0000-000000000004"),
                "biology",
                "biology-focus",
                "biology-next",
                LocalDate.parse("2026-08-25"),
                LocalDate.parse("2026-08-30"),
                false);

        assertThat(LearnerService.selectLearningPlanHandoffCandidate(true, List.of(anchor, unrelated)))
                .contains(anchor);
        assertThat(LearnerService.selectLearningPlanHandoffCandidate(true, List.of(unrelated)))
                .contains(unrelated);
        assertThat(LearnerService.selectLearningPlanHandoffCandidate(false, List.of(unrelated)))
                .isEmpty();
        assertThat(LearnerService.selectLearningPlanHandoffCandidate(
                        true,
                        List.of(secondUnrelated, unrelated)))
                .contains(unrelated);
        assertThat(LearnerService.selectLearningPlanHandoffCandidate(true, List.of(anchor, secondAnchor)))
                .contains(secondAnchor);
    }

    @Test
    void learningPlanFingerprintChangesWhenStructureChangesWithoutChangingAtomicScope() {
        var scope = new com.skillpilot.backend.api.LearnerPlanningScopeResponse(
                "curriculum",
                "math",
                List.of("atom-a", "atom-b"),
                2,
                0,
                List.of("atom-a", "atom-b"),
                Instant.parse("2026-09-01T00:00:00Z"));
        var block = new com.skillpilot.backend.api.LearnerLearningPlanApi.Block(
                "block",
                "learning",
                "focus",
                "Plan",
                LocalDate.parse("2026-09-01"),
                LocalDate.parse("2026-09-02"),
                null,
                List.of("atom-a", "atom-b"));
        Map<String, LearningGoal> base = new LinkedHashMap<>();
        base.put("root", goal("root", List.of(), List.of("focus")));
        base.put("focus", goal("focus", List.of(), List.of("atom-a", "atom-b")));
        base.put("atom-a", goal("atom-a", List.of(), List.of()));
        base.put("atom-b", goal("atom-b", List.of("atom-a"), List.of()));

        String fingerprint = learnerService.computeLearningPlanFingerprint(
                scope,
                base,
                List.of(block),
                Map.of("focus", List.of("atom-a", "atom-b")));

        Map<String, LearningGoal> changedRequires = new LinkedHashMap<>(base);
        changedRequires.put("atom-b", goal("atom-b", List.of(), List.of()));
        Map<String, LearningGoal> changedContains = new LinkedHashMap<>(base);
        changedContains.put("root", goal("root", List.of(), List.of("focus", "atom-a")));

        assertThat(learnerService.computeLearningPlanFingerprint(
                        scope,
                        changedRequires,
                        List.of(block),
                        Map.of("focus", List.of("atom-a", "atom-b"))))
                .isNotEqualTo(fingerprint);
        assertThat(learnerService.computeLearningPlanFingerprint(
                        scope,
                        changedContains,
                        List.of(block),
                        Map.of("focus", List.of("atom-a", "atom-b"))))
                .isNotEqualTo(fingerprint);
        assertThat(learnerService.computeLearningPlanFingerprint(
                        scope,
                        base,
                        List.of(block),
                        Map.of("focus", List.of("atom-b"))))
                .isNotEqualTo(fingerprint);
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
        assertThat(state.stateMachine().curriculumOptions())
                .extracting(option -> option.getCurriculumId())
                .contains(CANONICAL_GYMNASIUM_ROOT_ID)
                .doesNotContain(LEGACY_HIDDEN_CURRICULUM_ID, COMPATIBILITY_CURRICULUM_ID);
    }

    @Test
    @Transactional
    void setCurriculumFromPublicCatalogAcceptsTheCurrentPublishedRoot() {
        learnerService.setCurriculumFromPublicCatalog(learnerId, CANONICAL_GYMNASIUM_ROOT_ID);

        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        assertThat(learner.getSelectedCurriculum()).isEqualTo(CANONICAL_GYMNASIUM_ROOT_ID);
        assertThat(learner.getLearningState()).isEqualTo(LearningState.FRONTIER);
    }

    @Test
    @Transactional
    void setCurriculumFromPublicCatalogRejectsCompatibilityAndLegacyHiddenRootsAsConflicts() {
        for (String unpublishedId : List.of(
                LEGACY_HIDDEN_CURRICULUM_ID,
                COMPATIBILITY_CURRICULUM_ID)) {
            assertThatThrownBy(() ->
                            learnerService.setCurriculumFromPublicCatalog(learnerId, unpublishedId))
                    .isInstanceOf(ResponseStatusException.class)
                    .satisfies(error -> assertThat(
                                    ((ResponseStatusException) error).getStatusCode())
                            .isEqualTo(org.springframework.http.HttpStatus.CONFLICT));
        }

        assertThat(learnerRepository.findById(learnerId).orElseThrow().getSelectedCurriculum())
                .isNull();
    }

    @Test
    @Transactional
    void getLearnerState_returnsStandardActions_whenCurriculumSelected() {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setStrictMode(true);
        learner.setPersonalCurriculum(completedPersonalizationConfig("""
                {
                  "a0e13c56-c25f-4742-9272-3a1a603ee52e": {"selected": true, "filterId": "ALL"},
                  "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced": {"selected": true, "filterId": "GK"}
                }
                """));
        learnerRepository.save(learner);

        var state = learnerService.getLearnerState(learnerId);
        assertThat(state.nextAllowedActions()).containsExactlyInAnyOrder(
                "setScope", "getFrontier", "setActiveGoal");
    }

    @Test
    void patchPersonalCurriculumRejectsAStaleSelectionWithoutChangingCockpitConfiguration() throws Exception {
        String mathLandscapeId = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
        String physicsLandscapeId = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setPersonalCurriculum("""
                {
                  "a0e13c56-c25f-4742-9272-3a1a603ee52e": {"selected": true, "filterId": "ALL"},
                  "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced": {"selected": true, "filterId": "GK"},
                  "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a": {"selected": true, "filterId": "GK"}
                }
                """);
        learnerRepository.saveAndFlush(learner);

        assertThatThrownBy(() -> learnerService.patchPersonalCurriculum(
                        learnerId,
                        Map.of(),
                        List.of(),
                        List.of("DE-HE")))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("stale");

        Learner updated = learnerRepository.findById(learnerId).orElseThrow();
        JsonNode config = objectMapper.readTree(updated.getPersonalCurriculum());
        assertThat(config.path(CANONICAL_GYMNASIUM_ROOT_ID).path("filterId").asText()).isEqualTo("ALL");
        assertThat(config.path(mathLandscapeId).path("filterId").asText()).isEqualTo("GK");
        assertThat(config.path(physicsLandscapeId).path("filterId").asText()).isEqualTo("GK");
    }

    @Test
    void patchPersonalCurriculumInitializesAnEmptyCanonicalRootForHessen() throws Exception {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setPersonalCurriculum(null);
        learnerRepository.saveAndFlush(learner);

        var state = learnerService.patchPersonalCurriculum(
                learnerId,
                Map.of(),
                List.of(),
                List.of("DE-HE"));

        Learner updated = learnerRepository.findById(learnerId).orElseThrow();
        JsonNode config = objectMapper.readTree(updated.getPersonalCurriculum());
        assertThat(config.path(CANONICAL_GYMNASIUM_ROOT_ID).path("selected").asBoolean()).isTrue();
        assertThat(config.path(CANONICAL_GYMNASIUM_ROOT_ID).path("filterId").asText()).isEqualTo("DE-HE");
        assertThat(state.activeFilters()).contains("DE-HE");
    }

    @Test
    void patchPersonalCurriculumRejectsAStaleFilterForCompleteCockpitConfiguration() throws Exception {
        Map<String, Object> fullCockpitConfig = new LinkedHashMap<>();
        for (SkillLandscape landscape : landscapeService.getClosure(CANONICAL_GYMNASIUM_ROOT_ID)) {
            Map<String, Object> settings = new LinkedHashMap<>();
            settings.put("selected", true);
            if (landscape.getFilters() != null && !landscape.getFilters().isEmpty()) {
                settings.put("filterId", landscape.getFilters().getFirst().getId());
            }
            fullCockpitConfig.put(landscape.getLandscapeId(), settings);
        }
        fullCockpitConfig.putIfAbsent(
                CANONICAL_GYMNASIUM_ROOT_ID,
                new LinkedHashMap<>(Map.of("selected", true)));

        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setPersonalCurriculum(objectMapper.writeValueAsString(fullCockpitConfig));
        learnerRepository.saveAndFlush(learner);

        assertThatThrownBy(() -> learnerService.patchPersonalCurriculum(
                        learnerId,
                        Map.of(),
                        List.of(),
                        List.of("DE-HE")))
                .isInstanceOf(ResponseStatusException.class);

        Learner updated = learnerRepository.findById(learnerId).orElseThrow();
        JsonNode config = objectMapper.readTree(updated.getPersonalCurriculum());
        assertThat(config.size()).isEqualTo(fullCockpitConfig.size());
    }

    @Test
    void patchPersonalCurriculumAcceptsLegacyLandscapeConfigurationForHessen() throws Exception {
        String legacyConfiguration = """
                {
                  "24f2ca0f-b94a-444e-bb70-677cb6f85c02": {"selected": false},
                  "bbbf39f3-4a5b-46cf-9edd-48f2c54ae0da": {"selected": true},
                  "2796fc7b-ba9d-446f-8f26-711dd6d8a9a3": {"selected": true, "filterId": "LK"},
                  "obsolete-landscape": {"selected": "true", "filterId": 17}
                }
                """;
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setPersonalCurriculum(legacyConfiguration);
        learner.setActiveGoalId("legacy-goal-that-no-longer-exists");
        learnerRepository.saveAndFlush(learner);

        var state = learnerService.patchPersonalCurriculum(
                learnerId,
                Map.of(),
                List.of(),
                List.of("DE-HE"));

        Learner updated = learnerRepository.findById(learnerId).orElseThrow();
        JsonNode config = objectMapper.readTree(updated.getPersonalCurriculum());
        assertThat(config.path(CANONICAL_GYMNASIUM_ROOT_ID).path("filterId").asText()).isEqualTo("DE-HE");
        assertThat(config.path("2796fc7b-ba9d-446f-8f26-711dd6d8a9a3").path("filterId").asText())
                .isEqualTo("LK");
        assertThat(updated.getActiveGoalId()).isNull();
        assertThat(state.activeFilters()).contains("DE-HE");
    }

    @Test
    void patchPersonalCurriculumRecoversFromMalformedStoredConfigurationForHessen() throws Exception {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setPersonalCurriculum("{not-valid-json");
        learnerRepository.saveAndFlush(learner);

        var state = learnerService.patchPersonalCurriculum(
                learnerId,
                Map.of(),
                List.of(),
                List.of("DE-HE"));

        Learner updated = learnerRepository.findById(learnerId).orElseThrow();
        JsonNode config = objectMapper.readTree(updated.getPersonalCurriculum());
        assertThat(config.path(CANONICAL_GYMNASIUM_ROOT_ID).path("filterId").asText()).isEqualTo("DE-HE");
        assertThat(state.activeFilters()).contains("DE-HE");
    }

    @Test
    void setPersonalCurriculumKeepsFullReplacementSemanticsForCockpitWrites() throws Exception {
        String obsoleteLandscapeId = "obsolete-landscape";
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setPersonalCurriculum("""
                {
                  "a0e13c56-c25f-4742-9272-3a1a603ee52e": {"selected": true, "filterId": "ALL"},
                  "obsolete-landscape": {"selected": true, "filterId": "OLD"}
                }
                """);
        learnerRepository.saveAndFlush(learner);

        learnerService.setPersonalCurriculum(
                learnerId,
                Map.of(
                        CANONICAL_GYMNASIUM_ROOT_ID,
                        Map.of("selected", true, "filterId", "DE-HE")),
                null,
                null);

        Learner updated = learnerRepository.findById(learnerId).orElseThrow();
        JsonNode config = objectMapper.readTree(updated.getPersonalCurriculum());
        assertThat(config.has(CANONICAL_GYMNASIUM_ROOT_ID)).isTrue();
        assertThat(config.has(obsoleteLandscapeId)).isFalse();
    }

    @Test
    @Transactional
    void getLearnerState_resolvesCompositionViewPlannedScopeForAiFrontier() {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setPersonalCurriculum(completedPersonalizationConfig("""
                {
                  "a0e13c56-c25f-4742-9272-3a1a603ee52e": {
                    "selected": true,
                    "filterId": "DE-HE",
                    "stage": "CrossStage",
                    "durationModel": "G9"
                  },
                  "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced": {"selected": true, "filterId": "GK"},
                  "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a": {"selected": true, "filterId": "ALL"}
                }
                """));
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
    void coachStateKeepsSixRemainingReleasedJ8ExamTasksSelectable() {
        selectCompletedCanonicalMathCrossStageCurriculum();
        learnerService.setPlannedGoals(learnerId, Set.of(COMPOSITION_MERGED_DE_J8_SCOPE_ID));
        Set<String> remainingExamTaskIds = Set.of(
                J8_EXAM_TASK_1_ID,
                J8_EXAM_TASK_2_ID,
                J8_EXAM_TASK_4_ID,
                J8_EXAM_TASK_5_ID,
                J8_EXAM_TASK_6_ID,
                J8_EXAM_TASK_8_ID);
        Set<String> completedExamTaskIds = Set.of(J8_EXAM_TASK_3_ID, J8_EXAM_TASK_7_ID, J8_EXAM_TASK_9_ID);
        Set<String> allExamTaskIds = new LinkedHashSet<>(remainingExamTaskIds);
        allExamTaskIds.addAll(completedExamTaskIds);
        Map<String, LearningGoal> canonicalGoals = landscapeService.getById(CANONICAL_MATH_LANDSCAPE_ID)
                .getGoals().stream()
                .collect(java.util.stream.Collectors.toMap(LearningGoal::getId, goal -> goal));
        Set<String> directExamRequirementIds = new LinkedHashSet<>();
        allExamTaskIds.stream()
                .map(canonicalGoals::get)
                .flatMap(goal -> goal.getRequires().stream())
                .forEach(directExamRequirementIds::add);
        for (String viewId : List.of(
                "de-de-gym-math-gk",
                "de-de-gym-math-lk",
                "de-he-gym-math-gk",
                "de-he-gym-math-lk")) {
            CompositionStructureResolution sourceJ8Scope = compositionViewService
                    .resolveStructureReference("composition:" + viewId + ":structure:j8");
            Set<String> sourceJ8AtomicGoalIds = new LinkedHashSet<>();
            sourceJ8Scope.referencedGoalIds()
                    .forEach(goalId -> collectAtomicGoalIds(goalId, canonicalGoals, sourceJ8AtomicGoalIds));
            assertThat(sourceJ8AtomicGoalIds)
                    .as(viewId)
                    .hasSize(55)
                    .containsAll(directExamRequirementIds);
        }
        CompositionStructureResolution j8Scope = compositionViewService
                .resolveStructureReference(COMPOSITION_MERGED_DE_J8_SCOPE_ID);
        CompositionStructureResolution additionalCompetencies = compositionViewService
                .resolveStructureReference(COMPOSITION_MERGED_DE_J8_ADDITIONAL_SCOPE_ID);
        Set<String> j8AtomicGoalIds = new LinkedHashSet<>();
        j8Scope.referencedGoalIds()
                .forEach(goalId -> collectAtomicGoalIds(goalId, canonicalGoals, j8AtomicGoalIds));
        Set<String> additionalCompetencyAtomicGoalIds = new LinkedHashSet<>();
        additionalCompetencies.referencedGoalIds()
                .forEach(goalId -> collectAtomicGoalIds(goalId, canonicalGoals, additionalCompetencyAtomicGoalIds));
        assertThat(j8AtomicGoalIds).hasSize(55);
        assertThat(additionalCompetencyAtomicGoalIds)
                .isNotEmpty()
                .doesNotContainAnyElementsOf(allExamTaskIds);
        assertThat(j8AtomicGoalIds)
                .containsAll(remainingExamTaskIds)
                .containsAll(completedExamTaskIds)
                .containsAll(additionalCompetencyAtomicGoalIds);

        // This mirrors the former compact J8 tree: all non-exam targets and
        // the orientation were complete while six exam targets remained.
        Set<String> formerlyVisibleGoalIds = new LinkedHashSet<>(j8AtomicGoalIds);
        formerlyVisibleGoalIds.removeAll(additionalCompetencyAtomicGoalIds);
        assertThat(formerlyVisibleGoalIds)
                .hasSize(j8AtomicGoalIds.size() - additionalCompetencyAtomicGoalIds.size());
        Set<String> formerlyCompletedGoalIds = new LinkedHashSet<>(formerlyVisibleGoalIds);
        formerlyCompletedGoalIds.removeAll(remainingExamTaskIds);
        formerlyCompletedGoalIds.add(CANONICAL_MATH_SEK_ONE_ORIENTATION_ID);
        Set<String> formerlyCompletedAtomicGoalIds = new LinkedHashSet<>(formerlyCompletedGoalIds);
        formerlyCompletedAtomicGoalIds.retainAll(j8AtomicGoalIds);
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        masteryRepository.saveAllAndFlush(formerlyCompletedGoalIds.stream()
                .map(goalId -> new Mastery(learner, goalId, 1.0))
                .toList());

        var resumedCoachState = learnerService.getCoachLearnerState(learnerId);

        assertThat(resumedCoachState.goals().scope().total_atomic()).isEqualTo(55);
        assertThat(resumedCoachState.goals().scope().mastered_atomic())
                .isEqualTo(formerlyCompletedAtomicGoalIds.size());
        assertThat(resumedCoachState.stateMachine().requiredAction()).isEqualTo("setActiveGoal");
        assertThat(resumedCoachState.stateMachine().goalOptions()).isNotEmpty();
        assertThat(resumedCoachState.stateMachine().goalOptions())
                .extracting(FrontierGoal::id)
                .allMatch(additionalCompetencyAtomicGoalIds::contains);

        masteryRepository.saveAllAndFlush(additionalCompetencyAtomicGoalIds.stream()
                .map(goalId -> new Mastery(learner, goalId, 1.0))
                .toList());

        var coachState = learnerService.getCoachLearnerState(learnerId);

        assertThat(coachState.goals().scope().total_atomic()).isEqualTo(55);
        assertThat(coachState.goals().scope().mastered_atomic())
                .isEqualTo(coachState.goals().scope().total_atomic() - remainingExamTaskIds.size());
        assertThat(coachState.goals().scope().total_atomic()
                        - coachState.goals().scope().mastered_atomic())
                .isEqualTo(6);
        assertThat(coachState.stateMachine().requiredAction()).isEqualTo("setActiveGoal");
        assertThat(coachState.stateMachine().goalOptions())
                .extracting(FrontierGoal::id)
                .containsExactlyInAnyOrderElementsOf(remainingExamTaskIds);
        assertThat(coachState.stateMachine().goalOptions())
                .allSatisfy(goal -> {
                    assertThat(goal.nodeKind()).isEqualTo("exam");
                    assertThat(goal.examData()).isNull();
                    assertThat(goal.examReadyForSelection()).isTrue();
                });

        var projected = new CoachStateProjection("https://skillpilot.test").project(coachState);
        assertThat(projected.stateMachine().goalOptions())
                .extracting(FrontierGoal::id)
                .containsExactlyInAnyOrderElementsOf(remainingExamTaskIds);
    }

    @Test
    @Transactional
    void focusMutationClearsOutOfScopeActiveGoalAndReturnsNewAutopilotState() {
        selectCompletedCanonicalMathCurriculum();
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setLearningStrategy("SEQUENTIAL");
        learner.setAutoPilot(false);
        learnerRepository.saveAndFlush(learner);

        var j7Preview = learnerService
                .setPlannedGoalsAndGetState(learnerId, Set.of(COMPOSITION_J7_SCOPE_ID))
                .state();
        Set<String> j7FrontierIds = j7Preview.frontier().stream()
                .filter(goal -> "atomic".equals(goal.type()))
                .map(FrontierGoal::id)
                .collect(java.util.stream.Collectors.toCollection(LinkedHashSet::new));
        assertThat(j7FrontierIds).isNotEmpty();

        learnerService.setPlannedGoals(learnerId, Set.of(COMPOSITION_J8_SCOPE_ID));
        learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setActiveGoalId(J8_EXAM_TASK_3_ID);
        learner.setLearningState(LearningState.TEACHING);
        learner.setAutoPilot(true);
        learnerRepository.saveAndFlush(learner);

        var mutation = learnerService.setPlannedGoalsAndGetState(
                learnerId,
                Set.of(COMPOSITION_J7_SCOPE_ID));

        assertThat(mutation.goals()).containsExactly(COMPOSITION_J7_SCOPE_ID);
        assertThat(mutation.state().goals().planned())
                .extracting(FrontierGoal::id)
                .containsExactly(COMPOSITION_J7_SCOPE_ID);
        assertThat(mutation.state().activeGoal()).isNotNull();
        assertThat(mutation.state().activeGoal().id())
                .isNotEqualTo(J8_EXAM_TASK_3_ID)
                .isIn(j7FrontierIds);
        assertThat(mutation.state().learningState()).isEqualTo("TEACHING");
        assertThat(learnerRepository.findById(learnerId).orElseThrow().getActiveGoalId())
                .isEqualTo(mutation.state().activeGoal().id());
    }

    @Test
    @Transactional
    void focusMutationWithoutAutopilotClearsOutOfScopeActiveGoal() {
        selectCompletedCanonicalMathCurriculum();
        learnerService.setPlannedGoals(learnerId, Set.of(COMPOSITION_J8_SCOPE_ID));
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setLearningStrategy("SEQUENTIAL");
        learner.setAutoPilot(false);
        learner.setActiveGoalId(J8_EXAM_TASK_3_ID);
        learner.setLearningState(LearningState.TEACHING);
        learnerRepository.saveAndFlush(learner);

        var mutation = learnerService.setPlannedGoalsAndGetState(
                learnerId,
                Set.of(COMPOSITION_J7_SCOPE_ID));

        assertThat(mutation.goals()).containsExactly(COMPOSITION_J7_SCOPE_ID);
        assertThat(mutation.state().activeGoal()).isNull();
        assertThat(mutation.state().learningState()).isEqualTo("FRONTIER");
        assertThat(learnerRepository.findById(learnerId).orElseThrow().getActiveGoalId()).isNull();
    }

    @Test
    @Transactional
    void equivalentCrossStageScopeAliasIsNotRepublishedButRemainsAcceptedByScopeWrite() {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setPersonalCurriculum(completedPersonalizationConfig("""
                {
                  "a0e13c56-c25f-4742-9272-3a1a603ee52e": {
                    "selected": true,
                    "filterId": "ALL",
                    "stage": "CrossStage"
                  },
                  "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced": {
                    "selected": true,
                    "filterId": "LK"
                  }
                }
                """));
        learnerRepository.saveAndFlush(learner);

        var initialState = learnerService.getLearnerState(learnerId);

        assertThat(initialState.stateMachine().requiredAction()).isEqualTo("setActiveGoal");
        assertThat(initialState.goals().planned())
                .extracting(goal -> goal.id())
                .containsExactly(CANONICAL_MATH_ROOT_SCOPE_ID);
        assertThat(initialState.frontier())
                .extracting(FrontierGoal::id)
                .containsExactly(
                        CANONICAL_MATH_SEK_ONE_ORIENTATION_ID,
                        CANONICAL_MATH_ORIENTATION_ID);
        assertThat(initialState.frontier())
                .extracting(FrontierGoal::semanticKind)
                .containsOnly("orientation");
        assertThat(learnerService.getScopeNavigationOptions(learnerId))
                .isEmpty();

        assertThatCode(() -> learnerService.setScope(
                        learnerId,
                        List.of(COMPOSITION_DE_MATH_LK_ROOT_SCOPE_ID)))
                .doesNotThrowAnyException();
        assertThat(plannedGoalRepository.findByLearner_SkillpilotId(learnerId))
                .extracting(PlannedGoal::getGoalId)
                .containsExactly(COMPOSITION_DE_MATH_LK_ROOT_SCOPE_ID);
    }

    @Test
    @Transactional
    void hessenSekTwoLkFocusNavigationWidensEOneToEPhaseAndPreservesActiveGoal() {
        selectCompletedHessenSekTwoLkCurriculum();
        learnerService.setPlannedGoals(learnerId, Set.of(CANONICAL_E_ONE_SCOPE_ID));

        String activeGoalId = learnerService.getLearnerState(learnerId).frontier().stream()
                .filter(goal -> "atomic".equals(goal.type()))
                .findFirst()
                .orElseThrow()
                .id();
        learnerService.setActiveGoal(learnerId, activeGoalId);

        assertThat(learnerService.getScopeNavigationOptions(learnerId))
                .extracting(FrontierGoal::id)
                .startsWith(
                        COMPOSITION_HE_SEK_TWO_MATH_LK_E_PHASE_SCOPE_ID,
                        COMPOSITION_HE_SEK_TWO_MATH_LK_ROOT_SCOPE_ID);

        var widenedState = learnerService.setScope(
                learnerId,
                List.of(COMPOSITION_HE_SEK_TWO_MATH_LK_E_PHASE_SCOPE_ID));

        assertThat(plannedGoalRepository.findByLearner_SkillpilotId(learnerId))
                .extracting(PlannedGoal::getGoalId)
                .containsExactly(COMPOSITION_HE_SEK_TWO_MATH_LK_E_PHASE_SCOPE_ID);
        assertThat(widenedState.activeGoal()).isNotNull();
        assertThat(widenedState.activeGoal().id()).isEqualTo(activeGoalId);
        assertThat(learnerRepository.findById(learnerId).orElseThrow().getActiveGoalId())
                .isEqualTo(activeGoalId);
    }

    @Test
    @Transactional
    void blockedIncompleteFocusDoesNotTriggerAutomaticFocusWidening() {
        selectCompletedHessenSekTwoLkCurriculum();
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setStrictMode(true);
        learnerRepository.saveAndFlush(learner);
        learnerService.setPlannedGoals(
                learnerId,
                Set.of(CANONICAL_CREATE_REPRESENTATION_ID));

        var state = learnerService.getLearnerState(learnerId);

        assertThat(state.goals().scope_completed()).isFalse();
        assertThat(state.frontier()).isEmpty();
        assertThat(state.stateMachine().requiredAction()).isNotEqualTo("setScope");
        assertThat(state.stateMachine().goalOptions())
                .extracting(FrontierGoal::id)
                .doesNotContain(CANONICAL_REPRESENTATION_CLUSTER_ID);
    }

    @Test
    @Transactional
    void masteredDependentDoesNotMasterPrerequisiteAfterFocusWidening() {
        selectCompletedHessenSekTwoLkCurriculum();
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        masteryRepository.saveAll(List.of(
                new Mastery(learner, CANONICAL_MATH_ORIENTATION_ID, 1.0),
                new Mastery(learner, CANONICAL_CREATE_REPRESENTATION_ID, 1.0)));
        learnerService.setPlannedGoals(
                learnerId,
                Set.of(CANONICAL_CREATE_REPRESENTATION_ID));

        var completedNarrowState = learnerService.getLearnerState(learnerId);

        assertThat(completedNarrowState.goals().scope_completed()).isTrue();
        assertThat(completedNarrowState.stateMachine().requiredAction()).isEqualTo("setScope");
        assertThat(completedNarrowState.stateMachine().goalOptions())
                .extracting(FrontierGoal::id)
                .startsWith(CANONICAL_REPRESENTATION_CLUSTER_ID);

        var widenedState = learnerService.setScope(
                learnerId,
                List.of(CANONICAL_REPRESENTATION_CLUSTER_ID));

        assertThat(learnerService.getMastery(learnerId))
                .containsEntry(CANONICAL_CREATE_REPRESENTATION_ID, 1.0)
                .doesNotContainKey(CANONICAL_CHOOSE_REPRESENTATION_ID);
        assertThat(widenedState.goals().scope_completed()).isFalse();
        assertThat(widenedState.frontier())
                .extracting(FrontierGoal::id)
                .contains(CANONICAL_CHOOSE_REPRESENTATION_ID);
    }

    @Test
    @Transactional
    void completedMultiSubjectPlanDefaultsToFirstVisibleCanonicalRootAndKeepsFocusNonEmpty() {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setPersonalCurriculum(completedPersonalizationConfig("""
                {
                  "a0e13c56-c25f-4742-9272-3a1a603ee52e": {
                    "selected": true,
                    "filterId": "ALL",
                    "stage": "CrossStage"
                  },
                  "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced": {
                    "selected": true,
                    "filterId": "LK"
                  },
                  "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a": {
                    "selected": true,
                    "filterId": "LK"
                  }
                }
                """));
        learnerRepository.saveAndFlush(learner);

        var initialState = learnerService.getLearnerState(learnerId);

        assertThat(initialState.goals().planned())
                .extracting(FrontierGoal::id)
                .containsExactly(CANONICAL_MATH_ROOT_SCOPE_ID);
        assertThat(plannedGoalRepository.findByLearner_SkillpilotId(learnerId))
                .extracting(PlannedGoal::getGoalId)
                .containsExactly(CANONICAL_MATH_ROOT_SCOPE_ID);
        assertThat(learnerService.getScopeNavigationOptions(learnerId))
                .extracting(FrontierGoal::id)
                .containsExactly(COMPOSITION_DE_PHYSICS_LK_ROOT_SCOPE_ID);

        learnerService.setScope(
                learnerId,
                List.of(
                        COMPOSITION_DE_MATH_LK_ROOT_SCOPE_ID,
                        COMPOSITION_DE_PHYSICS_LK_ROOT_SCOPE_ID));
        assertThat(plannedGoalRepository.findByLearner_SkillpilotId(learnerId))
                .extracting(PlannedGoal::getGoalId)
                .containsExactlyInAnyOrder(
                        COMPOSITION_DE_MATH_LK_ROOT_SCOPE_ID,
                        COMPOSITION_DE_PHYSICS_LK_ROOT_SCOPE_ID);
        assertThat(learnerService.getLearnerState(learnerId).goals().planned())
                .extracting(FrontierGoal::id)
                .containsExactlyInAnyOrder(
                        COMPOSITION_DE_MATH_LK_ROOT_SCOPE_ID,
                        COMPOSITION_DE_PHYSICS_LK_ROOT_SCOPE_ID);

        assertThat(learnerService.setPlannedGoals(
                        learnerId,
                        Set.of(CANONICAL_PHYSICS_ROOT_SCOPE_ID)))
                .containsExactly(CANONICAL_PHYSICS_ROOT_SCOPE_ID);
        assertThat(plannedGoalRepository.findByLearner_SkillpilotId(learnerId))
                .extracting(PlannedGoal::getGoalId)
                .containsExactly(CANONICAL_PHYSICS_ROOT_SCOPE_ID);

        assertThat(learnerService.setPlannedGoals(learnerId, Set.of()))
                .containsExactly(CANONICAL_MATH_ROOT_SCOPE_ID);
        assertThat(plannedGoalRepository.findByLearner_SkillpilotId(learnerId))
                .extracting(PlannedGoal::getGoalId)
                .containsExactly(CANONICAL_MATH_ROOT_SCOPE_ID);
    }

    @Test
    @Transactional
    void multiRootFocusWideningPreservesTheUntouchedPhysicsFocus() {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setPersonalCurriculum(completedPersonalizationConfig("""
                {
                  "a0e13c56-c25f-4742-9272-3a1a603ee52e": {
                    "selected": true,
                    "filterId": "ALL",
                    "stage": "CrossStage"
                  },
                  "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced": {
                    "selected": true,
                    "filterId": "LK"
                  },
                  "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a": {
                    "selected": true,
                    "filterId": "LK"
                  }
                }
                """));
        learnerRepository.saveAndFlush(learner);
        learnerService.setPlannedGoals(
                learnerId,
                new LinkedHashSet<>(List.of(
                        CANONICAL_E_ONE_SCOPE_ID,
                        COMPOSITION_DE_PHYSICS_LK_ROOT_SCOPE_ID)));
        String activeGoalId = learnerService.getLearnerState(learnerId).frontier().stream()
                .filter(goal -> "atomic".equals(goal.type()))
                .findFirst()
                .orElseThrow()
                .id();
        learnerService.setActiveGoal(learnerId, activeGoalId);

        FrontierGoal broaderAnalysis = learnerService.getScopeNavigationOptions(learnerId).stream()
                .filter(option -> COMPOSITION_DE_MATH_LK_ANALYSIS_BASICS_SCOPE_ID.equals(option.id()))
                .findFirst()
                .orElseThrow();
        assertThat(broaderAnalysis.selectionGoalIds()).containsExactly(
                COMPOSITION_DE_MATH_LK_ANALYSIS_BASICS_SCOPE_ID,
                COMPOSITION_DE_PHYSICS_LK_ROOT_SCOPE_ID);

        var widenedState = learnerService.setScope(
                learnerId,
                broaderAnalysis.selectionGoalIds());

        assertThat(plannedGoalRepository.findByLearner_SkillpilotId(learnerId))
                .extracting(PlannedGoal::getGoalId)
                .containsExactlyInAnyOrderElementsOf(broaderAnalysis.selectionGoalIds());
        assertThat(widenedState.goals().planned())
                .extracting(FrontierGoal::id)
                .containsExactlyInAnyOrderElementsOf(broaderAnalysis.selectionGoalIds());
        assertThat(widenedState.activeGoal()).isNotNull();
        assertThat(widenedState.activeGoal().id()).isEqualTo(activeGoalId);
    }

    @Test
    @SuppressWarnings("unchecked")
    void initialScopeKeepsWritableTargetFallbackWhenCompositionHasNoViewId() throws Exception {
        LearningGoal spanishRoot = landscapeService.getById(CANONICAL_SPANISH_LANDSCAPE_ID)
                .getGoals()
                .stream()
                .filter(goal -> CANONICAL_SPANISH_ROOT_SCOPE_ID.equals(goal.getId()))
                .findFirst()
                .orElseThrow();
        Map<String, LearningGoal> visibleGoals =
                Map.of(CANONICAL_SPANISH_ROOT_SCOPE_ID, spanishRoot);
        Class<?> projectionType = java.util.Arrays.stream(LearnerService.class.getDeclaredClasses())
                .filter(type -> "GoalProjection".equals(type.getSimpleName()))
                .findFirst()
                .orElseThrow();
        var constructor = projectionType.getDeclaredConstructor(
                Map.class,
                Set.class,
                Set.class,
                Map.class,
                Set.class,
                List.class,
                boolean.class);
        constructor.setAccessible(true);
        Object projection = constructor.newInstance(
                visibleGoals,
                Set.of(CANONICAL_SPANISH_ROOT_SCOPE_ID),
                Set.of(),
                visibleGoals,
                Set.of(),
                List.of(),
                true);

        List<FrontierGoal> options = (List<FrontierGoal>) ReflectionTestUtils.invokeMethod(
                learnerService,
                "getInitialScopeOptions",
                CANONICAL_GYMNASIUM_ROOT_ID,
                projection);

        assertThat(options)
                .singleElement()
                .satisfies(option -> {
                    assertThat(option.id()).isEqualTo(CANONICAL_SPANISH_ROOT_SCOPE_ID);
                    assertThat(option.title()).isEqualTo("Spanisch");
                });
    }

    @Test
    @Transactional
    @SuppressWarnings("unchecked")
    void getFilteredGoals_appliesCanonicalDeCrossStageCompositionView() {
        Map<String, LearningGoal> filteredGoals = (Map<String, LearningGoal>) ReflectionTestUtils.invokeMethod(
                learnerService,
                "getFilteredGoals",
                CANONICAL_GYMNASIUM_ROOT_ID,
                """
                        {
                          "a0e13c56-c25f-4742-9272-3a1a603ee52e": {
                            "selected": true,
                            "filterId": "ALL",
                            "stage": "CrossStage"
                          },
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
    void getLearnerState_offersNearestCompositionAncestorWhenCurrentYearScopeIsComplete() {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setPersonalCurriculum(completedPersonalizationConfig("""
                {
                  "a0e13c56-c25f-4742-9272-3a1a603ee52e": {"selected": true, "filterId": "DE-HE"},
                  "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced": {"selected": true, "filterId": "GK"}
                }
                """));
        learnerRepository.save(learner);
        learnerService.setPlannedGoals(learnerId, Set.of(COMPOSITION_J8_SCOPE_ID));

        completeCurrentScope();

        var state = learnerService.getLearnerState(learnerId);

        assertThat(state.goals().scope_completed()).isTrue();
        assertThat(state.stateMachine().requiredAction()).isEqualTo("setScope");
        assertThat(state.stateMachine().goalOptions())
                .extracting(goal -> goal.id())
                .startsWith(
                        COMPOSITION_SEK_ONE_G9_SCOPE_ID,
                        CANONICAL_MATH_ROOT_SCOPE_ID)
                .doesNotContain(COMPOSITION_HE_G9_MATH_ROOT_SCOPE_ID)
                .doesNotContain(COMPOSITION_J9_SCOPE_ID);
        assertThat(state.stateMachine().goalOptions())
                .filteredOn(goal -> COMPOSITION_SEK_ONE_G9_SCOPE_ID.equals(goal.id()))
                .singleElement()
                .satisfies(goal -> {
                    assertThat(goal.title()).isEqualTo("Sekundarstufe I");
                    assertThat(goal.type()).isEqualTo("cluster");
                });
    }

    @Test
    @Transactional
    void getLearnerState_requiresMemoryModeChoiceForActiveFlashcardGoal() {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setPersonalCurriculum(completedPersonalizationConfig("""
                {
                  "a0e13c56-c25f-4742-9272-3a1a603ee52e": {"selected": true, "filterId": "ALL"},
                  "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced": {"selected": true, "filterId": "GK"}
                }
                """));
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
                .filteredOn(option -> "practice".equals(option.id()))
                .singleElement()
                .satisfies(option -> {
                    assertThat(option.action()).isEqualTo("openCockpitPractice");
                    assertThat(option.target()).isEqualTo("cockpit");
                    assertThat(option.description()).contains("Karteikartenlernen im Cockpit");
                    assertThat(option.goalId()).isEqualTo(SEK1_CORE_FORMULAS_FLASHCARDS_ID);
                });
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
    void memoryPracticeReviewsDueCardsWithoutCompletingTheMemoryGoal() {
        activateSekOneCoreFormulaFlashcards();
        long stateVersionBeforePractice = learnerRepository.findById(learnerId)
                .orElseThrow()
                .getCoachStateRevision();

        var practice = learnerService.startMemoryPractice(
                learnerId,
                "de",
                new MemoryPracticeStartRequest(null));

        assertThat(practice.status()).isEqualTo("ready");
        assertThat(practice.goalId()).isEqualTo(SEK1_CORE_FORMULAS_FLASHCARDS_ID);
        assertThat(practice.goalTitle()).isEqualTo("Lernkarten - Sek I Kernformeln");
        assertThat(practice.cards()).isNotEmpty().hasSizeLessThanOrEqualTo(20);
        assertThat(practice.cards()).allSatisfy(card -> {
            assertThat(card.front()).isNotBlank();
            assertThat(card.back()).isNotBlank();
        });
        assertThat(practice.cards()).hasSize(Math.min(20, practice.progress().dueCards()));
        assertThat(practice.progress().dueCards()).isEqualTo(practice.progress().totalCards());
        assertThat(learnerClientStateRepository.findAll()).isEmpty();
        assertThat(learnerRepository.findById(learnerId).orElseThrow().getCoachStateRevision())
                .isEqualTo(stateVersionBeforePractice);

        var unchangedPractice = learnerService.startMemoryPractice(
                learnerId,
                "de",
                new MemoryPracticeStartRequest(null));
        assertThat(unchangedPractice.cards())
                .extracting(card -> card.cardId())
                .containsExactlyElementsOf(practice.cards().stream()
                        .map(card -> card.cardId())
                        .toList());
        assertThat(learnerClientStateRepository.findAll()).isEmpty();
        assertThat(learnerRepository.findById(learnerId).orElseThrow().getCoachStateRevision())
                .isEqualTo(stateVersionBeforePractice);

        int reviewedCards = 0;
        while ("ready".equals(practice.status())) {
            practice = learnerService.reviewMemoryPracticeCard(
                    learnerId,
                    "de",
                    new MemoryPracticeReviewRequest(
                            SEK1_CORE_FORMULAS_FLASHCARDS_ID,
                            practice.cards().getFirst().cardId(),
                            "known"));
            reviewedCards++;
            assertThat(reviewedCards).isLessThanOrEqualTo(practice.progress().totalCards());
        }

        assertThat(practice.status()).isEqualTo("complete");
        assertThat(practice.cards()).isEmpty();
        assertThat(practice.progress().dueCards()).isZero();
        assertThat(practice.progress().scheduledCards()).isEqualTo(practice.progress().totalCards());
        assertThat(reviewedCards).isEqualTo(practice.progress().totalCards());
        assertThat(learnerService.getMastery(learnerId)
                        .getOrDefault(SEK1_CORE_FORMULAS_FLASHCARDS_ID, 0.0))
                .isZero();
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        assertThat(learner.getActiveGoalId()).isEqualTo(SEK1_CORE_FORMULAS_FLASHCARDS_ID);
        assertThat(learner.getLearningState()).isEqualTo(LearningState.TEACHING);
    }

    @Test
    void memoryPracticeReviewAdvancesStateWhileRepeatedBatchReadsDoNot() {
        activateSekOneCoreFormulaFlashcards();
        long initialVersion = learnerRepository.findById(learnerId)
                .orElseThrow()
                .getCoachStateRevision();

        var firstBatch = learnerService.startMemoryPractice(
                learnerId,
                "de",
                new MemoryPracticeStartRequest(null));
        var repeatedBatch = learnerService.startMemoryPractice(
                learnerId,
                "de",
                new MemoryPracticeStartRequest(null));

        assertThat(repeatedBatch.cards())
                .extracting(card -> card.cardId())
                .containsExactlyElementsOf(firstBatch.cards().stream()
                        .map(card -> card.cardId())
                        .toList());
        assertThat(learnerRepository.findById(learnerId).orElseThrow().getCoachStateRevision())
                .isEqualTo(initialVersion);

        learnerService.reviewMemoryPracticeCard(
                learnerId,
                "de",
                new MemoryPracticeReviewRequest(
                        SEK1_CORE_FORMULAS_FLASHCARDS_ID,
                        firstBatch.cards().getFirst().cardId(),
                        "known"));

        assertThat(learnerRepository.findById(learnerId).orElseThrow().getCoachStateRevision())
                .isEqualTo(initialVersion + 1);
    }

    @Test
    @Transactional
    void memoryPracticeMapsKnownAndNotKnownToSm2AndPreservesVerifiedRecallAndOtherCards() {
        activateSekOneCoreFormulaFlashcards();
        var initial = learnerService.startMemoryPractice(
                learnerId,
                "de",
                new MemoryPracticeStartRequest(null));
        String firstCardId = initial.cards().getFirst().cardId();
        Map<String, Object> verifiedRecall = Map.of(
                "status", "passed",
                "attempts", 1,
                "failures", 0,
                "lastTestedAt", "2026-08-01T10:00:00Z",
                "passedAt", "2026-08-01T10:00:00Z");
        Map<String, Object> untouched = Map.of(
                "id", "unrelated-card",
                "interval", 9,
                "repetition", 3,
                "ef", 2.2,
                "nextReview", 0);
        learnerService.upsertClientState(
                learnerId,
                SEK1_CORE_FORMULAS_FLASHCARDS_ID,
                new ClientStateRequest(
                        Instant.now(),
                        Map.of(
                                firstCardId,
                                Map.of(
                                        "id", firstCardId,
                                        "interval", 0,
                                        "repetition", 0,
                                        "ef", 2.5,
                                        "nextReview", 0,
                                        "verifiedRecall", verifiedRecall),
                                "unrelated-card", untouched)));

        List<String> ratings = List.of("not_known", "known");
        List<Integer> expectedRepetitions = List.of(0, 1);
        List<Double> expectedEaseFactors = List.of(2.5, 2.5);
        var practice = learnerService.startMemoryPractice(
                learnerId,
                "de",
                new MemoryPracticeStartRequest(null));
        List<String> reviewedCardIds = new ArrayList<>();
        for (int index = 0; index < ratings.size(); index++) {
            String reviewedCardId = practice.cards().getFirst().cardId();
            reviewedCardIds.add(reviewedCardId);
            practice = learnerService.reviewMemoryPracticeCard(
                    learnerId,
                    "de",
                    new MemoryPracticeReviewRequest(
                            SEK1_CORE_FORMULAS_FLASHCARDS_ID,
                            reviewedCardId,
                            ratings.get(index)));

            Map<String, Object> state = learnerService
                    .getClientState(learnerId, SEK1_CORE_FORMULAS_FLASHCARDS_ID)
                    .srsState();
            assertThat(state.get("unrelated-card")).isEqualTo(untouched);
            @SuppressWarnings("unchecked")
            Map<String, Object> reviewed = (Map<String, Object>) state.get(reviewedCardId);
            assertThat(((Number) reviewed.get("interval")).intValue()).isEqualTo(1);
            assertThat(((Number) reviewed.get("repetition")).intValue())
                    .isEqualTo(expectedRepetitions.get(index));
            assertThat(((Number) reviewed.get("ef")).doubleValue())
                    .isCloseTo(expectedEaseFactors.get(index), org.assertj.core.data.Offset.offset(0.000001));
            assertThat(((Number) reviewed.get("nextReview")).longValue()).isGreaterThan(Instant.now().toEpochMilli());
        }

        Map<String, Object> state = learnerService
                .getClientState(learnerId, SEK1_CORE_FORMULAS_FLASHCARDS_ID)
                .srsState();
        @SuppressWarnings("unchecked")
        Map<String, Object> firstCardState = (Map<String, Object>) state.get(firstCardId);
        assertThat(firstCardState.get("verifiedRecall")).isEqualTo(verifiedRecall);
        assertThat(reviewedCardIds).doesNotHaveDuplicates();

        assertThatThrownBy(() -> learnerService.reviewMemoryPracticeCard(
                        learnerId,
                        "de",
                        new MemoryPracticeReviewRequest(
                                SEK1_CORE_FORMULAS_FLASHCARDS_ID,
                                firstCardId,
                                "known")))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("not due");
    }

    @Test
    @Transactional
    void memoryPracticeRejectsAnotherGoalAndInvalidRatingWithoutWritingState() {
        activateSekOneCoreFormulaFlashcards();

        assertThatThrownBy(() -> learnerService.startMemoryPractice(
                        learnerId,
                        "de",
                        new MemoryPracticeStartRequest(FUNCTIONS_FLASHCARDS_ID)))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("current active learner-facing atomic memorization/SRS goal");

        var practice = learnerService.startMemoryPractice(
                learnerId,
                "de",
                new MemoryPracticeStartRequest(null));
        for (String rejectedRating : List.of("again", "hard", "good", "easy", "almost")) {
            assertThatThrownBy(() -> learnerService.reviewMemoryPracticeCard(
                            learnerId,
                            "de",
                            new MemoryPracticeReviewRequest(
                                    SEK1_CORE_FORMULAS_FLASHCARDS_ID,
                                    practice.cards().getFirst().cardId(),
                                    rejectedRating)))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("not_known or known");
        }

        assertThat(learnerClientStateRepository.findAll()).isEmpty();
        assertThat(masteryRepository.findAll()).isEmpty();
    }

    @Test
    void concurrentMemoryPracticeReviewsPreserveBothCardUpdates() throws Exception {
        activateSekOneCoreFormulaFlashcards();
        var cards = learnerService.startVerifiedRecall(
                learnerId,
                "de",
                new VerifiedRecallStartRequest(null, false, 2)).cards();
        assertThat(cards).hasSize(2);

        CountDownLatch ready = new CountDownLatch(2);
        CountDownLatch start = new CountDownLatch(1);
        ExecutorService executor = Executors.newFixedThreadPool(2);
        try {
            var results = cards.stream()
                    .map(card -> executor.submit(() -> {
                        ready.countDown();
                        assertThat(start.await(10, TimeUnit.SECONDS)).isTrue();
                        return learnerService.reviewMemoryPracticeCard(
                                learnerId,
                                "de",
                                new MemoryPracticeReviewRequest(
                                        SEK1_CORE_FORMULAS_FLASHCARDS_ID,
                                        card.cardId(),
                                        "known"));
                    }))
                    .toList();
            assertThat(ready.await(10, TimeUnit.SECONDS)).isTrue();
            start.countDown();
            for (Future<?> result : results) {
                assertThat(result.get(20, TimeUnit.SECONDS)).isNotNull();
            }
        } finally {
            executor.shutdownNow();
        }

        Map<String, Object> state = learnerService
                .getClientState(learnerId, SEK1_CORE_FORMULAS_FLASHCARDS_ID)
                .srsState();
        assertThat(state).containsKeys(cards.get(0).cardId(), cards.get(1).cardId());
        assertThat(state.values())
                .allSatisfy(value -> assertThat(value).asInstanceOf(org.assertj.core.api.InstanceOfAssertFactories.MAP)
                        .containsEntry("interval", 1));
    }

    @Test
    @Transactional
    void verifiedRecallForSekOneFlashcardsStartsAndControlsSrsMastery() {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setPersonalCurriculum(completedPersonalizationConfig("""
                {
                  "a0e13c56-c25f-4742-9272-3a1a603ee52e": {"selected": true, "filterId": "ALL"},
                  "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced": {"selected": true, "filterId": "GK"},
                  "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a": {"selected": true, "filterId": "ALL"}
                }
                """));
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

        com.skillpilot.backend.api.VerifiedRecallResultResponse finalResult = null;
        for (int i = 0; i < prompt.totalCards(); i++) {
            assertThat(prompt.cardId()).isNotBlank();
            var result = learnerService.recordVerifiedRecallResult(
                    learnerId,
                    "de",
                    new VerifiedRecallResultRequest(SEK1_CORE_FORMULAS_FLASHCARDS_ID, prompt.cardId(), true, "ok"));
            assertThat(result.passed()).isTrue();
            finalResult = result;
            prompt = result.next();
        }

        assertThat(finalResult).isNotNull();
        assertThat(finalResult.masterySaved()).isTrue();
        assertThat(finalResult.masteryGoalId()).isEqualTo(SEK1_CORE_FORMULAS_FLASHCARDS_ID);
        assertThat(finalResult.instruction()).contains("Backend").contains("Mastery").contains("setMastery");
        assertThat(prompt.status()).isEqualTo("complete");
        assertThat(prompt.pendingCards()).isZero();
        assertThat(learnerService.getMastery(learnerId).get(SEK1_CORE_FORMULAS_FLASHCARDS_ID)).isEqualTo(1.0);
        assertThat(masteryRepository.findById(new MasteryId(learnerId, SEK1_CORE_FORMULAS_FLASHCARDS_ID)))
                .hasValueSatisfying(mastery -> assertThat(mastery.getValue()).isEqualTo(1.0));
        Learner updatedLearner = learnerRepository.findById(learnerId).orElseThrow();
        assertThat(updatedLearner.getActiveGoalId()).isNull();
        assertThat(updatedLearner.getLearningState()).isEqualTo(LearningState.FRONTIER);
    }

    @Test
    @Transactional
    void verifiedRecallRejectsCardOutsideTheActiveMemoryGoalBeforeAnswerOrStateWrite() {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setPersonalCurriculum(completedPersonalizationConfig("""
                {
                  "a0e13c56-c25f-4742-9272-3a1a603ee52e": {"selected": true, "filterId": "ALL"},
                  "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced": {"selected": true, "filterId": "GK"},
                  "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a": {"selected": true, "filterId": "ALL"}
                }
                """));
        learner.setActiveGoalId(FUNCTIONS_FLASHCARDS_ID);
        learner.setLearningState(LearningState.TEACHING);
        learnerRepository.save(learner);
        learnerService.setPlannedGoals(
                learnerId,
                Set.of(SEK1_CORE_FORMULAS_FLASHCARDS_ID, FUNCTIONS_FLASHCARDS_ID));

        var foreignPrompt = learnerService.startVerifiedRecall(
                learnerId,
                "de",
                new VerifiedRecallStartRequest(FUNCTIONS_FLASHCARDS_ID, false));
        assertThat(foreignPrompt.goalId()).isEqualTo(FUNCTIONS_FLASHCARDS_ID);
        assertThat(foreignPrompt.cardId()).isNotBlank();

        learner.setActiveGoalId(SEK1_CORE_FORMULAS_FLASHCARDS_ID);
        learnerRepository.saveAndFlush(learner);

        assertThatThrownBy(() -> learnerService.getVerifiedRecallAnswer(
                        learnerId,
                        "de",
                        new VerifiedRecallAnswerRequest(
                                SEK1_CORE_FORMULAS_FLASHCARDS_ID,
                                foreignPrompt.cardId())))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Card is not part of this memorization goal");
        assertThatThrownBy(() -> learnerService.recordVerifiedRecallResult(
                        learnerId,
                        "de",
                        new VerifiedRecallResultRequest(
                                SEK1_CORE_FORMULAS_FLASHCARDS_ID,
                                foreignPrompt.cardId(),
                                true,
                                "must not be stored")))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Card is not part of this memorization goal");

        assertThat(learnerClientStateRepository.findAll()).isEmpty();
        assertThat(learnerService.getMastery(learnerId)
                        .getOrDefault(SEK1_CORE_FORMULAS_FLASHCARDS_ID, 0.0))
                .isZero();
    }

    @Test
    @Transactional
    void verifiedRecallOperationsFailClosedWhenTheLockedActiveGoalHasChanged() {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setPersonalCurriculum(completedPersonalizationConfig("""
                {
                  "a0e13c56-c25f-4742-9272-3a1a603ee52e": {"selected": true, "filterId": "ALL"},
                  "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced": {"selected": true, "filterId": "GK"},
                  "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a": {"selected": true, "filterId": "ALL"}
                }
                """));
        learner.setActiveGoalId(SEK1_CORE_FORMULAS_FLASHCARDS_ID);
        learner.setLearningState(LearningState.TEACHING);
        learnerRepository.save(learner);
        learnerService.setPlannedGoals(
                learnerId,
                Set.of(SEK1_CORE_FORMULAS_FLASHCARDS_ID, FUNCTIONS_FLASHCARDS_ID));
        var originalPrompt = learnerService.startVerifiedRecall(
                learnerId,
                "de",
                new VerifiedRecallStartRequest(SEK1_CORE_FORMULAS_FLASHCARDS_ID, false));

        learner.setActiveGoalId(FUNCTIONS_FLASHCARDS_ID);
        learnerRepository.saveAndFlush(learner);

        assertThatThrownBy(() -> learnerService.startVerifiedRecall(
                        learnerId,
                        "de",
                        new VerifiedRecallStartRequest(SEK1_CORE_FORMULAS_FLASHCARDS_ID, false)))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(error -> assertThat(
                                ((ResponseStatusException) error).getStatusCode())
                        .isEqualTo(org.springframework.http.HttpStatus.CONFLICT));
        assertThatThrownBy(() -> learnerService.getVerifiedRecallAnswer(
                        learnerId,
                        "de",
                        new VerifiedRecallAnswerRequest(
                                SEK1_CORE_FORMULAS_FLASHCARDS_ID,
                                originalPrompt.cardId())))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(error -> assertThat(
                                ((ResponseStatusException) error).getStatusCode())
                        .isEqualTo(org.springframework.http.HttpStatus.CONFLICT));
        assertThatThrownBy(() -> learnerService.recordVerifiedRecallResult(
                        learnerId,
                        "de",
                        new VerifiedRecallResultRequest(
                                SEK1_CORE_FORMULAS_FLASHCARDS_ID,
                                originalPrompt.cardId(),
                                true,
                                "must not be stored")))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(error -> assertThat(
                                ((ResponseStatusException) error).getStatusCode())
                        .isEqualTo(org.springframework.http.HttpStatus.CONFLICT));

        assertThat(learnerClientStateRepository.findAll()).isEmpty();
        assertThat(learnerService.getMastery(learnerId)
                        .getOrDefault(SEK1_CORE_FORMULAS_FLASHCARDS_ID, 0.0))
                .isZero();
    }

    @Test
    @Transactional
    void verifiedRecallStartCanReturnOptInBatchForNewClients() {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setPersonalCurriculum(completedPersonalizationConfig("""
                {
                  "a0e13c56-c25f-4742-9272-3a1a603ee52e": {"selected": true, "filterId": "ALL"},
                  "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced": {"selected": true, "filterId": "GK"},
                  "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a": {"selected": true, "filterId": "ALL"}
                }
                """));
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
    void verifiedRecallBatchAnswersRequireTheCompleteBackendOwnedOrder() {
        activateSekOneCoreFormulaFlashcards();

        var prompt = learnerService.startVerifiedRecallBatch(
                learnerId,
                "de",
                SEK1_CORE_FORMULAS_FLASHCARDS_ID);
        List<String> cardIds = prompt.cards().stream()
                .map(VerifiedRecallPromptCard::cardId)
                .toList();

        var answers = learnerService.getVerifiedRecallAnswersBatch(
                learnerId,
                "de",
                new VerifiedRecallBatchAnswerRequest(
                        SEK1_CORE_FORMULAS_FLASHCARDS_ID,
                        prompt.configuredBatchSize(),
                        cardIds,
                        prompt.issuedAt()));

        assertThat(answers.cards()).hasSize(prompt.batchSize());
        assertThat(answers.cards())
                .extracting(card -> card.cardId())
                .containsExactlyElementsOf(cardIds);
        assertThat(answers.cards())
                .allSatisfy(card -> assertThat(card.expectedAnswer()).isNotBlank());

        assertThatThrownBy(() -> learnerService.getVerifiedRecallAnswersBatch(
                learnerId,
                "de",
                new VerifiedRecallBatchAnswerRequest(
                        SEK1_CORE_FORMULAS_FLASHCARDS_ID,
                        prompt.configuredBatchSize(),
                        cardIds.subList(0, cardIds.size() - 1),
                        prompt.issuedAt())))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("incomplete, reordered, or no longer current");

        List<String> duplicateIds = new ArrayList<>(cardIds);
        duplicateIds.set(duplicateIds.size() - 1, duplicateIds.getFirst());
        assertThatThrownBy(() -> learnerService.getVerifiedRecallAnswersBatch(
                learnerId,
                "de",
                new VerifiedRecallBatchAnswerRequest(
                        SEK1_CORE_FORMULAS_FLASHCARDS_ID,
                        prompt.configuredBatchSize(),
                        duplicateIds,
                        prompt.issuedAt())))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("must not contain duplicates");
    }

    @Test
    void verifiedRecallBatchResultPersistsEveryCardAtomicallyWithOneRevision() {
        activateSekOneCoreFormulaFlashcards();

        var prompt = learnerService.startVerifiedRecallBatch(
                learnerId,
                "de",
                SEK1_CORE_FORMULAS_FLASHCARDS_ID);
        List<String> cardIds = prompt.cards().stream()
                .map(VerifiedRecallPromptCard::cardId)
                .toList();
        long beforeRevision = learnerRepository.findById(learnerId).orElseThrow().getCoachStateRevision();
        List<VerifiedRecallBatchCardResult> results = cardIds.stream()
                .map(cardId -> new VerifiedRecallBatchCardResult(cardId, true, "korrekt"))
                .toList();

        var response = learnerService.recordVerifiedRecallResultsBatch(
                learnerId,
                "de",
                new VerifiedRecallBatchResultRequest(
                        SEK1_CORE_FORMULAS_FLASHCARDS_ID,
                        prompt.configuredBatchSize(),
                        cardIds,
                        prompt.issuedAt(),
                        results));

        assertThat(response.savedResults())
                .extracting(saved -> saved.cardId())
                .containsExactlyElementsOf(cardIds);
        assertThat(response.savedResults()).allMatch(saved -> saved.passed());
        assertThat(response.successor()).isNotNull();
        assertThat(response.successor().skillpilotId()).isEqualTo(learnerId);
        assertThat(learnerRepository.findById(learnerId).orElseThrow().getCoachStateRevision())
                .isEqualTo(beforeRevision + 1);

        var stored = learnerService.getClientState(
                learnerId,
                SEK1_CORE_FORMULAS_FLASHCARDS_ID);
        assertThat(stored.srsState()).containsKeys(cardIds.toArray(String[]::new));
        assertThat(cardIds).allSatisfy(cardId -> assertThat(stored.srsState().get(cardId))
                .isInstanceOfSatisfying(Map.class, cardState -> assertThat(cardState.get("verifiedRecall"))
                        .isInstanceOfSatisfying(Map.class, verified -> assertThat(verified)
                                .containsEntry("status", "passed"))));
    }

    @Test
    void verifiedRecallCompletionHandsOffToTheNextGoalInTheSameValidPlanWithOneRevision() {
        prepareMemoryThenRepresentationLearningPlan();

        var prompt = learnerService.startVerifiedRecallBatch(
                learnerId,
                "de",
                SEK1_CORE_FORMULAS_FLASHCARDS_ID,
                20);
        List<String> cardIds = prompt.cards().stream()
                .map(VerifiedRecallPromptCard::cardId)
                .toList();
        assertThat(cardIds).hasSize(prompt.totalCards());
        long beforeRevision = learnerRepository.findById(learnerId).orElseThrow().getCoachStateRevision();

        var response = learnerService.recordVerifiedRecallResultsBatch(
                learnerId,
                "de",
                new VerifiedRecallBatchResultRequest(
                        SEK1_CORE_FORMULAS_FLASHCARDS_ID,
                        prompt.configuredBatchSize(),
                        cardIds,
                        prompt.issuedAt(),
                        cardIds.stream()
                                .map(cardId -> new VerifiedRecallBatchCardResult(cardId, true, "korrekt"))
                                .toList()));

        assertThat(response.masterySaved()).isTrue();
        assertThat(response.successor().activeGoal()).isNotNull();
        assertThat(response.successor().activeGoal().id())
                .isEqualTo(CANONICAL_CHOOSE_REPRESENTATION_ID);
        assertThat(learnerRepository.findById(learnerId).orElseThrow().getCoachStateRevision())
                .isEqualTo(beforeRevision + 1);
        assertThat(plannedGoalRepository.findByLearner_SkillpilotId(learnerId))
                .extracting(PlannedGoal::getGoalId)
                .containsExactly(CANONICAL_REPRESENTATION_CLUSTER_ID);
    }

    @Test
    void legacyVerifiedRecallCompletionAlsoHandsOffWithOneRevision() {
        prepareMemoryThenRepresentationLearningPlan();

        var prompt = learnerService.startVerifiedRecall(
                learnerId,
                "de",
                new VerifiedRecallStartRequest(SEK1_CORE_FORMULAS_FLASHCARDS_ID, false));
        long beforeFinalRevision = -1L;
        com.skillpilot.backend.api.VerifiedRecallResultResponse finalResult = null;
        while ("ready".equals(prompt.status())) {
            if (prompt.pendingCards() == 1) {
                beforeFinalRevision = learnerRepository.findById(learnerId)
                        .orElseThrow()
                        .getCoachStateRevision();
            }
            finalResult = learnerService.recordVerifiedRecallResult(
                    learnerId,
                    "de",
                    new VerifiedRecallResultRequest(
                            SEK1_CORE_FORMULAS_FLASHCARDS_ID,
                            prompt.cardId(),
                            true,
                            "korrekt"));
            prompt = finalResult.next();
        }

        assertThat(finalResult).isNotNull();
        assertThat(finalResult.masterySaved()).isTrue();
        assertThat(beforeFinalRevision).isNotNegative();
        Learner successor = learnerRepository.findById(learnerId).orElseThrow();
        assertThat(successor.getActiveGoalId()).isEqualTo(CANONICAL_CHOOSE_REPRESENTATION_ID);
        assertThat(successor.getCoachStateRevision()).isEqualTo(beforeFinalRevision + 1);
        assertThat(plannedGoalRepository.findByLearner_SkillpilotId(learnerId))
                .extracting(PlannedGoal::getGoalId)
                .containsExactly(CANONICAL_REPRESENTATION_CLUSTER_ID);
    }

    @Test
    void verifiedRecallTrustedCustomSizeCarriesIntoTheNextCompleteBatch() {
        activateSekOneCoreFormulaFlashcards();

        var first = learnerService.startVerifiedRecallBatch(
                learnerId,
                "de",
                SEK1_CORE_FORMULAS_FLASHCARDS_ID,
                3);
        assertThat(first.cards()).hasSize(3);
        assertThat(first.configuredBatchSize()).isEqualTo(3);
        List<String> firstCardIds = first.cards().stream()
                .map(VerifiedRecallPromptCard::cardId)
                .toList();
        List<VerifiedRecallBatchCardResult> firstResults = firstCardIds.stream()
                .map(cardId -> new VerifiedRecallBatchCardResult(cardId, true, "korrekt"))
                .toList();

        var recorded = learnerService.recordVerifiedRecallResultsBatch(
                learnerId,
                "de",
                new VerifiedRecallBatchResultRequest(
                        SEK1_CORE_FORMULAS_FLASHCARDS_ID,
                        first.configuredBatchSize(),
                        firstCardIds,
                        first.issuedAt(),
                        firstResults));

        assertThat(recorded.next()).isNotNull();
        assertThat(recorded.next().status()).isEqualTo("ready");
        assertThat(recorded.next().cards()).hasSize(3);
        assertThat(recorded.next().configuredBatchSize()).isEqualTo(3);
        assertThat(recorded.next().issuedAt()).isNotNull();
        List<String> nextCardIds = recorded.next().cards().stream()
                .map(VerifiedRecallPromptCard::cardId)
                .toList();
        assertThat(nextCardIds).doesNotContainAnyElementsOf(firstCardIds);

        var nextAnswers = learnerService.getVerifiedRecallAnswersBatch(
                learnerId,
                "de",
                new VerifiedRecallBatchAnswerRequest(
                        SEK1_CORE_FORMULAS_FLASHCARDS_ID,
                        recorded.next().configuredBatchSize(),
                        nextCardIds,
                        recorded.next().issuedAt()));
        assertThat(nextAnswers.cards()).hasSize(3);
        assertThat(nextAnswers.cards())
                .extracting(VerifiedRecallBatchAnswerCard::cardId)
                .containsExactlyElementsOf(nextCardIds);
    }

    @Test
    void verifiedRecallKeepsConfiguredSizeWhenOnlyTwoCardsAreIssued() {
        activateSekOneCoreFormulaFlashcards();
        Instant issuedAt = Instant.parse("2026-08-12T12:00:00Z");
        ReflectionTestUtils.setField(
                learnerService,
                "verifiedRecallClock",
                Clock.fixed(issuedAt, ZoneOffset.UTC));

        var completeDeck = learnerService.startVerifiedRecallBatch(
                learnerId,
                "de",
                SEK1_CORE_FORMULAS_FLASHCARDS_ID,
                20);
        assertThat(completeDeck.cards()).hasSizeGreaterThan(2);
        List<String> blockedCardIds = completeDeck.cards().stream()
                .map(VerifiedRecallPromptCard::cardId)
                .limit(completeDeck.cards().size() - 2L)
                .toList();
        Map<String, Object> state = new LinkedHashMap<>();
        blockedCardIds.forEach(cardId -> state.put(
                cardId,
                Map.of(
                        "id", cardId,
                        "verifiedRecall", Map.of(
                                "status", "failed",
                                "lastTestedAt", issuedAt.minusSeconds(60).toString()))));
        learnerService.upsertClientState(
                learnerId,
                SEK1_CORE_FORMULAS_FLASHCARDS_ID,
                new ClientStateRequest(issuedAt.minusSeconds(30), state));

        var prompt = learnerService.startVerifiedRecallBatch(
                learnerId,
                "de",
                SEK1_CORE_FORMULAS_FLASHCARDS_ID,
                5);
        assertThat(prompt.batchSize()).isEqualTo(2);
        assertThat(prompt.cards()).hasSize(2);
        assertThat(prompt.configuredBatchSize()).isEqualTo(5);
        assertThat(prompt.issuedAt()).isEqualTo(issuedAt);
        List<String> cardIds = prompt.cards().stream()
                .map(VerifiedRecallPromptCard::cardId)
                .toList();

        var answers = learnerService.getVerifiedRecallAnswersBatch(
                learnerId,
                "de",
                new VerifiedRecallBatchAnswerRequest(
                        SEK1_CORE_FORMULAS_FLASHCARDS_ID,
                        prompt.configuredBatchSize(),
                        cardIds,
                        prompt.issuedAt()));
        assertThat(answers.cards())
                .extracting(VerifiedRecallBatchAnswerCard::cardId)
                .containsExactlyElementsOf(cardIds);

        var saved = learnerService.recordVerifiedRecallResultsBatch(
                learnerId,
                "de",
                new VerifiedRecallBatchResultRequest(
                        SEK1_CORE_FORMULAS_FLASHCARDS_ID,
                        prompt.configuredBatchSize(),
                        cardIds,
                        prompt.issuedAt(),
                        cardIds.stream()
                                .map(cardId -> new VerifiedRecallBatchCardResult(cardId, false, "offen"))
                                .toList()));
        assertThat(saved.next().status()).isEqualTo("waiting");
        assertThat(saved.next().batchSize()).isZero();
        assertThat(saved.next().configuredBatchSize()).isEqualTo(5);
        assertThat(saved.next().issuedAt()).isEqualTo(issuedAt);
    }

    @Test
    void verifiedRecallUsesTheIssuedSelectionInstantAcrossBerlinMidnight() {
        activateSekOneCoreFormulaFlashcards();
        Instant beforeMidnight = Instant.parse("2026-08-12T21:59:30Z");
        Instant afterMidnight = Instant.parse("2026-08-12T22:00:30Z");
        ReflectionTestUtils.setField(
                learnerService,
                "verifiedRecallClock",
                Clock.fixed(beforeMidnight, ZoneOffset.UTC));

        var completeDeck = learnerService.startVerifiedRecallBatch(
                learnerId,
                "de",
                SEK1_CORE_FORMULAS_FLASHCARDS_ID,
                20);
        String cardBlockedBeforeMidnight = completeDeck.cards().getFirst().cardId();
        learnerService.upsertClientState(
                learnerId,
                SEK1_CORE_FORMULAS_FLASHCARDS_ID,
                new ClientStateRequest(
                        beforeMidnight.minusSeconds(15),
                        Map.of(
                                cardBlockedBeforeMidnight,
                                Map.of(
                                        "id", cardBlockedBeforeMidnight,
                                        "verifiedRecall", Map.of(
                                                "status", "failed",
                                                "lastTestedAt", beforeMidnight.minusSeconds(30).toString())))));

        var prompt = learnerService.startVerifiedRecallBatch(
                learnerId,
                "de",
                SEK1_CORE_FORMULAS_FLASHCARDS_ID,
                5);
        assertThat(prompt.issuedAt()).isEqualTo(beforeMidnight);
        assertThat(prompt.configuredBatchSize()).isEqualTo(5);
        assertThat(prompt.cards())
                .extracting(VerifiedRecallPromptCard::cardId)
                .doesNotContain(cardBlockedBeforeMidnight);
        List<String> cardIds = prompt.cards().stream()
                .map(VerifiedRecallPromptCard::cardId)
                .toList();

        ReflectionTestUtils.setField(
                learnerService,
                "verifiedRecallClock",
                Clock.fixed(afterMidnight, ZoneOffset.UTC));
        var answers = learnerService.getVerifiedRecallAnswersBatch(
                learnerId,
                "de",
                new VerifiedRecallBatchAnswerRequest(
                        SEK1_CORE_FORMULAS_FLASHCARDS_ID,
                        prompt.configuredBatchSize(),
                        cardIds,
                        prompt.issuedAt()));
        assertThat(answers.cards())
                .extracting(VerifiedRecallBatchAnswerCard::cardId)
                .containsExactlyElementsOf(cardIds);

        var saved = learnerService.recordVerifiedRecallResultsBatch(
                learnerId,
                "de",
                new VerifiedRecallBatchResultRequest(
                        SEK1_CORE_FORMULAS_FLASHCARDS_ID,
                        prompt.configuredBatchSize(),
                        cardIds,
                        prompt.issuedAt(),
                        cardIds.stream()
                                .map(cardId -> new VerifiedRecallBatchCardResult(cardId, true, "korrekt"))
                                .toList()));
        assertThat(saved.next().issuedAt()).isEqualTo(afterMidnight);
        assertThat(saved.next().configuredBatchSize()).isEqualTo(5);
        assertThat(saved.next().cards())
                .extracting(VerifiedRecallPromptCard::cardId)
                .contains(cardBlockedBeforeMidnight);
    }

    @Test
    void invalidVerifiedRecallBatchResultWritesNothing() {
        activateSekOneCoreFormulaFlashcards();

        var prompt = learnerService.startVerifiedRecallBatch(
                learnerId,
                "de",
                SEK1_CORE_FORMULAS_FLASHCARDS_ID);
        List<String> cardIds = prompt.cards().stream()
                .map(VerifiedRecallPromptCard::cardId)
                .toList();
        long beforeRevision = learnerRepository.findById(learnerId).orElseThrow().getCoachStateRevision();
        List<VerifiedRecallBatchCardResult> incompleteResults = cardIds.subList(0, cardIds.size() - 1).stream()
                .map(cardId -> new VerifiedRecallBatchCardResult(cardId, true, "korrekt"))
                .toList();

        assertThatThrownBy(() -> learnerService.recordVerifiedRecallResultsBatch(
                learnerId,
                "de",
                new VerifiedRecallBatchResultRequest(
                        SEK1_CORE_FORMULAS_FLASHCARDS_ID,
                        prompt.configuredBatchSize(),
                        cardIds,
                        prompt.issuedAt(),
                        incompleteResults)))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("cover the complete batch");

        assertThat(learnerRepository.findById(learnerId).orElseThrow().getCoachStateRevision())
                .isEqualTo(beforeRevision);
        var restarted = learnerService.startVerifiedRecallBatch(
                learnerId,
                "de",
                SEK1_CORE_FORMULAS_FLASHCARDS_ID);
        assertThat(restarted.verifiedCards()).isZero();
        assertThat(restarted.cards())
                .extracting(VerifiedRecallPromptCard::cardId)
                .containsExactlyElementsOf(cardIds);
    }

    @Test
    void concurrentVerifiedRecallResultsPreserveBothCardUpdates() throws Exception {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setPersonalCurriculum(completedPersonalizationConfig("""
                {
                  "a0e13c56-c25f-4742-9272-3a1a603ee52e": {"selected": true, "filterId": "ALL"},
                  "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced": {"selected": true, "filterId": "GK"},
                  "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a": {"selected": true, "filterId": "ALL"}
                }
                """));
        learner.setActiveGoalId(SEK1_CORE_FORMULAS_FLASHCARDS_ID);
        learner.setLearningState(LearningState.TEACHING);
        learnerRepository.saveAndFlush(learner);
        learnerService.setPlannedGoals(learnerId, Set.of(SEK1_CORE_FORMULAS_FLASHCARDS_ID));
        var prompt = learnerService.startVerifiedRecall(
                learnerId,
                "de",
                new VerifiedRecallStartRequest(null, false, 2));
        assertThat(prompt.cards()).hasSize(2);

        CountDownLatch ready = new CountDownLatch(2);
        CountDownLatch start = new CountDownLatch(1);
        ExecutorService executor = Executors.newFixedThreadPool(2);
        try {
            var results = prompt.cards().stream()
                    .map(card -> executor.submit(() -> {
                        ready.countDown();
                        assertThat(start.await(10, TimeUnit.SECONDS)).isTrue();
                        return learnerService.recordVerifiedRecallResult(
                                learnerId,
                                "de",
                                new VerifiedRecallResultRequest(
                                        SEK1_CORE_FORMULAS_FLASHCARDS_ID,
                                        card.cardId(),
                                        true,
                                        "parallel verified"));
                    }))
                    .toList();
            assertThat(ready.await(10, TimeUnit.SECONDS)).isTrue();
            start.countDown();
            for (Future<?> result : results) {
                assertThat(result.get(20, TimeUnit.SECONDS)).isNotNull();
            }
        } finally {
            executor.shutdownNow();
        }

        var restarted = learnerService.startVerifiedRecall(
                learnerId,
                "de",
                new VerifiedRecallStartRequest(null, false, 2));
        assertThat(restarted.verifiedCards()).isEqualTo(2);
    }

    @Test
    void concurrentScopeReplacementNeverMergesTwoExclusiveSelections() throws Exception {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setPersonalCurriculum(completedPersonalizationConfig("""
                {
                  "a0e13c56-c25f-4742-9272-3a1a603ee52e": {"selected": true, "filterId": "DE-HE"},
                  "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced": {"selected": true, "filterId": "GK"}
                }
                """));
        learnerRepository.saveAndFlush(learner);
        CountDownLatch ready = new CountDownLatch(2);
        CountDownLatch start = new CountDownLatch(1);
        ExecutorService executor = Executors.newFixedThreadPool(2);
        try {
            Future<?> first = executor.submit(() -> {
                ready.countDown();
                assertThat(start.await(10, TimeUnit.SECONDS)).isTrue();
                learnerService.setScope(learnerId, List.of(COMPOSITION_J8_SCOPE_ID));
                return null;
            });
            Future<?> second = executor.submit(() -> {
                ready.countDown();
                assertThat(start.await(10, TimeUnit.SECONDS)).isTrue();
                learnerService.setScope(learnerId, List.of(COMPOSITION_J9_SCOPE_ID));
                return null;
            });
            assertThat(ready.await(10, TimeUnit.SECONDS)).isTrue();
            start.countDown();
            first.get(20, TimeUnit.SECONDS);
            second.get(20, TimeUnit.SECONDS);
        } finally {
            executor.shutdownNow();
        }

        assertThat(plannedGoalRepository.findByLearner_SkillpilotId(learnerId))
                .extracting(planned -> planned.getGoalId())
                .singleElement()
                .isIn(COMPOSITION_J8_SCOPE_ID, COMPOSITION_J9_SCOPE_ID);
    }

    @Test
    @Transactional
    void verifiedRecallFailureLocksCardForRestOfDay() {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setPersonalCurriculum(completedPersonalizationConfig("""
                {
                  "a0e13c56-c25f-4742-9272-3a1a603ee52e": {"selected": true, "filterId": "ALL"},
                  "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced": {"selected": true, "filterId": "GK"},
                  "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a": {"selected": true, "filterId": "ALL"}
                }
                """));
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
        learner.setPersonalCurriculum(completedPersonalizationConfig("""
                {
                  "a0e13c56-c25f-4742-9272-3a1a603ee52e": {"selected": true, "filterId": "ALL"},
                  "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced": {"selected": true, "filterId": "GK"},
                  "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a": {"selected": true, "filterId": "ALL"}
                }
                """));
        learner.setActiveGoalId(SEK1_CORE_FORMULAS_FLASHCARDS_ID);
        learner.setLearningState(LearningState.TEACHING);
        learnerRepository.save(learner);
        learnerService.setPlannedGoals(
                learnerId,
                Set.of(SEK1_CORE_FORMULAS_FLASHCARDS_ID));

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
        learner.setPersonalCurriculum(completedPersonalizationConfig("""
                {
                  "a0e13c56-c25f-4742-9272-3a1a603ee52e": {"selected": true, "filterId": "DE-HE"},
                  "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced": {"selected": true, "filterId": "GK"}
                }
                """));
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

    @Test
    void sequentialAutopilot_prefersNextLocalExamSiblingOverGlobalFrontierOrder() {
        Map<String, LearningGoal> goals = new HashMap<>();
        goals.put("ROOT", goal("ROOT", List.of(), List.of("J5_EXAMS", "SEK2")));
        goals.put("J5_EXAMS", goal("J5_EXAMS", List.of(), List.of("J5_TASK_1", "J5_TASK_2", "J5_TASK_3")));
        goals.put("J5_TASK_1", goal("J5_TASK_1", List.of(), List.of()));
        goals.put("J5_TASK_2", goal("J5_TASK_2", List.of(), List.of()));
        goals.put("J5_TASK_3", goal("J5_TASK_3", List.of(), List.of()));
        goals.put("SEK2", goal("SEK2", List.of(), List.of("SEK2_TASK")));
        goals.put("SEK2_TASK", goal("SEK2_TASK", List.of(), List.of()));

        List<FrontierGoal> globalFrontierOrder = List.of(
                frontierGoal("SEK2_TASK"),
                frontierGoal("J5_TASK_2"),
                frontierGoal("J5_TASK_3"));

        FrontierGoal selected = ReflectionTestUtils.invokeMethod(
                learnerService,
                "findSequentialLocalFrontierGoal",
                "J5_TASK_1",
                globalFrontierOrder,
                goals);

        assertThat(selected).isNotNull();
        assertThat(selected.id()).isEqualTo("J5_TASK_2");
    }

    @Test
    void sequentialAutopilotReturnsEarlierOpenExamSiblingBeforeLaterProgramUnit() {
        Map<String, LearningGoal> goals = new HashMap<>();
        goals.put("ROOT", goal("ROOT", List.of(), List.of("J7_EXAMS", "J8")));
        goals.put("J7_EXAMS", goal("J7_EXAMS", List.of(), List.of("J7_TASK_4", "J7_TASK_6", "J7_TASK_7")));
        goals.put("J7_TASK_4", goal("J7_TASK_4", List.of(), List.of()));
        goals.put("J7_TASK_6", goal("J7_TASK_6", List.of(), List.of()));
        goals.put("J7_TASK_7", goal("J7_TASK_7", List.of(), List.of()));
        goals.put("J8", goal("J8", List.of(), List.of("J8_TASK")));
        goals.put("J8_TASK", goal("J8_TASK", List.of(), List.of()));

        FrontierGoal selected = ReflectionTestUtils.invokeMethod(
                learnerService,
                "findSequentialLocalFrontierGoal",
                "J7_TASK_7",
                List.of(
                        frontierGoal("J8_TASK"),
                        frontierGoal("J7_TASK_4"),
                        frontierGoal("J7_TASK_6")),
                goals);

        assertThat(selected).isNotNull();
        assertThat(selected.id()).isEqualTo("J7_TASK_4");
    }

    @Test
    @SuppressWarnings("unchecked")
    void frontierOrderFollowsAuthoredTargetOrderInsteadOfCanonicalMapOrder() {
        List<FrontierGoal> ordered = ReflectionTestUtils.invokeMethod(
                learnerService,
                "orderFrontierByTargetOrder",
                List.of(frontierGoal("J8_TASK"), frontierGoal("J7_TASK")),
                new LinkedHashSet<>(List.of("J7_TASK", "J8_TASK")));

        assertThat(ordered)
                .extracting(FrontierGoal::id)
                .containsExactly("J7_TASK", "J8_TASK");
    }

    @Test
    void sequentialAutopilot_continuesInsideFocusWhenLocalSegmentIsExhausted() {
        Learner learner = new Learner();
        learner.setLearningStrategy("SEQUENTIAL");
        Map<String, LearningGoal> goals = sequentialAutopilotFocusGoals();

        FrontierGoal selected = ReflectionTestUtils.invokeMethod(
                learnerService,
                "chooseAutopilotFrontierGoal",
                learner,
                List.of(frontierGoal("SEK2_TASK")),
                List.of(frontierGoal("SEK2_TASK")),
                "J5_TASK_1",
                goals);

        assertThat(selected).isNotNull();
        assertThat(selected.id()).isEqualTo("SEK2_TASK");
    }

    @Test
    void sequentialAutopilot_prefersOpenLocalSiblingOverEarlierFrontierEntry() {
        Learner learner = new Learner();
        learner.setLearningStrategy("SEQUENTIAL");
        Map<String, LearningGoal> goals = sequentialAutopilotFocusGoals();
        List<FrontierGoal> frontier = List.of(frontierGoal("SEK2_TASK"), frontierGoal("J5_TASK_2"));

        FrontierGoal selected = ReflectionTestUtils.invokeMethod(
                learnerService,
                "chooseAutopilotFrontierGoal",
                learner,
                frontier,
                frontier,
                "J5_TASK_1",
                goals);

        assertThat(selected).isNotNull();
        assertThat(selected.id()).isEqualTo("J5_TASK_2");
    }

    private Map<String, LearningGoal> sequentialAutopilotFocusGoals() {
        Map<String, LearningGoal> goals = new HashMap<>();
        goals.put("ROOT", goal("ROOT", List.of(), List.of("J5_EXAMS", "SEK2")));
        goals.put("J5_EXAMS", goal("J5_EXAMS", List.of(), List.of("J5_TASK_1", "J5_TASK_2")));
        goals.put("J5_TASK_1", goal("J5_TASK_1", List.of(), List.of()));
        goals.put("J5_TASK_2", goal("J5_TASK_2", List.of(), List.of()));
        goals.put("SEK2", goal("SEK2", List.of(), List.of("SEK2_TASK")));
        goals.put("SEK2_TASK", goal("SEK2_TASK", List.of(), List.of()));
        return goals;
    }

    private void completeCurrentScope() {
        var initialState = learnerService.getLearnerState(learnerId);
        if (initialState.goals().scope() == null) {
            throw new AssertionError("Expected a selected scope before completing it.");
        }
        int remainingAtomicGoals = Math.toIntExact(Math.max(
                0L,
                initialState.goals().scope().total_atomic()
                        - initialState.goals().scope().mastered_atomic()));
        completeCurrentScope(remainingAtomicGoals + SCOPE_COMPLETION_SAFETY_MARGIN);
    }

    private void completeCurrentScope(int maxIterations) {
        Set<String> attemptedGoalIds = new LinkedHashSet<>();
        for (int iteration = 0; iteration < maxIterations; iteration += 1) {
            var state = learnerService.getLearnerState(learnerId);
            if (Boolean.TRUE.equals(state.goals().scope_completed())) {
                return;
            }
            var nextGoal = state.frontier().stream()
                    .filter(goal -> "atomic".equals(goal.type()))
                    .findFirst()
                    .orElseThrow(() -> new AssertionError("Expected an atomic frontier goal before scope completion."));
            if (!attemptedGoalIds.add(nextGoal.id())) {
                throw new AssertionError(
                        "Scope completion stalled on the already attempted frontier goal " + nextGoal.id() + ".");
            }
            learnerService.setMastery(
                    learnerId,
                    new MasteryUpdateRequest(Map.of(nextGoal.id(), 1.0), nextGoal.id()));
        }
        var finalState = learnerService.getLearnerState(learnerId);
        if (Boolean.TRUE.equals(finalState.goals().scope_completed())) {
            return;
        }
        throw new AssertionError("Scope did not complete within " + maxIterations + " mastery updates.");
    }

    private void activateSekOneCoreFormulaFlashcards() {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setPersonalCurriculum(completedPersonalizationConfig("""
                {
                  "a0e13c56-c25f-4742-9272-3a1a603ee52e": {"selected": true, "filterId": "ALL"},
                  "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced": {"selected": true, "filterId": "GK"},
                  "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a": {"selected": true, "filterId": "ALL"}
                }
                """));
        learner.setActiveGoalId(SEK1_CORE_FORMULAS_FLASHCARDS_ID);
        learner.setLearningState(LearningState.TEACHING);
        learnerRepository.saveAndFlush(learner);
        learnerService.setPlannedGoals(learnerId, Set.of(SEK1_CORE_FORMULAS_FLASHCARDS_ID));
    }

    private void prepareMemoryThenRepresentationLearningPlan() {
        activateSekOneCoreFormulaFlashcards();
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        masteryRepository.saveAndFlush(new Mastery(learner, CANONICAL_MATH_ORIENTATION_ID, 1.0));

        LocalDate planDate = LocalDate.parse("2026-09-01");
        ZoneId berlin = ZoneId.of("Europe/Berlin");
        ReflectionTestUtils.setField(
                learnerService,
                "learningPlanClock",
                Clock.fixed(planDate.atStartOfDay(berlin).toInstant(), berlin));
        learnerLearningPlanService.upsert(
                learnerId,
                CANONICAL_MATH_LANDSCAPE_ID,
                new com.skillpilot.backend.api.LearnerLearningPlanApi.UpsertRequest(
                        0L,
                        "Memory und Darstellungen",
                        List.of(
                                new com.skillpilot.backend.api.LearnerLearningPlanApi.Block(
                                        "memory",
                                        "learning",
                                        SEK1_CORE_FORMULAS_FLASHCARDS_ID,
                                        "Lernkarten",
                                        planDate,
                                        planDate,
                                        null,
                                        List.of(SEK1_CORE_FORMULAS_FLASHCARDS_ID)),
                                new com.skillpilot.backend.api.LearnerLearningPlanApi.Block(
                                        "representations",
                                        "learning",
                                        CANONICAL_REPRESENTATION_CLUSTER_ID,
                                        "Darstellungen",
                                        planDate,
                                        planDate,
                                        null,
                                        List.of(CANONICAL_CHOOSE_REPRESENTATION_ID)))),
                planDate);
        learnerService.setPreferences(learnerId, "SEQUENTIAL", false, null, null, true);
    }

    private void selectCompletedCanonicalMathCurriculum() {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setPersonalCurriculum(completedPersonalizationConfig("""
                {
                  "a0e13c56-c25f-4742-9272-3a1a603ee52e": {
                    "selected": true,
                    "filterId": "DE-HE",
                    "stage": "CrossStage",
                    "durationModel": "G9"
                  },
                  "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced": {
                    "selected": true,
                    "filterId": "GK"
                  }
                }
                """));
        learnerRepository.save(learner);
    }

    private void prepareRepresentationLearningPlan() {
        selectCompletedCanonicalMathCurriculum();
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        masteryRepository.saveAndFlush(new Mastery(learner, CANONICAL_MATH_ORIENTATION_ID, 1.0));
        learnerService.setPlannedGoals(learnerId, Set.of(CANONICAL_REPRESENTATION_CLUSTER_ID));
        assertThat(learnerService.getUncompactedRichFrontierForFocus(
                        learnerId,
                        List.of(CANONICAL_REPRESENTATION_CLUSTER_ID)))
                .extracting(FrontierGoal::id)
                .contains(CANONICAL_CHOOSE_REPRESENTATION_ID);
        ReflectionTestUtils.setField(
                learnerService,
                "learningPlanClock",
                Clock.fixed(
                        LocalDate.parse("2026-09-02")
                                .atStartOfDay(ZoneId.of("Europe/Berlin"))
                                .toInstant(),
                        ZoneId.of("Europe/Berlin")));
        var block = new com.skillpilot.backend.api.LearnerLearningPlanApi.Block(
                "representations",
                "learning",
                CANONICAL_REPRESENTATION_CLUSTER_ID,
                "Darstellungen",
                LocalDate.parse("2026-09-01"),
                LocalDate.parse("2026-09-02"),
                null,
                List.of(
                        CANONICAL_CHOOSE_REPRESENTATION_ID,
                        CANONICAL_CREATE_REPRESENTATION_ID));
        learnerLearningPlanService.upsert(
                learnerId,
                CANONICAL_MATH_LANDSCAPE_ID,
                new com.skillpilot.backend.api.LearnerLearningPlanApi.UpsertRequest(
                        0L,
                        "Darstellungen",
                        List.of(block)),
                LocalDate.parse("2026-09-02"));
    }

    private void selectCompletedHessenSekTwoLkCurriculum() {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setPersonalCurriculum(completedPersonalizationConfig("""
                {
                  "a0e13c56-c25f-4742-9272-3a1a603ee52e": {
                    "selected": true,
                    "filterId": "DE-HE",
                    "stage": "SekII",
                    "durationModel": "G9"
                  },
                  "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced": {
                    "selected": true,
                    "filterId": "LK"
                  }
                }
                """));
        learnerRepository.saveAndFlush(learner);
    }

    private void selectCompletedCanonicalMathCrossStageCurriculum() {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setPersonalCurriculum(completedPersonalizationConfig("""
                {
                  "a0e13c56-c25f-4742-9272-3a1a603ee52e": {
                    "selected": true,
                    "filterId": "ALL",
                    "stage": "CrossStage",
                    "durationModel": "G9"
                  },
                  "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced": {
                    "selected": true,
                    "filterId": "ALL"
                  }
                }
                """));
        learnerRepository.save(learner);
    }

    private void collectAtomicGoalIds(
            String goalId,
            Map<String, LearningGoal> canonicalGoals,
            Set<String> atomicGoalIds) {
        LearningGoal goal = canonicalGoals.get(goalId);
        if (goal == null) {
            return;
        }
        if (goal.getContains() == null || goal.getContains().isEmpty()) {
            atomicGoalIds.add(goalId);
            return;
        }
        goal.getContains().forEach(childId -> collectAtomicGoalIds(childId, canonicalGoals, atomicGoalIds));
    }

    @SuppressWarnings("unchecked")
    private String completedPersonalizationConfig(String json) {
        try {
            Map<String, Object> config = objectMapper.readValue(json, Map.class);
            Map<String, Object> rootConfig = config.get(CANONICAL_GYMNASIUM_ROOT_ID) instanceof Map<?, ?> rawRoot
                    ? new LinkedHashMap<>((Map<String, Object>) rawRoot)
                    : new LinkedHashMap<>();
            rootConfig.putIfAbsent("selected", true);
            rootConfig.putIfAbsent("stage", "CrossStage");
            rootConfig.putIfAbsent("durationModel", "G9");
            config.put(CANONICAL_GYMNASIUM_ROOT_ID, rootConfig);
            Map<String, Object> flowState = new LinkedHashMap<>();
            flowState.put(
                    CurriculumPersonalizationPlanner.ROOT_LANDSCAPE_ID_KEY,
                    CANONICAL_GYMNASIUM_ROOT_ID);
            flowState.put(
                    CurriculumPersonalizationPlanner.COMPLETED_OPTION_IDS_KEY,
                    List.of());
            flowState.put(
                    CurriculumPersonalizationPlanner.MIGRATION_COMPLETED_KEY,
                    true);
            config.put(
                    CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY,
                    flowState);
            return objectMapper.writeValueAsString(config);
        } catch (Exception exception) {
            throw new AssertionError("Invalid test personalization fixture", exception);
        }
    }

    private static com.skillpilot.backend.api.LearnerLearningPlanApi.Block learningPlanBlock(
            String id,
            String startDate,
            String endDate,
            List<String> atomicGoalIds) {
        return new com.skillpilot.backend.api.LearnerLearningPlanApi.Block(
                id,
                "learning",
                null,
                id,
                LocalDate.parse(startDate),
                LocalDate.parse(endDate),
                null,
                atomicGoalIds);
    }

    private static LearningGoal goal(String id, List<String> requires, List<String> contains) {
        LearningGoal g = new LearningGoal();
        g.setId(id);
        g.setRequires(requires == null ? List.of() : new ArrayList<>(requires));
        g.setContains(contains == null ? List.of() : new ArrayList<>(contains));
        return g;
    }

    private static FrontierGoal frontierGoal(String id) {
        return new FrontierGoal(id, id, "", "atomic", "exam", "Prerequisites met",
                List.of(), List.of(), null, null, null, null);
    }
}
