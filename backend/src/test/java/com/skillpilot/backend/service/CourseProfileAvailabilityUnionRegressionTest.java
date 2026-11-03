package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.completion.CompletionProfileCompiler;
import com.skillpilot.backend.landscape.ExamData;
import com.skillpilot.backend.landscape.GoalMappingService;
import com.skillpilot.backend.landscape.LandscapeFilter;
import com.skillpilot.backend.landscape.LandscapeProperties;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.landscape.RepositoryCurriculumConfiguration;
import com.skillpilot.backend.landscape.ReleaseMetadata;
import com.skillpilot.backend.landscape.SkillLandscape;
import com.skillpilot.backend.repository.LearnerClientStateRepository;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import com.skillpilot.backend.repository.PlannedGoalRepository;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.test.util.ReflectionTestUtils;

/** Real repository-view selection, course filtering, projection and completion compiler. */
class CourseProfileAvailabilityUnionRegressionTest {
    private static final String ROOT = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
    private static final String MATH = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
    private static final ObjectMapper MAPPER = new ObjectMapper();
    @TempDir Path directory;

    @ParameterizedTest
    @CsvSource({"GK,LK", "LK,GK"})
    void unionDoesNotBorrowAvailabilityFromTheOtherCourse(String broadCourse, String excludedCourse) throws Exception {
        var fixture = fixture(broadCourse, excludedCourse);
        assertComponentUnion(fixture, "DE-HE");

        // A later descendant is excluded by the existing source subtree role,
        // without adding a goal-specific exclusion to the other source view.
        fixture.goals().put("later-assessment", assessment("later-assessment", excludedCourse));
        fixture.landscape().getGoals().add(fixture.goals().get("later-assessment"));
        fixture.goals().get("excluded-branch").setContains(List.of("excluded-assessment", "later-assessment"));
        assertComponentUnion(fixture, "DE-HE");
        assertThat(projection(fixture, "DE-HE", "GK+LK").targets()).doesNotContain("later-assessment");
    }

    @Test
    void changedCourseMetadataDoesNotReuseAStaleStructuralMerge() throws Exception {
        var fixture = fixture("GK", "LK");
        assertComponentUnion(fixture, "DE-HE");
        fixture.goals().get("excluded-assessment").setTags(List.of("GK", "LK", "Practice", "Assessment"));
        assertThat(projection(fixture, "DE-HE", "GK").targets()).contains("excluded-assessment");
        assertThat(projection(fixture, "DE-HE", "GK+LK").targets()).contains("excluded-assessment");
        fixture.goals().get("excluded-assessment").setTags(List.of("LK", "Practice", "Assessment"));
        assertComponentUnion(fixture, "DE-HE");
    }

    @Test
    void bavarianAuthoredCourseSemanticsArePreservedAcrossScopeLookups() throws Exception {
        var fixture = fixture("GK", "LK");
        // BY technical GK owns its full compulsory scope through the view,
        // including canonical goals whose shared legacy tag happens to say LK.
        assertThat(projection(fixture, "DE-BY", "GK").targets()).contains("excluded-assessment");
        assertThat(projection(fixture, "DE-BY", "GK+LK").targets()).contains("excluded-assessment");
        assertComponentUnion(fixture, "DE-HE");
        assertThat(projection(fixture, "DE-BY", "GK+LK").targets()).contains("excluded-assessment");
    }

    @Test
    void hiddenOrdinaryAndProtectedSupportRemainAvailableWithoutBecomingSelectedObligations() throws Exception {
        var fixture = fixture("GK", "LK");
        var hidden = goal("hidden-ordinary", List.of()); hidden.setTags(List.of("LK"));
        fixture.goals().put(hidden.getId(), hidden); fixture.landscape().getGoals().add(hidden);
        fixture.goals().get("excluded-branch").setContains(List.of("excluded-assessment", "hidden-ordinary"));
        fixture.goals().get("positive-assessment").setRequires(List.of("shared", "excluded-assessment", "hidden-ordinary"));
        var union = projection(fixture, "DE-HE", "GK+LK");
        assertThat(union.targets()).contains("positive-assessment").doesNotContain("excluded-assessment", "hidden-ordinary");
        assertThat(union.structural()).containsKeys("excluded-assessment", "hidden-ordinary");
        var atoms = union.targets().stream().filter(id -> fixture.goals().get(id).getContains().isEmpty())
                .collect(Collectors.toCollection(TreeSet::new));
        var completion = new CompletionProfileCompiler().compileAutomatic(union.structural(), atoms, atoms, "hidden-support");
        assertThat(completion.contextGoalIds()).contains("excluded-assessment", "hidden-ordinary");
        assertThat(completion.protectedGoalIds()).contains("excluded-assessment");
        assertThat(completion.protectedTargetGoalIds()).containsExactly("positive-assessment");
    }

