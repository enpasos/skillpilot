package com.skillpilot.backend.openai.de.oauth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verifyNoInteractions;

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
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1ContractMetadata;
import com.skillpilot.backend.service.OpenAiDeCoachConnectionService;
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
import java.util.Base64;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.core.JdbcOperations;
import org.springframework.security.oauth2.server.authorization.JdbcOAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2Authorization;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType;
import org.springframework.security.oauth2.server.authorization.client.JdbcRegisteredClientRepository;
import org.springframework.security.oauth2.server.resource.introspection.BadOpaqueTokenException;
import org.springframework.security.oauth2.server.resource.introspection.OpaqueTokenIntrospector;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest(classes = {OpenAiDeOAuthFlowIntegrationTest.TestApplication.class,
        OpenAiDePrivateKeyJwtFlowIntegrationTest.Documents.class},
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:openai-private-jwt;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
        "spring.datasource.driver-class-name=org.h2.Driver", "spring.datasource.username=sa", "spring.datasource.password=",
        "spring.liquibase.enabled=true", "spring.liquibase.change-log=classpath:db/changelog/db.changelog-master.yaml",
        "skillpilot.security.signing-secret=7Vh2Kp9Qw4Rx8Mz3Tn6Yc1Fd5Js0LaEuBiOg",
        "skillpilot.public-base-url=https://skillpilot.test",
        "skillpilot.openai.coach.v1.enabled=true", "skillpilot.openai.coach.v1.oauth.enabled=true",
        "skillpilot.openai.coach.v1.server-build=synthetic-private-jwt-test",
        "skillpilot.openai.coach.v1.security.secure-mode=true", "skillpilot.openai.coach.v1.mcp.enabled=false",
        "skillpilot.openai.coach.v1.mcp-url=https://mcp-coach-v1.skillpilot.com/mcp",
        "skillpilot.openai.coach.v1.oauth-resource=https://mcp-coach-v1.skillpilot.com/mcp",
        "skillpilot.openai.coach.v1.oauth.protected-resource-metadata=https://mcp-coach-v1.skillpilot.com/.well-known/oauth-protected-resource/mcp",
        "skillpilot.openai.coach.v1.oauth.client-authentication-method=private_key_jwt",
        "skillpilot.openai.coach.v1.oauth.client-id=https://chatgpt.com/oauth/test/client.json",
        "skillpilot.openai.coach.v1.oauth.client-jwk-set-uri=https://chatgpt.com/oauth/jwks.json",
        "skillpilot.openai.coach.v1.oauth.client-assertion-audience=https://skillpilot.test/api/openai/v1/oauth2/token",
        "skillpilot.openai.coach.v1.oauth.redirect-uris=https://chatgpt.com/connector/oauth/test",
        "skillpilot.openai.coach.v1.oauth.transitional-basic.enabled=true",
        "skillpilot.openai.coach.v1.oauth.transitional-basic.client-id=synthetic-basic-transition",
        "skillpilot.openai.coach.v1.oauth.transitional-basic.client-secret=synthetic-transition-secret-0123456789-ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        "skillpilot.openai.coach.v1.oauth.transitional-basic.redirect-uris=https://chatgpt.com/connector/oauth/previous"
})
class OpenAiDePrivateKeyJwtFlowIntegrationTest {
    private static final String CLIENT = "https://chatgpt.com/oauth/test/client.json";
    private static final String CALLBACK = "https://chatgpt.com/connector/oauth/test";
    private static final String AUDIENCE = "https://skillpilot.test/api/openai/v1/oauth2/token";
    private static final String RESOURCE = OpenAiDeV1ContractMetadata.OAUTH_RESOURCE;
    private static final String VERIFIER = "synthetic-pkce-verifier-with-more-than-forty-three-characters";
    private static final RSAKey KEY = newKey();
    private static final String BASIC_CLIENT = "synthetic-basic-transition";
    private static final String BASIC_SECRET = "synthetic-transition-secret-0123456789-ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final String BASIC_CALLBACK = "https://chatgpt.com/connector/oauth/previous";
    private final ObjectMapper json = new ObjectMapper();
    private final HttpClient http = HttpClient.newBuilder()
            .cookieHandler(new CookieManager(null, CookiePolicy.ACCEPT_ALL))
            .followRedirects(HttpClient.Redirect.NEVER).build();
    @LocalServerPort int port;
    @Autowired JdbcOperations jdbc;
    @Autowired OpenAiDeCoachConnectionService learnerConnections;
    @Autowired @Qualifier("openAiDeAuthorizationService") OAuth2AuthorizationService authorizations;
    @Autowired @Qualifier("openAiDeOpaqueTokenIntrospector") OpaqueTokenIntrospector introspector;

