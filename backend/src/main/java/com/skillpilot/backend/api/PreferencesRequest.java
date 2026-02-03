package com.skillpilot.backend.api;

public record PreferencesRequest(
                String learningStrategy,
                Boolean autoPilot,
                Boolean strictMode) {
}
