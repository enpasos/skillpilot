package com.skillpilot.backend.completion;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.landscape.LearningGoal;
import java.lang.management.ManagementFactory;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;

/**
 * Opt-in measurement, not a shared-runner timing gate. Run with
 * SKILLPILOT_COMPLETION_BENCHMARK=true ./gradlew test --tests '*CompletionPerformanceTest'.
 * The JSON artifact documents the hardware, exact workload and measurement limitations.
 */
@EnabledIfEnvironmentVariable(named = "SKILLPILOT_COMPLETION_BENCHMARK", matches = "true")
class CompletionPerformanceTest {
    private static final int WARMUP_ITERATIONS = 40;
    private static final int MEASURED_ITERATIONS = 100;
    private static final String ASSESSMENT = "v00000";
    private static final String PROFILE = "synthetic-benchmark";
    private static final String GENERATION = "deterministic-completion-benchmark-v1";
    private static volatile Object retainedResult;

    @Test
    void recordsDeterministicScalingColdCompilationAndConcurrentCacheMisses() throws Exception {
        Instant startedAt = Instant.now();
        List<Map<String, Object>> measurements = new ArrayList<>();
        for (int size : List.of(100, 1_000, 10_000)) {
            for (String shape : List.of("chain", "diamonds", "shared-prerequisites", "dense-clusters")) {
                measurements.add(measure(dataset(shape, size, null)));
            }
        }
        Dataset budgetDataset = dataset("bounded-dense-dag", 10_000, 100_000L);
        measurements.add(measure(budgetDataset));
        Map<String, Object> report = new LinkedHashMap<>();
        report.put("schemaVersion", 1);
        report.put("startedAt", startedAt.toString());
        report.put("sourceRevision", System.getenv().getOrDefault("GITHUB_SHA", "not supplied"));
        report.put("environment", environment());
        report.put("method", Map.of(
                "clock", "System.nanoTime; durations include returned-set and explanation-map construction",
                "warmupIterationsPerSnapshot", WARMUP_ITERATIONS,
                "measuredIterationsPerSnapshot", MEASURED_ITERATIONS,
                "masterySnapshots", List.of("no goals mastered: all expanded edges propagate blockers",
                        "assessment mastered: the one rule enables every ordinary goal"),
                "ruleReferences", "one assessment plus every ordinary goal; counted explicitly per dataset",
                "coldCompile", "first compilation of this dataset in the same JVM; JVM/compiler code may already be warm",
                "heap", "observed used heap and peak pools; includes uncollected garbage, not a retained-size proof",
                "timingGate", "none; 25ms warm p95 is recorded as a design target, not asserted on shared CI",
                "scope", "pure compiler/evaluator/cache only; no database, HTTP, host acceptance or end-to-end latency claim"));
        report.put("datasets", measurements);
        report.put("sameKeyConcurrentFirstAccess", concurrentCompilation(budgetDataset));
        Path output = Path.of(System.getenv().getOrDefault("SKILLPILOT_COMPLETION_BENCHMARK_OUTPUT",
                "build/reports/assessment-completion/benchmark.json"));
        if (output.toAbsolutePath().getParent() != null) Files.createDirectories(output.toAbsolutePath().getParent());
        new ObjectMapper().writerWithDefaultPrettyPrinter().writeValue(output.toFile(), report);
        System.out.println("Completion performance evidence: " + output.toAbsolutePath());
    }

