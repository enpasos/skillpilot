package com.skillpilot.backend.connectors.claude.v1.oauth;

import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Contract;
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

/** Establishes a learner-free technical principal for the reusable Claude app OAuth flow. */
public final class ClaudeV1AppAuthenticationFilter extends OncePerRequestFilter {

    public static final String APP_AUTHORITY = "ROLE_CLAUDE_V1_CONNECTOR";
    public static final String APP_SUBJECT_PREFIX = "spca_";

    private final SecurityContextRepository contextRepository;

    public ClaudeV1AppAuthenticationFilter(SecurityContextRepository contextRepository) {
        this.contextRepository = contextRepository;
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
        Authentication current = SecurityContextHolder.getContext().getAuthentication();
        if (isClaudeApp(current)) {
            filterChain.doFilter(request, response);
            return;
        }

        Authentication authentication = UsernamePasswordAuthenticationToken.authenticated(
                APP_SUBJECT_PREFIX + UUID.randomUUID(),
                null,
                List.of(new SimpleGrantedAuthority(APP_AUTHORITY)));
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        contextRepository.saveContext(context, request, response);
        filterChain.doFilter(request, response);
    }

    private boolean isClaudeApp(Authentication authentication) {
        return authentication != null
                && authentication.isAuthenticated()
                && authentication.getName() != null
                && authentication.getName().startsWith(APP_SUBJECT_PREFIX)
                && authentication.getAuthorities().stream()
                        .anyMatch(authority -> APP_AUTHORITY.equals(authority.getAuthority()));
    }
}
