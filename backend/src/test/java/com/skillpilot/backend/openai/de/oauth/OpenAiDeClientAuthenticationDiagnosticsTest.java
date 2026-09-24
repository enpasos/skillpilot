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
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;

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
}
