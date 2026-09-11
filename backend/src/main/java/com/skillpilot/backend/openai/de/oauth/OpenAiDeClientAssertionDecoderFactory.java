package com.skillpilot.backend.openai.de.oauth;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.proc.JWSVerificationKeySelector;
import com.nimbusds.jose.proc.SecurityContext;
import com.nimbusds.jwt.proc.DefaultJWTProcessor;
import com.skillpilot.backend.openai.de.OpenAiDeProperties;
import java.net.URI;
import java.time.Clock;
import java.util.Set;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.BadJwtException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtDecoderFactory;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.MappedJwtClaimSetConverter;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;

final class OpenAiDeClientAssertionDecoderFactory implements JwtDecoderFactory<RegisteredClient> {
    private final OpenAiDeProperties properties;
    private final NimbusJwtDecoder decoder;

    OpenAiDeClientAssertionDecoderFactory(OpenAiDeProperties properties,
            OAuth2TokenValidator<Jwt> replayValidator,
            OpenAiDeCimdMetadataValidator.MetadataRetriever retriever, Clock clock) {
        this.properties = properties;
        var processor = new DefaultJWTProcessor<SecurityContext>();
        processor.setJWSKeySelector(new JWSVerificationKeySelector<>(JWSAlgorithm.RS256,
                new OpenAiDePinnedJwkSource(URI.create(properties.getOauth().getClientJwkSetUri()), retriever, clock)));
        // Spring validator below owns all claim validation, with the same skew as replay retention.
        processor.setJWTClaimsSetVerifier((claims, context) -> {});
        decoder = new NimbusJwtDecoder(processor);
        var claimConverter = MappedJwtClaimSetConverter.withDefaults(java.util.Map.of());
        decoder.setClaimSetConverter(claims -> {
            var converted = claimConverter.convert(claims);
            // Spring otherwise invents iat=exp-1s. A missing optional issued-at
            // must not turn into a future assertion claim or alter lifetime checks.
            if (claims.get("iat") == null) {
                converted.remove("iat");
            }
            return converted;
        });
        var claimsValidator = new OpenAiDeClientAssertionClaimsValidator(properties, clock);
        decoder.setJwtValidator(jwt -> {
            var result = claimsValidator.validate(jwt);
            return result.hasErrors() ? result : replayValidator.validate(jwt);
        });
    }

    @Override
    public JwtDecoder createDecoder(RegisteredClient client) {
        if (!properties.getOauth().getClientId().equals(client.getClientId())
                || !Set.of(ClientAuthenticationMethod.PRIVATE_KEY_JWT).equals(client.getClientAuthenticationMethods())
                || client.getClientSecret() != null
                || !properties.getOauth().getClientJwkSetUri().equals(client.getClientSettings().getJwkSetUrl())
                || !SignatureAlgorithm.RS256.equals(client.getClientSettings().getTokenEndpointAuthenticationSigningAlgorithm())) {
            throw new BadJwtException("OpenAI client registration does not match the pinned authentication policy.");
        }
        return decoder;
    }
}
