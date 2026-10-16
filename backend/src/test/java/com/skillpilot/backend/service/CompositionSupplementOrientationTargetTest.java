package com.skillpilot.backend.service;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;
import com.fasterxml.jackson.databind.node.*;
import com.skillpilot.backend.landscape.*;
import com.skillpilot.backend.domain.*;
import com.skillpilot.backend.api.*;
import java.nio.file.*;
import java.util.*;
import org.junit.jupiter.api.Test;
/** TEST_ONLY post-native interface fixtures, never actual scientific/native acceptance. */
class CompositionSupplementOrientationTargetTest extends CompositionSupplementContractTest {
 final List<String> ordinaryCalls=new ArrayList<>(),orientationCalls=new ArrayList<>();
 void orientationFixture()throws Exception {
  var orientation=goals.get("TEST_ONLY_m0");orientation.setSemanticKind("orientation");orientation.setTags(List.of("Orientation"));
  var props=new LandscapeProperties();props.setDirectory(directory.toString());
  supplements=new CompositionSupplementService(props,mapper,landscapes,new NativeSupplementAcceptanceGate(){
   public String requireAccepted(String owner,LearningGoal goal){ordinaryCalls.add(goal.getId());assertThat(goal.getSemanticKind()).isEqualTo("curricularAtomic");return "a".repeat(64);}
   public String requireOrientationAccepted(String owner,LearningGoal goal){orientationCalls.add(goal.getId());assertThat(owner).isEqualTo(M);assertThat(goal.getSemanticKind()).isEqualTo("orientation");return "c".repeat(64);}
  },Path.of("../contracts/composition-supplement/v1"));views.setSupplementService(supplements);
  review.put("reviewFormatVersion","1.1");var binding=(ObjectNode)review.path("mathGoalBindings").get(0);binding.put("goalSha256",sha(orientation)).put("semanticKind","orientation").put("orientationContextBindingSha256","c".repeat(64));binding.remove("nativeAcceptanceSha256");
  var auth=(ObjectNode)review.path("targetAuthorizations").get(0);for(String key:List.of("mandatoryOperation","mathematicalInference","inputAvailability","wholePerformanceAlternatives","minimality"))auth.remove(key);
  auth.put("classification","reviewed-mathematics-orientation-preparation").put("orientationRationale","TEST_ONLY current selected Physics route motivates this non-assessed orientation").put("completionContract","orientation-binary-completion-v1");
  review.put("mathTeachingClosureSha256",supplements.teachingClosureSha256(Set.of("TEST_ONLY_m0","TEST_ONLY_m1")));persist();
 }
 @Test void explicitlyReviewedOrientationIsLearnableWithoutOrdinaryMathAndRetainsBinaryGlobalCompletion()throws Exception {
  orientationFixture();setActualRootAndScope();var admitted=supplements.validatedSupplements().getFirst();
  assertThat(mapper.valueToTree(admitted.authorizationAccounting()).path("orientationTargetGoals").intValue()).isEqualTo(1);
  assertThat(admitted.authorizationAccounting().reviewedDidacticSupplementAtomicGoals()).isEqualTo(1);assertThat(admitted.authorizationAccounting().regularSourceBackedAtomicGoals()).isZero();
  assertThat(ordinaryCalls).doesNotContain("TEST_ONLY_m0");assertThat(orientationCalls).contains("TEST_ONLY_m0");
  String before=learner.getPersonalCurriculum();var option=service.getCompositionSupplementOptions(LEARNER).options().getFirst();assertThat(learner.getPersonalCurriculum()).isEqualTo(before);verify(mastery,never()).save(any());
  service.applyCompositionSupplementOption(LEARNER,option.optionId());assertThat(targets()).containsExactlyInAnyOrder("TEST_ONLY_p","TEST_ONLY_m0","TEST_ONLY_m1").doesNotContain("TEST_ONLY_unrelated");
  assertThat(mapper.readTree(learner.getPersonalCurriculum()).path(M).path("selected").booleanValue()).isFalse();assertThat(service.getPlanningScope(LEARNER,M).totalAtomicGoalCount()).isEqualTo(2);
  var preparation=service.getSelectedCompositionDocuments(LEARNER,M).getFirst();service.setPlannedGoals(LEARNER,Set.of("composition:"+preparation.get("viewId")+":structure:TEST_ONLY_preparation_root"));
  var stored=new ArrayList<Mastery>();stored.add(new Mastery(learner,"TEST_ONLY_p",1.0));when(mastery.findByLearner_SkillpilotId(LEARNER)).thenAnswer(call->List.copyOf(stored));when(mastery.save(any())).thenAnswer(call->{Mastery value=call.getArgument(0);stored.removeIf(row->row.getId().equals(value.getId()));stored.add(value);return value;});
  assertThat(service.getFrontier(LEARNER)).contains("TEST_ONLY_m0").doesNotContain("TEST_ONLY_m1");assertThat(service.getMastery(LEARNER).getOrDefault("TEST_ONLY_m0",0.0)).isZero();
  assertThatThrownBy(()->service.setMastery(LEARNER,new MasteryUpdateRequest(Map.of("TEST_ONLY_m0",0.5),"TEST_ONLY_m0"))).hasMessageContaining("completion marker");verify(mastery,never()).save(any());
  when(landscapes.getOverview(anyString(),anyBoolean())).thenReturn(new LandscapeOverviewResponse(List.of(),Map.of()));
  service.setMastery(LEARNER,new MasteryUpdateRequest(Map.of("TEST_ONLY_m0",1.0),"TEST_ONLY_m0"));assertThat(service.getMastery(LEARNER).get("TEST_ONLY_m0")).isEqualTo(1.0);assertThat(service.getMastery(LEARNER).getOrDefault("TEST_ONLY_m1",0.0)).isZero();assertThat(service.getFrontier(LEARNER)).contains("TEST_ONLY_m1");
  String selected=learner.getPersonalCurriculum();service.setPlannedGoals(LEARNER,Set.of("TEST_ONLY_p"));assertThat(learner.getPersonalCurriculum()).isEqualTo(selected);
  var remove=service.getCompositionSupplementOptions(LEARNER).options().stream().filter(o->o.action().equals("REMOVE")).findFirst().orElseThrow();service.applyCompositionSupplementOption(LEARNER,remove.optionId());assertThat(targets()).containsExactly("TEST_ONLY_p");assertThat(service.getMastery(LEARNER).get("TEST_ONLY_m0")).isEqualTo(1.0);verify(mastery,never()).delete(any());
 }
 @Test void orientationCannotUseOrdinaryNativePBindingOrOldReviewVersion()throws Exception {orientationFixture();var binding=(ObjectNode)review.path("mathGoalBindings").get(0);binding.put("nativeAcceptanceSha256","a".repeat(64));persist();assertThatThrownBy(supplements::validatedSupplements).hasMessageContaining("schema validation");binding.remove("nativeAcceptanceSha256");review.put("reviewFormatVersion","1.0");persist();assertThatThrownBy(supplements::validatedSupplements).hasMessageContaining("schema validation");}
 @Test void unsupportedSupplementNoncontentKindDoesNotInheritOrientationPermission()throws Exception {orientationFixture();goals.get("TEST_ONLY_m0").setSemanticKind("memorization");((ObjectNode)review.path("mathGoalBindings").get(0)).put("goalSha256",sha(goals.get("TEST_ONLY_m0")));persist();assertThatThrownBy(supplements::validatedSupplements).isInstanceOf(IllegalStateException.class);}
 @Test void orientationCannotClaimOfficialMathSourceOrAssessmentEvidence()throws Exception {orientationFixture();var auth=(ObjectNode)review.path("targetAuthorizations").get(0);auth.put("regularMathematicsSourceCoverageClaim",true);persist();assertThatThrownBy(supplements::validatedSupplements).hasMessageContaining("schema validation");auth.put("regularMathematicsSourceCoverageClaim",false);auth.put("mandatoryOperation","TEST_ONLY forbidden graded operation");persist();assertThatThrownBy(supplements::validatedSupplements).hasMessageContaining("schema validation");}
 @Test void missingTypedOrientationBindingNeverFallsBackToContentNativeAcceptance()throws Exception {orientationFixture();((ObjectNode)review.path("mathGoalBindings").get(0)).remove("orientationContextBindingSha256");persist();assertThatThrownBy(supplements::validatedSupplements).hasMessageContaining("schema validation");assertThat(ordinaryCalls).doesNotContain("TEST_ONLY_m0");}
 @Test void typedOrientationContextSchemaIsClosedAndHasNoPerformanceAuthority() {
  var schemas=new CompositionSupplementSchemaValidator(Path.of("../contracts/composition-supplement/v1"),mapper);
  var proof=mapper.createObjectNode().put("bindingContract","registered-math-orientation-context-v1").put("receiptSha256","a".repeat(64)).put("landscapeId",M).put("goalId","TEST_ONLY_m0").put("rawGoalSha256","b".repeat(64)).put("kindDecisionSha256","c".repeat(64)).put("completionContract","orientation-binary-completion-v1");
  for(String field:List.of("canonicalSourceBinding","semanticKindSourceBinding"))proof.putObject(field).put("kind","file").put("path","TEST_ONLY_current_source.json").put("sha256","d".repeat(64));
  var bindings=mapper.createObjectNode();bindings.set("TEST_ONLY_m0",proof);schemas.validate(bindings,"registered-orientation-context-bindings.schema.json");
  proof.put("humanApproved",true);assertThatThrownBy(()->schemas.validate(bindings,"registered-orientation-context-bindings.schema.json")).hasMessageContaining("schema validation");proof.remove("humanApproved");
  proof.put("completionContract","TEST_ONLY_graded_performance");assertThatThrownBy(()->schemas.validate(bindings,"registered-orientation-context-bindings.schema.json")).hasMessageContaining("schema validation");
 }
 @Test void isolatedContentGateDoesNotImplicitlyAuthorizeOrientation() {
  NativeSupplementAcceptanceGate onlyContent=(owner,goal)->"a".repeat(64);
  assertThatThrownBy(()->onlyContent.requireOrientationAccepted(M,goals.get("TEST_ONLY_m0"))).hasMessageContaining("orientation context is unsupported");
 }
 @Test void diamondAncestorsKeepAllInheritedPrerequisitesAndDetectActualCycles()throws Exception {
  var a=goal("TEST_ONLY_parent_a",List.of("TEST_ONLY_m0"));a.setContains(List.of("TEST_ONLY_m1"));
  var b=goal("TEST_ONLY_parent_b",List.of("TEST_ONLY_unrelated"));b.setContains(List.of("TEST_ONLY_m1"));
  var top=goal("TEST_ONLY_top",List.of());top.setContains(List.of(a.getId(),b.getId()));
  var math=new LinkedHashMap<String,LearningGoal>();for(String id:List.of("TEST_ONLY_m0","TEST_ONLY_m1","TEST_ONLY_unrelated"))math.put(id,goals.get(id));for(var item:List.of(a,b,top))math.put(item.getId(),item);
  var method=CompositionSupplementService.class.getDeclaredMethod("effectivePrerequisiteClosure",String.class,Map.class);method.setAccessible(true);
  @SuppressWarnings("unchecked") Set<String> required=(Set<String>)method.invoke(supplements,"TEST_ONLY_m1",math);assertThat(required).containsExactlyInAnyOrder("TEST_ONLY_m0","TEST_ONLY_unrelated");
  a.setContains(List.of("TEST_ONLY_m1",top.getId()));
  assertThatThrownBy(()->method.invoke(supplements,"TEST_ONLY_m1",math)).hasCauseInstanceOf(IllegalStateException.class).hasStackTraceContaining("contains cycle");
 }

}
