import org.junit.platform.launcher.core.LauncherDiscoveryRequestBuilder;
import org.junit.platform.launcher.core.LauncherFactory;
import org.junit.platform.launcher.listeners.SummaryGeneratingListener;
import static org.junit.platform.engine.discovery.DiscoverySelectors.selectClass;
public class RunRestartTest {
 public static void main(String[] args) {
  var request=LauncherDiscoveryRequestBuilder.request().selectors(selectClass("com.skillpilot.backend.service.AssessmentCompletionRestartIntegrationTest")).build();
  var listener=new SummaryGeneratingListener(); var launcher=LauncherFactory.create();
  launcher.registerTestExecutionListeners(listener); launcher.execute(request);
  var summary=listener.getSummary();
  summary.printTo(new java.io.PrintWriter(System.out,true)); summary.printFailuresTo(new java.io.PrintWriter(System.out,true));
  if(summary.getTestsFoundCount()!=1 || summary.getTestsStartedCount()!=1 || summary.getTestsSucceededCount()!=1 || summary.getTestsSkippedCount()!=0 || summary.getTestsAbortedCount()!=0 || summary.getTestsFailedCount()!=0 || summary.getContainersFailedCount()!=0)System.exit(1);
 }
}
