package com.skillpilot.backend.openai.de.oauth;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest(
        classes = OpenAiDeOAuthFlowIntegrationTest.TestApplication.class,
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:openai-de-public-oauth;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.liquibase.enabled=true",
        "spring.liquibase.change-log=classpath:db/changelog/db.changelog-master.yaml",
        "skillpilot.openai.de.enabled=true",
        "skillpilot.security.signing-secret=7Vh2Kp9Qw4Rx8Mz3Tn6Yc1Fd5Js0LaEuBiOg",
        "skillpilot.openai.de.server-build=test-build",
        "skillpilot.openai.de.security.secure-mode=true",
        "skillpilot.openai.de.oauth.enabled=true",
        "skillpilot.openai.de.oauth.client-authentication-method=client_secret_basic",
        "skillpilot.openai.de.oauth.client-assertion-replay-cache-size=0",
        "skillpilot.openai.de.oauth.client-id=chatgpt-confidential-test-client",
        "skillpilot.openai.de.oauth.client-secret=confidential-test-secret-that-is-longer-than-thirty-two-characters",
        "skillpilot.openai.de.oauth.redirect-uris=https://chatgpt.com/connector/oauth/confidential-test-callback",
        "skillpilot.openai.de.mtls-edge.enabled=false",
        "skillpilot.openai.de.mcp.enabled=false",
        "skillpilot.openai.de.secure-cookie=false",
        "skillpilot.public-base-url=https://skillpilot.test",
        "skillpilot.openai.de.mcp-url=https://mcp-v1.skillpilot.com/mcp",
        "skillpilot.openai.de.oauth-resource=https://mcp-v1.skillpilot.com",
        "skillpilot.openai.de.oauth.protected-resource-metadata=https://mcp-v1.skillpilot.com/.well-known/oauth-protected-resource"
})
class OpenAiDePublicOAuthContextIntegrationTest {

    @Autowired
    private ApplicationContext context;

    @Autowired
    @Qualifier("openAiDeRegisteredClientRepository")
    private RegisteredClientRepository registeredClients;

    @Test
    void secureContextStartsForPinnedConfidentialClientWithoutReplayCache() {
        assertThat(context.getBeansOfType(OpenAiDeJwtClientAssertionValidator.class))
                .isEmpty();

        RegisteredClient client =
                registeredClients.findByClientId("chatgpt-confidential-test-client");
        assertThat(client).isNotNull();
        assertThat(client.getClientAuthenticationMethods())
                .containsExactly(ClientAuthenticationMethod.CLIENT_SECRET_BASIC);
        assertThat(client.getClientSecret())
                .startsWith("{bcrypt}")
                .doesNotContain("confidential-test-secret");
    }
}
