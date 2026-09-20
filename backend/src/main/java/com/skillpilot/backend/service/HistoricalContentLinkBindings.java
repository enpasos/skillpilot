package com.skillpilot.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Map;
import org.springframework.core.io.ClassPathResource;

/**
 * Exact link-relocation compatibility, only for historical practice fingerprints.
 * Never used by curriculum, material rendering, authorization or the coach.
 * All other goal semantics and actual image bytes are still fingerprinted live.
 */
final class HistoricalContentLinkBindings {
    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final Map<String, JsonNode> BINDINGS = load();

    private HistoricalContentLinkBindings() {}

    static List<Map<String, Object>> forFingerprint(String goalId, List<Map<String, Object>> current) {
        List<Map<String, Object>> links = current == null ? List.of() : current;
        JsonNode binding = BINDINGS.get(goalId);
        if (binding == null || !MAPPER.valueToTree(links).equals(binding.get("afterResourceLinks"))) return links;
        return MAPPER.convertValue(binding.get("beforeResourceLinks"), new TypeReference<>() {});
    }

    private static Map<String, JsonNode> load() {
        try (var stream = new ClassPathResource("content/migrations/physik-libre-links-2026-09-20.json")
                .getInputStream()) {
            JsonNode manifest = MAPPER.readTree(stream);
            if (manifest.path("schemaVersion").asInt() != 1
                    || !manifest.path("migrationId").asText().equals("physik-libre-links-2026-09-20")) return Map.of();
            Map<String, JsonNode> bindings = new java.util.HashMap<>();
            for (JsonNode entry : manifest.path("entries")) {
                if (!entry.path("beforeResourceLinks").isArray() || !entry.path("afterResourceLinks").isArray()) return Map.of();
                var retained = MAPPER.createArrayNode();
                for (JsonNode link : entry.path("beforeResourceLinks")) {
                    if (!link.path("url").asText().startsWith("https://physikbuch.schule/")
                            || link.path("type").asText().equals("curriculum")) retained.add(link);
                }
                if (!retained.equals(entry.path("afterResourceLinks"))
                        || retained.size() == entry.path("beforeResourceLinks").size()
                        || bindings.putIfAbsent(entry.path("goalId").asText(), entry) != null) return Map.of();
            }
            return Map.copyOf(bindings);
        } catch (Exception unavailableCompatibilityEvidence) {
            // Fail closed: no unproven fingerprint equivalence.
            return Map.of();
        }
    }
}
