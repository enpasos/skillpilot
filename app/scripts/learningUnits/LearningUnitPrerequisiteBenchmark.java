package com.skillpilot.backend.curriculumpackage;

import com.fasterxml.jackson.databind.*;
import com.skillpilot.backend.completion.*;
import com.skillpilot.backend.completion.learningunit.LearningUnitPrerequisiteGraph;
import com.skillpilot.backend.landscape.SkillLandscape;
import java.nio.file.*;
import java.util.*;
import java.util.function.Supplier;
import java.security.MessageDigest;

/** Local timing evidence with independent full-transitive BFS parity, no hard timing threshold. */
public final class LearningUnitPrerequisiteBenchmark {
    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static volatile Object blackhole;
    public static void main(String[] args) throws Exception {
        if (args.length != 3) throw new IllegalArgumentException("Arguments: native-inventory.json canonical-mathematics.json output-report.json");
        Path inventoryPath = Path.of(args[0]).toAbsolutePath().normalize();
        Path canonicalPath = Path.of(args[1]).toAbsolutePath().normalize();
        String inventoryDigest = sha256(Files.readAllBytes(inventoryPath));
        String canonicalDigest = sha256(Files.readAllBytes(canonicalPath));
        JsonNode nativeReport = MAPPER.readTree(inventoryPath.toFile());
        List<Map<String, Object>> rows = new ArrayList<>();
        for (String id : List.of("DE-HE/SekII/G9/LK", "DE-HE/CrossStage/G9/LK")) {
            JsonNode scope = null;
            for (JsonNode candidate : nativeReport.path("scopes")) if (id.equals(candidate.path("scopeId").asText())) scope = candidate;
            if (scope == null) throw new AssertionError("Missing actual native scope");
            Map<String, List<String>> graph = MAPPER.convertValue(scope.path("atomicPrerequisites"), new com.fasterxml.jackson.core.type.TypeReference<>() {});
            Set<String> targets = MAPPER.convertValue(scope.path("targetAtomicGoalIds"), new com.fasterxml.jackson.core.type.TypeReference<>() {});
            run(id, "actual native target scope with complete support context", graph, targets, rows, 25);
        }
        SkillLandscape source = MAPPER.readValue(canonicalPath.toFile(), SkillLandscape.class);
        var goals = CompletionCanonicalGraphResolver.normalizeDefinitions(List.of(source), MAPPER);
        Set<String> atoms = new TreeSet<>();
        goals.values().stream().filter(goal -> goal.getContains().isEmpty()).forEach(goal -> atoms.add(goal.getId()));
        Map<String, List<String>> union = new CompletionProfileCompiler().compileAtomicPrerequisites(goals, atoms);
        run("canonical-atomic-union-" + atoms.size(), "diagnostic union of all canonical atoms, not a native ALL offering", union, atoms, rows, 25);
        Map<String, List<String>> dense = new LinkedHashMap<>();
        for (int index = 0; index < 5000; index++) {
            List<String> edges = new ArrayList<>();
            if (index >= 1000) for (int edge = 0; edge < 5; edge++) edges.add("s" + ((index / 1000 - 1) * 1000 + (index % 1000 + edge * 193) % 1000));
            dense.put("s" + index, edges);
        }
        run("synthetic-fanout-5000-20000", "synthetic five layers, 1000 nodes per layer, five distinct dependencies per nonroot", dense, dense.keySet(), rows, 10);
        Map<String, Object> report = new TreeMap<>();
        report.put("schemaVersion", 1); report.put("proof", "independent-full-transitive-BFS-parity-and-local-timing");
        report.put("javaVersion", System.getProperty("java.version")); report.put("javaVendor", System.getProperty("java.vendor"));
        report.put("availableProcessors", Runtime.getRuntime().availableProcessors());
        report.put("inputSha256", Map.of("nativeInventory", inventoryDigest, "canonicalMathematics", canonicalDigest));
        report.put("productionClassSha256", Map.of("LearningUnitPrerequisiteGraph", classDigest(LearningUnitPrerequisiteGraph.class),
                "CompletionProfileCompiler", classDigest(CompletionProfileCompiler.class),
                "LearningUnitPrerequisiteBenchmark", classDigest(LearningUnitPrerequisiteBenchmark.class)));
        report.put("rule", "Full transitive demand traverses mastered and outside-scope intermediates; outside-scope outcomes do not block, but their in-scope ancestors remain checked");
        report.put("timingUnit", "microseconds; p50/p95 observed locally, no hard performance threshold");
        report.put("timingBoundary", "Fresh static graph instances and in-process evaluation; includes no HTTP, DB, UI, provider host or CI performance measurement");
        report.put("warmupIterations", 8); report.put("rows", rows);
        if (!inventoryDigest.equals(sha256(Files.readAllBytes(inventoryPath))) || !canonicalDigest.equals(sha256(Files.readAllBytes(canonicalPath)))) {
            throw new AssertionError("Benchmark input changed during measurement");
        }
        Path output = Path.of(args[2]); Files.createDirectories(output.toAbsolutePath().getParent());
        Files.writeString(output, MAPPER.writerWithDefaultPrettyPrinter().writeValueAsString(report) + "\n");
        System.out.println("PREREQUISITE_BENCHMARK_PASS native=2 canonicalUnion=" + atoms.size() + " synthetic=5000/20000 cases=16 exactBFSparity");
    }
    private static void run(String id, String meaning, Map<String, List<String>> edges, Set<String> targets,
                            List<Map<String, Object>> rows, int repetitions) {
        long firstConstructionStart = System.nanoTime();
        LearningUnitPrerequisiteGraph graph = new LearningUnitPrerequisiteGraph(edges);
        long firstConstructionNanos = System.nanoTime() - firstConstructionStart;
        List<String> ids = new ArrayList<>(edges.keySet());
        Set<String> near = new HashSet<>(ids);
        for (int index = 0; index < ids.size(); index += 17) near.remove(ids.get(index));
        Set<String> focus = new HashSet<>();
        int count = 0; for (String target : targets) if (count++ % 3 == 0) focus.add(target);
        List<Case> cases = List.of(new Case("zero", Set.of(), targets), new Case("near-complete", near, targets),
                new Case("all-mastered", edges.keySet(), targets), new Case("near-complete-focus", near, focus));
        long[] construction = measure(() -> new LearningUnitPrerequisiteGraph(edges), repetitions);
        for (Case test : cases) {
            Map<String, Boolean> expected = reference(edges, test.mastery(), test.scope());
            long firstEvaluationStart = System.nanoTime();
            Map<String, Boolean> actual = graph.evaluate(test.mastery(), test.scope());
            long firstEvaluationNanos = System.nanoTime() - firstEvaluationStart;
            if (!expected.equals(actual)) throw new AssertionError("Independent BFS mismatch: " + id + "/" + test.name());
            for (int warm = 0; warm < 8; warm++) { blackhole = graph.evaluate(test.mastery(), test.scope()); blackhole = reference(edges, test.mastery(), test.scope()); }
            long[] linear = measure(() -> graph.evaluate(test.mastery(), test.scope()), repetitions);
            long[] bfs = measure(() -> reference(edges, test.mastery(), test.scope()), repetitions);
            Map<String, Object> row = new TreeMap<>();
            row.put("graphId", id); row.put("meaning", meaning); row.put("case", test.name()); row.put("vertices", graph.size()); row.put("edges", graph.edgeCount());
            row.put("targetScopeCount", test.scope().size()); row.put("masteryCount", test.mastery().size()); row.put("satisfiedEndpoints", actual.values().stream().filter(Boolean.TRUE::equals).count());
            row.put("exactReferenceParity", true); row.put("repetitions", repetitions);
            row.put("firstStaticConstructionMicros", firstConstructionNanos / 1000.0);
            row.put("firstEvaluationMicros", firstEvaluationNanos / 1000.0);
            row.put("coldStaticGraphConstruction", stats(construction)); row.put("warmTopologicalPass", stats(linear)); row.put("warmFullBfsPerEndpoint", stats(bfs)); rows.add(row);
        }
    }
    private static Map<String, Boolean> reference(Map<String, List<String>> graph, Set<String> mastery, Set<String> scope) {
        Map<String, Boolean> result = new LinkedHashMap<>();
        for (String endpoint : graph.keySet()) {
            Set<String> seen = new HashSet<>(); ArrayDeque<String> pending = new ArrayDeque<>(graph.get(endpoint));
            boolean complete = true;
            while (!pending.isEmpty()) {
                String id = pending.removeFirst(); if (!seen.add(id)) continue;
                complete &= !scope.contains(id) || mastery.contains(id); pending.addAll(graph.get(id));
            }
            result.put(endpoint, complete);
        }
        return result;
    }
    private static long[] measure(Supplier<Object> operation, int repetitions) {
        long[] elapsed = new long[repetitions];
        for (int index = 0; index < repetitions; index++) { long start = System.nanoTime(); blackhole = operation.get(); elapsed[index] = System.nanoTime() - start; }
        Arrays.sort(elapsed); return elapsed;
    }
    private static Map<String, Double> stats(long[] elapsed) {
        return Map.of("p50", elapsed[(elapsed.length - 1) / 2] / 1000.0, "p95", elapsed[(int) Math.ceil(elapsed.length * .95) - 1] / 1000.0);
    }
    private static String sha256(byte[] bytes) throws Exception { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes)); }
    private static String classDigest(Class<?> type) throws Exception {
        try (var bytes = type.getResourceAsStream("/" + type.getName().replace('.', '/') + ".class")) {
            if (bytes == null) throw new IllegalArgumentException("Missing compiled proof class");
            return sha256(bytes.readAllBytes());
        }
    }
    private record Case(String name, Set<String> mastery, Set<String> scope) { }
}
