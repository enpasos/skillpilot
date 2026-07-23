package com.skillpilot.backend.openai.de.oauth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.skillpilot.backend.openai.de.OpenAiDeConfiguration;
import com.skillpilot.backend.openai.de.OpenAiDeProperties;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;

class OpenAiDeOAuthConfigurationTest {

    private final OpenAiDeOAuthConfiguration configuration = new OpenAiDeOAuthConfiguration();

    @Test
    void defaultsDoNotGuessChatGptClientOrCallback() {
        OpenAiDeProperties properties = new OpenAiDeProperties();

        assertThat(properties.getOauth().getClientId()).isEmpty();
        assertThat(properties.getOauth().getRedirectUris()).isEmpty();
    }

    @Test
    void missingAppManagementValuesDoNotFailStartupWhileOauthIsDisabled() {
        new ApplicationContextRunner()
                .withUserConfiguration(OpenAiDeConfiguration.class, OpenAiDeOAuthConfiguration.class)
                .withPropertyValues(
                        "skillpilot.openai.de.enabled=true",
                        "skillpilot.openai.de.oauth.enabled=false")
                .run(context -> {
                    assertThat(context).hasNotFailed();
                    assertThat(context).doesNotHaveBean("registerOpenAiDeClient");
                    assertThat(context).hasSingleBean(OpenAiDeProperties.class);
                    assertThat(context.getBean(OpenAiDeProperties.class).getOauth().getClientId()).isEmpty();
                    assertThat(context.getBean(OpenAiDeProperties.class).getOauth().getRedirectUris()).isEmpty();
                });
    }

    @Test
    void enabledOauthFailsFastWithoutAppManagementValues() {
        RegisteredClientRepository clients = mock(RegisteredClientRepository.class);
        OpenAiDeProperties properties = new OpenAiDeProperties();
        InitializingBean initializer = configuration.registerOpenAiDeClient(clients, properties);

        assertThatExceptionOfType(IllegalStateException.class)
                .isThrownBy(initializer::afterPropertiesSet)
                .withMessageContaining("client-id")
                .withMessageContaining("ChatGPT app management");
    }

    @Test
    void enabledOauthFailsFastWithoutActualRedirectUri() {
        RegisteredClientRepository clients = mock(RegisteredClientRepository.class);
        OpenAiDeProperties properties = new OpenAiDeProperties();
        properties.getOauth().setClientId("configured-client-id");

        assertThatExceptionOfType(IllegalStateException.class)
                .isThrownBy(configuration.registerOpenAiDeClient(clients, properties)::afterPropertiesSet)
                .withMessageContaining("redirect-uris")
                .withMessageContaining("ChatGPT app management");
    }

    @Test
    void registersExactlyConfiguredPublicPkceClient() throws Exception {
        RegisteredClientRepository clients = mock(RegisteredClientRepository.class);
        OpenAiDeProperties properties = configuredProperties();
        when(clients.findByClientId("chatgpt-app-client-id")).thenReturn(null);
        ArgumentCaptor<RegisteredClient> saved = ArgumentCaptor.forClass(RegisteredClient.class);

        configuration.registerOpenAiDeClient(clients, properties).afterPropertiesSet();

        verify(clients).save(saved.capture());
        RegisteredClient client = saved.getValue();
        assertThat(client.getClientId()).isEqualTo("chatgpt-app-client-id");
        assertThat(client.getRedirectUris()).containsExactly(
                "https://chatgpt.com/connector/oauth/app-specific-callback");
        assertThat(client.getClientAuthenticationMethods()).containsExactly(ClientAuthenticationMethod.NONE);
        assertThat(client.getAuthorizationGrantTypes()).containsExactlyInAnyOrder(
                AuthorizationGrantType.AUTHORIZATION_CODE,
                AuthorizationGrantType.REFRESH_TOKEN);
        assertThat(client.getScopes()).containsExactlyInAnyOrder(
                OpenAiDeOAuthConfiguration.READ_SCOPE,
                OpenAiDeOAuthConfiguration.WRITE_SCOPE,
                OpenAiDeOAuthConfiguration.OFFLINE_SCOPE);
        assertThat(client.getClientSettings().isRequireProofKey()).isTrue();
        assertThat(client.getTokenSettings().isReuseRefreshTokens()).isFalse();
    }

    @Test
    void rejectsNonHttpsResourceAndCallbackConfiguration() {
        RegisteredClientRepository clients = mock(RegisteredClientRepository.class);
        OpenAiDeProperties properties = configuredProperties();
        properties.setMcpUrl("http://skillpilot.test/api/openai/de/mcp");

        assertThatExceptionOfType(IllegalStateException.class)
                .isThrownBy(configuration.registerOpenAiDeClient(clients, properties)::afterPropertiesSet)
                .withMessageContaining("MCP resource")
                .withMessageContaining("HTTPS");
    }

    @Test
    void rejectsWhitespaceAroundExactResourceConfiguration() {
        RegisteredClientRepository clients = mock(RegisteredClientRepository.class);
        OpenAiDeProperties properties = configuredProperties();
        properties.setMcpUrl(" https://skillpilot.test/api/openai/de/mcp");

        assertThatExceptionOfType(IllegalStateException.class)
                .isThrownBy(configuration.registerOpenAiDeClient(clients, properties)::afterPropertiesSet)
                .withMessageContaining("MCP resource")
                .withMessageContaining("whitespace");
    }

    private OpenAiDeProperties configuredProperties() {
        OpenAiDeProperties properties = new OpenAiDeProperties();
        properties.setMcpUrl("https://skillpilot.test/api/openai/de/mcp");
        properties.getOauth().setClientId("chatgpt-app-client-id");
        properties.getOauth().setRedirectUris(List.of(
                "https://chatgpt.com/connector/oauth/app-specific-callback"));
        properties.getOauth().setProtectedResourceMetadata(
                "https://skillpilot.test/api/openai/de/oauth/protected-resource");
        return properties;
    }
}
