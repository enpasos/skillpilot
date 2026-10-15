package com.skillpilot.backend.service;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import com.fasterxml.jackson.databind.node.*;
import com.skillpilot.backend.landscape.*;
import com.skillpilot.backend.api.*;
import com.skillpilot.backend.domain.*;
import org.springframework.test.util.ReflectionTestUtils;
import java.nio.file.*;
import java.util.*;
import org.junit.jupiter.api.Test;

/** Diagnostic counterexamples against exact detached candidate, not accepted scientific evidence. */
class CompositionSupplementV2PeerRegressionTest extends CompositionSupplementContractTest {
    @Test void rejectsArbitraryRejectedWrongGoalSixGateFiles() throws Exception {
        Files.writeString(directory.resolve("TEST_ONLY_quality_evidence.json"),
                "{\"goalId\":\"TEST_ONLY_wrong_goal\",\"gate\":\"V\",\"decision\":\"rejected\",\"fingerprint\":\"stale\"}");
        ObjectNode bad = (ObjectNode)mapper.valueToTree(binding("TEST_ONLY_m0", true));
        Map<String,Object> arbitrary = new LinkedHashMap<>(); for(String gate:List.of("Kind","D","P","A","M","V"))arbitrary.put(gate,fileBinding("TEST_ONLY_quality_evidence.json"));
        bad.set("qualityGateBindings",mapper.valueToTree(arbitrary));
        review.set("mathGoalBindings",mapper.valueToTree(List.of(bad,binding("TEST_ONLY_m1",true))));
        persist();
        assertThatThrownBy(supplements::validatedSupplements).isInstanceOf(IllegalStateException.class);
    }
    @Test void rejectsSchemaInvalidDisplayLabelAndDissent() throws Exception {
        ((ObjectNode)document.path("rootNodes").get(0).path("children").get(0)).set("displayLabel", mapper.createObjectNode().put("unexpected", true));
        review.set("dissent", mapper.createArrayNode().add(17));
        persist();
        assertThatThrownBy(supplements::validatedSupplements).isInstanceOf(IllegalStateException.class);
    }
    @Test void rejectsAuthoredSupplementSymlinkOutsideCurriculumRoot() throws Exception {
        Path authored = directory.resolve("DE/Gymnasium/composition-supplements/mathematik/TEST_ONLY.supplement.json");
        Path outside = directory.getParent().resolve("TEST_ONLY_outside_"+directory.getFileName()+".supplement.json");
        Files.move(authored, outside);
        try { Files.createSymbolicLink(authored, outside); assertThatThrownBy(supplements::validatedSupplements).isInstanceOf(IllegalStateException.class); }
        finally { Files.deleteIfExists(outside); }
    }
    @Test void peerEvidencePathsStillRejectTraversalAndExternalSymlinks() throws Exception {
        ObjectNode sourceBinding=(ObjectNode)review.path("sourceBindings").get(0).path("retainedEvidence");
        sourceBinding.put("path", "../TEST_ONLY_escape.json"); persist();
        assertThatThrownBy(supplements::validatedSupplements).hasMessageContaining("escapes curriculum root");
        Path outside=directory.getParent().resolve("TEST_ONLY_source_outside_"+directory.getFileName()+".json");
        Files.writeString(outside, "TEST_ONLY");
        try {
            Files.createSymbolicLink(directory.resolve("TEST_ONLY_external_source.json"),outside);
            sourceBinding.put("path","TEST_ONLY_external_source.json"); persist();
            assertThatThrownBy(supplements::validatedSupplements).hasMessageContaining("symbolic authorization");
        } finally { Files.deleteIfExists(outside); }
    }
    @Test void peerOptionsRemainLearnerBound() throws Exception {
        setActualRootAndScope();
        String offer=service.getCompositionSupplementOptions(LEARNER).options().getFirst().optionId();
        String initial=learner.getPersonalCurriculum(); learner.setSkillpilotId("TEST_ONLY_other_learner");
        assertThatThrownBy(()->service.applyCompositionSupplementOption(LEARNER,offer)).hasMessageContaining("stale");
        assertThat(learner.getPersonalCurriculum()).isEqualTo(initial); verify(mastery,never()).save(any());
    }
    @Test void globalUnselectedPhysicsDependentCannotAuthorizeOffer() throws Exception {
        setActualRootAndScope();
        var other=goal("TEST_ONLY_other_physics",List.of()); goals.put(other.getId(),other);
        var physics=landscapes.getById(P); physics.setGoals(List.of(goals.get("TEST_ONLY_p"),other));
        when(landscapes.getLandscapeIdForGoal("TEST_ONLY_other_physics")).thenReturn(P);
        Map<String,Object> replacement=new LinkedHashMap<>(physicsView);
        replacement.put("rootNodes",List.of(entry("TEST_ONLY_other_physics"),support("TEST_ONLY_m0"),support("TEST_ONLY_m1")));
        physicsView=replacement; writeView(physicsView,"physics");
        ((ObjectNode)review.path("physicsContext")).put("viewSha256",sha(physicsView)); persist();
        // Referenced TEST_ONLY_p remains in the owner graph but outside the reviewed selected view.
        assertThat(targets()).containsExactly("TEST_ONLY_other_physics");
        assertThat(service.getCompositionSupplementOptions(LEARNER).options()).noneSatisfy(option->assertThat(option.action()).isEqualTo("ADD"));
    }
    @Test void restartPreservesCommittedSupplementUntilExplicitRemoval() throws Exception {
        setActualRootAndScope();
        service.applyCompositionSupplementOption(LEARNER,service.getCompositionSupplementOptions(LEARNER).options().getFirst().optionId());
        assertThat(mapper.readTree(learner.getPersonalCurriculum()).path(M).path(CompositionSupplementService.SELECTIONS)).hasSize(1);
        SkillLandscape root=landscapes.getById(learner.getSelectedCurriculum());
        String flow="{\"version\":\"1\",\"stages\":[{\"id\":\"TEST_ONLY_subject_stage\",\"order\":1,\"label\":\"TEST_ONLY subjects\",\"groups\":[{\"id\":\"TEST_ONLY_subject_group\",\"order\":1,\"label\":\"TEST_ONLY subjects\",\"minSelections\":1,\"maxSelections\":2,\"source\":{\"kind\":\"landscapes\",\"landscapeIds\":[\""+P+"\",\""+M+"\"]}}]}]}";
        root.setPersonalizationFlow(mapper.readValue(flow, PersonalizationFlow.class));
        List<SkillLandscape> fullClosure=List.of(root,landscapes.getById(P),landscapes.getById(M));
        when(landscapes.getClosure(learner.getSelectedCurriculum())).thenReturn(fullClosure);
        String original=learner.getPersonalCurriculum();
        assertThatThrownBy(()->service.restartPersonalization(LEARNER)).hasMessageContaining("Remove selected Mathematics preparation explicitly");
        assertThat(learner.getPersonalCurriculum()).isEqualTo(original);
        assertThat(mapper.readTree(learner.getPersonalCurriculum()).path(M).path(CompositionSupplementService.SELECTIONS)).hasSize(1);
        verify(mastery,never()).save(any()); verify(mastery,never()).delete(any());
    }

