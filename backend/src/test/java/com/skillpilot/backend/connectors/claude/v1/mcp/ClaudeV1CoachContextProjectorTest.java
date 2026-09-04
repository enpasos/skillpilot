package com.skillpilot.backend.connectors.claude.v1.mcp;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.skillpilot.backend.ai.CoachStateProjection;
import com.skillpilot.backend.ai.CoachToolFacade;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.GoalSourceLink;
import com.skillpilot.backend.api.LearnerGoals;
import com.skillpilot.backend.api.LearnerPlanTodayStatus;
import com.skillpilot.backend.api.OrientationOutlook;
import com.skillpilot.backend.api.PersonalizationPlan;
import com.skillpilot.backend.api.StateMachineInfo;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.landscape.LandscapeFilter;
import com.skillpilot.backend.landscape.LandscapeSummary;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.Test;

class ClaudeV1CoachContextProjectorTest {

    @Test
    @SuppressWarnings("unchecked")
    void contextPublishesOnlySanitizedAdditiveDailyPlanCounts() {
        CoachStateProjection stateProjection = mock(CoachStateProjection.class);
        CoachToolFacade toolFacade = mock(CoachToolFacade.class);
        ClaudeV1CoachContextProjector projector = new ClaudeV1CoachContextProjector(
                stateProjection,
                toolFacade,
                "https://skillpilot.com");
        UnifiedLearnerStateResponse state = state(null, List.of(), "setActiveGoal");
        LearnerPlanTodayStatus today = new LearnerPlanTodayStatus(
                LocalDate.of(2026, 9, 4),
                true,
                true,
                List.of(
                        new LearnerPlanTodayStatus.SubjectStatus(
                                "private-math-a", "Mathematik\n", 3, 1, 2, 4),
                        new LearnerPlanTodayStatus.SubjectStatus(
                                "private-physics", "Physik", 4, 1, 3, 2),
                        new LearnerPlanTodayStatus.SubjectStatus(
                                "private-math-b", "Mathematik", 2, 1, 1, 1),
                        new LearnerPlanTodayStatus.SubjectStatus(
                                "private-invalid", "Private invalid subject", 1, 1, 1, 0)),
                new LearnerPlanTodayStatus.Totals(999, 999, 999, 999),
                2);
        when(toolFacade.getLearnerState("internal-learner")).thenReturn(state);
        when(stateProjection.project(state)).thenReturn(state);
        when(toolFacade.getPersonalizationPlan("internal-learner"))
                .thenReturn(PersonalizationPlan.complete(List.of()));
        when(toolFacade.getLearningPlanTodayStatus("internal-learner", "de")).thenReturn(today);

        Map<String, Object> context = projector.projectContext("internal-learner", 12, "de");

        Map<String, Object> projected =
                (Map<String, Object>) context.get("learningPlanToday");
        assertEquals("2026-09-04", projected.get("asOf"));
        assertEquals(true, projected.get("followLearningPlans"));
        assertEquals(true, projected.get("resumeAvailable"));
        assertEquals(3, projected.get("unavailablePlanCount"));
        assertEquals(
                List.of(
                        Map.of(
                                "subject", "Mathematik",
                                "dueToday", 5,
                                "completedToday", 2,
                                "openToday", 3,
                                "openOverdue", 5),
                        Map.of(
                                "subject", "Physik",
                                "dueToday", 4,
                                "completedToday", 1,
                                "openToday", 3,
                                "openOverdue", 2)),
                projected.get("subjects"));
        assertEquals(
                Map.of(
                        "dueToday", 9,
                        "completedToday", 3,
                        "openToday", 6,
                        "openOverdue", 7),
                projected.get("totals"));
        assertFalse(projected.toString().contains("private-"));

        Map<String, Object> withActiveGoal = projector.projectLearningPlanToday(today, true);
        assertEquals(false, withActiveGoal.get("resumeAvailable"));
    }

