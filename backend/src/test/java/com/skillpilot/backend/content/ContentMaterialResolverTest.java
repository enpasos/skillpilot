package com.skillpilot.backend.content;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
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
