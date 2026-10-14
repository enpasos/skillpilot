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

class SixSourceDutyActualLearnerProjectionAudit {
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
    for(String state:List.of("DE-BB","DE-BE","DE-MV","DE-SN","DE-TH")) {
      for(String course:List.of("GK","LK")) {
      for(String stage:List.of("SekI","SekII","CrossStage")) {
        Map<String,Object> config=new LinkedHashMap<>();
        config.put(ROOT,Map.of("filterId",state,"stage",stage));
        config.put(CHEM,Map.of("selected",true,"filterId",course));
        Object actual=projection.invoke(service,CHEM,mapper.writeValueAsString(config),false);
        Set<?> targets=(Set<?>)access(actual,"targetGoalIds");
        Set<?> prerequisites=(Set<?>)access(actual,"prerequisiteOnlyGoalIds");
        Map<?,?> visible=(Map<?,?>)access(actual,"visibleGoals");
        Map<String,Object> row=new LinkedHashMap<>();
        row.put("jurisdiction",state);row.put("stage",stage);row.put("courseProfile",course);
        row.put("actualCompositionViewIds",access(actual,"compositionViewIds"));row.put("compositionViewApplied",access(actual,"compositionViewApplied"));
        row.put("f85Target",targets.contains(F85));row.put("f85PrerequisiteOnly",prerequisites.contains(F85));row.put("f85Visible",visible.containsKey(F85));row.put("targetGoalCount",targets.size());
        row.put("targetGoalIds",targets);
        Map<String,Boolean> partners=new LinkedHashMap<>();
        for(String partner:List.of("d2ccd1d5-56f7-583f-9724-e97441367f91","1351706f-4ea6-56e9-951b-87b24cbcdee8","13d4f336-ab16-54a7-9479-c920b458f385","416dfd33-8b43-5c49-903c-9847b95e4208","3899edf4-a809-54b1-8ee7-4e67aa82dc7c","d4928773-3be8-5cf1-907c-ef07c96751e8","91cd4728-b811-562a-970b-18b81dfb4bdf","9b942490-ad8f-52ba-8c5a-f8a9792b7db5","a4bac92b-d685-5cb6-94c8-c9b8b878d125","c3077d95-f3fe-5579-8493-cb92992809c4"))partners.put(partner,targets.contains(partner));
        row.put("coupledPartnerTargetMembership",partners);
        results.add(row);
      }
    }
    }
    Path output=Path.of(args[1]);Files.createDirectories(output.getParent());
    mapper.writerWithDefaultPrettyPrinter().writeValue(output.toFile(),Map.of("actualAPI","LearnerService.getGoalProjection; no learner state mutation","fixtureCurriculaDirectory",args[0],"scopeMeasurements",results,"newScientificVotes",0,"activeWrites",false));
    System.out.println(mapper.writeValueAsString(results));
  }
}
