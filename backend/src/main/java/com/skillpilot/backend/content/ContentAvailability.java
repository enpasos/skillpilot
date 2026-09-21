package com.skillpilot.backend.content;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

/** Optional operational switch; learner access follows the ordinary Cockpit routes. */
@Component
public class ContentAvailability {
    private final boolean enabled;

    public ContentAvailability(@Value("${skillpilot.content.enabled:true}") boolean enabled) {
        this.enabled = enabled;
    }

    public boolean isEnabled() { return enabled; }

    public void requireEnabled() {
        if (!enabled) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Learning materials unavailable");
    }
}
