package com.skillpilot.backend.service;

import static com.skillpilot.backend.service.VoluntaryOfferTestConfiguration.ARROW;
import static com.skillpilot.backend.service.VoluntaryOfferTestConfiguration.PHYSICS;
import static com.skillpilot.backend.service.VoluntaryOfferTestConfiguration.ROOT;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.ChampionRegistrationRequest;
import com.skillpilot.backend.api.GoalStats;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.Mastery;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.repository.CurriculumChampionRepository;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@ActiveProfiles("test")
@Import(VoluntaryOfferTestConfiguration.class)
@Transactional
class VoluntaryOfferStatisticsTest {
    private static final String VIEW = "test-physics-voluntary-only";
    private static final String SECTION = "composition:" + VIEW + ":structure:offers";

    @Autowired LearnerService learners;
    @Autowired LearnerRepository rows;
    @Autowired MasteryRepository mastery;
    @Autowired LandscapeService landscapes;
    @Autowired CompositionViewService views;
    @Autowired CurriculumChampionRepository champions;
    @Autowired CurriculumQualitySnapshotProvider quality;
    @Autowired ChampionTrialService trials;
    @Autowired ObjectMapper mapper;
    private Learner learner;

    @BeforeEach
    void chooseTheOfferOnlyPhysicsScope() throws Exception {
        learner = new Learner();
        learner.setSkillpilotId("voluntary-statistics-" + UUID.randomUUID());
        learner.setSelectedCurriculum(ROOT);
        learner.setPersonalCurriculum(mapper.writeValueAsString(Map.of(
                ROOT, Map.of("selected", true, "filterId", "DE-NW", "stage", "SekII", "durationModel", "G9"),
                PHYSICS, Map.of("selected", true, "filterId", "GK"),
                "__skillpilot_stage_scope_sek2__", Map.of("selected", true),
                CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY, Map.of(
                        CurriculumPersonalizationPlanner.ROOT_LANDSCAPE_ID_KEY, ROOT,
                        CurriculumPersonalizationPlanner.COMPLETED_OPTION_IDS_KEY, List.of(),
                        CurriculumPersonalizationPlanner.MIGRATION_COMPLETED_KEY, true))));
        rows.saveAndFlush(learner);
    }

    @Test
    void offerOnlyRepositoryViewHasStudyPlacementButNoRequiredScope() {
        assertThat(views.hasVoluntaryOffers()).isTrue();
        assertThat(views.isAuthoritativeForLandscape(PHYSICS)).isFalse();
        assertThat(landscapes.getLandscapeIdForGoal(ARROW)).isEqualTo(PHYSICS);
        assertThat(views.findRootScopeOptions(VIEW)).isEmpty();
        assertThat(views.resolveStructureReference(SECTION)).isNull();
        assertThat(views.resolveStudyStructureReference(SECTION).referencedGoalIds()).containsExactly(ARROW);
        assertThat(learners.isCompositionViewApplied(ROOT, learner.getPersonalCurriculum())).isTrue();
        assertThat(learners.getFilteredAtomicGoalIds(ROOT, learner.getPersonalCurriculum(), null, false)).isEmpty();
    }

    @Test
    void offerOnlyLearnerStateReportsZeroPersonalizedGoalsBeforeAndAfterMastery() {
        var before = learners.getLearnerState(learner.getSkillpilotId()).goals();
        assertThat(before.personalized()).isEqualTo(new GoalStats(0, 0));
        assertThat(before.total_count()).isZero();
        mastery.saveAndFlush(new Mastery(learner, ARROW, 1.0));
        assertThat(learners.getMastery(learner.getSkillpilotId())).containsEntry(ARROW, 1.0);
        var after = learners.getLearnerState(learner.getSkillpilotId()).goals();
        assertThat(after.personalized()).isEqualTo(new GoalStats(0, 0));
        assertThat(after.mastered_count()).isZero();
    }

    @Test
    void curriculumWideChampionAndTrialRespectAnAppliedEmptyRepositoryScope() {
        mastery.saveAndFlush(new Mastery(learner, ARROW, 1.0));
        var github = mock(GitHubStatsService.class);
        when(github.getStats(anyString())).thenReturn(new GitHubStatsService.GitHubStats(0, 0));
        var curricula = new CurriculaService(landscapes, mastery, rows, champions, github, learners, views, mapper, quality);
        ReflectionTestUtils.setField(curricula, "championTrialService", trials);
        curricula.init();

        var request = new ChampionRegistrationRequest(ROOT, learner.getSkillpilotId(), "voluntary-champion", null);
        var champion = curricula.registerChampion(request).champion();
        assertThat(champion.totalTopicGoals()).isZero();
        assertThat(champion.masteredCount()).isZero();
        assertThat(champion.trial().requiredGoals()).isZero();

        learner.setPersonalCurriculum("{\"" + ROOT + "\":{\"selected\":false}}");
        rows.saveAndFlush(learner);
        assertThat(learners.getFilteredAtomicGoalIds(ROOT, learner.getPersonalCurriculum(), null, false)).isEmpty();
        assertThat(learners.isCompositionViewApplied(ROOT, learner.getPersonalCurriculum())).isFalse();
        assertThat(curricula.getChampionsByGithubId(champion.githubId())).singleElement().satisfies(unavailable -> {
            assertThat(unavailable.totalTopicGoals()).isPositive();
            assertThat(unavailable.masteredCount()).isPositive();
            assertThat(unavailable.trial().requiredGoals()).isPositive();
        });
    }
}
