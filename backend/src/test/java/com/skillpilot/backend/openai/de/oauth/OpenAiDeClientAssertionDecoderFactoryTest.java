package com.skillpilot.backend.openai.de.oauth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.nimbusds.jose.JOSEObjectType;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.gen.RSAKeyGenerator;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.skillpilot.backend.openai.de.OpenAiDeProperties;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Date;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Consumer;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.settings.ClientSettings;

class OpenAiDeClientAssertionDecoderFactoryTest {
    static final String CLIENT = "https://chatgpt.com/oauth/test/client.json";
    static final String JWKS = "https://chatgpt.com/oauth/jwks.json";
    static final String AUDIENCE = "https://skillpilot.test/api/openai/v1/oauth2/token";
    static final Instant NOW = Instant.parse("2026-09-11T12:00:00Z");
    static RSAKey key;
    static RSAKey other;

    @BeforeAll static void keys() throws Exception {
        key = new RSAKeyGenerator(2048).keyID("trusted").generate();
        other = new RSAKeyGenerator(2048).keyID("other").generate();
    }

    @Test void acceptsOnlyPinnedSignatureAndValidClaimsBeforeConsumingReplay() throws Exception {
        AtomicInteger replays = new AtomicInteger();
        var decoder = factory(replays).createDecoder(client());
        assertThat(decoder.decode(signed(key, builder -> {})).getSubject()).isEqualTo(CLIENT);
        assertThat(replays).hasValue(1);
        List<Consumer<JWTClaimsSet.Builder>> invalidClaims = List.of(
                builder -> builder.issuer("https://attacker.test/client.json"),
                builder -> builder.subject("wrong-client"),
                builder -> builder.audience("https://mcp-coach-v1.skillpilot.com/mcp"),
                builder -> builder.audience("https://skillpilot.test/api/openai/v1/api/openai/v1/oauth2/token"),
                builder -> builder.audience(List.of(AUDIENCE, "https://attacker.test")),
                builder -> builder.expirationTime(null),
                builder -> builder.expirationTime(Date.from(NOW.minusSeconds(31))),
                builder -> builder.expirationTime(Date.from(NOW.plusSeconds(301))),
                builder -> builder.issueTime(Date.from(NOW.plusSeconds(31))),
                builder -> builder.notBeforeTime(Date.from(NOW.plusSeconds(31))));
        for (var claims : invalidClaims) {
            assertThatThrownBy(() -> decoder.decode(signed(key, claims))).isInstanceOf(JwtException.class);
        }
        assertThatThrownBy(() -> decoder.decode(signed(other, builder -> {}))).isInstanceOf(JwtException.class);
        assertThat(replays).hasValue(1);
    }

    @Test void rejectsHeaderSuppliedKeyUrlsAndDowngradedClientRegistration() throws Exception {
        AtomicInteger replays = new AtomicInteger();
        var factory = factory(replays);
        var header = new JWSHeader.Builder(JWSAlgorithm.RS256).keyID(key.getKeyID())
                .jwkURL(URI.create("https://127.0.0.1/private")).build();
        SignedJWT jwt = new SignedJWT(header, claims().build());
        jwt.sign(new RSASSASigner(key));
        assertThatThrownBy(() -> factory.createDecoder(client()).decode(jwt.serialize())).isInstanceOf(JwtException.class);
        assertThat(replays).hasValue(0);
        var downgraded = RegisteredClient.from(client()).clientAuthenticationMethods(methods -> {
            methods.clear(); methods.add(ClientAuthenticationMethod.NONE);
        }).build();
        assertThatThrownBy(() -> factory.createDecoder(downgraded)).isInstanceOf(JwtException.class);
    }

    @Test void permitsOnlyExplicitSkewAndOptionalIssuedAtWithoutUnboundedLifetime() throws Exception {
        AtomicInteger replays = new AtomicInteger();
        var decoder = factory(replays).createDecoder(client());
        decoder.decode(signed(key, builder -> builder.issueTime(Date.from(NOW.minusSeconds(60)))
                .expirationTime(Date.from(NOW.minusSeconds(29)))));
        decoder.decode(signed(key, builder -> builder.issueTime(null)));
        assertThatThrownBy(() -> decoder.decode(signed(key, builder -> builder.issueTime(null)
                .expirationTime(Date.from(NOW.plusSeconds(331)))))).isInstanceOf(JwtException.class);
        assertThat(replays).hasValue(2);
    }

    private static OpenAiDeClientAssertionDecoderFactory factory(AtomicInteger replays) {
        return new OpenAiDeClientAssertionDecoderFactory(properties(), jwt -> {
            replays.incrementAndGet(); return OAuth2TokenValidatorResult.success();
        }, uri -> new OpenAiDeCimdMetadataValidator.MetadataResponse(uri, uri, 200, "application/json",
                new JWKSet(key.toPublicJWK()).toString().getBytes(StandardCharsets.UTF_8)),
                Clock.fixed(NOW, ZoneOffset.UTC));
    }

    static OpenAiDeProperties properties() {
        var properties = new OpenAiDeProperties();
        properties.getOauth().setClientId(CLIENT);
        properties.getOauth().setClientJwkSetUri(JWKS);
        properties.getOauth().setClientAssertionAudience(AUDIENCE);
        return properties;
    }

    static RegisteredClient client() {
        return RegisteredClient.withId("test-client").clientId(CLIENT)
                .clientAuthenticationMethod(ClientAuthenticationMethod.PRIVATE_KEY_JWT)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .redirectUri("https://chatgpt.com/connector/oauth/test")
                .clientSettings(ClientSettings.builder().jwkSetUrl(JWKS)
                        .tokenEndpointAuthenticationSigningAlgorithm(SignatureAlgorithm.RS256).build()).build();
    }

    static JWTClaimsSet.Builder claims() {
        return new JWTClaimsSet.Builder().issuer(CLIENT).subject(CLIENT).audience(AUDIENCE)
                .issueTime(Date.from(NOW)).expirationTime(Date.from(NOW.plusSeconds(60))).jwtID("test-jti");
    }

    static String signed(RSAKey signingKey, Consumer<JWTClaimsSet.Builder> customize) throws Exception {
        var claims = claims(); customize.accept(claims);
        var jwt = new SignedJWT(new JWSHeader.Builder(JWSAlgorithm.RS256).type(JOSEObjectType.JWT)
                .keyID(signingKey.getKeyID()).build(), claims.build());
        jwt.sign(new RSASSASigner(signingKey));
        return jwt.serialize();
    }
}
