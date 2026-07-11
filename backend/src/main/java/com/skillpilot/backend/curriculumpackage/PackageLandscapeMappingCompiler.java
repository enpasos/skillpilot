package com.skillpilot.backend.curriculumpackage;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.landscape.ResolvedGoalMapping;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

/** Compiles the closed mapping and official-source JSON artifacts without filesystem access. */
public final class PackageLandscapeMappingCompiler {

    private static final String MAPPING_SCHEMA =
            "https://skillpilot.com/schemas/curriculum-package/v1/source-to-canonical-mappings.schema.json";
    private static final String SOURCE_INDEX_SCHEMA =
            "https://skillpilot.com/schemas/curriculum-package/v1/official-source-index.schema.json";
    private static final String FORMAT_VERSION = "1.0";
    private static final Pattern STABLE_ID = Pattern.compile("^[A-Za-z0-9][A-Za-z0-9._:+-]*$");
    private static final Pattern JURISDICTION = Pattern.compile("^DE-[A-Z]{2}$");
    private static final Set<String> STAGES = Set.of("SekI", "SekII", "SekI+SekII");
    private static final Set<String> MATCH_TYPES = Set.of("exact", "partial");
    private static final Set<String> SEMANTIC_TYPES = Set.of("curriculum", "supplemental-source");

    private final ObjectMapper objectMapper;

    public PackageLandscapeMappingCompiler(ObjectMapper objectMapper) {
        if (objectMapper == null) {
            throw failure("ObjectMapper must not be null");
        }
        this.objectMapper = CurriculumPackageJson.strictCopy(objectMapper);
    }

    /**
     * Compiles one package's two mapping artifacts.
     *
     * @param rootLandscapeId the single canonical root declared by the release
     * @param targetLandscapeIds every landscape owned or embedded by the package
     * @param canonicalGoalIds every valid canonical target goal in the loaded landscape closure
     */
    public PackageLandscapeMappingState compile(
            String packageId,
            byte[] mappingJson,
            byte[] sourceIndexJson,
            String rootLandscapeId,
            Set<String> targetLandscapeIds,
            Set<String> canonicalGoalIds) {
        requireStableId(packageId, "packageId");
        requireStableId(rootLandscapeId, "rootLandscapeId");
        Set<String> validLandscapeIds = immutableValidatedIds(targetLandscapeIds, "targetLandscapeIds");
        Set<String> validCanonicalGoalIds = immutableValidatedIds(canonicalGoalIds, "canonicalGoalIds");
        if (!validLandscapeIds.contains(rootLandscapeId)) {
            throw failure("rootLandscapeId is not present in targetLandscapeIds: " + rootLandscapeId);
        }

        JsonNode sourceRoot = parse(sourceIndexJson, "official source index");
        SourceIndex sourceIndex = parseSourceIndex(sourceRoot, rootLandscapeId);
        JsonNode mappingRoot = parse(mappingJson, "source-to-canonical mappings");
        return compileMappings(
                packageId,
                mappingRoot,
                sourceIndex,
                rootLandscapeId,
                validLandscapeIds,
                validCanonicalGoalIds);
    }

