package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.LandscapeOverviewResponse;
import com.skillpilot.backend.completion.CompletionCompilationException;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.Mastery;
import com.skillpilot.backend.domain.PlannedGoal;
import com.skillpilot.backend.landscape.GoalMappingService;
import com.skillpilot.backend.landscape.LandscapeFilter;
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
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.web.server.ResponseStatusException;

class PersonalCurriculumLearningScopeIntegrationTest {
    private static final String LEARNER = "personal-learning-scope-learner";
    private static final String ROOT = "personal-learning-scope";
    private static final String T = "target";
    private static final String P = "preparation";
    private static final String F = "foundation";
    private static final String Q = "unneeded";
    private static final String O = "orientation";
    private static final Path CHEMISTRY = Path.of(
            "../curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json");
    private final ObjectMapper mapper = new ObjectMapper();

    @Test
    void actualChemistrySupportBecomesALearnablePlanningTargetWithoutEnrollingUnneededSupport() throws Exception {
        String target = "1c1420c2-a8e2-520f-8015-6df637a973bd";
        String preparation = "e7c363d4-e02d-4895-8750-ba62c2eb63fe";
        String orientation = "a9c22adc-b543-5b0c-a2d8-3189facdff08";
        byte[] sourceBefore = Files.readAllBytes(CHEMISTRY);
        List<LearningGoal> goals = new ArrayList<>();
        for (JsonNode node : mapper.readTree(sourceBefore).path("goals")) {
            if (Set.of(target, preparation, orientation).contains(node.path("id").asText()))
                goals.add(mapper.treeToValue(node, LearningGoal.class));
        }
        assertThat(goals).hasSize(3);
        goals.add(atom(Q));
        var fixture = fixture(landscape("c436b994-8f44-5134-b9f8-0c9f5d6a5ba0", goals), "LK",
                entry(target), support(preparation), support(orientation), support(Q));

        assertThat(targets(fixture)).containsExactlyInAnyOrder(target, preparation, orientation);
        var metadata = projection(fixture);
        assertThat(metadata.seedAtomicGoalIds()).containsExactly(target);
        assertThat(metadata.requiredByPaths()).containsEntry(preparation, List.of(target, preparation))
                .containsEntry(orientation, List.of(target, orientation));
        assertThat(fixture.service().getFrontier(LEARNER)).containsExactly(orientation);
        assertThat(fixture.service().getRichFrontier(LEARNER)).extracting(FrontierGoal::id)
                .containsExactly(orientation);
        fixture.mastered(orientation);
        assertThat(fixture.service().getFrontier(LEARNER)).containsExactly(preparation);
        assertThat(fixture.service().getRichFrontier(LEARNER)).extracting(FrontierGoal::id)
                .containsExactly(preparation);
        assertThat(fixture.service().setPlannedGoals(LEARNER, Set.of(preparation)))
                .containsExactly(preparation);
        assertNoMasteryWrites(fixture);
        assertThat(Files.readAllBytes(CHEMISTRY)).isEqualTo(sourceBefore);
    }

    @Test
    void masteredPreparationStaysInTheSameProgressDenominatorWithoutRepetitionOrWrites() {
        var fixture = fixture(landscape(ROOT, List.of(atom(T, P, O), atom(P), orientation(O))), "LK",
                entry(T), support(P), support(O));
        var before = projection(fixture);
        assertThat(before.targetGoalIds()).containsExactlyInAnyOrder(T, P, O);
        var planningBefore = fixture.service().getPlanningScope(LEARNER, ROOT);
        assertThat(planningBefore.totalAtomicGoalCount()).isEqualTo(3);
        assertThat(planningBefore.masteredAtomicGoalCount()).isZero();

        fixture.mastered(P, O);

        assertThat(projection(fixture)).isEqualTo(before);
        assertThat(targets(fixture)).hasSize(3).contains(P);
        var planningAfter = fixture.service().getPlanningScope(LEARNER, ROOT);
        assertThat(planningAfter.totalAtomicGoalCount()).isEqualTo(3);
        assertThat(planningAfter.masteredAtomicGoalCount()).isEqualTo(2);
        assertThat(planningAfter.openAtomicGoalIds()).containsExactly(T);
        Object goalProjection = ReflectionTestUtils.invokeMethod(fixture.service(), "getGoalProjection",
                ROOT, fixture.learner().getPersonalCurriculum());
        Set<String> completionInputs = ReflectionTestUtils.invokeMethod(fixture.service(),
                "automaticCompletionTargets", "automatic:personal-curriculum", goalProjection);
        // This checks the real completion target input, not the complete workflow.
        assertThat(completionInputs).containsExactlyInAnyOrder(T, P, O);
        assertThat(fixture.service().getFrontier(LEARNER)).containsExactly(T);
        assertThat(fixture.service().getMastery(LEARNER)).containsOnlyKeys(P, O)
                .containsEntry(P, 1.0).containsEntry(O, 1.0);
        assertNoMasteryWrites(fixture);
    }