    @Test
    void anUntaggedGoalKeepsExistingAvailabilityBeforeReleaseCourseMetadata() throws Exception {
        var fixture = fixture("GK", "LK");
        var goal = fixture.goals().get("excluded-assessment"); goal.setTags(List.of());
        var release = new ReleaseMetadata(); release.setCourseLevel("LK"); goal.setRelease(release);
        assertThat(projection(fixture, "DE-HE", "GK").targets()).contains("excluded-assessment");
        assertThat(projection(fixture, "DE-HE", "GK+LK").targets()).contains("excluded-assessment");
    }

    @Test
    void mergedIdReconstructionPreservesScopeWhenOmittedSourceDimensionsAffectCourseSemantics() throws Exception {
        var fixture = fixture("GK", "LK");
        var by = fixture.views().findLearnerScopeView(MATH, scope("DE-BY", "GK+LK"));
        var reconstructed = fixture.views().findViewById((String) by.get("viewId"));
        assertThat(reconstructed).isEqualTo(by);
        var he = fixture.views().findLearnerScopeView(MATH, scope("DE-HE", "GK+LK"));
        assertThat(he.get("viewId")).isNotEqualTo(by.get("viewId"));
        assertThat(fixture.views().findViewById((String) by.get("viewId"))).isEqualTo(by);
        var lowerScope = new LinkedHashMap<>(scope("DE-BY", "GK+LK")); lowerScope.put("jurisdiction", "de-by");
        var lower = fixture.views().findLearnerScopeView(MATH, lowerScope);
        assertThat(lower.get("viewId")).isEqualTo(by.get("viewId"));
        assertThat(lower.get("rootNodes")).isEqualTo(by.get("rootNodes"));

        String prefix = ((String) by.get("viewId")).split("~scope~")[0] + "~scope~";
        assertThat(fixture.views().findViewById(prefix + "!")).isNull();
        String encodedNull = Base64.getUrlEncoder().withoutPadding().encodeToString("null".getBytes(java.nio.charset.StandardCharsets.UTF_8));
        assertThat(fixture.views().findViewById(prefix + encodedNull)).isNull();
        for (var incompatible : List.of(
                Map.of("schoolForm", "Gymnasium", "stage", "SekI", "courseProfile", "GK+LK"),
                Map.of("schoolForm", "Other", "stage", "SekII", "courseProfile", "GK+LK"),
                Map.of("schoolForm", "Gymnasium", "stage", "SekII", "courseProfile", "GK"),
                Map.of("schoolForm", "Gymnasium", "stage", "SekII", "courseProfile", "GK+LK", "unknown", "value"))) {
            String encoded = Base64.getUrlEncoder().withoutPadding().encodeToString(MAPPER.writeValueAsBytes(incompatible));
            assertThat(fixture.views().findViewById(prefix + encoded)).isNull();
            assertThat(fixture.views().findViewById("merged:course-gk~scope~" + encoded)).isNull();
        }
        String otherwiseValid = Base64.getUrlEncoder().withoutPadding().encodeToString(MAPPER.writeValueAsBytes(scope("DE-BY", "GK+LK")));
        assertThat(fixture.views().findViewById("merged:course-gk~scope~" + otherwiseValid)).isNull();
    }

    @Test
    void anUnboundStoredFocusDoesNotAliasTheNewScopeBoundView() throws Exception {
        var fixture = fixture("GK", "LK");
        var he = projection(fixture, "DE-HE", "GK+LK");
        var by = projection(fixture, "DE-BY", "GK+LK");
        String legacy = "composition:" + he.view().get("viewId") + ":structure:section";
        String current = "composition:" + by.view().get("viewId") + ":structure:section";
        List<String> heTargets = ReflectionTestUtils.invokeMethod(fixture.service(), "resolveProjectedFocusTargetIds", legacy, he.nativeProjection());
        List<String> staleTargets = ReflectionTestUtils.invokeMethod(fixture.service(), "resolveProjectedFocusTargetIds", legacy, by.nativeProjection());
        List<String> byTargets = ReflectionTestUtils.invokeMethod(fixture.service(), "resolveProjectedFocusTargetIds", current, by.nativeProjection());
        assertThat(heTargets).isNotEmpty();
        assertThat(staleTargets).isEmpty();
        assertThat(byTargets).isNotEmpty();
    }

