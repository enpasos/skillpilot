package com.skillpilot.backend.identity;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.Set;
import java.util.LinkedHashSet;
import org.junit.jupiter.api.Test;

/** Actual byte/inverse proof fixtures; no verified=true test factory or runtime wiring. */
class GoalIdentityServiceTest {
    private static final String OWNER = "ab000000-0000-4000-8000-000000000001";
    private static final String OTHER_OWNER = "cd000000-0000-4000-8000-000000000002";
    private static final String BASE = "0123456789abcdef0123456789abcdef01234567";
    private static final JsonNodeFactory JSON = JsonNodeFactory.instance;

    @Test
    void all164RenamesUseCurrentApiIdentityAndOriginalDurableStorageKey() throws Exception {
        var fixture = new Fixture(); var service = fixture.service();
        for (int i = 0; i < 164; i++) {
            String old = fixture.oldIds.get(i), current = fixture.targets.get(i);
            assertThat(service.canonicalGoalId(old)).isEqualTo(current);
            assertThat(service.canonicalGoalId(current)).isEqualTo(current);
            assertThat(service.storageGoalId(old)).isEqualTo(old);
            assertThat(service.storageGoalId(current)).isEqualTo(old);
            assertThat(service.canonicalGoalId(OWNER + ":" + old)).isEqualTo(current);
            assertThat(service.storageGoalId(OWNER + ":" + current)).isEqualTo(old);
        }
        String unchanged = fixture.unchangedIds.getFirst();
        assertThat(service.canonicalGoalId(unchanged)).isEqualTo(unchanged);
        assertThat(service.storageGoalId(OWNER + ":" + unchanged)).isEqualTo(unchanged);
        // Identity projection is not existence/authorization: an untouched valid
        // unqualified UUID is preserved for later goal/history validation.
        String historical = "20000000-0000-4000-8000-000000000001";
        assertThat(service.canonicalGoalId(historical)).isEqualTo(historical);
        assertThat(service.storageGoalId(historical)).isEqualTo(historical);
    }

    @Test
    void qualifiedReferencesRejectWrongUnknownEmptyAndMultipleOwners() throws Exception {
        var fixture = new Fixture(); var service = fixture.service();
        for (String reference : List.of(OTHER_OWNER + ":" + fixture.oldIds.getFirst(),
                OTHER_OWNER + ":" + fixture.targets.getFirst(), OWNER + ":unknown-symbol",
                OWNER + ":20000000-0000-4000-8000-000000000001", ":" + fixture.oldIds.getFirst(),
                OWNER + ":", OWNER + ":extra:" + fixture.oldIds.getFirst(), "unmapped-symbol")) {
            assertThatThrownBy(() -> service.canonicalGoalId(reference)).isInstanceOf(GoalIdentityException.class);
            assertThatThrownBy(() -> service.storageGoalId(reference)).isInstanceOf(GoalIdentityException.class);
        }
    }

    @Test
    void proofAndSnapshotAreMandatoryAndCannotBeSelfAcceptedByTheirOwnFlags() throws Exception {
        var fixture = new Fixture(); var loader = new SourceIdentityProofVerifier();
        assertThatThrownBy(() -> GoalIdentityService.fromValidatedActivation(null, fixture.snapshot))
                .isInstanceOf(GoalIdentityException.class).hasMessageContaining("Missing validated activation");
        assertThatThrownBy(() -> loader.verify(null, fixture.binding(), fixture))
                .isInstanceOf(GoalIdentityException.class);
        var accepted = fixture.binding();
        fixture.manifest.put("untrustedVerified", true);
        assertThatThrownBy(() -> loader.verify(fixture.manifestBytes(), accepted, fixture))
                .isInstanceOf(GoalIdentityException.class).hasMessageContaining("Unaccepted manifest");
        fixture.manifest.remove("untrustedVerified"); fixture.manifest.remove("proof");
        assertThatThrownBy(fixture::service).isInstanceOf(GoalIdentityException.class).hasMessageContaining("proof envelope");
    }

    @Test
    void acceptedProofRejectsStaleBaseSnapshotGenerationAndPackageRepositoryMismatch() throws Exception {
        var fixture = new Fixture(); var accepted = fixture.binding(); var loader = new SourceIdentityProofVerifier();
        fixture.base = "1123456789abcdef0123456789abcdef01234567";
        assertThatThrownBy(() -> loader.verify(fixture.manifestBytes(), accepted, fixture))
                .isInstanceOf(GoalIdentityException.class).hasMessageContaining("Stale original");
        fixture.base = BASE;
        var proof = loader.verify(fixture.manifestBytes(), accepted, fixture);
        var other = new GoalIdentityService.SnapshotIdentity(GoalIdentityService.Source.PACKAGE,
                "fixture-package-v2", fixture.snapshot.generationSha256());
        var runtime = new GoalIdentityProofLoader();
        assertThatThrownBy(() -> runtime.load(fixture.manifestBytes(), other))
                .isInstanceOf(GoalIdentityException.class).hasMessageContaining("activation is unavailable");
        fixture.snapshot = new GoalIdentityService.SnapshotIdentity(GoalIdentityService.Source.REPOSITORY,
                "fixture-repository", "b".repeat(64));
        assertThatThrownBy(() -> loader.verify(fixture.manifestBytes(), accepted, fixture))
                .isInstanceOf(GoalIdentityException.class).hasMessageContaining("active snapshot");
    }

