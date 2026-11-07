import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.*;
import com.skillpilot.backend.landscape.*;
import com.skillpilot.backend.domain.*;
import com.skillpilot.backend.repository.*;
import com.skillpilot.backend.service.*;
import com.skillpilot.backend.api.*;
import java.lang.reflect.*;
import java.nio.file.*;
import java.security.*;
import java.util.*;
import org.springframework.transaction.*;
import org.springframework.transaction.support.SimpleTransactionStatus;

/** Private adapter. All scope, prerequisite and frontier decisions belong to production services. */
class IndependentInfoScopeProbe {
 static final String ROOT="a0e13c56-c25f-4742-9272-3a1a603ee52e", OWNER="7d51b38c-a149-5407-bddc-d2ce7878b020", INTRO="b76a024a-55a6-5c77-85cd-b37ef10e5197", TERMS="a2bd27fa-8e31-59ff-ab34-66fac86c0bb5", RULES="041b4a11-d7a3-5557-b5d0-2c365faccc5b", PROOT="94b281ca-2317-5d73-9a4a-0ae2d5896c1e", J8="77605583-a743-595e-91ac-ea0eb1d6506e";
 static final List<String> AUTHORS=List.of(RULES,"bf0f8cac-3fb9-5c50-ad93-bbb6e2241aee","022c620f-fdb3-5814-a9b7-f18614130793","b2d76b0d-cdb3-5f35-893f-896903d673db");
 static Object access(Object o,String n)throws Exception {Method m=o.getClass().getDeclaredMethod(n);m.setAccessible(true);return m.invoke(o);}
 static Method method(String n,Class<?>...t)throws Exception {Method m=LearnerService.class.getDeclaredMethod(n,t);m.setAccessible(true);return m;}
 static List<String> sorted(Collection<String> s){return s.stream().sorted().toList();}
 static String sha(byte[] b)throws Exception{return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(b));}
 static Object safe(Throwing f){try{return f.run();}catch(Exception e){Throwable c=e instanceof InvocationTargetException?e.getCause():e;return Map.of("exception",c.getClass().getName(),"message",String.valueOf(c.getMessage()));}}
 interface Throwing{Object run()throws Exception;}
 public static void main(String[] args)throws Exception{
  Path root=Path.of(args[0]),dir=Path.of(args[1]);String label=args[2];
  ObjectMapper om=new ObjectMapper().findAndRegisterModules().configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES,false);
  LandscapeProperties props=new LandscapeProperties();props.setDirectory(root.resolve("curricula").toString());
  GoalMappingService mappings=new GoalMappingService(props,om);mappings.pinRuntimeGeneration();
  LandscapeService landscapes=new LandscapeService(props,om,mappings);landscapes.pinRuntimeGeneration();
  CompositionViewService compositions=new CompositionViewService(props,om,()->{Map<String,List<String>> g=new TreeMap<>();landscapes.getAll().forEach(l->l.getGoals().forEach(n->g.put(n.getId(),n.getContains()==null?List.of():n.getContains())));return g;});
  Learner learner=new Learner();learner.setSkillpilotId("private-synthetic-powi-native-focus");learner.setSelectedCurriculum(ROOT);learner.setFollowLearningPlans(false);learner.setAutoPilot(false);learner.setLearningState(LearningState.FRONTIER);
  Map<String,Double> inputMastery=new LinkedHashMap<>();List<String> inputFocus=new ArrayList<>();Map<String,Integer> calls=new TreeMap<>();
  InvocationHandler repos=(p,m,a)->{calls.merge(m.getName(),1,Integer::sum);return switch(m.getName()){
   case "findById" -> Optional.of(learner);
   case "existsById" -> true;
   case "findByLearner_SkillpilotId" -> p instanceof MasteryRepository?inputMastery.entrySet().stream().map(e->new Mastery(learner,e.getKey(),e.getValue())).toList():inputFocus.stream().map(id->new PlannedGoal(learner,id)).toList();
   default -> throw new IllegalStateException("Forbidden repository action: "+m.getName());};};
  LearnerRepository lr=(LearnerRepository)Proxy.newProxyInstance(LearnerRepository.class.getClassLoader(),new Class[]{LearnerRepository.class},repos);
  MasteryRepository mr=(MasteryRepository)Proxy.newProxyInstance(MasteryRepository.class.getClassLoader(),new Class[]{MasteryRepository.class},repos);
  PlannedGoalRepository pr=(PlannedGoalRepository)Proxy.newProxyInstance(PlannedGoalRepository.class.getClassLoader(),new Class[]{PlannedGoalRepository.class},repos);
  LearnerClientStateRepository cr=(LearnerClientStateRepository)Proxy.newProxyInstance(LearnerClientStateRepository.class.getClassLoader(),new Class[]{LearnerClientStateRepository.class},(p,m,a)->{calls.merge(m.getName(),1,Integer::sum);if(m.getName().equals("findById"))return Optional.empty();throw new IllegalStateException("Forbidden client-state access: "+m.getName());});
  PlatformTransactionManager tx=new PlatformTransactionManager(){public TransactionStatus getTransaction(TransactionDefinition d){return new SimpleTransactionStatus();}public void commit(TransactionStatus s){throw new IllegalStateException("Forbidden commit");}public void rollback(TransactionStatus s){throw new IllegalStateException("Forbidden rollback");}};
  LearnerService svc=new LearnerService(lr,cr,mr,pr,landscapes,mappings,null,compositions,om,e->{throw new IllegalStateException("Forbidden event");},tx);

  List<Object> results=new ArrayList<>();
  for(String profile:List.of("GK","LK","GK+LK"))for(String jur:List.of("","DE-HE","DE-BY"))for(String stage:List.of("CrossStage","SekII")){
   Map<String,String> requested=new LinkedHashMap<>();requested.put("schoolForm","Gymnasium");requested.put("stage",stage);requested.put("courseProfile",profile);if(!jur.isEmpty())requested.put("jurisdiction",jur);
   Map<String,Object> row=new LinkedHashMap<>();row.put("scope",requested);Map<String,Object> matched=compositions.findLearnerScopeView(OWNER,requested);row.put("nativeMatchedViewId",matched==null?null:matched.get("viewId"));
   Map<String,String> cohort=new LinkedHashMap<>(requested);cohort.put("examYear","2027");row.put("cohortRequest",cohort);row.put("nativeCohortView",compositions.findLearnerScopeView(OWNER,cohort));results.add(row);
  }
  Class<?> gp=Arrays.stream(LearnerService.class.getDeclaredClasses()).filter(c->c.getSimpleName().equals("GoalProjection")).findFirst().orElseThrow();Method projection=method("getGoalProjection",String.class,String.class);List<Object> pcs=new ArrayList<>();
  for(String profile:List.of("GK","LK","GK+LK"))for(String jur:List.of("","DE-HE","DE-BY")){
   learner.setSelectedCurriculum(OWNER);Map<String,Object> conf=new LinkedHashMap<>();conf.put("selected",true);conf.put("filterId",profile);conf.put("stage","CrossStage");Map<String,Object> pc=new LinkedHashMap<>();pc.put(OWNER,conf);if(!jur.isEmpty())pc.put(ROOT,Map.of("filterId",jur,"stage","CrossStage"));learner.setPersonalCurriculum(om.writeValueAsString(pc));inputMastery.clear();inputFocus.clear();
   Map<String,Object> row=new LinkedHashMap<>();row.put("pc",pc);row.put("plan",svc.getCoachPersonalizationPlan(learner.getSkillpilotId()));row.put("subjectIds",svc.getPersonalCurriculumSubjectIds(learner.getSkillpilotId()));Object proj=projection.invoke(svc,OWNER,learner.getPersonalCurriculum());Map<String,LearningGoal> visible=(Map<String,LearningGoal>)access(proj,"visibleGoals");Set<String> targets=(Set<String>)access(proj,"targetGoalIds");row.put("targetIds",sorted(targets));row.put("supportIds",sorted((Set<String>)access(proj,"prerequisiteOnlyGoalIds")));row.put("viewIds",access(proj,"compositionViewIds"));
   LearningGoal deckGoal=visible.get("ca2469f3-3712-5d92-ae7c-ee61d8607efa");Class<?> card=Arrays.stream(LearnerService.class.getDeclaredClasses()).filter(c->c.getSimpleName().equals("SrsCard")).findFirst().orElseThrow();Constructor<?> ctr=card.getDeclaredConstructors()[0];ctr.setAccessible(true);List<Object> cards=new ArrayList<>();JsonNode deck=om.readTree(root.resolve("curricula/DE/Gymnasium/memory-decks/de_gymnasium_informatics_flashcards_databases.de.json").toFile());for(JsonNode c:deck.get("cards")){cards.add(ctr.newInstance(c.get("id").asText(),c.path("front").asText(),c.path("back").asText(),c.path("category").asText(),om.convertValue(c.path("tags"),new TypeReference<List<String>>(){})));}
   List<?> selected=(List<?>)method("filterSrsCards",LearningGoal.class,List.class).invoke(svc,deckGoal,cards);List<String> cardIds=new ArrayList<>();for(Object c:selected){Field f=card.getDeclaredField("id");f.setAccessible(true);cardIds.add((String)f.get(c));}row.put("nativeDeckGoalTags",deckGoal==null?null:deckGoal.getTags());row.put("nativeFilteredCardIds",cardIds);
   if(profile.equals("GK")){inputMastery.put("0df1bedd-5fda-5b3b-a959-c9610237bb3e",1.0);Map<String,Double> before=new LinkedHashMap<>(inputMastery);row.put("preservedOld41Mastery",before);row.put("newExamUnset",!inputMastery.containsKey("6ebc2a67-ea20-5c4e-8a63-635f40438d6a"));row.put("cardsUnset",!inputMastery.containsKey("ca2469f3-3712-5d92-ae7c-ee61d8607efa"));List<Object> focusCases=new ArrayList<>();for(List<String> roots:List.of(List.of("5c6ba0c6-5b7a-512f-8c19-739b20473639"),List.of("5c6ba0c6-5b7a-512f-8c19-739b20473639","2d1021d7-aa6a-520d-a56e-19a8305db9f3"))){for(boolean strict:List.of(false,true)){learner.setStrictMode(strict);inputFocus.clear();inputFocus.addAll(roots);Map<String,Object> fc=new LinkedHashMap<>();fc.put("roots",roots);fc.put("strict",strict);fc.put("frontier",safe(()->svc.getUncompactedRichFrontierForFocus(learner.getSkillpilotId(),roots).stream().map(FrontierGoal::id).toList()));focusCases.add(fc);}}row.put("nativeFocusCases",focusCases);row.put("inputMasteryUnchanged",before.equals(inputMastery));}
   pcs.add(row);
  }
  Map<String,Object> output=new LinkedHashMap<>();output.put("nativeScopeMatches",results);output.put("nativePersonalCurricula",pcs);output.put("repositoryCalls",calls);om.writerWithDefaultPrettyPrinter().writeValue(dir.resolve(label+".runtime.json").toFile(),output);System.out.println("TERMINAL "+label);
 }
}