    private PackageLandscapeMappingState compileMappings(
            String packageId,
            JsonNode root,
            SourceIndex sourceIndex,
            String rootLandscapeId,
            Set<String> validLandscapeIds,
            Set<String> validCanonicalGoalIds) {
        requireObject(root, "source-to-canonical mappings");
        requireFields(
                root,
                Set.of(
                        "$schema",
                        "mappingFormatVersion",
                        "targetLandscapeId",
                        "mappingCollectionCount",
                        "decisionCount",
                        "mappingEdgeCount",
                        "collections"),
                "source-to-canonical mappings");
        requireExactText(root, "$schema", MAPPING_SCHEMA, "source-to-canonical mappings");
        requireExactText(root, "mappingFormatVersion", FORMAT_VERSION, "source-to-canonical mappings");
        String targetLandscapeId = requireStableId(root, "targetLandscapeId", "source-to-canonical mappings");
        validateTargetLandscape(targetLandscapeId, rootLandscapeId, validLandscapeIds, "mapping artifact");
        if (!sourceIndex.targetLandscapeId().equals(targetLandscapeId)) {
            throw failure("Mapping and source-index targetLandscapeId differ");
        }

        int declaredCollectionCount = requireInteger(root, "mappingCollectionCount", 1, 1_000,
                "source-to-canonical mappings");
        int declaredDecisionCount = requireInteger(root, "decisionCount", 1, 1_000_000,
                "source-to-canonical mappings");
        int declaredEdgeCount = requireInteger(root, "mappingEdgeCount", 1, 10_000_000,
                "source-to-canonical mappings");
        JsonNode collections = requireArray(root, "collections", 1, 1_000, "source-to-canonical mappings");
        requireCount(declaredCollectionCount, collections.size(), "mappingCollectionCount");

        List<ResolvedGoalMapping> mappings = new ArrayList<>(declaredEdgeCount);
        Map<String, List<ResolvedGoalMapping>> mappingsBySourceGoalId = new LinkedHashMap<>();
        Map<String, String> sourceLandscapeBySourceGoalId = new LinkedHashMap<>();
        Map<String, PackageLandscapeMappingState.CollectionProvenance> provenanceByMappingId =
                new LinkedHashMap<>();
        Map<String, PackageLandscapeMappingState.CollectionProvenance> provenanceBySourceId =
                new LinkedHashMap<>();
        Set<MappingPair> mappingPairs = new HashSet<>();
        Set<String> consumedSourceCollectionIds = new HashSet<>();
        int actualDecisionCount = 0;
        int actualEdgeCount = 0;

        for (int collectionIndex = 0; collectionIndex < collections.size(); collectionIndex++) {
            JsonNode collection = collections.get(collectionIndex);
            String context = "mapping collections[" + collectionIndex + "]";
            requireObject(collection, context);
            requireFields(
                    collection,
                    Set.of(
                            "mappingCollectionId",
                            "sourceCollectionId",
                            "sourceLandscapeId",
                            "targetLandscapeId",
                            "jurisdiction",
                            "subject",
                            "stage",
                            "inputDecisionCount",
                            "mappingEdgeCount",
                            "edges"),
                    context);
            String mappingCollectionId = requireStableId(collection, "mappingCollectionId", context);
            String sourceCollectionId = requireStableId(collection, "sourceCollectionId", context);
            String sourceLandscapeId = requireStableId(collection, "sourceLandscapeId", context);
            String collectionTargetId = requireStableId(collection, "targetLandscapeId", context);
            validateTargetLandscape(collectionTargetId, rootLandscapeId, validLandscapeIds, context);
            String jurisdiction = requireMatchingText(collection, "jurisdiction", JURISDICTION, 5, context);
            String subject = requireNonBlankText(collection, "subject", 20_000, context);
            String stage = requireEnumText(collection, "stage", STAGES, context);
            int inputDecisionCount = requireInteger(collection, "inputDecisionCount", 1, 1_000_000, context);
            int mappingEdgeCount = requireInteger(collection, "mappingEdgeCount", 1, 10_000_000, context);
            JsonNode edges = requireArray(collection, "edges", 1, 10_000_000, context);
            requireCount(mappingEdgeCount, edges.size(), context + ".mappingEdgeCount");

            SourceCollection sourceCollection = sourceIndex.collectionsById().get(sourceCollectionId);
            if (sourceCollection == null) {
                throw failure(context + " references unknown sourceCollectionId: " + sourceCollectionId);
            }
            if (!consumedSourceCollectionIds.add(sourceCollectionId)) {
                throw failure("sourceCollectionId is joined by more than one mapping collection: "
                        + sourceCollectionId);
            }
            requireEqual(sourceCollection.sourceLandscapeId(), sourceLandscapeId,
                    context + ".sourceLandscapeId differs from authoritative source index");
            requireEqual(sourceCollection.jurisdiction(), jurisdiction,
                    context + ".jurisdiction differs from authoritative source index");
            requireEqual(sourceCollection.subject(), subject,
                    context + ".subject differs from authoritative source index");
            requireEqual(sourceCollection.stage(), stage,
                    context + ".stage differs from authoritative source index");

            String sourceFile = "package:" + packageId + "/data/mappings/source-to-canonical.json#"
                    + mappingCollectionId;
            for (int edgeIndex = 0; edgeIndex < edges.size(); edgeIndex++) {
                JsonNode edge = edges.get(edgeIndex);
                String edgeContext = context + ".edges[" + edgeIndex + "]";
                requireObject(edge, edgeContext);
                requireFields(edge, Set.of("sourceGoalId", "canonicalGoalId", "matchType"), edgeContext);
                String sourceGoalId = requireStableId(edge, "sourceGoalId", edgeContext);
                String canonicalGoalId = requireStableId(edge, "canonicalGoalId", edgeContext);
                String matchType = requireEnumText(edge, "matchType", MATCH_TYPES, edgeContext);
                if (!validCanonicalGoalIds.contains(canonicalGoalId)) {
                    throw failure(edgeContext + " references unknown canonicalGoalId: " + canonicalGoalId);
                }

                String priorOwner = sourceLandscapeBySourceGoalId.putIfAbsent(sourceGoalId, sourceLandscapeId);
                if (priorOwner != null && !priorOwner.equals(sourceLandscapeId)) {
                    throw failure("sourceGoalId belongs to multiple source landscapes: " + sourceGoalId);
                }
                MappingPair pair = new MappingPair(sourceGoalId, canonicalGoalId);
                if (!mappingPairs.add(pair)) {
                    String existingType = mappingsBySourceGoalId.get(sourceGoalId).stream()
                            .filter(existing -> existing.canonicalGoalId().equals(canonicalGoalId))
                            .findFirst()
                            .map(ResolvedGoalMapping::matchType)
                            .orElse("unknown");
                    if (existingType.equals(matchType)) {
                        throw failure("Duplicate source-to-canonical mapping edge: "
                                + sourceGoalId + " -> " + canonicalGoalId);
                    }
                    throw failure("Conflicting matchType for source-to-canonical mapping edge: "
                            + sourceGoalId + " -> " + canonicalGoalId);
                }

                ResolvedGoalMapping mapping = new ResolvedGoalMapping(
                        sourceLandscapeId,
                        targetLandscapeId,
                        sourceGoalId,
                        canonicalGoalId,
                        matchType,
                        sourceFile);
                mappings.add(mapping);
                mappingsBySourceGoalId.computeIfAbsent(sourceGoalId, ignored -> new ArrayList<>()).add(mapping);
            }

            PackageLandscapeMappingState.CollectionProvenance provenance =
                    new PackageLandscapeMappingState.CollectionProvenance(
                            mappingCollectionId,
                            sourceCollectionId,
                            sourceLandscapeId,
                            targetLandscapeId,
                            sourceCollection.jurisdiction(),
                            sourceCollection.subject(),
                            sourceCollection.stage(),
                            sourceCollection.durationModels(),
                            sourceCollection.documents(),
                            inputDecisionCount,
                            mappingEdgeCount,
                            sourceFile);
            putUnique(provenanceByMappingId, mappingCollectionId, provenance, "mappingCollectionId");
            putUnique(provenanceBySourceId, sourceCollectionId, provenance, "sourceCollectionId");
            actualDecisionCount = addExact(actualDecisionCount, inputDecisionCount, "decisionCount");
            actualEdgeCount = addExact(actualEdgeCount, mappingEdgeCount, "mappingEdgeCount");
        }

        if (!consumedSourceCollectionIds.equals(sourceIndex.collectionsById().keySet())) {
            Set<String> missing = new LinkedHashSet<>(sourceIndex.collectionsById().keySet());
            missing.removeAll(consumedSourceCollectionIds);
            throw failure("Official source collections without a 1:1 mapping collection: " + missing);
        }
        requireCount(declaredDecisionCount, actualDecisionCount, "decisionCount");
        requireCount(declaredEdgeCount, actualEdgeCount, "mappingEdgeCount");
        requireCount(declaredEdgeCount, mappings.size(), "ordered mapping edge count");

        return new PackageLandscapeMappingState(
                packageId,
                targetLandscapeId,
                mappings,
                mappingsBySourceGoalId,
                sourceIndex.sourceLandscapesById(),
                sourceLandscapeBySourceGoalId,
                provenanceByMappingId,
                provenanceBySourceId,
                declaredDecisionCount,
                sourceIndex.documentCount());
    }

