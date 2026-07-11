package com.skillpilot.backend.curriculumpackage;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.CurriculumCatalogResponse;
import com.skillpilot.backend.api.CurriculumSourceEvidenceResponse;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.landscape.LearningLandscape;
import com.skillpilot.backend.landscape.ResolvedGoalMapping;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * Immutable, generation-bound source-evidence projection for lazy goal lookups.
 *
 * <p>The state reads only the exact manifest-bound evidence artifact. It joins that artifact to
 * the already verified package-local mapping and official-source state, validates every count,
 * source-text hash and cross-reference, and exposes no package path.</p>
 */
public final class PackageSourceEvidenceState {

    static final long MAX_SOURCE_EVIDENCE_BYTES = 64L * 1024L * 1024L;

    private static final String SOURCE_GOAL_REFERENCE_ROLE = "source-goal-reference-index";
    private static final String SOURCE_GOAL_REFERENCE_SCHEMA =
            "https://skillpilot.com/schemas/curriculum-package/v1/source-goal-reference-index.schema.json";
    private static final String FORMAT_VERSION = "1.0";
    private static final String API_PREFIX = "/api/ui/curriculum-source-evidence/packages/";
    private static final Pattern STABLE_ID = Pattern.compile("^[A-Za-z0-9][A-Za-z0-9._:+-]*$");
    private static final Pattern JURISDICTION = Pattern.compile("^DE-[A-Z]{2}$");
    private static final Pattern SHA256 = Pattern.compile("^[a-f0-9]{64}$");
    private static final Pattern SHA256_DIGEST = Pattern.compile("^sha256:[a-f0-9]{64}$");
    private static final Set<String> CLASSIFICATION_FIELDS = Set.of(
            "granularity", "category", "stage", "phase", "courseLevel", "grade", "area", "level");

    private static final Comparator<EvidenceRoute> ROUTE_ORDER = Comparator
            .comparingInt((EvidenceRoute route) -> "exact".equals(route.matchType()) ? 0 : 1)
            .thenComparingInt(EvidenceRoute::mappingOrder);

    private final String generationSha256;
    private final Map<PackageRouteKey, PackageBinding> packagesByRoute;
    private final List<Discovery> discoveries;

    private PackageSourceEvidenceState(
            String generationSha256,
            Map<PackageRouteKey, PackageBinding> packagesByRoute,
            List<Discovery> discoveries) {
        this.generationSha256 = generationSha256;
        this.packagesByRoute = immutableOrderedMap(packagesByRoute);
        this.discoveries = List.copyOf(discoveries);
    }

    public static PackageSourceEvidenceState load(
            CurriculumRuntimeSnapshot snapshot,
            PackageCurriculumDomainState domainState,
            CurriculumPackageArtifactReader artifactReader,
            ObjectMapper objectMapper) {
        Objects.requireNonNull(snapshot, "snapshot");
        Objects.requireNonNull(domainState, "domainState");
        Objects.requireNonNull(artifactReader, "artifactReader");
        ObjectMapper strictMapper = CurriculumPackageJson.strictCopy(
                Objects.requireNonNull(objectMapper, "objectMapper"));
        if (!snapshot.generationSha256().equals(domainState.generationSha256())) {
            throw failure("Source evidence and curriculum domain generations differ");
        }

        Map<String, PackageLandscapeMappingState> mappingStates = new LinkedHashMap<>();
        for (PackageLandscapeMappingState state : domainState.mappingState().packageStates()) {
            putUnique(mappingStates, state.packageId(), state, "package mapping state");
        }

        Map<PackageRouteKey, PackageBinding> bindings = new LinkedHashMap<>();
        List<Discovery> discoveries = new ArrayList<>();
        for (CurriculumRuntimeSnapshot.PackageDescriptor packageDescriptor : snapshot.packages()) {
            String packageId = requireStableId(packageDescriptor.packageId(), "packageId");
            String packageVersion = requireStableId(packageDescriptor.packageVersion(), "packageVersion");
            PackageLandscapeMappingState mappingState = mappingStates.get(packageId);
            if (mappingState == null) {
                throw failure("Source evidence has no package-local mapping state: " + packageId);
            }
            String targetLandscapeId = mappingState.targetLandscapeId();
            Set<String> knownGoalIds = collectKnownGoalIds(
                    snapshot, domainState, packageId, targetLandscapeId);
            Optional<CurriculumRuntimeSnapshot.Artifact> artifact = findSourceGoalArtifact(
                    snapshot, packageId, targetLandscapeId);
            PackageBinding binding;
            if (artifact.isEmpty()) {
                binding = new PackageBinding(
                        targetLandscapeId,
                        knownGoalIds,
                        Map.of(),
                        Map.of(),
                        null);
            } else {
                byte[] bytes = artifactReader.readVerified(
                        artifact.get(), MAX_SOURCE_EVIDENCE_BYTES);
                binding = compilePackage(
                        strictMapper,
                        snapshot.generationSha256(),
                        packageId,
                        packageVersion,
                        targetLandscapeId,
                        mappingState,
                        knownGoalIds,
                        artifact.get(),
                        bytes);
            }
            PackageRouteKey key = new PackageRouteKey(packageId, packageVersion);
            putUnique(bindings, key, binding, "source-evidence package route");
            if (binding.discovery() != null) {
                discoveries.add(binding.discovery());
            }
        }
        if (!mappingStates.keySet().equals(snapshot.packages().stream()
                .map(CurriculumRuntimeSnapshot.PackageDescriptor::packageId)
                .collect(java.util.stream.Collectors.toCollection(LinkedHashSet::new)))) {
            throw failure("Source evidence and package mapping-state sets differ");
        }
        return new PackageSourceEvidenceState(snapshot.generationSha256(), bindings, discoveries);
    }

