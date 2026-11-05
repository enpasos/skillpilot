package com.skillpilot.backend.completion.learningunit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.skillpilot.backend.landscape.GoalPlacement;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.landscape.ProgramUnit;
import com.skillpilot.backend.landscape.SkillLandscape;
import com.skillpilot.backend.service.SrsGoalCardSelection;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.Test;

class LearningUnitRecallBindingsTest {
    private final ObjectMapper mapper = new ObjectMapper().enable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
    private static final String ROOT = "DE/Gymnasium/learning-units/inputs/";

    @Test void frozenSelectionUsesTheActualSelectTagAndStableLocaleEquivalentCards() throws Exception {
        var fixture = fixture();
        var recall = frozen(fixture);
        assertThat(recall.requiredCardIds()).containsExactly("c1");
        assertThat(recall.cardMeaningsByLocale().get("de")).containsOnlyKeys("c1");
        assertThat(recall.cardMeaningsByLocale().get("en")).containsOnlyKeys("c1");
        assertThat(SrsGoalCardSelection.filterTags(fixture.goal())).containsExactly("select:own");
        LearningUnitRecallBindings.validateActive(recall, fixture.goal(),
                (id, source) -> fixture.files().get(source.endsWith("en.json") ? ROOT + "deck.en.json" : ROOT + "deck.de.json"), mapper);
    }

    @Test void aNonemptyPinnedFileListIsInsufficientWithoutExactSelectionAuthority() throws Exception {
        var fixture = fixture();
        assertThatThrownBy(() -> LearningUnitRecallBindings.validateFrozen(fixture.definition(), Map.of("K", fixture.goal()),
                Map.of("K", List.of(ROOT + "deck.de.json")), fixture.files(), mapper)).isInstanceOf(Exception.class);
    }

    @Test void wrongDeckForeignCardChangedFilterAndLocaleMismatchAreRejected() throws Exception {
        for (String mutation : List.of("deck", "foreign", "filter", "locale", "duplicate", "source")) {
            var fixture = fixture();
            String path = ROOT + "selection.en.json";
            ObjectNode selection = (ObjectNode) mapper.readTree(fixture.files().get(path));
            switch (mutation) {
                case "deck" -> selection.put("deckId", "foreign-deck");
                case "foreign" -> selection.putArray("requiredCardIds").add("c2");
                case "filter" -> selection.putArray("filterTags").add("select:foreign");
                case "locale" -> selection.put("locale", "fr");
                case "duplicate" -> selection.putArray("requiredCardIds").add("c1").add("c1");
                case "source" -> selection.put("sourcePath", "/data/foreign_flashcards_core.en.json");
                default -> throw new AssertionError(mutation);
            }
            fixture.files().put(path, mapper.writeValueAsBytes(selection));
            assertThatThrownBy(() -> frozen(fixture)).isInstanceOf(Exception.class);
        }
    }

    @Test void changedSelectedCardMeaningAndExpandedSelectionCannotReuseAnOldK() throws Exception {
        var fixture = fixture();
        var old = frozen(fixture);
        ObjectNode deck = (ObjectNode) mapper.readTree(fixture.files().get(ROOT + "deck.de.json"));
        ((ObjectNode) deck.path("cards").get(0)).put("back", "A different answer");
        fixture.files().put(ROOT + "deck.de.json", mapper.writeValueAsBytes(deck));
        assertThatThrownBy(() -> LearningUnitRecallBindings.validateActive(old, fixture.goal(),
                (id, source) -> fixture.files().get(source.endsWith("en.json") ? ROOT + "deck.en.json" : ROOT + "deck.de.json"), mapper))
                .hasMessageContaining("Active deck/card meaning differs");
        repinDeckSelection(fixture, "de");
        var changed = frozen(fixture);
        assertThat(old.sameOutcomeMeaning(changed)).isFalse();
        fixture.goal().setTags(List.of("srs-deck:deck", "select:own", "select:foreign"));
        assertThatThrownBy(() -> LearningUnitRecallBindings.validateActive(old, fixture.goal(),
                (id, source) -> fixture.files().get(source.endsWith("en.json") ? ROOT + "deck.en.json" : ROOT + "deck.de.json"), mapper))
                .hasMessageContaining("Active deck/card meaning differs");
    }

