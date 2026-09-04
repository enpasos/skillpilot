package com.skillpilot.backend.service;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/** A plan could not be normalized to a prerequisite-safe schedule. */
public final class LearningPlanPrerequisiteScheduleConflictException extends ResponseStatusException {

    public LearningPlanPrerequisiteScheduleConflictException() {
        super(HttpStatus.BAD_REQUEST);
    }
}
