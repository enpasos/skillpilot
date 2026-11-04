package com.skillpilot.backend.service;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.ai.CoachStateProjection;
import com.skillpilot.backend.ai.CoachToolFacade;
import com.skillpilot.backend.api.*;
import com.skillpilot.backend.completion.*;
import com.skillpilot.backend.domain.*;
import com.skillpilot.backend.landscape.*;
import com.skillpilot.backend.repository.*;
import com.skillpilot.backend.service.learningplan.PeriodBasis;
import java.nio.charset.StandardCharsets;
import java.time.*;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.test.util.ReflectionTestUtils;

/** Real compilation, availability and transition code; only persistence/catalog I/O is synthetic. */
final class TypedUncoveredLearningFixture {
    static final String ID="typed-uncovered-learner", MATH="base", PHYSICS="physics", PROFILE="automatic:personal-curriculum";
    static final LocalDate TODAY=LocalDate.of(2026,11,2);
    final ObjectMapper mapper=new ObjectMapper().findAndRegisterModules();
    final Map<String,LearningGoal> graph=new LinkedHashMap<>();
    final Map<String,Double> mastery=new LinkedHashMap<>();
    final Set<String> unselectedCatalogIds=new HashSet<>();
    final List<String> focus=new ArrayList<>(List.of("ROOT"));
    final List<LearnerLearningPlan> storedPlans=new ArrayList<>();
    final List<LearnerGoalCompletion> completionHistory=new ArrayList<>();
    final Learner learner=new Learner();
    final LearnerRepository learnerRepository=mock(LearnerRepository.class);
    final MasteryRepository masteryRepository=mock(MasteryRepository.class);
    final PlannedGoalRepository focusRepository=mock(PlannedGoalRepository.class);
    final LearnerClientStateRepository srs=mock(LearnerClientStateRepository.class);
    final LearnerLearningPlanRepository planRepository=mock(LearnerLearningPlanRepository.class);
    final LandscapeService landscapes=mock(LandscapeService.class);
    final ApplicationEventPublisher events=mock(ApplicationEventPublisher.class);
    final DeckResourceService decks=mock(DeckResourceService.class);
    final LearnerGoalCompletionService completions=mock(LearnerGoalCompletionService.class);
    final LearnerService learners;
    final LearnerLearningPlanService plans;
    final CoachToolFacade facade;
    final CompletionApplicationService automatic;
    final SkillLandscape math=new SkillLandscape(),physics=new SkillLandscape();
    final AtomicInteger srsReads=new AtomicInteger(),realLaterSrsFailures=new AtomicInteger();

