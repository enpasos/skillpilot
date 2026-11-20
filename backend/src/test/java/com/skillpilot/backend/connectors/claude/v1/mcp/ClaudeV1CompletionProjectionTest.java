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
import com.skillpilot.backend.api.UnitAssessmentResponse;
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
    void manyOrdinaryChoicesLeaveRoomForExitingAndVoluntaryStudy() {
        var actions = new java.util.ArrayList<LevelCompletionResponse.Action>();
        for (int i = 0; i < 24; i++) {
            actions.add(new LevelCompletionResponse.Action("learnGoal", "required-" + i, Map.of("de", "Lernziel " + i), "required"));
        }
        actions.add(new LevelCompletionResponse.Action("learnGoal", "waived", Map.of("de", "Offene Einzelleistung"), "voluntary"));
        actions.add(new LevelCompletionResponse.Action("leaveProfile", null, Map.of("de", "Zur normalen Lernansicht"), null));
        var result = new LevelCompletionResponse("valid", "scope", "automatic:personal-curriculum", "1", "generation", 10,
                Map.of("de", "Mein Lehrplan"), false, 0, 1, 24, 25, 0, 0, List.of("waived"),
                List.of(), List.of(), "required", false, null, actions);
        var choices = CompletionCallContext.with(supported(), () -> ClaudeV1CompletionChoices.published(result, "de"));
        assertThat(choices).extracting(ClaudeV1CompletionChoices.Choice::label)
                .contains("Zur normalen Lernansicht", "Freiwillig vertiefen: Offene Einzelleistung", "Weiterlernen: Lernziel 0");
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
    void compactUnitContextSummarizesTheWholeUnitWhenOnlySomePartTitlesFit() {
        var parts = java.util.stream.IntStream.range(0, 30).mapToObj(i -> new UnitAssessmentResponse.Part(
                "private-id-" + i, Map.of("en", "Lab " + i), i % 2 == 0)).toList();
        var response = completion(10, false).withUnitAssessment(new UnitAssessmentResponse(
                "private-section", "private-revision", false, parts, List.of(), List.of("private-content")));
        var context = (Map<?, ?>) ClaudeV1CompletionChoices.project(response, "en").get("unitAssessment");
        assertThat(context.get("partCount")).isEqualTo(30);
        assertThat(context.get("passedPartCount")).isEqualTo(15L);
        assertThat((List<?>) context.get("parts")).hasSize(24);
        assertThat(context.toString()).contains("Lab 0").doesNotContain("private-", "Lab 29");
    }

    @Test void compactUnitContextExplainsAnUnavailableMaterialVersionWithoutOfferingANewStart() {
        var part = new UnitAssessmentResponse.Part("private-part", Map.of("de", "Wurf", "en", "Throw"), false, false);
        var response = completion(10, false).withUnitAssessment(new UnitAssessmentResponse(
                "private-section", "private-revision", false, List.of(part), List.of(), List.of()));
        for (String language : List.of("de", "en")) {
            var context = (Map<?, ?>) ClaudeV1CompletionChoices.project(response, language).get("unitAssessment");
            var projected = (Map<?, ?>) ((List<?>) context.get("parts")).getFirst();
            assertThat(projected.get("materialCurrent")).isEqualTo(false);
            assertThat(projected.get("notice").toString()).contains("en".equals(language) ? "unavailable" : "nicht verfügbar");
            assertThat(projected.toString()).doesNotContain("private-", "startAvailable=true");
        }
    }

    @Test
    void explainsAnUnboundHistoricalPartInBothSessionLanguages() {
        var part = new UnitAssessmentResponse.Part("private-exam", Map.of("de", "Wurf", "en", "Throw"), true, true, true);
        var response = completion(10, false).withUnitAssessment(new UnitAssessmentResponse(
                "private-section", "private-revision", true, List.of(part), List.of(), List.of()));
        for (String language : List.of("de", "en")) {
            var context = (Map<?, ?>) ClaudeV1CompletionChoices.project(response, language).get("unitAssessment");
            var projected = (Map<?, ?>) ((List<?>) context.get("parts")).getFirst();
            assertThat(projected.get("passed")).isEqualTo(true);
            assertThat(projected.get("planningCreditNotice").toString()).contains("en".equals(language) ? "planning credit" : "Planungsanrechnung");
            assertThat(projected.toString()).doesNotContain("private-");
        }
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
        assertThat(projected.toString()).contains("Understand projection", "Explain projection", "Preparation for this learning section is optional");
        assertThat(projected.get("text").toString()).contains("goals credited for planning (0)", "preparation waived (1)");
        var credited = ClaudeV1CompletionChoices.project(response.withPlanningCreditGoalIds(List.of("goal")), "en");
        assertThat(credited.get("text").toString()).contains("goals credited for planning (1)", "preparation waived (0)");
        assertThat(projected.toString()).doesNotContain("static-rule");
    }

    @Test
    void implicitCompletionWithoutAssessmentsDoesNotClaimMasteryOrInventPassedAssessmentEvidence() {
        var detail = new LevelCompletionResponse.WaiverDetail("private-goal",
                Map.of("de", "Zahlen vergleichen", "en", "Compare numbers"),
                "no_remaining_demand", List.of(), 0);
        var response = new LevelCompletionResponse("valid", "private-context", "automatic:private-scope",
                "general-demand-v1", "private-generation", 10,
                Map.of("de", "Abschnitt", "en", "Section"), true, 0, 1, 0, 1, 0, 0,
                List.of("private-goal"), List.of(), List.of(), null, false, null, List.of())
                .withWaiverDetails(List.of(detail));
        for (String language : List.of("de", "en")) {
            var projected = ClaudeV1CompletionChoices.project(response, language);
            assertThat(projected.get("complete")).isEqualTo(true);
            assertThat(projected.get("choices")).isEqualTo(List.of());
            assertThat(ClaudeV1CompletionChoices.active(response)).isFalse();
            assertThat(projected.get("text").toString()).isEqualTo("en".equals(language)
                    ? "Direct evidence on learning goals (0/1), required assessments passed (0/0), "
                            + "goals credited for planning (0), preparation waived (1), "
                            + "remaining obligations (0). Learning section completed."
                    : "Eigene Nachweise an Lernzielen (0/1), bestandene Pflichtprüfungen (0/0), "
                            + "fachlich angerechnete Ziele (0), entfallene Vorbereitung (1), "
                            + "offene Zielpflichten (0). Lernabschnitt abgeschlossen.");
            var details = (List<?>) projected.get("waivedPreparation");
            assertThat(details).hasSize(1);
            var projectedDetail = (Map<?, ?>) details.getFirst();
            assertThat(projectedDetail.get("passedAssessments")).isEqualTo(List.of());
            assertThat(projectedDetail.get("supportingAssessmentCount")).isEqualTo(0);
            assertThat(projected.get("instruction").toString())
                    .contains("A mastered goal no longer demands its own prerequisites")
                    .contains("A passed assessment is not required for implicit completion")
                    .contains("Do not restore implicitly completed work as mandatory")
                    .contains("read-only overview, not an active completion route");
            assertThat(projected.toString()).doesNotContain("private-goal", "private-scope", "private-generation",
                    "private-context", "no_remaining_demand", "taskContent", "solutionContent");
        }
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
