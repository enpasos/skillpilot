package com.skillpilot.backend.openai.de.oauth;

import com.skillpilot.backend.service.OpenAiDeCoachConnectionService;
import com.skillpilot.backend.openai.de.observability.OpenAiDeOperationalTelemetry;
import com.skillpilot.backend.openai.de.observability.OpenAiDeOperationalTelemetry.Event;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.server.ResponseStatusException;

/** Exchanges the one-time browser grant for an opaque OpenAI-DE subject. */
public final class OpenAiDeBindingAuthenticationFilter extends OncePerRequestFilter {

    public static final String CONNECTION_AUTHORITY = "ROLE_OPENAI_DE_CONNECTOR";

    private final OpenAiDeCoachConnectionService connectionService;
    private final SecurityContextRepository contextRepository;
    private final OpenAiDeOperationalTelemetry telemetry;
    private final boolean secureCookie;

    public OpenAiDeBindingAuthenticationFilter(
            OpenAiDeCoachConnectionService connectionService,
            SecurityContextRepository contextRepository,
            OpenAiDeOperationalTelemetry telemetry,
            boolean secureCookie) {
        this.connectionService = connectionService;
        this.contextRepository = contextRepository;
        this.telemetry = telemetry;
        this.secureCookie = secureCookie;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !OpenAiDeCoachConnectionService.AUTHORIZATION_PATH.equals(request.getRequestURI());
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        Authentication current = SecurityContextHolder.getContext().getAuthentication();
        String rawGrant = cookieValue(request, OpenAiDeCoachConnectionService.BINDING_COOKIE_NAME);
        String rawBrowserSession = cookieValue(
                request,
                OpenAiDeCoachConnectionService.BROWSER_SESSION_COOKIE_NAME);
        if (rawGrant == null && isOpenAiDeConnection(current)) {
            filterChain.doFilter(request, response);
            return;
        }

        SecurityContextHolder.clearContext();
        if (rawGrant == null) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String subject = connectionService.consumeBindingGrant(rawGrant, rawBrowserSession);
            Authentication authentication = UsernamePasswordAuthenticationToken.authenticated(
                    subject,
                    null,
                    List.of(new SimpleGrantedAuthority(CONNECTION_AUTHORITY)));
            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);
            contextRepository.saveContext(context, request, response);
            clearBindingCookie(response);
            filterChain.doFilter(request, response);
        } catch (ResponseStatusException exception) {
            if (exception.getStatusCode().value() == HttpServletResponse.SC_CONFLICT) {
                telemetry.record(Event.REPLAY_REJECTED);
            }
            SecurityContext emptyContext = SecurityContextHolder.createEmptyContext();
            SecurityContextHolder.setContext(emptyContext);
            contextRepository.saveContext(emptyContext, request, response);
            clearBindingCookie(response);
            response.sendRedirect("/api/openai/de/oauth/connect-required?reason=expired");
        }
    }

    private boolean isOpenAiDeConnection(Authentication authentication) {
        return authentication != null
                && authentication.isAuthenticated()
                && authentication.getAuthorities().stream()
                        .anyMatch(authority -> CONNECTION_AUTHORITY.equals(authority.getAuthority()));
    }

    private String cookieValue(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }
        for (Cookie cookie : cookies) {
            if (name.equals(cookie.getName()) && cookie.getValue() != null && !cookie.getValue().isBlank()) {
                return cookie.getValue();
            }
        }
        return null;
    }

    private void clearBindingCookie(HttpServletResponse response) {
        ResponseCookie cleared = ResponseCookie.from(OpenAiDeCoachConnectionService.BINDING_COOKIE_NAME, "")
                .httpOnly(true)
                .secure(secureCookie)
                .sameSite("Lax")
                .path(OpenAiDeCoachConnectionService.AUTHORIZATION_PATH)
                .maxAge(0)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cleared.toString());
    }
}
