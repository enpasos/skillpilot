package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class RepositoryCurriculumQualitySnapshotProviderTest {

    @TempDir
    Path tempDir;

    @Test
    void loadsLandscapeAndCanonicalSubjectProjectionFromRepositoryStatus() throws Exception {
        Path status = tempDir.resolve("curriculum-quality-status.json");
        Files.writeString(status, """
                {
                  "curricula": [
                    {
                      "landscapeId": "math-landscape",
                      "frameworkId": "canonical-gymnasium-mathematik",
                      "subject": " Mathematik ",
                      "maturity": "M6",
                      "goals": 42,
                      "atomicGoals": 31,
                      "rules": [
                        {"status": "pass"},
                        {"status": "warn"}
                      ],
                      "scopes": [
                        {"rules": [
                          {"status": "warn"},
                          {"status": "fail"}
                        ]}
                      ]
                    },
                    {
                      "landscapeId": "overview",
                      "frameworkId": "canonical-gymnasium-overview",
                      "subject": "Überblick",
                      "maturity": "M5",
                      "goals": 2,
                      "atomicGoals": 0,
                      "rules": [],
                      "scopes": []
                    },
                    {
                      "landscapeId": "incomplete",
                      "subject": "Physik"
                    }
                  ]
                }
                """);

        CurriculumQualitySnapshotProvider.CurriculumQualitySnapshot snapshot =
                new RepositoryCurriculumQualitySnapshotProvider(new ObjectMapper(), List.of(status)).load();

        assertThat(snapshot.byLandscapeId()).containsOnlyKeys("math-landscape", "overview");
        assertThat(snapshot.byLandscapeId().get("math-landscape"))
                .satisfies(entry -> {
                    assertThat(entry.subject()).isEqualTo("Mathematik");
                    assertThat(entry.maturity()).isEqualTo("M6");
                    assertThat(entry.goals()).isEqualTo(42);
                    assertThat(entry.atomicGoals()).isEqualTo(31);
                    assertThat(entry.warnings()).isEqualTo(2);
                    assertThat(entry.failures()).isOne();
                });
        assertThat(snapshot.canonicalSubjects()).containsOnlyKeys("mathematik");
        assertThat(snapshot.canonicalSubjects().get("mathematik").landscapeId())
                .isEqualTo("math-landscape");
    }

    @Test
    void legacyImageM7CannotBeReadAsNewDeepQaM7() throws Exception {
        Path status = tempDir.resolve("legacy.json");
        Files.writeString(status, """
                {"schemaVersion":1,"rulesVersion":"curriculum-quality-v4","curricula":[
                  {"landscapeId":"legacy","subject":"Math","maturity":"M7","humanTrialBlockingFindings":0},
                  {"landscapeId":"core","subject":"Physics","maturity":"M6","humanTrialBlockingFindings":0}
                ]}
                """);
        var result = new RepositoryCurriculumQualitySnapshotProvider(new ObjectMapper(), List.of(status)).load();
        assertThat(result.byLandscapeId()).containsOnlyKeys("core");
        assertThat(result.byLandscapeId().get("core").humanTrialFindingsAvailable()).isFalse();
    }

    @Test
    void invalidFindingsNeverBecomeAnAvailableZeroCount() throws Exception {
        Path status = tempDir.resolve("counts.json");
        for (String value : List.of("-1", "1.5", "2147483648", "4294967296", "\"0\"", "null")) {
            Files.writeString(status, """
                    {"schemaVersion":1,"rulesVersion":"curriculum-quality-v5","curricula":[
                      {"landscapeId":"math","subject":"Math","maturity":"M6","humanTrialBlockingFindings":%s}
                    ]}
                    """.formatted(value));
            var result = new RepositoryCurriculumQualitySnapshotProvider(new ObjectMapper(), List.of(status)).load();
            assertThat(result.byLandscapeId().get("math").humanTrialFindingsAvailable()).as(value).isFalse();
        }
    }

    @Test
    void currentHumanNokAndCoreFailuresRemainSeparateFromDeepReviewBacklog() throws Exception {
        Path status = tempDir.resolve("current.json");
        Files.writeString(status, """
                {"schemaVersion":1,"rulesVersion":"curriculum-quality-v5","curricula":[
                  {"landscapeId":"math","subject":"Math","maturity":"M6","humanTrialBlockingFindings":2,
                   "rules":[{"id":"CQR-303","status":"fail"},{"id":"CQR-001","status":"fail"}]}
                ]}
                """);
        var result = new RepositoryCurriculumQualitySnapshotProvider(new ObjectMapper(), List.of(status)).load();
        var math = result.byLandscapeId().get("math");
        assertThat(math.humanTrialFindingsAvailable()).isTrue();
        assertThat(math.humanTrialBlockingFindings()).isEqualTo(2);
        assertThat(math.failures()).isEqualTo(2);
        assertThat(math.humanTrialBlockingRuleFailures()).isEqualTo(1);
        String revision = new RepositoryCurriculumQualitySnapshotProvider(new ObjectMapper(), List.of(status)).revision();
        Files.writeString(status, "{}");
        assertThat(new RepositoryCurriculumQualitySnapshotProvider(new ObjectMapper(), List.of(status)).revision())
                .isNotEqualTo(revision);
    }

    @Test
    void returnsExplicitEmptyProjectionWhenRepositoryStatusIsMissing() {
        CurriculumQualitySnapshotProvider.CurriculumQualitySnapshot snapshot =
                new RepositoryCurriculumQualitySnapshotProvider(
                        new ObjectMapper(), List.of(tempDir.resolve("missing.json")))
                        .load();

        assertThat(snapshot.byLandscapeId()).isEmpty();
        assertThat(snapshot.canonicalSubjects()).isEmpty();
    }
}
