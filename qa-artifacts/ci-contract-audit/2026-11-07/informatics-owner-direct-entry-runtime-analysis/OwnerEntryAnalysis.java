package com.skillpilot.backend.curriculumpackage;
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
class OwnerEntryAnalysis {
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

  List<Map<String,Object>> cases=new ArrayList<>();
  Map<String,Object> info=om.readValue(root.resolve("curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json").toFile(),new TypeReference<Map<String,Object>>(){});
  Map<String,Object> view=om.readValue(root.resolve("curricula/DE/Gymnasium/composition-views/informatik/de-de-gym-informatics-gk.view.json").toFile(),new TypeReference<Map<String,Object>>(){});
  Map<String,String> scope=om.convertValue(view.get("scope"),new TypeReference<Map<String,String>>(){});String pkg="readonly.component.fixture",vid=(String)view.get("viewId"),offer="fixture.offering."+vid;
  List<CurriculumRuntimeSnapshot.ScopeDimension> dims=scope.entrySet().stream().map(e->new CurriculumRuntimeSnapshot.ScopeDimension(e.getKey(),List.of(e.getValue()),List.of())).toList();
  String digest=sha((om.writeValueAsString(info)+om.writeValueAsString(view)).getBytes(java.nio.charset.StandardCharsets.UTF_8));
  var pd=new CurriculumRuntimeSnapshot.PackageDescriptor(pkg,"0.0.0","readonly-fixture",digest,digest,digest,digest,digest,dims,List.of());
  var ld=new CurriculumRuntimeSnapshot.LandscapeDescriptor(pkg,OWNER,"root","de-DE","canonical-gymnasium-informatics","Informatik","DE","DE","Gymnasium",offer,null,null,om.writeValueAsString(info));
  var vd=new CurriculumRuntimeSnapshot.ViewDescriptor(pkg,vid,OWNER,"de-DE",scope,null,om.writeValueAsString(view));
  var od=new CurriculumRuntimeSnapshot.OfferingDescriptor(pkg,offer,OWNER,scope,"single",null,List.of(vid));
  var snapshot=new CurriculumRuntimeSnapshot(digest,List.of(pd),List.of(OWNER),Map.of(OWNER,ld),Map.of(vid,vd),Map.of(offer,od),Map.of(),Map.of(),Map.of(),Map.of(),Map.of(),0);
  PackageCompositionViewState packageViews=PackageCompositionViewState.load(snapshot,om);
  CompositionViewService packaged=new CompositionViewService(packageViews);
  for(String mode:List.of("repository","initialized-package-view-component")){
   CompositionViewService cvs=mode.equals("repository")?compositions:packaged;
   LearnerService service=new LearnerService(lr,cr,mr,pr,landscapes,mappings,null,cvs,om,e->{throw new IllegalStateException("Forbidden event");},tx);
   for(String pc:List.of("{}",om.writeValueAsString(Map.of(OWNER,Map.of("selected",true,"filterId","GK","stage","CrossStage"))),om.writeValueAsString(Map.of(OWNER,Map.of("selected",true,"filterId","LK"))))){
    learner.setSelectedCurriculum(OWNER);learner.setPersonalCurriculum(pc);learner.setStrictMode(false);inputFocus.clear();inputMastery.clear();inputMastery.put("875cb53c-b48d-5b2b-8cb0-e20f27534f16",1.0);inputMastery.put("0df1bedd-5fda-5b3b-a959-c9610237bb3e",1.0);Map<String,Double> before=new LinkedHashMap<>(inputMastery);
    Map<String,Object> row=new LinkedHashMap<>();row.put("mode",mode);row.put("actualPersonalCurriculum",learner.getPersonalCurriculum());row.put("selectedCurriculum",learner.getSelectedCurriculum());row.put("strictMode",learner.getStrictMode());row.put("activeGoalId",learner.getActiveGoalId());row.put("plan",service.getCoachPersonalizationPlan(learner.getSkillpilotId()));row.put("subjectIds",service.getPersonalCurriculumSubjectIds(learner.getSkillpilotId()));row.put("authoritative",cvs.isAuthoritativeForLandscape(OWNER));row.put("defaultView",cvs.findDefaultView(OWNER));Object projection=method("getGoalProjection",String.class,String.class).invoke(service,OWNER,pc);row.put("viewIds",access(projection,"compositionViewIds"));row.put("targetIds",sorted((Set<String>)access(projection,"targetGoalIds")));row.put("inputMastery",before);row.put("masteryUnchanged",before.equals(inputMastery));row.put("actualPcAfterRead",learner.getPersonalCurriculum());cases.add(row);
   }
  }
  Map<String,Object> output=new LinkedHashMap<>();output.put("classification","readonly component comparison; actual PackageCompositionViewState.load, explicit GK/CrossStage default fixture; no actual Info package publication or DB persistence");output.put("cases",cases);output.put("ownerHasFlow",landscapes.getById(OWNER).getPersonalizationFlow()!=null);output.put("ownerCompatibilityOnly",landscapes.isCompatibilityOnlyLandscape(OWNER));output.put("publicBaseIds",landscapes.getBaseCurricula(false).stream().map(LandscapeSummary::getCurriculumId).toList());output.put("learnerEntityFieldNames",Arrays.stream(Learner.class.getDeclaredFields()).map(Field::getName).toList());output.put("repositoryCalls",calls);output.put("dbWritesAllowed",false);om.writerWithDefaultPrettyPrinter().writeValue(dir.resolve("component-comparison.json").toFile(),output);System.out.println("TERMINAL readonly owner comparison");
 }
}
