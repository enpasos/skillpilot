package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import com.skillpilot.backend.api.*;
import com.skillpilot.backend.completion.*;
import com.skillpilot.backend.domain.*;
import java.time.*;
import java.util.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

/** Real typed compilation, schedule capture and activation; only repository I/O is mocked. */
class TypedUncoveredPlanActivationTest {
    private static final String ID=TypedUncoveredLearningFixture.ID, MATH=TypedUncoveredLearningFixture.MATH;
    private static final LocalDate TODAY=TypedUncoveredLearningFixture.TODAY;
    private TypedUncoveredLearningFixture f;

    @BeforeEach void setup(){
        f=new TypedUncoveredLearningFixture();
        f.addForeignUncoveredConsumer();
        f.learner.setFollowLearningPlans(false);
        doAnswer(invocation->{
            LearnerLearningPlan plan=invocation.getArgument(0);
            if(plan.getId()==null)plan.setId(UUID.randomUUID());
            if(!f.storedPlans.contains(plan))f.storedPlans.add(plan);
            return plan;
        }).when(f.planRepository).saveAndFlush(any());
    }

    private LearnerLearningPlanApi.ActivateRequest request(long revision,List<LearnerLearningPlanApi.Block> blocks){
        return new LearnerLearningPlanApi.ActivateRequest(TODAY,List.of(
                new LearnerLearningPlanApi.ActivationPlan(MATH,revision,"Math plan",blocks)));
    }
    private LearnerLearningPlanApi.Block today(String id){return f.block("block-"+id,id,TODAY,TODAY,true);}
    private void noResultsOrFocusWrites(){
        verify(f.masteryRepository,never()).save(any());
        verify(f.focusRepository,never()).save(any());
        verify(f.focusRepository,never()).deleteAll(any());
        verify(f.completions,never()).recordTransition(any(),anyString(),anyDouble(),anyDouble(),any());
    }
    private void rejectedWithoutAnyPersistence(LearnerLearningPlanApi.ActivateRequest request){
        rejectedWithoutAnyPersistence(request,null);
    }
    private void rejectedWithoutAnyPersistence(LearnerLearningPlanApi.ActivateRequest request,String expectedReason){
        String active=f.learner.getActiveGoalId(),workflow=f.learner.getCompletionWorkflow();
        List<String> focus=List.copyOf(f.focus);long rev=f.learner.getCoachStateRevision();
        f.clearObservedWrites();
        assertThatThrownBy(()->f.plans.activatePlans(ID,request)).isInstanceOfSatisfying(ResponseStatusException.class,
                exception->{if(expectedReason!=null)assertThat(exception.getReason()).contains(expectedReason);});
        assertThat(f.learner.getActiveGoalId()).isEqualTo(active);
        assertThat(f.learner.getCompletionWorkflow()).isEqualTo(workflow);
        assertThat(f.learner.getCoachStateRevision()).isEqualTo(rev);
        assertThat(f.learner.getFollowLearningPlans()).isFalse();assertThat(f.focus).isEqualTo(focus);
        verify(f.planRepository,never()).saveAndFlush(any());verify(f.learnerRepository,never()).save(any());
        noResultsOrFocusWrites();verifyNoInteractions(f.events);
    }

    private Set<String> actualEffectiveFocusAtoms(){
        Object projection=ReflectionTestUtils.invokeMethod(f.learners,"getGoalProjection",
                f.learner.getSelectedCurriculum(),f.learner.getPersonalCurriculum());
        List<String> roots=ReflectionTestUtils.invokeMethod(f.learners,"resolveEffectiveProjectedFocusIds",f.learner,projection);
        return ReflectionTestUtils.invokeMethod(f.learners,"projectedAtomicTargetIds",roots,projection);
    }

