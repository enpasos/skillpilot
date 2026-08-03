package com.skillpilot.backend.curriculumpackage;

import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.landscape.SkillLandscape;
import java.util.Collections;
import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * Generation-bound resolver for package decks and embedded runtime resources.
 *
 * <p>The state exposes only stable package identities and public hrefs. Package
 * paths remain internal and every delivered byte sequence is verified again
 * against the active snapshot.</p>
 */
public final class PackageCurriculumResourceState {

    static final long MAX_DECK_BYTES = 64L * 1024L * 1024L;
    static final long MAX_IMAGE_BYTES = 64L * 1024L * 1024L;

    private static final Pattern ROUTE_SEGMENT = Pattern.compile("^[A-Za-z0-9][A-Za-z0-9._:+-]*$");
    private static final String RESOURCE_API_PREFIX = "/api/ui/curriculum-resources/packages/";

    private final String generationSha256;
    private final CurriculumPackageArtifactReader artifactReader;
    private final Map<DeckRouteKey, DeckBinding> decksByRoute;
    private final Map<DeckSourceKey, DeckBinding> decksBySource;
    private final Map<GoalDeckSourceKey, DeckBinding> decksByGoalSource;
    private final Map<ResourceRouteKey, ResourceBinding> resourcesByRoute;
    private final Map<String, ResourceBinding> resourcesByPublicUrl;
    private final Map<CurriculumRuntimeSnapshot.DeckKey, String> deckHrefs;
    private final Map<String, String> resourceHrefs;

    private PackageCurriculumResourceState(
            String generationSha256,
            CurriculumPackageArtifactReader artifactReader,
            Map<DeckRouteKey, DeckBinding> decksByRoute,
            Map<DeckSourceKey, DeckBinding> decksBySource,
            Map<GoalDeckSourceKey, DeckBinding> decksByGoalSource,
            Map<ResourceRouteKey, ResourceBinding> resourcesByRoute,
            Map<String, ResourceBinding> resourcesByPublicUrl,
            Map<CurriculumRuntimeSnapshot.DeckKey, String> deckHrefs,
            Map<String, String> resourceHrefs) {
        this.generationSha256 = generationSha256;
        this.artifactReader = artifactReader;
        this.decksByRoute = immutableOrderedMap(decksByRoute);
        this.decksBySource = immutableOrderedMap(decksBySource);
        this.decksByGoalSource = immutableOrderedMap(decksByGoalSource);
        this.resourcesByRoute = immutableOrderedMap(resourcesByRoute);
        this.resourcesByPublicUrl = immutableOrderedMap(resourcesByPublicUrl);
        this.deckHrefs = immutableOrderedMap(deckHrefs);
        this.resourceHrefs = immutableOrderedMap(resourceHrefs);
    }

