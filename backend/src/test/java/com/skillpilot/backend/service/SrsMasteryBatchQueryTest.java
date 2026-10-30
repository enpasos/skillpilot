package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.clearInvocations;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.MasteryEntryDTO;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.LearnerClientState;
import com.skillpilot.backend.domain.LearnerClientStateId;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.repository.LearnerClientStateRepository;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.service.srs.SrsStateUnavailableException;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.hibernate.SessionFactory;
import org.hibernate.stat.Statistics;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.annotation.Transactional;

/** Counts real SQL statements; only didactic deck I/O is substituted. No learner-result cache is used. */
@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:srs-batch-query;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;NON_KEYWORDS=VALUE;LOCK_TIMEOUT=30000"
})
@ActiveProfiles("test")
@Transactional
class SrsMasteryBatchQueryTest {
    private static final String SOURCE = "/data/synthetic-batch-test.json";
    private static final String DECK = "{\"cards\":[{\"id\":\"card\",\"front\":\"Question\",\"back\":\"Answer\"}]}";
    private static final String PASSED = "{\"card\":{\"verifiedRecall\":{\"status\":\"passed\",\"passedAt\":\"2026-10-29T12:00:00Z\"}}}";
    @Autowired LearnerService service;
    @Autowired LearnerRepository learners;
    @Autowired LearnerClientStateRepository cardStates;
    @PersistenceContext EntityManager entities;
    @MockitoSpyBean DeckResourceService decks;
    @MockitoSpyBean LandscapeService landscapes;
    private Learner learner;
    private List<LearningGoal> goals;
    private ByteArrayResource resource;
    private Statistics statistics;
    private boolean previouslyEnabled;

    @BeforeEach void setup() {
        learner = new Learner();
        learner.setSkillpilotId("srs-batch-" + java.util.UUID.randomUUID());
        learner = learners.saveAndFlush(learner);
        resource = spy(new ByteArrayResource(DECK.getBytes(StandardCharsets.UTF_8), "synthetic deck"));
        doReturn(resource).when(decks).resolveDeckResource(anyString(), eq(SOURCE));
        goals = new ArrayList<>();
        for (int index = 0; index < 40; index++) {
            LearningGoal goal = new LearningGoal();
            goal.setId("synthetic-srs-" + index);
            goal.setTitle(goal.getId()); goal.setType("atomic"); goal.setNodeKind("memory");
            goal.setContains(List.of()); goal.setRequires(List.of()); goal.setTags(List.of());
            goal.setExtendedData(Map.of("vocabularySource", SOURCE));
            goals.add(goal);
            doReturn(goal).when(landscapes).getGoalDefinition(goal.getId());
            cardStates.save(new LearnerClientState(learner, goal.getId(), PASSED, Instant.now()));
        }
        cardStates.flush();
        statistics = entities.getEntityManagerFactory().unwrap(SessionFactory.class).getStatistics();
        previouslyEnabled = statistics.isStatisticsEnabled();
        statistics.setStatisticsEnabled(true);
        clearInvocations(resource, decks);
    }

    @AfterEach void restoreStatistics() { statistics.setStatisticsEnabled(previouslyEnabled); }

    private long sql(Runnable operation) {
        entities.flush(); entities.clear(); statistics.clear(); clearInvocations(resource);
        operation.run();
        assertThat(statistics.getEntityInsertCount()).isZero();
        assertThat(statistics.getEntityUpdateCount()).isZero();
        return statistics.getPrepareStatementCount();
    }

    private Map<String, LearningGoal> graph(List<LearningGoal> subset) {
        Map<String, LearningGoal> graph = new LinkedHashMap<>();
        subset.forEach(goal -> graph.put(goal.getId(), goal));
        return graph;
    }

    @Test void strictSnapshotUsesOneSqlAndOneDeckParseForOneOrFortyGoals() throws Exception {
        for (List<LearningGoal> subset : List.of(goals.subList(0, 1), goals)) {
            assertThat(sql(() -> assertThat(service.resolveSrsMasterySnapshot(learner.getSkillpilotId(), subset))
                    .hasSize(subset.size()).allSatisfy((id, mastered) -> assertThat(mastered).isTrue()))).isEqualTo(1);
            verify(resource, times(1)).getInputStream();
        }
    }

