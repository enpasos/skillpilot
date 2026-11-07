package com.skillpilot.backend.identity;

import static com.skillpilot.backend.identity.GoalIdentityService.require;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.nio.ByteBuffer;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;

/**
 * Pure, unwired source-only verifier A. Callers must obtain the
 * accepted binding from their trusted repository/package snapshot; the migration
 * JSON cannot accept itself. No repository filesystem fallback or learner writes.
 */
public final class SourceIdentityProofVerifier {
    static final String MIGRATION_ID = "canonical-goal-id-format-2026-11-06";
    static final String NAMESPACE = "97d8c00c-411d-5dec-b260-4e6f22ab688b";
    private static final List<String> ARTIFACT_BINDINGS =
            List.of("schemaBinding", "registrySchemaBinding", "registry", "canonicalJsonProfile", "verifier", "identityKernelBinding");

    public record AcceptedBinding(String manifestSha256, String baseCommit,
            GoalIdentityService.SnapshotIdentity snapshot, Map<String, String> trustedArtifactSha256) {
        public AcceptedBinding {
            require(GoalIdentityService.isSha(manifestSha256), "Missing accepted manifest digest");
            require(baseCommit != null && baseCommit.matches("[0-9a-f]{40}"), "Missing accepted base commit");
            require(snapshot != null && trustedArtifactSha256 != null, "Missing accepted snapshot/artifacts");
            trustedArtifactSha256 = Map.copyOf(trustedArtifactSha256);
            require(trustedArtifactSha256.size() == 6
                    && trustedArtifactSha256.values().stream().allMatch(GoalIdentityService::isSha),
                    "Exactly six independently pinned contract artifacts are required");
        }
    }

    /** Implementations must read only their own immutable snapshot, including package mode. */
    public interface SnapshotInputs {
        GoalIdentityService.SnapshotIdentity snapshot();
        String originalBaseCommit();
        byte[] originalBytes(String relativePath);
        byte[] currentBytes(String relativePath);
        byte[] contractBytes(String relativePath);
        Set<String> catalogSourcePaths();
        Set<String> proofDocumentPaths();
    }

    /** Read each adapter byte sequence once, clone immediately, and reuse it for every check/view. */
    private static final class CapturedInputs implements SnapshotInputs {
        private final SnapshotInputs source;
        private final GoalIdentityService.SnapshotIdentity snapshot;
        private final String originalBase;
        private final Set<String> catalogPaths, documentPaths;
        private final Map<String, byte[]> originals = new HashMap<>(), currents = new HashMap<>(), contracts = new HashMap<>();

        CapturedInputs(SnapshotInputs source) {
            this.source = source; snapshot = source.snapshot(); originalBase = source.originalBaseCommit();
            catalogPaths = Set.copyOf(source.catalogSourcePaths()); documentPaths = Set.copyOf(source.proofDocumentPaths());
        }
        public GoalIdentityService.SnapshotIdentity snapshot() { return snapshot; }
        public String originalBaseCommit() { return originalBase; }
        public Set<String> catalogSourcePaths() { return catalogPaths; }
        public Set<String> proofDocumentPaths() { return documentPaths; }
        public byte[] originalBytes(String path) { return capture(originals, path, source::originalBytes); }
        public byte[] currentBytes(String path) { return capture(currents, path, source::currentBytes); }
        public byte[] contractBytes(String path) { return capture(contracts, path, source::contractBytes); }
        private static byte[] capture(Map<String, byte[]> captured, String path, java.util.function.Function<String, byte[]> read) {
            if (!captured.containsKey(path)) {
                byte[] value = read.apply(path); captured.put(path, value == null ? null : value.clone());
            }
            byte[] value = captured.get(path); return value == null ? null : value.clone();
        }
    }

    /** Bound historical/current definition bytes, for QA comparison only. */
    public record OriginalReviewDefinition(String landscapeId, String canonicalGoalId, String originalGoalId,
            String sourcePath, String originalDocumentSha256, String originalGoalSha256,
            String projectedGoalSha256, byte[] originalGoalJson, byte[] projectedGoalJson) {
        public OriginalReviewDefinition {
            originalGoalJson = originalGoalJson.clone(); projectedGoalJson = projectedGoalJson.clone();
        }
        @Override public byte[] originalGoalJson() { return originalGoalJson.clone(); }
        @Override public byte[] projectedGoalJson() { return projectedGoalJson.clone(); }
    }

    /** Capability minted only after actual byte/inverse checks; no public constructor or verified flag. */
    public static final class SourceIdentityProof {
        private final String manifestSha256;
        private final String sourceProjectionSha256;
        private final GoalIdentityService.SnapshotIdentity snapshot;
        private final List<GoalIdentityMap.Rename> renames;
        private final Map<String, Set<String>> owners;
        private final Set<String> originalGoalIdsCaseFolded;
        private final GoalIdentityMap identityMap;
        private final Map<String, byte[]> projectedDocuments;
        private final Map<String, List<OriginalReviewDefinition>> reviewDefinitions;

