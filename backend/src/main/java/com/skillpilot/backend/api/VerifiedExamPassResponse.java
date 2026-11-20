package com.skillpilot.backend.api;

import java.time.Instant;

/** An observed passing score bound to the material that was assessed. */
public record VerifiedExamPassResponse(Instant passedAt, double earnedPoints, double maxPoints,
        double passingPoints, String taskRevision, String rubricRevision, String fingerprint) {}
