package com.skillpilot.backend.service;

import com.skillpilot.backend.landscape.LearningGoal;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;

/** The existing SRS source fallback and OR-tag selection, shared by runtime and static admission. */
public final class SrsGoalCardSelection {
    private static final Set<String> FILTER_EXCLUDE = Set.of(
            "structure", "root", "module", "lesson", "vocabulary", "grammar", "practice",
            "A1", "A2", "B1", "B2", "C1", "C2");

    private SrsGoalCardSelection() { }

    public static String vocabularySource(LearningGoal goal, String language) {
        Map<String, Object> extended = goal == null ? null : goal.getExtendedData();
        if (extended == null) return null;
        Object source = extended.get("vocabularySource");
        Object sourceEn = extended.get("vocabularySourceEn");
        boolean english = language != null && language.trim().toLowerCase(Locale.ROOT).startsWith("en");
        Object preferred = english ? sourceEn : source;
        Object fallback = english ? source : sourceEn;
        if (preferred instanceof String text && !text.isBlank()) return text;
        return fallback instanceof String text && !text.isBlank() ? text : null;
    }

    public static List<String> filterTags(LearningGoal goal) {
        List<String> tags = goal == null ? null : goal.getTags();
        if (tags == null || tags.isEmpty()) return List.of();
        List<String> selected = tags.stream().filter(tag -> tag != null && tag.startsWith("select:")).toList();
        if (!selected.isEmpty()) return selected;
        List<String> filtered = new ArrayList<>();
        for (String tag : tags) {
            if (tag != null && !tag.startsWith("srs-deck") && !FILTER_EXCLUDE.contains(tag)) filtered.add(tag);
        }
        return List.copyOf(filtered);
    }

    public static <T> List<T> select(LearningGoal goal, List<T> cards, Function<T, List<String>> tags) {
        if (cards == null || cards.isEmpty()) return List.of();
        List<String> filters = filterTags(goal);
        if (filters.isEmpty()) return cards;
        return cards.stream().filter(card -> tags.apply(card) != null
                && tags.apply(card).stream().anyMatch(filters::contains)).toList();
    }
}
