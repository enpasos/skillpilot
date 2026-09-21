package com.skillpilot.backend.content;

import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/** Read-only optional material lookup. Learner identity never enters the returned projection. */
@Service
public final class ContentMaterialResolver {
    private static final Logger LOG = LoggerFactory.getLogger(ContentMaterialResolver.class);
    private static final int MAX_MATERIALS_PER_GOAL = 4;

    public record ResolvedMaterial(
            String title, String url, String provider, String resourceType,
            String language, List<String> sections, String access, String aiUsage) {}

    private final ContentCatalog catalog;
    private final ContentSelectionService selections;
    private final boolean enabled;

    public ContentMaterialResolver(
            ContentCatalog catalog,
            ContentSelectionService selections,
            @Value("${skillpilot.content.enabled:true}") boolean enabled) {
        this.catalog = catalog;
        this.selections = selections;
        this.enabled = enabled;
    }

    /** The caller supplies a goal already authorized by the current learner-facing state. */
    public List<ResolvedMaterial> resolve(String learnerId, String goalId, String locale) {
        if (!enabled || learnerId == null || learnerId.isBlank() || goalId == null || goalId.isBlank()) {
            return List.of();
        }
        try {
            return catalog.materialsForGoal(selections.selectedPackageIds(learnerId), goalId).stream()
                    .limit(MAX_MATERIALS_PER_GOAL)
                    .map(match -> new ResolvedMaterial(
                            ContentCatalog.localized(match.material().title(), match.material().titleEn(), locale),
                            match.material().url(), match.provider().name(),
                            match.material().resourceType(), match.material().language(),
                            match.material().sections(), match.contentPackage().access(),
                            match.contentPackage().aiUsage()))
                    .toList();
        } catch (RuntimeException exception) {
            // Material preferences must not become a new availability dependency of the coach.
            LOG.warn("Optional learner materials unavailable; continuing ordinary learning");
            return List.of();
        }
    }
}
