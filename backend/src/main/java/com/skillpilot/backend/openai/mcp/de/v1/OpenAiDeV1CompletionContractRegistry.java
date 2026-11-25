package com.skillpilot.backend.openai.mcp.de.v1;

import com.skillpilot.backend.completion.CompletionProfileCatalog;
import com.skillpilot.backend.openai.de.health.OpenAiDeCoachContractFingerprint;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/** Tracks the actual advertised contract and the curriculum generation it supports. */
@Component
@ConditionalOnProperty(name = "skillpilot.openai.coach.v1.enabled", havingValue = "true")
public final class OpenAiDeV1CompletionContractRegistry {
    private final CompletionProfileCatalog catalog;
    private volatile Binding registration;

    public OpenAiDeV1CompletionContractRegistry(CompletionProfileCatalog catalog) {
        this.catalog = catalog;
    }

    public synchronized void register(OpenAiDeV1McpContractAdapter contract) {
        if (contract.toolSpecifications().stream().noneMatch(tool ->
                OpenAiDeV1McpContractAdapter.CONFIRM_COMPLETION_CONTRACT.equals(tool.tool().name()))) {
            return;
        }
        String generation = catalog.generation();
        String fingerprint = OpenAiDeCoachContractFingerprint.sha256(contract);
        Binding binding = new Binding(generation, digest(fingerprint + "\0" + generation));
        if (registration != null && !registration.equals(binding)) {
            throw new IllegalStateException("A running OpenAI MCP contract cannot be replaced in place.");
        }
        registration = binding;
    }

    public String pendingStamp() {
        Binding current = current();
        return current == null ? null : "pending:" + current.digest();
    }

    String digestForPending(String stamp) {
        Binding current = current();
        return current != null && ("pending:" + current.digest()).equals(stamp) ? current.digest() : null;
    }

    String digestForConfirmed(String stamp) {
        Binding current = current();
        return current != null && ("confirmed:" + current.digest()).equals(stamp) ? current.digest() : null;
    }

    private Binding current() {
        Binding current = registration;
        return current != null && catalog.available() && current.generation().equals(catalog.generation())
                ? current : null;
    }

    private static String digest(String value) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("JVM does not provide SHA-256.", exception);
        }
    }

    private record Binding(String generation, String digest) {}
}
