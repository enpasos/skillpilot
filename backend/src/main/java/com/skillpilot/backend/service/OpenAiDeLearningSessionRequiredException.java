package com.skillpilot.backend.service;

/**
 * Signals that OAuth is valid but no active 24-hour SkillPilot learning
 * session exists for the connected learner.
 */
public final class OpenAiDeLearningSessionRequiredException extends RuntimeException {

    public OpenAiDeLearningSessionRequiredException() {
        super("An active SkillPilot learning session is required.");
    }
}
