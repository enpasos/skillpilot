package com.skillpilot.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.landscape.LandscapeProperties;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Stream;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class CompositionViewService {

    private static final Path COMPOSITION_VIEW_ROOT = Path.of("DE", "Gymnasium", "composition-views");
    private static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<>() {
    };

    private final LandscapeProperties properties;
    private final ObjectMapper objectMapper;

    public CompositionViewService(LandscapeProperties properties, ObjectMapper objectMapper) {
        this.properties = properties;
        this.objectMapper = objectMapper;
    }

    public Map<String, Object> findMatchingView(String landscapeId, Map<String, String> requestedScope) {
        if (!StringUtils.hasText(landscapeId)) {
            return null;
        }

        Path baseDir = Path.of(properties.getDirectory()).resolve(COMPOSITION_VIEW_ROOT);
        if (!Files.isDirectory(baseDir)) {
            return null;
        }

        Map<String, String> normalizedRequestedScope = normalizeScope(requestedScope);

        try (Stream<Path> stream = Files.walk(baseDir)) {
            return stream
                    .filter(Files::isRegularFile)
                    .filter(path -> path.getFileName().toString().endsWith(".view.json"))
                    .map(this::readViewFile)
                    .filter(Objects::nonNull)
                    .filter(view -> normalizeValue(asString(view.get("landscapeId")))
                            .equals(normalizeValue(landscapeId)))
                    .filter(view -> scopeMatches(normalizeScope(asMap(view.get("scope"))), normalizedRequestedScope))
                    .sorted(Comparator
                            .<Map<String, Object>>comparingInt(view -> normalizeScope(asMap(view.get("scope"))).size())
                            .reversed()
                            .thenComparing(view -> asString(view.get("viewId"))))
                    .findFirst()
                    .map(view -> Collections.unmodifiableMap(new LinkedHashMap<>(view)))
                    .orElse(null);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to load composition views from " + baseDir, e);
        }
    }

    private Map<String, Object> readViewFile(Path path) {
        try {
            return objectMapper.readValue(path.toFile(), MAP_TYPE);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to parse composition view " + path, e);
        }
    }

    private static Map<String, Object> asMap(Object value) {
        if (value instanceof Map<?, ?> map) {
            Map<String, Object> normalized = new LinkedHashMap<>();
            map.forEach((key, entry) -> {
                if (key instanceof String stringKey) {
                    normalized.put(stringKey, entry);
                }
            });
            return normalized;
        }
        return Collections.emptyMap();
    }

    private static String asString(Object value) {
        return value instanceof String text ? text : "";
    }

    private static String normalizeValue(String value) {
        return StringUtils.hasText(value)
                ? value.trim().toUpperCase(Locale.ROOT)
                : "";
    }

    private static Map<String, String> normalizeScope(Map<String, ?> rawScope) {
        Map<String, String> normalized = new LinkedHashMap<>();
        rawScope.forEach((key, value) -> {
            if (!(value instanceof String text) || !StringUtils.hasText(text)) {
                return;
            }
            normalized.put(key, text.trim());
        });
        return normalized;
    }

    private static boolean scopeMatches(Map<String, String> viewScope, Map<String, String> requestedScope) {
        if (viewScope.isEmpty()) {
            return requestedScope.isEmpty();
        }

        for (Map.Entry<String, String> entry : viewScope.entrySet()) {
            String requestedValue = requestedScope.get(entry.getKey());
            if (!StringUtils.hasText(requestedValue)) {
                return false;
            }
            if (!normalizeValue(requestedValue).equals(normalizeValue(entry.getValue()))) {
                return false;
            }
        }

        return true;
    }
}
