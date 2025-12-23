package com.skillpilot.backend.service;

import com.skillpilot.backend.domain.Mastery;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.landscape.LearningLandscape;
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
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class HallOfFameService {

    private static final Logger log = LoggerFactory.getLogger(HallOfFameService.class);

    private final LandscapeService landscapeService;
    private final MasteryRepository masteryRepository;

    private final AtomicReference<HallOfFameSnapshot> snapshot = new AtomicReference<>(
            new HallOfFameSnapshot(Collections.emptyList(), null, Instant.now()));

    public HallOfFameService(LandscapeService landscapeService, MasteryRepository masteryRepository) {
        this.landscapeService = landscapeService;
        this.masteryRepository = masteryRepository;
    }

    @PostConstruct
    public void init() {
        refreshSnapshot();
    }

    @Scheduled(fixedRate = 600000) // 10 minutes
    public void refreshSnapshot() {
        log.info("Refreshing Hall of Fame snapshot...");
        try {
            // 1. Map all ATOMIC goals for each ROOT landscape
            // Map<LandscapeId, Set<GoalId>>
            Map<String, Set<String>> landscapeAtomicGoals = new HashMap<>();

            // We focus on "Base Curricula" (roots) for the HoF to avoid fragmentation
            List<LearningLandscape> landscapes = landscapeService.getAll();

            for (LearningLandscape ll : landscapes) {
                Set<String> atomicGoals = new HashSet<>();
                if (ll.getGoals() != null) {
                    for (LearningGoal g : ll.getGoals()) {
                        // Atomic check: contains is null or empty
                        if (g.getContains() == null || g.getContains().isEmpty()) {
                            atomicGoals.add(g.getId());
                        }
                    }
                }
                landscapeAtomicGoals.put(ll.getLandscapeId(), atomicGoals);
            }

            // 2. Fetch all mastered goals (>= 0.9)
            List<Mastery> allMastery = masteryRepository.findAllByValueGreaterThanEqual(0.9);

            // 3. Aggregate scores
            // Map<LandscapeId, Map<SkillpilotId, Count>>
            Map<String, Map<String, Integer>> scores = new HashMap<>();

            for (Mastery m : allMastery) {
                String goalKey = m.getGoalKey();
                // Resolve Goal Key to Goal Object to get robust ID
                // Note: Mastery saves goalKey which might be shortKey or UUID.
                // We need to resolve it to the canonical UUID to match landscape defs.
                // LandscapeService doesn't have a direct "resolve key" but we can try common
                // lookups.

                String goalId = null;
                // If it looks like a UUID, assume it is one.
                if (isUuid(goalKey)) {
                    goalId = goalKey;
                } else {
                    // Try to find goal by shortKey?
                    // Since LandscapeService doesn't expose a global ShortKey map easily,
                    // and we assumed in planning that migration mostly uses UUIDs,
                    // we might miss legacy shortKey data here if not careful.
                    // For now, let's assume UUIDs or try to lookup via goalIdToLandscapeId if
                    // possible.
                    // Actually, LandscapeService has `getGoalDefinition(goalId)` which expects ID.
                    // If goalKey is shortKey, this might fail.
                    // Let's assume for this implementation that goalKey IS the goalId as per recent
                    // practices.
                    goalId = goalKey;
                }

                // Find which landscape(s) contain this goal
                String homeLandscapeId = landscapeService.getLandscapeIdForGoal(goalId);

                if (homeLandscapeId != null && landscapeAtomicGoals.containsKey(homeLandscapeId)) {
                    Set<String> atomicSet = landscapeAtomicGoals.get(homeLandscapeId);
                    if (atomicSet.contains(goalId)) {
                        scores.computeIfAbsent(homeLandscapeId, k -> new HashMap<>())
                                .merge(m.getLearner().getSkillpilotId(), 1, Integer::sum);
                    }

                    // Also check if this goal is part of other landscapes (closures)?
                    // For HoF, usually we attribute it to the 'home' or 'root' curriculum.
                    // To keep it simple and performant: count it for the landscape defining it.
                    // If we want to support aggregation (e.g. Master of "Math" implies checking all
                    // sub-modules),
                    // we would need to walk up the hierarchy.
                    // Current simplified spec: "Curriculum filter".
                    // If I select "Math", I want to see learners who mastered atomic goals *within*
                    // Math.
                    // LandscapeService.getClosure(landscapeId) would give us all sub-modules.
                }
            }

            // Refined aggregation:
            // A user selects "Gymnasiale Oberstufe" (Root).
            // They should get points for goals mastered in sub-modules (e.g. "Math",
            // "Biology").
            // So we need to map: GoalID -> Set<RootLandscapeID>
            Map<String, Set<String>> goalToRoots = new HashMap<>();
            List<LearningLandscape> roots = landscapeService.getBaseCurricula().stream()
                    .map(s -> landscapeService.getById(s.getCurriculumId()))
                    .filter(java.util.Objects::nonNull)
                    .collect(Collectors.toList());

            for (LearningLandscape root : roots) {
                // Get closure (all sub-modules included)
                List<LearningLandscape> closure = landscapeService.getClosure(root.getLandscapeId());
                for (LearningLandscape submodule : closure) {
                    if (submodule.getGoals() != null) {
                        for (LearningGoal g : submodule.getGoals()) {
                            if (g.getContains() == null || g.getContains().isEmpty()) {
                                goalToRoots.computeIfAbsent(g.getId(), k -> new HashSet<>()).add(root.getLandscapeId());
                            }
                        }
                    }
                }
            }

            // Re-aggregate with closure logic
            Map<String, Map<String, Integer>> rootScores = new HashMap<>();
            for (Mastery m : allMastery) {
                String goalId = m.getGoalKey(); // Assuming UUID
                Set<String> rootsForGoal = goalToRoots.get(goalId);
                if (rootsForGoal != null) {
                    for (String rootId : rootsForGoal) {
                        rootScores.computeIfAbsent(rootId, k -> new HashMap<>())
                                .merge(m.getLearner().getSkillpilotId(), 1, Integer::sum);
                    }
                }
            }

            // 4. Build Result List
            List<CurriculumLeaderboard> leaderboards = new ArrayList<>();
            String topCurriculumId = null;
            long maxMasteredTotal = -1;

            for (LearningLandscape root : roots) {
                String rootId = root.getLandscapeId();
                Map<String, Integer> learnerCounts = rootScores.getOrDefault(rootId, Collections.emptyMap());

                // Sort learners
                List<LearnerScore> topLearners = learnerCounts.entrySet().stream()
                        .map(e -> new LearnerScore(maskId(e.getKey()), e.getValue()))
                        .sorted(Comparator.comparingInt(LearnerScore::score).reversed())
                        .limit(3)
                        .collect(Collectors.toList());

                // Calculate totals
                long totalMasteredInLandscape = learnerCounts.values().stream().mapToLong(i -> i).sum();

                // Count total atomic goals in this root (closure)
                long totalAtomicGoals = 0;
                List<LearningLandscape> closure = landscapeService.getClosure(rootId);
                for (LearningLandscape l : closure) {
                    if (l.getGoals() != null) {
                        totalAtomicGoals += l.getGoals().stream()
                                .filter(g -> g.getContains() == null || g.getContains().isEmpty())
                                .count();
                    }
                }

                if (!topLearners.isEmpty()) {
                    leaderboards.add(new CurriculumLeaderboard(
                            rootId,
                            root.getTitle(),
                            totalAtomicGoals,
                            totalMasteredInLandscape,
                            topLearners));

                    if (totalMasteredInLandscape > maxMasteredTotal) {
                        maxMasteredTotal = totalMasteredInLandscape;
                        topCurriculumId = rootId;
                    }
                }
            }

            // Sort curricula by total mastered? Or alphabetical?
            // Spec says "default to the curriculum with the highest overall achieved atomic
            // goals".
            // List order isn't strictly defined, but let's sort by popularity (mastered
            // count) desc.
            leaderboards.sort(Comparator.comparingLong(CurriculumLeaderboard::totalMastered).reversed());

            if (topCurriculumId == null && !leaderboards.isEmpty()) {
                topCurriculumId = leaderboards.get(0).curriculumId;
            }

            snapshot.set(new HallOfFameSnapshot(leaderboards, topCurriculumId, Instant.now()));
            log.info("Hall of Fame snapshot refreshed. {} curricula with data.", leaderboards.size());

        } catch (Exception e) {
            log.error("Failed to refresh Hall of Fame snapshot", e);
        }
    }

    public HallOfFameSnapshot getSnapshot() {
        return snapshot.get();
    }

    private String maskId(String skillpilotId) {
        if (skillpilotId == null || skillpilotId.length() < 5)
            return "Unknown";
        return skillpilotId.substring(0, 5);
    }

    // Helper check
    private boolean isUuid(String key) {
        return key != null && key.length() == 36 && key.contains("-");
    }

    public record HallOfFameSnapshot(
            List<CurriculumLeaderboard> curricula,
            String defaultCurriculumId,
            Instant lastUpdatedAt) {
    }

    public record CurriculumLeaderboard(
            String curriculumId,
            String title,
            long totalAtomicGoals,
            long totalMastered, // sum of all masteries by all learners
            List<LearnerScore> topLearners) {
    }

    public record LearnerScore(
            String learnerLabel,
            int score) {
    }
}
