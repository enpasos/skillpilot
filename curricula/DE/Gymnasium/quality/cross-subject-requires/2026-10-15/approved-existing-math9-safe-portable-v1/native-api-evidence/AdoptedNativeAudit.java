/* SPDX-License-Identifier: Apache-2.0 */
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.*;
import com.skillpilot.backend.landscape.*;
import com.skillpilot.backend.service.*;
import java.io.*;
import java.lang.reflect.*;
import java.nio.file.*;
import java.security.MessageDigest;
import java.util.*;
import org.springframework.transaction.*;
import org.springframework.transaction.support.SimpleTransactionStatus;

/** Native production methods with no repositories, learner, persistence or HTTP clients. */
public class AdoptedNativeAudit {
 static final String ROOT_ID="a0e13c56-c25f-4742-9272-3a1a603ee52e",MATH="68a8ac50-f5f5-4e24-8aa9-5e408ca01ced",PHYSICS="7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
 static final TypeReference<List<Map<String,Object>>> ROWS=new TypeReference<>(){};
 static class BindingMapper extends ObjectMapper {
  final Path root; final Map<Path,Map<String,Object>> bindings=new LinkedHashMap<>();
  BindingMapper(Path root){this.root=root;}
  void bind(File file)throws IOException {
   Path p=file.toPath().toAbsolutePath().normalize(); if(bindings.containsKey(p))return;
   byte[] b=Files.readAllBytes(p); Map<String,Object> row=new LinkedHashMap<>();
   row.put("path",root.relativize(p).toString());row.put("bytes",b.length);row.put("sha256",sha(b));bindings.put(p,row);
  }
  @Override public JsonNode readTree(File f)throws IOException{bind(f);return super.readTree(f);}
  @Override public <T>T readValue(File f,TypeReference<T> t)throws IOException{bind(f);return super.readValue(f,t);}
  @Override public <T>T readValue(File f,Class<T> t)throws IOException{bind(f);return super.readValue(f,t);}
  void verify()throws IOException{for(var e:bindings.entrySet())if(!sha(Files.readAllBytes(e.getKey())).equals(e.getValue().get("sha256")))throw new IllegalStateException("Input drift "+e.getKey());}
 }
 static String sha(byte[] bytes){try{return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes));}catch(Exception e){throw new RuntimeException(e);}}
 static Object value(Object obj,String name)throws Exception{Method m=obj.getClass().getDeclaredMethod(name);m.setAccessible(true);return m.invoke(obj);}
 static void write(ObjectMapper mapper,Path base,String name,Object v)throws IOException{Path p=base.resolve(name);if(Files.exists(p))throw new IllegalStateException("Do not overwrite "+p);mapper.writerWithDefaultPrettyPrinter().writeValue(p.toFile(),v);}
 @SuppressWarnings("unchecked") public static void main(String[] args)throws Exception{
  Path root=Path.of(args[0]),base=Path.of(args[1]); BindingMapper mapper=new BindingMapper(root);
  LandscapeProperties properties=new LandscapeProperties();properties.setDirectory(root.resolve("curricula").toString());
  GoalMappingService mappings=new GoalMappingService(properties,mapper);
  LandscapeService landscapes=new LandscapeService(properties,mapper,mappings);
  Map<String,LearningGoal> graph=new LinkedHashMap<>();Map<String,List<String>> contains=new LinkedHashMap<>();
  for(String id:List.of(MATH,PHYSICS))for(LearningGoal g:landscapes.getById(id).getGoals()){
   if(graph.put(g.getId(),g)!=null)throw new IllegalStateException("duplicate "+g.getId());contains.put(g.getId(),g.getContains()==null?List.of():g.getContains());
  }
  CompositionViewService composition=new CompositionViewService(properties,mapper,()->contains);
  PlatformTransactionManager noTx=new PlatformTransactionManager(){public TransactionStatus getTransaction(TransactionDefinition d){throw new IllegalStateException("Audit prohibits transaction");}public void commit(TransactionStatus s){throw new IllegalStateException("Audit prohibits commit");}public void rollback(TransactionStatus s){throw new IllegalStateException("Audit prohibits rollback");}};
  LearnerService learner=new LearnerService(null,null,null,null,landscapes,mappings,null,composition,mapper,null,noTx);
  Method effective=LearnerService.class.getDeclaredMethod("computeEffectiveRequires",Map.class);effective.setAccessible(true);
  write(mapper,base,"native-effective-requires.actual.json",effective.invoke(learner,graph));
  List<Map<String,Object>> matches=new ArrayList<>();
  for(Map<String,Object> request:mapper.readValue(base.resolve("native-scope-requests.prepared.json").toFile(),ROWS)){
   Map<String,Object> row=new LinkedHashMap<>(request);try{row.put("matchedView",composition.findMatchingView((String)request.get("landscapeId"),(Map<String,String>)request.get("requestedScope")));}catch(Exception e){row.put("nativeError",e.toString());}
   row.put("actualProductionMatcherInvoked",true);matches.add(row);
  }
  write(mapper,base,"native-scope-matches.actual.json",matches);
  Method projection=LearnerService.class.getDeclaredMethod("computeGoalProjection",String.class,String.class,boolean.class);projection.setAccessible(true);
  List<Map<String,Object>> projections=new ArrayList<>();int n=0;
  for(Map<String,Object> request:mapper.readValue(base.resolve("native-configuration-requests.prepared.json").toFile(),ROWS)){
   Map<String,Object> row=new LinkedHashMap<>(request);
   try{
    Object p=projection.invoke(learner,ROOT_ID,mapper.writeValueAsString(request.get("personalCurriculum")),false);
    row.put("targetGoalIds",value(p,"targetGoalIds"));row.put("prerequisiteOnlyGoalIds",value(p,"prerequisiteOnlyGoalIds"));row.put("compositionViewIds",value(p,"compositionViewIds"));row.put("compositionViewApplied",value(p,"compositionViewApplied"));
    row.put("structuralGoalIds",((Map<String,LearningGoal>)value(p,"structuralGoals")).keySet());
   }catch(InvocationTargetException e){row.put("nativeProjectionError",e.getCause().toString());}
   row.put("actualLearnerServiceProjectionInvoked",true);row.put("learnerOrPersistenceWrites",false);projections.add(row);
   if(++n%50==0)System.out.println("native configurations completed "+n);
  }
  write(mapper,base,"native-learner-projections.actual.json",projections);
  mapper.verify();write(mapper,base,"native-read-inputs.actual.json",mapper.bindings.values());
  write(mapper,base,"native-execution-summary.actual.json",Map.of("nativeScopeRequests",matches.size(),"nativeLearnerConfigurations",projections.size(),"currentProductionMethods",List.of("CompositionViewService.findMatchingView","LearnerService.computeGoalProjection","LearnerService.computeEffectiveRequires"),"trackedNativeJsonReadFiles",mapper.bindings.size(),"allInputsUnchangedAfterNativeExecution",true,"repositoriesAndLearnerInstances",0,"transactionsAndLearnerWrites",0,"realUserOrHostAcceptance",false));
  System.out.println("Native audit finished with "+matches.size()+" scope matches, "+projections.size()+" learner projections, "+mapper.bindings.size()+" exact input files.");
 }
}
