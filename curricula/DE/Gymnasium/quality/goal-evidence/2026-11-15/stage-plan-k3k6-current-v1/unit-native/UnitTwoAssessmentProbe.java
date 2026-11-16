import com.fasterxml.jackson.databind.*;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.completion.*;
import java.nio.file.*;
import java.util.*;
public class UnitTwoAssessmentProbe {
 public static void main(String[] args)throws Exception {
  var mapper=new ObjectMapper();var goals=new TreeMap<String,LearningGoal>();var targets=new TreeSet<String>();
  try(var files=Files.list(Path.of("curricula/DE/Gymnasium/canonical"))){for(var p:files.filter(p->p.toString().endsWith(".json")).sorted().toList()){var d=mapper.readTree(p.toFile());for(var n:d.get("goals")){var g=mapper.treeToValue(n,LearningGoal.class);if(goals.putIfAbsent(g.getId(),g)!=null)throw new AssertionError("Duplicate "+g.getId());}if(d.has("goalPlacements"))for(var n:d.get("goalPlacements"))if(n.path("unitId").asText().equals("physics-constant-acceleration")&&n.path("relation").asText().equals("own"))targets.add(n.path("goalId").asText());}}
  for(var g:goals.values()){if(g.getRequires()!=null)g.setRequires(g.getRequires().stream().map(s->norm(s,goals)).toList());if(g.getContains()!=null)g.setContains(g.getContains().stream().map(s->norm(s,goals)).toList());}
  if(targets.size()!=4)throw new AssertionError(targets);
  String old="c5807a37-129e-5df6-8989-482bc7f5683e",fresh="a8dc0290-9f80-5763-8943-e16b8d2aa860";var rows=new ArrayList<Object>();var inputs=List.of(Set.<String>of(),Set.of(old),Set.of(fresh),Set.of(old,fresh));
  for(int i=0;i<inputs.size();i++){var graph=new CompletionProfileCompiler().compileAutomatic(goals,targets,targets,"physics-unit-two-task-native-current");var r=new CompletionEvaluator().evaluateAutomatic(graph,inputs.get(i));if(r.complete()!=(i==3))throw new AssertionError("Unexpected completion "+i);if(!inputs.get(i).contains(fresh)&&!r.pendingTargetGoalIds().contains(fresh))throw new AssertionError("Fresh task silently discharged");if(!inputs.get(i).contains(old)&&!r.pendingTargetGoalIds().contains(old))throw new AssertionError("Old task silently discharged");rows.add(Map.of("explicitSyntheticMasteryInput",inputs.get(i),"complete",r.complete(),"pendingTargets",r.pendingTargetGoalIds(),"waivedGoals",r.waivedGoalIds()));}
  mapper.writerWithDefaultPrettyPrinter().writeValue(Path.of(args[0]).toFile(),Map.of("actualNativeMethods",List.of("CompletionProfileCompiler.compileAutomatic","CompletionEvaluator.evaluateAutomatic"),"ownUnitTargets",targets,"cases",rows,"actualLearnerDataReadOrWritten",false,"serviceOrHostClaim",false));System.out.println("Actual native two-assessment unit probe:4/4 cases pass; both real task results required.");
 }
 static String norm(String s,Map<String,LearningGoal> goals){if(goals.containsKey(s))return s;var k=s.substring(s.lastIndexOf(':')+1);if(goals.containsKey(k))return k;throw new AssertionError("Unknown "+s);}
}