    TypedUncoveredLearningFixture() {
        graph.put("A",atom("A")); graph.put("B",atom("B","A")); graph.put("C",atom("C","B"));
        graph.put("D",atom("D")); graph.put("Q",atom("Q","C","D")); graph.get("Q").setNodeKind("exam");
        LearningGoal root=atom("ROOT");root.setContains(List.of("A","B","C","D","Q"));graph.put("ROOT",root);
        readyExam();
        learner.setSkillpilotId(ID);learner.setSelectedCurriculum(MATH);learner.setFollowLearningPlans(true);
        learner.setLearningPlanPeriodBasis(PeriodBasis.DAY);learner.setLearningState(LearningState.FRONTIER);learner.setAutoPilot(false);
        when(learnerRepository.findById(ID)).thenReturn(Optional.of(learner));
        when(learnerRepository.findBySkillpilotIdForUpdate(ID)).thenReturn(Optional.of(learner));
        when(learnerRepository.existsById(ID)).thenReturn(true);when(learnerRepository.save(any())).thenAnswer(i->i.getArgument(0));
        when(masteryRepository.findByLearner_SkillpilotId(ID)).thenAnswer(i->mastery.entrySet().stream().map(e->new Mastery(learner,e.getKey(),e.getValue())).toList());
        when(masteryRepository.save(any())).thenAnswer(i->{Mastery value=i.getArgument(0);mastery.put(value.getGoalKey(),value.getValue());return value;});
        when(focusRepository.findByLearner_SkillpilotId(ID)).thenAnswer(i->focus.stream().map(id->new PlannedGoal(learner,id)).toList());
        doAnswer(i->{Iterable<PlannedGoal> rows=i.getArgument(0);rows.forEach(row->focus.remove(row.getGoalId()));return null;}).when(focusRepository).deleteAll(any());
        when(focusRepository.save(any())).thenAnswer(i->{PlannedGoal value=i.getArgument(0);focus.add(value.getGoalId());return value;});
        when(planRepository.findByLearner_SkillpilotIdOrderByLandscapeIdAsc(ID)).thenAnswer(i->List.copyOf(storedPlans));
        when(planRepository.findByLearner_SkillpilotIdAndLandscapeId(eq(ID),anyString())).thenAnswer(i->storedPlans.stream().filter(p->p.getLandscapeId().equals(i.getArgument(1))).findFirst());
        when(planRepository.findByIdForUpdate(eq(ID),any())).thenAnswer(i->storedPlans.stream().filter(p->p.getId().equals(i.getArgument(1))).findFirst());
        when(planRepository.findForUpdate(eq(ID),anyString())).thenAnswer(i->storedPlans.stream().filter(p->p.getLandscapeId().equals(i.getArgument(1))).findFirst());
        when(planRepository.saveAndFlush(any())).thenAnswer(i->{LearnerLearningPlan p=i.getArgument(0);if(!storedPlans.contains(p))storedPlans.add(p);return p;});
        when(landscapes.getById(MATH)).thenReturn(math);when(landscapes.getById(PHYSICS)).thenReturn(physics);
        when(landscapes.getGoalDefinition(anyString())).thenAnswer(i->graph.get(i.getArgument(0)));
        when(landscapes.getLandscapeIdForGoal(anyString())).thenAnswer(i->"FOREIGN".equals(i.getArgument(0))?PHYSICS:MATH);
        when(landscapes.getOverview(anyString(),anyBoolean())).thenReturn(new LandscapeOverviewResponse(List.of(),Map.of()));
        refreshCatalog();
        learners=new LearnerService(learnerRepository,srs,masteryRepository,focusRepository,landscapes,
                mock(GoalMappingService.class),decks,mapper,events);
        automatic=new CompletionApplicationService(new CompletionProfileCatalog(Map.of(),Map.of(),"typed-access-generation",true));
        ReflectionTestUtils.setField(learners,"completionApplicationService",automatic);
        var resolver=mock(CompletionCanonicalGraphResolver.class);when(resolver.load(MATH)).thenReturn(graph);
        ReflectionTestUtils.setField(learners,"completionCanonicalGraphResolver",resolver);
        ReflectionTestUtils.setField(learners,"goalCompletionService",completions);
        when(completions.getCompletionsOnDate(eq(ID),any())).thenAnswer(i->List.copyOf(completionHistory));
        when(completions.getCompletionsBetween(eq(ID),any(),any())).thenAnswer(i->List.copyOf(completionHistory));
        when(completions.getHistory(ID)).thenAnswer(i->List.copyOf(completionHistory));
        plans=new LearnerLearningPlanService(planRepository,learners,mapper,events,landscapes,
                Clock.fixed(TODAY.atTime(12,0).toInstant(ZoneOffset.UTC),ZoneOffset.UTC));
        ReflectionTestUtils.setField(learners,"learnerLearningPlanRepository",planRepository);
        facade=new CoachToolFacade(learners,null,new CoachStateProjection("https://skillpilot.test"),null,plans);
    }
    void refreshCatalog(){
        math.setLandscapeId(MATH);math.setTitle("Mathematik");math.setSubject("Mathematik");
        math.setGoals(graph.values().stream().filter(g->!"FOREIGN".equals(g.getId())&&!unselectedCatalogIds.contains(g.getId())).toList());
        physics.setLandscapeId(PHYSICS);physics.setTitle("Physik");physics.setSubject("Physik");
        physics.setGoals(graph.containsKey("FOREIGN")?List.of(graph.get("FOREIGN")):List.of());
        var closure=graph.containsKey("FOREIGN")?List.of(math,physics):List.of(math);
        when(landscapes.getClosure(MATH)).thenReturn(closure);when(landscapes.getAll()).thenReturn(closure);
    }
    void addForeignUncoveredConsumer(){graph.put("FOREIGN",atom("FOREIGN","A"));refreshCatalog();}
    void hideSelectedTarget(String id){unselectedCatalogIds.add(id);graph.get("ROOT").setContains(graph.get("ROOT").getContains().stream().filter(x->!x.equals(id)).toList());refreshCatalog();}
    void readyExam(){
        var task=new ExamData();task.setReviewStatus("released");task.setTaskContent("Synthetic exam task.");task.setSolutionContent("Protected synthetic solution.");
        var scoring=new ExamData.Scoring();scoring.setMaxPoints(1.0);scoring.setPassingPoints(1.0);
        var step=new ExamData.Step();step.setId("answer");step.setPoints(1.0);step.setDescription("A valid answer.");scoring.setSteps(List.of(step));task.setScoring(scoring);graph.get("Q").setExamData(task);
    }
    LearnerLearningPlan addPlan(List<LearnerLearningPlanApi.Block> blocks)throws Exception{return addPlan(MATH,blocks);}
    LearnerLearningPlan addPlan(String landscape,List<LearnerLearningPlanApi.Block> blocks)throws Exception{
        var p=new LearnerLearningPlan();p.setId(UUID.randomUUID());p.setLearner(learner);p.setCurriculumId(MATH);p.setLandscapeId(landscape);p.setRevision(1);p.setPlanLabel("Synthetic plan");p.setCapturedAt(Instant.parse("2026-11-02T08:00:00Z"));p.setBlocksJson(mapper.writeValueAsString(blocks));storedPlans.add(p);return p;
    }
    LearnerLearningPlanApi.Block block(String id,String target,LocalDate start,LocalDate end,boolean active){return new LearnerLearningPlanApi.Block(id,"learning",target,"Plan "+target,start,end,null,List.of(target),List.of(target),active);}
    void strictMemory(boolean verified,boolean failAllLaterReads){
        graph.get("B").setNodeKind("memory");graph.get("B").setExtendedData(Map.of("vocabularySource","synthetic-memory.json"));
        mastery.put("A",1.0);mastery.put("B",1.0);learner.setStrictMode(true);
        when(decks.resolveDeckResource("B","synthetic-memory.json")).thenReturn(new ByteArrayResource("{\"cards\":[{\"id\":\"card\",\"front\":\"Question\",\"back\":\"Answer\",\"tags\":[\"memorization\"]}]}".getBytes(StandardCharsets.UTF_8)));
        var recall=new LearnerClientState(learner,"B","{\"card\":{\"verifiedRecall\":{\"status\":\"passed\",\"passedAt\":\"2026-10-29T12:00:00Z\"}}}",Instant.parse("2026-10-29T12:00:00Z"));
        srsReads.set(0);realLaterSrsFailures.set(0);
        doAnswer(i->{
            if(srsReads.incrementAndGet()==1||!failAllLaterReads)return verified?List.of(recall):List.of();
            realLaterSrsFailures.incrementAndGet();throw new IllegalStateException("Actual later SRS repository failure");
        }).when(srs).findByLearnerAndNodeIds(anyString(),any());refreshCatalog();
    }

