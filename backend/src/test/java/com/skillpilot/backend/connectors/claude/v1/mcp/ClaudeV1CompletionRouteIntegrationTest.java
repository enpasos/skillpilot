package com.skillpilot.backend.connectors.claude.v1.mcp;

import static org.assertj.core.api.Assertions.*;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.LevelCompletionActionRequest;
import com.skillpilot.backend.api.CompletionAssessmentStart;
import com.skillpilot.backend.api.UnitAssessmentResponse;
import com.skillpilot.backend.api.LevelCompletionResponse;
import com.skillpilot.backend.api.LearnerLearningPlanApi;
import com.skillpilot.backend.completion.AssessmentMaterialRevision;
import com.skillpilot.backend.completion.UnitAssessmentContract;
import com.skillpilot.backend.service.UnitLearningMaterialService;
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
        "skillpilot.completion.unit-assessment-pilot-enabled=true",
        ClaudeV1TestProperties.ENABLED, ClaudeV1TestProperties.SIGNING_SECRET,
        ClaudeV1TestProperties.CAPABILITY_SECRET, ClaudeV1TestProperties.BETA_DISABLED,
        "spring.datasource.url=jdbc:h2:mem:completion-mcp;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;NON_KEYWORDS=VALUE"
})
@ActiveProfiles("test")
class ClaudeV1CompletionRouteIntegrationTest {
    private static final List<Integer> HESSIAN_PASS_ORDER = List.of(2, 3, 0, 1);
    private static final String PROFILE = "automatic:personal-curriculum";
    private static final String MOTION_OPENING = "a4d4efe1-7d30-526b-ac9c-806113da4363";
    private static final String FALL_OPENING = "b4e95dce-8537-5e38-8aa6-0d9cfaa2b19e";
    private static final String ROOT = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
    private static final String MATH = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
    private static final String PREPARATION = "3016ec37-1c2e-47db-83f5-e767923bc97e";
    private static final String EXAM = "e98672c6-871a-5d0b-889c-5afc51040f0d";
    @Autowired ClaudeV1McpContractAdapter adapter;
    @Autowired ClaudeV1LearningSessionService sessions;
    @Autowired com.skillpilot.backend.connectors.claude.v1.session.ClaudeV1LearningSessionRepository sessionRepository;
    @Autowired com.skillpilot.backend.connectors.claude.v1.session.ClaudeV1SessionTokenCodec sessionTokens;
    @Autowired LearnerService learners;
    @Autowired com.skillpilot.backend.content.ContentSelectionService contentSelections;
    @Autowired LearnerLearningPlanService learningPlans;
    @Autowired com.skillpilot.backend.service.CompositionViewService compositionViews;
    @Autowired com.skillpilot.backend.repository.LearnerLearningPlanRepository storedPlans;
    @Autowired com.skillpilot.backend.landscape.LandscapeService landscapeDefinitions;
    @Autowired LearnerRepository learnerRepository;
    @Autowired MasteryRepository masteryRepository;
    @Autowired PlannedGoalRepository focus;
    @Autowired ObjectMapper mapper;
    @Autowired VerifiedExamPassService examPasses;
    @org.springframework.test.context.bean.override.mockito.MockitoSpyBean UnitLearningMaterialService unitMaterials;
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
        assertThat(learners.getLearnerState(learnerId).levelCompletion().calculationStatus()).isEqualTo("valid");
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

    @Test void twoCompletedAssignmentsAndTheirOptionalAssessmentsRemainSelectableAcrossPages() throws Exception {
        String section = selectHessianMotionUnit("G9", "SekII", "LK");
        var firstParts = prepareUnitContinuation(section, 4, false);
        String physics = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
        String view = "de-he-gym-sekii-physics-lk";
        String node = "physics-e2-newton-and-conservation";
        String secondSection = "composition:" + view + ":structure:" + node;
        String secondExam = "68061652-d617-5e51-8d2a-1c686c3c49df";
        learners.setPlannedGoals(learnerId, java.util.Set.of(secondSection));
        learners.chooseLevelCompletion(learnerId, new LevelCompletionActionRequest(
                "selectProfile", "automatic:" + secondSection, null, null, version()));
        var exam = landscapeDefinitions.getGoalDefinition(secondExam).getExamData();
        passHessianAssessment(secondSection, secondExam, (int) exam.getScoring().getPassingPoints());

        registerSecondUnitForPaging(physics, view, node, secondSection, secondExam);

        var options = learners.getUnitAssignmentOptions(learnerId, physics);
        var second = options.stream().filter(item -> secondSection.equals(item.sectionGoalId())).findFirst().orElseThrow();
        assertThat(options).filteredOn(item -> item.sectionGoalId().equals(section) || item.sectionGoalId().equals(secondSection))
                .hasSize(2).allMatch(LearnerLearningPlanApi.UnitAssignmentOption::passed);
        var day = java.time.LocalDate.now(java.time.ZoneId.of("Europe/Berlin"));
        var plan = learningPlans.getPlan(learnerId, physics, day);
        var blocks = new java.util.ArrayList<>(plan.blocks());
        blocks.add(new LearnerLearningPlanApi.Block("second-unit", "learning", null, "Testeinheit", day, day,
                null, List.of(secondExam), List.of(secondSection), true, second.binding()));
        learningPlans.upsert(learnerId, physics, new LearnerLearningPlanApi.UpsertRequest(plan.revision(),
                plan.planLabel(), blocks), day);
        learners.setPlannedGoals(learnerId, java.util.Set.of());
        learners.setPreferences(learnerId, null, false, false);
        session = sessions.createFirstPartyLaunch(learnerId, new ClaudeV1CoachStartRequest("de", "web-start")).learningSessionId();
        authenticate();
        successful(ClaudeV1CompletionContractRegistry.TOOL_CONFIRM, Map.of(
                "receiptCapability", map(context(), "completionContract").get("receiptCapability")));
        var allParts = new java.util.ArrayList<>(firstParts);
        allParts.add(secondExam);
        var receipts = examPasses.findForGoals(learnerId, allParts);
        var mastery = learners.getMastery(learnerId);
        var completion = learners.getLearnerState(learnerId).levelCompletion();
        var practice = completion.actions().stream().filter(action -> action.practice() != null).toList();
        var voluntaryIds = options.stream().flatMap(option -> option.voluntaryGoals().stream())
                .map(LearnerLearningPlanApi.VoluntaryGoal::goalId).distinct().toList();
        assertThat(voluntaryIds).hasSizeGreaterThan(24);
        assertThat(practice).extracting(LevelCompletionResponse.Action::goalId).containsAll(voluntaryIds);
        var revision = version();
        var labels = readPublishedCompletionPages();
        assertThat(version()).isEqualTo(revision);
        assertThat(labels.keySet()).containsAll(practice.stream().map(action -> action.title().get("de")).toList());
        var late = practice.stream().filter(action -> labels.get(action.title().get("de")) > 1).findFirst().orElseThrow();
        var title = late.title().get("de");
        String choose = ClaudeV1McpContractAdapter.TOOL_CHOOSE_COMPLETION_ROUTE;
        assertThat(call(choose, writeArgs("wrong-page", revision, Map.of("choice", title))).isError()).isTrue();
        for (Object invalid : List.of(0, -1, 1.5, "2", 1L + Integer.MAX_VALUE, Integer.MAX_VALUE)) {
            assertThat(call(ClaudeV1Contract.TOOL_GET_COACH_CONTEXT, Map.of("completionChoicePage", invalid)).isError()).isTrue();
        }
        assertThat(version()).isEqualTo(revision);
        var request = writeArgs("second-page-practice", revision, Map.of("choice", title, "completionChoicePage", labels.get(title)));
        var result = successful(choose, request);
        assertThat(map(map(result, "context"), "activeGoal")).containsEntry("id", late.practice().startGoalId());
        assertThat(learners.getPlannedGoals(learnerId)).contains(late.goalId());
        assertThat(successful(choose, request)).isEqualTo(result);
        assertThat(call(choose, writeArgs("second-page-practice", revision, Map.of("choice", title))).isError()).isTrue();
        assertThat(call(choose, writeArgs("stale-page", revision,
                Map.of("choice", title, "completionChoicePage", labels.get(title)))).isError()).isTrue();

        // Both current LK extras remain explicit choices across the published completion pages.
        var examPages = new java.util.ArrayList<Integer>();
        for (String extraId : hessianVoluntaryAssessmentIds("LK")) {
            var current = readPublishedCompletionPages();
            String examTitle = landscapeDefinitions.getGoalDefinition(extraId).getTitle();
            var entry = current.entrySet().stream().filter(item -> item.getKey().endsWith(examTitle)).findFirst().orElseThrow();
            examPages.add(entry.getValue());
            var started = successful(choose, writeArgs("start-" + extraId, version(),
                    Map.of("choice", entry.getKey(), "completionChoicePage", entry.getValue())));
            var active = map(started, "context");
            assertThat(map(active, "activeGoal")).containsEntry("id", extraId);
            successful(choose, writeArgs("leave-" + extraId, version(), Map.of("choice", choice(active, "Zur normalen Lernansicht"))));
        }
        assertThat(examPages).anyMatch(page -> page > 1);
        assertThat(learners.getMastery(learnerId)).isEqualTo(mastery);
        assertThat(examPasses.findForGoals(learnerId, allParts)).isEqualTo(receipts);
    }

    // Test-only unit material. Both its plan and the existing Hessian unit use real in-scope
    // goals, a versioned task and rubric, the assessment handler and persisted passing receipts.
    private void registerSecondUnitForPaging(String physics, String view, String node, String secondSection, String secondExam) {
        var content = learners.resolveLearningPlanGoalIds(learnerId, physics, List.of(secondSection)).stream()
                .map(landscapeDefinitions::getGoalDefinition)
                .filter(goal -> !CompletionProfileCompiler.isAssessment(goal) && !CompletionProfileCompiler.isMemory(goal)
                        && !CompletionProfileCompiler.isOrientation(goal))
                .map(goal -> goal.getId()).sorted().limit(15).toList();
        assertThat(content).hasSize(15);
        var exam = landscapeDefinitions.getGoalDefinition(secondExam).getExamData();
        var contract = new UnitAssessmentContract("paging-test", List.of(view),
                List.of(new UnitAssessmentContract.Part(secondExam, AssessmentMaterialRevision.of(exam))), content, List.of());
        var binding = new UnitLearningMaterialService.AssessmentBinding(physics, view, node, contract);
        org.mockito.Mockito.doAnswer(call -> {
            @SuppressWarnings("unchecked")
            var existing = (List<UnitLearningMaterialService.AssessmentBinding>) call.callRealMethod();
            if (!call.<java.util.Collection<String>>getArgument(0).contains(view)) return existing;
            var both = new java.util.ArrayList<>(existing);
            both.add(binding);
            return List.copyOf(both);
        }).when(unitMaterials).assessmentBindings(org.mockito.ArgumentMatchers.anyCollection());
        org.mockito.Mockito.doReturn(java.util.Optional.of(binding)).when(unitMaterials).assessmentBindingForReference(secondSection);
    }

    private Map<String, Integer> readPublishedCompletionPages() throws Exception {
        var labels = new LinkedHashMap<String, Integer>();
        int page = 1;
        while (true) {
            var arguments = page == 1 ? Map.<String, Object>of() : Map.<String, Object>of("completionChoicePage", page);
            var route = map(successful(ClaudeV1Contract.TOOL_GET_COACH_CONTEXT, arguments), "levelCompletion");
            var pages = map(route, "choicePagination");
            assertThat(pages).containsEntry("page", page);
            assertThat(route.get("instruction").toString()).contains("completionChoicePage", "chosen exact title");
            if (page > 1) assertThat(pages).containsEntry("previousPage", page - 1);
            var choices = (List<?>) route.get("choices");
            assertThat(choices).hasSizeBetween(1, 24);
            for (var choice : choices) assertThat(labels.put(choice.toString(), page)).isNull();
            if (!pages.containsKey("nextPage")) {
                assertThat(pages).containsEntry("pageCount", page);
                return labels;
            }
            assertThat(pages).containsEntry("nextPage", page + 1);
            page++;
        }
    }

    @ParameterizedTest
    @ValueSource(strings = {"G8", "G9"})
    void hessianMotionInTheCoachToolUsesThePersonalMapAndItsOwnAssessmentPlacement(String duration) throws Exception {
        String active = "89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2";
        // E.1 cut (23 Nov 2026): the throw requires the free-fall experiment, which requires the
        // motion laws; reference frames left E.1 for E.3.
        String recorded = "09029573-864f-40ca-bf8a-cee7bf6dcb73";
        // The parent unit E.1 names no closing exam: the mixed exam "Bewegungsanalyse und freier Fall"
        // is retired for all Länder (25 Nov 2026). The child unit "Freier Fall schwerer Kugeln"
        // names its own closing exam, which the coach offers with the exam's own placement.
        String retiredMixedExam = "a9562b05-c54d-5635-9244-3f7dd24a8642";
        String childGoal = "8aff7aac-321b-5172-ac55-877876bfd2cd";
        String exam = "f13ca187-b680-5f47-b4ad-76bd474bd8a2";
        selectHessianMotionUnit(duration);
        completeHessianOpeningFixtures();
        // Issue #85: a card enters the box only once its understanding goal is passed. Of the
        // unit's seven cards only the one for the recorded goal is released here.
        masteryRepository.saveAndFlush(new Mastery(learnerRepository.findById(learnerId).orElseThrow(), recorded, 1.0));
        session = sessions.createFirstPartyLaunch(learnerId, new ClaudeV1CoachStartRequest("de", "web-start")).learningSessionId();
        authenticate();
        successful(ClaudeV1CompletionContractRegistry.TOOL_CONFIRM,
                Map.of("receiptCapability", map(context(), "completionContract").get("receiptCapability")));
        var focused = context();
        assertThat(focused.get("activeGoal")).isNull();
        var focusedUnit = mapper.valueToTree(map(focused, "focusedUnitContext"));
        assertThat(focusedUnit.path("unitIntroduction").path("sectionTitle").asText()).isEqualTo("E.1 Bewegungen und ihre Beschreibung");
        assertThat(focusedUnit.path("activities")).hasSize(1);
        assertThat(focusedUnit.path("activities").get(0).path("route").asText()).isEqualTo("unitPractice");
        var practiceAction = focusedUnit.path("activities").get(0).path("action");
        var practice = call(practiceAction.path("tool").asText(),
                mapper.convertValue(practiceAction.path("arguments"), new TypeReference<>() {}));
        assertThat(practice.isError()).isFalse();
        assertThat(mapper.valueToTree(practice.structuredContent()).path("progress").path("totalCards").asInt()).isEqualTo(1);
        assertThat(practice.structuredContent().toString()).doesNotContain("physics_e_cov_", "reviewCapability");
        assertThat(practice.meta()).containsOnlyKeys("skillpilotMemoryCard");
        assertThat(learnerRepository.findById(learnerId).orElseThrow().getActiveGoalId()).isNull();
        var learner = learnerRepository.findById(learnerId).orElseThrow();
        // A learner who was working on the retired mixed exam keeps that id as stored active goal.
        // The coach reports no active goal and still describes the focused unit with its activity.
        learner.setActiveGoalId(retiredMixedExam);
        learnerRepository.saveAndFlush(learner);
        var afterRetirement = context();
        assertThat(afterRetirement.get("activeGoal")).isNull();
        var unitAfterRetirement = mapper.valueToTree(map(afterRetirement, "focusedUnitContext"));
        assertThat(unitAfterRetirement.path("unitIntroduction").path("sectionTitle").asText()).isEqualTo("E.1 Bewegungen und ihre Beschreibung");
        assertThat(unitAfterRetirement.path("activities")).hasSize(1);
        assertThat(afterRetirement.toString()).doesNotContain(retiredMixedExam, "Bewegungsanalyse und freier Fall");
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
        // FF->LAWS edge (23 Nov 2026): the motion laws now reach the throw through the free-fall goal only.
        assertThat(detail.path("prerequisites")).hasSize(1);
        assertThat(detail.path("prerequisites").get(0).path("title").asText()).isEqualTo("Freier Fall experimentell untersuchen");
        assertThat(detail.path("prerequisites").get(0).path("recorded").asBoolean()).isTrue();
        assertThat(detail.path("activities")).hasSize(1);
        assertThat(detail.path("activities").get(0).path("route").asText()).isEqualTo("unitPractice");
        assertThat(response.toString()).doesNotContain(retiredMixedExam, "Bewegungsanalyse und freier Fall");
        assertThat(version()).isEqualTo(before);

        learner.setActiveGoalId(childGoal);
        learnerRepository.saveAndFlush(learner);
        before = version();
        response = context();
        assertThat(map(response, "activeGoal")).containsEntry("id", childGoal);
        detail = mapper.valueToTree(map(response, "activeGoalContext"));
        sections = mapper.convertValue(detail.path("unitPaths").get(0).path("sections"), new TypeReference<>() {});
        assertThat(sections).containsSubsequence("Freier Fall schwerer Kugeln", "E.1 Bewegungen und ihre Beschreibung");
        assertThat(detail.path("unitIntroduction").path("sectionTitle").asText()).isEqualTo("Freier Fall schwerer Kugeln");
        assertThat(detail.path("activities")).hasSize(2);
        assertThat(detail.path("activities").get(0).path("route").asText()).isEqualTo("unitPractice");
        var activity = detail.path("activities").get(1);
        assertThat(activity.path("goalId").asText()).isEqualTo(exam);
        assertThat(activity.path("sectionTitle").asText()).isEqualTo("Freier Fall schwerer Kugeln · E.1 Bewegungen und ihre Beschreibung");
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
                .containsExactlyInAnyOrder(recorded, MOTION_OPENING, FALL_OPENING);
    }

