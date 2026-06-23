package com.skillpilot.backend.api;

public record VerifiedRecallStartRequest(
        String goalId,
        Boolean retest,
        Integer batchSize) {

    public VerifiedRecallStartRequest(String goalId, Boolean retest) {
        this(goalId, retest, null);
    }
}