    @Test void nativeSchemaParityRejectsEachOptionalTypeAndUnknownNestedFieldSeparately() throws Exception {
        ObjectNode saved=document.deepCopy();ObjectNode accepted=review.deepCopy();
        ((ObjectNode)document.path("rootNodes").get(0).path("children").get(0)).put("displayLabel",17);persist();
        assertThatThrownBy(supplements::validatedSupplements).hasMessageContaining("schema validation");
        document=saved.deepCopy();review=accepted.deepCopy();review.set("dissent",mapper.createArrayNode().add(17));persist();
        assertThatThrownBy(supplements::validatedSupplements).hasMessageContaining("schema validation");
        review=accepted.deepCopy();((ObjectNode)review.path("mathGoalBindings").get(0)).put("nativeAcceptanceSha256",17);persist();
        assertThatThrownBy(supplements::validatedSupplements).hasMessageContaining("schema validation");
        review=accepted.deepCopy();((ObjectNode)review.path("targetAuthorizations").get(0).path("inputAvailability")).put("unrecognized",true);persist();
        assertThatThrownBy(supplements::validatedSupplements).hasMessageContaining("schema validation");
    }
    @Test void reviewAndDirectorySymlinksCannotAuthorizeEvenSameBytes() throws Exception {
        Path reviewPath=directory.resolve("TEST_ONLY_review.json");Path copy=directory.resolve("TEST_ONLY_same_review.json");
        Files.move(reviewPath,copy);Files.createSymbolicLink(reviewPath,copy);
        assertThatThrownBy(supplements::validatedSupplements).hasMessageContaining("symbolic authorization");
        Files.delete(reviewPath);Files.move(copy,reviewPath);
        Path folder=directory.resolve("DE/Gymnasium/composition-supplements/mathematik"),moved=directory.resolve("TEST_ONLY_moved_authored");
        Files.move(folder,moved);Files.createSymbolicLink(folder,moved);
        assertThatThrownBy(supplements::validatedSupplements).hasMessageContaining("symbolic authorization");
    }
    @Test void actualPhysicsTargetUsesDirectAndDeepestSubtreeRolesConjunctively() throws Exception {
        setActualRootAndScope();
        var cluster=goal("TEST_ONLY_physics_cluster",List.of());cluster.setContains(List.of("TEST_ONLY_p"));cluster.setSemanticKind("curricularArea");
        goals.put(cluster.getId(),cluster);when(landscapes.getLandscapeIdForGoal(cluster.getId())).thenReturn(P);
        var outer=goal("TEST_ONLY_physics_outer",List.of());outer.setContains(List.of(cluster.getId()));outer.setSemanticKind("curricularArea");
        goals.put(outer.getId(),outer);when(landscapes.getLandscapeIdForGoal(outer.getId())).thenReturn(P);
        landscapes.getById(P).setGoals(List.of(goals.get("TEST_ONLY_p"),cluster,outer));
        bindPhysicsNodes(List.of(Map.of("kind","canonicalSubtree","goalId",outer.getId()),support("TEST_ONLY_p")));
        assertThat(views.resolvedTargetGoalIds(physicsView)).doesNotContain("TEST_ONLY_p");assertNoAdd();
        bindPhysicsNodes(List.of(Map.of("kind","canonicalSubtree","goalId",outer.getId()),Map.of("kind","canonicalSubtree","goalId",cluster.getId(),"projectionRole","prerequisiteOnly")));
        assertThat(views.resolvedTargetGoalIds(physicsView)).doesNotContain("TEST_ONLY_p");assertNoAdd();
        bindPhysicsNodes(List.of(Map.of("kind","canonicalSubtree","goalId",outer.getId()),Map.of("kind","canonicalSubtree","goalId",cluster.getId(),"projectionRole","prerequisiteOnly"),entry("TEST_ONLY_p")));
        assertThat(views.resolvedTargetGoalIds(physicsView)).contains("TEST_ONLY_p");
        assertThat(service.getCompositionSupplementOptions(LEARNER).options()).anySatisfy(option->assertThat(option.action()).isEqualTo("ADD"));
        // A TARGET at equal specificity wins, but a different current explicit scope still rejects.
        bindPhysicsNodes(List.of(support("TEST_ONLY_p"),entry("TEST_ONLY_p")));
        var supplement=supplements.validatedSupplements().getFirst();
        assertThat(views.resolvedTargetGoalIds(physicsView)).contains("TEST_ONLY_p");
        Map<String,String> wrong=new LinkedHashMap<>(supplement.physicsScope());wrong.put("durationModel","G8");
        assertThatThrownBy(()->views.validateSupplementContext(supplement,supplement.scope(),wrong,true)).hasMessageContaining("incompatible");
        assertThatThrownBy(()->views.validateSupplementContext(supplement,supplement.scope(),supplement.physicsScope(),false)).hasMessageContaining("incompatible");
    }
    void bindPhysicsNodes(List<Map<String,Object>> nodes)throws Exception {
        Map<String,Object> changed=new LinkedHashMap<>(physicsView);changed.put("rootNodes",nodes);physicsView=changed;
        writeView(physicsView,"physics");ReflectionTestUtils.setField(views,"repositoryViewIndex",null);((ObjectNode)review.path("physicsContext")).put("viewSha256",sha(physicsView));persist();
    }
    void assertNoAdd(){assertThat(service.getCompositionSupplementOptions(LEARNER).options()).noneSatisfy(option->assertThat(option.action()).isEqualTo("ADD"));}
    void accept()throws Exception {setActualRootAndScope();service.applyCompositionSupplementOption(LEARNER,service.getCompositionSupplementOptions(LEARNER).options().getFirst().optionId());}
    @Test void rewindReopenCoachPatchAndRootSwitchPreserveCommittedConfigurationBeforeWrites() throws Exception {
        accept();String original=learner.getPersonalCurriculum();String root=learner.getSelectedCurriculum();clearInvocations(learners,mastery,planned);
        assertThatThrownBy(()->service.rewindPersonalization(LEARNER,"TEST_ONLY_stale_rewind")).hasMessageContaining("Remove selected Mathematics preparation explicitly");
        assertThatThrownBy(()->service.reopenMigratedPersonalization(LEARNER)).hasMessageContaining("Remove selected Mathematics preparation explicitly");
        assertThatThrownBy(()->service.patchPersonalCurriculum(LEARNER,Map.of(),null,null,"TEST_ONLY_option")).hasMessageContaining("Remove selected Mathematics preparation explicitly");
        when(landscapes.getById("TEST_ONLY_other_root")).thenReturn(landscape("TEST_ONLY_other_root","TEST_ONLY",List.of()));
        assertThatThrownBy(()->service.setCurriculum(LEARNER,"TEST_ONLY_other_root")).hasMessageContaining("Remove selected Mathematics preparation explicitly");
        assertThat(learner.getSelectedCurriculum()).isEqualTo(root);assertThat(learner.getPersonalCurriculum()).isEqualTo(original);
        verify(learners,never()).save(any());verify(planned,never()).deleteByLearner_SkillpilotId(anyString());verify(mastery,never()).save(any());
    }
    @Test void ordinaryDirectSaveRetainsSupplementAndRejectsScopeChangeThenExplicitRemoveRepairs() throws Exception {
        accept();ObjectNode original=(ObjectNode)mapper.readTree(learner.getPersonalCurriculum());
        ObjectNode submitted=original.deepCopy();((ObjectNode)submitted.path(M)).remove(CompositionSupplementService.SELECTIONS);
        service.setPersonalCurriculum(LEARNER,mapper.convertValue(submitted,Map.class),null,null);
        assertThat(mapper.readTree(learner.getPersonalCurriculum()).path(M).path(CompositionSupplementService.SELECTIONS)).hasSize(1);
        String committed=learner.getPersonalCurriculum();((ObjectNode)submitted.path(learner.getSelectedCurriculum())).put("durationModel","G8");
        assertThatThrownBy(()->service.setPersonalCurriculum(LEARNER,mapper.convertValue(submitted,Map.class),null,null)).hasMessageContaining("stale or incompatible");
        assertThat(learner.getPersonalCurriculum()).isEqualTo(committed);
        var remove=service.getCompositionSupplementOptions(LEARNER).options().stream().filter(o->o.action().equals("REMOVE")).findFirst().orElseThrow();
        service.applyCompositionSupplementOption(LEARNER,remove.optionId());assertThat(targets()).containsExactly("TEST_ONLY_p");
        verify(mastery,never()).save(any());verify(mastery,never()).delete(any());
    }
    @Test void signedImportCannotImplicitlyRemoveOrInstallSupplementSelections() throws Exception {
        accept();String committed=learner.getPersonalCurriculum();clearInvocations(learners,mastery,planned);
        Learner imported=new Learner();imported.setSkillpilotId("TEST_ONLY_archive_owner");imported.setSelectedCurriculum(learner.getSelectedCurriculum());
        ObjectNode noSupplement=(ObjectNode)mapper.readTree(committed);((ObjectNode)noSupplement.path(M)).remove(CompositionSupplementService.SELECTIONS);imported.setPersonalCurriculum(noSupplement.toString());
        var data=new LearnerDataDTO(imported,Map.of(),List.of(),Set.of(),null);
        String signature=ReflectionTestUtils.invokeMethod(service,"calculateSignature",data);
        assertThatThrownBy(()->service.importLearner(LEARNER,new SignedLearnerDataDTO(data,signature))).hasMessageContaining("Import cannot add, remove or move");
        assertThat(learner.getPersonalCurriculum()).isEqualTo(committed);verify(learners,never()).save(any());verify(mastery,never()).saveAndFlush(any());
        // A valid signature on an archive does not constitute first-party ADD acceptance.
        learner.setPersonalCurriculum(noSupplement.toString());imported.setPersonalCurriculum(committed);
        var install=new LearnerDataDTO(imported,Map.of(),List.of(),Set.of(),null);String installSignature=ReflectionTestUtils.invokeMethod(service,"calculateSignature",install);
        assertThatThrownBy(()->service.importLearner(LEARNER,new SignedLearnerDataDTO(install,installSignature))).hasMessageContaining("Import cannot add, remove or move");
        assertThat(learner.getPersonalCurriculum()).isEqualTo(noSupplement.toString());verify(learners,never()).save(any());
    }


