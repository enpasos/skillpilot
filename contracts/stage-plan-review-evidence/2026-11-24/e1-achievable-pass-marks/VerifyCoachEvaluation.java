import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.ai.CoachToolFacade;
import com.skillpilot.backend.connectors.claude.v1.mcp.ClaudeV1McpContractAdapter;
import com.skillpilot.backend.connectors.gemini.v1.mcp.GeminiV1McpContractAdapter;
import com.skillpilot.backend.landscape.ExamData;
import java.lang.reflect.InvocationTargetException;
import java.nio.file.Path;
import java.util.HashSet;
import java.util.Set;
import org.mockito.Answers;
import org.mockito.Mockito;

/** Runs each released rubric through the shipped providers' exact, side-effect-free validators. */
public final class VerifyCoachEvaluation {
    public static void main(String[] args) throws Exception {
        var json = new ObjectMapper();
        JsonNode catalog = json.readTree(Path.of(args[0]).toFile());
        Set<String> selected = new HashSet<>(java.util.List.of(args).subList(1, args.length));
        var result = json.createArrayNode();
        var facade = Mockito.mock(CoachToolFacade.class, Answers.CALLS_REAL_METHODS);
        var toScoring = CoachToolFacade.class.getDeclaredMethod("examScoring", ExamData.Scoring.class);
        toScoring.setAccessible(true);
        var adapters = java.util.List.of(ClaudeV1McpContractAdapter.class, GeminiV1McpContractAdapter.class);
        for (JsonNode goal : catalog.required("goals")) {
            String id = goal.required("id").asText();
            if (!selected.remove(id)) continue;
            var exam = json.treeToValue(goal.required("examData"), ExamData.class);
            var scoring = (CoachToolFacade.ExamScoring) toScoring.invoke(facade, exam.getScoring());
            var evaluation = new CoachToolFacade.ExamEvaluationResult(id, exam.getSolutionContent(),
                    exam.getSolutionContentEn(), scoring);
            var observed = result.addObject();
            observed.put("goalId", id);
            observed.put("maxStepUtf16Length", scoring.steps().stream()
                    .mapToInt(s -> s.description().length()).max().orElseThrow());
            for (var adapter : adapters) {
                var validate = adapter.getDeclaredMethod("requireValidExamEvaluation",
                        CoachToolFacade.ExamEvaluationResult.class, String.class);
                validate.setAccessible(true);
                var target = Mockito.mock(adapter, Answers.CALLS_REAL_METHODS);
                var provider = observed.putObject(adapter.getSimpleName());
                try {
                    validate.invoke(target, evaluation, id);
                    provider.put("validEvaluation", true);
                } catch (InvocationTargetException failure) {
                    Throwable cause = failure.getCause();
                    if (!cause.getClass().getSimpleName().equals("ToolConflictException")) throw failure;
                    provider.put("validEvaluation", false);
                    provider.put("exception", cause.getClass().getSimpleName());
                    provider.put("message", cause.getMessage());
                }
            }
        }
        if (!selected.isEmpty() || result.size() != 7) throw new AssertionError(selected);
        System.out.println(json.writerWithDefaultPrettyPrinter().writeValueAsString(result));
    }
}