    @Test
    void canonicalDerivedTargetsDoNotNeedManualViewRoleReferences() {
        var fixture = fixture(landscape(ROOT, List.of(atom(T, P), atom(P, F), atom(F), atom(Q))), "LK",
                entry(T));
        JsonNode canonicalBefore = mapper.valueToTree(fixture.primary());

        assertThat(targets(fixture)).containsExactlyInAnyOrder(T, P, F);
        assertThat(projection(fixture).requiredByPaths()).containsEntry(P, List.of(T, P))
                .containsEntry(F, List.of(T, P, F)).doesNotContainKey(Q);
        assertThat((JsonNode) mapper.valueToTree(fixture.primary())).isEqualTo(canonicalBefore);
        assertNoMasteryWrites(fixture);
    }

    @Test
    void directClusterEntriesPreserveCanonicalChildrenAndRejectUnknownChildrenAndCycles() {
        var valid = fixture(landscape(ROOT, List.of(cluster("seed-cluster", T, P), atom(T, P), atom(P))),
                "LK", entry("seed-cluster"));
        assertThat(targets(valid)).containsExactlyInAnyOrder(T, P);
        assertThat(projection(valid).seedAtomicGoalIds()).containsExactlyInAnyOrder(T, P);
        assertThat(targets(valid)).doesNotContain("seed-cluster");

        var invalid = fixture(landscape(ROOT, List.of(cluster("seed-cluster", T, "missing-child"), atom(T))),
                "LK", entry("seed-cluster"));
        assertThatThrownBy(() -> targets(invalid)).isInstanceOfSatisfying(
                CompletionCompilationException.class,
                failure -> assertThat(failure.code()).isEqualTo("MISSING_REFERENCE"));
        var cyclic = fixture(landscape(ROOT, List.of(cluster("seed-cluster", "seed-cluster"))),
                "LK", entry("seed-cluster"));
        assertThatThrownBy(() -> targets(cyclic)).isInstanceOfSatisfying(
                CompletionCompilationException.class,
                failure -> assertThat(failure.code()).isEqualTo("CONTAINS_CYCLE"));
    }

    @Test
    void validCourseSeedsRetainTheirFilteredFoundationButNotUnrelatedOtherCourseTargets() {
        LearningGoal seed = atom(T, P);
        seed.setTags(List.of("GK"));
        LearningGoal foundation = atom(P);
        foundation.setTags(List.of("LK"));
        LearningGoal unrelated = atom(Q);
        unrelated.setTags(List.of("LK"));
        var fixture = fixture(landscape(ROOT, List.of(seed, foundation, unrelated)), "GK", entry(T), entry(Q));
        JsonNode before = mapper.valueToTree(fixture.primary());

        assertThat(targets(fixture)).containsExactlyInAnyOrder(T, P);
        assertThat(projection(fixture).seedAtomicGoalIds()).containsExactly(T);
        assertThat(projection(fixture).requiredByPaths()).containsEntry(P, List.of(T, P));
        assertThat((JsonNode) mapper.valueToTree(fixture.primary())).isEqualTo(before);
        assertThat(foundation.getTags()).containsExactly("LK");
    }

