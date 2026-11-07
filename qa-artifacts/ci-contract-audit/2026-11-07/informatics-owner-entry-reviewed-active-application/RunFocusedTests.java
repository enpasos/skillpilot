import org.junit.platform.launcher.core.LauncherDiscoveryRequestBuilder;
import org.junit.platform.launcher.core.LauncherFactory;
import org.junit.platform.launcher.listeners.SummaryGeneratingListener;
import static org.junit.platform.engine.discovery.DiscoverySelectors.*;
public class RunFocusedTests {
 public static void main(String[] args) {
  var b=LauncherDiscoveryRequestBuilder.request();
  for(String arg:args) { int i=arg.indexOf('#'); if(i<0)b.selectors(selectClass(arg));else b.selectors(selectMethod(arg.substring(0,i),arg.substring(i+1))); }
  var listener=new SummaryGeneratingListener();var launcher=LauncherFactory.create();launcher.registerTestExecutionListeners(listener);launcher.execute(b.build());
  var s=listener.getSummary();s.printTo(new java.io.PrintWriter(System.out,true));s.printFailuresTo(new java.io.PrintWriter(System.out,true));
  if(s.getContainersFailedCount()!=0 || s.getTestsFailedCount()!=0 || s.getTestsFoundCount()!=22 || s.getTestsStartedCount()!=22 || s.getTestsSucceededCount()!=22 || s.getTestsSkippedCount()!=0 || s.getTestsAbortedCount()!=0)System.exit(1);
 }
}
