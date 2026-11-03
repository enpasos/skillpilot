package com.skillpilot.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

/** File-backed synthetic load fixture; real loaders, compiler, repositories and protocols remain in use. */
final class CompletionTransportTestCurriculum {
    static final String ROOT = "e6110c42-b4cb-5d40-94d3-d26a70736055";
    static final String PREPARATION = "5c1506ce-5b8d-5908-9e20-47c3836a7a6c";
    static final String EXAM = "91e9f31d-4195-59ee-93a8-fd0d94b549e1";
    static final int TARGET_COUNT = 916;
    static final int ASSESSMENT_COUNT = 139;
    static final String UNCOVERED = id("known-uncovered-real-copy");
    static final Path LANDSCAPE = Path.of("synthetic-completion.de.json");
    private static Path sharedDirectory;

    static synchronized Path directory() {
        if (sharedDirectory == null) {
            try { sharedDirectory = write(Files.createTempDirectory("completion-transport-curriculum-")); }
            catch (IOException error) { throw new IllegalStateException("Cannot write isolated transport curriculum", error); }
        }
        return sharedDirectory;
    }

    static Path write(Path directory) throws IOException {
        var mapper = new ObjectMapper();
        ObjectNode document;
        try (var input = Objects.requireNonNull(CompletionTransportTestCurriculum.class.getResourceAsStream(
                "/completion-mcp-curriculum/synthetic-completion.de.json"))) {
            document = (ObjectNode) mapper.readTree(input);
        }
        document.put("title", "Synthetische Lastlandschaft: 916 Ziele und 139 Prüfungen");
        document.put("titleEn", "Synthetic load curriculum: 916 targets and 139 assessments");
        var goals = (ArrayNode) document.get("goals");
        var section = (ObjectNode) goals.get(0);
        var members = (ArrayNode) section.get("contains");
        var examTemplate = (ObjectNode) goals.get(3);
        List<ObjectNode> assessments = new ArrayList<>(List.of((ObjectNode) goals.get(2), examTemplate));
        for (int index = assessments.size(); index < ASSESSMENT_COUNT; index++) {
            var exam = examTemplate.deepCopy();
            exam.put("id", id("exam-" + index));
            exam.put("title", "Synthetische Abschlussprüfung " + String.format("%03d", index));
            exam.put("titleEn", "Synthetic assessment " + index);
            goals.add(exam); assessments.add(exam); members.add(exam.path("id").asText());
        }
        // Every ordinary target is demanded by an assessment. Each extra support
        // belongs to exactly one exam, so a real passed exam frees actual support.
        int ordinaryCount = TARGET_COUNT - ASSESSMENT_COUNT;
        for (int index = 1; index < ordinaryCount; index++) {
            var support = ((ObjectNode) goals.get(1)).deepCopy();
            String supportId = id("preparation-" + index);
            support.put("id", supportId);
            support.put("title", "Synthetische Vorbereitung " + index);
            support.put("titleEn", "Synthetic preparation " + index);
            goals.add(support); members.add(supportId);
            var exam = assessments.get((index - 1) % ASSESSMENT_COUNT);
            ((ArrayNode) exam.get("requires")).add(supportId);
            ((ArrayNode) exam.path("examData").get("coveredGoalIds")).add(supportId);
        }
        section.put("weight", TARGET_COUNT);
        Files.createDirectories(directory);
        mapper.writerWithDefaultPrettyPrinter().writeValue(directory.resolve(LANDSCAPE).toFile(), document);
        return directory;
    }

    /** Copy every real runtime JSON, then inject one known ordinary endpoint and its authored placements. */
    static Path writeFaultedRealCopy(Path source, Path destination) throws IOException {
        Path sourceRoot = source.toAbsolutePath().normalize();
        Files.walkFileTree(sourceRoot, new java.nio.file.SimpleFileVisitor<>() {
            @Override public java.nio.file.FileVisitResult preVisitDirectory(Path directory,
                    java.nio.file.attribute.BasicFileAttributes attributes) {
                return directory.getFileName().toString().equals("quality")
                        ? java.nio.file.FileVisitResult.SKIP_SUBTREE : java.nio.file.FileVisitResult.CONTINUE;
            }
            @Override public java.nio.file.FileVisitResult visitFile(Path file,
                    java.nio.file.attribute.BasicFileAttributes attributes) throws IOException {
                if (Files.isSymbolicLink(file)) throw new IOException("Unexpected real runtime symlink: " + file);
                if (file.toString().endsWith(".json") || file.toString().endsWith(".json.snapshot")) {
                    Path target = destination.resolve(sourceRoot.relativize(file));
                    Files.createDirectories(target.getParent()); Files.copy(file, target);
                }
                return java.nio.file.FileVisitResult.CONTINUE;
            }
        });
        var mapper = new ObjectMapper();
        Path canonical = destination.resolve("DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json");
        var document = (ObjectNode) mapper.readTree(canonical.toFile());
        var uncovered = ((ArrayNode) document.get("goals")).addObject();
        uncovered.put("id", UNCOVERED).put("title", "Absichtlich ungedecktes Testziel")
                .put("description", "Deterministic isolated fault; never curriculum content or an assessment.")
                .put("type", "atomic").put("semanticKind", "curricularAtomic").put("phase", "Q2")
                .put("core", true).put("weight", 1);
        uncovered.putArray("requires"); uncovered.putArray("contains");
        uncovered.putObject("applicability").putArray("jurisdiction").add("DE-HE");
        mapper.writerWithDefaultPrettyPrinter().writeValue(canonical.toFile(), document);
        int placements = 0;
        try (var paths = Files.walk(destination.resolve("DE/Gymnasium/composition-views"))) {
            for (Path path : paths.filter(p -> p.toString().endsWith(".json")).toList()) {
                var view = (ObjectNode) mapper.readTree(path.toFile());
                if (!"68a8ac50-f5f5-4e24-8aa9-5e408ca01ced".equals(view.path("landscapeId").asText())
                        || !"DE-HE".equals(view.path("scope").path("jurisdiction").asText())) continue;
                ((ArrayNode) view.get("rootNodes")).addObject().put("kind", "goalEntry")
                        .put("goalId", UNCOVERED).put("projectionRole", "target");
                mapper.writerWithDefaultPrettyPrinter().writeValue(path.toFile(), view); placements++;
            }
        }
        if (placements == 0) throw new IOException("Real Hessian Mathematics composition inputs are missing");
        return destination;
    }

    private static String id(String value) {
        return UUID.nameUUIDFromBytes(("completion-transport-" + value).getBytes(StandardCharsets.UTF_8)).toString();
    }
    private CompletionTransportTestCurriculum() { }
}
