package com.skillpilot.backend.content;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.IntStream;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;

class ContentMaterialResolverTest {
    private final ContentCatalog catalog = new ContentCatalog(List.of(
            ContentCatalogTest.contentPackage("package-one", "active", "https://one.example/", "goal-a", "active"),
            ContentCatalogTest.contentPackage("package-two", "active", "https://two.example/", "goal-a", "active")));
    private final ContentSelectionService selections = mock(ContentSelectionService.class);

    @Test
    void disabledContentDoesNotReadPreferencesOrProvideMaterials() {
        assertThat(new ContentMaterialResolver(catalog, selections, false)
                .resolve("learner-a", "goal-a", "de")).isEmpty();
        verifyNoInteractions(selections);
    }

    @Test
    void twoLearnersWithTheSameGoalReceiveOnlyTheirSelectedMaterials() throws Exception {
        when(selections.selectedPackageIds("private-learner-a")).thenReturn(Set.of("package-one"));
        when(selections.selectedPackageIds("private-learner-b")).thenReturn(Set.of("package-two"));
        ContentMaterialResolver resolver = new ContentMaterialResolver(catalog, selections, true);
        var german = resolver.resolve("private-learner-a", "goal-a", "de");
        var english = resolver.resolve("private-learner-b", "goal-a", "en");
        assertThat(german).hasSize(1);
        assertThat(german.getFirst().url()).isEqualTo("https://one.example/");
        assertThat(german.getFirst().title()).isEqualTo("Lektion");
        assertThat(german.getFirst().provider()).isEqualTo("Provider");
        assertThat(english.getFirst().url()).isEqualTo("https://two.example/");
        assertThat(english.getFirst().title()).isEqualTo("Lesson");
        assertThat(english.getFirst().language()).isEqualTo("de");
        assertThat(english.getFirst().aiUsage()).isEqualTo("link-only");
        assertThat(new ObjectMapper().writeValueAsString(german))
                .doesNotContain("private-learner", "package-one", "goal-a", "review", "mastery");
    }

    @Test
    void deactivationAndMissingMappingsProduceAnEmptyAdditiveProjection() {
        when(selections.selectedPackageIds("learner")).thenReturn(Set.of("package-one"), Set.of());
        ContentMaterialResolver resolver = new ContentMaterialResolver(catalog, selections, true);
        assertThat(resolver.resolve("learner", "goal-missing", "de")).isEmpty();
        assertThat(resolver.resolve("learner", "goal-a", "de")).isEmpty();
    }

    @Test
    void curatedMaterialsShowTheirActualProviderAndAreOptionalForEachLearner() throws Exception {
        ContentCatalog curated = new ContentCatalog(List.of(ContentCatalogTest.mixedProviderPackage()));
        when(selections.selectedPackageIds("learner-a")).thenReturn(Set.of("curated-package"), Set.of());
        when(selections.selectedPackageIds("learner-b")).thenReturn(Set.of());
        ContentMaterialResolver resolver = new ContentMaterialResolver(curated, selections, true);
        var selected = resolver.resolve("learner-a", "goal-a", "de");
        assertThat(selected).extracting(ContentMaterialResolver.ResolvedMaterial::provider)
                .containsExactly("Provider one", "Provider two");
        assertThat(new ObjectMapper().writeValueAsString(selected))
                .doesNotContain("Curator", "curator.example", "learner-a", "curated-package", "review");
        assertThat(resolver.resolve("learner-b", "goal-a", "de")).isEmpty();
        assertThat(resolver.resolve("learner-a", "goal-a", "de")).isEmpty();
    }

