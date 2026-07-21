package com.skillpilot.backend.ai.visiblesession;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import jakarta.validation.constraints.NotNull;

public record VisibleNavigationRequest(
        @NotNull Target target) {

    public enum Target {
        CURRICULUM("curriculum"),
        PERSONALIZATION("personalization"),
        SCOPE("scope"),
        GOAL("goal");

        private final String value;

        Target(String value) {
            this.value = value;
        }

        @JsonValue
        public String value() {
            return value;
        }

        @JsonCreator
        public static Target fromValue(String value) {
            for (Target target : values()) {
                if (target.value.equals(value)) {
                    return target;
                }
            }
            throw new IllegalArgumentException("Unsupported navigation target: " + value);
        }
    }
}
