package com.skillpilot.backend.api;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;
import java.util.List;

/** An observed passing score bound to the material that was assessed. */
public record VerifiedExamPassResponse(Instant passedAt, double earnedPoints, double maxPoints,
        double passingPoints, String taskRevision, String rubricRevision, String fingerprint,
        @JsonInclude(JsonInclude.Include.NON_EMPTY) List<String> planningCreditBindingIds) {
    public VerifiedExamPassResponse {
        planningCreditBindingIds = planningCreditBindingIds == null ? List.of() : List.copyOf(planningCreditBindingIds);
    }

    public VerifiedExamPassResponse(Instant passedAt, double earnedPoints, double maxPoints,
            double passingPoints, String taskRevision, String rubricRevision, String fingerprint) {
        this(passedAt, earnedPoints, maxPoints, passingPoints, taskRevision, rubricRevision, fingerprint, List.of());
    }
}
