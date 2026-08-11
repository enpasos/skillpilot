package com.skillpilot.backend.openai.mcp.de.v1;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class OpenAiDeV1ErrorCodeTest {

    private static final ObjectMapper JSON = new ObjectMapper();

    @TempDir
    Path temporaryDirectory;

    @Test
    void catalogContainsEveryStableV1ErrorCategoryInDeterministicOrder() {
        @SuppressWarnings("unchecked")
        List<java.util.Map<String, Object>> errors =
                (List<java.util.Map<String, Object>>) OpenAiDeV1ErrorCode.publicCatalog().get("errors");

        assertThat(errors)
                .extracting(error -> error.get("code"))
                .containsExactly(
                        "STATE_VERSION_CONFLICT",
                        "IDEMPOTENCY_KEY_REUSED",
                        "SESSION_VERSION_UNAVAILABLE",
                        "SESSION_REQUIRED",
                        "SESSION_RENEWAL_REQUIRED",
                        "AUTHENTICATION_REQUIRED",
                        "INSUFFICIENT_SCOPE",
                        "INVALID_INPUT",
                        "STATE_CONFLICT",
                        "TIMEOUT",
                        "SERVICE_UNAVAILABLE",
                        "INTERNAL_ERROR");
        assertThat(errors)
                .extracting(error -> error.get("category"))
                .containsExactly(
                        "state",
                        "state",
                        "state",
                        "session",
                        "session",
                        "auth",
                        "scope",
                        "input",
                        "conflict",
                        "timeout",
                        "availability",
                        "internal");
        assertThat(errors).allSatisfy(error -> assertThat(error)
                .containsKeys("code", "category", "retryable", "stateChanged", "recovery")
                .containsEntry("stateChanged", false));
        assertThat(java.util.Arrays.stream(OpenAiDeV1SessionStateException.Code.values())
                        .map(Enum::name))
                .allMatch(name -> java.util.Arrays.stream(OpenAiDeV1ErrorCode.values())
                        .anyMatch(error -> error.code().equals(name)));
    }

    @Test
    void contractExporterWritesTheErrorCatalogDeterministically() throws Exception {
        Path first = temporaryDirectory.resolve("first");
        Path second = temporaryDirectory.resolve("second");

        OpenAiDeV1ContractExporter.main(new String[] {first.toString()});
        OpenAiDeV1ContractExporter.main(new String[] {second.toString()});

        byte[] firstBytes = Files.readAllBytes(first.resolve("error-catalog.json"));
        assertThat(firstBytes).isEqualTo(Files.readAllBytes(second.resolve("error-catalog.json")));
        JsonNode catalog = JSON.readTree(firstBytes);
        assertThat(catalog.path("schemaVersion").asInt()).isEqualTo(1);
        assertThat(catalog.path("contractMajor").asInt())
                .isEqualTo(OpenAiDeV1ContractMetadata.CONTRACT_MAJOR);
        assertThat(catalog.path("errors").size()).isEqualTo(OpenAiDeV1ErrorCode.values().length);
    }
}
