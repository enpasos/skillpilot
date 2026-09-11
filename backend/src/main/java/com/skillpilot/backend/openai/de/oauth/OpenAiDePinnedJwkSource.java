package com.skillpilot.backend.openai.de.oauth;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.KeySourceException;
import com.nimbusds.jose.jwk.JWK;
import com.nimbusds.jose.jwk.JWKSelector;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.KeyOperation;
import com.nimbusds.jose.jwk.KeyUse;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/** Bounded cache with one refresh opportunity per interval, including unknown-kid misses. */
final class OpenAiDePinnedJwkSource implements JWKSource<SecurityContext> {
    static final Duration CACHE_TTL = Duration.ofMinutes(5);
    static final Duration MIN_REFRESH_INTERVAL = Duration.ofSeconds(5);
    private final URI pinnedUri;
    private final OpenAiDeCimdMetadataValidator.MetadataRetriever retriever;
    private final Clock clock;
    private JWKSet cached;
    private Instant fetchedAt;
    private Instant attemptedAt;

    OpenAiDePinnedJwkSource(URI pinnedUri,
            OpenAiDeCimdMetadataValidator.MetadataRetriever retriever, Clock clock) {
        this.pinnedUri = pinnedUri;
        this.retriever = retriever;
        this.clock = clock;
    }

    @Override
    public synchronized List<JWK> get(JWKSelector selector, SecurityContext context) throws KeySourceException {
        Instant now = clock.instant();
        boolean fresh = cached != null && now.isBefore(fetchedAt.plus(CACHE_TTL));
        List<JWK> matches = fresh ? selector.select(cached) : List.of();
        if (!matches.isEmpty()) {
            return matches;
        }
        if (attemptedAt != null && now.isBefore(attemptedAt.plus(MIN_REFRESH_INTERVAL))) {
            if (!fresh) {
                throw new KeySourceException("Pinned OpenAI key set is unavailable or expired.");
            }
            return List.of();
        }
        attemptedAt = now;
        try {
            var response = retriever.retrieve(pinnedUri);
            OpenAiDeCimdMetadataValidator.validateResponse(pinnedUri, response);
            JWKSet refreshed = JWKSet.parse(new String(response.body(), StandardCharsets.UTF_8));
            validateKeySet(refreshed);
            cached = refreshed;
            fetchedAt = now;
            return selector.select(refreshed);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new KeySourceException("Pinned OpenAI key set retrieval interrupted.", exception);
        } catch (Exception exception) {
            throw new KeySourceException("Pinned OpenAI key set could not be validated.", exception);
        }
    }

    private static void validateKeySet(JWKSet keySet) {
        if (keySet.getKeys().isEmpty() || keySet.getKeys().size() > 64) {
            throw new IllegalStateException("OpenAI key set must contain between 1 and 64 keys.");
        }
        Set<String> ids = new HashSet<>();
        for (JWK key : keySet.getKeys()) {
            if (key.getKeyID() == null || key.getKeyID().isBlank() || key.getKeyID().length() > 256
                    || !ids.add(key.getKeyID()) || key.isPrivate()
                    || !(key instanceof RSAKey rsa) || rsa.size() < 2048
                    || (key.getAlgorithm() != null && !JWSAlgorithm.RS256.equals(key.getAlgorithm()))
                    || (key.getKeyUse() != null && !KeyUse.SIGNATURE.equals(key.getKeyUse()))
                    || (key.getKeyOperations() != null
                        && !Set.of(KeyOperation.VERIFY).equals(key.getKeyOperations()))) {
                throw new IllegalStateException("OpenAI key set must contain uniquely identified public RS256 signing keys.");
            }
        }
    }
}
