package com.skillpilot.backend.openai.de.oauth;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.openai.de.OpenAiDeProperties;
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1ContractMetadata;
import com.skillpilot.backend.openai.nativev1.oauth.OpenAiNativeCimdValidator;
import com.skillpilot.backend.oauth.AuthenticatedClientPolicy;
import java.net.*;
import java.net.http.*;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;
import java.util.stream.Collectors;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType;
import org.springframework.security.oauth2.server.resource.introspection.OpaqueTokenIntrospector;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest(classes = OpenAiDeOAuthFlowIntegrationTest.TestApplication.class, webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:openai-native-oauth;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
        "spring.datasource.driver-class-name=org.h2.Driver", "spring.datasource.username=sa", "spring.datasource.password=",
        "spring.liquibase.enabled=true", "spring.liquibase.change-log=classpath:db/changelog/db.changelog-master.yaml",
        "skillpilot.openai.coach.v1.enabled=true", "skillpilot.openai.coach.v1.server-build=test-build",
        "skillpilot.openai.coach.v1.security.secure-mode=true", "skillpilot.openai.coach.v1.oauth.enabled=true",
        "skillpilot.openai.coach.v1.mcp.enabled=false", "skillpilot.public-base-url=https://skillpilot.test",
        "skillpilot.security.signing-secret=7Vh2Kp9Qw4Rx8Mz3Tn6Yc1Fd5Js0LaEuBiOg",
        "skillpilot.openai.coach.v1.oauth.client-id=hosted-client",
        "skillpilot.openai.coach.v1.oauth.client-secret=hosted-client-secret-at-least-thirty-two-characters",
        "skillpilot.openai.coach.v1.oauth.client-authentication-method=client_secret_basic",
        "skillpilot.openai.coach.v1.oauth.redirect-uris=https://chatgpt.com/connector/oauth/hosted-test",
        "skillpilot.openai.coach.v1.oauth.native-cimd.enabled=true"
})
class OpenAiDeNativeOAuthFlowIntegrationTest {
    static final String NATIVE = OpenAiDeProperties.OAuth.NativeCimd.CLIENT_ID;
    static final String CALLBACK = "http://127.0.0.1:49271/callback/Su4_F3uWAhkS";
    static final String RESOURCE = OpenAiDeV1ContractMetadata.OAUTH_RESOURCE;
    static final String VERIFIER = "native-desktop-pkce-verifier-longer-than-forty-three-characters";
    static final String READ = OpenAiDeOAuthConfiguration.READ_SCOPE;
    @LocalServerPort int port;
    @Autowired @Qualifier("openAiDeOpaqueTokenIntrospector") OpaqueTokenIntrospector introspector;
    @Autowired @Qualifier("openAiDeAuthorizationService") OAuth2AuthorizationService authorizations;
    @MockitoBean OpenAiNativeCimdValidator metadata;
    final ObjectMapper mapper = new ObjectMapper();
    HttpClient browser;

    @BeforeEach void setup() {
        browser = HttpClient.newBuilder().cookieHandler(new CookieManager(null, CookiePolicy.ACCEPT_ALL))
                .followRedirects(HttpClient.Redirect.NEVER).build();
        when(metadata.clientId()).thenReturn(NATIVE);
        when(metadata.redirectUri()).thenReturn(OpenAiDeProperties.OAuth.NativeCimd.REDIRECT_URI);
        var structural = new OpenAiNativeCimdValidator(NATIVE, mapper, uri -> { throw new java.io.IOException("no network"); });
        when(metadata.validRedirect(anyString())).thenAnswer(call -> structural.validRedirect(call.getArgument(0)));
    }

    @Test void metadataAdvertisesBothProfilesAndOneUnchangedResource() throws Exception {
        var as = json(get(OpenAiDeOAuthMetadataController.AUTHORIZATION_SERVER_WELL_KNOWN_PATH));
        assertThat(as.path("token_endpoint_auth_methods_supported").toString()).isEqualTo("[\"client_secret_basic\",\"none\"]");
        assertThat(as.path("client_id_metadata_document_supported").asBoolean()).isTrue();
        assertThat(as.has("registration_endpoint")).isFalse();
        assertThat(json(get(OpenAiDeOAuthMetadataController.PROTECTED_RESOURCE_METADATA_PATH)).path("resource").asText()).isEqualTo(RESOURCE);
    }

