package com.skillpilot.backend.service;

import static com.skillpilot.backend.service.VoluntaryOfferTestConfiguration.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.completion.PersonalCurriculumLearningScope;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.SkillLandscape;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

class VoluntaryLearnerProjectionTest {
    private static final ObjectMapper JSON = new ObjectMapper();
    private static CompositionViewService views;
    private static SkillLandscape physics;
    private static SkillLandscape math;

    @BeforeAll
    static void loadCatalog() throws Exception {
        Path canonical = Path.of("../curricula/DE/Gymnasium/canonical");
        physics = JSON.readValue(canonical.resolve("DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json").toFile(), SkillLandscape.class);
        math = JSON.readValue(canonical.resolve("DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json").toFile(), SkillLandscape.class);
        var landscapes = org.mockito.Mockito.mock(LandscapeService.class);
        when(landscapes.getAll()).thenReturn(List.of(physics, math));
        views = new VoluntaryOfferTestConfiguration().voluntaryOfferViews(JSON, landscapes);
    }

    @Test
    void foreignPrerequisiteOfOfferNeverExtendsRequiredScopeWithOrWithoutMathematics() throws Exception {
        var control = spy(views);
        // The same GK target and its preparation before the three voluntary entries are added.
        doReturn(Map.of("viewId", "test-physics-before-offers", "landscapeId", PHYSICS, "rootNodes", List.of(
                Map.of("kind", "goalEntry", "goalId", TEMPERATURE),
                Map.of("kind", "goalEntry", "goalId", INTRO, "projectionRole", "prerequisiteOnly"))))
                .when(control).findLearnerScopeView(eq(PHYSICS), anyMap());
        for (boolean selectMath : List.of(false, true)) {
            String config = selection("GK", selectMath);
            var before = project(control, config);
            var after = project(views, config);
            var required = scope(after);
            assertThat(required.seedAtomicGoalIds()).isEqualTo(scope(before).seedAtomicGoalIds());
            assertThat(required.learningAtomicGoalIds()).isEqualTo(scope(before).learningAtomicGoalIds());
            assertThat(required.requiredByPaths()).isEqualTo(scope(before).requiredByPaths());
            assertThat(required.seedAtomicGoalIds()).contains(TEMPERATURE).doesNotContain(INTRO, ARROW, ARROW_TASK, MASS);
            assertThat(required.learningAtomicGoalIds()).contains(INTRO).doesNotContain(ARROW, ARROW_TASK, MASS);
            assertThat(required.seedAtomicGoalIds().contains(NUMBER_LINE)).isEqualTo(selectMath);
            assertThat(required.learningAtomicGoalIds().contains(NUMBER_LINE)).isEqualTo(selectMath);
            assertThat(offers(after)).containsExactlyInAnyOrderEntriesOf(Map.of(
                    ARROW, Set.of(VIEW), ARROW_TASK, Set.of(VIEW), MASS, Set.of(VIEW)));
            assertThat(service(views).getFilteredAtomicGoalIds(PHYSICS, config, null, false))
                    .contains(TEMPERATURE, INTRO).doesNotContain(ARROW, ARROW_TASK, MASS);
        }
    }

    @Test
    void combinedCourseUsesTheStrongerRoleAndAttributesOnlyTheSurvivingOfferToItsSource() throws Exception {
        Object projection = project(views, selection("GK+LK", false));
        assertThat(scope(projection).seedAtomicGoalIds()).contains(ARROW, TEMPERATURE)
                .doesNotContain(MASS, ARROW_TASK);
        Set<String> support = ReflectionTestUtils.invokeMethod(projection, "prerequisiteOnlyGoalIds");
        assertThat(support).contains(MASS);
        assertThat(offers(projection)).containsExactlyInAnyOrderEntriesOf(Map.of(ARROW_TASK, Set.of(VIEW)));
    }

    private static String selection(String course, boolean includeMath) throws Exception {
        return JSON.writeValueAsString(Map.of(
                ROOT, Map.of("selected", true, "filterId", "DE-HE", "stage", "SekII"),
                PHYSICS, Map.of("selected", true, "filterId", course, "stage", "SekII"),
                MATH, Map.of("selected", includeMath, "filterId", "GK", "stage", "SekII")));
    }

    private static Object project(CompositionViewService reader, String selection) {
        return ReflectionTestUtils.invokeMethod(service(reader), "getGoalProjection", PHYSICS, selection);
    }

    private static LearnerService service(CompositionViewService reader) {
        var service = LearnerProjectionTestFixture.service(physics, List.of(physics, math), reader);
        var landscapes = (LandscapeService) ReflectionTestUtils.getField(service, "landscapeService");
        when(landscapes.getClosure(PHYSICS)).thenReturn(List.of(physics, math));
        return service;
    }

    private static PersonalCurriculumLearningScope scope(Object projection) {
        return ReflectionTestUtils.invokeMethod(projection, "learningScope");
    }

    private static Map<String, Set<String>> offers(Object projection) {
        return ReflectionTestUtils.invokeMethod(projection, "voluntarySourceViewIdsByGoal");
    }
}
