import org.junit.platform.launcher.core.LauncherDiscoveryRequestBuilder;
import org.junit.platform.launcher.core.LauncherFactory;
import org.junit.platform.launcher.listeners.SummaryGeneratingListener;
import static org.junit.platform.engine.discovery.DiscoverySelectors.*;
public class RunProjectionTests {
 public static void main(String[] args) {
  int expected=Integer.parseInt(args[0]);var b=LauncherDiscoveryRequestBuilder.request();
  for(int i=1;i<args.length;i++)b.selectors(selectClass(args[i]));
  var listener=new SummaryGeneratingListener();var launcher=LauncherFactory.create();launcher.registerTestExecutionListeners(listener);launcher.execute(b.build());
  var s=listener.getSummary();s.printTo(new java.io.PrintWriter(System.out,true));s.printFailuresTo(new java.io.PrintWriter(System.out,true));
  if(s.getContainersFailedCount()!=0||s.getTestsFoundCount()!=expected||s.getTestsStartedCount()!=expected||s.getTestsSucceededCount()!=expected||s.getTestsFailedCount()!=0||s.getTestsSkippedCount()!=0||s.getTestsAbortedCount()!=0)System.exit(1);
 }
}
