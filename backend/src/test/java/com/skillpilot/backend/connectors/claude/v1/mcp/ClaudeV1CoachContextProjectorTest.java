package com.skillpilot.backend.connectors.claude.v1.mcp;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.skillpilot.backend.ai.CoachStateProjection;
import com.skillpilot.backend.ai.CoachToolFacade;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.LearnerGoals;
import com.skillpilot.backend.api.PersonalizationPlan;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.landscape.LandscapeFilter;
import com.skillpilot.backend.landscape.LandscapeSummary;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.Test;

class ClaudeV1CoachContextProjectorTest {

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