    @Test void privateJwtPkceRefreshReplayAndCutoverKeepLearnerMappingIndependent() throws Exception {
        var metadata = json.readTree(get(OpenAiDeOAuthMetadataController.AUTHORIZATION_SERVER_WELL_KNOWN_PATH).body());
        assertThat(metadata.path("token_endpoint_auth_methods_supported")).hasSize(2);
        assertThat(metadata.path("token_endpoint_auth_methods_supported").get(0).asText()).isEqualTo("private_key_jwt");
        assertThat(metadata.has("registration_endpoint")).isFalse();
        String challenge = Base64.getUrlEncoder().withoutPadding().encodeToString(
                MessageDigest.getInstance("SHA-256").digest(VERIFIER.getBytes(StandardCharsets.US_ASCII)));
        String authorize = OpenAiDeOAuthConfiguration.AUTHORIZATION_ENDPOINT + "?" + form(List.of(
                Map.entry("response_type", "code"), Map.entry("client_id", CLIENT), Map.entry("redirect_uri", CALLBACK),
                Map.entry("scope", OpenAiDeOAuthConfiguration.READ_SCOPE + " offline_access"), Map.entry("state", "test-state"),
                Map.entry("code_challenge", challenge), Map.entry("code_challenge_method", "S256"), Map.entry("resource", RESOURCE)));
        var consent = get(authorize);
        assertThat(consent.statusCode()).withFailMessage(consent.body()).isEqualTo(302);
        String state = query(URI.create(consent.headers().firstValue("Location").orElseThrow())).get("state");
        var approved = post(OpenAiDeOAuthConfiguration.AUTHORIZATION_ENDPOINT, List.of(
                Map.entry("client_id", CLIENT), Map.entry("state", state),
                Map.entry("scope", OpenAiDeOAuthConfiguration.READ_SCOPE), Map.entry("scope", "offline_access")));
        assertThat(approved.statusCode()).withFailMessage(approved.body()).isEqualTo(302);
        String code = query(URI.create(approved.headers().firstValue("Location").orElseThrow())).get("code");
        // RFC 7009 must never turn a code into a policy -> authorization row writer.
        var codeRevocation = post(OpenAiDeOAuthConfiguration.REVOCATION_ENDPOINT, assertion(List.of(
                Map.entry("client_id", CLIENT), Map.entry("token", code), Map.entry("token_type_hint", "authorization_code")),
                jwt(AUDIENCE, UUID.randomUUID().toString())));
        assertThat(codeRevocation.statusCode()).withFailMessage(codeRevocation.body()).isEqualTo(200);
        var grant = List.of(Map.entry("grant_type", "authorization_code"), Map.entry("client_id", CLIENT),
                Map.entry("code", code), Map.entry("redirect_uri", CALLBACK), Map.entry("code_verifier", VERIFIER),
                Map.entry("resource", RESOURCE));
        assertInvalidClient(post(OpenAiDeOAuthConfiguration.TOKEN_ENDPOINT, grant));
        String basic = "Basic " + Base64.getEncoder().encodeToString((URLEncoder.encode(CLIENT, StandardCharsets.UTF_8)
                + ":synthetic-wrong-secret").getBytes(StandardCharsets.UTF_8));
        assertInvalidClient(post(OpenAiDeOAuthConfiguration.TOKEN_ENDPOINT, grant, basic));
        assertInvalidClient(post(OpenAiDeOAuthConfiguration.TOKEN_ENDPOINT,
                assertion(grant, jwt(RESOURCE, UUID.randomUUID().toString()))));
        String usedAssertion = jwt(AUDIENCE, UUID.randomUUID().toString());
        var tokens = post(OpenAiDeOAuthConfiguration.TOKEN_ENDPOINT, assertion(grant, usedAssertion));
        assertThat(tokens.statusCode()).withFailMessage(tokens.body()).isEqualTo(200);
        String access = json.readTree(tokens.body()).path("access_token").asText();
        String refresh = json.readTree(tokens.body()).path("refresh_token").asText();
        assertThat(introspector.introspect(access).<String>getAttribute("client_id")).isEqualTo(CLIENT);
        assertThat(introspector.introspect(access).getName()).startsWith("spoa_");
        var persisted = authorizations.findByToken(access, OAuth2TokenType.ACCESS_TOKEN);
        assertThat(persisted.<String>getAttribute(AuthenticatedClientPolicy.PROVENANCE_ATTRIBUTE)).isNotBlank();
        var refreshGrant = List.of(Map.entry("grant_type", "refresh_token"), Map.entry("client_id", CLIENT),
                Map.entry("refresh_token", refresh), Map.entry("resource", RESOURCE));
        assertInvalidClient(post(OpenAiDeOAuthConfiguration.TOKEN_ENDPOINT, refreshGrant));
        assertInvalidClient(post(OpenAiDeOAuthConfiguration.TOKEN_ENDPOINT, assertion(refreshGrant, usedAssertion)));
        var refreshed = post(OpenAiDeOAuthConfiguration.TOKEN_ENDPOINT,
                assertion(refreshGrant, jwt(AUDIENCE, UUID.randomUUID().toString())));
        assertThat(refreshed.statusCode()).withFailMessage(refreshed.body()).isEqualTo(200);
        String nextAccess = json.readTree(refreshed.body()).path("access_token").asText();
        String nextRefresh = json.readTree(refreshed.body()).path("refresh_token").asText();
        assertThat(nextRefresh).isNotEqualTo(refresh);

        // A database registration downgrade cannot reactivate either OAuth or MCP access.
        jdbc.update("UPDATE oauth2_registered_client SET client_authentication_methods = 'none' WHERE client_id = ?", CLIENT);
        assertThatThrownBy(() -> introspector.introspect(nextAccess)).isInstanceOf(BadOpaqueTokenException.class);
        var deniedMcp = http.send(HttpRequest.newBuilder(local(OpenAiDeV1ContractMetadata.INTERNAL_MCP_PATH))
                .header("Content-Type", "application/json").header("Authorization", "Bearer " + nextAccess)
                .POST(HttpRequest.BodyPublishers.ofString("{}" )).build(), HttpResponse.BodyHandlers.ofString());
        assertThat(deniedMcp.statusCode()).isEqualTo(401);
        assertInvalidClient(post(OpenAiDeOAuthConfiguration.TOKEN_ENDPOINT, refreshGrant));
        jdbc.update("UPDATE oauth2_registered_client SET client_authentication_methods = 'private_key_jwt' WHERE client_id = ?", CLIENT);

        // Same client ID and fresh issue time are insufficient: pre-cutover/unmarked tokens stay invalid.
        var active = authorizations.findByToken(nextAccess, OAuth2TokenType.ACCESS_TOKEN);
        var unmarked = OAuth2Authorization.from(active).attributes(attributes ->
                attributes.remove(AuthenticatedClientPolicy.PROVENANCE_ATTRIBUTE)).build();
        new JdbcOAuth2AuthorizationService(jdbc, new JdbcRegisteredClientRepository(jdbc)).save(unmarked);
        assertThatThrownBy(() -> introspector.introspect(nextAccess)).isInstanceOf(BadOpaqueTokenException.class);
        var oldRefresh = List.of(Map.entry("grant_type", "refresh_token"), Map.entry("client_id", CLIENT),
                Map.entry("refresh_token", nextRefresh), Map.entry("resource", RESOURCE));
        var denied = post(OpenAiDeOAuthConfiguration.TOKEN_ENDPOINT,
                assertion(oldRefresh, jwt(AUDIENCE, UUID.randomUUID().toString())));
        assertThat(denied.statusCode()).isEqualTo(400);
        assertThat(json.readTree(denied.body()).path("error").asText()).isEqualTo("invalid_grant");
        verifyNoLearnerAccess();
    }

