package com.skillpilot.backend.service.learningplan;

import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Tri-state direction derived strictly from plan backlog and advance work.
 */
public enum StatusDirection {
    BEHIND("behind"),
    ON_TRACK("on_track"),
    AHEAD("ahead");

    private final String value;

    StatusDirection(String value) {
        this.value = value;
    }

    @JsonValue
    public String value() {
        return value;
    }

    public String getValue() {
        return value;
    }

    public static StatusDirection fromValue(String value) {
        if (value == null) {
            return ON_TRACK;
        }
        for (StatusDirection dir : values()) {
            if (dir.value.equalsIgnoreCase(value) || dir.name().equalsIgnoreCase(value)) {
                return dir;
            }
        }
        return ON_TRACK;
    }
}
