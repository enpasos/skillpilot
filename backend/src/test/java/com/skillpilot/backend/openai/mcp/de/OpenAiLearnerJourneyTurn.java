package com.skillpilot.backend.openai.mcp.de;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.OrientationOutlook;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/** Runs one learner turn from the submission package against this test's loopback application. */
final class OpenAiLearnerJourneyTurn {
    private OpenAiLearnerJourneyTurn() {}

    static JsonNode completeOrientation(ObjectMapper json, int port, String archive, String accessToken,
            String sessionId, String goalId, OrientationOutlook.Path path) throws Exception {
        String mode = System.getenv().getOrDefault("SKILLPILOT_OPENAI_JOURNEY_MODE", "rehearse");
        assertThat(mode).isIn("rehearse", "model");
        boolean paid = mode.equals("model");
        if (paid) {
            assertThat(System.getenv("CI")).as("paid local learner turn").isNullOrEmpty();
        }
        var args = List.of("node", "scripts/openai_live_journey_turn.mjs", "--zip", archive,
                paid ? "--model" : "--rehearse");
        var builder = new ProcessBuilder(args).directory(Path.of("..").toFile());
        builder.environment().keySet().retainAll(paid
                ? List.of("PATH", "LANG", "LC_ALL", "TMPDIR", "OPENAI_EVAL_API_KEY")
                : List.of("PATH", "LANG", "LC_ALL", "TMPDIR"));
        Path receiptFile = Files.createTempFile("skillpilot-test-turn-", ".json");
        try {
            Process process = builder.redirectOutput(receiptFile.toFile())
                    .redirectError(ProcessBuilder.Redirect.INHERIT).start();
            try {
                try (var input = process.getOutputStream()) {
                    json.writeValue(input, Map.of(
                            "port", port, "accessToken", accessToken, "learningSessionId", sessionId,
                            "orientationGoalId", goalId, "orientationPathId", path.pathId(),
                            "priorConversation", List.of(
                                    Map.of("role", "assistant", "content", "Ein möglicher Mathematikweg heißt „"
                                            + path.title() + "“. Was daran interessiert dich?"),
                                    Map.of("role", "user", "content", "Ich wähle „" + path.title()
                                            + "“. Mich interessiert, wie ich die Positionen im Raum für mein 3D-Modell beschreiben kann."),
                                    Map.of("role", "assistant", "content", "Dann hast du ein eigenes Beispiel für diesen Weg. "
                                            + "Möchtest du die Orientierung abschließen und deine Wahl speichern?")),
                            "learnerMessage", "Ja, bitte schließe die Orientierung ab und speichere meine Wahl. Danach möchte ich pausieren."));
                }
                assertThat(process.waitFor(5, TimeUnit.MINUTES)).as("learner turn finished before timeout").isTrue();
                assertThat(process.exitValue()).as("learner turn process").isZero();
                JsonNode receipt = json.readTree(receiptFile.toFile());
                assertThat(receipt.required("status").textValue()).isEqualTo("passed");
                assertThat(receipt.required("mode").textValue()).isEqualTo(paid ? "model" : "rehearsed");
                assertThat(receipt.required("contextCalls").intValue()).isGreaterThanOrEqualTo(1);
                assertThat(receipt.required("masteryCalls").intValue()).isEqualTo(1);
                assertThat(receipt.required("modelRequests").intValue()).isEqualTo(paid ? 2 : 0);
                System.out.printf("SkillPilot learner turn mode=%s contextCalls=%d masteryCalls=1 modelRequests=%d%n",
                        receipt.required("mode").textValue(), receipt.required("contextCalls").intValue(),
                        receipt.required("modelRequests").intValue());
                return receipt.required("result").required("structuredContent");
            } finally {
                if (process.isAlive()) process.destroyForcibly();
            }
        } finally {
            Files.deleteIfExists(receiptFile);
        }
    }
}
