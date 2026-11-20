package com.skillpilot.backend.connectors.claude.v1.mcp;

import static org.assertj.core.api.Assertions.*;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.LevelCompletionActionRequest;
import com.skillpilot.backend.api.CompletionAssessmentStart;
import com.skillpilot.backend.api.UnitAssessmentResponse;
import com.skillpilot.backend.api.LearnerLearningPlanApi;
import com.skillpilot.backend.completion.AssessmentMaterialRevision;
import com.skillpilot.backend.service.VerifiedExamPassService;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Contract;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1TestProperties;
import com.skillpilot.backend.connectors.claude.v1.session.ClaudeV1LearningSessionService;
import com.skillpilot.backend.connectors.claude.v1.web.ClaudeV1CoachStartRequest;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.LearningState;
import com.skillpilot.backend.domain.Mastery;
import com.skillpilot.backend.domain.PlannedGoal;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import com.skillpilot.backend.repository.PlannedGoalRepository;
import com.skillpilot.backend.service.LearnerService;
import com.skillpilot.backend.service.LearnerLearningPlanService;
import com.skillpilot.backend.service.UnitLearningMaterialService;
import com.skillpilot.backend.completion.CompletionProfileCompiler;
import io.modelcontextprotocol.common.McpTransportContext;
import io.modelcontextprotocol.spec.McpSchema;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;

/** General automatic completion through the real canonical MCP handler and persisted transactions. */
@SpringBootTest(properties = {
        ClaudeV1TestProperties.ENABLED, ClaudeV1TestProperties.SIGNING_SECRET,
        ClaudeV1TestProperties.CAPABILITY_SECRET, ClaudeV1TestProperties.BETA_DISABLED,
        "spring.datasource.url=jdbc:h2:mem:completion-mcp;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;NON_KEYWORDS=VALUE"
})
@ActiveProfiles("test")
class ClaudeV1CompletionRouteIntegrationTest {
    private static final String PROFILE = "automatic:personal-curriculum";
    private static final String ROOT = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
    private static final String MATH = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
    private static final String PREPARATION = "3016ec37-1c2e-47db-83f5-e767923bc97e";
    private static final String EXAM = "e98672c6-871a-5d0b-889c-5afc51040f0d";
    @Autowired ClaudeV1McpContractAdapter adapter;
    @Autowired ClaudeV1LearningSessionService sessions;
    @Autowired com.skillpilot.backend.connectors.claude.v1.session.ClaudeV1LearningSessionRepository sessionRepository;
    @Autowired com.skillpilot.backend.connectors.claude.v1.session.ClaudeV1SessionTokenCodec sessionTokens;
    @Autowired LearnerService learners;
    @Autowired LearnerLearningPlanService learningPlans;
    @Autowired UnitLearningMaterialService unitMaterials;
    @Autowired com.skillpilot.backend.landscape.LandscapeService landscapeDefinitions;
    @Autowired LearnerRepository learnerRepository;
    @Autowired MasteryRepository masteryRepository;
    @Autowired PlannedGoalRepository focus;
    @Autowired ObjectMapper mapper;
    @Autowired VerifiedExamPassService examPasses;
    @Autowired org.springframework.transaction.support.TransactionTemplate transactions;
    private String learnerId;
    private String session;

    @BeforeEach void launchSupportedProfileSession() throws Exception {
        Learner learner = new Learner();
        learnerId = "completion-mcp-" + UUID.randomUUID();
        learner.setSkillpilotId(learnerId); learner.setSelectedCurriculum(ROOT);
        learner.setStrictMode(true); learner.setAutoPilot(false);
        learner.setPersonalCurriculum(mapper.writeValueAsString(Map.of(
                ROOT, Map.of("selected", true, "filterId", "DE-HE", "stage", "CrossStage", "durationModel", "G9"),
                MATH, Map.of("selected", true, "filterId", "GK+LK"),
                "__skillpilot_stage_scope_sek1__", Map.of("selected", true),
                "__skillpilot_stage_scope_sek2__", Map.of("selected", true),
                "__skillpilotPersonalizationFlow", Map.of("rootLandscapeId", ROOT,
                        "completedOptionIds", List.of(), "migrationCompleted", true))));
        learner = learnerRepository.saveAndFlush(learner);
        focus.saveAndFlush(new PlannedGoal(learner, PREPARATION));
        learners.chooseLevelCompletion(learnerId, new LevelCompletionActionRequest(
                "selectProfile", PROFILE, null, null, learner.getCoachStateRevision()));
        var launch = sessions.createFirstPartyLaunch(learnerId, new ClaudeV1CoachStartRequest("de", "web-start"));
        assertThat(launch.prompt()).isEqualTo(
                "Nutze den SkillPilot-Coach-Skill und lerne mit meinem aktuellen SkillPilot-Lernkontext weiter."
                        + "\nlearningSessionId: " + launch.learningSessionId());
        session = launch.learningSessionId();
        authenticate();
    }

    @AfterEach void clearAuthentication() { SecurityContextHolder.clearContext(); }

    private void returnToOrdinaryLearning() {
        learners.chooseLevelCompletion(learnerId, new LevelCompletionActionRequest(
                "leaveProfile", PROFILE, null, null, version()));
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setActiveGoalId(PREPARATION);
        learner.setLearningState(com.skillpilot.backend.domain.LearningState.TEACHING);
        learnerRepository.saveAndFlush(learner);
    }

