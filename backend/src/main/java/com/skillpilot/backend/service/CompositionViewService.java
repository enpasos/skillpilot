package com.skillpilot.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.composition.CourseProfileCompositionViewMerger;
import com.skillpilot.backend.curriculumpackage.PackageCompositionViewState;
import com.skillpilot.backend.landscape.LandscapeProperties;
import com.skillpilot.backend.landscape.LearningGoal;
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
import java.util.Set;
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
    private static final Set<String> LEARNER_SCOPE_DIMENSIONS = Set.of(
            "schoolForm",
            "jurisdiction",
            STAGE_KEY,
            "durationModel",
            COURSE_PROFILE_KEY);

    private enum ProjectionRole {
        TARGET,
        PREREQUISITE_ONLY
    }

    private final LandscapeProperties properties;
    private final ObjectMapper objectMapper;
    private final PackageCompositionViewState packageState;
    private volatile RepositoryViewIndex repositoryViewIndex;

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

    public List<CompositionStructureResolution> findRootScopeOptions(String viewId) {
        Map<String, Object> view = findViewById(viewId);
        if (view == null) {
            return Collections.emptyList();
        }
        String resolvedViewId = asString(view.get("viewId"));
        if (!StringUtils.hasText(resolvedViewId)) {
            return Collections.emptyList();
        }
        return asNodeList(view.get("rootNodes")).stream()
                .map(node -> resolveScopeSibling(node, resolvedViewId))
                .filter(Objects::nonNull)
                .toList();
    }

    /**
     * Returns the learner-facing ancestors of one current focus in a matched
     * composition view.
     *
     * <p>The current focus itself is excluded. A canonical descendant follows
     * the first authored {@code contains} path to its matching
     * {@code canonicalSubtree} root, followed by the enclosing composition
     * structure nodes. A direct {@code goalEntry} deliberately skips unrelated
     * canonical parents and follows only its authored composition structure
     * path. A synthetic structure focus follows its enclosing structure path.
     * Results are nearest-first and de-duplicated. {@code requires} edges are
     * not part of this lookup.</p>
     */
    public List<CompositionStructureResolution> findLearnerFacingFocusAncestors(
            String viewId,
            String focusGoalId,
            Map<String, LearningGoal> structuralGoals) {
        if (!StringUtils.hasText(viewId) || !StringUtils.hasText(focusGoalId)) {
            return Collections.emptyList();
        }

        Map<String, Object> view = findViewById(viewId);
        if (view == null) {
            return Collections.emptyList();
        }
        String resolvedViewId = asString(view.get("viewId"));
        if (!StringUtils.hasText(resolvedViewId)) {
            return Collections.emptyList();
        }

        CompositionStructureReference structureReference = parseStructureReference(focusGoalId);
        if (structureReference != null) {
            if (!resolvedViewId.equals(structureReference.viewId())) {
                return Collections.emptyList();
            }
            List<Map<String, Object>> structurePath = findStructurePath(
                    view.get("rootNodes"),
                    structureReference.nodeId(),
                    List.of());
            if (structurePath == null) {
                return Collections.emptyList();
            }
            return resolveEnclosingStructures(
                    structurePath.subList(0, structurePath.size() - 1),
                    resolvedViewId,
                    new LinkedHashMap<>());
        }

        if (structuralGoals == null || structuralGoals.isEmpty()) {
            return Collections.emptyList();
        }
        String resolvedFocusGoalId = resolveCanonicalGoalReference(focusGoalId, structuralGoals);
        if (resolvedFocusGoalId == null) {
            return Collections.emptyList();
        }

        List<FocusPathCandidate> candidates = new ArrayList<>();
        collectFocusPathCandidates(
                view.get("rootNodes"),
                List.of(),
                resolvedFocusGoalId,
                structuralGoals,
                candidates,
                new int[]{0});
        FocusPathCandidate selectedPath = candidates.stream()
                .sorted(Comparator
                        .comparingInt((FocusPathCandidate candidate) -> candidate.directGoalEntry() ? 0 : 1)
                        .thenComparingInt(candidate -> candidate.canonicalPath().size())
                        .thenComparingInt(candidate -> candidate.role() == ProjectionRole.TARGET ? 0 : 1)
                        .thenComparingInt(FocusPathCandidate::authoredOrder))
                .findFirst()
                .orElse(null);
        if (selectedPath == null || selectedPath.role() != ProjectionRole.TARGET) {
            return Collections.emptyList();
        }

        LinkedHashMap<String, CompositionStructureResolution> ancestors = new LinkedHashMap<>();
        if (!selectedPath.directGoalEntry()) {
            List<String> canonicalPath = selectedPath.canonicalPath();
            for (int index = canonicalPath.size() - 2; index >= 0; index -= 1) {
                String ancestorGoalId = canonicalPath.get(index);
                LearningGoal ancestor = structuralGoals.get(ancestorGoalId);
                String label = ancestor == null ? "" : ancestor.getTitle();
                if (index == 0) {
                    String displayLabel = asString(selectedPath.referenceNode().get("displayLabel"));
                    if (StringUtils.hasText(displayLabel)) {
                        label = displayLabel;
                    }
                }
                ancestors.putIfAbsent(
                        ancestorGoalId,
                        new CompositionStructureResolution(
                                ancestorGoalId,
                                resolvedViewId,
                                ancestorGoalId,
                                label,
                                List.of(ancestorGoalId)));
            }
        }
        return resolveEnclosingStructures(
                selectedPath.structurePath(),
                resolvedViewId,
                ancestors);
    }

    private record CompositionStructureReference(String viewId, String nodeId) {
    }

    private record FocusPathCandidate(
            ProjectionRole role,
            boolean directGoalEntry,
            List<String> canonicalPath,
            List<Map<String, Object>> structurePath,
            Map<String, Object> referenceNode,
            int authoredOrder) {

        private FocusPathCandidate {
            canonicalPath = List.copyOf(canonicalPath);
            structurePath = List.copyOf(structurePath);
            referenceNode = Collections.unmodifiableMap(new LinkedHashMap<>(referenceNode));
        }
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

    private static List<Map<String, Object>> findStructurePath(
            Object rawNodes,
            String nodeId,
            List<Map<String, Object>> structurePath) {
        for (Map<String, Object> node : asNodeList(rawNodes)) {
            if (!"structure".equals(asString(node.get("kind")))) {
                continue;
            }
            List<Map<String, Object>> nextPath = new ArrayList<>(structurePath);
            nextPath.add(node);
            if (nodeId.equals(asString(node.get("id")))) {
                return List.copyOf(nextPath);
            }
            List<Map<String, Object>> childPath = findStructurePath(
                    node.get("children"),
                    nodeId,
                    nextPath);
            if (childPath != null) {
                return childPath;
            }
        }
        return null;
    }

    private static void collectFocusPathCandidates(
            Object rawNodes,
            List<Map<String, Object>> structurePath,
            String focusGoalId,
            Map<String, LearningGoal> structuralGoals,
            List<FocusPathCandidate> candidates,
            int[] authoredOrder) {
        for (Map<String, Object> node : asNodeList(rawNodes)) {
            String kind = asString(node.get("kind"));
            if ("structure".equals(kind)) {
                List<Map<String, Object>> childStructurePath = new ArrayList<>(structurePath);
                childStructurePath.add(node);
                collectFocusPathCandidates(
                        node.get("children"),
                        childStructurePath,
                        focusGoalId,
                        structuralGoals,
                        candidates,
                        authoredOrder);
                continue;
            }
            if (!supportsProjectionRole(kind)) {
                continue;
            }

            int candidateOrder = authoredOrder[0];
            authoredOrder[0] += 1;
            String referencedGoalId = resolveCanonicalGoalReference(
                    asString(node.get("goalId")),
                    structuralGoals);
            if (referencedGoalId == null) {
                continue;
            }

            boolean directGoalEntry = "goalEntry".equals(kind);
            List<String> canonicalPath;
            if (directGoalEntry) {
                if (!referencedGoalId.equals(focusGoalId)) {
                    continue;
                }
                canonicalPath = List.of(focusGoalId);
            } else {
                canonicalPath = findCanonicalContainsPath(
                        referencedGoalId,
                        focusGoalId,
                        structuralGoals,
                        new LinkedHashSet<>());
                if (canonicalPath == null) {
                    continue;
                }
            }
            candidates.add(new FocusPathCandidate(
                    projectionRole(node, null, "focus ancestor path"),
                    directGoalEntry,
                    canonicalPath,
                    structurePath,
                    node,
                    candidateOrder));
        }
    }

    private static List<String> findCanonicalContainsPath(
            String currentGoalId,
            String targetGoalId,
            Map<String, LearningGoal> structuralGoals,
            Set<String> visiting) {
        if (currentGoalId.equals(targetGoalId)) {
            return List.of(currentGoalId);
        }
        if (!visiting.add(currentGoalId)) {
            return null;
        }

        LearningGoal currentGoal = structuralGoals.get(currentGoalId);
        if (currentGoal != null && currentGoal.getContains() != null) {
            for (String childReference : currentGoal.getContains()) {
                String childGoalId = resolveCanonicalGoalReference(childReference, structuralGoals);
                if (childGoalId == null) {
                    continue;
                }
                List<String> childPath = findCanonicalContainsPath(
                        childGoalId,
                        targetGoalId,
                        structuralGoals,
                        visiting);
                if (childPath != null) {
                    List<String> path = new ArrayList<>(childPath.size() + 1);
                    path.add(currentGoalId);
                    path.addAll(childPath);
                    visiting.remove(currentGoalId);
                    return List.copyOf(path);
                }
            }
        }
        visiting.remove(currentGoalId);
        return null;
    }

    private static String resolveCanonicalGoalReference(
            String goalReference,
            Map<String, LearningGoal> structuralGoals) {
        if (!StringUtils.hasText(goalReference)
                || structuralGoals == null
                || structuralGoals.isEmpty()) {
            return null;
        }
        String normalizedReference = goalReference.trim();
        if (structuralGoals.containsKey(normalizedReference)) {
            return normalizedReference;
        }
        int separatorIndex = normalizedReference.indexOf(':');
        if (separatorIndex >= 0 && separatorIndex + 1 < normalizedReference.length()) {
            String unqualifiedReference = normalizedReference.substring(separatorIndex + 1);
            if (structuralGoals.containsKey(unqualifiedReference)) {
                return unqualifiedReference;
            }
        }
        String qualifiedSuffix = ":" + normalizedReference;
        return structuralGoals.keySet().stream()
                .filter(goalId -> goalId.endsWith(qualifiedSuffix))
                .sorted()
                .findFirst()
                .orElse(null);
    }

    private static List<CompositionStructureResolution> resolveEnclosingStructures(
            List<Map<String, Object>> structurePath,
            String viewId,
            LinkedHashMap<String, CompositionStructureResolution> ancestors) {
        for (int index = structurePath.size() - 1; index >= 0; index -= 1) {
            CompositionStructureResolution resolution = resolveScopeSibling(
                    structurePath.get(index),
                    viewId);
            if (resolution != null) {
                ancestors.putIfAbsent(resolution.syntheticGoalId(), resolution);
            }
        }
        return List.copyOf(ancestors.values());
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
        return findRepositoryMatchingView(landscapeId, requestedScope, false);
    }

    private Map<String, Object> findRepositoryMatchingView(
            String landscapeId,
            Map<String, String> requestedScope,
            boolean requireExactStage) {
        Map<String, String> normalizedRequestedScope = normalizeScope(requestedScope);
        List<ViewMatch> matches = repositoryViewIndex()
                .byLandscapeId()
                .getOrDefault(normalizeValue(landscapeId), List.of())
                .stream()
                .map(view -> new ViewMatch(
                        view,
                        scoreScopeMatch(normalizeScope(asMap(view.get("scope"))), normalizedRequestedScope)))
                .filter(match -> match.score() != null)
                .filter(match -> !requireExactStage
                        || hasExactLearnerAnchorScope(
                                asMap(match.view().get("scope")),
                                normalizedRequestedScope))
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
    }

    private static boolean hasExactLearnerAnchorScope(
            Map<String, ?> authoredScope,
            Map<String, String> normalizedRequestedScope) {
        String requestedSchoolForm = normalizeValue(normalizedRequestedScope.get("schoolForm"));
        String authoredSchoolForm = normalizeValue(asString(authoredScope.get("schoolForm")));
        String requestedStage = normalizeValue(normalizedRequestedScope.get(STAGE_KEY));
        String authoredStage = normalizeValue(asString(authoredScope.get(STAGE_KEY)));
        return StringUtils.hasText(requestedSchoolForm)
                && requestedSchoolForm.equals(authoredSchoolForm)
                && StringUtils.hasText(requestedStage)
                && requestedStage.equals(authoredStage);
    }

    /**
     * Resolves a committed learner scope without weakening its authored stage
     * semantics.
     *
     * <p>Repository composition views may deliberately omit Level-2
     * dimensions that do not narrow their applicability, for example a
     * DE-wide Sek-I view or a duration-neutral Sek-II view. Such a reviewed
     * scope is a compatible authored subset, not a heuristic fallback. School
     * form and stage must still match exactly, and unknown dimensions remain
     * fail-closed. Package offering identity remains exact in
     * {@link PackageCompositionViewState}; only this learner adapter selects
     * the most specific compatible authored offering.</p>
     */
    public Map<String, Object> findLearnerScopeView(
            String landscapeId,
            Map<String, String> requestedScope) {
        Map<String, String> normalizedRequestedScope =
                normalizeScope(requestedScope == null ? Map.of() : requestedScope);
        if (!isConstrainedLearnerScope(normalizedRequestedScope)) {
            return null;
        }
        if (packageState == null) {
            return findRepositoryMatchingView(
                    landscapeId,
                    normalizedRequestedScope,
                    true);
        }

        if (!StringUtils.hasText(landscapeId)) {
            return null;
        }
        List<PackageOfferingMatch> matches = packageState.offeringsByLandscapeId()
                .getOrDefault(landscapeId.trim(), List.of())
                .stream()
                .map(offering -> new PackageOfferingMatch(
                        offering,
                        scoreScopeMatch(offering.scope(), normalizedRequestedScope)))
                .filter(match -> match.score() != null)
                .filter(match -> hasExactLearnerAnchorScope(
                        match.offering().scope(),
                        normalizedRequestedScope))
                .sorted(Comparator
                        .<PackageOfferingMatch>comparingInt(match -> match.score().scopeSize())
                        .reversed()
                        .thenComparingInt(match -> match.score().courseFallbackCount())
                        .thenComparingInt(match -> match.score().coursePreferenceRank())
                        .thenComparing(match -> match.offering().offeringId()))
                .toList();
        if (matches.isEmpty()) {
            return null;
        }
        return packageState.resolveOfferingDocument(
                matches.get(0).offering().offeringId());
    }

    private static boolean isConstrainedLearnerScope(
            Map<String, String> normalizedRequestedScope) {
        return LEARNER_SCOPE_DIMENSIONS.containsAll(normalizedRequestedScope.keySet())
                && StringUtils.hasText(normalizedRequestedScope.get("schoolForm"))
                && StringUtils.hasText(normalizedRequestedScope.get(STAGE_KEY))
                && !"ALL".equals(normalizeValue(
                        normalizedRequestedScope.get("jurisdiction")));
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
        Map<String, Object> view =
                repositoryViewIndex().byViewId().get(normalizeValue(viewId));
        return view == null
                ? null
                : Collections.unmodifiableMap(new LinkedHashMap<>(view));
    }

    private record MatchScore(int scopeSize, int stageFallbackCount, int courseFallbackCount, int coursePreferenceRank) {
    }

    private record ViewMatch(Map<String, Object> view, MatchScore score) {
    }

    private record PackageOfferingMatch(
            PackageCompositionViewState.Offering offering,
            MatchScore score) {
    }

    private record RepositoryViewIndex(
            Map<String, List<Map<String, Object>>> byLandscapeId,
            Map<String, Map<String, Object>> byViewId) {
    }

    /**
     * One service instance represents one repository directory snapshot. Load
     * and validate its authored views once, then reuse immutable indexes for
     * every offering probe and learner-facing resolution.
     */
    private RepositoryViewIndex repositoryViewIndex() {
        RepositoryViewIndex current = repositoryViewIndex;
        if (current != null) {
            return current;
        }
        synchronized (this) {
            current = repositoryViewIndex;
            if (current == null) {
                current = loadRepositoryViewIndex();
                repositoryViewIndex = current;
            }
            return current;
        }
    }

    private RepositoryViewIndex loadRepositoryViewIndex() {
        Path baseDir = Path.of(properties.getDirectory()).resolve(COMPOSITION_VIEW_ROOT);
        if (!Files.isDirectory(baseDir)) {
            return new RepositoryViewIndex(Map.of(), Map.of());
        }

        try (Stream<Path> stream = Files.walk(baseDir)) {
            List<Map<String, Object>> views = stream
                    .filter(Files::isRegularFile)
                    .filter(path -> path.getFileName().toString().endsWith(".view.json"))
                    .sorted()
                    .map(this::readViewFile)
                    .filter(Objects::nonNull)
                    .map(view -> Collections.unmodifiableMap(new LinkedHashMap<>(view)))
                    .toList();
            Map<String, List<Map<String, Object>>> mutableByLandscapeId =
                    new LinkedHashMap<>();
            Map<String, Map<String, Object>> mutableByViewId =
                    new LinkedHashMap<>();
            for (Map<String, Object> view : views) {
                mutableByLandscapeId
                        .computeIfAbsent(
                                normalizeValue(asString(view.get("landscapeId"))),
                                ignored -> new ArrayList<>())
                        .add(view);
                mutableByViewId.putIfAbsent(
                        normalizeValue(asString(view.get("viewId"))),
                        view);
            }
            Map<String, List<Map<String, Object>>> byLandscapeId =
                    new LinkedHashMap<>();
            mutableByLandscapeId.forEach((landscapeId, landscapeViews) ->
                    byLandscapeId.put(landscapeId, List.copyOf(landscapeViews)));
            return new RepositoryViewIndex(
                    Collections.unmodifiableMap(byLandscapeId),
                    Collections.unmodifiableMap(new LinkedHashMap<>(mutableByViewId)));
        } catch (IOException e) {
            throw new IllegalStateException("Failed to load composition views from " + baseDir, e);
        }
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
        List<Map<String, Object>> mergedRootNodes = CourseProfileCompositionViewMerger.merge(normalizedViews.stream()
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

}