    @Test void transitionalBasicHasItsOwnCodeRefreshAndLegacyGrantBoundary() throws Exception {
        String challenge = Base64.getUrlEncoder().withoutPadding().encodeToString(
                MessageDigest.getInstance("SHA-256").digest(VERIFIER.getBytes(StandardCharsets.US_ASCII)));
        String authorize = OpenAiDeOAuthConfiguration.AUTHORIZATION_ENDPOINT + "?" + form(List.of(
                Map.entry("response_type", "code"), Map.entry("client_id", BASIC_CLIENT), Map.entry("redirect_uri", BASIC_CALLBACK),
                Map.entry("scope", OpenAiDeOAuthConfiguration.READ_SCOPE + " offline_access"), Map.entry("state", "basic-state"),
                Map.entry("code_challenge", challenge), Map.entry("code_challenge_method", "S256"), Map.entry("resource", RESOURCE)));
        var consent = get(authorize);
        assertThat(consent.statusCode()).withFailMessage(consent.body()).isEqualTo(302);
        String state = query(URI.create(consent.headers().firstValue("Location").orElseThrow())).get("state");
        var consentPage = get(OpenAiDeOAuthConfiguration.CONSENT_ENDPOINT + "?client_id=" + BASIC_CLIENT);
        assertThat(consentPage.statusCode()).isEqualTo(200);
        var approved = post(OpenAiDeOAuthConfiguration.AUTHORIZATION_ENDPOINT, List.of(
                Map.entry("client_id", BASIC_CLIENT), Map.entry("state", state),
                Map.entry("scope", OpenAiDeOAuthConfiguration.READ_SCOPE), Map.entry("scope", "offline_access")));
        assertThat(approved.statusCode()).withFailMessage(approved.body()).isEqualTo(302);
        String code = query(URI.create(approved.headers().firstValue("Location").orElseThrow())).get("code");
        var grant = List.of(Map.entry("grant_type", "authorization_code"), Map.entry("client_id", BASIC_CLIENT),
                Map.entry("code", code), Map.entry("redirect_uri", BASIC_CALLBACK), Map.entry("code_verifier", VERIFIER),
                Map.entry("resource", RESOURCE));
        assertInvalidClient(post(OpenAiDeOAuthConfiguration.TOKEN_ENDPOINT, grant));
        String basic = "Basic " + Base64.getEncoder().encodeToString((BASIC_CLIENT + ":" + BASIC_SECRET)
                .getBytes(StandardCharsets.UTF_8));
        var tokens = post(OpenAiDeOAuthConfiguration.TOKEN_ENDPOINT, grant, basic);
        assertThat(tokens.statusCode()).withFailMessage(tokens.body()).isEqualTo(200);
        String access = json.readTree(tokens.body()).path("access_token").asText();
        String refresh = json.readTree(tokens.body()).path("refresh_token").asText();
        assertThat(introspector.introspect(access).<String>getAttribute("client_profile"))
                .isEqualTo(OpenAiDeClientProfiles.BASIC_TRANSITION);

        // This models a pre-profile Basic connection. It stays usable as Basic only and is never stamped on refresh.
        var active = authorizations.findByToken(access, OAuth2TokenType.ACCESS_TOKEN);
        var legacy = OAuth2Authorization.from(active).attributes(attributes -> {
            attributes.remove(AuthenticatedClientPolicy.PROVENANCE_ATTRIBUTE);
            attributes.remove(AuthenticatedClientPolicy.PROFILE_ATTRIBUTE);
            attributes.remove(AuthenticatedClientPolicy.METHOD_ATTRIBUTE);
        }).build();
        new JdbcOAuth2AuthorizationService(jdbc, new JdbcRegisteredClientRepository(jdbc)).save(legacy);
        assertThat(introspector.introspect(access).<String>getAttribute("client_profile"))
                .isEqualTo(OpenAiDeClientProfiles.BASIC_TRANSITION);
        var refreshGrant = List.of(Map.entry("grant_type", "refresh_token"), Map.entry("client_id", BASIC_CLIENT),
                Map.entry("refresh_token", refresh), Map.entry("resource", RESOURCE));
        assertInvalidClient(post(OpenAiDeOAuthConfiguration.TOKEN_ENDPOINT, refreshGrant));
        var wrongProfile = List.of(Map.entry("grant_type", "refresh_token"), Map.entry("client_id", CLIENT),
                Map.entry("refresh_token", refresh), Map.entry("resource", RESOURCE));
        var rejected = post(OpenAiDeOAuthConfiguration.TOKEN_ENDPOINT,
                assertion(wrongProfile, jwt(AUDIENCE, UUID.randomUUID().toString())));
        assertThat(rejected.statusCode()).isEqualTo(400);
        var refreshed = post(OpenAiDeOAuthConfiguration.TOKEN_ENDPOINT, refreshGrant, basic);
        assertThat(refreshed.statusCode()).withFailMessage(refreshed.body()).isEqualTo(200);
        String nextAccess = json.readTree(refreshed.body()).path("access_token").asText();
        assertThat(authorizations.findByToken(nextAccess, OAuth2TokenType.ACCESS_TOKEN)
                .<String>getAttribute(AuthenticatedClientPolicy.PROVENANCE_ATTRIBUTE)).isNull();
        assertThat(introspector.introspect(nextAccess).<String>getAttribute("client_id")).isEqualTo(BASIC_CLIENT);
        verifyNoLearnerAccess();
    }

