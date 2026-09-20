package com.skillpilot.backend.content;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

/** A scoped PoC grant, not proof of general learner ownership. No ID-only issuance endpoint. */
@Component
public class ContentConfigurationAuthorization {
    public static final String HEADER = "X-SkillPilot-Content-Capability";
    private final boolean enabled;
    private final Map<String, String> grants;

    public ContentConfigurationAuthorization(
            @Value("${skillpilot.content.enabled:false}") boolean enabled,
            @Value("${skillpilot.content.configuration-grants-json:}") String grantsJson) {
        this.enabled = enabled;
        this.grants = parseGrants(grantsJson);
    }

    private static Map<String, String> parseGrants(String json) {
        if (json == null || json.isBlank()) return Map.of();
        try {
            if (json.length() > 100_000) return Map.of();
            var node = new ObjectMapper().readTree(json);
            if (!node.isObject() || node.size() > 500) return Map.of();
            Map<String, String> result = new java.util.HashMap<>();
            var fields = node.fields();
            while (fields.hasNext()) {
                var field = fields.next();
                if (!field.getKey().matches("[A-Za-z0-9_-]{1,80}")
                        || !field.getValue().isTextual()
                        || !field.getValue().textValue().matches("[0-9a-f]{64}")) return Map.of();
                result.put(field.getKey(), field.getValue().textValue());
            }
            return Map.copyOf(result);
        } catch (Exception invalidConfiguration) {
            // Fail closed for this optional feature, not for normal learning. Never log grants.
            return Map.of();
        }
    }

    public boolean isEnabled() { return enabled; }

    public void requireEnabled() {
        if (!enabled) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Content pilot unavailable");
    }

    public void requireWrite(String learnerId, String capability) {
        requireEnabled();
        String expected = grants.get(learnerId);
        if (capability == null || !capability.matches("[A-Za-z0-9_-]{43}")) deny();
        try {
            byte[] actual = MessageDigest.getInstance("SHA-256")
                    .digest(capability.getBytes(StandardCharsets.UTF_8));
            byte[] configured = expected == null ? new byte[32] : HexFormat.of().parseHex(expected);
            if (!MessageDigest.isEqual(actual, configured) || expected == null) deny();
        } catch (java.security.NoSuchAlgorithmException impossible) {
            throw new IllegalStateException(impossible);
        }
    }

    private static void deny() {
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Content configuration grant required");
    }
}
