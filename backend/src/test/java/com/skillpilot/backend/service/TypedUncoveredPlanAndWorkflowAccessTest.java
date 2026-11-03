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
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

/** Full-PC typed-failure controls through real service/facade transitions, not frontier mocks. */
class TypedUncoveredPlanAndWorkflowAccessTest {
    private TypedUncoveredLearningFixture f;
    @BeforeEach void setup(){f=new TypedUncoveredLearningFixture();}
    private static final String ID=TypedUncoveredLearningFixture.ID, MATH=TypedUncoveredLearningFixture.MATH;
    private static final LocalDate TODAY=TypedUncoveredLearningFixture.TODAY;

    @ParameterizedTest @ValueSource(strings={"de","en"})
    void statusOffersExplicitContinuationButKeepsWholePcCreditUnknownAndNeverStartsLearning(String locale)throws Exception{
        f.addForeignUncoveredConsumer();var p=f.addPlan(List.of(f.block("today","A",TODAY,TODAY,true)));String blocks=p.getBlocksJson();long rev=f.learner.getCoachStateRevision();f.clearObservedWrites();
        var status=f.facade.getLearningPlanTodayStatus(ID,locale);
        assertThat(status.resumeAvailable()).isTrue();assertThat(status.automaticResumeAvailable()).isFalse();
        assertThat(status.evaluable()).isFalse();assertThat(status.noticeText()).isNotBlank();
        assertThat(status.subjects()).filteredOn(s->s.landscapeIds().contains(MATH)).allSatisfy(s->{assertThat(s.balance()).isNull();assertThat(s.planCreditText()).isNull();});
        assertThat(f.learners.getRichFrontier(ID)).isEmpty();assertThat(f.learner.getActiveGoalId()).isNull();assertThat(f.learner.getCoachStateRevision()).isEqualTo(rev);
        assertThat(f.graph.get("FOREIGN").getRequires()).containsExactly("A");assertThat(p.getBlocksJson()).isEqualTo(blocks);assertThat(f.mastery).isEmpty();assertNoReadWrites();
        var whole=f.learners.getLearningPlanCompletionContext(ID,Set.of("A"));assertThat(whole.level2TargetGoalIds()).contains("FOREIGN");assertThat(whole.canonicalGoals().get("FOREIGN").getRequires()).containsExactly("A");
    }

    @Test void explicitFacadeResumeUsesRealTransitionAndDoesNotRewriteScheduleOrMastery()throws Exception{
        f.addForeignUncoveredConsumer();var p=f.addPlan(List.of(f.block("today","A",TODAY,TODAY,true)));String captured=p.getBlocksJson();long rev=f.learner.getCoachStateRevision();f.clearObservedWrites();
        var result=f.facade.resumeLearningPlan(ID,"de");
        assertThat(result.changed()).isTrue();assertThat(result.activeGoalId()).isEqualTo("A");assertThat(f.learner.getActiveGoalId()).isEqualTo("A");assertThat(f.learner.getCoachStateRevision()).isEqualTo(rev+1);
        assertThat(f.focus).containsExactly("A");assertThat(f.mastery).isEmpty();assertThat(p.getBlocksJson()).isEqualTo(captured);assertThat(p.getRevision()).isEqualTo(1);
        verify(f.learnerRepository,atLeastOnce()).findBySkillpilotIdForUpdate(ID);verify(f.masteryRepository,never()).save(any());verify(f.planRepository,never()).saveAndFlush(any());verify(f.completions,never()).recordTransition(any(),anyString(),anyDouble(),anyDouble(),any());
    }

    @ParameterizedTest @ValueSource(strings={"continue","switch"})
    void continueAndSwitchExecuteTheirRealAtomicActivationUnderTypedFailure(String operation)throws Exception{
        f.addForeignUncoveredConsumer();var p=f.addPlan(List.of(f.block("today","A",TODAY,TODAY,true)));f.clearObservedWrites();
        var detail=f.plans.getPlan(ID,MATH,TODAY);assertThat(detail.planId()).isEqualTo(p.getId());assertThat(detail.revision()).isEqualTo(1);assertThat(detail.learningScope()).isNull();assertThat(detail.canContinue()).isTrue();assertThat(detail.nextEligibleGoal().goalId()).isEqualTo("A");
        if(operation.equals("continue"))assertThat(f.plans.continuePlan(ID,p.getId(),new LearnerLearningPlanApi.ContinueRequest(1L,TODAY)).activeGoalId()).isEqualTo("A");
        else assertThat(f.plans.switchPlan(ID,p.getId(),new LearnerLearningPlanApi.ContinueRequest(1L,TODAY)).activeGoalId()).isEqualTo("A");
        assertThat(f.learner.getActiveGoalId()).isEqualTo("A");assertThat(f.mastery).isEmpty();verify(f.masteryRepository,never()).save(any());
    }

