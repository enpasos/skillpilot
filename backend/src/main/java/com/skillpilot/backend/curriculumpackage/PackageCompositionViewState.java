package com.skillpilot.backend.curriculumpackage;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

/** Immutable, exact composition-view resolver for one active package generation. */
public final class PackageCompositionViewState {

    private static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<>() {
    };

    private final String generationSha256;
    private final Set<String> managedLandscapeIds;
    private final Map<String, View> viewsById;
    private final Map<String, Offering> offeringsById;
    private final Map<OfferingScope, Offering> offeringsByScope;
    private final Map<String, List<Offering>> offeringsByLandscapeId;
    private final Map<String, Offering> defaultOfferingsByLandscapeId;
    private final Map<String, ResolvedView> resolutionsByOfferingId;
    private final Map<String, Map<String, Object>> runtimeDocumentsById;

    private PackageCompositionViewState(
            String generationSha256,
            Set<String> managedLandscapeIds,
            Map<String, View> viewsById,
            Map<String, Offering> offeringsById,
            Map<OfferingScope, Offering> offeringsByScope,
            Map<String, List<Offering>> offeringsByLandscapeId,
            Map<String, Offering> defaultOfferingsByLandscapeId,
            Map<String, ResolvedView> resolutionsByOfferingId,
            Map<String, Map<String, Object>> runtimeDocumentsById) {
        this.generationSha256 = generationSha256;
        this.managedLandscapeIds = Collections.unmodifiableSet(new LinkedHashSet<>(managedLandscapeIds));
        this.viewsById = immutableOrderedMap(viewsById);
        this.offeringsById = immutableOrderedMap(offeringsById);
        this.offeringsByScope = immutableOrderedMap(offeringsByScope);
        this.offeringsByLandscapeId = immutableListMap(offeringsByLandscapeId);
        this.defaultOfferingsByLandscapeId = immutableOrderedMap(defaultOfferingsByLandscapeId);
        this.resolutionsByOfferingId = immutableOrderedMap(resolutionsByOfferingId);
        this.runtimeDocumentsById = immutableOrderedMap(runtimeDocumentsById);
    }

