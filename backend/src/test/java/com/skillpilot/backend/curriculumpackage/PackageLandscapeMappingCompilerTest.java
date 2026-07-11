package com.skillpilot.backend.curriculumpackage;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.skillpilot.backend.landscape.ResolvedGoalMapping;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;

class PackageLandscapeMappingCompilerTest {

    private static final String PACKAGE_ID = "skillpilot.curriculum.math";
    private static final String ROOT_ID = "canonical-math";
    private static final Set<String> LANDSCAPE_IDS = Set.of(ROOT_ID, "embedded-math");
    private static final Set<String> CANONICAL_GOAL_IDS = Set.of("canon-1", "canon-2", "canon-3");

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final PackageLandscapeMappingCompiler compiler = new PackageLandscapeMappingCompiler(objectMapper);

    @Test
    void compilesOrderedFanoutMixedMatchTypesAndAuthoritativeProvenance() throws Exception {
        PackageLandscapeMappingState state = compile(mappingFixture(), sourceIndexFixture());

        assertThat(state.packageId()).isEqualTo(PACKAGE_ID);
        assertThat(state.targetLandscapeId()).isEqualTo(ROOT_ID);
        assertThat(state.mappingCollectionCount()).isOne();
        assertThat(state.decisionCount()).isEqualTo(2);
        assertThat(state.mappingEdgeCount()).isEqualTo(4);
        assertThat(state.sourceCollectionCount()).isOne();
        assertThat(state.sourceDocumentCount()).isOne();
        assertThat(state.mappings())
                .extracting(ResolvedGoalMapping::legacyGoalId, ResolvedGoalMapping::canonicalGoalId,
                        ResolvedGoalMapping::matchType)
                .containsExactly(
                        org.assertj.core.groups.Tuple.tuple("source-1", "canon-1", "exact"),
                        org.assertj.core.groups.Tuple.tuple("source-1", "canon-2", "exact"),
                        org.assertj.core.groups.Tuple.tuple("source-1", "canon-3", "partial"),
                        org.assertj.core.groups.Tuple.tuple("source-2", "canon-2", "partial"));
        assertThat(state.mappingsBySourceGoalId().get("source-1"))
                .extracting(ResolvedGoalMapping::canonicalGoalId)
                .containsExactly("canon-1", "canon-2", "canon-3");
        assertThat(state.mappings().getFirst().sourceFile())
                .isEqualTo("package:skillpilot.curriculum.math/data/mappings/source-to-canonical.json#mapping-1");
        assertThat(state.sourceLandscapeBySourceGoalId())
                .containsEntry("source-1", "legacy-math")
                .containsEntry("source-2", "legacy-math");
        assertThat(state.sourceLandscapesById().get("legacy-math"))
                .extracting(
                        PackageLandscapeMappingState.SourceLandscapeMetadata::jurisdiction,
                        PackageLandscapeMappingState.SourceLandscapeMetadata::subject,
                        PackageLandscapeMappingState.SourceLandscapeMetadata::stage,
                        PackageLandscapeMappingState.SourceLandscapeMetadata::sourceCollectionIds)
                .containsExactly("DE-HE", "Mathematik", "SekI", List.of("source-collection-1"));
        assertThat(state.collectionProvenanceByMappingCollectionId().get("mapping-1"))
                .satisfies(provenance -> {
                    assertThat(provenance.sourceCollectionId()).isEqualTo("source-collection-1");
                    assertThat(provenance.durationModels()).containsExactly("G9");
                    assertThat(provenance.documents())
                            .extracting(PackageLandscapeMappingState.SourceDocument::sourceDocumentId)
                            .containsExactly("document-1");
                    assertThat(provenance.inputDecisionCount()).isEqualTo(2);
                    assertThat(provenance.mappingEdgeCount()).isEqualTo(4);
                });
    }

    @Test
    void rejectsIdenticalDuplicateEdge() throws Exception {
        ObjectNode mappings = mappingFixture();
        ArrayNode edges = edges(mappings, 0);
        edges.add(edges.get(0).deepCopy());
        mappingCollection(mappings, 0).put("mappingEdgeCount", 5);
        mappings.put("mappingEdgeCount", 5);

        assertThatThrownBy(() -> compile(mappings, sourceIndexFixture()))
                .isInstanceOf(CurriculumPackageException.class)
                .hasMessageContaining("Duplicate source-to-canonical mapping edge");
    }

