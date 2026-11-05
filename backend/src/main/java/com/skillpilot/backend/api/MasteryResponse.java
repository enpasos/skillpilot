package com.skillpilot.backend.api;

import java.util.Map;

public record MasteryResponse(Map<String, Double> mastery,
        @com.fasterxml.jackson.annotation.JsonInclude(com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL)
        LearningUnitsReadModel learningUnits) {
    public MasteryResponse(Map<String, Double> mastery) { this(mastery, null); }
}
