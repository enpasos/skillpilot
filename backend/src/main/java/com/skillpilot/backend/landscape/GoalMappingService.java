package com.skillpilot.backend.landscape;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.curriculumpackage.PackageLandscapeMappingState;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.StringUtils;

public class GoalMappingService {

    private static final Logger log = LoggerFactory.getLogger(GoalMappingService.class);
    private static final String FILE_SUFFIX = ".json";
    private static final long RELOAD_CHECK_INTERVAL_MS = 2000L;
    private static final int SUPPORTED_VERSION = 1;

    private final LandscapeProperties properties;
    private final ObjectMapper objectMapper;
    private final boolean packageBacked;
    private String operationalMappingFailure;

    /** An unavailable operational input must never use the review relation as fallback. */
    public static final class ProjectionUnavailableException extends IllegalStateException {
        public ProjectionUnavailableException(String message) { super(message); }
    }

    private volatile List<ResolvedGoalMapping> cachedMappings = Collections.emptyList();
    private volatile Map<String, ResolvedGoalMapping> cachedByLegacyGoalId = Collections.emptyMap();
    private volatile Map<String, List<ResolvedGoalMapping>> cachedAllByLegacyGoalId = Collections.emptyMap();
    private volatile long lastLoadedFingerprint = -1L;
    private volatile long lastReloadCheck = 0L;
    private final Object reloadLock = new Object();

    public GoalMappingService(LandscapeProperties properties, ObjectMapper objectMapper) {
        this.properties = properties;
        this.objectMapper = objectMapper;
        this.packageBacked = false;
        loadMappings();
    }

    /** Builds the runtime adapter from one already validated package generation. */
    public GoalMappingService(PackageLandscapeMappingState.Merged packageMappings) {
        if (packageMappings == null) {
            throw new IllegalArgumentException("packageMappings must not be null");
        }
        this.properties = null;
        this.objectMapper = null;
        this.packageBacked = true;
        this.cachedMappings = packageMappings.mappings();
        this.cachedAllByLegacyGoalId = packageMappings.mappingsBySourceGoalId();
        Map<String, ResolvedGoalMapping> uniqueMappings = new LinkedHashMap<>();
        this.cachedAllByLegacyGoalId.forEach((sourceGoalId, mappings) -> {
            if (mappings.size() == 1) {
                uniqueMappings.put(sourceGoalId, mappings.get(0));
            }
        });
        this.cachedByLegacyGoalId = Collections.unmodifiableMap(uniqueMappings);
    }

    private volatile boolean runtimeGenerationPinned;

    /** Replays exact native documents only for capability-selected packages. */
    public GoalMappingService(PackageLandscapeMappingState.Merged packageMappings, ObjectMapper mapper,
                              Map<String, Map<String, byte[]>> nativeDocumentsByPackage) {
        this.properties = null;
        this.objectMapper = mapper;
        this.packageBacked = true;
        try {
            MappingAccumulator nativeMappings = new MappingAccumulator();
            List<ResolvedGoalMapping> compiled = new ArrayList<>();
            for (var state : packageMappings.packageStates()) {
                Map<String, byte[]> documents = nativeDocumentsByPackage.get(state.packageId());
                if (documents == null) { compiled.addAll(state.mappings()); continue; }
                if (documents.isEmpty()) throw new IllegalStateException("Native operational mapping inputs are missing: " + state.packageId());
                for (String sourcePath : documents.keySet().stream().sorted().toList()) {
                    if (!isNativeOperationalMappingPath(sourcePath)) throw new IllegalStateException("Native mapping input has an archived/review/non-mapping locator");
                    JsonNode document = mapper.readTree(documents.get(sourcePath));
                    if (document == null || !isGoalMappingFile(document)) throw new IllegalStateException("Native mapping input has no supported native mapping shape: " + sourcePath);
                    var mappingFile = mapper.treeToValue(document, GoalMappingFile.class);
                    if (!state.targetLandscapeId().equals(mappingFile.getTargetLandscapeId())
                            || !state.sourceLandscapesById().containsKey(mappingFile.getSourceLandscapeId())) {
                        throw new IllegalStateException("Native mapping input has an unbound package source/target identity: " + sourcePath);
                    }
                    addMappingFile(mappingFile, Path.of(sourcePath), nativeMappings);
                }
            }
            List<ResolvedGoalMapping> combined = new ArrayList<>(compiled); combined.addAll(nativeMappings.mappings);
            Map<String, List<ResolvedGoalMapping>> all = new LinkedHashMap<>();
            combined.forEach(mapping -> all.computeIfAbsent(mapping.legacyGoalId(), ignored -> new ArrayList<>()).add(mapping));
            Map<String, ResolvedGoalMapping> indexed = new LinkedHashMap<>();
            all.forEach((id, mappings) -> {
                if (nativeMappings.first.containsKey(id)) {
                    if (mappings.size() != nativeMappings.all.get(id).size()) throw new IllegalStateException("Native and compiled package result keys collide: " + id);
                    indexed.put(id, nativeMappings.first.get(id));
                } else if (mappings.size() == 1) indexed.put(id, mappings.getFirst());
            });
            cachedMappings = List.copyOf(combined);
            cachedAllByLegacyGoalId = immutableMappingLists(all);
            cachedByLegacyGoalId = Collections.unmodifiableMap(indexed);
        } catch (Exception invalid) {
            operationalMappingFailure = "Native operational mapping projection is unavailable: " + invalid.getMessage();
        }
    }

