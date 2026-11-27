package com.skillpilot.backend.connectors.claude.v1.mcp;

import com.skillpilot.backend.completion.CompletionRouteChoices;
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
        long versionWithRetiredActiveGoal = version();
        var afterRetirement = context();
        assertThat(afterRetirement.get("activeGoal")).isNull();
        // Reading stays read-only: the stored id and the state version are untouched.
        assertThat(version()).isEqualTo(versionWithRetiredActiveGoal);
        assertThat(learnerRepository.findById(learnerId).orElseThrow().getActiveGoalId()).isEqualTo(retiredMixedExam);
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
        return configurePhysicsTestUnit(duration, stage, course, "DE-HE", "physics-e1-motion");
    }

    private String configurePhysicsTestUnit(String duration, String stage, String course,
                                            String jurisdiction, String structureId) throws Exception {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        Map<String, Object> scope = new java.util.HashMap<>(Map.of("selected", true, "filterId", jurisdiction, "stage", stage));
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
        var requested = new java.util.HashMap<>(Map.of("schoolForm", "Gymnasium", "jurisdiction", jurisdiction,
                "stage", stage, "courseProfile", course));
        if (duration != null) requested.put("durationModel", duration);
        String view = (String) compositionViews.findLearnerScopeView("7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a", requested).get("viewId");
        String unitFocus = "composition:" + view + ":structure:" + structureId;
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
        assertThat((List<?>) route.get("choices")).hasSizeLessThanOrEqualTo(CompletionRouteChoices.MAX_CHOICES);
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

    @ParameterizedTest
    @ValueSource(booleans = {false, true})
    void storedSelectionCountsAnOptionalExamOnlyWhenItsAtomWasExplicitlyChosen(boolean explicit) throws Exception {
        String section = selectHessianMotionUnit("G9", "SekII", "GK");
        String physics = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
        String protocol = "e0004439-ed34-5caf-858a-6107918224eb";
        var day = java.time.LocalDate.of(2026, 11, 26);
        var roots = explicit ? List.of(section, WURF_EXTRA) : List.of(section);
        var capturedIds = List.of(protocol, WURF_EXTRA);
        var captured = new LearnerLearningPlanApi.Block("motion", "learning", section, "E.1",
                day, day, null, capturedIds, roots, true);
        var plan = learningPlans.upsert(learnerId, physics,
                new LearnerLearningPlanApi.UpsertRequest(0L, "E.1", List.of(captured)), day);

        // These captures name the same atoms. Only the selected roots tell whether the learner
        // asked for the exam. Other goals of today's section must not enlarge either old plan.
        var row = storedPlans.findById(plan.planId()).orElseThrow();
        String historical = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(List.of(captured));
        row.setBlocksJson(historical);
        storedPlans.saveAndFlush(row);
        var expected = explicit ? capturedIds : List.of(protocol);
        var detail = learningPlans.getPlan(learnerId, physics, day);
        assertThat(detail.stale()).isFalse();
        assertThat(detail.learningScope().goalIds()).containsExactlyElementsOf(expected);
        assertThat(detail.learningScope().targetGoalCount()).isEqualTo(expected.size());
        assertThat(learners.exportLearner(learnerId).data().learningPlans().getFirst().blocks()).containsExactly(captured);
        var afterRead = storedPlans.findById(plan.planId()).orElseThrow();
        assertThat(afterRead.getBlocksJson()).isEqualTo(historical);
        assertThat(afterRead.getRevision()).isEqualTo(plan.revision());
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
            // A backup of this plan restores. The restored plan is the plan as it applies today.
            var archive = learners.exportLearner(learnerId);
            learners.importLearner(learnerId, archive);
            var restored = learningPlans.getPlan(learnerId, physics, today);
            assertThat(restored.stale()).isFalse();
            assertThat(restored.blocks()).isEqualTo(reference.blocks());
            assertThat(learners.exportLearner(learnerId).data().learningPlans().getFirst().blocks())
                    .isEqualTo(reference.blocks());
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

    // A backup restores the learning results also when a plan it holds cannot be read against the
    // curriculum today (Product Owner, 25 November 2026). Such a plan is taken over as the backup
    // held it and marked outdated: it supplies no next step, credit or focus, a readable plan next
    // to it is restored as usual, and saving the plan anew makes it an ordinary plan again. Before,
    // one unreadable plan refused the whole backup.
    @ParameterizedTest
    @CsvSource({"sectionUnknown,true", "sectionUnknown,false", "goalUnknown,true", "onlyRetiredExam,true",
            "nothingCaptured,true", "nothingCaptured,false", "examTopicUnknown,true", "examTopicUnknown,false",
            "landscapeUnknown,true", "landscapeUnknown,false"})
    void backupWithAPlanThatCannotBeReadTodayRestoresTheResultsAndKeepsThePlanAsOutdated(
            String kind, boolean followingPlans) throws Exception {
        String section = selectHessianMotionUnit("G9", "SekII");
        String physics = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
        var today = java.time.LocalDate.now(java.time.ZoneId.of("Europe/Berlin"));
        var monday = today.with(java.time.DayOfWeek.MONDAY);
        var required = learners.resolveLearningPlanGoalIds(learnerId, physics, List.of(section));
        var current = new LearnerLearningPlanApi.Block("section", "learning", section, "E.1", monday, monday,
                null, required, List.of(section), true);
        learningPlans.upsert(learnerId, physics,
                new LearnerLearningPlanApi.UpsertRequest(0L, "E.1", List.of(current)), today);
        var readable = learningPlans.getPlan(learnerId, physics, today);
        assertThat(readable.stale()).isFalse();
        if (followingPlans) {
            transactions.executeWithoutResult(status -> {
                var following = learnerRepository.findById(learnerId).orElseThrow();
                following.setFollowLearningPlans(true);
                learnerRepository.saveAndFlush(following);
            });
        }

        String unknown = UUID.randomUUID().toString();
        // The mixed E.1 exam, retired on 25 November 2026.
        String retired = "a9562b05-c54d-5635-9244-3f7dd24a8642";
        // The last kind is a plan of a landscape the catalog no longer has, next to a readable plan.
        boolean ownLandscape = !kind.equals("landscapeUnknown");
        String landscape = ownLandscape ? physics : unknown;
        var withUnknownGoal = new java.util.ArrayList<>(required);
        withUnknownGoal.add(unknown);
        // The exam day of the fifth kind names a topic that no longer exists, next to a readable block.
        var examDay = new LearnerLearningPlanApi.Block("exam", "milestone", null, "Klausur",
                null, null, monday.plusDays(10), null, List.of(unknown), true);
        List<LearnerLearningPlanApi.Block> unreadable = kind.equals("examTopicUnknown") ? List.of(current, examDay)
                : List.of(switch (kind) {
            case "sectionUnknown" -> new LearnerLearningPlanApi.Block("section", "learning", unknown, "E.1",
                    monday, monday, null, required, List.of(unknown), true);
            case "goalUnknown" -> new LearnerLearningPlanApi.Block("section", "learning", section, "E.1",
                    monday, monday, null, withUnknownGoal, List.of(section), true);
            case "onlyRetiredExam" -> new LearnerLearningPlanApi.Block("exam", "learning", retired, "Meine Prüfung",
                    monday, monday, null, List.of(retired), List.of(retired), true);
            case "nothingCaptured" -> new LearnerLearningPlanApi.Block("section", "learning", section, "E.1",
                    monday, monday, null, List.of(), List.of(section), true);
            default -> current;
        });
        var physicsRecord = storedPlans.findByLearner_SkillpilotIdAndLandscapeId(learnerId, physics).orElseThrow();
        if (ownLandscape) {
            physicsRecord.setBlocksJson(mapper.writeValueAsString(unreadable));
            storedPlans.saveAndFlush(physicsRecord);
            assertThat(learningPlans.getPlan(learnerId, physics, today).stale()).isTrue();
        } else {
            var other = new com.skillpilot.backend.domain.LearnerLearningPlan();
            other.setLearner(learnerRepository.findById(learnerId).orElseThrow());
            other.setLandscapeId(landscape);
            other.setCurriculumId(physicsRecord.getCurriculumId());
            other.setScopeFingerprint("sha256:" + "0".repeat(64));
            other.setRevision(4);
            other.setPlanLabel("Früherer Plan");
            other.setBlocksJson(mapper.writeValueAsString(unreadable));
            other.setCapturedAt(java.time.Instant.now());
            storedPlans.saveAndFlush(other);
        }
        String learned = required.getFirst();
        masteryRepository.saveAndFlush(new Mastery(learners.getLearner(learnerId), learned, 1.0));
        var archive = learners.exportLearner(learnerId);
        assertThat(archive.data().learningPlans()).filteredOn(plan -> landscape.equals(plan.landscapeId()))
                .singleElement().satisfies(plan -> assertThat(plan.blocks()).isEqualTo(unreadable));

        // After the backup the learner loses the result and every plan.
        var lost = masteryRepository.findById(new com.skillpilot.backend.domain.MasteryId(learnerId, learned)).orElseThrow();
        lost.setValue(0.0);
        masteryRepository.saveAndFlush(lost);
        storedPlans.deleteAll(storedPlans.findByLearner_SkillpilotIdOrderByLandscapeIdAsc(learnerId));
        storedPlans.flush();
        assertThat(learners.getMastery(learnerId).getOrDefault(learned, 0.0)).isZero();

        learners.importLearner(learnerId, archive);

        assertThat(learners.getMastery(learnerId)).containsEntry(learned, 1.0);
        var kept = storedPlans.findByLearner_SkillpilotIdAndLandscapeId(learnerId, landscape).orElseThrow();
        assertThat(kept.getCurriculumId())
                .isEqualTo(com.skillpilot.backend.domain.LearnerLearningPlan.RESTORED_OUTDATED_CURRICULUM_ID)
                .isNotEqualTo(learners.getLearner(learnerId).getSelectedCurriculum());
        assertThat(mapper.readValue(kept.getBlocksJson(), new TypeReference<List<LearnerLearningPlanApi.Block>>() { }))
                .isEqualTo(unreadable);
        assertThat(kept.getRevision()).isEqualTo(1L);
        assertThat(kept.getScopeFingerprint()).matches("sha256:[a-f0-9]{64}");
        assertThat(kept.getPlanLabel()).isEqualTo(ownLandscape ? "E.1" : "Früherer Plan");

        // Every reader of plans treats it as outdated, and none of them fails.
        var listed = learningPlans.getPlans(learnerId, today).plans().stream()
                .filter(plan -> landscape.equals(plan.landscapeId())).toList();
        if (ownLandscape) {
            assertThat(listed).singleElement().satisfies(plan -> {
                assertThat(plan.stale()).isTrue();
                assertThat(plan.nextEligibleGoal()).isNull();
                assertThat(plan.canContinue()).isFalse();
            });
        } else {
            // No plan can be saved for a landscape the catalog no longer has. Its plan stays in
            // storage and in later backups, and the plan list does not show it.
            assertThat(listed).isEmpty();
        }
        if (ownLandscape) {
            var outdated = learningPlans.getPlan(learnerId, physics, today);
            assertThat(outdated.stale()).isTrue();
            assertThat(outdated.nextEligibleGoal()).isNull();
            assertThat(outdated.canContinue()).isFalse();
            assertThat(outdated.continueReason()).isIn("personal-curriculum-changed", "learning-plan-following-disabled");
            assertThat(outdated.blocks()).isEqualTo(unreadable);
        } else {
            // The readable plan next to it is restored as usual.
            var restored = learningPlans.getPlan(learnerId, physics, today);
            assertThat(restored.stale()).isFalse();
            assertThat(restored.blocks()).isEqualTo(readable.blocks());
            assertThat(storedPlans.findByLearner_SkillpilotIdAndLandscapeId(learnerId, physics).orElseThrow()
                    .getCurriculumId()).isEqualTo(learners.getLearner(learnerId).getSelectedCurriculum());
        }
        assertThatCode(() -> learningPlans.getTodayStatus(learnerId, "de")).doesNotThrowAnyException();
        assertThatCode(() -> learningPlans.getCoachTodayStatus(learnerId, "de")).doesNotThrowAnyException();
        assertThatCode(() -> learners.getLearnerState(learnerId)).doesNotThrowAnyException();
        String inProgress = learners.getLearner(learnerId).getActiveGoalId();
        assertThatCode(() -> learningPlans.reconcile(learnerId, new LearnerLearningPlanApi.ReconcileRequest(today)))
                .doesNotThrowAnyException();
        if (ownLandscape) {
            // The outdated plan supplies no step: automatic continuation starts nothing.
            assertThat(learners.getLearner(learnerId).getActiveGoalId()).isEqualTo(inProgress);
        }
        assertThatCode(() -> learningPlans.resumeExplicitly(learnerId, new LearnerLearningPlanApi.ReconcileRequest(today)))
                .doesNotThrowAnyException();
        if (followingPlans && !kind.equals("examTopicUnknown")) {
            // An explicit request to continue still finds a goal of the Personal Curriculum. With an
            // exam day the outdated plan offers none while plans are followed (open, see AGENTS.md).
            assertThat(learners.getLearner(learnerId).getActiveGoalId()).isNotNull();
        }
        assertThat(map(context(), "learningPlanToday")).containsEntry("followLearningPlans", followingPlans);
        assertThat(storedPlans.findByLearner_SkillpilotIdAndLandscapeId(learnerId, landscape).orElseThrow())
                .satisfies(read -> {
                    assertThat(read.getCurriculumId())
                            .isEqualTo(com.skillpilot.backend.domain.LearnerLearningPlan.RESTORED_OUTDATED_CURRICULUM_ID);
                    assertThat(read.getRevision()).isEqualTo(1L);
                });

        // A backup of the outdated plan holds the same blocks and restores the same way.
        var second = learners.exportLearner(learnerId);
        assertThat(second.data().learningPlans()).filteredOn(plan -> landscape.equals(plan.landscapeId()))
                .singleElement().satisfies(plan -> assertThat(plan.blocks()).isEqualTo(unreadable));
        learners.importLearner(learnerId, second);
        var again = storedPlans.findByLearner_SkillpilotIdAndLandscapeId(learnerId, landscape).orElseThrow();
        assertThat(again.getCurriculumId())
                .isEqualTo(com.skillpilot.backend.domain.LearnerLearningPlan.RESTORED_OUTDATED_CURRICULUM_ID);
        assertThat(again.getScopeFingerprint()).isEqualTo(kept.getScopeFingerprint());

        if (ownLandscape) {
            // Saving the plan anew makes it an ordinary plan of today's curriculum.
            var repaired = learningPlans.upsert(learnerId, physics,
                    new LearnerLearningPlanApi.UpsertRequest(again.getRevision(), "E.1", List.of(current)), today);
            assertThat(repaired.stale()).isFalse();
            // The goal passed meanwhile stays only where the outdated plan had captured it.
            assertThat(repaired.blocks()).singleElement().satisfies(block -> assertThat(block.atomicGoalIds())
                    .containsAll(required.subList(1, required.size())).isSubsetOf(required));
            assertThat(storedPlans.findByLearner_SkillpilotIdAndLandscapeId(learnerId, physics).orElseThrow()
                    .getCurriculumId()).isEqualTo(learners.getLearner(learnerId).getSelectedCurriculum());
        }
    }

    // Readers of stored plans treat a plan whose exam topic no longer resolves as outdated: they
    // catch the client error of the goal resolution. Before, that caught error had already marked
    // their transaction for rollback, so the plan list of the Cockpit, the plan status, plan
    // continuation and the coach context all ended in a server error. A learner reaches this state
    // by changing the course of the subject, without any backup.
    @ParameterizedTest
    @CsvSource({"courseChanged,true", "courseChanged,false", "topicUnknown,true", "topicUnknown,false"})
    void storedPlanWhoseExamTopicNoLongerResolvesIsOutdatedAndBreaksNoReader(
            String cause, boolean followingPlans) throws Exception {
        String section = selectHessianMotionUnit("G9", "SekII", "GK");
        String physics = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
        var today = java.time.LocalDate.now(java.time.ZoneId.of("Europe/Berlin"));
        var monday = today.with(java.time.DayOfWeek.MONDAY);
        var required = learners.resolveLearningPlanGoalIds(learnerId, physics, List.of(section));
        var learning = new LearnerLearningPlanApi.Block("section", "learning", section, "E.1", monday, monday,
                null, required, List.of(section), true);
        var examDay = new LearnerLearningPlanApi.Block("exam", "milestone", null, "Klausur",
                null, null, monday.plusDays(10), null, List.of(section), true);
        var saved = learningPlans.upsert(learnerId, physics,
                new LearnerLearningPlanApi.UpsertRequest(0L, "E.1 mit Klausur", List.of(learning, examDay)), today);
        assertThat(saved.stale()).isFalse();
        assertThat(saved.nextMilestone().goalIds()).containsExactly(section);

        if (cause.equals("courseChanged")) {
            // The sections of the Leistungskurs view have other ids than those of the Grundkurs view.
            assertThat(configureHessianMotionUnit("G9", "SekII", "LK")).isNotEqualTo(section);
        } else {
            String unknown = UUID.randomUUID().toString();
            var record = storedPlans.findByLearner_SkillpilotIdAndLandscapeId(learnerId, physics).orElseThrow();
            record.setBlocksJson(mapper.writeValueAsString(List.of(learning, new LearnerLearningPlanApi.Block(
                    "exam", "milestone", null, "Klausur", null, null, monday.plusDays(10), null, List.of(unknown), true))));
            storedPlans.saveAndFlush(record);
        }
        if (followingPlans) {
            transactions.executeWithoutResult(status -> {
                var following = learnerRepository.findById(learnerId).orElseThrow();
                following.setFollowLearningPlans(true);
                learnerRepository.saveAndFlush(following);
            });
        }

        assertThat(learningPlans.getPlans(learnerId, today).plans()).singleElement().satisfies(plan -> {
            assertThat(plan.stale()).isTrue();
            assertThat(plan.canContinue()).isFalse();
            assertThat(plan.nextEligibleGoal()).isNull();
        });
        assertThat(learningPlans.getPlan(learnerId, physics, today).stale()).isTrue();
        assertThatCode(() -> learningPlans.getTodayStatus(learnerId, "de")).doesNotThrowAnyException();
        assertThatCode(() -> learningPlans.getCoachTodayStatus(learnerId, "de")).doesNotThrowAnyException();
        assertThatCode(() -> learners.getLearnerState(learnerId)).doesNotThrowAnyException();
        assertThatCode(() -> learningPlans.reconcile(learnerId, new LearnerLearningPlanApi.ReconcileRequest(today)))
                .doesNotThrowAnyException();
        assertThatCode(() -> learningPlans.resumeExplicitly(learnerId, new LearnerLearningPlanApi.ReconcileRequest(today)))
                .doesNotThrowAnyException();
        assertThat(map(context(), "learningPlanToday")).containsEntry("followLearningPlans", followingPlans);
        // The outdated plan limits nothing, with or without plan following (issue #205).
        assertThat(learners.getLearnerState(learnerId).frontier()).isNotEmpty();
    }

    // Product Owner, 26 November 2026 (issue #205): a plan that cannot be evaluated defines no exam
    // scope. Before, such a plan with an exam day closed its subject while plans were followed: no
    // frontier, no resume and no continuation, although the backend tells the coach that plans
    // never limit learning within the Personal Curriculum. The plan status keeps reporting the
    // plan as outdated, and an exam day that can be evaluated binds learning to its topics as before.
    @ParameterizedTest
    @ValueSource(strings = {"courseChanged", "topicUnknown", "storedAsOutdated", "learningGoalUnknown",
            "onlyPausedLearning", "pausedWithUnknownGoalAndNoExamDay"})
    void planWithAnExamDayThatCannotBeEvaluatedLeavesOrdinaryLearningOpen(String cause) throws Exception {
        String section = selectHessianMotionUnit("G9", "SekII", "GK");
        String physics = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
        var today = java.time.LocalDate.now(java.time.ZoneId.of("Europe/Berlin"));
        var monday = today.with(java.time.DayOfWeek.MONDAY);
        var required = learners.resolveLearningPlanGoalIds(learnerId, physics, List.of(section));
        var learning = new LearnerLearningPlanApi.Block("section", "learning", section, "E.1", monday, monday,
                null, required, List.of(section), true);
        var examDay = new LearnerLearningPlanApi.Block("exam", "milestone", null, "Klausur",
                null, null, monday.plusDays(10), null, List.of(section), true);
        learningPlans.upsert(learnerId, physics,
                new LearnerLearningPlanApi.UpsertRequest(0L, "E.1 mit Klausur", List.of(learning, examDay)), today);
        java.util.function.Consumer<Boolean> follow = enabled -> transactions.executeWithoutResult(status -> {
            var following = learnerRepository.findById(learnerId).orElseThrow();
            following.setFollowLearningPlans(enabled);
            learnerRepository.saveAndFlush(following);
        });
        Runnable followPlans = () -> follow.accept(true);
        java.util.function.Supplier<List<String>> subjectFrontier = () -> learners
                .getPersonalCurriculumSubjectFrontier(learnerId, physics).stream().map(goal -> goal.id()).toList();
        followPlans.run();

        // The exam day of a plan that can be evaluated binds learning to its topics.
        assertThat(learningPlans.getPlan(learnerId, physics, today).stale()).isFalse();
        assertThat(learners.getLearnerState(learnerId).frontier()).isNotEmpty()
                .allSatisfy(goal -> assertThat(required).contains(goal.id()));
        assertThat(map(context(), "learningPlanToday")).containsEntry("evaluable", true)
                .containsEntry("resumeAvailable", true);

        var record = storedPlans.findByLearner_SkillpilotIdAndLandscapeId(learnerId, physics).orElseThrow();
        switch (cause) {
            case "courseChanged" -> {
                // The sections of the Leistungskurs view have other ids than those of the Grundkurs view.
                assertThat(configureHessianMotionUnit("G9", "SekII", "LK")).isNotEqualTo(section);
                followPlans.run();
            }
            case "topicUnknown" -> {
                record.setBlocksJson(mapper.writeValueAsString(List.of(learning, new LearnerLearningPlanApi.Block(
                        "exam", "milestone", null, "Klausur", null, null, monday.plusDays(10), null,
                        List.of(UUID.randomUUID().toString()), true))));
                storedPlans.saveAndFlush(record);
            }
            case "storedAsOutdated" -> {
                // As a backup stores a plan it could not read; here the exam topic itself still resolves.
                record.setCurriculumId(com.skillpilot.backend.domain.LearnerLearningPlan.RESTORED_OUTDATED_CURRICULUM_ID);
                storedPlans.saveAndFlush(record);
            }
            case "onlyPausedLearning" -> {
                // The outdated plan pauses all its ordinary learning. A plan that cannot be evaluated
                // defines no such choice either; the continuation the status publishes must work.
                record.setCurriculumId(com.skillpilot.backend.domain.LearnerLearningPlan.RESTORED_OUTDATED_CURRICULUM_ID);
                record.setBlocksJson(mapper.writeValueAsString(List.of(new LearnerLearningPlanApi.Block("section",
                        "learning", section, "E.1", monday, monday, null, required, List.of(section), false), examDay)));
                storedPlans.saveAndFlush(record);
            }
            case "pausedWithUnknownGoalAndNoExamDay" -> {
                // No exam day, the curriculum is unchanged, and all learning of the plan is paused: a
                // pause narrows learning to nothing. The plan names a goal the scope of the learner
                // does not know, so it cannot be evaluated and defines no pause either (found by the
                // independent reviews of issue #216).
                var unknown = new java.util.ArrayList<>(required);
                unknown.add(UUID.randomUUID().toString());
                record.setBlocksJson(mapper.writeValueAsString(List.of(new LearnerLearningPlanApi.Block("section",
                        "learning", section, "E.1", monday, monday, null, unknown, List.of(section), false))));
                storedPlans.saveAndFlush(record);
            }
            default -> {
                // The curriculum is unchanged and the exam topic resolves, but the plan names a goal
                // the scope of the learner does not know.
                var unknown = new java.util.ArrayList<>(required);
                unknown.add(UUID.randomUUID().toString());
                record.setBlocksJson(mapper.writeValueAsString(List.of(new LearnerLearningPlanApi.Block("section",
                        "learning", section, "E.1", monday, monday, null, unknown, List.of(section), true), examDay)));
                storedPlans.saveAndFlush(record);
            }
        }

        assertThat(learningPlans.getPlan(learnerId, physics, today).stale()).isTrue();
        assertThat(learners.getLearnerState(learnerId).frontier()).isNotEmpty();
        // The plan narrows nothing: the subject offers what it offers without plan following.
        List<String> offered = subjectFrontier.get();
        follow.accept(false);
        assertThat(offered).isNotEmpty().isEqualTo(subjectFrontier.get());
        followPlans.run();
        var status = map(context(), "learningPlanToday");
        assertThat(status).containsEntry("followLearningPlans", true).containsEntry("resumeAvailable", true)
                .containsEntry("evaluable", false);
        var subject = ((List<?>) status.get("subjects")).stream().map(Map.class::cast)
                .filter(entry -> entry.get("subject").toString().startsWith("Physik")).findFirst().orElseThrow();
        assertThat(subject.get("canContinue")).isEqualTo(true);
        assertThat(subject.get("evaluable")).isEqualTo(false);

        // The explicit continuation of the coach picks a goal of the Personal Curriculum.
        var resumed = successful(ClaudeV1Contract.TOOL_RESUME_LEARNING_PLAN,
                writeArgs("resume-" + cause, version(), Map.of()));
        String active = learners.getLearner(learnerId).getActiveGoalId();
        assertThat(active).isNotNull();
        assertThat(map(map(resumed, "context"), "activeGoal")).containsEntry("id", active);
        assertThat(learners.getPlanningScope(learnerId, physics).scopeAtomicGoalIds()).contains(active);
        assertThat(learningPlans.getPlan(learnerId, physics, today).stale()).isTrue();
    }

    // The learning path of a subject holds prerequisites of other subjects. They must not draw the
    // exam of another subject into an explicit request for this subject: the Mathematics exam binds
    // Mathematics, and Physics, whose own plan cannot be evaluated, stays open (issue #205).
    @ParameterizedTest
    @ValueSource(booleans = {false, true})
    void examOfAnotherSubjectDoesNotCloseASubjectWhosePlanCannotBeEvaluated(boolean autoPilot) throws Exception {
        String section = selectHessianMotionUnit("G9", "SekII", "GK");
        String physics = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        var curriculum = mapper.readValue(learner.getPersonalCurriculum(), com.fasterxml.jackson.databind.node.ObjectNode.class);
        curriculum.set(MATH, mapper.valueToTree(Map.of("selected", true, "filterId", "GK")));
        learner.setPersonalCurriculum(mapper.writeValueAsString(curriculum));
        learner.setAutoPilot(autoPilot);
        learnerRepository.saveAndFlush(learner);
        var today = java.time.LocalDate.now(java.time.ZoneId.of("Europe/Berlin"));
        var monday = today.with(java.time.DayOfWeek.MONDAY);
        var required = learners.resolveLearningPlanGoalIds(learnerId, physics, List.of(section));
        learningPlans.upsert(learnerId, physics, new LearnerLearningPlanApi.UpsertRequest(0L, "E.1 mit Klausur", List.of(
                new LearnerLearningPlanApi.Block("section", "learning", section, "E.1", monday, monday,
                        null, required, List.of(section), true),
                new LearnerLearningPlanApi.Block("exam", "milestone", null, "Klausur",
                        null, null, monday.plusDays(10), null, List.of(section), true))), today);
        java.util.function.Function<String, List<String>> subjectFrontier = subject -> learners
                .getPersonalCurriculumSubjectFrontier(learnerId, subject).stream().map(goal -> goal.id()).toList();
        // What Physics offers in ordinary learning holds a Mathematics prerequisite. The exam topic
        // is another Mathematics goal, so that this prerequisite lies outside the exam.
        List<String> ordinaryPhysics = subjectFrontier.apply(physics);
        java.util.function.Predicate<String> isMath = id -> MATH.equals(landscapeDefinitions.getLandscapeIdForGoal(id));
        assertThat(ordinaryPhysics).anyMatch(isMath).anyMatch(isMath.negate());
        // "Definition des Skalarprodukts mithilfe orthogonaler Projektionen veranschaulichen"
        String mathGoal = "3016ec37-1c2e-47db-83f5-e767923bc97e";
        assertThat(ordinaryPhysics).doesNotContain(mathGoal);
        learningPlans.upsert(learnerId, MATH, new LearnerLearningPlanApi.UpsertRequest(0L, "Mathematik mit Klausur", List.of(
                new LearnerLearningPlanApi.Block("topic", "learning", mathGoal, "Mathematik", monday, monday.plusDays(4),
                        null, List.of(mathGoal), List.of(mathGoal), true),
                new LearnerLearningPlanApi.Block("exam", "milestone", null, "Klausur",
                        null, null, monday.plusDays(10), null, List.of(mathGoal), true))), today);
        transactions.executeWithoutResult(status -> {
            var following = learnerRepository.findById(learnerId).orElseThrow();
            following.setFollowLearningPlans(true);
            learnerRepository.saveAndFlush(following);
        });
        // Both exams can be evaluated: each binds its own subject.
        assertThat(subjectFrontier.apply(physics)).isNotEmpty().allSatisfy(id -> assertThat(required).contains(id));
        assertThat(subjectFrontier.apply(MATH)).isSubsetOf(mathGoal);

        var outdated = storedPlans.findByLearner_SkillpilotIdAndLandscapeId(learnerId, physics).orElseThrow();
        outdated.setCurriculumId(com.skillpilot.backend.domain.LearnerLearningPlan.RESTORED_OUTDATED_CURRICULUM_ID);
        storedPlans.saveAndFlush(outdated);
        assertThat(learningPlans.getPlan(learnerId, physics, today).stale()).isTrue();
        assertThat(learningPlans.getPlan(learnerId, MATH, today).stale()).isFalse();

        List<String> physicsOpen = subjectFrontier.apply(physics);
        // The Mathematics exam keeps binding Mathematics, also where Physics needs Mathematics: a
        // Mathematics prerequisite outside the exam is not offered, because it could not be
        // started. Every Physics goal of ordinary learning is offered; neither plan narrows them.
        assertThat(subjectFrontier.apply(MATH)).isSubsetOf(mathGoal);
        assertThat(physicsOpen).isNotEmpty()
                .isEqualTo(ordinaryPhysics.stream().filter(isMath.negate()).toList());

        var status = map(context(), "learningPlanToday");
        var subjects = ((List<?>) status.get("subjects")).stream().map(Map.class::cast).toList();
        var mathEntry = subjects.stream().filter(entry -> entry.get("subject").toString().startsWith("Mathematik"))
                .findFirst().orElseThrow();
        var physicsEntry = subjects.stream().filter(entry -> entry.get("subject").toString().startsWith("Physik"))
                .findFirst().orElseThrow();
        assertThat(mathEntry.get("evaluable")).isEqualTo(true);
        assertThat(physicsEntry.get("evaluable")).isEqualTo(false);
        // The learner may name Physics with and without AutoPilot (Product Owner, 26 November
        // 2026), and the published switch starts a goal there.
        assertThat(physicsEntry.get("canContinue")).isEqualTo(true);
        successful(ClaudeV1Contract.TOOL_SWITCH_LEARNING_PLAN_SUBJECT,
                writeArgs("explicit-physics", version(), Map.of("subject", physicsEntry.get("subject"))));
        assertThat(learners.getLearner(learnerId).getActiveGoalId()).isEqualTo(physicsOpen.getFirst());
    }

    // Product Owner, 26 November 2026: during an exam that can be evaluated, a subject the learner
    // names can be chosen in chat also with AutoPilot. "Continue" without a subject leads to the
    // exam as before. Before, AutoPilot published no other subject while an exam was bound, and an
    // exam whose topic cannot start yet left no learning step in chat at all.
    @ParameterizedTest
    @CsvSource({"false,true,resume", "true,true,resume", "false,true,nameTwice", "true,true,nameTwice",
            "false,false,name", "true,false,name"})
    void aNamedSubjectCanBeChosenDuringAnExamAlsoWithAutoPilot(boolean autoPilot, boolean examCanStart, String action)
            throws Exception {
        selectHessianMotionUnit("G9", "SekII", "GK");
        String physics = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        var curriculum = mapper.readValue(learner.getPersonalCurriculum(), com.fasterxml.jackson.databind.node.ObjectNode.class);
        curriculum.set(MATH, mapper.valueToTree(Map.of("selected", true, "filterId", "GK")));
        learner.setPersonalCurriculum(mapper.writeValueAsString(curriculum));
        learner.setAutoPilot(autoPilot);
        learnerRepository.saveAndFlush(learner);
        var today = java.time.LocalDate.now(java.time.ZoneId.of("Europe/Berlin"));
        var monday = today.with(java.time.DayOfWeek.MONDAY);
        java.util.function.Function<String, List<String>> subjectFrontier = subject -> learners
                .getPersonalCurriculumSubjectFrontier(learnerId, subject).stream().map(goal -> goal.id()).toList();
        // The exam topic is either the first Mathematics goal, which can start at once, or
        // "Definition des Skalarprodukts ... veranschaulichen", whose prerequisite is still open.
        // Physics has no plan at all.
        String mathGoal = examCanStart ? subjectFrontier.apply(MATH).getFirst() : "3016ec37-1c2e-47db-83f5-e767923bc97e";
        learningPlans.upsert(learnerId, MATH, new LearnerLearningPlanApi.UpsertRequest(0L, "Mathematik mit Klausur", List.of(
                new LearnerLearningPlanApi.Block("topic", "learning", mathGoal, "Mathematik", monday, monday.plusDays(4),
                        null, List.of(mathGoal), List.of(mathGoal), true),
                new LearnerLearningPlanApi.Block("exam", "milestone", null, "Klausur",
                        null, null, monday.plusDays(10), null, List.of(mathGoal), true))), today);
        transactions.executeWithoutResult(status -> {
            var following = learnerRepository.findById(learnerId).orElseThrow();
            following.setFollowLearningPlans(true);
            learnerRepository.saveAndFlush(following);
        });
        List<String> physicsOpen = subjectFrontier.apply(physics);
        assertThat(physicsOpen).isNotEmpty();

        var status = map(context(), "learningPlanToday");
        assertThat(status).containsEntry("resumeAvailable", examCanStart);
        var subjects = ((List<?>) status.get("subjects")).stream().map(Map.class::cast).toList();
        var mathEntry = subjects.stream().filter(entry -> entry.get("subject").toString().startsWith("Mathematik"))
                .findFirst().orElseThrow();
        var physicsEntry = subjects.stream().filter(entry -> entry.get("subject").toString().startsWith("Physik"))
                .findFirst().orElseThrow();
        assertThat(mathEntry.get("evaluable")).isEqualTo(true);
        assertThat(physicsEntry.get("canContinue")).as("the named subject is published").isEqualTo(true);
        if (action.equals("resume")) {
            successful(ClaudeV1Contract.TOOL_RESUME_LEARNING_PLAN, writeArgs("resume-exam", version(), Map.of()));
            assertThat(learners.getLearner(learnerId).getActiveGoalId()).as("continue leads to the exam").isEqualTo(mathGoal);
        } else if (action.equals("nameTwice")) {
            // The Physics path starts with a Mathematics foundation, which the running exam admits.
            // While that step is running, Physics has nothing to switch to and is no longer offered
            // as a choice. Before, it stayed offered, and the repeated request was refused.
            successful(ClaudeV1Contract.TOOL_SWITCH_LEARNING_PLAN_SUBJECT,
                    writeArgs("named-physics-first", version(), Map.of("subject", physicsEntry.get("subject"))));
            String started = learners.getLearner(learnerId).getActiveGoalId();
            assertThat(started).isEqualTo(physicsOpen.getFirst());
            assertThat(landscapeDefinitions.getLandscapeIdForGoal(started)).as("a foundation of another subject").isEqualTo(MATH);
            var after = ((List<?>) map(context(), "learningPlanToday").get("subjects")).stream().map(Map.class::cast).toList();
            assertThat(after.stream().filter(entry -> entry.get("subject").toString().startsWith("Physik")))
                    .allSatisfy(entry -> assertThat(entry.get("canContinue")).as("nothing to switch to").isEqualTo(false));
            assertThat(learners.getLearner(learnerId).getActiveGoalId()).isEqualTo(started);
        } else {
            // The exam offers no step; the named subject does.
            successful(ClaudeV1Contract.TOOL_SWITCH_LEARNING_PLAN_SUBJECT,
                    writeArgs("named-physics", version(), Map.of("subject", physicsEntry.get("subject"))));
            String active = learners.getLearner(learnerId).getActiveGoalId();
            assertThat(active).as("the named subject starts the first goal it offers").isEqualTo(physicsOpen.getFirst());
            assertThat(landscapeDefinitions.getLandscapeIdForGoal(active)).isEqualTo(physics);
        }
    }

    // A plan that is not well formed is no outdated plan. Its backup is refused as before, and the
    // refusal changes nothing: neither the results nor the plans the learner has.
    @Test void backupWithAMalformedPlanIsStillRefusedAndChangesNothing() throws Exception {
        String section = selectHessianMotionUnit("G9", "SekII");
        String physics = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
        var today = java.time.LocalDate.now(java.time.ZoneId.of("Europe/Berlin"));
        var monday = today.with(java.time.DayOfWeek.MONDAY);
        var required = learners.resolveLearningPlanGoalIds(learnerId, physics, List.of(section));
        var current = new LearnerLearningPlanApi.Block("section", "learning", section, "E.1", monday, monday,
                null, required, List.of(section), true);
        learningPlans.upsert(learnerId, physics,
                new LearnerLearningPlanApi.UpsertRequest(0L, "E.1", List.of(current)), today);
        var record = storedPlans.findByLearner_SkillpilotIdAndLandscapeId(learnerId, physics).orElseThrow();
        String valid = record.getBlocksJson();
        String learned = required.getFirst();
        masteryRepository.saveAndFlush(new Mastery(learners.getLearner(learnerId), learned, 1.0));
        // A learning block without dates, next to goals that no longer exist.
        record.setBlocksJson(mapper.writeValueAsString(List.of(new LearnerLearningPlanApi.Block("section", "learning",
                section, "E.1", null, null, null, List.of(UUID.randomUUID().toString()), List.of(section), true))));
        storedPlans.saveAndFlush(record);
        var archive = learners.exportLearner(learnerId);

        record.setBlocksJson(valid);
        storedPlans.saveAndFlush(record);
        var lost = masteryRepository.findById(new com.skillpilot.backend.domain.MasteryId(learnerId, learned)).orElseThrow();
        lost.setValue(0.0);
        masteryRepository.saveAndFlush(lost);

        assertThatThrownBy(() -> learners.importLearner(learnerId, archive))
                .isInstanceOfSatisfying(org.springframework.web.server.ResponseStatusException.class,
                        exception -> assertThat(exception.getStatusCode().value()).isEqualTo(400));
        assertThat(learners.getMastery(learnerId).getOrDefault(learned, 0.0)).isZero();
        assertThat(storedPlans.findByLearner_SkillpilotIdAndLandscapeId(learnerId, physics).orElseThrow())
                .satisfies(kept -> {
                    assertThat(kept.getBlocksJson()).isEqualTo(valid);
                    assertThat(kept.getCurriculumId()).isEqualTo(learners.getLearner(learnerId).getSelectedCurriculum());
                });
    }

    // A regrouping of the curriculum moves goals to another section. A plan that existed before keeps
    // the goals it captured (Product Owner, 24 November 2026: old plans stay valid as long as they
    // still work): when it is read, when a backup of it is restored and when it is edited. A newly
    // selected goal must lie under the section of its block, as before, and a kept goal stays only
    // in a block that names the same sections as the block it was captured in.
    @ParameterizedTest
    @ValueSource(strings = {"GK", "LK"})
    void existingPlanKeepsGoalsThatARegroupingMovedToAnotherSection(String course) throws Exception {
        String section = selectHessianMotionUnit("G9", "SekII", course);
        String physics = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
        var today = java.time.LocalDate.now(java.time.ZoneId.of("Europe/Berlin"));
        var monday = today.with(java.time.DayOfWeek.MONDAY);
        var currentSection = learners.resolveLearningPlanGoalIds(learnerId, physics, List.of(section));
        // The E.1 cut of 23 November 2026 moved road traffic to E.2 and reference frames to E.3.
        List<String> moved = List.of("4a2bf015-052b-4af0-aed7-324259fa1a8a", "68c90ba6-c438-463c-9a53-cf61062d416a");
        assertThat(currentSection).doesNotContainAnyElementsOf(moved);
        assertThat(learners.getPlanningScope(learnerId, physics).scopeAtomicGoalIds()).containsAll(moved);
        var current = new LearnerLearningPlanApi.Block("section", "learning", section, "E.1", monday, monday,
                null, currentSection, List.of(section), true);
        var created = learningPlans.upsert(learnerId, physics,
                new LearnerLearningPlanApi.UpsertRequest(0L, "E.1", List.of(current)), today);

        // The same section as a plan stored before the cut.
        var captured = new java.util.ArrayList<>(currentSection);
        captured.addAll(moved);
        var stored = learners.orderLearningPlanBlocksByPrerequisites(learnerId, List.of(
                new LearnerLearningPlanApi.Block("section", "learning", section, "E.1", monday, monday,
                        null, captured, List.of(section), true)));
        var record = storedPlans.findByLearner_SkillpilotIdAndLandscapeId(learnerId, physics).orElseThrow();
        record.setBlocksJson(mapper.writeValueAsString(stored));
        storedPlans.saveAndFlush(record);
        String capturedFingerprint = record.getScopeFingerprint();
        long capturedRevision = record.getRevision();
        var plan = learningPlans.getPlan(learnerId, physics, today);
        assertThat(plan.stale()).isFalse();
        assertThat(plan.blocks()).isEqualTo(stored);
        assertThat(plan.blocks().getFirst().atomicGoalIds()).containsAll(moved);
        assertThat(plan.nextEligibleGoal()).isNotNull();
        assertThat(learners.exportLearner(learnerId).data().learningPlans().getFirst().blocks()).isEqualTo(stored);
        // Reading rewrites nothing: the stored capture keeps its fingerprint and revision.
        assertThat(storedPlans.findByLearner_SkillpilotIdAndLandscapeId(learnerId, physics).orElseThrow())
                .satisfies(read -> {
                    assertThat(read.getScopeFingerprint()).isEqualTo(capturedFingerprint);
                    assertThat(read.getRevision()).isEqualTo(capturedRevision);
                    assertThat(read.getBlocksJson()).isEqualTo(mapper.writeValueAsString(stored));
                });

        // A backup of it restores with the same goals. The restore is a new capture: it starts
        // at revision 1 with a fingerprint of today's graph.
        learners.importLearner(learnerId, learners.exportLearner(learnerId));
        var restored = learningPlans.getPlan(learnerId, physics, today);
        assertThat(restored.stale()).isFalse();
        assertThat(restored.blocks()).isEqualTo(stored);
        assertThat(restored.revision()).isEqualTo(1L);
        assertThat(storedPlans.findByLearner_SkillpilotIdAndLandscapeId(learnerId, physics).orElseThrow()
                .getScopeFingerprint()).isEqualTo(learners.learningPlanFingerprint(
                        learnerId, physics, stored, LearnerService.learningPlanCapturedSelections(stored)));

        // Editing keeps what the plan had captured.
        var renamed = learningPlans.upsert(learnerId, physics,
                new LearnerLearningPlanApi.UpsertRequest(restored.revision(), "E.1 vor dem Zuschnitt", stored), today);
        assertThat(renamed.stale()).isFalse();
        assertThat(renamed.blocks().getFirst().atomicGoalIds()).containsExactlyInAnyOrderElementsOf(captured);

        // Splitting the block keeps them too: each part names the sections they were captured with.
        var split = learners.orderLearningPlanBlocksByPrerequisites(learnerId, List.of(
                new LearnerLearningPlanApi.Block("section", "learning", section, "E.1", monday, monday,
                        null, currentSection, List.of(section), true),
                new LearnerLearningPlanApi.Block("moved", "learning", section, "E.1, verschoben", monday, monday,
                        null, moved, List.of(section), true)));
        var divided = learningPlans.upsert(learnerId, physics,
                new LearnerLearningPlanApi.UpsertRequest(renamed.revision(), "E.1 geteilt", split), today);
        assertThat(divided.stale()).isFalse();
        assertThat(divided.blocks().stream().flatMap(block -> block.atomicGoalIds().stream()).toList())
                .containsExactlyInAnyOrderElementsOf(captured);
        var rejoined = learningPlans.upsert(learnerId, physics,
                new LearnerLearningPlanApi.UpsertRequest(divided.revision(), "E.1 vor dem Zuschnitt", stored), today);
        assertThat(rejoined.blocks()).isEqualTo(stored);

        // A kept goal stays only in a block with the sections it was captured with. Naming another
        // section, or one more, is a new selection and is checked like one. Which of several
        // sections a goal came from is not stored, so a second section must not become a place of
        // the goal that a later edit could leave it with.
        String forces = section.replace(":structure:physics-e1-motion", ":structure:physics-e2-newton-and-conservation");
        var forcesGoals = learners.resolveLearningPlanGoalIds(learnerId, physics, List.of(forces));
        assertThat(forcesGoals).contains(moved.getFirst()).doesNotContain(moved.getLast());
        for (var refocused : List.of(
                // the whole block under the other section
                List.of(new LearnerLearningPlanApi.Block("section", "learning", forces, "E.2", monday, monday,
                        null, captured, List.of(forces), true)),
                // the kept goals in a new block under the other section
                List.of(new LearnerLearningPlanApi.Block("section", "learning", section, "E.1", monday, monday,
                                null, currentSection, List.of(section), true),
                        new LearnerLearningPlanApi.Block("moved", "learning", forces, "E.2", monday, monday,
                                null, moved, List.of(forces), true)),
                // the block names E.2 next to E.1: reference frames lie under neither
                List.of(new LearnerLearningPlanApi.Block("section", "learning", section, "E.1 und E.2", monday, monday,
                        null, captured, List.of(section, forces), true)),
                // both kept goals under one of them as their focus
                List.of(new LearnerLearningPlanApi.Block("section", "learning", section, "E.1", monday, monday,
                                null, currentSection, List.of(section), true),
                        new LearnerLearningPlanApi.Block("moved", "learning", moved.getFirst(), "Verkehr", monday, monday,
                                null, moved, List.of(moved.getFirst()), true)))) {
            assertThatThrownBy(() -> learningPlans.upsert(learnerId, physics,
                    new LearnerLearningPlanApi.UpsertRequest(rejoined.revision(), "Umgehängt", refocused), today))
                    .hasMessageContaining("not a subject-local ancestor");
        }
        // Placing a kept goal under the section that holds it today is an ordinary valid selection.
        var replaced = learningPlans.upsert(learnerId, physics,
                new LearnerLearningPlanApi.UpsertRequest(rejoined.revision(), "Verkehr in E.2", List.of(
                        new LearnerLearningPlanApi.Block("section", "learning", section, "E.1", monday, monday,
                                null, currentSection, List.of(section), true),
                        new LearnerLearningPlanApi.Block("traffic", "learning", forces, "E.2", monday, monday,
                                null, List.of(moved.getFirst()), List.of(forces), true))), today);
        assertThat(replaced.stale()).isFalse();
        var restoredAgain = learningPlans.upsert(learnerId, physics,
                new LearnerLearningPlanApi.UpsertRequest(replaced.revision(), "E.1", List.of(
                        new LearnerLearningPlanApi.Block("section", "learning", section, "E.1", monday, monday,
                                null, currentSection, List.of(section), true))), today);
        // Once a goal has left the plan, it is no longer kept: it would be a new selection.
        assertThatThrownBy(() -> learningPlans.upsert(learnerId, physics,
                new LearnerLearningPlanApi.UpsertRequest(restoredAgain.revision(), "Wieder aufgenommen", stored), today))
                .hasMessageContaining("not a subject-local ancestor");
        var again = storedPlans.findByLearner_SkillpilotIdAndLandscapeId(learnerId, physics).orElseThrow();
        again.setBlocksJson(mapper.writeValueAsString(stored));
        storedPlans.saveAndFlush(again);

        // A goal that the plan did not hold before must lie under the section of its block.
        String newtonOne = "31a2ef52-114b-4d2c-a720-6ef5a390b6dc";
        assertThat(captured).doesNotContain(newtonOne);
        var widened = new java.util.ArrayList<>(captured);
        widened.add(newtonOne);
        long revision = again.getRevision();
        assertThatThrownBy(() -> learningPlans.upsert(learnerId, physics,
                new LearnerLearningPlanApi.UpsertRequest(revision, "Erweitert", List.of(
                        new LearnerLearningPlanApi.Block("section", "learning", section, "E.1", monday, monday,
                                null, widened, List.of(section), true))), today))
                .hasMessageContaining("not a subject-local ancestor");
        // A new plan cannot start with goals outside the section of its block.
        storedPlans.delete(storedPlans.findByLearner_SkillpilotIdAndLandscapeId(learnerId, physics).orElseThrow());
        storedPlans.flush();
        assertThatThrownBy(() -> learningPlans.upsert(learnerId, physics,
                new LearnerLearningPlanApi.UpsertRequest(0L, "Neu", stored), today))
                .hasMessageContaining("not a subject-local ancestor");
        assertThat(created.revision()).isPositive();

        // The same holds without any regrouping: a block of two sections cannot hand a goal of one
        // section on to the other by dropping the first.
        var bothSections = learners.resolveLearningPlanGoalIds(learnerId, physics, List.of(section, forces));
        var joint = learningPlans.upsert(learnerId, physics, new LearnerLearningPlanApi.UpsertRequest(0L, "E.1 und E.2",
                learners.orderLearningPlanBlocksByPrerequisites(learnerId, List.of(
                        new LearnerLearningPlanApi.Block("both", "learning", section, "E.1 und E.2", monday, monday,
                                null, bothSections, List.of(section, forces), true)))), today);
        assertThat(joint.stale()).isFalse();
        String onlyInMotion = currentSection.stream().filter(id -> !forcesGoals.contains(id)).findFirst().orElseThrow();
        var carried = new java.util.ArrayList<>(forcesGoals);
        carried.add(onlyInMotion);
        assertThatThrownBy(() -> learningPlans.upsert(learnerId, physics,
                new LearnerLearningPlanApi.UpsertRequest(joint.revision(), "Nur E.2", List.of(
                        new LearnerLearningPlanApi.Block("both", "learning", forces, "E.2", monday, monday,
                                null, carried, List.of(forces), true))), today))
                .hasMessageContaining("not a subject-local ancestor");
    }

    // Issue #197: a plan block may name several sections. Its goals then run under their own
    // focus, as explicit individual choices: the opening of the outer unit comes first, then the
    // opening of the goal's own unit. The plan view, the continuation and the handoff after a
    // passed goal judge the goal under that same focus, so they agree on the next step, and what
    // is announced starts. Before, the selection judged under all sections of the block: it
    // announced the opening of the child unit while the opening of E.1 was stored, and with the
    // child's opening passed it announced a step and started nothing.
    @ParameterizedTest
    @CsvSource({"false,bothOpen", "true,bothOpen", "false,childPassed", "true,childPassed",
            "false,parentPassed", "true,parentPassed"})
    void blockWithSeveralSectionsAnnouncesAndStoresTheSameStepOnEveryPath(boolean pilot, String openings) throws Exception {
        Object pilotBefore = org.springframework.test.util.ReflectionTestUtils.getField(learners, "unitAssessmentPilotEnabled");
        org.springframework.test.util.ReflectionTestUtils.setField(learners, "unitAssessmentPilotEnabled", pilot);
        try {
            String motion = selectHessianMotionUnit("G9", "SekII", "GK");
            String magnet = motion.replace(":structure:physics-e1-motion", ":structure:physics-current-magnetic-fields-0bd4a459");
            String child = motion.replace(":structure:physics-e1-motion", ":structure:physics-e1-accelerated-and-free-fall");
            String anchor = "b4175564-4397-5c08-90ba-4f13231a75ec";
            String target = "8aff7aac-321b-5172-ac55-877876bfd2cd";
            String physics = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
            var today = java.time.LocalDate.now(java.time.ZoneId.of("Europe/Berlin"));
            var monday = today.with(java.time.DayOfWeek.MONDAY);
            List<String> roots = List.of(child, magnet);
            learners.setPlannedGoals(learnerId, java.util.Set.of(magnet));
            learningPlans.upsert(learnerId, physics, new LearnerLearningPlanApi.UpsertRequest(0L, "Messplan", List.of(
                    new LearnerLearningPlanApi.Block("both", "learning", child, "Messen", monday, monday, null,
                            List.of(anchor, target), roots, true))), today);
            var learner = learnerRepository.findById(learnerId).orElseThrow();
            var graph = new CompletionProfileCompiler().normalizePrerequisites(
                    learners.getLearningPlanCompletionContext(learnerId).canonicalGoals());
            var passed = new java.util.LinkedHashSet<>(graph.transitivePrerequisites(anchor));
            passed.addAll(graph.transitivePrerequisites(target));
            passed.removeAll(List.of(anchor, target, MOTION_OPENING, FALL_OPENING));
            if (openings.equals("parentPassed")) passed.add(MOTION_OPENING);
            if (openings.equals("childPassed")) passed.add(FALL_OPENING);
            masteryRepository.saveAllAndFlush(passed.stream().map(id -> new Mastery(learner, id, 1.0)).toList());
            learners.setPreferences(learnerId, null, false, true, null, true);
            learners.setPlannedGoals(learnerId, java.util.Set.of(magnet));
            learners.setActiveGoal(learnerId, anchor);
            var originalFocus = focus.findByLearner_SkillpilotId(learnerId).stream().map(PlannedGoal::getGoalId).toList();
            assertThat(learningPlans.getPlan(learnerId, physics, today).stale()).isFalse();
            // The outer opening first; the child's own opening once the outer one is passed.
            String expected = openings.equals("parentPassed") ? FALL_OPENING : MOTION_OPENING;

            // The handoff after the passed goal.
            learners.setMastery(learnerId, new com.skillpilot.backend.api.MasteryUpdateRequest(Map.of(anchor, 1.0), anchor));
            var afterHandoff = learnerRepository.findById(learnerId).orElseThrow();
            String handoffActive = afterHandoff.getActiveGoalId();
            var handoffFocus = focus.findByLearner_SkillpilotId(learnerId).stream().map(PlannedGoal::getGoalId).toList();

            // The same state reached by a fresh continuation: only the navigation is undone.
            var reset = learnerRepository.findById(learnerId).orElseThrow();
            reset.setActiveGoalId(null);
            reset.setPendingUnitEntry(null);
            learnerRepository.saveAndFlush(reset);
            focus.deleteAll(focus.findByLearner_SkillpilotId(learnerId));
            focus.flush();
            for (String id : originalFocus) focus.save(new PlannedGoal(reset, id));
            focus.flush();
            var view = learningPlans.getPlan(learnerId, physics, today).nextEligibleGoal();
            var resumed = learningPlans.reconcile(learnerId, new LearnerLearningPlanApi.ReconcileRequest(today));
            var afterResume = learnerRepository.findById(learnerId).orElseThrow();
            var resumeFocus = focus.findByLearner_SkillpilotId(learnerId).stream().map(PlannedGoal::getGoalId).toList();

            assertThat(handoffActive).as("handoff starts").isEqualTo(expected);
            assertThat(view).as("plan view announces").isNotNull();
            assertThat(view.goalId()).as("plan view announces").isEqualTo(expected);
            assertThat(resumed.activeGoalId()).as("continuation reports").isEqualTo(expected);
            assertThat(afterResume.getActiveGoalId()).as("continuation stores").isEqualTo(expected);
            assertThat(resumeFocus).as("both paths store the same focus").isEqualTo(handoffFocus)
                    .containsExactly(target);
            assertThat(resumed.focusGoalId()).as("continuation reports the stored focus").isEqualTo(target);

            // The announced step leads on to the planned goal: each passed opening hands over to the
            // next one, and the last to the goal itself.
            List<String> remaining = switch (openings) {
                case "bothOpen" -> List.of(MOTION_OPENING, FALL_OPENING);
                case "childPassed" -> List.of(MOTION_OPENING);
                default -> List.of(FALL_OPENING);
            };
            for (int step = 0; step < remaining.size(); step++) {
                String opening = remaining.get(step);
                assertThat(learnerRepository.findById(learnerId).orElseThrow().getActiveGoalId()).isEqualTo(opening);
                learners.setMastery(learnerId, new com.skillpilot.backend.api.MasteryUpdateRequest(Map.of(opening, 1.0), opening));
                assertThat(learnerRepository.findById(learnerId).orElseThrow().getActiveGoalId())
                        .as("after the opening " + opening)
                        .isEqualTo(step + 1 < remaining.size() ? remaining.get(step + 1) : target);
            }
        } finally {
            org.springframework.test.util.ReflectionTestUtils.setField(learners, "unitAssessmentPilotEnabled", pilotBefore);
        }
    }

    // Issue #197, found by the independent review: activating an ordinary plan keeps a goal in
    // progress exactly if the write accepts it under the focus that is stored for it, directly or
    // behind a required unit opening. The response names the step that is stored, and the goal
    // stays the focus and the goal to return to, also when another plan goal is due earlier.
    @ParameterizedTest
    @ValueSource(strings = {"childPassed", "bothPassed", "bothOpen"})
    void activationKeepsAGoalInProgressBehindItsOpeningWhenAnotherGoalIsDueEarlier(String openings) throws Exception {
        String motion = selectHessianMotionUnit("G9", "SekII", "GK");
        String child = motion.replace(":structure:physics-e1-motion", ":structure:physics-e1-accelerated-and-free-fall");
        String magnet = motion.replace(":structure:physics-e1-motion", ":structure:physics-current-magnetic-fields-0bd4a459");
        String physics = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
        String diagram = "1e459a1b-4159-5049-84eb-9928129c1610";
        String magnetGoal = "b4175564-4397-5c08-90ba-4f13231a75ec";
        var today = java.time.LocalDate.now(java.time.ZoneId.of("Europe/Berlin"));
        var learner = learnerRepository.findById(learnerId).orElseThrow();
        var graph = new CompletionProfileCompiler().normalizePrerequisites(
                learners.getLearningPlanCompletionContext(learnerId).canonicalGoals());
        var finished = new java.util.LinkedHashSet<>(graph.transitivePrerequisites(diagram));
        finished.addAll(graph.transitivePrerequisites(magnetGoal));
        finished.add("e0004439-ed34-5caf-858a-6107918224eb");
        finished.removeAll(List.of(magnetGoal, diagram, MOTION_OPENING, FALL_OPENING));
        if (!openings.equals("bothOpen")) finished.add(FALL_OPENING);
        if (openings.equals("bothPassed")) finished.add(MOTION_OPENING);
        masteryRepository.saveAllAndFlush(finished.stream().map(id -> new Mastery(learner, id, 1.0)).toList());
        learners.setPreferences(learnerId, null, false, true, null, false);
        learners.setPlannedGoals(learnerId, java.util.Set.of(child));
        if (openings.equals("bothOpen")) {
            // A goal in progress from before, for which today both openings are required.
            var restored = learnerRepository.findById(learnerId).orElseThrow();
            restored.setActiveGoalId(diagram);
            learnerRepository.saveAndFlush(restored);
        } else {
            learners.setActiveGoal(learnerId, diagram);
        }
        assertThat(learnerRepository.findById(learnerId).orElseThrow().getActiveGoalId()).isEqualTo(diagram);
        String expected = openings.equals("bothPassed") ? diagram : MOTION_OPENING;

        var activated = learningPlans.activatePlans(learnerId, new LearnerLearningPlanApi.ActivateRequest(today, List.of(
                new LearnerLearningPlanApi.ActivationPlan(physics, 0L, "Fortsetzen", List.of(
                        new LearnerLearningPlanApi.Block("due", "learning", magnet, "Magnet", today, today,
                                null, List.of(magnetGoal), List.of(magnet), true),
                        new LearnerLearningPlanApi.Block("later", "learning", child, "Diagramm", today.plusDays(14),
                                today.plusDays(14), null, List.of(diagram), List.of(child, magnet), true))))));

        var stored = learnerRepository.findById(learnerId).orElseThrow();
        assertThat(stored.getActiveGoalId()).as("the goal in progress is kept, behind its opening").isEqualTo(expected);
        assertThat(activated.activeGoalId()).as("the response names the stored step").isEqualTo(expected);
        assertThat(activated.focusGoalId()).isEqualTo(diagram);
        assertThat(focus.findByLearner_SkillpilotId(learnerId).stream().map(PlannedGoal::getGoalId).toList())
                .containsExactly(diagram);
        if (!openings.equals("bothPassed")) {
            assertThat(mapper.readTree(stored.getPendingUnitEntry()).path("targetGoalId").asText(null))
                    .as("the goal to return to").isEqualTo(diagram);
        }
    }

    // A regrouping can move the goal a learner is working on out of the section they focus. The
    // learner keeps their place: the goal stays in progress for teaching and completion. What the
    // learner chose stays what they chose: the focus shown in the Cockpit, the stored focus, the
    // backup and the navigation options do not gain the goal. Found by the independent review of
    // the E.2 cut (25 November 2026); the E.1 cut of 23 November had moved road traffic out of
    // E.1 in the same way.
    @ParameterizedTest
    @ValueSource(booleans = {false, true})
    void goalInProgressSurvivesARegroupingOutOfTheFocusedSection(boolean pilot) throws Exception {
        Object pilotBefore = org.springframework.test.util.ReflectionTestUtils.getField(learners, "unitAssessmentPilotEnabled");
        org.springframework.test.util.ReflectionTestUtils.setField(learners, "unitAssessmentPilotEnabled", pilot);
        try {
            String section = selectHessianMotionUnit("G9", "SekII", "GK");
            String child = section.replace(":structure:physics-e1-motion", ":structure:physics-e1-accelerated-and-free-fall");
            String physics = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
            String moved = "4a2bf015-052b-4af0-aed7-324259fa1a8a";
            assertThat(learners.resolveLearningPlanGoalIds(learnerId, physics, List.of(section))).doesNotContain(moved);
            var learner = learnerRepository.findById(learnerId).orElseThrow();
            var finished = new CompletionProfileCompiler().normalizePrerequisites(
                    learners.getLearningPlanCompletionContext(learnerId).canonicalGoals()).transitivePrerequisites(moved);
            masteryRepository.saveAllAndFlush(finished.stream().filter(id -> !id.equals(moved))
                    .map(id -> new Mastery(learner, id, 1.0)).toList());
            java.util.function.Supplier<List<String>> storedFocus = () ->
                    focus.findByLearner_SkillpilotId(learnerId).stream().map(PlannedGoal::getGoalId).toList();
            assertThat(storedFocus.get()).containsExactly(section);
            // A new start outside the focus is refused, as before.
            assertThatThrownBy(() -> learners.setActiveGoal(learnerId, moved))
                    .isInstanceOf(org.springframework.web.server.ResponseStatusException.class);
            var optionsWithoutGoal = learners.getScopeNavigationOptions(learnerId).stream().map(goal -> goal.id()).toList();

            // The state a learner had before the cut: the goal in progress under the focus on E.1.
            Runnable inProgressBeforeTheCut = () -> {
                var stored = learnerRepository.findById(learnerId).orElseThrow();
                stored.setActiveGoalId(moved);
                stored.setLearningState(LearningState.TEACHING);
                learnerRepository.saveAndFlush(stored);
            };
            inProgressBeforeTheCut.run();

            // The coach read writes nothing and teaches the goal in progress.
            var coach = learners.getCoachLearnerState(learnerId);
            assertThat(coach.learningState()).isEqualTo("TEACHING");
            assertThat(coach.activeGoal()).isNotNull();
            assertThat(coach.activeGoal().id()).isEqualTo(moved);
            // The regular state read keeps the pointer and the chosen focus.
            var state = learners.getLearnerState(learnerId);
            assertThat(state.learningState()).isEqualTo("TEACHING");
            assertThat(state.activeGoal().id()).isEqualTo(moved);
            assertThat(learnerRepository.findById(learnerId).orElseThrow().getActiveGoalId()).isEqualTo(moved);
            assertThat(storedFocus.get()).containsExactly(section);
            // The chosen focus is shown, queried, offered and exported as chosen.
            assertThat(state.goals().planned()).extracting(goal -> goal.id()).containsExactly(section);
            assertThat(learners.getPlannedGoals(learnerId)).containsExactly(section);
            assertThat(learners.getScopeNavigationOptions(learnerId)).extracting(goal -> goal.id())
                    .containsExactlyElementsOf(optionsWithoutGoal);
            learners.importLearner(learnerId, learners.exportLearner(learnerId));
            assertThat(storedFocus.get()).containsExactly(section);
            inProgressBeforeTheCut.run();
            assertThat(learners.getLearnerState(learnerId).activeGoal().id()).isEqualTo(moved);

            // An exam is not kept this way. Its pointer outside the focus needs a valid direct
            // assessment or the explicit choice of its offer; without them it is cleared as before.
            String exam = "26c1e946-e858-57ef-a19b-d6bb295c76f4";
            assertThat(learners.resolveLearningPlanGoalIds(learnerId, physics, List.of(section))).doesNotContain(exam);
            var withExam = learnerRepository.findById(learnerId).orElseThrow();
            withExam.setActiveGoalId(exam);
            learnerRepository.saveAndFlush(withExam);
            assertThat(learners.getLearnerState(learnerId).activeGoal()).isNull();
            assertThat(learnerRepository.findById(learnerId).orElseThrow().getActiveGoalId()).isNull();
            inProgressBeforeTheCut.run();

            // A focus change by the learner still ends work on a goal outside the new focus.
            learners.setPlannedGoals(learnerId, java.util.Set.of(child));
            assertThat(learnerRepository.findById(learnerId).orElseThrow().getActiveGoalId()).isNull();
            assertThat(learners.getLearnerState(learnerId).activeGoal()).isNull();

            // Passing the goal ends it; the focus is the chosen section again and nothing else.
            learners.setPlannedGoals(learnerId, java.util.Set.of(section));
            inProgressBeforeTheCut.run();
            learners.setMastery(learnerId, new com.skillpilot.backend.api.MasteryUpdateRequest(Map.of(moved, 1.0), moved));
            var after = learners.getLearnerState(learnerId);
            assertThat(after.activeGoal() == null ? null : after.activeGoal().id()).isNotEqualTo(moved);
            assertThat(storedFocus.get()).containsExactly(section);
            assertThat(learners.getUncompactedRichFrontierForFocus(learnerId, storedFocus.get()))
                    .noneMatch(goal -> moved.equals(goal.id()));
        } finally {
            org.springframework.test.util.ReflectionTestUtils.setField(learners, "unitAssessmentPilotEnabled", pilotBefore);
        }
    }

    // The same for the E.2 cut of 25 November 2026: with E.2 as the focus and the law of
    // gravitation in progress, which the cut moved to E.5, the learner keeps their place.
    @ParameterizedTest
    @CsvSource({"GK,false", "GK,true", "LK,false", "LK,true"})
    void goalInProgressSurvivesTheCutOfForces(String course, boolean pilot) throws Exception {
        Object pilotBefore = org.springframework.test.util.ReflectionTestUtils.getField(learners, "unitAssessmentPilotEnabled");
        org.springframework.test.util.ReflectionTestUtils.setField(learners, "unitAssessmentPilotEnabled", pilot);
        try {
            String forces = selectHessianMotionUnit("G9", "SekII", course)
                    .replace(":structure:physics-e1-motion", ":structure:physics-e2-newton-and-conservation");
            String physics = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
            String gravitation = "eb0ffdea-c12d-56df-b7e8-c0297d2f8aff";
            learners.setPlannedGoals(learnerId, java.util.Set.of(forces));
            assertThat(learners.resolveLearningPlanGoalIds(learnerId, physics, List.of(forces))).doesNotContain(gravitation);
            var learner = learnerRepository.findById(learnerId).orElseThrow();
            masteryRepository.saveAllAndFlush(new CompletionProfileCompiler().normalizePrerequisites(
                            learners.getLearningPlanCompletionContext(learnerId).canonicalGoals())
                    .transitivePrerequisites(gravitation).stream().filter(id -> !id.equals(gravitation))
                    .map(id -> new Mastery(learner, id, 1.0)).toList());
            var stored = learnerRepository.findById(learnerId).orElseThrow();
            stored.setActiveGoalId(gravitation);
            stored.setLearningState(LearningState.TEACHING);
            learnerRepository.saveAndFlush(stored);

            assertThat(learners.getCoachLearnerState(learnerId).activeGoal().id()).isEqualTo(gravitation);
            var state = learners.getLearnerState(learnerId);
            assertThat(state.learningState()).isEqualTo("TEACHING");
            assertThat(state.activeGoal().id()).isEqualTo(gravitation);
            assertThat(state.goals().planned()).extracting(goal -> goal.id()).containsExactly(forces);
            assertThat(learnerRepository.findById(learnerId).orElseThrow().getActiveGoalId()).isEqualTo(gravitation);
            learners.setMastery(learnerId, new com.skillpilot.backend.api.MasteryUpdateRequest(
                    Map.of(gravitation, 1.0), gravitation));
            assertThat(learners.getMastery(learnerId).get(gravitation)).isEqualTo(1.0);
            assertThat(focus.findByLearner_SkillpilotId(learnerId)).extracting(PlannedGoal::getGoalId)
                    .containsExactly(forces);
        } finally {
            org.springframework.test.util.ReflectionTestUtils.setField(learners, "unitAssessmentPilotEnabled", pilotBefore);
        }
    }

    @ParameterizedTest
    @ValueSource(strings = {"GK", "LK"})
    void storedE2SectionKeepsItsGoalsAfterTheEnergyAddition(String course) throws Exception {
        String physics = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
        String derivation = "2d3f849e-20b1-5b3e-90d0-63d98c6b2b1b";
        String closingTask = "e0085acf-af64-5c73-8abf-85a5bbfbdaa6";
        String section = selectHessianMotionUnit("G9", "SekII", course)
                .replace(":structure:physics-e1-motion", ":structure:physics-e2-newton-and-conservation");
        learners.setPlannedGoals(learnerId, java.util.Set.of(section));
        var day = java.time.LocalDate.of(2026, 11, 23);
        var current = learners.resolveLearningPlanGoalIds(learnerId, physics, List.of(section));
        assertThat(current).contains(derivation, closingTask);
        byte[] fixture;
        try (var input = getClass().getResourceAsStream("/fixtures/e2-before-energy-20261126.json")) {
            assertThat(input).isNotNull();
            fixture = input.readAllBytes();
        }
        assertThat(java.util.HexFormat.of().formatHex(java.security.MessageDigest
                .getInstance("SHA-256").digest(fixture))).isEqualTo("2298cec87f53581a0c19e423ebe8226db7ec12157c681cfbf4bc0dbb38a5660b");
        var capture = mapper.readTree(fixture).path("courses").path(course).path("capture");
        var blocks = mapper.readValue(capture.path("storedBlockJson").asText(),
                new TypeReference<List<LearnerLearningPlanApi.Block>>() { });
        assertThat(blocks).singleElement().satisfies(block -> {
            assertThat(block.focusGoalIds()).containsExactly(section);
            assertThat(block.atomicGoalIds()).hasSize(course.equals("GK") ? 29 : 30)
                    .doesNotHaveDuplicates().doesNotContain(derivation, closingTask);
            assertThat(current).containsAll(block.atomicGoalIds());
        });

        learningPlans.upsert(learnerId, physics, new LearnerLearningPlanApi.UpsertRequest(0L, "E.2", List.of(
                new LearnerLearningPlanApi.Block("section", "learning", section, "E.2", day, day,
                        null, current, List.of(section), true))), day);
        var row = storedPlans.findByLearner_SkillpilotIdAndLandscapeId(learnerId, physics).orElseThrow();
        row.setBlocksJson(capture.path("storedBlockJson").asText());
        row.setScopeFingerprint(capture.path("scopeFingerprint").asText());
        row.setCurriculumId(capture.path("curriculumId").asText());
        row.setRevision(capture.path("revision").asLong());
        storedPlans.saveAndFlush(row);
        var beforeBackup = learningPlans.getPlan(learnerId, physics, day);
        assertThat(beforeBackup.stale()).isFalse();
        assertThat(beforeBackup.blocks()).isEqualTo(blocks);
        learners.importLearner(learnerId, learners.exportLearner(learnerId));
        var restored = learningPlans.getPlan(learnerId, physics, day);
        assertThat(restored.stale()).isFalse();
        assertThat(restored.blocks()).isEqualTo(blocks);
    }

    @ParameterizedTest
    @ValueSource(strings = {"G8", "G9"})
    void savedBrandenburgSectionKeepsItsElevenGoalsAfterArrowEntry(String duration) throws Exception {
        String physics = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
        String arrow = "b77a7e93-22f9-5722-a4cc-f18a149ab030";
        String closingTask = "2569d84a-5bf1-542b-bc43-6ade1df971c4";
        learners.chooseLevelCompletion(learnerId, new LevelCompletionActionRequest("leaveProfile", PROFILE, null, null, version()));
        String section = configurePhysicsTestUnit(duration, "SekI", "GK", "DE-BB", "physics-bb-j7-8-topic-8ada1d155a2e");
        var day = java.time.LocalDate.of(2026, 11, 25);
        var current = learners.resolveLearningPlanGoalIds(learnerId, physics, List.of(section));
        assertThat(current).contains(arrow, closingTask);
        byte[] fixture;
        try (var input = getClass().getResourceAsStream("/fixtures/brandenburg-before-arrow-goal-20261126.json")) {
            assertThat(input).isNotNull();
            fixture = input.readAllBytes();
        }
        assertThat(java.util.HexFormat.of().formatHex(java.security.MessageDigest
                .getInstance("SHA-256").digest(fixture))).isEqualTo("2b3a5cc3e25303a96dce3fcaff684ae53c064eec3622a810461cdad20577b9fb");
        var capture = mapper.readTree(fixture).path("durations").path(duration).path("capture");
        var blocks = mapper.readValue(capture.path("storedBlockJson").asText(),
                new TypeReference<List<LearnerLearningPlanApi.Block>>() { });
        assertThat(blocks).singleElement().satisfies(block -> {
            assertThat(block.focusGoalIds()).containsExactly(section);
            assertThat(block.atomicGoalIds()).hasSize(11)
                    .doesNotHaveDuplicates().doesNotContain(arrow, closingTask);
            assertThat(current).containsAll(block.atomicGoalIds());
        });

        learningPlans.upsert(learnerId, physics, new LearnerLearningPlanApi.UpsertRequest(0L, "Mechanik", List.of(
                new LearnerLearningPlanApi.Block("section", "learning", section, "Mechanik", day, day,
                        null, current, List.of(section), true))), day);
        var row = storedPlans.findByLearner_SkillpilotIdAndLandscapeId(learnerId, physics).orElseThrow();
        row.setBlocksJson(capture.path("storedBlockJson").asText());
        row.setScopeFingerprint(capture.path("scopeFingerprint").asText());
        row.setCurriculumId(capture.path("curriculumId").asText());
        row.setRevision(capture.path("revision").asLong());
        storedPlans.saveAndFlush(row);
        var beforeBackup = learningPlans.getPlan(learnerId, physics, day);
        assertThat(beforeBackup.stale()).isFalse();
        assertThat(beforeBackup.blocks()).isEqualTo(blocks);
        learners.importLearner(learnerId, learners.exportLearner(learnerId));
        var restored = learningPlans.getPlan(learnerId, physics, day);
        assertThat(restored.stale()).isFalse();
        assertThat(restored.blocks()).isEqualTo(blocks);
    }

    @ParameterizedTest
    @ValueSource(strings = {"GK", "LK"})
    void storedE2SectionKeepsItsGoalsWhenTheForceBalanceAndItsTaskAreAdded(String course) throws Exception {
        String physics = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
        String balance = "6ba20688-8cbf-5db1-bda8-346893798d2f";
        String balanceTask = "d513289a-80a3-5e48-95d3-5791736cddba";
        String mixedExam = "22561c66-3957-5d55-b07a-25de1f359930";
        String section = selectHessianMotionUnit("G9", "SekII", course)
                .replace(":structure:physics-e1-motion", ":structure:physics-e2-newton-and-conservation");
        learners.setPlannedGoals(learnerId, java.util.Set.of(section));
        var day = java.time.LocalDate.of(2026, 11, 26);
        byte[] fixture;
        try (var input = getClass().getResourceAsStream("/fixtures/e2-before-collinear-forces-20261126.json")) {
            assertThat(input).isNotNull();
            fixture = input.readAllBytes();
        }
        assertThat(java.util.HexFormat.of().formatHex(java.security.MessageDigest
                .getInstance("SHA-256").digest(fixture))).isEqualTo("433cf7809b1c9e5751bf8b8edd15fd4d1a40f9f247fd086646345f67055cf303");
        var capture = mapper.readTree(fixture).path("courses").path(course);
        String historical = capture.required("storedBlocksJson").asText();
        var blocks = mapper.readValue(historical, new TypeReference<List<LearnerLearningPlanApi.Block>>() {});
        assertThat(blocks).singleElement().satisfies(block -> {
            assertThat(block.focusGoalIds()).containsExactly(section);
            assertThat(block.atomicGoalIds()).hasSize(course.equals("GK") ? 32 : 33)
                    .doesNotHaveDuplicates().doesNotContain(balance, balanceTask);
            assertThat(block.atomicGoalIds().contains(mixedExam)).isEqualTo(course.equals("GK"));
        });

        // Seed the historical stored selection in an actual plan row, then use the live read and backup paths.
        learningPlans.upsert(learnerId, physics, new LearnerLearningPlanApi.UpsertRequest(0L, "E.2", blocks), day);
        var entity = storedPlans.findByLearner_SkillpilotIdAndLandscapeId(learnerId, physics).orElseThrow();
        entity.setBlocksJson(historical);
        entity.setRevision(capture.required("revision").asLong());
        storedPlans.saveAndFlush(entity);
        var resumed = learningPlans.getPlan(learnerId, physics, day);
        assertThat(resumed.stale()).isFalse();
        assertThat(resumed.blocks()).isEqualTo(blocks);
        assertThat(resumed.learningScope().goalIds()).containsExactlyElementsOf(blocks.getFirst().atomicGoalIds());
        assertThat(resumed.learningScope().targetGoalCount()).isEqualTo(blocks.getFirst().atomicGoalIds().size());
        var stored = storedPlans.findByLearner_SkillpilotIdAndLandscapeId(learnerId, physics).orElseThrow();
        assertThat(stored.getBlocksJson()).isEqualTo(historical);
        assertThat(stored.getRevision()).isEqualTo(capture.required("revision").asLong());
        assertThat(mapper.valueToTree(learners.exportLearner(learnerId)).path("data").path("learningPlans")
                .get(0).path("blocks")).isEqualTo(mapper.readTree(historical));

        var fresh = learners.resolveLearningPlanGoalIds(learnerId, physics, List.of(section));
        assertThat(fresh).containsAll(blocks.getFirst().atomicGoalIds()).contains(balance, balanceTask)
                .doesNotHaveDuplicates();
        assertThat(fresh.contains(mixedExam)).isEqualTo(course.equals("GK"));
        var replacement = new LearnerLearningPlanApi.Block("new-e2", "learning", section, "E.2",
                day, day, null, fresh, List.of(section), true);
        var newPlan = learningPlans.upsert(learnerId, physics, new LearnerLearningPlanApi.UpsertRequest(
                stored.getRevision(), "E.2", List.of(replacement)), day);
        assertThat(newPlan.stale()).isFalse();
        assertThat(newPlan.blocks().getFirst().atomicGoalIds()).containsExactlyElementsOf(fresh);
    }

    // The E.2 cut of 25 November 2026 moved the gravitation goals from E.2 to E.5. A plan stored
    // for the section E.2 before the cut keeps them: it stays current, restores from a backup and
    // names one of them as its next goal once the rest of the section is done.
    @ParameterizedTest
    @ValueSource(strings = {"GK", "LK"})
    void planStoredForForcesBeforeTheCutKeepsTheGravitationGoals(String course) throws Exception {
        String forces = selectHessianMotionUnit("G9", "SekII", course)
                .replace(":structure:physics-e1-motion", ":structure:physics-e2-newton-and-conservation");
        String physics = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
        var today = java.time.LocalDate.now(java.time.ZoneId.of("Europe/Berlin"));
        var monday = today.with(java.time.DayOfWeek.MONDAY);
        var currentSection = learners.resolveLearningPlanGoalIds(learnerId, physics, List.of(forces));
        // What left the section selection of the Sek II view with the cut: the three gravitation
        // goals and "Masse und Gewichtskraft unterscheiden", whose explicit learning place followed
        // them to E.5. The Leistungskurs deepening of energy conservation needs the potential and
        // moved too. Before the cut the section held 32 goals in both courses.
        var moved = new java.util.ArrayList<>(List.of("eb0ffdea-c12d-56df-b7e8-c0297d2f8aff",
                "a42f91a4-0d21-5aa9-ae11-f48be6f2e431", "594f7f21-6b8a-531c-8424-5f1dcbaf0f23",
                "9c328f68-41ed-55dd-9e02-34414a6246f2"));
        if (course.equals("LK")) moved.add("e359f8bb-6106-44aa-9edf-694528d2d2a9");
        assertThat(currentSection).isNotEmpty().doesNotContainAnyElementsOf(moved);
        // This is the actual dated native capture from before the cut, not today's section
        // with moved goals added. Later curricular additions never enter the old learner's plan.
        byte[] captureBytes;
        try (var input = getClass().getResourceAsStream("/fixtures/e2-forces-before-cut-20261125.json")) {
            assertThat(input).isNotNull();
            captureBytes = input.readAllBytes();
        }
        assertThat(java.util.HexFormat.of().formatHex(java.security.MessageDigest.getInstance("SHA-256")
                .digest(captureBytes))).isEqualTo("6367068e3613691e269209889f476c5fe557e611ec46d08248db643e8172bada");
        var dated = mapper.readTree(captureBytes).path("courses").path(course);
        assertThat(dated.path("sourceRawSha256").asText()).isEqualTo(course.equals("GK")
                ? "sha256:7aea72b0e70514a5078ea1550c9deca1ac15d13cad8cc7afba1fba180d4787d7"
                : "sha256:cbf92f096911a6be87e4e6cb0400685de73a409953af2c82c220223ddd7e5a6e");
        var capture = dated.path("capture");
        var stored = mapper.readValue(capture.path("storedBlockJson").asText(),
                new TypeReference<List<LearnerLearningPlanApi.Block>>() { });
        assertThat(stored).hasSize(1);
        var captured = stored.getFirst().atomicGoalIds();
        assertThat(capture.path("staleAtCapture").asBoolean()).isFalse();
        assertThat(captured).hasSize(32).doesNotHaveDuplicates().containsAll(moved);
        assertThat(stored).singleElement().satisfies(block -> {
            assertThat(block.focusGoalIds()).containsExactly(forces);
            assertThat(block.startDate()).isEqualTo(java.time.LocalDate.parse("2026-11-23"));
            assertThat(block.endDate()).isEqualTo(java.time.LocalDate.parse("2026-11-23"));
        });
        assertThat(learners.getPlanningScope(learnerId, physics).scopeAtomicGoalIds()).containsAll(moved);
        learningPlans.upsert(learnerId, physics, new LearnerLearningPlanApi.UpsertRequest(0L, "E.2", List.of(
                new LearnerLearningPlanApi.Block("section", "learning", forces, "E.2", monday, monday,
                        null, currentSection, List.of(forces), true))), today);

        var record = storedPlans.findByLearner_SkillpilotIdAndLandscapeId(learnerId, physics).orElseThrow();
        record.setBlocksJson(capture.path("storedBlockJson").asText());
        record.setCurriculumId(capture.path("curriculumId").asText());
        record.setScopeFingerprint(capture.path("scopeFingerprint").asText());
        record.setRevision(capture.path("revision").asLong());
        storedPlans.saveAndFlush(record);
        var plan = learningPlans.getPlan(learnerId, physics, today);
        assertThat(plan.stale()).isFalse();
        assertThat(plan.blocks()).isEqualTo(stored);

        learners.importLearner(learnerId, learners.exportLearner(learnerId));
        var restored = learningPlans.getPlan(learnerId, physics, today);
        assertThat(restored.stale()).isFalse();
        assertThat(restored.blocks()).isEqualTo(stored);

        // Every other goal of the captured section and each current prerequisite of the moved goals is done.
        var learner = learnerRepository.findById(learnerId).orElseThrow();
        var prerequisites = new CompletionProfileCompiler().normalizePrerequisites(
                learners.getLearningPlanCompletionContext(learnerId).canonicalGoals());
        var finished = new java.util.LinkedHashSet<String>(captured);
        for (String goal : moved) finished.addAll(prerequisites.transitivePrerequisites(goal));
        finished.removeAll(moved);
        masteryRepository.saveAllAndFlush(finished.stream().map(id -> new Mastery(learner, id, 1.0)).toList());
        // The plan offers every one of the moved goals in turn, and nothing else of the subject.
        var offered = new java.util.LinkedHashSet<String>();
        for (int step = 0; step < moved.size(); step++) {
            var next = learningPlans.getPlan(learnerId, physics, today).nextEligibleGoal();
            assertThat(next).isNotNull();
            assertThat(moved).contains(next.goalId());
            assertThat(offered.add(next.goalId())).isTrue();
            masteryRepository.saveAndFlush(new Mastery(learner, next.goalId(), 1.0));
        }
        assertThat(offered).containsExactlyInAnyOrderElementsOf(moved);
    }

    // A kept goal must stay reachable as planned work, not only counted: the plan names it as the
    // next goal, and continuing starts exactly it under its own focus, before any other goal of the
    // subject. Found by the independent review of 25 November 2026: the search for due work asked
    // only the former section, so the plan was current, its one open goal was passed over and the
    // learner was sent to an unrelated goal of the subject.
    @ParameterizedTest
    @CsvSource({"false,false", "false,true", "true,false", "true,true"})
    void planOffersTheGoalThatARegroupingMovedOutOfItsSection(boolean pilot, boolean wholeFormerSection)
            throws Exception {
        org.springframework.test.util.ReflectionTestUtils.setField(learners, "unitAssessmentPilotEnabled", pilot);
        try {
            String section = selectHessianMotionUnit("G9", "SekII", "GK");
            String physics = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
            String moved = "4a2bf015-052b-4af0-aed7-324259fa1a8a";
            var today = java.time.LocalDate.now(java.time.ZoneId.of("Europe/Berlin"));
            var monday = today.with(java.time.DayOfWeek.MONDAY);
            var current = learners.resolveLearningPlanGoalIds(learnerId, physics, List.of(section));
            learningPlans.upsert(learnerId, physics, new LearnerLearningPlanApi.UpsertRequest(0L, "E.1", List.of(
                    new LearnerLearningPlanApi.Block("old-e1", "learning", section, "E.1", monday, monday,
                            null, current, List.of(section), true))), today);
            var captured = new java.util.ArrayList<String>();
            if (wholeFormerSection) captured.addAll(current);
            captured.add(moved);
            var record = storedPlans.findByLearner_SkillpilotIdAndLandscapeId(learnerId, physics).orElseThrow();
            record.setBlocksJson(mapper.writeValueAsString(List.of(
                    new LearnerLearningPlanApi.Block("old-e1", "learning", section, "E.1", monday, monday,
                            null, captured, List.of(section), true))));
            storedPlans.saveAndFlush(record);
            // Everything else of the plan and every prerequisite of the moved goal is done.
            var learner = learnerRepository.findById(learnerId).orElseThrow();
            var model = learners.getLearningPlanCompletionContext(learnerId);
            var finished = new java.util.LinkedHashSet<String>(new CompletionProfileCompiler()
                    .normalizePrerequisites(model.canonicalGoals()).transitivePrerequisites(moved));
            finished.addAll(current);
            finished.remove(moved);
            masteryRepository.saveAllAndFlush(finished.stream().map(id -> new Mastery(learner, id, 1.0)).toList());
            // The former section no longer offers the goal. The subject offers other work, and
            // that is what continuing fell back to before: its first ordinary goal is another one.
            assertThat(learners.getUncompactedRichFrontierForFocus(learnerId, List.of(section)))
                    .noneMatch(goal -> moved.equals(goal.id()));
            assertThat(learners.getPersonalCurriculumSubjectFrontier(learnerId, physics).stream()
                    .filter(goal -> "atomic".equals(goal.type()) && !goal.voluntaryStudy()).findFirst())
                    .get().satisfies(goal -> assertThat(goal.id()).isNotEqualTo(moved));

            // Following switched off: the plan still names the goal as its next step.
            var paused = learningPlans.getPlan(learnerId, physics, today);
            assertThat(paused.stale()).isFalse();
            assertThat(paused.nextEligibleGoal()).isEqualTo(new LearnerLearningPlanApi.NextEligibleGoal(moved));
            assertThat(paused.canContinue()).isFalse();
            assertThat(paused.continueReason()).isEqualTo("learning-plan-following-disabled");

            learners.setPreferences(learnerId, null, false, true, null, true);
            var view = learningPlans.getPlan(learnerId, physics, today);
            assertThat(view.stale()).isFalse();
            assertThat(view.nextEligibleGoal()).isEqualTo(new LearnerLearningPlanApi.NextEligibleGoal(moved));
            assertThat(view.canContinue()).isTrue();
            // The coach's today status reports that the plan can be continued and counts the goal as
            // open plan work. Which goal that is, the plan view above and the calls below state.
            var status = learningPlans.getCoachTodayStatus(learnerId, "de");
            assertThat(status.resumeAvailable()).isTrue();
            assertThat(status.subjects()).singleElement().satisfies(subject -> {
                assertThat(subject.canContinue()).isTrue();
                assertThat(subject.learningScope().goalIds()).contains(moved);
                assertThat(subject.periodGauge().target() - subject.periodGauge().completed()).isEqualTo(1);
            });

            // Automatic continuation starts the goal, under its own focus.
            var automatic = learningPlans.reconcile(learnerId, new LearnerLearningPlanApi.ReconcileRequest(today));
            assertThat(automatic.activeGoalId()).isEqualTo(moved);
            assertThat(automatic.focusGoalId()).isEqualTo(moved);
            assertThat(learnerRepository.findById(learnerId).orElseThrow().getActiveGoalId()).isEqualTo(moved);
            assertThat(automatic.changed()).isTrue();
            // A second run leaves the goal in progress untouched.
            assertThat(learningPlans.reconcile(learnerId, new LearnerLearningPlanApi.ReconcileRequest(today)).changed())
                    .isFalse();
            assertThat(learnerRepository.findById(learnerId).orElseThrow().getActiveGoalId()).isEqualTo(moved);

            // Both explicit continuations do the same from a state without an active goal and with
            // the former section as the stored focus: the coach's (resumeExplicitly) and the Cockpit's
            // (continuePlan).
            for (boolean coach : List.of(true, false)) {
                var parked = learnerRepository.findById(learnerId).orElseThrow();
                parked.setActiveGoalId(null);
                learnerRepository.saveAndFlush(parked);
                learners.setPlannedGoals(learnerId, java.util.Set.of(section));
                if (coach) {
                    var resumed = learningPlans.resumeExplicitly(learnerId, new LearnerLearningPlanApi.ReconcileRequest(today));
                    assertThat(resumed.activeGoalId()).isEqualTo(moved);
                    assertThat(resumed.focusGoalId()).isEqualTo(moved);
                } else {
                    var again = learningPlans.getPlan(learnerId, physics, today);
                    var resumed = learningPlans.continuePlan(learnerId, again.planId(),
                            new LearnerLearningPlanApi.ContinueRequest(again.revision(), today));
                    assertThat(resumed.activeGoalId()).isEqualTo(moved);
                    assertThat(resumed.focusGoalId()).isEqualTo(moved);
                }
                assertThat(learnerRepository.findById(learnerId).orElseThrow().getActiveGoalId()).isEqualTo(moved);
                assertThat(focus.findByLearner_SkillpilotId(learnerId)).extracting(PlannedGoal::getGoalId)
                        .containsExactly(moved);
            }

            // Passing it completes the plan's work: the plan no longer names it and the week is done.
            learners.setMastery(learnerId, new com.skillpilot.backend.api.MasteryUpdateRequest(Map.of(moved, 1.0), moved));
            var done = learningPlans.getPlan(learnerId, physics, today);
            assertThat(done.stale()).isFalse();
            assertThat(done.nextEligibleGoal()).isNotEqualTo(new LearnerLearningPlanApi.NextEligibleGoal(moved));
            assertThat(learningPlans.getCoachTodayStatus(learnerId, "de").subjects()).singleElement()
                    .satisfies(subject -> assertThat(subject.periodGauge().completed())
                            .isEqualTo(subject.periodGauge().target()));
        } finally {
            org.springframework.test.util.ReflectionTestUtils.setField(learners, "unitAssessmentPilotEnabled", true);
        }
    }

    // The third way to the next goal: passing a goal of the plan hands over to the next due one.
    // It treats a kept goal like plan continuation does, with the goal as its own focus.
    @ParameterizedTest
    @ValueSource(booleans = {false, true})
    void passingAPlanGoalHandsOverToTheGoalThatARegroupingMoved(boolean pilot) throws Exception {
        org.springframework.test.util.ReflectionTestUtils.setField(learners, "unitAssessmentPilotEnabled", pilot);
        try {
            String section = selectHessianMotionUnit("G9", "SekII", "GK");
            String physics = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
            String moved = "4a2bf015-052b-4af0-aed7-324259fa1a8a";
            var today = java.time.LocalDate.now(java.time.ZoneId.of("Europe/Berlin"));
            var monday = today.with(java.time.DayOfWeek.MONDAY);
            var current = learners.resolveLearningPlanGoalIds(learnerId, physics, List.of(section));
            // An ordinary content goal of the section is still open and comes first in the plan.
            String open = current.stream().map(landscapeDefinitions::getGoalDefinition)
                    .filter(goal -> !CompletionProfileCompiler.isAssessment(goal) && !CompletionProfileCompiler.isMemory(goal)
                            && !CompletionProfileCompiler.isOrientation(goal))
                    .map(goal -> goal.getId()).reduce((first, second) -> second).orElseThrow();
            learningPlans.upsert(learnerId, physics, new LearnerLearningPlanApi.UpsertRequest(0L, "E.1", List.of(
                    new LearnerLearningPlanApi.Block("old-e1", "learning", section, "E.1", monday, monday,
                            null, current, List.of(section), true))), today);
            var record = storedPlans.findByLearner_SkillpilotIdAndLandscapeId(learnerId, physics).orElseThrow();
            record.setBlocksJson(mapper.writeValueAsString(List.of(
                    new LearnerLearningPlanApi.Block("old-e1", "learning", section, "E.1", monday, monday,
                            null, List.of(open, moved), List.of(section), true))));
            storedPlans.saveAndFlush(record);
            var learner = learnerRepository.findById(learnerId).orElseThrow();
            var prerequisites = new CompletionProfileCompiler().normalizePrerequisites(
                    learners.getLearningPlanCompletionContext(learnerId).canonicalGoals());
            var finished = new java.util.LinkedHashSet<String>(prerequisites.transitivePrerequisites(moved));
            finished.addAll(prerequisites.transitivePrerequisites(open));
            finished.addAll(current);
            finished.removeAll(List.of(open, moved));
            masteryRepository.saveAllAndFlush(finished.stream().map(id -> new Mastery(learner, id, 1.0)).toList());
            learners.setPreferences(learnerId, null, false, true, null, true);

            var first = learningPlans.reconcile(learnerId, new LearnerLearningPlanApi.ReconcileRequest(today));
            assertThat(first.activeGoalId()).isEqualTo(open);
            assertThat(first.focusGoalId()).isEqualTo(section);

            learners.setMastery(learnerId, new com.skillpilot.backend.api.MasteryUpdateRequest(Map.of(open, 1.0), open));
            assertThat(learnerRepository.findById(learnerId).orElseThrow().getActiveGoalId()).isEqualTo(moved);
            assertThat(focus.findByLearner_SkillpilotId(learnerId)).extracting(PlannedGoal::getGoalId)
                    .containsExactly(moved);
        } finally {
            org.springframework.test.util.ReflectionTestUtils.setField(learners, "unitAssessmentPilotEnabled", true);
        }
    }

    // The handoff after a passed goal and plan continuation must store the same navigation. Here
    // the next goal sits in a block with two foci, the child unit and the goal itself. Under both
    // together the goal is offered directly; the stored focus is the goal alone, and under it the
    // parent unit's opening comes first. Plan continuation starts that opening and keeps the goal
    // for the return, and so must the handoff (independent review, third round, 25 November 2026).
    @ParameterizedTest
    @ValueSource(booleans = {false, true})
    void handoffStoresTheSameOpeningAndReturnGoalAsPlanContinuation(boolean pilot) throws Exception {
        Object pilotBefore = org.springframework.test.util.ReflectionTestUtils.getField(learners, "unitAssessmentPilotEnabled");
        org.springframework.test.util.ReflectionTestUtils.setField(learners, "unitAssessmentPilotEnabled", pilot);
        try {
            String section = selectHessianMotionUnit("G9", "SekII", "GK");
            String child = section.replace(":structure:physics-e1-motion", ":structure:physics-e1-accelerated-and-free-fall");
            String physics = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
            String fallLog = "e0004439-ed34-5caf-858a-6107918224eb";
            String diagram = "1e459a1b-4159-5049-84eb-9928129c1610";
            var today = java.time.LocalDate.now(java.time.ZoneId.of("Europe/Berlin"));
            var monday = today.with(java.time.DayOfWeek.MONDAY);
            learningPlans.upsert(learnerId, physics, new LearnerLearningPlanApi.UpsertRequest(0L, "Messplan", List.of(
                    new LearnerLearningPlanApi.Block("first", "learning", child, "Messprotokoll", monday, monday,
                            null, List.of(fallLog), List.of(child), true),
                    new LearnerLearningPlanApi.Block("second", "learning", child, "t-v-Diagramm", monday, monday,
                            null, List.of(diagram), List.of(child, diagram), true))), today);
            var learner = learnerRepository.findById(learnerId).orElseThrow();
            var prerequisites = new CompletionProfileCompiler().normalizePrerequisites(
                    learners.getLearningPlanCompletionContext(learnerId).canonicalGoals());
            var finished = new java.util.LinkedHashSet<String>(prerequisites.transitivePrerequisites(fallLog));
            finished.addAll(prerequisites.transitivePrerequisites(diagram));
            finished.removeAll(List.of(fallLog, diagram, MOTION_OPENING));
            finished.add(FALL_OPENING);
            masteryRepository.saveAllAndFlush(finished.stream().map(id -> new Mastery(learner, id, 1.0)).toList());
            learners.setPreferences(learnerId, null, false, true, null, true);
            learners.setPlannedGoals(learnerId, java.util.Set.of(child));
            learners.setActiveGoal(learnerId, fallLog);
            // The selection sees the goal directly, the stored focus asks for the parent opening.
            assertThat(learners.getUncompactedRichFrontierForFocus(learnerId, List.of(child, diagram)))
                    .anyMatch(goal -> diagram.equals(goal.id()));
            assertThat(learners.getRequiredUnitOrientationGoalIdForFocus(learnerId, diagram, List.of(diagram)))
                    .isEqualTo(MOTION_OPENING);

            learners.setMastery(learnerId, new com.skillpilot.backend.api.MasteryUpdateRequest(Map.of(fallLog, 1.0), fallLog));
            record Navigation(String active, List<String> focus, String returnGoal, String opening) { }
            java.util.function.Supplier<Navigation> stored = () -> {
                try {
                    var state = learnerRepository.findById(learnerId).orElseThrow();
                    var pending = state.getPendingUnitEntry() == null ? null : mapper.readTree(state.getPendingUnitEntry());
                    return new Navigation(state.getActiveGoalId(),
                            focus.findByLearner_SkillpilotId(learnerId).stream().map(PlannedGoal::getGoalId).sorted().toList(),
                            pending == null ? null : pending.path("targetGoalId").asText(null),
                            pending == null ? null : pending.path("openingGoalId").asText(null));
                } catch (Exception error) { throw new IllegalStateException(error); }
            };
            Navigation handedOver = stored.get();
            assertThat(handedOver).isEqualTo(new Navigation(MOTION_OPENING, List.of(diagram), diagram, MOTION_OPENING));

            // The same starting point through plan continuation: undo only the navigation.
            var reset = learnerRepository.findById(learnerId).orElseThrow();
            reset.setActiveGoalId(null);
            reset.setPendingUnitEntry(null);
            learnerRepository.saveAndFlush(reset);
            learners.setPlannedGoals(learnerId, java.util.Set.of(child));
            learningPlans.reconcile(learnerId, new LearnerLearningPlanApi.ReconcileRequest(today));
            assertThat(stored.get()).isEqualTo(handedOver);

            // After the opening the learner returns to the kept goal.
            learners.setMastery(learnerId, new com.skillpilot.backend.api.MasteryUpdateRequest(
                    Map.of(MOTION_OPENING, 1.0), MOTION_OPENING));
            assertThat(learnerRepository.findById(learnerId).orElseThrow().getActiveGoalId()).isEqualTo(diagram);
        } finally {
            org.springframework.test.util.ReflectionTestUtils.setField(learners, "unitAssessmentPilotEnabled", pilotBefore);
        }
    }

    // Activating a plan with an exam keeps a goal in progress exactly if the write under the exam's
    // scope accepts it. Here the scope first asks for the unit opening: the activation starts the
    // opening and keeps the goal in progress for the return, as before the exam scope decided
    // (independent review, third round). A goal the scope does not accept at all is replaced by the
    // exam's next goal; LearnerServiceTest covers that case.
    @ParameterizedTest
    @ValueSource(booleans = {false, true})
    void activatingAnExamPlanKeepsAGoalInProgressBehindItsRequiredOpening(boolean pilot) throws Exception {
        Object pilotBefore = org.springframework.test.util.ReflectionTestUtils.getField(learners, "unitAssessmentPilotEnabled");
        org.springframework.test.util.ReflectionTestUtils.setField(learners, "unitAssessmentPilotEnabled", pilot);
        try {
            String section = selectHessianMotionUnit("G9", "SekII", "GK");
            String child = section.replace(":structure:physics-e1-motion", ":structure:physics-e1-accelerated-and-free-fall");
            String physics = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
            String fallLog = "e0004439-ed34-5caf-858a-6107918224eb";
            String diagram = "1e459a1b-4159-5049-84eb-9928129c1610";
            var today = java.time.LocalDate.now(java.time.ZoneId.of("Europe/Berlin"));
            var learner = learnerRepository.findById(learnerId).orElseThrow();
            var finished = new java.util.LinkedHashSet<String>(new CompletionProfileCompiler().normalizePrerequisites(
                    learners.getLearningPlanCompletionContext(learnerId).canonicalGoals()).transitivePrerequisites(diagram));
            finished.addAll(List.of(fallLog, FALL_OPENING));
            finished.removeAll(List.of(diagram, MOTION_OPENING));
            masteryRepository.saveAllAndFlush(finished.stream().map(id -> new Mastery(learner, id, 1.0)).toList());
            learners.setPreferences(learnerId, null, false, true, null, false);
            learners.setPlannedGoals(learnerId, java.util.Set.of(child));
            learners.setActiveGoal(learnerId, diagram);
            assertThat(learnerRepository.findById(learnerId).orElseThrow().getActiveGoalId()).isEqualTo(diagram);
            List<String> examScope = List.of(MOTION_OPENING, diagram);
            assertThat(learners.getUncompactedRichFrontierForFocus(learnerId, examScope))
                    .noneMatch(goal -> diagram.equals(goal.id()));
            assertThat(learners.getRequiredUnitOrientationGoalIdForFocus(learnerId, diagram, examScope))
                    .isEqualTo(MOTION_OPENING);

            var activated = learningPlans.activatePlans(learnerId, new LearnerLearningPlanApi.ActivateRequest(today, List.of(
                    new LearnerLearningPlanApi.ActivationPlan(physics, 0L, "Klausur", List.of(
                            new LearnerLearningPlanApi.Block("opening", "learning", section, "Einstieg", today, today,
                                    null, List.of(MOTION_OPENING), List.of(section), true),
                            new LearnerLearningPlanApi.Block("later", "learning", child, "Diagramm", today.plusDays(7),
                                    today.plusDays(7), null, List.of(diagram), List.of(child), true),
                            new LearnerLearningPlanApi.Block("exam", "milestone", null, "Klausur", null, null,
                                    today.plusDays(8), null, examScope, true))))));

            assertThat(activated.plans()).isNotEmpty();
            var afterActivation = learnerRepository.findById(learnerId).orElseThrow();
            assertThat(afterActivation.getActiveGoalId()).isEqualTo(MOTION_OPENING);
            assertThat(mapper.readTree(afterActivation.getPendingUnitEntry()).path("targetGoalId").asText())
                    .isEqualTo(diagram);
            learners.setMastery(learnerId, new com.skillpilot.backend.api.MasteryUpdateRequest(
                    Map.of(MOTION_OPENING, 1.0), MOTION_OPENING));
            assertThat(learnerRepository.findById(learnerId).orElseThrow().getActiveGoalId()).isEqualTo(diagram);
        } finally {
            org.springframework.test.util.ReflectionTestUtils.setField(learners, "unitAssessmentPilotEnabled", pilotBefore);
        }
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
    // A section of a Physics view can hold the learning place of a Mathematics preparation: in the
    // Saarland Leistungskurs two integral goals lie in "Kraft und Bewegung", and every phase holds
    // its "Notwendige Grundlagen". The complete selection of such a section is its Physics goals and
    // can be stored; the Mathematics goals belong to the Mathematics plan (issue #216).
    @ParameterizedTest
    @CsvSource({"false,physics-sl-e-topic-a23348c3fbeb", "true,physics-sl-e-topic-a23348c3fbeb",
            "false,physics-sl-unit-e", "true,physics-sl-unit-e"})
    void sectionThatHoldsTheLearningPlaceOfAMathematicsGoalCanBePlannedCompletely(
            boolean withMathematics, String structure) throws Exception {
        String physics = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
        var integrals = List.of("e9114fc2-1a87-5ef5-8fa3-7ee4c9bbe0dd", "34604a97-0c64-5b06-81e2-6ac818732d60");
        learners.chooseLevelCompletion(learnerId, new LevelCompletionActionRequest("leaveProfile", PROFILE, null, null, version()));
        String section = configurePhysicsTestUnit(null, "SekII", "LK", "DE-SL", structure);
        if (withMathematics) {
            Learner learner = learnerRepository.findById(learnerId).orElseThrow();
            var curriculum = mapper.readValue(learner.getPersonalCurriculum(), com.fasterxml.jackson.databind.node.ObjectNode.class);
            curriculum.set(MATH, mapper.valueToTree(Map.of("selected", true, "filterId", "LK")));
            learner.setPersonalCurriculum(mapper.writeValueAsString(curriculum));
            learnerRepository.saveAndFlush(learner);
        }
        assertThat(compositionViews.resolveStructureReference(section).referencedGoalIds()).containsAll(integrals);

        var selected = learners.resolveLearningPlanGoalIds(learnerId, physics, List.of(section));
        var physicsScope = learners.getPlanningScope(learnerId, physics).scopeAtomicGoalIds();
        // Complete: every Physics goal of the learner that the section names directly is selected.
        assertThat(selected).doesNotContainAnyElementsOf(integrals).isSubsetOf(physicsScope)
                .containsAll(compositionViews.resolveStructureReference(section).referencedGoalIds().stream()
                        .filter(physicsScope::contains).toList())
                .hasSizeGreaterThanOrEqualTo(20)
                .allSatisfy(id -> assertThat(landscapeDefinitions.getLandscapeIdForGoal(id)).isEqualTo(physics));
        var day = java.time.LocalDate.of(2026, 11, 26);
        var block = new LearnerLearningPlanApi.Block("section", "learning", section, "Abschnitt",
                day, day, null, selected, List.of(section), true);
        var plan = learningPlans.upsert(learnerId, physics,
                new LearnerLearningPlanApi.UpsertRequest(0L, "Abschnitt", List.of(block)), day);
        assertThat(plan.stale()).isFalse();
        assertThat(plan.blocks().getFirst().atomicGoalIds()).containsExactlyInAnyOrderElementsOf(selected);
        assertThat(learningPlans.getPlan(learnerId, physics, day).stale()).isFalse();

        // A Mathematics goal of the section is no goal of the Physics plan.
        var withMathematicsGoal = new java.util.ArrayList<>(selected);
        withMathematicsGoal.add(integrals.getFirst());
        var mixed = new LearnerLearningPlanApi.Block("section", "learning", section, "Abschnitt",
                day, day, null, withMathematicsGoal, List.of(section), true);
        assertThatThrownBy(() -> learningPlans.upsert(learnerId, physics,
                new LearnerLearningPlanApi.UpsertRequest(plan.revision(), "Abschnitt", List.of(mixed)), day))
                .isInstanceOfSatisfying(org.springframework.web.server.ResponseStatusException.class, error ->
                        assertThat(error.getStatusCode().value()).isEqualTo(400));
        // The Physics section is no focus of a Mathematics plan, also where it holds Mathematics goals.
        assertThatThrownBy(() -> learners.resolveLearningPlanGoalIds(learnerId, MATH, List.of(section)))
                .isInstanceOfSatisfying(org.springframework.web.server.ResponseStatusException.class, error ->
                        assertThat(error.getStatusCode().value()).isEqualTo(400));
        // A structure that holds no Physics goal at all stays no selection of a Physics plan.
        String foundations = section.substring(0, section.indexOf(":structure:"))
                + ":structure:physics-required-preparation-physics-sl-unit-hauptphase";
        assertThatThrownBy(() -> learners.resolveLearningPlanGoalIds(learnerId, physics, List.of(foundations)))
                .isInstanceOfSatisfying(org.springframework.web.server.ResponseStatusException.class, error ->
                        assertThat(error.getStatusCode().value()).isEqualTo(400));
    }

    // A section of a Physics view asks for Physics, also when it holds the learning place of a
    // Mathematics preparation. The exam of the Mathematics plan binds Mathematics: it must not take
    // the Physics goals of a plan or focus on such a section, and the Mathematics preparation under
    // the section stays bound by it, for the offer and for the write (issue #216, both found by the
    // independent reviews: the subjects of a focus were derived from every goal under it).
    @Test
    void examOfAnotherSubjectBindsItsOwnGoalsUnderASectionAndNothingElse() throws Exception {
        String physics = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
        // "Flächen mit Integralen berechnen" and "Integralterme interpretieren und begründen"
        String integral = "e9114fc2-1a87-5ef5-8fa3-7ee4c9bbe0dd";
        var integrals = List.of(integral, "34604a97-0c64-5b06-81e2-6ac818732d60");
        learners.chooseLevelCompletion(learnerId, new LevelCompletionActionRequest("leaveProfile", PROFILE, null, null, version()));
        String section = configurePhysicsTestUnit(null, "SekII", "LK", "DE-SL", "physics-sl-e-topic-a23348c3fbeb");
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        var curriculum = mapper.readValue(learner.getPersonalCurriculum(), com.fasterxml.jackson.databind.node.ObjectNode.class);
        curriculum.set(MATH, mapper.valueToTree(Map.of("selected", true, "filterId", "LK")));
        learner.setPersonalCurriculum(mapper.writeValueAsString(curriculum));
        learner.setAutoPilot(false);
        learnerRepository.saveAndFlush(learner);
        var today = java.time.LocalDate.now(java.time.ZoneId.of("Europe/Berlin"));
        var monday = today.with(java.time.DayOfWeek.MONDAY);
        var selected = learners.resolveLearningPlanGoalIds(learnerId, physics, List.of(section));
        // "Monotonie und Extrema mit der ersten Ableitung untersuchen", no preparation of the section.
        String mathGoal = "2850e8f6-2330-50d3-a577-d519540d9924";
        assertThat(compositionViews.resolveStructureReference(section).referencedGoalIds())
                .containsAll(integrals).doesNotContain(mathGoal);
        // Everything the section builds on is done, except the two Mathematics goals that have
        // their learning place in it: the first of them is what the section offers from Mathematics.
        var graph = new CompletionProfileCompiler().normalizePrerequisites(
                learners.getLearningPlanCompletionContext(learnerId).canonicalGoals());
        var prior = new java.util.HashSet<String>();
        for (String goal : selected) prior.addAll(graph.transitivePrerequisites(goal));
        prior.removeAll(selected);
        prior.removeAll(integrals);
        prior.remove(mathGoal);
        var masteredBy = learnerRepository.findById(learnerId).orElseThrow();
        masteryRepository.saveAllAndFlush(prior.stream().map(id -> new Mastery(masteredBy, id, 1.0)).toList());
        learningPlans.upsert(learnerId, physics, new LearnerLearningPlanApi.UpsertRequest(0L, "Kraft und Bewegung", List.of(
                new LearnerLearningPlanApi.Block("section", "learning", section, "Kraft und Bewegung", monday,
                        monday.plusDays(6), null, selected, List.of(section), true))), today);
        transactions.executeWithoutResult(status -> {
            var following = learnerRepository.findById(learnerId).orElseThrow();
            following.setFollowLearningPlans(true);
            learnerRepository.saveAndFlush(following);
        });
        java.util.function.Predicate<String> isPhysics = id -> physics.equals(landscapeDefinitions.getLandscapeIdForGoal(id));
        java.util.function.Supplier<List<String>> manualChoices = () -> learningPlans.getManualCoachPlanGoals(learnerId, "de-DE")
                .orElseThrow().stream().map(LearnerLearningPlanService.CoachPlanGoal::goalId).toList();
        var frontierBefore = learners.getFrontier(learnerId);
        var physicsBefore = frontierBefore.stream().filter(isPhysics).toList();
        var nextBefore = learningPlans.getPlan(learnerId, physics, today).nextEligibleGoal();
        var choicesBefore = manualChoices.get();
        assertThat(physicsBefore).isNotEmpty().isSubsetOf(selected);
        assertThat(frontierBefore).contains(integral);
        assertThat(nextBefore).isNotNull();
        assertThat(selected).contains(nextBefore.goalId());
        // The choices in chat are those of Physics, with the Mathematics goals Physics still needs.
        assertThat(choicesBefore).anyMatch(isPhysics).contains(integral);

        // Two exam days: the next one on another topic, a later one exactly on the Mathematics goal
        // of the section. The exam that is going on is the next one; asking about the goal of the
        // later exam must not select that exam.
        var mathPlan = learningPlans.upsert(learnerId, MATH, new LearnerLearningPlanApi.UpsertRequest(0L, "Mathematik mit Klausuren", List.of(
                new LearnerLearningPlanApi.Block("topic", "learning", mathGoal, "Mathematik", monday, monday.plusDays(4),
                        null, List.of(mathGoal), List.of(mathGoal), true),
                new LearnerLearningPlanApi.Block("exam", "milestone", null, "Klausur",
                        null, null, monday.plusDays(10), null, List.of(mathGoal), true),
                new LearnerLearningPlanApi.Block("later-topic", "learning", integral, "Integrale", monday.plusDays(11),
                        monday.plusDays(15), null, List.of(integral), List.of(integral), true),
                new LearnerLearningPlanApi.Block("later-exam", "milestone", null, "Spätere Klausur",
                        null, null, monday.plusDays(20), null, List.of(integral), true))), today);
        assertThat(mathPlan.stale()).isFalse();
        assertThat(mathPlan.learningScope().kind()).isEqualTo("exam");
        assertThat(mathPlan.learningScope().goalIds()).containsExactly(mathGoal);

        // Physics under the section is untouched: the offer, the next goal of the plan and the
        // choices in chat.
        var frontierAfter = learners.getFrontier(learnerId);
        assertThat(frontierAfter.stream().filter(isPhysics).toList()).isEqualTo(physicsBefore);
        assertThat(learningPlans.getPlan(learnerId, physics, today).nextEligibleGoal()).isEqualTo(nextBefore);
        var choicesAfter = manualChoices.get();
        assertThat(choicesAfter.stream().filter(isPhysics).toList())
                .isEqualTo(choicesBefore.stream().filter(isPhysics).toList());
        // The Mathematics goal under the section lies outside the exam that is going on: under the
        // section it is neither offered nor started. (The choices in chat judge each goal as its
        // own focus, as the explicit request for a subject does; that rule is not this test's.)
        assertThat(frontierAfter).doesNotContain(integral);
        String activeBefore = learners.getLearner(learnerId).getActiveGoalId();
        assertThatThrownBy(() -> learners.setActiveGoal(learnerId, integral))
                .isInstanceOfSatisfying(org.springframework.web.server.ResponseStatusException.class, error ->
                        assertThat(error.getStatusCode().value()).isEqualTo(409));
        assertThat(learners.getLearner(learnerId).getActiveGoalId()).isEqualTo(activeBefore);
        // A Physics goal of the section starts.
        learners.setActiveGoal(learnerId, physicsBefore.getFirst());
        assertThat(learners.getLearner(learnerId).getActiveGoalId()).isEqualTo(physicsBefore.getFirst());

        // Once the exam that is going on is the one on the Mathematics goal of the section, the
        // section offers that goal again and it starts.
        learningPlans.upsert(learnerId, MATH, new LearnerLearningPlanApi.UpsertRequest(mathPlan.revision(), "Mathematik mit Klausur", List.of(
                new LearnerLearningPlanApi.Block("later-topic", "learning", integral, "Integrale", monday,
                        monday.plusDays(4), null, List.of(integral), List.of(integral), true),
                new LearnerLearningPlanApi.Block("later-exam", "milestone", null, "Klausur",
                        null, null, monday.plusDays(10), null, List.of(integral), true))), today);
        assertThat(learners.getFrontier(learnerId)).contains(integral)
                .filteredOn(isPhysics).containsExactlyElementsOf(physicsBefore);
        learners.setActiveGoal(learnerId, integral);
        assertThat(learners.getLearner(learnerId).getActiveGoalId()).isEqualTo(integral);
    }

    // The same binding holds for the opening of the other subject: the E-phase of the Physics view
    // holds the place of "Warum Mathematik?". While a Mathematics exam is going on that does not
    // contain it, a focus on that Physics section neither offers nor starts it (issue #216, found by
    // the independent review). The opening of Physics is untouched.
    @Test
    void openingOfAnotherSubjectUnderASectionIsBoundByThatSubjectsExam() throws Exception {
        String physics = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
        String physicsOpening = "5c44b9ba-9b05-4774-95d5-073230d3fc4f";
        String mathOpening = "71cec9fb-3751-4d61-8b34-c5adbbf6e5f2";
        String mathGoal = "2850e8f6-2330-50d3-a577-d519540d9924";
        learners.chooseLevelCompletion(learnerId, new LevelCompletionActionRequest("leaveProfile", PROFILE, null, null, version()));
        String section = configurePhysicsTestUnit(null, "SekII", "LK", "DE-SL", "physics-sl-unit-e");
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        var curriculum = mapper.readValue(learner.getPersonalCurriculum(), com.fasterxml.jackson.databind.node.ObjectNode.class);
        curriculum.set(MATH, mapper.valueToTree(Map.of("selected", true, "filterId", "LK")));
        learner.setPersonalCurriculum(mapper.writeValueAsString(curriculum));
        learnerRepository.saveAndFlush(learner);
        var today = java.time.LocalDate.now(java.time.ZoneId.of("Europe/Berlin"));
        var monday = today.with(java.time.DayOfWeek.MONDAY);
        var selected = learners.resolveLearningPlanGoalIds(learnerId, physics, List.of(section));
        learningPlans.upsert(learnerId, physics, new LearnerLearningPlanApi.UpsertRequest(0L, "Einführungsphase", List.of(
                new LearnerLearningPlanApi.Block("section", "learning", section, "Einführungsphase", monday,
                        monday.plusDays(6), null, selected, List.of(section), true))), today);
        transactions.executeWithoutResult(status -> {
            var following = learnerRepository.findById(learnerId).orElseThrow();
            following.setFollowLearningPlans(true);
            learnerRepository.saveAndFlush(following);
        });
        assertThat(learners.getFrontier(learnerId)).contains(physicsOpening, mathOpening);

        learningPlans.upsert(learnerId, MATH, new LearnerLearningPlanApi.UpsertRequest(0L, "Mathematik mit Klausur", List.of(
                new LearnerLearningPlanApi.Block("topic", "learning", mathGoal, "Mathematik", monday, monday.plusDays(4),
                        null, List.of(mathGoal), List.of(mathGoal), true),
                new LearnerLearningPlanApi.Block("exam", "milestone", null, "Klausur",
                        null, null, monday.plusDays(10), null, List.of(mathGoal), true))), today);
        assertThat(learningPlans.getPlan(learnerId, MATH, today).stale()).isFalse();

        assertThat(learners.getFrontier(learnerId)).contains(physicsOpening).doesNotContain(mathOpening);
        assertThatThrownBy(() -> learners.setActiveGoal(learnerId, mathOpening))
                .isInstanceOfSatisfying(org.springframework.web.server.ResponseStatusException.class, error ->
                        assertThat(error.getStatusCode().value()).isEqualTo(409));
        learners.setActiveGoal(learnerId, physicsOpening);
        assertThat(learners.getLearner(learnerId).getActiveGoalId()).isEqualTo(physicsOpening);
    }

    // The exam of the other subject is judged as it will be once the focus of the continuation is
    // stored. A stored focus that binds a later Mathematics exam must not let a Physics continuation
    // announce a goal that the write then refuses (issue #216, found by the independent review).
    @Test
    void continuationUnderASectionJudgesTheOtherSubjectsExamAsTheWriteWill() throws Exception {
        String physics = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
        String physicsOpening = "5c44b9ba-9b05-4774-95d5-073230d3fc4f";
        String mathOpening = "71cec9fb-3751-4d61-8b34-c5adbbf6e5f2";
        String mathGoal = "2850e8f6-2330-50d3-a577-d519540d9924";
        learners.chooseLevelCompletion(learnerId, new LevelCompletionActionRequest("leaveProfile", PROFILE, null, null, version()));
        String section = configurePhysicsTestUnit(null, "SekII", "LK", "DE-SL", "physics-sl-unit-e");
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        var curriculum = mapper.readValue(learner.getPersonalCurriculum(), com.fasterxml.jackson.databind.node.ObjectNode.class);
        curriculum.set(MATH, mapper.valueToTree(Map.of("selected", true, "filterId", "LK")));
        learner.setPersonalCurriculum(mapper.writeValueAsString(curriculum));
        learner.setAutoPilot(false);
        learnerRepository.saveAndFlush(learner);
        masteryRepository.saveAndFlush(new Mastery(learner, physicsOpening, 1.0));
        var today = java.time.LocalDate.now(java.time.ZoneId.of("Europe/Berlin"));
        var monday = today.with(java.time.DayOfWeek.MONDAY);
        var selected = learners.resolveLearningPlanGoalIds(learnerId, physics, List.of(section));
        learningPlans.upsert(learnerId, physics, new LearnerLearningPlanApi.UpsertRequest(0L, "Einführungsphase", List.of(
                new LearnerLearningPlanApi.Block("section", "learning", section, "Einführungsphase", monday,
                        monday.plusDays(6), null, selected, List.of(section), true))), today);
        // Mathematics: the next exam on its opening, a later one on another goal.
        learningPlans.upsert(learnerId, MATH, new LearnerLearningPlanApi.UpsertRequest(0L, "Mathematik mit Klausuren", List.of(
                new LearnerLearningPlanApi.Block("topic", "learning", mathOpening, "Einstieg", monday, monday.plusDays(4),
                        null, List.of(mathOpening), List.of(mathOpening), true),
                new LearnerLearningPlanApi.Block("exam", "milestone", null, "Klausur",
                        null, null, monday.plusDays(10), null, List.of(mathOpening), true),
                new LearnerLearningPlanApi.Block("later-topic", "learning", mathGoal, "Ableitung", monday.plusDays(11),
                        monday.plusDays(15), null, List.of(mathGoal), List.of(mathGoal), true),
                new LearnerLearningPlanApi.Block("later-exam", "milestone", null, "Spätere Klausur",
                        null, null, monday.plusDays(20), null, List.of(mathGoal), true))), today);
        // The stored focus binds the later Mathematics exam.
        learners.setPlannedGoals(learnerId, java.util.Set.of(mathGoal));
        transactions.executeWithoutResult(status -> {
            var following = learnerRepository.findById(learnerId).orElseThrow();
            following.setFollowLearningPlans(true);
            learnerRepository.saveAndFlush(following);
        });
        // What the plan names as its next step is what the continuation starts. Under the section
        // the stored binding of the later exam is gone: the exam going on in Mathematics is the next
        // one, its topic is the opening of Mathematics, and that required opening comes first.
        var plan = learningPlans.getPlan(learnerId, physics, today);
        assertThat(plan.canContinue()).isTrue();
        assertThat(plan.nextEligibleGoal()).isNotNull();
        var response = learningPlans.continuePlan(learnerId, plan.planId(),
                new LearnerLearningPlanApi.ContinueRequest(plan.revision(), today));
        assertThat(response.activeGoalId()).isEqualTo(plan.nextEligibleGoal().goalId())
                .isEqualTo(learners.getLearner(learnerId).getActiveGoalId()).isEqualTo(mathOpening);
    }

    @SuppressWarnings("unchecked") private Map<String, Object> map(Map<String, Object> parent, String key) {
        assertThat(parent.get(key)).as(key).isInstanceOf(Map.class); return (Map<String, Object>) parent.get(key);
    }
}