    public static PackageCurriculumResourceState load(
            CurriculumRuntimeSnapshot snapshot,
            PackageCurriculumDomainState domainState,
            CurriculumPackageArtifactReader artifactReader) {
        Objects.requireNonNull(snapshot, "snapshot");
        Objects.requireNonNull(domainState, "domainState");
        Objects.requireNonNull(artifactReader, "artifactReader");
        if (!snapshot.generationSha256().equals(domainState.generationSha256())) {
            throw failure("Package resources and curriculum domain generations differ");
        }

        Map<String, String> packageVersions = new LinkedHashMap<>();
        Map<String, Set<String>> packageCapabilities = new LinkedHashMap<>();
        for (CurriculumRuntimeSnapshot.PackageDescriptor descriptor : snapshot.packages()) {
            requireRouteSegment(descriptor.packageId(), "packageId");
            requireRouteSegment(descriptor.packageVersion(), "packageVersion");
            putUnique(packageVersions, descriptor.packageId(), descriptor.packageVersion(), "package version");
            putUnique(
                    packageCapabilities,
                    descriptor.packageId(),
                    Set.copyOf(descriptor.capabilities()),
                    "package capabilities");
        }

        Map<DeckRouteKey, DeckBinding> decksByRoute = new LinkedHashMap<>();
        Map<DeckSourceKey, DeckBinding> decksBySource = new LinkedHashMap<>();
        Map<CurriculumRuntimeSnapshot.DeckKey, String> deckHrefs = new LinkedHashMap<>();
        for (CurriculumRuntimeSnapshot.DeckDescriptor descriptor : snapshot.decksByKey().values()) {
            CurriculumRuntimeSnapshot.DeckKey key = descriptor.key();
            String packageVersion = requirePackageVersion(packageVersions, key.packageId());
            requireCapability(packageCapabilities, key.packageId(), "memoryCards", "deck " + key);
            requireRouteSegment(key.deckId(), "deckId");
            requireRouteSegment(key.locale(), "deck locale");
            CurriculumRuntimeSnapshot.Artifact artifact = requireDeckArtifact(descriptor);
            if (artifact.bytes() > MAX_DECK_BYTES) {
                throw failure("Package deck exceeds the runtime byte limit: " + key);
            }
            String sourcePath = normalizePackagePath(artifact.relativePath(), "deck artifact path");
            DeckRouteKey routeKey = new DeckRouteKey(
                    key.packageId(), packageVersion, key.deckId(), key.locale());
            String href = deckHref(routeKey);
            DeckBinding binding = new DeckBinding(descriptor, routeKey, sourcePath, href);
            putUnique(decksByRoute, routeKey, binding, "deck route");
            putUnique(
                    decksBySource,
                    new DeckSourceKey(descriptor.landscapeId(), sourcePath),
                    binding,
                    "landscape deck source");
            putUnique(deckHrefs, key, href, "deck href");
        }

        Map<GoalDeckSourceKey, DeckBinding> decksByGoalSource = bindGoalDeckSources(
                domainState.landscapes(), decksBySource);

        Map<ResourceRouteKey, ResourceBinding> resourcesByRoute = new LinkedHashMap<>();
        Map<String, ResourceBinding> resourcesByPublicUrl = new LinkedHashMap<>();
        Map<String, String> resourceHrefs = new LinkedHashMap<>();
        for (CurriculumRuntimeSnapshot.ResourceDescriptor descriptor : snapshot.resourcesById().values()) {
            String packageVersion = requirePackageVersion(packageVersions, descriptor.packageId());
            requireRouteSegment(descriptor.resourceId(), "resourceId");
            ResourceRouteKey routeKey = new ResourceRouteKey(
                    descriptor.packageId(), packageVersion, descriptor.resourceId());
            ResourceBinding binding = new ResourceBinding(descriptor, routeKey);
            String href;
            if ("embedded".equals(descriptor.delivery())) {
                if (!"goal-visualization".equals(descriptor.resourceKind())
                        || !"goal-visualization".equals(descriptor.catalogResourceKind())
                        || descriptor.publicUrl() == null
                        || !descriptor.publicUrl().startsWith("/assets/goal-visualizations/")) {
                    throw failure("Embedded package resource is outside the supported goal-visualization lane: "
                            + descriptor.resourceId());
                }
                requireCapability(
                        packageCapabilities,
                        descriptor.packageId(),
                        "goalVisualizations",
                        "embedded resource " + descriptor.resourceId());
                String ownerLandscapeId = descriptor.ownerGoalId() == null
                        ? null
                        : domainState.landscapeIdByGoalId().get(descriptor.ownerGoalId());
                if (ownerLandscapeId == null || !ownerLandscapeId.equals(descriptor.landscapeId())) {
                    throw failure("Embedded resource is not owned by a goal in its landscape: "
                            + descriptor.resourceId());
                }
                CurriculumRuntimeSnapshot.Artifact artifact = requireEmbeddedResourceArtifact(descriptor);
                if (artifact.bytes() > MAX_IMAGE_BYTES) {
                    throw failure("Embedded package image exceeds the runtime byte limit: "
                            + descriptor.resourceId());
                }
                putUnique(resourcesByRoute, routeKey, binding, "resource route");
                putUnique(resourcesByPublicUrl, descriptor.publicUrl(), binding, "resource publicUrl");
                href = resourceHref(routeKey);
            } else if ("external".equals(descriptor.delivery())) {
                if (descriptor.artifact() != null || descriptor.externalUrl() == null) {
                    throw failure("External package resource is not metadata-only: " + descriptor.resourceId());
                }
                href = descriptor.externalUrl();
            } else {
                throw failure("Unsupported package resource delivery: " + descriptor.delivery());
            }
            putUnique(resourceHrefs, descriptor.resourceId(), href, "resource href");
        }

        return new PackageCurriculumResourceState(
                snapshot.generationSha256(),
                artifactReader,
                decksByRoute,
                decksBySource,
                decksByGoalSource,
                resourcesByRoute,
                resourcesByPublicUrl,
                deckHrefs,
                resourceHrefs);
    }

