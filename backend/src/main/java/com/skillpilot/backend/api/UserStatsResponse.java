package com.skillpilot.backend.api;

import java.time.Instant;
import java.util.List;

public record UserStatsResponse(
                long totalUsers,
                long usersWithAchievements,
                long totalSuccesses,
                List<UserCountPoint> totalSeries,
                List<UserCountPoint> achievementSeries,
                List<UserCountPoint> successSeries,
                Instant generatedAt) {
}
