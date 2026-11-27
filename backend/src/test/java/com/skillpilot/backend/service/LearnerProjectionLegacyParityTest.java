package com.skillpilot.backend.service;

import static com.skillpilot.backend.service.LearnerProjectionTestFixture.LEARNER;
import static com.skillpilot.backend.service.LearnerProjectionTestFixture.personalCurriculum;
import static com.skillpilot.backend.service.LearnerProjectionTestFixture.service;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.LandscapeProperties;
import com.skillpilot.backend.landscape.LandscapeFilter;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.landscape.SkillLandscape;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

class LearnerProjectionLegacyParityTest {
    private static final String LANDSCAPE = "projection-legacy-parity";
    private static final ObjectMapper JSON = new ObjectMapper();

    @Test
    void emptyLegacyFilterStillReleasesSelectedRepositoryOffersOnColdStart(@TempDir Path directory) throws Exception {
        Path folder = directory.resolve("DE/Gymnasium/composition-views/physics");
        Files.createDirectories(folder);
        JSON.writeValue(folder.resolve("offers.view.json").toFile(), Map.of(
                "$schema", "https://skillpilot.com/schemas/composition-view/v1.3/composition-view.schema.json",
                "viewFormatVersion", "1.3", "language", "de", "viewId", "repository-offer-cold-start",
                "landscapeId", LANDSCAPE,
                "scope", Map.of("schoolForm", "Gymnasium", "stage", "CrossStage", "courseProfile", "LK"),
                "rootNodes", List.of(Map.of("kind", "goalEntry", "goalId", "offer", "projectionRole", "voluntary"))));
        var properties = new LandscapeProperties();
        properties.setDirectory(directory.toString());
        var views = new CompositionViewService(properties, JSON);
        var offeredGoal = atom("offer", "Offer outside ordinary filter", "GK");
        var primary = landscape(LANDSCAPE, offeredGoal);
        var learners = service(primary, List.of(primary), views);
        // This is deliberately the reader's first access: direct construction
        // has no managed-service lifecycle hook to prewarm its repository index.
        Object projection = ReflectionTestUtils.invokeMethod(learners, "getGoalProjection", LANDSCAPE, personalCurriculum(LANDSCAPE));
        assertThat(ReflectionTestUtils.<Boolean>invokeMethod(projection, "compositionViewApplied")).isTrue();
        assertThat(ReflectionTestUtils.<Set<String>>invokeMethod(projection, "voluntaryGoalIds")).containsExactly("offer");
        assertThat(ReflectionTestUtils.<Set<String>>invokeMethod(projection, "targetGoalIds")).isEmpty();
        assertThat(visible(projection).get("offer")).isSameAs(offeredGoal);
        assertThat(learners.getFilteredAtomicGoalIds(LANDSCAPE, personalCurriculum(LANDSCAPE), null, false)).isEmpty();
    }

    @Test
    void emptyLegacyFilterInAnOfferFreeRuntimeNeverSelectsAView() {
        var primary = landscape(LANDSCAPE, atom("filtered", "Filtered goal", "GK"));
        var views = mock(CompositionViewService.class);
        when(views.hasVoluntaryOffers()).thenReturn(false);
        when(views.findLearnerScopeView(anyString(), anyMap())).thenThrow(new IllegalStateException("must not select a view"));
        when(views.findDefaultView(anyString())).thenThrow(new IllegalStateException("must not select a default view"));
        var learners = service(primary, List.of(primary), views);
        Object projection = ReflectionTestUtils.invokeMethod(learners, "getGoalProjection", LANDSCAPE, personalCurriculum(LANDSCAPE));
        assertThat(ReflectionTestUtils.<Boolean>invokeMethod(projection, "compositionViewApplied")).isFalse();
        assertThat(visible(projection)).isEmpty();
        verify(views, never()).findLearnerScopeView(anyString(), anyMap());
        verify(views, never()).findDefaultView(anyString());
        verify(views, never()).isAuthoritativeForLandscape(anyString());
    }

    @Test
    void emptyFilteredRepositoryScopeIgnoresOffersInAnUnselectedView(@TempDir Path directory) throws Exception {
        Path folder = directory.resolve("DE/Gymnasium/composition-views/physics");
        Files.createDirectories(folder);
        for (String course : List.of("LK", "GK")) {
            String role = course.equals("GK") ? "voluntary" : "target";
            JSON.writeValue(folder.resolve(course + ".view.json").toFile(), Map.of(
                    "$schema", "https://skillpilot.com/schemas/composition-view/v1.3/composition-view.schema.json",
                    "viewFormatVersion", "1.3", "language", "de", "viewId", "repository-" + course,
                    "landscapeId", LANDSCAPE,
                    "scope", Map.of("schoolForm", "Gymnasium", "stage", "CrossStage", "courseProfile", course),
                    "rootNodes", List.of(Map.of("kind", "goalEntry", "goalId", "filtered", "projectionRole", role))));
        }
        var properties = new LandscapeProperties();
        properties.setDirectory(directory.toString());
        var views = new CompositionViewService(properties, JSON);
        assertThat(views.hasVoluntaryOffers()).isTrue();
        var primary = landscape(LANDSCAPE, atom("filtered", "Filtered goal", "GK"));
        var learners = service(primary, List.of(primary), views);
        Object projection = ReflectionTestUtils.invokeMethod(learners, "getGoalProjection", LANDSCAPE, personalCurriculum(LANDSCAPE));
        assertThat(ReflectionTestUtils.<Boolean>invokeMethod(projection, "compositionViewApplied")).isFalse();
        assertThat(visible(projection)).isEmpty();
    }

