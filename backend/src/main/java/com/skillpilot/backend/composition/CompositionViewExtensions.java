package com.skillpilot.backend.composition;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/** Repository-mode election declarations and learner-local composition trees. */
public final class CompositionViewExtensions {
    public static final String HISTORICAL_ASSESSMENT_PLACEMENTS = HistoricalAssessmentPlacements.FIELD;
    public static final String VERSION = "1.3";
    public static final String SCHEMA = "https://skillpilot.com/schemas/composition-view/v1.3/composition-view.schema.json";

    private static final Set<String> RULE_FIELDS = Set.of("text", "textEn", "edition", "location");

    private CompositionViewExtensions() {}

    public record Group(String id, String label, String labelEn, String origin, int minSelections,
            Map<String, String> rule, List<Extension> extensions) {
        public List<Extension> deselectableExtensions() {
            return extensions.stream().filter(extension -> minSelections == 0 || !extension.previouslyRegular())
                    .toList();
        }
    }

    public record Extension(String id, String label, String labelEn, boolean previouslyRegular) {}

    public record Selection(Map<String, Object> view, List<Map<String, Object>> excludedNodes) {}

    public static boolean supports(Map<String, Object> view) {
        return view != null && VERSION.equals(view.get("viewFormatVersion"));
    }

    /** Count repeated placements in an internally merged tree as one extension. */
    public static List<Group> groups(Map<String, Object> view) {
        return groups(view, view != null && view.containsKey("mergedFromViewIds"));
    }

    /** An authored source must place every extension at most once. */
    public static List<Group> sourceGroups(Map<String, Object> view) {
        return groups(view, false);
    }

    private static List<Group> groups(Map<String, Object> view, boolean merged) {
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

        Map<String, Map.Entry<String, Extension>> membership = new LinkedHashMap<>();
        Map<String, List<Extension>> members = new LinkedHashMap<>();
        collect(maps(view.get("rootNodes")), null, groups, membership, members, merged);
        if (view.containsKey(HISTORICAL_ASSESSMENT_PLACEMENTS)) {
            var migration = HistoricalAssessmentPlacements.validate(view);
            var group = groups.get(migration.groupId());
            require(group != null && "skillpilot".equals(group.origin()), "historical assessments need a SkillPilot group");
            var extension = new Extension(migration.id(), migration.label(), migration.labelEn(), true);
            require(membership.putIfAbsent(extension.id(), Map.entry(group.id(), extension)) == null,
                    "duplicate extension " + extension.id());
            members.computeIfAbsent(group.id(), ignored -> new ArrayList<>()).add(extension);
        }
        return groups.values().stream().map(group -> {
            List<Extension> extensions = members.getOrDefault(group.id(), List.of());
            require(extensions.stream().filter(Extension::previouslyRegular).count() >= group.minSelections(),
                    "previously regular extensions do not satisfy minimum for group " + group.id());
            return new Group(group.id(), group.label(), group.labelEn(), group.origin(), group.minSelections(),
                    group.rule(), List.copyOf(extensions));
        }).toList();
    }

