package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.landscape.LandscapeProperties;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.service.srs.SrsCard;
import com.skillpilot.backend.service.srs.SrsCardStateStore;
import com.skillpilot.backend.service.srs.SrsCardStateSummary;
import com.skillpilot.backend.service.srs.SrsStateUnavailableException;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;
import org.springframework.test.util.ReflectionTestUtils;

/** Observes which verified card results the native deck mastery check actually requires. */
final class LearnerDeckParity {
    private static final String LEARNER = "role-boundary-learner";
    private static final SrsCardStateSummary PASSED =
            new SrsCardStateSummary("passed", Instant.parse("2026-11-26T00:00:00Z"), null, 0);
    private final Map<String, String> expected;
    private final DeckResourceService resources;
    private int checked;
    private int unavailable;

    LearnerDeckParity() throws IOException {
        // Independent baseline: sorted ID sets from canonical source decks, applying each goal's tag
        // selection. Three candidate sources and five economics filenames cannot be opened by the
        // repository deck resolver. Keep that observed outcome separate from a counted set of zero.
        expected = new ObjectMapper().readValue(getClass().getResource("/learner-scope/vr1-counted-deck-cards.json"),
                new TypeReference<Map<String, String>>() {});
        var properties = new LandscapeProperties();
        properties.setDirectory("../curricula/DE/Gymnasium/memory-decks");
        resources = new DeckResourceService(properties);
    }

    void check(String viewId, LearnerService service, Map<String, LearningGoal> visible) throws Exception {
        ReflectionTestUtils.setField(service, "deckResourceService", resources);
        var store = mock(SrsCardStateStore.class);
        ReflectionTestUtils.setField(service, "cardStateStore", store);
        Map<String, SrsCardStateStore.NodeSummary> summaries = new HashMap<>();
        when(store.summaries(eq(LEARNER), anyCollection())).thenReturn(summaries);
        List<LearningGoal> decks = new ArrayList<>();
        Map<String, VerifiedCards> evidence = new HashMap<>();
        for (var goal : visible.values()) {
            if (goal.getExtendedData() == null || !goal.getExtendedData().containsKey("vocabularySource")) continue;
            String id = goal.getId();
            assertThat(expected).as("deck in %s", viewId).containsKey(id);
            if ("unavailable".equals(expected.get(id))) {
                assertThatThrownBy(() -> service.resolveSrsMasterySnapshot(LEARNER, List.of(goal)))
                        .as("unavailable deck %s in %s", id, viewId)
                        .isInstanceOf(SrsStateUnavailableException.class)
                        .hasMessageContaining("deck is unavailable");
                unavailable++;
                continue;
            }
            String source = (String) goal.getExtendedData().get("vocabularySource");
            assertThat(resources.resolveDeckResource(id, source)).as("runtime deck %s for %s in %s", source, id, viewId)
                    .isNotNull();
            List<SrsCard> selected;
            try {
                selected = ReflectionTestUtils.invokeMethod(service, "requireDeckGoalCards", goal, "de");
            } catch (RuntimeException error) {
                throw new AssertionError("Cannot read selected cards for " + id + " in " + viewId + " from " + source, error);
            }
            var cards = new VerifiedCards();
            selected.forEach(card -> cards.put(card.id(), PASSED));
            evidence.put(id, cards);
            summaries.put(id, new SrsCardStateStore.NodeSummary(null, cards));
            decks.add(goal);
        }
        var mastery = service.resolveSrsMasterySnapshot(LEARNER, decks);
        assertThat(mastery.keySet()).as("mastery inputs for %s", viewId).isEqualTo(evidence.keySet());
        for (var entry : evidence.entrySet()) {
            String id = entry.getKey();
            assertThat(mastery.get(id)).as("all counted cards verified for %s in %s", id, viewId).isTrue();
            String ids = String.join("\n", entry.getValue().readIds);
            String digest = HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(ids.getBytes(StandardCharsets.UTF_8)));
            assertThat(digest).as("counted card IDs for %s in %s", id, viewId).isEqualTo(expected.get(id));
            checked++;
        }
    }

    void report() {
        assertThat(checked).isPositive();
        System.out.printf("Checked counted card IDs in %d deck/view combinations; %d have unavailable sources.%n",
                checked, unavailable);
    }

    private static final class VerifiedCards extends HashMap<String, SrsCardStateSummary> {
        private final Set<String> readIds = new TreeSet<>();

        @Override
        public SrsCardStateSummary get(Object key) {
            readIds.add((String) key);
            return super.get(key);
        }
    }
}
