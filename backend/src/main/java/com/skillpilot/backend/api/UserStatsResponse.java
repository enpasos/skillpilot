package com.skillpilot.backend.api;

import java.time.Instant;
import java.util.List;

public record UserStatsResponse(
        long totalUsers,
        long usersWithAchievements,
        List<UserCountPoint> totalSeries,
        List<UserCountPoint> achievementSeries,
        Instant generatedAt) {}
