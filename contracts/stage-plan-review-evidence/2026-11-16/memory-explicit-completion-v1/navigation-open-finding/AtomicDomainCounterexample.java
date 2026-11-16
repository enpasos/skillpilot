import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.landscape.SkillLandscape;
import com.skillpilot.backend.service.LearnerService;
import com.skillpilot.backend.completion.CompletionProfileCompiler;
import com.skillpilot.backend.completion.CompletionCompilationException;
import com.skillpilot.backend.completion.PersonalCurriculumLearningScope;
import java.lang.reflect.*;
import java.nio.file.*;
import java.util.*;
import java.security.MessageDigest;

/** Read-only native mechanism counterexample, not a replay of the observed HTTP learner. */
public class AtomicDomainCounterexample {
 public static void main(String[] args) throws Exception {
  ObjectMapper mapper=new ObjectMapper().findAndRegisterModules();
  try(var bytes=LearnerService.class.getResourceAsStream("/com/skillpilot/backend/service/LearnerService.class")){
   System.out.println("NATIVE_LEARNER_SERVICE_CLASS_SHA256="+HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes.readAllBytes())));
  }
  var landscape=mapper.readValue(Path.of(args[0]).toFile(),SkillLandscape.class);
  String orientation="65365dce-f33f-49d8-9516-42f75883aa86",memory="4eefbd04-9e49-41ea-a087-9ad6ac71ec5a";
  Map<String,LearningGoal> canonical=new LinkedHashMap<>();
  for(var g:landscape.getGoals())if(g.getId().equals(orientation)||g.getId().equals(memory))canonical.put(g.getId(),g);
  if(canonical.size()!=2)throw new AssertionError("Actual fixture pair absent");
  var learning=PersonalCurriculumLearningScope.compile(canonical,Set.of(orientation,memory));
  String navigation="composition:de-de-gym-math-gk:structure:sek1";
  LearningGoal structuralNav=new LearningGoal();structuralNav.setId(navigation);structuralNav.setType("cluster");structuralNav.setContains(List.of(memory));
  LearningGoal visibleNav=mapper.convertValue(structuralNav,LearningGoal.class);visibleNav.setContains(List.of());
  Map<String,LearningGoal> structural=new LinkedHashMap<>(canonical);structural.put(navigation,structuralNav);
  Map<String,LearningGoal> visible=new LinkedHashMap<>(canonical);visible.put(navigation,visibleNav);
  Class<?> projectionClass=Arrays.stream(LearnerService.class.getDeclaredClasses()).filter(c->c.getSimpleName().equals("GoalProjection")).findFirst().orElseThrow();
  Constructor<?> projectionConstructor=projectionClass.getDeclaredConstructors()[0];projectionConstructor.setAccessible(true);
  Object projection=projectionConstructor.newInstance(visible,Set.of(orientation,memory,navigation),Set.of(),structural,Set.of("de-de-gym-math-gk"),List.of(navigation),true,learning,canonical);
  Constructor<?> ctor=Arrays.stream(LearnerService.class.getConstructors()).filter(c->c.getParameterCount()==9).findFirst().orElseThrow();
  Object[] ctorArgs=new Object[9];ctorArgs[7]=mapper;LearnerService service=(LearnerService)ctor.newInstance(ctorArgs);
  Method automatic= LearnerService.class.getDeclaredMethod("automaticCompletionTargets",String.class,projectionClass);automatic.setAccessible(true);
  @SuppressWarnings("unchecked") Set<String> roots=(Set<String>)automatic.invoke(service,"automatic:personal-curriculum",projection);
  var topology=new CompletionProfileCompiler().normalizePrerequisites(canonical);
  topology.validateContext(learning.learningAtomicGoalIds());
  System.out.println("VALIDATED_LEARNING_ATOMS="+new TreeSet<>(learning.learningAtomicGoalIds()));
  System.out.println("CURRENT_DEFAULT_ROOTS="+new TreeSet<>(roots));
  Set<String> invented=new TreeSet<>(roots);invented.removeAll(learning.learningAtomicGoalIds());System.out.println("ADDED_NAVIGATION="+invented);
  @SuppressWarnings("unchecked") Set<String> focused=(Set<String>)automatic.invoke(service,"automatic:"+memory,projection);
  if(!focused.equals(Set.of(memory)))throw new AssertionError("Specific scope was broadened");
  System.out.println("SPECIFIC_MEMORY_ROOTS="+new TreeSet<>(focused));
  if(args.length>1 && args[1].equals("expect-fixed")){
   if(!invented.isEmpty()||!roots.equals(learning.learningAtomicGoalIds()))throw new AssertionError("Default roots do not equal validated L");
   topology.validateContext(roots);System.out.println("PASS_FIXED: default roots equal exact validated L; specific scope remains narrow.");return;
  }
  if(!invented.equals(Set.of(navigation)))throw new AssertionError("Counterexample no longer reproduces");
  try{topology.validateContext(roots);throw new AssertionError("Unknown navigation accepted");}
  catch(CompletionCompilationException expected){System.out.println("EXPECTED_NATIVE_FAILURE="+expected.code()+": "+expected.getMessage());}
  System.out.println("PASS: exact validated learning atoms succeed; display-leaf reclassification fails closed.");
 }
}
