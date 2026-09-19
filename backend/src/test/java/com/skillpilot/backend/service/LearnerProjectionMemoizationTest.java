package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.landscape.GoalMappingService;
import com.skillpilot.backend.landscape.LandscapeProperties;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.repository.LearnerClientStateRepository;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import com.skillpilot.backend.repository.PlannedGoalRepository;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

class LearnerProjectionMemoizationTest {
    private static final String ROOT = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
    private static final String MATH = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
    private static final String PHYSICS = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
    private static ObjectMapper mapper;
    private static LandscapeProperties properties;
    private static LandscapeService landscapes;
    private static GoalMappingService mappings;
    private LearnerService service;
    private AtomicInteger offeringCalls;
    private AtomicInteger graphLoads;

    @BeforeAll
    static void loadActualCurricula() {
        mapper = new ObjectMapper();
        properties = new LandscapeProperties();
        Path curricula = Path.of("../curricula").toAbsolutePath().normalize();
        if (!Files.isDirectory(curricula)) curricula = Path.of("curricula").toAbsolutePath().normalize();
        properties.setDirectory(curricula.toString());
        landscapes = new LandscapeService(properties, mapper);
        mappings = new GoalMappingService(properties, mapper);
    }

    @BeforeEach
    void setUp() {
        offeringCalls = new AtomicInteger();
        graphLoads = new AtomicInteger();
        CompositionViewService views = new CompositionViewService(properties, mapper, () -> {
            graphLoads.incrementAndGet();
            Map<String, List<String>> graph = new LinkedHashMap<>();
            landscapes.getAll().forEach(landscape -> landscape.getGoals().forEach(goal ->
                    graph.put(goal.getId(), goal.getContains() == null ? List.of() : List.copyOf(goal.getContains()))));
            return graph;
        }) {
            @Override
            public Map<String, Object> findLearnerScopeView(String landscapeId, Map<String, String> scope) {
                offeringCalls.incrementAndGet();
                return super.findLearnerScopeView(landscapeId, scope);
            }
        };
        service = new LearnerService(mock(LearnerRepository.class), mock(LearnerClientStateRepository.class),
                mock(MasteryRepository.class), mock(PlannedGoalRepository.class), landscapes, mappings,
                mock(DeckResourceService.class), mapper, mock(ApplicationEventPublisher.class));
        ReflectionTestUtils.setField(service, "compositionViewService", views);
    }

