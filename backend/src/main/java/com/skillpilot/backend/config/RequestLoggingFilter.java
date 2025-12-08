package com.skillpilot.backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Component
public class RequestLoggingFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(RequestLoggingFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        if (!request.getRequestURI().startsWith("/api")) {
            filterChain.doFilter(request, response);
            return;
        }

        ContentCachingRequestWrapper requestWrapper = new ContentCachingRequestWrapper(request, 50000);
        ContentCachingResponseWrapper responseWrapper = new ContentCachingResponseWrapper(response);

        long startTime = System.currentTimeMillis();
        try {
            filterChain.doFilter(requestWrapper, responseWrapper);
        } finally {
            long duration = System.currentTimeMillis() - startTime;
            String requestBody = new String(requestWrapper.getContentAsByteArray(), StandardCharsets.UTF_8);
            String responseBody = new String(responseWrapper.getContentAsByteArray(), StandardCharsets.UTF_8);

            logger.info("API Request: {} {} | Status: {} | Duration: {}ms",
                    request.getMethod(), request.getRequestURI(), response.getStatus(), duration);

            if (!requestBody.isBlank()) {
                logger.info("Request Body: {}", requestBody);
            }

            if (!responseBody.isBlank()) {
                // Limit response logging to avoid flooding logs with huge JSONs if needed,
                // but for debugging purposes we log it all or a reasonable prefix.
                // For now, let's log it all as requested.
                logger.info("Response Body: {}", responseBody);
            }

            responseWrapper.copyBodyToResponse();
        }
    }
}
