package com.skillpilot.backend.ai;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.StateMachineInfo;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.connectors.gemini.v1.mcp.GeminiV1CoachContextProjector;
import com.skillpilot.backend.openai.mcp.de.OpenAiDeCoachContext;
import com.skillpilot.backend.openai.mcp.de.OpenAiDeCoachContextProjector;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

class VoluntaryProviderChoiceTest {
    private static final String ORIGIN = "https://skillpilot.test";
    private static final FrontierGoal REGULAR = goal("regular", null);
    private static final FrontierGoal OFFER = goal("offer", new FrontierGoal.StudyGuidance(List.of(), true));

    @ParameterizedTest
    @CsvSource({"de,Freiwillig: Pfeile", "en,Voluntary: Pfeile"})
    void openAiOrdinaryChoicesAndFrontierDistinguishTheOfferAndKeepItsWriteId(String language, String label) {
        var projector = new OpenAiDeCoachContextProjector(new CoachStateProjection(ORIGIN), ORIGIN);
        var result = projector.project(state(), null, false, language);
        assertThat(result.options()).extracting(OpenAiDeCoachContext.Option::label)
                .containsExactly("Pfeile", label);
        assertThat(result.options().get(1).id()).isEqualTo(OFFER.id());
        assertThat(result.options().get(1).goalIds()).containsExactly(OFFER.id());
        assertThat(result.frontier()).extracting(OpenAiDeCoachContext.Goal::title)
                .containsExactly("Pfeile", label);
        assertThat(result.frontier().get(1).goalId()).isEqualTo(OFFER.id());
    }

    @ParameterizedTest
    @CsvSource({"de,Freiwillig: Pfeile", "en,Voluntary: Pfeile"})
    void geminiOrdinaryChoicesAndFrontierDistinguishTheOfferAndKeepItsWriteId(String language, String label) {
        var facade = mock(CoachToolFacade.class);
        when(facade.getLearnerState("learner")).thenReturn(state());
        var projector = new GeminiV1CoachContextProjector(new CoachStateProjection(ORIGIN), facade, ORIGIN);
        var context = projector.projectContext("learner", 1, language);
        @SuppressWarnings("unchecked")
        var frontier = (List<Map<String, Object>>) context.get("frontier");
        assertThat(frontier).extracting(row -> row.get("title")).containsExactly("Pfeile", label);
        assertThat(frontier.get(1)).containsEntry("id", OFFER.id());
        assertThat(projector.formatNavigationGoal(REGULAR, language)).containsEntry("title", "Pfeile");
        assertThat(projector.formatNavigationGoal(OFFER, language))
                .containsEntry("title", label).containsEntry("goalIds", List.of(OFFER.id()));
    }

    private static FrontierGoal goal(String id, FrontierGoal.StudyGuidance guidance) {
        return new FrontierGoal(id, "Pfeile", "Pfeile lesen.", "atomic", null, null, null,
                List.of(), List.of(), null, null, null, null, false, List.of(id), guidance);
    }

    private static UnifiedLearnerStateResponse state() {
        var choices = List.of(REGULAR, OFFER);
        return new UnifiedLearnerStateResponse("learner", null, choices, null, List.of("setActiveGoal"),
                List.of(), Set.of(), "frontier", null,
                new StateMachineInfo("frontier", "setActiveGoal", choices, List.of(), null));
    }
}