    @Test
    void closedGlobalScopeDoesNotWidenTheChosenNormalFocusOrForceStrictMode() {
        var fixture = fixture(landscape(ROOT, List.of(atom(T, P), atom(P))), "LK", entry(T));
        fixture.planned().add(new PlannedGoal(fixture.learner(), T));

        assertThat(targets(fixture)).containsExactlyInAnyOrder(T, P);
        assertThat(fixture.service().getFrontier(LEARNER)).containsExactly(T);
        assertThat(fixture.service().getRichFrontier(LEARNER)).extracting(FrontierGoal::id).containsExactly(T);
        fixture.learner().setStrictMode(true);
        assertThat(fixture.service().getFrontier(LEARNER)).isEmpty();
        assertThat(fixture.service().getRichFrontier(LEARNER)).isEmpty();
        fixture.mastered(P);
        assertThat(fixture.service().getFrontier(LEARNER)).containsExactly(T);
        assertThat(fixture.service().getPlannedGoals(LEARNER)).containsExactly(T);
        assertThat(targets(fixture)).containsExactlyInAnyOrder(T, P);
        assertNoMasteryWrites(fixture);

        var clusterFocus = fixture(landscape(ROOT, List.of(cluster("topic", T, P), atom(T, P), atom(P))),
                "LK", subtree("topic"), support(P));
        clusterFocus.planned().add(new PlannedGoal(clusterFocus.learner(), "topic"));
        assertThat(projection(clusterFocus).seedAtomicGoalIds()).containsExactly(T);
        assertThat(clusterFocus.service().getFrontier(LEARNER)).contains(P).doesNotContain(T);
        List<FrontierGoal> richClusterFocus = clusterFocus.service().getRichFrontier(LEARNER);
        assertThat(richClusterFocus).extracting(FrontierGoal::id).containsExactlyInAnyOrder("topic", P);
        assertThat(richClusterFocus).filteredOn(goal -> "topic".equals(goal.id()))
                .extracting(FrontierGoal::type).containsExactly("cluster");
        assertThat(richClusterFocus).filteredOn(goal -> "atomic".equals(goal.type()))
                .extracting(FrontierGoal::id).containsExactly(P);
        assertThat(richClusterFocus).extracting(FrontierGoal::id).doesNotContain(T);
        assertThat(targets(clusterFocus)).containsExactlyInAnyOrder(T, P);
        assertThat(clusterFocus.service().getPlannedGoals(LEARNER)).containsExactly("topic");
        assertNoMasteryWrites(clusterFocus);
    }

    @Test
    void learnerExportIncludesOnlyTheRequiredForeignAtomWithReadOnlyProvenanceMetadata() throws Exception {
        var fixture = fixture(landscape(ROOT, List.of(atom(T, "foreign-subject:" + P))), "LK", entry(T));
        SkillLandscape foreign = landscape("foreign-subject", List.of(atom(P), atom(Q, "unknown-unrelated")));
        fixture.catalog().add(foreign);
        JsonNode primaryBefore = mapper.valueToTree(fixture.primary());
        JsonNode foreignBefore = mapper.valueToTree(foreign);

        List<SkillLandscape> response = fixture.service().getLearnerLandscapeClosure(LEARNER, ROOT, "de");

        assertThat(response).extracting(SkillLandscape::getLandscapeId).containsExactly(ROOT, "foreign-subject");
        SkillLandscape exported = response.stream().filter(l -> l.getLandscapeId().equals("foreign-subject"))
                .findFirst().orElseThrow();
        assertThat(exported.getGoals()).extracting(LearningGoal::getId).containsExactly(P);
        assertThat(exported.getPersonalCurriculumProjection().targetGoalIds()).containsExactly(P);
        assertThat(exported.getPersonalCurriculumProjection().seedAtomicGoalIds()).isEmpty();
        assertThat(exported.getPersonalCurriculumProjection().requiredByPaths())
                .containsEntry(P, List.of(T, P));
        assertThat(exported.getPersonalCurriculumProjection().rootLandscapeId()).isEqualTo(ROOT);
        SkillLandscape roundTrip = mapper.readValue(mapper.writeValueAsBytes(exported), SkillLandscape.class);
        assertThat(roundTrip.getPersonalCurriculumProjection()).isNull();
        assertThat((JsonNode) mapper.valueToTree(fixture.primary())).isEqualTo(primaryBefore);
        assertThat((JsonNode) mapper.valueToTree(foreign)).isEqualTo(foreignBefore);
        assertNoMasteryWrites(fixture);
    }