    @Test
    void orientationContextOmitsAnUnavailableOutlookInsteadOfPublishingNull() {
        CoachStateProjection stateProjection = mock(CoachStateProjection.class);
        CoachToolFacade toolFacade = mock(CoachToolFacade.class);
        ClaudeV1CoachContextProjector projector =
                new ClaudeV1CoachContextProjector(stateProjection, toolFacade);
        FrontierGoal activeGoal = orientationGoal();
        UnifiedLearnerStateResponse state = stateWithActiveGoal(activeGoal);
        when(toolFacade.getLearnerState("internal-learner")).thenReturn(state);
        when(stateProjection.project(state)).thenReturn(state);
        when(toolFacade.getPersonalizationPlan("internal-learner"))
                .thenReturn(PersonalizationPlan.complete(List.of()));
        when(toolFacade.getOrientationOutlook("internal-learner", "de")).thenReturn(null);

        Map<String, Object> context = projector.projectContext("internal-learner", 7, "de");

        assertFalse(context.containsKey("orientationOutlook"));
    }

    @Test
    @SuppressWarnings("unchecked")
    void orientationContextPublishesMotivationalContentWithoutTransitionIdentifiers() {
        CoachStateProjection stateProjection = mock(CoachStateProjection.class);
        CoachToolFacade toolFacade = mock(CoachToolFacade.class);
        ClaudeV1CoachContextProjector projector =
                new ClaudeV1CoachContextProjector(stateProjection, toolFacade);
        FrontierGoal activeGoal = orientationGoal();
        UnifiedLearnerStateResponse state = stateWithActiveGoal(activeGoal);
        OrientationOutlook outlook = new OrientationOutlook(
                activeGoal.id(),
                List.of(new OrientationOutlook.Path(
                        "internal-path-id",
                        "Technik verstehen",
                        "Du lernst, technische Systeme zu erklären.",
                        List.of("Smartphone"),
                        List.of(new OrientationOutlook.GoalReference(
                                "internal-goal-id", "Funkwellen untersuchen")),
                        List.of("internal-transition-goal"))));
        when(toolFacade.getLearnerState("internal-learner")).thenReturn(state);
        when(stateProjection.project(state)).thenReturn(state);
        when(toolFacade.getPersonalizationPlan("internal-learner"))
                .thenReturn(PersonalizationPlan.complete(List.of()));
        when(toolFacade.getOrientationOutlook("internal-learner", "de")).thenReturn(outlook);

        Map<String, Object> context = projector.projectContext("internal-learner", 7, "de");

        Map<String, Object> projected = (Map<String, Object>) context.get("orientationOutlook");
        assertNotNull(projected);
        assertEquals(Set.of("paths"), projected.keySet());
        List<Map<String, Object>> paths = (List<Map<String, Object>>) projected.get("paths");
        assertEquals(1, paths.size());
        assertEquals(
                Set.of("title", "learningOutlook", "practicalContexts", "representativeGoals"),
                paths.getFirst().keySet());
        assertEquals(
                List.of(Map.of("title", "Funkwellen untersuchen")),
                paths.getFirst().get("representativeGoals"));
        String visibleProjection = projected.toString();
        assertFalse(visibleProjection.contains("internal-path-id"));
        assertFalse(visibleProjection.contains("internal-goal-id"));
        assertFalse(visibleProjection.contains("internal-transition-goal"));
    }

    @Test
    @SuppressWarnings("unchecked")
    void normalContextKeepsEligibleRedirectGoalsButOmitsTheActiveDuplicate() {
        CoachStateProjection stateProjection = mock(CoachStateProjection.class);
        CoachToolFacade toolFacade = mock(CoachToolFacade.class);
        ClaudeV1CoachContextProjector projector =
                new ClaudeV1CoachContextProjector(stateProjection, toolFacade);
        FrontierGoal backendSelected = goal("backend-selected", List.of());
        FrontierGoal competingA = goal("competing-a", List.of());
        FrontierGoal competingB = goal("competing-b", List.of());
        UnifiedLearnerStateResponse state = state(
                backendSelected,
                List.of(backendSelected, competingA, competingB),
                "teachActiveGoal");
        when(toolFacade.getLearnerState("internal-learner")).thenReturn(state);
        when(stateProjection.project(state)).thenReturn(state);
        when(toolFacade.getPersonalizationPlan("internal-learner"))
                .thenReturn(PersonalizationPlan.complete(List.of()));

        Map<String, Object> context = projector.projectContext("internal-learner", 11, "de");

        assertEquals("backend-selected", ((Map<String, Object>) context.get("activeGoal")).get("id"));
        List<Map<String, Object>> frontier = (List<Map<String, Object>>) context.get("frontier");
        assertEquals(List.of("competing-a", "competing-b"), frontier.stream()
                .map(item -> item.get("id").toString())
                .toList());
        assertEquals(
                "teachActiveGoal",
                ((Map<String, Object>) context.get("stateMachine")).get("requiredAction"));
        assertFalse(frontier.toString().contains("backend-selected"));
    }

