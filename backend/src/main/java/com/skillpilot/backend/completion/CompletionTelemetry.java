package com.skillpilot.backend.completion;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import java.util.function.Supplier;
import org.springframework.stereotype.Component;

/** Fixed-cardinality operational metrics. No learner, profile or curriculum identities are labels. */
@Component
public final class CompletionTelemetry {
    private static final CompletionTelemetry NOOP = new CompletionTelemetry(null);
    public enum CacheKind {
        CANONICAL("canonical"), COMPILED("compiled");
        private final String label;
        CacheKind(String label) { this.label = label; }
    }
    public enum RevisionConflictSource {
        UI("ui"), COACH("coach");
        private final String label;
        RevisionConflictSource(String label) { this.label = label; }
    }
    private enum ScopeStatus {
        VALID("valid"), UNRESOLVED("unresolved"), UNAVAILABLE("unavailable"), INVALID("invalid"),
        NOT_APPLICABLE("notApplicable"), UNKNOWN("unknown");
        private final String label;
        ScopeStatus(String label) { this.label = label; }
    }
    private final Timer compileTimer;
    private final Timer evaluateTimer;
    private final Counter[][] requests = new Counter[CacheKind.values().length][2];
    private final Counter[] evictions = new Counter[CacheKind.values().length];
    private final Counter[] statuses = new Counter[ScopeStatus.values().length];
    private final Counter[] revisionConflicts = new Counter[RevisionConflictSource.values().length];
    private volatile CacheSize size = new CacheSize(0, 0, 0);

    public CompletionTelemetry(MeterRegistry registry) {
        if (registry == null) { compileTimer = null; evaluateTimer = null; return; }
        compileTimer = Timer.builder("skillpilot.completion.compile")
                .description("Pure static completion graph compilation time").register(registry);
        evaluateTimer = Timer.builder("skillpilot.completion.evaluate")
                .description("Pure completion evaluation over binary mastery").register(registry);
        for (CacheKind cache : CacheKind.values()) {
            requests[cache.ordinal()][0] = registry.counter("skillpilot.completion.cache.requests", "cache", cache.label, "result", "hit");
            requests[cache.ordinal()][1] = registry.counter("skillpilot.completion.cache.requests", "cache", cache.label, "result", "miss");
            evictions[cache.ordinal()] = registry.counter("skillpilot.completion.cache.evictions", "cache", cache.label);
        }
        for (ScopeStatus status : ScopeStatus.values()) {
            statuses[status.ordinal()] = registry.counter("skillpilot.completion.scope.status", "status", status.label);
        }
        for (RevisionConflictSource source : RevisionConflictSource.values()) {
            revisionConflicts[source.ordinal()] = Counter.builder("skillpilot.completion.revision.conflicts")
                    .description("Rejected completion writes with a mismatched expected or replay revision")
                    .tag("source", source.label).register(registry);
        }
        // Scrapes never acquire a completion-service or learner lock.
        Gauge.builder("skillpilot.completion.cache.contexts", this, value -> value.size.contexts()).register(registry);
        Gauge.builder("skillpilot.completion.cache.nodes", this, value -> value.size.nodes()).register(registry);
        Gauge.builder("skillpilot.completion.cache.edges", this, value -> value.size.edges()).register(registry);
    }

    public static CompletionTelemetry noop() { return NOOP; }
    public <T> T timeCompile(Supplier<T> operation) {
        return compileTimer == null ? operation.get() : compileTimer.record(operation);
    }
    public <T> T timeEvaluate(Supplier<T> operation) {
        return evaluateTimer == null ? operation.get() : evaluateTimer.record(operation);
    }
    public void cacheRequest(CacheKind cache, boolean hit) {
        Counter counter = requests[cache.ordinal()][hit ? 0 : 1];
        if (counter != null) counter.increment();
    }
    public void cacheEviction(CacheKind cache) {
        Counter counter = evictions[cache.ordinal()];
        if (counter != null) counter.increment();
    }
    public void cacheSize(int contexts, long nodes, long edges) { size = new CacheSize(contexts, nodes, edges); }

    /** Map wire values to this closed label set; unexpected input never becomes a label. */
    public void recordStatus(String wireStatus) {
        ScopeStatus status = switch (wireStatus == null ? "" : wireStatus) {
            case "valid" -> ScopeStatus.VALID;
            case "unresolved" -> ScopeStatus.UNRESOLVED;
            case "unavailable" -> ScopeStatus.UNAVAILABLE;
            case "invalid" -> ScopeStatus.INVALID;
            case "notApplicable" -> ScopeStatus.NOT_APPLICABLE;
            default -> ScopeStatus.UNKNOWN;
        };
        Counter counter = statuses[status.ordinal()];
        if (counter != null) counter.increment();
    }
    /** Only actual numeric revision mismatches are counted, never other HTTP 409 causes. */
    public void recordRevisionConflict(RevisionConflictSource source) {
        Counter counter = revisionConflicts[source.ordinal()];
        if (counter != null) counter.increment();
    }
    private record CacheSize(int contexts, long nodes, long edges) { }
}
