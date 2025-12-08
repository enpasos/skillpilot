package com.skillpilot.backend.api;

import java.util.List;

public record LearnerGoals(
                List<FrontierGoal> planned,
                long mastered_count,
                long total_count) {
}
