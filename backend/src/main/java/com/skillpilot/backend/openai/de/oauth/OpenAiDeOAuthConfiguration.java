package com.skillpilot.backend.openai.de.oauth;

import com.skillpilot.backend.oauth.ProviderScopedOAuth2AuthorizationService;
import com.skillpilot.backend.oauth.ProviderScopedRegisteredClientRepository;
import com.skillpilot.backend.openai.de.OpenAiDeProperties;
import com.skillpilot.backend.openai.de.observability.OpenAiDeOperationalTelemetry;
import com.skillpilot.backend.service.OpenAiDeCoachConnectionService;
import java.net.URI;
import java.time.Duration;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcOperations;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.server.authorization.JdbcOAuth2AuthorizationConsentService;
import org.springframework.security.oauth2.server.authorization.JdbcOAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationConsentService;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.client.JdbcRegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.settings.AuthorizationServerSettings;
import org.springframework.security.oauth2.server.authorization.settings.ClientSettings;
import org.springframework.security.oauth2.server.authorization.settings.OAuth2TokenFormat;
import org.springframework.security.oauth2.server.authorization.settings.TokenSettings;
import org.springframework.security.oauth2.server.authorization.token.DelegatingOAuth2TokenGenerator;
import org.springframework.security.oauth2.server.authorization.token.OAuth2AccessTokenGenerator;
import org.springframework.security.oauth2.server.authorization.token.OAuth2TokenGenerator;
import org.springframework.security.oauth2.server.resource.introspection.OpaqueTokenIntrospector;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.util.matcher.MediaTypeRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;

@Configuration(proxyBeanMethods = false)
@ConditionalOnProperty(
        name = {"skillpilot.openai.de.enabled", "skillpilot.openai.de.oauth.enabled"},
        havingValue = "true")
public class OpenAiDeOAuthConfiguration {

    public static final String READ_SCOPE = "skillpilot.openai.de.read";
    public static final String WRITE_SCOPE = "skillpilot.openai.de.write";
    public static final String OFFLINE_SCOPE = "offline_access";

    public static final String AUTHORIZATION_ENDPOINT = "/api/openai/de/oauth2/authorize";
    public static final String TOKEN_ENDPOINT = "/api/openai/de/oauth2/token";
    public static final String REVOCATION_ENDPOINT = "/api/openai/de/oauth2/revoke";
    public static final String INTROSPECTION_ENDPOINT = "/api/openai/de/oauth2/introspect";
    public static final String CONSENT_ENDPOINT = "/api/openai/de/oauth/consent";
    public static final String CONNECT_REQUIRED_ENDPOINT = "/api/openai/de/oauth/connect-required";
    public static final String ISSUER_PATH = "/api/openai/de";

    @Bean
    RegisteredClientRepository openAiDeRegisteredClientRepository(
            JdbcOperations jdbcOperations,
            OpenAiDeProperties properties) {
        return new ProviderScopedRegisteredClientRepository(
                new JdbcRegisteredClientRepository(jdbcOperations),
                properties.getOauth().getClientId());
    }

    @Bean
    OAuth2AuthorizationService openAiDeAuthorizationService(
            JdbcOperations jdbcOperations,
            @Qualifier("openAiDeRegisteredClientRepository") RegisteredClientRepository registeredClients,
            OpenAiDeCoachConnectionService connectionService) {
        return new OpenAiDeConnectionAwareAuthorizationService(
                new ProviderScopedOAuth2AuthorizationService(
                        new JdbcOAuth2AuthorizationService(
                                jdbcOperations,
                                new JdbcRegisteredClientRepository(jdbcOperations)),
                        registeredClients),
                connectionService);
    }

    @Bean
    OAuth2AuthorizationConsentService openAiDeAuthorizationConsentService(
            JdbcOperations jdbcOperations,
            @Qualifier("openAiDeRegisteredClientRepository") RegisteredClientRepository registeredClients) {
        return new JdbcOAuth2AuthorizationConsentService(jdbcOperations, registeredClients);
    }

    @Bean
    AuthorizationServerSettings openAiDeAuthorizationServerSettings(
            @Value("${skillpilot.public-base-url:https://skillpilot.com}") String publicBaseUrl) {
        requireHttpsOrigin(publicBaseUrl, "OpenAI-DE public base URL");
        return AuthorizationServerSettings.builder()
                .issuer(stripTrailingSlash(publicBaseUrl) + ISSUER_PATH)
                .authorizationEndpoint(AUTHORIZATION_ENDPOINT)
                .tokenEndpoint(TOKEN_ENDPOINT)
                .tokenRevocationEndpoint(REVOCATION_ENDPOINT)
                .tokenIntrospectionEndpoint(INTROSPECTION_ENDPOINT)
                .build();
    }