    private SourceIndex parseSourceIndex(JsonNode root, String rootLandscapeId) {
        requireObject(root, "official source index");
        requireFields(
                root,
                Set.of(
                        "$schema",
                        "sourceIndexFormatVersion",
                        "targetLandscapeId",
                        "sourceCollectionCount",
                        "sourceDocumentCount",
                        "collections"),
                "official source index");
        requireExactText(root, "$schema", SOURCE_INDEX_SCHEMA, "official source index");
        requireExactText(root, "sourceIndexFormatVersion", FORMAT_VERSION, "official source index");
        String targetLandscapeId = requireStableId(root, "targetLandscapeId", "official source index");
        if (!targetLandscapeId.equals(rootLandscapeId)) {
            throw failure("Official source index targetLandscapeId does not equal rootLandscapeId: "
                    + targetLandscapeId);
        }
        int declaredCollectionCount = requireInteger(root, "sourceCollectionCount", 1, 1_000,
                "official source index");
        int declaredDocumentCount = requireInteger(root, "sourceDocumentCount", 1, 10_000,
                "official source index");
        JsonNode collections = requireArray(root, "collections", 1, 1_000, "official source index");
        requireCount(declaredCollectionCount, collections.size(), "sourceCollectionCount");

        Map<String, SourceCollection> collectionsById = new LinkedHashMap<>();
        Map<String, MutableSourceLandscapeMetadata> mutableLandscapes = new LinkedHashMap<>();
        Set<String> sourceDocumentIds = new HashSet<>();
        int actualDocumentCount = 0;
        for (int collectionIndex = 0; collectionIndex < collections.size(); collectionIndex++) {
            JsonNode collection = collections.get(collectionIndex);
            String context = "source collections[" + collectionIndex + "]";
            requireObject(collection, context);
            requireFields(
                    collection,
                    Set.of(
                            "sourceCollectionId",
                            "sourceLandscapeId",
                            "jurisdiction",
                            "subject",
                            "stage",
                            "durationModels",
                            "documentCount",
                            "documents"),
                    Set.of("durationModels"),
                    context);
            String sourceCollectionId = requireStableId(collection, "sourceCollectionId", context);
            String sourceLandscapeId = requireStableId(collection, "sourceLandscapeId", context);
            String jurisdiction = requireMatchingText(collection, "jurisdiction", JURISDICTION, 5, context);
            String subject = requireNonBlankText(collection, "subject", 4_000, context);
            String stage = requireEnumText(collection, "stage", STAGES, context);
            List<String> durationModels = collection.has("durationModels")
                    ? requireUniqueStableIdList(collection, "durationModels", 1, 32, context)
                    : List.of();
            int documentCount = requireInteger(collection, "documentCount", 1, 1_000, context);
            JsonNode documentsNode = requireArray(collection, "documents", 1, 1_000, context);
            requireCount(documentCount, documentsNode.size(), context + ".documentCount");
            List<PackageLandscapeMappingState.SourceDocument> documents = new ArrayList<>(documentCount);
            for (int documentIndex = 0; documentIndex < documentsNode.size(); documentIndex++) {
                String documentContext = context + ".documents[" + documentIndex + "]";
                PackageLandscapeMappingState.SourceDocument document =
                        parseSourceDocument(documentsNode.get(documentIndex), documentContext);
                if (!sourceDocumentIds.add(document.sourceDocumentId())) {
                    throw failure("Duplicate sourceDocumentId: " + document.sourceDocumentId());
                }
                documents.add(document);
            }
            SourceCollection sourceCollection = new SourceCollection(
                    sourceCollectionId,
                    sourceLandscapeId,
                    jurisdiction,
                    subject,
                    stage,
                    durationModels,
                    documents);
            putUnique(collectionsById, sourceCollectionId, sourceCollection, "sourceCollectionId");
            mutableLandscapes.compute(sourceLandscapeId, (ignored, current) -> {
                if (current == null) {
                    return new MutableSourceLandscapeMetadata(
                            sourceLandscapeId, jurisdiction, subject, stage, sourceCollectionId);
                }
                current.addCollection(sourceCollectionId, jurisdiction, subject, stage);
                return current;
            });
            actualDocumentCount = addExact(actualDocumentCount, documentCount, "sourceDocumentCount");
        }
        requireCount(declaredDocumentCount, actualDocumentCount, "sourceDocumentCount");
        Map<String, PackageLandscapeMappingState.SourceLandscapeMetadata> landscapes = new LinkedHashMap<>();
        mutableLandscapes.forEach((id, value) -> landscapes.put(id, value.toImmutable()));
        return new SourceIndex(
                targetLandscapeId,
                Collections.unmodifiableMap(collectionsById),
                Collections.unmodifiableMap(landscapes),
                declaredDocumentCount);
    }