    private Map<String, Object> measure(Dataset data) {
        ManagementFactory.getMemoryPoolMXBeans().stream()
                .filter(pool -> pool.getType() == java.lang.management.MemoryType.HEAP)
                .forEach(pool -> pool.resetPeakUsage());
        long heapBefore = usedHeap();
        long allocatedBefore = allocatedBytes();
        long started = System.nanoTime();
        var compiled = new CompletionProfileCompiler().compile(data.profile(), data.graph(), data.targets(),
                data.targets(), GENERATION);
        long compileNanos = System.nanoTime() - started;
        long allocatedAfter = allocatedBytes();
        long heapAfter = usedHeap();
        assertThat(compiled.contextGoalIds()).hasSize(data.atomicNodes());
        if (data.requestedEdges() != null) assertThat(compiled.expandedEdgeCount()).isEqualTo(data.requestedEdges());
        var evaluator = new CompletionEvaluator();
        assertThat(evaluator.evaluate(compiled, Set.of()).complete()).isFalse();
        assertThat(evaluator.evaluate(compiled, Set.of(ASSESSMENT)).complete()).isTrue();
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("shape", data.shape());
        result.put("atomicContextNodes", compiled.contextGoalIds().size());
        result.put("authoredNodesIncludingClusters", data.graph().size());
        result.put("expandedEdges", compiled.expandedEdgeCount());
        result.put("ruleCount", data.profile().rules().size());
        result.put("ruleReferenceCount", data.profile().rules().stream()
                .mapToInt(rule -> rule.assessmentGoalIds().size() + rule.waivableGoalIds().size()).sum());
        result.put("coldCompileMs", milliseconds(compileNanos));
        result.put("heapUsedBeforeCompileBytes", heapBefore);
        result.put("heapUsedAfterCompileBytes", heapAfter);
        result.put("heapUsedCompileDeltaBytes", heapAfter - heapBefore);
        if (allocatedBefore >= 0 && allocatedAfter >= allocatedBefore) {
            result.put("threadAllocatedCompileBytes", allocatedAfter - allocatedBefore);
        }
        result.put("warmNoMastery", warmEvaluation(evaluator, compiled, Set.of()));
        result.put("warmAssessmentMastered", warmEvaluation(evaluator, compiled, Set.of(ASSESSMENT)));
        result.put("heapUsedAfterEvaluationBytes", usedHeap());
        result.put("sumHeapPoolPeaksSinceMeasurementStartBytes", ManagementFactory.getMemoryPoolMXBeans().stream()
                .filter(pool -> pool.getType() == java.lang.management.MemoryType.HEAP)
                .mapToLong(pool -> pool.getPeakUsage().getUsed()).sum());
        return result;
    }

    private Map<String, Object> warmEvaluation(CompletionEvaluator evaluator,
            CompiledCompletionProfile compiled, Set<String> mastery) {
        for (int i = 0; i < WARMUP_ITERATIONS; i++) retainedResult = evaluator.evaluate(compiled, mastery);
        long allocatedBefore = allocatedBytes();
        long[] durations = new long[MEASURED_ITERATIONS];
        for (int i = 0; i < durations.length; i++) {
            long start = System.nanoTime();
            retainedResult = evaluator.evaluate(compiled, mastery);
            durations[i] = System.nanoTime() - start;
        }
        long allocatedAfter = allocatedBytes();
        Arrays.sort(durations);
        double p95 = milliseconds(durations[(int) Math.ceil(durations.length * .95) - 1]);
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("p50Ms", milliseconds(durations[durations.length / 2]));
        stats.put("p95Ms", p95);
        stats.put("maxMs", milliseconds(durations[durations.length - 1]));
        stats.put("designTargetP95Ms", 25);
        stats.put("withinDesignTarget", p95 <= 25);
        if (allocatedBefore >= 0 && allocatedAfter >= allocatedBefore) {
            stats.put("meanThreadAllocatedBytes", (allocatedAfter - allocatedBefore) / durations.length);
        }
        return stats;
    }

