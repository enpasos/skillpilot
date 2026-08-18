package com.skillpilot.backend.connectors.claude.v1.oauth;

import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Contract;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Properties;
import com.skillpilot.backend.connectors.claude.v1.identity.ClaudeV1BindingService;
import com.skillpilot.backend.connectors.claude.v1.identity.ClaudeV1BindingTransaction;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.regex.Pattern;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Routes a Claude v1 authorization request through the local browser-decryption binding page
 * before any authorization code is issued.
 *
 * <p>The first pass creates a short-lived binding transaction and redirects to the public connect
 * page. The second pass — after the learner decrypted their ID file locally — re-validates that the
 * returning request is the same authorization request that created the transaction before it
 * authenticates the resolved connection. Without that comparison a stolen {@code state} value would
 * be enough to attach someone else's connection to an attacker-chosen client and redirect URI.</p>
 */
public class ClaudeV1BindingAuthenticationFilter extends OncePerRequestFilter {

    private static final String ROLE_CLAUDE_LEARNER = "ROLE_CLAUDE_LEARNER";
    private static final Pattern STATE_PATTERN = Pattern.compile("^[\\x21-\\x7e]{8,256}$");
    private static final Pattern S256_CHALLENGE_PATTERN = Pattern.compile("^[A-Za-z0-9_-]{43}$");

    private final ClaudeV1BindingService bindingService;
    private final ClaudeV1CimdMetadataValidator cimdValidator;
    private final ClaudeV1Properties properties;

    public ClaudeV1BindingAuthenticationFilter(
            ClaudeV1BindingService bindingService,
            ClaudeV1CimdMetadataValidator cimdValidator,
            ClaudeV1Properties properties) {
        this.bindingService = Objects.requireNonNull(bindingService, "bindingService");
        this.cimdValidator = Objects.requireNonNull(cimdValidator, "cimdValidator");
        this.properties = Objects.requireNonNull(properties, "properties");
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !ClaudeV1Contract.INTERNAL_AUTHORIZE_PATH.equals(request.getRequestURI());
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        if (!"GET".equals(request.getMethod())) {
            response.sendError(HttpServletResponse.SC_METHOD_NOT_ALLOWED);
            return;
        }

        String responseType = singleParameter(request, "response_type");
        String clientId = singleParameter(request, "client_id");
        String redirectUri = singleParameter(request, "redirect_uri");
        String state = singleParameter(request, "state");
        String codeChallenge = singleParameter(request, "code_challenge");
        String codeChallengeMethod = singleParameter(request, "code_challenge_method");
        String requestedScope = singleParameter(request, "scope");
        String resource = singleParameter(request, "resource");

        if (!"code".equals(responseType)) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Only the authorization-code flow is supported.");
            return;
        }

        if (clientId == null || !cimdValidator.isVerifiedClientId(clientId)) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Unsupported client_id.");
            return;
        }
        if (redirectUri == null || !cimdValidator.isValidRedirectUri(clientId, redirectUri)) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Unsupported redirect_uri.");
            return;
        }
        if (state == null || !STATE_PATTERN.matcher(state).matches()
                || codeChallenge == null || !S256_CHALLENGE_PATTERN.matcher(codeChallenge).matches()
                || !"S256".equals(codeChallengeMethod)) {
            // PKCE plain and a missing challenge are rejected outright, not downgraded.
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "state and PKCE S256 challenge are required.");
            return;
        }
        if (!properties.getPublicMcpUrl().equals(resource)) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "resource does not match this connector.");
            return;
        }

        String scope;
        try {
            scope = normalizeScope(requestedScope);
        } catch (IllegalArgumentException e) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Unsupported or incomplete scope.");
            return;
        }

        Optional<ClaudeV1BindingTransaction> boundTx = bindingService.findBoundTransactionByState(state);
        if (boundTx.isPresent()) {
            ClaudeV1BindingTransaction transaction = boundTx.get();
            if (!transaction.matchesAuthorizationRequest(
                    clientId, redirectUri, codeChallenge, codeChallengeMethod, scope, resource)) {
                response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Authorization request does not match the binding.");
                return;
            }
            // One-time use: consuming here means a replayed authorize request finds nothing bound
            // and has to start a fresh binding.
            if (!bindingService.consumeBindingTransaction(transaction)) {
                response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Binding has already been used.");
                return;
            }

            Authentication auth = new UsernamePasswordAuthenticationToken(
                    transaction.boundConnectionId(),
                    null,
                    List.of(new SimpleGrantedAuthority(ROLE_CLAUDE_LEARNER)));
            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(auth);
            SecurityContextHolder.setContext(context);

            filterChain.doFilter(request, response);
            return;
        }

        String handle;
        try {
            handle = bindingService.createBindingTransaction(
                    state,
                    codeChallenge,
                    codeChallengeMethod,
                    clientId,
                    redirectUri,
                    scope,
                    resource);
        } catch (RuntimeException e) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Authorization transaction could not be created.");
            return;
        }

        // The learner's browser is on the public Claude v1 origin; the internal prefix is not a
        // public alias and would 404 at the edge.
        response.setHeader(HttpHeaders.CACHE_CONTROL, "no-store");
        response.setHeader(HttpHeaders.PRAGMA, "no-cache");
        response.sendRedirect(properties.getPublicConnectUrl()
                + "#handle=" + URLEncoder.encode(handle, StandardCharsets.UTF_8));
    }

    private static String singleParameter(HttpServletRequest request, String name) {
        String[] values = request.getParameterValues(name);
        return values != null && values.length == 1 ? values[0] : null;
    }

    private static String normalizeScope(String requestedScope) {
        String effective = requestedScope == null || requestedScope.isBlank()
                ? String.join(" ",
                        ClaudeV1Contract.SCOPE_READ,
                        ClaudeV1Contract.SCOPE_WRITE,
                        ClaudeV1Contract.SCOPE_OFFLINE_ACCESS)
                : requestedScope.trim();
        Set<String> requested = new LinkedHashSet<>(List.of(effective.split("\\s+")));
        if (requested.isEmpty()
                || !ClaudeV1Contract.SUPPORTED_SCOPES.containsAll(requested)
                || !requested.contains(ClaudeV1Contract.SCOPE_READ)
                || !requested.contains(ClaudeV1Contract.SCOPE_WRITE)) {
            throw new IllegalArgumentException("Unsupported scope set.");
        }
        return java.util.stream.Stream.of(
                        ClaudeV1Contract.SCOPE_READ,
                        ClaudeV1Contract.SCOPE_WRITE,
                        ClaudeV1Contract.SCOPE_OFFLINE_ACCESS)
                .filter(requested::contains)
                .collect(java.util.stream.Collectors.joining(" "));
    }
}