    @Test
    void rejectsSameEdgeWithConflictingMatchType() throws Exception {
        ObjectNode mappings = mappingFixture();
        ObjectNode duplicate = edges(mappings, 0).get(0).deepCopy();
        duplicate.put("matchType", "partial");
        edges(mappings, 0).add(duplicate);
        mappingCollection(mappings, 0).put("mappingEdgeCount", 5);
        mappings.put("mappingEdgeCount", 5);

        assertThatThrownBy(() -> compile(mappings, sourceIndexFixture()))
                .isInstanceOf(CurriculumPackageException.class)
                .hasMessageContaining("Conflicting matchType");
    }

    @Test
    void rejectsEveryDeclaredCountDrift() throws Exception {
        ObjectNode mappingCollectionCount = mappingFixture();
        mappingCollectionCount.put("mappingCollectionCount", 2);
        assertThatThrownBy(() -> compile(mappingCollectionCount, sourceIndexFixture()))
                .hasMessageContaining("mappingCollectionCount count drift");

        ObjectNode decisionCount = mappingFixture();
        decisionCount.put("decisionCount", 3);
        assertThatThrownBy(() -> compile(decisionCount, sourceIndexFixture()))
                .hasMessageContaining("decisionCount count drift");

        ObjectNode edgeCount = mappingFixture();
        edgeCount.put("mappingEdgeCount", 5);
        assertThatThrownBy(() -> compile(edgeCount, sourceIndexFixture()))
                .hasMessageContaining("mappingEdgeCount count drift");

        ObjectNode collectionEdgeCount = mappingFixture();
        mappingCollection(collectionEdgeCount, 0).put("mappingEdgeCount", 5);
        assertThatThrownBy(() -> compile(collectionEdgeCount, sourceIndexFixture()))
                .hasMessageContaining("mapping collections[0].mappingEdgeCount count drift");

        ObjectNode sourceCollectionCount = sourceIndexFixture();
        sourceCollectionCount.put("sourceCollectionCount", 2);
        assertThatThrownBy(() -> compile(mappingFixture(), sourceCollectionCount))
                .hasMessageContaining("sourceCollectionCount count drift");

        ObjectNode sourceDocumentCount = sourceIndexFixture();
        sourceDocumentCount.put("sourceDocumentCount", 2);
        assertThatThrownBy(() -> compile(mappingFixture(), sourceDocumentCount))
                .hasMessageContaining("sourceDocumentCount count drift");

        ObjectNode collectionDocumentCount = sourceIndexFixture();
        sourceCollection(collectionDocumentCount, 0).put("documentCount", 2);
        assertThatThrownBy(() -> compile(mappingFixture(), collectionDocumentCount))
                .hasMessageContaining("source collections[0].documentCount count drift");
    }

    @Test
    void rejectsUnknownCanonicalGoal() throws Exception {
        ObjectNode mappings = mappingFixture();
        ((ObjectNode) edges(mappings, 0).get(0)).put("canonicalGoalId", "unknown");

        assertThatThrownBy(() -> compile(mappings, sourceIndexFixture()))
                .isInstanceOf(CurriculumPackageException.class)
                .hasMessageContaining("unknown canonicalGoalId");
    }

    @Test
    void rejectsTargetThatIsNotThePassedRootEvenWhenItIsInThePassedSet() throws Exception {
        ObjectNode mappings = mappingFixture();
        mappings.put("targetLandscapeId", "embedded-math");
        mappingCollection(mappings, 0).put("targetLandscapeId", "embedded-math");

        assertThatThrownBy(() -> compile(mappings, sourceIndexFixture()))
                .isInstanceOf(CurriculumPackageException.class)
                .hasMessageContaining("does not equal rootLandscapeId");
    }

    @Test
    void rejectsSourceGoalOwnershipAcrossLandscapes() throws Exception {
        ObjectNode mappings = mappingFixture();
        ObjectNode sources = sourceIndexFixture();
        appendSecondCollection(mappings, sources, "source-1");

        assertThatThrownBy(() -> compile(mappings, sources))
                .isInstanceOf(CurriculumPackageException.class)
                .hasMessageContaining("belongs to multiple source landscapes");
    }

    @Test
    void rejectsMappingMetadataThatDriftsFromAuthoritativeSourceIndex() throws Exception {
        ObjectNode mappings = mappingFixture();
        mappingCollection(mappings, 0).put("jurisdiction", "DE-BY");

        assertThatThrownBy(() -> compile(mappings, sourceIndexFixture()))
                .isInstanceOf(CurriculumPackageException.class)
                .hasMessageContaining("differs from authoritative source index");
    }

