package com.skillpilot.backend.openai.de.oauth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import com.skillpilot.backend.oauth.OAuthProfileDiagnostics;
import com.skillpilot.backend.oauth.OAuthProfileDiagnosticsFilter;
import java.util.Map;
import java.util.stream.Stream;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.slf4j.LoggerFactory;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.server.authorization.authentication.OAuth2ClientAuthenticationToken;

class OpenAiDeClientAuthenticationDiagnosticsTest {
    @Test void supportsResultsAndNullFallthroughArePassedThrough() {
        var delegate = mock(AuthenticationProvider.class);
        var wrapper = new OpenAiDeClientAuthenticationDiagnostics(delegate);
        var authentication = mock(Authentication.class);
        when(delegate.supports(Authentication.class)).thenReturn(true);
        assertThat(wrapper.supports(Authentication.class)).isTrue();
        assertThat(wrapper.supports(String.class)).isFalse();
        assertThat(wrapper.authenticate(authentication)).isNull();
        when(delegate.authenticate(authentication)).thenReturn(authentication);
        assertThat(wrapper.authenticate(authentication)).isSameAs(authentication);
    }

    @Test void failuresKeepTheirIdentityAndSpecificReasonsWithoutLoggingExceptionDetails() throws Exception {
        var logger = (Logger) LoggerFactory.getLogger(OAuthProfileDiagnostics.class);
        var logs = new ListAppender<ILoggingEvent>();
        logs.start(); logger.addAppender(logs);
        try {
            var delegate = mock(AuthenticationProvider.class);
            var wrapper = new OpenAiDeClientAuthenticationDiagnostics(delegate);
            var authentication = mock(Authentication.class);
            var failure = new OAuth2AuthenticationException(new OAuth2Error(
                    "invalid_client", "private-assertion-details", "https://private.example/secret"));
            when(delegate.authenticate(authentication)).thenThrow(failure);
            for (var reason : new OAuthProfileDiagnostics.Reason[]{
                    OAuthProfileDiagnostics.Reason.NONE, OAuthProfileDiagnostics.Reason.POLICY_REJECTED}) {
                var response = new MockHttpServletResponse();
                new OAuthProfileDiagnosticsFilter("openai").doFilter(
                        new MockHttpServletRequest("POST", OpenAiDeOAuthConfiguration.TOKEN_ENDPOINT), response,
                        (req, res) -> {
                            OAuthProfileDiagnostics.markReason(reason);
                            assertThatThrownBy(() -> wrapper.authenticate(authentication)).isSameAs(failure);
                            response.setStatus(401);
                        });
            }
            assertThat(logs.list).hasSize(2);
            assertThat(logs.list.getFirst().getFormattedMessage()).contains("reason=CLIENT_AUTHENTICATION_REJECTED");
            assertThat(logs.list.getLast().getFormattedMessage()).contains("reason=POLICY_REJECTED");
            for (var event : logs.list) {
                assertThat(event.getThrowableProxy()).isNull();
                assertThat(event.getFormattedMessage()).doesNotContain("private-assertion-details", "private.example", "secret");
            }
        } finally {
            logger.detachAppender(logs); logs.stop();
        }
    }

    @ParameterizedTest
    @MethodSource("fixedErrors")
    void classifiesOnlyExactKnownErrorCodeAndDescription(String errorCode, String description, String expected)
            throws Exception {
        assertDiagnostic(new OAuth2ClientAuthenticationToken("synthetic-client", ClientAuthenticationMethod.NONE,
                        null, Map.of()), errorCode, description, "NONE", expected, OAuthProfileDiagnostics.Reason.NONE);
    }