    public String generationSha256() {
        return generationSha256;
    }

    public Map<CurriculumRuntimeSnapshot.DeckKey, String> deckHrefs() {
        return deckHrefs;
    }

    public Map<String, String> resourceHrefs() {
        return resourceHrefs;
    }

    public Optional<ResolvedArtifact> resolveDeck(
            String packageId,
            String packageVersion,
            String deckId,
            String locale) {
        DeckBinding binding = decksByRoute.get(new DeckRouteKey(packageId, packageVersion, deckId, locale));
        return binding == null ? Optional.empty() : Optional.of(readDeck(binding));
    }

    public Optional<ResolvedArtifact> resolveDeck(String landscapeId, String vocabularySource) {
        String sourcePath = normalizeLookupPath(vocabularySource);
        if (landscapeId == null || landscapeId.isBlank() || sourcePath == null) {
            return Optional.empty();
        }
        DeckBinding binding = decksBySource.get(new DeckSourceKey(landscapeId, sourcePath));
        return binding == null ? Optional.empty() : Optional.of(readDeck(binding));
    }

    public Optional<ResolvedArtifact> resolveGoalDeck(String goalId, String vocabularySource) {
        String sourcePath = normalizeLookupPath(vocabularySource);
        if (goalId == null || goalId.isBlank() || sourcePath == null) {
            return Optional.empty();
        }
        DeckBinding binding = decksByGoalSource.get(new GoalDeckSourceKey(goalId, sourcePath));
        return binding == null ? Optional.empty() : Optional.of(readDeck(binding));
    }

    public Optional<ResolvedArtifact> resolveResource(
            String packageId,
            String packageVersion,
            String resourceId) {
        ResourceBinding binding = resourcesByRoute.get(
                new ResourceRouteKey(packageId, packageVersion, resourceId));
        return binding == null ? Optional.empty() : Optional.of(readResource(binding));
    }

    public Optional<ResolvedArtifact> resolvePublicAsset(String publicUrl) {
        return resolvePublicAsset(publicUrl, MAX_IMAGE_BYTES);
    }

    /**
     * Resolves a public embedded image without reading more than the caller's
     * stricter byte limit.
     */
    public Optional<ResolvedArtifact> resolvePublicAsset(String publicUrl, long maxBytes) {
        if (maxBytes < 0 || maxBytes > MAX_IMAGE_BYTES) {
            throw new IllegalArgumentException("maxBytes must be between 0 and the package image limit");
        }
        ResourceBinding binding = resourcesByPublicUrl.get(publicUrl);
        return binding == null ? Optional.empty() : Optional.of(readResource(binding, maxBytes));
    }

    private ResolvedArtifact readDeck(DeckBinding binding) {
        CurriculumRuntimeSnapshot.Artifact artifact = binding.descriptor().artifact();
        byte[] bytes = artifactReader.readVerified(artifact, MAX_DECK_BYTES);
        return new ResolvedArtifact(
                bytes,
                artifact.mediaType(),
                fileName(artifact.relativePath()),
                artifact.sha256(),
                binding.href());
    }

    private ResolvedArtifact readResource(ResourceBinding binding) {
        return readResource(binding, MAX_IMAGE_BYTES);
    }

    private ResolvedArtifact readResource(ResourceBinding binding, long maxBytes) {
        CurriculumRuntimeSnapshot.ResourceDescriptor descriptor = binding.descriptor();
        CurriculumRuntimeSnapshot.Artifact artifact = requireEmbeddedResourceArtifact(descriptor);
        byte[] bytes = artifactReader.readVerified(artifact, maxBytes);
        return new ResolvedArtifact(
                bytes,
                descriptor.mediaType(),
                fileName(artifact.relativePath()),
                artifact.sha256(),
                resourceHref(binding.routeKey()));
    }

