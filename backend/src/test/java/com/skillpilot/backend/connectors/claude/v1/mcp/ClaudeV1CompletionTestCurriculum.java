package com.skillpilot.backend.connectors.claude.v1.mcp;

import java.net.URISyntaxException;
import java.nio.file.Path;
import java.util.Objects;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

/** Complete tiny authored graph; real catalog, compiler, H2 repositories and MCP handlers remain in use. */
abstract class ClaudeV1CompletionTestCurriculum {
    static final String ROOT = "e6110c42-b4cb-5d40-94d3-d26a70736055";
    static final String PREPARATION = "5c1506ce-5b8d-5908-9e20-47c3836a7a6c";
    static final String EXAM = "91e9f31d-4195-59ee-93a8-fd0d94b549e1";
    static final String OTHER_EXAM = "9847e0aa-b10d-5fb4-b3fb-ac5fcb485935";
    static final String EXAM_TITLE = "Testaufgabe: Lineare Gleichung lösen";

    @DynamicPropertySource
    static void isolatedCurriculum(DynamicPropertyRegistry properties) {
        properties.add("skillpilot.landscapes.directory", () -> {
            try {
                return Path.of(Objects.requireNonNull(ClaudeV1CompletionTestCurriculum.class
                        .getResource("/completion-mcp-curriculum")).toURI()).toString();
            } catch (URISyntaxException e) {
                throw new IllegalStateException("Invalid synthetic curriculum resource URI", e);
            }
        });
    }
}