    public String generationSha256() {
        return generationSha256;
    }

    public List<Discovery> discoveries() {
        return discoveries;
    }

    public List<CurriculumCatalogResponse.SourceEvidenceEntry> catalogEntries() {
        return discoveries.stream()
                .map(discovery -> new CurriculumCatalogResponse.SourceEvidenceEntry(
                        discovery.packageId(),
                        discovery.packageVersion(),
                        discovery.targetLandscapeId(),
                        discovery.sourceCollectionCount(),
                        discovery.sourceDocumentCount(),
                        discovery.sourceGoalCount(),
                        discovery.mappingEdgeCount(),
                        discovery.goals().stream()
                                .map(goal -> new CurriculumCatalogResponse.SourceEvidenceGoalEntry(
                                        goal.goalId(), goal.jurisdictions()))
                                .toList(),
                        discovery.href()))
                .toList();
    }

    public boolean containsPackageVersion(String packageId, String packageVersion) {
        return packagesByRoute.containsKey(new PackageRouteKey(packageId, packageVersion));
    }

    public boolean containsGoal(String packageId, String packageVersion, String goalId) {
        PackageBinding binding = packagesByRoute.get(new PackageRouteKey(packageId, packageVersion));
        return binding != null && binding.knownGoalIds().contains(goalId);
    }

    /** Resolves one deterministic route, preferring exact mappings before partial mappings. */
    public Optional<ResolvedEvidence> resolve(
            String packageId,
            String packageVersion,
            String goalId,
            String jurisdiction) {
        PackageBinding binding = packagesByRoute.get(new PackageRouteKey(packageId, packageVersion));
        if (binding == null || !binding.knownGoalIds().contains(goalId)) {
            return Optional.empty();
        }
        EvidenceRoute route = jurisdiction == null
                ? binding.defaultRoutesByGoalId().get(goalId)
                : binding.routesByGoalJurisdiction().get(new GoalJurisdictionKey(goalId, jurisdiction));
        if (route == null) {
            return Optional.empty();
        }
        CurriculumSourceEvidenceResponse response = new CurriculumSourceEvidenceResponse(
                generationSha256,
                packageId,
                packageVersion,
                binding.targetLandscapeId(),
                goalId,
                route.jurisdiction(),
                route.matchType(),
                route.sourceCollection(),
                route.sourceGoal(),
                route.sourceDocument());
        return Optional.of(new ResolvedEvidence(response, route.etagSha256()));
    }