    @Test void nativeConsentPkceAndTokensCarryIndependentProfileAndSharedAudience() throws Exception {
        var token = issue();
        var principal = introspector.introspect(token.path("access_token").asText());
        assertThat(principal.getName()).startsWith("spoa_");
        assertThat(principal.<String>getAttribute("client_id")).isEqualTo(NATIVE);
        assertThat(principal.<String>getAttribute("client_profile")).isEqualTo(OpenAiDeClientProfiles.NATIVE_CIMD_PUBLIC);
        assertThat(principal.<List<String>>getAttribute("aud")).containsExactly(RESOURCE);
        var stored = authorizations.findByToken(token.path("access_token").asText(), OAuth2TokenType.ACCESS_TOKEN);
        assertThat(stored.<String>getAttribute(AuthenticatedClientPolicy.PROFILE_ATTRIBUTE)).isEqualTo(OpenAiDeClientProfiles.NATIVE_CIMD_PUBLIC);
        assertThat(token.path("refresh_token").asText()).isNotBlank();
        verify(metadata, atLeastOnce()).verify();
    }

    @Test void refreshRotatesAndReplayRevokesLatestAccessAndRefresh() throws Exception {
        var initial = issue();
        var rotatedResponse = refresh(initial.path("refresh_token").asText());
        assertThat(rotatedResponse.statusCode()).withFailMessage(rotatedResponse.body()).isEqualTo(200);
        var rotated = json(rotatedResponse);
        assertThat(rotated.path("refresh_token").asText()).isNotEqualTo(initial.path("refresh_token").asText());
        assertThat(refresh(initial.path("refresh_token").asText()).statusCode()).isEqualTo(400);
        assertThatThrownBy(() -> introspector.introspect(rotated.path("access_token").asText())).isInstanceOf(RuntimeException.class);
        assertThat(refresh(rotated.path("refresh_token").asText()).statusCode()).isEqualTo(400);
    }

    @Test void revocationInvalidatesWholeNativeFamilyWithoutAffectingOtherGrant() throws Exception {
        var first = issue();
        browser = HttpClient.newBuilder().cookieHandler(new CookieManager(null, CookiePolicy.ACCEPT_ALL)).followRedirects(HttpClient.Redirect.NEVER).build();
        var second = issue();
        var revoke = post(OpenAiDeOAuthConfiguration.REVOCATION_ENDPOINT, Map.of("client_id", NATIVE, "token", first.path("refresh_token").asText()));
        assertThat(revoke.statusCode()).withFailMessage(revoke.body()).isEqualTo(200);
        assertThatThrownBy(() -> introspector.introspect(first.path("access_token").asText())).isInstanceOf(RuntimeException.class);
        assertThat(introspector.introspect(second.path("access_token").asText())).isNotNull();
    }

    @Test void authorizationCodeReplayInvalidatesIssuedNativeGrant() throws Exception {
        String code = code(CALLBACK);
        var initial = exchange(code, CALLBACK, VERIFIER);
        assertThat(initial.statusCode()).withFailMessage(initial.body()).isEqualTo(200);
        assertThat(exchange(code, CALLBACK, VERIFIER).statusCode()).isEqualTo(400);
        assertThatThrownBy(() -> introspector.introspect(json(initial).path("access_token").asText())).isInstanceOf(RuntimeException.class);
    }

    @Test void codeExchangeRequiresOriginalVerifierAndExactSelectedPort() throws Exception {
        assertThat(exchange(code(CALLBACK), CALLBACK, VERIFIER + "x").statusCode()).isEqualTo(400);
        browser = HttpClient.newBuilder().cookieHandler(new CookieManager(null, CookiePolicy.ACCEPT_ALL)).followRedirects(HttpClient.Redirect.NEVER).build();
        assertThat(exchange(code(CALLBACK), CALLBACK.replace(":49271", ":49272"), VERIFIER).statusCode()).isEqualTo(400);
    }

