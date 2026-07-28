package com.skillpilot.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.ChampionRegistrationRequest;
import com.skillpilot.backend.api.ChampionRegistrationResponse;
import com.skillpilot.backend.api.CurriculaSnapshot;
import com.skillpilot.backend.api.CurriculumChampionProfile;
import com.skillpilot.backend.api.CurriculumOverview;
import com.skillpilot.backend.api.CurriculumQualityOverview;
import com.skillpilot.backend.api.MasteryEntryDTO;
import com.skillpilot.backend.api.TopicSummary;
import com.skillpilot.backend.domain.CurriculumChampion;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.Mastery;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.landscape.SkillLandscape;
import com.skillpilot.backend.landscape.LandscapeSummary;
import com.skillpilot.backend.repository.CurriculumChampionRepository;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import com.skillpilot.backend.service.CurriculumQualitySnapshotProvider.CurriculumQualityEntry;
import com.skillpilot.backend.service.CurriculumQualitySnapshotProvider.CurriculumQualitySnapshot;
import com.skillpilot.backend.util.BundeslandCodeNormalizer;
import jakarta.annotation.PostConstruct;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.atomic.AtomicReference;
import java.util.regex.Pattern;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CurriculaService {

    private static final Logger log = LoggerFactory.getLogger(CurriculaService.class);
    private static final double MASTERY_THRESHOLD = 0.9;
    private static final String HESSEN_FILTER_ID = "DE-HE";
    private static final String CANONICAL_GYMNASIUM_ROOT_ID = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
    private static final String STAGE_SCOPE_SEK1_ID = "__skillpilot_stage_scope_sek1__";
    private static final String STAGE_SCOPE_SEK2_ID = "__skillpilot_stage_scope_sek2__";
    private static final Pattern GITHUB_ID_PATTERN = Pattern.compile("^[A-Za-z0-9-]{1,39}$");
    private static final Pattern WHY_TOPIC_PATTERN = Pattern.compile("^\\s*(warum|why)\\b.*",
            Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE);

    private final LandscapeService landscapeService;
    private final MasteryRepository masteryRepository;
    private final LearnerRepository learnerRepository;
    private final CurriculumChampionRepository championRepository;
    private final GitHubStatsService githubStatsService;
    private final LearnerService learnerService;
    private final CompositionViewService compositionViewService;
    private final ObjectMapper objectMapper;
    private final CurriculumQualitySnapshotProvider curriculumQualitySnapshotProvider;

    private final AtomicReference<CurriculaMetricsSnapshot> metricsSnapshot = new AtomicReference<>(
            new CurriculaMetricsSnapshot(Collections.emptyMap(), Collections.emptyMap(), null, Instant.now()));

    public CurriculaService(
            LandscapeService landscapeService,
            MasteryRepository masteryRepository,
            LearnerRepository learnerRepository,
            CurriculumChampionRepository championRepository,
            GitHubStatsService githubStatsService,
            LearnerService learnerService,
            CompositionViewService compositionViewService,
            ObjectMapper objectMapper,
            CurriculumQualitySnapshotProvider curriculumQualitySnapshotProvider) {
        this.landscapeService = landscapeService;
        this.masteryRepository = masteryRepository;
        this.learnerRepository = learnerRepository;
        this.championRepository = championRepository;
        this.githubStatsService = githubStatsService;
        this.learnerService = learnerService;
        this.compositionViewService = compositionViewService;
        this.objectMapper = objectMapper;
        this.curriculumQualitySnapshotProvider = curriculumQualitySnapshotProvider;
    }

    @PostConstruct
    public void init() {
        refreshMetrics();
    }

    @Scheduled(fixedRate = 600000)
    public void refreshMetrics() {
        log.debug("Refreshing curricula metrics snapshot...");
        try {
            List<LandscapeSummary> baseCurricula = landscapeService.getBaseCurricula();
            Map<String, CurriculumMetrics> metricsByCurriculum = new HashMap<>();
            Map<String, Set<String>> goalToRoots = new HashMap<>();

            for (LandscapeSummary summary : baseCurricula) {
                String curriculumId = summary.getCurriculumId();
                if (curriculumId == null) {
                    continue;
                }
                long totalAtomicGoals = 0;
                List<SkillLandscape> closure = landscapeService.getClosure(curriculumId);
                for (SkillLandscape landscape : closure) {
                    if (landscape.getGoals() == null) {
                        continue;
                    }
                    for (LearningGoal goal : landscape.getGoals()) {
                        if (goal.getContains() == null || goal.getContains().isEmpty()) {
                            totalAtomicGoals++;
                            goalToRoots.computeIfAbsent(goal.getId(), key -> new HashSet<>()).add(curriculumId);
                        }
                    }
                }
                metricsByCurriculum.put(curriculumId, new CurriculumMetrics(totalAtomicGoals, 0));
            }

            List<Mastery> allMastery = masteryRepository.findAllByValueGreaterThanEqual(MASTERY_THRESHOLD);
            Map<String, Long> totalMastered = new HashMap<>();
            for (Mastery mastery : allMastery) {
                String goalId = mastery.getGoalKey();
                Set<String> roots = goalToRoots.get(goalId);
                if (roots == null) {
                    continue;
                }
                for (String rootId : roots) {
                    totalMastered.merge(rootId, 1L, Long::sum);
                }
            }

            for (Map.Entry<String, CurriculumMetrics> entry : metricsByCurriculum.entrySet()) {
                long mastered = totalMastered.getOrDefault(entry.getKey(), 0L);
                metricsByCurriculum.put(entry.getKey(),
                        new CurriculumMetrics(entry.getValue().totalAtomicGoals(), mastered));
            }

            String defaultCurriculumId = selectDefaultCurriculum(metricsByCurriculum, baseCurricula);
            Map<String, Set<String>> immutableGoalToRoots = new HashMap<>();
            for (Map.Entry<String, Set<String>> entry : goalToRoots.entrySet()) {
                immutableGoalToRoots.put(entry.getKey(), Set.copyOf(entry.getValue()));
            }
            metricsSnapshot.set(new CurriculaMetricsSnapshot(
                    metricsByCurriculum,
                    Collections.unmodifiableMap(immutableGoalToRoots),
                    defaultCurriculumId,
                    Instant.now()));
            log.debug("Curricula metrics snapshot refreshed. {} curricula.", metricsByCurriculum.size());
        } catch (Exception e) {
            log.error("Failed to refresh curricula metrics snapshot", e);
        }
    }

    public CurriculaSnapshot getSnapshot() {
        CurriculaMetricsSnapshot snapshot = metricsSnapshot.get();
        List<LandscapeSummary> baseCurricula = landscapeService.getBaseCurricula();
        CurriculumQualitySnapshot qualitySnapshot = curriculumQualitySnapshotProvider.load();
        Map<String, Set<String>> goalToRoots = snapshot.goalToRoots();
        Map<String, List<Mastery>> masteryCache = new HashMap<>();
        List<CurriculumOverview> result = new ArrayList<>();

        for (LandscapeSummary summary : baseCurricula) {
            String curriculumId = summary.getCurriculumId();
            CurriculumMetrics metrics = snapshot.metricsByCurriculum().getOrDefault(curriculumId,
                    new CurriculumMetrics(0, 0));
            List<CurriculumChampionProfile> champions = loadChampions(curriculumId, goalToRoots, masteryCache);
            List<TopicSummary> topicSummaries = getTopics(curriculumId);
            List<String> topLevelTopics = topicSummaries.stream()
                    .map(TopicSummary::title)
                    .toList();
            List<String> topLevelTopicsEn = topicSummaries.stream()
                    .map(TopicSummary::titleEn)
                    .toList();
            SkillLandscape landscape = landscapeService.getById(curriculumId);
            CurriculumQualityEntry qualityEntry = qualitySnapshot.byLandscapeId().get(curriculumId);
            List<CurriculumQualityOverview> subjectQuality = buildSubjectQuality(curriculumId, topLevelTopics, qualitySnapshot);
            String titleEn = null;
            String descriptionEn = null;
            if (landscape != null) {
                titleEn = landscape.getTitleEn();
                descriptionEn = landscape.getDescriptionEn();
            }
            if (titleEn == null || titleEn.isBlank()) {
                titleEn = summary.getTitle();
            }
            if (descriptionEn == null || descriptionEn.isBlank()) {
                descriptionEn = summary.getDescription();
            }
            result.add(new CurriculumOverview(
                    curriculumId,
                    summary.getTitle(),
                    titleEn,
                    summary.getDescription(),
                    descriptionEn,
                    summary.getSubject(),
                    summary.getCountry(),
                    summary.getRegion(),
                    metrics.totalAtomicGoals(),
                    metrics.totalMastered(),
                    qualityEntry != null ? qualityEntry.maturity() : null,
                    qualityEntry != null ? qualityEntry.goals() : 0,
                    qualityEntry != null ? qualityEntry.atomicGoals() : 0,
                    qualityEntry != null ? qualityEntry.warnings() : 0,
                    qualityEntry != null ? qualityEntry.failures() : 0,
                    subjectQuality,
                    topLevelTopics,
                    topLevelTopicsEn,
                    champions));
        }

        result.sort(Comparator.comparing(CurriculumOverview::title, String.CASE_INSENSITIVE_ORDER));
        return new CurriculaSnapshot(result, snapshot.defaultCurriculumId(), snapshot.lastUpdatedAt());
    }

    private List<CurriculumQualityOverview> buildSubjectQuality(
            String curriculumId,
            List<String> topLevelTopics,
            CurriculumQualitySnapshot qualitySnapshot) {
        if (!CANONICAL_GYMNASIUM_ROOT_ID.equals(curriculumId)) {
            return Collections.emptyList();
        }

        List<CurriculumQualityOverview> qualities = new ArrayList<>();
        Set<String> seenSubjects = new LinkedHashSet<>();
        for (String topic : topLevelTopics) {
            CurriculumQualityEntry entry = qualitySnapshot.canonicalSubjects().get(normalizeSubject(topic));
            if (entry == null || !seenSubjects.add(normalizeSubject(entry.subject()))) {
                continue;
            }
            qualities.add(toQualityOverview(entry));
        }

        return qualities;
    }

    private CurriculumQualityOverview toQualityOverview(CurriculumQualityEntry entry) {
        return new CurriculumQualityOverview(
                entry.subject(),
                entry.maturity(),
                entry.goals(),
                entry.atomicGoals(),
                entry.warnings(),
                entry.failures());
    }

    private String normalizeSubject(String value) {
        return value == null ? "" : value.trim().toLowerCase(java.util.Locale.ROOT);
    }

    public List<CurriculumChampionProfile> getChampionsByGithubId(String githubId) {
        if (githubId == null || githubId.isBlank()) {
            return Collections.emptyList();
        }
        String normalizedId = normalizeGithubId(githubId);
        Map<String, List<Mastery>> masteryCache = new HashMap<>();
        CurriculaMetricsSnapshot snapshot = metricsSnapshot.get();

        return championRepository.findByGithubId(normalizedId).stream()
                .map(champion -> toProfile(
                        champion,
                        champion.getCurriculumId(),
                        snapshot.goalToRoots(),
                        masteryCache))
                .toList();
    }

    public void deregisterChampions(String githubId, List<String> curriculumIds) {
        if (githubId == null || githubId.isBlank() || curriculumIds == null || curriculumIds.isEmpty()) {
            return;
        }
        String normalizedGithubId = normalizeGithubId(githubId);
        for (String curriculumId : curriculumIds) {
            List<CurriculumChampion> champions = championRepository.findAllByCurriculumIdAndGithubId(
                    curriculumId,
                    normalizedGithubId);
            if (!champions.isEmpty()) {
                championRepository.deleteAll(champions);
            }
        }
        // Force refresh metrics after modification
        refreshMetrics();
    }

    public ChampionRegistrationResponse registerChampion(ChampionRegistrationRequest request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body required");
        }

        String curriculumId = normalize(request.curriculumId());
        String skillpilotId = normalize(request.skillpilotId());
        String githubId = normalizeGithubId(request.githubId());

        if (curriculumId.isEmpty() || skillpilotId.isEmpty() || githubId.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "curriculumId, skillpilotId, and githubId are required");
        }

        String topicId = normalize(request.topicId());
        if (topicId.isEmpty()) {
            topicId = null;
        }

        if (!GITHUB_ID_PATTERN.matcher(githubId).matches()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid GitHub ID");
        }

        if (!isValidCurriculum(curriculumId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown curriculumId");
        }

        if (!learnerRepository.existsById(skillpilotId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown SkillPilot ID");
        }

        if (championRepository.findByCurriculumIdAndTopicIdAndGithubId(curriculumId, topicId, githubId).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "GitHub ID already registered for this curriculum/topic");
        }

        if (championRepository.findByCurriculumIdAndTopicIdAndSkillpilotId(curriculumId, topicId, skillpilotId)
                .isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "SkillPilot ID already registered for this curriculum/topic");
        }

        CurriculumChampion champion = new CurriculumChampion();
        champion.setCurriculumId(curriculumId);
        champion.setTopicId(topicId);
        champion.setSkillpilotId(skillpilotId);
        champion.setGithubId(githubId);
        champion.setIssuesCount(0);
        champion.setPullRequestsCount(0);

        CurriculumChampion saved = championRepository.save(champion);
        CurriculaMetricsSnapshot snapshot = metricsSnapshot.get();
        Map<String, List<Mastery>> masteryCache = new HashMap<>();
        CurriculumChampionProfile profile = toProfile(
                saved,
                saved.getCurriculumId(),
                snapshot.goalToRoots(),
                masteryCache);
        return new ChampionRegistrationResponse(profile);
    }

    private List<CurriculumChampionProfile> loadChampions(
            String curriculumId,
            Map<String, Set<String>> goalToRoots,
            Map<String, List<Mastery>> masteryCache) {
        if (curriculumId == null || curriculumId.isBlank()) {
            return Collections.emptyList();
        }
        return championRepository.findByCurriculumIdOrderByCreatedAtAsc(curriculumId)
                .stream()
                .map(champion -> toProfile(champion, curriculumId, goalToRoots, masteryCache))
                .toList();
    }

    private CurriculumChampionProfile toProfile(
            CurriculumChampion champion,
            String curriculumId,
            Map<String, Set<String>> goalToRoots,
            Map<String, List<Mastery>> masteryCache) {
        Learner learner = learnerRepository.findById(champion.getSkillpilotId()).orElse(null);
        long masteredCount = countChampionMastery(
                curriculumId,
                champion.getTopicId(),
                champion.getSkillpilotId(),
                learner,
                goalToRoots,
                masteryCache);
        GitHubStatsService.GitHubStats stats = githubStatsService.getStats(champion.getGithubId());
        int issuesCount = stats.issuesCount() >= 0 ? stats.issuesCount() : champion.getIssuesCount();
        int pullRequestsCount = stats.pullRequestsCount() >= 0 ? stats.pullRequestsCount()
                : champion.getPullRequestsCount();

        // Resolve topic title and total goals if topicId is set
        String topicTitle = null;
        String topicTitleEn = null;
        long totalTopicGoals = 0;

        if (champion.getTopicId() != null && !champion.getTopicId().isEmpty()) {
            LearningGoal goal = landscapeService.getGoalDefinition(champion.getTopicId());
            if (goal != null) {
                topicTitle = goal.getTitle();
                String candidateEn = goal.getTitleEn();
                topicTitleEn = (candidateEn != null && !candidateEn.isBlank()) ? candidateEn : topicTitle;
                Set<String> atomicIds = resolveChampionAtomicIds(
                        curriculumId,
                        goal.getId(),
                        champion.getSkillpilotId(),
                        learner,
                        goalToRoots);
                totalTopicGoals = atomicIds.size();
            }
        } else {
            totalTopicGoals = resolveChampionAtomicIds(
                    curriculumId,
                    null,
                    champion.getSkillpilotId(),
                    learner,
                    goalToRoots).size();
        }

        return new CurriculumChampionProfile(
                curriculumId,
                champion.getTopicId(),
                topicTitle,
                topicTitleEn,
                champion.getGithubId(),
                maskSkillpilotId(champion.getSkillpilotId()),
                masteredCount,
                totalTopicGoals,
                issuesCount,
                pullRequestsCount,
                champion.getCreatedAt());
    }

    private long countAtomicGoalsForCurriculum(String curriculumId, Map<String, Set<String>> goalToRoots) {
        if (curriculumId == null || curriculumId.isBlank() || goalToRoots == null || goalToRoots.isEmpty()) {
            return 0;
        }
        return goalToRoots.entrySet().stream()
                .filter(entry -> entry.getValue().contains(curriculumId))
                .count();
    }

    private boolean isValidCurriculum(String curriculumId) {
        return landscapeService.getBaseCurricula().stream()
                .anyMatch(summary -> curriculumId.equals(summary.getCurriculumId()));
    }

    private String normalize(String value) {
        if (value == null) {
            return "";
        }
        return value.trim();
    }

    private String normalizeGithubId(String value) {
        String trimmed = normalize(value);
        if (trimmed.startsWith("@")) {
            trimmed = trimmed.substring(1);
        }
        return trimmed.toLowerCase();
    }

    private String maskSkillpilotId(String skillpilotId) {
        if (skillpilotId == null || skillpilotId.length() < 5) {
            return "Unknown";
        }
        if (skillpilotId.length() == 5) {
            return skillpilotId;
        }
        return skillpilotId.substring(0, 5) + "...";
    }

    private long countChampionMastery(
            String curriculumId,
            String topicId,
            String skillpilotId,
            Learner learner,
            Map<String, Set<String>> goalToRoots,
            Map<String, List<Mastery>> masteryCache) {
        if (skillpilotId == null || skillpilotId.isBlank()) {
            return 0;
        }

        Set<String> atomicIds = resolveChampionAtomicIds(curriculumId, topicId, skillpilotId, learner, goalToRoots);
        if (atomicIds.isEmpty()) {
            return 0;
        }
        Map<String, MasteryEntryDTO> masteryEntries = learnerService.getMasteryProjectedToGoalIds(skillpilotId, atomicIds);
        return countMasteredAtomicIds(atomicIds, masteryEntries);
    }

    private Set<String> resolveChampionAtomicIds(
            String curriculumId,
            String topicId,
            String skillpilotId,
            Learner learner,
            Map<String, Set<String>> goalToRoots) {
        if (curriculumId == null || curriculumId.isBlank()) {
            return Collections.emptySet();
        }

        if (learner != null && curriculumId.equals(learner.getSelectedCurriculum())) {
            String personalCurriculumJson = learner.getPersonalCurriculum() == null
                            || learner.getPersonalCurriculum().isBlank()
                    ? "{}"
                    : learner.getPersonalCurriculum();
            String rootFilterId = resolveRootFilterId(curriculumId, personalCurriculumJson);
            Set<String> filteredAtomicIds = learnerService.getFilteredAtomicGoalIds(
                    curriculumId,
                    personalCurriculumJson,
                    topicId,
                    false);
            String compositionLandscapeId = resolveCompositionLandscapeId(curriculumId, topicId);
            boolean authoritativeComposition = compositionViewService != null
                    && compositionViewService.isAuthoritativeForLandscape(compositionLandscapeId);
            Set<String> learnerFacingAtomicIds = resolveLearnerFacingAtomicIds(
                    curriculumId,
                    topicId,
                    personalCurriculumJson,
                    filteredAtomicIds);
            if (topicId != null
                    && HESSEN_FILTER_ID.equals(rootFilterId)
                    && isCanonicalGymnasiumLandscape(curriculumId)
                    && (!authoritativeComposition || !learnerFacingAtomicIds.isEmpty())) {
                Set<String> legacyEquivalentAtomicIds = resolveHessenEquivalentCanonicalAtomicIds(
                        topicId,
                        learnerFacingAtomicIds.isEmpty() ? filteredAtomicIds : learnerFacingAtomicIds);
                if (!legacyEquivalentAtomicIds.isEmpty()) {
                    return legacyEquivalentAtomicIds;
                }
            }
            if (!learnerFacingAtomicIds.isEmpty()) {
                return learnerFacingAtomicIds;
            }
            if (authoritativeComposition) {
                return Collections.emptySet();
            }
            if (!filteredAtomicIds.isEmpty() || topicId != null) {
                return filteredAtomicIds;
            }
        }

        if (topicId != null && !topicId.isBlank()) {
            Set<String> atomicIds = collectAtomicGoalIds(topicId);
            if (goalToRoots != null && !goalToRoots.isEmpty()) {
                final String finalCurriculumId = curriculumId;
                atomicIds.removeIf(id -> {
                    Set<String> roots = goalToRoots.get(id);
                    if (roots == null || !roots.contains(finalCurriculumId)) {
                        return !isReachable(finalCurriculumId, id);
                    }
                    return false;
                });
            }
            return atomicIds;
        }

        if (goalToRoots == null || goalToRoots.isEmpty()) {
            return Collections.emptySet();
        }

        Set<String> atomicIds = new HashSet<>();
        for (Map.Entry<String, Set<String>> entry : goalToRoots.entrySet()) {
            if (entry.getValue().contains(curriculumId)) {
                atomicIds.add(entry.getKey());
            }
        }
        return atomicIds;
    }

    private Set<String> resolveLearnerFacingAtomicIds(
            String curriculumId,
            String topicId,
            String personalCurriculumJson,
            Set<String> filteredAtomicIds) {
        if (filteredAtomicIds == null || filteredAtomicIds.isEmpty()) {
            return Collections.emptySet();
        }
        String compositionLandscapeId = resolveCompositionLandscapeId(curriculumId, topicId);
        if (compositionLandscapeId == null || compositionLandscapeId.isBlank()) {
            return Collections.emptySet();
        }

        Map<String, Map<String, Object>> personalConfig = parsePersonalCurriculumConfig(personalCurriculumJson);
        boolean useDefaultOffering = compositionViewService.isAuthoritativeForLandscape(compositionLandscapeId)
                && (personalConfig == null || personalConfig.isEmpty());
        Map<String, Object> matchedView;
        if (useDefaultOffering) {
            matchedView = compositionViewService.findDefaultView(compositionLandscapeId);
        } else {
            Map<String, String> requestedScope =
                    deriveRuntimeCompositionScope(compositionLandscapeId, personalCurriculumJson);
            if (requestedScope.isEmpty()) {
                return Collections.emptySet();
            }
            matchedView = compositionViewService.findMatchingView(compositionLandscapeId, requestedScope);
        }
        if (matchedView == null) {
            return Collections.emptySet();
        }

        Set<String> learnerFacingAtomicIds = new LinkedHashSet<>();
        collectAtomicGoalIdsFromCompositionViewNodeList(matchedView.get("rootNodes"), learnerFacingAtomicIds);
        learnerFacingAtomicIds.retainAll(filteredAtomicIds);
        if (topicId != null && !topicId.isBlank()) {
            learnerFacingAtomicIds.retainAll(collectGoalAndDescendantIds(topicId));
        }
        return learnerFacingAtomicIds;
    }

    private String resolveCompositionLandscapeId(String curriculumId, String topicId) {
        if (topicId != null && !topicId.isBlank()) {
            String topicLandscapeId = landscapeService.getLandscapeIdForGoal(topicId);
            if (topicLandscapeId != null && !topicLandscapeId.isBlank()) {
                return topicLandscapeId;
            }
        }
        return curriculumId;
    }

    private Map<String, String> deriveRuntimeCompositionScope(String landscapeId, String personalCurriculumJson) {
        SkillLandscape landscape = landscapeService.getById(landscapeId);
        if (landscape == null || landscape.getFrameworkId() == null || !landscape.getFrameworkId().startsWith("canonical-gymnasium")) {
            return Collections.emptyMap();
        }

        Map<String, Map<String, Object>> config = parsePersonalCurriculumConfig(personalCurriculumJson);
        if (config == null) {
            config = Collections.emptyMap();
        }

        String rootFilterId = readFilterId(config, CANONICAL_GYMNASIUM_ROOT_ID);
        String landscapeFilterId = readFilterId(config, landscapeId);
        String jurisdiction = resolveJurisdictionFilter(rootFilterId, landscapeFilterId);
        String courseProfile = normalizeCourseProfileScope(landscapeFilterId);
        String stage = inferStageScope(config, landscapeId);
        String durationModel = resolveDurationModelScope(
                readScopeValue(config, landscapeId, "durationModel"),
                readScopeValue(config, CANONICAL_GYMNASIUM_ROOT_ID, "durationModel"),
                rootFilterId,
                landscapeFilterId);

        if (jurisdiction == null && stage == null && courseProfile == null && durationModel == null) {
            return Collections.emptyMap();
        }

        Map<String, String> scope = new LinkedHashMap<>();
        scope.put("schoolForm", "Gymnasium");
        if (jurisdiction != null) {
            scope.put("jurisdiction", jurisdiction);
        }
        if (stage != null) {
            scope.put("stage", stage);
        }
        if (courseProfile != null && !"SekI".equals(stage)) {
            scope.put("courseProfile", courseProfile);
        }
        if (durationModel != null) {
            scope.put("durationModel", durationModel);
        }
        return scope;
    }

    private String resolveJurisdictionFilter(String... filterCandidates) {
        for (String filterCandidate : filterCandidates) {
            String jurisdiction = BundeslandCodeNormalizer.normalize(filterCandidate);
            if (jurisdiction != null && !jurisdiction.isBlank()) {
                return jurisdiction;
            }
        }
        return null;
    }

    private String resolveDurationModelScope(String... candidates) {
        for (String candidate : candidates) {
            String durationModel = normalizeDurationModel(candidate);
            if (durationModel != null) {
                return durationModel;
            }
        }
        return null;
    }

    private String readScopeValue(Map<String, Map<String, Object>> config, String landscapeId, String key) {
        if (config == null || config.isEmpty()) {
            return null;
        }
        Map<String, Object> entry = config.get(landscapeId);
        if (entry == null) {
            return null;
        }
        Object value = entry.get(key);
        return value instanceof String textValue ? normalize(textValue) : null;
    }

    private String readFilterId(Map<String, Map<String, Object>> config, String landscapeId) {
        if (config == null || config.isEmpty()) {
            return null;
        }
        Map<String, Object> entry = config.get(landscapeId);
        if (entry == null) {
            return null;
        }
        Object filterId = entry.get("filterId");
        if (!(filterId instanceof String textFilterId)) {
            return null;
        }
        return normalize(textFilterId);
    }

    private String inferStageScope(
            Map<String, Map<String, Object>> config,
            String landscapeId) {
        String explicitStage = resolveStageScope(
                readScopeValue(config, CANONICAL_GYMNASIUM_ROOT_ID, "stage"),
                readScopeValue(config, landscapeId, "stage"));
        if (explicitStage != null) {
            return explicitStage;
        }
        Boolean sek1Selected = readSelectedFlagIfPresent(config, STAGE_SCOPE_SEK1_ID);
        Boolean sek2Selected = readSelectedFlagIfPresent(config, STAGE_SCOPE_SEK2_ID);
        if (sek1Selected == null && sek2Selected == null) {
            return null;
        }
        if (Boolean.TRUE.equals(sek1Selected) && Boolean.TRUE.equals(sek2Selected)) {
            return "CrossStage";
        }
        if (Boolean.TRUE.equals(sek1Selected)) {
            return "SekI";
        }
        if (Boolean.TRUE.equals(sek2Selected)) {
            return "SekII";
        }
        return null;
    }

    private String resolveStageScope(String... candidates) {
        for (String candidate : candidates) {
            String normalized = normalize(candidate).toUpperCase(java.util.Locale.ROOT);
            if ("SEKI".equals(normalized)) {
                return "SekI";
            }
            if ("SEKII".equals(normalized)) {
                return "SekII";
            }
            if ("CROSSSTAGE".equals(normalized)) {
                return "CrossStage";
            }
        }
        return null;
    }

    private boolean readSelectedFlag(Map<String, Map<String, Object>> config, String configId, boolean defaultValue) {
        if (config == null || config.isEmpty()) {
            return defaultValue;
        }
        Map<String, Object> entry = config.get(configId);
        if (entry == null) {
            return defaultValue;
        }
        Object selected = entry.get("selected");
        if (selected instanceof Boolean selectedFlag) {
            return selectedFlag;
        }
        return defaultValue;
    }

    private Boolean readSelectedFlagIfPresent(
            Map<String, Map<String, Object>> config,
            String configId) {
        if (config == null || config.isEmpty()) {
            return null;
        }
        Map<String, Object> entry = config.get(configId);
        if (entry == null || !entry.containsKey("selected")) {
            return null;
        }
        Object selected = entry.get("selected");
        return selected instanceof Boolean selectedFlag ? selectedFlag : null;
    }

    private String normalizeDurationModel(String value) {
        String normalized = normalize(value).toUpperCase(java.util.Locale.ROOT);
        if ("G8".equals(normalized) || "DURATIONMODEL:G8".equals(normalized) || "DURATION-MODEL:G8".equals(normalized)) {
            return "G8";
        }
        if ("G9".equals(normalized) || "DURATIONMODEL:G9".equals(normalized) || "DURATION-MODEL:G9".equals(normalized)) {
            return "G9";
        }
        return null;
    }

    private String normalizeCourseProfileScope(String filterId) {
        String normalized = normalize(filterId);
        if ("GK".equals(normalized) || "LK".equals(normalized) || "GK+LK".equals(normalized)) {
            return normalized;
        }
        if ("ALL".equals(normalized)) {
            return "GK+LK";
        }
        return null;
    }

    @SuppressWarnings("unchecked")
    private void collectAtomicGoalIdsFromCompositionViewNodeList(Object rawNodes, Set<String> atomicIds) {
        if (!(rawNodes instanceof List<?> nodeList)) {
            return;
        }
        for (Object rawNode : nodeList) {
            if (!(rawNode instanceof Map<?, ?> node)) {
                continue;
            }
            Object kind = node.get("kind");
            if (!(kind instanceof String kindText)) {
                continue;
            }
            switch (kindText) {
                case "structure" -> collectAtomicGoalIdsFromCompositionViewNodeList(node.get("children"), atomicIds);
                case "canonicalSubtree" -> {
                    Object goalId = node.get("goalId");
                    if (goalId instanceof String goalIdText && !goalIdText.isBlank()) {
                        atomicIds.addAll(collectAtomicGoalIds(goalIdText));
                    }
                }
                case "goalEntry" -> {
                    Object goalId = node.get("goalId");
                    if (goalId instanceof String goalIdText && !goalIdText.isBlank()) {
                        LearningGoal goal = resolveGoal(goalIdText);
                        if (goal != null) {
                            atomicIds.add(goal.getId());
                        }
                    }
                }
                case "landscapeEntry" -> {
                    Object landscapeId = node.get("landscapeId");
                    if (landscapeId instanceof String landscapeIdText && !landscapeIdText.isBlank()) {
                        SkillLandscape landscape = landscapeService.getById(landscapeIdText);
                        if (landscape != null && landscape.getGoals() != null) {
                            landscape.getGoals().stream()
                                    .filter(goal -> goal.getTags() != null && goal.getTags().contains("root"))
                                    .findFirst()
                                    .ifPresent(rootGoal -> atomicIds.addAll(collectAtomicGoalIds(rootGoal.getId())));
                        }
                    }
                }
                default -> {
                }
            }
        }
    }

    private boolean isCanonicalGymnasiumLandscape(String curriculumId) {
        SkillLandscape landscape = landscapeService.getById(curriculumId);
        if (landscape == null) {
            return false;
        }
        String frameworkId = landscape.getFrameworkId();
        return frameworkId != null && frameworkId.startsWith("canonical-gymnasium");
    }

    private String resolveRootFilterId(String curriculumId, String personalCurriculumJson) {
        if (curriculumId == null || curriculumId.isBlank() || personalCurriculumJson == null || personalCurriculumJson.isBlank()) {
            return null;
        }
        try {
            Object parsed = objectMapper.readValue(personalCurriculumJson, Object.class);
            Map<String, Map<String, Object>> config = coercePersonalCurriculumConfig(parsed);
            if (config == null) {
                return null;
            }
            Map<String, Object> rootConfig = config.get(curriculumId);
            if (rootConfig == null) {
                return null;
            }
            Object filterId = rootConfig.get("filterId");
            if (!(filterId instanceof String textFilterId)) {
                return null;
            }
            String normalizedFilterId = normalize(textFilterId);
            String normalizedBundesland = BundeslandCodeNormalizer.normalize(normalizedFilterId);
            return normalizedBundesland != null ? normalizedBundesland : normalizedFilterId;
        } catch (Exception e) {
            return null;
        }
    }

    private Map<String, Map<String, Object>> parsePersonalCurriculumConfig(String personalCurriculumJson) {
        if (personalCurriculumJson == null || personalCurriculumJson.isBlank()) {
            return Collections.emptyMap();
        }
        try {
            Object parsed = objectMapper.readValue(personalCurriculumJson, Object.class);
            Map<String, Map<String, Object>> config = coercePersonalCurriculumConfig(parsed);
            return config != null ? config : Collections.emptyMap();
        } catch (Exception e) {
            return Collections.emptyMap();
        }
    }

    private Map<String, Map<String, Object>> coercePersonalCurriculumConfig(Object parsed) {
        if (!(parsed instanceof Map<?, ?> rawConfig)) {
            return null;
        }

        Object configCandidate = rawConfig;
        if (rawConfig.size() == 1 && rawConfig.get("personalCurriculum") instanceof Map<?, ?> nestedConfig) {
            configCandidate = nestedConfig;
        }

        if (!(configCandidate instanceof Map<?, ?> configMap)) {
            return null;
        }

        Map<String, Map<String, Object>> normalized = new HashMap<>();
        for (Map.Entry<?, ?> entry : configMap.entrySet()) {
            if (!(entry.getKey() instanceof String key) || !(entry.getValue() instanceof Map<?, ?> valueMap)) {
                continue;
            }
            Map<String, Object> normalizedEntry = new HashMap<>();
            for (Map.Entry<?, ?> valueEntry : valueMap.entrySet()) {
                if (valueEntry.getKey() instanceof String valueKey) {
                    normalizedEntry.put(valueKey, valueEntry.getValue());
                }
            }
            normalized.put(key, normalizedEntry);
        }
        return normalized;
    }

    private Set<String> resolveHessenEquivalentCanonicalAtomicIds(String topicId, Set<String> filteredAtomicIds) {
        if (topicId == null || topicId.isBlank() || filteredAtomicIds == null || filteredAtomicIds.isEmpty()) {
            return Collections.emptySet();
        }
        LearningGoal topicGoal = landscapeService.getGoalDefinition(topicId);
        String sourceLandscapeId = extractProvenanceValue(topicGoal, "sourceLandscapeId");
        String sourceGoalId = extractProvenanceValue(topicGoal, "sourceGoalId");
        if (sourceLandscapeId == null || sourceGoalId == null) {
            return Collections.emptySet();
        }

        Set<String> legacyAtomicIds = landscapeService.resolveSourceAtomicGoalIds(sourceLandscapeId, sourceGoalId);
        if (legacyAtomicIds.isEmpty()) {
            legacyAtomicIds = collectAtomicGoalIds(sourceGoalId);
        }
        if (legacyAtomicIds.isEmpty()) {
            return Collections.emptySet();
        }

        Set<String> equivalentAtomicIds = new LinkedHashSet<>();
        for (String atomicId : filteredAtomicIds) {
            LearningGoal atomicGoal = landscapeService.getGoalDefinition(atomicId);
            if (atomicGoal == null) {
                continue;
            }
            String atomicSourceLandscapeId = extractProvenanceValue(atomicGoal, "sourceLandscapeId");
            String atomicSourceGoalId = extractProvenanceValue(atomicGoal, "sourceGoalId");
            if (sourceLandscapeId.equals(atomicSourceLandscapeId) && legacyAtomicIds.contains(atomicSourceGoalId)) {
                equivalentAtomicIds.add(atomicId);
            }
        }
        return equivalentAtomicIds;
    }

    private String extractProvenanceValue(LearningGoal goal, String key) {
        return landscapeService.resolveGoalProvenanceValue(goal, key);
    }

    private long countMasteredAtomicIds(Set<String> atomicIds, Map<String, MasteryEntryDTO> masteryEntries) {
        if (atomicIds == null || atomicIds.isEmpty() || masteryEntries == null || masteryEntries.isEmpty()) {
            return 0;
        }
        long count = 0;
        for (String atomicId : atomicIds) {
            MasteryEntryDTO entry = masteryEntries.get(atomicId);
            if (entry == null) {
                entry = masteryEntries.get(normalize(atomicId).toLowerCase());
            }
            if (entry != null && entry.value() >= MASTERY_THRESHOLD) {
                count++;
            }
        }
        return count;
    }

    private boolean isReachable(String curriculumId, String goalKey) {
        if (curriculumId == null || goalKey == null) {
            return false;
        }
        // Check if the goal belongs to a landscape that is in the closure of the
        // curriculum
        String landscapeId = landscapeService.getLandscapeIdForGoal(goalKey);
        if (landscapeId == null) {
            return false;
        }

        // This is expensive so we only do it on cache miss
        List<SkillLandscape> closure = landscapeService.getClosure(curriculumId);
        for (SkillLandscape l : closure) {
            if (l.getLandscapeId().equals(landscapeId)) {
                return true;
            }
        }
        return false;
    }

    private Set<String> collectAtomicGoalIds(String rootGoalId) {
        Set<String> atomic = new HashSet<>();
        collectAtomicGoalIds(rootGoalId, atomic, new HashSet<>());
        return atomic;
    }

    private Set<String> collectGoalAndDescendantIds(String rootGoalId) {
        Set<String> goalIds = new LinkedHashSet<>();
        collectGoalAndDescendantIds(rootGoalId, goalIds, new HashSet<>());
        return goalIds;
    }

    private void collectGoalAndDescendantIds(String goalRef, Set<String> goalIds, Set<String> visiting) {
        LearningGoal goal = resolveGoal(goalRef);
        if (goal == null || !visiting.add(goal.getId())) {
            return;
        }
        goalIds.add(goal.getId());
        if (goal.getContains() != null) {
            for (String childRef : goal.getContains()) {
                collectGoalAndDescendantIds(childRef, goalIds, visiting);
            }
        }
        visiting.remove(goal.getId());
    }

    private void collectAtomicGoalIds(String goalRef, Set<String> atomic, Set<String> visiting) {
        LearningGoal goal = resolveGoal(goalRef);
        if (goal == null) {
            return;
        }
        String goalId = goal.getId();
        if (!visiting.add(goalId)) {
            return;
        }
        List<String> contains = goal.getContains();
        if (contains == null || contains.isEmpty()) {
            atomic.add(goalId);
        } else {
            for (String childRef : contains) {
                collectAtomicGoalIds(childRef, atomic, visiting);
            }
        }
        visiting.remove(goalId);
    }

    private LearningGoal resolveGoal(String goalRef) {
        if (goalRef == null || goalRef.isBlank()) {
            return null;
        }
        LearningGoal direct = landscapeService.getGoalDefinition(goalRef);
        if (direct != null) {
            return direct;
        }
        int idx = goalRef.indexOf(':');
        if (idx >= 0 && idx < goalRef.length() - 1) {
            String suffix = goalRef.substring(idx + 1);
            if (!suffix.isBlank()) {
                return landscapeService.getGoalDefinition(suffix);
            }
        }
        return null;
    }

    private String selectDefaultCurriculum(Map<String, CurriculumMetrics> metricsByCurriculum,
            List<LandscapeSummary> baseCurricula) {
        String bestId = null;
        long bestScore = -1;
        for (LandscapeSummary summary : baseCurricula) {
            String curriculumId = summary.getCurriculumId();
            long score = metricsByCurriculum.getOrDefault(curriculumId, new CurriculumMetrics(0, 0)).totalMastered();
            if (score > bestScore) {
                bestScore = score;
                bestId = curriculumId;
            }
        }
        if (bestId != null) {
            return bestId;
        }
        return baseCurricula.isEmpty() ? null : baseCurricula.get(0).getCurriculumId();
    }

    private record CurriculumMetrics(long totalAtomicGoals, long totalMastered) {
    }

    private record CurriculaMetricsSnapshot(
            Map<String, CurriculumMetrics> metricsByCurriculum,
            Map<String, Set<String>> goalToRoots,
            String defaultCurriculumId,
            Instant lastUpdatedAt) {
    }

    public List<com.skillpilot.backend.api.TopicSummary> getTopics(String curriculumId) {
        if (landscapeService.isCompatibilityOnlyLandscape(curriculumId)) {
            return landscapeService.getCompatibilityArchiveTopics(curriculumId);
        }
        SkillLandscape landscape = landscapeService.getById(curriculumId);
        if (landscape == null || landscape.getGoals() == null || landscape.getGoals().isEmpty()) {
            return java.util.Collections.emptyList();
        }

        // Find root goal (similar to LandscapeService logic)
        LearningGoal rootGoal = landscape.getGoals().stream()
                .filter(g -> g.getTags() != null && g.getTags().contains("root"))
                .findFirst()
                .orElse(landscape.getGoals().get(0));

        List<String> childrenIds = rootGoal.getContains();
        if (childrenIds == null || childrenIds.isEmpty()) {
            // Fallback to returning the root itself if no children
            String rootTitle = rootGoal.getTitle();
            String rootTitleEn = rootGoal.getTitleEn();
            if (rootTitleEn == null || rootTitleEn.isBlank()) {
                rootTitleEn = rootTitle;
            }
            return List.of(new com.skillpilot.backend.api.TopicSummary(
                    rootGoal.getId(),
                    rootTitle,
                    rootTitleEn));
        }

        // Resolve children IDs to Goal objects using global lookup
        // because children might be in different files (referenced modules)
        return childrenIds.stream()
                .map(id -> landscapeService.getGoalDefinition(id))
                .filter(java.util.Objects::nonNull)
                .filter(g -> !isWhyTopic(g))
                .map(g -> {
                    String title = g.getTitle();
                    String titleEn = g.getTitleEn();
                    if (titleEn == null || titleEn.isBlank()) {
                        titleEn = title;
                    }
                    return new com.skillpilot.backend.api.TopicSummary(
                            g.getId(),
                            title,
                            titleEn);
                })
                .toList();
    }

    private boolean isWhyTopic(LearningGoal goal) {
        if (goal == null) {
            return false;
        }
        return matchesWhyTopicTitle(goal.getTitle()) || matchesWhyTopicTitle(goal.getTitleEn());
    }

    private boolean matchesWhyTopicTitle(String title) {
        return title != null && WHY_TOPIC_PATTERN.matcher(title).matches();
    }
}
