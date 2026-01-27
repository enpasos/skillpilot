package com.skillpilot.backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;

@Component
public class AiAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(AiAuthenticationFilter.class);

    @Value("${skillpilot.ai.api-key:}")
    private String apiKey;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        if (apiKey != null && !apiKey.isBlank() && request.getRequestURI().startsWith("/api/ai")) {
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ") || !authHeader.substring(7).equals(apiKey)) {
                boolean hasBearer = authHeader != null && authHeader.startsWith("Bearer ");
                logger.warn("AI auth failed: method={} path={} hasBearer={} remote={} ua={}",
                        request.getMethod(),
                        request.getRequestURI(),
                        hasBearer,
                        request.getRemoteAddr(),
                        request.getHeader("User-Agent"));
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