    @Test void bothNormalOverlaysUseOneSqlForOneOrFortyGoals() {
        for (List<LearningGoal> subset : List.of(goals.subList(0, 1), goals)) {
            Map<String, LearningGoal> graph = graph(subset);
            assertThat(sql(() -> {
                Map<String, Double> result = ReflectionTestUtils.invokeMethod(service, "applySrsMasteryOverlay",
                        learner.getSkillpilotId(), graph, Map.<String, Double>of());
                assertThat(result).hasSize(subset.size()).allSatisfy((id, mastery) -> assertThat(mastery).isEqualTo(1));
            })).isEqualTo(1);
            assertThat(sql(() -> {
                Map<String, MasteryEntryDTO> result = ReflectionTestUtils.invokeMethod(service, "applySrsMasteryOverlayWithTimestamps",
                        learner.getSkillpilotId(), graph, Map.<String, MasteryEntryDTO>of());
                assertThat(result).hasSize(subset.size()).allSatisfy((id, mastery) -> assertThat(mastery.value()).isEqualTo(1));
            })).isEqualTo(1);
        }
    }

    @Test void frontierAvailabilityAndChampionCountsStayBatched() {
        for (List<LearningGoal> subset : List.of(goals.subList(0, 1), goals)) {
            List<FrontierGoal> frontier = subset.stream().map(goal -> new FrontierGoal(goal.getId(), goal.getTitle(), "",
                    "atomic", "memory", "memory", "Available", List.of(), List.of(), null, null, null, null)).toList();
            assertThat(sql(() -> {
                List<FrontierGoal> result = ReflectionTestUtils.invokeMethod(service, "filterVerifiedRecallAvailableMemoryGoals",
                        learner.getSkillpilotId(), frontier);
                assertThat(result).isEmpty(); // Every card is already verified.
            })).isEqualTo(1);
            assertThat(sql(() -> assertThat(service.countSrsMastery(learner.getSkillpilotId(), graph(subset).keySet()))
                    .isEqualTo(subset.size()))).isEqualTo(1);
        }
    }

    @Test void ordinaryCompetenceGoalsNeedNoSrsSqlOrDeckReads() {
        LearningGoal ordinary = new LearningGoal(); ordinary.setId("synthetic-tutor"); ordinary.setNodeKind("tutor");
        doReturn(ordinary).when(landscapes).getGoalDefinition(ordinary.getId());
        assertThat(sql(() -> {
            assertThat(service.resolveSrsMasterySnapshot(learner.getSkillpilotId(), List.of(ordinary))).isEmpty();
            Map<String, Double> result = ReflectionTestUtils.invokeMethod(service, "applySrsMasteryOverlay",
                    learner.getSkillpilotId(), Map.of(ordinary.getId(), ordinary), Map.of(ordinary.getId(), 1.0));
            assertThat(result).containsEntry(ordinary.getId(), 1.0);
            assertThat(service.countSrsMastery(learner.getSkillpilotId(), Set.of(ordinary.getId()))).isZero();
        })).isZero();
        verify(decks, never()).resolveDeckResource(anyString(), anyString());
    }

    @Test void corruptSingleStateIsUnavailableStrictlyAndPreservedOnlyForThatNormalGoal() {
        var damaged = cardStates.findById(new LearnerClientStateId(learner.getSkillpilotId(), goals.getFirst().getId())).orElseThrow();
        damaged.setClientState("invalid-json"); cardStates.saveAndFlush(damaged);
        Map<String, LearningGoal> graph = graph(goals.subList(0, 2));
        assertThat(sql(() -> {
            Map<String, Double> result = ReflectionTestUtils.invokeMethod(service, "applySrsMasteryOverlay",
                    learner.getSkillpilotId(), graph, Map.of(goals.getFirst().getId(), 1.0));
            assertThat(result).containsEntry(goals.getFirst().getId(), 1.0).containsEntry(goals.get(1).getId(), 1.0);
        })).isEqualTo(1);
        assertThatThrownBy(() -> service.resolveSrsMasterySnapshot(learner.getSkillpilotId(), goals.subList(0, 2)))
                .isInstanceOf(SrsStateUnavailableException.class);
    }

    @Test void sameDescriptionCannotConflateDifferentDeckPayloads() throws Exception {
        var distinct = spy(new ByteArrayResource(
                "{\"cards\":[{\"id\":\"other-card\",\"front\":\"Different question\",\"back\":\"Different answer\"}]}".getBytes(StandardCharsets.UTF_8),
                resource.getDescription()));
        doReturn(distinct).when(decks).resolveDeckResource(goals.get(1).getId(), SOURCE);
        assertThat(sql(() -> assertThat(service.resolveSrsMasterySnapshot(learner.getSkillpilotId(), goals.subList(0, 2)))
                .containsEntry(goals.getFirst().getId(), true).containsEntry(goals.get(1).getId(), false))).isEqualTo(1);
        verify(resource, times(1)).getInputStream();
        verify(distinct, times(1)).getInputStream();
    }
}
