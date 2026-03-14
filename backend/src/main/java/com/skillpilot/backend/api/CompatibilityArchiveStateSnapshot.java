package com.skillpilot.backend.api;

import com.skillpilot.backend.domain.CopySource;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;

public record CompatibilityArchiveStateSnapshot(
        String skillpilotId,
        String selectedCurriculum,
        String personalCurriculum,
        String activeGoalId,
        String learningState,
        String learningStrategy,
        Boolean autoPilot,
        Boolean strictMode,
        Instant createdAt,
        List<String> plannedGoals,
        Map<String, MasteryEntryDTO> mastery,
        Set<CopySource> copySources,
        ClientStateSnapshot learnerClientState) {
}
