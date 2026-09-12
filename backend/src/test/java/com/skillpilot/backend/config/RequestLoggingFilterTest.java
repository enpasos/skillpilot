package com.skillpilot.backend.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.slf4j.LoggerFactory;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.util.ReflectionTestUtils;

class RequestLoggingFilterTest {

    private final RequestLoggingFilter filter = new RequestLoggingFilter(new ObjectMapper());

    @TempDir
    Path traceDirectory;

    @Test
    void coachResultRoutesNeverCacheBodiesOrWriteDebugOrAiTraceEvenForRejectedProse() throws Exception {
        ReflectionTestUtils.setField(filter, "aiTraceEnabled", true);
        ReflectionTestUtils.setField(filter, "aiTracePath", traceDirectory.resolve("ai-trace.jsonl").toString());
        ReflectionTestUtils.setField(filter, "aiTraceMaxBodyChars", 50000);
        Logger logger = (Logger) LoggerFactory.getLogger(RequestLoggingFilter.class);
        Level previousLevel = logger.getLevel();
        ListAppender<ILoggingEvent> appender = new ListAppender<>();
        appender.start();
        logger.addAppender(appender);
        logger.setLevel(Level.DEBUG);
        try {
            for (String path : new String[] {
                    "/api/ai/de/learners/learner-42/mastery",
                    "/api/ai/en/learners/learner-42/verified-recall/result",
                    "/api/ai/de/sessions/sps_test/mastery",
                    "/api/ai/en/sessions/sps_test/verified-recall/result/",
                    "/api/ai/de/sessions/sps_test/visible/mastery",
                    "/api/ai/en/sessions/sps_test/visible/verified-recall/result",
                    "/api/ai/de/sessions/sps_test/verified-recall/result;parameter=ignored"
            }) {
                for (int status : new int[] {200, 400, 500}) {
                    MockHttpServletRequest request = new MockHttpServletRequest("POST", path);
                    request.setContentType("application/json");
                    // The renamed unknown field must be protected without relying
                    // on a list of historical feedback field names.
                    request.setContent("{\"rationale\":\"synthetic-private-input-canary\"}"
                            .getBytes(StandardCharsets.UTF_8));
                    MockHttpServletResponse response = new MockHttpServletResponse();

                    filter.doFilter(request, response, (forwardedRequest, forwardedResponse) -> {
                        assertThat(forwardedRequest).as(path).isSameAs(request);
                        assertThat(forwardedResponse).as(path).isSameAs(response);
                        forwardedRequest.getInputStream().readAllBytes();
                        ((HttpServletResponse) forwardedResponse).setStatus(status);
                        forwardedResponse.getWriter().write("{\"error\":\"synthetic-private-response-canary\"}");
                    });

                    assertThat(response.getStatus()).isEqualTo(status);
                    assertThat(response.getContentAsString()).contains("synthetic-private-response-canary");
                }
            }
            MockHttpServletRequest failedRequest = new MockHttpServletRequest(
                    "POST", "/api/ai/de/sessions/sps_test/verified-recall/result");
            failedRequest.setContent("synthetic-private-malformed-body".getBytes(StandardCharsets.UTF_8));
            assertThatThrownBy(() -> filter.doFilter(
                    failedRequest, new MockHttpServletResponse(), (request, response) -> {
                        request.getInputStream().readAllBytes();
                        throw new ServletException("synthetic-private-failure-canary");
                    })).isInstanceOf(ServletException.class);

            assertThat(appender.list).isEmpty();
            try (var files = Files.list(traceDirectory)) {
                assertThat(files.toList()).isEmpty();
            }
        } finally {
            logger.detachAppender(appender);
            logger.setLevel(previousLevel);
            appender.stop();
        }
    }

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
    void providerCredentialAndLaunchRoutesBypassTheGeneralBodyLogger() throws Exception {
        for (String path : new String[] {
                "/api/claude/oauth2/token",
                "/api/openai/v1/oauth2/token",
                "/api/openai/v1/oauth2/revoke",
                "/api/ui/learners/learner-42/openai/v1/launch",
                "/api/ui/learners/learner-42/claude/v1/launch"
        }) {
            MockHttpServletRequest request = new MockHttpServletRequest("POST", path);
            request.setContentType("application/x-www-form-urlencoded");
            request.setContent("refresh_token=must-not-be-logged".getBytes(java.nio.charset.StandardCharsets.UTF_8));
            MockHttpServletResponse response = new MockHttpServletResponse();
            MockFilterChain chain = new MockFilterChain();

            filter.doFilter(request, response, chain);

            assertThat(chain.getRequest()).as(path).isSameAs(request);
            assertThat(chain.getResponse()).as(path).isSameAs(response);
        }
    }

