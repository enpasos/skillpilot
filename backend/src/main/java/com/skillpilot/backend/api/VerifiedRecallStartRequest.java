package com.skillpilot.backend.api;

public record VerifiedRecallStartRequest(
        String goalId,
        Boolean retest) {
}
