package com.skillpilot.backend.openai.de.oauth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.skillpilot.backend.openai.de.OpenAiDeProperties;
import com.skillpilot.backend.service.OpenAiDeCoachConnectionService;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

class OpenAiDeCoachIdentityResolverAdapterTest {

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void readsResolveFromAuthenticatedSubjectWhileWritesRemainDisabled() {
        OpenAiDeCoachConnectionService connections = mock(OpenAiDeCoachConnectionService.class);
        OpenAiDeProperties properties = properties();
        OpenAiDeCoachIdentityResolverAdapter resolver = new OpenAiDeCoachIdentityResolverAdapter(
                connections,
                properties);
        authenticate("spod_subject", OpenAiDeOAuthConfiguration.READ_SCOPE, OpenAiDeOAuthConfiguration.WRITE_SCOPE);
        when(connections.resolveSkillpilotId("spod_subject")).thenReturn("learner-id");

        assertThat(resolver.resolveSkillpilotId(null)).isEqualTo("learner-id");
        assertThatExceptionOfType(ResponseStatusException.class)
                .isThrownBy(() -> resolver.requireWriteAccess(null))
                .satisfies(exception -> {
                    assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
                    assertThat(exception.getReason()).contains("vorübergehend deaktiviert");
        });
        verify(connections).resolveSkillpilotId("spod_subject");
    }

    @Test
    void enabledWritesStillRequireProviderSpecificWriteScope() {
        OpenAiDeCoachConnectionService connections = mock(OpenAiDeCoachConnectionService.class);
        OpenAiDeProperties properties = properties();
        properties.setWritesEnabled(true);
        OpenAiDeCoachIdentityResolverAdapter resolver = new OpenAiDeCoachIdentityResolverAdapter(
                connections,
                properties);
        authenticate("spod_subject", OpenAiDeOAuthConfiguration.READ_SCOPE);

        assertThatExceptionOfType(AccessDeniedException.class)
                .isThrownBy(() -> resolver.requireWriteAccess(null))
                .withMessageContaining("scope");

        authenticate("spod_subject", OpenAiDeOAuthConfiguration.READ_SCOPE, OpenAiDeOAuthConfiguration.WRITE_SCOPE);
        resolver.requireWriteAccess(null);
    }

    @Test
    void publishesTheSameExactProtectedResourceChallenge() {
        OpenAiDeProperties properties = properties();
        OpenAiDeCoachIdentityResolverAdapter resolver = new OpenAiDeCoachIdentityResolverAdapter(
                mock(OpenAiDeCoachConnectionService.class),
                properties);

        assertThat(resolver.authenticationChallenge())
                .isEqualTo("Bearer resource_metadata=\"https://skillpilot.test/api/openai/de/oauth/protected-resource\", "
                        + "scope=\"skillpilot.openai.de.read skillpilot.openai.de.write\", "
                        + "error=\"invalid_token\", "
                        + "error_description=\"The access token is missing, expired, revoked, or invalid.\"");
        assertThat(resolver.insufficientScopeChallenge())
                .isEqualTo("Bearer resource_metadata=\"https://skillpilot.test/api/openai/de/oauth/protected-resource\", "
                        + "scope=\"skillpilot.openai.de.read skillpilot.openai.de.write\", "
                        + "error=\"insufficient_scope\", "
                        + "error_description=\"The access token does not grant the required SkillPilot write scope.\"");
    }

    private OpenAiDeProperties properties() {
        OpenAiDeProperties properties = new OpenAiDeProperties();
        properties.getOauth().setProtectedResourceMetadata(
                "https://skillpilot.test/api/openai/de/oauth/protected-resource");
        return properties;
    }

    private void authenticate(String subject, String... scopes) {
        var authorities = java.util.Arrays.stream(scopes)
                .map(scope -> new SimpleGrantedAuthority("SCOPE_" + scope))
                .toList();
        SecurityContextHolder.getContext().setAuthentication(
                UsernamePasswordAuthenticationToken.authenticated(subject, null, List.copyOf(authorities)));
    }
}