    /** One real strict repository response per public operation; all later reads fail. */
    void strictMemoryPerOperation(boolean verified){
        strictMemory(verified,false);
        var recall=new LearnerClientState(learner,"B","{\"card\":{\"verifiedRecall\":{\"status\":\"passed\",\"passedAt\":\"2026-10-29T12:00:00Z\"}}}",Instant.parse("2026-10-29T12:00:00Z"));
        Set<String> supplied=new HashSet<>();srsReads.set(0);realLaterSrsFailures.set(0);
        doAnswer(i->{
            srsReads.incrementAndGet();var frames=Thread.currentThread().getStackTrace();
            boolean strict=Arrays.stream(frames).anyMatch(x->x.getClassName().equals(LearnerService.class.getName())&&x.getMethodName().equals("resolveSrsMasterySnapshot"));
            Set<String> entries=Set.of("getTodayStatus","getPlan","getPlans","resumeExplicitly","continuePlan","switchPlan","switchPersonalCurriculumSubject");
            String operation=Arrays.stream(frames).filter(x->x.getClassName().equals(LearnerLearningPlanService.class.getName())&&entries.contains(x.getMethodName())).map(StackTraceElement::getMethodName).findFirst().orElse("direct-service");
            if(strict&&supplied.add(operation))return verified?List.of(recall):List.of();
            if(!supplied.isEmpty())realLaterSrsFailures.incrementAndGet();
            throw new IllegalStateException("Actual SRS failure outside the one retained strict snapshot per public operation");
        }).when(srs).findByLearnerAndNodeIds(anyString(),any());
    }