    @Test void wholeTwoSubjectPackagePreservesOrdinaryActivityAndTheActualPartialFocus(){
        f.focus.clear();f.focus.add("A");f.learner.setActiveGoalId("A");f.learner.setLearningState(LearningState.TEACHING);
        Set<String> before=Set.copyOf(actualEffectiveFocusAtoms());assertThat(before).containsExactly("A");f.clearObservedWrites();
        var result=f.plans.activatePlans(ID,new LearnerLearningPlanApi.ActivateRequest(TODAY,List.of(
                new LearnerLearningPlanApi.ActivationPlan(MATH,0L,"Math",List.of(today("D"))),
                new LearnerLearningPlanApi.ActivationPlan(TypedUncoveredLearningFixture.PHYSICS,0L,"Physics",List.of(today("FOREIGN"))))));
        assertThat(result.plans()).extracting(LearnerLearningPlanApi.PlanDetail::landscapeId)
                .containsExactlyInAnyOrder(MATH,TypedUncoveredLearningFixture.PHYSICS);
        assertThat(result.plans()).allSatisfy(detail->assertThat(detail.revision()).isEqualTo(1));
        assertThat(result.activeGoalId()).isNull();assertThat(result.state().activeGoal().id()).isEqualTo("A");
        assertThat(actualEffectiveFocusAtoms()).isEqualTo(before);assertThat(f.focus).containsExactly("A");
        assertThat(result.state().goals().scope().total_atomic()).isEqualTo(before.size());noResultsOrFocusWrites();
    }

    @Test void masteredAtomsLeaveTheNewCapturedPlanButRemainInTheActualWholeFocus(){
        f.mastery.put("A",1.0);Set<String> before=Set.copyOf(actualEffectiveFocusAtoms());assertThat(before).contains("A","D");
        var block=new LearnerLearningPlanApi.Block("capture","learning","ROOT","Real capture",TODAY,TODAY.plusDays(1),null,List.of("A","D"),List.of("ROOT"),true);
        f.clearObservedWrites();var result=f.plans.activatePlans(ID,request(0,List.of(block)));
        assertThat(result.plans().getFirst().blocks().getFirst().atomicGoalIds()).containsExactly("D");
        assertThat(result.activeGoalId()).isNull();assertThat(result.state().activeGoal()).isNull();
        assertThat(actualEffectiveFocusAtoms()).isEqualTo(before);assertThat(f.focus).containsExactly("ROOT");
        assertThat(result.state().goals().scope().total_atomic()).isEqualTo(before.size());
        assertThat(f.mastery).containsExactlyEntriesOf(Map.of("A",1.0));noResultsOrFocusWrites();
    }

    @Test void configurationActivationStoresRealPlanButSelectsNothingUntilExplicitResume(){
        f.learner.setAutoPilot(true);List<String> focus=List.copyOf(f.focus);long revision=f.learner.getCoachStateRevision();
        f.clearObservedWrites();
        var result=f.plans.activatePlans(ID,request(0,List.of(today("A"))));
        assertThat(result.followLearningPlans()).isTrue();assertThat(f.learner.getFollowLearningPlans()).isTrue();
        assertThat(result.selectedPlanId()).isNull();assertThat(result.selectedLandscapeId()).isNull();
        assertThat(result.focusGoalId()).isNull();assertThat(result.activeGoalId()).isNull();
        assertThat(result.state().activeGoal()).isNull();assertThat(f.learner.getActiveGoalId()).isNull();
        assertThat(f.learner.getLearningState()).isEqualTo(LearningState.FRONTIER);
        assertThat(f.focus).isEqualTo(focus);assertThat(f.learner.getCoachStateRevision()).isEqualTo(revision+1);
        assertThat(result.plans()).singleElement().satisfies(plan->{
            assertThat(plan.planId()).isNotNull();assertThat(plan.revision()).isEqualTo(1);
            assertThat(plan.blocks()).containsExactly(today("A"));assertThat(plan.learningScope()).isNull();
        });
        assertThat(result.state().levelCompletion().calculationStatus()).isEqualTo("invalid");
        assertThat(result.state().levelCompletion().notice()).isEqualTo("completion_target_routes_uncovered");
        assertThat(result.state().levelCompletion().complete()).isNull();
        assertThat(f.plans.getTodayStatus(ID,"de").automaticResumeAvailable()).isFalse();
        assertThat(f.plans.reconcile(ID,new LearnerLearningPlanApi.ReconcileRequest(TODAY)).changed()).isFalse();
        assertThat(f.learner.getActiveGoalId()).isNull();noResultsOrFocusWrites();assertThat(f.mastery).isEmpty();
        var resumed=f.facade.resumeLearningPlan(ID,"de");
        assertThat(resumed.activeGoalId()).isEqualTo("A");assertThat(f.learner.getActiveGoalId()).isEqualTo("A");
        assertThat(f.mastery).isEmpty();
    }

