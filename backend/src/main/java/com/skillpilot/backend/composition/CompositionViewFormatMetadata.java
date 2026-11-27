package com.skillpilot.backend.composition;

import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

/** Keeps source and package component bindings distinct during profile merges. */
public final class CompositionViewFormatMetadata {
    private static final String SOURCE_SCHEMA = "https://skillpilot.com/schemas/composition-view/v1.2/composition-view.schema.json";
    private static final String RUNTIME_SCHEMA = "https://skillpilot.com/schemas/curriculum-package/v1.3/runtime-composition-view.schema.json";

    private CompositionViewFormatMetadata() { }

    public static Map<String, Object> mergeSourceViews(List<Map<String, Object>> views) {
        return merge(views, SOURCE_SCHEMA, true);
    }

    public static Map<String, Object> mergeRuntimeViews(List<Map<String, Object>> views) {
        return merge(views, RUNTIME_SCHEMA, false);
    }

    private static Map<String, Object> merge(List<Map<String, Object>> views, String schema, boolean repository) {
        if (views.isEmpty()) throw new IllegalStateException("No composition view format sources");
        Set<String> versions = new LinkedHashSet<>();
        for (Map<String, Object> view : views) {
            Object raw = view.get("viewFormatVersion");
            String version = raw == null ? "1.0" : raw instanceof String text ? text : "";
            boolean extensionFormat = repository && CompositionViewExtensions.VERSION.equals(version);
            if (!extensionFormat && !Set.of("1.0", "1.1", "1.2").contains(version)) {
                throw new IllegalStateException("Unsupported merged composition view format: " + raw);
            }
            versions.add(version);
            if ("1.2".equals(version) || extensionFormat) {
                String requiredSchema = extensionFormat ? CompositionViewExtensions.SCHEMA : schema;
                if (!requiredSchema.equals(view.get("$schema"))) {
                    throw new IllegalStateException("Invalid composition view " + version + " schema binding");
                }
                if (!(view.get("language") instanceof String language)
                        || language.length() > 64 || !language.matches("[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*")) {
                    throw new IllegalStateException("Invalid composition view " + version + " language");
                }
            }
        }
        boolean mixedRepositoryExtension = repository && versions.equals(Set.of("1.2", CompositionViewExtensions.VERSION));
        if (versions.size() != 1 && !mixedRepositoryExtension) {
            throw new IllegalStateException("Conflicting composition view format versions while merging");
        }
        Map<String, Object> metadata = new LinkedHashMap<>();
        for (String field : List.of("viewFormatVersion", "$schema", "language")) {
            List<Object> values = views.stream()
                    .filter(view -> !mixedRepositoryExtension || "language".equals(field)
                            || CompositionViewExtensions.supports(view))
                    .map(view -> view.get(field)).filter(Objects::nonNull).distinct().toList();
            if (values.size() > 1) throw new IllegalStateException("Conflicting composition view format metadata: " + field);
            if (!values.isEmpty()) metadata.put(field, values.getFirst());
        }
        return Map.copyOf(metadata);
    }
}