    final AtomicInteger refusedStrictReads = new AtomicInteger(), recoveredStrictReads = new AtomicInteger();
    void refuseFirstStrictThenRecover() {
        var recall = new LearnerClientState(learner, "B",
                "{\"card\":{\"verifiedRecall\":{\"status\":\"passed\",\"passedAt\":\"2026-10-29T12:00:00Z\"}}}",
                Instant.parse("2026-10-29T12:00:00Z"));
        Set<String> refused = new HashSet<>();
        doAnswer(invocation -> {
            var frames = Thread.currentThread().getStackTrace();
            boolean strict = Arrays.stream(frames).anyMatch(frame -> frame.getClassName().equals(LearnerService.class.getName())
                    && frame.getMethodName().equals("resolveSrsMasterySnapshot"));
            Set<String> entries = Set.of("getTodayStatus", "getPlans", "getPlan");
            String operation = Arrays.stream(frames).filter(frame -> frame.getClassName().equals(LearnerLearningPlanService.class.getName())
                    && entries.contains(frame.getMethodName())).map(StackTraceElement::getMethodName).findFirst().orElse("other");
            if (strict && refused.add(operation)) {
                refusedStrictReads.incrementAndGet();
                throw new IllegalStateException("Actual first strict SRS failure for " + operation);
            }
            if (strict) recoveredStrictReads.incrementAndGet();
            return List.of(recall);
        }).when(srs).findByLearnerAndNodeIds(anyString(), any());
    }

    void clearObservedWrites(){clearInvocations(masteryRepository,focusRepository,planRepository,learnerRepository,events,completions);}
    CompletionCallContext supported(){return new CompletionCallContext("claude","owner",Instant.now().plusSeconds(600),true);}
    void startCurrentOrdinaryWorkflow() {
        // Read an already persisted current workflow. Creating a new workflow is
        // intentionally forbidden under UNCOVERED and is not what this fixture claims.
        addForeignUncoveredConsumer();
        CompletionCallContext.with(supported(),()->{
            var resumed=facade.resumeLearningPlan(ID,"de");
            if(!"A".equals(resumed.activeGoalId()))throw new AssertionError("Expected real explicit ordinary A");
            var offered=learners.getCoachLearnerState(ID).levelCompletion();
            if(!"invalid".equals(offered.calculationStatus())
                    || !"completion_target_routes_uncovered".equals(offered.notice()))
                throw new AssertionError("Expected a full current UNCOVERED snapshot: " + offered);
            try {
                learners.chooseLevelCompletion(ID,new LevelCompletionActionRequest("selectProfile",PROFILE,null,null,learner.getCoachStateRevision()));
                throw new AssertionError("A new invalid workflow must not be selected");
            } catch (org.springframework.web.server.ResponseStatusException expected) {
                if(expected.getStatusCode().value()!=409)throw expected;
            }
            String digest=ReflectionTestUtils.invokeMethod(learners,"completionScopeDigest",learner);
            var stored=new CompletionWorkflowState(offered.profileId(),offered.profileRevision(),
                    offered.curriculumGeneration(),learner.getSelectedCurriculum(),digest,"required","A",null);
            try { learner.setCompletionWorkflow(mapper.writeValueAsString(stored)); }
            catch (com.fasterxml.jackson.core.JsonProcessingException error) { throw new IllegalStateException(error); }
            return null;
        });
    }
    static LearningGoal atom(String id,String...requires){var g=new LearningGoal();g.setId(id);g.setTitle(id);g.setContains(List.of());g.setRequires(List.of(requires));return g;}
}