    @Test
    void actualOriginalCurrentAndContractBytesAreCheckedIncludingUntouchedCatalogFiles() throws Exception {
        var fixture = new Fixture();
        fixture.current.put(fixture.catalogPaths.getLast(), "changed History bytes".getBytes(StandardCharsets.UTF_8));
        assertThatThrownBy(fixture::service).isInstanceOf(GoalIdentityException.class).hasMessageContaining("Unproved semantic delta");
        fixture = new Fixture(); fixture.original.remove(fixture.catalogPaths.getFirst());
        assertThatThrownBy(fixture::service).isInstanceOf(GoalIdentityException.class).hasMessageContaining("bound bytes");
        var contractFixture = new Fixture(); var accepted = contractFixture.binding();
        contractFixture.artifacts.put(contractFixture.artifacts.keySet().iterator().next(), new byte[]{0});
        assertThatThrownBy(() -> new SourceIdentityProofVerifier().verify(contractFixture.manifestBytes(), accepted, contractFixture))
                .isInstanceOf(GoalIdentityException.class).hasMessageContaining("bound bytes");
    }

    @Test
    void repinnedGoalHashCannotHideCardRubricTimestampOrDescriptionChanges() throws Exception {
        var fixture = new Fixture(); String path = fixture.catalogPaths.getFirst();
        JsonNode candidate = CanonicalIdentityJson.parse(fixture.current.get(path));
        ((ObjectNode) candidate.path("goals").get(0)).put("description", "Changed semantic content");
        fixture.current.put(path, CanonicalIdentityJson.encode(candidate));
        ((ObjectNode) fixture.manifest.path("documents").get(0))
                .put("hypotheticalCanonicalSha256", CanonicalIdentityJson.digest(candidate));
        assertThatThrownBy(fixture::service).isInstanceOf(GoalIdentityException.class)
                .hasMessageContaining("beyond the declared identity fields");
    }

    @Test
    void referenceKeyInversePreservesNestedSourceIdentityAndTimestamp() throws Exception {
        var fixture = new Fixture(); String old = fixture.oldIds.getFirst(), target = fixture.targets.getFirst();
        String path = "curricula/DE/Gymnasium/provenance/canonical-goal-provenance-registry.json";
        ObjectNode before = JSON.objectNode();
        var branch = before.putArray("landscapes").addObject().put("landscapeId", OWNER).putObject("goalProvenance");
        branch.putObject(old).put("sourceGoalId", "historical-source-unchanged").put("capturedAt", "2026-10-01T10:00:00Z");
        ObjectNode after = before.deepCopy(); ObjectNode currentBranch = (ObjectNode) after.path("landscapes").get(0).path("goalProvenance");
        currentBranch.set(target, currentBranch.remove(old));
        fixture.original.put(path, CanonicalIdentityJson.encode(before)); fixture.current.put(path, CanonicalIdentityJson.encode(after));
        fixture.proofPaths.add(path);
        var proofDocument = ((ArrayNode) fixture.manifest.path("documents")).addObject()
                .put("path", path).put("classification", "provenance-registry").put("handling", "explicit-pointer-projection")
                .put("sourceSha256", CanonicalIdentityJson.sha256(fixture.original.get(path)))
                .put("beforeCanonicalSha256", CanonicalIdentityJson.digest(before))
                .put("hypotheticalCanonicalSha256", CanonicalIdentityJson.digest(after))
                .put("inverseCanonicalSha256", CanonicalIdentityJson.digest(before));
        proofDocument.putArray("fields").addObject().put("pointer", "/landscapes/0/goalProvenance/" + old)
                .put("kind", "key").put("role", "reference-key").put("landscapeId", OWNER).put("before", old).put("after", target);
        proofDocument.putArray("matchedSourceGoalIds").add(old);
        assertThat(fixture.service().canonicalGoalId(old)).isEqualTo(target);
        ((ObjectNode) currentBranch.path(target)).put("sourceGoalId", target);
        fixture.current.put(path, CanonicalIdentityJson.encode(after));
        proofDocument.put("hypotheticalCanonicalSha256", CanonicalIdentityJson.digest(after));
        assertThatThrownBy(fixture::service).isInstanceOf(GoalIdentityException.class)
                .hasMessageContaining("beyond the declared identity fields");
    }

    @Test
    void identityOwnerMustMatchTheActualSourceDocumentNotOnlyManifestAgreement() throws Exception {
        var fixture = new Fixture(); String path = fixture.catalogPaths.getFirst();
        String newTarget = SourceIdentityProofVerifier.deriveTarget(OTHER_OWNER, fixture.oldIds.getFirst());
        ObjectNode rule = (ObjectNode) fixture.manifest.path("rules").get(0);
        rule.put("landscapeId", OTHER_OWNER).put("targetGoalId", newTarget);
        JsonNode current = CanonicalIdentityJson.parse(fixture.current.get(path));
        ((ObjectNode) current.path("goals").get(0)).put("id", newTarget);
        fixture.current.put(path, CanonicalIdentityJson.encode(current));
        rule.put("hypotheticalGoalSha256", CanonicalIdentityJson.digest(current.path("goals").get(0)));
        ObjectNode document = (ObjectNode) fixture.manifest.path("documents").get(0);
        document.put("hypotheticalCanonicalSha256", CanonicalIdentityJson.digest(current));
        ((ObjectNode) document.path("fields").get(0)).put("landscapeId", OTHER_OWNER).put("after", newTarget);
        assertThatThrownBy(fixture::service).isInstanceOf(GoalIdentityException.class).hasMessageContaining("noncanonical source identities");
    }