    public static boolean isNativeOperationalMappingPath(String sourcePath) {
        if (sourcePath == null || !sourcePath.startsWith("DE/Gymnasium/mapping/")
                || sourcePath.contains("/../") || sourcePath.contains("\\") || sourcePath.contains("/quality/")) return false;
        String name = sourcePath.toLowerCase(Locale.ROOT);
        return name.endsWith(".json") && !name.endsWith(".review.json");
    }

    /** Select candidates before validation: malformed live inputs must never disappear. */
    public static boolean isNativeOperationalMappingCandidate(String sourcePath, byte[] bytes, ObjectMapper mapper) {
        if (!isNativeOperationalMappingPath(sourcePath)) return false;
        try {
            JsonNode root = mapper.readTree(bytes);
            return root == null || !isSourceExtractionReviewFile(root);
        } catch (java.io.IOException malformed) {
            return true; // The operational parser reports typed unavailability at use.
        }
    }

    public boolean operationalProjectionAvailable() { return operationalMappingFailure == null; }

    public String operationalProjectionFailure() { return operationalMappingFailure; }

    public void requireOperationalProjection() {
        if (operationalMappingFailure != null) throw new ProjectionUnavailableException(operationalMappingFailure);
    }

    public void pinRuntimeGeneration() {
        if (packageBacked) return;
        synchronized (reloadLock) {
            if (runtimeGenerationPinned) return;
            // Pin from the current files even when the normal reload interval has
            // not elapsed. The catalog verifies these inputs before publishing.
            loadMappings();
            runtimeGenerationPinned = true;
        }
    }

    public List<ResolvedGoalMapping> getAllMappings() {
        ensureFresh();
        return cachedMappings;
    }

    public Optional<ResolvedGoalMapping> findByLegacyGoalId(String legacyGoalId) {
        ensureFresh();
        if (!StringUtils.hasText(legacyGoalId)) {
            return Optional.empty();
        }
        return Optional.ofNullable(cachedByLegacyGoalId.get(legacyGoalId));
    }

    public List<ResolvedGoalMapping> findAllByLegacyGoalId(String legacyGoalId) {
        ensureFresh();
        if (!StringUtils.hasText(legacyGoalId)) {
            return Collections.emptyList();
        }
        return cachedAllByLegacyGoalId.getOrDefault(legacyGoalId, Collections.emptyList());
    }

    public List<ResolvedGoalMapping> getMappingsForSourceLandscape(String sourceLandscapeId) {
        ensureFresh();
        if (!StringUtils.hasText(sourceLandscapeId)) {
            return Collections.emptyList();
        }
        return cachedMappings.stream()
                .filter(mapping -> sourceLandscapeId.equals(mapping.sourceLandscapeId()))
                .toList();
    }

    private void ensureFresh() {
        requireOperationalProjection();
        if (packageBacked || runtimeGenerationPinned) {
            return;
        }
        long now = System.currentTimeMillis();
        if (now - lastReloadCheck < RELOAD_CHECK_INTERVAL_MS) {
            return;
        }
        synchronized (reloadLock) {
            if (runtimeGenerationPinned) return;
            now = System.currentTimeMillis();
            if (now - lastReloadCheck < RELOAD_CHECK_INTERVAL_MS) {
                return;
            }
            lastReloadCheck = now;
            long fingerprint = computeFingerprint();
            if (fingerprint != lastLoadedFingerprint) {
                loadMappings();
            }
        }
    }

