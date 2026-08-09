package com.skillpilot.backend.openai.de.bootstrap;

import java.io.ByteArrayOutputStream;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;
import java.util.regex.Pattern;
import javax.crypto.Cipher;
import javax.crypto.Mac;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/** Domain-separated cryptography for capabilities, request binding and delivery. */
@Component
@ConditionalOnProperty(
        name = {
            "skillpilot.openai.coach.v1.enabled",
            "skillpilot.openai.coach.v1.oauth.enabled"
        },
        havingValue = "true")
public final class OpenAiDeBootstrapCrypto {

    public record Fingerprint(String keyId, String value) {
    }

    public record RequestAuthentication(String keyId, String value) {
    }

    public record EncryptedDelivery(String keyId, String nonce, String ciphertext) {
    }

    public static final String CAPABILITY_FINGERPRINT_KEY_ID = "openai-v1-bootstrap-capability-hmac-v1";
    public static final String ISSUER_RATE_LIMIT_KEY_ID = "openai-v1-bootstrap-issuer-budget-hmac-v1";
    public static final String REQUEST_HMAC_KEY_ID = "openai-v1-bootstrap-request-hmac-v1";
    public static final String DELIVERY_KEY_ID = "openai-v1-bootstrap-delivery-aead-v1";
    private static final String HMAC_ALGORITHM = "HmacSHA256";
    private static final String CIPHER_ALGORITHM = "AES/GCM/NoPadding";
    private static final Pattern CAPABILITY_PATTERN = Pattern.compile("^spc_[A-Za-z0-9_-]{43}$");
    private static final Base64.Encoder BASE64_URL_ENCODER = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder BASE64_URL_DECODER = Base64.getUrlDecoder();
    private static final HexFormat HEX = HexFormat.of();

    private final SecureRandom secureRandom;
    private final byte[] capabilityFingerprintKey;
    private final byte[] issuerRateLimitKey;
    private final byte[] requestHmacKey;
    private final byte[] deliveryKey;

    @Autowired
    public OpenAiDeBootstrapCrypto(
            @Value("${skillpilot.security.signing-secret:default-insecure-secret-change-me}")
                    String rootSecret) {
        this(rootSecret.getBytes(StandardCharsets.UTF_8), new SecureRandom());
    }

    OpenAiDeBootstrapCrypto(byte[] rootSecret, SecureRandom secureRandom) {
        if (rootSecret == null || rootSecret.length == 0) {
            throw new IllegalArgumentException("Bootstrap root key must not be empty.");
        }
        this.secureRandom = secureRandom;
        this.capabilityFingerprintKey = deriveKey(rootSecret, "capability-fingerprint");
        this.issuerRateLimitKey = deriveKey(rootSecret, "issuer-rate-limit");
        this.requestHmacKey = deriveKey(rootSecret, "request-authentication");
        this.deliveryKey = deriveKey(rootSecret, "delivery-aead");
    }

    public String issueCapability() {
        byte[] entropy = new byte[32];
        secureRandom.nextBytes(entropy);
        return "spc_" + BASE64_URL_ENCODER.encodeToString(entropy);
    }

    public Fingerprint capabilityFingerprint(String rawCapability) {
        byte[] capability = decodeCapability(rawCapability);
        return new Fingerprint(
                CAPABILITY_FINGERPRINT_KEY_ID,
                HEX.formatHex(hmac(capabilityFingerprintKey, capability)));
    }

    public Fingerprint issuerRateLimitPseudonym(
            String oauthAuthorizationReference,
            int contractMajor,
            String oauthClientId) {
        if (oauthAuthorizationReference == null
                || oauthAuthorizationReference.isBlank()
                || oauthClientId == null
                || oauthClientId.isBlank()
                || contractMajor <= 0) {
            throw new OpenAiDeBootstrapException(OpenAiDeBootstrapErrorCode.INVALID_REQUEST);
        }
        byte[] encoded = canonicalLengthPrefixedEncode(List.of(
                "skillpilot-bootstrap-issuer-budget/v1",
                oauthAuthorizationReference,
                Integer.toString(contractMajor),
                oauthClientId));
        return new Fingerprint(
                ISSUER_RATE_LIMIT_KEY_ID,
                HEX.formatHex(hmac(issuerRateLimitKey, encoded)));
    }

    public RequestAuthentication authenticateRequest(
            int contractMajor,
            String capabilityFingerprint,
            int schemaVersion,
            String clientRequestId,
            String normalizedSkillpilotId,
            String communicationLocale,
            String launchIntent,
            String providerNoticeVersion,
            long policyRevision,
            String sourceMajorDecision) {
        byte[] encoded = canonicalLengthPrefixedEncode(List.of(
                "skillpilot-bootstrap-request/v1",
                Integer.toString(contractMajor),
                capabilityFingerprint,
                Integer.toString(schemaVersion),
                clientRequestId,
                normalizedSkillpilotId,
                communicationLocale,
                launchIntent,
                providerNoticeVersion,
                Long.toString(policyRevision),
                sourceMajorDecision));
        return new RequestAuthentication(
                REQUEST_HMAC_KEY_ID,
                HEX.formatHex(hmac(requestHmacKey, encoded)));
    }

