package com.skillpilot.backend.ui;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.exc.UnrecognizedPropertyException;
import com.skillpilot.backend.api.OpenAiDeCoachStartRequest;
import com.skillpilot.backend.api.OpenAiDeCoachStartRequest.LaunchIntent;
import com.skillpilot.backend.api.OpenAiDeCoachStartRequest.LaunchIntentType;
import com.skillpilot.backend.api.OpenAiDeLaunchResponse;
import com.skillpilot.backend.service.OpenAiDeCoachConnectionService;
import java.time.Instant;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class OpenAiDeCoachUiControllerTest {

    private static final String SKILLPILOT_ID = "learner-secret-id";
    private static final String LEARNING_SESSION_ID =
            "sps_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
    private static final String PROMPT =
            "Verwende die App SkillPilot Coach DE v1 und fahre mit dem in SkillPilot vorbereiteten "
                    + "nächsten Schritt fort.\n\nSkillPilot-Lernsession: "
                    + LEARNING_SESSION_ID
                    + "\nVerwende diese Lernsession bei jedem SkillPilot-App-Aufruf unverändert im Parameter "
                    + "learningSessionId.";

    private OpenAiDeCoachConnectionService connectionService;
    private OpenAiDeCoachUiController controller;

    @BeforeEach
    void setUp() {
        connectionService = mock(OpenAiDeCoachConnectionService.class);
        controller = new OpenAiDeCoachUiController(connectionService);
    }

    @Test
    void launchDelegatesOnlyToIndependentLearningSessionStart() {
        OpenAiDeCoachStartRequest request = new OpenAiDeCoachStartRequest(
                "de",
                "web",
                "math",
                true,
                new LaunchIntent(LaunchIntentType.ABI26_EXAM, "server-side-goal", null, "GK"));
        OpenAiDeLaunchResponse response = new OpenAiDeLaunchResponse(
                PROMPT,
                "https://chatgpt.com/",
                LEARNING_SESSION_ID,
                Instant.now().plusSeconds(86_400));
        when(connectionService.createLaunch(SKILLPILOT_ID, request)).thenReturn(response);

        OpenAiDeLaunchResponse result = controller.createLaunch(SKILLPILOT_ID, request);

        assertThat(result).isSameAs(response);
        assertThat(result.learningSessionId()).isEqualTo(LEARNING_SESSION_ID);
        assertThat(result.toString())
                .doesNotContain(SKILLPILOT_ID)
                .doesNotContain("promptContext")
                .doesNotContain("spodb_");
        verify(connectionService).createLaunch(SKILLPILOT_ID, request);
        verifyNoMoreInteractions(connectionService);
    }

    @Test
    void providerSpecificStartContractRejectsLegacyFreeFormPromptContext() {
        assertThatExceptionOfType(UnrecognizedPropertyException.class)
                .isThrownBy(() -> new ObjectMapper().readValue(
                        """
                        {
                          "language": "de",
                          "client": "web",
                          "selectedCurriculum": "math",
                          "promptContext": "never accepted by the OpenAI MCP boundary"
                        }
                        """,
                        OpenAiDeCoachStartRequest.class));
    }

    @Test
    void providerEligibilityConfirmationIsTriStateAtTheJsonBoundary() throws Exception {
        ObjectMapper mapper = new ObjectMapper();

        OpenAiDeCoachStartRequest missing =
                mapper.readValue("{\"language\":\"de\"}", OpenAiDeCoachStartRequest.class);
        OpenAiDeCoachStartRequest rejected = mapper.readValue(
                "{\"language\":\"de\",\"providerEligibilityConfirmed\":false}",
                OpenAiDeCoachStartRequest.class);
        OpenAiDeCoachStartRequest accepted = mapper.readValue(
                "{\"language\":\"de\",\"providerEligibilityConfirmed\":true}",
                OpenAiDeCoachStartRequest.class);

        assertThat(missing.providerEligibilityConfirmed()).isNull();
        assertThat(rejected.providerEligibilityConfirmed()).isFalse();
        assertThat(accepted.providerEligibilityConfirmed()).isTrue();
    }
}
