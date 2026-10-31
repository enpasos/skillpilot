package com.skillpilot.backend.completion;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.anyCollection;

import com.skillpilot.backend.landscape.LearningGoal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.Test;

class CompletionWarmupRunnerTest {
    @Test
    void emptyConfigurationDiscoversAndWarmsMatchingCurrentBases() {
        Fixture fixture = fixture("pilot");
        var application = new CompletionApplicationService(fixture.catalog());
        var resolver = mock(CompletionCanonicalGraphResolver.class);
        when(resolver.discoverCurriculumIds(anyCollection())).thenReturn(List.of("subject", "combined"));
        when(resolver.load("subject")).thenReturn(fixture.graph());
        when(resolver.load("combined")).thenReturn(fixture.graph());
        new CompletionWarmupRunner(application, resolver, " ").run(null);
        assertThat(application.compile("pilot", "subject", Map.of(), fixture.graph().keySet()).targetGoalIds()).hasSize(2);
        assertThat(application.compile("pilot", "combined", Map.of(), fixture.graph().keySet()).targetGoalIds()).hasSize(2);
        verify(resolver).discoverCurriculumIds(fixture.catalog().profiles().values().stream()
                .map(profile -> fixture.catalog().scope(profile.levelScopeRef())).toList());
    }

    @Test
    void warmsThePinnedGraphAndStaticProfileBeforeAnyLearnerCall() {
        Fixture fixture = fixture("pilot");
        var application = new CompletionApplicationService(fixture.catalog());
        var resolver = mock(CompletionCanonicalGraphResolver.class);
        when(resolver.load("base")).thenReturn(fixture.graph());
        var runner = new CompletionWarmupRunner(application, resolver, " base,base ");
        runner.run(null);
        runner.run(null);

        assertThat(application.canonicalGraph("base", () -> {
            throw new AssertionError("Learner call must use the warmed canonical graph");
        })).containsExactlyInAnyOrderEntriesOf(fixture.graph());
        // A cache miss could not resolve these roots from the empty graph.
        var compiled = application.compile("pilot", "base", Map.of(), fixture.graph().keySet());
        assertThat(compiled.targetGoalIds()).containsExactlyInAnyOrder("pilot-preparation", "pilot-assessment");
        assertThatThrownBy(() -> application.compile("pilot", "base", Map.of(), Set.of("pilot-assessment")))
                .isInstanceOf(CompletionApplicationService.ScopeNotApplicableException.class);
        assertThatThrownBy(() -> application.compile("pilot", "another-base", Map.of(), fixture.graph().keySet()))
                .isInstanceOf(CompletionApplicationService.PreparedContextUnavailableException.class);
        verify(resolver).load("base");
    }

    @Test
    void disabledCompletionDoesNotReadAnyStaticGraph() {
        var catalog = mock(CompletionProfileCatalog.class);
        when(catalog.enabled()).thenReturn(false);
        var resolver = mock(CompletionCanonicalGraphResolver.class);
        new CompletionWarmupRunner(new CompletionApplicationService(catalog), resolver, "base").run(null);
        verifyNoInteractions(resolver);
    }

    @Test
    void theSinglePilotProfileCanWarmMultipleExplicitCanonicalBases() {
        Fixture fixture = fixture("pilot");
        var application = new CompletionApplicationService(fixture.catalog());
        var resolver = mock(CompletionCanonicalGraphResolver.class);
        when(resolver.load("left-base")).thenReturn(fixture.graph());
        when(resolver.load("right-base")).thenReturn(fixture.graph());
        new CompletionWarmupRunner(application, resolver, "left-base,right-base").run(null);
        assertThat(application.compile("pilot", "left-base", Map.of(), fixture.graph().keySet()).definition().id()).isEqualTo("pilot");
        assertThat(application.compile("pilot", "right-base", Map.of(), fixture.graph().keySet()).definition().id()).isEqualTo("pilot");
    }

    @Test
    void multipleEnabledProfilesFailBeforeReadingAnyCanonicalGraph() {
        Fixture left = fixture("left"); Fixture right = fixture("right");
        var catalog = new CompletionProfileCatalog(Map.of("left", left.catalog().profile("left"),
                "right", right.catalog().profile("right")), Map.of("left", left.catalog().scope("left"),
                "right", right.catalog().scope("right")), "generation");
        var resolver = mock(CompletionCanonicalGraphResolver.class);
        assertThatThrownBy(() -> new CompletionWarmupRunner(new CompletionApplicationService(catalog), resolver, "base").run(null))
                .isInstanceOf(IllegalStateException.class).hasMessageContaining("at most one enabled profile");
        verifyNoInteractions(resolver);
    }

    @Test
    void multipleRequiredAssessmentsFailThePilotBudgetWithoutRestrictingThePureCompiler() {
        Fixture fixture = fixture("pilot");
        Map<String, LearningGoal> graph = new LinkedHashMap<>(fixture.graph());
        LearningGoal another = goal("pilot-another-assessment"); another.setNodeKind("exam");
        another.setRequires(List.of("pilot-preparation")); graph.put(another.getId(), another);
        var scope = new CompletionScopeDefinition(1, "pilot", "1", fixture.catalog().scope("pilot").title(), List.copyOf(graph.keySet()));
        var catalog = new CompletionProfileCatalog(fixture.catalog().profiles(), Map.of("pilot", scope), "generation");
        var application = new CompletionApplicationService(catalog);
        assertThat(application.compile("pilot", "base", graph, graph.keySet()).assessmentGoalIds()).hasSize(2);
        var resolver = mock(CompletionCanonicalGraphResolver.class);
        when(resolver.load("base")).thenReturn(graph);
        assertThatThrownBy(() -> new CompletionWarmupRunner(application, resolver, "base").run(null))
                .isInstanceOf(IllegalStateException.class).hasMessageContaining("at most one required assessment")
                .hasMessageContaining("pilot").hasMessageContaining("generation");
    }

