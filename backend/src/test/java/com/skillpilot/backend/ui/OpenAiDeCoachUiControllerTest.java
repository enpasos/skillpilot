package com.skillpilot.backend.ui;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.exc.UnrecognizedPropertyException;
import com.skillpilot.backend.api.OpenAiDeConnectStartResponse;
import com.skillpilot.backend.api.OpenAiDeCoachStartRequest;
import com.skillpilot.backend.api.OpenAiDeCoachStartRequest.LaunchIntent;
import com.skillpilot.backend.api.OpenAiDeCoachStartRequest.LaunchIntentType;
import com.skillpilot.backend.api.OpenAiDeConnectionStatusResponse;
import com.skillpilot.backend.api.OpenAiDeLaunchResponse;
import com.skillpilot.backend.openai.de.OpenAiDeProperties;
import com.skillpilot.backend.service.OpenAiDeCoachConnectionService;
import java.time.Instant;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

class OpenAiDeCoachUiControllerTest {

    private static final String SKILLPILOT_ID = "learner-secret-id";
    private static final String BROWSER_SESSION = "spobs_browser-session";
    private static final String PROMPT =
            "Verwende die App SkillPilot Coach (Deutsch) und fahre mit dem in SkillPilot vorbereiteten "
                    + "nächsten Schritt fort.";

    private OpenAiDeCoachConnectionService connectionService;
    private OpenAiDeProperties properties;
    private OpenAiDeCoachUiController controller;

    @BeforeEach
    void setUp() {
        connectionService = mock(OpenAiDeCoachConnectionService.class);
        properties = new OpenAiDeProperties();
        properties.setSecureCookie(true);
        controller = new OpenAiDeCoachUiController(connectionService, properties);
    }