    @Test void nativeCallbacksDoNotAllowHostPathSchemeOrQueryChanges() throws Exception {
        for (String callback : List.of(CALLBACK.replace("127.0.0.1", "localhost"), CALLBACK.replace("http:", "https:"),
                CALLBACK + "?redirect=https://evil.test", CALLBACK.replace("Su4_F3uWAhkS", "other"),
                CALLBACK.replace("127.0.0.1", "127.0.0.2"))) {
            var response = authorize(callback, "S256", RESOURCE, NATIVE);
            assertThat(response.statusCode()).as(callback).isEqualTo(400);
            assertThat(response.headers().firstValue("Location")).isEmpty();
        }
    }

    @Test void nativeRequiresS256AndResourceBeforeConsent() throws Exception {
        assertThat(authorize(CALLBACK, "plain", RESOURCE, NATIVE).statusCode()).isEqualTo(400);
        assertThat(authorize(CALLBACK, "S256", RESOURCE + "/", NATIVE).statusCode()).isEqualTo(400);
        assertThat(authorize(CALLBACK, "S256", "https://mcp-claude-v1.skillpilot.com/mcp", NATIVE).statusCode()).isEqualTo(400);
    }

    @Test void resourceCannotChangeDuringCodeExchangeOrRefresh() throws Exception {
        String code = code(CALLBACK);
        assertThat(post(OpenAiDeOAuthConfiguration.TOKEN_ENDPOINT, Map.of("client_id", NATIVE, "grant_type", "authorization_code",
                "code", code, "code_verifier", VERIFIER, "redirect_uri", CALLBACK, "resource", RESOURCE + "/native")).statusCode()).isEqualTo(400);
        var initial = exchange(code, CALLBACK, VERIFIER);
        assertThat(initial.statusCode()).isEqualTo(200);
        assertThat(post(OpenAiDeOAuthConfiguration.TOKEN_ENDPOINT, Map.of("client_id", NATIVE, "grant_type", "refresh_token",
                "refresh_token", json(initial).path("refresh_token").asText(), "resource", RESOURCE + "/native")).statusCode()).isEqualTo(400);
        assertThat(introspector.introspect(json(initial).path("access_token").asText())).isNotNull();
    }

    @Test void unknownClientsAndConfidentialFallbackNeverBecomeNative() throws Exception {
        assertThat(authorize(CALLBACK, "S256", RESOURCE, NATIVE.replace("Su4_F3uWAhkS", "foreign")).statusCode()).isEqualTo(400);
        var token = issue();
        var invalid = post(OpenAiDeOAuthConfiguration.TOKEN_ENDPOINT, Map.of("client_id", NATIVE, "grant_type", "refresh_token",
                "refresh_token", token.path("refresh_token").asText(), "client_secret", "wrong", "resource", RESOURCE));
        assertThat(invalid.statusCode()).isEqualTo(400);
        assertThat(introspector.introspect(token.path("access_token").asText())).isNotNull();
    }

    @Test void nativeMetadataOutageDoesNotDisableHostedAuthorize() throws Exception {
        doThrow(new IllegalStateException("unavailable")).when(metadata).verify();
        var nativeFailure = authorize(CALLBACK, "S256", RESOURCE, NATIVE);
        assertThat(nativeFailure.statusCode()).isEqualTo(400);
        assertThat(authorize("https://chatgpt.com/connector/oauth/hosted-test", "S256", RESOURCE, "hosted-client").statusCode()).isEqualTo(302);
    }