    @ParameterizedTest
    @ValueSource(strings = {"G8", "G9"})
    void hessianMotionInTheCoachToolUsesThePersonalMapAndItsOwnAssessmentPlacement(String duration) throws Exception {
        String active = "89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2";
        String recorded = "68c90ba6-c438-463c-9a53-cf61062d416a";
        String exam = "a9562b05-c54d-5635-9244-3f7dd24a8642";
        selectHessianMotionUnit(duration);
        session = sessions.createFirstPartyLaunch(learnerId, new ClaudeV1CoachStartRequest("de", "web-start")).learningSessionId();
        authenticate();
        successful(ClaudeV1CompletionContractRegistry.TOOL_CONFIRM,
                Map.of("receiptCapability", map(context(), "completionContract").get("receiptCapability")));
        var focused = context();
        assertThat(focused.get("activeGoal")).isNull();
        var focusedUnit = mapper.valueToTree(map(focused, "focusedUnitContext"));
        assertThat(focusedUnit.path("unitIntroduction").path("sectionTitle").asText()).isEqualTo("E.1 Bewegungen und ihre Beschreibung");
        assertThat(focusedUnit.path("activities").get(1).path("route").asText()).isEqualTo("directAssessment");
        var practiceAction = focusedUnit.path("activities").get(0).path("action");
        var practice = call(practiceAction.path("tool").asText(),
                mapper.convertValue(practiceAction.path("arguments"), new TypeReference<>() {}));
        assertThat(practice.isError()).isFalse();
        assertThat(mapper.valueToTree(practice.structuredContent()).path("progress").path("totalCards").asInt()).isEqualTo(9);
        assertThat(practice.structuredContent().toString()).doesNotContain("physics_e_cov_", "reviewCapability");
        assertThat(practice.meta()).containsOnlyKeys("skillpilotMemoryCard");
        assertThat(learnerRepository.findById(learnerId).orElseThrow().getActiveGoalId()).isNull();
        var learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setActiveGoalId(active);
        learner.setLearningState(LearningState.TEACHING);
        learnerRepository.saveAndFlush(learner);
        masteryRepository.saveAndFlush(new Mastery(learner, recorded, 1.0));
        long before = version();
        var response = context();
        assertThat(map(response, "activeGoal")).containsEntry("id", active).containsEntry("title", "Waagerechter Wurf analysieren");
        var detail = mapper.valueToTree(map(response, "activeGoalContext"));
        var path = detail.path("unitPaths").get(0);
        assertThat(path.path("inCurrentFocus").asBoolean()).isTrue();
        List<String> sections = mapper.convertValue(path.path("sections"), new TypeReference<>() {});
        assertThat(sections).containsSubsequence("E.1 Bewegungen und ihre Beschreibung", "Einführungsphase: Mechanik",
                "Sekundarstufe II (GK)", "Physik");
        assertThat(detail.path("unitIntroduction").path("question").asText()).contains("Ein Ball rollt vom Tisch");
        assertThat(detail.path("practiceExercise").path("prompt").asText()).isNotBlank();
        assertThat(detail.path("prerequisites")).hasSize(2);
        assertThat(detail.path("prerequisites").get(0).path("title").asText()).isEqualTo("Bezugssysteme und Geschwindigkeitsüberlagerung");
        assertThat(detail.path("prerequisites").get(0).path("recorded").asBoolean()).isTrue();
        assertThat(detail.path("prerequisites").get(1).path("title").asText()).isEqualTo("Modellierung und Idealisierung von Bewegungen");
        assertThat(detail.path("prerequisites").get(1).path("recorded").asBoolean()).isFalse();
        assertThat(detail.path("activities")).hasSize(2);
        var activity = detail.path("activities").get(1);
        assertThat(activity.path("goalId").asText()).isEqualTo(exam);
        assertThat(activity.path("sectionTitle").asText()).isEqualTo("Themenübergreifende Prüfungen · Einführungsphase: Mechanik");
        assertThat(activity.path("route").asText()).isEqualTo("directAssessment");
        assertThat(response.toString()).doesNotContain("taskDe", "taskEn", "solutionContent", "evaluationCapability");
        assertThat(version()).isEqualTo(before);
        var start = successful(activity.path("action").path("tool").asText(), writeArgs("he-exam-" + duration, before,
                Map.of("choice", activity.path("action").path("arguments").path("choice").asText())));
        var started = map(start, "context");
        assertThat(map(started, "activeGoal")).containsEntry("id", exam);
        assertThat(map(started, "activeGoalContext")).doesNotContainKeys("unitIntroduction", "practiceExercise", "prerequisites");
        assertThat(map(started, "levelCompletion")).containsEntry("directAssessmentRunning", true);
        String end = choice(started, "Zur normalen Lernansicht");
        successful(ClaudeV1McpContractAdapter.TOOL_CHOOSE_COMPLETION_ROUTE,
                writeArgs("he-return-" + duration, version(), Map.of("choice", end)));
        assertThat(map(context(), "levelCompletion")).containsEntry("directAssessmentRunning", false);
        assertThat(learnerRepository.findById(learnerId).orElseThrow().getCompletionWorkflow()).isNull();
        assertThat(masteryRepository.findByLearner_SkillpilotId(learnerId)).extracting(Mastery::getGoalKey)
                .containsExactly(recorded);
    }

    private String selectHessianMotionUnit(String duration) throws Exception {
        return selectHessianMotionUnit(duration, "CrossStage");
    }

    private String selectHessianMotionUnit(String duration, String stage) throws Exception {
        learners.chooseLevelCompletion(learnerId, new LevelCompletionActionRequest("leaveProfile", PROFILE, null, null, version()));
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setPersonalCurriculum(mapper.writeValueAsString(Map.of(
                ROOT, Map.of("selected", true, "filterId", "DE-HE", "stage", stage, "durationModel", duration),
                "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a", Map.of("selected", true, "filterId", "GK"),
                "__skillpilot_stage_scope_sek1__", Map.of("selected", true),
                "__skillpilot_stage_scope_sek2__", Map.of("selected", true),
                "__skillpilotPersonalizationFlow", Map.of("rootLandscapeId", ROOT,
                        "completedOptionIds", List.of(), "migrationCompleted", true))));
        learner.setFollowLearningPlans(false);
        learner.setUseAssessmentShortcuts(false);
        learnerRepository.saveAndFlush(learner);
        String view = "SekII".equals(stage) ? "de-he-gym-sekii-physics-gk"
                : "de-he-gym-physics-gk-" + duration.toLowerCase(java.util.Locale.ROOT);
        String unitFocus = "composition:" + view + ":structure:physics-e1-motion";
        learners.setPlannedGoals(learnerId, java.util.Set.of(unitFocus));
        return unitFocus;
    }

