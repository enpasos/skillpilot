package com.skillpilot.backend.openai.de.oauth;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.gen.RSAKeyGenerator;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.skillpilot.backend.oauth.AuthenticatedClientPolicy;
import com.skillpilot.backend.openai.de.OpenAiAppsChallengeController;
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1ContractMetadata;
import java.net.CookieManager;
import java.net.CookiePolicy;
import java.net.URI;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Base64;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.web.server.context.WebServerApplicationContext;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Primary;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.security.oauth2.server.resource.introspection.OpaqueTokenIntrospector;

class OpenAiDeHostedCimdProfilesIntegrationTest {

    private static final String OAUTH_PROPERTIES = "skillpilot.openai.coach.v1.oauth.";
    private static final String ISSUER = "https://skillpilot.test/api/openai/v1";
    private static final String JWKS_URI = "https://chatgpt.com/oauth/jwks.json";
    private static final String RESOURCE = OpenAiDeV1ContractMetadata.OAUTH_RESOURCE;
    private static final String DOMAIN_CHALLENGE = "synthetic-openai-domain-verification-fixture";
    private static final String VERIFIER = "synthetic-hosted-cimd-fixture-pkce-verifier-with-over-forty-three-characters";
    private static final HostedProfile EXISTING = HostedProfile.fixture(
            "existing", OpenAiDeClientProfiles.CIMD_JWT, ISSUER + "/oauth2/token");
    private static final HostedProfile PORTAL = HostedProfile.fixture(
            "portal", OpenAiDeClientProfiles.PORTAL_CIMD_JWT, ISSUER);

    @Test
    void enablingThePortalPreservesExistingGrantsAndBothHostedProfilesUseTheirOwnMetadataAndKeys() throws Exception {
        // Reuse the database across server restarts as an additive production registration would.
        String database = "jdbc:h2:mem:openai-hosted-cimd-" + UUID.randomUUID() + ";DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE";
        TokenPair existingTokens;
        Grant existingGrant;
        try (var original = start(database, false, 200, DOMAIN_CHALLENGE)) {
            var existing = new OAuthClient(original, EXISTING);
            existing.assertDomainChallenge(DOMAIN_CHALLENGE);
            existingTokens = existing.authorizeAndExchangeCode();
            existingGrant = existing.readGrant(existingTokens);
            assertThat(original.getBean(FixtureDocuments.class).requests)
                    .contains(EXISTING.clientId()).doesNotContain(PORTAL.clientId());
        }

        TokenPair refreshedWhilePortalUnavailable;
        try (var unavailable = start(database, true, 503, DOMAIN_CHALLENGE)) {
            var existing = new OAuthClient(unavailable, EXISTING);
            var portal = new OAuthClient(unavailable, PORTAL);
            assertThat(unavailable.getBean(FixtureDocuments.class).requests)
                    .contains(EXISTING.clientId(), PORTAL.clientId());
            portal.assertDomainChallenge(DOMAIN_CHALLENGE);
            assertThat(portal.requestConsent().statusCode()).isEqualTo(400);
            assertThat(existing.readGrant(existingTokens)).isEqualTo(existingGrant);

            refreshedWhilePortalUnavailable = existing.refresh(existingTokens);
            assertThat(existing.readGrant(refreshedWhilePortalUnavailable)).isEqualTo(existingGrant);
        }

        try (var both = start(database, true, 200, "")) {
            var existing = new OAuthClient(both, EXISTING);
            var portal = new OAuthClient(both, PORTAL);
            portal.assertDomainChallenge("");
            assertThat(existing.readGrant(refreshedWhilePortalUnavailable)).isEqualTo(existingGrant);
            assertThat(existing.readGrant(existing.refresh(refreshedWhilePortalUnavailable))).isEqualTo(existingGrant);

            Grant newExistingGrant = existing.issueAndRefresh();
            Grant portalGrant = portal.issueAndRefresh();
            assertThat(newExistingGrant.registeredClientId()).isEqualTo(existingGrant.registeredClientId());
            assertThat(portalGrant.registeredClientId()).isNotEqualTo(existingGrant.registeredClientId());
            assertThat(portalGrant.principal()).isNotEqualTo(newExistingGrant.principal());
            assertThat(both.getBean(FixtureDocuments.class).requests).contains(
                    EXISTING.clientId(), PORTAL.clientId(), JWKS_URI);
        }
    }

