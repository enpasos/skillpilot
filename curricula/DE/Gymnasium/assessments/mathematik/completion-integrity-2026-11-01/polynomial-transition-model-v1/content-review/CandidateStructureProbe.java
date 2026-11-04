import java.nio.file.*;
import java.util.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.landscape.*;
import com.skillpilot.backend.completion.*;
public class CandidateStructureProbe {
 public static void main(String[] args) throws Exception {
  var mapper=new ObjectMapper();Map<String,LearningGoal> goals=new TreeMap<>();
  for(var node:mapper.readTree(Path.of(args[0]).toFile()).path("goals")){var goal=mapper.treeToValue(node,LearningGoal.class);goals.put(goal.getId(),goal);}
  var candidate=mapper.readValue(Path.of(args[1]).toFile(),LearningGoal.class);
  if(goals.putIfAbsent(candidate.getId(),candidate)!=null)throw new IllegalStateException("Candidate ID already exists");
  var selected=Set.of(candidate.getId());
  var graph=new CompletionProfileCompiler().compileAutomatic(goals,selected,selected,"draft-polynomial-transition-candidate-only");
  var needed=new TreeSet<String>();var queue=new ArrayDeque<String>();queue.add(candidate.getId());
  while(!queue.isEmpty()){String next=queue.removeFirst();if(needed.add(next))queue.addAll(graph.directPrerequisites(next));}
  var covered=new TreeSet<>(candidate.getExamData().getCoveredGoalIds());
  if(!needed.containsAll(covered))throw new IllegalStateException("Covered skills are not in real prerequisite demand");
  if(ExamTaskReadiness.isReady(candidate.getExamData()))throw new IllegalStateException("Draft must not be runtime-ready");
  double points=candidate.getExamData().getScoring().getSteps().stream().mapToDouble(ExamData.Step::getPoints).sum();
  if(points!=13||candidate.getExamData().getScoring().getMaxPoints()!=13||candidate.getExamData().getScoring().getPassingPoints()!=11)throw new IllegalStateException("Invalid points");
  mapper.writerWithDefaultPrettyPrinter().writeValue(Path.of(args[2]).toFile(),Map.of(
   "status","DRAFT_NATIVE_GRAPH_CHECK_NOT_SELECTION_SCOPE_OR_M7_ACCEPTANCE",
   "newGoalId",candidate.getId(),"selectedOnlyForThisIsolatedProbe",selected,"selectedProtectedRoots",graph.protectedTargetGoalIds(),
   "coveredSkillsReached",covered,"contextGoalIds",new TreeSet<>(graph.contextGoalIds()),
   "directPreparationIds",graph.directPrerequisites(candidate.getId()),"draftRuntimeReady",false,"rubricPoints",points,
   "passingPoints",candidate.getExamData().getScoring().getPassingPoints()));
  System.out.println("Candidate DAG compiles; all three covered skills reached; one draft protected root, not runtime-ready.");
 }
}
