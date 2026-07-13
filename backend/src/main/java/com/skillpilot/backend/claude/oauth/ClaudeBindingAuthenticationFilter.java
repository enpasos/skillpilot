package com.skillpilot.backend.claude.oauth;

import com.skillpilot.backend.service.ClaudeCoachConnectionService;
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

/**
 * Converts the short-lived, browser-only SkillPilot binding grant into an
 * authenticated, opaque Claude connection subject for the OAuth authorization
 * request. The permanent SkillPilot ID never becomes an OAuth principal.
 */
public final class ClaudeBindingAuthenticationFilter extends OncePerRequestFilter {

    public static final String CONNECTION_AUTHORITY = "ROLE_CLAUDE_CONNECTOR";

    private final ClaudeCoachConnectionService connectionService;
    private final SecurityContextRepository contextRepository;
    private final boolean secureCookie;

    public ClaudeBindingAuthenticationFilter(
            ClaudeCoachConnectionService connectionService,
            SecurityContextRepository contextRepository,
            boolean secureCookie) {
        this.connectionService = connectionService;
        this.contextRepository = contextRepository;
        this.secureCookie = secureCookie;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !"/oauth2/authorize".equals(request.getRequestURI());
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        Authentication current = SecurityContextHolder.getContext().getAuthentication();
        String rawGrant = cookieValue(request, ClaudeCoachConnectionService.BINDING_COOKIE_NAME);
        if (rawGrant == null && isClaudeConnection(current)) {
            filterChain.doFilter(request, response);
            return;
        }

        SecurityContextHolder.clearContext();
        if (rawGrant == null) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String subject = connectionService.consumeBindingGrant(rawGrant);
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
            clearClaudeSecurityContext(request, response);
            clearBindingCookie(response);
            response.sendRedirect("/api/claude/oauth/connect-required?reason=expired");
        }
    }

    private boolean isClaudeConnection(Authentication authentication) {
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
        ResponseCookie cleared = ResponseCookie.from(ClaudeCoachConnectionService.BINDING_COOKIE_NAME, "")
                .httpOnly(true)
                .secure(secureCookie)
                .sameSite("Lax")
                .path("/oauth2/authorize")
                .maxAge(0)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cleared.toString());
    }

    private void clearClaudeSecurityContext(
            HttpServletRequest request,
            HttpServletResponse response) {
        SecurityContext emptyContext = SecurityContextHolder.createEmptyContext();
        SecurityContextHolder.setContext(emptyContext);
        contextRepository.saveContext(emptyContext, request, response);
    }
}
