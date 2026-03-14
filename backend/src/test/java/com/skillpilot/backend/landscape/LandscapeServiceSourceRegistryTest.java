package com.skillpilot.backend.landscape;

import static org.assertj.core.api.Assertions.assertThat;

import com.skillpilot.backend.api.LandscapeOverviewResponse;
import com.skillpilot.backend.api.TopicSummary;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class LandscapeServiceSourceRegistryTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @TempDir
    Path tempDir;

    @Test
    void resolvesJurisdictionFromSourceLandscapeRegistryWhenLoadedLandscapeHasNoRegion() throws IOException {
        writeJson(tempDir.resolve("legacy/math.json"), """
                {
                  "landscapeId": "legacy-math",
                  "title": "Legacy Math",
                  "goals": []
                }
                """);
        writeJson(tempDir.resolve("DE/Gymnasium/provenance/source-landscape-registry.json"), """
                {
                  "version": 1,
                  "entries": [
                    {
                      "landscapeId": "legacy-math",
                      "jurisdiction": "DE-HE",
                      "sourcePath": "curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/json/DE_HES_S_GYM_2_MATHEMATIK.de.json",
                      "archivePath": "curricula/DE/Gymnasium/input/DE-HE/upper-secondary/"
                    }
                  ]
                }
                """);

        LandscapeService service = createService(tempDir);

        assertThat(service.getById("legacy-math")).isNotNull();
        assertThat(service.resolveSourceLandscapeJurisdiction("legacy-math")).isEqualTo("DE-HE");
    }

    @Test
    void resolvesAtomicGoalClosureFromSourceGoalClosureRegistry() throws IOException {
        writeJson(tempDir.resolve("DE/Gymnasium/provenance/source-goal-closure-registry.json"), """
                {
                  "version": 1,
                  "landscapes": [
                    {
                      "landscapeId": "legacy-math",
                      "goalAtomicClosures": {
                        "cluster-1": ["atom-1", "atom-2"],
                        "atom-1": ["atom-1"]
                      }
                    }
                  ]
                }
                """);

        LandscapeService service = createService(tempDir);

        assertThat(service.resolveSourceAtomicGoalIds("legacy-math", "cluster-1"))
                .containsExactly("atom-1", "atom-2");
        assertThat(service.resolveSourceAtomicGoalIds("legacy-math", "missing")).isEmpty();
    }

    @Test
    void resolvesArchivedGoalMembershipFromSourceGoalMembershipRegistry() throws IOException {
        writeJson(tempDir.resolve("DE/Gymnasium/provenance/source-goal-membership-registry.json"), """
                {
                  "version": 1,
                  "landscapes": [
                    {
                      "landscapeId": "legacy-math",
                      "goalIds": ["legacy-goal-1", "legacy-goal-2"]
                    }
                  ]
                }
                """);

        LandscapeService service = createService(tempDir);

        assertThat(service.getLandscapeIdForGoal("legacy-goal-1")).isNull();
        assertThat(service.resolveLandscapeIdForGoalIncludingArchived("legacy-goal-1")).isEqualTo("legacy-math");
        assertThat(service.resolveLandscapeIdForGoalIncludingArchived("missing")).isNull();
    }

    @Test
    void resolvesCompatibilityArchiveSummaryFromFrozenArchiveRegistry() throws IOException {
        writeJson(tempDir.resolve("DE/Gymnasium/archive/compatibility-landscape-registry.json"), """
                {
                  "version": 1,
                  "entries": [
                    {
                      "landscapeId": "legacy-math",
                      "title": "Mathematik Oberstufe (Hessen, KC 2024)",
                      "description": "Frozen archive summary",
                      "country": "DE",
                      "region": "HE",
                      "type": "GYM",
                      "subject": "Mathematik",
                      "locale": "de-DE",
                      "filters": [
                        { "id": "GK", "label": "Grundkurs" },
                        { "id": "LK", "label": "Leistungskurs" }
                      ],
                      "archiveLane": "curricula/DE/Gymnasium/archive/DE-HE/upper-secondary/"
                    }
                  ]
                }
                """);

        LandscapeService service = createService(tempDir);

        LandscapeSummary summary = service.getCompatibilityArchiveSummary("legacy-math");
        assertThat(summary).isNotNull();
        assertThat(summary.getCurriculumId()).isEqualTo("legacy-math");
        assertThat(summary.getTitle()).isEqualTo("Mathematik Oberstufe (Hessen, KC 2024)");
        assertThat(summary.getRegion()).isEqualTo("HE");
        assertThat(summary.isCompatibilityOnly()).isTrue();
        assertThat(summary.getFilters()).extracting(LandscapeFilter::getId).containsExactly("GK", "LK");
    }

    @Test
    void overviewIncludesCompatibilityArchiveSummaryWithoutLiveLandscape() throws IOException {
        writeJson(tempDir.resolve("curriculum_manifest.json"), """
                {
                  "curricula": [
                    { "id": "legacy-root" }
                  ]
                }
                """);
        writeJson(tempDir.resolve("DE/Gymnasium/archive/compatibility-landscape-registry.json"), """
                {
                  "version": 1,
                  "entries": [
                    {
                      "landscapeId": "legacy-root",
                      "title": "Frozen Hessen Root",
                      "description": "Frozen summary",
                      "country": "DE",
                      "region": "HE",
                      "type": "GYM",
                      "subject": "Gymnasiale Oberstufe (Hessen)",
                      "locale": "de-DE",
                      "filters": []
                    }
                  ]
                }
                """);

        LandscapeService service = createService(tempDir);

        LandscapeOverviewResponse overview = service.getOverview("de", true);

        assertThat(overview.getSummaries()).hasSize(1);
        assertThat(overview.getSummaries().getFirst().getCurriculumId()).isEqualTo("legacy-root");
        assertThat(overview.getSummaries().getFirst().getTitle()).isEqualTo("Frozen Hessen Root");
        assertThat(overview.getSummaries().getFirst().isCompatibilityOnly()).isTrue();
    }

    @Test
    void overviewPrefersFrozenCompatibilitySummaryOverLiveLandscapeMetadata() throws IOException {
        writeJson(tempDir.resolve("legacy/root.json"), """
                {
                  "landscapeId": "legacy-root",
                  "title": "Live Hessen Root",
                  "description": "Live summary",
                  "country": "DE",
                  "region": "HE",
                  "schoolType": "GYM",
                  "subject": "Live Subject",
                  "locale": "de-DE",
                  "goals": []
                }
                """);
        writeJson(tempDir.resolve("curriculum_manifest.json"), """
                {
                  "curricula": [
                    { "id": "legacy-root" }
                  ]
                }
                """);
        writeJson(tempDir.resolve("DE/Gymnasium/archive/compatibility-landscape-registry.json"), """
                {
                  "version": 1,
                  "entries": [
                    {
                      "landscapeId": "legacy-root",
                      "title": "Frozen Hessen Root",
                      "description": "Frozen summary",
                      "country": "DE",
                      "region": "HE",
                      "type": "GYM",
                      "subject": "Frozen Subject",
                      "locale": "de-DE",
                      "filters": []
                    }
                  ]
                }
                """);

        LandscapeService service = createService(tempDir);

        LandscapeOverviewResponse overview = service.getOverview("de", true);

        assertThat(overview.getSummaries()).hasSize(1);
        assertThat(overview.getSummaries().getFirst().getTitle()).isEqualTo("Frozen Hessen Root");
        assertThat(overview.getSummaries().getFirst().getDescription()).isEqualTo("Frozen summary");
        assertThat(overview.getSummaries().getFirst().getSubject()).isEqualTo("Frozen Subject");
    }

    @Test
    void resolvesCompatibilityArchiveTopicsFromFrozenRegistry() throws IOException {
        writeJson(tempDir.resolve("DE/Gymnasium/archive/compatibility-topic-summary-registry.json"), """
                {
                  "version": 1,
                  "entries": [
                    {
                      "curriculumId": "legacy-math",
                      "topics": [
                        {
                          "id": "topic-1",
                          "title": "Q3 Stochastik",
                          "titleEn": "Q3 Stochastics"
                        }
                      ]
                    }
                  ]
                }
                """);

        LandscapeService service = createService(tempDir);

        assertThat(service.getCompatibilityArchiveTopics("legacy-math"))
                .containsExactly(new TopicSummary("topic-1", "Q3 Stochastik", "Q3 Stochastics"));
        assertThat(service.getCompatibilityArchiveTopics("missing")).isEmpty();
    }

    private LandscapeService createService(Path directory) {
        LandscapeProperties properties = new LandscapeProperties();
        properties.setDirectory(directory.toString());
        return new LandscapeService(properties, objectMapper);
    }

    private void writeJson(Path file, String json) throws IOException {
        Files.createDirectories(file.getParent());
        Files.writeString(file, json);
    }
}