    @Test
    void packageSnapshotUsesOnlyItsBoundInputsAndCannotFallBackToRepositoryFiles() throws Exception {
        var fixture = new Fixture();
        fixture.snapshot = new GoalIdentityService.SnapshotIdentity(GoalIdentityService.Source.PACKAGE,
                "fixture-package-v2", "c".repeat(64));
        assertThat(fixture.service().storageGoalId(fixture.targets.getFirst())).isEqualTo(fixture.oldIds.getFirst());
        fixture.original.remove(fixture.catalogPaths.getFirst());
        assertThatThrownBy(fixture::service).isInstanceOf(GoalIdentityException.class).hasMessageContaining("bound bytes");
    }

    @Test
    void deterministicTargetNoninjectiveCollisionAliasChainAndCycleAreRejected() throws Exception {
        var fixture = new Fixture();
        fixture.targets.set(1, fixture.targets.getFirst()); fixture.rebuild();
        assertThatThrownBy(fixture::service).isInstanceOf(GoalIdentityException.class);
        fixture = new Fixture(); fixture.unchangedIds.set(0, fixture.targets.getFirst().toUpperCase(java.util.Locale.ROOT)); fixture.rebuild();
        assertThatThrownBy(fixture::service).isInstanceOf(GoalIdentityException.class).hasMessageContaining("collides");
        fixture = new Fixture(); fixture.oldIds.set(1, fixture.targets.getFirst());
        fixture.targets.set(1, SourceIdentityProofVerifier.deriveTarget(OWNER, fixture.oldIds.get(1))); fixture.rebuild();
        assertThatThrownBy(fixture::service).isInstanceOf(GoalIdentityException.class).hasMessageContaining("noncanonical source identities");
        fixture = new Fixture(); fixture.targets.set(0, fixture.oldIds.get(1)); fixture.targets.set(1, fixture.oldIds.get(0)); fixture.rebuild();
        assertThatThrownBy(fixture::service).isInstanceOf(GoalIdentityException.class);
    }

    @Test
    void identityReadsLeaveDurableMasteryAndSuccessfulCardStateByteExactAndRetainNoMutableInputs() throws Exception {
        var fixture = new Fixture(); String old = fixture.oldIds.getFirst(), current = fixture.targets.getFirst();
        Map<String, Double> mastery = Map.of(old, 1.0);
        byte[] card = "{\"card-unchanged\":{\"verifiedRecall\":{\"passedAt\":\"2026-10-01T10:00:00Z\"},\"attempts\":4}}".getBytes(StandardCharsets.UTF_8);
        Map<String, byte[]> srs = Map.of(old, card.clone());
        var service = fixture.service();
        assertThat(mastery.get(service.storageGoalId(current))).isEqualTo(1.0);
        assertThat(srs.get(service.storageGoalId(OWNER + ":" + current))).containsExactly(card);
        fixture.original.clear(); fixture.current.clear(); fixture.artifacts.clear(); fixture.oldIds.clear();
        assertThat(service.canonicalGoalId(old)).isEqualTo(current);
        assertThat(service.storageGoalId(current)).isEqualTo(old);
        assertThat(mastery).containsExactlyEntriesOf(Map.of(old, 1.0));
        assertThat(srs).containsOnlyKeys(old);
        assertThat(srs.get(old)).containsExactly(card);
    }

    @Test
    void canonicalProfileMatchesSharedVectorsWithoutIeeeRoundingAndRejectsInvalidJson() throws Exception {
        var profile = CanonicalIdentityJson.parse(Files.readAllBytes(contractRoot().resolve("canonical-json-profile.json")));
        for (JsonNode vector : profile.path("vectors")) {
            byte[] actual = CanonicalIdentityJson.encode(CanonicalIdentityJson.parse(vector.path("inputJson").textValue().getBytes(StandardCharsets.UTF_8)));
            assertThat(new String(actual, StandardCharsets.UTF_8)).isEqualTo(vector.path("canonicalJson").textValue());
            assertThat(CanonicalIdentityJson.sha256(actual)).isEqualTo(vector.path("sha256").textValue());
        }
        for (String invalid : List.of("{\"a\":1,\"a\":2}", "NaN", "\"\\ud800\"", "[1] [2]"))
            assertThatThrownBy(() -> CanonicalIdentityJson.parse(invalid.getBytes(StandardCharsets.UTF_8)))
                    .isInstanceOf(GoalIdentityException.class);
    }

    @Test
    void sourceProofHasOnlyCandidateQaCapabilityAndCannotActivateRuntime() throws Exception {
        var fixture = new Fixture();
        var source = new SourceIdentityProofVerifier().verify(fixture.manifestBytes(), fixture.binding(), fixture);
        assertThat(source.canonicalGoalIdForCandidateQa(fixture.oldIds.getFirst())).isEqualTo(fixture.targets.getFirst());
        assertThat(Arrays.stream(source.getClass().getMethods()).map(java.lang.reflect.Method::getName))
                .doesNotContain("storageGoalId", "activate", "runtimeService");
        assertThat(Arrays.stream(GoalIdentityService.class.getMethods()).flatMap(method -> Arrays.stream(method.getParameterTypes())))
                .doesNotContain(SourceIdentityProofVerifier.SourceIdentityProof.class);
        for (byte[] receipt : new byte[][]{null, fixture.manifestBytes(), "{\"verified\":true,\"activationReady\":true}".getBytes(StandardCharsets.UTF_8)})
            assertThatThrownBy(() -> new GoalIdentityProofLoader().load(receipt, fixture.snapshot))
                    .isInstanceOf(GoalIdentityException.class).hasMessageContaining("activation is unavailable");
    }

