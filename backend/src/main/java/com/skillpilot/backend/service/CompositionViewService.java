package com.skillpilot.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.curriculumpackage.PackageCompositionViewState;
import com.skillpilot.backend.landscape.LandscapeProperties;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Stream;
import org.springframework.util.StringUtils;

public class CompositionViewService {

    private static final Path COMPOSITION_VIEW_ROOT = Path.of("DE", "Gymnasium", "composition-views");
    private static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<>() {
    };
    private static final String COMPOSITION_SYNTHETIC_PREFIX = "composition:";
    private static final String COMPOSITION_STRUCTURE_SEPARATOR = ":structure:";
    private static final String COURSE_PROFILE_KEY = "courseProfile";
    private static final String STAGE_KEY = "stage";
    private static final String STAGE_CROSS = "CROSSSTAGE";
    private static final String COURSE_PROFILE_ALL = "ALL";
    private static final String COURSE_PROFILE_COMBINED = "GK+LK";
    private static final String COURSE_PROFILE_GK = "GK";
    private static final String COURSE_PROFILE_LK = "LK";

    private enum ProjectionRole {
        TARGET,
        PREREQUISITE_ONLY
    }

    private final LandscapeProperties properties;
    private final ObjectMapper objectMapper;
    private final PackageCompositionViewState packageState;

    public CompositionViewService(LandscapeProperties properties, ObjectMapper objectMapper) {
        this.properties = Objects.requireNonNull(properties, "properties");
        this.objectMapper = Objects.requireNonNull(objectMapper, "objectMapper");
        this.packageState = null;
    }

    public CompositionViewService(PackageCompositionViewState packageState) {
        this.properties = null;
        this.objectMapper = null;
        this.packageState = Objects.requireNonNull(packageState, "packageState");
    }

    public record CompositionStructureResolution(
            String syntheticGoalId,
            String viewId,
            String nodeId,
            String label,
            List<String> referencedGoalIds) {
    }

    public CompositionStructureResolution resolveStructureReference(String syntheticGoalId) {
        CompositionStructureReference reference = parseStructureReference(syntheticGoalId);
        if (reference == null) {
            return null;
        }

        Map<String, Object> view = findViewById(reference.viewId());
        if (view == null) {
            return null;
        }

        Map<String, Object> node = findStructureNode(view.get("rootNodes"), reference.nodeId());
        if (node == null) {
            return null;
        }

        LinkedHashSet<String> referencedGoalIds = new LinkedHashSet<>();
        collectReferencedGoalIds(node, referencedGoalIds);
        if (referencedGoalIds.isEmpty()) {
            return null;
        }

        return new CompositionStructureResolution(
                syntheticGoalId,
                reference.viewId(),
                reference.nodeId(),
                asString(node.get("label")),
                List.copyOf(referencedGoalIds));
    }

    public List<CompositionStructureResolution> findFollowingStructureSiblings(String syntheticGoalId) {
        CompositionStructureReference reference = parseStructureReference(syntheticGoalId);
        if (reference == null) {
            return Collections.emptyList();
        }

        Map<String, Object> view = findViewById(reference.viewId());
        if (view == null) {
            return Collections.emptyList();
        }

        List<CompositionStructureResolution> siblings = findFollowingStructureSiblings(
                view.get("rootNodes"),
                reference.viewId(),
                reference.nodeId());
        return siblings == null ? Collections.emptyList() : siblings;
    }

    public List<CompositionStructureResolution> findFollowingScopeSiblings(String syntheticGoalId) {
        CompositionStructureReference reference = parseStructureReference(syntheticGoalId);
        if (reference == null) {
            return Collections.emptyList();
        }

        Map<String, Object> view = findViewById(reference.viewId());
        if (view == null) {
            return Collections.emptyList();
        }

        List<CompositionStructureResolution> siblings = findFollowingScopeSiblings(
                view.get("rootNodes"),
                reference.viewId(),
                reference.nodeId());
        return siblings == null ? Collections.emptyList() : siblings;
    }

    private record CompositionStructureReference(String viewId, String nodeId) {
    }