    @Test void automaticReconcileAndAutopilotCannotUseTheExplicitAvailabilityAsRequiredWork()throws Exception{
        f.addForeignUncoveredConsumer();f.addPlan(List.of(f.block("today","A",TODAY,TODAY,true)));f.learner.setAutoPilot(true);f.clearObservedWrites();long rev=f.learner.getCoachStateRevision();
        var status=f.plans.getTodayStatus(ID,"de");assertThat(status.resumeAvailable()).isTrue();assertThat(status.automaticResumeAvailable()).isFalse();
        assertThat(f.plans.reconcile(ID,new LearnerLearningPlanApi.ReconcileRequest(TODAY)).changed()).isFalse();f.learners.getCoachLearnerState(ID);
        assertThat(f.learner.getActiveGoalId()).isNull();assertThat(f.learner.getCoachStateRevision()).isEqualTo(rev);assertThat(f.focus).containsExactly("ROOT");assertNoReadWrites();
    }

    @Test void anAlreadyActiveOrdinaryGoalIsNotReplacedByRepeatedResume()throws Exception{
        f.addForeignUncoveredConsumer();f.addPlan(List.of(f.block("today","D",TODAY,TODAY,true)));f.learner.setActiveGoalId("A");f.learner.setLearningState(LearningState.TEACHING);long rev=f.learner.getCoachStateRevision();f.clearObservedWrites();
        assertThat(f.learners.getCoachLearnerState(ID).activeGoal().id()).isEqualTo("A");
        assertThat(f.plans.resumeExplicitly(ID,new LearnerLearningPlanApi.ReconcileRequest(TODAY)).changed()).isFalse();
        assertThat(f.learner.getActiveGoalId()).isEqualTo("A");assertThat(f.learner.getCoachStateRevision()).isEqualTo(rev);assertThat(f.focus).containsExactly("ROOT");assertNoReadWrites();
    }

    @ParameterizedTest @ValueSource(strings={"missing-plan","future-plan","achieved-quota","stale-capture"})
    void explicitReachablePcLearningDoesNotRequireAKnownDeficitOrUsableSchedule(String schedule)throws Exception{
        f.addForeignUncoveredConsumer();
        switch(schedule){
            case "future-plan"->f.addPlan(List.of(f.block("future","A",TODAY.plusDays(7),TODAY.plusDays(7),true)));
            case "achieved-quota"->{f.mastery.put("A",1.0);f.addPlan(List.of(f.block("done","A",TODAY,TODAY,true)));f.completionHistory.add(new LearnerGoalCompletion(f.learner,"A",TODAY,Instant.parse("2026-11-02T09:00:00Z"),1.0));}
            case "stale-capture"->f.addPlan(List.of(f.block("old","REMOVED",TODAY,TODAY,true)));
            default->{}
        }
        Map<String,Double> mastery=Map.copyOf(f.mastery);int events=f.completionHistory.size();long rev=f.learner.getCoachStateRevision();
        var status=f.plans.getTodayStatus(ID,"en");assertThat(status.resumeAvailable()).isTrue();assertThat(status.automaticResumeAvailable()).isFalse();assertThat(f.learner.getActiveGoalId()).isNull();assertThat(f.learner.getCoachStateRevision()).isEqualTo(rev);
        var resumed=f.plans.resumeExplicitly(ID,new LearnerLearningPlanApi.ReconcileRequest(TODAY));assertThat(resumed.changed()).isTrue();assertThat(resumed.activeGoalId()).isIn("A","B","C","D");
        assertThat(f.mastery).isEqualTo(mastery);assertThat(f.completionHistory).hasSize(events);verify(f.masteryRepository,never()).save(any());
    }

    @Test void reliableDueDatesOrderReachableOptionsWithoutProvingTheyAreRequired()throws Exception{
        f.addForeignUncoveredConsumer();f.addPlan(List.of(f.block("earlier","D",TODAY.minusDays(3),TODAY.minusDays(3),true),f.block("later","A",TODAY.plusDays(7),TODAY.plusDays(7),true)));
        var result=f.plans.resumeExplicitly(ID,new LearnerLearningPlanApi.ReconcileRequest(TODAY));assertThat(result.activeGoalId()).isEqualTo("D");
        assertThat(f.mastery).isEmpty();assertThat(result.state().levelCompletion().complete()).isNull();
    }

    @ParameterizedTest @ValueSource(strings={"pause","inactive-only","stored-focus","active-exam","inactive-target","foreign-subject"})
    void theNewBranchCannotCrossExistingNavigationBoundaries(String boundary)throws Exception{
        f.addForeignUncoveredConsumer();f.learner.setStrictMode(true);
        if(boundary.equals("pause"))f.addPlan(List.of(new LearnerLearningPlanApi.Block("pause","buffer",null,"Pause",TODAY,TODAY,null,null,null,true)));
        else if(boundary.equals("inactive-only"))f.addPlan(List.of(f.block("inactive","A",TODAY,TODAY,false)));
        else f.addPlan(List.of(f.block("active","A",TODAY,TODAY,true)));
        if(boundary.equals("stored-focus")){f.focus.clear();f.focus.add("composition:removed:structure:missing");}
        if(boundary.equals("active-exam")){f.learner.setActiveGoalId("Q");f.learner.setLearningState(LearningState.TEACHING);}
        if(boundary.equals("inactive-target")){f.storedPlans.clear();f.mastery.put("A",1.0);f.addPlan(List.of(f.block("inactive-D","D",TODAY,TODAY,false),f.block("active-C","C",TODAY,TODAY,true)));}
        long revision=f.learner.getCoachStateRevision();String active=f.learner.getActiveGoalId();List<String> focus=List.copyOf(f.focus);f.clearObservedWrites();
        if(boundary.equals("foreign-subject"))assertThatThrownBy(()->f.plans.switchPersonalCurriculumSubject(ID,"not-selected-subject")).isInstanceOf(ResponseStatusException.class);
        else if(boundary.equals("inactive-target")){
            // B remains a legitimate prerequisite candidate; D may never bypass its explicit inactivity.
            var result=f.plans.resumeExplicitly(ID,new LearnerLearningPlanApi.ReconcileRequest(TODAY));assertThat(result.activeGoalId()).isNotEqualTo("D");return;
        }else{
            assertThat(f.plans.getTodayStatus(ID,"de").resumeAvailable()).isFalse();
            try{f.plans.resumeExplicitly(ID,new LearnerLearningPlanApi.ReconcileRequest(TODAY));}catch(ResponseStatusException rejected){assertThat(rejected.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);}
        }
        assertThat(f.learner.getActiveGoalId()).isEqualTo(active);assertThat(f.focus).isEqualTo(focus);assertThat(f.learner.getCoachStateRevision()).isEqualTo(revision);assertNoReadWrites();
    }