    @Test void presentationOnlyDeckAndCategoryMetadataDoesNotChangeExistingRecallOutcome() throws Exception {
        var fixture = fixture();
        var old = frozen(fixture);
        for (String locale : List.of("de", "en")) {
            String path = ROOT + "deck." + locale + ".json";
            ObjectNode deck = (ObjectNode) mapper.readTree(fixture.files().get(path));
            deck.put("title", "A renamed display deck").put("description", "New display metadata");
            ((ObjectNode) deck.path("cards").get(0)).put("category", "A renamed display category");
            fixture.files().put(path, mapper.writeValueAsBytes(deck));
            repinDeckSelection(fixture, locale);
        }
        var current = frozen(fixture);
        assertThat(old.sameOutcomeMeaning(current)).isTrue();
        LearningUnitRecallBindings.validateActive(old, fixture.goal(),
                (id, source) -> fixture.files().get(source.endsWith("en.json") ? ROOT + "deck.en.json" : ROOT + "deck.de.json"), mapper);
    }

    @Test void archivedRecallIsIndependentOfLiveDeckAndActiveRecallRequiresActualDeckProof() throws Exception {
        var fixture = fixture();
        var archived = catalog(fixture, "archived");
        var loaded = LearningUnitCatalog.load(archived.manifest(), archived.files()::get,
                ignored -> { throw new AssertionError("Archived recall must not depend on live source"); }, mapper);
        assertThat(loaded.quarantined()).isEmpty();
        assertThat(loaded.frozenRecallSelections().get("K").requiredCardIds()).containsExactly("c1");
        var active = catalog(fixture, "active");
        var unsupported = LearningUnitCatalog.load(active.manifest(), active.files()::get, ignored -> {}, mapper);
        assertThat(unsupported.definitions()).hasSize(1);
        assertThat(unsupported.quarantined()).isEmpty();
        assertThat(unsupported.currentReadinessFailures()).hasSize(1);
        var supported = LearningUnitCatalog.load(active.manifest(), active.files()::get, ignored -> {},
                recall -> LearningUnitRecallBindings.validateActive(recall, fixture.goal(),
                        (id, source) -> fixture.files().get(source.endsWith("en.json") ? ROOT + "deck.en.json" : ROOT + "deck.de.json"), mapper), mapper);
        assertThat(supported.quarantined()).isEmpty();
        assertThat(supported.currentReadinessFailures()).isEmpty();
    }

    @Test void sourceFallbackAndLegacyEligibleTagsRetainExistingSrsSelectionRules() {
        var goal = new LearningGoal();
        goal.setTags(List.of("srs-deck:deck", "structure", "A1", "GK", "topic"));
        goal.setExtendedData(Map.of("vocabularySource", "only-de"));
        assertThat(SrsGoalCardSelection.vocabularySource(goal, "en-US")).isEqualTo("only-de");
        assertThat(SrsGoalCardSelection.filterTags(goal)).containsExactly("GK", "topic");
        assertThat(SrsGoalCardSelection.select(goal, List.of(List.of("topic"), List.of("foreign"), List.of("GK")), tags -> tags))
                .containsExactly(List.of("topic"), List.of("GK"));
    }

    @Test void unsupportedLegacyConsumerCannotSilentlyTreatSelectionFilesAsSufficientRecallEvidence() throws Exception {
        var archive = catalog(fixture(), "archived");
        ObjectNode manifest = (ObjectNode) mapper.readTree(archive.manifest());
        ObjectNode entry = (ObjectNode) manifest.path("contracts").get(0);
        assertThatThrownBy(() -> mapper.treeToValue(entry, LegacyEntry.class)).hasMessageContaining("recallBindingSemantics");
        entry.remove("recallBindingSemantics");
        var unsupported = LearningUnitCatalog.load(mapper.writeValueAsBytes(manifest), archive.files()::get, ignored -> {}, mapper);
        assertThat(unsupported.definitions()).isEmpty();
        assertThat(unsupported.quarantined().values()).singleElement().asString().contains("explicitly supported immutable selection semantics");
    }