    @Test
    void sourceProofDoesNotHashItsOwnDerivedOutputsAndRejectsUnclassifiedInputsOrBroaderExclusions() throws Exception {
        var fixture = new Fixture(); var verifier = new SourceIdentityProofVerifier(); var accepted = fixture.binding();
        String output = fixture.manifest.path("derivedOutputExclusions").get(0).path("path").textValue();
        fixture.current.put(output, "old report".getBytes(StandardCharsets.UTF_8));
        var first = verifier.verify(fixture.manifestBytes(), accepted, fixture);
        fixture.current.put(output, "new generated report bytes".getBytes(StandardCharsets.UTF_8));
        var second = verifier.verify(fixture.manifestBytes(), accepted, fixture);
        assertThat(first.manifestSha256()).isEqualTo(second.manifestSha256());
        assertThatThrownBy(() -> second.projectedSourceBytes(output)).isInstanceOf(GoalIdentityException.class);
        fixture.proofPaths.add("fixture/unclassified-active-input.json");
        assertThatThrownBy(fixture::service).isInstanceOf(GoalIdentityException.class).hasMessageContaining("Unknown or missing source proof inputs");
        fixture.proofPaths.remove("fixture/unclassified-active-input.json");
        String extraCatalog = "fixture/unlisted-goal-landscape.json";
        fixture.catalogPaths.add(extraCatalog);
        fixture.original.put(extraCatalog, "{\"landscapeId\":\"unlisted\",\"goals\":[]}".getBytes(StandardCharsets.UTF_8));
        fixture.current.put(extraCatalog, fixture.original.get(extraCatalog).clone());
        assertThatThrownBy(fixture::service).isInstanceOf(GoalIdentityException.class).hasMessageContaining("Unknown or missing catalog");
        fixture.catalogPaths.remove(extraCatalog); fixture.original.remove(extraCatalog); fixture.current.remove(extraCatalog);
        ((ArrayNode) fixture.manifest.path("derivedOutputExclusions")).addObject().put("path", "fixture/unclassified-active-input.json")
                .put("producerId", "guessed-producer").put("kind", "current-generated-output");
        assertThatThrownBy(fixture::service).isInstanceOf(GoalIdentityException.class)
                .hasMessageContaining("schema").hasMessageContaining("derivedOutputExclusions");
    }

    @Test
    void candidateQaIncludesUnchangedIdsWhosePrerequisiteReferencesWereRenamed() throws Exception {
        var fixture = new Fixture(); String path = fixture.catalogPaths.getLast();
        ObjectNode before = (ObjectNode) CanonicalIdentityJson.parse(fixture.original.get(path));
        ObjectNode goal = (ObjectNode) before.path("goals").get(0);
        ((ArrayNode) goal.path("requires")).add(fixture.oldIds.getFirst());
        ObjectNode after = before.deepCopy();
        ((ArrayNode) after.path("goals").get(0).path("requires")).set(0, JSON.textNode(fixture.targets.getFirst()));
        fixture.original.put(path, CanonicalIdentityJson.encode(before)); fixture.current.put(path, CanonicalIdentityJson.encode(after));
        fixture.proofPaths.add(path);
        ((ObjectNode) fixture.manifest.path("catalog").path("sourceFiles").get(592))
                .put("sha256", CanonicalIdentityJson.sha256(fixture.original.get(path)));
        var document = ((ArrayNode) fixture.manifest.path("documents")).addObject().put("path", path)
                .put("classification", "runtime-graph").put("handling", "explicit-pointer-projection")
                .put("sourceSha256", CanonicalIdentityJson.sha256(fixture.original.get(path)))
                .put("beforeCanonicalSha256", CanonicalIdentityJson.digest(before))
                .put("hypotheticalCanonicalSha256", CanonicalIdentityJson.digest(after))
                .put("inverseCanonicalSha256", CanonicalIdentityJson.digest(before));
        document.putArray("fields").addObject().put("pointer", "/goals/0/requires/0").put("kind", "value").put("role", "reference")
                .put("landscapeId", OWNER).put("before", fixture.oldIds.getFirst()).put("after", fixture.targets.getFirst());
        document.putArray("matchedSourceGoalIds").add(fixture.oldIds.getFirst());
        var proof = new SourceIdentityProofVerifier().verify(fixture.manifestBytes(), fixture.binding(), fixture);
        var original = proof.originalReviewDefinition(OWNER, fixture.unchangedIds.getLast());
        assertThat(original.originalGoalId()).isEqualTo(original.canonicalGoalId());
        assertThat(CanonicalIdentityJson.parse(original.originalGoalJson()).path("requires").get(0).textValue())
                .isEqualTo(fixture.oldIds.getFirst());
        assertThat(CanonicalIdentityJson.parse(original.projectedGoalJson()).path("requires").get(0).textValue())
                .isEqualTo(fixture.targets.getFirst());
        byte[] projected = proof.projectedSourceBytes(path); projected[0] = 0;
        assertThat(proof.projectedSourceBytes(path)[0]).isNotZero();
    }

