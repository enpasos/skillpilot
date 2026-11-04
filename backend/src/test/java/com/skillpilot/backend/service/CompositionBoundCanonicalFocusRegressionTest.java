package com.skillpilot.backend.service;

import com.skillpilot.backend.testsupport.OwnedMockitoMocks;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.parallel.Execution;
import org.junit.jupiter.api.parallel.ExecutionMode;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.PlannedGoal;
import com.skillpilot.backend.landscape.GoalMappingService;
import com.skillpilot.backend.landscape.LandscapeProperties;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.repository.LearnerClientStateRepository;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import com.skillpilot.backend.repository.PlannedGoalRepository;
import java.nio.file.Path;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Stream;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.test.util.ReflectionTestUtils;

/** Real production CVS, actual reviewed HE/ST views and whole canonical objects; no frontier/result stubs. */
@Execution(ExecutionMode.SAME_THREAD)
@ExtendWith(OwnedMockitoMocks.class)
class CompositionBoundCanonicalFocusRegressionTest {

    @AfterAll
    static void releaseClassFixtures() {
        if (views != null) org.mockito.Mockito.framework().clearInlineMock(views);
        committedConfigs.clear();
        landscapes = null;
        mappings = null;
        views = null;
        canonical = null;
    }

    @AfterEach
    void releaseSharedSpyInvocations() {
        // Keep the shared spy and its stubs usable for the next case.
        if (views != null) org.mockito.Mockito.clearInvocations(views);
    }

    private static final String ROOT="a0e13c56-c25f-4742-9272-3a1a603ee52e";
    private static final String MATH="68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
    private static final String CUBOID="c34c6132-f85d-59be-8b95-032ddfc0d0de";
    private static final String J6_EXAMS="7a2a5706-aff4-4fd0-b092-1779d6ecbc1f";
    private static final String J6_YEAR="8f7bb79b-f014-4bb6-8dce-7e3f1c92e893";
    private static final String ID="isolated-composition-focus-regression";
    private static final ObjectMapper MAPPER=new ObjectMapper();
    private static LandscapeService landscapes;
    private static GoalMappingService mappings;
    private static CompositionViewService views;
    private static Map<String,LearningGoal> canonical;
    private static final Map<String, String> committedConfigs = new LinkedHashMap<>();

    @BeforeAll static void loadActualReviewedCatalog() throws Exception {
        Path root=Path.of(System.getProperty("skillpilot.focus.regression.root","..")).toAbsolutePath().normalize();
        var properties=new LandscapeProperties();properties.setDirectory(root.resolve("curricula").toString());
        landscapes=new LandscapeService(properties,MAPPER);mappings=new GoalMappingService(properties,MAPPER);
        views=org.mockito.Mockito.spy(new CompositionViewService(properties,MAPPER,landscapes));
        canonical=new LinkedHashMap<>();
        landscapes.getAll().forEach(l->l.getGoals().forEach(g->canonical.put(g.getId(),g)));
    }

    static Stream<Arguments> actualProgramCases() {
        List<Arguments> result=new ArrayList<>();
        for(String country:List.of("DE-HE","DE-ST")) for(String stage:List.of("SekI","CrossStage"))
            for(String course:stage.equals("SekI")?List.of("GK+LK"):List.of("GK","LK","GK+LK"))
                for(String focus:List.of(J6_EXAMS,J6_YEAR)) result.add(Arguments.of(country,stage,"G8",course,focus));
        // Eight HE-G9 ID/PC controls: C34 remains excluded, removed program aliases still request a choice.
        for(String stage:List.of("SekI","CrossStage"))
            for(String course:stage.equals("SekI")?List.of("GK+LK"):List.of("GK","LK","GK+LK"))
                for(String focus:List.of(J6_EXAMS,J6_YEAR)) result.add(Arguments.of("DE-HE",stage,"G9",course,focus));
        return result.stream();
    }