    @Test
    @SuppressWarnings("unchecked")
    void backendFrontierRemainsVisibleOnlyWhenNoGoalIsActive() {
        CoachStateProjection stateProjection = mock(CoachStateProjection.class);
        CoachToolFacade toolFacade = mock(CoachToolFacade.class);
        ClaudeV1CoachContextProjector projector =
                new ClaudeV1CoachContextProjector(stateProjection, toolFacade);
        FrontierGoal candidateA = goal("candidate-a", List.of());
        FrontierGoal candidateB = goal("candidate-b", List.of());
        UnifiedLearnerStateResponse state = state(
                null,
                List.of(candidateA, candidateB),
                "setActiveGoal");
        when(toolFacade.getLearnerState("internal-learner")).thenReturn(state);
        when(stateProjection.project(state)).thenReturn(state);
        when(toolFacade.getPersonalizationPlan("internal-learner"))
                .thenReturn(PersonalizationPlan.complete(List.of()));

        Map<String, Object> context = projector.projectContext("internal-learner", 12, "de");

        List<Map<String, Object>> frontier = (List<Map<String, Object>>) context.get("frontier");
        assertEquals(List.of("candidate-a", "candidate-b"), frontier.stream()
                .map(item -> item.get("id").toString())
                .toList());
        assertEquals(
                "setActiveGoal",
                ((Map<String, Object>) context.get("stateMachine")).get("requiredAction"));
    }

    @Test
    void contextOmitsMaintainerDescriptionFilterInventoryAndCompatibilityMetadata() {
        CoachStateProjection stateProjection = mock(CoachStateProjection.class);
        CoachToolFacade toolFacade = mock(CoachToolFacade.class);
        ClaudeV1CoachContextProjector projector =
                new ClaudeV1CoachContextProjector(stateProjection, toolFacade);

        LandscapeFilter courseFilter = new LandscapeFilter();
        courseFilter.setId("GK");
        courseFilter.setLabel("Grundkurs");
        LandscapeSummary curriculum = new LandscapeSummary(
                "internal-curriculum-id",
                "Gymnasium (DE)",
                "M5 is required; CI and QA must pass.",
                "DE",
                "ALL",
                "school",
                "Mathematik",
                "de-DE",
                List.of(courseFilter),
                true,
                true);
        FrontierGoal activeGoal = goal("goal-1", List.of("GK", "canonical", "srs-deck:private-deck"));
        UnifiedLearnerStateResponse rawState = new UnifiedLearnerStateResponse(
                "permanent-skillpilot-id",
                curriculum,
                List.of(activeGoal),
                new LearnerGoals(List.of(activeGoal), 2, 10, null, null, false),
                List.of(),
                List.of("GK"),
                Set.of(),
                "TEACHING",
                activeGoal,
                null);
        when(toolFacade.getLearnerState("internal-learner")).thenReturn(rawState);
        when(stateProjection.project(rawState)).thenReturn(rawState);
        when(toolFacade.getPersonalizationPlan("internal-learner"))
                .thenReturn(PersonalizationPlan.complete(List.of()));

        Map<String, Object> context = projector.projectContext("internal-learner", 7, "de");

        @SuppressWarnings("unchecked")
        Map<String, Object> projectedCurriculum = (Map<String, Object>) context.get("curriculum");
        assertEquals(Map.of("title", "Gymnasium (DE)"), projectedCurriculum);

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> frontier = (List<Map<String, Object>>) context.get("frontier");
        assertTrue(frontier.isEmpty(), "The active goal must not also be offered as a frontier candidate");

        String visibleProjection = context.toString();
        assertFalse(visibleProjection.contains("M5"));
        assertFalse(visibleProjection.contains("CI"));
        assertFalse(visibleProjection.contains("QA"));
        assertFalse(visibleProjection.contains("internal-curriculum-id"));
        assertFalse(visibleProjection.contains("permanent-skillpilot-id"));
        assertFalse(visibleProjection.contains("private-deck"));
        assertFalse(visibleProjection.contains("canonical"));
        assertFalse(visibleProjection.contains("filters"));
        assertFalse(visibleProjection.contains("compatibility"));
        assertFalse(visibleProjection.contains("subject=Mathematik"));
        assertFalse(context.containsKey("presentationInstruction"));
    }