    /** HTTP-neutral lookup result with explicit invalid, unknown and empty states. */
    public LookupResult lookup(
            String packageId,
            String packageVersion,
            String goalId,
            String requestedGenerationSha256,
            String jurisdiction) {
        if (!isStableId(packageId)
                || !isStableId(packageVersion)
                || !isStableId(goalId)
                || requestedGenerationSha256 == null
                || !SHA256.matcher(requestedGenerationSha256).matches()
                || (jurisdiction != null && !JURISDICTION.matcher(jurisdiction).matches())) {
            return new LookupResult(LookupStatus.INVALID, null, null);
        }
        if (!generationSha256.equals(requestedGenerationSha256)) {
            return new LookupResult(LookupStatus.NOT_FOUND, null, null);
        }
        if (!containsPackageVersion(packageId, packageVersion)
                || !containsGoal(packageId, packageVersion, goalId)) {
            return new LookupResult(LookupStatus.NOT_FOUND, null, null);
        }
        Optional<ResolvedEvidence> resolved = resolve(
                packageId, packageVersion, goalId, jurisdiction);
        if (resolved.isEmpty()) {
            return new LookupResult(LookupStatus.NO_CONTENT, null, null);
        }
        ResolvedEvidence evidence = resolved.get();
        return new LookupResult(
                LookupStatus.FOUND, evidence.response(), evidence.etagSha256());
    }

