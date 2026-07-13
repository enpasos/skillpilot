package com.skillpilot.backend.api;

import java.time.Instant;

public record ClaudeLaunchResponse(
        String prompt,
        String webUrl,
        String desktopUrl,
        Instant expiresAt) {
}
