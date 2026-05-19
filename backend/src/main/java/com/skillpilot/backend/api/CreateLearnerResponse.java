package com.skillpilot.backend.api;

import com.skillpilot.backend.landscape.LandscapeSummary;
import java.util.List;

public record CreateLearnerResponse(
                UnifiedLearnerStateResponse state,
                List<LandscapeSummary> availableCurricula,
                String mobileImportUrl) {

        public CreateLearnerResponse(
                        UnifiedLearnerStateResponse state,
                        List<LandscapeSummary> availableCurricula) {
                this(state, availableCurricula, null);
        }
}