    private static CompositionStructureReference parseStructureReference(String syntheticGoalId) {
        if (!StringUtils.hasText(syntheticGoalId)
                || !syntheticGoalId.startsWith(COMPOSITION_SYNTHETIC_PREFIX)) {
            return null;
        }
        int structureSeparatorIndex = syntheticGoalId.lastIndexOf(COMPOSITION_STRUCTURE_SEPARATOR);
        if (structureSeparatorIndex <= COMPOSITION_SYNTHETIC_PREFIX.length()) {
            return null;
        }

        String viewId = syntheticGoalId.substring(
                COMPOSITION_SYNTHETIC_PREFIX.length(),
                structureSeparatorIndex);
        String nodeId = syntheticGoalId.substring(
                structureSeparatorIndex + COMPOSITION_STRUCTURE_SEPARATOR.length());
        if (!StringUtils.hasText(viewId) || !StringUtils.hasText(nodeId)) {
            return null;
        }
        return new CompositionStructureReference(viewId, nodeId);
    }

    private static List<CompositionStructureResolution> findFollowingStructureSiblings(
            Object rawNodes,
            String viewId,
            String nodeId) {
        List<Map<String, Object>> nodes = asNodeList(rawNodes);
        for (int index = 0; index < nodes.size(); index += 1) {
            Map<String, Object> node = nodes.get(index);
            if ("structure".equals(asString(node.get("kind"))) && nodeId.equals(asString(node.get("id")))) {
                List<CompositionStructureResolution> siblings = new ArrayList<>();
                for (int siblingIndex = index + 1; siblingIndex < nodes.size(); siblingIndex += 1) {
                    Map<String, Object> sibling = nodes.get(siblingIndex);
                    if (!"structure".equals(asString(sibling.get("kind")))) {
                        continue;
                    }
                    String siblingNodeId = asString(sibling.get("id"));
                    if (!StringUtils.hasText(siblingNodeId)) {
                        continue;
                    }
                    LinkedHashSet<String> referencedGoalIds = new LinkedHashSet<>();
                    collectReferencedGoalIds(sibling, referencedGoalIds);
                    if (referencedGoalIds.isEmpty()) {
                        continue;
                    }
                    siblings.add(new CompositionStructureResolution(
                            COMPOSITION_SYNTHETIC_PREFIX + viewId + COMPOSITION_STRUCTURE_SEPARATOR + siblingNodeId,
                            viewId,
                            siblingNodeId,
                            asString(sibling.get("label")),
                            List.copyOf(referencedGoalIds)));
                }
                return siblings;
            }

            List<CompositionStructureResolution> childMatch = findFollowingStructureSiblings(
                    node.get("children"),
                    viewId,
                    nodeId);
            if (childMatch != null) {
                return childMatch;
            }
        }
        return null;
    }

    private static List<CompositionStructureResolution> findFollowingScopeSiblings(
            Object rawNodes,
            String viewId,
            String nodeId) {
        List<Map<String, Object>> nodes = asNodeList(rawNodes);
        for (int index = 0; index < nodes.size(); index += 1) {
            Map<String, Object> node = nodes.get(index);
            if ("structure".equals(asString(node.get("kind"))) && nodeId.equals(asString(node.get("id")))) {
                List<CompositionStructureResolution> siblings = new ArrayList<>();
                for (int siblingIndex = index + 1; siblingIndex < nodes.size(); siblingIndex += 1) {
                    CompositionStructureResolution sibling = resolveScopeSibling(nodes.get(siblingIndex), viewId);
                    if (sibling != null) {
                        siblings.add(sibling);
                    }
                }
                return siblings;
            }

            List<CompositionStructureResolution> childMatch = findFollowingScopeSiblings(
                    node.get("children"),
                    viewId,
                    nodeId);
            if (childMatch != null) {
                return childMatch;
            }
        }
        return null;
    }

    private static CompositionStructureResolution resolveScopeSibling(Map<String, Object> node, String viewId) {
        if (node == null) {
            return null;
        }

        String kind = asString(node.get("kind"));
        if ("structure".equals(kind)) {
            String siblingNodeId = asString(node.get("id"));
            if (!StringUtils.hasText(siblingNodeId)) {
                return null;
            }
            LinkedHashSet<String> referencedGoalIds = new LinkedHashSet<>();
            collectReferencedGoalIds(node, referencedGoalIds);
            if (referencedGoalIds.isEmpty()) {
                return null;
            }
            return new CompositionStructureResolution(
                    COMPOSITION_SYNTHETIC_PREFIX + viewId + COMPOSITION_STRUCTURE_SEPARATOR + siblingNodeId,
                    viewId,
                    siblingNodeId,
                    asString(node.get("label")),
                    List.copyOf(referencedGoalIds));
        }

        if ("canonicalSubtree".equals(kind) || "goalEntry".equals(kind)) {
            String goalId = asString(node.get("goalId"));
            if (!StringUtils.hasText(goalId)) {
                return null;
            }
            return new CompositionStructureResolution(
                    goalId,
                    viewId,
                    goalId,
                    asString(node.get("label")),
                    List.of(goalId));
        }

        return null;
    }