    private PackageLandscapeMappingState.SourceDocument parseSourceDocument(JsonNode node, String context) {
        requireObject(node, context);
        requireFields(
                node,
                Set.of(
                        "sourceDocumentId",
                        "sourceKey",
                        "title",
                        "role",
                        "semanticType",
                        "official",
                        "url",
                        "landingUrl",
                        "durationModel"),
                Set.of("landingUrl", "durationModel"),
                context);
        String sourceDocumentId = requireStableId(node, "sourceDocumentId", context);
        String sourceKey = requireStableId(node, "sourceKey", context);
        String title = requireNonBlankText(node, "title", 4_000, context);
        String role = requireStableId(node, "role", context);
        String semanticType = requireEnumText(node, "semanticType", SEMANTIC_TYPES, context);
        JsonNode official = required(node, "official", context);
        if (!official.isBoolean() || !official.booleanValue()) {
            throw failure(context + ".official must be true");
        }
        String url = requireOfficialUrl(node, "url", context);
        String landingUrl = node.has("landingUrl") ? requireOfficialUrl(node, "landingUrl", context) : null;
        String durationModel = node.has("durationModel")
                ? requireStableId(node, "durationModel", context)
                : null;
        return new PackageLandscapeMappingState.SourceDocument(
                sourceDocumentId,
                sourceKey,
                title,
                role,
                semanticType,
                true,
                url,
                landingUrl,
                durationModel);
    }

