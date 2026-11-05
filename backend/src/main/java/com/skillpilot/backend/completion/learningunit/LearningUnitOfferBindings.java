package com.skillpilot.backend.completion.learningunit;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.security.MessageDigest;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Consumer;

/** Current native offer selection. Its validity never participates in historical recognition. */
public final class LearningUnitOfferBindings {
    public static final String SEMANTICS = "current-learning-unit-offers-v1";
    public static final String RESOLVER = "native-personal-curriculum-offers-v1";
    public static final String CAPABILITY = "learningUnitOfferBindingsV1";
    private final String revision;
    private final String digest;
    private final String failure;
    private final Map<ScopeKey, CompiledOffer> offers;

    private LearningUnitOfferBindings(String revision, String digest, String failure,
                                     Map<ScopeKey, CompiledOffer> offers) {
        this.revision = revision;
        this.digest = digest;
        this.failure = failure;
        this.offers = Map.copyOf(offers);
    }

    public record ScopeKey(String rootLandscapeId, String landscapeId, String schoolForm,
                           String jurisdiction, String stage, String durationModel, String courseProfile) { }
    public record ResolvedOfferContext(ScopeKey scopeKey, Set<String> targetIds,
                                       Set<String> prerequisiteOnlyIds, Set<String> compositionViewIds) {
        public ResolvedOfferContext {
            targetIds = Set.copyOf(targetIds);
            prerequisiteOnlyIds = Set.copyOf(prerequisiteOnlyIds);
            compositionViewIds = Set.copyOf(compositionViewIds);
        }
    }
    public record Proof(String path, String sha256) { }
    public record Manifest(int schemaVersion, String semantics, String revision, String resolverRevision,
                           Map<String, String> inputs, String reviewRef, Proof proof, List<Offer> offers,
                           Proof entryDerivation) {
        public Manifest(int schemaVersion, String semantics, String revision, String resolverRevision,
                        Map<String, String> inputs, String reviewRef, Proof proof, List<Offer> offers) {
            this(schemaVersion, semantics, revision, resolverRevision, inputs, reviewRef, proof, offers, null);
        }
    }
    public record Offer(ScopeKey scope, String coverage, List<String> compositionViewIds,
                        List<String> inputPaths, String targetSetSha256, String prerequisiteOnlySetSha256,
                        List<LearningUnitDefinition.ContractRef> rootContractRefs) { }
    public record ResolvedOffer(String status, String revision, String bindingDigest, ScopeKey scopeKey,
                                String coverage, List<LearningUnitDefinition.ContractRef> rootContractRefs,
                                List<LearningUnitDefinition.ContractRef> selectedContractRefs,
                                int coveredTargetCount, int totalTargetCount, String failure) { }
    @FunctionalInterface public interface InputValidator {
        void validate(String path, byte[] pinnedBytes) throws Exception;
    }
    private record CompiledOffer(Offer source, List<LearningUnitDefinition.ContractRef> selected,
                                 Set<String> targets, String failure) { }

    public static LearningUnitOfferBindings unavailable(String failure) {
        return new LearningUnitOfferBindings(null, null, failure, Map.of());
    }

