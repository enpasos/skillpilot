package com.skillpilot.backend.openai.de.bootstrap;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

class OpenAiDeBootstrapControllerTest {

    private static final String CAPABILITY = "spc_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
    private static final String SKILLPILOT_ID = "11111111-1111-4111-8111-111111111111";
    private static final String CLIENT_REQUEST_ID = "22222222-2222-4222-8222-222222222222";
    private static final String REQUEST = """
            {
              "schemaVersion": 1,
              "identityMode": "EXISTING",
              "skillpilotId": "%s",
              "communicationLocale": "de",
              "launchIntent": {"type": "CURRENT_UNIT"},
              "providerNoticeVersion": "openai-provider-eligibility-v2",
              "clientRequestId": "%s"
            }
            """.formatted(SKILLPILOT_ID, CLIENT_REQUEST_ID);
    private static final String CREATE_REQUEST = """
            {
              "schemaVersion": 1,
              "identityMode": "CREATE",
              "communicationLocale": "de",
              "launchIntent": {"type": "CURRENT_UNIT"},
              "providerNoticeVersion": "openai-provider-eligibility-v2",
              "clientRequestId": "%s"
            }
            """.formatted(CLIENT_REQUEST_ID);

    private OpenAiDeBootstrapAttemptService attemptService;
    private ObjectMapper objectMapper;
    private OpenAiDeBootstrapController controller;

    @BeforeEach
    void setUp() {
        attemptService = mock(OpenAiDeBootstrapAttemptService.class);
        objectMapper = new ObjectMapper().findAndRegisterModules();
        controller = new OpenAiDeBootstrapController(attemptService, objectMapper);
    }

    @Test
    void acceptsCreateOnlyWithoutAnExistingIdField() {
        OpenAiDeBootstrapLaunchResponse expected = new OpenAiDeBootstrapLaunchResponse(
                1,
                "SESSION_CREATED",
                "de",
                Instant.parse("2026-08-10T08:00:00Z"),
                "Verwende SkillPilot Coach v1 und fahre fort.\nlearningSessionId: sps_test",
                SKILLPILOT_ID);
        when(attemptService.launch(eq(CAPABILITY), any())).thenReturn(expected);

        ResponseEntity<OpenAiDeBootstrapLaunchResponse> response = controller.launch(
                "SkillPilotSetup " + CAPABILITY,
                CREATE_REQUEST.getBytes(StandardCharsets.UTF_8));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        ArgumentCaptor<OpenAiDeBootstrapLaunchRequest> request =
                ArgumentCaptor.forClass(OpenAiDeBootstrapLaunchRequest.class);
        verify(attemptService).launch(eq(CAPABILITY), request.capture());
        assertThat(request.getValue().identityMode())
                .isEqualTo(OpenAiDeBootstrapLaunchRequest.IdentityMode.CREATE);
        assertThat(request.getValue().skillpilotId()).isNull();
        assertThat(response.getBody().createdSkillpilotId()).isEqualTo(SKILLPILOT_ID);
    }

    @Test
    void acceptsOnlyTheClosedCapabilityAuthorizedRequestAndReturnsNoStoreHeaders() {
        OpenAiDeBootstrapLaunchResponse expected = new OpenAiDeBootstrapLaunchResponse(
                1,
                "SESSION_CREATED",
                "de",
                Instant.parse("2026-08-10T08:00:00Z"),
                "Verwende SkillPilot Coach v1 und fahre fort.\nlearningSessionId: sps_test",
                null);
        when(attemptService.launch(eq(CAPABILITY), any())).thenReturn(expected);

        ResponseEntity<OpenAiDeBootstrapLaunchResponse> response = controller.launch(
                "SkillPilotSetup " + CAPABILITY,
                REQUEST.getBytes(StandardCharsets.UTF_8));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(expected);
        assertThat(response.getHeaders().getCacheControl()).isEqualTo("no-store");
        assertThat(response.getHeaders().getFirst(HttpHeaders.PRAGMA)).isEqualTo("no-cache");
        assertThat(response.getHeaders().getFirst("Referrer-Policy")).isEqualTo("no-referrer");
        assertThat(response.getHeaders().getFirst("X-Content-Type-Options")).isEqualTo("nosniff");

        ArgumentCaptor<OpenAiDeBootstrapLaunchRequest> request =
                ArgumentCaptor.forClass(OpenAiDeBootstrapLaunchRequest.class);
        verify(attemptService).launch(eq(CAPABILITY), request.capture());
        assertThat(request.getValue().skillpilotId()).isEqualTo(SKILLPILOT_ID);
        assertThat(request.getValue().identityMode())
                .isEqualTo(OpenAiDeBootstrapLaunchRequest.IdentityMode.EXISTING);
        assertThat(request.getValue().clientRequestId()).isEqualTo(CLIENT_REQUEST_ID);
        assertThat(request.getValue().launchIntent().type()).isEqualTo("CURRENT_UNIT");
    }