    @ParameterizedTest @MethodSource("actualProgramCases")
    void removedRealCanonicalProgramFocusDoesNotReenterThroughRawAncestorsOrWidenPublicReads(
            String country,String stage,String duration,String course,String focus) throws Exception {
        var f=fixture(country,stage,duration,course,List.of(focus));
        Object projection=projection(f);
        Set<String> selected=invoke(projection,"targetGoalIds");
        assertThat(selected.contains(CUBOID)).isEqualTo(duration.equals("G8"));
        assertThat(focusTargets(f,projection,focus)).isEmpty();
        assertThat(atomicFocus(f,projection,focus)).isEmpty();
        String before=MAPPER.writeValueAsString(f.learner());
        for(int read=0;read<2;read++) {
            assertThat(f.service().getPlannedGoals(ID)).isEmpty();
            var state=f.service().getLearnerState(ID);var coach=f.service().getCoachLearnerState(ID);
            assertThat(state.goals().planned()).isEmpty();
            assertThat(state.activeGoal()).isNull();
            assertThat(state.stateMachine().requiredAction()).isEqualTo("setScope");
            assertThat(coach.stateMachine().requiredAction()).isEqualTo("setScope");
            assertThat(state.nextAllowedActions()).contains("setScope").doesNotContain("setActiveGoal");
            assertThat(state.frontier()).allSatisfy(g->assertThat(g.type()).isNotEqualTo("atomic"));
            assertThat(f.focus()).containsExactly(focus);
            assertThat(MAPPER.writeValueAsString(f.learner())).isEqualTo(before);
        }
        f.assertNoReadMutations();
    }

    @ParameterizedTest @MethodSource("actualProgramCases")
    void replacementProgramHullPreservesTheWholePriorMembershipAndCuboidKeepsItsLaterOwnBranch(
            String country,String stage,String duration,String course,String focus) throws Exception {
        var f=fixture(country,stage,duration,course,List.of(focus));Object projection=projection(f);
        Map<String,LearningGoal> structural=invoke(projection,"structuralGoals");
        Set<String> selected=invoke(projection,"targetGoalIds");Set<String> activeViews=invoke(projection,"compositionViewIds");
        Set<String> expectedPriorAtoms=rawProgramAtoms(focus,selected);expectedPriorAtoms.remove(CUBOID);
        Set<String> actualReplacement=new LinkedHashSet<>();
        for(String viewId:activeViews) {
            String ref="composition:"+viewId+":structure:reviewed-stage-split-"+focus;
            if(views.resolveStructureReference(ref)!=null) actualReplacement.addAll(atomicFocus(f,projection,ref));
        }
        // HE already offered the year through its authored year folder; only its exam canonical reference was replaced.
        if(!focus.equals(J6_YEAR)||country.equals("DE-ST")) {
            assertThat(expectedPriorAtoms).isNotEmpty();
            assertThat(actualReplacement).containsExactlyInAnyOrderElementsOf(expectedPriorAtoms);
            assertThat(actualReplacement).doesNotContain(CUBOID);
        }
        if(duration.equals("G8")) for(String viewId:activeViews) {
            var ancestors=views.findLearnerFacingFocusAncestors(viewId,CUBOID,structural);
            assertThat(ancestors).anySatisfy(a->assertThat(a.nodeId()).isEqualTo(country.equals("DE-HE")?"j9-g8":"j8"));
            var localTaskHull=ancestors.stream().filter(a->a.nodeId().startsWith("reviewed-stage-positive-cuboid-c34-exact48-")).findFirst().orElseThrow();
            assertThat(atomicFocus(f,projection,localTaskHull.syntheticGoalId())).containsExactly(CUBOID);
        }
        f.assertNoReadMutations();
    }