        private SourceIdentityProof(String digest, String projectionDigest, GoalIdentityService.SnapshotIdentity snapshot,
                List<GoalIdentityMap.Rename> renames, Map<String, Set<String>> owners, Set<String> originalIds,
                Map<String, byte[]> projected, Map<String, List<OriginalReviewDefinition>> definitions) {
            manifestSha256 = digest; sourceProjectionSha256 = projectionDigest;
            this.snapshot = snapshot; this.renames = List.copyOf(renames);
            Map<String, Set<String>> copy = new LinkedHashMap<>();
            owners.forEach((id, values) -> copy.put(id, Set.copyOf(values)));
            this.owners = Collections.unmodifiableMap(copy);
            originalGoalIdsCaseFolded = Set.copyOf(originalIds);
            identityMap = new GoalIdentityMap(this.renames, this.owners, originalGoalIdsCaseFolded);
            Map<String, byte[]> documents = new LinkedHashMap<>(); projected.forEach((path, bytes) -> documents.put(path, bytes.clone()));
            projectedDocuments = Collections.unmodifiableMap(documents);
            Map<String, List<OriginalReviewDefinition>> rows = new LinkedHashMap<>();
            definitions.forEach((id, values) -> rows.put(id, List.copyOf(values)));
            reviewDefinitions = Collections.unmodifiableMap(rows);
        }
        public String manifestSha256() { return manifestSha256; }
        public String sourceProjectionSha256() { return sourceProjectionSha256; }
        public GoalIdentityService.SnapshotIdentity snapshot() { return snapshot; }
        List<GoalIdentityMap.Rename> renames() { return renames; }
        Map<String, Set<String>> owners() { return owners; }
        Set<String> originalGoalIdsCaseFolded() { return originalGoalIdsCaseFolded; }
        GoalIdentityMap identities() { return identityMap; }
        public String canonicalGoalIdForCandidateQa(String reference) { return identities().canonicalGoalId(reference); }
        public byte[] projectedSourceBytes(String path) {
            byte[] bytes = projectedDocuments.get(path);
            require(bytes != null, "Not a verified source input: " + path); return bytes.clone();
        }
        public OriginalReviewDefinition originalReviewDefinition(String owner, String currentOrOriginalId) {
            String current = canonicalGoalIdForCandidateQa(owner + ":" + currentOrOriginalId);
            List<OriginalReviewDefinition> definitions = reviewDefinitions.getOrDefault(
                    owner + ":" + GoalIdentityMap.goalUuidValueKey(current), List.of());
            require(!definitions.isEmpty(), "No proof-bound review definition");
            OriginalReviewDefinition first = definitions.getFirst();
            require(definitions.stream().allMatch(row -> row.originalGoalSha256().equals(first.originalGoalSha256())
                    && row.projectedGoalSha256().equals(first.projectedGoalSha256())), "Ambiguous proof-bound review definition");
            return first;
        }

    }