    @Test
    void independentlyRepinnedManifestStillMustSatisfyTheWholeClosedSchema() throws Exception {
        var fixture = new Fixture();
        fixture.manifest.put("unknownSchemaField", true);
        assertThatThrownBy(fixture::service).isInstanceOf(GoalIdentityException.class)
                .hasMessageContaining("schema");
        fixture = new Fixture(); ((ObjectNode) fixture.manifest.path("rules").get(0)).put("unknownNestedField", true);
        assertThatThrownBy(fixture::service).isInstanceOf(GoalIdentityException.class).hasMessageContaining("schema");
        fixture = new Fixture(); fixture.manifest.put("schemaVersion", "1");
        assertThatThrownBy(fixture::service).isInstanceOf(GoalIdentityException.class).hasMessageContaining("schema");
    }

    @Test
    void registryIsSchemaValidatedAndAcceptedSchemasCannotLoadExternalReferences() throws Exception {
        var fixture = new Fixture(); String registry = "contracts/canonical-goal-identity/v1/reference-fields.json";
        ObjectNode invalidRegistry = (ObjectNode) CanonicalIdentityJson.parse(fixture.artifacts.get(registry));
        invalidRegistry.put("unknownSchemaField", true);
        fixture.artifacts.put(registry, CanonicalIdentityJson.encode(invalidRegistry)); fixture.rebuild();
        assertThatThrownBy(fixture::service).isInstanceOf(GoalIdentityException.class).hasMessageContaining("reference registry");
        fixture = new Fixture(); String schema = "contracts/canonical-goal-identity/v1/source-bijection-proof.schema.json";
        ObjectNode invalidSchema = (ObjectNode) CanonicalIdentityJson.parse(fixture.artifacts.get(schema));
        ((ObjectNode) invalidSchema.path("$defs")).putObject("external").put("$ref", "https://untrusted.invalid/schema.json");
        fixture.artifacts.put(schema, CanonicalIdentityJson.encode(invalidSchema)); fixture.rebuild();
        assertThatThrownBy(fixture::service).isInstanceOf(GoalIdentityException.class).hasMessageContaining("External identity schema reference forbidden");
    }

    @Test
    void oneCapturedCurrentByteSequenceMustBackEveryProjectionAndReviewDefinition() throws Exception {
        var fixture = new Fixture(); String path = fixture.catalogPaths.getFirst();
        ObjectNode before = (ObjectNode) CanonicalIdentityJson.parse(fixture.original.get(path));
        ObjectNode after = (ObjectNode) CanonicalIdentityJson.parse(fixture.current.get(path));
        var extra = JSON.objectNode().put("id", "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb")
                .put("description", "Actual verified description");
        extra.putArray("contains"); extra.putArray("requires");
        ((ArrayNode) before.path("goals")).add(extra);
        ((ArrayNode) after.path("goals")).add(extra.deepCopy());
        fixture.replaceCatalogDocument(0, before, after);
        ObjectNode forged = after.deepCopy();
        ((ObjectNode) forged.path("goals").get(1)).put("description", "UNVERIFIED first-read description");
        byte[] forgedBytes = CanonicalIdentityJson.encode(forged);
        var inputs = new SourceIdentityProofVerifier.SnapshotInputs() {
            int reads;
            public GoalIdentityService.SnapshotIdentity snapshot() { return fixture.snapshot(); }
            public String originalBaseCommit() { return fixture.originalBaseCommit(); }
            public byte[] originalBytes(String p) { return fixture.originalBytes(p); }
            public byte[] contractBytes(String p) { return fixture.contractBytes(p); }
            public Set<String> catalogSourcePaths() { return fixture.catalogSourcePaths(); }
            public Set<String> proofDocumentPaths() { return fixture.proofDocumentPaths(); }
            public byte[] currentBytes(String p) {
                return p.equals(path) && ++reads == 1 ? forgedBytes : fixture.currentBytes(p);
            }
        };
        assertThatThrownBy(() -> new SourceIdentityProofVerifier().verify(
                fixture.manifestBytes(), fixture.binding(), inputs)).isInstanceOf(GoalIdentityException.class);
    }

    @Test
    void validatedProjectionReadsEachAdapterPathOnceAndRetainsOnlyCapturedBytes() throws Exception {
        var fixture = new Fixture(); Map<String, Integer> reads = new HashMap<>();
        var inputs = new SourceIdentityProofVerifier.SnapshotInputs() {
            public GoalIdentityService.SnapshotIdentity snapshot() { return fixture.snapshot(); }
            public String originalBaseCommit() { return fixture.originalBaseCommit(); }
            public Set<String> catalogSourcePaths() { return fixture.catalogSourcePaths(); }
            public Set<String> proofDocumentPaths() { return fixture.proofDocumentPaths(); }
            private byte[] once(String kind, String path, byte[] bytes) {
                assertThat(reads.merge(kind + ":" + path, 1, Integer::sum)).isEqualTo(1); return bytes;
            }
            public byte[] originalBytes(String path) { return once("original", path, fixture.originalBytes(path)); }
            public byte[] currentBytes(String path) { return once("current", path, fixture.currentBytes(path)); }
            public byte[] contractBytes(String path) { return once("contract", path, fixture.contractBytes(path)); }
        };
        var proof = new SourceIdentityProofVerifier().verify(fixture.manifestBytes(), fixture.binding(), inputs);
        String path = fixture.catalogPaths.getFirst(); byte[] verified = proof.projectedSourceBytes(path);
        Arrays.fill(fixture.current.get(path), (byte) 0); Arrays.fill(fixture.original.get(path), (byte) 0);
        assertThat(proof.projectedSourceBytes(path)).containsExactly(verified);
        assertThat(CanonicalIdentityJson.parse(proof.originalReviewDefinition(OWNER, fixture.targets.getFirst())
                .projectedGoalJson()).path("description").textValue()).isEqualTo("Unchanged content");
    }

