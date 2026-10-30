package com.skillpilot.backend.completion;

import com.skillpilot.backend.service.CompositionViewService;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;

/** Checks declared restrictions against already resolved Personal Curriculum subject scopes. */
public final class CompletionApplicability {
    private static final Set<String> SUPPORTED = Set.of("schoolForm", "jurisdiction", "stage", "courseProfile", "durationModel");
    private CompletionApplicability() { }

    public static void requireMatches(Map<String, List<String>> restrictions, Collection<Map<String, String>> scopes) {
        if (restrictions.isEmpty()) return;
        if (!SUPPORTED.containsAll(restrictions.keySet())) {
            throw new IllegalArgumentException("Unsupported completion applicability dimension");
        }
        if (scopes.isEmpty()) throw new UnresolvedScopeException();
        for (Map<String, String> scope : scopes) {
            for (var restriction : restrictions.entrySet()) {
                String actual = scope.get(restriction.getKey());
                if (actual == null || actual.isBlank()) throw new UnresolvedScopeException();
                if (restriction.getValue().stream().noneMatch(allowed ->
                        CompositionViewService.matchesResolvedScopeValue(restriction.getKey(), allowed, actual))) {
                    throw new CompletionApplicationService.ScopeNotApplicableException();
                }
            }
        }
    }

    public static final class UnresolvedScopeException extends IllegalArgumentException { }
}
