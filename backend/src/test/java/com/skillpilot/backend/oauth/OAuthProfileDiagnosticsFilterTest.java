package com.skillpilot.backend.oauth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import java.nio.charset.StandardCharsets;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class OAuthProfileDiagnosticsFilterTest {
    private final Logger logger = (Logger) LoggerFactory.getLogger(OAuthProfileDiagnostics.class);
    private final ListAppender<ILoggingEvent> logs = new ListAppender<>();
    private Level previousLevel;

    @BeforeEach void capture() {
        previousLevel = logger.getLevel(); logger.setLevel(Level.DEBUG); logs.start(); logger.addAppender(logs);
    }
    @AfterEach void cleanup() {
        logger.detachAppender(logs); logger.setLevel(previousLevel); logs.stop();
        assertThat(OAuthProfileDiagnostics.hasContext()).isFalse();
    }

    @Test void safeProfileLogUsesServerCorrelationAndNeverCopiesRequestMaterial() throws Exception {
        var response = new MockHttpServletResponse();
        String existingMdc = MDC.get("existing-audit-context");
        MDC.put("existing-audit-context", "preserved-value");
        try {
            new OAuthProfileDiagnosticsFilter("openai").doFilter(request("/api/openai/v1/oauth2/token"), response, (req, res) -> {
                OAuthProfileDiagnostics.markProfile("chatgpt-cimd-jwt");
                response.setStatus(200);
            });
            assertThat(MDC.get("existing-audit-context")).isEqualTo("preserved-value");
        } finally {
            if (existingMdc == null) MDC.remove("existing-audit-context"); else MDC.put("existing-audit-context", existingMdc);
        }
        String correlation = response.getHeader(OAuthProfileDiagnosticsFilter.CORRELATION_HEADER);
        assertThat(UUID.fromString(correlation).toString()).isEqualTo(correlation);
        assertThat(correlation).isNotEqualTo("attacker-correlation-secret");
        assertThat(logs.list).hasSize(1);
        assertThat(logs.list.getFirst().getLevel()).isEqualTo(Level.DEBUG);
        assertThat(logs.list.getFirst().getFormattedMessage()).contains("profile=chatgpt-cimd-jwt", "http_status=200", correlation)
                .doesNotContain("fake-bearer-secret", "fake-client-secret", "fake-client-assertion", "fake-learning-session",
                        "attacker-correlation-secret", "fake-cookie-secret", "fake-query-secret");
    }

    @Test void actualHttpDenialWinsOverProfileLabelAndUnknownLabelsAreNotLogged() throws Exception {
        var response = new MockHttpServletResponse();
        new OAuthProfileDiagnosticsFilter("claude").doFilter(request("/internal/connectors/claude/v1/oauth2/token"), response, (req, res) -> {
            OAuthProfileDiagnostics.markProfile("unsafe-user-supplied-secret");
            OAuthProfileDiagnostics.markReason(OAuthProfileDiagnostics.Reason.CLIENT_AUTHENTICATION_REJECTED);
            response.setStatus(401);
        });
        assertThat(logs.list).hasSize(1);
        assertThat(logs.list.getFirst().getLevel()).isEqualTo(Level.WARN);
        assertThat(logs.list.getFirst().getFormattedMessage()).contains("profile=unknown", "result=rejected", "http_status=401")
                .doesNotContain("unsafe-user-supplied-secret");
    }

    @Test void exceptionsDoNotLeakMessagesAndRequestThreadStateIsAlwaysCleared() {
        var response = new MockHttpServletResponse();
        assertThatThrownBy(() -> new OAuthProfileDiagnosticsFilter("openai").doFilter(request("/internal/openai/v1/mcp"),
                response, (req, res) -> { throw new IllegalStateException("fake-exception-token-secret"); }))
                .isInstanceOf(IllegalStateException.class);
        assertThat(logs.list).hasSize(1);
        assertThat(logs.list.getFirst().getThrowableProxy()).isNull();
        assertThat(logs.list.getFirst().getFormattedMessage()).contains("reason=INTERNAL_ERROR", "http_status=500")
                .doesNotContain("fake-exception-token-secret");
        assertThat(OAuthProfileDiagnostics.hasContext()).isFalse();
        OAuthProfileDiagnostics.markProfile("chatgpt-cimd-jwt");
        assertThat(OAuthProfileDiagnostics.hasContext()).isFalse();
    }

    @Test void nestedFiltersShareOneContextAndNextRequestStartsClean() throws Exception {
        var outer = new OAuthProfileDiagnosticsFilter("openai");
        var inner = new OAuthProfileDiagnosticsFilter("openai");
        var first = new MockHttpServletResponse();
        outer.doFilter(request("/api/openai/v1/oauth2/token"), first, (req, res) -> {
            OAuthProfileDiagnostics.markProfile("chatgpt-cimd-jwt");
            inner.doFilter(req, res, (nestedReq, nestedRes) -> first.setStatus(400));
        });
        var second = new MockHttpServletResponse();
        outer.doFilter(request("/api/openai/v1/oauth2/token"), second, (req, res) -> second.setStatus(200));
        assertThat(logs.list).hasSize(2);
        assertThat(logs.list.getFirst().getFormattedMessage()).contains("profile=chatgpt-cimd-jwt", "result=rejected");
        assertThat(logs.list.get(1).getFormattedMessage()).contains("profile=unknown", "http_status=200");
        assertThat(first.getHeader(OAuthProfileDiagnosticsFilter.CORRELATION_HEADER))
                .isNotEqualTo(second.getHeader(OAuthProfileDiagnosticsFilter.CORRELATION_HEADER));
    }

    @Test void typedSecurityReasonSurvivesAnExceptionWithoutLoggingItsDetails() {
        assertThatThrownBy(() -> new OAuthProfileDiagnosticsFilter("openai").doFilter(request("/api/openai/v1/oauth2/token"),
                new MockHttpServletResponse(), (req, res) -> {
                    OAuthProfileDiagnostics.markReason(OAuthProfileDiagnostics.Reason.STORAGE_UNAVAILABLE);
                    throw new IllegalStateException("private-database-error");
                })).isInstanceOf(IllegalStateException.class);
        assertThat(logs.list.getFirst().getFormattedMessage()).contains("reason=STORAGE_UNAVAILABLE", "http_status=500")
                .doesNotContain("private-database-error");
    }

    @Test void unrelatedAndOtherProviderPathsRemainOutsideTheDiagnosticFilter() throws Exception {
        for (String path : new String[]{"/api/learners/private", "/internal/connectors/claude/v1/mcp"}) {
            var response = new MockHttpServletResponse();
            new OAuthProfileDiagnosticsFilter("openai").doFilter(request(path), response, (req, res) -> response.setStatus(200));
            assertThat(response.getHeader(OAuthProfileDiagnosticsFilter.CORRELATION_HEADER)).isNull();
        }
        assertThat(logs.list).isEmpty();
    }

    private static MockHttpServletRequest request(String path) {
        var request = new MockHttpServletRequest("POST", path);
        request.addHeader("Authorization", "Bearer fake-bearer-secret");
        request.addHeader("Cookie", "session=fake-cookie-secret");
        request.addHeader(OAuthProfileDiagnosticsFilter.CORRELATION_HEADER, "attacker-correlation-secret");
        request.setQueryString("value=fake-query-secret");
        request.setContent("client_secret=fake-client-secret&client_assertion=fake-client-assertion&learningSessionId=fake-learning-session"
                .getBytes(StandardCharsets.UTF_8));
        return request;
    }
}
