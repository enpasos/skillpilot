import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.landscape.LandscapeProperties;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.GoalMappingService;
import com.skillpilot.backend.service.CompositionViewService;
import com.skillpilot.backend.service.LearnerService;
import org.springframework.transaction.PlatformTransactionManager;
import static org.mockito.Mockito.mock;
import java.util.*;
import com.skillpilot.backend.landscape.LearningGoal;

/** Read-only public backend projection; no repositories or learner state are written. */
class ReadOnlySekICounts {
 public static void main(String[] args) throws Exception {
  var properties=new LandscapeProperties();properties.setDirectory(args[0]);
  var mapper=new ObjectMapper();
  var mappings=new GoalMappingService(properties,mapper);
  var landscape=new LandscapeService(properties,mapper,mappings);
  var views=new CompositionViewService(properties,mapper);
  var learner=new LearnerService(null,null,null,null,landscape,mappings,null,views,mapper,e->{},mock(PlatformTransactionManager.class));
  var projectionMethod=LearnerService.class.getDeclaredMethod("getGoalProjection",String.class,String.class,boolean.class);projectionMethod.setAccessible(true);
  var nodeTypeMethod=LearnerService.class.getDeclaredMethod("resolveNodeType",LearningGoal.class);nodeTypeMethod.setAccessible(true);
  var statsMethod=LearnerService.class.getDeclaredMethod("computeAtomicStats",Map.class,Set.class,Map.class);statsMethod.setAccessible(true);
  var result=new LinkedHashMap<String,Object>();
  for(String state:List.of("BW","BY","HB","HE","HH","MV","SL","SN","ST","TH")) {
   var durations=new LinkedHashMap<String,Object>();
   for(String duration:List.of("G8","G9")) {
    String personal="""
    {"a0e13c56-c25f-4742-9272-3a1a603ee52e":{"selected":true,"filterId":"DE-%s"},
    "__skillpilot_stage_scope_sek1__":{"selected":true},"__skillpilot_stage_scope_sek2__":{"selected":false},
    "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a":{"selected":true,"filterId":"GK","durationModel":"%s"}}
    """.formatted(state,duration);
    var rawIds=new TreeSet<>(learner.getFilteredAtomicGoalIds("a0e13c56-c25f-4742-9272-3a1a603ee52e",personal,null,false));
    var projection=projectionMethod.invoke(learner,"a0e13c56-c25f-4742-9272-3a1a603ee52e",personal,false);
    var visibleMethod=projection.getClass().getDeclaredMethod("visibleGoals");visibleMethod.setAccessible(true);
    var targetMethod=projection.getClass().getDeclaredMethod("targetGoalIds");targetMethod.setAccessible(true);
    var goals=(Map<String,LearningGoal>)visibleMethod.invoke(projection);
    var targets=(Set<String>)targetMethod.invoke(projection);
    var ids=new TreeSet<String>();
    for(var goal:goals.values())if(!"cluster".equals(nodeTypeMethod.invoke(learner,goal))&&(targets.isEmpty()||targets.contains(goal.getId())))ids.add(goal.getId());
    var stats=(com.skillpilot.backend.api.GoalStats)statsMethod.invoke(learner,goals,targets,Map.of());
    if(stats.total_atomic()!=ids.size())throw new IllegalStateException("Native UI stats mismatch");
    var rawOnly=new TreeSet<>(rawIds);rawOnly.removeAll(ids);
    durations.put(duration,Map.of("count",ids.size(),"ids",ids,"rawVisibleLeafOnlyIds",rawOnly,"nativeUiStatsTotal",stats.total_atomic()));
   }
   result.put("DE-"+state,durations);
  }
  System.out.println("READ_ONLY_SEKI="+mapper.writeValueAsString(result));
 }
}