    private void assertComponentUnion(Fixture fixture, String jurisdiction) throws Exception {
        var gk = projection(fixture, jurisdiction, "GK");
        var lk = projection(fixture, jurisdiction, "LK");
        assertThat(gk.targets()).doesNotContain("excluded-assessment");
        assertThat(lk.targets()).doesNotContain("excluded-assessment");
        var expected = new TreeSet<>(gk.targets()); expected.addAll(lk.targets());
        var union = projection(fixture, jurisdiction, "GK+LK");
        assertThat(union.targets()).as("Union of independently available component targets")
                .isEqualTo(expected).doesNotContain("excluded-assessment")
                .contains("shared", "positive-assessment");
        assertThat(union.visible().keySet()).doesNotContain("excluded-assessment");
        var atoms = union.targets().stream().filter(id -> fixture.goals().get(id).getContains().isEmpty())
                .collect(Collectors.toCollection(TreeSet::new));
        var completion = new CompletionProfileCompiler().compileAutomatic(
                union.structural(), atoms, atoms, "real-course-availability-regression");
        assertThat(completion.contextGoalIds()).doesNotContain("excluded-assessment");
        assertThat(completion.protectedTargetGoalIds()).contains("positive-assessment").doesNotContain("excluded-assessment");
        assertThat(union.view().get("scope")).isEqualTo(scope(jurisdiction, "GK+LK"));
        // The compiled CVS tree itself carries the resolved entitlement. Passing
        // the complete catalog here deliberately supplies no late course filter;
        // this would catch a completion-only or Learner-only postfilter repair.
        Object treeProjection = ReflectionTestUtils.invokeMethod(fixture.service(), "applyCompositionViewProjection",
                ROOT, fixture.goals(), fixture.goals(), personalConfig(jurisdiction, "GK+LK"), List.of(fixture.landscape()));
        Set<String> treeTargets = ReflectionTestUtils.invokeMethod(treeProjection, "targetGoalIds");
        assertThat(treeTargets).isEqualTo(union.targets());
    }

    private Fixture fixture(String broadCourse, String excludedCourse) throws Exception {
        var goals = new LinkedHashMap<String, LearningGoal>();
        goals.put("family", goal("family", List.of("shared", "excluded-branch", "positive-assessment")));
        goals.put("shared", goal("shared", List.of()));
        goals.put("excluded-branch", goal("excluded-branch", List.of("excluded-assessment")));
        goals.put("excluded-assessment", assessment("excluded-assessment", excludedCourse));
        goals.put("positive-assessment", assessment("positive-assessment", excludedCourse));
        var landscape = new SkillLandscape(); landscape.setLandscapeId(MATH);
        landscape.setFrameworkId("canonical-gymnasium-test");
        landscape.setGoals(new ArrayList<>(goals.values()));
        landscape.setFilters(filters("GK", "LK", "GK+LK"));
        var root = new SkillLandscape(); root.setLandscapeId(ROOT); root.setFrameworkId("canonical-gymnasium-overview");
        root.setGoals(List.of()); root.setFilters(filters("DE-HE", "DE-BY"));
        var landscapes = mock(LandscapeService.class);
        when(landscapes.getById(ROOT)).thenReturn(root); when(landscapes.getById(MATH)).thenReturn(landscape);
        when(landscapes.getClosure(ROOT)).thenReturn(List.of(root, landscape));
        when(landscapes.getAll()).thenReturn(List.of(root, landscape));
        when(landscapes.getGoalDefinition(anyString())).thenAnswer(call -> goals.get(call.getArgument(0)));
        var mappings = mock(GoalMappingService.class); when(mappings.getAllMappings()).thenReturn(List.of());
        var properties = new LandscapeProperties(); properties.setDirectory(directory.toString());
        var path = directory.resolve("DE/Gymnasium/composition-views/test"); Files.createDirectories(path);
        for (String course : List.of("GK", "LK")) {
            var roots = new ArrayList<Map<String, Object>>();
            roots.add(Map.of("kind", "canonicalSubtree", "goalId", "family", "displayLabel", "Content"));
            roots.add(Map.of("kind", course.equals(broadCourse) ? "goalEntry" : "canonicalSubtree",
                    "goalId", course.equals(broadCourse) ? "positive-assessment" : "excluded-branch",
                    "projectionRole", "prerequisiteOnly"));
            MAPPER.writeValue(path.resolve(course.toLowerCase() + ".view.json").toFile(), Map.of(
                    "viewId", "course-" + course.toLowerCase(), "landscapeId", MATH,
                    "scope", Map.of("schoolForm", "Gymnasium", "stage", "SekII", "courseProfile", course),
                    "rootNodes", List.of(Map.of("kind", "structure", "id", "section", "label", "Content", "children", roots))));
        }
        // Exercise the production factory, so the test follows its real metadata wiring.
        CompositionViewService views = ReflectionTestUtils.invokeMethod(new RepositoryCurriculumConfiguration(),
                "repositoryCompositionViewService", properties, MAPPER, landscapes);
        var service = new LearnerService(mock(LearnerRepository.class), mock(LearnerClientStateRepository.class),
                mock(MasteryRepository.class), mock(PlannedGoalRepository.class), landscapes, mappings,
                mock(DeckResourceService.class), MAPPER, mock(ApplicationEventPublisher.class));
        ReflectionTestUtils.setField(service, "compositionViewService", views);
        return new Fixture(service, views, landscape, goals);
    }

