package com.skillpilot.backend.openai.mcp.de;

import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1McpContractAdapter;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.skillpilot.backend.ai.CoachStateProjection;
import com.skillpilot.backend.ai.CoachToolFacade;
import com.skillpilot.backend.api.GoalStats;
import com.skillpilot.backend.api.LearnerGoals;
import com.skillpilot.backend.api.PersonalizationPlan;
import com.skillpilot.backend.api.PersonalizationRequest;
import com.skillpilot.backend.api.StateMachineInfo;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.landscape.LandscapeSummary;
import com.skillpilot.backend.openai.de.observability.OpenAiDeOperationalTelemetry;
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1McpSessionCoordinator;
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1SessionMetadata;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import io.modelcontextprotocol.common.McpTransportContext;
import io.modelcontextprotocol.server.McpStatelessServerFeatures;
import io.modelcontextprotocol.spec.McpSchema;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class OpenAiDeCoachPersonalizationContractTest {

    private static final String LEARNER_ID = "learner-mica";
    private static final String LEARNING_SESSION_ID =
            "sps_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
    private static final String ROOT_ID = "landscape-orbit";
    private static final String FIRST_DESCENDANT_ID = "landscape-cobalt";
    private static final String SECOND_DESCENDANT_ID = "landscape-ember";

    private CoachToolFacade coachTools;
    private OpenAiDeV1McpContractAdapter contract;

    @BeforeEach
    void setUp() {
        coachTools = mock(CoachToolFacade.class);
        OpenAiDeCoachIdentityResolver identityResolver = mock(OpenAiDeCoachIdentityResolver.class);
        when(identityResolver.resolveSkillpilotId(any(), eq(LEARNING_SESSION_ID)))
                .thenReturn(LEARNER_ID);
        SimpleMeterRegistry meterRegistry = new SimpleMeterRegistry();
        OpenAiDeV1McpSessionCoordinator sessionCoordinator =
                mock(OpenAiDeV1McpSessionCoordinator.class);
        when(sessionCoordinator.read(any(), any())).thenAnswer(invocation ->
                sessionOperation(invocation.getArgument(1)));
        contract = new OpenAiDeV1McpContractAdapter(
                coachTools,
                new CoachStateProjection("https://skillpilot.test"),
                identityResolver,
                new OpenAiDeMcpTelemetry(
                        meterRegistry,
                        new OpenAiDeOperationalTelemetry(meterRegistry)),
                sessionCoordinator,
                "https://skillpilot.test",
                "skillpilot-personalization-contract-test-secret");
    }

    @Test
    void webFirstContractDoesNotPublishPersonalizationMutation() {
        assertThat(contract.toolSpecifications().stream()
                        .map(specification -> specification.tool().name()))
                .doesNotContain("set_skillpilot_personalization");
    }

    @Test
    void incompleteWebGuiPersonalizationFailsClosedWithoutPublishingChoices() {
        when(coachTools.getLearnerState(LEARNER_ID))
                .thenReturn(personalizationState(List.of("dial-b")));

        McpSchema.CallToolResult result = call(OpenAiDeV1McpContractAdapter.GET_CONTEXT, Map.of());

        assertThat(result.isError()).isTrue();
        assertThat(result.structuredContent()).isInstanceOfSatisfying(Map.class, content -> assertThat(content)
                .containsEntry("code", "SESSION_REQUIRED")
                .containsEntry("configurationRequired", true)
                .containsEntry("oauthConnectionValid", true)
                .containsEntry("startUrl", "https://skillpilot.test")
                .containsKey("instruction")
                .doesNotContainKeys(
                        "options",
                        "decision",
                        "orientation",
                        "personalizationHistory"));
        assertThat(result.content().toString())
                .contains("SkillPilot-WebGUI", "Lernen starten", "neuen Chat")
                .doesNotContain("po-cobalt-shared-band", "po-ember-shared-band");
        verify(coachTools, never()).getPersonalizationPlan(any());
        verify(coachTools, never())
                .setPersonalization(eq(LEARNER_ID), any(PersonalizationRequest.class));
    }

    @Test
    void configuredContextDoesNotExposePersonalizationPlanOrOpaqueOptionIds() {
        when(coachTools.getLearnerState(LEARNER_ID))
                .thenReturn(scopeState(List.of("dial-b", "shared-band")));
        when(coachTools.getPersonalizationPlan(LEARNER_ID))
                .thenReturn(descendantFilterPlan());

        McpSchema.CallToolResult result = call(OpenAiDeV1McpContractAdapter.GET_CONTEXT, Map.of());

        assertThat(result.isError()).isFalse();
        assertThat(result.structuredContent())
                .isInstanceOfSatisfying(Map.class, content -> {
                    assertThat(content)
                            .containsEntry("requiredAction", "setScope")
                            .containsEntry("options", List.of())
                            .doesNotContainKeys(
                                    "orientation",
                                    "decision",
                                    "personalizationHistory");
                    assertThat(content.toString())
                            .doesNotContain(
                                    "po-cobalt-shared-band",
                                    "po-ember-shared-band",
                                    FIRST_DESCENDANT_ID,
                                    SECOND_DESCENDANT_ID,
                                    "shared-band");
                });
        verify(coachTools, never())
                .setPersonalization(eq(LEARNER_ID), any(PersonalizationRequest.class));
    }

    private McpSchema.CallToolResult call(String name, Map<String, Object> arguments) {
        Map<String, Object> requestArguments = new java.util.LinkedHashMap<>(arguments);
        requestArguments.put(
                OpenAiDeV1McpContractAdapter.LEARNING_SESSION_ID,
                LEARNING_SESSION_ID);
        McpStatelessServerFeatures.SyncToolSpecification specification =
                contract.toolSpecifications().stream()
                        .filter(candidate -> name.equals(candidate.tool().name()))
                        .findFirst()
                        .orElseThrow();
        return specification.callHandler().apply(
                McpTransportContext.EMPTY,
                new McpSchema.CallToolRequest(name, requestArguments));
    }

    @SuppressWarnings("unchecked")
    private static McpSchema.CallToolResult sessionOperation(Object operation) {
        Function<OpenAiDeV1SessionMetadata, McpSchema.CallToolResult> callback =
                (Function<OpenAiDeV1SessionMetadata, McpSchema.CallToolResult>) operation;
        return callback.apply(new OpenAiDeV1SessionMetadata(
                1,
                0,
                1,
                "coach@1.0",
                "curricula-tree@test",
                "de",
                Map.of()));
    }

    private static PersonalizationPlan descendantFilterPlan() {
        List<PersonalizationPlan.Option> options = List.of(
                option(
                        "po-cobalt-shared-band",
                        "stage-profile",
                        "group-profile",
                        FIRST_DESCENDANT_ID,
                        "Cobalt",
                        "shared-band",
                        "Shared Band"),
                option(
                        "po-ember-shared-band",
                        "stage-profile",
                        "group-profile",
                        SECOND_DESCENDANT_ID,
                        "Ember",
                        "shared-band",
                        "Shared Band"));
        return PersonalizationPlan.selection(
                "stage-profile",
                "Profile",
                "group-profile",
                "Profile",
                "group-profile",
                1,
                1,
                0,
                options,
                options);
    }

    private static PersonalizationPlan.Option option(
            String optionId,
            String stageId,
            String groupId,
            String landscapeId,
            String landscapeLabel,
            String filterId,
            String filterLabel) {
        return new PersonalizationPlan.Option(
                optionId,
                stageId,
                groupId,
                groupId,
                landscapeId,
                landscapeLabel,
                filterId,
                filterLabel);
    }

    private static UnifiedLearnerStateResponse personalizationState(List<String> activeFilters) {
        return state(
                activeFilters,
                "PERSONALIZATION",
                "setPersonalization",
                List.of("setPersonalization"));
    }

    private static UnifiedLearnerStateResponse scopeState(List<String> activeFilters) {
        return state(
                activeFilters,
                "SCOPE_SELECTION",
                "setScope",
                List.of("setScope", "getFrontier"));
    }

    private static UnifiedLearnerStateResponse state(
            List<String> activeFilters,
            String machineState,
            String requiredAction,
            List<String> nextAllowedActions) {
        return new UnifiedLearnerStateResponse(
                LEARNER_ID,
                rootSummary(),
                List.of(),
                new LearnerGoals(
                        List.of(),
                        0,
                        0,
                        new GoalStats(0, 0),
                        new GoalStats(0, 0),
                        false),
                nextAllowedActions,
                activeFilters,
                Set.of(),
                "frontier",
                null,
                new StateMachineInfo(
                        machineState,
                        requiredAction,
                        List.of(),
                        List.of(),
                        null));
    }

    private static LandscapeSummary rootSummary() {
        return new LandscapeSummary(
                ROOT_ID,
                "Orbit",
                "Orbit",
                "xx",
                "XXX",
                "Type Q",
                "Domain R",
                "xx-XX",
                List.of());
    }
}
