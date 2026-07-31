package com.skillpilot.backend.openai.de.oauth;

import com.skillpilot.backend.oauth.ProviderScopedOAuth2AuthorizationService;
import com.skillpilot.backend.oauth.ProviderScopedRegisteredClientRepository;
import com.skillpilot.backend.openai.de.OpenAiDeProperties;
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1PublicContractValidation;
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1ContractMetadata;
import com.skillpilot.backend.openai.de.OpenAiDeSecureModeValidation;
import com.skillpilot.backend.openai.de.observability.OpenAiDeOperationalTelemetry;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.time.Duration;
import java.util.List;
import java.util.LinkedHashSet;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.ObjectProvider;
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
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.server.authorization.authentication.JwtClientAssertionAuthenticationProvider;
import org.springframework.security.oauth2.server.authorization.authentication.JwtClientAssertionDecoderFactory;
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
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

@Configuration(proxyBeanMethods = false)
@ConditionalOnProperty(
        name = {"skillpilot.openai.de.enabled", "skillpilot.openai.de.oauth.enabled"},
        havingValue = "true")
public class OpenAiDeOAuthConfiguration {

    public static final String READ_SCOPE = "skillpilot.openai.de.read";
    public static final String WRITE_SCOPE = "skillpilot.openai.de.write";
    public static final String OFFLINE_SCOPE = "offline_access";
    public static final String CLIENT_AUTH_NONE = "none";
    public static final String CLIENT_AUTH_CLIENT_SECRET_BASIC = "client_secret_basic";
    public static final String CLIENT_AUTH_PRIVATE_KEY_JWT = "private_key_jwt";
    private static final PasswordEncoder CLIENT_SECRET_PASSWORD_ENCODER =
            PasswordEncoderFactories.createDelegatingPasswordEncoder();

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
            @Qualifier("openAiDeRegisteredClientRepository") RegisteredClientRepository registeredClients) {
        return new ProviderScopedOAuth2AuthorizationService(
                new JdbcOAuth2AuthorizationService(
                        jdbcOperations,
                        new JdbcRegisteredClientRepository(jdbcOperations)),
                registeredClients);
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
    OpenAiDeOAuthLegacyClientCutover openAiDeOAuthLegacyClientCutover(
            JdbcOperations jdbcOperations,
            PlatformTransactionManager transactionManager) {
        return new OpenAiDeOAuthLegacyClientCutover(
                jdbcOperations,
                new TransactionTemplate(transactionManager));
    }

    @Bean
    OpenAiDeCimdMetadataValidator openAiDeCimdMetadataValidator(ObjectMapper objectMapper) {
        return OpenAiDeCimdMetadataValidator.production(objectMapper);
    }

    @Bean
    InitializingBean openAiDeClientRegistrationInitializer(
            @Qualifier("openAiDeRegisteredClientRepository") RegisteredClientRepository registeredClients,
            OpenAiDeProperties properties,
            OpenAiDeOAuthLegacyClientCutover legacyClientCutover,
            OpenAiDeCimdMetadataValidator cimdMetadataValidator) {
        return () -> {
            validateSettings(properties);
            if (isPrivateKeyJwt(properties)) {
                cimdMetadataValidator.validate(properties);
            }
            legacyClientCutover.execute(properties);
            registerConfiguredClient(registeredClients, properties);
            assertSecureClientRegistration(registeredClients, properties);
        };
    }

    InitializingBean registerOpenAiDeClient(
            RegisteredClientRepository registeredClients,
            OpenAiDeProperties properties) {
        return () -> {
            validateSettings(properties);
            registerConfiguredClient(registeredClients, properties);
            assertSecureClientRegistration(registeredClients, properties);
        };
    }

    private static void registerConfiguredClient(
            RegisteredClientRepository registeredClients,
            OpenAiDeProperties properties) {
        String clientId = properties.getOauth().getClientId().trim();
        RegisteredClient existing = registeredClients.findByClientId(clientId);
        RegisteredClient.Builder clientBuilder = existing == null
                ? RegisteredClient.withId(UUID.randomUUID().toString())
                : RegisteredClient.from(existing);
        Duration accessTtl = properties.getOauth().getAccessTokenTtl();
        Duration refreshTtl = properties.getOauth().getRefreshTokenTtl();
        boolean privateKeyJwt = isPrivateKeyJwt(properties);
        boolean clientSecretBasic = isClientSecretBasic(properties);
        ClientAuthenticationMethod clientAuthenticationMethod =
                clientAuthenticationMethod(properties);
        ClientSettings.Builder clientSettings = ClientSettings.builder()
                .requireProofKey(true)
                .requireAuthorizationConsent(true);
        if (privateKeyJwt) {
            clientSettings
                    .jwkSetUrl(properties.getOauth().getClientJwkSetUri().trim())
                    .tokenEndpointAuthenticationSigningAlgorithm(
                            clientAssertionSigningAlgorithm(properties));
        }
        RegisteredClient client = clientBuilder
                .clientId(clientId)
                .clientSecret(clientSecretBasic
                        ? encodedClientSecret(existing, properties.getOauth().getClientSecret())
                        : null)
                .clientName("ChatGPT / SkillPilot Coach DE v1")
                .clientAuthenticationMethods(methods -> {
                    methods.clear();
                    methods.add(clientAuthenticationMethod);
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
                .clientSettings(clientSettings.build())
                .tokenSettings(TokenSettings.builder()
                        .accessTokenFormat(OAuth2TokenFormat.REFERENCE)
                        .accessTokenTimeToLive(accessTtl)
                        .refreshTokenTimeToLive(refreshTtl)
                        .reuseRefreshTokens(false)
                        .build())
                .build();
        registeredClients.save(client);
    }

    private static void assertSecureClientRegistration(
            RegisteredClientRepository registeredClients,
            OpenAiDeProperties properties) {
        boolean privateKeyJwt = isPrivateKeyJwt(properties);
        Set<ClientAuthenticationMethod> expectedAuthenticationMethods =
                Set.of(clientAuthenticationMethod(properties));
        Set<String> expectedRedirectUris = properties.getOauth().getRedirectUris().stream()
                .map(String::trim)
                .collect(java.util.stream.Collectors.toUnmodifiableSet());
        Set<AuthorizationGrantType> expectedGrantTypes = Set.of(
                AuthorizationGrantType.AUTHORIZATION_CODE,
                AuthorizationGrantType.REFRESH_TOKEN);
        Set<String> expectedScopes = Set.of(READ_SCOPE, WRITE_SCOPE, OFFLINE_SCOPE);
        String expectedJwkSetUrl =
                privateKeyJwt ? properties.getOauth().getClientJwkSetUri().trim() : null;
        SignatureAlgorithm expectedSigningAlgorithm =
                privateKeyJwt ? clientAssertionSigningAlgorithm(properties) : null;
        RegisteredClient persisted =
                registeredClients.findByClientId(properties.getOauth().getClientId().trim());
        if (persisted == null
                || !expectedAuthenticationMethods.equals(persisted.getClientAuthenticationMethods())
                || !clientSecretMatches(persisted, properties)
                || !expectedRedirectUris.equals(persisted.getRedirectUris())
                || !expectedGrantTypes.equals(persisted.getAuthorizationGrantTypes())
                || !expectedScopes.equals(persisted.getScopes())
                || !persisted.getClientSettings().isRequireProofKey()
                || !persisted.getClientSettings().isRequireAuthorizationConsent()
                || !Objects.equals(
                        expectedJwkSetUrl,
                        persisted.getClientSettings().getJwkSetUrl())
                || !Objects.equals(
                        expectedSigningAlgorithm,
                        persisted.getClientSettings()
                                .getTokenEndpointAuthenticationSigningAlgorithm())
                || !OAuth2TokenFormat.REFERENCE.equals(
                        persisted.getTokenSettings().getAccessTokenFormat())
                || !properties.getOauth().getAccessTokenTtl().equals(
                        persisted.getTokenSettings().getAccessTokenTimeToLive())
                || !properties.getOauth().getRefreshTokenTtl().equals(
                        persisted.getTokenSettings().getRefreshTokenTimeToLive())
                || persisted.getTokenSettings().isReuseRefreshTokens()) {
            throw new IllegalStateException(
                    "OpenAI-DE secure startup refused because the configured OAuth client registration does not exactly match the required authentication method, callbacks, PKCE, consent, grants, scopes, key binding, and token policy.");
        }
    }

    @Bean
    SecurityContextRepository openAiDeSecurityContextRepository() {
        HttpSessionSecurityContextRepository repository = new HttpSessionSecurityContextRepository();
        repository.setSpringSecurityContextKey("SKILLPILOT_OPENAI_DE_SECURITY_CONTEXT");
        return repository;
    }

    @Bean
    OpenAiDeBindingAuthenticationFilter openAiDeBindingAuthenticationFilter(
            @Qualifier("openAiDeSecurityContextRepository") SecurityContextRepository contextRepository) {
        return new OpenAiDeBindingAuthenticationFilter(contextRepository);
    }

    @Bean
    OpenAiDeOAuthResourceValidationFilter openAiDeOAuthResourceValidationFilter(OpenAiDeProperties properties) {
        return new OpenAiDeOAuthResourceValidationFilter(properties.getOauthResource());
    }

    @Bean
    OpaqueTokenIntrospector openAiDeOpaqueTokenIntrospector(
            @Qualifier("openAiDeAuthorizationService") OAuth2AuthorizationService authorizationService,
            @Qualifier("openAiDeRegisteredClientRepository") RegisteredClientRepository registeredClients,
            OpenAiDeOperationalTelemetry telemetry,
            OpenAiDeProperties properties) {
        return new OpenAiDeOpaqueTokenIntrospector(
                authorizationService,
                registeredClients,
                telemetry,
                properties.getOauth().getClientId().trim(),
                properties.getOauthResource());
    }

    @Bean
    OAuth2TokenGenerator<?> openAiDeOAuth2TokenGenerator() {
        return new DelegatingOAuth2TokenGenerator(
                new OAuth2AccessTokenGenerator(),
                new OpenAiDePublicRefreshTokenGenerator());
    }

    @Bean
    @ConditionalOnProperty(
            name = "skillpilot.openai.de.oauth.client-authentication-method",
            havingValue = CLIENT_AUTH_PRIVATE_KEY_JWT)
    OpenAiDeJwtClientAssertionValidator openAiDeJwtClientAssertionValidator(
            OpenAiDeProperties properties) {
        return new OpenAiDeJwtClientAssertionValidator(
                properties.getOauth().getClientAssertionReplayCacheSize());
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
            @Qualifier("openAiDeOAuth2TokenGenerator") OAuth2TokenGenerator<?> tokenGenerator,
            ObjectProvider<OpenAiDeJwtClientAssertionValidator> clientAssertionValidatorProvider,
            OpenAiDeProperties properties) throws Exception {
        org.springframework.security.config.annotation.web.configurers.oauth2.server.authorization.OAuth2AuthorizationServerConfigurer server =
                new org.springframework.security.config.annotation.web.configurers.oauth2.server.authorization.OAuth2AuthorizationServerConfigurer();
        RequestMatcher endpointsMatcher = server.getEndpointsMatcher();
        RequestMatcher authorizationEndpointMatcher =
                request -> AUTHORIZATION_ENDPOINT.equals(request.getRequestURI());

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
                        .clientAuthentication(clientAuthentication -> {
                            if (isPrivateKeyJwt(properties)) {
                                OpenAiDeJwtClientAssertionValidator clientAssertionValidator =
                                        clientAssertionValidatorProvider.getIfAvailable();
                                if (clientAssertionValidator == null) {
                                    throw new IllegalStateException(
                                            "OpenAI-DE private_key_jwt requires the client assertion validator.");
                                }
                                JwtClientAssertionDecoderFactory decoderFactory =
                                        new JwtClientAssertionDecoderFactory();
                                decoderFactory.setJwtValidatorFactory(registeredClient -> jwt -> {
                                    var defaultResult = JwtClientAssertionDecoderFactory
                                            .DEFAULT_JWT_VALIDATOR_FACTORY
                                            .apply(registeredClient)
                                            .validate(jwt);
                                    return defaultResult.hasErrors()
                                            ? defaultResult
                                            : clientAssertionValidator.validate(jwt);
                                });
                                clientAuthentication.authenticationProviders(providers ->
                                        providers.stream()
                                                .filter(JwtClientAssertionAuthenticationProvider.class::isInstance)
                                                .map(JwtClientAssertionAuthenticationProvider.class::cast)
                                                .forEach(provider ->
                                                        provider.setJwtDecoderFactory(decoderFactory)));
                            } else if (isPublicClient(properties)) {
                                clientAuthentication
                                        .authenticationConverters(converters -> {
                                            converters.add(0, new OpenAiDePublicRefreshClientAuthenticationConverter());
                                            converters.add(0, new OpenAiDePublicRevocationClientAuthenticationConverter());
                                        })
                                        .authenticationProviders(providers -> {
                                            providers.add(0, new OpenAiDePublicRefreshClientAuthenticationProvider(
                                                    registeredClients));
                                            providers.add(0, new OpenAiDePublicRevocationClientAuthenticationProvider(
                                                    registeredClients));
                                        });
                            }
                        })
                        .authorizationEndpoint(endpoint -> endpoint.consentPage(CONSENT_ENDPOINT)))
                .authorizeHttpRequests(authorize -> authorize.anyRequest().authenticated())
                .securityContext(context -> context.securityContextRepository(contextRepository))
                .csrf(csrf -> csrf.ignoringRequestMatchers(endpointsMatcher))
                .exceptionHandling(exceptions -> exceptions
                        .defaultAuthenticationEntryPointFor(
                                new LoginUrlAuthenticationEntryPoint(CONNECT_REQUIRED_ENDPOINT),
                                authorizationEndpointMatcher)
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
        http.securityMatcher(
                        OpenAiDeV1ContractMetadata.INTERNAL_MCP_PATH,
                        OpenAiDeV1ContractMetadata.INTERNAL_MCP_PATH + "/**")
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
                    "skillpilot.openai.de.oauth.client-id must be set to the client ID entered in ChatGPT app management.");
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
        String authenticationMethod = normalizedClientAuthenticationMethod(properties);
        if (!Set.of(
                        CLIENT_AUTH_NONE,
                        CLIENT_AUTH_CLIENT_SECRET_BASIC,
                        CLIENT_AUTH_PRIVATE_KEY_JWT)
                .contains(authenticationMethod)) {
            throw new IllegalStateException(
                    "OpenAI-DE client authentication method must be none, client_secret_basic, or private_key_jwt.");
        }
        if (CLIENT_AUTH_CLIENT_SECRET_BASIC.equals(authenticationMethod)
                && !OpenAiDeSecureModeValidation.isValidClientSecret(
                        properties.getOauth().getClientSecret())) {
            throw new IllegalStateException(
                    "skillpilot.openai.de.oauth.client-secret must contain at least "
                            + OpenAiDeSecureModeValidation.MINIMUM_CLIENT_SECRET_LENGTH
                            + " non-whitespace characters for client_secret_basic.");
        }
        if (CLIENT_AUTH_PRIVATE_KEY_JWT.equals(authenticationMethod)) {
            if (properties.getOauth().getClientAssertionReplayCacheSize() <= 0) {
                throw new IllegalStateException(
                        "OpenAI-DE client-assertion replay cache size must be positive.");
            }
            requireCimdClientId(properties.getOauth().getClientId());
            requireHttpsUri(properties.getOauth().getClientJwkSetUri(), "OpenAI-DE client JWK Set URL");
            requireSameOrigin(
                    properties.getOauth().getClientId(),
                    properties.getOauth().getClientJwkSetUri(),
                    "OpenAI-DE CIMD client ID and client JWK Set URL");
            clientAssertionSigningAlgorithm(properties);
        }
        if (isConfidentialClient(properties)
                && normalizedLegacyClientIds(properties)
                        .contains(properties.getOauth().getClientId().trim())) {
            throw new IllegalStateException(
                    "OpenAI-DE current confidential client ID must not also be listed as a legacy client ID.");
        }
        requireHttpsUri(properties.getMcpUrl(), "OpenAI-DE public MCP endpoint");
        requireHttpsOrigin(properties.getOauthResource(), "OpenAI-DE OAuth resource");
        requireHttpsOrigin(properties.getUiOrigin(), "OpenAI-DE UI origin");
        requireHttpsUri(
                properties.getOauth().getProtectedResourceMetadata(),
                "OpenAI-DE protected-resource metadata URL");
        OpenAiDeV1PublicContractValidation.requireExact(properties);
        if (properties.getServerBuild() == null
                || properties.getServerBuild().isBlank()
                || OpenAiDeV1ContractMetadata.DEFAULT_SERVER_BUILD.equals(
                        properties.getServerBuild().trim())) {
            throw new IllegalStateException(
                    "skillpilot.openai.de.server-build must identify the deployed build and must not be dev.");
        }
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

    static boolean isPrivateKeyJwt(OpenAiDeProperties properties) {
        return CLIENT_AUTH_PRIVATE_KEY_JWT.equals(normalizedClientAuthenticationMethod(properties));
    }

    static boolean isClientSecretBasic(OpenAiDeProperties properties) {
        return CLIENT_AUTH_CLIENT_SECRET_BASIC.equals(
                normalizedClientAuthenticationMethod(properties));
    }

    static boolean isPublicClient(OpenAiDeProperties properties) {
        return CLIENT_AUTH_NONE.equals(normalizedClientAuthenticationMethod(properties));
    }

    static boolean isConfidentialClient(OpenAiDeProperties properties) {
        return isClientSecretBasic(properties) || isPrivateKeyJwt(properties);
    }

    private static ClientAuthenticationMethod clientAuthenticationMethod(
            OpenAiDeProperties properties) {
        return switch (normalizedClientAuthenticationMethod(properties)) {
            case CLIENT_AUTH_CLIENT_SECRET_BASIC -> ClientAuthenticationMethod.CLIENT_SECRET_BASIC;
            case CLIENT_AUTH_PRIVATE_KEY_JWT -> ClientAuthenticationMethod.PRIVATE_KEY_JWT;
            case CLIENT_AUTH_NONE -> ClientAuthenticationMethod.NONE;
            default -> throw new IllegalStateException(
                    "Unsupported OpenAI-DE OAuth client authentication method.");
        };
    }

    private static String encodedClientSecret(
            RegisteredClient existing,
            String configuredClientSecret) {
        if (existing != null
                && hasText(existing.getClientSecret())
                && CLIENT_SECRET_PASSWORD_ENCODER.matches(
                        configuredClientSecret,
                        existing.getClientSecret())) {
            return existing.getClientSecret();
        }
        return CLIENT_SECRET_PASSWORD_ENCODER.encode(configuredClientSecret);
    }

    private static boolean clientSecretMatches(
            RegisteredClient persisted,
            OpenAiDeProperties properties) {
        if (!isClientSecretBasic(properties)) {
            return persisted.getClientSecret() == null;
        }
        return hasText(persisted.getClientSecret())
                && CLIENT_SECRET_PASSWORD_ENCODER.matches(
                        properties.getOauth().getClientSecret(),
                        persisted.getClientSecret());
    }

    static String normalizedClientAuthenticationMethod(OpenAiDeProperties properties) {
        String configured = properties.getOauth().getClientAuthenticationMethod();
        return configured == null ? "" : configured.trim().toLowerCase(Locale.ROOT);
    }

    static List<String> normalizedLegacyClientIds(OpenAiDeProperties properties) {
        LinkedHashSet<String> normalized = new LinkedHashSet<>();
        List<String> configured = properties.getOauth().getLegacyClientIds();
        if (configured == null) {
            return List.of();
        }
        for (String clientId : configured) {
            if (clientId == null || clientId.isBlank()) {
                throw new IllegalStateException(
                        "OpenAI-DE legacy client IDs must not contain blank entries.");
            }
            normalized.add(clientId.trim());
        }
        return List.copyOf(normalized);
    }

    static SignatureAlgorithm clientAssertionSigningAlgorithm(OpenAiDeProperties properties) {
        String configured = properties.getOauth().getClientAssertionSigningAlgorithm();
        SignatureAlgorithm algorithm =
                configured == null ? null : SignatureAlgorithm.from(configured.trim().toUpperCase(Locale.ROOT));
        if (algorithm == null) {
            throw new IllegalStateException(
                    "OpenAI-DE client-assertion signing algorithm must be a supported asymmetric JWS algorithm.");
        }
        return algorithm;
    }

    private static void requireCimdClientId(String value) {
        requireHttpsUri(value, "OpenAI-DE CIMD client ID");
        String path = URI.create(value).getRawPath();
        if (path == null || path.isBlank() || "/".equals(path)) {
            throw new IllegalStateException(
                    "OpenAI-DE CIMD client ID must identify an HTTPS metadata document, not only an origin.");
        }
    }

    private static void requireSameOrigin(String first, String second, String label) {
        if (!OpenAiDeSecureModeValidation.haveSameStrictHttpsOrigin(first, second)) {
            throw new IllegalStateException(label + " must have the same HTTPS origin.");
        }
    }

    static void requireHttpsUri(String value, String label) {
        if (!hasText(value)) {
            throw new IllegalStateException(label + " must be configured.");
        }
        if (!value.equals(value.trim())) {
            throw new IllegalStateException(label + " must not contain leading or trailing whitespace.");
        }
        if (!OpenAiDeSecureModeValidation.isStrictHttpsUri(value)) {
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