    private JsonNode parse(byte[] bytes, String context) {
        if (bytes == null || bytes.length == 0) {
            throw failure(context + " is empty");
        }
        try {
            JsonNode root = objectMapper.readTree(bytes);
            if (root == null) {
                throw failure(context + " is empty");
            }
            CurriculumPackageJson.validateTree(root, context);
            return root;
        } catch (IOException e) {
            throw new CurriculumPackageException("Failed to parse " + context, e);
        }
    }

    private static void validateTargetLandscape(
            String actual,
            String rootLandscapeId,
            Set<String> validLandscapeIds,
            String context) {
        if (!validLandscapeIds.contains(actual)) {
            throw failure(context + " references unknown targetLandscapeId: " + actual);
        }
        if (!rootLandscapeId.equals(actual)) {
            throw failure(context + " targetLandscapeId does not equal rootLandscapeId: " + actual);
        }
    }

    private static Set<String> immutableValidatedIds(Set<String> ids, String context) {
        if (ids == null || ids.isEmpty()) {
            throw failure(context + " must not be empty");
        }
        Set<String> copy = new LinkedHashSet<>();
        for (String id : ids) {
            requireStableId(id, context + " entry");
            if (!copy.add(id)) {
                throw failure(context + " contains a duplicate: " + id);
            }
        }
        return Collections.unmodifiableSet(copy);
    }

