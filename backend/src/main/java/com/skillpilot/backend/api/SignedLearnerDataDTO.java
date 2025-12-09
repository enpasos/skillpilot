package com.skillpilot.backend.api;

public record SignedLearnerDataDTO(
        LearnerDataDTO data,
        String signature) {
}
