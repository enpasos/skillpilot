package com.skillpilot.backend.openai.de.oauth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.gen.RSAKeyGenerator;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.skillpilot.backend.oauth.JdbcOAuthClientAssertionReplayStore;
import com.skillpilot.backend.oauth.OAuthProfileDiagnostics;
import com.skillpilot.backend.oauth.OAuthProfileDiagnostics.Reason;
import com.skillpilot.backend.oauth.OAuthProfileDiagnosticsFilter;
import com.skillpilot.backend.openai.de.OpenAiDeProperties;
import java.io.IOException;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Date;
import java.util.List;
import java.util.function.Consumer;
import java.util.stream.Stream;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.settings.ClientSettings;

class OpenAiDeClientAssertionDiagnosticsTest {
    private static final String CLIENT = "https://chatgpt.com/oauth/private-client-marker/client.json";
    private static final String JWKS = "https://chatgpt.com/oauth/jwks.json";
    private static final String AUDIENCE = "https://skillpilot.test/api/openai/v1/oauth2/token";
    private static final String ISSUER = "https://skillpilot.test/api/openai/v1";
    private static final String PRIVATE_MARKER = "private-assertion-marker";
    private static final Instant NOW = Instant.parse("2026-09-24T14:00:00Z");
    private static final Clock CLOCK = Clock.fixed(NOW, ZoneOffset.UTC);
    private static RSAKey key;
    private static RSAKey wrongKey;

    @BeforeAll static void keys() throws Exception {
        key = new RSAKeyGenerator(2048).keyID("trusted").generate();
        wrongKey = new RSAKeyGenerator(2048).keyID("trusted").generate();
    }

    @ParameterizedTest
    @MethodSource("invalidClaims")
    void preservesSpecificClaimReasonThroughDecoderFallback(
            Consumer<JWTClaimsSet.Builder> customize, Reason reason) throws Exception {
        var store = mock(JdbcOAuthClientAssertionReplayStore.class);
        var decoder = factory(store, validKeys()).createDecoder(client());
        String token = signed(key, header(), customize);
        diagnostic(reason, () -> assertThatThrownBy(() -> decoder.decode(token))
                .isInstanceOf(JwtException.class), token);
        verifyNoInteractions(store);
    }

    private static Stream<Arguments> invalidClaims() {
        return Stream.of(
                claims(builder -> builder.issuer(PRIVATE_MARKER), Reason.JWT_IDENTITY_REJECTED),
                claims(builder -> builder.subject(PRIVATE_MARKER), Reason.JWT_IDENTITY_REJECTED),
                claims(builder -> builder.audience(PRIVATE_MARKER), Reason.JWT_AUDIENCE_REJECTED),
                claims(builder -> builder.audience(ISSUER), Reason.JWT_AUDIENCE_USES_ISSUER),
                claims(builder -> builder.audience(List.of(AUDIENCE, PRIVATE_MARKER)), Reason.JWT_AUDIENCE_REJECTED),
                claims(builder -> builder.expirationTime(null), Reason.JWT_TIME_REJECTED),
                claims(builder -> builder.issueTime(Date.from(NOW.minusSeconds(60)))
                        .expirationTime(Date.from(NOW.minusSeconds(31))), Reason.JWT_TIME_REJECTED),
                claims(builder -> builder.expirationTime(Date.from(NOW.plusSeconds(301))), Reason.JWT_TIME_REJECTED),
                claims(builder -> builder.issueTime(Date.from(NOW.plusSeconds(31))), Reason.JWT_TIME_REJECTED),
                claims(builder -> builder.notBeforeTime(Date.from(NOW.plusSeconds(31))), Reason.JWT_TIME_REJECTED));
    }

    private static Arguments claims(Consumer<JWTClaimsSet.Builder> customize, Reason reason) {
        return Arguments.of(customize, reason);
    }

    @Test void malformedSignatureAndKeyFetchFailuresHaveOnlyGenericDecodeReason() throws Exception {
        var store = mock(JdbcOAuthClientAssertionReplayStore.class);
        var decoder = factory(store, validKeys()).createDecoder(client());
        diagnostic(Reason.JWT_DECODE_REJECTED,
                () -> assertThatThrownBy(() -> decoder.decode(PRIVATE_MARKER)).isInstanceOf(JwtException.class));
        String wrongSignature = signed(wrongKey, header(), builder -> {});
        diagnostic(Reason.JWT_DECODE_REJECTED,
                () -> assertThatThrownBy(() -> decoder.decode(wrongSignature)).isInstanceOf(JwtException.class), wrongSignature);
        var unavailable = factory(store, uri -> { throw new IOException(PRIVATE_MARKER); }).createDecoder(client());
        String validToken = signed(key, header(), builder -> {});
        diagnostic(Reason.JWT_DECODE_REJECTED,
                () -> assertThatThrownBy(() -> unavailable.decode(validToken)).isInstanceOf(JwtException.class), validToken);
        verifyNoInteractions(store);
    }

