package com.skillpilot.backend.ai;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.LevelCompletionResponse;
import java.util.List;
import java.util.Map;
import java.util.stream.IntStream;
import org.junit.jupiter.api.Test;

class AssessmentShortcutDiscoveryTest {
    private static final Map<String, String> TITLE = Map.of("de", "Projektion erklären", "en", "Explain projection");
    private static final Map<String, String> SECTION = Map.of("de", "Vektoren", "en", "Vectors");

    @Test
    void obsoleteClaudeSessionRecoveryUsesOnlyLocalizedReadOnlyLinksWithoutPrivateIdentifiers() throws Exception {
        var completion = offer("unresolved", null, null, List.of(assessment("public-exam", false, true)));
        for (String language : List.of("de", "en")) {
            var expected = AssessmentShortcutDiscovery.project(completion, "https://skillpilot.test", language);
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

    @Test
    void automaticOverviewPermitsFreshClaudeRecoveryButNeverTreatsAnOwnedRouteAsDiscovery() {
        for (String notice : java.util.Arrays.asList(null, "completion_coach_contract_unsupported")) {
            var overview = offer("valid", "automatic:personal-curriculum", notice,
                    List.of(assessment("exam", false, true)));
            var recovery = AssessmentShortcutDiscovery.project(overview, null, "de");
            assertThat(recovery).isNotNull();
            assertThat(recovery.options()).hasSize(1);
            var selected = new LevelCompletionResponse(overview.calculationStatus(), overview.contextRef(),
                    overview.profileId(), overview.profileRevision(), overview.curriculumGeneration(), overview.learnerRevision(),
                    overview.title(), overview.complete(), 0, 0, 0, 0, 0, 0, List.of(), List.of(),
                    overview.profileOptions(), "required", false, notice, List.of());
            assertThat(AssessmentShortcutDiscovery.project(selected, null, "de")).isNull();
        }
        assertThat(AssessmentShortcutDiscovery.project(offer("valid", "automatic:personal-curriculum",
                "completion_scope_changed", List.of(assessment("exam", false, true))), null, "de")).isNull();
    }

    @Test
    void automaticOptOutKeepsTheCalculationButPublishesNoRecoveryChoices() {
        var overview = offer("valid", "automatic:personal-curriculum", null,
                List.of(assessment("exam", false, false)));
        assertThat(AssessmentShortcutDiscovery.project(overview, null, "de")).isNull();
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