    /** Reads each shared runtime input once. The proof descriptor is deliberately never read. */
    public static LearningUnitOfferBindings load(LearningUnitCatalog.CurrentOfferBinding pointer,
            LearningUnitCatalog.InputSource source, LearningUnitCatalog catalog,
            Consumer<LearningUnitDefinition> currentUnitValidator, InputValidator currentInputValidator,
            ObjectMapper mapper) {
        if (pointer == null) return unavailable("Current offer binding is absent");
        try {
            String path = LearningUnitCatalog.checkedPath(pointer.path());
            if (!path.startsWith("DE/Gymnasium/learning-units/offers/")) throw new IllegalArgumentException("Offer outside reviewed archive");
            byte[] bytes = source.read(path);
            if (!sha256(bytes).equals(pointer.sha256())) throw new IllegalArgumentException("Current offer binding digest differs");
            var strict = mapper.copy().enable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
            Manifest manifest = strict.readValue(bytes, Manifest.class);
            if (manifest.schemaVersion() != 1 || !SEMANTICS.equals(manifest.semantics())
                    || !RESOLVER.equals(manifest.resolverRevision()) || !text(manifest.revision())
                    || manifest.inputs() == null || manifest.offers() == null || manifest.offers().isEmpty()) {
                throw new IllegalArgumentException("Unsupported current offer binding");
            }
            String review = LearningUnitCatalog.checkedPath(manifest.reviewRef());
            if (!manifest.inputs().containsKey(review)) throw new IllegalArgumentException("Offer review is not pinned");
            Map<String, String> inputFailures = new LinkedHashMap<>();
            Map<String, byte[]> inputBytesByPath = new LinkedHashMap<>();
            for (var input : manifest.inputs().entrySet()) {
                try {
                    String inputPath = LearningUnitCatalog.checkedPath(input.getKey());
                    byte[] inputBytes = source.read(inputPath);
                    if (!sha256(inputBytes).equals(input.getValue())) throw new IllegalArgumentException("Runtime input digest differs");
                    inputBytesByPath.put(inputPath, inputBytes);
                } catch (Exception invalid) { inputFailures.put(input.getKey(), invalid.getMessage()); }
            }
            Set<String> provenanceOnly = LearningUnitEntryDerivation.validate(manifest.entryDerivation(), inputBytesByPath, mapper);
            for (var input : inputBytesByPath.entrySet()) if (!provenanceOnly.contains(input.getKey())) {
                try { currentInputValidator.validate(input.getKey(), input.getValue()); }
                catch (Exception invalid) { inputFailures.put(input.getKey(), invalid.getMessage()); }
            }
            if (inputFailures.containsKey(review)) throw new IllegalArgumentException("Offer review bytes are unavailable");
            Map<LearningUnitDefinition.ContractRef, LearningUnitDefinition> definitions = new LinkedHashMap<>();
            catalog.definitions().forEach(definition -> definitions.put(definition.ref(), definition));
            Map<LearningUnitDefinition.ContractRef, String> unitFailures = new LinkedHashMap<>();
            Set<LearningUnitDefinition.ContractRef> validatedUnits = new LinkedHashSet<>();
            Map<ScopeKey, CompiledOffer> compiled = new LinkedHashMap<>();
            for (Offer offer : manifest.offers()) {
                if (offer == null || offer.scope() == null) continue;
                ScopeKey key = offer.scope();
                String problem = null;
                List<LearningUnitDefinition.ContractRef> selected = new ArrayList<>();
                Set<String> targets = new LinkedHashSet<>();
                try {
                    requireScope(key);
                    if (!Set.of("partial", "complete").contains(offer.coverage())) throw new IllegalArgumentException("Unknown coverage");
                    unique(offer.compositionViewIds());
                    for (String input : unique(offer.inputPaths())) {
                        if (!manifest.inputs().containsKey(input) || inputFailures.containsKey(input)) throw new IllegalArgumentException("Required current input is unavailable: " + input);
                    }
                    if (!digest(offer.targetSetSha256()) || !digest(offer.prerequisiteOnlySetSha256())) throw new IllegalArgumentException("Invalid target/support digest");
                    ArrayDeque<LearningUnitDefinition.ContractRef> pending = new ArrayDeque<>(unique(offer.rootContractRefs()));
                    Set<LearningUnitDefinition.ContractRef> seen = new LinkedHashSet<>();
                    while (!pending.isEmpty()) {
                        var ref = pending.removeFirst();
                        if (!seen.add(ref)) throw new IllegalArgumentException("A selected child has multiple acquisition paths");
                        var definition = definitions.get(ref);
                        if (definition == null) throw new IllegalArgumentException("Selected contract was not admitted: " + ref);
                        if (!key.landscapeId().equals(definition.sourceBinding().landscapeId())) throw new IllegalArgumentException("Foreign acquisition root");
                        if (validatedUnits.add(ref)) {
                            try { currentUnitValidator.accept(definition); }
                            catch (Exception invalid) { unitFailures.put(ref, invalid.getMessage()); }
                        }
                        if (unitFailures.containsKey(ref)) throw new IllegalArgumentException("Current unit binding differs: " + ref);
                        for (String id : definition.ownGoalIds()) if (!targets.add(id)) throw new IllegalArgumentException("Multiple selected owners: " + id);
                        selected.add(ref);
                        pending.addAll(definition.requiredChildContractRefs());
                    }
                } catch (Exception invalid) { problem = invalid.getMessage(); }
                if (compiled.containsKey(key)) problem = "Duplicate semantic offer key";
                compiled.put(key, new CompiledOffer(offer, List.copyOf(selected), Set.copyOf(targets), problem));
            }
            return new LearningUnitOfferBindings(manifest.revision(), pointer.sha256(), null, compiled);
        } catch (Exception invalid) { return unavailable(invalid.getMessage()); }
    }