    @AfterEach
    void clearTransaction() {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.getSynchronizations().forEach(sync ->
                    sync.afterCompletion(TransactionSynchronization.STATUS_COMMITTED));
            TransactionSynchronizationManager.clearSynchronization();
        }
        TransactionSynchronizationManager.setActualTransactionActive(false);
    }

    @Test
    void repeatedRealCombinedCourseProjectionReusesWorkWithIdenticalImmutableOutput() throws Exception {
        String config = configuration("GK+LK");
        long uncachedStart = System.nanoTime();
        Object firstUncached = projection(ROOT, config, false);
        Object secondUncached = projection(ROOT, config, false);
        long uncachedNanos = System.nanoTime() - uncachedStart;
        int uncachedCalls = offeringCalls.get();
        int uncachedGraphLoads = graphLoads.get();
        assertThat(firstUncached).isNotSameAs(secondUncached);
        assertThat(visibleGoals(firstUncached)).isNotEmpty();
        assertThat(uncachedCalls).isPositive();
        assertThat(uncachedGraphLoads).isPositive();

        beginTransaction();
        offeringCalls.set(0);
        graphLoads.set(0);
        long cachedStart = System.nanoTime();
        Object cached = projection(ROOT, config, false);
        int firstProjectionCalls = offeringCalls.get();
        int firstProjectionGraphLoads = graphLoads.get();
        for (int repeat = 0; repeat < 4; repeat++) assertThat(projection(ROOT, config, false)).isSameAs(cached);
        long cachedNanos = System.nanoTime() - cachedStart;
        assertThat(offeringCalls.get()).isEqualTo(firstProjectionCalls).isLessThan(uncachedCalls);
        assertThat(graphLoads.get()).isEqualTo(firstProjectionGraphLoads);
        JsonNode cachedJson = mapper.valueToTree(visibleGoals(cached));
        assertThat(cachedJson).isEqualTo(mapper.valueToTree(visibleGoals(firstUncached)));
        assertThatThrownBy(() -> visibleGoals(cached).clear()).isInstanceOf(UnsupportedOperationException.class);
        Set<String> targets = ReflectionTestUtils.invokeMethod(cached, "targetGoalIds");
        assertThatThrownBy(() -> targets.clear()).isInstanceOf(UnsupportedOperationException.class);
        System.out.printf("PROJECTION_PERF actual HE SekII Math+Physics GK+LK: uncached2=%.1fms/%d offering calls/%d graph loads, cached5=%.1fms/%d offering calls/%d graph loads%n",
                uncachedNanos / 1_000_000.0, uncachedCalls, uncachedGraphLoads,
                cachedNanos / 1_000_000.0, offeringCalls.get(), graphLoads.get());
    }

    @Test
    void exactConfigurationAndFilterModeInvalidateWithinTheSameTransaction() throws Exception {
        beginTransaction();
        String combinedConfig = configuration("GK+LK");
        Object combined = projection(ROOT, combinedConfig, false);
        Object basicCourse = projection(ROOT, configuration("GK"), false);
        Object unfiltered = projection(ROOT, combinedConfig, true);
        Object anotherRoot = projection(MATH, combinedConfig, false);
        assertThat(basicCourse).isNotSameAs(combined);
        assertThat(unfiltered).isNotSameAs(combined);
        assertThat(anotherRoot).isNotSameAs(combined);
        assertThat(visibleGoals(combined).keySet()).containsAll(visibleGoals(basicCourse).keySet());
        assertThat(visibleGoals(combined).size()).isGreaterThan(visibleGoals(basicCourse).size());
        assertThat(projection(ROOT, combinedConfig, false)).isSameAs(combined);
    }

    @Test
    void completionAndSuspensionNeverShareProjectionResultsWithAnotherTransaction() throws Exception {
        String config = configuration("GK+LK");
        beginTransaction();
        Object outer = projection(ROOT, config, false);
        List<TransactionSynchronization> suspended = TransactionSynchronizationManager.getSynchronizations();
        TransactionSynchronizationManager.clearSynchronization();
        beginTransaction();
        Object nested = projection(ROOT, config, false);
        assertThat(nested).isNotSameAs(outer);
        clearTransaction();
        beginTransaction();
        suspended.forEach(TransactionSynchronizationManager::registerSynchronization);
        assertThat(projection(ROOT, config, false)).isSameAs(outer);
        clearTransaction();
        beginTransaction();
        assertThat(projection(ROOT, config, false)).isNotSameAs(outer).isNotSameAs(nested);
    }

    private static void beginTransaction() {
        TransactionSynchronizationManager.initSynchronization();
        TransactionSynchronizationManager.setActualTransactionActive(true);
    }

    private String configuration(String course) throws Exception {
        return mapper.writeValueAsString(Map.of(
                ROOT, Map.of("selected", true, "filterId", "DE-HE", "stage", "SekII", "durationModel", "G9"),
                MATH, Map.of("selected", true, "filterId", course),
                PHYSICS, Map.of("selected", true, "filterId", course)));
    }

    private Object projection(String curriculumId, String config, boolean ignoreCourseFilters) {
        return ReflectionTestUtils.invokeMethod(service, "getGoalProjection", curriculumId, config, ignoreCourseFilters);
    }

    private Map<String, LearningGoal> visibleGoals(Object projection) {
        return ReflectionTestUtils.invokeMethod(projection, "visibleGoals");
    }
}