    static BrowserConsentFixture startBrowserConsentFixture() throws Exception {
        String database = "jdbc:h2:mem:openai-portal-browser-" + UUID.randomUUID();
        var context = start(database, true, 200, DOMAIN_CHALLENGE);
        try {
            String portalScopes = String.join(" ", OpenAiDeOAuthConfiguration.READ_SCOPE,
                    OpenAiDeOAuthConfiguration.WRITE_SCOPE, "offline_access");
            return new BrowserConsentFixture(context, new OAuthClient(context, PORTAL).authorizationUri(portalScopes),
                    URI.create(PORTAL.callback()));
        } catch (Exception failure) {
            context.close();
            throw failure;
        }
    }

    record BrowserConsentFixture(ConfigurableApplicationContext context, URI authorization, URI callback)
            implements AutoCloseable {
        @Override
        public void close() {
            context.close();
        }
    }

    private static ConfigurableApplicationContext start(
            String database, boolean portalEnabled, int portalStatus, String domainChallenge) {
        return new SpringApplicationBuilder(OpenAiDeOAuthFlowIntegrationTest.TestApplication.class, Documents.class)
                .run(
                        "--spring.config.name=synthetic-hosted-cimd-profile-test",
                        "--spring.main.banner-mode=off",
                        "--server.address=127.0.0.1",
                        "--server.port=0",
                        "--spring.datasource.url=" + database,
                        "--spring.datasource.driver-class-name=org.h2.Driver",
                        "--spring.datasource.username=sa",
                        "--spring.datasource.password=",
                        "--spring.liquibase.enabled=true",
                        "--spring.liquibase.change-log=classpath:db/changelog/db.changelog-master.yaml",
                        "--skillpilot.security.signing-secret=7Vh2Kp9Qw4Rx8Mz3Tn6Yc1Fd5Js0LaEuBiOg",
                        "--skillpilot.public-base-url=https://skillpilot.test",
                        "--skillpilot.openai.coach.v1.enabled=true",
                        "--skillpilot.openai.coach.v1.server-build=synthetic-hosted-cimd-profiles-test",
                        "--skillpilot.openai.coach.v1.security.secure-mode=true",
                        "--skillpilot.openai.coach.v1.mcp.enabled=false",
                        "--skillpilot.openai.coach.v1.open-ai-apps-challenge=" + domainChallenge,
                        "--skillpilot.openai.coach.v1.mcp-url=" + RESOURCE,
                        "--skillpilot.openai.coach.v1.oauth-resource=" + RESOURCE,
                        "--" + OAUTH_PROPERTIES + "enabled=true",
                        "--" + OAUTH_PROPERTIES + "client-authentication-method=private_key_jwt",
                        "--" + OAUTH_PROPERTIES + "client-id=" + EXISTING.clientId(),
                        "--" + OAUTH_PROPERTIES + "redirect-uris=" + EXISTING.callback(),
                        "--" + OAUTH_PROPERTIES + "client-jwk-set-uri=" + JWKS_URI,
                        "--" + OAUTH_PROPERTIES + "client-assertion-audience=" + EXISTING.audience(),
                        "--" + OAUTH_PROPERTIES + "portal-cimd.enabled=" + portalEnabled,
                        "--" + OAUTH_PROPERTIES + "portal-cimd.client-id=" + PORTAL.clientId(),
                        "--" + OAUTH_PROPERTIES + "portal-cimd.redirect-uri=" + PORTAL.callback(),
                        "--" + OAUTH_PROPERTIES + "portal-cimd.client-jwk-set-uri=" + JWKS_URI,
                        "--" + OAUTH_PROPERTIES + "portal-cimd.client-assertion-audience=" + PORTAL.audience(),
                        "--" + OAUTH_PROPERTIES + "portal-cimd.authorization-policy-version=synthetic-portal-v1",
                        "--test.hosted-cimd.portal-status=" + portalStatus);
    }

