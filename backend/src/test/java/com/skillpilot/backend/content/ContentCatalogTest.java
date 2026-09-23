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
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.core.io.ClassPathResource;

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
        assertThat(catalog.packages("de").stream()
                .filter(item -> item.packageId().equals("physik-libre-gymnasium")))
                .singleElement().satisfies(item -> assertThat(item.materialCount()).isGreaterThan(4));
        assertThat(catalog.packages("en").stream()
                .filter(item -> item.packageId().equals("physik-libre-gymnasium")))
                .singleElement().satisfies(item -> assertThat(item.title()).isEqualTo("Physik Libre – Physics explained"));
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
    void bundledCuratedPackagesPublishExpandedVersionsUnderStableSelectionIds() {
        ContentCatalog catalog = new ContentCatalog(new ObjectMapper());
        for (var entry : Map.of(
                "enpasos-mathe-oberstufe", 10,
                "enpasos-physik", 5,
                "enpasos-labxchange-physik", 5,
                "enpasos-ophysics", 8).entrySet()) {
            assertThat(catalog.packages("de").stream()
                    .filter(item -> item.packageId().equals(entry.getKey())))
                    .singleElement().satisfies(item -> {
                        assertThat(item.version()).isEqualTo("1.1.0");
                        assertThat(item.materialCount()).isEqualTo(entry.getValue());
                    });
        }
    }

    @Test
    void bundledCuratedMathematicsSelectionUsesMaterialProvidersAndRemainsGoalSpecific() throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        ContentCatalog catalog = new ContentCatalog(mapper);
        ContentCatalog.ContentPackage mathematics;
        try (var input = new ClassPathResource("content/enpasos-mathe/1.1.0/package.json").getInputStream()) {
            mathematics = mapper.readValue(input, ContentCatalog.ContentPackage.class);
        }
        assertThat(catalog.packages("de").stream()
                .filter(item -> item.packageId().equals("enpasos-mathe-oberstufe")))
                .singleElement().satisfies(item -> {
                    assertThat(item.providerName()).isNotEqualTo("enpasos");
                    assertThat(item.curatorName()).isEqualTo("enpasos");
                    assertThat(item.materialCount()).isEqualTo(10);
                });
        assertThat(mathematics.materials()).hasSize(10);
        for (ContentCatalog.Material material : mathematics.materials()) {
            for (String goalId : material.goalIds()) {
                assertThat(catalog.materialsForGoal(Set.of(mathematics.packageId()), goalId))
                        .anySatisfy(match -> {
                            assertThat(match.material().id()).isEqualTo(material.id());
                            assertThat(match.provider()).isEqualTo(material.provider() == null
                                    ? mathematics.provider() : material.provider());
                        });
                assertThat(catalog.materialsForGoal(Set.of(), goalId)).isEmpty();
                assertThat(catalog.materialsForGoal(Set.of("physik-libre-gymnasium"), goalId)).isEmpty();
            }
        }
        assertThat(catalog.materialsForGoal(Set.of(mathematics.packageId()), "unmapped")).isEmpty();
        assertThat(catalog.materialsForGoal(Set.of(mathematics.packageId()),
                "d67502e3-5e0a-595b-a24b-65b1c40de36e")).isEmpty();
    }

    @Test
    void originalPackageWithoutMaterialProvidersRetainsProviderFallback() throws Exception {
        ContentCatalog.ContentPackage original;
        try (var input = new ClassPathResource("content/physik-libre/1.0.0/package.json").getInputStream()) {
            original = new ObjectMapper().readValue(input, ContentCatalog.ContentPackage.class);
        }
        ContentCatalog catalog = new ContentCatalog(List.of(original));
        assertThat(original.materials()).allSatisfy(material -> assertThat(material.provider()).isNull());
        assertThat(catalog.packages("de")).singleElement().satisfies(item -> {
            assertThat(item.curatorName()).isNull();
            assertThat(item.curatorUrl()).isNull();
        });
        assertThat(catalog.materialsForGoal(Set.of(original.packageId()),
                "d67502e3-5e0a-595b-a24b-65b1c40de36e"))
                .singleElement().satisfies(match -> assertThat(match.provider()).isEqualTo(original.provider()));
    }

    @Test
    void curatedPackageAllowsSeveralDeclaredProvidersAndPreservesHostBinding() {
        ContentCatalog.ContentPackage curated = mixedProviderPackage();
        ContentCatalog catalog = new ContentCatalog(List.of(curated));
        assertThat(catalog.packages("de")).singleElement().satisfies(item -> {
            assertThat(item.providerName()).isEqualTo("Package provider");
            assertThat(item.curatorName()).isEqualTo("Curator");
            assertThat(item.curatorUrl()).isEqualTo("https://curator.example/");
        });
        assertThat(catalog.materialsForGoal(Set.of(curated.packageId()), "goal-a"))
                .extracting(match -> match.provider().name()).containsExactly("Provider one", "Provider two");
        for (ContentCatalog.Provider invalid : List.of(
                new ContentCatalog.Provider("Provider", "https://curator.example/", "independent-mapping"),
                new ContentCatalog.Provider("Provider", "http://one.example/", "independent-mapping"),
                new ContentCatalog.Provider("Provider", "https://one.example/?learnerId=private", "independent-mapping"),
                new ContentCatalog.Provider("Provider", "https://user:secret@one.example/", "independent-mapping"),
                new ContentCatalog.Provider("", "https://one.example/", "independent-mapping"),
                new ContentCatalog.Provider(null, "https://one.example/", "independent-mapping"),
                new ContentCatalog.Provider("Provider", null, "independent-mapping"),
                new ContentCatalog.Provider("Provider", "https://one.example/", "official-partner"),
                new ContentCatalog.Provider("Provider", "https://one.example/", null))) {
            assertThatThrownBy(() -> new ContentCatalog(List.of(curatedWithFirstProvider(invalid))))
                    .isInstanceOf(IllegalArgumentException.class);
        }
        assertThatThrownBy(() -> new ContentCatalog(List.of(curatedWithFirstProvider(null))))
                .as("missing material provider falls back to the package provider, not unrestricted hosts")
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void curatorMetadataUsesTheSamePublicMetadataAndUrlBoundaries() {
        ContentCatalog.ContentPackage original = mixedProviderPackage();
        for (ContentCatalog.Curator invalid : List.of(
                new ContentCatalog.Curator("", "https://curator.example/"),
                new ContentCatalog.Curator(null, "https://curator.example/"),
                new ContentCatalog.Curator("c".repeat(201), "https://curator.example/"),
                new ContentCatalog.Curator("Curator", null),
                new ContentCatalog.Curator("Curator", "http://curator.example/"),
                new ContentCatalog.Curator("Curator", "https://curator.example/?learnerId=private"))) {
            assertThatThrownBy(() -> new ContentCatalog(List.of(new ContentCatalog.ContentPackage(
                    original.schemaVersion(), original.packageId(), original.version(), original.title(),
                    original.titleEn(), original.description(), original.descriptionEn(), original.provider(),
                    original.access(), original.aiUsage(), original.status(), original.materials(), invalid))))
                    .isInstanceOf(IllegalArgumentException.class);
        }
    }

    @Test
    void unknownMaterialProviderFieldsAreNotSilentlyAcceptedByTheCatalogMapper() {
        assertThatThrownBy(() -> new ObjectMapper().readValue("""
                {"id":"lesson", "provider":{"name":"Provider", "url":"https://one.example/",
                "relationship":"independent-mapping", "skillpilotId":"private"}}
                """, ContentCatalog.Material.class))
                .isInstanceOf(IOException.class);
        assertThatThrownBy(() -> new ObjectMapper().readValue("""
                {"curator":{"name":"Curator", "url":"https://curator.example/", "skillpilotId":"private"}}
                """, ContentCatalog.ContentPackage.class))
                .isInstanceOf(IOException.class);
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

    static ContentCatalog.ContentPackage mixedProviderPackage() {
        return new ContentCatalog.ContentPackage(1, "curated-package", "1.0.0", "Title", null,
                "Description", null,
                new ContentCatalog.Provider("Package provider", "https://provider.example/", "independent-mapping"),
                "public-link", "link-only", "active", List.of(
                        new ContentCatalog.Material("first", "First", null, "https://one.example/activity",
                                "simulation", "de", "active", List.of("goal-a"), List.of(), review(),
                                new ContentCatalog.Provider("Provider one", "https://one.example/", "independent-mapping")),
                        new ContentCatalog.Material("second", "Second", null, "https://two.example/activity",
                                "simulation", "de", "active", List.of("goal-a"), List.of(), review(),
                                new ContentCatalog.Provider("Provider two", "https://two.example/", "independent-mapping"))),
                new ContentCatalog.Curator("Curator", "https://curator.example/"));
    }

    private static ContentCatalog.ContentPackage curatedWithFirstProvider(ContentCatalog.Provider provider) {
        ContentCatalog.ContentPackage original = mixedProviderPackage();
        ContentCatalog.Material first = original.materials().getFirst();
        return new ContentCatalog.ContentPackage(original.schemaVersion(), original.packageId(), original.version(),
                original.title(), original.titleEn(), original.description(), original.descriptionEn(),
                original.provider(), original.access(), original.aiUsage(), original.status(),
                List.of(new ContentCatalog.Material(first.id(), first.title(), first.titleEn(), first.url(),
                        first.resourceType(), first.language(), first.status(), first.goalIds(), first.sections(),
                        first.review(), provider)));
    }

    private static ContentCatalog.Review review() {
        return new ContentCatalog.Review("2026-09-20", "ai", "Exact goal and section checked; partial support.");
    }
}
