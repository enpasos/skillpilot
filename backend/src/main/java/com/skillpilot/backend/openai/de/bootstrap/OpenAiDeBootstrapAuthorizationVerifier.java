package com.skillpilot.backend.openai.de.bootstrap;

/** Revalidates one stable OAuth grant reference without resolving a learner. */
@FunctionalInterface
public interface OpenAiDeBootstrapAuthorizationVerifier {

    void requireActiveAuthorization(String oauthAuthorizationReference);
}
