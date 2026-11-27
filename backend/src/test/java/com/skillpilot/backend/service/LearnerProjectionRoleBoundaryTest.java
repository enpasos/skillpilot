package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.LandscapeOverviewResponse;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.landscape.GoalMappingService;
import com.skillpilot.backend.landscape.LandscapeProperties;
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
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.transaction.PlatformTransactionManager;

class LearnerProjectionRoleBoundaryTest {
    private static final String LEARNER = "role-boundary-learner";
    private static final String LANDSCAPE = "role-boundary";
    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Test
    void source13OfferIsAcceptedByRepositoryReaderButLearnerScopeRefusesIt(@TempDir Path directory)
            throws Exception {
        CompositionViewService views = repositoryViews(directory, "voluntary");
        assertThat(views.findViewById("role-boundary-view")).containsEntry("viewFormatVersion", "1.3");
        assertThat(views.findLearnerScopeView(LANDSCAPE,
                Map.of("schoolForm", "Gymnasium", "stage", "CrossStage", "courseProfile", "LK")))
                .as("the real repository reader retains the offer beside regular and preparation siblings")
                .isNotNull();
        LearnerService service = service(landscape(), List.of(landscape()), views);

        assertThatThrownBy(() -> service.getFilteredAtomicGoalIds(
                LANDSCAPE, personalCurriculum(LANDSCAPE), null, false))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("projectionRole in learner scope: voluntary");
        assertThatThrownBy(() -> service.getLearnerLandscapeClosure(LEARNER, LANDSCAPE, "de"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("projectionRole in learner scope: voluntary");
    }

    @Test
    void explicitJsonNullCannotBecomeTheMissingRoleDefault(@TempDir Path directory) throws Exception {
        CompositionViewService views = repositoryViews(directory, null);
        LearnerService service = service(landscape(), List.of(landscape()), views);

        assertThatThrownBy(() -> service.getFilteredAtomicGoalIds(
                LANDSCAPE, personalCurriculum(LANDSCAPE), null, false))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("projectionRole");
    }

    @Test
    void bothReferenceKindsRefuseUnknownAndExplicitNullRolesAtTheLearnerBoundary() {
        List<Object> unsupported = new ArrayList<>(List.of(
                "voluntary", "optional", "TARGET", "", true, 1, List.of("target"), Map.of("role", "target")));
        unsupported.add(null);
        for (String kind : List.of("goalEntry", "canonicalSubtree")) {
            for (Object role : unsupported) {
                Map<String, Object> node = new LinkedHashMap<>(Map.of("kind", kind, "goalId", "target"));
                node.put("projectionRole", role);
                LearnerService service = service(landscape(), List.of(landscape()), fixedView(node));
                assertThatThrownBy(() -> service.getFilteredAtomicGoalIds(
                        LANDSCAPE, personalCurriculum(LANDSCAPE), null, false))
                        .as("%s with explicit projectionRole=%s", kind, role)
                        .isInstanceOf(IllegalStateException.class)
                        .hasMessageContaining("Unsupported composition-view projectionRole in learner scope");
            }
        }
    }

    @Test
    void missingAndExplicitLegacyRolesPreserveTheLearningScope() {
        for (String kind : List.of("goalEntry", "canonicalSubtree")) {
            for (boolean explicitTarget : List.of(false, true)) {
                Map<String, Object> target = new LinkedHashMap<>(Map.of("kind", kind, "goalId", "target"));
                if (explicitTarget) target.put("projectionRole", "target");
                CompositionViewService views = fixedView(target,
                        Map.of("kind", kind, "goalId", "preparation", "projectionRole", "prerequisiteOnly"));
                LearnerService service = service(landscape(), List.of(landscape()), views);
                assertThat(service.getFilteredAtomicGoalIds(
                        LANDSCAPE, personalCurriculum(LANDSCAPE), null, false))
                        .as("%s, explicitTarget=%s", kind, explicitTarget)
                        .containsExactlyInAnyOrder("target", "preparation");
            }
        }
    }

    private static CompositionViewService repositoryViews(Path directory, Object role) throws Exception {
        Path file = directory.resolve("DE/Gymnasium/composition-views/physics/boundary.view.json");
        Files.createDirectories(file.getParent());
        Map<String, Object> offer = new LinkedHashMap<>(Map.of("kind", "goalEntry", "goalId", "offer"));
        offer.put("projectionRole", role);
        Map<String, Object> view = new LinkedHashMap<>();
        view.put("$schema", "https://skillpilot.com/schemas/composition-view/v1.3/composition-view.schema.json");
        view.put("viewFormatVersion", "1.3");
        view.put("language", "de");
        view.put("viewId", "role-boundary-view");
        view.put("landscapeId", LANDSCAPE);
        view.put("scope", Map.of("schoolForm", "Gymnasium", "stage", "CrossStage", "courseProfile", "LK"));
        view.put("rootNodes", List.of(Map.of("kind", "structure", "id", "mixed", "label", "Mixed", "children",
                List.of(Map.of("kind", "goalEntry", "goalId", "target"),
                        Map.of("kind", "goalEntry", "goalId", "preparation", "projectionRole", "prerequisiteOnly"),
                        offer))));
        MAPPER.writeValue(file.toFile(), view);
        LandscapeProperties properties = new LandscapeProperties();
        properties.setDirectory(directory.toString());
        return new CompositionViewService(properties, MAPPER);
    }

    @SafeVarargs
    private static CompositionViewService fixedView(Map<String, Object>... nodes) {
        CompositionViewService views = mock(CompositionViewService.class);
        Map<String, Object> view = Map.of("viewId", "role-boundary-view", "landscapeId", LANDSCAPE,
                "rootNodes", List.of(nodes));
        when(views.isAuthoritativeForLandscape(LANDSCAPE)).thenReturn(true);
        when(views.findLearnerScopeView(org.mockito.ArgumentMatchers.eq(LANDSCAPE),
                org.mockito.ArgumentMatchers.anyMap())).thenReturn(view);
        return views;
    }

    static String personalCurriculum(String landscapeId) {
        return "{\"" + landscapeId + "\":{\"selected\":true,\"filterId\":\"LK\",\"stage\":\"CrossStage\"}}";
    }

    static LearnerService service(SkillLandscape primary, List<SkillLandscape> catalog, CompositionViewService views) {
        Map<String, SkillLandscape> byLandscape = new LinkedHashMap<>();
        Map<String, LearningGoal> byGoal = new LinkedHashMap<>();
        Map<String, String> owners = new LinkedHashMap<>();
        for (SkillLandscape landscape : catalog) {
            byLandscape.put(landscape.getLandscapeId(), landscape);
            for (LearningGoal goal : landscape.getGoals()) {
                byGoal.put(goal.getId(), goal);
                owners.put(goal.getId(), landscape.getLandscapeId());
            }
        }
        LandscapeService landscapes = mock(LandscapeService.class);
        when(landscapes.getAll()).thenReturn(catalog);
        when(landscapes.getById(anyString())).thenAnswer(i -> byLandscape.get(i.getArgument(0)));
        when(landscapes.getGoalDefinition(anyString())).thenAnswer(i -> byGoal.get(i.getArgument(0)));
        when(landscapes.getLandscapeIdForGoal(anyString())).thenAnswer(i -> owners.get(i.getArgument(0)));
        when(landscapes.getClosure(anyString())).thenAnswer(i -> List.of(byLandscape.get(i.getArgument(0))));
        when(landscapes.getOverview("de", true)).thenReturn(new LandscapeOverviewResponse(List.of(), Map.of()));
        Learner learner = new Learner();
        learner.setSkillpilotId(LEARNER);
        learner.setSelectedCurriculum(primary.getLandscapeId());
        learner.setPersonalCurriculum(personalCurriculum(primary.getLandscapeId()));
        LearnerRepository learners = mock(LearnerRepository.class);
        when(learners.findById(LEARNER)).thenReturn(Optional.of(learner));
        return new LearnerService(learners, mock(LearnerClientStateRepository.class), mock(MasteryRepository.class),
                mock(PlannedGoalRepository.class), landscapes, mock(GoalMappingService.class),
                mock(DeckResourceService.class), views, MAPPER, mock(ApplicationEventPublisher.class),
                mock(PlatformTransactionManager.class));
    }

    private static SkillLandscape landscape() {
        SkillLandscape landscape = new SkillLandscape();
        landscape.setLandscapeId(LANDSCAPE);
        landscape.setFrameworkId("canonical-gymnasium-role-boundary");
        landscape.setGoals(List.of(atom("target", "preparation"), atom("preparation"), atom("offer")));
        return landscape;
    }

    private static LearningGoal atom(String id, String... requires) {
        LearningGoal goal = new LearningGoal();
        goal.setId(id);
        goal.setTitle(id);
        goal.setType("atomic");
        goal.setContains(List.of());
        goal.setRequires(List.of(requires));
        goal.setTags(List.of());
        return goal;
    }
}