    @Test void conflictingNewRecallContractCannotReplaceAnArchivedCardMeaning() throws Exception {
        var fixture = fixture();
        var oldArchive = catalog(fixture, "archived");
        var oldEntry = mapper.readValue(oldArchive.manifest(), LearningUnitCatalog.Manifest.class).contracts().getFirst();
        ObjectNode deck = (ObjectNode) mapper.readTree(fixture.files().get(ROOT + "deck.de.json"));
        ((ObjectNode) deck.path("cards").get(0)).put("back", "Changed meaning behind the same stable card ID");
        fixture.files().put(ROOT + "deck.de.json", mapper.writeValueAsBytes(deck));
        repinDeckSelection(fixture, "de");
        var newArchive = catalog(fixture, "active");
        var entry = mapper.readValue(newArchive.manifest(), LearningUnitCatalog.Manifest.class).contracts().getFirst();
        Map<String, byte[]> combined = new HashMap<>(oldArchive.files());
        Map<String, String> inputs = new LinkedHashMap<>();
        for (String path : entry.inputs().keySet()) {
            byte[] bytes = newArchive.files().get(path);
            if (path.equals(entry.sourceSnapshotPath())) {
                ObjectNode snapshot = (ObjectNode) mapper.readTree(bytes);
                ((ObjectNode) snapshot.path("landscapes").get(0).path("programUnits").get(0).path("learningUnit")).put("revision", "2");
                bytes = mapper.writeValueAsBytes(snapshot);
            } else if (path.contains("selection.")) {
                ObjectNode selection = (ObjectNode) mapper.readTree(bytes);
                selection.put("deckPath", secondPath(selection.path("deckPath").asText()));
                bytes = mapper.writeValueAsBytes(selection);
            }
            combined.put(secondPath(path), bytes);
            inputs.put(secondPath(path), LearningUnitCatalogTest.hash(bytes));
        }
        String contractPath = "DE/Gymnasium/learning-units/contracts/recall/2.json";
        ObjectNode definition = (ObjectNode) mapper.readTree(newArchive.files().get(entry.path()));
        definition.put("revision", "2");
        combined.put(contractPath, mapper.writeValueAsBytes(definition));
        var conflicting = new LearningUnitCatalog.Entry(contractPath, LearningUnitCatalogTest.hash(combined.get(contractPath)), "active",
                secondPath(entry.sourceSnapshotPath()), inputs, Map.of(),
                Map.of("K", entry.recallInputs().get("K").stream().map(LearningUnitRecallBindingsTest::secondPath).toList()),
                LearningUnitRecallBindings.SEMANTICS);
        var loaded = LearningUnitCatalog.load(mapper.writeValueAsBytes(new LearningUnitCatalog.Manifest(1, List.of(conflicting, oldEntry))),
                combined::get, ignored -> {}, mapper);
        assertThat(loaded.definitions()).singleElement().satisfies(value -> assertThat(value.revision()).isEqualTo("1"));
        assertThat(loaded.quarantined().get(contractPath)).contains("RECALL_MEANING_CONFLICT");
        assertThat(loaded.frozenRecallSelections().get("K").cardMeaningsByLocale().get("de").get("c1").back()).isEqualTo("de back");
    }

    private static String secondPath(String path) { return path.startsWith(ROOT) ? ROOT + "r2/" + path.substring(ROOT.length()) : path; }

    private record LegacyEntry(String path, String sha256, String status, String sourceSnapshotPath,
                               Map<String, String> inputs, Map<String, Object> assessmentInputs,
                               Map<String, List<String>> recallInputs) { }

    private LearningUnitRecallBindings.FrozenRecall frozen(Fixture fixture) throws Exception {
        return LearningUnitRecallBindings.validateFrozen(fixture.definition(), Map.of("K", fixture.goal()),
                Map.of("K", List.of(ROOT + "selection.de.json", ROOT + "selection.en.json")), fixture.files(), mapper).get("K");
    }

