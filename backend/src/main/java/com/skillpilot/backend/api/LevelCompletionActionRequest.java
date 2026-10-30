package com.skillpilot.backend.api;

/** A revision-bound choice from a previously projected completion response. */
public record LevelCompletionActionRequest(String action, String profileId, String goalId,
                                           String intent, Long expectedRevision) { }
