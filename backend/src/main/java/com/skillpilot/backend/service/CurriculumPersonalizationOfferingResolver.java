package com.skillpilot.backend.service;

import java.util.Map;

/**
 * Provider-neutral facade for reviewed learner-facing curriculum offerings.
 *
 * <p>Repository-backed runtimes resolve through registered composition views;
 * package-backed runtimes resolve through their authored offered scopes. The
 * personalization planner never scans files or derives choices from the skill
 * graph.</p>
 */
@FunctionalInterface
public interface CurriculumPersonalizationOfferingResolver {

    /**
     * Resolves one authored scope probe for a landscape.
     *
     * @return the scope of the reviewed resolved view, or {@code null} when
     *     the probe is not offered
     */
    Map<String, String> resolveScope(String landscapeId, Map<String, String> requestedScope);
}
