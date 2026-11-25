package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.Mastery;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class MomentumDerivationFrontierTest {
    private static final String ROOT = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
    private static final String MATHEMATICS = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
    private static final String PHYSICS = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
    private static final String SLOPE = "b1dcc191-d046-50de-984a-ee5c17157628";
    private static final String MOMENTARY_FORCE = "059c1adc-e4d2-5222-a923-15abc417d59f";
    private static final String DERIVATION = "f524f05c-4456-4fc3-a1f7-f40741fc1f16";

    @Autowired private LearnerService learners;
    @Autowired private LearnerRepository repository;
    @Autowired private MasteryRepository mastery;
    @Autowired private LandscapeService landscapes;
    @Autowired private ObjectMapper mapper;

    @ParameterizedTest
    @ValueSource(strings = {"DE-SN", "DE-ST"})
    void tangentSlopeThenMomentaryForceUnlockTheLkDerivation(String jurisdiction) throws Exception {
        Learner learner = new Learner();
        learner.setSkillpilotId("momentum-frontier-" + jurisdiction);
        learner.setSelectedCurriculum(ROOT);
        learner.setLearningStrategy("RANDOM");
        learner.setAutoPilot(false);
        learner.setStrictMode(false);
        learner.setPersonalCurriculum(mapper.writeValueAsString(Map.of(
                ROOT, Map.of("selected", true, "filterId", jurisdiction, "stage", "SekII"),
                PHYSICS, Map.of("selected", true, "filterId", "LK"),
                MATHEMATICS, Map.of("selected", true, "filterId", "LK"),
                CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY, Map.of(
                        CurriculumPersonalizationPlanner.ROOT_LANDSCAPE_ID_KEY, ROOT,
                        CurriculumPersonalizationPlanner.COMPLETED_OPTION_IDS_KEY, List.of(),
                        CurriculumPersonalizationPlanner.MIGRATION_COMPLETED_KEY, true))));
        repository.saveAndFlush(learner);

        var focus = List.of(SLOPE, MOMENTARY_FORCE, DERIVATION);
        var prior = CanonicalPrerequisiteTestContext.withStoredPrerequisites(
                landscapes, focus, List.of(), Set.of());
        mastery.saveAllAndFlush(prior.stream().map(id -> new Mastery(learner, id, 1.0)).toList());

        assertThat(frontier(learner, focus)).contains(SLOPE).doesNotContain(MOMENTARY_FORCE, DERIVATION);
        mastery.saveAndFlush(new Mastery(learner, SLOPE, 1.0));
        assertThat(frontier(learner, focus)).contains(MOMENTARY_FORCE).doesNotContain(DERIVATION);
        mastery.saveAndFlush(new Mastery(learner, MOMENTARY_FORCE, 1.0));
        assertThat(frontier(learner, focus)).contains(DERIVATION);
    }

    private List<String> frontier(Learner learner, List<String> focus) {
        return learners.getUncompactedRichFrontierForFocus(learner.getSkillpilotId(), focus)
                .stream().map(FrontierGoal::id).toList();
    }
}
