package com.skillpilot.backend.service.srs;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * One parsed, immutable deck shared by all learners.
 *
 * <p>The deck keeps the tolerant card list (invalid entries skipped, duplicates
 * kept) and, separately, the first defect a strict reader must report. Both are
 * derived from one parse with the exact rules of the former per-request reader,
 * so strict completion reads still fail closed and normal projections still
 * see the tolerant list.</p>
 */
public final class SrsDeck {

    private static final String GOAL_TAG_PREFIX = "goal:";
    private static final SrsDeck MISSING = new SrsDeck(List.of(),
            new Failure("Required memorization deck is missing", null));

    /** Message and cause of the first defect, re-thrown as a fresh exception per strict read. */
    private record Failure(String message, Throwable cause) { }

    private final List<SrsCard> cards;
    private final Failure strictFailure;
    private final Map<String, List<SrsCard>> cardsByUnderstandingGoal;
    private final Map<String, Integer> positions;
    private final Map<List<String>, List<SrsCard>> selections = new ConcurrentHashMap<>();

    private SrsDeck(List<SrsCard> cards, Failure strictFailure) {
        this.cards = List.copyOf(cards);
        this.strictFailure = strictFailure;
        Map<String, List<SrsCard>> byGoal = new LinkedHashMap<>();
        Map<String, Integer> firstPositions = new LinkedHashMap<>();
        for (int index = 0; index < this.cards.size(); index++) {
            SrsCard card = this.cards.get(index);
            firstPositions.putIfAbsent(card.id(), index);
            for (String goalId : card.understandingGoalIds()) {
                byGoal.computeIfAbsent(goalId, ignored -> new ArrayList<>()).add(card);
            }
        }
        Map<String, List<SrsCard>> frozen = new LinkedHashMap<>();
        byGoal.forEach((goalId, list) -> frozen.put(goalId, List.copyOf(list)));
        this.cardsByUnderstandingGoal = Collections.unmodifiableMap(frozen);
        this.positions = Collections.unmodifiableMap(firstPositions);
    }

    public static SrsDeck missing() {
        return MISSING;
    }

    /** A deck whose bytes could not be read; strict readers see the former "invalid" failure. */
    public static SrsDeck unreadable(Throwable cause) {
        return new SrsDeck(List.of(), new Failure("Required memorization deck is invalid", cause));
    }

    /** Cards as the former reader returned them; a strict read throws the deck's first defect. */
    public List<SrsCard> cards(boolean strict) {
        if (strict && strictFailure != null) {
            throw new SrsStateUnavailableException(strictFailure.message(), strictFailure.cause());
        }
        return cards;
    }

    /**
     * The cards a goal selects through its filter tags (any match), in deck order.
     * An empty filter selects the whole tolerant card list. Results are memoized
     * per filter, because filters belong to goals of the same runtime generation.
     */
    public List<SrsCard> select(List<String> filterTags) {
        if (filterTags == null || filterTags.isEmpty()) {
            return cards;
        }
        return selections.computeIfAbsent(List.copyOf(filterTags), filter -> cards.stream()
                .filter(card -> card.tags() != null && card.tags().stream().anyMatch(filter::contains))
                .toList());
    }

    /** All cards with at least one of the given understanding goals, in deck order and without repetition. */
    public List<SrsCard> cardsForUnderstandingGoals(Collection<String> goalIds) {
        if (goalIds == null || goalIds.isEmpty() || cardsByUnderstandingGoal.isEmpty()) {
            return List.of();
        }
        Set<SrsCard> matched = Collections.newSetFromMap(new java.util.IdentityHashMap<>());
        for (String goalId : goalIds) {
            matched.addAll(cardsByUnderstandingGoal.getOrDefault(goalId, List.of()));
        }
        if (matched.isEmpty()) {
            return List.of();
        }
        return cards.stream().filter(matched::contains).toList();
    }

    /** Position of the first card with this identifier, or -1. */
    public int position(String cardId) {
        Integer position = cardId == null ? null : positions.get(cardId);
        return position == null ? -1 : position;
    }