    private static PackageBinding compilePackage(
            ObjectMapper objectMapper,
            String generationSha256,
            String packageId,
            String packageVersion,
            String targetLandscapeId,
            PackageLandscapeMappingState mappingState,
            Set<String> knownGoalIds,
            CurriculumRuntimeSnapshot.Artifact sourceGoalArtifact,
            byte[] sourceGoalBytes) {
        JsonNode root = parse(objectMapper, sourceGoalBytes, "source-goal reference index");
        requireObject(root, "source-goal reference index");
        requireFields(
                root,
                Set.of(
                        "$schema",
                        "sourceGoalReferenceFormatVersion",
                        "targetLandscapeId",
                        "sourceCollectionCount",
                        "sourceGoalCount",
                        "collections"),
                "source-goal reference index");
        requireExactText(root, "$schema", SOURCE_GOAL_REFERENCE_SCHEMA, "source-goal reference index");
        requireExactText(root, "sourceGoalReferenceFormatVersion", FORMAT_VERSION,
                "source-goal reference index");
        requireEqual(targetLandscapeId,
                requireStableId(root, "targetLandscapeId", "source-goal reference index"),
                "source-goal reference targetLandscapeId");
        int declaredCollectionCount = requireInteger(
                root, "sourceCollectionCount", 1, 1_000, "source-goal reference index");
        int declaredGoalCount = requireInteger(
                root, "sourceGoalCount", 1, 1_000_000, "source-goal reference index");
        JsonNode collections = requireArray(
                root, "collections", 1, 1_000, "source-goal reference index");
        requireCount(declaredCollectionCount, collections.size(), "sourceCollectionCount");
        if (declaredCollectionCount != mappingState.sourceCollectionCount()) {
            throw failure("Source-goal and official-source collection counts differ");
        }

        Map<String, SourceGoalBinding> sourceGoalsById = new LinkedHashMap<>();
        Set<String> consumedSourceCollectionIds = new LinkedHashSet<>();
        int actualGoalCount = 0;
        for (int collectionIndex = 0; collectionIndex < collections.size(); collectionIndex++) {
            JsonNode collection = collections.get(collectionIndex);
            String context = "source-goal collections[" + collectionIndex + "]";
            requireObject(collection, context);
            requireFields(
                    collection,
                    Set.of("sourceCollectionId", "sourceLandscapeId", "sourceGoalCount", "sourceGoals"),
                    context);
            String sourceCollectionId = requireStableId(collection, "sourceCollectionId", context);
            String sourceLandscapeId = requireStableId(collection, "sourceLandscapeId", context);
            if (!consumedSourceCollectionIds.add(sourceCollectionId)) {
                throw failure("Duplicate source-goal sourceCollectionId: " + sourceCollectionId);
            }
            PackageLandscapeMappingState.CollectionProvenance provenance =
                    mappingState.collectionProvenanceBySourceCollectionId().get(sourceCollectionId);
            if (provenance == null) {
                throw failure("Source-goal collection is absent from the official source index: "
                        + sourceCollectionId);
            }
            requireEqual(provenance.sourceLandscapeId(), sourceLandscapeId,
                    context + ".sourceLandscapeId");
            int declaredCollectionGoalCount = requireInteger(
                    collection, "sourceGoalCount", 1, 1_000_000, context);
            JsonNode sourceGoals = requireArray(collection, "sourceGoals", 1, 1_000_000, context);
            requireCount(declaredCollectionGoalCount, sourceGoals.size(), context + ".sourceGoalCount");
            Map<String, PackageLandscapeMappingState.SourceDocument> documentsById = new LinkedHashMap<>();
            for (PackageLandscapeMappingState.SourceDocument document : provenance.documents()) {
                putUnique(documentsById, document.sourceDocumentId(), document,
                        context + " sourceDocumentId");
            }
            for (int goalIndex = 0; goalIndex < sourceGoals.size(); goalIndex++) {
                JsonNode sourceGoalNode = sourceGoals.get(goalIndex);
                SourceGoalBinding sourceGoal = parseSourceGoal(
                        sourceGoalNode,
                        context + ".sourceGoals[" + goalIndex + "]",
                        sourceCollectionId,
                        sourceLandscapeId,
                        provenance,
                        documentsById);
                putUnique(sourceGoalsById, sourceGoal.sourceGoal().sourceGoalId(), sourceGoal,
                        "sourceGoalId");
            }
            actualGoalCount = addExact(actualGoalCount, sourceGoals.size(), "sourceGoalCount");
        }
        requireCount(declaredGoalCount, actualGoalCount, "sourceGoalCount");
        if (!consumedSourceCollectionIds.equals(
                mappingState.collectionProvenanceBySourceCollectionId().keySet())) {
            throw failure("Source-goal and official-source collection sets differ");
        }
        if (!sourceGoalsById.keySet().equals(mappingState.mappingsBySourceGoalId().keySet())) {
            Set<String> missingReferences = new LinkedHashSet<>(mappingState.mappingsBySourceGoalId().keySet());
            missingReferences.removeAll(sourceGoalsById.keySet());
            Set<String> unmappedReferences = new LinkedHashSet<>(sourceGoalsById.keySet());
            unmappedReferences.removeAll(mappingState.mappingsBySourceGoalId().keySet());
            throw failure("Source-goal/mapping cross-reference sets differ; missing="
                    + missingReferences.size() + ", unmapped=" + unmappedReferences.size());
        }

        List<EvidenceRoute> routes = new ArrayList<>(mappingState.mappingEdgeCount());
        String evidenceArtifactBinding = sourceGoalArtifact.sha256();
        int mappingOrder = 0;
        for (ResolvedGoalMapping mapping : mappingState.mappings()) {
            SourceGoalBinding sourceGoal = sourceGoalsById.get(mapping.legacyGoalId());
            if (sourceGoal == null) {
                throw failure("Mapping references an unknown sourceGoalId after cross-reference validation");
            }
            requireEqual(sourceGoal.sourceCollection().sourceLandscapeId(), mapping.sourceLandscapeId(),
                    "sourceGoal/mapping sourceLandscapeId");
            requireEqual(targetLandscapeId, mapping.targetLandscapeId(),
                    "sourceGoal/mapping targetLandscapeId");
            if (!knownGoalIds.contains(mapping.canonicalGoalId())) {
                throw failure("Source evidence maps to a goal outside its package: "
                        + mapping.canonicalGoalId());
            }
            String etag = routeEtag(
                    generationSha256,
                    evidenceArtifactBinding,
                    packageId,
                    packageVersion,
                    mapping.canonicalGoalId(),
                    sourceGoal.jurisdiction(),
                    mapping.matchType(),
                    sourceGoal.sourceGoal().sourceGoalId(),
                    sourceGoal.sourceDocument().sourceDocumentId());
            routes.add(new EvidenceRoute(
                    mapping.canonicalGoalId(),
                    sourceGoal.jurisdiction(),
                    mapping.matchType(),
                    sourceGoal.sourceCollection(),
                    sourceGoal.sourceGoal(),
                    sourceGoal.sourceDocument(),
                    etag,
                    mappingOrder++));
        }
        if (routes.size() != mappingState.mappingEdgeCount()) {
            throw failure("Source-evidence route count differs from mappingEdgeCount");
        }

        Map<GoalJurisdictionKey, EvidenceRoute> routesByGoalJurisdiction = new LinkedHashMap<>();
        Map<String, EvidenceRoute> defaultRoutesByGoalId = new LinkedHashMap<>();
        Map<String, Set<String>> jurisdictionsByGoalId = new LinkedHashMap<>();
        routes.stream().sorted(ROUTE_ORDER).forEach(route -> {
            routesByGoalJurisdiction.putIfAbsent(
                    new GoalJurisdictionKey(route.goalId(), route.jurisdiction()), route);
            defaultRoutesByGoalId.putIfAbsent(route.goalId(), route);
            jurisdictionsByGoalId
                    .computeIfAbsent(route.goalId(), ignored -> new java.util.TreeSet<>())
                    .add(route.jurisdiction());
        });

        List<GoalDiscovery> goals = jurisdictionsByGoalId.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> new GoalDiscovery(entry.getKey(), List.copyOf(entry.getValue())))
                .toList();
        String href = API_PREFIX + packageId + "/" + packageVersion + "/goals";
        Discovery discovery = new Discovery(
                packageId,
                packageVersion,
                targetLandscapeId,
                declaredCollectionCount,
                mappingState.sourceDocumentCount(),
                declaredGoalCount,
                mappingState.mappingEdgeCount(),
                goals,
                href);
        return new PackageBinding(
                targetLandscapeId,
                knownGoalIds,
                routesByGoalJurisdiction,
                defaultRoutesByGoalId,
                discovery);
    }

    private static SourceGoalBinding parseSourceGoal(
            JsonNode node,
            String context,
            String sourceCollectionId,
            String sourceLandscapeId,
            PackageLandscapeMappingState.CollectionProvenance provenance,
            Map<String, PackageLandscapeMappingState.SourceDocument> documentsById) {
        requireObject(node, context);
        requireFields(
                node,
                Set.of(
                        "sourceGoalId",
                        "sourceDocumentId",
                        "title",
                        "description",
                        "sourceText",
                        "sourceTextSha256",
                        "parentBulletText",
                        "locator",
                        "classification",
                        "lineage"),
                Set.of(
                        "sourceGoalId",
                        "sourceDocumentId",
                        "title",
                        "description",
                        "sourceText",
                        "sourceTextSha256",
                        "locator"),
                context);
        String sourceGoalId = requireStableId(node, "sourceGoalId", context);
        String sourceDocumentId = requireStableId(node, "sourceDocumentId", context);
        PackageLandscapeMappingState.SourceDocument sourceDocument = documentsById.get(sourceDocumentId);
        if (sourceDocument == null) {
            throw failure(context + " references a sourceDocumentId outside its source collection: "
                    + sourceDocumentId);
        }
        String title = requireNonBlankText(node, "title", 20_000, context);
        String description = requireNonBlankText(node, "description", 20_000, context);
        String sourceText = requireNonBlankText(node, "sourceText", 20_000, context);
        String sourceTextSha256 = requireMatchingText(
                node, "sourceTextSha256", SHA256_DIGEST, 71, context);
        String actualSourceTextSha256 = "sha256:" + CurriculumPackageFileReader.sha256(
                sourceText.getBytes(StandardCharsets.UTF_8));
        requireEqual(sourceTextSha256, actualSourceTextSha256, context + ".sourceTextSha256");
        String parentBulletText = optionalNonBlankText(node, "parentBulletText", 20_000, context);
        CurriculumSourceEvidenceResponse.SourceLocator locator = parseLocator(
                requireNode(node, "locator", context), context + ".locator");
        CurriculumSourceEvidenceResponse.SourceClassification classification = node.has("classification")
                ? parseClassification(node.get("classification"), context + ".classification")
                : null;
        CurriculumSourceEvidenceResponse.SourceLineage lineage = node.has("lineage")
                ? parseLineage(node.get("lineage"), context + ".lineage")
                : null;
        CurriculumSourceEvidenceResponse.SourceCollection sourceCollection =
                new CurriculumSourceEvidenceResponse.SourceCollection(
                        sourceCollectionId,
                        sourceLandscapeId,
                        provenance.subject(),
                        provenance.stage(),
                        provenance.durationModels());
        CurriculumSourceEvidenceResponse.SourceGoal sourceGoal =
                new CurriculumSourceEvidenceResponse.SourceGoal(
                        sourceGoalId,
                        title,
                        description,
                        sourceText,
                        sourceTextSha256,
                        parentBulletText,
                        locator,
                        classification,
                        lineage);
        CurriculumSourceEvidenceResponse.SourceDocument responseDocument =
                new CurriculumSourceEvidenceResponse.SourceDocument(
                        sourceDocument.sourceDocumentId(),
                        sourceDocument.sourceKey(),
                        sourceDocument.title(),
                        sourceDocument.role(),
                        sourceDocument.semanticType(),
                        sourceDocument.url(),
                        sourceDocument.landingUrl(),
                        sourceDocument.durationModel());
        return new SourceGoalBinding(
                provenance.jurisdiction(), sourceCollection, sourceGoal, responseDocument);
    }

    private static CurriculumSourceEvidenceResponse.SourceLocator parseLocator(
            JsonNode node, String context) {
        requireObject(node, context);
        requireFields(
                node,
                Set.of("passageId", "topicCode", "sourceSpan", "sourceRef", "sourcePage", "sourceLine"),
                Set.of("passageId", "topicCode", "sourceSpan", "sourceRef"),
                context);
        return new CurriculumSourceEvidenceResponse.SourceLocator(
                requireNonBlankText(node, "passageId", 20_000, context),
                requireNonBlankText(node, "topicCode", 20_000, context),
                requireNonBlankText(node, "sourceSpan", 20_000, context),
                requireNonBlankText(node, "sourceRef", 20_000, context),
                optionalInteger(node, "sourcePage", 0, Integer.MAX_VALUE, context),
                optionalInteger(node, "sourceLine", 0, Integer.MAX_VALUE, context));
    }

    private static CurriculumSourceEvidenceResponse.SourceClassification parseClassification(
            JsonNode node, String context) {
        requireObject(node, context);
        requireFields(node, CLASSIFICATION_FIELDS, Set.of(), context);
        if (node.isEmpty()) {
            throw failure(context + " must contain at least one field");
        }
        return new CurriculumSourceEvidenceResponse.SourceClassification(
                optionalNonBlankText(node, "granularity", 20_000, context),
                optionalNonBlankText(node, "category", 20_000, context),
                optionalNonBlankText(node, "stage", 20_000, context),
                optionalNonBlankText(node, "phase", 20_000, context),
                optionalNonBlankText(node, "courseLevel", 20_000, context),
                optionalNonBlankText(node, "grade", 20_000, context),
                optionalNonBlankText(node, "area", 20_000, context),
                optionalNonBlankText(node, "level", 20_000, context));
    }

    private static CurriculumSourceEvidenceResponse.SourceLineage parseLineage(
            JsonNode node, String context) {
        requireObject(node, context);
        requireFields(node, Set.of("splitFromSourceGoalId", "splitIndex", "splitPartCount"), context);
        int splitIndex = requireInteger(node, "splitIndex", 1, Integer.MAX_VALUE, context);
        int splitPartCount = requireInteger(node, "splitPartCount", 1, Integer.MAX_VALUE, context);
        if (splitIndex > splitPartCount) {
            throw failure(context + ".splitIndex exceeds splitPartCount");
        }
        return new CurriculumSourceEvidenceResponse.SourceLineage(
                requireStableId(node, "splitFromSourceGoalId", context),
                splitIndex,
                splitPartCount);
    }

    private static Set<String> collectKnownGoalIds(
            CurriculumRuntimeSnapshot snapshot,
            PackageCurriculumDomainState domainState,
            String packageId,
            String targetLandscapeId) {
        CurriculumRuntimeSnapshot.LandscapeDescriptor descriptor =
                snapshot.landscapesById().get(targetLandscapeId);
        if (descriptor == null || !packageId.equals(descriptor.packageId())) {
            throw failure("Source evidence target landscape is outside its package: " + targetLandscapeId);
        }
        LearningLandscape landscape = domainState.landscapesById().get(targetLandscapeId);
        if (landscape == null || landscape.getGoals() == null) {
            throw failure("Source evidence target landscape has no typed goals: " + targetLandscapeId);
        }
        Set<String> goalIds = new LinkedHashSet<>();
        for (LearningGoal goal : landscape.getGoals()) {
            if (!goalIds.add(goal.getId())) {
                throw failure("Duplicate target-landscape source-evidence goalId: " + goal.getId());
            }
        }
        return Collections.unmodifiableSet(goalIds);
    }

    private static Optional<CurriculumRuntimeSnapshot.Artifact> findSourceGoalArtifact(
            CurriculumRuntimeSnapshot snapshot,
            String packageId,
            String targetLandscapeId) {
        List<CurriculumRuntimeSnapshot.Artifact> matches = snapshot.artifactsByRole()
                .getOrDefault(SOURCE_GOAL_REFERENCE_ROLE, List.of())
                .stream()
                .filter(artifact -> packageId.equals(artifact.packageId()))
                .toList();
        if (matches.size() > 1) {
            throw failure("Package contains more than one source-goal-reference-index artifact: "
                    + packageId);
        }
        if (matches.isEmpty()) {
            return Optional.empty();
        }
        CurriculumRuntimeSnapshot.Artifact artifact = matches.getFirst();
        if (!"application/json".equals(artifact.mediaType())
                || artifact.runtimeRequired()
                || !"logical-artifact".equals(artifact.semanticBindingKind())
                || !SOURCE_GOAL_REFERENCE_ROLE.equals(artifact.normalizationRole())
                || !(targetLandscapeId + ":source-goal-references").equals(artifact.logicalId())
                || !SOURCE_GOAL_REFERENCE_SCHEMA.equals(artifact.validationSchemaId())) {
            throw failure("Package source-goal-reference artifact has an invalid semantic binding: "
                    + packageId);
        }
        if (artifact.bytes() > MAX_SOURCE_EVIDENCE_BYTES) {
            throw failure("Package source-goal-reference artifact exceeds the runtime byte limit: "
                    + packageId);
        }
        return Optional.of(artifact);
    }

    private static String routeEtag(String... components) {
        return CurriculumPackageFileReader.sha256(
                String.join("\u0000", components).getBytes(StandardCharsets.UTF_8));
    }

    private static JsonNode parse(ObjectMapper objectMapper, byte[] bytes, String context) {
        try {
            return objectMapper.readTree(bytes);
        } catch (IOException e) {
            throw failure("Cannot parse " + context, e);
        }
    }

    private static void requireObject(JsonNode node, String context) {
        if (node == null || !node.isObject()) {
            throw failure(context + " must be an object");
        }
    }

    private static JsonNode requireNode(JsonNode object, String field, String context) {
        JsonNode node = object.get(field);
        if (node == null || node.isNull()) {
            throw failure(context + "." + field + " is required");
        }
        return node;
    }

    private static void requireFields(JsonNode object, Set<String> exactFields, String context) {
        requireFields(object, exactFields, exactFields, context);
    }

    private static void requireFields(
            JsonNode object, Set<String> allowedFields, Set<String> requiredFields, String context) {
        Set<String> actual = new HashSet<>();
        object.fieldNames().forEachRemaining(actual::add);
        if (!allowedFields.containsAll(actual)) {
            Set<String> unexpected = new LinkedHashSet<>(actual);
            unexpected.removeAll(allowedFields);
            throw failure(context + " has unexpected fields: " + unexpected);
        }
        if (!actual.containsAll(requiredFields)) {
            Set<String> missing = new LinkedHashSet<>(requiredFields);
            missing.removeAll(actual);
            throw failure(context + " is missing fields: " + missing);
        }
    }

    private static JsonNode requireArray(
            JsonNode object, String field, int minimum, int maximum, String context) {
        JsonNode node = requireNode(object, field, context);
        if (!node.isArray() || node.size() < minimum || node.size() > maximum) {
            throw failure(context + "." + field + " must be an array with "
                    + minimum + ".." + maximum + " items");
        }
        return node;
    }

    private static String requireStableId(JsonNode object, String field, String context) {
        return requireStableId(requireText(object, field, context), context + "." + field);
    }

    private static String requireStableId(String value, String context) {
        if (!isStableId(value)) {
            throw failure(context + " is not a stable identifier");
        }
        return value;
    }

    private static boolean isStableId(String value) {
        return value != null && value.length() <= 300 && STABLE_ID.matcher(value).matches();
    }

    private static String requireText(JsonNode object, String field, String context) {
        JsonNode node = requireNode(object, field, context);
        if (!node.isTextual()) {
            throw failure(context + "." + field + " must be text");
        }
        return node.textValue();
    }

    private static String requireNonBlankText(
            JsonNode object, String field, int maximumLength, String context) {
        String value = requireText(object, field, context);
        if (value.isBlank() || !value.equals(value.strip()) || value.length() > maximumLength) {
            throw failure(context + "." + field + " must be bounded non-blank text");
        }
        return value;
    }

    private static String optionalNonBlankText(
            JsonNode object, String field, int maximumLength, String context) {
        if (!object.has(field)) {
            return null;
        }
        return requireNonBlankText(object, field, maximumLength, context);
    }

    private static String requireMatchingText(
            JsonNode object, String field, Pattern pattern, int maximumLength, String context) {
        String value = requireText(object, field, context);
        if (value.length() > maximumLength || !pattern.matcher(value).matches()) {
            throw failure(context + "." + field + " has an invalid format");
        }
        return value;
    }

    private static void requireExactText(
            JsonNode object, String field, String expected, String context) {
        requireEqual(expected, requireText(object, field, context), context + "." + field);
    }

    private static int requireInteger(
            JsonNode object, String field, int minimum, int maximum, String context) {
        JsonNode node = requireNode(object, field, context);
        if (!node.isIntegralNumber() || !node.canConvertToInt()) {
            throw failure(context + "." + field + " must be an integer");
        }
        int value = node.intValue();
        if (value < minimum || value > maximum) {
            throw failure(context + "." + field + " is outside the allowed range");
        }
        return value;
    }

    private static Integer optionalInteger(
            JsonNode object, String field, int minimum, int maximum, String context) {
        return object.has(field) ? requireInteger(object, field, minimum, maximum, context) : null;
    }

    private static void requireCount(int declared, int actual, String context) {
        if (declared != actual) {
            throw failure(context + " count mismatch: declared=" + declared + ", actual=" + actual);
        }
    }

    private static int addExact(int left, int right, String context) {
        try {
            return Math.addExact(left, right);
        } catch (ArithmeticException e) {
            throw failure(context + " exceeds the supported integer range", e);
        }
    }

    private static void requireEqual(String expected, String actual, String context) {
        if (!Objects.equals(expected, actual)) {
            throw failure(context + " differs");
        }
    }

    private static <K, V> void putUnique(Map<K, V> target, K key, V value, String context) {
        if (target.putIfAbsent(key, value) != null) {
            throw failure("Duplicate " + context + ": " + key);
        }
    }

    private static <K, V> Map<K, V> immutableOrderedMap(Map<K, V> source) {
        return Collections.unmodifiableMap(new LinkedHashMap<>(source));
    }

    private static CurriculumPackageException failure(String message) {
        return new CurriculumPackageException(message);
    }

    private static CurriculumPackageException failure(String message, Throwable cause) {
        return new CurriculumPackageException(message, cause);
    }

    public record GoalDiscovery(String goalId, List<String> jurisdictions) {
        public GoalDiscovery {
            jurisdictions = List.copyOf(jurisdictions);
        }
    }

    public record Discovery(
            String packageId,
            String packageVersion,
            String targetLandscapeId,
            int sourceCollectionCount,
            int sourceDocumentCount,
            int sourceGoalCount,
            int mappingEdgeCount,
            List<GoalDiscovery> goals,
            String href) {
        public Discovery {
            goals = List.copyOf(goals);
        }
    }

    public record ResolvedEvidence(CurriculumSourceEvidenceResponse response, String etagSha256) {
    }

    public enum LookupStatus {
        FOUND,
        NO_CONTENT,
        NOT_FOUND,
        INVALID
    }

    public record LookupResult(
            LookupStatus status,
            CurriculumSourceEvidenceResponse evidence,
            String etag) {
    }

    private record PackageRouteKey(String packageId, String packageVersion) {
    }

    private record GoalJurisdictionKey(String goalId, String jurisdiction) {
    }

    private record PackageBinding(
            String targetLandscapeId,
            Set<String> knownGoalIds,
            Map<GoalJurisdictionKey, EvidenceRoute> routesByGoalJurisdiction,
            Map<String, EvidenceRoute> defaultRoutesByGoalId,
            Discovery discovery) {
        private PackageBinding {
            knownGoalIds = Set.copyOf(knownGoalIds);
            routesByGoalJurisdiction = immutableOrderedMap(routesByGoalJurisdiction);
            defaultRoutesByGoalId = immutableOrderedMap(defaultRoutesByGoalId);
        }
    }

    private record SourceGoalBinding(
            String jurisdiction,
            CurriculumSourceEvidenceResponse.SourceCollection sourceCollection,
            CurriculumSourceEvidenceResponse.SourceGoal sourceGoal,
            CurriculumSourceEvidenceResponse.SourceDocument sourceDocument) {
    }

    private record EvidenceRoute(
            String goalId,
            String jurisdiction,
            String matchType,
            CurriculumSourceEvidenceResponse.SourceCollection sourceCollection,
            CurriculumSourceEvidenceResponse.SourceGoal sourceGoal,
            CurriculumSourceEvidenceResponse.SourceDocument sourceDocument,
            String etagSha256,
            int mappingOrder) {
    }
}