    private static CurriculumRuntimeSnapshot.Artifact requireDeckArtifact(
            CurriculumRuntimeSnapshot.DeckDescriptor descriptor) {
        CurriculumRuntimeSnapshot.Artifact artifact = descriptor.artifact();
        if (artifact == null
                || !"card-deck".equals(artifact.role())
                || !artifact.runtimeRequired()
                || !artifact.packageId().equals(descriptor.key().packageId())
                || !"application/json".equals(artifact.mediaType())
                || !"logical-artifact".equals(artifact.semanticBindingKind())
                || !"card-deck".equals(artifact.normalizationRole())
                || !(descriptor.key().deckId() + "@" + descriptor.key().locale())
                        .equals(artifact.logicalId())) {
            throw failure("Deck is not bound to a runtime card-deck artifact: " + descriptor.key());
        }
        return artifact;
    }

    private static Map<GoalDeckSourceKey, DeckBinding> bindGoalDeckSources(
            List<SkillLandscape> landscapes,
            Map<DeckSourceKey, DeckBinding> decksBySource) {
        Map<GoalDeckSourceKey, DeckBinding> bindings = new LinkedHashMap<>();
        for (SkillLandscape landscape : landscapes) {
            if (landscape.getGoals() == null) {
                continue;
            }
            for (LearningGoal goal : landscape.getGoals()) {
                Map<String, Object> extendedData = goal.getExtendedData();
                Object defaultSource = extendedData == null ? null : extendedData.get("vocabularySource");
                Object englishSource = extendedData == null ? null : extendedData.get("vocabularySourceEn");
                List<String> deckTags = goal.getTags() == null
                        ? List.of()
                        : goal.getTags().stream()
                                .filter(Objects::nonNull)
                                .filter(tag -> tag.startsWith("srs-deck:"))
                                .toList();
                boolean hasSource = defaultSource != null || englishSource != null;
                if (!hasSource && deckTags.isEmpty()) {
                    continue;
                }
                if (deckTags.size() != 1 || deckTags.getFirst().length() <= "srs-deck:".length()) {
                    throw failure("Package memory goal must declare exactly one non-empty srs-deck tag: "
                            + goal.getId());
                }
                if (!hasSource) {
                    throw failure("Package memory goal has no vocabulary source: " + goal.getId());
                }
                String deckId = deckTags.getFirst().substring("srs-deck:".length());
                bindGoalDeckSource(
                        bindings,
                        decksBySource,
                        landscape.getLandscapeId(),
                        goal.getId(),
                        deckId,
                        defaultSource,
                        "vocabularySource");
                bindGoalDeckSource(
                        bindings,
                        decksBySource,
                        landscape.getLandscapeId(),
                        goal.getId(),
                        deckId,
                        englishSource,
                        "vocabularySourceEn");
            }
        }
        return bindings;
    }

    private static void bindGoalDeckSource(
            Map<GoalDeckSourceKey, DeckBinding> bindings,
            Map<DeckSourceKey, DeckBinding> decksBySource,
            String landscapeId,
            String goalId,
            String deckId,
            Object rawSource,
            String field) {
        if (rawSource == null) {
            return;
        }
        if (!(rawSource instanceof String source) || source.isBlank()) {
            throw failure("Package memory goal has an invalid " + field + ": " + goalId);
        }
        String sourcePath = normalizeLookupPath(source);
        if (sourcePath == null) {
            throw failure("Package memory goal has an unsafe " + field + ": " + goalId);
        }
        DeckBinding binding = decksBySource.get(new DeckSourceKey(landscapeId, sourcePath));
        if (binding == null) {
            throw failure("Package memory goal references an uncatalogued deck source: " + goalId);
        }
        if (!deckId.equals(binding.descriptor().key().deckId())) {
            throw failure("Package memory goal deck tag and source disagree: " + goalId);
        }
        GoalDeckSourceKey goalSourceKey = new GoalDeckSourceKey(goalId, sourcePath);
        DeckBinding previous = bindings.putIfAbsent(goalSourceKey, binding);
        if (previous != null && !previous.equals(binding)) {
            throw failure("Ambiguous goal deck source: " + goalSourceKey);
        }
    }