    @ParameterizedTest @ValueSource(booleans={false,true})
    void statusAndActualTransitionReuseStrictRecallDespiteRealLaterRepositoryFailures(boolean verified)throws Exception{
        f.addForeignUncoveredConsumer();f.addPlan(List.of(f.block("due-C","C",TODAY,TODAY,true)));f.strictMemory(verified,true);
        var status=f.plans.getTodayStatus(ID,"de");assertThat(status.evaluable()).isFalse();assertThat(status.automaticResumeAvailable()).isFalse();assertThat(status.resumeAvailable()).isTrue();assertThat(f.realLaterSrsFailures.get()).isPositive();assertThat(f.learner.getActiveGoalId()).isNull();
        // A new operation obtains one new strict input while every subsequent SRS query really fails.
        f.strictMemory(verified,true);var result=f.plans.resumeExplicitly(ID,new LearnerLearningPlanApi.ReconcileRequest(TODAY));
        assertThat(f.realLaterSrsFailures.get()).isPositive();assertThat(result.activeGoalId()).isEqualTo(verified?"C":"D");assertThat(f.learner.getActiveGoalId()).isEqualTo(verified?"C":"D");
        assertThat(f.mastery).isEqualTo(Map.of("A",1.0,"B",1.0));verify(f.masteryRepository,never()).save(any());
    }

    @ParameterizedTest @ValueSource(booleans={false,true})
    void theRealRawTransitionValidatesAgainstTheSameRetainedStrictMap(boolean verified){
        f.addForeignUncoveredConsumer();f.strictMemory(verified,true);var availability=f.learners.ordinaryLearningAvailability(ID);assertThat(availability).isNotNull();assertThat(availability.masterySnapshot()).containsEntry("B",verified?1.0:0.0);
        var ordinary=f.learners.ordinarySubjectOptions(ID,MATH,availability);assertThat(ordinary).extracting(FrontierGoal::id).doesNotContain("B","Q","FOREIGN");if(verified)assertThat(ordinary).extracting(FrontierGoal::id).contains("C");else assertThat(ordinary).extracting(FrontierGoal::id).doesNotContain("C");
        // Force a genuine tolerant repository failure after the strict input has been captured.
        f.learners.getMastery(ID);assertThat(f.realLaterSrsFailures.get()).isPositive();
        if(verified){var changed=f.learners.applyLearningPlanScopeTransition(ID,false,true,List.of("ROOT"),"C",true,"LEARNING_PLAN_RECONCILED",availability);assertThat(changed.changed()).isTrue();assertThat(f.learner.getActiveGoalId()).isEqualTo("C");}
        else assertThatThrownBy(()->f.learners.applyLearningPlanScopeTransition(ID,false,true,List.of("ROOT"),"C",true,"LEARNING_PLAN_RECONCILED",availability)).isInstanceOf(ResponseStatusException.class);
        assertThat(f.mastery).isEqualTo(Map.of("A",1.0,"B",1.0));verify(f.masteryRepository,never()).save(any());
    }

    @ParameterizedTest @ValueSource(strings={"revision","personal-curriculum","active-goal"})
    void staleOperationLocalAvailabilityCannotAuthorizeALaterWrite(String change){
        f.addForeignUncoveredConsumer();var offered=f.learners.ordinaryLearningAvailability(ID);assertThat(offered).isNotNull();
        switch(change){case "revision"->f.learner.setCoachStateRevision(f.learner.getCoachStateRevision()+1);case "personal-curriculum"->f.learner.setPersonalCurriculum("{}");case "active-goal"->f.learner.setActiveGoalId("D");}
        List<String> before=List.copyOf(f.focus);String active=f.learner.getActiveGoalId();
        assertThatThrownBy(()->f.learners.applyLearningPlanScopeTransition(ID,false,true,List.of("ROOT"),"A",true,"LEARNING_PLAN_RECONCILED",offered)).isInstanceOf(ResponseStatusException.class);
        assertThat(f.focus).isEqualTo(before);assertThat(f.learner.getActiveGoalId()).isEqualTo(active);verify(f.masteryRepository,never()).save(any());
    }