    @Test
    void everyFreshVisualContextPublishesTheMandatoryPairBasedPresentationInstruction() {
        CoachStateProjection stateProjection = mock(CoachStateProjection.class);
        CoachToolFacade toolFacade = mock(CoachToolFacade.class);
        ClaudeV1CoachContextProjector projector =
                new ClaudeV1CoachContextProjector(stateProjection, toolFacade);

        FrontierGoal activeGoal = goalWithLinks(List.of(visualizationLink(
                "/assets/goal-visualizations/goal-1.png", "primary", "approved")));
        UnifiedLearnerStateResponse rawState = new UnifiedLearnerStateResponse(
                "permanent-skillpilot-id",
                curriculum(),
                List.of(activeGoal),
                new LearnerGoals(List.of(activeGoal), 1, 1, null, null, false),
                List.of(),
                List.of(),
                Set.of(),
                "TEACHING",
                activeGoal,
                null);
        when(toolFacade.getLearnerState("internal-learner")).thenReturn(rawState);
        when(stateProjection.project(rawState)).thenReturn(rawState);
        when(toolFacade.getPersonalizationPlan("internal-learner"))
                .thenReturn(PersonalizationPlan.complete(List.of()));
        when(toolFacade.showGoalVisualizationsInChat("internal-learner")).thenReturn(true);

        Map<String, Object> first = projector.projectContext("internal-learner", 41, "de");
        Map<String, Object> afterWrite = projector.projectContext("internal-learner", 42, "de");

        assertEquals(41L, first.get("stateVersion"));
        assertEquals(42L, afterWrite.get("stateVersion"));
        assertEquals(first.get("goalVisualization"), afterWrite.get("goalVisualization"));
        assertEquals(
                ClaudeV1CoachContextProjector.GOAL_VISUALIZATION_PRESENTATION_INSTRUCTION,
                first.get("presentationInstruction"));
        assertEquals(
                ClaudeV1CoachContextProjector.GOAL_VISUALIZATION_PRESENTATION_INSTRUCTION,
                afterWrite.get("presentationInstruction"));
        String instruction = (String) afterWrite.get("presentationInstruction");
        assertTrue(instruction.contains("previously unseen pair"));
        assertTrue(instruction.contains("immediate next SkillPilot tool"));
        assertTrue(instruction.contains("A repeated pair creates no automatic call"));
        assertTrue(instruction.contains("reload the current context once"));
        assertTrue(instruction.contains("Do not retry automatically"));
        assertTrue(instruction.contains("claim that the host displayed"));
        assertTrue(instruction.contains("including voice mode"));
        assertTrue(instruction.contains("never make it carry a task"));
        assertTrue(instruction.contains("assume it is visible"));
        assertTrue(instruction.contains("question that requires inspecting it"));
        assertTrue(instruction.contains("Never infer or request a client type"));
    }

    @Test
    void learningContextUsesLocalizedLabelsWithoutSetupProtocolIdentifiers() {
        CoachStateProjection stateProjection = mock(CoachStateProjection.class);
        CoachToolFacade toolFacade = mock(CoachToolFacade.class);
        ClaudeV1CoachContextProjector projector =
                new ClaudeV1CoachContextProjector(stateProjection, toolFacade);

        PersonalizationPlan.Option stage = option(
                "opaque-stage-option",
                "scope-stage-code",
                "Sekundarstufe II",
                "Upper secondary",
                null,
                null);
        PersonalizationPlan.Option subject = option(
                "opaque-subject-option",
                null,
                null,
                null,
                "Mathematik",
                "Mathematics");
        PersonalizationPlan plan = PersonalizationPlan.complete(
                List.of(),
                List.of(
                        decision("internal-stage-group", "Schulstufe", "School stage", stage),
                        decision("internal-subject-group", "Fach", "Subject", subject)));

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> german = projector.projectLearningContext(plan, "de-DE");
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> english = projector.projectLearningContext(plan, "en-US");

        assertEquals(
                List.of(
                        Map.of("label", "Schulstufe", "values", List.of("Sekundarstufe II")),
                        Map.of("label", "Fach", "values", List.of("Mathematik"))),
                german);
        assertEquals(
                List.of(
                        Map.of("label", "School stage", "values", List.of("Upper secondary")),
                        Map.of("label", "Subject", "values", List.of("Mathematics"))),
                english);

        String projection = english.toString();
        assertFalse(projection.contains("opaque"));
        assertFalse(projection.contains("internal"));
        assertFalse(projection.contains("scope-stage-code"));
    }