    @Test void currentOrdinaryGoalAndItsExactFocusSurviveConfigurationActivation(){
        f.learner.setActiveGoalId("A");f.learner.setLearningState(LearningState.TEACHING);
        f.focus.clear();f.focus.add("A");f.clearObservedWrites();
        var result=f.plans.activatePlans(ID,request(0,List.of(today("D"))));
        assertThat(result.activeGoalId()).isNull();assertThat(result.selectedPlanId()).isNull();
        assertThat(result.selectedLandscapeId()).isNull();assertThat(result.focusGoalId()).isNull();
        assertThat(result.state().activeGoal().id()).isEqualTo("A");
        assertThat(f.learner.getActiveGoalId()).isEqualTo("A");
        assertThat(f.learner.getLearningState()).isEqualTo(LearningState.TEACHING);
        assertThat(f.focus).containsExactly("A");noResultsOrFocusWrites();
    }

    @ParameterizedTest @ValueSource(strings={"de","en"})
    void disabledCurrentPlanIsReadableAsActualMetadataWithoutInventedCreditOrChoice(String language)throws Exception{
        var stored=f.addPlan(List.of(today("A")));String captured=stored.getBlocksJson();
        f.clearObservedWrites();long revision=f.learner.getCoachStateRevision();
        var list=f.plans.getPlans(ID,TODAY,language);var detail=f.plans.getPlan(ID,MATH,TODAY);
        assertThat(list.followLearningPlans()).isFalse();assertThat(list.status().resumeAvailable()).isFalse();
        assertThat(list.status().automaticResumeAvailable()).isFalse();assertThat(list.status().evaluable()).isFalse();
        assertThat(list.status().subjects()).allSatisfy(subject->assertThat(subject.canContinue()).isFalse());
        assertThat(list.plans()).singleElement().satisfies(summary->{
            assertThat(summary.planId()).isEqualTo(stored.getId());assertThat(summary.revision()).isEqualTo(1);
            assertThat(summary.learningScope()).isNull();assertThat(summary.canContinue()).isFalse();
            assertThat(summary.nextEligibleGoal()).isNull();assertThat(summary.continueReason()).isEqualTo("learning-plan-following-disabled");
        });
        assertThat(detail.blocks()).containsExactly(today("A"));assertThat(detail.revision()).isEqualTo(1);
        assertThat(detail.learningScope()).isNull();assertThat(detail.canContinue()).isFalse();
        assertThat(detail.nextEligibleGoal()).isNull();assertThat(detail.continueReason()).isEqualTo("learning-plan-following-disabled");
        assertThat(stored.getBlocksJson()).isEqualTo(captured);assertThat(f.learner.getCoachStateRevision()).isEqualTo(revision);
        assertThat(f.learner.getFollowLearningPlans()).isFalse();verify(f.planRepository,never()).saveAndFlush(any());
        verify(f.learnerRepository,never()).save(any());noResultsOrFocusWrites();
    }