    @Test void aPublishedStatusDoesNotAuthorizeTheNowUnrecalledDependentGoal()throws Exception{
        f.addForeignUncoveredConsumer();var p=f.addPlan(List.of(f.block("C","C",TODAY,TODAY,true)));f.strictMemory(true,false);assertThat(f.plans.getTodayStatus(ID,"de").resumeAvailable()).isTrue();
        f.strictMemory(false,true);try{var changed=f.plans.continuePlan(ID,p.getId(),new LearnerLearningPlanApi.ContinueRequest(1L,TODAY));assertThat(changed.activeGoalId()).isNotEqualTo("C");}catch(ResponseStatusException rejection){assertThat(rejection.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);}assertThat(f.learner.getActiveGoalId()).isNotEqualTo("C");verify(f.masteryRepository,never()).save(any());
    }

    @Test void aCurrentBoundOrdinaryWorkflowRemainsReadableAndRequiresExplicitExitForANewChoice(){
        f.startCurrentOrdinaryWorkflow();f.addForeignUncoveredConsumer();long rev=f.learner.getCoachStateRevision();String workflow=f.learner.getCompletionWorkflow();f.clearObservedWrites();
        var state=CompletionCallContext.with(f.supported(),()->f.learners.getCoachLearnerState(ID));
        assertThat(state.levelCompletion().calculationStatus()).isEqualTo("invalid");
        assertThat(state.activeGoal()).as("Full current ordinary response: %s; stored workflow: %s",state,workflow).isNotNull();assertThat(state.activeGoal().id()).isEqualTo("A");assertThat(state.levelCompletion().complete()).isNull();assertThat(state.levelCompletion().notice()).isEqualTo("completion_target_routes_uncovered");
        assertThat(state.levelCompletion().actions()).anyMatch(a->a.action().equals("leaveProfile"));assertThat(state.levelCompletion().actions()).noneMatch(a->a.action().equals("learnGoal"));assertThat(f.learner.getCoachStateRevision()).isEqualTo(rev);assertThat(f.learner.getCompletionWorkflow()).isEqualTo(workflow);assertNoReadWrites();
        assertThatThrownBy(()->CompletionCallContext.with(f.supported(),()->f.learners.chooseLevelCompletion(ID,new LevelCompletionActionRequest("learnGoal",TypedUncoveredLearningFixture.PROFILE,"D","required",rev)))).isInstanceOf(ResponseStatusException.class);
        CompletionCallContext.with(f.supported(),()->f.facade.chooseLevelCompletion(ID,new LevelCompletionActionRequest("leaveProfile",null,null,null,rev)));
        assertThat(f.learner.getCompletionWorkflow()).isNull();assertThat(f.learner.getActiveGoalId()).isEqualTo("A");assertThat(f.learner.getFollowLearningPlans()).isTrue();assertThat(f.mastery).isEmpty();
    }

    @ParameterizedTest @ValueSource(strings={"paused","cursor-mismatch","unsupported-session","stale-generation","assessment","memory","unselected-support"})
    void currentWorkflowReadabilityCannotBecomeAnUntypedOrProtectedWorkaround(String boundary)throws Exception{
        f.startCurrentOrdinaryWorkflow();
        var workflow=f.mapper.readValue(f.learner.getCompletionWorkflow(),CompletionWorkflowState.class);
        switch(boundary){
            case "paused"->f.learner.setCompletionWorkflow(f.mapper.writeValueAsString(workflow.withNavigation("paused",null)));
            case "cursor-mismatch"->f.learner.setActiveGoalId("D");
            case "stale-generation"->f.learner.setCompletionWorkflow(f.mapper.writeValueAsString(new CompletionWorkflowState(workflow.profileId(),workflow.profileRevision(),"stale-generation",workflow.curriculumId(),workflow.personalCurriculumDigest(),workflow.navigationIntent(),workflow.currentGoalId(),null)));
            case "assessment"->{f.graph.get("A").setNodeKind("exam");f.graph.get("A").setExamData(f.graph.get("Q").getExamData());}
            case "memory"->{f.graph.get("A").setNodeKind("memory");}
            case "unselected-support"->f.hideSelectedTarget("A");
        }
        f.addForeignUncoveredConsumer();long rev=f.learner.getCoachStateRevision();String active=f.learner.getActiveGoalId();
        var call=boundary.equals("unsupported-session")?new CompletionCallContext("claude","owner",Instant.now().plusSeconds(600),false):f.supported();
        var state=CompletionCallContext.with(call,()->f.learners.getCoachLearnerState(ID));assertThat(state.activeGoal()).isNull();assertThat(f.learner.getActiveGoalId()).isEqualTo(active);assertThat(f.learner.getCoachStateRevision()).isEqualTo(rev);verify(f.masteryRepository,never()).save(any());
    }