    /** These existing cases start after the learner has already received both openings. */
    private void completeHessianOpeningFixtures() {
        var learner = learnerRepository.findById(learnerId).orElseThrow();
        masteryRepository.saveAllAndFlush(List.of(new Mastery(learner, MOTION_OPENING, 1.0),
                new Mastery(learner, FALL_OPENING, 1.0)));
    }

    @Test
    void guidedUnitOpeningSurvivesAResumedCoachSessionAndItsConfirmationResumesTheChosenGoal() throws Exception {
        selectHessianMotionUnit("G9", "SekII");
        learners.setPreferences(learnerId, null, false, false);
        String target = "8aff7aac-321b-5172-ac55-877876bfd2cd";
        learners.setActiveGoal(learnerId, target);
        assertThat(learnerRepository.findById(learnerId).orElseThrow().getActiveGoalId()).isEqualTo(MOTION_OPENING);
        for (int launch = 0; launch < 2; launch++) {
            session = sessions.createFirstPartyLaunch(learnerId, new ClaudeV1CoachStartRequest("de", "web-start")).learningSessionId();
            authenticate();
            var pending = context();
            if (pending.containsKey("completionContract")) successful(ClaudeV1CompletionContractRegistry.TOOL_CONFIRM,
                    Map.of("receiptCapability", map(pending, "completionContract").get("receiptCapability")));
            var current = context();
            assertThat(map(current, "activeGoal")).containsEntry("id", MOTION_OPENING);
            var intro = mapper.valueToTree(map(current, "activeGoalContext")).required("unitIntroduction");
            assertThat(intro.required("orientationGoalId").asText()).isEqualTo(MOTION_OPENING);
            assertThat(intro.required("state").asText()).isEqualTo("orientation");
            assertThat(intro.required("scene").asText()).isNotBlank();
            assertThat(intro.required("topics").size()).isPositive();
            assertThat(masteryRepository.findByLearner_SkillpilotId(learnerId)).isEmpty();
        }
        successful(ClaudeV1Contract.TOOL_SET_MASTERY, writeArgs("confirm-unit-opening", version(), Map.of("goalId", MOTION_OPENING)));
        // Since the E.1 cut (23 Nov 2026) the chosen goal belongs to the child unit "Freier Fall schwerer
        // Kugeln", whose own opening follows before the chosen goal resumes.
        assertThat(learnerRepository.findById(learnerId).orElseThrow().getActiveGoalId()).isEqualTo(FALL_OPENING);
        assertThat(masteryRepository.findByLearner_SkillpilotId(learnerId)).singleElement()
                .satisfies(result -> assertThat(result.getGoalKey()).isEqualTo(MOTION_OPENING));
        successful(ClaudeV1Contract.TOOL_SET_MASTERY, writeArgs("confirm-child-opening", version(), Map.of("goalId", FALL_OPENING)));
        assertThat(learnerRepository.findById(learnerId).orElseThrow().getActiveGoalId()).isEqualTo(target);
        assertThat(masteryRepository.findByLearner_SkillpilotId(learnerId)).extracting(Mastery::getGoalKey)
                .containsExactlyInAnyOrder(MOTION_OPENING, FALL_OPENING);
    }

    @Test
    void aDirectAssessmentNeedsNoOpeningAndAbandoningItReturnsToTheStillOpenUnitEntry() throws Exception {
        String section = selectHessianMotionUnit("G9", "SekII");
        String exam = "ee7d5f3d-858f-59d6-89b0-e5a7f437f458";
        session = sessions.createFirstPartyLaunch(learnerId, new ClaudeV1CoachStartRequest("de", "web-start",
                new CompletionAssessmentStart("automatic:" + section, exam, version()))).learningSessionId();
        authenticate();
        successful(ClaudeV1CompletionContractRegistry.TOOL_CONFIRM,
                Map.of("receiptCapability", map(context(), "completionContract").get("receiptCapability")));
        assertThat(map(context(), "activeGoal")).containsEntry("id", exam);
        long beforeResourceRead = version();
        assertThat(learners.getRequiredUnitOrientationGoalId(learnerId, section)).isEqualTo(MOTION_OPENING);
        assertThat(learners.getLearner(learnerId).getActiveGoalId()).isEqualTo(exam);
        assertThat(version()).isEqualTo(beforeResourceRead);
        assertThat(masteryRepository.findByLearner_SkillpilotId(learnerId)).isEmpty();
        var abandoned = learners.chooseLevelCompletion(learnerId, new LevelCompletionActionRequest(
                "leaveProfile", null, null, null, version()));
        assertThat(abandoned.activeGoal()).isNull();
        assertThat(abandoned.frontier()).extracting(com.skillpilot.backend.api.FrontierGoal::id).containsExactly(MOTION_OPENING);
        assertThat(masteryRepository.findByLearner_SkillpilotId(learnerId)).isEmpty();
    }

    @Test
    void explicitChildEntryKeepsItsUnitAfterCompletionAndANewCoachSessionWithoutCompletingTheParent() throws Exception {
        selectHessianMotionUnit("G9", "SekII");
        learners.setPreferences(learnerId, null, false, false);
        learners.setActiveGoal(learnerId, FALL_OPENING);
        session = sessions.createFirstPartyLaunch(learnerId, new ClaudeV1CoachStartRequest("de", "web-start")).learningSessionId();
        authenticate();
        successful(ClaudeV1CompletionContractRegistry.TOOL_CONFIRM,
                Map.of("receiptCapability", map(context(), "completionContract").get("receiptCapability")));
        assertThat(map(context(), "activeGoal")).containsEntry("id", FALL_OPENING);
        successful(ClaudeV1Contract.TOOL_SET_MASTERY, writeArgs("direct-child-opening", version(), Map.of("goalId", FALL_OPENING)));
        session = sessions.createFirstPartyLaunch(learnerId, new ClaudeV1CoachStartRequest("de", "web-start")).learningSessionId();
        authenticate();
        var pending = context();
        if (pending.containsKey("completionContract")) successful(ClaudeV1CompletionContractRegistry.TOOL_CONFIRM,
                Map.of("receiptCapability", map(pending, "completionContract").get("receiptCapability")));
        // Since the E.1 cut (23 Nov 2026) accelerated motion requires the t-v diagram goal of the same
        // child unit, so the child's first open content goal is the t-v diagram goal.
        String target = "1e459a1b-4159-5049-84eb-9928129c1610";
        learners.setActiveGoal(learnerId, target);
        assertThat(map(context(), "activeGoal")).containsEntry("id", target);
        assertThat(learners.getPlannedGoals(learnerId)).singleElement()
                .satisfies(id -> assertThat(id).endsWith(":structure:physics-e1-accelerated-and-free-fall"));
        assertThat(learners.getMastery(learnerId)).containsEntry(FALL_OPENING, 1.0).doesNotContainKey(MOTION_OPENING);
    }

    @ParameterizedTest
    @CsvSource({"G8,GK,false", "G9,GK+LK,true"})
    void normalStudyRecommendsTheFirstOpenExperimentalStepInItsChildAndParent(
            String duration, String course, boolean parentFocus) throws Exception {
        String parent = selectHessianMotionUnit(duration, "SekII", course);
        String child = parent.replace(":structure:physics-e1-motion", ":structure:physics-e1-accelerated-and-free-fall");
        var steps = List.of("e0004439-ed34-5caf-858a-6107918224eb", "e4b38061-1f28-43ad-8371-a3e7c0e81856",
                "09029573-864f-40ca-bf8a-cee7bf6dcb73", "f13ca187-b680-5f47-b4ad-76bd474bd8a2");
        learners.setPlannedGoals(learnerId, java.util.Set.of(parentFocus ? parent : child));
        var learner = learnerRepository.findById(learnerId).orElseThrow();
        var model = learners.getLearningPlanCompletionContext(learnerId);
        var graph = new CompletionProfileCompiler().normalizePrerequisites(model.canonicalGoals());
        var prior = new java.util.HashSet<String>();
        for (String id : steps) prior.addAll(graph.transitivePrerequisites(id));
        prior.removeAll(steps);
        prior.remove(FALL_OPENING);
        prior.add(MOTION_OPENING);
        masteryRepository.saveAllAndFlush(prior.stream().map(id -> new Mastery(learner, id, 1.0)).toList());
        assertThat(learners.getFrontier(learnerId)).contains(FALL_OPENING).doesNotContainAnyElementsOf(steps);
        masteryRepository.saveAndFlush(new Mastery(learner, FALL_OPENING, 1.0));
        if (!parentFocus) {
            learners.setPreferences(learnerId, "SEQUENTIAL", true, true);
            session = sessions.createFirstPartyLaunch(learnerId, new ClaudeV1CoachStartRequest("de", "web-start")).learningSessionId();
            authenticate();
            var initial = context();
            if (initial.containsKey("completionContract")) successful(ClaudeV1CompletionContractRegistry.TOOL_CONFIRM,
                    Map.of("receiptCapability", map(initial, "completionContract").get("receiptCapability")));
        }
        assertThat(learners.getMastery(learnerId)).doesNotContainKeys(steps.toArray(String[]::new));
        assertThat(learners.getLearnerState(learnerId).levelCompletion().waivedTargetGoalIds()).doesNotContain(steps.getFirst());
        for (String step : steps) {
            assertThat(learners.getFrontier(learnerId)).as("regular experimental step %s", step)
                    .filteredOn(steps::contains).containsExactly(step);
            assertThat(learners.getRichFrontier(learnerId)).extracting(com.skillpilot.backend.api.FrontierGoal::id)
                    .filteredOn(steps::contains).containsExactly(step);
            if (step.equals(steps.getFirst())) {
                // Selecting just the model remains possible where its real prerequisites are satisfied.
                assertThat(learners.getUncompactedRichFrontierForFocus(learnerId, List.of(steps.get(1))))
                        .extracting(com.skillpilot.backend.api.FrontierGoal::id).contains(steps.get(1));
            }
            if (!parentFocus) {
                assertThat(map(context(), "activeGoal")).containsEntry("id", step);
            }
            if (!step.equals(steps.getLast())) {
                if (parentFocus) masteryRepository.saveAndFlush(new Mastery(learner, step, 1.0));
                else successful(ClaudeV1Contract.TOOL_SET_MASTERY, writeArgs("worked-" + step, version(), Map.of("goalId", step)));
            }
        }
        assertThat(examPasses.findForGoals(learnerId, List.of(steps.getLast()))).isEmpty();
    }

    private String selectHessianMotionUnit(String duration) throws Exception {
        return selectHessianMotionUnit(duration, "CrossStage");
    }

    @Test
    void guidedStudySkipsAnOutOfScopeStepAndAnEarnedPlanningCreditWithoutGivingIndividualMastery() throws Exception {
        String parent = selectHessianMotionUnit("G9", "SekII");
        String child = parent.replace(":structure:physics-e1-motion", ":structure:physics-e1-accelerated-and-free-fall");
        String acquisition = "e0004439-ed34-5caf-858a-6107918224eb";
        String model = "e4b38061-1f28-43ad-8371-a3e7c0e81856";
        String analysis = "09029573-864f-40ca-bf8a-cee7bf6dcb73";
        prepareUnitContinuation(parent, 2, false);
        learners.setPreferences(learnerId, null, false, true, null, false);
        learners.setPlannedGoals(learnerId, java.util.Set.of(child));
        var learner = learnerRepository.findById(learnerId).orElseThrow();
        var graph = new CompletionProfileCompiler().normalizePrerequisites(
                learners.getLearningPlanCompletionContext(learnerId).canonicalGoals());
        var prior = new java.util.HashSet<>(graph.transitivePrerequisites(analysis));
        prior.addAll(graph.transitivePrerequisites(acquisition));
        prior.add(MOTION_OPENING);
        prior.add(FALL_OPENING);
        prior.removeAll(List.of(acquisition, model, analysis));
        masteryRepository.saveAllAndFlush(prior.stream().map(id -> new Mastery(learner, id, 1.0)).toList());
        // The same material can serve a partial projection that does not enrol every step.
        var view = child.substring("composition:".length(), child.indexOf(":structure:"));
        var bindings = unitMaterials.orientationBindings(List.of(view)).stream().map(binding -> {
            if (!binding.sectionGoalId().equals(child)) return binding;
            var order = new java.util.ArrayList<>(binding.guidedStudyOrder());
            order.addFirst("not-in-this-target-projection");
            return new UnitLearningMaterialService.OrientationBinding(binding.landscapeId(), binding.viewId(),
                    binding.compositionNodeId(), binding.orientationGoalId(), order);
        }).toList();
        org.mockito.Mockito.doReturn(bindings).when(unitMaterials)
                .orientationBindings(org.mockito.ArgumentMatchers.argThat(views -> views.contains(view)));
        assertThat(learners.getUnitPlanningCredits(learnerId)).containsKey(model);
        assertThat(learners.getMastery(learnerId)).doesNotContainKeys(model, acquisition, analysis);
        assertThat(learners.getLearnerState(learnerId).levelCompletion().waivedTargetGoalIds()).doesNotContain(acquisition, analysis);
        assertThat(learners.getFrontier(learnerId)).contains(acquisition).doesNotContain(analysis, model);
        masteryRepository.saveAndFlush(new Mastery(learner, acquisition, 1.0));
        assertThat(learners.getFrontier(learnerId)).contains(analysis).doesNotContain(model);
        assertThat(learners.getMastery(learnerId)).doesNotContainKey(model);
    }

    // New assessed edition: old ZB results retain their original identity and never transfer.
    private static final String HISTORICAL_WURF_EXTRA = "6ea3fb3c-abdc-568f-ab13-97c36dc274e4";
    private static final String WURF_EXTRA = "bcc56921-7107-5f5f-b721-3d5e0d7e1cd9";
    private static final String MULTIPHASE_EXTRA = "2b9e565f-d9b4-5e23-b5b7-b7977cecff06";
    // The old multiphase identity is retained as history and is never offered in E.1.
    // WURF and FFX remain the two active voluntary assessments for every course.
    private static final String FREE_FALL_SERIES_EXTRA = "f41e4e30-794e-5ce4-ba5e-cc72712cd691";
    // E.1 cut (23 Nov 2026): twelve content goals (reference frames and road traffic left; the t-v
    // diagram, the motion laws and the light/heavy fall comparison joined).
    private static final int E1_CONTENT_GOALS = 12;

    private static List<String> hessianVoluntaryAssessmentIds(String course) {
        return List.of(WURF_EXTRA, FREE_FALL_SERIES_EXTRA);
    }

    // E.1 cut (23 Nov 2026): both throw assessments require the throw goal, so the two study
    // recommendations of PR #184 left the E.1 material and their two end-to-end tests were removed.
    // The format stays covered in UnitLearningMaterialServiceTest and the plan order in
    // LearnerLearningPlanServiceTest.

    @ParameterizedTest
    @CsvSource({"G8,GK", "G9,GK", "G8,LK", "G9,LK"})
    void individualMeasurementAssessmentIsOutsideTheRegularUnitAndDoesNotExtendThePersonalObligations(
            String duration, String course) throws Exception {
        String section = selectHessianMotionUnit(duration, "SekII", course);
        String assessment = "c6e2942d-1ff4-5e86-a52a-4ca4c8568291";
        String physics = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
        assertThat(learners.resolveLearningPlanGoalIds(learnerId, physics, List.of(section))).doesNotContain(assessment);
        var personal = learners.getLearnerState(learnerId).levelCompletion();
        assertThat(personal.profileId()).isEqualTo(PROFILE);
        var offered = personal.profileOptions().stream().filter(option -> PROFILE.equals(option.profileId())).findFirst().orElseThrow();
        assertThat(offered.assessments()).filteredOn(check -> check.goalId().equals(assessment)).singleElement()
                .satisfies(check -> assertThat(check.voluntary()).isTrue());
        assertThat(learners.resolveLearningPlanGoalIds(learnerId, physics, List.of(assessment))).containsExactly(assessment);
        String phasePractice = "424b07df-bf66-5d7f-99f5-f28b32ad1f22";
        assertThat(learners.resolveLearningPlanGoalIds(learnerId, physics, List.of(phasePractice))).doesNotContain(assessment);
        assertThat(learners.resolveLearningPlanGoalIds(learnerId, physics, List.of(phasePractice, assessment))).contains(assessment);
    }

    @ParameterizedTest
    @CsvSource({"G8,GK,true", "G9,GK,true", "G8,LK,true", "G9,LK,true",
            "G8,GK,false", "G9,GK,false", "G8,LK,false", "G9,LK,false"})
    void datedPlanUsesTheUnitOrderForASectionAndHonorsASeparateAtomicSelection(
            String duration, String course, boolean sectionOrder) throws Exception {
        String section = selectHessianMotionUnit(duration, "SekII", course);
        String child = section.replace(":structure:physics-e1-motion", ":structure:physics-e1-accelerated-and-free-fall");
        String physics = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
        String model = "e4b38061-1f28-43ad-8371-a3e7c0e81856";
        String measurement = "e0004439-ed34-5caf-858a-6107918224eb";
        completeHessianOpeningFixtures();
        learners.setPreferences(learnerId, null, false, false, null, true);
        var today = java.time.LocalDate.now(java.time.ZoneId.of("Europe/Berlin"));
        var monday = today.with(java.time.DayOfWeek.MONDAY);
        var roots = List.of(sectionOrder ? child : model);
        var targets = learners.resolveLearningPlanGoalIds(learnerId, physics, roots);
        var block = new LearnerLearningPlanApi.Block("ordinary", "learning", null, "Physik",
                monday, monday.plusDays(6), null, targets, roots, true);
        var plan = learningPlans.upsert(learnerId, physics,
                new LearnerLearningPlanApi.UpsertRequest(0L, "Regulärer Unterricht", List.of(block)), today);
        assertThat(plan.blocks().getFirst().focusGoalIds()).isEqualTo(roots);
        assertThat(plan.blocks().getFirst().unitAssignment()).isNull();
        String expected = sectionOrder ? measurement : model;
        assertThat(plan.nextEligibleGoal().goalId()).isEqualTo(expected);
        var result = learningPlans.switchPlan(learnerId, plan.planId(), new LearnerLearningPlanApi.ContinueRequest(
                plan.revision(), today));
        assertThat(result.activeGoalId()).isEqualTo(expected);
        assertThat(map(context(), "activeGoal")).containsEntry("id", expected);
        assertThat(learners.getMastery(learnerId)).doesNotContainKey(measurement);
    }

