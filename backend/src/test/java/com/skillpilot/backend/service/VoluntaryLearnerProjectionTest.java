package com.skillpilot.backend.service;

import static com.skillpilot.backend.service.VoluntaryOfferTestConfiguration.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.anyString;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.completion.PersonalCurriculumLearningScope;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.LandscapeProperties;
import com.skillpilot.backend.landscape.SkillLandscape;
import java.nio.file.Path;
import java.nio.file.Files;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
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
            assertThat(offers(after)).containsExactlyInAnyOrder(ARROW, ARROW_TASK, MASS);
            assertThat(service(views).getFilteredAtomicGoalIds(PHYSICS, config, null, false))
                    .contains(TEMPERATURE, INTRO).doesNotContain(ARROW, ARROW_TASK, MASS);
        }
    }

    @Test
    void combinedCourseUsesTheStrongerRoleAndRetainsOnlyTheSurvivingOffer() throws Exception {
        Object projection = project(views, selection("GK+LK", false));
        assertThat(scope(projection).seedAtomicGoalIds()).contains(ARROW, TEMPERATURE)
                .doesNotContain(MASS, ARROW_TASK);
        Set<String> support = ReflectionTestUtils.invokeMethod(projection, "prerequisiteOnlyGoalIds");
        assertThat(support).contains(MASS);
        assertThat(offers(projection)).containsExactly(ARROW_TASK);
    }

    @Test
    void mergedOffersDoNotLookUpMissingOrCaseCollidingOriginalsDuringLearnerRequests() throws Exception {
        for (var originalIds : List.of(List.of("missing-original"), List.of("Course", "course"))) {
            var reader = spy(views);
            // The merged document is the selected input. Its historical source IDs
            // have no role in computing the learner's surviving offer set.
            doReturn(Map.of("viewId", "merged-test-view", "landscapeId", PHYSICS,
                    "mergedFromViewIds", originalIds, "rootNodes", List.of(
                            Map.of("kind", "goalEntry", "goalId", TEMPERATURE),
                            Map.of("kind", "goalEntry", "goalId", ARROW_TASK, "projectionRole", "voluntary"))))
                    .when(reader).findLearnerScopeView(eq(PHYSICS), anyMap());
            var projection = project(reader, selection("GK+LK", false));
            assertThat(offers(projection)).containsExactly(ARROW_TASK);
            Map<String, ?> visible = ReflectionTestUtils.invokeMethod(projection, "visibleGoals");
            assertThat(visible).containsKeys(TEMPERATURE, ARROW_TASK);
            verify(reader, never()).findViewById(anyString());
        }
    }

    @Test
    void repositoryMergeWithCaseCollidingViewIdsNeedsNoOriginalLookupDuringProjection(@TempDir Path directory)
            throws Exception {
        Path folder = directory.resolve("DE/Gymnasium/composition-views/physik");
        Files.createDirectories(folder);
        for (String course : List.of("GK", "LK")) {
            boolean offer = course.equals("LK");
            JSON.writeValue(folder.resolve(course + ".view.json").toFile(), Map.of(
                    "$schema", "https://skillpilot.com/schemas/composition-view/v1.3/composition-view.schema.json",
                    "viewFormatVersion", "1.3", "language", "de", "viewId", offer ? "course" : "Course",
                    "landscapeId", PHYSICS,
                    "scope", Map.of("schoolForm", "Gymnasium", "jurisdiction", "DE-HE", "stage", "SekII", "courseProfile", course),
                    "rootNodes", List.of(Map.of("kind", "goalEntry", "goalId", offer ? ARROW_TASK : TEMPERATURE,
                            "projectionRole", offer ? "voluntary" : "target"))));
        }
        var properties = new LandscapeProperties();
        properties.setDirectory(directory.toString());
        Map<String, List<String>> children = new java.util.LinkedHashMap<>();
        for (var landscape : List.of(physics, math)) {
            landscape.getGoals().forEach(goal -> children.put(goal.getId(),
                    goal.getContains() == null ? List.of() : goal.getContains()));
        }
        var graph = CanonicalContainsGraph.copyOf(children);
        var reader = spy(new CompositionViewService(properties, JSON, () -> graph));
        var merged = reader.findLearnerScopeView(PHYSICS,
                Map.of("schoolForm", "Gymnasium", "jurisdiction", "DE-HE", "stage", "SekII", "courseProfile", "GK+LK"));
        assertThat((List<?>) merged.get("mergedFromViewIds")).map(Object::toString)
                .containsExactlyInAnyOrder("Course", "course");
        assertThat(offers(project(reader, selection("GK+LK", false)))).containsExactly(ARROW_TASK);
        verify(reader, never()).findViewById(anyString());
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

    private static Set<String> offers(Object projection) {
        return ReflectionTestUtils.invokeMethod(projection, "voluntaryGoalIds");
    }
}
