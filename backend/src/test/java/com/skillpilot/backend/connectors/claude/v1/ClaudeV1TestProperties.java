package com.skillpilot.backend.connectors.claude.v1;

/**
 * Shared {@code @TestPropertySource} entries for Claude v1 tests.
 *
 * <p>The two secrets are distinct on purpose: runtime validation rejects a configuration that
 * reuses one value for both, and the capability service refuses to start without its own key.</p>
 */
public final class ClaudeV1TestProperties {

    public static final String ENABLED = "skillpilot.claude.connector.v1.enabled=true";
    public static final String DISABLED = "skillpilot.claude.connector.v1.enabled=false";
    public static final String BETA_DISABLED = "skillpilot.claude.enabled=false";
    public static final String SIGNING_SECRET =
            "skillpilot.claude.connector.v1.signing-secret=claude-v1-test-signing-secret-0123456789";
    public static final String CAPABILITY_SECRET =
            "skillpilot.claude.connector.v1.capability-secret=claude-v1-test-capability-secret-9876543210";

    public static final String SIGNING_SECRET_VALUE = "claude-v1-test-signing-secret-0123456789";
    public static final String CAPABILITY_SECRET_VALUE = "claude-v1-test-capability-secret-9876543210";

    /**
     * Each Claude v1 property set produces its own Spring context. Those contexts must not share an
     * in-memory database: {@code ddl-auto=create-drop} means a shutting-down context would drop the
     * tables of one that is still running.
     */
    public static final String CORE_DATASOURCE =
            "spring.datasource.url=jdbc:h2:mem:claude-v1-core;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;NON_KEYWORDS=VALUE";
    public static final String WEB_DATASOURCE =
            "spring.datasource.url=jdbc:h2:mem:claude-v1-web;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;NON_KEYWORDS=VALUE";
    public static final String DISABLED_DATASOURCE =
            "spring.datasource.url=jdbc:h2:mem:claude-v1-disabled;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;NON_KEYWORDS=VALUE";
    public static final String DIFFERENTIAL_DATASOURCE =
            "spring.datasource.url=jdbc:h2:mem:claude-v1-differential;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;NON_KEYWORDS=VALUE";

    private ClaudeV1TestProperties() {
    }
}
