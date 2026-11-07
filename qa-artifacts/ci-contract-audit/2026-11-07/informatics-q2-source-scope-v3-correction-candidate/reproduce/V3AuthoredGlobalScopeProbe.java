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
class V3AuthoredGlobalScopeProbe {
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


  Method completion=CurriculumPersonalizationPlanner.class.getDeclaredMethod("recordGroupCompletion",Map.class,String.class,PersonalizationPlan.Option.class);completion.setAccessible(true);Method sync=method("synchronizeCanonicalStageScope",Learner.class,Map.class,PersonalizationPlan.Option.class);Method projection=method("getGoalProjection",String.class,String.class);List<Object> rows=new ArrayList<>();
  for(String jur:List.of("","DE-BB","DE-BE","DE-BW","DE-BY","DE-HB","DE-HE","DE-HH","DE-MV","DE-NI","DE-NW","DE-RP","DE-SH","DE-SL","DE-SN","DE-ST","DE-TH"))for(String profile:List.of("GK","LK","GK+LK")){
   learner.setSelectedCurriculum(ROOT);learner.setStrictMode(false);learner.setPersonalCurriculum("{}");inputFocus.clear();inputMastery.clear();for(JsonNode historical:om.readTree(dir.resolve("old-24-raw-definitions.json").toFile()).path("exams")){inputMastery.put(historical.path("goal").path("id").asText(),1.0);}inputMastery.put("875cb53c-b48d-5b2b-8cb0-e20f27534f16",1.0);Map<String,Double> beforeMastery=new LinkedHashMap<>(inputMastery);Map<String,Object> pc=new LinkedHashMap<>();List<Object> steps=new ArrayList<>();String hold=null;PersonalizationPlan plan=null;
   for(int attempt=0;attempt<12;attempt++){
    plan=svc.getCoachPersonalizationPlan(learner.getSkillpilotId());Map<String,Object> step=new LinkedHashMap<>();step.put("plan",plan);step.put("pc",om.readTree(learner.getPersonalCurriculum()));steps.add(step);if(plan.stage()==PersonalizationPlan.Stage.COMPLETE||plan.stage()==PersonalizationPlan.Stage.INVALID)break;
    PersonalizationPlan.Option selected=null;
    if("jurisdiction".equals(plan.groupId())){String wanted=jur.isEmpty()?"ALL":jur;selected=plan.options().stream().filter(o->wanted.equals(o.filterId())).findFirst().orElse(null);}
    else if(plan.options().stream().anyMatch(o->"durationModel".equals(o.scopeKey()))){selected=plan.options().stream().filter(o->"durationModel".equals(o.scopeKey())&&"G9".equals(o.scopeValue())).findFirst().orElse(null);}
    else if(plan.options().stream().anyMatch(o->"stage".equals(o.scopeKey()))){selected=plan.options().stream().filter(o->"stage".equals(o.scopeKey())&&"CrossStage".equals(o.scopeValue())).findFirst().orElse(null);}
    else if("subject".equals(plan.groupId())){boolean already=plan.currentSelectedOptions().stream().anyMatch(o->OWNER.equals(o.landscapeId()));selected=plan.options().stream().filter(o->already?o.kind()==PersonalizationPlan.OptionKind.COMPLETE_GROUP:OWNER.equals(o.landscapeId())).findFirst().orElse(null);if(selected==null)hold="Informatics is not an actually selectable subject in this native authored scope; display-only is not accepted.";}
    else {String canonical=CurriculumPersonalizationPlanner.canonicalFilterId(landscapes.getById(OWNER),profile);selected=plan.options().stream().filter(o->OWNER.equals(o.landscapeId())&&(profile.equals(o.filterId())||(canonical!=null&&canonical.equals(o.filterId())))).findFirst().orElse(null);}
    if(selected==null&&plan.options().stream().anyMatch(o->"durationModel".equals(o.scopeKey()))){for(PersonalizationPlan.Option available:plan.options()){if("durationModel".equals(available.scopeKey())){selected=available;break;}}}
    if(selected==null){if(hold==null)hold="No native offered option for the requested finite context; nothing inferred or auto-selected.";break;}step.put("selectedExactOfferedOption",selected);
    if(selected.kind()==PersonalizationPlan.OptionKind.COMPLETE_GROUP)completion.invoke(null,pc,ROOT,selected);
    else {String lid=selected.landscapeId();Map<String,Object> settings=pc.get(lid)instanceof Map?new LinkedHashMap<>((Map<String,Object>)pc.get(lid)):new LinkedHashMap<>();settings.put("selected",true);if(selected.kind()==PersonalizationPlan.OptionKind.SCOPE_VALUE){settings.put(selected.scopeKey(),selected.scopeValue());pc.put(lid,settings);sync.invoke(svc,learner,pc,selected);}else{if(selected.filterId()!=null){settings.put("filterId",selected.filterId());settings.remove("durationModel");}pc.put(lid,settings);}}
    learner.setPersonalCurriculum(om.writeValueAsString(pc));
   }
   Map<String,Object> row=new LinkedHashMap<>();row.put("requestedJurisdiction",jur.isEmpty()?"canonical-own":jur);row.put("requestedProfile",profile);row.put("selectedCurriculum",learner.getSelectedCurriculum());row.put("learnerFields",om.valueToTree(learner));row.put("actualPcString",learner.getPersonalCurriculum());row.put("actualPc",pc);Field wiring=CompositionViewService.class.getDeclaredField("packageState");wiring.setAccessible(true);Object actualState=wiring.get(compositions);row.put("actualPackageState",actualState==null?null:actualState.getClass().getName());row.put("serviceClass",compositions.getClass().getName());row.put("serviceFindDefaultViewOwner",compositions.findDefaultView(OWNER));row.put("nativeFinalPlan",plan);row.put("hold",hold);row.put("nativeOfferedSteps",steps);row.put("construction","Only actual offered native option objects selected; native recordGroupCompletion and synchronizeCanonicalStageScope; own synthetic in-memory PC, no DB writes or migration marker");row.put("masteryUnchanged",beforeMastery.equals(inputMastery));row.put("oldMasteryCount",beforeMastery.size());row.put("newOwnExamMasteryUnset",!inputMastery.containsKey("6ebc2a67-ea20-5c4e-8a63-635f40438d6a"));
   if(plan!=null&&plan.stage()==PersonalizationPlan.Stage.COMPLETE&&hold==null){row.put("subjectIds",svc.getPersonalCurriculumSubjectIds(learner.getSkillpilotId()));Object projected=projection.invoke(svc,OWNER,learner.getPersonalCurriculum());row.put("targetIds",sorted((Set<String>)access(projected,"targetGoalIds")));row.put("viewIds",access(projected,"compositionViewIds"));}
   rows.add(row);
  }
  Map<String,Object> output=new LinkedHashMap<>();output.put("nativeAuthoredGlobalCases",rows);output.put("repositoryCalls",calls);om.writerWithDefaultPrettyPrinter().writeValue(dir.resolve(label+".runtime.json").toFile(),output);System.out.println("TERMINAL "+label);
 }
}
