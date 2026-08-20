package com.skillpilot.backend.connectors.claude.v1.web;

import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Contract;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Properties;
import com.skillpilot.backend.connectors.claude.v1.ConditionalOnClaudeV1Enabled;
import com.skillpilot.backend.connectors.claude.v1.identity.ClaudeV1BindingService;
import com.skillpilot.backend.connectors.claude.v1.identity.ClaudeV1BindingTransaction;
import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Objects;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * Serves the Claude v1 binding page, its browser assets, the privacy notice, and the endpoint that
 * accepts a locally decrypted SkillPilot id.
 *
 * <p>Everything this controller hands back to a browser uses the public Claude v1 origin. The
 * internal prefix exists only between nginx and this application and would return {@code 404} at
 * the edge.</p>
 */
@RestController
@ConditionalOnClaudeV1Enabled
public class ClaudeV1ConnectionController {

    /** {@code skillpilotId} arrives already decrypted in the browser; the password never does. */
    public record BindRequest(String handle, String skillpilotId) {}

    public record BindResponse(String status, String redirectUrl) {}

    public record TransactionDetailsRequest(String handle) {}

    public record TransactionDetailsResponse(
            String clientName,
            String clientHost,
            String redirectHost,
            String redirectType,
            List<String> requestedScopes) {}

    public record CsrfResponse(String headerName, String parameterName, String token) {}

    private final ClaudeV1BindingService bindingService;
    private final ClaudeV1Properties properties;

    public ClaudeV1ConnectionController(
            ClaudeV1BindingService bindingService,
            ClaudeV1Properties properties) {
        this.bindingService = Objects.requireNonNull(bindingService, "bindingService");
        this.properties = Objects.requireNonNull(properties, "properties");
    }

