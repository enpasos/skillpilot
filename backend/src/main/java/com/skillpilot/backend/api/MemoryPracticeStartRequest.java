package com.skillpilot.backend.api;

public record MemoryPracticeStartRequest(String goalId, String practiceScopeId) {
    public MemoryPracticeStartRequest(String goalId) {
        this(goalId, null);
    }
}
