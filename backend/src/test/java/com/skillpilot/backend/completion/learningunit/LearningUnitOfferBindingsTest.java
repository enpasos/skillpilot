package com.skillpilot.backend.completion.learningunit;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.Test;

class LearningUnitOfferBindingsTest {
    private final ObjectMapper mapper = new ObjectMapper();
    private static final String BINDER = "DE/Gymnasium/learning-units/offers/test.json";
    private static final String REVIEW = "DE/Gymnasium/quality/offer-review.md";
    private static final String INPUT = "DE/Gymnasium/current.json";
    private static final LearningUnitDefinition.ContractRef UNIT = new LearningUnitDefinition.ContractRef("unit", "1");
    private static final Set<String> TARGETS = Set.of("A", "Q");

    @Test void explicitSelectedRootsNeverGrowByAnotherContractsTargetSubset() throws Exception {
        var fixture = fixture();
        var original = fixture.catalog().definitions().getFirst();
        var extraJson = mapper.valueToTree(original);
        ((com.fasterxml.jackson.databind.node.ObjectNode) extraJson).put("contractId", "alternative");
        var alternative = mapper.treeToValue(extraJson, LearningUnitDefinition.class);
        var catalog = catalog(List.of(original, alternative));
        var loaded = load(fixture, catalog, List.of(row(scope("ALL"), "complete", List.of(UNIT), INPUT)), ignored -> {});
        var offer = loaded.resolve(context(scope("ALL"), TARGETS));
        assertThat(offer.status()).isEqualTo("valid");
        assertThat(offer.selectedContractRefs()).containsExactly(UNIT);
        assertThat(offer.rootContractRefs()).containsExactly(UNIT);
        assertThat(fixture.reads()).doesNotContain("proof-only.json");
    }

    @Test void allIsAnExactJurisdictionAndMissingScopeNeverSelectsANeighbor() throws Exception {
        var fixture = fixture();
        var loaded = load(fixture, fixture.catalog(), List.of(row(scope("ALL"), "partial", List.of(UNIT), INPUT)), ignored -> {});
        assertThat(loaded.resolve(context(scope("DE-HE"), TARGETS)).status()).isEqualTo("unresolved");
        assertThat(loaded.resolve(new LearningUnitOfferBindings.ResolvedOfferContext(null, TARGETS, Set.of(), Set.of("view"))).status()).isEqualTo("unresolved");
        assertThat(loaded.resolve(context(scope("ALL"), TARGETS)).status()).isEqualTo("valid");
    }

    @Test void equalGoalCountsCannotHideDifferentTargetSupportOrViewMembership() throws Exception {
        var fixture = fixture();
        var loaded = load(fixture, fixture.catalog(), List.of(row(scope("ALL"), "complete", List.of(UNIT), INPUT)), ignored -> {});
        assertThat(loaded.resolve(context(scope("ALL"), Set.of("A", "another-Q"))).status()).isEqualTo("unavailable");
        assertThat(loaded.resolve(new LearningUnitOfferBindings.ResolvedOfferContext(scope("ALL"), TARGETS, Set.of("outside"), Set.of("view"))).status()).isEqualTo("unavailable");
        assertThat(loaded.resolve(new LearningUnitOfferBindings.ResolvedOfferContext(scope("ALL"), TARGETS, Set.of(), Set.of("another-view"))).status()).isEqualTo("unavailable");
    }

    @Test void partialEmptyAcquisitionIsValidAndCompleteMustIncludeEveryTarget() throws Exception {
        var fixture = fixture();
        var partial = load(fixture, fixture.catalog(), List.of(row(scope("ALL"), "partial", List.of(), INPUT)), ignored -> {});
        assertThat(partial.resolve(context(scope("ALL"), TARGETS))).satisfies(offer -> {
            assertThat(offer.status()).isEqualTo("valid");
            assertThat(offer.coveredTargetCount()).isZero();
            assertThat(offer.totalTargetCount()).isEqualTo(2);
        });
        var complete = load(fixture, fixture.catalog(), List.of(row(scope("ALL"), "complete", List.of(), INPUT)), ignored -> {});
        assertThat(complete.resolve(context(scope("ALL"), TARGETS)).status()).isEqualTo("unavailable");
    }