    @Test
    void bundledLabXchangeArticlesResolveOnlyAfterOptInAndRetainEnglishSourceLanguage() {
        Map<String, String> expected = Map.of(
                "37b33812-d428-5953-852e-57a53a4347fe",
                "https://www.labxchange.org/library/items/lb:LabXchange:f862c35e-afbd-3c70-a08f-2a94684cd4c8:html:1",
                "6a4c6042-052b-502b-a39a-0ed8941247ac",
                "https://www.labxchange.org/library/items/lb:LabXchange:25a05b36-6e13-372a-9422-374c7c3f8292:html:1",
                "d03f1cb6-c224-53db-ad91-76cc7827978d",
                "https://www.labxchange.org/library/items/lb:LabXchange:499dc1f4-ae20-3dba-a5f7-b6160354741e:html:1",
                "68020906-e615-462e-a56f-dd1ccc14b8d7",
                "https://www.labxchange.org/library/items/lb:LabXchange:5fc2e63f-60d8-3c96-baa1-6173b5eee3b0:html:1",
                "dfa53498-34f5-5326-9d94-87e7b528caf3",
                "https://www.labxchange.org/library/items/lb:LabXchange:aa9dd8a8-359e-3639-bfae-1c24ed558af9:html:1");
        assertOptionalEnglishPackage("enpasos-labxchange-physik", "LabXchange / OpenStax", "article", expected);
    }

    @Test
    void bundledOPhysicsSimulationsResolveOnlyTheReviewedGoalsInEitherLocale() {
        Map<String, String> expected = Map.ofEntries(
                Map.entry("6270e558-d657-5363-a6b2-e49a032a453b", "https://ophysics.com/l4.html"),
                Map.entry("c64820e1-c0ee-4342-9225-f981650f0c52", "https://ophysics.com/l4.html"),
                Map.entry("d7244ce4-5409-58d1-a1b4-bfae35f391e1", "https://ophysics.com/m1.html"),
                Map.entry("8c9394cb-f54a-508d-9750-4c49e31b3fa9", "https://ophysics.com/em2a.html"),
                Map.entry("cf570e66-2ce2-5923-9033-c97d74119553", "https://ophysics.com/r4.html"),
                Map.entry("c2c3cdc5-3e87-47c4-89fd-4eb2c5c2f2ea", "https://ophysics.com/r4.html"),
                Map.entry("215f5558-562c-5686-b649-931f324c7983", "https://ophysics.com/w9.html"),
                Map.entry("6a4c6042-052b-502b-a39a-0ed8941247ac", "https://ophysics.com/l7.html"),
                Map.entry("4ca83b3f-3605-5c0d-abc4-9f24b9e29bbe", "https://ophysics.com/em9.html"),
                Map.entry("2622bef1-bdbc-504e-b468-b600b2ca3ed8", "https://ophysics.com/em9.html"),
                Map.entry("7fe6f8a1-5580-4e37-bf8e-9772964a6b0a", "https://ophysics.com/em8.html"),
                Map.entry("9854589c-5feb-4942-b90f-311ddf36eb78", "https://ophysics.com/em8.html"));
        assertOptionalEnglishPackage("enpasos-ophysics", "oPhysics – Tom Walsh", "simulation", expected);
        ContentMaterialResolver resolver = new ContentMaterialResolver(new ContentCatalog(new ObjectMapper()), selections, true);
        when(selections.selectedPackageIds("learner")).thenReturn(Set.of("enpasos-ophysics"));
        for (String locale : List.of("de", "en")) {
            assertThat(resolver.resolve("learner", "966782e5-690d-4fae-bbab-fa3fa30525c3", locale))
                    .as("Thomson setup must not be mapped to the Fadenstrahlrohr experiment").isEmpty();
            assertThat(resolver.resolve("learner", "b1f00a6d-1a03-496c-b1bd-c1f2259f59a8", locale))
                    .as("energy levels must not be mapped to orbital probabilities").isEmpty();
        }
    }