    public Map<String, Object> findMatchingView(String landscapeId, Map<String, String> requestedScope) {
        if (!StringUtils.hasText(landscapeId)) {
            return null;
        }
        if (packageState != null) {
            return packageState.resolveDocument(landscapeId.trim(), requestedScope);
        }

        Path baseDir = Path.of(properties.getDirectory()).resolve(COMPOSITION_VIEW_ROOT);
        if (!Files.isDirectory(baseDir)) {
            return null;
        }

        Map<String, String> normalizedRequestedScope = normalizeScope(requestedScope);

        try (Stream<Path> stream = Files.walk(baseDir)) {
            List<ViewMatch> matches = stream
                    .filter(Files::isRegularFile)
                    .filter(path -> path.getFileName().toString().endsWith(".view.json"))
                    .map(this::readViewFile)
                    .filter(Objects::nonNull)
                    .filter(view -> normalizeValue(asString(view.get("landscapeId")))
                            .equals(normalizeValue(landscapeId)))
                    .map(view -> new ViewMatch(
                            view,
                            scoreScopeMatch(normalizeScope(asMap(view.get("scope"))), normalizedRequestedScope)))
                    .filter(match -> match.score() != null)
                    .sorted(Comparator
                            .<ViewMatch>comparingInt(match -> match.score().scopeSize())
                            .reversed()
                            .thenComparingInt(match -> match.score().stageFallbackCount())
                            .thenComparingInt(match -> match.score().courseFallbackCount())
                            .thenComparingInt(match -> match.score().coursePreferenceRank())
                            .thenComparing(match -> asString(match.view().get("viewId"))))
                    .toList();
            if (matches.isEmpty()) {
                return null;
            }

            if (isCombinedCourseProfileRequest(normalizedRequestedScope)) {
                MatchScore bestScore = matches.get(0).score();
                List<Map<String, Object>> mergeCandidates = matches.stream()
                        .filter(match -> match.score().scopeSize() == bestScore.scopeSize())
                        .filter(match -> match.score().stageFallbackCount() == bestScore.stageFallbackCount())
                        .filter(match -> match.score().courseFallbackCount() == bestScore.courseFallbackCount())
                        .map(ViewMatch::view)
                        .toList();
                if (mergeCandidates.size() > 1 && bestScore.courseFallbackCount() > 0) {
                    return mergeViews(landscapeId, requestedScope, mergeCandidates);
                }
            }

            return Collections.unmodifiableMap(new LinkedHashMap<>(matches.get(0).view()));
        } catch (IOException e) {
            throw new IllegalStateException("Failed to load composition views from " + baseDir, e);
        }
    }

    public Map<String, Object> findViewById(String viewId) {
        if (!StringUtils.hasText(viewId)) {
            return null;
        }
        String normalizedViewId = viewId.trim();
        if (packageState != null) {
            return packageState.findViewDocumentById(normalizedViewId);
        }
        if (normalizedViewId.startsWith("merged:")) {
            List<Map<String, Object>> sourceViews = Arrays.stream(normalizedViewId.substring("merged:".length()).split("\\+"))
                    .map(String::trim)
                    .filter(StringUtils::hasText)
                    .map(this::findSingleViewById)
                    .filter(Objects::nonNull)
                    .toList();
            if (sourceViews.isEmpty()) {
                return null;
            }
            if (sourceViews.size() == 1) {
                return Collections.unmodifiableMap(new LinkedHashMap<>(sourceViews.get(0)));
            }
            return mergeViews(
                    asString(sourceViews.get(0).get("landscapeId")),
                    asStringMap(sourceViews.get(0).get("scope")),
                    sourceViews);
        }
        return findSingleViewById(normalizedViewId);
    }

    public Map<String, Object> findOfferingById(String offeringId) {
        if (packageState == null || !StringUtils.hasText(offeringId)) {
            return null;
        }
        return packageState.resolveOfferingDocument(offeringId.trim());
    }

    public Map<String, Object> findDefaultView(String landscapeId) {
        if (packageState == null || !StringUtils.hasText(landscapeId)) {
            return null;
        }
        return packageState.resolveDefaultDocument(landscapeId.trim());
    }

