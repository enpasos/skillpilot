package com.skillpilot.backend.claude.oauth;

import com.skillpilot.backend.oauth.ProviderScopedOAuth2AuthorizationService;
import com.skillpilot.backend.oauth.ProviderScopedRegisteredClientRepository;
import com.skillpilot.backend.service.ClaudeCoachConnectionService;
import java.time.Duration;
import java.util.List;
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
import org.springframework.security.config.Customizer;
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
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.util.matcher.MediaTypeRequestMatcher;

@Configuration(proxyBeanMethods = false)
@ConditionalOnProperty(name = "skillpilot.claude.enabled", havingValue = "true")
public class ClaudeOAuthConfiguration {

    public static final String READ_SCOPE = "skillpilot.read";
    public static final String WRITE_SCOPE = "skillpilot.write";
    public static final String OFFLINE_SCOPE = "offline_access";
    /**
     * Client ID Metadata Document used by Claude.ai, Claude Desktop, Cowork and
     * the Claude mobile apps. The URL itself is the OAuth public-client ID.
     */
    public static final String CLAUDE_HOSTED_CLIENT_ID =
            "https://claude.ai/oauth/mcp-oauth-client-metadata";
    public static final String CLAUDE_CALLBACK = "https://claude.ai/api/mcp/auth_callback";
    public static final String CLAUDE_DOT_COM_CALLBACK = "https://claude.com/api/mcp/auth_callback";

    @Bean
    RegisteredClientRepository claudeRegisteredClientRepository(
            JdbcOperations jdbcOperations,
            @Value("${skillpilot.claude.oauth.client-id:https://claude.ai/oauth/mcp-oauth-client-metadata}")
                    String clientId) {
        return new ProviderScopedRegisteredClientRepository(
                new JdbcRegisteredClientRepository(jdbcOperations),
                clientId);
    }

    @Bean
    OAuth2AuthorizationService claudeAuthorizationService(
            JdbcOperations jdbcOperations,
            @Qualifier("claudeRegisteredClientRepository") RegisteredClientRepository registeredClientRepository,
            ClaudeCoachConnectionService connectionService) {
        return new ClaudeConnectionAwareAuthorizationService(
                new ProviderScopedOAuth2AuthorizationService(
                        new JdbcOAuth2AuthorizationService(
                                jdbcOperations,
                                new JdbcRegisteredClientRepository(jdbcOperations)),
                        registeredClientRepository),
                connectionService);
    }

    @Bean
    OAuth2AuthorizationConsentService claudeAuthorizationConsentService(
            JdbcOperations jdbcOperations,
            @Qualifier("claudeRegisteredClientRepository") RegisteredClientRepository registeredClientRepository) {
        return new JdbcOAuth2AuthorizationConsentService(jdbcOperations, registeredClientRepository);
    }

    @Bean
    AuthorizationServerSettings claudeAuthorizationServerSettings(
            @Value("${skillpilot.public-base-url:https://skillpilot.com}") String publicBaseUrl) {
        return AuthorizationServerSettings.builder()
                .issuer(stripTrailingSlash(publicBaseUrl))
                .authorizationEndpoint("/oauth2/authorize")
                .tokenEndpoint("/oauth2/token")
                .tokenRevocationEndpoint("/oauth2/revoke")
                .tokenIntrospectionEndpoint("/oauth2/introspect")
                .build();
    }