    @ParameterizedTest @MethodSource("actualProgramCases")
    void subjectRootAndDirectSelectedAtomRemainUsableAndRepeatedFocusReadsReuseTheSameProjectionIndex(
            String country,String stage,String duration,String course,String ignoredFocus) throws Exception {
        var f=fixture(country,stage,duration,course,List.of());Object projection=projection(f);
        List<String> roots=invoke(projection,"presentationRootGoalIds");Set<String> targets=invoke(projection,"targetGoalIds");
        Map<String,LearningGoal> visible=invoke(projection,"visibleGoals");
        Set<String> expectedAtoms=new LinkedHashSet<>();
        targets.stream().filter(id->visible.get(id)!=null&&(visible.get(id).getContains()==null||visible.get(id).getContains().isEmpty())
                &&!"cluster".equals(visible.get(id).getType())).forEach(expectedAtoms::add);
        Set<String> rootAtoms=new LinkedHashSet<>();for(String root:roots)rootAtoms.addAll(atomicFocus(f,projection,root));
        assertThat(rootAtoms).containsExactlyInAnyOrderElementsOf(expectedAtoms);
        if(duration.equals("G8")) assertThat(atomicFocus(f,projection,CUBOID)).containsExactly(CUBOID);
        Object index=invoke(projection,"learnerFacingFocusTargetIds");
        @SuppressWarnings("unchecked")
        Map<String, List<String>> typedIndex = (Map<String, List<String>>) index;
        String synthetic = typedIndex.keySet().stream().filter(id -> id.startsWith("composition:")).findFirst().orElseThrow();
        Set<String> syntheticMembers = atomicFocus(f, projection, synthetic);
        long pathCalls=pathResolutionCalls();
        for(int repeat=0;repeat<100;repeat++) {
            for(String root:roots) assertThat(atomicFocus(f,projection,root)).containsExactlyInAnyOrderElementsOf(expectedAtoms);
            assertThat(atomicFocus(f, projection, synthetic)).containsExactlyInAnyOrderElementsOf(syntheticMembers);
            Object reusedIndex=invoke(projection,"learnerFacingFocusTargetIds");
            assertThat(reusedIndex).isSameAs(index);
        }
        assertThat(pathResolutionCalls()).isEqualTo(pathCalls);
        org.assertj.core.api.Assertions.assertThatThrownBy(()->((Map<?,?>)index).clear())
                .isInstanceOf(UnsupportedOperationException.class);
        // No public read here: an empty persisted focus is the existing first-start write path, separately tested.
        f.assertNoReadMutations();
    }

