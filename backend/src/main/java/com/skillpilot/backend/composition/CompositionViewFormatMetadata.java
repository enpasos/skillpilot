package com.skillpilot.backend.composition;

import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.ArrayList;
import java.util.HashMap;

/** Keeps source and package component bindings distinct during profile merges. */
public final class CompositionViewFormatMetadata {
    private static final String SOURCE_SCHEMA = "https://skillpilot.com/schemas/composition-view/v1.2/composition-view.schema.json";
    private static final String RUNTIME_SCHEMA = "https://skillpilot.com/schemas/curriculum-package/v1.3/runtime-composition-view.schema.json";
    private static final String VOLUNTARY_SOURCE_SCHEMA = "https://skillpilot.com/schemas/composition-view/v1.3/composition-view.schema.json";
    private static final String VOLUNTARY_RUNTIME_SCHEMA = "https://skillpilot.com/schemas/curriculum-package/v1.4/runtime-composition-view.schema.json";

    private CompositionViewFormatMetadata() { }

    public static Map<String, Object> mergeSourceViews(List<Map<String, Object>> views) {
        return merge(views, SOURCE_SCHEMA);
    }

    public static Map<String, Object> mergeRuntimeViews(List<Map<String, Object>> views) {
        return merge(views, RUNTIME_SCHEMA);
    }

    public static void validateSourceView(Map<String, Object> view) {
        mergeSourceViews(List.of(view));
    }

    public static void validateSourceView(Map<String, Object> view, Map<String, List<String>> children) {
        validateSourceView(view);
        if (supportsVoluntary(view)) validatePlaces(view.get("rootNodes"), children, new HashMap<>(), new HashMap<>(), new HashMap<>(), 0);
    }

    public static void validateRuntimeView(Map<String, Object> view) {
        mergeRuntimeViews(List.of(view));
    }

    public static boolean supportsVoluntary(Map<String, Object> view) {
        return "1.3".equals(view.get("viewFormatVersion"));
    }

    public static boolean hasVoluntaryGoalEntries(Map<String, Object> view) {
        return hasVoluntaryGoalEntries(view.get("rootNodes"));
    }

    private static boolean hasVoluntaryGoalEntries(Object raw) {
        if (!(raw instanceof List<?> nodes)) return false;
        for (Object entry : nodes) {
            if (!(entry instanceof Map<?, ?> node)) continue;
            if ("goalEntry".equals(node.get("kind")) && "voluntary".equals(node.get("projectionRole"))) return true;
            if (hasVoluntaryGoalEntries(node.get("children"))) return true;
        }
        return false;
    }

    private static Map<String, Object> merge(List<Map<String, Object>> views, String schema) {
        if (views.isEmpty()) throw new IllegalStateException("No composition view format sources");
        Set<String> versions = new LinkedHashSet<>();
        for (Map<String, Object> view : views) {
            Object raw = view.get("viewFormatVersion");
            String version = raw == null && !view.containsKey("viewFormatVersion") ? "1.0" : raw instanceof String text ? text : "";
            if (!Set.of("1.0", "1.1", "1.2", "1.3").contains(version)) {
                throw new IllegalStateException("Unsupported merged composition view format: " + raw);
            }
            versions.add(version);
            if ((VOLUNTARY_SOURCE_SCHEMA.equals(view.get("$schema")) || VOLUNTARY_RUNTIME_SCHEMA.equals(view.get("$schema")))
                    && !"1.3".equals(version)) {
                throw new IllegalStateException("Invalid composition view format 1.3 schema binding");
            }
            if (Set.of("1.2", "1.3").contains(version)) {
                String expectedSchema = "1.3".equals(version)
                        ? SOURCE_SCHEMA.equals(schema) ? VOLUNTARY_SOURCE_SCHEMA : VOLUNTARY_RUNTIME_SCHEMA
                        : schema;
                if (!expectedSchema.equals(view.get("$schema"))) {
                    throw new IllegalStateException("Invalid composition view " + version + " schema binding");
                }
                if (!(view.get("language") instanceof String language)
                        || language.length() > 64 || !language.matches("[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*")) {
                    throw new IllegalStateException("Invalid composition view " + version + " language");
                }
            }
            validateRoles(view.get("rootNodes"), "1.3".equals(version));
        }
        if (versions.size() != 1) {
            throw new IllegalStateException("Conflicting composition view format versions while merging");
        }
        Map<String, Object> metadata = new LinkedHashMap<>();
        for (String field : List.of("viewFormatVersion", "$schema", "language")) {
            List<Object> values = views.stream().map(view -> view.get(field)).filter(Objects::nonNull).distinct().toList();
            if (values.size() > 1) throw new IllegalStateException("Conflicting composition view format metadata: " + field);
            if (!values.isEmpty()) metadata.put(field, values.getFirst());
        }
        return Map.copyOf(metadata);
    }