    public SourceIdentityProof verify(byte[] manifestBytes, AcceptedBinding accepted, SnapshotInputs inputs) {
        require(manifestBytes != null && accepted != null && inputs != null, "Missing identity proof or snapshot input");
        manifestBytes = manifestBytes.clone(); inputs = new CapturedInputs(inputs);
        require(accepted.snapshot().equals(inputs.snapshot()), "Stale or foreign active snapshot");
        require(accepted.baseCommit().equals(inputs.originalBaseCommit()), "Stale original snapshot base");
        require(CanonicalIdentityJson.sha256(manifestBytes).equals(accepted.manifestSha256()), "Unaccepted manifest bytes");
        JsonNode manifest = CanonicalIdentityJson.parse(manifestBytes);
        require(manifest.path("schemaVersion").asInt(-1) == 1
                && MIGRATION_ID.equals(text(manifest, "migrationId"))
                && NAMESPACE.equals(text(manifest, "uuidNamespace"))
                && accepted.baseCommit().equals(text(manifest, "baseCommit")), "Wrong identity proof contract/base");
        require("canonical-goal-source-bijection".equals(text(manifest, "proofType"))
                && "isolated-qa-candidate-projection".equals(text(manifest, "capability")), "Not a source-only proof A");
        for (String flag : List.of("runtimeActivationAllowed", "qaValidityClaimed"))
            require(manifest.has(flag) && manifest.get(flag).isBoolean() && !manifest.get(flag).booleanValue(),
                    "Source proof cannot claim runtime activation or QA validity");
        JsonNode claims = manifest.path("proof");
        require(claims.isObject() && claims.path("bijectiveRuleCount").asInt(-1) == 164
                && claims.path("globalExistingIdentityCollisionCount").asInt(-1) == 0
                && claims.path("unclassifiedInputHitCount").asInt(-1) == 0,
                "Missing or incomplete identity proof envelope");
        for (String flag : List.of("inverseDocumentEqualityVerified", "historicalInputBytesBound"))
            require(claims.has(flag) && claims.get(flag).isBoolean() && claims.get(flag).booleanValue(),
                    "Missing proof assertion: " + flag);
        for (String flag : List.of("cardAndAssetBytesRenamed"))
            require(claims.has(flag) && claims.get(flag).isBoolean() && !claims.get(flag).booleanValue(),
                    "Unsupported proof activation/asset change");
        Map<String, JsonNode> artifacts = new HashMap<>();
        Set<String> artifactPaths = new HashSet<>();
        for (String field : ARTIFACT_BINDINGS) {
            JsonNode binding = manifest.path(field);
            String path = path(text(binding, "path")), digest = text(binding, "sha256");
            require(artifactPaths.add(path) && digest.equals(accepted.trustedArtifactSha256().get(path)),
                    "Unaccepted " + field + " artifact");
            byte[] bytes = inputs.contractBytes(path);
            checkRaw(bytes, digest, field);
            if (!field.equals("verifier") && !field.equals("identityKernelBinding"))
                artifacts.put(field, CanonicalIdentityJson.parse(bytes));
        }
        IdentityProofSchemaValidator.validate(artifacts.get("schemaBinding"), manifest, "source proof");
        IdentityProofSchemaValidator.validate(artifacts.get("registrySchemaBinding"), artifacts.get("registry"), "reference registry");
        validateCanonicalProfile(artifacts.get("canonicalJsonProfile"));
        require(text(artifacts.get("schemaBinding"), "$id").equals(text(manifest, "$schema")), "Wrong proof schema binding");
        JsonNode exclusions = array(manifest, "derivedOutputExclusions");
        JsonNode declaredExclusions = artifacts.get("schemaBinding").path("properties").path("derivedOutputExclusions").path("const");
        require(declaredExclusions.isArray() && Arrays.equals(CanonicalIdentityJson.encode(exclusions),
                CanonicalIdentityJson.encode(declaredExclusions)), "Output exclusions differ from the exact accepted contract");
        Set<String> excludedPaths = new HashSet<>();
        for (JsonNode exclusion : exclusions) require(excludedPaths.add(path(text(exclusion, "path"))), "Duplicate output exclusion");
        JsonNode registry = artifacts.get("registry");
        require(MIGRATION_ID.equals(text(registry, "migrationId"))
                && NAMESPACE.equals(text(registry, "uuidNamespace")), "Foreign field registry");

        JsonNode ruleNodes = array(manifest, "rules");
        require(ruleNodes.size() == 164, "The bounded identity contract requires exactly 164 renames");
        List<GoalIdentityMap.Rename> renames = new ArrayList<>();
        Map<String, GoalIdentityMap.Rename> bySource = new HashMap<>();
        Set<String> ruleSourceFiles = new HashSet<>();
        for (JsonNode rule : ruleNodes) {
            var rename = new GoalIdentityMap.Rename(text(rule, "landscapeId"), text(rule, "sourceGoalId"), text(rule, "targetGoalId"));
            require("renamed".equals(text(rule, "relation")) && "copy-exact".equals(text(rule, "masteryPolicy"))
                    && "preserve-original-and-add-alias".equals(text(rule, "historyPolicy")), "Unsupported identity rule policy");
            require(GoalIdentityService.isUuid(rename.landscapeId()) && GoalIdentityService.isUuid(rename.targetGoalId()),
                    "Invalid rename owner/target");
            require(deriveTarget(rename.landscapeId(), rename.sourceGoalId()).equals(rename.targetGoalId()),
                    "Target differs from deterministic UUIDv5 derivation");
            require(bySource.putIfAbsent(rename.landscapeId() + ":" + rename.sourceGoalId(), rename) == null,
                    "Duplicate identity source rule");
            renames.add(rename); ruleSourceFiles.add(path(text(rule, "sourceFile")));
        }

        Map<String, JsonNode> documents = new LinkedHashMap<>();
        for (JsonNode document : array(manifest, "documents"))
            require(documents.putIfAbsent(path(text(document, "path")), document) == null, "Duplicate proof document");
        require(!documents.isEmpty(), "Missing inverse proof documents");
        require(documents.keySet().equals(inputs.proofDocumentPaths()), "Unknown or missing source proof inputs");
        require(Collections.disjoint(documents.keySet(), excludedPaths), "Derived output is incorrectly bound as a source input");
        Map<String, Set<String>> owners = new HashMap<>();
        Map<String, byte[]> projected = new LinkedHashMap<>();
        Map<String, List<OriginalReviewDefinition>> reviewDefinitions = new LinkedHashMap<>();
        Set<String> originalIds = new HashSet<>(), catalogPaths = new HashSet<>();
        Map<String, Integer> originalKeyOccurrences = new HashMap<>();
        Set<String> logicalGoalKeys = new HashSet<>(); int serializedGoals = 0;
        Set<String> noncanonicalGoalKeys = new HashSet<>();
        Map<String, JsonNode> originalRuleDocuments = new HashMap<>(), currentRuleDocuments = new HashMap<>();
        Map<String, JsonNode> originalCatalogDocuments = new LinkedHashMap<>();
        JsonNode catalog = manifest.path("catalog");
        require("all-runtime-shaped-curricula-excluding-quality".equals(text(catalog, "scope"))
                && catalog.path("fileCount").asInt(-1) == 593 && array(catalog, "sourceFiles").size() == 593,
                "Incomplete collision catalog");
        for (JsonNode source : array(catalog, "sourceFiles")) {
            String sourcePath = path(text(source, "path"));
            require(catalogPaths.add(sourcePath), "Duplicate catalog source");
            byte[] originalBytes = inputs.originalBytes(sourcePath);
            checkRaw(originalBytes, text(source, "sha256"), sourcePath);
            JsonNode original = CanonicalIdentityJson.parse(originalBytes);
            originalCatalogDocuments.put(sourcePath, original);
            String owner = text(source, "landscapeId");
            require(owner.equals(text(original, "landscapeId"))
                    && array(original, "goals").size() == source.path("goalCount").asInt(-1), "Catalog owner/count mismatch");
            for (JsonNode goal : array(original, "goals")) {
                String id = text(goal, "id");
                owners.computeIfAbsent(id, ignored -> new LinkedHashSet<>()).add(owner);
                originalIds.add(id.toLowerCase(Locale.ROOT));
                logicalGoalKeys.add(owner + ":" + id); serializedGoals++;
                originalKeyOccurrences.merge(owner + ":" + id, 1, Integer::sum);
                if (!GoalIdentityService.isUuid(id)) noncanonicalGoalKeys.add(owner + ":" + id);
            }
            byte[] currentBytes = inputs.currentBytes(sourcePath);
            require(currentBytes != null, "Missing current catalog source: " + sourcePath);
            projected.put(sourcePath, currentBytes.clone());
            if (!documents.containsKey(sourcePath)) require(Arrays.equals(originalBytes, currentBytes),
                    "Unproved semantic delta in an untouched catalog source: " + sourcePath);
            if (ruleSourceFiles.contains(sourcePath)) {
                originalRuleDocuments.put(sourcePath, original);
                currentRuleDocuments.put(sourcePath, CanonicalIdentityJson.parse(currentBytes));
            }
            JsonNode current = CanonicalIdentityJson.parse(currentBytes);
            require(array(current, "goals").size() == array(original, "goals").size(), "Goal count changed in source projection");
            for (int i = 0; i < original.path("goals").size(); i++) {
                JsonNode beforeGoal = original.path("goals").get(i), afterGoal = current.path("goals").get(i);
                String currentId = text(afterGoal, "id");
                var definition = new OriginalReviewDefinition(owner, currentId, text(beforeGoal, "id"), sourcePath,
                        CanonicalIdentityJson.sha256(originalBytes), CanonicalIdentityJson.digest(beforeGoal),
                        CanonicalIdentityJson.digest(afterGoal), CanonicalIdentityJson.encode(beforeGoal), CanonicalIdentityJson.encode(afterGoal));
                reviewDefinitions.computeIfAbsent(owner + ":" + GoalIdentityMap.goalUuidValueKey(currentId),
                        ignored -> new ArrayList<>()).add(definition);
            }
        }
        require(catalogPaths.containsAll(ruleSourceFiles), "Rule source absent from collision catalog");
        require(noncanonicalGoalKeys.equals(bySource.keySet()), "Rules do not cover exactly the noncanonical source identities");
        require(catalogPaths.equals(inputs.catalogSourcePaths()), "Unknown or missing catalog source inputs");
        require(Collections.disjoint(catalogPaths, excludedPaths), "Derived output is incorrectly in the source collision catalog");
        require(catalog.path("serializedGoals").asInt(-1) == serializedGoals
                && catalog.path("logicalGoalKeys").asInt(-1) == logicalGoalKeys.size(), "Stale catalog identity counts");

        Pattern oldIds = Pattern.compile(renames.stream().map(GoalIdentityMap.Rename::sourceGoalId)
                .distinct().sorted().map(Pattern::quote).collect(java.util.stream.Collectors.joining("|")));
        // The complete collision catalog is available even if a malicious
        // manifest omits a whole active document from its declared field list.
        for (var entry : originalCatalogDocuments.entrySet()) {
            ProjectionFields expected = projectionFields(entry.getValue(), "runtime-graph", registry,
                    bySource, owners, logicalGoalKeys, oldIds);
            require(documents.containsKey(entry.getKey()) || expected.fields().isEmpty() && expected.preserved().isEmpty(),
                    "Incomplete source projection: omitted active catalog document");
        }

        for (var entry : documents.entrySet()) {
            String documentPath = entry.getKey(); JsonNode document = entry.getValue();
            byte[] originalBytes = inputs.originalBytes(documentPath), currentBytes = inputs.currentBytes(documentPath);
            checkRaw(originalBytes, text(document, "sourceSha256"), documentPath);
            require(currentBytes != null, "Missing current identity document: " + documentPath);
            projected.put(documentPath, currentBytes.clone());
            String handling = text(document, "handling");
            String classification = text(document, "classification"), actualClass = activeClass(documentPath, catalogPaths);
            if (actualClass == null) {
                require(classification.equals("immutable-original") && handling.equals("preserve-exact-bytes")
                        && immutableInputAllowed(documentPath, registry, artifacts.get("schemaBinding")),
                        "Unknown or falsely immutable source input classification: " + documentPath);
                require(Arrays.equals(originalBytes, currentBytes), "Historical evidence/asset bytes changed: " + documentPath);
                continue;
            }
            require(classification.equals(actualClass) && handling.equals("explicit-pointer-projection"),
                    "Active source input cannot bypass complete projection by classification/handling: " + documentPath);
            JsonNode original = CanonicalIdentityJson.parse(originalBytes), current = CanonicalIdentityJson.parse(currentBytes);
            ProjectionFields expected = projectionFields(original, actualClass, registry, bySource, owners, logicalGoalKeys, oldIds);
            require(sameRows(array(document, "fields"), expected.fields())
                    && sameRows(document.path("preservedFields"), expected.preserved()),
                    "Incomplete source projection fields/preserved hits: " + documentPath);
            Set<String> matched = new HashSet<>(expected.matched());
            oldIds.matcher(documentPath).results().forEach(hit -> matched.add(hit.group()));
            require(stringSet(array(document, "matchedSourceGoalIds")).equals(matched), "Stale source projection hit inventory");
            checkCanonical(original, document, "beforeCanonicalSha256");
            checkCanonical(current, document, "hypotheticalCanonicalSha256");
            JsonNode forward = original.deepCopy(), inverse = current.deepCopy();
            Set<String> fieldsSeen = new HashSet<>(); List<JsonNode> fields = new ArrayList<>();
            for (JsonNode field : array(document, "fields")) {
                String pointer = text(field, "pointer"), kind = text(field, "kind"), role = text(field, "role");
                require(fieldsSeen.add(kind + ":" + pointer), "Duplicate identity pointer");
                require(fieldAllowed(registry, text(document, "classification"), pointer, role)
                        && (kind.equals("key") ? role.equals("reference-key") : kind.equals("value") && !role.equals("reference-key")),
                        "Pointer is not an approved identity/reference field");
                String before = text(field, "before"), after = text(field, "after"), owner = text(field, "landscapeId");
                if (role.equals("identity")) require(owner.equals(text(original, "landscapeId")),
                        "Identity pointer owner differs from its actual source document");
                int colon = before.indexOf(':');
                require(colon < 0 || colon > 0 && before.indexOf(':', colon + 1) < 0
                        && owner.equals(before.substring(0, colon)), "Wrong qualified proof field owner");
                String oldId = colon < 0 ? before : before.substring(colon + 1);
                var rename = bySource.get(owner + ":" + oldId);
                require(rename != null && after.equals((colon < 0 ? "" : owner + ":") + rename.targetGoalId()),
                        "Pointer endpoint is not a declared bijection");
                setField(forward, field, false); fields.add(field);
            }
            require(Arrays.equals(CanonicalIdentityJson.encode(forward), CanonicalIdentityJson.encode(current)),
                    "Current document contains changes beyond the declared identity fields");
            for (int i = fields.size() - 1; i >= 0; i--) setField(inverse, fields.get(i), true);
            require(Arrays.equals(CanonicalIdentityJson.encode(original), CanonicalIdentityJson.encode(inverse)),
                    "Inverse rename changed semantic payload");
            checkCanonical(inverse, document, "inverseCanonicalSha256");
        }
        for (JsonNode rule : ruleNodes) {
            String sourcePath = text(rule, "sourceFile"), pointer = text(rule, "sourcePointer");
            require(pointer.matches("/goals/(0|[1-9][0-9]*)"), "Invalid rule goal pointer");
            JsonNode original = originalRuleDocuments.get(sourcePath).at(pointer), current = currentRuleDocuments.get(sourcePath).at(pointer);
            require(text(rule, "landscapeId").equals(text(originalRuleDocuments.get(sourcePath), "landscapeId"))
                    && originalKeyOccurrences.getOrDefault(text(rule, "landscapeId") + ":" + text(rule, "sourceGoalId"), 0) == 1,
                    "Rule owner/source occurrence is not bound to one actual original definition");
            require(text(rule, "sourceGoalId").equals(text(original, "id"))
                    && text(rule, "targetGoalId").equals(text(current, "id")), "Rule is not bound to the actual goal identity");
            String beforeDigest = CanonicalIdentityJson.digest(original);
            require(beforeDigest.equals(text(rule, "beforeGoalSha256"))
                    && beforeDigest.equals(text(rule, "inverseGoalSha256"))
                    && beforeDigest.equals(text(rule, "semanticPayloadSha256"))
                    && CanonicalIdentityJson.digest(current).equals(text(rule, "hypotheticalGoalSha256")),
                    "Stale rule goal/semantic hashes");
            owners.computeIfAbsent(text(rule, "targetGoalId"), ignored -> new LinkedHashSet<>()).add(text(rule, "landscapeId"));
        }
        ObjectNode projection = com.fasterxml.jackson.databind.node.JsonNodeFactory.instance.objectNode();
        projection.set("catalog", catalog.get("sourceFiles")); projection.set("rules", ruleNodes);
        projection.set("documents", manifest.get("documents"));
        require(CanonicalIdentityJson.digest(projection).equals(text(claims, "sourceProjectionSha256")), "Stale source projection digest");
        SourceIdentityProof proof = new SourceIdentityProof(accepted.manifestSha256(), CanonicalIdentityJson.digest(projection),
                accepted.snapshot(), renames, owners, originalIds,
                projected, reviewDefinitions);
        // Bijection/collision/chain checks are shared with the immutable translator.
        proof.identities();
        return proof;
    }