    private record HostedProfile(String clientId, String callback, String audience, String id, RSAKey key) {
        static HostedProfile fixture(String name, String id, String audience) {
            try {
                String metadataBase = "https://chatgpt.com/oauth/synthetic-hosted-cimd-" + name;
                return new HostedProfile(metadataBase + "/client.json",
                        "https://chatgpt.com/connector/oauth/synthetic-hosted-cimd-" + name,
                        audience, id, new RSAKeyGenerator(2048).keyID("fixture-" + name).generate());
            } catch (Exception exception) {
                throw new IllegalStateException("Could not create a synthetic hosted client key", exception);
            }
        }

        String assertion() throws Exception {
            Instant now = Instant.now();
            var assertion = new SignedJWT(
                    new JWSHeader.Builder(JWSAlgorithm.RS256).keyID(key.getKeyID()).build(),
                    new JWTClaimsSet.Builder()
                            .issuer(clientId).subject(clientId).audience(audience)
                            .issueTime(Date.from(now)).expirationTime(Date.from(now.plusSeconds(60)))
                            .jwtID(UUID.randomUUID().toString()).build());
            assertion.sign(new RSASSASigner(key));
            return assertion.serialize();
        }

        String clientDocument() {
            return """
                    {"client_id":"%s","client_name":"Synthetic hosted CIMD client",
                     "redirect_uris":["%s"],"jwks_uri":"%s",
                     "token_endpoint_auth_methods_supported":["private_key_jwt"],
                     "token_endpoint_auth_signing_alg":"RS256"}
                    """.formatted(clientId, callback, JWKS_URI);
        }
    }

    @TestConfiguration(proxyBeanMethods = false)
    @Import(OpenAiAppsChallengeController.class)
    static class Documents {
        @Bean
        @Primary
        FixtureDocuments fixtureDocuments(@Value("${test.hosted-cimd.portal-status}") int portalStatus) {
            return new FixtureDocuments(portalStatus);
        }
    }

    static final class FixtureDocuments implements OpenAiDeCimdMetadataValidator.MetadataRetriever {
        private final int portalStatus;
        private final List<String> requests = new CopyOnWriteArrayList<>();

        FixtureDocuments(int portalStatus) {
            this.portalStatus = portalStatus;
        }

        @Override
        public OpenAiDeCimdMetadataValidator.MetadataResponse retrieve(URI requested) {
            requests.add(requested.toString());
            for (HostedProfile profile : List.of(EXISTING, PORTAL)) {
                if (profile.clientId().equals(requested.toString())) {
                    int status = profile == PORTAL ? portalStatus : 200;
                    return response(requested, status, status == 200 ? profile.clientDocument() : "{}");
                }
            }
            if (JWKS_URI.equals(requested.toString())) {
                var publishedKeys = new JWKSet(List.of(EXISTING.key().toPublicJWK(), PORTAL.key().toPublicJWK()));
                return response(requested, 200, publishedKeys.toString());
            }
            throw new AssertionError("Unexpected remote metadata lookup in local OAuth fixture");
        }

        private static OpenAiDeCimdMetadataValidator.MetadataResponse response(URI requested, int status, String body) {
            return new OpenAiDeCimdMetadataValidator.MetadataResponse(
                    requested, requested, status, "application/json", body.getBytes(StandardCharsets.UTF_8));
        }
    }

    private record TokenPair(String accessToken, String refreshToken) {}

    private record Grant(String authorizationId, String registeredClientId, String principal, String provenance) {}

    private static final class OAuthClient {
        private final HttpClient http = HttpClient.newBuilder()
                .cookieHandler(new CookieManager(null, CookiePolicy.ACCEPT_ALL))
                .followRedirects(HttpClient.Redirect.NEVER).build();
        private final ConfigurableApplicationContext context;
        private final HostedProfile profile;
        private final String localOrigin;
        private final ObjectMapper mapper;