    @Test void unavailableNativeAuthorizationIsVisibleWhileExplicitRemovalRemainsAvailable() throws Exception {
        accept();goals.get("TEST_ONLY_m1").setDescription("TEST_ONLY stale accepted P");
        var result=service.getCompositionSupplementOptions(LEARNER);
        assertThat(result.problemCode()).isEqualTo("COMPOSITION_SUPPLEMENT_CURRENT_AUTHORIZATION_UNAVAILABLE");
        assertThat(result.options()).allSatisfy(option->assertThat(option.action()).isEqualTo("REMOVE"));
        service.applyCompositionSupplementOption(LEARNER,result.options().getFirst().optionId());
        assertThat(targets()).containsExactly("TEST_ONLY_p");
    }
    @Test void absentOrEmptyAuthoredDirectoryNeverRunsNativeProducerForOrdinaryFlows() throws Exception {
        Files.delete(directory.resolve("DE/Gymnasium/composition-supplements/mathematik/TEST_ONLY.supplement.json"));
        LandscapeProperties properties=new LandscapeProperties();properties.setDirectory(directory.toString());
        NativeSupplementAcceptanceGate unavailable=new NativeSupplementAcceptanceGate(){
            public String requireAccepted(String owner,LearningGoal goal){throw new AssertionError("ordinary flow must not invoke native admission");}
            public <T>T withSnapshot(java.util.function.Supplier<T> action){throw new AssertionError("ordinary flow must not start native producer");}
        };
        var ordinary=new CompositionSupplementService(properties,mapper,landscapes,unavailable,Path.of("../contracts/composition-supplement/v1"));
        assertThat(ordinary.validatedSupplements()).isEmpty();
        Files.delete(directory.resolve("DE/Gymnasium/composition-supplements/mathematik"));
        assertThat(ordinary.validatedSupplements()).isEmpty();
    }

}
