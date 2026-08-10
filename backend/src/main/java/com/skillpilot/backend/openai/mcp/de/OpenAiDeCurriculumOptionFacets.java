package com.skillpilot.backend.openai.mcp.de;

import com.skillpilot.backend.landscape.LandscapeSummary;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/**
 * Stable OpenAI projection of the curriculum filters used by the SessionSetup web UI.
 *
 * <p>The values are presentation metadata only. They never expand or replace the
 * server-authoritative curriculum options published by the learner state machine.</p>
 */
final class OpenAiDeCurriculumOptionFacets {

    static final String CANONICAL_GYMNASIUM_ROOT_ID = "a0e13c56-c25f-4742-9272-3a1a603ee52e";

    private static final Set<String> GREEN_CURRICULUM_IDS = Set.of(
            CANONICAL_GYMNASIUM_ROOT_ID,
            "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced",
            "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a");

    private static final Set<String> ORANGE_CURRICULUM_IDS = Set.of(
            "08a43a1b-d97e-522c-9dfa-c950a493364e",
            "c436b994-8f44-5134-b9f8-0c9f5d6a5ba0",
            "67bd301b-e11a-582d-94ba-4f4b1a4cefff",
            "92406d94-e3c1-58ec-b7c6-12122278d25a",
            "7d51b38c-a149-5407-bddc-d2ce7878b020",
            "668cf206-941e-51f8-8704-3e8938631235",
            "51b60137-46e8-5498-973e-ea38bb32f327",
            "605bdaf6-32d5-56fd-8d92-5a80c2fd2901");

    private static final List<String> SCHOOL_TYPES = List.of(
            "GRUNDSCHULE",
            "MITTELSCHULE",
            "REALSCHULE",
            "GYMNASIUM",
            "FOS",
            "BOS",
            "WIRTSCHAFTSSCHULE",
            "BERUFSOBERSCHULE",
            "FACHOBERSCHULE",
            "GYM",
            "GESAMT",
            "PROGRAMM");

    private static final List<String> UNIVERSITY_MARKERS = List.of(
            "TUM",
            "HEIDELBERG",
            "MANNHEIM",
            "DARMSTADT",
            "UNI",
            "HOCHSCHULE");

    private OpenAiDeCurriculumOptionFacets() {
    }

    static String category(LandscapeSummary curriculum) {
        String type = upper(curriculum == null ? null : curriculum.getType());
        String title = upper(curriculum == null ? null : curriculum.getTitle());

        if (containsAny(type, SCHOOL_TYPES)
                || title.contains("SCHULE")
                || title.contains("GYMNASIUM")
                || title.contains("GYMNASIAL")) {
            return "SCHOOL";
        }

        if ("U".equals(type)
                || title.contains("OPENCOURSEWARE")
                || title.contains("OCW")
                || title.contains("BACHELOR")
                || title.contains("MASTER")
                || containsAny(type, UNIVERSITY_MARKERS)
                || containsAny(title, UNIVERSITY_MARKERS)) {
            return "UNI";
        }

        if ("CEFR".equals(type)
                || title.contains("CEFR")
                || title.contains("LANGUAGE")
                || title.contains("SPRACHE")) {
            return "OTHER";
        }

        return "OTHER";
    }

    static String qualityStatus(LandscapeSummary curriculum) {
        String curriculumId = curriculum == null ? null : curriculum.getCurriculumId();
        if (GREEN_CURRICULUM_IDS.contains(curriculumId)) {
            return "green";
        }
        if (ORANGE_CURRICULUM_IDS.contains(curriculumId)) {
            return "orange";
        }
        return "red";
    }

    static int sortRank(LandscapeSummary curriculum) {
        if (curriculum != null
                && CANONICAL_GYMNASIUM_ROOT_ID.equals(curriculum.getCurriculumId())) {
            return 0;
        }
        if (curriculum != null
                && (curriculum.isCompatibilityOnly() || curriculum.isLegacyHiddenByDefault())) {
            return 2;
        }
        return 1;
    }

    private static String upper(String value) {
        return value == null ? "" : value.toUpperCase(Locale.ROOT);
    }

    private static boolean containsAny(String value, List<String> markers) {
        return markers.stream().anyMatch(value::contains);
    }
}
