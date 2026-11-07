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
class PowiNativeValidatedFocusProbe {
 static final String ROOT="a0e13c56-c25f-4742-9272-3a1a603ee52e", OWNER="51b60137-46e8-5498-973e-ea38bb32f327", INTRO="b76a024a-55a6-5c77-85cd-b37ef10e5197", TERMS="a2bd27fa-8e31-59ff-ab34-66fac86c0bb5", RULES="041b4a11-d7a3-5557-b5d0-2c365faccc5b", PROOT="94b281ca-2317-5d73-9a4a-0ae2d5896c1e", J8="77605583-a743-595e-91ac-ea0eb1d6506e";
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
  Class<?> gp=Arrays.stream(LearnerService.class.getDeclaredClasses()).filter(c->c.getSimpleName().equals("GoalProjection")).findFirst().orElseThrow();
  Class<?> fp=Arrays.stream(LearnerService.class.getDeclaredClasses()).filter(c->c.getSimpleName().equals("FrontierPrerequisites")).findFirst().orElseThrow();
  Method projection=method("getGoalProjection",String.class,String.class),prereq=method("frontierPrerequisites",Learner.class,gp,Map.class,Set.class),allowed=method("areFrontierPrerequisitesMastered",LearningGoal.class,gp,fp),focus=method("resolveProjectedTargetFocusIds",List.class,gp),targetscope=method("resolveProjectedTargetScopeIds",List.class,gp),scopefn=method("computeScope",List.class,Map.class,Map.class),effective=method("computeEffectiveMastery",Map.class,Map.class),orientation=method("getRequiredOrientationGoals",Learner.class,gp,Map.class,Map.class,Map.class,Map.class,List.class,List.class,Set.class);
  List<Map<String,Object>> requests=om.readValue(dir.resolve("requests.json").toFile(),new TypeReference<>(){});List<Object> rows=new ArrayList<>();
  for(Map<String,Object> req:requests){
   learner.setSelectedCurriculum((String)req.get("selectedCurriculum"));
   Map<String,Object> pc=om.convertValue(req.get("personalCurriculum"),new TypeReference<Map<String,Object>>(){});
   List<Object> groupCompletions=new ArrayList<>();
   if(Boolean.TRUE.equals(req.get("nativeLegacyCompleted"))){Method migrate=CurriculumPersonalizationPlanner.class.getDeclaredMethod("markMigrationCompleted",Map.class,String.class);migrate.setAccessible(true);migrate.invoke(null,pc,learner.getSelectedCurriculum());}
   for(int step=0;step<6;step++){
    learner.setPersonalCurriculum(om.writeValueAsString(pc));
    PersonalizationPlan plan=svc.getCoachPersonalizationPlan(learner.getSkillpilotId());
    if(plan.stage().toString().equals("COMPLETE"))break;
    Optional<PersonalizationPlan.Option> complete=plan.options().stream().filter(o->o.kind().toString().equals("COMPLETE_GROUP")).findFirst();
    if(complete.isEmpty())break;
    Method record=CurriculumPersonalizationPlanner.class.getDeclaredMethod("recordGroupCompletion",Map.class,String.class,PersonalizationPlan.Option.class);record.setAccessible(true);
    groupCompletions.add(complete.get());record.invoke(null,pc,learner.getSelectedCurriculum(),complete.get());
   }
   learner.setPersonalCurriculum(om.writeValueAsString(pc));learner.setActiveGoalId(null);inputMastery.clear();inputFocus.clear();
   Object proj=projection.invoke(svc,learner.getSelectedCurriculum(),learner.getPersonalCurriculum());
   Map<String,LearningGoal> structural=(Map<String,LearningGoal>)access(proj,"structuralGoals"),visible=(Map<String,LearningGoal>)access(proj,"visibleGoals");Set<String> targets=(Set<String>)access(proj,"targetGoalIds"),support=(Set<String>)access(proj,"prerequisiteOnlyGoalIds");
   Map<String,Object> row=new LinkedHashMap<>();row.put("key",req.get("key"));row.put("selectedCurriculum",learner.getSelectedCurriculum());row.put("committedSyntheticPersonalCurriculum",pc);row.put("nativeGroupCompletionOptions",groupCompletions);row.put("syntheticLegacyCompatibilityFixture",Boolean.TRUE.equals(req.get("nativeLegacyCompleted")));row.put("targetGoalIds",sorted(targets));row.put("supportGoalIds",sorted(support));row.put("visibleGoalIds",sorted(visible.keySet()));row.put("structuralGoalIds",sorted(structural.keySet()));row.put("compositionViewIds",access(proj,"compositionViewIds"));row.put("compositionViewApplied",access(proj,"compositionViewApplied"));row.put("personalizationPlan",safe(()->svc.getCoachPersonalizationPlan(learner.getSkillpilotId())));row.put("personalCurriculumSubjectIds",safe(()->svc.getPersonalCurriculumSubjectIds(learner.getSkillpilotId())));row.put("planningScope",safe(()->svc.getPlanningScope(learner.getSkillpilotId(),OWNER)));
   List<Object> cases=new ArrayList<>();boolean detailed=Boolean.TRUE.equals(req.get("detailed"));
   boolean pcComplete=svc.getCoachPersonalizationPlan(learner.getSkillpilotId()).stage().toString().equals("COMPLETE") && svc.getPersonalCurriculumSubjectIds(learner.getSkillpilotId()).contains(OWNER);
   row.put("validPersonalCurriculum",pcComplete);
   if(!pcComplete){row.put("cases",cases);row.put("configurationHold",true);rows.add(row);continue;}
   if(Boolean.getBoolean("powi.pcOnly")){List<Object> widening=new ArrayList<>();
   for(List<String> roots:List.of(List.of(AUTHORS.get(0)),List.of(AUTHORS.get(0),INTRO,AUTHORS.get(1)))){Map<String,Double> mastered=new LinkedHashMap<>();for(String id:roots)mastered.put(id,1.0);widening.add(Map.of("focusRoots",roots,"inputMastery",mastered,"nativeOptions",safe(()->method("buildBroaderFocusOptions",gp,List.class,Map.class).invoke(svc,proj,roots,mastered))));}
   row.put("nativeWideningFunctionAfterExplicitCurrentRootMastery",widening);row.put("cases",cases);rows.add(row);om.writerWithDefaultPrettyPrinter().writeValue(dir.resolve(label+".checkpoint.json").toFile(),rows);System.out.println("VALIDATED_CONTEXT_COMPLETE "+label+" "+req.get("key")+" cases="+cases.size());continue;}
   for(String author:AUTHORS)if(targets.contains(author)){
    List<Map<String,Object>> fs=detailed?List.of(Map.of("key","single-author","roots",List.of(author)),Map.of("key","multi-author-intro-middle-outside","roots",List.of(author,INTRO)),Map.of("key","multi-independent-authors-intro","roots",List.of(author,INTRO,AUTHORS.get((AUTHORS.indexOf(author)+1)%4))),Map.of("key","single-j8-intro-outside","roots",List.of(J8))):List.of(Map.of("key","single-author","roots",List.of(author)));
    for(var f:fs){List<String> roots=(List<String>)f.get("roots");List<String> projected=(List<String>)focus.invoke(svc,roots,proj),planned=(List<String>)targetscope.invoke(svc,projected,proj);Set<String> scope=(Set<String>)scopefn.invoke(svc,planned,structural,Map.of());
     List<String> states=detailed?List.of("all-open","carrier-mastered-intro-open","all-middle-mastered-intro-open","intro-only-mastered","all-prerequisites-mastered"):List.of("all-prerequisites-mastered");
     for(String state:states)for(boolean strict:List.of(false,true)){
      inputFocus.clear();inputFocus.addAll(roots);inputMastery.clear();learner.setStrictMode(strict);learner.setActiveGoalId(null);
      String carrier=AUTHORS.indexOf(author)<2?TERMS:RULES;
      if(state.equals("carrier-mastered-intro-open"))inputMastery.put(carrier,1.0);
      if(state.equals("all-middle-mastered-intro-open")){inputMastery.put(TERMS,1.0);if(!author.equals(RULES))inputMastery.put(RULES,1.0);}
      if(state.equals("intro-only-mastered"))inputMastery.put(INTRO,1.0);
      if(state.equals("all-prerequisites-mastered")){inputMastery.put(INTRO,1.0);inputMastery.put(TERMS,1.0);if(!author.equals(RULES))inputMastery.put(RULES,1.0);}
      Map<String,Double> before=new LinkedHashMap<>(inputMastery);Object p=prereq.invoke(svc,learner,proj,inputMastery,scope);
      Map<String,Object> c=new LinkedHashMap<>();c.put("author",author);c.put("focusKey",f.get("key"));c.put("focusRoots",roots);c.put("projectedFocusIds",projected);c.put("plannedIds",planned);c.put("scopeGoalIds",sorted(scope));c.put("state",state);c.put("strict",strict);c.put("inputMastery",before);c.put("allowed",allowed.invoke(svc,structural.get(author),proj,p));
      c.put("fullNativeTransitivePrerequisites",safe(()->{Object topology=access(p,"topology");if(topology==null)return Map.of("blocked",true);Method transitive=topology.getClass().getDeclaredMethod("transitivePrerequisites",String.class);transitive.setAccessible(true);return transitive.invoke(topology,author);}));c.put("missingDirectLevel2References",structural.get(author).getRequires().stream().filter(id->!targets.contains(id)&&!support.contains(id)).toList());
      Object eff=effective.invoke(svc,visible,inputMastery);c.put("requiredOrientationIds",((List<FrontierGoal>)orientation.invoke(svc,learner,proj,visible,structural,eff,inputMastery,projected,planned,scope)).stream().map(FrontierGoal::id).toList());
      if(detailed){c.put("richFrontier",safe(()->svc.getUncompactedRichFrontierForFocus(learner.getSkillpilotId(),roots).stream().map(FrontierGoal::id).toList()));c.put("simpleFrontier",safe(()->svc.getFrontier(learner.getSkillpilotId())));}
      if(!before.equals(inputMastery))throw new IllegalStateException("Input mastery changed");cases.add(c);
     }
    }
   }
   List<Object> widening=new ArrayList<>();
   for(List<String> roots:List.of(List.of(AUTHORS.get(0)),List.of(AUTHORS.get(0),INTRO,AUTHORS.get(1)))){Map<String,Double> mastered=new LinkedHashMap<>();for(String id:roots)mastered.put(id,1.0);widening.add(Map.of("focusRoots",roots,"inputMastery",mastered,"nativeOptions",safe(()->method("buildBroaderFocusOptions",gp,List.class,Map.class).invoke(svc,proj,roots,mastered))));}
   row.put("nativeWideningFunctionAfterExplicitCurrentRootMastery",widening);row.put("cases",cases);rows.add(row);om.writerWithDefaultPrettyPrinter().writeValue(dir.resolve(label+".checkpoint.json").toFile(),rows);System.out.println("VALIDATED_CONTEXT_COMPLETE "+label+" "+req.get("key")+" cases="+cases.size());
  }
  // Short private production-resolver negatives. No source or learner mutation.
  List<Object> negatives=new ArrayList<>();Method resolve=method("resolveGoalRef",String.class,Map.class);Map<String,LearningGoal> lookup=new LinkedHashMap<>();landscapes.getAll().forEach(l->l.getGoals().forEach(g->lookup.put(g.getId(),g)));
  for(String ref:List.of("00000000-0000-4000-8000-000000000000:"+INTRO,OWNER+":00000000-0000-4000-8000-000000000000")){Map<String,Object> n=new LinkedHashMap<>();n.put("ref",ref);n.put("actualResolveGoalRef",safe(()->resolve.invoke(svc,ref,lookup)));negatives.add(n);}
  Map<String,Object> out=new LinkedHashMap<>();out.put("label",label);out.put("actualSourceSha256",sha(Files.readAllBytes(root.resolve("curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_POLITIKWIRTSCHAFT.de.json"))));out.put("rows",rows);out.put("resolverNegatives",negatives);out.put("repositoryCalls",calls);out.put("actualLearnerStateRead",false);out.put("repositoryWritesAllowed",false);om.writerWithDefaultPrettyPrinter().writeValue(dir.resolve(label+".json").toFile(),out);System.out.println(om.writeValueAsString(Map.of("label",label,"contexts",rows.size(),"syntheticRepositoriesOnly",true)));
 }
}