    @GetMapping(value = ClaudeV1Contract.INTERNAL_CONNECT_PATH, produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> getConnectPage() {
        return asset("claude-connector-v1/connect.html", MediaType.TEXT_HTML_VALUE);
    }

    @GetMapping(value = ClaudeV1Contract.INTERNAL_CONNECT_PATH + "/connect.js", produces = "text/javascript")
    public ResponseEntity<String> getConnectScript() {
        return asset("claude-connector-v1/connect.js", "text/javascript");
    }

    @GetMapping(value = ClaudeV1Contract.INTERNAL_CONNECT_PATH + "/id-decrypt.js", produces = "text/javascript")
    public ResponseEntity<String> getIdDecryptModule() {
        return asset("claude-connector-v1/id-decrypt.js", "text/javascript");
    }

    @GetMapping(value = ClaudeV1Contract.INTERNAL_PRIVACY_PATH, produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> getPrivacyPage() {
        return asset("claude-connector-v1/privacy.html", MediaType.TEXT_HTML_VALUE);
    }

    /** Materializes Spring Security's same-origin CSRF token for the browser binding POST. */
    @GetMapping(
            value = ClaudeV1Contract.INTERNAL_CONNECT_PATH + "/csrf",
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<CsrfResponse> getCsrfToken(CsrfToken csrfToken) {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(new CsrfResponse(
                        csrfToken.getHeaderName(),
                        csrfToken.getParameterName(),
                        csrfToken.getToken()));
    }

    /** Returns the exact server-side client and callback identity shown before consent. */
    @PostMapping(
            value = ClaudeV1Contract.INTERNAL_CONNECT_PATH + "/details",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<TransactionDetailsResponse> getTransactionDetails(
            @RequestBody(required = false) TransactionDetailsRequest request,
            HttpServletRequest httpRequest) {
        requireSameOriginSubmission(httpRequest);
        if (request == null || request.handle() == null || request.handle().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "handle is required.");
        }
        try {
            ClaudeV1BindingTransaction transaction =
                    bindingService.requirePendingTransaction(request.handle());
            URI clientId = URI.create(transaction.registeredClientId());
            URI redirect = URI.create(transaction.redirectUri());
            String clientName = ClaudeV1Contract.CIMD_CLAUDE_CODE_CLIENT_ID.equals(
                            transaction.registeredClientId())
                    ? "Claude Code"
                    : "Claude.ai / Desktop / Mobile";
            String redirectType = ClaudeV1Contract.CIMD_CLAUDE_CODE_CLIENT_ID.equals(
                            transaction.registeredClientId())
                    ? "Local loopback callback"
                    : "Anthropic HTTPS callback";
            return ResponseEntity.ok()
                    .cacheControl(CacheControl.noStore())
                    .body(new TransactionDetailsResponse(
                            clientName,
                            authority(clientId),
                            authority(redirect),
                            redirectType,
                            List.of(transaction.scope().split("\\s+"))));
        } catch (IllegalArgumentException | IllegalStateException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "The binding transaction could not be displayed.");
        }
    }

    @PostMapping(
            value = ClaudeV1Contract.INTERNAL_CONNECT_PATH + "/bind",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<BindResponse> bindLearner(
            @RequestBody(required = false) BindRequest request,
            HttpServletRequest httpRequest) {

        requireSameOriginSubmission(httpRequest);

        if (request == null
                || request.handle() == null || request.handle().isBlank()
                || request.skillpilotId() == null || request.skillpilotId().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "handle and skillpilotId are required.");
        }

        try {
            ClaudeV1BindingService.BindingResult binding =
                    bindingService.bindLearnerWithResult(request.handle(), request.skillpilotId());

            return ResponseEntity.ok()
                    .cacheControl(CacheControl.noStore())
                    .body(new BindResponse("BOUND", authorizeRedirectUrl(binding.transaction())));
        } catch (IllegalArgumentException e) {
            // Messages here describe the caller's own input, never internal state.
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The binding request could not be accepted.");
        } catch (IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This binding has expired or was already used.");
        } catch (ResponseStatusException e) {
            // Do not disclose whether a submitted permanent learner id exists or is a retired
            // compatibility session. The browser only needs to know that binding was refused.
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The binding request could not be accepted.");
        }
    }

    /**
     * Defence in depth in addition to Spring's synchronizer token. Browser fetch always supplies
     * an Origin; accepting an absent one would turn this check into an opt-in signal for attackers.
     */
    private void requireSameOriginSubmission(HttpServletRequest request) {
        String fetchSite = request.getHeader("Sec-Fetch-Site");
        if (fetchSite != null && !"same-origin".equals(fetchSite)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cross-site submissions are not accepted.");
        }
        String origin = request.getHeader("Origin");
        String expectedOrigin = properties.getPublicOrigin();
        if (expectedOrigin == null || !expectedOrigin.equals(origin)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cross-site submissions are not accepted.");
        }
    }

    /** Rebuilds the authorization request from the stored transaction, on the public origin. */
    private String authorizeRedirectUrl(ClaudeV1BindingTransaction transaction) {
        return properties.getPublicAuthorizeUrl()
                + "?response_type=code"
                + "&client_id=" + encode(transaction.registeredClientId())
                + "&redirect_uri=" + encode(transaction.redirectUri())
                + "&scope=" + encode(transaction.scope())
                + "&state=" + encode(transaction.oauthState())
                + "&code_challenge=" + encode(transaction.codeChallenge())
                + "&code_challenge_method=" + encode(transaction.codeChallengeMethod())
                + "&resource=" + encode(transaction.resource());
    }

    private ResponseEntity<String> asset(String classpathLocation, String contentType) {
        try (InputStream in = new ClassPathResource(classpathLocation).getInputStream()) {
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .cacheControl(CacheControl.noStore())
                    .header("Content-Security-Policy",
                            "default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; "
                                    + "connect-src 'self'; img-src 'self' data:; form-action 'self'; "
                                    + "frame-ancestors 'none'; base-uri 'none'")
                    .header("Referrer-Policy", "no-referrer")
                    .header("X-Content-Type-Options", "nosniff")
                    .header("X-Frame-Options", "DENY")
                    .body(new String(in.readAllBytes(), StandardCharsets.UTF_8));
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found.");
        }
    }

    private static String encode(String value) {
        return value == null ? "" : URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private static String authority(URI uri) {
        String host = uri.getHost();
        if (host == null || host.isBlank() || uri.getUserInfo() != null) {
            throw new IllegalArgumentException("URI has no safe host.");
        }
        return uri.getPort() < 0 ? host : host + ":" + uri.getPort();
    }
}
