package com.skillpilot.backend.curriculumpackage;

import com.skillpilot.backend.landscape.ResolvedGoalMapping;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

/**
 * Immutable, package-bound source-to-canonical mapping state.
 *
 * <p>The mapping list preserves package collection and edge order. Source metadata comes from the
 * official source index; the mapping projection is only allowed to repeat that metadata exactly.
 */
public final class PackageLandscapeMappingState {

    private final String packageId;
    private final String targetLandscapeId;
    private final List<ResolvedGoalMapping> mappings;
    private final Map<String, List<ResolvedGoalMapping>> mappingsBySourceGoalId;
    private final Map<String, SourceLandscapeMetadata> sourceLandscapesById;
    private final Map<String, String> sourceLandscapeBySourceGoalId;
    private final Map<String, CollectionProvenance> collectionProvenanceByMappingCollectionId;
    private final Map<String, CollectionProvenance> collectionProvenanceBySourceCollectionId;
    private final int decisionCount;
    private final int sourceDocumentCount;

    PackageLandscapeMappingState(
            String packageId,
            String targetLandscapeId,
            List<ResolvedGoalMapping> mappings,
            Map<String, List<ResolvedGoalMapping>> mappingsBySourceGoalId,
            Map<String, SourceLandscapeMetadata> sourceLandscapesById,
            Map<String, String> sourceLandscapeBySourceGoalId,
            Map<String, CollectionProvenance> collectionProvenanceByMappingCollectionId,
            Map<String, CollectionProvenance> collectionProvenanceBySourceCollectionId,
            int decisionCount,
            int sourceDocumentCount) {
        this.packageId = packageId;
        this.targetLandscapeId = targetLandscapeId;
        this.mappings = List.copyOf(mappings);
        this.mappingsBySourceGoalId = immutableListMap(mappingsBySourceGoalId);
        this.sourceLandscapesById = immutableOrderedMap(sourceLandscapesById);
        this.sourceLandscapeBySourceGoalId = immutableOrderedMap(sourceLandscapeBySourceGoalId);
        this.collectionProvenanceByMappingCollectionId =
                immutableOrderedMap(collectionProvenanceByMappingCollectionId);
        this.collectionProvenanceBySourceCollectionId =
                immutableOrderedMap(collectionProvenanceBySourceCollectionId);
        this.decisionCount = decisionCount;
        this.sourceDocumentCount = sourceDocumentCount;
    }

    public String packageId() {
        return packageId;
    }

    public String targetLandscapeId() {
        return targetLandscapeId;
    }

    public List<ResolvedGoalMapping> mappings() {
        return mappings;
    }

    public Map<String, List<ResolvedGoalMapping>> mappingsBySourceGoalId() {
        return mappingsBySourceGoalId;
    }

    public Map<String, SourceLandscapeMetadata> sourceLandscapesById() {
        return sourceLandscapesById;
    }

    public Map<String, String> sourceLandscapeBySourceGoalId() {
        return sourceLandscapeBySourceGoalId;
    }

    public Map<String, CollectionProvenance> collectionProvenanceByMappingCollectionId() {
        return collectionProvenanceByMappingCollectionId;
    }

    public Map<String, CollectionProvenance> collectionProvenanceBySourceCollectionId() {
        return collectionProvenanceBySourceCollectionId;
    }

    public int mappingCollectionCount() {
        return collectionProvenanceByMappingCollectionId.size();
    }

    public int decisionCount() {
        return decisionCount;
    }

    public int mappingEdgeCount() {
        return mappings.size();
    }

    public int sourceCollectionCount() {
        return collectionProvenanceBySourceCollectionId.size();
    }

    public int sourceDocumentCount() {
        return sourceDocumentCount;
    }

