package com.skillpilot.backend.curriculumpackage;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.completion.CompletionCanonicalGraphResolver;
import com.skillpilot.backend.completion.learningunit.*;
import com.skillpilot.backend.landscape.SkillLandscape;
import java.nio.file.*;
import java.security.MessageDigest;
import java.util.*;

/** Inert, actual producer-output admission proof; no fake goal/task or runtime-model payload. */
public final class ActualProducedLearningUnitAdmission {
    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final String A = "3016ec37-1c2e-47db-83f5-e767923bc97e";
    private static final String Q = "e98672c6-871a-5d0b-889c-5afc51040f0d";
    private static final String MATH = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";

    public static void main(String[] args) throws Exception {
        if (args.length != 2) throw new IllegalArgumentException("Arguments: compiled-model-root output-report.json");
        Path model = Path.of(args[0]).toAbsolutePath().normalize();
        JsonNode conformance = MAPPER.readTree(model.resolve("metadata/release-model-conformance.json").toFile());
        require(conformance.path("passed").asBoolean(), "Actual model conformance is not successful");
        String packageId = conformance.path("packageId").asText();
        Map<String, String> inputSha256 = new TreeMap<>();
        bind(model, model.resolve("metadata/release-model-conformance.json"), inputSha256);
        bind(model, model.resolve("metadata/build-inputs.json"), inputSha256);
        JsonNode buildInputs = MAPPER.readTree(model.resolve("metadata/build-inputs.json").toFile());
        Map<String, CurriculumRuntimeSnapshot.LandscapeDescriptor> landscapes = new TreeMap<>();
        Map<String, CurriculumRuntimeSnapshot.ViewDescriptor> views = new TreeMap<>();
        Map<CurriculumRuntimeSnapshot.ArtifactKey, CurriculumRuntimeSnapshot.Artifact> artifacts = new LinkedHashMap<>();
        Map<String, SkillLandscape> installed = new TreeMap<>();
        for (Path path : jsonFiles(model.resolve("data/canonical"))) {
            String raw = Files.readString(path); bind(model, path, inputSha256);
            SkillLandscape landscape = MAPPER.readValue(raw, SkillLandscape.class);
            JsonNode json = MAPPER.readTree(raw);
            installed.put(landscape.getLandscapeId(), landscape);
            landscapes.put(landscape.getLandscapeId(), new CurriculumRuntimeSnapshot.LandscapeDescriptor(
                    packageId, landscape.getLandscapeId(), "root", json.path("locale").asText("de-DE"),
                    json.path("frameworkId").asText(), json.path("subject").asText(), json.path("country").asText(),
                    json.path("region").asText(), json.path("schoolType").asText(), null, null, null, raw));
        }
        for (Path path : jsonFiles(model.resolve("data/views"))) {
            String raw = Files.readString(path); bind(model, path, inputSha256);
            JsonNode json = MAPPER.readTree(raw);
            if (!json.path("viewId").isTextual()) {
                require(path.getFileName().toString().equals("index.json"), "Unexpected non-view file in producer view directory");
                continue;
            }
            Map<String, String> scope = new TreeMap<>();
            json.path("scope").fields().forEachRemaining(entry -> scope.put(entry.getKey(), entry.getValue().asText()));
            views.put(json.path("viewId").asText(), new CurriculumRuntimeSnapshot.ViewDescriptor(packageId,
                    json.path("viewId").asText(), json.path("landscapeId").asText(), json.path("language").asText("de"), scope, null, raw));
        }
        for (Path path : jsonFiles(model.resolve("data/learning-units"))) {
            byte[] bytes = Files.readAllBytes(path); bind(model, path, inputSha256);
            JsonNode json = MAPPER.readTree(bytes);
            String role = switch (json.path("artifactKind").asText()) {
                case "catalog" -> LearningUnitCatalog.CATALOG_ROLE;
                case "contract" -> LearningUnitCatalog.CONTRACT_ROLE;
                case "input" -> LearningUnitCatalog.INPUT_ROLE;
                default -> throw new IllegalArgumentException("Unknown actual unit wrapper role");
            };
            String relative = model.relativize(path).toString();
            var artifact = new CurriculumRuntimeSnapshot.Artifact(null, relative, role, "application/json",
                    bytes.length, sha256(bytes), true, "definition", json.path("id").asText(), "learning-unit-source",
                    null, null, "Apache-2.0", "first-party", "redistributable");
            artifact.retainVerifiedContent(bytes);
            artifacts.put(new CurriculumRuntimeSnapshot.ArtifactKey(packageId, relative), artifact);
        }
        require(landscapes.size() == 1 && landscapes.containsKey(MATH), "Unexpected actual model landscape inventory");
        require(views.size() == conformance.path("counts").path("views").asInt(), "Actual model does not retain its declared reviewed views");
        require(artifacts.size() == buildInputs.path("learningUnitInputs").size(), "Actual unit catalog/contract/input inventory differs from producer input inventory");
        var snapshot = new CurriculumRuntimeSnapshot(sha256(MAPPER.writeValueAsBytes(inputSha256)), List.of(),
                List.of(MATH), landscapes, views, Map.of(), Map.of(), Map.of(), Map.of(), artifacts, Map.of(), conformance.path("counts").path("goals").asInt());
        var installedGoals = CompletionCanonicalGraphResolver.normalizeDefinitions(installed.values(), MAPPER);
        String installedAKind = installedGoals.get(A).getSemanticKind();
        String installedQKind = installedGoals.get(Q).getSemanticKind();
        require("curricularAtomic".equals(installedAKind), "Producer did not inject actual reviewed A semantic kind");
        require("practiceAssessment".equals(installedQKind), "Producer did not inject actual reviewed Q semantic kind");
        LearningUnitCatalog catalog = LearningUnitPackageCatalog.load(snapshot, MAPPER);
        require(!catalog.definitions().isEmpty() && catalog.quarantined().isEmpty(), "Actual packaged contract admission failed");
        var projectionUnit = catalog.definitions().stream().filter(unit -> "math-dot-product-projection".equals(unit.contractId())).findFirst()
                .orElseThrow(() -> new AssertionError("Actual model omits the reviewed projection unit"));
        var empty = new LearningUnitEvaluator().evaluate(catalog.compiled(), Set.of());
        require(empty.recognizedGoalIds().isEmpty(), "Cold empty mastery gained competence");
        var passed = new LearningUnitEvaluator().evaluate(catalog.compiled(), Set.of(Q));
        require(passed.recognizedGoalIds().equals(Set.of(A)), "Actual packaged Q did not yield exactly narrow A");
        var projectionResult = passed.units().get(projectionUnit.ref());
        require(projectionResult.complete() && projectionResult.targetCount() == 2
                && projectionResult.explicitTargetCount() == 1 && projectionResult.recognizedTargetCount() == 1, "Actual packaged projection-unit completion counts differ");
        require(installedAKind.equals(installedGoals.get(A).getSemanticKind())
                && installedQKind.equals(installedGoals.get(Q).getSemanticKind()), "Admission mutated installed semantic kind");
        Map<String, String> finalDigests = new TreeMap<>();
        for (String path : inputSha256.keySet()) bind(model, model.resolve(path), finalDigests);
        require(finalDigests.equals(inputSha256), "Actual producer model changed during admission proof");
        Map<String, Object> report = new TreeMap<>();
        report.put("schemaVersion", 1);
        report.put("javaVersion", System.getProperty("java.version"));
        report.put("javaVendor", System.getProperty("java.vendor"));
        report.put("proof", "actual-produced-runtime-1.2-cold-java-admission");
        report.put("actualModelRoot", model.toString());
        report.put("contentDigest", conformance.path("contentDigest").asText());
        report.put("compiledLandscapeCount", landscapes.size());
        report.put("compiledViewCount", views.size());
        report.put("actualUnitWrapperCount", artifacts.size());
        report.put("admittedContracts", catalog.definitions().stream().map(definition -> definition.ref().toString()).toList());
        report.put("quarantinedContracts", catalog.quarantined());
        report.put("coldEmptyMasteryRecognition", empty.recognizedGoalIds());
        report.put("explicitMastery", List.of(Q));
        report.put("recognizedGoalIds", passed.recognizedGoalIds());
        report.put("derivedComplete", true);
        report.put("compiledSemanticKindsPreserved", Map.of(A, installedAKind, Q, installedQKind));
        report.put("actualModelInputSha256", inputSha256);
        report.put("productionClassSha256", Map.of("LearningUnitPackageCatalog", classDigest(LearningUnitPackageCatalog.class),
                "LearningUnitSourceBindings", classDigest(LearningUnitSourceBindings.class),
                "LearningUnitCompiler", classDigest(LearningUnitCompiler.class),
                "ActualProducedLearningUnitAdmission", classDigest(ActualProducedLearningUnitAdmission.class)));
        report.put("scope", "Real producer bytes admitted by Java package catalog; no installed host, HTTP, deployment or publication test");
        Path output = Path.of(args[1]); Files.createDirectories(output.toAbsolutePath().getParent());
        Files.writeString(output, MAPPER.writerWithDefaultPrettyPrinter().writeValueAsString(report) + "\n");
        System.out.println("ACTUAL_PRODUCED_RUNTIME_1_2_ADMISSION_PASS contracts=" + catalog.definitions().size()
                + " views=" + views.size() + " wrappers=" + artifacts.size() + " Q->I(A) coldM0=empty");
    }
    private static List<Path> jsonFiles(Path root) throws Exception {
        try (var paths = Files.walk(root)) { return paths.filter(Files::isRegularFile).filter(path -> path.toString().endsWith(".json")).sorted().toList(); }
    }
    private static void bind(Path root, Path path, Map<String, String> inputs) throws Exception { inputs.put(root.relativize(path).toString(), sha256(Files.readAllBytes(path))); }
    private static String sha256(byte[] bytes) throws Exception { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes)); }
    private static String classDigest(Class<?> type) throws Exception {
        try (var bytes = type.getResourceAsStream("/" + type.getName().replace('.', '/') + ".class")) {
            if (bytes == null) throw new IllegalArgumentException("Missing compiled proof class");
            return sha256(bytes.readAllBytes());
        }
    }
    private static void require(boolean condition, String message) { if (!condition) throw new AssertionError(message); }
}
