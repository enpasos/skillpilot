package com.skillpilot.backend.openai.mcp.de;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.modelcontextprotocol.json.jackson3.JacksonMcpJsonMapperSupplier;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.PrintStream;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * JSONL subprocess bridge for paid model tests. Uses only test fixtures and never starts the server.
 * Stdout carries protocol replies only; application and Mockito diagnostics are redirected to stderr.
 */
public final class OpenAiDialogReplayHarness {
    private static final ObjectMapper JSON = new ObjectMapper();
    private static final Set<String> DAILY_CASES = Set.of("P1", "N1", "D1", "D2", "D3", "D4", "D5", "D6");
    private OpenAiDialogReplayFixture fixture;

    public static void main(String[] args) throws Exception {
        if (args.length != 0) throw new IllegalArgumentException("The dialog bridge accepts JSONL stdin only");
        PrintStream protocol = System.out;
        System.setOut(System.err);
        var harness = new OpenAiDialogReplayHarness();
        try (var input = new BufferedReader(new InputStreamReader(System.in, StandardCharsets.UTF_8))) {
            String line;
            while ((line = input.readLine()) != null) {
                Map<String, Object> response;
                Object id = null;
                try {
                    if (line.length() > 2_097_152) throw new IllegalArgumentException("Request exceeds limit");
                    JsonNode request = JSON.readTree(line);
                    if (request == null || !request.isObject()) throw new IllegalArgumentException("Expected object");
                    id = request.hasNonNull("id") ? JSON.convertValue(request.get("id"), Object.class) : null;
                    response = new LinkedHashMap<>(harness.handle(request));
                    response.put("ok", true);
                } catch (Exception error) {
                    // Error messages may contain model arguments or protected fixture values: keep them off protocol.
                    System.err.println("Dialog fixture request failed: " + error.getClass().getSimpleName());
                    response = new LinkedHashMap<>();
                    response.put("ok", false);
                    response.put("error", Map.of("code", "FIXTURE_REQUEST_FAILED",
                            "message", "The test fixture could not execute this request; this is not a passed scenario."));
                }
                response.put("id", id);
                protocol.println(new JacksonMcpJsonMapperSupplier().get().writeValueAsString(response));
                protocol.flush();
            }
        }
    }

    @SuppressWarnings("unchecked")
    Map<String, Object> handle(JsonNode request) {
        String action = requiredText(request, "action");
        if (action.equals("reset")) {
            String caseId = requiredText(request, "caseId");
            fixture = null;
            fixture = DAILY_CASES.contains(caseId) ? OpenAiDialogReplayDailyFixtures.create(caseId)
                    : OpenAiDialogReplayReviewFixtures.create(caseId);
            return Map.of("caseId", caseId, "evidenceLayer", OpenAiDialogReplayFixture.EVIDENCE_LAYER,
                    "tools", fixture.modelTools(), "serverInstructions", fixture.contract.serverInstructions(),
                    "preparedMessage", fixture.preparedMessage, "priorConversation", fixture.priorConversation,
                    "stateVersion", fixture.currentStateVersion(), "snapshot", fixture.snapshot());
        }
        if (fixture == null) throw new IllegalStateException("Reset required before fixture operations");
        if (fixture.callAudit.size() >= 100 && (action.equals("call") || action.equals("ui"))) {
            throw new IllegalStateException("Fixture call budget exceeded");
        }
        return switch (action) {
            case "call" -> {
                if (!request.path("arguments").isObject()) throw new IllegalArgumentException("Arguments object required");
                var result = fixture.call(requiredText(request, "name"),
                        JSON.convertValue(request.get("arguments"), Map.class));
                yield Map.of("rawMcpResult", result, "snapshot", fixture.snapshot());
            }
            case "ui" -> {
                int before = fixture.callAudit.size();
                var results = fixture.ui(requiredText(request, "turnId"));
                yield Map.of("results", results,
                        "events", List.copyOf(fixture.callAudit.subList(before, fixture.callAudit.size())),
                        "snapshot", fixture.snapshot());
            }
            case "snapshot" -> Map.of("state", fixture.snapshot());
            default -> throw new IllegalArgumentException("Unknown fixture action");
        };
    }

    private static String requiredText(JsonNode node, String field) {
        if (!node.path(field).isTextual() || node.path(field).asText().isBlank()) {
            throw new IllegalArgumentException("Required text field missing");
        }
        return node.path(field).asText();
    }
}