    private record StringField(String pointer, String value, boolean key) { }
    private record ProjectionFields(List<JsonNode> fields, List<JsonNode> preserved, Set<String> matched) { }

    /** Reconstruct the pinned registry's exact transformation; declared pointers are not authority. */
    private static ProjectionFields projectionFields(JsonNode original, String classification, JsonNode registry,
            Map<String, GoalIdentityMap.Rename> renamed, Map<String, Set<String>> owners, Set<String> keys, Pattern oldIds) {
        List<StringField> strings = new ArrayList<>(); stringFields(original, "", strings);
        List<JsonNode> expected = new ArrayList<>(), preserved = new ArrayList<>(); Set<String> matched = new HashSet<>();
        for (StringField field : strings) {
            Set<String> hits = new java.util.TreeSet<>(); oldIds.matcher(field.value()).results().forEach(hit -> hits.add(hit.group()));
            if (hits.isEmpty()) continue;
            List<JsonNode> active = new ArrayList<>(), keep = new ArrayList<>();
            for (JsonNode declaration : array(registry, "activeFields"))
                if (classification.equals(text(declaration, "class"))
                        && matches(parts(text(declaration, "pointer")), 0, parts(field.pointer()), 0)
                        && text(declaration, "role").equals("reference-key") == field.key()) active.add(declaration);
            for (JsonNode declaration : array(registry, "preservedActiveFields"))
                if (classification.equals(text(declaration, "class"))
                        && matches(parts(text(declaration, "pointer")), 0, parts(field.pointer()), 0)) keep.add(declaration);
            if (active.isEmpty() && !keep.isEmpty()) {
                ObjectNode row = com.fasterxml.jackson.databind.node.JsonNodeFactory.instance.objectNode()
                        .put("pointer", field.pointer()).put("kind", field.key() ? "key" : "value")
                        .put("reason", text(keep.getFirst(), "reason"));
                ArrayNode ids = row.putArray("matchedSourceGoalIds"); hits.forEach(ids::add);
                preserved.add(row); matched.addAll(hits); continue;
            }
            require(active.size() == 1, "Unclassified or overlapping active identity hit in source projection: " + field.pointer());
            String role = text(active.getFirst(), "role"), nearest = nearestOwner(original, field.pointer(), registry);
            String owner;
            if (role.equals("identity")) {
                require(nearest != null && keys.contains(nearest + ":" + field.value()), "Identity owner mismatch in source projection");
                owner = nearest;
            } else {
                owner = referenceOwner(field.value(), nearest, owners);
                if (Set.of("mapping", "provenance-registry", "qa-scope-config").contains(classification) && nearest != null)
                    require(owner.equals(nearest), "Endpoint conflicts with declared source owner");
            }
            int colon = field.value().indexOf(':'); String old = colon < 0 ? field.value() : field.value().substring(colon + 1);
            var rule = renamed.get(owner + ":" + old);
            require(rule != null, "Declared source projection hit is not an exact migration endpoint");
            ObjectNode row = com.fasterxml.jackson.databind.node.JsonNodeFactory.instance.objectNode()
                    .put("pointer", field.pointer()).put("kind", field.key() ? "key" : "value").put("role", role)
                    .put("landscapeId", owner).put("before", field.value())
                    .put("after", (colon < 0 ? "" : owner + ":") + rule.targetGoalId());
            expected.add(row); matched.add(old);
        }
        return new ProjectionFields(expected, preserved, matched);
    }

