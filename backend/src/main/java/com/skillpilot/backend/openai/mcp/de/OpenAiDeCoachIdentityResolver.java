package com.skillpilot.backend.openai.mcp.de;

import io.modelcontextprotocol.common.McpTransportContext;

/**
 * Combines the authenticated OpenAI app connection with one explicit,
 * short-lived learning session.
 *
 * <p>OAuth authorizes the predefined app client. The opaque learning-session
 * value independently selects the learner for one concrete start. The
 * permanent learner ID remains behind this server-side boundary.</p>
 */
public interface OpenAiDeCoachIdentityResolver {

    String resolveSkillpilotId(
            McpTransportContext transportContext,
            String learningSessionId);

    /**
     * Requires the V1 read scope and returns the stable technical OAuth
     * authorization reference for this App connection. The reference never
     * identifies or selects a learner or learning session.
     */
    String requireAuthorizationReference(McpTransportContext transportContext);

    /** Rejects a mutation unless the current connection has the V1 write scope. */
    void requireWriteAccess(McpTransportContext transportContext);

    /** Exact Bearer challenge published by the OpenAI Coach V1 protected resource. */
    String authenticationChallenge();

    /** Bearer challenge used when a valid token lacks the required write scope. */
    String insufficientScopeChallenge();
}
