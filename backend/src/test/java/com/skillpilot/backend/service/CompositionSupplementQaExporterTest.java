package com.skillpilot.backend.service;
import static org.assertj.core.api.Assertions.*;
import com.fasterxml.jackson.databind.*;
import java.nio.file.*;
import java.util.*;
import org.junit.jupiter.api.Test;
/** Explicit post-native TEST_ONLY fixtures; not real scientific/native approval. */
class CompositionSupplementQaExporterTest extends CompositionSupplementContractTest {
    Path repository()throws Exception {
        Path root=Files.createDirectory(directory.resolve("TEST_ONLY_repository"));
        Files.createSymbolicLink(root.resolve("curricula"),directory);
        Path schema=root.resolve("contracts/composition-supplement/v1");Files.createDirectories(schema);
        try(var files=Files.list(Path.of("../contracts/composition-supplement/v1"))){for(Path file:files.toList())Files.copy(file,schema.resolve(file.getFileName()));}
        return root;
    }
    @Test void fixedBridgeExportsActualAdmittedSameOwnerBoundedViewsWithoutLearnerWrites()throws Exception {
        var admitted=supplements.validatedSupplements();
        var rows=CompositionSupplementQaExporter.exportAdmitted(repository(),mapper,admitted,views);
        assertThat(rows).hasSize(1);
        assertThat(rows.getFirst().get("supplement")).isSameAs(admitted.getFirst());
        assertThat(rows.getFirst().get("mathBaseView")).isEqualTo(mathView);
        assertThat(rows.getFirst().get("physicsView")).isEqualTo(physicsView);
        assertThat(rows.getFirst().get("authoredDocument")).isEqualTo(document);
        assertThat(learner.getPersonalCurriculum()).contains("\"selected\":false");
        org.mockito.Mockito.verifyNoInteractions(mastery);
    }
    @Test void directExporterRechecksPhysicsActualTargetMembership()throws Exception {
        var admitted=supplements.validatedSupplements();
        physicsView=new LinkedHashMap<>(physicsView);physicsView.put("rootNodes",List.of(support("TEST_ONLY_p")));writeView(physicsView,"physics");
        assertThatThrownBy(()->CompositionSupplementQaExporter.exportAdmitted(repository(),mapper,admitted,views)).isInstanceOf(IllegalStateException.class);
    }
    @Test void rawReviewDriftBetweenAdmissionAndExportRejects()throws Exception {
        var admitted=supplements.validatedSupplements();review.put("reviewId","TEST_ONLY_changed_after_admission");persist();
        assertThatThrownBy(()->CompositionSupplementQaExporter.exportAdmitted(repository(),mapper,admitted,views)).hasMessageContaining("changed during QA export");
    }
    @Test void discoveredArtifactSymlinkNeverReadByExporter()throws Exception {
        var admitted=supplements.validatedSupplements();Path repository=repository();
        Path outside=Files.createTempFile("TEST_ONLY_outside_supplement", ".json");mapper.writeValue(outside.toFile(),document);
        Path authored;try(var files=Files.walk(directory.resolve("DE/Gymnasium/composition-supplements/mathematik"))){authored=files.filter(p->p.toString().endsWith(".supplement.json")).findFirst().orElseThrow();}
        Files.delete(authored);Files.createSymbolicLink(authored,outside);
        try {assertThatThrownBy(()->CompositionSupplementQaExporter.exportAdmitted(repository,mapper,admitted,views)).hasMessageContaining("symlink");}
        finally{Files.deleteIfExists(outside);}
    }
    @Test void closedWholeSourceScopeSchemaRejectsUntypedOrConditionalEvidence()throws Exception {
        var schemas=new CompositionSupplementSchemaValidator(Path.of("../contracts/composition-supplement/v1"),mapper);
        assertThatThrownBy(()->schemas.validate(mapper.createObjectNode().put("TEST_ONLY",true),"whole-mathematics-source-scope-review.schema.json")).hasMessageContaining("schema validation");
    }
    com.fasterxml.jackson.databind.node.ObjectNode wholeContext() {
        var context=mapper.createObjectNode();context.put("$schema","https://skillpilot.com/schemas/composition-supplement/v1/whole-mathematics-source-scope-review.schema.json").put("reviewFormatVersion","1.0").put("ownerLandscapeId",M).put("goalId","TEST_ONLY_m0").put("goalSha256","a".repeat(64)).put("decision","accepted").put("authorId","TEST_ONLY_author").put("reviewerId","TEST_ONLY_peer").put("coverageScope","whole-goal-in-entire-declared-scope").put("sourceEdition","TEST_ONLY_edition").put("sourceCohort","TEST_ONLY_cohort").put("contextRestrictionResolution","TEST_ONLY typed mechanics; no real source approval");
        context.set("scope",document.get("scope"));context.putArray("conditions");
        context.putArray("sourceContexts").addObject().put("sourceGoalId","TEST_ONLY_source").put("mappingPath","curricula/TEST_ONLY_mapping.review.json").put("sourceExtractionPath","curricula/TEST_ONLY_source-extraction.json").put("materialContextSha256","b".repeat(64));return context;
    }
    @Test void wholeSourceContextClosedSchemaAdmitsTypedTestRecord() {
        new CompositionSupplementSchemaValidator(Path.of("../contracts/composition-supplement/v1"),mapper).validate(wholeContext(),"whole-mathematics-source-scope-review.schema.json");
    }
    @Test void wholeSourceContextClosedSchemaRejectsUnknownFields() {
        var context=wholeContext();context.put("TEST_ONLY_unreviewed_waiver",true);
        assertThatThrownBy(()->new CompositionSupplementSchemaValidator(Path.of("../contracts/composition-supplement/v1"),mapper).validate(context,"whole-mathematics-source-scope-review.schema.json")).hasMessageContaining("schema validation");
    }
    @Test void wholeSourceContextClosedSchemaRejectsConditionsAndNumericRationale() {
        var schemas=new CompositionSupplementSchemaValidator(Path.of("../contracts/composition-supplement/v1"),mapper);var context=wholeContext();context.withArray("conditions").add("TEST_ONLY_unresolved_AG_or_A2");
        assertThatThrownBy(()->schemas.validate(context,"whole-mathematics-source-scope-review.schema.json")).hasMessageContaining("schema validation");
        context.putArray("conditions");context.put("contextRestrictionResolution",7);
        assertThatThrownBy(()->schemas.validate(context,"whole-mathematics-source-scope-review.schema.json")).hasMessageContaining("schema validation");
    }

