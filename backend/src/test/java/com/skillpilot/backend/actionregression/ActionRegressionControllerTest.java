package com.skillpilot.backend.actionregression;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ActionRegressionControllerTest {

    private static final String PREFIX = ActionRegressionService.PREFIX;
    private static final byte[] TEST_KEY = testKey();

    private ObjectMapper objectMapper;
    private List<String> auditLines;
    private ActionRegressionService service;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        auditLines = new ArrayList<>();
        ActionRegressionAuditLogger auditLogger = new ActionRegressionAuditLogger(objectMapper, auditLines::add);
        service = new ActionRegressionService(
                objectMapper,
                auditLogger,
                "https://regression.example.test/",
                "test-application",
                TEST_KEY,
                new SecureRandom(new byte[] { 1, 2, 3, 4 }));
        mockMvc = MockMvcBuilders
                .standaloneSetup(new ActionRegressionController(service, auditLogger))
                .build();
    }

    @Test
    void hmacUsesDocumentedGoldenVector() {
        assertThat(ActionRegressionService.computeProof(
                TEST_KEY,
                "123e4567-e89b-42d3-a456-426614174000",
                "SPREG-ABCDEFGHJKLMNPQR"))
                .isEqualTo("156a16e2b6c746c9ae6434cf86eba6e4");
    }

    @Test
    void startupAndHealthExposeOnlyTheNonSecretKeyFingerprint() throws Exception {
        JsonNode startup = objectMapper.readTree(auditLines.getFirst());
        assertThat(startup.path("event").asText()).isEqualTo("service_started");
        assertThat(startup.path("application_id").asText()).isEqualTo("test-application");
        assertThat(startup.path("hmac_key_id").asText()).isEqualTo(service.hmacKeyId());
        assertThat(startup.path("hmac_key_id").asText()).hasSize(16);
        assertThat(auditLines.getFirst()).doesNotContain(Arrays.toString(TEST_KEY));

        MvcResult result = mockMvc.perform(get(PREFIX + "/healthz").header("User-Agent", "control-client/1"))
                .andExpect(status().isOk())
                .andExpect(header().string("Cache-Control", "no-store"))
                .andExpect(header().exists("X-Regression-Request-Id"))
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value("ok"))
                .andExpect(jsonPath("$.ok").value(true))
                .andExpect(jsonPath("$.application_id").value("test-application"))
                .andExpect(jsonPath("$.hmac_key_id").value(service.hmacKeyId()))
                .andReturn();

        assertExactContentLengthAndNewline(result);
        JsonNode audit = lastAudit();
        assertThat(audit.path("event").asText()).isEqualTo("health_checked");
        assertThat(audit.path("selected_headers").path("user-agent-bytes").asInt())
                .isEqualTo("control-client/1".getBytes(StandardCharsets.UTF_8).length);
        assertThat(audit.path("selected_headers").path("user-agent-sha256").asText())
                .isEqualTo(ActionRegressionService.sha256Hex("control-client/1".getBytes(StandardCharsets.UTF_8)));
        assertThat(audit.path("selected_headers").toString()).doesNotContain("control-client/1");
        assertThat(audit.path("request_body_bytes").asLong()).isZero();
        assertThat(audit.path("response_body_bytes").asInt())
                .isEqualTo(result.getResponse().getContentAsByteArray().length);
        assertThat(audit.path("response_committed").asBoolean()).isTrue();
    }

    @Test
    void openApiIsMinimalRenderedAndNonConsequential() throws Exception {
        MvcResult result = mockMvc.perform(get(PREFIX + "/openapi.yaml"))
                .andExpect(status().isOk())
                .andExpect(header().string("Cache-Control", "no-store"))
                .andExpect(header().exists("X-Regression-Request-Id"))
                .andExpect(content().contentTypeCompatibleWith(MediaType.parseMediaType("application/yaml")))
                .andReturn();

        String document = result.getResponse().getContentAsString(StandardCharsets.UTF_8);
        assertThat(document).contains("\"openapi\": \"3.1.0\"");
        assertThat(document).contains("\"url\": \"https://regression.example.test/api/action-regression\"");
        assertThat(document).contains("\"security\": []");
        JsonNode openApi = objectMapper.readTree(document);
        assertThat(openApi.path("paths").path("/v1/probe").path("get").path("operationId").asText())
                .isEqualTo("createRegressionProbe");
        assertThat(openApi.path("paths").path("/v1/verify").path("post").path("operationId").asText())
                .isEqualTo("verifyRegressionProbe");
        assertThat(openApi.path("paths").has("/healthz")).isFalse();
        assertThat(document).doesNotContain("__ACTION_REGRESSION_SERVER_URL__");
        assertThat(document).doesNotContain("\"example\":", "\"examples\":", "\"default\":");
        assertThat(count(document, "\"operationId\"" )).isEqualTo(2);
        assertThat(count(document, "\"x-openai-isConsequential\": false")).isEqualTo(2);
        assertExactContentLengthAndNewline(result);
    }

    @Test
    void everyProbeIsFreshAndHasStrictFormats() throws Exception {
        MvcResult first = mockMvc.perform(get(PREFIX + "/v1/probe"))
                .andExpect(status().isOk())
                .andExpect(header().string("Cache-Control", "no-store"))
                .andExpect(header().exists("X-Regression-Request-Id"))
                .andReturn();
        MvcResult second = mockMvc.perform(get(PREFIX + "/v1/probe"))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode firstProbe = objectMapper.readTree(first.getResponse().getContentAsByteArray());
        JsonNode secondProbe = objectMapper.readTree(second.getResponse().getContentAsByteArray());
        assertProbeShape(firstProbe);
        assertProbeShape(secondProbe);
        assertThat(secondProbe.path("probe_id").asText()).isNotEqualTo(firstProbe.path("probe_id").asText());
        assertThat(secondProbe.path("token").asText()).isNotEqualTo(firstProbe.path("token").asText());
        assertThat(secondProbe.path("proof").asText()).isNotEqualTo(firstProbe.path("proof").asText());
        assertThat(second.getResponse().getHeader("X-Regression-Request-Id"))
                .isNotEqualTo(first.getResponse().getHeader("X-Regression-Request-Id"));
        assertExactContentLengthAndNewline(first);
    }

    @Test
    void unchangedProbeRoundTripsWithHashBoundPrivacySafeAudit() throws Exception {
        MvcResult probeResult = mockMvc.perform(get(PREFIX + "/v1/probe"))
                .andExpect(status().isOk())
                .andReturn();
        byte[] probeBody = probeResult.getResponse().getContentAsByteArray();

        MvcResult verifyResult = mockMvc.perform(post(PREFIX + "/v1/verify")
                        .contentType("application/json; charset=utf-8")
                        .header("User-Agent", "direct-control/1")
                        .header("X-Forwarded-For", "203.0.113.19")
                        .header("CF-Connecting-IP", "203.0.113.20")
                        .content(probeBody))
                .andExpect(status().isOk())
                .andExpect(header().string("Cache-Control", "no-store"))
                .andExpect(header().exists("X-Regression-Request-Id"))
                .andExpect(jsonPath("$.ok").value(true))
                .andExpect(jsonPath("$.probe_id").value(objectMapper.readTree(probeBody).path("probe_id").asText()))
                .andExpect(jsonPath("$.proof_valid").value(true))
                .andReturn();

        assertExactContentLengthAndNewline(verifyResult);
        JsonNode audit = lastAudit();
        JsonNode probeAudit = objectMapper.readTree(auditLines.get(auditLines.size() - 2));
        assertThat(audit.path("event").asText()).isEqualTo("probe_verified");
        assertThat(audit.path("verify_called").asBoolean()).isTrue();
        assertThat(audit.path("proof_valid").asBoolean()).isTrue();
        assertThat(audit.has("request_body_raw")).isFalse();
        assertThat(audit.path("request_body_bytes").asInt()).isEqualTo(probeBody.length);
        assertThat(audit.path("request_body_sha256").asText())
                .isEqualTo(ActionRegressionService.sha256Hex(probeBody));
        assertThat(audit.path("request_body_truncated").asBoolean()).isFalse();
        JsonNode input = objectMapper.readTree(probeBody);
        assertThat(audit.path("probe_id").asText()).isEqualTo(input.path("probe_id").asText());
        assertThat(audit.path("token").asText()).isEqualTo(input.path("token").asText());
        assertThat(audit.path("proof").asText()).isEqualTo(input.path("proof").asText());
        assertThat(audit.path("request_sequence").asLong())
                .isGreaterThan(probeAudit.path("request_sequence").asLong());
        assertThat(audit.path("request_started_at").asText()).isNotBlank();
        assertThat(audit.path("selected_headers").toString())
                .doesNotContain("203.0.113.19", "203.0.113.20", "direct-control/1");
        assertThat(audit.has("remote_addr")).isFalse();
        JsonNode verifyResponse = objectMapper.readTree(audit.path("response_body_raw").asText());
        assertThat(verifyResponse.path("ok").asBoolean()).isTrue();
        assertThat(verifyResponse.path("proof_valid").asBoolean()).isTrue();
        assertThat(audit.path("response_committed").asBoolean()).isTrue();
    }

    @Test
    void validlyFormattedMutationsReturnOkFalse() throws Exception {
        JsonNode original = getProbe();
        List<Map<String, String>> mutations = new ArrayList<>();
        mutations.add(probeMap(
                "223e4567-e89b-42d3-a456-426614174000",
                original.path("token").asText(),
                original.path("proof").asText()));
        String token = original.path("token").asText();
        mutations.add(probeMap(
                original.path("probe_id").asText(),
                token.substring(0, token.length() - 1) + (token.endsWith("A") ? "B" : "A"),
                original.path("proof").asText()));
        String proof = original.path("proof").asText();
        mutations.add(probeMap(
                original.path("probe_id").asText(),
                token,
                (proof.startsWith("0") ? "1" : "0") + proof.substring(1)));

        for (Map<String, String> mutation : mutations) {
            mockMvc.perform(post(PREFIX + "/v1/verify")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsBytes(mutation)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.ok").value(false))
                    .andExpect(jsonPath("$.proof_valid").value(false));
            assertThat(lastAudit().path("proof_valid").asBoolean()).isFalse();
        }
    }

    @Test
    void malformedSchemaArraysExtraFieldsDuplicatesAndTrailingJsonAreRejected() throws Exception {
        JsonNode probe = getProbe();
        String id = probe.path("probe_id").asText();
        String token = probe.path("token").asText();
        String proof = probe.path("proof").asText();
        List<String> invalidBodies = List.of(
                "{",
                "{\"probe_id\":[\"" + id + "\"],\"token\":\"" + token + "\",\"proof\":\"" + proof + "\"}",
                "{\"probe_id\":\"" + id + "\",\"token\":[\"" + token + "\"],\"proof\":\"" + proof + "\"}",
                "{\"probe_id\":\"" + id + "\",\"token\":\"" + token + "\",\"proof\":[\"" + proof + "\"]}",
                "{\"probe_id\":\"" + id + "\",\"token\":\"" + token + "\",\"proof\":\"" + proof + "\",\"extra\":true}",
                "{\"probe_id\":\"" + id + "\",\"probe_id\":\"" + id + "\",\"token\":\"" + token + "\",\"proof\":\"" + proof + "\"}",
                objectMapper.writeValueAsString(probe) + " true");

        for (String body : invalidBodies) {
            mockMvc.perform(post(PREFIX + "/v1/verify")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error").value("invalid_request"));
            JsonNode audit = lastAudit();
            assertThat(audit.path("event").asText()).isEqualTo("probe_verification_rejected");
            assertThat(audit.path("verify_called").asBoolean()).isTrue();
            assertThat(audit.path("error").asText()).isEqualTo("invalid_request");
        }
    }

    @Test
    void nonJsonContentTypeIsRejectedWithHashButWithoutRawBody() throws Exception {
        byte[] body = objectMapper.writeValueAsBytes(getProbe());
        mockMvc.perform(post(PREFIX + "/v1/verify")
                        .contentType(MediaType.TEXT_PLAIN)
                        .content(body))
                .andExpect(status().isUnsupportedMediaType())
                .andExpect(jsonPath("$.error").value("unsupported_media_type"));

        JsonNode audit = lastAudit();
        assertThat(audit.path("event").asText()).isEqualTo("probe_verification_rejected");
        assertThat(audit.has("request_body_raw")).isFalse();
        assertThat(audit.path("request_body_bytes").asInt()).isEqualTo(body.length);
        assertThat(audit.path("request_body_sha256").asText())
                .isEqualTo(ActionRegressionService.sha256Hex(body));
    }

    @Test
    void payloadOver4096BytesReturns413WithExactCaptureAndHash() throws Exception {
        byte[] body = new byte[4097];
        Arrays.fill(body, (byte) 'x');

        mockMvc.perform(post(PREFIX + "/v1/verify")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isPayloadTooLarge())
                .andExpect(jsonPath("$.error").value("payload_too_large"));

        JsonNode audit = lastAudit();
        assertThat(audit.path("event").asText()).isEqualTo("probe_verification_rejected");
        assertThat(audit.path("request_body_bytes").asInt()).isEqualTo(4097);
        assertThat(audit.path("request_body_capture_bytes").asInt()).isEqualTo(4097);
        assertThat(audit.path("request_body_sha256").asText())
                .isEqualTo(ActionRegressionService.sha256Hex(body));
        assertThat(audit.path("request_body_truncated").asBoolean()).isFalse();
    }

    @Test
    void auditCaptureStopsExactlyAt8192BytesForLargerPayloads() throws Exception {
        byte[] body = new byte[9000];
        Arrays.fill(body, (byte) 'z');
        byte[] expectedCapture = Arrays.copyOf(body, ActionRegressionService.MAX_AUDIT_CAPTURE_BYTES);

        mockMvc.perform(post(PREFIX + "/v1/verify")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isPayloadTooLarge());

        JsonNode audit = lastAudit();
        assertThat(audit.path("request_body_bytes").isNull()).isTrue();
        assertThat(audit.path("request_body_bytes_exact").asBoolean()).isFalse();
        assertThat(audit.path("request_body_observed_bytes").asInt()).isEqualTo(8193);
        assertThat(audit.path("request_body_capture_bytes").asInt()).isEqualTo(8192);
        assertThat(audit.path("request_body_capture_sha256").asText())
                .isEqualTo(ActionRegressionService.sha256Hex(expectedCapture));
        assertThat(audit.path("request_body_truncated").asBoolean()).isTrue();
    }

    private JsonNode getProbe() throws Exception {
        MvcResult result = mockMvc.perform(get(PREFIX + "/v1/probe"))
                .andExpect(status().isOk())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsByteArray());
    }

    private JsonNode lastAudit() throws Exception {
        return objectMapper.readTree(auditLines.getLast());
    }

    private static void assertProbeShape(JsonNode probe) {
        assertThat(probe.isObject()).isTrue();
        assertThat(probe.size()).isEqualTo(3);
        assertThat(probe.path("probe_id").asText())
                .matches("^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$");
        assertThat(probe.path("token").asText())
                .matches("^SPREG-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{16}$");
        assertThat(probe.path("proof").asText()).matches("^[0-9a-f]{32}$");
    }

    private static Map<String, String> probeMap(String probeId, String token, String proof) {
        Map<String, String> body = new LinkedHashMap<>();
        body.put("probe_id", probeId);
        body.put("token", token);
        body.put("proof", proof);
        return body;
    }

    private static void assertExactContentLengthAndNewline(MvcResult result) {
        byte[] body = result.getResponse().getContentAsByteArray();
        assertThat(body).isNotEmpty();
        assertThat(body[body.length - 1]).isEqualTo((byte) '\n');
        assertThat(result.getResponse().getHeader("Content-Length"))
                .isEqualTo(Integer.toString(body.length));
        assertThat(result.getResponse().getHeader("X-Regression-Request-Id"))
                .satisfies(value -> UUID.fromString(value));
    }

    private static long count(String value, String needle) {
        return value.lines().filter(line -> line.contains(needle)).count();
    }

    private static byte[] testKey() {
        byte[] key = new byte[32];
        for (int index = 0; index < key.length; index++) {
            key[index] = (byte) index;
        }
        return key;
    }
}
