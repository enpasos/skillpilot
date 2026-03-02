package com.skillpilot.backend.service;

import com.skillpilot.backend.api.ChampionRegistrationRequest;
import com.skillpilot.backend.api.ChampionRegistrationResponse;
import com.skillpilot.backend.api.CurriculaSnapshot;
import com.skillpilot.backend.api.CurriculumChampionProfile;
import com.skillpilot.backend.api.CurriculumOverview;
import com.skillpilot.backend.api.TopicSummary;
import com.skillpilot.backend.domain.CurriculumChampion;
import com.skillpilot.backend.domain.Mastery;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.landscape.LearningLandscape;
import com.skillpilot.backend.landscape.LandscapeSummary;
import com.skillpilot.backend.repository.CurriculumChampionRepository;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import jakarta.annotation.PostConstruct;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
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
    private static final Pattern GITHUB_ID_PATTERN = Pattern.compile("^[A-Za-z0-9-]{1,39}$");
    private static final Pattern WHY_TOPIC_PATTERN = Pattern.compile("^\\s*(warum|why)\\b.*",
            Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE);

    private final LandscapeService landscapeService;
    private final MasteryRepository masteryRepository;
    private final LearnerRepository learnerRepository;
    private final CurriculumChampionRepository championRepository;
    private final GitHubStatsService githubStatsService;
    private final LearnerService learnerService;

    private final AtomicReference<CurriculaMetricsSnapshot> metricsSnapshot = new AtomicReference<>(
            new CurriculaMetricsSnapshot(Collections.emptyMap(), Collections.emptyMap(), null, Instant.now()));

    public CurriculaService(
            LandscapeService landscapeService,
            MasteryRepository masteryRepository,
            LearnerRepository learnerRepository,
            CurriculumChampionRepository championRepository,
            GitHubStatsService githubStatsService,
            LearnerService learnerService) {
        this.landscapeService = landscapeService;
        this.masteryRepository = masteryRepository;
        this.learnerRepository = learnerRepository;
        this.championRepository = championRepository;
        this.githubStatsService = githubStatsService;
        this.learnerService = learnerService;
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
                List<LearningLandscape> closure = landscapeService.getClosure(curriculumId);
                for (LearningLandscape landscape : closure) {
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
            LearningLandscape landscape = landscapeService.getById(curriculumId);
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
                    topLevelTopics,
                    topLevelTopicsEn,
                    champions));
        }

        result.sort(Comparator.comparing(CurriculumOverview::title, String.CASE_INSENSITIVE_ORDER));
        return new CurriculaSnapshot(result, snapshot.defaultCurriculumId(), snapshot.lastUpdatedAt());
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
            championRepository.findByCurriculumIdAndGithubId(curriculumId, normalizedGithubId)
                    .ifPresent(championRepository::delete);
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
        long masteredCount = countChampionMastery(
                curriculumId,
                champion.getTopicId(),
                champion.getSkillpilotId(),
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
                Set<String> atomicIds = collectAtomicGoalIds(goal.getId());
                if (goalToRoots != null && !goalToRoots.isEmpty() && curriculumId != null && !curriculumId.isBlank()) {
                    atomicIds.removeIf(id -> {
                        Set<String> roots = goalToRoots.get(id);
                        return roots == null || !roots.contains(curriculumId);
                    });
                }
                totalTopicGoals = atomicIds.size();
            }
        } else {
            totalTopicGoals = countAtomicGoalsForCurriculum(curriculumId, goalToRoots);
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
            Map<String, Set<String>> goalToRoots,
            Map<String, List<Mastery>> masteryCache) {
        if (skillpilotId == null || skillpilotId.isBlank()) {
            return 0;
        }
        List<Mastery> masteryEntries = masteryCache.computeIfAbsent(
                skillpilotId,
                id -> masteryRepository.findByLearner_SkillpilotId(id));

        if (topicId != null && !topicId.isBlank()) {
            Set<String> atomicIds = collectAtomicGoalIds(topicId);
            if (atomicIds.isEmpty()) {
                return 0;
            }
            if (goalToRoots != null && !goalToRoots.isEmpty() && curriculumId != null && !curriculumId.isBlank()) {
                final String finalCurriculumId = curriculumId;
                atomicIds.removeIf(id -> {
                    Set<String> roots = goalToRoots.get(id);
                    // Fallback: if cache misses, check reachability dynamically
                    if (roots == null || !roots.contains(finalCurriculumId)) {
                        return !isReachable(finalCurriculumId, id);
                    }
                    return false;
                });
            }
            if (atomicIds.isEmpty()) {
                return 0;
            }
            long count = 0;
            for (Mastery mastery : masteryEntries) {
                if (mastery.getValue() < MASTERY_THRESHOLD) {
                    continue;
                }
                String goalKey = normalize(mastery.getGoalKey()).toLowerCase();
                if (atomicIds.contains(goalKey) || atomicIds.contains(mastery.getGoalKey())) {
                    count++;
                }
            }
            // Add SRS/flashcard mastery count (these goals have dynamic mastery not stored
            // in DB)
            long srsMastery = learnerService.countSrsMastery(skillpilotId, atomicIds);
            return count + srsMastery;
        }

        // Curriculum-wide counting (no topicId)
        if (goalToRoots == null || goalToRoots.isEmpty()) {
            return 0;
        }
        long count = 0;
        for (Mastery mastery : masteryEntries) {
            if (mastery.getValue() < MASTERY_THRESHOLD) {
                continue;
            }
            String goalKey = normalize(mastery.getGoalKey()).toLowerCase();
            // Try normalized first (canonical), then raw
            Set<String> roots = goalToRoots.get(goalKey);
            if (roots == null) {
                roots = goalToRoots.get(mastery.getGoalKey());
            }

            // Fallback: Dynamic linkage check if cache missed
            if (roots == null || !roots.contains(curriculumId)) {
                if (isReachable(curriculumId, goalKey)) {
                    count++;
                    continue;
                }
            } else if (roots.contains(curriculumId)) {
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
        List<LearningLandscape> closure = landscapeService.getClosure(curriculumId);
        for (LearningLandscape l : closure) {
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
        LearningLandscape landscape = landscapeService.getById(curriculumId);
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
