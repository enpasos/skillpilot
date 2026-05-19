package com.skillpilot.backend.api;

public record ChatStartRequest(
        String language,
        String client,
        String selectedCurriculum,
        String promptContext) {
}
