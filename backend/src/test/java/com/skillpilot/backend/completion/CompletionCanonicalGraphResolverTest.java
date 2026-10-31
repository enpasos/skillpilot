package com.skillpilot.backend.completion;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.landscape.SkillLandscape;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class CompletionCanonicalGraphResolverTest {
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