    /**
     * Losslessly combines independently compiled package states for a process-wide mapping adapter.
     * Package order and mapping order inside every package are retained.
     */
    public static Merged merge(List<PackageLandscapeMappingState> states) {
        if (states == null) {
            throw new CurriculumPackageException("Mapping states must not be null");
        }
        List<PackageLandscapeMappingState> mutableStateCopy = new ArrayList<>(states.size());
        for (PackageLandscapeMappingState state : states) {
            if (state == null) {
                throw new CurriculumPackageException("Mapping states must not contain null");
            }
            mutableStateCopy.add(state);
        }
        List<PackageLandscapeMappingState> stateCopy = List.copyOf(mutableStateCopy);
        List<ResolvedGoalMapping> mergedMappings = new ArrayList<>();
        Map<String, List<ResolvedGoalMapping>> mappingsBySourceGoalId = new LinkedHashMap<>();
        Map<String, SourceLandscapeMetadata> sourceLandscapes = new LinkedHashMap<>();
        Map<String, String> sourceOwners = new LinkedHashMap<>();
        Map<String, CollectionProvenance> provenanceByMappingId = new LinkedHashMap<>();
        Map<String, CollectionProvenance> provenanceBySourceId = new LinkedHashMap<>();
        Map<MergedEdgeKey, String> matchTypesByEdge = new LinkedHashMap<>();
        Set<String> packageIds = new HashSet<>();

        for (PackageLandscapeMappingState state : stateCopy) {
            if (!packageIds.add(state.packageId())) {
                throw new CurriculumPackageException("Duplicate mapping state packageId: " + state.packageId());
            }
            for (ResolvedGoalMapping mapping : state.mappings()) {
                String priorOwner = sourceOwners.putIfAbsent(mapping.legacyGoalId(), mapping.sourceLandscapeId());
                if (priorOwner != null && !priorOwner.equals(mapping.sourceLandscapeId())) {
                    throw new CurriculumPackageException(
                            "sourceGoalId belongs to multiple source landscapes across packages: "
                                    + mapping.legacyGoalId());
                }
                MergedEdgeKey edgeKey = new MergedEdgeKey(
                        mapping.sourceLandscapeId(),
                        mapping.targetLandscapeId(),
                        mapping.legacyGoalId(),
                        mapping.canonicalGoalId());
                String priorType = matchTypesByEdge.putIfAbsent(edgeKey, mapping.matchType());
                if (priorType != null) {
                    if (priorType.equals(mapping.matchType())) {
                        throw new CurriculumPackageException(
                                "Duplicate source-to-canonical mapping edge across packages: "
                                        + mapping.legacyGoalId() + " -> " + mapping.canonicalGoalId());
                    }
                    throw new CurriculumPackageException(
                            "Conflicting matchType for source-to-canonical mapping edge across packages: "
                                    + mapping.legacyGoalId() + " -> " + mapping.canonicalGoalId());
                }
                mergedMappings.add(mapping);
                mappingsBySourceGoalId
                        .computeIfAbsent(mapping.legacyGoalId(), ignored -> new ArrayList<>())
                        .add(mapping);
            }
            state.sourceLandscapesById().forEach((id, metadata) -> sourceLandscapes.merge(
                    id,
                    metadata,
                    PackageLandscapeMappingState::mergeMetadata));
            state.collectionProvenanceByMappingCollectionId().forEach((id, provenance) ->
                    putUnique(provenanceByMappingId, id, provenance, "mappingCollectionId"));
            state.collectionProvenanceBySourceCollectionId().forEach((id, provenance) ->
                    putUnique(provenanceBySourceId, id, provenance, "sourceCollectionId"));
        }
        return new Merged(
                stateCopy,
                mergedMappings,
                mappingsBySourceGoalId,
                sourceLandscapes,
                sourceOwners,
                provenanceByMappingId,
                provenanceBySourceId);
    }

    public record SourceLandscapeMetadata(
            String sourceLandscapeId,
            String jurisdiction,
            String subject,
            String stage,
            List<String> sourceCollectionIds) {
        public SourceLandscapeMetadata {
            sourceCollectionIds = List.copyOf(sourceCollectionIds);
        }
    }

    public record CollectionProvenance(
            String mappingCollectionId,
            String sourceCollectionId,
            String sourceLandscapeId,
            String targetLandscapeId,
            String jurisdiction,
            String subject,
            String stage,
            List<String> durationModels,
            List<SourceDocument> documents,
            int inputDecisionCount,
            int mappingEdgeCount,
            String sourceFile) {
        public CollectionProvenance {
            durationModels = List.copyOf(durationModels);
            documents = List.copyOf(documents);
        }
    }

    public record SourceDocument(
            String sourceDocumentId,
            String sourceKey,
            String title,
            String role,
            String semanticType,
            boolean official,
            String url,
            String landingUrl,
            String durationModel) {
    }