    @Test
    void qualifiedUntouchedUuidsUseUuidValuesWhileRetainingTheirOriginalStorageSpelling() throws Exception {
        var fixture = new Fixture(); var identities = fixture.service();
        String unchanged = fixture.unchangedIds.getFirst();
        assertThat(identities.canonicalGoalId(OWNER + ":" + unchanged.toUpperCase(java.util.Locale.ROOT)))
                .isEqualTo(unchanged);
        assertThat(identities.storageGoalId(OWNER + ":" + unchanged.toUpperCase(java.util.Locale.ROOT)))
                .isEqualTo(unchanged);
        assertThat(identities.canonicalGoalId(unchanged.toUpperCase(java.util.Locale.ROOT))).isEqualTo(unchanged);
        assertThat(identities.storageGoalId(unchanged.toUpperCase(java.util.Locale.ROOT))).isEqualTo(unchanged);
        assertThat(identities.storageGoalId(OWNER.toUpperCase(java.util.Locale.ROOT) + ":" + unchanged))
                .isEqualTo(unchanged);
        var source = new SourceIdentityProofVerifier().verify(fixture.manifestBytes(), fixture.binding(), fixture);
        assertThat(source.originalReviewDefinition(OWNER.toUpperCase(java.util.Locale.ROOT),
                unchanged.toUpperCase(java.util.Locale.ROOT)).originalGoalId()).isEqualTo(unchanged);
        assertThatThrownBy(() -> identities.canonicalGoalId(OWNER + ":" + fixture.oldIds.getFirst().toUpperCase(java.util.Locale.ROOT)))
                .isInstanceOf(GoalIdentityException.class);
    }

    @Test
    void completeProjectionRejectsAnOmittedLiveRequiresEvenWithRepinnedHashesAndInverse() throws Exception {
        var fixture = new Fixture(); String path = fixture.catalogPaths.getFirst();
        ObjectNode before = (ObjectNode) CanonicalIdentityJson.parse(fixture.original.get(path));
        ObjectNode after = (ObjectNode) CanonicalIdentityJson.parse(fixture.current.get(path));
        ((ArrayNode) before.path("goals").get(0).path("requires")).add(fixture.oldIds.get(1));
        ((ArrayNode) after.path("goals").get(0).path("requires")).add(fixture.oldIds.get(1));
        fixture.replaceCatalogDocument(0, before, after);
        assertThatThrownBy(fixture::service).isInstanceOf(GoalIdentityException.class)
                .hasMessageContaining("projection");
    }

    @Test
    void activeInputsCannotBeRelabeledImmutableAndUnknownInputsCannotClaimPreservation() throws Exception {
        var fixture = new Fixture(); String path = fixture.catalogPaths.getFirst();
        ((ObjectNode) fixture.manifest.path("documents").get(0)).put("classification", "immutable-original")
                .put("handling", "preserve-exact-bytes");
        fixture.current.put(path, fixture.original.get(path).clone());
        assertThatThrownBy(fixture::service).isInstanceOf(GoalIdentityException.class).hasMessageContaining("cannot bypass");
        fixture = new Fixture(); path = "fixture/unclassified-active-input.json";
        byte[] bytes = fixture.oldIds.getFirst().getBytes(StandardCharsets.UTF_8);
        fixture.original.put(path, bytes); fixture.current.put(path, bytes); fixture.proofPaths.add(path);
        ((ArrayNode) fixture.manifest.path("documents")).addObject().put("path", path)
                .put("classification", "immutable-original").put("handling", "preserve-exact-bytes")
                .put("sourceSha256", CanonicalIdentityJson.sha256(bytes)).putArray("matchedSourceGoalIds").add(fixture.oldIds.getFirst());
        assertThatThrownBy(fixture::service).isInstanceOf(GoalIdentityException.class).hasMessageContaining("falsely immutable");
    }

    @Test
    void onlyRegistryDeclaredPreservedHitsSurviveAndTheirInventoryMustBeComplete() throws Exception {
        var fixture = new Fixture(); String path = fixture.catalogPaths.getFirst();
        ObjectNode before = (ObjectNode) CanonicalIdentityJson.parse(fixture.original.get(path));
        ObjectNode after = (ObjectNode) CanonicalIdentityJson.parse(fixture.current.get(path));
        ((ObjectNode) before.path("goals").get(0)).putObject("extendedData").putObject("provenance").put("sourceGoalId", fixture.oldIds.getFirst());
        ((ObjectNode) after.path("goals").get(0)).set("extendedData", before.path("goals").get(0).path("extendedData").deepCopy());
        fixture.replaceCatalogDocument(0, before, after);
        JsonNode registry = CanonicalIdentityJson.parse(fixture.artifacts.get("contracts/canonical-goal-identity/v1/reference-fields.json"));
        String reason = registry.path("preservedActiveFields").get(1).path("reason").textValue();
        ArrayNode preserved = (ArrayNode) fixture.manifest.path("documents").get(0).path("preservedFields");
        preserved.addObject().put("pointer", "/goals/0/extendedData/provenance/sourceGoalId").put("kind", "value")
                .put("reason", reason).putArray("matchedSourceGoalIds").add(fixture.oldIds.getFirst());
        var proof = new SourceIdentityProofVerifier().verify(fixture.manifestBytes(), fixture.binding(), fixture);
        assertThat(CanonicalIdentityJson.parse(proof.projectedSourceBytes(path)).at("/goals/0/extendedData/provenance/sourceGoalId").textValue())
                .isEqualTo(fixture.oldIds.getFirst());
        preserved.removeAll();
        assertThatThrownBy(fixture::service).isInstanceOf(GoalIdentityException.class).hasMessageContaining("preserved hits");
    }

