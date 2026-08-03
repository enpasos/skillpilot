package com.skillpilot.backend.openai.mcp.de.v1;

import static org.mockito.Mockito.mock;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.skillpilot.backend.ai.CoachStateProjection;
import com.skillpilot.backend.ai.CoachToolFacade;
import com.skillpilot.backend.openai.de.health.OpenAiDeCoachContractFingerprint;
import com.skillpilot.backend.openai.mcp.de.OpenAiDeCoachIdentityResolver;
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1McpContractAdapter;
import com.skillpilot.backend.openai.mcp.de.OpenAiDeMcpTelemetry;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Deterministically exports the descriptors actually built by the V1 Java adapter. */
public final class OpenAiDeV1ContractExporter {

    private static final ObjectMapper JSON = new ObjectMapper()
            .enable(SerializationFeature.ORDER_MAP_ENTRIES_BY_KEYS)
            .enable(SerializationFeature.INDENT_OUTPUT);

    private OpenAiDeV1ContractExporter() {
    }

    public static void main(String[] args) throws IOException {
        if (args.length != 1 || args[0].isBlank()) {
            throw new IllegalArgumentException("Expected exactly one output directory.");
        }
        Path output = Path.of(args[0]).toAbsolutePath().normalize();
        Files.createDirectories(output);

        OpenAiDeV1McpContractAdapter contract = new OpenAiDeV1McpContractAdapter(
                mock(CoachToolFacade.class),
                new CoachStateProjection("https://skillpilot.com"),
                mock(OpenAiDeCoachIdentityResolver.class),
                new OpenAiDeMcpTelemetry(new SimpleMeterRegistry()),
                "https://skillpilot.com");
        Map<String, Object> publicContract =
                OpenAiDeCoachContractFingerprint.canonicalContract(contract);
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> tools = (List<Map<String, Object>>) publicContract.get("tools");
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> resources =
                (List<Map<String, Object>>) publicContract.get("resources");

        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("schemaVersion", 1);
        snapshot.put("pluginIdentity", OpenAiDeV1ContractMetadata.PLUGIN_IDENTITY);
        snapshot.put("contractMajor", OpenAiDeV1ContractMetadata.CONTRACT_MAJOR);
        snapshot.put("contractSha256", OpenAiDeCoachContractFingerprint.sha256(contract));
        snapshot.putAll(publicContract);
        writeJson(output.resolve("contract.json"), snapshot);
        writeJson(
                output.resolve("tools-list.json"),
                tools.stream().map(tool -> tool.get("name")).toList());
        writeJson(
                output.resolve("security-schemes.json"),
                tools.stream()
                        .collect(
                                LinkedHashMap::new,
                                (result, tool) -> result.put(
                                        String.valueOf(tool.get("name")),
                                        metaSecuritySchemes(tool)),
                                LinkedHashMap::putAll));
        writeJson(
                output.resolve("error-catalog.json"),
                OpenAiDeV1ErrorCode.publicCatalog());
        writeJson(
                output.resolve("resources-list.json"),
                resources);
        Files.writeString(
                output.resolve("server-instructions.txt"),
                contract.serverInstructions().stripTrailing() + "\n",
                StandardCharsets.UTF_8);
    }

    @SuppressWarnings("unchecked")
    private static Object metaSecuritySchemes(Map<String, Object> tool) {
        Object meta = tool.get("meta");
        if (!(meta instanceof Map<?, ?> values)) {
            return List.of();
        }
        Object schemes = values.get("securitySchemes");
        return schemes == null ? List.of() : schemes;
    }

    private static void writeJson(Path path, Object value) throws IOException {
        String source = JSON.writeValueAsString(value) + "\n";
        Files.writeString(path, source, StandardCharsets.UTF_8);
    }
}