    public boolean isAuthoritativeForLandscape(String landscapeId) {
        return packageState != null
                && StringUtils.hasText(landscapeId)
                && packageState.isManagedLandscape(landscapeId.trim());
    }

    private Map<String, Object> findSingleViewById(String viewId) {
        Path baseDir = Path.of(properties.getDirectory()).resolve(COMPOSITION_VIEW_ROOT);
        if (!Files.isDirectory(baseDir)) {
            return null;
        }

        try (Stream<Path> stream = Files.walk(baseDir)) {
            return stream
                    .filter(Files::isRegularFile)
                    .filter(path -> path.getFileName().toString().endsWith(".view.json"))
                    .map(this::readViewFile)
                    .filter(Objects::nonNull)
                    .filter(view -> normalizeValue(asString(view.get("viewId"))).equals(normalizeValue(viewId)))
                    .findFirst()
                    .map(view -> Collections.unmodifiableMap(new LinkedHashMap<>(view)))
                    .orElse(null);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to load composition views from " + baseDir, e);
        }
    }

    private record MatchScore(int scopeSize, int stageFallbackCount, int courseFallbackCount, int coursePreferenceRank) {
    }

    private record ViewMatch(Map<String, Object> view, MatchScore score) {
    }

    private Map<String, Object> readViewFile(Path path) {
        try {
            Map<String, Object> view = objectMapper.readValue(path.toFile(), MAP_TYPE);
            validateProjectionRoles(view.get("rootNodes"), path, "rootNodes");
            return view;
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

    private static Map<String, String> asStringMap(Object value) {
        if (!(value instanceof Map<?, ?> map)) {
            return Collections.emptyMap();
        }
        Map<String, String> normalized = new LinkedHashMap<>();
        map.forEach((key, entry) -> {
            if (key instanceof String stringKey && entry instanceof String text && StringUtils.hasText(text)) {
                normalized.put(stringKey, text.trim());
            }
        });
        return normalized;
    }

    private static String asString(Object value) {
        return value instanceof String text ? text : "";
    }

    private static Map<String, Object> findStructureNode(Object rawNodes, String nodeId) {
        if (!StringUtils.hasText(nodeId)) {
            return null;
        }
        for (Map<String, Object> node : asNodeList(rawNodes)) {
            if ("structure".equals(asString(node.get("kind"))) && nodeId.equals(asString(node.get("id")))) {
                return node;
            }
            Map<String, Object> childMatch = findStructureNode(node.get("children"), nodeId);
            if (childMatch != null) {
                return childMatch;
            }
        }
        return null;
    }

    private static void collectReferencedGoalIds(Map<String, Object> node, LinkedHashSet<String> goalIds) {
        if (node == null) {
            return;
        }

        String kind = asString(node.get("kind"));
        if ("canonicalSubtree".equals(kind) || "goalEntry".equals(kind)) {
            String goalId = asString(node.get("goalId"));
            if (StringUtils.hasText(goalId)) {
                goalIds.add(goalId);
            }
            return;
        }

        if ("landscapeEntry".equals(kind)) {
            // Landscape entries cannot be resolved without the landscape graph; callers can
            // still resolve canonical subtree and goal entry children of the same structure.
            return;
        }

        for (Map<String, Object> child : asNodeList(node.get("children"))) {
            collectReferencedGoalIds(child, goalIds);
        }
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

    private static MatchScore scoreScopeMatch(Map<String, String> viewScope, Map<String, String> requestedScope) {
        if (viewScope.isEmpty()) {
            return requestedScope.isEmpty() ? new MatchScore(0, 0, 0, 0) : null;
        }

        int stageFallbackCount = 0;
        int courseFallbackCount = 0;
        int coursePreferenceRank = 0;
        for (Map.Entry<String, String> entry : viewScope.entrySet()) {
            String requestedValue = requestedScope.get(entry.getKey());
            if (!StringUtils.hasText(requestedValue)) {
                return null;
            }

            if (STAGE_KEY.equals(entry.getKey())) {
                StageMatch stageMatch = matchStageScope(entry.getValue(), requestedValue);
                if (stageMatch == StageMatch.NONE) {
                    return null;
                }
                if (stageMatch == StageMatch.FALLBACK) {
                    stageFallbackCount += 1;
                }
                continue;
            }

            if (COURSE_PROFILE_KEY.equals(entry.getKey())) {
                CourseProfileMatch courseProfileMatch = matchCourseProfileScope(entry.getValue(), requestedValue);
                if (courseProfileMatch == null) {
                    return null;
                }
                if (courseProfileMatch.fallback()) {
                    courseFallbackCount += 1;
                }
                coursePreferenceRank += courseProfileMatch.preferenceRank();
                continue;
            }

            if (!normalizeValue(requestedValue).equals(normalizeValue(entry.getValue()))) {
                return null;
            }
        }

        if (stageFallbackCount > 0
                && StringUtils.hasText(requestedScope.get(COURSE_PROFILE_KEY))
                && !viewScope.containsKey(COURSE_PROFILE_KEY)) {
            return null;
        }

        return new MatchScore(viewScope.size(), stageFallbackCount, courseFallbackCount, coursePreferenceRank);
    }

    private enum StageMatch {
        EXACT,
        FALLBACK,
        NONE
    }

    private record CourseProfileMatch(boolean fallback, int preferenceRank) {
    }

    private static StageMatch matchStageScope(String viewStage, String requestedStage) {
        String normalizedViewStage = normalizeValue(viewStage);
        String normalizedRequestedStage = normalizeValue(requestedStage);
        if (!StringUtils.hasText(normalizedViewStage) || !StringUtils.hasText(normalizedRequestedStage)) {
            return StageMatch.NONE;
        }
        if (normalizedViewStage.equals(normalizedRequestedStage)) {
            return StageMatch.EXACT;
        }
        if (STAGE_CROSS.equals(normalizedRequestedStage)
                && ("SEKI".equals(normalizedViewStage) || "SEKII".equals(normalizedViewStage))) {
            return StageMatch.FALLBACK;
        }
        return StageMatch.NONE;
    }

    private static CourseProfileMatch matchCourseProfileScope(String viewCourseProfile, String requestedCourseProfile) {
        String normalizedViewCourseProfile = normalizeValue(viewCourseProfile);
        String normalizedRequestedCourseProfile = normalizeValue(requestedCourseProfile);
        if (!StringUtils.hasText(normalizedViewCourseProfile) || !StringUtils.hasText(normalizedRequestedCourseProfile)) {
            return null;
        }
        if (normalizedViewCourseProfile.equals(normalizedRequestedCourseProfile)) {
            return new CourseProfileMatch(false, 0);
        }
        if (COURSE_PROFILE_ALL.equals(normalizedRequestedCourseProfile)
                || COURSE_PROFILE_COMBINED.equals(normalizedRequestedCourseProfile)) {
            if (COURSE_PROFILE_LK.equals(normalizedViewCourseProfile)) {
                return new CourseProfileMatch(true, 0);
            }
            if (COURSE_PROFILE_GK.equals(normalizedViewCourseProfile)) {
                return new CourseProfileMatch(true, 1);
            }
        }
        return null;
    }

    private static boolean isCombinedCourseProfileRequest(Map<String, String> requestedScope) {
        String requestedCourseProfile = normalizeValue(requestedScope.get(COURSE_PROFILE_KEY));
        return COURSE_PROFILE_ALL.equals(requestedCourseProfile) || COURSE_PROFILE_COMBINED.equals(requestedCourseProfile);
    }

    private static Map<String, Object> mergeViews(
            String landscapeId,
            Map<String, String> requestedScope,
            List<Map<String, Object>> views) {
        List<Map<String, Object>> normalizedViews = views.stream()
                .map(view -> Collections.unmodifiableMap(new LinkedHashMap<>(view)))
                .toList();
        List<Map<String, Object>> mergedRootNodes = mergeNodeMaps(normalizedViews.stream()
                .flatMap(view -> asNodeList(view.get("rootNodes")).stream())
                .toList());
        List<String> sourceViewIds = normalizedViews.stream()
                .map(view -> asString(view.get("viewId")))
                .filter(StringUtils::hasText)
                .distinct()
                .toList();

        Map<String, Object> merged = new LinkedHashMap<>();
        merged.put("viewId", "merged:" + String.join("+", sourceViewIds));
        merged.put("landscapeId", landscapeId);
        merged.put("scope", Collections.unmodifiableMap(new LinkedHashMap<>(requestedScope)));
        merged.put("rootNodes", mergedRootNodes);
        merged.put("mergedFromViewIds", sourceViewIds);
        return Collections.unmodifiableMap(merged);
    }

    @SuppressWarnings("unchecked")
    private static List<Map<String, Object>> asNodeList(Object value) {
        if (!(value instanceof List<?> rawList)) {
            return Collections.emptyList();
        }
        List<Map<String, Object>> nodes = new ArrayList<>();
        for (Object entry : rawList) {
            if (entry instanceof Map<?, ?> rawNode) {
                Map<String, Object> node = new LinkedHashMap<>();
                rawNode.forEach((key, childValue) -> {
                    if (key instanceof String stringKey) {
                        node.put(stringKey, childValue);
                    }
                });
                nodes.add(node);
            }
        }
        return nodes;
    }

    private static List<Map<String, Object>> mergeNodeMaps(List<Map<String, Object>> nodes) {
        Map<String, List<Map<String, Object>>> grouped = new LinkedHashMap<>();
        for (Map<String, Object> node : nodes) {
            grouped.computeIfAbsent(nodeSignature(node), key -> new ArrayList<>()).add(node);
        }

        List<Map<String, Object>> merged = new ArrayList<>();
        for (List<Map<String, Object>> group : grouped.values()) {
            Map<String, Object> first = new LinkedHashMap<>(group.get(0));
            if ("structure".equals(asString(first.get("kind")))) {
                List<Map<String, Object>> children = group.stream()
                        .flatMap(node -> asNodeList(node.get("children")).stream())
                        .toList();
                first.put("children", mergeNodeMaps(children));
            } else {
                first.remove("children");
                applyTargetDominantProjectionRole(first, group);
            }
            merged.add(Collections.unmodifiableMap(first));
        }
        return Collections.unmodifiableList(merged);
    }

    private static void validateProjectionRoles(Object rawNodes, Path path, String nodePath) {
        List<Map<String, Object>> nodes = asNodeList(rawNodes);
        for (int index = 0; index < nodes.size(); index += 1) {
            Map<String, Object> node = nodes.get(index);
            String kind = asString(node.get("kind"));
            String currentPath = nodePath + "[" + index + "]";
            if (supportsProjectionRole(kind)) {
                projectionRole(node, path, currentPath);
            } else if ("landscapeEntry".equals(kind) && node.containsKey("projectionRole")) {
                throw new IllegalStateException(
                        "projectionRole is only supported on canonicalSubtree and goalEntry nodes in composition view "
                                + path + " " + currentPath);
            }
            if ("structure".equals(kind)) {
                validateProjectionRoles(node.get("children"), path, currentPath + ".children");
            }
        }
    }

    private static void applyTargetDominantProjectionRole(
            Map<String, Object> merged,
            List<Map<String, Object>> sources) {
        String kind = asString(merged.get("kind"));
        if (!supportsProjectionRole(kind)) {
            return;
        }
        boolean hasTarget = false;
        boolean hasPrerequisiteOnly = false;
        for (Map<String, Object> source : sources) {
            ProjectionRole role = projectionRole(source, null, nodeSignature(source));
            hasTarget |= role == ProjectionRole.TARGET;
            hasPrerequisiteOnly |= role == ProjectionRole.PREREQUISITE_ONLY;
        }
        if (hasTarget && hasPrerequisiteOnly) {
            merged.put("projectionRole", "target");
        }
    }

    private static ProjectionRole projectionRole(Map<String, Object> node, Path path, String nodePath) {
        if (!node.containsKey("projectionRole")) {
            return ProjectionRole.TARGET;
        }
        Object rawRole = node.get("projectionRole");
        if ("target".equals(rawRole)) {
            return ProjectionRole.TARGET;
        }
        if ("prerequisiteOnly".equals(rawRole)) {
            return ProjectionRole.PREREQUISITE_ONLY;
        }
        String location = path == null ? nodePath : path + " " + nodePath;
        throw new IllegalStateException("Unsupported projectionRole in composition view "
                + location + ": " + rawRole);
    }

    private static boolean supportsProjectionRole(String kind) {
        return "canonicalSubtree".equals(kind)
                || "goalEntry".equals(kind);
    }

    private static String nodeSignature(Map<String, Object> node) {
        String kind = asString(node.get("kind"));
        if ("structure".equals(kind)) {
            String id = asString(node.get("id"));
            String label = asString(node.get("label"));
            return "structure:" + (StringUtils.hasText(id) ? id : label);
        }
        if ("canonicalSubtree".equals(kind) || "goalEntry".equals(kind)) {
            return kind + ":" + asString(node.get("goalId"));
        }
        if ("landscapeEntry".equals(kind)) {
            return kind + ":" + asString(node.get("landscapeId"));
        }
        return kind + ":" + node.hashCode();
    }
}