    @Test void currentUnitOrInputFailureCannotWithdrawHistoricalRecognitionOrAnotherOffer() throws Exception {
        var fixture = fixture();
        String other = "DE/Gymnasium/other-view.json";
        fixture.files().put(other, "{}".getBytes(StandardCharsets.UTF_8));
        var rows = List.of(row(scope("DE-HE"), "partial", List.of(UNIT), INPUT), row(scope("DE-BY"), "partial", List.of(UNIT), other));
        var loaded = load(fixture, fixture.catalog(), rows, ignored -> {}, () -> fixture.files().put(INPUT, "changed".getBytes(StandardCharsets.UTF_8)));
        assertThat(loaded.resolve(context(scope("DE-HE"), TARGETS)).status()).isEqualTo("unavailable");
        assertThat(loaded.resolve(context(scope("DE-BY"), TARGETS)).status()).isEqualTo("valid");
        var invalidUnit = load(fixture, fixture.catalog(), rows, ignored -> { throw new IllegalArgumentException("Current ownership differs"); });
        assertThat(invalidUnit.resolve(context(scope("DE-BY"), TARGETS)).status()).isEqualTo("unavailable");
        assertThat(new LearningUnitEvaluator().evaluate(fixture.catalog().compiled(), Set.of("Q")).recognizedGoalIds()).containsExactly("A");
    }

    @Test void aChildReachedThroughTwoSelectedRootsIsNotASecondAcquisitionPath() throws Exception {
        var fixture = fixture();
        var json = (com.fasterxml.jackson.databind.node.ObjectNode) mapper.valueToTree(fixture.catalog().definitions().getFirst());
        json.put("contractId", "parent");
        for (String field : List.of("ownGoalIds", "ownAssessmentGoalIds", "ownRecallGoalIds", "ownOrientationGoalIds")) json.putArray(field);
        for (String field : List.of("ownGoalMeanings", "ownResolvedKinds", "ownGoalMeaningDigests", "atomicPrerequisites", "assessmentClaims")) json.putObject(field);
        json.putArray("requiredChildContractRefs").add(mapper.valueToTree(UNIT));
        var parent = mapper.treeToValue(json, LearningUnitDefinition.class);
        var loaded = load(fixture, catalog(List.of(fixture.catalog().definitions().getFirst(), parent)),
                List.of(row(scope("ALL"), "partial", List.of(UNIT, parent.ref()), INPUT)), ignored -> {});
        assertThat(loaded.resolve(context(scope("ALL"), TARGETS)).status()).isEqualTo("unavailable");
    }

    @Test void aNewReviewedViewBinderReopensAnUnchangedUnitWithoutWithdrawingHistoricalRecognition() throws Exception {
        var fixture = fixture();
        var source = LearningUnitSourceBindingsTest.fixture();
        String unchangedContractDigest = fixture.catalog().compiled().digest();
        var rows = List.of(row(scope("ALL"), "partial", List.of(UNIT), INPUT));
        var stale = load(fixture, fixture.catalog(), rows,
                definition -> LearningUnitSourceBindings.validateCurrentUnit(definition, source.source(), source.goals()),
                () -> fixture.files().put(INPUT, "{\"viewId\":\"view\",\"label\":\"New navigation\"}".getBytes(StandardCharsets.UTF_8)));
        assertThat(stale.resolve(context(scope("ALL"), TARGETS)).status()).isEqualTo("unavailable");
        assertThat(new LearningUnitEvaluator().evaluate(fixture.catalog().compiled(), Set.of("Q")).recognizedGoalIds()).containsExactly("A");
        var revised = load(fixture, fixture.catalog(), rows,
                definition -> LearningUnitSourceBindings.validateCurrentUnit(definition, source.source(), source.goals()));
        assertThat(revised.resolve(context(scope("ALL"), TARGETS)).status()).isEqualTo("valid");
        assertThat(fixture.catalog().compiled().digest()).isEqualTo(unchangedContractDigest);
    }

