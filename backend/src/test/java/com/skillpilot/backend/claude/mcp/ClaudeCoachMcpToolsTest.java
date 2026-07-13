package com.skillpilot.backend.claude.mcp;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.ai.CoachToolFacade;
import com.skillpilot.backend.api.MasteryUpdateRequest;
import com.skillpilot.backend.api.ScopeRequest;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.claude.oauth.ClaudeOAuthConfiguration;
import com.skillpilot.backend.domain.CopySource;
import com.skillpilot.backend.service.ClaudeCoachConnectionService;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class ClaudeCoachMcpToolsTest {

    private static final String SUBJECT = "spc_connection_subject";
    private static final String SKILLPILOT_ID = "permanent-skillpilot-id";

    private final ObjectMapper objectMapper = new ObjectMapper();
    private CoachToolFacade coachTools;
    private ClaudeCoachConnectionService connectionService;
    private ClaudeCoachMcpTools tools;

    @BeforeEach
    void setUp() {
        coachTools = mock(CoachToolFacade.class);
        connectionService = mock(ClaudeCoachConnectionService.class);
        tools = new ClaudeCoachMcpTools(coachTools, connectionService);
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void resolvesLearnerFromAuthenticatedConnectionSubjectAndRedactsPermanentId() throws Exception {
        authenticate(ClaudeOAuthConfiguration.READ_SCOPE);
        when(connectionService.resolveSkillpilotId(SUBJECT)).thenReturn(SKILLPILOT_ID);
        when(connectionService.consumePendingLaunch(SUBJECT)).thenReturn(Optional.of(
                new ClaudeCoachConnectionService.PendingLaunch(
                        "launch-id",
                        "de",
                        "curriculum-id",
                        Instant.parse("2030-01-01T00:00:00Z"))));
        when(coachTools.getLearnerState(SKILLPILOT_ID)).thenReturn(stateWithSkillpilotId());

        ClaudeCoachMcpTools.CoachContext context = tools.getCoachContext();

        assertThat(context.pendingLaunchConsumed()).isTrue();
        assertThat(context.language()).isEqualTo("de");
        assertThat(context.selectedCurriculum()).isEqualTo("curriculum-id");
        assertThat(context.state().learningState()).isEqualTo("learning");
        assertThat(objectMapper.writeValueAsString(context)).doesNotContain(SKILLPILOT_ID);
        assertThat(objectMapper.writeValueAsString(context)).doesNotContain("copied-learner-secret-id");
        verify(connectionService).resolveSkillpilotId(SUBJECT);
        verify(connectionService).consumePendingLaunch(SUBJECT);
        verify(coachTools).getLearnerState(SKILLPILOT_ID);
    }

    @Test
    void rejectsMissingAuthenticationBeforeResolvingLearner() {
        assertThatThrownBy(tools::getCoachContext)
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("authentication is required");
        verifyNoInteractions(coachTools, connectionService);
    }

    @Test
    void doesNotInventGermanLanguageWhenAConsumedLaunchIsReloaded() {
        authenticate(ClaudeOAuthConfiguration.READ_SCOPE);
        when(connectionService.resolveSkillpilotId(SUBJECT)).thenReturn(SKILLPILOT_ID);
        when(connectionService.consumePendingLaunch(SUBJECT)).thenReturn(Optional.empty());
        when(coachTools.getLearnerState(SKILLPILOT_ID)).thenReturn(stateWithSkillpilotId());

        ClaudeCoachMcpTools.CoachContext context = tools.getCoachContext();

        assertThat(context.pendingLaunchConsumed()).isFalse();
        assertThat(context.language()).isNull();
        assertThat(context.instruction()).contains("user's language");
    }

    @Test
    void rejectsWriteWithoutWriteScopeAndAllowsItWithScope() throws Exception {
        authenticate(ClaudeOAuthConfiguration.READ_SCOPE);

        assertThatThrownBy(() -> tools.setScope(List.of("goal-1")))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("write scope");
        verifyNoInteractions(coachTools, connectionService);

        authenticate(ClaudeOAuthConfiguration.READ_SCOPE, ClaudeOAuthConfiguration.WRITE_SCOPE);
        when(connectionService.resolveSkillpilotId(SUBJECT)).thenReturn(SKILLPILOT_ID);
        when(coachTools.setScope(eq(SKILLPILOT_ID), any(ScopeRequest.class)))
                .thenReturn(stateWithSkillpilotId());

        ClaudeCoachMcpTools.CoachState response = tools.setScope(List.of("goal-1"));

        assertThat(objectMapper.writeValueAsString(response)).doesNotContain(SKILLPILOT_ID);
        ArgumentCaptor<ScopeRequest> request = ArgumentCaptor.forClass(ScopeRequest.class);
        verify(coachTools).setScope(eq(SKILLPILOT_ID), request.capture());
        assertThat(request.getValue().goalIds()).containsExactly("goal-1");
    }

    @Test
    void nullOrInvalidMasteryReturnsBadRequestWithoutMapOfFailureOrBackendCall() {
        authenticate(ClaudeOAuthConfiguration.READ_SCOPE, ClaudeOAuthConfiguration.WRITE_SCOPE);

        assertBadMastery(tools.setMastery(null, 0.5), "goalId");
        assertBadMastery(tools.setMastery("goal-1", null), "between 0.0 and 1.0");
        assertBadMastery(tools.setMastery("goal-1", Double.NaN), "between 0.0 and 1.0");
        assertBadMastery(tools.setMastery("goal-1", 1.1), "between 0.0 and 1.0");
        verifyNoInteractions(coachTools, connectionService);
    }

    @Test
    void redactsPermanentIdFromMasteryConflictState() throws Exception {
        authenticate(ClaudeOAuthConfiguration.READ_SCOPE, ClaudeOAuthConfiguration.WRITE_SCOPE);
        when(connectionService.resolveSkillpilotId(SUBJECT)).thenReturn(SKILLPILOT_ID);
        when(coachTools.setMastery(eq(SKILLPILOT_ID), any(MasteryUpdateRequest.class)))
                .thenReturn(new CoachToolFacade.MasteryResult(
                        CoachToolFacade.MasteryStatus.CONFLICT,
                        null,
                        stateWithSkillpilotId(),
                        null));

        ClaudeCoachMcpTools.MasteryToolResult result = tools.setMastery(" goal-1 ", 0.75);

        assertThat(result.status()).isEqualTo("conflict");
        assertThat(result.state().learningState()).isEqualTo("learning");
        assertThat(objectMapper.writeValueAsString(result)).doesNotContain(SKILLPILOT_ID);
        ArgumentCaptor<MasteryUpdateRequest> request = ArgumentCaptor.forClass(MasteryUpdateRequest.class);
        verify(coachTools).setMastery(eq(SKILLPILOT_ID), request.capture());
        assertThat(request.getValue().goalId()).isEqualTo("goal-1");
        assertThat(request.getValue().mastery()).containsEntry("goal-1", 0.75);
    }

    private void authenticate(String... scopes) {
        List<SimpleGrantedAuthority> authorities = java.util.Arrays.stream(scopes)
                .map(scope -> new SimpleGrantedAuthority("SCOPE_" + scope))
                .toList();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(SUBJECT, "unused", authorities));
    }

    private UnifiedLearnerStateResponse stateWithSkillpilotId() {
        return new UnifiedLearnerStateResponse(
                SKILLPILOT_ID,
                null,
                List.of(),
                null,
                List.of(),
                List.of(),
                Set.of(new CopySource(
                        "copied-learner-secret-id",
                        Instant.parse("2026-01-01T00:00:00Z"))),
                "learning",
                null,
                null);
    }

    private void assertBadMastery(ClaudeCoachMcpTools.MasteryToolResult result, String errorPart) {
        assertThat(result.status()).isEqualTo("bad_request");
        assertThat(result.update()).isNull();
        assertThat(result.state()).isNull();
        assertThat(result.error()).contains(errorPart);
    }
}
