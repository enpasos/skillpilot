package com.skillpilot.backend.completion;

import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.domain.Mastery;
import java.util.ArrayDeque;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/** Bounded static compilation cache. All learner outcomes are evaluated per input snapshot. */
@Service
public class CompletionApplicationService {
    private static final String RESOLVER_SEMANTICS_VERSION = "atomic-inherited-prerequisites-v1";
    private final CompletionProfileCatalog catalog;
    private final CompletionTelemetry telemetry;
    private final CompletionProfileCompiler compiler = new CompletionProfileCompiler();
    private final CompletionEvaluator evaluator = new CompletionEvaluator();
    private final Map<CacheKey, CompiledCompletionProfile> cache = new LinkedHashMap<>(16, .75f, true);
    private final Map<String, Map<String, LearningGoal>> canonicalGraphs = new LinkedHashMap<>(4, .75f, true);
    private static final int MAX_CACHED_CONTEXTS = 32;
    private static final long MAX_CACHED_EDGES = 500_000;
    private static final long MAX_CACHED_NODES = 100_000;
    private final int maximumContexts;
    private final long maximumEdges;
    private final long maximumNodes;
    private long cachedEdges;
    private long cachedNodes;
    // Null only during bootstrap or isolated test construction. Contains no learner scope/results.
    private Map<String, Set<String>> preparedContexts;

    @Autowired
    public CompletionApplicationService(CompletionProfileCatalog catalog, CompletionTelemetry telemetry) {
        this(catalog, MAX_CACHED_CONTEXTS, MAX_CACHED_EDGES, MAX_CACHED_NODES, telemetry);
    }
    public CompletionApplicationService(CompletionProfileCatalog catalog) {
        this(catalog, MAX_CACHED_CONTEXTS, MAX_CACHED_EDGES, MAX_CACHED_NODES, CompletionTelemetry.noop());
    }
    CompletionApplicationService(CompletionProfileCatalog catalog, int maximumContexts, long maximumEdges, long maximumNodes) {
        this(catalog, maximumContexts, maximumEdges, maximumNodes, CompletionTelemetry.noop());
    }
    CompletionApplicationService(CompletionProfileCatalog catalog, int maximumContexts, long maximumEdges, long maximumNodes,
            CompletionTelemetry telemetry) {
        if (maximumContexts <= 0 || maximumEdges <= 0 || maximumNodes <= 0) {
            throw new IllegalArgumentException("Completion cache budgets must be positive");
        }
        this.catalog = java.util.Objects.requireNonNull(catalog);
        this.telemetry = java.util.Objects.requireNonNull(telemetry);
        this.maximumContexts = maximumContexts;
        this.maximumEdges = maximumEdges;
        this.maximumNodes = maximumNodes;
    }
    public CompletionProfileCatalog catalog() { return catalog; }
    public void recordStatus(String status) { telemetry.recordStatus(status); }
    public void recordRevisionConflict(CompletionTelemetry.RevisionConflictSource source) {
        telemetry.recordRevisionConflict(source);
    }

    /** Static unfiltered definitions, shared by scopes but never mixed with learner projections. */
    public synchronized Map<String, LearningGoal> canonicalGraph(String curriculumId,
            java.util.function.Supplier<Map<String, LearningGoal>> loader) {
        if (!catalog.available()) throw new IllegalStateException("Completion curriculum generation is unavailable");
        if (preparedContexts != null && !preparedContexts.containsKey(curriculumId)) {
            throw new PreparedContextUnavailableException("Canonical base was not prepared before readiness");
        }
        Map<String, LearningGoal> existing = canonicalGraphs.get(curriculumId);
        if (preparedContexts != null && existing == null) {
            throw new PreparedContextUnavailableException("Prepared canonical base is no longer cached");
        }
        telemetry.cacheRequest(CompletionTelemetry.CacheKind.CANONICAL, existing != null);
        if (existing != null) return existing;
        Map<String, LearningGoal> loaded = java.util.Collections.unmodifiableMap(new LinkedHashMap<>(loader.get()));
        if (loaded.size() > MAX_CACHED_NODES) throw new IllegalArgumentException("Canonical graph exceeds the supported generation budget");
        while (canonicalGraphs.size() >= 4) {
            canonicalGraphs.remove(canonicalGraphs.keySet().iterator().next());
            telemetry.cacheEviction(CompletionTelemetry.CacheKind.CANONICAL);
        }
        canonicalGraphs.put(curriculumId, loaded);
        return loaded;
    }