    private static Path contractRoot() {
        Path path = Path.of("..", "contracts", "canonical-goal-identity", "v1");
        return Files.isDirectory(path) ? path : Path.of("contracts", "canonical-goal-identity", "v1");
    }

    private static final class Fixture implements SourceIdentityProofVerifier.SnapshotInputs {
        final List<String> oldIds = new ArrayList<>(), targets = new ArrayList<>(), unchangedIds = new ArrayList<>();
        final List<String> catalogPaths = new ArrayList<>();
        final Set<String> proofPaths = new LinkedHashSet<>();
        final Map<String, byte[]> original = new LinkedHashMap<>(), current = new LinkedHashMap<>(), artifacts = new LinkedHashMap<>();
        ObjectNode manifest;
        String base = BASE;
        GoalIdentityService.SnapshotIdentity snapshot = new GoalIdentityService.SnapshotIdentity(
                GoalIdentityService.Source.REPOSITORY, "fixture-repository", "a".repeat(64));

        Fixture() throws Exception {
            for (int i = 0; i < 164; i++) { oldIds.add("original_memory_goal_" + i); targets.add(SourceIdentityProofVerifier.deriveTarget(OWNER, oldIds.get(i))); }
            for (int i = 164; i < 593; i++) unchangedIds.add(UUID.nameUUIDFromBytes(("unchanged-" + i).getBytes(StandardCharsets.UTF_8)).toString());
            Path root = contractRoot();
            for (String file : List.of("source-bijection-proof.schema.json", "reference-fields.schema.json", "reference-fields.json", "canonical-json-profile.json"))
                artifacts.put("contracts/canonical-goal-identity/v1/" + file, Files.readAllBytes(root.resolve(file)));
            Path scripts = Files.isDirectory(Path.of("..", "scripts")) ? Path.of("..", "scripts") : Path.of("scripts");
            artifacts.put("scripts/canonical_goal_source_identity_proof.py", Files.readAllBytes(scripts.resolve("canonical_goal_source_identity_proof.py")));
            artifacts.put("scripts/canonical_goal_identity_migration.py", Files.readAllBytes(scripts.resolve("canonical_goal_identity_migration.py")));
            rebuild();
        }

        void rebuild() {
            original.clear(); current.clear(); catalogPaths.clear(); proofPaths.clear();
            manifest = JSON.objectNode();
            manifest.put("$schema", "https://skillpilot.com/contracts/canonical-goal-identity/v1/source-bijection-proof.schema.json");
            manifest.put("schemaVersion", 1).put("migrationId", SourceIdentityProofVerifier.MIGRATION_ID)
                    .put("uuidNamespace", SourceIdentityProofVerifier.NAMESPACE).put("baseCommit", BASE)
                    .put("proofType", "canonical-goal-source-bijection").put("capability", "isolated-qa-candidate-projection")
                    .put("runtimeActivationAllowed", false).put("qaValidityClaimed", false);
            String[] fields = {"schemaBinding", "registrySchemaBinding", "registry", "canonicalJsonProfile", "verifier", "identityKernelBinding"};
            int bindingIndex = 0;
            for (var artifact : artifacts.entrySet()) manifest.putObject(fields[bindingIndex++])
                    .put("path", artifact.getKey()).put("sha256", CanonicalIdentityJson.sha256(artifact.getValue()));
            var catalog = manifest.putObject("catalog").put("scope", "all-runtime-shaped-curricula-excluding-quality")
                    .put("fileCount", 593).put("serializedGoals", 593).put("logicalGoalKeys", 593)
                    .put("resolvedReferencesBefore", 0).put("resolvedReferencesAfter", 0);
            var sourceFiles = catalog.putArray("sourceFiles"); var rules = manifest.putArray("rules"); var documents = manifest.putArray("documents");
            for (int i = 0; i < 593; i++) {
                String path = "fixture/catalog-" + i + ".json"; catalogPaths.add(path);
                String old = i < 164 ? oldIds.get(i) : unchangedIds.get(i - 164);
                ObjectNode before = JSON.objectNode().put("landscapeId", OWNER);
                ObjectNode goal = before.putArray("goals").addObject().put("id", old).put("description", "Unchanged content")
                        .put("nodeKind", "memory").put("weight", 1);
                goal.putArray("contains"); goal.putArray("requires");
                var after = before.deepCopy();
                if (i < 164) ((ObjectNode) after.path("goals").get(0)).put("id", targets.get(i));
                original.put(path, CanonicalIdentityJson.encode(before)); current.put(path, CanonicalIdentityJson.encode(after));
                sourceFiles.addObject().put("path", path).put("sha256", CanonicalIdentityJson.sha256(original.get(path)))
                        .put("landscapeId", OWNER).put("goalCount", 1).put("gitMode", "100644");
                if (i >= 164) continue;
                proofPaths.add(path);
                var rule = rules.addObject().put("landscapeId", OWNER).put("sourceGoalId", old).put("targetGoalId", targets.get(i))
                        .put("relation", "renamed").put("masteryPolicy", "copy-exact").put("historyPolicy", "preserve-original-and-add-alias")
                        .put("sourceFile", path).put("sourcePointer", "/goals/0")
                        .put("beforeGoalSha256", CanonicalIdentityJson.digest(goal))
                        .put("hypotheticalGoalSha256", CanonicalIdentityJson.digest(after.path("goals").get(0)))
                        .put("inverseGoalSha256", CanonicalIdentityJson.digest(goal)).put("semanticPayloadSha256", CanonicalIdentityJson.digest(goal));
                var document = documents.addObject().put("path", path).put("classification", "runtime-graph")
                        .put("handling", "explicit-pointer-projection").put("sourceSha256", CanonicalIdentityJson.sha256(original.get(path)))
                        .put("beforeCanonicalSha256", CanonicalIdentityJson.digest(before))
                        .put("hypotheticalCanonicalSha256", CanonicalIdentityJson.digest(after))
                        .put("inverseCanonicalSha256", CanonicalIdentityJson.digest(before));
                document.putArray("fields").addObject().put("pointer", "/goals/0/id").put("kind", "value").put("role", "identity")
                        .put("landscapeId", OWNER).put("before", old).put("after", targets.get(i));
                document.putArray("preservedFields"); document.putArray("matchedSourceGoalIds").add(old);
            }
            JsonNode schema = CanonicalIdentityJson.parse(artifacts.get("contracts/canonical-goal-identity/v1/source-bijection-proof.schema.json"));
            manifest.set("derivedOutputExclusions", schema.path("properties").path("derivedOutputExclusions").path("const").deepCopy());
            manifest.putObject("proof").put("bijectiveRuleCount", 164).put("globalExistingIdentityCollisionCount", 0)
                    .put("inverseDocumentEqualityVerified", true).put("unclassifiedInputHitCount", 0)
                    .put("historicalInputBytesBound", true).put("cardAndAssetBytesRenamed", false);
        }

