package com.skillpilot.backend.content;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

class ContentCatalogTest {
    @Test
    void malformedOptionalCatalogDoesNotPreventApplicationStartup() throws Exception {
        ObjectMapper mapper = mock(ObjectMapper.class);
        when(mapper.readValue(any(InputStream.class), eq(ContentCatalog.Index.class)))
                .thenThrow(new IOException("malformed optional metadata"));
        ContentCatalog catalog = new ContentCatalog(mapper);
        assertThat(catalog.packages("de")).isEmpty();
        assertThat(catalog.materialsForGoal(Set.of("provider"), "goal-a")).isEmpty();
    }

    @Test
    void bundledCatalogExpandsPhysicsWithoutChangingTheExistingSelectionId() {
        ContentCatalog catalog = new ContentCatalog(new ObjectMapper());
        assertThat(catalog.packages("de")).hasSize(1);
        assertThat(catalog.packages("de").getFirst().packageId()).isEqualTo("physik-libre-gymnasium");
        assertThat(catalog.packages("de").getFirst().materialCount()).isGreaterThan(4);
        assertThat(catalog.packages("en").getFirst().title()).isEqualTo("Physik Libre – Physics explained");
        assertThat(catalog.materialsForGoal(Set.of("physik-libre-gymnasium"),
                "d67502e3-5e0a-595b-a24b-65b1c40de36e").getFirst().material().url())
                .isEqualTo("https://physikbuch.schule/motion-capture.html#motion-analysis");
        assertThat(catalog.materialsForGoal(Set.of(), "d67502e3-5e0a-595b-a24b-65b1c40de36e")).isEmpty();
        for (String goalId : List.of(
                "a6e48b88-51ed-5942-bdb8-8d2192652e0d",
                "37b33812-d428-5953-852e-57a53a4347fe",
                "d05a146f-7fcd-56ae-b9b9-b54203328579")) {
            assertThat(catalog.materialsForGoal(Set.of("physik-libre-gymnasium"), goalId))
                    .as("new topic for an already selected package: %s", goalId).isNotEmpty();
            assertThat(catalog.materialsForGoal(Set.of(), goalId)).isEmpty();
        }
    }

    @Test
    void syntheticSecondProviderNeedsNoProviderSpecificRuntimeCode() {
        ContentCatalog catalog = new ContentCatalog(List.of(
                contentPackage("first-provider", "active", "https://first.example/", "goal-a", "active"),
                contentPackage("second-provider", "active", "https://second.example/", "goal-a", "active")));
        assertThat(catalog.materialsForGoal(Set.of("second-provider"), "goal-a"))
                .extracting(match -> match.contentPackage().packageId()).containsExactly("second-provider");
        assertThat(catalog.materialsForGoal(Set.of("first-provider", "second-provider"), "goal-a"))
                .hasSize(2);
        assertThat(catalog.materialsForGoal(Set.of("second-provider"), "goal-other")).isEmpty();
        assertThat(catalog.materialsForGoal(Set.of("removed-provider"), "goal-a")).isEmpty();
    }

    @Test
    void inactivePackagesAndMaterialsAreNotPublished() {
        ContentCatalog catalog = new ContentCatalog(List.of(
                contentPackage("offline-package", "inactive", "https://first.example/", "goal-a", "active"),
                contentPackage("active-package", "active", "https://second.example/", "goal-a", "inactive")));
        assertThat(catalog.hasActivePackage("offline-package")).isFalse();
        assertThat(catalog.hasActivePackage("active-package")).isTrue();
        assertThat(catalog.packages("de")).hasSize(1);
        assertThat(catalog.packages("de").getFirst().materialCount()).isZero();
        assertThat(catalog.materialsForGoal(Set.of("offline-package", "active-package"), "goal-a")).isEmpty();
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "http://provider.example/", "javascript:alert(1)", "https://localhost/",
            "https://127.0.0.1/", "https://user:password@provider.example/",
            "https://provider.example/?learnerId=private", "https://provider.example:443/",
            "https://provider.example/\nprivate", "https://host.local/"
    })
    void rejectsUnsafeOrDataBearingProviderUrls(String url) {
        assertThatThrownBy(() -> new ContentCatalog(List.of(
                contentPackage("provider", "active", url, "goal-a", "active"))))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void rejectsLinksOutsideTheDeclaredProviderAndDuplicatePackageIds() {
        ContentCatalog.ContentPackage original = contentPackage(
                "provider", "active", "https://provider.example/", "goal-a", "active");
        ContentCatalog.Material unsafe = new ContentCatalog.Material("lesson", "Lesson", null,
                "https://other.example/lesson", "article", "de", "active", List.of("goal-a"),
                List.of(), review());
        ContentCatalog.ContentPackage mismatched = new ContentCatalog.ContentPackage(
                1, original.packageId(), "1.0.0", "Title", null, "Description", null,
                original.provider(), "public-link", "link-only", "active", List.of(unsafe));
        assertThatThrownBy(() -> new ContentCatalog(List.of(mismatched)))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new ContentCatalog(List.of(original, original)))
                .isInstanceOf(IllegalArgumentException.class);
    }

    static ContentCatalog.ContentPackage contentPackage(
            String id, String status, String url, String goalId, String materialStatus) {
        return new ContentCatalog.ContentPackage(
                1, id, "1.0.0", "Titel", "Title", "Beschreibung", "Description",
                new ContentCatalog.Provider("Provider", url, "independent-mapping"),
                "public-link", "link-only", status,
                List.of(new ContentCatalog.Material("lesson", "Lektion", "Lesson", url,
                        "article", "de", materialStatus, List.of(goalId), List.of("Section"), review())));
    }

    private static ContentCatalog.Review review() {
        return new ContentCatalog.Review("2026-09-20", "ai", "Exact goal and section checked; partial support.");
    }
}
