package com.skillpilot.backend.completion;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.landscape.SkillLandscape;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.Test;

class CompletionCanonicalGraphResolverTest {
    @Test
    void qualifiedReferenceRequiresItsActualOwnerAndACompleteTwoPartReference() {
        for (String reference : List.of("wrong-owner:A", "base:missing", ":A", "base:", "base:extra:A")) {
            var landscapes = mock(LandscapeService.class);
            var base = landscape("base", "Q", "B", "A");
            base.getGoals().getFirst().setRequires(List.of("B"));
            base.getGoals().get(1).setRequires(List.of(reference));
            when(landscapes.getAll()).thenReturn(List.of(base));
            when(landscapes.getClosure("base")).thenReturn(List.of(base));
            assertThatThrownBy(() -> new CompletionCanonicalGraphResolver(landscapes, new ObjectMapper()).load("base"))
                    .as(reference).isInstanceOfSatisfying(CompletionCompilationException.class,
                            failure -> assertThat(failure.code()).isEqualTo("MISSING_REFERENCE"));
        }
    }

    @Test
    void exactAlreadyQualifiedCanonicalKeysRemainCanonicalIdentities() {
        var landscapes = mock(LandscapeService.class);
        var base = landscape("base", "Q", "native:A");
        base.getGoals().getFirst().setRequires(List.of("native:A"));
        when(landscapes.getAll()).thenReturn(List.of(base));
        when(landscapes.getClosure("base")).thenReturn(List.of(base));
        var graph = new CompletionCanonicalGraphResolver(landscapes, new ObjectMapper()).load("base");
        assertThat(new CompletionProfileCompiler().normalizePrerequisites(graph).transitivePrerequisites("Q"))
                .containsExactly("native:A");
    }

    @Test
    void unrelatedWrongOwnerEdgeStaysExcludedButMalformedAncestorClaimOnSelectedChildFailsClosed() {
        var landscapes = mock(LandscapeService.class);
        var base = landscape("base", "Q", "unused");
        base.getGoals().get(1).setRequires(List.of("wrong-owner:Q"));
        when(landscapes.getAll()).thenReturn(List.of(base));
        when(landscapes.getClosure("base")).thenReturn(List.of(base));
        var resolver = new CompletionCanonicalGraphResolver(landscapes, new ObjectMapper());
        var graph = resolver.loadForTargets("base", Set.of("Q"), Map.of());
        assertThat(graph).containsOnlyKeys("Q");

        base.getGoals().get(1).setRequires(List.of());
        base.getGoals().get(1).setContains(List.of("wrong-owner:Q"));
        var invalid = resolver.loadForTargets("base", Set.of("Q"), Map.of());
        assertThatThrownBy(() -> new CompletionProfileCompiler().normalizePrerequisites(invalid))
                .isInstanceOfSatisfying(CompletionCompilationException.class,
                        failure -> assertThat(failure.code()).isEqualTo("MISSING_REFERENCE"));
    }

    @Test
    void localizedCopiesOfTheSameLandscapeAreNotConflictingCanonicalDefinitions() {
        var landscapes = mock(LandscapeService.class);
        var canonical = landscape("base", "A");
        var presentation = landscape("base", "A");
        presentation.getGoals().getFirst().setTitle("Localized presentation metadata");
        when(landscapes.getAll()).thenReturn(List.of(canonical));
        when(landscapes.getClosure("base")).thenReturn(List.of(presentation));
        var graph = new CompletionCanonicalGraphResolver(landscapes, new ObjectMapper()).load("base");
        assertThat(graph.get("A").getTitle()).isEqualTo(canonical.getGoals().getFirst().getTitle());
    }

