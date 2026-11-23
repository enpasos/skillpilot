package com.skillpilot.backend.service.srs;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.service.DeckResourceService;
import java.io.InputStream;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.core.io.Resource;

/**
 * Parsed decks shared by all learners.
 *
 * <p>A deck whose bytes are fixed for the runtime generation (a pinned
 * repository generation or an installed package) is parsed once per identity
 * and never read again. Any other resource, notably a deck file in repository
 * development mode, is read on every call and parsed only when its content
 * hash is new, so a changed file is never served stale.</p>
 */
public final class SrsDeckCatalog {

    private static final int CONTENT_CACHE_LIMIT = 256;

    private final ObjectMapper mapper;
    private final Map<String, SrsDeck> byIdentity = new ConcurrentHashMap<>();
    private final Map<String, SrsDeck> byContent = new LinkedHashMap<>(64, 0.75f, true) {
        @Override
        protected boolean removeEldestEntry(Map.Entry<String, SrsDeck> eldest) {
            return size() > CONTENT_CACHE_LIMIT;
        }
    };

    public SrsDeckCatalog(ObjectMapper mapper) {
        this.mapper = Objects.requireNonNull(mapper, "mapper");
    }

    /**
     * Returns the parsed deck of an already resolved resource. A {@code null}
     * resource or one that does not exist is the missing deck. The optional
     * call-local map keeps one deck per resource within a single request.
     */
    public SrsDeck deck(Resource resource, Map<Resource, SrsDeck> callLocal) {
        if (resource == null) {
            return SrsDeck.missing();
        }
        if (callLocal != null) {
            SrsDeck known = callLocal.get(resource);
            if (known != null) {
                return known;
            }
        }
        SrsDeck deck = load(resource);
        if (callLocal != null) {
            callLocal.put(resource, deck);
        }
        return deck;
    }

    private SrsDeck load(Resource resource) {
        if (resource instanceof DeckResourceService.ImmutableDeckResource immutable) {
            SrsDeck cached = byIdentity.get(immutable.identity());
            if (cached != null) {
                return cached;
            }
            byte[] bytes;
            try {
                bytes = immutable.bytes();
            } catch (Exception error) {
                return SrsDeck.unreadable(error);
            }
            SrsDeck parsed = SrsDeck.parse(bytes, mapper);
            SrsDeck previous = byIdentity.putIfAbsent(immutable.identity(), parsed);
            return previous != null ? previous : parsed;
        }
        if (!resource.exists()) {
            return SrsDeck.missing();
        }
        byte[] bytes;
        try (InputStream input = resource.getInputStream()) {
            bytes = input.readAllBytes();
        } catch (Exception error) {
            return SrsDeck.unreadable(error);
        }
        String digest = sha256(bytes);
        synchronized (byContent) {
            SrsDeck cached = byContent.get(digest);
            if (cached != null) {
                return cached;
            }
        }
        SrsDeck parsed = SrsDeck.parse(bytes, mapper);
        synchronized (byContent) {
            SrsDeck previous = byContent.putIfAbsent(digest, parsed);
            return previous != null ? previous : parsed;
        }
    }

    private static String sha256(byte[] bytes) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes));
        } catch (java.security.NoSuchAlgorithmException impossible) {
            throw new IllegalStateException("SHA-256 is unavailable", impossible);
        }
    }
}