    @Bean
    InitializingBean registerClaudeCimdClient(
            @Qualifier("claudeRegisteredClientRepository") RegisteredClientRepository registeredClientRepository,
            @Value("${skillpilot.claude.oauth.client-id:https://claude.ai/oauth/mcp-oauth-client-metadata}") String clientId,
            @Value("${skillpilot.claude.oauth.access-token-ttl:PT1H}") Duration accessTokenTtl,
            @Value("${skillpilot.claude.oauth.refresh-token-ttl:P30D}") Duration refreshTokenTtl) {
        return () -> {
            RegisteredClient existing = registeredClientRepository.findByClientId(clientId);
            RegisteredClient.Builder clientBuilder = existing == null
                    ? RegisteredClient.withId(UUID.randomUUID().toString())
                    : RegisteredClient.from(existing);
            RegisteredClient client = clientBuilder
                    .clientId(clientId)
                    .clientName("Claude for SkillPilot")
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
                        redirectUris.add(CLAUDE_CALLBACK);
                        redirectUris.add(CLAUDE_DOT_COM_CALLBACK);
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
                            .accessTokenTimeToLive(accessTokenTtl)
                            .refreshTokenTimeToLive(refreshTokenTtl)
                            .reuseRefreshTokens(false)
                            .build())
                    .build();
            registeredClientRepository.save(client);
        };
    }

    @Bean
    SecurityContextRepository claudeSecurityContextRepository() {
        HttpSessionSecurityContextRepository repository = new HttpSessionSecurityContextRepository();
        repository.setSpringSecurityContextKey("SKILLPILOT_CLAUDE_SECURITY_CONTEXT");
        return repository;
    }

    @Bean
    ClaudeBindingAuthenticationFilter claudeBindingAuthenticationFilter(
            ClaudeCoachConnectionService connectionService,
            @Qualifier("claudeSecurityContextRepository") SecurityContextRepository claudeSecurityContextRepository,
            @Value("${skillpilot.claude.secure-cookie:true}") boolean secureCookie) {
        return new ClaudeBindingAuthenticationFilter(
                connectionService,
                claudeSecurityContextRepository,
                secureCookie);
    }

    @Bean
    ClaudeOAuthResourceValidationFilter claudeOAuthResourceValidationFilter(
            @Value("${skillpilot.claude.mcp-url:https://skillpilot.com/api/claude/mcp}") String mcpUrl) {
        return new ClaudeOAuthResourceValidationFilter(mcpUrl);
    }

    @Bean
    OpaqueTokenIntrospector claudeOpaqueTokenIntrospector(
            @Qualifier("claudeAuthorizationService") OAuth2AuthorizationService authorizationService,
            @Qualifier("claudeRegisteredClientRepository") RegisteredClientRepository registeredClientRepository,
            ClaudeCoachConnectionService connectionService,
            @Value("${skillpilot.claude.oauth.client-id:https://claude.ai/oauth/mcp-oauth-client-metadata}") String clientId,
            @Value("${skillpilot.claude.mcp-url:https://skillpilot.com/api/claude/mcp}") String mcpUrl) {
        return new SkillPilotOpaqueTokenIntrospector(
                authorizationService,
                registeredClientRepository,
                connectionService,
                clientId,
                mcpUrl);
    }

    @Bean
    OAuth2TokenGenerator<?> claudeOAuth2TokenGenerator() {
        return new DelegatingOAuth2TokenGenerator(
                new OAuth2AccessTokenGenerator(),
                new ClaudePublicRefreshTokenGenerator());
    }

    @Bean
    @Order(1)
    SecurityFilterChain claudeAuthorizationServerSecurityFilterChain(
            HttpSecurity http,
            @Qualifier("claudeRegisteredClientRepository") RegisteredClientRepository registeredClientRepository,
            @Qualifier("claudeAuthorizationService") OAuth2AuthorizationService authorizationService,
            @Qualifier("claudeAuthorizationConsentService") OAuth2AuthorizationConsentService consentService,
            @Qualifier("claudeAuthorizationServerSettings") AuthorizationServerSettings authorizationServerSettings,
            ClaudeBindingAuthenticationFilter bindingFilter,
            ClaudeOAuthResourceValidationFilter resourceValidationFilter,
            @Qualifier("claudeSecurityContextRepository") SecurityContextRepository claudeSecurityContextRepository,
            @Qualifier("claudeOAuth2TokenGenerator") OAuth2TokenGenerator<?> tokenGenerator) throws Exception {
        org.springframework.security.config.annotation.web.configurers.oauth2.server.authorization.OAuth2AuthorizationServerConfigurer authorizationServer =
                new org.springframework.security.config.annotation.web.configurers.oauth2.server.authorization.OAuth2AuthorizationServerConfigurer();

        org.springframework.security.web.util.matcher.RequestMatcher endpointsMatcher =
                authorizationServer.getEndpointsMatcher();
        http.securityMatcher(request -> endpointsMatcher.matches(request)
                        && !"/.well-known/oauth-authorization-server/api/openai/de"
                                .equals(request.getRequestURI()))
                .with(authorizationServer, server -> server
                        .registeredClientRepository(registeredClientRepository)
                        .authorizationService(authorizationService)
                        .authorizationConsentService(consentService)
                        .authorizationServerSettings(authorizationServerSettings)
                        .tokenGenerator(tokenGenerator)
                        .clientAuthentication(clientAuthentication -> clientAuthentication
                                .authenticationConverters(converters -> {
                                    converters.add(0, new ClaudePublicRefreshClientAuthenticationConverter());
                                    converters.add(0, new ClaudePublicRevocationClientAuthenticationConverter());
                                })
                                .authenticationProviders(providers -> {
                                    providers.add(0, new ClaudePublicRefreshClientAuthenticationProvider(
                                            registeredClientRepository));
                                    providers.add(0, new ClaudePublicRevocationClientAuthenticationProvider(
                                            registeredClientRepository));
                                }))
                        .authorizationEndpoint(endpoint -> endpoint
                                .consentPage("/api/claude/oauth/consent"))
                        .authorizationServerMetadataEndpoint(endpoint -> endpoint
                                .authorizationServerMetadataCustomizer(metadata -> metadata
                                        .claim("client_id_metadata_document_supported", true)
                                        // Claude selects CIMD only when the
                                        // authorization server advertises a
                                        // public token client explicitly.
                                        .claim("token_endpoint_auth_methods_supported", List.of("none"))
                                        .claim("code_challenge_methods_supported", List.of("S256")))))
                .authorizeHttpRequests(authorize -> authorize.anyRequest().authenticated())
                .securityContext(context -> context
                        .securityContextRepository(claudeSecurityContextRepository))
                .csrf(csrf -> csrf.ignoringRequestMatchers(endpointsMatcher))
                .exceptionHandling(exceptions -> exceptions
                        .defaultAuthenticationEntryPointFor(
                                new LoginUrlAuthenticationEntryPoint("/api/claude/oauth/connect-required"),
                                new MediaTypeRequestMatcher(MediaType.TEXT_HTML))
                        .defaultAuthenticationEntryPointFor(
                                new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED),
                                request -> true))
                // The authorization-server configurer registers its endpoint
                // filters while the chain is built, so anchor the binding
                // filter immediately after the standard context loader. This
                // guarantees that the opaque browser binding becomes the
                // principal before any OAuth endpoint processes the request.
                .addFilterAfter(
                        bindingFilter,
                        org.springframework.security.web.context.SecurityContextHolderFilter.class)
                .addFilterBefore(resourceValidationFilter, ClaudeBindingAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    @Order(2)
    SecurityFilterChain claudeMcpSecurityFilterChain(
            HttpSecurity http,
            @Qualifier("claudeOpaqueTokenIntrospector") OpaqueTokenIntrospector introspector,
            @Value("${skillpilot.claude.oauth.protected-resource-metadata:https://skillpilot.com/api/claude/oauth/protected-resource}") String resourceMetadataUrl) throws Exception {
        http.securityMatcher("/api/claude/mcp", "/api/claude/mcp/**")
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
                                    "Bearer resource_metadata=\"" + resourceMetadataUrl
                                            + "\", scope=\"" + READ_SCOPE + " " + WRITE_SCOPE + "\"");
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            response.getWriter().write("{\"error\":\"authentication_required\"}");
                        }));
        return http.build();
    }

    private static String stripTrailingSlash(String value) {
        String normalized = value == null ? "" : value.trim();
        while (normalized.endsWith("/")) {
            normalized = normalized.substring(0, normalized.length() - 1);
        }
        return normalized;
    }
}
