package com.skillpilot.backend.actionregression;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class ActionRegressionService {

    static final String PREFIX = "/api/action-regression";
    static final String HMAC_CONTEXT = "sp-action-regression-v1";
    static final int MAX_REQUEST_BODY_BYTES = 4096;
    static final int MAX_AUDIT_CAPTURE_BYTES = 8192;

    private static final String TOKEN_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final Pattern PROBE_ID_PATTERN = Pattern.compile(
            "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$");
    private static final Pattern TOKEN_PATTERN = Pattern.compile(
            "^SPREG-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{16}$");
    private static final Pattern PROOF_PATTERN = Pattern.compile("^[0-9a-f]{32}$");
    private static final Set<String> VERIFY_FIELDS = Set.of("probe_id", "token", "proof");

    private final ObjectMapper objectMapper;
    private final ObjectMapper strictObjectMapper;
    private final SecureRandom secureRandom;
    private final byte[] hmacKey;
    private final String hmacKeyId;
    private final String applicationId;
    private final byte[] openApiBytes;

    @Autowired
    public ActionRegressionService(
            ObjectMapper objectMapper,
            ActionRegressionAuditLogger auditLogger,
            @Value("${skillpilot.public-base-url:https://skillpilot.com}") String publicBaseUrl,
            @Value("${spring.application.name:skillpilot-backend}") String applicationId) {
        this(objectMapper, auditLogger, publicBaseUrl, applicationId, randomKey(), new SecureRandom());
    }

    ActionRegressionService(
            ObjectMapper objectMapper,
            ActionRegressionAuditLogger auditLogger,
            String publicBaseUrl,
            String applicationId,
            byte[] hmacKey,
            SecureRandom secureRandom) {
        if (hmacKey.length != 32) {
            throw new IllegalArgumentException("The action-regression HMAC key must contain exactly 32 bytes.");
        }
        this.objectMapper = objectMapper;
        this.strictObjectMapper = objectMapper.copy()
                .enable(DeserializationFeature.FAIL_ON_TRAILING_TOKENS)
                .enable(JsonParser.Feature.STRICT_DUPLICATE_DETECTION);
        this.secureRandom = secureRandom;
        this.hmacKey = hmacKey.clone();
        this.hmacKeyId = sha256Hex(this.hmacKey).substring(0, 16);
        this.applicationId = applicationId == null || applicationId.isBlank()
                ? "skillpilot-backend"
                : applicationId.strip();
        this.openApiBytes = renderOpenApi(publicBaseUrl);

        Map<String, Object> event = new LinkedHashMap<>();
        event.put("ts", Instant.now().toString());
        event.put("event", "service_started");
        event.put("service", "skillpilot-action-regression");
        event.put("protocol_version", HMAC_CONTEXT);
        event.put("java_version", System.getProperty("java.version"));
        event.put("application_id", this.applicationId);
        event.put("hmac_key_id", this.hmacKeyId);
        auditLogger.log(event);
    }

    public Probe issueProbe() {
        String probeId = UUID.randomUUID().toString();
        StringBuilder token = new StringBuilder("SPREG-");
        for (int index = 0; index < 16; index++) {
            token.append(TOKEN_ALPHABET.charAt(secureRandom.nextInt(TOKEN_ALPHABET.length())));
        }
        String tokenValue = token.toString();
        return new Probe(probeId, tokenValue, computeProof(hmacKey, probeId, tokenValue));
    }

    VerificationInput parseVerification(byte[] body) {
        final JsonNode root;
        try {
            root = strictObjectMapper.readTree(body);
        } catch (IOException exception) {
            return null;
        }
        if (root == null || !root.isObject() || root.size() != VERIFY_FIELDS.size()) {
            return null;
        }
        Set<String> fieldNames = new java.util.HashSet<>();
        root.fieldNames().forEachRemaining(fieldNames::add);
        if (!VERIFY_FIELDS.equals(fieldNames)) {
            return null;
        }

        JsonNode probeId = root.get("probe_id");
        JsonNode token = root.get("token");
        JsonNode proof = root.get("proof");
        if (!probeId.isTextual() || !token.isTextual() || !proof.isTextual()) {
            return null;
        }
        String probeIdValue = probeId.textValue();
        String tokenValue = token.textValue();
        String proofValue = proof.textValue();
        if (!isValidVerification(probeIdValue, tokenValue, proofValue)) {
            return null;
        }
        return new VerificationInput(probeIdValue, tokenValue, proofValue);
    }

    boolean verify(VerificationInput input) {
        String expected = computeProof(hmacKey, input.probeId(), input.token());
        return MessageDigest.isEqual(
                expected.getBytes(StandardCharsets.US_ASCII),
                input.proof().getBytes(StandardCharsets.US_ASCII));
    }

    public boolean verifyProbe(String probeId, String token, String proof) {
        if (!isValidVerification(probeId, token, proof)) {
            throw new IllegalArgumentException("Probe ID, token or proof has an invalid format.");
        }
        return verify(new VerificationInput(probeId, token, proof));
    }

    byte[] probeJson(Probe probe) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("probe_id", probe.probeId());
        body.put("token", probe.token());
        body.put("proof", probe.proof());
        return jsonBytes(body);
    }

    byte[] verificationJson(VerificationInput input, boolean ok) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("ok", ok);
        body.put("probe_id", input.probeId());
        body.put("proof_valid", ok);
        return jsonBytes(body);
    }

    byte[] healthJson() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", "ok");
        body.put("ok", true);
        body.put("service", "skillpilot-action-regression");
        body.put("application_id", applicationId);
        body.put("hmac_key_id", hmacKeyId);
        return jsonBytes(body);
    }

    byte[] errorJson(String error, String message) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("error", error);
        body.put("message", message);
        return jsonBytes(body);
    }

    byte[] openApiBytes() {
        return openApiBytes.clone();
    }

    String hmacKeyId() {
        return hmacKeyId;
    }

    String applicationId() {
        return applicationId;
    }

    private byte[] jsonBytes(Map<String, ?> body) {
        try {
            return (objectMapper.writeValueAsString(body) + "\n").getBytes(StandardCharsets.UTF_8);
        } catch (IOException exception) {
            throw new IllegalStateException("Could not serialize action-regression response.", exception);
        }
    }

    private byte[] renderOpenApi(String publicBaseUrl) {
        String baseUrl = publicBaseUrl == null ? "" : publicBaseUrl.strip();
        while (baseUrl.endsWith("/")) {
            baseUrl = baseUrl.substring(0, baseUrl.length() - 1);
        }
        URI uri;
        try {
            uri = URI.create(baseUrl);
        } catch (IllegalArgumentException exception) {
            throw new IllegalStateException("skillpilot.public-base-url must be an absolute HTTP(S) URL.", exception);
        }
        if (!uri.isAbsolute() || !("http".equalsIgnoreCase(uri.getScheme()) || "https".equalsIgnoreCase(uri.getScheme()))) {
            throw new IllegalStateException("skillpilot.public-base-url must be an absolute HTTP(S) URL.");
        }

        try (InputStream stream = new ClassPathResource("action-regression-openapi.yaml").getInputStream()) {
            String template = new String(stream.readAllBytes(), StandardCharsets.UTF_8);
            String serverUrl = baseUrl + PREFIX;
            String quotedServerUrl = objectMapper.writeValueAsString(serverUrl);
            String rendered = template.replace("__ACTION_REGRESSION_SERVER_URL__", quotedServerUrl);
            if (!rendered.endsWith("\n")) {
                rendered += "\n";
            }
            return rendered.getBytes(StandardCharsets.UTF_8);
        } catch (IOException exception) {
            throw new IllegalStateException("Could not render action-regression OpenAPI document.", exception);
        }
    }

    static String computeProof(byte[] key, String probeId, String token) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(key, "HmacSHA256"));
            mac.update(HMAC_CONTEXT.getBytes(StandardCharsets.UTF_8));
            mac.update((byte) 0);
            mac.update(probeId.getBytes(StandardCharsets.UTF_8));
            mac.update((byte) 0);
            mac.update(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(mac.doFinal()).substring(0, 32);
        } catch (GeneralSecurityException exception) {
            throw new IllegalStateException("HmacSHA256 is not available.", exception);
        }
    }

    private static byte[] randomKey() {
        byte[] key = new byte[32];
        new SecureRandom().nextBytes(key);
        return key;
    }

    static String sha256Hex(byte[] bytes) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes));
        } catch (GeneralSecurityException exception) {
            throw new IllegalStateException("SHA-256 is not available.", exception);
        }
    }

    private static boolean isValidVerification(String probeId, String token, String proof) {
        return probeId != null
                && token != null
                && proof != null
                && PROBE_ID_PATTERN.matcher(probeId).matches()
                && TOKEN_PATTERN.matcher(token).matches()
                && PROOF_PATTERN.matcher(proof).matches();
    }

    public record Probe(String probeId, String token, String proof) {
    }

    record VerificationInput(String probeId, String token, String proof) {
    }
}