    @ParameterizedTest
    @CsvSource({"G8,GK", "G9,GK", "G8,LK", "G9,LK"})
    void ordinaryFreeFallRemainsDueAlongsideACompletedFourPartAssignment(String duration, String course) throws Exception {
        String section = selectHessianMotionUnit(duration, "SekII", course);
        String physics = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
        String freeFall = "09029573-864f-40ca-bf8a-cee7bf6dcb73";
        String child = section.replace(":structure:physics-e1-motion", ":structure:physics-e1-accelerated-and-free-fall");
        assertThat(learners.resolveLearningPlanGoalIds(learnerId, physics, List.of(child))).contains(freeFall);
        assertThat(learners.resolveLearningPlanGoalIds(learnerId, physics, List.of(section))).contains(freeFall);

        var parts = prepareUnitContinuation(section, 4, false);
        var assignment = learners.getUnitAssignmentOptions(learnerId, physics).stream()
                .filter(option -> section.equals(option.sectionGoalId())).findFirst().orElseThrow();
        assertThat(assignment.passed()).isTrue();
        assertThat(assignment.parts()).hasSize(4);
        assertThat(map(map(context(), "learningPlanToday"), "guidance")).containsEntry("state", "unitComplete");
        assertThat(assignment.voluntaryGoals()).extracting(LearnerLearningPlanApi.VoluntaryGoal::goalId).contains(freeFall);
        assertThat(examPasses.findForGoals(learnerId, parts)).hasSize(4);
        assertThat(learners.getUnitPlanningCredits(learnerId)).doesNotContainKey(freeFall);

        // Resume ordinary teaching with recorded prerequisites. No individual experiment has been assessed.
        learners.setPreferences(learnerId, null, false, true, null, false);
        var learner = learnerRepository.findById(learnerId).orElseThrow();
        var model = learners.getLearningPlanCompletionContext(learnerId);
        var prerequisites = new CompletionProfileCompiler().normalizePrerequisites(model.canonicalGoals());
        var recorded = new java.util.HashSet<>(prerequisites.transitivePrerequisites(freeFall));
        // Other passed assessments must not be the sole source of demand for this ordinary target.
        model.level2TargetGoalIds().stream().filter(id -> CompletionProfileCompiler.isAssessment(model.canonicalGoals().get(id)))
                .filter(id -> prerequisites.transitivePrerequisites(id).contains(freeFall))
                .filter(id -> !parts.contains(id)).forEach(recorded::add);
        recorded.add(MOTION_OPENING);
        recorded.add(FALL_OPENING);
        recorded.add("e0004439-ed34-5caf-858a-6107918224eb"); // Previously completed measurement protocol.
        masteryRepository.saveAllAndFlush(recorded.stream().map(id -> new Mastery(learner, id, 1.0)).toList());
        learners.setPlannedGoals(learnerId, java.util.Set.of(child));
        var ordinary = learners.getLearnerState(learnerId);
        assertThat(ordinary.levelCompletion().profileId()).isEqualTo(PROFILE);
        assertThat(ordinary.levelCompletion().waivedTargetGoalIds()).doesNotContain(freeFall);
        assertThat(ordinary.frontier()).extracting(com.skillpilot.backend.api.FrontierGoal::id).contains(freeFall);
        assertThat(learners.getFrontier(learnerId)).contains(freeFall);
        var today = java.time.LocalDate.now(java.time.ZoneId.of("Europe/Berlin"));
        var monday = today.with(java.time.DayOfWeek.MONDAY);
        var current = learningPlans.getPlan(learnerId, physics, today);
        var blocks = new java.util.ArrayList<>(current.blocks());
        blocks.add(new LearnerLearningPlanApi.Block("individual", "learning", freeFall, "Fallversuch",
                monday, monday.plusDays(6), null, List.of(freeFall), List.of(freeFall), true));
        var plan = learningPlans.upsert(learnerId, physics, new LearnerLearningPlanApi.UpsertRequest(
                current.revision(), "E.1", blocks), today);
        assertThat(plan.nextEligibleGoal().goalId()).isEqualTo(freeFall);
        assertThat(learners.getMastery(learnerId)).doesNotContainKey(freeFall);
    }

    @ParameterizedTest
    @CsvSource({"G8,GK,de", "G9,GK,de", "G8,LK,de", "G9,LK,de",
            "G8,GK,en", "G9,GK,en", "G8,LK,en", "G9,LK,en"})
    void coachOffersTheAuthoredExperimentInTheSessionLanguage(String duration, String course, String language) throws Exception {
        selectHessianMotionUnit(duration, "SekII", course);
        session = sessions.createFirstPartyLaunch(learnerId, new ClaudeV1CoachStartRequest(language, "web-start")).learningSessionId();
        authenticate();
        successful(ClaudeV1CompletionContractRegistry.TOOL_CONFIRM, Map.of("receiptCapability",
                map(context(), "completionContract").get("receiptCapability")));
        var material = mapper.readTree(java.nio.file.Path.of("../curricula/DE/Gymnasium/materials/physics/he-e1-motion-practice.json").toFile());
        var mastery = learners.getMastery(learnerId);
        for (String id : List.of("971beafa-6ba5-4c82-ac8b-7ebf66eec3dd", "09029573-864f-40ca-bf8a-cee7bf6dcb73")) {
            var expected = material.required("exercises").valueStream()
                    .filter(exercise -> id.equals(exercise.required("goalId").asText()))
                    .findFirst().orElseThrow().required(language);
            var learner = learnerRepository.findById(learnerId).orElseThrow();
            learner.setActiveGoalId(id);
            learner.setLearningState(LearningState.TEACHING);
            learnerRepository.saveAndFlush(learner);
            long before = version();
            var response = context();
            assertThat(map(response, "activeGoal")).containsEntry("id", id);
            var actual = mapper.valueToTree(map(response, "activeGoalContext")).required("practiceExercise");
            assertThat(actual.required("prompt")).isEqualTo(expected.required("prompt"));
            assertThat(actual.required("title")).isEqualTo(expected.required("title"));
            assertThat(actual.required("evidenceCriteria")).isEqualTo(expected.required("evidenceCriteria"));
            assertThat(actual.required("evidenceCriteria").size()).isPositive();
            assertThat(actual.has("solution")).isFalse();
            assertThat(version()).isEqualTo(before);
        }
        assertThat(learners.getMastery(learnerId)).isEqualTo(mastery);
    }

    @ParameterizedTest
    @ValueSource(strings = {"de", "en"})
    void optionalFreeFallSimulationUsesTheSelectedLanguageAndOnlyTheExperimentalGoal(String language) throws Exception {
        selectHessianMotionUnit("G9", "SekII", "GK");
        session = sessions.createFirstPartyLaunch(learnerId, new ClaudeV1CoachStartRequest(language, "web-start")).learningSessionId();
        authenticate();
        successful(ClaudeV1CompletionContractRegistry.TOOL_CONFIRM, Map.of("receiptCapability",
                map(context(), "completionContract").get("receiptCapability")));
        var learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setActiveGoalId("09029573-864f-40ca-bf8a-cee7bf6dcb73");
        learner.setLearningState(LearningState.TEACHING);
        learnerRepository.saveAndFlush(learner);

        var before = learners.getMastery(learnerId);
        var ordinary = context();
        assertThat(ordinary).doesNotContainKeys("additionalMaterials", "additionalMaterialsInstruction");
        var exercise = map(ordinary, "activeGoalContext").get("practiceExercise");
        assertThat(exercise).isNotNull();
        var selected = contentSelections.update(learnerId, 0L, List.of("enpasos-simufisica"));
        var withLink = context();
        var links = mapper.valueToTree(withLink.get("additionalMaterials"));
        assertThat(links.size()).isEqualTo(1);
        var link = links.required(0);
        assertThat(link.required("language").asText()).isEqualTo(language);
        assertThat(link.required("url").asText()).isEqualTo("https://simufisica.com/"
                + ("en".equals(language) ? "en/free-fall/" : "de/freier-fall/"));
        assertThat(link.required("sections").required(0).asText()).contains(
                "en".equals(language) ? "below the release point" : "unterhalb der Abwurfstelle");
        assertThat(link.required("provider").asText()).isEqualTo("SimuFísica");
        assertThat(link.required("aiUsage").asText()).isEqualTo("link-only");
        assertThat(map(withLink, "activeGoalContext")).containsEntry("practiceExercise", exercise);
        assertThat((String) withLink.get("additionalMaterialsInstruction")).contains("continue normal teaching if unused");
        learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setActiveGoalId("e4b38061-1f28-43ad-8371-a3e7c0e81856");
        learnerRepository.saveAndFlush(learner);
        assertThat(context()).doesNotContainKey("additionalMaterials");
        learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setActiveGoalId("09029573-864f-40ca-bf8a-cee7bf6dcb73");
        learnerRepository.saveAndFlush(learner);
        contentSelections.update(learnerId, selected.revision(), List.of());
        assertThat(context()).doesNotContainKey("additionalMaterials");
        assertThat(learners.getMastery(learnerId)).isEqualTo(before);
    }

    private String selectHessianMotionUnit(String duration, String stage) throws Exception {
        return selectHessianMotionUnit(duration, stage, "GK");
    }

    private String selectHessianMotionUnit(String duration, String stage, String course) throws Exception {
        learners.chooseLevelCompletion(learnerId, new LevelCompletionActionRequest("leaveProfile", PROFILE, null, null, version()));
        return configureHessianMotionUnit(duration, stage, course);
    }

    private String configureHessianMotionUnit(String duration, String stage, String course) throws Exception {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        Map<String, Object> scope = new java.util.HashMap<>(Map.of("selected", true, "filterId", "DE-HE", "stage", stage));
        if (duration != null) scope.put("durationModel", duration);
        learner.setPersonalCurriculum(mapper.writeValueAsString(Map.of(
                ROOT, scope,
                "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a", Map.of("selected", true, "filterId", course),
                "__skillpilot_stage_scope_sek1__", Map.of("selected", true),
                "__skillpilot_stage_scope_sek2__", Map.of("selected", true),
                "__skillpilotPersonalizationFlow", Map.of("rootLandscapeId", ROOT,
                        "completedOptionIds", List.of(), "migrationCompleted", true))));
        learner.setFollowLearningPlans(false);
        learner.setUseAssessmentShortcuts(false);
        learnerRepository.saveAndFlush(learner);
        var requested = new java.util.HashMap<>(Map.of("schoolForm", "Gymnasium", "jurisdiction", "DE-HE",
                "stage", stage, "courseProfile", course));
        if (duration != null) requested.put("durationModel", duration);
        String view = (String) compositionViews.findLearnerScopeView("7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a", requested).get("viewId");
        String unitFocus = "composition:" + view + ":structure:physics-e1-motion";
        learners.setPlannedGoals(learnerId, java.util.Set.of(unitFocus));
        return unitFocus;
    }

