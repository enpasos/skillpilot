package com.skillpilot.backend.connectors.claude.v1.oauth;

import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Contract;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Properties;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ReadListener;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletInputStream;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Enumeration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.filter.OncePerRequestFilter;

/** Enforces the connector request-body limit before JSON reaches a decoder. */
final class ClaudeV1RequestSizeFilter extends OncePerRequestFilter {

    private final int maxBytes;

    ClaudeV1RequestSizeFilter(ClaudeV1Properties properties) {
        this.maxBytes = Objects.requireNonNull(properties, "properties").getMaxRequestBodyBytes();
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getRequestURI().startsWith(ClaudeV1Contract.INTERNAL_BASE_PATH);
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        if (request.getContentLengthLong() > maxBytes) {
            reject(response);
            return;
        }

        if (mustBufferBody(request)) {
            byte[] body = request.getInputStream().readNBytes(maxBytes + 1);
            if (body.length > maxBytes) {
                reject(response);
                return;
            }
            try {
                filterChain.doFilter(new CachedBodyRequest(request, body), response);
            } catch (MalformedFormBodyException e) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.setHeader(HttpHeaders.CACHE_CONTROL, "no-store");
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                response.getWriter().write("{\"error\":\"invalid_request\"}");
            }
            return;
        }
        filterChain.doFilter(request, response);
    }

    private boolean mustBufferBody(HttpServletRequest request) {
        if (!"POST".equals(request.getMethod())) {
            return false;
        }
        String uri = request.getRequestURI();
        return ClaudeV1Contract.INTERNAL_MCP_PATH.equals(uri)
                || (ClaudeV1Contract.INTERNAL_CONNECT_PATH + "/details").equals(uri)
                || (ClaudeV1Contract.INTERNAL_CONNECT_PATH + "/bind").equals(uri)
                || ClaudeV1Contract.INTERNAL_TOKEN_PATH.equals(uri)
                || ClaudeV1Contract.INTERNAL_REVOKE_PATH.equals(uri);
    }

    private void reject(HttpServletResponse response) throws IOException {
        response.setStatus(HttpServletResponse.SC_REQUEST_ENTITY_TOO_LARGE);
        response.setHeader(HttpHeaders.CACHE_CONTROL, "no-store");
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write("{\"error\":\"request_too_large\"}");
    }

    private static final class CachedBodyRequest extends HttpServletRequestWrapper {
        private final byte[] body;
        private final Map<String, String[]> formParameters;

        private CachedBodyRequest(HttpServletRequest request, byte[] body) {
            super(request);
            this.body = body;
            this.formParameters = isFormContentType(request.getContentType())
                    ? parseForm(body)
                    : null;
        }

        @Override
        public ServletInputStream getInputStream() {
            ByteArrayInputStream input = new ByteArrayInputStream(body);
            return new ServletInputStream() {
                @Override
                public boolean isFinished() {
                    return input.available() == 0;
                }

                @Override
                public boolean isReady() {
                    return true;
                }

                @Override
                public void setReadListener(ReadListener readListener) {
                    throw new UnsupportedOperationException("Asynchronous request reads are not supported.");
                }

                @Override
                public int read() {
                    return input.read();
                }
            };
        }

        @Override
        public BufferedReader getReader() {
            return new BufferedReader(new InputStreamReader(getInputStream(), StandardCharsets.UTF_8));
        }

        @Override
        public int getContentLength() {
            return body.length;
        }

        @Override
        public long getContentLengthLong() {
            return body.length;
        }

        @Override
        public String getParameter(String name) {
            if (formParameters == null) {
                return super.getParameter(name);
            }
            String[] values = formParameters.get(name);
            return values == null || values.length == 0 ? null : values[0];
        }

        @Override
        public String[] getParameterValues(String name) {
            if (formParameters == null) {
                return super.getParameterValues(name);
            }
            String[] values = formParameters.get(name);
            return values == null ? null : values.clone();
        }

        @Override
        public Enumeration<String> getParameterNames() {
            return formParameters == null
                    ? super.getParameterNames()
                    : Collections.enumeration(formParameters.keySet());
        }

        @Override
        public Map<String, String[]> getParameterMap() {
            if (formParameters == null) {
                return super.getParameterMap();
            }
            Map<String, String[]> copy = new LinkedHashMap<>();
            formParameters.forEach((key, values) -> copy.put(key, values.clone()));
            return Collections.unmodifiableMap(copy);
        }

        private static boolean isFormContentType(String contentType) {
            if (contentType == null) {
                return false;
            }
            try {
                MediaType mediaType = MediaType.parseMediaType(contentType);
                return MediaType.APPLICATION_FORM_URLENCODED.getType().equalsIgnoreCase(mediaType.getType())
                        && MediaType.APPLICATION_FORM_URLENCODED.getSubtype()
                                .equalsIgnoreCase(mediaType.getSubtype());
            } catch (IllegalArgumentException e) {
                return false;
            }
        }

        private static Map<String, String[]> parseForm(byte[] body) {
            Map<String, List<String>> values = new LinkedHashMap<>();
            String encoded = new String(body, StandardCharsets.UTF_8);
            if (!encoded.isEmpty()) {
                for (String pair : encoded.split("&", -1)) {
                    String[] parts = pair.split("=", 2);
                    try {
                        String name = URLDecoder.decode(parts[0], StandardCharsets.UTF_8);
                        String value = parts.length == 2
                                ? URLDecoder.decode(parts[1], StandardCharsets.UTF_8)
                                : "";
                        values.computeIfAbsent(name, ignored -> new ArrayList<>()).add(value);
                    } catch (IllegalArgumentException e) {
                        throw new MalformedFormBodyException();
                    }
                }
            }
            Map<String, String[]> result = new LinkedHashMap<>();
            values.forEach((key, entries) -> result.put(key, entries.toArray(String[]::new)));
            return Collections.unmodifiableMap(result);
        }
    }

    private static final class MalformedFormBodyException extends RuntimeException {}
}
