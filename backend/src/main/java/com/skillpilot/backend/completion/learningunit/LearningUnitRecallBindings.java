package com.skillpilot.backend.completion.learningunit;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.completion.CompletionCompilationException;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.service.SrsGoalCardSelection;
import java.io.IOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.TreeMap;

/** Exact immutable recall duties; deck presentation metadata is not a card outcome. */
public final class LearningUnitRecallBindings {
    public static final String SEMANTICS = "verified-recall-selection-v1";
    private static final Set<String> LOCALES = Set.of("de", "en");

    private LearningUnitRecallBindings() { }

    public record Selection(int schemaVersion, String semantics, String goalId, String locale,
                            String deckId, String sourcePath, String deckPath, String deckSha256,
                            List<String> filterTags, List<String> requiredCardIds, String reviewRef) {
        public Selection {
            filterTags = filterTags == null ? List.of() : List.copyOf(filterTags);
            requiredCardIds = requiredCardIds == null ? List.of() : List.copyOf(requiredCardIds);
        }
    }

    public record CardMeaning(String front, String back) { }

    public record FrozenRecall(String goalId, String deckId, Set<String> requiredCardIds,
                               Map<String, Selection> selections,
                               Map<String, Map<String, CardMeaning>> cardMeaningsByLocale) {
        public FrozenRecall {
            requiredCardIds = Set.copyOf(requiredCardIds);
            selections = Map.copyOf(selections);
            Map<String, Map<String, CardMeaning>> meanings = new TreeMap<>();
            cardMeaningsByLocale.forEach((locale, cards) -> meanings.put(locale, Map.copyOf(cards)));
            cardMeaningsByLocale = Map.copyOf(meanings);
        }

        public boolean sameOutcomeMeaning(FrozenRecall other) {
            return goalId.equals(other.goalId) && deckId.equals(other.deckId)
                    && requiredCardIds.equals(other.requiredCardIds)
                    && cardMeaningsByLocale.equals(other.cardMeaningsByLocale);
        }
    }

    @FunctionalInterface public interface ActiveValidator { void validate(FrozenRecall recall) throws Exception; }
    @FunctionalInterface public interface DeckSource { byte[] read(String goalId, String sourcePath) throws Exception; }

    public static Map<String, FrozenRecall> validateFrozen(LearningUnitDefinition definition,
            Map<String, LearningGoal> goals, Map<String, List<String>> recallInputs,
            Map<String, byte[]> inputs, ObjectMapper strict) throws IOException {
        if (!recallInputs.keySet().equals(Set.copyOf(definition.ownRecallGoalIds()))) {
            fail("INVALID_RECALL_BINDING", "Every own recall duty needs its exact frozen selection");
        }
        Map<String, FrozenRecall> result = new LinkedHashMap<>();
        for (String goalId : definition.ownRecallGoalIds()) {
            LearningGoal goal = goals.get(goalId);
            String deckId = deckId(goal);
            Map<String, Selection> selections = new TreeMap<>();
            Map<String, Map<String, CardMeaning>> meanings = new TreeMap<>();
            Set<String> requiredIds = null;
            for (String path : recallInputs.get(goalId)) {
                Selection selection = strict.readValue(requireInput(inputs, path), Selection.class);
                if (selection.schemaVersion() != 1 || !SEMANTICS.equals(selection.semantics())
                        || !goalId.equals(selection.goalId()) || !LOCALES.contains(selection.locale())
                        || !deckId.equals(selection.deckId())
                        || !Objects.equals(SrsGoalCardSelection.vocabularySource(goal, selection.locale()), selection.sourcePath())
                        || !unique(selection.filterTags()).equals(Set.copyOf(SrsGoalCardSelection.filterTags(goal)))
                        || selections.putIfAbsent(selection.locale(), selection) != null) {
                    fail("INVALID_RECALL_BINDING", "Selection does not bind this actual source goal and locale: " + goalId);
                }
                byte[] deck = requireInput(inputs, selection.deckPath());
                if (!rawDigest(deck).equals(selection.deckSha256())) fail("INVALID_RECALL_BINDING", "Frozen deck bytes differ: " + goalId);
                requireInput(inputs, LearningUnitCatalog.reviewPath(selection.reviewRef()));
                Map<String, CardMeaning> cards = selectedCards(goal, deck, deckId, strict);
                Set<String> stated = unique(selection.requiredCardIds());
                if (stated.isEmpty() || !stated.equals(cards.keySet())) {
                    fail("RECALL_SELECTION_CONFLICT", "Reviewed stable card IDs differ from the actual SRS selection: " + goalId);
                }
                if (requiredIds != null && !requiredIds.equals(stated)) {
                    fail("RECALL_SELECTION_CONFLICT", "DE/EN recall must name the same logical card identities: " + goalId);
                }
                requiredIds = stated;
                meanings.put(selection.locale(), cards);
            }
            if (!selections.keySet().equals(LOCALES)) {
                fail("INVALID_RECALL_BINDING", "Both served DE/EN recall sources, including fallback, need reviewed bindings: " + goalId);
            }
            result.put(goalId, new FrozenRecall(goalId, deckId, requiredIds, selections, meanings));
        }
        return result;
    }

