import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.landscape.LandscapeProperties;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.GoalMappingService;
import com.skillpilot.backend.service.CompositionViewService;
import com.skillpilot.backend.service.LearnerService;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.SimpleTransactionStatus;
import java.util.*;
import com.skillpilot.backend.landscape.LearningGoal;

/** Read-only public backend projection; no repositories or learner state are written. */
class ReadOnlyEconomicsSekIOrigins {
 public static void main(String[] args) throws Exception {
  var properties=new LandscapeProperties();properties.setDirectory(args[0]);
  var mapper=new ObjectMapper();
  var mappings=new GoalMappingService(properties,mapper);
  var landscape=new LandscapeService(properties,mapper,mappings);
  var views=new CompositionViewService(properties,mapper);
  var learner=new LearnerService(null,null,null,null,landscape,mappings,null,views,mapper,e->{},new PlatformTransactionManager(){public TransactionStatus getTransaction(TransactionDefinition d){return new SimpleTransactionStatus();}public void commit(TransactionStatus s){}public void rollback(TransactionStatus s){}});
  var projectionMethod=LearnerService.class.getDeclaredMethod("getGoalProjection",String.class,String.class,boolean.class);projectionMethod.setAccessible(true);
  var parseMethod=LearnerService.class.getDeclaredMethod("parsePersonalCurriculumConfig",String.class);parseMethod.setAccessible(true);
  var scopeMethod=LearnerService.class.getDeclaredMethod("deriveCompositionScope",String.class,Map.class);scopeMethod.setAccessible(true);
  var collectMethod=LearnerService.class.getDeclaredMethod("collectCompositionViewGoalReferences",Object.class,Map.class);collectMethod.setAccessible(true);
  var assignmentMethod=LearnerService.class.getDeclaredMethod("resolveCompositionProjectionAssignments",Map.class,Map.class);assignmentMethod.setAccessible(true);
  var matchesMethod=LearnerService.class.getDeclaredMethod("matchesFilter",LearningGoal.class,com.skillpilot.backend.landscape.SkillLandscape.class,String.class,boolean.class,Map.class,Map.class);matchesMethod.setAccessible(true);
  var econ=landscape.getById("605bdaf6-32d5-56fd-8d92-5a80c2fd2901");
  var econGoals=new LinkedHashMap<String,LearningGoal>();for(var g:econ.getGoals())econGoals.put(g.getId(),g);
  var inventory=(Map<String,Object>)mapper.readValue(new java.io.File(args[1]),Map.class);
  var result=new ArrayList<Map<String,Object>>();
  for(var rawRow:(List<Map<String,Object>>)inventory.get("rows")) {
   String state=(String)rawRow.get("jurisdiction"),id=(String)rawRow.get("id");
   var durations=new LinkedHashMap<String,Object>();
   for(String duration:List.of("G8","G9")) {
    String personal="""
    {"a0e13c56-c25f-4742-9272-3a1a603ee52e":{"selected":true,"filterId":"%s"},
    "__skillpilot_stage_scope_sek1__":{"selected":true},"__skillpilot_stage_scope_sek2__":{"selected":false},
    "605bdaf6-32d5-56fd-8d92-5a80c2fd2901":{"selected":true,"filterId":"GK","durationModel":"%s"}}
    """.formatted(state,duration);
    var config=(Map)parseMethod.invoke(learner,personal);
    var scope=(Map<String,String>)scopeMethod.invoke(learner,econ.getLandscapeId(),config);
    var matchedView=views.findLearnerScopeView(econ.getLandscapeId(),scope);
    var projection=projectionMethod.invoke(learner,"a0e13c56-c25f-4742-9272-3a1a603ee52e",personal,false);
    var visibleMethod=projection.getClass().getDeclaredMethod("visibleGoals");visibleMethod.setAccessible(true);
    var targetMethod=projection.getClass().getDeclaredMethod("targetGoalIds");targetMethod.setAccessible(true);
    var prerequisiteMethod=projection.getClass().getDeclaredMethod("prerequisiteOnlyGoalIds");prerequisiteMethod.setAccessible(true);
    var structuralMethod=projection.getClass().getDeclaredMethod("structuralGoals");structuralMethod.setAccessible(true);
    var viewIdMethod=projection.getClass().getDeclaredMethod("compositionViewIds");viewIdMethod.setAccessible(true);
    var visible=(Map<String,LearningGoal>)visibleMethod.invoke(projection);
    var targets=(Set<String>)targetMethod.invoke(projection);
    var prerequisites=(Set<String>)prerequisiteMethod.invoke(projection);
    var structural=(Map<String,LearningGoal>)structuralMethod.invoke(projection);
    var references=new LinkedHashMap<String,Object>();collectMethod.invoke(learner,matchedView.get("rootNodes"),references);
    var assignments=(Map<String,Object>)assignmentMethod.invoke(learner,references,structural);
    var assignment=assignments.get(id);
    var assignmentFields=new LinkedHashMap<String,Object>();
    for(String field:List.of("role","direct","distance")){var m=assignment.getClass().getDeclaredMethod(field);m.setAccessible(true);assignmentFields.put(field,String.valueOf(m.invoke(assignment)));}
    var details=new LinkedHashMap<String,Object>();details.put("requestedScope",scope);details.put("matchedViewId",matchedView.get("viewId"));details.put("matchedViewScope",matchedView.get("scope"));details.put("compositionViewIds",viewIdMethod.invoke(projection));details.put("actualTarget",targets.contains(id));details.put("actualPrerequisiteOnly",prerequisites.contains(id));details.put("actualVisible",visible.containsKey(id));details.put("nativeAssignment",assignmentFields);
    details.put("runtimeGoal",mapper.convertValue(econGoals.get(id),Map.class));
    var flags=new LinkedHashMap<String,Object>();for(String filter:List.of(state,"GK",duration)){flags.put(filter,matchesMethod.invoke(learner,econGoals.get(id),econ,filter,false,new HashMap<>(),new HashMap<>()));}details.put("nativeFilterPass",flags);
    var directDependents=new TreeSet<String>();for(var g:visible.values())if(g.getRequires()!=null&&g.getRequires().contains(id))directDependents.add(g.getId());details.put("visibleDirectRequiresDependents",directDependents);
    if(!targets.contains(id)||prerequisites.contains(id))throw new IllegalStateException("actual added ID is not target "+state+":"+id);
    durations.put(duration,details);
   }
   result.add(Map.of("jurisdiction",state,"id",id,"durations",durations));
  }
  System.out.println("READ_ONLY_SEKI_ORIGINS="+mapper.writeValueAsString(result));
 }
}