    private static CurriculumRuntimeSnapshot.Artifact requireEmbeddedResourceArtifact(
            CurriculumRuntimeSnapshot.ResourceDescriptor descriptor) {
        CurriculumRuntimeSnapshot.Artifact artifact = descriptor.artifact();
        if (artifact == null
                || !"binary-asset".equals(artifact.role())
                || !artifact.runtimeRequired()
                || !"binary-resource".equals(artifact.semanticBindingKind())
                || !descriptor.resourceId().equals(artifact.resourceId())
                || !descriptor.packageId().equals(artifact.packageId())
                || !descriptor.mediaType().equals(artifact.mediaType())
                || !("image/jpeg".equals(descriptor.mediaType())
                        || "image/png".equals(descriptor.mediaType()))) {
            throw failure("Embedded resource is not a supported runtime image artifact: "
                    + descriptor.resourceId());
        }
        return artifact;
    }

    private static String requirePackageVersion(Map<String, String> packageVersions, String packageId) {
        String packageVersion = packageVersions.get(packageId);
        if (packageVersion == null) {
            throw failure("Runtime entry references an unknown package: " + packageId);
        }
        return packageVersion;
    }

    private static void requireCapability(
            Map<String, Set<String>> packageCapabilities,
            String packageId,
            String capability,
            String context) {
        if (!packageCapabilities.getOrDefault(packageId, Set.of()).contains(capability)) {
            throw failure(context + " requires undeclared package capability " + capability);
        }
    }

    private static String normalizeLookupPath(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String normalized = value.trim();
        if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
            return null;
        }
        while (normalized.startsWith("/")) {
            normalized = normalized.substring(1);
        }
        try {
            return normalizePackagePath(normalized, "vocabulary source");
        } catch (CurriculumPackageException ignored) {
            return null;
        }
    }

    private static String normalizePackagePath(String value, String description) {
        CurriculumPackageFileReader.validateRelativePath(value, description);
        return value;
    }

    private static String deckHref(DeckRouteKey key) {
        return RESOURCE_API_PREFIX
                + key.packageId() + "/" + key.packageVersion()
                + "/decks/" + key.deckId() + "/" + key.locale();
    }

    private static String resourceHref(ResourceRouteKey key) {
        return RESOURCE_API_PREFIX
                + key.packageId() + "/" + key.packageVersion()
                + "/resources/" + key.resourceId();
    }

    private static String fileName(String relativePath) {
        int separator = relativePath.lastIndexOf('/');
        return separator < 0 ? relativePath : relativePath.substring(separator + 1);
    }

    private static void requireRouteSegment(String value, String description) {
        if (value == null || !ROUTE_SEGMENT.matcher(value).matches()) {
            throw failure(description + " is not safe for a public resource route: " + value);
        }
    }

    private static <K, V> void putUnique(Map<K, V> target, K key, V value, String description) {
        if (target.putIfAbsent(key, value) != null) {
            throw failure("Ambiguous " + description + ": " + key);
        }
    }

    private static <K, V> Map<K, V> immutableOrderedMap(Map<K, V> source) {
        return Collections.unmodifiableMap(new LinkedHashMap<>(source));
    }

    private static CurriculumPackageException failure(String message) {
        return new CurriculumPackageException(message);
    }

    private record DeckRouteKey(String packageId, String packageVersion, String deckId, String locale) {
    }

    private record DeckSourceKey(String landscapeId, String sourcePath) {
    }

    private record GoalDeckSourceKey(String goalId, String sourcePath) {
    }

    private record ResourceRouteKey(String packageId, String packageVersion, String resourceId) {
    }

    private record DeckBinding(
            CurriculumRuntimeSnapshot.DeckDescriptor descriptor,
            DeckRouteKey routeKey,
            String sourcePath,
            String href) {
    }

    private record ResourceBinding(
            CurriculumRuntimeSnapshot.ResourceDescriptor descriptor,
            ResourceRouteKey routeKey) {
    }

    public record ResolvedArtifact(
            byte[] bytes,
            String mediaType,
            String filename,
            String sha256,
            String href) {
        public ResolvedArtifact {
            bytes = bytes.clone();
        }

        @Override
        public byte[] bytes() {
            return bytes.clone();
        }
    }
}
