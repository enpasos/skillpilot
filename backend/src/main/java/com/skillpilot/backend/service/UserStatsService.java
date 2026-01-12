package com.skillpilot.backend.service;

import com.skillpilot.backend.api.UserCountPoint;
import com.skillpilot.backend.api.UserStatsResponse;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import com.skillpilot.backend.repository.MasteryRepository.LearnerAchievementDate;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class UserStatsService {

    private static final double ACHIEVEMENT_THRESHOLD = 0.9;

    private final LearnerRepository learnerRepository;
    private final MasteryRepository masteryRepository;

    public UserStatsService(LearnerRepository learnerRepository, MasteryRepository masteryRepository) {
        this.learnerRepository = learnerRepository;
        this.masteryRepository = masteryRepository;
    }

    public UserStatsResponse getStats(String filter) {
        long totalUsers = learnerRepository.count();
        List<Instant> createdAtValues;

        if ("WITH_ACHIEVEMENTS".equalsIgnoreCase(filter)) {
            createdAtValues = learnerRepository.findAllCreatedAtWithAchievements(ACHIEVEMENT_THRESHOLD);
        } else if ("ACTIVE_LAST_WEEK".equalsIgnoreCase(filter)) {
            Instant oneWeekAgo = Instant.now().minus(7, java.time.temporal.ChronoUnit.DAYS);
            createdAtValues = learnerRepository.findAllCreatedAtActiveSince(oneWeekAgo);
        } else {
            createdAtValues = learnerRepository.findAllCreatedAt();
        }

        Map<LocalDate, Long> createdCounts = new HashMap<>();
        for (Instant createdAt : createdAtValues) {
            if (createdAt == null) {
                continue;
            }
            LocalDate date = createdAt.atZone(ZoneOffset.UTC).toLocalDate();
            createdCounts.merge(date, 1L, Long::sum);
        }
        List<UserCountPoint> totalSeries = buildCumulativeSeries(createdCounts);

        List<LearnerAchievementDate> achievementDates = masteryRepository
                .findFirstAchievementDates(ACHIEVEMENT_THRESHOLD);
        long usersWithAchievements = achievementDates.size();

        Map<LocalDate, Long> achievementCounts = new HashMap<>();
        for (LearnerAchievementDate achievement : achievementDates) {
            Instant achievedAt = achievement.getFirstAchievedAt();
            if (achievedAt == null) {
                continue;
            }
            LocalDate date = achievedAt.atZone(ZoneOffset.UTC).toLocalDate();
            achievementCounts.merge(date, 1L, Long::sum);
        }
        List<UserCountPoint> achievementSeries = buildCumulativeSeries(achievementCounts);

        List<Instant> allAchievementDates = masteryRepository.findAllAchievementDates(ACHIEVEMENT_THRESHOLD);
        long totalSuccesses = allAchievementDates.size();

        Map<LocalDate, Long> successCounts = new HashMap<>();
        for (Instant achievedAt : allAchievementDates) {
            if (achievedAt == null) {
                continue;
            }
            LocalDate date = achievedAt.atZone(ZoneOffset.UTC).toLocalDate();
            successCounts.merge(date, 1L, Long::sum);
        }
        List<UserCountPoint> successSeries = buildCumulativeSeries(successCounts);

        return new UserStatsResponse(
                totalUsers,
                usersWithAchievements,
                totalSuccesses,
                totalSeries,
                achievementSeries,
                successSeries,
                Instant.now());
    }

    private List<UserCountPoint> buildCumulativeSeries(Map<LocalDate, Long> dailyCounts) {
        if (dailyCounts.isEmpty()) {
            return Collections.emptyList();
        }

        LocalDate start = Collections.min(dailyCounts.keySet());
        LocalDate end = LocalDate.now(ZoneOffset.UTC);
        long cumulative = 0L;
        List<UserCountPoint> series = new ArrayList<>();

        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
            cumulative += dailyCounts.getOrDefault(date, 0L);
            series.add(new UserCountPoint(date.toString(), cumulative));
        }

        return series;
    }
}
