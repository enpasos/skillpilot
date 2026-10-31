package com.skillpilot.backend.ai;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.LearnerGoals;
import com.skillpilot.backend.api.LevelCompletionResponse;
import com.skillpilot.backend.api.PersonalizationPlan;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.connectors.gemini.v1.mcp.GeminiV1CoachContextProjector;
import com.skillpilot.backend.landscape.LandscapeSummary;
import com.skillpilot.backend.openai.mcp.de.OpenAiDeCoachContextProjector;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.IntStream;
import org.junit.jupiter.api.Test;

class AssessmentShortcutDiscoveryTest {
    private static final Map<String, String> TITLE = Map.of("de", "Projektion erklären", "en", "Explain projection");
    private static final Map<String, String> SECTION = Map.of("de", "Vektoren", "en", "Vectors");

    @Test
    void bothCoachesPublishTheSameReadOnlyLocalizedDiscoveryWithoutLearnerOrProfileIdentifiers() throws Exception {
        var completion = offer("unresolved", null, null, List.of(assessment("public-exam", false, true)));
        var curriculum = new LandscapeSummary("public-curriculum", "Mathematik", "", "DE", "HE",
                "school", "Mathematik", "de", List.of());
        var state = new UnifiedLearnerStateResponse("permanent-private-learner", curriculum, List.of(),
                new LearnerGoals(List.of(), 0, 2, null, null, false), List.of(), List.of(), Set.of(),
                "FRONTIER", null, null, completion);
        var safety = new CoachStateProjection("https://skillpilot.test");
        var openai = new OpenAiDeCoachContextProjector(safety, "https://skillpilot.test");
        var facade = mock(CoachToolFacade.class);
        when(facade.getLearnerState("permanent-private-learner")).thenReturn(state);
        when(facade.getPersonalizationPlan("permanent-private-learner"))
                .thenReturn(PersonalizationPlan.complete(List.of()));
        var gemini = new GeminiV1CoachContextProjector(safety, facade, "https://skillpilot.test");

        for (String language : List.of("de", "en")) {
            var expected = AssessmentShortcutDiscovery.project(completion, "https://skillpilot.test", language);
            var openaiContext = openai.project(state, PersonalizationPlan.complete(List.of()), false, language);
            var geminiContext = gemini.projectContext("permanent-private-learner", 7, language);
            assertThat(openaiContext.assessmentShortcuts()).isEqualTo(expected);
            assertThat(geminiContext.get("assessmentShortcuts")).isEqualTo(expected);
            assertThat(openaiContext.nextAllowedTools()).noneMatch(tool -> tool.contains("completion"));
            assertThat(expected.options()).containsExactly(new AssessmentShortcutDiscovery.Option(
                    TITLE.get(language), SECTION.get(language),
                    "https://skillpilot.test/learner/public-exam?completionShortcuts=1"));
            String json = new ObjectMapper().writeValueAsString(expected);
            assertThat(json).doesNotContain("permanent-private-learner", "private-profile", "generation",
                    "expectedRevision", "learningSessionId", "taskContent", "passingPoints", "scoring", "sampleSolution");
            assertThat(expected.notice()).contains("Claude");
            assertThat(expected.instruction()).contains("never starts an assessment", "unchanged",
                    "Do not interrupt current feedback");
        }
    }

    @Test
    void disabledUnavailableActiveAndLegacyOffersCannotInventAStart() {
        assertThat(AssessmentShortcutDiscovery.project(null, null, "de")).isNull();
        for (String status : List.of("valid", "unavailable", "invalid", "notApplicable")) {
            assertThat(AssessmentShortcutDiscovery.project(
                    offer(status, null, null, List.of(assessment("exam", false, true))), null, "de")).isNull();
        }
        assertThat(AssessmentShortcutDiscovery.project(offer("unresolved", "active-profile", null,
                List.of(assessment("exam", false, true))), null, "de")).isNull();
        assertThat(AssessmentShortcutDiscovery.project(offer("unresolved", null, "stale",
                List.of(assessment("exam", false, true))), null, "de")).isNull();
        assertThat(AssessmentShortcutDiscovery.project(offer("unresolved", null, null, List.of()), null, "de")).isNull();
    }

    @Test
    void alreadyMasteredAndUnavailableAssessmentsAreNotOffered() {
        var discovery = AssessmentShortcutDiscovery.project(offer("unresolved", null, null, List.of(
                assessment("mastered", true, true), assessment("unavailable", false, false),
                assessment("available", false, true))), "https://skillpilot.test/", "en");
        assertThat(discovery.options()).hasSize(1);
        assertThat(discovery.options().getFirst().cockpitUrl()).endsWith("/available?completionShortcuts=1");
    }

    @Test
    void discoveryIsBoundedAndGoalIdCannotInjectQueryParameters() {
        var assessments = IntStream.range(0, 20).mapToObj(i -> assessment("exam " + i + "&token=secret", false, true)).toList();
        var discovery = AssessmentShortcutDiscovery.project(offer("unresolved", null, null, assessments), null, "en");
        assertThat(discovery.options()).hasSize(AssessmentShortcutDiscovery.MAX_OPTIONS);
        assertThat(discovery.options().getFirst().cockpitUrl())
                .isEqualTo("https://skillpilot.com/learner/exam%200%26token%3Dsecret?completionShortcuts=1");
    }

    private static LevelCompletionResponse.Assessment assessment(String id, boolean mastered, boolean available) {
        return new LevelCompletionResponse.Assessment(id, TITLE, mastered, available, null);
    }

    private static LevelCompletionResponse offer(String status, String profile, String notice,
            List<LevelCompletionResponse.Assessment> assessments) {
        return new LevelCompletionResponse(status, null, profile, null, "private-generation", 7, Map.of(),
                null, 0, 0, 0, 0, 0, 0, List.of(), List.of(),
                List.of(new LevelCompletionResponse.ProfileOption("private-profile", SECTION, 2, 1, assessments)),
                null, false, notice, List.of());
    }
}