    private Map<String, Object> concurrentCompilation(Dataset data) throws Exception {
        var scope = new CompletionScopeDefinition(1, PROFILE, "1", data.profile().title(), List.copyOf(data.targets()));
        var service = new CompletionApplicationService(new CompletionProfileCatalog(
                Map.of(PROFILE, data.profile()), Map.of(PROFILE, scope), GENERATION));
        int workers = 8;
        var ready = new CountDownLatch(workers);
        var begin = new CountDownLatch(1);
        var executor = Executors.newFixedThreadPool(workers);
        List<java.util.concurrent.Future<TimedCompilation>> futures = new ArrayList<>();
        try {
            for (int i = 0; i < workers; i++) futures.add(executor.submit(() -> {
                ready.countDown();
                if (!begin.await(30, TimeUnit.SECONDS)) throw new IllegalStateException("Benchmark start barrier timed out");
                long start = System.nanoTime();
                var result = service.compile(PROFILE, "synthetic-base", data.graph(), data.targets());
                return new TimedCompilation(result, System.nanoTime() - start);
            }));
            assertThat(ready.await(30, TimeUnit.SECONDS)).isTrue();
            long start = System.nanoTime();
            begin.countDown();
            List<TimedCompilation> results = new ArrayList<>();
            for (var future : futures) results.add(future.get(30, TimeUnit.SECONDS));
            long total = System.nanoTime() - start;
            var first = results.getFirst().compiled();
            assertThat(results).allSatisfy(result -> assertThat(result.compiled()).isSameAs(first));
            long warmStart = System.nanoTime();
            assertThat(service.compile(PROFILE, "synthetic-base", data.graph(), data.targets())).isSameAs(first);
            return Map.of("workers", workers, "atomicContextNodes", first.contextGoalIds().size(),
                    "expandedEdges", first.expandedEdgeCount(), "wallMs", milliseconds(total),
                    "callerMs", results.stream().map(result -> milliseconds(result.elapsedNanos())).toList(),
                    "oneSharedResultInstance", true, "subsequentLookupMs", milliseconds(System.nanoTime() - warmStart));
        } finally {
            begin.countDown();
            executor.shutdownNow();
        }
    }

    private Dataset dataset(String shape, int n, Long requestedEdges) {
        Map<String, LearningGoal> graph = new LinkedHashMap<>();
        List<LinkedHashSet<String>> edges = new ArrayList<>();
        for (int i = 0; i < n; i++) edges.add(new LinkedHashSet<>());
        // A sentinel assessment reaches all ordinary nodes without changing their
        // authored relationships. Every listed waiver is therefore a real prerequisite.
        for (int i = 1; i < n; i++) edges.getFirst().add(id(i));
        switch (shape) {
            case "chain" -> {
                for (int i = 1; i + 1 < n; i++) edges.get(i).add(id(i + 1));
            }
            case "diamonds" -> {
                for (int i = 1; i + 3 < n; i += 4) {
                    edges.get(i).addAll(List.of(id(i + 1), id(i + 2)));
                    edges.get(i + 1).add(id(i + 3)); edges.get(i + 2).add(id(i + 3));
                }
            }
            case "shared-prerequisites" -> {
                int sharedStart = Math.max(2, n - 10);
                for (int i = 1; i < sharedStart; i++) {
                    for (int j = sharedStart; j < n; j++) edges.get(i).add(id(j));
                }
            }
            case "dense-clusters" -> {
                for (int start = 1; start < n; start += 10) {
                    List<String> children = new ArrayList<>();
                    for (int i = start; i < Math.min(start + 10, n); i++) children.add(id(i));
                    String clusterId = "cluster-" + start;
                    graph.put(clusterId, goal(clusterId,
                            start + 10 < n ? List.of("cluster-" + (start + 10)) : List.of(), children, false));
                }
            }
            case "bounded-dense-dag" -> {
                long count = n - 1;
                for (int distance = 1; count < requestedEdges && distance < n; distance++) {
                    for (int i = 1; count < requestedEdges && i + distance < n; i++) {
                        if (edges.get(i).add(id(i + distance))) count++;
                    }
                }
                assertThat(count).isEqualTo(requestedEdges);
            }
            default -> throw new IllegalArgumentException("Unknown benchmark shape: " + shape);
        }
        LinkedHashSet<String> targets = new LinkedHashSet<>();
        for (int i = 0; i < n; i++) {
            graph.put(id(i), goal(id(i), List.copyOf(edges.get(i)), List.of(), i == 0));
            targets.add(id(i));
        }
        var profile = new CompletionProfileDefinition(1, PROFILE, "1",
                Map.of("de", "Synthetischer Messabschnitt", "en", "Synthetic benchmark section"), PROFILE,
                Map.of(), List.of(), new CompletionProfileDefinition.Review("synthetic", "scope-1", "task-1", "rubric-1"),
                List.of(new CompletionProfileDefinition.WaiverRule("synthetic-rule", List.of(ASSESSMENT),
                        targets.stream().filter(target -> !ASSESSMENT.equals(target)).toList(), "synthetic measurement", "synthetic")));
        return new Dataset(shape, n, requestedEdges, graph,
                java.util.Collections.unmodifiableSet(new LinkedHashSet<>(targets)), profile);
    }

