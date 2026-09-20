package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.ChampionTrialRequest;
import com.skillpilot.backend.domain.CurriculumChampion;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.LandscapeSummary;
import com.skillpilot.backend.landscape.SkillLandscape;
import com.skillpilot.backend.repository.CurriculumChampionRepository;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import jakarta.persistence.EntityManager;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class CurriculaChampionTrialIntegrationTest {
    @Autowired LearnerRepository learners;
    @Autowired MasteryRepository mastery;
    @Autowired CurriculumChampionRepository champions;
    @Autowired LearnerGoalCompletionService completions;
    @Autowired EntityManager entityManager;
    private CurriculaService curricula;
    private Learner learner;
    private CurriculumChampion champion;
    private LearnerService learnerService;
    private ChampionPracticeFingerprint fingerprints;
    private LearningGoal a;
    private LearningGoal b;

    @BeforeEach
    void setup() {
        learner = new Learner(); learner.setSkillpilotId("trial-" + UUID.randomUUID());
        learner.setSelectedCurriculum("test-curriculum"); learner.setPersonalCurriculum("{}");
        learners.saveAndFlush(learner);
        champion = new CurriculumChampion(); champion.setCurriculumId("test-curriculum");
        champion.setSkillpilotId(learner.getSkillpilotId()); champion.setGithubId("test-owner");
        champions.saveAndFlush(champion);
        a = goal("a"); b = goal("b");
        SkillLandscape landscape = new SkillLandscape(); landscape.setLandscapeId("test-curriculum");
        landscape.setTitle("Test Math"); landscape.setSubject("Mathematik"); landscape.setGoals(List.of(a, b));
        LandscapeService landscapes = mock(LandscapeService.class);
        when(landscapes.getById("test-curriculum")).thenReturn(landscape);
        when(landscapes.getGoalDefinition("a")).thenReturn(a);
        when(landscapes.getGoalDefinition("b")).thenReturn(b);
        when(landscapes.getBaseCurricula()).thenReturn(List.of(new LandscapeSummary(
                "test-curriculum", "Test Math", "", "DE", null, "curriculum", "Mathematik", "de", List.of())));
        learnerService = mock(LearnerService.class);
        when(learnerService.getFilteredAtomicGoalIds(eq("test-curriculum"), anyString(), isNull(), eq(false)))
                .thenReturn(Set.of("a", "b"));
        var quality = new CurriculumQualitySnapshotProvider.CurriculumQualityEntry(
                "test-curriculum", "Mathematik", "M5", 2, 2, 0, 0, 0, 0, true);
        CurriculumQualitySnapshotProvider qualityProvider = () -> new CurriculumQualitySnapshotProvider.CurriculumQualitySnapshot(
                Map.of("test-curriculum", quality), Map.of("mathematik", quality));
        GitHubStatsService github = mock(GitHubStatsService.class);
        when(github.getStats(anyString())).thenReturn(new GitHubStatsService.GitHubStats(0, 0));
        ObjectMapper mapper = new ObjectMapper().findAndRegisterModules();
        fingerprints = new ChampionPracticeFingerprint(mapper, mock(DeckResourceService.class));
        curricula = new CurriculaService(landscapes, mastery, learners, champions, github, learnerService,
                mock(CompositionViewService.class), mapper, qualityProvider);
        ReflectionTestUtils.setField(curricula, "championTrialService", new ChampionTrialService(completions, fingerprints, mapper));
    }

    @Test
    void actualOwnerActionsPersistStartCompletionAndEvidenceAfterResignation() {
        var started = curricula.updateChampionTrial("test-owner", champion.getId(), new ChampionTrialRequest("start", null));
        assertThat(started.trial().state()).isEqualTo("in_progress");
        assertThat(started.trial().scopeCoverage()).isEqualTo("full");
        evidence(a); evidence(b);
        var finished = curricula.updateChampionTrial("test-owner", champion.getId(), new ChampionTrialRequest("complete", true));
        assertThat(finished.trial().state()).isEqualTo("completed");
        curricula.deregisterChampions("test-owner", List.of("test-curriculum"));
        entityManager.flush(); entityManager.clear();
        CurriculumChampion stored = champions.findById(champion.getId()).orElseThrow();
        assertThat(stored.getAssignmentEndedAt()).isNotNull();
        assertThat(stored.getTrialStartedAt()).isNotNull();
        assertThat(stored.getTrialConfirmationsJson()).isNotBlank();
        assertThat(curricula.getChampionsByGithubId("test-owner")).isEmpty();
        var publicView = curricula.getSnapshot().curricula().getFirst();
        assertThat(publicView.qualityStatus()).isEqualTo("human_trial_completed");
        assertThat(publicView.champions().getFirst().trial().state()).isEqualTo("completed");
    }

    @Test
    void privateScopeStaysFrozenWhenLearnerConfigurationChangesAndPartialTrialNeverCertifiesWholeSubject() {
        learner.setPersonalCurriculum("{\"scope\":{\"filterId\":\"partial\"}}");
        learners.saveAndFlush(learner);
        when(learnerService.getFilteredAtomicGoalIds(eq("test-curriculum"), contains("partial"), isNull(), eq(false)))
                .thenReturn(Set.of("a"));
        var started = curricula.updateChampionTrial("test-owner", champion.getId(), new ChampionTrialRequest("start", null));
        assertThat(started.trial().requiredGoals()).isEqualTo(1);
        assertThat(started.trial().scopeCoverage()).isEqualTo("partial");
        learner.setPersonalCurriculum("{}"); learners.saveAndFlush(learner);
        evidence(a);
        var completed = curricula.updateChampionTrial("test-owner", champion.getId(), new ChampionTrialRequest("complete", true));
        assertThat(completed.trial().requiredGoals()).isEqualTo(1);
        assertThat(completed.trial().state()).isEqualTo("completed");
        assertThat(curricula.getSnapshot().curricula().getFirst().qualityStatus()).isEqualTo("machine_qa");
    }

    @Test
    void foreignOwnerCannotMutateAndCompleteWithoutCoverageIsConflict() {
        assertThatThrownBy(() -> curricula.updateChampionTrial("intruder", champion.getId(), new ChampionTrialRequest("start", null)))
                .isInstanceOfSatisfying(ResponseStatusException.class, error -> assertThat(error.getStatusCode().value()).isEqualTo(403));
        assertThat(champions.findById(champion.getId()).orElseThrow().getTrialStartedAt()).isNull();
        curricula.updateChampionTrial("test-owner", champion.getId(), new ChampionTrialRequest("start", null));
        assertThatThrownBy(() -> curricula.updateChampionTrial("test-owner", champion.getId(), new ChampionTrialRequest("complete", true)))
                .isInstanceOfSatisfying(ResponseStatusException.class, error -> assertThat(error.getStatusCode().value()).isEqualTo(409));
    }

    private void evidence(LearningGoal goal) {
        completions.recordTransition(learner, goal.getId(), 0, 1, Instant.now(), "coach_learning", fingerprints.forGoal(goal));
    }
    private static LearningGoal goal(String id) {
        LearningGoal result = new LearningGoal(); result.setId(id); result.setTitle("Goal " + id);
        result.setDescription("Competence " + id); return result;
    }
}