    public EncryptedDelivery encryptDelivery(
            byte[] plaintext,
            String attemptId,
            int contractMajor,
            String capabilityFingerprint,
            String requestHmac,
            int responseSchemaVersion) {
        try {
            byte[] nonce = new byte[12];
            secureRandom.nextBytes(nonce);
            Cipher cipher = Cipher.getInstance(CIPHER_ALGORITHM);
            cipher.init(
                    Cipher.ENCRYPT_MODE,
                    new SecretKeySpec(deliveryKey, "AES"),
                    new GCMParameterSpec(128, nonce));
            cipher.updateAAD(deliveryAssociatedData(
                    attemptId,
                    contractMajor,
                    capabilityFingerprint,
                    requestHmac,
                    responseSchemaVersion));
            return new EncryptedDelivery(
                    DELIVERY_KEY_ID,
                    BASE64_URL_ENCODER.encodeToString(nonce),
                    BASE64_URL_ENCODER.encodeToString(cipher.doFinal(plaintext)));
        } catch (Exception exception) {
            throw new OpenAiDeBootstrapException(
                    OpenAiDeBootstrapErrorCode.DELIVERY_UNAVAILABLE,
                    exception);
        }
    }

    public byte[] decryptDelivery(
            EncryptedDelivery encrypted,
            String attemptId,
            int contractMajor,
            String capabilityFingerprint,
            String requestHmac,
            int responseSchemaVersion) {
        if (encrypted == null || !DELIVERY_KEY_ID.equals(encrypted.keyId())) {
            throw new OpenAiDeBootstrapException(OpenAiDeBootstrapErrorCode.DELIVERY_UNAVAILABLE);
        }
        try {
            byte[] nonce = BASE64_URL_DECODER.decode(encrypted.nonce());
            if (nonce.length != 12) {
                throw new IllegalArgumentException("Invalid nonce length.");
            }
            Cipher cipher = Cipher.getInstance(CIPHER_ALGORITHM);
            cipher.init(
                    Cipher.DECRYPT_MODE,
                    new SecretKeySpec(deliveryKey, "AES"),
                    new GCMParameterSpec(128, nonce));
            cipher.updateAAD(deliveryAssociatedData(
                    attemptId,
                    contractMajor,
                    capabilityFingerprint,
                    requestHmac,
                    responseSchemaVersion));
            return cipher.doFinal(BASE64_URL_DECODER.decode(encrypted.ciphertext()));
        } catch (OpenAiDeBootstrapException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new OpenAiDeBootstrapException(
                    OpenAiDeBootstrapErrorCode.DELIVERY_UNAVAILABLE,
                    exception);
        }
    }

    public boolean constantTimeEquals(String firstHex, String secondHex) {
        if (firstHex == null || secondHex == null) {
            return false;
        }
        try {
            return MessageDigest.isEqual(HEX.parseHex(firstHex), HEX.parseHex(secondHex));
        } catch (IllegalArgumentException exception) {
            return false;
        }
    }

    private byte[] decodeCapability(String rawCapability) {
        if (rawCapability == null || !CAPABILITY_PATTERN.matcher(rawCapability).matches()) {
            throw new OpenAiDeBootstrapException(OpenAiDeBootstrapErrorCode.INVALID_CAPABILITY);
        }
        try {
            byte[] decoded = BASE64_URL_DECODER.decode(rawCapability.substring(4));
            if (decoded.length != 32) {
                throw new IllegalArgumentException("Invalid capability entropy.");
            }
            return decoded;
        } catch (IllegalArgumentException exception) {
            throw new OpenAiDeBootstrapException(OpenAiDeBootstrapErrorCode.INVALID_CAPABILITY);
        }
    }

    private byte[] deliveryAssociatedData(
            String attemptId,
            int contractMajor,
            String capabilityFingerprint,
            String requestHmac,
            int responseSchemaVersion) {
        return canonicalLengthPrefixedEncode(List.of(
                "skillpilot-bootstrap-delivery/v1",
                attemptId,
                Integer.toString(contractMajor),
                capabilityFingerprint,
                requestHmac,
                Integer.toString(responseSchemaVersion)));
    }

    private static byte[] canonicalLengthPrefixedEncode(List<String> fields) {
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        for (String field : fields) {
            byte[] bytes = field.getBytes(StandardCharsets.UTF_8);
            output.writeBytes(ByteBuffer.allocate(Integer.BYTES).putInt(bytes.length).array());
            output.writeBytes(bytes);
        }
        return output.toByteArray();
    }

    private static byte[] deriveKey(byte[] rootSecret, String purpose) {
        return hmac(
                rootSecret,
                ("skillpilot-bootstrap-key-derivation/v1\u0000" + purpose)
                        .getBytes(StandardCharsets.UTF_8));
    }

    private static byte[] hmac(byte[] key, byte[] input) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            mac.init(new SecretKeySpec(key, HMAC_ALGORITHM));
            return mac.doFinal(input);
        } catch (Exception exception) {
            throw new IllegalStateException("Bootstrap cryptography is unavailable.", exception);
        }
    }
}
