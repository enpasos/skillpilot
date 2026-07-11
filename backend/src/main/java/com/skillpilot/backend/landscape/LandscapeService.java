package com.skillpilot.backend.landscape;

import com.skillpilot.backend.api.LandscapeOverviewResponse;
import com.skillpilot.backend.api.TopicSummary;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.skillpilot.backend.util.BundeslandCodeNormalizer;
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
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
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
    private static final int SUPPORTED_CANONICAL_GOAL_PROVENANCE_REGISTRY_VERSION = 1;
    private static final Path CANONICAL_GOAL_PROVENANCE_REGISTRY_PATH = Path.of(
            "DE", "Gymnasium", "provenance", "canonical-goal-provenance-registry.json");
    private static final int SUPPORTED_CANONICAL_GOAL_APPLICABILITY_OVERRIDE_REGISTRY_VERSION = 1;
    private static final Path CANONICAL_GOAL_APPLICABILITY_OVERRIDE_REGISTRY_PATH = Path.of(
            "DE", "Gymnasium", "provenance", "canonical-goal-applicability-override-registry.json");
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
            "762de708-85fa-4324-958e-56002a318f7f",
            "c862423f-d0ac-4a65-8ad2-9a6e560313a8",
            "d3a068ca-90c6-4d7f-ab6b-4d8b43085cb1",
            "8abb46ff-072b-41b7-9d70-0334cb5a1a6c",
            "2b995085-dc5e-47c6-a563-9dcfc01fb74d",
            "fcb04661-6ea2-4030-a9b2-97e6cc03daf8",
            "6232b783-199c-4c50-92f2-9fb31277e619",
            "fa8f864a-aac5-486d-8e77-40df2af038a3");

    private final LandscapeProperties properties;
    private final ObjectMapper objectMapper;
    private final GoalMappingService goalMappingService;

    private static final java.util.regex.Pattern FILENAME_PATTERN = java.util.regex.Pattern.compile(
            "^([A-Z]{2})_([A-Z]{3})_([A-Z])_([A-Z0-9]+)_([A-Z0-9]+)(?:_([A-Z0-9]+))?\\.([a-z]{2})\\.json$");

    private volatile List<LearningLandscape> cachedLandscapes = Collections.emptyList();
    private volatile Map<String, LearningLandscape> cachedById = Collections.emptyMap();
    private volatile Map<String, LearningLandscape> cachedByLegacyId = Collections.emptyMap();
    private volatile Map<String, String> goalIdToLandscapeId = Collections.emptyMap();
    private volatile Map<String, String> sourceLandscapeJurisdictionById = Collections.emptyMap();
    private volatile Map<String, Map<String, Set<String>>> sourceAtomicGoalIdsByLandscapeAndGoal = Collections.emptyMap();
    private volatile Map<String, String> sourceLandscapeIdByGoalId = Collections.emptyMap();
    private volatile Map<String, Map<String, Object>> canonicalGoalProvenanceByGoalId = Collections.emptyMap();
    private volatile Map<String, Map<String, List<String>>> canonicalGoalApplicabilityOverridesByGoalId = Collections.emptyMap();
    private volatile ConcurrentHashMap<String, Map<String, List<String>>> canonicalJurisdictionApplicabilityByLandscapeId = new ConcurrentHashMap<>();
    private volatile Map<String, LandscapeSummary> compatibilityArchiveSummariesById = Collections.emptyMap();
    private volatile Map<String, List<TopicSummary>> compatibilityArchiveTopicsById = Collections.emptyMap();
    private volatile Set<String> curriculumManifest = Collections.emptySet();
    private volatile long lastLoadedFingerprint = -1L;
    private volatile long lastReloadCheck = 0L;
    private final Object reloadLock = new Object();
    private static final long RELOAD_CHECK_INTERVAL_MS = 2000L;

    public LandscapeService(LandscapeProperties properties, ObjectMapper objectMapper) {
        this(properties, objectMapper, new GoalMappingService(properties, objectMapper));
    }

    @Autowired
    public LandscapeService(LandscapeProperties properties, ObjectMapper objectMapper, GoalMappingService goalMappingService) {
        this.properties = properties;
        this.objectMapper = objectMapper;
        this.goalMappingService = goalMappingService;
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

    public Map<String, Object> resolveGoalProvenance(LearningGoal goal) {
        ensureFresh();
        if (goal == null) {
            return Collections.emptyMap();
        }
        return resolveGoalProvenanceInternal(goal.getId(), goal.getExtendedData());
    }

    public String resolveGoalProvenanceValue(LearningGoal goal, String key) {
        if (!StringUtils.hasText(key)) {
            return null;
        }
        Object value = resolveGoalProvenance(goal).get(key);
        return value instanceof String text && StringUtils.hasText(text) ? text : null;
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
        boolean english = "en".equals(lang);

        LearningLandscape copy = new LearningLandscape();
        copy.setSchema(original.getSchema());
        copy.setLandscapeFormatVersion(original.getLandscapeFormatVersion());
        copy.setLandscapeId(original.getLandscapeId());
        copy.setLocale(original.getLocale());
        copy.setCountry(original.getCountry());
        copy.setRegion(original.getRegion());
        copy.setSchoolType(original.getSchoolType());
        copy.setSubject(original.getSubject());
        copy.setFrameworkId(original.getFrameworkId());
        copy.setCompatibilityOnly(original.getCompatibilityOnly());
        copy.setLegacyHiddenByDefault(original.getLegacyHiddenByDefault());
        copy.setFilters(original.getFilters());
        copy.setProgramUnits(original.getProgramUnits());
        copy.setGoalPlacements(original.getGoalPlacements());
        copy.setCompetencyCatalog(original.getCompetencyCatalog());

        // Localize Landscape Title/Desc
        copy.setTitle(english && StringUtils.hasText(original.getTitleEn()) ? original.getTitleEn() : original.getTitle());
        copy.setDescription(
                english && StringUtils.hasText(original.getDescriptionEn()) ? original.getDescriptionEn()
                        : original.getDescription());
        copy.setTitleEn(original.getTitleEn());
        copy.setDescriptionEn(original.getDescriptionEn());

        Map<String, List<String>> derivedJurisdictionsByGoalId = isCanonicalGymnasiumLandscape(original)
                ? canonicalJurisdictionApplicabilityByLandscapeId.computeIfAbsent(
                        original.getLandscapeId(),
                        ignored -> buildCanonicalJurisdictionApplicability(original.getGoals()))
                : Collections.emptyMap();

        // Localize Goals
        if (original.getGoals() != null) {
            List<LearningGoal> localizedGoals = original.getGoals().stream().map(g -> {
                LearningGoal gc = new LearningGoal();
                gc.setId(g.getId());
                gc.setShortKey(g.getShortKey());
                gc.setCore(g.getCore());
                gc.setWeight(g.getWeight());
                gc.setTags(g.getTags());
                gc.setDimensionTags(g.getDimensionTags());
                gc.setRequires(g.getRequires());
                gc.setContains(g.getContains());
                gc.setExamples(g.getExamples());
                gc.setApplicability(mergeApplicability(resolveGoalApplicability(g), derivedJurisdictionsByGoalId.get(g.getId())));
                gc.setSourceRef(g.getSourceRef());
                gc.setResourceLinks(g.getResourceLinks());
                gc.setCompetencyRefs(g.getCompetencyRefs());
                gc.setExtendedData(g.getExtendedData());
                gc.setRelease(g.getRelease());
                gc.setCourseLevel(g.getCourseLevel());
                gc.setThemenfeld(g.getThemenfeld());
                gc.setLeitideen(g.getLeitideen());
                gc.setKompetenzen(g.getKompetenzen());
                gc.setExperimentData(g.getExperimentData());
                gc.setPhase(g.getPhase());
                gc.setSemanticAtomic(g.getSemanticAtomic());
                gc.setSemanticKind(g.getSemanticKind());
                gc.setType(g.getType());
                gc.setNodeKind(g.getNodeKind());
                gc.setExamData(localizeExamData(g.getExamData(), lang));

                // Localize Goal Title/Desc
                gc.setTitle(english && StringUtils.hasText(g.getTitleEn()) ? g.getTitleEn() : g.getTitle());
                gc.setDescription(
                        english && StringUtils.hasText(g.getDescriptionEn()) ? g.getDescriptionEn() : g.getDescription());
                gc.setTitleEn(g.getTitleEn());
                gc.setDescriptionEn(g.getDescriptionEn());

                return gc;
            }).collect(Collectors.toList());
            copy.setGoals(localizedGoals);
        }

        return copy;
    }

    private boolean isCanonicalGymnasiumLandscape(LearningLandscape landscape) {
        if (landscape == null) {
            return false;
        }
        return "DE".equalsIgnoreCase(landscape.getCountry())
                && "DEU".equalsIgnoreCase(landscape.getRegion())
                && "Gymnasium".equalsIgnoreCase(landscape.getSchoolType())
                && StringUtils.hasText(landscape.getFrameworkId())
                && landscape.getFrameworkId().startsWith("canonical-gymnasium");
    }

    private Map<String, List<String>> buildCanonicalJurisdictionApplicability(List<LearningGoal> goals) {
        if (goals == null || goals.isEmpty()) {
            return Collections.emptyMap();
        }
        Map<String, LearningGoal> goalsById = new LinkedHashMap<>();
        for (LearningGoal goal : goals) {
            if (goal != null && StringUtils.hasText(goal.getId())) {
                goalsById.put(goal.getId(), goal);
            }
        }
        if (goalsById.isEmpty()) {
            return Collections.emptyMap();
        }

        Map<String, Set<String>> directMappingCoverageByGoalId = buildCanonicalJurisdictionCoverageFromMappings(goalsById.keySet());
        Map<String, Set<String>> coverageMemo = new HashMap<>();
        Map<String, List<String>> result = new LinkedHashMap<>();
        for (String goalId : goalsById.keySet()) {
            Set<String> jurisdictions = computeCanonicalJurisdictionCoverage(goalId, goalsById, directMappingCoverageByGoalId,
                    coverageMemo,
                    new HashSet<>());
            if (!jurisdictions.isEmpty()) {
                result.put(goalId, new ArrayList<>(jurisdictions));
            }
        }
        return result;
    }

    private Map<String, Set<String>> buildCanonicalJurisdictionCoverageFromMappings(Set<String> goalIds) {
        if (goalIds == null || goalIds.isEmpty()) {
            return Collections.emptyMap();
        }
        Map<String, Set<String>> result = new LinkedHashMap<>();
        for (ResolvedGoalMapping mapping : goalMappingService.getAllMappings()) {
            String canonicalGoalId = mapping.canonicalGoalId();
            if (!goalIds.contains(canonicalGoalId)) {
                continue;
            }
            String jurisdiction = resolveSourceLandscapeJurisdiction(mapping.sourceLandscapeId());
            if (!StringUtils.hasText(jurisdiction)) {
                continue;
            }
            result.computeIfAbsent(canonicalGoalId, ignored -> new LinkedHashSet<>()).add(jurisdiction);
        }
        return result;
    }

    private Set<String> computeCanonicalJurisdictionCoverage(
            String goalId,
            Map<String, LearningGoal> goalsById,
            Map<String, Set<String>> directMappingCoverageByGoalId,
            Map<String, Set<String>> coverageMemo,
            Set<String> visiting) {
        Set<String> cached = coverageMemo.get(goalId);
        if (cached != null) {
            return cached;
        }
        if (!StringUtils.hasText(goalId) || !visiting.add(goalId)) {
            return Collections.emptySet();
        }

        LearningGoal goal = goalsById.get(goalId);
        if (goal == null) {
            visiting.remove(goalId);
            return Collections.emptySet();
        }

        LinkedHashSet<String> coverage = new LinkedHashSet<>();
        addJurisdictionsFromApplicability(resolveGoalApplicability(goal), coverage);
        addJurisdictionsFromProvenance(goal, coverage);
        coverage.addAll(directMappingCoverageByGoalId.getOrDefault(goalId, Collections.emptySet()));

        if (goal.getContains() != null) {
            for (String childRef : goal.getContains()) {
                String childId = normalizeGoalRef(childRef);
                if (goalsById.containsKey(childId)) {
                    coverage.addAll(computeCanonicalJurisdictionCoverage(childId, goalsById, directMappingCoverageByGoalId,
                            coverageMemo, visiting));
                }
            }
        }

        visiting.remove(goalId);
        Set<String> result = Collections.unmodifiableSet(coverage);
        coverageMemo.put(goalId, result);
        return result;
    }

    private void addJurisdictionsFromApplicability(Map<String, List<String>> applicability, Set<String> target) {
        if (applicability == null || applicability.isEmpty()) {
            return;
        }
        List<String> jurisdictions = applicability.get("jurisdiction");
        if (jurisdictions == null) {
            return;
        }
        for (String jurisdiction : jurisdictions) {
            String normalized = normalizeBundeslandCode(jurisdiction);
            if (normalized != null) {
                target.add(normalized);
            }
        }
    }

    private void addJurisdictionsFromProvenance(LearningGoal goal, Set<String> target) {
        Map<String, Object> provenance = resolveGoalProvenanceInternal(
                goal == null ? null : goal.getId(),
                goal == null ? null : goal.getExtendedData());
        if (provenance.isEmpty()) {
            return;
        }
        addJurisdictionFromLandscapeReference(provenance.get("sourceLandscapeId"), target);
        addJurisdictionFromLandscapeReference(provenance.get("additionalSourceLandscapeIds"), target);
        addJurisdictionFromLandscapeReference(provenance.get("crossSubjectPrerequisiteLandscapeIds"), target);
    }

    private Map<String, List<String>> resolveGoalApplicability(LearningGoal goal) {
        if (goal == null) {
            return null;
        }
        LinkedHashMap<String, List<String>> merged = new LinkedHashMap<>();
        mergeApplicabilityDimensions(merged, goal.getApplicability());
        mergeApplicabilityDimensions(
                merged,
                resolveGoalApplicabilityOverridesInternal(goal.getId(), goal.getExtendedData()));
        return finalizeApplicabilityMap(merged);
    }

    private Map<String, List<String>> resolveGoalApplicabilityOverridesInternal(String goalId, Map<String, Object> extendedData) {
        Map<String, List<String>> registry = StringUtils.hasText(goalId)
                ? canonicalGoalApplicabilityOverridesByGoalId.get(goalId)
                : null;
        Map<String, List<String>> embedded = extractEmbeddedApplicabilityOverrides(extendedData);
        if ((registry == null || registry.isEmpty()) && (embedded == null || embedded.isEmpty())) {
            return null;
        }
        LinkedHashMap<String, List<String>> merged = new LinkedHashMap<>();
        mergeApplicabilityDimensions(merged, registry);
        mergeApplicabilityDimensions(merged, embedded);
        return finalizeApplicabilityMap(merged);
    }

    private void mergeApplicabilityDimensions(
            Map<String, List<String>> target,
            Map<String, List<String>> source) {
        if (source == null || source.isEmpty()) {
            return;
        }
        for (Map.Entry<String, List<String>> entry : source.entrySet()) {
            if (!StringUtils.hasText(entry.getKey())) {
                continue;
            }
            LinkedHashSet<String> values = new LinkedHashSet<>(target.getOrDefault(entry.getKey(), Collections.emptyList()));
            if (entry.getValue() != null) {
                for (String value : entry.getValue()) {
                    if (StringUtils.hasText(value)) {
                        values.add(value);
                    }
                }
            }
            target.put(entry.getKey(), new ArrayList<>(values));
        }
    }

    private Map<String, List<String>> finalizeApplicabilityMap(Map<String, List<String>> applicability) {
        if (applicability == null || applicability.isEmpty()) {
            return null;
        }
        LinkedHashMap<String, List<String>> result = new LinkedHashMap<>();
        for (Map.Entry<String, List<String>> entry : applicability.entrySet()) {
            result.put(
                    entry.getKey(),
                    entry.getValue() == null ? Collections.emptyList() : Collections.unmodifiableList(new ArrayList<>(entry.getValue())));
        }
        return Collections.unmodifiableMap(result);
    }

    @SuppressWarnings("unchecked")
    private Map<String, List<String>> extractEmbeddedApplicabilityOverrides(Map<String, Object> extendedData) {
        if (extendedData == null || extendedData.isEmpty()) {
            return null;
        }
        Object raw = extendedData.get("applicabilityOverrides");
        if (!(raw instanceof Map<?, ?> overrides)) {
            return null;
        }
        LinkedHashMap<String, List<String>> result = new LinkedHashMap<>();
        overrides.forEach((key, value) -> {
            if (!(key instanceof String textKey) || !(value instanceof List<?> rawValues)) {
                return;
            }
            List<String> values = rawValues.stream()
                    .filter(String.class::isInstance)
                    .map(String.class::cast)
                    .filter(StringUtils::hasText)
                    .collect(Collectors.toCollection(ArrayList::new));
            if (!values.isEmpty()) {
                result.put(textKey, values);
            }
        });
        return result.isEmpty() ? null : finalizeApplicabilityMap(result);
    }

    private Map<String, Object> resolveGoalProvenanceInternal(String goalId, Map<String, Object> extendedData) {
        Map<String, Object> embedded = extractEmbeddedProvenance(extendedData);
        Map<String, Object> registry = StringUtils.hasText(goalId) ? canonicalGoalProvenanceByGoalId.get(goalId) : null;
        if ((embedded == null || embedded.isEmpty()) && (registry == null || registry.isEmpty())) {
            return Collections.emptyMap();
        }
        LinkedHashMap<String, Object> merged = new LinkedHashMap<>();
        if (registry != null && !registry.isEmpty()) {
            merged.putAll(registry);
        }
        if (embedded != null && !embedded.isEmpty()) {
            merged.putAll(embedded);
        }
        return Collections.unmodifiableMap(merged);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> extractEmbeddedProvenance(Map<String, Object> extendedData) {
        if (extendedData == null || extendedData.isEmpty()) {
            return null;
        }
        Object provenanceRaw = extendedData.get("provenance");
        if (!(provenanceRaw instanceof Map<?, ?> provenance)) {
            return null;
        }
        LinkedHashMap<String, Object> result = new LinkedHashMap<>();
        provenance.forEach((key, value) -> {
            if (key instanceof String textKey && value != null) {
                result.put(textKey, value);
            }
        });
        return result.isEmpty() ? null : Collections.unmodifiableMap(result);
    }

    private void addJurisdictionFromLandscapeReference(Object value, Set<String> target) {
        if (value instanceof String text) {
            String jurisdiction = resolveSourceLandscapeJurisdiction(text);
            if (jurisdiction != null) {
                target.add(jurisdiction);
            }
            return;
        }
        if (value instanceof List<?> list) {
            for (Object item : list) {
                addJurisdictionFromLandscapeReference(item, target);
            }
        }
    }

    private Map<String, List<String>> mergeApplicability(
            Map<String, List<String>> applicability,
            List<String> derivedJurisdictions) {
        boolean hasApplicability = applicability != null && !applicability.isEmpty();
        boolean hasDerivedJurisdictions = derivedJurisdictions != null && !derivedJurisdictions.isEmpty();
        if (!hasApplicability && !hasDerivedJurisdictions) {
            return null;
        }

        LinkedHashMap<String, List<String>> merged = new LinkedHashMap<>();
        if (hasApplicability) {
            for (Map.Entry<String, List<String>> entry : applicability.entrySet()) {
                List<String> values = entry.getValue();
                merged.put(entry.getKey(), values == null ? Collections.emptyList() : new ArrayList<>(values));
            }
        }
        if (hasDerivedJurisdictions) {
            LinkedHashSet<String> jurisdictions = new LinkedHashSet<>(merged.getOrDefault("jurisdiction", Collections.emptyList()));
            jurisdictions.addAll(derivedJurisdictions);
            merged.put("jurisdiction", new ArrayList<>(jurisdictions));
        }
        return merged;
    }

    private String normalizeGoalRef(String ref) {
        if (!StringUtils.hasText(ref)) {
            return ref;
        }
        int separatorIndex = ref.indexOf(':');
        if (separatorIndex >= 0 && separatorIndex < ref.length() - 1) {
            return ref.substring(separatorIndex + 1);
        }
        return ref;
    }

    private ExamData localizeExamData(ExamData original, String lang) {
        if (original == null) {
            return null;
        }
        if (!"en".equals(lang)) {
            return original;
        }

        ExamData copy = new ExamData();
        copy.setReviewStatus(original.getReviewStatus());
        copy.setReviewNote(original.getReviewNote());
        copy.setCoveredGoalIds(original.getCoveredGoalIds());
        copy.setCoveredStrands(original.getCoveredStrands());
        copy.setDemandLevels(original.getDemandLevels());
        copy.setSourceArtifactPath(original.getSourceArtifactPath());
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
            canonicalGoalProvenanceByGoalId = Collections.emptyMap();
            canonicalGoalApplicabilityOverridesByGoalId = Collections.emptyMap();
            canonicalJurisdictionApplicabilityByLandscapeId = new ConcurrentHashMap<>();
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
        canonicalGoalProvenanceByGoalId = Collections.unmodifiableMap(loadCanonicalGoalProvenanceRegistry(dir));
        canonicalGoalApplicabilityOverridesByGoalId = Collections.unmodifiableMap(
                loadCanonicalGoalApplicabilityOverrideRegistry(dir));
        canonicalJurisdictionApplicabilityByLandscapeId = new ConcurrentHashMap<>();
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
                    LearningLandscape sourceExtractionLandscape = findSourceExtractionLandscape(
                            entry,
                            dir,
                            snapshotFile,
                            landscapeId);
                    if (sourceExtractionLandscape != null) {
                        loaded.add(sourceExtractionLandscape);
                        loadedLandscapeIds.add(landscapeId);
                        continue;
                    }
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
                    LearningLandscape landscape = readArchivedSourceLandscape(snapshotFile, entry, dir, landscapeId);
                    if (landscape == null) {
                        continue;
                    }
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

    private LearningLandscape readArchivedSourceLandscape(
            Path snapshotFile,
            JsonNode registryEntry,
            Path curriculaDir,
            String expectedLandscapeId) {
        if (isJsonLikePath(snapshotFile)) {
            try {
                JsonNode snapshotRoot = objectMapper.readTree(snapshotFile.toFile());
                LearningLandscape sourceExtractionLandscape = sourceExtractionToLandscape(snapshotRoot, expectedLandscapeId);
                if (sourceExtractionLandscape != null) {
                    return sourceExtractionLandscape;
                }
                if (snapshotRoot == null || !snapshotRoot.isObject()) {
                    log.warn("Skipping archived source snapshot {}: invalid JSON object", snapshotFile);
                    return null;
                }
                boolean hasLandscapeId = snapshotRoot.hasNonNull("landscapeId") || snapshotRoot.hasNonNull("id");
                if (!hasLandscapeId || !snapshotRoot.has("goals") || !snapshotRoot.get("goals").isArray()) {
                    log.warn("Skipping archived source snapshot {}: not a landscape payload", snapshotFile);
                    return null;
                }

                return objectMapper.treeToValue(snapshotRoot, LearningLandscape.class);
            } catch (Exception e) {
                log.error("Failed to read archived source landscape {}", snapshotFile, e);
                return null;
            }
        }

        LearningLandscape sourceExtractionLandscape = findSourceExtractionLandscape(
                registryEntry,
                curriculaDir,
                snapshotFile,
                expectedLandscapeId);
        if (sourceExtractionLandscape != null) {
            return sourceExtractionLandscape;
        }

        log.debug("Skipping archived source snapshot {}: not a JSON landscape or source-extraction payload", snapshotFile);
        return null;
    }

    private boolean isJsonLikePath(Path path) {
        String filename = path.getFileName().toString().toLowerCase(Locale.ROOT);
        return filename.endsWith(".json") || filename.endsWith(".json.snapshot");
    }

    private LearningLandscape findSourceExtractionLandscape(
            JsonNode registryEntry,
            Path curriculaDir,
            Path archiveSourceFile,
            String expectedLandscapeId) {
        List<Path> roots = new ArrayList<>();
        String archivePath = readRegistryText(registryEntry, "archivePath");
        if (StringUtils.hasText(archivePath)) {
            Path archiveDir = resolveRegistryRepoPath(curriculaDir, archivePath);
            roots.add(archiveDir.resolve("source-extraction"));
        }
        Path archiveParent = archiveSourceFile.getParent();
        if (archiveParent != null) {
            roots.add(archiveParent.resolve("source-extraction"));
        }

        Set<Path> visited = new LinkedHashSet<>();
        for (Path root : roots) {
            Path normalizedRoot = root.normalize();
            if (!visited.add(normalizedRoot) || !Files.isDirectory(normalizedRoot)) {
                continue;
            }
            try (java.util.stream.Stream<Path> stream = Files.walk(normalizedRoot)) {
                List<Path> candidates = stream
                        .filter(Files::isRegularFile)
                        .filter(this::isJsonLikePath)
                        .filter(path -> path.getFileName().toString().endsWith(".source-extraction.json"))
                        .collect(Collectors.toList());
                for (Path candidate : candidates) {
                    try {
                        LearningLandscape landscape = sourceExtractionToLandscape(
                                objectMapper.readTree(candidate.toFile()),
                                expectedLandscapeId);
                        if (landscape != null) {
                            return landscape;
                        }
                    } catch (Exception e) {
                        log.debug("Could not read source-extraction candidate {}", candidate, e);
                    }
                }
            } catch (IOException e) {
                log.debug("Could not scan source-extraction directory {}", normalizedRoot, e);
            }
        }
        return null;
    }

    private LearningLandscape sourceExtractionToLandscape(JsonNode root, String expectedLandscapeId) {
        if (root == null || !root.isObject() || !root.hasNonNull("sourceLandscapeId")
                || !root.has("sourceGoals") || !root.get("sourceGoals").isArray()) {
            return null;
        }
        String sourceLandscapeId = root.get("sourceLandscapeId").asText();
        if (!expectedLandscapeId.equals(sourceLandscapeId)) {
            return null;
        }

        LearningLandscape landscape = new LearningLandscape();
        landscape.setLandscapeId(sourceLandscapeId);
        landscape.setTitle(readRegistryText(root, "title"));
        landscape.setSubject(readRegistryText(root, "subject"));
        landscape.setCountry("DE");
        landscape.setRegion(normalizeBundeslandCode(readRegistryText(root, "jurisdiction")));
        landscape.setGoals(objectMapper.convertValue(
                root.get("sourceGoals"),
                new TypeReference<List<LearningGoal>>() {
                }));
        return landscape;
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
        LearningLandscape landscape = landscapeId == null ? null : cachedById.get(landscapeId);
        return landscapeId != null
                && (Boolean.TRUE.equals(landscape != null ? landscape.getCompatibilityOnly() : null)
                        || COMPATIBILITY_ONLY_LANDSCAPE_IDS.contains(landscapeId)
                        || sourceLandscapeJurisdictionById.containsKey(landscapeId)
                        || isLegacyBavariaGymnasiumLandscape(landscapeId));
    }

    public boolean isLegacyHiddenByDefaultLandscape(String landscapeId) {
        ensureFresh();
        LearningLandscape landscape = landscapeId == null ? null : cachedById.get(landscapeId);
        return landscapeId != null
                && (Boolean.TRUE.equals(landscape != null ? landscape.getLegacyHiddenByDefault() : null)
                        || LEGACY_HIDDEN_BY_DEFAULT_LANDSCAPE_IDS.contains(landscapeId));
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

    private Map<String, Map<String, Object>> loadCanonicalGoalProvenanceRegistry(Path dir) {
        Path registryFile = dir.resolve(CANONICAL_GOAL_PROVENANCE_REGISTRY_PATH);
        if (!Files.isRegularFile(registryFile)) {
            return Collections.emptyMap();
        }
        try {
            JsonNode root = objectMapper.readTree(registryFile.toFile());
            if (root == null || !root.isObject()) {
                throw new IllegalStateException("Invalid canonical goal provenance registry root: " + registryFile);
            }
            JsonNode versionNode = root.get("version");
            if (versionNode == null || !versionNode.canConvertToInt()
                    || versionNode.intValue() != SUPPORTED_CANONICAL_GOAL_PROVENANCE_REGISTRY_VERSION) {
                throw new IllegalStateException("Unsupported canonical goal provenance registry version in "
                        + registryFile);
            }
            JsonNode landscapesNode = root.get("landscapes");
            if (landscapesNode == null || !landscapesNode.isArray()) {
                throw new IllegalStateException(
                        "Canonical goal provenance registry has no landscapes array: " + registryFile);
            }

            Map<String, Map<String, Object>> result = new LinkedHashMap<>();
            for (JsonNode landscapeNode : landscapesNode) {
                if (landscapeNode == null || !landscapeNode.isObject()) {
                    continue;
                }
                String landscapeId = readRegistryText(landscapeNode, "landscapeId");
                JsonNode goalProvenanceNode = landscapeNode.get("goalProvenance");
                if (!StringUtils.hasText(landscapeId) || goalProvenanceNode == null || !goalProvenanceNode.isObject()) {
                    throw new IllegalStateException(
                            "Invalid canonical goal provenance registry entry in " + registryFile);
                }
                goalProvenanceNode.fields().forEachRemaining(entry -> {
                    String goalId = entry.getKey();
                    JsonNode provenanceNode = entry.getValue();
                    if (!StringUtils.hasText(goalId) || provenanceNode == null || !provenanceNode.isObject()) {
                        throw new IllegalStateException(
                                "Invalid canonical goal provenance goal entry in " + registryFile);
                    }
                    Map<String, Object> provenance = objectMapper.convertValue(
                            provenanceNode,
                            new TypeReference<LinkedHashMap<String, Object>>() {
                            });
                    String existingLandscapeId = goalIdToLandscapeId.get(goalId);
                    if (existingLandscapeId != null && !existingLandscapeId.equals(landscapeId)) {
                        throw new IllegalStateException(
                                "Canonical goal provenance goal '%s' belongs to landscape '%s' but registry says '%s' in %s"
                                        .formatted(goalId, existingLandscapeId, landscapeId, registryFile));
                    }
                    Map<String, Object> existing = result.putIfAbsent(goalId, Collections.unmodifiableMap(provenance));
                    if (existing != null && !existing.equals(provenance)) {
                        throw new IllegalStateException(
                                "Conflicting canonical goal provenance registry goal id '%s' in %s"
                                        .formatted(goalId, registryFile));
                    }
                });
            }
            return result;
        } catch (IOException e) {
            throw new IllegalStateException(
                    "Failed to load canonical goal provenance registry from " + registryFile,
                    e);
        }
    }

    private Map<String, Map<String, List<String>>> loadCanonicalGoalApplicabilityOverrideRegistry(Path dir) {
        Path registryFile = dir.resolve(CANONICAL_GOAL_APPLICABILITY_OVERRIDE_REGISTRY_PATH);
        if (!Files.isRegularFile(registryFile)) {
            return Collections.emptyMap();
        }
        try {
            JsonNode root = objectMapper.readTree(registryFile.toFile());
            if (root == null || !root.isObject()) {
                throw new IllegalStateException(
                        "Invalid canonical goal applicability override registry root: " + registryFile);
            }
            JsonNode versionNode = root.get("version");
            if (versionNode == null || !versionNode.canConvertToInt()
                    || versionNode.intValue() != SUPPORTED_CANONICAL_GOAL_APPLICABILITY_OVERRIDE_REGISTRY_VERSION) {
                throw new IllegalStateException(
                        "Unsupported canonical goal applicability override registry version in "
                                + registryFile);
            }
            JsonNode landscapesNode = root.get("landscapes");
            if (landscapesNode == null || !landscapesNode.isArray()) {
                throw new IllegalStateException(
                        "Canonical goal applicability override registry has no landscapes array: " + registryFile);
            }

            Map<String, Map<String, List<String>>> result = new LinkedHashMap<>();
            for (JsonNode landscapeNode : landscapesNode) {
                if (landscapeNode == null || !landscapeNode.isObject()) {
                    continue;
                }
                String landscapeId = readRegistryText(landscapeNode, "landscapeId");
                JsonNode overridesNode = landscapeNode.get("goalApplicabilityOverrides");
                if (!StringUtils.hasText(landscapeId) || overridesNode == null || !overridesNode.isObject()) {
                    throw new IllegalStateException(
                            "Invalid canonical goal applicability override registry entry in " + registryFile);
                }
                overridesNode.fields().forEachRemaining(entry -> {
                    String goalId = entry.getKey();
                    JsonNode overrideNode = entry.getValue();
                    if (!StringUtils.hasText(goalId) || overrideNode == null || !overrideNode.isObject()) {
                        throw new IllegalStateException(
                                "Invalid canonical goal applicability override goal entry in " + registryFile);
                    }
                    Map<String, List<String>> overrides = objectMapper.convertValue(
                            overrideNode,
                            new TypeReference<LinkedHashMap<String, List<String>>>() {
                            });
                    String existingLandscapeId = goalIdToLandscapeId.get(goalId);
                    if (existingLandscapeId != null && !existingLandscapeId.equals(landscapeId)) {
                        throw new IllegalStateException(
                                "Canonical goal applicability override goal '%s' belongs to landscape '%s' but registry says '%s' in %s"
                                        .formatted(goalId, existingLandscapeId, landscapeId, registryFile));
                    }
                    Map<String, List<String>> frozenOverrides = finalizeApplicabilityMap(overrides);
                    Map<String, List<String>> existing = result.putIfAbsent(goalId, frozenOverrides);
                    if (existing != null && !existing.equals(frozenOverrides)) {
                        throw new IllegalStateException(
                                "Conflicting canonical goal applicability override registry goal id '%s' in %s"
                                        .formatted(goalId, registryFile));
                    }
                });
            }
            return result;
        } catch (IOException e) {
            throw new IllegalStateException(
                    "Failed to load canonical goal applicability override registry from " + registryFile,
                    e);
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
        return BundeslandCodeNormalizer.normalize(region);
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
