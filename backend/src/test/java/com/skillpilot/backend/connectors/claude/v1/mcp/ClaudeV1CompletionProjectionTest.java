package com.skillpilot.backend.connectors.claude.v1.mcp;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.skillpilot.backend.ai.CoachStateProjection;
import com.skillpilot.backend.ai.CoachToolFacade;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.LevelCompletionResponse;
import com.skillpilot.backend.api.StateMachineInfo;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.completion.CompletionCallContext;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.Test;

class ClaudeV1CompletionProjectionTest {
    static LevelCompletionResponse completion(long revision, boolean directRunning) {
        return new LevelCompletionResponse("valid", "private-context", "private-profile", "1", "private-generation", revision,
                Map.of("de", "Skalarprodukt", "en", "Dot product"), false, 0, 0, 2, 2, 0, 1, List.of(),
                List.of(new LevelCompletionResponse.Assessment("exam", Map.of("de", "Projektion prüfen", "en", "Assess projection"),
                        false, !directRunning, directRunning ? "assessment_running" : null)), List.of(),
                "required", directRunning, null,
                List.of(new LevelCompletionResponse.Action("leaveProfile", null,
                                Map.of("de", "Zur regulären Lernansicht", "en", "Return to regular learning"), null),
                        new LevelCompletionResponse.Action("learnGoal", "preparation",
                                Map.of("de", "Projektion verstehen", "en", "Understand projection"), "required")));
    }

    static UnifiedLearnerStateResponse state(LevelCompletionResponse completion) {
        FrontierGoal goal = new FrontierGoal("preparation", "Projektion verstehen", "Description", "atomic", "tutor",
                null, "test", List.of(), List.of(), null, null, null, null);
        return new UnifiedLearnerStateResponse(null, null, List.of(goal), null, List.of(), List.of(), Set.of(),
                "TEACHING", goal, new StateMachineInfo("TEACHING", "teachActiveGoal", List.of(goal), List.of(), goal), completion);
    }

    static CompletionCallContext supported() {
        return new CompletionCallContext("claude", "private-session-hash", Instant.now().plusSeconds(600), true);
    }

    @Test
    void supportedContextOffersBoundLocalizedChoicesWithoutRawProfileOrGenerationIds() {
        CoachToolFacade facade = mock(CoachToolFacade.class);
        when(facade.getLearnerState("learner")).thenReturn(state(completion(10, false)));
        ClaudeV1CoachContextProjector projector = new ClaudeV1CoachContextProjector(new CoachStateProjection("https://skillpilot.com"), facade);
        Map<String, Object> result = CompletionCallContext.with(supported(), () -> projector.projectContext("learner", 10, "en"));
        assertThat(result.get("activeGoal")).isNotNull();
        assertThat(result.get("frontier")).isEqualTo(List.of());
        assertThat(result.toString()).contains("Try assessment directly: Assess projection", "Continue learning: Understand projection");
        assertThat(result.toString()).doesNotContain("private-profile", "private-generation", "private-session-hash", "private-context");
        Map<?, ?> today = (Map<?, ?>) result.get("learningPlanToday");
        assertThat(today.get("resumeAvailable")).isEqualTo(false);
        assertThat(today.get("followLearningPlans")).isEqualTo(false);
    }

    @Test
    void anOldSessionStopsTeachingInsteadOfReceivingUnfilteredGoalSuggestions() {
        CoachToolFacade facade = mock(CoachToolFacade.class);
        when(facade.getLearnerState("learner")).thenReturn(state(completion(10, true)));
        ClaudeV1CoachContextProjector projector = new ClaudeV1CoachContextProjector(new CoachStateProjection("https://skillpilot.com"), facade);
        Map<String, Object> result = CompletionCallContext.with(
                new CompletionCallContext("claude", "old-session-hash", Instant.now().plusSeconds(600), false),
                () -> projector.projectContext("learner", 10, "de"));
        assertThat(result.get("activeGoal")).isNull();
        assertThat(result.get("frontier")).isEqualTo(List.of());
        Map<?, ?> completion = (Map<?, ?>) result.get("levelCompletion");
        assertThat(completion.get("choices")).isEqualTo(List.of());
        assertThat(completion.get("notice").toString()).contains("Pausiere", "Cockpit");
        assertThat(result).doesNotContainKey("goalVisualization");
    }

    @Test
    void explainsOnlyTheCurrentWaivedPreparationWithLocalizedAssessmentTitles() {
        var detail = new LevelCompletionResponse.WaiverDetail("goal", Map.of("de", "Projektion verstehen", "en", "Understand projection"),
                "static-rule", List.of(new LevelCompletionResponse.AssessmentReference("exam",
                Map.of("de", "Projektion erklären", "en", "Explain projection"))), 1);
        var response = new LevelCompletionResponse("valid", "context", "profile", "1", "generation", 10,
                Map.of("de", "Abschnitt", "en", "Section"), true, 1, 1, 0, 2, 1, 1,
                List.of("goal"), List.of(), List.of(), "required", false, null, List.of()).withWaiverDetails(List.of(detail));
        var projected = ClaudeV1CompletionChoices.project(response, "en");
        assertThat(projected.toString()).contains("Understand projection", "Explain projection", "Only this learning section");
        assertThat(projected.toString()).doesNotContain("static-rule");
    }