        void replaceCatalogDocument(int index, ObjectNode before, ObjectNode after) {
            String path = catalogPaths.get(index);
            int previousCount = CanonicalIdentityJson.parse(original.get(path)).path("goals").size();
            original.put(path, CanonicalIdentityJson.encode(before)); current.put(path, CanonicalIdentityJson.encode(after));
            ObjectNode catalog = (ObjectNode) manifest.path("catalog");
            int delta = before.path("goals").size() - previousCount;
            catalog.put("serializedGoals", catalog.path("serializedGoals").intValue() + delta)
                    .put("logicalGoalKeys", catalog.path("logicalGoalKeys").intValue() + delta);
            ((ObjectNode) catalog.path("sourceFiles").get(index)).put("goalCount", before.path("goals").size())
                    .put("sha256", CanonicalIdentityJson.sha256(original.get(path)));
            for (JsonNode row : manifest.path("documents")) if (row.path("path").asText().equals(path))
                ((ObjectNode) row).put("sourceSha256", CanonicalIdentityJson.sha256(original.get(path)))
                        .put("beforeCanonicalSha256", CanonicalIdentityJson.digest(before))
                        .put("hypotheticalCanonicalSha256", CanonicalIdentityJson.digest(after))
                        .put("inverseCanonicalSha256", CanonicalIdentityJson.digest(before));
            for (JsonNode row : manifest.path("rules")) if (row.path("sourceFile").asText().equals(path)) {
                String pointer = row.path("sourcePointer").asText();
                String oldDigest = CanonicalIdentityJson.digest(before.at(pointer));
                ((ObjectNode) row).put("beforeGoalSha256", oldDigest).put("inverseGoalSha256", oldDigest)
                        .put("semanticPayloadSha256", oldDigest)
                        .put("hypotheticalGoalSha256", CanonicalIdentityJson.digest(after.at(pointer)));
            }
        }

        byte[] manifestBytes() {
            ObjectNode projection = JSON.objectNode(); projection.set("catalog", manifest.path("catalog").get("sourceFiles"));
            projection.set("rules", manifest.get("rules")); projection.set("documents", manifest.get("documents"));
            if (manifest.path("proof").isObject()) ((ObjectNode) manifest.get("proof"))
                    .put("sourceProjectionSha256", CanonicalIdentityJson.digest(projection));
            return CanonicalIdentityJson.encode(manifest);
        }
        SourceIdentityProofVerifier.AcceptedBinding binding() {
            Map<String, String> hashes = new HashMap<>(); artifacts.forEach((path, bytes) -> hashes.put(path, CanonicalIdentityJson.sha256(bytes)));
            return new SourceIdentityProofVerifier.AcceptedBinding(CanonicalIdentityJson.sha256(manifestBytes()), BASE, snapshot, hashes);
        }
        GoalIdentityMap service() {
            return new SourceIdentityProofVerifier().verify(manifestBytes(), binding(), this).identities();
        }
        public GoalIdentityService.SnapshotIdentity snapshot() { return snapshot; }
        public String originalBaseCommit() { return base; }
        public byte[] originalBytes(String path) { return original.get(path); }
        public byte[] currentBytes(String path) { return current.get(path); }
        public byte[] contractBytes(String path) { return artifacts.get(path); }
        public Set<String> catalogSourcePaths() { return Set.copyOf(catalogPaths); }
        public Set<String> proofDocumentPaths() { return Set.copyOf(proofPaths); }
    }
}