    @Test
    void rejectsSourceCollectionWithoutOneToOneMappingJoin() throws Exception {
        ObjectNode mappings = mappingFixture();
        ObjectNode sources = sourceIndexFixture();
        appendSecondSourceCollection(sources);

        assertThatThrownBy(() -> compile(mappings, sources))
                .isInstanceOf(CurriculumPackageException.class)
                .hasMessageContaining("without a 1:1 mapping collection");
    }

    @Test
    void rejectsUnknownFieldsVersionsAndDuplicateJsonProperties() throws Exception {
        ObjectNode unknownField = mappingFixture();
        unknownField.put("repositoryPath", "forbidden");
        assertThatThrownBy(() -> compile(unknownField, sourceIndexFixture()))
                .hasMessageContaining("unknown field");

        ObjectNode unsupportedVersion = sourceIndexFixture();
        unsupportedVersion.put("sourceIndexFormatVersion", "2.0");
        assertThatThrownBy(() -> compile(mappingFixture(), unsupportedVersion))
                .hasMessageContaining("sourceIndexFormatVersion must equal 1.0");

        String duplicateField = objectMapper.writeValueAsString(mappingFixture())
                .replaceFirst("\\{", "{\"mappingFormatVersion\":\"1.0\",");
        assertThatThrownBy(() -> compiler.compile(
                        PACKAGE_ID,
                        duplicateField.getBytes(java.nio.charset.StandardCharsets.UTF_8),
                        objectMapper.writeValueAsBytes(sourceIndexFixture()),
                        ROOT_ID,
                        LANDSCAPE_IDS,
                        CANONICAL_GOAL_IDS))
                .isInstanceOf(CurriculumPackageException.class)
                .hasMessageContaining("Failed to parse source-to-canonical mappings");
    }

    @Test
    void exposesOnlyDeeplyImmutableState() throws Exception {
        PackageLandscapeMappingState state = compile(mappingFixture(), sourceIndexFixture());

        assertThatThrownBy(() -> state.mappings().add(state.mappings().getFirst()))
                .isInstanceOf(UnsupportedOperationException.class);
        assertThatThrownBy(() -> state.mappingsBySourceGoalId().put("new", List.of()))
                .isInstanceOf(UnsupportedOperationException.class);
        assertThatThrownBy(() -> state.mappingsBySourceGoalId().get("source-1").clear())
                .isInstanceOf(UnsupportedOperationException.class);
        assertThatThrownBy(() -> state.sourceLandscapesById().clear())
                .isInstanceOf(UnsupportedOperationException.class);
        assertThatThrownBy(() -> state.sourceLandscapesById().get("legacy-math").sourceCollectionIds().clear())
                .isInstanceOf(UnsupportedOperationException.class);
        assertThatThrownBy(() -> state.collectionProvenanceByMappingCollectionId()
                        .get("mapping-1")
                        .documents()
                        .clear())
                .isInstanceOf(UnsupportedOperationException.class);
    }

    @Test
    void mergesPackageStatesInOrderAndRejectsGlobalConflicts() throws Exception {
        PackageLandscapeMappingState first = compile(mappingFixture(), sourceIndexFixture());
        ObjectNode secondMappings = mappingFixture();
        ObjectNode secondSources = sourceIndexFixture();
        reidentifyFixture(secondMappings, secondSources, "two", "source-3", "legacy-math-2");
        PackageLandscapeMappingState second = compiler.compile(
                "skillpilot.curriculum.math.supplement",
                objectMapper.writeValueAsBytes(secondMappings),
                objectMapper.writeValueAsBytes(secondSources),
                ROOT_ID,
                LANDSCAPE_IDS,
                CANONICAL_GOAL_IDS);

        PackageLandscapeMappingState.Merged merged = PackageLandscapeMappingState.merge(List.of(first, second));

        assertThat(merged.packageStates()).containsExactly(first, second);
        assertThat(merged.mappings()).hasSize(8);
        assertThat(merged.mappings().get(0).legacyGoalId()).isEqualTo("source-1");
        assertThat(merged.mappings().get(4).legacyGoalId()).isEqualTo("source-3");
        assertThat(merged.sourceLandscapesById()).containsKeys("legacy-math", "legacy-math-2");
        assertThatThrownBy(() -> merged.mappings().clear()).isInstanceOf(UnsupportedOperationException.class);

        ObjectNode conflictingMappings = mappingFixture();
        ObjectNode conflictingSources = sourceIndexFixture();
        reidentifyFixture(conflictingMappings, conflictingSources, "conflict", "source-1", "other-owner");
        PackageLandscapeMappingState conflicting = compiler.compile(
                "skillpilot.curriculum.math.conflict",
                objectMapper.writeValueAsBytes(conflictingMappings),
                objectMapper.writeValueAsBytes(conflictingSources),
                ROOT_ID,
                LANDSCAPE_IDS,
                CANONICAL_GOAL_IDS);
        assertThatThrownBy(() -> PackageLandscapeMappingState.merge(List.of(first, conflicting)))
                .hasMessageContaining("multiple source landscapes across packages");
    }