    private Fixture fixture() throws Exception {
        LearningGoal goal = new LearningGoal();
        goal.setId("K"); goal.setTitle("Recall"); goal.setDescription("Recall the selected facts.");
        goal.setType("atomic"); goal.setNodeKind("memory"); goal.setSemanticKind("memory");
        goal.setContains(List.of()); goal.setRequires(List.of());
        goal.setTags(List.of("srs-deck:deck", "select:own", "display-tag"));
        goal.setExtendedData(Map.of("vocabularySource", "/data/demo_flashcards_core.de.json",
                "vocabularySourceEn", "/data/demo_flashcards_core.en.json"));
        var localized = Map.of("de", "Erinnern", "en", "Recall");
        var definition = new LearningUnitDefinition(1, LearningUnitDefinition.SEMANTICS, "recall-unit", "1",
                new LearningUnitDefinition.SourceBinding("math", "unit", "p1", LearningUnitSourceBindingsTest.viewDigests()),
                localized, localized, localized, List.of("K"), List.of(), List.of(), List.of("K"), List.of(),
                Map.of("K", LearningUnitSourceBindings.meaning(goal)), Map.of("K", "memory"),
                Map.of("K", LearningUnitSourceBindings.meaningDigest(goal)), Map.of("K", List.of()), Map.of(), "quality/review.md");
        Map<String, byte[]> files = new HashMap<>();
        files.put("DE/Gymnasium/quality/review.md", "Independent exact recall selection review".getBytes(StandardCharsets.UTF_8));
        for (String locale : List.of("de", "en")) {
            files.put(ROOT + "deck." + locale + ".json", mapper.writeValueAsBytes(Map.of("deckId", "deck", "title", "Display name",
                    "cards", List.of(Map.of("id", "c1", "front", locale + " front", "back", locale + " back", "tags", List.of("select:own")),
                            Map.of("id", "c2", "front", "foreign front", "back", "foreign back", "tags", List.of("select:foreign"))))));
            var selection = new LearningUnitRecallBindings.Selection(1, LearningUnitRecallBindings.SEMANTICS, "K", locale, "deck",
                    SrsGoalCardSelection.vocabularySource(goal, locale), ROOT + "deck." + locale + ".json",
                    LearningUnitCatalogTest.hash(files.get(ROOT + "deck." + locale + ".json")),
                    List.of("select:own"), List.of("c1"), "quality/review.md");
            files.put(ROOT + "selection." + locale + ".json", mapper.writeValueAsBytes(selection));
        }
        return new Fixture(definition, goal, files);
    }

    private void repinDeckSelection(Fixture fixture, String locale) throws Exception {
        String selectionPath = ROOT + "selection." + locale + ".json";
        ObjectNode selection = (ObjectNode) mapper.readTree(fixture.files().get(selectionPath));
        selection.put("deckSha256", LearningUnitCatalogTest.hash(fixture.files().get(ROOT + "deck." + locale + ".json")));
        fixture.files().put(selectionPath, mapper.writeValueAsBytes(selection));
    }

    private LearningUnitCatalogTest.Archive catalog(Fixture fixture, String status) throws Exception {
        Map<String, byte[]> files = new HashMap<>(fixture.files());
        var metadata = new ProgramUnit.LearningUnitMetadata("recall-unit", "1", "p1", fixture.definition().promise(), fixture.definition().introduction());
        var unit = new ProgramUnit(); unit.setId("unit"); unit.setLearningUnit(metadata);
        var placement = new GoalPlacement(); placement.setGoalId("K"); placement.setUnitId("unit"); placement.setRelation("primary"); placement.setAcquisition(true);
        var landscape = new SkillLandscape(); landscape.setLandscapeId("math"); landscape.setGoals(List.of(fixture.goal()));
        landscape.setProgramUnits(List.of(unit)); landscape.setGoalPlacements(List.of(placement));
        String contract = "DE/Gymnasium/learning-units/contracts/recall/1.json";
        String source = ROOT + "recall-source.json";
        files.put(contract, mapper.writeValueAsBytes(fixture.definition()));
        files.put(source, mapper.writeValueAsBytes(new LearningUnitCatalog.SourceSnapshot(1, "completion-goal-kinds-v1", List.of(landscape), LearningUnitSourceBindingsTest.viewDigests())));
        files.put(ROOT + "view.json", mapper.writeValueAsBytes(Map.of("viewId", "view")));
        Map<String, String> inputs = new LinkedHashMap<>();
        for (var file : files.entrySet()) if (!file.getKey().equals(contract)) inputs.put(file.getKey(), LearningUnitCatalogTest.hash(file.getValue()));
        var entry = new LearningUnitCatalog.Entry(contract, LearningUnitCatalogTest.hash(files.get(contract)), status, source, inputs,
                Map.of(), Map.of("K", List.of(ROOT + "selection.de.json", ROOT + "selection.en.json")), LearningUnitRecallBindings.SEMANTICS);
        return new LearningUnitCatalogTest.Archive(mapper.writeValueAsBytes(new LearningUnitCatalog.Manifest(1, List.of(entry))), files);
    }

    private record Fixture(LearningUnitDefinition definition, LearningGoal goal, Map<String, byte[]> files) { }
}
