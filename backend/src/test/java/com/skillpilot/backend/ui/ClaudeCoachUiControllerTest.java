package com.skillpilot.backend.ui;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

import com.skillpilot.backend.api.ChatStartRequest;
import com.skillpilot.backend.api.ClaudeConnectStartResponse;
import com.skillpilot.backend.api.ClaudeConnectionStatusResponse;
import com.skillpilot.backend.api.ClaudeLaunchResponse;
import com.skillpilot.backend.service.ClaudeCoachConnectionService;
import java.time.Instant;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

class ClaudeCoachUiControllerTest {

    private static final String SKILLPILOT_ID = "learner-secret-id";

    private ClaudeCoachConnectionService connectionService;
    private ClaudeCoachUiController controller;

    @BeforeEach
    void setUp() {
        connectionService = mock(ClaudeCoachConnectionService.class);
        controller = new ClaudeCoachUiController(connectionService, true);
    }

    @Test
    void connectStartPlacesGrantOnlyInScopedSecureHttpOnlyCookie() {
        String rawGrant = "spcb_cookie-only-secret";
        Instant expiresAt = Instant.now().plusSeconds(300);
        ChatStartRequest request = new ChatStartRequest("de", "web", "math", null);
        ClaudeConnectStartResponse response = new ClaudeConnectStartResponse(
                "https://claude.ai/customize/connectors?connectorUrl=https%3A%2F%2Fskillpilot.test%2Fapi%2Fclaude%2Fmcp",
                expiresAt,
                false);
        when(connectionService.createBindingGrant(SKILLPILOT_ID, request))
                .thenReturn(new ClaudeCoachConnectionService.BindingGrant(rawGrant, response));

        ResponseEntity<ClaudeConnectStartResponse> result =
                controller.createConnectionStart(SKILLPILOT_ID, request);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody()).isSameAs(response);
        assertThat(result.getBody().toString())
                .doesNotContain(rawGrant)
                .doesNotContain(SKILLPILOT_ID);
        String setCookie = result.getHeaders().getFirst(HttpHeaders.SET_COOKIE);
        assertThat(setCookie)
                .startsWith(ClaudeCoachConnectionService.BINDING_COOKIE_NAME + "=" + rawGrant + ";")
                .contains("Path=/oauth2/authorize")
                .contains("Max-Age=")
                .contains("Secure")
                .contains("HttpOnly")
                .contains("SameSite=Lax")
                .doesNotContain(SKILLPILOT_ID);
        assertThat(cookieMaxAge(setCookie)).isBetween(1L, 300L);
        assertThat(setCookie).doesNotContain("Domain=");
        verify(connectionService).createBindingGrant(SKILLPILOT_ID, request);
        verifyNoMoreInteractions(connectionService);
    }

    @Test
    void connectStartHonorsDisabledSecureCookieForLocalDevelopment() {
        controller = new ClaudeCoachUiController(connectionService, false);
        Instant expiresAt = Instant.now().plusSeconds(300);
        ClaudeConnectStartResponse response = new ClaudeConnectStartResponse("https://claude.ai/connect", expiresAt, true);
        when(connectionService.createBindingGrant(SKILLPILOT_ID, null))
                .thenReturn(new ClaudeCoachConnectionService.BindingGrant("spcb_local", response));

        ResponseEntity<ClaudeConnectStartResponse> result =
                controller.createConnectionStart(SKILLPILOT_ID, null);

        assertThat(result.getHeaders().getFirst(HttpHeaders.SET_COOKIE))
                .contains("HttpOnly")
                .contains("SameSite=Lax")
                .doesNotContain("; Secure");
        verify(connectionService).createBindingGrant(SKILLPILOT_ID, null);
        verifyNoMoreInteractions(connectionService);
    }

    @Test
    void launchDelegatesWithoutAddingLearnerOrBindingData() {
        ChatStartRequest request = new ChatStartRequest("en", "mobile", "math", "continue");
        ClaudeLaunchResponse response = new ClaudeLaunchResponse(
                "Use the SkillPilot connector and start my current learning session.",
                "https://claude.ai/new",
                "claude://claude.ai/new?q=Start+my+current+SkillPilot+learning+session.",
                Instant.now().plusSeconds(300));
        when(connectionService.createPendingLaunch(SKILLPILOT_ID, request)).thenReturn(response);

        ClaudeLaunchResponse result = controller.createLaunch(SKILLPILOT_ID, request);

        assertThat(result).isSameAs(response);
        assertThat(result.toString())
                .doesNotContain(SKILLPILOT_ID)
                .doesNotContain("spcb_");
        verify(connectionService).createPendingLaunch(SKILLPILOT_ID, request);
        verifyNoMoreInteractions(connectionService);
    }

    @Test
    void statusMapsConnectionStateWithoutReturningLearnerData() {
        when(connectionService.isConnected(SKILLPILOT_ID)).thenReturn(true);

        ClaudeConnectionStatusResponse result = controller.getStatus(SKILLPILOT_ID);

        assertThat(result.connected()).isTrue();
        assertThat(result.toString()).doesNotContain(SKILLPILOT_ID);
        verify(connectionService).isConnected(SKILLPILOT_ID);
        verifyNoMoreInteractions(connectionService);
    }

    @Test
    void disconnectRevokesClaudeAccessWithoutReturningLearnerData() {
        ClaudeConnectionStatusResponse result = controller.disconnect(SKILLPILOT_ID);

        assertThat(result.connected()).isFalse();
        assertThat(result.toString()).doesNotContain(SKILLPILOT_ID);
        verify(connectionService).disconnect(SKILLPILOT_ID);
        verifyNoMoreInteractions(connectionService);
    }

    private static long cookieMaxAge(String setCookie) {
        Matcher matcher = Pattern.compile("(?:^|; )Max-Age=(\\d+)(?:;|$)").matcher(setCookie);
        assertThat(matcher.find()).isTrue();
        return Long.parseLong(matcher.group(1));
    }
}