    private static void requireFields(JsonNode node, Set<String> required, String context) {
        requireFields(node, required, Set.of(), context);
    }

    private static void requireFields(JsonNode node, Set<String> allowed, Set<String> optional, String context) {
        Iterator<String> names = node.fieldNames();
        while (names.hasNext()) {
            String name = names.next();
            if (!allowed.contains(name)) {
                throw failure(context + " contains unknown field: " + name);
            }
        }
        for (String name : allowed) {
            if (!optional.contains(name) && !node.has(name)) {
                throw failure(context + " is missing field: " + name);
            }
        }
    }

    private static JsonNode required(JsonNode node, String field, String context) {
        JsonNode value = node.get(field);
        if (value == null || value.isNull()) {
            throw failure(context + " is missing field: " + field);
        }
        return value;
    }

    private static JsonNode requireArray(
            JsonNode node, String field, int minimum, int maximum, String context) {
        JsonNode value = required(node, field, context);
        if (!value.isArray() || value.size() < minimum || value.size() > maximum) {
            throw failure(context + "." + field + " must be an array with " + minimum + ".." + maximum
                    + " entries");
        }
        return value;
    }

    private static void requireObject(JsonNode node, String context) {
        if (node == null || !node.isObject()) {
            throw failure(context + " must be a JSON object");
        }
    }

    private static int requireInteger(
            JsonNode node, String field, int minimum, int maximum, String context) {
        JsonNode value = required(node, field, context);
        if (!value.isIntegralNumber() || !value.canConvertToInt()) {
            throw failure(context + "." + field + " must be an integer");
        }
        int result = value.intValue();
        if (result < minimum || result > maximum) {
            throw failure(context + "." + field + " is outside " + minimum + ".." + maximum);
        }
        return result;
    }

    private static String requireStableId(JsonNode node, String field, String context) {
        String value = requireText(node, field, context);
        requireStableId(value, context + "." + field);
        return value;
    }

    private static void requireStableId(String value, String context) {
        if (value == null || value.length() > 300 || !STABLE_ID.matcher(value).matches()) {
            throw failure(context + " must be a stable ID");
        }
    }

    private static String requireNonBlankText(JsonNode node, String field, int maximum, String context) {
        String value = requireText(node, field, context);
        if (value.length() > maximum || value.isBlank()
                || Character.isWhitespace(value.charAt(0))
                || Character.isWhitespace(value.charAt(value.length() - 1))) {
            throw failure(context + "." + field + " must be non-blank without surrounding whitespace");
        }
        return value;
    }

    private static String requireMatchingText(
            JsonNode node, String field, Pattern pattern, int maximum, String context) {
        String value = requireText(node, field, context);
        if (value.length() > maximum || !pattern.matcher(value).matches()) {
            throw failure(context + "." + field + " has an invalid value: " + value);
        }
        return value;
    }

    private static String requireEnumText(JsonNode node, String field, Set<String> allowed, String context) {
        String value = requireText(node, field, context);
        if (!allowed.contains(value)) {
            throw failure(context + "." + field + " has unsupported value: " + value);
        }
        return value;
    }

    private static String requireText(JsonNode node, String field, String context) {
        JsonNode value = required(node, field, context);
        if (!value.isTextual()) {
            throw failure(context + "." + field + " must be text");
        }
        return value.textValue();
    }

    private static void requireExactText(JsonNode node, String field, String expected, String context) {
        String value = requireText(node, field, context);
        if (!expected.equals(value)) {
            throw failure(context + "." + field + " must equal " + expected);
        }
    }

    private static String requireOfficialUrl(JsonNode node, String field, String context) {
        String value = requireText(node, field, context);
        if (value.length() > 2_000 || !(value.startsWith("https://") || value.startsWith("http://"))) {
            throw failure(context + "." + field + " must be an HTTP(S) URI");
        }
        try {
            URI uri = new URI(value);
            if (!uri.isAbsolute() || uri.getHost() == null) {
                throw failure(context + "." + field + " must be an absolute HTTP(S) URI");
            }
        } catch (URISyntaxException e) {
            throw failure(context + "." + field + " must be a valid URI");
        }
        return value;
    }