    @Test
    void connectStartPlacesGrantOnlyInProviderScopedSecureHttpOnlyCookie() {
        String rawGrant = "spodb_cookie-only-secret";
        Instant expiresAt = Instant.now().plusSeconds(300);
        OpenAiDeCoachStartRequest request = new OpenAiDeCoachStartRequest(
                "de",
                "web",
                "math",
                true,
                new LaunchIntent(LaunchIntentType.CURRENT_UNIT, null, null, null));
        OpenAiDeConnectStartResponse response = new OpenAiDeConnectStartResponse(
                "https://chatgpt.com/",
                PROMPT,
                expiresAt,
                false);
        when(connectionService.createBindingGrant(SKILLPILOT_ID, BROWSER_SESSION, request))
                .thenReturn(new OpenAiDeCoachConnectionService.BindingGrant(rawGrant, response));

        ResponseEntity<OpenAiDeConnectStartResponse> result =
                controller.createConnectionStart(SKILLPILOT_ID, BROWSER_SESSION, request);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody()).isSameAs(response);
        assertThat(result.getBody().toString())
                .contains(PROMPT)
                .doesNotContain(rawGrant)
                .doesNotContain(SKILLPILOT_ID)
                .doesNotContain("promptContext");
        String setCookie = result.getHeaders().getFirst(HttpHeaders.SET_COOKIE);
        assertThat(setCookie)
                .startsWith(OpenAiDeCoachConnectionService.BINDING_COOKIE_NAME + "=" + rawGrant + ";")
                .contains("Path=" + OpenAiDeCoachConnectionService.AUTHORIZATION_PATH)
                .contains("Max-Age=")
                .contains("Secure")
                .contains("HttpOnly")
                .contains("SameSite=Lax")
                .doesNotContain(SKILLPILOT_ID)
                .doesNotContain("Domain=");
        assertThat(cookieMaxAge(setCookie)).isBetween(1L, 300L);
        verify(connectionService).createBindingGrant(SKILLPILOT_ID, BROWSER_SESSION, request);
        verifyNoMoreInteractions(connectionService);
    }

    @Test
    void connectStartHonorsDisabledSecureCookieForLocalDevelopment() {
        properties.setSecureCookie(false);
        Instant expiresAt = Instant.now().plusSeconds(300);
        OpenAiDeConnectStartResponse response = new OpenAiDeConnectStartResponse(
                "https://chatgpt.com/",
                PROMPT,
                expiresAt,
                true);
        OpenAiDeCoachStartRequest request = new OpenAiDeCoachStartRequest(
                "de",
                "web",
                "math",
                true,
                null);
        when(connectionService.createBrowserSessionToken()).thenReturn(BROWSER_SESSION);
        when(connectionService.createBindingGrant(SKILLPILOT_ID, BROWSER_SESSION, request))
                .thenReturn(new OpenAiDeCoachConnectionService.BindingGrant("spodb_local", response));

        ResponseEntity<OpenAiDeConnectStartResponse> result =
                controller.createConnectionStart(SKILLPILOT_ID, null, request);

        assertThat(result.getHeaders().getFirst(HttpHeaders.SET_COOKIE))
                .contains("HttpOnly")
                .contains("SameSite=Lax")
                .doesNotContain("; Secure");
        assertThat(result.getHeaders().get(HttpHeaders.SET_COOKIE))
                .anySatisfy(cookie -> assertThat(cookie)
                        .startsWith(OpenAiDeCoachConnectionService.BROWSER_SESSION_COOKIE_NAME
                                + "=" + BROWSER_SESSION + ";")
                        .contains("Path=" + OpenAiDeCoachConnectionService.BROWSER_SESSION_COOKIE_PATH)
                        .contains("HttpOnly")
                        .contains("SameSite=Lax")
                        .doesNotContain("Max-Age=")
                        .doesNotContain("; Secure"));
        verify(connectionService).createBrowserSessionToken();
        verify(connectionService).createBindingGrant(SKILLPILOT_ID, BROWSER_SESSION, request);
        verifyNoMoreInteractions(connectionService);
    }

    @Test
    void launchReturnsOnlyFixedPromptChatGptHomeAndExpiry() {
        OpenAiDeCoachStartRequest request = new OpenAiDeCoachStartRequest(
                "de",
                "web",
                "math",
                true,
                new LaunchIntent(LaunchIntentType.ABI26_EXAM, "server-side-goal", null, "GK"));
        OpenAiDeLaunchResponse response = new OpenAiDeLaunchResponse(
                PROMPT,
                "https://chatgpt.com/",
                Instant.now().plusSeconds(300));
        when(connectionService.createPendingLaunch(SKILLPILOT_ID, request)).thenReturn(response);

        OpenAiDeLaunchResponse result = controller.createLaunch(SKILLPILOT_ID, request);

        assertThat(result).isSameAs(response);
        assertThat(result.webUrl()).isEqualTo("https://chatgpt.com/");
        assertThat(result.prompt()).isEqualTo(PROMPT);
        assertThat(result.toString())
                .doesNotContain(SKILLPILOT_ID)
                .doesNotContain("promptContext")
                .doesNotContain("spodb_");
        verify(connectionService).createPendingLaunch(SKILLPILOT_ID, request);
        verifyNoMoreInteractions(connectionService);
    }

    @Test
    void providerSpecificStartContractRejectsLegacyFreeFormPromptContext() {
        assertThatExceptionOfType(UnrecognizedPropertyException.class)
                .isThrownBy(() -> new ObjectMapper().readValue(
                        """
                        {
                          "language": "de",
                          "client": "web",
                          "selectedCurriculum": "math",
                          "promptContext": "never accepted by the OpenAI MCP boundary"
                        }
                        """,
                        OpenAiDeCoachStartRequest.class));
    }

    @Test
    void providerEligibilityConfirmationIsTriStateAtTheJsonBoundary() throws Exception {
        ObjectMapper mapper = new ObjectMapper();

        OpenAiDeCoachStartRequest missing = mapper.readValue(
                """
                {"language":"de"}
                """,
                OpenAiDeCoachStartRequest.class);
        OpenAiDeCoachStartRequest rejected = mapper.readValue(
                """
                {"language":"de","providerEligibilityConfirmed":false}
                """,
                OpenAiDeCoachStartRequest.class);
        OpenAiDeCoachStartRequest accepted = mapper.readValue(
                """
                {"language":"de","providerEligibilityConfirmed":true}
                """,
                OpenAiDeCoachStartRequest.class);

        assertThat(missing.providerEligibilityConfirmed()).isNull();
        assertThat(rejected.providerEligibilityConfirmed()).isFalse();
        assertThat(accepted.providerEligibilityConfirmed()).isTrue();
    }

    @Test
    void statusMapsConnectionStateWithoutReturningLearnerData() {
        when(connectionService.isConnected(SKILLPILOT_ID)).thenReturn(true);

        ResponseEntity<OpenAiDeConnectionStatusResponse> response =
                controller.getStatus(SKILLPILOT_ID, BROWSER_SESSION);
        OpenAiDeConnectionStatusResponse result = response.getBody();

        assertThat(response.getHeaders().get(HttpHeaders.SET_COOKIE)).isNull();
        assertThat(result).isNotNull();
        assertThat(result.connected()).isTrue();
        assertThat(result.toString()).doesNotContain(SKILLPILOT_ID);
        verify(connectionService).isConnected(SKILLPILOT_ID);
        verifyNoMoreInteractions(connectionService);
    }

    @Test
    void statusEstablishesSecureHttpOnlyBrowserSessionWhenMissing() {
        when(connectionService.isConnected(SKILLPILOT_ID)).thenReturn(false);
        when(connectionService.createBrowserSessionToken()).thenReturn(BROWSER_SESSION);

        ResponseEntity<OpenAiDeConnectionStatusResponse> result = controller.getStatus(SKILLPILOT_ID, null);

        assertThat(result.getBody()).isEqualTo(new OpenAiDeConnectionStatusResponse(false));
        assertThat(result.getHeaders().getFirst(HttpHeaders.SET_COOKIE))
                .startsWith(OpenAiDeCoachConnectionService.BROWSER_SESSION_COOKIE_NAME
                        + "=" + BROWSER_SESSION + ";")
                .contains("Path=" + OpenAiDeCoachConnectionService.BROWSER_SESSION_COOKIE_PATH)
                .contains("Secure")
                .contains("HttpOnly")
                .contains("SameSite=Lax")
                .doesNotContain("Max-Age=")
                .doesNotContain(SKILLPILOT_ID);
        verify(connectionService).isConnected(SKILLPILOT_ID);
        verify(connectionService).createBrowserSessionToken();
        verifyNoMoreInteractions(connectionService);
    }

    @Test
    void disconnectRevokesOnlyThroughOpenAiDeConnectionService() {
        OpenAiDeConnectionStatusResponse result = controller.disconnect(SKILLPILOT_ID);

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