    @ParameterizedTest
    @CsvSource({"G8,CrossStage", "G9,CrossStage", "G8,SekII", "G9,SekII"})
    void hessianMotionAssessmentNeedsFourVersionedExamPassesAndKeepsIndividualGoalsOpen(String duration, String stage) throws Exception {
        String section = selectHessianMotionUnit(duration, stage);
        record Exam(String goalId, int passingPoints, int maximum) {}
        var parts = List.of(new Exam("ee7d5f3d-858f-59d6-89b0-e5a7f437f458", 14, 17),
                new Exam("39f52dcb-ff1d-5cad-9ccb-30da803cfa85", 15, 18),
                new Exam("c933b7d2-edcb-5747-9378-9762659f260a", 17, 20),
                new Exam("f13ca187-b680-5f47-b4ad-76bd474bd8a2", 17, 20));
        // A real receipt for the previous four-point wagon task must not satisfy the revised unit.
        transactions.executeWithoutResult(status -> examPasses.record(learnerId, parts.getFirst().goalId(),
                new AssessmentMaterialRevision(
                        "sha256:6ab3c1940e59e55422878fc7ef8489e67fd9e5a5601e96e631270562c3eb948a",
                        "sha256:78a9793913d76f90a87b681fe2d40c75fa87bbe1ff4868f037a5f6a46fe8befc",
                        "sha256:1be94285b9ccd9e39392341cdd425c33798a63cd93c2134982f22205fd953810"),
                4, 4, 4));
        var initial = learners.getLearnerState(learnerId).levelCompletion().unitAssessment();
        assertThat(initial.sectionGoalId()).isEqualTo(section);
        assertThat(initial.parts()).extracting(UnitAssessmentResponse.Part::goalId).containsExactlyElementsOf(parts.stream().map(Exam::goalId).toList());
        assertThat(initial.parts()).noneMatch(UnitAssessmentResponse.Part::passed);
        assertThat(initial.individuallyOpenGoalIds()).hasSize(11);
        assertThat(initial.passed()).isFalse();
        var today = java.time.LocalDate.now(java.time.ZoneId.of("Europe/Berlin"));
        var monday = today.with(java.time.temporal.TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));
        String physics = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
        var atoms = learners.resolveLearningPlanGoalIds(learnerId, physics, List.of(section));
        var block = new LearnerLearningPlanApi.Block("motion", "learning", null, "E.1", monday,
                monday.plusDays(4), null, atoms, List.of(section), true);
        learningPlans.upsert(learnerId, physics, new LearnerLearningPlanApi.UpsertRequest(0L, "E.1", List.of(block)), today);
        var beforePlan = learningPlans.getPlan(learnerId, physics, today);
        assertThat(beforePlan.nextEligibleGoal()).isNotNull();
        assertThat(learningPlans.getTodayStatus(learnerId, "de").subjects().getFirst().periodGauge().completed()).isZero();
        var passed = new java.util.ArrayList<String>();
        for (var part : parts) {
            session = sessions.createFirstPartyLaunch(learnerId, new ClaudeV1CoachStartRequest("de", "web-start",
                    new CompletionAssessmentStart("automatic:" + section, part.goalId(), version()))).learningSessionId();
            authenticate();
            var pending = context();
            if (pending.containsKey("completionContract")) successful(ClaudeV1CompletionContractRegistry.TOOL_CONFIRM,
                    Map.of("receiptCapability", map(pending, "completionContract").get("receiptCapability")));
            var active = context();
            assertThat(map(active, "activeGoal")).containsEntry("id", part.goalId());
            assertThat(active.toString()).doesNotContain("solutionContent", "passingPoints", "evaluationCapability");
            var evaluation = successful(ClaudeV1Contract.TOOL_GET_EXAM_EVALUATION, Map.of("goalId", part.goalId()));
            var rubric = mapper.valueToTree(evaluation.get("scoring"));
            assertThat(rubric.path("maxPoints").asInt()).isEqualTo(part.maximum());
            assertThat(rubric.path("passingPoints").asInt()).isEqualTo(part.passingPoints());
            long before = version();
            var capability = evaluation.get("evaluationCapability");
            assertThat(call(ClaudeV1Contract.TOOL_SET_MASTERY, writeArgs("below" + part.goalId(), before,
                    Map.of("goalId", part.goalId(), "earnedPoints", part.passingPoints() - 1, "evaluationCapability", capability))).isError()).isTrue();
            assertThat(version()).isEqualTo(before);
            successful(ClaudeV1Contract.TOOL_SET_MASTERY, writeArgs("pass" + part.goalId(), before,
                    Map.of("goalId", part.goalId(), "earnedPoints", part.passingPoints(), "evaluationCapability", capability)));
            passed.add(part.goalId());
            var completion = learners.getLearnerState(learnerId).levelCompletion();
            var unit = completion.unitAssessment();
            assertThat(unit.parts()).filteredOn(UnitAssessmentResponse.Part::passed)
                    .extracting(UnitAssessmentResponse.Part::goalId).containsExactlyElementsOf(passed);
            boolean allPassed = passed.size() == parts.size();
            assertThat(unit.passed()).isEqualTo(allPassed);
            assertThat(unit.planningCreditGoalIds()).hasSize(allPassed ? 2 : 0);
            assertThat(unit.individuallyOpenGoalIds()).isEqualTo(initial.individuallyOpenGoalIds());
            assertThat(masteryRepository.findByLearner_SkillpilotId(learnerId)).extracting(Mastery::getGoalKey)
                    .containsExactlyInAnyOrderElementsOf(passed);
            assertThat(completion.complete()).isFalse();
            assertThat(completion.requiredAssessmentCount()).isEqualTo(5);
            assertThat(completion.masteredAssessmentCount()).isEqualTo(passed.size());
            var updated = context();
            var compact = mapper.valueToTree(map(map(updated, "levelCompletion"), "unitAssessment"));
            assertThat(compact.path("passed").asBoolean()).isEqualTo(allPassed);
            assertThat(compact.path("parts").size()).isEqualTo(parts.size());
            assertThat(compact.path("creditedForPlanningCount").asInt()).isEqualTo(unit.planningCreditGoalIds().size());
            assertThat(compact.path("individuallyOpenCount").asInt()).isEqualTo(11);
            successful(ClaudeV1McpContractAdapter.TOOL_CHOOSE_COMPLETION_ROUTE,
                    writeArgs("return" + part.goalId(), version(), Map.of("choice", choice(updated, "Zur normalen Lernansicht"))));
        }
        var afterPlan = learningPlans.getPlan(learnerId, physics, today);
        assertThat(afterPlan.blocks()).isEqualTo(beforePlan.blocks());
        assertThat(afterPlan.nextEligibleGoal()).isNotNull();
        assertThat(learningPlans.getTodayStatus(learnerId, "de").subjects().getFirst().periodGauge().completed())
                .as("Four proven assessments and two advertised planning credits").isEqualTo(6);
    }

    @ParameterizedTest
    @ValueSource(strings = {"G8", "G9"})
    void hessianChildEvidenceEnablesOnlyItsOwnPrerequisitesAndKeepsBothIndividualRoutes(String duration) throws Exception {
        String section = selectHessianMotionUnit(duration, "SekII");
        String physics = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
        String acceleration = "e4b38061-1f28-43ad-8371-a3e7c0e81856";
        String modelling = "d6dc0e02-831d-4894-a61a-852bcc74f147";
        String freeFall = "09029573-864f-40ca-bf8a-cee7bf6dcb73";
        String projectile = "89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2";
        String referenceFrames = "68c90ba6-c438-463c-9a53-cf61062d416a";
        String c = "c933b7d2-edcb-5747-9378-9762659f260a";
        String d = "f13ca187-b680-5f47-b4ad-76bd474bd8a2";
        var graph = learners.getLearningPlanCompletionContext(learnerId).canonicalGoals();
        assertThat(learners.getUnitPlanningCredits(learnerId)).isEmpty();
        // A historical pass with a different material binding never establishes the reviewed credit.
        transactions.executeWithoutResult(status -> examPasses.record(learnerId, c,
                new AssessmentMaterialRevision("sha256:" + "a".repeat(64), "sha256:" + "b".repeat(64),
                        "sha256:" + "c".repeat(64)), 17, 20, 17));
        passHessianAssessment(section, d, 17);
        assertThat(learners.getUnitPlanningCredits(learnerId)).isEmpty();
        passHessianAssessment(section, c, 17);
        assertThat(learners.getUnitPlanningCredits(learnerId)).containsOnlyKeys(acceleration, modelling);
        var unit = learners.getLearnerState(learnerId).levelCompletion().unitAssessment();
        assertThat(unit.passed()).isFalse();
        assertThat(unit.parts()).filteredOn(UnitAssessmentResponse.Part::passed)
                .extracting(UnitAssessmentResponse.Part::goalId).containsExactlyInAnyOrder(c, d);
        assertThat(unit.individuallyOpenGoalIds()).hasSize(11);
        assertThat(learners.getUncompactedRichFrontierForFocus(learnerId, List.of(freeFall)))
                .extracting(com.skillpilot.backend.api.FrontierGoal::id).doesNotContain(freeFall);

        // These other foundations are explicit test fixtures, not inferred from either unit pass.
        var foundations = new java.util.LinkedHashSet<>(new CompletionProfileCompiler()
                .normalizePrerequisites(graph).transitivePrerequisites(freeFall));
        foundations.removeAll(java.util.Set.of(acceleration, modelling));
        assertThat(foundations).doesNotContain(referenceFrames, freeFall, projectile);
        var learner = learnerRepository.findById(learnerId).orElseThrow();
        masteryRepository.saveAllAndFlush(foundations.stream().map(id -> new Mastery(learner, id, 1.0)).toList());
        assertThat(learners.getUncompactedRichFrontierForFocus(learnerId, List.of(freeFall, projectile)))
                .extracting(com.skillpilot.backend.api.FrontierGoal::id).contains(freeFall).doesNotContain(projectile);
        learners.setPlannedGoals(learnerId, java.util.Set.of(freeFall));
        learners.setActiveGoal(learnerId, freeFall);
        session = sessions.createFirstPartyLaunch(learnerId, new ClaudeV1CoachStartRequest("de", "web-start")).learningSessionId();
        authenticate();
        var pending = context();
        if (pending.containsKey("completionContract")) successful(ClaudeV1CompletionContractRegistry.TOOL_CONFIRM,
                Map.of("receiptCapability", map(pending, "completionContract").get("receiptCapability")));
        var prerequisite = mapper.valueToTree(map(context(), "activeGoalContext")).path("prerequisites").get(0);
        assertThat(prerequisite.path("recorded").asBoolean()).isFalse();
        assertThat(prerequisite.path("planningCredit").asBoolean()).isTrue();
        assertThat(prerequisite.has("scopeWaiver")).isFalse();

        // The full E.1 route keeps A/B and its fifth assessment open; its credited atom is voluntary.
        learners.setPlannedGoals(learnerId, java.util.Set.of(section));
        var chosen = learners.chooseLevelCompletion(learnerId, new LevelCompletionActionRequest(
                "selectProfile", "automatic:" + section, null, null, version()));
        var voluntary = chosen.levelCompletion().actions().stream()
                .filter(action -> acceleration.equals(action.goalId()) && "voluntary".equals(action.intent()))
                .findFirst().orElseThrow();
        var individual = learners.chooseLevelCompletion(learnerId, new LevelCompletionActionRequest(
                voluntary.action(), "automatic:" + section, voluntary.goalId(), voluntary.intent(), version()));
        assertThat(individual.activeGoal().id()).isEqualTo(acceleration);
        assertThat(individual.levelCompletion().navigationIntent()).isEqualTo("voluntary");
        learners.chooseLevelCompletion(learnerId, new LevelCompletionActionRequest("leaveProfile", null, null, null, version()));

        var today = java.time.LocalDate.now(java.time.ZoneId.of("Europe/Berlin"));
        var monday = today.with(java.time.temporal.TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));
        var goals = List.of(acceleration, freeFall);
        var block = new LearnerLearningPlanApi.Block("continuation", "learning", null, "Nach dem Kindnachweis",
                monday, monday.plusDays(4), null, goals, goals, true);
        var plan = learningPlans.upsert(learnerId, physics,
                new LearnerLearningPlanApi.UpsertRequest(0L, "Nach dem Kindnachweis", List.of(block)), today);
        learners.setPreferences(learnerId, null, false, false, null, true,
                com.skillpilot.backend.service.learningplan.PeriodBasis.WEEK, false);
        assertThat(learningPlans.getPlan(learnerId, physics, today).nextEligibleGoal().goalId()).isEqualTo(freeFall);
        assertThat(learnerRepository.findById(learnerId).orElseThrow().getActiveGoalId()).isEqualTo(acceleration);
        var standard = learningPlans.switchPlan(learnerId, plan.planId(),
                new LearnerLearningPlanApi.ContinueRequest(plan.revision(), today));
        assertThat(standard.activeGoalId()).isEqualTo(freeFall);
        assertThat(learningPlans.getTodayStatus(learnerId, "de").subjects().getFirst().periodGauge().completed()).isEqualTo(1);

        learners.setPreferences(learnerId, null, null, null, null, null, null, true);
        assertThat(learningPlans.getPlan(learnerId, physics, today).nextEligibleGoal().goalId()).isEqualTo(acceleration);
        var explicit = learningPlans.switchPlan(learnerId, plan.planId(),
                new LearnerLearningPlanApi.ContinueRequest(plan.revision(), today));
        assertThat(explicit.activeGoalId()).isEqualTo(acceleration);
        assertThat(explicit.state().activeGoal().id()).isEqualTo(acceleration);
        assertThat(learningPlans.getTodayStatus(learnerId, "de").subjects().getFirst().periodGauge().completed()).isZero();
        learners.setPreferences(learnerId, null, null, null, null, null, null, false);
        assertThat(learningPlans.getPlan(learnerId, physics, today).nextEligibleGoal().goalId()).isEqualTo(freeFall);
        assertThat(learnerRepository.findById(learnerId).orElseThrow().getActiveGoalId()).isEqualTo(acceleration);
        learners.setPreferences(learnerId, null, null, true, null, false, null, null);
        learners.setPlannedGoals(learnerId, java.util.Set.of(projectile));
        assertThat(learners.getUnitPlanningCredits(learnerId)).containsOnlyKeys(acceleration, modelling);
        assertThat(learners.getUncompactedRichFrontierForFocus(learnerId, List.of(projectile)))
                .extracting(com.skillpilot.backend.api.FrontierGoal::id).doesNotContain(projectile);
        assertThat(masteryRepository.findByLearner_SkillpilotId(learnerId)).extracting(Mastery::getGoalKey)
                .containsExactlyInAnyOrderElementsOf(java.util.stream.Stream.concat(foundations.stream(), java.util.stream.Stream.of(c, d)).toList());
        assertCurrentHessianBindingsFailClosed(section, c, d, freeFall, graph);
    }

    private void assertCurrentHessianBindingsFailClosed(String section, String c, String d, String freeFall,
            Map<String, com.skillpilot.backend.landscape.LearningGoal> graph) {
        learners.setPlannedGoals(learnerId, java.util.Set.of(section));
        var history = examPasses.findForGoals(learnerId, List.of(c, d));
        var currentExam = landscapeDefinitions.getGoalDefinition(c).getExamData();
        String originalTask = currentExam.getTaskContent();
        try {
            currentExam.setTaskContent(originalTask + "\nEine andere aktuelle Aufgabenfassung.");
            assertThat(learners.getUnitPlanningCredits(learnerId)).isEmpty();
            var changed = learners.getLearnerState(learnerId).levelCompletion();
            assertThat(changed.unitAssessment().planningCreditGoalIds()).isEmpty();
            assertThat(changed.unitAssessment().parts()).filteredOn(part -> c.equals(part.goalId())).singleElement()
                    .satisfies(part -> { assertThat(part.materialCurrent()).isFalse(); assertThat(part.passed()).isFalse(); });
            assertThat(changed.profileOptions()).filteredOn(option -> ("automatic:" + section).equals(option.profileId()))
                    .singleElement().satisfies(option -> assertThat(option.assessments()).filteredOn(part -> c.equals(part.goalId()))
                        .singleElement().satisfies(part -> {
                            assertThat(part.startAvailable()).isFalse();
                            assertThat(part.unavailableReason()).isEqualTo("assessment_material_changed");
                        }));
            long before = version();
            assertThatThrownBy(() -> sessions.createFirstPartyLaunch(learnerId, new ClaudeV1CoachStartRequest("de", "web-start",
                    new CompletionAssessmentStart("automatic:" + section, c, before))))
                    .isInstanceOf(org.springframework.web.server.ResponseStatusException.class).hasMessageContaining("409");
            assertThat(version()).isEqualTo(before);
        } finally { currentExam.setTaskContent(originalTask); }
        assertThat(examPasses.findForGoals(learnerId, List.of(c, d))).isEqualTo(history);
        assertThat(learners.getUnitPlanningCredits(learnerId)).hasSize(2);

        learners.setPlannedGoals(learnerId, java.util.Set.of(freeFall));
        learners.setActiveGoal(learnerId, freeFall);
        Object application = org.springframework.test.util.ReflectionTestUtils.getField(learners, "completionApplicationService");
        Object catalog = org.springframework.test.util.ReflectionTestUtils.invokeMethod(application, "catalog");
        for (String disabledFlag : List.of("enabled", "available")) {
            boolean original = (boolean) org.springframework.test.util.ReflectionTestUtils.getField(catalog, disabledFlag);
            try {
                org.springframework.test.util.ReflectionTestUtils.setField(catalog, disabledFlag, false);
                assertThat(learners.getUnitPlanningCredits(learnerId)).isEmpty();
                assertThat(learners.getUncompactedRichFrontierForFocus(learnerId, List.of(freeFall)))
                        .extracting(com.skillpilot.backend.api.FrontierGoal::id).doesNotContain(freeFall);
                var detail = learners.getCoachActiveGoalContext(learnerId, freeFall, version(), "de", java.util.Set.of(), false);
                assertThat(detail.prerequisites()).noneMatch(com.skillpilot.backend.api.ActiveGoalContext.Prerequisite::planningCredit);
            } finally { org.springframework.test.util.ReflectionTestUtils.setField(catalog, disabledFlag, original); }
        }
        assertThat(learners.getUnitPlanningCredits(learnerId)).hasSize(2);
        assertThat(examPasses.findForGoals(learnerId, List.of(c, d))).isEqualTo(history);
    }

    @ParameterizedTest
    @ValueSource(strings = {"G8", "G9"})
    void hessianHistoricalPartPassAndItsIdempotentReplayCannotGainALaterPlanningRelease(String duration) throws Exception {
        String section = selectHessianMotionUnit(duration, "SekII");
        String c = "c933b7d2-edcb-5747-9378-9762659f260a";
        String d = "f13ca187-b680-5f47-b4ad-76bd474bd8a2";
        Map<String, Object> gradeArguments;
        Map<String, Object> firstResult;
        String historicalSession;
        org.springframework.test.util.ReflectionTestUtils.setField(learners, "unitLearningMaterialService", UnitLearningMaterialService.empty());
        try {
            session = sessions.createFirstPartyLaunch(learnerId, new ClaudeV1CoachStartRequest("de", "web-start",
                    new CompletionAssessmentStart("automatic:" + section, c, version()))).learningSessionId();
            historicalSession = session;
            authenticate();
            var pending = context();
            if (pending.containsKey("completionContract")) successful(ClaudeV1CompletionContractRegistry.TOOL_CONFIRM,
                    Map.of("receiptCapability", map(pending, "completionContract").get("receiptCapability")));
            var evaluation = successful(ClaudeV1Contract.TOOL_GET_EXAM_EVALUATION, Map.of("goalId", c));
            gradeArguments = writeArgs("historical-unbound-" + duration, version(),
                    Map.of("goalId", c, "earnedPoints", 17, "evaluationCapability", evaluation.get("evaluationCapability")));
            firstResult = successful(ClaudeV1Contract.TOOL_SET_MASTERY, gradeArguments);
        } finally { org.springframework.test.util.ReflectionTestUtils.setField(learners, "unitLearningMaterialService", unitMaterials); }
        var historical = examPasses.findForGoal(learnerId, c);
        assertThat(historical).singleElement().satisfies(pass -> assertThat(pass.planningCreditBindingIds()).isEmpty());
        // Same revision: a valid exact replay must return its original result without adding the newly active grant.
        assertThat(successful(ClaudeV1Contract.TOOL_SET_MASTERY, gradeArguments)).isEqualTo(firstResult);
        assertThat(examPasses.findForGoal(learnerId, c)).isEqualTo(historical);
        successful(ClaudeV1McpContractAdapter.TOOL_CHOOSE_COMPLETION_ROUTE,
                writeArgs("historical-return-" + duration, version(),
                        Map.of("choice", choice(context(), "Zur normalen Lernansicht"))));
        passHessianAssessment(section, d, 17);
        var unit = learners.getLearnerState(learnerId).levelCompletion().unitAssessment();
        assertThat(unit.parts()).filteredOn(UnitAssessmentResponse.Part::passed)
                .extracting(UnitAssessmentResponse.Part::goalId).containsExactlyInAnyOrder(c, d);
        assertThat(unit.planningCreditGoalIds()).isEmpty();
        assertThat(learners.getUnitPlanningCredits(learnerId)).isEmpty();
        session = historicalSession;
        authenticate();
        // Later writes invalidate presentation replays; they still must not re-enter the grading body.
        var stale = call(ClaudeV1Contract.TOOL_SET_MASTERY, gradeArguments);
        assertThat(stale.isError()).isTrue();
        assertThat(mapper.readTree(((McpSchema.TextContent) stale.content().getFirst()).text()).path("errorCode").asText())
                .isEqualTo("STALE_STATE");
        assertThat(examPasses.findForGoal(learnerId, c)).isEqualTo(historical);
        assertThat(learners.getUnitPlanningCredits(learnerId)).isEmpty();
        assertThat(masteryRepository.findByLearner_SkillpilotId(learnerId)).extracting(Mastery::getGoalKey)
                .containsExactlyInAnyOrder(c, d);
    }

    private void passHessianAssessment(String section, String goalId, int points) throws Exception {
        session = sessions.createFirstPartyLaunch(learnerId, new ClaudeV1CoachStartRequest("de", "web-start",
                new CompletionAssessmentStart("automatic:" + section, goalId, version()))).learningSessionId();
        authenticate();
        var pending = context();
        if (pending.containsKey("completionContract")) successful(ClaudeV1CompletionContractRegistry.TOOL_CONFIRM,
                Map.of("receiptCapability", map(pending, "completionContract").get("receiptCapability")));
        var evaluation = successful(ClaudeV1Contract.TOOL_GET_EXAM_EVALUATION, Map.of("goalId", goalId));
        successful(ClaudeV1Contract.TOOL_SET_MASTERY, writeArgs("child-pass-" + goalId, version(),
                Map.of("goalId", goalId, "earnedPoints", points, "evaluationCapability", evaluation.get("evaluationCapability"))));
        successful(ClaudeV1McpContractAdapter.TOOL_CHOOSE_COMPLETION_ROUTE, writeArgs("child-return-" + goalId,
                version(), Map.of("choice", choice(context(), "Zur normalen Lernansicht"))));
    }

    @Test void ordinaryCoachSessionOffersAndStartsTheExamWithoutPriorSectionSelection() throws Exception {
        returnToOrdinaryLearning();
        long before = version();
        var pending = context();
        assertThat(map(pending, "activeGoal")).containsEntry("id", PREPARATION);
        assertThat(map(pending, "levelCompletion").get("choices")).isEqualTo(List.of());
        assertThat(pending).doesNotContainKey("assessmentShortcuts");
        successful(ClaudeV1CompletionContractRegistry.TOOL_CONFIRM,
                Map.of("receiptCapability", map(pending, "completionContract").get("receiptCapability")));
        var offered = context();
        String start = choice(offered, "Prüfung direkt versuchen: ");
        assertThat(start).contains("Skalarprodukt über eine orthogonale Projektion erklären");
        assertThat(mapper.writeValueAsString(offered)).doesNotContain("taskContent", "solutionContent", "evaluationCapability");
        assertThat(version()).isEqualTo(before);
        assertThat(learnerRepository.findById(learnerId).orElseThrow().getCompletionWorkflow()).isNull();
        assertThat(call(ClaudeV1McpContractAdapter.TOOL_CHOOSE_COMPLETION_ROUTE,
                writeArgs("stale-direct-entry", before - 1, Map.of("choice", start))).isError()).isTrue();
        assertThat(learnerRepository.findById(learnerId).orElseThrow().getActiveGoalId()).isEqualTo(PREPARATION);
        var started = successful(ClaudeV1McpContractAdapter.TOOL_CHOOSE_COMPLETION_ROUTE,
                writeArgs("ordinary-direct-entry", before, Map.of("choice", start)));
        assertThat(version()).isEqualTo(before + 1);
        assertThat(map(map(started, "context"), "activeGoal")).containsEntry("id", EXAM);
        assertThat(map(map(started, "context"), "levelCompletion")).containsEntry("directAssessmentRunning", true);
        assertThat(masteryRepository.findByLearner_SkillpilotId(learnerId)).isEmpty();
        assertThat(focus.findByLearner_SkillpilotId(learnerId)).extracting(PlannedGoal::getGoalId).containsExactly(PREPARATION);
    }

    @Test void anObsoleteOrdinarySessionKeepsTeachingAndOffersOnlyTheReadOnlyCockpitHandoff() throws Exception {
        returnToOrdinaryLearning();
        sessionRepository.updateCompletionContract(sessionTokens.hash(session), "confirmed:obsolete-contract");
        long before = version();
        var ordinary = context();
        assertThat(map(ordinary, "activeGoal")).containsEntry("id", PREPARATION);
        assertThat(ordinary).doesNotContainKey("completionContract");
        assertThat(map(ordinary, "levelCompletion").get("choices")).isEqualTo(List.of());
        var handoff = map(ordinary, "assessmentShortcuts");
        assertThat(handoff.get("notice").toString()).contains("Normales Lernen", "neue unterstützte Claude-Sitzung");
        assertThat(handoff.get("options").toString()).contains("/learner/" + EXAM + "?completionShortcuts=1");
        assertThat(handoff.toString()).doesNotContain(learnerId, session, "taskContent", "solutionContent");
        assertThat(version()).isEqualTo(before);
        assertThat(learnerRepository.findById(learnerId).orElseThrow().getCompletionWorkflow()).isNull();
        assertThat(masteryRepository.findByLearner_SkillpilotId(learnerId)).isEmpty();
    }

    @ParameterizedTest
    @ValueSource(strings = {"de", "en"})
    void firstPartyDirectLaunchSelectsTheSectionAndBindsOnlyItsNewSession(String locale) throws Exception {
        returnToOrdinaryLearning();
        String oldSession = session;
        long before = version();
        var launch = sessions.createFirstPartyLaunch(learnerId, new ClaudeV1CoachStartRequest(locale, "web-start",
                new com.skillpilot.backend.api.CompletionAssessmentStart(PROFILE, EXAM, before)));
        String instruction = "de".equals(locale)
                ? "Nutze den SkillPilot-Coach-Skill und lerne mit meinem aktuellen SkillPilot-Lernkontext weiter."
                : "Use the SkillPilot Coach skill and continue with my current SkillPilot learning context.";
        assertThat(launch.prompt()).isEqualTo(instruction + "\nlearningSessionId: " + launch.learningSessionId());
        assertThat(version()).isEqualTo(before + 1);
        session = launch.learningSessionId();
        authenticate();
        var pending = context();
        successful(ClaudeV1CompletionContractRegistry.TOOL_CONFIRM,
                Map.of("receiptCapability", map(pending, "completionContract").get("receiptCapability")));
        assertThat(map(context(), "activeGoal")).containsEntry("id", EXAM);
        session = oldSession;
        authenticate();
        var oldPending = context();
        if (oldPending.containsKey("completionContract")) {
            successful(ClaudeV1CompletionContractRegistry.TOOL_CONFIRM,
                    Map.of("receiptCapability", map(oldPending, "completionContract").get("receiptCapability")));
        }
        var foreign = context();
        assertThat(foreign.get("activeGoal")).isNull();
        assertThat(map(foreign, "levelCompletion").get("choices")).isEqualTo(List.of());
        assertThat(call(ClaudeV1Contract.TOOL_GET_EXAM_EVALUATION, Map.of("goalId", EXAM)).isError()).isTrue();
        assertThat(masteryRepository.findByLearner_SkillpilotId(learnerId)).isEmpty();
    }

    @Test void failedAssessmentRetryAndConfirmedMasteryUseFreshCapabilitiesAndOneBinaryResult() throws Exception {
        Map<String, Object> pending = context();
        String receipt = (String) map(pending, "completionContract").get("receiptCapability");
        long beforeReceipt = version();
        assertThat(successful(ClaudeV1CompletionContractRegistry.TOOL_CONFIRM,
                Map.of("receiptCapability", receipt)).get("confirmed")).isEqualTo(true);
        assertThat(version()).isEqualTo(beforeReceipt);
        Map<String, Object> initial = context();
        String start = choice(initial, "Prüfung direkt versuchen: ");
        long beforeStart = version();
        assertThat(call(ClaudeV1McpContractAdapter.TOOL_CHOOSE_COMPLETION_ROUTE,
                writeArgs("forged-choice", beforeStart, Map.of("choice", "Prüfung direkt versuchen"))).isError()).isTrue();
        assertThat(version()).isEqualTo(beforeStart);
        var started = successful(ClaudeV1McpContractAdapter.TOOL_CHOOSE_COMPLETION_ROUTE,
                writeArgs("direct-start", beforeStart, Map.of("choice", start)));
        assertThat(map(map(started, "context"), "activeGoal")).containsEntry("id", EXAM);
        String projected = mapper.writeValueAsString(map(started, "context"));
        assertThat(projected).doesNotContain("solutionContent", "passingPoints", "evaluationCapability", "sessionBinding");
        assertThat(learnerRepository.findById(learnerId).orElseThrow().getStrictMode()).isTrue();
        assertThat(focus.findByLearner_SkillpilotId(learnerId)).extracting(PlannedGoal::getGoalId).containsExactly(PREPARATION);

        Map<String, Object> firstEvaluation = successful(ClaudeV1Contract.TOOL_GET_EXAM_EVALUATION, Map.of("goalId", EXAM));
        long activeVersion = version();
        assertThat(call(ClaudeV1Contract.TOOL_SET_MASTERY, writeArgs("not-passed", activeVersion,
                Map.of("goalId", EXAM, "evaluationCapability", firstEvaluation.get("evaluationCapability"), "earnedPoints", 4.0))).isError()).isTrue();
        assertThat(version()).isEqualTo(activeVersion);
        assertThat(masteryRepository.findByLearner_SkillpilotId(learnerId)).isEmpty();
        assertThat(learners.getLearnerState(learnerId).levelCompletion().directAssessmentRunning()).isTrue();

        String retry = choice(context(), "Prüfung erneut versuchen");
        successful(ClaudeV1McpContractAdapter.TOOL_CHOOSE_COMPLETION_ROUTE,
                writeArgs("retry", activeVersion, Map.of("choice", retry)));
        long retryVersion = version();
        assertThat(retryVersion).isGreaterThan(activeVersion);
        assertThat(call(ClaudeV1Contract.TOOL_SET_MASTERY, writeArgs("stale-capability", retryVersion,
                Map.of("goalId", EXAM, "evaluationCapability", firstEvaluation.get("evaluationCapability"), "earnedPoints", 10.0))).isError()).isTrue();
        assertThat(masteryRepository.findByLearner_SkillpilotId(learnerId)).isEmpty();

        Map<String, Object> freshEvaluation = successful(ClaudeV1Contract.TOOL_GET_EXAM_EVALUATION, Map.of("goalId", EXAM));
        Map<String, Object> passArgs = writeArgs("confirmed-pass", retryVersion, Map.of("goalId", EXAM,
                "evaluationCapability", freshEvaluation.get("evaluationCapability"), "earnedPoints", 10.0));
        var saved = successful(ClaudeV1Contract.TOOL_SET_MASTERY, passArgs);
        assertThat(saved).containsEntry("savedGoalId", EXAM).containsEntry("savedMastery", 1.0);
        // Passing one assessment cannot complete the full Personal Curriculum.
        // Other open assessments may still demand the same preparation.
        assertThat(map(map(saved, "context"), "levelCompletion")).containsEntry("complete", false);
        var completed = learners.getLearnerState(learnerId).levelCompletion();
        assertThat(completed.masteredAssessmentCount()).isEqualTo(1);
        assertThat(completed.requiredAssessmentCount()).isGreaterThan(24);
        assertThat(completed.pendingTargetCount()).isPositive();
        assertThat(completed.assessments()).filteredOn(assessment -> EXAM.equals(assessment.goalId()))
                .singleElement().satisfies(assessment -> assertThat(assessment.mastered()).isTrue());
        assertThat(successful(ClaudeV1Contract.TOOL_SET_MASTERY, passArgs)).isEqualTo(saved);
        assertThat(call(ClaudeV1Contract.TOOL_SET_MASTERY, writeArgs("new-write", version(), Map.of("goalId", EXAM))).isError()).isTrue();
        assertThat(masteryRepository.findByLearner_SkillpilotId(learnerId)).singleElement()
                .satisfies(m -> { assertThat(m.getGoalKey()).isEqualTo(EXAM); assertThat(m.getValue()).isEqualTo(1.0); });
        assertThat(learners.getMastery(learnerId).getOrDefault(PREPARATION, 0.0)).isZero();
    }

    @Test void leavingTheRouteInTheCockpitInvalidatesAlreadyIssuedExamAndRouteCapabilities() throws Exception {
        var pending = context();
        successful(ClaudeV1CompletionContractRegistry.TOOL_CONFIRM,
                Map.of("receiptCapability", map(pending, "completionContract").get("receiptCapability")));
        String start = choice(context(), "Prüfung direkt versuchen: ");
        successful(ClaudeV1McpContractAdapter.TOOL_CHOOSE_COMPLETION_ROUTE,
                writeArgs("start-before-leaving", version(), Map.of("choice", start)));
        var evaluation = successful(ClaudeV1Contract.TOOL_GET_EXAM_EVALUATION, Map.of("goalId", EXAM));
        String oldRoute = choice(context(), "Prüfung erneut versuchen");
        long before = version();
        learners.chooseLevelCompletion(learnerId, new LevelCompletionActionRequest(
                "leaveProfile", null, null, null, before));
        assertThat(version()).isGreaterThan(before);
        assertThat(map(context(), "levelCompletion")).containsEntry("calculationStatus", "valid")
                .containsEntry("directAssessmentRunning", false);
        assertThat(call(ClaudeV1Contract.TOOL_SET_MASTERY, writeArgs("stale-grade-after-leaving", before,
                Map.of("goalId", EXAM, "evaluationCapability", evaluation.get("evaluationCapability"), "earnedPoints", 10.0))).isError()).isTrue();
        assertThat(call(ClaudeV1Contract.TOOL_SET_MASTERY, writeArgs("old-evaluation-new-version", version(),
                Map.of("goalId", EXAM, "evaluationCapability", evaluation.get("evaluationCapability"), "earnedPoints", 10.0))).isError()).isTrue();
        assertThat(call(ClaudeV1McpContractAdapter.TOOL_CHOOSE_COMPLETION_ROUTE,
                writeArgs("old-route-after-leaving", version(), Map.of("choice", oldRoute))).isError()).isTrue();
        assertThat(masteryRepository.findByLearner_SkillpilotId(learnerId)).isEmpty();
        assertThat(learnerRepository.findById(learnerId).orElseThrow().getActiveGoalId()).isNull();
        var learner = learnerRepository.findById(learnerId).orElseThrow();
        assertThat(learner.getCompletionWorkflow()).isNull();
        learners.chooseLevelCompletion(learnerId, new LevelCompletionActionRequest(
                "selectProfile", PROFILE, null, null, learner.getCoachStateRevision()));
        assertThat(choice(context(), "Prüfung direkt versuchen: ")).isNotBlank();
        assertThat(masteryRepository.findByLearner_SkillpilotId(learnerId)).isEmpty();
    }

    @Test void aFreshSessionWithALegacyOptOutCanUseAnOfferedAssessment() throws Exception {
        var legacy = learnerRepository.findById(learnerId).orElseThrow();
        legacy.setUseAssessmentShortcuts(false);
        learnerRepository.saveAndFlush(legacy);
        session = sessions.createFirstPartyLaunch(learnerId, new ClaudeV1CoachStartRequest("de", "web-start")).learningSessionId();
        authenticate();
        var pending = context();
        successful(ClaudeV1CompletionContractRegistry.TOOL_CONFIRM,
                Map.of("receiptCapability", map(pending, "completionContract").get("receiptCapability")));
        assertThat(choice(context(), "Prüfung direkt versuchen: ")).isNotBlank();
        assertThat(masteryRepository.findByLearner_SkillpilotId(learnerId)).isEmpty();
    }

    private void authenticate() {
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(session, "unused", List.of(
                new SimpleGrantedAuthority("SCOPE_" + ClaudeV1Contract.SCOPE_READ),
                new SimpleGrantedAuthority("SCOPE_" + ClaudeV1Contract.SCOPE_WRITE))));
    }
    private long version() { return learnerRepository.findById(learnerId).orElseThrow().getCoachStateRevision(); }
    private Map<String, Object> context() throws Exception { return successful(ClaudeV1Contract.TOOL_GET_COACH_CONTEXT, Map.of()); }
    private Map<String, Object> writeArgs(String request, long revision, Map<String, Object> extra) {
        var result = new LinkedHashMap<>(extra);
        result.put("clientRequestId", UUID.nameUUIDFromBytes(request.getBytes(java.nio.charset.StandardCharsets.UTF_8)).toString());
        result.put("expectedStateVersion", revision); return result;
    }
    private String choice(Map<String, Object> context, String prefix) {
        return ((List<?>) map(context, "levelCompletion").get("choices")).stream().map(String::valueOf)
                .filter(label -> label.startsWith(prefix))
                .filter(label -> !prefix.equals("Prüfung direkt versuchen: ")
                        || label.contains("Skalarprodukt über eine orthogonale Projektion erklären"))
                .findFirst().orElseThrow();
    }
    private McpSchema.CallToolResult call(String tool, Map<String, Object> arguments) {
        Map<String, Object> request = new LinkedHashMap<>(arguments);
        request.put("learningSessionId", session); request.put("language", "de");
        var specification = adapter.toolSpecifications().stream().filter(spec -> tool.equals(spec.tool().name())).findFirst().orElseThrow();
        return specification.callHandler().apply(McpTransportContext.EMPTY, new McpSchema.CallToolRequest(tool, request));
    }
    private Map<String, Object> successful(String tool, Map<String, Object> arguments) throws Exception {
        var response = call(tool, arguments);
        assertThat(response.isError()).as("%s: %s", tool, response.content()).isFalse();
        return mapper.readValue(((McpSchema.TextContent) response.content().getFirst()).text(), new TypeReference<>() {});
    }
    @SuppressWarnings("unchecked") private Map<String, Object> map(Map<String, Object> parent, String key) {
        assertThat(parent.get(key)).as(key).isInstanceOf(Map.class); return (Map<String, Object>) parent.get(key);
    }
}
