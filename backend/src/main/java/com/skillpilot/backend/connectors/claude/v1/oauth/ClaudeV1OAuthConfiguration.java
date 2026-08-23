package com.skillpilot.backend.connectors.claude.v1.oauth;

import com.skillpilot.backend.config.RawHttpServletRequest;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Contract;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Properties;
import com.skillpilot.backend.connectors.claude.v1.ConditionalOnClaudeV1Enabled;
import jakarta.servlet.http.HttpServletResponse;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcOperations;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.oauth2.server.authorization.OAuth2AuthorizationServerConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.server.authorization.JdbcOAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.authentication.OAuth2AuthorizationCodeRequestAuthenticationProvider;
import org.springframework.security.oauth2.server.authorization.client.JdbcRegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.settings.AuthorizationServerSettings;
import org.springframework.security.oauth2.server.authorization.settings.ClientSettings;
import org.springframework.security.oauth2.server.authorization.settings.OAuth2TokenFormat;
import org.springframework.security.oauth2.server.authorization.settings.TokenSettings;
import org.springframework.security.oauth2.server.authorization.token.DelegatingOAuth2TokenGenerator;
import org.springframework.security.oauth2.server.authorization.token.OAuth2AccessTokenGenerator;
import org.springframework.security.oauth2.server.authorization.token.OAuth2TokenClaimsContext;
import org.springframework.security.oauth2.server.authorization.token.OAuth2TokenCustomizer;
import org.springframework.security.oauth2.server.authorization.token.OAuth2TokenGenerator;
import org.springframework.security.oauth2.server.resource.introspection.OpaqueTokenIntrospector;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.SecurityContextHolderFilter;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.util.matcher.RequestMatcher;

/**
 * Spring Security OAuth 2.1 authorization server and resource server configuration for Claude v1.
 *
 * <p>{@code @Order(5)} and {@code @Order(6)} place these chains after the Claude beta chains (1/2)
 * and the OpenAI chains (3/4) and strictly before the unnumbered default chain. Both matchers are
 * bound to the Claude v1 internal prefix, so no Claude request can reach the permissive default
 * chain and no other lane's request can reach these.</p>
 */
@Configuration(proxyBeanMethods = false)
@ConditionalOnClaudeV1Enabled
public class ClaudeV1OAuthConfiguration {

    @Bean(name = "claudeV1RegisteredClientRepository")
    public RegisteredClientRepository claudeV1RegisteredClientRepository(JdbcOperations jdbcOperations) {
        return new ClaudeV1RegisteredClientRepository(new JdbcRegisteredClientRepository(jdbcOperations));
    }

    /**
     * Registers or refreshes the two Claude client identities in the shared client table.
     *
     * <p>Loopback redirect URIs are stored without a port. {@link ClaudeV1RedirectUriValidator}
     * performs the actual comparison and allows the ephemeral port Claude Code binds at runtime.</p>
     */
    @Bean(name = "claudeV1ClientRegistrar")
    public InitializingBean claudeV1ClientRegistrar(
            @Qualifier("claudeV1RegisteredClientRepository") RegisteredClientRepository registeredClients,
            ClaudeV1Properties properties) {
        return () -> {
            registerClient(
                    registeredClients,
                    properties,
                    ClaudeV1Contract.CIMD_HOSTED_CLAUDE_CLIENT_ID,
                    "Hosted Claude (Claude.ai / Desktop / Mobile)",
                    List.of(ClaudeV1Contract.HOSTED_CLAUDE_AUTH_CALLBACK));
            registerClient(
                    registeredClients,
                    properties,
                    ClaudeV1Contract.CIMD_CLAUDE_CODE_CLIENT_ID,
                    "Claude Code",
                    List.of("http://127.0.0.1/callback", "http://localhost/callback"));
        };
    }

