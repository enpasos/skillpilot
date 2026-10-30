package com.skillpilot.backend.completion;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.skillpilot.backend.landscape.GoalMappingService;
import com.skillpilot.backend.landscape.LandscapeProperties;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.service.DeckResourceService;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.attribute.FileTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class CompletionCatalogTest {
    @TempDir Path temporary;
    private final ObjectMapper mapper = new ObjectMapper();

    @Test
    void disabledAndMissingPackageSnapshotDoNotReadRepositoryOrPinAdapters() {
        LandscapeProperties properties = new LandscapeProperties();
        properties.setDirectory(temporary.resolve("missing").toString());
        LandscapeService landscapes = mock(LandscapeService.class);
        GoalMappingService mappings = mock(GoalMappingService.class);
        DeckResourceService decks = mock(DeckResourceService.class);
        assertThat(new CompletionProfileCatalog(properties, mapper, landscapes, mappings, decks,
                false, "pilot", "repository").available()).isFalse();
        assertThatThrownBy(() -> new CompletionProfileCatalog(properties, mapper, landscapes, mappings, decks,
                true, "pilot", "package"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("active package snapshot");
        verifyNoInteractions(landscapes, mappings, decks);
    }

    @Test
    void pinForcesCurrentLandscapesAndMappingsDespiteRecentWarmRead() throws Exception {
        Fixture f = fixture();
        GoalMappingService mappings = new GoalMappingService(f.properties(), mapper);
        LandscapeService landscapes = new LandscapeService(f.properties(), mapper, mappings);
        DeckResourceService decks = new DeckResourceService(f.properties());
        assertThat(landscapes.getAll().getFirst().getGoals().getFirst().getTitle()).isEqualTo("Before");
        assertThat(mappings.getAllMappings()).isEmpty();

        // Both adapters were just read. The ordinary reload interval must not pin
        // this old cache under the hash of these changed files.
        f.goals().getFirst().put("title", "After");
        f.writeGraphAndProfile();
        f.writeMappings(true);
        CompletionProfileCatalog catalog = new CompletionProfileCatalog(f.properties(), mapper,
                landscapes, mappings, decks, true, "pilot", "repository");
        assertThat(catalog.available()).isTrue();
        assertThat(landscapes.getAll().getFirst().getGoals().getFirst().getTitle()).isEqualTo("After");
        assertThat(mappings.getAllMappings()).hasSize(1);

        // Published repositories remain pinned even if the underlying files change.
        f.goals().getFirst().put("title", "Unpublished");
        f.writeGraphAndProfile();
        f.writeMappings(false);
        assertThat(landscapes.getAll().getFirst().getGoals().getFirst().getTitle()).isEqualTo("After");
        assertThat(mappings.getAllMappings()).hasSize(1);
        catalog.verifyPinnedGeneration();
        assertThat(catalog.available()).isFalse();
    }

    @Test
    void pinnedDeckUsesCopiedBytesAndWatcherPausesChangedInput() throws Exception {
        Fixture f = fixture();
        GoalMappingService mappings = new GoalMappingService(f.properties(), mapper);
        LandscapeService landscapes = new LandscapeService(f.properties(), mapper, mappings);
        DeckResourceService decks = new DeckResourceService(f.properties());
        var catalog = new CompletionProfileCatalog(f.properties(), mapper,
                landscapes, mappings, decks, true, "pilot", "repository");
        byte[] original = Files.readAllBytes(f.deck());
        Files.writeString(f.deck(), "{\"cards\":[\"changed\"]}");
        assertThat(decks.resolveDeckResource("data/pilot_deck.json").getContentAsByteArray()).isEqualTo(original);
        catalog.verifyPinnedGeneration();
        assertThat(catalog.available()).isFalse();
    }

    @Test
    void startupRejectsMutationEvenWhenSizeAndTimestampAreRestored() throws Exception {
        Fixture f = fixture();
        GoalMappingService mappings = mock(GoalMappingService.class);
        FileTime originalTime = Files.getLastModifiedTime(f.deck());
        byte[] original = Files.readAllBytes(f.deck());
        doAnswer(invocation -> {
            byte[] modified = original.clone();
            modified[modified.length - 2] = ' ';
            Files.write(f.deck(), modified);
            Files.setLastModifiedTime(f.deck(), originalTime);
            return null;
        }).when(mappings).pinRuntimeGeneration();
        assertThatThrownBy(() -> new CompletionProfileCatalog(f.properties(), mapper,
                mock(LandscapeService.class), mappings, mock(DeckResourceService.class),
                true, "pilot", "repository"))
                .isInstanceOf(IllegalStateException.class).hasRootCauseMessage("Curriculum bytes changed during pinning");
    }

    @Test
    void startupRejectsProfileAndMappingChangesDuringPinning() throws Exception {
        for (String change : List.of("profile", "mapping", "new-file")) {
            Fixture f = fixture(temporary.resolve(change));
            GoalMappingService mappings = mock(GoalMappingService.class);
            doAnswer(invocation -> {
                switch (change) {
                    case "profile" -> Files.writeString(f.profile(), Files.readString(f.profile()) + " ");
                    case "mapping" -> f.writeMappings(true);
                    default -> Files.writeString(f.root().resolve("new-runtime.json"), "{}");
                }
                return null;
            }).when(mappings).pinRuntimeGeneration();
            assertThatThrownBy(() -> new CompletionProfileCatalog(f.properties(), mapper,
                    mock(LandscapeService.class), mappings, mock(DeckResourceService.class),
                    true, "pilot", "repository")).isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Cannot initialize reviewed completion catalog");
        }
    }

    @Test
    void reviewBindsOrdinarySemanticsScopeTaskAndRubric() throws Exception {
        for (String change : List.of("ordinary", "scope", "task-binding", "rubric-binding")) {
            Fixture f = fixture(temporary.resolve(change));
            if (change.equals("ordinary")) {
                f.goals().getFirst().put("description", "Changed outcome");
                f.writeGraph();
            } else if (change.equals("scope")) {
                ObjectNode scope = (ObjectNode) mapper.readTree(f.scope().toFile());
                scope.put("revision", "new-scope");
                mapper.writeValue(f.scope().toFile(), scope);
            } else {
                ObjectNode profile = (ObjectNode) mapper.readTree(f.profile().toFile());
                ((ObjectNode) profile.path("review")).put(change.equals("task-binding") ? "taskRevision" : "rubricRevision", "stale");
                mapper.writeValue(f.profile().toFile(), profile);
            }
            assertThatThrownBy(() -> new CompletionProfileCatalog(f.properties(), mapper,
                    mock(LandscapeService.class), mock(GoalMappingService.class), mock(DeckResourceService.class),
                    true, "pilot", "repository"))
                    .isInstanceOf(IllegalStateException.class)
                    .hasRootCauseInstanceOf(IllegalArgumentException.class);
        }
    }

    @Test
    void changedReviewAndNewProfileInvalidateWithoutHotReload() throws Exception {
        for (String change : List.of("review", "profile")) {
            Fixture f = fixture(temporary.resolve(change));
            CompletionProfileCatalog catalog = new CompletionProfileCatalog(f.properties(), mapper,
                    mock(LandscapeService.class), mock(GoalMappingService.class), mock(DeckResourceService.class),
                    true, "pilot", "repository");
            assertThat(catalog.available()).isTrue();
            if (change.equals("review")) Files.writeString(f.review(), "changed review");
            else Files.writeString(f.profile().resolveSibling("unexpected.json"), "{}");
            catalog.verifyPinnedGeneration();
            assertThat(catalog.available()).isFalse();
        }
    }

    @Test
    void unsafeReviewPathAndUnknownAllowlistCannotActivate() throws Exception {
        Fixture f = fixture();
        assertThatThrownBy(() -> new CompletionProfileCatalog(f.properties(), mapper,
                mock(LandscapeService.class), mock(GoalMappingService.class), mock(DeckResourceService.class),
                true, "unknown", "repository")).hasRootCauseMessage("Unknown allowlisted completion profile");
        ObjectNode profile = (ObjectNode) mapper.readTree(f.profile().toFile());
        ((ObjectNode) profile.path("review")).put("reference", "../outside.md");
        mapper.writeValue(f.profile().toFile(), profile);
        assertThatThrownBy(() -> new CompletionProfileCatalog(f.properties(), mapper,
                mock(LandscapeService.class), mock(GoalMappingService.class), mock(DeckResourceService.class),
                true, "pilot", "repository")).hasRootCauseInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void checkedInPilotBindingsMatchActualCanonicalDefinitions() throws Exception {
        Path repository = Path.of("").toAbsolutePath();
        while (repository != null && !Files.isDirectory(repository.resolve("curricula"))) repository = repository.getParent();
        assertThat(repository).isNotNull();
        JsonNode graph = mapper.readTree(repository.resolve(
                "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json").toFile());
        Map<String, JsonNode> goals = new LinkedHashMap<>();
        for (JsonNode goal : graph.path("goals")) goals.put(goal.path("id").asText(), goal);
        var profile = mapper.readValue(repository.resolve(
                "curricula/DE/Gymnasium/completion-profiles/math-dot-product-projection.json").toFile(),
                CompletionProfileDefinition.class);
        byte[] scopeBytes = Files.readAllBytes(repository.resolve(
                "curricula/DE/Gymnasium/completion-scopes/math-dot-product-projection.json"));
        var scope = mapper.readValue(scopeBytes, CompletionScopeDefinition.class);
        CompletionProfileCatalog.validateReviewBindings(profile, scope, scopeBytes, goals, mapper);
    }

    private Fixture fixture() throws Exception { return fixture(temporary); }
    private Fixture fixture(Path directory) throws Exception {
        Path root = directory.resolve("curricula");
        Path graph = root.resolve("canonical/math.json");
        Path profile = root.resolve("DE/Gymnasium/completion-profiles/pilot.json");
        Path scope = root.resolve("DE/Gymnasium/completion-scopes/scope.json");
        Path review = root.resolve("DE/Gymnasium/quality/assessment-completion/review.md");
        Path mapping = root.resolve("mapping/pilot.json");
        Path deck = root.resolve("memory-decks/pilot_deck.json");
        for (Path path : List.of(graph, profile, scope, review, mapping, deck)) Files.createDirectories(path.getParent());
        List<Map<String, Object>> goals = new ArrayList<>();
        goals.add(new LinkedHashMap<>(Map.of("id", "A", "title", "Before", "description", "Explain the projection",
                "contains", List.of(), "requires", List.of(), "type", "atomic")));
        goals.add(new LinkedHashMap<>(Map.of("id", "Q", "title", "Assessment", "nodeKind", "exam",
                "type", "atomic", "contains", List.of(), "requires", List.of("A"),
                "examData", Map.of("taskContent", "Explain the projection.", "solutionContent", "Use a perpendicular remainder.",
                        "scoring", Map.of("maxPoints", 1, "passingPoints", 1,
                                "steps", List.of(Map.of("id", "explain", "points", 1, "description", "Geometric explanation")))))));
        Files.writeString(review, "Machine fixture review.");
        Files.writeString(deck, "{\"cards\":[]}");
        mapper.writeValue(scope.toFile(), Map.of("schemaVersion", 1, "id", "scope", "revision", "1",
                "title", Map.of("de", "Abschnitt", "en", "Scope"), "targetRootIds", List.of("A", "Q")));
        LandscapeProperties properties = new LandscapeProperties();
        properties.setDirectory(root.toString());
        Fixture fixture = new Fixture(root, graph, profile, scope, review, mapping, deck, goals, properties);
        fixture.writeMappings(false);
        fixture.writeGraphAndProfile();
        return fixture;
    }

    private record Fixture(Path root, Path graph, Path profile, Path scope, Path review, Path mapping, Path deck,
                           List<Map<String, Object>> goals, LandscapeProperties properties) {
        void writeGraph() throws Exception {
            new ObjectMapper().writeValue(graph.toFile(), Map.of("landscapeId", "math", "title", "Math", "goals", goals));
        }
        void writeGraphAndProfile() throws Exception {
            writeGraph();
            ObjectMapper mapper = new ObjectMapper();
            JsonNode scopeNode = mapper.readTree(scope.toFile());
            var exam = mapper.valueToTree(goals.get(1)).path("examData");
            var reviewBinding = new CompletionProfileDefinition.Review(
                    "curricula/DE/Gymnasium/quality/assessment-completion/review.md",
                    CompletionProfileCatalog.canonicalHash(mapper.valueToTree(Map.of("scope", scopeNode, "targetGoals", goals)), mapper),
                    CompletionProfileCatalog.canonicalHash(mapper.valueToTree(Map.of(
                            "taskContent", exam.path("taskContent"), "solutionContent", exam.path("solutionContent"))), mapper),
                    CompletionProfileCatalog.canonicalHash(exam.path("scoring"), mapper));
            mapper.writeValue(profile.toFile(), new CompletionProfileDefinition(1, "pilot", "1",
                    Map.of("de", "Abschnitt", "en", "Scope"), "scope", Map.of(), List.of(), reviewBinding,
                    List.of(new CompletionProfileDefinition.WaiverRule("waive-a", List.of("Q"), List.of("A"),
                            "Fixture coverage", reviewBinding.reference()))));
        }
        void writeMappings(boolean include) throws Exception {
            new ObjectMapper().writeValue(mapping.toFile(), Map.of("version", 1, "sourceLandscapeId", "source",
                    "targetLandscapeId", "math", "mappings", include ? List.of(Map.of(
                            "legacyGoalId", "old-a", "canonicalGoalId", "A", "matchType", "exact")) : List.of()));
        }
    }
}
