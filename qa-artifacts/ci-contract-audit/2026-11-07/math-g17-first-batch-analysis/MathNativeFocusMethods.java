import com.fasterxml.jackson.databind.*;
import com.skillpilot.backend.landscape.*;
import com.skillpilot.backend.service.*;
import com.skillpilot.backend.completion.*;
import java.nio.file.*;
import java.lang.reflect.*;
import java.util.*;
/** Finite component replay; constructs labelled target/focus inputs, never claims a loaded Personal Curriculum. */
class MathNativeFocusMethods {
 static final String A="304111dd-426b-520b-a275-3fa37da1b0e0", B="b5062446-332f-4a67-aaf7-3bfa3e5aded9", I="71cec9fb-3751-4d61-8b34-c5adbbf6e5f2", U="dbc13bb0-963b-49a8-a441-2183f4b64c8e";
 public static void main(String[] args)throws Exception {
  ObjectMapper om=new ObjectMapper().configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES,false);
  LearnerService svc=new LearnerService(null,null,null,null,null,null,null,om,e->{throw new IllegalStateException("Event forbidden");});
  Class<?> gp=Arrays.stream(LearnerService.class.getDeclaredClasses()).filter(c->c.getSimpleName().equals("GoalProjection")).findFirst().orElseThrow();
  Class<?> fp=Arrays.stream(LearnerService.class.getDeclaredClasses()).filter(c->c.getSimpleName().equals("FrontierPrerequisites")).findFirst().orElseThrow();
  Constructor<?> gpc=gp.getDeclaredConstructors()[0],fpc=fp.getDeclaredConstructors()[0];gpc.setAccessible(true);fpc.setAccessible(true);
  Method allowed=LearnerService.class.getDeclaredMethod("areFrontierPrerequisitesMastered",LearningGoal.class,gp,fp);allowed.setAccessible(true);
  List<Object> rows=new ArrayList<>();
  for(int revision=0;revision<2;revision++){
   JsonNode root=om.readTree(Path.of(args[revision]).toFile());Map<String,LearningGoal> goals=new LinkedHashMap<>();for(JsonNode n:root.get("goals")){LearningGoal g=om.treeToValue(n,LearningGoal.class);goals.put(g.getId(),g);}
   var top=new CompletionProfileCompiler().normalizePrerequisites(goals);top.validateContext(Set.of(A,U));
   for(String scenario:List.of("A-and-intro-focus-carrier-outside-open","A-and-intro-focus-carrier-mastered","single-A-focus-normal","single-A-strict-carrier-mastered","all-demand-mastered-positive","missing-intro-Level2-direct-guard")){
    String id=scenario.startsWith("missing")?U:A;Set<String> targets=new LinkedHashSet<>(goals.keySet());Map<String,Double> mastery=new HashMap<>();Set<String> focus=Set.of(A,I);
    if(scenario.contains("carrier-mastered"))mastery.put(B,1.0);
    if(scenario.equals("single-A-focus-normal"))focus=Set.of(A);
    if(scenario.equals("single-A-strict-carrier-mastered"))focus=null;
    if(scenario.equals("all-demand-mastered-positive")){focus=null;top.transitivePrerequisites(id).forEach(x->mastery.put(x,1.0));}
    if(scenario.startsWith("missing")){targets.remove(I);focus=Set.of(U);}
    Object projection=gpc.newInstance(goals,targets,Set.of(),goals,Set.of("EXPLICIT_COMPONENT_FIXTURE_NOT_NATIVE_PC"),List.of(),true);
    Object prerequisites=fpc.newInstance(goals,top,mastery,focus);
    Map<String,Object> row=new LinkedHashMap<>();row.put("revision",revision==0?"before":"after");row.put("scenario",scenario);row.put("goalId",id);row.put("focus",focus);row.put("mastery",mastery);row.put("introInLevel2Targets",targets.contains(I));row.put("nativeTransitiveDemand",top.transitivePrerequisites(id));row.put("nativeServicePredicateAllowed",allowed.invoke(svc,goals.get(id),projection,prerequisites));rows.add(row);
   }
  }
  om.writerWithDefaultPrettyPrinter().writeValue(Path.of(args[2]).toFile(),rows);
 }
}