    private void registerClient(
            RegisteredClientRepository registeredClients,
            ClaudeV1Properties properties,
            String clientId,
            String clientName,
            List<String> redirectUris) {

        TokenSettings tokenSettings = TokenSettings.builder()
                .accessTokenFormat(OAuth2TokenFormat.REFERENCE)
                .accessTokenTimeToLive(properties.getAccessTokenTtl())
                .refreshTokenTimeToLive(properties.getRefreshTokenTtl())
                .reuseRefreshTokens(false)
                .build();

        RegisteredClient existing = registeredClients.findByClientId(clientId);
        RegisteredClient.Builder builder = existing == null
                ? RegisteredClient.withId(UUID.randomUUID().toString())
                : RegisteredClient.from(existing);

        builder.clientId(clientId)
                .clientName(clientName)
                .clientAuthenticationMethods(methods -> {
                    methods.clear();
                    methods.add(ClientAuthenticationMethod.NONE);
                })
                .authorizationGrantTypes(grants -> {
                    grants.clear();
                    grants.add(AuthorizationGrantType.AUTHORIZATION_CODE);
                    grants.add(AuthorizationGrantType.REFRESH_TOKEN);
                })
                .redirectUris(uris -> {
                    uris.clear();
                    uris.addAll(redirectUris);
                })
                .scopes(scopes -> {
                    scopes.clear();
                    scopes.add(ClaudeV1Contract.SCOPE_READ);
                    scopes.add(ClaudeV1Contract.SCOPE_WRITE);
                    scopes.add(ClaudeV1Contract.SCOPE_OFFLINE_ACCESS);
                })
                .clientSettings(ClientSettings.builder()
                        .requireAuthorizationConsent(false)
                        .requireProofKey(true)
                        .build())
                .tokenSettings(tokenSettings);

        registeredClients.save(builder.build());
    }

    @Bean(name = "claudeV1AuthorizationService")
    public OAuth2AuthorizationService claudeV1AuthorizationService(
            JdbcOperations jdbcOperations,
            @Qualifier("claudeV1RegisteredClientRepository") RegisteredClientRepository registeredClients) {
        // The JDBC service deliberately reads through an unscoped repository so it can deserialize
        // any row; the provider wrapper then applies the Claude v1 boundary after deserialization.
        return new ClaudeV1OAuth2AuthorizationService(
                new JdbcOAuth2AuthorizationService(
                        jdbcOperations,
                        new JdbcRegisteredClientRepository(jdbcOperations)),
                registeredClients);
    }

    @Bean(name = "claudeV1AuthorizationServerSettings")
    public AuthorizationServerSettings claudeV1AuthorizationServerSettings(ClaudeV1Properties properties) {
        return AuthorizationServerSettings.builder()
                .issuer(properties.getPublicOrigin())
                .authorizationEndpoint(ClaudeV1Contract.INTERNAL_AUTHORIZE_PATH)
                .tokenEndpoint(ClaudeV1Contract.INTERNAL_TOKEN_PATH)
                .tokenRevocationEndpoint(ClaudeV1Contract.INTERNAL_REVOKE_PATH)
                .build();
    }

    /**
     * Stamps the Claude v1 resource identifier into every access token as its audience, so a token
     * minted here cannot be replayed against another SkillPilot resource server.
     */
    @Bean(name = "claudeV1TokenCustomizer")
    public OAuth2TokenCustomizer<OAuth2TokenClaimsContext> claudeV1TokenCustomizer(ClaudeV1Properties properties) {
        // A mutable ArrayList: the JDBC authorization store serializes token claims through a
        // restricted polymorphic type validator that does not accept List.of() implementations.
        return context -> context.getClaims()
                .audience(new java.util.ArrayList<>(List.of(properties.getPublicMcpUrl())));
    }

    @Bean(name = "claudeV1TokenGenerator")
    public OAuth2TokenGenerator<?> claudeV1TokenGenerator(
            @Qualifier("claudeV1TokenCustomizer") OAuth2TokenCustomizer<OAuth2TokenClaimsContext> tokenCustomizer) {
        OAuth2AccessTokenGenerator accessTokenGenerator = new OAuth2AccessTokenGenerator();
        accessTokenGenerator.setAccessTokenCustomizer(tokenCustomizer);
        return new DelegatingOAuth2TokenGenerator(accessTokenGenerator, new ClaudeV1PublicRefreshTokenGenerator());
    }

    @Bean(name = "claudeV1OpaqueTokenIntrospector")
    public OpaqueTokenIntrospector claudeV1OpaqueTokenIntrospector(
            @Qualifier("claudeV1AuthorizationService") OAuth2AuthorizationService authorizationService,
            @Qualifier("claudeV1RegisteredClientRepository") RegisteredClientRepository registeredClients,
            ClaudeV1Properties properties) {
        return new ClaudeV1OpaqueTokenIntrospector(authorizationService, registeredClients, properties);
    }

    @Bean(name = "claudeV1SecurityContextRepository")
    public SecurityContextRepository claudeV1SecurityContextRepository() {
        HttpSessionSecurityContextRepository repository = new HttpSessionSecurityContextRepository();
        repository.setSpringSecurityContextKey("SKILLPILOT_CLAUDE_CONNECTOR_V1_SECURITY_CONTEXT");
        return repository;
    }

