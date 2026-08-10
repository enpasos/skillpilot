package com.skillpilot.backend.openai.de.bootstrap;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class OpenAiDeBootstrapCryptoTest {

    private OpenAiDeBootstrapCrypto crypto;

    @BeforeEach
    void setUp() {
        crypto = new OpenAiDeBootstrapCrypto(
                "bootstrap-test-root-secret".getBytes(StandardCharsets.UTF_8),
                new SecureRandom());
    }

    @Test
    void issuesOpaque256BitHandleAndPersistsOnlyKeyedFingerprint() {
        String capability = crypto.issueCapability();

        var fingerprint = crypto.capabilityFingerprint(capability);

        assertThat(capability).matches("^spc_[A-Za-z0-9_-]{43}$");
        assertThat(fingerprint.keyId())
                .isEqualTo(OpenAiDeBootstrapCrypto.CAPABILITY_FINGERPRINT_KEY_ID);
        assertThat(fingerprint.value()).matches("^[0-9a-f]{64}$");
        assertThat(fingerprint.value()).doesNotContain(capability);
        assertThat(crypto.capabilityFingerprint(capability)).isEqualTo(fingerprint);
    }

    @Test
    void issuerBudgetUsesASeparateDomainBoundPseudonym() {
        var baseline = crypto.issuerRateLimitPseudonym("authorization-secret", 1, "client-v1");
        var changedMajor =
                crypto.issuerRateLimitPseudonym("authorization-secret", 2, "client-v1");
        var changedClient =
                crypto.issuerRateLimitPseudonym("authorization-secret", 1, "client-v2");

        assertThat(baseline.keyId()).isEqualTo(OpenAiDeBootstrapCrypto.ISSUER_RATE_LIMIT_KEY_ID);
        assertThat(baseline.value())
                .matches("^[0-9a-f]{64}$")
                .doesNotContain("authorization-secret", "client-v1");
        assertThat(changedMajor.value()).isNotEqualTo(baseline.value());
        assertThat(changedClient.value()).isNotEqualTo(baseline.value());
    }

    @Test
    void requestHmacBindsEverySemanticFieldIncludingServerPolicyDecision() {
        String capabilityFingerprint = "a".repeat(64);
        var baseline = crypto.authenticateRequest(
                1,
                capabilityFingerprint,
                1,
                "0f967c3b-114e-4b83-891d-cde9863d8fb3",
                "EXISTING",
                "2c089f6b-615d-4c14-8225-82a973f842cf",
                "de",
                "CURRENT_UNIT",
                "openai-provider-eligibility-v1",
                1,
                "ALLOW_CURRENT_MAJOR");
        var changedId = crypto.authenticateRequest(
                1,
                capabilityFingerprint,
                1,
                "0f967c3b-114e-4b83-891d-cde9863d8fb3",
                "EXISTING",
                "cf411b27-5fa7-4a5d-a155-669864856073",
                "de",
                "CURRENT_UNIT",
                "openai-provider-eligibility-v1",
                1,
                "ALLOW_CURRENT_MAJOR");
        var changedPolicy = crypto.authenticateRequest(
                1,
                capabilityFingerprint,
                1,
                "0f967c3b-114e-4b83-891d-cde9863d8fb3",
                "EXISTING",
                "2c089f6b-615d-4c14-8225-82a973f842cf",
                "de",
                "CURRENT_UNIT",
                "openai-provider-eligibility-v1",
                1,
                "START_CURRENT_MAJOR");
        var changedRevision = crypto.authenticateRequest(
                1,
                capabilityFingerprint,
                1,
                "0f967c3b-114e-4b83-891d-cde9863d8fb3",
                "EXISTING",
                "2c089f6b-615d-4c14-8225-82a973f842cf",
                "de",
                "CURRENT_UNIT",
                "openai-provider-eligibility-v1",
                2,
                "ALLOW_CURRENT_MAJOR");
        var changedMode = crypto.authenticateRequest(
                1,
                capabilityFingerprint,
                1,
                "0f967c3b-114e-4b83-891d-cde9863d8fb3",
                "CREATE",
                "2c089f6b-615d-4c14-8225-82a973f842cf",
                "de",
                "CURRENT_UNIT",
                "openai-provider-eligibility-v1",
                1,
                "ALLOW_CURRENT_MAJOR");

        assertThat(baseline.keyId()).isEqualTo(OpenAiDeBootstrapCrypto.REQUEST_HMAC_KEY_ID);
        assertThat(baseline.value())
                .isEqualTo("a39af6fc7661f7707eb8f83d246172e98e8e335f203f046f423ce1de326f0c6d");
        assertThat(changedId.value()).isNotEqualTo(baseline.value());
        assertThat(changedMode.value()).isNotEqualTo(baseline.value());
        assertThat(changedPolicy.value()).isNotEqualTo(baseline.value());
        assertThat(changedRevision.value()).isNotEqualTo(baseline.value());
        assertThat(crypto.constantTimeEquals(baseline.value(), baseline.value())).isTrue();
        assertThat(crypto.constantTimeEquals(baseline.value(), changedId.value())).isFalse();
    }

    @Test
    void deliveryEncryptsAllBytesAndAuthenticatesAttemptMetadata() {
        byte[] plaintext = ("{\"startMessage\":\"learningSessionId: sps_" + "A".repeat(43) + "\"}")
                .getBytes(StandardCharsets.UTF_8);
        var encrypted = crypto.encryptDelivery(
                plaintext,
                "9de7d7e7-a10e-42da-a8e6-901f397c0c84",
                1,
                "b".repeat(64),
                "c".repeat(64),
                1);

        assertThat(encrypted.keyId()).isEqualTo(OpenAiDeBootstrapCrypto.DELIVERY_KEY_ID);
        assertThat(encrypted.nonce()).isNotBlank();
        assertThat(encrypted.ciphertext()).doesNotContain("learningSessionId", "sps_");
        assertThat(crypto.decryptDelivery(
                        encrypted,
                        "9de7d7e7-a10e-42da-a8e6-901f397c0c84",
                        1,
                        "b".repeat(64),
                        "c".repeat(64),
                        1))
                .isEqualTo(plaintext);

        assertThatExceptionOfType(OpenAiDeBootstrapException.class)
                .isThrownBy(() -> crypto.decryptDelivery(
                        encrypted,
                        "58d57948-1c63-42d6-86d7-a6a3122b746c",
                        1,
                        "b".repeat(64),
                        "c".repeat(64),
                        1))
                .extracting(OpenAiDeBootstrapException::code)
                .isEqualTo(OpenAiDeBootstrapErrorCode.DELIVERY_UNAVAILABLE);
    }

    @Test
    void rejectsMalformedCapabilityBeforeFingerprinting() {
        assertThatExceptionOfType(OpenAiDeBootstrapException.class)
                .isThrownBy(() -> crypto.capabilityFingerprint("spc_short"))
                .extracting(OpenAiDeBootstrapException::code)
                .isEqualTo(OpenAiDeBootstrapErrorCode.INVALID_CAPABILITY);
    }
}