    @Test
    void goalFeedbackIntakeAndExportBypassTheGeneralBodyLogger() throws Exception {
        for (String path : new String[] {
                "/api/public/goal-feedback/v1/submissions",
                "/api/operations/goal-feedback/v1/export-batches/export-id"
        }) {
            MockHttpServletRequest request = new MockHttpServletRequest("POST", path);
            request.setContentType("application/json");
            request.setContent("{\"untrusted\":\"must-not-be-logged\"}"
                    .getBytes(java.nio.charset.StandardCharsets.UTF_8));
            MockHttpServletResponse response = new MockHttpServletResponse();
            MockFilterChain chain = new MockFilterChain();

            filter.doFilter(request, response, chain);

            assertThat(chain.getRequest()).as(path).isSameAs(request);
            assertThat(chain.getResponse()).as(path).isSameAs(response);
        }
    }

    @Test
    void personalLearningPlanRoutesBypassTheGeneralBodyLogger() throws Exception {
        for (String path : new String[] {
                "/api/ui/learners/learner-42/learning-plans",
                "/api/ui/learners/learner-42/learning-plans/by-landscape",
                "/api/ui/learners/learner-42/learning-plans/8dddb012-7164-4d89-80ce-0e57fcfde31b/continue"
        }) {
            MockHttpServletRequest request = new MockHttpServletRequest("PUT", path);
            request.setContentType("application/json");
            request.setContent("{\"planLabel\":\"private learner plan\",\"title\":\"private block\"}"
                    .getBytes(java.nio.charset.StandardCharsets.UTF_8));
            MockHttpServletResponse response = new MockHttpServletResponse();
            MockFilterChain chain = new MockFilterChain();

            filter.doFilter(request, response, chain);

            assertThat(chain.getRequest()).as(path).isSameAs(request);
            assertThat(chain.getResponse()).as(path).isSameAs(response);
        }
    }

    @Test
    void forwardingWrapperCannotExposeCoachBodiesToTheLogger() throws Exception {
        for (String path : new String[] {
                "/internal/openai/v1/mcp",
                "/internal/claude/v1/mcp",
                "/api/ai/de/sessions/sps_test/verified-recall/result",
                "/api/ai/en/learners/learner-42/mastery"
        }) {
            MockHttpServletRequest raw = new MockHttpServletRequest("POST", path);
            raw.setContent("private-mcp-body".getBytes(StandardCharsets.UTF_8));
            HttpServletRequest wrapped = new HttpServletRequestWrapper(raw) {
                @Override
                public String getRequestURI() {
                    return "/api/not-the-mcp-path";
                }
            };
            MockHttpServletResponse response = new MockHttpServletResponse();
            MockFilterChain chain = new MockFilterChain();

            filter.doFilter(wrapped, response, chain);

            assertThat(chain.getRequest()).isSameAs(wrapped);
            assertThat(chain.getResponse()).isSameAs(response);
        }
    }