    public static PackageCompositionViewState load(CurriculumRuntimeSnapshot snapshot, ObjectMapper objectMapper) {
        Objects.requireNonNull(snapshot, "snapshot");
        Objects.requireNonNull(objectMapper, "objectMapper");

        Map<String, CurriculumRuntimeSnapshot.PackageDescriptor> packagesById = new LinkedHashMap<>();
        for (CurriculumRuntimeSnapshot.PackageDescriptor descriptor : snapshot.packages()) {
            packagesById.put(descriptor.packageId(), descriptor);
        }
        LandscapeGraph graph = LandscapeGraph.load(snapshot, objectMapper);

        Map<String, View> views = new LinkedHashMap<>();
        for (CurriculumRuntimeSnapshot.ViewDescriptor descriptor : snapshot.viewsById().values()) {
            CurriculumRuntimeSnapshot.PackageDescriptor packageDescriptor = packagesById.get(descriptor.packageId());
            if (packageDescriptor == null) {
                throw failure("View belongs to an unknown package: " + descriptor.viewId());
            }
            validateScope(descriptor.scope(), packageDescriptor, "view " + descriptor.viewId());
            Map<String, Object> document = parseView(descriptor, objectMapper, graph);
            View view = new View(
                    descriptor.packageId(),
                    descriptor.viewId(),
                    descriptor.landscapeId(),
                    descriptor.language(),
                    descriptor.scope(),
                    document);
            putUnique(views, view.viewId(), view, "viewId");
        }

        Map<String, Offering> offerings = new LinkedHashMap<>();
        Map<OfferingScope, Offering> offeringsByScope = new LinkedHashMap<>();
        Map<String, List<Offering>> offeringsByLandscape = new LinkedHashMap<>();
        Map<String, ResolvedView> resolutions = new LinkedHashMap<>();
        Map<String, Map<String, Object>> runtimeDocuments = new LinkedHashMap<>();
        views.forEach((id, view) -> runtimeDocuments.put(id, view.document()));
        Set<String> offeredViewIds = new LinkedHashSet<>();

        for (CurriculumRuntimeSnapshot.OfferingDescriptor descriptor : snapshot.offeringsById().values()) {
            CurriculumRuntimeSnapshot.PackageDescriptor packageDescriptor = packagesById.get(descriptor.packageId());
            if (packageDescriptor == null) {
                throw failure("Offering belongs to an unknown package: " + descriptor.offeringId());
            }
            validateScope(descriptor.scope(), packageDescriptor, "offering " + descriptor.offeringId());
            Offering offering = new Offering(
                    descriptor.packageId(),
                    descriptor.offeringId(),
                    descriptor.landscapeId(),
                    descriptor.scope(),
                    descriptor.resolutionMode(),
                    descriptor.mergeDimension(),
                    descriptor.viewIds());
            validateOffering(offering, views, packageDescriptor);
            putUnique(offerings, offering.offeringId(), offering, "offeringId");
            putUnique(
                    offeringsByScope,
                    new OfferingScope(offering.landscapeId(), offering.scope()),
                    offering,
                    "landscape/scope offering");
            offeringsByLandscape.computeIfAbsent(offering.landscapeId(), ignored -> new ArrayList<>()).add(offering);
            offeredViewIds.addAll(offering.viewIds());

            ResolvedView resolved = resolveOffering(offering, views, graph);
            resolutions.put(offering.offeringId(), resolved);
            Map<String, Object> previous = runtimeDocuments.putIfAbsent(resolved.runtimeViewId(), resolved.document());
            if (previous != null && !previous.equals(resolved.document())) {
                throw failure("Runtime viewId collision: " + resolved.runtimeViewId());
            }
        }
        if (!offeredViewIds.equals(views.keySet())) {
            Set<String> missing = new LinkedHashSet<>(views.keySet());
            missing.removeAll(offeredViewIds);
            throw failure("Composition views are not reachable from an offering: " + missing);
        }

        Map<String, Offering> defaults = new LinkedHashMap<>();
        for (CurriculumRuntimeSnapshot.LandscapeDescriptor landscape : snapshot.landscapesById().values()) {
            if (landscape.defaultOfferingId() == null) {
                continue;
            }
            Offering offering = offerings.get(landscape.defaultOfferingId());
            if (offering == null || !offering.landscapeId().equals(landscape.landscapeId())) {
                throw failure("Invalid default offering for landscape " + landscape.landscapeId());
            }
            defaults.put(landscape.landscapeId(), offering);
        }

        return new PackageCompositionViewState(
                snapshot.generationSha256(),
                snapshot.landscapesById().keySet(),
                views,
                offerings,
                offeringsByScope,
                offeringsByLandscape,
                defaults,
                resolutions,
                runtimeDocuments);
    }

    public String generationSha256() {
        return generationSha256;
    }

    public boolean isManagedLandscape(String landscapeId) {
        return landscapeId != null && managedLandscapeIds.contains(landscapeId.trim());
    }

    public Map<String, View> viewsById() {
        return viewsById;
    }

    public Map<String, Offering> offeringsById() {
        return offeringsById;
    }

    public Map<OfferingScope, Offering> offeringsByScope() {
        return offeringsByScope;
    }

    public Map<String, List<Offering>> offeringsByLandscapeId() {
        return offeringsByLandscapeId;
    }

    public Map<String, Offering> defaultOfferingsByLandscapeId() {
        return defaultOfferingsByLandscapeId;
    }

    public Offering findOffering(String landscapeId, Map<String, String> requestedScope) {
        OfferingScope key = lookupKey(landscapeId, requestedScope);
        return key == null ? null : offeringsByScope.get(key);
    }

    public ResolvedView resolve(String landscapeId, Map<String, String> requestedScope) {
        Offering offering = findOffering(landscapeId, requestedScope);
        return offering == null ? null : resolutionsByOfferingId.get(offering.offeringId());
    }

    public ResolvedView resolveOffering(String offeringId) {
        return offeringId == null ? null : resolutionsByOfferingId.get(offeringId.trim());
    }

    public ResolvedView resolveDefault(String landscapeId) {
        if (landscapeId == null) {
            return null;
        }
        Offering offering = defaultOfferingsByLandscapeId.get(landscapeId.trim());
        return offering == null ? null : resolutionsByOfferingId.get(offering.offeringId());
    }

