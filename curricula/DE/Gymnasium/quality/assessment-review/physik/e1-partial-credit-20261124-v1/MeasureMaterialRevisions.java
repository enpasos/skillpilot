import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.completion.AssessmentMaterialRevision;
import com.skillpilot.backend.landscape.ExamData;
import java.nio.file.Path;

public class MeasureMaterialRevisions {
    public static void main(String[] args) throws Exception {
        var json = new ObjectMapper();
        Path root = Path.of(args[0]);
        var output = json.createArrayNode();
        var activation = json.readTree(Path.of(args[1]).toFile());
        for (JsonNode row : activation.required("goals")) {
            var measured = output.addObject();
            measured.put("goalId", row.required("goalId").asText());
            for (String version : new String[]{"prior", "current"}) {
                var artifact = row.required(version);
                var goal = json.readTree(root.resolve(artifact.required("path").asText()).toFile());
                var revision = AssessmentMaterialRevision.of(json.treeToValue(goal.required("examData"), ExamData.class));
                measured.set(version, json.valueToTree(revision));
            }
        }
        System.out.println(json.writerWithDefaultPrettyPrinter().writeValueAsString(output));
    }
}