    @Test void forbiddenHeaderIsClassifiedWithoutLoggingItsUrl() throws Exception {
        var store = mock(JdbcOAuthClientAssertionReplayStore.class);
        var decoder = factory(store, validKeys()).createDecoder(client());
        String token = signed(key, new JWSHeader.Builder(JWSAlgorithm.RS256).keyID("trusted")
                .jwkURL(URI.create("https://private.invalid/" + PRIVATE_MARKER)).build(), builder -> {});
        diagnostic(Reason.JWT_HEADER_REJECTED,
                () -> assertThatThrownBy(() -> decoder.decode(token)).isInstanceOf(JwtException.class), token);
        verifyNoInteractions(store);
    }

    @Test void registrationMismatchDoesNotReachReplayOrExposeRegistration() throws Exception {
        var store = mock(JdbcOAuthClientAssertionReplayStore.class);
        var factory = factory(store, validKeys());
        var wrongClient = RegisteredClient.from(client()).clientId(PRIVATE_MARKER).build();
        diagnostic(Reason.JWT_REGISTRATION_MISMATCH,
                () -> assertThatThrownBy(() -> factory.createDecoder(wrongClient)).isInstanceOf(JwtException.class));
        verifyNoInteractions(store);
    }

    @Test void missingKidAndJtiKeepExistingInvalidClientResponses() throws Exception {
        var store = mock(JdbcOAuthClientAssertionReplayStore.class);
        var validator = replayValidator(store);
        for (boolean missingKid : List.of(true, false)) {
            var builder = Jwt.withTokenValue(PRIVATE_MARKER).header("alg", "RS256")
                    .subject(CLIENT).expiresAt(NOW.plusSeconds(60));
            if (missingKid) builder.jti(PRIVATE_MARKER); else builder.header("kid", "trusted");
            var token = builder.build();
            diagnostic(Reason.JWT_IDENTIFIER_REJECTED, () -> {
                var result = validator.validate(token);
                assertThat(result.getErrors()).singleElement().satisfies(error -> {
                    assertThat(error.getErrorCode()).isEqualTo("invalid_client");
                    assertThat(error.getDescription()).isEqualTo(missingKid
                            ? "The private_key_jwt assertion must contain a non-empty kid header."
                            : "The private_key_jwt assertion must contain a non-empty jti claim.");
                });
            });
        }
        verifyNoInteractions(store);
    }

    @Test void replayOrCapacityAndStorageRemainDistinctThroughDecoderFallback() throws Exception {
        var store = mock(JdbcOAuthClientAssertionReplayStore.class);
        when(store.consume(anyString(), anyString(), any(), anyInt())).thenReturn(false);
        var decoder = factory(store, validKeys()).createDecoder(client());
        String token = signed(key, header(), builder -> {});
        diagnostic(Reason.JWT_REPLAY_OR_CAPACITY_REJECTED,
                () -> assertThatThrownBy(() -> decoder.decode(token)).isInstanceOf(JwtException.class), token);
        when(store.consume(anyString(), anyString(), any(), anyInt()))
                .thenThrow(new DataAccessResourceFailureException(PRIVATE_MARKER));
        diagnostic(Reason.JWT_REPLAY_STORAGE_UNAVAILABLE,
                () -> assertThatThrownBy(() -> decoder.decode(token)).isInstanceOf(JwtException.class), token);
    }

    @Test void claimRejectionsRetainTheSamePublicError() throws Exception {
        var validator = new OpenAiDeClientAssertionClaimsValidator(properties(), CLOCK);
        var token = Jwt.withTokenValue(PRIVATE_MARKER).header("alg", "RS256")
                .issuer(CLIENT).subject(CLIENT).audience(List.of(PRIVATE_MARKER))
                .issuedAt(NOW).expiresAt(NOW.plusSeconds(60)).build();
        diagnostic(Reason.JWT_AUDIENCE_REJECTED, () -> {
            assertThat(validator.validate(token).getErrors()).singleElement().satisfies(error -> {
                assertThat(error.getErrorCode()).isEqualTo("invalid_client");
                assertThat(error.getDescription()).isEqualTo("Invalid OpenAI client assertion claims.");
                assertThat(error.getUri()).isNull();
            });
        });
    }

