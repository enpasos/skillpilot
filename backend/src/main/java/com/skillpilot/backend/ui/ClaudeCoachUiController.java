package com.skillpilot.backend.ui;

import com.skillpilot.backend.api.ChatStartRequest;
import com.skillpilot.backend.api.ClaudeConnectStartResponse;
import com.skillpilot.backend.api.ClaudeConnectionStatusResponse;
import com.skillpilot.backend.api.ClaudeLaunchResponse;
import com.skillpilot.backend.service.ClaudeCoachConnectionService;
import java.time.Duration;
import java.time.Instant;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ui/learners/{skillpilotId}/claude")
@ConditionalOnProperty(name = "skillpilot.claude.enabled", havingValue = "true")
public class ClaudeCoachUiController {

    private final ClaudeCoachConnectionService connectionService;
    private final boolean secureCookie;

    public ClaudeCoachUiController(
            ClaudeCoachConnectionService connectionService,
            @Value("${skillpilot.claude.secure-cookie:true}") boolean secureCookie) {
        this.connectionService = connectionService;
        this.secureCookie = secureCookie;
    }

    @PostMapping("/connect-start")
    public ResponseEntity<ClaudeConnectStartResponse> createConnectionStart(
            @PathVariable String skillpilotId,
            @RequestBody(required = false) ChatStartRequest request) {
        ClaudeCoachConnectionService.BindingGrant grant = connectionService.createBindingGrant(skillpilotId, request);
        Duration maxAge = Duration.between(Instant.now(), grant.response().expiresAt());
        ResponseCookie cookie = ResponseCookie.from(ClaudeCoachConnectionService.BINDING_COOKIE_NAME, grant.token())
                .httpOnly(true)
                .secure(secureCookie)
                .sameSite("Lax")
                .path("/oauth2/authorize")
                .maxAge(maxAge.isNegative() ? Duration.ZERO : maxAge)
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(grant.response());
    }

    @PostMapping("/launch")
    public ClaudeLaunchResponse createLaunch(
            @PathVariable String skillpilotId,
            @RequestBody(required = false) ChatStartRequest request) {
        return connectionService.createPendingLaunch(skillpilotId, request);
    }

    @GetMapping("/status")
    public ClaudeConnectionStatusResponse getStatus(@PathVariable String skillpilotId) {
        return new ClaudeConnectionStatusResponse(connectionService.isConnected(skillpilotId));
    }

    @DeleteMapping("/connection")
    public ClaudeConnectionStatusResponse disconnect(@PathVariable String skillpilotId) {
        connectionService.disconnect(skillpilotId);
        return new ClaudeConnectionStatusResponse(false);
    }
}
