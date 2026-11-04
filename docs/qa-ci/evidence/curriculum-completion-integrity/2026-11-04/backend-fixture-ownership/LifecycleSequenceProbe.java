import java.lang.management.ManagementFactory;
import java.lang.reflect.*;
import java.util.*;
import org.junit.platform.engine.TestExecutionResult;
import org.junit.platform.engine.discovery.DiscoverySelectors;
import org.junit.platform.launcher.*;
import org.junit.platform.launcher.core.*;
import org.junit.platform.launcher.listeners.SummaryGeneratingListener;
import org.mockito.Mockito;
import org.springframework.context.ApplicationContext;
import org.springframework.test.context.TestContextManager;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.service.CompositionViewService;

public class LifecycleSequenceProbe {
 static final String PKG="com.skillpilot.backend.service.";
 static final String SRS=PKG+"SrsMasteryBatchQueryTest";
 static final String BOUND="CompositionBoundCanonicalFocusRegressionTest";
 static final String SENTINEL="__owned_mock_lifecycle_probe__";
 static final Map<String,Object> sharedStub=Map.of("viewId",SENTINEL);
 static String phase; static int tests,failures,guardFailures; static boolean sharedConfigured,guardSpring;
 static List<?> sentinel;static LandscapeService springSpy;static LearningGoal springStub;
 static CompositionViewService sharedView()throws Exception{Field f=Class.forName(PKG+BOUND).getDeclaredField("views");f.setAccessible(true);return(CompositionViewService)f.get(null);}
 static void measure(String label)throws Exception{System.gc();Thread.sleep(80);System.gc();Thread.sleep(80);System.out.printf("SEQUENCE HEAP %s usedMiB=%.1f%n",label,ManagementFactory.getMemoryMXBean().getHeapMemoryUsage().getUsed()/1048576.0);}
 static void guards()throws Exception{
  if(sentinel.size()!=12345)throw new AssertionError("outside mock disabled or reset");
  if(guardSpring&&springSpy.getGoalDefinition(SENTINEL)!=springStub)throw new AssertionError("cached Spring spy disabled or reset");
  if(phase.equals(BOUND)&&sharedConfigured&&sharedView().findViewById(SENTINEL)!=sharedStub)throw new AssertionError("shared spy stub disabled or reset between methods");
 }
 public static void main(String[] args)throws Exception{
  sentinel=Mockito.mock(List.class);Mockito.when(sentinel.size()).thenReturn(12345);
  Launcher launcher=LauncherFactory.create();
  launcher.registerTestExecutionListeners(new TestExecutionListener(){
   public void executionStarted(TestIdentifier id){if(!id.isTest())return;try{
    if(phase.equals(BOUND)&&!sharedConfigured){Mockito.doReturn(sharedStub).when(sharedView()).findViewById(SENTINEL);sharedConfigured=true;}
    System.out.println("SEQUENCE START "+phase+" "+id.getDisplayName());
   }catch(Throwable e){guardFailures++;System.out.println("SEQUENCE GUARD FAILURE "+phase);e.printStackTrace();}}
   public void executionFinished(TestIdentifier id,TestExecutionResult result){
    if(result.getStatus()==TestExecutionResult.Status.FAILED){failures++;System.out.println("SEQUENCE FAILURE "+phase+" "+id.getDisplayName());result.getThrowable().ifPresent(Throwable::printStackTrace);}
    if(id.isTest()){tests++;try{guards();}catch(Throwable e){guardFailures++;System.out.println("SEQUENCE GUARD FAILURE "+phase);e.printStackTrace();}System.out.printf("SEQUENCE FINISH phase=%s test=%d status=%s%n",phase,tests,result.getStatus());}
   }
  });
  List<String> phases=List.of("SrsMasteryBatchQueryTest",BOUND,"LearnerFrontierInvariantTest","LearnerProjectionMemoizationTest","LearnerServiceCanonicalProjectionTest","LearnerServiceCrossSubjectPilotTest","MitOcwFrontierWalkthroughTest","SrsMasteryBatchQueryTest");
  ApplicationContext context=null;int run=0;
  for(String name:phases){phase=name;run++;if(name.equals("SrsMasteryBatchQueryTest"))guardSpring=false;
   var summary=new SummaryGeneratingListener();launcher.execute(LauncherDiscoveryRequestBuilder.request().selectors(DiscoverySelectors.selectClass(PKG+name)).configurationParameter("junit.jupiter.execution.parallel.enabled","false").build(),summary);
   var s=summary.getSummary();System.out.printf("SEQUENCE CLASS run=%d name=%s tests=%d passed=%d failed=%d skipped=%d containersFailed=%d%n",run,name,s.getTestsFoundCount(),s.getTestsSucceededCount(),s.getTestsFailedCount(),s.getTestsSkippedCount(),s.getContainersFailedCount());
   if(s.getTestsSkippedCount()>0||s.getContainersFailedCount()>0)throw new AssertionError("incomplete class execution");
   if(run==1){context=new TestContextManager(Class.forName(SRS)).getTestContext().getApplicationContext();springSpy=context.getBean(LandscapeService.class);springStub=new LearningGoal();springStub.setId(SENTINEL);Mockito.doReturn(springStub).when(springSpy).getGoalDefinition(SENTINEL);guardSpring=true;System.out.println("SEQUENCE SPRING context="+System.identityHashCode(context)+" spy="+System.identityHashCode(springSpy));}
   if(run==phases.size()){var again=new TestContextManager(Class.forName(SRS)).getTestContext().getApplicationContext();if(again!=context||again.getBean(LandscapeService.class)!=springSpy)throw new AssertionError("Spring context was rebuilt instead of retained");System.out.println("SEQUENCE SAME_SPRING_CONTEXT_AND_SPY true");}
   measure("after-"+run+"-"+name);
  }
  System.out.printf("SEQUENCE TOTAL tests=%d failures=%d guardFailures=%d%n",tests,failures,guardFailures);System.exit(failures==0&&guardFailures==0?0:1);
 }
}
