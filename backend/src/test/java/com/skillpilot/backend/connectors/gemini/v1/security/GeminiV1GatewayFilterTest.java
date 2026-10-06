// SPDX-License-Identifier: Apache-2.0
package com.skillpilot.backend.connectors.gemini.v1.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.connectors.gemini.v1.GeminiV1Properties;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Base64;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import static org.junit.jupiter.api.Assertions.*;

class GeminiV1GatewayFilterTest {
    private static final String SECRET = "gemini-test-gateway-independent-secret-123456789";
    private static final String AUDIENCE = "https://gemini.example.test/mcp";
    private static final byte[] BODY = "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/list\"}".getBytes(StandardCharsets.UTF_8);
    private final ObjectMapper mapper = new ObjectMapper();
    private final GeminiV1GatewayFilter filter;
    GeminiV1GatewayFilterTest() {
        var properties = new GeminiV1Properties(); properties.setGatewaySecret(SECRET); properties.setGatewayAudience(AUDIENCE);
        filter = new GeminiV1GatewayFilter(properties, mapper, Clock.fixed(Instant.ofEpochSecond(1000), ZoneOffset.UTC));
    }
    private Map<String,Object> claims() throws Exception {
        var claims = new LinkedHashMap<String,Object>();
        claims.put("iss", "skillpilot-gemini-gateway-v1"); claims.put("aud", AUDIENCE); claims.put("sub", "spga_" + "a".repeat(64));
        claims.put("iat", 1000); claims.put("exp", 1030); claims.put("jti", "b".repeat(43));
        claims.put("method", "POST"); claims.put("path", "/gemini/v1/mcp");
        claims.put("body", HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(BODY)));
        claims.put("scopes", List.of("skillpilot.read", "skillpilot.write")); return claims;
    }
    private String sign(Map<String,Object> claims, String secret) throws Exception {
        String value = "sgw1." + Base64.getUrlEncoder().withoutPadding().encodeToString(mapper.writeValueAsBytes(claims));
        Mac mac = Mac.getInstance("HmacSHA256"); mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        return value + "." + HexFormat.of().formatHex(mac.doFinal(value.getBytes(StandardCharsets.US_ASCII)));
    }
    private MockHttpServletRequest request(String token) {
        var request = new MockHttpServletRequest("POST", "/gemini/v1/mcp"); request.setRemoteAddr("127.0.0.1");
        request.setContentType("application/json"); request.setContent(BODY); request.addHeader("Authorization", "Bearer " + token); return request;
    }
    private int dispatch(MockHttpServletRequest request) throws Exception {
        var response = new MockHttpServletResponse(); filter.doFilter(request, response, (req,res) -> res.getWriter().write("ok")); return response.getStatus();
    }
    @Test void validAssertionIsSingleUseAndContextIsScopedToTheRequest() throws Exception {
        String token = sign(claims(), SECRET); var called = new AtomicBoolean(); var response = new MockHttpServletResponse();
        filter.doFilter(request(token), response, (req,res) -> {
            assertEquals("spga_" + "a".repeat(64), SecurityContextHolder.getContext().getAuthentication().getName());
            assertEquals(2, SecurityContextHolder.getContext().getAuthentication().getAuthorities().size());
            assertArrayEquals(BODY, req.getInputStream().readAllBytes()); called.set(true);
        });
        assertTrue(called.get()); assertNull(SecurityContextHolder.getContext().getAuthentication());
        assertEquals(401, dispatch(request(token)));
    }
    @Test void alteredSignedFieldsAndProviderSecretAreRejected() throws Exception {
        var overrides = List.<Map<String,Object>>of(
            Map.of("iss", "skillpilot-claude-gateway-v1"), Map.of("aud", "https://claude.example.test/mcp"),
            Map.of("sub", "learner-id"), Map.of("iat", 1001), Map.of("exp", 1000), Map.of("exp", 1060),
            Map.of("iat", 969, "exp", 999), Map.of("path", "/other/mcp"), Map.of("method", "GET"),
            Map.of("body", "0".repeat(64)), Map.of("scopes", List.of("skillpilot.read")),
            Map.of("scopes", List.of("skillpilot.read", "claude.write")), Map.of("jti", "short"));
        for (var changes : overrides) { var claims = claims(); claims.putAll(changes); assertEquals(401, dispatch(request(sign(claims, SECRET))), changes.toString()); }
        assertEquals(401, dispatch(request(sign(claims(), "different-provider-secret-123456789"))));
        var extra = claims(); extra.put("learner", "private"); assertEquals(401, dispatch(request(sign(extra, SECRET))));
    }
    @Test void bodyOriginPeerAliasesAndHeaderAmbiguityFailClosed() throws Exception {
        String token = sign(claims(), SECRET);
        var altered = request(token); altered.setContent("{}".getBytes(StandardCharsets.UTF_8)); assertEquals(401, dispatch(altered));
        var origin = request(token); origin.addHeader("Origin", "https://evil.example"); assertEquals(403, dispatch(origin));
        var remote = request(token); remote.setRemoteAddr("203.0.113.1"); assertEquals(403, dispatch(remote));
        var alias = request(token); alias.setRequestURI("/gemini/v1/mcp/"); assertEquals(404, dispatch(alias));
        var query = request(token); query.setQueryString("x=1"); assertEquals(404, dispatch(query));
        var duplicate = request(token); duplicate.addHeader("Authorization", "Bearer " + token); assertEquals(401, dispatch(duplicate));
        var oversized = request(token); oversized.setContent(new byte[65537]); assertEquals(413, dispatch(oversized));
        var missing = request(token); missing.removeHeader("Authorization"); assertEquals(401, dispatch(missing));
    }
}
