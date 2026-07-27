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

    /** Rejects a mutation unless the current connection has the German write scope. */
    void requireWriteAccess(McpTransportContext transportContext);

    /** Exact Bearer challenge published by the OpenAI-DE protected resource. */
    String authenticationChallenge();

    /** Bearer challenge used when a valid token lacks the required write scope. */
    String insufficientScopeChallenge();
}
