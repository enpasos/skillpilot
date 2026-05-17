package com.skillpilot.backend.landscape;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class GoalMappingService {

    private static final Logger log = LoggerFactory.getLogger(GoalMappingService.class);
    private static final String FILE_SUFFIX = ".json";
    private static final long RELOAD_CHECK_INTERVAL_MS = 2000L;
    private static final int SUPPORTED_VERSION = 1;

    private final LandscapeProperties properties;
    private final ObjectMapper objectMapper;

    private volatile List<ResolvedGoalMapping> cachedMappings = Collections.emptyList();
    private volatile Map<String, ResolvedGoalMapping> cachedByLegacyGoalId = Collections.emptyMap();
    private volatile Map<String, List<ResolvedGoalMapping>> cachedAllByLegacyGoalId = Collections.emptyMap();
    private volatile long lastLoadedFingerprint = -1L;
    private volatile long lastReloadCheck = 0L;
    private final Object reloadLock = new Object();

    public GoalMappingService(LandscapeProperties properties, ObjectMapper objectMapper) {
        this.properties = properties;
        this.objectMapper = objectMapper;
        loadMappings();
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
        long now = System.currentTimeMillis();
        if (now - lastReloadCheck < RELOAD_CHECK_INTERVAL_MS) {
            return;
        }
        synchronized (reloadLock) {
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
            for (Path file : Files.walk(dir).filter(Files::isRegularFile).filter(this::isGoalMapFile).sorted().toList()) {
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

        List<ResolvedGoalMapping> loadedMappings = new ArrayList<>();
        Map<String, ResolvedGoalMapping> byLegacyGoalId = new LinkedHashMap<>();
        Map<String, List<ResolvedGoalMapping>> allByLegacyGoalId = new LinkedHashMap<>();
        long fingerprint = 1L;

        try {
            List<Path> files = Files.walk(dir)
                    .filter(Files::isRegularFile)
                    .filter(this::isGoalMapFile)
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

                validateMappingFile(mappingFile, file);
                List<ResolvedGoalMapping> resolved = mappingFile.getMappings().stream()
                        .map(entry -> toResolvedMapping(mappingFile, entry, file))
                        .toList();

                for (ResolvedGoalMapping mapping : resolved) {
                    List<ResolvedGoalMapping> existingMappings = allByLegacyGoalId.computeIfAbsent(
                            mapping.legacyGoalId(), ignored -> new ArrayList<>());
                    if (existingMappings.isEmpty()) {
                        existingMappings.add(mapping);
                        byLegacyGoalId.put(mapping.legacyGoalId(), mapping);
                        loadedMappings.add(mapping);
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
                    loadedMappings.add(mapping);
                }
            }
        } catch (IOException e) {
            throw new IllegalStateException("Failed to load goal mappings from " + dir, e);
        }

        cachedMappings = Collections.unmodifiableList(loadedMappings);
        cachedByLegacyGoalId = Collections.unmodifiableMap(byLegacyGoalId);
        cachedAllByLegacyGoalId = immutableMappingLists(allByLegacyGoalId);
        lastLoadedFingerprint = fingerprint;
        log.info("Loaded {} goal mappings from {}", loadedMappings.size(), dir);
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
        return root.has("version")
                && root.hasNonNull("sourceLandscapeId")
                && root.hasNonNull("targetLandscapeId")
                && root.has("mappings")
                && root.get("mappings").isArray()
                && !isSourceExtractionReviewFile(root);
    }

    private boolean isSourceExtractionReviewFile(JsonNode root) {
        return root.hasNonNull("reviewId")
                || root.hasNonNull("sourceExtractionPath")
                || root.has("decisions");
    }

    private boolean isGoalMapFile(Path path) {
        String filename = path.getFileName() != null ? path.getFileName().toString().toLowerCase(Locale.ROOT) : "";
        if (!filename.endsWith(FILE_SUFFIX)) {
            return false;
        }
        if (filename.endsWith(".review" + FILE_SUFFIX)) {
            return false;
        }
        for (Path segment : path) {
            if ("mapping".equals(segment.toString())) {
                return true;
            }
        }
        return false;
    }
}