    @ParameterizedTest
    @CsvSource({"G8,CrossStage,GK", "G9,CrossStage,GK", "G8,SekII,GK", "G9,SekII,GK", "G8,SekII,LK", "G9,SekII,LK"})
    void hessianMotionAssessmentNeedsFourVersionedExamPassesAndKeepsIndividualGoalsOpen(String duration, String stage, String course) throws Exception {
        String section = selectHessianMotionUnit(duration, stage, course);
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
        assertThat(initial.individuallyOpenGoalIds()).hasSize(E1_CONTENT_GOALS);
        assertThat(initial.passed()).isFalse();
        var today = java.time.LocalDate.now(java.time.ZoneId.of("Europe/Berlin"));
        var monday = today.with(java.time.temporal.TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));
        String physics = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
        var atoms = learners.resolveLearningPlanGoalIds(learnerId, physics, List.of(section));
        var completionInputs = learners.getLearningPlanCompletionContext(learnerId);
        assertThat(completionInputs.canonicalGoals().get(MOTION_OPENING).getExtendedData())
                .containsEntry("skillpilotRequiredUnitEntry", true);
        assertThat(new CompletionProfileCompiler().compileAutomatic(completionInputs.canonicalGoals(),
                java.util.Set.copyOf(atoms), completionInputs.level2TargetGoalIds(), completionInputs.generation()).protectedGoalIds())
                .contains(MOTION_OPENING, FALL_OPENING);
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
            assertThat(unit.planningCreditGoalIds()).containsExactlyElementsOf(
                    passed.contains("f13ca187-b680-5f47-b4ad-76bd474bd8a2")
                            ? List.of("e4b38061-1f28-43ad-8371-a3e7c0e81856") : List.of());
            assertThat(unit.individuallyOpenGoalIds()).isEqualTo(initial.individuallyOpenGoalIds());
            assertThat(masteryRepository.findByLearner_SkillpilotId(learnerId)).extracting(Mastery::getGoalKey)
                    .containsExactlyInAnyOrderElementsOf(passed);
            assertThat(completion.complete()).isEqualTo(allPassed);
            assertThat(completion.requiredAssessmentCount()).isEqualTo(4);
            assertThat(completion.assessments()).filteredOn(item -> Boolean.TRUE.equals(item.voluntary()))
                    .allMatch(LevelCompletionResponse.Assessment::startAvailable)
                    .extracting(LevelCompletionResponse.Assessment::goalId)
                    .containsExactlyInAnyOrderElementsOf(hessianVoluntaryAssessmentIds(course));
            assertThat(completion.masteredAssessmentCount()).isEqualTo(passed.size());
            var updated = context();
            var compact = mapper.valueToTree(map(map(updated, "levelCompletion"), "unitAssessment"));
            assertThat(compact.path("passed").asBoolean()).isEqualTo(allPassed);
            assertThat(compact.path("parts").size()).isEqualTo(parts.size());
            assertThat(compact.path("creditedForPlanningCount").asInt()).isEqualTo(unit.planningCreditGoalIds().size());
            assertThat(compact.path("individuallyOpenCount").asInt()).isEqualTo(E1_CONTENT_GOALS);
            successful(ClaudeV1McpContractAdapter.TOOL_CHOOSE_COMPLETION_ROUTE,
                    writeArgs("return" + part.goalId(), version(), Map.of("choice", choice(updated, "Zur normalen Lernansicht"))));
        }
        var afterPlan = learningPlans.getPlan(learnerId, physics, today);
        assertThat(afterPlan.blocks()).isEqualTo(beforePlan.blocks());
        assertThat(afterPlan.nextEligibleGoal()).isNotNull();
        assertThat(learningPlans.getTodayStatus(learnerId, "de").subjects().getFirst().periodGauge().completed())
                .as("Four proven assessments and the single reviewed BES planning credit").isEqualTo(5);
    }

    @ParameterizedTest
    @ValueSource(strings = {"G8", "G9"})
    void hessianChildEvidenceEnablesOnlyItsOwnPrerequisitesAndKeepsBothIndividualRoutes(String duration) throws Exception {
        String section = selectHessianMotionUnit(duration, "SekII");
        completeHessianOpeningFixtures();
        String physics = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
        String acceleration = "e4b38061-1f28-43ad-8371-a3e7c0e81856";
        String motionLaws = "262f807a-30d0-503e-986f-856cbd048e8e";
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
        assertThat(learners.getUnitPlanningCredits(learnerId)).containsOnlyKeys(acceleration);
        // C remains an independently required assignment part; it adds no planning credit.
        passHessianAssessment(section, c, 17);
        assertThat(learners.getUnitPlanningCredits(learnerId)).containsOnlyKeys(acceleration);
        var unit = learners.getLearnerState(learnerId).levelCompletion().unitAssessment();
        assertThat(unit.passed()).isFalse();
        assertThat(unit.parts()).filteredOn(UnitAssessmentResponse.Part::passed)
                .extracting(UnitAssessmentResponse.Part::goalId).containsExactlyInAnyOrder(c, d);
        assertThat(unit.individuallyOpenGoalIds()).hasSize(E1_CONTENT_GOALS);
        assertThat(learners.getUncompactedRichFrontierForFocus(learnerId, List.of(freeFall)))
                .extracting(com.skillpilot.backend.api.FrontierGoal::id).doesNotContain(freeFall);

        // These other foundations are explicit test fixtures, not inferred from either unit pass.
        var foundations = new java.util.LinkedHashSet<>(new CompletionProfileCompiler()
                .normalizePrerequisites(graph).transitivePrerequisites(freeFall));
        foundations.remove(acceleration);
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
        var fallPrerequisites = mapper.valueToTree(map(context(), "activeGoalContext")).path("prerequisites");
        assertThat(fallPrerequisites).anySatisfy(prerequisite -> {
            assertThat(prerequisite.path("title").asText()).isEqualTo(graph.get(motionLaws).getTitle());
            assertThat(prerequisite.path("recorded").asBoolean()).isTrue();
            assertThat(prerequisite.path("planningCredit").asBoolean()).isFalse();
        });
        // LAWS is already an explicit individual result in this fixture. Inspect its direct
        // context edge using a stored active-goal fixture; the strict frontier is tested below.
        var inspection = learnerRepository.findById(learnerId).orElseThrow();
        inspection.setActiveGoalId(motionLaws);
        inspection.setLearningState(LearningState.TEACHING);
        learnerRepository.saveAndFlush(inspection);
        var lawsContext = learners.getCoachActiveGoalContext(learnerId, motionLaws, version(), "de", java.util.Set.of(), false);
        assertThat(lawsContext.prerequisites()).anySatisfy(prerequisite -> {
            assertThat(prerequisite.goalId()).isEqualTo(acceleration);
            assertThat(prerequisite.recorded()).isFalse();
            assertThat(prerequisite.planningCredit()).isTrue();
        });
        learners.setActiveGoal(learnerId, freeFall);

        // The full E.1 route keeps A/B and both additional assessments open; BES practice is voluntary.
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
        assertThat(learners.getUnitPlanningCredits(learnerId)).containsOnlyKeys(acceleration);
        assertThat(learners.getUncompactedRichFrontierForFocus(learnerId, List.of(projectile)))
                .extracting(com.skillpilot.backend.api.FrontierGoal::id).doesNotContain(projectile);
        assertThat(masteryRepository.findByLearner_SkillpilotId(learnerId)).extracting(Mastery::getGoalKey)
                .containsExactlyInAnyOrderElementsOf(java.util.stream.Stream.concat(foundations.stream(),
                        java.util.stream.Stream.of(c, d, MOTION_OPENING, FALL_OPENING)).toList());
        assertCurrentHessianBindingsFailClosed(section, c, d, freeFall, graph);
    }

    private void assertCurrentHessianBindingsFailClosed(String section, String c, String d, String freeFall,
            Map<String, com.skillpilot.backend.landscape.LearningGoal> graph) {
        learners.setPlannedGoals(learnerId, java.util.Set.of(section));
        var history = examPasses.findForGoals(learnerId, List.of(c, d));
        var unrelatedC = landscapeDefinitions.getGoalDefinition(c).getExamData();
        String originalC = unrelatedC.getTaskContent();
        try {
            unrelatedC.setTaskContent(originalC + "\nEine andere aktuelle Aufgabenfassung C.");
            assertThat(learners.getUnitPlanningCredits(learnerId))
                    .containsOnlyKeys("e4b38061-1f28-43ad-8371-a3e7c0e81856");
            var changed = learners.getLearnerState(learnerId).levelCompletion().unitAssessment();
            assertThat(changed.parts()).filteredOn(part -> c.equals(part.goalId())).singleElement()
                    .satisfies(part -> { assertThat(part.materialCurrent()).isFalse(); assertThat(part.passed()).isFalse(); });
            assertThat(changed.parts()).filteredOn(part -> d.equals(part.goalId())).singleElement()
                    .satisfies(part -> assertThat(part.passed()).isTrue());
        } finally { unrelatedC.setTaskContent(originalC); }
        var currentExam = landscapeDefinitions.getGoalDefinition(d).getExamData();
        String originalTask = currentExam.getTaskContent();
        try {
            currentExam.setTaskContent(originalTask + "\nEine andere aktuelle Aufgabenfassung.");
            assertThat(learners.getUnitPlanningCredits(learnerId)).isEmpty();
            var changed = learners.getLearnerState(learnerId).levelCompletion();
            assertThat(changed.unitAssessment().planningCreditGoalIds()).isEmpty();
            assertThat(changed.unitAssessment().parts()).filteredOn(part -> d.equals(part.goalId())).singleElement()
                    .satisfies(part -> { assertThat(part.materialCurrent()).isFalse(); assertThat(part.passed()).isFalse(); });
            assertThat(changed.profileOptions()).filteredOn(option -> ("automatic:" + section).equals(option.profileId()))
                    .singleElement().satisfies(option -> {
                        assertThat(option.requiredAssessmentCount()).isEqualTo(6);
                        assertThat(option.assessments()).extracting(LevelCompletionResponse.Assessment::goalId)
                                .containsExactlyInAnyOrder("ee7d5f3d-858f-59d6-89b0-e5a7f437f458",
                                        "39f52dcb-ff1d-5cad-9ccb-30da803cfa85", c, d, WURF_EXTRA, FREE_FALL_SERIES_EXTRA);
                        assertThat(option.assessments()).allMatch(item -> item.voluntary() == null);
                    });
            assertThat(changed.profileOptions()).filteredOn(option -> ("automatic:" + section).equals(option.profileId()))
                    .singleElement().satisfies(option -> assertThat(option.assessments()).filteredOn(part -> d.equals(part.goalId()))
                        .singleElement().satisfies(part -> {
                            assertThat(part.startAvailable()).isFalse();
                            assertThat(part.unavailableReason()).isEqualTo("assessment_material_changed");
                        }));
            long before = version();
            assertThatThrownBy(() -> sessions.createFirstPartyLaunch(learnerId, new ClaudeV1CoachStartRequest("de", "web-start",
                    new CompletionAssessmentStart("automatic:" + section, d, before))))
                    .isInstanceOf(org.springframework.web.server.ResponseStatusException.class).hasMessageContaining("409");
            assertThat(version()).isEqualTo(before);
        } finally { currentExam.setTaskContent(originalTask); }
        assertThat(examPasses.findForGoals(learnerId, List.of(c, d))).isEqualTo(history);
        assertThat(learners.getUnitPlanningCredits(learnerId)).hasSize(1);

        // FF now directly requires LAWS. Its explicit individual LAWS fixture must not be
        // mistaken for a BES credit. Temporarily reopen LAWS to inspect the actual credit edge.
        String motionLaws = "262f807a-30d0-503e-986f-856cbd048e8e";
        assertThat(graph.get(motionLaws).getRequires()).contains("e4b38061-1f28-43ad-8371-a3e7c0e81856");
        var recordedLaws = masteryRepository.findByLearner_SkillpilotId(learnerId).stream()
                .filter(result -> motionLaws.equals(result.getGoalKey())).findFirst().orElseThrow();
        masteryRepository.delete(recordedLaws);
        masteryRepository.flush();
        try {
            learners.setPlannedGoals(learnerId, java.util.Set.of(motionLaws));
            learners.setActiveGoal(learnerId, motionLaws);
            assertThat(learners.getUncompactedRichFrontierForFocus(learnerId, List.of(motionLaws)))
                    .extracting(com.skillpilot.backend.api.FrontierGoal::id).contains(motionLaws);
            Object application = org.springframework.test.util.ReflectionTestUtils.getField(learners, "completionApplicationService");
            Object catalog = org.springframework.test.util.ReflectionTestUtils.invokeMethod(application, "catalog");
            for (String disabledFlag : List.of("enabled", "available", "unitAssessmentPilotEnabled")) {
                Object owner = disabledFlag.equals("unitAssessmentPilotEnabled") ? learners : catalog;
                boolean original = (boolean) org.springframework.test.util.ReflectionTestUtils.getField(owner, disabledFlag);
                try {
                    org.springframework.test.util.ReflectionTestUtils.setField(owner, disabledFlag, false);
                    assertThat(learners.getUnitPlanningCredits(learnerId)).isEmpty();
                    assertThat(learners.getUncompactedRichFrontierForFocus(learnerId, List.of(motionLaws)))
                            .extracting(com.skillpilot.backend.api.FrontierGoal::id).doesNotContain(motionLaws);
                    var detail = learners.getCoachActiveGoalContext(learnerId, motionLaws, version(), "de", java.util.Set.of(), false);
                    assertThat(detail.prerequisites()).noneMatch(com.skillpilot.backend.api.ActiveGoalContext.Prerequisite::planningCredit);
                } finally { org.springframework.test.util.ReflectionTestUtils.setField(owner, disabledFlag, original); }
            }
            assertThat(learners.getUnitPlanningCredits(learnerId)).hasSize(1);
        } finally {
            var learner = learnerRepository.findById(learnerId).orElseThrow();
            masteryRepository.saveAndFlush(new Mastery(learner, motionLaws, 1.0));
            learners.setPlannedGoals(learnerId, java.util.Set.of(freeFall));
            learners.setActiveGoal(learnerId, freeFall);
        }
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
        org.springframework.test.util.ReflectionTestUtils.setField(learners, "unitAssessmentPilotEnabled", false);
        try {
            assertThat(learners.getLearnerState(learnerId).levelCompletion().unitAssessment()).isNull();
            assertThat(learners.getUnitPlanningCredits(learnerId)).isEmpty();
            session = sessions.createFirstPartyLaunch(learnerId, new ClaudeV1CoachStartRequest("de", "web-start",
                    new CompletionAssessmentStart("automatic:" + section, d, version()))).learningSessionId();
            historicalSession = session;
            authenticate();
            var pending = context();
            if (pending.containsKey("completionContract")) successful(ClaudeV1CompletionContractRegistry.TOOL_CONFIRM,
                    Map.of("receiptCapability", map(pending, "completionContract").get("receiptCapability")));
            var evaluation = successful(ClaudeV1Contract.TOOL_GET_EXAM_EVALUATION, Map.of("goalId", d));
            gradeArguments = writeArgs("historical-unbound-" + duration, version(),
                    Map.of("goalId", d, "earnedPoints", 17, "evaluationCapability", evaluation.get("evaluationCapability")));
            firstResult = successful(ClaudeV1Contract.TOOL_SET_MASTERY, gradeArguments);
        } finally { org.springframework.test.util.ReflectionTestUtils.setField(learners, "unitAssessmentPilotEnabled", true); }
        var historical = examPasses.findForGoal(learnerId, d);
        assertThat(historical).singleElement().satisfies(pass -> assertThat(pass.planningCreditBindingIds()).isEmpty());
        // Same revision: a valid exact replay must return its original result without adding the newly active grant.
        assertThat(successful(ClaudeV1Contract.TOOL_SET_MASTERY, gradeArguments)).isEqualTo(firstResult);
        assertThat(examPasses.findForGoal(learnerId, d)).isEqualTo(historical);
        successful(ClaudeV1McpContractAdapter.TOOL_CHOOSE_COMPLETION_ROUTE,
                writeArgs("historical-return-" + duration, version(),
                        Map.of("choice", choice(context(), "Zur normalen Lernansicht"))));
        passHessianAssessment(section, c, 17);
        var unit = learners.getLearnerState(learnerId).levelCompletion().unitAssessment();
        assertThat(unit.parts()).filteredOn(UnitAssessmentResponse.Part::passed)
                .extracting(UnitAssessmentResponse.Part::goalId).containsExactlyInAnyOrder(c, d);
        assertThat(unit.planningCreditGoalIds()).isEmpty();
        assertThat(learners.getUnitPlanningCredits(learnerId)).isEmpty();
        assertThat(unit.parts()).filteredOn(UnitAssessmentResponse.Part::missingPlanningCreditBinding)
                .extracting(UnitAssessmentResponse.Part::goalId).containsExactly(d);
        session = historicalSession;
        authenticate();
        // Later writes invalidate presentation replays; they still must not re-enter the grading body.
        var stale = call(ClaudeV1Contract.TOOL_SET_MASTERY, gradeArguments);
        assertThat(stale.isError()).isTrue();
        assertThat(mapper.readTree(((McpSchema.TextContent) stale.content().getFirst()).text()).path("errorCode").asText())
                .isEqualTo("STALE_STATE");
        assertThat(examPasses.findForGoal(learnerId, d)).isEqualTo(historical);
        assertThat(learners.getUnitPlanningCredits(learnerId)).isEmpty();
        assertThat(masteryRepository.findByLearner_SkillpilotId(learnerId)).extracting(Mastery::getGoalKey)
                .containsExactlyInAnyOrder(c, d);
    }

    @ParameterizedTest
    @CsvSource({"GK,G8", "LK,G9"})
    void changingFromAnUnreleasedViewPreservesBothPartPassesAndExplainsTheMissingCredit(String course, String duration) throws Exception {
        learners.chooseLevelCompletion(learnerId, new LevelCompletionActionRequest("leaveProfile", PROFILE, null, null, version()));
        String neutralSection = configureHessianMotionUnit(null, "CrossStage", course);
        String c = "c933b7d2-edcb-5747-9378-9762659f260a";
        String d = "f13ca187-b680-5f47-b4ad-76bd474bd8a2";
        assertThat(learners.getLearnerState(learnerId).levelCompletion().unitAssessment()).isNull();
        passHessianAssessment(neutralSection, c, 17);
        passHessianAssessment(neutralSection, d, 17);
        var saved = examPasses.findForGoals(learnerId, List.of(c, d));
        assertThat(saved).hasSize(2);
        saved.values().forEach(receipts -> assertThat(receipts).singleElement().satisfies(receipt ->
                assertThat(receipt.planningCreditBindingIds()).isEmpty()));

        String section = configureHessianMotionUnit(duration, "CrossStage", course);
        var state = learners.getLearnerState(learnerId).levelCompletion();
        var unit = state.unitAssessment();
        assertThat(unit.parts()).filteredOn(UnitAssessmentResponse.Part::passed)
                .extracting(UnitAssessmentResponse.Part::goalId).containsExactlyInAnyOrder(c, d);
        assertThat(unit.parts()).filteredOn(UnitAssessmentResponse.Part::missingPlanningCreditBinding)
                .extracting(UnitAssessmentResponse.Part::goalId).containsExactly(d);
        assertThat(unit.planningCreditGoalIds()).isEmpty();
        var option = state.profileOptions().stream().filter(item -> item.profileId().equals("automatic:" + section)).findFirst().orElseThrow();
        assertThat(option.assessments()).filteredOn(item -> List.of(c, d).contains(item.goalId()))
                .hasSize(2).allMatch(item -> item.mastered() && !item.startAvailable());
        assertThat(examPasses.findForGoals(learnerId, List.of(c, d))).isEqualTo(saved);
    }

    @ParameterizedTest
    @CsvSource({"G8,false", "G9,true"})
    void twoChildPassesOfferIndividualStudyWithTheActualOutstandingPrerequisites(String duration, boolean strict) throws Exception {
        String section = selectHessianMotionUnit(duration, "SekII");
        completeHessianOpeningFixtures();
        String acceleration = "e4b38061-1f28-43ad-8371-a3e7c0e81856";
        String c = "c933b7d2-edcb-5747-9378-9762659f260a";
        String d = "f13ca187-b680-5f47-b4ad-76bd474bd8a2";
        learners.setPreferences(learnerId, null, false, strict);
        passHessianAssessment(section, c, 17);
        passHessianAssessment(section, d, 17);
        var state = learners.chooseLevelCompletion(learnerId, new LevelCompletionActionRequest(
                "selectProfile", "automatic:" + section, null, null, version()));
        var graph = learners.getLearningPlanCompletionContext(learnerId).canonicalGoals();
        var expected = new CompletionProfileCompiler().normalizePrerequisites(graph).transitivePrerequisites(acceleration);
        var action = state.levelCompletion().actions().stream().filter(item -> "focusPractice".equals(item.action())
                && acceleration.equals(item.goalId())).findFirst().orElseThrow();
        assertThat(action.practice().openPrerequisites()).extracting(item -> item.goalId()).containsExactlyInAnyOrderElementsOf(expected);
        assertThat(expected).isNotEmpty();
        assertThat(state.levelCompletion().actions()).filteredOn(item -> "required".equals(item.intent()))
                .noneMatch(item -> acceleration.equals(item.goalId()));
        assertThat(learners.getFrontier(learnerId)).doesNotContain(acceleration);
        assertThat(state.levelCompletion().unitAssessment().individuallyOpenGoalIds()).hasSize(E1_CONTENT_GOALS);
        if (strict) {
            var preparationFocus = new java.util.ArrayList<>(expected);
            preparationFocus.add(acceleration);
            String closest = "71cec9fb-3751-4d61-8b34-c5adbbf6e5f2";
            assertThat(learners.getUncompactedRichFrontierForFocus(learnerId, preparationFocus))
                    .extracting(com.skillpilot.backend.api.FrontierGoal::id).containsExactlyInAnyOrder(closest,
                            "65365dce-f33f-49d8-9516-42f75883aa86");
            assertThat(action.practice().startGoalId()).as("Shortest eligible prerequisite path (3 instead of 5)").isEqualTo(closest);
            assertThatThrownBy(() -> learners.setActiveGoal(learnerId, acceleration))
                    .isInstanceOf(org.springframework.web.server.ResponseStatusException.class);
        } else assertThat(action.practice().startGoalId()).isEqualTo(acceleration);
        assertThatThrownBy(() -> learners.chooseLevelCompletion(learnerId, new LevelCompletionActionRequest(
                "focusPractice", "automatic:" + section, c, "voluntary", version())))
                .isInstanceOf(org.springframework.web.server.ResponseStatusException.class);
        session = sessions.createFirstPartyLaunch(learnerId, new ClaudeV1CoachStartRequest("de", "web-start")).learningSessionId();
        authenticate();
        var pending = context();
        if (pending.containsKey("completionContract")) successful(ClaudeV1CompletionContractRegistry.TOOL_CONFIRM,
                Map.of("receiptCapability", map(pending, "completionContract").get("receiptCapability")));
        String selection = choice(context(), action.title().get("de"));
        var result = successful(ClaudeV1McpContractAdapter.TOOL_CHOOSE_COMPLETION_ROUTE,
                writeArgs("select-individual-work", version(), Map.of("choice", selection)));
        assertThat(map(map(result, "context"), "activeGoal")).containsEntry("id", action.practice().startGoalId());
        assertThat(learners.getPlannedGoals(learnerId)).contains(acceleration);
        assertThat(learnerRepository.findById(learnerId).orElseThrow().getStrictMode()).isEqualTo(strict);
        assertThat(masteryRepository.findByLearner_SkillpilotId(learnerId)).extracting(Mastery::getGoalKey)
                .containsExactlyInAnyOrder(c, d, MOTION_OPENING, FALL_OPENING);
        if (!strict) {
            successful(ClaudeV1Contract.TOOL_SET_MASTERY, writeArgs("individual-outcome", version(), Map.of("goalId", acceleration)));
            assertThat(masteryRepository.findByLearner_SkillpilotId(learnerId)).extracting(Mastery::getGoalKey)
                    .containsExactlyInAnyOrder(c, d, acceleration, MOTION_OPENING, FALL_OPENING);
        }
    }

    @ParameterizedTest
    @ValueSource(strings = {"G8", "G9"})
    void explicitUnitAssignmentCountsOnlyCurrentPartsAndPreservesOtherOrders(String duration) throws Exception {
        String section = selectHessianMotionUnit(duration);
        String physics = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
        var day = java.time.LocalDate.now(java.time.ZoneId.of("Europe/Berlin"));
        var monday = day.with(java.time.temporal.TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));
        var option = learners.getUnitAssignmentOptions(learnerId, physics).stream()
                .filter(item -> item.sectionGoalId().equals(section)).findFirst().orElseThrow();
        var ids = option.parts().stream().map(LearnerLearningPlanApi.UnitAssignmentPart::goalId).toList();
        var block = new LearnerLearningPlanApi.Block("unit", "learning", section, "E.1", monday, monday.plusDays(4),
                null, ids, List.of(section), true, option.binding());
        var learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setFollowLearningPlans(true);
        learnerRepository.saveAndFlush(learner);
        // The same four IDs in a conventional schedule never imply a representative unit order.
        var legacy = new LearnerLearningPlanApi.Block("unit", "learning", section, "E.1", monday, monday.plusDays(4),
                null, ids, List.of(section), true);
        var previous = learningPlans.upsert(learnerId, physics, new LearnerLearningPlanApi.UpsertRequest(0L, "E.1", List.of(legacy)), day);
        assertThat(learningPlans.getTodayStatus(learnerId, "de").subjects().getFirst().unitAssignments()).isEmpty();
        var incomplete = new LearnerLearningPlanApi.Block("invalid", "learning", section, "E.1", monday, monday.plusDays(4),
                null, ids.subList(0, 3), List.of(section), true, option.binding());
        assertThatThrownBy(() -> learningPlans.upsert(learnerId, physics,
                new LearnerLearningPlanApi.UpsertRequest(previous.revision(), "E.1", List.of(incomplete)), day))
                .isInstanceOf(org.springframework.web.server.ResponseStatusException.class);
        var plan = learningPlans.upsert(learnerId, physics, new LearnerLearningPlanApi.UpsertRequest(
                previous.revision(), "E.1", List.of(block)), day);
        assertThat(plan.nextEligibleGoal().goalId()).isEqualTo(ids.getFirst());
        assertThat(plan.canContinue()).isFalse();
        assertThat(plan.continueReason()).isEqualTo("unit-assessment-choice-required");
        assertThatThrownBy(() -> learningPlans.continuePlan(learnerId, plan.planId(),
                new LearnerLearningPlanApi.ContinueRequest(plan.revision(), day))).isInstanceOf(org.springframework.web.server.ResponseStatusException.class);

        learners.setPlannedGoals(learnerId, java.util.Set.of("5c44b9ba-9b05-4774-95d5-073230d3fc4f"));
        var activated = learningPlans.activatePlans(learnerId, new LearnerLearningPlanApi.ActivateRequest(day, List.of(
                new LearnerLearningPlanApi.ActivationPlan(physics, plan.revision(), "E.1", plan.blocks()))));
        assertThat(activated.selectedPlanId()).isEqualTo(plan.planId());
        assertThat(activated.focusGoalId()).isEqualTo(section);
        assertThat(activated.activeGoalId()).isNull();
        assertThat(activated.plans().getFirst().nextEligibleGoal().goalId()).isEqualTo(ids.getFirst());
        assertThat(activated.state().levelCompletion().directAssessmentRunning()).isFalse();
        var points = List.of(14, 15, 17, 17);
        for (int index : List.of(2, 3, 0, 1)) {
            passHessianAssessment(section, ids.get(index), points.get(index));
            if (index == 3) {
                assertThat(learningPlans.getTodayStatus(learnerId, "de").subjects().getFirst().unitAssignments())
                        .singleElement().satisfies(item -> {
                            assertThat(item.status()).isEqualTo("active");
                            assertThat(item.passedParts()).isEqualTo(2);
                            assertThat(item.requiredParts()).isEqualTo(4);
                        });
                assertThat(learningPlans.getPlan(learnerId, physics, day).nextEligibleGoal().goalId()).isEqualTo(ids.getFirst());
            }
        }
        var complete = learningPlans.getPlan(learnerId, physics, day);
        assertThat(complete.nextEligibleGoal()).isNull();
        assertThat(complete.continueReason()).isEqualTo("unit-assignment-completed");
        assertThat(learningPlans.getTodayStatus(learnerId, "de").subjects().getFirst().unitAssignments())
                .singleElement().satisfies(item -> {
                    assertThat(item.status()).isEqualTo("completed");
                    assertThat(item.passedParts()).isEqualTo(4);
                });
        assertThat(learners.getLearnerState(learnerId).levelCompletion().unitAssessment().individuallyOpenGoalIds()).hasSize(E1_CONTENT_GOALS);
        assertThat(masteryRepository.findByLearner_SkillpilotId(learnerId)).extracting(Mastery::getGoalKey)
                .containsExactlyInAnyOrderElementsOf(ids);

        String extra = learners.getPersonalCurriculumSubjectFrontier(learnerId, physics).stream()
                .filter(goal -> "atomic".equals(goal.type()) && !ids.contains(goal.id())).findFirst().orElseThrow().id();
        String acceleration = "e4b38061-1f28-43ad-8371-a3e7c0e81856";
        var milestone = new LearnerLearningPlanApi.Block("proof", "milestone", acceleration, "Eigener Nachweis",
                null, null, monday.plusDays(4), null, List.of(acceleration), true);
        var independentProof = learningPlans.upsert(learnerId, physics, new LearnerLearningPlanApi.UpsertRequest(
                complete.revision(), "E.1 und Einzelprüfung", List.of(block, milestone)), day);
        assertThat(independentProof.continueReason()).isNotEqualTo("unit-assignment-completed");
        assertThat(independentProof.learningScope().goalIds()).containsExactly(acceleration);
        assertThat(independentProof.learningScope().achievedGoalCount()).isZero();

        var independent = new LearnerLearningPlanApi.Block("extra", "learning", extra, "Einzelauftrag", monday,
                monday.plusDays(4), null, List.of(extra), List.of(extra), true);
        var mixed = learningPlans.upsert(learnerId, physics, new LearnerLearningPlanApi.UpsertRequest(
                independentProof.revision(), "E.1 und Einzelauftrag", List.of(block, independent)), day);
        assertThat(mixed.nextEligibleGoal().goalId()).isEqualTo(extra);
        assertThat(mixed.canContinue()).isTrue();
        var subject = learningPlans.getTodayStatus(learnerId, "de").subjects().getFirst();
        assertThat(subject.unitAssignments().getFirst().status()).isEqualTo("completed");
        assertThat(subject.canContinue()).isTrue();
        assertThat(individualPracticeGoalIds()).contains("09029573-864f-40ca-bf8a-cee7bf6dcb73", "971beafa-6ba5-4c82-ac8b-7ebf66eec3dd");

        var priorPasses = examPasses.findForGoals(learnerId, ids);
        var currentA = landscapeDefinitions.getGoalDefinition(ids.getFirst()).getExamData();
        String originalTask = currentA.getTaskContent();
        try {
            currentA.setTaskContent(originalTask + "\nNeue Aufgabe A.");
            var changed = learningPlans.getTodayStatus(learnerId, "de").subjects().getFirst();
            assertThat(changed.unitAssignments().getFirst().status()).isEqualTo("unavailable");
            assertThat(changed.unitAssignments().getFirst().passedParts()).isNull();
            assertThat(learningPlans.getPlan(learnerId, physics, day).nextEligibleGoal().goalId()).isEqualTo(extra);
            assertThat(individualPracticeGoalIds()).containsOnly("e4b38061-1f28-43ad-8371-a3e7c0e81856");
            assertThat(learners.getUnitPlanningCredits(learnerId)).hasSize(1);
            assertThat(examPasses.findForGoals(learnerId, ids)).isEqualTo(priorPasses);
        } finally {
            currentA.setTaskContent(originalTask);
        }

        org.springframework.test.util.ReflectionTestUtils.setField(learners, "unitAssessmentPilotEnabled", false);
        try {
            assertThat(learners.getUnitAssignmentOptions(learnerId, physics)).isEmpty();
            assertThat(individualPracticeGoalIds()).isEmpty();
            var off = learningPlans.getTodayStatus(learnerId, "de").subjects().getFirst();
            assertThat(off.unitAssignments().getFirst().status()).isEqualTo("unavailable");
            assertThat(off.unitAssignments().getFirst().passedParts()).isNull();
            assertThat(learningPlans.getPlan(learnerId, physics, day).nextEligibleGoal().goalId()).isEqualTo(extra);
        } finally {
            org.springframework.test.util.ReflectionTestUtils.setField(learners, "unitAssessmentPilotEnabled", true);
        }

        // A separate individual order still requires its own result even for an R2-credited atom.
        learners.setPreferences(learnerId, null, false, false);
        var individual = new LearnerLearningPlanApi.Block("individual", "learning", acceleration, "Beschleunigung",
                monday, monday.plusDays(4), null, List.of(acceleration), List.of(acceleration), true);
        var chosen = learningPlans.upsert(learnerId, physics, new LearnerLearningPlanApi.UpsertRequest(
                mixed.revision(), "E.1 und Beschleunigung", List.of(block, individual)), day);
        assertThat(chosen.nextEligibleGoal().goalId()).isEqualTo(MOTION_OPENING);
        assertThat(chosen.canContinue()).isTrue();
        assertThat(learningPlans.getTodayStatus(learnerId, "de").subjects().getFirst().learningScope().achievedGoalCount()).isZero();
        var backToUnit = learningPlans.upsert(learnerId, physics, new LearnerLearningPlanApi.UpsertRequest(
                chosen.revision(), "Nur E.1", List.of(block)), day);
        assertThat(backToUnit.continueReason()).isEqualTo("unit-assignment-completed");
        learners.setPlannedGoals(learnerId, java.util.Set.of(section));
        var route = learners.chooseLevelCompletion(learnerId, new LevelCompletionActionRequest(
                "selectProfile", "automatic:" + section, null, null, version()));
        assertThat(route.levelCompletion().masteredAssessmentCount()).isEqualTo(4);
        assertThat(route.levelCompletion().requiredAssessmentCount()).isEqualTo(4);
        assertThat(route.levelCompletion().actions()).filteredOn(item -> item.practice() != null).extracting(item -> item.goalId())
                .containsExactlyInAnyOrderElementsOf(route.levelCompletion().unitAssessment().individuallyOpenGoalIds());
        var voluntary = route.levelCompletion().actions().stream().filter(item ->
                "voluntary".equals(item.intent()) && acceleration.equals(item.goalId())).findFirst().orElseThrow();
        var started = learners.chooseLevelCompletion(learnerId, new LevelCompletionActionRequest(
                voluntary.action(), "automatic:" + section, acceleration, "voluntary", version()));
        assertThat(started.activeGoal().id()).isEqualTo(MOTION_OPENING);
        assertThat(learners.getLearner(learnerId).getPendingUnitEntry()).contains(acceleration);
        assertThat(masteryRepository.findByLearner_SkillpilotId(learnerId)).extracting(Mastery::getGoalKey)
                .containsExactlyInAnyOrderElementsOf(ids);
    }

    @ParameterizedTest(name = "{0}, {1} part passes, separate order = {2}")
    @CsvSource({"G8,0,false", "G8,2,false", "G8,4,false", "G8,0,true", "G8,2,true", "G8,4,true",
                "G9,0,false", "G9,2,false", "G9,4,false", "G9,0,true", "G9,2,true", "G9,4,true"})
    void genericResumeHonorsTheChosenUnitAndAnySeparatelyDueOrder(
            String duration, int passedParts, boolean separateOrder) throws Exception {
        String section = selectHessianMotionUnit(duration, "SekII");
        var parts = prepareUnitContinuation(section, passedParts, separateOrder);
        String diagrams = "ae67bcf1-f3ee-50d6-9a12-25a159dff659";
        var before = context();
        assertThat(before.get("activeGoal")).isNull();
        var today = map(before, "learningPlanToday");
        assertThat(today).containsEntry("resumeAvailable", separateOrder);
        var subject = ((List<?>) today.get("subjects")).stream().map(Map.class::cast)
                .filter(item -> item.containsKey("unitAssignments")).findFirst().orElseThrow();
        var assignment = (Map<?, ?>) ((List<?>) subject.get("unitAssignments")).getFirst();
        if (passedParts == 4) {
            assertThat((List<?>) assignment.get("voluntaryGoalTitles")).isNotEmpty();
            assertThat(assignment.get("voluntaryGoalTitles").toString())
                    // E.1 cut (23 Nov 2026): the modelling goal is narrowed and renamed.
                    .contains("Idealisierungen und Grenzen von Bewegungsmodellen")
                    .doesNotContain("Bewegungen mit Weg-Zeit-Diagrammen beschreiben");
        } else {
            assertThat(assignment.containsKey("voluntaryGoalTitles")).isFalse();
        }
        var currentVersion = version();
        var args = writeArgs("resume-explicit-unit", currentVersion, Map.of());
        if (separateOrder) {
            var result = successful(ClaudeV1Contract.TOOL_RESUME_LEARNING_PLAN, args);
            assertThat(map(map(result, "context"), "activeGoal")).containsEntry("id", MOTION_OPENING);
            assertThat(learners.getLearner(learnerId).getActiveGoalId()).isEqualTo(MOTION_OPENING);
            assertThat(learners.getLearner(learnerId).getPendingUnitEntry()).contains(diagrams);
        } else {
            assertThat(map(today, "guidance")).containsEntry("state", passedParts == 4 ? "unitComplete" : "unitChoice");
            var result = call(ClaudeV1Contract.TOOL_RESUME_LEARNING_PLAN, args);
            assertThat(result.isError()).isTrue();
            assertThat(result.content().getFirst()).isInstanceOfSatisfying(McpSchema.TextContent.class,
                    item -> assertThat(item.text()).contains("No learning-plan target can be resumed"));
            assertThat(version()).isEqualTo(currentVersion);
            assertThat(learners.getLearner(learnerId).getActiveGoalId()).isNull();
        }
        if (passedParts == 4 && !separateOrder) {
            assertThat((List<?>) map(before, "levelCompletion").get("choices")).isEmpty();
            assertThat(map(today, "guidance").get("instruction").toString()).contains("Freiwillig weiterlernen");
            successful(ClaudeV1CompletionContractRegistry.TOOL_CONFIRM, Map.of(
                    "receiptCapability", map(context(), "completionContract").get("receiptCapability")));
            var confirmed = context();
            String title = "Idealisierungen und Grenzen von Bewegungsmodellen";
            var offered = (List<?>) assignment.get("voluntaryGoalTitles");
            // Road traffic left E.1 with the cut; the throw goal is another open E.1 goal.
            String bareGoalTitle = "Waagerechter Wurf analysieren";
            assertThat(offered.toString()).contains(title, bareGoalTitle);
            var beforeBareTitle = version();
            var bareTitleResult = call(ClaudeV1McpContractAdapter.TOOL_CHOOSE_COMPLETION_ROUTE,
                    writeArgs("bare-goal-title", beforeBareTitle, Map.of("choice", bareGoalTitle)));
            assertThat(bareTitleResult.isError()).isTrue();
            assertThat(version()).isEqualTo(beforeBareTitle);
            assertThat(learners.getLearner(learnerId).getActiveGoalId()).isNull();
            String routeTitle = learners.getLearnerState(learnerId).levelCompletion().actions().stream()
                    .filter(action -> "d6dc0e02-831d-4894-a61a-852bcc74f147".equals(action.goalId())
                            && action.practice() != null).findFirst().orElseThrow().title().get("de");
            String published = choice(confirmed, routeTitle);
            var receiptsBeforeChoice = examPasses.findForGoals(learnerId, parts);
            var result = successful(ClaudeV1McpContractAdapter.TOOL_CHOOSE_COMPLETION_ROUTE,
                    writeArgs("start-chosen-individual-goal", version(), Map.of("choice", published)));
            assertThat(map(map(result, "context"), "activeGoal"))
                    .containsEntry("id", MOTION_OPENING);
            assertThat(learners.getLearner(learnerId).getActiveGoalId()).isEqualTo(MOTION_OPENING);
            assertThat(learners.getLearner(learnerId).getPendingUnitEntry()).contains("d6dc0e02-831d-4894-a61a-852bcc74f147");
            assertThat(examPasses.findForGoals(learnerId, parts)).isEqualTo(receiptsBeforeChoice);
        }
        assertThat(examPasses.findForGoals(learnerId, parts)).hasSize(passedParts);
        assertThat(masteryRepository.findByLearner_SkillpilotId(learnerId)).extracting(Mastery::getGoalKey)
                .containsExactlyInAnyOrderElementsOf(HESSIAN_PASS_ORDER.subList(0, passedParts).stream().map(parts::get).toList());
    }

    @ParameterizedTest
    @CsvSource({"G8,false,09029573-864f-40ca-bf8a-cee7bf6dcb73", "G9,false,971beafa-6ba5-4c82-ac8b-7ebf66eec3dd",
            "G9,true,09029573-864f-40ca-bf8a-cee7bf6dcb73"})
    void completedAssignmentOffersExactlyItsOpenIndividualGoalsInThePersonalProfile(
            String duration, boolean strict, String requested) throws Exception {
        String section = selectHessianMotionUnit(duration, "SekII");
        String physics = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
        var parts = prepareUnitContinuation(section, 4, false);
        learners.setPlannedGoals(learnerId, java.util.Set.of());
        learners.setPreferences(learnerId, null, false, strict);
        var receipts = examPasses.findForGoals(learnerId, parts);
        var option = learners.getUnitAssignmentOptions(learnerId, physics).stream()
                .filter(item -> section.equals(item.sectionGoalId())).findFirst().orElseThrow();
        var open = option.voluntaryGoals().stream().map(LearnerLearningPlanApi.VoluntaryGoal::goalId).toList();
        assertThat(option.passed()).isTrue();
        assertThat(open).hasSize(E1_CONTENT_GOALS).contains(requested);
        var completion = learners.getLearnerState(learnerId).levelCompletion();
        assertThat(completion.profileId()).isEqualTo("automatic:personal-curriculum");
        assertThat(completion.unitAssessment()).isNull();
        var practice = completion.actions().stream().filter(action -> action.practice() != null).toList();
        assertThat(practice).extracting(action -> action.goalId()).containsExactlyInAnyOrderElementsOf(open);
        assertThat(practice).allMatch(action -> "voluntary".equals(action.intent()));
        assertThat(learners.getUnitPlanningCredits(learnerId)).containsOnlyKeys("e4b38061-1f28-43ad-8371-a3e7c0e81856").doesNotContainKey(requested);
        var chosen = practice.stream().filter(action -> requested.equals(action.goalId())).findFirst().orElseThrow();
        var outstanding = chosen.practice().openPrerequisites().stream().map(item -> item.goalId()).toList();
        assertThat(outstanding).isNotEmpty();
        assertThat(chosen.practice().startGoalId()).isEqualTo(MOTION_OPENING);
        assertThat(chosen.practice().orientationGoalId()).isEqualTo(MOTION_OPENING);
        assertThat(chosen.title().get("de")).startsWith("Mit dem Einheitseinstieg beginnen: ");
        assertThat(chosen.title().get("en")).startsWith("Start with the unit introduction: ");
        successful(ClaudeV1CompletionContractRegistry.TOOL_CONFIRM, Map.of(
                "receiptCapability", map(context(), "completionContract").get("receiptCapability")));
        var confirmed = context();
        var route = map(confirmed, "levelCompletion");
        var individualChoices = ((List<?>) route.get("individualPractice")).stream()
                .map(item -> ((Map<?, ?>) item).get("choice").toString()).toList();
        assertThat(individualChoices).containsExactlyInAnyOrderElementsOf(
                practice.stream().map(action -> action.title().get("de")).toList());
        assertThat((List<?>) route.get("choices")).hasSizeLessThanOrEqualTo(ClaudeV1CompletionChoices.MAX_CHOICES);
        var result = successful(ClaudeV1McpContractAdapter.TOOL_CHOOSE_COMPLETION_ROUTE,
                writeArgs("start-requested-individual-experiment", version(), Map.of("choice", choice(confirmed, chosen.title().get("de")))));
        assertThat(map(map(result, "context"), "activeGoal")).containsEntry("id", chosen.practice().startGoalId());
        assertThat(map(context(), "activeGoal")).containsEntry("id", chosen.practice().startGoalId());
        assertThat(learners.getPlannedGoals(learnerId)).contains(requested);
        assertThat(examPasses.findForGoals(learnerId, parts)).isEqualTo(receipts);
        assertThat(masteryRepository.findByLearner_SkillpilotId(learnerId)).extracting(Mastery::getGoalKey)
                .containsExactlyInAnyOrderElementsOf(parts);
        successful(ClaudeV1Contract.TOOL_SET_MASTERY, writeArgs("individual-parent-opening", version(), Map.of("goalId", MOTION_OPENING)));
        if (FALL_OPENING.equals(learnerRepository.findById(learnerId).orElseThrow().getActiveGoalId())) {
            successful(ClaudeV1Contract.TOOL_SET_MASTERY, writeArgs("individual-child-opening", version(), Map.of("goalId", FALL_OPENING)));
        }
        String continuedGoal = learnerRepository.findById(learnerId).orElseThrow().getActiveGoalId();
        if (strict) assertThat(continuedGoal).isIn(outstanding);
        else assertThat(continuedGoal).isEqualTo(requested);
        String pointer = learnerRepository.findById(learnerId).orElseThrow().getPendingUnitEntry();
        if (strict) assertThat(pointer).contains(requested);
        else assertThat(pointer).isNull();
    }

    private List<String> individualPracticeGoalIds() {
        return learners.getLearnerState(learnerId).levelCompletion().actions().stream()
                .filter(item -> item.practice() != null).map(item -> item.goalId()).toList();
    }

    @Test void aPausedCompletedAssignmentRetainsOpenGoalsAndASeparateResultStaysMastered() throws Exception {
        String section = selectHessianMotionUnit("G8", "SekII");
        String physics = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
        String freeFall = "09029573-864f-40ca-bf8a-cee7bf6dcb73";
        String uniform = "971beafa-6ba5-4c82-ac8b-7ebf66eec3dd";
        var parts = prepareUnitContinuation(section, 4, false);
        var plan = learningPlans.getPlan(learnerId, physics, java.time.LocalDate.now(java.time.ZoneId.of("Europe/Berlin")));
        var receipts = examPasses.findForGoals(learnerId, parts);
        learningPlans.setUnitAssignmentActivity(learnerId, plan.planId(),
                new LearnerLearningPlanApi.UnitAssignmentActivity(plan.revision(), "unit", false));
        // The section is still focused and its current A–D receipts still exist.
        assertThat(learners.getLearnerState(learnerId).levelCompletion().unitAssessment().passed()).isTrue();
        assertThat(individualPracticeGoalIds()).contains(freeFall, uniform);
        var voluntary = learners.chooseLevelCompletion(learnerId, new LevelCompletionActionRequest(
                "focusPractice", "automatic:personal-curriculum", freeFall, "voluntary", version()));
        assertThat(voluntary.activeGoal().id()).isEqualTo(MOTION_OPENING);
        learningPlans.setUnitAssignmentActivity(learnerId, plan.planId(),
                new LearnerLearningPlanApi.UnitAssignmentActivity(plan.revision() + 1, "unit", true));
        masteryRepository.saveAndFlush(new Mastery(learnerRepository.findById(learnerId).orElseThrow(), uniform, 1.0));
        assertThat(individualPracticeGoalIds()).hasSize(E1_CONTENT_GOALS - 1).contains(freeFall).doesNotContain(uniform, WURF_EXTRA);
        assertThat(examPasses.findForGoals(learnerId, parts)).isEqualTo(receipts);
    }

    private List<String> prepareUnitContinuation(String section, int passedParts, boolean separateOrder) throws Exception {
        String physics = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
        String diagrams = "ae67bcf1-f3ee-50d6-9a12-25a159dff659";
        var option = learners.getUnitAssignmentOptions(learnerId, physics).stream()
                .filter(item -> section.equals(item.sectionGoalId())).findFirst().orElseThrow();
        var parts = option.parts().stream().map(LearnerLearningPlanApi.UnitAssignmentPart::goalId).toList();
        var day = java.time.LocalDate.now(java.time.ZoneId.of("Europe/Berlin"));
        var monday = day.with(java.time.DayOfWeek.MONDAY);
        var sunday = monday.plusDays(6);
        var blocks = new java.util.ArrayList<LearnerLearningPlanApi.Block>();
        blocks.add(new LearnerLearningPlanApi.Block("unit", "learning", null, "E.1", monday, sunday,
                null, parts, List.of(section), true, option.binding()));
        if (separateOrder) {
            blocks.add(new LearnerLearningPlanApi.Block("individual", "learning", diagrams, "Weg-Zeit-Diagramme",
                    monday, sunday, null, List.of(diagrams), List.of(diagrams), true));
        }
        learners.setPreferences(learnerId, null, null, false, null, true);
        learningPlans.upsert(learnerId, physics, new LearnerLearningPlanApi.UpsertRequest(0L, "E.1", blocks), day);

        var points = List.of(14, 15, 17, 17);
        for (int index : HESSIAN_PASS_ORDER.subList(0, passedParts)) {
            passHessianAssessment(section, parts.get(index), points.get(index));
        }
        learners.chooseLevelCompletion(learnerId, new LevelCompletionActionRequest(
                "selectProfile", "automatic:" + section, null, null, version()));
        learners.chooseLevelCompletion(learnerId, new LevelCompletionActionRequest("leaveProfile", null, null, null, version()));
        session = sessions.createFirstPartyLaunch(learnerId, new ClaudeV1CoachStartRequest("de", "web-start")).learningSessionId();
        authenticate();
        return parts;
    }

    @ParameterizedTest(name = "two subjects, unit {0}, future math plan {1}, use generic resume {2}")
    @CsvSource({"active,false,false", "completed,false,false", "unavailable,false,false",
            "active,true,false", "completed,true,false", "unavailable,true,false", "unavailable,true,true"})
    void aNamedMathSubjectAndItsPlanRemainSelectableAlongsidePhysics(
            String assignmentState, boolean futureMathPlan, boolean useGenericResume) throws Exception {
        String section = selectHessianMotionUnit("G9", "SekII");
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        var curriculum = mapper.readValue(learner.getPersonalCurriculum(), com.fasterxml.jackson.databind.node.ObjectNode.class);
        curriculum.set(MATH, mapper.valueToTree(Map.of("selected", true, "filterId", "GK")));
        learner.setPersonalCurriculum(mapper.writeValueAsString(curriculum));
        learnerRepository.saveAndFlush(learner);
        var parts = prepareUnitContinuation(section, "completed".equals(assignmentState) ? 4 : 0, false);
        var mathFrontier = learners.getPersonalCurriculumSubjectFrontier(learnerId, MATH).stream()
                .filter(goal -> "atomic".equals(goal.type())).toList();
        // A future plan must pick its own goal even when the subject's ordinary first choice differs.
        assertThat(mathFrontier).hasSizeGreaterThan(1);
        var mathGoal = mathFrontier.get(futureMathPlan ? 1 : 0);
        if (futureMathPlan) {
            var day = java.time.LocalDate.now(java.time.ZoneId.of("Europe/Berlin"));
            var later = day.plusWeeks(3).with(java.time.DayOfWeek.MONDAY);
            learningPlans.upsert(learnerId, MATH, new LearnerLearningPlanApi.UpsertRequest(0L, "Mathematik",
                    List.of(new LearnerLearningPlanApi.Block("later", "learning", mathGoal.id(), "Mathematik",
                            later, later.plusDays(4), null, List.of(mathGoal.id()), List.of(mathGoal.id()), true))), day);
        }
        boolean unavailable = "unavailable".equals(assignmentState);
        if (unavailable) org.springframework.test.util.ReflectionTestUtils.setField(learners, "unitAssessmentPilotEnabled", false);
        try {
            var today = map(context(), "learningPlanToday");
            assertThat(today).containsEntry("resumeAvailable", unavailable);
            var subjects = ((List<?>) today.get("subjects")).stream().map(Map.class::cast).toList();
            var physics = subjects.stream().filter(subject -> subject.containsKey("unitAssignments")).findFirst().orElseThrow();
            var unit = (Map<?, ?>) ((List<?>) physics.get("unitAssignments")).getFirst();
            assertThat(unit.get("status")).isEqualTo(assignmentState);
            var math = subjects.stream().filter(subject -> subject.get("subject").toString().startsWith("Mathematik"))
                    .findFirst().orElseThrow();
            assertThat(math.get("canContinue")).isEqualTo(true);
            assertThat(math.get("evaluable")).isEqualTo(futureMathPlan);
            var prior = version();
            if (!unavailable) {
                var blocked = call(ClaudeV1Contract.TOOL_RESUME_LEARNING_PLAN, writeArgs("no-unqualified-math", prior, Map.of()));
                assertThat(blocked.isError()).isTrue();
                assertThat(learners.getLearner(learnerId).getActiveGoalId()).isNull();
                assertThat(version()).isEqualTo(prior);
            }
            var result = useGenericResume
                    ? successful(ClaudeV1Contract.TOOL_RESUME_LEARNING_PLAN, writeArgs("resume-future-plan", prior, Map.of()))
                    : successful(ClaudeV1Contract.TOOL_SWITCH_LEARNING_PLAN_SUBJECT,
                            writeArgs("explicit-math", prior, Map.of("subject", math.get("subject"))));
            assertThat(map(map(result, "context"), "activeGoal")).containsEntry("id", mathGoal.id());
            assertThat(learners.getLearner(learnerId).getActiveGoalId()).isEqualTo(mathGoal.id());
            assertThat(examPasses.findForGoals(learnerId, parts)).hasSize("completed".equals(assignmentState) ? 4 : 0);
        } finally {
            if (unavailable) org.springframework.test.util.ReflectionTestUtils.setField(learners, "unitAssessmentPilotEnabled", true);
        }
    }

    // E.1 cut (23 Nov 2026): reference frames and road traffic left the section, the t-v diagram, the
    // motion laws and the light/heavy fall comparison joined it, so each plan gains one position.
    @ParameterizedTest
    @CsvSource({"G8,SekII,GK,20", "G9,SekII,GK,20", "G8,CrossStage,GK,19", "G9,CrossStage,GK,19",
            "G8,SekII,LK,20", "G9,SekII,LK,20", "G8,CrossStage,LK,19", "G9,CrossStage,LK,19"})
    void supplementaryAssessmentRequiresExplicitSelectionInAnIndividualPlan(String duration, String stage, String course, int expected) throws Exception {
        String section = selectHessianMotionUnit(duration, stage, course);
        String physics = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
        String measurementProtocol = "e0004439-ed34-5caf-858a-6107918224eb";
        String individualProtocolAssessment = "c6e2942d-1ff4-5e86-a52a-4ca4c8568291";
        String extra = "LK".equals(course) ? FREE_FALL_SERIES_EXTRA : WURF_EXTRA;
        var today = java.time.LocalDate.now(java.time.ZoneId.of("Europe/Berlin"));
        var monday = today.with(java.time.DayOfWeek.MONDAY);
        var sunday = monday.plusDays(6);
        var sectionRoots = List.of(section);
        var individual = List.of(section, extra);
        var required = learners.resolveLearningPlanGoalIds(learnerId, physics, sectionRoots);
        var all = learners.resolveLearningPlanGoalIds(learnerId, physics, individual);
        assertThat(required).hasSize(expected).contains(measurementProtocol)
                .doesNotContain(WURF_EXTRA, FREE_FALL_SERIES_EXTRA, MULTIPHASE_EXTRA, individualProtocolAssessment);
        assertThat(all).containsExactlyInAnyOrderElementsOf(
                java.util.stream.Stream.concat(required.stream(), java.util.stream.Stream.of(extra)).toList());
        assertThat(learners.resolveLearningPlanGoalIds(learnerId, physics, List.of(extra))).containsExactly(extra);

        var fullCapture = new LearnerLearningPlanApi.Block("motion", "learning", null, "E.1",
                monday, sunday, null, all, sectionRoots, true);
        var saved = learningPlans.upsert(learnerId, physics, new LearnerLearningPlanApi.UpsertRequest(
                0L, "E.1", List.of(fullCapture)), today);
        assertThat(saved.blocks().getFirst().atomicGoalIds()).containsExactlyInAnyOrderElementsOf(required);
        var stored = storedPlans.findByLearner_SkillpilotIdAndLandscapeId(learnerId, physics).orElseThrow();
        var captured = saved.blocks().getFirst();
        var legacyCapture = new LearnerLearningPlanApi.Block(captured.id(), captured.kind(), captured.goalId(), captured.title(),
                captured.startDate(), captured.endDate(), captured.date(), all, captured.goalIds(), captured.active());
        String legacyJson = mapper.writeValueAsString(learners.orderLearningPlanBlocksByPrerequisites(
                learnerId, List.of(legacyCapture)));
        stored.setBlocksJson(legacyJson);
        storedPlans.saveAndFlush(stored);
        var interpreted = learningPlans.getPlan(learnerId, physics, today);
        assertThat(interpreted.stale()).isFalse();
        assertThat(interpreted.blocks().getFirst().atomicGoalIds()).containsExactlyInAnyOrderElementsOf(required);
        assertThat(storedPlans.findByLearner_SkillpilotIdAndLandscapeId(learnerId, physics).orElseThrow().getBlocksJson())
                .isEqualTo(legacyJson);
        var withExtra = new LearnerLearningPlanApi.Block("motion", "learning", null, "E.1 und Zusatzprüfung",
                monday, sunday, null, all, individual, true);
        var explicit = learningPlans.upsert(learnerId, physics, new LearnerLearningPlanApi.UpsertRequest(
                interpreted.revision(), "E.1 und Zusatzprüfung", List.of(withExtra)), today);
        assertThat(explicit.blocks().getFirst().atomicGoalIds()).containsExactlyInAnyOrderElementsOf(all);
    }

    @ParameterizedTest
    @CsvSource({"G8,true,false", "G9,true,false", "G8,false,false", "G9,false,false", "G9,true,true"})
    void separateExplicitAssessmentSurvivesSectionDeduplicationAndSignedArchive(
            String duration, boolean sectionFirst, boolean additionalSection) throws Exception {
        String section = selectHessianMotionUnit(duration, "SekII");
        String physics = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
        String extra = "bcc56921-7107-5f5f-b721-3d5e0d7e1cd9";
        var today = java.time.LocalDate.now(java.time.ZoneId.of("Europe/Berlin"));
        var monday = today.with(java.time.DayOfWeek.MONDAY);
        var required = learners.resolveLearningPlanGoalIds(learnerId, physics, List.of(section));
        var all = learners.resolveLearningPlanGoalIds(learnerId, physics, List.of(section, extra));
        var sectionDate = monday;
        var examDate = sectionFirst ? monday.plusDays(1) : monday;
        var sectionBlock = new LearnerLearningPlanApi.Block("section", "learning", section, "E.1",
                sectionDate, sectionDate, null, all, List.of(section), true);
        // The separate canonical “Übungen E-Phase” cluster also contains the supplementary exam.
        String additionalRoot = additionalSection ? "424b07df-bf66-5d7f-99f5-f28b32ad1f22" : extra;
        var examBlock = new LearnerLearningPlanApi.Block("own", "learning", additionalRoot, "Weitere Auswahl",
                examDate, examDate, null, List.of(extra), List.of(additionalRoot), true);
        var saved = learningPlans.upsert(learnerId, physics, new LearnerLearningPlanApi.UpsertRequest(
                0L, "Abschnitt und eigene Prüfung", sectionFirst ? List.of(sectionBlock, examBlock) : List.of(examBlock, sectionBlock)), today);
        assertThat(saved.blocks().get(sectionFirst ? 0 : 1).atomicGoalIds()).containsExactlyInAnyOrderElementsOf(required);
        assertThat(saved.blocks().get(sectionFirst ? 1 : 0).atomicGoalIds()).containsExactly(extra);
        if (!sectionFirst) return;

        // Older releases materialized the whole first section and left the explicitly selected
        // goal of the later block recorded only in its roots after cross-block deduplication.
        var emptyExam = new LearnerLearningPlanApi.Block(examBlock.id(), examBlock.kind(), additionalRoot, examBlock.title(),
                examDate, examDate, null, List.of(), List.of(additionalRoot), true);
        var legacy = learners.orderLearningPlanBlocksByPrerequisites(learnerId, List.of(sectionBlock, emptyExam));
        var record = storedPlans.findByLearner_SkillpilotIdAndLandscapeId(learnerId, physics).orElseThrow();
        record.setBlocksJson(mapper.writeValueAsString(legacy));
        storedPlans.saveAndFlush(record);
        var archive = learners.exportLearner(learnerId);
        assertThat(archive.data().learningPlans().getFirst().blocks()).isEqualTo(legacy);
        assertThat(archive.signature()).isNotBlank();
        var effective = learningPlans.getPlan(learnerId, physics, today);
        assertThat(effective.stale()).isFalse();
        assertThat(effective.revision()).isEqualTo(saved.revision());
        assertThat(effective.blocks().getFirst().atomicGoalIds()).containsExactlyInAnyOrderElementsOf(required);
        assertThat(effective.blocks().getLast().atomicGoalIds()).containsExactly(extra);
        assertThat(learners.exportLearner(learnerId).data().learningPlans().getFirst().blocks()).isEqualTo(legacy);
        learners.importLearner(learnerId, archive);
        assertThat(learningPlans.getPlan(learnerId, physics, today).blocks()).isEqualTo(effective.blocks());
    }

    @Test void oldSectionCaptureWithOnlyTheOptionalAssessmentFinishesWithoutAcceptingAnEmptyNewPlan() throws Exception {
        String section = selectHessianMotionUnit("G9", "SekII");
        String physics = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
        String extra = "bcc56921-7107-5f5f-b721-3d5e0d7e1cd9";
        var today = java.time.LocalDate.now(java.time.ZoneId.of("Europe/Berlin"));
        var monday = today.with(java.time.DayOfWeek.MONDAY);
        var old = new LearnerLearningPlanApi.Block("section", "learning", section, "E.1", monday, monday,
                null, List.of(extra), List.of(section), true);
        var required = learners.resolveLearningPlanGoalIds(learnerId, physics, List.of(section));
        var explicit = new LearnerLearningPlanApi.Block("exam", "learning", extra, "Meine Prüfung", monday, monday,
                null, List.of(extra), List.of(extra), true);
        var full = new LearnerLearningPlanApi.Block("section", "learning", section, "E.1", monday, monday, null,
                learners.resolveLearningPlanGoalIds(learnerId, physics, List.of(section, extra)), List.of(section), true);
        var learner = learners.getLearner(learnerId);
        masteryRepository.saveAllAndFlush(required.stream().map(id -> new Mastery(learner, id, 1.0)).toList());
        assertThatThrownBy(() -> learningPlans.upsert(learnerId, physics,
                new LearnerLearningPlanApi.UpsertRequest(0L, "Keine offenen Pflichtziele", List.of(full)), today))
                .hasMessageContaining("no currently open atomic goals");
        assertThat(storedPlans.findByLearner_SkillpilotIdAndLandscapeId(learnerId, physics)).isEmpty();
        learningPlans.upsert(learnerId, physics,
                new LearnerLearningPlanApi.UpsertRequest(0L, "Explizit", List.of(explicit)), today);
        var record = storedPlans.findByLearner_SkillpilotIdAndLandscapeId(learnerId, physics).orElseThrow();
        record.setBlocksJson(mapper.writeValueAsString(List.of(old)));
        storedPlans.saveAndFlush(record);
        var historical = learningPlans.getPlan(learnerId, physics, today);
        assertThat(historical.stale()).isFalse();
        assertThat(historical.blocks().getFirst().atomicGoalIds()).isEmpty();
        if (historical.nextEligibleGoal() != null) {
            assertThat(historical.nextEligibleGoal().goalId()).isNotEqualTo(extra);
        }
        assertThat(learners.exportLearner(learnerId).data().learningPlans().getFirst().blocks()).containsExactly(old);

        // The genuine capture still has an atom. An already empty historical block never
        // satisfied the old capture contract, even if its section happens to match this unit.
        record.setBlocksJson(mapper.writeValueAsString(historical.blocks()));
        storedPlans.saveAndFlush(record);
        assertThat(learningPlans.getPlan(learnerId, physics, today).stale()).isTrue();
    }

    // A retired edition keeps its identity as history and leaves the learner's scope. A stored plan
    // that still names it stays valid for everything else it holds (Product Owner, 24 November 2026).
    // It is neither rewritten nor pointed at another edition.
    @ParameterizedTest
    @CsvSource({"GK,6ea3fb3c-abdc-568f-ab13-97c36dc274e4", "LK,6ea3fb3c-abdc-568f-ab13-97c36dc274e4",
            "LK,2b9e565f-d9b4-5e23-b5b7-b7977cecff06",
            // The mixed E.1 exam "Bewegungsanalyse und freier Fall", retired on 25 November 2026.
            "GK,a9562b05-c54d-5635-9244-3f7dd24a8642"})
    void storedPlanNamingARetiredAssessmentEditionStaysValidAndIsKeptUnchanged(String course, String retired) throws Exception {
        String section = selectHessianMotionUnit("G9", "SekII", course);
        String physics = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
        var today = java.time.LocalDate.now(java.time.ZoneId.of("Europe/Berlin"));
        var monday = today.with(java.time.DayOfWeek.MONDAY);
        assertThat(learners.getPlanningScope(learnerId, physics).scopeAtomicGoalIds())
                .contains(WURF_EXTRA).doesNotContain(retired);
        var required = learners.resolveLearningPlanGoalIds(learnerId, physics, List.of(section));
        assertThat(required).doesNotContain(retired);
        var current = new LearnerLearningPlanApi.Block("section", "learning", section, "E.1", monday, monday,
                null, required, List.of(section), true);
        learningPlans.upsert(learnerId, physics,
                new LearnerLearningPlanApi.UpsertRequest(0L, "E.1", List.of(current)), today);
        var reference = learningPlans.getPlan(learnerId, physics, today);
        assertThat(reference.stale()).isFalse();

        // Before the retirement a section selection stored the edition among its goals, and a
        // learner could also select it in a block of its own.
        var captured = new java.util.ArrayList<>(required);
        captured.add(retired);
        var oldSection = new LearnerLearningPlanApi.Block("section", "learning", section, "E.1", monday, monday,
                null, captured, List.of(section), true);
        var ownExam = new LearnerLearningPlanApi.Block("exam", "learning", retired, "Meine Prüfung",
                monday.plusDays(1), monday.plusDays(1), null, List.of(retired), List.of(retired), true);
        for (var stored : List.of(List.of(oldSection), List.of(current, ownExam))) {
            var record = storedPlans.findByLearner_SkillpilotIdAndLandscapeId(learnerId, physics).orElseThrow();
            record.setBlocksJson(mapper.writeValueAsString(stored));
            storedPlans.saveAndFlush(record);
            var plan = learningPlans.getPlan(learnerId, physics, today);
            assertThat(plan.stale()).isFalse();
            // The plan continues exactly like the same plan without the retired entry.
            assertThat(plan.blocks()).isEqualTo(reference.blocks());
            assertThat(plan.nextEligibleGoal()).isEqualTo(reference.nextEligibleGoal());
            assertThat(plan.canContinue()).isEqualTo(reference.canContinue());
            assertThat(learners.exportLearner(learnerId).data().learningPlans().getFirst().blocks()).isEqualTo(stored);
        }
        // Nothing is left of a plan that names only the retired edition: it is outdated as before.
        var record = storedPlans.findByLearner_SkillpilotIdAndLandscapeId(learnerId, physics).orElseThrow();
        record.setBlocksJson(mapper.writeValueAsString(List.of(ownExam)));
        storedPlans.saveAndFlush(record);
        var emptied = learningPlans.getPlan(learnerId, physics, today);
        assertThat(emptied.stale()).isTrue();
        assertThat(emptied.nextEligibleGoal()).isNull();
        assertThat(learners.exportLearner(learnerId).data().learningPlans().getFirst().blocks()).isEqualTo(List.of(ownExam));
        // A new plan cannot select the retired edition.
        long revision = emptied.revision();
        assertThatThrownBy(() -> learningPlans.upsert(learnerId, physics,
                new LearnerLearningPlanApi.UpsertRequest(revision, "Alte Fassung", List.of(current, ownExam)), today))
                .hasMessageContaining("Unknown atomicGoalIds");
    }

    @Test void changingDurationInTheSharedSekIIViewNeedsANewAssignmentChoice() throws Exception {
        String section = selectHessianMotionUnit("G8", "SekII");
        String physics = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
        var before = learners.getUnitAssignmentOptions(learnerId, physics).stream()
                .filter(item -> section.equals(item.sectionGoalId())).findFirst().orElseThrow();
        var ids = before.parts().stream().map(LearnerLearningPlanApi.UnitAssignmentPart::goalId).toList();
        var day = java.time.LocalDate.now(java.time.ZoneId.of("Europe/Berlin"));
        var saved = new LearnerLearningPlanApi.Block("unit", "learning", section, "E.1", day, day, null,
                ids, List.of(section), true, before.binding());
        var plan = learningPlans.upsert(learnerId, physics, new LearnerLearningPlanApi.UpsertRequest(0L, "E.1", List.of(saved)), day);
        assertThat(configureHessianMotionUnit("G9", "SekII", "GK")).isEqualTo(section);
        var after = learners.getUnitAssignmentOptions(learnerId, physics).stream()
                .filter(item -> section.equals(item.sectionGoalId())).findFirst().orElseThrow();
        assertThat(after.revision()).isEqualTo(before.revision());
        assertThat(after.fingerprint()).isNotEqualTo(before.fingerprint());
        var outdated = learningPlans.getPlan(learnerId, physics, day);
        assertThat(outdated.continueReason()).isEqualTo("unit-assignment-unavailable");
        assertThat(outdated.nextEligibleGoal()).isNull();
        var historical = learningPlans.getTodayStatus(learnerId, "de").subjects().getFirst().unitAssignments().getFirst();
        assertThat(historical.status()).isEqualTo("unavailable");
        assertThat(historical.passedParts()).isNull();
        var renewed = new LearnerLearningPlanApi.Block("unit", "learning", section, "E.1", day, day, null,
                ids, List.of(section), true, after.binding());
        var chosen = learningPlans.upsert(learnerId, physics, new LearnerLearningPlanApi.UpsertRequest(
                plan.revision(), "E.1", List.of(renewed)), day);
        assertThat(chosen.continueReason()).isEqualTo("unit-assessment-choice-required");
        assertThat(chosen.nextEligibleGoal().goalId()).isEqualTo(ids.getFirst());
    }

    @Test void currentHistoricalPassesCanCompleteALaterOrderWithoutIndividualPlanningCredits() throws Exception {
        String section = selectHessianMotionUnit("G9");
        String physics = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
        var option = learners.getUnitAssignmentOptions(learnerId, physics).stream()
                .filter(item -> section.equals(item.sectionGoalId())).findFirst().orElseThrow();
        var ids = option.parts().stream().map(LearnerLearningPlanApi.UnitAssignmentPart::goalId).toList();
        var points = List.of(14, 15, 17, 17);
        org.springframework.test.util.ReflectionTestUtils.setField(learners, "unitAssessmentPilotEnabled", false);
        try {
            for (int i = 0; i < ids.size(); i++) passHessianAssessment(section, ids.get(i), points.get(i));
        } finally {
            org.springframework.test.util.ReflectionTestUtils.setField(learners, "unitAssessmentPilotEnabled", true);
        }
        assertThat(learners.getUnitPlanningCredits(learnerId)).isEmpty();
        assertThat(examPasses.findForGoals(learnerId, ids).values()).allSatisfy(passes ->
                assertThat(passes).singleElement().satisfies(receipt -> assertThat(receipt.planningCreditBindingIds()).isEmpty()));
        var day = java.time.LocalDate.now(java.time.ZoneId.of("Europe/Berlin"));
        var block = new LearnerLearningPlanApi.Block("unit", "learning", section, "E.1", day, day,
                null, ids, List.of(section), true, option.binding());
        var plan = learningPlans.upsert(learnerId, physics, new LearnerLearningPlanApi.UpsertRequest(0L, "E.1", List.of(block)), day);
        assertThat(plan.nextEligibleGoal()).isNull();
        assertThat(plan.continueReason()).isEqualTo("unit-assignment-completed");
        var subject = learningPlans.getTodayStatus(learnerId, "de").subjects().getFirst();
        assertThat(subject.unitAssignments().getFirst().passedParts()).isEqualTo(4);
        assertThat(learners.getLearnerState(learnerId).levelCompletion().unitAssessment().planningCreditGoalIds()).isEmpty();
    }

    @ParameterizedTest
    @CsvSource({"G8,GK", "G9,GK", "G8,LK", "G9,LK", "G9,GK+LK"})
    void optionalSectionExamCanBeChosenAndPassedWithoutCompletingAUnitPart(String duration, String course) throws Exception {
        String section = selectHessianMotionUnit(duration, "SekII", course);
        String profile = "automatic:" + section;
        boolean advanced = !"GK".equals(course);
        String extra = advanced ? FREE_FALL_SERIES_EXTRA : WURF_EXTRA;
        var completion = learners.getLearnerState(learnerId).levelCompletion();
        var sections = completion.profileOptions();
        assertThat(sections).filteredOn(option -> profile.equals(option.profileId())).singleElement().satisfies(option -> {
            assertThat(option.requiredAssessmentCount()).isEqualTo(4);
            var unitParts = completion.unitAssessment().parts().stream()
                    .map(part -> part.goalId()).toList();
            assertThat(option.assessments().stream().filter(item -> !Boolean.TRUE.equals(item.voluntary()))
                    .map(item -> item.goalId()).toList()).containsExactlyInAnyOrderElementsOf(unitParts);
            assertThat(option.assessments().stream().filter(item -> Boolean.TRUE.equals(item.voluntary()))
                    .map(item -> item.goalId()).toList()).containsExactlyInAnyOrderElementsOf(
                            hessianVoluntaryAssessmentIds(course));
        });
        assertThat(sections.stream().filter(option -> !profile.equals(option.profileId()))
                .flatMap(option -> option.assessments().stream()).filter(item -> extra.equals(item.goalId())).toList())
                .isNotEmpty().allMatch(item -> item.voluntary() == null);
        {
            long before = version();
            assertThatThrownBy(() -> sessions.createFirstPartyLaunch(learnerId,
                    new ClaudeV1CoachStartRequest("de", "web-start",
                            new CompletionAssessmentStart(profile, MULTIPHASE_EXTRA, before))))
                    .isInstanceOf(org.springframework.web.server.ResponseStatusException.class)
                    .hasMessageContaining("409");
            assertThat(version()).isEqualTo(before);
            assertThat(examPasses.findForGoals(learnerId, List.of(MULTIPHASE_EXTRA))).isEmpty();
        }
        learners.chooseLevelCompletion(learnerId, new LevelCompletionActionRequest("selectProfile", profile, null, null, version()));
        session = sessions.createFirstPartyLaunch(learnerId, new ClaudeV1CoachStartRequest("de", "web-start")).learningSessionId();
        authenticate();
        successful(ClaudeV1CompletionContractRegistry.TOOL_CONFIRM,
                Map.of("receiptCapability", map(context(), "completionContract").get("receiptCapability")));
        String start = choice(context(), "Freiwillige Zusatzprüfung versuchen: "
                + landscapeDefinitions.getGoalDefinition(extra).getTitle());
        successful(ClaudeV1McpContractAdapter.TOOL_CHOOSE_COMPLETION_ROUTE,
                writeArgs("voluntary-start", version(), Map.of("choice", start)));
        assertThat(map(context(), "activeGoal")).containsEntry("id", extra);
        var evaluation = successful(ClaudeV1Contract.TOOL_GET_EXAM_EVALUATION, Map.of("goalId", extra));
        double threshold = mapper.valueToTree(evaluation.get("scoring")).required("passingPoints").doubleValue();
        successful(ClaudeV1Contract.TOOL_SET_MASTERY, writeArgs("voluntary-pass", version(),
                Map.of("goalId", extra, "evaluationCapability", evaluation.get("evaluationCapability"), "earnedPoints", threshold)));
        var completed = learners.getLearnerState(learnerId).levelCompletion();
        assertThat(completed.requiredAssessmentCount()).isEqualTo(4);
        assertThat(completed.masteredAssessmentCount()).isZero();
        assertThat(completed.assessments()).filteredOn(item -> Boolean.TRUE.equals(item.voluntary()) && item.mastered()).singleElement()
                .satisfies(item -> { assertThat(item.goalId()).isEqualTo(extra); assertThat(item.startAvailable()).isFalse(); });
        assertThat(completed.unitAssessment().parts()).noneMatch(UnitAssessmentResponse.Part::passed);
        assertThat(learners.getUnitPlanningCredits(learnerId)).isEmpty();
        assertThat(examPasses.findForGoals(learnerId, List.of(extra)).get(extra)).hasSize(1);
        assertThat(masteryRepository.findByLearner_SkillpilotId(learnerId)).extracting(Mastery::getGoalKey).containsExactly(extra);
        org.springframework.test.util.ReflectionTestUtils.setField(learners, "unitAssessmentPilotEnabled", false);
        try {
            var ordinary = learners.getLearnerState(learnerId).levelCompletion();
            assertThat(ordinary.requiredAssessmentCount()).isEqualTo(4 + hessianVoluntaryAssessmentIds(course).size());
            assertThat(ordinary.masteredAssessmentCount()).isOne();
            assertThat(ordinary.assessments()).allMatch(item -> item.voluntary() == null);
        } finally {
            org.springframework.test.util.ReflectionTestUtils.setField(learners, "unitAssessmentPilotEnabled", true);
        }
    }

    @ParameterizedTest
    @CsvSource({"GK,ORIGINAL22", "LK,ORIGINAL22", "GK,PREVIOUS36", "LK,PREVIOUS36",
            "GK,RAW_ONLY", "LK,RAW_ONLY"})
    void historicalTwoMotionsPassNeverCompletesTheNewVoluntaryEdition(String course, String edition) throws Exception {
        String section = selectHessianMotionUnit("G9", "SekII", course);
        var parts = prepareUnitContinuation(section, 4, false);
        learners.chooseLevelCompletion(learnerId, new LevelCompletionActionRequest(
                "selectProfile", "automatic:" + section, null, null, version()));
        if (!"RAW_ONLY".equals(edition)) {
            // Authentic retained editions: no evidence-folder dependency in the sparse completion CI job.
            String fixture = "ORIGINAL22".equals(edition)
                    ? "/fixtures/e1-two-motions-original-22of36.goal.json"
                    : "/fixtures/e1-two-motions-before-successor.goal.json";
            com.fasterxml.jackson.databind.JsonNode oldGoal;
            try (var stream = getClass().getResourceAsStream(fixture)) {
                oldGoal = mapper.readTree(java.util.Objects.requireNonNull(stream, "historical ZB fixture missing"));
            }
            assertThat(oldGoal.required("id").asText()).isEqualTo(HISTORICAL_WURF_EXTRA);
            var oldExam = mapper.treeToValue(oldGoal.required("examData"), com.skillpilot.backend.landscape.ExamData.class);
            var oldMaterial = AssessmentMaterialRevision.of(oldExam);
            // The original admissible counterexample omits task 6; the later edition earned its actual maximum.
            double oldScore = "ORIGINAL22".equals(edition) ? 30 : oldExam.getScoring().getMaxPoints();
            assertThat(oldScore).isGreaterThanOrEqualTo(oldExam.getScoring().getPassingPoints());
            transactions.executeWithoutResult(status -> examPasses.record(learnerId, HISTORICAL_WURF_EXTRA,
                    oldMaterial, oldScore, oldExam.getScoring().getMaxPoints(), oldExam.getScoring().getPassingPoints()));
        }
        var learner = learnerRepository.findById(learnerId).orElseThrow();
        masteryRepository.saveAndFlush(new Mastery(learner, HISTORICAL_WURF_EXTRA, 1.0));
        var history = examPasses.findForGoals(learnerId, List.of(HISTORICAL_WURF_EXTRA));
        if ("RAW_ONLY".equals(edition)) assertThat(history).isEmpty();
        else assertThat(history.get(HISTORICAL_WURF_EXTRA)).singleElement()
                .satisfies(pass -> assertThat(pass.planningCreditBindingIds()).isEmpty());
        var before = learners.getLearnerState(learnerId).levelCompletion();
        assertThat(before.requiredAssessmentCount()).isEqualTo(parts.size());
        assertThat(before.masteredAssessmentCount()).isEqualTo(parts.size());
        assertThat(before.unitAssessment().parts()).allMatch(UnitAssessmentResponse.Part::passed);
        assertThat(before.unitAssessment().planningCreditGoalIds())
                .containsExactly("e4b38061-1f28-43ad-8371-a3e7c0e81856");
        assertThat(before.assessments()).noneMatch(item -> HISTORICAL_WURF_EXTRA.equals(item.goalId()));
        assertThat(before.assessments()).filteredOn(item -> WURF_EXTRA.equals(item.goalId())).singleElement().satisfies(item -> {
            assertThat(item.mastered()).isFalse();
            assertThat(item.startAvailable()).isTrue();
            assertThat(item.voluntary()).isTrue();
        });
        assertThat(learners.getMastery(learnerId)).containsEntry(HISTORICAL_WURF_EXTRA, 1.0)
                .doesNotContainKeys(WURF_EXTRA, "d6dc0e02-831d-4894-a61a-852bcc74f147");
        assertThat(examPasses.findForGoals(learnerId, List.of(WURF_EXTRA))).isEmpty();
        long unchanged = version();
        assertThatThrownBy(() -> sessions.createFirstPartyLaunch(learnerId,
                new ClaudeV1CoachStartRequest("de", "web-start",
                        new CompletionAssessmentStart("automatic:" + section, HISTORICAL_WURF_EXTRA, unchanged))))
                .isInstanceOf(org.springframework.web.server.ResponseStatusException.class).hasMessageContaining("409");
        assertThat(version()).isEqualTo(unchanged);
        var currentExam = landscapeDefinitions.getGoalDefinition(WURF_EXTRA).getExamData();
        var currentMaterial = AssessmentMaterialRevision.of(currentExam);
        passHessianAssessment(section, WURF_EXTRA, currentExam.getScoring().getPassingPoints());
        assertThat(examPasses.findForGoals(learnerId, List.of(HISTORICAL_WURF_EXTRA))).isEqualTo(history);
        assertThat(examPasses.findForGoals(learnerId, List.of(WURF_EXTRA)).get(WURF_EXTRA)).singleElement().satisfies(pass -> {
            assertThat(pass.earnedPoints()).isEqualTo(currentExam.getScoring().getPassingPoints());
            assertThat(pass.taskRevision()).isEqualTo(currentMaterial.taskRevision());
            assertThat(pass.rubricRevision()).isEqualTo(currentMaterial.rubricRevision());
            assertThat(pass.fingerprint()).isEqualTo(currentMaterial.fingerprint());
            assertThat(pass.planningCreditBindingIds()).isEmpty();
        });
        assertThat(learners.getMastery(learnerId)).containsEntry(HISTORICAL_WURF_EXTRA, 1.0).containsEntry(WURF_EXTRA, 1.0)
                .doesNotContainKey("d6dc0e02-831d-4894-a61a-852bcc74f147");
        // The helper deliberately chooses "Return to ordinary learning" after grading.
        // Prove that exit, then compare the same explicitly selected E.1 assignment as before.
        var ordinary = learners.getLearnerState(learnerId).levelCompletion();
        // The ordinary overview publishes a synthetic default profile without a stored workflow.
        assertThat(ordinary.profileId()).isEqualTo(PROFILE);
        var returnedLearner = learnerRepository.findById(learnerId).orElseThrow();
        assertThat(returnedLearner.getCompletionWorkflow()).isNull();
        assertThat(learners.completionRouteOwnsNavigation(returnedLearner)).isFalse();
        var personalProfile = ordinary.profileOptions().stream().filter(option -> PROFILE.equals(option.profileId()))
                .findFirst().orElseThrow();
        assertThat(ordinary.requiredAssessmentCount()).isEqualTo(personalProfile.requiredAssessmentCount())
                .isGreaterThan(parts.size());
        assertThat(ordinary.masteredAssessmentCount()).isEqualTo(parts.size() + 1);
        learners.chooseLevelCompletion(learnerId, new LevelCompletionActionRequest(
                "selectProfile", "automatic:" + section, null, null, version()));
        var after = learners.getLearnerState(learnerId).levelCompletion();
        assertThat(after.profileId()).isEqualTo(before.profileId());
        var reselectedLearner = learnerRepository.findById(learnerId).orElseThrow();
        assertThat(reselectedLearner.getCompletionWorkflow()).isNotNull();
        assertThat(learners.completionRouteOwnsNavigation(reselectedLearner)).isTrue();
        assertThat(after.requiredAssessmentCount()).isEqualTo(parts.size());
        assertThat(after.masteredAssessmentCount()).isEqualTo(parts.size());
        assertThat(after.unitAssessment()).isEqualTo(before.unitAssessment());
        assertThat(after.assessments()).filteredOn(item -> WURF_EXTRA.equals(item.goalId())).singleElement().satisfies(item -> {
            assertThat(item.mastered()).isTrue();
            assertThat(item.startAvailable()).isFalse();
            assertThat(item.voluntary()).isTrue();
        });
    }

    @ParameterizedTest
    @ValueSource(strings = {"OLD_ID", "LEGACY_ID"})
    void historicalMultiphasePassNeverRecognizesASuccessorOrAddsModelingCredit(String storedIdentity) throws Exception {
        String section = selectHessianMotionUnit("G9", "SekII", "LK");
        var parts = prepareUnitContinuation(section, 4, false);
        learners.chooseLevelCompletion(learnerId, new LevelCompletionActionRequest(
                "selectProfile", "automatic:" + section, null, null, version()));
        String historicalId = "OLD_ID".equals(storedIdentity)
                ? "2b9e565f-d9b4-5e23-b5b7-b7977cecff06" : "73cb58ec-6ded-4a35-9809-32aa8bfff1b0";
        String successorId = "05cfd298-cb80-54c4-a898-b521ef270843";
        String modeling = "d6dc0e02-831d-4894-a61a-852bcc74f147";
        // Byte copy of the reviewed evidence file .../e1-current-assessments-20261124-v1/mp-current/before.goal.json.
        // The completion CI job checks out no evidence folders, so the test reads its own fixture.
        com.fasterxml.jackson.databind.JsonNode historicalGoal;
        try (var fixture = getClass().getResourceAsStream("/fixtures/e1-multiphase-before.goal.json")) {
            historicalGoal = mapper.readTree(java.util.Objects.requireNonNull(fixture, "fixture missing"));
        }
        var historical = mapper.treeToValue(historicalGoal.required("examData"), com.skillpilot.backend.landscape.ExamData.class);
        assertThat(historical.getScoring().getMaxPoints()).isEqualTo(30);
        assertThat(historical.getScoring().getPassingPoints()).isEqualTo(18);
        var revision = AssessmentMaterialRevision.of(historical);
        transactions.executeWithoutResult(status -> examPasses.record(learnerId, historicalId, revision, 18, 30, 18));
        var learner = learnerRepository.findById(learnerId).orElseThrow();
        masteryRepository.saveAndFlush(new Mastery(learner, historicalId, 1.0));
        var history = examPasses.findForGoals(learnerId, List.of(historicalId));
        assertThat(history.get(historicalId)).singleElement().satisfies(pass -> {
            assertThat(pass.earnedPoints()).isEqualTo(18);
            assertThat(pass.maxPoints()).isEqualTo(30);
            assertThat(pass.passingPoints()).isEqualTo(18);
            assertThat(pass.planningCreditBindingIds()).isEmpty();
        });
        var before = learners.getLearnerState(learnerId).levelCompletion();
        assertThat(before.requiredAssessmentCount()).isEqualTo(4);
        assertThat(before.masteredAssessmentCount()).isEqualTo(4);
        assertThat(before.unitAssessment().parts()).allMatch(UnitAssessmentResponse.Part::passed);
        assertThat(before.unitAssessment().planningCreditGoalIds())
                .containsExactly("e4b38061-1f28-43ad-8371-a3e7c0e81856");
        assertThat(learners.getMastery(learnerId)).containsEntry(historicalId, 1.0)
                .doesNotContainKeys(successorId, modeling);
        assertThat(examPasses.findForGoals(learnerId, List.of(successorId))).isEmpty();
        assertThat(before.assessments()).noneMatch(item -> "2b9e565f-d9b4-5e23-b5b7-b7977cecff06".equals(item.goalId())
                || "73cb58ec-6ded-4a35-9809-32aa8bfff1b0".equals(item.goalId()));
        long prior = version();
        for (String unavailable : List.of("2b9e565f-d9b4-5e23-b5b7-b7977cecff06", "73cb58ec-6ded-4a35-9809-32aa8bfff1b0")) {
            assertThatThrownBy(() -> sessions.createFirstPartyLaunch(learnerId,
                    new ClaudeV1CoachStartRequest("de", "web-start",
                            new CompletionAssessmentStart("automatic:" + section, unavailable, prior))))
                    .isInstanceOf(org.springframework.web.server.ResponseStatusException.class).hasMessageContaining("409");
            assertThat(version()).isEqualTo(prior);
        }
        assertThat(before.assessments()).noneMatch(item -> successorId.equals(item.goalId()));
        assertThatThrownBy(() -> sessions.createFirstPartyLaunch(learnerId,
                new ClaudeV1CoachStartRequest("de", "web-start",
                        new CompletionAssessmentStart("automatic:" + section, successorId, prior))))
                .isInstanceOf(org.springframework.web.server.ResponseStatusException.class).hasMessageContaining("409");
        assertThat(version()).isEqualTo(prior);
        assertThat(examPasses.findForGoals(learnerId, List.of(successorId))).isEmpty();
        assertThat(masteryRepository.findByLearner_SkillpilotId(learnerId)).extracting(Mastery::getGoalKey)
                .containsExactlyInAnyOrderElementsOf(java.util.stream.Stream.concat(parts.stream(),
                        java.util.stream.Stream.of(historicalId)).toList());
        assertThat(examPasses.findForGoals(learnerId, List.of(historicalId))).isEqualTo(history);
        assertThat(learners.getMastery(learnerId)).containsEntry(historicalId, 1.0).doesNotContainKey(modeling);
        var after = learners.getLearnerState(learnerId).levelCompletion();
        assertThat(after.requiredAssessmentCount()).isEqualTo(4);
        assertThat(after.masteredAssessmentCount()).isEqualTo(4);
        assertThat(after.unitAssessment().parts()).extracting(UnitAssessmentResponse.Part::goalId)
                .containsExactlyElementsOf(parts);
        assertThat(after.unitAssessment().parts()).allMatch(UnitAssessmentResponse.Part::passed);
        assertThat(after.unitAssessment().planningCreditGoalIds())
                .containsExactly("e4b38061-1f28-43ad-8371-a3e7c0e81856");
    }

    @Test
    void draftSupplementaryAssessmentCannotExemptASectionOrDisappearFromItsPlan() throws Exception {
        String section = selectHessianMotionUnit("G8", "SekII", "LK");
        String physics = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
        // A draft free-fall extra disables the voluntary exception rather than disappearing from E.1.
        var exam = landscapeDefinitions.getGoalDefinition(FREE_FALL_SERIES_EXTRA).getExamData();
        var reviewed = exam.getReviewStatus();
        try {
            exam.setReviewStatus("draft");
            var option = learners.getLearnerState(learnerId).levelCompletion().profileOptions().stream()
                    .filter(row -> row.profileId().equals("automatic:" + section)).findFirst().orElseThrow();
            assertThat(option.assessments()).allMatch(item -> item.voluntary() == null);
            assertThat(option.assessments()).noneMatch(item -> FREE_FALL_SERIES_EXTRA.equals(item.goalId()) && item.startAvailable());
            assertThat(learners.resolveLearningPlanGoalIds(learnerId, physics, List.of(section)))
                    .contains(WURF_EXTRA, FREE_FALL_SERIES_EXTRA).doesNotContain(MULTIPHASE_EXTRA);
        } finally {
            exam.setReviewStatus(reviewed);
        }
    }

    private void passHessianAssessment(String section, String goalId, double points) throws Exception {
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