    private static long pathResolutionCalls() {
        return org.mockito.Mockito.mockingDetails(views).getInvocations().stream()
                .filter(call->call.getMethod().getName().equals("resolveCanonicalFocusReference")
                        || call.getMethod().getName().equals("resolveStructureReference")).count();
    }
    private static Set<String> rawProgramAtoms(String id,Set<String> selected) {
        Set<String> result=new LinkedHashSet<>();var queue=new ArrayDeque<String>();queue.add(id);
        while(!queue.isEmpty()) {
            String next=queue.removeFirst();if(!result.add(next))continue;
            LearningGoal goal=canonical.get(next);if(goal!=null&&goal.getContains()!=null)queue.addAll(goal.getContains());
        }
        result.retainAll(selected);
        result.removeIf(g->canonical.get(g)==null||"cluster".equals(canonical.get(g).getType())
                ||canonical.get(g).getContains()!=null&&!canonical.get(g).getContains().isEmpty());
        return result;
    }
    private static Object projection(Fixture f) {
        return ReflectionTestUtils.invokeMethod(f.service(),"getGoalProjection",ROOT,f.learner().getPersonalCurriculum(),false);
    }
    private static List<String> focusTargets(Fixture f,Object projection,String focus) {
        return ReflectionTestUtils.invokeMethod(f.service(),"resolveProjectedFocusTargetIds",focus,projection);
    }
    private static Set<String> atomicFocus(Fixture f,Object projection,String focus) {
        return ReflectionTestUtils.invokeMethod(f.service(),"projectedAtomicTargetIds",List.of(focus),projection);
    }
    private static <T>T invoke(Object target,String method) {return ReflectionTestUtils.invokeMethod(target,method);}
    private static Fixture fixture(String country,String stage,String duration,String course,List<String> initial) throws Exception {
        var learner=new Learner();learner.setSkillpilotId(ID);learner.setSelectedCurriculum(ROOT);
        learner.setAutoPilot(false);learner.setFollowLearningPlans(false);
        learner.setPersonalCurriculum(completeAuthoredConfig(country, stage, duration, course));
        var lr=mock(LearnerRepository.class);var cr=mock(LearnerClientStateRepository.class);
        var mr=mock(MasteryRepository.class);var pr=mock(PlannedGoalRepository.class);var events=mock(ApplicationEventPublisher.class);
        when(lr.findById(ID)).thenReturn(Optional.of(learner));when(lr.existsById(ID)).thenReturn(true);
        when(lr.findBySkillpilotIdForUpdate(ID)).thenReturn(Optional.of(learner));
        List<String> focus=new ArrayList<>(initial);
        when(pr.findByLearner_SkillpilotId(ID)).thenAnswer(call->focus.stream().map(g->new PlannedGoal(learner,g)).toList());
        var service=new LearnerService(lr,cr,mr,pr,landscapes,mappings,mock(DeckResourceService.class),MAPPER,events);
        ReflectionTestUtils.setField(service,"compositionViewService",views);
        var plan = service.getCoachPersonalizationPlan(ID);
        assertThat(plan.valid()).as("actual committed Level2 plan: %s", plan).isTrue();
        assertThat(plan.required()).as("all authored choices completed: %s", plan).isFalse();
        return new Fixture(service,learner,focus,List.of(lr,cr,mr,pr),events);
    }
    /** Uses the same actual option application as the validator's unsaved planner fixture. */
    private static synchronized String completeAuthoredConfig(
            String country, String stage, String duration, String course) throws Exception {
        String key = String.join("/", country, stage, duration, course);
        if (committedConfigs.containsKey(key)) {
            return committedConfigs.get(key);
        }
        var setupLearners = mock(LearnerRepository.class);
        var setupClients = mock(LearnerClientStateRepository.class);
        var setupMastery = mock(MasteryRepository.class);
        var setupPlans = mock(PlannedGoalRepository.class);
        var setupEvents = mock(ApplicationEventPublisher.class);
        var setupService = new LearnerService(setupLearners, setupClients, setupMastery, setupPlans,
                landscapes, mappings, mock(DeckResourceService.class), MAPPER, setupEvents);
        ReflectionTestUtils.setField(setupService, "compositionViewService", views);
        Learner draft = new Learner();
        draft.setSelectedCurriculum(ROOT);
        draft.setAutoPilot(false);
        draft.setFollowLearningPlans(false);
        Map<String, Object> config = new LinkedHashMap<>();
        config.put(ROOT, new LinkedHashMap<>(Map.of("selected", true)));
        Set<String> seen = new LinkedHashSet<>();
        for (int step = 0; step < 20; step++) {
            String serialized = MAPPER.writeValueAsString(config);
            assertThat(seen.add(serialized)).as("authored planner made progress for %s", key).isTrue();
            Map<String, Map<String, Object>> typed = MAPPER.readValue(serialized,
                    new com.fasterxml.jackson.core.type.TypeReference<>() {});
            var plan = CurriculumPersonalizationPlanner.plan(ROOT, landscapes::getById,
                    (landscape, scope) -> ReflectionTestUtils.invokeMethod(
                            setupService, "resolvePersonalizationOfferingScope", landscape, scope), typed);
            assertThat(plan.valid()).as("actual authored flow for %s: %s", key, plan).isTrue();
            if (!plan.required()) {
                assertThat(typed.get(ROOT)).containsEntry("filterId", country)
                        .containsEntry("stage", stage).containsEntry("durationModel", duration);
                assertThat(typed.get(MATH)).containsEntry("selected", true);
                if (!stage.equals("SekI")) {
                    assertThat(typed.get(MATH)).containsEntry("filterId", course);
                }
                committedConfigs.put(key, serialized);
                return serialized;
            }
            var selected = plan.options().stream().filter(option ->
                    option.kind() == com.skillpilot.backend.api.PersonalizationPlan.OptionKind.COMPLETE_GROUP)
                    .findFirst().orElseGet(() -> plan.options().stream().filter(option ->
                            (option.groupId().equals("jurisdiction") && country.equals(option.filterId()))
                            || ("durationModel".equals(option.scopeKey()) && duration.equals(option.scopeValue()))
                            || ("stage".equals(option.scopeKey()) && stage.equals(option.scopeValue()))
                            || (option.groupId().equals("subject") && MATH.equals(option.landscapeId()))
                            || (option.groupId().equals("subjectProfile") && MATH.equals(option.landscapeId())
                                    && course.equals(option.filterId())))
                            .findFirst().orElseThrow(() -> new AssertionError("No actual authored option for " + key + ": " + plan)));
            ReflectionTestUtils.invokeMethod(setupService, "applyCurrentPersonalizationOption", draft, config, selected);
        }
        throw new AssertionError("Authored flow did not finish for " + key);
    }

    private record Fixture(LearnerService service,Learner learner,List<String> focus,List<Object> repositories,ApplicationEventPublisher events) {
        void assertNoReadMutations() {
            for(Object repo:repositories) for(var call:org.mockito.Mockito.mockingDetails(repo).getInvocations()) {
                String name=call.getMethod().getName();
                assertThat(name.startsWith("save")||name.startsWith("delete")||name.startsWith("flush")
                        ||call.getMethod().isAnnotationPresent(org.springframework.data.jpa.repository.Modifying.class)).isFalse();
            }
            org.mockito.Mockito.verifyNoInteractions(events);
        }
    }
}
