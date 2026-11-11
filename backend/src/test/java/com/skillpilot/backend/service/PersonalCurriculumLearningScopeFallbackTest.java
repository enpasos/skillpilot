package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.LandscapeOverviewResponse;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.Mastery;
import com.skillpilot.backend.landscape.GoalMappingService;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.landscape.SkillLandscape;
import com.skillpilot.backend.repository.LearnerClientStateRepository;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import com.skillpilot.backend.repository.PlannedGoalRepository;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.TreeSet;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.PlatformTransactionManager;

/**
 * A curriculum whose graph is not strictly compilable keeps its seed scope and stays
 * readable. The fixture is an actual, unmodified manifest curriculum: its root cluster
 * both contains and requires its own orientation goal, which inheritance turns into a
 * requirement of that goal on itself.
 */
class PersonalCurriculumLearningScopeFallbackTest {
    private static final String LEARNER = "seed-scope-fallback-learner";
    private static final Path SOURCE = Path.of(
            "../curricula/DE/BY/TUM/Informatics/BSc_Informatics/json/DE_BAY_U_TUM_BSC_INFORMATIK.de.json");
    private final ObjectMapper mapper = new ObjectMapper();

    @Test
    void actualManifestCurriculumWithInheritedSelfRequirementStaysReadableWithItsSeedScope() throws Exception {
        byte[] sourceBefore = Files.readAllBytes(SOURCE);
        JsonNode source = mapper.readTree(sourceBefore);
        Set<String> atoms = new TreeSet<>();
        boolean clusterRequiresOwnChild = false;
        for (JsonNode goal : source.path("goals")) {
            Set<String> contains = new TreeSet<>();
            goal.path("contains").forEach(child -> contains.add(child.asText()));
            if (contains.isEmpty()) atoms.add(goal.path("id").asText());
            for (JsonNode required : goal.path("requires")) {
                clusterRequiresOwnChild |= contains.contains(required.asText());
            }
        }
        assertThat(clusterRequiresOwnChild)
                .as("the fixture must still contain a cluster that requires its own child").isTrue();
        assertThat(atoms).isNotEmpty();

        Fixture fixture = fixture(load(source, false));
        String id = fixture.landscape().getLandscapeId();

        assertThat(fixture.service().getFilteredAtomicGoalIds(id, null, null, false))
                .containsExactlyInAnyOrderElementsOf(atoms);
        assertThat(learningScope(fixture)).as("no derived learning basis is claimed").isNull();
        assertThatCode(() -> fixture.service().getFrontier(LEARNER)).doesNotThrowAnyException();
        assertThatCode(() -> fixture.service().getPlannedGoals(LEARNER)).doesNotThrowAnyException();
        assertThat(fixture.service().getMastery(LEARNER)).isEmpty();
        assertThatCode(() -> fixture.service().getLearnerState(LEARNER)).doesNotThrowAnyException();
        List<SkillLandscape> closure = fixture.service().getLearnerLandscapeClosure(LEARNER, id, "de");
        assertThat(closure).hasSize(1);
        assertThat(closure.getFirst().getPersonalCurriculumProjection()).isNull();

        verify(fixture.mastery(), never()).save(any(Mastery.class));
        verify(fixture.mastery(), never()).saveAll(any());
        assertThat(Files.readAllBytes(SOURCE)).isEqualTo(sourceBefore);
    }

    @Test
    void sameCurriculumWithoutTheSelfRequirementCompilesItsLearningScope() throws Exception {
        JsonNode source = mapper.readTree(Files.readAllBytes(SOURCE));
        Fixture fixture = fixture(load(source, true));
        String id = fixture.landscape().getLandscapeId();
        Set<String> atoms = new TreeSet<>();
        fixture.landscape().getGoals().stream()
                .filter(goal -> goal.getContains() == null || goal.getContains().isEmpty())
                .forEach(goal -> atoms.add(goal.getId()));

        assertThat(fixture.service().getFilteredAtomicGoalIds(id, null, null, false))
                .containsExactlyInAnyOrderElementsOf(atoms);
        assertThat(learningScope(fixture)).as("a strictly compilable graph keeps its closure").isNotNull();
    }