    @Test
    void bundledRefractionGoalRetainsAllFourSelectedProviders() {
        ContentMaterialResolver resolver = new ContentMaterialResolver(
                new ContentCatalog(new ObjectMapper()), selections, true);
        when(selections.selectedPackageIds("learner")).thenReturn(Set.of(
                "physik-libre-gymnasium", "enpasos-physik",
                "enpasos-labxchange-physik", "enpasos-ophysics"), Set.of());
        assertThat(resolver.resolve("learner", "6a4c6042-052b-502b-a39a-0ed8941247ac", "de"))
                .extracting(ContentMaterialResolver.ResolvedMaterial::url)
                .containsExactly(
                        "https://physikbuch.schule/light-in-different-media.html#pen-kink",
                        "https://phet.colorado.edu/sims/html/bending-light/latest/bending-light_de.html",
                        "https://www.labxchange.org/library/items/lb:LabXchange:25a05b36-6e13-372a-9422-374c7c3f8292:html:1",
                        "https://ophysics.com/l7.html");
        assertThat(resolver.resolve("learner", "6a4c6042-052b-502b-a39a-0ed8941247ac", "de"))
                .isEmpty();
    }

    private void assertOptionalEnglishPackage(String packageId, String providerName, String resourceType,
            Map<String, String> expected) {
        ContentCatalog bundled = new ContentCatalog(new ObjectMapper());
        assertThat(bundled.hasActivePackage(packageId)).isTrue();
        assertThat(bundled.packages("de").stream().filter(item -> item.packageId().equals(packageId)))
                .singleElement().satisfies(item -> {
                    assertThat(item.providerName()).isEqualTo(providerName);
                    assertThat(item.curatorName()).isEqualTo("enpasos");
                    assertThat(item.materialCount()).isEqualTo((int) expected.values().stream().distinct().count());
                });
        ContentMaterialResolver resolver = new ContentMaterialResolver(bundled, selections, true);
        for (String locale : List.of("de", "en")) {
            when(selections.selectedPackageIds("learner")).thenReturn(Set.of());
            expected.keySet().forEach(goalId -> assertThat(resolver.resolve("learner", goalId, locale)).isEmpty());
            when(selections.selectedPackageIds("learner")).thenReturn(Set.of(packageId));
            expected.forEach((goalId, url) -> assertThat(resolver.resolve("learner", goalId, locale))
                    .singleElement().satisfies(material -> {
                        assertThat(material.url()).isEqualTo(url);
                        assertThat(material.provider()).isEqualTo(providerName);
                        assertThat(material.language()).isEqualTo("en");
                        assertThat(material.resourceType()).isEqualTo(resourceType);
                        assertThat(material.aiUsage()).isEqualTo("link-only");
                    }));
            assertThat(resolver.resolve("learner", "unmapped", locale)).isEmpty();
            when(selections.selectedPackageIds("learner")).thenReturn(Set.of());
            expected.keySet().forEach(goalId -> assertThat(resolver.resolve("learner", goalId, locale)).isEmpty());
        }
    }

    @Test
    void materialPreferenceFailureDoesNotBlockOrdinaryLearning() {
        when(selections.selectedPackageIds("learner")).thenThrow(new IllegalStateException("unavailable"));
        assertThat(new ContentMaterialResolver(catalog, selections, true)
                .resolve("learner", "goal-a", "de")).isEmpty();
    }

    @Test
    void modelFacingMaterialsAreBoundedEvenAcrossSeveralSelectedPackages() {
        var packages = IntStream.range(0, 6)
                .mapToObj(index -> ContentCatalogTest.contentPackage("package-" + index, "active",
                        "https://provider" + index + ".example/", "goal-a", "active"))
                .toList();
        when(selections.selectedPackageIds("learner")).thenReturn(packages.stream()
                .map(ContentCatalog.ContentPackage::packageId).collect(Collectors.toSet()));
        assertThat(new ContentMaterialResolver(new ContentCatalog(packages), selections, true)
                .resolve("learner", "goal-a", "de")).hasSize(4);
    }
}
