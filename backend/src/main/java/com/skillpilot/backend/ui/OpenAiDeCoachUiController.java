package com.skillpilot.backend.ui;

import com.skillpilot.backend.api.OpenAiDeConnectStartResponse;
import com.skillpilot.backend.api.OpenAiDeCoachStartRequest;
import com.skillpilot.backend.api.OpenAiDeConnectionStatusResponse;
import com.skillpilot.backend.api.OpenAiDeLaunchResponse;
import com.skillpilot.backend.openai.de.OpenAiDeProperties;
import com.skillpilot.backend.service.OpenAiDeCoachConnectionService;
import java.time.Duration;
import java.time.Instant;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ui/learners/{skillpilotId}/openai/de")
@ConditionalOnProperty(
        name = {"skillpilot.openai.de.enabled", "skillpilot.openai.de.oauth.enabled"},
        havingValue = "true")
public class OpenAiDeCoachUiController {

    private final OpenAiDeCoachConnectionService connectionService;
    private final OpenAiDeProperties properties;

    public OpenAiDeCoachUiController(
            OpenAiDeCoachConnectionService connectionService,
            OpenAiDeProperties properties) {
        this.connectionService = connectionService;
        this.properties = properties;
    }

    @PostMapping("/connect-start")
    public ResponseEntity<OpenAiDeConnectStartResponse> createConnectionStart(
            @PathVariable String skillpilotId,
            @CookieValue(
                    value = OpenAiDeCoachConnectionService.BROWSER_SESSION_COOKIE_NAME,
                    required = false)
                    String browserSession,
            @RequestBody(required = false) OpenAiDeCoachStartRequest request) {
        boolean browserSessionCreated = browserSession == null || browserSession.isBlank();
        String effectiveBrowserSession = browserSessionCreated
                ? connectionService.createBrowserSessionToken()
                : browserSession;
        OpenAiDeCoachConnectionService.BindingGrant grant =
                connectionService.createBindingGrant(skillpilotId, effectiveBrowserSession, request);
        Duration maxAge = Duration.between(Instant.now(), grant.response().expiresAt());
        ResponseCookie cookie = ResponseCookie.from(
                        OpenAiDeCoachConnectionService.BINDING_COOKIE_NAME,
                        grant.token())
                .httpOnly(true)
                .secure(properties.isSecureCookie())
                .sameSite("Lax")
                .path(OpenAiDeCoachConnectionService.AUTHORIZATION_PATH)
                .maxAge(maxAge.isNegative() ? Duration.ZERO : maxAge)
                .build();
        ResponseEntity.BodyBuilder response = ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString());
        if (browserSessionCreated) {
            response.header(HttpHeaders.SET_COOKIE, browserSessionCookie(effectiveBrowserSession).toString());
        }
        return response.body(grant.response());
    }

    @PostMapping("/launch")
    public OpenAiDeLaunchResponse createLaunch(
            @PathVariable String skillpilotId,
            @RequestBody(required = false) OpenAiDeCoachStartRequest request) {
        return connectionService.createPendingLaunch(skillpilotId, request);
    }

    @GetMapping("/status")
    public ResponseEntity<OpenAiDeConnectionStatusResponse> getStatus(
            @PathVariable String skillpilotId,
            @CookieValue(
                    value = OpenAiDeCoachConnectionService.BROWSER_SESSION_COOKIE_NAME,
                    required = false)
                    String browserSession) {
        OpenAiDeConnectionStatusResponse status =
                new OpenAiDeConnectionStatusResponse(connectionService.isConnected(skillpilotId));
        if (browserSession != null && !browserSession.isBlank()) {
            return ResponseEntity.ok(status);
        }
        String newBrowserSession = connectionService.createBrowserSessionToken();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, browserSessionCookie(newBrowserSession).toString())
                .body(status);
    }

    @DeleteMapping("/connection")
    public OpenAiDeConnectionStatusResponse disconnect(@PathVariable String skillpilotId) {
        connectionService.disconnect(skillpilotId);
        return new OpenAiDeConnectionStatusResponse(false);
    }

    private ResponseCookie browserSessionCookie(String value) {
        return ResponseCookie.from(OpenAiDeCoachConnectionService.BROWSER_SESSION_COOKIE_NAME, value)
                .httpOnly(true)
                .secure(properties.isSecureCookie())
                .sameSite("Lax")
                .path(OpenAiDeCoachConnectionService.BROWSER_SESSION_COOKIE_PATH)
                .build();
    }
}