    private Map<String, Object> environment() {
        Map<String, Object> result = new LinkedHashMap<>();
        for (String name : List.of("java.version", "java.vendor", "java.vm.name", "java.vm.version", "os.name", "os.version", "os.arch")) {
            result.put(name, System.getProperty(name));
        }
        result.put("availableProcessors", Runtime.getRuntime().availableProcessors());
        result.put("maxHeapBytes", Runtime.getRuntime().maxMemory());
        result.put("garbageCollectors", ManagementFactory.getGarbageCollectorMXBeans().stream().map(bean -> bean.getName()).toList());
        result.put("cpuModel", firstLine(Path.of("/proc/cpuinfo"), "model name"));
        result.put("cpuAffinity", firstLine(Path.of("/proc/self/status"), "Cpus_allowed_list"));
        result.put("cgroupCpuMax", readOptional(Path.of("/sys/fs/cgroup/cpu.max")));
        result.put("cgroupMemoryMax", readOptional(Path.of("/sys/fs/cgroup/memory.max")));
        result.put("runnerImage", System.getenv().getOrDefault("ImageVersion", "not supplied"));
        return result;
    }

    private static String firstLine(Path path, String prefix) {
        try (var lines = Files.lines(path)) { return lines.filter(line -> line.startsWith(prefix)).findFirst().orElse("unavailable"); }
        catch (java.io.IOException ignored) { return "unavailable"; }
    }
    private static String readOptional(Path path) {
        try { return Files.readString(path).trim(); } catch (java.io.IOException ignored) { return "unavailable"; }
    }
    private static long usedHeap() { return ManagementFactory.getMemoryMXBean().getHeapMemoryUsage().getUsed(); }
    private static long allocatedBytes() {
        var threads = ManagementFactory.getThreadMXBean();
        return threads instanceof com.sun.management.ThreadMXBean allocation && allocation.isThreadAllocatedMemorySupported()
                && allocation.isThreadAllocatedMemoryEnabled() ? allocation.getThreadAllocatedBytes(Thread.currentThread().threadId()) : -1;
    }
    private static double milliseconds(long nanos) { return nanos / 1_000_000.0; }
    private static String id(int index) { return "v%05d".formatted(index); }
    private static LearningGoal goal(String id, List<String> requires, List<String> contains, boolean exam) {
        LearningGoal goal = new LearningGoal();
        goal.setId(id); goal.setTitle(id); goal.setRequires(requires); goal.setContains(contains);
        if (exam) goal.setNodeKind("exam");
        return goal;
    }
    private record Dataset(String shape, int atomicNodes, Long requestedEdges, Map<String, LearningGoal> graph,
                           Set<String> targets, CompletionProfileDefinition profile) { }
    private record TimedCompilation(CompiledCompletionProfile compiled, long elapsedNanos) { }
}
