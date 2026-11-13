package com.skillpilot.backend.landscape;

import static org.assertj.core.api.Assertions.assertThat;

import com.skillpilot.backend.api.LandscapeOverviewResponse;
import com.skillpilot.backend.api.TopicSummary;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.attribute.FileTime;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class LandscapeServiceSourceRegistryTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @TempDir
    Path tempDir;

    @Test
    void retainedSourcesStayOutsideActiveIndexesButServeExplicitLegacyClosureAndSourceEvidence() throws IOException {
        writeJson(tempDir.resolve("DE/Gymnasium/input/BY/gymnasium/retained.json"), """
                {"landscapeId":"retained-source","title":"Frozen source","goals":[
                  {"id":"source-root","contains":["source-atom"],"requires":["source-atom"]},
                  {"id":"source-atom"}
                ]}
                """);
        String consumer = """
                {"landscapeId":"%s","goals":[{"id":"%s","contains":["source-root"]}]}
                """;
        writeJson(tempDir.resolve("DE/BY/legacy-overview.json"), consumer.formatted("legacy-overview", "legacy-root"));
        writeJson(tempDir.resolve("DE/Gymnasium/canonical/current.json"), consumer.formatted("current", "current-root"));
        writeJson(tempDir.resolve("DE/BY/through-canonical.json"), """
                {"landscapeId":"through-canonical","goals":[{"id":"outside-root","contains":["current-root"]}]}
                """);

        LandscapeService service = createService(tempDir);
        service.pinRuntimeGeneration();

        assertThat(service.getAll()).extracting(SkillLandscape::getLandscapeId)
                .containsExactlyInAnyOrder("current", "legacy-overview", "through-canonical");
        assertThat(service.getById("retained-source")).isNull();
        assertThat(service.getGoalDefinition("source-atom")).isNull();
        assertThat(service.getLandscapeIdForGoal("source-atom")).isNull();
        assertThat(service.getRetainedSourceLandscape("retained-source")).isNotNull();
        assertThat(service.resolveLandscapeIdForGoalIncludingArchived("source-atom")).isEqualTo("retained-source");
        assertThat(service.resolveSourceAtomicGoalIds("retained-source", "source-root")).containsExactly("source-atom");
        assertThat(service.getClosure("legacy-overview")).extracting(SkillLandscape::getLandscapeId)
                .containsExactly("legacy-overview", "retained-source");
        assertThat(service.getClosure("current")).extracting(SkillLandscape::getLandscapeId).containsExactly("current");
        assertThat(service.getClosure("through-canonical")).extracting(SkillLandscape::getLandscapeId)
                .containsExactly("through-canonical", "current");
        assertThat(service.isCompatibilityOnlyLandscape("retained-source")).isTrue();
    }

    @Test
    void ungatedGymnasiumGraphIsExcludedWhileOtherCurriculaRemainReadable() throws IOException {
        writeJson(tempDir.resolve("DE/Gymnasium/quality-neighbor/rogue.json"), """
                {"landscapeId":"rogue","goals":[{"id":"rogue-goal"}]}
                """);
        writeJson(tempDir.resolve("Other/current.json"), """
                {"landscapeId":"current","goals":[{"id":"current-goal"}]}
                """);
        writeJson(tempDir.resolve("DE/Gymnasium/input/BY/gymnasium/unreadable.json"), "{invalid retained JSON");
        LandscapeService service = createService(tempDir);
        service.pinRuntimeGeneration();
        assertThat(service.getById("rogue")).isNull();
        assertThat(service.getGoalDefinition("rogue-goal")).isNull();
        assertThat(service.getRetainedSourceLandscape("rogue")).isNull();
        assertThat(service.getAll()).extracting(SkillLandscape::getLandscapeId).containsExactly("current");
        assertThat(service.getById("current")).isNotNull();
        assertThat(service.getGoalDefinition("current-goal")).isNotNull();
    }

    @Test
    void activeLandscapeAndGoalLookupsKeepPrecedenceOverRetainedSourceCollisions() throws IOException {
        writeJson(tempDir.resolve("DE/BY/other-school.json"), """
                {"landscapeId":"shared-owner","title":"Active school","goals":[{"id":"shared-goal","title":"Active"}]}
                """);
        writeJson(tempDir.resolve("DE/Gymnasium/input/BY/gymnasium/retained.json"), """
                {"landscapeId":"shared-owner","title":"Frozen source","goals":[
                  {"id":"shared-goal","title":"Frozen"},{"id":"source-only-goal","title":"Source only"}
                ]}
                """);
        writeJson(tempDir.resolve("DE/BY/consumer.json"), """
                {"landscapeId":"outside-consumer","goals":[{"id":"outside-root","contains":["source-only-goal"]}]}
                """);
        LandscapeService service = createService(tempDir);
        assertThat(service.getById("shared-owner").getTitle()).isEqualTo("Active school");
        assertThat(service.getGoalDefinition("shared-goal").getTitle()).isEqualTo("Active");
        assertThat(service.getRetainedSourceLandscape("shared-owner").getTitle()).isEqualTo("Frozen source");
        assertThat(service.isCompatibilityOnlyLandscape("shared-owner")).isFalse();
        assertThat(service.getClosure("shared-owner")).hasSize(1);
        assertThat(service.getClosure("outside-consumer")).extracting(SkillLandscape::getLandscapeId)
                .containsExactly("outside-consumer");
    }

    @Test
    void retainedSourceReloadKeepsActiveIndexesSeparateAndRespectsPinnedGeneration() throws IOException {
        Path source = tempDir.resolve("DE/Gymnasium/input/BY/gymnasium/source.json");
        String sourceJson = """
                {"landscapeId":"source","title":"%s","goals":[{"id":"source-goal"}]}
                """;
        writeJson(source, sourceJson.formatted("Before"));
        writeJson(tempDir.resolve("Other/current.json"), """
                {"landscapeId":"current","title":"Active","goals":[{"id":"current-goal"}]}
                """);
        LandscapeService service = createService(tempDir);
        assertThat(service.getRetainedSourceLandscape("source").getTitle()).isEqualTo("Before");
        writeJson(source, sourceJson.formatted("After"));
        Files.setLastModifiedTime(source, FileTime.fromMillis(System.currentTimeMillis() + 20_000));
        org.springframework.test.util.ReflectionTestUtils.setField(service, "lastReloadCheck", 0L);
        assertThat(service.getRetainedSourceLandscape("source").getTitle()).isEqualTo("After");
        assertThat(service.getById("source")).isNull();
        assertThat(service.getGoalDefinition("source-goal")).isNull();
        assertThat(service.getAll()).extracting(SkillLandscape::getLandscapeId).containsExactly("current");
        service.pinRuntimeGeneration();
        writeJson(source, sourceJson.formatted("Later"));
        Files.setLastModifiedTime(source, FileTime.fromMillis(System.currentTimeMillis() + 40_000));
        assertThat(service.getRetainedSourceLandscape("source").getTitle()).isEqualTo("After");
        assertThat(service.getById("current").getTitle()).isEqualTo("Active");
    }

    @Test
    void ignoresReviewCandidateWithSameLandscapeIdAsCanonicalRuntimeLandscape() throws IOException {
        writeJson(tempDir.resolve("DE/Gymnasium/canonical/math.de.json"), """
                {
                  "landscapeId": "canonical-math",
                  "title": "Current Mathematics",
                  "goals": [{"id": "current-goal", "title": "Current goal"}]
                }
                """);
        writeJson(tempDir.resolve("DE/Gymnasium/quality/review/candidate-canonical-math.de.json"), """
                {
                  "landscapeId": "canonical-math",
                  "title": "Stale review candidate",
                  "goals": [{"id": "stale-goal", "title": "Stale goal"}]
                }
                """);

        LandscapeService service = createService(tempDir);

        assertThat(service.getAll()).hasSize(1);
        assertThat(service.getById("canonical-math").getTitle()).isEqualTo("Current Mathematics");
        assertThat(service.getGoalDefinition("current-goal")).isNotNull();
        assertThat(service.getGoalDefinition("stale-goal")).isNull();
        assertThat(service.getLandscapeIdForGoal("current-goal")).isEqualTo("canonical-math");
    }

    @Test
    void indexesOnlyFirstRuntimeLandscapeWhenAnIdIsDuplicated() throws IOException {
        writeJson(tempDir.resolve("a/first.json"), """
                {
                  "landscapeId": "duplicate-id",
                  "title": "First",
                  "goals": [{"id": "first-goal", "title": "First goal"}]
                }
                """);
        writeJson(tempDir.resolve("z/second.json"), """
                {
                  "landscapeId": "duplicate-id",
                  "title": "Second",
                  "goals": [{"id": "second-goal", "title": "Second goal"}]
                }
                """);

        LandscapeService service = createService(tempDir);

        assertThat(service.getAll()).hasSize(1);
        assertThat(service.getById("duplicate-id").getTitle()).isEqualTo("First");
        assertThat(service.getGoalDefinition("first-goal")).isNotNull();
        assertThat(service.getGoalDefinition("second-goal")).isNull();
        assertThat(service.getLandscapeIdForGoal("second-goal")).isNull();
    }

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
                      "sourcePath": "curricula/DE/Gymnasium/input/DE-HE/upper-secondary/DE_HES_S_GYM_2_MATHEMATIK.de.json",
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
    void loadsArchivedSourceLandscapeSnapshotWhenLiveTreeIsAbsent() throws IOException {
        writeJson(tempDir.resolve("DE/Gymnasium/input/DE-HE/upper-secondary/source-json/legacy-math.de.json.snapshot"), """
                {
                  "landscapeId": "legacy-math",
                  "title": "Legacy Math Snapshot",
                  "goals": [
                    {
                      "id": "legacy-root-goal",
                      "title": "Root",
                      "contains": ["legacy-atom"],
                      "tags": ["root"]
                    },
                    {
                      "id": "legacy-atom",
                      "title": "Atom"
                    }
                  ]
                }
                """);
        writeJson(tempDir.resolve("DE/Gymnasium/provenance/source-landscape-registry.json"), """
                {
                  "version": 1,
                  "entries": [
                    {
                      "landscapeId": "legacy-math",
                      "jurisdiction": "DE-HE",
                      "sourcePath": "curricula/DE/Gymnasium/input/DE-HE/upper-secondary/source-json/legacy-math.de.json.snapshot",
                      "archiveSourcePath": "curricula/DE/Gymnasium/input/DE-HE/upper-secondary/source-json/legacy-math.de.json.snapshot",
                      "archivePath": "curricula/DE/Gymnasium/input/DE-HE/upper-secondary/"
                    }
                  ]
                }
                """);

        LandscapeService service = createService(tempDir);

        assertThat(service.getRetainedSourceLandscape("legacy-math")).isNotNull();
        assertThat(service.getLandscapeIdForGoal("legacy-atom")).isNull();
        assertThat(service.resolveLandscapeIdForGoalIncludingArchived("legacy-atom")).isEqualTo("legacy-math");
    }

    @Test
    void loadsArchivedLowerSecondarySourceLandscapeSnapshotWhenLiveTreeIsAbsent() throws IOException {
        writeJson(tempDir.resolve("DE/Gymnasium/input/DE-HE/lower-secondary/source-json/legacy-lower-overview.de.json.snapshot"), """
                {
                  "landscapeId": "legacy-lower-overview",
                  "title": "Legacy Lower Overview Snapshot",
                  "goals": [
                    {
                      "id": "legacy-lower-root-goal",
                      "title": "Root",
                      "contains": ["legacy-lower-atom"],
                      "tags": ["root"]
                    },
                    {
                      "id": "legacy-lower-atom",
                      "title": "Atom"
                    }
                  ]
                }
                """);
        writeJson(tempDir.resolve("DE/Gymnasium/provenance/source-landscape-registry.json"), """
                {
                  "version": 1,
                  "entries": [
                    {
                      "landscapeId": "legacy-lower-overview",
                      "jurisdiction": "DE-HE",
                      "sourcePath": "curricula/DE/HE/Kultusministerium/retired-lower-secondary/json/DE_HES_S_GYM_1_OVERVIEW.de.json",
                      "archiveSourcePath": "curricula/DE/Gymnasium/input/DE-HE/lower-secondary/source-json/legacy-lower-overview.de.json.snapshot",
                      "archivePath": "curricula/DE/Gymnasium/input/DE-HE/lower-secondary/"
                    }
                  ]
                }
                """);

        LandscapeService service = createService(tempDir);

        assertThat(service.getRetainedSourceLandscape("legacy-lower-overview")).isNotNull();
        assertThat(service.getLandscapeIdForGoal("legacy-lower-atom")).isNull();
        assertThat(service.resolveLandscapeIdForGoalIncludingArchived("legacy-lower-atom")).isEqualTo("legacy-lower-overview");
        assertThat(service.resolveSourceLandscapeJurisdiction("legacy-lower-overview")).isEqualTo("DE-HE");
    }

    @Test
    void loadsArchivedBavariaSourceLandscapeSnapshotWhenLiveTreeIsAbsent() throws IOException {
        writeJson(tempDir.resolve("DE/Gymnasium/input/DE-BY/gymnasium/Mathematik.json"), """
                {
                  "landscapeId": "legacy-bavaria-math",
                  "title": "Legacy Bavaria Math Snapshot",
                  "goals": [
                    {
                      "id": "legacy-bavaria-root-goal",
                      "title": "Root",
                      "contains": ["legacy-bavaria-atom"],
                      "tags": ["root"]
                    },
                    {
                      "id": "legacy-bavaria-atom",
                      "title": "Atom"
                    }
                  ]
                }
                """);
        writeJson(tempDir.resolve("DE/Gymnasium/provenance/source-landscape-registry.json"), """
                {
                  "version": 1,
                  "entries": [
                    {
                      "landscapeId": "legacy-bavaria-math",
                      "jurisdiction": "DE-BY",
                      "sourcePath": "curricula/DE/BY/archived-source/Mathematik.json",
                      "archiveSourcePath": "curricula/DE/Gymnasium/input/DE-BY/gymnasium/Mathematik.json",
                      "archivePath": "curricula/DE/Gymnasium/input/DE-BY/gymnasium/"
                    }
                  ]
                }
                """);

        LandscapeService service = createService(tempDir);

        assertThat(service.getRetainedSourceLandscape("legacy-bavaria-math")).isNotNull();
        assertThat(service.getLandscapeIdForGoal("legacy-bavaria-atom")).isNull();
        assertThat(service.resolveLandscapeIdForGoalIncludingArchived("legacy-bavaria-atom")).isEqualTo("legacy-bavaria-math");
        assertThat(service.resolveSourceLandscapeJurisdiction("legacy-bavaria-math")).isEqualTo("DE-BY");
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