    private long computeFingerprint() {
        Path dir = Path.of(properties.getDirectory()).toAbsolutePath().normalize();
        if (!Files.isDirectory(dir)) {
            return -1L;
        }

        try {
            long fingerprint = 1L;
            for (Path file : PrunedFileTree.files(dir,
                            path -> !path.equals(dir) && "quality".equals(path.getFileName().toString())).stream()
                    .filter(Files::isRegularFile)
                    .filter(path -> isGoalMapFile(dir, path)).sorted().toList()) {
                try {
                    long lastModified = Files.getLastModifiedTime(file).toMillis();
                    fingerprint = 31L * fingerprint + dir.relativize(file).toString().hashCode();
                    fingerprint = 31L * fingerprint + lastModified;
                } catch (IOException e) {
                    log.debug("Could not read lastModified for {}", file, e);
                }
            }
            return fingerprint;
        } catch (IOException e) {
            log.warn("Failed to compute goal-mapping fingerprint under {}", dir, e);
            return -1L;
        }
    }

    private void loadMappings() {
        Path dir = Path.of(properties.getDirectory()).toAbsolutePath().normalize();
        if (!Files.isDirectory(dir)) {
            log.warn("Goal mapping directory does not exist: {}", dir);
            cachedMappings = Collections.emptyList();
            cachedByLegacyGoalId = Collections.emptyMap();
            cachedAllByLegacyGoalId = Collections.emptyMap();
            lastLoadedFingerprint = -1L;
            return;
        }

        MappingAccumulator accumulator = new MappingAccumulator();
        long fingerprint = 1L;

        try {
            List<Path> files = PrunedFileTree.files(dir,
                            path -> !path.equals(dir) && "quality".equals(path.getFileName().toString())).stream()
                    .filter(Files::isRegularFile)
                    .filter(path -> isGoalMapFile(dir, path))
                    .sorted()
                    .toList();

            for (Path file : files) {
                try {
                    long lastModified = Files.getLastModifiedTime(file).toMillis();
                    fingerprint = 31L * fingerprint + dir.relativize(file).toString().hashCode();
                    fingerprint = 31L * fingerprint + lastModified;
                } catch (IOException e) {
                    log.debug("Could not read lastModified for {}", file, e);
                }

                GoalMappingFile mappingFile;
                try {
                    JsonNode root = objectMapper.readTree(file.toFile());
                    if (root == null || !root.isObject() || !isGoalMappingFile(root)) {
                        continue;
                    }
                    mappingFile = objectMapper.treeToValue(root, GoalMappingFile.class);
                } catch (Exception e) {
                    throw new IllegalStateException("Failed to parse goal mapping file " + file, e);
                }

                addMappingFile(mappingFile, file, accumulator);
            }
        } catch (IOException e) {
            throw new IllegalStateException("Failed to load goal mappings from " + dir, e);
        }

        cachedMappings = Collections.unmodifiableList(accumulator.mappings);
        cachedByLegacyGoalId = Collections.unmodifiableMap(accumulator.first);
        cachedAllByLegacyGoalId = immutableMappingLists(accumulator.all);
        lastLoadedFingerprint = fingerprint;
        log.info("Loaded {} goal mappings from {}", accumulator.mappings.size(), dir);
    }

    private static final class MappingAccumulator {
        final List<ResolvedGoalMapping> mappings = new ArrayList<>();
        final Map<String, ResolvedGoalMapping> first = new LinkedHashMap<>();
        final Map<String, List<ResolvedGoalMapping>> all = new LinkedHashMap<>();
    }

    private void addMappingFile(GoalMappingFile mappingFile, Path file, MappingAccumulator accumulator) {
        validateMappingFile(mappingFile, file);
        List<ResolvedGoalMapping> resolved = mappingFile.getMappings().stream()
                .map(entry -> toResolvedMapping(mappingFile, entry, file))
                .toList();

        for (ResolvedGoalMapping mapping : resolved) {
            List<ResolvedGoalMapping> existingMappings = accumulator.all.computeIfAbsent(
                    mapping.legacyGoalId(), ignored -> new ArrayList<>());
            if (existingMappings.isEmpty()) {
                existingMappings.add(mapping);
                accumulator.first.put(mapping.legacyGoalId(), mapping);
                accumulator.mappings.add(mapping);
                continue;
            }

            if (existingMappings.contains(mapping)) {
                continue;
            }

            for (ResolvedGoalMapping existing : existingMappings) {
                if ("exact".equals(existing.matchType()) || "exact".equals(mapping.matchType())) {
                    throw new IllegalStateException(
                            "Conflicting goal mappings for legacyGoalId %s between %s and %s"
                                    .formatted(mapping.legacyGoalId(), existing.sourceFile(), mapping.sourceFile()));
                }
            }
            existingMappings.add(mapping);
            accumulator.mappings.add(mapping);
        }
    }