    @ParameterizedTest @ValueSource(strings={"missing-reference","cycle","catalog-unavailable","srs-unavailable"})
    void everyNonUncoveredFailureStillRefusesTheNewPlanAvailability(String failure)throws Exception{
        f.addForeignUncoveredConsumer();f.addPlan(List.of(f.block("A","A",TODAY,TODAY,true)));
        switch(failure){
            case "missing-reference"->f.graph.get("FOREIGN").setRequires(List.of("A","MISSING"));
            case "cycle"->f.graph.get("FOREIGN").setRequires(List.of("FOREIGN"));
            case "catalog-unavailable"->{ReflectionTestUtils.setField(f.automatic.catalog(),"available",false);}
            case "srs-unavailable"->{f.strictMemory(false,true);doThrow(new IllegalStateException("SRS wholly unavailable")).when(f.srs).findByLearnerAndNodeIds(anyString(),any());}
        }
        long rev=f.learner.getCoachStateRevision();f.clearObservedWrites();assertThat(f.learners.ordinaryLearningAvailability(ID)).isNull();var status=f.plans.getTodayStatus(ID,"de");assertThat(status.resumeAvailable()).isFalse();
        assertThatThrownBy(()->f.facade.resumeLearningPlan(ID,"de")).isInstanceOf(ResponseStatusException.class);assertThat(f.learner.getActiveGoalId()).isNull();assertThat(f.learner.getCoachStateRevision()).isEqualTo(rev);assertNoReadWrites();
    }


    @Test void actualResumeUsesTheWholePlanGlobalDueSlotsRatherThanEachBlockIndependently()throws Exception{
        for(String id:List.of("long-1","long-2","short-1","short-2"))f.graph.put(id,TypedUncoveredLearningFixture.atom(id));
        f.graph.get("long-2").setRequires(List.of("long-1"));f.graph.get("short-2").setRequires(List.of("short-1"));
        f.graph.get("Q").setRequires(List.of("C","D","long-2","short-2"));f.graph.get("ROOT").setContains(List.of("A","B","C","D","Q","long-1","long-2","short-1","short-2"));
        f.addForeignUncoveredConsumer();for(String id:List.of("A","B","C","D","short-1"))f.mastery.put(id,1.0);
        var longBlock=new LearnerLearningPlanApi.Block("long-block","learning",null,"Long",LocalDate.of(2026,9,7),LocalDate.of(2026,9,11),null,List.of("long-1","long-2"));
        var shortBlock=new LearnerLearningPlanApi.Block("short-block","learning",null,"Short",LocalDate.of(2026,9,8),LocalDate.of(2026,9,9),null,List.of("short-1","short-2"));
        var p=f.addPlan(List.of(longBlock,shortBlock));String before=p.getBlocksJson();
        var wholeSchedule=LearnerLearningPlanService.scheduledAtomicGoalDueDatesForSchedule(List.of(longBlock,shortBlock));
        assertThat(wholeSchedule).containsEntry("short-2",LocalDate.of(2026,9,8)).containsEntry("long-1",LocalDate.of(2026,9,9));
        var result=f.plans.resumeExplicitly(ID,new LearnerLearningPlanApi.ReconcileRequest(TODAY));
        assertThat(result.activeGoalId()).isEqualTo("short-2");assertThat(f.learner.getActiveGoalId()).isEqualTo("short-2");assertThat(p.getBlocksJson()).isEqualTo(before);verify(f.masteryRepository,never()).save(any());
    }

    @Test void anUnusableWeekendScheduleCannotInventDatesButStillAllowsExplicitProvenPcWork()throws Exception{
        f.addForeignUncoveredConsumer();var weekend=new LearnerLearningPlanApi.Block("weekend","learning","D","Invalid schedule",LocalDate.of(2026,10,31),LocalDate.of(2026,11,1),null,List.of("D"),List.of("D"),true);
        var p=f.addPlan(List.of(weekend));String before=p.getBlocksJson();long revision=f.learner.getCoachStateRevision();
        var status=f.plans.getTodayStatus(ID,"en");assertThat(f.learner.getActiveGoalId()).isNull();assertThat(f.learner.getCoachStateRevision()).isEqualTo(revision);assertThat(status.automaticResumeAvailable()).isFalse();
        var result=f.plans.resumeExplicitly(ID,new LearnerLearningPlanApi.ReconcileRequest(TODAY));
        // The invalid schedule contributes no reliable date: free ordinary ID order chooses A, not falsely scheduled D.
        assertThat(result.activeGoalId()).isEqualTo("A");assertThat(p.getBlocksJson()).isEqualTo(before);assertThat(f.mastery).isEmpty();verify(f.masteryRepository,never()).save(any());
    }

