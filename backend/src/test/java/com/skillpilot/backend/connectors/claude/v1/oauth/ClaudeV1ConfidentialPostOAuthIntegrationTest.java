package com.skillpilot.backend.connectors.claude.v1.oauth;

import org.springframework.test.context.TestPropertySource;

/** The identical strict protocol contract with POST credentials, only if Anthropic confirms it. */
@TestPropertySource(properties = {
        "skillpilot.claude.connector.v1.oauth.client-authentication-method=client_secret_post",
        "spring.datasource.url=jdbc:h2:mem:claude-confidential-post;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;NON_KEYWORDS=VALUE"
})
class ClaudeV1ConfidentialPostOAuthIntegrationTest extends ClaudeV1ConfidentialOAuthIntegrationTest {}
