package com.skillpilot.backend.openai.mcp.de;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.tuple;
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
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import io.modelcontextprotocol.common.McpTransportContext;
import io.modelcontextprotocol.server.McpStatelessServerFeatures;
import io.modelcontextprotocol.spec.McpSchema;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

class OpenAiDeCoachPersonalizationContractTest {

    private static final String LEARNER_ID = "learner-mica";
    private static final String ROOT_ID = "landscape-orbit";
    private static final String FIRST_DESCENDANT_ID = "landscape-cobalt";
    private static final String SECOND_DESCENDANT_ID = "landscape-ember";

    private CoachToolFacade coachTools;
    private OpenAiDeCoachMcpContract contract;

    @BeforeEach
    void setUp() {
        coachTools = mock(CoachToolFacade.class);
        OpenAiDeCoachIdentityResolver identityResolver = mock(OpenAiDeCoachIdentityResolver.class);
        when(identityResolver.resolveSkillpilotId(any())).thenReturn(LEARNER_ID);
        SimpleMeterRegistry meterRegistry = new SimpleMeterRegistry();
        contract = new OpenAiDeCoachMcpContract(
                coachTools,
                new CoachStateProjection("https://skillpilot.test"),
                identityResolver,
                new OpenAiDeMcpTelemetry(
                        meterRegistry,
                        new OpenAiDeOperationalTelemetry(meterRegistry)),
                "https://skillpilot.test");
    }

    @Test
    void rootMutationReturnsTheFreshDescendantFilterPlan() {
        UnifiedLearnerStateResponse before = personalizationState(List.of());
        UnifiedLearnerStateResponse after = personalizationState(List.of("dial-b"));
        when(coachTools.getLearnerState(LEARNER_ID)).thenReturn(before);
        when(coachTools.getPersonalizationPlan(LEARNER_ID))
                .thenReturn(rootFilterPlan(), descendantFilterPlan());
        when(coachTools.setPersonalization(eq(LEARNER_ID), any(PersonalizationRequest.class)))
                .thenReturn(after);

        McpSchema.CallToolResult result = call(
                OpenAiDeCoachMcpContract.SET_PERSONALIZATION,
                Map.of("optionId", "po-root-dial-b"));

        assertThat(result.isError()).isFalse();
        assertThat(result.structuredContent())
                .isInstanceOfSatisfying(OpenAiDeCoachContext.class, context -> {
                    assertThat(context.requiredAction()).isEqualTo("setPersonalization");
                    assertThat(context.options())
                            .extracting(
                                    OpenAiDeCoachContext.Option::id,
                                    OpenAiDeCoachContext.Option::label,
                                    OpenAiDeCoachContext.Option::goalIds,
                                    OpenAiDeCoachContext.Option::filterIds)
                            .containsExactly(
                                    tuple(
                                            "po-cobalt-shared-band",
                                            "Cobalt – Shared Band",
                                            List.of(),
                                            List.of()),
                                    tuple(
                                            "po-ember-shared-band",
                                            "Ember – Shared Band",
                                            List.of(),
                                            List.of()));
                });

        ArgumentCaptor<PersonalizationRequest> request =
                ArgumentCaptor.forClass(PersonalizationRequest.class);
        verify(coachTools).setPersonalization(eq(LEARNER_ID), request.capture());
        assertThat(request.getValue().optionId()).isEqualTo("po-root-dial-b");
        assertThat(request.getValue().goalIds()).isEmpty();
        assertThat(request.getValue().filters()).isEmpty();
    }

    @Test
    void opaqueOptionDisambiguatesRepeatedFilterLabels() {
        UnifiedLearnerStateResponse before = personalizationState(List.of("dial-b"));
        UnifiedLearnerStateResponse after = scopeState(List.of("dial-b", "shared-band"));
        when(coachTools.getLearnerState(LEARNER_ID)).thenReturn(before);
        when(coachTools.getPersonalizationPlan(LEARNER_ID))
                .thenReturn(descendantFilterPlan());
        when(coachTools.setPersonalization(eq(LEARNER_ID), any(PersonalizationRequest.class)))
                .thenReturn(after);

        McpSchema.CallToolResult result = call(
                OpenAiDeCoachMcpContract.SET_PERSONALIZATION,
                Map.of("optionId", "po-cobalt-shared-band"));

        assertThat(result.isError()).isFalse();
        ArgumentCaptor<PersonalizationRequest> request =
                ArgumentCaptor.forClass(PersonalizationRequest.class);
        verify(coachTools).setPersonalization(eq(LEARNER_ID), request.capture());
        assertThat(request.getValue().optionId()).isEqualTo("po-cobalt-shared-band");
        assertThat(request.getValue().goalIds()).isEmpty();
        assertThat(request.getValue().filters()).isEmpty();
        assertThat(result.structuredContent())
                .isInstanceOfSatisfying(OpenAiDeCoachContext.class, context -> {
                    assertThat(context.requiredAction()).isEqualTo("setScope");
                    assertThat(context.options()).isEmpty();
                });
    }

    @Test
    void unknownOpaqueOptionIsRejectedWithoutCallingTheFacadeMutation() {
        when(coachTools.getLearnerState(LEARNER_ID))
                .thenReturn(personalizationState(List.of("dial-b")));
        when(coachTools.getPersonalizationPlan(LEARNER_ID))
                .thenReturn(descendantFilterPlan());

        McpSchema.CallToolResult result = call(
                OpenAiDeCoachMcpContract.SET_PERSONALIZATION,
                Map.of("optionId", "po-unknown"));

        assertThat(result.isError()).isTrue();
        verify(coachTools, never())
                .setPersonalization(eq(LEARNER_ID), any(PersonalizationRequest.class));
    }

    private McpSchema.CallToolResult call(String name, Map<String, Object> arguments) {
        McpStatelessServerFeatures.SyncToolSpecification specification =
                contract.toolSpecifications().stream()
                        .filter(candidate -> name.equals(candidate.tool().name()))
                        .findFirst()
                        .orElseThrow();
        return specification.callHandler().apply(
                McpTransportContext.EMPTY,
                new McpSchema.CallToolRequest(name, arguments));
    }

    private static PersonalizationPlan rootFilterPlan() {
        List<PersonalizationPlan.Option> options = List.of(
                option("po-root-dial-a", "stage-root", "group-root", ROOT_ID, "Orbit", "dial-a", "Dial A"),
                option("po-root-dial-b", "stage-root", "group-root", ROOT_ID, "Orbit", "dial-b", "Dial B"));
        return PersonalizationPlan.selection(
                "stage-root",
                "Root mode",
                "group-root",
                "Root mode",
                "group-root",
                1,
                1,
                0,
                options,
                options);
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