    private static void validateRoles(Object raw, boolean voluntarySupported) {
        if (!(raw instanceof List<?> nodes)) return;
        for (Object entry : nodes) {
            if (!(entry instanceof Map<?, ?> node)) continue;
            if (node.containsKey("projectionRole")) {
                if (!Set.of("goalEntry", "canonicalSubtree").contains(node.get("kind"))) {
                    throw new IllegalStateException("projectionRole is only supported on canonicalSubtree and goalEntry nodes");
                }
                Object role = node.get("projectionRole");
                if (!Set.of("target", "prerequisiteOnly", "voluntary").contains(role == null ? "" : role)) {
                    throw new IllegalStateException("Unsupported projectionRole in composition view: " + role);
                }
                if ("voluntary".equals(role) && (!voluntarySupported || !"goalEntry".equals(node.get("kind")))) {
                    throw new IllegalStateException("Voluntary projectionRole requires a goalEntry in view format 1.3");
                }
            }
            if ("voluntary".equals(node.get("projectionRole")) && node.containsKey("acquisitionPlacement")) {
                throw new IllegalStateException("Voluntary entry cannot carry acquisitionPlacement");
            }
            validateRoles(node.get("children"), voluntarySupported);
        }
    }

    private static void validatePlaces(Object raw, Map<String, List<String>> children,
            Map<String, Set<String>> roles, Map<String, Integer> places, Map<String, String> directRoles, int depth) {
        if (!(raw instanceof List<?> nodes)) return;
        for (Object entry : nodes) {
            if (!(entry instanceof Map<?, ?> node)) continue;
            if ("structure".equals(node.get("kind"))) {
                validatePlaces(node.get("children"), children, roles, places, directRoles, depth + 1);
                continue;
            }
            if (!Set.of("goalEntry", "canonicalSubtree").contains(node.get("kind"))) continue;
            String reference = String.valueOf(node.get("goalId"));
            String id = reference.substring(reference.indexOf(':') + 1);
            String role = node.containsKey("projectionRole") ? String.valueOf(node.get("projectionRole")) : "target";
            if ("voluntary".equals(role) && children != null && !children.getOrDefault(id, List.of()).isEmpty()) {
                throw new IllegalStateException("Voluntary entry must reference one canonical atom: " + id);
            }
            if (node.containsKey("acquisitionPlacement") && (!Boolean.TRUE.equals(node.get("acquisitionPlacement"))
                    || depth == 0
                    || !"prerequisiteOnly".equals(role) || !"goalEntry".equals(node.get("kind"))
                    || children != null && !children.getOrDefault(id, List.of()).isEmpty())) {
                throw new IllegalStateException("Invalid prerequisite acquisitionPlacement: " + id);
            }
            List<String> covered = new ArrayList<>(List.of(id));
            Set<String> seen = new LinkedHashSet<>();
            for (int index = 0; index < covered.size(); index++) {
                String goal = covered.get(index);
                if (!seen.add(goal)) continue;
                if (children != null) covered.addAll(children.getOrDefault(goal, List.of()));
                if (children != null && !children.getOrDefault(goal, List.of()).isEmpty()) continue;
                if ("goalEntry".equals(node.get("kind"))) {
                    String previous = directRoles.putIfAbsent(goal, role);
                    if (previous != null && !previous.equals(role)) throw new IllegalStateException("Conflicting effective projection roles: " + goal);
                }
                Set<String> declared = roles.computeIfAbsent(goal, ignored -> new LinkedHashSet<>());
                declared.add(role);
                if (declared.contains("voluntary") && declared.size() > 1) {
                    throw new IllegalStateException("Conflicting effective projection roles: " + goal);
                }
                if (!"prerequisiteOnly".equals(role)) {
                    if (places.merge(goal, 1, Integer::sum) != 1) {
                        throw new IllegalStateException("Composition view exposes a goal more than once: " + goal);
                    }
                }
            }
        }
    }
}