    @Test void existingDisabledPlanCanBePreviewedThenActivatedWithItsRealRevision()throws Exception{
        var p=f.addPlan(List.of(today("A")));
        var request=request(1,List.of(today("D")));
        var preview=f.plans.previewPlans(ID,request,"en");
        assertThat(preview.days()).hasSize(7);assertThat(f.learner.getFollowLearningPlans()).isFalse();
        assertThat(p.getRevision()).isEqualTo(1);
        var result=f.plans.activatePlans(ID,request);
        assertThat(result.plans()).singleElement().satisfies(detail->{
            assertThat(detail.planId()).isEqualTo(p.getId());assertThat(detail.revision()).isEqualTo(2);
            assertThat(detail.blocks()).containsExactly(today("D"));assertThat(detail.learningScope()).isNull();
        });
        assertThat(result.activeGoalId()).isNull();assertThat(f.learner.getActiveGoalId()).isNull();
    }

    @ParameterizedTest @ValueSource(strings={"inactive","pause","exam-scope"})
    void alreadyChosenPausesAndExamSelectionDoNotBecomeAnAutomaticSelection(String kind)throws Exception{
        List<LearnerLearningPlanApi.Block> blocks=switch(kind){
            case "inactive"->List.of(f.block("off-A","A",TODAY,TODAY,false));
            case "pause"->List.of(f.block("off-A","A",TODAY,TODAY,false),new LearnerLearningPlanApi.Block("pause","buffer",null,"Pause",TODAY,TODAY,null,null,null,true));
            default->List.of(today("A"),new LearnerLearningPlanApi.Block("exam","milestone",null,"Exam",null,null,TODAY.plusDays(7),null,List.of("A","Q"),true));
        };
        long expected=0;
        if(kind.equals("exam-scope")){f.focus.clear();f.focus.addAll(List.of("A","Q"));}
        else {f.addPlan(blocks);f.learner.setFollowLearningPlans(true);expected=1;}
        List<String> focus=List.copyOf(f.focus);var result=f.plans.activatePlans(ID,request(expected,blocks));
        assertThat(result.plans().getFirst().blocks()).isEqualTo(blocks);
        assertThat(result.activeGoalId()).isNull();assertThat(result.focusGoalId()).isNull();assertThat(f.focus).isEqualTo(focus);
        if(!kind.equals("exam-scope"))assertThatThrownBy(()->f.plans.switchPersonalCurriculumSubject(ID,MATH))
                .isInstanceOf(ResponseStatusException.class);
        var resumed=f.plans.resumeExplicitly(ID,new LearnerLearningPlanApi.ReconcileRequest(TODAY));
        if(kind.equals("exam-scope")) {
            assertThat(resumed.activeGoalId()).isNull();assertThat(f.learner.getActiveGoalId()).isNull();
        } else {
            // A pause is subject-local. A later explicit global request may
            // still choose the other subject's genuinely available PC target.
            assertThat(resumed.activeGoalId()).isEqualTo("FOREIGN");
            assertThat(f.learner.getActiveGoalId()).isEqualTo("FOREIGN");
        }
        assertThat(f.mastery).isEmpty();
    }

    @ParameterizedTest @ValueSource(strings={"milestone","paused"})
    void unchangedStoredFocusCannotHideAChangedEffectiveScope(String proposal){
        f.focus.clear();f.focus.add("A");
        List<LearnerLearningPlanApi.Block> blocks=proposal.equals("milestone")
                ? List.of(today("A"),new LearnerLearningPlanApi.Block("B-exam","milestone",null,"B exam",null,null,TODAY.plusDays(7),null,List.of("B"),true))
                : List.of(f.block("paused-A","A",TODAY,TODAY,false));
        rejectedWithoutAnyPersistence(request(0,blocks),"would change the current learning scope");
        assertThat(f.learners.getCoachLearnerState(ID).goals().planned()).extracting(FrontierGoal::id).containsExactly("A");
    }