    @Test void validCurrentOfferRequiresExactlyItsNativeMappingPathsAndHashesWithoutArchiveOrReviewUnion() throws Exception {
        var fixture = fixture();
        String nativePath = "DE/Gymnasium/mapping/AA/native.json";
        byte[] mapping = mapper.writeValueAsBytes(Map.of("version", 1, "sourceLandscapeId", "legacy",
                "targetLandscapeId", "math", "mappings", List.of()));
        fixture.files().put(nativePath, mapping);
        fixture.files().put("DE/Gymnasium/learning-units/sources/archive/mapping/old.json", mapping);
        var review = (com.fasterxml.jackson.databind.node.ObjectNode) mapper.readTree(mapping);
        review.put("reviewId", "review-only");
        fixture.files().put("DE/Gymnasium/mapping/AA/review-metadata.json", mapper.writeValueAsBytes(review));
        load(fixture, fixture.catalog(), List.of(row(scope("ALL"), "partial", List.of(UNIT), INPUT)), ignored -> {});
        byte[] bytes = fixture.files().get(BINDER);
        var pointer = new LearningUnitCatalog.CurrentOfferBinding(BINDER, LearningUnitCatalogTest.hash(bytes));
        Map<String, String> exact = Map.of(nativePath, LearningUnitCatalogTest.hash(mapping));
        var valid = LearningUnitOfferBindings.load(pointer, fixture.files()::get, fixture.catalog(),
                ignored -> {}, (path, input) -> {}, mapper, exact);
        assertThat(valid.resolve(context(scope("ALL"), TARGETS)).status()).isEqualTo("valid");
        for (Map<String, String> wrong : List.of(Map.<String, String>of(), Map.of(nativePath, "0".repeat(64)),
                Map.of(nativePath, LearningUnitCatalogTest.hash(mapping), "DE/Gymnasium/mapping/AA/extra.json", LearningUnitCatalogTest.hash(mapping)))) {
            var unavailable = LearningUnitOfferBindings.load(pointer, fixture.files()::get, fixture.catalog(),
                    ignored -> {}, (path, input) -> {}, mapper, wrong);
            assertThat(unavailable.resolve(context(scope("ALL"), TARGETS)).status()).isEqualTo("unavailable");
        }
        assertThat(new LearningUnitEvaluator().evaluate(fixture.catalog().compiled(), Set.of("Q")).recognizedGoalIds()).containsExactly("A");
    }

    @Test void malformedLiveMappingCannotProduceAHealthySubsetEvenWithMatchingDeclaredDigests() throws Exception {
        for (String bad : List.of("{\"version\":1,\"sourceLandscapeId\":\"legacy\",\"targetLandscapeId\":\"math\",\"mappings\":\"broken\"}", "{")) {
            var fixture = fixture();
            String goodPath = "DE/Gymnasium/mapping/AA/good.json", badPath = "DE/Gymnasium/mapping/AA/bad.json";
            fixture.files().put(goodPath, mapper.writeValueAsBytes(Map.of("version", 1, "sourceLandscapeId", "legacy",
                    "targetLandscapeId", "math", "mappings", List.of())));
            fixture.files().put(badPath, bad.getBytes(StandardCharsets.UTF_8));
            load(fixture, fixture.catalog(), List.of(row(scope("ALL"), "partial", List.of(UNIT), INPUT)), ignored -> {});
            byte[] bytes = fixture.files().get(BINDER);
            var pointer = new LearningUnitCatalog.CurrentOfferBinding(BINDER, LearningUnitCatalogTest.hash(bytes));
            Map<String, String> exact = Map.of(goodPath, LearningUnitCatalogTest.hash(fixture.files().get(goodPath)),
                    badPath, LearningUnitCatalogTest.hash(fixture.files().get(badPath)));
            for (Map<String, String> declared : List.of(exact, Map.of(goodPath, exact.get(goodPath)))) {
                var loaded = LearningUnitOfferBindings.load(pointer, fixture.files()::get, fixture.catalog(),
                        ignored -> {}, (path, input) -> {}, mapper, declared);
                assertThat(loaded.resolve(context(scope("ALL"), TARGETS)).status()).isEqualTo("unavailable");
            }
        }
    }

