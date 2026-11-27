package com.skillpilot.backend.composition;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/** Repository-mode election declarations and learner-local composition trees. */
public final class CompositionViewExtensions {
    public static final String VERSION = "1.3";
    public static final String SCHEMA = "https://skillpilot.com/schemas/composition-view/v1.3/composition-view.schema.json";

    private static final Set<String> RULE_FIELDS = Set.of("text", "textEn", "edition", "location");

    private CompositionViewExtensions() {}

    public record Group(String id, String label, String labelEn, String origin, int minSelections,
            Map<String, String> rule, List<Extension> extensions) {}

    public record Extension(String id, String label, String labelEn, boolean previouslyRegular) {}

    public record Selection(Map<String, Object> view, List<Map<String, Object>> excludedNodes) {}

    public static boolean supports(Map<String, Object> view) {
        return view != null && VERSION.equals(view.get("viewFormatVersion"));
    }

    /** Validate repository declarations before indexing; consumers share the same normalized metadata. */
    public static List<Group> groups(Map<String, Object> view) {
        if (!supports(view)) return List.of();
        require(SCHEMA.equals(view.get("$schema")), "invalid 1.3 schema binding");
        require(field(view, "language").matches("[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*"), "invalid language");
        Map<String, Group> groups = new LinkedHashMap<>();
        for (Map<String, Object> raw : maps(view.get("electionGroups"))) {
            var groupFields = new HashSet<>(raw.keySet());
            groupFields.remove("rule");
            require(groupFields.equals(Set.of("id", "label", "labelEn", "origin", "minSelections")), "invalid group fields");
            String id = identifier(raw, "id");
            String origin = field(raw, "origin");
            Object rawMin = raw.get("minSelections");
            require(rawMin instanceof Integer minimum && minimum >= 0, "invalid minimum for group " + id);
            int minimum = (int) rawMin;
            require("official".equals(origin) || "skillpilot".equals(origin), "invalid origin for group " + id);
            require(!"skillpilot".equals(origin) || minimum == 0, "own group minimum must be zero: " + id);
            Map<String, String> rule = new LinkedHashMap<>();
            if ("official".equals(origin) || raw.containsKey("rule")) {
                Map<String, Object> source = map(raw.get("rule"));
                require(source.keySet().equals(RULE_FIELDS), "invalid rule for group " + id);
                RULE_FIELDS.forEach(key -> rule.put(key, field(source, key)));
            }
            Group group = new Group(id, field(raw, "label"), field(raw, "labelEn"), origin, minimum,
                    Map.copyOf(rule), List.of());
            require(groups.putIfAbsent(id, group) == null, "duplicate group " + id);
        }

        Map<String, String> membership = new LinkedHashMap<>();
        Map<String, List<Extension>> members = new LinkedHashMap<>();
        collect(maps(view.get("rootNodes")), null, groups, membership, members);
        return groups.values().stream().map(group -> {
            List<Extension> extensions = members.getOrDefault(group.id(), List.of());
            require(extensions.size() >= group.minSelections(), "unfulfillable minimum for group " + group.id());
            return new Group(group.id(), group.label(), group.labelEn(), group.origin(), group.minSelections(),
                    group.rule(), List.copyOf(extensions));
        }).toList();
    }

    private static void collect(List<Map<String, Object>> nodes, String containingExtension,
            Map<String, Group> groups, Map<String, String> membership, Map<String, List<Extension>> members) {
        for (var node : nodes) {
            boolean structure = "structure".equals(node.get("kind"));
            if (node.containsKey("projectionRole")) {
                Object role = node.get("projectionRole");
                require(("goalEntry".equals(node.get("kind")) || "canonicalSubtree".equals(node.get("kind")))
                                && ("target".equals(role) || "prerequisiteOnly".equals(role)),
                        "invalid projectionRole " + role);
            }
            String extensionId = containingExtension;
            if (node.containsKey("extension")) {
                require(structure && containingExtension == null, "extension must be a non-nested structure");
                var extension = map(node.get("extension"));
                require(extension.keySet().equals(Set.of("id", "groupId", "previouslyRegular")),
                        "invalid extension fields");
                extensionId = identifier(extension, "id");
                String groupId = identifier(extension, "groupId");
                require(groups.containsKey(groupId), "unknown group " + groupId);
                require(membership.putIfAbsent(extensionId, groupId) == null,
                        "duplicate extension " + extensionId);
                Object previous = extension.get("previouslyRegular");
                require(previous instanceof Boolean, "missing previouslyRegular for " + extensionId);
                members.computeIfAbsent(groupId, ignored -> new ArrayList<>()).add(new Extension(
                        extensionId, field(node, "label"), field(node, "labelEn"), (boolean) previous));
            }
            if (structure) collect(maps(node.get("children")), extensionId, groups, membership, members);
        }
    }

