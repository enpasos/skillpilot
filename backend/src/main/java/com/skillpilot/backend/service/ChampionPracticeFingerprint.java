package com.skillpilot.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.landscape.LearningGoal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import org.springframework.stereotype.Component;

/** Content binding for actual practice; presentation metadata and JSON formatting are not content. */
@Component
public class ChampionPracticeFingerprint {
    private final ObjectMapper mapper;
    private final DeckResourceService decks;
    private final org.springframework.core.io.ResourceLoader resources;
    private final java.util.concurrent.ConcurrentMap<String, AssetDigest> assetDigests =
            new java.util.concurrent.ConcurrentHashMap<>();
    private record AssetDigest(long modified, long size, String digest) {}

    public ChampionPracticeFingerprint(ObjectMapper mapper, DeckResourceService decks) {
        this(mapper, decks, new org.springframework.core.io.DefaultResourceLoader());
    }

    @org.springframework.beans.factory.annotation.Autowired
    public ChampionPracticeFingerprint(ObjectMapper mapper, DeckResourceService decks,
            org.springframework.core.io.ResourceLoader resources) {
        this.mapper = mapper;
        this.decks = decks;
        this.resources = resources;
    }

    public String forGoal(LearningGoal goal) {
        if (goal == null || goal.getId() == null) return null;
        try {
            Map<String, Object> semantic = new TreeMap<>();
            semantic.put("id", goal.getId());
            semantic.put("title", goal.getTitle());
            semantic.put("titleEn", goal.getTitleEn());
            semantic.put("description", goal.getDescription());
            semantic.put("descriptionEn", goal.getDescriptionEn());
            semantic.put("requires", sorted(goal.getRequires()));
            semantic.put("contains", sorted(goal.getContains()));
            semantic.put("semanticKind", goal.getSemanticKind());
            semantic.put("nodeKind", goal.getNodeKind());
            semantic.put("exam", goal.getExamData());
            semantic.put("experiment", goal.getExperimentData());
            // Authorship/QA labels and their ordering are presentation metadata, not another trial obligation.
            semantic.put("tags", sorted(goal.getTags()).stream().filter(tag ->
                    tag.equals("memorization") || tag.equals("orientation") || tag.equals("exam")
                    || tag.startsWith("srs-deck:") || tag.startsWith("select:")).toList());
            List<Object> materials = new ArrayList<>();
            for (Map<String, Object> link : goal.getResourceLinks() == null
                    ? List.<Map<String, Object>>of() : goal.getResourceLinks()) {
                if ("curriculum".equals(link.get("type"))) continue;
                Map<String, Object> content = new TreeMap<>();
                for (String key : List.of("type", "resourceType", "role", "url", "lang", "title",
                        "description", "altText", "transcript", "content")) {
                    if (link.containsKey(key)) content.put(key, link.get(key));
                }
                if (link.get("url") instanceof String url && url.startsWith("/assets/")) {
                    if (url.contains("..") || url.contains("\\")) return null;
                    content.put("assetDigest", assetDigest(url));
                }
                materials.add(content);
            }
            semantic.put("materials", materials);
            Map<String, Object> extended = goal.getExtendedData();
            if (extended != null) {
                for (String key : List.of("orientationOutlook", "learningMaterial", "learningMaterials",
                        "content", "assessment", "practice", "exercise", "solution", "instructions")) {
                    if (extended.containsKey(key)) semantic.put(key, extended.get(key));
                }
                for (String key : List.of("vocabularySource", "vocabularySourceEn")) {
                    if (extended.get(key) instanceof String source && !source.isBlank()) {
                        var resource = decks.resolveDeckResource(goal.getId(), source);
                        if (resource == null || !resource.exists()) return null;
                        try (var input = resource.getInputStream()) {
                            // Card semantics, including selection tags, are part of the practiced station.
                            semantic.put(key, mapper.readTree(input).get("cards"));
                        }
                    }
                }
            }
            return digest(mapper.writeValueAsString(normalize(mapper.valueToTree(semantic))));
        } catch (Exception exception) {
            return null; // Missing or invalid content never creates a valid practice receipt.
        }
    }

    private String assetDigest(String url) throws Exception {
        var resource = resources.getResource("classpath:static" + url);
        if (!resource.exists()) throw new IllegalStateException("Missing practice material");
        long modified = resource.lastModified();
        long size = resource.contentLength();
        if (size <= 0 || size > 20 * 1024 * 1024) throw new IllegalStateException("Invalid practice material");
        AssetDigest cached = assetDigests.get(url);
        if (cached != null && cached.modified() == modified && cached.size() == size) return cached.digest();
        String digest;
        try (var input = resource.getInputStream()) {
            byte[] bytes = input.readNBytes(20 * 1024 * 1024 + 1);
            if (bytes.length != size) throw new IllegalStateException("Practice material changed during read");
            digest = HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes));
        }
        assetDigests.put(url, new AssetDigest(modified, size, digest));
        return digest;
    }

    private static List<String> sorted(List<String> values) {
        return values == null ? List.of() : values.stream().filter(java.util.Objects::nonNull).sorted().toList();
    }

    private Object normalize(JsonNode node) {
        if (node == null || node.isNull()) return null;
        if (node.isObject()) {
            Map<String, Object> result = new TreeMap<>();
            node.fields().forEachRemaining(entry -> result.put(entry.getKey(), normalize(entry.getValue())));
            return result;
        }
        if (node.isArray()) {
            List<Object> result = new ArrayList<>();
            node.forEach(value -> result.add(normalize(value)));
            return result;
        }
        if (node.isTextual()) return node.textValue().strip().replaceAll("\\s+", " ");
        return mapper.convertValue(node, Object.class);
    }

    public static String digest(String value) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new IllegalStateException(exception);
        }
    }
}
