import com.skillpilot.backend.testsupport.OwnedMockitoMocks;
import java.util.*;
import java.util.concurrent.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.parallel.*;
import org.junit.platform.engine.TestExecutionResult;
import org.junit.platform.engine.discovery.DiscoverySelectors;
import org.junit.platform.launcher.*;
import org.junit.platform.launcher.core.*;
import org.junit.platform.launcher.listeners.SummaryGeneratingListener;
import org.mockito.Mockito;
import org.mockito.exceptions.misusing.DisabledMockException;
public class OwnershipBoundaryProbe {
 static class Box {int value(){return 0;}}
 static final Map<String,Box> mocks=new ConcurrentHashMap<>();static final Set<String> threads=ConcurrentHashMap.newKeySet();
 static final CountDownLatch ready=new CountDownLatch(2),firstFinished=new CountDownLatch(1);static Box outside;
 static Box own(String id){Box b=Mockito.mock(Box.class);Mockito.when(b.value()).thenReturn(17);mocks.put(id,b);return b;}
 static void check(boolean condition,String message){if(!condition)throw new AssertionError(message);}
 @ExtendWith(OwnedMockitoMocks.class) @Execution(ExecutionMode.CONCURRENT)
 public static class ParallelFixtures {
  @Test void first()throws Exception{threads.add(Thread.currentThread().getName());Box b=own("parallel-first");ready.countDown();check(ready.await(15,TimeUnit.SECONDS),"not parallel");check(b.value()==17&&outside.value()==99,"active own or foreign mock failed");}
  @Test void second()throws Exception{threads.add(Thread.currentThread().getName());Box b=own("parallel-second");ready.countDown();check(ready.await(15,TimeUnit.SECONDS),"not parallel");check(firstFinished.await(15,TimeUnit.SECONDS),"first did not finish");check(b.value()==17&&outside.value()==99,"sibling cleanup damaged active mock");}
 }
 @ExtendWith(OwnedMockitoMocks.class)
 public static class BodyFailureFixture {@Test void fails(){own("body-failure");throw new IllegalStateException("intentional body failure for lifecycle probe");}}
 @ExtendWith(OwnedMockitoMocks.class)
 public static class SetupFailureFixture {@BeforeEach void setup(){own("setup-failure");throw new IllegalStateException("intentional setup failure for lifecycle probe");}@Test void body(){throw new AssertionError("body should not run");}}
 @ExtendWith(OwnedMockitoMocks.class)
 public static class SuccessAfterFailures {@Test void succeeds(){check(own("after-failures").value()==17&&outside.value()==99,"listener not reusable");}}
 static void run(Class<?> type,int failures)throws Exception{
  var summary=new SummaryGeneratingListener();Launcher launcher=LauncherFactory.create();launcher.registerTestExecutionListeners(new TestExecutionListener(){public void executionFinished(TestIdentifier id,TestExecutionResult r){if(id.isTest()&&id.getDisplayName().equals("first()"))firstFinished.countDown();}});
  launcher.execute(LauncherDiscoveryRequestBuilder.request().selectors(DiscoverySelectors.selectClass(type)).configurationParameter("junit.jupiter.execution.parallel.enabled","true").configurationParameter("junit.jupiter.execution.parallel.config.strategy","fixed").configurationParameter("junit.jupiter.execution.parallel.config.fixed.parallelism","2").configurationParameter("junit.jupiter.execution.parallel.config.fixed.max-pool-size","2").build(),summary);
  var s=summary.getSummary();System.out.printf("BOUNDARY %s tests=%d expectedFailures=%d actualFailures=%d containersFailed=%d%n",type.getSimpleName(),s.getTestsFoundCount(),failures,s.getTestsFailedCount(),s.getContainersFailedCount());check(s.getTestsFailedCount()==failures&&s.getContainersFailedCount()==0&&s.getTestsSkippedCount()==0,"unexpected JUnit outcome");
 }
 public static void main(String[] args)throws Exception{
  outside=Mockito.mock(Box.class);Mockito.when(outside.value()).thenReturn(99);run(ParallelFixtures.class,0);check(threads.size()==2,"did not use two threads");run(BodyFailureFixture.class,1);run(SetupFailureFixture.class,1);run(SuccessAfterFailures.class,0);
  for(var entry:mocks.entrySet()){boolean disabled=false;try{entry.getValue().value();}catch(DisabledMockException expected){disabled=true;}check(disabled,"owned mock not released: "+entry.getKey());}
  check(outside.value()==99,"foreign mock changed");System.out.printf("BOUNDARY PASS ownedReleased=%d concurrentThreads=%s foreignStub=99%n",mocks.size(),threads);
 }
}