    public ResolvedView findViewById(String viewId) {
        if (viewId == null) {
            return null;
        }
        String normalized = viewId.trim();
        Map<String, Object> document = runtimeDocumentsById.get(normalized);
        if (document == null) {
            return null;
        }
        View source = viewsById.get(normalized);
        if (source != null) {
            return new ResolvedView(null, "single", List.of(source.viewId()), source.viewId(), source.document());
        }
        return resolutionsByOfferingId.values().stream()
                .filter(resolution -> resolution.runtimeViewId().equals(normalized))
                .findFirst()
                .orElse(null);
    }

    public Map<String, Object> resolveDocument(String landscapeId, Map<String, String> requestedScope) {
        ResolvedView resolved = resolve(landscapeId, requestedScope);
        return resolved == null ? null : resolved.document();
    }

    public Map<String, Object> resolveOfferingDocument(String offeringId) {
        ResolvedView resolved = resolveOffering(offeringId);
        return resolved == null ? null : resolved.document();
    }

    public Map<String, Object> resolveDefaultDocument(String landscapeId) {
        ResolvedView resolved = resolveDefault(landscapeId);
        return resolved == null ? null : resolved.document();
    }

    public Map<String, Object> findViewDocumentById(String viewId) {
        ResolvedView resolved = findViewById(viewId);
        return resolved == null ? null : resolved.document();
    }

    public record View(
            String packageId,
            String viewId,
            String landscapeId,
            String language,
            Map<String, String> scope,
            Map<String, Object> document) {
        public View {
            scope = immutableOrderedMap(scope);
            document = deepFreezeMap(document);
        }
    }

    public record Offering(
            String packageId,
            String offeringId,
            String landscapeId,
            Map<String, String> scope,
            String resolutionMode,
            String mergeDimension,
            List<String> viewIds) {
        public Offering {
            scope = immutableOrderedMap(scope);
            viewIds = List.copyOf(viewIds);
        }
    }

    public record ResolvedView(
            String offeringId,
            String resolutionMode,
            List<String> sourceViewIds,
            String runtimeViewId,
            Map<String, Object> document) {
        public ResolvedView {
            sourceViewIds = List.copyOf(sourceViewIds);
            document = deepFreezeMap(document);
        }
    }

    public record OfferingScope(String landscapeId, Map<String, String> scope) {
        public OfferingScope {
            scope = immutableOrderedMap(scope);
        }
    }

    private static Map<String, Object> parseView(
            CurriculumRuntimeSnapshot.ViewDescriptor descriptor,
            ObjectMapper objectMapper,
            LandscapeGraph graph) {
        if (descriptor.language() == null || descriptor.language().isBlank()) {
            throw failure("Composition view has no language: " + descriptor.viewId());
        }
        Map<String, Object> document;
        try {
            document = objectMapper.readValue(descriptor.json(), MAP_TYPE);
        } catch (JsonProcessingException e) {
            throw failure("Invalid composition view payload " + descriptor.viewId(), e);
        }
        requireExactText(document, "viewId", descriptor.viewId(), descriptor.viewId());
        requireExactText(document, "landscapeId", descriptor.landscapeId(), descriptor.viewId());
        Map<String, String> payloadScope = stringMap(document.get("scope"), "view scope " + descriptor.viewId());
        if (!payloadScope.equals(descriptor.scope())) {
            throw failure("Composition view scope disagrees with its descriptor: " + descriptor.viewId());
        }
        Object roots = document.get("rootNodes");
        if (!(roots instanceof List<?> rootNodes)) {
            throw failure("Composition view rootNodes is not an array: " + descriptor.viewId());
        }
        Set<String> structureIds = new HashSet<>();
        Set<String> visibleGoalIds = new HashSet<>();
        validateNodes(
                rootNodes,
                descriptor.viewId(),
                descriptor.landscapeId(),
                graph,
                structureIds,
                visibleGoalIds,
                "rootNodes");
        return deepFreezeMap(document);
    }