    /** Resolves the actual installed source; locators may be rewritten by the package adapter. */
    public static void validateActive(FrozenRecall frozen, LearningGoal goal, DeckSource decks,
                                      ObjectMapper mapper) throws Exception {
        if (goal == null || !frozen.goalId().equals(goal.getId()) || !frozen.deckId().equals(deckId(goal))) {
            fail("RECALL_SELECTION_CONFLICT", "Active memory goal has a different deck identity");
        }
        for (String locale : LOCALES) {
            String source = SrsGoalCardSelection.vocabularySource(goal, locale);
            byte[] deck = source == null ? null : decks.read(goal.getId(), source);
            if (deck == null || !selectedCards(goal, deck, frozen.deckId(), mapper)
                    .equals(frozen.cardMeaningsByLocale().get(locale))) {
                fail("RECALL_SELECTION_CONFLICT", "Active deck/card meaning differs from immutable recall duty: " + goal.getId());
            }
        }
    }

    private static Map<String, CardMeaning> selectedCards(LearningGoal goal, byte[] bytes, String deckId,
                                                          ObjectMapper mapper) throws IOException {
        JsonNode deck = mapper.readTree(bytes);
        if (!deck.isObject() || !deckId.equals(deck.path("deckId").asText()) || !deck.path("cards").isArray()) {
            fail("INVALID_RECALL_BINDING", "Deck identity/card list is missing or different");
        }
        Map<String, Card> cards = new LinkedHashMap<>();
        for (JsonNode raw : deck.path("cards")) {
            String id = raw.path("id").isTextual() ? raw.path("id").textValue() : null;
            String front = raw.path("front").isTextual() ? raw.path("front").textValue() : null;
            String back = raw.path("back").isTextual() ? raw.path("back").textValue() : null;
            List<String> tags = new java.util.ArrayList<>();
            if (raw.path("tags").isArray()) for (JsonNode tag : raw.path("tags")) if (!tag.isNull()) tags.add(tag.asText());
            if (!text(id) || !text(front) || !text(back)
                    || cards.putIfAbsent(id, new Card(id, front, back, tags)) != null) {
                fail("INVALID_RECALL_BINDING", "Frozen deck has invalid or duplicated stable cards");
            }
        }
        Map<String, CardMeaning> selected = new TreeMap<>();
        for (Card card : SrsGoalCardSelection.select(goal, List.copyOf(cards.values()), Card::tags)) {
            selected.put(card.id(), new CardMeaning(card.front(), card.back()));
        }
        return Map.copyOf(selected);
    }

    private static String deckId(LearningGoal goal) {
        List<String> tags = goal == null || goal.getTags() == null ? List.of() : goal.getTags().stream()
                .filter(tag -> tag != null && tag.startsWith("srs-deck:")).toList();
        if (tags.size() != 1 || tags.getFirst().length() == "srs-deck:".length()) {
            fail("INVALID_RECALL_BINDING", "Memory goal needs exactly one declared deck identity");
        }
        return tags.getFirst().substring("srs-deck:".length());
    }

    private static Set<String> unique(List<String> values) {
        Set<String> result = new java.util.HashSet<>();
        for (String value : values) if (!text(value) || !result.add(value)) fail("INVALID_RECALL_BINDING", "Blank or duplicate selection identity");
        return Set.copyOf(result);
    }
    private static byte[] requireInput(Map<String, byte[]> inputs, String path) {
        LearningUnitCatalog.checkedPath(path);
        byte[] bytes = inputs.get(path);
        if (bytes == null) fail("INVALID_RECALL_BINDING", "Recall input is not pinned: " + path);
        return bytes;
    }
    private static String rawDigest(byte[] bytes) {
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes)); }
        catch (NoSuchAlgorithmException impossible) { throw new IllegalStateException(impossible); }
    }
    private static boolean text(String value) { return value != null && !value.isBlank(); }
    private static void fail(String code, String detail) { throw new CompletionCompilationException(code, detail); }
    private record Card(String id, String front, String back, List<String> tags) { }
}