    @Test
    void ordinaryContextPublishesDirectAssessmentChoiceWithoutExposingPrivateIdsOrSelectingASection() {
        var offered = new LevelCompletionResponse("unresolved", null, null, null, "private-generation", 10,
                null, null, 0, 0, 0, 0, 0, 0, List.of(), List.of(), List.of(
                new LevelCompletionResponse.ProfileOption("private-profile", Map.of("en", "Geometry"), 2, 1,
                        List.of(new LevelCompletionResponse.Assessment("private-exam", Map.of("en", "Explain projection"),
                                false, true, null)))), null, false, null, List.of());
        CompletionCallContext.with(supported(), () -> {
            var choices = ClaudeV1CompletionChoices.published(offered, "en");
            assertThat(choices).anySatisfy(choice -> {
                assertThat(choice.label()).isEqualTo("Try assessment directly: Explain projection");
                assertThat(choice.request(10)).hasFieldOrPropertyWithValue("action", "startAssessment")
                        .hasFieldOrPropertyWithValue("profileId", "private-profile")
                        .hasFieldOrPropertyWithValue("goalId", "private-exam");
            });
            var projected = ClaudeV1CompletionChoices.project(offered, "en");
            assertThat(projected.toString()).contains("Explain projection").doesNotContain(
                    "private-profile", "private-exam", "private-generation", "taskContent", "solutionContent");
            assertThat(ClaudeV1CompletionChoices.active(offered)).isFalse();
            return null;
        });
        assertThat(ClaudeV1CompletionChoices.published(offered, "en")).isEmpty();
    }

    @Test
    void unavailablePreviewCannotOfferASectionSelection() {
        var unavailable = new LevelCompletionResponse("unavailable", null, null, null, "generation", 10,
                null, null, 0, 0, 0, 0, 0, 0, List.of(), List.of(), List.of(
                new LevelCompletionResponse.ProfileOption("profile", Map.of("de", "Geometrie"), 2, 1)),
                null, false, "completion_mastery_unavailable", List.of());
        assertThat(CompletionCallContext.with(supported(), () -> ClaudeV1CompletionChoices.published(unavailable, "de"))).isEmpty();
    }

    @Test
    void choicesResolveToAuthorizedActionsAndAmbiguousNamesAreNeverExecutable() {
        CompletionCallContext.with(supported(), () -> {
            var offered = new LevelCompletionResponse("unresolved", null, null, null, "private-generation", 10,
                    null, null, 0, 0, 0, 0, 0, 0, List.of(), List.of(), List.of(
                    new LevelCompletionResponse.ProfileOption("private-offered-profile",
                            Map.of("de", "Lernabschnitt", "en", "Learning section"), 2, 1)), null, false, null, List.of());
            var preview = ClaudeV1CompletionChoices.project(offered, "en");
            assertThat(preview.get("sections")).isEqualTo(List.of(Map.of("title", "Learning section",
                    "targetCount", 2, "requiredAssessmentCount", 1)));
            assertThat(preview.toString()).doesNotContain("private-offered-profile", "private-generation");
            var choices = ClaudeV1CompletionChoices.published(completion(10, false), "de");
            var exam = choices.stream().filter(choice -> "startAssessment".equals(choice.action())).findFirst().orElseThrow();
            assertThat(exam.request(10)).hasFieldOrPropertyWithValue("profileId", "private-profile")
                    .hasFieldOrPropertyWithValue("goalId", "exam").hasFieldOrPropertyWithValue("expectedRevision", 10L);
            LevelCompletionResponse source = completion(10, false);
            LevelCompletionResponse ambiguous = new LevelCompletionResponse(source.calculationStatus(), source.contextRef(), source.profileId(),
                    source.profileRevision(), source.curriculumGeneration(), source.learnerRevision(), source.title(), source.complete(),
                    source.masteredTargetCount(), source.waivedTargetCount(), source.pendingTargetCount(), source.targetCount(),
                    source.masteredAssessmentCount(), source.requiredAssessmentCount(), source.waivedTargetGoalIds(), source.assessments(),
                    source.profileOptions(), source.navigationIntent(), source.directAssessmentRunning(), source.notice(),
                    List.of(new LevelCompletionResponse.Action("learnGoal", "one", Map.of("de", "Gleich"), "required"),
                            new LevelCompletionResponse.Action("learnGoal", "two", Map.of("de", "Gleich"), "required")));
            assertThat(ClaudeV1CompletionChoices.published(ambiguous, "de").stream().map(ClaudeV1CompletionChoices.Choice::label))
                    .doesNotContain("Weiterlernen: Gleich");
            return null;
        });
    }
}