        OAuthClient(ConfigurableApplicationContext context, HostedProfile profile) {
            this.context = context;
            this.profile = profile;
            this.mapper = context.getBean(ObjectMapper.class);
            int port = ((WebServerApplicationContext) context).getWebServer().getPort();
            this.localOrigin = "http://127.0.0.1:" + port;
        }

        void assertDomainChallenge(String expected) throws Exception {
            var response = send(HttpRequest.newBuilder(URI.create(
                    localOrigin + OpenAiAppsChallengeController.PATH)).GET().build());
            if (expected.isEmpty()) {
                assertThat(response.statusCode()).isEqualTo(404);
            } else {
                assertThat(response.statusCode()).isEqualTo(200);
                assertThat(response.body()).isEqualTo(expected);
                assertThat(response.headers().firstValue("Content-Type").orElseThrow()).startsWith("text/plain");
            }
        }

        HttpResponse<String> requestConsent() throws Exception {
            return send(HttpRequest.newBuilder(authorizationUri(OpenAiDeOAuthConfiguration.READ_SCOPE + " offline_access"))
                    .GET().build());
        }

        URI authorizationUri(String scopes) throws Exception {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(VERIFIER.getBytes(StandardCharsets.US_ASCII));
            String challenge = Base64.getUrlEncoder().withoutPadding().encodeToString(digest);
            String parameters = form(List.of(
                    Map.entry("response_type", "code"), Map.entry("client_id", profile.clientId()),
                    Map.entry("redirect_uri", profile.callback()), Map.entry("state", "synthetic-consent"),
                    Map.entry("scope", scopes),
                    Map.entry("code_challenge", challenge), Map.entry("code_challenge_method", "S256"),
                    Map.entry("resource", RESOURCE)));
            return URI.create(localOrigin + OpenAiDeOAuthConfiguration.AUTHORIZATION_ENDPOINT + "?" + parameters);
        }

        TokenPair authorizeAndExchangeCode() throws Exception {
            var consent = requestConsent();
            assertThat(consent.statusCode()).withFailMessage(consent.body()).isEqualTo(302);
            URI consentPage = location(consent);
            assertThat(consentPage.getPath()).isEqualTo(OpenAiDeOAuthConfiguration.CONSENT_ENDPOINT);
            String state = queryParameter(consentPage, "state");

            var approval = post(OpenAiDeOAuthConfiguration.AUTHORIZATION_ENDPOINT, List.of(
                    Map.entry("client_id", profile.clientId()), Map.entry("state", state),
                    Map.entry("scope", OpenAiDeOAuthConfiguration.READ_SCOPE), Map.entry("scope", "offline_access")));
            assertThat(approval.statusCode()).withFailMessage(approval.body()).isEqualTo(302);
            URI callback = location(approval);
            assertThat(callback.getScheme() + "://" + callback.getRawAuthority() + callback.getRawPath())
                    .isEqualTo(profile.callback());

            return tokenRequest(List.of(
                    Map.entry("grant_type", "authorization_code"), Map.entry("client_id", profile.clientId()),
                    Map.entry("code", queryParameter(callback, "code")), Map.entry("redirect_uri", profile.callback()),
                    Map.entry("code_verifier", VERIFIER), Map.entry("resource", RESOURCE)));
        }

        Grant issueAndRefresh() throws Exception {
            TokenPair tokens = authorizeAndExchangeCode();
            Grant grant = readGrant(tokens);
            assertThat(readGrant(refresh(tokens))).isEqualTo(grant);
            return grant;
        }

        TokenPair refresh(TokenPair tokens) throws Exception {
            TokenPair refreshed = tokenRequest(List.of(
                    Map.entry("grant_type", "refresh_token"), Map.entry("client_id", profile.clientId()),
                    Map.entry("refresh_token", tokens.refreshToken()), Map.entry("resource", RESOURCE)));
            assertThat(refreshed.refreshToken()).isNotEqualTo(tokens.refreshToken());
            return refreshed;
        }