    @Test
    void mergeRejectsDuplicateAndConflictingGlobalEdges() throws Exception {
        PackageLandscapeMappingState first = compile(mappingFixture(), sourceIndexFixture());
        ObjectNode duplicateMappings = mappingFixture();
        ObjectNode duplicateSources = sourceIndexFixture();
        reidentifyCollectionsOnly(duplicateMappings, duplicateSources, "duplicate");
        PackageLandscapeMappingState duplicate = compileForPackage(
                "skillpilot.curriculum.math.duplicate", duplicateMappings, duplicateSources);

        assertThatThrownBy(() -> PackageLandscapeMappingState.merge(List.of(first, duplicate)))
                .hasMessageContaining("Duplicate source-to-canonical mapping edge across packages");

        ObjectNode conflictMappings = mappingFixture();
        ObjectNode conflictSources = sourceIndexFixture();
        reidentifyCollectionsOnly(conflictMappings, conflictSources, "match-conflict");
        ((ObjectNode) edges(conflictMappings, 0).get(0)).put("matchType", "partial");
        PackageLandscapeMappingState conflict = compileForPackage(
                "skillpilot.curriculum.math.match-conflict", conflictMappings, conflictSources);

        assertThatThrownBy(() -> PackageLandscapeMappingState.merge(List.of(first, conflict)))
                .hasMessageContaining("Conflicting matchType")
                .hasMessageContaining("across packages");
    }

    private PackageLandscapeMappingState compile(ObjectNode mappings, ObjectNode sourceIndex) throws Exception {
        return compileForPackage(PACKAGE_ID, mappings, sourceIndex);
    }

    private PackageLandscapeMappingState compileForPackage(
            String packageId, ObjectNode mappings, ObjectNode sourceIndex) throws Exception {
        return compiler.compile(
                packageId,
                objectMapper.writeValueAsBytes(mappings),
                objectMapper.writeValueAsBytes(sourceIndex),
                ROOT_ID,
                LANDSCAPE_IDS,
                CANONICAL_GOAL_IDS);
    }

    private ObjectNode mappingFixture() throws Exception {
        return (ObjectNode) objectMapper.readTree("""
                {
                  "$schema": "https://skillpilot.com/schemas/curriculum-package/v1/source-to-canonical-mappings.schema.json",
                  "mappingFormatVersion": "1.0",
                  "targetLandscapeId": "canonical-math",
                  "mappingCollectionCount": 1,
                  "decisionCount": 2,
                  "mappingEdgeCount": 4,
                  "collections": [
                    {
                      "mappingCollectionId": "mapping-1",
                      "sourceCollectionId": "source-collection-1",
                      "sourceLandscapeId": "legacy-math",
                      "targetLandscapeId": "canonical-math",
                      "jurisdiction": "DE-HE",
                      "subject": "Mathematik",
                      "stage": "SekI",
                      "inputDecisionCount": 2,
                      "mappingEdgeCount": 4,
                      "edges": [
                        {"sourceGoalId": "source-1", "canonicalGoalId": "canon-1", "matchType": "exact"},
                        {"sourceGoalId": "source-1", "canonicalGoalId": "canon-2", "matchType": "exact"},
                        {"sourceGoalId": "source-1", "canonicalGoalId": "canon-3", "matchType": "partial"},
                        {"sourceGoalId": "source-2", "canonicalGoalId": "canon-2", "matchType": "partial"}
                      ]
                    }
                  ]
                }
                """);
    }

    private ObjectNode sourceIndexFixture() throws Exception {
        return (ObjectNode) objectMapper.readTree("""
                {
                  "$schema": "https://skillpilot.com/schemas/curriculum-package/v1/official-source-index.schema.json",
                  "sourceIndexFormatVersion": "1.0",
                  "targetLandscapeId": "canonical-math",
                  "sourceCollectionCount": 1,
                  "sourceDocumentCount": 1,
                  "collections": [
                    {
                      "sourceCollectionId": "source-collection-1",
                      "sourceLandscapeId": "legacy-math",
                      "jurisdiction": "DE-HE",
                      "subject": "Mathematik",
                      "stage": "SekI",
                      "durationModels": ["G9"],
                      "documentCount": 1,
                      "documents": [
                        {
                          "sourceDocumentId": "document-1",
                          "sourceKey": "source-key-1",
                          "title": "Kerncurriculum Mathematik",
                          "role": "primary",
                          "semanticType": "curriculum",
                          "official": true,
                          "url": "https://example.edu/curriculum.pdf",
                          "landingUrl": "https://example.edu/curriculum",
                          "durationModel": "G9"
                        }
                      ]
                    }
                  ]
                }
                """);
    }

