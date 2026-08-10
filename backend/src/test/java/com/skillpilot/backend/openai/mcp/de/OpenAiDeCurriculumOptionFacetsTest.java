package com.skillpilot.backend.openai.mcp.de;

import static org.assertj.core.api.Assertions.assertThat;

import com.skillpilot.backend.landscape.LandscapeSummary;
import java.util.List;
import org.junit.jupiter.api.Test;

class OpenAiDeCurriculumOptionFacetsTest {

    @Test
    void mirrorsTheSessionSetupCategoryHeuristic() {
        assertThat(category("school-type", "Neutrales Angebot", "Programm"))
                .isEqualTo("SCHOOL");
        assertThat(category("school-title", "Gymnasiale Mittelstufe", "Other"))
                .isEqualTo("SCHOOL");
        assertThat(category("university-type", "Neutrales Angebot", "U"))
                .isEqualTo("UNI");
        assertThat(category("university-title", "Bachelor Mathematik", "Other"))
                .isEqualTo("UNI");
        assertThat(category("university-marker", "Angebot der Uni Mannheim", "Other"))
                .isEqualTo("UNI");
        assertThat(category("language-type", "Englisch", "CEFR"))
                .isEqualTo("OTHER");
        assertThat(category("language-title", "Language learning", "Other"))
                .isEqualTo("OTHER");
        assertThat(category("fallback", "Freie Weiterbildung", "Other"))
                .isEqualTo("OTHER");
    }

    @Test
    void mirrorsTheSessionSetupQualityIdsWithoutInferringMaturity() {
        assertThat(List.of(
                OpenAiDeCurriculumOptionFacets.CANONICAL_GYMNASIUM_ROOT_ID,
                "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced",
                "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a"))
                .allSatisfy(id -> assertThat(quality(id)).isEqualTo("green"));
        assertThat(List.of(
                "08a43a1b-d97e-522c-9dfa-c950a493364e",
                "c436b994-8f44-5134-b9f8-0c9f5d6a5ba0",
                "67bd301b-e11a-582d-94ba-4f4b1a4cefff",
                "92406d94-e3c1-58ec-b7c6-12122278d25a",
                "7d51b38c-a149-5407-bddc-d2ce7878b020",
                "668cf206-941e-51f8-8704-3e8938631235",
                "51b60137-46e8-5498-973e-ea38bb32f327",
                "605bdaf6-32d5-56fd-8d92-5a80c2fd2901"))
                .allSatisfy(id -> assertThat(quality(id)).isEqualTo("orange"));
        assertThat(quality("unlisted-curriculum")).isEqualTo("red");
    }

    @Test
    void mirrorsTheSessionSetupSortPriority() {
        assertThat(OpenAiDeCurriculumOptionFacets.sortRank(summary(
                OpenAiDeCurriculumOptionFacets.CANONICAL_GYMNASIUM_ROOT_ID,
                "Gymnasium (DE)",
                "Gymnasium",
                false,
                false)))
                .isZero();
        assertThat(OpenAiDeCurriculumOptionFacets.sortRank(summary(
                "ordinary",
                "Ordentliches Curriculum",
                "Other",
                false,
                false)))
                .isEqualTo(1);
        assertThat(OpenAiDeCurriculumOptionFacets.sortRank(summary(
                "compatibility",
                "Kompatibilitätsansicht",
                "Other",
                true,
                false)))
                .isEqualTo(2);
        assertThat(OpenAiDeCurriculumOptionFacets.sortRank(summary(
                "legacy",
                "Legacy-Ansicht",
                "Other",
                false,
                true)))
                .isEqualTo(2);
    }

    private String category(String id, String title, String type) {
        return OpenAiDeCurriculumOptionFacets.category(
                summary(id, title, type, false, false));
    }

    private String quality(String id) {
        return OpenAiDeCurriculumOptionFacets.qualityStatus(
                summary(id, "Curriculum", "Other", false, false));
    }

    private LandscapeSummary summary(
            String id,
            String title,
            String type,
            boolean compatibilityOnly,
            boolean legacyHiddenByDefault) {
        return new LandscapeSummary(
                id,
                title,
                "",
                "DE",
                "",
                type,
                "",
                "de",
                List.of(),
                compatibilityOnly,
                legacyHiddenByDefault);
    }
}
