package com.skillpilot.backend.openai.de.oauth;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.UUID;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Establishes the technical application principal used during the OAuth
 * authorization flow.
 *
 * <p>The predefined OAuth client authenticates the SkillPilot ChatGPT app at
 * the token endpoint. This filter deliberately does not resolve a learner:
 * learner selection is carried only by the separate, short-lived learning
 * session supplied to MCP tools.
 */
public final class OpenAiDeBindingAuthenticationFilter extends OncePerRequestFilter {

    public static final String CONNECTION_AUTHORITY = "ROLE_OPENAI_DE_CONNECTOR";
    private static final String APP_SUBJECT_PREFIX = "spoa_";

    private final SecurityContextRepository contextRepository;

    public OpenAiDeBindingAuthenticationFilter(
            SecurityContextRepository contextRepository) {
        this.contextRepository = contextRepository;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !OpenAiDeOAuthConfiguration.AUTHORIZATION_ENDPOINT.equals(request.getRequestURI());
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        Authentication current = SecurityContextHolder.getContext().getAuthentication();
        if (isOpenAiDeConnection(current)) {
            filterChain.doFilter(request, response);
            return;
        }

        Authentication authentication = UsernamePasswordAuthenticationToken.authenticated(
                APP_SUBJECT_PREFIX + UUID.randomUUID(),
                null,
                List.of(new SimpleGrantedAuthority(CONNECTION_AUTHORITY)));
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        contextRepository.saveContext(context, request, response);
        filterChain.doFilter(request, response);
    }

    private boolean isOpenAiDeConnection(Authentication authentication) {
        return authentication != null
                && authentication.isAuthenticated()
                && authentication.getAuthorities().stream()
                        .anyMatch(authority -> CONNECTION_AUTHORITY.equals(authority.getAuthority()));
    }

}