    @Bean(name = "claudeV1AppAuthenticationFilter")
    public ClaudeV1AppAuthenticationFilter claudeV1AppAuthenticationFilter(
            @Qualifier("claudeV1SecurityContextRepository") SecurityContextRepository contextRepository) {
        return new ClaudeV1AppAuthenticationFilter(contextRepository);
    }

    @Bean(name = "claudeV1AuthorizationServerSecurityFilterChain")
    @Order(5)
    public SecurityFilterChain claudeV1AuthorizationServerSecurityFilterChain(
            HttpSecurity http,
            @Qualifier("claudeV1RegisteredClientRepository") RegisteredClientRepository registeredClientRepository,
            @Qualifier("claudeV1AuthorizationService") OAuth2AuthorizationService authorizationService,
            @Qualifier("claudeV1AuthorizationServerSettings") AuthorizationServerSettings authorizationServerSettings,
            @Qualifier("claudeV1TokenGenerator") OAuth2TokenGenerator<?> tokenGenerator,
            @Qualifier("claudeV1AppAuthenticationFilter") ClaudeV1AppAuthenticationFilter appAuthenticationFilter,
            @Qualifier("claudeV1SecurityContextRepository") SecurityContextRepository contextRepository,
            ClaudeV1CimdMetadataValidator cimdValidator,
            ClaudeV1TokenLifecycleService tokenLifecycleService,
            ClaudeV1Properties properties) throws Exception {

        OAuth2AuthorizationServerConfigurer authorizationServer = new OAuth2AuthorizationServerConfigurer();
        RequestMatcher endpointsMatcher = authorizationServer.getEndpointsMatcher();
        ClaudeV1RedirectUriValidator redirectUriValidator =
                new ClaudeV1RedirectUriValidator(cimdValidator, properties);

        http.securityMatcher(request -> {
            if (request.getDispatcherType() == jakarta.servlet.DispatcherType.ERROR) {
                return false;
            }
            String uri = connectorRequestUri(request);
            boolean claudeV1Path = uri.equals(ClaudeV1Contract.INTERNAL_PRIVACY_PATH)
                    || uri.equals(ClaudeV1Contract.INTERNAL_PROTECTED_RESOURCE_METADATA_PATH)
                    || uri.equals(ClaudeV1Contract.INTERNAL_AUTH_SERVER_METADATA_PATH)
                    || uri.equals(ClaudeV1Contract.INTERNAL_AUTHORIZE_PATH)
                    || uri.equals(ClaudeV1Contract.INTERNAL_TOKEN_PATH)
                    || uri.equals(ClaudeV1Contract.INTERNAL_REVOKE_PATH);
            // The authorization-server endpoints are additionally required to live under the
            // Claude v1 prefix, so this chain can never claim another lane's OAuth endpoint.
            return claudeV1Path
                    || (endpointsMatcher.matches(request) && uri.startsWith(ClaudeV1Contract.INTERNAL_BASE_PATH));
        })
        .with(authorizationServer, server -> server
                .registeredClientRepository(registeredClientRepository)
                .authorizationService(authorizationService)
                .authorizationServerSettings(authorizationServerSettings)
                .tokenGenerator(tokenGenerator)
                .clientAuthentication(clientAuthentication -> clientAuthentication
                        .authenticationConverters(converters -> {
                            converters.add(0, new ClaudeV1PublicRefreshClientAuthenticationConverter());
                            converters.add(0, new ClaudeV1PublicRevocationClientAuthenticationConverter());
                        })
                        .authenticationProviders(providers -> {
                            providers.add(0, new ClaudeV1PublicRefreshClientAuthenticationProvider(
                                    registeredClientRepository));
                            providers.add(0, new ClaudeV1PublicRevocationClientAuthenticationProvider(
                                    registeredClientRepository));
                        }))
                .tokenRevocationEndpoint(endpoint -> endpoint.revocationResponseHandler(
                        (request, response, authentication) -> {
                            tokenLifecycleService.revokeToken(
                                    request.getParameter("token"),
                                    request.getParameter("token_type_hint"));
                            response.setStatus(HttpServletResponse.SC_OK);
                            response.setHeader("Cache-Control", "no-store");
                        }))
                .authorizationEndpoint(endpoint -> endpoint.authenticationProviders(providers ->
                        providers.forEach(provider -> {
                            if (provider instanceof OAuth2AuthorizationCodeRequestAuthenticationProvider codeProvider) {
                                codeProvider.setAuthenticationValidator(redirectUriValidator);
                            }
                        }))))
        .csrf(csrf -> csrf
                .ignoringRequestMatchers(
                        ClaudeV1Contract.INTERNAL_AUTHORIZE_PATH,
                        ClaudeV1Contract.INTERNAL_TOKEN_PATH,
                        ClaudeV1Contract.INTERNAL_REVOKE_PATH))
        .securityContext(context -> context.securityContextRepository(contextRepository))
        .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                        ClaudeV1Contract.INTERNAL_PRIVACY_PATH,
                        ClaudeV1Contract.INTERNAL_PROTECTED_RESOURCE_METADATA_PATH,
                        ClaudeV1Contract.INTERNAL_AUTH_SERVER_METADATA_PATH,
                        ClaudeV1Contract.INTERNAL_TOKEN_PATH,
                        ClaudeV1Contract.INTERNAL_REVOKE_PATH).permitAll()
                .anyRequest().authenticated())
        // The host check runs first; the app filter runs directly after the security context
        // is loaded, which is well before the authorization endpoint filter reads it.
        .addFilterBefore(new ClaudeV1HostBoundaryFilter(properties), SecurityContextHolderFilter.class)
        .addFilterAfter(new ClaudeV1RequestSizeFilter(properties), ClaudeV1HostBoundaryFilter.class)
        .addFilterAfter(new ClaudeV1OAuthBoundaryFilter(properties), ClaudeV1RequestSizeFilter.class)
        .addFilterAfter(
                new ClaudeV1OAuthResourceValidationFilter(properties.getPublicMcpUrl()),
                ClaudeV1OAuthBoundaryFilter.class)
        .addFilterAfter(
                appAuthenticationFilter,
                ClaudeV1OAuthResourceValidationFilter.class);

        return http.build();
    }

    @Bean(name = "claudeV1ResourceServerSecurityFilterChain")
    @Order(6)
    public SecurityFilterChain claudeV1ResourceServerSecurityFilterChain(
            HttpSecurity http,
            @Qualifier("claudeV1OpaqueTokenIntrospector") OpaqueTokenIntrospector introspector,
            ClaudeV1Properties properties) throws Exception {

        http.securityMatcher(request -> {
                    if (request.getDispatcherType() == jakarta.servlet.DispatcherType.ERROR) {
                        return false;
                    }
                    String uri = connectorRequestUri(request);
                    return ClaudeV1Contract.INTERNAL_MCP_PATH.equals(uri);
                })
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .requestCache(cache -> cache.disable())
            .authorizeHttpRequests(auth -> auth
                    .anyRequest().hasAuthority("SCOPE_" + ClaudeV1Contract.SCOPE_READ))
            .addFilterBefore(new ClaudeV1HostBoundaryFilter(properties), SecurityContextHolderFilter.class)
            .addFilterAfter(new ClaudeV1McpOriginFilter(), ClaudeV1HostBoundaryFilter.class)
            .addFilterAfter(new ClaudeV1RequestSizeFilter(properties), ClaudeV1McpOriginFilter.class)
            .oauth2ResourceServer(oauth2 -> oauth2
                    .opaqueToken(opaque -> opaque.introspector(introspector))
                    .authenticationEntryPoint((request, response, authException) -> {
                        // RFC 9728: point unauthenticated callers at the protected resource
                        // metadata. No error code is added for a simply missing credential.
                        boolean credentialPresented =
                                request.getHeader("Authorization") != null;
                        String challenge = "Bearer resource_metadata=\""
                                + properties.getPublicResourceMetadataUrl() + "\"";
                        response.setHeader(
                                "WWW-Authenticate",
                                credentialPresented ? challenge + ", error=\"invalid_token\"" : challenge);
                        // Avoid a servlet error dispatch: it can invoke unrelated global CORS/error
                        // handling and, with a request cache, allocate a session for an otherwise
                        // stateless unauthenticated MCP request.
                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    }));

        return http.build();
    }

    private static String connectorRequestUri(jakarta.servlet.http.HttpServletRequest request) {
        String rawUri = RawHttpServletRequest.requestUri(request);
        if (rawUri != null) {
            return rawUri;
        }
        // Some servlet error wrappers cannot be unwrapped. Use their resolved URI only as a
        // narrow fallback; /error therefore stays outside the connector chains while an explicitly
        // resolved internal path still reaches the host filter and fails closed there.
        String resolvedUri = request.getRequestURI();
        return resolvedUri == null ? "" : resolvedUri;
    }
}
