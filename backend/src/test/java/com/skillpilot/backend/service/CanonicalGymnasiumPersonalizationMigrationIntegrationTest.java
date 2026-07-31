package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.skillpilot.backend.api.PersonalizationPlan;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.LearningState;
import com.skillpilot.backend.domain.Mastery;
import com.skillpilot.backend.domain.MasteryId;
import com.skillpilot.backend.domain.PlannedGoal;
import com.skillpilot.backend.repository.LearnerClientStateRepository;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import com.skillpilot.backend.repository.PlannedGoalRepository;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class CanonicalGymnasiumPersonalizationMigrationIntegrationTest {

    private static final String ROOT_ID = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
    private static final String MATH_ID = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
    private static final String PHYSICS_ID = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
    private static final String SEK1_MARKER_ID = "__skillpilot_stage_scope_sek1__";
    private static final String SEK2_MARKER_ID = "__skillpilot_stage_scope_sek2__";
    private static final String VISIBLE_MATH_FOCUS_ID =
            "65365dce-f33f-49d8-9516-42f75883aa86";

    @Autowired
    private LearnerService learnerService;

    @Autowired
    private LearnerRepository learnerRepository;

    @Autowired
    private LearnerClientStateRepository learnerClientStateRepository;

    @Autowired
    private PlannedGoalRepository plannedGoalRepository;

    @Autowired
    private MasteryRepository masteryRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        clearLearners();
    }

    @AfterEach
    void tearDown() {
        clearLearners();
    }

    private void clearLearners() {
        learnerClientStateRepository.deleteAll();
        masteryRepository.deleteAll();
        plannedGoalRepository.deleteAll();
        learnerRepository.deleteAll();
    }

    @Test
    void migratesCrossStageLosslesslyAndPreservesLearningStateIdempotently()
            throws Exception {
        String learnerId = "legacy-stage-cross";
        String activeGoalId = "active-goal-before-stage-migration";
        String plannedGoalId = "planned-goal-before-stage-migration";
        String masteryGoalId = "mastery-goal-before-stage-migration";

        Map<String, Object> config = legacyConfig(true, true);
        config.put(
                PHYSICS_ID,
                Map.of(
                        "selected", true,
                        "filterId", "ALL",
                        "legacyPhysicsExtension",
                                Map.of("keep", List.of("alpha", "beta"))));
        config.put(
                "legacyOpaqueExtension",
                List.of("preserve", Map.of("nested", 7)));
        @SuppressWarnings("unchecked")
        Map<String, Object> rootSettings =
                new LinkedHashMap<>((Map<String, Object>) config.get(ROOT_ID));
        rootSettings.put(
                "legacyRootExtension",
                Map.of("nested", Map.of("value", "keep-root")));
        config.put(ROOT_ID, rootSettings);
        @SuppressWarnings("unchecked")
        Map<String, Object> mathSettings =
                new LinkedHashMap<>((Map<String, Object>) config.get(MATH_ID));
        mathSettings.put(
                "legacyMathExtension",
                Map.of("numbers", List.of(1, 2, 3)));
        config.put(MATH_ID, mathSettings);

        Learner learner = createLearner(learnerId, config);
        learner.setActiveGoalId(activeGoalId);
        learner.setLearningState(LearningState.TEACHING);
        learnerRepository.saveAndFlush(learner);

        PlannedGoal plannedGoal =
                plannedGoalRepository.saveAndFlush(
                        new PlannedGoal(learner, plannedGoalId));
        Instant plannedGoalCreatedAt = plannedGoalRepository
                .findById(plannedGoal.getId())
                .orElseThrow()
                .getCreatedAt();
        masteryRepository.saveAndFlush(
                new Mastery(learner, masteryGoalId, 0.625));
        Instant masteryUpdatedAt = masteryRepository
                .findById(new MasteryId(learnerId, masteryGoalId))
                .orElseThrow()
                .getUpdatedAt();

        JsonNode before = persistedConfig(learnerId);
        JsonNode expectedRootWithoutStage = before.path(ROOT_ID).deepCopy();
        JsonNode expectedMath = before.path(MATH_ID).deepCopy();
        JsonNode expectedPhysics = before.path(PHYSICS_ID).deepCopy();
        JsonNode expectedSek1Marker = before.path(SEK1_MARKER_ID).deepCopy();
        JsonNode expectedSek2Marker = before.path(SEK2_MARKER_ID).deepCopy();
        JsonNode expectedOpaqueExtension =
                before.path("legacyOpaqueExtension").deepCopy();

        assertThat(learnerService
                        .migrateCanonicalGymnasiumPreFlowPersonalization())
                .isOne();

        Learner migrated = persistedLearner(learnerId);
        JsonNode migratedConfig = objectMapper.readTree(migrated.getPersonalCurriculum());
        ObjectNode actualRootWithoutStage =
                (ObjectNode) migratedConfig.path(ROOT_ID).deepCopy();
        assertThat(actualRootWithoutStage.remove("stage")).isNotNull();

        assertThat(actualRootWithoutStage).isEqualTo(expectedRootWithoutStage);
        assertThat(migratedConfig.path(ROOT_ID).path("stage").asText())
                .isEqualTo("CrossStage");
        assertThat(migratedConfig.path(MATH_ID)).isEqualTo(expectedMath);
        assertThat(migratedConfig.path(PHYSICS_ID)).isEqualTo(expectedPhysics);
        assertThat(migratedConfig.path(SEK1_MARKER_ID))
                .isEqualTo(expectedSek1Marker);
        assertThat(migratedConfig.path(SEK2_MARKER_ID))
                .isEqualTo(expectedSek2Marker);
        assertThat(migratedConfig.path("legacyOpaqueExtension"))
                .isEqualTo(expectedOpaqueExtension);
        assertThat(migratedConfig)
                .hasSize(before.size() + 1);
        assertThat(migratedConfig
                        .path(CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY)
                        .path(CurriculumPersonalizationPlanner.MIGRATION_COMPLETED_KEY)
                        .asBoolean())
                .isTrue();

        assertThat(migrated.getSelectedCurriculum()).isEqualTo(ROOT_ID);
        assertThat(migrated.getActiveGoalId()).isEqualTo(activeGoalId);
        assertThat(migrated.getLearningState()).isEqualTo(LearningState.TEACHING);
        assertThat(plannedGoalRepository.findByLearner_SkillpilotId(learnerId))
                .singleElement()
                .satisfies(stored -> {
                    assertThat(stored.getGoalId()).isEqualTo(plannedGoalId);
                    assertThat(stored.getCreatedAt()).isEqualTo(plannedGoalCreatedAt);
                });
        assertThat(masteryRepository.findById(
                        new MasteryId(learnerId, masteryGoalId)))
                .hasValueSatisfying(stored -> {
                    assertThat(stored.getValue()).isEqualTo(0.625);
                    assertThat(stored.getUpdatedAt()).isEqualTo(masteryUpdatedAt);
                });

        PersonalizationPlan plan = learnerService.getPersonalizationPlan(learnerId);
        assertThat(plan.stage()).isEqualTo(PersonalizationPlan.Stage.COMPLETE);
        assertThat(plan.canReopenMigratedPersonalization()).isTrue();
        JsonNode afterFirstRun = persistedConfig(learnerId);

        assertThat(learnerService
                        .migrateCanonicalGymnasiumPreFlowPersonalization())
                .isZero();

        assertThat(persistedConfig(learnerId)).isEqualTo(afterFirstRun);
        Learner afterSecondRun = persistedLearner(learnerId);
        assertThat(afterSecondRun.getActiveGoalId()).isEqualTo(activeGoalId);
        assertThat(afterSecondRun.getLearningState()).isEqualTo(LearningState.TEACHING);
        assertThat(plannedGoalRepository.findByLearner_SkillpilotId(learnerId))
                .singleElement()
                .satisfies(stored -> {
                    assertThat(stored.getGoalId()).isEqualTo(plannedGoalId);
                    assertThat(stored.getCreatedAt()).isEqualTo(plannedGoalCreatedAt);
                });
        assertThat(masteryRepository.findById(
                        new MasteryId(learnerId, masteryGoalId)))
                .hasValueSatisfying(stored -> {
                    assertThat(stored.getValue()).isEqualTo(0.625);
                    assertThat(stored.getUpdatedAt()).isEqualTo(masteryUpdatedAt);
                });
    }

    @Test
    void migratesTrueFalseMarkersToSekOne() throws Exception {
        String learnerId = "legacy-stage-seki";
        createLearner(learnerId, legacyConfig(true, false));

        assertThat(learnerService
                        .migrateCanonicalGymnasiumPreFlowPersonalization())
                .isOne();

        JsonNode persisted = persistedConfig(learnerId);
        assertThat(persisted.path(ROOT_ID).path("stage").asText())
                .isEqualTo("SekI");
        assertThat(persisted.path(SEK1_MARKER_ID).path("selected").asBoolean())
                .isTrue();
        assertThat(persisted.path(SEK2_MARKER_ID).path("selected").asBoolean())
                .isFalse();
    }

    @Test
    void migratesFalseTrueMarkersToSekTwo() throws Exception {
        String learnerId = "legacy-stage-sekii";
        createLearner(learnerId, legacyConfig(false, true));

        assertThat(learnerService
                        .migrateCanonicalGymnasiumPreFlowPersonalization())
                .isOne();

        JsonNode persisted = persistedConfig(learnerId);
        assertThat(persisted.path(ROOT_ID).path("stage").asText())
                .isEqualTo("SekII");
        assertThat(persisted.path(SEK1_MARKER_ID).path("selected").asBoolean())
                .isFalse();
        assertThat(persisted.path(SEK2_MARKER_ID).path("selected").asBoolean())
                .isTrue();
    }

    @Test
    void leavesFalseFalseMarkersUnresolved() throws Exception {
        String learnerId = "legacy-stage-unresolved";
        createLearner(learnerId, legacyConfig(false, false));
        JsonNode before = persistedConfig(learnerId);

        assertThat(learnerService
                        .migrateCanonicalGymnasiumPreFlowPersonalization())
                .isZero();

        PersonalizationPlan plan = learnerService.getPersonalizationPlan(learnerId);
        assertThat(plan.stage()).isEqualTo(PersonalizationPlan.Stage.SELECTION);
        assertThat(plan.groupId()).isEqualTo("stage");
        assertThat(plan.options())
                .extracting(PersonalizationPlan.Option::scopeValue)
                .containsExactly("SekI", "SekII", "CrossStage");
        assertThat(persistedConfig(learnerId)).isEqualTo(before);
        assertThat(before.path(ROOT_ID).has("stage")).isFalse();
        assertThat(before.has(
                        CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY))
                .isFalse();
    }

    @Test
    void leavesMissingOrMalformedMarkersUnresolved() throws Exception {
        String missingId = "legacy-stage-marker-missing";
        Map<String, Object> missing = legacyConfig(true, true);
        missing.remove(SEK2_MARKER_ID);
        createLearner(missingId, missing);

        String malformedId = "legacy-stage-marker-malformed";
        Map<String, Object> malformed = legacyConfig(true, false);
        malformed.put(SEK1_MARKER_ID, Map.of("selected", "true"));
        createLearner(malformedId, malformed);

        JsonNode missingBefore = persistedConfig(missingId);
        JsonNode malformedBefore = persistedConfig(malformedId);

        assertThat(learnerService
                        .migrateCanonicalGymnasiumPreFlowPersonalization())
                .isZero();

        assertThat(persistedConfig(missingId)).isEqualTo(missingBefore);
        assertThat(persistedConfig(malformedId)).isEqualTo(malformedBefore);
        assertThat(missingBefore.path(ROOT_ID).has("stage")).isFalse();
        assertThat(malformedBefore.path(ROOT_ID).has("stage")).isFalse();
    }

    @Test
    void explicitCanonicalRootStageWinsOverContradictoryLegacyMarkers()
            throws Exception {
        String learnerId = "canonical-stage-wins";
        Map<String, Object> config = legacyConfig(true, false);
        @SuppressWarnings("unchecked")
        Map<String, Object> rootSettings =
                new LinkedHashMap<>((Map<String, Object>) config.get(ROOT_ID));
        rootSettings.put("stage", "SekII");
        config.put(ROOT_ID, rootSettings);
        @SuppressWarnings("unchecked")
        Map<String, Object> mathSettings =
                new LinkedHashMap<>((Map<String, Object>) config.get(MATH_ID));
        mathSettings.put("stage", "CrossStage");
        config.put(MATH_ID, mathSettings);
        createLearner(learnerId, config);
        JsonNode before = persistedConfig(learnerId);

        assertThat(learnerService
                        .migrateCanonicalGymnasiumPreFlowPersonalization())
                .isZero();

        PersonalizationPlan plan = learnerService.getPersonalizationPlan(learnerId);
        assertThat(persistedConfig(learnerId)).isEqualTo(before);
        assertThat(before.path(ROOT_ID).path("stage").asText()).isEqualTo("SekII");
        assertThat(before.path(MATH_ID).path("stage").asText())
                .isEqualTo("CrossStage");
        assertThat(before.path(SEK1_MARKER_ID).path("selected").asBoolean())
                .isTrue();
        assertThat(before.path(SEK2_MARKER_ID).path("selected").asBoolean())
                .isFalse();
        assertThat(plan.completedDecisions())
                .filteredOn(decision -> "stage".equals(decision.groupId()))
                .singleElement()
                .satisfies(decision -> assertThat(decision.selectedOptions())
                        .singleElement()
                        .extracting(PersonalizationPlan.Option::scopeValue)
                        .isEqualTo("SekII"));
    }

    @Test
    void rejectsInvalidRootFilterOrMissingAuthoredSubjectWithoutChangingJson()
            throws Exception {
        String invalidFilterId = "legacy-stage-invalid-root-filter";
        Map<String, Object> invalidFilter = legacyConfig(true, true);
        invalidFilter.put(
                ROOT_ID,
                Map.of(
                        "selected", true,
                        "filterId", "NOT-A-JURISDICTION"));
        createLearner(invalidFilterId, invalidFilter);

        String noSubjectId = "legacy-stage-no-authored-subject";
        Map<String, Object> noSubject = legacyConfig(true, true);
        noSubject.remove(MATH_ID);
        noSubject.put(
                "foreign-subject",
                Map.of("selected", true, "filterId", "GK"));
        createLearner(noSubjectId, noSubject);

        JsonNode invalidFilterBefore = persistedConfig(invalidFilterId);
        JsonNode noSubjectBefore = persistedConfig(noSubjectId);

        assertThat(learnerService
                        .migrateCanonicalGymnasiumPreFlowPersonalization())
                .isZero();

        assertThat(persistedConfig(invalidFilterId))
                .isEqualTo(invalidFilterBefore);
        assertThat(persistedConfig(noSubjectId)).isEqualTo(noSubjectBefore);
        assertThat(invalidFilterBefore.path(ROOT_ID).has("stage")).isFalse();
        assertThat(noSubjectBefore.path(ROOT_ID).has("stage")).isFalse();
    }

    @Test
    void leavesAnyExistingFlowStateValueUntouched() throws Exception {
        String scalarId = "legacy-stage-scalar-flow-state";
        Map<String, Object> scalarFlowState = legacyConfig(true, true);
        scalarFlowState.put(
                CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY,
                "malformed-but-owned-by-a-newer-writer");
        createLearner(scalarId, scalarFlowState);

        String mapId = "legacy-stage-map-flow-state";
        Map<String, Object> mapFlowState = legacyConfig(true, true);
        mapFlowState.put(
                CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY,
                Map.of("unknownVersion", 99));
        createLearner(mapId, mapFlowState);

        JsonNode scalarBefore = persistedConfig(scalarId);
        JsonNode mapBefore = persistedConfig(mapId);

        assertThat(learnerService
                        .migrateCanonicalGymnasiumPreFlowPersonalization())
                .isZero();

        assertThat(persistedConfig(scalarId)).isEqualTo(scalarBefore);
        assertThat(persistedConfig(mapId)).isEqualTo(mapBefore);
    }

    @Test
    void preservesTheAcceptedLegacyPersonalCurriculumWrapper() throws Exception {
        String learnerId = "legacy-stage-wrapped-payload";
        Map<String, Object> wrapped =
                Map.of("personalCurriculum", legacyConfig(true, true));
        createLearner(learnerId, wrapped);

        assertThat(learnerService
                        .migrateCanonicalGymnasiumPreFlowPersonalization())
                .isOne();

        JsonNode storedDocument = persistedConfig(learnerId);
        assertThat(storedDocument.size()).isOne();
        assertThat(storedDocument.has("personalCurriculum")).isTrue();
        JsonNode storedPayload = storedDocument.path("personalCurriculum");
        assertThat(storedPayload.path(ROOT_ID).path("stage").asText())
                .isEqualTo("CrossStage");
        assertThat(storedPayload
                        .path(CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY)
                        .path(CurriculumPersonalizationPlanner.MIGRATION_COMPLETED_KEY)
                        .asBoolean())
                .isTrue();
    }

    @Test
    void lazyPersonalizationPlanAndLearnerStateReadsPersistMigration()
            throws Exception {
        String planLearnerId = "legacy-stage-lazy-plan";
        createLearner(planLearnerId, legacyConfig(true, false));

        PersonalizationPlan plan =
                learnerService.getPersonalizationPlan(planLearnerId);

        assertThat(plan.stage()).isEqualTo(PersonalizationPlan.Stage.COMPLETE);
        assertThat(persistedConfig(planLearnerId)
                        .path(ROOT_ID)
                        .path("stage")
                        .asText())
                .isEqualTo("SekI");
        assertThat(persistedConfig(planLearnerId)
                        .path(CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY)
                        .path(CurriculumPersonalizationPlanner.MIGRATION_COMPLETED_KEY)
                        .asBoolean())
                .isTrue();

        String stateLearnerId = "legacy-stage-lazy-state";
        createLearner(stateLearnerId, legacyConfig(false, true));

        learnerService.getLearnerState(stateLearnerId);

        assertThat(persistedConfig(stateLearnerId)
                        .path(ROOT_ID)
                        .path("stage")
                        .asText())
                .isEqualTo("SekII");
        assertThat(persistedConfig(stateLearnerId)
                        .path(CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY)
                        .path(CurriculumPersonalizationPlanner.MIGRATION_COMPLETED_KEY)
                        .asBoolean())
                .isTrue();
    }

    @Test
    void coachReadsNeverPersistLegacyMigrationOrAdvanceRevision()
            throws Exception {
        String learnerId = "legacy-stage-coach-read";
        Learner learner = createLearner(learnerId, legacyConfig(true, false));
        String storedBefore = learner.getPersonalCurriculum();

        learnerService.getCoachPersonalizationPlan(learnerId);
        learnerService.getCoachLearnerState(learnerId);

        Learner persisted = persistedLearner(learnerId);
        assertThat(persisted.getPersonalCurriculum()).isEqualTo(storedBefore);
        assertThat(persisted.getCoachStateRevision()).isZero();
        assertThat(persistedConfig(learnerId)
                        .path(ROOT_ID)
                        .path("stage")
                        .isMissingNode())
                .isTrue();
        assertThat(persistedConfig(learnerId)
                        .path(CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY)
                        .isMissingNode())
                .isTrue();
    }

    @Test
    void importMigratesBeforeRevalidatingFocusAndPreservesMastery()
            throws Exception {
        String sourceId = "legacy-stage-import-source";
        String targetId = "legacy-stage-import-target";
        String masteryGoalId = "legacy-global-mastery";
        Learner source = createLearner(sourceId, legacyConfig(true, true));
        plannedGoalRepository.saveAndFlush(
                new PlannedGoal(source, VISIBLE_MATH_FOCUS_ID));
        masteryRepository.saveAndFlush(
                new Mastery(source, masteryGoalId, 0.625));
        Mastery sourceMastery = masteryRepository
                .findById(new MasteryId(sourceId, masteryGoalId))
                .orElseThrow();

        var exported = learnerService.exportLearner(sourceId);
        createLearner(targetId, Map.of());

        learnerService.importLearner(targetId, exported);

        JsonNode importedConfig = persistedConfig(targetId);
        assertThat(importedConfig.path(ROOT_ID).path("stage").asText())
                .isEqualTo("CrossStage");
        assertThat(importedConfig
                        .path(CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY)
                        .path(CurriculumPersonalizationPlanner.MIGRATION_COMPLETED_KEY)
                        .asBoolean())
                .isTrue();
        assertThat(plannedGoalRepository.findByLearner_SkillpilotId(targetId))
                .extracting(PlannedGoal::getGoalId)
                .containsExactly(VISIBLE_MATH_FOCUS_ID);
        assertThat(masteryRepository.findById(
                        new MasteryId(targetId, masteryGoalId)))
                .hasValueSatisfying(imported -> {
                    assertThat(imported.getValue()).isEqualTo(0.625);
                    assertThat(imported.getUpdatedAt())
                            .isEqualTo(sourceMastery.getUpdatedAt());
                });
    }

    private Map<String, Object> legacyConfig(
            boolean sek1Selected,
            boolean sek2Selected) {
        Map<String, Object> config = new LinkedHashMap<>();
        config.put(
                ROOT_ID,
                Map.of(
                        "selected", true,
                        "filterId", "ALL"));
        config.put(
                MATH_ID,
                Map.of(
                        "selected", true,
                        "filterId", "ALL"));
        config.put(
                SEK1_MARKER_ID,
                Map.of("selected", sek1Selected));
        config.put(
                SEK2_MARKER_ID,
                Map.of("selected", sek2Selected));
        return config;
    }

    private Learner createLearner(
            String learnerId,
            Map<String, ?> personalCurriculum) throws Exception {
        Learner learner = new Learner();
        learner.setSkillpilotId(learnerId);
        learner.setSelectedCurriculum(ROOT_ID);
        learner.setPersonalCurriculum(
                objectMapper.writeValueAsString(personalCurriculum));
        return learnerRepository.saveAndFlush(learner);
    }

    private Learner persistedLearner(String learnerId) {
        return learnerRepository.findById(learnerId).orElseThrow();
    }

    private JsonNode persistedConfig(String learnerId) throws Exception {
        return objectMapper.readTree(
                persistedLearner(learnerId).getPersonalCurriculum());
    }
}