    private void appendSecondCollection(ObjectNode mappings, ObjectNode sources, String sourceGoalId) {
        appendSecondSourceCollection(sources);
        ObjectNode secondMapping = mappingCollection(mappings, 0).deepCopy();
        secondMapping.put("mappingCollectionId", "mapping-2");
        secondMapping.put("sourceCollectionId", "source-collection-2");
        secondMapping.put("sourceLandscapeId", "legacy-math-2");
        secondMapping.put("jurisdiction", "DE-BY");
        secondMapping.put("inputDecisionCount", 1);
        secondMapping.put("mappingEdgeCount", 1);
        ArrayNode secondEdges = objectMapper.createArrayNode();
        secondEdges.add(objectMapper.createObjectNode()
                .put("sourceGoalId", sourceGoalId)
                .put("canonicalGoalId", "canon-3")
                .put("matchType", "partial"));
        secondMapping.set("edges", secondEdges);
        ((ArrayNode) mappings.get("collections")).add(secondMapping);
        mappings.put("mappingCollectionCount", 2);
        mappings.put("decisionCount", 3);
        mappings.put("mappingEdgeCount", 5);
    }

    private void appendSecondSourceCollection(ObjectNode sources) {
        ObjectNode secondSource = sourceCollection(sources, 0).deepCopy();
        secondSource.put("sourceCollectionId", "source-collection-2");
        secondSource.put("sourceLandscapeId", "legacy-math-2");
        secondSource.put("jurisdiction", "DE-BY");
        ObjectNode document = (ObjectNode) ((ArrayNode) secondSource.get("documents")).get(0);
        document.put("sourceDocumentId", "document-2");
        document.put("sourceKey", "source-key-2");
        ((ArrayNode) sources.get("collections")).add(secondSource);
        sources.put("sourceCollectionCount", 2);
        sources.put("sourceDocumentCount", 2);
    }

    private void reidentifyFixture(
            ObjectNode mappings,
            ObjectNode sources,
            String suffix,
            String firstSourceGoalId,
            String sourceLandscapeId) {
        ObjectNode mapping = mappingCollection(mappings, 0);
        mapping.put("mappingCollectionId", "mapping-" + suffix);
        mapping.put("sourceCollectionId", "source-collection-" + suffix);
        mapping.put("sourceLandscapeId", sourceLandscapeId);
        ArrayNode mappingEdges = edges(mappings, 0);
        for (int index = 0; index < mappingEdges.size(); index++) {
            ((ObjectNode) mappingEdges.get(index)).put(
                    "sourceGoalId", index < 3 ? firstSourceGoalId : firstSourceGoalId + "-other");
        }

        ObjectNode source = sourceCollection(sources, 0);
        source.put("sourceCollectionId", "source-collection-" + suffix);
        source.put("sourceLandscapeId", sourceLandscapeId);
        ObjectNode document = (ObjectNode) ((ArrayNode) source.get("documents")).get(0);
        document.put("sourceDocumentId", "document-" + suffix);
        document.put("sourceKey", "source-key-" + suffix);
    }

    private void reidentifyCollectionsOnly(ObjectNode mappings, ObjectNode sources, String suffix) {
        mappingCollection(mappings, 0).put("mappingCollectionId", "mapping-" + suffix);
        mappingCollection(mappings, 0).put("sourceCollectionId", "source-collection-" + suffix);
        sourceCollection(sources, 0).put("sourceCollectionId", "source-collection-" + suffix);
        ObjectNode document =
                (ObjectNode) ((ArrayNode) sourceCollection(sources, 0).get("documents")).get(0);
        document.put("sourceDocumentId", "document-" + suffix);
        document.put("sourceKey", "source-key-" + suffix);
    }

    private ObjectNode mappingCollection(ObjectNode mappings, int index) {
        return (ObjectNode) ((ArrayNode) mappings.get("collections")).get(index);
    }

    private ArrayNode edges(ObjectNode mappings, int collectionIndex) {
        return (ArrayNode) mappingCollection(mappings, collectionIndex).get("edges");
    }

    private ObjectNode sourceCollection(ObjectNode sourceIndex, int index) {
        return (ObjectNode) ((ArrayNode) sourceIndex.get("collections")).get(index);
    }
}