    @Test void tokenEndpointAudienceIsDistinguishedWhenIssuerIsConfiguredWithoutAcceptingIt() throws Exception {
        var properties = properties();
        properties.getOauth().setClientAssertionAudience(ISSUER);
        var store = mock(JdbcOAuthClientAssertionReplayStore.class);
        var decoder = new OpenAiDeClientAssertionDecoderFactory(properties, replayValidator(store), validKeys(), CLOCK)
                .createDecoder(client());
        String token = signed(key, header(), builder -> {});
        diagnostic(Reason.JWT_AUDIENCE_USES_TOKEN_ENDPOINT,
                () -> assertThatThrownBy(() -> decoder.decode(token)).isInstanceOf(JwtException.class), token);
        verifyNoInteractions(store);
    }

    private static void diagnostic(Reason reason, Runnable operation, String... privateValues) throws Exception {
        Logger logger = (Logger) LoggerFactory.getLogger(OAuthProfileDiagnostics.class);
        var logs = new ListAppender<ILoggingEvent>();
        logs.start(); logger.addAppender(logs);
        try {
            var request = new MockHttpServletRequest("POST", "/api/openai/v1/oauth2/token");
            request.addHeader("Authorization", "Bearer " + PRIVATE_MARKER);
            request.setContent(("client_assertion=" + PRIVATE_MARKER).getBytes(StandardCharsets.UTF_8));
            var response = new MockHttpServletResponse();
            new OAuthProfileDiagnosticsFilter("openai").doFilter(request, response, (req, res) -> {
                OAuthProfileDiagnostics.markProfile("chatgpt-cimd-jwt");
                operation.run();
                // The client-authentication failure handler must not erase the more precise reason.
                OAuthProfileDiagnostics.markReasonIfAbsent(Reason.CLIENT_AUTHENTICATION_REJECTED);
                response.setStatus(401);
            });
            assertThat(logs.list).singleElement().satisfies(event -> {
                assertThat(event.getThrowableProxy()).isNull();
                var message = assertThat(event.getFormattedMessage())
                        .contains("reason=" + reason.name() + " ", "http_status=401")
                        .doesNotContain(PRIVATE_MARKER, CLIENT, AUDIENCE, JWKS);
                if (privateValues.length > 0) message.doesNotContain(privateValues);
            });
        } finally {
            logger.detachAppender(logs); logs.stop();
        }
    }

    private static OpenAiDeClientAssertionDecoderFactory factory(JdbcOAuthClientAssertionReplayStore store,
            OpenAiDeCimdMetadataValidator.MetadataRetriever retriever) {
        return new OpenAiDeClientAssertionDecoderFactory(properties(), replayValidator(store), retriever, CLOCK);
    }

    private static OpenAiDeJwtClientAssertionValidator replayValidator(JdbcOAuthClientAssertionReplayStore store) {
        return new OpenAiDeJwtClientAssertionValidator(store, 10, Duration.ofSeconds(30), CLOCK);
    }

    private static OpenAiDeCimdMetadataValidator.MetadataRetriever validKeys() {
        return uri -> new OpenAiDeCimdMetadataValidator.MetadataResponse(uri, uri, 200, "application/json",
                new JWKSet(key.toPublicJWK()).toString().getBytes(StandardCharsets.UTF_8));
    }

    private static OpenAiDeProperties properties() {
        var result = new OpenAiDeProperties();
        result.getOauth().setClientId(CLIENT);
        result.getOauth().setClientJwkSetUri(JWKS);
        result.getOauth().setClientAssertionAudience(AUDIENCE);
        return result;
    }

    private static RegisteredClient client() {
        return RegisteredClient.withId("diagnostic-test").clientId(CLIENT)
                .clientAuthenticationMethod(ClientAuthenticationMethod.PRIVATE_KEY_JWT)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .redirectUri("https://chatgpt.com/connector/oauth/test")
                .clientSettings(ClientSettings.builder().jwkSetUrl(JWKS)
                        .tokenEndpointAuthenticationSigningAlgorithm(SignatureAlgorithm.RS256).build()).build();
    }

    private static JWSHeader header() {
        return new JWSHeader.Builder(JWSAlgorithm.RS256).keyID("trusted").build();
    }

    private static String signed(RSAKey signingKey, JWSHeader header, Consumer<JWTClaimsSet.Builder> customize) throws Exception {
        var claims = new JWTClaimsSet.Builder().issuer(CLIENT).subject(CLIENT).audience(AUDIENCE)
                .issueTime(Date.from(NOW)).expirationTime(Date.from(NOW.plusSeconds(60))).jwtID(PRIVATE_MARKER);
        customize.accept(claims);
        var token = new SignedJWT(header, claims.build());
        token.sign(new RSASSASigner(signingKey));
        return token.serialize();
    }
}