    @ParameterizedTest @ValueSource(strings={"correct-owner","wrong-owner","expired","unready"})
    void theOrdinaryWorkflowExceptionPreservesTheExistingDirectExamOwnershipBoundary(String kind)throws Exception{
        f.addForeignUncoveredConsumer(); // Complete current Canon before first direct-start compilation.
        f.learners.startCompletionAssessment(ID,new CompletionAssessmentStart(TypedUncoveredLearningFixture.PROFILE,"Q",f.learner.getCoachStateRevision()),"claude","owner",Instant.now().plusSeconds(600));
        if(kind.equals("expired")){
            var w=f.mapper.readValue(f.learner.getCompletionWorkflow(),CompletionWorkflowState.class);
            f.learner.setCompletionWorkflow(f.mapper.writeValueAsString(w.withDirectAssessment(new CompletionWorkflowState.DirectAssessmentContext("claude","owner","Q",Instant.now().minusSeconds(1)))));
        }
        if(kind.equals("unready"))f.graph.get("Q").getExamData().setReviewStatus("draft");
        f.addForeignUncoveredConsumer();long revision=f.learner.getCoachStateRevision();String navigation=f.learner.getCompletionWorkflow();
        var call=new CompletionCallContext("claude",kind.equals("wrong-owner")?"different-session":"owner",Instant.now().plusSeconds(600),true);
        var state=CompletionCallContext.with(call,()->f.learners.getCoachLearnerState(ID));
        if(kind.equals("correct-owner")) {
            assertThat(state.levelCompletion().calculationStatus()).isEqualTo("invalid");
            assertThat(state.levelCompletion().notice()).isEqualTo("completion_target_routes_uncovered");
            assertThat(state.activeGoal()).as("Full current owner response: %s; stored workflow: %s",state,f.learner.getCompletionWorkflow()).isNotNull();
            assertThat(state.activeGoal().id()).isEqualTo("Q");
        } else assertThat(state.activeGoal()).isNull();
        assertThat(f.learners.ordinaryLearningAvailability(ID)).isNull();assertThat(f.learner.getCompletionWorkflow()).isEqualTo(navigation);assertThat(f.learner.getCoachStateRevision()).isEqualTo(revision);verify(f.masteryRepository,never()).save(any());
    }


    @ParameterizedTest @ValueSource(booleans={false,true})
    void aBlockedPhysicsExamBlocksGlobalResumeButAllowsAnExplicitNamedMathSwitch(boolean storedMathPlan)throws Exception{
        f.addForeignUncoveredConsumer();f.learner.setStrictMode(true);f.focus.clear();f.focus.add("FOREIGN");
        var inactivePhysics=f.block("physics-general","FOREIGN",TODAY.minusDays(30),TODAY.plusYears(1),false);
        var exam=new LearnerLearningPlanApi.Block("physics-exam","milestone",null,"Physics exam",null,null,TODAY.plusDays(5),null,List.of("FOREIGN"),true);
        var physicsPlan=f.addPlan(TypedUncoveredLearningFixture.PHYSICS,List.of(inactivePhysics,exam));
        if(storedMathPlan)f.addPlan(List.of(f.block("math","A",TODAY,TODAY,true)));
        String physicsBlocks=physicsPlan.getBlocksJson();long revision=f.learner.getCoachStateRevision();f.clearObservedWrites();
        var status=f.facade.getLearningPlanTodayStatus(ID,"de");
        assertThat(status.resumeAvailable()).isFalse();assertThat(status.automaticResumeAvailable()).isFalse();
        assertThat(status.subjects()).filteredOn(su->su.landscapeIds().contains(MATH)).singleElement().satisfies(su->{
            assertThat(su.canContinue()).isTrue();assertThat(su.evaluable()).isFalse();assertThat(su.balance()).isNull();assertThat(su.planCreditText()).isNull();
            if(!storedMathPlan)assertThat(su.periodGauge()).isNull();
        });
        assertThatThrownBy(()->f.facade.resumeLearningPlan(ID,"de")).isInstanceOf(ResponseStatusException.class);
        assertThat(f.learner.getActiveGoalId()).isNull();assertThat(f.focus).containsExactly("FOREIGN");assertThat(f.learner.getCoachStateRevision()).isEqualTo(revision);assertNoReadWrites();
        var changed=f.facade.switchLearningPlanSubject(ID,"de","Mathematik");
        assertThat(changed.landscapeId()).isEqualTo(MATH);assertThat(changed.activeGoalId()).isEqualTo("A");assertThat(f.learner.getActiveGoalId()).isEqualTo("A");assertThat(physicsPlan.getBlocksJson()).isEqualTo(physicsBlocks);assertThat(f.mastery).isEmpty();verify(f.masteryRepository,never()).save(any());
    }


    @Test void finishingTheCurrentOrdinaryWorkflowGoalDoesNotAutomaticallySelectAnotherUncoveredRoute(){
        f.startCurrentOrdinaryWorkflow();f.addForeignUncoveredConsumer();f.learner.setAutoPilot(true);
        CompletionCallContext.with(f.supported(),()->f.learners.setMastery(ID,new MasteryUpdateRequest(Map.of("A",1.0),"A")));
        assertThat(f.mastery).isEqualTo(Map.of("A",1.0));assertThat(f.learner.getActiveGoalId()).isIn((String)null,"A");
        var state=CompletionCallContext.with(f.supported(),()->f.learners.getCoachLearnerState(ID));assertThat(state.levelCompletion().complete()).isNull();
        if(state.activeGoal()!=null)assertThat(state.activeGoal().id()).isEqualTo("A");
        assertThat(state.frontier()).isEmpty();assertThat(f.learner.getFollowLearningPlans()).isTrue();
    }


