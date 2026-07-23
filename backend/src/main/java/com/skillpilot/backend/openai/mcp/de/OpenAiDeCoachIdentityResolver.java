package com.skillpilot.backend.openai.mcp.de;

import io.modelcontextprotocol.common.McpTransportContext;

/**
 * Resolves the authenticated OpenAI connection to one internal learner.
 *
 * <p>The permanent learner ID is deliberately available only behind this
 * server-side boundary. It is never accepted as a tool argument or returned in
 * a tool result.</p>
 */
public interface OpenAiDeCoachIdentityResolver {

    String resolveSkillpilotId(McpTransportContext transportContext);

    /** Rejects a mutation unless the current connection has the German write scope. */
    void requireWriteAccess(McpTransportContext transportContext);

    /** Exact Bearer challenge published by the OpenAI-DE protected resource. */
    String authenticationChallenge();

    /** Bearer challenge used when a valid token lacks the required write scope. */
    String insufficientScopeChallenge();
}
