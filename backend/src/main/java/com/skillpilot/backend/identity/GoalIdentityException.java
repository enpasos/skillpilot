package com.skillpilot.backend.identity;

/** Invalid identity evidence or reference, never a permission or a learner-state result. */
public final class GoalIdentityException extends IllegalArgumentException {
    public GoalIdentityException(String message) { super(message); }
}