    private LearningUnitOfferBindings load(Fixture f, LearningUnitCatalog catalog,
            List<LearningUnitOfferBindings.Offer> rows, java.util.function.Consumer<LearningUnitDefinition> validator) throws Exception {
        return load(f, catalog, rows, validator, () -> {});
    }
    private LearningUnitOfferBindings load(Fixture f, LearningUnitCatalog catalog,
            List<LearningUnitOfferBindings.Offer> rows, java.util.function.Consumer<LearningUnitDefinition> validator,
            Runnable afterPinning) throws Exception {
        Map<String, String> inputs = new LinkedHashMap<>();
        for (var entry : f.files().entrySet()) if (!BINDER.equals(entry.getKey()))
            inputs.put(entry.getKey(), LearningUnitCatalogTest.hash(entry.getValue()));
        var manifest = new LearningUnitOfferBindings.Manifest(1, LearningUnitOfferBindings.SEMANTICS, "test-v1",
                LearningUnitOfferBindings.RESOLVER, inputs, REVIEW, new LearningUnitOfferBindings.Proof("proof-only.json", "0".repeat(64)), rows);
        byte[] bytes = mapper.writeValueAsBytes(manifest);
        f.files().put(BINDER, bytes);
        afterPinning.run();
        return LearningUnitOfferBindings.load(new LearningUnitCatalog.CurrentOfferBinding(BINDER, LearningUnitCatalogTest.hash(bytes)), path -> {
            f.reads().add(path); return f.files().get(path);
        }, catalog, validator, (path, input) -> {}, mapper);
    }
    private static LearningUnitOfferBindings.Offer row(LearningUnitOfferBindings.ScopeKey scope, String coverage,
            List<LearningUnitDefinition.ContractRef> roots, String input) {
        return new LearningUnitOfferBindings.Offer(scope, coverage, List.of("view"), List.of(input),
                LearningUnitOfferBindings.setDigest(TARGETS), LearningUnitOfferBindings.setDigest(Set.of()), roots);
    }
    private static LearningUnitOfferBindings.ScopeKey scope(String jurisdiction) {
        return new LearningUnitOfferBindings.ScopeKey("root", "math", "Gymnasium", jurisdiction, "CrossStage", null, "GK+LK");
    }
    private static LearningUnitOfferBindings.ResolvedOfferContext context(LearningUnitOfferBindings.ScopeKey scope, Set<String> targets) {
        return new LearningUnitOfferBindings.ResolvedOfferContext(scope, targets, Set.of(), Set.of("view"));
    }
    private Fixture fixture() throws Exception {
        var archive = new LearningUnitCatalogTest().archive("archived");
        var catalog = LearningUnitCatalog.load(archive.manifest(), archive.files()::get, ignored -> {}, mapper);
        Map<String, byte[]> files = new LinkedHashMap<>();
        files.put(REVIEW, "Reviewed native bindings".getBytes(StandardCharsets.UTF_8));
        files.put(INPUT, "{}".getBytes(StandardCharsets.UTF_8));
        return new Fixture(catalog, files, new ArrayList<>());
    }
    private LearningUnitCatalog catalog(List<LearningUnitDefinition> definitions) throws Exception {
        var constructor = LearningUnitCatalog.class.getDeclaredConstructor(List.class, Map.class, Map.class);
        constructor.setAccessible(true);
        return constructor.newInstance(definitions, Map.of(), Map.of());
    }
    private record Fixture(LearningUnitCatalog catalog, Map<String, byte[]> files, List<String> reads) { }
}