    @Bean
    InitializingBean registerOpenAiDeClient(
            @Qualifier("openAiDeRegisteredClientRepository") RegisteredClientRepository registeredClients,
            OpenAiDeProperties properties) {
        return () -> {
            validateSettings(properties);
            String clientId = properties.getOauth().getClientId().trim();
            RegisteredClient existing = registeredClients.findByClientId(clientId);
            RegisteredClient.Builder clientBuilder = existing == null
                    ? RegisteredClient.withId(UUID.randomUUID().toString())
                    : RegisteredClient.from(existing);
            Duration accessTtl = properties.getOauth().getAccessTokenTtl();
            Duration refreshTtl = properties.getOauth().getRefreshTokenTtl();
            RegisteredClient client = clientBuilder
                    .clientId(clientId)
                    .clientName("ChatGPT / SkillPilot Coach Deutsch")
                    .clientAuthenticationMethods(methods -> {
                        methods.clear();
                        methods.add(ClientAuthenticationMethod.NONE);
                    })
                    .authorizationGrantTypes(grants -> {
                        grants.clear();
                        grants.add(AuthorizationGrantType.AUTHORIZATION_CODE);
                        grants.add(AuthorizationGrantType.REFRESH_TOKEN);
                    })
                    .redirectUris(redirectUris -> {
                        redirectUris.clear();
                        properties.getOauth().getRedirectUris().stream()
                                .map(String::trim)
                                .forEach(redirectUris::add);
                    })
                    .scopes(scopes -> {
                        scopes.clear();
                        scopes.add(READ_SCOPE);
                        scopes.add(WRITE_SCOPE);
                        scopes.add(OFFLINE_SCOPE);
                    })
                    .clientSettings(ClientSettings.builder()
                            .requireProofKey(true)
                            .requireAuthorizationConsent(true)
                            .build())
                    .tokenSettings(TokenSettings.builder()
                            .accessTokenFormat(OAuth2TokenFormat.REFERENCE)
                            .accessTokenTimeToLive(accessTtl)
                            .refreshTokenTimeToLive(refreshTtl)
                            .reuseRefreshTokens(false)
                            .build())
                    .build();
            registeredClients.save(client);
        };
    }

    @Bean
    SecurityContextRepository openAiDeSecurityContextRepository() {
        HttpSessionSecurityContextRepository repository = new HttpSessionSecurityContextRepository();
        repository.setSpringSecurityContextKey("SKILLPILOT_OPENAI_DE_SECURITY_CONTEXT");
        return repository;
    }

    @Bean
    OpenAiDeBindingAuthenticationFilter openAiDeBindingAuthenticationFilter(
            OpenAiDeCoachConnectionService connectionService,
            @Qualifier("openAiDeSecurityContextRepository") SecurityContextRepository contextRepository,
            OpenAiDeOperationalTelemetry telemetry,
            OpenAiDeProperties properties) {
        return new OpenAiDeBindingAuthenticationFilter(
                connectionService,
                contextRepository,
                telemetry,
                properties.isSecureCookie());
    }

    @Bean
    OpenAiDeOAuthResourceValidationFilter openAiDeOAuthResourceValidationFilter(OpenAiDeProperties properties) {
        return new OpenAiDeOAuthResourceValidationFilter(properties.getMcpUrl());
    }

    @Bean
    OpaqueTokenIntrospector openAiDeOpaqueTokenIntrospector(
            @Qualifier("openAiDeAuthorizationService") OAuth2AuthorizationService authorizationService,
            @Qualifier("openAiDeRegisteredClientRepository") RegisteredClientRepository registeredClients,
            OpenAiDeCoachConnectionService connectionService,
            OpenAiDeOperationalTelemetry telemetry,
            OpenAiDeProperties properties) {
        return new OpenAiDeOpaqueTokenIntrospector(
                authorizationService,
                registeredClients,
                connectionService,
                telemetry,
                properties.getOauth().getClientId().trim(),
                properties.getMcpUrl());
    }

    @Bean
    OAuth2TokenGenerator<?> openAiDeOAuth2TokenGenerator() {
        return new DelegatingOAuth2TokenGenerator(
                new OAuth2AccessTokenGenerator(),
                new OpenAiDePublicRefreshTokenGenerator());
    }