    private Map<String, List<ResolvedGoalMapping>> immutableMappingLists(
            Map<String, List<ResolvedGoalMapping>> mappingsByLegacyGoalId) {
        Map<String, List<ResolvedGoalMapping>> result = new LinkedHashMap<>();
        for (Map.Entry<String, List<ResolvedGoalMapping>> entry : mappingsByLegacyGoalId.entrySet()) {
            result.put(entry.getKey(), List.copyOf(entry.getValue()));
        }
        return Collections.unmodifiableMap(result);
    }

    private void validateMappingFile(GoalMappingFile mappingFile, Path file) {
        if (mappingFile.getVersion() != SUPPORTED_VERSION) {
            throw new IllegalStateException("Unsupported goal mapping version in " + file + ": " + mappingFile.getVersion());
        }
        if (!StringUtils.hasText(mappingFile.getSourceLandscapeId())) {
            throw new IllegalStateException("Goal mapping file missing sourceLandscapeId: " + file);
        }
        if (!StringUtils.hasText(mappingFile.getTargetLandscapeId())) {
            throw new IllegalStateException("Goal mapping file missing targetLandscapeId: " + file);
        }
        if (mappingFile.getMappings() == null) {
            throw new IllegalStateException("Goal mapping file has no mappings array: " + file);
        }
    }

    private ResolvedGoalMapping toResolvedMapping(GoalMappingFile mappingFile, GoalMappingEntry entry, Path file) {
        if (entry == null) {
            throw new IllegalStateException("Null goal mapping entry in " + file);
        }
        if (!StringUtils.hasText(entry.getLegacyGoalId())) {
            throw new IllegalStateException("Goal mapping entry missing legacyGoalId in " + file);
        }
        if (!StringUtils.hasText(entry.getCanonicalGoalId())) {
            throw new IllegalStateException("Goal mapping entry missing canonicalGoalId in " + file);
        }
        String matchType = normalizeMatchType(entry.getMatchType(), file, entry.getLegacyGoalId());
        return new ResolvedGoalMapping(
                mappingFile.getSourceLandscapeId(),
                mappingFile.getTargetLandscapeId(),
                entry.getLegacyGoalId(),
                entry.getCanonicalGoalId(),
                matchType,
                file.toString());
    }

    private String normalizeMatchType(String matchType, Path file, String legacyGoalId) {
        if (!StringUtils.hasText(matchType)) {
            throw new IllegalStateException("Goal mapping entry missing matchType in " + file + " for " + legacyGoalId);
        }
        String normalized = matchType.trim().toLowerCase(Locale.ROOT);
        if (!normalized.equals("exact") && !normalized.equals("partial")) {
            throw new IllegalStateException(
                    "Unsupported matchType '%s' in %s for %s".formatted(matchType, file, legacyGoalId));
        }
        return normalized;
    }

    private boolean isGoalMappingFile(JsonNode root) {
        return isNativeMappingDocument(root);
    }

    public static boolean isNativeMappingDocument(JsonNode root) {
        if (root == null || !root.isObject()) return false;
        return root.has("version")
                && root.hasNonNull("sourceLandscapeId")
                && root.hasNonNull("targetLandscapeId")
                && root.has("mappings")
                && root.get("mappings").isArray()
                && !isSourceExtractionReviewFile(root);
    }

    private static boolean isSourceExtractionReviewFile(JsonNode root) {
        return root.hasNonNull("reviewId")
                || root.hasNonNull("sourceExtractionPath")
                || root.has("decisions");
    }

    private boolean isGoalMapFile(Path directory, Path path) {
        String filename = path.getFileName() != null ? path.getFileName().toString().toLowerCase(Locale.ROOT) : "";
        if (!filename.endsWith(FILE_SUFFIX)) {
            return false;
        }
        if (filename.endsWith(".review" + FILE_SUFFIX)) {
            return false;
        }
        // Quality dossiers retain historical and candidate mappings as evidence, not runtime input.
        for (Path segment : directory.relativize(path)) {
            if ("quality".equals(segment.toString())) {
                return false;
            }
        }
        for (Path segment : path) {
            if ("mapping".equals(segment.toString())) {
                return true;
            }
        }
        return false;
    }
}