    private static void stringFields(JsonNode node, String pointer, List<StringField> result) {
        if (node.isObject()) {
            node.fields().forEachRemaining(entry -> {
                String next = pointer + "/" + entry.getKey().replace("~", "~0").replace("/", "~1");
                result.add(new StringField(next, entry.getKey(), true)); stringFields(entry.getValue(), next, result);
            });
        } else if (node.isArray()) {
            for (int i = 0; i < node.size(); i++) stringFields(node.get(i), pointer + "/" + i, result);
        } else if (node.isTextual()) result.add(new StringField(pointer, node.textValue(), false));
    }

    private static String nearestOwner(JsonNode document, String pointer, JsonNode registry) {
        JsonNode cursor = document; String found = ownerAt(cursor, registry);
        List<String> tokens = parts(pointer);
        for (int i = 0; i < tokens.size() - 1; i++) {
            cursor = child(cursor, tokens.get(i)); String candidate = ownerAt(cursor, registry);
            if (candidate != null) found = candidate;
        }
        return found;
    }
    private static String ownerAt(JsonNode node, JsonNode registry) {
        if (node.isObject()) for (JsonNode field : array(registry, "ownerFields")) {
            JsonNode owner = node.get(field.textValue()); if (owner != null && owner.isTextual()) return owner.textValue();
        }
        return null;
    }
    private static String referenceOwner(String value, String localOwner, Map<String, Set<String>> owners) {
        int colon = value.indexOf(':'); String id = value;
        if (colon >= 0) {
            require(colon > 0 && colon < value.length() - 1 && value.indexOf(':', colon + 1) < 0,
                    "Malformed qualified source projection endpoint");
            String owner = value.substring(0, colon); id = value.substring(colon + 1);
            require(owners.getOrDefault(id, Set.of()).contains(owner), "Dangling exact qualified source projection endpoint");
            return owner;
        }
        Set<String> candidates = owners.getOrDefault(id, Set.of());
        if (localOwner != null) {
            if (candidates.contains(localOwner)) return localOwner;
            require(owners.values().stream().anyMatch(values -> values.contains(localOwner)), "Unknown explicit source projection owner");
        }
        require(candidates.size() == 1, "Dangling or ambiguous source projection endpoint"); return candidates.iterator().next();
    }
    private static boolean sameRows(JsonNode declared, List<JsonNode> expected) {
        if (declared.isMissingNode()) return expected.isEmpty();
        if (!declared.isArray() || declared.size() != expected.size()) return false;
        Set<String> actual = new HashSet<>(), wanted = new HashSet<>();
        declared.forEach(row -> actual.add(CanonicalIdentityJson.digest(row)));
        expected.forEach(row -> wanted.add(CanonicalIdentityJson.digest(row)));
        return actual.size() == declared.size() && actual.equals(wanted);
    }
    private static Set<String> stringSet(JsonNode array) {
        Set<String> result = new HashSet<>(); for (JsonNode value : array) {
            require(value.isTextual() && result.add(value.textValue()), "Invalid/duplicate identity hit inventory");
        }
        return result;
    }
    private static String activeClass(String path, Set<String> catalogPaths) {
        if (catalogPaths.contains(path)) return "runtime-graph";
        if (path.startsWith("curricula/DE/Gymnasium/composition-views/") || path.startsWith("app/scripts/config/goal-books/navigation/"))
            return "composition";
        if (path.startsWith("curricula/DE/Gymnasium/mapping/")) return "mapping";
        if (path.equals("curricula/DE/Gymnasium/provenance/canonical-goal-provenance-registry.json")) return "provenance-registry";
        if (path.equals("app/scripts/config/math-duration-split-spanning-tree-policy.json")) return "duration-policy";
        if (path.matches("curricula/DE/Gymnasium/quality/(semantic-atomicity|memory-card-review)/[^/]+\\.config\\.json"))
            return "qa-scope-config";
        return null;
    }
    private static boolean immutableInputAllowed(String path, JsonNode registry, JsonNode sourceSchema) {
        for (JsonNode row : array(registry, "immutableExactDocuments")) if (path.equals(text(row, "path"))) return true;
        for (JsonNode row : array(registry, "immutableDocumentRules")) if (path.startsWith(text(row, "prefix"))) return true;
        JsonNode additional = sourceSchema.path("$defs").path("sourceInputClassifications").path("const");
        if (additional.isArray()) for (JsonNode row : additional)
            if (path.equals(text(row, "path")) && "immutable-original".equals(text(row, "classification"))
                    && "preserve-exact-bytes".equals(text(row, "handling"))) return true;
        return false;
    }