    @Test
    void rejectsUnknownDuplicateOversizedAndLegacyEligibilityFields() {
        assertInvalidRequest(REQUEST.replace(
                "\"clientRequestId\"",
                "\"unknown\": true, \"clientRequestId\""));
        assertInvalidRequest(REQUEST.replace(
                "\"communicationLocale\": \"de\"",
                "\"communicationLocale\": \"de\", \"communicationLocale\": \"en\""));
        assertInvalidRequest(REQUEST.replace(
                "\"clientRequestId\"",
                "\"providerEligibilityConfirmed\": true, \"clientRequestId\""));
        assertInvalidRequest(REQUEST.replace("\"EXISTING\"", "\"REUSE\""));
        assertInvalidRequest(REQUEST.replace(
                "\"skillpilotId\": \"%s\",\n".formatted(SKILLPILOT_ID),
                ""));
        assertInvalidRequest(CREATE_REQUEST.replace(
                "\"communicationLocale\": \"de\",",
                "\"skillpilotId\": null,\n  \"communicationLocale\": \"de\","));
        assertInvalidRequest(CREATE_REQUEST.replace(
                "\"communicationLocale\": \"de\",",
                "\"skillpilotId\": \"%s\",\n  \"communicationLocale\": \"de\",".formatted(
                        SKILLPILOT_ID)));
        assertInvalidRequest(REQUEST + " {}");
        assertInvalidRequest(" ".repeat(8 * 1024 + 1));
    }

    @Test
    void responseJsonReturnsCreatedIdOnlyForCreateMode() {
        Instant expiresAt = Instant.parse("2026-08-10T08:00:00Z");
        OpenAiDeBootstrapLaunchResponse existing = new OpenAiDeBootstrapLaunchResponse(
                1,
                "SESSION_CREATED",
                "de",
                expiresAt,
                "Verwende SkillPilot Coach v1 und fahre fort.\nlearningSessionId: sps_test",
                null);
        OpenAiDeBootstrapLaunchResponse created = new OpenAiDeBootstrapLaunchResponse(
                1,
                "SESSION_CREATED",
                "de",
                expiresAt,
                "Verwende SkillPilot Coach v1 und fahre fort.\nlearningSessionId: sps_test",
                SKILLPILOT_ID);

        assertThat(json(ResponseEntity.ok(existing)).fieldNames())
                .toIterable()
                .containsExactlyInAnyOrder(
                        "schemaVersion",
                        "status",
                        "communicationLocale",
                        "expiresAt",
                        "startMessage");
        assertThat(json(ResponseEntity.ok(existing)).toString())
                .doesNotContain("createdSkillpilotId", SKILLPILOT_ID);
        assertThat(json(ResponseEntity.ok(created)).fieldNames())
                .toIterable()
                .containsExactlyInAnyOrder(
                        "schemaVersion",
                        "status",
                        "communicationLocale",
                        "expiresAt",
                        "startMessage",
                        "createdSkillpilotId");
        assertThat(json(ResponseEntity.ok(created)).path("createdSkillpilotId").asText())
                .isEqualTo(SKILLPILOT_ID);
    }

    @Test
    void rejectsEveryAuthorizationVariantExceptTheExactPrivateScheme() {
        for (String authorization : new String[] {
                null,
                "",
                "Bearer " + CAPABILITY,
                "SkillPilotSetup",
                "SkillPilotSetup  " + CAPABILITY,
                "SkillPilotSetup " + CAPABILITY + " "
        }) {
            assertThatExceptionOfType(OpenAiDeBootstrapException.class)
                    .isThrownBy(() -> controller.launch(
                            authorization,
                            REQUEST.getBytes(StandardCharsets.UTF_8)))
                    .extracting(OpenAiDeBootstrapException::code)
                    .isEqualTo(OpenAiDeBootstrapErrorCode.INVALID_CAPABILITY);
        }
    }

    @Test
    void mapsErrorsToIdentifierFreeStableResponses() {
        ResponseEntity<?> profile = controller.bootstrapFailure(
                new OpenAiDeBootstrapException(OpenAiDeBootstrapErrorCode.PROFILE_UNAVAILABLE));
        assertThat(profile.getStatusCode()).isEqualTo(HttpStatus.UNPROCESSABLE_ENTITY);
        assertThat(json(profile).path("status").asText()).isEqualTo("PROFILE_UNAVAILABLE");
        assertThat(json(profile).path("fallbackUrl").asText()).isEqualTo("https://skillpilot.com/");
        assertThat(json(profile).toString()).doesNotContain(SKILLPILOT_ID, CAPABILITY);

        ResponseEntity<?> transientFailure = controller.bootstrapFailure(
                new OpenAiDeBootstrapException(
                        OpenAiDeBootstrapErrorCode.DELIVERY_UNAVAILABLE,
                        new IllegalStateException("internal core detail")));
        assertThat(transientFailure.getStatusCode()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
        assertThat(transientFailure.getHeaders().getFirst(HttpHeaders.RETRY_AFTER)).isEqualTo("30");
        assertThat(json(transientFailure).path("status").asText())
                .isEqualTo("TEMPORARILY_UNAVAILABLE");
        assertThat(json(transientFailure).toString()).doesNotContain("internal core detail");

        ResponseEntity<?> rateLimited = controller.bootstrapFailure(
                new OpenAiDeBootstrapException(OpenAiDeBootstrapErrorCode.RATE_LIMITED));
        assertThat(rateLimited.getStatusCode()).isEqualTo(HttpStatus.TOO_MANY_REQUESTS);
        assertThat(rateLimited.getHeaders().getFirst(HttpHeaders.RETRY_AFTER)).isEqualTo("30");
        assertThat(json(rateLimited).path("status").asText())
                .isEqualTo("TEMPORARILY_UNAVAILABLE");
    }

    private void assertInvalidRequest(String body) {
        assertThatExceptionOfType(OpenAiDeBootstrapException.class)
                .isThrownBy(() -> controller.launch(
                        "SkillPilotSetup " + CAPABILITY,
                        body.getBytes(StandardCharsets.UTF_8)))
                .extracting(OpenAiDeBootstrapException::code)
                .isEqualTo(OpenAiDeBootstrapErrorCode.INVALID_REQUEST);
    }

    private JsonNode json(ResponseEntity<?> response) {
        return objectMapper.valueToTree(response.getBody());
    }
}