    @Test
    void emptyLegacyFiltersReturnIdentityBeforeResolvingRepositoryOrPackageReferences() {
        for (boolean authoritative : List.of(false, true)) {
            for (boolean offersElsewhere : List.of(false, true)) {
                for (String role : List.of("target", "prerequisiteOnly")) {
                    var goal = atom("filtered", "Filtered goal", "GK");
                    var primary = landscape(LANDSCAPE, goal);
                    var views = fixedViews(primary, List.of(Map.of("kind", "goalEntry", "goalId", "missing",
                            "projectionRole", role)));
                    when(views.isAuthoritativeForLandscape(LANDSCAPE)).thenReturn(authoritative);
                    when(views.hasVoluntaryOffers()).thenReturn(offersElsewhere);
                    var learners = service(primary, List.of(primary), views);
                    Object projection = ReflectionTestUtils.invokeMethod(learners, "getGoalProjection",
                            LANDSCAPE, personalCurriculum(LANDSCAPE));
                    assertThat(ReflectionTestUtils.<Boolean>invokeMethod(projection, "compositionViewApplied"))
                            .as("authority=%s, offers elsewhere=%s, reference role=%s", authoritative, offersElsewhere, role)
                            .isFalse();
                    assertThat(visible(projection)).isEmpty();
                    Map<String, LearningGoal> structural = ReflectionTestUtils.invokeMethod(projection, "structuralGoals");
                    assertThat(structural).containsOnlyKeys("filtered");
                    assertThat(structural.get("filtered")).isSameAs(goal);
                    assertThatThrownBy(() -> learners.getPlanningScope(LEARNER, LANDSCAPE))
                            .isInstanceOfSatisfying(ResponseStatusException.class,
                                    failure -> assertThat(failure.getStatusCode()).isEqualTo(HttpStatus.CONFLICT));
                }
            }
        }
    }

    @Test
    void emptyAtomicScopeKeepsTheNullTolerantLegacySet() {
        var primary = landscape(LANDSCAPE, atom("filtered", "Filtered goal", "GK"));
        var learners = service(primary, List.of(primary), fixedViews(primary, List.of()));
        Set<String> ids = learners.getFilteredAtomicGoalIds(LANDSCAPE, personalCurriculum(LANDSCAPE), null, false);
        assertThat(ids).isEmpty();
        assertThat(ids.contains(null)).isFalse();
    }

    @Test
    void filteredDuplicateCannotReplaceThePassingGoalInstance() throws Exception {
        var passing = atom("x", "Passing X", "LK");
        var filtered = atom("x", "Filtered duplicate X", "GK");
        var first = landscape(LANDSCAPE, passing, atom("y", "Y", "LK"));
        var second = landscape("second", filtered);
        var projection = projectBoth(first, second);
        assertThat(visible(projection).keySet()).containsExactly("x", "y");
        assertThat(visible(projection).get("x")).isSameAs(passing);
        assertThat(visible(projection).get("x").getTitle()).isEqualTo("Passing X");
    }

    @Test
    void filteredDuplicateCannotReserveAnEarlierVisiblePosition() throws Exception {
        var passing = atom("x", "Passing X from second landscape", "LK");
        var first = landscape(LANDSCAPE, atom("x", "Filtered early X", "GK"), atom("y", "Y", "LK"));
        var second = landscape("second", passing);
        var projection = projectBoth(first, second);
        assertThat(visible(projection).keySet()).containsExactly("y", "x");
        assertThat(visible(projection).get("x")).isSameAs(passing);
    }

    private static Object projectBoth(SkillLandscape first, SkillLandscape second) throws Exception {
        var views = fixedViews(first, List.of(Map.of("kind", "goalEntry", "goalId", "x"),
                Map.of("kind", "goalEntry", "goalId", "y")));
        var learners = service(first, List.of(first, second), views);
        var landscapes = (LandscapeService) ReflectionTestUtils.getField(learners, "landscapeService");
        when(landscapes.getClosure(LANDSCAPE)).thenReturn(List.of(first, second));
        var selected = Map.of("selected", true, "filterId", "LK", "stage", "CrossStage");
        String config = JSON.writeValueAsString(Map.of(LANDSCAPE, selected, "second", selected));
        return ReflectionTestUtils.invokeMethod(learners, "getGoalProjection", LANDSCAPE, config);
    }

    private static CompositionViewService fixedViews(SkillLandscape primary, List<Map<String, Object>> nodes) {
        var views = mock(CompositionViewService.class);
        when(views.findLearnerScopeView(eq(primary.getLandscapeId()), anyMap())).thenReturn(
                Map.of("viewId", "legacy-parity", "landscapeId", primary.getLandscapeId(), "rootNodes", nodes));
        return views;
    }

    private static SkillLandscape landscape(String id, LearningGoal... goals) {
        var landscape = new SkillLandscape();
        landscape.setLandscapeId(id);
        landscape.setFrameworkId("canonical-gymnasium-legacy-parity");
        landscape.setFilters(List.of(filter("GK"), filter("LK")));
        landscape.setGoals(List.of(goals));
        return landscape;
    }

    private static LandscapeFilter filter(String id) {
        var filter = new LandscapeFilter();
        filter.setId(id);
        filter.setLabel(id);
        return filter;
    }

    private static LearningGoal atom(String id, String title, String course) {
        var goal = new LearningGoal();
        goal.setId(id);
        goal.setTitle(title);
        goal.setType("atomic");
        goal.setContains(List.of());
        goal.setRequires(List.of());
        goal.setTags(List.of(course));
        return goal;
    }

    private static Map<String, LearningGoal> visible(Object projection) {
        return ReflectionTestUtils.invokeMethod(projection, "visibleGoals");
    }
}
