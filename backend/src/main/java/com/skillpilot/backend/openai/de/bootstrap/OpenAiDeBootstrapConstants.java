package com.skillpilot.backend.openai.de.bootstrap;

import com.skillpilot.backend.openai.de.oauth.OpenAiDeOAuthConfiguration;
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1ContractMetadata;
import java.time.Duration;
import java.util.List;

/** Fixed security contract for the OpenAI Coach V1 direct-start bootstrap. */
public final class OpenAiDeBootstrapConstants {

    public static final int CONTRACT_MAJOR = OpenAiDeV1ContractMetadata.CONTRACT_MAJOR;
    public static final int CAPABILITY_SCHEMA_VERSION = 1;
    public static final int REQUEST_SCHEMA_VERSION = 1;
    public static final int RESPONSE_SCHEMA_VERSION = 1;
    /** Increment only; every policy-semantic change invalidates older capabilities. */
    public static final long POLICY_REVISION = OpenAiDeV1ContractMetadata.POLICY_REVISION;
    public static final String PURPOSE = "OPENAI_V1_CURRENT_UNIT_BOOTSTRAP";
    public static final String ALLOW_SOURCE_MAJOR_DECISION = "ALLOW_CURRENT_MAJOR";
    public static final String LAUNCH_INTENT = "CURRENT_UNIT";
    public static final String RESPONSE_STATUS = "SESSION_CREATED";
    public static final String PROVIDER_NOTICE_VERSION =
            OpenAiDeV1ContractMetadata.PROVIDER_NOTICE_VERSION;
    public static final String RESOURCE = OpenAiDeV1ContractMetadata.OAUTH_RESOURCE;
    public static final List<String> REQUIRED_SCOPES = List.of(
            OpenAiDeOAuthConfiguration.READ_SCOPE,
            OpenAiDeOAuthConfiguration.WRITE_SCOPE);
    public static final Duration CAPABILITY_TTL = Duration.ofMinutes(10);
    public static final Duration ATTEMPT_RETRY_TTL = Duration.ofMinutes(15);
    public static final Duration RESPONSE_TTL = Duration.ofMinutes(15);
    public static final Duration TOMBSTONE_TTL = Duration.ofHours(24);

    private OpenAiDeBootstrapConstants() {
    }
}
