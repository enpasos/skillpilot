package com.skillpilot.backend.controller;

import static org.assertj.core.api.Assertions.assertThat;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.PlannedGoalRepository;
import com.skillpilot.backend.service.LearnerService;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class LearnerControllerIntegrationTest {

    @Autowired
    private LearnerRepository learnerRepository;

    @Autowired
    private PlannedGoalRepository plannedGoalRepository;

    @Autowired
    private LearnerService learnerService;

    private String learnerId;

    @BeforeEach
    void setUp() {
        plannedGoalRepository.deleteAll();
        learnerRepository.deleteAll();

        Learner learner = new Learner();
        learner.setSkillpilotId("idempotent-learner");
        learnerRepository.save(learner);
        learnerId = learner.getSkillpilotId();
    }

    @Test
    void putPlannedGoals_isIdempotent() throws Exception {
        learnerService.setPlannedGoals(learnerId, Set.of("PHYS_Q1"));
        learnerService.setPlannedGoals(learnerId, Set.of("PHYS_Q1"));

        assertThat(plannedGoalRepository.findByLearner_SkillpilotId(learnerId))
                .hasSize(1)
                .first()
                .extracting(pg -> pg.getGoalId())
                .isEqualTo("PHYS_Q1");
    }

}
