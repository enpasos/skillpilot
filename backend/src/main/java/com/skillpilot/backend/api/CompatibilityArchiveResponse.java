package com.skillpilot.backend.api;

import com.skillpilot.backend.landscape.LandscapeSummary;
import java.time.Instant;
import java.util.List;
import java.util.Map;

public record CompatibilityArchiveResponse(
        String archiveType,
        Instant exportedAt,
        LandscapeSummary curriculum,
        CompatibilityArchiveStateSnapshot stateSnapshot,
        SignedLearnerDataDTO recoveryExport,
        List<MasteryHistoryEntry> history,
        Map<String, ClientStateSnapshot> serverClientStates) {
}
