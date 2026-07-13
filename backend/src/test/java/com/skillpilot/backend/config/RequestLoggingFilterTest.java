package com.skillpilot.backend.config;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class RequestLoggingFilterTest {

    private final RequestLoggingFilter filter = new RequestLoggingFilter(new ObjectMapper());

    @Test
    void actionRegressionRouteBypassesTheGeneralCachingAndRedactingLogger() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest(
                "POST",
                "/api/action-regression/v1/verify");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(request, response, chain);

        assertThat(chain.getRequest()).isSameAs(request);
        assertThat(chain.getResponse()).isSameAs(response);
    }

    @Test
    void similarlyPrefixedRouteStillUsesTheGeneralRequestLogger() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest(
                "POST",
                "/api/action-regressionevil/v1/verify");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(request, response, chain);

        assertThat(chain.getRequest()).isNotSameAs(request);
        assertThat(chain.getResponse()).isNotSameAs(response);
    }

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
    void formatBodyForOperationalLogRedactsRedeemRequestAndResponseSecrets() {
        String redeemRequest = """
                {
                  "startCode": "SP-2345-6789"
                }
                """;
        String redeemResponse = """
                {
                  "chatSessionToken": "sps_72okQebuPsNxJIbjm4F1Fnuttyw7t1qYA9fMo3qPm8Q",
                  "assistantMessage": "Dein Lernstand ist geladen. [Im Cockpit öffnen](https://skillpilot.com/?l=math&goal=goal-1)"
                }
                """;

        String redactedRequest = filter.formatBodyForOperationalLog(redeemRequest);
        String redactedResponse = filter.formatBodyForOperationalLog(redeemResponse);

        assertThat(redactedRequest).doesNotContain("SP-2345-6789");
        assertThat(redactedRequest).contains("\"startCode\":\"<redacted>\"");
        assertThat(redactedResponse).doesNotContain("sps_72okQebuPsNxJIbjm4F1Fnuttyw7t1qYA9fMo3qPm8Q");
        assertThat(redactedResponse).contains("\"chatSessionToken\":\"<redacted>\"");
        assertThat(redactedResponse).contains("\"assistantMessage\"");
    }

    @Test
    void resolveTraceSubjectUsesRedeemResponseSessionTokenForPerSessionTrace() {
        String chatSessionToken = "sps_72okQebuPsNxJIbjm4F1Fnuttyw7t1qYA9fMo3qPm8Q";
        String requestBody = """
                {"startCode":"SP-2345-6789"}
                """;
        String responseBody = """
                {"chatSessionToken":"%s","state":{"skillpilotId":null}}
                """.formatted(chatSessionToken);

        String refFromRedeem = filter.resolveTraceSubjectRef(
                "/api/ai/de/chat-start/redeem",
                requestBody,
                responseBody);
        String refFromSessionCall = filter.resolveTraceSubjectRef(
                "/api/ai/de/sessions/%s/state".formatted(chatSessionToken),
                "",
                "{\"skillpilotId\":null}");

        assertThat(filter.resolveTraceSubjectType(
                "/api/ai/de/chat-start/redeem",
                requestBody,
                responseBody)).isEqualTo("chatSessionToken");
        assertThat(refFromRedeem).isEqualTo(filter.stableSensitiveRef(chatSessionToken));
        assertThat(refFromRedeem).isEqualTo(refFromSessionCall);
        assertThat(refFromRedeem).doesNotContain(chatSessionToken);
    }

    @Test
    void resolveTraceSubjectPrefersInternalSkillpilotIdAttributeForRedeemTraceFile() {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/ai/de/chat-start/redeem");
        request.setAttribute(
                RequestLoggingFilter.AI_TRACE_SKILLPILOT_ID_ATTRIBUTE,
                "8452dc51-dc6d-43c2-aa16-53c150f2bff4");
        String responseBody = """
                {"chatSessionToken":"sps_72okQebuPsNxJIbjm4F1Fnuttyw7t1qYA9fMo3qPm8Q","state":{"skillpilotId":null}}
                """;

        assertThat(filter.resolveTraceSubjectType(
                request,
                "{\"startCode\":\"SP-2345-6789\"}",
                responseBody)).isEqualTo("skillpilotId");
        assertThat(filter.resolveTraceSubjectRef(
                request,
                "{\"startCode\":\"SP-2345-6789\"}",
                responseBody)).isEqualTo("8452dc51-dc6d-43c2-aa16-53c150f2bff4");
    }

    @Test
    void resolveTraceSubjectFallsBackToStartCodeForFailedRedeem() {
        String startCode = "SP-2345-6789";

        assertThat(filter.resolveTraceSubjectType(
                "/api/ai/de/chat-start/redeem",
                "{\"startCode\":\"%s\"}".formatted(startCode),
                "{\"error\":\"Start code not found\"}")).isEqualTo("startCode");
        assertThat(filter.resolveTraceSubjectRef(
                "/api/ai/de/chat-start/redeem",
                "{\"startCode\":\"%s\"}".formatted(startCode),
                "{\"error\":\"Start code not found\"}"))
                .isEqualTo(filter.stableSensitiveRef(startCode));
    }

    @Test
    void resolveAiOperationIdNamesRedeemAndSessionActionsForTraceSearch() {
        assertThat(filter.resolveAiOperationId("POST", "/api/ai/de/chat-start/redeem"))
                .isEqualTo("redeemStartCode");
        assertThat(filter.resolveAiOperationId("GET", "/api/ai/de/sessions/sps_token/state"))
                .isEqualTo("getLearnerState");
        assertThat(filter.resolveAiOperationId("POST", "/api/ai/de/sessions/sps_token/mastery"))
                .isEqualTo("setMastery");
        assertThat(filter.resolveAiOperationId("POST", "/api/ai/de/sessions/sps_token/verified-recall/start"))
                .isEqualTo("startVerifiedRecall");
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
