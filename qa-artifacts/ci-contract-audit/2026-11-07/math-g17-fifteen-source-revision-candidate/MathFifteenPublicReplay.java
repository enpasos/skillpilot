package com.skillpilot.backend.service;
import static org.mockito.Mockito.*;
import com.fasterxml.jackson.databind.*;
import com.skillpilot.backend.landscape.*;
import com.skillpilot.backend.domain.*;
import com.skillpilot.backend.repository.*;
import com.skillpilot.backend.completion.*;
import org.springframework.transaction.*;
import org.springframework.transaction.support.SimpleTransactionStatus;
import java.nio.file.*;
import java.lang.reflect.*;
import java.util.*;
/** Actual PC loader and public frontier; repositories are in-memory mocks, no database writes. */
public class MathFifteenPublicReplay {
 static String OWNER="68a8ac50-f5f5-4e24-8aa9-5e408ca01ced", A="304111dd-426b-520b-a275-3fa37da1b0e0", B="b5062446-332f-4a67-aaf7-3bfa3e5aded9", I="71cec9fb-3751-4d61-8b34-c5adbbf6e5f2", U="dbc13bb0-963b-49a8-a441-2183f4b64c8e";
 public static void main(String[] args)throws Exception {
  ObjectMapper om=new ObjectMapper().configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES,false);
  LandscapeProperties props=new LandscapeProperties();props.setDirectory(Path.of("curricula").toAbsolutePath().toString());
  LandscapeService landscapes=new LandscapeService(props,om);GoalMappingService mappings=new GoalMappingService(props,om);
  CompositionViewService views=new CompositionViewService(props,om,()->{Map<String,List<String>> m=new LinkedHashMap<>();landscapes.getAll().forEach(l->l.getGoals().forEach(g->m.put(g.getId(),g.getContains())));return m;});
  PlatformTransactionManager tx=new PlatformTransactionManager(){public TransactionStatus getTransaction(TransactionDefinition d){return new SimpleTransactionStatus();}public void commit(TransactionStatus s){}public void rollback(TransactionStatus s){}};
  List<Object> rows=new ArrayList<>();
  for(String scenario:List.of("held-U-HE-SekI-G8-open","A-crossstage-single-normal","A-crossstage-strict-open","A-crossstage-strict-carrier-mastered","A-crossstage-strict-all-demand-mastered")){
   boolean held=scenario.startsWith("held");String id=held?U:A;String pc=om.writeValueAsString(Map.of(OWNER,held?Map.of("selected",true,"jurisdiction","DE-HE","schoolForm","Gymnasium","stage","SekI","durationModel","G8","filterId","DE-HE"):Map.of("selected",true,"stage","CrossStage","filterId","GK")));
   Learner learner=new Learner();learner.setSkillpilotId("private-math-fifteen");learner.setSelectedCurriculum(OWNER);learner.setPersonalCurriculum(pc);learner.setAutoPilot(false);learner.setUseAssessmentShortcuts(false);learner.setStrictMode(scenario.contains("strict"));learner.setLearningState(LearningState.FRONTIER);
   LearnerRepository lr=mock(LearnerRepository.class);LearnerClientStateRepository cr=mock(LearnerClientStateRepository.class);MasteryRepository mr=mock(MasteryRepository.class);PlannedGoalRepository pr=mock(PlannedGoalRepository.class);DeckResourceService decks=mock(DeckResourceService.class);
   when(lr.findById(learner.getSkillpilotId())).thenReturn(Optional.of(learner));when(lr.existsById(learner.getSkillpilotId())).thenReturn(true);when(pr.findByLearner_SkillpilotId(learner.getSkillpilotId())).thenReturn(List.of(new PlannedGoal(learner,id)));
   List<Mastery> mastery=new ArrayList<>();if(scenario.contains("carrier-mastered"))mastery.add(new Mastery(learner,B,1.0));
   if(scenario.contains("all-demand-mastered")){Map<String,LearningGoal> canonical=new LinkedHashMap<>();landscapes.getAll().stream().filter(l->OWNER.equals(l.getLandscapeId())).forEach(l->l.getGoals().forEach(g->canonical.put(g.getId(),g)));new CompletionProfileCompiler().normalizePrerequisites(canonical).transitivePrerequisites(id).forEach(p->mastery.add(new Mastery(learner,p,1.0)));}
   when(mr.findByLearner_SkillpilotId(learner.getSkillpilotId())).thenReturn(mastery);
   LearnerService service=new LearnerService(lr,cr,mr,pr,landscapes,mappings,decks,views,om,e->{throw new IllegalStateException("Event forbidden");},tx);
   Method projection=LearnerService.class.getDeclaredMethod("getGoalProjection",String.class,String.class);projection.setAccessible(true);Object gp=projection.invoke(service,OWNER,pc);
   Map<String,Object> row=new LinkedHashMap<>();row.put("scenario",scenario);row.put("personalCurriculum",om.readTree(pc));row.put("goalId",id);row.put("masteredGoalIds",mastery.stream().map(m->m.getGoalKey()).toList());
   for(String name:List.of("targetGoalIds","prerequisiteOnlyGoalIds","compositionViewIds")){Method m=gp.getClass().getDeclaredMethod(name);m.setAccessible(true);Set<?> v=(Set<?>)m.invoke(gp);row.put(name,new TreeSet(v));}
   row.put("publicFilteredAtomicGoals",new TreeSet(service.getFilteredAtomicGoalIds(OWNER,pc,null,false)));row.put("publicFrontier",new TreeSet(service.getFrontier(learner.getSkillpilotId())));rows.add(row);
   verify(lr,never()).save(any());verify(mr,never()).save(any());verify(pr,never()).save(any());
  }
  om.writerWithDefaultPrettyPrinter().writeValue(Path.of(args[0]).toFile(),rows);System.out.println("Actual PC/public frontier scenarios: "+rows.size());
 }
}