    private Object learningScope(Fixture fixture) {
        Object projection = ReflectionTestUtils.invokeMethod(fixture.service(), "getGoalProjection",
                fixture.landscape().getLandscapeId(), fixture.learner().getPersonalCurriculum());
        return ReflectionTestUtils.invokeMethod(projection, "learningScope");
    }

    private SkillLandscape load(JsonNode source, boolean withoutRequirementsOnOwnChildren) throws Exception {
        List<LearningGoal> goals = new ArrayList<>();
        for (JsonNode node : source.path("goals")) {
            LearningGoal goal = mapper.treeToValue(node, LearningGoal.class);
            if (withoutRequirementsOnOwnChildren && goal.getContains() != null && goal.getRequires() != null) {
                List<String> kept = new ArrayList<>(goal.getRequires());
                kept.removeAll(goal.getContains());
                goal.setRequires(kept);
            }
            goals.add(goal);
        }
        SkillLandscape landscape = new SkillLandscape();
        landscape.setLandscapeId(source.path("landscapeId").asText());
        landscape.setFrameworkId(source.path("frameworkId").asText());
        landscape.setGoals(goals);
        return landscape;
    }

    private Fixture fixture(SkillLandscape primary) {
        String id = primary.getLandscapeId();
        List<SkillLandscape> catalog = List.of(primary);
        LandscapeService landscapes = mock(LandscapeService.class);
        when(landscapes.getAll()).thenReturn(catalog);
        when(landscapes.getById(anyString())).thenAnswer(call -> id.equals(call.getArgument(0)) ? primary : null);
        when(landscapes.getClosure(anyString()))
                .thenAnswer(call -> id.equals(call.getArgument(0)) ? catalog : List.of());
        when(landscapes.getClosure(anyString(), anyString()))
                .thenAnswer(call -> id.equals(call.getArgument(0)) ? catalog : List.of());
        when(landscapes.getGoalDefinition(anyString())).thenAnswer(call -> primary.getGoals().stream()
                .filter(goal -> goal.getId().equals(call.getArgument(0))).findFirst().orElse(null));
        when(landscapes.getLandscapeIdForGoal(anyString())).thenAnswer(call -> primary.getGoals().stream()
                .anyMatch(goal -> goal.getId().equals(call.getArgument(0))) ? id : null);
        when(landscapes.getOverview("de", true)).thenReturn(new LandscapeOverviewResponse(List.of(), Map.of()));
        Learner learner = new Learner();
        learner.setSkillpilotId(LEARNER);
        learner.setSelectedCurriculum(id);
        LearnerRepository learners = mock(LearnerRepository.class);
        when(learners.findById(LEARNER)).thenReturn(Optional.of(learner));
        when(learners.findBySkillpilotIdForUpdate(LEARNER)).thenReturn(Optional.of(learner));
        when(learners.existsById(LEARNER)).thenReturn(true);
        MasteryRepository mastery = mock(MasteryRepository.class);
        when(mastery.findByLearner_SkillpilotId(LEARNER)).thenReturn(List.of());
        PlannedGoalRepository plans = mock(PlannedGoalRepository.class);
        when(plans.findByLearner_SkillpilotId(LEARNER)).thenReturn(List.of());
        GoalMappingService mappings = mock(GoalMappingService.class);
        when(mappings.getAllMappings()).thenReturn(List.of());
        LearnerService service = new LearnerService(learners, mock(LearnerClientStateRepository.class),
                mastery, plans, landscapes, mappings, mock(DeckResourceService.class),
                mock(CompositionViewService.class), mapper, mock(ApplicationEventPublisher.class),
                mock(PlatformTransactionManager.class));
        return new Fixture(service, learner, primary, mastery);
    }

    private record Fixture(LearnerService service, Learner learner, SkillLandscape landscape,
            MasteryRepository mastery) { }
}