    private static void validateNodes(
            List<?> nodes,
            String viewId,
            String landscapeId,
            LandscapeGraph graph,
            Set<String> structureIds,
            Set<String> visibleGoalIds,
            String path) {
        for (int index = 0; index < nodes.size(); index += 1) {
            Object raw = nodes.get(index);
            if (!(raw instanceof Map<?, ?> node)) {
                throw failure("Composition view node is not an object: " + viewId + " " + path);
            }
            String kind = requiredNodeText(node, "kind", viewId, path + "[" + index + "]");
            switch (kind) {
                case "structure" -> {
                    String id = requiredNodeText(node, "id", viewId, path + "[" + index + "]");
                    if (!structureIds.add(id)) {
                        throw failure("Duplicate structure node id in composition view "
                                + viewId + ": " + id);
                    }
                    Object children = node.get("children");
                    if (!(children instanceof List<?> childNodes)) {
                        throw failure("Structure node has no children array in composition view "
                                + viewId + ": " + id);
                    }
                    validateNodes(
                            childNodes,
                            viewId,
                            landscapeId,
                            graph,
                            structureIds,
                            visibleGoalIds,
                            path + "[" + index + "].children");
                }
                case "canonicalSubtree", "goalEntry" -> {
                    String goalId = requiredNodeText(node, "goalId", viewId, path + "[" + index + "]");
                    if (!graph.isGoalVisibleFrom(landscapeId, goalId)) {
                        throw failure("Composition view references an unknown or foreign goal: "
                                + viewId + " -> " + goalId);
                    }
                    Set<String> expanded = kind.equals("canonicalSubtree")
                            ? graph.goalAndDescendants(goalId)
                            : Set.of(goalId);
                    for (String visibleGoalId : expanded) {
                        if (!graph.isGoalVisibleFrom(landscapeId, visibleGoalId)) {
                            throw failure("Composition view subtree crosses its landscape closure: "
                                    + viewId + " -> " + visibleGoalId);
                        }
                        if (!visibleGoalIds.add(visibleGoalId)) {
                            throw failure("Composition view exposes a goal more than once: "
                                    + viewId + " -> " + visibleGoalId);
                        }
                    }
                }
                case "landscapeEntry" -> {
                    String referencedLandscapeId = requiredNodeText(
                            node, "landscapeId", viewId, path + "[" + index + "]");
                    if (!graph.isLandscapeVisibleFrom(landscapeId, referencedLandscapeId)) {
                        throw failure("Composition view references an unknown or foreign landscape: "
                                + viewId + " -> " + referencedLandscapeId);
                    }
                    Set<String> landscapeGoals = graph.visibleGoalsForLandscape(referencedLandscapeId);
                    if (landscapeGoals.isEmpty()) {
                        throw failure("Composition view landscapeEntry has no resolvable root goal: "
                                + viewId + " -> " + referencedLandscapeId);
                    }
                    for (String visibleGoalId : landscapeGoals) {
                        if (!visibleGoalIds.add(visibleGoalId)) {
                            throw failure("Composition view exposes a goal more than once: "
                                    + viewId + " -> " + visibleGoalId);
                        }
                    }
                }
                default -> throw failure("Unsupported composition view node kind " + kind
                        + " in " + viewId);
            }
        }
    }

    private static void validateOffering(
            Offering offering,
            Map<String, View> views,
            CurriculumRuntimeSnapshot.PackageDescriptor packageDescriptor) {
        List<View> sources = offering.viewIds().stream().map(viewId -> {
            View view = views.get(viewId);
            if (view == null
                    || !view.packageId().equals(offering.packageId())
                    || !view.landscapeId().equals(offering.landscapeId())) {
                throw failure("Offering references an unknown or foreign view: "
                        + offering.offeringId() + " -> " + viewId);
            }
            return view;
        }).toList();
        if (offering.resolutionMode().equals("single")) {
            if (sources.size() != 1 || offering.mergeDimension() != null) {
                throw failure("Invalid single offering: " + offering.offeringId());
            }
            if (!sources.getFirst().scope().equals(offering.scope())) {
                throw failure("Single offering scope disagrees with its view: " + offering.offeringId());
            }
            return;
        }
        if (!offering.resolutionMode().equals("merge")
                || sources.size() < 2
                || offering.mergeDimension() == null) {
            throw failure("Invalid merge offering: " + offering.offeringId());
        }
        CurriculumRuntimeSnapshot.ScopeDimension dimension = packageDescriptor.scopeDimensions().stream()
                .filter(candidate -> candidate.id().equals(offering.mergeDimension()))
                .findFirst()
                .orElseThrow(() -> failure("Unknown merge dimension for offering " + offering.offeringId()));
        String compositeValue = offering.scope().get(offering.mergeDimension());
        CurriculumRuntimeSnapshot.ScopeComposite composite = dimension.composites().stream()
                .filter(candidate -> candidate.value().equals(compositeValue))
                .findFirst()
                .orElseThrow(() -> failure("Merge offering does not use a declared composite: "
                        + offering.offeringId()));
        if (composite.members().size() != sources.size()) {
            throw failure("Merge offering member count disagrees with its composite: " + offering.offeringId());
        }
        for (int index = 0; index < sources.size(); index += 1) {
            Map<String, String> expected = new LinkedHashMap<>(offering.scope());
            expected.put(offering.mergeDimension(), composite.members().get(index));
            if (!sources.get(index).scope().equals(expected)) {
                throw failure("Merge offering view order/scope disagrees with its composite: "
                        + offering.offeringId());
            }
        }
    }