    private static boolean fieldAllowed(JsonNode registry, String classification, String pointer, String role) {
        for (JsonNode field : array(registry, "activeFields"))
            if (classification.equals(text(field, "class")) && role.equals(text(field, "role"))
                    && matches(parts(text(field, "pointer")), 0, parts(pointer), 0)) return true;
        return false;
    }
    private static boolean matches(List<String> pattern, int p, List<String> tokens, int t) {
        if (p == pattern.size()) return t == tokens.size();
        if (pattern.get(p).equals("**")) return matches(pattern, p + 1, tokens, t)
                || t < tokens.size() && matches(pattern, p, tokens, t + 1);
        return t < tokens.size() && (pattern.get(p).equals("*") || pattern.get(p).equals(tokens.get(t)))
                && matches(pattern, p + 1, tokens, t + 1);
    }
    private static List<String> parts(String pointer) {
        require(pointer.startsWith("/") && !pointer.matches(".*~(?![01]).*"), "Invalid identity JSON pointer");
        return Arrays.stream(pointer.substring(1).split("/", -1)).map(x -> x.replace("~1", "/").replace("~0", "~")).toList();
    }
    private static void setField(JsonNode document, JsonNode field, boolean inverse) {
        List<String> tokens = parts(text(field, "pointer")); JsonNode parent = document;
        for (int i = 0; i < tokens.size() - 1; i++) parent = child(parent, tokens.get(i));
        String before = text(field, inverse ? "after" : "before"), after = text(field, inverse ? "before" : "after");
        String token = tokens.getLast();
        if (text(field, "kind").equals("key")) {
            require(parent.isObject() && parent.has(before) && !parent.has(after), "Key rename collision/missing origin");
            require(inverse || token.equals(before), "Key pointer differs from its declared origin");
            ObjectNode object = (ObjectNode) parent; JsonNode value = object.remove(before); object.set(after, value);
        } else {
            JsonNode value = child(parent, token);
            require(value.isTextual() && before.equals(value.textValue()), "Identity field endpoint changed");
            if (parent.isArray()) ((ArrayNode) parent).set(index(token), new com.fasterxml.jackson.databind.node.TextNode(after));
            else ((ObjectNode) parent).put(token, after);
        }
    }
    private static JsonNode child(JsonNode node, String token) {
        JsonNode value = node.isArray() ? node.get(index(token)) : node.isObject() ? node.get(token) : null;
        require(value != null, "Missing proof pointer parent/value"); return value;
    }
    private static int index(String token) {
        require(token.matches("0|[1-9][0-9]*"), "Invalid array pointer index");
        try { return Integer.parseInt(token); } catch (NumberFormatException invalid) { throw new GoalIdentityException("Invalid pointer index"); }
    }
    private static void validateCanonicalProfile(JsonNode profile) {
        require("skillpilot-canonical-json-decimal-v1".equals(text(profile, "id"))
                && array(profile, "vectors").size() >= 3, "Unsupported canonical JSON profile");
        for (JsonNode vector : array(profile, "vectors")) {
            byte[] actual = CanonicalIdentityJson.encode(CanonicalIdentityJson.parse(text(vector, "inputJson").getBytes(java.nio.charset.StandardCharsets.UTF_8)));
            require(new String(actual, java.nio.charset.StandardCharsets.UTF_8).equals(text(vector, "canonicalJson"))
                    && CanonicalIdentityJson.sha256(actual).equals(text(vector, "sha256")), "Canonical JSON profile mismatch");
        }
    }
    static String deriveTarget(String owner, String oldId) {
        UUID namespace = UUID.fromString(NAMESPACE); ByteBuffer bytes = ByteBuffer.allocate(16);
        bytes.putLong(namespace.getMostSignificantBits()).putLong(namespace.getLeastSignificantBits());
        var name = com.fasterxml.jackson.databind.node.JsonNodeFactory.instance.arrayNode().add(MIGRATION_ID).add(owner).add(oldId);
        try {
            MessageDigest sha1 = MessageDigest.getInstance("SHA-1"); sha1.update(bytes.array());
            byte[] digest = sha1.digest(CanonicalIdentityJson.encode(name)); digest[6] = (byte) ((digest[6] & 15) | 0x50);
            digest[8] = (byte) ((digest[8] & 63) | 0x80); ByteBuffer id = ByteBuffer.wrap(digest);
            return new UUID(id.getLong(), id.getLong()).toString();
        } catch (java.security.NoSuchAlgorithmException impossible) { throw new IllegalStateException(impossible); }
    }
    private static JsonNode array(JsonNode node, String name) {
        JsonNode value = node.get(name); require(value != null && value.isArray(), "Missing proof array: " + name); return value;
    }
    private static String text(JsonNode node, String name) {
        JsonNode value = node.get(name); require(value != null && value.isTextual() && !value.textValue().isBlank(), "Missing proof string: " + name);
        return value.textValue();
    }
    private static String path(String path) {
        require(!path.startsWith("/") && !path.contains("\\") && Arrays.stream(path.split("/", -1))
                .noneMatch(token -> token.isEmpty() || token.equals(".") || token.equals("..")), "Unsafe proof artifact path"); return path;
    }
    private static void checkRaw(byte[] bytes, String expected, String label) {
        require(bytes != null && GoalIdentityService.isSha(expected) && CanonicalIdentityJson.sha256(bytes).equals(expected),
                "Missing/stale bound bytes: " + label);
    }
    private static void checkCanonical(JsonNode node, JsonNode binding, String field) {
        require(CanonicalIdentityJson.digest(node).equals(text(binding, field)), "Stale canonical proof digest: " + field);
    }
}