    private JsonNode issue() throws Exception {
        var response = exchange(code(CALLBACK), CALLBACK, VERIFIER);
        assertThat(response.statusCode()).withFailMessage(response.body()).isEqualTo(200);
        return json(response);
    }
    private String code(String callback) throws Exception {
        var response = authorize(callback, "S256", RESOURCE, NATIVE);
        assertThat(response.statusCode()).withFailMessage(response.body()).isEqualTo(302);
        var location = URI.create(response.headers().firstValue("Location").orElseThrow());
        if (location.getPath().equals(OpenAiDeOAuthConfiguration.CONSENT_ENDPOINT)) {
            var consent = get(location.toString());
            assertThat(consent.statusCode()).isEqualTo(200);
            assertThat(consent.body()).contains("OAuth authorizes only the app");
            var approval = post(OpenAiDeOAuthConfiguration.AUTHORIZATION_ENDPOINT, List.of(Map.entry("client_id", NATIVE),
                    Map.entry("state", query(location).get("state")), Map.entry("scope", READ), Map.entry("scope", "offline_access")));
            assertThat(approval.statusCode()).withFailMessage(approval.body()).isEqualTo(302);
            location = URI.create(approval.headers().firstValue("Location").orElseThrow());
        }
        assertThat(location.toString()).startsWith(callback + "?");
        assertThat(query(location).get("state")).isEqualTo("native-state");
        return query(location).get("code");
    }
    private HttpResponse<String> authorize(String callback, String method, String resource, String client) throws Exception {
        return get(OpenAiDeOAuthConfiguration.AUTHORIZATION_ENDPOINT + "?" + form(Map.of("response_type", "code", "client_id", client,
                "redirect_uri", callback, "scope", READ + " offline_access", "state", "native-state", "resource", resource,
                "code_challenge_method", method, "code_challenge", Base64.getUrlEncoder().withoutPadding()
                        .encodeToString(MessageDigest.getInstance("SHA-256").digest(VERIFIER.getBytes(StandardCharsets.US_ASCII)))).entrySet()));
    }
    private HttpResponse<String> exchange(String code, String callback, String verifier) throws Exception {
        return post(OpenAiDeOAuthConfiguration.TOKEN_ENDPOINT, Map.of("client_id", NATIVE, "grant_type", "authorization_code",
                "code", code, "code_verifier", verifier, "redirect_uri", callback, "resource", RESOURCE));
    }
    private HttpResponse<String> refresh(String token) throws Exception {
        return post(OpenAiDeOAuthConfiguration.TOKEN_ENDPOINT, Map.of("client_id", NATIVE, "grant_type", "refresh_token", "refresh_token", token, "resource", RESOURCE));
    }
    private HttpResponse<String> get(String path) throws Exception {
        return browser.send(HttpRequest.newBuilder(uri(path)).GET().build(), HttpResponse.BodyHandlers.ofString());
    }
    private HttpResponse<String> post(String path, Map<String,String> parameters) throws Exception { return post(path, parameters.entrySet()); }
    private HttpResponse<String> post(String path, Collection<Map.Entry<String,String>> parameters) throws Exception {
        return browser.send(HttpRequest.newBuilder(uri(path)).header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(form(parameters))).build(), HttpResponse.BodyHandlers.ofString());
    }
    private URI uri(String path) {
        var incoming = URI.create(path);
        return URI.create("http://127.0.0.1:" + port + incoming.getRawPath() + (incoming.getRawQuery() == null ? "" : "?" + incoming.getRawQuery()));
    }
    private JsonNode json(HttpResponse<String> response) throws Exception { return mapper.readTree(response.body()); }
    private String form(Collection<Map.Entry<String,String>> values) { return values.stream().map(entry -> encode(entry.getKey()) + "=" + encode(entry.getValue())).collect(Collectors.joining("&")); }
    private String encode(String value) { return URLEncoder.encode(value, StandardCharsets.UTF_8); }
    private Map<String,String> query(URI uri) { return Arrays.stream(uri.getRawQuery().split("&")).map(pair -> pair.split("=",2))
            .collect(Collectors.toMap(pair -> URLDecoder.decode(pair[0],StandardCharsets.UTF_8), pair -> URLDecoder.decode(pair[1],StandardCharsets.UTF_8))); }
}
