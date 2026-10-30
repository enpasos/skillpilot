package com.skillpilot.backend.completion;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.skillpilot.backend.landscape.LearningGoal;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.Test;

class CompletionTelemetryTest {
    @Test
    void measuresOnlyActualCompilationAndEvaluationWithAccurateCacheSizes() {
        var registry = new SimpleMeterRegistry();
        var telemetry = new CompletionTelemetry(registry);
        var service = service(telemetry, false);
        var graph = graph();
        service.canonicalGraph("base", () -> graph);
        service.canonicalGraph("base", () -> { throw new AssertionError("Cache miss"); });
        var compiled = service.compile("pilot", "base", graph, graph.keySet());
        service.compile("pilot", "base", Map.of(), graph.keySet());
        assertThat(service.evaluate(compiled, Map.of("assessment", 1.0)).complete()).isTrue();
        assertThat(registry.get("skillpilot.completion.compile").timer().count()).isEqualTo(1);
        assertThat(registry.get("skillpilot.completion.evaluate").timer().count()).isEqualTo(1);
        for (String cache : List.of("canonical", "compiled")) {
            for (String result : List.of("hit", "miss")) {
                assertThat(registry.get("skillpilot.completion.cache.requests").tags("cache", cache, "result", result).counter().count()).isEqualTo(1);
            }
        }
        assertThat(registry.get("skillpilot.completion.cache.contexts").gauge().value()).isEqualTo(1);
        assertThat(registry.get("skillpilot.completion.cache.nodes").gauge().value()).isEqualTo(2);
        assertThat(registry.get("skillpilot.completion.cache.edges").gauge().value()).isEqualTo(1);
    }

    @Test
    void evictionsAndUnexpectedStatusInputCannotCreateUnboundedMetricLabels() {
        var registry = new SimpleMeterRegistry();
        var service = service(new CompletionTelemetry(registry), false);
        var graph = graph();
        service.compile("pilot", "first-base", graph, graph.keySet());
        service.compile("pilot", "second-base", graph, graph.keySet());
        for (int index = 0; index < 5; index++) service.canonicalGraph("base-" + index, () -> graph);
        for (String cache : List.of("canonical", "compiled")) {
            assertThat(registry.get("skillpilot.completion.cache.evictions").tag("cache", cache).counter().count()).isEqualTo(1);
        }
        assertThat(registry.get("skillpilot.completion.cache.contexts").gauge().value()).isEqualTo(1);
        assertThat(registry.get("skillpilot.completion.cache.nodes").gauge().value()).isEqualTo(2);
        int meters = registry.getMeters().size();
        service.recordStatus("valid");
        for (int index = 0; index < 100; index++) service.recordStatus("arbitrary-learner-or-profile-id-" + index);
        service.recordStatus(null);
        assertThat(registry.getMeters()).hasSize(meters);
        assertThat(registry.get("skillpilot.completion.scope.status").tag("status", "valid").counter().count()).isEqualTo(1);
        assertThat(registry.get("skillpilot.completion.scope.status").tag("status", "unknown").counter().count()).isEqualTo(101);
        Set<String> values = Set.of("canonical", "compiled", "hit", "miss", "valid", "unresolved", "unavailable", "invalid", "notApplicable", "unknown", "ui", "coach");
        registry.getMeters().forEach(meter -> meter.getId().getTags().forEach(tag -> {
            assertThat(tag.getKey()).isIn("cache", "result", "status", "source");
            assertThat(tag.getValue()).isIn(values);
        }));
    }

    @Test
    void revisionConflictsUseOnlyTheTwoFixedSourcesAndRemainSafeWithoutRegistry() {
        var registry = new SimpleMeterRegistry();
        var telemetry = new CompletionTelemetry(registry);
        int meterCount = registry.getMeters().size();
        telemetry.recordRevisionConflict(CompletionTelemetry.RevisionConflictSource.UI);
        telemetry.recordRevisionConflict(CompletionTelemetry.RevisionConflictSource.COACH);
        telemetry.recordRevisionConflict(CompletionTelemetry.RevisionConflictSource.COACH);
        assertThat(registry.get("skillpilot.completion.revision.conflicts").tag("source", "ui").counter().count()).isEqualTo(1);
        assertThat(registry.get("skillpilot.completion.revision.conflicts").tag("source", "coach").counter().count()).isEqualTo(2);
        assertThat(registry.getMeters()).hasSize(meterCount);
        CompletionTelemetry.noop().recordRevisionConflict(CompletionTelemetry.RevisionConflictSource.UI);
    }

    @Test
    void failedPureCompilationIsTimedWithoutPublishingAnInvalidContext() {
        var registry = new SimpleMeterRegistry();
        var service = service(new CompletionTelemetry(registry), true);
        var graph = graph();
        assertThatThrownBy(() -> service.compile("pilot", "base", graph, graph.keySet()))
                .isInstanceOf(CompletionCompilationException.class);
        assertThat(registry.get("skillpilot.completion.compile").timer().count()).isEqualTo(1);
        assertThat(registry.get("skillpilot.completion.cache.contexts").gauge().value()).isZero();
        assertThat(registry.get("skillpilot.completion.cache.nodes").gauge().value()).isZero();
        assertThat(registry.get("skillpilot.completion.cache.edges").gauge().value()).isZero();
    }

    private CompletionApplicationService service(CompletionTelemetry telemetry, boolean protectedWaiver) {
        var profile = new CompletionProfileDefinition(1, "pilot", "1", Map.of("de", "Pilot", "en", "Pilot"),
                "scope", Map.of(), List.of(), new CompletionProfileDefinition.Review("review", "scope-v1", "task-v1", "rubric-v1"),
                List.of(new CompletionProfileDefinition.WaiverRule("rule", List.of("assessment"),
                        List.of(protectedWaiver ? "assessment" : "preparation"), "Reviewed synthetic coverage", "review")));
        var scope = new CompletionScopeDefinition(1, "scope", "1", profile.title(), List.of("preparation", "assessment"));
        return new CompletionApplicationService(new CompletionProfileCatalog(Map.of("pilot", profile), Map.of("scope", scope), "generation"),
                1, 100, 100, telemetry);
    }

    private Map<String, LearningGoal> graph() {
        LearningGoal preparation = new LearningGoal();
        preparation.setId("preparation"); preparation.setTitle("Preparation");
        preparation.setContains(List.of()); preparation.setRequires(List.of());
        LearningGoal assessment = new LearningGoal();
        assessment.setId("assessment"); assessment.setTitle("Assessment"); assessment.setNodeKind("exam");
        assessment.setContains(List.of()); assessment.setRequires(List.of("preparation"));
        return Map.of("preparation", preparation, "assessment", assessment);
    }
}