    @Test void anUnrequestedStaleExamRowStillParticipatesInTheProspectiveFollowScope()throws Exception{
        f.focus.clear();f.focus.addAll(List.of("ROOT","FOREIGN"));
        var stale=f.addPlan(TypedUncoveredLearningFixture.PHYSICS,List.of(
                f.block("foreign-study","FOREIGN",TODAY,TODAY,true),
                new LearnerLearningPlanApi.Block("old-exam","milestone",null,"Historical exam",null,null,TODAY.plusDays(7),null,List.of("FOREIGN"),true)));
        stale.setCurriculumId("a-previous-curriculum");
        rejectedWithoutAnyPersistence(request(0,List.of(today("A"))),"would change the current learning scope");
        assertThat(f.storedPlans).containsExactly(stale);assertThat(stale.getCurriculumId()).isEqualTo("a-previous-curriculum");
    }

    @Test void aValidAutomaticScopeRetainsTheExistingActivationAndSelectionContract(){
        f.graph.remove("FOREIGN");f.refreshCatalog();
        var result=f.plans.activatePlans(ID,request(0,List.of(today("A"))));
        assertThat(result.activeGoalId()).isEqualTo("A");assertThat(result.selectedLandscapeId()).isEqualTo(MATH);
        assertThat(result.selectedPlanId()).isNotNull();assertThat(result.focusGoalId()).isEqualTo("A");
        assertThat(f.learner.getActiveGoalId()).isEqualTo("A");assertThat(f.mastery).isEmpty();
    }

    @ParameterizedTest @ValueSource(strings={"assessment","memory","owned-workflow","paused-workflow","malformed-workflow","invalid-focus","unselected-active"})
    void protectedOrInvalidCurrentWorkRejectsBeforeAnyPlanOrPreferenceWrite(String boundary){
        switch(boundary){
            case "assessment"->f.learner.setActiveGoalId("Q");
            case "memory"->{f.strictMemory(false,false);f.learner.setActiveGoalId("B");}
            case "owned-workflow"->f.learner.setCompletionWorkflow("{\"navigationIntent\":\"required\"}");
            case "paused-workflow"->f.learner.setCompletionWorkflow("{\"navigationIntent\":\"paused\"}");
            case "malformed-workflow"->f.learner.setCompletionWorkflow("broken workflow");
            case "invalid-focus"->{f.focus.clear();f.focus.add("removed-focus");}
            case "unselected-active"->f.learner.setActiveGoalId("NOT-A-TARGET");
        }
        rejectedWithoutAnyPersistence(request(0,List.of(today("A"))));
    }

    @ParameterizedTest @ValueSource(strings={"missing-reference","cycle","catalog-unavailable","srs-unavailable"})
    void nonCoverageFailuresNeverBecomeConfigurationSuccess(String failure){
        switch(failure){
            case "missing-reference"->f.graph.get("FOREIGN").setRequires(List.of("MISSING"));
            case "cycle"->f.graph.get("FOREIGN").setRequires(List.of("FOREIGN"));
            case "catalog-unavailable"->ReflectionTestUtils.setField(f.automatic.catalog(),"available",false);
            case "srs-unavailable"->{f.strictMemory(false,false);doThrow(new IllegalStateException("SRS unavailable")).when(f.srs).findByLearnerAndNodeIds(anyString(),any());}
        }
        rejectedWithoutAnyPersistence(request(0,List.of(today("A"))));
    }

    @ParameterizedTest @ValueSource(strings={"revision","foreign-atom","wrong-focus","no-workday","wrong-date","omitted-subject"})
    void invalidWholePackageIsRejectedBeforeSavingAnyPreparedMember(String invalid)throws Exception{
        List<LearnerLearningPlanApi.Block> blocks=List.of(today("A"));long revision=0;
        if(invalid.equals("revision"))revision=1;
        if(invalid.equals("foreign-atom"))blocks=List.of(today("FOREIGN"));
        if(invalid.equals("wrong-focus"))blocks=List.of(new LearnerLearningPlanApi.Block("bad","learning","D","Wrong focus",TODAY,TODAY,null,List.of("A"),List.of("D"),true));
        if(invalid.equals("no-workday"))blocks=List.of(f.block("weekend","A",TODAY.minusDays(1),TODAY.minusDays(1),true));
        if(invalid.equals("omitted-subject"))f.addPlan(TypedUncoveredLearningFixture.PHYSICS,List.of(f.block("physics","FOREIGN",TODAY,TODAY,true)));
        var request=request(revision,blocks);
        if(invalid.equals("wrong-date"))request=new LearnerLearningPlanApi.ActivateRequest(TODAY.minusDays(1),request.plans());
        rejectedWithoutAnyPersistence(request);
    }