    @Test
    void goalProjectionKeepsLearningContentAndControlClassificationButNotRawTags() {
        ClaudeV1CoachContextProjector projector = new ClaudeV1CoachContextProjector(
                mock(CoachStateProjection.class), mock(CoachToolFacade.class));

        Map<String, Object> projected = projector.formatGoal(
                goal("goal-1", List.of("GK", "canonical", "srs-deck:private-deck")));

        assertEquals("Bogenmaß nutzen", projected.get("title"));
        assertEquals("Winkel im Bogenmaß verstehen und anwenden.", projected.get("description"));
        assertEquals("tutor", projected.get("nodeKind"));
        assertEquals("content", projected.get("semanticKind"));
        assertFalse(projected.containsKey("tags"));
        assertTrue(projected.containsKey("id"), "The opaque goal id remains available for tool calls");
    }

    @Test
    void goalVisualizationProjectionAcceptsOnlyTheExactCanonicalGoalAssetShape() {
        ClaudeV1CoachContextProjector projector = new ClaudeV1CoachContextProjector(
                mock(CoachStateProjection.class),
                mock(CoachToolFacade.class),
                "https://skillpilot.com/");
        LandscapeSummary curriculum = new LandscapeSummary(
                "curriculum with spaces",
                "Gymnasium (DE)",
                null,
                "DE",
                "ALL",
                "school",
                "Mathematik",
                "de-DE",
                List.of(),
                true,
                true);
        GoalSourceLink link = visualizationLink(
                "/assets/goal-visualizations/goal-1.png", "primary", "approved");
        FrontierGoal goal = goalWithLinks(List.of(link));

        assertEquals(
                Map.of(
                        "goalId", "goal-1",
                        "title", "Bogenmaß nutzen",
                        "imageUrl", "https://skillpilot.com/assets/goal-visualizations/goal-1.png",
                        "altText", "Ein Koordinatensystem zum Lernziel.",
                        "cockpitUrl", "https://skillpilot.com/?l=curriculum+with+spaces&goal=goal-1"),
                projector.projectGoalVisualization(curriculum, goal, "de"));

        GoalSourceLink traversal = visualizationLink(
                "/assets/goal-visualizations/../secret.png", "primary", "approved");
        assertNull(projector.projectGoalVisualization(curriculum, goalWithLinks(List.of(traversal)), "de"));
    }

    @Test
    void goalVisualizationProjectionAllowsOnlyCuratedReviewStatuses() {
        ClaudeV1CoachContextProjector projector = new ClaudeV1CoachContextProjector(
                mock(CoachStateProjection.class), mock(CoachToolFacade.class));

        for (String status : List.of(
                "pilot", "accepted", "approved", "release_approved", "released", " RELEASED ")) {
            assertNotNull(
                    projector.projectGoalVisualization(
                            curriculum(),
                            goalWithLinks(List.of(visualizationLink(
                                    "/assets/goal-visualizations/goal-1.png", "primary", status))),
                            "de"),
                    status);
        }

        for (String status : Arrays.asList(
                null, "", " ", "draft", "needs_review", "reviewed", "unknown")) {
            assertNull(
                    projector.projectGoalVisualization(
                            curriculum(),
                            goalWithLinks(List.of(visualizationLink(
                                    "/assets/goal-visualizations/goal-1.png", "primary", status))),
                            "de"),
                    String.valueOf(status));
        }
        assertNull(projector.projectGoalVisualization(
                curriculum(),
                goalWithLinks(List.of(visualizationLink(
                        "/assets/goal-visualizations/goal-1.png", null, "approved"))),
                "de"));
    }