    @Test
    void similarlyPrefixedRouteStillUsesTheGeneralRequestLogger() throws Exception {
        for (String path : new String[] {
                "/api/action-regressionevil/v1/verify"
        }) {
            MockHttpServletRequest request = new MockHttpServletRequest("POST", path);
            MockHttpServletResponse response = new MockHttpServletResponse();
            MockFilterChain chain = new MockFilterChain();

            filter.doFilter(request, response, chain);

            assertThat(chain.getRequest()).as(path).isNotSameAs(request);
            assertThat(chain.getResponse()).as(path).isNotSameAs(response);
        }
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
                "/api/ai/de/sessions/sps_visibleSecret/visible/state"))
                .isEqualTo("/api/ai/de/sessions/<chatSessionToken>/visible/state");
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
    void formatBodyForOperationalLogRedactsLegacyPromptContext() {
        String redacted = filter.formatBodyForOperationalLog("""
                {"selectedCurriculum":"math","promptContext":"private learner context"}
                """);

        assertThat(redacted)
                .contains("\"selectedCurriculum\":\"math\"")
                .contains("\"promptContext\":\"<redacted>\"")
                .doesNotContain("private learner context");
    }

    @Test
    void everyKnownFeedbackFieldIsRedactedRecursivelyInBothLogFormats() {
        ReflectionTestUtils.setField(filter, "aiTraceMaxBodyChars", 50000);
        String body = """
                {"goalId":"goal-123","workFeedback":"private-work-canary",
                 "outcome_feedback":"private-outcome-canary",
                 "results":[{"cardId":"card-1","feedback":"private-recall-canary"}],
                 "state":{"verifiedRecall":{"Last_Feedback":"private-stored-canary"}}}
                """;

        for (String output : new String[] {
                filter.formatBodyForOperationalLog(body), filter.formatBodyForTrace(body).toString()
        }) {
            assertThat(output)
                    .doesNotContain("private-work-canary", "private-outcome-canary",
                            "private-recall-canary", "private-stored-canary")
                    .contains("goal-123", "card-1", "<redacted>");
        }
    }

    @Test
    void traceBodyFallbacksNeverWriteUnparseableOrOversizedProse() {
        ReflectionTestUtils.setField(filter, "aiTraceMaxBodyChars", 1000);
        assertThat(filter.formatBodyForTrace("{\"feedback\":\"private-malformed-canary"))
                .isEqualTo("<non-json body omitted>");
        assertThat(filter.formatBodyForTrace("{\"feedback\":\"" + "private-large-canary".repeat(100) + "\"}"))
                .isEqualTo("<oversized body omitted>");
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
    void formatBodyForOperationalLogRedactsVisibleRelayFooterToken() {
        String token = "sps_visibleSecret123";
        String body = """
                {
                  "relayFooter": "— SkillPilot · Sitzung: %s · Lernziel-ID: goal-1",
                  "activeGoal": {"goalId": "goal-1"}
                }
                """.formatted(token);

        String redacted = filter.formatBodyForOperationalLog(body);

        assertThat(redacted).doesNotContain(token);
        assertThat(redacted).contains("<chatSessionToken>").contains("goal-1");
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
                responseBody)).isEmpty();
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
        assertThat(filter.resolveAiOperationId("GET", "/api/ai/de/sessions/sps_token/visible/state"))
                .isEqualTo("getVisibleState");
        assertThat(filter.resolveAiOperationId("POST", "/api/ai/de/sessions/sps_token/visible/choice"))
                .isEqualTo("applyVisibleChoice");
        assertThat(filter.resolveAiOperationId("POST", "/api/ai/de/sessions/sps_token/visible/active-goal"))
                .isEqualTo("setVisibleActiveGoal");
        assertThat(filter.resolveAiOperationId("POST", "/api/ai/de/sessions/sps_token/visible/mastery"))
                .isEqualTo("setVisibleMastery");
        assertThat(filter.resolveAiOperationId("POST", "/api/ai/de/sessions/sps_token/visible/navigation"))
                .isEqualTo("requestVisibleNavigation");
        assertThat(filter.resolveAiOperationId("POST", "/api/ai/de/sessions/sps_token/visible/verified-recall/start"))
                .isEqualTo("startVisibleVerifiedRecall");
        assertThat(filter.resolveAiOperationId("POST", "/api/ai/de/sessions/sps_token/visible/verified-recall/answer"))
                .isEqualTo("getVisibleVerifiedRecallAnswer");
        assertThat(filter.resolveAiOperationId("POST", "/api/ai/de/sessions/sps_token/visible/verified-recall/result"))
                .isEqualTo("recordVisibleVerifiedRecallResult");
        assertThat(filter.resolveAiOperationId("POST", "/api/ai/de/sessions/sps_token/visible/exam/evaluation"))
                .isEqualTo("getVisibleExamEvaluation");
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
