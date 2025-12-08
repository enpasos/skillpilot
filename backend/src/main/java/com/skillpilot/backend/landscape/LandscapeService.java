package com.skillpilot.backend.landscape;

import com.skillpilot.backend.api.LandscapeOverviewResponse;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
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

    public LandscapeService(LandscapeProperties properties, ObjectMapper objectMapper) {
        this.properties = properties;
        this.objectMapper = objectMapper;
        loadLandscapes();
    }

    public List<LearningLandscape> getAll() {
        return cachedLandscapes;
    }

    public LearningLandscape getById(String landscapeId) {
        return cachedById.get(landscapeId);
    }

    public String getLandscapeIdForGoal(String goalId) {
        return goalIdToLandscapeId.get(goalId);
    }

    public com.skillpilot.backend.landscape.LearningGoal getGoalDefinition(String goalId) {
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
        return getClosure(rootId, "de");
    }

    public List<LearningLandscape> getClosure(String rootId, String lang) {
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
            return;
        }

        List<LearningLandscape> loaded = new ArrayList<>();
        Map<String, LearningLandscape> byId = new HashMap<>();
        Map<String, LearningLandscape> byLegacyId = new HashMap<>();
        Map<String, String> goalIndex = new HashMap<>();

        try {
            List<Path> files = Files.walk(dir)
                    .filter(Files::isRegularFile)
                    .filter(p -> StringUtils.hasText(p.getFileName().toString()))
                    .filter(p -> p.getFileName().toString().endsWith(".json"))
                    .sorted()
                    .collect(Collectors.toList());
            for (Path file : files) {
                try {
                    LearningLandscape landscape = objectMapper.readValue(file.toFile(), new TypeReference<>() {
                    });
                    if (landscape.getLandscapeId() == null) {
                        log.warn("Skipping landscape without id: {}", file);
                        continue;
                    }
                    loaded.add(landscape);

                    // Map legacy ID from filename
                    String filename = file.getFileName().toString();
                    java.util.regex.Matcher matcher = FILENAME_PATTERN.matcher(filename);
                    if (matcher.matches()) {
                        String locale = matcher.group(7);
                        String legacyId = filename.replace("." + locale + ".json", "");
                        byLegacyId.put(legacyId, landscape);
                    }

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
        log.info("Loaded {} landscapes and {} goals from {}", loaded.size(), goalIndex.size(), dir);
    }

    public LandscapeOverviewResponse getOverview() {
        return getOverview("de");
    }

    public LandscapeOverviewResponse getOverview(String lang) {
        Path dir = Path.of(properties.getDirectory()).toAbsolutePath().normalize();
        if (!Files.isDirectory(dir)) {
            return new LandscapeOverviewResponse(Collections.emptyList(), Collections.emptyMap());
        }

        List<LandscapeSummary> summaries = new ArrayList<>();

        return getLandscapeOverviewResponse(dir, FILENAME_PATTERN, lang);
    }

    private LandscapeOverviewResponse getLandscapeOverviewResponse(Path dir, java.util.regex.Pattern regex,
            String lang) {
        List<LandscapeSummary> summaries = new ArrayList<>();
        Map<String, Object> hierarchy = new HashMap<>();

        try {
            List<Path> files = Files.walk(dir)
                    .filter(Files::isRegularFile)
                    .filter(p -> StringUtils.hasText(p.getFileName().toString()))
                    .filter(p -> p.getFileName().toString().endsWith(".json"))
                    .sorted()
                    .collect(Collectors.toList());

            for (Path file : files) {
                String filename = file.getFileName().toString();
                java.util.regex.Matcher matcher = regex.matcher(filename);
                if (matcher.matches()) {
                    String country = matcher.group(1);
                    String region = matcher.group(2);
                    String type = matcher.group(3);
                    String p4 = matcher.group(4);
                    String p5 = matcher.group(5);
                    String p6 = matcher.group(6);
                    String locale = matcher.group(7);

                    String mappedType = p4;
                    String mappedLevel = p5;
                    String mappedSubject = p6 != null ? p6 : p5;

                    String landscapeId = filename.replace("." + locale + ".json", "");

                    List<LandscapeFilter> filters = new ArrayList<>();
                    String displayTitle = null;
                    String displayDescription = null;

                    LearningLandscape ll = cachedByLegacyId.get(landscapeId);
                    if (ll != null) {
                        if (ll.getFilters() != null) {
                            filters = ll.getFilters();
                        }

                        // Select Title
                        if ("en".equals(lang) && ll.getTitleEn() != null && !ll.getTitleEn().isBlank()) {
                            displayTitle = ll.getTitleEn();
                        } else {
                            displayTitle = ll.getTitle();
                        }

                        // Select Description
                        if ("en".equals(lang) && ll.getDescriptionEn() != null && !ll.getDescriptionEn().isBlank()) {
                            displayDescription = ll.getDescriptionEn();
                        } else {
                            displayDescription = ll.getDescription();
                        }
                    }

                    // Fallbacks
                    if (displayTitle == null || displayTitle.isBlank()) {
                        displayTitle = String.format("%s %s %s %s", country, region, mappedType, mappedSubject);
                    }
                    if (displayDescription == null) {
                        displayDescription = "";
                    }

                    if (ll != null) {
                        summaries.add(
                                new LandscapeSummary(ll.getLandscapeId(), displayTitle, displayDescription, filters));
                    }

                    // Build hierarchy
                    Map<String, Object> countryMap = (Map<String, Object>) hierarchy.computeIfAbsent(country,
                            k -> new HashMap<>());
                    Map<String, Object> regionMap = (Map<String, Object>) countryMap.computeIfAbsent(region,
                            k -> new HashMap<>());
                    Map<String, Object> typeMap = (Map<String, Object>) regionMap.computeIfAbsent(mappedType,
                            k -> new HashMap<>());
                    List<String> subjects = (List<String>) typeMap.computeIfAbsent(mappedLevel, k -> new ArrayList<>());

                    if (!subjects.contains(mappedSubject)) {
                        subjects.add(mappedSubject);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to list landscapes for overview", e);
        }

        // Filter out non-root curricula (those that are contained in others)
        Set<String> referencedIds = getReferencedLandscapeIds();
        List<LandscapeSummary> rootSummaries = summaries.stream()
                .filter(s -> !referencedIds.contains(s.getCurriculumId()))
                .collect(Collectors.toList());

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
                            referenced.add(refLandscapeId);
                        }
                    }
                }
            }
        }
        return referenced;
    }

    public List<LandscapeSummary> getBaseCurricula() {
        // Base curricula are all root landscapes that are not referenced
        // as sub-landscapes in others. This keeps AI and Explorer in sync
        // without hardcoding specific curriculum IDs.
        return getOverview().getSummaries();
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
        results.add(new com.skillpilot.backend.api.FrontierGoal(
                g.getId(),
                g.getTitle(),
                g.getDescription(),
                type,
                "Search Result",
                g.getTags()));
    }
}
