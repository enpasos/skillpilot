package com.skillpilot.backend.service;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * Package runtime currently has no released curriculum-quality artifact.
 *
 * <p>The missing projection is intentional and, unlike repository mode, never probes authoring
 * paths such as {@code docs/} or {@code curricula/}.
 */
@Component
@ConditionalOnProperty(prefix = "skillpilot.curriculum", name = "source", havingValue = "package")
public final class PackageCurriculumQualitySnapshotProvider implements CurriculumQualitySnapshotProvider {

    @Override
    public CurriculumQualitySnapshot load() {
        return CurriculumQualitySnapshot.empty();
    }
}