    @Test
    void qualifiedForeignRequirementsAreDiscoveredBeforeNormalizationAndExpandedTransitively() {
        var landscapes = mock(LandscapeService.class);
        var base = landscape("base", "Q");
        base.getGoals().getFirst().setRequires(List.of("foreign:K"));
        var foreign = landscape("foreign", "K", "B", "A");
        foreign.getGoals().getFirst().setContains(List.of("B"));
        foreign.getGoals().get(1).setRequires(List.of("A"));
        when(landscapes.getClosure("base")).thenReturn(List.of(base));
        when(landscapes.getAll()).thenReturn(List.of(base, foreign));

        var graph = new CompletionCanonicalGraphResolver(landscapes, new ObjectMapper()).load("base");
        var topology = new CompletionProfileCompiler().normalizePrerequisites(graph);
        topology.validateContext(Set.of("Q"));
        assertThat(topology.directPrerequisites("Q")).containsExactly("B");
        assertThat(topology.transitivePrerequisites("Q")).containsExactly("A", "B");
        assertThat(base.getGoals().getFirst().getRequires()).containsExactly("foreign:K");
    }

    @Test
    void incomingForeignAncestorsInheritRequirementsWithoutImportingUnrelatedSiblings() {
        var landscapes = mock(LandscapeService.class);
        var base = landscape("base", "Q");
        var foreign = landscape("foreign", "P", "B", "A", "unused");
        foreign.getGoals().getFirst().setContains(List.of("base:Q", "unused"));
        foreign.getGoals().getFirst().setRequires(List.of("B"));
        foreign.getGoals().get(1).setRequires(List.of("A"));
        foreign.getGoals().get(3).setRequires(List.of("unknown-unrelated"));
        when(landscapes.getClosure("base")).thenReturn(List.of(base));
        when(landscapes.getAll()).thenReturn(List.of(base, foreign));

        var graph = new CompletionCanonicalGraphResolver(landscapes, new ObjectMapper()).load("base");
        var topology = new CompletionProfileCompiler().normalizePrerequisites(graph);
        topology.validateContext(Set.of("Q"));
        assertThat(topology.transitivePrerequisites("Q")).containsExactly("A", "B");
        assertThat(graph).containsOnlyKeys("Q", "P", "A", "B");
        assertThat(graph.get("P").getContains()).containsExactly("Q");
        assertThat(foreign.getGoals().getFirst().getContains()).containsExactly("base:Q", "unused");
    }

    @Test
    void discoversCompleteCurrentClosuresWithoutLoadingUnrelatedOrLegacyGraphs() {
        var landscapes = mock(LandscapeService.class);
        var subject = landscape("subject", "A", "Q");
        var combined = landscape("combined", "root");
        var partial = landscape("partial", "A");
        var unrelated = landscape("unrelated", "X");
        var legacy = landscape("legacy", "A", "Q");
        var hidden = landscape("hidden", "A", "Q");
        when(landscapes.getAll()).thenReturn(List.of(subject, combined, partial, unrelated, legacy, hidden));
        when(landscapes.isCompatibilityOnlyLandscape("legacy")).thenReturn(true);
        when(landscapes.isLegacyHiddenByDefaultLandscape("hidden")).thenReturn(true);
        when(landscapes.getClosure("subject")).thenReturn(List.of(subject));
        when(landscapes.getClosure("combined")).thenReturn(List.of(combined, subject));
        when(landscapes.getClosure("partial")).thenReturn(List.of(partial));
        when(landscapes.getClosure("unrelated")).thenReturn(List.of(unrelated));
        var scope = new CompletionScopeDefinition(1, "scope", "1", Map.of("de", "Abschnitt"), List.of("A", "Q"));
        var resolver = new CompletionCanonicalGraphResolver(landscapes, new ObjectMapper());
        assertThat(resolver.discoverCurriculumIds(List.of(scope))).containsExactly("combined", "subject");
        verify(landscapes, never()).getClosure("legacy");
        verify(landscapes, never()).getClosure("hidden");
    }

    private SkillLandscape landscape(String id, String... goalIds) {
        SkillLandscape landscape = new SkillLandscape();
        landscape.setLandscapeId(id);
        landscape.setGoals(java.util.Arrays.stream(goalIds).map(goalId -> {
            LearningGoal goal = new LearningGoal(); goal.setId(goalId); return goal;
        }).toList());
        return landscape;
    }
}