    public synchronized CompiledCompletionProfile compile(String profileId, String canonicalGraphIdentity,
            Map<String, LearningGoal> canonicalGoals, Set<String> level2TargetIds) {
        if (!catalog.available()) throw new IllegalStateException("Completion curriculum generation is unavailable");
        if (canonicalGraphIdentity == null || canonicalGraphIdentity.isBlank()) {
            throw new IllegalArgumentException("A pinned canonical graph identity is required");
        }
        if (preparedContexts != null && !preparedContexts.getOrDefault(canonicalGraphIdentity, Set.of()).contains(profileId)) {
            throw new PreparedContextUnavailableException("Completion profile/base pair was not prepared before readiness");
        }
        CompletionProfileDefinition profile = catalog.profile(profileId);
        if (profile == null) throw new IllegalArgumentException("Unknown or disabled completion profile");
        CompletionScopeDefinition scope = catalog.scope(profile.levelScopeRef());
        if (scope == null) throw new IllegalArgumentException("Unresolved completion scope");
        CacheKey key = new CacheKey(profile.id(), profile.revision(), scope.revision(),
                catalog.generation(), canonicalGraphIdentity, RESOLVER_SEMANTICS_VERSION);
        CompiledCompletionProfile compiled = cache.get(key);
        if (preparedContexts != null && compiled == null) {
            throw new PreparedContextUnavailableException("Prepared completion context is no longer cached");
        }
        telemetry.cacheRequest(CompletionTelemetry.CacheKind.COMPILED, compiled != null);
        if (compiled != null) {
            if (!level2TargetIds.containsAll(compiled.targetGoalIds())) throw new ScopeNotApplicableException();
            return compiled;
        }
        Set<String> targets = resolveTargets(scope, canonicalGoals);
        if (!level2TargetIds.containsAll(targets)) throw new ScopeNotApplicableException();
        compiled = telemetry.timeCompile(() -> compiler.compile(profile, canonicalGoals, targets, level2TargetIds, catalog.generation()));
        if (compiled.expandedEdgeCount() > maximumEdges || compiled.contextGoalIds().size() > maximumNodes) {
            throw new IllegalArgumentException("Completion context exceeds the reviewed graph budget");
        }
        while (!cache.isEmpty() && (cache.size() >= maximumContexts
                || cachedEdges + compiled.expandedEdgeCount() > maximumEdges
                || cachedNodes + compiled.contextGoalIds().size() > maximumNodes)) {
            CacheKey oldest = cache.keySet().iterator().next();
            CompiledCompletionProfile removed = cache.remove(oldest);
            cachedEdges -= removed.expandedEdgeCount();
            cachedNodes -= removed.contextGoalIds().size();
            telemetry.cacheEviction(CompletionTelemetry.CacheKind.COMPILED);
        }
        cache.put(key, compiled);
        cachedEdges += compiled.expandedEdgeCount();
        cachedNodes += compiled.contextGoalIds().size();
        telemetry.cacheSize(cache.size(), cachedNodes, cachedEdges);
        return compiled;
    }

    public CompletionEvaluation evaluate(CompiledCompletionProfile profile, Map<String, Double> mastery) {
        Set<String> mastered = new LinkedHashSet<>();
        for (String id : profile.contextGoalIds()) {
            Double value = mastery.get(id);
            if (Mastery.isMastered(value)) mastered.add(id);
        }
        return telemetry.timeEvaluate(() -> evaluator.evaluate(profile, mastered));
    }

    /** Startup verifies the complete warm set after all LRU insertions, without recompiling under a learner lock. */
    public synchronized void verifyPrecompiledContexts(Map<String, Set<String>> expectedProfilesByBase) {
        if (!catalog.available()) throw new IllegalStateException("Completion curriculum generation is unavailable");
        for (var base : expectedProfilesByBase.entrySet()) {
            if (!canonicalGraphs.containsKey(base.getKey())) throw new IllegalStateException("Completion warmup exceeds the canonical graph cache budget");
            for (String profileId : base.getValue()) {
                var profile = catalog.profile(profileId);
                var scope = profile == null ? null : catalog.scope(profile.levelScopeRef());
                if (scope == null || !cache.containsKey(new CacheKey(profile.id(), profile.revision(), scope.revision(),
                        catalog.generation(), base.getKey(), RESOLVER_SEMANTICS_VERSION))) {
                    throw new IllegalStateException("Completion warmup exceeds the compiled context cache budget");
                }
            }
        }
    }

    /** Fix the verified static input universe before readiness; no future learner call may trigger cold work. */
    public synchronized void sealPreparedContexts(Map<String, Set<String>> expectedProfilesByBase) {
        verifyPrecompiledContexts(expectedProfilesByBase);
        Map<String, Set<String>> copied = new LinkedHashMap<>();
        expectedProfilesByBase.forEach((base, profiles) -> copied.put(base, Set.copyOf(profiles)));
        Map<String, Set<String>> prepared = java.util.Collections.unmodifiableMap(copied);
        if (preparedContexts != null && !preparedContexts.equals(prepared)) {
            throw new IllegalStateException("Prepared completion inputs cannot change within a pinned generation");
        }
        preparedContexts = prepared;
    }

    public Set<String> resolveTargets(CompletionScopeDefinition scope, Map<String, LearningGoal> graph) {
        Set<String> result = new LinkedHashSet<>();
        Set<String> seen = new LinkedHashSet<>();
        ArrayDeque<String> pending = new ArrayDeque<>(scope.targetRootIds());
        while (!pending.isEmpty()) {
            String id = pending.removeFirst();
            if (!seen.add(id)) continue;
            LearningGoal goal = graph.get(id);
            if (goal == null) throw new CompletionCompilationException("MISSING_REFERENCE", "Unresolved scope root: " + id);
            if (goal.getContains() == null || goal.getContains().isEmpty()) result.add(id);
            else pending.addAll(goal.getContains());
        }
        if (result.isEmpty()) throw new IllegalArgumentException("Completion scope has no atomic targets");
        return result;
    }

    public static class ScopeNotApplicableException extends IllegalArgumentException { }
    public static class PreparedContextUnavailableException extends IllegalStateException {
        public PreparedContextUnavailableException(String message) { super(message); }
    }
    private record CacheKey(String id, String revision, String scopeRevision, String generation,
                            String canonicalGraphIdentity, String resolverSemanticsVersion) { }
}
