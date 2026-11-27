package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.landscape.GoalMappingService;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.repository.LearnerClientStateRepository;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import com.skillpilot.backend.repository.PlannedGoalRepository;
import com.skillpilot.backend.service.srs.SrsCard;
import com.skillpilot.backend.service.srs.SrsCardRelease;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.test.util.ReflectionTestUtils;

/** The release rule takes counted goals from the projection and passed goals from mastery plus unit credits. */
class LearnerCardReleaseTest {

    @Test
    void creditedGoalsCountLikePassedOnesWhilePrerequisiteOnlyAndForeignGoalsDoNotCount() throws Exception {
        LearnerService service = new LearnerService(mock(LearnerRepository.class), mock(LearnerClientStateRepository.class),
                mock(MasteryRepository.class), mock(PlannedGoalRepository.class), mock(LandscapeService.class),
                mock(GoalMappingService.class), mock(DeckResourceService.class), new ObjectMapper(),
                mock(ApplicationEventPublisher.class));
        Map<String, LearningGoal> graph = new LinkedHashMap<>();
        for (String id : List.of("passed", "legacyPassed", "credited", "open", "partial", "prerequisite")) {
            LearningGoal goal = new LearningGoal();
            goal.setId(id);
            goal.setType("atomic");
            graph.put(id, goal);
        }
        var constructor = Class.forName(LearnerService.class.getName() + "$GoalProjection").getDeclaredConstructors()[0];
        constructor.setAccessible(true);
        Object projection = constructor.newInstance(graph, Set.copyOf(graph.keySet()), Set.of("prerequisite"), graph,
                Set.of(), List.of(), false, null, graph, Map.of());

        SrsCardRelease release = ReflectionTestUtils.invokeMethod(service, "cardRelease", projection,
                Map.of("passed", 1.0, "legacyPassed", 0.95, "partial", 0.5), Set.of("credited"));

        assertThat(release.isReleased(card("passed", "credited"))).isTrue();
        assertThat(release.isReleased(card("legacyPassed"))).as("existing threshold").isTrue();
        assertThat(release.isReleased(card("passed", "open"))).isFalse();
        assertThat(release.isReleased(card("partial"))).isFalse();
        assertThat(release.isReleased(card("prerequisite"))).as("prerequisite-only entries do not count").isTrue();
        assertThat(release.isReleased(card("foreign"))).as("outside the Personal Curriculum").isTrue();
        assertThat(release.isReleased(card())).as("no understanding goal").isTrue();
    }

    private static SrsCard card(String... goals) {
        return new SrsCard("card", "Q", "A", null, null, List.of(goals));
    }
}