    @ParameterizedTest @ValueSource(booleans={false,true})
    void capturedNewAtomsUseTheRetainedStrictRecallInsteadOfLaterStoredMastery(boolean verified){
        f.strictMemory(verified,true);
        var raw=new LearnerLearningPlanApi.Block("B-C","learning","ROOT","B and C",TODAY,TODAY.plusDays(1),null,List.of("B","C"),List.of("ROOT"),true);
        var result=f.plans.activatePlans(ID,request(0,List.of(raw)));
        assertThat(result.activeGoalId()).isNull();assertThat(f.learner.getActiveGoalId()).isNull();
        var saved=result.plans().getFirst().blocks().getFirst().atomicGoalIds();
        if(verified)assertThat(saved).containsExactly("C");else assertThat(saved).containsExactly("B","C");
        if(!verified && result.plans().getFirst().nextEligibleGoal()!=null)
            assertThat(result.plans().getFirst().nextEligibleGoal().goalId()).isNotEqualTo("C");
        assertThat(f.realLaterSrsFailures.get()).isPositive();assertThat(f.mastery).containsEntry("B",1.0);
        verify(f.masteryRepository,never()).save(any());
    }

    @ParameterizedTest @ValueSource(strings={"list","detail","status"})
    void disabledMetadataDoesNotRecoverARefusedStrictInputWithinTheSameRead(String operation)throws Exception{
        f.addPlan(List.of(today("C")));f.strictMemory(true,false);f.refuseFirstStrictThenRecover();f.clearObservedWrites();
        if(operation.equals("detail"))assertThatThrownBy(()->f.plans.getPlan(ID,MATH,TODAY)).isInstanceOf(ResponseStatusException.class);
        else {
            var status=operation.equals("list")?f.plans.getPlans(ID,TODAY,"en").status():f.plans.getTodayStatus(ID,"en");
            assertThat(status.evaluable()).isFalse();assertThat(status.resumeAvailable()).isFalse();
            assertThat(status.automaticResumeAvailable()).isFalse();
            assertThat(status.subjects()).allSatisfy(subject->{assertThat(subject.evaluable()).isFalse();
                assertThat(subject.balance()).isNull();assertThat(subject.learningScope()).isNull();
                assertThat(subject.achievedGoalCount()).isNull();assertThat(subject.targetGoalCount()).isNull();
                assertThat(subject.canContinue()).isFalse();});
        }
        assertThat(f.refusedStrictReads.get()).isEqualTo(1);assertThat(f.learner.getFollowLearningPlans()).isFalse();
        verify(f.planRepository,never()).saveAndFlush(any());verify(f.learnerRepository,never()).save(any());noResultsOrFocusWrites();
    }

    @Test void aNewWorkflowProfileStillCannotBeChosenAfterConfigurationOnlyActivation(){
        f.plans.activatePlans(ID,request(0,List.of(today("A"))));
        assertThatThrownBy(()->CompletionCallContext.with(f.supported(),()->f.learners.chooseLevelCompletion(ID,
                new LevelCompletionActionRequest("selectProfile",TypedUncoveredLearningFixture.PROFILE,null,null,f.learner.getCoachStateRevision()))))
                .isInstanceOfSatisfying(ResponseStatusException.class,e->assertThat(e.getStatusCode().value()).isEqualTo(409));
        assertThat(f.learner.getCompletionWorkflow()).isNull();assertThat(f.learner.getActiveGoalId()).isNull();
    }
}
