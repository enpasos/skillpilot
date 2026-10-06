// SPDX-License-Identifier: Apache-2.0
package com.skillpilot.backend.connectors.gemini.v1.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.connectors.gemini.v1.GeminiV1Properties;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ReadListener;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletInputStream;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Clock;
import java.util.Base64;
import java.util.HashSet;
import java.util.HexFormat;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

/** 30-second, single-use, body-bound assertions never identify a learner. */
public final class GeminiV1GatewayFilter extends OncePerRequestFilter {
    private static final String PATH = "/gemini/v1/mcp";
    private static final Set<String> FIELDS = Set.of("iss", "aud", "sub", "iat", "exp", "jti", "method", "path", "body", "scopes");
    private final GeminiV1Properties properties;
    private final ObjectMapper mapper;
    private final Clock clock;
    private final ConcurrentHashMap<String, Long> used = new ConcurrentHashMap<>();

    public GeminiV1GatewayFilter(GeminiV1Properties properties, ObjectMapper mapper) { this(properties, mapper, Clock.systemUTC()); }
    GeminiV1GatewayFilter(GeminiV1Properties properties, ObjectMapper mapper, Clock clock) {
        this.properties = properties; this.mapper = mapper; this.clock = clock;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws IOException, ServletException {
        response.setHeader("Cache-Control", "no-store");
        if (!PATH.equals(request.getRequestURI()) || request.getQueryString() != null) { response.setStatus(404); return; }
        if (!"POST".equals(request.getMethod())) { response.setHeader("Allow", "POST"); response.setStatus(405); return; }
        // The public gateway consumes browser Origin and forwards none. Bind only to loopback.
        if (!Set.of("127.0.0.1", "0:0:0:0:0:0:0:1", "::1").contains(request.getRemoteAddr()) || request.getHeader("Origin") != null) {
            response.setStatus(403); return;
        }
        List<String> credentials = java.util.Collections.list(request.getHeaders("Authorization"));
        if (credentials.size() != 1 || !credentials.getFirst().matches("Bearer sgw1\\.[A-Za-z0-9_-]{1,2048}\\.[a-f0-9]{64}")) {
            response.setStatus(401); return;
        }
        if (request.getContentType() == null || !request.getContentType().split(";", 2)[0].trim().equalsIgnoreCase("application/json")) {
            response.setStatus(415); return;
        }
        int limit = properties.getMaxRequestBodyBytes();
        if (request.getContentLengthLong() > limit) { response.setStatus(413); return; }
        byte[] body = request.getInputStream().readNBytes(limit + 1);
        if (body.length > limit) { response.setStatus(413); return; }
        final JsonNode claims;
        try { claims = verify(credentials.getFirst().substring(7), body); }
        catch (Exception invalid) { response.setStatus(401); return; }
        var authentication = UsernamePasswordAuthenticationToken.authenticated(claims.get("sub").asText(), null,
                List.of(new SimpleGrantedAuthority("SCOPE_skillpilot.read"), new SimpleGrantedAuthority("SCOPE_skillpilot.write")));
        SecurityContextHolder.getContext().setAuthentication(authentication);
        try { chain.doFilter(new BodyRequest(request, body), response); }
        finally { SecurityContextHolder.clearContext(); }
    }

    private JsonNode verify(String token, byte[] body) throws Exception {
        String[] parts = token.split("\\.");
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(properties.getGatewaySecret().getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] expected = mac.doFinal((parts[0] + "." + parts[1]).getBytes(StandardCharsets.US_ASCII));
        if (!MessageDigest.isEqual(expected, HexFormat.of().parseHex(parts[2]))) throw new IllegalArgumentException();
        byte[] decoded = Base64.getUrlDecoder().decode(parts[1]);
        if (!Base64.getUrlEncoder().withoutPadding().encodeToString(decoded).equals(parts[1])) throw new IllegalArgumentException();
        JsonNode claims = mapper.reader().with(com.fasterxml.jackson.core.JsonParser.Feature.STRICT_DUPLICATE_DETECTION).readTree(decoded);
        Set<String> fields = new HashSet<>(); claims.fieldNames().forEachRemaining(fields::add);
        if (!claims.isObject() || !fields.equals(FIELDS)) throw new IllegalArgumentException();
        if (!text(claims, "iss", "skillpilot-gemini-gateway-v1") || !text(claims, "aud", properties.getGatewayAudience()) ||
                !text(claims, "method", "POST") || !text(claims, "path", PATH) || !claims.get("sub").isTextual() ||
                !claims.get("sub").asText().matches("spga_[a-f0-9]{64}") || !claims.get("jti").isTextual() ||
                !claims.get("jti").asText().matches("[A-Za-z0-9_-]{43}")) throw new IllegalArgumentException();
        if (!claims.get("iat").isIntegralNumber() || !claims.get("exp").isIntegralNumber()) throw new IllegalArgumentException();
        long now = clock.instant().getEpochSecond(), issued = claims.get("iat").longValue(), expires = claims.get("exp").longValue();
        if (issued > now || issued < now - 30 || expires <= now || expires - issued != 30) throw new IllegalArgumentException();
        JsonNode scopes = claims.get("scopes");
        if (!scopes.isArray() || scopes.size() != 2 || !scopes.get(0).isTextual() || !scopes.get(1).isTextual() ||
                !Set.of("skillpilot.read", "skillpilot.write").equals(Set.of(scopes.get(0).asText(), scopes.get(1).asText()))) throw new IllegalArgumentException();
        if (!text(claims, "body", HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(body)))) throw new IllegalArgumentException();
        used.entrySet().removeIf(entry -> entry.getValue() <= now);
        synchronized (used) {
            if (used.size() >= 10000 || used.putIfAbsent(claims.get("jti").asText(), expires) != null) throw new IllegalArgumentException();
        }
        return claims;
    }

    private static boolean text(JsonNode value, String key, String expected) { return value.get(key).isTextual() && expected.equals(value.get(key).textValue()); }
    private static final class BodyRequest extends HttpServletRequestWrapper {
        private final byte[] body;
        BodyRequest(HttpServletRequest request, byte[] body) { super(request); this.body = body; }
        @Override public int getContentLength() { return body.length; }
        @Override public long getContentLengthLong() { return body.length; }
        @Override public java.io.BufferedReader getReader() { return new java.io.BufferedReader(new java.io.InputStreamReader(getInputStream(), StandardCharsets.UTF_8)); }
        @Override public ServletInputStream getInputStream() {
            ByteArrayInputStream input = new ByteArrayInputStream(body);
            return new ServletInputStream() {
                @Override public boolean isFinished() { return input.available() == 0; }
                @Override public boolean isReady() { return true; }
                @Override public void setReadListener(ReadListener listener) { throw new UnsupportedOperationException(); }
                @Override public int read() { return input.read(); }
                @Override public int read(byte[] b, int offset, int length) { return input.read(b, offset, length); }
            };
        }
    }
}