    /** One indexed key lookup and the already available native projection; no 182-scope rebuild. */
    public ResolvedOffer resolve(ResolvedOfferContext context) {
        if (context == null || context.scopeKey() == null) return result("unresolved", context, null, "Native Personal Curriculum scope is unresolved");
        if (failure != null) return result("unavailable", context, null, failure);
        CompiledOffer compiled = offers.get(context.scopeKey());
        if (compiled == null) return result("unresolved", context, null, "No exact native offer key");
        Offer offer = compiled.source();
        String problem = compiled.failure();
        if (problem == null && (!setDigest(context.targetIds()).equals(offer.targetSetSha256())
                || !setDigest(context.prerequisiteOnlyIds()).equals(offer.prerequisiteOnlySetSha256())
                || !context.compositionViewIds().equals(Set.copyOf(offer.compositionViewIds())))) problem = "Actual native target/support/view projection differs";
        if (problem == null && (!context.targetIds().containsAll(compiled.targets())
                || "complete".equals(offer.coverage()) && !context.targetIds().equals(compiled.targets()))) problem = "Selected acquisition partition differs from native targets";
        return result(problem == null ? "valid" : "unavailable", context, compiled, problem);
    }

    private ResolvedOffer result(String status, ResolvedOfferContext context, CompiledOffer compiled, String problem) {
        boolean valid = "valid".equals(status);
        return new ResolvedOffer(status, revision, digest, context == null ? null : context.scopeKey(),
                compiled == null ? null : compiled.source().coverage(),
                valid ? compiled.source().rootContractRefs() : List.of(), valid ? compiled.selected() : List.of(),
                valid ? compiled.targets().size() : 0, context == null ? 0 : context.targetIds().size(), problem);
    }

    public static String setDigest(Set<String> ids) { return LearningUnitSourceBindings.canonicalDigest(ids.stream().sorted().toList()); }
    private static <T> Set<T> unique(List<T> values) {
        if (values == null || values.stream().anyMatch(java.util.Objects::isNull)) throw new IllegalArgumentException("Missing identity list");
        Set<T> result = new LinkedHashSet<>(values);
        if (result.size() != values.size()) throw new IllegalArgumentException("Duplicate identity");
        return result;
    }
    private static void requireScope(ScopeKey scope) {
        if (!text(scope.rootLandscapeId()) || !text(scope.landscapeId()) || !"Gymnasium".equals(scope.schoolForm())
                || !text(scope.jurisdiction()) || !("ALL".equals(scope.jurisdiction()) || scope.jurisdiction().matches("DE-[A-Z]{2}"))
                || !Set.of("SekI", "SekII", "CrossStage").contains(scope.stage())
                || scope.durationModel() != null && !Set.of("G8", "G9").contains(scope.durationModel())
                || "SekI".equals(scope.stage()) && scope.courseProfile() != null
                || !"SekI".equals(scope.stage()) && !Set.of("GK", "LK", "GK+LK").contains(scope.courseProfile())) {
            throw new IllegalArgumentException("Scope is not a normalized native offer key");
        }
    }
    private static String sha256(byte[] bytes) throws Exception { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes)); }
    private static boolean digest(String value) { return value != null && value.matches("[a-f0-9]{64}"); }
    private static boolean text(String value) { return value != null && !value.isBlank(); }
}
