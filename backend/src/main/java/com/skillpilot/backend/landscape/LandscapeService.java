package com.skillpilot.backend.landscape;

import com.skillpilot.backend.api.LandscapeOverviewResponse;
import com.skillpilot.backend.api.TopicSummary;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.Locale;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class LandscapeService {

    private static final Logger log = LoggerFactory.getLogger(LandscapeService.class);
    private static final int SUPPORTED_SOURCE_REGISTRY_VERSION = 1;
    private static final Path SOURCE_LANDSCAPE_REGISTRY_PATH = Path.of(
            "DE", "Gymnasium", "provenance", "source-landscape-registry.json");
    private static final int SUPPORTED_SOURCE_GOAL_CLOSURE_REGISTRY_VERSION = 1;
    private static final Path SOURCE_GOAL_CLOSURE_REGISTRY_PATH = Path.of(
            "DE", "Gymnasium", "provenance", "source-goal-closure-registry.json");
    private static final int SUPPORTED_SOURCE_GOAL_MEMBERSHIP_REGISTRY_VERSION = 1;
    private static final Path SOURCE_GOAL_MEMBERSHIP_REGISTRY_PATH = Path.of(
            "DE", "Gymnasium", "provenance", "source-goal-membership-registry.json");
    private static final int SUPPORTED_COMPATIBILITY_ARCHIVE_REGISTRY_VERSION = 1;
    private static final Path COMPATIBILITY_ARCHIVE_REGISTRY_PATH = Path.of(
            "DE", "Gymnasium", "archive", "compatibility-landscape-registry.json");
    private static final int SUPPORTED_COMPATIBILITY_TOPIC_REGISTRY_VERSION = 1;
    private static final Path COMPATIBILITY_TOPIC_REGISTRY_PATH = Path.of(
            "DE", "Gymnasium", "archive", "compatibility-topic-summary-registry.json");
    private static final Map<String, String> RETAINED_ASSET_PATH_NORMALIZATIONS = Map.of(
            "curricula/DE/Gymnasium/input/DE-HE/",
            "curricula/DE/Gymnasium/input/HE/",
            "curricula/DE/Gymnasium/input/DE-BY/",
            "curricula/DE/Gymnasium/input/BY/");
    private static final Set<String> COMPATIBILITY_ONLY_LANDSCAPE_IDS = Set.of(
            "bbbf39f3-4a5b-46cf-9edd-48f2c54ae0da",
            "2796fc7b-ba9d-446f-8f26-711dd6d8a9a3",
            "24f2ca0f-b94a-444e-bb70-677cb6f85c02",
            "2f391ba2-ba1e-40e4-a8d2-dff049516c13",
            "3e56aa75-c76c-4de5-883b-0aac98297846",
            "c1a02ddd-736d-4975-920b-18b03aff147f",
            "bdc89685-73d3-446c-af5a-eaf642c07463",
            "f1ba2118-853f-4aa0-bef5-4f749bc621ed",
            "1d0e9f8f-0087-49e4-8ea2-976e5a89b165",
            "bc2124fa-2974-46cc-85e7-2392e61250e1",
            "30acd190-609c-4109-8ee7-06fc5594af19",
            "fe28bda8-03f3-4c4a-8286-7fcfce4eeac1",
            "936efc61-a4d5-49fd-8694-085d1347db80",
            "c7209caa-18e5-4dd8-b68f-dd86e228d045",
            "7651cbe2-5fb8-464d-b0c4-3e830cda41dd",
            "a8c23058-6998-49f2-9f3b-a85e951d5ab0",
            "a334a745-1d67-4e1d-86a5-dadc04f144d2",
            "c1600692-e543-5cf2-a399-6bd96e6b817f",
            "42c2f7e3-91b4-5de8-bef0-d563440e9d52",
            "ff1ca997-b6cc-5ece-8e13-5498b4bbf808",
            "357a7003-b636-570e-a0bd-6bb63518d2f6");
    private static final Set<String> LEGACY_HIDDEN_BY_DEFAULT_LANDSCAPE_IDS = Set.of(
            "12322e3f-f351-5d40-b4ea-4a13d7e15854",
            "f050ee48-6891-4f83-995f-0f8be5e31b7f",
            "b167b4cd-4b78-4c84-a721-6b2adbbcab3c",
            "996d097a-cac2-4b5f-979a-b3a0b9803265",
            "bea90c22-b9c5-4c0c-9b10-89d875f50772",
            "71438941-0ceb-46ee-ad31-773cee700779",
            "762de708-85fa-4324-958e-56002a318f7f");

    private final LandscapeProperties properties;
    private final ObjectMapper objectMapper;

    private static final java.util.regex.Pattern FILENAME_PATTERN = java.util.regex.Pattern.compile(
            "^([A-Z]{2})_([A-Z]{3})_([A-Z])_([A-Z0-9]+)_([A-Z0-9]+)(?:_([A-Z0-9]+))?\\.([a-z]{2})\\.json$");

    private volatile List<LearningLandscape> cachedLandscapes = Collections.emptyList();
    private volatile Map<String, LearningLandscape> cachedById = Collections.emptyMap();
    private volatile Map<String, LearningLandscape> cachedByLegacyId = Collections.emptyMap();
    private volatile Map<String, String> goalIdToLandscapeId = Collections.emptyMap();
    private volatile Map<String, String> sourceLandscapeJurisdictionById = Collections.emptyMap();
    private volatile Map<String, Map<String, Set<String>>> sourceAtomicGoalIdsByLandscapeAndGoal = Collections.emptyMap();
    private volatile Map<String, String> sourceLandscapeIdByGoalId = Collections.emptyMap();
    private volatile Map<String, LandscapeSummary> compatibilityArchiveSummariesById = Collections.emptyMap();
    private volatile Map<String, List<TopicSummary>> compatibilityArchiveTopicsById = Collections.emptyMap();
    private volatile Set<String> curriculumManifest = Collections.emptySet();
    private volatile long lastLoadedFingerprint = -1L;
    private volatile long lastReloadCheck = 0L;
    private final Object reloadLock = new Object();
    private static final long RELOAD_CHECK_INTERVAL_MS = 2000L;

    public LandscapeService(LandscapeProperties properties, ObjectMapper objectMapper) {
        this.properties = properties;
        this.objectMapper = objectMapper;
        loadLandscapes();
    }

    public List<LearningLandscape> getAll() {
        ensureFresh();
        return cachedLandscapes;
    }

    public LearningLandscape getById(String landscapeId) {
        ensureFresh();
        return cachedById.get(landscapeId);
    }

    public String getLandscapeIdForGoal(String goalId) {
        ensureFresh();
        return goalIdToLandscapeId.get(goalId);
    }

    public String resolveLandscapeIdForGoalIncludingArchived(String goalId) {
        ensureFresh();
        if (!StringUtils.hasText(goalId)) {
            return null;
        }
        String loadedLandscapeId = goalIdToLandscapeId.get(goalId);
        if (loadedLandscapeId != null) {
            return loadedLandscapeId;
        }
        return sourceLandscapeIdByGoalId.get(goalId);
    }

    public com.skillpilot.backend.landscape.LearningGoal getGoalDefinition(String goalId) {
        ensureFresh();
        String landscapeId = goalIdToLandscapeId.get(goalId);
        if (landscapeId == null)
            return null;
        LearningLandscape landscape = cachedById.get(landscapeId);
        if (landscape == null || landscape.getGoals() == null)
            return null;
        return landscape.getGoals().stream()
                .filter(g -> g.getId().equals(goalId))
                .findFirst()
                .orElse(null);
    }

    public List<LearningLandscape> getClosure(String rootId) {
        ensureFresh();
        return getClosure(rootId, "de");
    }

    public List<LearningLandscape> getClosure(String rootId, String lang) {
        ensureFresh();
        LearningLandscape root = getById(rootId);
        if (root == null) {
            return Collections.emptyList();
        }

        // Keep traversal insertion order so frontend module lists remain stable and
        // follow curriculum authoring order (root contains order).
        Map<String, LearningLandscape> closure = new LinkedHashMap<>();
        collectClosure(root, closure);

        // Localize the results
        return closure.values().stream()
                .map(l -> localize(l, lang))
                .collect(Collectors.toList());
    }

    private LearningLandscape localize(LearningLandscape original, String lang) {
        if (original == null)
            return null;
        if (!"en".equals(lang))
            return original; // Default is German/original

        LearningLandscape copy = new LearningLandscape();
        copy.setLandscapeId(original.getLandscapeId());
        copy.setLocale(original.getLocale());
        copy.setSubject(original.getSubject());
        copy.setFrameworkId(original.getFrameworkId());
        copy.setFilters(original.getFilters());

        // Localize Landscape Title/Desc
        copy.setTitle(StringUtils.hasText(original.getTitleEn()) ? original.getTitleEn() : original.getTitle());
        copy.setDescription(StringUtils.hasText(original.getDescriptionEn()) ? original.getDescriptionEn()
                : original.getDescription());
        copy.setTitleEn(original.getTitleEn());
        copy.setDescriptionEn(original.getDescriptionEn());

        // Localize Goals
        if (original.getGoals() != null) {
            List<LearningGoal> localizedGoals = original.getGoals().stream().map(g -> {
                LearningGoal gc = new LearningGoal();
                gc.setId(g.getId());
                gc.setShortKey(g.getShortKey());
                gc.setCore(g.isCore());
                gc.setWeight(g.getWeight());
                gc.setTags(g.getTags());
                gc.setDimensionTags(g.getDimensionTags());
                gc.setRequires(g.getRequires());
                gc.setContains(g.getContains());
                gc.setExamples(g.getExamples());
                gc.setApplicability(g.getApplicability());
                gc.setSourceRef(g.getSourceRef());
                gc.setExtendedData(g.getExtendedData());
                gc.setRelease(g.getRelease());
                gc.setType(g.getType());
                gc.setNodeKind(g.getNodeKind());
                gc.setExamData(localizeExamData(g.getExamData(), lang));

                // Localize Goal Title/Desc
                gc.setTitle(StringUtils.hasText(g.getTitleEn()) ? g.getTitleEn() : g.getTitle());
                gc.setDescription(
                        StringUtils.hasText(g.getDescriptionEn()) ? g.getDescriptionEn() : g.getDescription());
                gc.setTitleEn(g.getTitleEn());
                gc.setDescriptionEn(g.getDescriptionEn());

                return gc;
            }).collect(Collectors.toList());
            copy.setGoals(localizedGoals);
        }

        return copy;
    }

    private ExamData localizeExamData(ExamData original, String lang) {
        if (original == null) {
            return null;
        }
        if (!"en".equals(lang)) {
            return original;
        }

        ExamData copy = new ExamData();
        copy.setTaskContent(StringUtils.hasText(original.getTaskContentEn())
                ? original.getTaskContentEn()
                : original.getTaskContent());
        copy.setTaskContentEn(original.getTaskContentEn());
        copy.setSolutionContent(StringUtils.hasText(original.getSolutionContentEn())
                ? original.getSolutionContentEn()
                : original.getSolutionContent());
        copy.setSolutionContentEn(original.getSolutionContentEn());
        copy.setScoring(original.getScoring());
        return copy;
    }

    private void collectClosure(LearningLandscape current, Map<String, LearningLandscape> visited) {
        if (current == null || visited.containsKey(current.getLandscapeId())) {
            return;
        }
        visited.put(current.getLandscapeId(), current);

        if (current.getGoals() != null) {
            for (LearningGoal goal : current.getGoals()) {
                collectReferences(goal.getContains(), visited);
                collectReferences(goal.getRequires(), visited);
            }
        }
    }

    private void collectReferences(List<String> refs, Map<String, LearningLandscape> visited) {
        if (refs == null)
            return;
        for (String ref : refs) {
            // Ref is now a UUID (Goal ID)
            String landscapeId = goalIdToLandscapeId.get(ref);
            if (landscapeId != null && !visited.containsKey(landscapeId)) {
                collectClosure(getById(landscapeId), visited);
            }
        }
    }

    private void loadLandscapes() {
        Path dir = Path.of(properties.getDirectory()).toAbsolutePath().normalize();
        if (!Files.isDirectory(dir)) {
            log.warn("Landscape directory does not exist: {}", dir);
            cachedLandscapes = Collections.emptyList();
            cachedById = Collections.emptyMap();
            cachedByLegacyId = Collections.emptyMap();
            goalIdToLandscapeId = Collections.emptyMap();
            sourceLandscapeJurisdictionById = Collections.emptyMap();
            sourceAtomicGoalIdsByLandscapeAndGoal = Collections.emptyMap();
            sourceLandscapeIdByGoalId = Collections.emptyMap();
            compatibilityArchiveSummariesById = Collections.emptyMap();
            compatibilityArchiveTopicsById = Collections.emptyMap();
            curriculumManifest = Collections.emptySet();
            lastLoadedFingerprint = -1L;
            return;
        }

        List<LearningLandscape> loaded = new ArrayList<>();
        Map<String, LearningLandscape> byId = new HashMap<>();
        Map<String, LearningLandscape> byLegacyId = new HashMap<>();
        Map<String, String> goalIndex = new HashMap<>();
        long maxLastModified = 0L;
        boolean criticalParseError = false;

        try {
            List<Path> files = Files.walk(dir)
                    .filter(Files::isRegularFile)
                    .filter(p -> StringUtils.hasText(p.getFileName().toString()))
                    .filter(p -> p.getFileName().toString().endsWith(".json"))
                    .sorted()
                    .collect(Collectors.toList());
            for (Path file : files) {
                try {
                    long lastModified = Files.getLastModifiedTime(file).toMillis();
                    if (lastModified > maxLastModified) {
                        maxLastModified = lastModified;
                    }
                } catch (IOException e) {
                    log.debug("Could not read lastModified for {}", file, e);
                }
                try {
                    JsonNode root = objectMapper.readTree(file.toFile());
                    if (root == null || !root.isObject()) {
                        log.debug("Skipping non-landscape JSON file {}: not a JSON object", file);
                        continue;
                    }
                    boolean hasLandscapeId = root.hasNonNull("landscapeId") || root.hasNonNull("id");
                    if (!hasLandscapeId) {
                        log.debug("Skipping non-landscape JSON file {}: missing landscapeId", file);
                        continue;
                    }
                    if (!root.has("goals") || !root.get("goals").isArray()) {
                        log.debug("Skipping non-landscape JSON file {}: missing goals array", file);
                        continue;
                    }

                    LearningLandscape landscape = objectMapper.treeToValue(root, LearningLandscape.class);
                    if (!StringUtils.hasText(landscape.getLandscapeId())) {
                        log.warn("Skipping landscape without id: {}", file);
                        continue;
                    }

                    // Map legacy ID from filename & Metadata
                    String filename = file.getFileName().toString();
                    java.util.regex.Matcher matcher = FILENAME_PATTERN.matcher(filename);
                    if (matcher.matches()) {
                        String locale = matcher.group(7);
                        String legacyId = filename.replace("." + locale + ".json", "");
                        byLegacyId.put(legacyId, landscape);

                        // Backfill metadata if missing (Legacy Files)
                        if (landscape.getCountry() == null)
                            landscape.setCountry(matcher.group(1));
                        if (landscape.getRegion() == null)
                            landscape.setRegion(matcher.group(2));
                        if (landscape.getLocale() == null)
                            landscape.setLocale(locale);

                        // Mapping logic from getLandscapeOverviewResponse
                        String p4 = matcher.group(4);
                        if (landscape.getSchoolType() == null)
                            landscape.setSchoolType(p4);

                        String p5 = matcher.group(5);
                        String p6 = matcher.group(6);
                        String mappedSubject = p6 != null ? p6 : p5;
                        if (landscape.getSubject() == null)
                            landscape.setSubject(mappedSubject);
                    }

                    loaded.add(landscape);

                } catch (com.fasterxml.jackson.databind.exc.MismatchedInputException e) {
                    if (isCriticalLandscapeFile(file)) {
                        criticalParseError = true;
                        log.error("Failed to read critical landscape file {}", file, e);
                    } else {
                        log.debug("Skipping non-landscape JSON file {}: {}", file, e.getMessage());
                    }
                } catch (Exception e) {
                    if (isCriticalLandscapeFile(file)) {
                        criticalParseError = true;
                    }
                    log.error("Failed to read landscape file {}", file, e);
                }
            }
        } catch (Exception e) {
            log.error("Failed to list landscapes in {}", dir, e);
        }

        long archivedSourceMaxLastModified = loadArchivedSourceLandscapes(dir, loaded);
        if (archivedSourceMaxLastModified > maxLastModified) {
            maxLastModified = archivedSourceMaxLastModified;
        }

        if (criticalParseError && !cachedLandscapes.isEmpty()) {
            log.warn("Critical landscape parse errors detected. Keeping previous cache with {} landscapes and {} goals.",
                    cachedLandscapes.size(), goalIdToLandscapeId.size());
            // Avoid repeated reload attempts on unchanged broken files.
            lastLoadedFingerprint = maxLastModified;
            return;
        }

        for (LearningLandscape l : loaded) {
            byId.put(l.getLandscapeId(), l);
            if (l.getGoals() != null) {
                for (LearningGoal g : l.getGoals()) {
                    goalIndex.put(g.getId(), l.getLandscapeId());
                }
            }
        }

        cachedLandscapes = Collections.unmodifiableList(loaded);
        cachedById = Collections.unmodifiableMap(byId);
        cachedByLegacyId = Collections.unmodifiableMap(byLegacyId);
        goalIdToLandscapeId = Collections.unmodifiableMap(goalIndex);
        sourceLandscapeJurisdictionById = Collections.unmodifiableMap(loadSourceLandscapeRegistry(dir));
        sourceAtomicGoalIdsByLandscapeAndGoal = Collections.unmodifiableMap(loadSourceGoalClosureRegistry(dir));
        sourceLandscapeIdByGoalId = Collections.unmodifiableMap(loadSourceGoalMembershipRegistry(dir));
        compatibilityArchiveSummariesById = Collections.unmodifiableMap(loadCompatibilityArchiveRegistry(dir));
        compatibilityArchiveTopicsById = Collections.unmodifiableMap(loadCompatibilityTopicRegistry(dir));
        Set<String> knownRootIds = new LinkedHashSet<>(cachedById.keySet());
        knownRootIds.addAll(compatibilityArchiveSummariesById.keySet());
        curriculumManifest = loadCurriculumManifest(dir, knownRootIds);
        lastLoadedFingerprint = maxLastModified;
        log.info("Loaded {} landscapes and {} goals from {}", loaded.size(), goalIndex.size(), dir);
    }

    private long loadArchivedSourceLandscapes(Path dir, List<LearningLandscape> loaded) {
        Path registryFile = dir.resolve(SOURCE_LANDSCAPE_REGISTRY_PATH);
        if (!Files.isRegularFile(registryFile)) {
            return 0L;
        }
        long maxLastModified = 0L;
        Set<String> loadedLandscapeIds = loaded.stream()
                .map(LearningLandscape::getLandscapeId)
                .filter(StringUtils::hasText)
                .collect(Collectors.toCollection(LinkedHashSet::new));
        try {
            JsonNode root = objectMapper.readTree(registryFile.toFile());
            if (root == null || !root.isObject()) {
                throw new IllegalStateException("Invalid source landscape registry root: " + registryFile);
            }
            JsonNode versionNode = root.get("version");
            if (versionNode == null || !versionNode.canConvertToInt()
                    || versionNode.intValue() != SUPPORTED_SOURCE_REGISTRY_VERSION) {
                throw new IllegalStateException("Unsupported source landscape registry version in " + registryFile);
            }
            JsonNode entriesNode = root.get("entries");
            if (entriesNode == null || !entriesNode.isArray()) {
                throw new IllegalStateException("Source landscape registry has no entries array: " + registryFile);
            }

            for (JsonNode entry : entriesNode) {
                if (entry == null || !entry.isObject()) {
                    continue;
                }
                String landscapeId = readRegistryText(entry, "landscapeId");
                String archiveSourcePath = readRegistryText(entry, "archiveSourcePath");
                if (!StringUtils.hasText(landscapeId) || !StringUtils.hasText(archiveSourcePath)
                        || loadedLandscapeIds.contains(landscapeId)) {
                    continue;
                }

                Path snapshotFile = resolveRegistryRepoPath(dir, archiveSourcePath);
                if (!Files.isRegularFile(snapshotFile)) {
                    log.warn("Archived source landscape snapshot not found for {}: {}", landscapeId, snapshotFile);
                    continue;
                }

                try {
                    long lastModified = Files.getLastModifiedTime(snapshotFile).toMillis();
                    if (lastModified > maxLastModified) {
                        maxLastModified = lastModified;
                    }
                } catch (IOException e) {
                    log.debug("Could not read lastModified for {}", snapshotFile, e);
                }

                try {
                    JsonNode snapshotRoot = objectMapper.readTree(snapshotFile.toFile());
                    if (snapshotRoot == null || !snapshotRoot.isObject()) {
                        log.warn("Skipping archived source snapshot {}: invalid JSON object", snapshotFile);
                        continue;
                    }
                    boolean hasLandscapeId = snapshotRoot.hasNonNull("landscapeId") || snapshotRoot.hasNonNull("id");
                    if (!hasLandscapeId || !snapshotRoot.has("goals") || !snapshotRoot.get("goals").isArray()) {
                        log.warn("Skipping archived source snapshot {}: not a landscape payload", snapshotFile);
                        continue;
                    }

                    LearningLandscape landscape = objectMapper.treeToValue(snapshotRoot, LearningLandscape.class);
                    if (!StringUtils.hasText(landscape.getLandscapeId())) {
                        log.warn("Skipping archived source snapshot without landscapeId: {}", snapshotFile);
                        continue;
                    }
                    if (!landscapeId.equals(landscape.getLandscapeId())) {
                        log.warn(
                                "Skipping archived source snapshot {}: registry landscapeId {} does not match payload {}",
                                snapshotFile,
                                landscapeId,
                                landscape.getLandscapeId());
                        continue;
                    }

                    loaded.add(landscape);
                    loadedLandscapeIds.add(landscapeId);
                } catch (Exception e) {
                    log.error("Failed to read archived source landscape {}", snapshotFile, e);
                }
            }
        } catch (IOException e) {
            throw new IllegalStateException("Failed to load archived source landscapes from " + registryFile, e);
        }
        return maxLastModified;
    }

    private Path resolveRegistryRepoPath(Path curriculaDir, String repoRelativePath) {
        for (String candidatePath : registryPathCandidates(repoRelativePath)) {
            Path directCandidate = curriculaDir.resolve(candidatePath).normalize();
            if (Files.exists(directCandidate)) {
                return directCandidate;
            }
            Path repoRoot = curriculaDir.getParent();
            if (repoRoot != null) {
                Path repoCandidate = repoRoot.resolve(candidatePath).normalize();
                if (Files.exists(repoCandidate)) {
                    return repoCandidate;
                }
            }
            if (candidatePath.startsWith("curricula/")) {
                Path curriculaRelativeCandidate = curriculaDir.resolve(candidatePath.substring("curricula/".length()))
                        .normalize();
                if (Files.exists(curriculaRelativeCandidate)) {
                    return curriculaRelativeCandidate;
                }
            }
        }
        String normalizedRepoRelativePath = normalizeRetainedAssetPath(repoRelativePath);
        if (normalizedRepoRelativePath.startsWith("curricula/")) {
            return curriculaDir.resolve(normalizedRepoRelativePath.substring("curricula/".length())).normalize();
        }
        return curriculaDir.resolve(normalizedRepoRelativePath).normalize();
    }

    private List<String> registryPathCandidates(String repoRelativePath) {
        String normalized = normalizeRetainedAssetPath(repoRelativePath);
        if (normalized.equals(repoRelativePath)) {
            return List.of(repoRelativePath);
        }
        return List.of(repoRelativePath, normalized);
    }

    private String normalizeRetainedAssetPath(String repoRelativePath) {
        if (!StringUtils.hasText(repoRelativePath)) {
            return repoRelativePath;
        }
        String normalized = repoRelativePath;
        for (Map.Entry<String, String> entry : RETAINED_ASSET_PATH_NORMALIZATIONS.entrySet()) {
            if (normalized.startsWith(entry.getKey())) {
                return entry.getValue() + normalized.substring(entry.getKey().length());
            }
        }
        return normalized;
    }

    private boolean isCriticalLandscapeFile(Path file) {
        String filename = file.getFileName().toString();
        return FILENAME_PATTERN.matcher(filename).matches();
    }

    public LandscapeOverviewResponse getOverview() {
        return getOverview("de");
    }

    public LandscapeOverviewResponse getOverview(String lang) {
        return getOverview(lang, true);
    }

    public LandscapeOverviewResponse getOverview(String lang, boolean includeCompatibility) {
        ensureFresh();
        Map<String, LandscapeSummary> summaryById = new LinkedHashMap<>();
        for (LearningLandscape ll : cachedLandscapes) {
            summaryById.put(ll.getLandscapeId(), toOverviewSummary(ll, lang));
        }
        for (LandscapeSummary archiveSummary : compatibilityArchiveSummariesById.values()) {
            summaryById.put(archiveSummary.getCurriculumId(), archiveSummary);
        }
        List<LandscapeSummary> summaries = new ArrayList<>(summaryById.values());

        List<LandscapeSummary> rootSummaries;
        if (!curriculumManifest.isEmpty()) {
            Map<String, LandscapeSummary> byId = new HashMap<>();
            for (LandscapeSummary summary : summaries) {
                byId.putIfAbsent(summary.getCurriculumId(), summary);
            }
            rootSummaries = new ArrayList<>();
            for (String id : curriculumManifest) {
                LandscapeSummary summary = byId.get(id);
                if (summary != null) {
                    if (!includeCompatibility
                            && (summary.isCompatibilityOnly() || summary.isLegacyHiddenByDefault())) {
                        continue;
                    }
                    rootSummaries.add(summary);
                }
            }
        } else {
            // Filter out non-root curricula (those that are contained in others)
            Set<String> referencedIds = getReferencedLandscapeIds();
            rootSummaries = summaries.stream()
                    .filter(s -> includeCompatibility || (!s.isCompatibilityOnly() && !s.isLegacyHiddenByDefault()))
                    .filter(s -> !referencedIds.contains(s.getCurriculumId()))
                    .filter(s -> {
                        LearningLandscape landscape = cachedById.get(s.getCurriculumId());
                        return landscape == null || !isModuleLandscape(landscape);
                    })
                    .collect(Collectors.toList());
        }

        Map<String, Object> hierarchy = buildHierarchy(rootSummaries);
        return new LandscapeOverviewResponse(rootSummaries, hierarchy);
    }

    // ...

    private Set<String> getReferencedLandscapeIds() {
        Set<String> referenced = new HashSet<>();
        for (LearningLandscape l : cachedLandscapes) {
            if (l.getGoals() == null)
                continue;
            for (LearningGoal g : l.getGoals()) {
                if (g.getContains() != null) {
                    for (String ref : g.getContains()) {
                        String refLandscapeId = goalIdToLandscapeId.get(ref);
                        if (refLandscapeId != null && !refLandscapeId.equals(l.getLandscapeId())) {
                            // Only consider it a "referenced landscape" (sub-module) if the reference
                            // points to the ROOT goal of that other landscape.
                            // This prevents false positives when two curricula share identical sub-goals
                            // (e.g. CEFR levels).
                            LearningLandscape refLandscape = getById(refLandscapeId);
                            if (refLandscape != null) {
                                String refRootId = getRootGoalId(refLandscape);
                                if (ref.equals(refRootId)) {
                                    referenced.add(refLandscapeId);
                                }
                            }
                        }
                    }
                }
            }
        }
        return referenced;
    }

    private boolean isModuleLandscape(LearningLandscape landscape) {
        if (landscape == null) {
            return false;
        }
        LearningGoal rootGoal = getRootGoal(landscape);
        if (rootGoal != null && rootGoal.getTags() != null) {
            for (String tag : rootGoal.getTags()) {
                if (tag == null) {
                    continue;
                }
                String normalized = tag.toLowerCase(Locale.ROOT);
                if (normalized.startsWith("module:") || normalized.startsWith("modul:")) {
                    return true;
                }
            }
        }
        String title = landscape.getTitle();
        if (title == null || title.isBlank()) {
            return false;
        }
        String normalizedTitle = title.toLowerCase(Locale.ROOT);
        return normalizedTitle.matches(".*\\bmodul\\b.*") || normalizedTitle.matches(".*\\bmodule\\b.*");
    }

    private LearningGoal getRootGoal(LearningLandscape landscape) {
        if (landscape == null || landscape.getGoals() == null || landscape.getGoals().isEmpty()) {
            return null;
        }
        for (LearningGoal g : landscape.getGoals()) {
            if (g.getTags() != null && g.getTags().contains("root")) {
                return g;
            }
        }
        return landscape.getGoals().get(0);
    }

    private String getRootGoalId(LearningLandscape l) {
        if (l.getGoals() == null || l.getGoals().isEmpty()) {
            return null;
        }
        // Strategy 1: Look for "root" tag
        for (LearningGoal g : l.getGoals()) {
            if (g.getTags() != null && g.getTags().contains("root")) {
                return g.getId();
            }
        }
        // Strategy 2: Fallback to the first goal
        return l.getGoals().get(0).getId();
    }

    public List<LandscapeSummary> getBaseCurricula() {
        return getBaseCurricula(true);
    }

    public List<LandscapeSummary> getBaseCurricula(boolean includeCompatibility) {
        // Base curricula are all root landscapes that are not referenced
        // as sub-landscapes in others. This keeps AI and Explorer in sync
        // without hardcoding specific curriculum IDs.
        return getOverview("de", includeCompatibility).getSummaries();
    }

    public boolean isCompatibilityOnlyLandscape(String landscapeId) {
        ensureFresh();
        return landscapeId != null
                && (COMPATIBILITY_ONLY_LANDSCAPE_IDS.contains(landscapeId)
                        || isLegacyBavariaGymnasiumLandscape(landscapeId));
    }

    public boolean isLegacyHiddenByDefaultLandscape(String landscapeId) {
        return landscapeId != null && LEGACY_HIDDEN_BY_DEFAULT_LANDSCAPE_IDS.contains(landscapeId);
    }

    private boolean isLegacyBavariaGymnasiumLandscape(String landscapeId) {
        LearningLandscape landscape = cachedById.get(landscapeId);
        if (landscape == null) {
            return false;
        }
        return "DE".equalsIgnoreCase(landscape.getCountry())
                && "BY".equalsIgnoreCase(landscape.getRegion())
                && "Gymnasium".equalsIgnoreCase(landscape.getSchoolType());
    }

    public String resolveSourceLandscapeJurisdiction(String landscapeId) {
        ensureFresh();
        if (!StringUtils.hasText(landscapeId)) {
            return null;
        }
        LearningLandscape landscape = cachedById.get(landscapeId);
        if (landscape != null) {
            String jurisdiction = normalizeBundeslandCode(landscape.getRegion());
            if (jurisdiction != null) {
                return jurisdiction;
            }
        }
        return sourceLandscapeJurisdictionById.get(landscapeId);
    }

    public Set<String> resolveSourceAtomicGoalIds(String landscapeId, String goalId) {
        ensureFresh();
        if (!StringUtils.hasText(landscapeId) || !StringUtils.hasText(goalId)) {
            return Collections.emptySet();
        }
        Map<String, Set<String>> byGoalId = sourceAtomicGoalIdsByLandscapeAndGoal.get(landscapeId);
        if (byGoalId == null || byGoalId.isEmpty()) {
            return Collections.emptySet();
        }
        return byGoalId.getOrDefault(goalId, Collections.emptySet());
    }

    public LandscapeSummary getCompatibilityArchiveSummary(String landscapeId) {
        ensureFresh();
        if (!StringUtils.hasText(landscapeId)) {
            return null;
        }
        return compatibilityArchiveSummariesById.get(landscapeId);
    }

    public List<TopicSummary> getCompatibilityArchiveTopics(String landscapeId) {
        ensureFresh();
        if (!StringUtils.hasText(landscapeId)) {
            return Collections.emptyList();
        }
        return compatibilityArchiveTopicsById.getOrDefault(landscapeId, Collections.emptyList());
    }

    private Map<String, Object> buildHierarchy(List<LandscapeSummary> summaries) {
        Map<String, Object> hierarchy = new HashMap<>();
        for (LandscapeSummary summary : summaries) {
            String country = summary.getCountry();
            String region = summary.getRegion();
            String mappedType = summary.getType();
            String mappedSubject = summary.getSubject();

            if (country == null) {
                country = "Unknown";
            }
            if (region == null) {
                region = "Unknown";
            }
            if (mappedType == null) {
                mappedType = "Other";
            }
            if (mappedSubject == null) {
                mappedSubject = "General";
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> countryMap = (Map<String, Object>) hierarchy.computeIfAbsent(country,
                    k -> new HashMap<>());
            @SuppressWarnings("unchecked")
            Map<String, Object> regionMap = (Map<String, Object>) countryMap.computeIfAbsent(region,
                    k -> new HashMap<>());
            @SuppressWarnings("unchecked")
            Map<String, Object> typeMap = (Map<String, Object>) regionMap.computeIfAbsent(mappedType,
                    k -> new HashMap<>());

            String level = "General";
            @SuppressWarnings("unchecked")
            List<String> subjects = (List<String>) typeMap.computeIfAbsent(level, k -> new ArrayList<>());

            if (!subjects.contains(mappedSubject)) {
                subjects.add(mappedSubject);
            }
        }
        return hierarchy;
    }

    private Map<String, String> loadSourceLandscapeRegistry(Path dir) {
        Path registryFile = dir.resolve(SOURCE_LANDSCAPE_REGISTRY_PATH);
        if (!Files.isRegularFile(registryFile)) {
            return Collections.emptyMap();
        }
        try {
            JsonNode root = objectMapper.readTree(registryFile.toFile());
            if (root == null || !root.isObject()) {
                throw new IllegalStateException("Invalid source landscape registry root: " + registryFile);
            }
            JsonNode versionNode = root.get("version");
            if (versionNode == null || !versionNode.canConvertToInt()
                    || versionNode.intValue() != SUPPORTED_SOURCE_REGISTRY_VERSION) {
                throw new IllegalStateException("Unsupported source landscape registry version in " + registryFile);
            }
            JsonNode entriesNode = root.get("entries");
            if (entriesNode == null || !entriesNode.isArray()) {
                throw new IllegalStateException("Source landscape registry has no entries array: " + registryFile);
            }

            Map<String, String> result = new LinkedHashMap<>();
            for (JsonNode entry : entriesNode) {
                if (entry == null || !entry.isObject()) {
                    continue;
                }
                String landscapeId = readRegistryText(entry, "landscapeId");
                String jurisdiction = normalizeBundeslandCode(readRegistryText(entry, "jurisdiction"));
                if (!StringUtils.hasText(landscapeId) || !StringUtils.hasText(jurisdiction)) {
                    throw new IllegalStateException("Invalid source landscape registry entry in " + registryFile);
                }
                result.put(landscapeId, jurisdiction);
            }
            return result;
        } catch (IOException e) {
            throw new IllegalStateException("Failed to load source landscape registry from " + registryFile, e);
        }
    }

    private Map<String, Map<String, Set<String>>> loadSourceGoalClosureRegistry(Path dir) {
        Path registryFile = dir.resolve(SOURCE_GOAL_CLOSURE_REGISTRY_PATH);
        if (!Files.isRegularFile(registryFile)) {
            return Collections.emptyMap();
        }
        try {
            JsonNode root = objectMapper.readTree(registryFile.toFile());
            if (root == null || !root.isObject()) {
                throw new IllegalStateException("Invalid source goal closure registry root: " + registryFile);
            }
            JsonNode versionNode = root.get("version");
            if (versionNode == null || !versionNode.canConvertToInt()
                    || versionNode.intValue() != SUPPORTED_SOURCE_GOAL_CLOSURE_REGISTRY_VERSION) {
                throw new IllegalStateException("Unsupported source goal closure registry version in " + registryFile);
            }
            JsonNode landscapesNode = root.get("landscapes");
            if (landscapesNode == null || !landscapesNode.isArray()) {
                throw new IllegalStateException("Source goal closure registry has no landscapes array: " + registryFile);
            }

            Map<String, Map<String, Set<String>>> result = new LinkedHashMap<>();
            for (JsonNode landscapeNode : landscapesNode) {
                if (landscapeNode == null || !landscapeNode.isObject()) {
                    continue;
                }
                String landscapeId = readRegistryText(landscapeNode, "landscapeId");
                JsonNode closuresNode = landscapeNode.get("goalAtomicClosures");
                if (!StringUtils.hasText(landscapeId) || closuresNode == null || !closuresNode.isObject()) {
                    throw new IllegalStateException("Invalid source goal closure registry entry in " + registryFile);
                }

                Map<String, Set<String>> closuresByGoalId = new LinkedHashMap<>();
                closuresNode.fields().forEachRemaining(entry -> {
                    String goalId = entry.getKey();
                    JsonNode atomicIdsNode = entry.getValue();
                    if (!StringUtils.hasText(goalId) || atomicIdsNode == null || !atomicIdsNode.isArray()) {
                        throw new IllegalStateException(
                                "Invalid source goal closure registry goal entry in " + registryFile);
                    }
                    Set<String> atomicIds = new LinkedHashSet<>();
                    for (JsonNode atomicIdNode : atomicIdsNode) {
                        if (atomicIdNode == null || !atomicIdNode.isTextual()
                                || !StringUtils.hasText(atomicIdNode.asText())) {
                            throw new IllegalStateException(
                                    "Invalid source goal closure registry atomic id in " + registryFile);
                        }
                        atomicIds.add(atomicIdNode.asText());
                    }
                    closuresByGoalId.put(goalId, Collections.unmodifiableSet(atomicIds));
                });
                result.put(landscapeId, Collections.unmodifiableMap(closuresByGoalId));
            }
            return result;
        } catch (IOException e) {
            throw new IllegalStateException("Failed to load source goal closure registry from " + registryFile, e);
        }
    }

    private Map<String, String> loadSourceGoalMembershipRegistry(Path dir) {
        Path registryFile = dir.resolve(SOURCE_GOAL_MEMBERSHIP_REGISTRY_PATH);
        if (!Files.isRegularFile(registryFile)) {
            return Collections.emptyMap();
        }
        try {
            JsonNode root = objectMapper.readTree(registryFile.toFile());
            if (root == null || !root.isObject()) {
                throw new IllegalStateException("Invalid source goal membership registry root: " + registryFile);
            }
            JsonNode versionNode = root.get("version");
            if (versionNode == null || !versionNode.canConvertToInt()
                    || versionNode.intValue() != SUPPORTED_SOURCE_GOAL_MEMBERSHIP_REGISTRY_VERSION) {
                throw new IllegalStateException("Unsupported source goal membership registry version in " + registryFile);
            }
            JsonNode landscapesNode = root.get("landscapes");
            if (landscapesNode == null || !landscapesNode.isArray()) {
                throw new IllegalStateException("Source goal membership registry has no landscapes array: " + registryFile);
            }

            Map<String, String> result = new LinkedHashMap<>();
            for (JsonNode landscapeNode : landscapesNode) {
                if (landscapeNode == null || !landscapeNode.isObject()) {
                    continue;
                }
                String landscapeId = readRegistryText(landscapeNode, "landscapeId");
                JsonNode goalIdsNode = landscapeNode.get("goalIds");
                if (!StringUtils.hasText(landscapeId) || goalIdsNode == null || !goalIdsNode.isArray()) {
                    throw new IllegalStateException("Invalid source goal membership registry entry in " + registryFile);
                }
                for (JsonNode goalIdNode : goalIdsNode) {
                    if (goalIdNode == null || !goalIdNode.isTextual()
                            || !StringUtils.hasText(goalIdNode.asText())) {
                        throw new IllegalStateException(
                                "Invalid source goal membership registry goal id in " + registryFile);
                    }
                    String goalId = goalIdNode.asText();
                    String existing = result.putIfAbsent(goalId, landscapeId);
                    if (existing != null && !existing.equals(landscapeId)) {
                        throw new IllegalStateException(
                                "Conflicting source goal membership registry goal id '%s' in %s"
                                        .formatted(goalId, registryFile));
                    }
                }
            }
            return result;
        } catch (IOException e) {
            throw new IllegalStateException("Failed to load source goal membership registry from " + registryFile, e);
        }
    }

    private String readRegistryText(JsonNode node, String field) {
        JsonNode value = node.get(field);
        return value != null && value.isTextual() ? value.asText() : null;
    }

    private Map<String, LandscapeSummary> loadCompatibilityArchiveRegistry(Path dir) {
        Path registryFile = dir.resolve(COMPATIBILITY_ARCHIVE_REGISTRY_PATH);
        if (!Files.isRegularFile(registryFile)) {
            return Collections.emptyMap();
        }
        try {
            JsonNode root = objectMapper.readTree(registryFile.toFile());
            if (root == null || !root.isObject()) {
                throw new IllegalStateException("Invalid compatibility archive registry root: " + registryFile);
            }
            JsonNode versionNode = root.get("version");
            if (versionNode == null || !versionNode.canConvertToInt()
                    || versionNode.intValue() != SUPPORTED_COMPATIBILITY_ARCHIVE_REGISTRY_VERSION) {
                throw new IllegalStateException("Unsupported compatibility archive registry version in " + registryFile);
            }
            JsonNode entriesNode = root.get("entries");
            if (entriesNode == null || !entriesNode.isArray()) {
                throw new IllegalStateException("Compatibility archive registry has no entries array: " + registryFile);
            }

            Map<String, LandscapeSummary> result = new LinkedHashMap<>();
            for (JsonNode entry : entriesNode) {
                if (entry == null || !entry.isObject()) {
                    continue;
                }
                String landscapeId = readRegistryText(entry, "landscapeId");
                String title = readRegistryText(entry, "title");
                if (!StringUtils.hasText(landscapeId) || !StringUtils.hasText(title)) {
                    throw new IllegalStateException("Invalid compatibility archive registry entry in " + registryFile);
                }
                String description = readRegistryText(entry, "description");
                String country = readRegistryText(entry, "country");
                String region = readRegistryText(entry, "region");
                String type = readRegistryText(entry, "type");
                String subject = readRegistryText(entry, "subject");
                String locale = readRegistryText(entry, "locale");
                List<LandscapeFilter> filters = new ArrayList<>();
                JsonNode filtersNode = entry.get("filters");
                if (filtersNode != null && !filtersNode.isNull()) {
                    if (!filtersNode.isArray()) {
                        throw new IllegalStateException(
                                "Compatibility archive registry filters must be an array in " + registryFile);
                    }
                    for (JsonNode filterNode : filtersNode) {
                        if (filterNode == null || !filterNode.isObject()) {
                            throw new IllegalStateException(
                                    "Invalid compatibility archive registry filter entry in " + registryFile);
                        }
                        String id = readRegistryText(filterNode, "id");
                        String label = readRegistryText(filterNode, "label");
                        if (!StringUtils.hasText(id) || !StringUtils.hasText(label)) {
                            throw new IllegalStateException(
                                    "Invalid compatibility archive registry filter values in " + registryFile);
                        }
                        LandscapeFilter filter = new LandscapeFilter();
                        filter.setId(id);
                        filter.setLabel(label);
                        filters.add(filter);
                    }
                }
                result.put(landscapeId, new LandscapeSummary(
                        landscapeId,
                        title,
                        description,
                        country,
                        region,
                        type,
                        subject,
                        locale,
                        filters,
                        true));
            }
            return result;
        } catch (IOException e) {
            throw new IllegalStateException("Failed to load compatibility archive registry from " + registryFile, e);
        }
    }

    private Map<String, List<TopicSummary>> loadCompatibilityTopicRegistry(Path dir) {
        Path registryFile = dir.resolve(COMPATIBILITY_TOPIC_REGISTRY_PATH);
        if (!Files.isRegularFile(registryFile)) {
            return Collections.emptyMap();
        }
        try {
            JsonNode root = objectMapper.readTree(registryFile.toFile());
            if (root == null || !root.isObject()) {
                throw new IllegalStateException("Invalid compatibility topic registry root: " + registryFile);
            }
            JsonNode versionNode = root.get("version");
            if (versionNode == null || !versionNode.canConvertToInt()
                    || versionNode.intValue() != SUPPORTED_COMPATIBILITY_TOPIC_REGISTRY_VERSION) {
                throw new IllegalStateException("Unsupported compatibility topic registry version in " + registryFile);
            }
            JsonNode entriesNode = root.get("entries");
            if (entriesNode == null || !entriesNode.isArray()) {
                throw new IllegalStateException("Compatibility topic registry has no entries array: " + registryFile);
            }

            Map<String, List<TopicSummary>> result = new LinkedHashMap<>();
            for (JsonNode entry : entriesNode) {
                if (entry == null || !entry.isObject()) {
                    continue;
                }
                String curriculumId = readRegistryText(entry, "curriculumId");
                JsonNode topicsNode = entry.get("topics");
                if (!StringUtils.hasText(curriculumId) || topicsNode == null || !topicsNode.isArray()) {
                    throw new IllegalStateException("Invalid compatibility topic registry entry in " + registryFile);
                }
                List<TopicSummary> topics = new ArrayList<>();
                for (JsonNode topicNode : topicsNode) {
                    if (topicNode == null || !topicNode.isObject()) {
                        throw new IllegalStateException("Invalid compatibility topic registry topic entry in " + registryFile);
                    }
                    String topicId = readRegistryText(topicNode, "id");
                    String title = readRegistryText(topicNode, "title");
                    String titleEn = readRegistryText(topicNode, "titleEn");
                    if (!StringUtils.hasText(topicId) || !StringUtils.hasText(title)) {
                        throw new IllegalStateException("Invalid compatibility topic registry topic values in " + registryFile);
                    }
                    topics.add(new TopicSummary(topicId, title, StringUtils.hasText(titleEn) ? titleEn : title));
                }
                result.put(curriculumId, List.copyOf(topics));
            }
            return result;
        } catch (IOException e) {
            throw new IllegalStateException("Failed to load compatibility topic registry from " + registryFile, e);
        }
    }

    private String normalizeBundeslandCode(String region) {
        if (!StringUtils.hasText(region)) {
            return null;
        }
        String normalized = region.trim().toUpperCase(Locale.ROOT);
        if (normalized.equals("HE") || normalized.equals("HES") || normalized.equals("DE-HE")) {
            return "DE-HE";
        }
        if (normalized.equals("BY") || normalized.equals("BAY") || normalized.equals("DE-BY")) {
            return "DE-BY";
        }
        return null;
    }

    private void ensureFresh() {
        long now = System.currentTimeMillis();
        if (now - lastReloadCheck < RELOAD_CHECK_INTERVAL_MS) {
            return;
        }
        lastReloadCheck = now;
        Path dir = Path.of(properties.getDirectory()).toAbsolutePath().normalize();
        long latest = getLatestTimestamp(dir);
        if (latest <= lastLoadedFingerprint) {
            return;
        }
        synchronized (reloadLock) {
            if (latest <= lastLoadedFingerprint) {
                return;
            }
            log.info("Landscape files changed ({} > {}), reloading...", latest, lastLoadedFingerprint);
            loadLandscapes();
        }
    }

    private long getLatestTimestamp(Path dir) {
        if (!Files.isDirectory(dir)) {
            return -1L;
        }
        try {
            return Files.walk(dir)
                    .filter(Files::isRegularFile)
                    .filter(p -> StringUtils.hasText(p.getFileName().toString()))
                    .filter(p -> p.getFileName().toString().endsWith(".json"))
                    .mapToLong(p -> {
                        try {
                            return Files.getLastModifiedTime(p).toMillis();
                        } catch (IOException e) {
                            return 0L;
                        }
                    })
                    .max()
                    .orElse(0L);
        } catch (IOException e) {
            log.warn("Failed to scan landscape directory for changes: {}", dir, e);
            return lastLoadedFingerprint;
        }
    }

    private LandscapeSummary toOverviewSummary(LearningLandscape ll, String lang) {
        String country = ll.getCountry();
        String region = ll.getRegion();
        String mappedType = ll.getSchoolType();
        String mappedSubject = ll.getSubject();

        if (country == null)
            country = "Unknown";
        if (region == null)
            region = "Unknown";
        if (mappedType == null)
            mappedType = "Other";
        if (mappedSubject == null)
            mappedSubject = "General";

        String displayTitle;
        if ("en".equals(lang) && StringUtils.hasText(ll.getTitleEn())) {
            displayTitle = ll.getTitleEn();
        } else {
            displayTitle = ll.getTitle();
        }

        String displayDescription;
        if ("en".equals(lang) && StringUtils.hasText(ll.getDescriptionEn())) {
            displayDescription = ll.getDescriptionEn();
        } else {
            displayDescription = ll.getDescription();
        }

        if (!StringUtils.hasText(displayTitle)) {
            displayTitle = String.format("%s %s %s %s", country, region, mappedType, mappedSubject);
        }

        return new LandscapeSummary(ll.getLandscapeId(), displayTitle, displayDescription,
                country, region, mappedType, mappedSubject, ll.getLocale(),
                ll.getFilters() != null ? ll.getFilters() : new ArrayList<>(),
                isCompatibilityOnlyLandscape(ll.getLandscapeId()),
                isLegacyHiddenByDefaultLandscape(ll.getLandscapeId()));
    }

    private Set<String> loadCurriculumManifest(Path dir, Set<String> knownLandscapeIds) {
        Path manifestPath = dir.resolve("curriculum_manifest.json");
        if (!Files.exists(manifestPath)) {
            log.info("Curriculum manifest not found at {}", manifestPath);
            return Collections.emptySet();
        }

        try {
            JsonNode root = objectMapper.readTree(manifestPath.toFile());
            JsonNode curricula = root != null ? root.get("curricula") : null;
            if (curricula == null || !curricula.isArray()) {
                log.warn("Curriculum manifest missing curricula array: {}", manifestPath);
                return Collections.emptySet();
            }

            Set<String> ids = new LinkedHashSet<>();
            for (JsonNode node : curricula) {
                String id = null;
                if (node.isTextual()) {
                    id = node.asText();
                } else if (node.isObject()) {
                    JsonNode idNode = node.get("id");
                    if (idNode == null || !idNode.isTextual()) {
                        idNode = node.get("landscapeId");
                    }
                    if (idNode == null || !idNode.isTextual()) {
                        idNode = node.get("curriculumId");
                    }
                    if (idNode != null && idNode.isTextual()) {
                        id = idNode.asText();
                    } else {
                        log.warn("Curriculum manifest entry missing id: {}", node);
                        continue;
                    }
                } else {
                    log.warn("Curriculum manifest entry is not a string/object: {}", node);
                    continue;
                }
                if (!StringUtils.hasText(id)) {
                    continue;
                }
                if (!knownLandscapeIds.contains(id)) {
                    log.warn("Curriculum manifest references unknown landscape: {}", id);
                    continue;
                }
                ids.add(id);
            }
            return Collections.unmodifiableSet(ids);
        } catch (Exception e) {
            log.error("Failed to read curriculum manifest {}", manifestPath, e);
            return Collections.emptySet();
        }
    }

    public LearningLandscape findCurriculumByTopic(String topic) {
        if (topic == null || topic.isBlank()) {
            return null;
        }

        String[] keywords = topic.toLowerCase().split("\\s+");
        LearningLandscape bestMatch = null;
        long maxScore = 0;

        for (LearningLandscape l : cachedLandscapes) {
            long score = 0;
            String title = (l.getTitle() != null ? l.getTitle() : "").toLowerCase();
            String id = l.getLandscapeId().toLowerCase();

            for (String keyword : keywords) {
                if (title.contains(keyword) || id.contains(keyword)) {
                    score++;
                }
            }

            if (score > maxScore) {
                maxScore = score;
                bestMatch = l;
            }
        }

        if (bestMatch == null) {
            return null;
        }

        // Determine the set of base curricula dynamically
        List<LandscapeSummary> baseSummaries = getBaseCurricula();
        Set<String> baseIds = baseSummaries.stream()
                .map(LandscapeSummary::getCurriculumId)
                .collect(Collectors.toSet());

        // If the match is already a base curriculum, return it
        if (baseIds.contains(bestMatch.getLandscapeId())) {
            return bestMatch;
        }

        // Otherwise, try to find a base curriculum that contains this match
        final LearningLandscape matchToFind = bestMatch;
        for (String baseId : baseIds) {
            // Optimization: check if we have the base loaded
            LearningLandscape base = getById(baseId);
            if (base == null)
                continue;

            // Check closure (includes the base itself usually, but we want to check if
            // bestMatch is in it)
            List<LearningLandscape> closure = getClosure(baseId);
            boolean containsMatch = closure.stream()
                    .anyMatch(l -> l.getLandscapeId().equals(matchToFind.getLandscapeId()));

            if (containsMatch) {
                return base;
            }
        }

        // Fallback: return the specific match if no base parent found
        return bestMatch;
    }

    public List<com.skillpilot.backend.api.FrontierGoal> findGoalsByTopic(String landscapeId, String query) {
        ensureFresh();
        if (landscapeId == null || query == null || query.isBlank()) {
            return Collections.emptyList();
        }

        List<LearningLandscape> closure = getClosure(landscapeId);
        LearningLandscape root = getById(landscapeId);
        if (root != null && closure.stream().noneMatch(l -> l.getLandscapeId().equals(root.getLandscapeId()))) {
            closure = new ArrayList<>(closure);
            closure.add(root);
        }

        String[] keywords = query.toLowerCase().split("\\s+");
        List<com.skillpilot.backend.api.FrontierGoal> results = new ArrayList<>();

        // First pass: AND logic
        for (LearningLandscape l : closure) {
            if (l.getGoals() != null) {
                for (LearningGoal g : l.getGoals()) {
                    if (matchesQuery(g, keywords, true)) {
                        addResult(results, g);
                    }
                }
            }
        }

        // Second pass: OR logic (fallback if no results)
        if (results.isEmpty()) {
            for (LearningLandscape l : closure) {
                if (l.getGoals() != null) {
                    for (LearningGoal g : l.getGoals()) {
                        if (matchesQuery(g, keywords, false)) {
                            addResult(results, g);
                        }
                    }
                }
            }
        }
        return results;
    }

    private boolean matchesQuery(LearningGoal g, String[] keywords, boolean andLogic) {
        String title = g.getTitle() != null ? g.getTitle().toLowerCase() : "";
        String desc = g.getDescription() != null ? g.getDescription().toLowerCase() : "";
        Set<String> tags = new HashSet<>();
        if (g.getTags() != null) {
            g.getTags().forEach(t -> tags.add(t.toLowerCase()));
        }
        if (g.getDimensionTags() != null) {
            DimensionTags dt = g.getDimensionTags();
            if (dt.getFramework() != null)
                tags.add(dt.getFramework().toLowerCase());
            if (dt.getDemandLevel() != null)
                tags.add(dt.getDemandLevel().toLowerCase());
            if (dt.getPhase() != null)
                tags.add(dt.getPhase().toLowerCase());
            if (dt.getArea() != null)
                tags.add(dt.getArea().toLowerCase());
            if (dt.getTopicCode() != null)
                tags.add(dt.getTopicCode().toLowerCase());
            if (dt.getProcessCompetencies() != null) {
                dt.getProcessCompetencies().forEach(t -> tags.add(t.toLowerCase()));
            }
            if (dt.getGuidingIdeas() != null) {
                dt.getGuidingIdeas().forEach(t -> tags.add(t.toLowerCase()));
            }
        }

        if (andLogic) {
            for (String keyword : keywords) {
                boolean keywordMatch = title.contains(keyword) || desc.contains(keyword);
                if (!keywordMatch) {
                    for (String tag : tags) {
                        if (tag.contains(keyword)) {
                            keywordMatch = true;
                            break;
                        }
                    }
                }
                if (!keywordMatch) {
                    return false;
                }
            }
            return true;
        } else {
            // OR logic
            for (String keyword : keywords) {
                if (title.contains(keyword) || desc.contains(keyword)) {
                    return true;
                }
                for (String tag : tags) {
                    if (tag.contains(keyword)) {
                        return true;
                    }
                }
            }
            return false;
        }
    }

    private void addResult(List<com.skillpilot.backend.api.FrontierGoal> results, LearningGoal g) {
        // Avoid duplicates
        if (results.stream().anyMatch(r -> r.id().equals(g.getId()))) {
            return;
        }
        String type = (g.getContains() != null && !g.getContains().isEmpty()) ? "cluster" : "atomic";
        String nodeKind = g.getNodeKind();
        if (nodeKind == null || nodeKind.isBlank()) {
            nodeKind = (g.getExamData() != null) ? "exam" : "tutor";
        }
        results.add(new com.skillpilot.backend.api.FrontierGoal(
                g.getId(),
                g.getTitle(),
                g.getDescription(),
                type,
                nodeKind,
                "Search Result",
                g.getTags(),
                null,
                g.getSourceRef(),
                null,
                null,
                null));
    }
}