    private static List<String> requireUniqueStableIdList(
            JsonNode node, String field, int minimum, int maximum, String context) {
        JsonNode values = requireArray(node, field, minimum, maximum, context);
        List<String> result = new ArrayList<>(values.size());
        Set<String> seen = new HashSet<>();
        for (int index = 0; index < values.size(); index++) {
            JsonNode value = values.get(index);
            if (!value.isTextual()) {
                throw failure(context + "." + field + "[" + index + "] must be text");
            }
            String id = value.textValue();
            requireStableId(id, context + "." + field + "[" + index + "]");
            if (!seen.add(id)) {
                throw failure(context + "." + field + " contains duplicate: " + id);
            }
            result.add(id);
        }
        return List.copyOf(result);
    }

    private static int addExact(int left, int right, String context) {
        try {
            return Math.addExact(left, right);
        } catch (ArithmeticException e) {
            throw failure(context + " overflows integer range");
        }
    }

    private static void requireCount(int declared, int actual, String context) {
        if (declared != actual) {
            throw failure(context + " count drift: declared " + declared + ", actual " + actual);
        }
    }

    private static void requireEqual(String authoritative, String projection, String context) {
        if (!authoritative.equals(projection)) {
            throw failure(context + ": expected " + authoritative + ", got " + projection);
        }
    }

    private static <K, V> void putUnique(Map<K, V> target, K key, V value, String context) {
        if (target.putIfAbsent(key, value) != null) {
            throw failure("Duplicate " + context + ": " + key);
        }
    }

    private static CurriculumPackageException failure(String message) {
        return new CurriculumPackageException(message);
    }

    private record MappingPair(String sourceGoalId, String canonicalGoalId) {
    }

    private record SourceIndex(
            String targetLandscapeId,
            Map<String, SourceCollection> collectionsById,
            Map<String, PackageLandscapeMappingState.SourceLandscapeMetadata> sourceLandscapesById,
            int documentCount) {
    }

    private record SourceCollection(
            String sourceCollectionId,
            String sourceLandscapeId,
            String jurisdiction,
            String subject,
            String stage,
            List<String> durationModels,
            List<PackageLandscapeMappingState.SourceDocument> documents) {
        private SourceCollection {
            durationModels = List.copyOf(durationModels);
            documents = List.copyOf(documents);
        }
    }

    private static final class MutableSourceLandscapeMetadata {
        private final String sourceLandscapeId;
        private final String jurisdiction;
        private final String subject;
        private final String stage;
        private final List<String> sourceCollectionIds = new ArrayList<>();

        private MutableSourceLandscapeMetadata(
                String sourceLandscapeId,
                String jurisdiction,
                String subject,
                String stage,
                String sourceCollectionId) {
            this.sourceLandscapeId = sourceLandscapeId;
            this.jurisdiction = jurisdiction;
            this.subject = subject;
            this.stage = stage;
            this.sourceCollectionIds.add(sourceCollectionId);
        }

        private void addCollection(
                String sourceCollectionId, String newJurisdiction, String newSubject, String newStage) {
            requireEqual(jurisdiction, newJurisdiction,
                    "sourceLandscapeId " + sourceLandscapeId + " has inconsistent jurisdiction");
            requireEqual(subject, newSubject,
                    "sourceLandscapeId " + sourceLandscapeId + " has inconsistent subject");
            requireEqual(stage, newStage,
                    "sourceLandscapeId " + sourceLandscapeId + " has inconsistent stage");
            sourceCollectionIds.add(sourceCollectionId);
        }

        private PackageLandscapeMappingState.SourceLandscapeMetadata toImmutable() {
            return new PackageLandscapeMappingState.SourceLandscapeMetadata(
                    sourceLandscapeId, jurisdiction, subject, stage, sourceCollectionIds);
        }
    }
}
