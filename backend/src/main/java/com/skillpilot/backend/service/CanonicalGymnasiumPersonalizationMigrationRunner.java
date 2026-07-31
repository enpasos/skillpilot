package com.skillpilot.backend.service;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/**
 * Migrates canonical Gymnasium learner configurations that predate the
 * backend-owned personalization flow before the application becomes ready.
 *
 * <p>The service operation is idempotent and also runs lazily on learner-state
 * reads, so restored legacy data and isolated startup failures are covered
 * even after this best-effort startup pass.</p>
 */
@Component
public class CanonicalGymnasiumPersonalizationMigrationRunner
        implements ApplicationRunner {

    private final LearnerService learnerService;

    public CanonicalGymnasiumPersonalizationMigrationRunner(
            LearnerService learnerService) {
        this.learnerService = learnerService;
    }

    @Override
    public void run(ApplicationArguments args) {
        learnerService.migrateCanonicalGymnasiumPreFlowPersonalization();
    }
}
