package com.skillpilot.backend.landscape;

import com.skillpilot.backend.api.LandscapeOverviewResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
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

    private final LandscapeProperties properties;
    private final ObjectMapper objectMapper;

    private static final java.util.regex.Pattern FILENAME_PATTERN = java.util.regex.Pattern.compile(
            "^([A-Z]{2})_([A-Z]{3})_([A-Z])_([A-Z0-9]+)_([A-Z0-9]+)(?:_([A-Z0-9]+))?\\.([a-z]{2})\\.json$");

    private volatile List<LearningLandscape> cachedLandscapes = Collections.emptyList();
    private volatile Map<String, LearningLandscape> cachedById = Collections.emptyMap();
    private volatile Map<String, LearningLandscape> cachedByLegacyId = Collections.emptyMap();
    private volatile Map<String, String> goalIdToLandscapeId = Collections.emptyMap();
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

        Map<String, LearningLandscape> closure = new HashMap<>();
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
                gc.setSourceRef(g.getSourceRef());
                gc.setExtendedData(g.getExtendedData());
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
            goalIdToLandscapeId = Collections.emptyMap();
            lastLoadedFingerprint = -1L;
            return;
        }

        List<LearningLandscape> loaded = new ArrayList<>();
        Map<String, LearningLandscape> byId = new HashMap<>();
        Map<String, LearningLandscape> byLegacyId = new HashMap<>();
        Map<String, String> goalIndex = new HashMap<>();
        long maxLastModified = 0L;

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
                    log.debug("Skipping non-landscape JSON file {}: {}", file, e.getMessage());
                } catch (Exception e) {
                    log.error("Failed to read landscape file {}", file, e);
                }
            }
        } catch (Exception e) {
            log.error("Failed to list landscapes in {}", dir, e);
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
        curriculumManifest = loadCurriculumManifest(dir, cachedById);
        lastLoadedFingerprint = maxLastModified;
        log.info("Loaded {} landscapes and {} goals from {}", loaded.size(), goalIndex.size(), dir);
    }

    public LandscapeOverviewResponse getOverview() {
        return getOverview("de");
    }

    public LandscapeOverviewResponse getOverview(String lang) {
        ensureFresh();
        List<LandscapeSummary> summaries = new ArrayList<>();

        for (LearningLandscape ll : cachedLandscapes) {
            String country = ll.getCountry();
            String region = ll.getRegion();
            String mappedType = ll.getSchoolType();
            String mappedSubject = ll.getSubject();

            // Skip if metadata is missing (e.g. if simpler JSONs are added without valid
            // metadata)
            if (country == null)
                country = "Unknown";
            if (region == null)
                region = "Unknown";
            if (mappedType == null)
                mappedType = "Other";
            if (mappedSubject == null)
                mappedSubject = "General";

            String displayTitle = null;
            String displayDescription = null;

            // Select Title
            if ("en".equals(lang) && StringUtils.hasText(ll.getTitleEn())) {
                displayTitle = ll.getTitleEn();
            } else {
                displayTitle = ll.getTitle();
            }

            // Select Description
            if ("en".equals(lang) && StringUtils.hasText(ll.getDescriptionEn())) {
                displayDescription = ll.getDescriptionEn();
            } else {
                displayDescription = ll.getDescription();
            }

            // Fallbacks
            if (!StringUtils.hasText(displayTitle)) {
                displayTitle = String.format("%s %s %s %s", country, region, mappedType, mappedSubject);
            }

            summaries.add(new LandscapeSummary(ll.getLandscapeId(), displayTitle, displayDescription,
                    country, region, mappedType, mappedSubject, ll.getLocale(),
                    ll.getFilters() != null ? ll.getFilters() : new ArrayList<>()));

        }

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
                    rootSummaries.add(summary);
                }
            }
        } else {
            // Filter out non-root curricula (those that are contained in others)
            Set<String> referencedIds = getReferencedLandscapeIds();
            rootSummaries = summaries.stream()
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
        // Base curricula are all root landscapes that are not referenced
        // as sub-landscapes in others. This keeps AI and Explorer in sync
        // without hardcoding specific curriculum IDs.
        return getOverview().getSummaries();
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

    private Set<String> loadCurriculumManifest(Path dir, Map<String, LearningLandscape> byId) {
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
                if (!byId.containsKey(id)) {
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
                null));
    }
}
