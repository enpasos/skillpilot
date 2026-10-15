import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.landscape.LandscapeProperties;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.GoalMappingService;
import com.skillpilot.backend.service.CompositionViewService;
import com.skillpilot.backend.service.LearnerService;
import java.lang.reflect.Method;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.SimpleTransactionStatus;

class F85ActualLearnerProjectionAudit {
  static final String CHEM="c436b994-8f44-5134-b9f8-0c9f5d6a5ba0";
  static final String ROOT="a0e13c56-c25f-4742-9272-3a1a603ee52e";
  static final String F85="f85b4651-50ea-5b42-b193-3465c05257a7";
  static Object access(Object result,String name)throws Exception {
    Method m=result.getClass().getDeclaredMethod(name);m.setAccessible(true);return m.invoke(result);
  }
  public static void main(String[] args)throws Exception {
    ObjectMapper mapper=new ObjectMapper();
    LandscapeProperties props=new LandscapeProperties();props.setDirectory(args[0]);
    LandscapeService landscapes=new LandscapeService(props,mapper);
    GoalMappingService mappings=new GoalMappingService(props,mapper);
    CompositionViewService views=new CompositionViewService(props,mapper);
    PlatformTransactionManager transactions=new PlatformTransactionManager(){
      public TransactionStatus getTransaction(TransactionDefinition d){return new SimpleTransactionStatus();}
      public void commit(TransactionStatus s){throw new IllegalStateException("Read-only projection audit must not commit");}
      public void rollback(TransactionStatus s){throw new IllegalStateException("Read-only projection audit must not roll back");}
    };
    LearnerService service=new LearnerService(null,null,null,null,landscapes,mappings,null,views,mapper,event->{},transactions);
    Method projection=LearnerService.class.getDeclaredMethod("getGoalProjection",String.class,String.class,boolean.class);projection.setAccessible(true);
    List<Map<String,Object>> results=new ArrayList<>();
    for(String state:List.of("DE-BY","DE-HE","DE-HH","DE-NI","DE-RP","DE-SL","DE-SN","DE-ST")) {
      for(String stage:List.of("SekII","CrossStage")) {
        Map<String,Object> config=new LinkedHashMap<>();
        config.put(ROOT,Map.of("filterId",state,"stage",stage));
        config.put(CHEM,Map.of("selected",true,"filterId","LK"));
        Object actual=projection.invoke(service,CHEM,mapper.writeValueAsString(config),false);
        Set<?> targets=(Set<?>)access(actual,"targetGoalIds");
        Set<?> prerequisites=(Set<?>)access(actual,"prerequisiteOnlyGoalIds");
        Map<?,?> visible=(Map<?,?>)access(actual,"visibleGoals");
        Map<String,Object> row=new LinkedHashMap<>();
        row.put("jurisdiction",state);row.put("stage",stage);row.put("courseProfile","LK");
        row.put("actualCompositionViewIds",access(actual,"compositionViewIds"));row.put("compositionViewApplied",access(actual,"compositionViewApplied"));
        row.put("f85Target",targets.contains(F85));row.put("f85PrerequisiteOnly",prerequisites.contains(F85));row.put("f85Visible",visible.containsKey(F85));row.put("targetGoalCount",targets.size());
        row.put("targetGoalIds",targets);
        Map<String,Boolean> partners=new LinkedHashMap<>();
        for(String partner:List.of("b8d3b453-d638-5518-aab0-d84ec2e8567c","00139854-e5a7-5c12-ab50-2268c80bf776","14577339-9e0c-5b44-8e47-91e1a4947367","bf6c39f0-1e44-53b2-8ff6-025f2e36e125","c91350bc-7d2e-523c-bd50-0324bccfcf98","fbc5a920-05d6-53c8-9fc0-a5f4e57f2c6d","386e28af-505a-5eb9-87fe-9c6946f10433"))partners.put(partner,targets.contains(partner));
        row.put("coupledPartnerTargetMembership",partners);
        results.add(row);
      }
    }
    Path output=Path.of(args[1]);Files.createDirectories(output.getParent());
    mapper.writerWithDefaultPrettyPrinter().writeValue(output.toFile(),Map.of("actualAPI","LearnerService.getGoalProjection; no learner state mutation","fixtureCurriculaDirectory",args[0],"scopeMeasurements",results,"newScientificVotes",0,"activeWrites",false));
    System.out.println(mapper.writeValueAsString(results));
  }
}