    @Test
    void missingMatchingCurriculumAndUnavailableGenerationFailBeforeReadiness() {
        Fixture fixture = fixture("pilot");
        var resolver = mock(CompletionCanonicalGraphResolver.class);
        assertThatThrownBy(() -> new CompletionWarmupRunner(new CompletionApplicationService(fixture.catalog()), resolver, " ").run(null))
                .isInstanceOf(IllegalStateException.class).hasMessageContaining("warmup-curriculum-ids");
        var unavailable = mock(CompletionProfileCatalog.class);
        when(unavailable.enabled()).thenReturn(true);
        when(unavailable.profiles()).thenReturn(fixture.catalog().profiles());
        when(unavailable.available()).thenReturn(false);
        assertThatThrownBy(() -> new CompletionWarmupRunner(new CompletionApplicationService(unavailable), resolver, "base").run(null))
                .isInstanceOf(IllegalStateException.class).hasMessageContaining("unavailable curriculum generation");
        verify(resolver).discoverCurriculumIds(anyCollection());
        verifyNoMoreInteractions(resolver);
    }

    @Test
    void unresolvedOrInvalidConfiguredProfilesFailWithStartupDiagnostics() {
        Fixture fixture = fixture("pilot");
        var resolver = mock(CompletionCanonicalGraphResolver.class);
        when(resolver.load("wrong-base")).thenReturn(fixture("other").graph());
        assertThatThrownBy(() -> new CompletionWarmupRunner(new CompletionApplicationService(fixture.catalog()), resolver, "wrong-base").run(null))
                .isInstanceOf(IllegalStateException.class).hasMessageContaining("wrong-base").hasMessageContaining("pilot");
        var invalid = fixture.catalog().profile("pilot");
        var invalidRule = new CompletionProfileDefinition.WaiverRule("rule", List.of("pilot-assessment"),
                List.of("pilot-assessment"), "Invalid protected waiver", "review");
        var bad = new CompletionProfileDefinition(1, "pilot", "1", invalid.title(), "pilot", Map.of(), List.of(),
                invalid.review(), List.of(invalidRule));
        var catalog = new CompletionProfileCatalog(Map.of("pilot", bad), Map.of("pilot", fixture.catalog().scope("pilot")), "generation");
        when(resolver.load("base")).thenReturn(fixture.graph());
        assertThatThrownBy(() -> new CompletionWarmupRunner(new CompletionApplicationService(catalog), resolver, "base").run(null))
                .isInstanceOf(IllegalStateException.class).hasMessageContaining("profile pilot")
                .hasMessageContaining("curriculum base").hasMessageContaining("generation");
    }

    @Test
    void cacheEvictionCannotPretendThatAllConfiguredContextsRemainWarm() {
        Fixture fixture = fixture("pilot");
        var resolver = mock(CompletionCanonicalGraphResolver.class);
        when(resolver.load("base-a")).thenReturn(fixture.graph());
        when(resolver.load("base-b")).thenReturn(fixture.graph());
        var application = new CompletionApplicationService(fixture.catalog(), 1, 100, 100);
        assertThatThrownBy(() -> new CompletionWarmupRunner(application, resolver, "base-a,base-b").run(null))
                .isInstanceOf(IllegalStateException.class).hasMessageContaining("cannot retain");
    }

    private Fixture fixture(String id) {
        LearningGoal preparation = goal(id + "-preparation");
        LearningGoal assessment = goal(id + "-assessment");
        assessment.setNodeKind("exam");
        assessment.setRequires(List.of(preparation.getId()));
        Map<String, LearningGoal> graph = Map.of(preparation.getId(), preparation, assessment.getId(), assessment);
        var scope = new CompletionScopeDefinition(1, id, "1", Map.of("de", id, "en", id), List.of(preparation.getId(), assessment.getId()));
        var review = new CompletionProfileDefinition.Review("review", "scope-v1", "task-v1", "rubric-v1");
        var profile = new CompletionProfileDefinition(1, id, "1", Map.of("de", id, "en", id), id, Map.of(), List.of(), review,
                List.of(new CompletionProfileDefinition.WaiverRule("rule", List.of(assessment.getId()), List.of(preparation.getId()),
                        "Reviewed synthetic coverage", "review")));
        return new Fixture(new CompletionProfileCatalog(Map.of(id, profile), Map.of(id, scope), "generation"), graph);
    }

    private LearningGoal goal(String id) {
        LearningGoal goal = new LearningGoal();
        goal.setId(id); goal.setType("atomic"); goal.setTitle(id);
        goal.setContains(List.of()); goal.setRequires(List.of());
        return goal;
    }

    private record Fixture(CompletionProfileCatalog catalog, Map<String, LearningGoal> graph) { }
}