    @ParameterizedTest @ValueSource(booleans={false,true})
    void withoutAPlanStatusAndFacadeResumePublishOnlyTheStrictlyProvenCapability(boolean verified){
        onlyCMayBeAnOrdinaryOption(verified);
        var status=f.facade.getLearningPlanTodayStatus(ID,"de");
        assertThat(status.resumeAvailable()).isEqualTo(verified);assertThat(status.automaticResumeAvailable()).isFalse();
        assertThat(status.subjects()).filteredOn(su->su.landscapeIds().contains(MATH)).allSatisfy(su->{assertThat(su.canContinue()).isEqualTo(verified);assertThat(su.balance()).isNull();assertThat(su.evaluable()).isFalse();});
        if(verified)assertThat(status.subjects()).anyMatch(su->su.landscapeIds().contains(MATH)&&su.canContinue());
        assertThat(f.learner.getActiveGoalId()).isNull();assertThat(f.storedPlans).isEmpty();
        f.learners.getMastery(ID);assertThat(f.realLaterSrsFailures.get()).isPositive();
        f.strictMemoryPerOperation(verified);f.mastery.put("D",1.0);
        if(verified){var result=f.facade.resumeLearningPlan(ID,"de");assertThat(result.activeGoalId()).isEqualTo("C");assertThat(f.learner.getActiveGoalId()).isEqualTo("C");}
        else{assertThatThrownBy(()->f.facade.resumeLearningPlan(ID,"de")).isInstanceOf(ResponseStatusException.class);assertThat(f.learner.getActiveGoalId()).isNull();}
        assertThat(f.storedPlans).isEmpty();assertThat(f.mastery).isEqualTo(Map.of("A",1.0,"B",1.0,"D",1.0));verify(f.masteryRepository,never()).save(any());
    }

    @ParameterizedTest @ValueSource(booleans={false,true})
    void withoutAPlanNamedSubjectSwitchIsAlsoARealStrictCapabilityNotATolerantRead(boolean verified){
        onlyCMayBeAnOrdinaryOption(verified);
        var before=f.facade.getLearningPlanTodayStatus(ID,"en");assertThat(before.resumeAvailable()).isEqualTo(verified);assertThat(f.learner.getActiveGoalId()).isNull();
        f.learners.getMastery(ID);assertThat(f.realLaterSrsFailures.get()).isPositive();f.strictMemoryPerOperation(verified);f.mastery.put("D",1.0);
        if(verified){var switched=f.facade.switchLearningPlanSubject(ID,"de","Mathematik");assertThat(switched.landscapeId()).isEqualTo(MATH);assertThat(switched.activeGoalId()).isEqualTo("C");}
        else{assertThatThrownBy(()->f.facade.switchLearningPlanSubject(ID,"de","Mathematik")).isInstanceOf(ResponseStatusException.class);assertThat(f.learner.getActiveGoalId()).isNull();}
        assertThat(f.storedPlans).isEmpty();verify(f.masteryRepository,never()).save(any());
    }

    private void onlyCMayBeAnOrdinaryOption(boolean verified){
        f.addForeignUncoveredConsumer();f.graph.get("FOREIGN").setRequires(List.of("A","Q"));
        f.strictMemoryPerOperation(verified);f.mastery.put("D",1.0);
        // All ordinary math targets except C are mastered or protected-memory B.
        // The genuine foreign endpoint still invalidates the full PC but cannot be a free alternative while Q=0.
    }

    @Test void typedFailurePlanDetailRetainsItsMetadataWithoutInventingScopeOrEligibility()throws Exception{
        f.addForeignUncoveredConsumer();f.graph.get("FOREIGN").setRequires(List.of("A","Q"));f.learner.setStrictMode(true);
        for(String id:List.of("A","B","C","D"))f.mastery.put(id,1.0);
        var p=f.addPlan(List.of(f.block("captured-A","A",TODAY,TODAY,true)));String body=p.getBlocksJson();long revision=f.learner.getCoachStateRevision();f.clearObservedWrites();
        var detail=f.plans.getPlan(ID,MATH,TODAY);
        assertThat(detail.planId()).isEqualTo(p.getId());assertThat(detail.revision()).isEqualTo(1);assertThat(detail.planLabel()).isEqualTo("Synthetic plan");assertThat(detail.stale()).isFalse();
        assertThat(f.mapper.writeValueAsString(detail.blocks())).isEqualTo(body);assertThat(detail.learningScope()).isNull();assertThat(detail.nextEligibleGoal()).isNull();assertThat(detail.canContinue()).isFalse();assertThat(detail.continueReason()).isEqualTo("assessment-coverage-unavailable");
        assertThat(f.learner.getCoachStateRevision()).isEqualTo(revision);assertThat(f.learner.getActiveGoalId()).isNull();assertNoReadWrites();
    }

    @ParameterizedTest @ValueSource(booleans={false,true})
    void actualCurrentSubjectIsRetainedWithoutAnyFurtherOrdinaryOption(boolean hasPlan)throws Exception {
        f.addForeignUncoveredConsumer(); f.graph.get("FOREIGN").setRequires(List.of("A","Q"));
        f.strictMemory(false,false); f.mastery.put("C",1.0); f.graph.get("D").setRequires(List.of("B"));
        if(hasPlan) f.addPlan(List.of(f.block("current-D","D",TODAY,TODAY,true)));
        f.learner.setActiveGoalId("D"); f.learner.setLearningState(LearningState.TEACHING); f.clearObservedWrites();
        long revision=f.learner.getCoachStateRevision();
        var status=f.plans.getTodayStatus(ID,"en");
        assertThat(status.activeGoal()).isNotNull(); assertThat(status.activeGoal().goalId()).isEqualTo("D");
        assertThat(status.subjects()).filteredOn(subject->subject.landscapeIds().contains(MATH)).singleElement().satisfies(subject->{
            assertThat(subject.current()).isTrue(); assertThat(subject.canContinue()).isFalse();
            assertThat(subject.evaluable()).isFalse(); assertThat(subject.balance()).isNull();
        });
        assertThat(status.resumeAvailable()).isFalse(); assertThat(status.automaticResumeAvailable()).isFalse();
        assertThat(f.learner.getActiveGoalId()).isEqualTo("D"); assertThat(f.learner.getCoachStateRevision()).isEqualTo(revision);
        assertNoReadWrites();
    }

