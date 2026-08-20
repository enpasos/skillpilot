package com.skillpilot.backend.connectors.claude.v1.identity;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Drift guard between the connector's decrypt-only ES module and the frozen WebGUI ID-file format.
 *
 * <p>The module in {@code claude-connector-v1/} is a deliberate, narrow duplication of the WebGUI
 * implementation. Duplication without a guard rots: if either side changes an iteration count, a
 * salt length or the AAD string, existing ID files stop decrypting in one place and keep working in
 * the other. This test compares the values that must stay byte-identical, and asserts the copy
 * stayed decrypt-only.</p>
 */
class ClaudeV1IdFileModuleDriftTest {

    private static final Path WEBGUI_MODULE = Path.of("../app/src/utils/skillpilotIdFile.ts");

    /** Every constant that participates in deriving the key or authenticating the envelope. */
    private static final List<String> FORMAT_CRITICAL_VALUES = List.of(
            "'skillpilot-password-encrypted'",
            "'skillpilot-id'",
            "600_000",
            "'SkillPilot\\0password-envelope\\0v1\\0skillpilot-id'",
            "'\\0PBKDF2-SHA-256-600000\\0AES-256-GCM-128'");

    private static final List<String> FORMAT_CRITICAL_NUMBERS = List.of(
            "FILE_SALT_LENGTH = 16",
            "FILE_IV_LENGTH = 12",
            "FILE_CIPHER_TAG_LENGTH = 128",
            "MAX_FILE_CIPHERTEXT_LENGTH = 1024",
            "MAX_SKILLPILOT_ID_FILE_SIZE = 4096",
            "MAX_SKILLPILOT_ID_FILE_PASSWORD_BYTES = 1024");

    private String connectorModule() throws IOException {
        try (InputStream in = new ClassPathResource("claude-connector-v1/id-decrypt.js").getInputStream()) {
            return new String(in.readAllBytes(), StandardCharsets.UTF_8);
        }
    }

    @Test
    void theConnectorModuleUsesTheSameEnvelopeParametersAsTheWebGui() throws IOException {
        String connector = connectorModule();
        if (!Files.exists(WEBGUI_MODULE)) {
            // The frontend is not checked out alongside the backend in every build; the connector
            // side is still asserted below.
            return;
        }
        String webgui = Files.readString(WEBGUI_MODULE, StandardCharsets.UTF_8);

        for (String value : FORMAT_CRITICAL_VALUES) {
            assertTrue(webgui.contains(value), () -> "WebGUI no longer defines " + value);
            assertTrue(connector.contains(value), () -> "Connector module drifted on " + value);
        }
        for (String assignment : FORMAT_CRITICAL_NUMBERS) {
            assertTrue(webgui.contains(assignment), () -> "WebGUI no longer defines " + assignment);
            assertTrue(connector.contains(assignment), () -> "Connector module drifted on " + assignment);
        }
    }

    @Test
    void theConnectorModuleStaysDecryptOnly() throws IOException {
        String connector = connectorModule();

        assertTrue(connector.contains("decryptSkillpilotIdFileContent"));
        // Encryption, key export and file creation belong to the WebGUI alone; duplicating them
        // here would widen the copy the plan deliberately kept narrow.
        assertFalse(connector.contains("subtle.encrypt"), "The connector module must not encrypt");
        assertFalse(connector.contains("exportKey"), "The connector module must not export keys");
        assertFalse(connector.contains("generateKey"), "The connector module must not generate keys");
        assertTrue(connector.contains("['decrypt']"), "The derived key must be decrypt-only");
    }

    @Test
    void theConnectorModuleNeverTransmitsTheFileOrPassword() throws IOException {
        String connector = connectorModule();

        // The module's whole purpose is that only the decrypted UUID leaves the browser.
        assertFalse(connector.contains("fetch("), "Decryption must not perform network calls");
        assertFalse(connector.contains("XMLHttpRequest"));
        assertFalse(connector.contains("localStorage"));
        assertFalse(connector.contains("sessionStorage"));
        assertFalse(connector.contains("document.cookie"));
        assertFalse(connector.contains("console.log"));
    }
}