    /** Parses deck bytes once with both the strict and the tolerant rules. */
    public static SrsDeck parse(byte[] bytes, ObjectMapper mapper) {
        Map<String, Object> data;
        try {
            data = mapper.readValue(bytes, new TypeReference<Map<String, Object>>() { });
        } catch (Exception error) {
            return unreadable(error);
        }
        Object cardsObj = data == null ? null : data.get("cards");
        if (!(cardsObj instanceof List<?> rawCards)) {
            return invalid(List.of(), "Required memorization deck has no card list");
        }
        List<SrsCard> cards = new ArrayList<>();
        Set<String> identifiers = new HashSet<>();
        String firstDefect = null;
        for (Object raw : rawCards) {
            if (!(raw instanceof Map<?, ?> cardMap)) {
                firstDefect = firstDefect != null ? firstDefect : "Required memorization card is invalid";
                continue;
            }
            Object idObj = cardMap.get("id");
            if (idObj == null || String.valueOf(idObj).isBlank()) {
                firstDefect = firstDefect != null ? firstDefect : "Required memorization card identifier is missing";
                continue;
            }
            String id = String.valueOf(idObj);
            if (!identifiers.add(id)) {
                firstDefect = firstDefect != null ? firstDefect : "Required memorization card identifier is duplicated";
            }
            String front = stringValue(cardMap.get("front"));
            String back = stringValue(cardMap.get("back"));
            if (front == null || front.isBlank() || back == null || back.isBlank()) {
                firstDefect = firstDefect != null ? firstDefect : "Required memorization card content is missing";
            }
            List<String> tags = null;
            if (cardMap.get("tags") instanceof List<?> tagList) {
                List<String> collected = new ArrayList<>();
                for (Object tag : tagList) {
                    if (tag != null) {
                        collected.add(String.valueOf(tag));
                    }
                }
                tags = collected;
            }
            List<String> understanding;
            if (cardMap.containsKey("originGoalIds")) {
                understanding = originGoalIds(cardMap.get("originGoalIds"));
                if (understanding == null) {
                    firstDefect = firstDefect != null ? firstDefect : "Required memorization card origin goals are invalid";
                    understanding = goalTags(tags);
                }
            } else {
                understanding = goalTags(tags);
            }
            cards.add(new SrsCard(id, front, back, stringValue(cardMap.get("category")), tags, understanding));
        }
        return firstDefect == null ? new SrsDeck(cards, null) : invalid(cards, firstDefect);
    }

    private static SrsDeck invalid(List<SrsCard> tolerantCards, String defect) {
        // The former strict reader threw the defect inside its parse block, which
        // reported it as an invalid deck with the defect as cause.
        return new SrsDeck(tolerantCards, new Failure("Required memorization deck is invalid",
                new SrsStateUnavailableException(defect)));
    }

    /** The authored origin goals, or {@code null} when the field is not a list of identifiers. */
    private static List<String> originGoalIds(Object raw) {
        if (!(raw instanceof List<?> values)) {
            return null;
        }
        LinkedHashSet<String> goals = new LinkedHashSet<>();
        for (Object value : values) {
            if (!(value instanceof String text) || text.isBlank()) {
                return null;
            }
            goals.add(text.trim());
        }
        return List.copyOf(goals);
    }

    private static List<String> goalTags(List<String> tags) {
        if (tags == null || tags.isEmpty()) {
            return List.of();
        }
        LinkedHashSet<String> goals = new LinkedHashSet<>();
        for (String tag : tags) {
            if (tag.startsWith(GOAL_TAG_PREFIX) && tag.length() > GOAL_TAG_PREFIX.length()) {
                String goalId = tag.substring(GOAL_TAG_PREFIX.length()).trim();
                if (!goalId.isEmpty()) {
                    goals.add(goalId);
                }
            }
        }
        return List.copyOf(goals);
    }

    private static String stringValue(Object value) {
        return value instanceof String text ? text : null;
    }
}
