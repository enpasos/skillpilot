package com.skillpilot.backend.composition;

import java.util.ArrayList;
import java.util.Collections;
import java.util.IdentityHashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.HashMap;
import java.util.HashSet;
import java.util.ArrayDeque;
import java.util.function.BiFunction;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Merges the learner-facing trees of a combined GK + LK course-profile scope.
 *
 * <p>The ordinary composition merge deliberately identifies structure nodes only by their authored
 * identity. A combined course-profile scope has one narrow exception: profile-equivalent wrappers
 * such as {@code sek2-gk} and {@code sek2-lk} describe the same learner-facing position and must be
 * folded into one neutral wrapper. Goal references are de-duplicated across the resulting tree and
 * {@code target} dominates {@code prerequisiteOnly}.
 */
public final class CourseProfileCompositionViewMerger {

    private static final Pattern ID_PROFILE_TOKEN = Pattern.compile(
            "(?i)(^|[-_.:])(gk|lk|grundkurs|leistungskurs)(?=$|[-_.:])");
    private static final Pattern LABEL_SHORT_PROFILE_TOKEN = Pattern.compile("(?iu)\\b(?:GK|LK)\\b");
    private static final Pattern LABEL_LONG_PROFILE_TOKEN =
            Pattern.compile("(?iu)\\b(?:Grundkurs|Leistungskurs)\\b");

    private CourseProfileCompositionViewMerger() {
    }

    /**
     * Merges complete course-profile views, preserving the union of their
     * independently resolved targets. Specificity is local to a source view:
     * a direct GK exclusion must not override an inherited LK target.
     *
     * <p>Only redundant prerequisite-only references are removed, and only
     * after resolving the actual canonical graph proves that doing so adds
     * intended targets without introducing any other target. No goal, parent,
     * or authored structure identity is invented. Conflicts that cannot be
     * represented by that lossless merge fail closed.</p>
     */
    public static List<Map<String, Object>> mergeViews(
            List<List<Map<String, Object>>> sourceRoots,
            Map<String, List<String>> canonicalChildren) {
        return mergeViews(sourceRoots, canonicalChildren, false);
    }

    public static List<Map<String, Object>> mergeViews(
            List<List<Map<String, Object>>> sourceRoots,
            Map<String, List<String>> canonicalChildren,
            boolean removeRedundantSubtrees) {
        if (sourceRoots == null || canonicalChildren == null) {
            throw new IllegalArgumentException("Source views and canonical graph are required");
        }
        ProjectionGraph graph = new ProjectionGraph(canonicalChildren);
        Set<String> expectedTargets = new LinkedHashSet<>();
        for (List<Map<String, Object>> source : sourceRoots) {
            expectedTargets.addAll(graph.targets(source));
        }
        List<Map<String, Object>> merged = mergeSiblings(
                sourceRoots.stream().flatMap(List::stream).toList(), new MergeState());
        merged = preserveCommonExclusions(merged, expectedTargets, graph);
        Set<String> actualTargets = graph.targets(merged);
        boolean changed;
        do {
            changed = false;
            List<Map<String, Object>> exclusions = new ArrayList<>();
            collectExclusions(merged, exclusions);
            for (Map<String, Object> exclusion : exclusions) {
                List<Map<String, Object>> candidate = withoutNode(merged, exclusion);
                Set<String> candidateTargets = graph.targets(candidate);
                if (candidateTargets.size() > actualTargets.size()
                        && candidateTargets.containsAll(actualTargets)
                        && expectedTargets.containsAll(candidateTargets)) {
                    merged = candidate;
                    actualTargets = candidateTargets;
                    changed = true;
                    break;
                }
            }
        } while (changed && !actualTargets.equals(expectedTargets));
        if (!actualTargets.equals(expectedTargets)) {
            Set<String> missing = new LinkedHashSet<>(expectedTargets);
            missing.removeAll(actualTargets);
            Set<String> added = new LinkedHashSet<>(actualTargets);
            added.removeAll(expectedTargets);
            throw new IllegalStateException("Course-profile merge cannot preserve resolved target union; missing="
                    + missing + ", added=" + added);
        }
        List<Map<String, Object>> result = removeRedundantSubtrees
                ? removeRedundantNestedReferences(merged,
                        (kind, id) -> "canonicalSubtree".equals(kind)
                                ? graph.descendants(id) : Set.of(ProjectionGraph.localId(id)))
                : merged;
        if (!graph.targets(result).equals(expectedTargets)) {
            throw new IllegalStateException("Subtree deduplication changes resolved course-profile target union");
        }
        return freeze(result);
    }

