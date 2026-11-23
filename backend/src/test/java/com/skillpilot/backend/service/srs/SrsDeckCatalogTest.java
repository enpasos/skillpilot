package com.skillpilot.backend.service.srs;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.service.DeckResourceService;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.AbstractResource;

/** The shared deck catalog parses each runtime-generation deck once and never serves a changed file stale. */
class SrsDeckCatalogTest {

    private static final String DECK = "{\"cards\":[{\"id\":\"a\",\"front\":\"F\",\"back\":\"B\"}]}";

    /** A development deck file whose bytes may change between requests. */
    private static final class MutableDeck extends AbstractResource {
        private final AtomicInteger reads = new AtomicInteger();
        private volatile String content;

        MutableDeck(String content) {
            this.content = content;
        }

        @Override
        public String getDescription() {
            return "development deck";
        }

        @Override
        public boolean exists() {
            return true;
        }

        @Override
        public InputStream getInputStream() {
            reads.incrementAndGet();
            return new ByteArrayInputStream(content.getBytes(StandardCharsets.UTF_8));
        }
    }

    @Test
    void anImmutableGenerationDeckIsParsedOnceForAllRequests() {
        SrsDeckCatalog catalog = new SrsDeckCatalog(new ObjectMapper());
        var first = new DeckResourceService.ImmutableDeckResource("pinned:deck.json",
                DECK.getBytes(StandardCharsets.UTF_8), "pinned", "deck.json");
        var second = new DeckResourceService.ImmutableDeckResource("pinned:deck.json",
                DECK.getBytes(StandardCharsets.UTF_8), "pinned", "deck.json");
        SrsDeck parsed = catalog.deck(first, new HashMap<>());
        assertThat(catalog.deck(second, new HashMap<>())).isSameAs(parsed);
        assertThat(parsed.cards(true)).extracting(SrsCard::id).containsExactly("a");
    }

    @Test
    void aDevelopmentDeckIsReadPerRequestButParsedOnlyWhenItsContentChanges() {
        SrsDeckCatalog catalog = new SrsDeckCatalog(new ObjectMapper());
        MutableDeck file = new MutableDeck(DECK);
        var callLocal = new HashMap<org.springframework.core.io.Resource, SrsDeck>();
        SrsDeck first = catalog.deck(file, callLocal);
        assertThat(catalog.deck(file, callLocal)).isSameAs(first);
        assertThat(file.reads.get()).as("one read per request").isOne();
        assertThat(catalog.deck(file, new HashMap<>())).isSameAs(first);
        assertThat(file.reads.get()).isEqualTo(2);

        file.content = "{\"cards\":[{\"id\":\"b\",\"front\":\"F\",\"back\":\"B\"}]}";
        SrsDeck changed = catalog.deck(file, new HashMap<>());
        assertThat(changed).isNotSameAs(first);
        assertThat(changed.cards(true)).extracting(SrsCard::id).containsExactly("b");
        assertThat(catalog.deck(null, null).cards(false)).isEmpty();
    }
}