    private static ResolvedView resolveOffering(
            Offering offering,
            Map<String, View> views,
            LandscapeGraph graph) {
        if (offering.resolutionMode().equals("single")) {
            View view = views.get(offering.viewIds().getFirst());
            return new ResolvedView(
                    offering.offeringId(),
                    "single",
                    offering.viewIds(),
                    view.viewId(),
                    view.document());
        }
        List<Map<String, Object>> roots = offering.viewIds().stream()
                .flatMap(viewId -> nodeMaps(views.get(viewId).document().get("rootNodes")).stream())
                .toList();
        String runtimeViewId = "offering-view:" + sha256(
                offering.offeringId() + "\u0000" + String.join("\u0000", offering.viewIds()));
        Map<String, Object> merged = new LinkedHashMap<>();
        merged.put("viewId", runtimeViewId);
        merged.put("landscapeId", offering.landscapeId());
        merged.put("scope", offering.scope());
        merged.put("rootNodes", mergeNodes(roots));
        merged.put("mergedFromViewIds", offering.viewIds());
        validateNodes(
                (List<?>) merged.get("rootNodes"),
                runtimeViewId,
                offering.landscapeId(),
                graph,
                new HashSet<>(),
                new HashSet<>(),
                "rootNodes");
        return new ResolvedView(
                offering.offeringId(),
                "merge",
                offering.viewIds(),
                runtimeViewId,
                merged);
    }

    private static void validateScope(
            Map<String, String> scope,
            CurriculumRuntimeSnapshot.PackageDescriptor descriptor,
            String context) {
        Map<String, CurriculumRuntimeSnapshot.ScopeDimension> dimensions = new HashMap<>();
        descriptor.scopeDimensions().forEach(dimension -> dimensions.put(dimension.id(), dimension));
        for (Map.Entry<String, String> entry : scope.entrySet()) {
            CurriculumRuntimeSnapshot.ScopeDimension dimension = dimensions.get(entry.getKey());
            if (dimension == null || !dimension.values().contains(entry.getValue())) {
                throw failure(context + " uses an undeclared scope value: "
                        + entry.getKey() + "=" + entry.getValue());
            }
        }
    }

    private static OfferingScope lookupKey(String landscapeId, Map<String, String> requestedScope) {
        if (landscapeId == null || landscapeId.isBlank() || requestedScope == null) {
            return null;
        }
        Map<String, String> normalized = new LinkedHashMap<>();
        for (Map.Entry<String, String> entry : requestedScope.entrySet()) {
            if (entry.getKey() == null
                    || entry.getKey().isBlank()
                    || entry.getValue() == null
                    || entry.getValue().isBlank()) {
                return null;
            }
            normalized.put(entry.getKey(), entry.getValue().trim());
        }
        return new OfferingScope(landscapeId.trim(), normalized);
    }

    private static List<Map<String, Object>> mergeNodes(List<Map<String, Object>> nodes) {
        Map<String, List<Map<String, Object>>> grouped = new LinkedHashMap<>();
        for (Map<String, Object> node : nodes) {
            grouped.computeIfAbsent(nodeSignature(node), ignored -> new ArrayList<>()).add(node);
        }
        List<Map<String, Object>> merged = new ArrayList<>();
        for (List<Map<String, Object>> group : grouped.values()) {
            Map<String, Object> first = new LinkedHashMap<>(group.getFirst());
            Map<String, Object> expectedMetadata = withoutChildren(first);
            for (Map<String, Object> candidate : group) {
                if (!withoutChildren(candidate).equals(expectedMetadata)) {
                    throw failure("Conflicting node metadata while merging composition views: "
                            + nodeSignature(first));
                }
            }
            if ("structure".equals(first.get("kind"))) {
                List<Map<String, Object>> children = group.stream()
                        .flatMap(node -> nodeMaps(node.get("children")).stream())
                        .toList();
                first.put("children", mergeNodes(children));
            } else {
                first.remove("children");
            }
            merged.add(deepFreezeMap(first));
        }
        return List.copyOf(merged);
    }