    @Test void fixedExporterBindsTheExactTwoRawByteSequencesItParsed()throws Exception {
        var admitted=supplements.validatedSupplements();Path repository=repository();
        var row=CompositionSupplementQaExporter.exportAdmitted(repository,mapper,admitted,views).getFirst();
        JsonNode bindings=(JsonNode)row.get("authoredInputBindings");assertThat(bindings.size()).isEqualTo(2);
        for(String field:List.of("authoredDocument","review")) {
            String path=bindings.path(field).path("path").asText();
            assertThat(path).isEqualTo(row.get(field.equals("authoredDocument")?"authoredPath":"reviewPath"));
            byte[] bytes=Files.readAllBytes(repository.resolve(path));
            assertThat(bindings.path(field).path("sha256").asText()).isEqualTo(CompositionSupplementService.hashBytes(bytes));
            assertThat(mapper.readTree(bytes)).isEqualTo((JsonNode)row.get(field));
            assertThat(bindings.path(field).path("sha256").asText()).isNotEqualTo(CompositionSupplementService.sha((JsonNode)row.get(field))); // raw bytes include original formatting
        }
    }
    @Test void formattingOnlyCurrentExportChangeBindsNewBytesWithoutInventingNewAuthorization()throws Exception {
        var admitted=supplements.validatedSupplements();Path repository=repository();
        var before=CompositionSupplementQaExporter.exportAdmitted(repository,mapper,admitted,views).getFirst();
        Path reviewFile=repository.resolve((String)before.get("reviewPath"));Files.writeString(reviewFile,Files.readString(reviewFile)+"\n");
        var after=CompositionSupplementQaExporter.exportAdmitted(repository,mapper,admitted,views).getFirst();
        assertThat(after.get("review")).isEqualTo(before.get("review"));
        assertThat(after.get("supplement")).isEqualTo(before.get("supplement"));
        assertThat(((JsonNode)after.get("authoredInputBindings")).path("review").path("sha256")).isNotEqualTo(((JsonNode)before.get("authoredInputBindings")).path("review").path("sha256"));
    }
    @Test void byteBindingSchemaIsClosedAndRejectsMissingOrUntypedRecords() {
        var schema=new CompositionSupplementSchemaValidator(Path.of("../contracts/composition-supplement/v1"),mapper);
        var bindings=mapper.createObjectNode();for(String field:List.of("authoredDocument","review"))bindings.putObject(field).put("path","curricula/TEST_ONLY_current.json").put("sha256","a".repeat(64));
        schema.validate(bindings,"registered-authored-review-byte-bindings.schema.json");
        bindings.put("TEST_ONLY_arbitraryAuthority",true);assertThatThrownBy(()->schema.validate(bindings,"registered-authored-review-byte-bindings.schema.json")).hasMessageContaining("schema validation");bindings.remove("TEST_ONLY_arbitraryAuthority");
        ((com.fasterxml.jackson.databind.node.ObjectNode)bindings.get("review")).put("sha256",17);assertThatThrownBy(()->schema.validate(bindings,"registered-authored-review-byte-bindings.schema.json")).hasMessageContaining("schema validation");
        bindings.remove("review");assertThatThrownBy(()->schema.validate(bindings,"registered-authored-review-byte-bindings.schema.json")).hasMessageContaining("schema validation");
    }

    @Test void declaredReviewSymlinkEscapeAfterAdmissionIsRejectedByRealExporter()throws Exception {
        var admitted=supplements.validatedSupplements();Path repository=repository();
        Path reviewPath=repository.resolve("curricula").resolve(document.path("reviewPath").asText());
        Path outside=Files.createTempFile("TEST_ONLY_external_export_review", ".json");Files.write(outside,Files.readAllBytes(reviewPath));
        Files.delete(reviewPath);Files.createSymbolicLink(reviewPath,outside);
        try{assertThatThrownBy(()->CompositionSupplementQaExporter.exportAdmitted(repository,mapper,admitted,views)).hasMessageContaining("symlink");}
        finally{Files.deleteIfExists(reviewPath);Files.deleteIfExists(outside);}
    }

}