    private static Stream<Arguments> fixedErrors() {
        return Stream.of(
                Arguments.of("invalid_client", "Client authentication failed: authentication_method", "CLIENT_METHOD_REJECTED"),
                Arguments.of("invalid_client", "Client authentication failed: client_id", "CLIENT_REGISTRATION_NOT_FOUND"),
                Arguments.of("invalid_client", "Client authentication failed: credentials", "CLIENT_CREDENTIALS_MISSING"),
                Arguments.of("invalid_client", "Client authentication failed: client_secret", "CLIENT_SECRET_REJECTED"),
                Arguments.of("invalid_client", "Client authentication failed: client_secret_expires_at", "CLIENT_SECRET_REJECTED"),
                Arguments.of("invalid_grant", "Client authentication failed: code", "AUTHORIZATION_CODE_REJECTED"),
                Arguments.of("invalid_grant", "Client authentication failed: code_verifier", "PKCE_REJECTED"),
                Arguments.of("invalid_grant", "Client authentication failed: code_challenge", "PKCE_REJECTED"),
                Arguments.of("invalid_client", "Client authentication failed: client_assertion", "CLIENT_AUTHENTICATION_REJECTED"),
                Arguments.of("invalid_client", "Client authentication failed: code_verifier", "CLIENT_AUTHENTICATION_REJECTED"),
                Arguments.of("invalid_grant", "Client authentication failed: authentication_method", "CLIENT_AUTHENTICATION_REJECTED"),
                Arguments.of("invalid_request", "Client authentication failed: authentication_method", "CLIENT_AUTHENTICATION_REJECTED"),
                Arguments.of("invalid_client", null, "CLIENT_AUTHENTICATION_REJECTED"),
                Arguments.of("invalid_client", "Client authentication failed: client_secret private-detail\nsecret-value", "CLIENT_AUTHENTICATION_REJECTED"));
    }

    @ParameterizedTest
    @MethodSource("authenticationMethods")
    void recordsOnlyBoundedMethodLabelsWithoutOverwritingSpecificJwtFailure(ClientAuthenticationMethod method,
            String expected) throws Exception {
        assertDiagnostic(new OAuth2ClientAuthenticationToken("synthetic-client", method, "synthetic-assertion", Map.of()),
                "invalid_client", "Client authentication failed: authentication_method", expected,
                "JWT_AUDIENCE_REJECTED", OAuthProfileDiagnostics.Reason.JWT_AUDIENCE_REJECTED);
    }

    private static Stream<Arguments> authenticationMethods() {
        return Stream.of(
                Arguments.of(ClientAuthenticationMethod.NONE, "NONE"),
                Arguments.of(ClientAuthenticationMethod.CLIENT_SECRET_BASIC, "SECRET_BASIC"),
                Arguments.of(ClientAuthenticationMethod.CLIENT_SECRET_POST, "SECRET_POST"),
                Arguments.of(ClientAuthenticationMethod.PRIVATE_KEY_JWT, "JWT_ASSERTION"),
                Arguments.of(ClientAuthenticationMethod.CLIENT_SECRET_JWT, "JWT_ASSERTION"),
                Arguments.of(new ClientAuthenticationMethod("urn:ietf:params:oauth:client-assertion-type:jwt-bearer"), "JWT_ASSERTION"),
                Arguments.of(new ClientAuthenticationMethod("private-detail\nsecret-value"), "OTHER"));
    }

    @Test void nonClientAuthenticationHasUnknownMethod() throws Exception {
        assertDiagnostic(mock(Authentication.class), "invalid_client", null,
                "UNKNOWN", "CLIENT_AUTHENTICATION_REJECTED", OAuthProfileDiagnostics.Reason.NONE);
    }

    private static void assertDiagnostic(Authentication authentication, String errorCode, String description,
            String expectedMethod, String expectedReason, OAuthProfileDiagnostics.Reason priorReason) throws Exception {
        var logger = (Logger) LoggerFactory.getLogger(OAuthProfileDiagnostics.class);
        var logs = new ListAppender<ILoggingEvent>();
        logs.start(); logger.addAppender(logs);
        try {
            var delegate = mock(AuthenticationProvider.class);
            var wrapper = new OpenAiDeClientAuthenticationDiagnostics(delegate);
            var failure = new OAuth2AuthenticationException(new OAuth2Error(errorCode, description, null),
                    "private-detail", new IllegalStateException("secret-value"));
            when(delegate.authenticate(authentication)).thenThrow(failure);
            var response = new MockHttpServletResponse();
            new OAuthProfileDiagnosticsFilter("openai").doFilter(
                    new MockHttpServletRequest("POST", OpenAiDeOAuthConfiguration.TOKEN_ENDPOINT), response,
                    (req, res) -> {
                        OAuthProfileDiagnostics.markReason(priorReason);
                        assertThatThrownBy(() -> wrapper.authenticate(authentication)).isSameAs(failure);
                        response.setStatus("invalid_client".equals(errorCode) ? 401 : 400);
                    });
            assertThat(logs.list).hasSize(1);
            var event = logs.list.getFirst();
            assertThat(event.getThrowableProxy()).isNull();
            assertThat(event.getFormattedMessage()).contains("client_auth_method=" + expectedMethod,
                            "reason=" + expectedReason)
                    .doesNotContain("synthetic-client", "synthetic-assertion", "private-detail", "secret-value");
        } finally {
            logger.detachAppender(logs); logs.stop();
        }
    }
}