    private void verifyNoLearnerAccess() {
        // Enabling the real scheduler may invoke its existing startup retention job; OAuth must call nothing else.
        org.mockito.Mockito.verify(learnerConnections, org.mockito.Mockito.atMostOnce()).cleanupExpiredLearningSessions();
        org.mockito.Mockito.verifyNoMoreInteractions(learnerConnections);
    }

    private void assertInvalidClient(HttpResponse<String> response) throws Exception {
        assertThat(response.statusCode()).withFailMessage(response.body()).isIn(400, 401);
        assertThat(json.readTree(response.body()).path("error").asText()).isEqualTo("invalid_client");
    }
    private static List<Map.Entry<String, String>> assertion(List<Map.Entry<String, String>> form, String jwt) {
        var result = new ArrayList<>(form);
        result.add(Map.entry("client_assertion_type", "urn:ietf:params:oauth:client-assertion-type:jwt-bearer"));
        result.add(Map.entry("client_assertion", jwt)); return result;
    }
    private static String jwt(String audience, String jti) throws Exception {
        var now = Instant.now();
        var jwt = new SignedJWT(new JWSHeader.Builder(JWSAlgorithm.RS256).keyID(KEY.getKeyID()).build(),
                new JWTClaimsSet.Builder().issuer(CLIENT).subject(CLIENT).audience(audience)
                        .issueTime(Date.from(now)).expirationTime(Date.from(now.plusSeconds(60))).jwtID(jti).build());
        jwt.sign(new RSASSASigner(KEY)); return jwt.serialize();
    }
    private static RSAKey newKey() {
        try { return new RSAKeyGenerator(2048).keyID("synthetic-only").generate(); }
        catch (Exception exception) { throw new IllegalStateException(exception); }
    }
    private HttpResponse<String> get(String path) throws Exception {
        return http.send(HttpRequest.newBuilder(local(path)).GET().build(), HttpResponse.BodyHandlers.ofString());
    }
    private HttpResponse<String> post(String path, List<Map.Entry<String, String>> values) throws Exception {
        return post(path, values, null);
    }
    private HttpResponse<String> post(String path, List<Map.Entry<String, String>> values, String authorization) throws Exception {
        var request = HttpRequest.newBuilder(local(path)).header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(form(values)));
        if (authorization != null) { request.header("Authorization", authorization); }
        return http.send(request.build(), HttpResponse.BodyHandlers.ofString());
    }
    private URI local(String path) { return URI.create("http://127.0.0.1:" + port + path); }
    private static String form(List<Map.Entry<String, String>> entries) {
        return entries.stream().map(entry -> URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8) + "="
                + URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8)).collect(Collectors.joining("&"));
    }
    private static Map<String, String> query(URI uri) {
        return java.util.Arrays.stream(uri.getRawQuery().split("&")).map(pair -> pair.split("=", 2))
                .collect(Collectors.toMap(pair -> URLDecoder.decode(pair[0], StandardCharsets.UTF_8),
                        pair -> URLDecoder.decode(pair[1], StandardCharsets.UTF_8)));
    }

    @TestConfiguration(proxyBeanMethods = false)
    static class Documents {
        @Bean @Primary OpenAiDeCimdMetadataValidator.MetadataRetriever syntheticChatGptDocuments() {
            return uri -> {
                String body;
                if (CLIENT.equals(uri.toString())) {
                    body = """
                            {"client_id":"%s","client_name":"Synthetic ChatGPT fixture",
                            "redirect_uris":["%s"],"token_endpoint_auth_methods_supported":["none","private_key_jwt"],
                            "token_endpoint_auth_signing_alg":"RS256","jwks_uri":"https://chatgpt.com/oauth/jwks.json"}
                            """.formatted(CLIENT, CALLBACK);
                } else {
                    assertThat(uri.toString()).isEqualTo("https://chatgpt.com/oauth/jwks.json");
                    body = new JWKSet(KEY.toPublicJWK()).toString();
                }
                return new OpenAiDeCimdMetadataValidator.MetadataResponse(uri, uri, 200, "application/json",
                        body.getBytes(StandardCharsets.UTF_8));
            };
        }
    }
}