    private Projection projection(Fixture fixture, String jurisdiction, String course) throws Exception {
        String config = MAPPER.writeValueAsString(personalConfig(jurisdiction, course));
        // Unlike the structural-only tests, this executes computeGoalProjection
        // and the actual course-applicability filters before composition.
        Object p = ReflectionTestUtils.invokeMethod(fixture.service(), "getGoalProjection", ROOT, config, false);
        return new Projection(ReflectionTestUtils.invokeMethod(p, "targetGoalIds"),
                ReflectionTestUtils.invokeMethod(p, "visibleGoals"), ReflectionTestUtils.invokeMethod(p, "structuralGoals"),
                fixture.views().findLearnerScopeView(MATH, scope(jurisdiction, course)), p);
    }

    private static Map<String, Map<String, Object>> personalConfig(String jurisdiction, String course) {
        return Map.of(ROOT, Map.of("selected", true, "filterId", jurisdiction, "stage", "SekII", "durationModel", "G8"),
                MATH, Map.of("selected", true, "filterId", course));
    }

    private static LearningGoal goal(String id, List<String> children) {
        var goal = new LearningGoal(); goal.setId(id); goal.setTitle(id); goal.setContains(children); goal.setRequires(List.of());
        goal.setTags(List.of("GK", "LK")); goal.setApplicability(Map.of("jurisdiction", List.of("DE-HE", "DE-BY")));
        return goal;
    }

    private static LearningGoal assessment(String id, String course) {
        var goal = goal(id, List.of()); goal.setTags(List.of(course, "Practice", "Assessment"));
        goal.setNodeKind("exam"); goal.setRequires(List.of("shared"));
        var exam = new ExamData(); exam.setReviewStatus("released"); exam.setTaskContent("Begründe die Aussage mit einem Beispiel.");
        exam.setSolutionContent("Ein passendes Beispiel wird genannt und nachvollziehbar begründet."); exam.setCoveredGoalIds(List.of("shared"));
        goal.setExamData(exam); return goal;
    }

    private static List<LandscapeFilter> filters(String... ids) {
        return java.util.Arrays.stream(ids).map(id -> {var f = new LandscapeFilter(); f.setId(id); return f;}).toList();
    }

    private static Map<String, String> scope(String jurisdiction, String course) {
        return Map.of("schoolForm", "Gymnasium", "jurisdiction", jurisdiction, "stage", "SekII", "durationModel", "G8", "courseProfile", course);
    }

    private record Fixture(LearnerService service, CompositionViewService views, SkillLandscape landscape, Map<String, LearningGoal> goals) { }
    private record Projection(Set<String> targets, Map<String, LearningGoal> visible, Map<String, LearningGoal> structural, Map<String, Object> view, Object nativeProjection) { }
}
