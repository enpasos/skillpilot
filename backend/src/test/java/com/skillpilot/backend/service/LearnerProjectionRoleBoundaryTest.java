package com.skillpilot.backend.service;

import static com.skillpilot.backend.service.LearnerProjectionTestFixture.LEARNER;
import static com.skillpilot.backend.service.LearnerProjectionTestFixture.personalCurriculum;
import static com.skillpilot.backend.service.LearnerProjectionTestFixture.service;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.landscape.LandscapeProperties;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.SkillLandscape;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.test.util.ReflectionTestUtils;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class LearnerProjectionRoleBoundaryTest {
    private static final String LANDSCAPE = "role-boundary";
    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Test
    void source13OfferIsVisibleButExcludedFromSubjectTotalsAndRequiredClosure(@TempDir Path directory)
            throws Exception {
        CompositionViewService views = repositoryViews(directory, "voluntary");
        assertThat(views.findViewById("role-boundary-view")).containsEntry("viewFormatVersion", "1.3");
        assertThat(views.findLearnerScopeView(LANDSCAPE,
                Map.of("schoolForm", "Gymnasium", "stage", "CrossStage", "courseProfile", "LK")))
                .as("the real repository reader retains the offer beside regular and preparation siblings")
                .isNotNull();
        LearnerService service = service(landscape(), List.of(landscape()), views);

        assertThat(service.getFilteredAtomicGoalIds(LANDSCAPE, personalCurriculum(LANDSCAPE), null, false))
                .containsExactlyInAnyOrder("target", "preparation");
        var exported = service.getLearnerLandscapeClosure(LEARNER, LANDSCAPE, "de");
        assertThat(exported).singleElement().satisfies(subject -> {
            assertThat(subject.getGoals()).extracting(LearningGoal::getId)
                    .containsExactlyInAnyOrder("target", "preparation", "offer");
            assertThat(subject.getPersonalCurriculumProjection().targetGoalIds())
                    .containsExactlyInAnyOrder("target", "preparation");
            assertThat(subject.getPersonalCurriculumProjection().seedAtomicGoalIds()).containsExactly("target");
        });
    }

    @Test
    void independentlyRequiredAtomSupersedesAnOfferInTheOtherSelectedView() throws Exception {
        SkillLandscape first = landscape();
        SkillLandscape second = new SkillLandscape();
        second.setLandscapeId("second");
        second.setFrameworkId("canonical-gymnasium-second");
        second.setGoals(List.of(atom("other-target", "offer")));
        var views = fixedView(Map.of("kind", "goalEntry", "goalId", "offer", "projectionRole", "voluntary"));
        var scope = Map.of("schoolForm", "Gymnasium", "stage", "CrossStage", "courseProfile", "LK");
        when(views.findLearnerScopeView("second", scope)).thenReturn(Map.of("viewId", "other-view",
                "landscapeId", "second", "rootNodes", List.of(Map.of("kind", "goalEntry", "goalId", "other-target"))));
        var learners = service(first, List.of(first, second), views);
        var catalog = (LandscapeService) ReflectionTestUtils.getField(learners, "landscapeService");
        when(catalog.getClosure(LANDSCAPE)).thenReturn(List.of(first, second));
        Map<String, Object> selected = Map.of("selected", true, "filterId", "LK", "stage", "CrossStage");
        for (boolean selectSecond : List.of(false, true)) {
            String config = MAPPER.writeValueAsString(Map.of(LANDSCAPE, selected, "second",
                    selectSecond ? selected : Map.of("selected", false)));
            Object projection = ReflectionTestUtils.invokeMethod(learners, "getGoalProjection", LANDSCAPE, config);
            Set<String> offers = ReflectionTestUtils.invokeMethod(projection, "voluntaryGoalIds");
            assertThat(offers.contains("offer")).isEqualTo(!selectSecond);
            assertThat(learners.getFilteredAtomicGoalIds(LANDSCAPE, config, null, false).contains("offer"))
                    .isEqualTo(selectSecond);
        }
    }

    @Test
    void aVoluntarySubtreeCannotMakeItsDescendantsOffers() {
        var service = service(landscape(), List.of(landscape()), fixedView(
                Map.of("kind", "canonicalSubtree", "goalId", "target", "projectionRole", "voluntary")));
        assertThatThrownBy(() -> service.getFilteredAtomicGoalIds(
                LANDSCAPE, personalCurriculum(LANDSCAPE), null, false))
                .isInstanceOf(IllegalStateException.class).hasMessageContaining("requires an atomic goalEntry");
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
                "optional", "TARGET", "", true, 1, List.of("target"), Map.of("role", "target")));
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