    /** Group and extension declarations remain authoritative across profile variants. */
    public static List<Map<String, Object>> mergeGroups(List<Map<String, Object>> views) {
        Map<String, Map<String, Object>> declarations = new LinkedHashMap<>();
        Map<String, Map.Entry<String, Extension>> members = new LinkedHashMap<>();
        for (var view : views) {
            for (var group : groups(view)) {
                var raw = new LinkedHashMap<String, Object>();
                raw.put("id", group.id());
                raw.put("label", group.label());
                raw.put("labelEn", group.labelEn());
                raw.put("origin", group.origin());
                raw.put("minSelections", group.minSelections());
                if (!group.rule().isEmpty()) raw.put("rule", group.rule());
                var existing = declarations.putIfAbsent(group.id(), Collections.unmodifiableMap(raw));
                require(existing == null || existing.equals(raw), "conflicting group " + group.id());
                for (var extension : group.extensions()) {
                    var member = Map.entry(group.id(), extension);
                    var previous = members.putIfAbsent(extension.id(), member);
                    require(previous == null || previous.equals(member), "conflicting extension " + extension.id());
                }
            }
        }
        return List.copyOf(declarations.values());
    }

    public static Selection select(Map<String, Object> view, Object rawSelection) {
        if (!supports(view)) return new Selection(view, List.of());
        if ("maximum".equals(rawSelection)) return new Selection(view, List.of());
        Set<String> selected = new HashSet<>();
        if (rawSelection != null) {
            require(rawSelection instanceof List<?>, "extensionSelection must be an ID list or maximum");
            for (Object value : (List<?>) rawSelection) {
                require(value instanceof String id && !id.isBlank() && id.equals(id.trim()) && selected.add(id),
                        "invalid or duplicate extensionSelection ID");
            }
        }
        List<Map<String, Object>> excluded = new ArrayList<>();
        var roots = prune(maps(view.get("rootNodes")), rawSelection == null, selected, excluded);
        if (excluded.isEmpty()) return new Selection(view, List.of());
        var copy = new LinkedHashMap<>(view);
        copy.put("rootNodes", CourseProfileCompositionViewMerger.freeze(roots));
        return new Selection(Collections.unmodifiableMap(copy), List.copyOf(excluded));
    }

    private static List<Map<String, Object>> prune(List<Map<String, Object>> nodes, boolean legacy,
            Set<String> selected, List<Map<String, Object>> excluded) {
        var remaining = new ArrayList<Map<String, Object>>();
        for (var node : nodes) {
            if (node.get("extension") instanceof Map<?, ?> extension
                    && !(legacy ? Boolean.TRUE.equals(extension.get("previouslyRegular")) : selected.contains(extension.get("id")))) {
                excluded.add(node);
                continue;
            }
            if (!"structure".equals(node.get("kind"))) {
                remaining.add(node);
                continue;
            }
            var children = prune(maps(node.get("children")), legacy, selected, excluded);
            if (!children.isEmpty()) {
                var copy = new LinkedHashMap<>(node);
                copy.put("children", children);
                remaining.add(copy);
            }
        }
        return remaining;
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> map(Object value) {
        require(value instanceof Map<?, ?>, "expected object");
        return (Map<String, Object>) value;
    }

    private static List<Map<String, Object>> maps(Object value) {
        require(value instanceof List<?>, "expected list");
        return ((List<?>) value).stream().map(CompositionViewExtensions::map).toList();
    }

    private static String field(Map<String, Object> object, String field) {
        Object value = object.get(field);
        require(value instanceof String text && !text.isBlank() && text.equals(text.trim()), "invalid " + field);
        return (String) value;
    }

    private static String identifier(Map<String, Object> object, String key) {
        String value = field(object, key);
        require(value.matches("[A-Za-z0-9][A-Za-z0-9._:+-]*"), "invalid identifier " + value);
        return value;
    }

    private static void require(boolean condition, String message) {
        if (!condition) throw new IllegalStateException("Composition view extensions: " + message);
    }
}