    @Bean
    @Order(3)
    SecurityFilterChain openAiDeAuthorizationServerSecurityFilterChain(
            HttpSecurity http,
            @Qualifier("openAiDeRegisteredClientRepository") RegisteredClientRepository registeredClients,
            @Qualifier("openAiDeAuthorizationService") OAuth2AuthorizationService authorizationService,
            @Qualifier("openAiDeAuthorizationConsentService") OAuth2AuthorizationConsentService consentService,
            @Qualifier("openAiDeAuthorizationServerSettings") AuthorizationServerSettings authorizationServerSettings,
            OpenAiDeBindingAuthenticationFilter bindingFilter,
            OpenAiDeOAuthResourceValidationFilter resourceValidationFilter,
            @Qualifier("openAiDeSecurityContextRepository") SecurityContextRepository contextRepository,
            @Qualifier("openAiDeOAuth2TokenGenerator") OAuth2TokenGenerator<?> tokenGenerator) throws Exception {
        org.springframework.security.config.annotation.web.configurers.oauth2.server.authorization.OAuth2AuthorizationServerConfigurer server =
                new org.springframework.security.config.annotation.web.configurers.oauth2.server.authorization.OAuth2AuthorizationServerConfigurer();
        RequestMatcher endpointsMatcher = server.getEndpointsMatcher();

        http.securityMatcher(request -> endpointsMatcher.matches(request)
                        && !OpenAiDeOAuthMetadataController.AUTHORIZATION_SERVER_WELL_KNOWN_PATH
                                .equals(request.getRequestURI())
                        && !OpenAiDeOAuthMetadataController.AUTHORIZATION_SERVER_COMPATIBILITY_PATH
                                .equals(request.getRequestURI()))
                .with(server, configurer -> configurer
                        .registeredClientRepository(registeredClients)
                        .authorizationService(authorizationService)
                        .authorizationConsentService(consentService)
                        .authorizationServerSettings(authorizationServerSettings)
                        .tokenGenerator(tokenGenerator)
                        .clientAuthentication(clientAuthentication -> clientAuthentication
                                .authenticationConverters(converters -> {
                                    converters.add(0, new OpenAiDePublicRefreshClientAuthenticationConverter());
                                    converters.add(0, new OpenAiDePublicRevocationClientAuthenticationConverter());
                                })
                                .authenticationProviders(providers -> {
                                    providers.add(0, new OpenAiDePublicRefreshClientAuthenticationProvider(
                                            registeredClients));
                                    providers.add(0, new OpenAiDePublicRevocationClientAuthenticationProvider(
                                            registeredClients));
                                }))
                        .authorizationEndpoint(endpoint -> endpoint.consentPage(CONSENT_ENDPOINT)))
                .authorizeHttpRequests(authorize -> authorize.anyRequest().authenticated())
                .securityContext(context -> context.securityContextRepository(contextRepository))
                .csrf(csrf -> csrf.ignoringRequestMatchers(endpointsMatcher))
                .exceptionHandling(exceptions -> exceptions
                        .defaultAuthenticationEntryPointFor(
                                new LoginUrlAuthenticationEntryPoint(CONNECT_REQUIRED_ENDPOINT),
                                new MediaTypeRequestMatcher(MediaType.TEXT_HTML))
                        .defaultAuthenticationEntryPointFor(
                                new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED),
                                request -> true))
                .addFilterAfter(
                        bindingFilter,
                        org.springframework.security.web.context.SecurityContextHolderFilter.class)
                .addFilterBefore(resourceValidationFilter, OpenAiDeBindingAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    @Order(4)
    SecurityFilterChain openAiDeMcpSecurityFilterChain(
            HttpSecurity http,
            @Qualifier("openAiDeOpaqueTokenIntrospector") OpaqueTokenIntrospector introspector,
            OpenAiDeProperties properties) throws Exception {
        http.securityMatcher("/api/openai/de/mcp", "/api/openai/de/mcp/**")
                .authorizeHttpRequests(authorize -> authorize
                        .anyRequest().hasAuthority("SCOPE_" + READ_SCOPE))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .csrf(csrf -> csrf.disable())
                .oauth2ResourceServer(resourceServer -> resourceServer
                        .opaqueToken(opaque -> opaque.introspector(introspector))
                        .authenticationEntryPoint((request, response, exception) -> {
                            response.setStatus(HttpStatus.UNAUTHORIZED.value());
                            response.setHeader(
                                    HttpHeaders.WWW_AUTHENTICATE,
                                    authenticationChallengeFor(request.getHeader(HttpHeaders.AUTHORIZATION), properties));
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            response.getWriter().write("{\"error\":\"authentication_required\"}");
                        }));
        return http.build();
    }

    public static String discoveryAuthenticationChallenge(OpenAiDeProperties properties) {
        return "Bearer resource_metadata=\""
                + stripTrailingSlash(properties.getOauth().getProtectedResourceMetadata())
                + "\", scope=\"" + READ_SCOPE + " " + WRITE_SCOPE + "\"";
    }

    public static String authenticationChallenge(OpenAiDeProperties properties) {
        return bearerChallenge(
                properties,
                "invalid_token",
                "The access token is missing, expired, revoked, or invalid.");
    }

    public static String insufficientScopeChallenge(OpenAiDeProperties properties) {
        return bearerChallenge(
                properties,
                "insufficient_scope",
                "The access token does not grant the required SkillPilot write scope.");
    }

    private static String bearerChallenge(
            OpenAiDeProperties properties,
            String error,
            String errorDescription) {
        return "Bearer resource_metadata=\""
                + stripTrailingSlash(properties.getOauth().getProtectedResourceMetadata())
                + "\", scope=\"" + READ_SCOPE + " " + WRITE_SCOPE + "\""
                + ", error=\"" + error + "\""
                + ", error_description=\"" + errorDescription + "\"";
    }

    static String authenticationChallengeFor(
            String authorizationHeader,
            OpenAiDeProperties properties) {
        return hasText(authorizationHeader)
                ? authenticationChallenge(properties)
                : discoveryAuthenticationChallenge(properties);
    }

    private static void validateSettings(OpenAiDeProperties properties) {
        if (!hasText(properties.getOauth().getClientId())) {
            throw new IllegalStateException(
                    "skillpilot.openai.de.oauth.client-id must be set to the public client ID entered in ChatGPT app management.");
        }
        Set<String> redirectUris = new LinkedHashSet<>();
        for (String value : properties.getOauth().getRedirectUris()) {
            if (hasText(value)) {
                redirectUris.add(value.trim());
            }
        }
        if (redirectUris.isEmpty()) {
            throw new IllegalStateException(
                    "skillpilot.openai.de.oauth.redirect-uris must contain the callback shown in ChatGPT app management.");
        }
        redirectUris.forEach(value -> requireHttpsUri(value, "OpenAI-DE OAuth redirect URI"));
        requireHttpsUri(properties.getMcpUrl(), "OpenAI-DE MCP resource");
        requireHttpsUri(
                properties.getOauth().getProtectedResourceMetadata(),
                "OpenAI-DE protected-resource metadata URL");
        if (properties.getOauth().getAccessTokenTtl() == null
                || properties.getOauth().getAccessTokenTtl().isZero()
                || properties.getOauth().getAccessTokenTtl().isNegative()) {
            throw new IllegalStateException("OpenAI-DE access-token TTL must be positive.");
        }
        if (properties.getOauth().getRefreshTokenTtl() == null
                || properties.getOauth().getRefreshTokenTtl().isZero()
                || properties.getOauth().getRefreshTokenTtl().isNegative()) {
            throw new IllegalStateException("OpenAI-DE refresh-token TTL must be positive.");
        }
    }

    static void requireHttpsUri(String value, String label) {
        if (!hasText(value)) {
            throw new IllegalStateException(label + " must be configured.");
        }
        if (!value.equals(value.trim())) {
            throw new IllegalStateException(label + " must not contain leading or trailing whitespace.");
        }
        URI uri;
        try {
            uri = URI.create(value);
        } catch (IllegalArgumentException exception) {
            throw new IllegalStateException(label + " must be a valid HTTPS URL.", exception);
        }
        if (!"https".equalsIgnoreCase(uri.getScheme())
                || !hasText(uri.getHost())
                || uri.getUserInfo() != null
                || uri.getQuery() != null
                || uri.getFragment() != null) {
            throw new IllegalStateException(
                    label + " must be an absolute HTTPS URL without user-info, query, or fragment.");
        }
    }

    static void requireHttpsOrigin(String value, String label) {
        requireHttpsUri(value, label);
        URI uri = URI.create(value);
        String path = uri.getRawPath();
        if (path != null && !path.isEmpty() && !"/".equals(path)) {
            throw new IllegalStateException(label + " must not contain a path.");
        }
    }

    private static boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    static String stripTrailingSlash(String value) {
        String normalized = value == null ? "" : value.trim();
        while (normalized.endsWith("/")) {
            normalized = normalized.substring(0, normalized.length() - 1);
        }
        return normalized;
    }
}
