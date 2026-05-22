package com.skillpilot.backend.config;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

class RequestLoggingFilterTest {

    private final RequestLoggingFilter filter = new RequestLoggingFilter(new ObjectMapper());

    @Test
    void sanitizeUriForOperationalLogRedactsLearnerAndSessionPathSegments() {
        assertThat(filter.sanitizeUriForOperationalLog(
                "/api/ui/learners/b43a1e45-f05c-4d78-8453-f6fa677dc24c/state"))
                .isEqualTo("/api/ui/learners/<skillpilotId>/state");
        assertThat(filter.sanitizeUriForOperationalLog(
                "/api/ai/de/learners/b43a1e45-f05c-4d78-8453-f6fa677dc24c/mastery"))
                .isEqualTo("/api/ai/de/learners/<skillpilotId>/mastery");
        assertThat(filter.sanitizeUriForOperationalLog(
                "/api/ai/de/sessions/sps_72okQebuPsNxJIbjm4F1Fnuttyw7t1qYA9fMo3qPm8Q/mastery"))
                .isEqualTo("/api/ai/de/sessions/<chatSessionToken>/mastery");
        assertThat(filter.sanitizeUriForOperationalLog(
                "/api/ui/updates/b43a1e45-f05c-4d78-8453-f6fa677dc24c"))
                .isEqualTo("/api/ui/updates/<skillpilotId>");
    }

    @Test
    void formatBodyForOperationalLogRedactsSensitiveFieldsAndCredentialPatterns() {
        String body = """
                {
                  "skillpilotId": "b43a1e45-f05c-4d78-8453-f6fa677dc24c",
                  "goalId": "goal-123",
                  "state": {
                    "learnerId": "b43a1e45-f05c-4d78-8453-f6fa677dc24c",
                    "chatSessionToken": "sps_72okQebuPsNxJIbjm4F1Fnuttyw7t1qYA9fMo3qPm8Q",
                    "prompt": "Starte SkillPilot mit Startcode: SP-2345-6789"
                  }
                }
                """;

        String redacted = filter.formatBodyForOperationalLog(body);

        assertThat(redacted).doesNotContain("b43a1e45-f05c-4d78-8453-f6fa677dc24c");
        assertThat(redacted).doesNotContain("sps_72okQebuPsNxJIbjm4F1Fnuttyw7t1qYA9fMo3qPm8Q");
        assertThat(redacted).doesNotContain("SP-2345-6789");
        assertThat(redacted).contains("\"goalId\":\"goal-123\"");
        assertThat(redacted).contains("\"skillpilotId\":\"<redacted>\"");
        assertThat(redacted).contains("\"chatSessionToken\":\"<redacted>\"");
        assertThat(redacted).contains("\"prompt\":\"Starte SkillPilot mit Startcode: <startCode>\"");
    }

    @Test
    void stableSensitiveRefDoesNotExposeTheOriginalId() {
        String skillpilotId = "b43a1e45-f05c-4d78-8453-f6fa677dc24c";

        String ref = filter.stableSensitiveRef(skillpilotId);

        assertThat(ref).matches("[0-9a-f]{16}");
        assertThat(ref).isEqualTo(filter.stableSensitiveRef(skillpilotId));
        assertThat(ref).doesNotContain(skillpilotId);
    }
}
