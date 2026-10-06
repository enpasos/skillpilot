package com.skillpilot.backend.connectors.gemini.v1.session;

import static org.junit.jupiter.api.Assertions.*;

import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Properties;
import com.skillpilot.backend.connectors.claude.v1.session.ClaudeV1SessionTokenCodec;
import com.skillpilot.backend.connectors.gemini.v1.GeminiV1TestProperties;
import java.util.HashSet;
import org.junit.jupiter.api.Test;

class GeminiV1SessionTokenCodecTest {
    @Test void opaqueTokensAreUniqueProviderSpecificAndOnlyTheirHmacIsPersistable() {
        GeminiV1SessionTokenCodec codec = new GeminiV1SessionTokenCodec(GeminiV1TestProperties.validProperties());
        HashSet<String> issued = new HashSet<>();
        for (int i = 0; i < 32; i++) {
            String token = codec.issue();
            assertTrue(codec.isValid(token));
            assertTrue(issued.add(token));
            assertEquals(64, codec.hash(token).length());
            assertNotEquals(token, codec.hash(token));
            assertEquals(codec.hash(token), codec.hash(token));
        }
    }

    @Test void otherProviderTokensAndMalformedTokensFailClosedWithoutExposingTheirValue() {
        GeminiV1SessionTokenCodec codec = new GeminiV1SessionTokenCodec(GeminiV1TestProperties.validProperties());
        ClaudeV1Properties claude = new ClaudeV1Properties();
        claude.setSigningSecret(GeminiV1TestProperties.SIGNING_SECRET_VALUE);
        String claudeToken = new ClaudeV1SessionTokenCodec(claude).issue();
        for (String token : new String[] {claudeToken, "spo_" + "x".repeat(43), "gp_" + "x".repeat(43), "spg_bad", " "}) {
            var failure = assertThrows(GeminiV1LearningSessionException.class, () -> codec.hash(token));
            assertEquals(GeminiV1LearningSessionException.Reason.REQUIRED, failure.reason());
            if (token.length() > 10) {
                assertFalse(failure.getMessage().contains(token));
            }
        }
        assertThrows(GeminiV1LearningSessionException.class, () -> codec.hash(null));
    }
}