        Grant readGrant(TokenPair tokens) {
            var clients = context.getBean("openAiDeRegisteredClientRepository", RegisteredClientRepository.class);
            var client = clients.findByClientId(profile.clientId());
            assertThat(client).isNotNull();
            assertThat(client.getClientAuthenticationMethods()).containsExactly(ClientAuthenticationMethod.PRIVATE_KEY_JWT);
            assertThat(client.getRedirectUris()).containsExactly(profile.callback());
            assertThat(client.getClientSettings().getJwkSetUrl()).isEqualTo(JWKS_URI);
            assertThat(client.getClientSettings().getTokenEndpointAuthenticationSigningAlgorithm())
                    .isEqualTo(SignatureAlgorithm.RS256);

            var introspector = context.getBean("openAiDeOpaqueTokenIntrospector", OpaqueTokenIntrospector.class);
            var principal = introspector.introspect(tokens.accessToken());
            assertThat(principal.<String>getAttribute("client_id")).isEqualTo(profile.clientId());
            assertThat(principal.<String>getAttribute("client_profile")).isEqualTo(profile.id());

            var service = context.getBean("openAiDeAuthorizationService", OAuth2AuthorizationService.class);
            var saved = service.findByToken(tokens.accessToken(), OAuth2TokenType.ACCESS_TOKEN);
            assertThat(saved).isNotNull();
            assertThat(saved.getRegisteredClientId()).isEqualTo(client.getId());
            assertThat(saved.getPrincipalName()).isEqualTo(principal.getName()).startsWith("spoa_");
            assertThat(saved.<String>getAttribute(AuthenticatedClientPolicy.PROFILE_ATTRIBUTE)).isEqualTo(profile.id());
            String provenance = saved.getAttribute(AuthenticatedClientPolicy.PROVENANCE_ATTRIBUTE);
            assertThat(provenance).isNotBlank();
            return new Grant(saved.getId(), saved.getRegisteredClientId(), saved.getPrincipalName(), provenance);
        }

        private TokenPair tokenRequest(List<Map.Entry<String, String>> grant) throws Exception {
            var parameters = new ArrayList<>(grant);
            parameters.add(Map.entry("client_assertion_type", "urn:ietf:params:oauth:client-assertion-type:jwt-bearer"));
            parameters.add(Map.entry("client_assertion", profile.assertion()));
            var response = post(OpenAiDeOAuthConfiguration.TOKEN_ENDPOINT, parameters);
            assertThat(response.statusCode()).withFailMessage(response.body()).isEqualTo(200);
            var document = mapper.readTree(response.body());
            var tokens = new TokenPair(document.path("access_token").asText(), document.path("refresh_token").asText());
            assertThat(tokens.accessToken()).isNotBlank();
            assertThat(tokens.refreshToken()).isNotBlank();
            return tokens;
        }

        private HttpResponse<String> post(String path, List<Map.Entry<String, String>> parameters) throws Exception {
            return send(HttpRequest.newBuilder(URI.create(localOrigin + path))
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .POST(HttpRequest.BodyPublishers.ofString(form(parameters))).build());
        }

        private HttpResponse<String> send(HttpRequest request) throws Exception {
            return http.send(request, HttpResponse.BodyHandlers.ofString());
        }

        private static URI location(HttpResponse<String> response) {
            return URI.create(response.headers().firstValue("Location").orElseThrow());
        }

        private static String queryParameter(URI uri, String name) {
            return Arrays.stream(uri.getRawQuery().split("&"))
                    .map(pair -> pair.split("=", 2))
                    .filter(pair -> URLDecoder.decode(pair[0], StandardCharsets.UTF_8).equals(name))
                    .findFirst().map(pair -> URLDecoder.decode(pair[1], StandardCharsets.UTF_8))
                    .orElseThrow();
        }

        private static String form(List<Map.Entry<String, String>> parameters) {
            return parameters.stream()
                    .map(pair -> URLEncoder.encode(pair.getKey(), StandardCharsets.UTF_8) + "="
                            + URLEncoder.encode(pair.getValue(), StandardCharsets.UTF_8))
                    .collect(Collectors.joining("&"));
        }
    }
}