    private static void collect(List<Map<String, Object>> nodes, String containingExtension,
            Map<String, Group> groups, Map<String, Map.Entry<String, Extension>> membership,
            Map<String, List<Extension>> members, boolean merged) {
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
                Object previous = extension.get("previouslyRegular");
                require(previous instanceof Boolean, "missing previouslyRegular for " + extensionId);
                var definition = new Extension(extensionId, field(node, "label"), field(node, "labelEn"),
                        (boolean) previous);
                var member = Map.entry(groupId, definition);
                var existing = membership.putIfAbsent(extensionId, member);
                if (existing == null) {
                    members.computeIfAbsent(groupId, ignored -> new ArrayList<>()).add(definition);
                } else {
                    require(merged, "duplicate extension " + extensionId);
                    require(existing.equals(member), "conflicting extension " + extensionId);
                }
            }
            if (structure) collect(maps(node.get("children")), extensionId, groups, membership, members, merged);
        }
    }

    /** Group and extension declarations remain authoritative across profile variants. */
    public static List<Map<String, Object>> mergeGroups(List<Map<String, Object>> views) {
        Map<String, Map<String, Object>> declarations = new LinkedHashMap<>();
        Map<String, Map.Entry<String, Extension>> members = new LinkedHashMap<>();
        for (var view : views) {
            for (var group : sourceGroups(view)) {
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

    public static void validateStoredSelection(Object value) {
        if ("maximum".equals(value) || value instanceof List<?> list && list.isEmpty()) return;
        throw new IllegalArgumentException("extensionSelection must be an empty array or maximum");
    }

    public static Selection select(Map<String, Object> view, Object rawSelection) {
        if (rawSelection != null) validateStoredSelection(rawSelection);
        if (!supports(view)) return new Selection(view, List.of());
        boolean maximum = "maximum".equals(rawSelection);
        boolean legacy = rawSelection == null;
        boolean migrateAssessments = !legacy && view.containsKey(HISTORICAL_ASSESSMENT_PLACEMENTS);
        if (maximum && !migrateAssessments) return new Selection(view, List.of());
        Set<String> requiredGroups = new HashSet<>();
        for (var group : maps(view.get("electionGroups"))) {
            if ((int) group.get("minSelections") > 0) requiredGroups.add((String) group.get("id"));
        }
        List<Map<String, Object>> excluded = new ArrayList<>();
        var roots = prune(maps(view.get("rootNodes")), null, legacy, maximum, migrateAssessments,
                requiredGroups, excluded);
        if (excluded.isEmpty()) return new Selection(view, List.of());
        var copy = new LinkedHashMap<>(view);
        copy.put("rootNodes", CourseProfileCompositionViewMerger.freeze(roots));
        return new Selection(Collections.unmodifiableMap(copy), List.copyOf(excluded));
    }

    private static List<Map<String, Object>> prune(List<Map<String, Object>> nodes, String parent,
            boolean legacy, boolean maximum, boolean migrateAssessments, Set<String> requiredGroups,
            List<Map<String, Object>> excluded) {
        var remaining = new ArrayList<Map<String, Object>>();
        for (var node : nodes) {
            if (!maximum && node.get("extension") instanceof Map<?, ?> extension
                    && !(Boolean.TRUE.equals(extension.get("previouslyRegular"))
                            && (legacy || requiredGroups.contains(extension.get("groupId"))))) {
                excluded.add(node);
                continue;
            }
            if (!"structure".equals(node.get("kind"))) {
                if (migrateAssessments && HistoricalAssessmentPlacements.exclude(parent, node.get("goalId"), maximum)) {
                    excluded.add(node);
                } else {
                    remaining.add(node);
                }
                continue;
            }
            var originalChildren = maps(node.get("children"));
            var children = prune(originalChildren, (String) node.get("id"), legacy, maximum, migrateAssessments,
                    requiredGroups, excluded);
            if (!children.isEmpty() || originalChildren.isEmpty()) {
                var copy = new LinkedHashMap<>(node);
                copy.put("children", children);
                remaining.add(copy);
            }
        }
        return remaining;
    }

    @SuppressWarnings("unchecked")
    static Map<String, Object> map(Object value) {
        require(value instanceof Map<?, ?>, "expected object");
        return (Map<String, Object>) value;
    }

    static List<Map<String, Object>> maps(Object value) {
        require(value instanceof List<?>, "expected list");
        return ((List<?>) value).stream().map(CompositionViewExtensions::map).toList();
    }

    static String field(Map<String, Object> object, String field) {
        Object value = object.get(field);
        require(value instanceof String text && !text.isBlank() && text.equals(text.trim()), "invalid " + field);
        return (String) value;
    }

    static String identifier(Map<String, Object> object, String key) {
        String value = field(object, key);
        require(value.matches("[A-Za-z0-9][A-Za-z0-9._:+-]*"), "invalid identifier " + value);
        return value;
    }

    private static void require(boolean condition, String message) {
        if (!condition) throw new IllegalStateException("Composition view extensions: " + message);
    }
}