    private static Map<String, Object> withoutChildren(Map<String, Object> node) {
        Map<String, Object> metadata = new LinkedHashMap<>(node);
        metadata.remove("children");
        return metadata;
    }

    private static String nodeSignature(Map<String, Object> node) {
        String kind = String.valueOf(node.getOrDefault("kind", ""));
        return switch (kind) {
            case "structure" -> "structure:" + node.getOrDefault("id", node.getOrDefault("label", ""));
            case "canonicalSubtree", "goalEntry" -> kind + ":" + node.getOrDefault("goalId", "");
            case "landscapeEntry" -> kind + ":" + node.getOrDefault("landscapeId", "");
            default -> kind + ":" + node.hashCode();
        };
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

    private static String requiredNodeText(Map<?, ?> node, String key, String viewId, String path) {
        Object value = node.get(key);
        if (value instanceof String text && !text.isBlank()) {
            return text;
        }
        throw failure("Composition view node has no " + key + ": " + viewId + " " + path);
    }

    private static void requireExactText(Map<String, Object> document, String key, String expected, String context) {
        if (!expected.equals(document.get(key))) {
            throw failure("Composition view " + context + " has an inconsistent " + key);
        }
    }

    private static Map<String, String> stringMap(Object value, String context) {
        if (!(value instanceof Map<?, ?> map)) {
            throw failure(context + " is not an object");
        }
        Map<String, String> result = new LinkedHashMap<>();
        for (Map.Entry<?, ?> entry : map.entrySet()) {
            if (!(entry.getKey() instanceof String key)
                    || !(entry.getValue() instanceof String text)
                    || key.isBlank()
                    || text.isBlank()) {
                throw failure(context + " contains a non-string or blank entry");
            }
            result.put(key, text);
        }
        return result;
    }

    private static String sha256(String text) {
        try {
            return java.util.HexFormat.of().formatHex(
                    MessageDigest.getInstance("SHA-256").digest(text.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 unavailable", e);
        }
    }

    private static CurriculumPackageException failure(String message) {
        return new CurriculumPackageException(message);
    }

    private static CurriculumPackageException failure(String message, Throwable cause) {
        return new CurriculumPackageException(message, cause);
    }

    private static <K, V> void putUnique(Map<K, V> target, K key, V value, String description) {
        if (target.putIfAbsent(key, value) != null) {
            throw failure("Duplicate " + description + ": " + key);
        }
    }

    private static <K, V> Map<K, V> immutableOrderedMap(Map<K, V> source) {
        return Collections.unmodifiableMap(new LinkedHashMap<>(source));
    }

    private static <K, V> Map<K, List<V>> immutableListMap(Map<K, List<V>> source) {
        Map<K, List<V>> copy = new LinkedHashMap<>();
        source.forEach((key, value) -> copy.put(key, List.copyOf(value)));
        return Collections.unmodifiableMap(copy);
    }

    private static Map<String, Object> deepFreezeMap(Map<String, Object> source) {
        Map<String, Object> result = new LinkedHashMap<>();
        source.forEach((key, value) -> result.put(key, deepFreeze(value)));
        return Collections.unmodifiableMap(result);
    }

    private static Object deepFreeze(Object value) {
        if (value instanceof Map<?, ?> raw) {
            Map<String, Object> map = new LinkedHashMap<>();
            raw.forEach((key, child) -> {
                if (key instanceof String text) {
                    map.put(text, deepFreeze(child));
                }
            });
            return Collections.unmodifiableMap(map);
        }
        if (value instanceof List<?> list) {
            return List.copyOf(list.stream().map(PackageCompositionViewState::deepFreeze).toList());
        }
        return value;
    }

    private record LandscapeGraph(
            Map<String, Set<String>> rootGoalIdsByLandscape,
            Map<String, String> landscapeByGoalId,
            Map<String, List<String>> containsByGoalId,
            Map<String, String> parentByLandscapeId) {

        private static LandscapeGraph load(CurriculumRuntimeSnapshot snapshot, ObjectMapper objectMapper) {
            Map<String, Set<String>> rootGoalIdsByLandscape = new LinkedHashMap<>();
            Map<String, String> landscapeByGoal = new LinkedHashMap<>();
            Map<String, List<String>> contains = new LinkedHashMap<>();
            Map<String, String> parents = new LinkedHashMap<>();
            for (CurriculumRuntimeSnapshot.LandscapeDescriptor descriptor : snapshot.landscapesById().values()) {
                JsonNode document;
                try {
                    document = objectMapper.readTree(descriptor.json());
                } catch (JsonProcessingException e) {
                    throw failure("Invalid landscape while compiling composition views: "
                            + descriptor.landscapeId(), e);
                }
                JsonNode goals = document.get("goals");
                if (goals == null || !goals.isArray()) {
                    throw failure("Landscape has no goals array: " + descriptor.landscapeId());
                }
                Set<String> ids = new LinkedHashSet<>();
                Set<String> rootIds = new LinkedHashSet<>();
                for (JsonNode goal : goals) {
                    JsonNode idNode = goal.get("id");
                    if (idNode == null || !idNode.isTextual() || idNode.textValue().isBlank()) {
                        throw failure("Landscape contains a goal without id: " + descriptor.landscapeId());
                    }
                    String goalId = idNode.textValue();
                    if (!ids.add(goalId) || landscapeByGoal.putIfAbsent(goalId, descriptor.landscapeId()) != null) {
                        throw failure("Ambiguous goal while compiling composition views: " + goalId);
                    }
                    List<String> children = new ArrayList<>();
                    JsonNode containsNode = goal.get("contains");
                    if (containsNode != null && containsNode.isArray()) {
                        for (JsonNode child : containsNode) {
                            if (child.isTextual()) {
                                children.add(localId(child.textValue()));
                            }
                        }
                    }
                    contains.put(goalId, List.copyOf(children));
                    JsonNode tags = goal.get("tags");
                    if (tags != null && tags.isArray()) {
                        for (JsonNode tag : tags) {
                            if (tag.isTextual() && tag.textValue().equals("root")) {
                                rootIds.add(goalId);
                            }
                        }
                    }
                }
                rootGoalIdsByLandscape.put(
                        descriptor.landscapeId(), Collections.unmodifiableSet(rootIds));
                if (descriptor.parentLandscapeId() != null) {
                    parents.put(descriptor.landscapeId(), descriptor.parentLandscapeId());
                }
            }
            return new LandscapeGraph(
                    immutableOrderedMap(rootGoalIdsByLandscape),
                    immutableOrderedMap(landscapeByGoal),
                    immutableOrderedMap(contains),
                    immutableOrderedMap(parents));
        }

        private boolean isGoalVisibleFrom(String landscapeId, String goalId) {
            String owner = landscapeByGoalId.get(localId(goalId));
            return owner != null && isLandscapeVisibleFrom(landscapeId, owner);
        }

        private boolean isLandscapeVisibleFrom(String landscapeId, String candidate) {
            String current = candidate;
            Set<String> visited = new HashSet<>();
            while (current != null && visited.add(current)) {
                if (current.equals(landscapeId)) {
                    return true;
                }
                current = parentByLandscapeId.get(current);
            }
            return false;
        }

        private Set<String> visibleGoalsForLandscape(String landscapeId) {
            return rootGoalIdsByLandscape.getOrDefault(landscapeId, Set.of()).stream()
                    .findFirst()
                    .map(this::goalAndDescendants)
                    .orElseGet(Set::of);
        }

        private Set<String> goalAndDescendants(String goalId) {
            Set<String> result = new LinkedHashSet<>();
            collect(localId(goalId), result, new HashSet<>());
            return result;
        }

        private void collect(String goalId, Set<String> result, Set<String> visiting) {
            if (!visiting.add(goalId)) {
                throw failure("Contains cycle while compiling composition view goal " + goalId);
            }
            result.add(goalId);
            for (String child : containsByGoalId.getOrDefault(goalId, List.of())) {
                if (!landscapeByGoalId.containsKey(child)) {
                    throw failure("Unknown contains target while compiling composition views: " + child);
                }
                collect(child, result, visiting);
            }
            visiting.remove(goalId);
        }

        private static String localId(String reference) {
            int separator = reference.indexOf(':');
            return separator >= 0 ? reference.substring(separator + 1) : reference;
        }
    }
}