    public static final class Merged {
        private final List<PackageLandscapeMappingState> packageStates;
        private final List<ResolvedGoalMapping> mappings;
        private final Map<String, List<ResolvedGoalMapping>> mappingsBySourceGoalId;
        private final Map<String, SourceLandscapeMetadata> sourceLandscapesById;
        private final Map<String, String> sourceLandscapeBySourceGoalId;
        private final Map<String, CollectionProvenance> collectionProvenanceByMappingCollectionId;
        private final Map<String, CollectionProvenance> collectionProvenanceBySourceCollectionId;

        private Merged(
                List<PackageLandscapeMappingState> packageStates,
                List<ResolvedGoalMapping> mappings,
                Map<String, List<ResolvedGoalMapping>> mappingsBySourceGoalId,
                Map<String, SourceLandscapeMetadata> sourceLandscapesById,
                Map<String, String> sourceLandscapeBySourceGoalId,
                Map<String, CollectionProvenance> collectionProvenanceByMappingCollectionId,
                Map<String, CollectionProvenance> collectionProvenanceBySourceCollectionId) {
            this.packageStates = List.copyOf(packageStates);
            this.mappings = List.copyOf(mappings);
            this.mappingsBySourceGoalId = immutableListMap(mappingsBySourceGoalId);
            this.sourceLandscapesById = immutableOrderedMap(sourceLandscapesById);
            this.sourceLandscapeBySourceGoalId = immutableOrderedMap(sourceLandscapeBySourceGoalId);
            this.collectionProvenanceByMappingCollectionId =
                    immutableOrderedMap(collectionProvenanceByMappingCollectionId);
            this.collectionProvenanceBySourceCollectionId =
                    immutableOrderedMap(collectionProvenanceBySourceCollectionId);
        }

        public List<PackageLandscapeMappingState> packageStates() {
            return packageStates;
        }

        public List<ResolvedGoalMapping> mappings() {
            return mappings;
        }

        public Map<String, List<ResolvedGoalMapping>> mappingsBySourceGoalId() {
            return mappingsBySourceGoalId;
        }

        public Map<String, SourceLandscapeMetadata> sourceLandscapesById() {
            return sourceLandscapesById;
        }

        public Map<String, String> sourceLandscapeBySourceGoalId() {
            return sourceLandscapeBySourceGoalId;
        }

        public Map<String, CollectionProvenance> collectionProvenanceByMappingCollectionId() {
            return collectionProvenanceByMappingCollectionId;
        }

        public Map<String, CollectionProvenance> collectionProvenanceBySourceCollectionId() {
            return collectionProvenanceBySourceCollectionId;
        }
    }

    private static <K, V> Map<K, V> immutableOrderedMap(Map<K, V> source) {
        return Collections.unmodifiableMap(new LinkedHashMap<>(source));
    }

    private static Map<String, List<ResolvedGoalMapping>> immutableListMap(
            Map<String, List<ResolvedGoalMapping>> source) {
        Map<String, List<ResolvedGoalMapping>> copy = new LinkedHashMap<>();
        source.forEach((key, value) -> copy.put(key, List.copyOf(value)));
        return Collections.unmodifiableMap(copy);
    }

    private static SourceLandscapeMetadata mergeMetadata(
            SourceLandscapeMetadata left, SourceLandscapeMetadata right) {
        if (!Objects.equals(left.jurisdiction(), right.jurisdiction())
                || !Objects.equals(left.subject(), right.subject())
                || !Objects.equals(left.stage(), right.stage())) {
            throw new CurriculumPackageException(
                    "Conflicting source-landscape metadata across packages: " + left.sourceLandscapeId());
        }
        List<String> collectionIds = new ArrayList<>(left.sourceCollectionIds());
        for (String collectionId : right.sourceCollectionIds()) {
            if (collectionIds.contains(collectionId)) {
                throw new CurriculumPackageException(
                        "Duplicate sourceCollectionId across packages: " + collectionId);
            }
            collectionIds.add(collectionId);
        }
        return new SourceLandscapeMetadata(
                left.sourceLandscapeId(), left.jurisdiction(), left.subject(), left.stage(), collectionIds);
    }

    private static <K, V> void putUnique(Map<K, V> target, K key, V value, String context) {
        if (target.putIfAbsent(key, value) != null) {
            throw new CurriculumPackageException("Duplicate " + context + " across packages: " + key);
        }
    }

    private record MergedEdgeKey(
            String sourceLandscapeId,
            String targetLandscapeId,
            String sourceGoalId,
            String canonicalGoalId) {
    }
}