    @Test
    void anotherRequestedRootCannotClaimTheCommittedPersonalCurriculumMarker() {
        var fixture = fixture(landscape(ROOT, List.of(atom(T))), "LK", entry(T));

        assertThatThrownBy(() -> fixture.service().getLearnerLandscapeClosure(LEARNER, "another-root", "de"))
                .isInstanceOfSatisfying(ResponseStatusException.class, failure -> {
                    assertThat(failure.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
                    assertThat(failure.getReason()).isEqualTo(
                            "Personal learning scope must use the learner's selected curriculum");
                });
        verify(fixture.landscapes(), never()).getClosure("another-root", "de");
    }

    private Fixture fixture(SkillLandscape primary, String course, Map<String, Object>... entries) {
        Set<String> navigationChildren = primary.getGoals().stream().map(LearningGoal::getId)
                .collect(java.util.stream.Collectors.toCollection(LinkedHashSet::new));
        primary.getGoals().forEach(goal -> {
            if (goal.getContains() != null) navigationChildren.removeAll(goal.getContains());
        });
        if (!navigationChildren.isEmpty()) {
            LearningGoal navigation = cluster("navigation-" + primary.getLandscapeId(),
                    navigationChildren.toArray(String[]::new));
            navigation.setTags(List.of("root"));
            List<LearningGoal> goals = new ArrayList<>(primary.getGoals());
            goals.addFirst(navigation);
            primary.setGoals(List.copyOf(goals));
        }
        List<SkillLandscape> catalog = new ArrayList<>(List.of(primary));
        LandscapeService landscapes = mock(LandscapeService.class);
        when(landscapes.getAll()).thenAnswer(invocation -> List.copyOf(catalog));
        when(landscapes.getById(anyString())).thenAnswer(invocation -> catalog.stream()
                .filter(l -> l.getLandscapeId().equals(invocation.getArgument(0))).findFirst().orElse(null));
        when(landscapes.getClosure(anyString())).thenAnswer(invocation -> catalog.stream()
                .filter(l -> l.getLandscapeId().equals(invocation.getArgument(0))).toList());
        when(landscapes.getClosure(anyString(), anyString())).thenAnswer(invocation -> catalog.stream()
                .filter(l -> l.getLandscapeId().equals(invocation.getArgument(0))).toList());
        when(landscapes.getGoalDefinition(anyString())).thenAnswer(invocation -> catalog.stream()
                .flatMap(l -> l.getGoals().stream()).filter(g -> g.getId().equals(invocation.getArgument(0)))
                .findFirst().orElse(null));
        when(landscapes.getLandscapeIdForGoal(anyString())).thenAnswer(invocation -> catalog.stream()
                .filter(l -> l.getGoals().stream().anyMatch(g -> g.getId().equals(invocation.getArgument(0))))
                .map(SkillLandscape::getLandscapeId).findFirst().orElse(null));
        when(landscapes.getOverview("de", true)).thenReturn(new LandscapeOverviewResponse(List.of(), Map.of()));
        CompositionViewService views = mock(CompositionViewService.class);
        Map<String, Object> view = Map.of("viewId", "learning-scope-test", "landscapeId", primary.getLandscapeId(),
                "rootNodes", List.of(entries));
        when(views.isAuthoritativeForLandscape(primary.getLandscapeId())).thenReturn(true);
        when(views.findLearnerScopeView(eq(primary.getLandscapeId()), anyMap())).thenReturn(view);
        when(views.findDefaultView(primary.getLandscapeId())).thenReturn(view);
        Learner learner = new Learner();
        learner.setSkillpilotId(LEARNER);
        learner.setSelectedCurriculum(primary.getLandscapeId());
        learner.setPersonalCurriculum("{\"" + primary.getLandscapeId()
                + "\":{\"selected\":true,\"filterId\":\"" + course + "\"}}");
        LearnerRepository learners = mock(LearnerRepository.class);
        when(learners.findById(LEARNER)).thenReturn(Optional.of(learner));
        when(learners.findBySkillpilotIdForUpdate(LEARNER)).thenReturn(Optional.of(learner));
        when(learners.existsById(LEARNER)).thenReturn(true);
        List<Mastery> mastery = new ArrayList<>();
        MasteryRepository masteryRepository = mock(MasteryRepository.class);
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER)).thenAnswer(invocation -> List.copyOf(mastery));
        List<PlannedGoal> planned = new ArrayList<>();
        PlannedGoalRepository plans = mock(PlannedGoalRepository.class);
        when(plans.findByLearner_SkillpilotId(LEARNER)).thenAnswer(invocation -> List.copyOf(planned));
        when(plans.saveAll(org.mockito.ArgumentMatchers.<Iterable<PlannedGoal>>any())).thenAnswer(invocation -> {
            Iterable<PlannedGoal> added = invocation.getArgument(0);
            added.forEach(planned::add);
            return planned;
        });
        GoalMappingService mappings = mock(GoalMappingService.class);
        when(mappings.getAllMappings()).thenReturn(List.of());
        LearnerService service = new LearnerService(learners, mock(LearnerClientStateRepository.class),
                masteryRepository, plans, landscapes, mappings, mock(DeckResourceService.class), views,
                mapper, mock(ApplicationEventPublisher.class), mock(PlatformTransactionManager.class));
        return new Fixture(service, learner, primary, catalog, landscapes, masteryRepository, mastery, planned);
    }

    private Set<String> targets(Fixture fixture) {
        return fixture.service().getFilteredAtomicGoalIds(fixture.primary().getLandscapeId(),
                fixture.learner().getPersonalCurriculum(), null, false);
    }

    private SkillLandscape.PersonalCurriculumProjection projection(Fixture fixture) {
        return fixture.service().getLearnerLandscapeClosure(LEARNER, fixture.primary().getLandscapeId(), "de")
                .stream().filter(l -> l.getLandscapeId().equals(fixture.primary().getLandscapeId()))
                .findFirst().orElseThrow().getPersonalCurriculumProjection();
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

    private static LearningGoal orientation(String id) {
        LearningGoal goal = atom(id);
        goal.setSemanticKind("orientation");
        return goal;
    }

    private static LearningGoal cluster(String id, String... children) {
        LearningGoal goal = atom(id);
        goal.setType("cluster");
        goal.setContains(List.of(children));
        return goal;
    }

    private static SkillLandscape landscape(String id, List<LearningGoal> goals) {
        SkillLandscape landscape = new SkillLandscape();
        landscape.setLandscapeId(id);
        landscape.setFrameworkId("canonical-gymnasium-learning-scope-test");
        landscape.setFilters(List.of(filter("GK"), filter("LK")));
        landscape.setGoals(goals);
        return landscape;
    }

    private static LandscapeFilter filter(String id) {
        LandscapeFilter filter = new LandscapeFilter();
        filter.setId(id);
        filter.setLabel(id);
        return filter;
    }

    private static Map<String, Object> entry(String id) { return Map.of("kind", "goalEntry", "goalId", id); }
    private static Map<String, Object> support(String id) {
        return Map.of("kind", "goalEntry", "goalId", id, "projectionRole", "prerequisiteOnly");
    }
    private static Map<String, Object> subtree(String id) { return Map.of("kind", "canonicalSubtree", "goalId", id); }

    private static void assertNoMasteryWrites(Fixture fixture) {
        verify(fixture.masteryRepository(), never()).save(any(Mastery.class));
        verify(fixture.masteryRepository(), never()).saveAll(any());
        verify(fixture.masteryRepository(), never()).saveAndFlush(any(Mastery.class));
    }

    private record Fixture(LearnerService service, Learner learner, SkillLandscape primary,
            List<SkillLandscape> catalog, LandscapeService landscapes, MasteryRepository masteryRepository,
            List<Mastery> mastery, List<PlannedGoal> planned) {
        void mastered(String... ids) {
            mastery.clear();
            for (String id : ids) mastery.add(new Mastery(learner, id, 1.0));
        }
    }
}