    @ParameterizedTest @ValueSource(booleans={false,true})
    void collectionStatusAndPlanSummaryUseTheSameStrictZeroOrOneDespiteLaterFailures(boolean verified)throws Exception {
        f.addForeignUncoveredConsumer(); f.graph.get("FOREIGN").setRequires(List.of("A","Q"));
        f.strictMemory(verified,false); f.mastery.put("D",1.0);
        var plan=f.addPlan(List.of(f.block("C","C",TODAY,TODAY,true)));
        f.strictMemoryPerOperation(verified); f.mastery.put("D",1.0); f.clearObservedWrites();
        var response=f.plans.getPlans(ID,TODAY,"en");
        assertThat(response.plans()).singleElement().satisfies(summary->{
            assertThat(summary.planId()).isEqualTo(plan.getId()); assertThat(summary.revision()).isEqualTo(plan.getRevision());
            assertThat(summary.learningScope()).isNull(); assertThat(summary.canContinue()).isEqualTo(verified);
            if(verified)assertThat(summary.nextEligibleGoal().goalId()).isEqualTo("C");
            else { assertThat(summary.nextEligibleGoal()).isNull(); assertThat(summary.continueReason()).isEqualTo("assessment-coverage-unavailable"); }
        });
        assertThat(response.status().resumeAvailable()).isEqualTo(verified);
        assertThat(response.status().subjects()).filteredOn(subject->subject.landscapeIds().contains(MATH)).singleElement()
                .satisfies(subject->assertThat(subject.canContinue()).isEqualTo(verified));
        assertThat(f.realLaterSrsFailures.get()).isPositive(); assertNoReadWrites();
    }

    @ParameterizedTest @ValueSource(strings={"status","collection","detail"})
    void firstStrictRefusalCannotBeReopenedByLaterSuccessfulReadsInTheSameOperation(String reader)throws Exception {
        // This graph is route-valid: a transient first strict read, not UNCOVERED, is the failure.
        f.strictMemory(true,false); f.addPlan(List.of(f.block("C","C",TODAY,TODAY,true)));
        f.refuseFirstStrictThenRecover(); f.clearObservedWrites();
        switch(reader){
            case "status"->{ var status=f.plans.getTodayStatus(ID,"de"); assertThat(status.resumeAvailable()).isFalse();
                assertThat(status.subjects()).allSatisfy(subject->assertThat(subject.canContinue()).isFalse()); }
            case "collection"->{ var response=f.plans.getPlans(ID,TODAY,"de"); assertThat(response.status().resumeAvailable()).isFalse();
                assertThat(response.plans()).isEmpty(); }
            default->assertThatThrownBy(()->f.plans.getPlan(ID,MATH,TODAY)).isInstanceOf(ResponseStatusException.class)
                    .satisfies(error->assertThat(((ResponseStatusException)error).getStatusCode()).isEqualTo(HttpStatus.CONFLICT));
        }
        assertThat(f.refusedStrictReads.get()).isPositive();
        if(!reader.equals("detail"))assertThat(f.recoveredStrictReads.get()).isPositive();
        assertThat(f.learner.getActiveGoalId()).isNull(); assertNoReadWrites();
    }

    @Test void aPartialCanonicalRefreshCannotMasqueradeAsAProvenUncoveredContext() {
        CompletionCallContext.with(f.supported(),()->{
            f.facade.resumeLearningPlan(ID,"de");
            return f.learners.chooseLevelCompletion(ID,new LevelCompletionActionRequest("selectProfile",
                    TypedUncoveredLearningFixture.PROFILE,null,null,f.learner.getCoachStateRevision()));
        });
        // This deliberately reconstructs the original bad arrangement: the immutable
        // Canon cache lacks the newly attached projection target. It must stay closed.
        f.addForeignUncoveredConsumer(); f.clearObservedWrites();
        var state=CompletionCallContext.with(f.supported(),()->f.learners.getCoachLearnerState(ID));
        assertThat(state.activeGoal()).isNull();
        assertThat(state.levelCompletion().calculationStatus()).isEqualTo("invalid");
        assertThat(state.levelCompletion().notice()).isEqualTo("completion_profile_invalid");
        assertThat(f.learner.getActiveGoalId()).isEqualTo("A"); assertNoReadWrites();
    }

    private void assertNoReadWrites(){verify(f.masteryRepository,never()).save(any());verify(f.focusRepository,never()).save(any());verify(f.focusRepository,never()).deleteAll(any());verify(f.planRepository,never()).save(any());verify(f.planRepository,never()).saveAndFlush(any());verify(f.events,never()).publishEvent(any(Object.class));}
}