    private static List<Map<String, Object>> preserveCommonExclusions(
            List<Map<String, Object>> nodes, Set<String> expectedTargets, ProjectionGraph graph) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Map<String, Object> node : nodes) {
            Map<String, Object> copy = new LinkedHashMap<>(node);
            String kind = text(node.get("kind"));
            if ("structure".equals(kind)) {
                copy.put("children", preserveCommonExclusions(nodeMaps(node.get("children")), expectedTargets, graph));
            } else if (supportsProjectionRole(kind) && isTarget(node)) {
                Set<String> covered = "canonicalSubtree".equals(kind)
                        ? graph.descendants(text(node.get("goalId")))
                        : Set.of(ProjectionGraph.localId(text(node.get("goalId"))));
                if (Collections.disjoint(covered, expectedTargets)) {
                    // Same-view direct exclusions can otherwise be lost when
                    // the structural merge coalesces them with subtree refs.
                    copy.put("projectionRole", "prerequisiteOnly");
                }
            }
            result.add(copy);
        }
        return result;
    }

    private static void collectExclusions(
            List<Map<String, Object>> nodes, List<Map<String, Object>> exclusions) {
        for (Map<String, Object> node : nodes) {
            if ("structure".equals(node.get("kind"))) {
                collectExclusions(nodeMaps(node.get("children")), exclusions);
            } else if (supportsProjectionRole(text(node.get("kind"))) && !isTarget(node)) {
                exclusions.add(node);
            }
        }
    }

    private static List<Map<String, Object>> withoutNode(
            List<Map<String, Object>> nodes, Map<String, Object> excluded) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Map<String, Object> node : nodes) {
            if (node.equals(excluded)) continue;
            if ("structure".equals(node.get("kind"))) {
                Map<String, Object> copy = new LinkedHashMap<>(node);
                copy.put("children", withoutNode(nodeMaps(node.get("children")), excluded));
                result.add(copy);
            } else {
                result.add(node);
            }
        }
        return result;
    }

    private record RoleAssignment(boolean target, boolean direct, int distance) {
        private RoleAssignment combine(RoleAssignment other) {
            if (direct != other.direct) return other.direct ? other : this;
            if (!direct && distance != other.distance) return other.distance < distance ? other : this;
            return new RoleAssignment(target || other.target, direct, Math.min(distance, other.distance));
        }
    }

    private static final class ProjectionGraph {
        private final Map<String, List<String>> children;
        private final Set<String> validated = new HashSet<>();
        private final Map<String, Map<String, Integer>> distances = new HashMap<>();

        private ProjectionGraph(Map<String, List<String>> children) {
            this.children = children;
            for (String id : children.keySet()) validateDag(id, new HashSet<>());
        }

        private void validateDag(String id, Set<String> visiting) {
            if (validated.contains(id)) return;
            if (!visiting.add(id)) throw new IllegalStateException("Canonical contains cycle at " + id);
            for (String child : children.getOrDefault(id, List.of())) {
                if (children.containsKey(localId(child))) validateDag(localId(child), visiting);
            }
            visiting.remove(id);
            validated.add(id);
        }

        private Set<String> descendants(String reference) {
            return distances(reference).keySet();
        }

        private Map<String, Integer> distances(String reference) {
            String id = localId(reference);
            if (!children.containsKey(id)) {
                throw new IllegalStateException("Unknown canonical goal in course-profile merge: " + reference);
            }
            Map<String, Integer> cached = distances.get(id);
            if (cached != null) return cached;
            Map<String, Integer> result = new LinkedHashMap<>();
            ArrayDeque<String> queue = new ArrayDeque<>();
            result.put(id, 0);
            queue.add(id);
            while (!queue.isEmpty()) {
                String current = queue.removeFirst();
                for (String childRef : children.get(current)) {
                    String child = localId(childRef);
                    if (!children.containsKey(child)) {
                        throw new IllegalStateException("Unknown canonical goal in course-profile merge: " + childRef);
                    }
                    if (!result.containsKey(child)) {
                        result.put(child, result.get(current) + 1);
                        queue.addLast(child);
                    }
                }
            }
            distances.put(id, result);
            return result;
        }

        private Set<String> targets(List<Map<String, Object>> nodes) {
            Map<String, RoleAssignment> assignments = new LinkedHashMap<>();
            assign(nodes, assignments);
            Set<String> result = new LinkedHashSet<>();
            assignments.forEach((id, role) -> { if (role.target()) result.add(id); });
            return result;
        }

        private void assign(List<Map<String, Object>> nodes, Map<String, RoleAssignment> assignments) {
            for (Map<String, Object> node : nodes) {
                String kind = text(node.get("kind"));
                if ("structure".equals(kind)) {
                    assign(nodeMaps(node.get("children")), assignments);
                } else if (supportsProjectionRole(kind)) {
                    String id = localId(text(node.get("goalId")));
                    boolean direct = "goalEntry".equals(kind);
                    // Resolve even direct references, so missing graph data never
                    // silently authorizes a role change.
                    Set<String> covered = direct ? Set.of(id) : descendants(id);
                    if (!children.containsKey(id)) {
                        throw new IllegalStateException("Unknown canonical goal in course-profile merge: " + id);
                    }
                    covered.forEach(goalId -> assignments.merge(goalId,
                            new RoleAssignment(isTarget(node), direct, direct ? 0 : distances(id).get(goalId)),
                            RoleAssignment::combine));
                } else if ("landscapeEntry".equals(kind)) {
                    throw new IllegalStateException("Course-profile merge requires explicit canonical goal references");
                }
            }
        }

        private static String localId(String ref) {
            int separator = ref.indexOf(':');
            return separator >= 0 ? ref.substring(separator + 1) : ref;
        }
    }

    public static List<Map<String, Object>> merge(List<Map<String, Object>> nodes) {
        return freeze(mergeSiblings(nodes, new MergeState()));
    }

    /**
     * Merges course-profile views with canonical subtree awareness.
     *
     * <p>After profile-equivalent wrappers have been folded, a broader sibling canonical subtree
     * may subsume a narrower sibling canonical subtree from the other course profile. When both
     * references have the same projection role and presentation metadata, the narrow subtree is
     * redundant and the broader authored subtree remains. Direct {@code goalEntry} references,
     * references under different parents, partial overlaps, equal-but-differently-rooted subtrees,
     * and presentation conflicts remain fail-closed. Different projection roles remain explicit so
     * the existing specificity rules can resolve them.</p>
     *
     * @param goalCoverageResolver resolves {@code (kind, goalId)} to the exact visible goal IDs of
     *        that reference
     */
    public static List<Map<String, Object>> merge(
            List<Map<String, Object>> nodes,
            BiFunction<String, String, Set<String>> goalCoverageResolver) {
        if (goalCoverageResolver == null) {
            throw new IllegalArgumentException("goalCoverageResolver must not be null");
        }
        List<Map<String, Object>> merged = mergeSiblings(nodes, new MergeState());
        return freeze(removeRedundantNestedReferences(merged, goalCoverageResolver));
    }

    private static List<Map<String, Object>> freeze(List<Map<String, Object>> nodes) {
        return nodes.stream()
                .map(CourseProfileCompositionViewMerger::deepFreeze)
                .toList();
    }

    private static List<Map<String, Object>> removeRedundantNestedReferences(
            List<Map<String, Object>> nodes,
            BiFunction<String, String, Set<String>> goalCoverageResolver) {
        List<GoalReference> references = new ArrayList<>();
        for (Map<String, Object> node : nodes) {
            String kind = text(node.get("kind"));
            if (supportsProjectionRole(kind)) {
                references.add(goalReference(node, goalCoverageResolver));
            }
        }
        Set<Map<String, Object>> redundant = Collections.newSetFromMap(new IdentityHashMap<>());
        for (int leftIndex = 0; leftIndex < references.size(); leftIndex += 1) {
            GoalReference left = references.get(leftIndex);
            for (int rightIndex = leftIndex + 1; rightIndex < references.size(); rightIndex += 1) {
                GoalReference right = references.get(rightIndex);
                if (!left.projectionRole().equals(right.projectionRole())) {
                    continue;
                }
                Set<String> overlap = new LinkedHashSet<>(left.goalIds());
                overlap.retainAll(right.goalIds());
                if (overlap.isEmpty()) {
                    continue;
                }

                boolean leftStrictlyContainsRight = left.goalIds().size() > right.goalIds().size()
                        && left.goalIds().containsAll(right.goalIds());
                boolean rightStrictlyContainsLeft = right.goalIds().size() > left.goalIds().size()
                        && right.goalIds().containsAll(left.goalIds());
                if (!leftStrictlyContainsRight && !rightStrictlyContainsLeft) {
                    throw overlapConflict(left, right);
                }

                GoalReference broader = leftStrictlyContainsRight ? left : right;
                GoalReference narrower = leftStrictlyContainsRight ? right : left;
                if (!"canonicalSubtree".equals(broader.kind())
                        || !"canonicalSubtree".equals(narrower.kind())
                        || !broader.presentationMetadata().equals(narrower.presentationMetadata())) {
                    throw overlapConflict(left, right);
                }
                redundant.add(narrower.node());
            }
        }

        List<Map<String, Object>> retained = new ArrayList<>();
        for (Map<String, Object> node : nodes) {
            if (redundant.contains(node)) {
                continue;
            }
            String kind = text(node.get("kind"));
            if ("structure".equals(kind)) {
                Map<String, Object> copy = new LinkedHashMap<>(node);
                copy.put(
                        "children",
                        List.copyOf(removeRedundantNestedReferences(
                                nodeMaps(node.get("children")), goalCoverageResolver)));
                retained.add(copy);
            } else {
                retained.add(node);
            }
        }
        return retained;
    }

    private static GoalReference goalReference(
            Map<String, Object> node,
            BiFunction<String, String, Set<String>> goalCoverageResolver) {
        String kind = text(node.get("kind"));
        String goalId = text(node.get("goalId"));
        Set<String> resolved = goalCoverageResolver.apply(kind, goalId);
        if (resolved == null || resolved.isEmpty()) {
            throw new IllegalStateException(
                    "Cannot resolve composition-view goal coverage: " + nodeSignature(node));
        }
        return new GoalReference(
                node,
                kind,
                effectiveProjectionRole(node),
                Collections.unmodifiableSet(new LinkedHashSet<>(resolved)),
                presentationMetadata(node));
    }

    private static String effectiveProjectionRole(Map<String, Object> node) {
        return "prerequisiteOnly".equals(node.get("projectionRole"))
                ? "prerequisiteOnly"
                : "target";
    }

    private static Map<String, Object> presentationMetadata(Map<String, Object> node) {
        Map<String, Object> metadata = new LinkedHashMap<>(node);
        metadata.remove("kind");
        metadata.remove("goalId");
        metadata.remove("projectionRole");
        metadata.remove("children");
        return Collections.unmodifiableMap(metadata);
    }

    private static IllegalStateException overlapConflict(GoalReference left, GoalReference right) {
        return new IllegalStateException(
                "Conflicting overlapping goal references while merging composition views: "
                        + nodeSignature(left.node()) + " <> " + nodeSignature(right.node()));
    }

    private static List<Map<String, Object>> mergeSiblings(
            List<Map<String, Object>> nodes,
            MergeState state) {
        List<NodeGroup> groups = new ArrayList<>();
        for (Map<String, Object> node : nodes) {
            NodeGroup group = groups.stream()
                    .filter(candidate -> candidate.accepts(node))
                    .findFirst()
                    .orElseGet(() -> {
                        NodeGroup created = new NodeGroup(node);
                        groups.add(created);
                        return created;
                    });
            group.add(node);
        }

        List<Map<String, Object>> merged = new ArrayList<>();
        for (NodeGroup group : groups) {
            Map<String, Object> node = mergeGroup(group.nodes(), state);
            if (node != null) {
                merged.add(node);
            }
        }
        return merged;
    }

    private static Map<String, Object> mergeGroup(
            List<Map<String, Object>> sources,
            MergeState state) {
        Map<String, Object> merged = new LinkedHashMap<>(preferredSource(sources));
        String kind = text(merged.get("kind"));
        if ("structure".equals(kind)) {
            mergeStructureMetadata(merged, sources);
            List<Map<String, Object>> children = sources.stream()
                    .flatMap(source -> nodeMaps(source.get("children")).stream())
                    .toList();
            merged.put("children", List.copyOf(mergeSiblings(children, state)));
            return merged;
        }

        validateLeafMetadata(sources);
        merged.remove("children");
        applyTargetDominantProjectionRole(merged, sources);
        return state.retainLeaf(merged);
    }

    private static void mergeStructureMetadata(
            Map<String, Object> merged,
            List<Map<String, Object>> sources) {
        Map<String, Object> expected = structureMetadata(sources.getFirst());
        for (Map<String, Object> source : sources) {
            if (!structureMetadata(source).equals(expected)) {
                throw conflict(sources.getFirst());
            }
        }

        List<String> ids = sources.stream().map(source -> text(source.get("id"))).toList();
        if (!allEqual(ids)) {
            if (!allProfileEquivalentIds(ids)) {
                throw conflict(sources.getFirst());
            }
            merged.put("id", combinedId(ids.getFirst()));
        }

        List<String> labels = sources.stream().map(source -> text(source.get("label"))).toList();
        if (!allEqual(labels)) {
            if (allProfileEquivalentLabels(labels)) {
                merged.put("label", combinedLabel(labels.getFirst()));
            } else if (allProfileEquivalentIds(ids) && allChildrenContentEquivalent(sources)) {
                merged.put("label", combinedDivergentLabel(labels));
            } else {
                throw conflict(sources.getFirst());
            }
        }
    }

    private static boolean allChildrenContentEquivalent(List<Map<String, Object>> sources) {
        List<Map<String, Object>> expected = nodeMaps(sources.getFirst().get("children"));
        return sources.stream()
                .skip(1)
                .allMatch(source -> nodeListsContentEquivalent(
                        expected,
                        nodeMaps(source.get("children"))));
    }

    private static boolean nodeListsContentEquivalent(
            List<Map<String, Object>> left,
            List<Map<String, Object>> right) {
        if (left.size() != right.size()) {
            return false;
        }
        for (int index = 0; index < left.size(); index += 1) {
            if (!nodesContentEquivalent(left.get(index), right.get(index))) {
                return false;
            }
        }
        return true;
    }

    private static boolean nodesContentEquivalent(
            Map<String, Object> left,
            Map<String, Object> right) {
        String leftKind = text(left.get("kind"));
        String rightKind = text(right.get("kind"));
        if (supportsProjectionRole(leftKind) && supportsProjectionRole(rightKind)) {
            return leafIdentity(left).equals(leafIdentity(right))
                    && leafMetadata(left).equals(leafMetadata(right));
        }
        if (!"structure".equals(leftKind) || !"structure".equals(rightKind)) {
            return nodeSignature(left).equals(nodeSignature(right))
                    && leafMetadata(left).equals(leafMetadata(right));
        }
        String leftId = text(left.get("id"));
        String rightId = text(right.get("id"));
        boolean exactId = leftId.equals(rightId);
        boolean profileEquivalentId = allProfileEquivalentIds(List.of(leftId, rightId));
        if (!exactId && !profileEquivalentId) {
            return false;
        }
        String leftLabel = text(left.get("label"));
        String rightLabel = text(right.get("label"));
        if (exactId
                && !leftLabel.equals(rightLabel)
                && !allProfileEquivalentLabels(List.of(leftLabel, rightLabel))) {
            return false;
        }
        return structureMetadata(left).equals(structureMetadata(right))
                && nodeListsContentEquivalent(
                        nodeMaps(left.get("children")),
                        nodeMaps(right.get("children")));
    }

    private static void validateLeafMetadata(List<Map<String, Object>> sources) {
        Map<String, Object> expected = leafMetadata(sources.getFirst());
        for (Map<String, Object> source : sources) {
            if (!leafMetadata(source).equals(expected)) {
                throw conflict(sources.getFirst());
            }
        }
    }

    private static Map<String, Object> structureMetadata(Map<String, Object> node) {
        Map<String, Object> metadata = new LinkedHashMap<>(node);
        metadata.remove("children");
        metadata.remove("id");
        metadata.remove("label");
        return metadata;
    }

    private static Map<String, Object> leafMetadata(Map<String, Object> node) {
        Map<String, Object> metadata = new LinkedHashMap<>(node);
        metadata.remove("children");
        if (supportsProjectionRole(text(node.get("kind")))) {
            metadata.remove("kind");
            metadata.remove("projectionRole");
        }
        return metadata;
    }

    private static Map<String, Object> preferredSource(List<Map<String, Object>> sources) {
        return sources.stream()
                .filter(source -> "canonicalSubtree".equals(source.get("kind")))
                .findFirst()
                .orElse(sources.getFirst());
    }

    private static void applyTargetDominantProjectionRole(
            Map<String, Object> merged,
            List<Map<String, Object>> sources) {
        if (!supportsProjectionRole(text(merged.get("kind")))) {
            return;
        }
        boolean hasTarget = sources.stream().anyMatch(CourseProfileCompositionViewMerger::isTarget);
        boolean hasPrerequisiteOnly = sources.stream()
                .anyMatch(source -> "prerequisiteOnly".equals(source.get("projectionRole")));
        if (hasTarget && hasPrerequisiteOnly) {
            merged.put("projectionRole", "target");
        }
    }

    private static boolean isTarget(Map<String, Object> node) {
        Object role = node.get("projectionRole");
        return role == null || "target".equals(role);
    }

    private static boolean supportsProjectionRole(String kind) {
        return "canonicalSubtree".equals(kind) || "goalEntry".equals(kind);
    }

    private static boolean allProfileEquivalentIds(List<String> values) {
        if (values.stream().anyMatch(String::isBlank)) {
            return false;
        }
        String expected = normalizedId(values.getFirst());
        return values.stream().allMatch(value -> hasIdProfileToken(value) && normalizedId(value).equals(expected));
    }

    private static boolean allProfileEquivalentLabels(List<String> values) {
        if (values.stream().anyMatch(String::isBlank)) {
            return false;
        }
        String expected = normalizedLabel(values.getFirst());
        return values.stream()
                .allMatch(value -> hasLabelProfileToken(value) && normalizedLabel(value).equals(expected));
    }

    private static String normalizedId(String value) {
        return replaceIdProfileToken(value, "{profile}").toLowerCase(Locale.ROOT);
    }

    private static String combinedId(String value) {
        return replaceIdProfileToken(value, "gk-lk");
    }

    private static String replaceIdProfileToken(String value, String replacementToken) {
        Matcher matcher = ID_PROFILE_TOKEN.matcher(value);
        StringBuilder result = new StringBuilder();
        while (matcher.find()) {
            matcher.appendReplacement(
                    result,
                    Matcher.quoteReplacement(matcher.group(1) + replacementToken));
        }
        matcher.appendTail(result);
        return result.toString();
    }

    private static String normalizedLabel(String value) {
        String normalized = LABEL_LONG_PROFILE_TOKEN.matcher(value).replaceAll("{profile}");
        return LABEL_SHORT_PROFILE_TOKEN.matcher(normalized)
                .replaceAll("{profile}")
                .toLowerCase(Locale.ROOT);
    }

    private static String combinedLabel(String value) {
        if (LABEL_LONG_PROFILE_TOKEN.matcher(value).find()) {
            return LABEL_LONG_PROFILE_TOKEN.matcher(value).replaceAll("Grund- und Leistungskurs");
        }
        return LABEL_SHORT_PROFILE_TOKEN.matcher(value).replaceAll("GK + LK");
    }

    private static String combinedDivergentLabel(List<String> values) {
        List<String> neutralLabels = values.stream()
                .map(CourseProfileCompositionViewMerger::withoutProfileLabel)
                .distinct()
                .sorted()
                .toList();
        if (neutralLabels.stream().allMatch(label -> label.contains(":"))) {
            List<String> prefixes = neutralLabels.stream()
                    .map(label -> label.substring(0, label.indexOf(':')).trim())
                    .distinct()
                    .toList();
            if (prefixes.size() == 1) {
                String suffixes = neutralLabels.stream()
                        .map(label -> label.substring(label.indexOf(':') + 1).trim())
                        .distinct()
                        .sorted()
                        .reduce((left, right) -> left + " / " + right)
                        .orElse("");
                return prefixes.getFirst() + " (GK + LK): " + suffixes;
            }
        }
        return "GK + LK: " + String.join(" / ", neutralLabels);
    }

    private static String withoutProfileLabel(String value) {
        String neutral = LABEL_LONG_PROFILE_TOKEN.matcher(value).replaceAll("");
        neutral = LABEL_SHORT_PROFILE_TOKEN.matcher(neutral).replaceAll("");
        return neutral
                .replaceAll("\\(\\s*\\)", "")
                .replaceAll("\\s+([,:;])", "$1")
                .replaceAll("\\s{2,}", " ")
                .trim();
    }

    private static boolean hasIdProfileToken(String value) {
        return ID_PROFILE_TOKEN.matcher(value).find();
    }

    private static boolean hasLabelProfileToken(String value) {
        return LABEL_LONG_PROFILE_TOKEN.matcher(value).find()
                || LABEL_SHORT_PROFILE_TOKEN.matcher(value).find();
    }

    private static boolean allEqual(List<String> values) {
        return values.stream().allMatch(values.getFirst()::equals);
    }

    private static IllegalStateException conflict(Map<String, Object> node) {
        return new IllegalStateException(
                "Conflicting node metadata while merging composition views: " + nodeSignature(node));
    }

    private static String groupingKey(Map<String, Object> node) {
        if (!"structure".equals(text(node.get("kind")))) {
            return leafIdentity(node);
        }
        String id = text(node.get("id"));
        if (!id.isBlank()) {
            return "structure:" + normalizedId(id);
        }
        return "structure-label:" + normalizedLabel(text(node.get("label")));
    }

    private static String nodeSignature(Map<String, Object> node) {
        String kind = text(node.get("kind"));
        return switch (kind) {
            case "structure" -> "structure:" + text(node.getOrDefault("id", node.get("label")));
            case "canonicalSubtree", "goalEntry" -> kind + ":" + text(node.get("goalId"));
            case "landscapeEntry" -> kind + ":" + text(node.get("landscapeId"));
            default -> kind + ":" + node.hashCode();
        };
    }

    private static String leafIdentity(Map<String, Object> node) {
        String kind = text(node.get("kind"));
        if (supportsProjectionRole(kind)) {
            return "goal:" + text(node.get("goalId"));
        }
        return nodeSignature(node);
    }

    private static List<Map<String, Object>> nodeMaps(Object value) {
        if (!(value instanceof List<?> list)) {
            return List.of();
        }
        List<Map<String, Object>> nodes = new ArrayList<>();
        for (Object entry : list) {
            if (entry instanceof Map<?, ?> raw) {
                Map<String, Object> node = new LinkedHashMap<>();
                raw.forEach((key, child) -> {
                    if (key instanceof String text) {
                        node.put(text, child);
                    }
                });
                nodes.add(node);
            }
        }
        return nodes;
    }

    private static String text(Object value) {
        return value instanceof String string ? string : "";
    }

    private static Map<String, Object> deepFreeze(Map<String, Object> source) {
        Map<String, Object> frozen = new LinkedHashMap<>();
        source.forEach((key, value) -> {
            if (value instanceof Map<?, ?> rawMap) {
                Map<String, Object> child = new LinkedHashMap<>();
                rawMap.forEach((childKey, childValue) -> {
                    if (childKey instanceof String textKey) {
                        child.put(textKey, childValue);
                    }
                });
                frozen.put(key, deepFreeze(child));
            } else if (value instanceof List<?> list) {
                frozen.put(key, list.stream()
                        .map(entry -> entry instanceof Map<?, ?> rawEntry ? freezeRawMap(rawEntry) : entry)
                        .toList());
            } else {
                frozen.put(key, value);
            }
        });
        return Collections.unmodifiableMap(frozen);
    }

    private static Map<String, Object> freezeRawMap(Map<?, ?> rawMap) {
        Map<String, Object> child = new LinkedHashMap<>();
        rawMap.forEach((key, value) -> {
            if (key instanceof String textKey) {
                child.put(textKey, value);
            }
        });
        return deepFreeze(child);
    }

    private record GoalReference(
            Map<String, Object> node,
            String kind,
            String projectionRole,
            Set<String> goalIds,
            Map<String, Object> presentationMetadata) {
    }

    private record NodeGroup(String key, List<Map<String, Object>> nodes) {

        private NodeGroup(Map<String, Object> first) {
            this(groupingKey(first), new ArrayList<>());
        }

        private boolean accepts(Map<String, Object> candidate) {
            if (!key.equals(groupingKey(candidate))) {
                return false;
            }
            Map<String, Object> first = nodes.getFirst();
            if (!"structure".equals(text(first.get("kind")))
                    || !"structure".equals(text(candidate.get("kind")))) {
                return true;
            }
            String firstId = text(first.get("id"));
            String candidateId = text(candidate.get("id"));
            if (firstId.equals(candidateId)) {
                return true;
            }
            if (!allProfileEquivalentIds(List.of(firstId, candidateId))) {
                return false;
            }
            String firstLabel = text(first.get("label"));
            String candidateLabel = text(candidate.get("label"));
            return firstLabel.equals(candidateLabel)
                    || allProfileEquivalentLabels(List.of(firstLabel, candidateLabel))
                    || nodeListsContentEquivalent(
                            nodeMaps(first.get("children")),
                            nodeMaps(candidate.get("children")));
        }

        private void add(Map<String, Object> node) {
            nodes.add(node);
        }
    }

    private static final class MergeState {

        private final Map<String, Map<String, Object>> retainedLeaves = new LinkedHashMap<>();

        private Map<String, Object> retainLeaf(Map<String, Object> candidate) {
            String key = leafIdentity(candidate);
            Map<String, Object> retained = retainedLeaves.get(key);
            if (retained == null) {
                retainedLeaves.put(key, candidate);
                return candidate;
            }
            validateLeafMetadata(List.of(retained, candidate));
            List<Map<String, Object>> sources = List.of(new LinkedHashMap<>(retained), candidate);
            boolean candidateIsPreferred = "canonicalSubtree".equals(candidate.get("kind"))
                    && !"canonicalSubtree".equals(retained.get("kind"));
            if (candidateIsPreferred) {
                Map<String, Object> replacement = new LinkedHashMap<>(candidate);
                retained.clear();
                retained.putAll(replacement);
            }
            applyTargetDominantProjectionRole(retained, sources);
            return null;
        }
    }
}