    @Test
    void goalVisualizationProjectionFindsValidLinkAfterRejectedLink() {
        ClaudeV1CoachContextProjector projector = new ClaudeV1CoachContextProjector(
                mock(CoachStateProjection.class), mock(CoachToolFacade.class));
        GoalSourceLink draft = visualizationLink(
                "/assets/goal-visualizations/goal-1.png", "primary", "draft");
        GoalSourceLink approved = visualizationLink(
                "/assets/goal-visualizations/goal-1.png", "primary", "approved");

        assertNotNull(projector.projectGoalVisualization(
                curriculum(), goalWithLinks(List.of(draft, approved)), "de"));
    }

    private LandscapeSummary curriculum() {
        return new LandscapeSummary(
                "curriculum-1",
                "Gymnasium (DE)",
                null,
                "DE",
                "ALL",
                "school",
                "Mathematik",
                "de-DE",
                List.of(),
                true,
                true);
    }

    private GoalSourceLink visualizationLink(String url, String role, String reviewStatus) {
        return new GoalSourceLink(
                "goal-visualization",
                "Bild",
                url,
                "image",
                "SkillPilot",
                List.of(),
                null,
                "de",
                null,
                "goal-1",
                role,
                "Ein Koordinatensystem zum Lernziel.",
                reviewStatus);
    }

    private FrontierGoal goalWithLinks(List<GoalSourceLink> links) {
        return new FrontierGoal(
                "goal-1",
                "Bogenmaß nutzen",
                "Winkel im Bogenmaß verstehen und anwenden.",
                "atomic",
                "tutor",
                "content",
                null,
                List.of(),
                links,
                null,
                null,
                null,
                null,
                false);
    }

    private FrontierGoal goal(String id, List<String> tags) {
        return new FrontierGoal(
                id,
                "Bogenmaß nutzen",
                "Winkel im Bogenmaß verstehen und anwenden.",
                "atomic",
                "tutor",
                "content",
                null,
                tags,
                List.of(),
                null,
                null,
                null,
                null,
                false);
    }

    private FrontierGoal orientationGoal() {
        return new FrontierGoal(
                "orientation-goal",
                "Warum dieses Fach?",
                "Entdecke, was du in diesem Fach verstehen und gestalten kannst.",
                "atomic",
                "tutor",
                "orientation",
                null,
                List.of(),
                List.of(),
                null,
                null,
                null,
                null,
                false);
    }

    private UnifiedLearnerStateResponse stateWithActiveGoal(FrontierGoal activeGoal) {
        return new UnifiedLearnerStateResponse(
                null,
                curriculum(),
                List.of(activeGoal),
                new LearnerGoals(List.of(activeGoal), 1, 1, null, null, false),
                List.of("setMastery"),
                List.of(),
                Set.of(),
                "TEACHING",
                activeGoal,
                null);
    }

    private UnifiedLearnerStateResponse state(
            FrontierGoal activeGoal,
            List<FrontierGoal> frontier,
            String requiredAction) {
        return new UnifiedLearnerStateResponse(
                null,
                curriculum(),
                frontier,
                new LearnerGoals(frontier, 0, frontier.size(), null, null, false),
                List.of(),
                List.of(),
                Set.of(),
                "TEACHING",
                activeGoal,
                new StateMachineInfo(
                        "TEACHING",
                        requiredAction,
                        frontier,
                        List.of(),
                        activeGoal));
    }

    private PersonalizationPlan.CompletedDecision decision(
            String groupId,
            String groupLabel,
            String groupLabelEn,
            PersonalizationPlan.Option option) {
        return new PersonalizationPlan.CompletedDecision(
                "opaque-rewind",
                "internal-stage",
                "Kontext festlegen",
                groupId,
                groupLabel,
                "internal-instance",
                List.of(option),
                "Choose context",
                groupLabelEn);
    }

    private PersonalizationPlan.Option option(
            String optionId,
            String scopeValue,
            String scopeLabel,
            String scopeLabelEn,
            String landscapeLabel,
            String landscapeLabelEn) {
        return new PersonalizationPlan.Option(
                optionId,
                "internal-stage",
                "internal-group",
                "internal-instance",
                landscapeLabel == null ? null : "internal-landscape",
                landscapeLabel,
                null,
                null,
                scopeValue == null ? null : "stage",
                scopeValue,
                scopeLabel,
                PersonalizationPlan.OptionKind.VALUE,
                landscapeLabelEn,
                null,
                scopeLabelEn);
    }
}
